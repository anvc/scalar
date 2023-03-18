<?
if ($mode || !isset($page->versions[0]->reply_of) || empty($page->versions[0]->reply_of)) return;

$reply_of = $page->versions[$page->version_index]->reply_of;
$type = ($page->type == 'composite') ? 'page' : 'media';
?>
<!-- Reply of list -->
<div id="reply_of_list">
  <span class="inline_icon_link reply">This <?=$type?> comments on:</span>
  <div><?
    $count = 1;
	foreach ($reply_of as $row):
		$title =@ $row->versions[0]->title;
		$datetime =@ date('j F Y', strtotime($row->versions[0]->datetime));
		if (empty($title)) $title = '(No title)';
		echo '<span>';
		echo '<a class="nopreview" href="'.$base_uri.$row->slug.'">';
		echo $title;
		echo '</a>';
		echo ' ('.$datetime.')';
		if ($count < count($page->versions[$page->version_index]->reply_of)) echo ',&nbsp; ';
		$count++;
	endforeach;
	?></div>
</div>

