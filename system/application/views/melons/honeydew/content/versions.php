<?
// Title
if (isset($page->versions[$page->version_index])):
	if (!empty($page->color)) echo '<div class="path_nav_color" style="background-color:'.$page->color.'"></div>';
	echo '<h4 class="content_title">'.$page->versions[$page->version_index]->title.'</h4>'."\n";
endif;
if (isset($_GET['action']) && $_GET['action']=='deleted_versions') {
	echo '<div class="error"><p>Delete successful <a style="float:right;" href="'.$base_uri.$page->slug.'.versions">clear</a></p></div><br />';
} elseif (isset($_GET['action']) && $_GET['action']=='versions_reordered') {
	echo '<div class="saved"><p>Versions have been re-ordered <a style="float:right;" href="'.$base_uri.$page->slug.'.versions">clear</a></p></div><br />';
}
?>

<script>
function checkVersionForm() {
	var num_checkboxes = $("#versionForm input[type='checkbox']").length;
	var checked = $("#versionForm input:checked");
	if (!checked.length) {
		alert('Please select one or more versions');
		return false;
	}
	if (checked.length == num_checkboxes) {
		alert('Can\'t continue because ALL of the versions for this page have been selected.\n\nTo delete this page, return to its main view then click the "delete" button at the bottom of the page.  Otherwise, to delete specific versions please de-select one or more versions.');
		return false;		
	}
	if (!confirm('Are you sure you wish to delete selected version'+((checked.length>1)?'s':'')+'?')) return false;
	return true;
}
function reorderVersionNums() {
	if (!confirm('Are you sure you wish to re-order version numbers?  This could break links to specific versions of your book.')) return false;
	var url = '?action=do_reorder_versions';
	document.location.href=url;
}
</script>

<form id="versionForm" action="<?=$base_uri.$page->slug?>.versions" method="post" onsubmit="return checkVersionForm();">
<input type="hidden" name="action" value="do_delete_versions" />
<?
if (!count($page->versions)) {
	echo 'There are no versions of this page<br /><br />';
} else {
	echo '<ol class="listview nodots versions_list">'."\n";
	foreach ($page->versions as $version):
		$title = (strlen($version->title)) ? $version->title : '(No title)';
		$page_uri = $base_uri.$page->slug;
		$content = remove_HTML($version->content);
		$date = date('j M Y, g:ia T', strtotime($version->created));
	?>
		<li>
		<? if ($login_is_super || in_array($book->book_id, $login_book_ids)): ?>
		<input type="checkbox" name="delete_version[]" value="<?=$version->version_id?>" />&nbsp;  
		<? endif; ?> 		
		<a href="<?=$page_uri.'.'.$version->version_num?>"><?=strip_tags($title)?></a>
		<?=($version->version_num == $page->versions[$page->version_index]->version_num)?' <b>&bull;</b> <span style="color:#7c2438">Version being viewed</span>':''?>
		<?=($version->version_num == $page->versions[0]->version_num)?' <b>&bull;</b> <a href="'.$page_uri.'">View live version</a>':''?>
		<br />
		Version <b title="Version ID <?=$version->version_id?>"><?=$version->version_num?></b> by 
		<?
		if (isset($version->attribution->fullname) && !empty($version->attribution->fullname)) {
			echo $version->attribution->fullname;
		} else {
			if (isset($version->homepage)) echo '<a href="'.$version->homepage.'">'; 
			echo $version->fullname;
			if (isset($version->homepage)) echo '</a>';  
		}
		?>
		on 
		<?=$date?>
		<?=(!empty($version->content)) ? '<br />'.create_excerpt($content, 14).' <span style="color:#777777;">'.strlen($content).' chars</span>' : '' ?>
		<?=(!empty($version->url)) ? '<br />URL: <a href="'.abs_url($version->url,$base_uri).'">'.$version->url.'</a>' : '' ?>
		</li>
	<?		
	endforeach;
	echo '</ol>'."\n";
}
?>
<?
	if ($login_is_super || in_array($book->book_id, $login_book_ids)):
?>
		<input type="submit" value="Delete selected versions" class="generic_button" />&nbsp; &nbsp; <a href="javascript:" onclick="reorderVersionNums()">Re-order version numbers</a>
<?
	endif;
?> 
</form>
