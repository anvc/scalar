<?php
if ($mode || !isset($page->user) || !isset($book->contributors) || !isset($page->version_index)) return;

// Check the page creator against the book's contributor
$page_by_contributor = false;
foreach ($book->contributors as $contrib) {
	if ($contrib->user_id == $page->user) {
		$page_by_contributor = true;
		break;
	}
}

// Check for attribution
$attribution = null;
// Impossible to designate an attribution if the page is by a contributor
if(!$page_by_contributor){
	if (isset($page->versions[$page->version_index]->attribution->fullname)) {
		if (!empty($page->versions[$page->version_index]->attribution->fullname)) $attribution = trim($page->versions[$page->version_index]->attribution->fullname);
	}
}
// Version has an attribution and should therefor state that it's by that other than the user
if (!empty($attribution)) {
	// Figure out what to call the page
	$page_name = ($page->type=='composite')?'page':'content';
	if (!empty($page->versions[$page->version_index]->path_of)) $page_name = 'path';
	if (!empty($page->versions[$page->version_index]->annotation_of)) $page_name = 'annotation';
	if (!empty($page->versions[$page->version_index]->tag_of)) $page_name = 'tag';
	if (!empty($page->versions[$page->version_index]->reply_of)) $page_name = 'comment';
	// TODO: review & commentary
	// Write the bar	
	echo '<div class="notice"><p>';
	echo 'This '.$page_name.' was written by '.$attribution;
	//echo ', who is not an author of this '.$book->scope.', ';
	echo ' on <a href="'.$base_uri.$page->slug.'.versions">'.date('j M Y, g:ia T', strtotime($page->versions[$page->version_index]->created)).'</a>.';
	echo '</p></div>';	
}

// Page was created by someone other than a book contributor
elseif (!$page_by_contributor) {
	$page_name = ($page->type=='composite')?'page':'content';
	if (!empty($page->versions[$page->version_index]->path_of)) $page_name = 'path';
	if (!empty($page->versions[$page->version_index]->annotation_of)) $page_name = 'annotation';
	if (!empty($page->versions[$page->version_index]->tag_of)) $page_name = 'tag';
	if (!empty($page->versions[$page->version_index]->reply_of)) $page_name = 'comment';	
	// TODO: review & commentary
	echo '<div class="notice"><p>';
	echo 'This '.$page_name.' was created by ';
	if (empty($page->user)) {
		echo 'an anonymous contributor';
	} elseif (isset($page->user->fullname)) { 
		echo $page->user->fullname;
	} else {
		echo '(Unknown user)';
	}
	echo '.&nbsp; ';
	if (isset($page->versions) && !empty($page->versions) && $page->versions[$page->version_index]->user->user_id != $page->user->user_id) {
		$fullname = $page->versions[0]->user->fullname;
		if (empty($fullname)) $fullname = '(Unknown user)';
		echo 'The last update was by '.$page->versions[0]->user->fullname.'.';
	}
	echo '</p></div>';
}

// Is a review or commentary (by the authors of the book)
elseif (!empty($page->category)) {
	$page_name = ($page->type=='composite')?'page':'content';
	if (!empty($page->versions[$page->version_index]->path_of)) $page_name = 'path';
	if (!empty($page->versions[$page->version_index]->annotation_of)) $page_name = 'annotation';
	if (!empty($page->versions[$page->version_index]->tag_of)) $page_name = 'tag';
	if (!empty($page->versions[$page->version_index]->reply_of)) $page_name = 'comment';	
	echo '<div class="notice"><p>';
	echo 'This '.$page_name.' is a <b>'.strtolower($page->category).'</b> on the '.$book->scope.', written by ';
	echo $page->user->fullname;
	echo ' on <a href="'.$base_uri.$page->slug.'.versions">'.date('j M Y, g:ia T', strtotime($page->versions[$page->version_index]->created)).'</a>.';
	if (isset($page->versions) && !empty($page->versions) && $page->versions[$page->version_index]->user != $page->user) {
		$fullname = $page->versions[0]->user->fullname;
		if (empty($fullname)) $fullname = '(Unknown user)';
		echo '<br />The last update was by '.$page->versions[0]->user->fullname.' on <a href="'.$_SERVER['REDIRECT_URL'].'.versions">'.date('j M Y, g:ia T', strtotime($page->versions[0]->created)).'</a>.';
	}	
	echo '</p></div>';
}

// Page isn't visible
if (isset($page->is_live) && !$page->is_live) {
	echo '<div class="error"><p>This page is hidden and is only viewable by '.$book->scope.' contributors.&nbsp; It can be made visible below or in the Dashboard.</p></div>';
}

// Page is paywalled
// NOTE: this is removed, though hidden rather than commented out so that JS could bring it back if an author wishes to
if (isset($page->paywall) && $page->paywall) {
	echo '		<div class="notice" style="display:none;"><p>This page is behind a paywall, but is viewable due to your logged in credentials.</p></div>'."\n";
}

//RDF Attributes do not work in IE <= 9
if(isset($_SERVER['HTTP_USER_AGENT']) && preg_match('/(?i)msie ([1-9])[^0-9]/',$_SERVER['HTTP_USER_AGENT'],$matches)) {
	echo '<div class="error"><p>You are currently running Internet Explorer '.$matches[1].'.  Scalar requires IE 10 or greater to properly view Scalar Books.</p></div>'."\n";
}

// Message for delete and save
if (isset($_REQUEST['action']) && $_REQUEST['action'] == 'deleted'): 
	$old_title =@ $_REQUEST['dt'];
	echo '<div class="error"><p>Item with title "'.$old_title.'" has been deleted<a style="float:right;" href="'.$_SERVER['REDIRECT_URL'].'">clear</a></p></div>'."\n";
elseif (isset($_REQUEST['action']) && $_REQUEST['action'] == 'saved'):
	echo '<div class="saved"><p>Page has been saved <span style="float:right"><a href="'.$_SERVER['REDIRECT_URL'].'.versions">view history</a>&nbsp;|&nbsp;<a href="'.$_SERVER['REDIRECT_URL'].'.edit">edit again</a>&nbsp;|&nbsp;<a href="'.$_SERVER['REDIRECT_URL'].'">clear</a></p></div>'."\n";
endif;

// Errors handled by HTML and Javaacript (No Javascript warning, old IE warning)
?>
<noscript>
<div class="error"><p>This site requires Javascript to be turned on. Please <a href="http://www.btny.purdue.edu/enablejavascript.html">enable Javascript</a> and reload the page.</p></div>
</noscript>
<div class="error" id="ie_warning"><p>You appear to be using an older verion of Internet Explorer.  For the best experience please upgrade your IE version or switch to a another web browser.</p></div>
<? 
$msg = $this->config->item('book_msg');
$cookie = $this->config->item("book_msg_cookie_name");
if (!empty($msg)) echo "<div class=\"scalarnotice\" style=\"display:none;\" data-cookie=\"".((!empty($cookie))?$cookie:'scalar_hide_book_msg')."\">$msg</div>\n";
?>
