<?
//$this->template->add_css(path_from_file(__FILE__).'content.css');
$css = <<<EOT
html, body {height:100%;}
body {overflow:hidden; background:white !important;}
body, div {margin:0;}
.external-header {height:52px; border-bottom:solid 2px #dddddd; background:#eeeeee;}
.external-back-link {white-space:nowrap; float:left; margin-top:19px; margin-left:30px; }
.external-remove-link {white-space:nowrap; float:right; margin-right:30px;}
.external-remove-link-left {float:left; margin-top:19px; }
.logo-wrapper {float:right; list-style-type:none; margin:0px 0px 0px 0px; padding:0px 0px 0px 0px;}
.book-logo {margin-left:20px; margin-top:5px; cursor:pointer; float:left;}
.book-logo img {height:43px;}
.scalar-logo {
	margin-left:20px; margin-top:6px; cursor:pointer;
	background-image:url("images/scalar_logo_small.png"); background-repeat:no-repeat;
	width:32px; height:50px; float:left;
}
.external-page {position:absolute; top:54px; left:0px; right:0px; bottom:0px;}
.external-page iframe {width:100%; height:100%; margin:0; padding:0; border:0; overflow:auto; background:white;}
EOT;
// Place Cantaloupe stylesheet(s) here for default look and feel (e.g., the header)?
$this->template->add_css($css, 'embed');
?>
<div class="external-header">
	<div class="external-back-link">
		<a href="<?=$prev?>" class="path_nav_previous_btn"></a>
		<a href="<?=$prev?>">Return to <?=$book->title?></a>
	</div>
	<div class="external-remove-link">
		<div class="external-remove-link-left"><a href="<?=$link?>">Remove this header</a></div>
		<ol class="logo-wrapper">
<? if (!empty($book->thumbnail)): ?>
			<li class="book-logo"><a href="<?=$base_uri.$book->slug?>"><img src="<?=$base_uri.$book->thumbnail?>" /></a></li>
<? else: ?>
			<li class="scalar-logo" onclick="document.location.href='<?=base_url()?>';"></li>
<? endif; ?>
		</ol>
	</div>
</div>

<div class="external-page">
	<iframe src="<?=$link?>"></iframe>
</div>