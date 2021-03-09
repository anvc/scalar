<?if (!defined('BASEPATH')) exit('No direct script access allowed') ?>
<?php
	$this->template->add_js('system/application/views/widgets/api/scalarapi.js');
	$this->template->add_js('system/application/views/widgets/edit/jquery.content_selector_bootstrap.js');
	$this->template->add_css('system/application/views/widgets/edit/content_selector.css');
	$this->template->add_js('system/application/views/melons/cantaloupe/js/bootbox.min.js');
	$this->template->add_css('system/application/views/melons/cantaloupe/css/lenses.css');
	$this->template->add_js('system/application/views/melons/cantaloupe/js/scalarlensmanager.jquery.js');
	$this->template->add_js('system/application/views/melons/cantaloupe/js/scalarvisualizations.jquery.js');
	$this->template->add_css('system/application/views/melons/cantaloupe/css/scalarvis.css');
	$this->template->add_js('system/application/views/widgets/spinner/spin.min.js');
?>
<div id="lenses">
	<div class="row">
		<div class="col-sm-4">
			<heading class="heading_font">
				<h1 class="clearboth heading_weight">Lenses</h1>
			</heading>
			<div id="lens-manager">
				<div class="my-private-lenses">
					<h3 class="heading_font heading_weight title">My Private Lenses</h3>
					<ul class="my-private-lenses-list"></ul>
				</div>
				<div class="other-private-lenses">
					<h3 class="heading_font heading_weight title">Other Private Lenses</h3>
					<ul class="other-private-lenses-list"></ul>
				</div>
				<div class="submitted-lenses">
					<h3 class="heading_font heading_weight title">Submitted Lenses</h3>
					<ul class="submitted-lenses-list"></ul>
				</div>
				<div class="public-lenses">
					<h3 class="heading_font heading_weight title">Public Lenses</h3>
					<ul class="public-lenses-list"></ul>
				</div>
			</div>
		</div>
		<div class="col-sm-8 heading_font">
			<div class="lens-edit-container">
				<div class="non-ideal-state-message caption_font">
					<img src="../system/application/views/melons/cantaloupe/images/icon_lens_lrg.png" alt="Lens icon"/>
					<p>Sign in and select or create a lens to begin.</p>
				</div>
				<div class="page-lens-editor"></div>
			</div>
			<div class="lens-vis-container">
				<div class="visualization"></div>
			</div>
		</div>
	</div>
</div>
