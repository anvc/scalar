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
			resultsPerPage:100,
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
    	var sentenceCase = function(str){
    		return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
    	}
    	var dash_to_space = function(str) {
    		return str.replace(/-/g, ' ');
    	}
		// Create the modal
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
		$('<a href="#">Change Selected Media</a>').data('element',opts.element).click(function(e){
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
			if(opts.element.data('text-wrap')){
				opts.element.data('text-wrap',null);
			}
			var text_wrap = false;
			if(opts.element.hasClass('wrap')){
				text_wrap = true;
			}
			for (var option_name in opts.data) {
				if(option_name!='annotations' && option_name!='node'){
					var $option = $('<div class="form-group"><label class="col-sm-3 control-label">'+ucwords(dash_to_space(option_name))+': </label><div class="col-sm-9"><select class="form-control" name="'+option_name+'"></select></div></div>');
					for (var j = 0; j < opts.data[option_name].length; j++) {

						$option.find('select:first').append('<option value="'+opts.data[option_name][j]+'">'+(option_name=='text-wrap'?sentenceCase(dash_to_space(opts.data[option_name][j])):ucwords(dash_to_space(opts.data[option_name][j])))+'</option>');
					}
					$form.append($option);
					if(option_name=='text-wrap'){
						$option.find('select').change(function(){
							if($(this).val()=="wrap-text-around-media"){
								$('select[name="align"] option[value="center"]').hide().prop('disabled',true);
								if($('select[name="align"]').val() == "center"){
									$('select[name="align"]').val("left");
								}
							}else{
								$('select[name="align"] option[value="center"]').show().prop('disabled',false);
							}
						});
						if(text_wrap){
							$option.find('select').val('wrap-text-around-media');
						}
					}else if(opts.element != null && opts.element.data(option_name) !== null){
						$option.find('select').first().val(opts.element.data(option_name));
					}
				}
			}
			if(text_wrap){
				if($('select[name="align"]').val() == "center"){
					$('select[name="align"]').val("left");
				}
				$('select[name="align"] option[value="center"]').hide();
			}
			if(hasAnnotationOption){
				var $annotationSelection = $('<div class="annotationContainer"><div class="bg-info" style="padding:1rem;margin-bottom:1rem">This media has annotations. Select which annotations (if any) you want to be displayed.</div><div class="form-group">'+
																		 		'<label class="col-sm-3 control-label">Annotations: </label>'+
																				'<div class="col-sm-9 annotationSelection"><div class="annotationTableWrapper"><table class="table table-fixed table-striped table-hover"><thead><tr><th class="col-xs-3 text-center">&nbsp;&nbsp;<a href="#" class="annotationSelectionShowAll text-muted"><i class="glyphicon glyphicon-eye-open"></a></th><th class="col-xs-9">Annotation Title</th></tr></thead><tbody></tbody></table></div>'+
																				'</div></div><div class="featuredAnnotation"><div class="form-group"><div class="col-xs-12">Choose an annotation to be highlighted when the page loads, or select \'None\'.</div>'+
																				'<label class="col-sm-3 control-label">Featured Annotation:</label><div class="col-sm-9"><select><option value="none" class="none">None</option></select></div></div>');

        $annotationSelection.find('.annotationSelectionShowAll').click(function(e){
					e.preventDefault();
					e.stopPropagation();
					var $featuredAnnotation = $(this).parents('.annotationContainer').find('.featuredAnnotation');
					var $annotationRows = $(this).parents('table').find('tbody tr');
					if($(this).parents('table').find('tbody>tr:not(.info)').length > 0){
						$(this).removeClass('text-muted');
						$annotationRows.addClass('info').find('.glyphicon-eye-close').removeClass('glyphicon-eye-close text-muted').addClass('glyphicon-eye-open');
						$featuredAnnotation.find('option').show().prop('disabled',false);
						$featuredAnnotation.slideDown('fast');
					}else{
						$(this).addClass('text-muted');
						$annotationRows.removeClass('info').find('.glyphicon-eye-open').removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close text-muted');
						$featuredAnnotation.slideUp('fast',function(){$(this).find('option:not(.none)').hide().prop('disabled',true);});
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
									$annotations[rel.slug] = $('<tr data-slug="'+rel.slug+'"><td class="col-xs-3 text-center">&nbsp;&nbsp;<a class="annotationSelectionShow"><i class="glyphicon glyphicon-eye-close text-muted"></a></td><td class="col-xs-9 annotationTitle">'+title+'</td></tr>').appendTo($body).click(function(){
										var $featuredAnnotation = $(this).parents('.annotationContainer').find('.featuredAnnotation');
										if($(this).hasClass('info')){
											$(this).removeClass('info').find('.glyphicon-eye-open').removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close text-muted');
											$(this).parents('table').find('.annotationSelectionShowAll').addClass('text-muted');
											$thisOption = $featuredAnnotation.find('option[value="'+$(this).data('slug')+'"]');
											if($featuredAnnotation.find('option:not([disabled]):not(".none")').length == 1){
												$featuredAnnotation.slideUp('fast');
											}else{
												var newVal = $featuredAnnotation.find('option:not([disabled]):not(".none")').not($thisOption).first().prop('selected','selected').val();
												$featuredAnnotation.val(newVal).change();
											}
											$thisOption.hide().prop('disabled',true);
										}else{
											$(this).addClass('info').find('.glyphicon-eye-close').removeClass('glyphicon-eye-close text-muted').addClass('glyphicon-eye-open');
											if($(this).siblings('tr:not(.info)').length == 0){
												$(this).parents('table').find('.annotationSelectionShowAll').removeClass('text-muted');
											}
											$thisOption = $featuredAnnotation.find('option[value="'+$(this).data('slug')+'"]');
											$thisOption.show().prop('disabled',false);
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
												$thisOption.show().prop('disabled',false);
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
	    $this.find('.close').click(function() {
		    	$this.remove();
			});
	    $this.find('.continueButton').click(function() {
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
    			get_vars.results = opts.resultsPerPage;
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
    		$this.find('.content').unbind('scroll').scrollTop(0);
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
				var $body = $content_selector_bootbox.find('.modal-body');
				var bodyPadding = $body.outerHeight()-$body.height();
	    	var window_height = parseInt($(window).height());
	    	var val = window_height - head - foot - (margin*2) - bodyPadding;
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
    		var $wrapper = $('<div class="wrapper"></div>').appendTo($this);
    		// Create the modal
    		//$(document).scrollTop(0);  // iOS
				bootbox.hideAll()
				var box = bootbox.dialog({
					message: '<div id="bootbox-content-selector-content" class="heading_font"></div>',
					title: 'Select content',
					className: 'content_selector_bootbox',
					animate: true  // This must remain true for iOS, otherwise the wysiwyg selection goes away
				});
				$('.bootbox').find( '.modal-title' ).addClass( 'heading_font' );
    		// Default content
    		var $content = $('<div class="content"></div>').appendTo($wrapper);
				var $selector = $('<div class="selector" style="height: 100%; width: 100%;"></div>').appendTo($content)
				 var options = {};
				//  if(isEdit){
				// 	 var $el = $(element.$);
				// 	 if($el.attr("resource")!=undefined){
 			// 			opts.selected = [$el.attr("resource")];
 			// 		 }else if($el.data("nodes")!=undefined){
 			// 			opts.selected = $el.data("nodes").split(",");
 			// 		 }
				//  }
				 options.resultsPerPage = opts.resultsPerPage;
				 options.allowMultiple = opts.multiple;
				 options.allowChildren = false;
					if(!opts.multiple){
						options.onChangeCallback = $.proxy(function(box,opts){
							if(("undefined" !== typeof $(this).find('.node_selector').data('nodes') && $(this).find('.node_selector').data('nodes').length > 0)){
								opts.callback($(this).find('.node_selector').data('nodes')[0],opts.element);
								box.modal('hide');
							}
						},$selector,box,opts);
					}
				 if("undefined" !== typeof opts.type && opts.type!=null){
					 if($.isArray(opts.type)){
						 options.types = opts.type;
					 	 options.defaultType = opts.type[0];
					 }else{
						 options.types = [opts.type];
					 	 options.defaultType = opts.type;
					 }
				 }

				var $content_selector_bootbox = $('.content_selector_bootbox');
				$this.appendTo($('#bootbox-content-selector-content'))

				$content_selector_bootbox.find('.modal-dialog').width('auto').css('margin-left','20px').css('margin-right','20px');
				$('.bootbox-close-button').empty();
				$(window).resize(function() {
					modal_height();
				});
				box.on("hidden.bs.modal", function() {
					reset();
				});
				$selector.node_selection_dialogue(options);
    		// Footer buttons
    		var $footer = $('<div class="footer"><div><a href="javascript:void(null);" class="btn btn-default btn-sm generic_button">Create page on-the-fly</a> &nbsp; &nbsp;</div><div><a href="javascript:void(null);" class="cancel btn btn-default btn-sm generic_button">Cancel</a></div></div>').appendTo($wrapper);

    		// Bootstrap positioning
  			$footer.find('.cancel').hide();  // Remove cancel button
  			modal_height();  // TODO: I can't get rid of the small jump ... for some reason header and footer height isn't what it should be on initial modal_height() call
    		// Behaviors
    		$footer.hide();  // Default
    		$footer.find('a:first').click(function() {  // On-the-fly
    			$footer.hide();
					$content.hide();
    			var $onthefly = $('<div class="create_onthefly"><div>Clicking "Save and link" will create the new page then establish the selected relationship in the page editor.</div><form class="form-horizontal"></form></div>').appendTo($wrapper);
					var $buttons = $('<div class="footer onthefly_buttons"><div class="buttons"><span class="onthefly_loading">Loading...</span>&nbsp; <a href="javascript:void(null);" class="btn btn-default btn-sm generic_button">Cancel</a>&nbsp; <a href="javascript:void(null);" class="btn btn-primary btn-sm generic_button default">Save and link</a></div></div>').appendTo($wrapper);
    			//$('<div class="heading_font title">Create new page</div>').insertBefore($options);
    			//$options.hide();
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
    			var onthefly_reset = function() {
    				$wrapper.find('.create_onthefly').remove();
						$buttons.remove();
    				//$options.parent().find('.title').remove();
    				//$options.show();
    				$footer.show();
						$content.show();
    			};
    			if ('undefined'==typeof(book_urn)) {
    				alert('Could not determine book URN and therefore can not create pages on-the-fly');
    				onthefly_reset();
    				return;
    			}
    			$buttons.find('a:first').click(function() {
    				onthefly_reset();
    			});
    		});  // /On-the-fly
    		if (opts.onthefly) {  // Display on-the-fly
    			$footer.show();
    		} else {
    			$footer.find('a:first').hide();
    		}
			if (opts.multiple) {
				$footer.show();
				$footer.find('div:last').append('<a href="javascript:void(null);" class="btn btn-primary btn-sm generic_button default">Add Selected</a>');
				$footer.find('a:last').click($.proxy(function(box,opts){
					if(("undefined" !== typeof $(this).find('.node_selector').data('nodes') && $(this).find('.node_selector').data('nodes').length > 0)){
						var nodes = [];
						var selected_nodes = $(this).find('.node_selector').data('nodes');
						for(node in selected_nodes){
							nodes.push(selected_nodes[node]);
						}
						opts.callback(nodes,opts.element);
						box.modal('hide');
					 }
				 },$selector,box,opts));
			}
    	};
    	// Propagate the interface
		init();
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

			var modal_height = function() {
    		var $widget_selector_bootbox = $('.widget_selector_bootbox');
    		if (!$widget_selector_bootbox.length||!$widget_selector_bootbox.find('.widgetOptions').is(':visible')) return;
    		var margin = parseInt($widget_selector_bootbox.find('.modal-dialog').css('marginTop'));
    		var head = parseInt( $widget_selector_bootbox.find('.modal-header').outerHeight() );
    		if (head < 60) head = 60;  // Magic number
	    	var window_height = parseInt($(window).height());
	    	var val = window_height - head - (margin*2);
				val -= $widget_selector_bootbox.find('.modal-body').outerHeight()-$widget_selector_bootbox.find('.node_selection').outerHeight();
				$widget_selector_bootbox.find('.node_selection').height(val).trigger('doResize');
    	};

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

							 var $timeline_content = $('<ul class="nav nav-tabs" role="tablist"> \
							 														<li role="presentation" class="active"> \
																						<a href="#scalarContent" aria-controls="home" role="tab" data-toggle="tab" data-type="node">Scalar Content</a> \
																					</li> \
																					<li role="presentation"> \
																						<a href="#externalURL" aria-controls="profile" role="tab" data-toggle="tab" data-type="url">External URL</a> \
																					</li> \
																				</ul> \
																				<div class="tab-content"> \
																					<div role="tabpanel" class="tab-pane active" id="scalarContent"></div> \
																					<div role="tabpanel" class="tab-pane" id="externalURL"></div> \
	  																		</div>').appendTo($content);

 							 $nodeTimeline = $timeline_content.find('#scalarContent');
							 $urlTimeline = $timeline_content.find('#externalURL');

								$timeline_content.find('a').click(function (e) {
								  e.preventDefault();
									timeline_data_type = $(this).data('type');
								  $(this).tab('show');
								});
								$timeline_content.find('a[data-type="'+timeline_data_type+'"]').click();

							 $('<div class="widget_data_type">Choose any Scalar item whose contents include <a target="_blank" href="#">temporal metadata</a>.</div>').appendTo($nodeTimeline);

							 var opts = {};
							 if(isEdit){
								 var $el = $(element.$);
								 if($el.attr("resource")!=undefined){
			 						opts.selected = [$el.attr("resource")];
			 					 }else if($el.data("nodes")!=undefined){
			 						opts.selected = $el.data("nodes").split(",");
			 					 }
							 }
							 opts.allowMultiple = true;
							 opts.fields = ["title","description","url","preview","include_children"],
							 opts.allowChildren = true;
							 opts.types = ['composite','media','path','tag','term','reply'];
							 opts.defaultType = 'composite';

							 $('<div class="node_selection timeline_node_selection">').appendTo($nodeTimeline).node_selection_dialogue(opts);

							 $('<div class="widget_data_type">Enter the URL of a JSON file or Google Drive document formatted for <a target="_blank" href="https://timeline.knightlab.com">Timeline.js</a>.</div>').appendTo($urlTimeline);
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
									 var nodes = $('#bootbox-content-selector-content .timeline_node_selection').data('serialize_nodes')();
									 data.attrs['data-nodes'] = nodes;
									 if(data.attrs['data-nodes'] == undefined || data.attrs['data-nodes'].length == 0){
										 alert("Please select Scalar content that contains your timeline's temporal data.");
										 return false;
									 }
	 								 select_widget_formatting(data)
								 }else{
									 data.attrs['data-timeline'] = $('#bootbox-content-selector-content .timeline_external_url_selector input').val();
									 if(data.attrs['data-timeline'] == undefined || data.attrs['data-timeline'] == ''){
										 alert("Please enter the URL of a JSON file or Google Drive document formatted for Timeline.js.");
										 return false;
									 }
									 select_widget_formatting(data);
								 }

								 e.preventDefault();
								 e.stopPropagation();
							 }
							 break;
						 case 'visualization':
							 var select = '<select class="form-control" name="viscontent"><option value="all">All content</option><option value="toc">Table of contents</option><option value="page">All pages</option><option value="path">All paths</option><option value="tag">All tags</option><option value="annotation">All annotations</option><option value="media">All media</option><option value="comment">All comments</option><option value="current">This page</option></select>';
							 $('<div class="form-group row"><label class="text-right col-sm-4 col-sm-offset-2 control-label">What content would you like to include?</label><div class="col-sm-6">'+select+'</div></div>').appendTo($content);

							 select = '<select class="form-control" name="visrelations"><option value="all">All relationships</option><option value="parents-children">Parents and children</option><option value="none">No relationships</option></select>';
						 	 $('<div class="form-group row"><label class="text-right col-sm-4 col-sm-offset-2 control-label">What relationships would you like to visualize?</label><div class="col-sm-6">'+select+'</div></div>').appendTo($content);

							 select = '<select class="form-control" name="visformat"><option value="grid">Grid</option><option value="tree">Tree</option><option value="radial">Radial</option><option value="force-directed">Force-directed</option></select>';
						 	 $('<div class="form-group row"><label class="text-right col-sm-4 col-sm-offset-2 control-label">What type of visualization would you like to use?</label><div class="col-sm-6">'+select+'</div></div>').appendTo($content);

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
							 $('<div class="widget_data_type">Choose any <a target="_blank" href="#">geotagged</a> Scalar items (including paths or tags with geotagged contents).</div>').appendTo($content);

							 var opts = {};
							 if(isEdit){
								 var $el = $(element.$);
								 if($el.attr("resource")!=undefined){
			 						opts.selected = [$el.attr("resource")];
			 					 }else if($el.data("nodes")!=undefined){
			 						opts.selected = $el.data("nodes").split(",");
			 					 }
							 }
							 opts.allowMultiple = true;
							 opts.allowChildren = true;
							 opts.fields = ["title","description","url","preview","include_children"];
							 opts.types = ['composite','media','path','tag','term','reply'];
							 opts.defaultType = 'composite';

							 $('<div class="node_selection map_node_selection">').appendTo($content).node_selection_dialogue(opts);

 							 submitAction = function(e){
 								 var data = {type:"map",attrs : {}};
 								 data.attrs["data-widget"] = data.type;
								 data.isEdit = $(this).data('isEdit');

								 data.attrs['data-nodes'] = $('#bootbox-content-selector-content .map_node_selection').data('serialize_nodes')();
								 if(data.attrs['data-nodes'] == undefined || data.attrs['data-nodes'].length == 0){
									 alert("Please select at least one geotagged Scalar item.");
									 return false;
								 }

 								 select_widget_formatting(data);
 								 e.preventDefault();
 								 e.stopPropagation();
 							 }
							 break;
						 case 'carousel':
							 $multiCarousel = $('<div id="carousel_data_multi"></div>').appendTo($content);

							 $('<div class="widget_data_type">Choose any paths or tags that contain media or individual pieces of media</div>').appendTo($multiCarousel);
							 var opts = {};
							 if(isEdit){
								 var $el = $(element.$);
								 if($el.attr("resource")!=undefined){
			 						opts.selected = [$el.attr("resource")];
			 					 }else if($el.data("nodes")!=undefined){
			 						opts.selected = $el.data("nodes").split(",");
			 					 }
							 }
							 opts.allowMultiple = true;
							 opts.allowChildren = true;
							 opts.fields = ["thumbnail","title","description","url","preview","include_children"];
							 opts.types = ['path','tag','term','media'];
							 opts.defaultType = 'path';

							 $('<div class="node_selection carousel_multi_selection">').appendTo($multiCarousel).node_selection_dialogue(opts);

							 submitAction = function(e){
								 var data = {type:"carousel",attrs : {}};
								 data.attrs["data-widget"] = data.type;
								 data.isEdit = $(this).data('isEdit');
								 data.attrs["data-nodes"] = $('#bootbox-content-selector-content .carousel_multi_selection').data('serialize_nodes')();
								 if(data.attrs["data-nodes"] == ''){
									 alert("Please select at least one media item for your carousel widget.");
									 return false;
								 }
								 var nodeList = $('#bootbox-content-selector-content .carousel_multi_selection .node_selector').data('nodes');
								 if(nodeList.length > 1){
									 order_nodes(data,nodeList);
								 }else{
									select_widget_formatting(data)
								 }
								 e.preventDefault();
								 e.stopPropagation();
							 }
							 break;
						 case 'card':
						 	 $multiCard = $('<div id="card_data_multi"></div>').appendTo($content);
							 $('<div class="widget_data_type">Choose paths or tags to show their contents as cards or select individual pages to show.</div>').appendTo($multiCard);

							 var opts = {};
							 if(isEdit){
								 var $el = $(element.$);
								 if($el.attr("resource")!=undefined){
									opts.selected = [$el.attr("resource")];
								 }else if($el.data("nodes")!=undefined){
									opts.selected = $el.data("nodes").split(",");
								 }
							 }
							 opts.allowMultiple = true;
							 opts.allowChildren = true;
							 opts.fields = ["thumbnail","title","description","url","preview","include_children"];
							 opts.types = ['composite','media','path','tag','term','reply'];
							 opts.defaultType = 'composite';

							 $('<div class="node_selection card_multi_selection">').appendTo($multiCard).node_selection_dialogue(opts);

							 submitAction = function(e){
								 var data = {type:"card",attrs : {}};
								 data.attrs["data-widget"] = data.type;
								 data.isEdit = $(this).data('isEdit');
								 data.attrs["data-nodes"] = $('#bootbox-content-selector-content .card_multi_selection').data('serialize_nodes')();
								 if(data.attrs["data-nodes"] == ''){
									 alert("Please select at least one item for your card widget.");
									 return false;
								 }
								 var nodeList = $('#bootbox-content-selector-content .card_multi_selection .node_selector').data('nodes');
								 if(nodeList.length > 1){
									 order_nodes(data,nodeList);
								 }else{
									select_widget_formatting(data)
								 }
								 e.preventDefault();
								 e.stopPropagation();
							 }
							 break;
						 case 'summary':
							 $multiSummary = $('<div id="summary_data_multi"></div>').appendTo($content);
							 $('<div class="widget_data_type">Select one or more items to be shown in the summary.</div>').appendTo($multiSummary);
							 var opts = {};
							 if(isEdit){
								 var $el = $(element.$);
								 if($el.attr("resource")!=undefined){
									opts.selected = [$el.attr("resource")];
								 }else if($el.data("nodes")!=undefined){
									opts.selected = $el.data("nodes").split(",");
								 }
							 }
							 opts.allowMultiple = true;
							 opts.allowChildren = true;
							 opts.fields = ["thumbnail","title","description","url","preview","include_children"];
							 opts.types = ['composite','media','path','tag','term','reply'];
							 opts.defaultType = 'composite';

							 $('<div class="node_selection summary_multi_selection">').appendTo($multiSummary).node_selection_dialogue(opts);

							 submitAction = function(e){
								 var data = {type:"summary",attrs : {}};
								 data.isEdit = $(this).data('isEdit');
								 data.attrs["data-widget"] = data.type;
								 data.attrs["data-nodes"] = $('#bootbox-content-selector-content .summary_multi_selection').data('serialize_nodes')();
								 if(data.attrs["data-nodes"] == ''){
									 alert("Please select at least one item for your summary widget.");
									 return false;
								 }
								 var nodeList = $('#bootbox-content-selector-content .summary_multi_selection .node_selector').data('nodes');
								 if(nodeList.length > 1){
									 order_nodes(data,nodeList);
								 }else{
									select_widget_formatting(data)
								 }
								 e.preventDefault();
								 e.stopPropagation();
							 }
							 break;
					}
					$('.bootbox').find( '.modal-title' ).fadeOut('fast',function(){$(this).text('Select '+widget_type+' '+get_config_description_for_widget_type(widget_type)).fadeIn('fast');});
					$footer = $('<div class="modal_footer"></div>').appendTo($content);
					$('<a class="btn btn-default">&laquo; Back<a>').appendTo($footer).click(function(){
					 $('#bootbox-content-selector-content').find('.widgetOptions').fadeOut('fast',function(){
						 $(this).remove();
						 $('.bootbox').find( '.modal-title' ).fadeOut('fast',function(){$(this).text('Select a widget').fadeIn('fast');});
						 $('#bootbox-content-selector-content').find('.widgetList').fadeIn('fast');
					 });
					})
					$('<a class="btn btn-primary pull-right">Continue</a>').appendTo($footer).click(submitAction).data("isEdit",isEdit);
					$content.append('<div class="clearfix"></div>');
					modal_height();
				});
			}
			var order_nodes = function(options,nodeList){
				$('#bootbox-content-selector-content').find('.widgetOptions').fadeOut('fast',function(){
					$('.bootbox').find( '.modal-title' ).fadeOut('fast',function(){$(this).text('Reorder selected pages').fadeIn('fast');});
					var submitAction = function(e){
						e.preventDefault();
						e.stopPropagation();
						var nodeList = [];
						$('.nodeOrdering .nodeItem').each(function(){
							var slug = $(this).data('slug')+($(this).find('.selectedNodeChildrenList').length>0?'*':'');
							nodeList.push(slug);
						});
						options.attrs['data-nodes'] = nodeList.join(',');
						select_widget_formatting(options);
						return false;
					};

					var $nodes = $('<div class="btn-group-vertical" role="group" aria-label=""></div>');

					for(var n in nodeList){
						var node = nodeList[n];
						var $node = $('<div class="btn btn-default nodeItem"><span class="glyphicon glyphicon-menu-hamburger" aria-hidden="true"></span> &nbsp; '+node.title+'</div>').data('slug',node.slug);
						if(typeof node.include_children !== 'undefined' && node.include_children){
							$node.append('<div class="selectedNodeChildrenList text-muted">Includes children:</div>');
							$childList = $('<ul></ul>').appendTo($node.find('.selectedNodeChildrenList'));
							for(var t in node.targets){
								$childList.append('<li><small>'+node.targets[t].target.current.title+'</small></li>');
							}
						}
						$nodes.append($node);
					}

					var $content = $('<div class="nodeOrdering"><div class="widget_data_type">If you would like to reorder the selected content for this widget, you may do so by clicking and dragging. When you are satisfied with the order, click "Continue" below.</div></div>').appendTo('#bootbox-content-selector-content').data('options',options).hide();

					$nodes.appendTo($content).sortable();
					$nodes.sortable('enable');
					$nodes.sortable({
				  		scroll:false,
				  		placeholder: "sortable-destination",
				  		helper:'clone',
						appendTo:'.widget_selector_bootbox'
				  	});

					$footer = $('<div class="modal_footer"></div>').appendTo($content);
					$('<a class="btn btn-default">&laquo; Back<a>').appendTo($footer).click(function(){
					 $('#bootbox-content-selector-content').find('.nodeOrdering').fadeOut('fast',function(){
						 $(this).remove();
						 $('.bootbox').find( '.modal-title' ).fadeOut('fast',function(){$(this).text('Select '+options.type+' '+get_config_description_for_widget_type(options.type)).fadeIn('fast');});
						 $('#bootbox-content-selector-content').find('.widgetOptions').fadeIn('fast',function(){
							 modal_height();
						 });
					 });
				  });
					$('<a class="btn btn-primary pull-right">Continue</a>').appendTo($footer).click(submitAction);
					$content.append('<div class="clearfix"></div>');
					window.setTimeout($.proxy(function(){$(this).fadeIn(200);},$content),200);
				});
			}
			var select_widget_formatting = function(options){
				var isEdit = options.isEdit;

				if(typeof isEdit == "undefined" || isEdit == null || !isEdit){
					isEdit = false;
				}
				$previous_page = $('#bootbox-content-selector-content').find('.nodeOrdering').length > 0?$('#bootbox-content-selector-content').find('.nodeOrdering'):$('#bootbox-content-selector-content').find('.widgetOptions');
				$previous_page.fadeOut('fast',function(){
					$('.bootbox').find( '.modal-title' ).fadeOut('fast',function(){$(this).text('Choose formatting').fadeIn('fast');});
					var submitAction = function(e){
						e.preventDefault();
						e.stopPropagation();
						var widget = {attrs:$('#bootbox-content-selector-content').find('.widgetFormatting').data('options').attrs,isEdit:opts.isEdit};
						$('#bootbox-content-selector-content').find('.widgetFormatting select').each(function(){
							if($(this).attr('name')=="caption"){
								widget.attrs['data-caption'] = $(this).val();
								if($(this).val()=='custom_text'){
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
						Size : ['Small','Medium','Large','Full'],
						TextWrap : ['Create New Line for Widget','Wrap Text Around Widget'],
						Align : (typeof opts.inline!='undefined' && opts.inline)?['Right','Center','Left']:['Right','Left'],
						Caption : ['Description','Title','Title and Description','None','Custom Text']
					};

					if((typeof options.attrs.resource == 'undefined' || options.attrs.resource == null) && (typeof options.attrs['data-nodes'] == 'undefined' || options.attrs['data-nodes'].indexOf(',')>=0)){
							formattingOptions.Caption = ['None','Custom Text'];
					}

					//Need to limit formatting options per widget type here
					switch(options.type){
						case 'timeline':
						case 'visualization':
						case 'carousel':
							formattingOptions.Size = ['Medium','Large','Full'];
					}

					if(options.type == "carousel"){
						formattingOptions.Numbering = ["Show Slide Numbers","Hide Slide Numbers"]
					}

					if(options.type == "card"){
						formattingOptions.Size = ['Small','Medium'];
					}

					if(options.type == "summary"){
						formattingOptions.Size = ['Medium','Large','Full'];
					}

					if(options.type == "visualization" && options.attrs['data-visformat']=='radial'){
						formattingOptions.Size = ['Full'];
					}

					var formattingSelection = '<div class="form-horizontal heading_font">';
					for(var o in formattingOptions){

						if(o == "TextWrap" && typeof opts.inline!=='undefined' && opts.inline){
							var values = '<select class="form-control" name="textwrap"><option value="nowrap">Create New Line for Widget</option><option value="wrap">Wrap Text Around Widget</option></select>';
							formattingSelection += '<div class="form-group"><label class="col-sm-2 col-sm-offset-3 control-label">Text Wrap:</label><div class="col-sm-5">'+values+'</div></div>';
						}else{
							var values = '<select class="form-control" name="'+o.toLowerCase()+'">';
							for(var v in formattingOptions[o]){
								values += '<option value="'+formattingOptions[o][v].toLowerCase().replace(/ /g,"_")+'">'+formattingOptions[o][v]+'</option>';
							}
							values += '</select>';

							formattingSelection += '<div class="form-group"><label class="col-sm-2 col-sm-offset-3 control-label">'+o+':</label><div class="col-sm-5">'+values+'</div></div>';
							if(o=="Caption"){
								formattingSelection += '<div class="form-group" id="caption_text_group" style="display: none;"><label class="col-sm-4 control-label">Custom Caption:</label><div class="col-sm-6"><input class="form-control" type="text" id="caption_text"></input></div></div>';
							}
						}
					}
					formattingSelection += '</div>';
					var $content = $('<div class="widgetFormatting"></div>').appendTo('#bootbox-content-selector-content').data('options',options).hide();
					$content.append(formattingSelection);

					$content.find('.form-control[name="caption"]').change(function(){
						if($(this).val()=='custom_text'){
							$content.find('#caption_text_group').show();
						}else{
							$content.find('#caption_text_group').hide();
						}
					});

					$content.find('.form-control[name="textwrap"]').change(function(){
						if($(this).val()=='wrap'){

							if($content.find('select[name="align"]').val() == "center"){
								$content.find('select[name="align"]').val("left");
							}
							$content.find('select[name="align"] option[value="center"]').hide();
						}else{
							$content.find('select[name="align"] option[value="center"]').show();
						}
					});

					$footer = $('<div class="modal_footer"></div>').appendTo($content);
					$('<a class="btn btn-default">&laquo; Back<a>').appendTo($footer).click(function(){
					 $('#bootbox-content-selector-content').find('.widgetFormatting').fadeOut('fast',function(){
						 $(this).remove();
						 if($('#bootbox-content-selector-content').find('.nodeOrdering').length > 0){
							 $('.bootbox').find( '.modal-title' ).fadeOut('fast',function(){$(this).text('Reorder selected pages').fadeIn('fast');});
							 $('#bootbox-content-selector-content').find('.nodeOrdering').fadeIn('fast');
						 }else{
							 $('.bootbox').find( '.modal-title' ).fadeOut('fast',function(){$(this).text('Select '+options.type+' '+get_config_description_for_widget_type(options.type)).fadeIn('fast');});
							 $('#bootbox-content-selector-content').find('.widgetOptions').fadeIn('fast',function(){
								 modal_height();
							 });
						 }
					 });
					})
					$('<a class="btn btn-primary pull-right">Insert '+options.type+' widget</a>').appendTo($footer).click(submitAction);
					$content.append('<div class="clearfix"></div>');
					window.setTimeout($.proxy(function(){$(this).fadeIn(200);},$content),200);
					if(isEdit){
						$('#bootbox-content-selector-content').find('.widgetFormatting select').each(function(){
							if($(this).attr('name')=='textwrap'){
								if(opts.element.hasClass('wrap')){
									$(this).val('wrap');
									$content.find('select[name="align"] option[value="center"]').hide();
								}
							}else{
								var data = $(opts.element.$).data($(this).attr('name'));
								if(data!=undefined){
									$(this).val(data);
									if(data=='custom_text'){
										$content.find('#caption_text_group').show().find('input').val($(opts.element.$).data('custom_caption'));
									}
								}
							}
						});
					}
				});
			};

			bootbox.hideAll()
			var box = bootbox.dialog({
				message: '<div id="bootbox-content-selector-content" class="heading_font"></div>',
				title: 'Select a widget',
				className: 'widget_selector_bootbox',
				size: 'large',
				animate: true  // This must remain true for iOS, otherwise the wysiwyg selection goes away
			});

			$(box).find('.modal-dialog').width('auto').css('margin-left','20px').css('margin-right','20px');

			$('.bootbox').find( '.modal-title' ).addClass( 'heading_font' );

			$this.appendTo($('#bootbox-content-selector-content'));
			var $widget_selector_bootbox = $('.widget_selector_bootbox');
			var $options = $widget_selector_bootbox.find('.options:first');
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
				$widget.click(function(e){
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

		$.fn.node_selection_dialogue = function(options){

			var self = this;
			var $this = $(this);

			var parent_url = $('link#parent').attr('href');

			var loaded_nodeLists = {};
			var search_results = [];
			var lastLoadType = "init";
			var lastLoadCriteria = {};
			var lastPage = false;
			var isset = function(x){ return typeof x !== 'undefined' && x !== null; };
			var toProperCase = function (x) { return x.replace(/\w\S*/g, function(x){return x.charAt(0).toUpperCase() + x.substr(1).toLowerCase();}); }

			var load_node_list = function(options){
				lastLoadCriteria = options;
				var doSearch = false;
				var type = options.type;
				if("undefined" !== typeof options.search && options.search !== null){
					doSearch = true;
					var search = options.search;
					if(options.page == 0){
						search_results = [];
					}
				}
				var ref = options.ref;
				var rec = options.rec;
				var promise = options.promise;
				var url = parent_url+'rdf/instancesof/'+type+'?format=json&rec='+rec+'&ref='+ref+'&start='+(options.page*opts.resultsPerPage)+"&results="+opts.resultsPerPage;
				if ('undefined'!=typeof(opts.fields) && -1 != opts.fields.indexOf('last_edited_by')) {
					url += '&prov=1';
				}
				if ('undefined'!=typeof(opts.fields) && -1 != opts.fields.indexOf('edit')) {
					url += '&hidden=1';
				}
				if(doSearch){
					url += "&sq="+search;
				}
				if(!doSearch && typeof loaded_nodeLists[type]!=="undefined" && options.page == 0){
					promise.resolve();
				}else{
					$.getJSON(url, function(){}).always(function(_data) {
						$this.data('_data',_data);
						if ('undefined'!=typeof(_data.status)) {
							alert('There was a problem trying to get a list of content: '+_data.status+' '+_data.statusText+'. Please try again.');
							return;
						}
						if(!doSearch && options.page == 0){
							loaded_nodeLists[type] = [];
						}
						rel_filter_match = false;
						for (var uri in _data) {
							//First just go through and pick out any of the URN entries

							if(uri.indexOf('urn:scalar:'+type)>-1){
								var body = _data[uri]['http://www.openannotation.org/ns/hasBody'][0]['value'].split('#')[0];
								body = body.substr(0, body.lastIndexOf('.'));
								_data[body].matchesFilter = true;
								rel_filter_match = true;
							}
							if(uri.indexOf('urn:scalar:')>-1 && uri.indexOf('urn:scalar:term') == -1){
								var body = _data[uri]['http://www.openannotation.org/ns/hasBody'][0]['value'].split('#')[0];
								body = body.substr(0, body.lastIndexOf('.'));
								var target = _data[uri]['http://www.openannotation.org/ns/hasTarget'][0]['value'].split('#')[0];
								target = target.substr(0, target.lastIndexOf('.'));
								if("undefined" === typeof _data[body].rel){
										_data[body].rel = [];
								}

								var version = _data[ _data[target]['http://purl.org/dc/terms/hasVersion'][0].value ];

								_data[target].target = {current:{title:('undefined'!==typeof(version["http://purl.org/dc/terms/title"])) ? version["http://purl.org/dc/terms/title"][0].value : ''}};
								_data[body].rel.push(_data[target]);
								have_relationships = true;
							}
						}

						//From  previous content selector: if we have relationships, then assume we only want nodes w/ relationships
						if(type != 'composite' && rel_filter_match){
							for (var uri in _data) {
								if ('undefined'!=typeof(_data[uri]['http://purl.org/dc/terms/hasVersion']) && "undefined" == typeof _data[uri].matchesFilter) {
									_data[uri]['http://purl.org/dc/terms/hasVersion'] = undefined;
								}
							}
						}

						var added_rows = 0;
			    		for (var uri in _data) {
			    			if ('undefined'!=typeof(_data[uri]['http://purl.org/dc/terms/hasVersion'])) {
									var item = {};
			    				item.uri = uri;
			    				item.slug = uri.replace(parent_url, '');
			    				item.version_uri = _data[uri]['http://purl.org/dc/terms/hasVersion'][0].value;
			    				item.version_slug = item.version_uri.replace(parent_url, '');
			    				item.content = _data[uri];
			    				item.version = _data[ item.version_uri ];
			    				item.title = ('undefined'!==typeof(item.version["http://purl.org/dc/terms/title"])) ? item.version["http://purl.org/dc/terms/title"][0].value : '';
			    				item.targets = 'undefined'!==typeof _data[uri].rel ? _data[uri].rel : [];
									if('undefined' !== typeof item.content['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail']){
										item.thumbnail = item.content['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'][0]['value'];
									}else{
										item.thumbnail = $('link#approot').attr('href')+'/views/widgets/ckeditor/plugins/scalar/styles/missingThumbnail.png';
									}

									item.hasRelations = 'undefined' !== typeof item.content.rel;

									if(doSearch){
										search_results.push(item);
									}else{
			    					loaded_nodeLists[type].push(item);
									}
									added_rows++;
			    			}
			    		}
						lastPage = added_rows == 0;
						promise.resolve();
					});
				}
			}
			var fieldWidths = {
				thumbnail : 1,
				title : 2,
				description : 'auto',
				url : 2,
				preview : 2,
				include_children : 2,
				visible : 1,
				last_edited_by : 2,
				date : 2,
				versions : 1,
				edit : 1
			}
			var defaultCallback = function(){};
			var opts = {
				"fields" : ["thumbnail","title","description","url","preview"],
				"allowMultiple" : false,
				"rec" : 1,
				"ref" : 0,
				"defaultType" : 'content',
				"types" : ['composite','media','path','tag','annotation','reply','term'],
				"resultsPerPage" : 50,
				"allowChildren" : false,
				"selected" : [],
				"onChangeCallback" : defaultCallback,
				"deleteOptions" : false,
				"addOptions" : false,
				"rowSelectMethod" : 'checkbox'  /* checkbox|highlight */
			};

			$.extend(opts, options);

			var current_type = opts.defaultType;

			var init_promise = $.Deferred();

			var dialogue_container = '<div class="panel-default node_selector"> \
																	<div class="panel-heading"> \
																		<div class="row"> \
																			<div class="col-sm-5 col-md-4 node_filter"> \
																				<div class="node_types form-inline"> \
																					<select class="btn btn-default generic_button large form-control"> \
																					</select> \
																					<br class="visible-xs"> \
																					<br class="visible-xs"> \
																	        <button class="btn btn-default form-control" type="button">Filter results</button> \
																					<div class="filter_spinner form-control" style="position: relative;"><div class="spinner_container" style="position: absolute; top: 50%; left: 50%;"></div></div> \
																					<hr class="visible-xs"> \
																				</div> \
																			</div> \
																			<div class="col-sm-6 col-sm-offset-1 col-md-5 col-md-offset-3"> \
																				<div class="input-group node_search"> \
																					<input type="text" class="form-control" placeholder="Search by title or description"> \
																					<span class="input-group-btn"> \
																						<button class="btn btn-default" type="button"> \
																							<i class="glyphicon glyphicon-remove"></i> \
																						</button> \
																					</span> \
																				</div> \
																			</div> \
																			<br> \
																		</div> \
																	</div> \
																	<div class="panel-body"> \
																	  <table class="table table-fixed" style="margin-bottom: 0;">  \
																			<thead> \
																				<tr class="node_fields"> \
																				</tr> \
																			</thead> \
																		</table> \
																		<div class="node_selector_table_body" style="overflow: auto"> \
																			<table class="table table-fixed">  \
																				<tbody class="node_rows"><tr class="loadingRow"><td class="text-center" colspan="'+(opts.fields.length+(opts.allowMultiple?1:0))+'">Loading&hellip;</td></tr></tbody> \
																			</table> \
																		</div> \
																	</div> \
																	<div class="panel-footer"> \
																		<div class="row"> \
																			<div class="col-sm-5 col-sm-offset-7 col-md-4 col-md-offset-8 selected_node_count text-right"></div> \
																		</div> \
																	</div> \
																</div>';

      var $dialogue_container = $(dialogue_container);

			$dialogue_container.hide();

			if (window['Spinner']) {
				var spinner_options = {
				  lines: 13, // The number of lines to draw
				  length: 5, // The length of each line
				  width: 2, // The line thickness
				  radius: 6, // The radius of the inner circle
				  rotate: 0, // The rotation offset
				  color: '#000', // #rgb or #rrggbb
				  speed: 1, // Rounds per second
				  trail: 60, // Afterglow percentage
				  shadow: false, // Whether to render a shadow
				  hwaccel: false, // Whether to use hardware acceleration
				  className: 'spinner', // The CSS class to assign to the spinner
				  zIndex: 2e9, // The z-index (defaults to 2000000000)
				  top: 'auto', // Top position relative to parent in px
				  right: 'auto' // Left position relative to parent in px
				};
				var spinner = new Spinner(spinner_options).spin();
				$dialogue_container.find('.spinner_container').each(function(){
					$(this).append(spinner.el).hide();
				});
			}
			var resize = $.proxy(function($dialogue_container){
				$dialogue_container.show();
				var height = $(this).height();
				height -= $(this).find('.panel-heading').outerHeight();
				height -= $(this).find('.panel-footer').outerHeight();
				height -= 10;  // Update by Craig; orig value: 28
				$dialogue_container.find('.panel-body>table').width($dialogue_container.find('.node_selector_table_body>table').width());
				height -= $(this).find('.panel-body>table').outerHeight();
				var orig_height = height;
				height = Math.max(height,50);
				if(height > orig_height){
					var diff = height - orig_height;
					$(this).height($(this).height()+diff);
				}
				$dialogue_container.find('.node_selector_table_body').height(height);
			},this,$dialogue_container);
			var shorten_description = function(description){
				var max_chars = 200; //Magic number...
				var words = description.split(" ");
				var cur_length = 0;
				var string = '';
				for(var i = 0; i < words.length; i++){
					var word = words[i];
					if(string != ''){
						word = ' '+word;
					}
					if(cur_length + word.length <= max_chars){
						string += word;
						cur_length+=word.length;
					}else{
						string += '&hellip;';
						break;
					}
				}
				return string;
			}
			var updateNodeList = $.proxy(function(isLazyLoad){
				if("undefined" === typeof isLazyLoad || isLazyLoad == null){
					isLazyLoad = false;
				}
				var opts = $(this).data('opts');
				var $rows = $(this).find('.node_rows');
				var $fields = $(this).find('.node_fields');
				if(lastLoadType == "search"){
					var data = search_results;
				}else if(lastLoadType == "init"){
					var data = loaded_nodeLists[opts.defaultType];
				}else{
					var data = loaded_nodeLists[$(this).find('.node_filter select').val()];
				}
				if(data.length == 0){
					$rows.html('<tr><td colspan="'+(opts.fields.length+(opts.allowMultiple?1:0))+'" class="text-center empty">'+(lastLoadType == "search"?'There are no items that match your search':'There are no items of the selected type')+'</td></tr>');
				}else{
					var start = 0;
					if(!isLazyLoad){
						$rows.html('');
					}else{
						start = $rows.find('tr').length;
						$rows.find('.loadingRow').remove();
					}
					for(var i = start; i < data.length; i++){
						var item = data[i];
						var index = -1;
						if(undefined!==$dialogue_container.data('nodes')){
							for(var n in $dialogue_container.data('nodes')){
									var selected_node = $dialogue_container.data('nodes')[n];
									if(selected_node.slug == item.slug){
										index = n;
										break;
									}
							}
						}

						var desc = ('undefined'!=typeof(item.version['http://purl.org/dc/terms/description'])) ? item.version['http://purl.org/dc/terms/description'][0].value : '<em>No Description</em>';
						var rowHTML = '<tr>';

						if(isset(opts.allowMultiple) && opts.allowMultiple && 'checkbox'==opts.rowSelectMethod){
							rowHTML += '<td class="text-center select_row" style="vertical-align: middle; width: 5rem"><input type="checkbox" '+(index > -1?'checked':'')+'></td>';
						}

						var hasChildSelector = false;

						for(var n in opts.fields){
							var col = opts.fields[n];
							switch(col){
								case 'thumbnail':
									if(lastLoadType == "search" || current_type != "media"){
										$(this).find('th[data-field="thumbnail"]').hide();
										continue;
									}
									$(this).find('th[data-field="thumbnail"]').show();
									rowHTML += '<td class="node_thumb '+(fieldWidths[col]!='auto'?'col-xs-'+fieldWidths[col]:'')+'" style="vertical-align: middle;"><img class="img-responsive center-block" style="max-height: 50px;" src="'+item.thumbnail+'"></td>';
									break;
								case 'title':
									rowHTML += '<td class="'+(fieldWidths[col]!='auto'?'col-xs-'+fieldWidths[col]:'')+'"><a href="'+item.uri+'">'+item.title+'</a></td>';
									break;
								case 'description':
									var short_desc = shorten_description(desc);
									rowHTML += '<td class="'+(fieldWidths[col]!='auto'?'col-xs-'+fieldWidths[col]+' ':'')+(desc!==short_desc?'shortened_desc':'')+'">'+(desc!==short_desc?'<div class="full_desc">'+desc.replace(/"/g, '\\"')+'</div><div class="short_desc">'+short_desc+'</div>':desc)+'</td>';
									break;
								case 'url':
									rowHTML += '<td class="'+(fieldWidths[col]!='auto'?'col-xs-'+fieldWidths[col]:'')+'">/'+item.slug+'</td>';
									break;
								case 'preview':
									rowHTML += '<td class="'+(fieldWidths[col]!='auto'?'col-xs-'+fieldWidths[col]:'')+'"><a href="'+item.uri+'" target="_blank">Preview</a></td>';
									break;
								case 'include_children':
									hasChildSelector = true;
									rowHTML += '<td class="'+(fieldWidths[col]!='auto'?'col-xs-'+fieldWidths[col]:'')+' select_children text-center" style="vertical-align: middle;">';
									if(item.hasRelations){
										rowHTML += '<input type="checkbox" value="">';
									}
									rowHTML += '</td>';
									break;
								// Added by Craig
								case 'visible':
									var is_visible = (1==parseInt(item.content['http://scalar.usc.edu/2012/01/scalar-ns#isLive'][0].value)) ? true : false;
									var visibleThumbUrl = (is_visible) ? $('link#approot').attr('href')+'views/widgets/edit/visible-icon.png' : $('link#approot').attr('href')+'views/widgets/edit/hidden-icon.png';
									rowHTML += '<td class="'+(fieldWidths[col]!='auto'?'col-xs-'+fieldWidths[col]:'')+'" align="center"><a class="visibilityLink" href="javascript:void(null);"><img src="'+visibleThumbUrl+'" /></a></td>';
									break;
								case 'last_edited_by':
									var fullname = '';
									var prov_uri = item.version["http://www.w3.org/ns/prov#wasAttributedTo"][0].value;
									for (var o in $this.data('_data')) {
										if (prov_uri != o) continue;
										fullname = $this.data('_data')[o]["http://xmlns.com/foaf/0.1/name"][0].value;
									}
									rowHTML += '<td class="'+(fieldWidths[col]!='auto'?'col-xs-'+fieldWidths[col]:'')+'"><a href="'+prov_uri+'">'+fullname+'</a></td>';
									break;
								case 'date':
									var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
									function getSuffix(n) {return n < 11 || n > 13 ? ['st', 'nd', 'rd', 'th'][Math.min((n - 1) % 10, 3)] : 'th'};
									var dt = new Date(item.version["http://purl.org/dc/terms/created"][0].value);
									rowHTML += '<td class="'+(fieldWidths[col]!='auto'?'col-xs-'+fieldWidths[col]:'')+'">'+monthNames[dt.getMonth()]+' '+dt.getDate()+getSuffix(dt.getDate())+' '+dt.getFullYear()+'</td>';
									break;
								case 'versions':
									rowHTML += '<td class="'+(fieldWidths[col]!='auto'?'col-xs-'+fieldWidths[col]:'')+'" align="center"><a href="'+item.uri+'.versions">&nbsp;'+item.version["http://open.vocab.org/terms/versionnumber"][0].value+'&nbsp;</a></td>';
									break;
								case 'edit':
									rowHTML += '<td class="'+(fieldWidths[col]!='auto'?'col-xs-'+fieldWidths[col]:'')+'" align="center"><a href="'+item.uri+'.edit" class="btn btn-default btn-xs editLink">edit</a></td>';
									break;
							}
						}
						rowHTML+='</tr>';
						//<td class="col-xs-4">'+desc+'</td><td class="col-xs-2">.../'+item.slug+'</td><td class="text-center col-xs-2"><a href="'+item.uri+'" target="_blank">Preview</a></td><td class="text-center col-xs-1"><i class="glyphicon glyphicon-unchecked"></td></tr>
						var $item = $(rowHTML).appendTo($rows).data({'slug':item.slug,'item':item});

						if(hasChildSelector){
							$item.find('.select_children input[type="checkbox"]').click(function(e){
								e.stopPropagation();
								var $dialogue_container = $(this).parents('.node_selector');
								var item = $(this).parents('tr').data('item');
								var index = -1;
								if(undefined!==$dialogue_container.data('nodes')){
									for(var n in $dialogue_container.data('nodes')){
											var selected_node = $dialogue_container.data('nodes')[n];
											if(selected_node.slug == item.slug){
												index = n;
												break;
											}
									}
								}
								var checked = $(this).is(":checked");
								if(!checked && index > -1){
									$dialogue_container.data('nodes')[index].include_children = false;
									updateSelectedCounter();
								}else if(checked){
									if(index > -1){
										$dialogue_container.data('nodes')[index].include_children = true;
										updateSelectedCounter();
									}else{
										if($dialogue_container.data('opts').allowMultiple){
											$(this).parents('.select_children').siblings('.select_row').find('input[type="checkbox"]').click();
										}else{
											$(this).parents('tr').click();
										}
									}
								}
							});
							if(index>-1 && $dialogue_container.data('nodes')[index].include_children){
								$item.find('.select_children input[type="checkbox"]').attr('checked',true);
							}
						}

						$item.find('a').click(function(e){
							e.stopPropagation();
						});

						$item.mouseover(function() {
							$(this).find('.editLink').show();
						}).mouseout(function() {
							$(this).find('.editLink').hide();
						});

						if(index>-1){
							$item.addClass('current');
							$item.find('.select_row input[type="checkbox"]').attr('checked',true);
						}

						if(opts.allowMultiple){
							$item.off('click').click(function(e){
								// Craig decoupled the actions below from the checkbox, since it might not be present if rowSelectMethod==highlight
								e.stopPropagation();
								var $dialogue_container = $(this).parents('.node_selector');
								var item = $(this).data('item');
								var $icon = $(this).find('.select_row>input[type="checkbox"]').find('.glyphicon:first');
								var checked = $(this).hasClass('current');
								var $childSelector = $(this).find('.select_row').siblings('.select_children');
								var hasChildSelector = $childSelector.length > 0;
								var index = -1;
								if(undefined!==$dialogue_container.data('nodes')){
									for(var n in $dialogue_container.data('nodes')){
											var selected_node = $dialogue_container.data('nodes')[n];
											if(selected_node.slug == item.slug){
												index = n;
												break;
											}
									}
								}
								if(index == -1){
									if($dialogue_container.data('nodes') == undefined){
										$dialogue_container.data('nodes',[item]);
									}else{
										$dialogue_container.data('nodes').push(item);
									}
									$(this).addClass('current');
									if(item.hasRelations && hasChildSelector){
										var index = -1;
										if(undefined!==$dialogue_container.data('nodes')){
											for(var n in $dialogue_container.data('nodes')){
													var selected_node = $dialogue_container.data('nodes')[n];
													if(selected_node.slug == item.slug){
														index = n;
														break;
													}
											}
										}
										$childSelector.find('input[type="checkbox"]').attr('checked',true);
										$dialogue_container.data('nodes')[index].include_children = true;
									}
								}else{
									$dialogue_container.find('.selectAll input[type="checkbox"]').attr("checked",false);
									$dialogue_container.data('nodes').splice(index, 1);
									$(this).removeClass('current');
									if(hasChildSelector){
										$childSelector.find('input[type="checkbox"]').attr('checked',false);
									}
								}
								$(this).find('.select_row>input[type="checkbox"]').attr('checked',((checked)?false:true));
								updateSelectedCounter();
							});
						}else{
							$item.off('click').click(function(e){
								var item = $(this).data('item');
								var $dialogue_container = $(this).parents('.node_selector');
								var $childSelector = $(this).find('.select_children');
								var hasChildSelector = $childSelector.length > 0;
								if($(this).hasClass('current')){
									$(this).removeClass('current');
									$dialogue_container.data('nodes',[]);
									if(hasChildSelector){
										$childSelector.find('input[type="checkbox"]').attr('checked',false);
									}
								}else{
									$(this).addClass('current').siblings('.current').removeClass('current').find('input[type="checkbox"]').attr('checked',false);
									$dialogue_container.data('nodes',[item]);
									if(item.hasRelations && hasChildSelector){
										$childSelector.find('input[type="checkbox"]').attr('checked',true);
										$dialogue_container.data('nodes')[0].include_children = true;
									}
								}
								updateSelectedCounter();
								e.preventDefault();
								e.stopPropagation();
								return false;
							});
						}
					}
				}

				$rows.find('.node_thumb img').each(function(){
					$(this).tooltip({
						title : '<img src="'+$(this).attr('src')+'" class="nodeSelectorEnlargedThumbnail">',
						html : true,
						container: '.bootbox'
					});
				});

				$rows.find('.shortened_desc').each(function(){
					if($(this).find('.moreless').length > 0){ return; }
					$(this).parent().find('.full_desc').hide();
					$linkContainer = $('<div class="text-right"></div>').appendTo(this);
					$('<a href="#" class="moreless text-right">more</a>').appendTo($linkContainer).click(function(e){
						e.preventDefault();
						var $fullDesc = $(this).parents('.shortened_desc').find('.full_desc').toggle();
						$(this).parents('.shortened_desc').find('.short_desc').toggle();
						$(this).text($fullDesc.is(':visible')?'less':'more');
						return false;
					});
				});

				$(this).find('.spinner_container').hide();
				$(this).find('.node_types .btn').prop('disabled',false).removeClass('disabled');

			},$dialogue_container);

			var updateSelectedCounter = $.proxy(function(){

				var $count = $(this).find('.selected_node_count');
				if($(this).data('nodes') == undefined){
					$(this).data('nodes',[]);
				}

				var number_items = $(this).data('nodes').length;
				if($(this).data('opts').allowChildren){
					//We are also including children if the user chooses, so we need to count them
					for(var i in $(this).data('nodes')){
						var item = $(this).data('nodes')[i];
						if('undefined'===typeof item.targets || 'undefined'===item.include_children || !item.include_children){ continue; }
						number_items += item.targets.length;
					}
				}
				if($(this).data('opts').allowMultiple){
					switch(number_items){
						case 0:
								$count.text('No items selected');
								break;
						case 1:
								$count.text('1 item selected');
								break;
						default:
								$count.text(number_items+' items selected');
								break;
					}
				}
				$(this).data('opts').onChangeCallback();
			},$dialogue_container);

			var $filter = $dialogue_container.find('.node_filter');
			var $search = $dialogue_container.find('.node_search');
			var $count = $dialogue_container.find('.selected_node_count');
			var $fields = $dialogue_container.find('.node_fields');

			if(opts.types.length < 2){
				$filter.find('.node_types').hide();
			}

			if(isset(opts.allowMultiple) && opts.allowMultiple && 'checkbox'==opts.rowSelectMethod){
				$('<input type="checkbox">').appendTo($('<th data-field="selected" class="text-center selectAll" style="width: 5rem"></th>').appendTo($fields)).change(function(){
					var checked = $(this).is(":checked");
					var $rows = $(this).parents('.node_selector').find('tbody tr');
					if(checked){
						$rows = $rows.not('.current');
					}else{
						$rows = $rows.filter('.current');
					}
					$rows.trigger('click');
				});
			}

			if (isset(opts.deleteOptions) && opts.deleteOptions) {
				$dialogue_container.find('.selected_node_count').css('float','right').css('margin-left',0);
				var $deleteOpts = $('<div class="col-xs-6 botton_options_box"></div>').appendTo($dialogue_container.find('.panel-footer .row:first'));
				if (isset(opts.allowMultiple) && opts.allowMultiple) {
					var $selectall = $('<button type="button" class="btn btn-default btn-sm">Select all</button>').appendTo($deleteOpts);
					$selectall.off('click').on('click', function() {
						var checked = $(this).hasClass('active');
						var $rows = $(this).closest('.node_selector').find('tbody tr');
						if(checked){
							$rows = $rows.filter('.current');
							$(this).removeClass('active');
						}else{
							$rows = $rows.not('.current');
							$(this).addClass('active');
						}
						$rows.trigger('click');
						$(this).blur();
					});
				}
				$deleteOpts.append('<button type="button" class="btn btn-default btn-sm">Delete selected</button>');
			}

			if (isset(opts.addOptions) && opts.addOptions) {
				if ('undefined'==typeof($deleteOpts)) {
					$dialogue_container.find('.selected_node_count').css('float','right').css('margin-left',0);
					var $deleteOpts = $('<div class="col-xs-6 botton_options_box"></div>').appendTo($dialogue_container.find('.panel-footer .row:first'));
				} else {
					$deleteOpts.append('<span> | </span>');
				}
				$deleteOpts.append('<button type="button" class="btn btn-default btn-sm">Add new page</button>');
				$deleteOpts.append('<select class="btn btn-default btn-sm"><option value="">Import media</option></select>');
				$deleteOpts.find('button:last').off('click').on('click', function() {
					document.location.href = $('link#parent').attr('href')+'new.edit';
				});
			}

			var $rows = $dialogue_container.find('.node_rows');
			var $nodeSelectorTableBody = $dialogue_container.find('.node_selector_table_body');
			var fields_to_display = [];

			var $type_selector = $filter.find('select');
			var $type_filter_button = $filter.find('button');

			for(var t in opts.types){

				if(opts.types[t] == 'composite'){
					var type_display_name = 'Pages';
				}else if(opts.types[t] == 'reply'){
					var type_display_name = 'Commentary';
				}else{
					var type_display_name = opts.types[t].charAt(0).toUpperCase() + opts.types[t].slice(1);
					if(type_display_name!='Media'){
						type_display_name+='s';
					}
				}

				$type_selector.append('<option value="'+opts.types[t]+'">'+type_display_name+'</option>');
			}

			var doTypeFilter = function(){
				$dialogue_container.find('.filter_spinner .spinner_container').show();
				$dialogue_container.find('.node_types .btn').prop('disabled',true).addClass('disabled');
				var opts = $dialogue_container.data('opts');

				if(opts == undefined){ opts = []; }

				var promise = $.Deferred();
				$.when(promise).then(updateNodeList);

				var rec = opts.rec;
				var ref = opts.ref;

				$dialogue_container.find('.node_selector_table_body .node_rows').html('<tr class="loadingRow"><td class="text-center" colspan="'+(opts.fields.length+(opts.allowMultiple?1:0))+'">Loading&hellip;</td></tr>');

				load_node_list({
					"type" : current_type,
					"rec" : rec,
					"ref" : ref,
					"promise" : promise,
					"page" : 0
			  });
			}

			$type_filter_button.click(function(){
				lastLoadType = "filter";
				var $dialogue_container = $(this).parents('.node_selector');
				var $type_selector = $dialogue_container.find('.node_filter select');
				var $search = $dialogue_container.find('.node_search');
				$search.find('input').val('');
				current_type = $type_selector.val();
				doTypeFilter();
				$type_selector.siblings('button').blur();
			});

			$nodeSelectorTableBody.on('scroll', function() {
	       if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight && !lastPage) {
					 var promise = $.Deferred();
					 var $dialogue_container = $(this).parents('.node_selector');
	 				 var opts = $dialogue_container.data('opts');
					 if($dialogue_container.find('.node_rows .loadingRow').length == 0){
	 				 		$dialogue_container.find('.node_rows').append('<tr class="loadingRow"><td class="text-center" colspan="'+(opts.fields.length+(opts.allowMultiple?1:0))+'">Loading more results&hellip;</td></tr>');
					 }
					 $.when(promise).then(function(){updateNodeList(true)});
					 var data = lastLoadCriteria;
					 data.promise = promise;
					 data.page++;
	 				 load_node_list(data);
	       }
			});
			$search.find('button').click(function(){
				var $dialogue_container = $(this).parents('.node_selector');
				var $search = $dialogue_container.find('.node_search');
				$search.find('input').val('');
				doTypeFilter();
			});
			$search.find('input').on("keyup change",function(){
				if($(this).val() == ""){
					var $dialogue_container = $(this).parents('.node_selector');
					var $type_filter_button = $dialogue_container.find('.node_filter button');
					doTypeFilter();
					return false;
				}
				if($(this).data('timeout')!=undefined){
					window.clearTimeout($(this).data('timeout'));
				}
				$(this).data('timeout',setTimeout($.proxy(function(){
						lastLoadType = "search";
						var promise = $.Deferred();
						$.when(promise).then(updateNodeList);
						var $dialogue_container = $(this).parents('.node_selector');
						var $type_selector = $dialogue_container.find('.node_filter select');
						var opts = $dialogue_container.data('opts');
						var rec = opts.rec;
						var ref = opts.ref;
						$dialogue_container.find('.node_selector_table_body .node_rows').html('<tr class="loadingRow"><td class="text-center" colspan="'+(opts.fields.length+(opts.allowMultiple?1:0))+'">Loading&hellip;</td></tr>');
						load_node_list({
							"type" : current_type,
							"search" : $dialogue_container.find('.node_search input').val(),
							"rec" : rec,
							"ref" : ref,
							"promise" : promise,
							"page" : 0
						});
					$(this).data('timeout',undefined);
				},this),200));
			});

			if(isset(opts.fields)){;
				fields_to_display = opts.fields;
				for(var f in fields_to_display){
					if(["thumbnail","preview","edit"].indexOf(fields_to_display[f])>-1){
						$fields.append('<th class="'+(fieldWidths[fields_to_display[f]]!='auto'?'col-xs-'+fieldWidths[fields_to_display[f]]:'')+'" data-field="'+fields_to_display[f].toLowerCase().replace(/ /g,"_")+'"></th>');
					} else if(["visible","versions"].indexOf(fields_to_display[f])>-1){
						$fields.append('<th class="'+(fieldWidths[fields_to_display[f]]!='auto'?'col-xs-'+fieldWidths[fields_to_display[f]]:'')+'" data-field="'+fields_to_display[f].toLowerCase().replace(/ /g,"_")+'" style="text-align:center;">'+toProperCase(fields_to_display[f].replace(/_/g," "))+'</th>');
					}else{
						$fields.append('<th class="'+(fieldWidths[fields_to_display[f]]!='auto'?'col-xs-'+fieldWidths[fields_to_display[f]]:'')+'" data-field="'+fields_to_display[f].toLowerCase().replace(/ /g,"_")+'">'+toProperCase(fields_to_display[f].replace(/_/g," "))+'</th>');
					}
				}
			}

			if(!isset(opts.preserveContent) || !opts.preserveContent){
				$(this).empty();
			}

			if(!isset(opts.rec)){
				opts.rec = 0;
			}
			if(!isset(opts.ref)){
				opts.ref = 0;
			}

			opts.searchableTypes = ['media','file','composite','page','content'];

			var type = opts.defaultType;

			if(!isset(opts.rec)){
				opts.rec = 0;
			}

			if(!isset(opts.ref)){
				opts.ref = 0;
			}

			var init_selector = $.proxy(function($dialogue_container,opts,resize){
				$dialogue_container.data('opts',opts);
				updateSelectedCounter();
				$dialogue_container.find('.node_filter button').click();
				$(this).append($dialogue_container);
				window.setTimeout(resize,400);
			},this,$dialogue_container,opts,resize);

			jQuery.when(init_promise).then(init_selector);

			if("undefined" !== typeof opts.selected && $.isArray(opts.selected) && opts.selected.length > 0){
				//Go through selected array and add them to the selected list...
				var slugs = [];
				for(var i in opts.selected){
					 var include_children = opts.selected[i].indexOf('*')>-1;
					 var slug = opts.selected[i].replace(/\*/g, '');
					 slugs.push({id : slug, children : include_children, loaded : false});
				}

				var parent_url = $('link#parent').attr('href');

				for(var i in slugs){

					(function(slug,promise,slugs,$dialogue_container){
						if(scalarapi.loadPage( slug.id, true, function(){
							var nodeList = [];

							slug.loaded = true;
							slug.data = scalarapi.getNode(slug.id);
							for(var i in slugs){
								if(!slugs[i].loaded){
									return;
								}
							}
							$dialogue_container.data('nodes',[]);
							for(var i in slugs){
								//Build node list for content selector
								var slug_data = slugs[i].data;
								var item = {};
								item.uri = slug_data.url;
								item.slug = slugs[i].id;
								item.version_uri = slug_data.current.url;
		    				item.version_slug = item.version_uri.replace(parent_url, '');
		    				item.content = slug_data.current.content;
		    				item.title = slug_data.current.title;
								if("undefined" !== typeof slug_data.outgoingRelations && $.isArray(slug_data.outgoingRelations) && slug_data.outgoingRelations.length > 0){
		    					item.targets = slug_data.outgoingRelations;
								}
								if('undefined' !== typeof slug_data.thumbnail){
									item.thumbnail = slug_data.thumbnail;
								}else{
									item.thumbnail = $('link#approot').attr('href')+'/views/widgets/ckeditor/plugins/scalar/styles/missingThumbnail.png';
								}
								item.include_children = slug.children;
								item.hasRelations = 'undefined' !== typeof item.targets && item.targets.length > 0;
								$dialogue_container.data('nodes').push(item);
							}
							promise.resolve();
						}, null, 1, false, null, 0, 20) == "loaded"){
							var nodeList = [];

							slug.loaded = true;
							slug.data = scalarapi.getNode(slug.id);

							for(var i in slugs){
								if(!slugs[i].loaded){
									return;
								}
							}

							$dialogue_container.data('nodes',[]);
							for(var i in slugs){
								//Build node list for content selector
								var slug_data = slugs[i].data;
								var item = {};
								item.uri = slug_data.url;
								item.slug = slugs[i].id;
								item.version_uri = slug_data.current.url;
		    				item.version_slug = item.version_uri.replace(parent_url, '');
		    				item.content = slug_data.current.content;
		    				item.title = slug_data.current.title;
								if("undefined" !== typeof slug_data.outgoingRelations && $.isArray(slug_data.outgoingRelations) && slug_data.outgoingRelations.length > 0){
		    					item.targets = slug_data.outgoingRelations;
								}
								if('undefined' !== typeof slug_data.thumbnail){
									item.thumbnail = slug_data.thumbnail;
								}else{
									item.thumbnail = $('link#approot').attr('href')+'/views/widgets/ckeditor/plugins/scalar/styles/missingThumbnail.png';
								}
								item.include_children = slug.children;
								item.hasRelations = 'undefined' !== typeof item.targets && item.targets.length > 0;
								$dialogue_container.data('nodes').push(item);
							}
							promise.resolve();
						}
					})(slugs[i],init_promise,slugs,$dialogue_container);
				}
			}else{
				init_promise.resolve();
			}
			$(this).data('serialize_nodes',$.proxy(function(){
				if($(this).data('nodes') == undefined){
					return '';
				}
				var slugs = [];
				for(var i in $(this).data('nodes')){
					var item = $(this).data('nodes')[i];
					slugs.push(item.slug);
					if(!$(this).data('opts').allowChildren || 'undefined'===typeof item.targets || 'undefined'===item.include_children || !item.include_children){continue;}
					slugs[slugs.length-1]+='*';
				}
				return slugs.join(',');
			},$dialogue_container));

			$(this).on('doResize',resize);

			return $(this);
		};
}( jQuery ));
