/**
 * Scalar    
 * Copyright 2013 The Alliance for Networking Visual Culture.
 * http://scalar.usc.edu/scalar
 * Alliance4NVC@gmail.com
 *
 * Licensed under the Educational Community License, Version 2.0 
 * (the "License"); you may not use this file except in compliance 
 * with the License. You may obtain a copy of the License at
 * 
 * http://www.osedu.org/licenses /ECL-2.0 
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.       
 */  

/**
 * @projectDescription		Provide interactions for the page editor
 * @note					Procedural and in need of a re-write to jQuery plugins, but gets the job done
 * @author					Craig Dietrich
 * @version					1.2
 */

/**
 * Toggle a zone (e.g., style, metadata, etc)
 */

(function($){
    $.fn.extend({ 
        toggle_zone: function() {
            return this.each(function() {
            	var $arrow = $(this);
            	var $parent = $arrow.closest('tr, div');
            	var is_open = $arrow.hasClass('edit_page_arrow_down') ? true : false;
            	if (is_open) {
            		$arrow.removeClass('edit_page_arrow_down').addClass('edit_page_arrow_right');
            	} else {
            		$arrow.removeClass('edit_page_arrow_right').addClass('edit_page_arrow_down');
            	}
            	$parent.children(':nth-child(2)').toggle();
            });
        }
    });  
})(jQuery);

/** 
 * Escape the last URI segment (the filename)
 */

function escpaeLastURISegment(uri) {
	if (!uri || 'undefined'==typeof(uri) || -1==uri.indexOf('/')) return uri;
	if (uri.indexOf('%')!=-1) return uri;
	var segments = uri.split('/');
	var filename_segments = segments[segments.length-1].split('?');
	var filename = filename_segments[0];
	var getvars = ('undefined'!=typeof(filename_segments[1])) ? filename_segments[1] : null;;
    var uri_to_return = '';
    for (var j = 0; j < segments.length-1; j++) {
    	uri_to_return += segments[j]+'/';
    }
    uri_to_return += escape(filename);
    if (getvars) uri_to_return += '?'+getvars
	return uri_to_return;
}

function ucwords (str) {
	// http://kevin.vanzonneveld.net
	return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
		return $1.toUpperCase();
	});
}

function dash_to_space(str) {
	return str.replace(/-/g, ' ');
}

/**
 * Boot the interface
 */

$(window).ready(function() {

    // Warnings
    if ($.browser.msie) $('#ie_warning').show();

	// Display add new buttons if content exists in relational areas
	if ($('#container_of_editor').find('li').length) {
		$('#container_of_add_content').show();
		$('#path_continue_to').show();
		$('#path_color').show();
	}
	if ($('#tag_of_editor').find('li').length) {
		$('#tag_of_add_content').show();
	}
	if ($('#has_tag_editor').find('li').length) {
		$('#has_tag_add_content').show();
	}
	if ($('#annotation_of_editor').find('li').length) {
		$('#annotation_of_add_content').show();
	}			
	if ($('#reply_of_editor').find('li').length) {
		$('#reply_of_add_content').show();
	}	
	$('.rel_link').click(function() {
		if (!confirm('Are you sure you wish to follow this link?  Any unsaved changes will be lost.')) {
			return false;
		} else {
			return true;
		}
	});
	
	var fcroot = document.getElementById("approot").href.replace('/system/application/','');
	var book_slug = document.getElementById("parent").href.substring(fcroot.length);
	book_slug = book_slug.replace(/\//g,'');
	$.getJSON(fcroot+"/system/api/get_onomy", {
			slug:book_slug
		},
		function(data) {
			var suggestions = [];
			for(index in data) {
				var taxonomy_name;
				for(var key in data[index]) {
					if('undefined'!=typeof(data[index][key]["http://purl.org/dc/terms/title"])) {
						taxonomy_name = data[index][key]["http://purl.org/dc/terms/title"][0].value;
					}
					break;
				}
				for(var key in data[index]) {
					if (key.match(/term\/[0-9]*$/g) != null) {
						if('undefined'!=typeof(data[index][key]["http://www.w3.org/2004/02/skos/core#prefLabel"])) {
							var term_label = data[index][key]["http://www.w3.org/2004/02/skos/core#prefLabel"][0].value;
							suggestions.push({
								label:term_label+" ("+taxonomy_name+")",
								value:term_label
							});
						}
					}
				}
			}
			suggestions.sort(function(a,b) {
				if (a.value < b.value)
				     return -1;
				  if (a.value > b.value)
				    return 1;
				  return 0;
			})
			$('#title').autocomplete({source:suggestions});
		});

	// If  the type is passed via GET
	checkTypeSelect();  
	if (-1!=document.location.href.indexOf('new.edit') && -1!=document.location.href.indexOf('type=media')) {
		$("#type_text").removeAttr('checked'); 
		$("#type_media").attr("checked", "checked"); 
		checkTypeSelect();
	}
	
	// View options
	$('#select_view td:nth-child(2)').select_view({data:views,default_value:$('link#default_view').attr('href')});
	
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
	
	// WYSIWYG
	var can_use_wysiwyg = (isIOS()) ? false : true;
	editor_wysiwyg = null;
	if (can_use_wysiwyg) {
		if ($.isFunction($.fn.wysiwyg)) {
			var w_opts = {css:$('link#approot').attr('href')+'views/widgets/wysiwyg/wysiwyg.css'};
			editor_wysiwyg = $('.wysiwyg').wysiwyg(w_opts); // global
		}		
	} else {
		$('.wysiwyg_options').html('<div class="error">Scalar does not currently support the full range of editing and linking features on your device.</div>');
	}
	
	// Thumbnail
	var $choose_thumb = $('#choose_thumbnail');
	var $thumbnail = $('input[name="scalar:thumbnail"]');
	var chosen_thumb = $choose_thumb.find('option:selected').val();
	if (chosen_thumb.length) $thumbnail.val(chosen_thumb);
	if ($thumbnail.val().length) $choose_thumb.parent().prepend('<img src="'+$thumbnail.val()+'" class="thumb_preview" />');
	$choose_thumb.change(function() {
		$thumbnail.val($(this).find('option:selected').val());
		$(this).parent().find('.thumb_preview').remove();
		$(this).parent().prepend('<img src="'+$thumbnail.val()+'" class="thumb_preview" />');		
	});
	$thumbnail.change(function() {
		$(this).parent().find('.thumb_preview').remove();
		$(this).parent().prepend('<img src="'+$thumbnail.val()+'" class="thumb_preview" />');
	});
	
	// Color Picker (in editor)
	if ($.isFunction($.fn.farbtastic)) {
		$('#colorpicker').farbtastic('#color_select');	
	}	
	
	// Protect links from moving away from the edit page
	$('a').not('form a').click(function() {
		if (!confirm('Are you sure you wish to leave this page? Any unsaved changes will be lost.')) {
			return false;
		}
	});
	
	// Sortable lists    
	$(".sortable").sortable(); 	
	
	// Hide certain zones (e.g., style, metadata, etc)
	$('#other .edit_page_arrow, #add_meta .edit_page_arrow, #styling .edit_page_arrow').toggle_zone().click(function() {
		$(this).toggle_zone();
	});

});



/**
 * Determine if the page is a composite or media and show/hide certain elements accordingly
 */

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

/**
 * Lazy load the book's content via the API to make available for the content selector box
 */

function load_content(content_type, $div, $list, _insert_func, default_type, only_default_type, select_single) {               
	
	$('.content_loading').fadeIn('fast');
	
	var debth_chart = {
	        		'page':0,
	        		'media':0,
	        		'path':1,
	        		'tag':1,
	        		'annotation':1,
	        		'reply':1
					  };	
	
	scalarapi.loadPagesByType(content_type, true, function() {
		listeditor_filter_options($div, $list, _insert_func, default_type, only_default_type, select_single);
		$('.content_loading').hide();
	}, null, debth_chart[content_type]);	

}

/**
 * Request specific content
 */

function search_for_content(sq, $div, $list, _insert_func, default_type, only_default_type, select_single) {
		
	$('.content_loading').fadeIn('fast');
	
	scalarapi.nodeSearch(sq, function() {
		content_array_complete_types = ['page','media','path','tag','annotation','reply']; // global	
		content_array_complete = true; // global		
		listeditor_filter_options($div, $list, _insert_func, default_type, only_default_type, select_single);
		$('.content_loading').hide();
	});	
	
}

/**
 * Validate form data before sending to Scalar's save API
 */

function validate_form($form, ignoreViewCheck) {

 	// Commit WYSIWYG content to textarea
	if (editor_wysiwyg && !$('.wysiwyg:hidden > iframe').length) {
		editor_wysiwyg.data('wysiwyg').saveContent();
	}
	if ('undefined'!=typeof(CKEDITOR)) {
		var textarea = CKEDITOR.instances['sioc:content'].getData();
		$form.find('textarea[name="sioc:content"]').val(textarea);
	}

	// Make sure title is present
	var title = $('#title').val();
	if (title.length==0) {
		alert('Title is a required field.  Please enter a title at the top of the form.');
		return false;
	}

	// Make sure slug is present if the page has already been created (otherwise the API will create)
	var action = $('input[name="action"]').val().toLowerCase();
	if ('add'!=action) {
		var slug = $('#slug').val();
		if (slug.length==0) {
			alert('Page URL is a required field.  Please enter a URL segment in the Metadata tab at the bottom of the page.');
			return false;
		}	
	}
	if (!ignoreViewCheck) {
		// If default view is 'plain', send warning if media has been linked in the WYSIWYG
		var default_view_value = $("[name='scalar:default_view'] option:selected").val();
		var default_view_name = $("[name='scalar:default_view'] option:selected").html();
		if ('plain'==default_view_value) {
			var textarea_content = $('#edit_content textarea:first').val();
			var confirm_default_view_msg = 'The page content appears to have one or more links to imported Scalar media.  However, the layout of the page is set to its default value.  Pages with embedded media work best in other layouts such as text-emphasis or media-emphasis.  Do you wish to save this page with the current settings?';
			try {
				$('<div>'+textarea_content+'</div>').find('a:not(.inline)').each(function() {
					if ($(this).attr('resource')) throw 'resource link present';
				});
			} catch(e) {
	    	    if (!confirm(confirm_default_view_msg)) return false;
	    	}	
		}
	
		// If no media has been linked, send warning (ie, media-emphasis view)
		var media_views = ['text','media','split','par','revpar'];
		if (media_views.indexOf(default_view_value)!=-1) {
			var confirm_default_view_msg = 'You have selected a layout, '+default_view_name+', that works best when media have been connected directly to pieces of text (e.g., using the first blue button in the text editor). However, it appears there are no direct text-media links established.  We recommend changing the layout to empty or establishing direct text-media links.  Do you wish to save this page with the current settings?';
			var textarea_content = $('#edit_content textarea:first').val();
			if (!$('<div>'+textarea_content+'</div>').find('a:not(.inline)').length) {
				if (!confirm(confirm_default_view_msg)) return false;
			}	
		}
	}

	send_form($form);

	return false;

}

/**
 * Create the box for choosing book content with support for specific relationships
 * TODO: this was written in haste and added onto over the years...
 */

function listeditor_add($list, _insert_func, default_type, only_default_type, select_single) {

	if ('undefined'==default_type) default_type = null;
	if ('undefined'==only_default_type) only_default_type = false;
	if ('undefined'==select_single) select_single = false;
	var insert_func = ('undefined'==_insert_func) ? null : _insert_func;
	var parent = $('link#parent').attr('href');
	// Create box
	$('#listeditor_editbox').remove();
	var $div = $('<div id="listeditor_editbox"></div>');
	$("body").append($div);
	listeditor_position(null, $div);
	$div.show();
	// Options
	$fetch_options = $('<div class="fetch_options">Search for content:&nbsp; <form id="search_for_content" style="display:inline;"><input type="text" name="sq" value="" /> <input type="submit" value="Go" /></form>&nbsp; &nbsp; Or, choose a content type below:</div>');
	$div.append($fetch_options);
	$fetch_options.find('#search_for_content').submit(function() {
		var sq = $fetch_options.find('input[name="sq"]').val();
		if (!sq.length) {
			alert('Please enter a search term');
			return;
		}
		listeditor_filter_reset($div);
		$div.find('.filters').fadeIn('fast');
		search_for_content(sq, $div, $list, _insert_func, default_type, only_default_type, select_single);
		return false;
	});
	// Filters
	var $filters = $('<div class="filters"><span class="loading_complete page"><input type="radio" name="filter" value="content" id="all" /> <label for="all">All</label>&nbsp; &nbsp; </span><span class="loading_complete page"><input type="radio" name="filter" value="page" id="pages" /> <label for="pages">Pages</label>&nbsp; &nbsp; </span><span class="loading_complete media"><input type="radio" name="filter" value="media" id="media" /> <label for="media">Media</label>&nbsp; &nbsp; </span><span class="loading_complete path"><input type="radio" name="filter" value="path" id="paths" /> <label for="paths">Paths</label>&nbsp; &nbsp; </span><span class="loading_complete tag"><input type="radio" name="filter" value="tag" id="tags" /> <label for="tags">Tags</label>&nbsp; &nbsp; </span><span class="loading_complete annotation"><input type="radio" name="filter" value="annotation" id="annotations" /> <label for="annotations">Annotations</label>&nbsp; &nbsp; </span><span class="loading_complete reply"><input type="radio" name="filter" value="reply" id="replies" /> <label for="replies">Comments</label></span>&nbsp; &nbsp; <span class="content_loading">Content loading</span></div>');
	$filters.find('input').click(function() {
		var content_type = $(this).val();
		load_content(content_type, $div, $list, _insert_func, default_type, only_default_type, select_single);
	});
	$div.append($filters);	
	// Content wrapper (for overflow)
	var $content_wrapper = $('<div class="content_wrapper"><br />Select a content type or search above</div>');
	$div.append($content_wrapper);
	// Cancel, Add
	var $add_options = $('<div class="add_selected_wrapper"></div>');
	var $link = $('<a href="javascript:;" class="generic_button large">Cancel</a>');
	$link.click(function() {
		$(this).parent().parent().remove();
	});	
	$add_options.append($link);
	if (!select_single) {
		var $add_selected = $('<a class="generic_button large default" style="margin-left:5px;" href="javascript:;">Add selected</a>');
		$add_selected.click(function() {
			listeditor_save($list, insert_func);
		});
		$add_options.append($add_selected);
	}
	$div.append($add_options);
	// Create a new page on the fly
	if (default_type!='media'||!only_default_type) {
		var $new = $('<div class="create_new"><a class="edit_page_arrow edit_page_arrow_down"><b>Or, create a new page on the fly</b></a><div><div style="height:4px;overflow:hidden;"></div><input type="text" class="new_title" value="New page title" onfocus="if (this.value==\'New page title\') this.value=\'\';" /> <input type="text" class="new_desc" value="New page description" onfocus="if (this.value==\'New page description\') this.value=\'\';" /><br /><textarea class="new_content" onfocus="if (this.value==\'New page content\') this.value=\'\';">New page content</textarea><br/><a href="javascript:;" style="float:right;" class="generic_button">Create new page</a></div></div>');
		$div.append($new);
		$new.find('a:last').click(function() {
			listeditor_createnew($list, insert_func);
			return false;
		});		
		$new.find('a:first').toggle_zone().click(function() {
			$(this).toggle_zone();
			listeditor_position($content_wrapper, $div);
		});
	}
	// Reposition box
	listeditor_position($content_wrapper, $div);	
	// Invoke a radio button if appropriate
	if (default_type) {
		$filters.find('input[value="'+default_type+'"]').attr('checked',true);
		if (only_default_type) $filters.find(':not(input[value="'+default_type+'"])').attr('disabled',true);
		load_content(default_type, $div, $list, _insert_func, default_type, only_default_type, select_single);
	}	

}

function listeditor_position($content_wrapper, $div) {
	
	if ('undefined'!=typeof($content_wrapper)&&$content_wrapper) {
		var vert_margin = 140; // Magic number
		$div.children().not('.'+$content_wrapper.attr('class')).each(function() {
			vert_margin = vert_margin + parseInt($(this).outerHeight());
		});		
		$content_wrapper.height( parseInt($(window).height())-vert_margin ); 	
	}
	$div.css('top', (parseInt($(window).height())/2 - $div.innerHeight()/2 + $(window).scrollTop()) );
	$div.css('left', (parseInt($(window).width())/2 - $div.innerWidth()/2) );	
	
}

function listeditor_filter_reset($div) {
	
	var $filters = $div.find('.filters');	
	$filters.find('input').attr("checked", false);
	scalarapi.model.removeNodes();
	
}

function listeditor_filter_options($div, $list, _insert_func, default_type, only_default_type, select_single) {		
	
	listeditor_fill_table($div, $list, _insert_func, default_type, only_default_type, select_single);	

}

function listeditor_fill_table($div, $list, _insert_func, default_type, only_default_type, select_single) {

	var parent = $('link#parent').attr('href');
	var value = $div.find("input:radio[name=filter]:checked").val();
	if ('undefined'==typeof(value) || !value.length) {
		var nodes = scalarapi.model.getNodes();
	} else {
		var nodes = scalarapi.model.getNodesWithProperty('scalarType', value);
	}
	// Table to contain the content
	$div.find('.content_wrapper').empty();
	var $table = $('<table class="content" cellspacing="0" cellpadding="0"><thead><tr class="head">'+((!select_single)?'<th>&nbsp;</th>':'')+'<th>Title</th><th>Description</th><th>&nbsp;</th></tr></thead><tbody></tbody></table>');
	$div.find('.content_wrapper').append($table);	
	// Propogate table
	for (j = 0; j < nodes.length; j++) {
		var type = nodes[j].getDominantScalarType().id;
		if ('book'==type) continue;
		if (!nodes[j].current) continue;
		var $tr = $('<tr></tr>');
		$tr.data('node', nodes[j]);
		$table.find('tbody').append($tr);
		if (!select_single) $tr.append('<td class="select_col"><input type="checkbox" /></td>');
		$tr.append('<td class="title_col">'+((nodes[j].getDisplayTitle())?nodes[j].getDisplayTitle():nodes[j].url.substr(parent.length))+'</td>');
		$tr.append('<td class="descr desc_col collapse_expand">'+((nodes[j].current.description)?nodes[j].current.description:'(No description)')+'</td>');
		$tr.append('<td class="preview_col"><a class="generic_button preview_button" href="'+nodes[j].url+'" style="white-space:nowrap;">Preview</a></td>');
	}	
	// Sort table
	$div.find('table:first').tablesorter({
		sortList: [[0,0],[1,0]]
	});	
	// Add events
	$div.find('#search_count').html('Found '+$table.find('tr').length+'&nbsp;');
	$table.find('.preview_button').click(function(e) {
		e.stopPropagation();
		window.open($(this).attr('href'), 'preview_window', 'width=1000,height=800');
		return false;
	});
	$table.find("input[type='checkbox']").click(function(e) {
		e.stopPropagation();
	});
	$table.find('tr:not(".head")').click(function() {
		var $tr = $(this);
		if ($tr.parent().is('thead')) return;
		if (select_single) {
			listeditor_save($list, _insert_func, $tr, select_single);
		} else {
			var is_checked = $tr.find("input[type='checkbox']:first").attr('checked') ? true : false;
			$tr.find("input[type='checkbox']:first").attr('checked', !is_checked);
		}
	});
	$table.find('.collapse_expand').each(function() {
		var $this = $(this);
		var maxlen = 60; 
		if ($this.html().length > maxlen) { 
			var $expanded = $('<span class="expand" style="display:none;">'+$this.html()+' &nbsp;<a class="toggle_collapse_expand" href="javascript:void(null);">&lt;&lt;</a></span>');
			var $collapsed = $('<span class="expand">'+$this.html().substr(0, maxlen)+' ... <a class="toggle_collapse_expand" href="javascript:void(null);">&gt;&gt;</a></span>');
			$this.empty();
			$this.append($expanded);
			$this.append($collapsed);
			$this.find('a.toggle_collapse_expand').click(function() {
				$(this).parent().toggle();
				$(this).parent().siblings().toggle();
				return false;
			});
		}
	});

} 

function listeditor_search(sq) {
	var count = 0;
	sq = sq.toLowerCase();
	$(".content_wrapper tr").each(function() {
		var $row = $(this);
		if ($row.parent().is('thead')) return;
		if ($row.hasClass('filtered')) return;
		$row.hide();
		var show = false;
		$row.find('td').each(function() {
			var $td = $(this);
			if (strip_tags($td.html().toLowerCase()).indexOf(sq)!=-1) show = true;
		});
		if (show) {
			$row.show();
			count++;			
		}
	});	
	$('#search_count').html('Found '+count+'&nbsp;<span class="clear_link"><a href="javascript:;">clear search</a></span>');
	$('#search_count').find('.clear_link').click(function() {
		var count = 0;
		$(".content_wrapper tr").each(function() {
			var $row = $(this);
			if ($row.parent().is('thead')) return;
			if ($row.hasClass('filtered')) return;
			$row.show();
			count++;
		});	
		$('#search_count').html('Found '+count+'&nbsp;');		
	});
}

function listeditor_save($list, insert_func, $row, select_single) {
	// Multiple items selected
	if ('undefined'==typeof($row)) { 
		$(".content_wrapper tr input[type='checkbox']:checked").each(function() {
			var $row = $(this).closest('tr');
			listeditor_commit_save($list, insert_func, $row.data('node'));	
		});
	// Single item selected
	} else {
		// Melon config defines insert function reference options
		var insert_func_name = (typeof(insert_func)=='function')?insert_func.funcname:window[insert_func].funcname;
		if ('undefined'!=typeof(window['reference_options']) && (insert_func_name in window['reference_options']) && !jQuery.isEmptyObject(window['reference_options'][insert_func_name])) {
			var $options_div = $('<div class="media_options"></div>').appendTo('body');
			$options_div.css( 'top', (($(window).height()*0.30) + $(document).scrollTop()) );
			$options_div.html('<p>Please select media reference options below.  Some options might not be applicable to all relationship types.</p>');
			for (var option_name in window['reference_options'][insert_func_name]) {
				var $option = $('<p>'+ucwords(dash_to_space(option_name))+': <select name="'+option_name+'"></select></p>');
				for (var j = 0; j < window['reference_options'][insert_func_name][option_name].length; j++) {
					$option.find('select:first').append('<option value="'+window['reference_options'][insert_func_name][option_name][j]+'">'+ucwords(dash_to_space(window['reference_options'][insert_func_name][option_name][j]))+'</option>');
				}
				$options_div.append($option);
			}
			$options_div.append('<p><br /><input type="button" class="generic_button large" value="Cancel" />&nbsp; <input type="button" class="generic_button large default" value="Continue" /><br clear="both" /></p>');
			var node_data = $row.data('node');
			$options_div.find('input:first').click(function() {
				$options_div.remove();
			});
			$options_div.find('input:last').bind('click', {$list:$list,insert_func:insert_func,node_data:node_data}, function() {
				var data_fields = {};
				for (var option_name in window['reference_options'][insert_func_name]) {
					data_fields[option_name] = $options_div.find('select[name="'+option_name+'"] option:selected"').val();
				}
				listeditor_commit_save($list, insert_func, node_data, data_fields);
				$options_div.remove();
			});
		// No reference options
		} else {
			listeditor_commit_save($list, insert_func, $row.data('node'));
		}
	}
	$('#listeditor_editbox').remove();
}

function listeditor_commit_save($list, insert_func, node, data_fields) {
	var parent = $('link#parent').attr('href');
	var content_urn = node.urn;
	var version_urn = node.current.urn;
	var title = node.getDisplayTitle();
	var scalar_url = node.url;
	if (scalar_url&&-1!=scalar_url.indexOf(parent)) scalar_url = scalar_url.substr(parent.length);  // absolute -> relative url
	var annotation_type = (node.current.mediaSource) ? node.current.mediaSource.contentType : null;
	var source_url = (node.current.sourceFile) ? node.current.sourceFile : null;
	if (source_url&&-1!=source_url.indexOf(parent)) source_url = source_url.substr(parent.length);  // absolute -> relative url
	source_url = escpaeLastURISegment(source_url);
	var relations = node.getRelations('annotation', 'outgoing');
	var annotation_of_scalar_url = (relations.length) ? relations[0].target.url : null;
	if (annotation_of_scalar_url&&-1!=annotation_of_scalar_url.indexOf(parent)) annotation_of_scalar_url = annotation_of_scalar_url.substr(parent.length);  // absolute -> relative url
	var annotation_of_source_url = (relations.length&&relations[0].target.current) ? relations[0].target.current.sourceFile : null;
	annotation_of_source_url = escpaeLastURISegment(annotation_of_source_url);
	if (annotation_of_source_url&&-1!=annotation_of_source_url.indexOf(parent)) annotation_of_source_url = annotation_of_source_url.substr(parent.length);  // absolute -> relative url
	if (typeof(insert_func)=='function') {
		if (!insert_func($list, title, scalar_url, source_url, content_urn, version_urn, annotation_type, annotation_of_scalar_url, annotation_of_source_url, data_fields)) return;
	} else {
		if (!window[insert_func]($list, title, scalar_url, source_url, content_urn, version_urn, annotation_type, annotation_of_scalar_url, annotation_of_source_url, data_fields)) return;
	}		
}

function listeditor_createnew($list, insert_func) { 
	var $wrapper = $('#listeditor_editbox .create_new');
	var to_send = {};
	// Form fields
	var title = $wrapper.find('.new_title').val();
	if (title == 'New page title') title = '';
	to_send['dcterms:title'] = title;
	var desc = $wrapper.find('.new_desc').val();
	if (desc == 'New page description') desc = '';
	to_send['dcterms:description'] = desc;
	var content = $wrapper.find('.new_content').val();
	if (content == 'New page content') content = '';
	to_send['sioc:content'] = content;	
	// API fields
	var user_id = $('#edit_form').find('input[name="id"]').val();
	var book_urn = $('#edit_form').find('input[name="urn:scalar:book"]').val();
	to_send['action'] = 'add';	
	to_send['rdf:type'] = 'http://scalar.usc.edu/2012/01/scalar-ns#Composite';
	to_send['native'] = 1;	
	to_send['id'] = user_id;		
	to_send['scalar:urn'] = '';	
	to_send['api_key'] = '';	
	to_send['scalar:child_urn'] = book_urn;	
	to_send['scalar:child_type'] = 'http://scalar.usc.edu/2012/01/scalar-ns#Book';	
	to_send['scalar:child_rel'] = 'page';		
	// Save
	var success = function(version) {
		var parent = $('link#parent').attr('href');
		for (var uri in version) break;
		var uri = uri.substr(0, uri.lastIndexOf('.'));
		var slug = uri.replace(parent, '');
		var node_success = function(node) {
			listeditor_commit_save($list, insert_func, scalarapi.model.nodesByURL[uri]);
			$('#listeditor_editbox').remove();
			alert('A new page has been created for you and linked to this page. Be sure to edit the new page in the future to add metadata and expand its relationships.');
		}
		var node_error = function(obj) {
			alert('There was an error saving: '+obj.statusText);
			return;
		}
		scalarapi.loadPage(slug, true, node_success, node_error);
	}
	var error = function(message) {
		alert('Something went wrong while attempting to save: '+message);
		send_form_hide_loading();
	}
	scalarapi.savePage(to_send, success, error);
	return false;
}

/**
 * Callbacks for the listeditor box
 */

function add_path_item($list, title, scalar_url, source_url, content_urn, version_urn, annotation_type, annotation_of_scalar_url, annotation_of_source_url) {
	var str = '<li>';
	str += '<input type="hidden" name="container_of" value="'+version_urn+'" />';
	str += title;
	str += '&nbsp; <span class="remove">(<a href="javascript:;" onclick="if (confirm(\'Are you sure you wish to remove this relationship?\')) $(this).closest(\'li\').remove();">remove</a>)</span>';
	str += '</li>';
	var $li = $(str);
	$list.append($li);
	$list.removeClass('nodots');
	$list.parent().find('#path_continue_to').show();
	$list.parent().find('#path_color').show();
	$list.parent().find('#path_msg').html('<b>This <span class="content_type">page</span> is also a path</b> which contains:');
	$list.parent().find('#container_of_add_content').show();
	return true;
}

function add_reply_of_item($list, title, scalar_url, source_url, content_urn, version_urn, annotation_type, annotation_of_scalar_url, annotation_of_source_url) {
	var str = '<li>';
	str += '<input type="hidden" name="reply_of" value="'+version_urn+'" />';
	str += '<input type="hidden" name="reply_of_rel_created" value="" />';
	str += title;
	str += '&nbsp; <span class="remove">(<a href="javascript:;" onclick="if (confirm(\'Are you sure you wish to remove this relationship?\')) $(this).closest(\'li\').remove();">remove</a>)</span>';
	str += '</li>';
	var $li = $(str);
	$list.append($li);
	$list.parent().find('#reply_msg').html('<b>This <span class="content_type">page</span> is also a comment</b> which comments on:');
	$list.parent().find('#reply_of_add_content').show();
	return true;
}

function add_annotation_of_item($list, title, scalar_url, source_url, content_urn, version_urn, annotation_type, annotation_of_scalar_url, annotation_of_source_url) {
	var str = '<li>';
	str += '<input type="hidden" name="annotation_of" value="'+version_urn+'" />';
	str += title+'<br />';
	// Important to put in hidden inputs for the 'other' annotation types for each to maintain array indexes for when there is more than one annotation present
	switch (annotation_type) { 
		case "audio":
		case "video":
			str += 'Start seconds: <input type="text" style="width:75px;" name="annotation_of_start_seconds" value="" />';
			str += '&nbsp; End seconds: <input type="text" style="width:75px;" name="annotation_of_end_seconds" value="" />';
			str += '<input type="hidden" name="annotation_of_start_line_num" value="" />';
			str += '<input type="hidden" name="annotation_of_end_line_num" value="" />';
			str += '<input type="hidden" name="annotation_of_points" value="" />';
			break;
		case "html":
		case "text":
		case "document":
			str += 'Start line #: <input type="text" style="width:75px;" name="annotation_of_start_line_num" value="" />';
			str += '&nbsp; End line #: <input type="text" style="width:75px;" name="annotation_of_end_line_num" value="" />';	
			str += '<input type="hidden" name="annotation_of_start_seconds" value="" />';
			str += '<input type="hidden" name="annotation_of_end_seconds" value="" />';
			str += '<input type="hidden" name="annotation_of_points" value="" />';			
			break;
		case "image":
			str += 'Left (x), Top (y), Width, Height: <input type="text" style="width:125px;" name="annotation_of_points" value="0,0,0,0" />';	
			str += '<br /><small>May be pixel or percentage values; for percentage add "%" after each value.</small>';
			str += '<input type="hidden" name="annotation_of_start_line_num" value="" />';
			str += '<input type="hidden" name="annotation_of_end_line_num" value="" />';
			str += '<input type="hidden" name="annotation_of_start_seconds" value="" />';	
			str += '<input type="hidden" name="annotation_of_end_seconds" value="" />';
			break;
		default:
			alert('One or more selected media are of a type not presently supported for annotation.');
			return false;						
	}
	str += '&nbsp; <span class="remove">(<a href="javascript:;" onclick="if (confirm(\'Are you sure you wish to remove this relationship?\')) $(this).closest(\'li\').remove();">remove</a>)</span>';
	str += '</li>';
	var $li = $(str);
	$list.append($li);
	$('#annotation_msg').html('<b>This <span class="content_type">page</span> is also an annotation</b> which annotates:');
	$list.parent().find('#annotation_of_add_content').show();
	return true;
}

function add_has_tag_item($list, title, scalar_url, source_url, content_urn, version_urn, annotation_type, annotation_of_scalar_url, annotation_of_source_url) {
	var str = '<li>';
	str += '<input type="hidden" name="has_tag" value="'+version_urn+'" />';
	str += title;
	str += '&nbsp; <span class="remove">(<a href="javascript:;" onclick="if (confirm(\'Are you sure you wish to remove this relationship?\')) $(this).closest(\'li\').remove();">remove</a>)</span>';
	str += '</li>';
	var $li = $(str);
	$list.append($li);
	$list.parent().find('#has_tag_msg').html('<b>This <span class="content_type">page</span> is tagged by</b> the following tags:');
	$list.parent().find('#has_tag_add_content').show();
	return true;	
}

function add_tag_of_item($list, title, scalar_url, source_url, content_urn, version_urn, annotation_type, annotation_of_scalar_url, annotation_of_source_url) {
	var str = '<li>';
	str += '<input type="hidden" name="tag_of" value="'+version_urn+'" />';
	str += title;
	str += '&nbsp; <span class="remove">(<a href="javascript:;" onclick="if (confirm(\'Are you sure you wish to remove this relationship?\')) $(this).closest(\'li\').remove();">remove</a>)</span>';
	str += '</li>';
	var $li = $(str);
	$list.append($li);
	$list.parent().find('#tag_msg').html('<b>This <span class="content_type">page</span> is also a tag</b> which tags:');
	$list.parent().find('#tag_of_add_content').show();
	return true;
}

function add_continue_to($list, title, scalar_url, source_url, content_urn, version_urn, annotation_type, annotation_of_scalar_url, annotation_of_source_url) {
	var content_id = parseInt(content_urn.split(':').pop());
	if (!content_id) return alert('There was a problem resolving the content ID.  Please try again.');
	var $div = $('#path_continue_to');
	$div.find('input:first').val(content_id);
	$div.find('span:first').html(title);
	return true;
}

/**
 * Functions called from the main page to add/remove content
 */
 
 function clear_continue_to() {
 
	var $div = $('#path_continue_to');
	$div.find('input:first').val(0);
	$div.find('span:first').html('none');
	$div.find('a').blur();
		
}

function add_meta_row(predicate) {

	$meta_table = $('#metadata_rows');
	
	var $tr = $('<tr class="'+predicate+'"></tr>');
	$tr.append('<td class="field">'+predicate+'</td>');
	$tr.append('<td class="value"><input type="text" name="'+predicate+'" class="input_text" value="" /></td>');
	
	if ($meta_table.find("tr[class='"+predicate+"']").length > 0) {
		$meta_table.find("tr[class='"+predicate+"']:last").after($tr);
	} else {
		$meta_table.append($tr);
	}

}

function check_start_end_values(start, end) {
	var $start = $(start);
	var $end = $(end);
	if ($start.val() < 0) $start.val(0);
	if (parseInt($end.val()) < parseInt($start.val())) $end.val($start.val()); // Erik added parseInts here to fix a bug
}