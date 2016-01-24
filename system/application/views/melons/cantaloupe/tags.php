<?php
$content = (isset($page->version_index)) ? $page->versions[0]->content : null;
if (!empty($content)) {
	$content = nl2br($content);
	echo "\n".'<p>'.$content.'</p>'."\n";;
}

if (empty($book_tags)):
?>
<p>
  There are no tags.
</p>
<p>
  <?php if ($login_is_author): ?>
  <img width="30" height="30" alt="" src="<?php echo base_url() ?>system/application/views/melons/cantaloupe/images/edit_icon.png">
  You can make tags by creating a new page, then clicking the "To make this page a tag, specificy items that it tags" link under the Relationships tab.
  <?php endif; ?>
</p>
<?php

else:
$words = array();
foreach ($book_tags as $row):
	$count = count($row->versions[0]->tag_of);
    $words[] = '{text:"'.addslashes($row->versions[0]->title).'", weight:'.$count.', link:"'.$base_uri.$row->slug.'"}';
endforeach;
?>
<script>
var tags = [
<?php echo implode(",\n",$words)."\n"; ?>
];
</script>
<?php endif; ?>