<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?=doctype('html5')."\n"?>
<html>
<head>
<title><?=strip_tags($title)?></title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="ROBOTS" content="NOINDEX, NOFOLLOW">
<? if (!empty($_meta)) echo $_meta."\n"?>
<?=template_link_tag_relative(__FILE__, 'jquery-ui-1.8.12.custom.css')."\n"?>
<?=template_link_tag_relative(__FILE__, 'admin.css')."\n"?>
<? if (!empty($_styles)) echo $_styles?>
<?=template_script_tag_relative(__FILE__, 'jquery-1.7.min.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'jquery-ui-1.8.12.custom.min.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'admin.js')."\n"?>
<? if (!empty($_scripts)) echo $_scripts?>
</head>
<body>

<?=((!empty($cover))?$cover:'')?>

<div class="system_wrapper">
	<div class="content">
	<?=$content?>
	</div>
	<br clear="both" />
</div>

</body>
</html>