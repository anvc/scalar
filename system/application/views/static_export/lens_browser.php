<?php
/**
 * Static export — body of the "Browse Lenses" page (<export-root>/manage_lenses/).
 *
 * The live site's equivalent is melons/cantaloupe/manage_lenses.php, and this is deliberately
 * the same markup: scalarlensmanager.jquery.js addresses every one of these hooks by selector
 * — '#lens-manager', the four '.*-lenses-list' <ul>s, '.lens-edit-container',
 * '.non-ideal-state-message', '.visualization', and the bare <heading> it appends its
 * explanatory paragraph to. What differs is only what a static export cannot carry:
 *
 *   - The stylesheets and scripts the live view registers with $this->template->add_*() are
 *     emitted by page.php instead, which is where an exported page's <head> is built.
 *   - The icon is addressed through $asset_root rather than a fixed '../', since the page's
 *     depth below the export root is page.php's to know.
 *
 * Everything the manager does that needs a server is already inert without one: no
 * <link id="logged_in"> means loggedIn is false, which suppresses the "Add lens" button and
 * leaves the editor read-only (ScalarLenses.checkSavePrivileges()), and no
 * <link id="user_level"> means the submitted-lens review controls stay hidden. Readers can
 * still open any public lens, retune it and watch the visualization redraw — resolved locally
 * by the bridge — they just cannot save the result back.
 *
 * Wrapped in the div CodeIgniter's template library adds around a view rendered into the
 * content region (see Template::add_html()), because common.css targets .ci-template-html.
 *
 * Variables:
 *   $asset_root  string — relative path from this page's directory to the export root
 */
?>
<div class="ci-template-html manage_lenses-page">
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
					<img src="<?= $asset_root ?>system/application/views/melons/cantaloupe/images/icon_lens_lrg.png" alt="Lens icon"/>
					<p>This project has no public lenses.</p>
				</div>
				<div class="page-lens-editor"></div>
			</div>
			<div class="lens-vis-container">
				<div class="visualization"></div>
			</div>
		</div>
	</div>
</div>
</div>
