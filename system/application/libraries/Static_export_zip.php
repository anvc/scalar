<?php
/**
 * Scalar
 * Copyright 2013 The Alliance for Networking Visual Culture.
 * http://scalar.usc.edu/scalar
 * Alliance4NVC@gmail.com
 *
 * Licensed under the Educational Community License, Version 2.0
 * (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

/**
 * @projectDescription  An append-only ZIP writer for the static site exporter, which builds one
 *                      archive across many short requests (see Static_export_model::job_step()).
 *
 * Why not ZipArchive: libzip never appends in place. Reopening an archive and adding a file
 * writes a fresh copy of the whole thing and renames it over the old one, so an archive built a
 * batch at a time costs a full copy per batch, and a book with gigabytes of media would spend
 * most of each request re-copying what earlier requests wrote. (On a filesystem that can clone
 * files, such as APFS, that copy is free, which hides the problem on a Mac.) This writer only
 * ever adds to the end of the file.
 *
 * Usage: construct with the archive's path and the array state() returned at the end of the
 * previous request (null for a new archive), call add_file() as often as there is time for,
 * save state() again, and call finish() once after the last file.
 *
 * Central directory records are kept in a side file, <archive>.central, until finish() copies
 * them onto the end of the archive. The state holds the two files' lengths as of the last
 * completed add_file(); on construction both are truncated back to those lengths, so a request
 * killed half-way through writing a file leaves nothing behind that the next one trips over.
 *
 * Text files (by extension) are deflated, in memory, up to COMPRESS_MAX_BYTES; everything else is
 * stored. Images, audio and video are already compressed, and storing them makes adding even a
 * large file little more than a disk copy. ZIP64 records are written only when an archive needs
 * them: past 4 GB, or past 65,535 files.
 */
class Static_export_zip {

	/** Extensions worth deflating. Anything else — media, mostly — is stored as is. */
	private static $COMPRESS = array(
		'html', 'htm', 'js', 'css', 'json', 'md', 'txt', 'xml', 'svg', 'csv', 'map',
		'dzi', 'kml', 'geojson', 'vtt', 'srt', 'ttf', 'otf', 'eot',
	);

	/** Largest file deflated in memory (32 MB); bigger text files are stored rather than held whole. */
	const COMPRESS_MAX_BYTES = 33554432;

	/**
	 * Sizes and counts at which ZIP64 records take over from the classic ones. Read through
	 * static:: so a test can lower them and exercise the ZIP64 paths without writing 4 GB.
	 */
	const ZIP64_BYTES   = 0xFFFFFFFF;
	const ZIP64_ENTRIES = 0xFFFF;

	private $path;
	private $fh;
	private $central_fh;

	/** ['offset' => archive bytes written, 'central' => side-file bytes, 'count' => files added] */
	private $state;

	/**
	 * @param string     $path   The archive. Created if missing.
	 * @param array|null $state  What state() returned last time, or null to start a new archive
	 */
	public function __construct($path, $state = null) {

		$this->path  = $path;
		$this->state = is_array($state) ? $state : array('offset' => 0, 'central' => 0, 'count' => 0);

		$this->fh         = fopen($path, 'c+b');
		$this->central_fh = fopen($path . '.central', 'c+b');
		if (false === $this->fh || false === $this->central_fh) {
			throw new Exception('Could not open the archive for writing: ' . $path);
		}

		$this->_rewind();

	}

	public function __destruct() {

		if (is_resource($this->fh)) fclose($this->fh);
		if (is_resource($this->central_fh)) fclose($this->central_fh);

	}

	/**
	 * Where the archive has got to, for the caller to keep until the next request.
	 *
	 * @return array
	 */
	public function state() {

		return $this->state;

	}

	/**
	 * Append one file to the archive.
	 *
	 * @param  string $src   Absolute path of the file to add
	 * @param  string $name  Its path inside the archive, '/'-separated
	 * @return bool          False if the file couldn't be read or written; the archive is left
	 *                       as it was before the call
	 */
	public function add_file($src, $name) {

		$size = @filesize($src);
		if (false === $size) return false;

		$ext     = strtolower(pathinfo($name, PATHINFO_EXTENSION));
		$deflate = in_array($ext, self::$COMPRESS, true) && $size <= self::COMPRESS_MAX_BYTES
		        && function_exists('gzdeflate');

		$data = null;
		if ($deflate) {
			$raw = file_get_contents($src);
			if (false === $raw) return false;
			$crc  = crc32($raw);
			$data = gzdeflate($raw, 6);
			// Already-dense files can come out bigger; those are stored like media.
			if (false === $data || strlen($data) >= $size) {
				$data    = $raw;
				$deflate = false;
			}
			unset($raw);
			$csize = strlen($data);
		} else {
			$hash = hash_file('crc32b', $src);
			if (false === $hash) return false;
			$crc   = hexdec($hash);
			$csize = $size;
		}

		$method = $deflate ? 8 : 0;
		$offset = $this->state['offset'];
		list($dos_time, $dos_date) = self::_dos_datetime(@filemtime($src));

		// Local header. Sizes go in a ZIP64 extra field when they don't fit in 32 bits.
		$zip64_sizes = ($size >= static::ZIP64_BYTES || $csize >= static::ZIP64_BYTES);
		$extra = $zip64_sizes ? pack('vvPP', 0x0001, 16, $size, $csize) : '';
		$local = pack('VvvvvvVVVvv',
			0x04034b50,
			$zip64_sizes ? 45 : 20,      // version needed to extract
			0x0800,                      // bit 11: names are UTF-8
			$method, $dos_time, $dos_date, $crc,
			$zip64_sizes ? 0xFFFFFFFF : $csize,
			$zip64_sizes ? 0xFFFFFFFF : $size,
			strlen($name), strlen($extra)
		) . $name . $extra;

		$ok = (fwrite($this->fh, $local) === strlen($local));
		if ($ok) {
			if (null !== $data) {
				$ok = (fwrite($this->fh, $data) === $csize);
			} else {
				$in = fopen($src, 'rb');
				$ok = (false !== $in) && (stream_copy_to_stream($in, $this->fh) === $size);
				if (false !== $in) fclose($in);
			}
		}
		if (!$ok) {
			$this->_rewind();
			return false;
		}

		// Central directory record. Once anything needs ZIP64 here, all three fields move to the
		// extra field together, which keeps the record's layout to one shape.
		$zip64 = ($zip64_sizes || $offset >= static::ZIP64_BYTES);
		$extra = $zip64 ? pack('vvPPP', 0x0001, 24, $size, $csize, $offset) : '';
		$central = pack('VvvvvvvVVVvvvvvVV',
			0x02014b50,
			0x0300 | ($zip64 ? 45 : 20), // made by: Unix, so the permissions below are honoured
			$zip64 ? 45 : 20,
			0x0800, $method, $dos_time, $dos_date, $crc,
			$zip64 ? 0xFFFFFFFF : $csize,
			$zip64 ? 0xFFFFFFFF : $size,
			strlen($name), strlen($extra),
			0, 0, 0,                     // comment length, disk number, internal attributes
			0100644 << 16,               // external attributes: a regular file, rw-r--r--
			$zip64 ? 0xFFFFFFFF : $offset
		) . $name . $extra;

		if (fwrite($this->central_fh, $central) !== strlen($central)) {
			$this->_rewind();
			return false;
		}

		$this->state['offset']  = ftell($this->fh);
		$this->state['central'] += strlen($central);
		$this->state['count']++;

		return true;

	}

	/**
	 * Close the archive: copy the central directory onto its end, write the end-of-archive
	 * records, and delete the side file. Nothing can be added afterwards.
	 *
	 * @return bool
	 */
	public function finish() {

		$cd_offset = $this->state['offset'];
		$cd_size   = $this->state['central'];
		$count     = $this->state['count'];

		rewind($this->central_fh);
		if (stream_copy_to_stream($this->central_fh, $this->fh) !== $cd_size) {
			$this->_rewind();
			return false;
		}

		$end = '';
		if ($count >= static::ZIP64_ENTRIES || $cd_offset >= static::ZIP64_BYTES || $cd_size >= static::ZIP64_BYTES) {
			// ZIP64 end of central directory record, then the locator that points at it.
			$end .= pack('VPvvVVPPPP', 0x06064b50, 44, 0x032D, 45, 0, 0, $count, $count, $cd_size, $cd_offset);
			$end .= pack('VVPV', 0x07064b50, 0, $cd_offset + $cd_size, 1);
			$count = $cd_size = $cd_offset = PHP_INT_MAX;   // so the classic record below says "see ZIP64"
		}
		$end .= pack('VvvvvVVv', 0x06054b50, 0, 0,
			min($count, 0xFFFF), min($count, 0xFFFF),
			min($cd_size, 0xFFFFFFFF), min($cd_offset, 0xFFFFFFFF), 0);

		if (fwrite($this->fh, $end) !== strlen($end)) {
			$this->_rewind();
			return false;
		}

		fflush($this->fh);
		fclose($this->central_fh);
		@unlink($this->path . '.central');

		return true;

	}

	/**
	 * Cut both files back to the lengths in $this->state and position the archive at its end —
	 * undoing whatever a failed write, or a request killed mid-write, left past that point.
	 */
	private function _rewind() {

		ftruncate($this->fh, $this->state['offset']);
		fseek($this->fh, $this->state['offset']);
		ftruncate($this->central_fh, $this->state['central']);
		fseek($this->central_fh, $this->state['central']);

	}

	/**
	 * A Unix timestamp as the MS-DOS time and date ZIP stores, which can't express anything
	 * before 1980.
	 *
	 * @param  int|false $ts
	 * @return array     [time, date]
	 */
	private static function _dos_datetime($ts) {

		$t = getdate((false === $ts || $ts < 315532800) ? 315532800 : $ts);
		return array(
			($t['hours'] << 11) | ($t['minutes'] << 5) | ($t['seconds'] >> 1),
			(($t['year'] - 1980) << 9) | ($t['mon'] << 5) | $t['mday'],
		);

	}

}
