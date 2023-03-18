CKEDITOR._scalarbeta = {
	selectcontent : function(options) {
		$('<div></div>').content_selector(options);
	},
	contentoptions : function(options) {
		$('<div></div>').content_options(options);
	},
	selectWidget : function(options){
		$('<div></div>').widget_selector(options);
	},
	widgetOptions : function(options){
		$('<div></div>').widget_options(options);
	},
	flushEditor : function(editor){
		//TODO:Replace this with a better solution...
		var inline = editor.editable().isInline();
		if(inline){
			$('#editorialPath').data('editorialPath').saveNode($(CKEDITOR._scalarbeta.editor.editable().$).parents('.editorial_node'));
			var $editableBody = $(CKEDITOR._scalarbeta.editor.editable().$).data('unloading',true);
			CKEDITOR._scalarbeta.editor.destroy(true);
			$editableBody.prop('contenteditable',false).data('editor',null);
			$('#editorialPath').data('editorialPath').updateLinks($editableBody.parent());
            $editableBody.trigger('click');
		}else{
        	CKEDITOR._scalarbeta.addPlaceholders();
		}
	},
	addNewPlaceholder : function(element,inLoader){
		if(typeof inLoader == 'undefined'){
			inLoader = true;
		}

		var deferred = jQuery.Deferred();
		var promise = deferred.promise();

		var createPlaceholder = $.proxy(function(inLoader,deferred){
			var element = this;
			if(inLoader){
				if(element.attributes['resource'])
		        {
		        	var node = scalarapi.getNode(element.attributes['resource']);
		        	var thumbnail = node.thumbnail;
					if(thumbnail == null){
						thumbnail = $('link#approot').attr('href')+'views/melons/cantaloupe/images/media_icon_chip.png';
					}
		            var title = "media";
		            var isMedia = true;
		        }else if(element.attributes['data-widget']){
		        	var thumbnail = $('link#approot').attr('href')+'views/melons/cantaloupe/images/widget_image_'+element.attributes['data-widget']+'.png';
		        	var title = element.attributes['data-widget']+" widget";
		        	var isMedia = false;
		        }
				var cssClass = (element.hasClass('inline')?'inline':'linked')+" placeholder";
				var placeholder = new CKEDITOR.htmlParser.element('img',{
					class : cssClass+' '+element.attributes['data-size'] + ' align_'+element.attributes['data-align'],
					src : thumbnail,
					title : title,
					contentEditable : 'false'
				});
			}else{
				if(element.hasAttribute('resource'))
		        {
		        	var node = scalarapi.getNode(element.getAttribute('resource'));
		        	var thumbnail = node.thumbnail;
					if(thumbnail == null){
						thumbnail = $('link#approot').attr('href')+'views/melons/cantaloupe/images/media_icon_chip.png';
					}
		            var title = "media";
		            var isMedia = true;
		        }else if(element.hasAttribute('data-widget')){
		        	var thumbnail = $('link#approot').attr('href')+'views/melons/cantaloupe/images/widget_image_'+element.getAttribute('data-widget')+'.png';
		        	var title = element.getAttribute('data-widget')+" widget";
		        	var isMedia = false;
		        }
				var cssClass = (element.hasClass('inline')?'inline':'linked')+" placeholder";
				var placeholder = CKEDITOR._scalarbeta.editor.document.createElement('img');
				var attributes = {
					class : cssClass+' '+element.getAttribute('data-size') + ' align_'+element.getAttribute('data-align'),
					src : thumbnail,
					title : title,
					contentEditable : 'false'
				};
				attributes['data-newLink'] = true;
				attributes['data-content'] = element.getIndex();
				placeholder.setAttributes(attributes);
			}

			placeholder.insertAfter(element);
			deferred.resolve(placeholder);
		},element,inLoader,deferred);

		var slug = null;
		if(inLoader){
			if(element.attributes['resource']){
		    	slug = element.attributes['resource'];
		    }
		}else{
			if(element.hasAttribute('resource')){
				slug = element.getAttribute('resource')
			}
		}
		if(slug !== null){
        	if(scalarapi.loadPage( slug, false, createPlaceholder) == "loaded"){
				createPlaceholder();
			}
        }else{
        	createPlaceholder();
        }

        return promise;
	},
	populatePlaceholderData : function(e,newPlaceholder){
		var addContentOptions = function(placeholder){
			var $link = $($(placeholder.$).data('link').$);
        	var isMedia = $link.attr('resource') != undefined;
        	var isInline = $link.hasClass('inline');
        	var typeText = (isMedia?'media':'widget');
        	var messageText = 'Edit '+(isInline?'Inline':'Linked')+' Scalar '+(isMedia?'Media':'Widget');
        	var callBackName = '';
        	if(isInline){
        		callBackName = (isMedia?'inlineMedia':'widgetInline');
        	}else{
        		callBackName = (isMedia?'media':'widget')+"Link";
        	}
        	var callback = CKEDITOR._scalarbeta[callBackName+'Callback'];
        	$link.data({
				  contentOptionsCallback : callback,
				  selectOptions : {
				  		isEdit:true,
				  		type:typeText,
				  		msg:messageText,
				  		element:$(placeholder.$).data('link'),
				  		callback:callback,
				  		inline:isInline
				  }
			});
		}

		addContentOptions(newPlaceholder);
		$(newPlaceholder.$).data('newlink',false);
    	CKEDITOR._scalarbeta.UpdatePlaceholderHoverEvents(CKEDITOR._scalarbeta.editor,$(newPlaceholder.$));
	},
	updateEditMenuPosition : function(editor){
		CKEDITOR._scalarbeta.editor = editor;
		$placeholder = CKEDITOR._scalarbeta.$editorMenu.data('placeholder');
		if(typeof CKEDITOR._scalarbeta.editor.editable() == 'undefined' || CKEDITOR._scalarbeta.editor.editable() == null){
			var inline = false;
			if(typeof CKEDITOR._scalarbeta.editor.document == undefined || CKEDITOR._scalarbeta.editor.document == null){
				return false;
			}
		}else{
			var inline = CKEDITOR._scalarbeta.editor.editable().isInline();
		}
		if(inline){
			$placeholder = $placeholder.find('.content');
		}
		CKEDITOR._scalarbeta.$editorMenu.width($placeholder.width());
		var position = $placeholder.position();
		var framePosition = $(inline?CKEDITOR._scalarbeta.editor.container.$:CKEDITOR._scalarbeta.editor.document.$.defaultView.frameElement).offset();
		var frameScroll = inline?0:$('.cke_contents>iframe').contents().scrollTop();
		var pageScroll = $(window).scrollTop();
		var inlineOffset = -50;
		var topPos = inline?$placeholder.offset().top+inlineOffset:framePosition.top+position.top-frameScroll;
		var leftPos = framePosition.left+position.left+parseInt($placeholder.css('margin-left'))+parseInt($placeholder.css('padding-left'));
		if(!CKEDITOR._scalarbeta.editor.editable().isInline() && frameScroll > position.top){
			topPos = framePosition.top;
		}
		CKEDITOR._scalarbeta.$editorMenu.css({
			top:topPos,
			left:leftPos
		});
	},
	UpdatePlaceholderHoverEvents : function(editor,$placeholder){
		if(typeof CKEDITOR._scalarbeta.$editorMenu == 'undefined'){
			CKEDITOR._scalarbeta.$editorMenu = $('<ul class="caption_font scalarEditorMediaWidgetMenu"><li class="pull-left"><a href="#" class="deleteLink">Delete</a></li><li class="pull-right"><a href="#" class="editLink">Edit</a></li></ul>')
				.appendTo('body')
				.hover(function(){
					window.clearTimeout(CKEDITOR._scalarbeta.editMenuTimeout);
				},function(){
					window.clearTimeout(CKEDITOR._scalarbeta.editMenuTimeout);
					CKEDITOR._scalarbeta.editMenuTimeout = window.setTimeout(function(){
						CKEDITOR._scalarbeta.$editorMenu.hide();
					},50);
				});
			CKEDITOR._scalarbeta.$editorMenu.find('.editLink').on('click', function(e){
				e.preventDefault();
				e.stopPropagation();
				CKEDITOR._scalarbeta.$editorMenu.hide();
				var element = CKEDITOR._scalarbeta.$editorMenu.data('link');
				isEdit = true;

				if($(element.$).data('selectOptions').type!=null&&$(element.$).data('selectOptions').type=="widget"){
					CKEDITOR._scalarbeta.selectWidget($(element.$).data('selectOptions'));
				}else{
					CKEDITOR._scalarbeta.selectcontent($(element.$).data('selectOptions'));
				}
			});
			CKEDITOR._scalarbeta.$editorMenu.find('.deleteLink').on('click', function(e){
				e.preventDefault();
				e.stopPropagation();
				CKEDITOR._scalarbeta.$editorMenu.hide();
				var element = CKEDITOR._scalarbeta.$editorMenu.data('link');
				var inline = CKEDITOR._scalarbeta.editor.editable().isInline();
				var doDelete = window.confirm("Are you sure you would like to delete this "+$(element.$).data('selectOptions').type+"? \n(Click \"OK\" to remove, click \"Cancel\" to keep.)");
				if(!doDelete){
					return false;
				}
				if(!inline){
					$(element.$).data('placeholder').remove(true);
					element.remove();
				}else{
					$($(element.$).data('placeholder').$).remove();
					$(element.$).remove();
					var $editableBody = $(CKEDITOR._scalarbeta.editor.editable().$).data('unloading',true);
					CKEDITOR.instances[$editableBody.data('editor').name].destroy(true);
					$editableBody.prop('contenteditable',false).data('editor',null);
					$('#editorialPath').data('editorialPath').updateLinks($editableBody.parent());
		            $editableBody.trigger('click');
				}
				return false;
			});
		}

		$placeholder.off('mouseenter').off('mouseleave').on('mouseenter', function(e){
			CKEDITOR._scalarbeta.$editorMenu.show().width($(this).width()).data({
				link:$(this).data('link'),
				placeholder:$(this)
			});
			CKEDITOR._scalarbeta.updateEditMenuPosition(editor);
			window.clearTimeout(CKEDITOR._scalarbeta.editMenuTimeout);
		}).on('mouseleave', function(e){
			window.clearTimeout(CKEDITOR._scalarbeta.editMenuTimeout);
			CKEDITOR._scalarbeta.editMenuTimeout = window.setTimeout(function(){
				CKEDITOR._scalarbeta.$editorMenu.hide();
			},100);
		});
	},
	external_link : function(editor, options) {
		CKEDITOR.dialog.add( 'external_link', function(editor) {
			return {
				title : 'Insert External Link',
				width : 500,
				minHeight : 100,
				contents : [{
					id : 'general',
					label : 'External Link',
					elements : [{
						type : 'html',
						html : 'Add a hyperlink to an external site. Scalar will maintain a header bar that allows easy navigation back to your book (unless disallowed by the external site).'
					},{
						type : 'text',
						id : 'href',
						label : 'URL',
						'default' : 'http://',
						validate : CKEDITOR.dialog.validate.notEmpty( 'URL is a required field' ),
						required : true,
						setup : function(element) {
							if (null!==element.getAttribute('href')) this.setValue(element.getAttribute('href'));
						},
						commit : function(data) {
							data.href = this.getValue();
						}
					},{
						type : 'checkbox',
						id : 'target_blank',
						label : 'Open in a new browser window',
						'default' : false,
						setup : function(element) {
							if ('_blank'==element.getAttribute('target')) this.setValue('checked');
						},
						commit : function(data) {
							data.target = (this.getValue()) ? '_blank' : false;
						}
					}]
				}],
				onShow : function() {
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
					if (!element || element.getName() != 'a' || element.data('cke-realelement' )) {
						this.setupContent(this.element);
					} else {
						this.setupContent(element);
					}
				},
				onOk : function() {
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
	mediaLinkCallback : function(node,element){
		var isEdit = typeof element.$.href != 'undefined' && element.$.href != '';
		CKEDITOR._scalarbeta.contentoptions({data:reference_options['insertMediaLink'],node:node,element:element,callback:function(options) {
					var node = options.node;
					delete(options.node);

					var $element = $(element.$);

					var placeholder = $element.data('placeholder');
					$element.data('placeholder',null);
					$.each(element.$.attributes,function(i,a){
			        	if(typeof a != 'undefined' && a.name.substring(0,5) == 'data-'){
			        		$element.removeAttr(a.name);
			        	}
			        });
			        $element.removeAttr('resource').removeData();

					if(typeof node.version !== 'undefined'){
						var href = node.version['http://simile.mit.edu/2003/10/ontologies/artstor#url'][0].value;
					}else{
						var href = node.current.sourceFile;
					}

					for (var key in options) {
						if(key == "featured_annotation"){
							href+='#'+options[key];
						}else{
							element.setAttribute('data-'+key, options[key]);
						}
					}

					element.setAttribute('href', href);

					//Also have to set cke-saved-href if this is an edit, so that we can actually change the href value!
					if(isEdit){
						element.data('cke-saved-href',href);
					}

					element.setAttribute('resource', node.slug);


					var inline = CKEDITOR._scalarbeta.editor.editable().isInline();
					if(!isEdit){
						CKEDITOR._scalarbeta.editor.insertElement(element);
					}else if(!inline){
						CKEDITOR._scalarbeta.editor.updateElement(element);
					}

					var slug = node.slug;
					CKEDITOR._scalarbeta.flushEditor(CKEDITOR._scalarbeta.editor,element,isEdit?placeholder:'');
		}});
	},
	inlineMediaCallback : function(node,element){
		var isEdit = typeof element.$.href != 'undefined' && element.$.href != '';
		CKEDITOR._scalarbeta.contentoptions({data:reference_options['insertMediaelement'],node:node,element:element,callback:function(options) {
				var node = options.node;
				delete(options.node);

				element.setAttribute('name','scalar-inline-media');  // Required to let empty <a> through
				var $element = $(element.$);

				var placeholder = $element.data('placeholder');
				$element.data('placeholder',null);

				$.each(element.$.attributes,function(i,a){
		        	if(typeof a != 'undefined' && a.name.substring(0,5) == 'data-'){
		        		$element.removeAttr(a.name);
		        	}
		        });
		        $element.removeAttr('resource').removeData();

				var classAttr = 'inline';

				if(typeof node.version !== 'undefined'){
					var href = node.version['http://simile.mit.edu/2003/10/ontologies/artstor#url'][0].value;
				}else{
					var href = node.current.sourceFile;
				}
				for (var key in options) {
					if(key == "featured_annotation"){
						href+='#'+options[key];
					}else if(key == "text-wrap"){
						if(options[key] == "wrap-text-around-media"){
							classAttr += ' wrap';
						}
					}else{
						element.setAttribute('data-'+key, options[key]);
					}
				}


				element.setAttribute('class', classAttr);

				element.setAttribute('href', href);
				//Also have to set cke-saved-href if this is an edit, so that we can actually change the href value!
				if(isEdit){
					element.data('cke-saved-href',href);
				}
				element.setAttribute('resource', node.slug);
				var inline = CKEDITOR._scalarbeta.editor.editable().isInline();
				if(!isEdit){
					CKEDITOR._scalarbeta.editor.insertElement(element);
				}else if(!inline){
					CKEDITOR._scalarbeta.editor.updateElement(element);
				}
				CKEDITOR._scalarbeta.flushEditor(CKEDITOR._scalarbeta.editor,element,isEdit?placeholder:'');
		}});
	},
	widgetLinkCallback : function(widget, element){
		var isEdit = $(element.$).data('widget') != undefined;
		var href = null;
		var $element = $(element.$);

		var placeholder = $element.data('placeholder');
		$element.data('placeholder',null);

		var contentOptionsCallback = $element.data('contentOptionsCallback');
		var selectOptions = $element.data('selectOptions');
		var element = selectOptions.element;
		selectOptions.isEdit = true;
		$.each(element.$.attributes,function(i,a){
        	if(typeof a != 'undefined' && a.name.substring(0,5) == 'data-'){
        		$element.removeAttr(a.name);
        	}
        });

		$element.removeAttr('resource').removeData();


		for (var a in widget.attrs) {
			element.setAttribute(a, widget.attrs[a]);
			if(a == "href"){
				href = widget.attrs[a];
			}
		}

		$element.data({
			contentOptionsCallback: contentOptionsCallback,
			element: element,
			selectOptions: selectOptions
		});

		var inline = CKEDITOR._scalarbeta.editor.editable().isInline();
		if(!isEdit){
			CKEDITOR._scalarbeta.editor.insertElement(element);
		}else if(!inline){
			if(href!=null){
				element.data('cke-saved-href', href);
			}
			CKEDITOR._scalarbeta.editor.updateElement(element);
		}
		CKEDITOR._scalarbeta.flushEditor(CKEDITOR._scalarbeta.editor,element,isEdit?placeholder:'');
	},
	widgetInlineCallback : function(widget, element){
		var isEdit = $(element.$).data('widget') != undefined;
		var href = null;
		var $element = $(element.$);

		var placeholder = $element.data('placeholder');
		$element.data('placeholder',null);

		var contentOptionsCallback = $element.data('contentOptionsCallback');
		var selectOptions = $element.data('selectOptions');
		var element = selectOptions.element;
		selectOptions.isEdit = true;
		$.each(element.$.attributes,function(i,a){
        	if(typeof a != 'undefined' && a.name.substring(0,5) == 'data-'){
        		$element.removeAttr(a.name);
        	}
        });

		$element.removeAttr('resource').removeData();


		element.setAttribute('name','scalar-inline-widget');  // Required to let empty <a> through
		var classAttr = "inlineWidget inline";
		for (var a in widget.attrs) {
			if(a == "data-textwrap"){
				if(widget.attrs[a] == 'wrap'){
					classAttr += ' wrap';
				}
			}else{
				element.setAttribute(a, widget.attrs[a]);
			}
			if(a == "href"){
				href = widget.attrs[a];
			}
		}


		element.setAttribute('class', classAttr);

		$element.data({
			contentOptionsCallback: contentOptionsCallback,
			element: element,
			selectOptions: selectOptions
		});

		var inline = CKEDITOR._scalarbeta.editor.editable().isInline();
		if(!isEdit){
			CKEDITOR._scalarbeta.editor.insertElement(element);
		}else if(!inline){
			if(href!=null){
				element.data('cke-saved-href', href);
			}
			CKEDITOR._scalarbeta.editor.updateElement(element);
		}

		CKEDITOR._scalarbeta.flushEditor(CKEDITOR._scalarbeta.editor,element,isEdit?placeholder:'');
	},
	addPlaceholders : function(){
		var createThumbnails = function(){
								if(CKEDITOR._scalarbeta.editor.editable().isInline()){
									var placeholders = CKEDITOR._scalarbeta.editor.editable().find('.placeholder');
									for(var i = 0; i < placeholders.count(); i++){
							    		var placeholder = placeholders.getItem(i);
							    		var links = CKEDITOR._scalarbeta.editor.document.find('a');
							    		var link = null;
							    		for(var n = 0; n < links.count(); n++){
							    			if($(links.getItem(n).$).data('linkid') == $(placeholder.$).data('linkid')){
							    				link = links.getItem(n);
							    				$(placeholder.$).data('link',link);
									    		$(link.$).data('placeholder',placeholder);
									    		CKEDITOR._scalarbeta.populatePlaceholderData(false,placeholder);
									    		break;
							    			}
							    		}

							    		if(!link){
							    			console.log("Could not find matching link for placeholder:",placeholder);
							    		}
							    	}
								}else{
									var mediaWidgetLinks = [];
							    	var links = CKEDITOR._scalarbeta.editor.document.find('a');
							    	for(var i = 0; i < links.count(); i++){
							    		var link = links.getItem(i);
							    		if($(link.$).attr('resource') || $(link.$).attr('data-widget')){
							    			mediaWidgetLinks.push(link);
							    		}
							    	}
							    	CKEDITOR._scalarbeta.editor.document.getBody().removeClass('gutter');
							    	for(var link in mediaWidgetLinks){
							    		var thisLink = mediaWidgetLinks[link];
							    		$.when( CKEDITOR._scalarbeta.addNewPlaceholder(thisLink,false) ).then(
										  function( placeholder ) {
										    $(placeholder.$).data('link',thisLink);
											$(thisLink.$).data('placeholder',placeholder);
											CKEDITOR._scalarbeta.populatePlaceholderData(false,placeholder);
											if(CKEDITOR._scalarbeta.editor.document.find('img.linked.placeholder.align_right').count() > 0){
												CKEDITOR._scalarbeta.editor.document.getBody().addClass('gutter');
											}
										  }
										);
							    	}
							    }
							};
		if(typeof scalarapi != 'undefined'){
			createThumbnails();
		}else{
			$.getScript(widgets_uri+'/api/scalarapi.js',createThumbnails)
		}
    }
};

CKEDITOR.plugins.add( 'scalarbeta', {
    //icons: 'scalar1,scalar2,scalar3,scalar4,scalar5,scalar6,scalar7',
	icons: 'scalarkeyboard,scalar1,scalar2,scalar5,scalar6,scalar7,scalar8,scalar9',
    requires: 'dialog',
    init: function( editor ) {
			CKEDITOR._scalarbeta.editor = editor;

			cke_loadedScalarInline = [];
			cke_loadedScalarInlineWidget = [];
			cke_loadedScalarLinkedWidget = [];

			cke_addedScalarScrollEvent = false;
			CKEDITOR._scalarbeta.editor.on('mode',function(e){
				if(!cke_addedScalarScrollEvent){
					$(window).add($('.cke_wysiwyg_frame').contents()).off('scroll.ckeScalar').on('scroll.ckeScalar',$.proxy(function(e){
						if(typeof this == 'undefined'){
							return false;
						}
						if(typeof CKEDITOR._scalarbeta.$editorMenu != "undefined" && CKEDITOR._scalarbeta.$editorMenu.data('placeholder')!=undefined){
							CKEDITOR._scalarbeta.updateEditMenuPosition(this);
						}
					},CKEDITOR._scalarbeta.editor));
					cke_addedScalarScrollEvent = true;
				}
			});
	    var pluginDirectory = this.path;

	    CKEDITOR._scalarbeta.editor.addContentsCss( pluginDirectory + 'styles/scalar.css' );

        CKEDITOR._scalarbeta.editor.addCommand( 'insertScalarKeyboard', {  // Keyboard
            exec: function( editor ) {
            	CKEDITOR._scalarbeta.editor = editor;
            	var $keyboard = $('#language-keyboard');
            	if (!$keyboard.length) return;
            	$keyboard.show().css({
					top: (parseInt($(window).height()) - parseInt($keyboard.outerHeight()) - 20 + $(window).scrollTop()) + 'px',
					left: (parseInt($(window).width()) - parseInt($keyboard.outerWidth()) - 20) + 'px'
				});
            }
        });

        CKEDITOR._scalarbeta.editor.addCommand( 'insertScalar1', {
            exec: function( editor ) {
            				CKEDITOR._scalarbeta.editor = editor;
							var sel = editor.getSelection();
							var isEdit = false;
							var element = sel.getStartElement();

							//Check to see if we currently have an anchor tag - if so, make sure it's a non-inline media link
							if ( element.data('widget') == null && element.getAscendant( 'a', true ) ) {
								element = element.getAscendant( 'a', true );
								if(element.getAttribute('resource')!=null && !element.hasClass('inline')){
									//Not inline
									isEdit = true;
								}
							}
							if(!isEdit){
				    		if (sel.getRanges()[0].collapsed) {
									alert('Please select text to transform into a media link');
				    			return;
								}else{
									var sel = editor.getSelection();
									element = editor.document.createElement('a');
									element.setHtml(sel.getSelectedText());
									$(element.$).data({
										element : element,
										contentOptionsCallback : CKEDITOR._scalarbeta.mediaLinkCallback,
										selectOptions : {type:'media',changeable:false,multiple:false,msg:'Insert Scalar Media Link',element:element,callback:CKEDITOR._scalarbeta.mediaLinkCallback}
									});
								}
							}
							CKEDITOR._scalarbeta.selectcontent($(element.$).data('selectOptions'));
            }
        });
        CKEDITOR._scalarbeta.editor.addCommand( 'insertScalar2', {
            exec: function( editor ) {
				CKEDITOR._scalarbeta.editor = editor;
        		var sel = editor.getSelection();
						var element = sel.getStartElement();
						var isEdit = false;
						//Check to see if we currently have an anchor tag - if so, make sure it's a non-inline media link
						if ( element.data('widget') == null && element.getAscendant( 'a', true ) ) {
							element = element.getAscendant( 'a', true );
							if(element.getAttribute('resource')!=null && element.hasClass('inline')){
								//Is inline
								isEdit = true;
							}
						}

						if(!isEdit){
							element = editor.document.createElement('a')
							$(element.$).data({
								element : element,
								contentOptionsCallback : CKEDITOR._scalarbeta.inlineMediaCallback,
								selectOptions : {type:'media',changeable:false,multiple:false,msg:'Insert Scalar Media Link',element:element,callback:CKEDITOR._scalarbeta.inlineMediaCallback}
							});
						}

        		CKEDITOR._scalarbeta.selectcontent($(element.$).data('selectOptions'));
					}
        });
        CKEDITOR._scalarbeta.editor.addCommand( 'insertScalar5', {
            exec: function( editor ) {
            	CKEDITOR._scalarbeta.editor = editor;
	    		var sel = editor.getSelection();
	    		if (sel.getRanges()[0].collapsed) {
	    			alert('Please select text to transform into a note link');
	    			return;
	    		}
        		CKEDITOR._scalarbeta.selectcontent({changeable:true,multiple:false,onthefly:true,msg:'Insert Scalar Note',callback:function(node){
        			CKEDITOR._scalarbeta.contentoptions({data:reference_options['insertNote'],callback:function(options) {
	        			var sel = editor.getSelection();
	            		element = editor.document.createElement('span');
	            		element.setHtml(sel.getSelectedText());
	            		element.setAttribute('class', 'note');
	        			element.setAttribute('rev', 'scalar:has_note');
	        			element.setAttribute('resource', node.slug);
            			for (var key in options) {
            				element.setAttribute('data-'+key, options[key]);
            			}
	        			editor.insertElement(element);
        			}});
        		}});
            }
        });
        CKEDITOR._scalarbeta.editor.addCommand( 'insertScalar6', {
            exec: function( editor ) {
            	CKEDITOR._scalarbeta.editor = editor;
	    		var sel = editor.getSelection();
	    		if (sel.getRanges()[0].collapsed) {
	    			alert('Please select text to transform into a link');
	    			return;
	    		}
        		CKEDITOR._scalarbeta.selectcontent({changeable:true,multiple:false,onthefly:true,msg:'Insert link to Scalar content',callback:function(node){
        			CKEDITOR._scalarbeta.contentoptions({data:reference_options['createInternalLink'],callback:function(options) {
	        			var sel = editor.getSelection();
	            		element = editor.document.createElement('a');
	            		element.setHtml(sel.getSelectedText());
	        				element.setAttribute('href', node.slug);
            			for (var key in options) {
            				element.setAttribute('data-'+key, options[key]);
            			}
	        			editor.insertElement(element);
        			}});
        		}});
            }
        });

        CKEDITOR._scalarbeta.editor.addCommand( 'insertScalar7', {  // External link
            exec: function( editor ) {
            	CKEDITOR._scalarbeta.editor = editor;
        		CKEDITOR._scalarbeta.external_link(editor, {});
            }
        });

				//BEGIN WIDGET CODE

				CKEDITOR._scalarbeta.editor.addCommand('insertScalar8',{ //Widget Link
					exec: function(editor){
            			CKEDITOR._scalarbeta.editor = editor;
						var sel = editor.getSelection();
						var isEdit = false;
						var element = sel.getStartElement();

						//Check to see if we currently have an anchor tag - if so, make sure it's a non-inline widget link
						if ( element.data('widget') != null && element.getAscendant( 'a', true ) ) {
							element = element.getAscendant( 'a', true );
							if(element.getAttribute('resource')!=null && !element.hasClass('inline')){
								//Not inline
								isEdit = true;
							}
						}
						if(!isEdit){
							if (sel.getRanges()[0].collapsed) {
								alert('Please select text to transform into a widget link');
								return;
							}else{
								var sel = editor.getSelection();
								element = editor.document.createElement('a');
								element.setHtml(sel.getSelectedText());
								$(element.$).data({
									element : element,
									contentOptionsCallback : CKEDITOR._scalarbeta.widgetLinkCallback,
								  selectOptions : {isEdit:false,type:'widget',msg:'Insert Inline Scalar Widget Link',element:element,callback:CKEDITOR._scalarbeta.widgetLinkCallback,inline:false}
								});
							}
						}
						CKEDITOR._scalarbeta.selectWidget($(element.$).data('selectOptions'));
					}
				});

				CKEDITOR._scalarbeta.editor.addCommand('insertScalar9',{ //Widget Inline Link
					exec: function(editor){
            			CKEDITOR._scalarbeta.editor = editor;

						var sel = editor.getSelection();
						var element = sel.getStartElement();
						var isEdit = false;
						//Check to see if we currently have an anchor tag - if so, make sure it's a non-inline media link
						if ( element.data('widget') != null && element.getAscendant( 'a', true ) ) {
							element = element.getAscendant( 'a', true );
							if(element.getAttribute('resource')!=null && element.hasClass('inline')){
								//Is inline
								isEdit = true;
							}
						}

						if(!isEdit){
							element = editor.document.createElement('a')
							$(element.$).data({
								element : element,
								contentOptionsCallback : CKEDITOR._scalarbeta.widgetInlineCallback,
							  selectOptions : {isEdit:false,type:'widget',msg:'Insert Inline Scalar Widget Link',element:element,callback:CKEDITOR._scalarbeta.widgetInlineCallback,inline:true }
							});
						}

						CKEDITOR._scalarbeta.selectWidget($(element.$).data('selectOptions'));
					}
				});

				//END WIDGET CODE

		CKEDITOR._scalarbeta.editor.ui.addButton( 'ScalarKeyboard', {
			label: 'Display Language Keyboard',
			command: 'insertScalarKeyboard',
			toolbar: 'characters'
		});
        CKEDITOR._scalarbeta.editor.ui.addButton( 'Scalar1', {
            label: 'Insert Scalar Media Link',
            command: 'insertScalar1',
            toolbar: 'links'
        });
        CKEDITOR._scalarbeta.editor.ui.addButton( 'Scalar2', {
            label: 'Insert Inline Scalar Media Link',
            command: 'insertScalar2',
            toolbar: 'links'
        });
        CKEDITOR._scalarbeta.editor.ui.addButton( 'Scalar5', {
            label: 'Insert Scalar Note',
            command: 'insertScalar5',
            toolbar: 'links'
        });
        CKEDITOR._scalarbeta.editor.ui.addButton( 'Scalar6', {
            label: 'Insert Link to another Scalar Page',
            command: 'insertScalar6',
            toolbar: 'links'
        });
        CKEDITOR._scalarbeta.editor.ui.addButton( 'Scalar7', {
            label: 'Insert External Link',
            command: 'insertScalar7',
            toolbar: 'links'
        });
        CKEDITOR._scalarbeta.editor.ui.addButton( 'Scalar8', {
            label: 'Insert Scalar Widget Link',
            command: 'insertScalar8',
            toolbar: 'links'
        });
        CKEDITOR._scalarbeta.editor.ui.addButton( 'Scalar9', {
            label: 'Insert Inline Scalar Widget Link',
            command: 'insertScalar9',
            toolbar: 'links'
        });

        CKEDITOR._scalarbeta.editor.on('beforeGetData', function(e){
        	if(typeof CKEDITOR._scalarbeta.editor.document == 'undefined') return;
        	var placeholders = CKEDITOR._scalarbeta.editor.document.find('img.placeholder');
        	for(var i = 0; i < placeholders.count(); i++){
        		placeholders.getItem(i).remove();
        	}
		});
		CKEDITOR._scalarbeta.editor.on('change', function(e){
    		if(CKEDITOR._scalarbeta.editor.editable().isInline()){
    			$(CKEDITOR._scalarbeta.editor.editable().$).find('.placeholder:not(.inline)').each(function(){
    				$link = $('a[data-linkid='+$(this).data('linkid')+']');
    				if($link.text().length <= 0 || !$link.is(':visible')){
    					$(this).remove();
    				}
    			});
    			return;
    		}
        	if(typeof CKEDITOR._scalarbeta.editor.document == 'undefined') return;
        	var linked_placeholders = CKEDITOR._scalarbeta.editor.document.find('img.linked.placeholder');
        	for(var i = 0; i < linked_placeholders.count(); i++){
        		var placeholder = linked_placeholders.getItem(i);
        		if($(placeholder.$).data('newlink')!==true){
	        		if($(placeholder.$).data('link') == null){
	        			var $link = $(CKEDITOR._scalarbeta.editor.editable().$).find('a[data-index="'+$(placeholder.$).data('content')+'"]');
	        			if($link.is(':visible')){
	        				CKEDITOR._scalarbeta.populatePlaceholderData();
	        				return;
	        			}
	        		}
	        		if(!$($(placeholder.$).data('link').$).is(':visible')){
	        			placeholder.remove();
	        		}
	        	}
        	}
		});
		CKEDITOR._scalarbeta.editor.on( 'contentDom', CKEDITOR._scalarbeta.addPlaceholders);
    }
});
