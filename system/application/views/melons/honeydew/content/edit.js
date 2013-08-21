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
 * @version					1.1
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
	
	// If  the type is passed via GET
	checkTypeSelect();  
	if (-1!=document.location.href.indexOf('new.edit') && -1!=document.location.href.indexOf('type=media')) {
		$("#type_text").removeAttr('checked'); 
		$("#type_media").attr("checked", "checked"); 
		checkTypeSelect();
	}
	
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

function load_content(key) {

	if ('undefined'==typeof(key)) key = 0;
	if ('undefined'==typeof(content_array_pages_loaded_key)) content_array_pages_loaded_key = 1; // global
	if ('undefined'==typeof(content_array_complete)) content_array_pages = false; // global
	if ('undefined'==typeof(content_array_complete)) content_array_complete = false; // global	
	if ('undefined'==typeof(content_array_complete_types)) content_array_complete_types = []; // global	
	
	var load_seq = [
		{type:'page',depth:0},
		{type:'media',depth:0},
		{type:'path',depth:1},
		{type:'tag',depth:1},
		{type:'annotation',depth:1},
		{type:'reply',depth:1}
	];
	
	if (key > content_array_pages_loaded_key) {
		content_array_pages = true;
	}
	
	if (key > 0 && 'undefined'!=typeof(load_seq[(key-1)])) {
		content_array_complete_types.push(load_seq[(key-1)].type);
	}	                 
	
	if (key >= load_seq.length) {
		content_array_complete = true;
		$('body').trigger('content_array_completed');
		return;
	} else {
		$('body').trigger('content_array_partial');
	}
	
	scalarapi.loadPagesByType(load_seq[key].type, true, function() {
		load_content(++key);
	}, null, load_seq[key].depth);	

}

/**
 * Validate form data before sending to Scalar's save API
 */

function validate_form($form, ignoreViewCheck) {

 	// Commit WYSIWYG, but only if on the WYSIWYG tab (otherwise the old content in the WYSIWYG editor will overwrite new context in the textarea)	
	if (editor_wysiwyg && !$('.wysiwyg:hidden > iframe').length) {
		editor_wysiwyg.data('wysiwyg').saveContent();
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
		var default_view_value = $("#default_view_select option:selected").val();
		var default_view_name = $("#default_view_select option:selected").html();
		if ('plain'==default_view_value) {
			var textarea_content = $('#edit_content textarea:first').val();
			var confirm_default_view_msg = 'The page content appears to have one or more links to imported Scalar media.  However, the default view of the page is set to empty.  Pages with embedded media work best in other views such as text-emphasis or media-emphasis.  Do you wish to save this page with the current settings?';
			try {
				$('<div>'+textarea_content+'</div>').find('a:not(.inline)').each(function() {
					if ($(this).attr('resource')) throw 'resource link present';
				});
			} catch(e) {
	    	    if (!confirm(confirm_default_view_msg)) return false;
	    	}	
		}
	
		// If no media has been linked, send warning (ie, media-emphasis view)
		var media_views = ['text','media','split','par'];
		if (media_views.indexOf(default_view_value)!=-1) {
			var confirm_default_view_msg = 'You have selected a default view, '+default_view_name+', that works best when media have been connected directly to pieces of text (e.g., using the first blue button in the text editor). However, it appears there are no direct text-media links established.  We recommend changing the default view to empty or establishing direct text-media links.  Do you wish to save this page with the current settings?';
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
 * Create the box for choosing book content with support for specific relationship
 * TODO: this was written in haste and added onto over the years...
 */

function listeditor_add($list, _insert_func, default_type, only_default_type, select_single) {

	if ('undefined'==typeof(content_array_pages)) {
		load_content();
	}

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
	// Title
	var $title = $('<div class="select_header"><h3>Select content</h3></div>');
	$div.append($title);
	// Search box
	var $search = $('<form class="search"><input class="input_text"type="text" value="Search" onfocus="if ($(this).val()==\'Search\') $(this).val(\'\')" /> <a class="generic_button" href="javascript:;" onclick="$(this).parent().submit();return false;">Search</a>&nbsp; &nbsp; <span id="search_count"></span></form>');
	$search.find('#search_count').html('Found 0');
	$div.append($search);
	$search.submit(function() {
		var sq = $search.find("input[type='text']:first").val().toLowerCase();
		if (sq.length==0 || sq=='Search') return;
		listeditor_search(sq);
		return false;
	}); 	
	// Filters
	var $filters = $('<div class="filters">Filter results: <span class="loading_complete page"><input type="radio" name="filter" checked="checked" value="" id="all" /> <label for="all">All</label>&nbsp; &nbsp; </span><span class="loading_complete page"><input type="radio" name="filter" value="page" id="pages" /> <label for="pages">Pages</label>&nbsp; &nbsp; </span><span class="loading_complete media"><input type="radio" name="filter" value="media" id="media" /> <label for="media">Media</label>&nbsp; &nbsp; </span><span class="loading_complete path"><input type="radio" name="filter" value="path" id="paths" /> <label for="paths">Paths</label>&nbsp; &nbsp; </span><span class="loading_complete tag"><input type="radio" name="filter" value="tag" id="tags" /> <label for="tags">Tags</label>&nbsp; &nbsp; </span><span class="loading_complete annotation"><input type="radio" name="filter" value="annotation" id="annotations" /> <label for="annotations">Annotations</label>&nbsp; &nbsp; </span><span class="loading_complete reply"><input type="radio" name="filter" value="comment" id="replies" /> <label for="replies">Comments</label></span><span class="loading_not_complete"><div id="loading_spinner_wrapper" style="width:30px;display:inline-block;">&nbsp;</div> Content loading</span></div>');
	$filters.find('input').click(function() {
		listeditor_fill_table($div, $list, _insert_func, default_type, only_default_type, select_single);
		listeditor_filter_options($div);
	});
	$div.append($filters);
	// Spinner
	if (window['Spinner']) {
		var opts = {
		  lines: 10, // The number of lines to draw
		  length: 5, // The length of each line
		  width: 2, // The line thickness
		  radius: 3, // The radius of the inner circle
		  rotate: 0, // The rotation offset
		  color: '#000', // #rgb or #rrggbb
		  speed: 1, // Rounds per second
		  trail: 40, // Afterglow percentage
		  shadow: false, // Whether to render a shadow
		  hwaccel: false, // Whether to use hardware acceleration
		  className: 'spinner', // The CSS class to assign to the spinner
		  zIndex: 2e9, // The z-index (defaults to 2000000000)
		  top: 'auto', // Top position relative to parent in px
		  right: 'auto' // Left position relative to parent in px
		};
		var target = document.getElementById('loading_spinner_wrapper');
		var spinner = new Spinner(opts).spin(target);
	}	
	$('body').bind('content_array_partial', function() {		
		listeditor_filter_options($div, $list, _insert_func, default_type, only_default_type, select_single);	
	});	
	$('body').bind('content_array_completed', function() {		
		listeditor_filter_options($div, $list, _insert_func, default_type, only_default_type, select_single);	
	});		
	// Content wrapper (for overflow)
	var $content_wrapper = $('<div class="content_wrapper"></div>');
	$div.append($content_wrapper);
	var $add_options = $('<div class="add_selected_wrapper"></div>');
	// Cancel
	var $link = $('<a href="javascript:;" class="generic_button large">Cancel</a>');
	$link.click(function() {
		$(this).parent().parent().remove();
	});	
	$add_options.append($link);
	// Add selected
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

	// Table to contain the content
	var $table = $('<table class="content" cellspacing="0" cellpadding="0"><thead class="descr"><td style="'+((select_single)?'display:none':'')+'">Select</td><td>Title</td><td>Description</td></thead></table>');
	$content_wrapper.append($table);

	listeditor_filter_options($div, $list, _insert_func, default_type, only_default_type, select_single);	

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

function listeditor_filter_options($div, $list, _insert_func, default_type, only_default_type, select_single) {

	var $filters = $div.find('.filters');	
	
	$filters.find('.loading_complete').each(function() {
		var $this = $(this);
		var className = $this.attr('class').replace('loading_complete ','');
		if (content_array_complete_types.indexOf(className)!=-1) {
			$this.fadeIn('fast');
		}
	});
	
	if (content_array_complete) {
		$filters.find('.loading_not_complete').hide();
	}

	if (default_type) {
		$filters.find('input[value="'+default_type+'"]').attr('checked',true);
		if (only_default_type) $filters.find(':not(input[value="'+default_type+'"])').attr('disabled',true);
	}		
	
	listeditor_fill_table($div, $list, _insert_func, default_type, only_default_type, select_single);	

}

function listeditor_fill_table($div, $list, _insert_func, default_type, only_default_type, select_single) {

	var value = $div.find("input:radio[name=filter]:checked").val();
	if (!value.length) {
		var nodes = scalarapi.model.getNodes();
	} else {
		var nodes = scalarapi.model.getNodesWithProperty('scalarType', value);
	}
	var $table = $div.find('table:first');
	$table.find('tr').remove();
	var parent = $('link#parent').attr('href');

	// Propogate table
	for (j = 0; j < nodes.length; j++) {
		var type = nodes[j].getDominantScalarType().id;
		if ('book'==type) continue;
		if (!nodes[j].current) continue;
		var $tr = $('<tr></tr>');
		$tr.data('node', nodes[j]);
		$table.append($tr);
		if (!select_single) $tr.append('<td class="select_col"><input type="checkbox" /></td>');
		$tr.append('<td class="title_col">'+((nodes[j].getDisplayTitle())?nodes[j].getDisplayTitle():nodes[j].url.substr(parent.length))+'</td>');
		$tr.append('<td class="descr desc_col collapse_expand">'+((nodes[j].current.description)?nodes[j].current.description:'(No description)')+'</td>');
		//$tr.append('<td class="preview_col"><a class="generic_button preview_button" href="'+nodes[j].url+'" style="white-space:nowrap;">View '+(('media'!=nodes[j].getDominantScalarType().id)?'page':'media')+'</a></td>');
		$tr.append('<td class="preview_col"><a class="generic_button preview_button" href="'+nodes[j].url+'" style="white-space:nowrap;">Preview</a></td>');
	}		
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
	$table.find('tr').click(function() {
		var $tr = $(this);
		if ($tr.parent().is('thead')) return;
		if (select_single) {
			listeditor_save($list, _insert_func, $tr);
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

function listeditor_save($list, insert_func, $row) {
	if ('undefined'==typeof($row)) { 
		$(".content_wrapper tr input[type='checkbox']:checked").each(function() {
			var $row = $(this).closest('tr');
			listeditor_commit_save($list, insert_func, $row.data('node'));	
		});
	} else {
		listeditor_commit_save($list, insert_func, $row.data('node'));
	}
	$('#listeditor_editbox').remove();
}

function listeditor_commit_save($list, insert_func, node) {
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
		if (!insert_func($list, title, scalar_url, source_url, content_urn, version_urn, annotation_type, annotation_of_scalar_url, annotation_of_source_url)) return;
	} else {
		if (!window[insert_func]($list, title, scalar_url, source_url, content_urn, version_urn, annotation_type, annotation_of_scalar_url, annotation_of_source_url)) return;
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
	var error = function(obj) {
		alert('Something went wrong while attempting to save: '+obj.statusText);
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