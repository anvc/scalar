<?$this->template->add_js('system/application/views/melons/cantaloupe/js/bootbox.min.js');?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.add_metadata.js')?>
<?$this->template->add_js('var namespaces='.json_encode($ns), 'embed');?>
<?
$js = <<<END

$( document ).ready(function() {
	// "replace" functionality
	$('select[name="replace"]').on('change', function() {
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
	// Additional metadata
	$('.add_additional_metadata:first').on('click', function() {
		$('#metadata_rows_parent').show();
		var ontologies_url = $('link#approot').attr('href').replace('/system/application/','')+'/system/ontologies';
		var tklabels = ('undefined' != typeof(window['tklabels'])) ? window['tklabels'] : null;
		$('#metadata_rows').add_metadata({title:'Add additional metadata',ontologies_url:ontologies_url,input_class:'input-sm',tklabels:tklabels,scope:scope});
	});
});
// http://stackoverflow.com/questions/11920697/how-to-get-hash-value-in-a-url-in-js
function getHashValue(key) {
	if (!location.hash.length) return false;
	return location.hash.match(new RegExp(key+'=([^&]*)'))[1];
}
function insert_rel_fields(current_urn, current_slug) {
  if (!current_slug.length) {
    $('#loading').hide();
	$('input[name="dcterms:description"]').val('');
    return;
  };
  var parent = $('link#parent').attr('href');
  var content_uri = parent+current_slug;
  var insert_into = $('#relations');
  insert_into.empty();
  var fields = [];
  $.getJSON(content_uri+'.rdfjson?ref=1&rec=1', function(data) {
  	var current_uri = data[content_uri]['http://scalar.usc.edu/2012/01/scalar-ns#version'][0].value;
	// Metadata
    var skip = ['dcterms:isReferencedBy','art:sourceLocation','ov:versionnumber','dcterms:title','dcterms:description','art:url','prov:wasAttributedTo','dcterms:created','dcterms:isVersionOf','rdf:type'];
	var description = ('undefined'!=typeof(data[current_uri]['http://purl.org/dc/terms/description'])) ? data[current_uri]['http://purl.org/dc/terms/description'][0].value : null;
	$('input[name="dcterms:description"]').val(description);
	$('#metadata_rows').empty();
	for (var subject in data[current_uri]) {
      for (var prefix in namespaces) {
        if ('scalar' == prefix) continue;
        if (subject.indexOf(namespaces[prefix]) != -1) {
		  $('#metadata_rows_parent').show();
          var pnode = subject.replace(namespaces[prefix], prefix+':');
          if (skip.indexOf(pnode) != -1) continue;
          for (var j = 0; j < data[current_uri][subject].length; j++) {
             $('#metadata_rows').append('<div class="form-group '+pnode+'"><label class="col-sm-3 control-label">'+pnode+'</label><div class="col-sm-9"><input type="text" name="'+pnode+'" class="form-control input-sm" value="'+escapeHtml(data[current_uri][subject][j].value)+'"></div></div>');
          };
        }
      }
    }
    // Relations
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
					var position_3d = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#pos3d=')+7);
					var position_gis = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#posgis=')+8);
        	var line_num = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#line=')+6);
        	var start_line_num = (-1!=data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#line=')) ? line_num.split(',')[0] : 0;
        	var end_line_num = (-1!=data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#line=')) ? line_num.split(',')[1] : 0;
        	var seconds = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#npt=')+5);
        	var start_seconds = (-1!=data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#npt=')) ? seconds.split(',')[0] : 0;
        	var end_seconds = (-1!=data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#npt=')) ? seconds.split(',')[1] : 0;
        	fields.push({name:'annotation_of_points',value:points});
					fields.push({name:'annotation_of_position_3d',value:position_3d});
					fields.push({name:'annotation_of_position_gis',value:position_gis});
					fields.push({name:'annotation_of_start_line_num',value:start_line_num});
					fields.push({name:'annotation_of_end_line_num',value:end_line_num});
					fields.push({name:'annotation_of_start_seconds',value:start_seconds});
					fields.push({name:'annotation_of_end_seconds',value:end_seconds});
        } else {
        	fields.push({name:'has_annotation',value:get_urn_from_uri(data,data[s]['http://www.openannotation.org/ns/hasBody'][0].value)});
        	var points = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#xywh=')+6);
					var position_3d = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#pos3d=')+7);
					var position_gis = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#posgis=')+8);
					var line_num = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#line=')+6);
        	var start_line_num = (-1!=data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#line=')) ? line_num.split(',')[0] : 0;
        	var end_line_num = (-1!=data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#line=')) ? line_num.split(',')[1] : 0;
        	var seconds = data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.substr(data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#npt=')+5);
        	var start_seconds = (-1!=data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#npt=')) ? seconds.split(',')[0] : 0;
        	var end_seconds = (-1!=data[s]['http://www.openannotation.org/ns/hasTarget'][0].value.indexOf('#npt=')) ? seconds.split(',')[1] : 0;
        	fields.push({name:'has_annotation_points',value:points});
					fields.push({name:'has_annotation_position_3d',value:position_3d});
					fields.push({name:'has_annotation_position_gis',value:position_gis});
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
      if (s==current_uri && 'undefined'!=typeof(data[s]['http://purl.org/dc/terms/isReferencedBy'])) {
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
  if (-1!=uri.indexOf('#')) uri = uri.substr(0, uri.indexOf('#'));
  for (var s in data) {
    if (-1!=s.indexOf(uri)) {  // Version
      return data[s]['http://scalar.usc.edu/2012/01/scalar-ns#urn'][0].value;
    }
  }
  return false;
}
function custom_file_input(el) {
  var filename = $(el).val().replace(/\\\/g,"/");
  filename = filename.substr(filename.lastIndexOf('/')+1);
  $('#upload-file-info').html(filename);
}
function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

END;
$js .= 'var scope = "'.$book->scope.'";'."\n";
$this->template->add_js($js, 'embed');
$css = <<<END
h2 {margin-top:0; padding-top:0; margin-left:0; padding-left:0; margin-right:0; padding-right:0;}
.ci-template-html {font-family:Georgia,Times,serif !important; padding-left:7.2rem; padding-right:7.2rem;}
#centered-message {display:none;}
#loading {font-size:1.4rem;}
.upload-page table label {margin-bottom:0;}
.upload-page table tr td:first-of-type {font-family:"Lato",Arial,sans-serif !important; padding-right:20px; white-space:nowrap;}
.upload-page table td {vertical-align:middle !important; padding-bottom:12px;}
.upload-page table .buttons {padding-top:12px;}
#metadata_rows_parent {display:none;}
#metadata_rows_parent td:last-of-type {min-width:600px;}
#metadata_rows {margin-top:-12px;}
#metadata_rows .form-group label {padding-top:3px;}
#metadata_rows .form-group input {margin-bottom:4px;}
#metadata_rows .control-label {font-size:14px;}
#metadata_rows input {box-shadow:none; -webkit-box-shadow:none;}
#upload-file-info {color:#333333;}
/* http://blog.koalite.com/bbg/ */
.btn-grey {
  color: #000000;
  background-color: #CFCFCF;
  border-color: #B3B3B3;
}
.btn-grey:hover,
.btn-grey:focus,
.btn-grey:active,
.btn-grey.active,
.open .dropdown-toggle.btn-grey {
  color: #000000;
  background-color: #B3B3B3;
  border-color: #B3B3B3;
}
.btn-grey:active,
.btn-grey.active,
.open .dropdown-toggle.btn-grey {
  background-image: none;
}
.btn-grey.disabled,
.btn-grey[disabled],
fieldset[disabled] .btn-grey,
.btn-grey.disabled:hover,
.btn-grey[disabled]:hover,
fieldset[disabled] .btn-grey:hover,
.btn-grey.disabled:focus,
.btn-grey[disabled]:focus,
fieldset[disabled] .btn-grey:focus,
.btn-grey.disabled:active,
.btn-grey[disabled]:active,
fieldset[disabled] .btn-grey:active,
.btn-grey.disabled.active,
.btn-grey[disabled].active,
fieldset[disabled] .btn-grey.active {
  background-color: #CFCFCF;
  border-color: #B3B3B3;
}
.btn-grey .badge {
  color: #CFCFCF;
  background-color: #000000;
}
END;
$this->template->add_css($css, 'embed');
?>
<h2 class="heading_font">Upload Media File</h2>
<?=(!empty($content)) ? $content.'<br /><br />' : ''?>
Use this form to upload media from your local drive for use in Scalar. <b>Each file must be less than <?=ini_get('upload_max_filesize')?> in size.</b> Larger files can be hosted at a Scalar-supported archive (use the Affiliated Archives or Other Archives options in the Import menu at left to import), or on any public web server (use the Internet Media Files option in the Import menu at left to import).<br /><br />
Recommended formats (most compatible): gif, kml, jpg, m4v, mp3, mp4, pdf, png, txt, wav<br />
Other supported formats: 3gp, aif, mov, mpg, oga, tif, webm, webp<br />
<span style="color:#c90000;">Files will overwrite.</span> Uploading the same file to the same place will overwrite an existing file of the same name.<br /><br />
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
<table>
	<tr><td><label for="title">Title</label></td><td><input type="text" id="title" name="dcterms:title" class="form-control" /></td></tr>
	<tr><td><label for="description">Description</label></td><td><input type="text" id="description" name="dcterms:description" class="form-control" /></td></tr>
	<tr><td><label for="alt_text">Alt text</label></td><td><input type="text" id="alt_text" name="scalar:altText" class="form-control" /><small>For images, concise description to improve accessibility, including for people who are blind or have low vision</small></td></tr>
	<tr><td>Upload to</td><td>
		<label><input type="radio" name="slug_prepend" value="" />&nbsp; <?=confirm_slash($book->slug)?></label>&nbsp; &nbsp;
		<label><input type="radio" id="upload_to" name="slug_prepend" value="media" CHECKED />&nbsp; <?=confirm_slash($book->slug)?>media</label>
	</td></tr>
	<tr><td>Media page URL</td><td>
		<label><input type="radio" name="name_policy" value="filename" />&nbsp; Create from filename</label>&nbsp; &nbsp;
		<label><input type="radio" name="name_policy" value="title" CHECKED />&nbsp; Create from title</label>
	</td></tr>
	<tr><td class="field">Replace existing</td><td>
		<select name="replace" class="form-control" style="max-width:570px;"><option rel="" value="">Choose an existing local media file to replace...</option><?
	  	foreach($book_media as $book_media_row) {
	  		if (!isset($book_media_row->versions) || empty($book_media_row->versions)) continue;
	  		if (!isset($book_media_row->versions[0])) continue;
	  		if (!$this->versions->url_is_local($book_media_row->versions[0]->url, $base_uri)) continue;
	  		echo '<option ';
	  		echo 'rel="'.$book_media_row->slug.'" ';
	  		echo 'title="'.htmlspecialchars($book_media_row->versions[0]->url).'" ';
	  		echo 'value="'.$this->versions->urn($book_media_row->versions[0]->version_id).'">';
	  		echo $book_media_row->versions[0]->title;
	  		echo '</option>';
	  	}
	  ?></select>
	</td></tr>
	<tr><td class="field">Metadata</td><td>
		<a href="javascript:;" class="btn btn-default add_additional_metadata" role="button">Add additional metadata</a>&nbsp;
		<small>IPTC or ID3 fields embedded in the file will auto-populate during upload</small>
	</td></tr>
	<tr id="metadata_rows_parent"><td class="field"></td><td><div id="metadata_rows"></div></td></tr>
		<tr><td>IIIF</td><td>
		<div class="checkbox">
			<label><input type="checkbox" id="media_file_url_iiif" name="iiif-url" /> Is IIIF Manifest</label>
		</div>
	</td></tr>
	<tr><td class="field">Choose file</td><td>
		<!-- <input type="file" name="source_file" /> -->
		<label class="btn btn-grey" for="my-file-selector">
		    <input id="my-file-selector" name="source_file" type="file" style="display:none;" onchange="custom_file_input(this);">
		    Choose File
		</label>
		<span class='label' id="upload-file-info">No file chosen.</span>
	</td></tr>
	<tr><td>&nbsp;</td><td class="buttons">
		<input type="submit" value="Upload" id="submit_button" class="btn btn-primary" />
		<small style="color:red;display:none;" id="loading">&nbsp; Loading media metadata...</small>
	</td></tr>
</table>
<iframe id="hidden_upload" name="hidden_upload" src="" style="width:0;height:0;border:0px solid #fff"></iframe>
<div id="relations"></div>
</form>
