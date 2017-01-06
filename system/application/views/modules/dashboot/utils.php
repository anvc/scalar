<?$this->template->add_css('system/application/views/modules/dashboot/css/custom.jquery-ui.min.css')?>
<?$this->template->add_css('system/application/views/modules/dashboot/css/bootstrap-dialog.min.css')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/custom.jquery-ui.min.js')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/bootstrap-dialog.min.js')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/iframeResizer.min.js')?>
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
		if ($section.find('.i').length) {
			var $iframe = $section.find('.i:first');
			$iframe.iFrameResize({log:true, heightCalculationMethod:'documentElementScroll'});
		};
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
	        <p class="m">Import content and relationships from public Scalar books or from raw Scalar JSON or RDF data.</p><?php
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
	        	echo '<div style="padding:10px; border:solid 1px #cccccc; background-color:#eeeeee;">The <b>Transfer</b> plugin can\'t be found.  Please contact a system administrator to install the plugin in a folder named <b>transfer</b> at <b>/system/application/plugins/</b>.</div>';
	        }
	        echo '</div>';
    		?></div>
    	<div class="section" id="export"><?php 
    			$rdf_url_json = confirm_slash(base_url()).$book->slug.'/rdf/instancesof/content?format=json&rec=1&ref=1';
    			$rdf_url_xml = confirm_slash(base_url()).$book->slug.'/rdf/instancesof/content?&rec=1&ref=1';
    		?>
    		<h4>Export</h4>
	        <p class="m">
	        	Use the buttons below to generate exports containing all pages and relationships in this work (media
				files are not included). This data can be used for backup or for importing at a later date. The export
				API Explorer process may take a minute or two depending on the amount of content in the project.
			</p>
			<p>
	       		<a href="<?=$rdf_url_json?>" target="_blank"><?=$rdf_url_json?></a><br />
	       		<small>Or, <a href="<?=$rdf_url_xml?>" target="_blank">download as RDF-XML</a>.</small>
	     	</p>
    	</div>
    	<div class="section" id="api-explorer" data-iframe-url="">
    		<!-- 
    		<h4>API Explorer</h4> 
    		<p class="m">
				You can use this utility to:
				<ul>
					<li>Generate API queries for this Scalar book</li>
					<li>Grab an excerpt of this book to copy to another using the Import tool</li>
					<li>Get word counts for specific pages, groups of pages, or the entire book</li>
				</ul>  		
    		</p>
    		-->
    		<iframe class="i" src="http://scalar.usc.edu/tools/apiexplorer/"></iframe>
    	</div>
    </section>
  </div>
</div>