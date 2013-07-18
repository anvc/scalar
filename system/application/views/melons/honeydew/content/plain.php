<!-- Content: Plain view -->
<?
if (!isset($page->version_index)):
	echo '<div id="content">';
	if ('Author'==$user_level):
		echo lang('page.no_content_author');
	else:
		echo lang('page.no_content');
	endif;
	echo '</div>';
else: 
	// Content
	if (empty($page->versions[$page->version_index]->url)):
		if (!empty($page->color)) echo '<div class="path_nav_color" style="background-color:'.$page->color.'"></div>';
		echo '<h4 class="content_title">'.$page->versions[$page->version_index]->title.'</h4>'."\n";
	endif;
	echo '<div id="content">';
	// Is a file?
	if (!empty($page->versions[$page->version_index]->url)):
		echo '<a class="inline media_page" href="'.$page->versions[$page->version_index]->url.'" resource="'.$page->slug.'"></a>';
		if (!empty($page->versions[$page->version_index]->content)) echo '<br />';
	endif;
	$content = trim($page->versions[$page->version_index]->content);
	if (!empty($content)):
		echo nl2brPre($page->versions[$page->version_index]->content);
	else:
		// Put a message here?
	endif;
	echo "</div>\n";
endif;
?>

