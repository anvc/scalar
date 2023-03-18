<?
if ($mode || !isset($page->versions[0]->has_paths) || empty($page->versions[0]->has_paths)) return;
// echo '<a href="'.confirm_slash(base_url()).confirm_slash($book->slug).$path->slug.'"><img class="path_image" src="'.$path_img.'" style="position:absolute; left:10px; top:8px;" /></a> ';
// <?=(($path_img)?'path_nav_with_image':'')
?>
<!-- Path bar -->
<div class="pathnavs">
  <div class="path_nav_path current_path">
<?
	$path =@ $page->versions[$page->version_index]->has_paths[$page->versions[$page->version_index]->requested_path_index];
	$prev_page =@ $path->versions[$page->version_index]->path_of[$path->versions[$page->version_index]->prev_index];
	$next_page =@ $path->versions[$page->version_index]->path_of[$path->versions[$page->version_index]->next_index];
	$continue_to =@ $page->versions[$page->version_index]->continue_to;
	// Current path
  	echo '<div class="path_left">';
	if (!empty($path)) {
		echo '<div class="path_nav_color path_nav_color_primary path_nav_color_expand_height" style="background:'.$path->color.'"></div>';
		echo '<a class="path_title_link" href="'.$base_uri.$path->slug.'" title="'.$path->versions[0]->description.'">';
		echo $path->versions[0]->title;
		echo '</a>';
		echo '<span style="white-space:nowrap;">, page '.$path->versions[0]->page_num.' of '.$path->versions[0]->total_pages.'</span>';
	} else {
		echo '&nbsp;';
	}
    echo '</div>'."\n";
    echo '<div class="path_right '.((!isset($page->versions[0])||empty($page->versions[0]->has_paths))?'path_right_inline':'').'"><div class="wrapper">';
    // Previous page
	if (!empty($prev_page)) {
		echo '<a class="path_nav_previous_btn" ';
		echo 'href="'.$base_uri.$prev_page->slug.'?path='.urlencode($path->slug).'" ';
		echo 'title="'.htmlspecialchars($prev_page->versions[0]->title).'"';
		echo'>';
		echo 'Previous page on path';
		echo '</a>';			
	} elseif (!empty($path)) {
		echo '<span class="path_nav_previous_btn">Previous page on path</span>';
	} else {echo '&nbsp;';}
	// Next page 
	if (!empty($next_page)) {
		echo '&nbsp; &nbsp; &nbsp;';
		echo '<a class="path_nav_next_btn" ';
		echo 'href="'.$base_uri.$next_page->slug.'?path='.urlencode($path->slug).'" ';
		echo 'title="'.htmlspecialchars($next_page->versions[0]->title).'"';
		echo'>';echo 'Next page on path';
		echo '</a>';
	} elseif (!empty($continue_to)) {
		echo '&nbsp; &nbsp; &nbsp; &nbsp;';
		echo '<a class="path_nav_next_btn" href="'.$base_uri.$continue_to[0]->slug.'" title="'.$continue_to[0]->versions[$continue_to[0]->version_index]->title.'">Path end, continue</a>';	
	} elseif (!empty($prev_page)) {
		echo '&nbsp; &nbsp; &nbsp; &nbsp;';
		echo '<a class="path_nav_next_btn" href="'.$base_uri.'index">Path end, return home</a>';
	} else {echo '&nbsp;';} 
    echo '</div></div>'."\n";

    echo '<br clear="both" />'."\n";
    if (!empty($path)):
    	echo '<div class="path_bottom">'."\n";
    	if (count($page->versions[0]->has_paths)>1) {
      		echo '<div class="text_wrapper">Other paths that intersect here:</div>'."\n";
      		$j = 0;
      		foreach ($page->versions[0]->has_paths as $key => $row):
	   	 		if ($key == $page->versions[0]->requested_path_index) continue;
	    		$path_color = (!empty($row->color)) ? $row->color : null;
	    		$title = $row->versions[0]->title;
	    		$slug = $row->slug;
	    		$current_page_num = $row->versions[0]->page_num;
	    		$num_container_of = $row->versions[0]->total_pages;		
        		?>
	  			<div class="path_nav_color pulldown" style="background:<?=$path_color?>">&nbsp;
	  				<ul class="pulldown-content pulldown-content-nudge-center pulldown-content-nudge-up pulldown-content-no-mouseover nodots">
						<li class="color_path_title"><div class="path_nav_color path_nav_color_expand_height" style="background:<?=$path_color?>"></div> <a href="<?=$page->slug?>?path=<?=$slug?>"><?=$title?></a></li>
						<li>Page <?=$current_page_num?> of <?=$num_container_of?> in path</li>
					</ul>		
				</div>
        		<?
      			$j++;
      		endforeach;
      		echo '<br clear="both" />'."\n";
    	} else {echo '&nbsp;';} 
    	echo "</div>\n";
  	endif;
	?>
  </div>
</div>