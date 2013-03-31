<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?
$this->template->add_css(path_from_file(__FILE__).'title.css');
// Title
if (isset($book->title) && !empty($book->title)) echo '<h2 class="cover_title">'.trim($book->title).'</h2>'."\n";
// Subtitle
if (isset($book->subtitle) && !empty($book->subtitle)) echo '<h4 class="cover_subtitle">'.trim($book->subtitle).'</h4>'."\n";
// Authors
if (isset($book->contributors)):
	if (function_exists('sort_contributors')) usort($book->contributors, 'sort_contributors');
	$contribs = array();
	foreach ($book->contributors as $row):
		if ('author'==$row->relationship && $row->list_in_index) $contribs[] = '<a href="'.$base_uri.'users/'.$row->user_id.'">'.$row->fullname.'</a>';
	endforeach;
	if (!empty($contribs)) {
		echo '<div class="cover_authors">'.implode(', ', $contribs).', Author'.((count($contribs)>1)?'s':'').'</div>'."\n";
	}
endif;

?>
