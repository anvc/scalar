<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');

class Image_Metadata {

	const FORMAT_NS = 0;
	const FORMAT_URI = 1;

	private $iptc_ns = 'iptc';
	private $iptc_uri = '';
	private $exif_ns = 'exif';
	private $exif_uri = '';
	private $id3_ns = 'id3';
	private $id3_uri = '';
	private $pano_ns = 'gpano';
	private $pano_uri = '';

	public function __construct() {

		require_once(confirm_slash(FCPATH).'system/application/libraries/Image_IPTC/Image_IPTC.php');
		$CI =& get_instance();
		$namespaces = $CI->config->item('namespaces');
		$ontologies = $CI->config->item('ontologies');
		$this->iptc_uri =@ $namespaces[$this->iptc_ns];
		$this->iptc = $ontologies[$this->iptc_ns];  // The IPTC parser matches against the ontology list in config/rdf.php
		$this->exif_uri =@ $namespaces[$this->exif_ns];
		$this->id3_uri =@ $namespaces[$this->id3_ns];
		$this->pano_uri =@ $namespaces[$this->pano_ns];

	}

	public function get($path='', $format=Image_Metadata::FORMAT_NS) {

		$return = array();

		$iptc_arr = (!empty($this->iptc_ns)) ? $this->get_iptc($path) : array();
		$exif_arr = (!empty($this->exif_ns)) ? $this->get_exif($path) : array();
		$id3_arr = (!empty($this->id3_ns)) ? $this->get_id3($path) : array();
		$pano_str = (!empty($this->pano_ns)) ? $this->getXmpData($path) : array();

		if (!empty($pano_str)) {
			$p = xml_parser_create();
			xml_parse_into_struct($p, $pano_str, $pano_arr, $_index);
			xml_parser_free($p);
		}

		foreach ($iptc_arr as $field => $value) {
			switch ($format) {
				case Image_Metadata::FORMAT_NS:
					$return[$this->iptc_ns.':'.$field] = $this->rdf_value($value);
					break;
				case Image_Metadata::FORMAT_URI:
					$return[$this->iptc_uri.$field] = $this->rdf_value($value);
					break;
			}
		}
		foreach ($exif_arr as $field => $value) {
			switch ($format) {
				case Image_Metadata::FORMAT_NS:
					$return[$field] = $this->rdf_value($value);  // Might not have exif: prefix
					break;
				case Image_Metadata::FORMAT_URI:
					$return[$this->exif_uri.$field] = $this->rdf_value($value);
					break;
			}
		}
		foreach ($id3_arr as $field => $value) {
			switch ($format) {
				case Image_Metadata::FORMAT_NS:
					$return[$this->id3_ns.':'.$field] = $this->rdf_value($value);
					break;
				case Image_Metadata::FORMAT_URI:
					$return[$this->id3_uri.$field] = $this->rdf_value($value);
					break;
			}
		}
		foreach ($pano_arr as $item) {
			switch ($format) {
				case Image_Metadata::FORMAT_NS:
					$field = strtolower($item['tag']);
					if (false === strpos($field, $this->pano_ns)) continue 2;
					if (empty($item['value'])) continue 2;
					$return[$field] = $this->rdf_value($item['value']);
					break;
				case Image_Metadata::FORMAT_URI:
					// TODO
					break;
			}
		}

		return $return;

	}

	private function get_iptc($path='') {

		$iptc = new Image_IPTC($path);
		$return = array();
		if (!$iptc->isValid()) return $return;
		$arr = $iptc->getAllTags();
		if (is_array($arr)) {
			foreach ($arr as $field => $value) {
				if (!isset($this->iptc[$field])) continue;
				$_field = $this->iptc[$field];
				$_value = array();
				foreach ($value as $val) {
					if (!empty($val)) $_value[] = utf8_encode($val);
				}
				if (!empty($_value)) $return[$_field] = $_value;
			}
		}
		return $return;

	}

	private function get_exif($path='') {

		$exif = array();
		$exif =@ exif_read_data($path);
		if (!$exif) return array();
		
		if (isset($exif['GPSLongitude']) && isset($exif['GPSLongitudeRef']) && isset($exif['GPSLatitude']) && isset($exif['GPSLatitudeRef'])) {
			if (is_array($exif['GPSLongitude']) && is_array($exif['GPSLatitude'])) {
				$deg = $this->fraction_to_decimal($exif['GPSLongitude'][0]);
				$min = $this->fraction_to_decimal($exif['GPSLongitude'][1]);
				$sec = $this->fraction_to_decimal($exif['GPSLongitude'][2]);
				$lng = $this->dms_to_dec($deg, $min, $sec);
				if ('W' == $exif['GPSLongitudeRef']) $lng = $lng * -1;		
				$deg = $this->fraction_to_decimal($exif['GPSLatitude'][0]);
				$min = $this->fraction_to_decimal($exif['GPSLatitude'][1]);
				$sec = $this->fraction_to_decimal($exif['GPSLatitude'][2]);
				$lat = $this->dms_to_dec($deg, $min, $sec);
				if ('S' == $exif['GPSLatitudeRef']) $lat = $lat * -1;
				return array('dcterms:spatial'=>$lat.','.$lng);
			}
		}
		
		return array();

	}

	private function get_id3($path='') {

		$url = parse_url($path);
		//$file_path = realpath(FCPATH.'..'.$url['path']);

		$oReader = new ID3TagsReader();
		$aTags = $oReader->getTagsInfo($path);
		unset($aTags['FileName']);
		unset($aTags['Version']);
		if (null===$aTags || !is_array($aTags)) $aTags = array();
		return $aTags;

	}
	
	private function getXmpData($filename, $chunkSize = 1024) {  // https://stackoverflow.com/questions/1578169/how-can-i-read-xmp-data-from-a-jpg-with-php
		
		if (!is_int($chunkSize)) {
			throw new RuntimeException('Expected integer value for argument #2 (chunkSize)');
		}
		if ($chunkSize < 12) {
			throw new RuntimeException('Chunk size cannot be less than 12 argument #2 (chunkSize)');
		}
		if (($file_pointer = fopen($filename, 'r')) === FALSE) {
			throw new RuntimeException('Could not open file for reading');
		}
		
		$startTag = '<x:xmpmeta';
		$endTag = '</x:xmpmeta>';
		$buffer = NULL;
		$hasXmp = FALSE;
		
		while (($chunk = fread($file_pointer, $chunkSize)) !== FALSE) {
			if ($chunk === "") {
				break;
			}
			$buffer .= $chunk;
			$startPosition = strpos($buffer, $startTag);
			$endPosition = strpos($buffer, $endTag);
			
			if ($startPosition !== FALSE && $endPosition !== FALSE) {
				$buffer = substr($buffer, $startPosition, $endPosition - $startPosition + 12);
				$hasXmp = TRUE;
				break;
			} elseif ($startPosition !== FALSE) {
				$buffer = substr($buffer, $startPosition);
				$hasXmp = TRUE;
			} elseif (strlen($buffer) > (strlen($startTag) * 2)) {
				$buffer = substr($buffer, strlen($startTag));
			}
		}
		
		fclose($file_pointer);
		return ($hasXmp) ? $buffer : NULL;
		
	}

	private function rdf_value($value=array()) {

		$return = array();
		if (!is_array($value)) $value = array($value);
		foreach ($value as $val) {
			if (empty($val)) continue;
			$return[] = array('value' => $val, 'type' => ((isURL($val))?'uri':'literal') );
		}
		return $return;

	}
	
	private function dms_to_dec($deg, $min, $sec, $round = 0) {
		
   		$dec = $deg + ((($min * 60) + ($sec)) / 3600);
   		if ($round != 0) $dec = round($dec, $round);
 		return $dec;
 		
	}
	
	private function fraction_to_decimal($str) {
		
		if (!strpos($str, '/')) return $str;
		$first = substr($str, 0, strpos($str,'/'));
		$last = substr($str, strpos($str,'/')+1);
		$num = $first / $last;
		return $num;
		
	}

} // class

// This comes from https://www.script-tutorials.com/id3-tags-reader-with-php/
// which appears to not have a license
// The great thing about it is that it doesn't rely on PHP's ID3 package, which isn't installed by default ~Craig
class ID3TagsReader {
	var $aTV23 = array( // array of possible sys tags (for last version of ID3)
		'TIT2',
		'TALB',
		'TPE1',
		'TPE2',
		'TRCK',
		'TYER',
		'TLEN',
		'USLT',
		'TPOS',
		'TCON',
		'TENC',
		'TCOP',
		'TPUB',
		'TOPE',
		'WXXX',
		'COMM',
		'TCOM'
	);
	var $aTV23t = array( // array of titles for sys tags
		'Title',
		'Album',
		'Author',
		'AlbumAuthor',
		'Track',
		'Year',
		'Length',
		'Lyric',
		'Desc',
		'Genre',
		'Encoded',
		'Copyright',
		'Publisher',
		'OriginalArtist',
		'URL',
		'Comments',
		'Composer'
	);
	var $aTV22 = array( // array of possible sys tags (for old version of ID3)
		'TT2',
		'TAL',
		'TP1',
		'TRK',
		'TYE',
		'TLE',
		'ULT'
	);
	var $aTV22t = array( // array of titles for sys tags
		'Title',
		'Album',
		'Author',
		'Track',
		'Year',
		'Length',
		'Lyric'
	);
	function getTagsInfo($sFilepath) {
		// read source file
		/*
		$iFSize = filesize($sFilepath);
		$vFD = fopen($sFilepath,'r');
		$sSrc = fread($vFD,$iFSize);
		fclose($vFD);
		*/
		try {
			$handle = fopen($sFilepath, "rb");
			$sSrc = stream_get_contents($handle);  // Can read remote files
			fclose($handle);
		} catch (Exception $e) {
			return null;  // Couldn't read file
		}
		// obtain base info
		if (substr($sSrc,0,3) == 'ID3') {
			$aInfo['FileName'] = $sFilepath;
			$aInfo['Version'] = hexdec(bin2hex(substr($sSrc,3,1))).'.'.hexdec(bin2hex(substr($sSrc,4,1)));
		} else {
			return null;  // No ID3 tags
		}
		// passing through possible tags of idv2 (v3 and v4)
		if ($aInfo['Version'] == '4.0' || $aInfo['Version'] == '3.0') {
			for ($i = 0; $i < count($this->aTV23); $i++) {
				if (strpos($sSrc, $this->aTV23[$i].chr(0)) != false) {
					$s = '';
			        $iPos = strpos($sSrc, $this->aTV23[$i].chr(0));
			        $iLen = hexdec(bin2hex(substr($sSrc,($iPos + 5),3)));
			        $data = substr($sSrc, $iPos, 9 + $iLen);
			        for ($a = 0; $a < strlen($data); $a++) {
			       		$char = substr($data, $a, 1);
			       		if ($char >= ' ' && $char <= '~') $s .= $char;
					}
					if (substr($s, 0, 4) == $this->aTV23[$i]) {
						$iSL = 4;
						if ($this->aTV23[$i] == 'USLT') {
					    	$iSL = 7;
					  	} elseif ($this->aTV23[$i] == 'TALB') {
			              	$iSL = 5;
			          	} elseif ($this->aTV23[$i] == 'TENC') {
			              	$iSL = 6;
			          	}
			          	$aInfo[$this->aTV23t[$i]] = substr($s, $iSL);
			        }
				}  // if
			} // for
		} // if version
		// passing through possible tags of idv2 (v2)
		if($aInfo['Version'] == '2.0') {
			for ($i = 0; $i < count($this->aTV22); $i++) {
				if (strpos($sSrc, $this->aTV22[$i].chr(0)) != false) {
					$s = '';
				   	$iPos = strpos($sSrc, $this->aTV22[$i].chr(0));
				  	$iLen = hexdec(bin2hex(substr($sSrc,($iPos + 3),3)));
				 	$data = substr($sSrc, $iPos, 6 + $iLen);
				  	for ($a = 0; $a < strlen($data); $a++) {
				    	$char = substr($data, $a, 1);
				    	if ($char >= ' ' && $char <= '~') $s .= $char;
				 	}
				  	if (substr($s, 0, 3) == $this->aTV22[$i]) {
				    	$iSL = 3;
				     	if ($this->aTV22[$i] == 'ULT') {
				     		$iSL = 6;
				     	}
				      	$aInfo[$this->aTV22t[$i]] = substr($s, $iSL);
				 	}
				}  // if
			}  // for
		}  // if version
		return $aInfo;
	} // getTagsInfo
}  // class
?>