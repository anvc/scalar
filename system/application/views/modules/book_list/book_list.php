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
<?if (!$login->is_logged_in):?>
<!--<div>
  <strong><a href="<?=confirm_slash($this->config->item('force_https') ? base_ssl() : base_url())?>system/login?redirect_url=<?=urlencode($_SERVER['REQUEST_URI'])?>">Sign in</a> 
  to view your books and further options</strong>
</div>-->
<? else: ?>
<!--<div><?=lang('welcome.showing_books')?></div>-->
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
<?
echo '<div id="other_books"'.(($login->is_logged_in)?'':' class="wide"').'>';
if (count($featured_books) > 0) {
	echo '<h3>'.lang('welcome.featured_books').'</h3>';
	print_books($featured_books);
	echo '<br clear="both" />';
}

echo '<h3>'.lang('welcome.other_books').'</h3>';
echo "<span id=\"book_list_search\">";
echo "<form action=\"" . base_url() . "\" method=\"get\">";
echo "<input type=\"text\" name=\"sq\" />";
echo "<input type=\"submit\" class=\"generic_button\" value=\"Search\" />";
echo "<button type=\"submit\" class=\"generic_button\" value=\"1\" name=\"view_all\">View All</button>";
echo "</form>";
echo "</span>";
echo '<br clear="both" />';
if (count($other_books) > 0) {
	print_books($other_books);
}

echo '</div>';
?>
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