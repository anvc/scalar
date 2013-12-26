<div id="footer">
<?php
if ($book->url_is_public):
?>
<!-- AddThis Button BEGIN -->
<div class="addthis_toolbox addthis_default_style" style="float:right;">
<a class="addthis_button_facebook"></a>
<a class="addthis_button_google"></a>
<a class="addthis_button_twitter"></a>
<span class="addthis_separator">&bull;</span>
<a href="http://www.addthis.com/bookmark.php?v=250&amp;username=xa-4c40b32a7baba973" class="addthis_button_compact">More</a>
</div>
<script type="text/javascript" src="//s7.addthis.com/js/250/addthis_widget.js#username=xa-4c40b32a7baba973"></script>
<!-- AddThis Button END -->
<?
endif;

echo '<div class="scalar_logo_wrapper">'."\n";

// Publisher icon
if (!empty($book->publisher_thumbnail)) {
	$href = '';
	$link_tags = get_tag('a', $book->publisher);
	if (!empty($link_tags)) $href = getAttribute('href', $link_tags[0]);
	if (!empty($href)) echo '<a href="'.$href.'">';
	echo '<img class="publisher-thumb" src="'.confirm_slash(base_url()).confirm_slash($book->slug).$book->publisher_thumbnail.'" />'."\n";
	if (!empty($href)) echo '</a>';
}

// Page version number
if (isset($page->version_index) && isset($page->versions[$page->version_index]) && !empty($page->versions[$page->version_index])) {
	$title = $page->versions[$page->version_index]->title;
	$created = $page->versions[$page->version_index]->created;
	$version_num = $page->versions[$page->version_index]->version_num;
	echo '<span class="screen-version"><a href="'.$base_uri.$page->slug.'.'.$version_num.'.versions">Version '.$version_num.'</a> <span id="screen-version-id">id '.$page->versions[$page->version_index]->version_id.'</span> ';
	echo 'of this page'.((!empty($created))?', updated '.date('d F Y', strtotime($created)):'');
	echo '<span id="version_created_by"> by <a href="'.@$page->versions[$page->version_index]->homepage.'">'.$page->versions[$page->version_index]->fullname.'</a></span>';
	echo '.';
	echo '<span id="page_created_by"> Created by <a href="'.@$page->homepage.'">'.$page->fullname.'</a>.</span>';
	echo '</span><br />';
}

// Title and author
$title = $book->title;
echo '<span class="title-authors">';
echo '<a href="'.confirm_slash(base_url()).$book->slug.'">';
echo (empty($title)) ? htmlspecialchars('<title missing>') : $title;
echo '</a>';
if (isset($book->contributors)):
	if (function_exists('sort_contributors')) usort($book->contributors, 'sort_contributors');
	$contribs = array();
	foreach ($book->contributors as $row):
		if ('author'==$row->relationship && $row->list_in_index) $contribs[] = $row->fullname;
	endforeach;
	if (count($contribs)) echo ' by '.implode(' and ', $contribs);
endif;
if (isset($book) && !empty($book)):
 	echo '.  <a href="'.confirm_slash(base_url()).confirm_slash($book->slug).'help">Help reading this '.$book->scope.'</a>.</span><br />'."\n";
 endif;
 
// Publisher and license
echo '<span class="poweredby">'."\n";
if (!empty($book->publisher)) echo 'Published by '.$book->publisher.'. ';
echo 'Powered by <a href="http://scalar.usc.edu">Scalar</a>.<br /><a href="http://scalar.usc.edu/terms-of-service/">Terms of Service</a> | <a href="http://scalar.usc.edu/privacy-policy/">Privacy Policy</a> | <a href="http://scalar.usc.edu/contact/">Scalar Feedback</a>';
echo "</span>\n";

echo "</div>\n";  // logo wrapper

echo "</div>\n"; // footer_content
