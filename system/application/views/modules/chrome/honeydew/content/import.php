<?
$this->template->add_css(path_from_file(__FILE__).'import.css');
$this->template->add_js(path_from_file(__FILE__).'import.js');

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
		
	<form action="" class="search_archive_form" method="get" onsubmit="return search_archive();">
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
		<input type="hidden" name="scalar:urn" value="" />
		<input type="hidden" name="id" value="<?=@$login->email?>" />
		<input type="hidden" name="api_key" value="" />
		<input type="hidden" name="rdf:type" value="http://scalar.usc.edu/2012/01/scalar-ns#Media" />
		<input type="hidden" name="scalar:child_urn" value="<?=$book->urn?>" />
		<input type="hidden" name="scalar:child_type" value="http://scalar.usc.edu/2012/01/scalar-ns#Book" />
		<input type="hidden" name="scalar:child_rel" value="page" />	
		<input type="hidden" name="sioc:content" value="" />		
	</form>		
		
	<p class="search_results_title"><img src="<?=confirm_slash($app_root)?>views/modules/chrome/honeydew/images/loading.gif" height="16" align="absmiddle" />&nbsp; Searching the archive (may take a moment)</p>
	<div class="search_results_header"></div>
		
	<div class="search_results_wrapper">
	<table class="search_archive_results" cellspacing="0" cellpadding="0"><tbody></tbody></table>
	</div>

	<div class="search_results_footer"><a class="generic_button large default" href="javascript:;" onclick="search_archive_import();">Import selected media</a></div>

	<br clear="both" />

</div>
