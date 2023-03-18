isMac = navigator.userAgent.indexOf('Mac OS X') != -1;
(function($) {
	var defaults = {
		parent: $('link#parent').attr('href'),
		anno_icon: $('link#approot').attr('href') + 'views/melons/cantaloupe/images/annotate_icon.png',
		type: null,
		orig_type: null,
		changeable: true,
		multiple: false,
		onthefly: false,
		pagination: true,
		includeMetadata: false,
		/* Sorts by slug, not title */
		start: 0,
		resultsPerPage: 100,
		rec: 0,
		sq: null,
		desc_max_length: 100,
		filename_max_length: 20,
		data: [],
		queue: [],
		msg: '',
		forceSelect: false,
		no_data_msg: 'No content of the selected type was found',
		callback: null
	};
	$.fn.content_options = function(opts) { // Layout options box
		// Options
		var self = this;
		var $this = $(this);
		var body = $('iframe.cke_wysiwyg_frame').contents().find('body');
		var resource = opts.node.slug;
		var isInlineMedia = opts.data['text-wrap'] != null;
		var sameMediaLinks = body.find('a[resource="'+resource+'"]');
		var isFirstInstance = (sameMediaLinks[0] == opts.element.$) || (sameMediaLinks.length == 0);
		var instanceIndex = sameMediaLinks.index(opts.element.$);
		var priorInstance = sameMediaLinks[0];
		var isOnlyInstance = sameMediaLinks.length == 1 && isFirstInstance;
		if (isOnlyInstance) {
			priorInstance = null;
		} else {
			sameMediaLinks.each(function(i) {
				if (!this.getAttribute('data-use-prior') && i < instanceIndex) {
					priorInstance = this;
				}
			});
		}
		var options = {};
		var mediaType = '';
		if (typeof opts.data['type'] !== 'undefined') {
			mediaType = opts.data['type'];
		}
		if ('undefined' == typeof(opts.data) || $.isEmptyObject(opts.data)) {
			opts.callback(options);
			return;
		}
		if ('undefined' == typeof(opts.isMedia) || opts.isMedia) {
			opts.isMedia = true;
		} else {
			opts.isMedia = false;
		}
		// Helpers
		var ucwords = function(str) { // http://kevin.vanzonneveld.net
			if (!str) return;
			return (str ).replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
				return $1.toUpperCase();
			});
		};
		var sentenceCase = function(str) {
			return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
		}
		var dash_to_space = function(str) {
			return str.replace(/-/g, ' ');
		}
		// Create the modal
		var dialog_title;
		switch (mediaType) {

			case '':
			dialog_title = 'Media formatting options';
			break;

			default:
			if (opts.isMedia) {
				dialog_title = mediaType + ' media formatting options';
			} else {
				if (opts.element.hasClass('inlineNote')) {
					dialog_title = 'Inline note formatting options';
				} else {
					dialog_title = 'Formatting options';
				}
			}
			break;
		}
		bootbox.dialog({
			message: '<div id="bootbox-media-options-content" class="heading_font"></div>',
			title: dialog_title,
			className: 'media_options_bootbox',
			animate: ((navigator.userAgent.match(/(iPod|iPhone|iPad)/)) ? false : true) // Panel is unclickable if true for iOS
		});
		$('.bootbox').find('.modal-title').addClass('heading_font');
		$this.appendTo($('#bootbox-media-options-content'));
		var $media_options_bootbox = $('.media_options_bootbox');
		$('#bootbox-media-options-content div:first').append('<div id="bootbox-media-options-form" class="form-horizontal heading_font"></div>');
		var $form = $('#bootbox-media-options-form');
		$('.bootbox-close-button').empty();
		//Media selection back link
		var node = typeof opts.node.current != 'undefined' ? opts.node.current : opts.node;
		var $media_preview = $('<div class="row selectedItemPreview"><div class="col-xs-3 col-sm-4 col-md-3 left mediaThumbnail"></div><div class="col-xs-9 col-sm-8 col-md-9 right"><strong class="mediaTitle">' + node.title + '</strong><p class="mediaDescription"></p><div class="link"></div></div></div><hr />');
		var thumbnail = undefined;
		if (opts.isMedia) {
			if (typeof opts.node.thumbnail != 'undefined' && opts.node.thumbnail != null) {
				thumbnail = opts.node.thumbnail;
			} else if (typeof opts.node.content != 'undefined' && opts.node.content['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] != 'undefined' && opts.node.content['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] != null) {
				thumbnail = opts.node.content['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'][0].value;
			}
		}
		var description = '';
		if (typeof node.description == 'string' && node.description != '') {
			description = node.description;
		} else if (typeof node.content == 'string' && node.content != '') {
			description = node.content;
		} else if (typeof node.content == 'object' && typeof node.version != 'undefined' && typeof node.version['http://purl.org/dc/terms/description'] != 'undefined') {
			description = node.version['http://purl.org/dc/terms/description'][0].value;
		}
		if (description != '') {
			var $tmp = $('<div></div>');
			$tmp.html(description);
			$media_preview.find('.mediaDescription').text($tmp.text());
		} else {
			$media_preview.find('.mediaDescription').remove();
		}
		if (thumbnail != undefined) {
			$media_preview.find('.mediaThumbnail').append('<img class="img-responsive center-block" src="' + thumbnail + '">');
		} else {
			$media_preview.find('.mediaThumbnail').remove();
			$media_preview.find('.right').removeClass('col-sm-8 col-md-9');
		}
		if (opts.isMedia) {
			$('<a href="#">Change Selected Media</a>').data('element', opts.element).on('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				var element = $(this).data('element');
				var data = $(element.$).data('selectOptions');
				data.forceSelect = true;
				CKEDITOR._scalar.selectcontent(data);
			}).appendTo($media_preview.find('.right .link'));
		}

		$form.append($media_preview);

		// Add options
		var hasAnnotationOption = opts.data.annotations != null && typeof opts.data.annotations !== 'undefined';

		if (typeof opts.element === 'undefined') {
			opts.element = null;
		}
		if (opts.element.data('text-wrap')) {
			opts.element.data('text-wrap', null);
		}
		var text_wrap = false;
		if (opts.element.hasClass('wrap')) {
			text_wrap = true;
		}

		if (!isFirstInstance && !isInlineMedia) {
			$form.append('<div class="form-group">' +
				'<div class="col-sm-3"></div>' +
				'<div class="col-sm-9">The media above has previously been used on this page.</div>' +
			'</div>' +
			'<div class="form-group">' +
				'<div class="col-sm-3"></div>' +
				'<div class="col-sm-9"><label><input id="use-prior-media-checkbox" type="checkbox" checked> Use existing media instance</label>' +
			'</div>');
		}

		if (opts.element.getAttribute('data-use-prior')) {
			$('#use-prior-media-checkbox').prop('checked', true);
		} else {
			$('#use-prior-media-checkbox').prop('checked', false);
		}

		var usePriorInstance = $('#use-prior-media-checkbox').prop('checked');

		$('#use-prior-media-checkbox').on('change', function() {
			usePriorInstance = $('#use-prior-media-checkbox').prop('checked');
			if (usePriorInstance) {
				$('.form-group.instance-option').addClass('hidden');
			} else {
				$('.form-group.instance-option').removeClass('hidden');
			}
		})

		for (var option_name in opts.data) {
			if (option_name != 'annotations' && option_name != 'node' && option_name != 'type') {
				var $option = $('<div class="form-group instance-option"><label class="col-sm-3 control-label" style="white-space:nowrap;">' + ucwords(dash_to_space(option_name)) + '</label><div class="col-sm-9"><select class="form-control" name="' + option_name + '"></select></div></div>');
				for (var j = 0; j < opts.data[option_name].length; j++) {
					$option.find('select:first').append('<option value="' + opts.data[option_name][j] + '">' + (option_name == 'text-wrap' ? sentenceCase(dash_to_space(opts.data[option_name][j])) : ucwords(dash_to_space(opts.data[option_name][j]))) + '</option>');
				}
				if (usePriorInstance) $option.addClass('hidden');
				$form.append($option);
				if (option_name == 'text-wrap') {
					$option.find('select').on('change', function() {
						if ($(this).val() == "wrap-text-around-media") {
							$('select[name="align"] option[value="center"]').hide().prop('disabled', true);
							if ($('select[name="align"]').val() == "center") {
								$('select[name="align"]').val("left");
							}
						} else {
							$('select[name="align"] option[value="center"]').show().prop('disabled', false);
						}
					});
					if (text_wrap) {
						$option.find('select').val('wrap-text-around-media');
					}
				} else if (opts.element != null && opts.element.data(option_name) !== null) {
					$option.find('select').first().val(opts.element.data(option_name));
				}
			}
		}

		if (text_wrap) {
			if ($('select[name="align"]').val() == "center") {
				$('select[name="align"]').val("left");
			}
			$('select[name="align"] option[value="center"]').hide();
		}
		if (hasAnnotationOption) {
			var $annotationSelection = $('<div class="annotationContainer">' +
				'<div class="form-group">' +
					'<div class="col-sm-3"></div>' +
					'<div class="col-sm-9" id="annotation-info">This media has annotations. Select which annotations (if any) you want to be displayed.<br/></div>' +
				'</div>' +
				'<div class="form-group">' +
					'<label class="col-sm-3 control-label">Annotations</label>' +
					'<div class="col-sm-9 annotationSelection">' +
						'<div class="annotationTableWrapper">' +
							'<table class="table table-fixed table-striped table-hover">' +
								'<thead><tr><th class="col-xs-3 text-center">&nbsp;&nbsp;<a href="#" class="annotationSelectionShowAll text-muted"><i class="glyphicon glyphicon-eye-open"></a></th><th class="col-xs-9">Annotation Title</th></tr></thead>' +
								'<tbody></tbody>' +
							'</table>' +
						'</div>' +
					'</div>' +
				'</div>');

			$annotationSelection.append('<div class="featuredAnnotation">' +
				'<div class="form-group">' +
					'<div class="col-sm-3"></div>' +
					'<div class="col-sm-9">Choose an annotation to be featured, or select \'None\'.</div>' +
				'</div>' +
				'<div class="form-group">' +
					'<label class="col-sm-3 control-label">Featured</label>' +
					'<div class="col-sm-9"><select class="form-control"><option value="none" class="none">None</option></select></div>' +
				'</div>' +
			'</div>');

			$annotationSelection.find('.annotationSelectionShowAll').on('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				var $featuredAnnotation = $(this).parents('.annotationContainer').find('.featuredAnnotation');
				var $annotationRows = $(this).parents('table').find('tbody tr');
				if ($(this).parents('table').find('tbody>tr:not(.info)').length > 0) {
					$(this).removeClass('text-muted');
					$annotationRows.addClass('info').find('.glyphicon-eye-close').removeClass('glyphicon-eye-close text-muted').addClass('glyphicon-eye-open');
					$featuredAnnotation.find('option').show().prop('disabled', false);
					$featuredAnnotation.slideDown('fast');
				} else {
					$(this).addClass('text-muted');
					$annotationRows.removeClass('info').find('.glyphicon-eye-open').removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close text-muted');
					$featuredAnnotation.slideUp('fast', function() { $(this).find('option:not(.none)').hide().prop('disabled', true); });
				}
			});

			if (opts.node != null && typeof opts.node !== 'undefined') {
				(function(slug, $annotationSelection, element) {
					var handleAnnotations = function() {
						var node = scalarapi.getNode(slug);
						var annotated_by = node.getRelatedNodes('annotation', 'incoming');
						if (annotated_by.length == 0) {
							$annotationSelection.find('#annotation-info, .featuredAnnotation').remove();
							$annotationSelection.find('.annotationSelection').html('<p class="text-muted">This media does not contain any annotations.</p>');
							return;
						}
						var $body = $annotationSelection.find('tbody');
						var $featuredAnnotation = $annotationSelection.find('.featuredAnnotation select');
						var $annotations = [];
						for (n in annotated_by) {
							var rel = annotated_by[n];
							var title = rel.getDisplayTitle();
							$featuredAnnotation.append('<option style="display: none;" disabled value="' + rel.slug + '">' + title + '</option>');
							$annotations[rel.slug] = $('<tr data-slug="' + rel.slug + '"><td class="col-xs-3 text-center">&nbsp;&nbsp;<a class="annotationSelectionShow"><i class="glyphicon glyphicon-eye-close text-muted"></a></td><td class="col-xs-9 annotationTitle">' + title + '</td></tr>').appendTo($body).on('click', function() {
								var $featuredAnnotation = $(this).parents('.annotationContainer').find('.featuredAnnotation');
								if ($(this).hasClass('info')) {
									$(this).removeClass('info').find('.glyphicon-eye-open').removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close text-muted');
									$(this).parents('table').find('.annotationSelectionShowAll').addClass('text-muted');
									$thisOption = $featuredAnnotation.find('option[value="' + $(this).data('slug') + '"]');
									if ($featuredAnnotation.find('option:not([disabled]):not(".none")').length == 1) {
										$featuredAnnotation.slideUp('fast');
									} else {
										var newVal = $featuredAnnotation.find('option:not([disabled]):not(".none")').not($thisOption).first().prop('selected', 'selected').val();
										$featuredAnnotation.val(newVal).trigger('change');
									}
									$thisOption.hide().prop('disabled', true);
								} else {
									$(this).addClass('info').find('.glyphicon-eye-close').removeClass('glyphicon-eye-close text-muted').addClass('glyphicon-eye-open');
									if ($(this).siblings('tr:not(.info)').length == 0) {
										$(this).parents('table').find('.annotationSelectionShowAll').removeClass('text-muted');
									}
									$thisOption = $featuredAnnotation.find('option[value="' + $(this).data('slug') + '"]');
									$thisOption.show().prop('disabled', false);
									if ($featuredAnnotation.find('option:not([disabled]):not(".none")').length == 1) {
										$thisOption.prop('selected', 'selected');
										$featuredAnnotation.val($(this).data('slug'));
										$featuredAnnotation.slideDown('fast');
									}
								}
							});
						}
						if (element != null && element.getAttribute('resource') == slug) {
							if (element.data('annotations') != undefined) {
								var previous_annotations = element.data('annotations').split(',');
								if (previous_annotations.length == 1 && previous_annotations[0] == "") {
									previous_annotations = [];
								}
							} else {
								previous_annotations = [];
								$featuredAnnotation.find('option').each(function() {
									if ($(this).val() != 'none') {
										previous_annotations.push($(this).val());
									}
								});
							}
							var featuredAnnotation = undefined;
							if (element.getAttribute('href').indexOf('#') >= 0) {
								var temp_anchor = document.createElement('a');
								temp_anchor.href = opts.element.getAttribute('href');
								featuredAnnotation = temp_anchor.hash.replace('#', '');
								if (previous_annotations.indexOf(featuredAnnotation) == -1) {
									previous_annotations.push(featuredAnnotation);
								}
							}

							if (previous_annotations.length > 0) {
								for (var i in previous_annotations) {
									var annotation = previous_annotations[i];
									if (typeof $annotations[annotation] !== 'undefined') {
										$annotations[annotation].addClass('info').find('.glyphicon-eye-close').removeClass('glyphicon-eye-close text-muted').addClass('glyphicon-eye-open');
										if ($annotations[annotation].siblings('tr:not(.info)').length == 0) {
											$annotations[annotation].parents('table').find('.annotationSelectionShowAll').removeClass('text-muted');
										}
										$thisOption = $featuredAnnotation.find('option[value="' + annotation + '"]');
										$thisOption.show().prop('disabled', false);
									}
								}
								$form.find('.featuredAnnotation').add($featuredAnnotation).show();

								if (featuredAnnotation != undefined) {
									$featuredAnnotation.find('option[value="' + featuredAnnotation + '"]').prop('selected', 'selected');
									$featuredAnnotation.val(featuredAnnotation);
								}
							}
						}
					}
					scalarapi.loadPage(slug, true, function() {
						handleAnnotations();
					}, null, 1);
				})(opts.node.slug, $annotationSelection, opts.element);

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
				if (option_name != 'annotations' && option_name != 'node') {
					data_fields[option_name] = $this.find('select[name="' + option_name + '"] option:selected').val();
				}
			}
			if ($('#bootbox-media-options-content').find('.annotationSelection').length > 0) {
				//We have an annotation selector

				var $selectedAnnotations = $('#bootbox-media-options-content').find('.annotationSelection tbody .glyphicon-eye-open').parents('tr');
				var annotations = [];
				for (var i = 0; i < $selectedAnnotations.length; i++) {
					annotations.push($selectedAnnotations.eq(i).data('slug'));
				}
				if (!isInlineMedia) {
					if (usePriorInstance) {
						// add any annnotations selected here to the prior instance
						var instanceAnnotations = priorInstance.getAttribute('data-annotations').split(',');
						for (var i=0; i<annotations.length; i++) {
							if (instanceAnnotations.indexOf(annotations[i]) == -1) {
								instanceAnnotations.push(annotations[i]);
							}
						}
						priorInstance.setAttribute('data-annotations', instanceAnnotations.join(','));
					} else {
						// add any annotations from following media links that may depend on this instance
						var instanceIndex = sameMediaLinks.index(opts.element.$);
						for (var i=instanceIndex+1; i<sameMediaLinks.length; i++) {
							if (sameMediaLinks[i].getAttribute('data-use-prior')) {
								// note that if this is a newly created media link we don't actually know
								// if this is a later instance or not
								var laterInstanceAnnotations = sameMediaLinks[i].getAttribute('data-annotations').split(',');
								for (var j=0; j<laterInstanceAnnotations.length; j++) {
									if (annotations.indexOf(laterInstanceAnnotations[j]) == -1) {
										annotations.push(laterInstanceAnnotations[j]);
									}
								}
							} else if (instanceIndex != -1) {
								// if this is a newly created media link don't exit (since we don't know
								// where it's located in the dom), just grab all of
								// the referenced annotations and add them to the link
								break;
							}
						}
					}
				}
				data_fields['annotations'] = annotations.length > 0 ? annotations.join(',') : '';

				if ($('#bootbox-media-options-content').find('.featuredAnnotation select').val() != 'none' && $('#bootbox-media-options-content').find('.featuredAnnotation select').is(':visible')) {
					data_fields['featured_annotation'] = $('#bootbox-media-options-content').find('.featuredAnnotation select').val();
				}
			}
			if ($('#use-prior-media-checkbox').is(":checked")) {
				data_fields['use-prior'] = true;
			}
			if ($form.closest('.media_options_bootbox').length) {
				$form.closest('.media_options_bootbox').modal('hide').data('bs.modal', null);
			} else {
				$this.remove();
			}

			opts.callback(data_fields);
		});
	};
	$.fn.content_selector = function(options) { // Content selector box
		// Options
		var self = this;
		var $this = $(this);
		var opts = $.extend({}, defaults, options);
		opts.orig_type = opts.type;
		// Object to VAR str
		var obj_to_vars = function(obj) {
			var str = '';
			for (var field in obj) {
				str += field + '=' + encodeURIComponent(obj[field]) + '&';
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
		var reset = function() { // TODO: for some reason 'defaults' fields are getting set despite using jQuery.extend({}, ...)
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
				for (var j = opts.queue.length - 1; j >= 0; j--) {
					if (opts.queue[j].uri == node.uri) {
						opts.queue.splice(j, 1);
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
			var get_vars = { rec: 0, ref: 0 };
			if ('composite' == opts.type || 'page' == opts.type) {
				type = 'composite';
			} else if ('media' == opts.type) {
				type = 'media';
			} else if (opts.type) {
				type = opts.type;
			}
			opts.type = type;
			get_vars.rec = (opts.rec > 0) ? opts.rec : 0;
			if (opts.sq != null) get_vars.sq = opts.sq;
			if (opts.pagination) {
				get_vars.start = opts.start;
				get_vars.results = opts.resultsPerPage;
			}
			var url = opts.parent + 'rdf/instancesof/' + type.replace(/\s+/g, '').toLowerCase() + '?format=json&' + obj_to_vars(get_vars);
			return url;
		};
		// Search
		var esearch = function(val) { // Search via the API
			var okay_to_search = ['media', 'file', 'composite', 'page', 'content'];
			if (opts.orig_type && -1 == okay_to_search.indexOf(opts.orig_type)) {
				alert('Search is not presently supported for the ' + opts.orig_type + ' type');
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
			var head = parseInt($content_selector_bootbox.find('.modal-header').outerHeight());
			if (head < 60) head = 60; // Magic number
			var foot_el = $content_selector_bootbox.find('.footer');
			if (foot_el.is(':hidden')) {
				var foot = 52; // Magic number; it seems iOS ignores this while it also ensures that on desktop there's no "jump"
			} else if (!foot_el.length) {
				var foot = 52; // Magic number
			} else {
				var foot = parseInt(foot_el.height());
			}
			var $body = $content_selector_bootbox.find('.modal-body');
			var bodyPadding = $body.outerHeight() - $body.height();
			var window_height = parseInt($(window).height());
			var val = window_height - head - foot - (margin * 2) - bodyPadding;
			$this.find('.content').height(val);
		};
		// Initialize the interface
		var init = function() {
			//If we already have an element, don't open the modal
			//Instead, grab the current node and pass it to the callback instead
			if (typeof opts.element != 'undefined') {
				if (typeof opts.element.getAttribute('href') != 'undefined' && opts.element.getAttribute('href') != null && opts.forceSelect == false) {
					var parent = null;
					//Get the slug of the currently selected node
					currentSlug = opts.element.getAttribute('resource');
					//Now that we have the slug, load the page via the api, then run the callback
					(function(slug, parent, element, callback) {
						scalarapi.loadPage(slug, true, function() {
							var node = scalarapi.getNode(slug);
							node.parent = parent;
							callback(node, element);
						}, null, 1, false, null, 0, 1);
					})(currentSlug, parent, opts.element, opts.callback);
					return;
				} else {
					var selectOptions = $(opts.element.$).data('selectOptions');
					selectOptions.forceSelect = false;
				};
			};

			$('.content_selector, .bootbox, .modal-backdrop, .tt').remove();
			var $wrapper = $('<div class="wrapper"></div>').appendTo($this);
			// Create the modal
			bootbox.hideAll()
			var box = bootbox.dialog({
				message: '<div id="bootbox-content-selector-content" class="heading_font"></div>',
				title: (('string'==typeof(opts.msg) && opts.msg.length)?opts.msg:'Select content'),
				className: 'content_selector_bootbox',
				animate: true // This must remain true for iOS, otherwise the wysiwyg selection goes away
			});
			$('.bootbox').find('.modal-title').addClass('heading_font').css('font-size','2rem');
			// Default content
			var $content = $('<div class="content"></div>').appendTo($wrapper);
			var $nodeCount;
			var $selector = $('<div class="selector" style="height: 100%; width: 100%;"></div>').appendTo($content)
			var options = {};
			options.resultsPerPage = opts.resultsPerPage;
			options.allowMultiple = opts.multiple;
			options.allowChildren = false;
			opts.rec = 1;
			if (!opts.multiple) {
				options.onChangeCallback = $.proxy(function(box, opts) {
					if (("undefined" !== typeof $(this).find('.node_selector').data('nodes') && $(this).find('.node_selector').data('nodes').length > 0)) {
						opts.callback($(this).find('.node_selector').data('nodes')[0], opts.element);
						box.modal('hide');
					}
				}, $selector, box, opts);
			} else {
				options.nodeCountContainer = $nodeCount = $('<span class="node_count text-warning form-control-static pull-right"></span>');
			}
			if ("undefined" !== typeof opts.type && opts.type != null) {
				if ($.isArray(opts.type)) {
					options.types = opts.type;
					options.defaultType = opts.type[0];
				} else {
					options.types = [opts.type];
					options.defaultType = opts.type;
				}
			}
			var $content_selector_bootbox = $('.content_selector_bootbox');
			$this.appendTo($('#bootbox-content-selector-content'))
			$content_selector_bootbox.find('.modal-dialog').width('auto').css('margin-left', '20px').css('margin-right', '20px');
			$('.bootbox-close-button').empty();
			$(window).on('resize', function() {
				modal_height();
			});
			box.on("hidden.bs.modal", function() {
				reset();
			});
			$selector.node_selection_dialogue(options);
			// Footer buttons
			var $footer = $('<div class="footer"><div><a href="javascript:void(null);" class="btn btn-default generic_button">Create page on-the-fly</a> &nbsp; &nbsp;</div><div><a href="javascript:void(null);" class="cancel btn btn-default generic_button">Cancel</a></div></div>').appendTo($wrapper);
			// Bootstrap positioning
			$footer.find('.cancel').hide(); // Remove cancel button
			modal_height(); // TODO: I can't get rid of the small jump ... for some reason header and footer height isn't what it should be on initial modal_height() call
			// Behaviors
			$footer.hide(); // Default
			$footer.find('a:first').on('click', function() { // On-the-fly
				$footer.hide();
				$content.hide();
				var $onthefly = $('<div class="create_onthefly"><div>Clicking "Save and link" will create the new page then establish the selected relationship in the page editor.</div><form class="form-horizontal"></form></div>').appendTo($wrapper);
				var $buttons = $('<div class="footer onthefly_buttons"><div class="buttons"><span class="onthefly_loading">Loading...</span>&nbsp; <a href="javascript:void(null);" class="btn btn-default generic_button">Cancel</a>&nbsp; <a href="javascript:void(null);" class="btn btn-primary generic_button default">Save and link</a></div></div>').appendTo($wrapper);
				//$('<div class="heading_font title">Create new page</div>').insertBefore($options);
				//$options.hide();
				var $form = $onthefly.find('form');
				var id = $('input[name="id"]').val(); // Assuming this exists; technically not needed for session auth
				var book_urn = $('input[name="urn:scalar:book"]').val();
				if ('undefined' == typeof(book_urn) && $('link#book_id').length) book_urn = "urn:scalar:book:" + $('link#book_id').attr('href');
				$form.append('<input type="hidden" name="action" value="add" />');
				$form.append('<input type="hidden" name="native" value="1" />');
				$form.append('<input type="hidden" name="scalar:urn" value="" />');
				$form.append('<input type="hidden" name="id" value="' + id + '" />');
				$form.append('<input type="hidden" name="api_key" value="" />');
				$form.append('<input type="hidden" name="scalar:child_urn" value="' + book_urn + '" />');
				$form.append('<input type="hidden" name="scalar:child_type" value="http://scalar.usc.edu/2012/01/scalar-ns#Book" />');
				$form.append('<input type="hidden" name="scalar:child_rel" value="page" />');
				$form.append('<input type="hidden" name="urn:scalar:book" value="' + book_urn + '" />');
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
				if ('undefined' == typeof(book_urn)) {
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
						var version_slug = version_uri.replace($('link#parent').attr('href'), '');
						slug = version_slug.substr(0, version_slug.lastIndexOf('.'));
						var uri = version_uri.substr(0, version_uri.lastIndexOf('.'));
						var version = version[version_uri];
						if (version_uri.substr(version_uri.length - 1, 1) == '/') version_uri = version_uri.substr(0, version_uri.length - 1);
						if (version_slug.substr(version_slug.length - 1, 1) == '/') version_slug = version_slug.substr(0, version_slug.length - 1);
						var node = {
							content: {},
							slug: slug,
							targets: [],
							uri: uri,
							version: version,
							version_slug: version_slug,
							version_uri: version_uri
						};
						if (opts.multiple) node = [node];
						if ('undefined' != typeof(window['send_form_hide_loading'])) send_form_hide_loading();
						if ($form.closest('.content_selector_bootbox').length) {
							$form.closest('.content_selector_bootbox').modal('hide').data('bs.modal', null);
						} else {
							$form.closest('.content_selector').remove();
						}
						$('.tt').remove();
						opts.callback(node, opts.element);
						reset();
					};
					$buttons.find('.onthefly_loading').show();
					send_form($form, {}, success);
				});
			}); // /On-the-fly
			if (opts.onthefly) { // Display on-the-fly
				$footer.show();
			} else {
				$footer.find('a:first').hide();
			}
			if (opts.multiple) {
				$footer.show();
				$footer.find('div:last').append('<a href="javascript:void(null);" class="btn btn-primary generic_button default">Add Selected</a>');
				$footer.find('a:last').on('click', $.proxy(function(box, opts) {
					if (("undefined" !== typeof $(this).find('.node_selector').data('nodes') && $(this).find('.node_selector').data('nodes').length > 0)) {
						var nodes = [];
						var selected_nodes = $(this).find('.node_selector').data('nodes');
						for (node in selected_nodes) {
							nodes.push(selected_nodes[node]);
						}
						opts.callback(nodes, opts.element);
						box.modal('hide');
					}
				}, $selector, box, opts));
				$footer.append($nodeCount);
			}
		};
		// Propagate the interface
		init();
	};

	$.fn.widget_selector = function(options) {
		var self = this;
		var $this = $(this);
		var opts = options;
		var loaded_nodeLists = {};

		var isEdit = opts.isEdit;

		if (typeof isEdit == "undefined" || isEdit == null || !isEdit) {
			isEdit = false;
		}

		var parent_url = $('link#parent').attr('href');

		var reset = function() { // TODO: for some reason 'defaults' fields are getting set despite using jQuery.extend({}, ...)
			defaults.type = null;
			defaults.changeable = true;
			defaults.multiple = false;
			defaults.rec = 0;
			defaults.sq = null;
			defaults.data = [];
			defaults.queue = [];
			defaults.msg = '';
		};

		var load_node_list = function(type, promise) {
			if (typeof loaded_nodeLists[type] !== "undefined") {
				promise.resolve();
			} else {
				var url = parent_url + 'rdf/instancesof/' + type.replace(/\s+/g, '').toLowerCase() + '?format=json&rec=0&ref=0';
				$.getJSON(url, function() {}).always(function(_data) {
					if ('undefined' != typeof(_data.status)) {
						alert('There was a problem trying to get a list of content: ' + _data.status + ' ' + _data.statusText + '. Please try again.');
						return;
					}
					loaded_nodeLists[type] = [];
					for (var uri in _data) {
						if ('undefined' != typeof(_data[uri]['http://purl.org/dc/terms/hasVersion'])) {
							var item = {};
							item.uri = uri;
							item.slug = uri.replace(parent_url, '');
							item.version_uri = _data[uri]['http://purl.org/dc/terms/hasVersion'][0].value;
							item.version_slug = item.version_uri.replace(parent_url, '');
							item.content = _data[uri];
							item.version = _data[item.version_uri];
							item.title = ('undefined' != typeof(item.version["http://purl.org/dc/terms/title"])) ? item.version["http://purl.org/dc/terms/title"][0].value : '';
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
			if (!$widget_selector_bootbox.length || !$widget_selector_bootbox.find('.widgetOptions').is(':visible')) return;
			var margin = parseInt($widget_selector_bootbox.find('.modal-dialog').css('marginTop'));
			var head = parseInt($widget_selector_bootbox.find('.modal-header').outerHeight());
			if (head < 60) head = 60; // Magic number
			var window_height = parseInt($(window).height());
			var val = window_height - head - (margin * 2);
			val -= $widget_selector_bootbox.find('.modal-body').outerHeight() - $widget_selector_bootbox.find('.node_selection').outerHeight();
			$widget_selector_bootbox.find('.node_selection').height(val).trigger('doResize');
		};

		var select_widget_options = function(widget_type, isEdit) {
			var hasNodeCount = false;
			var $nodeCount;
			$('.widget_selector_bootbox').find('.modal-dialog').css('width', 'auto').css('margin-left', '20px').css('margin-right', '20px');

			if (typeof isEdit == "undefined" || isEdit == null) {
				isEdit = false;
				element = null;
			} else {
				element = opts.element;
			}
			$('#bootbox-content-selector-content').find('.widgetList').fadeOut('fast', function() {
				var $content = $('<div class="widgetOptions"></div>').appendTo('#bootbox-content-selector-content');
				var submitAction = function(e) {
					e.preventDefault();
					e.stopPropagation();
				};
				switch (widget_type) {

					case 'timeline': //Timeline.js
						if (isEdit) {
							timeline_data_type = $(element.$).data("timeline") == undefined ? "node" : "url";
						} else {
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

						$timeline_content.find('a').on('click', function(e) {
							e.preventDefault();
							timeline_data_type = $(this).data('type');
							$(this).tab('show');
						});
						$timeline_content.find('a[data-type="' + timeline_data_type + '"]').trigger('click');

						$('<div class="widget_data_type">Choose any Scalar item whose contents include <a target="_blank" href="http://scalar.usc.edu/works/guide2/timeline-layout#metadata">temporal metadata</a>.</div>').appendTo($nodeTimeline);

						var opts = {};
						if (isEdit) {
							var $el = $(element.$);
							if ($el.attr("resource") != undefined) {
								opts.selected = [$el.attr("resource")];
							} else if ($el.data("nodes") != undefined) {
								opts.selected = $el.data("nodes").split(",");
							}
						}
						opts.allowMultiple = true;
						opts.nodeCountContainer = $nodeCount = $('<span class="node_count text-warning form-control-static pull-right"></span>');
						hasNodeCount = true;

						opts.fields = ["title", "description", "url", "preview", "include_children"],
							opts.allowChildren = true;
						opts.types = ['composite', 'media', 'path', 'tag', 'term', 'reply'];
						opts.defaultType = 'composite';
						opts.rec = 1;

						$('<div class="node_selection timeline_node_selection">').appendTo($nodeTimeline).node_selection_dialogue(opts);

						$('<div class="widget_data_type">Enter the URL of a JSON file or Google Drive document formatted for <a target="_blank" href="https://timeline.knightlab.com">Timeline.js</a>.</div>').appendTo($urlTimeline);
						$('<div class="timeline_external_url_selector form-group"><label for="timeline_external_url">External URL</label><input type="text" class="form-control" id="timeline_external_url"></div>').appendTo($urlTimeline);

						if (isEdit) {
							if ($(element.$).data("timeline") != undefined) {
								$urlTimeline.find('.timeline_external_url_selector .form-control').val($(element.$).data("timeline"));
							}
						}

						submitAction = function(e) {
							var data = { type: "timeline", attrs: {} };
							data.isEdit = $(this).data('isEdit');
							data.attrs["data-widget"] = data.type;
							if (timeline_data_type == 'node') {
								var nodes = $('#bootbox-content-selector-content .timeline_node_selection').data('node_selection_dialogue').serialize_nodes();
								data.attrs['data-nodes'] = nodes;
								if (data.attrs['data-nodes'] == undefined || data.attrs['data-nodes'].length == 0) {
									alert("Please select Scalar content that contains your timeline's temporal data.");
									return false;
								}
								select_widget_formatting(data)
							} else {
								data.attrs['data-timeline'] = $('#bootbox-content-selector-content .timeline_external_url_selector input').val();
								if (data.attrs['data-timeline'] == undefined || data.attrs['data-timeline'] == '') {
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
						var select = '<select class="btn btn-default" name="viscontent"><option value="all">All content</option><option value="toc">Table of contents</option><option value="page">All pages</option><option value="path">All paths</option><option value="tag">All tags</option><option value="annotation">All annotations</option><option value="media">All media</option><option value="comment">All comments</option><option value="current">This page</option></select>';
						$('<div class="form-group row"><label class="text-right col-sm-4 col-sm-offset-2 control-label">What content would you like to include?</label><div class="col-sm-6">' + select + '</div></div>').appendTo($content);

						select = '<select class="btn btn-default" name="visrelations"><option value="all">All relationships</option><option value="parents-children">Parents and children</option><option value="none">No relationships</option></select>';
						$('<div class="form-group row"><label class="text-right col-sm-4 col-sm-offset-2 control-label">What relationships would you like to visualize?</label><div class="col-sm-6">' + select + '</div></div>').appendTo($content);

						select = '<select class="btn btn-default" name="visformat">' +
						'<option value="force-directed">Force-directed</option>' +
						'<option value="grid">Grid</option>' +
						'<option value="list">List</option>' +
						'<option value="map">Map</option>' +
						'<option value="radial">Radial</option>' +
						'<option value="tree">Tree</option>' +
						'<option value="word-cloud">Word cloud</option>' +
						'</select>';
						$('<div class="form-group row"><label class="text-right col-sm-4 col-sm-offset-2 control-label">What type of visualization would you like to use?</label><div class="col-sm-6">' + select + '</div></div>').appendTo($content);

						if (isEdit) {
							if ($(element.$).data("viscontent") != undefined) {
								$content.find('select[name="viscontent"]').val($(element.$).data("viscontent"));
							}
							if ($(element.$).data("visrelations") != undefined) {
								$content.find('select[name="visrelations"]').val($(element.$).data("visrelations"));
							}
							if ($(element.$).data("visformat") != undefined) {
								$content.find('select[name="visformat"]').val($(element.$).data("visformat"));
							}
						}

						submitAction = function(e) {
							var data = { type: "visualization", attrs: {} };
							data.isEdit = $(this).data('isEdit');
							var $content = $('#bootbox-content-selector-content div.widgetOptions');
							data.attrs = {
								"data-widget": data.type,
								"data-viscontent": $content.find('select[name="viscontent"]').val(),
								"data-visrelations": $content.find('select[name="visrelations"]').val(),
								"data-visformat": $content.find('select[name="visformat"]').val(),
							};
							select_widget_formatting(data)
							e.preventDefault();
							e.stopPropagation();
						}
						break;
					case 'lens':
						$singleLens = $('<div id="lens_data_single"></div>').appendTo($content);
						$('<div class="widget_data_type">Select a lens to embed in the page.</div>').appendTo($singleLens);
						var opts = {};
						if (isEdit) {
							var $el = $(element.$);
							if ($el.attr("resource") != undefined) {
								opts.selected = [$el.attr("resource")];
							} else if ($el.data("nodes") != undefined) {
								opts.selected = $el.data("nodes").split(",");
							}
						}
						opts.allowMultiple = false;
						opts.nodeCountContainer = $nodeCount = $('<span class="node_count text-warning form-control-static pull-right"></span>');
						hasNodeCount = true;

						opts.allowChildren = true;
						opts.fields = ["title", "description", "url", "preview"];
						opts.types = ['lens'];
						opts.defaultType = 'lens';
						opts.rec = 1;

						$('<div class="node_selection lens_single_selection">').appendTo($singleLens).node_selection_dialogue(opts);

						submitAction = function(e) {
							var data = { type: "lens", attrs: {} };
							data.isEdit = $(this).data('isEdit');
							data.attrs["data-widget"] = data.type;
							data.attrs["data-nodes"] = $('#bootbox-content-selector-content .lens_single_selection').data('node_selection_dialogue').serialize_nodes();
							if (data.attrs["data-nodes"] == '') {
								alert("Please select a lens for your widget.");
								return false;
							}
							var nodeList = $('#bootbox-content-selector-content .lens_single_selection .node_selector').data('nodes');
							if (nodeList.length > 1) {
								order_nodes(data, nodeList);
							} else {
								select_widget_formatting(data)
							}
							e.preventDefault();
							e.stopPropagation();
						}
						break;
					case 'map':
						$('<div class="widget_data_type">Choose any <a target="_blank" href="http://scalar.usc.edu/works/guide2/google-map-layout">geotagged</a> Scalar items (including paths or tags with geotagged contents).</div>').appendTo($content);

						var opts = {};
						if (isEdit) {
							var $el = $(element.$);
							if ($el.attr("resource") != undefined) {
								opts.selected = [$el.attr("resource")];
							} else if ($el.data("nodes") != undefined) {
								opts.selected = $el.data("nodes").split(",");
							}
						}
						opts.allowMultiple = true;
						opts.nodeCountContainer = $nodeCount = $('<span class="node_count text-warning form-control-static pull-right"></span>');
						hasNodeCount = true;

						opts.allowChildren = true;
						opts.fields = ["title", "description", "url", "preview", "include_children"];
						opts.types = ['composite', 'media', 'path', 'tag', 'term', 'reply'];
						opts.defaultType = 'composite';
						opts.rec = 1;

						$('<div class="node_selection map_node_selection">').appendTo($content).node_selection_dialogue(opts);

						submitAction = function(e) {
							var data = { type: "map", attrs: {} };
							data.attrs["data-widget"] = data.type;
							data.isEdit = $(this).data('isEdit');

							data.attrs['data-nodes'] = $('#bootbox-content-selector-content .map_node_selection').data('node_selection_dialogue').serialize_nodes();
							if (data.attrs['data-nodes'] == undefined || data.attrs['data-nodes'].length == 0) {
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
						if (isEdit) {
							var $el = $(element.$);
							if ($el.attr("resource") != undefined) {
								opts.selected = [$el.attr("resource")];
							} else if ($el.data("nodes") != undefined) {
								opts.selected = $el.data("nodes").split(",");
							}
						}
						opts.allowMultiple = true;
						opts.nodeCountContainer = $nodeCount = $('<span class="node_count text-warning form-control-static pull-right"></span>');
						hasNodeCount = true;

						opts.allowChildren = true;
						opts.fields = ["thumbnail", "title", "description", "url", "preview", "include_children"];
						opts.types = ['path', 'tag', 'term', 'media'];
						opts.defaultType = 'path';
						opts.rec = 1;

						$('<div class="node_selection carousel_multi_selection">').appendTo($multiCarousel).node_selection_dialogue(opts);

						submitAction = function(e) {
							var data = { type: "carousel", attrs: {} };
							data.attrs["data-widget"] = data.type;
							data.isEdit = $(this).data('isEdit');
							data.attrs["data-nodes"] = $('#bootbox-content-selector-content .carousel_multi_selection').data('node_selection_dialogue').serialize_nodes();
							if (data.attrs["data-nodes"] == '') {
								alert("Please select at least one media item for your carousel widget.");
								return false;
							}
							var nodeList = $('#bootbox-content-selector-content .carousel_multi_selection .node_selector').data('nodes');
							if (nodeList.length > 1) {
								order_nodes(data, nodeList);
							} else {
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
						if (isEdit) {
							var $el = $(element.$);
							if ($el.attr("resource") != undefined) {
								opts.selected = [$el.attr("resource")];
							} else if ($el.data("nodes") != undefined) {
								opts.selected = $el.data("nodes").split(",");
							}
						}
						opts.allowMultiple = true;
						opts.nodeCountContainer = $nodeCount = $('<span class="node_count text-warning form-control-static pull-right"></span>');
						hasNodeCount = true;

						opts.allowChildren = true;
						opts.fields = ["thumbnail", "title", "description", "url", "preview", "include_children"];
						opts.types = ['composite', 'media', 'path', 'tag', 'term', 'reply'];
						opts.defaultType = 'composite';
						opts.rec = 1;

						$('<div class="node_selection card_multi_selection">').appendTo($multiCard).node_selection_dialogue(opts);

						submitAction = function(e) {
							var data = { type: "card", attrs: {} };
							data.attrs["data-widget"] = data.type;
							data.isEdit = $(this).data('isEdit');
							data.attrs["data-nodes"] = $('#bootbox-content-selector-content .card_multi_selection').data('node_selection_dialogue').serialize_nodes();
							if (data.attrs["data-nodes"] == '') {
								alert("Please select at least one item for your card widget.");
								return false;
							}
							var nodeList = $('#bootbox-content-selector-content .card_multi_selection .node_selector').data('nodes');
							if (nodeList.length > 1) {
								order_nodes(data, nodeList);
							} else {
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
						if (isEdit) {
							var $el = $(element.$);
							if ($el.attr("resource") != undefined) {
								opts.selected = [$el.attr("resource")];
							} else if ($el.data("nodes") != undefined) {
								opts.selected = $el.data("nodes").split(",");
							}
						}
						opts.allowMultiple = true;
						opts.nodeCountContainer = $nodeCount = $('<span class="node_count text-warning form-control-static pull-right"></span>');
						hasNodeCount = true;

						opts.allowChildren = true;
						opts.fields = ["thumbnail", "title", "description", "url", "preview", "include_children"];
						opts.types = ['composite', 'media', 'path', 'tag', 'term', 'reply'];
						opts.defaultType = 'composite';
						opts.rec = 1;

						$('<div class="node_selection summary_multi_selection">').appendTo($multiSummary).node_selection_dialogue(opts);

						submitAction = function(e) {
							var data = { type: "summary", attrs: {} };
							data.isEdit = $(this).data('isEdit');
							data.attrs["data-widget"] = data.type;
							data.attrs["data-nodes"] = $('#bootbox-content-selector-content .summary_multi_selection').data('node_selection_dialogue').serialize_nodes();
							if (data.attrs["data-nodes"] == '') {
								alert("Please select at least one item for your summary widget.");
								return false;
							}
							var nodeList = $('#bootbox-content-selector-content .summary_multi_selection .node_selector').data('nodes');
							if (nodeList.length > 1) {
								order_nodes(data, nodeList);
							} else {
								select_widget_formatting(data)
							}
							e.preventDefault();
							e.stopPropagation();
						}
						break;
				}
				$('.bootbox').find('.modal-title').fadeOut('fast', function() { $(this).text('Select ' + widget_type + ' ' + get_config_description_for_widget_type(widget_type)).fadeIn('fast'); });
				$footer = $('<div class="modal_footer"></div>').appendTo($content);
				$('<a class="btn btn-default">&laquo; Back<a>').appendTo($footer).on('click', function() {
					$('#bootbox-content-selector-content').find('.widgetOptions').fadeOut('fast', function() {
						$(this).remove();
						$('.bootbox').find('.modal-title').fadeOut('fast', function() { $(this).text('Select a widget').fadeIn('fast'); });
						$('#bootbox-content-selector-content').find('.widgetList').fadeIn('fast');
						$('.widget_selector_bootbox .modal-dialog').css('width', 'auto').css('margin-left', '20px').css('margin-right', '20px');
					});
				})
				$('<a class="btn btn-primary pull-right">Continue</a>').appendTo($footer).on('click', submitAction).data("isEdit", isEdit);

				if (hasNodeCount) {
					$nodeCount.appendTo($footer);
				}
				$content.append('<div class="clearfix"></div>');
				modal_height();
			});
		}
		var order_nodes = function(options, nodeList) {

			$('#bootbox-content-selector-content').find('.widgetOptions').fadeOut('fast', function() {

				$('.widget_selector_bootbox').find('.modal-dialog').css('width', '').css('margin-left', '').css('margin-right', '');

				$('.bootbox').find('.modal-title').fadeOut('fast', function() { $(this).text('Reorder selected pages').fadeIn('fast'); });
				var submitAction = function(e) {
					e.preventDefault();
					e.stopPropagation();
					var nodeList = [];
					$('.nodeOrdering .nodeItem').each(function() {
						var slug = $(this).data('slug') + ($(this).find('.selectedNodeChildrenList').length > 0 ? '*' : '');
						nodeList.push(slug);
					});
					options.attrs['data-nodes'] = nodeList.join(',');
					select_widget_formatting(options);
					return false;
				};

				var $nodes = $('<div class="btn-group-vertical center-block" role="group" aria-label=""></div>');

				for (var n in nodeList) {
					var node = nodeList[n];
					var $node = $('<div class="btn btn-default nodeItem"><span class="glyphicon glyphicon-menu-hamburger" aria-hidden="true"></span> &nbsp; ' + node.title + '</div>').data('slug', node.slug);
					if (typeof node.include_children !== 'undefined' && node.include_children) {
						$node.append('<div class="selectedNodeChildrenList text-muted">Includes children:</div>');
						$childList = $('<ul></ul>').appendTo($node.find('.selectedNodeChildrenList'));
						for (var t in node.targets) {
							$childList.append('<li><small>' + node.targets[t].target.current.title + '</small></li>');
						}
					}
					$nodes.append($node);
				}

				var $content = $('<div class="nodeOrdering"><div class="widget_data_type">If you would like to reorder the selected content for this widget, you may do so by clicking and dragging. When you are satisfied with the order, click "Continue" below.</div></div>').appendTo('#bootbox-content-selector-content').data('options', options).hide();

				$nodes.appendTo($content).sortable();
				$nodes.sortable('enable');
				$nodes.sortable({
					scroll: false,
					placeholder: "sortable-destination",
					helper: 'clone',
					appendTo: '.widget_selector_bootbox'
				});

				$footer = $('<div class="modal_footer"></div>').appendTo($content);
				$('<a class="btn btn-default">&laquo; Back<a>').appendTo($footer).on('click', function() {
					$('#bootbox-content-selector-content').find('.nodeOrdering').fadeOut('fast', function() {
						$(this).remove();
						$('.widget_selector_bootbox .modal-dialog').css('width', 'auto').css('margin-left', '20px').css('margin-right', '20px');
						$('.bootbox').find('.modal-title').fadeOut('fast', function() { $(this).text('Select ' + options.type + ' ' + get_config_description_for_widget_type(options.type)).fadeIn('fast'); });
						$('#bootbox-content-selector-content').find('.widgetOptions').fadeIn('fast', function() {
							modal_height();
						});
					});
				});
				$('<a class="btn btn-primary pull-right">Continue</a>').appendTo($footer).on('click', submitAction);
				$content.append('<div class="clearfix"></div>');
				window.setTimeout($.proxy(function() { $(this).fadeIn(200); }, $content), 200);
			});
		}
		var select_widget_formatting = function(options) {

			var isEdit = options.isEdit;

			if (typeof isEdit == "undefined" || isEdit == null || !isEdit) {
				isEdit = false;
			}
			$previous_page = $('#bootbox-content-selector-content').find('.nodeOrdering').length > 0 ? $('#bootbox-content-selector-content').find('.nodeOrdering') : $('#bootbox-content-selector-content').find('.widgetOptions');
			$previous_page.fadeOut('fast', function() {

				$('.widget_selector_bootbox .modal-dialog').css('width', '').css('margin-left', '').css('margin-right', '');

				$('.bootbox').find('.modal-title').fadeOut('fast', function() { $(this).text('Choose formatting').fadeIn('fast'); });
				var submitAction = function(e) {
					e.preventDefault();
					e.stopPropagation();
					var widget = { attrs: $('#bootbox-content-selector-content').find('.widgetFormatting').data('options').attrs, isEdit: opts.isEdit };
					$('#bootbox-content-selector-content').find('.widgetFormatting select').each(function() {
						if ($(this).attr('name') == "caption") {
							widget.attrs['data-caption'] = $(this).val();
							if ($(this).val() == 'custom_text') {
								widget.attrs['data-custom_caption'] = $('#bootbox-content-selector-content').find('#caption_text').val();
							}
						} else if ($(this).attr('name') == "numbering") {
							if ($(this).val() == 'hide_slide_numbers') {
								widget.attrs['data-hide_numbering'] = true;
							} else {
								delete widget.attrs['data-hide_numbering'];
							}
						} else {
							widget.attrs['data-' + $(this).attr('name')] = $(this).val();
						}
					});
					opts.callback(widget, opts.element);
					bootbox.hideAll();
				};

				var formattingOptions = {
					Size: ['Small', 'Medium', 'Large', 'Full'],
					TextWrap: ['Create new line for widget', 'Wrap text around widget'],
					Align: (typeof opts.inline != 'undefined' && opts.inline) ? ['Right', 'Center', 'Left'] : ['Right', 'Left']
				};
				if (options.type !== "card" && options.type !== "summary") {
					if ((typeof options.attrs.resource == 'undefined' || options.attrs.resource == null) && (typeof options.attrs['data-nodes'] == 'undefined' || options.attrs['data-nodes'].indexOf(',') >= 0)) {
						formattingOptions.Caption = ['None', 'Custom text'];
					} else {
						formattingOptions.Caption = ['Description', 'Title', 'Title and description', 'None', 'Custom text'];
					}
				}

				//Need to limit formatting options per widget type here
				switch (options.type) {
					case 'timeline':
					case 'visualization':
					case 'carousel':
						formattingOptions.Size = ['Medium', 'Large', 'Full'];
				}

				if (options.type == "carousel") {
					formattingOptions.Numbering = ["Show slide numbers", "Hide slide numbers"]
				}

				if (options.type == "card") {
					formattingOptions.Size = ['Small', 'Medium'];
				}

				if (options.type == "summary") {
					formattingOptions.Size = ['Medium', 'Large', 'Full'];
				}

				if (options.type == "visualization" && options.attrs['data-visformat'] == 'radial') {
					formattingOptions.Size = ['Full'];
				}

				if (options.type == "lens") {
					formattingOptions.Size = ['Medium', 'Large', 'Full'];
				}

				if (options.type == "timeline") {
					formattingOptions.Zoom = ['25%','50%','100%','200%','400%'];
				}

				var formattingSelection = '<div class="form-horizontal heading_font">';
				for (var o in formattingOptions) {

					if (o == "TextWrap") {
						if (typeof opts.inline !== 'undefined' && opts.inline) {
							var values = '<select class="btn btn-default" name="textwrap"><option value="nowrap">Create new line for widget</option><option value="wrap">Wrap text around widget</option></select>';
							formattingSelection += '<div class="form-group"><label class="col-sm-2 col-sm-offset-3 control-label">Text wrap:</label><div class="col-sm-5">' + values + '</div></div>';
						}
					} else {
						var values = '<select class="btn btn-default" name="' + o.toLowerCase() + '">';
						for (var v in formattingOptions[o]) {
							if(o == "Zoom"){
								var val = parseFloat(formattingOptions[o][v].replace('%',''))/50.0;
								values += '<option value="' + val + '">' + formattingOptions[o][v] + '</option>';
							}else{
								values += '<option value="' + formattingOptions[o][v].toLowerCase().replace(/ /g, "_") + '">' + formattingOptions[o][v] + '</option>';
							}
						}
						values += '</select>';

						formattingSelection += '<div class="form-group"><label class="col-sm-2 col-sm-offset-3 control-label">' + o + ':</label><div class="col-sm-5">' + values + '</div></div>';
						if (o == "Caption") {
							formattingSelection += '<div class="form-group" id="caption_text_group" style="display: none;"><label class="col-sm-2 col-sm-offset-3 control-label">Custom caption:</label><div class="col-sm-5"><textarea class="form-control" id="caption_text"></textarea></div></div>';
						}
					}
				}
				formattingSelection += '</div>';
				var $content = $('<div class="widgetFormatting"></div>').appendTo('#bootbox-content-selector-content').data('options', options).hide();
				$content.append(formattingSelection);

				$content.find('select[name="caption"]').on('change', function() {
					if ($(this).val() == 'custom_text') {
						$content.find('#caption_text_group').show();
					} else {
						$content.find('#caption_text_group').hide();
					}
				});

				$content.find('select[name="zoom"]').val('2');

				$content.find('select[name="textwrap"]').on('change', function() {
					if ($(this).val() == 'wrap') {

						if ($content.find('select[name="align"]').val() == "center") {
							$content.find('select[name="align"]').val("left");
						}
						$content.find('select[name="align"] option[value="center"]').hide();
					} else {
						$content.find('select[name="align"] option[value="center"]').show();
					}
				});

				$footer = $('<div class="modal_footer"></div>').appendTo($content);
				$('<a class="btn btn-default">&laquo; Back<a>').appendTo($footer).on('click', function() {
					$('#bootbox-content-selector-content').find('.widgetFormatting').fadeOut('fast', function() {
						$(this).remove();
						if ($('#bootbox-content-selector-content').find('.nodeOrdering').length > 0) {
							$('.bootbox').find('.modal-title').fadeOut('fast', function() { $(this).text('Reorder selected pages').fadeIn('fast'); });
							$('#bootbox-content-selector-content').find('.nodeOrdering').fadeIn('fast');
						} else {
							$('.widget_selector_bootbox .modal-dialog').css('width', 'auto').css('margin-left', '20px').css('margin-right', '20px');
							$('.bootbox').find('.modal-title').fadeOut('fast', function() { $(this).text('Select ' + options.type + ' ' + get_config_description_for_widget_type(options.type)).fadeIn('fast'); });
							$('#bootbox-content-selector-content').find('.widgetOptions').fadeIn('fast', function() {
								modal_height();
							});
						}
					});
				})
				$('<a class="btn btn-primary pull-right">' + (isEdit ? 'Done' : 'Insert ' + options.type + ' widget') + '</a>').appendTo($footer).on('click', submitAction);
				$content.append('<div class="clearfix"></div>');
				window.setTimeout($.proxy(function() { $(this).fadeIn(200); }, $content), 200);
				if (isEdit) {
					$('#bootbox-content-selector-content').find('.widgetFormatting select').each(function() {
						if ($(this).attr('name') == 'textwrap') {
							if (opts.element.hasClass('wrap')) {
								$(this).val('wrap');
								$content.find('select[name="align"] option[value="center"]').hide();
							}
						} else if ($(this).attr('name') == 'numbering') {
							var data = $(opts.element.$).data('hide_numbering');
							if (data) {
								$(this).val('hide_slide_numbers');
							}
						} else {
							var data = $(opts.element.$).data($(this).attr('name'));
							if (data != undefined) {
								$(this).val(data);
								if (data == 'custom_text') {
									$content.find('#caption_text_group').show().find('textarea').val($(opts.element.$).data('custom_caption'));
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
			animate: true // This must remain true for iOS, otherwise the wysiwyg selection goes away
		});
		$(box).find('.modal-dialog').css('width', 'auto').css('margin-left', '20px').css('margin-right', '20px').removeClass('modal-lg');

		$('.bootbox').find('.modal-title').addClass('heading_font');

		$this.appendTo($('#bootbox-content-selector-content'));
		var $widget_selector_bootbox = $('.widget_selector_bootbox');
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

		var icon_base_url = $('link#approot').attr('href') + 'views/melons/cantaloupe/images/';
		var widget_types = [{
				name: "Timeline",
				description: "Temporal view built with metadata from a Scalar path or a remote document (uses Timeline.js).",
				icon: "widget_image_timeline.png"
			},
			{
				name: "Visualization",
				description: "Various visualizations of Scalar pages, media, and their relationships.",
				icon: "widget_image_visualization.png"
			},
			{
				name: "Lens",
				description: "Living snapshots of the content of a book, visualizing dynamic selections of pages and media.",
				icon: "widget_image_lens.png"
			},
			{
				name: "Map",
				description: "Geographic view that plots geotagged Scalar content on a map (uses Google Maps).",
				icon: "widget_image_map.png"
			},
			{
				name: "Carousel",
				description: "Responsive gallery that allows users to flip through a path's media.",
				icon: "widget_image_carousel.png"
			},
			{
				name: "Card",
				description: "Informational cards showing thumbnails, titles, and descriptions for one or more pieces of Scalar content.",
				icon: "widget_image_card.png"
			},
			{
				name: "Summary",
				description: "Rows of thumbnails, titles, and descriptions for one or more pieces of Scalar content.",
				icon: "widget_image_summary.png"
			}
		];

		for (var i = 0; i < widget_types.length; i++) {
			var widget = widget_types[i];
			var $widget = $('<div class="widget_type"><img class="pull-left" src="' + icon_base_url + widget.icon + '"><a class="uppercase"><strong>' + widget.name + '</strong></a><br />' + widget.description + '</div>').data('type', widget.name);
			$widget.on('click', function(e) {
				select_widget_options($(this).data('type').toLowerCase(), false);
				e.preventDefault();
				e.stopPropagation();
				return false;
			});

			$widget.appendTo($widgets);

			if (i < widget_types.length - 1) {
				$widgets.append('<hr />');
			} else {
				$widgets.append('<br />');
			}
		}
		$this.append($widgets);
		if (isEdit) {
			select_widget_options($(options.element.$).data('widget'), true);
			$('#bootbox-content-selector-content').find('.widgetList').hide();
		}
	}

	//Node Selector Plugin
	$.fn.node_selection_dialogue = function(options) {

		var self = this;
		var $this = $(this);
		var parent_url = $('link#parent').attr('href');

		var loaded_nodeLists = {};
		var search_results = [];
		var lastLoadType = "init";
		var lastLoadCriteria = {};
		var lastPage = false;

		var isset = function(x) { return typeof x !== 'undefined' && x !== null; };
		var toProperCase = function(x) { return x.replace(/\w\S*/g, function(x) { return x.charAt(0).toUpperCase() + x.substr(1).toLowerCase(); }); }

		var load_node_list = function(options) {
			lastLoadCriteria = options;
			var promise = options.promise;
			var doSearch = false;
			var type = options.type;
			if ("undefined" !== typeof options.search && options.search !== null) {
				doSearch = true;
				var search = options.search;
				if (options.page == 0) {
					search_results = [];
				}
			}
			var ref = options.ref;
			var rec = options.rec;
			if ('users' == type) {
				var url = parent_url + 'rdf?format=json&u_all=1';
			} else {
				var url = parent_url + 'rdf/instancesof/' + type.replace(/\s+/g, '').toLowerCase() + '?format=json&rec=' + rec + '&ref=' + ref + '&start=' + (options.page * opts.resultsPerPage) + "&results=" + opts.resultsPerPage;
			};
			if (-1 != opts.fields.indexOf('last_edited_by')) {
				url += '&prov=1';
			}
			if (-1 != opts.fields.indexOf('edit') || (opts.editorialOptions !== false && (type.replace(/\s+/g, '').toLowerCase()==='hidden' || type.replace(/\s+/g, '').toLowerCase()==='content'))) {
				url += '&hidden=1';
			};
			if (doSearch) {
				url += "&sq=" + search;
			};
			if (opts.s_all) {
				url += '&meta=1';
				url += '&s_all=1';
			} else {
				if ('search' == lastLoadType && $('#content_selector_s_all').is(':checked')) {
					url += '&meta=1';
					url += '&s_all=1';
				} else if (opts.includeMetadata) {
					url += '&meta=1';
					url += '&s_all=0';
				} else {
					url += '&meta=0';
					url += '&s_all=0';
				}
			}
			if (!doSearch && typeof loaded_nodeLists[type] !== "undefined" && options.page == 0) {
				promise.resolve();
			} else {
				$.getJSON(url, function() {}).always(function(_data) {
					$this.data('_data', _data);
					if ('undefined' != typeof(_data.status)) {
						alert('There was a problem trying to get a list of content: ' + _data.status + ' ' + _data.statusText + '. Please try again.');
						return;
					}
					if(typeof scalarapi !== "undefined"){
						scalarapi.parsePage(_data);
					}
					if (!doSearch && options.page == 0) {
						loaded_nodeLists[type] = [];
					}
					rel_filter_match = false;
					// First look for relationship nodes and term nodes
					for (var uri in _data) {
						if (uri.indexOf('urn:scalar:' + type) > -1) {
							var body = _data[uri]['http://www.openannotation.org/ns/hasBody'][0]['value'].split('#')[0];
							body = body.substr(0, body.lastIndexOf('.'));
							_data[body].matchesFilter = true;
							rel_filter_match = true;
						}
						if (uri.indexOf('urn:scalar:') > -1 && uri.indexOf('urn:scalar:term') == -1) {
							var body = _data[uri]['http://www.openannotation.org/ns/hasBody'][0]['value'].split('#')[0];
							body = body.substr(0, body.lastIndexOf('.'));
							var target = _data[uri]['http://www.openannotation.org/ns/hasTarget'][0]['value'].split('#')[0];
							target = target.substr(0, target.lastIndexOf('.'));

							if (typeof _data[target] !== 'undefined') {
								if ("undefined" === typeof _data[body].rel) {
									_data[body].rel = [];
								}
								var version = _data[_data[target]['http://purl.org/dc/terms/hasVersion'][0].value];
								_data[target].target = { current: { title: ('undefined' !== typeof(version["http://purl.org/dc/terms/title"])) ? version["http://purl.org/dc/terms/title"][0].value : '' } };
								_data[body].rel.push(_data[target]);
								have_relationships = true;
							}
						}
					}
					// If we have relationships, then assume we only want nodes w/ relationships
					if (type != 'composite' && rel_filter_match) {
						for (var uri in _data) {
							if ('undefined' != typeof(_data[uri]['http://purl.org/dc/terms/hasVersion']) && "undefined" == typeof _data[uri].matchesFilter) {
								_data[uri]['http://purl.org/dc/terms/hasVersion'] = undefined;
							}
						}
					}
					var added_rows = 0;
					if ('users' == type) {
						for (var uri in _data) {
							// Is a Book (e.g., so we can get book users)
							if ('undefined' != typeof(_data[uri]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']) && 'http://scalar.usc.edu/2012/01/scalar-ns#Book' == _data[uri]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][0].value) {
								if ('undefined' != typeof(_data[uri]['http://rdfs.org/sioc/ns#has_owner'])) {
									for (var k = 0; k < _data[uri]['http://rdfs.org/sioc/ns#has_owner'].length; k++) {
										var item = {};
										var arr = _data[uri]['http://rdfs.org/sioc/ns#has_owner'][k].value.split('#');
										item.uri = arr[0];
										for (var m = 0; m < arr[1].split('&').length; m++) {
											var user_var = arr[1].split('&')[m].split('=');
											item[user_var[0]] = user_var[1];
										};
										item.content = _data[item.uri];

										if(typeof loaded_nodeLists == "undefined"){
											loaded_nodeLists = {};
										}
										if(typeof loaded_nodeLists[type] == "undefined"){
											loaded_nodeLists[type] = [];
										}
										loaded_nodeLists[type].push(item);
										added_rows++;
									};
								};
							};
						};
						lastPage = true
					} else {
						for (var uri in _data) {
							// Is a Version
							if ('undefined' != typeof(_data[uri]['http://purl.org/dc/terms/hasVersion'])) {
								var item = {};
								item.uri = uri;
								item.slug = uri.replace(parent_url, '');
								item.version_uri = _data[uri]['http://purl.org/dc/terms/hasVersion'][0].value;
								item.version_slug = item.version_uri.replace(parent_url, '');
								item.content = _data[uri];
								item.version = _data[item.version_uri];
								item.hasThumbnail = false;

								if(typeof scalarapi !== "undefined"){
									var node = scalarapi.getNode(item.slug);
									item.node_type = node.getDominantScalarType().id;
									if(!!node.current.mediaSource){
										item.content_type = node.current.mediaSource.name;
									}
								}

								item.title = ('undefined' !== typeof(item.version["http://purl.org/dc/terms/title"])) ? item.version["http://purl.org/dc/terms/title"][0].value : '';
								item.targets = 'undefined' !== typeof _data[uri].rel ? _data[uri].rel : [];
								if ('undefined' !== typeof item.content['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail']) {
									item.thumbnail = item.content['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'][0]['value'];
									item.hasThumbnail = true;
								} else {
									item.thumbnail = $('link#approot').attr('href') + 'views/melons/cantaloupe/images/media_icon_chip.png';
								}
								item.hasRelations = 'undefined' !== typeof item.content.rel;
								if (doSearch) {
									search_results.push(item);
								} else {
									if(typeof loaded_nodeLists == "undefined"){
										loaded_nodeLists = {};
									}
									if(typeof loaded_nodeLists[type] == "undefined"){
										loaded_nodeLists[type] = [];
									}
									loaded_nodeLists[type].push(item);
								}
								added_rows++;
							};
						};
						lastPage = added_rows == 0;
					};
					promise.resolve();
				});
			}
		}
		var fieldWidths = {
			editorial_state_border: .25,
			thumbnail: 2,
			title: 4,
			name: 4,
			description: 6,
			url: 4,
			email: 4,
			homepage: 4,
			preview: 2,
			include_children: 2,
			visible: 3,
			listed: 2,
			order: 2,
			role: 2,
			last_edited_by: 4,
			date_created: 4,
			date_edited: 4,
			editorial_state: 3,
			usage_rights: 4,
			versions: 2,
			edit: 3,
			bio_contributions: 4,
			format : 3
		}
		var defaultCallback = function() {};
		var opts = {
			"fields": ["thumbnail", "title", "description", "url", "preview"],
			"allowMultiple": false,
			"rec": 0,
			"ref": 0,
			"defaultType": 'composite',
			"types": ['composite', 'media', 'path', 'tag', 'annotation', 'reply', 'lens', 'hidden'],  /* 'term' */
			"resultsPerPage": 50,
			"allowChildren": false,
			"selected": [],
			"onChangeCallback": defaultCallback,
			"userOptions": false,
			"deleteOptions": false,
			"deleteButton": 'Delete selected',
			"addOptions": false,
			"editorialOptions": false,
			"contributionsOptions": false,
			"displayHeading": true,
			"rowSelectMethod": 'checkbox', /* checkbox|highlight */
			"isEdit": false,
			"editable": [],
			"startEditTrigger": 'click',
			"roles": ['author', 'commentator', 'reviewer', 'reader']
		};

		$.extend(opts, options);

		var current_type = opts.defaultType;
		if(opts.types.indexOf(current_type) === -1){
			opts.defaultType = current_type = opts.types[0];
		}

		var init_promise = $.Deferred();

		var dialogue_container = '<div class="panel-default node_selector"> \
																	<div class="panel-heading"> \
																		<div class="row"> \
																			<div class="col-xs-3 node_filter"> \
																				<div class="node_types"> \
																					<select class="btn btn-default generic_button large"></select> \
																					<div class="filter_spinner form-control"><div class="spinner_container"></div></div> \
																					<br class="visible-xs"> \
																				</div> \
																			</div> \
																			<div class="col-xs-9" style="text-align:right;"> \
																				<div class="caption_font col-xs-12 col-md-7" onmouseover="$(this).css(\'color\',\'#444444\')" onmouseout="$(this).css(\'color\',\'#aaaaaa\')" style="font-size:14px; color:#aaaaaa; text-align:right; padding-top:5px;">Search: &nbsp; <label for="content_selector_s_not_all" style="font-weight:normal;"><input tabindex="9002" type="radio" id="content_selector_s_not_all" name="s_all" value="0" checked=""> &nbsp;title &amp; description</label> &nbsp; <label for="content_selector_s_all" style="font-weight:normal;"><input tabindex="9003" type="radio" id="content_selector_s_all" name="s_all" value="1"> &nbsp;all fields &amp; metadata</label></div> \
																				<div class="input-group node_search col-xs-12 col-md-5"> \
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
																				<tbody class="node_rows"><tr class="text-muted loadingRow"><td class="text-center" colspan="' + (opts.fields.length + (opts.allowMultiple ? 1 : 0)) + '">Loading&hellip;</td></tr></tbody> \
																			</table> \
																		</div> \
																	</div> \
																	<div class="panel-footer"> \
																		<div class="row"> \
																			<div class="col-sm-5 col-sm-offset-7 col-md-4 col-md-offset-8 selected_node_count text-warning text-right"></div> \
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
			$dialogue_container.find('.spinner_container').each(function() {
				$(this).append(spinner.el).hide();
			});
		};
		var htmlspecialchars = function(string, quoteStyle, charset, doubleEncode) {
			var optTemp = 0
			var i = 0
			var noquotes = false
			if (typeof quoteStyle === 'undefined' || quoteStyle === null) {
				quoteStyle = 2
			}
			string = string || ''
			string = string.toString()
			if (doubleEncode !== false) {
				// Put this first to avoid double-encoding
				string = string.replace(/&/g, '&amp;')
			}
			string = string
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
			var OPTS = {
				'ENT_NOQUOTES': 0,
				'ENT_HTML_QUOTE_SINGLE': 1,
				'ENT_HTML_QUOTE_DOUBLE': 2,
				'ENT_COMPAT': 2,
				'ENT_QUOTES': 3,
				'ENT_IGNORE': 4
			}
			if (quoteStyle === 0) {
				noquotes = true
			}
			if (typeof quoteStyle !== 'number') {
				// Allow for a single string or an array of string flags
				quoteStyle = [].concat(quoteStyle)
				for (i = 0; i < quoteStyle.length; i++) {
					// Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
					if (OPTS[quoteStyle[i]] === 0) {
						noquotes = true
					} else if (OPTS[quoteStyle[i]]) {
						optTemp = optTemp | OPTS[quoteStyle[i]]
					}
				}
				quoteStyle = optTemp
			}
			if (quoteStyle & OPTS.ENT_HTML_QUOTE_SINGLE) {
				string = string.replace(/'/g, '&#039;')
			}
			if (!noquotes) {
				string = string.replace(/"/g, '&quot;')
			}
			return string
		};
		var ucwords = function(str) { // http://locutus.io/php/ucwords/
			return (str )
				.replace(/^(.)|\s+(.)/g, function($1) {
					return $1.toUpperCase()
				})
		}
		var getScrollbarWidth = function() {
		    var outer = document.createElement("div");
		    outer.style.visibility = "hidden";
		    outer.style.width = "100px";
		    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

		    document.body.appendChild(outer);

		    var widthNoScroll = outer.offsetWidth;
		    // force scrollbars
		    outer.style.overflow = "scroll";

		    // add innerdiv
		    var inner = document.createElement("div");
		    inner.style.width = "100%";
		    outer.appendChild(inner);

		    var widthWithScroll = inner.offsetWidth;

		    // remove divs
		    outer.parentNode.removeChild(outer);

		    return widthNoScroll - widthWithScroll;
		}

		if(isset(opts.useEditorialRules) && opts.useEditorialRules){
			var state_flow = {};
	        if(typeof opts.userType !== 'undefined' && opts.userType != null && (opts.userType === 'editor' || opts.userType === 'author')){
	        	state_flow = opts.userType == 'author'?{'Draft' : ['Edit'], 'Edit_Review' : ['Edit','Clean']}:
	        										   {'Edit' : ['Draft','Edit_Review'], 'Clean' : ['Edit_Review','Ready'], 'Ready' : ['Clean','Published'], 'Published' : ['Ready','Published']};

	        	//Check to see if we're using editions - if so, remove the published state from the flow, and prevent moving to published.
	        	if($('.row.editions').length > 0 && !!state_flow.Published){
	        		delete state_flow.Published;
	        		if(!!state_flow.Ready){
	        			var newReadyStates = [];
	        			for(var i in state_flow.Ready){
	        				if(state_flow.Ready[i] != "Published"){
	        					newReadyStates.push(state_flow.Ready[i]);
	        				}
	        			}
	        			state_flow.Ready = newReadyStates;
	        		}
	        	}
	        }
        }

		var scrollBarWidth = getScrollbarWidth();
		var resizeEditorialBorder = $.proxy(function(){
			$dialogue_container.find('td[property="editorial_state_border"]').hide().each(function(){
				$(this).height($(this).parents('tr').outerHeight()).show();
			});
		}, this, $dialogue_container);
		var resize = $.proxy(function($dialogue_container) {
			var pips_per_row = 0;
			$dialogue_container.find('thead th').each(function(){
				if(!$(this).is(':visible')){
					return;
				}
				pips_per_row += $(this).data('width');
			});
			$dialogue_container.find('thead th,tbody td').each(function(){
				$(this).css('width',100*($(this).data('width')/pips_per_row)+'%');
			});

			$dialogue_container.find('td[property="editorial_state_border"]').hide();

			$dialogue_container.show().find('.node_selector_table_body table').hide();
			$dialogue_container.find('.node_selector_table_body').css('height','auto');
			var height = $(this).height();

			if (!opts.displayHeading) {
				$dialogue_container.find('.panel-heading').hide();
				var heading_height = 0;
			} else {
				$dialogue_container.find('.panel-heading').show();
				var heading_height = $(this).find('.panel-heading').outerHeight();
			}

			var body_height = $(this).find('.panel-body').outerHeight();
			var footer_height = $(this).find('.panel-footer').outerHeight();
			var usedContainerHeight = false;

			if(self[0].style.height && self[0].style.height!=='100%'){ //Check if we are explicitly setting the height on the container
				if(self[0].style.height.indexOf('px')!==-1){
					var containerHeight = parseInt(self[0].style.height) || 0;
				}else{
					var containerHeight = $(self).height();
				}
				height = containerHeight;
				usedContainerHeight= true;
			}

			height -= (heading_height+body_height+footer_height);
			height = Math.max(height, 400);

			if(usedContainerHeight){
				var newContainerHeight = height+(heading_height+body_height+footer_height);
				if(newContainerHeight>containerHeight){
					self.height(newContainerHeight);
				}
			}

			$dialogue_container.find('.node_selector_table_body').css('height',height+'px').find('table').show();

			var body = $dialogue_container.find('.node_selector_table_body')[0];

			if (body.offsetHeight < body.scrollHeight) {
				$dialogue_container.find('.panel-body>table').css('width',($dialogue_container.find('.panel-body').width()-scrollBarWidth)+'px');
			} else {
			    $dialogue_container.find('.panel-body>table').css('width','100%');
			}

			resizeEditorialBorder();
		}, this, $dialogue_container);
		var shorten_description = function(description) {
			var max_chars = 200; // Magic number...
			var words = description.split(" ");
			var cur_length = 0;
			var string = '';
			for (var i = 0; i < words.length; i++) {
				var word = words[i];
				if (string != '') {
					word = ' ' + word;
				}
				if (cur_length + word.length <= max_chars) {
					string += word;
					cur_length += word.length;
				} else {
					string += '&hellip;';
					break;
				}
			}
			return string;
		};
		var push_row = function(post, callback) {
			$('#saving').show();
			$.ajax({
				  type: "POST",
				  url: 'api/save_row',
				  data: post,
				  success: function(data) {
				  	  if(!!data && !data.error){
				  	  	data.error = false;
				  	  }else if(!!data.error){
				  	  	data.error = "Something went wrong while trying to save: "+data.error;
				  	  }
					  $('#saving').hide();
					  callback(data);
				  },
				  error: function(data) {
					  data.error = 'Something went wrong while trying to save';
					  $('#saving').hide();
					  callback(data);
				  },
				  dataType: 'json'
				});
		};

		var updateNodeList = $.proxy(function(isLazyLoad) {

			if ("undefined" === typeof isLazyLoad || isLazyLoad == null) {
				isLazyLoad = false;
			}
			var opts = $(this).data('opts');
			var $rows = $(this).find('.node_rows');
			var $fields = $(this).find('.node_fields');
			if (lastLoadType == "search") {
				var data = search_results;
			} else if (lastLoadType == "init") {
				var data = loaded_nodeLists[opts.defaultType];
			} else {
				var data = loaded_nodeLists[$(this).find('.node_filter select').val()];
			}
			if (data.length == 0) {
				if (lastLoadType != "search") {
					$dialogue_container.find('.node_search input, .node_search button').prop('disabled', true);
				}
				$rows.html('<tr class="empty text-warning"><td colspan="' + (opts.fields.length + (opts.allowMultiple ? 1 : 0)) + '" class="text-center empty">' + (lastLoadType == "search" ? 'There are no items that match your search' : 'There are no items of the selected type') + '</td></tr>');
			} else {
				$dialogue_container.find('.node_search input, .node_search button').prop('disabled', false);
				var start = 0;
				if (!isLazyLoad) {
					$rows.html('');
				} else {
					$rows.find('.loadingRow').remove();
					start = $rows.find('tr').length;
				}

				for (var i = start; i < data.length; i++) {

					var item = data[i];
					var index = -1;
					if (undefined !== $dialogue_container.data('nodes')) {
						for (var n in $dialogue_container.data('nodes')) {
							var selected_node = $dialogue_container.data('nodes')[n];
							if (selected_node.slug == item.slug) {
								index = n;
								break;
							}
						}
					}

					var thumbnailUrl = null;
					if (item.thumbnail != null) {
						thumbnailUrl = item.thumbnail;
						if (thumbnailUrl.indexOf('://') == -1 && $('link[id="parent"]').attr('href') != null) {
							thumbnailUrl = $('link[id="parent"]').attr('href') + thumbnailUrl;
						}
					}

					var content_id = 0;
					if ('undefined'!=typeof(item.content) && 'undefined'!=typeof(item.content['http://scalar.usc.edu/2012/01/scalar-ns#urn'])) {
						var content_urn = item.content['http://scalar.usc.edu/2012/01/scalar-ns#urn'][0].value;
						content_id = content_urn.substr(content_urn.lastIndexOf(':')+1);
					}
					if (parseInt(content_id) > 0 && $('tr[data-content-id="'+content_id+'"]').length > 0) continue;

					var version_id = 0;
					if ('undefined'!=typeof(item.version) && 'undefined'!=typeof(item.version['http://scalar.usc.edu/2012/01/scalar-ns#urn'])) {
						var version_urn = item.version['http://scalar.usc.edu/2012/01/scalar-ns#urn'][0].value;
						version_id = version_urn.substr(version_urn.lastIndexOf(':')+1);
					};

					var user_id = 0;
					if ('undefined'!=typeof(item.uri) && -1 != item.uri.indexOf('/users/')) {
						user_id = item.uri.substr(item.uri.lastIndexOf('/')+1);
					};

					var desc = (item.version && 'undefined' != typeof(item.version['http://purl.org/dc/terms/description'])) ? item.version['http://purl.org/dc/terms/description'][0].value : '<em>No description</em>';

					var rowHTML = '<tr data-content-id="'+content_id+'" data-version-id="'+version_id+'" data-user-id="'+user_id+'">';
					if (isset(opts.allowMultiple) && opts.allowMultiple && 'checkbox' == opts.rowSelectMethod) {
						rowHTML += '<td class="text-center select_row" style="height: 50px;" data-width="1"><input type="checkbox" ' + (index > -1 ? 'checked' : '') + '></td>';
					}

					var hasChildSelector = false;

					for (var n in opts.fields) {
						var col = opts.fields[n];
						switch (col) {
							case 'thumbnail':
								if (current_type != "media") {
									$(this).find('th[data-field="thumbnail"]').hide();
									continue;
								}
								$(this).find('th[data-field="thumbnail"]').show();
								rowHTML += '<td class="node_thumb ' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'"><img class="img-responsive center-block" style="max-height: 50px;" src="' + thumbnailUrl + '"></td>';
								break;
							case 'title':
								rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'" property="'+col+'"><a href="' + item.uri + '"' + (($rows.closest('.modal').length) ? ' target="_blank"' : '') + '>' + item.title + '</a></td>';
								break;
							case 'name': // foaf:name
								rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'"><a href="' + item.uri + '"' + (($rows.closest('.modal').length) ? ' target="_blank"' : '') + '>' + item.content['http://xmlns.com/foaf/0.1/name'][0].value + '</a></td>';
								break;
							case 'description':
								var short_desc = shorten_description(desc);
								rowHTML += '<td class="' + (desc !== short_desc ? 'shortened_desc ' : '') + ((-1 != opts.editable.indexOf(col)) ? 'editable' : '') + '" data-width="' + fieldWidths[col] +'" property="'+col+'">' + (desc !== short_desc ? '<div class="full_desc">' + desc.replace(/"/g, '\\"') + '</div><div class="short_desc">' + short_desc + '</div>' : desc) + '</td>';
								break;
							case 'url':
								rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'">/' + item.slug + '</td>';
								break;
							case 'email': // foaf:homepage
								var email = ('undefined' != typeof(item.content['http://xmlns.com/foaf/0.1/mbox']) && item.content['http://xmlns.com/foaf/0.1/mbox'][0].value.length) ? item.content['http://xmlns.com/foaf/0.1/mbox'][0].value : '<i>Emails are suppressed</i>';
								rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'">' + email + '</td>';
								break;
							case 'homepage': // foaf:homepage
								var homepage = ('undefined' != typeof(item.content['http://xmlns.com/foaf/0.1/homepage']) && item.content['http://xmlns.com/foaf/0.1/homepage'][0].value.length) ? item.content['http://xmlns.com/foaf/0.1/homepage'][0].value : '';
								rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'"><a href="' + homepage + '" target="_blank">' + homepage + '</a></td>';
								break;
							case 'preview':
								rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'"><a href="' + item.uri + '" target="_blank">Preview</a></td>';
								break;
							case 'include_children':
								hasChildSelector = true;
								rowHTML += '<td class="select_children text-center' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" style="height: 50px;" data-width="' + fieldWidths[col] +'">';
								if (item.hasRelations) {
									rowHTML += '<input type="checkbox" value="">';
								}
								rowHTML += '</td>';
								break;
							case 'visible':
								var is_visible = ('undefined' != typeof(item.content['http://scalar.usc.edu/2012/01/scalar-ns#isLive']) && 1 == parseInt(item.content['http://scalar.usc.edu/2012/01/scalar-ns#isLive'][0].value)) ? true : false;
								var visibleThumbUrl = (is_visible) ? 'glyphicon-eye-open' : 'glyphicon-eye-close';
								rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'" property="is_live" align="center"><a class="visibilityLink" href="javascript:void(null);"><span class="glyphicon ' + visibleThumbUrl + '" aria-hidden="true"></span></a></td>';
								break;
							case 'listed':
								var is_listed = (1 == parseInt(item.listed)) ? true : false;
								var listedThumbUrl = (is_listed) ? 'glyphicon-eye-open' : 'glyphicon-eye-close';
								rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'" property="list_in_index" style="padding-left:19px;"><a class="visibilityLink" href="javascript:void(null);"><span class="glyphicon ' + listedThumbUrl + '" aria-hidden="true"></span></a></td>';
								break;
							case 'order':
								rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'" property="sort_number" style="padding-left:23px;">' + item.index + '</td>';
								break;
							case 'role':
								rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable editable-role' : '') + '" data-width="' + fieldWidths[col] +'" property="relationship">' + ucwords(item.role) + '</td>';
								break;
							case 'last_edited_by':
								var fullname = '';
								var prov_uri = item.version["http://www.w3.org/ns/prov#wasAttributedTo"][0].value;
								for (var o in $this.data('_data')) {
									if (prov_uri != o || !$this.data('_data')[o]["http://xmlns.com/foaf/0.1/name"]) continue;
									fullname = $this.data('_data')[o]["http://xmlns.com/foaf/0.1/name"][0].value;
								}
								rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'"><a href="' + prov_uri + '">' + fullname + '</a></td>';
								break;
							case 'date_created':
								var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

								function getSuffix(n) { return n < 11 || n > 13 ? ['st', 'nd', 'rd', 'th'][Math.min((n - 1) % 10, 3)] : 'th' };
								var dt = new Date(item.content["http://purl.org/dc/terms/created"][0].value);
								rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'">' + monthNames[dt.getMonth()] + ' ' + dt.getDate() + getSuffix(dt.getDate()) + ' ' + dt.getFullYear() + '</td>';
								break;
							case 'date_edited':
								var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

								function getSuffix(n) { return n < 11 || n > 13 ? ['st', 'nd', 'rd', 'th'][Math.min((n - 1) % 10, 3)] : 'th' };
								var dt = new Date(item.content["http://purl.org/dc/terms/created"][0].value);
								var createdStr = 'Date created: ' + monthNames[dt.getMonth()] + ' ' + dt.getDate() + getSuffix(dt.getDate()) + ' ' + dt.getFullYear();
								dt = new Date(item.version["http://purl.org/dc/terms/created"][0].value);
								rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'" title="' + createdStr + '">' + monthNames[dt.getMonth()] + ' ' + dt.getDate() + getSuffix(dt.getDate()) + ' ' + dt.getFullYear() + '</td>';
								break;
							case 'editorial_state_border':
								rowHTML += '<td data-state="'+item.version['http://scalar.usc.edu/2012/01/scalar-ns#editorialState'][0].value+'" class="'+ item.version['http://scalar.usc.edu/2012/01/scalar-ns#editorialState'][0].value + ' ' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'" property="'+col+'"></td>';
								break;
							case 'editorial_state':
								rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'" property="'+col+'">' + ucwords(item.version['http://scalar.usc.edu/2012/01/scalar-ns#editorialState'][0].value.replace('review',' review')) + '</td>';
								break;
							case 'format':
								if(typeof scalarapi !== "undefined"){
									rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'" property="'+col+'"><img src="'+$('link#approot').attr('href') + 'views/widgets/edit/'+item.node_type+'_icon.png" srcset="'+$('link#approot').attr('href') + 'views/widgets/edit/'+item.node_type+'_icon_2x.png 2x"> '+(item.content_type.replace('Code',' Code'))+'</td>';
								}else{
									rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'" property="'+col+'">icon</td>';
								}
								break;
							case 'usage_rights':
								var is_checked = ('undefined' != typeof(item.version['http://scalar.usc.edu/2012/01/scalar-ns#usageRights']) && 1 == parseInt(item.version['http://scalar.usc.edu/2012/01/scalar-ns#usageRights'][0].value)) ? true : false;
								rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'" property="'+col+'" style="text-align:left;padding-left:38px;"><input type="checkbox" name="'+col+'" value="1" '+((is_checked)?'checked':'')+' /></td>';
								break;
							case 'versions':
								rowHTML += '<td class="' + ((-1 != opts.editable.indexOf(col)) ? ' editable' : '') + '" data-width="' + fieldWidths[col] +'" align="center"><a href="' + item.uri + '.versions">&nbsp;' + item.version["http://open.vocab.org/terms/versionnumber"][0].value + '&nbsp;</a></td>';
								break;
							case 'edit':
								rowHTML += '<td class="edit_col" data-width="' + fieldWidths[col] +'" align="center"><a href="javascript:void(null);" class="btn btn-default btn-sm editLink">Edit row</a></td>';
								break;
							case 'bio_contributions':
								rowHTML += '<td class="edit_col" data-width="' + fieldWidths[col] +'"><a href="' + item.uri + '" class="btn btn-default btn-sm bioLink">Bio page</a> &nbsp; &nbsp; <a href="javascript:void(null);" class="btn btn-default btn-sm contributionsLink">Contributions</a></td>';
								break;
						}
					}
					rowHTML += '</tr>';

					var $item = $(rowHTML).appendTo($rows).data({ 'slug': item.slug, 'item': item});

					//As we load images, make sure the editorial border matches the height of the row
					if($item.find('img').length > 0){
						$item.find('img').each(function(){
							$(this).on('load',function(){
								resizeEditorialBorder();
							});
						});
					}

					if(isset(opts.useEditorialRules) && opts.useEditorialRules){
						var $borderRow = $item.find('td[property="editorial_state_border"]');
						if($borderRow.length > 0){
							var className = $borderRow.data('state').replace('review',' review').replace(/(^| )(\w)/g, function(x) {
											    return x.toUpperCase();
											}).replace(' ','_');
							var canChange = typeof state_flow[className] !== 'undefined' && state_flow[className] != null && state_flow[className].length > 0;
						}
					}else{
						canChange = true;
					}

					$item.data('item').canChange = canChange;

					if(!canChange && !!opts.startEditTrigger && opts.startEditTrigger!='click'){
						$editLink = $item.find(opts.startEditTrigger).addClass('notAllowed');
						if(!$editLink.data('has_popover')){
							$editLink.popover({content:'You do not have permission to modify content in this editorial state.',placement:'bottom',trigger:'hover'});
							$editLink.data('has_popover',true);
						}
					}

					if (hasChildSelector) {
						$item.find('.select_children input[type="checkbox"]').on('click', function(e) {
							e.stopPropagation();
							var $dialogue_container = $(this).parents('.node_selector');
							var item = $(this).parents('tr').data('item');
							var index = -1;
							if (undefined !== $dialogue_container.data('nodes')) {
								for (var n in $dialogue_container.data('nodes')) {
									var selected_node = $dialogue_container.data('nodes')[n];
									if (selected_node.slug == item.slug) {
										index = n;
										break;
									}
								}
							}
							var checked = $(this).is(":checked");
							if (!checked && index > -1) {
								$dialogue_container.data('nodes')[index].include_children = false;
								updateSelectedCounter();
							} else if (checked) {
								if (index > -1) {
									$dialogue_container.data('nodes')[index].include_children = true;
									updateSelectedCounter();
								} else {
									if ($dialogue_container.data('opts').allowMultiple) {
										$(this).parents('.select_children').siblings('.select_row').find('input[type="checkbox"]').trigger('click');
									} else {
										$(this).parents('tr').trigger('click');
									}
								}
							}
						});
						if (index > -1 && $dialogue_container.data('nodes')[index].include_children) {
							$item.find('.select_children input[type="checkbox"]').prop('checked', true);
						}
					}

					$item.on('mouseover', function() {
						$(this).find('.editLink, .bioLink, .contributionsLink').css('visibility','visible');
					}).on('mouseout', function() {
						$(this).find('.editLink, .bioLink, .contributionsLink').css('visibility','hidden');
					});
					$item.find('.bioLink').off('click').on('click', function(e) {
						e.stopPropagation();
					});

					if (index > -1) {
						$item.addClass('current');
						$item.find('.select_row input[type="checkbox"]').prop('checked', true);
					}

					if (opts.allowMultiple) {
						$item.off('click').on('click', function(e) { // Decoupled the actions below from the checkbox, since it might not be present if rowSelectMethod==highlight ~cd
							e.stopPropagation();
							var $dialogue_container = $(this).parents('.node_selector');
							var item = $(this).data('item');
							var checked = $(this).hasClass('current');
							var $childSelector = $(this).find('.select_row').siblings('.select_children');
							var hasChildSelector = ($childSelector.length > 0) ? true : false;
							var index = -1;
							if (undefined !== $dialogue_container.data('nodes')) {
								for (var n in $dialogue_container.data('nodes')) {
									var selected_node = $dialogue_container.data('nodes')[n];
									if (selected_node.uri == item.uri) { // Nodes might not have slugs (e.g., user nodes) so switching this to uri ~cd
										index = n;
										break;
									}
								}
							}
							if (index == -1) {  // Item is being checked
								if ($dialogue_container.data('nodes') == undefined) {
									$dialogue_container.data('nodes', [item]);
								} else {
									$dialogue_container.data('nodes').push(item);
								}
								$(this).addClass('current');
								$(this).closest('table').find('tr').not(this).each(function() {
									if ($(this).find("td.edit_col .btn:first:contains('Save')").length) $(this).find('.btn:first').trigger('click');
								});
								if (item.hasRelations && hasChildSelector) {
									// TODO: not sure what this does since it's the same for loop as above ~cd
									var index = -1;
									if (undefined !== $dialogue_container.data('nodes')) {
										for (var n in $dialogue_container.data('nodes')) {
											var selected_node = $dialogue_container.data('nodes')[n];
											if (selected_node.uri == item.uri) { // Nodes might not have slugs (e.g., user nodes) so switching this to uri ~cd
												index = n;
												break;
											}
										}
									}
									// End not sure what this does
									$childSelector.find('input[type="checkbox"]').prop('checked', true);
									$dialogue_container.data('nodes')[index].include_children = true;
								}
							} else {  // Item is being unchecked
								$dialogue_container.find('.selectAll input[type="checkbox"]').attr("checked", false);
								$dialogue_container.data('nodes').splice(index, 1);
								$(this).removeClass('current');
								if (hasChildSelector) {
									$childSelector.find('input[type="checkbox"]').prop('checked', false);
								}
								if ($(this).find("td.edit_col .btn:first:contains('Save')").length) $(this).find('.btn:first').trigger('click');
							}
							$(this).find('.select_row > input[type="checkbox"]').prop('checked', ((checked) ? false : true));
							updateSelectedCounter();
						});
					} else {
						$item.off('click').on('click', function(e) {
							var item = $(this).data('item');
							var $dialogue_container = $(this).parents('.node_selector');
							var $childSelector = $(this).find('.select_children');
							var hasChildSelector = $childSelector.length > 0;
							if ($(this).hasClass('current')) {
								$(this).removeClass('current');
								$dialogue_container.data('nodes', []);
								if (hasChildSelector) {
									$childSelector.find('input[type="checkbox"]').prop('checked', false);
								}
							} else {
								$(this).addClass('current').siblings('.current').removeClass('current').find('input[type="checkbox"]').prop('checked', false);
								$dialogue_container.data('nodes', [item]);
								if (item.hasRelations && hasChildSelector) {
									$childSelector.find('input[type="checkbox"]').prop('checked', true);
									$dialogue_container.data('nodes')[0].include_children = true;
								}
							}
							updateSelectedCounter();
							e.preventDefault();
							e.stopPropagation();
							return false;
						});
					}; //allowMultiple

				}; //for data.length

				if (opts.isEdit) {
					var doStartEditing = function($cell) {
						var value = '';
						$cell.addClass('collapse_padding');
						$cell.closest('tr').find('td').css('vertical-align', 'middle');
						$cell.data('is-editing', true);
						$cell.data('has-link', false);
						$cell.data('orig-html', $cell.html().slice());
						if ($cell.children('a').length) {
							$cell.data('has-link', true);
							value = $cell.children('a:first').html();
							var replace = value.slice();
							$cell.html('<input class="form-control input-xs" type="text" value="' + htmlspecialchars(replace) + '" />');
						} else if ($cell.hasClass('editable-role')) {
							value = $cell.text();
							var replace = '<select>';
							for (var j = 0; j < opts.roles.length; j++) {
								replace += '<option value="'+ucwords(opts.roles[j])+'"'+((ucwords(opts.roles[j])==value)?' selected':'')+'>'+ucwords(opts.roles[j])+'</option>';
							};
							replace += '</select>';
							$cell.html(replace);
						} else if ($cell.children('em').length && $cell.html().slice() == '<em>No description</em>') {
							value = '';
							var replace = value.slice();
							$cell.html('<input class="form-control input-xs" type="text" value="' + htmlspecialchars(replace) + '" />');
						} else {
							value = $cell.html();
							var replace = value.slice();
							$cell.html('<input class="form-control input-xs" type="text" value="' + htmlspecialchars(replace) + '" />');
						};
						$cell.find('input, select').on('click', function(event) {
							event.stopPropagation();
						}).on('keypress', function(e) {
							if (e.which == 13) {
								$(this).closest('tr').find('.editLink').trigger('click');
							}
						});
						$cell.find('select').on('change', function(event) {
							$(this).closest('tr').find('.editLink').trigger('click');
						});
						$cell.data('orig-value', value);
					};
					var doStopEditing = function($cell) {
						var property = $cell.attr('property');
						var value = '';
						$cell.removeClass('collapse_padding');
						$cell.closest('tr').find('td').css('vertical-align', 'top');
						if ($cell.data('has-link')) {
							var $temp = $('<div>' + $cell.data('orig-html') + '</div>');
							value = $cell.children('input:first').val();
							$temp.children('a:first').html(value.slice());
							var replace = $temp.html().slice();
						} else if ($cell.hasClass('editable-role')) {
							value = $cell.children('select').val();
							replace = value.slice();
						} else {
							value = $cell.children('input:first').val();
							var replace = value.slice();
						};
						if (!replace.length && $cell.attr('property') == 'description') replace = '<em>No description</em>';
						$cell.html(replace);
						$cell.data('is-editing', false);
						if ($cell.data('has-link')) $cell.find('a:first').on('click', function(e) {
							e.stopPropagation();
						})
						var the_return = {};
						the_return[property] = value;
						return the_return;
					};
					var invokeEditing = function($this) {
						var to_save = {};
						$this.find('.editable').each(function() {
							var $cell = $(this);
							if ($cell.data('is-editing')) {
								$.extend(to_save, doStopEditing($cell));
							} else {
								doStartEditing($cell);
							};
						});
						var do_save = false;
						for (var field in to_save) {
							if ($this.find('td[property="'+field+'"]').data('orig-value') != to_save[field]) do_save = true;
						}
						if (do_save) {
							if (parseInt($this.data('version-id'))) {
								to_save.section = 'versions';
								to_save.id = $this.data('version-id');
								to_save.book_id = book_id;
							} else if (parseInt($this.data('user-id'))) {
								to_save.section = 'user_books';
								to_save.id = $this.data('user-id');
								to_save.book_id = book_id;
								to_save.list_in_index = $this.find('td[property="list_in_index"] .glyphicon-eye-open').length > 0 ? 1 : 0;
								if (parseInt(to_save.id) == my_user_id && to_save.relationship.toLowerCase() != 'author' && !confirm('Are you sure you wish to change your role away from Author? You might lose permissions to edit this book.')) {
									$this.find('td[property="relationship"]').text('Author');
									$this.trigger('click');
									return;
								}
							};
							if ('undefined'!=to_save.section) {
								push_row(to_save, function(data) {
									if (data.error) return alert(data.error);
									console.log(data);
								});
							};
						};
					};
					if ('click' == opts.startEditTrigger) {
						$rows.find('tr').on('click', function() {
							if(isset(opts.useEditorialRules) && opts.useEditorialRules){
								var $borderRow = $this.find('td[property="editorial_state_border"]');
								if($borderRow.length > 0){
									var className = $borderRow.data('state').replace('review',' review').replace(/(^| )(\w)/g, function(x) {
													    return x.toUpperCase();
													}).replace(' ','_');
									var canChange = typeof state_flow[className] !== 'undefined' && state_flow[className] != null && state_flow[className].length > 0;
								}
							}else{
								canChange = true;
							}
							if(canChange){
								invokeEditing($(this));
							}
						});
					} else {
						$el = $rows.find(opts.startEditTrigger);
						$el.on('click', function(e) {
							var $this = $(this);
							var $row = $this.closest('tr');

							if(isset(opts.useEditorialRules) && opts.useEditorialRules){
								var $borderRow = $row.find('td[property="editorial_state_border"]');
								if($borderRow.length > 0){
									var className = $borderRow.data('state').replace('review',' review').replace(/(^| )(\w)/g, function(x) {
													    return x.toUpperCase();
													}).replace(' ','_');
									var canChange = typeof state_flow[className] !== 'undefined' && state_flow[className] != null && state_flow[className].length > 0;
								}
							}else{
								canChange = true;
							}

							if(canChange){
								invokeEditing($row);
								if ($this.hasClass('btn-default')) {
									$this.removeClass('btn-default').addClass('btn-primary').text('Save row');
									if ($this.closest('tr').hasClass('current')) e.stopPropagation();
								} else {
									$this.removeClass('btn-primary').addClass('btn-default').text('Edit row');
									if (!$this.closest('tr').hasClass('current')) e.stopPropagation();
								};
								$this.trigger('blur');
							}
						});
					};
				};

				$rows.find('a:not(.btn), [name="usage_rights"]').off('click').on('click', function(e) {
					e.stopPropagation();
					var $this = $(this);
					if (opts.isEdit && $this.hasClass('visibilityLink') && 'is_live'==$this.parent().attr('property')) {
						var content_id = $this.closest('tr').data('content-id');
						var is_live = $this.find('.glyphicon-eye-open').length > 0 ? true : false;
						var post = {section:'pages',id:content_id,book_id:book_id,is_live:((is_live)?0:1)};
						push_row(post, function(data) {
							if (data.error) return alert(data.error);
							var visibleThumbUrl = (1==data.is_live) ? 'glyphicon-eye-open' : 'glyphicon-eye-close';
							$this.find('.glyphicon').removeClass('glyphicon-eye-open glyphicon-eye-close').addClass(visibleThumbUrl);
							$('body').trigger('updateGraph','statesOnly');
						});
					} else if (opts.isEdit && $this.hasClass('visibilityLink') && 'list_in_index'==$this.parent().attr('property')) {
						var user_id = $this.closest('tr').data('user-id');
						var list_in_index = $this.find('.glyphicon-eye-open').length > 0 ? true : false;
						var relationship = $this.closest('tr').find('td[property="relationship"]').text();
						var sort_number = $this.closest('tr').find('td[property="sort_number"]').text();
						var post = {section:'user_books',id:user_id,book_id:book_id,list_in_index:((list_in_index)?0:1),relationship:relationship,sort_number:sort_number};
						push_row(post, function(data) {
							if (data.error) return alert(data.error);
							var visibleThumbUrl = (1==data.list_in_index) ? 'glyphicon-eye-open' : 'glyphicon-eye-close';
							$this.find('.glyphicon').removeClass('glyphicon-eye-open glyphicon-eye-close').addClass(visibleThumbUrl);
						});
					} else if (opts.isEdit && 'usage_rights'==$this.prop('name')) {
						var version_id = $this.closest('tr').data('version-id');
						var checked = $this.is(':checked') ? true : false;
						var post = {section:'versions',id:version_id,book_id:book_id,usage_rights:((checked)?1:0)};
						push_row(post, function(data) {
							if (data.error) return alert(data.error);
							$this.prop('checked', ((parseInt(data.usage_rights))?true:false));

    						$('body').trigger('updateGraph','usageOnly');
						});
					};
				});

				$rows.find('.contributionsLink').off('click').on('click', function(e) {
					//e.stopPropagation();
					var $this = $(this);
					if (!opts.contributionsOptions) return alert("Couldn't find the contributions callback");
					var bool = $this.closest('tr').next().hasClass('contributions');
					opts.contributionsOptions($this.closest('tr'), ((bool)?false:true));
					if ($this.hasClass('active')) {
						$this.removeClass('active');
					} else {
						$this.addClass('active');
					};
					$this.trigger('blur');
				});

			};

			$rows.find('.node_thumb img').each(function() {
				$(this).tooltip({
					title: '<img src="' + $(this).attr('src') + '" class="nodeSelectorEnlargedThumbnail">',
					html: true
				});
			});

			$rows.find('.shortened_desc').each(function() {
				if ($(this).find('.moreless').length > 0) { return; }
				$(this).parent().find('.full_desc').hide();
				$linkContainer = $('<div class="text-right"></div>').appendTo(this);
				$('<a href="#" class="moreless text-right">more</a>').appendTo($linkContainer).on('click', function(e) {
					e.preventDefault();
					var $fullDesc = $(this).parents('.shortened_desc').find('.full_desc').toggle();
					$(this).parents('.shortened_desc').find('.short_desc').toggle();
					$(this).text($fullDesc.is(':visible') ? 'less' : 'more');
					return false;
				});
			});

			$(this).find('.spinner_container').hide();
			$(this).find('.node_types .btn').prop('disabled', false).removeClass('disabled');

			//Get current scroll...
			var oldScroll = $dialogue_container.find('.node_selector_table_body').scrollTop();
			resize();
			$dialogue_container.find('.node_selector_table_body').scrollTop(oldScroll);
		}, $dialogue_container);

		var updateSelectedCounter = $.proxy(function() {
			if (isset($(this).data('opts').nodeCountContainer)) {
				var $count = $(this).data('opts').nodeCountContainer;
			} else {
				var $count = $(this).find('.selected_node_count');
			}

			if ($(this).data('nodes') == undefined) {
				$(this).data('nodes', []);
			}

			var nodeList = $(this).data('nodes');
			var number_items = nodeList.length;
			var canChangeAllNodes = true;
			for(var n = 0; n < number_items; n++){
				if(typeof nodeList[n].canChange !== 'undefined' && nodeList[n].canChange === false){
					canChangeAllNodes = false;
					break;
				}
			}
			$deleteButton = $dialogue_container.find('.deleteButton');
			if(!canChangeAllNodes && (isset(opts.deleteOptions) && opts.deleteOptions)){
				$deleteButton.addClass('notAllowed');
				if(!$deleteButton.data('has_popover')){
					$deleteButton.popover({content:'You do not have permission to modify content in this editorial state.',placement:'bottom',trigger:'hover'});
				}
			}else{
				$deleteButton.removeClass('notAllowed');
				$deleteButton.popover('destroy');
				$deleteButton.data('has_popover',false);
			}

			if ($(this).data('opts').allowChildren) {
				//We are also including children if the user chooses, so we need to count them
				for (var i in nodeList) {
					var item = nodeList[i];
					if ('undefined' === typeof item.targets || 'undefined' === item.include_children || !item.include_children) { continue; }
					number_items += item.targets.length;
				}
			}
			if ($(this).data('opts').allowMultiple) {
				switch (number_items) {
					case 0:
						$count.text('No items selected');
						break;
					case 1:
						$count.text('1 item selected');
						break;
					default:
						$count.text(number_items + ' items selected');
						break;
				}
			}
			$(this).data('opts').onChangeCallback();
		}, $dialogue_container);

		var $filter = $dialogue_container.find('.node_filter');


		$filter.find('select').on('change', function(){
			performDropdownFilter();
		});

		var $search = $dialogue_container.find('.node_search');

		if (isset(opts.nodeCountContainer)) {
			var $count = opts.nodeCountContainer;
			$dialogue_container.find('.selected_node_count').parent('.row').remove();
		} else {
			var $count = $dialogue_container.find('.selected_node_count');
		}
		var $fields = $dialogue_container.find('.node_fields');

		if (opts.types.length < 2) {
			$filter.find('.node_types').hide();
		}

		if (isset(opts.allowMultiple) && opts.allowMultiple && 'checkbox' == opts.rowSelectMethod) {
			$('<input type="checkbox">').appendTo($('<th data-field="selected" class="text-center selectAll" data-width="1"></th>').appendTo($fields)).on('change', function() {
				var checked = $(this).is(":checked");
				var $rows = $(this).parents('.node_selector').find('tbody tr');
				if (checked) {
					$rows = $rows.not('.current');
				} else {
					$rows = $rows.filter('.current');
				}
				$rows.trigger('click');
			});
		}

		if (isset(opts.deleteOptions) && opts.deleteOptions) {
			$dialogue_container.find('.selected_node_count').css('float', 'right').css('margin-left', 0);
			var $deleteOpts = $('<div class="col-xs-7 botton_options_box"></div>').appendTo($dialogue_container.find('.panel-footer .row:first'));
			if (isset(opts.allowMultiple) && opts.allowMultiple) {
				var $selectall = $('<button type="button" class="btn btn-default">Select all</button>').appendTo($deleteOpts);
				$selectall.off('click').on('click', function() {
					var checked = $(this).hasClass('active');
					var $rows = $(this).closest('.node_selector').find('tbody tr');
					if (checked) {
						$rows = $rows.filter('.current');
						$(this).removeClass('active');
					} else {
						$rows = $rows.not('.current');
						$(this).addClass('active');
					}
					$rows.trigger('click');
					$(this).trigger('blur');
				});
			};
			var $deleteBtn = $('<button type="button" class="btn btn-default deleteButton">'+opts.deleteButton+'</button>').appendTo($deleteOpts);
			$deleteBtn.on('click', function() {
				if($(this).hasClass('notAllowed')){
					return false;
				}
				if ('function' == typeof(opts.deleteOptions)) {
					var $selected = $(this).closest('.selector').find('.node_selector_table_body tr.current');
					if (!$selected.length) {
						alert('Please select one or more content to delete');
						return;
					}
					opts.deleteOptions($selected);
					return;
				}
				alert('Could not find deleteOptions function');
			});
		};

		if (isset(opts.editorialOptions) && opts.editorialOptions) {
			if ('undefined' == typeof($deleteOpts)) {
				$dialogue_container.find('.selected_node_count').css('float', 'right').css('margin-left', 0);
				var $deleteOpts = $('<div class="col-xs-7 botton_options_box"></div>').appendTo($dialogue_container.find('.panel-footer .row:first'));
				if (isset(opts.allowMultiple) && opts.allowMultiple) {
					var $selectall = $('<button type="button" class="btn btn-default">Select all</button>').appendTo($deleteOpts);
					$selectall.off('click').on('click', function() {
						var checked = $(this).hasClass('active');
						var $rows = $(this).closest('.node_selector').find('tbody tr');
						if (checked) {
							$rows = $rows.filter('.current');
							$(this).removeClass('active');
						} else {
							$rows = $rows.not('.current');
							$(this).addClass('active');
						}
						$rows.trigger('click');
						$(this).trigger('blur');
					});
				};
			} else {
				$deleteOpts.append('<span> &nbsp; </span>');
			}
			$edOption = $('<div class="btn-group"></div>').appendTo($deleteOpts);
			$edOption.append('<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Choose an action <span class="caret"></span></button>');
			var $edOptionList = $('<ul class="dropdown-menu"></ul>').appendTo($edOption);
			for (var j = 0; j < opts.types.length; j++) {
				if (opts.types[j].toLowerCase() == opts.defaultType.toLowerCase()) continue;
				$edOptionList.append('<li class="'+(opts.types[j].replace(' ','_'))+'"><a href="javascript:void(null);">Move to <b>'+opts.types[j]+'</b> state</a></li>');
			};
			$('<div class="changeNotice btn-group"><div class="noFilter alert alert-info" style="display: block;">Please select an editorial state and filter above to modify content states</div><div class="filtered  alert alert-warning text-warning" style="display: none">You do not have permission to modify pages in this editorial state</div></div>').appendTo($deleteOpts);
			$edOption.find('a').on('click', function() {
				var $this = $(this);
				if (!$this.closest('.node_selector').find('tbody tr.current').length) {
					alert('Please select one or more items');
					return;
				}
				var type = $(this).find('b').text().replace(' ', '').toLowerCase();
				var version_ids = [];
				$this.closest('.selector').find('tr.current').each(function() {
					version_ids.push(parseInt($(this).data('version-id')));
				});
				if ('function' == typeof(opts.editorialOptions)) {
					opts.editorialOptions(version_ids, type);
					return;
				}
				alert('Could not find editorialOptions function');
			});
		};

		if (isset(opts.userOptions) && opts.userOptions) {
			if ('undefined' == typeof($deleteOpts)) {
				$dialogue_container.find('.selected_node_count').css('float', 'right').css('margin-left', 0);
				var $deleteOpts = $('<div class="col-xs-7 botton_options_box"></div>').appendTo($dialogue_container.find('.panel-footer .row:first'));
			} else {
				$deleteOpts.append('<span> &nbsp; </span>');
			}
			$deleteOpts.append('<button type="button" class="btn btn-default">Add new user</button>');
			$deleteOpts.find('button:last').off('click').on('click', function() {
				if ('function' == typeof(opts.userOptions)) {
					opts.userOptions();
					return;
				}
				alert('Could not find userOptions function');
			});
		};

		if (isset(opts.addOptions) && opts.addOptions) {
			if ('undefined' == typeof($deleteOpts)) {
				$dialogue_container.find('.selected_node_count').css('float', 'right').css('margin-left', 0);
				var $deleteOpts = $('<div class="col-xs-7 botton_options_box"></div>').appendTo($dialogue_container.find('.panel-footer .row:first'));
			} else {
				$deleteOpts.append('<span> &nbsp; </span>');
			}
			$deleteOpts.append('<button type="button" class="btn btn-default">Add new page</button>');
			$deleteOpts.find('button:last').off('click').on('click', function() {
				document.location.href = $('link#parent').attr('href') + 'new.edit';
			});
			var parent = $('link#parent').attr('href');
			var $importOpts = $('<select class="btn btn-default generic_button large" style="max-width:130px;"><option value="">Import media</option></select>').appendTo($deleteOpts);
			$importOpts.append('<optgroup label="Affiliated archives">');
			$importOpts.append('<option value="' + parent + 'import/critical_commons">Critical Commons</option>');
			$importOpts.append('<option value="' + parent + 'import/internet_archive">Internet Archive</option>');
			$importOpts.append('<option value="' + parent + 'import/shoah_foundation_vha_online">VHA Online</option>');
			$importOpts.append('<option value="' + parent + 'import/shoah_foundation_vha">VHA</option>');
			$importOpts.append('</optgroup>');
			$importOpts.append('<optgroup label="Other archives">');
			$importOpts.append('<option value="' + parent + 'import/the_metropolitan_museum_of_art">The Metropolitan Museum of Art</option>');
			$importOpts.append('<option value="' + parent + 'import/omeka">Omeka sites</option>');
			$importOpts.append('<option value="' + parent + 'import/omeka_s">Omeka S sites</option>');
			$importOpts.append('<option value="' + parent + 'import/soundcloud">SoundCloud</option>');
			$importOpts.append('<option value="' + parent + 'import/youtube">YouTube</option>');
			$importOpts.append('</optgroup>');
			$importOpts.append('<optgroup label="Files, URLs">');
			$importOpts.append('<option value="' + parent + 'upload">Upload file</option>');
			$importOpts.append('<option value="' + parent + 'new.edit#type=media">Internet URL</option>');
			//$importOpts.append('<option value="' + parent + 'criticalcommons">Upload to Critical Commons</option>');
			$importOpts.append('</optgroup>');
			$importOpts.on('change', function() {
				var url = $(this).find('option:selected').val();
				document.location.href = url;
			});
		};

		if ('undefined'!=typeof($deleteOpts)) {
			$deleteOpts.append('<span id="saving" class="alert alert-warning">Saving...</span>');
		}

		var $rows = $dialogue_container.find('.node_rows');
		var $nodeSelectorTableBody = $dialogue_container.find('.node_selector_table_body');
		var fields_to_display = [];

		var $type_selector = $filter.find('select');

		for (var t in opts.types) {

			if (opts.types[t] == 'content') {
				var type_display_name = 'All';
			} else if (opts.types[t] == 'composite') {
				var type_display_name = 'Pages';
			} else if (opts.types[t] == 'reply') {
				var type_display_name = 'Comments';
			} else if (opts.types[t] == 'lens') {
				var type_display_name = 'Lenses';
			} else if (opts.types[t] == 'users') {
				var type_display_name = 'Users';
			} else if  (scalarapi.model.scalarTypes[opts.types[t]]) {
				var type_display_name = scalarapi.model.scalarTypes[opts.types[t]].plural;
				type_display_name = type_display_name.charAt(0).toUpperCase() + type_display_name.slice(1);
			} else {
				var type_display_name = opts.types[t].charAt(0).toUpperCase() + opts.types[t].slice(1);
			}

			$type_selector.append('<option value="' + opts.types[t] + '">' + type_display_name + '</option>');
		}

		$type_selector.val(current_type);

		var doTypeFilter = function() {
			$dialogue_container.find('.filter_spinner .spinner_container').show();
			$dialogue_container.find('.node_types .btn').prop('disabled', true).addClass('disabled');

			var opts = $dialogue_container.data('opts');
			var typeName = $type_selector.find('option[value="' + current_type + '"]').text().toLowerCase();

			if(isset(opts.editorialOptions) && opts.editorialOptions){
				var className = current_type.replace(' ','_');
				var canChange = typeof state_flow[className] !== 'undefined' && state_flow[className] != null && state_flow[className].length > 0;

				$('.changeNotice').toggle(!canChange);
				$('.changeNotice .noFilter').toggle(typeName === 'all');
                $('.changeNotice .filtered').toggle(typeName !== 'all' && typeName !== 'hidden');

				if(!canChange){
					$dialogue_container.find('.panel-footer button').prop('disabled',true).addClass('disabled').hide();
				}else{
					var changeOptionsSelector = '.'+(state_flow[className].join(',.'));
					$dialogue_container.find('.panel-footer button').prop('disabled',false).removeClass('disabled').show();
					$dialogue_container.find('.panel-footer .dropdown-menu li').show().not(changeOptionsSelector).hide();
				}
				$dialogue_container.data('nodes',[]);
				$dialogue_container.find('.selected_node_count').text('No items selected');
			}

			$dialogue_container.find('.node_search>input').attr('placeholder', 'Search ' + typeName + ' by title or description');

			if (opts == undefined) { opts = []; }

			var promise = $.Deferred();
			$.when(promise).then(updateNodeList);

			var rec = opts.rec;
			var ref = opts.ref;

			$dialogue_container.find('.node_selector_table_body .node_rows').html('<tr class="loadingRow text-muted empty"><td class="text-center" colspan="' + (opts.fields.length + (opts.allowMultiple ? 1 : 0)) + '">Loading&hellip;</td></tr>');
			window.setTimeout(function(){
				load_node_list({
					"type": current_type,
					"rec": rec,
					"ref": ref,
					"promise": promise,
					"page": 0
				});
			},200);
		};
		var performDropdownFilter = function() {
			lastLoadType = "filter";
			var $type_selector = $dialogue_container.find('.node_filter select');
			var $search = $dialogue_container.find('.node_search');
			$search.find('input').val('');

			if(!!opts.refreshAfterFilter){
				loaded_nodeLists = {};
			}

			current_type = $type_selector.val();
			doTypeFilter();
			$type_selector.siblings('button').trigger('blur');
		};

		$nodeSelectorTableBody.on('scroll', function() {
			if (Math.ceil($(this).scrollTop() + $(this).innerHeight()) >= $(this)[0].scrollHeight && !lastPage) {
				var promise = $.Deferred();
				var $dialogue_container = $(this).parents('.node_selector');
				var opts = $dialogue_container.data('opts');
				if ($dialogue_container.find('.node_rows .loadingRow').length == 0) {
					$dialogue_container.find('.node_rows').append('<tr class="text-muted loadingRow"><td class="text-center" colspan="' + (opts.fields.length + (opts.allowMultiple ? 1 : 0)) + '">Loading more results&hellip;</td></tr>');
				}
				$.when(promise).then(function() { updateNodeList(true) });
				var data = lastLoadCriteria;
				data.promise = promise;
				data.page++;
				load_node_list(data);
			}
		});
		$search.find('button').on('click', function() {
			var $dialogue_container = $(this).parents('.node_selector');
			lastLoadType = "filter";
			var $search = $dialogue_container.find('.node_search');
			$search.find('input').val('');
			doTypeFilter();
		});
		$search.find('input').on("keyup change", function() {
			if ($(this).val() == "") {
				$(this).parents('.node_selector').find('.node_search button').trigger('click');
				return false;
			}
			if ($(this).data('timeout') != undefined) {
				window.clearTimeout($(this).data('timeout'));
			}
			var this_opts = opts;
			$(this).data('timeout', setTimeout($.proxy(function() {
				lastLoadType = "search";
				var promise = $.Deferred();
				$.when(promise).then(updateNodeList);
				var $dialogue_container = $(this).parents('.node_selector');
				var $type_selector = $dialogue_container.find('.node_filter select');
				var rec = this_opts.rec;
				var ref = this_opts.ref;
				$dialogue_container.find('.node_selector_table_body .node_rows').html('<tr class="text-muted loadingRow"><td class="text-center" colspan="' + (this_opts.fields.length + (this_opts.allowMultiple ? 1 : 0)) + '">Loading&hellip;</td></tr>');
				load_node_list({
					"type": current_type,
					"search": $dialogue_container.find('.node_search input').val(),
					"rec": rec,
					"ref": ref,
					"promise": promise,
					"page": 0
				});
				$(this).data('timeout', undefined);
			}, this), 400));
		});

		if (isset(opts.fields)) {;
			fields_to_display = opts.fields;
			for (var f in fields_to_display) {
				if (["thumbnail", "preview", "edit", "bio_contributions"].indexOf(fields_to_display[f]) > -1) {
					$fields.append('<th data-width="' + fieldWidths[fields_to_display[f]] + '" data-field="' + fields_to_display[f].toLowerCase().replace(/ /g, "_") + '"></th>');
				} else if (["visible", "versions"].indexOf(fields_to_display[f]) > -1) {
					$fields.append('<th data-width="' + fieldWidths[fields_to_display[f]] + '" data-field="' + fields_to_display[f].toLowerCase().replace(/ /g, "_") + '" style="text-align:center;">' + toProperCase(fields_to_display[f].replace(/_/g, " ")) + '</th>');
				} else if (fields_to_display[f] == 'url') {
					$fields.append('<th data-width="' + fieldWidths[fields_to_display[f]] + '" data-field="' + fields_to_display[f].toLowerCase().replace(/ /g, "_") + '">URL</th>');
				} else if (fields_to_display[f] == 'editorial_state') {
					$fields.append('<th data-width="' + fieldWidths[fields_to_display[f]] + '" data-field="' + fields_to_display[f].toLowerCase().replace(/ /g, "_") + '">State</th>');
				} else if (fields_to_display[f] == 'format') {
					$fields.append('<th  data-width="'+fieldWidths[fields_to_display[f]]+'" data-field="' + fields_to_display[f].toLowerCase().replace(/ /g, "_") + '">Format</th>');
				} else if (fields_to_display[f] == 'editorial_state_border') {
					$fields.append('<th  data-width="'+fieldWidths[fields_to_display[f]]+'" data-field="' + fields_to_display[f].toLowerCase().replace(/ /g, "_") + '"></th>');
				} else {
					$fields.append('<th data-width="' + fieldWidths[fields_to_display[f]] + '" data-field="' + fields_to_display[f].toLowerCase().replace(/ /g, "_") + '">' + toProperCase(fields_to_display[f].replace(/_/g, " ")) + '</th>');
				}
			}

			resize();
		}

		if (!isset(opts.preserveContent) || !opts.preserveContent) {
			$(this).empty();
		}

		if (!isset(opts.rec)) {
			opts.rec = 0;
		}
		if (!isset(opts.ref)) {
			opts.ref = 0;
		}

		opts.searchableTypes = ['media', 'file', 'composite', 'page', 'content'];

		var type = opts.defaultType;

		if (!isset(opts.rec)) {
			opts.rec = 0;
		}

		if (!isset(opts.ref)) {
			opts.ref = 0;
		}

		var init_selector = $.proxy(function($dialogue_container, opts, resize) {
			$dialogue_container.data('opts', opts);
			updateSelectedCounter();
			performDropdownFilter();
			$(this).append($dialogue_container);
		}, this, $dialogue_container, opts, resize);

		jQuery.when(init_promise).then(init_selector);

		if ("undefined" !== typeof opts.selected && $.isArray(opts.selected) && opts.selected.length > 0) {
			//Go through selected array and add them to the selected list...
			var slugs = [];
			for (var i in opts.selected) {
				var include_children = opts.selected[i].indexOf('*') > -1;
				var slug = opts.selected[i].replace(/\*/g, '');
				slugs.push({ id: slug, children: include_children, loaded: false });
			}


			var parent_url = $('link#parent').attr('href');

			for (var i in slugs) {

				(function(slug, promise, slugs, $dialogue_container) {
					var handleNode = function() {
						var nodeList = [];

						slug.loaded = true;
						slug.data = scalarapi.getNode(slug.id);
						for (var i in slugs) {
							if (!slugs[i].loaded) {
								return;
							}
						}
						$dialogue_container.data('nodes', []);
						for (var i in slugs) {
							//Build node list for content selector
							if(typeof slugs[i] === 'undefined' || !slugs[i] || typeof slugs[i].data === 'undefined' || !slugs[i].data){
								continue;
							}
							var slug_data = slugs[i].data;
							var item = {};
							item.uri = slug_data.url;
							item.slug = slugs[i].id;
							item.version_uri = slug_data.current.url;
							item.version_slug = item.version_uri.replace(parent_url, '');
							item.content = slug_data.current.content;
							item.title = slug_data.current.title;
							item.hasThumbnail = false;
							if ("undefined" !== typeof slug_data.outgoingRelations && $.isArray(slug_data.outgoingRelations) && slug_data.outgoingRelations.length > 0) {
								item.targets = slug_data.outgoingRelations;
							}
							if ('undefined' !== typeof slug_data.thumbnail) {
								item.thumbnail = slug_data.thumbnail;
								item.hasThumbnail = true;
							} else {
								item.thumbnail = $('link#approot').attr('href') + 'views/melons/cantaloupe/images/media_icon_chip.png';
							}
							item.include_children = slugs[i].children;
							item.hasRelations = 'undefined' !== typeof item.targets && item.targets.length > 0;
							$dialogue_container.data('nodes').push(item);
						}
						promise.resolve();
					};
					var apiResponse = scalarapi.loadPage(slug.id, true, handleNode, null, 1, false, null, 0, 20);
					if (apiResponse == "loaded" || apiResponse == "queued") {
						// The page should only be queued if the API can't find it; if that's the case, we'll just skip it in handleNode()
						handleNode();
					}

				})(slugs[i], init_promise, slugs, $dialogue_container);
			}
		} else {
			init_promise.resolve();
		}
		$(this).data('node_selection_dialogue',{
			serialize_nodes :  $.proxy(function() {
					if ($(this).data('nodes') == undefined) {
						return '';
					}
					var slugs = [];
					for (var i in $(this).data('nodes')) {
						var item = $(this).data('nodes')[i];
						slugs.push(item.slug);
						if (!$(this).data('opts').allowChildren || 'undefined' === typeof item.targets || 'undefined' === item.include_children || !item.include_children) { continue; }
						slugs[slugs.length - 1] += '*';
					}
					return slugs.join(',');
				}, $dialogue_container),
			refresh_nodes: function(){
				loaded_nodeLists = {};
				doTypeFilter();
			}
		});

		$(this).on('doResize', resize);
		$(window).on('resize',resize);

		return $(this);
	};
}(jQuery));
