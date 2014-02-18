<?php
	if (!defined('BASEPATH')){ exit('No direct script access allowed'); }
	
	echo '<div class="login">',PHP_EOL;
	// Logged in
	if ($login->is_logged_in){
		echo (!empty($login->fullname)) ? $login->fullname : lang('login.unknown_user');
		echo '&nbsp; <a href="'.strip_base_ssl().'system/logout?action=do_logout&redirect_url='.urlencode($_SERVER['REQUEST_URI']).'" onclick="return confirm(\''.lang('login.confirm_sign_out').'\')">'.lang('login.sign_out').'</a>';
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
		} else if ($this->uri->rsegments[1]=='system' && $this->uri->rsegments[2]=='dashboard') {
			echo '<a href="'.confirm_slash(base_url()).'">'.lang('login.back_to_index').'</a>'."\n";	
		} else if (!empty($book) && $user_level!='Author') {
			// echo '<span class="disabled_link">'.lang('login.manage_content').'</span>'."\n";	
		} else {
			echo '<a href="'.confirm_slash(base_url()).'system/dashboard?book_id='.@$book->book_id.'&zone=style#tabs-style">'.lang('login.manage_content').'</a> | <a href="'.confirm_slash(base_url()).'">'.lang('login.index').'</a>'.' | <a href="http://scalar.usc.edu/works/guide">'.lang('login.guide').'</a>';
		}
	// Not logged in
	}else{
		$login_url = $this->config->item('force_https') ? base_ssl() : base_url();
	
		echo '<a href="'.$login_url.'system/login?redirect_url='.urlencode($_SERVER['REQUEST_URI']).'">', lang('login.sign_in'), '</a> ',
				  lang('or'),
				  ' <a href="'.$login_url.'system/register?redirect_url='.urlencode($_SERVER['REQUEST_URI']).'">', lang('login.register'), '</a> ',
				  lang('login.more_privileges');
	}
	echo PHP_EOL,'</div>',PHP_EOL; 
?>