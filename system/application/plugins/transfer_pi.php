<?php
class Transfer {

	public $name = 'Import/Export';
	public $plugin_path = '';
	public $plugin_dir = '';
	public $plugin_exists = false;

	protected $rdf_url_json;
	protected $rdf_url_xml;
	protected $dest_url;
	protected $email;
	protected $source_url;

	public function __construct($data=array()) {

		$this->plugin_path = strtolower(get_class($this)).'/index.html';
		$this->plugin_dir = dirname(__FILE__).'/'.$this->plugin_path;
		if (file_exists($this->plugin_dir)) $this->plugin_exists = true;
			
		if (!empty($data['book'])) {
			$this->rdf_url_json = confirm_slash(base_url()).$data['book']->slug.'/rdf/instancesof/content?format=json&rec=1&ref=1';
			$this->rdf_url_xml = confirm_slash(base_url()).$data['book']->slug.'/rdf/instancesof/content?&rec=1&ref=1';
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
	        	<h3 style="margin-bottom:8px;">Export</h3>
	        	<hr style="height:1px; overflow:hidden; background-color:#aaaaaa; color:#aaaaaa;" />
	        	<p>
	        	The following link will create an RDF-JSON file that contains all pages and relationships contained in this book,
	        	which can be used as a backup of your book content or for importing at a later date. Loading the link might take a while
	        	depending on the amount of content.
	        	</p>
	        	<p>
	        	  <a href="<?=$this->rdf_url_json?>" target="_blank"><?=$this->rdf_url_json?></a><br />
	        	  <small>Or, <a href="<?=$this->rdf_url_xml?>" target="_blank">download as RDF-XML</a>.</small>
	        	</p>
	        	<h3 style="margin-top:18px; margin-bottom:8px;">Import</h3>
	        	<hr style="height:1px; overflow:hidden; background-color:#aaaaaa; color:#aaaaaa;" />
	        	<p>The tool below can be used to import pages and relationships from a public Scalar book.
	        	Simply place the URL of the source book into the Source Book field.  Alternatively, you can
	        	import snippets of a Scalar book using the Paste RDF tab (<a href="javascript:void(null);" onclick="$('#snippet_dialog').dialog({modal:true,width:parseInt($(window).width())*0.8,height:parseInt($(window).height())*0.8});">learn more</a>).</p>
				<div class="plugin <?=strtolower(get_class($this))?>">
<?php 
			if ($this->plugin_exists) {
				echo '<iframe style="width:100%; min-height:600px; border:none;" src="application/plugins/'.$this->plugin_path.$get_vars.'"></iframe>'."\n";
			} else {
				echo '<div class="alert alert-warning">Please contact a system administrator to install the plugin in a folder named <b>'.strtolower(get_class($this)).'</b> at <b>/system/application/plugins/</b>.</div>';
			}
?>	
				</div>
				<div id="snippet_dialog" title="Importing" style="display:none;">
  				<p>
  				In the Import area you can pull all pages and relationships from another public book using its URL. Simply grab the URL of the source book and place it into the form and Scalar will do the rest&mdash;with some limitations (click the <i>List of fields &amp; media that aren't transferred</i> button in the tool to read about a few considerations).
				</p><p>
				You can also import snippets of a Scalar book. For example, you may wish to import just a single path and its pages from a source book. Or, only the media. Any content type can be acquired by visiting our tool for this task, the <a target="_blank" href="http://scalar.usc.edu/tools/apiexplorer/">API Explorer</a>. Its friendly interface allows you to easily generate the appropriate RDF-JSON output by selecting the portion of a Scalar book you'd like to export and clicking "Get API Results." For instance, if you'd like to export only the contents of one path within a book, simply insert the path's URL, set "return related content with up to '1' degree of separation," then click "Get API Results." Finally, cut-and-paste the resulting RDF-JSON into the "Paste RDF" tab of the Dashboard's Import area.
  				</p><p>
  				<img src="http://scalar.usc.edu/wp-content/uploads/2015/03/apiexplorer-to-import.jpg" style="width:100%;border:solid 1px #cccccc;" />
  				</p>
				</div>
<?php

		}
	}
?>