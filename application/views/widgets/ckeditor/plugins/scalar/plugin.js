CKEDITOR._scalar = {
	selectcontent: function(options) {
		$('<div></div>').content_selector(options);
	},
	contentoptions: function(options) {
		$('<div></div>').content_options(options);
	},
	selectWidget: function(options) {
		$('<div></div>').widget_selector(options);
	},
	widgetOptions: function(options) {
		$('<div></div>').widget_options(options);
	},
	external_link: function(editor, options) {
		CKEDITOR.dialog.add('external_link', function(editor) {
			return {
				title: 'Insert External Link',
				width: 500,
				minHeight: 100,
				contents: [{
					id: 'general',
					label: 'External Link',
					elements: [{
						type: 'html',
						html: 'Add a hyperlink to an external site. Scalar will maintain a header bar that allows easy navigation back to your book (unless disallowed by the external site).'
					}, {
						type: 'text',
						id: 'href',
						label: 'URL',
						'default': 'https://',
						validate: CKEDITOR.dialog.validate.notEmpty('URL is a required field'),
						required: true,
						setup: function(element) {
							if (null !== element.getAttribute('href')) this.setValue(element.getAttribute('href'));
						},
						commit: function(data) {
							data.href = this.getValue();
						}
					}, {
						type: 'checkbox',
						id: 'target_blank',
						label: 'Open in a new browser window',
						'default': false,
						setup: function(element) {
							if ('_blank' == element.getAttribute('target')) this.setValue('checked');
						},
						commit: function(data) {
							data.target = (this.getValue()) ? '_blank' : false;
						}
					}]
				}],
				onShow: function() {
					var sel = editor.getSelection(), element = sel.getStartElement();
					if (sel.getRanges()[0].collapsed) {
						alert('Please select text to transform into a link');
						ckCancel = this._.buttons['cancel'],
							ckCancel.trigger('click');
						return;
					}
					this.element = editor.document.createElement('a');
					this.element.setHtml(sel.getSelectedText());
					if (element) element = element.getAscendant('a', true);
					// Browsers won't allow href attribute to be re-written, so doing this round-about by always creating a new <a> but propogating it with the existing element's values if it exists
					if (!element || element.getName() != 'a' || element.data('cke-realelement')) {
						this.setupContent(this.element);
					} else {
						this.setupContent(element);
					}
				},
				onOk: function() {
					var dialog = this, data = {};
					this.commitContent(data);
					if (data.href.length) this.element.setAttribute('href', data.href);
					if (data.target) this.element.setAttribute('target', data.target);
					editor.insertElement(this.element);
				}
			};
		});
		var _command = new CKEDITOR.dialogCommand('external_link');
		editor.addCommand('_external_link_dialog', _command);
		editor.execCommand("_external_link_dialog");
	},
	mediaLinkCallback: function(node, element) {
		var isEdit = typeof element.$.href != 'undefined' && element.$.href != '';
		CKEDITOR._scalar.contentoptions({
			data: reference_options['insertMediaLink'], node: node, element: element, callback: function(options) {
				var node = options.node;
				delete (options.node);


				var $element = $(element.$);
				$.each(element.$.attributes, function(i, a) {
					if (typeof a != 'undefined' && a.name.substring(0, 5) == 'data-') {
						$element.removeAttr(a.name);
					}
				});
				$element.removeAttr('resource');//.removeData();

				if (typeof node.version !== 'undefined') {
					var href = node.version['http://simile.mit.edu/2003/10/ontologies/artstor#url'][0].value;
				} else {
					var href = node.current.sourceFile;
				}

				for (var key in options) {
					if (key == "featured_annotation") {
						href += '#' + options[key];
					} else {
						element.setAttribute('data-' + key, options[key]);
					}
				}

				element.setAttribute('href', href);

				//Also have to set cke-saved-href if this is an edit, so that we can actually change the href value!
				if (isEdit) {
					element.data('cke-saved-href', href);
				}

				element.setAttribute('resource', node.slug);

				if (!isEdit) {
					CKEDITOR._scalar.editor.insertElement(element);
				} else {
					CKEDITOR._scalar.editor.updateElement(element);
				}

				var slug = node.slug;

				(function(thisSlug, e) {
					if (scalarapi.loadPage(thisSlug, false, function() {
						CKEDITOR._scalar.editor.editable().isInline() ? CKEDITOR._scalar.addCKInlineMediaPreview(thisSlug, e, 10) : CKEDITOR._scalar.addCKLinkedMediaPreview(thisSlug, e);
					}) == "loaded") {
						CKEDITOR._scalar.editor.editable().isInline() ? CKEDITOR._scalar.addCKInlineMediaPreview(thisSlug, e, 10) : CKEDITOR._scalar.addCKLinkedMediaPreview(thisSlug, e);
					}
				})(slug, element);
			}
		});
	},
	inlineMediaCallback: function(node, element) {
		var isEdit = typeof element.$.href != 'undefined' && element.$.href != '';
		CKEDITOR._scalar.contentoptions({
			data: reference_options['insertMediaelement'], node: node, element: element, callback: function(options) {
				var node = options.node;
				delete (options.node);

				element.setAttribute('name', 'scalar-inline-media');  // Required to let empty <a> through
				var $element = $(element.$);
				$.each(element.$.attributes, function(i, a) {
					if (typeof a != 'undefined' && a.name.substring(0, 5) == 'data-') {
						$element.removeAttr(a.name);
					}
				});
				$element.removeAttr('resource');//.removeData();

				var classAttr = 'inline';

				if (typeof node.version !== 'undefined') {
					var href = node.version['http://simile.mit.edu/2003/10/ontologies/artstor#url'][0].value;
				} else {
					var href = node.current.sourceFile;
				}
				for (var key in options) {
					if (key == "featured_annotation") {
						href += '#' + options[key];
					} else if (key == "text-wrap") {
						if (options[key] == "wrap-text-around-media") {
							classAttr += ' wrap';
						}
					} else {
						element.setAttribute('data-' + key, options[key]);
					}
				}


				element.setAttribute('class', classAttr);

				element.setAttribute('href', href);
				//Also have to set cke-saved-href if this is an edit, so that we can actually change the href value!
				if (isEdit) {
					element.data('cke-saved-href', href);
				}
				element.setAttribute('resource', node.slug);


				if (!isEdit) {
					CKEDITOR._scalar.editor.insertElement(element);
				} else {
					CKEDITOR._scalar.editor.updateElement(element);
				}

				if (cke_loadedScalarInline.indexOf(element) == -1) {
					(function(thisSlug, element) {
						if (scalarapi.loadPage(thisSlug, false, function() {
							CKEDITOR._scalar.addCKInlineMediaPreview(thisSlug, element);
						}) == "loaded") {
							CKEDITOR._scalar.addCKInlineMediaPreview(thisSlug, element);
						}
					})(node.slug, element)
				}
			}
		});
	},
	inlineNoteCallback: function(node, element) {
		var isEdit = false;
		//Check to see if we currently have an anchor tag - if so, make sure it's a non-inline media link
		if (element.data('widget') == null && element.getAscendant('a', true)) {
			element = element.getAscendant('a', true);
			if (element.getAttribute('resource') != null && element.hasClass('inline')) {
				//Is inline
				isEdit = true;
			}
		}
		CKEDITOR._scalar.contentoptions({
			data: reference_options['insertInlineNote'], node: node, element: element, isMedia: false, callback: function(options) {
				if (!node) {
					var node = options.node;
					delete (options.node);
				}

				element.setAttribute('class', 'inline inlineNote');
				element.setAttribute('rev', 'scalar:has_note');
				element.setAttribute('name', 'scalar-inline-note');
				element.setAttribute('resource', node.slug);
				for (var key in options) {
					if (key == 'node') continue;
					element.setAttribute('data-' + key, options[key]);
				}
				if (!isEdit) {
					CKEDITOR._scalar.editor.insertElement(element);
				} else {
					CKEDITOR._scalar.editor.updateElement(element);
				}
				if (cke_loadedScalarInline.indexOf(element) == -1) {
					(function(thisSlug, element) {
						if (scalarapi.loadPage(thisSlug, false, function() {
							CKEDITOR._scalar.addCKInlineMediaPreview(thisSlug, element);
						}) == "loaded") {
							CKEDITOR._scalar.addCKInlineMediaPreview(thisSlug, element);
						}
					})(node.slug, element)
				}
			}
		});
	},
	widgetLinkCallback: function(widget, element) {
		var isEdit = $(element.$).data('widget') != undefined;
		var href = null;
		var $element = $(element.$);
		var contentOptionsCallback = $element.data('contentOptionsCallback');
		var element = $element.data('element');
		var selectOptions = $element.data('selectOptions');
		selectOptions.isEdit = true;


		$.each(element.$.attributes, function(i, a) {
			if (typeof a != 'undefined' && a.name.substring(0, 5) == 'data-') {
				$element.removeAttr(a.name);
			}
		});

		$element.removeAttr('resource').removeData();


		for (var a in widget.attrs) {
			element.setAttribute(a, widget.attrs[a]);
			if (a == "href") {
				href = widget.attrs[a];
			}
		}

		$element.data({
			contentOptionsCallback: contentOptionsCallback,
			element: element,
			selectOptions: selectOptions
		});

		if (!isEdit) {
			CKEDITOR._scalar.editor.insertElement(element);
		} else {
			if (href != null) {
				element.data('cke-saved-href', href);
			}
			CKEDITOR._scalar.editor.updateElement(element);
		}

		if (cke_loadedScalarLinkedWidget.indexOf(element) == -1) {
			CKEDITOR._scalar.editor.editable().isInline() ? CKEDITOR._scalar.addCKInlineWidgetPreview(element, 10) : CKEDITOR._scalar.addCKLinkedWidgetPreview(element);
		}
	},
	widgetInlineCallback: function(widget, element) {
		var isEdit = $(element.$).data('widget') != undefined;
		var href = null;
		var $element = $(element.$);
		var contentOptionsCallback = $element.data('contentOptionsCallback');
		var element = $element.data('element');
		var selectOptions = $element.data('selectOptions');
		selectOptions.isEdit = true;

		$.each(element.$.attributes, function(i, a) {
			if (typeof a != 'undefined' && a.name.substring(0, 5) == 'data-') {
				$element.removeAttr(a.name);
			}
		});

		$element.removeAttr('resource').removeData();


		element.setAttribute('name', 'scalar-inline-widget');  // Required to let empty <a> through
		var classAttr = "inlineWidget inline";
		for (var a in widget.attrs) {
			if (a == "data-textwrap") {
				if (widget.attrs[a] == 'wrap') {
					classAttr += ' wrap';
				}
			} else {
				element.setAttribute(a, widget.attrs[a]);
			}
			if (a == "href") {
				href = widget.attrs[a];
			}
		}


		element.setAttribute('class', classAttr);

		$element.data({
			contentOptionsCallback: contentOptionsCallback,
			element: element,
			selectOptions: selectOptions
		});

		if (!isEdit) {
			if (href != null) {
				element.data('cke-saved-href', href);
			}
			CKEDITOR._scalar.editor.insertElement(element);
		} else {
			CKEDITOR._scalar.editor.updateElement(element);
		}
		if (cke_loadedScalarInlineWidget.indexOf(element) == -1) {
			CKEDITOR._scalar.addCKInlineWidgetPreview(element, 0);
		}
	},
	addCKInlineMediaPreview: function(slug, element, additionalInlineOffset) {
		var node = scalarapi.getNode(slug);
		var slug = slug;

		var $element = $(element.$);

		cke_loadedScalarInline.push(element);
		var thumbnail = node.thumbnail || $('link#approot').attr('href') + 'views/melons/cantaloupe/images/media_icon_chip.png';

		var cssElement = '<style>' +
			'a[resource="' + slug + '"].inline,a[href$="#' + slug + '"].inline{ background-size: contain; background-repeat: no-repeat; background-position: center center; background-image: url(' + thumbnail + ');}' +
			'</style>';
		$('.cke_contents>iframe').contents().find('head').append(cssElement);

		$element.data({
			element: element,
			type: 'media'
		}).off('mouseout mouseover').on('mouseenter', function() {
			if ($(this).parents('.cke_focus,body.cke_editable').length == 0) {
				return true;
			}
			var position = $(this).position();
			var framePosition = $(CKEDITOR._scalar.editor.editable().isInline() ? CKEDITOR._scalar.editor.container.$ : CKEDITOR._scalar.editor.document.$.defaultView.frameElement).offset();
			var frameScroll = CKEDITOR._scalar.editor.editable().isInline() ? 0 : $('.cke_contents>iframe').contents().scrollTop();
			var pageScroll = $(window).scrollTop();

			var topPos = (framePosition.top + position.top - frameScroll) + 10;

			if (!CKEDITOR._scalar.editor.editable().isInline() && frameScroll > position.top) {
				topPos = framePosition.top + 10;
			}

			if (!CKEDITOR._scalar.editor.editable().isInline()) {
				var gearIconLeft = framePosition.left + position.left + $(this).outerWidth() + parseInt($(this).css('margin-left')) - 40;
				var xIconLeft = framePosition.left + position.left + parseInt($(this).css('margin-left')) + 10;
			} else {
				var frameWidth = $(CKEDITOR._scalar.editor.container.$).outerWidth();
				var frameInnerWidth = $(CKEDITOR._scalar.editor.container.$).width();
				var framePosition = $(CKEDITOR._scalar.editor.container.$).offset();
				switch ($(this).data('size')) {
					case 'small':
						placeholderWidth = frameInnerWidth / 3.0;
						break;

					case 'medium':
						placeholderWidth = frameInnerWidth / 2.0;
						break;

					case 'large':
						placeholderWidth = frameInnerWidth * .75;
						break;

					default:
						placeholderWidth = frameInnerWidth;
						break;
				}
				switch ($(this).data('align')) {
					case 'right':
						var gearIconLeft = framePosition.left + frameWidth - 60;
						if ($(CKEDITOR._scalar.editor.container.$).parent().hasClass('gutter') && $(this).hasClass('inline')) {
							gearIconLeft -= 60;
						}
						var xIconLeft = gearIconLeft - (placeholderWidth - 50);
						break;
					case 'center':
						var gearIconLeft = framePosition.left + (frameWidth / 2.0) + (placeholderWidth / 2.0) - 40;
						if ($(CKEDITOR._scalar.editor.container.$).parent().hasClass('gutter')) {
							gearIconLeft -= 60;
						}
						var xIconLeft = gearIconLeft - (placeholderWidth - 50);
						break;
					default:
						var xIconLeft = framePosition.left + 40;
						var gearIconLeft = xIconLeft + (placeholderWidth - 80);
				}
			}

			if (frameScroll - position.top < 30) {
				$('#scalarInlineGearIcon').data({
					element: $(this).data('element'),
					type: $(this).data('type')
				}).css({ left: gearIconLeft, top: topPos }).show();

				$('#scalarInlineRedXIcon').data({
					element: $(this).data('element')
				}).css({ left: xIconLeft, top: topPos }).show();

				window.clearTimeout($('#scalarInlineGearIcon').data('timeout'));
			}
		}).on('mouseleave', function() {
			$('#scalarInlineGearIcon').data('timeout', window.setTimeout(function() { $('#scalarInlineGearIcon, #scalarInlineRedXIcon').hide(); }, 200));
		});
	},
	addCKInlineWidgetPreview: function(element, additionalInlineOffset) {
		cke_loadedScalarInlineWidget.push(element);
		var $element = $(element.$).data({
			element: element,
			type: 'widget'
		}).off('mouseout mouseover').on('mouseenter', function() {
			if ($(this).parents('.cke_focus,body.cke_editable').length == 0) {
				return true;
			}
			var position = $(this).position();
			var framePosition = $(CKEDITOR._scalar.editor.editable().isInline() ? CKEDITOR._scalar.editor.container.$ : CKEDITOR._scalar.editor.document.$.defaultView.frameElement).offset();
			var frameScroll = CKEDITOR._scalar.editor.editable().isInline() ? 0 : $('.cke_contents>iframe').contents().scrollTop();
			var pageScroll = $(window).scrollTop();

			var topPos = (framePosition.top + position.top - frameScroll) + 10;

			if (!CKEDITOR._scalar.editor.editable().isInline() && frameScroll > position.top) {
				topPos = framePosition.top + 10;
			}

			if (!CKEDITOR._scalar.editor.editable().isInline()) {
				var gearIconLeft = framePosition.left + position.left + $(this).outerWidth() + parseInt($(this).css('margin-left')) - 40;
				var xIconLeft = framePosition.left + position.left + parseInt($(this).css('margin-left')) + 10;
			} else {
				var frameWidth = $(CKEDITOR._scalar.editor.container.$).outerWidth();
				var frameInnerWidth = $(CKEDITOR._scalar.editor.container.$).width();
				var framePosition = $(CKEDITOR._scalar.editor.container.$).offset();
				switch ($(this).data('size')) {
					case 'small':
						placeholderWidth = frameInnerWidth / 3.0;
						break;

					case 'medium':
						placeholderWidth = frameInnerWidth / 2.0;
						break;

					case 'large':
						placeholderWidth = frameInnerWidth * .75;
						break;

					default:
						placeholderWidth = frameInnerWidth;
						break;
				}
				switch ($(this).data('align')) {
					case 'right':
						var gearIconLeft = framePosition.left + frameWidth - 50;
						if ($(CKEDITOR._scalar.editor.container.$).parent().hasClass('gutter') && $(this).hasClass('inline')) {
							gearIconLeft -= 60;
						}
						var xIconLeft = gearIconLeft - (placeholderWidth - 50);
						break;
					case 'center':
						var gearIconLeft = framePosition.left + (frameWidth / 2.0) + (placeholderWidth / 2.0) - 40;
						if ($(CKEDITOR._scalar.editor.container.$).parent().hasClass('gutter')) {
							gearIconLeft -= 60;
						}
						var xIconLeft = gearIconLeft - (placeholderWidth - 50);
						break;
					default:
						var xIconLeft = framePosition.left + 40;
						var gearIconLeft = xIconLeft + (placeholderWidth - 80);
				}
			}

			if (frameScroll - position.top < 30) {
				$('#scalarInlineGearIcon').data({
					element: $(this).data('element'),
					type: $(this).data('type')
				}).css({ left: gearIconLeft, top: topPos }).show();

				$('#scalarInlineRedXIcon').data({
					element: $(this).data('element')
				}).css({ left: xIconLeft, top: topPos }).show();

				window.clearTimeout($('#scalarInlineGearIcon').data('timeout'));
			}
		}).on('mouseleave', function() {
			$('#scalarInlineGearIcon').data('timeout', window.setTimeout(function() { $('#scalarInlineGearIcon, #scalarInlineRedXIcon').hide(); }, 200));
		});
	},
	addCKLinkedWidgetPreview: function(element) {
		$element = $(element.$);
		cke_loadedScalarLinkedWidget.push(element);
		$($element).off('mouseout mouseover').on('mouseenter', function() {
			if ($(this).parents('.cke_focus,body.cke_editable').length == 0) {
				return true;
			}
			var position = $(this).position();
			var framePosition = $(CKEDITOR._scalar.editor.editable().isInline() ? CKEDITOR._scalar.editor.container.$ : CKEDITOR._scalar.editor.document.$.defaultView.frameElement).offset();
			var frameScroll = CKEDITOR._scalar.editor.editable().isInline() ? 0 : $('.cke_contents>iframe').contents().scrollTop();
			var pageScroll = $(window).scrollTop();
			var thumbnail = $('link#approot').attr('href') + 'views/melons/cantaloupe/images/widget_image_' + $(this).data('widget') + '.png';

			var topPos = CKEDITOR._scalar.editor.editable().isInline() ? $(this).offset().top - pageScroll + 30 : framePosition.top + position.top - frameScroll - pageScroll + 30;
			var leftPos = CKEDITOR._scalar.editor.editable().isInline() ? $(this).offset().left : framePosition.left + position.left + ($(this).width() / 2) - 50;
			var data = {
				element: element,
				type: 'widget',
				inline: false
			};

			$('#scalarLinkTooltip').css({ left: leftPos, top: topPos }).show().data(data).find('.thumbnail').html('<img src="' + thumbnail + '">');

			window.clearTimeout($('#scalarLinkTooltip').data('timeout'));
		}).on('mouseleave', function() {
			$('#scalarLinkTooltip').data('timeout', window.setTimeout(function() { $('#scalarLinkTooltip').hide(); }, 200));
		});
	},
	addCKLinkedMediaPreview: function(slug, element) {
		$element = element.$;
		var node = scalarapi.getNode(slug);
		var slug = slug;
		$($element).off('mouseout mouseover').on('mouseenter', function() {
			if ($(this).parents('.cke_focus,body.cke_editable').length == 0) {
				return true;
			}

			var position = $(this).position();
			var framePosition = $(CKEDITOR._scalar.editor.editable().isInline() ? CKEDITOR._scalar.editor.container.$ : CKEDITOR._scalar.editor.document.$.defaultView.frameElement).offset();
			var frameScroll = CKEDITOR._scalar.editor.editable().isInline() ? 0 : $('.cke_contents>iframe').contents().scrollTop();
			var pageScroll = $(window).scrollTop();
			var thumbnail = node.thumbnail;

			var topPos = CKEDITOR._scalar.editor.editable().isInline() ? $(this).offset().top - pageScroll + 30 : framePosition.top + position.top - frameScroll - pageScroll + 30;
			var thumbClass = '';

			if (thumbnail == null) {
				thumbnail = $('link#approot').attr('href') + 'views/melons/cantaloupe/images/media_icon_chip.png';
				var thumbClass = 'missing';
			}
			var data = {
				element: element,
				type: 'media',
				inline: true
			};

			$('#scalarLinkTooltip').css({ left: framePosition.left + position.left + ($(this).width() / 2) - 50, top: topPos }).show().data(data).find('.thumbnail').html('<img src="' + thumbnail + '" class="' + thumbClass + '">');

			window.clearTimeout($('#scalarLinkTooltip').data('timeout'));
		}).on('mouseleave', function() {
			$('#scalarLinkTooltip').data('timeout', window.setTimeout(function() { $('#scalarLinkTooltip').hide(); }, 200));
		});
	}
};

CKEDITOR.plugins.add('scalar', {
	//icons: 'scalar1,scalar2,scalar3,scalar4,scalar5,scalar6,scalar7',
	icons: 'scalarkeyboard,scalar1,scalar2,scalar5,scalar6,scalar7,scalar8,scalar9,scalar10',
	requires: 'dialog',
	init: function(editor) {

		CKEDITOR._scalar.editor = editor;

		cke_loadedScalarInline = [];
		cke_loadedScalarInlineWidget = [];
		cke_loadedScalarLinkedWidget = [];

		cke_addedScalarScrollEvent = false;
		editor.on('mode', function(e) {
			if (!cke_addedScalarScrollEvent) {
				$(window).add($('.cke_wysiwyg_frame').contents()).on('scroll', function(e) {
					if ($('#scalarLinkTooltip').length > 0 && $('#scalarLinkTooltip').is(':visible') && $('#scalarLinkTooltip').data('element') != undefined) {
						var $element = $($('#scalarLinkTooltip').data('element').$);
						var position = $element.position();
						var framePosition = $(CKEDITOR._scalar.editor.editable().isInline() ? CKEDITOR._scalar.editor.container.$ : CKEDITOR._scalar.editor.document.$.defaultView.frameElement).offset();
						var frameScroll = CKEDITOR._scalar.editor.editable().isInline() ? 0 : $('.cke_contents>iframe').contents().scrollTop();
						var pageScroll = $(window).scrollTop();

						var topPos = CKEDITOR._scalar.editor.editable().isInline() ? $element.offset().top : framePosition.top + position.top - frameScroll - pageScroll + 30;

						$('#scalarLinkTooltip').css({ left: framePosition.left + position.left + ($element.width() / 2) - 50, top: topPos });
						if (topPos < (framePosition.top - pageScroll + 30)) {
							$('#scalarLinkTooltip').hide();
						}
					}
				});
				cke_addedScalarScrollEvent = true;
			}
			var addThumbnails = function() {
				var editor = e.editor;

				if (editor.mode == 'source') {
					cke_loadedScalarInline = [];
					cke_loadedScalarInlineWidget = [];
					cke_loadedScalarLinkedWidget = [];

					return;
				}

				var tooltip = $('<div id="scalarLinkTooltip"><div class="redxIcon"></div><div class="gearIcon"></div><div class="thumbnail"></div></div>').on('mouseenter', function() {
					window.clearTimeout($('#scalarLinkTooltip').data('timeout'));
				}).on('mouseleave', function() {
					$('#scalarLinkTooltip').data('timeout', window.setTimeout(function() { $('#scalarLinkTooltip').hide(); }, 200));
				}).appendTo('body');

				tooltip.find('.gearIcon').on('click', function(e) {
					e.preventDefault();
					e.stopPropagation();

					var $tooltip = $('#scalarLinkTooltip');
					var element = $tooltip.data('element');
					isEdit = true;
					if ($tooltip.data('type') != null && $tooltip.data('type') == "widget") {
						CKEDITOR._scalar.selectWidget($(element.$).data('selectOptions'));
					} else {
						CKEDITOR._scalar.selectcontent($(element.$).data('selectOptions'));
					}
				});

				tooltip.find('.redxIcon').on('click', function(e) {
					e.preventDefault();
					e.stopPropagation();

					var $tooltip = $('#scalarLinkTooltip');
					var element = $tooltip.data('element');
					if (confirm("Are you sure you would like to remove this linked " + ($(element.$).data('widget') != undefined ? "widget" : "media") + " from the current page?")) {
						element.remove(true);
						$tooltip.hide();
					}
				});


				var inlineGearIcon = $('<div id="scalarInlineGearIcon" class="gearIcon"></div>').on('click', function(e) {
					e.preventDefault();
					e.stopPropagation();

					$('#scalarInlineRedXIcon,#scalarInlineGearIcon').hide();
					var element = $(this).data('element');

					isEdit = true;
					if ($(this).data('type') != null && $(this).data('type') == "widget") {
						CKEDITOR._scalar.selectWidget($(element.$).data('selectOptions'));
					} else {
						CKEDITOR._scalar.selectcontent($(element.$).data('selectOptions'));
					}
				}).on('mouseenter', function() {
					window.clearTimeout($('#scalarInlineGearIcon').data('timeout'));
				}).on('mouseleave', function() {
					$('#scalarInlineGearIcon').data('timeout', window.setTimeout(function() { $('#scalarInlineGearIcon, #scalarInlineRedXIcon').hide(); }, 200));
				}).appendTo('body');

				var inlineRedXIcon = $('<div id="scalarInlineRedXIcon" class="redxIcon"></div>').on('click', function(e) {
					e.preventDefault();
					e.stopPropagation();

					if (confirm("Are you sure you would like to remove this inline element from the current page?")) {
						$('#scalarInlineRedXIcon,#scalarInlineGearIcon').hide();
						$(this).data('element').remove(true);
					}
				}).on('mouseenter', function() {
					window.clearTimeout($('#scalarInlineGearIcon').data('timeout'));
				}).on('mouseleave', function() {
					$('#scalarInlineGearIcon').data('timeout', window.setTimeout(function() { $('#scalarInlineGearIcon, #scalarInlineRedXIcon').hide(); }, 200));
				}).appendTo('body');

				var anchors = editor.document.find('a[resource], a[data-widget]');
				var num_anchors = anchors.count();
				for (var i = 0; i < num_anchors; i++) {
					var element = anchors.getItem(i);

					var href = element.getAttribute('href');

					var currentSlug = element.getAttribute('resource');
					if (element.data('widget') == null && currentSlug == null) {
						continue;
					} else if (element.data('widget') != null) {
						if (element.hasClass('inline')) {
							$(element.$).data({
								element: element,
								contentOptionsCallback: CKEDITOR._scalar.widgetInlineCallback,
								selectOptions: { isEdit: true, type: 'widget', msg: 'Edit Inline Scalar Widget Link', element: element, callback: CKEDITOR._scalar.widgetInlineCallback, inline: true }
							});
							CKEDITOR._scalar.addCKInlineWidgetPreview(element, 0);
						} else {
							$(element.$).data({
								element: element,
								contentOptionsCallback: CKEDITOR._scalar.widgetLinkCallback,
								selectOptions: { isEdit: true, type: 'widget', msg: 'Edit Linked Scalar Widget Link', element: element, callback: CKEDITOR._scalar.widgetLinkCallback, inline: false }
							});
							CKEDITOR._scalar.editor.editable().isInline() ? CKEDITOR._scalar.addCKInlineWidgetPreview(element, 10) : CKEDITOR._scalar.addCKLinkedWidgetPreview(element);
						}
					} else if (element.hasClass('inlineNote')) {
						$(element.$).data({
							element: element,
							contentOptionsCallback: CKEDITOR._scalar.inlineNoteCallback
						});
						$(element.$).data('selectOptions', { type: 'page', changeable: false, multiple: false, msg: 'Edit Inline Scalar Note', element: element, callback: $(element.$).data('contentOptionsCallback') });

						(function(thisSlug, element) {
							if (scalarapi.loadPage(thisSlug, false, function() {
								CKEDITOR._scalar.addCKInlineMediaPreview(thisSlug, element);
							}) == "loaded") {
								CKEDITOR._scalar.addCKInlineMediaPreview(thisSlug, element);
							}
						})(currentSlug, element);

					} else {
						if (!element.hasClass('inline')) {

							$(element.$).data({
								element: element,
								contentOptionsCallback: CKEDITOR._scalar.mediaLinkCallback
							});
							$(element.$).data('selectOptions', { type: 'media', changeable: false, multiple: false, msg: 'Edit Scalar Media Link', element: element, callback: $(element.$).data('contentOptionsCallback') });

							(function(thisSlug, e) {
								if (scalarapi.loadPage(thisSlug, false, function() {
									CKEDITOR._scalar.editor.editable().isInline() ? CKEDITOR._scalar.addCKInlineMediaPreview(thisSlug, e, 10) : CKEDITOR._scalar.addCKLinkedMediaPreview(thisSlug, e);
								}) == "loaded") {
									CKEDITOR._scalar.editor.editable().isInline() ? CKEDITOR._scalar.addCKInlineMediaPreview(thisSlug, e, 10) : CKEDITOR._scalar.addCKLinkedMediaPreview(thisSlug, e);
								}
							})(currentSlug, element);
						} else if (cke_loadedScalarInline.indexOf(element) == -1) {

							$(element.$).data({
								element: element,
								contentOptionsCallback: CKEDITOR._scalar.inlineMediaCallback
							});
							$(element.$).data('selectOptions', { type: 'media', changeable: false, multiple: false, msg: 'Edit Inline Scalar Media Link', element: element, callback: $(element.$).data('contentOptionsCallback') });

							(function(thisSlug, element) {
								if (scalarapi.loadPage(thisSlug, false, function() {
									CKEDITOR._scalar.addCKInlineMediaPreview(thisSlug, element);
								}) == "loaded") {
									CKEDITOR._scalar.addCKInlineMediaPreview(thisSlug, element);
								}
							})(currentSlug, element);
						}
					}
				};
			}
			if (typeof scalarapi != 'undefined') {
				addThumbnails();
			} else {
				$.getScript(widgets_uri + '/api/scalarapi.js', function() { addThumbnails() })
			}
		});
		var pluginDirectory = this.path;

		editor.addContentsCss(pluginDirectory + 'styles/scalar.css');

		editor.addCommand('insertScalarKeyboard', {  // Keyboard
			exec: function(editor) {
				CKEDITOR._scalar.editor = editor;
				var $keyboard = $('#language-keyboard');
				if (!$keyboard.length) return;
				$keyboard.show().css({
					top: (parseInt($(window).height()) - parseInt($keyboard.outerHeight()) - 20 + $(window).scrollTop()) + 'px',
					left: (parseInt($(window).width()) - parseInt($keyboard.outerWidth()) - 20) + 'px'
				});
			}
		});

		editor.addCommand('insertScalar1', {
			exec: function(editor) {
				CKEDITOR._scalar.editor = editor;
				var sel = editor.getSelection();
				var isEdit = false;
				var element = sel.getStartElement();

				//Check to see if we currently have an anchor tag - if so, make sure it's a non-inline media link
				if (element.data('widget') == null && element.getAscendant('a', true)) {
					element = element.getAscendant('a', true);
					if (element.getAttribute('resource') != null && !element.hasClass('inline')) {
						//Not inline
						isEdit = true;
					}
				}
				if (!isEdit) {
					if (sel.getRanges()[0].collapsed) {
						alert('Please select text to transform into a media link');
						return;
					} else {
						var sel = editor.getSelection();
						element = editor.document.createElement('a');
						element.setHtml(sel.getSelectedText());
						$(element.$).data({
							element: element,
							contentOptionsCallback: CKEDITOR._scalar.mediaLinkCallback,
							selectOptions: { type: 'media', changeable: false, multiple: false, msg: 'Insert Scalar Media Link', element: element, callback: CKEDITOR._scalar.mediaLinkCallback }
						});
					}
				}
				CKEDITOR._scalar.selectcontent($(element.$).data('selectOptions'));
			}
		});
		editor.addCommand('insertScalar2', {
			exec: function(editor) {
				CKEDITOR._scalar.editor = editor;
				var sel = editor.getSelection();
				var element = sel.getStartElement();
				var isEdit = false;
				//Check to see if we currently have an anchor tag - if so, make sure it's a non-inline media link
				if (element.data('widget') == null && element.getAscendant('a', true)) {
					element = element.getAscendant('a', true);
					if (element.getAttribute('resource') != null && element.hasClass('inline')) {
						//Is inline
						isEdit = true;
					}
				}

				if (!isEdit) {
					element = editor.document.createElement('a')
					$(element.$).data({
						element: element,
						contentOptionsCallback: CKEDITOR._scalar.inlineMediaCallback,
						selectOptions: { type: 'media', changeable: false, multiple: false, msg: 'Insert Inline Scalar Media Link', element: element, callback: CKEDITOR._scalar.inlineMediaCallback }
					});
				}

				CKEDITOR._scalar.selectcontent($(element.$).data('selectOptions'));
			}
		});
		editor.addCommand('insertScalar5', {  // Insert Note
			exec: function(editor) {
				CKEDITOR._scalar.editor = editor;
				var sel = editor.getSelection();
				if (sel.getRanges()[0].collapsed) {
					alert('Please select text to transform into a note link');
					return;
				}
				var sel = editor.getSelection();
				element = editor.document.createElement('span');
				element.setHtml(sel.getSelectedText());
				CKEDITOR._scalar.selectcontent({
					changeable: true, multiple: false, onthefly: true, msg: 'Insert Scalar Note', callback: function(node) {
						scalarapi.loadNode(node.slug, true, function(response) {
							var scalarNode = scalarapi.getNode(node.slug);
							CKEDITOR._scalar.contentoptions({
								data: reference_options['insertNote'], node: scalarNode, element: element, isMedia: false, callback: function(options) {
									element.setAttribute('class', 'note');
									element.setAttribute('rev', 'scalar:has_note');
									element.setAttribute('resource', node.slug);
									for (var key in options) {
										if (key == 'node') continue;
										element.setAttribute('data-' + key, options[key]);
									}
									editor.insertElement(element);
								}
							});
						});
					}
				});
			}
		});

		editor.addCommand('insertScalar10', {  // Insert Inline Note
			exec: function(editor) {
				CKEDITOR._scalar.editor = editor;
				var sel = editor.getSelection();
				var element = sel.getStartElement();
				var isEdit = false;
				//Check to see if we currently have an anchor tag - if so, make sure it's a non-inline media link
				if (element.data('widget') == null && element.getAscendant('a', true)) {
					element = element.getAscendant('a', true);
					if (element.getAttribute('resource') != null && element.hasClass('inline')) {
						//Is inline
						isEdit = true;
					}
				}
				if (!isEdit) {
					element = editor.document.createElement('a');
					$(element.$).data({
						element: element,
						contentOptionsCallback: CKEDITOR._scalar.inlineNoteCallback,
						selectOptions: { changeable: true, multiple: false, onthefly: true, msg: 'Insert Inline Scalar Note', element: element, callback: CKEDITOR._scalar.inlineNoteCallback }
					});
				}
				CKEDITOR._scalar.selectcontent($(element.$).data('selectOptions'));
			}
		});

		editor.addCommand('insertScalar6', {
			exec: function(editor) {
				CKEDITOR._scalar.editor = editor;
				var sel = editor.getSelection();
				if (sel.getRanges()[0].collapsed) {
					alert('Please select text to transform into a link');
					return;
				}
				var element = sel.getStartElement();
				CKEDITOR._scalar.selectcontent({
					changeable: true, multiple: false, onthefly: true, msg: 'Insert link to Scalar content', callback: function(node) {
						CKEDITOR._scalar.contentoptions({
							node: node,
							element: element,
							data: reference_options['createInternalLink'], callback: function(options) {
								var sel = editor.getSelection();
								element = editor.document.createElement('a');
								element.setHtml(sel.getSelectedText());
								element.setAttribute('href', node.slug);
								for (var key in options) {
									element.setAttribute('data-' + key, options[key]);
								}
								editor.insertElement(element);
							}
						});
					}
				});
			}
		});

		editor.addCommand('insertScalar7', {  // External link
			exec: function(editor) {
				CKEDITOR._scalar.editor = editor;
				CKEDITOR._scalar.external_link(editor, {});
			}
		});

		//BEGIN WIDGET CODE

		editor.addCommand('insertScalar8', { //Widget Link
			exec: function(editor) {
				CKEDITOR._scalar.editor = editor;
				var sel = editor.getSelection();
				var isEdit = false;
				var element = sel.getStartElement();

				//Check to see if we currently have an anchor tag - if so, make sure it's a non-inline widget link
				if (element.data('widget') != null && element.getAscendant('a', true)) {
					element = element.getAscendant('a', true);
					if (element.getAttribute('resource') != null && !element.hasClass('inline')) {
						//Not inline
						isEdit = true;
					}
				}
				if (!isEdit) {
					if (sel.getRanges()[0].collapsed) {
						alert('Please select text to transform into a widget link');
						return;
					} else {
						var sel = editor.getSelection();
						element = editor.document.createElement('a');
						element.setHtml(sel.getSelectedText());
						$(element.$).data({
							element: element,
							contentOptionsCallback: CKEDITOR._scalar.widgetLinkCallback,
							selectOptions: { isEdit: false, type: 'widget', msg: 'Insert Inline Scalar Widget Link', element: element, callback: CKEDITOR._scalar.widgetLinkCallback, inline: false }
						});
					}
				}
				CKEDITOR._scalar.selectWidget($(element.$).data('selectOptions'));
			}
		});

		editor.addCommand('insertScalar9', { //Widget Inline Link
			exec: function(editor) {
				CKEDITOR._scalar.editor = editor;

				var sel = editor.getSelection();
				var element = sel.getStartElement();
				var isEdit = false;
				//Check to see if we currently have an anchor tag - if so, make sure it's a non-inline media link
				if (element.data('widget') != null && element.getAscendant('a', true)) {
					element = element.getAscendant('a', true);
					if (element.getAttribute('resource') != null && element.hasClass('inline')) {
						//Is inline
						isEdit = true;
					}
				}

				if (!isEdit) {
					element = editor.document.createElement('a')
					$(element.$).data({
						element: element,
						contentOptionsCallback: CKEDITOR._scalar.widgetInlineCallback,
						selectOptions: { isEdit: false, type: 'widget', msg: 'Insert Inline Scalar Widget Link', element: element, callback: CKEDITOR._scalar.widgetInlineCallback, inline: true }
					});
				}

				CKEDITOR._scalar.selectWidget($(element.$).data('selectOptions'));
			}
		});

		//END WIDGET CODE

		editor.ui.addButton('ScalarKeyboard', {
			label: 'Display Language Keyboard',
			command: 'insertScalarKeyboard',
			toolbar: 'characters'
		});
		editor.ui.addButton('Scalar1', {
			label: 'Insert Scalar Media Link',
			command: 'insertScalar1',
			toolbar: 'links'
		});
		editor.ui.addButton('Scalar2', {
			label: 'Insert Inline Scalar Media Link',
			command: 'insertScalar2',
			toolbar: 'links'
		});
		editor.ui.addButton('Scalar5', {
			label: 'Insert Scalar Note',
			command: 'insertScalar5',
			toolbar: 'links'
		});
		editor.ui.addButton('Scalar6', {
			label: 'Insert Link to another Scalar Page',
			command: 'insertScalar6',
			toolbar: 'links'
		});
		editor.ui.addButton('Scalar7', {
			label: 'Insert External Link',
			command: 'insertScalar7',
			toolbar: 'links'
		});
		editor.ui.addButton('Scalar8', {
			label: 'Insert Scalar Widget Link',
			command: 'insertScalar8',
			toolbar: 'links'
		});
		editor.ui.addButton('Scalar9', {
			label: 'Insert Inline Scalar Widget Link',
			command: 'insertScalar9',
			toolbar: 'links'
		});
		editor.ui.addButton('Scalar10', {
			label: 'Insert Inline Scalar Note',
			command: 'insertScalar10',
			toolbar: 'links'
		});
	}
});
