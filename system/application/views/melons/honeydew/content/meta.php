<style>
th {text-align:left; padding:5px 0px 5px 10px; font-weight:normal;}
</style>
<?
// Title
if (isset($page->versions[$page->version_index])):
	if (!empty($page->color)) echo '<div class="path_nav_color" style="background-color:'.$page->color.'"></div>';
	echo '<h4 class="content_title">'.$page->versions[$page->version_index]->title.'</h4>'."\n";
endif;
?>
<table class="metadata" cellspacing="2" cellpadding="0">
<tr><th colspan="3">Page</th></tr>
<tr><td style="white-space:nowrap;"><b>resource</b></td><td>rdf:resource</td><td><a href="<?=$base_uri.$page->slug?>"><?=$base_uri.$page->slug?></a></td></tr>
<?
foreach ($page->meta as $p => $values) {
	foreach ($values as $value) {
		$human_title = spacify(str_replace('_',' ',no_ns($p)));
		if (strstr($human_title, '#')) $human_title = substr($human_title, (strpos($human_title, '#')+1));
		if ($p == 'sioc:primaryTopic') $human_title = 'Source file';
		if ($human_title == 'urn') continue;
		$type = $value['type'];
		$value = $value['value'];
		$value = (substr($value, 0, 4)=='http') ? '<a href="'.$value.'">'.$value.'</a>' : $value;
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
	echo '<table class="metadata" cellspacing="2" cellpadding="0">';
	echo '<tr><th colspan="3">Version ('.$version->version_num.')</th></tr>';
	echo '<tr><td style="white-space:nowrap;"><b>resource</b></td><td>rdf:resource</td><td><a href="'.$base_uri.$page->slug.'.'.$version->version_num.'">'.$base_uri.$page->slug.'.'.$version->version_num.'</a></td></tr>';		
	foreach ($version->meta as $p => $values) {
		if ('http://rdfs.org/sioc/ns#content'==$p) continue;
		foreach ($values as $value) {
			$p = toNS($p, $ns);
			$human_title = spacify(str_replace('_',' ',no_ns($p)));
			if (strstr($human_title, '#')) $human_title = substr($human_title, (strpos($human_title, '#')+1));
			if ($p == 'sioc:primaryTopic') $human_title = 'Source file';
			if ($human_title == 'urn') continue;
			$type = $value['type'];
			$value = $value['value'];
			$value = (substr($value, 0, 4)=='http') ? '<a href="'.$value.'">'.$value.'</a>' : $value;
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
<br />
View as <a href="<?=$base_uri.$page->slug?>.rdfxml?versions=1">RDF-XML</a>, <a href="<?=$base_uri.$page->slug?>.rdfjson?versions=1">RDF-JSON</a>
<br /><br />