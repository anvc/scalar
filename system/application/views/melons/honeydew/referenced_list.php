<?
if ($mode || !isset($page->version_index) || !isset($page->versions[$page->version_index]->has_references)) return;
if ('media' != $page->type) return;

$references = $page->versions[$page->version_index]->has_references;
if (!empty($references)) {
	echo '<div id="referenced">Referenced by ';
	$list = array();
	foreach ($references as $row) {
		$list[] = '<a href="'.$base_uri.$row->slug.'">'.$row->versions[0]->title.'</a>';
	}
	echo implode(', ', $list);
	echo '</div>';
}
?>