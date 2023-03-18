<?php if (empty($book_user)): ?>
<div id="centered-message"><span>This is the user page template, however no user with the asked-for ID exists in this <?=$book->scope?>.</span></div>
<?php elseif (!isset($page) || empty($page)): ?>
<div id="centered-message"><span>This is a user page for <?php
if (!empty($book_user->url)) echo '<a href="'.$book_user->url.'">';
echo $book_user->fullname;
if (!empty($book_user->url)) echo '</a>';
?>, but it hasn't been created yet.</span>
<?php if ($login->is_logged_in): ?>
<span>Click the <img src="<?=base_url('application/views/melons/cantaloupe/images/edit_icon.png')?>" alt="Edit button. Click to edit the current page or media." width="30" height="30"> button above to create one.</span></div>
<?php endif; ?>
<?php endif; ?>
<?php
if (!empty($book_user->url)) {
	$this->template->add_js('$(document).ready(function(){$(\'header h1[property="dcterms:title"]:first\').before(\'<a href="'.$book_user->url.'" class="btn btn-primary" style="float:right;margin-top:10px;margin-right:7.2rem;">'.$book_user->fullname.'\\\'s Homepage</a>\');});','embed');
}
$content = (isset($page->version_index)) ? $page->versions[0]->content : null;
if (!empty($content)) {
	$content = nl2br($content);
	echo "\n".$content."\n";;
}
?>