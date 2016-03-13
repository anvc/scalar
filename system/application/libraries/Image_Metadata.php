<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');

class Image_Metadata {

	const FORMAT_NS = 0;
	const FORMAT_URI = 1;

	private $iptc_ns = 'iptc';
	private $iptc_uri = '';
	private $iptc = array();
	private $exif_ns = 'exif';
	private $exif_uri = '';
	private $exif = array();

	public function __construct() {

		require_once(confirm_slash(FCPATH).'system/application/libraries/Image_IPTC/Image_IPTC.php');
		$CI =& get_instance();
		$namespaces = $CI->config->item('namespaces');
		$ontologies = $CI->config->item('ontologies');
		$this->iptc_uri =@ $namespaces[$this->iptc_ns];
		$this->iptc = $ontologies[$this->iptc_ns];

	}

	public function get($path='', $format=Image_Metadata::FORMAT_NS) {

		$return = array();

		$iptc_arr = (!empty($this->iptc_ns)) ? $this->get_iptc($path) : array();
		$exif_arr = (!empty($this->exif_ns)) ? $this->get_exif($path) : array();
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

		return $return;

	}

	private function get_exif($path='') {

		// $exif = exif_read_data($path);
		// TODO
		return array();

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

	private function rdf_value($value=array()) {

		$return = array();
		foreach ($value as $val) {
			if (empty($val)) continue;
			$return[] = array('value' => $val, 'type' => ((isURL($val))?'uri':'literal') );
		}
		return $return;

	}

}
?>