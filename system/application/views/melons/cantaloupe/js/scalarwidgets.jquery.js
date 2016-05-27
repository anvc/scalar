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
     $.scalarwidgets = function(el, options){
         // To avoid scope issues, use 'base' instead of 'this'
         // to reference this class from internal events and functions.
         var base = this;

				 base.loadedTimeline = false;
				 base.pendingWidgets = {};

         // Access to jQuery and DOM versions of element
         base.$el = $(el);
         base.el = el;

         // Add a reverse reference to the DOM object
         base.$el.data("scalarwidgets", base);

         base.init = function(){
             base.options = $.extend({},$.scalarwidgets.defaultOptions, options);
             base.currentNode = scalarapi.model.getCurrentPageNode();
         };

         base.handleWidget = function($widget){
					 var type = $widget.attr('resource').replace('widget/','');

           var $element = $('<div class="widgetElement"></div>');
           $widget.data('element',$element);

           //Set some common values stored within the anchor tag as data values
           $widget.data('inline',$widget.hasClass('inline'));
           if($widget.hasClass('inline')){
             $widget.hide();
           }else{
             $widget.addClass( 'texteo_icon texteo_icon_' + type );
           }

            //Create a slot for this widget and render it!
            base.createWidgetSlot($widget);

						 switch(type){
               //Timeline.js
							 case 'timeline':
                if(!base.loadedTimeline){
									if(typeof base.pendingWidgets.timeline === 'undefined'){
										base.pendingWidgets.timeline = [];
										$.getScript(modules_uri+'/cantaloupe/js/date-utils.min.js',function(){
											$.getScript(modules_uri+'/cantaloupe/js/timeline.min.js',function(){

  											$('head').append('<link rel="stylesheet" type="text/css" href="'+modules_uri+'/cantaloupe/css/timeline.min.css" />');
												base.loadedTimeline = true;
												for(var i = 0; i < base.pendingWidgets.timeline.length; i++){
														base.pendingWidgets.timeline[i].resolve();
												}
											});
										});
									}
                  //Create a deferred object and add it to a list of promises
									var promise = $.Deferred().then($.proxy(function(){
  									base.renderTimeline($(this));
  								},$widget));
									base.pendingWidgets.timeline.push(promise);
								}else{
                  base.renderTimeline($widget);
                }
								break;
							case 'visualization':
								base.renderVisualization($widget);
								break;
							case 'map':
								base.renderMap($widget);
								break;
							case 'carousel':
								base.renderCarousel($widget);
								break;
							case 'card':
								base.renderCard($widget);
								break;
							case 'summary':
								base.renderSummary($widget);
								break;
						 }

				 };

				 //Handle visualizations inserted into this page
				 base.renderVisualization = function($widget){
           //Grab the container for this widget
           var $element = $widget.data('element');

           //Visualization rendering content

           var visElement = $( '<div></div>' ).appendTo($element);
           var options = {
               modal: false,
               widget: true
           }

           switch ( $widget.data( 'vistype' ) ) {

               case "visconnections":
               $widget.addClass("connections");
               options.content = 'all';
               options.relations = 'all';
               options.format = 'force-directed';
               break;

               case "vistoc":
               $widget.addClass("contents");
               options.content = 'toc';
               options.relations = 'all';
               options.format = 'tree';
               break;

               case "vis":
               case "visindex":
               $widget.addClass("grid");
               options.content = 'all';
               options.relations = 'all';
               options.format = 'grid';
               break;

               case "visradial":
               $widget.addClass("radial");
               options.content = 'all';
               options.relations = 'all';
               options.format = 'radial';
               break;

               case "vispath":
               $widget.addClass("path");
               options.content = 'path';
               options.relations = 'path';
               options.format = 'tree';
               break;

               case "vismedia":
               $widget.addClass("media");
               options.content = 'media';
               options.relations = 'referee';
               options.format = 'force-directed';
               break;

               case "vistag":
               $widget.addClass("tag");
               options.content = 'tag';
               options.relations = 'tag';
               options.format = 'force-directed';
               break;

           }

           visElement.scalarvis( options );
				 };

				 //Handle Google Maps inserted into this page
				 base.renderMap = function($widget){
           //Grab the container for this widget
           var $element = $widget.data('element');

           //Map rendering content
           var $gmaps = $('<div class="googleMapWidget"></div>').appendTo($element);



           if($widget.data('container')!=undefined){
             var height = $widget.data('container').height();
           }else{
             var height = $element.height();
           }
           if(height <= 10){
             height = Math.min(base.options.minWidgetHeight,maxMediaHeight);
           }

           $element.add($gmaps).height(height);

           var mapOptions = {
             zoom: 8,
             mapTypeId: google.maps.MapTypeId.ROADMAP
           }
           var map = new google.maps.Map( $gmaps[0], mapOptions );
           // create info window
           var infoWindow = new google.maps.InfoWindow({
             content: contentString,
             maxWidth: 400
           });

           var marker, property, contents, node, contentString, label, pathIndex,
             properties = [
               'http://purl.org/dc/terms/coverage',
               'http://purl.org/dc/terms/spatial'
             ]
             markers = [],
             foundError = true;

           var pathContents = base.currentNode.getRelatedNodes( 'path', 'outgoing' );
           var tagContents = base.currentNode.getRelatedNodes( 'tag', 'outgoing' );
           var contents = pathContents.concat(tagContents);

           for ( p in properties ) {

             property = properties[ p ];

             // if the current page has the spatial property, then
             if ( base.currentNode.current.properties[ property ] != null ) {

               n = base.currentNode.current.properties[ property ].length;
               for ( i = 0; i < n; i++ ) {
                 marker = page.getMarkerFromLatLonStrForMap(
                   base.currentNode.current.properties[ property ][ i ].value,
                   base.currentNode.getDisplayTitle(),
                   base.currentNode.current.description,
                   null,
                   map,
                   infoWindow,
                   base.currentNode.thumbnail
                 );

                 if ( marker != null ) {
                   markers.push( marker );
                   foundError = false;
                 }

               }

             }

             n = contents.length;

             // add markers for each content element that has the spatial property
             for ( i = 0; i < n; i++ ) {

               node = contents[ i ];

               if ( node.current.properties[ property ] != null ) {

                 o = node.current.properties[ property ].length;
                 for ( j = 0; j < o; j++ ) {

                   label = null;
                   pathIndex = pathContents.indexOf(node);
                   if (pathIndex != -1) {
                     label = (pathIndex+1).toString();
                   }

                   marker = page.getMarkerFromLatLonStrForMap(
                     node.current.properties[ property ][ j ].value,
                     node.getDisplayTitle(),
                     node.current.description,
                     node.url,
                     map,
                     infoWindow,
                     node.thumbnail,
                     label
                   );

                   if ( marker != null ) {
                     markers.push( marker );
                     foundError = false;
                   }
                 }
               }
             }
           }

           // no valid coords found on page or its children
           if ( foundError ) {
             $gmaps.append( '<div class="alert alert-danger" style="margin: 1rem;">Scalar couldn’t find any valid geographic metadata associated with this page.</div>' );

           // no coords of any kind found
           } else if ( markers.length == 0 ) {
             $gmaps.append( '<div class="alert alert-danger" style="margin: 1rem;">Scalar couldn’t find any geographic metadata associated with this page.</div>' );
           }else{
             // adjust map bounds to marker bounds
             var bounds = new google.maps.LatLngBounds();
             $gmaps.data({'map':map,'bounds':bounds,'markers':markers});
             $.each( markers, function ( index, marker ) {
               bounds.extend( marker.position );
             });
             if ( markers.length > 1 ) {
               map.fitBounds( bounds );
             }

             $gmaps.css('height','100%');

             $(window).on('resize',$.proxy(function(){
               var markers = $(this).data('markers');
               if(markers.length > 1){
                 $(this).data('map').fitBounds($(this).data('bounds'));
               }
             },$gmaps));
           }
				 };

				 //Handle timeline inserted into this page (  )
				 base.renderTimeline = function($widget){
           //Grab the container for this widget
           var $element = $widget.data('element');

           if($widget.data('timelinedata') == undefined){
             var tempdata = {}; //TODO: Populate tempdata with actual timeline data
             $widget.data('timelinedata',tempdata);
           }


           //Timeline rendering content
           $widget.on('slotCreated',function(){
              $(this).data('element').html('');
              var $timeline = $('<div class="caption_font timeline_embed"></div>').appendTo($(this).data('element'));
              $timeline.width($(this).data('element').width());
              var height = $(this).data('element').height();
              if(height == 0){
                height = Math.min(base.options.minWidgetHeight,maxMediaHeight);
              }
              $timeline.height(height);
              console.log($timeline[0],$(this).data('timelinedata'));
              var timeline = new TL.Timeline($timeline[0],$(this).data('timelinedata'));
           });

           //Because we asynchronously load the Timeline javascript,
           //it's possible that we've already triggered the slotCreated event
           //before we got here, so check to see if we have a slot and if so,
           //trigger it again.
           if($widget.data('slot')!==undefined){
             $widget.trigger('slotCreated');
           }
				 };

				 //Handle carousel inserted into this page
				 base.renderCarousel = function($widget){
           //Grab the container for this widget
           var $element = $widget.data('element');

           //Carousel rendering content
           var nodes = [];
					 var mediaLinks = page.getMediaLinks( page.bodyContent() );
           $( mediaLinks ).each( function() {
             node = scalarapi.getNode( $( this ).attr('resource') );
             if ( node != null ) {
               nodes.push( node );
             }
           });

           nodes = nodes.concat( getChildrenOfType(base.currentNode, 'media') );
           var n = nodes.length;

           var $carousel = $('<div class="carousel slide"></div>').appendTo($element);
           var $wrapper = $( '<div class="carousel-inner" role="listbox"></div>' ).appendTo( $carousel );


           if ( page.adaptiveMedia == "mobile" ) {
             galleryHeight = 300;
           } else {
             // this magic number matches a similar one in the calculateContainerSize method of jquery.mediaelement.js;
             // keeping them synced up helps keep media vertically aligned in galleries
             galleryHeight = Math.min(base.options.minWidgetHeight,maxMediaHeight);;
           }

           for ( var i = 0; i < n; i++ ) {

             node = nodes[i];
             item = $( '<div class="item" style="height: ' + galleryHeight + 'px;"></div>' ).appendTo( $wrapper );
             if ( i == 0 ) {
               item.addClass( "active" );
             }

             // if this is a media link that's already part of the content of the page, then use it
             if ( i < mediaLinks.length ) {
               var $mediaContainer = $('<span></span>').appendTo( item );
               $link = mediaLinks[ i ];
               if ( $link.hasClass( 'inline' ) ) {
                 $link.removeClass( 'inline' );
                 $link.css('display', 'none');
               }
               $link.attr({
                 'data-size': 'full',
                 'data-caption': 'none'
               });

             // otherwise, create a new link from scratch
             } else {
               $mediaContainer = $('<span><a href="'+node.current.sourceFile+'" resource="'+node.slug+'" data-size="full" data-caption="none">'+node.slug+'</a></span>').appendTo( item );
               $link = $mediaContainer.find( 'a' );
               $link.css('display', 'none');
             }

             if ( node.current.description != null ) {
               description = node.current.description;
               if ( node.current.source != null ) {
                 description += ' (Source: ' + node.current.source + ')';
               }
               description = description.replace( new RegExp("\"", "g"), '&quot;' );
               item.append( '<div class="carousel-caption caption_font"><span>' +
                 '<a href="' + node.url + '" role="button" data-toggle="popover" data-placement="bottom" data-trigger="hover" data-title="' + node.getDisplayTitle().replace( '"', '&quot;' ) + '" data-content="' + description + '">' + node.getDisplayTitle() + '</a> (' + ( i + 1 ) + '/' + n + ')' +
                 '</span></div>' );
             } else {
               item.append( '<div class="carousel-caption caption_font"><span>' +
                 '<a href="' + node.url + '" >' + node.getDisplayTitle() + '</a> (' + ( i + 1 ) + '/' + n + ')' +
                 '</span></div>' );
             }

             page.addMediaElementForLink( $link, $mediaContainer, galleryHeight );

            }
           if ( page.adaptiveMedia != "mobile" ) {
							$wrapper.find( '[data-toggle="popover"]' ).popover( {
								container: '#gallery',
								template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title heading_font heading_weight"></h3><div class="popover-content caption_font"></div></div>'
							} );
 						}
 						$carousel.find( '.mediaelement' ).css( 'z-index', 'inherit' );
 						$carousel.find( '.slot' ).css( 'margin-top', '0' );
 						$carousel.append( '<a class="left carousel-control" role="button" data-slide="prev">' +
 							'<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>' +
 							'<span class="sr-only">Previous</span>' +
 							'</a>' +
 							'<a class="right carousel-control" role="button" data-slide="next">' +
 							'<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>' +
 							'<span class="sr-only">Next</span>' +
 							'</a>' );

            $carousel.find('.carousel-control').click(function(e){
              e.stopPropagation();
              e.preventDefault();
              $carousel = $(this).parents('.carousel');
              if($(this).hasClass('left')){
                $carousel.carousel('prev');
              }else if($(this).hasClass('right')){
                $carousel.carousel('next');
              }
              return false;
            });
 						$carousel.carousel( { interval: false } );
 						$( mediaLinks ).each( function( i ) {
 							$( this ).data( 'index', i );
 							$( this ).click( function( e ) {
 								e.preventDefault();
 								$carousel.carousel( $( this ).data( 'index' ) );
 							} );
 							$( this ).click( page.handleMediaLinkClick );
 						} );

 						if(isMobile){
 							$.getScript(views_uri+'/melons/cantaloupe/js/jquery.mobile.touch.min.js',function(){
 								$carousel.swiperight(function() {
 	    		  			$(this).carousel('prev');
 		    				}).swipeleft(function() {
 			      			$(this).carousel('next');
 								});
 							});
 						}
				 };

				 //Handle card inserted into this page ( http://getbootstrap.com/components/#thumbnails-custom-content )
				 base.renderCard = function($widget){
           //Grab the container for this widget
           var $element = $widget.data('element');

           //Card rendering content

				 };

				 //Handle summary inserted into this page ( http://getbootstrap.com/components/#media-default )
				 base.renderSummary = function($widget){
           //Grab the container for this widget
           var $element = $widget.data('element');

           //Summary rendering content

				 };

         base.calculateSize = function($widget){
           if(page.bodyCopyWidth == null){
             page.calculatePageDimensions();
           }
           var bodyWidth = page.bodyCopyWidth;

           var $slot = $widget.data('slot');
           var $container = $widget.data('container');
           var $parent = $widget.data('parent');
           var size = $widget.data('size');
           var height = $widget.data('height');
           var inline = $widget.data('inline');

           $slot.detach();

           $slot.removeClass().addClass('widget_slot');
           $container.removeClass().addClass('widgetContainer well');

           if ( page.adaptiveMedia == 'mobile' ) {
            size = 'full';
           }else if ( size == undefined ) {
            size = 'medium';
           }
           var $temp = $( '<div class="' + size + '_dim">&nbsp;</div>');
           var width = Math.min( parseInt( $( '.page' ).width() ), parseInt( $temp.appendTo( '.page' ).width() ));
           $temp.remove();

           if (inline) {
             // we want 'large' inline widgets to be as wide as the text
             if (size == 'large') {
               width = page.bodyCopyWidth;
             }
           } else {
             // break point for large widgets to become full
             if (( size == 'large' ) && (( page.pageWidthMinusMargins - page.bodyCopyWidth ) < 160 )) {
               size = "full";
               width = page.pageWidth;
             // break point for medium widgets to become full
             } else if (( size == 'medium' ) && ( width > ( page.bodyCopyWidth - 160 ))) {
               size = "full";
               width = page.pageWidth;
             }
           }

           vcenter = false;
           if ( size == 'full' || size == 'native') {
             if ( height == null ) {
               height = maxMediaHeight; // this varies depending on window size
             } else {
               vcenter = true;
             }
           }

           var containerLayout = (height==undefined)?"horizontal":"vertical";

           $container.width(width).css('max-height',maxMediaHeight);
           if(containerLayout == 'vertical'){
             $container.height(height);
           }
           var inline = $widget.data('inline');
           var align = $widget.data('align');

           if ( align == undefined ) {
             align = 'right';
           }

           if ( inline ) {

             $widget.after( $slot );
             $widget.hide();

             if ( size != 'full' ) {

               // wrap the widget in a body copy element so its alignment happens inside the
               // dimensions of the body copy
               if (!$slot.parent().hasClass('body_copy')) {
                 $slot.wrap('<div class="body_copy"></div>');
               }

               // align the widget appropriately
               if ( align == 'right' ) {
                 $container.css( 'float', 'right' );
               } else if ( align == 'left' ) {
                 $container.css( 'float', 'left' );
               } else if ( align == 'center' ) {
                 $container.css( 'margin-right', 'auto' );
                 $container.css( 'margin-left', 'auto' );
               }

             } else {
               $slot.addClass( 'left' );
               $container.addClass('page_margins');
             }

             $slot.parent().nextAll( ".paragraph_wrapper" ).eq( 0 ).css( "clear", "both" );

           // if this is not an inline widget, and its size isn't set to 'full', then
           } else if ( size != 'full' ) {

             // put the widget before its linking text, and align it appropriately
             $parent.before( $slot );
             $slot.addClass( align );

             // if this is the top-most linked widget, then align it with the top of its paragraph
             count = page.incrementData( $parent, align + '_count' );
             if ( count == 1 ) {
               $slot.addClass('top');
             }

           // if this is not an inline widget, and its size is set to 'full', then put the widget after its linking text
           } else {
             var embedLocation = $parent.nextAll('.slot.full, .widget_slot.full, .body_copy.mediainfo').last();
             if(embedLocation.length == 0){
               embedLocation = $parent;
             }
             embedLocation.after( $slot );
             $slot.addClass( 'full' );
             $container.addClass('page_margins');
           }

           $('body').trigger("widgetElementLoaded");
         }

				 //Implementation of slot manager for widgets
				 base.createWidgetSlot = function($widget){

            var $slot = $('<div class="widget_slot"></div>');
            var $container = $('<div class="widgetContainer well"></div>').appendTo($slot);
            $container.append($widget.data('element'));

            $widget.data({
                container: $container,
                slot: $slot,
                parent: $widget.parent()
            });


            //$(window).on('resize',$.proxy(function(){widgets.calculateSize($(this));},$widget));

            base.calculateSize($widget);

            $widget.click(function(){
              $('html, body').scrollTop($(this).data('slot').offset().top);
              $(this).data('container').addClass('highlighted');
              window.setTimeout($.proxy(function(){$(this).removeClass('highlighted')},$(this).data('container')),500);
            });


            $widget.trigger("slotCreated");
				 }

         // Run initializer
         base.init();
     };

     $.scalarwidgets.defaultOptions = {
       "minWidgetHeight" : 500
     };

     $.fn.scalarwidgets = function(options){
         return this.each(function(){
             (new $.scalarwidgets(this, options));
         });
     };

 })(jQuery);


//Temporarily commenting this out - will use this code once Cards are implemented
// (function($) {
//
// 	$.scalarwidgets = function(e, options) {
//
// 		var widgets = {
//
// 			options: $.extend({}, options),
//
// 			cardData: {},
//
// 			setupCards: function() {
// 				$('div[data-widget="card"]').each(function() {
// 					$(this).empty();
// 					$(this).append('<br clear="both"/>');
// 					var i, n, nodes;
// 					var target = $(this).attr("data-target");
// 					var extent = $(this).attr("data-extent");
// 					target = "self";
// 					widgets.cardData[target] = extent;
// 					if (target == "self") {
// 						var currentPageNode = scalarapi.model.getCurrentPageNode();
// 						switch (extent) {
//
// 							case "self":
// 							widgets.buildCardFromNode($(this), currentPageNode);
// 							break;
//
// 							case "path":
// 							nodes = currentPageNode.getRelatedNodes("path", "outgoing");
// 							n = nodes.length;
// 							for (i=(n-1); i>=0; i--) {
// 								widgets.buildCardFromNode($(this), nodes[i]);
// 							}
// 							break;
//
// 						}
// 					}
// 					/*if (extent == "self") {
// 						if (scalarapi.loadNode(target, false, widgets.onCardNodeLoaded) == "loaded") {
// 							buildCard(target, extent);
// 						}
// 					}*/
// 				});
// 			},
//
// 			onCardNodeLoaded: function(json) {
// 				console.log(json);
// 			},
//
// 			buildCardFromSlug: function(element, slug) {
// 				var node = scalarapi.getNode(slug);
// 				widgets.buildCardFromNode(element, node);
// 			},
//
// 			buildCardFromNode: function(element, node) {
// 				var markup = '<div class="col-md-4"><div class="thumbnail">';
// 				if (node.thumbnail != null) {
// 					markup += '<img src="' + node.thumbnail + '" alt="">';
// 				}
// 				markup += '<div class="caption"><h4 class="heading_font heading_weight">' + node.getDisplayTitle() + '</h4>';
// 				if (node.current.description != null) {
// 					markup += '<p class="description-sm caption_font">' + node.current.description + '</p>';
// 				}
// 				markup += '<a href="' + node.url + '" class="btn btn-primary" role="button">Go there</a></div>' +
// 						'</div>' +
// 					'</div></div>';
// 				element.prepend(markup);
// 			},
//
// 			buildMediaObjectFromNode: function(element, node) {
// 				var markup = '<div class="media">';
// 				if (node.thumbnail != null) {
// 					markup += '<div class="media-left">' +
// 							'<a href="#">' +
// 								'<img class="media-object pull-left" src="' + node.thumbnail + '" alt="">' +
// 							'</a>' +
// 						'</div>';
// 				}
// 				markup += '<div class="media-body">' +
// 					'<h4 class="media-heading heading_font heading_weight">' + node.getDisplayTitle() + '</h4>';
// 				if (node.current.description != null) {
// 					markup += '<p class="description-sm caption_font">' + node.current.description + '</p>';
// 				}
// 				markup += '<a href="' + node.url + '" class="btn btn-primary" role="button">Go there</a>' +
// 						'</div>' +
// 					'</div>';
// 				element.prepend(markup);
// 			}
//
// 			/*<div class="media">
//   <div class="media-left">
//     <a href="#">
//       <img class="media-object" src="..." alt="...">
//     </a>
//   </div>
//   <div class="media-body">
//     <h4 class="media-heading">Media heading</h4>
//     ...
//   </div>
// </div>*/
//
// 		};
//
// 		widgets.setupCards();
//
// 		return widgets;
//
// 	}
//
// })(jQuery);
