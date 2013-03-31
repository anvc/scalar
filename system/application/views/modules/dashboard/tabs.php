<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_css(path_from_file(__FILE__).'tabs.css')?>
<?$this->template->add_js(path_from_file(__FILE__).'tabs.js')?>
<?$this->template->add_css(path_from_file(__FILE__).'common.css')?>

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

<form action="<?=confirm_slash(base_url())?>system/dashboard" method="get">
<select name="book_id" onchange="$(this).parent().submit();">
<option value="0">Select a book to manage</option>
<?
foreach ($books as $row) {
	echo '<option value="'.$row->book_id.'"'.(($book->book_id==$row->book_id)?' SELECTED':'').'>';
	echo $row->title;
	echo '</option>';
}
?>
</select>
<input type="hidden" name="zone" value="style" />
</form>
<br />

<div class="dashboard">

<div class="tabs">
	<ul>
		<li><a href="#tabs-user" style="color:#7d1d1d;">My account</a></li>
		<li><a href="#tabs-style">Book properties</a></li>
		<li><a href="#tabs-users">Book users</a></li>
		<li><a href="#tabs-pages" style="color:#89169e;">Pages<?=((!empty($pages_not_live))?'<sup>'.$pages_not_live.'</sup>':'')?></a></li>
		<li><a href="#tabs-media" style="color:#89169e;">Media<?=((!empty($media_not_live))?'<sup>'.$media_not_live.'</sup>':'')?></a></li>
		<li><a href="#tabs-paths" style="color:#241d7d;">Paths<?=((!empty($paths_not_live))?'<sup>'.$paths_not_live.'</sup>':'')?></a></li>
		<li><a href="#tabs-tags" style="color:#241d7d;">Tags<?=((!empty($tags_not_live))?'<sup>'.$tags_not_live.'</sup>':'')?></a></li>
		<li><a href="#tabs-annotations" style="color:#241d7d;">Annotations<?=((!empty($annotations_not_live))?'<sup>'.$annotations_not_live.'</sup>':'')?></a></li>
		<li><a href="#tabs-replies" style="color:#241d7d;">Comments<?=((!empty($replies_not_live))?'<sup>'.$replies_not_live.'</sup>':'')?></a></li>
		<!--<li><a href="#tabs-api">API</a></li>-->
		<? if ($login_is_super): ?>
		<li><a href="#tabs-all-users" style="color:#7d1d1d;">All users</a></li>
		<li><a href="#tabs-all-books" style="color:#7d1d1d;">All books</a></li>
		<? endif ?>			
	</ul>
	
	<div id="tabs-user"><? if ('user'==$zone) { $this->load->view('modules/dashboard/user'); } else {echo 'Loading...';}?></div>
	
	<div id="tabs-style"><? if ('style'==$zone) { $this->load->view('modules/dashboard/book_style'); } else {echo 'Loading...';}?></div>	
	
	<div id="tabs-users"><? if ('users'==$zone) { $this->load->view('modules/dashboard/book_users'); } else {echo 'Loading...';} ?></div>	
	
	<div id="tabs-pages"><? if ('pages'==$zone) { $this->load->view('modules/dashboard/pages'); } else {echo 'Loading...';} ?></div>	

	<div id="tabs-media"><? if ('media'==$zone) { $this->load->view('modules/dashboard/media'); } else {echo 'Loading...';} ?></div>		

	<div id="tabs-paths"><? if ('paths'==$zone) { $this->load->view('modules/dashboard/paths'); } else {echo 'Loading...';} ?></div>	

	<div id="tabs-tags"><? if ('tags'==$zone) { $this->load->view('modules/dashboard/tags'); } else {echo 'Loading...';} ?></div>	
	
	<div id="tabs-annotations"><? if ('annotations'==$zone) { $this->load->view('modules/dashboard/annotations'); } else {echo 'Loading...';} ?></div>

	<div id="tabs-replies"><? if ('replies'==$zone) { $this->load->view('modules/dashboard/replies'); } else {echo 'Loading...';} ?></div>

	<!--
	<div id="tabs-api"><? if ('api'==$zone) { $this->load->view('modules/dashboard/api'); } else {echo 'Loading...';} ?></div>
	-->

	<? if ($login_is_super): ?>	
	<div id="tabs-all-users"><? if ('all-users'==$zone) { $this->load->view('modules/dashboard/all-users'); } else {echo 'Loading...';} ?></div>	
	<div id="tabs-all-books"><? if ('all-books'==$zone) { $this->load->view('modules/dashboard/all-books'); } else {echo 'Loading...';} ?></div>	
	<? endif ?>	

</div>
</div>