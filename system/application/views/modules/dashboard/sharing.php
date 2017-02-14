<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>

<script>
$(window).ready(function() {

    $('.save_changes').next('a').click(function() {
    	$('#sharing_form').submit();
    	return false;
    });

	var $title = $('<div>'+$('input[name="title"]').val()+'</div>');
	var is_duplicatable = ('undefined'==typeof($title.children(":first").attr('data-duplicatable'))) ? 0 : 1;
	var is_joinable = ('undefined'==typeof($title.children(":first").attr('data-joinable'))) ? 0 : 1;
	var auto_approve = ('undefined'==typeof($title.children(":first").attr('data-auto-approve'))) ? 0 : 1;
	var email_authors = ('undefined'==typeof($title.children(":first").attr('data-email-authors'))) ? 0 : 1;
	var hypothesis = ('undefined'==typeof($title.children(":first").attr('data-hypothesis'))) ? 0 : 1;
	var thoughtmesh = ('undefined'==typeof($title.children(":first").attr('data-thoughtmesh'))) ? 0 : 1;
	$('#duplicatable').val(is_duplicatable);
	$('#joinable').val(is_joinable);
	$('#hypothesis').val(hypothesis);
	$('#thoughtmesh').val(thoughtmesh);
	$('#auto-approve').val(auto_approve);
	$('#email-authors').val(email_authors);

	$('#duplicatable, #joinable, #hypothesis,#thoughtmesh,#auto-approve,#email-authors').change(function() {
		var $title = $('<div>'+$('input[name="title"]').val()+'</div>');
		if (!$title.children(':first').is('span')) $title.contents().wrap('<span></span>');
		var $span = $title.children(':first');
		var prop_arr = ['duplicatable', 'joinable', 'hypothesis', 'thoughtmesh','auto-approve','email-authors'];
		var all_false = true;
		for (var j in prop_arr) {
			var prop = prop_arr[j];
			var make_true = (parseInt($('#'+prop).val())) ? true : false;
			all_false = (all_false && !make_true) ? true : false;
			if (make_true) {
				$span.attr('data-'+prop, 'true');
			} else {
				$span.removeAttr('data-'+prop);
			}
		}

		if(all_false && $title.children(':first').is('span')) {
			$title.children(':first').contents().unwrap();
		}
		$('input[name="title"]').val( $title.html() );
	});

});
</script>

<form id="sharing_form" action="<?=confirm_slash(base_url())?>system/dashboard" method="post" enctype="multipart/form-data">
<input type="hidden" name="action" value="do_save_sharing" />
<input type="hidden" name="zone" value="sharing" />
<? if (!empty($book)): ?>
<input type="hidden" name="book_id" value="<?=$book->book_id?>" />
<? endif ?>
<table cellspacing="0" cellpadding="0" style="width:100%;" class="trim_horz_padding">


<?php
	if (empty($book)) {
		echo 'Please select a book to manage using the pulldown menu above';
	}
	if (isset($_REQUEST['action']) && $_REQUEST['action']=='book_sharing_saved') {
		echo '<div class="saved">';
		echo 'Sharing options have been saved ';
		echo '<div style="float:right;">';
		echo '<a href="'.confirm_slash(base_url()).$book->slug.'">back to '.$book->scope.'</a>';
		echo ' | ';
		echo '<a href="?book_id='.$book->book_id.'&zone=sharing#tabs-sharing">clear</a>';
		echo '</div>';
		echo '</div><br />';
	}

	$row = $book;
	if (!empty($row)):
		// Double check that we're looking at the correct book
		if (!empty($book_id) && $row->book_id != $book_id) die('Could not match book with book ID');

	echo '<tr style="display:none;">';
	echo '<td><p>Title</p></td>';
	echo '<td colspan="2"><input name="title" type="text" value="'.htmlspecialchars($row->title).'" style="width:100%;" /></td>';
	echo '</tr>'."\n";

	echo '<tr typeof="books">';
	echo '<td><p>Availability</p>';
	echo '</td>'."\n";
	echo '<td style="vertical-align:middle;" colspan="2">';
	echo '<p>';
	echo 'Make URL public? &nbsp;<select name="url_is_public"><option value="0"'.(($row->url_is_public)?'':' selected').'>No</option><option value="1"'.(($row->url_is_public)?' selected':'').'>Yes</option></select>';
	echo '<br /><small>Book can be accessed via its URL without requiring login permissions</small>';
	echo '</p>';
	echo '<p>';
	echo 'Display in Scalar indexes? &nbsp;<select name="display_in_index"><option value="0"'.(($row->display_in_index)?'':' selected').'>No</option><option value="1"'.(($row->display_in_index)?' selected':'').'>Yes</option></select>';
	echo '<br /><small>Book will be listed in lists of public books, feeds, etc</small>';
	echo '</p>';
	echo "</td>\n";
	echo "</tr>\n";
	echo '<tr typeof="books">';
	echo '<td><p>Reviewability</p>';
	echo '</td>'."\n";
	echo '<td style="vertical-align:middle;" colspan="2">';
	echo '<p>';
	echo 'Automatically approve all user comments? &nbsp;<select id="auto-approve"><option value="0" selected>No</option><option value="1">Yes</option></select>';
	echo '<br /><small>If set to "No" comments are moderated and can be approved by authors in the Comments tab</small>';
	echo '</p>';
	echo '<p>';
	echo 'Email book authors about new comments? &nbsp;<select id="email-authors"><option value="0" selected>No</option><option value="1">Yes</option></select>';
	echo '<br /><small>If set to "Yes" users with author privileges (set in Book users tab) will be emailed when new comments are contributed</small>';
	echo '</p>';
	echo '<p>';
	echo 'Add the <a href="https://hypothes.is/" target="_blank">Hypothes.is</a> sidebar? &nbsp;<select id="hypothesis"><option value="0" selected>No</option><option value="1">Yes</option></select>';
	echo '<br /><small>A sidebar will be layered over your book adding <a href="https://hypothes.is/" target="_blank">Hypothes.is</a> collaborative review and commenting features</small>';
	echo '</p>';
	if(isset($plugins) && isset($plugins['thoughtmesh'])) {
		echo '<p>';
		echo 'Add the <a href="http://thoughtmesh.net/" target="_blank">Thoughtmesh</a> footer? &nbsp;<select id="thoughtmesh"><option value="0" selected>No</option><option value="1">Yes</option></select>';
		echo '<br /><small>A footer will be added to each page in your book adding <a href="http://thoughtmesh.net/" target="_blank">Thoughtmesh</a> page interconnection features</small>';
		echo '</p>';
	}
	echo "</td>\n";
	echo "</tr>\n";
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