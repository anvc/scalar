<?php 
	class Book_Import {

		protected $email;
		protected $source_url;
		protected $dest_url;
		protected $extension;
		public function __construct($data) {
			$this->extension = 'book_import';

			if(!empty($data['book'])) {
				$this->dest_url = confirm_slash(base_url()).$data['book']->slug;
				$this->source_url = (isset($_REQUEST['source_url']) && !empty($_REQUEST['source_url'])) ? $_REQUEST['source_url'] : '';
				$this->email = $data['login']->email;
			}
			
		}

		public function get_extension() {
			return $this->extension;
		}
		public function get_tag() {
			return 'Import/Export';
		}

		public function get_view() {
			if(!isset($this->email)) {
				echo 'Please select a book to manage using the pulldown menu above';
			} else {
				$get_vars = '?dest_url=' . $this->dest_url . '&dest_id=' . $this->email 
				          . ((!empty($this->source_url)) ? ('&source_url='.$this->source_url) : '');
	        ?>
				<div>
					<iframe style="width:100%;min-height:600px;border:none" src="application/plugins/book_import/index.html<?=$get_vars?>">
					</iframe>
				</div>;
			<?
			}
		}
	}
?>
