<?
$content = (isset($page->version_index)) ? $page->versions[0]->content : null;
if (!empty($content)) {
	$content = nl2br($content);
	echo "\n".'<p>'.$content.'</p>';
}
?>
<?php if (empty($book_content)): ?>
<p>
  No content has been added.
</p>
<p>
  <?php if ($login_is_author): ?>
  <img width="30" height="30" alt="" src="<?php echo base_url() ?>system/application/views/melons/cantaloupe/images/edit_icon.png">
  You can create pages with the <b>+</b> button above or media by using the import menu.
  <?php endif; ?>
</p>
<?php else: ?>
<h3 style="clear:both;">Pages</h3>
<ul class="resources pages">
	<?
	foreach ($book_content as $row):
		if ($row->type!='composite') continue;
		$title = (!empty($row->versions[0]->title)) ? $row->versions[0]->title : '(No title)';
		$desc = (!empty($row->versions[0]->description)) ? $row->versions[0]->description : null;
	?>
	<li>
	<a class="title" href="<?=$base_uri.$row->slug?>"><?=$title?></a><br />
	<?php if ($desc) echo '<span class="desc">'.$desc.'</span>'; ?>
	</li>
	<? endforeach ?>
</ul>
<h3 style="clear:both;">Media</h3>
<ul class="resources media">
	<?
	foreach ($book_content as $row):
		if ($row->type!='media') continue;
		$title = (!empty($row->versions[0]->title)) ? $row->versions[0]->title : '(No title)';
		$desc = (!empty($row->versions[0]->description)) ? $row->versions[0]->description : null;
	?>
	<li>
	<a class="title" href="<?=$base_uri.$row->slug?>"><?=$title?></a><br />
	<?php if ($desc) echo '<span class="desc">'.$desc.'</span>'; ?>
	</li>
	<? endforeach ?>
</ul>
<?php endif; ?>