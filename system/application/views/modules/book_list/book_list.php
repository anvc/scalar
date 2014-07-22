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

function print_search_bar() {
	echo "<span id=\"book_list_search\">";
	echo "<form action=\"" . base_url() . "\" method=\"post\">";
	echo "<input type=\"text\" name=\"bl_search\" />";
	echo "<input type=\"submit\" value=\"Search\" />";
	echo "<input type=\"submit\" value=\"View All\" name=\"view_all\" id=\"view_all\" />";
	echo "</form>";
	echo "</span>";
	echo '<br clear="both" />';

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
$user_books = array();
$featured_books = array();
$other_books = array();

if(!$view_all && ($bl_search !== false)) {
	$temp_books = $this->books->search($bl_search);

	foreach ($temp_books as $row) {
		$is_live       =@ ($row->display_in_index) ? true : false;
		$is_featured   =@ ($row->is_featured) ? true : false;
		
		if ((!$is_featured && $is_live) || (!$is_live && $login_is_super)) {
		 	$other_books[] = $row;
		}		
	}
}

foreach ($books as $row) {

	$book_id       =@ (int) $row->book_id;
	$is_live       =@ ($row->display_in_index) ? true : false;
	$is_featured   =@ ($row->is_featured) ? true : false;
	$hide_other    =  ($this->config->item('index_hide_published')) ? true : false;
	
	if ($is_featured && $is_live) {
		$featured_books[] = $row;
	} elseif ($view_all && ($is_live || $login_is_super)) {
		$other_books[] = $row;
	}
	
	if (in_array($book_id, $login_book_ids)) {
		$user_books[] = $row;
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
print_search_bar();
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