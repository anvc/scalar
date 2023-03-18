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
	$('#do_remove_disallowed_emails').on('submit', function() {
		var emails = [];
		$('#disallowed_emails_form').find('.div_list').find('input[type="checkbox"]').each(function() {
			var $this = $(this);
			if ($this.is(':checked')) return;
			var _email = $(this).val();
			emails.push(_email);
		});
		emails.sort();
		$(this).find('input[name="emails"]').val(emails.join(','));
		return true;
	});
	$('#do_save_disallowed_emails').on('submit', function() {
		var email = $(this).find('[name="email"]').val();
		if (!email.length) return false;
		var emails = [email];
		$('#disallowed_emails_form').find('.div_list').find('input[type="checkbox"]').each(function() {
			var _email = $(this).val();
			emails.push(_email);
		});
		emails.sort();
		$(this).find('input[name="emails"]').val(emails.join(','));
		return true;
	});
	$('#disallowed_emails_form').find('.div_list').on('click', 'a', function() {
		$(this).parent().remove();
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
<input type="hidden" name="action" value="enable_google_authenticator" />
Google Authenticator
<span style="float:right;">Enable two-factor authentication</span>
<div style="margin-top:12px;"><div style="width:49%;float:left;"><?php 
	$salt = $this->config->item('google_authenticator_salt');
	if (empty($salt)) {
		echo 'Two factor authentication is disabled. To enable, enter a "google_authenticator_salt" key in local_settings.php.'."\n";
	} else {
		echo 'To enable two-factor authentication for your super admin account (<b>'.$login->email.'</b>) first open Google Authenticator on your device and scan the QR code:<br />'."\n";
		echo $qr_image;
		echo '<br />';
		echo 'Then, check the box below to enable two-factor authentication for your account:<br />';
		echo '<label><input style="margin-top:8px;" type="checkbox" name="enable_google_authenticator" value="1" '.(($google_authenticator_is_enabled)?'checked':'').' /> &nbsp;Enable two-factor authentication for my account</labe><br />';
		echo '<input type="submit" value="Save" style="margin-top:8px;" />';
	}
?></div><div style="width:49%;float:right;border-left:solid 1px #aaaaaa;padding-left:20px;">
	List of super admins (<b>bold</b> = authentication enabled):<br /><br /><?php 
	foreach ($super_admins as $admin) {
		$enabled = (isset($admin->google_authenticator_is_enabled) && $admin->google_authenticator_is_enabled) ? true : false; 
		echo (($enabled)?'<b>':'').$admin->fullname.' ('.$admin->email.')'.(($enabled)?'</b>':'').'<br />';
	}
	?>
</div>
</form>
<br clear="both" /><br />
<form action="<?=confirm_slash(base_url())?>system/dashboard#tabs-tools" method="post" id="disallowed_emails_form">
<input type="hidden" name="zone" value="tools" />
<input type="hidden" name="action" value="get_disallowed_emails" />
List disallowed email addresses:&nbsp; <input type="submit" value="Generate" />&nbsp; <a href="?zone=tools#tabs-tools">clear</a>
<span style="float:right;">Disallow email addresses from being used to register or login</span>
<div class="div_list"><?php
	if (!isset($disallowed_emails)) {

	} elseif (empty($disallowed_emails)) {

	} else {
		foreach($disallowed_emails as $email) {
			echo '<div><label>';
			echo '<input type="checkbox" name="email[]" value="'.$email.'" /> &nbsp; ';
			echo $email;
			echo '</label></div>'."\n";
		}
	}
echo '</div>'."\n";
echo '</form>'."\n";
if (isset($disallowed_emails)) {
	echo '<form id="do_remove_disallowed_emails" action="'.confirm_slash(base_url()).'system/dashboard?zone=tools#tabs-tools" method="post" style="display:inline-block;margin-top:3px;float:right;">';
	echo '<input type="hidden" name="action" value="do_save_disallowed_emails" />';
	echo '<input type="hidden" name="emails" value="" />';
	echo '<input type="submit" class="btn btn-default" value="Remove selected from list" />';
	echo '</form>';
	echo '<form id="do_save_disallowed_emails" action="'.confirm_slash(base_url()).'system/dashboard?zone=tools#tabs-tools" method="post" style="display:inline-block;margin-top:3px;">';
	echo '<input type="hidden" name="action" value="do_save_disallowed_emails" />';
	echo '<input type="hidden" name="emails" value="" />';
	echo '<input type="text" name="email" value="" placeholder="name@example.com" class="form-control" style="display:inline-block;width:200px;position:relative;top:1px;" /> ';
	echo '<input type="submit" value="Add email" class="btn btn-primary" /> &nbsp; ';
	echo '</form>'."\n";
}
?>
<br clear="both" /><br />
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
<input type="hidden" name="action" value="get_recent_pages" />
List recently edited pages:&nbsp; <input type="submit" value="Generate" />&nbsp; <a href="?zone=tools#tabs-tools">clear</a>
<span style="float:right;">Lists the 200 most recently edited pages, across all books</span>
<div class="div_list"><?php
	if (!isset($recent_pages_list)) {

	} elseif (empty($recent_pages_list)) {
		echo 'No content could be found';
	} else {
		foreach($recent_pages_list as $page) {
			echo '<div>';
			echo '<a href="'.confirm_slash(base_url()).$page->book_slug.'/'.$page->page_slug.'">'.$page->page_slug.'</a>';
			echo '</div>'."\n";
		}
	}
?></div>
</form>
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
<br />
<form action="<?=confirm_slash(base_url())?>system/dashboard#tabs-tools" method="post">
<input type="hidden" name="zone" value="tools" />
<input type="hidden" name="action" value="normalize_predicate_table" />
Normalize predicate table:&nbsp; <input type="submit" value="Normalize" />&nbsp; <a href="?zone=tools#tabs-tools">clear</a>
<span style="float:right;">Will remove duplicates from the ARC2 id2val table so that predicate searches work as expected</span>
<textarea class="textarea_list"><?php
	if (!isset($normalize_predicate_table)) {

	} elseif (empty($normalize_predicate_table)) {
		echo 'No book folders required recreating';
	} else {
		echo implode("\n", $normalize_predicate_table);
	}
?></textarea>
</form>
