<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_css(path_from_file(__FILE__).'tabs.css')?>
<?$this->template->add_js(path_from_file(__FILE__).'tabs.js')?>

<div class="select_box" id="value_selector">
<h4 class="dialog_title">Edit users</h4>
<form onsubmit="submit_value_selector($(this)); return false;">
<input type="hidden" name="section" value="" />
<input type="hidden" name="id" value="" />
Please select below.  <span id="multiple_info">Hold down <b>shift</b> (range) or <b>control</b> (single) to select multiple values.</span><br /><br />
<select id="select_box_values"></select><br /><br />
<p style="text-align:right;"><a href="javascript:;" onclick="$(this).parent().parent().parent().hide();" class="generic_button large">Cancel</a> <input type="submit" value="Save" class="generic_button large default" /></p>
</form>
</div>

<div class="dashboard">
<div class="tabs">
	<ul>
		<li><a href="#tabs-user" style="color:#7d1d1d;">My account</a></li>
		<li><a href="#tabs-style">Book properties</a></li>
		<li><a href="#tabs-users">Book users</a></li>
		<li><a href="#tabs-sharing">Sharing</a></li>
		<li><a href="#tabs-pages" style="color:#89169e;">Pages<?=((!empty($pages_not_live))?'<sup>'.$pages_not_live.'</sup>':'')?></a></li>
		<li><a href="#tabs-media" style="color:#89169e;">Media<?=((!empty($media_not_live))?'<sup>'.$media_not_live.'</sup>':'')?></a></li>
		<li><a href="#tabs-relationships" style="color:#241d7d;">Relationships<?=((!empty($replies_not_live))?'<sup>'.$replies_not_live.'</sup>':'')?></a></li>
		<li><a href="#tabs-categories" style="color:#241d7d;">Categories</a></li>
<?php
		if (!empty($plugins)):
			foreach ($plugins as $key => $obj):
?>
				<li><a href="#tabs-<?=$key?>"><?=$obj->name?></a></li>
<?php
			endforeach;
		endif;
?>
		<? if ($login_is_super): ?>
		<li><a href="#tabs-all-users" style="color:#7d1d1d;">All users</a></li>
		<li><a href="#tabs-all-books" style="color:#7d1d1d;">All books</a></li>
		<li><a href="#tabs-tools" style="color:#7d1d1d;">Tools</a></li>
		<? endif ?>
	</ul>

	<div id="tabs-user"><? if ('user'==$zone) { $this->load->view('modules/dashboard/user'); } else {echo 'Loading...';}?></div>

	<div id="tabs-style"><? if ('style'==$zone) { $this->load->view('modules/dashboard/book_style'); } else {echo 'Loading...';}?></div>

	<div id="tabs-users"><? if ('users'==$zone) { $this->load->view('modules/dashboard/book_users'); } else {echo 'Loading...';} ?></div>

	<div id="tabs-sharing"><? if ('sharing'==$zone) { $this->load->view('modules/dashboard/sharing'); } else {echo 'Loading...';} ?></div>

	<div id="tabs-pages"><? if ('pages'==$zone) { $this->load->view('modules/dashboard/pages'); } else {echo 'Loading...';} ?></div>

	<div id="tabs-media"><? if ('media'==$zone) { $this->load->view('modules/dashboard/media'); } else {echo 'Loading...';} ?></div>

	<div id="tabs-relationships"><? if ('relationships'==$zone) { $this->load->view('modules/dashboard/relationships'); } else {echo 'Loading...';} ?></div>

	<div id="tabs-categories"><? if ('categories'==$zone) { $this->load->view('modules/dashboard/categories'); } else {echo 'Loading...';} ?></div>

<?php
	if (!empty($plugins)):
		foreach ($plugins as $key => $obj):
?>
			<div id="tabs-<?=$key?>"><? if ($key==$zone) { $obj->get(); } else {echo 'Loading...';} ?></div>
<?php
		endforeach;
	endif;
	?>

	<? if ($login_is_super): ?>
	<div id="tabs-all-users"><? if ('all-users'==$zone) { $this->load->view('modules/dashboard/all-users'); } else {echo 'Loading...';} ?></div>
	<div id="tabs-all-books"><? if ('all-books'==$zone) { $this->load->view('modules/dashboard/all-books'); } else {echo 'Loading...';} ?></div>
	<div id="tabs-tools"><? if ('tools'==$zone) { $this->load->view('modules/dashboard/tools'); } else {echo 'Loading...';} ?></div>
	<? endif ?>

</div>
</div>