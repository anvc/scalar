(function( $ ) {
	var defaults = {
			parent:$('link#parent').attr('href'),
			anno_icon:$('link#approot').attr('href')+'views/melons/cantaloupe/images/annotate_icon.png',
			type:null,
			changeable:true,
			multiple:false,
			onthefly:false,
			rec:0,
			sq:null,
			desc_max_length: 100,
			filename_max_length: 20,
			data:[],
			msg:'',
			callback:null
	};  	
	$.fn.content_options = function(opts) {
    	// Options
    	var self = this;
    	var $this = $(this);
    	var options = {};
    	if ('undefined'==typeof(opts.data) || $.isEmptyObject(opts.data)) {
    		console.log('content options: no data');
    		opts.callback(options);
    		return;
    	}
    	// Helpers
    	var ucwords = function (str) {  // http://kevin.vanzonneveld.net
    		return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
    			return $1.toUpperCase();
    		});
    	};
    	var dash_to_space = function(str) {
    		return str.replace(/-/g, ' ');
    	}    	
    	// Init options box
    	$this.addClass('media_options').appendTo('body');
    	$this.css( 'top', (($(window).height()*0.30) + $(document).scrollTop()) );
    	$this.html('<p class="h heading_font">Select media formatting options</p>');
        var $form = $('<div class="form-horizontal heading_font"></div>' );
		// Add options
    	for (var option_name in opts.data) {
			var $option = $('<div class="form-group"><label class="col-sm-2 control-label">'+ucwords(dash_to_space(option_name))+': </label><div class="col-sm-4"><select class="form-control" name="'+option_name+'"></select></div></div>');
			for (var j = 0; j < opts.data[option_name].length; j++) {
				$option.find('select:first').append('<option value="'+opts.data[option_name][j]+'">'+ucwords(dash_to_space(opts.data[option_name][j]))+'</option>');
			}
			$form.append($option);
		}
        $(this).append($form);
    	$this.append('<p class="buttons"><input type="button" class="btn btn-default generic_button" value="Cancel" />&nbsp; <input type="button" class="btn btn-primary generic_button default" value="Continue" /></p>');
    	$this.find('input:first').click(function() {
    		$this.remove();
		});
    	$this.find('input:last').click(function() {
			var data_fields = {};
			for (var option_name in opts.data) {
				data_fields[option_name] = $this.find('select[name="'+option_name+'"] option:selected"').val();
			}
			$this.remove();
			opts.callback(data_fields);
		});
	};
    $.fn.content_selector = function(options) {
    	// Options
    	var self = this;
    	var $this = $(this);
    	var opts = $.extend( {}, defaults, options );
    	var bootstrap_enabled = (typeof $().modal == 'function');
    	// Object to VAR str
    	var obj_to_vars = function(obj) {
    		var str = '';
    		for (var field in obj) {
    			str += field+'='+encodeURIComponent(obj[field])+'&';
    		}
    		return str;
    	};
    	// Helpers
    	var basename = function(path, suffix) {
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
    	};
    	var remove_version = function(uri) {
    		return uri.substr(0, uri.lastIndexOf('.'));
    	}
    	// Reset
    	var reset = function() {  // TODO: for some reason 'defaults' fields are getting set when it should only be 'opts' that is touched
    		defaults.type = null;
    		defaults.changeable = true;
    		defaults.multiple = false;
    		defaults.rec = 0;
    		defaults.sq = null;
    		defaults.data = [];
    		defaults.msg = '';
    	}
    	// Create an API call
    	var url = function() {
    		var type = 'content';
    		var get_vars = {rec:0,ref:0};
    		if ('composite'==opts.type||'page'==opts.type) {
    			type = 'composite';
    		} else if ('media'==opts.type) {
    			type = 'media';
    		} else if (opts.type) {
    			type = opts.type;
    		}
    		opts.type = type;
    		get_vars.rec = (opts.rec>0) ? opts.rec : 0;
    		if (opts.sq!=null) get_vars.sq = opts.sq;
    		var url = opts.parent+'rdf/instancesof/'+type+'?format=json&'+obj_to_vars(get_vars);
    		return url;
    	};
    	// Search
    	var isearch = function(val) {  // Search items already loaded
    		var $rows = $this.find('tr:not(:first)');
    		val = val.toLowerCase();
    		if (!val.length) {
    			$rows.show();
    		}
    		$rows.hide();
    		$rows.each(function() {
    			var $row = $(this);
    			$row.find('td:nth-child(2),td:nth-child(3),td:nth-child(4)').each(function() {
    				if ($(this).text().toLowerCase().indexOf(val)!=-1) $row.show();
    			});
    		});
    	};
    	var esearch = function(val) {  // Search via the API
    		opts.type = 'content';
    		opts.sq = val;
    		$this.find('input[type="radio"]').prop('checked', false);
    		go();
    	};
    	// Initialize the interface
    	var init = function() {
    		$this.addClass('content_selector');
    		if (bootstrap_enabled) $this.addClass('bootstrap');
    		var $wrapper = $('<div class="wrapper"></div>').appendTo($this);
    		$('body').append($this);
    		var $options = $('<div class="options"></div>').appendTo($wrapper);
    		var $content = $('<div class="content"><div class="howto">'+((opts.msg.length)?''+opts.msg+'<br />':'')+'Select a content type or enter a search above'+((opts.multiple)?', choose items, then click Add Selected to finish':'')+'</div></div>').appendTo($wrapper);
    		var $footer = $('<div class="footer"><div><a href="javascript:void(null);" style="float:left;" class="btn btn-default btn-sm generic_button">Create page on-the-fly</a><a href="javascript:void(null);" class="btn btn-default btn-sm generic_button">Cancel</a></div></div>').appendTo($wrapper);
    		$options.append('<form class="search_form"><input type="text" name="sq" placeholder="Search" /> <input type="submit" value="Go" />&nbsp; &nbsp; <label><input type="radio" name="type" value="content"> All</label> &nbsp;<label><input type="radio" name="type" value="composite"> Pages</label> &nbsp;<label><input type="radio" name="type" value="media"> Media</label> &nbsp;<label><input type="radio" name="type" value="path"> Paths</label> &nbsp;<label><input type="radio" name="type" value="tag"> Tags</label> &nbsp;<label><input type="radio" name="type" value="annotation"> Annotations</label> &nbsp;<label><input type="radio" name="type" value="reply"> Comments</label></form>');
    		$footer.find('a:first').click(function() {  // On-the-fly
    			$footer.find('a').hide();
    			var $screen = $('<div class="create_screen"></div>').appendTo($wrapper);
    			var $onthefly = $('<div class="create_onthefly"><div><b>Create a new page on the fly.</b> Clicking "Save and link" will create the new page then establish the selected relationship in the page editor.</div><form class="form-horizontal"></form></div>').appendTo($wrapper);
    			var $buttons = $('<div class="buttons"><span class="onthefly_loading">Loading...</span>&nbsp; <a href="javascript:void(null);" class="btn btn-default btn-sm generic_button">Cancel</a>&nbsp; <a href="javascript:void(null);" class="btn btn-primary btn-sm generic_button default">Save and link</a></div>').appendTo($onthefly);
    			var $form = $onthefly.find('form');
    			var id = $('input[name="id"]').val();  // Assuming this exists
    			var book_urn = $('input[name="urn:scalar:book"]').val();  // Assuming this exists
    			$form.append('<input type="hidden" name="action" value="add" />');
    			$form.append('<input type="hidden" name="native" value="1" />');
    			$form.append('<input type="hidden" name="scalar:urn" value="" />'); 
    			$form.append('<input type="hidden" name="id" value="'+id+'" />');
    			$form.append('<input type="hidden" name="api_key" value="" />');
    			$form.append('<input type="hidden" name="scalar:child_urn" value="'+book_urn+'" />');
    			$form.append('<input type="hidden" name="scalar:child_type" value="http://scalar.usc.edu/2012/01/scalar-ns#Book" />');
    			$form.append('<input type="hidden" name="scalar:child_rel" value="page" />');
    			$form.append('<input type="hidden" name="urn:scalar:book" value="'+book_urn+'" />');
    			$form.append('<input type="hidden" name="rdf:type" value="http://scalar.usc.edu/2012/01/scalar-ns#Composite" />');
    			$form.append('<div class="form-group"><label for="onthefly-title" class="col-sm-2">Title</label><div class="col-sm-10"><input type="text" class="form-control" id="onthefly-title" name="dcterms:title" value="" /></div></div>');
    			$form.append('<div class="form-group"><label for="onthefly-desc" class="col-sm-2">Description</label><div class="col-sm-10"><input type="text" class="form-control" id="onthefly-desc" name="dcterms:description" value="" /></div></div>');
    			$form.append('<div class="form-group"><label for="onthefly-content" class="col-sm-2">Content</label><div class="col-sm-10"><textarea id="onthefly-content" name="sioc:content" class="form-control" rows="5"></textarea></div></div>');
    			var onthefly_reset = function() {
    				$wrapper.find('.create_screen').remove();
    				$wrapper.find('.create_onthefly').remove();
    				$footer.find('a').show();
    			};
    			$buttons.find('a:first').click(function() {
    				onthefly_reset();
    			});
    			$buttons.find('a:last').click(function() {
    				var $self = $(this);
    				if ($self.data('clicked')) return false;
    				$self.data('clicked', true);
    				if (!$form.find('#onthefly-title').val().length) {
    					alert('Title is a required field.');
    					$self.data('clicked', false);
    					return false;
    				}
    				var success = function(version) {
    					for (var version_uri in version) break;
    					var urn = version[version_uri]['http://scalar.usc.edu/2012/01/scalar-ns#urn'][0].value;
    					var version_slug = version_uri.replace($('link#parent').attr('href'),'');
    					slug = version_slug.substr(0, version_slug.lastIndexOf('.'));
    					var uri = version_uri.substr(0, version_uri.lastIndexOf('.'));
    					var version = version[version_uri];
    					if (version_uri.substr(version_uri.length-1,1)=='/') version_uri = version_uri.substr(0, version_uri.length-1);
    					if (version_slug.substr(version_slug.length-1,1)=='/') version_slug = version_slug.substr(0, version_slug.length-1); 					
    					var node = {
    						content:{},slug:slug,targets:[],uri:uri,
    						version:version,version_slug:version_slug,version_uri:version_uri
    					};
    					if (opts.multiple) node = [node];
    					if ('undefined'!=typeof(window['send_form_hide_loading'])) send_form_hide_loading();
    					$form.closest('.content_selector').remove();
    					opts.callback(node);
    					reset();
    				};
    				$buttons.find('.onthefly_loading').show();
    				send_form($form, {}, success);
    			});
    		});
    		if (!opts.onthefly) $footer.find('a:first').hide();
    		$footer.find('a:nth-child(2)').click(function() {  // Cancel button
    			reset();
    			$(this).closest('.content_selector').remove();
    		});
    		$options.find('input[value="'+opts.type+'"]').prop('checked',true);
    		if (!opts.changeable) {  // Selected type is locked
    			$options.addClass('unchangeable');
    			$options.find('input[type="radio"]').prop('disabled', true);
    			$options.find('input[type="text"]').keyup(function() {
    				isearch($(this).val());
    			});
    			$options.submit(function() {
    				isearch($(this).find('input[type="text"]').val());
    				return false;
    			});    			
    		} else {  // User can select a type
    			$options.addClass('changeable');
    			$options.find('input[name="type"]').change(function() {
    				var val = $(this).filter(':checked').val();
    				opts.type = val;
    				opts.sq = null;
    				go();
    			});
    			$options.submit(function() {
    				esearch($(this).find('input[type="text"]').val());
    				return false;
    			});
    		}
    		if (opts.multiple) {
    			$footer.find('div:first').append('<a href="javascript:void(null);" class="btn btn-primary btn-sm generic_button default">Add Selected</a>');
    			$footer.find('a:last').click(function() {
    				var nodes = [];
    				$(this).closest('.content_selector').find('input[type="checkbox"]').each(function() {
    					var $this = $(this);
    					if (!$this.is(":checked")) return;
    					nodes.push($this.closest('tr').data('node'));
    				});
    				if (!nodes.length) {
    					alert('Please select one or more items');
    					return;
    				}
    				$(this).closest('.content_selector').remove();
    				opts.callback(nodes);
    				reset();
    			});
    		}
    	};
    	// Propagate the interface
    	var propagate = function() {
    		$this.find('.content').html('<table cellspacing="0" cellpadding="0"><tbody><tr>'+((opts.multiple)?'<th></th>':'')+'<th></th><th>Title</th><th>Description</th><th>URL</th><th></th></tr></tbody></table>');
    		var $tbody = $this.find('tbody:first');
    		for (var j in opts.data) {
    			var $tr = $('<tr class="'+((j%2==0)?'even':'odd')+'"></tr>').appendTo($tbody);
    			$tr.data('node', opts.data[j]);
    			var title = opts.data[j].version['http://purl.org/dc/terms/title'][0].value;
    			var desc = ('undefined'!=typeof(opts.data[j].version['http://purl.org/dc/terms/description'])) ? opts.data[j].version['http://purl.org/dc/terms/description'][0].value : null;
    			if (desc && desc.length > opts.desc_max_length) desc = desc.substr(0, opts.desc_max_length)+' ...';
    			var url = ('undefined'!=typeof(opts.data[j].version['http://simile.mit.edu/2003/10/ontologies/artstor#url'])) ? opts.data[j].version['http://simile.mit.edu/2003/10/ontologies/artstor#url'][0].value : null;
    			var filename = (url) ? basename(url) : basename(opts.data[j].uri);
	    		if (filename.length > opts.filename_max_length) filename = filename.substr(0, opts.filename_max_length)+'...';
    			var thumb = ('undefined'!=typeof(opts.data[j].content['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'])) ? opts.data[j].content['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'][0].value : null;
    			if (opts.multiple) {
    				$('<td valign="top"><input type="checkbox" name="s_'+j+'" value="1" /></td>').appendTo($tr);
    			}
    			var $first = $('<td valign="top"></td>').appendTo($tr);
    			if (thumb) {
    				$first.html('<img class="thumb" src="'+thumb+'" />');
    			} else if (opts.data[j].targets.length) {
    				$first.html('<img class="anno" src="'+opts.anno_icon+'" />');
    			}
    			$tr.append('<td valign="top">'+title+'</td>');
    			$tr.append('<td valign="top">'+((desc)?desc:'')+'</td>');
    			$tr.append('<td valign="top">'+filename+'</td>');
    			$tr.append('<td valign="top"><a target="_blank" class="generic_button" href="'+((url)?url:opts.data[j].uri)+'">'+((url)?'Preview':'Visit')+'</a></td>');
    		}
    		$this.find('tr').find('a').click(function(event) {  // Preview|Visit button
    			event.stopPropagation();
    			return true;
    		});
    		$this.find('tr').find('input[type="checkbox"]').click(function(event) {
    			var $this = $(this);
    			var checked = $this.is(":checked");
    			$this.prop('checked', ((checked)?false:true));
    			return true;
    		});
    		if (!opts.multiple) {  // Select a single row
    			$this.find('tr').click(function() {
    				var node = $(this).data('node');
    				$(this).closest('.content_selector').remove();
    				opts.callback(node);
    				reset();
    			});
    		} else {  // Select multiple rows
    			$this.find('tr').click(function() {
    				var $this = $(this);
    				var checked = $this.find('input[type="checkbox"]').is(":checked");
    				$(this).find('input[type="checkbox"]').prop('checked', ((checked)?false:true));
    				if (checked) {
    					$this.removeClass('checked');
    				} else {
    					$this.addClass('checked');
    				}
    			});
    		}
    		$('.thumb').parent().mouseover(function() {  // Expand thumbnail
    			var $this = $(this).children('.thumb:first');
    			var offset = $this.offset();
    			var $div = $('<div class="tt"></div>');
    			$div.css('left', parseInt(offset.left) + parseInt($this.outerWidth()) + 10);
    			$div.css('top', offset.top);
    			$('<img src="'+$this.attr('src')+'" />').appendTo($div);
    			$div.appendTo('body');
    			$this.parent().mouseout(function() {
    				$div.remove();
    			});
    		});
    		$('.anno').parent().mouseover(function() {  // Show item that is annotated
    			var $this = $(this).children('.anno:first');
    			var str = '<i>Could not find target of this annotation</i>';
    			var targets = $this.closest('tr').data('node').targets;
    			if (targets.length) {
    				var target = targets[0];
    				str = '<b>Annotates</b><br />'+target.version['http://purl.org/dc/terms/title'][0].value;
    			}
    			var offset = $this.offset();
    			var $div = $('<div class="tt"></div>');
    			$div.css('left', parseInt(offset.left) + parseInt($this.outerWidth()) + 10);
    			$div.css('top', offset.top);
    			$div.html(str);
    			$div.appendTo('body');
    			$this.parent().mouseout(function() {
    				$div.remove();
    			});   			
    		});
    	};
    	var go = function() {
    		opts.data = [];
    		$this.find('.content').html('<div class="loading">Loading ...</a>');
    		// TODO: spool requests
	    	$.getJSON(url(), function(){}).always(function(_data) {
	    		if ('undefined'!=typeof(_data.status)) {
	    			alert('There was a problem trying to get a list of content: '+_data.status+' '+_data.statusText+'. Please try again.');
	    			return;
	    		}
	    		var relations = [];
	    		for (var uri in _data) {  // Sort nodes, their versions, and relationships
	    			if ('http://www.openannotation.org/ns/Annotation'==_data[uri]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][0].value) {
	    				var relation = {};
	    				relation.body = _data[uri]['http://www.openannotation.org/ns/hasBody'][0].value;
	    				var target = _data[uri]['http://www.openannotation.org/ns/hasTarget'][0].value;
	    				var arr = target.split('#');
	    				relation.target = arr[0];
	    				relation.type = arr[1];
	    				relations.push(relation);
	    				continue;
	    			}
	    			if ('undefined'!=typeof(_data[uri]['http://purl.org/dc/terms/hasVersion'])) {
	    				var item = {};
	    				item.uri = uri;
	    				item.slug = uri.replace(opts.parent, '');
	    				item.version_uri = _data[uri]['http://purl.org/dc/terms/hasVersion'][0].value;
	    				item.version_slug = item.version_uri.replace(opts.parent, '');
	    				item.content = _data[uri];
	    				item.version = _data[ item.version_uri ];
	    				item.title = ('undefined'!=typeof(item.version["http://purl.org/dc/terms/title"])) ? item.version["http://purl.org/dc/terms/title"][0].value : '';
	    				item.targets = [];
	    				opts.data.push(item);
	    			}
	    		}
	    		if (relations.length) {  // If relations are present, place target nodes into a "target" array for each node
	    			for (var j = 0; j < opts.data.length; j++) {
	    				for (var k = 0; k < relations.length; k++) {
	    					if (relations[k].body == opts.data[j].version_uri) {
	    						var content = {};
	    						var version = {};
	    						var uri = remove_version(relations[k].target);
	    						for (var m = 0; m < opts.data.length; m++) {
	    							if (uri == opts.data[m].uri) {
	    								content = opts.data[m].content;
	    								version = opts.data[m].version;
	    							}
	    						}
	    						opts.data[j].targets.push({
	    							uri:uri,
	    							slug:remove_version(relations[k].target).replace(opts.parent, ''),
	    							version_uri:relations[k].target,
	    							version_slug:relations[k].target.replace(opts.parent, ''),
	    							content:content,
	    							version:version
	    						});
	    					}
	    				}
	    			}
	    			for (var j = opts.data.length-1; j >= 0; j--) {  // Assume that relationships being present means that nodes w/o relations should be removed
	    				if (!opts.data[j].targets.length) {
	    					opts.data.splice(j, 1);
	    				}
	    			}
	    		}
	    		opts.data.sort(function(a,b){ 
	    		    var x = a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1; 
	    		    return x; 
	    		});
	    		propagate();
	    	});
    	};
    	init();
    	if (opts.type) go();
    };
}( jQuery ));