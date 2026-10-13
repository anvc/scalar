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
 * @projectDescription  Controller for exporting a Scalar book as a self-contained static website.
 *                      Routed via: $route['(.*)/static_export'] = "static_export/index"
 *                                  $route['(.*)/static_export/check'] = "static_export/check"
 *                      URL pattern: /<book-slug>/static_export
 *                                   /<book-slug>/static_export/check
 */

class Static_Export extends MY_Controller {

	/**
	 * Set while answering ?debug=1, which reports the temp directory it built and so must not
	 * then delete it. Read by _cleanup() on shutdown.
	 */
	private $keep_tmp_dir = false;

	public function __construct() {

		parent::__construct();

		$this->load->model('book_model', 'books');

		// Segment 1 of the original URI is the book slug (e.g. "mybook" in /mybook/static_export)
		$slug = no_edition(strtolower($this->uri->segment(1)));
		$this->data['book'] = (!empty($slug)) ? $this->books->get_by_slug($slug) : null;
		if (empty($this->data['book'])) show_404();

		$this->set_user_book_perms();

	}

	/**
	 * Build the export. Accepts GET, or POST from the Utilities tab, which asks the author how
	 * the site should be built (see check()) and posts the answers: maps_provider ('google' or
	 * 'leaflet') and google_maps_key for a book that draws maps, and search_engines plus
	 * site_url for whether to write a sitemap.
	 */
	public function index() {

		$this->_require_author();

		if (!class_exists('ZipArchive')) {
			return $this->_fail(500, 'This Scalar installation is missing PHP\'s zip extension, so the '
			                       . 'export cannot be packaged for download. Ask whoever administers the '
			                       . 'server to enable ext-zip.');
		}

		// A big book takes a while to render and the result is streamed, not buffered, so the
		// usual script limits are the wrong shape here.
		@set_time_limit(0);
		ignore_user_abort(true);

		$this->load->model('static_export_model', 'static_export_model');
		$book_data = $this->static_export_model->get_book_data($this->data['book']->book_id);

		$slug    = $this->data['book']->slug;
		$stem    = sys_get_temp_dir() . '/scalar_export_' . $slug . '_' . time();
		$tmp_dir = $stem;
		$zip_path = $stem . '.zip';

		if (!mkdir($tmp_dir, 0755, true)) {
			return $this->_fail(500, 'Could not create a temporary directory for the export: ' . $tmp_dir);
		}

		// Registered before anything can fail, so the temp tree is cleaned up however this
		// request ends — including a fatal error mid-render, or the reader cancelling the
		// download (which is why ignore_user_abort is on: the cleanup still needs to run).
		register_shutdown_function(array($this, '_cleanup'), $tmp_dir, $zip_path);

		$result = $this->static_export_model->render_book($book_data, $tmp_dir, $this->_export_options());

		// ?debug=1 answers with what was built instead of the file — what this endpoint used to
		// do always, and still the quickest way to see what a book produced without unzipping.
		// The temp directory is left in place so there is something to go and look at; it is
		// the one path that doesn't clean up after itself.
		if ($this->input->get('debug')) {
			$this->keep_tmp_dir = true;
			header('Content-Type: application/json');
			echo json_encode(array(
				'tmp_dir'   => $tmp_dir,
				'rendered'  => $result['rendered'],
				'skipped'   => $result['skipped'],
				'errors'    => $result['errors'],
				'dataBytes' => $result['dataBytes'],
				'maps'      => $result['maps'],
			), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
			exit;
		}

		if (empty($result['rendered'])) {
			return $this->_fail(500, 'The export produced no pages. ' . $this->_error_summary($result['errors']));
		}

		if (!$this->_zip_dir($tmp_dir, $zip_path, $slug)) {
			return $this->_fail(500, 'The site was built but could not be packaged into a ZIP file.');
		}

		$this->_stream_zip($zip_path, $slug . '-static-site.zip', $this->input->post('download_token'));

	}

	/**
	 * Pack $dir into $zip_path, with everything under a single top-level folder named $folder so
	 * that unzipping yields one directory rather than scattering a few thousand files into
	 * whatever the reader had open. That folder is what the export's README means by
	 * "upload the whole folder".
	 *
	 * @param  string $dir
	 * @param  string $zip_path
	 * @param  string $folder    Top-level directory name inside the archive
	 * @return bool
	 */
	private function _zip_dir($dir, $zip_path, $folder) {

		$zip = new ZipArchive();
		if (true !== $zip->open($zip_path, ZipArchive::CREATE | ZipArchive::OVERWRITE)) return false;

		$dir = rtrim($dir, '/');
		$it  = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
			RecursiveIteratorIterator::SELF_FIRST
		);

		foreach ($it as $item) {
			$local = $folder . '/' . str_replace(DIRECTORY_SEPARATOR, '/', $it->getSubPathName());
			if ($item->isDir()) {
				$zip->addEmptyDir($local);
			} else {
				$zip->addFile($item->getPathname(), $local);
			}
		}

		return $zip->close();

	}

	/**
	 * Send $path to the browser as a download named $filename, then stop. Read in chunks rather
	 * than with readfile() so that a multi-gigabyte book doesn't have to fit in memory, and with
	 * every output buffer torn down first so CodeIgniter's own buffering doesn't do it for us.
	 *
	 * $token, if the Utilities tab sent one, comes back as a cookie. A download delivered as an
	 * attachment leaves the page it was requested from untouched, which is the behaviour we
	 * want and also means the browser fires no event the tab could listen for — so there is no
	 * other way for it to know the file is on its way and stop saying "generating". The cookie
	 * is set here, immediately before the first byte, because by this point the work is done
	 * and the response is committed. See utils.php, which polls for it.
	 *
	 * @param string      $path
	 * @param string      $filename
	 * @param string|null $token     Opaque value to echo back as a cookie
	 */
	private function _stream_zip($path, $filename, $token = null) {

		while (ob_get_level()) ob_end_clean();

		// Narrowed to the characters the tab generates, so nothing from the request can get
		// into a response header.
		$token = preg_replace('/[^A-Za-z0-9]/', '', (string) $token);
		if ('' !== $token) {
			// No HttpOnly: the point of this cookie is that a script can see it.
			setcookie('scalar_static_export', substr($token, 0, 40), 0, '/');
		}

		header('Content-Type: application/zip');
		header('Content-Disposition: attachment; filename="' . str_replace('"', '', $filename) . '"');
		header('Content-Length: ' . filesize($path));
		header('Content-Transfer-Encoding: binary');
		header('Cache-Control: private, no-store');
		header('Pragma: no-cache');

		$fh = fopen($path, 'rb');
		if (false === $fh) return $this->_fail(500, 'The ZIP file could not be opened for sending.');

		while (!feof($fh)) {
			echo fread($fh, 1048576);
			flush();
		}
		fclose($fh);

		exit;   // _cleanup() runs on shutdown

	}

	/**
	 * Remove the export's temp directory and ZIP. Public only because it is registered as a
	 * shutdown function; nothing else should call it.
	 *
	 * @param string $tmp_dir
	 * @param string $zip_path
	 */
	public function _cleanup($tmp_dir, $zip_path) {

		if (is_file($zip_path)) @unlink($zip_path);
		if ($this->keep_tmp_dir || !is_dir($tmp_dir)) return;

		$it = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator($tmp_dir, RecursiveDirectoryIterator::SKIP_DOTS),
			RecursiveIteratorIterator::CHILD_FIRST
		);
		foreach ($it as $item) {
			if ($item->isDir()) @rmdir($item->getPathname()); else @unlink($item->getPathname());
		}
		@rmdir($tmp_dir);

	}

	/**
	 * Answer with a plain-text explanation rather than a half-written download. The reader is an
	 * author in a dashboard, not a developer reading a log, so the message says what happened
	 * and nothing about where in the code it happened.
	 *
	 * @param int    $status
	 * @param string $message
	 */
	private function _fail($status, $message) {

		while (ob_get_level()) ob_end_clean();
		http_response_code($status);
		header('Content-Type: text/plain; charset=utf-8');
		echo $message . "\n";
		exit;

	}

	/**
	 * The first few problems from a failed render, for a message an author can act on or quote.
	 *
	 * @param  array $errors
	 * @return string
	 */
	private function _error_summary(array $errors) {

		if (empty($errors)) return 'No reason was recorded. Re-run with ?debug=1 for details.';

		$lines = array();
		foreach (array_slice($errors, 0, 5, true) as $where => $what) {
			$lines[] = $where . ': ' . $what;
		}
		if (count($errors) > 5) $lines[] = '(and ' . (count($errors) - 5) . ' more)';

		return "Problems:\n  " . implode("\n  ", $lines);

	}

	/**
	 * What the Utilities tab needs before it starts an export: whether the book draws maps,
	 * which decides whether to ask the author about Google Maps, and the key to suggest if
	 * this installation shares its own (static_export_share_google_maps_key). Answers JSON.
	 */
	public function check() {

		$this->_require_author();

		$this->load->model('static_export_model', 'static_export_model');
		$defaults = $this->static_export_model->default_map_options();

		header('Content-Type: application/json');
		header('Cache-Control: no-store');
		echo json_encode(array(
			'usesMaps'      => $this->static_export_model->uses_maps($this->data['book']->book_id),
			'googleMapsKey' => $defaults['googleMapsKey'],
		));
		exit;

	}

	// Require Author-level access (same pattern as book.php __construct for private books)
	private function _require_author() {

		if (!$this->login_is_book_admin('Author')) {
			if ($this->data['login']->is_logged_in) {
				$this->no_permissions();
			} else {
				$this->require_login();
			}
		}

	}

	/**
	 * The site settings for render_book(): this installation's defaults, with the author's
	 * answers from the export dialog applied. Neither the Google Maps key nor the site address
	 * is stored anywhere; both are used for this one export.
	 */
	private function _export_options() {

		$options  = $this->static_export_model->default_map_options();
		$provider = $this->input->post('maps_provider');

		if ('google' === $provider) {
			$options['googleMapsKey'] = trim((string) $this->input->post('google_maps_key'));
		} elseif (is_string($provider) && '' !== $provider) {
			$options['googleMapsKey'] = '';
		}

		// Search engines: off unless the author ticked the box *and* gave an address. A sitemap
		// needs absolute URLs, so without one there is nothing to write; the address is also
		// what lets 404.html offer a reliable way back to the book.
		$site_url = trim((string) $this->input->post('site_url'));
		if ('' !== $site_url && !preg_match('#^https?://#i', $site_url)) $site_url = 'https://' . $site_url;

		$options['searchEngines'] = ('1' === (string) $this->input->post('search_engines')) && '' !== $site_url;
		$options['siteUrl']       = $site_url;

		return $options;

	}

}
