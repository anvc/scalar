<?php if (empty($book_user)): ?>
<div id="centered-message"><span>This is the user page template, however no user with the asked-for ID exists in this <?=$book->scope?>.</span></div>
<?php elseif (!isset($page) || empty($page)): ?>
<div id="centered-message"><span>This is a user page for <?=$book_user->fullname?>, but it hasn't been created yet.</span> <span>Click the <img src="http://localhost/scalar/system/application/views/melons/cantaloupe/images/edit_icon.png" alt="Edit button. Click to edit the current page or media." width="30" height="30"> button above to create one.</span></div>
<?php endif; ?>
<?php
if (!empty($book_user->url)) {
	$this->template->add_js('$(document).ready(function(){$(\'header h1[property="dcterms:title"]:first\').append(\'<a href="'.$book_user->url.'" class="btn btn-primary btn-sm" style="float:right;margin-top:10px;">Homepage</a>\');});','embed');
}
$content = (isset($page->version_index)) ? $page->versions[0]->content : null;
if (!empty($content)) {
	$content = nl2br($content);
	echo "\n".$content."\n";;
}
?>