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
 * http://www.osedu.org/licenses /ECL-2.0 
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.       
 */  

(function($) {

	$.scalarpage = function(e, options) {
	
		/**
		
		TODO:
		
		- You tend to read the lateral (right) button before the down (enter path) button, even though the latter should probably come first
		- What happens when media extends beyond height of content (http://scalar.usc.edu/works/guide/creating-an-account?template=cantaloupe)
		- When images have white borders, can be hard to tell if caption is for the image above or below it (http://scalar.usc.edu/works/guide/reading-in-scalar?template=cantaloupe)
		- Should subway map buttons include things like (enter path at) and such?
		- Animated page transitions to emphasize spatial relationship?
		- Make buttons know your history so they suggest the right thing to do, otherwise you can get stuck in loops
		- Continue implies the content is continued, but this isn't always the case. Sometimes it's a full stop.
		- Is inline media showing up?
		- HTML tags in subway map aren't getting parsed (http://scalar.usc.edu/works/text-identity-subjectivity/the-kierkegaardian-aesthetic-and-blakean-innocence?template=cantaloupe)
		- Strange indenting (http://scalar.usc.edu/works/text-identity-subjectivity/the-kierkegaardian-aesthetic-and-blakean-innocence?template=cantaloupe, http://scalar.usc.edu/works/text-identity-subjectivity/blakes-aesthetic-theology?template=cantaloupe, http://scalar.usc.edu/works/growing-apart-a-political-history-of-american-inequality/index?template=cantaloupe, http://scalar.usc.edu/works/growing-apart-a-political-history-of-american-inequality/wage-ratios-sidebar?template=cantaloupe)
		- Maintaining the path you're on in subway map
		
		
		*/
	
		var element = e;
		var commentDialog;
		
		var page = {
		
			options: $.extend({}, options),
			
			/**
			  * Increments the data with the given name attached to the selection.
			  *
			  * @param {Object} selection		The selection whose data is to be incremented.
			  * @param {String} data			The name of the data property to be incremented.
			  */
			incrementData: function(selection, data) {
				var value = selection.data(data);
				if (value != undefined) {
					value++;
				} else {
					value = 1;
				}
				selection.data(data, value);
				return value;
			},
			
			/**
			 * Called when a mediaelement instance has gathered metadata about the media.
			 *
			 * @param {Object} event			The event object.
			 * @param {Object} link				The link which spawned the mediaelement, and which contains its data.
			 */
			handleMediaElementMetadata: function(event, link) {
				var mediaelement = link.data('mediaelement');
				//console.log(parseInt(mediaelement.model.element.find('.mediaObject').width())+' '+(mediaelement.view.initialContainerWidth - 144));
				//mediaelement.view.adjustMediaWidth(300);
				if ((parseInt(mediaelement.model.element.find('.mediaObject').width()) - mediaelement.view.mediaMargins.horz) <= (mediaelement.view.initialContainerWidth - 144)) {
					//console.log('prepend');
					mediaelement.model.element.parent().prepend('<div class="left_margin">&nbsp</div>');
				}
				if ((mediaelement.model.options.width != null) && (mediaelement.model.options.height != null)) {
					var infoElement = $('<div class="body_copy"></div>');
					mediaelement.model.element.parent().after(infoElement);
					mediaelement.model.element.css('marginBottom','0');
					mediaelement.view.footer.hide();
					$.scalarmedia(mediaelement, infoElement, {'shy':false});
				} else {
					$.scalarmedia(mediaelement, mediaelement.view.footer, {'shy':true});
				}
				mediaelement.model.element.css('visibility','visible');
				link.addClass('texteo_icon');
				link.addClass('texteo_icon_'+mediaelement.model.node.current.mediaSource.contentType);
			},
			
			handleSetState: function(event, data) {
			
				switch (data.state) {
				
					case ViewState.Reading:
					if (data.instantaneous) {
						$('.page').stop().show();
					} else {
						$('.page').stop().fadeIn();
					}
					break;
					
					case ViewState.Navigating:
					if (data.instantaneous) {
						$('.page').stop().hide();
					} else {
						$('.page').stop().fadeOut();
					}
					break;
				
				}
			
			},
			
			addMediaElementForLink: function(link, parent) {
			
				var size = link.attr('data-size');
				if (size == undefined) size = 'medium';
				
				var align = link.attr('data-align');
				if (align == undefined) align = 'right';
				
				// create a temporary element and remove it so we can get it's width; this allows us to specify
				// the various media element widths via CSS
				var temp = $('<div class="'+size+'_dim"></div>').appendTo('.page');
				var width = parseInt(temp.width());
				temp.remove();
				
				var height = null;
				if (size == 'full') {
					height = maxMediaHeight;
				}
				slot = link.slotmanager_create_slot(width, height, {url_attributes: ['href', 'src']});
				if (slot) {
					slotDOMElement = slot.data('slot');
					slotMediaElement = slot.data('mediaelement');
					slotMediaElement.model.element.css('visibility','hidden');
					if ($(slot).hasClass('inline')) {
						link.after(slotDOMElement);
						link.hide();
					} else if (size != 'full') {
						parent.before(slotDOMElement);
						count = page.incrementData(parent, align+'_count');
						if (count == 1) slotDOMElement.addClass('top');
						slotDOMElement.addClass(align);
					} else {
						parent.after(slotDOMElement);
						slotDOMElement.addClass('full');
					}				
				}
			
			},
			
			addRelationshipNavigation: function(showLists) {
			
				var path, button, href,
					pathOptionCount = 0,
					containingPathOptionCount = 0,
					queryVars = scalarapi.getQueryVars( document.location.href ),
					foundQueryPath = ( queryVars.path != null );
					
				$('.path_of').each(function() {
					if ($(this).parent().is('section')) {
						var pathSection = $(this).parent();
						pathSection.addClass('relationships');
						pathSection.find('h3').text('Path contents');
						pathSection.show();
						pathSection.find( '[property="dcterms:title"] > a' ).each( function() {
							var href = $( this ).attr( 'href' ) + '?path=' + currentNode.slug;
							$( this ).attr( 'href', href );
						});
						
						if (!showLists) {
							pathSection.find('h3').hide();
							pathSection.find('ol').hide();
						}
				
						var path_nodes = currentNode.getRelatedNodes('path', 'outgoing');
						if (path_nodes.length > 0) {
							button = $( '<p><a class="nav_btn primary" href="' + path_nodes[ 0 ].url + '?path=' + 
								currentNode.slug + '">Begin this path at “' + path_nodes[0].getDisplayTitle() +
								'”</a></p>' ).appendTo( pathSection );
							pathOptionCount++;
						}
						
						var i;
						var index;
					}
				});
				
				var containing_paths = currentNode.getRelatedNodes('path', 'incoming');
				
				// if we're on one of the container paths, make it first in the list
				containing_paths.sort( function( a, b ) {
					if ( a.slug == queryVars.path ) {
						return -1;
					} else if ( b.slug == queryVars.path ) {
						return 1;
					}
					return 0;
				});

				if (containing_paths.length > 0) {
					for (i in containing_paths) {
						path = containing_paths[ i ];
						var section = $('<section class="relationships"></section').appendTo('article');
						var sibling_nodes = path.getRelatedNodes('path', 'outgoing');
						//console.log(sibling_nodes);
						index = sibling_nodes.indexOf(currentNode);
						if (index < (sibling_nodes.length - 1)) {
						
							// A child option has already been offered; this option is an alternative
							if ( pathOptionCount > 0 ) {
						
								// It's an alternative on the current path or we don't know what path we're on
								if (( foundQueryPath && ( path.slug == queryVars.path )) || !foundQueryPath ) {
									section.append( '<p><a class="nav_btn" href="' + sibling_nodes[index+1].url + '?path=' + 
										path.slug + '">Or, continue to “' + sibling_nodes[index+1].getDisplayTitle() + '”</a></p>' );
										
								// It's an alternative on a different path; id the path
								} else {
									section.append( '<p><a class="nav_btn" href="' + sibling_nodes[index+1].url + '?path=' + 
										path.slug + '">Or, switch to the “' + path.getDisplayTitle() + '” path and continue to “' +
										sibling_nodes[index+1].getDisplayTitle() + '”</a></p>' );
								}
								
							// No child options have been offered
							} else {
							
								// This option is on the current path or we don't know what path we're on
								if (( foundQueryPath && ( path.slug == queryVars.path )) || !foundQueryPath ) {
									section.append( '<p><a class="nav_btn primary" href="' + sibling_nodes[index+1].url + 
										'?path=' + path.slug + '">Continue to “' + sibling_nodes[index+1].getDisplayTitle() +
										'”</a></p>' );
								} else {
									section.append( '<p><a class="nav_btn" href="' + sibling_nodes[index+1].url + '?path=' + 
										path.slug + '">Or, switch to the “' + path.getDisplayTitle() + '” path and continue to “' +
										sibling_nodes[index+1].getDisplayTitle() + '”</a></p>' );
								}
							}
							pathOptionCount++;
							containingPathOptionCount++;
						}
					}
				}
				
				
				$('.tag_of').each(function() {
					if ($(this).parent().is('section')) {
						var tagSection = $(this).parent();
						tagSection.addClass('relationships');
						tagSection.find('h3').text('Tag contents');
						tagSection.find('ol').contents().unwrap().wrapAll('<ul></ul>');
						tagSection.show();
						
						if (!showLists) {
							tagSection.find('h3').hide();
							tagSection.find('ul').hide();
						}
						
						var tag_nodes = currentNode.getRelatedNodes('tag', 'outgoing');
						if (tag_nodes.length > 1) {
							tagSection.append('<p><a class="nav_btn" href="'+tag_nodes[Math.floor(Math.random() * tag_nodes.length)].url+'?tag='+currentNode.slug+'">Visit a random tagged page</a></p>');
						}
					}
				});			
			
			},
			
			addComments: function() {
				var comments = currentNode.getRelatedNodes('comment', 'incoming');
				$('article').append('<div id="footer"><div id="comment" class="reply_link">'+((comments.length > 0) ? comments.length : '&nbsp;')+'</div><div id="footer-right"></div></div>');
				var commentDialogElement = $('<div></div>').appendTo('body');
				commentDialog = commentDialogElement.scalarcomments( { root_url: modules_uri+'/cantaloupe'} );
				$('.reply_link').click(function() {
					commentDialog.data('plugin_scalarcomments').showComments();
				});
			},
			
			setupScreenedBackground: function() {
				var screen = $('<div class="bg_screen"><img src="' + page.options.root_url + '/images/1x1white_trans.png" width="100%" height="100%"/></div>').prependTo('body');
				screen.css('backgroundImage', $('body').css('backgroundImage'));
				$('body').css('backgroundImage', 'none');
			},
			
			/*addIconBtn: function(element, filename, hoverFilename, title, url) {
				var img_url_1 = header.options.root_url+'/images/'+filename;
				var img_url_2 = header.options.root_url+'/images/'+hoverFilename;
				if (url == undefined) url = 'javascript:;';
				element.append('<a href="'+url+'" title="'+title+'"><img src="'+img_url_1+'" onmouseover="this.src=\''+img_url_2+'\'" onmouseout="this.src=\''+img_url_1+'\'" alt="Search" width="30" height="30" /></a>');
			},*/
			
			addMediaElements: function() {
			
				var viewType = currentNode.current.properties['http://scalar.usc.edu/2012/01/scalar-ns#defaultView'][0].value;
				switch (viewType) {
					
					case 'gallery':
					$('body').bind('mediaElementMediaLoaded', page.handleMediaElementMetadata);
					scalarapi.loadPage(currentNode.slug, true, function() {
						var i,node,link,
							nodes = getChildrenOfType(currentNode, 'media');
						$('article > h1').after('<div id="gallery"></div>');
						var gallery = $('#gallery');
						for (i in nodes) {
							node = nodes[i];
							link = $('<span><a href="'+node.current.sourceFile+'" resource="'+node.slug+'" data-size="full">'+node.slug+'</a></span>').appendTo(gallery);
							page.addMediaElementForLink(link.find('a'), link);
							link.css('display', 'none');
						} 
						//page.addRelationshipNavigation(true);
						//page.addComments();		  	
					}, function() {
						console.log('an error occurred while retrieving gallery info.');
					}, 1, true);
					break;
					
					case 'structured_gallery':
					// add structured gallery media
					gallery.addMedia();
					break;
				
					default:
				  	$('body').bind('mediaElementMediaLoaded', page.handleMediaElementMetadata);
					$('a').each(function() {
					
						// resource property signifies a media link
						if ($(this).attr('resource') || ($(this).find('[property="art:url"]').length > 0)) {
						
							var slot;
							var slotDOMElement;
							var slotMediaElement;
							var count;
							var parent;
							
							if ($(this).attr('resource') == undefined) {
								$(this).attr('href', currentNode.current.sourceFile);
								$(this).attr('resource', currentNode.slug);
								$(this).attr('data-size', 'full');
								parent = $(this);
							} else {
								parent = $(this).parent('p,div');
							}
											
							$(this).addClass('media_link');
							
							page.addMediaElementForLink($(this), parent);
							
						}
					});
					$('[property="art:url"]').each(function() {
					
						if ($(this).text().length > 0) {
							$(this).wrapInner('<a href="'+currentNode.current.sourceFile+'" resource="'+currentNode.slug+'" data-size="full"></a>');
							page.addMediaElementForLink($(this).find('a'), $(this));
							$(this).css('display', 'none');
						
						}
					
					});
					break;
				
				}
			
			}
			
		};
		
		$('body').bind('setState', page.handleSetState);
		
		element.addClass('page');
		
		wrapOrphanParagraphs($('[property="sioc:content"]'));
	  	
	  	$('[property="scalar:defaultView"]').hide();
	  	$('[property="sioc:content"]').children('p,div').addClass('body_copy').wrap('<div class="paragraph_wrapper"></div>');
	  	
	  	// This code makes full-sized inline media truly full instead of having margins
	  	/*$('[property="sioc:content"]').children('p,div').each( function() {
	  		if ( $( this ).find('.inline[data-size="full"]').length == 0 ) {
	  			$( this ).addClass('body_copy').wrap('<div class="paragraph_wrapper"></div>');
	  		}
	  	});*/
		
		$('section').hide(); // TODO: Make this more targeted	
		
		var i, node, nodes, link;
		
		//console.log(currentNode.current.properties);
		var viewType = currentNode.current.properties['http://scalar.usc.edu/2012/01/scalar-ns#defaultView'][0].value;
		switch (viewType) {
			
			case 'splash':
			element.addClass('splash');
			$('h1').wrap('<div class="title_card"></div>');
			//$('.title_card').append('<h2>By Steve Anderson</h2>');
			$('.title_card').delay(500).fadeIn(2000);
			$('[property="art:url"]').hide();
			element.css('backgroundImage', $('body').css('backgroundImage'));
			$('body').css('backgroundImage', 'none');
			$('.paragraph_wrapper').remove();
			page.addRelationshipNavigation(false);
			$('.relationships').appendTo('.title_card');
			break;
			
			case 'gallery':
			/*$('body').bind('mediaElementMediaLoaded', page.handleMediaElementMetadata);
			scalarapi.loadPage(currentNode.slug, true, function() {
				var i,node,link,
					nodes = getChildrenOfType(currentNode, 'media');
				$('article > h1').after('<div id="gallery"></div>');
				var gallery = $('#gallery');
				for (i in nodes) {
					node = nodes[i];
					link = $('<span><a href="'+node.current.sourceFile+'" resource="'+node.slug+'" data-size="full">'+node.slug+'</a></span>').appendTo(gallery);
					page.addMediaElementForLink(link.find('a'), link);
					link.css('display', 'none');
				} 
			}, function() {
				console.log('an error occurred while retrieving gallery info.');
			}, 1, true);*/
			page.addRelationshipNavigation(true);
			page.addComments();		  	
			break;
			
			case 'visualization':
			var options = {parent_uri:scalarapi.urlPrefix, default_tab:'visindex'}; 
			var visualization = $('<div id="#visualization"></div>').appendTo(element);
			visualization.scalarvis(options);	
			break;
			
			case 'structured_gallery':
			page.setupScreenedBackground();
			var gallery = $.scalarstructuredgallery($('<div></div>').appendTo(element));
			page.addComments();		  	
			break;
		
			default:
		  	//$('body').bind('mediaElementMediaLoaded', page.handleMediaElementMetadata);

			page.setupScreenedBackground();
		  	
		  	// add mediaelements
			/*$('a').each(function() {
			
				// resource property signifies a media link
				if ($(this).attr('resource') || ($(this).find('[property="art:url"]').length > 0)) {
				
					var slot;
					var slotDOMElement;
					var slotMediaElement;
					var count;
					var parent;
					
					if ($(this).attr('resource') == undefined) {
						$(this).attr('href', currentNode.current.sourceFile);
						$(this).attr('resource', currentNode.slug);
						$(this).attr('data-size', 'full');
						parent = $(this);
					} else {
						parent = $(this).parent('p,div');
					}
									
					$(this).addClass('media_link');
					
					page.addMediaElementForLink($(this), parent);
					
				}
			});
			
			$('[property="art:url"]').each(function() {
			
				if ($(this).text().length > 0) {
					$(this).wrapInner('<a href="'+currentNode.current.sourceFile+'" resource="'+currentNode.slug+'" data-size="full"></a>');
					page.addMediaElementForLink($(this).find('a'), $(this));
					$(this).css('display', 'none');
				
				}
			
			});*/
					
			page.addRelationshipNavigation(true);
			page.addComments();		  	
			break;
		
		}
			
		addTemplateLinks($('article'), 'cantaloupe');

	  	$('body').addClass('body_font');
	  	$('h1, h2, h3, h4, #header, .mediaElementFooter, #comment, .media_metadata').addClass('heading_font');
		
		return page;
	
	}

})(jQuery);