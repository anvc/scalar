<?
$this->template->add_css(path_from_file(__FILE__).'content.css');
$this->template->add_css(path_from_file(__FILE__).'external.css');
if (isset($book->stylesheet) && !empty($book->stylesheet)) $this->template->add_css(path_from_file(__FILE__).'themes/'.$book->stylesheet.'.css');
?>
<script>
function checkCross() {
	var url = "<?=$link?>";
	var iframe = document.getElementById("external-iframe");
	var seen_page_before = document.getElementById('seen_page_before');
	try {
		var loc = iframe.contentDocument.location.href;
		console.log(loc);
	} catch(e) {
		if ('1'==seen_page_before.value) {
			seen_page_before.value = '0';
			if (document.referrer.length) document.location = document.referrer;
		} else {
			seen_page_before.value = '1';
			document.location = url;
		}
	}
}
</script>
<form style="display:none;"><input type="hidden" id="seen_page_before" name="seen_page_before" value="0" /></form>
<div class="outside-header">
	<div class="outside-back-link">
		<a href="<?=$prev?>" class="path_nav_previous_btn"></a>
		<a href="<?=$prev?>">Return to <?=$book->title?></a>
	</div>
	<div class="outside-remove-link">
		<div class="outside-remove-link-left"><a href="<?=$link?>">Remove this header</a></div>
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
	<iframe id="external-iframe" onload="checkCross()" src="<?=$link?>"></iframe>
</div>
