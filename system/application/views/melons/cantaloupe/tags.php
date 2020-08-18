<?php
if (!empty($book_tags)):
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
<br /><br />
<?php 
endif;

$content = (isset($page->version_index)) ? $page->versions[0]->content : null;
if (!empty($content)) {
	$content = nl2br($content);
	echo "\n".$content."\n";;
}