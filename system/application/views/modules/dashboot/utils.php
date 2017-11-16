<?$this->template->add_css('system/application/views/modules/dashboot/css/custom.jquery-ui.min.css')?>
<?$this->template->add_css('system/application/views/modules/dashboot/css/bootstrap-dialog.min.css')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/custom.jquery-ui.min.js')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/bootstrap-dialog.min.js')?>
<?$this->template->add_css('
.section {display:none;}
#import {display:block;}
.m {margin-top:18px; margin-bottom:22px;}
.i {width:100%; border:0; margin:0; padding:0; margin-top:16px;}
', 'embed')?>

<script>
$(document).ready(function() {
	$('.nav-pills').find('li').click(function() {
		var $this = $(this);
		$this.closest('.nav').find('li').removeClass('active');
		$this.addClass('active');
		$this.closest('.row').find('.section').hide();
		var $section = $this.closest('.row').find('#'+$this.text().toLowerCase().replace(' ','-'));
		$section.show();
	});
	$('.export-link').click(function(e) {
		e.preventDefault();
		var url = $(this).attr('href');
		var $content = $('#export-content').show();
		$content.find('#export-content-url').html('<a href="'+url+'">'+url+'</a>');
		$content.find('#export-content-text').val('Loading...');
		$.get(url, function(data) {
			$content.find('#export-content-text').val(data);
		}, 'text');
	});
});
</script>
<div class="container-fluid properties">
  <div class="row">
    <aside class="col-xs-2">
	  <ul class="nav nav-pills nav-stacked">
	    <li class="active"><a href="javascript:void(null);">Import</a></li>
	    <li><a href="javascript:void(null);">Export</a></li>
	    <li><a href="javascript:void(null);">API Explorer</a></li>
	  </ul> 
    </aside>
    <section class="col-xs-10">
    	<div class="section" id="import">
    		<h4>Import</h4>
	        <p class="m">Import content and relationships from public Scalar books, raw Scalar RDF-JSON, or comma seperated values files. For more information visit the <a href="http://scalar.usc.edu/works/guide2">Scalar 2 Guide</a>'s <a href="http://scalar.usc.edu/works/guide2/advanced-topics">Advanced Topics</a> path.</p><?php
	        $path = 'system/application/plugins/transfer/index.html';
	        $get_vars = '';
	        if (!empty($book)) {
	        	$dest_url = confirm_slash(base_url()).$book->slug;
	        	$email = $login->email;
	        	$source_url = (isset($_REQUEST['source_url']) && !empty($_REQUEST['source_url'])) ? $_REQUEST['source_url'] : '';
	        	$get_vars = '?dest_url=' . $dest_url . '&dest_id=' . $email . ((!empty($source_url)) ? ('&source_url='.$source_url) : '');
	        }
	        echo '<div class="plugin transfer">';
	        if (file_exists(FCPATH.$path)) {
	        	echo '<iframe style="width:100%; min-height:700px; border:none;" src="'.confirm_slash(base_url()).$path.$get_vars.'"></iframe>'."\n";
	        } else {
	        	echo '<div class="alert alert-warning">Please contact a system administrator to install the <b>Transfer</b> plugin at <b>/system/application/plugins/transfer</b>.</div>';
	        }
	        echo '</div>';
    		?></div>
    	<div class="section" id="export"><?php 
    			$rdf_url_json = confirm_slash(base_url()).$book->slug.'/rdf/instancesof/content?format=json&rec=1&ref=1&';
    			$rdf_url_xml = confirm_slash(base_url()).$book->slug.'/rdf/instancesof/content?&rec=1&ref=1';
    		?>
    		<h4>Export</h4>
	        <p class="m">
	        	Use the buttons below to generate exports containing all pages and relationships in this work (physical media
				files are not included). This data can be used for backing up your book, for importing at a later date, or for using the data in other ways. The export
			    process may take a minute or two depending on the amount of content in the project. For more information see
			    the <a href="http://scalar.usc.edu/works/guide2/working-with-the-api">Working with the API</a> path in the <a href="http://scalar.usc.edu/works/guide2">Scalar 2 Guide</a>, or to 
			    explore the API more thoroughly head over to the API Explorer utlity.
			</p>
			<p>
	       		<a class="btn btn-default export-link" href="<?=$rdf_url_json?>" style="width:160px;">Export as RDF-JSON</a> &nbsp; &nbsp; 
  				<small>Better for using with the Scalar Transfer tool</small><br /><br />
  				<a class="btn btn-default export-link" href="<?=$rdf_url_xml?>" style="width:160px;">Export as RDF-XML</a> &nbsp; &nbsp;
  				<small>Better for working with external Semantic Web applications</small>
	     	</p>
	     	<p class="m" id="export-content">
	     		<small>URL: <span id="export-content-url"></span></small>
	     		<textarea id="export-content-text" class="form-control"></textarea>
	     	</p>
	     	<script>
	     	</script>
    	</div>
    	<div class="section" id="api-explorer" data-iframe-url="">
    		<h4>API Explorer</h4> 
    		<div class="m">
				<p>You can use this utility to:</p>
				<ul>
					<li>Generate API queries for this Scalar book</li>
					<li>Grab an excerpt of this book to copy to another using the Import tool</li>
					<li>Get word counts for specific pages, groups of pages, or the entire book</li>
				</ul> 		
    		</div><?php
	        $path = 'system/application/plugins/apiexplorer/index.html';
	        $get_vars = '?book_url='.confirm_slash(base_url()).$book->slug;
	        echo '<div class="plugin apiexplorer">';
	        if (file_exists(FCPATH.$path)) {
	        	echo '<iframe id="api-explorer-frame" style="width:100%; min-height:700px; border:none;" src="'.confirm_slash(base_url()).$path.$get_vars.'"></iframe>'."\n";
	        } else {
	        	echo '<div class="alert alert-warning">Please contact a system administrator to install the <b>API Explorer</b> plugin at <b>/system/application/plugins/apiexplorer</b>.</div>';
	        }
	        echo '</div>';
	        ?>
    	</div>
    </section>
  </div>
</div>