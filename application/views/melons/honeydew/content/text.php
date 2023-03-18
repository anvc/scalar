<!-- Content: Text-emphasis view -->
<div class="vert_slots"></div>
<?
// Title
if (isset($page->versions[$page->version_index])):
	if (!empty($page->color)) echo '<div class="path_nav_color" style="background-color:'.$page->color.'"></div>';
	echo '<h4 class="content_title">'.$page->versions[$page->version_index]->title.'</h4>'."\n";
endif;
// Content
if (isset($page->versions[$page->version_index]) && !empty($page->versions[$page->version_index]->content)):
	echo '<div id="content">'.nl2brPre($page->versions[$page->version_index]->content).'</div>';
else:
	if ('Author'==$user_level):
		echo lang('page.no_content_author');
	else:
		echo lang('page.no_content');
	endif;
	echo '<br /><br />';
endif;
?>

