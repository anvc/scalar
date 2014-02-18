<?
	if (!defined('BASEPATH')){exit('No direct script access allowed');}

	// Title
	if (isset($book->title) && !empty($book->title)){
		echo '<h1 class="cover_title">',trim($book->title);
		// Subtitle
		if (isset($book->subtitle) && !empty($book->subtitle)){
			echo '<br /><small>',trim($book->subtitle),'</small>';
		}
		echo '</h1>';
	}

	// Authors
	if (isset($book->contributors)){
		if(function_exists('sort_contributors')){
			usort($book->contributors, 'sort_contributors');
		}
		$contribs = array();
		foreach ($book->contributors as $row){
			if ('author'==$row->relationship && $row->list_in_index){
				$contribs[] = '<a href="'.$base_uri.'users/'.$row->user_id.'">'.$row->fullname.'</a>';
			}
		}
		if (!empty($contribs)) {
			echo '<div class="cover_authors">'.implode(', ', $contribs).', Author'.((count($contribs)>1)?'s':'').'</div>'."\n";
		}
	}

?>
