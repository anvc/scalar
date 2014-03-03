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
		
		- When images have white borders, can be hard to tell if caption is for the image above or below it (http://scalar.usc.edu/works/guide/reading-in-scalar?template=cantaloupe)
		- Should subway map buttons include things like (enter path at) and such?
		- Make buttons know your history so they suggest the right thing to do, otherwise you can get stuck in loops
		- Continue implies the content is continued, but this isn't always the case. Sometimes it's a full stop.
		- HTML tags in subway map aren't getting parsed (http://scalar.usc.edu/works/text-identity-subjectivity/the-kierkegaardian-aesthetic-and-blakean-innocence?template=cantaloupe)
		- Strange indenting (http://scalar.usc.edu/works/text-identity-subjectivity/the-kierkegaardian-aesthetic-and-blakean-innocence?template=cantaloupe, http://scalar.usc.edu/works/text-identity-subjectivity/blakes-aesthetic-theology?template=cantaloupe, http://scalar.usc.edu/works/growing-apart-a-political-history-of-american-inequality/index?template=cantaloupe, http://scalar.usc.edu/works/growing-apart-a-political-history-of-american-inequality/wage-ratios-sidebar?template=cantaloupe)
		
		*/
	
		var element = e;
		var commentDialog;
		
		var page = {
		
			options: $.extend({}, options),
			
			annotatedMedia: [],
			
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
				//mediaelement.view.adjustMediaWidth(300);
				if ( mediaelement.model.options.solo != true ) {
					if ((parseInt(mediaelement.model.element.find('.mediaObject').width()) - mediaelement.view.mediaMargins.horz) <= (mediaelement.view.initialContainerWidth - 144)) {
						mediaelement.model.element.parent().prepend('<div class="left_margin">&nbsp</div>');
					}
					if ((mediaelement.model.options.width != null) && (mediaelement.model.options.height != null)) {
						var infoElement = $('<div class="body_copy"></div>');
						mediaelement.model.element.parent().after(infoElement);
						mediaelement.model.element.css('marginBottom','0');
						mediaelement.view.footer.hide();
						$.scalarmedia(mediaelement, infoElement, { 'shy': false, 'details': page.mediaDetails });
					} else {
						$.scalarmedia(mediaelement, mediaelement.view.footer, { 'shy': !isMobile, 'details': page.mediaDetails });
					}
				}
				if ( mediaelement.model.node.current.mediaSource.contentType == 'image' ) {
					mediaelement.model.element.find( '.mediaObject' ).click( function() {
						window.open( mediaelement.model.node.current.sourceFile, 'popout' );
					} ).css( 'cursor', 'pointer' );
				}
				mediaelement.model.element.css('visibility','visible');
				link.addClass('texteo_icon');
				link.addClass('texteo_icon_'+mediaelement.model.node.current.mediaSource.contentType);
			},
			
			handleSetState: function(event, data) {
			
				page.hideNote();
			
				switch (data.state) {
				
					case ViewState.Reading:
					if (data.instantaneous) {
						$('.page').removeClass( 'fade_out instantaneous_fade_out' );
					} else {
						//$('.page').stop().fadeIn();
						$( '.page' ).removeClass( 'fade_out instantaneous_fade_out' );
					}
					$( 'body' ).css( 'overflow-y', 'auto' );
					break;
					
					case ViewState.Navigating:
					if (data.instantaneous) {
						$('.page').addClass( 'instantaneous_fade_out' );
					} else {
						//$('.page').stop().fadeOut();
						$( '.page' ).addClass( 'fade_out' );
						/*$( '.page' ).addClass( 'fade_out' ).delay( 1000 ).queue( 'fx', function( next ) {
							//$( this ).css( 'display', 'none' );
							next();
						} );*/
					}
					$( 'body' ).css( 'overflow-y', 'hidden' );
					break;
					
					case ViewState.Modal:
					$( 'body' ).css( 'overflow-y', 'hidden' );
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
			
				var path, button, href, section, nodes, node, link,
					pathOptionCount = 0,
					containingPathOptionCount = 0,
					queryVars = scalarapi.getQueryVars( document.location.href ),
					foundQueryPath = ( queryVars.path != null );
					
				$('.path_of').each(function() {
					if ($(this).parent().is('section')) {
						section = $(this).parent();
						section.addClass('relationships');
						section.find('h3').text('Path contents');
						section.show();
						section.find( '[property="dcterms:title"] > a' ).each( function() {
							var href = $( this ).attr( 'href' ) + '?path=' + currentNode.slug;
							$( this ).attr( 'href', href );
						});
						
						if (!showLists) {
							section.find('h1').hide();
							section.find('ol').hide();
						}
				
						nodes = currentNode.getRelatedNodes('path', 'outgoing');
						if (nodes.length > 0) {
							button = $( '<p><a class="nav_btn primary" href="' + nodes[ 0 ].url + '?path=' + 
								currentNode.slug + '">Begin with “' + nodes[0].getDisplayTitle() +
								'”</a></p>' ).appendTo( section );
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
				
				// handle end-of-path destinations
				$( '[rel="scalar:continue_to"]' ).each( function() {
				
					var span = $( '[resource="' + $( this ).attr( 'href' ) + '"]' );
					span.hide();
					link =  span.find( 'span[property="dcterms:title"] > a' );
					node = scalarapi.getNode( link.attr( 'href' ) );
					section = $('<section class="relationships"></section').appendTo('article');
			
					// A child option has already been offered; this option is an alternative
					if ( pathOptionCount > 0 ) {
						section.append( '<p><a class="nav_btn" href="' + node.url + '">End of path; continue to “' + 
							node.getDisplayTitle() + '”</a></p>' );
						
					// No child options have been offered
					} else {
						section.append( '<p><a class="nav_btn primary" href="' + node.url + '">End of path; continue to “' + 
							node.getDisplayTitle() + '”</a></p>' );
					}
					
					pathOptionCount++;
					containingPathOptionCount++;
					
				} );
				
				if (containing_paths.length > 0) {
					for (i in containing_paths) {
						path = containing_paths[ i ];
						section = $('<section class="relationships"></section').appendTo('article');
						nodes = path.getRelatedNodes('path', 'outgoing');
						//console.log(sibling_nodes);
						index = nodes.indexOf(currentNode);
						if (index < (nodes.length - 1)) {
						
							// A child option has already been offered; this option is an alternative
							if ( pathOptionCount > 0 ) {
						
								// It's an alternative on the current path or we don't know what path we're on
								if (( foundQueryPath && ( path.slug == queryVars.path )) || !foundQueryPath ) {
									section.append( '<p><a class="nav_btn" href="' + nodes[index+1].url + '?path=' + 
										path.slug + '">Or, continue to “' + nodes[index+1].getDisplayTitle() + '”</a></p>' );
										
								// It's an alternative on a different path; id the path
								} else {
									section.append( '<p><a class="nav_btn" href="' + nodes[index+1].url + '?path=' + 
										path.slug + '">Or, switch to the “' + path.getDisplayTitle() + '” path and continue to “' +
										nodes[index+1].getDisplayTitle() + '”</a></p>' );
								}
								
							// No child options have been offered
							} else {
							
								// This option is on the current path or we don't know what path we're on
								if (( foundQueryPath && ( path.slug == queryVars.path )) || !foundQueryPath ) {
									section.append( '<p><a class="nav_btn primary" href="' + nodes[index+1].url + 
										'?path=' + path.slug + '">Continue to “' + nodes[index+1].getDisplayTitle() +
										'”</a></p>' );
								} else {
									section.append( '<p><a class="nav_btn" href="' + nodes[index+1].url + '?path=' + 
										path.slug + '">Switch to the “' + path.getDisplayTitle() + '” path and continue to “' +
										nodes[index+1].getDisplayTitle() + '”</a></p>' );
								}
							}
							pathOptionCount++;
							containingPathOptionCount++;
						}
					}
				}
				
				
				$('.tag_of').each(function() {
					if ($(this).parent().is('section')) {
						section = $(this).parent();
						section.addClass('relationships');
						section.find('h3').text('Tag contents');
						section.find('ol').contents().unwrap().wrapAll('<ul></ul>');
						section.show();
						
						if (!showLists) {
							section.find('h1').hide();
							section.find('ul').hide();
						}
						
						nodes = currentNode.getRelatedNodes('tag', 'outgoing');
						if (nodes.length > 1) {
							section.append('<p><a class="nav_btn" href="'+nodes[Math.floor(Math.random() * nodes.length)].url+'?tag='+currentNode.slug+'">Visit a random tagged page</a></p>');
						}
					}
				});			
				
				$('.reply_of').each(function() {
					if ($(this).parent().is('section')) {
						section = $(this).parent();
						section.addClass('relationships');
						section.find('h1').text('Comments on');
						section.find('ol').contents().unwrap().wrapAll('<ul></ul>');
						section.show();
					}
				});			
				
				$('.annotation_of').each(function() {
					if ($(this).parent().is('section')) {
						section = $(this).parent();
						section.addClass('relationships');
						if ( currentNode.baseType == 'http://scalar.usc.edu/2012/01/scalar-ns#Composite' ) {
							section.find('h1').text('This page annotates:');
						} else if ( currentNode.baseType == 'http://scalar.usc.edu/2012/01/scalar-ns#Media' ) {
							section.find('h1').text('This media annotates:');
						} else {
							section.find('h1').text('This content annotates:');
						}
						section.find('ol').contents().unwrap().wrapAll('<ul></ul>');
						section.show();

						/*section.find( 'li > span > span > a' ).each( function() {
							node = scalarapi.getNode( $( this ).attr( 'href' ) );
							page.annotatedMedia.push( node );
						} );
						page.loadNextAnnotatedMedia();*/
					}
				});			
				
			},
			
			loadNextAnnotatedMedia: function() {
				if ( page.annotatedMedia.length > 0 ) {
					var node = page.annotatedMedia[ 0 ];
					scalarapi.loadPage( node.slug, true, function() {
						var node = scalarapi.getNode( page.annotatedMedia[ 0 ].slug );
						var element = $( 'section' ).find( 'a[href="' + node.url + '"]' ).eq( 0 );
						page.annotatedMedia.splice( 0, 1 );
						link = $( '<a style="display: none;" href="' + node.current.sourceFile + '" resource="' + node.slug + '" data-size="full" data-relation="annotation"/></a>' ).appendTo( element.parent().parent().parent().parent() );
					}, null );
				}
			},
			
			addIncomingComments: function() {
				var comments = currentNode.getRelatedNodes('comment', 'incoming');
				//$('article').append('<div id="footer"><div id="comment" class="reply_link">'+((comments.length > 0) ? comments.length : '&nbsp;')+'</div><div id="footer-right"></div></div>');
				$('article').append('<div id="incoming_comments" class="caption_font"><div id="comment_control" class="reply_link">'+((comments.length > 0) ? comments.length : '&nbsp;')+'</div></div>');
				var commentDialogElement = $('<div></div>').appendTo('body');
				commentDialog = commentDialogElement.scalarcomments( { root_url: modules_uri+'/cantaloupe'} );
				$('.reply_link').click(function() {
					commentDialog.data('plugin_scalarcomments').showComments();
				});
			},
			
			addColophon: function() {
				$('article').append('<div id="colophon" class="caption_font"><p id="scalar-credit"><a href="http://scalar.usc.edu/scalar"><img src="' + page.options.root_url + '/images/scalar_logo_small.png" width="18" height="16"/></a> Powered by <a href="http://scalar.usc.edu/scalar">Scalar</a> | <a href="http://scalar.usc.edu/terms-of-service/">Terms of Service</a> | <a href="http://scalar.usc.edu/privacy-policy/">Privacy Policy</a> | <a href="http://scalar.usc.edu/contact/">Scalar Feedback</a></p></div>');
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
			
			addNotes: function() {
			
				var i, n, note, resource,
					notes = $( '.note' );
					
				n = notes.length;
				for ( i = 0; i < n; i++ ) {
					note = notes.eq( i );
					resource = note.attr( 'resource' );
					note.wrapInner( '<a href="javascript:;" rev="scalar:has_note" resource="' + resource + '"></a>' );
					note.find( 'a' ).click( function() {
						page.showNote( this );
					} );
					note.find( 'a' ).unwrap().addClass( 'texteo_icon texteo_icon_note' );
				}
				
				$( 'body' ).append( '<div class="note_viewer caption_font"></div>' );
			
			},
			
			showNote: function( note ) {
				note = $( note );
				if ( note.hasClass( 'media_link' ) ) {
					$( '[rev="scalar:has_note"]' ).removeClass( 'media_link' );
					$( '.note_viewer' ).hide();
				} else {
					var position = note.offset(),
						noteViewer = $( '.note_viewer' );
					$( '[rev="scalar:has_note"]' ).removeClass( 'media_link' );
					note.addClass( 'media_link' );
					noteViewer.text( 'Loading…' );
					noteViewer.css( {
						'left': position.left,
						'top': position.top + parseInt( note.height() ) + 3
					} ).show();
					noteViewer.data( 'slug',  note.attr( 'resource' ) );
					scalarapi.loadPage( note.attr( 'resource' ), true, page.handleNoteData );
				}
			},
			
			hideNote: function() {
				$( '[rev="scalar:has_note"]' ).removeClass( 'media_link' );
				$( '.note_viewer' ).hide();
			},
			
			handleNoteData: function() {
				var noteViewer = $( '.note_viewer' );
				var node = scalarapi.getNode( noteViewer.data( 'slug' ) );
				if ( node != null ) {
					noteViewer.empty();
					//noteViewer.append( '<h5>' + node.getDisplayTitle() + '</h5>' );
					if ( node.current.content != null ) {
						noteViewer.append( node.current.content );
					}
					noteViewer.append( '<br/><br/><a href="' + scalarapi.model.urlPrefix + node.slug + '">Go to note</a>' );
				}
			},
			
			handleBook: function() {
			
				var viewType = currentNode.current.properties['http://scalar.usc.edu/2012/01/scalar-ns#defaultView'][0].value;
				
				if ( viewType == 'book_splash' ) {
	
					var i, n,
						owners = scalarapi.model.bookNode.properties[ 'http://rdfs.org/sioc/ns#has_owner' ],
						authors = [];
					if ( owners ) {
						n = owners.length;
						for ( i = 0; i < n; i++ ) {
							authors.push( scalarapi.getNode( scalarapi.stripAllExtensions( owners[ i ].value )));
						}
					}
					
					var author,
						n = authors.length,
						byline = $( '.title_card > h2' );
					for ( var i = 0; i < n; i++ ) {
						author = authors[ i ];
						if ( i == 0 ) {
							byline.append( 'by ' );
						} else if ( i == ( n - 1 )) {
							if ( n > 2 ) {
								byline.append( ', and ' );
							} else {
								byline.append( ' and ' );
							}
						} else {
							byline.append( ', ' );
						}
						byline.append( author.getDisplayTitle() );
					}
					
				}
				
				var publisherUrl = scalarapi.model.bookNode.properties[ 'http://purl.org/dc/terms/publisher' ],
					publisherThumbnail = scalarapi.model.bookNode.properties[ 'http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail' ];
					
				var publisherInfo = $( '<p id="publisher-credit"></p>' );
				
				if ( publisherThumbnail != null ) {
					publisherInfo.append( '<img src="' + scalarapi.model.urlPrefix + publisherThumbnail[0].value + '" alt="Publisher logo"/>' );
				}
				
				if ( publisherUrl != null ) {
					var publisherNode = scalarapi.getNode( publisherUrl[0].value );
					if ( publisherNode != null ) {
						publisherInfo.append( ' ' + publisherNode.getDisplayTitle() );
					}
				}
				
				$( '#colophon' ).prepend( publisherInfo );
			
			},
			
			addMediaElements: function() {
			
				var viewType = currentNode.current.properties['http://scalar.usc.edu/2012/01/scalar-ns#defaultView'][0].value;
				switch (viewType) {
					
					case 'gallery':
					$('body').bind('mediaElementMediaLoaded', page.handleMediaElementMetadata);
					scalarapi.loadPage(currentNode.slug, true, function() {
						var i,node,link,
							nodes = getChildrenOfType(currentNode, 'media');
						$('article > header').after('<div id="gallery"></div>');
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
					page.mediaDetails = $.scalarmediadetails($('<div></div>').appendTo('body'));
					break;
					
					case 'structured_gallery':
					// add structured gallery media
					gallery.addMedia();
					break;
				
					default:
				  	$('body').bind('mediaElementMediaLoaded', page.handleMediaElementMetadata);
					$('a').each(function() {
					
						// resource property signifies a media link
						if ( ($( this ).attr( 'resource' ) || ( $( this ).find( '[property="art:url"]' ).length > 0 ) ) && ( $( this ).attr( 'rev' ) != 'scalar:has_note' ) && ( $( this ).attr( 'data-relation' ) == null )) {
						
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
					$('[data-relation="annotation"]').each(function() {
					
							console.log($(this));
						page.addMediaElementForLink( $(this), $(this).parent().parent() );
						//$(this).css('display', 'none');
					
					});
					
					page.mediaDetails = $.scalarmediadetails($('<div></div>').appendTo('body'));
					
					/*$('.annotation_of').each( function() {
						node = scalarapi.getNode( $( this ).attr( 'href' ) );
						if ( node != null ) {
							page.addMediaElementForLink( $( this ), $( this ).parent() );
							//$( this ).css('display', 'none');
						}
					} );*/

					break;
				
				}
			
			}
			
		};
		
		$('body').bind('setState', page.handleSetState);
		
		element.addClass('page');
		
		$( 'header' ).show();
		$( '#book-id' ).hide();
		
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
		
		if ( currentNode != null ) {
			var viewType = currentNode.current.properties['http://scalar.usc.edu/2012/01/scalar-ns#defaultView'][0].value;
			switch (viewType) {
				
				case 'splash':
				$( 'article' ).before( '<div class="blackout"></div>' );
				element.addClass('splash');
				$('h1[property="dcterms:title"]').wrap('<div class="title_card"></div>');
				//$('.title_card').append('<h2>By Steve Anderson</h2>');
				//$('.title_card').delay(500).fadeIn(2000);
				$('[property="art:url"]').hide();
				element.css('backgroundImage', $('body').css('backgroundImage'));
				$('body').css('backgroundImage', 'none');
				$('.paragraph_wrapper').remove();
				page.addRelationshipNavigation(false);
				$('.relationships').appendTo('.title_card');
				
				$( '.splash' ).delay( 1000 ).addClass( 'fade_in' ).queue( 'fx', function( next ) {
					$( '.blackout' ).remove();
					$( '.title_card' ).addClass( 'fade_in' );
					next();
				} );
				break;
				
				case 'book_splash':
				$( 'article' ).before( '<div class="blackout"></div>' );
				element.addClass('splash');
				$('h1[property="dcterms:title"]').wrap('<div class="title_card"></div>');
				$( 'h1[property="dcterms:title"]' ).html( $( '#book-title' ).html() );
				$( '.title_card' ).append('<h2></h2>');
				$('[property="art:url"]').hide();
				element.css('backgroundImage', $('body').css('backgroundImage'));
				$('body').css('backgroundImage', 'none');
				$('.paragraph_wrapper').remove();
				page.addRelationshipNavigation(false);
				$('.relationships').appendTo('.title_card');
				
				$( '.splash' ).delay( 1000 ).addClass( 'fade_in' ).queue( 'fx', function( next ) {
					$( '.blackout' ).remove();
					$( '.title_card' ).addClass( 'fade_in' );
					next();
				} );
	
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
				page.addIncomingComments();	
				page.addColophon();	  
				page.addNotes();	
				break;
				
				case 'visualization':
				var options = {parent_uri:scalarapi.urlPrefix, default_tab:'visindex'}; 
				var visualization = $('<div id="#visualization"></div>').appendTo(element);
				visualization.scalarvis(options);	
				break;
				
				case 'structured_gallery':
				page.setupScreenedBackground();
				var gallery = $.scalarstructuredgallery($('<div></div>').appendTo(element));
				page.addIncomingComments();		  	
				page.addColophon();	  	
				page.addNotes();	
				break;
				
				case 'image_header':
				$( '.page' ).css( 'padding-top', '5rem' );
				$( 'header' ).before( '<div class="image_header"><div class="title_card"></div></div>' );
				$( '.image_header' ).css( 'backgroundImage', $('body').css('backgroundImage') );
				$( '.title_card' ).append( $( 'header > h1' ) );
				$( '.title_card' ).append( '<div class="description">' + currentNode.current.description + '</div>' );
				page.setupScreenedBackground();
				page.addRelationshipNavigation(true);
				page.addIncomingComments();		  	
				page.addColophon();	  	
				page.addNotes();	
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
				page.addIncomingComments();		  	
				page.addColophon();	  	
				page.addNotes();	
				break;
			
			}
			
			addTemplateLinks($('article'), 'cantaloupe');
	
		  	$('body').addClass('body_font');
		  	$('h1, h2, h3, h4, .mediaElementFooter, #comment, .media_metadata').addClass('heading_font');
		  	
		  	/*
			$( document ).ready( function() {
				if ( !$.cookie( 'warningMessageDismissed' ) ) {
					var message = $('<div id="message" style="position: absolute; cursor: pointer; left: 20px; top: 70px; max-width: 400px; padding: 15px; z-index:99999; background-color: #fdcccb;">Warning message</div>').appendTo( 'body' );
					message.click( function() { 
						$( this ).hide(); 
						$.cookie( 'warningMessageDismissed', true, { path: '/' } );
					} );
				}
			} );
			*/
				
			$( 'body' ).bind( 'handleBook', page.handleBook );
		}
				
		return page;
	
	}

})(jQuery);