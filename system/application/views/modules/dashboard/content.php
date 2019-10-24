<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_css('system/application/views/arbors/admin/jquery-ui.min.css')?>
<?$this->template->add_css('system/application/views/arbors/admin/admin.css')?>
<?$this->template->add_css('system/application/views/modules/cover/title.css')?>
<?$this->template->add_css('system/application/views/modules/cover/login.css')?>
<?$this->template->add_css('system/application/views/modules/dashboard/tabs.css')?>
<?$this->template->add_js('system/application/views/arbors/admin/jquery-3.4.1.min.js')?>
<script src="https://code.jquery.com/jquery-migrate-3.1.0.js"></script>
<?$this->template->add_js('system/application/views/arbors/admin/jquery-ui.min.js')?>
<?$this->template->add_js('system/application/views/arbors/admin/admin.js')?>
<?$this->template->add_js('system/application/views/modules/dashboard/tabs.js')?>

<?
$active_dashboard = $this->config->item('active_dashboard');
if ('dashboard'==$active_dashboard):
?>
<div style="position:absolute; top:0px; left:0px; width:100%;">
	<div style="background-color:#f3f7b1; color:#444444; font-size:0.85rem; width:400px; border-radius:5px; margin:2px auto 0px auto; text-align:center; padding-top:4px; padding-bottom:4px;">
		We&rsquo;ve upgraded the Dashboard! Want to <a href="?dashboard=dashboot&book_id=<?=((!empty($book))?$book->book_id:0)?>&zone=style#tabs-style" style="text-decoration:underline;">try it out</a>?
	</div>
</div>
<? endif; ?>

<div class="system_wrapper system_cover">
<div class="cover">
<? $this->load->view('modules/cover/login') ?>
<h2 class="title dashboard_title">
<form action="<?=confirm_slash(base_url())?>system/dashboard" method="get" class="book_form">
<select name="book_id" onchange="$(this).parent().trigger('submit');" style="margin:0;max-width:300px;">
<option value="0">Select a book to manage</option>
<?
foreach ($my_books as $row) {
	echo '<option value="'.$row->book_id.'"'.((!empty($book)&&$book->book_id==$row->book_id)?' SELECTED':'').'>';
	echo strip_tags($row->title);
	echo '</option>';
}
?>
</select>
<input type="hidden" name="zone" value="style" />
</form>
<?=$cover_title?>
</h2>
</div>
</div>

<div class="system_wrapper">
<div class="content">

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
				if (!is_object($obj)) continue;
				echo '<li><a href="#tabs-'.$key.'">'.$obj->name.'</a></li>'."\n";
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
		if (!is_object($obj)) continue;
			echo '<div id="tabs-'.$key.'">';
			if ($key==$zone) { $obj->get(); } else {echo 'Loading...';}
			echo '</div>'."\n";
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

</div>
</div>
