isMac = navigator.userAgent.indexOf('Mac OS X') != -1;
(function( $ ) {
	var defaults = {
			parent:$('link#parent').attr('href'),
			anno_icon:$('link#approot').attr('href')+'views/melons/cantaloupe/images/annotate_icon.png',
			type:null,
			orig_type:null,
			changeable:true,
			multiple:false,
			onthefly:false,
			pagination:true,  /* Sorts by slug, not title */
			start:0,
			results_per_page:100,
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
			var mediaType = '';
			if(typeof opts.data['type'] !== 'undefined'){
				mediaType = opts.data['type'];
				delete opts.data['type'];
			}
    	var bootstrap_enabled = (typeof $().modal == 'function');
    	if ('undefined'==typeof(opts.data) || $.isEmptyObject(opts.data)) {
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
				title: mediaType==''?'Media formatting options':mediaType+' media formatting options',
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
		var $media_preview = $('<div class="row selectedItemPreview"><div class="col-xs-3 col-sm-4 col-md-3 left mediaThumbnail"></div><div class="col-xs-9 col-sm-8 col-md-9 right"><strong class="mediaTitle">'+node.title+'</strong><p class="mediaDescription"></p><div class="link"></div></div></div><hr />');
		var thumbnail = undefined;
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
	   	$media_preview.find('.mediaDescription').text($tmp.text());
		}else{
			$media_preview.find('.mediaDescription').remove();
		}
		if(thumbnail!=undefined){
			$media_preview.find('.mediaThumbnail').append('<img class="img-responsive center-block" src="'+thumbnail+'">');
		}else{
			$media_preview.find('.mediaThumbnail').remove();
			$media_preview.find('.right').removeClass('col-sm-8 col-md-9');
		}
		$('<a href="#">Change Selected Media</a>').data('element',opts.element).on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
			var element = $(this).data('element');
			var data = $(element.$).data('selectOptions');
			data.forceSelect = true;
			CKEDITOR._scalar.selectcontent(data);
		}).appendTo($media_preview.find('.right .link'));

		$form.append($media_preview);

		// Add options
			var hasAnnotationOption = opts.data.annotations!=null && typeof opts.data.annotations!=='undefined';

			if(typeof opts.element === 'undefined'){
				opts.element = null;
			}

			for (var option_name in opts.data) {
				if(option_name!='annotations' && option_name!='node'){
					var $option = $('<div class="form-group"><label class="col-sm-3 control-label">'+ucwords(dash_to_space(option_name))+': </label><div class="col-sm-9"><select class="form-control" name="'+option_name+'"></select></div></div>');
					for (var j = 0; j < opts.data[option_name].length; j++) {
						$option.find('select:first').append('<option value="'+opts.data[option_name][j]+'">'+ucwords(dash_to_space(opts.data[option_name][j]))+'</option>');
					}
					$form.append($option);
					if(opts.element != null && opts.element.data(option_name) !== null){
							$option.find('select').first().val(opts.element.data(option_name));
					}
				}
			}
			if(hasAnnotationOption){
				var $annotationSelection = $('<div class="annotationContainer"><div class="bg-info" style="padding:1rem;margin-bottom:1rem">This media has annotations. Select which annotations (if any) you want to be displayed.</div><div class="form-group">'+
																		 		'<label class="col-sm-3 control-label">Annotations: </label>'+
																				'<div class="col-sm-9 annotationSelection"><div class="annotationTableWrapper"><table class="table table-fixed table-striped table-hover"><thead><tr><th class="col-xs-3 text-center">&nbsp;&nbsp;<a href="#" class="annotationSelectionShowAll text-muted"><i class="glyphicon glyphicon-eye-open"></a></th><th class="col-xs-9">Annotation Title</th></tr></thead><tbody></tbody></table></div>'+
																				'</div></div><div class="featuredAnnotation"><div class="form-group"><div class="col-xs-12">Choose an annotation to be highlighted when the page loads, or select \'None\'.</div>'+
																				'<label class="col-sm-3 control-label">Featured Annotation:</label><div class="col-sm-9"><select><option value="none" class="none">None</option></select></div></div>');

        $annotationSelection.find('.annotationSelectionShowAll').on('click', function(e){
					e.preventDefault();
					e.stopPropagation();
					var $featuredAnnotation = $(this).parents('.annotationContainer').find('.featuredAnnotation');
					var $annotationRows = $(this).parents('table').find('tbody tr');
					if($(this).parents('table').find('tbody>tr:not(.info)').length > 0){
						$(this).removeClass('text-muted');
						$annotationRows.addClass('info').find('.glyphicon-eye-close').removeClass('glyphicon-eye-close text-muted').addClass('glyphicon-eye-open');
						$featuredAnnotation.find('option').show().removeProp('disabled');
						$featuredAnnotation.slideDown('fast');
					}else{
						$(this).addClass('text-muted');
						$annotationRows.removeClass('info').find('.glyphicon-eye-open').removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close text-muted');
						$featuredAnnotation.slideUp('fast',function(){$(this).find('option:not(.none)').hide().prop('disabled','disabled');});
					}
				});

				if(opts.node!=null && typeof opts.node !== 'undefined'){
					(function(slug,$annotationSelection,element){
							var handleAnnotations = function(){
								var node = scalarapi.getNode(slug);
								var annotated_by = node.getRelatedNodes('annotation', 'incoming');
								if(annotated_by.length == 0){
									$annotationSelection.find('div.bg-info, .featuredAnnotation').remove();
									$annotationSelection.find('.annotationSelection').html('<p class="text-muted">This media does not contain any annotations.</p>');
									return;
								}
								var $body = $annotationSelection.find('tbody');
								var $featuredAnnotation = $annotationSelection.find('.featuredAnnotation select');
								var $annotations = [];
								for(n in annotated_by){
									var rel = annotated_by[n];
									var title = rel.getDisplayTitle();
									$featuredAnnotation.append('<option style="display: none;" disabled value="'+rel.slug+'">'+title+'</option>');
									$annotations[rel.slug] = $('<tr data-slug="'+rel.slug+'"><td class="col-xs-3 text-center">&nbsp;&nbsp;<a class="annotationSelectionShow"><i class="glyphicon glyphicon-eye-close text-muted"></a></td><td class="col-xs-9 annotationTitle">'+title+'</td></tr>').appendTo($body).on('click', function(){
										var $featuredAnnotation = $(this).parents('.annotationContainer').find('.featuredAnnotation');
										if($(this).hasClass('info')){
											$(this).removeClass('info').find('.glyphicon-eye-open').removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close text-muted');
											$(this).parents('table').find('.annotationSelectionShowAll').addClass('text-muted');
											$thisOption = $featuredAnnotation.find('option[value="'+$(this).data('slug')+'"]');
											if($featuredAnnotation.find('option:not([disabled]):not(".none")').length == 1){
												$featuredAnnotation.slideUp('fast');
											}else{
												var newVal = $featuredAnnotation.find('option:not([disabled]):not(".none")').not($thisOption).first().prop('selected','selected').val();
												$featuredAnnotation.val(newVal).trigger('change');
											}
											$thisOption.hide().prop('disabled','disabled');
										}else{
											$(this).addClass('info').find('.glyphicon-eye-close').removeClass('glyphicon-eye-close text-muted').addClass('glyphicon-eye-open');
											if($(this).siblings('tr:not(.info)').length == 0){
												$(this).parents('table').find('.annotationSelectionShowAll').removeClass('text-muted');
											}
											$thisOption = $featuredAnnotation.find('option[value="'+$(this).data('slug')+'"]');
											$thisOption.show().removeProp('disabled');
											if($featuredAnnotation.find('option:not([disabled]):not(".none")').length == 1){
												$thisOption.prop('selected','selected');
												$featuredAnnotation.val($(this).data('slug'));
												$featuredAnnotation.slideDown('fast');
											}
										}
									});
								}
								if(element!=null && element.getAttribute('resource') == slug){
									if(element.data('annotations') != undefined){
										var previous_annotations = element.data('annotations').split(',');
										if(previous_annotations.length == 1 && previous_annotations[0] == ""){
											previous_annotations = [];
										}
									}else{
										previous_annotations = [];
										$featuredAnnotation.find('option').each(function(){
											if($(this).val() != 'none'){
												previous_annotations.push($(this).val());
											}
										});
									}
									var featuredAnnotation = undefined;
									if(element.getAttribute('href').indexOf('#')>=0){
										var temp_anchor = document.createElement('a');
										temp_anchor.href = opts.element.getAttribute('href');
										featuredAnnotation = temp_anchor.hash.replace('#','');
										if(previous_annotations.indexOf(featuredAnnotation) == -1){
											previous_annotations.push(featuredAnnotation);
										}
									}

									if(previous_annotations.length > 0){
										for(var i in previous_annotations){
											var annotation = previous_annotations[i];
											if(typeof $annotations[annotation] !== 'undefined'){
												$annotations[annotation].addClass('info').find('.glyphicon-eye-close').removeClass('glyphicon-eye-close text-muted').addClass('glyphicon-eye-open');
												if($annotations[annotation].siblings('tr:not(.info)').length == 0){
													$annotations[annotation].parents('table').find('.annotationSelectionShowAll').removeClass('text-muted');
												}
												$thisOption = $featuredAnnotation.find('option[value="'+annotation+'"]');
												$thisOption.show().removeProp('disabled');
											}
										}
										$form.find('.featuredAnnotation').add($featuredAnnotation).show();

										if(featuredAnnotation!=undefined){
											$featuredAnnotation.find('option[value="'+featuredAnnotation+'"]').prop('selected','selected');
											$featuredAnnotation.val(featuredAnnotation);
										}
									}
								}
							}
							scalarapi.loadPage( slug, true, function(){
								handleAnnotations();
							}, null, 1);
					})(opts.node.slug,$annotationSelection,opts.element);

					$form.append($annotationSelection);
				}
			}

	    $this.append('<div class="clearfix visible-xs-block"></div><p class="buttons"><input type="button" class="btn btn-default generic_button" value="Cancel" />&nbsp; <input type="button" class="btn btn-primary generic_button default continueButton" value="Continue" /></p>');
	    $this.find('.close').on('click', function() {
		    	$this.remove();
			});
	    $this.find('.continueButton').on('click', function() {
				var data_fields = {};
				data_fields.node = opts.node
				for (var option_name in opts.data) {
					if(option_name!='annotations' && option_name!='node'){
						data_fields[option_name] = $this.find('select[name="'+option_name+'"] option:selected"').val();
					}
				}
				if($('#bootbox-media-options-content').find('.annotationSelection').length > 0){
					//We have an annotation selector

					var $selectedAnnotations = $('#bootbox-media-options-content').find('.annotationSelection tbody .glyphicon-eye-open').parents('tr');
					var annotations = [];
					for(var i = 0; i < $selectedAnnotations.length; i++){
						annotations.push($selectedAnnotations.eq(i).data('slug'));
					}
					data_fields['annotations'] = annotations.length>0?annotations.join(','):'';
					if($('#bootbox-media-options-content').find('.featuredAnnotation select').val()!='none' && $('#bootbox-media-options-content').find('.featuredAnnotation select').is(':visible')){
						data_fields['featured_annotation'] = $('#bootbox-media-options-content').find('.featuredAnnotation select').val();
					}
				}
				if ($form.closest('.media_options_bootbox').length) {
					$form.closest('.media_options_bootbox').modal( 'hide' ).data( 'bs.modal', null );
				} else {
					$this.remove();
				}
					opts.callback(data_fields);
			});
	};
    $.fn.content_selector = function(options) {  // Content selector box
    	// Options
    	var self = this;
    	var $this = $(this);
    	var opts = $.extend( {}, defaults, options );
    	opts.orig_type = opts.type;
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
    		defaults.orig_type = null;
    		defaults.changeable = true;
    		defaults.multiple = false;
    		defaults.rec = 0;
    		defaults.sq = null;
    		defaults.s_all = null;
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
    	var esearch = function(val) {  // Search via the API
    		var okay_to_search = ['media','file','composite','page','content'];
    		if (opts.orig_type && -1==okay_to_search.indexOf(opts.orig_type)) {
    			alert('Search is not presently supported for the '+opts.orig_type+' type');
    			return;
    		} else if (!opts.orig_type) {
    			opts.type = 'content';
    		} else {
    			opts.type = opts.orig_type;
    		}
    		opts.sq = val;
    		opts.start = 0;
    		$this.find('input[type="radio"]').prop('checked', false);
    		$this.find('.content').off('scroll').scrollTop(0);
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
				if(typeof opts.element != 'undefined'){
					if(typeof opts.element.getAttribute('href') != 'undefined' && opts.element.getAttribute('href')!=null && opts.forceSelect == false){
						var parent = null;

						//Get the slug of the currently selected node
						currentSlug = opts.element.getAttribute('resource');

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
				}

    		$('.content_selector, .bootbox, .modal-backdrop, .tt').remove();
    		$this.addClass('content_selector');
    		$this.addClass( ((bootstrap_enabled)?'bootstrap':'no-bootstrap') );
    		var $wrapper = $('<div class="wrapper"></div>').appendTo($this);
    		// Create the modal
    		if (bootstrap_enabled) {
	    			//$(document).scrollTop(0);  // iOS
					bootbox.hideAll()
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
					$(window).on('resize', function() {
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
    			options_html += '<div class="col-xs-12 col-sm-7"><label class="checkbox-inline"><input type="radio" name="type" value="composite"> Pages</label> <label class="checkbox-inline"><input type="radio" name="type" value="media"> Media</label> <label class="checkbox-inline"><input type="radio" name="type" value="path"> Paths</label> <label class="checkbox-inline"><input type="radio" name="type" value="tag"> Tags</label> <label class="checkbox-inline"><input type="radio" name="type" value="annotation"> Annotations</label> <label class="checkbox-inline"><input type="radio" name="type" value="reply"> Comments</label> <label class="checkbox-inline"><input type="radio" name="type" value="term"> Terms</label></div>';
    		$options.append('<div class="row">'+options_html+'</div>');
    		// Bootstrap positioning
    		if (bootstrap_enabled) {
    			$footer.find('.cancel').hide();  // Remove cancel button
    			modal_height();  // TODO: I can't get rid of the small jump ... for some reason header and footer height isn't what it should be on initial modal_height() call
    		}
    		// Behaviors
    		$footer.hide();  // Default
    		$footer.find('a:first').on('click', function() {  // On-the-fly
    			$footer.hide();
    			var $screen = $('<div class="create_screen"></div>').appendTo($wrapper);
    			var $onthefly = $('<div class="create_onthefly" style="position:absolute;"><div>Clicking "Save and link" will create the new page then establish the selected relationship in the page editor.</div><form class="form-horizontal"></form></div>').appendTo($wrapper);
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
    			$buttons.find('a:first').on('click', function() {
    				onthefly_reset();
    			});
    			$buttons.find('a:last').on('click', function() {
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
    			$screen.closest('.modal-body').scrollTop(500);
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
    		} else {  // User can select a type
    			$options.addClass('changeable');
    			$options.find('input[name="type"]').on('change', function() {
    				var val = $(this).filter(':checked').val();
    				opts.type = val;
    				opts.sq = null;
    				opts.start = 0;
    				$this.find('.content').off('scroll').scrollTop(0);
    				go();
    			});
    		}
			$options.on('submit', function() {  // Search
				$options.find('input[name="type"]').prop('checked',false);
				esearch($(this).find('input[type="text"]').val());
				return false;
			});
    		if (opts.multiple) {  // Can choose multiple rows
    			$footer.show();
					$footer.find('label').show();  // Check all
					$footer.find('input[type="checkbox"]:first').on('click', function() {
						var active = $(this).data('active');
						$wrapper.find('input[type="checkbox"]').each(function() {
     					var $this = $(this);
     					if (active && $this.is(':checked')) $this.closest('tr').trigger('click');
     					if (!active && !$this.is(':checked')) $this.closest('tr').trigger('click');
     				});
						$(this).data('active', ((active)?false:true));
					});
        		$footer.find('a').eq(1).on('click', function() {  // Cancel button
        			if ($(this).closest('.content_selector_bootbox').length) {
        				$(this).closest('.content_selector_bootbox').modal( 'hide' ).data( 'bs.modal', null );
        			}
        			reset();
        			$(this).closest('.content_selector').remove();
        			$('.tt').remove();
        		});
    			$footer.find('div:last').append('<a href="javascript:void(null);" class="btn btn-primary btn-sm generic_button default">Add Selected</a>');
    			$footer.find('a:last').on('click', function() {
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
				if(typeof opts.element != 'undefined' && typeof opts.element.getAttribute('href') != 'undefined' && opts.element.getAttribute('href')!=null){
					currentSlug = opts.element.getAttribute('resource');
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
    			if (opts.data.length) {
	    			var $loadmore = $('<tr><td class="loadmore" colspan="'+($this.find('th').length)+'">Loading more content ...</td></tr>').appendTo($tbody);
	    			$loadmore.appendTo($tbody);
	    			$loadmore.hide();
		    		$this.find('.content').off('scroll').on('scroll', function() {
		    			if ($loadmore.find('td').hasClass('loading')) return;
		    			$loadmore.show();
		    			var $this = $(this);
		    			if (Math.ceil($this.innerHeight() + $this.scrollTop()) < Math.floor($this[0].scrollHeight)) return;
		    			$loadmore.find('td').addClass('loading');
		    			opts.start = opts.start + opts.results_per_page;
		    			go();
		    		});
    			};
    		};
    		$this.find('tr').find('a').off('click').on('click', function(event) {  // Preview|Visit button
    			event.stopPropagation();
    			return true;
    		});
    		$this.find('tr').find('input[type="checkbox"]').off('click').on('click', function(event) {  // Clicking a <tr> checks the checkbox; this allows it to work properly if checkbox itself is checked
    			var $this = $(this);
    			var checked = $this.is(":checked");
    			$this.prop('checked', ((checked)?false:true));
    			return true;
    		});
    		if (!opts.multiple) {  // Select a single row
    			$this.find('tr').off('click').on('click', function() {
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
    			$this.find('tr').off('click').on('click', function() {
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
    		$('.thumb').parent().off('mouseover').on('mouseover', function() {  // Expand thumbnail
    			var $this = $(this).children('.thumb:first');
    			var offset = $this.offset();
    			var $div = $('<div class="tt"></div>');
    			$div.css('left', parseInt(offset.left) + parseInt($this.outerWidth()) + 10);
    			$div.css('top', offset.top);
    			$('<img src="'+$this.attr('src')+'" />').appendTo($div);
    			$div.appendTo('body');
    			$this.parent().on('mouseout', function() {
    				$div.remove();
    			});
    		});
    		$('.anno').parent().off('mouseover').on('mouseover', function() {  // Show item that is annotated
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
    			$this.parent().on('mouseout', function() {
    				$div.remove();
    			});
    		});
    		if ('undefined'!=typeof($loadmore)) $loadmore.hide();
    	};
    	var go = function() {
    		opts.data = [];
    		if (!opts.start) $this.find('.content').html('<div class="loading">Loading ...</div>');
			$this.find('.footer').find('input[type="checkbox"]:first').data('active',false).prop('checked',false);  // Check all
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
	    		propagate();
	    	});
    	};
    	init();
    	if (opts.type) go();
    };
		$.fn.widget_selector = function(options){
			var self = this;
    	var $this = $(this);
			var opts = options;
			var loaded_nodeLists = {};

			var isEdit = opts.isEdit;

			if(typeof isEdit == "undefined" || isEdit == null || !isEdit){
				isEdit = false;
			}

			var parent_url = $('link#parent').attr('href');

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

			var load_node_list = function(type,promise){
				if(typeof loaded_nodeLists[type]!=="undefined"){
					promise.resolve();
				}else{
					var url = parent_url+'rdf/instancesof/'+type+'?format=json&rec=0&ref=0';
					$.getJSON(url, function(){}).always(function(_data) {
		    		if ('undefined'!=typeof(_data.status)) {
		    			alert('There was a problem trying to get a list of content: '+_data.status+' '+_data.statusText+'. Please try again.');
		    			return;
		    		}
		    		loaded_nodeLists[type] = [];
		    		for (var uri in _data) {
		    			if ('undefined'!=typeof(_data[uri]['http://purl.org/dc/terms/hasVersion'])) {

								var item = {};
		    				item.uri = uri;
		    				item.slug = uri.replace(parent_url, '');
		    				item.version_uri = _data[uri]['http://purl.org/dc/terms/hasVersion'][0].value;
		    				item.version_slug = item.version_uri.replace(parent_url, '');
		    				item.content = _data[uri];
		    				item.version = _data[ item.version_uri ];
		    				item.title = ('undefined'!=typeof(item.version["http://purl.org/dc/terms/title"])) ? item.version["http://purl.org/dc/terms/title"][0].value : '';
		    				item.targets = [];

		    				loaded_nodeLists[type].push(item);
		    			}
		    		}
						promise.resolve();
		    	});
				}
			}

			var get_config_description_for_widget_type = function(widget_type) {
				result = "content";
				switch (widget_type) {
					case "timeline":
					case "map":
					result = "data source";
					break;
					case "visualization":
					result = "options";
					break;
				}
				return result;
			}

			var mini_node_selector = function(target, types, allowMultiple, isEdit, element){
				if(typeof types == 'undefined'){
					types = ['composite','media','path','tag','annotation','comment','term'];
				}

				if(typeof allowMultiple == "undefined" || allowMultiple == null){
					allowMultiple = false;
				}

				if(typeof isEdit == "undefined" || isEdit == null || !isEdit){
					isEdit = false;
				}

				var content_selector_html = '<div class="node_selector_body"><div class="type_selector pull-right">Filter by type: &nbsp;<select class="node_selection_type_filter">';

				for(var t in types){

					if(types[t] == 'composite'){
						var type_display_name = 'Pages';
					}else{
						var type_display_name = types[t].charAt(0).toUpperCase() + types[t].slice(1);
						if(type_display_name!='Media'){
							type_display_name+='s';
						}
					}

					content_selector_html += '<option value="'+types[t]+'">'+type_display_name+'</option>';
				}

				content_selector_html+='</select></div></div>';


				var $wrapper = $(content_selector_html);

				if(types.length == 1){
					$wrapper.find('.type_selector').hide();
				}

				var $header = $('<table class="widget_target_node_selector table table-fixed"></table>').appendTo($wrapper);
				var $thead = $('<thead><tr><th class="col-xs-3">Title</th><th class="col-xs-4">Description</th><th class="col-xs-2">URL</th><th class="col-xs-2"></th><th class="col-xs-1"></th></tr></thead>').appendTo($header);
				var $scrollContainer = $('<div class="content_selector_scroll"></div>').appendTo($wrapper);
				var $selector = $('<table class="widget_target_node_selector table table-fixed"></table>').appendTo($scrollContainer);
				var $tbody = $('<tbody></tbody>').appendTo($selector);

				var selectedNodes = [];

				if(allowMultiple){
					$wrapper.prepend('<div><small class="multipleNodesText text-danger"><strong>Please select at least one item for this widget.</strong></small></div>');
				}

				$wrapper.find('.node_selection_type_filter').on('change', function(){
					var promise = jQuery.Deferred();
					jQuery.when(promise).then(function(){
						if(typeof selectedNodes == "undefined" || selectedNodes == null){
							selectedNodes = [];
						}
						var data = loaded_nodeLists[$wrapper.find('.node_selection_type_filter').val()];
						if(data.length == 0){
							$tbody.html('<tr><td colspan="5" class="text-center empty">There are no items of the selected type.</td></tr>');
						}else{
							$tbody.html('');
							for(var i = 0; i < data.length; i++){
								var item = data[i];
								var desc = ('undefined'!=typeof(item.version['http://purl.org/dc/terms/description'])) ? item.version['http://purl.org/dc/terms/description'][0].value : '<em>No description</em>';
								var $item = $('<tr><td class="col-xs-3">'+item.title+'</td><td class="col-xs-4">'+desc+'</td><td class="col-xs-2">.../'+item.slug+'</td><td class="text-center col-xs-2"><a href="'+item.uri+'" target="_blank">Preview</a></td><td class="text-center col-xs-1"><i class="glyphicon glyphicon-unchecked"></td></tr>').appendTo($tbody).on('click', function(e){
									if(!allowMultiple){
											if($(this).hasClass('bg-info') && (!allowMultiple || selectedNodes.length == 1)){
											  $(this).removeClass('bg-info').find('.glyphicon-check').removeClass('glyphicon-check').addClass('glyphicon-unchecked');
												if(allowMultiple){
													selectedNodes = [];
												}
											}else{
												$(this).addClass('bg-info').find('.glyphicon-unchecked').removeClass('glyphicon-unchecked').addClass('glyphicon-check');
												selectedNodes = [$(this).data('slug')];
											}
											$(this).siblings('.bg-info').removeClass('bg-info').find('.glyphicon-check').removeClass('glyphicon-check').addClass('glyphicon-unchecked');
									}else{
										var index = selectedNodes.indexOf($(this).data('slug'));
										if(index == -1){
											selectedNodes.push($(this).data('slug'));
											$(this).addClass('bg-info').find('.glyphicon-unchecked').removeClass('glyphicon-unchecked').addClass('glyphicon-check');
										}else{
											selectedNodes.splice(index, 1);
											$(this).removeClass('bg-info').find('.glyphicon-check').removeClass('glyphicon-check').addClass('glyphicon-unchecked');
										}
									}
									var $wrapper = $(this).parents('.node_selector_body');
									$wrapper.data('selectedNodes',selectedNodes);

									if(allowMultiple){
										if(selectedNodes.length > 0){
											$wrapper.find('.multipleNodesText').html('You currently have <strong>'+selectedNodes.length+'</strong> node'+(selectedNodes.length>1?'s':'')+' selected.').removeClass('text-danger');
										}else{
											$wrapper.find('.multipleNodesText').html('<strong>Please select at least one item for this widget.</strong>').addClass('text-danger');
										}
									}

								}).data('slug',item.slug);

								if(selectedNodes.indexOf(item.slug) != -1){
									$item.addClass('bg-info').find('.glyphicon-unchecked').removeClass('glyphicon-unchecked').addClass('glyphicon-check');
								}
							}
						}
					});

					load_node_list($(this).val(),promise);
				});

				//Prepopulate if is an edit.
				if(isEdit){
					$el = $(element.$);
					if($el.attr("resource")!=undefined){
						selectedNodes = [$el.attr("resource")];
					}else if($el.data("nodes")!=undefined){
						selectedNodes = $el.data("nodes").split(",");
					}
					if(typeof selectedNodes != "undefined" && selectedNodes != null && selectedNodes.length > 0){
						if(allowMultiple){
							$wrapper.find('.multipleNodesText').html('You currently have <strong>'+selectedNodes.length+'</strong> node'+(selectedNodes.length>1?'s':'')+' selected.').removeClass('text-danger');
						}
						$tbody.find('tr').each(function(){

							var index = selectedNodes.indexOf($(this).data('slug'));
							if(index == -1){
								$(this).addClass('bg-info').find('.glyphicon-unchecked').removeClass('glyphicon-unchecked').addClass('glyphicon-check');
							}else{
								$(this).removeClass('bg-info').find('.glyphicon-check').removeClass('glyphicon-check').addClass('glyphicon-unchecked');
							}
						});
					}
				}

				$wrapper.data('selectedNodes',selectedNodes).find('.node_selection_type_filter').trigger('change');
				target.append($wrapper);
			}
			var select_widget_options = function(widget_type,isEdit){
				if(typeof isEdit == "undefined" || isEdit == null){
					isEdit = false;
					element = null;
				}else{
					element = opts.element;
				}
				$('#bootbox-content-selector-content').find('.widgetList').fadeOut('fast',function(){
					var $content = $('<div class="widgetOptions"></div>').appendTo('#bootbox-content-selector-content');
					var submitAction = function(e){
						e.preventDefault();
						e.stopPropagation();
					};
					switch(widget_type){

						case 'timeline': //Timeline.js

							 if(isEdit){
								 timeline_data_type = $(element.$).data("timeline")==undefined?"node":"url";
							 }else{
								 timeline_data_type = "node";
							 }

							 var $modeSelector = $('<select><option value="node">Scalar Content</option><option value="url">External URL</option></select').appendTo($content).on('change', function(e){
								 if($(this).val() == "node"){
									 timeline_data_type = "node";
									 $nodeTimeline.show();
									 $urlTimeline.hide();
								 }else{
									 timeline_data_type = "url";
									 $urlTimeline.show();
									 $nodeTimeline.hide();
								 }
							 });

							 $content.append('<br />');

 							 $nodeTimeline = $('<div id="timeline_data_node"></div>').appendTo($content);
							 $urlTimeline = $('<div id="timeline_data_url"></div>').appendTo($content);

							 $modeSelector.find('option[value="'+timeline_data_type+'"]').attr('selected','true').val(timeline_data_type);

							 if(timeline_data_type == "node"){
								 $nodeTimeline.show();
								 $urlTimeline.hide();
							 }else{
								 $urlTimeline.show();
								 $nodeTimeline.hide();
							 }

							 $('<div class="widget_data_type">Choose any Scalar item whose contents include <a target="_blank" href="#">temporal metadata</a>.</div><br />').appendTo($nodeTimeline);
							 mini_node_selector($('<div class="node_selection timeline_node_selection">').appendTo($nodeTimeline),['path','tag','term'],false,isEdit,element);

							 $('<div class="widget_data_type">Enter the URL of a JSON file or Google Drive document formatted for <a target="_blank" href="https://timeline.knightlab.com">Timeline.js</a>.</div><br />').appendTo($urlTimeline);
							 $('<div class="timeline_external_url_selector form-group"><label for="timeline_external_url">External URL</label><input type="text" class="form-control" id="timeline_external_url"></div>').appendTo($urlTimeline);

							 if(isEdit){
								 if($(element.$).data("timeline")!=undefined){
									 $urlTimeline.find('.timeline_external_url_selector .form-control').val($(element.$).data("timeline"));
								 }
							 }

							 submitAction = function(e){
								 var data = {type:"timeline",attrs : {}};
								 data.isEdit = $(this).data('isEdit');
								 data.attrs["data-widget"] = data.type;
								 if(timeline_data_type == 'node'){
									 data.attrs.resource = $('#bootbox-content-selector-content .timeline_node_selection .node_selector_body').data('selectedNodes');
									 console.log(data.attrs.resource);
									 if(data.attrs.resource == undefined || data.attrs.resource.length == 0){
										 alert("Please select Scalar content that contains your timeline's temporal data.");
										 return false;
									 }else{
										 data.attrs.resource = data.attrs.resource[0];
									 }
								 }else{
									 data.attrs['data-timeline'] = $('#bootbox-content-selector-content .timeline_external_url_selector input').val();
									 if(data.attrs['data-timeline'] == undefined || data.attrs['data-timeline'] == ''){
										 alert("Please enter the URL of a JSON file or Google Drive document formatted for Timeline.js.");
										 return false;
									 }
								 }
								 select_widget_formatting(data)
								 e.preventDefault();
								 e.stopPropagation();
							 }
							 break;
						 case 'visualization':
							 var select = '<select class="form-control" name="viscontent"><option value="all">All content</option><option value="toc">Table of contents</option><option value="page">All pages</option><option value="path">All paths</option><option value="tag">All tags</option><option value="annotation">All annotations</option><option value="media">All media</option><option value="comment">All comments</option><option value="current">This page</option></select>';
							 $('<div class="form-group row"><label class="col-sm-4 col-sm-offset-1 control-label">What content would you like to include?</label><div class="col-sm-6">'+select+'</div></div>').appendTo($content);

							 select = '<select class="form-control" name="visrelations"><option value="all">All relationships</option><option value="parents-children">Parents and children</option><option value="none">No relationships</option></select>';
						 	 $('<br /><br /><div class="form-group row"><label class="col-sm-4 col-sm-offset-1 control-label">What relationships would you like to visualize?</label><div class="col-sm-6">'+select+'</div></div>').appendTo($content);

							 select = '<select class="form-control" name="visformat"><option value="grid">Grid</option><option value="tree">Tree</option><option value="radial">Radial</option><option value="force-directed">Force-directed</option></select>';
						 	 $('<br /><br /><div class="form-group row"><label class="col-sm-4 col-sm-offset-1 control-label">What type of visualization would you like to use?</label><div class="col-sm-6">'+select+'</div></div>').appendTo($content);

 							 if(isEdit){
								 if($(element.$).data("viscontent")!=undefined){
									 $content.find('select[name="viscontent"]').val($(element.$).data("viscontent"));
 								 }
								 if($(element.$).data("visrelations")!=undefined){
									 $content.find('select[name="visrelations"]').val($(element.$).data("visrelations"));
 								 }
								 if($(element.$).data("visformat")!=undefined){
									 $content.find('select[name="visformat"]').val($(element.$).data("visformat"));
 								 }
 							 }

							 submitAction = function(e){
								 var data = {type:"visualization",attrs : {}};
								 data.isEdit = $(this).data('isEdit');
								 var $content = $('#bootbox-content-selector-content div.widgetOptions');
								 data.attrs = {
									 "data-widget" : data.type,
									 "data-viscontent" : $content.find('select[name="viscontent"]').val(),
									 "data-visrelations" : $content.find('select[name="visrelations"]').val(),
									 "data-visformat" : $content.find('select[name="visformat"]').val(),
								 };
								 select_widget_formatting(data)
								 e.preventDefault();
								 e.stopPropagation();
							 }
							 break;
						 case 'map':
							 $('<div>Choose any <a target="_blank" href="#">geotagged</a> Scalar item (including paths or tags with geotagged contents).</div>').appendTo($content);
							 mini_node_selector($('<div class="map_node_selection">').appendTo($content),['path','tag','term'],false,isEdit,element);

 							 submitAction = function(e){
 								 var data = {type:"map",attrs : {}};
 								 data.attrs["data-widget"] = data.type;
								 data.isEdit = $(this).data('isEdit');

								 data.attrs.resource = $('#bootbox-content-selector-content .map_node_selection .node_selector_body').data('selectedNodes');
								 if(data.attrs.resource == undefined || data.attrs.resource.length == 0){
									 alert("Please select a geotagged Scalar item.");
									 return false;
								 }else{
									 console.log(data.attrs.resource);
									 data.attrs.resource = data.attrs.resource[0];
								 }

 								 select_widget_formatting(data)
 								 e.preventDefault();
 								 e.stopPropagation();
 							 }
							 break;
						 case 'carousel':
							 if(isEdit){
								 carousel_data_type = $(element.$).data("nodes")==undefined?"single":"multi";
							 }else{
								 carousel_data_type = "single";
							 }

							 var $modeSelector = $('<select><option value="single">Media container</option><option value="multi">Individual media items</option></select').appendTo($content).on('change', function(e){
								 if($(this).val() == "single"){
									 carousel_data_type = "single";
									 $singleCarousel.show();
									 $multiCarousel.hide();
								 }else{
									 carousel_data_type = "multi";
									 $multiCarousel.show();
									 $singleCarousel.hide();
								 }
							 });

							 $content.append('<br />');

							 $singleCarousel = $('<div id="carousel_data_single"></div>').appendTo($content);
							 $multiCarousel = $('<div id="carousel_data_multi"></div>').appendTo($content);

							 $modeSelector.find('option[value="'+carousel_data_type+'"]').attr('selected','true').val(carousel_data_type);

							 if(carousel_data_type == "single"){
								 $singleCarousel.show();
								 $multiCarousel.hide();
							 }else{
								 $multiCarousel.show();
								 $singleCarousel.hide();
							 }

							 $('<div class="widget_data_type">Choose any path or tag that contains media.</div>').appendTo($singleCarousel);
							 mini_node_selector($('<div class="carousel_single_selection">').appendTo($singleCarousel),['path','tag','term'],false,isEdit,element);

							 $('<div class="widget_data_type">Select one or more pieces of media.</div>').appendTo($multiCarousel);
							 mini_node_selector($('<div class="carousel_multi_selection"></div>').appendTo($multiCarousel),['media'], true,isEdit,element);

							 submitAction = function(e){
								 var data = {type:"carousel",attrs : {}};
								 data.attrs["data-widget"] = data.type;
								 data.isEdit = $(this).data('isEdit');
								 if(carousel_data_type == 'single'){

									 data.attrs.resource = $('#bootbox-content-selector-content .carousel_single_selection .node_selector_body').data('selectedNodes');
									 if(data.attrs.resource == undefined || data.attrs.resource.length == 0){
										 alert("Please select a path or tag that contains media.");
										 return false;
									 }else{
										 data.attrs.resource = data.attrs.resource[0];
									 }

								 }else{
									 data.attrs["data-nodes"] = $('#bootbox-content-selector-content .carousel_multi_selection .node_selector_body').data('selectedNodes').join();
									 if(data.attrs["data-nodes"] == ''){
										 alert("Please select at least one media item for your carousel widget.");
										 return false;
									 }
								 }
								 select_widget_formatting(data);
								 e.preventDefault();
								 e.stopPropagation();
							 }
							 break;
						 case 'card':
							 if(isEdit){
								 card_data_type = $(element.$).data("nodes")==undefined?"single":"multi";
							 }else{
								 card_data_type = "single";
							 }

							 var $modeSelector = $('<select><option value="single">Container</option><option value="multi">Individual media items</option></select').appendTo($content).on('change', function(e){
								 if($(this).val() == "single"){
									 card_data_type = "single";
									 $singleCard.show();
									 $multiCard.hide();
								 }else{
									 card_data_type = "multi";
									 $multiCard.show();
									 $singleCard.hide();
								 }
							 });

							 $content.append('<br />');

							 $singleCard = $('<div id="card_data_single"></div>').appendTo($content);
							 $multiCard = $('<div id="card_data_multi"></div>').appendTo($content);

							 $modeSelector.find('option[value="'+card_data_type+'"]').attr('selected','true').val(card_data_type);

							 if(card_data_type == "single"){
								 $singleCard.show();
								 $multiCard.hide();
							 }else{
								 $multiCard.show();
								 $singleCard.hide();
							 }

							 $('<div class="widget_data_type">Choose any path or tag to show its contents as cards.</div>').appendTo($singleCard);
							 mini_node_selector($('<div class="card_single_selection">').appendTo($singleCard),['path','tag','annotation','term']);


							 $('<div class="widget_data_type">Select one or more items to be shown as cards.</div>').appendTo($multiCard);
							 mini_node_selector($('<div class="card_multi_selection"></div>').appendTo($multiCard),['composite','media','path','tag','comment','term'], true,isEdit,element);

							 submitAction = function(e){
								 var data = {type:"card",attrs : {}};
								 data.attrs["data-widget"] = data.type;
								 data.isEdit = $(this).data('isEdit');
								 if(card_data_type == 'single'){

									 data.attrs.resource = $('#bootbox-content-selector-content .card_single_selection .node_selector_body').data('selectedNodes');
									 if(data.attrs.resource == undefined || data.attrs.resource.length == 0){
										 alert("Please select a path or tag.");
										 return false;
									 }else{
										 data.attrs.resource = data.attrs.resource[0];
									 }

								 }else{
									 data.attrs["data-nodes"] = $('#bootbox-content-selector-content .card_multi_selection .node_selector_body').data('selectedNodes').join();
									 if(data.attrs["data-nodes"] == ''){
										 alert("Please select at least one item for your card widget.");
										 return false;
									 }
								 }
								 select_widget_formatting(data);
								 e.preventDefault();
								 e.stopPropagation();
							 }
							 break;
						 case 'summary':
							 if(isEdit){
								 summary_data_type = $(element.$).data("nodes")==undefined?"single":"multi";
							 }else{
								 summary_data_type = "single";
							 }

							 var $modeSelector = $('<select><option value="single">Container</option><option value="multi">Individual media items</option></select').appendTo($content).on('change', function(e){
								 if($(this).val() == "single"){
									 summary_data_type = "single";
									 $singleSummary.show();
									 $multiSummary.hide();
								 }else{
									 summary_data_type = "multi";
									 $multiSummary.show();
									 $singleSummary.hide();
								 }
							 });

							 $content.append('<br />');

							 $singleSummary = $('<div id="summary_data_single"></div>').appendTo($content);
							 $multiSummary = $('<div id="summary_data_multi"></div>').appendTo($content);

							 $modeSelector.find('option[value="'+summary_data_type+'"]').attr('selected','true').val(summary_data_type);

							 if(summary_data_type == "single"){
								 $singleSummary.show();
								 $multiSummary.hide();
							 }else{
								 $multiSummary.show();
								 $singlesummary.hide();
							 }

							 $('<div class="widget_data_type">Choose any path or tag to show its contents in the summary.</div>').appendTo($singleSummary);
							 mini_node_selector($('<div class="summary_single_selection">').appendTo($singleSummary),['path','tag','term']);

							 $('<div class="widget_data_type">Select one or more items to be shown in the summary.</div>').appendTo($multiSummary);
							 mini_node_selector($('<div class="summary_multi_selection"></div>').appendTo($multiSummary),['composite','media','path','tag','comment','term'], true);

							 submitAction = function(e){
								 var data = {type:"summary",attrs : {}};
								 data.isEdit = $(this).data('isEdit');
								 data.attrs["data-widget"] = data.type;
								 if(summary_data_type == 'single'){
									 data.attrs.resource = $('#bootbox-content-selector-content .summary_single_selection tbody tr.bg-info').data('slug');
									 if(data.attrs.resource == undefined || data.attrs.resource.length == 0){
										 alert("Please select a path or tag.");
										 return false;
									 }
								 }else{
									 data.attrs["data-nodes"] = $('#bootbox-content-selector-content .summary_multi_selection .node_selector_body').data('selectedNodes').join();
									 if(data.attrs["data-nodes"] == ''){
										 alert("Please select at least one item for your summary widget.");
										 return false;
									 }
								 }
								 select_widget_formatting(data);
								 e.preventDefault();
								 e.stopPropagation();
							 }
							 break;
					}
					$('.bootbox').find( '.modal-title' ).fadeOut('fast',function(){$(this).text('Select '+widget_type+' '+get_config_description_for_widget_type(widget_type)).fadeIn('fast');});

					$content.append('<hr />');
					$('<a class="btn btn-default">&laquo; Back<a>').appendTo($content).on('click', function(){
					 $('#bootbox-content-selector-content').find('.widgetOptions').fadeOut('fast',function(){
						 $(this).remove();
						 $('.bootbox').find( '.modal-title' ).fadeOut('fast',function(){$(this).text('Select a widget').fadeIn('fast');});
						 $('#bootbox-content-selector-content').find('.widgetList').fadeIn('fast');
					 });
					})
					$('<a class="btn btn-primary pull-right">Continue to formatting</a>').appendTo($content).on('click', submitAction).data("isEdit",isEdit);
					$content.append('<div class="clearfix"></div>');
				});
			}
			var select_widget_formatting = function(options){
				var isEdit = options.isEdit;

				if(typeof isEdit == "undefined" || isEdit == null || !isEdit){
					isEdit = false;
				}

				$('#bootbox-content-selector-content').find('.widgetOptions').fadeOut('fast',function(){
					$('.bootbox').find( '.modal-title' ).fadeOut('fast',function(){$(this).text('Choose formatting').fadeIn('fast');});
					var submitAction = function(e){
						e.preventDefault();
						e.stopPropagation();
						var widget = {attrs:$('#bootbox-content-selector-content').find('.widgetFormatting').data('options').attrs,isEdit:opts.isEdit};
						$('#bootbox-content-selector-content').find('.widgetFormatting select').each(function(){
							if($(this).attr('name')=="caption"){
								widget.attrs['data-caption'] = $(this).val().toLowerCase().replace(/ /g,"_");
								if($(this).val()=='Custom Text'){
									widget.attrs['data-custom_caption'] = $('#bootbox-content-selector-content').find('#caption_text').val();
								}
							}else if($(this).attr('name')=="numbering"){
								if($(this).val()=='Hide Slide Numbers'){
									widget.attrs['data-hide_numbering'] = true;
								}
							}else{
								widget.attrs['data-'+$(this).attr('name')] = $(this).val();
							}
						});
						opts.callback(widget,opts.element);
						bootbox.hideAll();
					};

					var formattingOptions = {
						Size : ['small','medium','large','full'],
						Align : (typeof opts.inline!='undefined' && opts.inline)?['left','center','right']:['left','right'],
						Caption : ['Description','Title','Title and Description','None','Custom Text']
					};

					if(typeof options.attrs.resource == 'undefined' || options.attrs.resource == null){
							formattingOptions.Caption = ['None','Custom Text'];
					}

					//Need to limit formatting options per widget type here
					switch(options.type){
						case 'timeline':
						case 'visualization':
						case 'carousel':
							formattingOptions.Size = ['medium','large','full'];
					}

					if(options.type == "carousel"){
						formattingOptions.Numbering = ["Show Slide Numbers","Hide Slide Numbers"]
					}

					if(options.type == "visualization" && options.attrs['data-visformat']=='radial'){
						formattingOptions.Size = ['full'];
					}

					var formattingSelection = '<div class="form-horizontal heading_font">';
					for(var o in formattingOptions){
						var values = '<select class="form-control" name="'+o.toLowerCase()+'">';
						for(var v in formattingOptions[o]){
							values += '<option value="'+formattingOptions[o][v]+'">'+formattingOptions[o][v].charAt(0).toUpperCase()+formattingOptions[o][v].slice(1)+'</option>';
						}
						values += '</select>';

						formattingSelection += '<div class="form-group"><label class="col-sm-2 col-sm-offset-2 control-label">'+o+':</label><div class="col-sm-6">'+values+'</div></div>';
						if(o=="Caption"){
							formattingSelection += '<div class="form-group" id="caption_text_group" style="display: none;"><label class="col-sm-4 control-label">Custom Caption:</label><div class="col-sm-6"><input class="form-control" type="text" id="caption_text"></input></div></div>';
						}
					}
					formattingSelection += '</div>';

					var $content = $('<div class="widgetFormatting"></div>').appendTo('#bootbox-content-selector-content').data('options',options);
					$content.append(formattingSelection);

					$content.find('.form-control[name="caption"]').on('change', function(){
						if($(this).val()=='Custom Text'){
							$content.find('#caption_text_group').show();
						}else{
							$content.find('#caption_text_group').hide();
						}
					});

					$('<a class="btn btn-default">&laquo; Back<a>').appendTo($content).on('click', function(){
					 $('#bootbox-content-selector-content').find('.widgetFormatting').fadeOut('fast',function(){
						 $(this).remove();
						 $('.bootbox').find( '.modal-title' ).fadeOut('fast',function(){$(this).text('Select '+options.type+' '+get_config_description_for_widget_type(options.type)).fadeIn('fast');});
						 $('#bootbox-content-selector-content').find('.widgetOptions').fadeIn('fast');
					 });
					})
					$('<a class="btn btn-primary pull-right">Insert '+options.type+' widget</a>').appendTo($content).on('click', submitAction);
					$content.append('<div class="clearfix"></div>');
					if(isEdit){
						$('#bootbox-content-selector-content').find('.widgetFormatting select').each(function(){
							var data = $(opts.element.$).data($(this).attr('name'));
							if(data!=undefined){
								$(this).val(data);
							}
						});
					}
				});
			};
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

			bootbox.hideAll()
			var box = bootbox.dialog({
				message: '<div id="bootbox-content-selector-content" class="heading_font"></div>',
				title: 'Select a widget',
				className: 'widget_selector_bootbox',
				animate: true  // This must remain true for iOS, otherwise the wysiwyg selection goes away
			});
			$('.bootbox').find( '.modal-title' ).addClass( 'heading_font' );

			$this.appendTo($('#bootbox-content-selector-content'));
			var $widget_selector_bootbox = $('.widget_selector_bootbox');
			$widget_selector_bootbox.find('.modal-dialog').width('60%').css('margin-left','20%').css('margin-right','20%');
			var $options = $widget_selector_bootbox.find('.options:first');
			$('.bootbox-close-button').empty();
			box.on("shown.bs.modal", function() {
				modal_height();
			});
			$(window).on('resize', function() {
				modal_height();
			});
			box.on("hidden.bs.modal", function() {
				reset();
			});

			var $widgets = $('<div class="widgetList"></div>');

			var icon_base_url = $('link#approot').attr('href')+'views/melons/cantaloupe/images/';
			var widget_types = [
				{
					name : "Timeline",
					description : "Temporal view built with metadata from a Scalar path or a remote document (uses Timeline.js).",
					icon : "widget_image_timeline.png"
				},
				{
					name : "Visualization",
					description : "Various visualizations of Scalar pages, media, and their relationships.",
					icon : "widget_image_visualization.png"
				},
				{
					name : "Map",
					description : "Geographic view that plots geotagged Scalar content on a map (uses Google Maps).",
					icon : "widget_image_map.png"
				},
				{
					name : "Carousel",
					description : "Responsive gallery that allows users to flip through a path's media.",
					icon : "widget_image_carousel.png"
				},
				{
					name : "Card",
					description : "Informational cards showing thumbnails, titles, and descriptions for one or more pieces of Scalar content.",
					icon : "widget_image_card.png"
				},
				{
					name : "Summary",
					description : "Rows of thumbnails, titles, and descriptions for one or more pieces of Scalar content.",
					icon : "widget_image_summary.png"
				}
			];

			for(var i = 0; i < widget_types.length; i++){
				var widget = widget_types[i];
				var $widget = $('<div class="widget_type"><img class="pull-left" src="'+icon_base_url+widget.icon+'"><a class="uppercase"><strong>'+widget.name+'</strong></a><br />'+widget.description+'</div>').data('type',widget.name);
				$widget.on('click', function(e){
					select_widget_options($(this).data('type').toLowerCase(),false);
					e.preventDefault();
					e.stopPropagation();
					return false;
				});

				$widget.appendTo($widgets);

				if(i < widget_types.length-1){
					$widgets.append('<hr />');
				}else{
					$widgets.append('<br />');
				}
			}
			$this.append($widgets);
			if(isEdit){
				select_widget_options($(options.element.$).data('widget'),true);
				$('#bootbox-content-selector-content').find('.widgetList').hide();
			}
		}
}( jQuery ));
