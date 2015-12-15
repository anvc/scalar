<?php
$this->template->add_js('system/application/views/widgets/jQCloud/jqcloud.min.js');
$this->template->add_css('system/application/views/widgets/jQCloud/jqcloud.min.css');

$content = (isset($page->version_index)) ? $page->versions[0]->content : null;
if (!empty($content)) {
	$content = nl2br($content);
	echo '<p>'.$content.'</p>'."\n";;
} elseif (!empty($book_tags)) {
?>
	<script>
	$('header h1[property="dcterms:title"]').hide();
	</script>
<?php
}

if (empty($book_tags)):
	$title = (isset($page->version_index)) ? $page->versions[0]->title : null;
	if (empty($title)) {
		echo '<h1 class="tags_title heading_font heading_weight clearboth">Tag Cloud</h1>'."\n";
	}
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
<div id="tags"></div>
<script>
var words = [<?php echo implode(",\n",$words); ?>];
$('body').on( "pageLoadComplete", function() {
	if ('undefined'==typeof(no_tag_cloud) || !no_tag_cloud) {  // Set no_tag_cloud=true in Custom JS to not run this block
		var $tags = $('#tags');
		var words_pos = function() {
			$tags.width('100%');
			$tags.height( parseInt($(window).height())*0.7 );
		};
		words_pos();
		$( window ).resize(function() { words_pos(); });
		$('#tags').jQCloud(words, { autoResize: true });
	}
});
</script>
<?php endif; ?>