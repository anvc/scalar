<?php
class Tensor {

	public $name = 'Tensor';
	public $plugin_dir = '';
	public $plugin_path = '';
	public $plugin_exists = false;
	private $book = null;

	public function __construct($data=array()) {

		$this->plugin_dir = dirname(__FILE__).'/'.strtolower(get_class($this)).'/';
		if (file_exists($this->plugin_dir)) $this->plugin_exists = true;
		if (!file_exists($this->plugin_dir.'index.php')) $this->plugin_exists = false;
		$this->plugin_path = base_url('application/plugins/' . strtolower(get_class($this)) . '/');
		$this->book = $data['book'];

	}

	public function get() {

		if (!$this->plugin_exists) return $this->error('The Tensor plugin does not exist. Contact the system admin to install Tensor at <b>application/plugins/tensor</b>.');
		if (empty($this->book)) return $this->error('Information about the current book was not sent to the Tensor plugin.');

		$html = '';
		$html .= '<style>'."\n";
		$html .= '#centered-message {display:none;}'."\n";
		$html .= '.page {position:static;}'."\n";
		$html .= '#tensor_iframe {border:0; position:absolute; top:52px; left:0px; width:100%; min-height:300px;}'."\n";
		$html .= '</style>'."\n";
		$html .= '<iframe id="tensor_iframe" src="';
		$html .=  $this->plugin_path.'wb/pegboard?parser=scalar&parent='.rawurlencode(confirm_slash(base_url()).$this->book->slug).'&title='.rawurlencode(strip_tags($this->book->title));
		$html .= '"></iframe>'."\n";
		$html .= '<script>'."\n";
		$html .= "  $('iframe#tensor_iframe').height( parseInt($(window).height())-52 );\n";
		$html .= '</script>'."\n";
		echo $html;

	}

	private function error($msg='') {

		echo '<div class="error text-center">'.$msg.'</div>'."\n";
		return false;

	}

}
?>