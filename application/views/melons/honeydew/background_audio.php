<?php
if ($mode || !isset($page->version_index)) return;

$audio = null;
if (isset($page->versions) && isset($page->versions[$page->version_index]->has_paths) && !empty($page->versions[$page->version_index]->has_paths)) {
	$path_index = $page->versions[$page->version_index]->requested_path_index;
	if (!empty($page->versions[$page->version_index]->has_paths[$path_index]->audio)) $audio = trim($page->versions[$page->version_index]->has_paths[$path_index]->audio);		
}
if (isset($page->version_index)) {
	if (!empty($page->audio)) $audio = $page->audio;	
}
if (empty($audio)) return;

$audio = $this->pages->get_by_version_url($book->book_id, $audio, true); // Shortcut
if (empty($audio)) return;
$audio_href = $audio[key($audio)]->versions[0]->url;
$audio_uri = $audio[key($audio)]->slug;
?>
<a class="inline auto_play media_page" href="<?=$audio_href?>" resource="<?=$audio_uri?>"></a>
<br />