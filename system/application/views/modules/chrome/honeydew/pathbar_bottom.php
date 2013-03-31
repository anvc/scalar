<?
if ($mode || !isset($page->versions[0]->has_paths) || empty($page->versions[0]->has_paths)) return;
$path =@ $page->versions[$page->version_index]->has_paths[$page->versions[$page->version_index]->requested_path_index];
$prev_page =@ $path->versions[$page->version_index]->path_of[$path->versions[$page->version_index]->prev_index];
$next_page =@ $path->versions[$page->version_index]->path_of[$path->versions[$page->version_index]->next_index];
$continue_to =@ $path->versions[$page->version_index]->continue_to;
?>
<!-- Bottom path bar -->
<table class="path_table" cellspacing="0" cellpadding="0"><tr>
  <td class="path_table_left"><?
		if (!empty($prev_page)) {
			echo '<a class="path_nav_previous_btn" ';
			echo 'href="'.$base_uri.$prev_page->slug.'?path='.urlencode($path->slug).'" ';
			echo 'title="'.htmlspecialchars($prev_page->versions[0]->title).'"';
			echo'>';
			echo 'Previous page on path';
			echo '</a>';				
		} else  {
			echo '<span class="path_nav_previous_btn">Previous page on path</span>';
		} 
	?></td>
  <td class="path_table_center"><?
		if (!empty($path)) {
			echo '<a class="path_title_link" href="'.$base_uri.$path->slug.'" title="'.$path->versions[0]->description.'">';
			echo $path->versions[0]->title;
			echo '</a>';
			echo '<span style="white-space:nowrap;">, page '.$path->versions[0]->page_num.' of '.$path->versions[0]->total_pages.'</span>';
		}	
	?></td>
  <td class="path_table_right"><?
		if (!empty($next_page)) {
			echo '<a class="path_nav_next_btn" ';
			echo 'href="'.$base_uri.$next_page->slug.'?path='.urlencode($path->slug).'" ';
			echo 'title="'.htmlspecialchars($next_page->versions[0]->title).'"';
			echo'>';echo 'Next page on path';
			echo '</a>';
		} elseif (!empty($continue_to)) {
			echo '<a class="path_nav_next_btn" href="'.$base_uri.$continue_to->slug.'">Path end, continue</a>';	
		/*
		} elseif (isset($container_of) && !empty($container_of)) {
			echo '<a href="'.confirm_slash(base_url()).confirm_slash($book->slug).$container_of[0]->slug.'?path='.urlencode($page->slug).'" class="path_nav_next_btn">Begin this path</a>';
		*/
		} elseif (!empty($prev_page)) {
			echo '<a class="path_nav_next_btn" href="'.confirm_slash(base_url()).confirm_slash($book->slug).'index">Path end, return home</a>';
		} else {echo '&nbsp;';} 	
	?></td>
</tr></table>
