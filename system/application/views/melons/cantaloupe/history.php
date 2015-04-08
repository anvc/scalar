<ul>
<?
$count = 1;
$page->versions = array_reverse($page->versions);
foreach ($page->versions as $version) {
	$version_uri = $base_uri.$page->slug.'.'.$version->version_num;
	$title = (!empty($version->title)) ? $version->title : '(No title)';
	$date = date('j M Y, g:ia T', strtotime($version->created));
	echo '<li class="versionbrowser_item">';
	echo '<h3><span class="versionbrowser_num">'.$version->version_num.'.</span> <span class="versionbrowser_title">'.$title.'</span></h3>';
	echo '<p class="caption_font small"><span class="versionbrowser_byline">';
	if (isset($version->user->uri)) echo 'Created by <a href="'.$version->user->uri.'">';
	echo $version->user->fullname;
	if (isset($version->user->uri)) echo '</a> on ';
	echo '<a href="'.$version_uri.'">'.$date.'</a></span></p>';
	echo '<div class="versionbrowser_content">'.nl2br(trim($version->content)).'</div>';
	echo '<br clear="both" />';
	echo '<hr>';
	echo "</li>\n";
	$count++;
}
?>
</ul>