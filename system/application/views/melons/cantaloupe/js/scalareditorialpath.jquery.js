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

(function($){
    $.scalarEditorialPath = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        base.nodeList = {};

        base.nodeTypes = ['page', 'media'];

        base.$nodeList = $('<div>');

        base.numPages = {};

        base.loadedPages = {};
        
        base.currentLoadType = 0;

        base.node_states = { 
        						'draft' : 'Draft',
	        					'edit'  : 'Edit',
	        					'edit_review' : 'Edit Review',
	        					'clean' : 'Clean',
	        					'ready' : 'Ready',
	        					//'published' : 'Published'
        				   };

        base.stage = 0;
        base.currentChunk = 0;
        
        // Add a reverse reference to the DOM object
        base.$el.data("scalarEditorialPath", base);
        
        base.init = function(){
            base.options = $.extend({},$.scalarEditorialPath.defaultOptions, options);
            if(base.options.contents == null){
            	console.error('Editorial path container not set!');
            }else if(base.options.outline == null){
            	console.error('Editorial path outline container not set!');
            }else{
            	base.setup();
            }
        };

        base.setup = function(data){
        	switch(base.stage){
        		case 0:
        			//Do a little bit of preliminary setup...
                    $('#editorialSidePanel .dropdown .dropdown-menu a').click(function(e){
                        e.preventDefault();
                        $('#editorialSidePanel .dropdown #panelDropdownText').text($(this).text());
                        $($(this).attr('href')).addClass('in').siblings('.collapse').removeClass('in');
                        $('.bookname').text($('meta[property="og:site_name"]').attr('content'));
                        base.resize();
                    });

                    $('body').on('headerSizeChanged',function(){
                        var offset = $(this).hasClass('shortHeader')?19:59;
                        if(typeof $('body').data('bs.scrollspy') != 'undefined'){
                                $('body').data('bs.scrollspy').options.offset = offset;
                        }
                        $('body').scrollspy('refresh');
                    });

        			base.node_state_classes = [];
        			for(var stateClass in base.node_states){
        				base.node_state_classes.push(stateClass);
        			}
					base.node_state_string = base.node_state_classes.join(' ');
					$(window).on('resize',base.resize);

        			//Add the loader text for the content
		        	base.$contentLoader = $('<div class="loader text-muted well text-center"><strong>Loading book content... Please wait, this might take a little while.</strong><br /><small class="info"></small></span>').appendTo(base.options.contents);
		        	base.$contentLoaderInfo = base.$contentLoader.find('.info');

		        	base.$contentLoaderInfo.fadeOut('fast',function(){$(this).text('Determining book size...').fadeIn('fast')});

		        	var loadedTypes = 0;
                    var nodeLoadDeferred = $.Deferred();

                    nodeLoadDeferred.done(function(){
                        base.stage = 1;
                        base.setup();
                    });

                    for(var type in base.nodeTypes){
                        (function(base, type){
    			        	scalarapi.loadNodesByType(
    							type, true, function(data){
                                    base.nodeList[type] = data;       
                                    if(++loadedTypes == base.nodeTypes.length){
                                        nodeLoadDeferred.resolve();
                                    }
                                },
    							null, 0, false, null, 0, 1
    						);
                        })(base, base.nodeTypes[type]);
                    }

        			break;
        		case 1:
                    base.numPages['total'] = 0;
                    for(var type in base.nodeList){
                        if(typeof base.numPages[type] === 'undefined'){
                            var data = base.nodeList[type];
    	        			for(var uri in data){
        	        			var regex = /(?:\.)(\d+)\b/;
        	        			var matches = null;
        	        			if((matches = regex.exec(uri)) !== null){
        	        				//We have a version node... Just lop off that version number so we can get the citation property
        							uri = uri.slice(0, uri.lastIndexOf('.'));
        	        			}
        	        			var node = scalarapi.getNode( uri );
                                if(typeof node == 'undefined'){
                                    continue;
                                }
        						var citationProp = node.properties['http://scalar.usc.edu/2012/01/scalar-ns#citation'][0].value;
                                console.log(node.properties);
        						regex = /(?:.*methodNumNodes=(\d+))/;
        						matches = null;
        						if((matches = regex.exec(citationProp)) === null){
        							continue;
        						}else{
        							base.numPages[type] = parseInt(matches[1]);
                                    base.numPages['total'] += base.numPages[type];
                                    break;
        						}
                            }
                        }
                    }
					base.stage = 2;
	        		base.$contentLoaderInfo.fadeOut('fast',function(){$(this).text('Loading '+base.nodeTypes[base.currentLoadType]+' nodes - 0%').fadeIn('fast')});

                    scalarapi.loadNodesByType(
                        base.nodeTypes[base.currentLoadType], true, base.setup,
                        null, 0, false, null, (base.currentChunk++)*base.options.pagesPerChunk, base.options.pagesPerChunk
                    );

        			break;
        		case 2:
        			//Parse the data!
                    for(var uri in data){
                        var node = scalarapi.getNode( uri );
                        var regex = /(?:\.)(\d+)\b/;
                        var matches = null;
                        if((matches = regex.exec(uri)) === null){ //A lot of these filters won't need to be in place once actual editorial path functionality is in place
                            if(uri.lastIndexOf('http', 0) === 0){
                                //We don't have a version node! Load the node.
                                var node = scalarapi.getNode( uri );
                                base.addNode(node);
                            }
                        }
                    }

                    //Escape if we have loaded everything!
        			if(base.currentChunk*base.options.pagesPerChunk > base.numPages[base.nodeTypes[base.currentLoadType]]){
                        if(++base.currentLoadType >= base.nodeTypes.length){
                            base.$contentLoaderInfo.text('Loading '+base.nodeTypes[base.currentLoadType-1]+' nodes - 100%');
                            base.stage = 3;
                            base.setup();
                            return;
                        }else{
                            base.currentChunk = 0;
                            base.$contentLoaderInfo.text('Loading '+base.nodeTypes[base.currentLoadType]+' nodes - 0%');
                        }
                    }else{
                        base.$contentLoaderInfo.text('Loading '+base.nodeTypes[base.currentLoadType]+' nodes - '+Math.round((base.currentChunk*base.options.pagesPerChunk)/base.numPages[base.nodeTypes[base.currentLoadType]])*100+'%');
                    }
                    
                    scalarapi.loadNodesByType(
                        base.nodeTypes[base.currentLoadType], true, base.setup,
                        null, 0, false, null, (base.currentChunk++)*base.options.pagesPerChunk, base.options.pagesPerChunk
                    );

        			break;
        		case 3:

                    $('#editorialSidePanel>div').affix({
                      offset: {
                        top: 50
                      }
                    });

                    base.resize();

        			base.$nodeList.appendTo(base.options.contents);
                    
                    $('body').scrollspy({ target: '#editorialOutline', offset: 49 });

                    //Set up inline editor for editable content
                    var editorial_nodes = base.$nodeList.find('.editorial_node').hide();
                    var num_editorial_nodes = editorial_nodes.length;
                    var editorial_node_index = 1;

                    base.$contentLoaderInfo.text('Loading editors...');

                    var editable_fields = [];
                    editorial_nodes.each(function(){

                        base.updateLinks($(this));
                        $(this).show().fadeTo(0,0);
                        var $parent = $(this);
                        $(this).find('[contenteditable]').each(function(){
                            if(!$(this)[0].isContentEditable){
                                return;
                            }

                            $parent.data('editableFields',$parent.data('editableFields')+1);

                            var editor = CKEDITOR.inline( $(this).attr('id'), {
                                // Remove scalar plugin for description - also remove codeMirror, as it seems to have issues with inline editing
                                removePlugins: $(this).hasClass('descriptionContent')?'scalar, codemirror, removeformat':'codemirror, removeformat',
                                startupFocus: false,
                                toolbar : 'ScalarInline'
                            } );

                            editor.on('focus', $.proxy(function(editor,base,ev) {
                                    if($(this).hasClass('descriptionContent')) return;
                                    
                                    $('html, body').animate({
                                        scrollTop: $(this).offset().top - ($(this).offset().top > $('body').scrollTop() ? 99 : 139)
                                    }, 1000);
                                    base.stripPlaceholders($(this));
                                    editor.plugins['scalar'].init(editor);
                            },this,editor,base));  


                            editor.on('blur', $.proxy(function($parent,base,ev) {
                                    if($('.bootbox').length > 0) return;
                                    if($(this).hasClass('descriptionContent')) return;
                                    
                                    base.updateLinks($parent);
                            },this,$parent,base)); 
                            

                            editor.on('instanceReady', $.proxy(function(base,ev) {
                                $(this).fadeTo(1000,100);
                                base.$contentLoader.fadeOut('fast',function(){
                                    $(this).remove();
                                });
                            },$parent,base));
                        });
                    });
        	}
        };

        base.addNode = function(node){
        	var currentVersion = node.current;

        	var state = base.node_state_classes[Math.floor(Math.random()*(base.node_state_classes.length))];
        	var stateName = base.node_states[state];        	

        	var nodeView = typeof node.current.defaultView !== 'undefined' ? node.current.defaultView : 'plain';

            var viewName = typeof views[nodeView] !== 'undefined' ? views[nodeView].name : nodeView;
        	var nodeItemHTML = '<div id="node_'+node.slug.replace(/\//g, '_')+'" class="editorial_node node caption_font">' +
        							'<div class="row">'+
        								'<div class="col-xs-12 col-sm-8 col-md-9">'+
        									'<h2 class="heading_font heading_weight clearboth title">'+node.getDisplayTitle()+'</h2>'+
        									'<span class="header_font badge view_badge">'+viewName+'</span>'+
        									'<span class="header_font badge no_queries_badge">No Queries</span>'+
        								'</div>'+
        								'<div class="col-xs-12 col-sm-4 col-md-3">'+
        									'<div class="dropdown state_dropdown">'+
        										'<button class="'+state+' btn state_btn btn-block dropdown-toggle" type="button" id="stateSelectorDropdown_'+node.slug.replace(/\//g, '_')+'" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="btn_text">'+stateName+'</span><span class="caret pull-right"></span></button>'+
        										'<ul class="dropdown-menu" aria-labelledby="stateSelectorDropdown_'+node.slug.replace(/\//g, '_')+'">';

        	for(var stateClass in base.node_states){
        		nodeItemHTML += 					'<li class="'+stateClass+'"><a href="#" data-state="'+stateClass+'" class="'+(state == stateClass ? 'active':'')+'">'+base.node_states[stateClass]+'</a></li>';
        	}
        											
			nodeItemHTML += 					'</ul>'+
        									'</div>'+
											'<div class="checkbox">'+
												'<label>'+
													'<input type="checkbox"> Usage rights'+
												'</label>'+
											'</div>'+
        								'</div>'+
        							'</div>'+
                                    '<label for="node_'+node.slug.replace(/\//g, '_')+'_description" class="descriptionLabel">Description</label>'+
                                    '<div id="node_'+node.slug.replace(/\//g, '_')+'_description" class="descriptionContent body_font well" contenteditable></div>'+
        							'<div id="node_'+node.slug.replace(/\//g, '_')+'_body" class="clearfix bodyContent body_font" contenteditable>'+node.current.content+'</div>'+
        						'</div>';

        	var $node = $(nodeItemHTML).appendTo(base.$nodeList);

            if(typeof node.current.description === 'undefined' || node.current.description == null){
                $node.find('.descriptionContent').text("(This page does not have a description.)").addClass('noDescription');
            }else{
                $node.find('.descriptionContent').text(node.current.description);
            }
        	
        	$node.find('.state_dropdown li>a').click(function(e){
        		e.preventDefault();
        		$(this).parents('ul').find('a.active').removeClass('active');
        		$(this).addClass('active');
        		$(this).parents('.state_dropdown').find('.state_btn').removeClass(base.node_state_string).addClass($(this).data('state')).find('.btn_text').text($(this).text());
        	});

        	$node.data({
        		title : currentVersion.title,
        		slug : node.slug
        	});

		    var nodeOutlineItemHTML = '<li class="'+state+'"><a href="#node_'+node.slug.replace(/\//g, '_')+'">'+node.getDisplayTitle()+'</a></li>';
		    var $nodeOutlineItem = $(nodeOutlineItemHTML).appendTo('#editorialOutline>ul');

		    $nodeOutlineItem.find('a').click(function(e){
		    	e.preventDefault();
		    	$('html, body').animate({
			        scrollTop: $($(this).attr('href')).offset().top - ($($(this).attr('href')).offset().top > $('body').scrollTop() ? 9 : 49)
			    }, 1000);
		    });
        };

        base.resize = function(){
	    	$('#editorialSidePanel>div,#editorialSidePanel>.scrollUp').width($('#editorialSidePanel').width());
            $('#editorialSidePanel>div .collapse').css('max-height',$(window).height()-100);
	    };

        base.updateLinks = function($node){
            //Handle media links
            $node.find('.bodyContent a[resource]').each(function(){
                base.addPlaceholderSlot($(this),true);
            });

            //Handle widget links
            $node.find('.bodyContent a[data-widget]').each(function(){
                base.addPlaceholderSlot($(this),false);
            });
        };


        //TODO: Rewrite slot manager so that it can build slots for media, widgets, and placeholders
        base.addPlaceholderSlot = function($link, isMedia){
            var size = $link.data('size');
            var align = $link.data('align');
            var inline = $link.hasClass('inline') || $link.hasClass('inlineWidget');
            var type = isMedia?'media':'widget';

            if(!inline && align == 'right'){
                $link.parents('.editorial_node').addClass('gutter');
            }

            var $placeholder = $('<div class="placeholder clearfix" contenteditable="false"><div class="content"></div></div>').addClass(size).addClass(align).addClass(type);

            if(!inline){
                //First check to see if we have any block elements before the link...
                var prev_block = $link.prev('br, p, div');

                if(prev_block.length > 0){
                    //If so, place the placeholder immediately after it.
                    prev_block.after($placeholder);
                }else{
                    //Otherwise, check the parent for existing placeholders - if they exist, insert this after them
                    if($link.parent().find('.placeholder').length > 0){
                        $link.parent().find('.placeholder').last().after($placeholder);
                    }else{
                        //Failing that, place this placeholder immediately inside the container
                        $link.parent().prepend($placeholder);
                    }
                }
            }else{
                $placeholder.addClass('inline');
                $link.after($placeholder);
            }


            if(isMedia){
                (function($placeholder,resource){
                    var handleMedia = function(){
                        var media = scalarapi.getNode(resource);
                        if(typeof media !== 'undefined' && media !== null && media !== undefined){
                            $placeholder.find('.content').html(media.getDisplayTitle()+'<br />(Click to load '+media.current.mediaSource.contentType+')');
                        }else{
                            $placeholder.find('.content').html('Missing Media! ('+resource+')');
                        }
                    };
                    if(scalarapi.loadPage( resource, false, handleMedia, null, 1, false, null, 0, 0) == "loaded"){
                        handleMedia();
                    }
                })($placeholder,$link.attr('resource'));
            }else{
                //We probably don't have a single node name, so we will save the api call
            }
        };

        base.stripPlaceholders = function($el){
            $el.find('.placeholder').remove();
        }

        // Run initializer
        base.init();
    };
    
    $.scalarEditorialPath.defaultOptions = {
    	contents : null,
		outline : null,
		pagesPerChunk : 10
    };
    
    $.fn.scalarEditorialPath = function(options){
        return this.each(function(){
            (new $.scalarEditorialPath(this, options));
        });
    };
    
})(jQuery);

$(function(){
	editorialPath = $('#editorialPath').scalarEditorialPath({
		contents : $('#editorialPathContents'),
		outline : $('#editorialOutline')
	});
});

CKEDITOR.disableAutoInline = true;