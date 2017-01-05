<?php
	class Transfer {

		public $name = 'Import/Export';
		public $plugin_path = '';
		public $plugin_dir = '';
		public $plugin_exists = false;

		protected $dest_url;
		protected $email;
		protected $source_url;

		public function __construct($data=array()) {

			$this->plugin_path = strtolower(get_class($this)).'/index.html';
			$this->plugin_dir = dirname(__FILE__).'/'.$this->plugin_path;
			if (file_exists($this->plugin_dir)) $this->plugin_exists = true;
			
			if (!empty($data['book'])) {
				$this->dest_url = confirm_slash(base_url()).$data['book']->slug;
				$this->email = $data['login']->email;
				$this->source_url = (isset($_REQUEST['source_url']) && !empty($_REQUEST['source_url'])) ? $_REQUEST['source_url'] : '';
			}

		}

		public function get() {

			if (!isset($this->dest_url)) {
				echo 'Please select a book to manage using the pulldown menu above';
				return;
			}
				
			$get_vars = '?dest_url=' . $this->dest_url . '&dest_id=' . $this->email . ((!empty($this->source_url)) ? ('&source_url='.$this->source_url) : '');
?>
				<div class="plugin <?=strtolower(get_class($this))?>">
<?php 
			if ($this->plugin_exists) {
				echo '<iframe style="width:100%; min-height:600px; border:none;" src="application/plugins/'.$this->plugin_path.$get_vars.'"></iframe>'."\n";
			} else {
				echo '<div style="padding:10px; border:solid 1px #cccccc; background-color:#eeeeee;">The <b>'.$this->name.'</b> plugin can\'t be found.  Please contact a system administrator to install the plugin in a folder named <b>'.strtolower(get_class($this)).'</b> at <b>/system/application/plugins/</b>.</div>';
			}
?>	
				</div>
<?php

		}
	}
?>