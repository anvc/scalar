<?
// Define page style based on precedence (book -> current path -> page)
$title = $description = $color = $primary_role = '';
$background = $default_view = $style = $js = null;
$is_new = true;
if (isset($book) && !empty($book)) {
	$title = $book->title;
	if (!empty($book->background)) $background = trim($book->background);
	if (!empty($book->custom_style)) $style .= $book->custom_style."\n";
	if (!empty($book->custom_js)) $js .= $book->custom_js."\n";
}
if (isset($page->versions) && isset($page->versions[$page->version_index]->has_paths) && !empty($page->versions[$page->version_index]->has_paths)) {
	if (!empty($page->versions[$page->version_index]->has_paths[0]->background)) $background = trim($page->versions[$page->version_index]->has_paths[0]->background);
	if (!empty($page->versions[$page->version_index]->has_paths[0]->custom_style)) $style .= trim($page->versions[$page->version_index]->has_paths[0]->custom_style)."\n";
	if (!empty($page->versions[$page->version_index]->has_paths[0]->custom_scripts)) $js .= trim($page->versions[$page->version_index]->has_paths[0]->custom_scripts)."\n";		
}
if (isset($page->version_index)) {
	$title = $page->versions[$page->version_index]->title;
	$description = $page->versions[$page->version_index]->description;
	$color = $page->color;
	$primary_role = $page->primary_role;
	if (!empty($page->background)) $background = trim($page->background);
	if (!empty($page->default_view)) $default_view = $page->default_view;
	if (!empty($page->custom_style)) $style .= $page->custom_style."\n";
	if (!empty($page->custom_scripts)) $js .= $page->custom_scripts."\n";		
	$is_new = false;
}
if (isset($mode) && !empty($mode)) $background = null;
echo doctype('html5')."\n"
?>
<html>
<head>
<title property="dc:title"><?=strip_tags($title)?></title>
<? if (!empty($description)): ?>
<meta name="Description" content="<?=htmlspecialchars(strip_tags($description))?>" />
<? endif ?>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<? if (!$book->display_in_index || $is_new || !empty($version_datetime)): ?>
<meta name="robots" content="noindex, nofollow">
<? endif ?>
<? if (isset($page) && !empty($page)): ?>
<link rel="canonical" href="<?=confirm_slash($base_uri).$page->slug?>" />
<? endif ?>
<link rel="shortcut icon" href="<?=confirm_slash($app_root)?>views/arbors/html/favicon_16.gif" />
<link rel="apple-touch-icon" href="<?=confirm_slash($app_root)?>views/arbors/html/favicon_114.jpg" />
<? if (!empty($view)): ?>
<link id="default_view" href="<?=('vis'==$view)?$viz_view:$view?>" />
<? endif ?>
<? if (!empty($color)): ?>
<link id="color" href="<?=$color?>" />
<? endif ?>
<? if (!empty($primary_role)): ?>
<link id="primary_role" href="<?=$primary_role?>" />
<? endif ?>
<link id="parent" href="<?=$base_uri?>" />
<link id="approot" href="<?=confirm_slash(base_url())?>system/application/" />
<? if ($login->is_logged_in): ?>
<link id="logged_in" href="<?=confirm_slash(base_url())?>system/users/<?=$login->user_id?>" />
<? endif ?>
<? if ($login_is_super || $this->users->is_a($user_level,'commentator')): ?>
<link id="user_level" href="scalar:<?=(($login_is_super)?'Author':ucwords($user_level))?>" />
<? endif ?>
<link id="flowplayer_key" href="<?=$this->config->item('flowplayer_key')?>" />
<link id="soundcloud_id" href="<?=$this->config->item('soundcloud_id')?>" />
<link id="CI_elapsed_time" href="<?php echo $this->benchmark->elapsed_time()?>" />
<? if (!empty($_styles)) echo $_styles?>
<?=template_script_tag_relative(__FILE__, 'jquery-1.7.min.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'common.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'soundcloudsdk.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'soundcloudapi.js')."\n"?>
<?="<script type=\"text/javascript\" src=\"https://maps.googleapis.com/maps/api/js?key=".$this->config->item('google_maps_key')."\"></script>"."\n"?>
<?=template_script_tag_relative(__FILE__, 'yepnope.1.5.3-min.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'yepnope.css.js')."\n"?>
<? if (!empty($_scripts)) echo $_scripts?>
<?
if (!$mode && !empty($style)):
echo '<style>'."\n";
echo $style."\n";
echo '</style>'."\n";
endif;
if (!$mode && !empty($js)):
echo '<script>'."\n";
echo $js."\n";
echo '</script>'."\n";
endif;
?>
</head>
<body<?=(!empty($background))?' style="background-image:url('.str_replace(' ','%20',abs_url($background,$base_uri)).');"':''?>>

<div class="left">
<?$this->load->view('melons/honeydew/nav')?>
</div>

<div class="middle cover">
<?php 
$this->load->view('modules/cover/login');
$this->load->view('modules/cover/title');
?>
</div>

<div class="middle" id="middle_column">
<?php
$this->load->view('melons/honeydew/pathbar');
$this->load->view('melons/honeydew/noticebar');
echo '<div class="content" id="content_wrapper">'."\n";
echo $content;
$this->load->view('melons/honeydew/path_of_list');
$this->load->view('melons/honeydew/tag_of_list');
$this->load->view('melons/honeydew/annotation_of_list');
$this->load->view('melons/honeydew/reply_of_list');
$this->load->view('melons/honeydew/referenced_list');
$this->load->view('melons/honeydew/reply_list');
$this->load->view('melons/honeydew/pathbar_bottom');
$this->load->view('melons/honeydew/background_audio');
echo "</div>\n";
$this->load->view('melons/honeydew/tagbar');
?>
</div>

<div class="middle footer">
<?$this->load->view('melons/honeydew/footer')?>
</div>

<div class="middle editbar">
<?$this->load->view('melons/honeydew/editbar')?>
</div>

</body>
</html>