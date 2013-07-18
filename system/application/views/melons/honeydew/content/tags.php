<h4 class="content_title">
<?
	$title = (isset($page->version_index)) ? $page->versions[0]->title : null;
	if (!empty($title)):
		if (!empty($view_icon)):
			echo '<img src="'.$view_icon.'" class="title_icon" />'."\n";
		endif;
		echo $title."<br />\n";
	else:
		echo 'Tags';
	endif;
	?> 	
</h4>

<ul class="tags nodots">
	<?
	foreach ($book_tags as $row):
		$count = count($row->versions[0]->tag_of);
	?>
	<li value="<?=$count?>">
	<a title="Tag of <?=$count?> other page<?=($count>1)?'s':''?>" href="<?=$base_uri.$row->slug?>"><?=$row->versions[0]->title?></a>
	</li>
	<? endforeach ?>
</ul>

<br />

<?
$content = (isset($this->version_index)) ? $page->versions[0]->content : null;
if (!empty($content)) {
	$content = nl2br($content);
	echo '<div id="content">'.$content.'</div>';
}
?>