(function( $ ) {
	var defaults = {
			parent:$('link#parent').attr('href'),
			anno_icon:$('link#approot').attr('href')+'views/melons/cantaloupe/images/annotate_icon.png',
			type:null,
			changeable:true,
			multiple:false,
			onthefly:false,
			pagination:false,  /* Isn't working properly b/c backend sorts RDF nodes by slug not title */
			start:0,
			results_per_page:20,
			rec:0,
			sq:null,
			desc_max_length: 100,
			filename_max_length: 20,
			data:[],
			queue:[],
			msg:'',
			forceSelect:false,
			no_data_msg:'No content of the selected type was found',
			callback:null
	};
	$.fn.content_options = function(opts) {  // Layout options box
    	// Options

    	var self = this;
    	var $this = $(this);
    	var options = {};
    	var bootstrap_enabled = (typeof $().modal == 'function');
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
		// Create the modal
		if (bootstrap_enabled) {
			bootbox.dialog({
				message: '<div id="bootbox-media-options-content" class="heading_font"></div>',
				title: 'Media formatting options',
				className: 'media_options_bootbox',
				animate: ( (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) ? false : true )// Panel is unclickable if true for iOS
			});
			$('.bootbox').find( '.modal-title' ).addClass( 'heading_font' );
			$this.appendTo($('#bootbox-media-options-content'));
			var $media_options_bootbox = $('.media_options_bootbox');
			$('#bootbox-media-options-content div:first').append('<div id="bootbox-media-options-form" class="form-horizontal heading_font"></div>' );
			var $form = $('#bootbox-media-options-form');
			$('.bootbox-close-button').empty();
		} else {
			$this.addClass('media_options').appendTo('body');
			$this.css( 'top', (($(window).height()*0.30) + $(document).scrollTop()) );
			$this.html('<p class="h heading_font">Select media formatting options</p>');
			var $form = $('<div class="form-horizontal heading_font"></div>' );
			$(this).append($form);
		}
		//Media selection back link
		var node = typeof opts.node.current != 'undefined'?opts.node.current:opts.node;
		var $media_preview = $('<div class="row selectedItemPreview"><div class="col-xs-12 col-sm-4 col-md-3 left"></div><div class="col-xs-12 col-sm-8 col-md-9 right"><h2>'+node.title+'</h2><br /><p class="description"></p><br /><br /></div></div><hr />');
		var thumbnail = widgets_uri+'/ckeditor/plugins/scalar/styles/missingThumbnail.png';
		if(typeof opts.node.thumbnail != 'undefined' && opts.node.thumbnail != null){
			thumbnail = opts.node.thumbnail;
		}else if(typeof opts.node.content != 'undefined' && opts.node.content['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] != 'undefined' && opts.node.content['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] != null){
			thumbnail = opts.node.content['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'][0].value;
		}
		var description = '';
		if(typeof node.description == 'string' && node.description != ''){
			description = node.description;
		}else if(typeof node.content == 'string' && node.content != ''){
			description = node.content;
		}else if(typeof node.content == 'object' && typeof node.version != 'undefined' && typeof node.version['http://purl.org/dc/terms/description'] != 'undefined'){
			description = node.version['http://purl.org/dc/terms/description'][0].value;
		}
		if(description!=''){
			var $tmp = $('<div></div>');
	   	$tmp.html(description);
	   	$media_preview.find('.description').text($tmp.text());
		}else{
			$media_preview.find('.description').remove();
		}
		$media_preview.find('.left').append('<img class="img-responsive center-block" src="'+thumbnail+'">');
		$('<a href="#">Change Selected '+((typeof opts.targets != 'undefined' || opts.node.parent==null)?'Media':'Annotation')+'</a>').data('element',opts.element).click(function(e){
			e.preventDefault();
			e.stopPropagation();
			$(this).closest('.media_options_bootbox').modal( 'hide' ).data( 'bs.modal', null );
			var element = $(this).data('element');
			if ($(this).closest('.media_options_bootbox').length) {
				$(this).parent().closest('.media_options_bootbox').modal( 'hide' ).data( 'bs.modal', null );
			} else {
				$this.parent();
			}
			var data = $(element.$).data('selectOptions');
			data.forceSelect = true;
			CKEDITOR._scalar.selectcontent(data);
		}).appendTo($media_preview.find('.right'));

		$form.append($media_preview);

		// Add options
	    for (var option_name in opts.data) {
			var $option = $('<div class="form-group"><label class="col-sm-2 control-label">'+ucwords(dash_to_space(option_name))+': </label><div class="col-sm-4"><select class="form-control" name="'+option_name+'"></select></div></div>');
			for (var j = 0; j < opts.data[option_name].length; j++) {
				$option.find('select:first').append('<option value="'+opts.data[option_name][j]+'">'+ucwords(dash_to_space(opts.data[option_name][j]))+'</option>');
			}
			$form.append($option);

			if(typeof opts.element !== 'undefined' && opts.element != null && opts.element.data(option_name) !== null){
					$option.find('select').first().val(opts.element.data(option_name));
			}
		}
	    $this.append('<p class="buttons"><input type="button" class="btn btn-default generic_button" value="Cancel" />&nbsp; <input type="button" class="btn btn-primary generic_button default" value="Continue" /></p>');
	    $this.find('input:first').click(function() {
	    	$this.remove();
		});
	    $this.find('input:last').click(function() {
			var data_fields = {};
			for (var option_name in opts.data) {
				data_fields[option_name] = $this.find('select[name="'+option_name+'"] option:selected"').val();
			}
			if ($form.closest('.media_options_bootbox').length) {
				$form.closest('.media_options_bootbox').modal( 'hide' ).data( 'bs.modal', null );
			} else {
				$this.remove();
			}
			data_fields.node = opts.node
			opts.callback(data_fields);
		});
	};
    $.fn.content_selector = function(options) {  // Content selector box
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
    	};
    	// Reset
    	var reset = function() {  // TODO: for some reason 'defaults' fields are getting set despite using jQuery.extend({}, ...)
    		defaults.type = null;
    		defaults.changeable = true;
    		defaults.multiple = false;
    		defaults.rec = 0;
    		defaults.sq = null;
    		defaults.data = [];
    		defaults.queue = [];
    		defaults.msg = '';
    	};
    	// Add node to queue for opts.multiple
    	var queue = function(node, bool) {
    		if (bool) {
    			var exists = false;
    			for (var j = 0; j < opts.queue.length; j++) {
    				if (opts.queue[j].uri == node.uri) exists = true;
    			};
    			if (!exists) opts.queue.push(node);
    		} else {
    			for (var j = opts.queue.length-1; j >= 0; j--) {
    				if (opts.queue[j].uri == node.uri) {
    					opts.queue.splice(j,1);
    				};
    			};
    		};
    	};
    	//; Determine if a node is in the queue
    	var is_queued = function(node) {
			for (var j = 0; j < opts.queue.length; j++) {
				if (opts.queue[j].uri == node.uri) return true;
			}
			return false;
    	};
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
    		if (opts.pagination) {
    			get_vars.start = opts.start;
    			get_vars.results = opts.results_per_page;
    		}
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
    	// Set the height of the content area (only needed for Boostrap mode); TODO: very messy
    	var modal_height = function(init) {
    		var $content_selector_bootbox = $('.content_selector_bootbox');
    		if (!$content_selector_bootbox.length) return;
    		var margin = parseInt($content_selector_bootbox.find('.modal-dialog').css('marginTop'));
    		var head = parseInt( $content_selector_bootbox.find('.modal-header').outerHeight() );
    		if (head < 60) head = 60;  // Magic number
	    	var foot_el = $content_selector_bootbox.find('.footer');
	    	if (foot_el.is(':hidden')) {
	    		var foot = 52;  // Magic number; it seems iOS ignores this while it also ensures that on desktop there's no "jump"
	    	} else if (!foot_el.length) {
	    		var foot = 52;  // Magic number
	    	} else {
	    		var foot = parseInt( foot_el.height() );
	    	}
	    	var window_height = parseInt($(window).height());
	    	var val = window_height - head - foot - (margin*2);
    		$this.find('.content').height(val);
    	};
    	// Initialize the interface
    	var init = function() {
				//If we already have an element, don't open the modal
				//Instead, grab the current node and pass it to the callback instead
				if(typeof opts.element.getAttribute('href') != undefined && opts.element.getAttribute('href')!=null && opts.forceSelect == false){
					var parent = null;
					//Get the slug of the currently selected node
					if(opts.element.getAttribute('href').indexOf('#')>=0){
						//with annotation, get the slug in the hash of the url
						var temp_anchor = document.createElement('a');
						temp_anchor.href = opts.element.getAttribute('href');
						currentSlug = temp_anchor.hash.replace('#','');
						parent = {slug: opts.element.getAttribute('resource'), url: opts.element.getAttribute('href').replace('#'+currentSlug,'')};
						$(temp_anchor).remove();
					}else{
						//no annotation - use the resource value instead
						currentSlug = opts.element.getAttribute('resource');
					}

					//Now that we have the slug, load the page via the api, then run the callback
					(function(slug,parent,element,callback){
						scalarapi.loadPage( slug, true, function(){
								var node = scalarapi.getNode(slug);
								node.parent = parent;
								callback(node,element);
						}, null, 1, false, null, 0, 1 );
					})(currentSlug,parent,opts.element, opts.callback);

					return;
				}else{
					var selectOptions = $(opts.element.$).data('selectOptions');
					selectOptions.forceSelect = false;
				}

    		$('.content_selector, .bootbox, .modal-backdrop, .tt').remove();
    		$this.addClass('content_selector');
    		$this.addClass( ((bootstrap_enabled)?'bootstrap':'no-bootstrap') );
    		var $wrapper = $('<div class="wrapper"></div>').appendTo($this);
    		// Create the modal
    		if (bootstrap_enabled) {
    			//$(document).scrollTop(0);  // iOS
				var box = bootbox.dialog({
					message: '<div id="bootbox-content-selector-content" class="heading_font"></div>',
					title: '<div class="options container-fluid"></div>',
					className: 'content_selector_bootbox',
					animate: true  // This must remain true for iOS, otherwise the wysiwyg selection goes away
				});
				$('.bootbox').find( '.modal-title' ).addClass( 'heading_font' );
				$this.appendTo($('#bootbox-content-selector-content'));
				var $content_selector_bootbox = $('.content_selector_bootbox');
				$content_selector_bootbox.find('.modal-dialog').width('auto').css('margin-left','20px').css('margin-right','20px');
				var $options = $content_selector_bootbox.find('.options:first');
				$('.bootbox-close-button').empty();
				box.on("shown.bs.modal", function() {
					modal_height();
				});
				$(window).resize(function() {
					modal_height();
				});
				box.on("hidden.bs.modal", function() {
					reset();
				});
    		} else {
    			$('body').append($this);
    			var $options = $('<div class="options container-fluid"></div>').prependTo($wrapper);
    		}
    		// Default content
    		var $content = $('<div class="content"><div class="howto">'+((opts.msg.length)?''+opts.msg+'<br />':'')+'Select a content type or enter a search above'+((opts.multiple)?', choose items, then click Add Selected to finish':'')+'</div></div>').appendTo($wrapper);
    		// Footer buttons
    		var $footer = $('<div class="footer"><div><a href="javascript:void(null);" class="btn btn-default btn-sm generic_button">Create page on-the-fly</a> &nbsp; &nbsp; <label style="font-size:smaller;"><input type="checkbox" /> &nbsp; Check all</label></div><div><a href="javascript:void(null);" class="cancel btn btn-default btn-sm generic_button">Cancel</a></div></div>').appendTo($wrapper);
    		// Options (search + content type)
    		var options_html  = '<div class="col-xs-12 col-sm-4"><form class="form-inline search_form"><div class="input-group"><input class="form-control input-sm" type="text" name="sq" placeholder="Search" /><span class="input-group-btn"><button class="btn btn-default btn-sm" type="submit">Go</button></span></div></form></div>';
    			options_html += '<div class="col-xs-12 col-sm-8"><label class="checkbox-inline"><input type="radio" name="type" value="composite"> Pages</label> <label class="checkbox-inline"><input type="radio" name="type" value="media"> Media</label> <label class="checkbox-inline"><input type="radio" name="type" value="path"> Paths</label> <label class="checkbox-inline"><input type="radio" name="type" value="tag"> Tags</label> <label class="checkbox-inline"><input type="radio" name="type" value="annotation"> Annotations</label> <label class="checkbox-inline"><input type="radio" name="type" value="reply"> Comments</label> <label class="checkbox-inline"><input type="radio" name="type" value="term"> Terms</label></div>';
    		$options.append('<div class="row">'+options_html+'</div>');
    		// Bootstrap positioning
    		if (bootstrap_enabled) {
    			$footer.find('.cancel').hide();  // Remove cancel button
    			modal_height();  // TODO: I can't get rid of the small jump ... for some reason header and footer height isn't what it should be on initial modal_height() call
    		}
    		// Behaviors
    		$footer.hide();  // Default
    		$footer.find('a:first').click(function() {  // On-the-fly
    			$footer.hide();
    			var $screen = $('<div class="create_screen"></div>').appendTo($wrapper);
    			var $onthefly = $('<div class="create_onthefly"><div>Clicking "Save and link" will create the new page then establish the selected relationship in the page editor.</div><form class="form-horizontal"></form></div>').appendTo($wrapper);
    			var $buttons = $('<div class="buttons"><span class="onthefly_loading">Loading...</span>&nbsp; <a href="javascript:void(null);" class="btn btn-default btn-sm generic_button">Cancel</a>&nbsp; <a href="javascript:void(null);" class="btn btn-primary btn-sm generic_button default">Save and link</a></div>').appendTo($onthefly);
    			if (bootstrap_enabled) {
    				$('<div class="heading_font title">Create new page</div>').insertBefore($options);
    				$options.hide();
    			} else {
    				$onthefly.find('div:first').prepend('<b>Create new page</b><br />');
    			}
    			var $form = $onthefly.find('form');
    			var id = $('input[name="id"]').val();  // Assuming this exists; technically not needed for session auth
    			var book_urn = $('input[name="urn:scalar:book"]').val();
    			if ('undefined'==typeof(book_urn) && $('link#book_id').length) book_urn = "urn:scalar:book:"+$('link#book_id').attr('href');
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
    			$onthefly.css('max-height', $onthefly.closest('.modal-dialog').height());  // Mobile
    			var onthefly_reset = function() {
    				$wrapper.find('.create_screen').remove();
    				$wrapper.find('.create_onthefly').remove();
        			if (bootstrap_enabled) {
        				$options.parent().find('.title').remove();
        				$options.show();
        			}
    				$footer.show();
    			};
    			if ('undefined'==typeof(book_urn)) {
    				alert('Could not determine book URN and therefore can not create pages on-the-fly');
    				onthefly_reset();
    				return;
    			}
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
    					if ($form.closest('.content_selector_bootbox').length) {
    						$form.closest('.content_selector_bootbox').modal( 'hide' ).data( 'bs.modal', null );
    					} else {
    						$form.closest('.content_selector').remove();
    					}
    					$('.tt').remove();
    					opts.callback(node,opts.element);
    					reset();
    				};
    				$buttons.find('.onthefly_loading').show();
    				send_form($form, {}, success);
    			});
    		});  // /On-the-fly
    		if (opts.onthefly) {  // Display on-the-fly
    			$footer.show();
    		} else {
    			$footer.find('a:first').hide();
    		}
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
    				$options.find('input[name="type"]').prop('checked',false);
    				esearch($(this).find('input[type="text"]').val());
    				return false;
    			});
    		}
    		if (opts.multiple) {  // Can choose multiple rows
    			$footer.show();
    			$footer.find('label').show();  // Check all
        		$footer.find('input[type="checkbox"]').click(function() {
        			var active = $(this).data('active');
        			$wrapper.find('input[type="checkbox"]').each(function() {
        				var $this = $(this);
        				if (active && $this.is(':checked')) $this.closest('tr').click();
        				if (!active && !$this.is(':checked')) $this.closest('tr').click();
        			});
        			$(this).data('active', ((active)?false:true));
        		});
        		$footer.find('a').eq(1).click(function() {  // Cancel button
        			if ($(this).closest('.content_selector_bootbox').length) {
        				$(this).closest('.content_selector_bootbox').modal( 'hide' ).data( 'bs.modal', null );
        			}
        			reset();
        			$(this).closest('.content_selector').remove();
        			$('.tt').remove();
        		});
    			$footer.find('div:last').append('<a href="javascript:void(null);" class="btn btn-primary btn-sm generic_button default">Add Selected</a>');
    			$footer.find('a:last').click(function() {
    				if (!opts.queue.length) {
    					alert('Please select one or more items');
    					return;
    				}
    				if ($(this).closest('.content_selector_bootbox').length) {
    					$(this).closest('.content_selector_bootbox').modal( 'hide' ).data( 'bs.modal', null );
    				} else {
    					$(this).closest('.content_selector').remove();
    				}
    				opts.callback(opts.queue);
    				reset();
    			});
    		} else {
    			$footer.find('label').hide();
    		}
    	};
    	// Propagate the interface
    	var propagate = function() {
    		if (!opts.start) {
    			$this.find('.content').addClass('table-responsive').html('<table class="table table-hover" cellspacing="0" cellpadding="0"><thead><tr>'+((opts.multiple)?'<th></th>':'')+'<th></th><th>Title</th><th class="hidden-xs">Description</th><th class="hidden-xs">URL</th><th></th></tr></thead><tbody></tbody></table>');
        		if (!opts.data.length) {
        			$this.find('.content').html('<div class="loading" style="color:inherit;">'+opts.no_data_msg+'</div>');
        			return;
        		}
    		}
    		$this.find('.content, .content *').off();  // Remove any previously created events
    		var $tbody = $this.find('tbody:first');
				//Check to see if we have an element, and if so, get the currently selected slug
				var currentSlug = null;
				if(typeof opts.element.getAttribute('href') != undefined && opts.element.getAttribute('href')!=null){
					if(opts.element.getAttribute('href').indexOf('#')>=0){
						//with annotation
						var temp_anchor = document.createElement('a');
						temp_anchor.href = opts.element.getAttribute('href');
						currentSlug = temp_anchor.hash.replace('#','');
						$(temp_anchor).remove();
					}else{
						//no annotation
						currentSlug = opts.element.getAttribute('resource');
					}
				}
    		for (var j in opts.data) {
    			var $tr = $('<tr class="'+((j%2==0)?'even':'odd')+'"></tr>').appendTo($tbody);
					if(opts.data[j].slug == currentSlug){
						$tr.addClass('bg-info');
					}
    			$tr.data('node', opts.data[j]);
    			var title = opts.data[j].version['http://purl.org/dc/terms/title'][0].value;
    			var desc = ('undefined'!=typeof(opts.data[j].version['http://purl.org/dc/terms/description'])) ? opts.data[j].version['http://purl.org/dc/terms/description'][0].value : null;
    			if (desc && desc.length > opts.desc_max_length) desc = desc.substr(0, opts.desc_max_length)+' ...';
    			var url = ('undefined'!=typeof(opts.data[j].version['http://simile.mit.edu/2003/10/ontologies/artstor#url'])) ? opts.data[j].version['http://simile.mit.edu/2003/10/ontologies/artstor#url'][0].value : null;
    			var filename = (url) ? basename(url) : opts.data[j].uri.replace(opts.parent, '');
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
    			$tr.append('<td valign="top" class="hidden-xs">'+((desc)?desc:'')+'</td>');
    			$tr.append('<td valign="top" class="hidden-xs">'+filename+'</td>');
    			$tr.append('<td valign="top"><a target="_blank" class="generic_button" href="'+((url)?url:opts.data[j].uri)+'">'+((url)?'Preview':'Visit')+'</a></td>');
    			if (is_queued(opts.data[j])) {
    				$tr.addClass('active');
    				$tr.find('[type="checkbox"]:first').prop('checked',true);
    			};
    		};
    		modal_height();
    		if (opts.pagination) {  // Endless scroll pagination
    			$tbody.find('.loadmore').remove();
    			if (!opts.data.length) return;
    			var $loadmore = $('<tr><td class="loadmore" colspan="'+($this.find('th').length)+'">Loading more content ...</td></tr>').appendTo($tbody);
    			$loadmore.appendTo($tbody);
	    		$this.find('.content').scroll(function() {
	    			if ($loadmore.find('td').hasClass('loading')) return;
	    			var $this = $(this);
	    			if ($this.innerHeight() + $this.scrollTop() < $this[0].scrollHeight) return;
	    			$loadmore.find('td').addClass('loading');
	    			opts.start = opts.start + opts.results_per_page;
	    			go();
	    		});
    		};
    		$this.find('tr').find('a').click(function(event) {  // Preview|Visit button
    			event.stopPropagation();
    			return true;
    		});
    		$this.find('tr').find('input[type="checkbox"]').click(function(event) {  // Clicking a <tr> checks the checkbox; this allows it to work properly if checkbox itself is checked
    			var $this = $(this);
    			var checked = $this.is(":checked");
    			$this.prop('checked', ((checked)?false:true));
    			return true;
    		});
    		if (!opts.multiple) {  // Select a single row
    			$this.find('tr').click(function() {
    				var node = $(this).data('node');
    				if ($(this).closest('.content_selector_bootbox').length) {
    					$(this).closest('.content_selector_bootbox').modal( 'hide' ).data( 'bs.modal', null );
    				} else {
    					$(this).closest('.content_selector').remove();
    				}
    				opts.callback(node,opts.element);
    				reset();
    				$('.tt').remove();
    			});
    		} else {  // Select multiple rows
    			$this.find('tr').click(function() {
    				var $this = $(this);
    				var checked = $this.find('input[type="checkbox"]').is(":checked");
    				$(this).find('input[type="checkbox"]').prop('checked', ((checked)?false:true));
    				if (checked) {
    					queue($this.data('node'), false);
    					$this.removeClass('active');
    				} else {
    					queue($this.data('node'), true);
    					$this.addClass('active');
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
    		if (!opts.start) $this.find('.content').html('<div class="loading">Loading ...</div>');
    		$this.find('.footer').find('input[type="checkbox"]').data('active',false).prop('checked',false);
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
	    			var num_relations = 0;
	    			for (var j = 0; j < opts.data.length; j++) {
	    				for (var k = 0; k < relations.length; k++) {
	    					if (relations[k].body == opts.data[j].version_uri) {
	    						var content = {};
	    						var version = {};
	    						var uri = remove_version(relations[k].target);
	    						for (var m = 0; m < opts.data.length; m++) {  // Make sure target is a valid node (to protect against category annotation nodes)
	    							if (uri == opts.data[m].uri) {
	    								content = opts.data[m].content;
	    								version = opts.data[m].version;
	    							}
	    						}
	    						if (uri.length && !$.isEmptyObject(content)) {
		    						opts.data[j].targets.push({
		    							uri:uri,
		    							slug:remove_version(relations[k].target).replace(opts.parent, ''),
		    							version_uri:relations[k].target,
		    							version_slug:relations[k].target.replace(opts.parent, ''),
		    							content:content,
		    							version:version
		    						});
		    						num_relations++;
	    						}
	    					}
	    				}
	    			}
	    			if (num_relations) {
		    			for (var j = opts.data.length-1; j >= 0; j--) {  // Assume that relationships being present means that nodes w/o relations should be removed
		    				if (!opts.data[j].targets.length) {
		    					opts.data.splice(j, 1);
		    				}
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
