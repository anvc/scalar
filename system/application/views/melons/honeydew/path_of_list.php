<?
if ($mode || !isset($page->versions[0]->path_of) || empty($page->versions[0]->path_of)) return;

$path_of = $page->versions[0]->path_of;
$msg = 'Begin this path';
if (strlen($page->versions[0]->title) < 30) {  // Magic number... Make routing more clear
	$msg = 'Begin this path: '.$page->versions[0]->title;
}
?>
<!-- Path of list -->
<div id="path_of_list">
  <a class="generic_button large icon path" href="<?=$base_uri.$path_of[0]->slug?>?path=<?=$page->slug?>"><?=$msg?></a>
  <ol title="Path list"><?
	foreach ($path_of as $row):
		$title =@ $row->versions[0]->title;
		if (empty($title)) $title = '(No title)';
		echo '<li>';
		echo '<a class="nopreview" href="'.$base_uri.$row->slug.'?path='.$page->slug.'">';
		echo $title;
		echo '</a>';
		echo '</li>';
	endforeach;
	?></ol>
</div>
