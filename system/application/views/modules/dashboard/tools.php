<script>
$(document).ready(function() {
	$('#do_delete_books_form').on('submit', function() {
		if (!$(this).prev().find('input:checked').length) return false;
		var msg='Are you sure you wish to delete the selected books';
		if ($(this).find('[name="delete_creators"]').val()==1) msg+=' and their creator user accounts';
		if (!confirm(msg+'?')) return false;
		var book_ids=[];
		$(this).prev().find('input:checked').each(function() {
			book_ids.push($(this).val());
		});
		$(this).find('[name="book_ids"]').val(book_ids.join(','));
		return true;
	});
	$('#do_delete_users_form').on('submit', function() {
		if (!$(this).prev().find('input:checked').length) return false;
		var msg='Are you sure you wish to delete the selected users';
		if ($(this).find('[name="delete_books"]').val()==1) msg+=' and books they author';
		msg += '?';
		if ($(this).find('[name="delete_books"]').val()==1) msg+=' This might include books with multiple authors.';
		if (!confirm(msg)) return false;
		var user_ids=[];
		$(this).prev().find('input:checked').each(function() {
			user_ids.push($(this).val());
		});
		$(this).find('[name="user_ids"]').val(user_ids.join(','));
		return true;
	});
	$('.div_list').find('input[type="checkbox"]').on('change', function() {
		var checked = $(this).is(':checked') ? true : false;
		if (checked) {
			$(this).closest('div').addClass('active');
		} else {
			$(this).closest('div').removeClass('active');
		};
	});
});
</script>
<h4>Admin Tools</h4>
<form action="<?=confirm_slash(base_url())?>system/dashboard#tabs-tools" method="post">
<input type="hidden" name="zone" value="tools" />
<input type="hidden" name="action" value="get_recent_book_list" />
List all books:&nbsp; <input type="submit" value="Generate" />&nbsp; <a href="?zone=tools#tabs-tools">clear</a>
<span style="float:right;">Delete books and their creators from this list; links open All Books or All Users tab in new window</span>
<div class="div_list"><?php
	if (!isset($recent_book_list)) {

	} elseif (empty($recent_book_list)) {
		echo 'No books could be found!';
	} else {
		foreach($recent_book_list as $book) {
			echo '<div>';
			echo '<label><input type="checkbox" name="book_id[]" value="'.$book->book_id.'" /> &nbsp; ';
			echo date('Y-m-d', strtotime($book->created)).'</label> &nbsp; ';
			echo '<a href="'.base_url().'system/dashboard?zone=all-books&id='.$book->book_id.'#tabs-all-books" target="_blank">'.((!empty($book->title))?trim($book->title):'(No title)').'</a> &nbsp; ';
			echo (!empty($book->subtitle)) ? $book->subtitle.' &nbsp; ' : '';
			echo (!empty($book->description)) ? $book->subtitle.' &nbsp; ' : '';
			if (!empty($book->creator)) {
				echo 'created by <a href="'.base_url().'system/dashboard?zone=all-users&id='.$book->creator->user_id.'#tabs-all-users" target="_blank">';
				echo $book->creator->fullname;
				echo '</a> &nbsp; ';
			} else {
				echo 'created by user no longer exists &nbsp; ';
			}
			echo '</div>'."\n";
		}
	}
echo '</div>'."\n";
echo '</form>'."\n";
if (isset($recent_book_list) && !empty($recent_book_list)) {
	echo '<form id="do_delete_books_form" action="'.confirm_slash(base_url()).'system/dashboard#tabs-tools" method="post" style="text-align:right;">';
	echo '<input type="hidden" name="zone" value="tools" />';
	echo '<input type="hidden" name="action" value="do_delete_books" />';
	echo '<input type="hidden" name="book_ids" value="" />';
	echo '<input type="hidden" name="delete_creators" value="0" />';
	echo '<input type="submit" value="Delete selected books" onclick="$(this).closest(\'form\').find(\'[name=\\\'delete_creators\\\']\').val(0)" /> &nbsp; ';
	echo '<input type="submit" value="Delete selected books and their creator user accounts" onclick="$(this).closest(\'form\').find(\'[name=\\\'delete_creators\\\']\').val(1)" />';
	echo '</form>'."\n";
}
?>
<br />
<form action="<?=confirm_slash(base_url())?>system/dashboard#tabs-tools" method="post">
<input type="hidden" name="zone" value="tools" />
<input type="hidden" name="action" value="get_recent_users" />
List all users:&nbsp; <input type="submit" value="Generate" />&nbsp; <a href="?zone=tools#tabs-tools">clear</a>
<span style="float:right;">Delete users from this list; link opens All Users tab in new window</span>
<div class="div_list"><?php
	if (!isset($recent_user_list)) {

	} elseif (empty($recent_user_list)) {
		echo 'No users could be found!';
	} else {
		foreach($recent_user_list as $user) {
			echo '<div>';
			echo '<label><input type="checkbox" name="user_id[]" value="'.$user->user_id.'" /> &nbsp; ';
			echo $user->email.'</label> &nbsp; ';
			echo '<a href="'.base_url().'system/dashboard?zone=all-users&id='.$user->user_id.'#tabs-all-users" target="_blank">'.((!empty($user->fullname))?trim($user->fullname):'(No fullname)').'</a> &nbsp; ';
			echo (!empty($user->url)) ? '<a href="'.$user->url.'" target="_blank">'.$user->url.'</a> &nbsp; ' : '';
			echo '</div>'."\n";
		}
	}
echo '</div>'."\n";
echo '</form>'."\n";
if (isset($recent_user_list) && !empty($recent_user_list)) {
	echo '<form id="do_delete_users_form" action="'.confirm_slash(base_url()).'system/dashboard#tabs-tools" method="post" style="text-align:right;">';
	echo '<input type="hidden" name="zone" value="tools" />';
	echo '<input type="hidden" name="action" value="do_delete_users" />';
	echo '<input type="hidden" name="user_ids" value="" />';
	echo '<input type="hidden" name="delete_books" value="0" />';
	echo '<input type="submit" value="Delete selected users" onclick="$(this).closest(\'form\').find(\'[name=\\\'delete_books\\\']\').val(0)" /> &nbsp; ';
	echo '<input type="submit" value="Delete selected users and books they author" onclick="$(this).closest(\'form\').find(\'[name=\\\'delete_books\\\']\').val(1)" />';
	echo '</form>'."\n";
}
?>
<br />
<form action="<?=confirm_slash(base_url())?>system/dashboard#tabs-tools" method="post">
<input type="hidden" name="zone" value="tools" />
<input type="hidden" name="action" value="get_email_list" />
Generate email list:&nbsp; <input type="submit" value="Generate" />&nbsp; <a href="?zone=tools#tabs-tools">clear</a>
<span style="float:right;">Please cut-and-paste into the "Bcc" (rather than "Cc") field to protect anonymity</span>
<textarea class="textarea_list"><?php
	if (!isset($email_list)) {

	} elseif (empty($email_list)) {
		echo 'No email addresses could be found';
	} else {
		echo implode(", ", $email_list);
	}
?></textarea>
</form>
<br />
<form action="<?=confirm_slash(base_url())?>system/dashboard#tabs-tools" method="post">
<input type="hidden" name="zone" value="tools" />
<input type="hidden" name="action" value="recreate_book_folders" />
Recreate book folders:&nbsp; <input type="submit" value="Recreate" />&nbsp; <a href="?zone=tools#tabs-tools">clear</a>
<span style="float:right;">Will rebuild book folders that may have gone missing from the Scalar root directory</span>
<textarea class="textarea_list"><?php
	if (!isset($book_list)) {

	} elseif (empty($book_list)) {
		echo 'No book folders required recreating';
	} else {
		echo implode("\n", $book_list);
	}
?></textarea>
</form>
