<?
if ($mode || !isset($page->version_index)) return;

function print_comments($has_reply, $book, $base_uri, $user_id=0, $level=0) {
	
	if (!$has_reply) return $has_reply;
	$indent_px = 50;
	$indent = ($indent_px * $level);
	$count = 0;

	foreach ($has_reply as $reply):

		if (!$reply->is_live) continue;
		$reply_version = $reply->versions[$reply->version_index];
		echo '<div class="comment level-'.$level.'" style="margin-left:'.$indent.'px"><a name="comment-'.$reply_version->version_id.'"></a>'."\n";
		if (!empty($reply_version->title)) echo '<p class="comment_title">'.$reply_version->title.'</p>'."\n";
		echo nl2br(trim($reply_version->content));
		if (!empty($reply_version->url)) {
			echo '<a href="'.$reply_version->url.'" target="_blank" title="Feature coming soon: media displayed inline">'.$reply_version->url.'</a>';
		}
		echo '<p class="comment_attrib">';
		echo 'Posted on '.date('j F Y, g:i a', strtotime($reply_version->datetime));
		echo ' by ';
		if (isset($reply_version->attribution->fullname) && !empty($reply_version->attribution->fullname)) {
			echo $reply_version->attribution->fullname;
		} else {
			echo '<a href="'.$base_uri.'users/'.$reply_version->user.'">';
			echo ((!empty($reply_version->fullname))?$reply_version->fullname:'(Missing name)');
			echo '</a>';			
		}
		echo ' &nbsp;<span style="font-size:smaller;">| &nbsp;';
		echo '<a href="'.$base_uri.$reply->slug.'" title="Permalink" onclick="return commentCheckPermalink(this);">Permalink</a>';
		echo '</span>';
		echo '</p>'."\n";
		echo '</div><!--comment-->'."\n";

		print_comments(@$reply_version->has_replies, $book, $base_uri, $user_id, ($level+1));
		
		$count++;
		
	endforeach;		
	
	return $count;
	
}

function count_live($replies) {
	
	$count = 0;
	foreach ($replies as $reply):
		if ($reply->is_live) $count++;
	endforeach;
	return $count;
	
}

$type = ($page->type == 'composite') ? 'page' : 'media';
?>
<!-- Reply list -->
<div id="reply_list">
  
 <? if (isset($page->versions[$page->version_index]->has_replies) && $count=count_live($page->versions[$page->version_index]->has_replies)): ?>
	<a href="javascript:;" class="inline_icon_link reply reply_link">Join this <?=$type?>'s discussion (<?=$count?> comment<?=(($count>1)?'s':'')?>)</a>
<? else: ?>
	<a href="javascript:;" class="inline_icon_link reply reply_link">Comment on this <?=$type?></a>
<? endif ?> 
  
    
  
	<div class="maximize" id="comments" style="opacity: 1;">
		<div class="maximize_fade"></div>
		<div class="maximize_content maximize_content_static_width">	
			<div class="mediaElementHeader mediaElementHeaderWithNavBar">
				<ul class="nav_bar_options">
					<span class="downArrow"><li id="max_desc_button" class="sel" title="Comments for this page">Local Discussion</li></span>
					<span class="noArrow"><li id="max_perm_button" title="Load comments in a new browser window" onclick="popoutComments();">Popout</li></span>
				</ul>
				<span class="close_link"><a id="close_link" title="Close" href="javascript:;">&nbsp;</a></span>
				<p class="mediaElementAlignRight" style="display: block; "></p>
			</div>
			<div class="comments">
				<h4 class="content_title">Discussion of "<?=str_replace('"',"'",$page->versions[$page->version_index]->title)?>"</h4>
			<? if (@$_GET['action']=='comment_saved'): ?>
			<div class="saved" style="margin-bottom:14px;"><b>Your comment has been saved and is now awaiting moderation.</b><br />Thank you for your contribution!</div>
			<? endif ?>				
				<div class="discussion">
	
<?	
				$num_comments = print_comments(@$page->versions[$page->version_index]->has_replies, $book, $base_uri, @$login->user_id);		
				if (!$num_comments && !@$_GET['action']=='comment_saved') echo '<p>No comments yet.</p>';
?>
				</div><!--discussion-->  

	<div id="comment_contribute">
		<h4 class="content_title">Add your voice to this discussion.</h4>
		<p id="checking_logged_in_status">Checking your signed in status ...</p>
		<p id="commenter_logged_in" style="display:none;">You are signed in as <a title="Your user page" href=""></a> (<a href="javascript:void(null);" title="Logout">Sign out</a>).&nbsp; To comment, enter your name and text below. Comments are moderated. Please be respectful.</p>
		<p id="commenter_anonymous" style="display:none;">To comment, enter your name and text below (you can also <a href="<?=confirm_slash(base_url())?>system/login?redirect_url=<?=urlencode(urlencode($_SERVER['REQUEST_URI'].'#comments'))?>">sign in</a> to use your Scalar account).<br />Comments are moderated. Please be respectful.</p>
		<div id="comment_form_wrapper" style="display:none;">
			<form id="comment_contribute_form" method="post" action="<?=$base_uri.$page->slug?>#comments" onsubmit="ajaxComment();return false;">
			<input type="hidden" name="action" value="ADD" />
			<input type="hidden" name="scalar:child_urn" value="<?=$page->versions[$page->version_index]->urn?>" />		
			<input type="hidden" name="dcterms:description" value="" />
			<input type="hidden" name="user" value="0" id="comment_user_id" />
			<input type="hidden" name="recaptcha_public_key" value="<?=$recaptcha_public_key?>" />
			<table class="form_fields comment_form_table"><tbody>
			<tr id="comment_your_name"><td class="field">Your name</td><td class="value"><input type="text" name="fullname" value="" class="input_text"></td></tr>
			<tr><td class="field">Comment title</td><td class="value"><input type="text" name="dcterms:title" value="" class="input_text"></td></tr>
			<tr><td class="field">Content<br /><small style="color:#222222;"><?=htmlspecialchars('<a><i><u><b>')?></small></td><td class="value"><textarea name="sioc:content" value="" rows="6" class="input_text"></textarea></td></tr>
			<tr id="comment_captcha"><td class="field">CAPTCHA<br /></td><td class="value" id="comment_captcha_wrapper"></td></tr>
			<tr><td></td><td class="form_buttons" colspan="4"><input type="submit" class="generic_button large" title="Post comment" value="Post comment" /></td></tr>
			</tbody></table>
			</form>
		</div>
	</div>
						
				</div><!--comments-->
		</div><!--maximize_content-->
	</div><!--maximize-->	  
  
</div>
