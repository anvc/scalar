<?php
$content = (isset($page->version_index)) ? $page->versions[0]->content : null;
if (!empty($content)) {
	$content = nl2br($content);
	echo "\n".$content."\n";;
}
?>
<?php if (count($book_versions)): ?>
<ol class="toc">
	<?
	foreach ($book_versions as $row):
		$title = (!empty($row->versions[0]->title)) ? $row->versions[0]->title : '(No title)';
	?>
	<li>
	<a href="<?=$base_uri.$row->slug?>"><?=$title?></a>
	</li>
	<? endforeach; ?>
</ol>
<?php else: ?>
<p>
  The table of contents hasn't been set up.
</p>
<p>
  <?php if ($login_is_author): ?>
  <img width="30" height="30" alt="" src="<?php echo base_url() ?>system/application/views/melons/cantaloupe/images/edit_icon.png">
  You can add items in the Dashboard's Book properties tab.
  <?php endif; ?>
</p>
<?php endif; ?>
