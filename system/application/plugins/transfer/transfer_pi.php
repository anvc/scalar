<?php
	class Transfer {

		public $name = 'Import/Export';

		protected $rdf_url;
		protected $dest_url;
		protected $email;
		protected $source_url;

		public function __construct($data=array()) {

			if (!empty($data['book'])) {
				$this->rdf_url = confirm_slash(base_url()).$data['book']->slug.'/rdf/instancesof/content?rec=1&ref=1';
				$this->dest_url = confirm_slash(base_url()).$data['book']->slug;
				$this->email = $data['login']->email;
				$this->source_url = (isset($_REQUEST['source_url']) && !empty($_REQUEST['source_url'])) ? $_REQUEST['source_url'] : '';
			}

		}

		public function get() {

			if (!isset($this->dest_url)) {
				echo 'Please select a book to manage using the pulldown menu above';
			} else {
				$get_vars = '?dest_url=' . $this->dest_url . '&dest_id=' . $this->email
				          . ((!empty($this->source_url)) ? ('&source_url='.$this->source_url) : '');
?>
	        	<h3 style="margin-bottom:8px;">Export</h3>
	        	<hr style="height:1px; overflow:hidden; background-color:#aaaaaa; color:#aaaaaa;" />
	        	<p>
	        	The following link will create an RDF-JSON file that contains all pages and relationships contained in this book,
	        	which can be used as a backup of your book content or for importing at a later date. Loading the link might take a while
	        	depending on the amount of content.
	        	</p>
	        	<p><a href="<?=$this->rdf_url?>" target="_blank"><?=$this->rdf_url?></a></p>
	        	<h3 style="margin-top:18px; margin-bottom:8px;">Import</h3>
	        	<hr style="height:1px; overflow:hidden; background-color:#aaaaaa; color:#aaaaaa;" />
	        	<p>The tool below can be used to import pages and relationships from a public Scalar book.</p>
				<div class="plugin <?=strtolower(get_class($this))?>">
					<iframe style="width:100%; min-height:600px; border:none;" src="application/plugins/<?=strtolower(get_class($this))?>/index.html<?=$get_vars?>">
					</iframe>
				</div>;
<?
			}
		}
	}
?>
