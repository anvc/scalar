<?if (!defined('BASEPATH')) exit('No direct script access allowed') ?>
<?php
	$this->template->add_css('system/application/views/widgets/ckeditor/custom.css');
	$this->template->add_css('system/application/views/widgets/spectrum/spectrum.css');
	$this->template->add_css('system/application/views/widgets/edit/content_selector.css');
	$this->template->add_js('system/application/views/widgets/ckeditor/ckeditor.js');
	
	$this->template->add_js('if ( window.CKEDITOR && ( !CKEDITOR.env.ie || CKEDITOR.env.version > 7 ) ){CKEDITOR.env.isCompatible = true;}','embed'); 
	
	$this->template->add_js('system/application/views/widgets/edit/jquery-ui-custom/jquery-ui.min.js');
	$this->template->add_js('system/application/views/widgets/edit/jquery.ui.touch-punch.min.js');
	$this->template->add_js('system/application/views/widgets/edit/jquery.select_view.js');
	$this->template->add_js('system/application/views/widgets/edit/jquery.add_metadata.js');
	$this->template->add_js('system/application/views/widgets/edit/jquery.content_selector_bootstrap.js');
	$this->template->add_js('system/application/views/widgets/edit/jquery.predefined.js');
	$this->template->add_js('system/application/views/widgets/spectrum/spectrum.js');
	$this->template->add_js('system/application/views/widgets/spinner/spin.min.js');

	$this->template->add_js('system/application/views/arbors/html5_RDFa/js/jquery.rdfquery.rules-1.0.js');
	$this->template->add_js('system/application/views/arbors/html5_RDFa/js/jquery.RDFa.js');
	$this->template->add_js('system/application/views/arbors/html5_RDFa/js/form-validation.js?v=2');
	$this->template->add_js('system/application/views/widgets/nav/jquery.scalarrecent.js');
	$this->template->add_js('system/application/views/widgets/cookie/jquery.cookie.js');
	$this->template->add_js('system/application/views/widgets/api/scalarapi.js');

	$this->template->add_js('system/application/views/melons/cantaloupe/js/tinysort.min.js');
	$this->template->add_css('system/application/views/melons/cantaloupe/css/editorial_path.css');
	$this->template->add_js('system/application/views/melons/cantaloupe/js/scalareditorialpath.jquery.js');
	$this->template->add_js('var views='.json_encode($this->config->item('views')), 'embed');
?> 

<div id="editorialPath">
	<div class="row">
		<div class="col-xs-12 col-md-9">
			<heading class="heading_font" id="pathHeading">
				<h1 class="clearboth heading_weight">Editorial Path</h1>
				<p>This page presents a simplified view of all content in the book, designed to provide quick access for editing. You can <strong>directly edit any text below</strong> and changes will be saved immediately.</p>
				<div id="pathOrderSelectionContainer">
					<span class="text-muted">Content order: </span>
				</div>
			</heading>
			<div id="editorialPathContents">
			</div>
		</div>
		<div class="col-md-3 hidden-sm hidden-xs" id="editorialOutlinePanel">
			<div>
				<button class="btn btn-default heading_font heading_weight btn-block" id="editorialOutlineHeader" type="button" data-toggle="collapse" data-target="#editorialOutline" aria-expanded="true" aria-controls="editorialOutline">
				  Outline
				  <span class="caret pull-right"></span>
				</button>
				<div class="collapse in" id="editorialOutline" aria-labelledby="editorialOutlineHeader">
					<ul class="nav">
					</ul>
				</div>
			</div>
		</div>
</div>