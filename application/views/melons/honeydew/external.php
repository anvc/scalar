<?
$this->template->add_css(path_from_file(__FILE__).'content.css');
$this->template->add_css(path_from_file(__FILE__).'external.css');
if (isset($book->stylesheet) && !empty($book->stylesheet)) $this->template->add_css(path_from_file(__FILE__).'themes/'.$book->stylesheet.'.css');
?>
<div class="outside-header">
	<div class="outside-back-link">
		<a href="<?=filter_var(str_replace('javascript:','',$prev),FILTER_SANITIZE_URL)?>" class="path_nav_previous_btn"></a>
		<a href="<?=filter_var(str_replace('javascript:','',$prev),FILTER_SANITIZE_URL)?>">Return to <?=$book->title?></a>
	</div>
	<div class="outside-remove-link">
		<div class="outside-remove-link-left"><a href="<?=filter_var(str_replace('javascript:','',$link),FILTER_SANITIZE_URL)?>">Remove this header</a></div>
		<ol class="logo-wrapper">
<? if (!empty($book->thumbnail)): ?>
			<li class="book-logo"><a href="<?=$base_uri.$book->slug?>"><img src="<?=$base_uri.$book->thumbnail?>" /></a></li>
<? else: ?>
			<li class="scalar-logo" onclick="document.location.href='<?=base_url()?>';"></li>
<? endif; ?>
		</ol>
	</div>
</div>

<div class="outside-page">
	<iframe id="external-iframe" src="<?=filter_var(str_replace('javascript:','',$link),FILTER_SANITIZE_URL)?>"></iframe>
</div>
