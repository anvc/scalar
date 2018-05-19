<h3 style="clear:both;"><?=(('media'==strtolower($page->type))?'Media':'Page')?></h3>
<table class="table table-striped caption_font small" cellspacing="2" cellpadding="0">
<tr><td style="white-space:nowrap;"><b>resource</b></td><td>rdf:resource</td><td><a href="<?=$base_uri.$page->slug?>"><?=$base_uri.$page->slug?></a></td></tr>
<?
foreach ($page->meta as $p => $values) {
	foreach ($values as $value) {
		$human_title = strtolower(spacify(str_replace('_',' ',no_ns($p))));
		if (strstr($human_title, '#')) $human_title = substr($human_title, (strpos($human_title, '#')+1));
		if ($p == 'sioc:primaryTopic') $human_title = 'Source file';
		if ($human_title == 'urn') continue;
		$type = $value['type'];
		$value = $value['value'];
		$value = (strstr($value,'://')) ? '<a href="'.$value.'">'.$value.'</a>' : $value;
		echo '<tr>';
		echo '<td style="white-space:nowrap;"><b>'.$human_title.'</b></td>';
		echo '<td>'.$p.'</td>';
		echo '<td>'.$value.'</td>';
		echo "</tr>\n";
	}
}
?>
</table>
<?
foreach ($page->versions as $key => $version) {
	echo '<h3>Version '.$version->version_num.'</h3>';
	echo '<table class="table table-striped caption_font small" cellspacing="2" cellpadding="0">';
	echo '<tr><td style="white-space:nowrap;"><b>resource</b></td><td>rdf:resource</td><td><a href="'.$base_uri.$page->slug.'.'.$version->version_num.'">'.$base_uri.$page->slug.'.'.$version->version_num.'</a></td></tr>';
	foreach ($version->meta as $p => $values) {
		if ('http://rdfs.org/sioc/ns#content'==$p) continue;
		foreach ($values as $value) {
			$p = toNS($p, $ns);
			$human_title = strtolower(spacify(str_replace('_',' ',no_ns($p))));
			if (strstr($human_title, '#')) $human_title = substr($human_title, (strpos($human_title, '#')+1));
			if ($p == 'sioc:primaryTopic') $human_title = 'Source file';
			if ($human_title == 'urn') continue;
			$type = $value['type'];
			$value = $value['value'];
			$value = (strstr($value,'://')) ? '<a href="'.$value.'">'.$value.'</a>' : $value;
			echo '<tr>';
			echo '<td style="white-space:nowrap;"><b>'.$human_title.'</b></td>';
			echo '<td>'.$p.'</td>';
			echo '<td>'.$value.'</td>';
			echo "</tr>\n";
		}
	}
	echo "</table>\n";
}
?>
<div class="caption_font">
<?
$all = (isset($_GET['versions'])&&1==$_GET['versions']) ? true : false;
$can_view_all = (!$hide_versions || $is_book_admin) ? true : false;
?>
	<? if ($can_view_all): ?>
	<a class="btn btn-default<?=(($all)?' active':'')?>" href="<?=$base_uri.$page->slug?><?=($all)?'.meta':'.meta?versions=1'?>">Show all versions</a>
	<? endif; ?>
	<a class="btn btn-default" href="<?=$base_uri.$page->slug?>.rdfxml<?=(!$can_view_all)?'':'?versions=1'?>">View as RDF-XML</a>
	<a class="btn btn-default" href="<?=$base_uri.$page->slug?>.rdfjson<?=(!$can_view_all)?'':'?versions=1'?>">View as RDF-JSON</a>
</div>