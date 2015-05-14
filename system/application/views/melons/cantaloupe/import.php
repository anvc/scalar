<?
$this->template->add_js('system/application/views/melons/cantaloupe/js/bootbox.min.js');
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
$css = <<<END

h2 {margin-top:0; padding-top:0; margin-left:0; padding-left:0; margin-right:0; padding-right:0;}
h4 {margin-left:0; margin-right:0; padding-left:0; padding-right:0; font-weight:bold;}
.ci-template-html {font-family:Georgia,Times,serif !important; padding-left:7.2rem; padding-right:7.2rem;}
#centered-message {display:none;}
td {vertical-align:top !important; line-height:130% !important; font-size:13px !important;}
label {display:inline !important; font-size:inherit !important; font-weight:inherit !important; cursor:pointer;}
.title label {padding-left:4px;}
.contributor {font-size:11px !important;}
.url > span {font-size:11px; padding-left:4px;}
#results {font-family:"Lato",Arial,sans-serif !important;}
.result_content {height:360px;}
.result_footer {font-size:smaller;}

END;
$this->template->add_css($css, 'embed');

$titles = $external->getPropValues('dc:title');
if (!empty($titles)):
?>
<h2 class="heading_font"><?
	foreach ($titles as $title) {
		echo $title.' Importer';
	}
?></h2>
<? endif ?>

The import feature links Scalar to <a href="http://scalar.usc.edu/people/">partner archives</a>.  When media are imported,  source media files remain on the
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

	$availability = $external->getPropValue('scalar:availability');
	if (empty($availability) || 'available' == $availability):
?>

	<div id="error"></div>

	<form action="" id="search_archive_form" method="get" class="form-inline">
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
		<input type="text" name="sq" class="input_search_query form-control" value="" /> <input type="submit" value="Search" class="btn btn-default" />
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

	<div id="results" class="no_resize"></div>

	<br clear="both" />

<? endif; ?>

</div>
