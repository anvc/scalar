<?
$js = <<<END

$( document ).ready(function() {
	$('select[name="replace"]').change(function() {
		$('#loading').show();
		document.getElementById('submit_button').disabled = true;
		var title = ($(this).find('option:selected').val().length) ? $(this).find('option:selected').text() : '';
		$('input[name="dcterms:title"]').val(title);
		insert_rel_fields($(this).find('option:selected').val(), $(this).find('option:selected').attr('rel'));
	});
	if (getHashValue('replace')) {
		var replace = getHashValue('replace');
		if ($("select[name='replace'] option[value='urn:scalar:version:"+replace+"']").length) {
			$('#loading').show();
			document.getElementById('submit_button').disabled = true;
			$("select[name='replace'] option[value='urn:scalar:version:"+replace+"']").attr('selected', 'selected');
			$('input[name="dcterms:title"]').val( $(this).find('option:selected').text() ); // Since .attr() didn't really "change" the select box
			insert_rel_fields('urn:scalar:version:'+replace, $("select[name='replace'] option[value='urn:scalar:version:"+replace+"']").attr('rel'));
		}
	}
});
function insert_rel_fields(current_urn, current_slug) {
  var parent = $('link#parent').attr('href');
  var current_uri = parent+current_slug;
  var insert_into = $('#relations');
  insert_into.empty();
  var fields = [];
  $.getJSON(current_uri+'.rdfjson?ref=1&rec=1', function(data) {
    for (var s in data) {
      // Paths
      if (-1!=s.indexOf('urn:scalar:path')) {
        if (current_uri==data[s]['http://www.openannotation.org/ns/hasBody'][0].value) {
        	fields.push({name:'container_of',value:get_urn_from_uri(data,data[s]['http://www.openannotation.org/ns/hasTarget'][0].value)});
        } else {
        	fields.push({name:'has_container',value:get_urn_from_uri(data,data[s]['http://www.openannotation.org/ns/hasBody'][0].value)});
        	var path_index = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#index=')+7);
        	fields.push({name:'has_container_sort_number',value:path_index});       	
        }
      }      
      // Replies
      if (-1!=s.indexOf('urn:scalar:reply')) {
        if (current_uri==data[s]['http://www.openannotation.org/ns/hasBody'][0].value) {
        	fields.push({name:'reply_of',value:get_urn_from_uri(data,data[s]['http://www.openannotation.org/ns/hasTarget'][0].value)});
        	fields.push({name:'reply_of_paragraph_num',value:0});
        	var datetime = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#datetime=')+10);
        	datetime = datetime.replace('T',' ');
        	datetime = datetime.substr(0, datetime.indexOf('+'));
        	fields.push({name:'reply_of_datetime',value:datetime});         	
        } else {
        	fields.push({name:'has_reply',value:get_urn_from_uri(data,data[s]['http://www.openannotation.org/ns/hasBody'][0].value)});
        	fields.push({name:'has_reply_paragraph_num',value:0});
        	var datetime = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#datetime=')+10);
        	datetime = datetime.replace('T',' ');
        	datetime = datetime.substr(0, datetime.indexOf('+'));
        	fields.push({name:'has_reply_datetime',value:datetime});
        }
      }            
      // Annotations
      if (-1!=s.indexOf('urn:scalar:anno')) {
        if (current_uri==data[s]['http://www.openannotation.org/ns/hasBody'][0].value) {
        	fields.push({name:'annotation_of',value:get_urn_from_uri(data,data[s]['http://www.openannotation.org/ns/hasTarget'][0].value)});
        	var points = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#xywh=')+6);
        	var line_num = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#line=')+6);
        	var start_line_num = (-1!=data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#line=')) ? line_num.split(',')[0] : 0;
        	var end_line_num = (-1!=data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#line=')) ? line_num.split(',')[1] : 0;
        	var seconds = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#npt=')+5);
        	var start_seconds = (-1!=data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#npt=')) ? seconds.split(',')[0] : 0;
        	var end_seconds = (-1!=data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#npt=')) ? seconds.split(',')[1] : 0;    
        	fields.push({name:'annotation_of_points',value:points});    
			fields.push({name:'annotation_of_start_line_num',value:start_line_num});
			fields.push({name:'annotation_of_end_line_num',value:end_line_num});
			fields.push({name:'annotation_of_start_seconds',value:start_seconds});
			fields.push({name:'annotation_of_end_seconds',value:end_seconds});        	
        } else {
        	fields.push({name:'has_annotation',value:get_urn_from_uri(data,data[s]['http://www.openannotation.org/ns/hasBody'][0].value)});
        	var points = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#xywh=')+6);
        	var line_num = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#line=')+6);
        	var start_line_num = (-1!=data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#line=')) ? line_num.split(',')[0] : 0;
        	var end_line_num = (-1!=data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#line=')) ? line_num.split(',')[1] : 0;
        	var seconds = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#npt=')+5);
        	var start_seconds = (-1!=data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#npt=')) ? seconds.split(',')[0] : 0;
        	var end_seconds = (-1!=data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#npt=')) ? seconds.split(',')[1] : 0;    
        	fields.push({name:'has_annotation_points',value:points});    
			fields.push({name:'has_annotation_start_line_num',value:start_line_num});
			fields.push({name:'has_annotation_end_line_num',value:end_line_num});
			fields.push({name:'has_annotation_start_seconds',value:start_seconds});
			fields.push({name:'has_annotation_end_seconds',value:end_seconds});
        }
      }          
      // Tags
      if (-1!=s.indexOf('urn:scalar:tag')) {
        if (current_uri==data[s]['http://www.openannotation.org/ns/hasBody'][0].value) {
        	fields.push({name:'tag_of',value:get_urn_from_uri(data,data[s]['http://www.openannotation.org/ns/hasTarget'][0].value)});
        } else {
        	fields.push({name:'has_tag',value:get_urn_from_uri(data,data[s]['http://www.openannotation.org/ns/hasBody'][0].value)});
        }
      }
      // References
      if ('undefined'!=typeof(data[s]['http://purl.org/dc/terms/isReferencedBy'])) {
      	var version = data[s]['http://purl.org/dc/terms/isReferencedBy'][0].value;
      	version = data[version]['http://scalar.usc.edu/2012/01/scalar-ns#version'][0].value;
      	fields.push({name:'has_reference',value:get_urn_from_uri(data,version)});
      	fields.push({name:'has_reference_reference_text',value:''})
      }                
    }
    for (var j = 0; j < fields.length; j++) {
      insert_into.append('<input type="hidden" name="'+fields[j].name+'" value="'+fields[j].value+'" />');
    }
    $('#loading').hide();
    document.getElementById('submit_button').disabled = false;
  });
}
function get_urn_from_uri(data, uri) {
  for (var s in data) {
    if (-1!=s.indexOf(uri)) {  // Version
      return data[s]['http://scalar.usc.edu/2012/01/scalar-ns#urn'][0].value;
    }
  }
  return false;
}

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
  <td><select name="replace" style="width:100%;"><option rel="" value="">-- choose an existing local media file to replace with this upload</option><?
  	foreach($book_media as $book_media_row) {
  		if (!isset($book_media_row->versions) || empty($book_media_row->versions)) continue;
  		if (!$this->versions->url_is_local($book_media_row->versions[0]->url)) continue;
  		echo '<option ';
  		echo 'rel="'.$book_media_row->slug.'" ';
  		echo 'value="'.$this->versions->urn($book_media_row->versions[0]->version_id).'">';
  		if (!isset($book_media_row->versions[0])) continue;
  		echo $book_media_row->versions[0]->title;
  		echo '</option>';
  	}
  ?></select></td>
</tr>
<tr><td class="field">&nbsp;</td></tr>
<tr><td class="field">Choose file&nbsp; &nbsp; &nbsp;</td><td><input type="file" name="source_file" /></td></tr>
<tr><td>&nbsp;</td><td class="form_buttons"><input type="submit" value="Upload" id="submit_button" /><span style="color:red;display:none;" id="loading">&nbsp; Loading media metadata...</span><div style="float:right;margin:20px 20px 0px 0px;" id="spinner_wrapper"></div></td></tr>
</table>
<iframe id="hidden_upload" name="hidden_upload" src="" style="width:0;height:0;border:0px solid #fff"></iframe>
<div id="relations"></div>
</form>

</div>
<br clear="both" />