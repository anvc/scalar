<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_css(path_from_file(__FILE__).'book_list.css')?>

<?
function print_books($books, $is_large=false) {
	echo '<ul class="book_icons">';
	foreach ($books as $row) {
		$uri 		   = confirm_slash(base_url()).$row->slug;
		$title		   = trim($row->title);
		$book_id       = (int) $row->book_id;
		$thumbnail     = (!empty($row->thumbnail)) ? confirm_slash($row->slug).$row->thumbnail : null;
		$is_live       = ($row->display_in_index) ? true : false;
		if (empty($thumbnail) || !file_exists($thumbnail)) $thumbnail = path_from_file(__FILE__).'default_book_logo.png';
		$authors = array();
		foreach ($row->users as $user) {
			if ($user->relationship!=strtolower('author')) continue;
			if (!$user->list_in_index) continue;
			$authors[] = $user->fullname;
		}
		echo '<li><a href="'.$uri.'"><img class="book_icon'.(($is_large)?'':' small').'" src="'.confirm_base($thumbnail).'" /></a><h4><a href="'.$uri.'">'.$title.'</a></h4>';
		if (count($authors)) {
			echo implode(', ',$authors);
			echo "<br />";
		}
		echo '</li>';
	}
	echo '</ul>';
}

?>

<?if ('1'==@$_REQUEST['user_created']): ?>
<div class="saved">
  Thank you for registering your <?=$cover_title?> account
  <a href="<?=$uri?>" style="float:right;">clear</a>
</div>
<? endif ?>
<? if ($this->config->item('index_msg')): ?>
<div class="saved msg"><?=$this->config->item('index_msg')?></div>
<? endif ?>
<?
if(!$login_is_super) {
	foreach ($other_books as $key => $row) {
		$is_live =@ ($row->display_in_index) ? true : false;
	    if(!$is_live){
    	    unset($other_books[$key]);
	    }
	}
}
?>
<div id="other_books"<?=(($login->is_logged_in)?'':' class="wide"')?>>
<?
if (count($featured_books) > 0) {
	echo '<h3>'.lang('welcome.featured_books').'</h3>';
	print_books($featured_books);
	echo '<br clear="both" />';
}
?>
<h3><?=lang('welcome.other_books')?></h3>
<form action="<?=base_url()?>" id="book_list_search">
<div>
<div><input type="text" name="sq" class="generic_text_input" value="<?=(isset($_REQUEST['sq'])?trim(htmlspecialchars($_REQUEST['sq'])):'')?>" /></div>
<div><input type="submit" class="generic_button" value="Search" /></div>
<div><button type="submit" class="generic_button" value="1" name="view_all" >View All</button></div>
</div>
</form>
<?
if (isset($book_list_search_error)) {
	echo '<p class="error">'.$book_list_search_error.'</p>';
}
?>
<br clear="both" />
<? if (count($other_books) > 0) print_books($other_books) ?>
</div>

<?
if ($login->is_logged_in) {
	echo '<div id="user_books"><h3>Your Books</h3>';
	if (count($user_books) > 0) {
		echo '<ul class="book_icons">';
		print_books($user_books, true);
	} else {
		echo '<p>You haven\'t created any books yet.</p>';
	}
	echo '</div>';
}
?>
<br clear="both" />