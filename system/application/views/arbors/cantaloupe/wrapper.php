<?
$title = '';
if (isset($book) && !empty($book)) {
	$title = $book->title;
}
if (isset($page->version_index)) {
	$title = $page->versions[$page->version_index]->title;
	$description = $page->versions[$page->version_index]->description;
}
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
<?=template_link_tag_relative(__FILE__, '../../modules/chrome/cantaloupe/css/reset.css')."\n"?>
<?=template_link_tag_relative(__FILE__, '../../modules/chrome/cantaloupe/css/common.css')."\n"?>
<? if (!empty($_styles)) echo $_styles?>
<?=template_link_tag_relative(__FILE__, 'css/jquery-ui-1.8.12.custom.css')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/jquery-1.7.min.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/jquery-ui-1.8.12.custom.min.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/yepnope.1.5.3-min.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/yepnope.css.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/main.js')."\n"?>
<? if (!empty($_scripts)) echo $_scripts?>
</head>
<body>

<?php echo $vis ?>

<?php echo $content ?>

</body>
</html>