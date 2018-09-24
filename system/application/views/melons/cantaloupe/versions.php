<?
if (isset($_GET['action']) && $_GET['action']=='deleted_versions') {
	echo '<div class="error" style="margin-bottom:0;"><p>Delete successful <a style="float:right;" href="'.$base_uri.$page->slug.'.versions">clear</a></p></div><br />';
} elseif (isset($_GET['action']) && $_GET['action']=='versions_reordered') {
	echo '<div class="saved" style="margin-bottom:0;"><p>Versions have been re-ordered <a style="float:right;" href="'.$base_uri.$page->slug.'.versions">clear</a></p></div><br />';
}

if ($book->editorial_is_on && !empty($book->editions) && isset($book->editions[$url_params['edition_index']])) {
	$login_is_super = false;
	$login_book_ids = array();
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
	var url = location.protocol + '//' + location.host + location.pathname + '?action=do_reorder_versions';
	document.location.href=url;
}
</script>

<form id="versionForm" action="<?=$base_uri.$page->slug?>.versions" method="post" onsubmit="return checkVersionForm();">
<input type="hidden" name="action" value="do_delete_versions" />
<?
if (!count($page->versions)) {
	echo 'There are no versions of this page<br /><br />';
} else {
	echo '<table class="table table-striped caption_font small">'."\n";
	echo '<thead><tr>';
	if ($login_is_super || in_array($book->book_id, $login_book_ids)) echo '<th></th>';
	echo '<th>#</th><th style="width: 20rem;">Title</th><th>Content</th>';
	if (isset($book->editorial_is_on) && $book->editorial_is_on) echo '<th>State</th>';
	echo '<th style="width: 10rem;">Creator</th><th style="width: 11rem;">Date</th></tr></thead>'."\n";
	echo '<tbody>'."\n";
	foreach ($page->versions as $version):
		$title = (strlen($version->title)) ? $version->title : '(No title)';
		$page_uri = $base_uri.$page->slug;
		$content = remove_HTML($version->content);
		$date = date('j M Y, g:ia T', strtotime($version->created));
		$state = (isset($book->editorial_is_on) && $book->editorial_is_on) ? $version->editorial_state : null;
	?>
		<?=($version->version_num == $page->versions[$page->version_index]->version_num)?' <tr class="success">':'<tr>'?>

		<? if ($login_is_super || in_array($book->book_id, $login_book_ids)): ?>
		<td>
		<? if ('published' != $state): ?>
		<input type="checkbox" name="delete_version[]" value="<?=$version->version_id?>" />&nbsp;
		<? endif; ?>
		</td>
		<? endif; ?>

		<td><b title="Version ID <?=$version->version_id?>" style="cursor:pointer;"><?=$version->version_num?></b></td>

		<td><a href="<?=$page_uri.'.'.$version->version_num?>"><?=strip_tags($title)?></a>
		<?=($version->version_num == $page->versions[0]->version_num)?' (<a href="'.$page_uri.'">Current</a>)':''?>
		</td>

		<td>
		<?=(!empty($content))?create_excerpt($content, 14).' <span style="color:#777777;">['.strlen($content).' chars]</span><br />':''?>
		<?=(!empty($version->url))?'URL: <a href="'.abs_url($version->url,$base_uri).'">'.$version->url.'</a>':''?>
		</td>
		
		<?
		if (null!==$state):
			echo '<td>';
			echo ucwords($state);
			echo '</td>';
		endif;
		?>

		<?
		echo '<td>';
		if (!empty($version->user->uri)) echo '<a href="'.$version->user->uri.'">';
		echo $version->user->fullname;
		if (isset($version->user->uri)) echo '</a>';
		echo '</td>';
		?>

		<td><?=$date?></td>

		</tr>
	<?
	endforeach;
	echo '</tbody>'."\n";
	echo '</table>'."\n";
}
?>
<?
	if ($login_is_super || in_array($book->book_id, $login_book_ids)):
?>
		<div class="caption_font"><input type="submit" value="Delete selected versions" class="btn btn-primary" />&nbsp; <a class="btn btn-default" href="javascript:void(null);" onclick="reorderVersionNums(); return false;">Re-order version numbers</a></div>
<?
	endif;
?>
</form>
