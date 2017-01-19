<?php
class ThoughtMesh {

	public $name = 'ThoughtMesh';
	public $plugin_path = '';
	public $plugin_dir = '';
	public $plugin_url = '';
	public $plugin_exists = false;

	public function __construct($data=array()) {

		$this->plugin_path = strtolower(get_class($this)).'/jquery.thoughtmesh.js';
		$this->plugin_dir = dirname(__FILE__).'/'.$this->plugin_path;
		if (file_exists($this->plugin_dir)) $this->plugin_exists = true;
		$this->plugin_url = 'system/application/plugins/'.$this->plugin_path;

	}

	public function get() {

		if (!$this->plugin_exists) throw new Exception($this->name.' plugin does not exist');
		
		$CI =& get_instance();
		
		$CI->template->add_js($this->plugin_url);
		$CI->template->add_js($this->js(),'embed');

	}
	
	private function js() {
		
$js = <<<EOT

$(document).ready(function() {
  $('body').on('pageLoadComplete', function() {
     var opts = {};
	 $('#footer').thoughtmesh(opts);
  });
});

EOT;

		return $js;
		
	}
}
?>