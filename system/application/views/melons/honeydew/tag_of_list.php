<?
if ($mode || !isset($page->versions[0]->tag_of) || empty($page->versions[0]->tag_of)) return;

$tag_of = $page->versions[$page->version_index]->tag_of;
$type = ($page->type == 'composite') ? 'page' : 'media';
?>
<!-- Tag of list -->
<div id="tag_of_list">
  <span class="inline_icon_link tag">This <?=$type?> is a tag of:</span>
  <div><?
    $count = 1;
	foreach ($tag_of as $row):
		$title =@ $row->versions[0]->title;
		if (empty($title)) $title = '(No title)';
		echo '<span>';
		echo '<a class="nopreview" href="'.$base_uri.$row->slug.'">';
		echo $title;
		echo '</a>';
		if ($count < count($page->versions[$page->version_index]->tag_of)) echo ',&nbsp; ';
		$count++;
	endforeach;
	?></div>
	<a href="<?=$base_uri?>tags"><small>View all tags</small></a>
</div>

