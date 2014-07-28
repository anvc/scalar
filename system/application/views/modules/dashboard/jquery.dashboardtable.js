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
 * @projectDescription  Draw content tables from RDF API
 * @author              Craig Dietrich
 * @version             1.0
 * @required			Instantiated scalarapi obj (default: window['scalarapi'])
 */ 

(function($) {

    var defaults = {
    		scalarapi: null,
    		query_type: null,
    		sq: null,
    		start: 0,
    		results: 0,
    		wrapper: null,
    		hide_columns: {},
    		cut_long_text_to: 50,	
    		resize_wrapper_func: null,
    		tablesorter_func: null,
    		pagination_func: null,
      };
    
	var scalardashboardtable_methods = {
			
		init : function(options) {
	
			try {
				$.fn.scalardashboardtable('setup', options);
				$.fn.scalardashboardtable('content', options);
				options.resize_wrapper_func();
				options.tablesorter_func();
				options.pagination_func(options.callee, options.scalarapi.model.numNodes);
			} catch(err) {
				$.fn.scalardashboardtable('error', err, options);
			}
			 
		},
		
		paginate : function(options) {
			
			options = $.extend(defaults, options);
			options = $.fn.scalardashboardtable('set_hide_columns', options);
			window['scalarapi'] = new ScalarAPI();
			options.scalarapi = window['scalarapi'];
			options.scalarapi.setBook(options.book_uri);
			options.callee = 'paginate';

			return this.each(function() {
				options.wrapper = this;
				var success = function() {
					$.fn.scalardashboardtable('init', options);
				};
				var error = function() { };
				options.scalarapi.loadNodesByType(options.query_type, 1, success, error, 0, 0, null, options.start, options.results, 1);
			});
			
		},	
		
		search : function(options) {
			
			options = $.extend(defaults, options);
			options = $.fn.scalardashboardtable('set_hide_columns', options);
			window['scalarapi'] = new ScalarAPI();
			options.scalarapi = window['scalarapi'];
			options.scalarapi.setBook(options.book_uri);
			options.callee = 'search';

			return this.each(function() {
				options.wrapper = this;
				var success = function() {
					$.fn.scalardashboardtable('init', options);
				};
				var error = function() { };
				options.scalarapi.nodeSearch(options.sq, success, error, 0, 0, 0, null, null, 1);
			});
			
		},			
		
		error : function(err, options) {
			
			$('<div><p>'+err+'</p></div>').addClass('error').appendTo(options.error_el);
			
		},
		
		setup : function(options) {
		
			var $table = $('<table cellspacing="0" cellpadding="0" class="tablesorter"><thead></thead><tbody></tbody></table>');
			$table.find('thead').append('<tr class="head"></tr>');
			$head = $table.find('.head');
			$head.append('<th></th>');
			$head.append('<th style="display:none;"></th>');
			$head.append('<th>Live?&nbsp; </th>');
			if (-1==options.hide_columns.indexOf('thumbnail')) $head.append('<th>Thumb</th>');
			$head.append('<th>URI</th>');
			$head.append('<th>Title</th>');
			if (-1==options.hide_columns.indexOf('description')) $head.append('<th>Description</th>');
			if (-1==options.hide_columns.indexOf('url')) $head.append('<th>Filename</th>');
			$head.append('<th>Created</th>');
			$head.append('<th>User</th>');
			$head.append('<th>Versions</th>');
			$(options.wrapper).html($table);
			
		},
		
		content : function(options) {
	
			var $tbody = $(options.wrapper).find('tbody:first');
			var nodes = options.scalarapi.model.getNodes();
			options.scalarapi.model.numNodes = 0;
			for (var j in nodes) {
				if (nodes[j].baseType!=$.fn.scalardashboardtable('get_type_from_querytype',options.query_type)) continue;
				options.scalarapi.model.numNodes++;
				console.log(nodes[j]);
				var id = nodes[j].urn.slice(nodes[j].urn.lastIndexOf(':')+1);
				var d = nodes[j].created.slice(0, nodes[j].created.indexOf('T'));
				var homepage = nodes[j].homepage;
				var creator = (homepage && homepage.length) ? nodes[j].homepage.slice(nodes[j].homepage.lastIndexOf('/')+1) : 0;
				var is_live = ('undefined'==typeof(nodes[j].is_live)||'1'!=nodes[j].is_live) ? false : true; 
				var $tr = $('<tr class="bottom_border" id="row_'+id+'" typeof="pages"></tr>');
				$tbody.append($tr);
				if (!is_live) $tr.addClass('not_live');
				$tr.append('<td style="white-space:nowrap;width:60px;"><input type="checkbox" name="content_id_'+id+'" value="1">&nbsp; <a href="javascript:;" onclick="edit_row($(this).parents(\'tr\'));" class="generic_button">Edit</a></td>');
				$tr.append('<td style="display:none;" property="id">'+id+'</td>');
				$tr.append('<td class="editable boolean" property="is_live" style="text-align:center;width:65px;">'+((is_live)?'1':'0')+'</td>');
				var thumb_str = '<td property="thumbnail">';
				if (nodes[j].thumbnail && nodes[j].thumbnail.length) thumb_str += '<a target="_blank" href="'+nodes[j].current.sourceFile+'"><img src="'+nodes[j].thumbnail+'" /></a>';
				thumb_str += '</td>';
				if (-1==options.hide_columns.indexOf('thumbnail')) $tr.append(thumb_str);
				$tr.append('<td class="editable has_link uri_link" property="slug" style="max-width:200px;overflow:hidden;"><a href="'+options.book_uri+nodes[j].slug+'">'+nodes[j].slug+'</a></td>');
				$tr.append('<td property="title">'+nodes[j].getDisplayTitle(true)+'</td>');
				if (-1==options.hide_columns.indexOf('description')) $tr.append('<td property="description">'+$.fn.scalardashboardtable('cut_string',nodes[j].current.description,Math.max(options.cut_long_text_to,nodes[j].getDisplayTitle(true).length*0.9))+'</td>');
				var url_str = '<td property="url" style="max-width:200px;overflow:hidden;">';
				url_str += '<a target="_blank" href="'+nodes[j].current.sourceFile+'">'+$.fn.scalardashboardtable('basename', nodes[j].current.sourceFile)+'</a>';
				//if ($this->versions->url_is_local($url)) echo '<a class="generic_button" href="'.confirm_slash(base_url()).confirm_slash($book->slug).'upload#replace='.$row->versions[0]->version_id.'">replace</a>';
				url_str += "</td>\n";
				if (-1==options.hide_columns.indexOf('url')) $tr.append(url_str);
				$tr.append('<td property="created" style="white-space:nowrap;">'+d+'</td>');
				$tr.append('<td class="editable number" property="user" style="white-space:nowrap;width:55px;text-align:center;">'+creator+'</td>');
				$tr.append('<td style="white-space:nowrap;text-align:center;"><a href="javascript:;" onclick="get_versions('+id+',this);" class="generic_button">View</a></td>');
				$tr.append('</tr>');			
			}
			
		},
		
		set_hide_columns : function(options) {
			
			if ('page'==options.query_type) {
				options.hide_columns = ['thumbnail','url'];
			} else if ('media' == options.query_type) {
				options.hide_columns = ['description'];
			}
			return options;
			
		},
		
		get_type_from_querytype : function(query_type) {
	
			if ('media'==query_type) return 'http://scalar.usc.edu/2012/01/scalar-ns#Media';
			if ('page'==query_type) return 'http://scalar.usc.edu/2012/01/scalar-ns#Composite';
			return false;
			
		},
		
		cut_string : function(s, n) {

			if (!s || !s.length) return '';
			var cut = s.indexOf(' ', n);
		    if(cut==-1) return s;
		    return s.substring(0, cut)+'...';
		    
		},
		
		// http://phpjs.org/functions/basename/
		basename : function(path, suffix) {
			
			  if (!path || !path.length) return '';  // Added by Craig
			  var b = path;
			  var lastChar = b.charAt(b.length - 1);
			  if (lastChar === '/' || lastChar === '\\') {
			    b = b.slice(0, -1);
			  }
			  b = b.replace(/^.*[\/\\]/g, '');
			  if (typeof suffix === 'string' && b.substr(b.length - suffix.length) == suffix) {
			    b = b.substr(0, b.length - suffix.length);
			  }
			  return b;			
			
		}
		
	};

	$.fn.scalardashboardtable = function(methodOrOptions) {		

		if ( scalardashboardtable_methods[methodOrOptions] ) {
			return scalardashboardtable_methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
			// Default to "init"
			return scalardashboardtable_methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  methodOrOptions + ' does not exist.' );
		}    
		
	};
	
})(jQuery);