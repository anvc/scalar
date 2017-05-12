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
        base.$nodeList = $('<div>');

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

		        	//If we have manually set the number of pages, we don't need to try and parse that out...
		        	if(base.options.numPages == 0){
		        		base.stage = 1;
			        	scalarapi.loadNodesByType(
							'page', true, base.setup,
							null, 0, false, null, 0, 1
						);
					}else{
						base.stage = 2;
						base.setup();
					}

        			break;
        		case 1:
        			if(base.options.numPages == 0){
	        			for(var uri in data){ break; }
	        			var regex = /(?:\.)(\d+)\b/;
	        			var matches = null;
	        			if((matches = regex.exec(uri)) !== null){
	        				//We have a version node... Just lop off that version number so we can get the citation property
							uri = uri.slice(0, uri.lastIndexOf('.'));
	        			}
	        			var node = scalarapi.getNode( uri );
						var citationProp = node.properties['http://scalar.usc.edu/2012/01/scalar-ns#citation'][0].value;
						regex = /(?:.*methodNumNodes=(\d+))/;
						matches = null;
						if((matches = regex.exec(citationProp)) === null){
							console.error('Page, "'+uri+'," appears to have invalid citation information!"');
						}else{
							base.options.numPages = parseInt(matches[1]);
						}
					}
					base.stage = 2;
	        		base.$contentLoaderInfo.fadeOut('fast',function(){$(this).text('Loading pages - 0%').fadeIn('fast')});
        			scalarapi.loadNodesByType(
						'page', true, base.setup,
						null, 0, false, null, (base.currentChunk++)*base.options.pagesPerChunk, base.options.pagesPerChunk
					);
        			break;
        		case 2:
        			//Parse the data!
        			for(var uri in data){
        				var node = scalarapi.getNode( uri );
        				var regex = /(?:\.)(\d+)\b/;
	        			var matches = null;
	        			if((matches = regex.exec(uri)) === null){
							//We don't have a version node! Load the node.
							var node = scalarapi.getNode( uri );
							base.addNode(node);
	        			}
        			}

        			if(base.currentChunk*base.options.pagesPerChunk > base.options.numPages){
        				base.$contentLoaderInfo.text('Loading pages - 100%');
        				base.stage = 3;
        				base.setup();
        			}else{
	        			base.$contentLoaderInfo.text('Loading pages - '+Math.round((base.currentChunk*base.options.pagesPerChunk)/base.options.numPages)*100+'%');
	        			scalarapi.loadNodesByType(
							'page', true, base.setup,
							null, 0, false, null, (base.currentChunk++)*base.options.pagesPerChunk, base.options.pagesPerChunk
						);
					}
        			break;
        		case 3:

                    if($('#editorialOutlinePanel>div').height() < $(window).height()){
                        $('#editorialOutlinePanel>div').affix({
                          offset: {
                            top: 50
                          }
                        });
                        $('body').scrollspy({ target: '#editorialOutline', offset: 150 });
                    }else{
                        $('#editorialOutline').addClass('tall');
                        $('<a class="scrollUp btn btn-primary">Scroll to Top</a>')
                            .appendTo('#editorialOutlinePanel')
                            .click(function(e){
                                e.preventDefault();
                                $('html, body').animate({
                                    scrollTop: 0
                                }, 1000);
                            })
                            .affix({
                                offset: {
                                    top: function(){
                                        return $('#editorialOutlinePanel>div').height()+65;
                                    }
                                }
                            });
                    }

                    base.resize();

        			base.$contentLoader.fadeOut('fast',function(){
        				$(this).remove();
        			});

        			base.$nodeList.appendTo(base.options.contents);

                    base.updateLinks();
        	}
        };

        base.addNode = function(node){
        	var currentVersion = node.current;

        	var state = base.node_state_classes[Math.floor(Math.random()*(base.node_state_classes.length))];
        	var stateName = base.node_states[state];        	

        	var nodeView = node.current.defaultView;

        	var nodeItemHTML = '<div id="node_'+node.slug+'" class="editorial_node node">' +
        							'<div class="row">'+
        								'<div class="col-xs-12 col-sm-8 col-md-9">'+
        									'<h2 class="heading_font heading_weight clearboth title">'+node.getDisplayTitle()+'</h2>'+
        									'<span class="header_font badge view_badge">'+views[nodeView].name+'</span>'+
        									'<span class="header_font badge no_queries_badge">No Queries</span>'+
        								'</div>'+
        								'<div class="col-xs-12 col-sm-4 col-md-3">'+
        									'<div class="dropdown state_dropdown">'+
        										'<button class="'+state+' btn state_btn btn-block dropdown-toggle" type="button" id="stateSelectorDropdown_'+node.slug+'" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="btn_text">'+stateName+'</span><span class="caret pull-right"></span></button>'+
        										'<ul class="dropdown-menu" aria-labelledby="stateSelectorDropdown_'+node.slug+'">';

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
        							'<div class="content">'+node.current.content+'</div>'+
        						'</div>';

        	var $node = $(nodeItemHTML).appendTo(base.$nodeList);
        	
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

		    var nodeOutlineItemHTML = '<li class="'+state+'"><a href="#node_'+node.slug+'">'+node.getDisplayTitle()+'</a></li>';
		    var $nodeOutlineItem = $(nodeOutlineItemHTML).appendTo('#editorialOutline>ul');

		    $nodeOutlineItem.find('a').click(function(e){
		    	e.preventDefault();
		    	$('html, body').animate({
			        scrollTop: $($(this).attr('href')).offset().top
			    }, 1000);
		    });
        };

        base.resize = function(){
	    	$('#editorialOutlinePanel>div,#editorialOutlinePanel>.scrollUp').width($('#editorialOutlinePanel').width());
	    };

        base.updateLinks = function(){
            //Handle media links
            $('.editorial_node .content a[resource]').each(function(){
                base.addPlaceholderSlot($(this),true);
            });

            //Handle widget links
            $('.editorial_node .content a[data-widget]').each(function(){
                base.addPlaceholderSlot($(this),false);
            });
        };


        //TODO: Rewrite slot manager so that it can build slots for media, widgets, and placeholders
        base.addPlaceholderSlot = function($link, isMedia){
            var size = $link.data('size');
            var align = $link.data('align');
            var inline = $link.hasClass('inline') || $link.hasClass('inlineWidget');

            if(!inline && align == 'right'){
                $link.parents('.editorial_node').addClass('gutter');
            }

            var $placeholder = $('<div class="placeholder clearfix"><div class="content"></div></div>').addClass(size).addClass(align);

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
                $link.after($placeholder);
            }


            if(isMedia){
                (function($placeholder,resource){
                    var handleMedia = function(){
                        var media = scalarapi.getNode(resource);
                        $placeholder.find('.content').html(media.getDisplayTitle()+'<br />(Click to load '+media.current.mediaSource.contentType+')');
                    };
                    if(scalarapi.loadPage( resource, false, handleMedia, null, 1, false, null, 0, 0) == "loaded"){
                        handleMedia();
                    }
                })($placeholder,$link.attr('resource'));
            }else{
                //We probably don't have a single node name, so we will save the api call
            }
        };

        // Run initializer
        base.init();
    };
    
    $.scalarEditorialPath.defaultOptions = {
    	contents : null,
		outline : null,
		numPages : 0,
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