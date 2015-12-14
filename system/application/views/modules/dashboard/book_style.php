<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_js(path_from_file(__FILE__).'../../widgets/modals/jquery.melondialog.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'../../widgets/edit/jquery.predefined.js')?>
<?$this->template->add_css(path_from_file(__FILE__).'../../widgets/edit/content_selector.css')?>
<?$this->template->add_js(path_from_file(__FILE__).'../../widgets/edit/jquery.content_selector.js')?>
<style>
.removed {color:#bbbbbb;}
.removed a {color:#999999;}
</style>
<script id="interfaces" type="application/json"><?=json_encode($interfaces)?></script>
<script id="book_versions" type="application/json"><?=json_encode($current_book_versions)?></script>
<script id="predefined_css" type="application/json"><?=(($predefined_css)?json_encode($predefined_css):'')?></script>
<link id="book_id" href="<?=@((int)$_GET['book_id'])?>" />
<link id="active_melon" href="<?=$this->config->item('active_melon')?>" />
<link id="book_melon" href="<?=@$book->template?>" />
<link id="book_stylesheet" href="<?=@$book->stylesheet?>" />
<script>
var book_uri = '<?=addslashes(confirm_slash(base_url()).@confirm_slash($book->slug))?>';
var book_id = <?=(int) @$book->book_id?>;
// Select the reader interface (Scalar 1, Scalar 2)
function select_interface(melon) {
    $('#interface').empty();
    var $template = $('<span id="select_template"><select name="template"></select>&nbsp; </span>').appendTo('#interface');
    var $whats_this = $('<a class="whatsthis" href="javascript:void(null);">What\'s this?</a>').appendTo($template);
    $whats_this.click(function() {
		$('<div></div>').melondialog({
			data:JSON.parse($("#interfaces").text()),
			select:$(this).siblings('select:first'),
			urlroot:$('#approot').attr('href'),
			selected:melon
		});
    });
    var interfaces = JSON.parse($("#interfaces").text());
    var selected_melon = null;
    for (var j in interfaces) {
        if (melon==interfaces[j]['meta']['slug']) selected_melon = interfaces[j];
		$('<option '+((melon==interfaces[j]['meta']['slug'])?'SELECTED ':'')+' '+((!interfaces[j]['meta']['is_selectable'])?'DISABLED ':'')+' value="'+interfaces[j]['meta']['slug']+'">'+interfaces[j]['meta']['name']+'</option>').appendTo($template.find('select:first'));
    }
    $template.find('select:first').change(function() {
		var selected = $(this).find(':selected').val();
		select_interface(selected);
    });
    if (selected_melon['stylesheets'].length) {
   		var $stylesheets = $('<span>Theme: <select name="stylesheet"></select></span>').appendTo('#interface');
   		var stylesheet = selected_melon['stylesheets'][0]['slug'];
   		if ($('#book_stylesheet').attr('href').length) stylesheet = $('#book_stylesheet').attr('href');
   		var style_thumb = '';
   		for (var j in selected_melon['stylesheets']) {
   	   		if (stylesheet==selected_melon['stylesheets'][j]['slug']) style_thumb = selected_melon['stylesheets'][j]['thumb_app_path'];
			$('<option '+((stylesheet==selected_melon['stylesheets'][j]['slug'])?'SELECTED ':'')+'value="'+selected_melon['stylesheets'][j]['slug']+'">'+selected_melon['stylesheets'][j]['name']+'</option>').appendTo($stylesheets.find('select:first'));
   		}
   		var $style_thumb = $('<span id="style_thumb"><img src="'+$('link#approot').attr('href')+style_thumb+'" align="top" /></span>').appendTo('#interface');
		$stylesheets.find('select:first').change(function() {
			var selected = $(this).find(':selected').val();
			for (var j in selected_melon['stylesheets']) {
				if (selected==selected_melon['stylesheets'][j]['slug']) {
					var url = $('link#approot').attr('href')+selected_melon['stylesheets'][j]['thumb_app_path'];
					$(this).closest('#interface').find('#style_thumb img').attr('src', url);
					break;
				}
			}
		});
   	} else {
		$('<span>There are no theme options for the current template</span>').appendTo('#interface');
    }
}
// Add Main Menu items
function select_versions() {
	if ($('#versions_add_another').data('loading')) return;
	$('#versions_add_another').data('loading', true);
	$('#versions_add_another').html('Loading ...');
	var book_id = $('link#book_id').attr('href');
	var book_versions = [];
	$('#versions').find('input[type="hidden"]').each(function() {
		var $this = $(this);
		if ($this.val()!='1') return;
		book_versions.push( $this.closest('li').data('node') );
	});
	$('<div></div>').content_selector({
		parent:book_uri,
		changeable:true,
		multiple:true,
		onthefly:false,
		msg:'Selected content will be added to the <b>Table of Contents</b> items',
		callback:function(nodes){
			console.log(nodes);
			// Convert noes to book_versions array format
			formatted_nodes = [];
			for (var j = 0; j < nodes.length; j++) {
				var title = nodes[j].title;
				var urn = nodes[j].version["http://scalar.usc.edu/2012/01/scalar-ns#urn"][0].value;
				var version_id = urn.substr(urn.lastIndexOf(':')+1);
				formatted_nodes.push({versions:[{version_id:version_id,title:title}]});
			};
			console.log(formatted_nodes);
			set_versions(formatted_nodes);
		}
	});
	$('#versions_add_another').data('loading', false).html('Add table of contents item');
	/*
		$('<div></div>').bookversionsdialog({
			data:content_data,
			selected:book_versions,
			urlroot:$('#approot').attr('href'),
			callback:set_versions
		});
	*/
}
function set_versions(nodes, init) {
	if ('undefined'==init) init = false;
	var $versions = $('#versions');
	$versions.find('a').unbind( "click" );
	$versions.find('input[value="0"]').closest('li').remove();
	var book_version_ids = [];
	$versions.find('input[type="hidden"]').each(function() {
		book_version_ids.push( $(this).closest('li').data('node').versions[0].version_id );
	});
	for (var j = 0; j < nodes.length; j++) {
		if (-1!=book_version_ids.indexOf(nodes[j].versions[0].version_id)) continue;
		var $node = $('<li><input type="hidden" name="book_version_'+nodes[j].versions[0].version_id+'" value="1" />'+nodes[j].versions[0].title+' <small>(<a href="javascript:void(null);">remove</a>)</small></li>').appendTo($versions);
		$node.data('node', nodes[j]);
	}
	$versions.find('a').click(function() {
		var $li = $(this).closest('li');
		$li.addClass('removed');
		$li.find('input').attr('value', 0);
	});
	if (!init) $versions.trigger('sortchange');
}
$(window).ready(function() {
	var book_slug = $('input[name="slug"]').val();
	$('textarea[name="custom_style"],textarea[name="custom_js"]').on('paste keyup',function() {
    	var $this = $(this);
    	if($this.data('confirmed') !== true) {
			if($this.val().search(/<\/?(style|script)>/i) != -1) {
	    		var type = 'script';
				if($this.prop('name') === 'custom_style') {
	    			type = 'style';
				}
				$("#"+type+"-confirm").dialog({
					resizable:false,
					width:500,
					height:'auto',
					modal:true,
					open:function() {
						$('.ui-dialog :button').blur();
					},
					buttons: {
						"Cancel":function() {
							$(this).dialog("close");
							$this.data('confirmed',false);
							return false;
						},
						"Continue":function() {
							$(this).dialog("close");
							$this.data('confirmed',true);
						}
					}
				});
			}
		}
	});

    $('.save_changes').next('a').click(function() {
		$('#style_form').submit();
    	return false;
    });

	var active_melon = $('#active_melon').attr('href');
    var book_melon = $('#book_melon').attr('href');
    if (!book_melon.length) book_melon = active_melon;
	select_interface(book_melon);

    $('#versions').sortable();
    var book_versions = JSON.parse($("#book_versions").text());
    set_versions(book_versions, true);
    $('#versions_add_another').click(function() {
		select_versions();
    });

    var predefined_css = $("#predefined_css").text();
    $('textarea[name="custom_style"]').predefined({msg:'Insert CSS:',data:((predefined_css.length)?JSON.parse(predefined_css):{})});

	$('input[name="slug"]').keydown(function() {
		var $this = $(this);
		if (true!==$this.data('confirmed')) {
			$("#slug-change-confirm").dialog({
				resizable:false,
				width:500,
				height:'auto',
				modal:true,
				open:function() {
					$('.ui-dialog :button').blur();
				},
				buttons: {
					"Cancel":function() {
						$this.data('confirmed',false);
						$(this).dialog("close");
						$this.blur();
					},
					"Continue":function() {
						$this.data('confirmed',true);
						$(this).dialog("close");
						$this.focus();
					}
				}
			});
		}
	});

	$("#tax_search").click(function() {
		var keys = $("#tax_keys").val();
		$.getJSON("http://onomy.org/taxonomy/findDTP?sSearch="+keys+"&iDisplayLength=10&iDisplayStart=0&iSortCol_0=0&mDataProp_0=name&format=json&callback=?",
			function(data) {
				for(index in data['aaData']) {
					$("#tax_results").after('<tr><td></td><td colspan="2"><span class="tax_name">'+data['aaData'][index]['name']+'</span><a class="generic_button add_tax" version="'+data['aaData'][index]['currentVersion']+'">Add</a></td></tr>')
				}
				$('.add_tax').click(function() {
					$.ajax({
						type:'post',
						url:'api/save_onomy',
						data:{book_id:'<?=@$book->book_id?>',version:$(this).attr("version")}
					}).done(function(onomy) {
						make_taxonomy_pages(onomy);
					});
				});
			}
		);
		return false;
	});
});

function make_taxonomy_pages(onomy) {
	for(var key in onomy) {
		if (key.match(/term\/[0-9]*$/g) != null) {
			if('undefined'!=typeof(onomy[key]["http://www.w3.org/2004/02/skos/core#prefLabel"])) {
				var term_label = onomy[key]["http://www.w3.org/2004/02/skos/core#prefLabel"].value;
				var term_def = '';
				if('undefined'!=typeof(onomy[key]["http://www.w3.org/2004/02/skos/core#definition"])) {
					term_def = onomy[key]["http://www.w3.org/2004/02/skos/core#definition"].value;
				}
				var target = 'api/add';
				var value = {};
				value.action = 'ADD';
				value.native = 'true';
				value['scalar:urn'] = '';
				value.id = '<?=$login->email?>';
				value.api_key = '';
				value['scalar:child_urn'] = 'scalar:book:urn:<?=@$book->book_id?>';
				value['scalar:child_type'] = 'http://scalar.usc.edu/2012/01/scalar-ns#Book';
				value['scalar:child_rel'] = 'page';
				value['urn:scalar:book'] = 'scalar:book:urn:<?=@$book->book_id?>';
				value['rdf:type'] = 'http://scalar.usc.edu/2012/01/scalar-ns#Composite';
				// Extrapolated page fields
				value['scalar:slug'] = 'term/'+term_label;
				value['dcterms:title'] = term_label;
				value['scalar:category'] = 'term';
				value['sioc:content'] = term_def;
				$.post(target, value).always(function(err) {
					console.log(err);
				});/*, function(page_data) {
					if ('object'!=typeof(page_data)) return;
					$.each(page_data, function(k,v) {
						var version_urn = $.fn.rdfimporter('rdf_value',{rdf:v,p:'http://scalar.usc.edu/2012/01/scalar-ns#urn'});
						opts.urn_map[parent_urn] = version_urn  // map old version urn to new version URN
						opts.urn_map[key] = version_urn;  // map old URL to new version URN
					});
				}).always(function(err) {
					page_count++;
					var msg = '';
					if ('object'!=typeof(err)) {
						var msg = 'URL isn\'t a Scalar Save API URL ['+url+'] for "'+value['dcterms:title']+'"';
					} else if ('error'==err.statusText) {
						var msg = 'There was an error resolving the Save API URL ['+url+'] for "'+value['dcterms:title']+'"';
					}
						callback({dest_url:dest_url,url:url,count:page_count,total:page_total,error:((msg.length)?true:false)}, msg);
				});*/
			}
		}
	}
}

</script>
<?
	if (empty($book)) {
		echo 'Please select a book to manage using the pulldown menu above';
	}

	if (@$_REQUEST['action']=='book_style_saved') {
		echo '<div class="saved">';
		echo 'Book style has been saved ';
		echo '<div style="float:right;">';
		echo '<a href="'.confirm_slash(base_url()).$book->slug.'">back to '.$book->scope.'</a>';
		echo ' | ';
		echo '<a href="?book_id='.$book->book_id.'&zone=style">clear</a>';
		echo '</div>';
		echo '</div><br />';
	}
?>

		<div id="slug-change-confirm" title="URI Segment">
			Changing the URI Segment of the book will change its location on the web, which will make the old book URL unavailable.  Do you wish to continue?
		</div>
		<div id="style-confirm" title="Extra HTML Tags">
			You have HTML tags included in the Custom CSS box. Adding HTML to this box will cause style errors which may cause problems with your Scalar book. Note that &lt;style&gt; and &lt;/style&gt; tags are automatically included by Scalar.
		</div>
		<div id="script-confirm" title="Extra HTML Tags">
			You have HTML tags included in the Custom JS box. Adding HTML to this box will cause Javascript errors which may cause problems with your Scalar book. Note that &lt;script&gt; and &lt;/script&gt; tags are automatically included by Scalar.
		</div>
		<form id="style_form" action="<?=confirm_slash(base_url())?>system/dashboard" method="post" enctype="multipart/form-data">
		<input type="hidden" name="action" value="do_save_style" />
		<input type="hidden" name="zone" value="style" />
		<? if (!empty($book)): ?>
		<input type="hidden" name="book_id" value="<?=$book->book_id?>" />
		<? endif ?>
		<table cellspacing="0" cellpadding="0" style="width:100%;" class="trim_horz_padding">
<?
		$row = $book;
		if (!empty($row)):
			if (!empty($book_id) && $row->book_id != $book_id) continue;
			// Title
			echo '<tr typeof="books" class="styling_sub">';
			echo '<td><h4 class="content_title">Basics</h4></td><td></td></tr>';
			echo '<tr>';
			echo '<tr typeof="books">';
			echo '<td style="vertical-align:middle;">Title';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" colspan="2">';
			echo '<input name="title" type="text" value="'.htmlspecialchars($row->title).'" style="width:100%;" />';
			echo "</td>\n";
			echo "</tr>\n";
			// Subtitle
			echo '<tr typeof="books">';
			echo '<td style="vertical-align:middle;">Subtitle';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" colspan="2">';
			echo '<input name="subtitle" type="text" value="'.htmlspecialchars($row->subtitle).'" style="width:100%;" />';
			echo "</td>\n";
			echo "</tr>\n";
			// Description
			echo '<tr typeof="books">';
			echo '<td style="vertical-align:middle;">Description';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" colspan="2">';
			echo '<input name="description" type="text" value="'.htmlspecialchars($row->description).'" style="width:100%;" />';
			echo "</td>\n";
			echo "</tr>\n";
			// URI segment
			echo '<tr>';
			echo '<td style="vertical-align:middle;">URI Segment';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" class="row_div" colspan="2">';
			echo confirm_slash(base_url()).'<input name="slug" type="text" value="'.htmlspecialchars($row->slug).'" style="width:150px;" />';
			echo "</td>\n";
			echo "</tr>\n";
			// Main menu
			echo '<tr typeof="books">';
			echo '<td style="width:190px;">Table of Contents';
			echo '<br /><small>Drag TOC items to reorder</small>';
			echo '</td>'."\n";
			echo '<td colspan="2">';
			echo '<ol id="versions"></ol>';
			echo '<a href="javascript:void(null);" id="versions_add_another">Add table of contents item</a></td>'."\n";
			echo "</tr>\n";
			echo '<tr typeof="books" class="styling_sub">';
			echo '<td><h4 class="content_title">Style</h4></td><td></td>';
			echo '</tr>';
			// Template/stylesheet
			echo '<tr>';
			echo '<td><p>Interface</p></td>'."\n";
			echo '<td>';
			echo '<p id="interface">';
			echo '</p>';
			echo "</td>\n";
			echo '<td>';
			echo "</td>\n";
			echo "</tr>\n";
			// Background
			echo '<tr typeof="books">';
			echo '<td><p>Background image</p></td>'."\n";
			echo '<td style="vertical-align:middle;">';
			if (!empty($row->background)) {
				echo '<img src="'.abs_url($row->background,confirm_slash(base_url()).$row->slug).'?t='.time().'" style="vertical-align:middle;margin-right:10px;height:75px;border:solid 1px #aaaaaa;" /> '."\n";
			}
			echo '<p>Select image: <select name="background" style="max-width:400px;"><option value="">Choose an imported image</option>';
  			$matched = false;
  			foreach ($current_book_images as $book_image_row) {
  				if (@$row->background==$book_image_row->versions[$book_image_row->version_index]->url) $matched = true;
  				$slug_version = get_slug_version($book_image_row->slug);
  				echo '<option value="'.$book_image_row->versions[$book_image_row->version_index]->url.'" '.((@$row->background==$book_image_row->versions[$book_image_row->version_index]->url)?'selected':'').'>'.$book_image_row->versions[$book_image_row->version_index]->title.((!empty($slug_version))?' ('.$slug_version.')':'').'</option>';
  			}
  			if (@!empty($row->background) && !$matched) {
  				echo '<option value="'.@$row->background.'" selected>'.@$row->background.'</option>';
  			}
			echo '</select></p>';
			if (!empty($row->background)) echo '<p><input type="checkbox" name="remove_background" id="remove_background" value="1" /><label for="remove_background"> Remove image</label></p></td>'."\n";
			echo '<td>';
			echo '</td>'."\n";
			echo "</tr>\n";
			// Thumbnail
			echo '<tr typeof="books">';
			echo '<td><p>Thumbnail image</p></td>'."\n";
			echo '<td style="vertical-align:middle;">';
			if (!empty($row->thumbnail)) {
				echo '<input type="hidden" name="thumbnail" value="'.$row->thumbnail.'" />';
				echo '<img src="'.confirm_slash(base_url()).confirm_slash($row->slug).$row->thumbnail.'?t='.time().'" style="vertical-align:middle;margin-right:10px;border:solid 1px #aaaaaa;" /> ';
				echo basename($row->thumbnail)."\n";
			}
			echo '<p>Upload image: <input type="file" name="upload_thumb" />';
			echo '<br /><span style="font-size:smaller;">JPG, PNG, or GIF format; will be resized to 120px</span></p>';
			if (!empty($row->thumbnail)) echo '<p><input type="checkbox" name="remove_thumbnail" id="remove_thumbnail" value="1" /><label for="remove_thumbnail"> Remove image</label></p>';
			echo '</td>'."\n";
			echo '<td>';
			echo '</td>'."\n";
			echo "</tr>\n";
			// Custom style
			echo '<tr typeof="books">';
			echo '<td style="width:190px;">Custom style';
			echo '<br /><small>Example:<br /><span style="color:#333333;">body {font-family:Helvetica;}<br />No &lt;style&gt; or &lt;/style&gt; tags</span></small>';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" colspan="2">';
			echo '<textarea name="custom_style" style="width:100%;height:80px;">';
			echo (!empty($row->custom_style)) ? trim($row->custom_style) : '';
			echo '</textarea></td>'."\n";
			echo "</tr>\n";
			// Custom javascript
			echo '<tr typeof="books">';
			echo '<td style="width:190px;">Custom Javascript';
			echo '<br /><small>E.g., Google Analytics code<br />No &lt;script&gt; or &lt;/script&gt; tags</small>';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" class="row_div" colspan="2">';
			echo '<textarea name="custom_js" style="width:100%;height:80px;">';
			echo (!empty($row->custom_js)) ? trim($row->custom_js) : '';
			echo '</textarea></td>'."\n";
			echo "</tr>\n";
			// Scope
			echo '<tr typeof="books" class="styling_sub">';
			echo '<td><h4 class="content_title">Publisher</h4></td><td></td>';
			echo '</tr>';
			echo '<tr>';
			echo '<td style="vertical-align:middle;">Scope';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" colspan="2">';
			echo 'Select scope: <select name="scope">';
			echo '<option value="book"'.(($row->scope=='book')?' SELECTED':'').'>Book</option>';
			echo '<option value="article"'.(($row->scope=='article')?' SELECTED':'').'>Article</option>';
			echo '<option value="project"'.(($row->scope=='project')?' SELECTED':'').'>Project</option>';
			echo '</select>';
			echo "</td>\n";
			echo "</tr>\n";
			// Publisher
			echo '<tr>';
			echo '<td style="vertical-align:middle;">Publisher name<br /><small>Include HTML <b>'.htmlspecialchars('<a>').'</b> to create link</small>';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" colspan="2">';
			echo '<input name="publisher" type="text" value="'.htmlspecialchars($row->publisher).'" style="width:100%;" />';
			echo "</td>\n";
			echo "</tr>\n";
			// Publisher icon
			echo '<tr>';
			echo '<td><p>Publisher logo<br /><small><b>'.htmlspecialchars('<a>').'</b> in previous field makes link</p></td>'."\n";
			echo '<td style="vertical-align:middle;">';
			if (!empty($row->publisher_thumbnail)) {
				echo '<input type="hidden" name="publisher_thumbnail" value="'.$row->publisher_thumbnail.'" />';
				echo '<img src="'.confirm_slash(base_url()).confirm_slash($row->slug).$row->publisher_thumbnail.'?t='.time().'" style="vertical-align:middle;margin-right:10px;border:solid 1px #aaaaaa;" />';
				echo '<b>'.$row->publisher_thumbnail.'</b>';
			}
			echo '<p>Upload image: <input type="file" name="upload_publisher_thumb" /><br /><span style="font-size:smaller;">JPG, PNG, or GIF format; will be resized to 120px</span></p>'."\n";
			if (!empty($row->publisher_thumbnail)) echo '<p><input type="checkbox" name="remove_publisher_thumbnail" value="1" /> Remove image</p>';
			echo '</td>'."\n";
			echo "</tr>\n";
			// Taxonomy Search
			echo '<tr style="display:none;" typeof="books" class="styling_sub">';
			echo '<td colspan="3"><h4 class="content_title">Taxonomies</h4></td>';
			echo '</tr>';
			echo '<tr style="display:none;">';
			echo '<td style="vertical-align:middle;">Search Taxonomies';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" colspan="2">';
			echo '<input id="tax_keys" style="vertical-align:middle;" type="text" /><a class="generic_button" id="tax_search">Search</a>';
			echo "</td>\n";
			echo "</tr>\n";
			// Taxonomy Results
			echo '<tr style="display:none;" id="tax_results">';
			echo '<td colspan="3">Results</td>'."\n";
			echo "</tr>\n";
			// Saves
			echo "<tr>\n";
			echo '<td style="padding-top:8px;text-align:right;" colspan="3"><span class="save_changes">You have unsaved changes.</span> &nbsp; <a class="generic_button large default" href="javascript:;">Save</a></td>';
			echo "</tr>\n";
		endif;
?>
		<td>

		</td>
		</tr>
		</table>
		</form>