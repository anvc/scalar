<h4 class="content_title">
<?
	$title = (isset($page->version_index)) ? $page->versions[0]->title : null;
	if (!empty($title)):
		if (!empty($view_icon)):
			echo '<img src="'.$view_icon.'" class="title_icon" />'."\n";
		endif;
		echo $title."<br />\n";
	else:
		echo 'Main Menu';
	endif;
	?> 	
</h4>

<?
$content = (isset($this->version_index)) ? $page->versions[0]->content : null;
if (!empty($content)) {
	$content = nl2br($content);
	echo '<div id="content">'.$content.'</div>';
}
?>

<ul class="toc">
	<? 
	foreach ($book_versions as $row): 
		$title = (!empty($row->versions[0]->title)) ? $row->versions[0]->title : '(No title)';
	?>
	<li>
	<a href="<?=$base_uri.$row->slug?>"><?=$title?></a>
	</li>
	<? endforeach ?>
</ul>
