<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>

<script>
$(window).ready(function() {
    $('.save_changes').next('a').click(function() {
    	$('#publish_form').submit();
    	return false;
    });
});
</script>

<form id="publish_form" action="<?=confirm_slash(base_url())?>system/dashboard" method="post" enctype="multipart/form-data">
<input type="hidden" name="action" value="do_save_publish" />
<input type="hidden" name="zone" value="publish" />
<? if (!empty($book)): ?>
<input type="hidden" name="book_id" value="<?=$book->book_id?>" />
<? endif ?>
<table cellspacing="0" cellpadding="0" style="width:100%;" class="trim_horz_padding">


<?php
	if (empty($book)) {
		echo 'Please select a book to manage using the pulldown menu above';
	}
	if (@$_REQUEST['action']=='book_publish_saved') {
		echo '<div class="saved">';
		echo 'Publishing options have been saved ';
		echo '<div style="float:right;">';
		echo '<a href="'.confirm_slash(base_url()).$book->slug.'">back to '.$book->scope.'</a>';
		echo ' | ';
		echo '<a href="?book_id='.$book->book_id.'&zone=publish#tabs-publish">clear</a>';
		echo '</div>';
		echo '</div><br />';
	}

	$row = $book;  // TEMP
	if (!empty($row)):
		if (!empty($book_id) && $row->book_id != $book_id) continue;	

	echo '<tr typeof="books" class="styling_sub">';
	echo '<td><h4 class="content_title">Public/private</h4></td><td></td></tr>';
	echo '<tr>';
	echo '<tr typeof="books">';
	echo '<td><p>Availability</p>';
	echo '</td>'."\n";
	echo '<td style="vertical-align:middle;" colspan="2">';
	echo '<p>Make URL public? &nbsp;<select name="url_is_public"><option value="0"'.(($row->url_is_public)?'':' selected').'>No</option><option value="1"'.(($row->url_is_public)?' selected':'').'>Yes</option></select></p>';
	echo '<p>Display in Scalar indexes? &nbsp;<select name="display_in_index"><option value="0"'.(($row->display_in_index)?'':' selected').'>No</option><option value="1"'.(($row->display_in_index)?' selected':'').'>Yes</option></select></p>';
	echo "</td>\n";
	echo "</tr>\n";	
	echo '<tr typeof="books">';
	echo '<td><p>Joinability</p>';
	echo '</td>'."\n";
	echo '<td style="vertical-align:middle;" colspan="2">';
	echo '<p>';
	echo 'Allow requests to join book? &nbsp;<select id="joinable"><option value="0" selected>No</option><option value="1">Yes</option></select>';
	echo '<br /><small>An email will be sent to you when a user requests book authorship</small>';
	echo '</p>';
	echo "</td>\n";
	echo "</tr>\n";									
	echo '<tr typeof="books">';
	echo '<td><p>Duplicability</p>';
	echo '</td>'."\n";
	echo '<td style="vertical-align:middle;" colspan="2">';
	echo '<p>';
	echo 'Allow book to be duplicated by others? &nbsp;<select id="duplicatable"><option value="0" selected>No</option><option value="1">Yes</option></select>';
	echo '<br /><small>Book will display in list of duplicatable books regardless of availability settings</small>';
	echo '</p>';
	echo "</td>\n";
	echo "</tr>\n";								
	// Saves				
	echo "<tr>\n";
	echo '<td style="padding-top:8px;text-align:right;" colspan="3"><span class="save_changes">You have unsaved changes.</span> &nbsp; <a class="generic_button large default" href="javascript:;">Save</a></td>';
	echo "</tr>\n";		
	endif;					
?>
</table>	
</form>