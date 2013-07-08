$(document).ready(function() {
	$(window).resize(function() { resizeList(); });
});	

function resizeList() {
	$('.search_results_wrapper:not(".no_resize")').height(Math.max(200, $(window).height() - ($('.search_results_wrapper').offset().top + 210))+'px'); // magic number to get list height right
}

function search_archive(pagenum) {
	
	var the_form = $('.search_archive_form:first').get(0);
	var proxy = the_form.proxy.value;
	var uri = the_form.uri.value;
	var xsl = the_form.xsl.value;
	var match = the_form.match.value;
	var format = the_form.format.value;
	var archive_api_key = the_form.archive_api_key.value;
	var keep_hash_var = [];
	var keep_hash_var_fields = $(the_form).find('input[name="keep_hash_var"]');
    for (var j = 0; j < keep_hash_var_fields.length; j++) keep_hash_var.push(keep_hash_var_fields[j].value);
	var keep_hash = {};
	var remove_hash_vars = the_form.remove_hash_vars.value;
	var sq = jQuery.trim(the_form.sq.value);
	if ('undefined'==typeof(pagenum)) pagenum = 1;
	if (pagenum < 1) pagenum = 1;
	var paginate = (uri.indexOf('$2')!=-1) ? true : false;

	// Validate
	if (sq.length==0) {
		alert('Please enter a search term');
		return false;
	}
		
	// If a hash (#field=value) is given, pull out its value and store for adding back later
	// This is a concession for HyperCities #width=0
	if (keep_hash_var.length && sq.indexOf('#')!=-1) {  
		var hash_str = sq.split('#')[1];
		var hash_arr = hash_str.split('&');
		for (var j = 0; j < hash_arr.length; j++) {
			var field = hash_arr[j].split('=')[0];
			var value = hash_arr[j].split('=')[1];
			if (keep_hash_var.indexOf(field)==-1) continue;
			if (!field.length || !value.length) continue;
			keep_hash[field] = value;
		}
	}	
	
	// Remove hash vars if requested
	if (remove_hash_vars && sq.indexOf('#')!=-1) {
		sq = sq.split('#')[0];
	} 
	
	// If a match (regex) is given, run it on the query to pull out a specific part (ie, an ID)
	if (match.length) {  
		sq = sq.replace(new RegExp(match, ""), "$1");
	}
	
	// Enter the query, page number, and api_key into the URI
	uri = uri.replace('$1',sq);
	uri = uri.replace(get_next_page_uri_component(uri),get_next_page_value(uri, pagenum));
	uri = uri.replace('$api_key', archive_api_key);

	// Show loading bar
	$('.search_archive_form_wrapper:first').find('.search_results_title').show();
	
	// Run request
	var the_request = proxy+'?xsl='+encodeURIComponent(xsl)+'&uri='+encodeURIComponent(uri)+'&format='+format;
	
	$.ajax({
	  url: the_request,
	  type: 'GET',
	  dataType: ($.browser.msie) ? "text" : "xml",
	  success: function(xml) {
	  	var result;
		// Fork to either jQuery-based XML processing or Javascript-based.  Kludgy but works in FF, Safari, IE, Opera.
		if ($.browser.msie || $(xml).find('rdf\\:Description').length) {
			result = import_parse_xml_with_jquery(xml, sq, pagenum, paginate, uri, keep_hash);      // Firefox, IE
		} else {
			result = import_parse_xml_with_javascript(xml, sq, pagenum, paginate, uri, keep_hash);  // Safari
		}
		resizeList();
		return result;
	  }
	});	
	
	return false;
	
}

function import_parse_xml_with_jquery(xml, sq, pagenum, paginate, uri, keep_hash) {
	
		$xml = $(xml);
		$results = $xml.find('rdf\\:Description');
		var num_results = 0;
		var num_rows = 0;	
		var groups_show_only = {};	
		
		// Set up header
		$('.search_archive_form_wrapper:first').find('.search_archive_results:last tbody').empty();
		$('.search_results_header:last').empty();
		var $found_row = $('Found <b class="import_num_results">'+num_results+'</b> results (<b class="import_num_valid">'+num_rows+'</b> supported) for "'+sq+'"&nbsp; <span class="pagenum"></span>').appendTo('.search_results_header:last');
		$found_row.find('.pagenum').html('<a href="#" class="prev">&laquo; Prev</a>&nbsp; <b>Page '+pagenum+'</b> &nbsp;<a href="#" class="next">Next &raquo;</a>');
		if (pagenum<=1) $found_row.find('.prev').hide();
		if (!paginate) $found_row.find('.next, .prev').hide();
		$found_row.find('.next').click(function() {search_archive(++pagenum);});	
		$found_row.find('.prev').click(function() {search_archive(--pagenum);});

		// Build results table
		$results.each(function(indexInArray) {
		
			var the_node = this;
			var $node = $(this);
			num_rows++;
			var rdf_fields = {};
			
			var node_uri = $node.attr('rdf:about');
			var source = $node.find('dcterms\\:source').text();
			var title = $node.find('dcterms\\:title').text();
			var desc = strip_tags($node.find('dcterms\\:description').text());
			var creator = $node.find('dcterms\\:creator').text();
			if (!creator.length) creator = '(No creator provided)';
			var thumb = $node.find('art\\:thumbnail').attr('rdf:resource');
			if ('undefined'==typeof(thumb)||!thumb.length) thumb = $('#approot').attr('href')+'views/modules/chrome/honeydew/images/generic_media_thumb.jpg';
			var filename = $node.find('art\\:filename');
			var mediatype = $node.find('dcterms\\:type');
			mediatype = ('undefined'==typeof(mediatype)) ? 'media' : mediatype.text().toLowerCase();
			var group = ($node.find('scalar\\:group').length) ? $node.find('scalar\\:group').text() : null;
			if (group!=null&&$node.find('scalar\\:group_hide_others').length&&$node.find('scalar\\:group_hide_others').text()=='1') {
				if ('undefined'==typeof(groups_show_only[group])) groups_show_only[group] = [];
				groups_show_only[group].push(node_uri);
			}

			var $tr = $('<tr></tr>');
			$tr.append('<td valign="top" class="thumbnail"><img class="import_thumb" src="'+thumb+'" /></td>');
			var $content = $('<td valign="top" ><div class="title"><input type="checkbox" id="result_row_'+indexInArray+'" /><label for="result_row_'+indexInArray+'"> '+title+'</label>&nbsp;</div><div class="desc">'+create_excerpt(desc, 40)+'</div></td>').appendTo($tr);
			var $filename = $('<div class="filename"></div>').appendTo($content);
			var $error = $('<div class="import_error"></div>').appendTo($content);
			var $preview = $('<td class="preview"></td>').appendTo($tr);
			
			// Special exception for Internet Archive until we support multiple filenames
			if ('Internet Archive' == source) {
				var ia_pass = false;
				for (var k = 0; k < filename.length; k++) {
					var resource = $(filename[k]).attr('rdf:resource');
					if (!ia_pass && resource.indexOf('MPEG4')!=-1) ia_pass=resource;
					if (!ia_pass && resource.indexOf('512Kb+MPEG4')!=-1) ia_pass=resource;	
					if (!ia_pass && resource.indexOf('h.264')!=-1) ia_pass=resource;
					if (!ia_pass && resource.indexOf('WAVE')!=-1) ia_pass=resource;
					if (!ia_pass && resource.indexOf('QuickTime')!=-1) ia_pass=resource;
					if (!ia_pass && resource.indexOf('160Kbps+MP3')!=-1) ia_pass=resource;
					if (!ia_pass && resource.indexOf('128Kbps+MP3')!=-1) ia_pass=resource;
					if (!ia_pass && resource.indexOf('VBR+MP3')!=-1) ia_pass=resource;
					if (!ia_pass && resource.indexOf('JPEG+Thumb')!=-1) ia_pass=resource;
					if (!ia_pass && resource.indexOf('JPEG')!=-1) ia_pass=resource;
				}
				$filename.append(''+mediatype+'&nbsp; '+basename(ia_pass));
				if (ia_pass) {
					$preview.append('<a href="javascript:;" onclick="preview_media_file(\''+ia_pass+'\')" class="generic_button">Preview</a>');
					num_results++;
				} else {
					import_error($tr, 'This media type is not presently supported by Scalar');
				}
                // Remove all but the pass'd url
                for (var k = (filename.length-1); k >= 0; k--) {
                	var resource = $(filename[k]).attr('rdf:resource');	
                	if (resource != ia_pass) the_node.removeChild(filename[k]);
                }
				
			// All others
			} else {
				if (filename.length) {
					for (var k = 0; k < filename.length; k++) {
						var url = $(filename[k]).attr('rdf:resource');
						if (!is_empty(keep_hash)) url += '#'+obj_to_vars(keep_hash);						
						$filename.append(''+mediatype+'&nbsp; '+basename(url));
						$preview.append('<a href="javascript:;" onclick="preview_media_file(\''+url+'\')" class="generic_button">Preview</a>');
						num_results++;
					}
				} else {
					import_error($tr, "This media does not appear to have a file URL");
				}
			
			}			

			$tr.data('node_uri', node_uri);
			$tr.data('fields', import_remap_fields(the_node, keep_hash));
			$('.search_archive_form_wrapper:first .search_archive_results:last tbody').append($tr);
			$('.search_archive_form_wrapper:first .import_num_results:last').html(num_rows);
			$('.search_archive_form_wrapper:first .import_num_valid:last').html(num_results);
			
		});
		
		// Redraw header
		$('.search_archive_form_wrapper:first .search_results_title:last').hide();	
		$('.search_archive_form_wrapper:first').find('.found_row_2:last').remove();
		var $found_row_2 = $('<div class="found_row_2" style="float:left;">Found <b id="import_num_results">'+num_results+'</b> supported results &nbsp; <span class="checkall"><input type="checkbox" name="checkall" id="checkall" /><label for="checkall"> Check all</label></span> &nbsp;	<span class="checkall"><input type="checkbox" name="checkallvalid" id="checkallvalid" /><label for="checkallvalid"> All with valid URLs</label></span> &nbsp; <span class="pagenum"></span></div>').prependTo('.search_results_footer:last');
		$found_row_2.find("input[name='checkall']").click(function() {
			$found_row_2.find("input[name='checkallvalid']").attr('checked', false);
			$('.search_archive_results:last').find("input[type='checkbox']").attr('checked', false);
			var is_checked = $(this).is(':checked');
			$('.search_archive_results:last').find("input[type='checkbox']").attr('checked', is_checked);
		});
		$found_row_2.find("input[name='checkallvalid']").click(function() {
			$found_row_2.find("input[name='checkall']").attr('checked', false);
			var is_checked = $(this).is(':checked');
			$('.search_archive_results:last').find("input[type='checkbox']").attr('checked', false);
			if (is_checked) {
				$('.search_archive_results:last').find("input[type='checkbox']").each(function() {
					if ($(this).closest('tr').hasClass('file_error')) return;
					$(this).attr('checked', true);
				});
			} 
		});		
		$found_row_2.find('.pagenum').html('<a href="#" class="prev">&laquo; Prev</a>&nbsp; <b>Page '+pagenum+'</b> &nbsp;<a href="#" class="next">Next &raquo;</a>');
		if (pagenum<=1) $found_row_2.find('.prev').hide();
		if (!paginate) $found_row_2.find('.next, .prev').hide();
		$found_row_2.find('.next').click(function() {search_archive(++pagenum);});	
		$found_row_2.find('.prev').click(function() {search_archive(--pagenum);});

		// Manage show/hide of group elements
		if (!is_empty(groups_show_only)) {
			for (var group in groups_show_only) {
				$('.search_archive_results:last tr').each(function() {
					var $row = $(this);
					if ('undefined'==typeof($row.data('node_uri'))) return;
					if ('undefined'==typeof($row.data('fields'))) return;
					if ('undefined'==typeof($row.data('fields')['scalar:group'])) return;
					if ($row.data('fields')['scalar:group'] != group) return;
					// Row has asked to be shown -- add "show others" link
					if (-1 != groups_show_only[group].indexOf($row.data('node_uri'))) {
						$('<div class="more_in_group to_show"><img src="'+$('link#approot').attr('href')+'views/modules/chrome/honeydew/images/arrow_icon.png" align="left" /> There are other results related to this item that are presently hidden. <a href="javascript:;">Show related items</a>.</div>').appendTo($row.find('td:nth-child(2)'));
						$('<div class="more_in_group to_hide"><img src="'+$('link#approot').attr('href')+'views/modules/chrome/honeydew/images/arrow_icon.png" align="left" /> Other results related to the imported item are presently being displayed. <a href="javascript:;">Hide related items</a>.</div>').appendTo($row.find('td:nth-child(2)'));
					// Otherwise, hide the row
					} else {
						$row.addClass('other_in_group');
					}
					// When "show others" link is clicked, toggle the hidden rows
					$row.find('.more_in_group a').click(function() {
						$row.find('.more_in_group').toggle();
						$('.search_archive_results:last tr').each(function() {
							if ('undefined'==typeof($(this).data('fields'))) return;
							if ('undefined'==typeof($(this).data('fields')['scalar:group'])) return;
							if ($row.data('fields')['scalar:group'] == $(this).data('fields')['scalar:group'] && $(this).hasClass('other_in_group')) {
								$(this).fadeToggle('slow');
							}
						});
					});
				});
			}
		}

		$('.search_results_header:last').show();	
		$('.search_results_wrapper:last').show();	
		$('.search_results_footer:last').show();			
	
}
function import_parse_xml_with_javascript(xml, sq, pagenum, paginate, uri, keep_hash) {
	
		var results = xml.getElementsByTagNameNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'Description');
		var num_results = 0;
		var num_rows = 0;
		var groups_show_only = {};
		
		// Set up header
		$('.search_archive_form_wrapper:first .search_archive_results:last tbody').empty();
		$('.search_results_header:last').empty();
		var $found_row = $('Found <b class="import_num_results">'+num_results+'</b> results (<b class="import_num_valid">'+num_rows+'</b> supported) for "'+sq+'"&nbsp; <span class="pagenum"></span>').appendTo('.search_results_header:last');
		
		$found_row.find('.pagenum').html('<a href="#" class="prev">&laquo; Prev</a>&nbsp; <b>Page '+pagenum+'</b> &nbsp;<a href="#" class="next">Next &raquo;</a>');
		if (pagenum<=1) $found_row.find('.prev').hide();
		if (!paginate) $found_row.find('.next, .prev').hide();
		$found_row.find('.next').click(function() {search_archive(++pagenum);});	
		$found_row.find('.prev').click(function() {search_archive(--pagenum);});

		// Build results table
		for (var j = 0; j < results.length; j++) {
		
			var the_node = results[j];
			num_rows++;
			
			var node_uri = the_node.getAttributeNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'about');
			var source = the_node.getElementsByTagNameNS('http://purl.org/dc/terms/', 'source')[0];
			source = (source && source.childNodes && source.childNodes.length) ? source.childNodes[0].nodeValue : '(Missing source)';
			var title = the_node.getElementsByTagNameNS('http://purl.org/dc/terms/', 'title')[0];
			title = (title && title.childNodes && title.childNodes.length) ? title.childNodes[0].nodeValue : '(Missing title)';
			var desc = the_node.getElementsByTagNameNS('http://purl.org/dc/terms/', 'description')[0];
			desc = (desc && desc.childNodes && desc.childNodes.length) ? strip_tags(desc.childNodes[0].nodeValue) : '(No description provided)';
			var creator = the_node.getElementsByTagNameNS('http://purl.org/dc/terms/', 'creator')[0];
			creator = (creator && creator.childNodes && creator.childNodes.length) ? 'Contributed by '+creator.childNodes[0].nodeValue : '(No creator provided)';
			var thumb = the_node.getElementsByTagNameNS('http://simile.mit.edu/2003/10/ontologies/artstor#', 'thumbnail')[0];
			if (thumb && thumb.getAttributeNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#','resource').length) {
				thumb = thumb.getAttributeNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#','resource');
			} else {
				thumb = $('#approot').attr('href')+'views/modules/chrome/honeydew/images/generic_media_thumb.jpg';
			}
			var filename = the_node.getElementsByTagNameNS('http://simile.mit.edu/2003/10/ontologies/artstor#', 'filename');
			var mediatype = the_node.getElementsByTagNameNS('http://purl.org/dc/terms/', 'type')[0];
			mediatype = (mediatype && mediatype.childNodes && mediatype.childNodes.length) ? mediatype.childNodes[0].nodeValue : 'media';
			var group = the_node.getElementsByTagNameNS('http://vectorsdev.usc.edu/scalar/elements/1.0/', 'group');
			group = (group.length) ? group[0].childNodes[0].nodeValue : null;
			var group_hide_others = the_node.getElementsByTagNameNS('http://vectorsdev.usc.edu/scalar/elements/1.0/', 'group_hide_others');
			group_hide_others = (group_hide_others.length) ? group_hide_others[0].childNodes[0].nodeValue : null;
			if (group!=null&&group_hide_others!=null&&group_hide_others=='1') {
				if ('undefined'==typeof(groups_show_only[group])) groups_show_only[group] = [];
				groups_show_only[group].push(node_uri);
			}
			
			
			var $tr = $('<tr></tr>');
			$tr.append('<td valign="top" class="thumbnail"><img src="'+thumb+'" /></td>');
			var $content = $('<td valign="top" ><div class="title"><input type="checkbox" id="result_row_'+j+'" /><label for="result_row_'+j+'"> '+title+'</label>&nbsp;</div><div class="desc">'+create_excerpt(desc, 40)+'</div></td>').appendTo($tr);
			var $filename = $('<div class="filename"></div>').appendTo($content);
			var $error = $('<div class="import_error"></div>').appendTo($content);
			var $preview = $('<td class="preview"></td>').appendTo($tr);
			
			// TODO: This is a special exception for Internet Archive until we support multiple filenames
			if ('Internet Archive' == source) {
				var ia_pass = false;
				for (var k = 0; k < filename.length; k++) {
					var resource = filename[k].getAttributeNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#','resource');
					if (!ia_pass && resource.indexOf('MPEG4')!=-1) ia_pass=resource;
					if (!ia_pass && resource.indexOf('512Kb+MPEG4')!=-1) ia_pass=resource;	
					if (!ia_pass && resource.indexOf('h.264')!=-1) ia_pass=resource;
					if (!ia_pass && resource.indexOf('WAVE')!=-1) ia_pass=resource;
					if (!ia_pass && resource.indexOf('QuickTime')!=-1) ia_pass=resource;
					if (!ia_pass && resource.indexOf('160Kbps+MP3')!=-1) ia_pass=resource;
					if (!ia_pass && resource.indexOf('128Kbps+MP3')!=-1) ia_pass=resource;
					if (!ia_pass && resource.indexOf('VBR+MP3')!=-1) ia_pass=resource;
					if (!ia_pass && resource.indexOf('JPEG+Thumb')!=-1) ia_pass=resource;
					if (!ia_pass && resource.indexOf('JPEG')!=-1) ia_pass=resource;
				}
				$filename.append(''+mediatype+'&nbsp; '+basename(ia_pass));
				if (ia_pass) {
					$preview.append('<a href="javascript:;" onclick="preview_media_file(\''+ia_pass+'\')" class="generic_button">Preview</a>');
					num_results++;
				} else {
					import_error($tr, 'This media type is not presently supported by Scalar');
				}

                // Remove all but the pass'd url
                for (var k = (filename.length-1); k >= 0; k--) {
                	var resource = filename[k].getAttributeNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#','resource');
                	if (resource != ia_pass) the_node.removeChild(filename[k]);
                }				

			// All others
			} else {
				if (filename.length) {
					for (var k = 0; k < filename.length; k++) {
						var url = filename[k].getAttributeNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#','resource');
						if (!is_empty(keep_hash)) url += '#'+obj_to_vars(keep_hash);				
						$filename.append(''+mediatype+'&nbsp; '+basename(url));
						$preview.append('<a href="javascript:;" onclick="preview_media_file(\''+url+'\')" class="generic_button">Preview</a>');
						num_results++;
					}
				} else {
					import_error($tr, "This media does not appear to have a file URL");
				}
			
			}				

			$tr.data('node_uri', node_uri);
			$tr.data('fields', import_remap_fields(the_node, keep_hash));
			$('.search_archive_form_wrapper:first .search_archive_results:last tbody').append($tr);
			$('.search_archive_form_wrapper:first .import_num_results:last').html(num_rows);
			$('.search_archive_form_wrapper:first .import_num_valid:last').html(num_results);
			
		}
		
		// Redraw header
		$('.search_archive_form_wrapper:last .search_results_title:last').hide();		
		$('.search_archive_form_wrapper:last').find('.found_row_2:last').remove()
		var $found_row_2 = $('<div class="found_row_2" style="float:left;">Found <b id="import_num_results">'+num_results+'</b> supported results &nbsp; <span class="checkall"><input type="checkbox" name="checkall" id="checkall" /><label for="checkall"> Check all</label></span> &nbsp; <input type="checkbox" name="checkallvalid" id="checkallvalid" /><label for="checkallvalid"> All with valid URLs</label></span> &nbsp; <span class="pagenum"></span></div>').prependTo('.search_results_footer:last');
		$found_row_2.find("input[name='checkall']").click(function() {
			$found_row_2.find("input[name='checkallvalid']").attr('checked', false);
			$('.search_archive_results:last').find("input[type='checkbox']").attr('checked', false);
			var is_checked = $(this).is(':checked');
			$('.search_archive_results:last').find("input[type='checkbox']").attr('checked', is_checked);
		});
		$found_row_2.find("input[name='checkallvalid']").click(function() {
			$found_row_2.find("input[name='checkall']").attr('checked', false);
			var is_checked = $(this).is(':checked');
			$('.search_archive_results:last').find("input[type='checkbox']").attr('checked', false);
			if (is_checked) {
				$('.search_archive_results:last').find("input[type='checkbox']").each(function() {
					if ($(this).closest('tr').hasClass('file_error')) return;
					$(this).attr('checked', true);
				});
			} 
		});			
		$found_row_2.find('.pagenum').html('<a href="#" class="prev">&laquo; Prev</a>&nbsp; <b>Page '+pagenum+'</b> &nbsp;<a href="#" class="next">Next &raquo;</a>')
		if (pagenum<=1) $found_row_2.find('.prev').hide();
		if (!paginate) $found_row_2.find('.next, .prev').hide();
		$found_row_2.find('.next').click(function() {search_archive(++pagenum);});	
		$found_row_2.find('.prev').click(function() {search_archive(--pagenum);});

		// Manage show/hide of group elements
		if (!is_empty(groups_show_only)) {
			for (var group in groups_show_only) {
				$('.search_archive_results:last tr').each(function() {
					var $row = $(this);
					if ('undefined'==typeof($row.data('node_uri'))) return;
					if ('undefined'==typeof($row.data('fields'))) return;
					if ('undefined'==typeof($row.data('fields')['scalar:group'])) return;
					if ($row.data('fields')['scalar:group'] != group) return;
					// Row has asked to be shown -- add "show others" link
					if (-1 != groups_show_only[group].indexOf($row.data('node_uri'))) {
						$('<div class="more_in_group to_show">&rarr; There are other results related to this item that are presently hidden. <a href="javascript:;">Show related items</a>.</div>').appendTo($row.find('td:nth-child(2)'));
						$('<div class="more_in_group to_hide">&rarr; Other results related to the imported item are presently being displayed. <a href="javascript:;">Hide related items</a>.</div>').appendTo($row.find('td:nth-child(2)'));
					// Otherwise, hide the row
					} else {
						$row.addClass('other_in_group');
					}
					// When "show others" link is clicked, toggle the hidden rows
					$row.find('.more_in_group a').click(function() {
						$row.find('.more_in_group').toggle();
						$('.search_archive_results tr').each(function() {
							if ('undefined'==typeof($(this).data('fields'))) return;
							if ('undefined'==typeof($(this).data('fields')['scalar:group'])) return;
							if ($row.data('fields')['scalar:group'] == $(this).data('fields')['scalar:group'] && $(this).hasClass('other_in_group')) {
								$(this).fadeToggle('slow');
							}
						});
					});
				});
			}
		}	
		
		$('.search_results_header:last').show();	
		$('.search_results_wrapper:last').show();	
		$('.search_results_footer:last').show();	
	
}
function import_remap_fields(the_node, keep_hash) {
	
	var fields = {};
	
	// Add save API fields
	// This will also add the proxy fields (xsl, uri, etc), but these will be ignored by the API since they're not pnodes
	$('.search_archive_form:first').find('input[type="hidden"]').each(function() {
		var field = $(this).attr('name');
		var value = $(this).attr('value');
		fields[field] = value;
	});
	//console.log(the_node);
	// Remap node fields
	for (var j = 0; j < the_node.childNodes.length; j++) {
		var the_field = the_node.childNodes[j].tagName;
		if ('undefined'==typeof(the_field)) continue;
		the_field = special_camelize(the_field.toLowerCase()); // IE has all chars upper case	
		if ('undefined'==typeof(the_field)) continue; // Trap again empty/blank text nodes
		// Check if a node points to a URL 
		var rdf_resource = $(the_node.childNodes[j]).attr('rdf:resource'); // IE, but not trapping specifically for IE just in case other browsers need this
		if ('undefined'==typeof(rdf_resource)) rdf_resource = the_node.childNodes[j].getAttributeNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'resource');
		// Route to the URL or otherwise use the inner textContent
		var the_content = (rdf_resource&&rdf_resource.length) ? rdf_resource : the_node.childNodes[j].textContent;		
		if ('undefined'!=typeof(fields[the_field])) {
			if (!is_array(fields[the_field])) {
				fields[the_field] = [fields[the_field]];
			}
			fields[the_field].push(the_content);
		} else {
			fields[the_field] = the_content;
		}
	}
	
	// Convert a couple pnodes to Scalar metadata URNs
	if ('undefined'!=fields['art:thumbnail']) {
		// Thumbnail -- only choose one from what could be many
		var thumbnail = '';
		if (is_array(fields['art:thumbnail'])) {
			thumbnail = fields['art:thumbnail'][0];
		} else {
			thumbnail = fields['art:thumbnail'];
		}
		fields['art:thumbnail'] = null;
		fields['scalar:metadata:thumbnail'] = thumbnail;
	}
	if ('undefined'!=fields['art:filename']) {
		// URL
		var url = '';
		if (is_array(fields['art:filename'])) {
			url = fields['art:filename'][0];
		} else {
			url = fields['art:filename'];
		}
		if (!is_empty(keep_hash)) url += '#'+obj_to_vars(keep_hash);
		fields['art:filename'] = null;
		fields['scalar:metadata:url'] = url;	
	}
	//console.log(fields);
	//console.log(JSON.stringify(fields));
	return fields;		
	
}
function import_error($tr, str) {
	if ('undefined'==typeof(str) || !str.length) str = 'Undefined error';
	$tr.find('.import_error').html(str);
	$tr.addClass('file_error');
}
function search_archive_import() {

	if ('undefined'!=typeof(archive_is_importing) && archive_is_importing) return alert('Import action is already happening');
	archive_is_importing = true; // global
	
	var nodes = [];
	$('.search_archive_form_wrapper:first .search_archive_results tr').each(function() {
		var $node = $(this);
		if ($node.find('input[type="checkbox"]').is(':checked')) nodes.push($node.data('fields'));
	});
	
	if (!nodes.length) return alert('Please select a checkbox for one or more media to be imported');
	console.log(nodes);
	do_save_archive_import(nodes);

	return false;

}
function do_save_archive_import(nodes, saved_nodes) {  // I think technically multiple ajax calls can be made at same time, but just in case, run as a queue

	if ('undefined'==typeof(saved_nodes)) saved_nodes = [];

	// Draw green box with resulting page links
	if (saved_nodes.length == nodes.length) {
		$('.dialog').remove();			
		var $box = $('<div class="dialog"></div>');
		$box.append(((saved_nodes.length>1)?'Files have been':'A file has been')+' imported.  You may follow the link'+((saved_nodes.length>1)?'s':'')+' below to access the imported media. Alternatively, you can use the media section of the navigation (on the left) or the \'Dashboard\' area (above) to browse all media by title.');
		$('body').append($box);
		// Add links
		for (var j in saved_nodes) {
			for (var uri in saved_nodes[j]) break;
			var url = uri;
			if (url.indexOf('.')!=-1) url = url.substr(0, url.lastIndexOf('.'));
			var title = saved_nodes[j][uri]['http://purl.org/dc/terms/title'];
			title = ('undefined'!=typeof(title)&&title.length) ? title[0].value : '(No title)';
			var desc = saved_nodes[j][uri]['http://purl.org/dc/terms/description'];
			desc = ('undefined'!=typeof(desc)&&desc.length) ? desc[0].value : '';
			$li = $('<li></li>');
			$li.append('<a href="'+url+'">'+title+'</a>');
			if (desc.length) $li.append('<br /><small>'+create_excerpt(desc, 40)+'</small>');
			$box.append($li);
		}
		// Make dialog
		$( ".dialog" ).dialog({ minWidth: 700, title: 'Import successful', resizable: false, draggable: true });	
		archive_is_importing = false;
		return;    		
	}

	// Log saved node and recurse
	var success = function(version) {
		saved_nodes.push(version);
 		do_save_archive_import(nodes, saved_nodes);
	}

	var error = function(err) {
		alert('Something went wrong while attempting to save: '+(('string'==typeof(err))?err:err.statusText));
	}

	var node_index = saved_nodes.length;
	console.log(nodes[node_index]);
	scalarapi.savePage(nodes[node_index], success, error);

}
function get_next_page_uri_component(uri) {
	if (uri.indexOf('$2')==-1) return '$2';
	var slug = uri.substr(uri.indexOf('$2'));
	if (slug.substr(0, 3)!='$2(') return '$2';
	slug = slug.substr(0, (slug.indexOf(')')+1));
	return slug;
}
function get_next_page_value(uri, pagenum) {
	if (uri.indexOf('$2')==-1) return 0;
	var slug = uri.substr(uri.indexOf('$2'));
	if (slug.substr(0, 3)!='$2(') return pagenum
	var slug = slug.substr((slug.indexOf('(')+1));
	slug = slug.substr(0, slug.indexOf(')'));
	slug = parseInt(slug);
	return (slug * (pagenum-1));
}
function preview_media_file(url) {
	var media_previewer = window.open(url,'preview_media',"menubar=0,resizable=1,width=900,height=650");
	media_previewer.focus();
}
function is_empty(map) {
   for(var key in map) {
      if (map.hasOwnProperty(key)) return false;
   }
   return true;
}
function obj_to_vars(obj) {
	var arr = [];
	for (var j in obj) {
		arr.push(j+'='+obj[j]);
	}
	return arr.join('&');
}
function special_camelize(str) {
	var camelize = ['art:sourceLocation'];
	for (var j = 0; j < camelize.length; j++) {
		if (str.toLowerCase() == camelize[j].toLowerCase()) return camelize[j];
	}
	return str;
}