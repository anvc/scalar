<?
$this->template->add_css('system/application/views/widgets/import/scalarimport.css');
$this->template->add_js('system/application/views/widgets/import/jquery.scalarimport.js');
$js = <<<EOT

$(document).ready(function() {
	$('#search_archive_form').submit(function() {
		$('#search_archive_form').scalarimport();
		return false;
	});
});

EOT;
$this->template->add_js($js, 'embed');
if (isset($ia_filetypes)):
?>
<script>
var ia_filetypes = '<?=implode(',',$ia_filetypes)?>';
</script>
<?
endif;

$titles = $external->getPropValues('dc:title');
if (!empty($titles)): 
?>
<h4 class="content_title">
	<?
	foreach ($titles as $title) {
		echo $title.' Importer<Br />';
	}
	?>
</h4>
<? endif ?>

The import feature links Scalar to <a href="http://scalar.usc.edu/anvc/?page_id=23">partner archives</a>.  When media are imported,  source media files remain on the
archives' servers.  However, information about the media (including title, description, subject) are converted to <a href="http://dublincore.org/">Dublin Core</a> (and other) 
metadata fields and saved locally in Scalar. Metadata can be updated manually or by re-importing the media.

<br /><br />

<div class="search_archive_form_wrapper" id="external">	
<?
	$desc = $external->getPropValue('dcterms:description');
	if (!empty($desc)):
		echo $desc;
		echo '<br /><br />'."\n\n";
	endif;
?>	
		
	<div id="error"></div>		
		
	<form action="" id="search_archive_form" method="get">
		<!-- Fields used for proxy search -->
		<input type="hidden" name="proxy" value="<?=confirm_slash($app_root)?>rdf/proxy.php" />
		<input type="hidden" name="uri" value="<?=htmlspecialchars($external->uri)?>?<?=htmlspecialchars($external->getPropValue('scalar:getStr'))?>" />
		<input type="hidden" name="xsl" value="<?=htmlspecialchars($external->getPropValue('scalar:XSL'))?>" />
		<input type="hidden" name="match" value="<?=$external->getPropValue('scalar:match')?>" />
		<input type="hidden" name="format" value="<?=$external->getPropValue('dcterms:hasFormat')?>" />
		<input type="hidden" name="archive_api_key" value="<?=$archive_api_key?>" />
<? foreach ($external->getPropValues('scalar:keep_hash_var') as $value): ?>
		<input type="hidden" name="keep_hash_var" value="<?=$value?>" />
<? endforeach ?>
		<input type="hidden" name="remove_hash_vars" value="<?=$external->getPropValue('scalar:remove_hash_vars')?>" />
		<input type="text" name="sq" class="input_search_query" value="" /> <input type="submit" value="Search" />
		<!-- Fields used for ADD -->
		<input type="hidden" name="action" value="add" />
		<input type="hidden" name="native" value="1" />
		<input type="hidden" name="id" value="<?=@$login->email?>" />	
		<input type="hidden" name="api_key" value="0" />
		<input type="hidden" name="child_urn" value="<?=$book->urn?>" />
		<input type="hidden" name="child_type" value="http://scalar.usc.edu/2012/01/scalar-ns#Book" />
		<input type="hidden" name="child_rel" value="page" />		
	</form>		
		
	<p id="loading"><img src="<?=confirm_slash($app_root)?>views/melons/honeydew/images/loading.gif"" height="16" align="absmiddle" />&nbsp; Searching the archive (may take a moment)</p>
		
	<div id="results"></div>

	<div class="search_results_footer"><img src="<?=confirm_slash($app_root)?>views/melons/honeydew/images/loading.gif"" height="16" align="absmiddle" />&nbsp; <a class="generic_button large default" href="javascript:;" onclick="search_archive_import();">Import selected media</a></div>

	<br clear="both" />

</div>
