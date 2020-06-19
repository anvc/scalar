<?if (!defined('BASEPATH')) exit('No direct script access allowed') ?>
<?php
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

	$this->template->add_css('system/application/views/melons/cantaloupe/css/lenses.css');
	$this->template->add_js('system/application/views/melons/cantaloupe/js/scalarlensmanager.jquery.js');
	$this->template->add_js('var views='.json_encode($this->config->item('views')), 'embed');
	if ($this->config->item('reference_options')) {
		$this->template->add_js('var reference_options='.json_encode($this->config->item('reference_options')), 'embed');
	}
	$this->template->add_js('var userId="'.$login->email.'";', 'embed');
	$this->template->add_js('var rdfFields='.json_encode($this->config->item('rdf_fields')).';', 'embed');
	$this->template->add_js('var namespaces='.json_encode($this->config->item('namespaces')).';', 'embed');

?>
<div id="lenses">
	<div class="row">
		<div class="col-sm-4">
			<heading class="heading_font">
				<h1 class="clearboth heading_weight">Lenses</h1>
			</heading>
			<div id="lens-manager">
				<div class="private-lenses">
					<h3 class="heading_font heading_weight title"></h3>
					<ul class="private-lenses-list"></ul>
					<button type="button" class="btn btn-primary btn-xs caption_font">Add lens</button>
				</div>
				<div class="submitted-lenses">
					<h3 class="heading_font heading_weight title"></h3>
					<ul class="submitted-lenses-list"></ul>
				</div>
				<div class="public-lenses">
					<h3 class="heading_font heading_weight title"></h3>
					<ul class="public-lenses-list"></ul>
				</div>
			</div>
		</div>
		<div class="col-sm-8 heading_font">
			<div class="lens-list">
				<h4>Edit</h4>
				<div class="lens-list-item"></div>
			</div>
			<div class="vis-container">
				<h4>Preview</h4>
				<div style="height:450px;width:100%;background:#ccc;"></div>
			</div>
		</div>
	</div>
</div>
