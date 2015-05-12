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
			elementsWithIncrementedData: [],
			pathIndex: null,
			gallery: null,

			mobileWidth: 520, // this should be set to the same value as the mobile (tiny.css) breakpoint in responsive.css
			adaptiveMedia: 'full',

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
				if ( page.elementsWithIncrementedData.indexOf( selection ) == -1 ) {
					page.elementsWithIncrementedData.push( selection );
				}
				selection.data(data, value);
				return value;
			},

			clearIncrementedData: function() {

				var i,
					n = page.elementsWithIncrementedData.length;

				for ( i = 0; i < n; i++) {
					page.elementsWithIncrementedData[ i ].removeData();
				}
				page.elementsWithIncrementedData = [];
			},

			/**
			 * Called when a mediaelement instance has gathered metadata about the media.
			 *
			 * @param {Object} event			The event object.
			 * @param {Object} link				The link which spawned the mediaelement, and which contains its data.
			 */
			handleMediaElementMetadata: function( event, link ) {

				var mediaelement = link.data('mediaelement'),
					pageWidth = parseInt( $( '.page' ).width() ),
					mediaWidth = mediaelement.model.element.find( '.mediaObject' ).width(),
					isInline = link.hasClass( "inline" ),
					size = link.attr('data-size'),
					isFullWidth = false;

				if (page.adaptiveMedia == 'mobile') {
					size = 'full';
				}

				// calculate the size of the content area minus margins
				temp = $('<div class="body_copy"></div>');
				temp.appendTo('.page');
				var pageWidthMinusMargins = pageWidth - ( parseInt( temp.css( 'padding-left' ) ) * 2 );
				var bodyCopyWidth = temp.width();
				temp.remove();

				temp = $( '<div class="small_dim"></div>') ;
				temp.appendTo( '.page' );
				var minTabWidth = parseInt( temp.width() );
				temp.remove();

				//console.log( "size: " + mediaelement.model.options.size + " media: " + mediaWidth + " page w/ margins: " + pageWidthMinusMargins + " page: " + pageWidth );

				// 'full' and 'native' sized media get special sizing treatment
				if ( size == 'native' || size == 'full' ) {

					// if the media is the full width of the page, then remove any align styles
					if ( mediaWidth >= pageWidth ) {
						mediaelement.model.element.parent().removeClass( 'left right' );
						isFullWidth = true;
					
					// if the media is smaller than than the width of the page, but larger than the width of the
					// page minus its margins, then center it and add pillarboxing to separate it from the 
					// rest of the page
					} else if (size == 'full' || mediaWidth > bodyCopyWidth ) {
						mediaelement.model.element.css( { 
							'margin-right': 'auto',
							'margin-left': 'auto',
							'float':'none'
						});
						mediaelement.model.element.find('.mediaObject').css( { 
							'margin-right': 'auto',
							'margin-left': 'auto',
						});
						mediaelement.model.element.parent().addClass( "pillarbox" );
						mediaelement.model.element.parent().removeClass( 'left right' );
						isFullWidth = true;

					// otherwise, left align it with the body copy
					} else if (isInline && mediaelement.model.element.parents('.body_copy').length == 0) {
						link.data('slot').wrap('<div class="body_copy"></div>');
					}

					// If the media is smaller than the "small" size, remove tabs below media
					if ( mediaWidth < minTabWidth) {
						mediaelement.model.options.solo = true;
					}


					if(isFullWidth) {
						// full width native elements should have no body_copy wrapping them
						// and they should come after their link, not before
						if ( size == 'native' ) {
							// remove body_copy wrapper for inline elements
							if(isInline) {
								// Don't unwrap the inline element if it's parent is the main content wrapper
								if(link.data('slot').parent('[property="sioc:content"]').length == 0) {
									link.data('slot').unwrap();
								}

								link.data('slot').css( 'clear', 'both' );

							// align full size elements below their links instead of above
							} else {
								link.data('slot').insertAfter(link.parents('.paragraph_wrapper'));
							}

							
						}
					}		
				}

				// the "solo" option is used when showing media items that don't get media details tabs beneath
				if ( mediaelement.model.options.solo != true ) {
					if (isFullWidth) {

						// create and add the element where media tabs will appear
						var infoElement = $('<div></div>');
						mediaelement.model.element.parent().after(infoElement);

						// make sure the tags are aligned left with the body copy
						infoElement.addClass( "body_copy" );

						// modify default media element design
						mediaelement.model.element.css( 'marginBottom', '0' );
						mediaelement.view.footer.hide();

						// add the tabs
						$.scalarmedia( mediaelement, infoElement, { 
							'shy': false, 
							'details': page.mediaDetails, 
							'caption': link.attr( 'data-caption' ) 
						});

					} else {

						// -- will this ever happen?
  						// make sure the tags are aligned left with the body copy
						// if ( size == "full" ) {
							// mediaelement.view.footer.addClass( "body_copy" );
						// }

						// add the tabs
						$.scalarmedia( mediaelement, mediaelement.view.footer, { 
							'shy': ( !isMobile && !link.hasClass( 'media-page-link' ) ), 
							'details': page.mediaDetails, 
							'caption': link.attr( 'data-caption' )
						});
					}
				} else {
					if (isFullWidth) {
						// modify default media element design
						mediaelement.model.element.css( 'marginBottom', '0' );
						mediaelement.view.footer.hide();					
					}
				}

				// make images that don't come from Critical Commons open the image file in a new tab when clicked
				if (( mediaelement.model.node.current.mediaSource.contentType == 'image' ) && ( mediaelement.model.node.current.sourceFile.indexOf( 'criticalcommons.org' ) == -1 )) {
					mediaelement.model.element.find( '.mediaObject' ).click( function() {
						window.open( mediaelement.model.node.current.sourceFile, 'popout' );
					} ).css( 'cursor', 'pointer' );
				}

				// show the media
				mediaelement.model.element.css( 'visibility', 'visible' );

				// add the media icon next to the link
				link.addClass( 'texteo_icon' );
				link.addClass( 'texteo_icon_' + mediaelement.model.node.current.mediaSource.contentType );

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

			addMediaElementForLink: function( link, parent ) {
				var inline = link.hasClass( 'inline' ),
					size = link.attr( 'data-size' ),
					align = link.attr( 'data-align' ),
					typeLimits = {
						// Add more exceptions to height limitations if needed
						
						// Images can be larger than the window, but still give them a limit so that very long narrow images don't span too long
						'image':$(window).height()*1.3 ,
						// The default for media should be to limit their size to fit within the bounds of the window
						'default':$(window).height()*0.75, 
					};

				// default alignment is 'right'
				if ( align == undefined ) {
					align = 'right';
				}

				// on small screens, all media are set to 'full' size
				if ( page.adaptiveMedia == 'mobile' ) {
					size = 'full';

				// default size is 'medium'
				} else if ( size == undefined ) {
					size = 'medium';
				}

				var pageWidth = parseInt( $( '.page' ).width() );

				// calculate the size of the content area minus margins
				temp = $('<div class="body_copy"></div>'); 
				temp.appendTo('.page');
				var bodyCopyWidth = parseInt( temp.width() );
				temp.remove();

				// create a temporary element and remove it so we can get its width; this allows us to specify
				// the various media element widths via CSS
				var temp = $( '<div class="' + size + '_dim"></div>') ;
				temp.appendTo( '.page' );
				var width = parseInt( temp.width() );
				temp.remove();

				// inline media elements can't get bigger than the width of the body copy
				if (inline) {
					// we want 'large' inline media to be as wide as the text
					if (size == 'large') {
						width = bodyCopyWidth;
					}
				}

				// media at 'full' size get a maximum height
				var height = null;
				if ( size == 'full' || size == 'native') {
					// eventually we want to add a conditional here so that videos don't get larger
					// than the height of the page, but other items (like images) can
					height = maxMediaHeight; // this varies depending on window size
				}

				// create the slot where the media will be added
				slot = link.slotmanager_create_slot( 
					width, height, 
					{ 
						url_attributes: [ 'href', 'src' ], 
						autoplay: link.attr( 'data-autoplay' ) == 'true',
						solo: link.attr( 'data-caption' ) == 'none',
						size: size,
						typeLimits: typeLimits,
						deferTypeSizing:true
					});

				// if the slot was successfully created,
				if ( slot ) {

					// hide the media element until we get it fully set up (after its metadata has loaded)
					slotDOMElement = slot.data('slot');
					slotMediaElement = slot.data('mediaelement');
					slotMediaElement.model.element.css( 'visibility', 'hidden' );

					// if this is an inline media element, then
					if ( inline ) {

						// hide its originating link (which we created dynamically anyway)
						link.after( slotDOMElement );
						link.hide();

						if ( size != 'full' ) {

							// wrap the media in a body copy element so its alignment happens inside the
							// dimensions of the body copy
							if(!slotDOMElement.parent().hasClass('body_copy')) {
								slotDOMElement.wrap('<div class="body_copy"></div>');
							}

							// prevent scroll bars
							$(slotDOMElement).wrapInner('<div style="overflow:hidden"></div>');

							// align the media appropriately
							if( align == 'right' ) {
								slotMediaElement.model.element.css( 'float', 'right' );
							} else if ( align == 'left' ) {
								slotMediaElement.model.element.css( 'float', 'left' );
							} else if ( align == 'center' ) {
								slotMediaElement.model.element.css( 'margin-right', 'auto' );
								slotMediaElement.model.element.css( 'margin-left', 'auto' );
							}

						}

					// if this is not an inline media element, and its size isn't set to 'full', then
					} else if ( size != 'full' ) {

						// put the media before its linking text, and align it appropriately
						parent.before( slotDOMElement );
						slotDOMElement.addClass( align );

						// if this is the top-most linked media, then align it with the top of its paragraph
						count = page.incrementData( parent, align + '_count' );
						if ( count == 1 ) {
							slotDOMElement.addClass('top');
						}
		
					// if this is not inline media element, and its size is set to 'full', then put the media after its linking text
					} else {
						parent.after( slotDOMElement );
						slotDOMElement.addClass( 'full' );
					}
			  	}

			},

			// gathers info about this node's containing paths -- must be called before addHeaderPathInfo and addRelationshipNavigation
			getContainingPathInfo: function() {

				var queryVars = scalarapi.getQueryVars( document.location.href ),
					currentNode = scalarapi.model.getCurrentPageNode();

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

			addRelationshipNavigation: function( showLists, showParentNav, showChildNav, showLateralNav, isCentered ) {

				var button, href, section, nodes, node, link, links, selfType,
					currentNode = scalarapi.model.getCurrentPageNode(),
					pathOptionCount = 0,
					containingPathOptionCount = 0,
					queryVars = scalarapi.getQueryVars( document.location.href ),
					foundQueryPath = ( queryVars.path != null );

				if ( currentNode.baseType == 'http://scalar.usc.edu/2012/01/scalar-ns#Composite' ) {
					selfType = 'page';
				} else if ( currentNode.baseType == 'http://scalar.usc.edu/2012/01/scalar-ns#Media' ) {
					selfType = 'media';
				} else {
					selfType = 'content';
				}

				// path back/continue buttons
				if (( page.containingPaths.length > 0 ) && showLateralNav ) {
					section = $('<section class="relationships"></section');
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
					if ( section.children().length > 0 ) {
						$('#footer').before( section );
					}
				}

				// end-of-path continue button
				if ( showLateralNav ) {
					$( '[rel="scalar:continue_to"]' ).each( function() {
						var href = $( this ).attr( 'href' );
						var span = $( 'header > [resource="' + href + '"]' );
						span.hide();
						link = span.find( 'span[property="dcterms:title"] > a' );
						node = scalarapi.getNode( link.attr( 'href' ) );
						if (( page.containingPathNodes.length > 0 ) && ( page.containingPathNodes.indexOf( currentNode ) == ( page.containingPathNodes.length - 1 ) )) {
							section = $('<section class="relationships"></section');
							$( "#footer" ).before( section );
							links = $( '<p></p>' );
							links.append( '<a class="nav_btn primary" href="' + node.url + '">End of path &ldquo;' + page.containingPath.getDisplayTitle() + '&rdquo;; <br /> Continue to &ldquo;' + node.getDisplayTitle() + '&rdquo;</a>' );

							// back button
							if ( page.containingPathIndex > 0 ) {
								$( '#back-btn' ).parents( 'section' ).remove(); // remove the intra-path back button and its enclosing section
								links.prepend( '<a id="back-btn" class="nav_btn" href="' + page.containingPathNodes[ page.containingPathIndex - 1 ].url + '?path=' + page.containingPath.slug + '">&laquo;</a> ' );
							}
							section.append( links );
							pathOptionCount++;
							containingPathOptionCount++;
						}
					} );
				} else {
					// hide continue_to metadata
					$( '[rel="scalar:continue_to"]' ).each( function() {
						var href = $( this ).attr( 'href' );
						$( 'span[resource="' + href + '"]' ).hide();
					});					
				}

				// if relationship nav isn't centered, add bootstrap column formatting to help
				// accommodate long labels that wrap to multiple lines (if it is centered, then
				// we likely aren't showing lateral relationship nav anyway so don't worry about it)
				if ( !isCentered ) {
					var cont_btn = $('.nav_btn.primary');
					var back_btn = $('#back-btn');
					if(cont_btn.length !== 0) {
						if(back_btn.length !== 0) {
							cont_btn.parent().addClass('container');
							back_btn.wrap('<div style="padding:0;padding-right:1px;width:initial;text-align:center" class="col-md-1 col-xs-1"></div>');
							cont_btn.wrap('<div style="padding:0;" class="col-md-5 col-xs-9"></div>');

							var temp = (back_btn.parent().parent().height()-back_btn.height())/2;
							back_btn.css('padding-top',temp);
							back_btn.css('padding-bottom',temp);
							back_btn.css('vertical-align','top');
						}
					}
				}

				// path contents
				$('.path_of').each(function() {
					if ($(this).parent().is('section')) {

						section = $(this).parent();
						section.addClass('relationships');
						section.show();

						if ( showLists ) {

							section.find('h1').text('Contents');

							section.find( '[property="dcterms:title"] > a' ).each( function() {
								var href = $( this ).attr( 'href' ) + '?path=' + currentNode.slug;
								$( this ).attr( 'href', href );
							});	

						} else {
							section.find('h1').hide();
							section.find('ol').hide();
						}

						// "begin with" button
						if (( pathOptionCount == 0 ) && showChildNav ) {
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
						section.find('h1').text('This page is a tag of:');
						section.find('ol').contents().unwrap().wrapAll('<ul></ul>');
						section.show();

						// hide contents if requested
						if (!showLists) {
							section.find('h1').hide();
							section.find('ul').hide();
						}

						// "visit random" button
						if (( pathOptionCount == 0 ) && showChildNav ) {
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
						section.find('h1').text('This ' + selfType + ' comments on:');
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
						section.find('ol').contents().unwrap().wrapAll('<ul class="annotation_of"></ul>');

						// add extents to title of annotated media
						section.find( 'span[property="dcterms:title"] > a' ).each( function() {
							node = scalarapi.getNode( $( this ).attr( 'href' ) );
							var i, relation,
								n = node.incomingRelations.length;
							for ( i = 0; i < n; i++ ) {
								relation = node.incomingRelations[ i ];
								if ( relation.body == currentNode ) {
									$( this ).parent().append( "(" + relation.startString + relation.separator + relation.endString + ")" );
								}
							}
							//age.annotatedMedia.push( node );
						} );
						/*page.loadNextAnnotatedMedia();*/

						section.show();
					}
				});

				// show items that tag this page
				if ( showParentNav ) {
					var hasTags = $( ".has_tags" );
					hasTags.siblings('h1').text('This ' + selfType + ' is tagged by:');
					$( ".relationships" ).eq( 0 ).before( hasTags.parent() );
					hasTags.parent().wrap( '<section class="relationships"></section>' );
					hasTags.unwrap();		
				}

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
				var comments = scalarapi.model.getCurrentPageNode().getRelatedNodes('comment', 'incoming');
				//$('article').append('<div id="footer"><div id="comment" class="reply_link">'+((comments.length > 0) ? comments.length : '&nbsp;')+'</div><div id="footer-right"></div></div>');
				$('#footer').before('<div id="incoming_comments" class="caption_font"><div id="comment_control" class="reply_link"><strong>'+((comments.length > 0) ? comments.length : '&nbsp;')+'</strong></div></div>');
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
				$('#footer').append('<div id="colophon" class="caption_font"><p id="scalar-credit"><a href="http://scalar.usc.edu/scalar"><img src="' + page.options.root_url + '/images/scalar_logo_small.png" width="18" height="16"/></a> Powered by <a href="http://scalar.usc.edu/scalar">Scalar</a> | <a href="http://scalar.usc.edu/terms-of-service/">Terms of Service</a> | <a href="http://scalar.usc.edu/privacy-policy/">Privacy Policy</a> | <a href="http://scalar.usc.edu/contact/">Scalar Feedback</a></p></div>');
			},

			addVersionInfo: function() {
	            if ( page.is_author || page.is_commentator || page.is_reviewer ) {
					$('#footer').append('<div id="version-info" class="caption_font"><p><a href="">Version editor</a> | <a href="">Version history</a> | <a href="">Version metadata</a></p></div>');
	            }
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

				var viewType = scalarapi.model.getCurrentPageNode().current.properties['http://scalar.usc.edu/2012/01/scalar-ns#defaultView'][0].value;

				// add book authors if this is a book splash page
				if ( viewType == 'book_splash' ) {

					var i, n,
						owners = scalarapi.model.getBookNode().properties[ 'http://rdfs.org/sioc/ns#has_owner' ],
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
					var publisherThumbnail = publisherNode.thumbnail;
					if ( publisherThumbnail != null ) {

						var link = $( '<div>' + publisherNode.title + '</div>' ).find( 'a' );
						if ( link.length ) {
							 link.eq( 0 ).html( '<img src="' + publisherThumbnail + '" alt="Publisher logo"/>' );
							 publisherInfo.append( link.eq( 0 ) );
						} else {
							 publisherInfo.append( '<img src="' + publisherThumbnail + '" alt="Publisher logo"/>' );
						}

					}
					publisherInfo.append( ' ' + (publisherNode.title?publisherNode.title:'') );
				}
				$( '#colophon' ).before( publisherInfo );

			},

			addMediaElements: function() {

				var currentNode = scalarapi.model.getCurrentPageNode(),
					viewType = currentNode.current.properties['http://scalar.usc.edu/2012/01/scalar-ns#defaultView'][0].value,
					extension = scalarapi.getFileExtension( window.location.href );

				// Using defaultView rather than <link id="view" /> means that a view can not be chosen via URL extension,
				// but rather only by setting it as the default view for the page.  Since 'annotation_editor' and 'edit' views
				// can only be called by extension, then they need to be special cased here ~Craig
				
				if ( 'annotation_editor' == extension) {
					
					if ( $('[resource="' + currentNode.url + '"][typeof="scalar:Media"]').length > 0 ) {
						var approot = $('link#approot').attr('href');
						$('head').append('<link rel="stylesheet" type="text/css" href="'+approot+'views/widgets/annobuilder/annobuilder.css">');
						$.getScript(approot+'views/widgets/annobuilder/jquery.annobuilder.js', function() {
							var content = $( 'article > span[property="sioc:content"]' );
							content.prepend('<br clear="both" />');
							var link = $( '<a href="'+currentNode.current.sourceFile+'" resource="'+currentNode.slug+'" data-align="left" class="media-page-link" data-caption="none" data-size="native"></a>' ).prependTo(content);
							link.wrap( '<div></div>' );
							page.addMediaElementForLink( link, link.parent() );
							link.css('display', 'none');	
							$('.annobuilder:first').annobuilder( {link:link} ); 
						});
					} else {
						$('article > span[property="sioc:content"]').append('<div>This is not a media page.</div>');
					}
					
				} else if ( 'edit' == extension) {
					
					console.log('edit');  // TODO
				
				} else if ( '' == extension ) {

					switch (viewType) {

						case 'gallery':
						scalarapi.loadPage(currentNode.slug, true, function() {
							var i,node,link,
								nodes = getChildrenOfType(currentNode, 'media');
							$('article > header').after('<div id="gallery"></div>');
							page.gallery = $('#gallery');
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

						case "splash":
						case "book_splash":
						case "meta":
						case "versions":
						case "history":
						// these views don't get media
						break;

						default:
						if ( viewType == 'structured_gallery' ) {
							page.gallery.addMedia();
						}
						$( 'article > span[property="sioc:content"],.relationships > .annotation_of' ).find( 'a' ).each(function() {

							if (( ( $( this ).attr( 'resource' ) != null ) || // linked media
								( $( this ).find( '[property="art:url"]' ).length > 0 ) || // inline media
								(( $( this ).parents( '.annotation_of' ).length > 0 ) && ( $( this ).parent( 'span[property="dcterms:title"]' ).length > 0 ))) // annotated media 
								&& ( $( this ).attr( 'rev' ) != 'scalar:has_note' ) && ( $( this ).attr( 'data-relation' ) == null )) {

								var slot, slotDOMElement, slotMediaElement, count, parent,
									currentNode = scalarapi.model.getCurrentPageNode();

								if ($(this).attr('resource') == undefined) {

									// inline media (first time)
									if ( $(this).attr('href') == undefined ) {
										$(this).attr('href', currentNode.current.sourceFile);
										$(this).attr('resource', currentNode.slug);
										$(this).attr('data-size', 'full');
										parent = $(this);

									// inline media (subsequent, after page resize)
									} else if ( $(this).attr('href') == currentNode.current.sourceFile ) {
										parent = $(this);

									// annotated media link (as appears on an annotation page)
									} else {
										var annotatedMedia = currentNode.getRelatedNodes( "annotation", "outgoing" );
										var i, node, annotationURL,
											n = annotatedMedia.length;
										for ( i = 0; i < n; i++ ) {
											node = annotatedMedia[ i ];
											annotationURL = node.current.sourceFile + "#" + currentNode.slug;

											// process the link for the first time
											if ( node.url == $(this).attr('href') ) {
												$(this).attr('href', node.current.sourceFile + "#" + currentNode.slug );
												$(this).attr('resource', node.slug);
												$(this).attr('data-size', 'full');
												parent = $(this).closest('section');
												break;

											// if the link has already been processed, then we just need its parent
											// (for example if the user just resized the page)
											} else if ( $(this).attr('href') == annotationURL ) {
												parent = $(this).closest('section');
												break;
											}
										}
									}
									$( this ).addClass( "resource-added" );
									
								// standard media link
								} else {
									parent = $(this).closest('.body_copy');
								}

								$(this).addClass('media_link');

								// uncomment to cause any paragraph with a media link to clear both (unless it contains a .clearnone)
								if ( $( this ).parents( '.paragraph_wrapper' ).find( '.clearnone' ).length == 0 ) {
									$( this ).parents( '.paragraph_wrapper' ).addClass( 'clearboth' );
								}

								page.addMediaElementForLink($(this), parent);

								// trigger media playback when links are clicked on
								$( this ).click( function( e ) {

									e.preventDefault();
									e.stopPropagation();

									var mediaelement = $( this ).data( 'mediaelement' );

									if ( mediaelement != null ) {

										// if this is an annotation link, then seek to the annotation and play
										// the media if it isn't already playing
										var annotationURL = $( this ).data( 'targetAnnotation' );
										if ( annotationURL != null ) {
											
											mediaelement.seek( mediaelement.model.initialSeekAnnotation );
											if (( mediaelement.model.mediaSource.contentType != 'document' ) && ( mediaelement.model.mediaSource.contentType != 'image' )) {
					              				setTimeout(function() {
					                				if(!mediaelement.is_playing()) {
					      								mediaelement.play();
					                				}
					              				},250);
											}

										} else if ( mediaelement.is_playing() ) {
											mediaelement.pause();
										} else {
											mediaelement.play();
										}

										// pause all other media on the page
										$( 'a.media_link' ).each(function() {
											var me = $( this ).data( 'mediaelement' );
											if ( me != null ) {
												if ( me !== mediaelement ) {
													me.pause();
												}
											}
										});
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
										var label_hide_delay = 1500;
										var label_fade_delay = 400;
										$media_label.show().delay(label_hide_delay).fadeOut(label_fade_delay);
									}
								} );

							}
						});

						// if this is a media page, embed the media at native size
						if ( $('[resource="' + currentNode.url + '"][typeof="scalar:Media"]').length > 0 ) {
							var link = $( '<a href="'+currentNode.current.sourceFile+'" resource="'+currentNode.slug+'" data-align="left" class="media-page-link" data-size="native"></a>' ).appendTo( 'article > span[property="sioc:content"]' );
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
					
				} //if(extension)

			},

			addMediaElementsForElement: function( element ) {
				element.find('a').each(function() {

					// resource property signifies a media link
					if ( ($( this ).attr( 'resource' ) || ( $( this ).find( '[property="art:url"]' ).length > 0 ) ) && ( $( this ).attr( 'rev' ) != 'scalar:has_note' ) && ( $( this ).attr( 'data-relation' ) == null )) {

						var slot, slotDOMElement, slotMediaElement, count, parent,
							currentNode = scalarapi.model.getCurrentPageNode();

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
			},

			handleMediaResize: function() {

				// remove elements that were added the last time
				// the page was parsed for media to show
				$( '.slot' ).remove();
				$( '.mediainfo' ).remove();
				$( '.media-page-link' ).remove();

				page.clearIncrementedData();
				
				$('a.media_link').each(function() {
					$( this ).removeData( "mediaelement" );
					$( this ).off();
					if ( $( this ).hasClass( "resource-added" ) ) {
						$( this ).removeAttr( "resource" );
					}
				});

				page.addMediaElements();

			},

			addAdditionalMetadata: function() {

				var prop, value, 
					count = 0,
					table = $( '<table></table>' ),
					currentNode = scalarapi.model.getCurrentPageNode();

				// build table of auxiliary properties (and count how many there are)
				for ( prop in currentNode.current.auxProperties ) {
					for ( i in currentNode.current.auxProperties[ prop ] ) {
						value = currentNode.current.auxProperties[ prop ][ i ];
						if (-1!=value.indexOf('://')) value = '<a href="'+value+'">'+value+'</a>';
						table.append( '<tr><td>' + prop + '</td><td>' + value + '</td></tr>');
						count++;
					}
				}

				// if we have auxiliary properties, add a button to toggle their display
				if ( count > 0 ) {

					var metadata = $( '<div class="body_copy additional_metadata caption_font" style="clear: both;"></div>' );
					var button = $( '<a class="btn btn-default" aria-expanded="false" aria-controls="additionalMetadata">Additional metadata</a>' ).appendTo( metadata );
					button.click( function() {
						var isExpanded = $( this ).attr( "aria-expanded" );
						if ( isExpanded == "false" ) {
							$( "#additionalMetadata" ).show();
							$( this ).attr( "aria-expanded", "true" );
						} else {
							$( "#additionalMetadata" ).hide();
							$( this ).attr( "aria-expanded", "false" );
						}
					} );
					var collapsible = $( '<div id="additionalMetadata"><div class="well"></div></div>' ).appendTo( metadata );
					var well = collapsible.find( ".well" );
					well.append( table );

					$( 'article > span[property="sioc:content"]' ).after( metadata );

				}

			},

			addExternalLinks: function() {
				$( 'article > span[property="sioc:content"]' ).find( 'a' ).each( function() {

					var base_url = $('link#parent').attr('href');
					var $link = $(this);
					var resource = $link.attr('resource');
					var href = $link.attr('href');
					var target = ('undefined'!=typeof($link.attr('target'))) ? $link.attr('target') : null;
					var url = $( this ).attr( "href" );

					// Link without resource=""	(external or internal)	
					if ( resource == null ) {    
						if ('undefined'!=typeof(href) && base_url) {
							if (href.substr(0,4)=='http' && href.indexOf(base_url) == -1) {  // External link
								$link.click(function() {  // Open with previous header
									if (target) {  // E.g., open in a new page
										$link.click();
										return false;
									} else {
										var link_to = base_url+'external?link='+encodeURIComponent($(this).attr('href'))+'&prev='+encodeURIComponent(document.location.href);
										document.location.href=link_to;
										return false;
									}
								});
							} 
						}
					}
				});
			}

		};

		$('body').bind('setState', page.handleSetState);
		$('body').bind('mediaElementMediaLoaded', page.handleMediaElementMetadata);

		element.addClass('page');

		$( 'header' ).show();
		$( '#book-id' ).hide();
		$( '[property="scalar:fullname"]' ).hide();
		$( '[property="dcterms:description"]' ).hide();

        //Are we logged in? Check the RDF metadata.
        page.logged_in = $('link#logged_in').length > 0 && $('link#logged_in').attr('href')!='';
        if(page.logged_in){
            //While we are logged in, check what our user level is, and set the appropriate bools
            page.is_author = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Author';
            page.is_commentator = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Commentator';
            page.is_reviewer = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Reviewer';
       	}

		$('section').hide(); // TODO: Make this more targeted

		$( 'article' ).append( '<div id="footer" class="caption_font"></div>' );

		$( 'body' ).bind( 'delayedResize', function() {
			if(page.initialMediaLoad === true) {
				var reload = false;
				if($('body').width() <= page.mobileWidth) {
					if(page.adaptiveMedia != 'mobile') {
						page.adaptiveMedia = 'mobile';
						page.handleMediaResize();
					}
				} else if(page.adaptiveMedia != 'full') {
					page.adaptiveMedia = 'full';
					reload = true;
				}
				if(Math.abs(page.heightOnMediaLoad-$(window).height()) > 200) {
					page.heightOnMediaLoad = $(window).height();
					reload = true;
				}
				if(reload == true) {
					$('#google-maps').css('max-height',0.8*page.heightOnMediaLoad);
					page.handleMediaResize();					
				}
			}
		} );

		if($('body').width() <= page.mobileWidth) {
			page.adaptiveMedia = 'mobile';
		}

		$('body').on('mediaElementMediaLoaded',function() {
			page.initialMediaLoad = true;
			page.heightOnMediaLoad = $(window).height();
		});

		var i, node, nodes, link, visOptions, visualization,
			currentNode = scalarapi.model.getCurrentPageNode();

		if ( currentNode != null ) {

			var viewType;
			var extension = scalarapi.getFileExtension( window.location.href );
			var version = scalarapi.getVersionExtension( window.location.href );

			if (( extension == '' ) || ( version != '' )) {
				viewType = currentNode.current.properties['http://scalar.usc.edu/2012/01/scalar-ns#defaultView'][0].value;
				if ( version != '' ) {
					$( 'h1[property="dcterms:title"]' ).append( ' (Version ' + parseInt( version ) + ')' );
				}
			} else {
				// handle case where the extension specifies a version number to be viewed
				// in the versions view, i.e. "2.versions"
				if (( extension.indexOf( "versions" ) != -1 ) && ( extension != "versions" )) {
					viewType = "versions";
				} else {
					viewType = extension;					
				}
			}

			if (( viewType != 'iframe' ) && ( viewType != 'meta' ) && ( viewType != 'versions' ) && ( viewType != 'annotation_editor' )) {
				wrapOrphanParagraphs($('[property="sioc:content"]'));
		  	}

		  	$('[property="scalar:defaultView"]').hide();
		  	$('[property="sioc:content"]').children('p,div').addClass('body_copy').wrap('<div class="paragraph_wrapper"></div>');

			page.getContainingPathInfo();
			switch (viewType) {

				case 'splash':
				case 'book_splash':
				$( 'article' ).before( '<div class="blackout"></div>' );
				element.addClass('splash');
				$('h1[property="dcterms:title"]').wrap('<div class="title_card"></div>');

				// add book title and placeholder for author list
				if ( viewType == "book_splash" ) {
					$( 'h1[property="dcterms:title"]' ).html( $( '.book-title' ).html() );
					$( '.title_card' ).append('<h2></h2>');
				}

				$('[property="art:url"]').hide();
				element.css('backgroundImage', $('body').css('backgroundImage'));
				$('body').css('backgroundImage', 'none');
				$('.paragraph_wrapper').remove();
				page.addRelationshipNavigation( false, false, true, false, true );
				$('.relationships').appendTo('.title_card');

				window.setTimeout(function(){
					$( '.splash' ).delay( 1000 ).addClass( 'fade_in' ).queue( 'fx', function( next ) {
						$( '.blackout' ).remove();
						$( '.title_card' ).addClass( 'fade_in' );
						next();
					} );
				},200);
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
				page.addRelationshipNavigation( true, true, true, true, false );
				page.addIncomingComments();
				page.addAdditionalMetadata();
				page.addExternalLinks();
				page.addColophon();
				page.addNotes();
				break;

				case 'visualization':
				var visOptions = { 
					modal: false,
                    content: 'all',
                    relations: 'all',
                    format: 'grid'
				};
				var visualization = $('<div class="visualization"></div>').appendTo(element);
				visualization.scalarvis( visOptions );
				break;

				case 'structured_gallery':
				page.setupScreenedBackground();
				//page.gallery = $.scalarstructuredgallery($('<div></div>').appendTo(element));
				var galleryElement = $('<div></div>');
				$( 'article > span[property="sioc:content"]' ).after( galleryElement );
				page.gallery = $.scalarstructuredgallery( galleryElement );
				page.addHeaderPathInfo();
				page.addRelationshipNavigation( false, true, false, true, false );
				page.addIncomingComments();
				page.addAdditionalMetadata();
				page.addExternalLinks();
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
				page.addRelationshipNavigation( true, true, true, true, false );
				page.addIncomingComments();
				page.addAdditionalMetadata();
				page.addExternalLinks();
				page.addColophon();
				page.addNotes();
				break;

				default:
			  	//$('body').bind('mediaElementMediaLoaded', page.handleMediaElementMetadata);
			  	var okToAddExtras = true;

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
							foundError = false;

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
                    case "visindex":
                   	case "visradial":
                    case "vispath":
                    case "vismedia":
                    case "vistag":

                    switch ( viewType ) {

	                    case "vis":
	                    case "visindex":
	                    visOptions = {
	                    	modal: false,
	                    	content: 'all',
	                    	relations: 'all',
	                    	format: 'grid'
	                    }
	                    break;

                  	 	case "visradial":
	                    visOptions = {
	                    	modal: false,
	                    	content: 'all',
	                    	relations: 'all',
	                    	format: 'radial'
	                    }
	                    break;

	                    case "vispath":
	                 	visOptions = {
	                    	modal: false,
	                    	content: 'current',
	                    	relations: 'path',
	                    	format: 'tree'
	                    }
	                    break;

	                    case "vismedia":
	                    visOptions = {
	                    	modal: false,
	                    	content: 'current',
	                    	relations: 'referee',
	                    	format: 'force-directed'
	                    }
	                    break;

	                    case "vistag":
	                    visOptions = {
	                    	modal: false,
	                    	content: 'current',
	                    	relations: 'tag',
	                    	format: 'force-directed'
	                    }
	                    break;

                    }
 					visualization = $(  '<div class="visualization"></div>' );
					$( 'article > header > h1' ).css( 'margin-bottom', '1.2rem' );
					$( 'article > header' ).after( visualization );
					visualization.scalarvis( visOptions );
                    break;

					case "versions":
					$( 'h1[property="dcterms:title"]' ).after( '<h2>Version editor</h2>' );
					$( '.versions-page' ).removeClass( 'body_copy' ).addClass( 'page_margins' );
					okToAddExtras = false;
					break;

					case "meta":
					$( 'h1[property="dcterms:title"]' ).after( '<h2 style="margin-bottom: 0rem;">Metadata</h2>' );
					$( '.meta-page' ).removeClass( 'body_copy' ).addClass( 'page_margins' );
					okToAddExtras = false;
					break;

					case "history":
					$( 'h1[property="dcterms:title"]' ).after( '<h2 style="margin-bottom: 0rem;">Version history</h2>' );
					$( '.history-page' ).removeClass( 'body_copy' ).addClass( 'page_margins' );
					okToAddExtras = false;
					break;

					case "annotation_editor":
					$( 'h1[property="dcterms:title"]' ).after( '<h2 style="margin-bottom: 0rem;">Annotation editor</h2>' );
					$( '.annotation_editor-page' ).removeClass( 'body_copy' ).addClass( 'page_margins' );
					$( '.annobuilder' ).addClass( 'caption_font' );
					okToAddExtras = false;
					break;

			  	}

				page.setupScreenedBackground();
				page.addHeaderPathInfo();
				if ( okToAddExtras ) {				
					page.addRelationshipNavigation( true, true, true, true, false );
					page.addIncomingComments();
					if ( $('[resource="' + currentNode.url + '"][typeof="scalar:Media"]').length == 0 ) {
						page.addAdditionalMetadata();
					}
					page.addExternalLinks();
					page.addNotes();
				}
				page.addColophon();
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

			page.handleBook(); // we used to bind this to the return of a loadBook call, but now we can call it immediately

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