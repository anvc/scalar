<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>

<script>
$(window).ready(function() {
    $('.save_changes').next('a').click(function() {
    	$('#user_form').submit();
    	return false;
    });
});
</script>

<? if (isset($_REQUEST['action']) && 'user_saved'==$_REQUEST['action']): ?>
<div class="saved">User profile has been saved<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">clear</a></div>
<? endif ?>
<? if (isset($_REQUEST['action']) && 'duplicated'==$_REQUEST['action']): ?>
<div class="saved">Book has been duplicated, you now have a new book present in the list of books at the bottom of the page<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">clear</a></div>
<? endif ?>
<? if (isset($_REQUEST['action']) && 'added'==$_REQUEST['action']): ?>
<div class="saved">Book has been created (now present in the list of books at the bottom of the page)<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">clear</a></div>
<? endif ?>
<? if (isset($_REQUEST['error']) && 'email_exists'==$_REQUEST['error']): ?>
<div class="error">The email address entered already exists in the system. Please try again with a different email.<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">clear</a></div>
<? endif ?>
<? if (isset($_REQUEST['error']) && 'fullname_required'==$_REQUEST['error']): ?>
<div class="error">Full name is a required field.  Please enter a full name and try again.<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">clear</a></div>
<? endif ?>
<? if (isset($_REQUEST['error']) && 'incorrect_password'==$_REQUEST['error']): ?>
<div class="error">Incorrect current password<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">clear</a></div>
<? endif ?>
<? if (isset($_REQUEST['error']) && 'password_match'==$_REQUEST['error']): ?>
<div class="error">New password and retype password do not match<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">clear</a></div>
<? endif ?>

<form action="<?=confirm_slash(base_url())?>system/dashboard" method="post" id="user_form">
<input type="hidden" name="action" value="do_save_user" />
<input type="hidden" name="id" value="<?=$login->user_id?>" />
<input type="hidden" name="book_id" value="<?=@$book_id?>" />
<table cellspacing="0" cellpadding="0" style="width:100%;" class="trim_horz_padding">
<? if ($login_is_super): ?>
<tr class="styling_sub">
	<td><h4 class="content_title">My account</h4></td><td></td>
</tr>
<tr class="odd" typeof="books">
	<td style="vertical-align:middle;white-space:nowrap;">Admin status</td>
	<td style="vertical-align:middle;">You are an admin</td>
</tr>
<? endif ?>
<tr class="odd" typeof="books">
	<td style="vertical-align:middle;white-space:nowrap;">Email (login)</td>
	<td style="vertical-align:middle;">
		<input name="email" type="text" value="<?=htmlspecialchars($login->email)?>" style="width:100%;" />
	</td>
</tr>
<tr class="odd" typeof="books">
	<td style="vertical-align:middle;white-space:nowrap;">Full name</td>
	<td style="vertical-align:middle;">
		<input name="fullname" type="text" value="<?=htmlspecialchars($login->fullname)?>" style="width:100%;" />
	</td>
</tr>
<tr class="odd" typeof="books">
	<td style="vertical-align:middle;white-space:nowrap;">Website</td>
	<td style="vertical-align:middle;">
		<input name="url" type="text" value="<?=htmlspecialchars($login->url)?>" style="width:100%;" placeholder="http://" />
	</td>
</tr>
<tr class="odd" typeof="books">
	<td style="vertical-align:middle;white-space:nowrap;">Change password</td>
	<td style="vertical-align:middle;">
		<span style="white-space:nowrap;">Current:
		<input name="old_password" type="password" value="" style="width:150px;" autocomplete="off" /></span>
		&nbsp; <span style="white-space:nowrap;">New:
		<input name="password" type="password" value="" style="width:150px;" autocomplete="off" /></span>
		&nbsp; <span style="white-space:nowrap;">Retype new:
		<input name="password_2" type="password" value="" style="width:150px;" autocomplete="off" /></span>
	</td>
</tr>
<tr>
	<td colspan="2" style="padding-top:18px;padding-bottom:16px;text-align:right;">
		<span class="save_changes">Changes have been made.</span> &nbsp; <a class="generic_button large default" href="javascript:;">Save</a>
	</td>
</tr>
</table>
</form>

<table cellspacing="0" cellpadding="0" width="100%" class="trim_horz_padding">
<tr class="styling_sub">
	<td colspan="2"><h4 class="content_title">My books</h4></td>
</tr>
<tr>
	<td style="vertical-align:top;" colspan="2">
		<form id="delete_books_form" action="<?=confirm_slash(base_url())?>system/dashboard" method="post">
		<input type="hidden" name="action" value="do_delete_books" />
		<input type="hidden" name="book_id" value="<?=@$book_id?>" />
		<table cellpadding="0" cellspacing="0" class="trim_padding">
			<?
			foreach ($my_books as $book) {
				$role = '(Could not determine role)';
				for ($j = 0; $j < count($book->users); $j++) {
					if ($book->users[$j]->user_id == $login->user_id) $role = ucwords($book->users[$j]->relationship);
				}
				$user_page_link = confirm_slash(base_url()).confirm_slash($book->slug).'users/'.$login->user_id;
				echo '<tr><td width="200px"><a href="'.confirm_slash(base_url()).$book->slug.'">'.$book->title.'</a></td><td width="150px">Role: '.$role.'</td><td>Bio page: <a href="'.$user_page_link.'">'.$user_page_link.'</a></td></tr>';
			}
			?>
		</table>
		</form>
	</td>
</tr>
<tr>
	<td style="vertical-align:middle;white-space:nowrap;" width="200px">Create new book</td>
	<td style="vertical-align:middle;">
		<form action="<?=confirm_slash(base_url())?>system/dashboard" method="post" onsubmit="if (!this.title.value.length||this.title.value=='New book title') {alert('Please enter a book title');return false;}">
		<input type="hidden" name="action" value="do_add_book" />
		<input type="hidden" name="user_id" value="<?=$login->user_id?>" />
		<input name="title" type="text" value="New book title" style="width:300px;" onclick="if (this.value=='New book title') this.value='';" />
		<input type="submit" value="Create" class="generic_button" />
		</form>
	</td>
</tr>
<tr>
	<td style="vertical-align:middle;white-space:nowrap;" width="200px">Duplicate a book</td>
	<td style="vertical-align:middle;">
		<form action="<?=confirm_slash(base_url())?>system/dashboard" method="post" onsubmit="if (!this.title.value.length||this.title.value=='New book title') {alert('Please enter a book title');return false;}">
		<input type="hidden" name="action" value="do_duplicate_book" />
		<input type="hidden" name="user_id" value="<?=$login->user_id?>" />
		<select name="book_to_duplicate" style="width:200px;">
<?
		if (!isset($duplicatable_books) || empty($duplicatable_books)):
			echo '<option value="0">There are no books with proper permissions</option>'."\n";
		else:
			echo '<option value="0">Please select a book</option>'."\n";
			foreach ($duplicatable_books as $duplicatable_book) {
				echo '<option value="'.$duplicatable_book->book_id.'">'.$duplicatable_book->title.'</option>'."\n";
			}
		endif;
?>
		</select>
		<input name="title" type="text" value="New book title" style="width:200px;" onclick="if (this.value=='New book title') this.value='';" />
		<input type="submit" value="Duplicate" class="generic_button" /><br />
		<small>Source book requires special permissions to be displayed in this list</small>
		</form>
	</td>
</tr>
<!--
<tr class="odd" typeof="books">
	<td style="vertical-align:middle;white-space:nowrap;">Delete book</td>
	<td style="vertical-align:middle;">Please contact a Scalar admin to delete books</td>
</tr>
-->
</table>