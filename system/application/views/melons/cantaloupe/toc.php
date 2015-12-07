<?php
$title = (isset($page->version_index)) ? $page->versions[0]->title : null;
if (empty($title)) {
	echo '<h1 class="toc_title heading_font heading_weight clearboth">Table of Contents</h1>'."\n";
}
$content = (isset($page->version_index)) ? $page->versions[0]->content : null;
if (!empty($content)) {
	$content = nl2br($content);
	echo '<p>'.$content.'</p>'."\n";;
}
?>
<ol class="toc">
	<?
	foreach ($book_versions as $row):
		$title = (!empty($row->versions[0]->title)) ? $row->versions[0]->title : '(No title)';
	?>
	<li>
	<a href="<?=$base_uri.$row->slug?>"><?=$title?></a>
	</li>
	<? endforeach ?>
</ol>
