<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_css(path_from_file(__FILE__).'login.css')?>
<?
echo '<div class="login">';
// Logged in
if ($login->is_logged_in):
	echo (!empty($login->fullname)) ? $login->fullname : lang('login.unknown_user');
	echo '&nbsp; <a href="'.confirm_slash(base_url()).'system/logout?action=do_logout&redirect_url='.urlencode($_SERVER['REQUEST_URI']).'" onclick="return confirm(\''.lang('login.confirm_sign_out').'\')">'.lang('login.sign_out').'</a>';
	echo '<br />'."\n";
	if (isset($book->book_id) && !empty($user_level)):
		echo lang('login.you_have')."\n";
		echo $user_level;
		echo ' ';
		echo lang('login.privileges');
		echo '<br />'."\n";
	endif;
	if (!empty($book) && $this->uri->rsegments[1]=='system' && $this->uri->rsegments[2]=='dashboard') {
		echo '<a href="'.confirm_slash(base_url()).$book->slug.'">Back to '.$book->scope.'</a>'."\n";
	} elseif ($this->uri->rsegments[1]=='system' && $this->uri->rsegments[2]=='dashboard') {
		echo '<a href="'.confirm_slash(base_url()).'">'.lang('login.back_to_index').'</a>'."\n";
	} elseif (!empty($book) && $user_level!='Author') {
		// echo '<span class="disabled_link">'.lang('login.manage_content').'</span>'."\n";
	} else {
		echo '<a href="'.confirm_slash(base_url()).'system/dashboard?book_id='.((isset($book->book_id))?$book->book_id:'').'&zone=style#tabs-style">'.lang('login.manage_content').'</a> | <a href="'.confirm_slash(base_url()).'">'.lang('login.index').'</a>'.' | <a href="http://scalar.usc.edu/works/guide2">'.lang('login.guide').'</a>';
	}
// Not logged in
else:
	echo '<a href="'.confirm_slash(base_url()).'system/login?redirect_url='.urlencode($_SERVER['REQUEST_URI']).'">';
	echo lang('login.sign_in');
	echo '</a> ';
	echo lang('or');
	echo ' <a href="'.confirm_slash(base_url()).'system/register?redirect_url='.urlencode($_SERVER['REQUEST_URI']).'">';
	echo lang('login.register');
	echo '</a><br />';
	echo lang('login.more_privileges').'<br />';
endif;
echo "</div>\n";
?>