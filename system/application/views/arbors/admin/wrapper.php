<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?=doctype('html5')."\n"?>
<html lang="en">
<head>
<title><?=strip_tags($title)?></title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<? if (isset($norobots)&&$norobots) echo '<meta name="robots" content="noindex, nofollow">'."\n"; ?>
<link rel="shortcut icon" href="<?=confirm_slash($app_root)?>views/arbors/admin/favicon_16.gif" />
<link rel="apple-touch-icon" href="<?=confirm_slash($app_root)?>views/arbors/admin/favicon_114.jpg" />
<? if (!empty($_meta)) echo $_meta."\n"?>
<link id="approot" href="<?=confirm_slash(base_url())?>system/application/" />
<link id="sysroot" href="<?=confirm_slash(base_url())?>" />
<? if (!empty($_links)) echo $_links."\n"?>
<? if (!empty($_styles)) echo $_styles?>
<? if (!empty($_scripts)) echo $_scripts?>
</head>
<body>

<?php
echo ((isset($cover)&&!empty($cover))?$cover."\n\n":'');

echo $content;
?>

</body>
</html>