<h4>Search</h4>
<br />

<form class="panel" action="<?=$_SERVER['REDIRECT_URL']?>" method="get">
<input class="sq" type="text" name="sq" value="<?=htmlspecialchars($sq)?>" /> <input class="generic_button" type="submit" value="Search" />&nbsp; <a href="<?=$_SERVER['REDIRECT_URL']?>">clear</a>
</form>
<br />

<?
if (!empty($sq) && empty($result)) {
	echo 'Could not find results for the query <b>'.htmlspecialchars($sq).'</b>';
} elseif (!empty($result)) {
	echo 'Found <strong>'.count($result).'</strong> results for <strong>'.htmlspecialchars($sq).'</strong><br />'."\n";
}
?>

<? if (!empty($result)): ?>
<ol class="search_results nodots">
<? foreach($result as $row): 
	$char_limit = 110;
	$title = $row->versions[0]->title;
	$desc = character_limiter($row->versions[0]->description, $char_limit);
	if (empty($desc)) $desc = '(No description)';
	$content = character_limiter(strip_tags($row->versions[0]->content), $char_limit);
?>
	<li>
	<a href="<?=$base_uri.$row->slug?>">
	<?=hl($title, $terms)."\n"?>
	</a><br />
	<?=hl($desc, $terms)."\n"?><br />
	<a href="javascript:;" onclick="$(this).next().toggle();$(this).blur()" style="font-size:smaller;">View <?=($row->type=='composite')?"page's":"media's"?> matched versions</a>
	<ol class="versions nodots">
<?
	foreach ($row->versions as $row_version):
		$title = $row_version->title;
		if (empty($title)) $title = '(No title)';
		$desc = $row_version->description;
		if (empty($desc)) $desc = '(No description)';		
		echo '<li>';
		echo '<a href="'.$base_uri.$row->slug.'.'.$row_version->version_num.'">';
		echo hl($title, $terms).'</a> ('.$row_version->version_num.')';
		echo '<br />';
		echo hl($desc, $terms);
		if (!empty($content)) {
			echo '<br />';
			echo '<span style="color:#555555;">'.hl($content, $terms).'</span>';
		}
		echo "</li>\n";
	endforeach;
?>
	</ol>
	</li>
<? endforeach ?>
</ol>
<? endif ?>