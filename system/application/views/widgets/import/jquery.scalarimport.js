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
 * http://www.osedu.org/licenses/ECL-2.0 
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.       
 */  

/**
 * @projectDescription  Draw and popup alert on the page
 * @author              Craig Dietrich
 * @version             1.2
 * @required			Instantiated scalarapi obj (default: window['scalarapi'])
 * @required			URL to a JSON feed of ontologies and their predicates
 */

function scalarimport_preview(url) {
	var media_previewer = window.open(url,'preview_media',"menubar=0,resizable=1,width=900,height=650");
} 

if ('undefined'==typeof(escape_html)) {
	function escape_html(unsafe) {
	    return unsafe
	         .replace(/&/g, "&amp;")
	         .replace(/</g, "&lt;")
	         .replace(/>/g, "&gt;")
	         .replace(/"/g, "&quot;")
	         .replace(/'/g, "&#039;");
	 }
}

(function($) {

    var defaults = {
    		scalarapi: null,
    		ontologies_url: null,
    		ontologies: null,
    		approot_segment_match: 'system/',
    		error_el: '#error',
    		results_el: '#results',
    		loading_el: '#loading',
    		import_btn_wrapper_class: 'import_btn_wrapper',
    		import_btn_class: 'import_btn',
    		import_loading_class: 'import_loading',
    		multi_custom_meta_complete: 'multi_custom_meta_complete',
    		pagenum: 1,
    		proxy_required_fields: ['proxy','uri','xsl','native','id','action','api_key','child_urn','child_type','child_rel'],
    		proxy_optional_fields: ['match','format','archive_api_key','keep_hash_var','remove_hash_vars'],
    		url_not_supported_msg: 'This media format is not supported',
    		url_not_supported_class: 'media_not_supported',
    		results_desc_num_words: 40,
    		rdftype: 'http://scalar.usc.edu/2012/01/scalar-ns#Media',
    		sioccontent: ''
      };
    
	var scalarimport_methods = {
			
		init : function(options) {
		
			options = $.extend(defaults, options);	
			$(options.results_el).hide();
			$(window).resize(function() { $.fn.scalarimport('resize_results', options); });
		
			// Required scalarapi obj
			if (null===options.scalarapi) {
				if ('undefined'==typeof(window['scalarapi'])) {
					$.fn.scalarimport('error', 'init function could not find required Scalar API object (window[\'scalarapi\']), please try again', options);
					return;
				}
				options.scalarapi = window['scalarapi'];
			}
			// Required ontology url
			if (null===options.ontologies_url) {
				var approot = $('link#approot').attr('href');
				var system_url = approot.substr(0, approot.lastIndexOf(options.approot_segment_match))+options.approot_segment_match;
				options.ontologies_url = system_url+'ontologies';
			}
			
			return this.each(function() {
				
				try {
					var $form = $(this);
					$(options.error_el).empty();
					$(options.results_el).empty();
					var user_data = $.fn.scalarimport('load_user_data', $form);
					var form_data = $.fn.scalarimport('load_form_data', $form, options);
					$.fn.scalarimport('proxy', function(rdfxml) {
						var post = $.fn.scalarimport('rdfxml_to_post', rdfxml, options, true);
						$.fn.scalarimport('results', $form, post, form_data, options);
					}, $.extend({}, user_data, form_data), options);
					$('.'+options.import_btn_class).live('click', function() {
						$.fn.scalarimport('reset', options);
						$.fn.scalarimport('multi_custom_meta', $(options.results_el), form_data, options);
					});
					$(options.results_el).bind(options.multi_custom_meta_complete, function(event, form_data, options) {
						$(options.results_el).scalarimport('import', function(versions) {
							$.fn.scalarimport('imported', versions, options);
						}, form_data, options);						
					});
				} catch(err) {
					$.fn.scalarimport('error', err, options);
				}
				
			});	
			 
		},
		
		reset : function(options) {
			
			$(options.error_el).empty();
			$('.dialog').remove();	
			
			$(options.results_el).find('tr').each(function() {
				$(this).data('custom_meta_complete', false);
			});
			
		},
		
		resize_results : function(options) {
			
			$(options.results_el+':not(".no_resize")').find('.result_content').height(Math.max(200, $(window).height() - ($(options.results_el).offset().top + 75))+'px'); // magic number to get list height right
			
		},
		
		error : function(err, options) {
			
			$('<div><p>'+err+'</p></div>').addClass('error').appendTo(options.error_el);
			
		},
		
		/**
		 * Methods that load and parse data
		 */
		
		load_user_data : function($form) {

			var $sq = $form.find('input[name="sq"]');
			if ('undefined'==typeof($sq) || !$sq) throw 'Could not find search string';
			if (!$sq.val().length) throw 'Please enter a search term';
			
			var user_data = {};
			user_data.sq = $sq.val();
			
			return user_data;
			
		},
		
		load_form_data : function($form, options) {

			var form_data = {};
			var missing_required_fields = [];
			
			// Required
			for (var j in options.proxy_required_fields) {
				var $form_field = $form.find('input[name="'+options.proxy_required_fields[j]+'"]');
				if ('undefined'==typeof($form_field) || !$form_field || !$form_field.length) missing_required_fields.push(options.proxy_required_fields[j]);
				if ('undefined'==typeof(form_data[options.proxy_required_fields[j]])) form_data[options.proxy_required_fields[j]] = [];
				$form_field.each(function() {
					var $form_field_value = $(this);
					if (!$form_field_value.val().length) return;
					form_data[options.proxy_required_fields[j]].push($form_field_value.val());
				});
			}
			if (missing_required_fields.length) throw "Missing required proxy fields: "+missing_required_fields.join(', ');

			// Optional
			for (var j in options.proxy_optional_fields) {
				var $form_field = $form.find('input[name="'+options.proxy_optional_fields[j]+'"]');
				if ('undefined'==typeof($form_field) || !$form_field || !$form_field.length) continue;
				if ('undefined'==typeof(form_data[options.proxy_optional_fields[j]])) form_data[options.proxy_optional_fields[j]] = [];
				$form_field.each(function() {
					var $form_field_value = $(this);
					if (!$form_field_value.val().length) return;
					form_data[options.proxy_optional_fields[j]].push($form_field_value.val());
				});
			}		
			
			// Pagination
			if ('undefined'!=typeof(form_data.uri)) {
				form_data['pagenum'] = options.pagenum;
				form_data['paginate'] = (form_data.uri[0].indexOf('$2')!=-1) ? true : false; 
				if (!form_data['paginate'] || form_data['pagenum'] < 1) form_data['pagenum'] = 1;
			}
				
			// Hashes
			
			return form_data;
			
		},	
		
		rdfxml_to_post : function(rdfxml, options) {
				
			var post = {};
			if ('undefined'==typeof(native_field_names)) native_field_names = false;
			if ('undefined'==typeof(rdfxml.childNodes[0])) return post;

			var results = rdfxml.getElementsByTagNameNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'Description');
	
			for (var j = 0; j < results.length; j++) {
				
				var s = results[j].getAttributeNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'about');
				post[s] = {};
				for (var k = 0; k < results[j].childNodes.length; k++) {
					var p = results[j].childNodes[k].nodeName;
					if (p == 'art:filename') p = 'scalar:url';  // TODO
					var value = results[j].childNodes[k].textContent;
					if (!value.length) value = results[j].childNodes[k].getAttributeNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#','resource');
					if ('undefined'==typeof(post[s][p])) {
						post[s][p] = value;
					} else {
						if ('string'==typeof(post[s][p])) post[s][p] = [post[s][p]];
						post[s][p].push(value);
					}
				}
				if ('undefined'!=typeof(post[s]['scalar:url'])) {
					post[s]['scalar:url'] = $.fn.scalarimport('filter_urls', post[s]['scalar:url'], options);
				}
				if ('undefined'==typeof(post[s]['rdf:type'])) {
					post[s]['rdf:type'] = options.rdftype;
				}
				if ('undefined'==typeof(post[s]['sioc:content'])) {
					post[s]['sioc:content'] = options.sioccontent;
				}				
				
			}
			
			return post;
			
		},		
		
		load_results_data : function(post, form_data, options) {
			
			var results_data = {};
			
			for (var j in post) {
			
				results_data[j] = {};
				
				results_data[j].node_uri = j;
				results_data[j].source = ('undefined'!=typeof(post[j]['dcterms:source'])&&post[j]['dcterms:source']) ? post[j]['dcterms:source'] : '(Missing source)';
				results_data[j].title = ('undefined'!=typeof(post[j]['dcterms:title'])&&post[j]['dcterms:title']) ? post[j]['dcterms:title'] : '(Missing title)';
				results_data[j].desc = ('undefined'!=typeof(post[j]['dcterms:description'])&&post[j]['dcterms:description']) ? post[j]['dcterms:description'] : '(No description provided)';
				results_data[j].creator = ('undefined'!=typeof(post[j]['dcterms:creator'])&&post[j]['dcterms:creator']) ? post[j]['dcterms:creator'] : '(No creator provided)';
				results_data[j].thumb = ('undefined'!=typeof(post[j]['art:thumbnail'])) ? post[j]['art:thumbnail'] : null;
				if (!results_data[j].thumb) results_data[j].thumb = $('#approot').attr('href')+'views/melons/honeydew/images/generic_media_thumb.jpg';
				if ('object'==typeof(results_data[j].thumb) && results_data[j].thumb.length) results_data[j].thumb = results_data[j].thumb[0];
				results_data[j].url = ('undefined'!=typeof(post[j]['scalar:url'])) ? post[j]['scalar:url'] : null;
				results_data[j].mediatype = ('undefined'!=typeof(post[j]['dcterms:type'])) ? post[j]['dcterms:type'] : 'Media';

			}

			return results_data;
				
		},
		
		load_selected_data : function($results, options) {
			
			var selected_data = [];
			$results.find('input[type="checkbox"]:checked').each(function() {
				var rdf = $(this).closest('tr').data('rdfxml');
				selected_data.push(rdf);
			});

			return selected_data;
			
		},
		
		load_custom_meta : function(uri, form) {
			
			var obj = {};
			
			$(form).find('input, textarea').each(function() {
				var $this = $(this);
				var name = $this.attr('name');
				var value = $this.val();
				if ('undefined'==typeof(obj[name])) obj[name] = [];
				obj[name].push(value);
			});
			
			obj = $.fn.scalarimport('flatten_object', obj);

			var post = {};
			post[uri] = obj;
			
			return post;
			
		},
		
		/**
		 * Methods that perform a set of actions before loading the UI
		 */
		
		proxy : function(callback, to_send, options) {
		
			$(options.loading_el).show();
	
			to_send = $.fn.scalarimport('flatten_object', to_send);
			if ('undefined'==typeof(to_send.format)) to_send.format = 'xml';

			// Pull out part of a query (e.g., the get vars of a URL string) based on the 'match' field
			if (to_send.match && to_send.match.length) to_send.sq = to_send.sq.replace(new RegExp(to_send.match, ""), "$1");
			
			// Enter the query, page number, and api_key into the URI
			to_send.uri = to_send.uri.replace('$1', to_send.sq);
			to_send.uri = to_send.uri.replace($.fn.scalarimport('get_next_page_uri_component', to_send.uri),$.fn.scalarimport('get_next_page_value', to_send.uri, to_send.pagenum));
			if ('undefined'!=typeof(to_send.archive_api_key)) to_send.uri = to_send.uri.replace('$api_key', to_send.archive_api_key);			

			// Run request
			var the_request = to_send.proxy+'?xsl='+encodeURIComponent(to_send.xsl)+'&uri='+encodeURIComponent(to_send.uri)+'&format='+to_send.format;
			$.ajax({
				  url: the_request,
				  type: 'GET',
				  dataType: "xml",
				  success: function(content) {
					$(options.loading_el).hide();
					callback(content);
				  },
				  error: function(xhr, status, err) {
					  $(options.loading_el).hide();
					  $.fn.scalarimport('error', err, options);
				  }
				});				

		},
		
		multi_custom_meta : function ($results, form_data, options) {
			
			// Work in progress
			/*
			$(options.results_el).trigger(options.multi_custom_meta_complete, [form_data, options]);
			return false;
			*/
			
			if (!$('#edit_meta').is(':checked')) {
				$(options.results_el).trigger(options.multi_custom_meta_complete, [form_data, options]);
				return false;
			}
			
			var results = $results.find('table input[type="checkbox"]:checked');
			if (!results.length) {
				$.fn.scalarimport('error', 'Please select one or more items to import', options);
				return false;
			}
			for (var j = 0; j < results.length; j++) {
				results[j] = $(results[j]).closest('tr');
			}
			
			// Get the number of items left to customize
			var custom_meta_to_complete = results.length;
			for (var j = 0; j < results.length; j++) { 
				if ($(results[j]).data('custom_meta_complete')) custom_meta_to_complete--;
			}
			
			// Multi custom meta process is complete
			if (!custom_meta_to_complete) {
				$(options.results_el).trigger(options.multi_custom_meta_complete, [form_data, options]);
				return false;
			}		
			
			// Next element to process
			var index = 0;
			for (var j = 0; j < results.length; j++) { 
				if ($(results[j]).data('custom_meta_complete')) continue;
				index = j;
				break;
			}		
			console.log('will process index: '+index);
			
			// Run custom meta process on an item
			$el = $(results[index]);
			console.log($el.data('post'));
			var complete = function(post) {
				$el.data('post', post);	
				$el.data('custom_meta_complete', true);
				console.log('index '+index+' new post:');
				console.log($el.data('post'));	
				console.log('---- end index ----');
				$.fn.scalarimport('multi_custom_meta', $results, form_data, options);
			}
			$el.scalarimport('custom_meta', complete, options);
			
		},
		
		import : function(callback, form_data, options) {

			$results = $(this);
			if ($results.data('importing')) return;
			$results.data('importing', true);
			$('.'+options.import_loading_class).show();
			var base_properties = $.fn.scalarimport('flatten_object',{
				action:form_data.action,
				id:form_data.id,
				native:form_data.native,
				api_key:form_data.api_key
			});
			base_properties['scalar:child_urn'] = form_data.child_urn[0];
			base_properties['scalar:child_type'] = form_data.child_type[0];
			base_properties['scalar:child_rel'] = form_data.child_rel[0];
			var save_arr = [];

			var results = $results.find('table input[type="checkbox"]:checked');
			if (!results.length) {
				$.fn.scalarimport('error', 'Please select one or more items to import', options);
				callback();
				return;
			}
			
			for (var j = 0; j < results.length; j++) {  // .each() isn't working for some reason
				var post = $(results[j]).closest('tr').data('post');
				for (var uri in post) break;
				save_arr.push($.extend({}, base_properties, post[uri]));
			}

			var success = function(versions) {
				$results.data('importing', false);
				$('.'+options.import_loading_class).hide();
			    callback(versions);
			}
			var error = function(e) {
				$results.data('importing', false);
				$('.'+options.import_loading_class).hide();
				$.fn.scalarimport('error', 'Something went wrong while attempting to save: '+e, options);
				callback();
			}
			options.scalarapi.savePages(save_arr, success, error);
			
		},		
		
		/**
		 * Methods that display the UI
		 */
		
		results : function($form, post, form_data, options) {

			var results_data = $.fn.scalarimport('load_results_data', post, form_data, options);
			var $div = $('<div class="result_content"></div>').appendTo($(options.results_el));
			var $footer = $('<div class="result_footer"></div>').appendTo($(options.results_el));
			var $table = $('<table cellspacing="0" cellpadding="0"></table>').appendTo($div);
			$table.append('<tbody></tbody>');
			$tbody = $table.find('tbody');
			var found = 0;
			var supported = 0;

			for (var j in results_data) {
			
				var $tr = $('<tr></tr>').appendTo($tbody);
				var post_data = {};
				post_data[j] = post[j];
				$tr.data('post', post_data);
				$tr.data('orig_post', post_data);  // for use with resetting original metadata button 
				$tr.append('<td valign="top" class="thumbnail"><img src="'+results_data[j].thumb+'" /></td>');
				var $content = $('<td valign="top"><div class="title"><input type="checkbox" id="result_row_'+j+'" /><label for="result_row_'+j+'"> '+results_data[j].title+'</label>&nbsp;</div><div class="desc">'+create_excerpt(results_data[j].desc, options.results_desc_num_words)+'</div></td>').appendTo($tr);
				if (!results_data[j].url.length) {
					$('<div class="import_error"><a href="'+results_data[j].node_uri+'" target="_blank" class="generic_button small">Source</a>&nbsp; '+options.url_not_supported_msg+'</div>').appendTo($content);
					$tr.addClass(options.url_not_supported_class);
					$tr.find("input[id='result_row_"+j+"']").remove();
				} else {
					var url_str = '<div class="url">';
					url_str += '<a href="javascript:;" onclick="scalarimport_preview(\''+results_data[j].url+'\')" class="generic_button small">Preview</a>&nbsp; ';
					url_str += '<a href="'+results_data[j].node_uri+'" target="_blank" class="generic_button small">Source</a>&nbsp; ';
					url_str += '<span>'+results_data[j].mediatype+': '+basename(results_data[j].url)+'</span>';
					url_str += '</div>';
					$(url_str).appendTo($content);			
					supported++;
				}
				found++;
				
			}
			
			$footer.html('<span class="'+options.import_btn_wrapper_class+'"><img class="'+options.import_loading_class+'" src="'+$('link#approot').attr('href')+'views/melons/honeydew/images/loading.gif"" height="16" align="absmiddle" />&nbsp; <a class="'+options.import_btn_class+' generic_button large default">Import selected</a></span>Page <strong>'+form_data.pagenum+'</strong>: Found <strong>'+found+'</strong> results (<strong>'+supported+'</strong> supported)&nbsp; <span class="pagination"></span><br /><input type="checkbox" id="check_all" /><label for="check_all"> Check all</label>&nbsp; &nbsp; <input type="checkbox" id="edit_meta" checked /><label for="edit_meta"> Edit metadata before importing</label>');
			if (form_data.paginate) {
				$footer.find('.pagination').html('<span style="'+((form_data.pagenum <= 1)?'visibility:hidden':'')+'"><a href="javascript:;" class="prev">&lt; load previous page</a>&nbsp; | &nbsp;</span>');
				$footer.find('.pagination').append('<a href="javascript:;" class="next">load next page &gt;</a>');
			} else {
				$footer.find('.pagination').html('No additional pages');
			}
			$footer.find('#check_all').change(function() {
				var check_all = ($(this).is(':checked')) ? true : false;
				$table.find('input[type="checkbox"]').prop('checked', check_all);
			});
			$(options.results_el).fadeIn();
			$.fn.scalarimport('resize_results', options);
		
			$footer.find('.prev').click(function() {
				$form.scalarimport( $.extend({}, options, {pagenum:(form_data.pagenum-1)}) );
			});			
			$footer.find('.next').click(function() {
				$form.scalarimport( $.extend({}, options, {pagenum:(form_data.pagenum+1)}) );
			});
			
		},
		
		custom_meta : function(callback, options) {
			
			var $el = $(this);
			var post = $el.data('post');
			for (uri in post) break;
			var title = '[No title]';
			var fields = post[uri];
			console.log(fields);
			var title_field = 'dcterms:title';
			var description_field = "dcterms:description";
			var thumbnail_field = 'art:thumbnail';
			var required_fields = ['dcterms:title','dcterms:description','scalar:url','art:thumbnail','sioc:content','rdf:type'];
			var mark_as_required = ['dcterms:title','scalar:url','rdf:type'];
			
			$('.custom_meta').remove();
			var $div = $('<div class="custom_meta"></div>').appendTo('body');
			var $content = $('<div class="custom_meta_content" style="overflow:scroll;overflow-x:hidden;"></div>').appendTo($div);
			var $buttons = $('<div class="custom_meta_footer"><a href="javascript:void(null);" class="reload">Reload original metadata</a><a class="import_btn generic_button large">Cancel</a>&nbsp; &nbsp;<a class="import_btn generic_button large default">Continue</a></div>').appendTo($div);	
			
			// Buttons
			$buttons.find('a:first').click(function() {  // Reload
				if (!confirm('Are you sure you wish to reload original metadata? Any changes to the form fields will be lost.')) return false;
				$el.data('post', $el.data('orig_post'));
				$el.scalarimport('custom_meta', callback, options);
				return false;
			});
			$buttons.find('a:nth-child(2)').click(function() {  // Remove
				$(this).closest('.custom_meta').remove();
				return false;
			});
			$buttons.find('a:last').click(function() {  // Continue
				if (!$.fn.scalarimport('validate_custom_meta', $div, mark_as_required)) {
					alert('There are one or more custom metadata fields that require values');
					return false;
				}
				$(this).closest('.custom_meta').remove();
				var post = $.fn.scalarimport('load_custom_meta', uri, $(this).closest('.custom_meta'));
				callback(post);
				return false;
			});
			
			// Directions
			var $directions = $('<div class="directions">Please review the metadata to be imported for this media file and make any desired changes, or click Continue.</div>').appendTo($content);
			
			// Required
			$core = $('<div></div>').appendTo($content);
			$core.append('<h4>Core metadata&nbsp; <span class="subtitle">(<span class="asterisk">*</span> = required field)</span></h4>');
			var $coreul = $('<ul class="nodots"></ul>').appendTo($core);
			for (var j in required_fields) {
				var value = fields[required_fields[j]];
				if (value && 'object'==typeof(value) && 'undefined'!=typeof(value[0])) value = value[0];
				var value = (!value || 'undefined'==typeof(value)) ? '' : $.fn.scalarimport('htmlspecialchars', value);
				var $li = $('<li></li>').appendTo($coreul);
				$li.append('<span class="field">'+required_fields[j]+'</span>');
				var $value = $('<span class="value"></span>').appendTo($li);
				if (required_fields[j]==description_field) {
					$value.html('<textarea name="'+required_fields[j]+'">'+value+'</textarea>');
				} else {
					$value.html('<input type="text" name="'+required_fields[j]+'" value="'+value+'" />');
				}
				if (-1!=mark_as_required.indexOf(required_fields[j])) $value.append('<sup>*</sup>');
				// Special case the thumbnail
				if (required_fields[j]==thumbnail_field) {
					$('<li><span class="field nopadding"></span><span class="value nopadding"><img id="thumbnail" src="'+value+'" /></span></li>').appendTo($coreul);
				}				
				// Special case the title for use later
				if (required_fields[j]==title_field) title = value;
			}
			
			// Thumbnail changes
			if ($coreul.find('input[name="'+thumbnail_field+'"]').val().length) $coreul.find('#thumbnail').show();
			$coreul.find('input[name="'+thumbnail_field+'"]').change(function() {
				var url = $(this).val();
				$coreul.find('#thumbnail').show().attr('src', url);
			});
		
			// Additional
			$other = $('<div></div>').appendTo($content);
			$other.append('<h4>Additional metadata</h4>');
			var $otherul = $('<ul class="nodots"></ul>').appendTo($other);
			for (var j in fields) {
				if (required_fields.indexOf(j)!=-1) continue;
				if (null==fields[j]) continue;
				var values = fields[j];
				if ('string'==typeof(values)) values = [values];
				for (var k in values) {
					var value = $.fn.scalarimport('htmlspecialchars', values[k]);
					var $li = $('<li></li>').appendTo($otherul);
					$li.append('<span class="field">'+j+'</span><span class="value"><input type="text" name="'+j+'" value="'+value+'" /></span>');
				}
			}			
			$other.append('<a class="generic_button border_radius" id="additional_metadata" href="javascript:void(null);">Add additional metadata</a>');
			
			// Create the modal
			var width = (parseInt($(window).width()) * 0.8);
			var height = (parseInt($(window).height()) * 0.7);
			$( ".custom_meta" ).dialog({ 
				modal: true, width: width, height: height, 
				title: title, resizable: true, draggable: true
			});
			
			// Override layout
			$content.height((parseInt($content.parent().innerHeight())-parseInt($buttons.outerHeight())-30));
			$content.scrollTop(0);  // Going from panel to panel, the scrollbar will stay scrolled down if placed that way
			
			// Add additional metadata
			$other.find('#additional_metadata').click(function() {
				var $this = $(this);
				if ($this.data('open')) {
					$div.find('.overlay').remove();
					$this.data('open', false);
				} else {
					var callback = function(link) {
						var $link = $(link);
						var pnode = $link.attr('title');
						$otherul.append('<li><span class="field">'+pnode+'</span><span class="value"><input type="text" name="'+pnode+'" value="" /></span></li>');
						$link.closest('.overlay').remove();
						$other.find('#additional_metadata').data('open', false);	
					}
					$(this).scalarimport('additional_metadata', $div, options, required_fields, callback);
					$this.data('open', true);
				}
				return false;
			});
			
		},
		
		imported : function(versions, options) {
			
			if ('undefined'==typeof(versions)||!versions.length) {
				$.fn.scalarimport('error', 'There was a problem importing, please try again', options);
				return;
			}
			
			$(options.results_el).find('input[type="checkbox"]').prop('checked', false);
			var $box = $('<div class="dialog"></div>');
			$box.append(((versions.length>1)?'Files have been':'A file has been')+' imported.  You may follow the link'+((versions.length>1)?'s':'')+' below to access the imported media. Alternatively, you can access the media in Dashboard > Media.');
			$('body').append($box);

			for (var j = 0; j < versions.length; j++) {
				for (var uri in versions[j]) break;
				var url = uri;
				if (url.lastIndexOf('.')!=-1) url = url.substr(0, url.lastIndexOf('.'));
				var title = versions[j][uri]['http://purl.org/dc/terms/title'];
				title = ('undefined'!=typeof(title)&&title.length) ? title[0].value : '(No title)';
				var desc = versions[j][uri]['http://purl.org/dc/terms/description'];
				desc = ('undefined'!=typeof(desc)&&desc.length) ? desc[0].value : '';
				$li = $('<li></li>');
				$li.append('<a href="'+url+'">'+title+'</a>');
				if (desc.length) $li.append('<br /><small>'+create_excerpt(desc, 40)+'</small>');
				$box.append($li);
			}

			$( ".dialog" ).dialog({ modal:true, minWidth: 700, title: 'Import successful', resizable: false, draggable: true });				
			
		},
		
		additional_metadata: function($wrapper, options, required_fields, callback) {
			
			var $button = $(this);
			var position = $button.position();
			
			var $div = $('<div class="overlay"></div>').appendTo($wrapper);
			$div.append('<div class="loading">Loading...</div>');
			
			var top = position.top - parseInt($div.outerHeight());
			var left = position.left;
			$div.css('top', top+'px');
			$div.css('left', left+'px');
			
			var fill_ontologies = function(data) {
				$div.empty();
				for (var ontology in data) {
					var $ontology = $('<div class="el"></div>').appendTo($div);
					$ontology.append(ontology);
					$ontology.append('<br />');
					var arr = [];
					for (var j = 0; j < data[ontology].length; j++) {
						if (required_fields.indexOf(ontology+':'+data[ontology][j])!=-1) continue;
						arr.push('<a href="javascript:void(null);" title="'+ontology+':'+data[ontology][j]+'">'+data[ontology][j]+'</a>');
					}
					$ontology.append(arr.join(', '));
				}
				$div.find('a').click(function() {
					callback(this);
				});
			};

			if (null!==options.ontologies) {
				fill_ontologies(options.ontologies);
			} else {
				$.getJSON(options.ontologies_url, function(data) {
					options.ontologies = data;
					fill_ontologies(data);
				});
			}
			
		},
		
		/**
		 * Helper methods
		 */
		
		validate_custom_meta : function($form, required) {
			
			var valid = true;
			$form.find('input, textarea').each(function() {
				var $this = $(this);
				if (!$this.val().length && required.indexOf($this.attr('name'))!=-1) {
					valid = false;
					$this.addClass('invalid_input');
				}
			});
			
			return valid;
			
		},
		
		flatten_object : function(obj1) {
			
			var obj2 = {}
			for (var field in obj1) {
				if ('object'!=typeof(obj1[field])) obj2[field]= obj1[field]; 
				if (!obj1[field].length) continue;
				if (1==obj1[field].length) {
					obj2[field] = obj1[field][0];
				} else {
					obj2[field] = obj1[field];
				}
			}
			
			return obj2;
			
		},
		
		filter_urls : function(urls, options) {

			if ('object'!=typeof(urls)) urls = [urls];

			for (var j = (urls.length-1); j >=0; j--) {
				var url = urls[j];
				if ('undefined'!=typeof(url.value)) url = url.value;
				if (!$.fn.scalarimport('valid_url', url, options)) urls.splice(j,1);
			}
			
			// A concession that we only store one URL per version for now
			// TODO: save multiple URLs and let the UX determine which is most appropriate to play
			if (urls.length > 0) {
				urls = urls[0];
			} else {
				urls = '';
			}
			
			return urls;
			
		},
		
		valid_url : function(url, options) {
			
			if ("Unsupported"==options.scalarapi.parseMediaSource(url).name) {
				return false;
			}
			
			return true;
			
		},
		
		get_next_page_uri_component : function(uri) {
			
			if (uri.indexOf('$2')==-1) return '$2';
			var slug = uri.substr(uri.indexOf('$2'));
			if (slug.substr(0, 3)!='$2(') return '$2';
			slug = slug.substr(0, (slug.indexOf(')')+1));
			return slug;
			
		},
		
		get_next_page_value : function(uri, pagenum) {
			
			// $2 doesn't exist
			if (uri.indexOf('$2')==-1) return 0;
			// No extra info ($2(##))
			var slug = uri.substr(uri.indexOf('$2'));
			if (slug.substr(0, 3)!='$2(') {
				// Start with 0 (offset)
				if (uri.indexOf('offset=$2')!=-1) return (pagenum-1);
				// Start with 1 (page number)
				return pagenum;
			}
			// Extra info ($2(##))
			var slug = slug.substr((slug.indexOf('(')+1));
			slug = slug.substr(0, slug.indexOf(')'));
			slug = parseInt(slug);
			return (slug * (pagenum-1));
			
		},
		
		// http://phpjs.org/functions/htmlspecialchars/
		htmlspecialchars : function (string, quote_style, charset, double_encode) {

			  var optTemp = 0,
			    i = 0,
			    noquotes = false;
			  if (typeof quote_style === 'undefined' || quote_style === null) {
			    quote_style = 2;
			  }
			  string = string.toString();
			  if (double_encode !== false) { // Put this first to avoid double-encoding
			    string = string.replace(/&/g, '&amp;');
			  }
			  string = string.replace(/</g, '&lt;')
			    .replace(/>/g, '&gt;');

			  var OPTS = {
			    'ENT_NOQUOTES': 0,
			    'ENT_HTML_QUOTE_SINGLE': 1,
			    'ENT_HTML_QUOTE_DOUBLE': 2,
			    'ENT_COMPAT': 2,
			    'ENT_QUOTES': 3,
			    'ENT_IGNORE': 4
			  };
			  if (quote_style === 0) {
			    noquotes = true;
			  }
			  if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
			    quote_style = [].concat(quote_style);
			    for (i = 0; i < quote_style.length; i++) {
			      // Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
			      if (OPTS[quote_style[i]] === 0) {
			        noquotes = true;
			      } else if (OPTS[quote_style[i]]) {
			        optTemp = optTemp | OPTS[quote_style[i]];
			      }
			    }
			    quote_style = optTemp;
			  }
			  if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
			    string = string.replace(/'/g, '&#039;');
			  }
			  if (!noquotes) {
			    string = string.replace(/"/g, '&quot;');
			  }

			  return string;
		}
		
	};

	$.fn.scalarimport = function(methodOrOptions) {		

		if ( scalarimport_methods[methodOrOptions] ) {
			return scalarimport_methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
			// Default to "init"
			return scalarimport_methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  methodOrOptions + ' does not exist.' );
		}    
		
	};
	
})(jQuery);