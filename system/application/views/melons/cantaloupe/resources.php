<?
$content = (isset($page->version_index)) ? $page->versions[0]->content : null;
if (!empty($content)) {
	$content = nl2br($content);
	echo '<p>'.$content.'</p>';
}
?>
<h2 class="resources_title heading_font heading_weight clearboth">Pages</h2>
<ul class="resources pages">
	<?
	foreach ($book_content as $row):
		if ($row->type!='composite') continue;
		$title = (!empty($row->versions[0]->title)) ? $row->versions[0]->title : '(No title)';
		$desc = (!empty($row->versions[0]->description)) ? $row->versions[0]->description : null;
	?>
	<li>
	<a class="title" href="<?=$base_uri.$row->slug?>"><?=$title?></a><br />
	<?php if ($desc) echo '<span class="desc">'.$desc.'</span>'; ?>
	</li>
	<? endforeach ?>
</ul>
<h2 class="resources_title heading_font heading_weight clearboth">Media</h2>
<ul class="resources media">
	<?
	foreach ($book_content as $row):
		if ($row->type!='media') continue;
		$title = (!empty($row->versions[0]->title)) ? $row->versions[0]->title : '(No title)';
		$desc = (!empty($row->versions[0]->description)) ? $row->versions[0]->description : null;
	?>
	<li>
	<a class="title" href="<?=$base_uri.$row->slug?>"><?=$title?></a><br />
	<?php if ($desc) echo '<span class="desc">'.$desc.'</span>'; ?>
	</li>
	<? endforeach ?>
</ul>