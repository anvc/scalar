<?php
class ThoughtMesh {

	public $name = 'ThoughtMesh';
	public $plugin_dir = '';
	public $plugin_path = '';
	public $plugin_exists = false;

	public function __construct($data=array()) {

		$this->plugin_dir = dirname(__FILE__).'/'.strtolower(get_class($this)).'/';
		if (file_exists($this->plugin_dir)) $this->plugin_exists = true;
		$this->plugin_path = 'application/plugins/' . strtolower(get_class($this)) .'/';

	}

	public function get() {

		if (!$this->plugin_exists) return;

		$CI =& get_instance();
		if ('editing'==$CI->data['mode']) return;

		$CI->template->add_css($this->plugin_path.'thoughtmesh.css');
		$CI->template->add_js($this->plugin_path.'jquery.thoughtmesh.js');
		$CI->template->add_js($this->js(),'embed');

	}

	private function js() {

$js = <<<EOT

$(document).ready(function() {
  if (!$('#book-title span[data-thoughtmesh="true"]').length) return;
  $('body').on('pageLoadComplete', function() {
	 if ($('[property="sioc:content"]').is(':empty')) return;
     var opts = {};
	 $('#footer').thoughtmesh(opts);
  });
});

EOT;

		return $js;

	}
}
?>