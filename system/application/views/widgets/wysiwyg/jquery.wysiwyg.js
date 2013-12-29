/*
 * Added by Craig
 */
  
function nl2br (str) {
	var breakTag = '<br>'; 
	str = (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+breakTag+'$2'); 
	str = (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, ''); 
	return str;
}  

function br2nl(str) {
    return str.replace(/<br\s*\/?>/mg,"\n");
};
 
/**
 * WYSIWYG - jQuery plugin 0.6
 *
 * Copyright (c) 2008-2009 Juan M Martinez
 * http://plugins.jquery.com/project/jWYSIWYG
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * $Id: $
 */
(function( $ )
{
    $.fn.document = function()
    {
        var element = this.get(0);

        if ( element.nodeName.toLowerCase() == 'iframe' )
        {
            return element.contentWindow.document;
            /*
            return ( $.browser.msie )
                ? document.frames[element.id].document
                : element.contentWindow.document // contentDocument;
             */
        }
        return this;
    };

    $.fn.documentSelection = function()
    {
        var element = this.get(0);

        if ( element.contentWindow.document.selection )
            return element.contentWindow.document.selection.createRange().text;
        else
            return element.contentWindow.getSelection().toString();
    };

    $.fn.wysiwyg = function( options )
    {
        if ( arguments.length > 0 && arguments[0].constructor == String )
        {
            var action = arguments[0].toString();
            var params = [];

            for ( var i = 1; i < arguments.length; i++ )
                params[i - 1] = arguments[i];

            if ( action in Wysiwyg )
            {
                return this.each(function()
                {
                    $.data(this, 'wysiwyg')
                     .designMode();

                    Wysiwyg[action].apply(this, params);
                });
            }
            else return this;
        }

        var controls = {};

        /**
         * If the user set custom controls, we catch it, and merge with the
         * defaults controls later.
         */
        if ( options && options.controls )
        {
            var controls = options.controls;
            delete options.controls;
        }

        options = $.extend({
            html : '<'+'?xml version="1.0" encoding="UTF-8"?'+'><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">STYLE_SHEET</head><body style="margin: 0px;">INITIAL_CONTENT</body></html>',
            css  : {},

            debug        : false,

            autoSave     : true,  // http://code.google.com/p/jwysiwyg/issues/detail?id=11
            rmUnwantedBr : true,  // http://code.google.com/p/jwysiwyg/issues/detail?id=15
            brIE         : true,

            controls : {},
            messages : {}
        }, options);

        options.messages = $.extend(true, options.messages, Wysiwyg.MSGS_EN);
        options.controls = $.extend(true, options.controls, Wysiwyg.TOOLBAR);

        for ( var control in controls )
        {
            if ( control in options.controls )
                $.extend(options.controls[control], controls[control]);
            else
                options.controls[control] = controls[control];
        }

        // not break the chain
        return this.each(function()
        {
            Wysiwyg(this, options);
        });
    };

    function Wysiwyg( element, options )
    {
        return this instanceof Wysiwyg
            ? this.init(element, options)
            : new Wysiwyg(element, options);
    }

    $.extend(Wysiwyg, {
        insertImage : function( szURL, attributes )
        {
            var self = $.data(this, 'wysiwyg');

            if ( self.constructor == Wysiwyg && szURL && szURL.length > 0 )
            {
                if ($.browser.msie) self.focus();
                if ( attributes )
                {
                    self.editorDoc.execCommand('insertImage', false, '#jwysiwyg#');
                    var img = self.getElementByAttributeValue('img', 'src', '#jwysiwyg#');

                    if ( img )
                    {
                        img.src = szURL;

                        for ( var attribute in attributes )
                        {
                            img.setAttribute(attribute, attributes[attribute]);
                        }
                    }
                }
                else
                {
                    self.editorDoc.execCommand('insertImage', false, szURL);
                }
            }
        },

        createLink : function( szURL )
        {
            var self = $.data(this, 'wysiwyg');

            if ( self.constructor == Wysiwyg && szURL && szURL.length > 0 )
            {
                var selection = $(self.editor).documentSelection();

                if ( selection.length > 0 )
                {
                    if ($.browser.msie) self.focus();
                    self.editorDoc.execCommand('unlink', false, []);
                    self.editorDoc.execCommand('createLink', false, szURL);
                }
                else if ( self.options.messages.nonSelection )
                    alert(self.options.messages.nonSelection);
            }
        },

        insertHtml : function( szHTML )
        {
            var self = $.data(this, 'wysiwyg');

            if ( self.constructor == Wysiwyg && szHTML && szHTML.length > 0 )
            {
                if ($.browser.msie)
                {
                    self.focus();
                    self.editorDoc.execCommand('insertImage', false, '#jwysiwyg#');
                    var img = self.getElementByAttributeValue('img', 'src', '#jwysiwyg#');
                    if (img)
                    {
                        $(img).replaceWith(szHTML);
                    }
                }
                else
                {
                    self.editorDoc.execCommand('insertHTML', false, szHTML);
                }
            }
        },

        setContent : function( newContent )
        {
            var self = $.data(this, 'wysiwyg');
                self.setContent( newContent );
                self.saveContent();
        },

        clear : function()
        {
            var self = $.data(this, 'wysiwyg');
                self.setContent('');
                self.saveContent();
        },

        MSGS_EN : {
            nonSelection : 'Please select the text you wish to transform'
        },

        TOOLBAR : {
            bold          : { visible : true, tags : ['b', 'strong'], css : { fontWeight : 'bold' }, tooltip : "Bold" },
            italic        : { visible : true, tags : ['i', 'em'], css : { fontStyle : 'italic' }, tooltip : "Italic" },
            strikeThrough : { visible : true, tags : ['s', 'strike'], css : { textDecoration : 'line-through' }, tooltip : "Strike-through" },
            underline     : { visible : true, tags : ['u'], css : { textDecoration : 'underline' }, tooltip : "Underline" },

            separator00 : { visible : true, separator : true },

            justifyLeft   : { visible : true, css : { textAlign : 'left' }, tooltip : "Justify Left" },
            justifyCenter : { visible : true, tags : ['center'], css : { textAlign : 'center' }, tooltip : "Justify Center" },
            justifyRight  : { visible : true, css : { textAlign : 'right' }, tooltip : "Justify Right" },
            justifyFull   : { visible : true, css : { textAlign : 'justify' }, tooltip : "Justify Full" },

            separator01 : { visible : true, separator : true },

            indent  : { visible : true, tooltip : "Indent" },
            outdent : { visible : true, tooltip : "Outdent" },

            separator02 : { visible : false, separator : true },

            subscript   : { visible : true, tags : ['sub'], tooltip : "Subscript" },
            superscript : { visible : true, tags : ['sup'], tooltip : "Superscript" },

            separator06 : { separator : true },

            h1mozilla : { visible : true && $.browser.mozilla, className : 'h1', command : 'heading', arguments : ['h1'], tags : ['h1'], tooltip : "Header 1" },
            h2mozilla : { visible : true && $.browser.mozilla, className : 'h2', command : 'heading', arguments : ['h2'], tags : ['h2'], tooltip : "Header 2" },
            h3mozilla : { visible : true && $.browser.mozilla, className : 'h3', command : 'heading', arguments : ['h3'], tags : ['h3'], tooltip : "Header 3" },

            h1 : { visible : true && !( $.browser.mozilla ), className : 'h1', command : 'formatBlock', arguments : ['<H1>'], tags : ['h1'], tooltip : "Header 1" },
            h2 : { visible : true && !( $.browser.mozilla ), className : 'h2', command : 'formatBlock', arguments : ['<H2>'], tags : ['h2'], tooltip : "Header 2" },
            h3 : { visible : true && !( $.browser.mozilla ), className : 'h3', command : 'formatBlock', arguments : ['<H3>'], tags : ['h3'], tooltip : "Header 3" },

            separator04 : { visible : true, separator : true },

            insertOrderedList    : { visible : true, tags : ['ol'], tooltip : "Insert Ordered List" },
            insertUnorderedList  : { visible : true, tags : ['ul'], tooltip : "Insert Unordered List" },
            insertHorizontalRule : { visible : true, tags : ['hr'], tooltip : "Insert Horizontal Rule" },

            separator05 : { separator : true },

            //John added...
            initiateMediaLink : {
            	visible: true,
            	exec: function(){
            		var selection = $(this.editor).documentSelection();
                    if ( selection.length > 0 )
                    {
						var fn = jQuery.proxy(Wysiwyg.TOOLBAR.insertMediaLink.exec, this);
						var _callback = function($list, title, scalar_url, source_url, content_urn, version_urn, annotation_type, annotation_of_scalar_url, annotation_of_source_url, data_fields) {
							// scalar_url -> resource
							// source_url -> href
							if (scalar_url.length==0) return alert('There was a problem resolving the Scalar URL. Please try again.');
							if (source_url.length==0) return alert('There was a problem resolving the resource URL. Please try again.');
							fn(source_url, scalar_url, version_urn, data_fields);
							return true;
						}				
						listeditor_add(null, _callback, 'media', true, true);
						
                    } else if ( this.options.messages.nonSelection )
                        alert(this.options.messages.nonSelection);
                },

                tags : ['a'],
                tooltip : "Add reference to Scalar media file (for display in views which allow media)"
            },
            
            insertMediaLink:{
            	visible: false,
            	exec: function(source_url, scalar_url, version_urn, data_fields){
            		var selection = $(this.editor).documentSelection();
                    if ( selection.length > 0 )
                    {
                    	var theHTML = "<a href='"+source_url+"' resource='"+scalar_url+"' rel='"+version_urn+"'"
                    	for (var field in data_fields) {
                    		theHTML += " data-"+field+"='"+data_fields[field]+"'"
                    	}
                    	theHTML += ">"+selection+"</a>";

                        if ($.browser.msie)
                        {
                            this.focus();
                            this.editorDoc.execCommand('insertImage', false, '#jwysiwyg#');
                            var img = this.getElementByAttributeValue('img', 'src', '#jwysiwyg#');
                            if (img)
                            {
                                $(img).replaceWith(theHTML);
                            }
                        }
                        else
                        {
                        	this.editorDoc.execCommand('insertHTML', false, theHTML);
                        }
                    }
                    else if ( this.options.messages.nonSelection )
                        alert(this.options.messages.nonSelection);
                },

                tags : ['a'],
                tooltip : "Add reference to Scalar media file (for display in views which allow media)"
            },
             
            initiateMediaelement : {
            	visible: true,
            	exec: function(){

						var fn = jQuery.proxy(Wysiwyg.TOOLBAR.insertMediaelement.exec, this);						
						var _callback = function($list, title, scalar_url, source_url, content_urn, version_urn, annotation_type, annotation_of_scalar_url, annotation_of_source_url) {
							// scalar_url -> resource
							// source_url -> href
							if (scalar_url.length==0) return alert('There was a problem resolving the Scalar URL. Please try again.');
							if (source_url.length==0) return alert('There was a problem resolving the resource URL. Please try again.');
							fn(source_url, scalar_url, version_urn);
							return true;
						}					
						listeditor_add(null, _callback, 'media', true, true);					
                    	
                },

                tags : ['a'],
                tooltip : "Add inline Scalar media file (for display directly within the text)"
            },   

            insertMediaelement : {
                visible : false,
                exec    : function(source_url, scalar_url, version_urn)
                {
                    	var theHTML = "<a class='inline' href='"+source_url+"' resource='"+scalar_url+"' rel='"+version_urn+"'></a>";
                           
                        this.focus();
                        this.editorDoc.execCommand('insertImage', false, '#jwysiwyg#');
                        var img = this.getElementByAttributeValue('img', 'src', '#jwysiwyg#');
                        if (img) {
                           $(img).replaceWith(theHTML);
                        }      
                },

                tags : ['img'],
                tooltip : "Add inline Scalar media file (for display directly within the text)"
            },                       
           
            //Craig added...
            initiateAnnotation : {
            	visible: true,
            	exec: function(){
            		var selection = $(this.editor).documentSelection();
                    if ( selection.length > 0 )
                    {
						var fn = jQuery.proxy(Wysiwyg.TOOLBAR.insertAnnotation.exec, this);
						var _callback = function($list, title, scalar_url, source_url, content_urn, version_urn, annotation_type, annotation_of_scalar_url, annotation_of_source_url, data_fields) {
							// scalar_url -> the annotation (after #)
							// annotation_of_scalar_url -> the media page url (resource="")
							// annotation_of_source_url -> the media file url (before #)
							if (scalar_url.length==0) return alert('There was a problem resolving the Scalar URL. Please try again.');
							if (annotation_of_scalar_url.length==0) return alert('There was a problem resolving the resource URL. Please try again.');
							if (annotation_of_source_url.length==0) return alert('There was a problem resolving the annotation type. Please try again.');
							fn(scalar_url, annotation_of_scalar_url, annotation_of_source_url, version_urn, data_fields);
							return true;
						}					
						listeditor_add(null, _callback, 'annotation', true, true);					
                  	
                    } else if ( this.options.messages.nonSelection )
                        alert(this.options.messages.nonSelection);
                },

                tags : ['span'],
                tooltip : "Add reference to Scalar media annotation (media will be cued to the annotation in views that allow media)"
            },
            
            insertAnnotation:{
            	visible: false,
            	exec: function(scalar_url, annotation_of_scalar_url, annotation_of_source_url, version_urn, data_fields){
            		var selection = $(this.editor).documentSelection();
                    if ( selection.length > 0 )
                    {
                    	var theHTML = "<a href='"+annotation_of_source_url+"#"+scalar_url+"' resource='"+annotation_of_scalar_url+"' rel='"+version_urn+"'";
                    	for (var field in data_fields) {
                    		theHTML += " data-"+field+"='"+data_fields[field]+"'"
                    	}
                    	theHTML += ">"+selection+"</a>";
                    	
                        if ($.browser.msie)
                        {
                            this.focus();
                            this.editorDoc.execCommand('insertImage', false, '#jwysiwyg#');
                            var img = this.getElementByAttributeValue('img', 'src', '#jwysiwyg#');
                            if (img)
                            {
                                $(img).replaceWith(theHTML);
                            }
                        }
                        else
                        {
                        	this.editorDoc.execCommand('insertHTML', false, theHTML);
                        }
                    }
                    else if ( this.options.messages.nonSelection )
                        alert(this.options.messages.nonSelection);
                },

                tags : ['span'],
                tooltip : "Add reference to Scalar media annotation (media will be cued to the annotation in views that allow media)"
            },             
          
            //Craig added...
            initiateInlineAnnotation : {
            	visible: true,
            	exec: function(){

						var fn = jQuery.proxy(Wysiwyg.TOOLBAR.insertInlineAnnotation.exec, this);

						var _callback = function($list, title, scalar_url, source_url, content_urn, version_urn, annotation_type, annotation_of_scalar_url, annotation_of_source_url) {
							// scalar_url -> the annotation (after #)
							// annotation_of_scalar_url -> the media page url (resource="")
							// annotation_of_source_url -> the media file url (before #)
							if (scalar_url.length==0) return alert('There was a problem resolving the Scalar URL. Please try again.');
							if (annotation_of_scalar_url.length==0) return alert('There was a problem resolving the resource URL. Please try again.');
							if (annotation_of_source_url.length==0) return alert('There was a problem resolving the annotation type. Please try again.');
							fn(scalar_url, annotation_of_scalar_url, annotation_of_source_url, version_urn);
							return true;
						}					
						listeditor_add(null, _callback, 'annotation', true, true);					
                  	
                },

                tags : ['span'],
                tooltip : "Add inline Scalar annotation (media will be displayed inline [e.g., not in sidebar] and will be cued to the annotation)"
            },
            
            insertInlineAnnotation:{
            	visible: false,
            	exec: function(scalar_url, annotation_of_scalar_url, annotation_of_source_url, version_urn){

                    	var theHTML = "<a class='inline' href='"+annotation_of_source_url+"#"+scalar_url+"' resource='"+annotation_of_scalar_url+"' rel='"+version_urn+"'></a>";
                    	
                        this.focus();
                        if (!strip_tags(this.editorDoc.body.innerHTML).length) this.editorDoc.body.innerHTML = '[EDITOR_INSERT_PADDING]';
                        this.editorDoc.execCommand('insertImage', false, '#jwysiwyg#');
                        var img = this.getElementByAttributeValue('img', 'src', '#jwysiwyg#');
                        if (img) {
                           $(img).replaceWith(theHTML);
                        }    
                        this.editorDoc.body.innerHTML = this.editorDoc.body.innerHTML.replace('[EDITOR_INSERT_PADDING]', '');

                },

                tags : ['span'],
                tooltip : "Add inline Scalar annotation (media will be displayed inline [e.g., not in sidebar] and will be cued to the annotation)"
            },               
             
            //John added...
            initiateNote : {
            	visible: true,
            	exec: function(){
            		var selection = $(this.editor).documentSelection();
                    if ( selection.length > 0 )
                    {
						var fn = jQuery.proxy(Wysiwyg.TOOLBAR.insertNote.exec, this);
						var _callback = function($list, title, scalar_url, source_url, content_urn, version_urn, annotation_type, annotation_of_scalar_url, annotation_of_source_url) {
							if (scalar_url.length==0) return alert('There was a problem resolving the Scalar URL. Please try again.');
							fn(source_url, scalar_url, version_urn);
							return true;
						}					
						listeditor_add(null, _callback, null, false, true);		
                    	
                    } else if ( this.options.messages.nonSelection )
                        alert(this.options.messages.nonSelection);
                },

                tags : ['span'],
                tooltip : "Add a note (specially-colored link to another Scalar page)"
            },
            
            insertNote:{
            	visible: false,
            	exec: function(source_url, scalar_url, version_urn){
            		var selection = $(this.editor).documentSelection();
                    if ( selection.length > 0 )
                    {
                    	var theHTML = "<span class='note' rev='scalar:has_note' resource='"+scalar_url+"' rel='"+version_urn+"'>"+selection+"</span>";
                        if (1) {   // Always route to this approach; Chrome seems to have a problem with the insert if its at the end of a paragraph
                            this.focus();
                            this.editorDoc.execCommand('insertImage', false, '#jwysiwyg#');
                            var img = this.getElementByAttributeValue('img', 'src', '#jwysiwyg#');
                            if (img)
                            {
                                $(img).replaceWith(theHTML);
                            }
                        }
                        else
                        {
                        	this.editorDoc.execCommand('insertHTML', false, theHTML);
                        }
                    }
                    else if ( this.options.messages.nonSelection )
                        alert(this.options.messages.nonSelection);
                },

                tags : ['span'],
                tooltip : "Add a note (specially-colored link to another Scalar page)"
            },       
                       
            initiateInternalLink : {
            	visible: true,
            	exec: function(){
            		var selection = $(this.editor).documentSelection();
                    if ( selection.length > 0 )
                    {
						var fn = jQuery.proxy(Wysiwyg.TOOLBAR.createInternalLink.exec, this);
						var _callback = function($list, title, scalar_url, source_url, content_urn, version_urn, annotation_type, annotation_of_scalar_url, annotation_of_source_url, data_fields) {
							if (scalar_url.length==0) return alert('There was a problem resolving the Scalar URL. Please try again.');
							fn(source_url, scalar_url, version_urn, data_fields);
							return true;
						}					
						listeditor_add(null, _callback, null, false, true);											
                    	
                    } else if ( this.options.messages.nonSelection )
                        alert(this.options.messages.nonSelection);
                },

                tags : ['a'],
                tooltip : "Add a link to a Scalar page or media file (link only; media will not be displayed)"
            },            
            
            createInternalLink : {
                visible : false,
                exec    : function(source_url, scalar_url, version_urn, data_fields)
                {
                    var selection = $(this.editor).documentSelection();

                    if ( selection.length > 0 )
                    {
                    
                    	var theHTML = "<a href='"+scalar_url+"' rel='"+version_urn+"'";
                    	for (var field in data_fields) {
                    		theHTML += " data-"+field+"='"+data_fields[field]+"'"
                    	}                    	
                    	theHTML += ">"+selection+"</a>";
                    	
                        if ($.browser.msie)
                        {
                            this.focus();
                            this.editorDoc.execCommand('insertImage', false, '#jwysiwyg#');
                            var img = this.getElementByAttributeValue('img', 'src', '#jwysiwyg#');
                            if (img)
                            {
                                $(img).replaceWith(theHTML);
                            }
                        }
                        else
                        {
                        	this.editorDoc.execCommand('insertHTML', false, theHTML);
                        }                    
                   
                    }
                    else if ( this.options.messages.nonSelection )
                        alert(this.options.messages.nonSelection);
                },

                tags : ['a'],
                tooltip : "Add a link to a Scalar page or media file (link only; media will not be displayed)"
            },    
            
            createLink : {
                visible : true,
                exec    : function()
                {
                    var selection = $(this.editor).documentSelection();

                    if ( selection.length > 0 )
                    {
                        if ( $.browser.msie )
                        {
                            this.focus();
                            this.editorDoc.execCommand('createLink', true, null);
                        }
                        else
                        {
                            var szURL = prompt('URL', 'http://');

                            if ( szURL && szURL.length > 0 )
                            {
                                this.editorDoc.execCommand('unlink', false, []);
                                this.editorDoc.execCommand('createLink', false, szURL);
                            }
                        }
                    }
                    else if ( this.options.messages.nonSelection )
                        alert(this.options.messages.nonSelection);
                },

                tags : ['a'],
                tooltip : "Insert external link"
            },      
          
            // Note, this feature is discouraged because presentlationly it doesn't take advantage of Scalar's text-media relationships
            /*
            initiateInsertImage : {
            	visible: true,
            	exec: function(){

						var fn = jQuery.proxy(Wysiwyg.TOOLBAR.insertImage.exec, this);
						//fn(szURI);
						
						var _callback = function($list, title, scalar_url, source_url, content_urn, version_urn, annotation_type, annotation_of_scalar_url, annotation_of_source_url) {
							if (scalar_url.length==0) return alert('There was a problem resolving the Scalar URL. Please try again.');
							if (source_url.length==0) return alert('There was a problem resolving the resource URL. Please try again.');
							// Create select-orientation box
							$('#alignment_popup').remove();
							var $div = $('<div id="alignment_popup"></div>');
							$div.html('<b>Please choose alignment</b> for the image "'+title+'"<br /><br /><br />');
							$div.append('<input type="radio" name="image_align" id="image_align_none" value="" checked /> <label for="image_align_none">No alignment</label>&nbsp; &nbsp; ');
							$div.append('<input type="radio" name="image_align" id="image_align_left" value="inlineMediaLeft" /> <label for="image_align_left">Left alignment</label>&nbsp; &nbsp; ');
							$div.append('<input type="radio" name="image_align" id="image_align_center" value="inlineMediaCenter" /> <label for="image_align_center">Center alignment</label>&nbsp; &nbsp; ');
							$div.append('<input type="radio" name="image_align" id="image_align_right" value="inlineMediaRight" /> <label for="image_align_right">Right alignment</label>&nbsp; &nbsp; ');
							$div.append('<br /><br /><br />');
							$div.append('<b>Width in pixels</b> (leave blank to maintain the image\'s default width):&nbsp; &nbsp;<input type="text" name="image_width" value="" style="width:50px;" />');
							$div.append('<br /><br /><br />');
							$div.append('<input type="button" value="Save and insert image" class="generic_button" />');
							$('body').append($div);		
							$div.css('left', ($(window).width()/2) - ($div.width()/2) );
							$div.css('top', ($(window).height()/2) - ($div.height()/2) );
							$div.find("input[type='button']").click(function() {
								var class_name = $div.find('input[name=image_align]:checked').val();
								var width = $div.find('input[name=image_width]').val();
								$div.remove();
								fn(source_url, scalar_url, class_name, width);
							});
							return true;					

						}					
						
						listeditor_add(null, _callback, 'image',  true, true);					
                    	
                },

                tags : ['a'],
                tooltip : "Insert inline Scalar image (for display directly within text and with no Scalar media wrapper)"
            },   

            insertImage : {
                visible : false,
                exec    : function(source_url, scalar_url, class_name, width)
                {
                		if ('undefined'==typeof(width)) width = '';
                    	var theHTML = "<a href='"+scalar_url+"'><img class='"+class_name+"' src='"+source_url+"' width='"+width+"' /></a>";
                        if ($.browser.msie)
                        {
                            this.focus();
                            this.editorDoc.execCommand('insertImage', false, '#jwysiwyg#');
                            var img = this.getElementByAttributeValue('img', 'src', '#jwysiwyg#');
                            if (img)
                            {
                                $(img).replaceWith(theHTML);
                            }
                        }
                        else
                        {
                        	this.editorDoc.execCommand('insertHTML', false, theHTML);
                        }     
                },

                tags : ['img'],
                tooltip : "Insert inline Scalar image (for display directly within text and with no Scalar media wrapper)"
            },   
            */                
            
			separator07 : { visible : true, separator : true },

            initiateCode : {
            	visible: true,
            	exec: function() {
   
						var fn = jQuery.proxy(Wysiwyg.TOOLBAR.insertCode.exec, this);
						//fn(szURI);
						$('.editor_generic_popup').remove();
						var $div = $('<div class="editor_generic_popup"></div>'); // global
						$('body').append($div);
						$div.css('left', (parseInt($(window).width()/2)-$div.outerWidth()/2)+'px' );					
						$div.css('top', (parseInt($(window).height()/2)-$div.outerHeight()/2 + parseInt($(window).scrollTop()) )+'px' );
						$div.append('Add your code snippet below (indentation will be preserved)');
						$div.append('<textarea style="width:100%;height:200px;margin-bottom:6px;" name="code_snippet"></textarea>');
						$div.append('<input type="button" value="Insert" style="border:solid 1px #aaaaaa;" /><span style="float:right;"><a href="javascript:;" onclick="$(\'.editor_generic_popup\').remove();">cancel</a></span>');
						$div.find('input:first').click( function(url) {
							var theHTML = $div.find('textarea:first').val();
							if (theHTML.length==0) return alert('Please enter a code snippet');
							theHTML = '<pre><code>'+theHTML+'</code></pre>';
							fn(theHTML);
							$div.remove();
						});
                },

                tags : ['a'],
                tooltip : "Insert a software code snippet"
            },			
			
            insertCode:{
            	visible: false,
            	exec: function(theHTML){
                        if ($.browser.msie)
                        {
                            this.focus();
                            this.editorDoc.execCommand('insertImage', false, '#jwysiwyg#');
                            var img = this.getElementByAttributeValue('img', 'src', '#jwysiwyg#');
                            if (img)
                            {
                                $(img).replaceWith(theHTML);
                            }
                        }
                        else
                        {
                        	this.editorDoc.execCommand('insertHTML', false, theHTML);
                        }
                        this.saveContent();
                },

                tags : ['a'],
                tooltip : "Insert a software code snippet"
            },

            cut   : { visible : false, tooltip : "Cut" },
            copy  : { visible : false, tooltip : "Copy" },
            paste : { visible : false, tooltip : "Paste" },

            separator08 : { separator : false && !( $.browser.msie ) },

            increaseFontSize : { visible : false && !( $.browser.msie ), tags : ['big'], tooltip : "Increase font size" },
            decreaseFontSize : { visible : false && !( $.browser.msie ), tags : ['small'], tooltip : "Decrease font size" },

            undo : { visible : true, tooltip : "Undo" },
            redo : { visible : true, tooltip : "Redo" },

            removeFormat : {
                visible : true,
                exec    : function()
                {
                    if ($.browser.msie) this.focus();
                    this.editorDoc.execCommand('removeFormat', false, []);
                    this.editorDoc.execCommand('unlink', false, []);
                },
                tooltip : "Remove formatting"
            },
            
            separator09 : { separator : true },

			/**
			 * Changed by Craig Dietrich (html func)
			 */

            html : {
                visible : true,
                exec    : function()
                {
                    if ( this.viewHTML )
                    {
                        this.setContent( $(this.original).val() );
                        $(this.original).hide();
                        $(this.element).show();
                        $(this.element).find('iframe:first').show();
                        $(this.element).find('iframe:first').contents().find('html').show();
                    }
                    else
                    {
                        this.saveContent();
                        $(this.element).hide();
                        $(this.element).find('iframe:first').hide();
                        $(this.element).find('iframe:first').contents().find('html').hide();
                        $(this.original).show();
                    }

                    this.viewHTML = !( this.viewHTML );
                },
                tooltip : "View source code"
            }
                        
        }
    });

    $.extend(Wysiwyg.prototype,
    {
        original : null,
        options  : {},

        element  : null,
        editor   : null,

        focus : function()
        {
            $(this.editorDoc.body).focus();
        },

        init : function( element, options )
        {
            var self = this;

            this.editor = element;
            this.options = options || {};

            $.data(element, 'wysiwyg', this);

            var newX = element.width || element.clientWidth;
            var newY = element.height || element.clientHeight;

            if ( element.nodeName.toLowerCase() == 'textarea' )
            {
                this.original = element;

                if ( newX == 0 && element.cols )
                    newX = ( element.cols * 8 ) + 21;

                if ( newY == 0 && element.rows )
                    newY = ( element.rows * 16 ) + 16;

                var editor = this.editor = $('<iframe src="javascript:false;"></iframe>').css({
                    minHeight : ( newY - 6 ).toString() + 'px',
                    
                    /**
                     * Changed by Craig Dietrich 
                     */
                    
                    //width     : ( newX - 8 ).toString() + 'px'
                    width     : '100%'
                    
                }).attr('id', $(element).attr('id') + 'IFrame')
                .attr('frameborder', '0');

                /**
                 * http://code.google.com/p/jwysiwyg/issues/detail?id=96
                 */
                this.editor.attr('tabindex', $(element).attr('tabindex'));

                if ( $.browser.msie )
                {
                    this.editor
                        .css('height', ( newY ).toString() + 'px');

                    /**
                    var editor = $('<span></span>').css({
                        width     : ( newX - 6 ).toString() + 'px',
                        height    : ( newY - 8 ).toString() + 'px'
                    }).attr('id', $(element).attr('id') + 'IFrame');

                    editor.outerHTML = this.editor.outerHTML;
                     */
                }
            }

            var panel = this.panel = $('<ul role="menu" class="panel"></ul>');

            this.appendControls();
            this.element = $('<div></div>').css({
            	
            	/**
            	 * Changed by Craig Dietrich
            	 */
            
                //width : ( newX > 0 ) ? ( newX ).toString() + 'px' : '100%'
                
            }).addClass('wysiwyg')
                .append(panel)
                .append( $('<div><!-- --></div>').css({ clear : 'both' }) )
                .append(editor)
		;

            $(element)
                .hide()
                .before(this.element)
		;

            this.viewHTML = false;
            this.initialHeight = newY - 8;

            /**
             * @link http://code.google.com/p/jwysiwyg/issues/detail?id=52
             */
            this.initialContent = $(element).val();
            this.initFrame();

            if ( this.initialContent.length == 0 )
                this.setContent('');

            /**
             * http://code.google.com/p/jwysiwyg/issues/detail?id=100
             */
            var form = $(element).closest('form');

            if ( this.options.autoSave )
	    {
	    		// CRAIG TODO: change this so it doesn't lost the value of non-wysiwyg
	    		// Figure out if we are in text mode, and then don't do the save
	    		
                form.submit(function() {
                	if (self.viewHTML) return; // editor is in html mode (not WYSIWYG), therefor changes are live to the textarea
                	self.saveContent(); 
                });
	    }

            form.bind('reset', function()
            {
                self.setContent( self.initialContent );
                self.saveContent();
            });
        },

        initFrame : function()
        {
            var self = this;
            var style = '';

            /**
             * @link http://code.google.com/p/jwysiwyg/issues/detail?id=14
             */
            if ( this.options.css && this.options.css.constructor == String )
	    {
                style = '<link rel="stylesheet" type="text/css" media="screen" href="' + this.options.css + '" />';
	    }

            this.editorDoc = $(this.editor).document();
            this.editorDoc_designMode = false;

            try {
                this.editorDoc.designMode = 'on';
                this.editorDoc_designMode = true;
            } catch ( e ) {
                // Will fail on Gecko if the editor is placed in an hidden container element
                // The design mode will be set ones the editor is focused

                $(this.editorDoc).focus(function()
                {
                    self.designMode();
                });
            }

            this.editorDoc.open();
            this.editorDoc.write(
                this.options.html
                    /**
                     * @link http://code.google.com/p/jwysiwyg/issues/detail?id=144
                     */
                    .replace(/INITIAL_CONTENT/, function() { return self.initialContent; })
                    .replace(/STYLE_SHEET/, function() { return style; })
            );
            this.editorDoc.close();

            this.editorDoc.contentEditable = 'true';

            if ( $.browser.msie )
            {
                /**
                 * Remove the horrible border it has on IE.
                 */
                setTimeout(function() { $(self.editorDoc.body).css('border', 'none'); }, 0);
            }

            $(this.editorDoc).click(function( event )
            {
                self.checkTargets( event.target ? event.target : event.srcElement);
            });

            /**
             * @link http://code.google.com/p/jwysiwyg/issues/detail?id=20
             */
            $(this.original).focus(function()
            {
                if (!$.browser.msie)
                {
                    self.focus();
                }
            });

            if ( this.options.autoSave )
            {
                /**
                 * @link http://code.google.com/p/jwysiwyg/issues/detail?id=11
                 */
                $(this.editorDoc).keydown(function() { self.saveContent(); })
                                 .keyup(function() { self.saveContent(); })
                                 .mousedown(function() { self.saveContent(); });
            }

            if ( this.options.css )
            {
                setTimeout(function()
                {
                    if ( self.options.css.constructor == String )
                    {
                        /**
                         * $(self.editorDoc)
                         * .find('head')
                         * .append(
                         *     $('<link rel="stylesheet" type="text/css" media="screen" />')
                         *     .attr('href', self.options.css)
                         * );
                         */
                    } else {
                        $(self.editorDoc).find('body').css(self.options.css);
                    }
                }, 0);
            }

            $(this.editorDoc).keydown(function( event )
            {
                if ( $.browser.msie && self.options.brIE && event.keyCode == 13 )
                {
                    var rng = self.getRange();
                    rng.pasteHTML('<br />');
                    rng.collapse(false);
                    rng.select();
                    return false;
                }
                return true;
            });
        },

        designMode : function()
        {
            if ( !( this.editorDoc_designMode ) )
            {
                try {
                    this.editorDoc.designMode = 'on';
                    this.editorDoc_designMode = true;
                } catch ( e ) {}
            }
        },

        getSelection : function()
        {
            return ( window.getSelection ) ? window.getSelection() : document.selection;
        },

        getRange : function()
        {
            var selection = this.getSelection();

            if ( !( selection ) )
                return null;

            return ( selection.rangeCount > 0 ) ? selection.getRangeAt(0) : selection.createRange();
        },

        getContent : function()
        {
            return $( $(this.editor).document() ).find('body').html();
        },

        setContent : function( newContent )
        {
        	newContent = nl2br(newContent); // Added by Craig
            $( $(this.editor).document() ).find('body').html(newContent);
        },

        saveContent : function()
        {
            if ( this.original ) {
                var content = this.getContent();
                if ( this.options.rmUnwantedBr ) {
                    content = ( content.substr(-4) == '<br>' ) ? content.substr(0, content.length - 4) : content;
				}
				/**
				 * Added by Craig 
				 */
				content = br2nl(content);
                $(this.original).val(content);
            }
        },

        withoutCss: function()
        {
            if ($.browser.mozilla)
            {
                try
                {
                    this.editorDoc.execCommand('styleWithCSS', false, false);
                }
                catch (e)
                {
                    try
                    {
                        this.editorDoc.execCommand('useCSS', false, true);
                    }
                    catch (e)
                    {
                    }
                }
            }
        },

        appendMenu : function( cmd, args, className, fn, tooltip )
        {
            var self = this;
            args = args || [];

            $('<li></li>').append(
                $('<a role="menuitem" tabindex="-1" href="javascript:;">' + (className || cmd) + '</a>')
                    .addClass(className || cmd)
                    .attr('title', tooltip)
            ).click(function() {
                if ( fn ) fn.apply(self); else
                {
                    self.withoutCss();
                    self.editorDoc.execCommand(cmd, false, args);
                }
                if ( self.options.autoSave ) self.saveContent();
            }).appendTo( this.panel );
            
            /**
             * Added by Craig Dietrich
             */
             
            if ('html'==cmd) { 
            	$('.to_html_handle').click(function() {
            		if ( self.viewHTML ) return;
	                if ( fn ) fn.apply(self); else
	                {
	                    self.withoutCss();
	                    self.editorDoc.execCommand(cmd, false, args);
	                }
	                if ( self.options.autoSave ) self.saveContent();
	                $('.to_html_handle, .to_wysiwyg_handle').removeClass('wysiwyg_handle_selected');
	                $(this).addClass('wysiwyg_handle_selected');
            	});
            	$('.to_wysiwyg_handle').click(function() {
            		if ( !self.viewHTML ) return;
	                if ( fn ) fn.apply(self); else
	                {
	                    self.withoutCss();
	                    self.editorDoc.execCommand(cmd, false, args);
	                }
	                if ( self.options.autoSave ) self.saveContent();
	                $('.to_html_handle, .to_wysiwyg_handle').removeClass('wysiwyg_handle_selected');
	                $(this).addClass('wysiwyg_handle_selected');
            	});            	
            }
                         
        },

        appendMenuSeparator : function()
        {
            $('<li role="separator" class="separator"></li>').appendTo( this.panel );
        },

        appendControls : function()
        {
            for ( var name in this.options.controls )
            {
                var control = this.options.controls[name];

                if ( control.separator )
                {
                    if ( control.visible !== false )
                        this.appendMenuSeparator();
                }
                else if ( control.visible )
                {
                    this.appendMenu(
                        control.command || name, control.arguments || [],
                        control.className || control.command || name || 'empty', control.exec,
                        control.tooltip || control.command || name || ''
                    );
                }
            }
        },

        checkTargets : function( element )
        {
            for ( var name in this.options.controls )
            {
                var control = this.options.controls[name];
                var className = control.className || control.command || name || 'empty';

                $('.' + className, this.panel).removeClass('active');

                if ( control.tags )
                {
                    var elm = element;

                    do {
                        if ( elm.nodeType != 1 )
                            break;

                        if ( $.inArray(elm.tagName.toLowerCase(), control.tags) != -1 )
                            $('.' + className, this.panel).addClass('active');
                    } while ((elm = elm.parentNode));
                }

                if ( control.css )
                {
                    var elm = $(element);

                    do {
                        if ( elm[0].nodeType != 1 )
                            break;

                        for ( var cssProperty in control.css )
                            if ( elm.css(cssProperty).toString().toLowerCase() == control.css[cssProperty] )
                                $('.' + className, this.panel).addClass('active');
                    } while ((elm = elm.parent()));
                }
            }
        },

        getElementByAttributeValue : function( tagName, attributeName, attributeValue )
        {
            var elements = this.editorDoc.getElementsByTagName(tagName);

            for ( var i = 0; i < elements.length; i++ )
            {
                var value = elements[i].getAttribute(attributeName);

                if ( $.browser.msie )
                {
                    /** IE add full path, so I check by the last chars. */
                    value = value.substr(value.length - attributeValue.length);
                }

                if ( value == attributeValue )
                    return elements[i];
            }

            return false;
        }
    });
})(jQuery);
