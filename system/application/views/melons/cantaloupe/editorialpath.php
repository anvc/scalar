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
	$this->template->add_js('system/application/views/melons/cantaloupe/js/bootbox.min.js');
	$this->template->add_js('system/application/views/melons/cantaloupe/js/fuse.min.js');
	$this->template->add_js('system/application/views/widgets/edit/jquery.predefined.js');
	$this->template->add_js('system/application/views/widgets/spectrum/spectrum.js');
	$this->template->add_js('system/application/views/widgets/spinner/spin.min.js');

	$this->template->add_js('var fullName="'.$login->fullname.'";', 'embed');

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
	$this->template->add_css('system/application/views/widgets/ckeditor/custom.css');
	$this->template->add_css('system/application/views/widgets/ckeditor/plugins/scalar/styles/scalar.css');
	if ($this->config->item('reference_options')) {
		$this->template->add_js('var reference_options='.json_encode($this->config->item('reference_options')), 'embed');
	}
	$this->template->add_js('var userId="'.$login->email.'";', 'embed');
	$this->template->add_js('var rdfFields='.json_encode($this->config->item('rdf_fields')).';', 'embed');
	$this->template->add_js('var namespaces='.json_encode($this->config->item('namespaces')).';', 'embed');

?> 
<div id="editorialPath">
	<div id="editorialQueries">
		<h4 class="heading_font heading_weight">Queries</h4>
		<button id="addNewQuery" class="pull-right btn">Add new</button>
		<div id="addNewQueryForm" class="clearfix"><textarea placeholder="Enter query..." class="form-control" id="addNewQueryFormText"></textarea><button type="button" class="pull-right btn btn-sm">Submit</button></div>
		<div class="queries">
		</div>
		<div class="resolvedQueries">
			<a class="queryDropdownToggle" href="#">
				<small class="glyphicon glyphicon-triangle-right dropdownCaret" aria-hidden="true" data-toggle="collapse" data-target="#resolvedQueries" aria-expanded="false" aria-controls="resolvedQueries"></small> Resolved queries (<span class="queryCount">0</span>)
			</a>
			<div class="collapse queries" id="resolvedQueries">
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-xs-12 col-md-9">
			<heading class="heading_font" id="pathHeading">
				<h1 class="clearboth heading_weight">Editorial Path</h1>
				<p>This page presents a simplified view of all content in the book, designed to provide quick access for editing. You can <strong>directly edit any text below</strong> and changes will be saved immediately.</p>
				<div id="pathOrderSelectionContainer">
					<span class="text-muted">Content order: </span>
					<div class="dropdown" id="contentOrderDropdown">
					  <button class="btn btn-default dropdown-toggle" type="button" id="contentOrderDropdownButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
					    <span class="caret pull-right"></span>
					    <span class="text">Name</span>
					  </button>
					  <ul class="dropdown-menu dropdown-menu-left" aria-labelledby="contentOrderDropdownButton">
					    <li class="active"><a href="#" data-sort="Name">Name</a></li>
					    <li><a href="#" data-sort="Type">Type</a></li>
					    <li><a href="#" data-sort="LastModifiedDateAsc">Edit date ascending</a></li>
					    <li><a href="#" data-sort="LastModifiedDateDesc">Edit date descending</a></li>
					  </ul>
					</div>
				</div>
			</heading>
			<div id="editorialPathContents">
			</div>
		</div>
		<div class="col-md-3 hidden-sm hidden-xs" id="editorialSidePanel">
			<div>
				<div class="dropdown">
					<button class="btn btn-default heading_font heading_weight btn-block dropdown-toggle" id="editorialSideHeader" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					  <span class="caret pull-right"></span>
					  <span id="panelDropdownText">Outline</span>
					</button>
					<ul class="dropdown-menu caption_font" aria-labelledby="editorialSideHeader">
						<li><a role="button" href="#editorialOutline" aria-expanded="true" aria-controls="editorialOutline">Outline</a></li>
						<li><a role="button" href="#editorialContentFinder" aria-expanded="false" aria-controls="editorialContentFinder">Content Finder</a></li>
					</ul>
				</div>
				<div id="editorialOutline" class="collapse in caption_font">
					<ul class="nav">
					</ul>
				</div>
				<div id="editorialContentFinder" class="collapse">
					<p class="heading_font">Search below to quickly find and navigate to content in the editorial path.</p>
					<form id="contentFinder" class="form-inline">
						<div class="form-group" id="filterDropdown">
							<button class="btn btn-default dropdown-toggle form-control input-sm" id="filterTypeDropdown" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							  <span class="caret pull-right"></span>
							  <small id="filterTypeText"></small>
							</button>
							<ul class="dropdown-menu caption_font" aria-labelledby="filterTypeDropdown">
							</ul>
						</div>
						<div class="form-group">
						    <input type="text" class="form-control input-sm" id="editorialPathSearchText" placeholder="Search by title">
						</div>
					</form>
					<ul id="matchedNodes">

					</ul>
				</div>
				<div class="editorialSidePanelLoaderIndicator"><div class="spinner_container"></div></div>
			</div>
		</div>
</div>