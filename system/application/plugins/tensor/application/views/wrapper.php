<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<link id="base_url" href="<?php echo base_url() ?>">
<link id="proxy_url" href="<?php if (isset($proxy_url)) echo $proxy_url ?>">
<title><?php echo $title ?></title>
<?php echo $styles ?>
<?php echo $scripts_header ?>
</head>
<body>
<?php echo $content ?>
</body>
</html>