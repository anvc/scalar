<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_css(path_from_file(__FILE__).'book_list.css')?>

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
$other_books = array();

foreach ($books as $row) {

	$book_id       = (int) $row->book_id;
	$is_live       = ($row->display_in_index) ? true : false;
	
	if ($is_live || $login_is_super) {
		$other_books[] = $row;
	}
	
	if (in_array($book_id, $login_book_ids)) {
		$user_books[] = $row;
	}
	
}
?>
<?
if ($login->is_logged_in) {
	echo '<div id="other_books">';
} else {
	echo '<div id="other_books" class="wide">';
}
if (count($other_books) > 0) {
	echo '<h3>Public Books</h3><ul class="book_icons">';
	foreach ($other_books as $row) {
	
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
	
		echo '<li><a href="'.$uri.'"><img class="book_icon small" src="'.confirm_base($thumbnail).'" /></a><h4><a href="'.$uri.'">'.$title.'</a></h4>';
		if (count($authors)) {
			echo implode(', ',$authors);
			echo "<br />";
		}
		echo '</li>';
	}
	echo '</ul>';
}
echo '</div>';
?>
<?
if ($login->is_logged_in) {
	echo '<div id="user_books"><h3>Your Books</h3>';
	if (count($user_books) > 0) {
		echo '<ul class="book_icons">';
		foreach ($user_books as $row) {
		
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
		
			echo '<li><a href="'.$uri.'"><img class="book_icon" src="'.confirm_base($thumbnail).'" /></a><h4><a href="'.$uri.'">'.$title.'</a></h4>';
			if (count($authors)) {
				echo implode(', ',$authors);
				echo "<br />";
			}
			echo '</li>';
		}
		echo '</ul>';
	} else {
		echo '<p>You haven\'t created any books yet.</p>';
	}
	echo '</div>';
}
?>
<br clear="both" />