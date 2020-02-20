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
    		s_all: null,
    		start: null,
    		results: null,
    		wrapper: null,
    		hide_columns: [],
    		expand_column: {name:'Versions',func:null},
    		cut_long_text_to: 50,
    		cut_long_content_to: 150,
    		resize_wrapper_func: null,
    		tablesorter_func: null,
    		pagination_func: null,
    		paywall: false,
    		no_content_msg: 'There is no content of this type'
      };

	var scalardashboardtable_methods = {

		init : function(options) {

			try {
				$.fn.scalardashboardtable('setup', options);
				$.fn.scalardashboardtable('content', options);
				if(location.search.indexOf('content-id') != -1) {
					var vars = {};
				    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&#]*)/gi, function(m,key,value) {
				        vars[key] = value;
				    });
				    $open_content = $('#row_'+vars['content-id']);
				    if($open_content.length !== 0) {
					    $open_content.find('a.view_versions').trigger('click');
						$('.table_wrapper').animate({
					        scrollTop: $open_content.offset().top
					    }, 2000);
					}
				}
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
			options.scalarapi.model.urlPrefix = options.book_uri;
			options.callee = 'paginate';

			return this.each(function() {
				options.wrapper = this;
				$(options.wrapper).html('<div id="loading">Loading</div>');
				var success = function() {
					$.fn.scalardashboardtable('init', options);
				};
				var error = function() { };
				options.scalarapi.loadNodesByType(options.query_type, 1, success, error, 0, 0, null, options.start, options.results, 1, false);
			});

		},

		search : function(options) {

			options = $.extend(defaults, options);
			options = $.fn.scalardashboardtable('set_hide_columns', options);
			window['scalarapi'] = new ScalarAPI();
			options.scalarapi = window['scalarapi'];
			options.scalarapi.model.urlPrefix = options.book_uri;
			options.callee = 'search';

			return this.each(function() {
				options.wrapper = this;
				var success = function() {
					$.fn.scalardashboardtable('init', options);
				};
				var error = function() { };
				options.scalarapi.nodeSearch(options.sq, success, error, 0, 0, 0, null, null, 1, null, options.s_all, ((options.s_all)?1:false));
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
			$head.append('<th style="text-align:center;">Live?&nbsp; </th>');
			if (-1==options.hide_columns.indexOf('category')) $head.append('<th>Category</th>');
			if (-1==options.hide_columns.indexOf('thumbnail')) $head.append('<th>Thumb</th>');
			$head.append('<th>URL</th>');
			$head.append('<th>Title</th>');
			if (-1==options.hide_columns.indexOf('description')) $head.append('<th>Description</th>');
			if (-1==options.hide_columns.indexOf('content')) $head.append('<th>Content</th>');
			if (-1==options.hide_columns.indexOf('url')) $head.append('<th>Filename</th>');
			$head.append('<th>Created</th>');
			if (-1==options.hide_columns.indexOf('user')) $head.append('<th style="text-align:center;">User</th>');
			if (options.paywall) $head.append('<th>Paywall?</th>');
			$head.append('<th style="white-space:nowrap;text-align:center;">'+options.expand_column.name+'</th>');
			$(options.wrapper).html($table);

		},

		content : function(options) {

			var $tbody = $(options.wrapper).find('tbody:first');
			var nodes = options.scalarapi.model.getNodes();
			if (!nodes.length) {
				$('<tr><td class="no_nodes" colspan="14" width="100%" height="100%" valign="middle" align="center" style="padding-top:40px;line-height:200%;">'+options.no_content_msg+'</td></tr>').appendTo($tbody);
				return;
			}
			options.scalarapi.model.numNodes = 0;
			for (var j in nodes) {
				var queryType = $.fn.scalardashboardtable('get_type_from_querytype',options.query_type);
				if (queryType && nodes[j].baseType!=queryType) continue;
				options.scalarapi.model.numNodes++;
				var id = nodes[j].urn.slice(nodes[j].urn.lastIndexOf(':')+1);
				var version_id = nodes[j].current.urn.slice(nodes[j].urn.lastIndexOf(':')+1);
				var d = nodes[j].created.slice(0, nodes[j].created.indexOf('T'));
				var author = nodes[j].author;
				var creator = (author && author.length) ? author.slice(author.lastIndexOf('/')+1) : 0;
				var is_live = ('undefined'==typeof(nodes[j].isLive)||1!=parseInt(nodes[j].isLive)) ? false : true;
				var paywall = ('undefined'==typeof(nodes[j].paywall)||1!=parseInt(nodes[j].paywall)) ? false : true;
				var category = ('undefined'==typeof(nodes[j].current.properties["http://scalar.usc.edu/2012/01/scalar-ns#category"])) ? '' : nodes[j].current.properties["http://scalar.usc.edu/2012/01/scalar-ns#category"][0].value;
				var $tr = $('<tr class="bottom_border" id="row_'+id+'" typeof="pages"></tr>');
				$tbody.append($tr);
				if (!is_live) {
					$tr.addClass('not_live');
				} else if (paywall) {
					$tr.addClass('paywall');
				}
				$tr.append('<td style="white-space:nowrap;width:60px;"><input type="checkbox" name="content_id_'+id+'" value="1">&nbsp; <a href="javascript:;" onclick="edit_row($(this).parents(\'tr\'));" class="generic_button">Edit</a></td>');
				$tr.append('<td style="display:none;" property="id">'+id+'</td>');
				$tr.append('<td class="editable boolean" property="is_live" style="text-align:center;width:65px;">'+((is_live)?'1':'0')+'</td>');
				if (-1==options.hide_columns.indexOf('category')) $tr.append('<td class="editable enum {\'review\',\'commentary\',\'term\'}" property="category">'+category+'</td>');
				var thumb_str = '<td property="thumbnail">';
				if (nodes[j].thumbnail && nodes[j].thumbnail.length) {
					var thumb = nodes[j].thumbnail;
					if (-1 == thumb.indexOf('//')) thumb = book_uri + thumb;
					thumb_str += '<a target="_blank" href="'+nodes[j].current.sourceFile+'"><img src="'+thumb+'" /></a>';
				}
				thumb_str += '</td>';
				if (-1==options.hide_columns.indexOf('thumbnail')) $tr.append(thumb_str);
				$tr.append('<td class="editable has_link uri_link" property="slug" style="max-width:200px;overflow:hidden;"><a href="'+options.book_uri+nodes[j].slug+'">'+nodes[j].slug+(('index'==nodes[j].slug)?'<span class="home_page"> (home page)</span>':'')+'</a></td>');
				$tr.append('<td property="title">'+nodes[j].getDisplayTitle(true)+'</td>');
				if (-1==options.hide_columns.indexOf('description')) $tr.append('<td property="description">'+$.fn.scalardashboardtable('cut_string',nodes[j].current.description,Math.max(options.cut_long_text_to,nodes[j].getDisplayTitle(true).length*0.9))+'</td>');
				if (-1==options.hide_columns.indexOf('content')) $tr.append('<td property="content">'+$.fn.scalardashboardtable('cut_string',nodes[j].current.content,options.cut_long_content_to)+'</td>');
				var url_str = '<td property="url" style="max-width:200px;overflow:hidden;">';
				url_str += '<a target="_blank" href="'+nodes[j].current.sourceFile+'">'+$.fn.scalardashboardtable('basename', nodes[j].current.sourceFile)+'</a>';
				url_str += "</td>\n";
				if (-1==options.hide_columns.indexOf('url')) $tr.append(url_str);
				$tr.append('<td property="created" style="white-space:nowrap;">'+d+'</td>');
				if (-1==options.hide_columns.indexOf('user')) $tr.append('<td class="editable number" property="user" style="white-space:nowrap;width:55px;text-align:center;">'+creator+'</td>');
				if (options.paywall) $tr.append('<td class="editable boolean" property="paywall" style="text-align:center;width:65px;">'+((paywall)?'1':'0')+'</td>');
				var func_name = (null==options.expand_column.func) ? 'get_versions' : options.expand_column.func;
				$tr.append('<td style="white-space:nowrap;text-align:center;"><a href="javascript:;" onclick="'+func_name+'('+id+','+version_id+',this);" class="view_versions generic_button">View</a></td>');
				$tr.append('</tr>');
			}

		},

		set_hide_columns : function(options) {

			if ('page'==options.query_type) {
				options.hide_columns = ['category','thumbnail','url','content'];
			} else if ('media' == options.query_type) {
				options.hide_columns = ['category','description','content'];
			} else if ('reply' == options.query_type) {
				options.hide_columns = ['category','thumbnail','description','url','user'];
			} else if ('annotation' == options.query_type || 'tag' == options.query_type || 'path' == options.query_type) {
				options.hide_columns = ['category','thumbnail','content','url','user'];
			} else if ('term' == options.query_type || 'commentary' == options.query_type || 'review' == options.query_type) {
				options.hide_columns = ['thumbnail','content','url'];
			}
			return options;

		},

		get_type_from_querytype : function(query_type) {

			if ('media'==query_type) return 'http://scalar.usc.edu/2012/01/scalar-ns#Media';
			if ('page'==query_type) return 'http://scalar.usc.edu/2012/01/scalar-ns#Composite';
			return false;

		},

		cut_string : function(s, n) {

			if (!s || null == s || !s.length) return '';
			s = $.fn.scalardashboardtable('strip_tags', s);
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

		},

		// http://phpjs.org/functions/strip_tags/
		// Edited to replace with space (' ') rather than empty string ('') to avoid long string resulting
		strip_tags : function(input, allowed) {
			  allowed = (((allowed || '') + '')
			    .toLowerCase()
			    .match(/<[a-z][a-z0-9]*>/g) || [])
			    .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
			  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
			    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
			  return input.replace(commentsAndPhpTags, ' ')
			    .replace(tags, function($0, $1) {
			      return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ' ';
			    });
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
