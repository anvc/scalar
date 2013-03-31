<?
if ($mode || !isset($page->versions[0]->annotation_of) || empty($page->versions[0]->annotation_of)) return;
$annotation_of = $page->versions[0]->annotation_of;
$type = ('composite'==$page->type) ? 'page' : 'media';
?>
<!-- Annotation of list -->
<div id="annotation_of_list">
<span class="inline_icon_link annotation">This <?=$type?> annotates:</span>
<?
foreach ($annotation_of as $row):
	$file_page_url = $base_uri.$row->slug;
	$file_url = abs_url($row->versions[0]->url, $base_uri);
	$title = $row->versions[0]->title;
	if (empty($title)) $title = '(No title)';
	$anno_str = '';
	// Temporal
	if (!empty($row->versions[0]->start_seconds) || !empty($row->versions[0]->end_seconds)) {
		$anno_str = round($row->versions[0]->start_seconds);
		if (isset($row->versions[0]->end_seconds)) $anno_str .= ' - '.round($row->versions[0]->end_seconds);
		$anno_str .= ' seconds';
	// Textual
	} elseif (!empty($row->versions[0]->start_line_num) || !empty($row->versions[0]->end_line_num)) {
		$anno_str = 'line '.$row->versions[0]->start_line_num;
		if (isset($row->versions[0]->end_line_num)) {
			if ($row->versions[0]->start_line_num != $row->versions[0]->end_line_num) $anno_str .= ' - '.$row->versions[0]->end_line_num;
		} 
	// Spatial
	} elseif (!empty($row->versions[0]->points)) {
		$point_array = explode(',',$row->versions[0]->points);
		$anno_str = '';
		if (isset($point_array[0])) $anno_str .= 'x: '.$point_array[0].' ';
		if (isset($point_array[1])) $anno_str .= 'y: '.$point_array[1].' ';
		if (isset($point_array[2])) $anno_str .= 'width: '.$point_array[2].' ';
		if (isset($point_array[3])) $anno_str .= 'height: '.$point_array[3].' ';
	}	
?>
	<div><a href="<?=$file_page_url?>"><?=$title?></a> at <?=$anno_str?></div>
	<a class="inline" href="<?=$file_url?>#<?=$page->slug?>" resource="<?=$file_page_url?>"></a>
<? endforeach ?>
</div>