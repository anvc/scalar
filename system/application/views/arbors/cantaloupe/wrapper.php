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
echo '<?xml version="1.0" encoding="UTF-8"?>'."\n";
?>
<!DOCTYPE html>
<html xml:lang="en" lang="en" xmlns:scalar="http://scalar.usc.edu/2012/01/scalar-ns#" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:sioc="http://rdfs.org/sioc/ns#" xmlns:oac="http://www.openannotation.org/ns/" xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#">
<head>
<title><?=strip_tags($title)?></title>
<base href="<?=$base_uri.$page->slug.'.'.$page->versions[$page->version_index]->version_num?>" />
<meta name="description" content="<?=htmlspecialchars(strip_tags($description))?>" />
<meta name="viewport" content="width=620, maximum-scale=1.0" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<? if (!$book->display_in_index || $is_new): ?>
<meta name="robots" content="noindex, nofollow">
<? endif ?>
<? if (!empty($view)): ?>
<link id="default_view" rel="scalar:default_view" href="<?=('vis'==$view)?$viz_view:$view?>" />
<? endif ?>
<? if (!empty($color)): ?>
<link id="color" rel="scalar:color" href="<?=$color?>" />
<? endif ?>
<? if (!empty($primary_role)): ?>
<link id="primary_role" rel="scalar:primary_role" href="<?=$primary_role?>" />
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
<?=template_link_tag_relative(__FILE__, '../../modules/chrome/cantaloupe/css/reset.css')."\n"?>
<?=template_link_tag_relative(__FILE__, '../../modules/chrome/cantaloupe/css/common.css')."\n"?>
<?=template_link_tag_relative(__FILE__, '../../modules/chrome/cantaloupe/css/responsive.css')."\n"?>
<? if (!empty($_styles)) echo $_styles?>
<?=template_link_tag_relative(__FILE__, 'css/jquery-ui-1.8.12.custom.css')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/jquery-1.7.min.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/jquery-ui-1.8.12.custom.min.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/yepnope.1.5.3-min.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/yepnope.css.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/raphael-min.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/scalarheader.jquery.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/scalarpage.jquery.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/scalarmedia.jquery.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/scalarpinwheel.jquery.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/main.js')."\n"?>
<? if (!empty($_scripts)) echo $_scripts?>
</head>
<body<?=(!empty($background))?' style="background-image:url('.str_replace(' ','%20',abs_url($background,$base_uri)).');"':''?>>

<?php echo $vis ?>

<?php echo $content ?>

</body>
</html>