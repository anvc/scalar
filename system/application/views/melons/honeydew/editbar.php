<? 
if ($mode || !$login->is_logged_in || !$can_edit) return;
if (isset($hide_edit_bar) && $hide_edit_bar) return;

echo '<div class="edit_options">';
// New Button
if ($this->users->is_a($user_level, 'commentator')) {
	echo '<a class="generic_button large" href="'.$base_uri.'new.edit">';
	echo 'New'.(('commentator'==strtolower($user_level))?' Commentary':'');
	echo "</a>&nbsp;&nbsp;";
}
// Edit button
$to_edit = no_version($_SERVER['REQUEST_URI']);  
if (strpos($to_edit, '?')) $to_edit = substr($to_edit, 0, strpos($to_edit, '?'));
if (isset($page->version_index)) {
	$version_num = $page->versions[$page->version_index]->version_num;
	$to_edit .= '.'.$version_num;
}
echo '<a class="generic_button large" href="'.$to_edit.'.edit">';
echo 'Edit';
echo "</a>&nbsp;&nbsp;";
// Edit annotations button
if (isset($page->version_index) && !empty($page->versions[$page->version_index]->url)):
	echo '<a class="generic_button large" href="'.$base_uri.$page->slug.'.annotation_editor">';
	echo 'Edit annotations';
	echo '</a>&nbsp;&nbsp;'; 
endif;
// Delete button (set is_live=0 using the save API)
if (isset($page->version_index) && $page->is_live):
?>
<form style="display:inline;padding:0;margin:0;" method="post" enctype="multipart/form-data" onsubmit="if (confirm('Are you sure you wish hide this page from view?')) {return send_form($(this));} else {return false;}">
<input type="hidden" name="action" value="delete" />
<input type="hidden" name="native" value="1" />
<input type="hidden" name="scalar:urn" value="<?=$page->versions[$page->version_index]->urn?>" />
<input type="hidden" name="id" value="<?=@$login->email?>" />
<input type="hidden" name="api_key" value="" />
<input type="submit" value="Hide" class="generic_button large">
</form>
<? elseif ($can_edit && isset($page->version_index)): ?>
<form style="display:inline;padding:0;margin:0;" method="post" enctype="multipart/form-data" onsubmit="if (confirm('Are you sure you wish to make this page visible?')) {return send_form($(this));} else {return false;}">
<input type="hidden" name="action" value="undelete" />
<input type="hidden" name="native" value="1" />
<input type="hidden" name="scalar:urn" value="<?=$page->versions[$page->version_index]->urn?>" />
<input type="hidden" name="id" value="<?=@$login->email?>" />
<input type="hidden" name="api_key" value="" />
<input type="submit" value="Make Visible" class="generic_button large">
</form>
<?
endif;
echo '<br clear="both" />';
echo "</div>\n";
?>