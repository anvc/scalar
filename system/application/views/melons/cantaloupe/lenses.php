<?if (!defined('BASEPATH')) exit('No direct script access allowed') ?>
<?php
	$this->template->add_js('system/application/views/widgets/edit/jquery.content_selector_bootstrap.js');
	$this->template->add_js('system/application/views/melons/cantaloupe/js/bootbox.min.js');
	$this->template->add_css('system/application/views/melons/cantaloupe/css/lenses.css');
	$this->template->add_js('system/application/views/melons/cantaloupe/js/scalarlensmanager.jquery.js');

?>
<div id="lenses">
	<div class="row">
		<div class="col-sm-4">
			<heading class="heading_font">
				<h1 class="clearboth heading_weight">Lenses</h1>
			</heading>
			<div id="lens-manager">
				<div class="private-lenses">
					<h3 class="heading_font heading_weight title">My Private Lenses</h3>
					<ul class="private-lenses-list">
						<!-- <li class="caption_font"><a>Private Lenses</a> <span id="private-lens-count" class="badge dark caption_font">0</span> <span class="viz-icon list"></span></li> -->
						<!-- <li class="caption_font"><a>recent stuff on the frontier</a> <span class="badge dark caption_font">80</span> <span class="viz-icon force"></span></li> -->
					</ul>
					<button type="button" class="btn btn-primary btn-xs caption_font">Add lens</button>
				</div>
				<div class="submitted-lenses">
					<h3 class="heading_font heading_weight title">My Submitted Lenses</h3>
					<ul class="submitted-lenses-list">
						<!-- <li class="caption_font"><a>submitted lenses</a> <span id="submitted-lens-count" class="badge dark caption_font">0</span> <span class="viz-icon list"></span></li> -->
					</ul>
				</div>
				<div class="public-lenses">
					<h3 class="heading_font heading_weight title">Author Lenses</h3>
					<ul class="public-lenses-list">
						<!-- <li class="caption_font"><a>Public lenses</a> <span id="public-lens-count" class="badge dark caption_font">0</span> <span class="viz-icon map"></span></li> -->
						<!-- <li class="caption_font"><a>Consuming Places</a> <span class="badge dark caption_font">67</span> <span class="viz-icon tree"></span></li>
						<li class="caption_font"><a>Contested Borderlands</a><span class="badge dark caption_font">40</span> <span class="viz-icon force"></span></li> -->
					</ul>
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
				<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12614.594369551729!2d-122.50332635000001!3d37.77483715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1592255256133!5m2!1sen!2sus" width="100%" height="450" frameborder="0" style="border:0;" allowfullscreen="" aria-hidden="false" tabindex="0"></iframe>
			</div>
		</div>
	</div>
</div>
