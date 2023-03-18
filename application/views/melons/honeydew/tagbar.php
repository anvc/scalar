<?
if ($mode || !isset($page->versions[0]->has_tags) || empty($page->versions[0]->has_tags)) return;
$related_content = array();
?>
<!-- Tag bar -->
<div class="pathnavs tagbar">
	<div class="path_nav_path current_path">
		<div class="path_left"><?
			$count = 1;
			foreach ($page->versions[$page->version_index]->has_tags as $tag):
				$slug = $tag->slug;
				$title = $tag->versions[0]->title;
				$description = $tag->versions[0]->description;
				$related_content = array_merge($related_content, $tag->versions[0]->tag_of);
				echo '<a class="inline_icon_link tag" href="'.$base_uri.$slug.'">';
				echo $title;
				echo '</a>';
				if ($count < count($page->versions[$page->version_index]->has_tags)) echo '&nbsp; &nbsp; ';
				$count++;
			endforeach;																														
		?></div>
		<br clear="both" />
		<div class="path_bottom path_bottom_no_margin path_single_line"><?
			shuffle($related_content);
			$output = array();
			echo 'Related:&nbsp; ';
			if (!empty($related_content)) {
				$tag_ids = array();
				foreach ($related_content as $row) {
					if ($row->content_id == $page->content_id) continue;
					if (in_array($row->content_id, $tag_ids)) continue;
					$tag_ids[] = $row->content_id;
 					$row_version = $row->versions[$page->version_index];
					$slug = $row->slug;
					$title = $row_version->title;
					$str = '<a href="'.$base_uri.$slug.'">';
					$str .= $title;
					$str .= '</a>';	
					$output[] = $str;
				}	
			}
			if (!empty($output)) {
				echo implode(',&nbsp; ',$output);																																					
			} else {
				echo '(No related content)';
			}
		?></div>
	</div>
</div>
