<?
$js = <<<END

$( document ).ready(function() {
	$('select[name="replace"]').change(function() {
		$('input[name="dcterms:title"]').val( $(this).find('option:selected').text() );
	});
	if (getHashValue('replace')) {
		var replace = getHashValue('replace');
		if ($("select[name='replace'] option[value='urn:scalar:version:"+replace+"']").length) {
			$("select[name='replace'] option[value='urn:scalar:version:"+replace+"']").attr('selected', 'selected');
			$('input[name="dcterms:title"]').val( $(this).find('option:selected').text() ); // Since .attr() didn't really "change" the select box
		}
	}
});

END;
$this->template->add_js($js, 'embed');
?>
<? if (@$_REQUEST['action']=='upload_saved'): ?>
<div class="saved">Media has been saved&nbsp;  (<a href="<?=((isset($_REQUEST['redirect_url']))?$_REQUEST['redirect_url']:$uri)?>">View</a>)<a style="float:right" href="<?=$uri?>">clear</a></div><br />
<? endif ?>

<div style="float:left; width:20%;">

<h4 class="content_title">Import Local Media Files</h4>

</div>

<div style="float:right; width:80%">

<?=(!empty($content)) ? $content.'<br /><br />' : ''?>

Use this form to upload media from your local drive for use in Scalar. <b>Each file must be less than 2 MB in size.</b> Larger files can be hosted at a Scalar-supported archive (use the Affiliated Archives or Other Archives options in the Import menu at left to import), or on any public web server (use the Internet Media Files option in the Import menu at left to import).
<br /><br />

<b>Recommended formats (most compatible):</b><br />css, gif, html, java, js, kml, jpg, m4v, mp3, mp4, pdf, png, txt, wav, xml 
<br /><br />

Other supported formats: 3gp, aif, flv, mov, mpg, oga, tif, webm
<br />

<br />
<span style="color:#c90000;">Files will overwrite.</span> Uploading the same file to the same place will overwrite any existing file.<br />
<br />

<? if (isset($save_error)): ?>
<div class="error"><?=$save_error?></div>
<? endif ?>

<form target="hidden_upload" id="file_upload_form" method="post" enctype="multipart/form-data" action="<?=$base_uri?>upload" class="panel" onsubmit="return validate_upload_form_file($(this));">
<input type="hidden" name="action" value="add" />
<input type="hidden" name="native" value="1" />
<input type="hidden" name="scalar:urn" value="" />
<input type="hidden" name="id" value="<?=@$login->email?>" />
<input type="hidden" name="api_key" value="" />
<input type="hidden" name="scalar:child_urn" value="<?=$book->urn?>" />
<input type="hidden" name="scalar:child_type" value="http://scalar.usc.edu/2012/01/scalar-ns#Book" />
<input type="hidden" name="scalar:child_rel" value="page" />
<input type="hidden" name="sioc:content" value="" />
<input type="hidden" name="rdf:type" value="http://scalar.usc.edu/2012/01/scalar-ns#Media" />
<table class="form_fields">
<tr><td class="field">Title</td><td><input type="text" name="dcterms:title" class="input_text" /></td></tr>
<tr><td class="field">Description</td><td><input type="text" name="dcterms:description" class="input_text" /></td></tr>
<tr><td class="field">Upload to</td><td>
<input type="radio" name="slug_prepend" value="" /> <?=confirm_slash($book->slug)?><br />
<input type="radio" name="slug_prepend" value="media" CHECKED /> <?=confirm_slash($book->slug)?>media<br />
</td></tr>
<tr><td class="field">Media page URL</td><td><input type="radio" name="name_policy" value="filename" /> Create from filename &nbsp;<input type="radio" name="name_policy" value="title" CHECKED /> Create from title</td></tr>
<tr>
  <td class="field">Replace existing</td>
  <td><select name="replace" style="width:100%;"><option value="">-- choose an existing local media file to replace with this upload</option><?
  	foreach($book_media as $book_media_row) {
  		if (!$this->versions->url_is_local($book_media_row->versions[0]->url)) continue;
  		echo '<option value="'.$this->versions->urn($book_media_row->versions[0]->version_id).'">';
  		if (!isset($book_media_row->versions[0])) continue;
  		echo $book_media_row->versions[0]->title;
  		echo '</option>';
  	}
  ?></select></td>
</tr>
<tr><td class="field">&nbsp;</td></tr>
<tr><td class="field">Choose file&nbsp; &nbsp; &nbsp;</td><td><input type="file" name="source_file" /></td></tr>
<tr><td>&nbsp;</td><td class="form_buttons"><input type="submit" value="Upload" /><div style="float:right;margin:20px 20px 0px 0px;" id="spinner_wrapper"></div></td></tr>
</table>
<iframe id="hidden_upload" name="hidden_upload" src="" style="width:0;height:0;border:0px solid #fff"></iframe>
</form>

</div>
<br clear="both" />