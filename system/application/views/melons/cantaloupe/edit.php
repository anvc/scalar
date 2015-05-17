<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_css('system/application/views/widgets/ckeditor/custom.css')?>
<?$this->template->add_css('system/application/views/widgets/edit/jquery-ui-custom/jquery-ui.min.css')?>
<?$this->template->add_css('system/application/views/widgets/farbtastic/farbtastic.css')?>
<?$this->template->add_css('system/application/views/widgets/edit/content_selector.css')?>
<?$this->template->add_js('system/application/views/widgets/ckeditor/ckeditor.js')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery-ui-custom/jquery-ui.min.js')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.select_view.js')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.add_metadata.js')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.content_selector.js')?>
<?$this->template->add_js('system/application/views/melons/cantaloupe/js/bootbox.min.js');?>
<?$this->template->add_js('system/application/views/widgets/farbtastic/farbtastic.js')?>
<?$this->template->add_js('system/application/views/widgets/spinner/spin.min.js')?>
<?
if ($this->config->item('reference_options')) {
	$this->template->add_js('var reference_options='.json_encode($this->config->item('reference_options')), 'embed');
}
$this->template->add_js('var views='.json_encode($views), 'embed');
$css = <<<END

article > *:not(span) {display:none !important;}
.ci-template-html {font-family:Georgia,Times,serif !important;}
.body_copy {max-width:100% !important;}
label, .sortable li {cursor:pointer;}
.ui-sortable-helper {background-color:#dddddd;}
form > table {width:100%;}
table, .content_selector, .bootbox {font-family:"Lato",Arial,sans-serif !important;}
table .p > td {padding-top:12px;}
table .b > td:first-of-type {padding-top:10px;}
div.p {padding-top:8px;}
.content_selector .howto {font-size:16px !important;}
tr td:first-of-type:not([colspan]) {white-space:nowrap !important; padding-right:20px !important;}
td {vertical-align:middle; padding-bottom:6px !important;}
#edit_content td {padding-right:9px;} /* CKEditor extends to the right */
tr#select_view td, tr#relationships td, tr#styling td, tr#metadata td {vertical-align:top;}
tr#relationships td {vertical-align:top;}
tr#styling button:first-of-type, tr#metadata button:first-of-type {width:100%; font-size:16px; color:#026697}
tr#styling table, tr#metadata table {width:100%;}
tr#styling table td, tr#metadata table td {vertical-align:middle;}
tr#styling table td:first-of-type, tr#metadata table td:first-of-type  {width:120px;}
.bootbox h1, .bootbox h4 {margin-left:0px; padding-left:0px;}
.bootbox h1 {margin-bottom:12px; padding-bottom:0px; font-size:30px; line-height:100%;}

END;
$this->template->add_css($css, 'embed');
$js = <<<END

$(document).ready(function() {
	$(".sortable").sortable();
	// If the type is passed via GET
	checkTypeSelect();
	if (-1!=document.location.href.indexOf('new.edit') && -1!=document.location.href.indexOf('type=media')) {
		$("#type_text").removeAttr('checked');
		$("#type_media").attr("checked", "checked");
		checkTypeSelect();
	}
	// Layout options
	$('#select_view td:nth-child(2)').select_view({data:views,default_value:$('link#default_view').attr('href')});
	// Relationships (path, comment, annotation, tag)
	$(document).on('click', '#relationships .remove a', function() {  // Delegated
		if (!confirm('Are you sure you wish to remove this relationship?')) return;
		$(this).closest('li').remove();
	});
	if ($('#path_of').find('li').length) {
		$('.path_of_msg').show();
		$('.path_of_continue_msg').show();
	}
	var path_of_continue_msg = $('.path_of_continue_msg');
	path_of_continue_msg.find('a:first').click(function() {
		$('<div></div>').content_selector({changeable:true,multiple:false,msg:'Choose a page to continue to',callback:function(node){
			var urn = node.content["http://scalar.usc.edu/2012/01/scalar-ns#urn"][0].value;
			var content_id = urn.substr(urn.lastIndexOf(':')+1);
			var title = node.version["http://purl.org/dc/terms/title"][0].value;
			path_of_continue_msg.find('input[name="scalar:continue_to_content_id"]').val(content_id);
			path_of_continue_msg.find('.title').html(title);
		}});
	});
	path_of_continue_msg.find('a:last').click(function() {
		path_of_continue_msg.find('input[name="scalar:continue_to_content_id"]').val('');
		path_of_continue_msg.find('.title').html('none');
	});
	$('.path_of_msg').find('a').click(function() {
		$('<div></div>').content_selector({changeable:true,multiple:true,msg:'Choose contents of the path',callback:function(nodes){
			for (var j = 0; j < nodes.length; j++) {
				var urn = nodes[j].version["http://scalar.usc.edu/2012/01/scalar-ns#urn"][0].value;
				var title = nodes[j].version["http://purl.org/dc/terms/title"][0].value;
				$('#path_of').append('<li><input type="hidden" name="container_of" value="'+urn+'" />'+title+'&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span></li>');
				$('.path_of_msg:first').html('<b>This <span class="content_type">page</span> is also a path</b> which contains:');
				$('.path_of_msg').show();
				$('.path_of_continue_msg').show();
			}
		}});
	});
	if ($('#reply_of').find('li').length) {
		$('.reply_of_msg').show();
	}
	$('.reply_of_msg').find('a').click(function() {
		$('<div></div>').content_selector({changeable:true,multiple:true,msg:'Choose items to be commented on',callback:function(nodes){
			for (var j = 0; j < nodes.length; j++) {
				var urn = nodes[j].version["http://scalar.usc.edu/2012/01/scalar-ns#urn"][0].value;
				var title = nodes[j].version["http://purl.org/dc/terms/title"][0].value;
				$('#reply_of').append('<li><input type="hidden" name="reply_of" value="'+urn+'" /><input type="hidden" name="reply_of_rel_created" value="">'+title+'&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span></li>');
				$('.reply_of_msg:first').html('<b>This <span class="content_type">page</span> is also a comment</b> which comments on:');
				$('.reply_of_msg').show();
			}
		}});
	});
	if ($('#annotation_of').find('li').length) {
		$('.annotation_of_msg').show();
	}
	$('.annotation_of_msg').find('a').click(function() {
		$('<div></div>').content_selector({type:'media',changeable:false,multiple:true,msg:'Choose items to be annotated',callback:function(nodes){
			for (var j = 0; j < nodes.length; j++) {
				var urn = nodes[j].version["http://scalar.usc.edu/2012/01/scalar-ns#urn"][0].value;
				var title = nodes[j].version["http://purl.org/dc/terms/title"][0].value;
				var url = nodes[j].version["http://simile.mit.edu/2003/10/ontologies/artstor#url"][0].value;
				var annotation_type = scalarapi.parseMediaSource(url).contentType;
				var annotation = $('<li><input type="hidden" name="annotation_of" value="'+urn+'" />'+title+'&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span><br /></li>').appendTo('#annotation_of');
				switch (annotation_type) {
					case "audio":
					case "video":
						var str = 'Start seconds: <input type="text" style="width:75px;" name="annotation_of_start_seconds" value="" />';
						str += '&nbsp; End seconds: <input type="text" style="width:75px;" name="annotation_of_end_seconds" value="" />';
						str += '<input type="hidden" name="annotation_of_start_line_num" value="" />';
						str += '<input type="hidden" name="annotation_of_end_line_num" value="" />';
						str += '<input type="hidden" name="annotation_of_points" value="" />';
						annotation.append('<div>'+str+'</div>');
						break;
					case "html":
					case "text":
					case "document":
						var str = 'Start line #: <input type="text" style="width:75px;" name="annotation_of_start_line_num" value="" />';
						str += '&nbsp; End line #: <input type="text" style="width:75px;" name="annotation_of_end_line_num" value="" />';
						str += '<input type="hidden" name="annotation_of_start_seconds" value="" />';
						str += '<input type="hidden" name="annotation_of_end_seconds" value="" />';
						str += '<input type="hidden" name="annotation_of_points" value="" />';
						annotation.append('<div>'+str+'</div>');
						break;
					case "image":
						var str = 'Left (x), Top (y), Width, Height: <input type="text" style="width:125px;" name="annotation_of_points" value="0,0,0,0" />';
						str += '<br /><small>May be pixel or percentage values; for percentage add "%" after each value.</small>';
						str += '<input type="hidden" name="annotation_of_start_line_num" value="" />';
						str += '<input type="hidden" name="annotation_of_end_line_num" value="" />';
						str += '<input type="hidden" name="annotation_of_start_seconds" value="" />';
						str += '<input type="hidden" name="annotation_of_end_seconds" value="" />';
						annotation.append('<div>'+str+'</div>');
						break;
					default:
						alert('A selected media ('+title+') is of a type not presently supported for annotation.');
						return false;
				}
				$('.annotation_of_msg:first').html('<b>This <span class="content_type">page</span> is also a annotation</b> which annotates:');
				$('.annotation_of_msg').show();
			}
		}});
	});
	if ($('#tag_of').find('li').length) {
		$('.tag_of_msg').show();
	}
	$('.tag_of_msg').find('a').click(function() {
		$('<div></div>').content_selector({changeable:true,multiple:true,msg:'Choose items to be tagged',callback:function(nodes){
			for (var j = 0; j < nodes.length; j++) {
				var urn = nodes[j].version["http://scalar.usc.edu/2012/01/scalar-ns#urn"][0].value;
				var title = nodes[j].version["http://purl.org/dc/terms/title"][0].value;
				$('#tag_of').append('<li><input type="hidden" name="tag_of" value="'+urn+'" />'+title+'&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span></li>');
				$('.tag_of_msg:first').html('<b>This <span class="content_type">page</span> is also a tag</b> which tags:');
				$('.tag_of_msg').show();
			}
		}});
	});
	if ($('#has_tag').find('li').length) {
		$('.has_tag_msg').show();
	}
	$('.has_tag_msg').find('a').click(function() {
		$('<div></div>').content_selector({changeable:true,multiple:true,msg:'Choose items that tag the current page',callback:function(nodes){
			for (var j = 0; j < nodes.length; j++) {
				var urn = nodes[j].version["http://scalar.usc.edu/2012/01/scalar-ns#urn"][0].value;
				var title = nodes[j].version["http://purl.org/dc/terms/title"][0].value;
				$('#has_tag').append('<li><input type="hidden" name="has_tag" value="'+urn+'" />'+title+'&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span></li>');
				$('.has_tag_msg:first').html('<b>This <span class="content_type">page</span> is tagged by</b> the following tags:');
				$('.has_tag_msg').show();
			}
		}});
	});
	// Taxonomies for title typeahead
	var fcroot = document.getElementById("approot").href.replace('/system/application/','');
	var book_slug = document.getElementById("parent").href.substring(fcroot.length);
	book_slug = book_slug.replace(/\//g,'');
	$.getJSON(fcroot+"/system/api/get_onomy", {slug:book_slug}, function(data) {
		var suggestions = [];
		for (var index in data) {
			var taxonomy_name;
			for (var key in data[index]) {
				if('undefined'!=typeof(data[index][key]["http://purl.org/dc/terms/title"])) {
					taxonomy_name = data[index][key]["http://purl.org/dc/terms/title"][0].value;
					break;
				}
			}
			for(var key in data[index]) {
				if (key.match(/term\/[0-9]*$/g) != null) {
					if('undefined'!=typeof(data[index][key]["http://www.w3.org/2004/02/skos/core#prefLabel"])) {
						var term_label = data[index][key]["http://www.w3.org/2004/02/skos/core#prefLabel"][0].value;
						suggestions.push({label:term_label+" ("+taxonomy_name+")", value:term_label});
					}
				}
			}
		}
		suggestions.sort(function(a,b) {
			if (a.value < b.value) return -1;
			if (a.value > b.value) return 1;
			return 0;
		})
		$('#title').autocomplete({source:suggestions});
	});
	// Color Picker (in editor)
	if ($.isFunction($.fn.farbtastic)) {
		$('#colorpicker').farbtastic('#color_select');
	}
	// Thumbnail
	var choose_thumb = $('#choose_thumbnail');
	var thumbnail = $('input[name="scalar:thumbnail"]');
	var chosen_thumb = choose_thumb.find('option:selected').val();
	if (chosen_thumb.length) thumbnail.val(chosen_thumb);
	if (thumbnail.val().length) choose_thumb.parent().prepend('<img src="'+thumbnail.val()+'" class="thumb_preview" />');
	choose_thumb.change(function() {
		thumbnail.val($(this).find('option:selected').val());
		$(this).parent().find('.thumb_preview').remove();
		$(this).parent().prepend('<img src="'+thumbnail.val()+'" class="thumb_preview" />');
	});
	thumbnail.change(function() {
		$(this).parent().find('.thumb_preview').remove();
		$(this).parent().prepend('<img src="'+thumbnail.val()+'" class="thumb_preview" />');
	});
	// Protect links from moving away from the edit page
	$('a').not('form a').click(function() {
		if (!confirm('Are you sure you wish to leave this page? Any unsaved changes will be lost.')) return false;
	});
	// Additional metadata
	$('#metadata_rows').nextAll('.add_additional_metadata:first').click(function() {
		var ontologies_url = $('link#approot').attr('href').replace('/system/application/','')+'/system/ontologies';
		$('#metadata_rows').add_metadata({title:'Add additional metadata',ontologies_url:ontologies_url});
	});
	$('#metadata_rows').nextAll('.populate_exif_fields:first').click(function() {
		if (!confirm('This feature will find any IPTC metadata fields embedded in the file, and add the field/values as additional metadata. IPTC metadata is typically embedded in JPEG and TIFF files by external applications. Do you wish to continue?')) return;
		var url = $('input[name="scalar:url"]').val();
		if (!url.length) {
			alert('Media File URL is empty');
			return;
		}
		if (-1==url.indexOf('://')) {
			url = $('link#parent').attr('href')+url;
		}
		var image_metadata_url = $('link#approot').attr('href').replace('/system/application/','')+'/system/image_metadata';
		$('#metadata_rows').find_and_add_exif_metadata({parser_url:image_metadata_url,url:url,button:this});
	});
});
// Determine if the page is a composite or media and show/hide certain elements accordingly
function checkTypeSelect() {
	var selected =  $("input:radio[name='rdf:type']:checked").val();
	if (selected.indexOf('Composite')!=-1) {
		$('.type_media').hide();
		$('.type_composite').show();
		$('.content_type').html('page');
	} else {
		$('.type_media').show();
		$('.type_composite').hide();
		$('.content_type').html('media');
	}
}

END;
$this->template->add_js($js, 'embed');
$page = (isset($page->version_index)) ? $page : null;
$version = (isset($page->version_index)) ? $page->versions[$page->version_index] : null;
?>

<!-- <h4><?=(!empty($page))?'Edit':'Add'?> content</h4> -->

<?
if ('cantaloupe' == $book->template) {
	echo('<form id="edit_form" method="post" enctype="multipart/form-data" onsubmit="return validate_form($(this), true);">');
} else {
	echo('<form id="edit_form" method="post" enctype="multipart/form-data" onsubmit="return validate_form($(this), false);">');
}
?>
<input type="hidden" name="action" value="<?=(isset($page->version_index))?'update':'add'?>" />
<input type="hidden" name="native" value="1" />
<input type="hidden" name="scalar:urn" value="<?=(isset($page->version_index)) ? $page->versions[$page->version_index]->urn : ''?>" />
<input type="hidden" name="id" value="<?=@$login->email?>" />
<input type="hidden" name="api_key" value="" />
<?if (!isset($page->version_index)): ?>
<input type="hidden" name="scalar:child_urn" value="<?=$book->urn?>" />
<input type="hidden" name="scalar:child_type" value="http://scalar.usc.edu/2012/01/scalar-ns#Book" />
<input type="hidden" name="scalar:child_rel" value="page" />
<? endif ?>
<input type="hidden" name="urn:scalar:book" value="<?=$book->urn?>" />

<table>

	<tr>
	  <td>Title</td><td><input type="text" class="form-control" id="title" name="dcterms:title" value="<?=@htmlspecialchars($version->title)?>" /></td>
	<tr>
	  <td>Description</td><td><input type="text" class="form-control" name="dcterms:description" value="<?=@htmlspecialchars($version->description)?>" /></td>
	</tr>

	<!--  Media file URL -->
	<tr class="type_media"><td>Media File URL</td><td><input class="form-control" name="scalar:url" value="<?=(!empty($file_url))?$file_url:'http://'?>" style="width:100%;" onfocus="if (this.value=='http://') this.value='';" /></td></tr>
	<? if (isset($page) && $this->versions->url_is_local($page->versions[0]->url)): ?>
	<tr class="type_media"><td></td><td>File can be replaced with another upload at <a href="<?=confirm_slash(base_url()).$book->slug?>/upload#replace=<?=$version->version_id?>">Import > Local Media Files</a></td></tr>
	<? endif ?>

	<!-- Edit content -->
	<tr id="edit_content" class="p type_composite">
		<td colspan="2">
			<!-- <div class="wysiwyg_options"><span><a href="javascript:;" class="textarea_tab wysiwyg_handle_selected to_wysiwyg_handle" title="In the editor, view a visual representation of the HTML">Visual</a>&nbsp;<a href="javascript:;" class="textarea_tab to_html_handle" title="In the editor, view the source HTML">HTML</a></span><br clear="both"></div> -->
			<textarea class="ckeditor" wrap="soft" name="sioc:content" style="visibility:hidden;"><?
			if (isset($page->version_index)):
				$content = $page->versions[$page->version_index]->content;
				if (!empty($content)) {
					//$content = fix_latin($content);
					//$content = utf8_encode($content);
					echo cleanbr(htmlspecialchars($content));
				}
			endif;
			?></textarea>
		</td>
	</tr>

	<!--  default view + components-->
	<tr id="select_view" class="p type_composite">
	  <td>Layout</td>
	  <td></td>
	</tr>

	<!-- relationships -->
	<tr id="relationships" class="p b">
		<td>Relationships</td>
		<td>

			<table class="form_fields">

			  <!-- paths -->
			  <tr id="tr_container_of">
			    <td valign="top"><span class="path_icon"></span></td>
			    <td valign="top"><?
			if (empty($page) || empty($page->versions[$page->version_index]->path_of)) {
				echo '<span class="path_of_msg"><b>To make this <span class="content_type">page</span> a path</b>, <a href="javascript:void(null);">specify the items that it contains</a></span><br />'."\n";
			} else {
				echo '<span class="path_of_msg"><b>This <span class="content_type">page</span> is also a path</b> which contains:</span><br />'."\n";
			}
			echo '      <ol id="path_of" class="edit_relationship_list sortable">'."\n";
			if (!empty($page)&&!empty($page->versions[$page->version_index]->path_of)) {
				foreach ($page->versions[$page->version_index]->path_of as $node) {
					$title = $node->versions[0]->title;
					$rel_uri = $base_uri.$node->slug;
					echo '      <li>';
					echo '<input type="hidden" name="container_of" value="'.$node->versions[0]->urn.'" />';
					echo $title;
					echo '&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span>';
					echo '</li>'."\n";
				}
			}
			echo "      </ol>\n";
			?>
			      <div class="form_fields_sub_element path_of_msg" style="display:none;"><a class="btn btn-success btn-sm generic_button border_radius">Add more content</a> or drag items to reorder</div>

			      <div class="form_fields_sub_element form_fields_sub_element_border_top form_fields_sub_element_border_bottom path_of_continue_msg" style="display:none;margin-top:12px;">After path is completed, continue to <input type="hidden" name="scalar:continue_to_content_id" value="<?=((!empty($continue_to))?$continue_to->content_id:'')?>" /><span class="title" style="font-weight:bold"><?=((!empty($continue_to))?$continue_to->versions[$continue_to->version_index]->title:'none')?></span>&nbsp; <a href="javascript:;">add</a> | <a href="javascript:">clear</a></div>

			<? if (!empty($page)&&!empty($page->versions[$page->version_index]->has_paths)): ?>
				  <div id="has_path" class="p">
			        <b>This page is contained by</b> the following paths:<br />
			        <ul class="edit_relationship_list">
			<?
					foreach ($page->versions[$page->version_index]->has_paths as $node) {
						$title = $node->versions[0]->title;
						$rel_uri = $base_uri.$node->slug;
						$rel_sort_number = 0;
						$count = 1;
						foreach ($node->versions[0]->path_of as $path_of) {
							if ($path_of->content_id == $page->content_id) {
								$rel_sort_number = $count;
								break;
							}
							$count++;
						}
						echo '<li>';
						echo '<input type="hidden" name="has_container" value="'.$node->versions[0]->urn.'" />';
						echo '<input type="hidden" name="has_container_sort_number" value="'.$rel_sort_number.'" />';
						echo $title.' (page '.$rel_sort_number.')';
						echo '&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span>';
						echo '</li>';
					}
			?>
			        </ul>
			      </div>
			<? endif ?>
			    </td>
			  </tr>

			  <!-- replies -->
			  <tr id="tr_reply_of">
			    <td valign="top"><span class="reply_icon"></span></td>
			    <td valign="top"><?
			if (empty($page) || empty($page->versions[$page->version_index]->reply_of)) {
				echo '<span class="reply_of_msg"><b>To make this <span class="content_type">page</span> a comment</b>, <a href="javascript:void(null);">specify the items that it comments on</a></span><br />'."\n";
			} else {
				echo '<span class="reply_of_msg"><b>This <span class="content_type">page</span> is also a comment</b> which comments on:</span><br />'."\n";
			}
			echo '      <ul id="reply_of" class="edit_relationship_list">'."\n";
			if (!empty($page)&&!empty($page->versions[$page->version_index]->reply_of)) {
				foreach ($page->versions[$page->version_index]->reply_of as $node) {
					$title = $node->versions[0]->title;
					$rel_slug = $base_uri.$node->slug;
					echo '      <li>';
					echo '<input type="hidden" name="reply_of" value="'.$node->versions[0]->urn.'" />';
					echo '<input type="hidden" name="reply_of_paragraph_num" value="'.$node->versions[0]->paragraph_num.'" />';
					echo '<input type="hidden" name="reply_of_datetime" value="'.$node->versions[0]->datetime.'" />';
					echo $title.' ('.date("j F Y", strtotime($node->versions[0]->datetime)).')&nbsp; ';
					echo '<span class="remove">(<a href="javascript:;">remove</a>)</span>';
					echo '</li>'."\n";
				}
			}
			echo "      </ul>\n";
			?>
			      <div class="form_fields_sub_element reply_of_msg" style="display:none;"><a class="btn btn-success btn-sm generic_button border_radius">Add more content</a></div>

			<? if (!empty($page)&&!empty($page->versions[$page->version_index]->has_replies)): ?>
			 	  <div id="has_reply" class="p">
			      	<b>This <span class="content_type">page</span> is commented on by</b> the following comments:<br />
			      	<ul class="edit_relationship_list">
			<?
				foreach ($page->versions[$page->version_index]->has_replies as $node) {
					$title = $node->versions[0]->title;
					$rel_slug = $base_uri.$node->slug;
					echo' <li resource="'.$node->slug.'">';
					echo '<input type="hidden" name="has_reply" value="'.$node->versions[$node->version_index]->urn.'" />';
					echo '<input type="hidden" name="has_reply_paragraph_num" value="'.$node->versions[$node->version_index]->paragraph_num.'" />';
					echo '<input type="hidden" name="has_reply_datetime" value="'.$node->versions[$node->version_index]->datetime.'" />';
					echo $title.' ('.date("j F Y", strtotime($node->versions[$node->version_index]->datetime)).')';
					echo '&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span>';
					echo '</li>';
				}
			?>
			      	</ul>
			      </div>
			<? endif ?>
			    </td>
			  </tr>

			  <!-- annotations -->
			  <tr id="tr_annotation_of">
			    <td valign="top"><span class="annotation_icon"></span></td>
			    <td valign="top">
			    <?
				if (empty($page) || empty($page->versions[$page->version_index]->annotation_of)) {
					echo '<span class="annotation_of_msg"><b>To make this <span class="content_type">page</span> an annotation</b>, <a href="javascript:void(null);">specify media that it annotates</a></span><br />'."\n";
				} else {
					echo '<span class="annotation_of_msg"><b>This <span class="content_type">page</span> is also a annotation</b> which annotates:</span><br />'."\n";
				}
				echo '      <ul id="annotation_of" class="edit_relationship_list">'."\n";
				if (!empty($page)&&!empty($page->versions[$page->version_index]->annotation_of)) {
					foreach ($page->versions[$page->version_index]->annotation_of as $node) {
						$title = $node->versions[0]->title;
						$rel_slug = $base_uri.$node->slug;
						echo '      <li>';
						echo '<input type="hidden" name="annotation_of" value="'.$node->versions[0]->urn.'" />';
						echo $title.'<br />';
						if (!empty($node->versions[0]->start_seconds) || !empty($node->versions[0]->end_seconds)) {
							echo 'Start seconds: <input onblur="check_start_end_values(this, $(this).nextAll(\'input:first\'))" type="text" style="width:75px;" name="annotation_of_start_seconds" value="'.$node->versions[0]->start_seconds.'" />';
							echo '&nbsp; End seconds<input onblur="check_start_end_values($(this).prevAll(\'input:first\'), this)" type="text" style="width:75px;" name="annotation_of_end_seconds" value="'.$node->versions[0]->end_seconds.'" />';
							echo '<input type="hidden" name="annotation_of_start_line_num[]" value="'.@$node->versions[0]->start_line_num.'" />';
							echo '<input type="hidden" name="annotation_of_end_line_num[]" value="'.@$node->versions[0]->end_line_num.'" />';
							echo '<input type="hidden" name="annotation_of_points[]" value="'.@$node->versions[0]->points.'" />';
						} elseif (!empty($node->versions[0]->start_line_num) || !empty($node->versions[0]->end_line_num)) {
							echo 'Start line #: <input  onblur="check_start_end_values(this, $(this).nextAll(\'input:first\'))" type="text" style="width:75px;" name="annotation_of_start_line_num" value="'.$node->versions[0]->start_line_num.'" />';
							echo '&nbsp; End line #<input onblur="check_start_end_values($(this).prevAll(\'input:first\'), this)" type="text" style="width:75px;" name="annotation_of_end_line_num" value="'.$node->versions[0]->end_line_num.'" />';
							echo '<input type="hidden" name="annotation_of_start_seconds" value="'.@$node->versions[0]->start_seconds.'" />';
							echo '<input type="hidden" name="annotation_of_end_seconds" value="'.@$node->versions[0]->end_seconds.'" />';
							echo '<input type="hidden" name="annotation_of_points" value="'.@$node->versions[0]->points.'" />';
						} elseif (!empty($node->versions[0]->points)) {
							echo 'Left (x), Top (y), Width, Height: <input type="text" style="width:125px;" name="annotation_of_points" value="'.$node->versions[0]->points.'" />';
							echo '<input type="hidden" name="annotation_of_start_seconds" value="'.@$node->versions[0]->start_seconds.'" />';
							echo '<input type="hidden" name="annotation_of_end_seconds" value="'.@$node->versions[0]->end_seconds.'" />';
							echo '<input type="hidden" name="annotation_of_start_line_num" value="'.@$node->versions[0]->start_line_num.'" />';
							echo '<input type="hidden" name="annotation_of_end_line_num" value="'.@$node->versions[0]->end_line_num.'" />';
							echo '<br /><small>May be pixel or percentage values; for percentage add "%" after each value.</small>';
						}
						echo '&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)';
						echo '</span>';
						echo '</li>'."\n";
					}
				}
				echo "      </ul>\n";
			?>
				<div class="form_fields_sub_element annotation_of_msg" style="display:none;"><a class="btn btn-success btn-sm generic_button border_radius">Annotate additional media</a></div>

			<?
			   if (!empty($page)&&!empty($page->versions[$page->version_index]->has_annotations)): ?>

			      <div id="has_annotation" class="p">
			        <b>This <span class="content_type">page</span> is annotated by</b> the following annotations:<br />
			        <ul class="edit_relationship_list">
			<?
				foreach ($page->versions[$page->version_index]->has_annotations as $node) {
					$title = $node->versions[0]->title;
					$rel_slug = $base_uri.$node->slug;
					echo' <li resource="'.$node->slug.'">';
					echo '<input type="hidden" name="has_annotation" value="'.$node->versions[0]->urn.'" />';
					echo $title.'<br />';
					if (!empty($node->versions[0]->start_seconds) || !empty($node->versions[0]->end_seconds)) {
						echo 'Start seconds: <input type="text" style="width:75px;" name="has_annotation_start_seconds" value="'.$node->versions[0]->start_seconds.'" />';
						echo '&nbsp; End seconds<input type="text" style="width:75px;" name="has_annotation_end_seconds" value="'.$node->versions[0]->end_seconds.'" />';
						echo '<input type="hidden" name="has_annotation_start_line_num" value="'.@$node->versions[0]->start_line_num.'" />';
						echo '<input type="hidden" name="has_annotation_end_line_num" value="'.@$node->versions[0]->end_line_num.'" />';
						echo '<input type="hidden" name="has_annotation_points" value="'.@$node->versions[0]->points.'" />';
					} elseif (!empty($node->versions[0]->start_line_num) || !empty($node->versions[0]->end_line_num)) {
						echo 'Start line #: <input type="text" style="width:75px;" name="has_annotation_start_line_num" value="'.$node->versions[0]->start_line_num.'" />';
						echo '&nbsp; End line #<input type="text" style="width:75px;" name="has_annotation_end_line_num" value="'.$node->versions[0]->end_line_num.'" />';
						echo '<input type="hidden" name="has_annotation_start_seconds" value="'.@$node->versions[0]->start_seconds.'" />';
						echo '<input type="hidden" name="has_annotation_end_seconds" value="'.@$node->versions[0]->end_seconds.'" />';
						echo '<input type="hidden" name="has_annotation_points" value="'.@$node->versions[0]->points.'" />';
					} elseif (!empty($node->versions[0]->points)) {
						echo 'Left (x), Top (y), Width, Height: <input type="text" style="width:125px;" name="has_annotation_points" value="'.$node->versions[0]->points.'" />';
						echo '<input type="hidden" name="has_annotation_start_seconds" value="'.@$node->versions[0]->start_seconds.'" />';
						echo '<input type="hidden" name="has_annotation_end_seconds" value="'.@$node->versions[0]->end_seconds.'" />';
						echo '<input type="hidden" name="has_annotation_start_line_num" value="'.@$node->versions[0]->start_line_num.'" />';
						echo '<input type="hidden" name="has_annotation_end_line_num" value="'.@$node->versions[0]->end_line_num.'" />';
						echo '<br /><small>May be pixel or percentage values; for percentage add "%" after each value.</small>';
					}
					echo '&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span>';
					echo '</li>';
				}
			?>
			       </ul>
			     </div>
			<? endif ?>
			    </td>
			  </tr>

			  <!-- tags -->
			  <tr id="tr_tag_of">
			    <td valign="top"><span class="tag_icon"></span></td>
			    <td valign="top">
			    <?
			if (empty($page) || empty($page->versions[$page->version_index]->tag_of)) {
				echo '<span class="tag_of_msg"><b>To make this <span class="content_type">page</span> a tag</b>, <a href="javascript:void(null);">specify the items that it tags</a></span><br />'."\n";
			} else {
				echo '<span class="tag_of_msg"><b>This <span class="content_type">page</span> is also a tag</b> which tags:</span><br />'."\n";
			}
			echo '      <ul id="tag_of" class="p">'."\n";
			if (isset($page->version_index) && !empty($page->versions[$page->version_index]->tag_of)) {
				foreach ($page->versions[$page->version_index]->tag_of as $node) {
					$title = $node->versions[0]->title;
					$rel_uri = $base_uri.$node->slug;
					echo '      <li>';
					echo '<input type="hidden" name="tag_of" value="'.$node->versions[0]->urn.'" />';
					echo $title;
					echo '&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span>';
					echo '</li>'."\n";
				}
			}
			echo "      </ul>\n";
			?>
				<div class="form_fields_sub_element tag_of_msg" style="display:none;"><a class="btn btn-success btn-sm generic_button border_radius">Tag additional content</a></div>

				<div id="tr_has_tag">
			<?
				if (empty($page) || empty($page->versions[$page->version_index]->has_tags)) {
					echo '<span class="has_tag_msg"><b>To tag this <span class="content_type">page</span>,</b> <a href="javascript:void(null);">specify items that tag it</a></span><br />'."\n";
				} else {
					echo '<span class="has_tag_msg"><b>This <span class="content_type">page</span> is tagged by</b> the following tags:</span><br />'."\n";
				}
			?>
				<ul id="has_tag" class="p">
			<?
				if (isset($page->version_index) && !empty($page->versions[$page->version_index]->has_tags)) {
					foreach ($page->versions[$page->version_index]->has_tags as $node):
						$title = $node->versions[$page->version_index]->title;
						$rel_uri = $base_uri.$node->slug;
						echo' <li>';
						echo '<input type="hidden" name="has_tag" value="'.$node->versions[$page->version_index]->urn.'" />';
						echo $title;
						echo '&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span>';
						echo '</li>';
					endforeach;
				}
			?>
				</ul>

				<div class="form_fields_sub_element" class="has_tag_msg" style="display:none;"><a class="btn btn-success btn-sm generic_button border_radius">Add additional tags</a></div>
				</div>
			    </td>
			  </tr>
			</table>
		</td>
	</tr>

  <!-- styling -->
  <tr id="styling">
  	<td><button class="btn btn-default" type="button" data-toggle="collapse" data-target="#collapseStyling" aria-expanded="false" aria-controls="collapseStyling">Styling</button></td>
  	<td>
  		<div class="collapse" id="collapseStyling">
  		<table cellspacing="0" cellpadding="0">
  		<tr><!-- thumbnail -->
  			<td>Thumbnail</td>
  			<td colspan="2">
  			Choose an image from your library:<br />
  			<select id="choose_thumbnail"><option value="">Choose an image</option><?
  				foreach ($book_images as $book_image_row) {
  					$slug_version = get_slug_version($book_image_row->slug);
  					echo '<option value="'.$book_image_row->versions[$book_image_row->version_index]->url.'" '.((@$page->thumbnail==$book_image_row->versions[$book_image_row->version_index]->url)?'selected':'').'>'.$book_image_row->versions[$book_image_row->version_index]->title.((!empty($slug_version))?' ('.$slug_version.')':'').'</option>';
  				}
  			?></select><br />
  			Or enter any URL:
  			<input class="form-control" type="text" name="scalar:thumbnail" value="<?=@$page->thumbnail?>" />
  			</td>
  		</tr>
  		<tr><!-- color -->
  			<td>Color<br /><small>e.g., for path nav bar</small></td>
  			<td><input class="form-control" type="text" id="color_select" name="scalar:color" value="<?=(!empty($page->color))?$page->color:'#ffffff'?>" /></td>
  			<td>
  				 <a href="javascript:;" class="btn btn-success btn-sm" onclick="$(this).next().toggle();">Choose</a>
  				<div style="display:none;margin-top:6px;"><div id="colorpicker"></div></div>
  			</td>
  		</tr>
  		<tr><!-- background image -->
  			<td>Background image</td>
  			<td><?=((@!empty($page->background))?'<img src="'.abs_url($page->background,confirm_slash(base_url()).confirm_slash($book->slug)).'" class="thumb_preview" />':'No background image has been set')?></td>
  			<td><select name="scalar:background"><option value="">Choose an image</option><?
  				$matched = false;
  				foreach ($book_images as $book_image_row) {
  					if (@$page->background==$book_image_row->versions[$book_image_row->version_index]->url) $matched = true;
  					$slug_version = get_slug_version($book_image_row->slug);
  					echo '<option value="'.$book_image_row->versions[$book_image_row->version_index]->url.'" '.((@$page->background==$book_image_row->versions[$book_image_row->version_index]->url)?'selected':'').'>'.$book_image_row->versions[$book_image_row->version_index]->title.((!empty($slug_version))?' ('.$slug_version.')':'').'</option>';
  				}
  				if (!$matched) {
  					echo '<option value="'.@$page->background.'" selected>'.@$page->background.'</option>';
  				}
  			?></td>
  		</tr>
  		<tr><!-- custom style -->
   			<td>
   				Custom CSS style<br />
   				<small>e.g., .cover_title {color:red;}</small>
   			</td>
  			<td colspan="2"><textarea class="form-control" name="scalar:custom_style"><?=!empty($page->custom_style) ? $page->custom_style : ''?></textarea></td>
  		</tr>
  		<tr>
   			<td>
   				Custom Javascript
   				<div><small>Javascript or jQuery source</small></div>
   			</td>
  			<td colspan="2"><textarea class="form-control" name="scalar:custom_scripts"><?=!empty($page->custom_scripts) ? $page->custom_scripts : ''?></textarea></td>
  		</tr>
  		<tr><!-- background audio -->
  			<td>Background audio</td>
  			<td><?=((@!empty($page->audio))?basename($page->audio):'No background audio has been set')?></td>
  			<td><select name="scalar:audio"><option value="">Choose an audio</option><?
  			  	$matched = false;
  				foreach ($book_audio as $book_audio_row) {
  					if (@$page->audio==$book_audio_row->versions[$book_audio_row->version_index]->url) $matched = true;
  					$slug_version = get_slug_version($book_audio_row->slug);
  					echo '<option value="'.$book_audio_row->versions[$book_audio_row->version_index]->url.'" '.((@$page->audio==$book_audio_row->versions[$book_audio_row->version_index]->url)?'selected':'').'>'.$book_audio_row->versions[$book_audio_row->version_index]->title.((!empty($slug_version))?' ('.$slug_version.')':'').'</option>';
  				}
  				if (!$matched) {
  					echo '<option value="'.@$page->audio.'" selected>'.@$page->audio.'</option>';
  				}
  			?></td>
  		</tr>
  		</table>
  		</div>
  	</td>
  </tr>

	<!--  meta -->
	<tr id="metadata">
	  <td><button class="btn btn-default" type="button" data-toggle="collapse" data-target="#collapseMetadata" aria-expanded="false" aria-controls="collapseMetadata">Metadata</button></td>
	  <td>
	    <div class="collapse" id="collapseMetadata">
		<table>
			<tr>
			  <td>Scalar URL</td>
			  <td><?=$base_uri?><input class="form-control" style="width:200px;display:inline;" name="scalar:slug" value="<?=$page_url?>" id="slug" /><? if (empty($page_url)) echo '<span style="white-space:nowrap;">&nbsp; (will auto-generate)</span>';?></td>
			</tr>
			<? if (@!empty($page->versions[$page->version_index]->attribution->fullname)): ?>
			<tr>
			  <td>Attribution</td>
			  <td><input class="form-control" name="scalar:fullname" value="<?=htmlspecialchars($page->versions[$page->version_index]->attribution->fullname)?>" style="width:180px;" />&nbsp; &nbsp; <small style="white-space:nowrap;">Alerts readers that page is by someone other than the book's authors (e.g. comments)</small></td>
			</tr>
			<? endif ?>

			<tr>
				<td>Page visibility?</td>
			    <td><select name="scalar:is_live"><option value="0" <?=((@!$page->is_live)?'selected':'')?>>Hidden</option><option value="1" <?=(!isset($page->version_index)||(@$page->is_live)?'selected':'')?>>Visible</option></select></td>
			</tr>

			  <tr>
			  <td>Content type</td>
			  <td>
			    <span style="display:none;"><!-- jQuery uses these fields to show/hide form fields related to page or media -->
			   	 	<input type="radio" name="rdf:type" id="type_text" onchange="checkTypeSelect()" value="http://scalar.usc.edu/2012/01/scalar-ns#Composite"<?=((!isset($page->type)||$page->type=='composite')?' CHECKED':'')?>><label for="type_text">Page</label>
			    	<input type="radio" name="rdf:type" id="type_media" onchange="checkTypeSelect()" value="http://scalar.usc.edu/2012/01/scalar-ns#Media"<?=((isset($page->type)&&$page->type!='composite')?' CHECKED':'')?>><label for="type_media">Media File</label>
			    	&nbsp; &nbsp;
			    </span>
			    <select name="scalar:category"><?
				$category =@ (!empty($page->category)) ? $page->category : null;
				if (empty($category) && $is_new) {
					if (strtolower($user_level)=='commentator') $category = 'commentary';
					if (strtolower($user_level)=='reviewer') $category = 'review';
				}
			  	echo '<option value="" '.((empty($category))?'selected':'').'>'.@ucwords($book->scope).' content</option>';
			  	echo '<option value="commentary" '.(('commentary'==$category)?'selected':'').'>Commentary</option>';
			  	echo '<option value="review" '.(('review'==$category)?'selected':'').'>Review</option>';
				?></td>
		   </tr>
		</table>

	  	<table id="metadata_rows">
		<?
		if (isset($page->version_index) && isset($page->versions[$page->version_index]->rdf) && !empty($page->versions[$page->version_index]->rdf)):
			foreach ($page->versions[$page->version_index]->rdf as $p => $values):
				$p = toNS($p, $ns);
				foreach ($values as $value) {
					echo '<tr class="'.$p.'">';
					echo '<td>';
					echo $p;
					echo '</td>';
					echo '<td>';
					$o = trim($value['value']);
					echo '<input class="form-control" type="text" name="'.$p.'" value="'.htmlspecialchars($o).'" />';
					echo '</td>';
					echo "</tr>\n";
				}
			endforeach;
		endif;
		?>
		</table>
		<a href="javascript:;" class="btn btn-success btn-sm generic_button border_radius default add_additional_metadata">Add additional metadata</a>&nbsp; &nbsp;
		<a href="javascript:;" class="btn btn-success btn-sm generic_button border_radius populate_exif_fields">Auto-populate IPTC fields</a>
		</div>
	  </td>
	</tr>

</table>

<div style="text-align:right;margin-top:10px;">
	<div id="spinner_wrapper" style="width:30px;display:inline-block;">&nbsp;</div>
	<a href="javascript:;" class="btn btn-default generic_button large" onclick="if (confirm('Are you sure you wish to cancel edits?  Any unsaved data will be lost.')) {document.location.href='<?=$base_uri?><?=@$page->slug?>'} else {return false;}">Cancel</a>&nbsp; &nbsp;
	<input type="submit" class="btn btn-primary generic_button large default" value="Save" />
 </div>
<br />

<?
if (isset($page->version_index)):
	// Has references
	if (!empty($page->versions[$page->version_index]->has_references)) {
		foreach ($page->versions[$page->version_index]->has_references as $node) {
			echo '<input type="hidden" name="has_reference" value="'.$node->versions[0]->urn.'" />';
			echo '<input type="hidden" name="has_reference_reference_text" value="'.htmlspecialchars(@$node->versions[0]->reference_text).'" />';
		}
	}
	// Table of Contents
	echo '<input type="hidden" name="scalar:sort_number" value="'.$page->versions[$page->version_index]->sort_number.'" />';
endif;
?>

</form>




