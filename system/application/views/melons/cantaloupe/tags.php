<?php
$this->template->add_js('system/application/views/widgets/jQCloud/jqcloud.min.js');
$this->template->add_css('system/application/views/widgets/jQCloud/jqcloud.min.css');

$content = (isset($page->version_index)) ? $page->versions[0]->content : null;
if (!empty($content)) {
	$content = nl2br($content);
	echo '<p>'.$content.'</p>'."\n";;
}

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
			$tags.height( parseInt($(window).height())*0.8 );
		};
		words_pos();
		$( window ).resize(function() { words_pos(); });
		$('#tags').jQCloud(words, { autoResize: true });
	}
});

</script>