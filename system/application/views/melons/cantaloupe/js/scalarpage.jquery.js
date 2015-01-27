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

		var element = e;
		var commentDialog;

		var page = {

			options: $.extend({}, options),

			annotatedMedia: [],
			containingPaths: [],
			containingPath: null,
			containingPathNodes: [],
			pathIndex: null,

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
						$.scalarmedia(mediaelement, infoElement, { 'shy': false, 'details': page.mediaDetails, 'caption': link.attr( 'data-caption' ) });
					} else {
						$.scalarmedia(mediaelement, mediaelement.view.footer, { 'shy': !isMobile, 'details': page.mediaDetails, 'caption': link.attr( 'data-caption' ) });
					}
				}
				if (( mediaelement.model.node.current.mediaSource.contentType == 'image' ) && ( mediaelement.model.node.current.sourceFile.indexOf( 'criticalcommons.org' ) == -1 )) {
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

				// create a temporary element and remove it so we can get its width; this allows us to specify
				// the various media element widths via CSS
				var temp = $('<div class="'+size+'_dim"></div>').appendTo('.page');
				var width = parseInt(temp.width());
				temp.remove();

				var height = null;
				if (size == 'full') {
					height = maxMediaHeight;
				}
				slot = link.slotmanager_create_slot(width, height, { url_attributes: ['href', 'src'], autoplay: link.attr( 'data-autoplay' ) == 'true' });
				if (slot) {
					slotDOMElement = slot.data('slot');
					slotMediaElement = slot.data('mediaelement');
					slotMediaElement.model.element.css('visibility','hidden');
					if ($(slot).hasClass('inline')) {
						link.after(slotDOMElement);
						link.hide();
						if(size != 'full') {
  						if(!slotDOMElement.parent().hasClass('body_copy')) {
	  					  slotDOMElement.wrap('<div class="body_copy"></div>');
		  				}
							$(slotDOMElement).wrapInner('<div style="overflow:hidden"></div>');
							if(align == 'right') {
								slotMediaElement.model.element.css('float','right');
							}
							else if(align == 'left') {
								slotMediaElement.model.element.css('float','left');
							}
							else if(align == 'center') {
								slotMediaElement.model.element.css('margin-right','auto');
								slotMediaElement.model.element.css('margin-left','auto');
							}

						}
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

			// gathers info about this node's containing paths -- must be called before addHeaderPathInfo and addRelationshipNavigation
			getContainingPathInfo: function() {

				var queryVars = scalarapi.getQueryVars( document.location.href );

				page.containingPaths = currentNode.getRelatedNodes('path', 'incoming');

				// if we're on one of the containing paths, make it first in the list
				page.containingPaths.sort( function( a, b ) {
					var pathSlug;
					if ( queryVars.path ) {
						var temp = queryVars.path.split( '/' );
						pathSlug = temp[ temp.length - 1 ];
					}
					if ( a.slug == pathSlug ) {
						return -1;
					} else if ( b.slug == pathSlug ) {
						return 1;
					}
					return 0;
				});

				// get siblings and index of the path we're on
				if ( page.containingPaths.length > 0 ) {
					page.containingPath = page.containingPaths[ 0 ]; // most of the time we only care about the first containing path
					page.containingPathNodes = page.containingPath.getRelatedNodes('path', 'outgoing');
					page.containingPathIndex = page.containingPathNodes.indexOf( currentNode );
				}

			},

			addHeaderPathInfo: function() {

				// show containing path in header
				if ( page.containingPaths.length > 0 ) {
					if ( page.containingPathNodes.length > 1 ) {
						$( 'h1[property="dcterms:title"]' ).before( '<div class="caption_font path-breadcrumb"><a href="' + page.containingPath.url + '">' + page.containingPath.getDisplayTitle() + '</a> (' + ( page.containingPathIndex + 1 ) + '/' + page.containingPathNodes.length + ')</div>' );
					} else {
						$( 'h1[property="dcterms:title"]' ).before( '<div class="caption_font path-breadcrumb"><a href="' + page.containingPath.url + '">' + page.containingPath.getDisplayTitle() + '</a></div>' );
					}
				}

			},

			addRelationshipNavigation: function(showLists) {

				var button, href, section, nodes, node, link, links,
					pathOptionCount = 0,
					containingPathOptionCount = 0,
					queryVars = scalarapi.getQueryVars( document.location.href ),
					foundQueryPath = ( queryVars.path != null );

				// path back/continue buttons
				if (page.containingPaths.length > 0) {
					section = $('<section class="relationships"></section').appendTo('article');
					if ( page.containingPathNodes.length > 1 ) {
						if (page.containingPathIndex < (page.containingPathNodes.length - 1)) {

							// This option is on the current path or we don't know what path we're on
							if (( foundQueryPath && ( page.containingPath.slug == queryVars.path )) || !foundQueryPath ) {

								// continue button
								links = $( '<p></p>' );
								links.append( '<a class="nav_btn" href="' + page.containingPathNodes[page.containingPathIndex+1].url +
									'?path=' + page.containingPath.slug + '">Continue to &ldquo;' + page.containingPathNodes[page.containingPathIndex+1].getDisplayTitle() +
									'&rdquo;</a>' );
								if ( pathOptionCount == 0 ) {
									links.find( 'a' ).addClass( 'primary' );
								}

								// back button
								if ( page.containingPathIndex > 0 ) {
									links.prepend( '<a id="back-btn" class="nav_btn" href="' + page.containingPathNodes[ page.containingPathIndex - 1 ].url + '?path=' + page.containingPath.slug + '">&laquo;</a> ' );
								}
								section.append( links );
							}
							pathOptionCount++;
							containingPathOptionCount++;

						} else if (page.containingPathIndex == (page.containingPathNodes.length - 1)) {
							section.append( '<p><a id="back-btn" class="nav_btn" href="' + page.containingPathNodes[ page.containingPathIndex - 1 ].url + '?path=' + page.containingPath.slug + '">&laquo; Back to &ldquo;' + page.containingPathNodes[ page.containingPathIndex - 1 ].getDisplayTitle() + '&rdquo;</a></p>' );
						}
					}
				}

				// end-of-path continue button
				$( '[rel="scalar:continue_to"]' ).each( function() {
					var span = $( '[resource="' + $( this ).attr( 'href' ) + '"]' );
					span.hide();
					link = span.find( 'span[property="dcterms:title"] > a' );
					node = scalarapi.getNode( link.attr( 'href' ) );
					if ( page.containingPathNodes.indexOf( currentNode ) == ( page.containingPathNodes.length - 1 ) ) {
						section = $('<section class="relationships"></section').appendTo('article');
						links = $( '<p></p>' );
						links.append( '<a class="nav_btn primary" href="' + node.url + '">End of path &ldquo;' + page.containingPath.getDisplayTitle() + '&rdquo;. <br /> Continue to &ldquo;' + node.getDisplayTitle() + '&rdquo;</a>' );

						// back button
						if ( page.containingPathIndex > 0 ) {
							$( '#back-btn' ).remove();
							links.prepend( '<a id="back-btn" class="nav_btn" href="' + page.containingPathNodes[ page.containingPathIndex - 1 ].url + '?path=' + page.containingPath.slug + '">&laquo;</a> ' );
						}
						section.append( links );
						pathOptionCount++;
						containingPathOptionCount++;
					}
				} );

				var cont_btn = $('.nav_btn.primary');
				var back_btn = $('#back-btn');
				if(cont_btn.length !== 0) {
					if(back_btn.length !== 0) {
						cont_btn.parent().addClass('container');
						back_btn.wrap('<div style="padding:0;padding-right:5px;width:initial;text-align:center" class="col-md-1 col-xs-1"></div>');
						cont_btn.wrap('<div style="padding:0;" class="col-md-5 col-xs-9"></div>');

						var temp = (back_btn.parent().parent().height()-back_btn.height())/2;
						back_btn.css('padding-top',temp);
						back_btn.css('padding-bottom',temp);
						back_btn.css('vertical-align','top');
					}
				}

				// path contents
				$('.path_of').each(function() {
					if ($(this).parent().is('section')) {
						section = $(this).parent();
						section.addClass('relationships');

						// only say what kind of contents these are if both kinds are present
						if ( $('.tag_of').length > 0 ) {
							section.find('h1').text('Path contents');
						} else {
							section.find('h1').text('Contents');
						}

						section.show();
						section.find( '[property="dcterms:title"] > a' ).each( function() {
							var href = $( this ).attr( 'href' ) + '?path=' + currentNode.slug;
							$( this ).attr( 'href', href );
						});

						// hide contents if requested
						if (!showLists) {
							section.find('h1').hide();
							section.find('ol').hide();
						}

						// "begin with" button
						if ( pathOptionCount == 0 ) {
							nodes = currentNode.getRelatedNodes('path', 'outgoing');
							if (nodes.length > 0) {
								button = $( '<p><a class="nav_btn" href="' + nodes[ 0 ].url + '?path=' +
									currentNode.slug + '">Begin with &ldquo;' + nodes[0].getDisplayTitle() +
									'&rdquo;</a></p>' ).appendTo( section );
								if (( page.containingPaths.length == 0 ) || !showLists ) {
									button.find( 'a' ).addClass( 'primary' );
								}
								pathOptionCount++;
							}
						}

					}
				});

				// tag contents
				$('.tag_of').each(function() {
					if ($(this).parent().is('section')) {
						section = $(this).parent();
						section.addClass('relationships');

						// only say what kind of contents these are if both kinds are present
						if ( $('.path_of').length > 0 ) {
							section.find('h1').text('Tag contents');
						} else {
							section.find('h1').text('Contents');
						}

						section.find('ol').contents().unwrap().wrapAll('<ul></ul>');
						section.show();

						// hide contents if requested
						if (!showLists) {
							section.find('h1').hide();
							section.find('ul').hide();
						}

						// "visit random" button
						if ( pathOptionCount == 0 ) {
							nodes = currentNode.getRelatedNodes('tag', 'outgoing');
							if (nodes.length > 1) {
								section.append('<p><a class="nav_btn" href="'+nodes[Math.floor(Math.random() * nodes.length)].url+'?tag='+currentNode.slug+'">Visit a random tagged page</a></p>');
							}
						}
					}
				});

				// comments on
				$('.reply_of').each(function() {
					if ($(this).parent().is('section')) {
						section = $(this).parent();
						section.addClass('relationships');
						section.find('h1').text('Comments on');
						section.find('ol').contents().unwrap().wrapAll('<ul></ul>');
						section.show();
					}
				});

				// annotates
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
				$('article').append('<div id="incoming_comments" class="caption_font"><div id="comment_control" class="reply_link"><strong>'+((comments.length > 0) ? comments.length : '&nbsp;')+'</strong></div></div>');
				var commentDialogElement = $('<div></div>').appendTo('body');
				commentDialog = commentDialogElement.scalarcomments( { root_url: modules_uri+'/cantaloupe'} );
				$('.reply_link').click(function() {
					commentDialog.data('plugin_scalarcomments').showComments();
				});
				var queryVars = scalarapi.getQueryVars( document.location.href );
				if ( queryVars.action == 'comment_saved' ) {
					commentDialog.data('plugin_scalarcomments').showComments( true );
				}
			},

			addColophon: function() {
				$('article').append('<div id="colophon" class="caption_font"><p id="scalar-credit"><a href="http://scalar.usc.edu/scalar"><img src="' + page.options.root_url + '/images/scalar_logo_small.png" width="18" height="16"/></a> Powered by <a href="http://scalar.usc.edu/scalar">Scalar</a> | <a href="http://scalar.usc.edu/terms-of-service/">Terms of Service</a> | <a href="http://scalar.usc.edu/privacy-policy/">Privacy Policy</a> | <a href="http://scalar.usc.edu/contact/">Scalar Feedback</a></p></div>');
			},

			setupScreenedBackground: function() {
				var screen = $('<div class="bg_screen"><img src="' + page.options.root_url + '/images/1x1white_trans.png" width="100%" height="100%"/></div>').prependTo('body');
				screen.css('backgroundImage', $('body').css('backgroundImage'));
				$('body').css('backgroundImage', 'none');
			},

			addNotes: function() {

				var i, n, note, resource,
					notes = $( '.note' );

				n = notes.length;
				for ( i = 0; i < n; i++ ) {
					note = notes.eq( i );
					resource = note.attr( 'resource' );
					note.wrapInner( '<a href="javascript:;" rev="scalar:has_note" resource="' + resource + '"></a>' );
					note.find( 'a' ).click( function(e) {
						e.stopPropagation();
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

				var publisherNode = scalarapi.model.getPublisherNode();
				var publisherInfo = $( '<p id="publisher-credit"></p>' );
				if ( publisherNode != null ) {
					var publisherThumbnail = publisherNode.properties[ 'http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail' ];
					if ( publisherThumbnail != null ) {

						var link = $( '<div>' + publisherNode.title + '</div>' ).find( 'a' );
						if ( link.length ) {
							 link.eq( 0 ).html( '<img src="' + scalarapi.model.urlPrefix + publisherThumbnail[0].value + '" alt="Publisher logo"/>' );
							 publisherInfo.append( link.eq( 0 ) );
						} else {
							 publisherInfo.append( '<img src="' + scalarapi.model.urlPrefix + publisherThumbnail[0].value + '" alt="Publisher logo"/>' );
						}

					}
					publisherInfo.append( ' ' + (publisherNode.title?publisherNode.title:'') );
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

					default:
					if ( viewType == 'structured_gallery' ) {
						gallery.addMedia();
					}
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
								parent = $(this).closest('.body_copy');
							}

							$(this).addClass('media_link');

							page.addMediaElementForLink($(this), parent);

							// trigger media playback when links are clicked on
							$( this ).click( function( e ) {

								e.preventDefault();
								e.stopPropagation();

								var mediaelement = $( this ).data( 'mediaelement' );

								if ( mediaelement != null ) {
									if ( mediaelement.is_playing() ) {
										mediaelement.pause();
									} else {
										$('a.media_link').each(function() {
											var me = $( this ).data( 'mediaelement' );
											if ( me != null  ) {
												if(me === mediaelement) {
													mediaelement.play();
												}
												else if ( me.is_playing() ) {
													me.pause();
												}
											}
										})
									}
								}

								var $mediaelement = mediaelement.model.element;

								var scroll_buffer = 100;
								var scroll_time = 750;
								var $body = $('html,body');

								//scroll to media element when link is clicked
								if(!(($mediaelement.offset().top + $mediaelement.height()) <= (-$body.offset().top + $body.height()) &&
									$mediaelement.offset().top >= (-$body.offset().top))) {
									$body.animate({
										scrollTop: $mediaelement.offset().top-scroll_buffer
									},scroll_time);
								}

								// do not provide label over media if image height is too small
								var min_height = 50;
                				var mediaHeight = $mediaelement.find('.mediaObject').height();
								if(mediaHeight >= min_height) {
									var $media_label = $mediaelement.find('.scalar-media-label');
									if($media_label.length == 0) {

										var label = '<span class="scalar-media-label label label-default">'+mediaelement.model.node.current.title+'</span>'
										$media_label = $(label).appendTo($mediaelement);

										var font_size = parseInt($media_label.css('font-size').replace('px',''));

										var font_inc  = 300;
										var font_mult = 3;
										font_size = (font_size + Math.floor($mediaelement.width()/font_inc)*font_mult)+'px';

										var label_style = 'white-space:normal;position:absolute;max-width:'+$mediaelement.width()+'px;font-size:'+font_size;
										$media_label.attr('style',label_style);
										$media_label.css('top',((mediaHeight-$media_label.outerHeight())/2));
										$media_label.css('left',(($mediaelement.width()-$media_label.outerWidth())/2));
									}
									var label_hide_delay = 3000;
									var label_fade_delay = 400;
									$media_label.show().delay(label_hide_delay).fadeOut(label_fade_delay);
								}
							} );

						}
					});

					// if this is a media page, embed the media at 'full' size
					if ( $('[resource="' + currentNode.url + '"][typeof="scalar:Media"]').length > 0 ) {
						var link = $( '<a href="'+currentNode.current.sourceFile+'" resource="'+currentNode.slug+'" data-size="full"></a>' ).appendTo( '[property="sioc:content"]' );
						link.wrap( '<div></div>' );
						page.addMediaElementForLink( link, link.parent() );
						link.css('display', 'none');
					};

					$('[data-relation="annotation"]').each(function() {
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

			},

			addMediaElementsForElement: function( element ) {
				element.find('a').each(function() {

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
				element.find('[data-relation="annotation"]').each(function() {
					page.addMediaElementForLink( $(this), $(this).parent().parent() );
				});
			}

		};

		$('body').bind('setState', page.handleSetState);

		element.addClass('page');

		$( 'header' ).show();
		$( '#book-id' ).hide();
		$( '[property="scalar:fullname"]' ).hide();
		$( '[property="dcterms:description"]' ).hide();

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

			if ( viewType != 'iframe' ) {
				wrapOrphanParagraphs($('[property="sioc:content"]'));
		  	}

		  	$('[property="scalar:defaultView"]').hide();
		  	$('[property="sioc:content"]').children('p,div').addClass('body_copy').wrap('<div class="paragraph_wrapper"></div>');

			page.getContainingPathInfo();
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
				window.setTimeout(function(){
					$( '.splash' ).delay( 1000 ).addClass( 'fade_in' ).queue( 'fx', function( next ) {
						$( '.blackout' ).remove();
						$( '.title_card' ).addClass( 'fade_in' );
						next();
					} );
				},200);
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
				page.addHeaderPathInfo();
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
				page.addHeaderPathInfo();
				page.addIncomingComments();
				page.addColophon();
				page.addNotes();
				break;

				case 'iframe':
				$( 'h1' ).hide();
				$( '.page' ).css( 'padding-top', '5.0rem' );
				break;

				case 'image_header':
				$( '.page' ).css( 'padding-top', '5rem' );
				$( 'article > header' ).before( '<div class="image_header"><div class="title_card"></div></div>' );
				$( '.image_header' ).css( 'backgroundImage', $('body').css('backgroundImage') );
				$( '.title_card' ).append( $( 'header > h1' ) );
				$( '.title_card' ).append( '<div class="description">' + currentNode.current.description + '</div>' );
				page.setupScreenedBackground();
				page.addHeaderPathInfo();
				page.addRelationshipNavigation(true);
				page.addIncomingComments();
				page.addColophon();
				page.addNotes();
				break;

				default:
			  	//$('body').bind('mediaElementMediaLoaded', page.handleMediaElementMetadata);

			  	switch ( viewType ) {

			  		// look for related geographic metadata and use it to build a Google Map
			  		case "google_maps":

			  		$( '.page' ).css( 'padding-top', '5.0rem' );
			  		$( 'header > h1' ).before( '<div id="google-maps" class="maximized-embed"></div>' );

					scalarapi.loadPage( currentNode.slug, true, function() {

						// create map
						var mapOptions = {
							center: latlng,
							zoom: 8,
							mapTypeId: google.maps.MapTypeId.ROADMAP
						}
						var map = new google.maps.Map( document.getElementById( 'google-maps' ), mapOptions );

						// create info window
						var infoWindow = new google.maps.InfoWindow({
							content: contentString,
							maxWidth: 400
						});

						var marker,
							markers = [],
							foundError = false;;

						// if the current page has the spatial property, then
						if ( currentNode.current.properties[ 'http://purl.org/dc/terms/spatial' ] != null ) {

							var temp = currentNode.current.properties[ 'http://purl.org/dc/terms/spatial' ][ 0 ].value.split( ',' );

							// error checking
							if (( temp.length != 2 ) || (( isNaN( parseFloat( temp[ 0 ] )) || isNaN( parseFloat( temp[ 1 ] ))))) {
								foundError = true;

							} else {
								var latlng = new google.maps.LatLng( parseFloat( temp[ 0 ] ), parseFloat( temp[ 1 ] ) );

								map.setCenter( latlng );

								// add marker and info window for current page
								if ( currentNode.current.description != null ) {
									contentString = '<div class="google-info-window caption_font"><h2>' + currentNode.getDisplayTitle() + '</h2>' + currentNode.current.description + '</div>';
								} else {
									contentString = '<div class="google-info-window caption_font"><h2>' + currentNode.getDisplayTitle() + '</h2></div>';
								}
								marker = new google.maps.Marker({
								    position: latlng,
								    map: map,
								    html: contentString,
								    title: currentNode.getDisplayTitle()
								});
								markers.push( marker );
								google.maps.event.addListener( marker, 'click', function() {
									infoWindow.setContent( this.html );
									infoWindow.open( map, this );
								});
							}

						}

						// get path and tag contents of this page
						var contents = [];
						contents = contents.concat( currentNode.getRelatedNodes( 'path', 'outgoing' ) );
						contents = contents.concat( currentNode.getRelatedNodes( 'tag', 'outgoing' ) );
						var i, node, contentString,
							n = contents.length;

						// add markers for each content element that has the spatial property
						for ( i = 0; i < n; i++ ) {

							node = contents[ i ];

							if ( node.current.properties[ 'http://purl.org/dc/terms/spatial' ] != null ) {
								var temp = node.current.properties[ 'http://purl.org/dc/terms/spatial' ][ 0 ].value.split( ',' );

								// error checking
								if (( temp.length != 2 ) || (( isNaN( parseFloat( temp[ 0 ] )) || isNaN( parseFloat( temp[ 1 ] ))))) {
									// nothing

								} else {
									var latlng = new google.maps.LatLng( parseFloat( temp[ 0 ] ), parseFloat( temp[ 1 ] ) );
									if ( markers.length == 0 ) {
										map.setCenter( latlng );
									}
									if ( node.current.description != null ) {
										contentString = '<div class="google-info-window caption_font"><h2><a href="' + node.url + '">' + node.getDisplayTitle() + '</a></h2>' + node.current.description + '</div>';
									} else {
										contentString = '<div class="google-info-window caption_font"><h2><a href="' + node.url + '">' + node.getDisplayTitle() + '</a></h2></div>';
									}
									marker = new google.maps.Marker({
									    position: latlng,
									    map: map,
									    html: contentString,
									    title: node.getDisplayTitle()
									});
									markers.push( marker );
									google.maps.event.addListener( marker, 'click', function() {
										infoWindow.setContent( this.html );
										infoWindow.open( map, this );
									});

									// if any valid geo locations are found, it's ok to draw the map
									foundError = false;
								}
							}
						}

						// no valid coords found on page or its children
						if ( foundError ) {
							$( '#google-maps' ).append( '<div class="alert alert-danger" style="margin: 1rem;">Scalar couldn’t find any valid geographic metadata associated with this page.</div>' );

						// no coords of any kind found
						} else if ( markers.length == 0 ) {
							$( '#google-maps' ).append( '<div class="alert alert-danger" style="margin: 1rem;">Scalar couldn’t find any geographic metadata associated with this page.</div>' );
						}

						// adjust map bounds to marker bounds
						var bounds = new google.maps.LatLngBounds();
						$.each( markers, function ( index, marker ) {
							bounds.extend( marker.position );
						});
						if ( markers.length > 1 ) {
							map.fitBounds( bounds );
						}

					}, function() {
						console.log('an error occurred while retrieving additional metadata.');
					}, 1, true);
					break;

					case "vis":
			  		case "vispath":
			  		case "vismedia":
			  		case "visindex":
			  		case "visradial":
			  		case "vistag":
					var options = {
						parent_uri: scalarapi.model.urlPrefix,
						default_tab: viewType,
						minimal: true
					};
					if ( viewType == "vis" ) {
						options.default_tab = "visindex";
					}
					var visualization = $(  '<div id="#visualization"></div>' );
					$( 'article > header > h1' ).css( 'margin-bottom', '1.2rem' );
					$( 'article > header' ).after( visualization );
					visualization.scalarvis( options );
					break;

			  	}

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

				page.addHeaderPathInfo();
				page.addRelationshipNavigation(true);
				page.addIncomingComments();
				page.addColophon();
				page.addNotes();
				break;

			}

			addTemplateLinks($('article'), 'cantaloupe');

		  	$('body').addClass('body_font');
		  	$('h1, h2, h3, h4, .mediaElementFooter, #comment, .media_metadata').addClass('heading_font heading_weight');

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

			$('.note_viewer').click(function(e) {
				e.stopPropagation();
			})

			$( 'body').click(function() {
				$.each($('.note_viewer'), function() {
					page.hideNote(this);
				})
			})
		}

		return page;

	}

})(jQuery);