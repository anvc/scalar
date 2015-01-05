<ul class="versionbrowser nodots">
<?
$count = 1;
$page->versions = array_reverse($page->versions);
foreach ($page->versions as $version) {
	$version_uri = $base_uri.$page->slug.'.'.$version->version_num;
	$title = (!empty($version->title)) ? $version->title : '(No title)';
	$date = date('j M Y, g:ia T', strtotime($version->created));
	echo '<li class="versionbrowser_item">';
	echo '<span class="versionbrowser_num">'.$version->version_num.'.</span> ';
	echo '<span class="versionbrowser_byline">';
	if (isset($version->user->uri)) echo '<a href="'.$version->user->uri.'">'; 
	echo $version->user->fullname;
	if (isset($version->user->uri)) echo '</a>';  
	echo ', <a href="'.$version_uri.'">'.$date.'</a></span>';
	echo '<span class="versionbrowser_title">'.$title.'</span>';
	echo '<div class="versionbrowser_content">'.nl2br(trim($version->content)).'</div>';
	echo '<br clear="both" />';
	echo "</li>\n";
	$count++;
}
?>
</ul>