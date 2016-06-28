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

				 base.pendingWidgets = {};

         // Access to jQuery and DOM versions of element
         base.$el = $(el);
         base.el = el;

         // Add a reverse reference to the DOM object
         base.$el.data("scalarwidgets", base);

         base.init = function(){
             if(typeof loadedTimeline == 'undefined'){
               loadedTimeline = false;
             }
             base.options = $.extend({},$.scalarwidgets.defaultOptions, options);
             base.book_url = $('link#parent').attr('href');
             base.currentNode = scalarapi.model.getCurrentPageNode();
             //60% of (page height minus header and H1 height)
             maxWidgetHeight = Math.floor((window.innerHeight-179)*.6);
             $(window).resize(function(){
               maxWidgetHeight = Math.floor((window.innerHeight-179)*.6);
             });
         };

         base.handleWidget = function($widget){
           if($widget.attr('resource') != undefined){
               $widget.attr('href',base.book_url+$widget.attr('resource'));
           }

					 var type = $widget.data('widget');

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
                if(!loadedTimeline){
									if(typeof base.pendingWidgets.timeline === 'undefined'){
										base.pendingWidgets.timeline = [];
										$.getScript(modules_uri+'/cantaloupe/js/date-utils.min.js',function(){
											$.getScript(modules_uri+'/cantaloupe/js/timeline.min.js',function(){

  											$('head').append('<link rel="stylesheet" type="text/css" href="'+modules_uri+'/cantaloupe/css/timeline.min.css" />');
												loadedTimeline = true;
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

         base.getTargetNode = function($widget, promise){
           if($widget.attr('resource') == undefined){
             //Use the current node, if it has related chronological nodes
             $widget.data('node',base.currentNode);
             promise.resolve();
           }else{
             //We have a target node - use its related chronological nodes
             var slug = $widget.attr('resource');
             if(slug.indexOf(',') > -1){
               var slugs = [];
               var slug_list = slug.split(',');
               for(var i in slug_list){
                  slugs.push({id : slug_list[i], loaded : false});
               }

               if(slug.indexOf(',') > -1){
                 var slug_list = slug.split(',');
                 for(var i in slug_list){
                    slugs.push({id : slug_list[i], loaded : false});
                 }
               }else{
                 slugs.push({id : slug, loaded : false});
               }
               for(var i in slugs){
                 (function(slug,promise,slugs){
                   if(scalarapi.loadPage( slug.id, false, function(){

                     var nodeList = [];

                     slug.loaded = true;

                     for(var i in slugs){
                       if(!slugs[i].loaded){
                         return;
                       }else{
                         nodeList.push(scalarapi.getNode(slug.id));
                       }
                     }

                     $widget.data('node',nodeList);

                     promise.resolve();
                   }, null, 1, false, null, 0, 20) == "loaded"){

                     var nodeList = [];

                     slug.loaded = true;

                     for(var i in slugs){
                       if(!slugs[i].loaded){
                         return;
                       }else{
                         nodeList.push(scalarapi.getNode(slug.id));
                       }
                     }

                     $widget.data('node',nodeList);

                     promise.resolve();
                   }
                 })(slugs[i],promise);
               }
             }else{
               if(scalarapi.loadPage( slug, false, function(){
                   $widget.data('node',scalarapi.getNode(slug));
                   promise.resolve();
               }, null, 1, false, null, 0, 20) == "loaded"){
                 $widget.data('node',scalarapi.getNode(slug));
                 promise.resolve();
               }
             }
           }
         }

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

            var gmapPromise = $.Deferred();
            $.when(gmapPromise).then($.proxy(function(){
              var $widget = this;
              $widget.on('slotCreated',function(){

                 $(this).data('element').html('');
                 var $gmaps = $('<div class="googleMapWidget"></div>').appendTo($(this).data('element'));
                 $gmaps.width($(this).data('element').width());
                 var height = $(this).data('element').height();
                 if(height == 0){
                   height = Math.min(base.options.maxWidgetHeight,maxWidgetHeight);
                 }
                 $gmaps.height(height);

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

                   if(typeof $(this).data('node') == undefined){
                     return;
                   }

                 var node = $widget.data('node');
                 var pathContents = node.getRelatedNodes( 'path', 'outgoing' );
                 var tagContents = node.getRelatedNodes( 'tag', 'outgoing' );
                 var contents = pathContents.concat(tagContents);

                 for ( p in properties ) {

                   property = properties[ p ];

                   // if the current page has the spatial property, then
                   if ( node.current.properties[ property ] != null ) {

                     n = node.current.properties[ property ].length;
                     for ( i = 0; i < n; i++ ) {
                       marker = page.getMarkerFromLatLonStrForMap(
                         node.current.properties[ property ][ i ].value,
                         node.getDisplayTitle(),
                         node.current.description,
                         null,
                         map,
                         infoWindow,
                         node.thumbnail
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

                   $(window).on('resize',$.proxy(function(){
                     var markers = $(this).data('markers');
                     if(markers.length > 1){
                       $(this).data('map').fitBounds($(this).data('bounds'));
                     }
                   },$gmaps));
                 }

              });
              if($widget.data('slot')!==undefined){
                $widget.trigger('slotCreated');
              }
            }, $widget));

            base.getTargetNode($widget, gmapPromise);
				 };

				 //Handle timeline inserted into this page (  )
				 base.renderTimeline = function($widget){
           //Grab the container for this widget
           var $element = $widget.data('element');

            var timelinePromise = $.Deferred();
            $.when(timelinePromise).then($.proxy(function(){
             //Timeline rendering content
             var $widget = this;
             $widget.on('slotCreated',function(){
                $(this).data('element').html('');
                var $timeline = $('<div class="caption_font timeline_embed"></div>').appendTo($(this).data('element'));
                $timeline.width($(this).data('element').width());
                var height = $(this).data('element').height();
                if(height == 0){
                  height = Math.min(base.options.maxWidgetHeight,maxWidgetHeight);
                }
                $timeline.height(height - 10);
                var timeline = new TL.Timeline($timeline[0],$(this).data('timeline'),{width:$timeline.width()+200});
             });

             //Because we asynchronously load the Timeline javascript,
             //it's possible that we've already triggered the slotCreated event
             //before we got here, so check to see if we have a slot and if so,
             //trigger it again.
             if($widget.data('slot')!==undefined){
               $widget.trigger('slotCreated');
             }

            },$widget));

            //We don't know how long this might take, so we're going to
            //wrap this part up in its own function to protect scope;

            //We need to get the related chronological information for this
            //timeline, but we may need to use the API to pull additional information
            (function($widget, promise){
              var parseDate = function(date,d_string){
                var d = {
                    year : date.getFullYear()
                };
                var month = date.getMonth()+1; //Timeline expects 1-12; JS spits out 0-11
                if(month > 1 || d_string.length > 4 || (d_string.length > 2 && (d_string.match(/\//g).length > 0 || d_string.match(/,/g).length > 0))){
                  d.month = month;
                  var day = date.getDate();
                  if(day > 1 || d_string.length > 6){
                    d.day = day;
                    var hour = date.getHours();
                    if(hour > 0){
                      d.hour = hour;
                      var minute = date.getMinutes();
                      if(minute > 0){
                        d.minute = minute;
                        var second = date.getSeconds();
                        if(second > 0){
                          d.second = second;
                          var millisecond = date.getMilliseconds();
                          if(millisecond > 0){
                            d.millisecond = millisecond;
                          }
                        }
                      }
                    }
                  }
                }
                return d;
              }
              var parseNodeForChronologicalData = function(node){
                var relatedNodes = [];
                relatedNodes.push(node.getRelatedNodes('path', 'outgoing'));
                relatedNodes.push(node.getRelatedNodes('tag', 'outgoing'));
                relatedNodes.push(node.getRelatedNodes('referee', 'outgoing'));
                relatedNodes.push(node.getRelatedNodes('annotation', 'outgoing'));

                var tempdata = {
                  title : {
                      text : {
                          headline : node.current.title,
                          text : node.current.content
                      }
                  },
                  events : []
                };

                //Get the main timeline items, if there are any
                for(var i in relatedNodes){
                  var nodeSet = relatedNodes[i];
                  for(var n in nodeSet){
                    var relNode = nodeSet[n].current;
                    if(typeof relNode.auxProperties != 'undefined' && typeof relNode.auxProperties['dcterms:temporal'] != 'undefined' && relNode.auxProperties['dcterms:temporal'].length > 0){
                        var entry = {};

                        var temporal_data = relNode.auxProperties['dcterms:temporal'][0];
                        var dashCount = (temporal_data.match(/-/g) || []).length;
                        if(dashCount != 1){
                          //Assume we have a single date, either dash seperated (more than one dash) or slash seperated (no dash)
                          var d_string = temporal_data.replace(/~+$/,''); //strip whitespace

                          var d = new Date(d_string);  //parse as a date
                          if(d instanceof Date){
                            entry.start_date = parseDate(d,d_string);
                          }
                        }else{
                          var dateParts = temporal_data.replace('-',' - ').split(' - ');

                          //We should now have two dates - a start and and end
                          if(dateParts.length == 2){
                            dateParts[0] = dateParts[0].replace(/~+$/,''); //Remove white space
                            dateParts[1] = dateParts[1].replace(/~+$/,''); //Remove white space

                            var sdate = new Date(dateParts[0]);  //parse as a date
                            var edate = new Date(dateParts[1]);  //parse as a date

                            if(sdate instanceof Date && edate instanceof Date){
                              entry.start_date = parseDate(sdate,dateParts[0]);
                              entry.end_date = parseDate(edate,dateParts[1]);
                            }

                          }
                        }
                        //Cool, got time stuff out of the way!
                        //Let's do the other components Timeline.js expects
                        entry.text = {
                          headline : '<a href="'+nodeSet[n].url+'">'+nodeSet[n].getDisplayTitle()+'</a>'
                        };

                        if(typeof relNode.content !== 'undefined' && relNode.content != null && relNode.content != ''){
                          entry.text.text = relNode.content;
                        }

                        //Now just check to make sure this node is a media node or not - if so, add it to the timeline entry
                        if(typeof nodeSet[n].scalarTypes.media !== 'undefined'){
                          entry.media = {
                            url : relNode.sourceFile,
                            thumbnail : nodeSet[n].thumbnail
                          };
                        }else if(typeof nodeSet[n].thumbnail !== 'undefined' && nodeSet[n].thumbnail != null && nodeSet[n].thumbnail != '') {
                          entry.media = {
                            url : base.book_url+nodeSet[n].thumbnail,
                            thumbnail : base.book_url+nodeSet[n].thumbnail
                          };
                        }


												if(typeof nodeSet[n].background !== 'undefined'){
													entry.background = {url:base.book_url+nodeSet[n].background}
												}

                        tempdata.events.push(entry);
                    }
                  }
                }
                $widget.data('timeline',tempdata);
                promise.resolve();
              }
              if($widget.data('timeline') != undefined){
                promise.resolve();
              }else{
                if($widget.attr('resource') == undefined){
                  //Use the current node, if it has related chronological nodes
                  parseNodeForChronologicalData(base.currentNode);
                }else{
                  //We have a target node - use its related chronological nodes
                  var slug = $widget.attr('resource');
                  if(scalarapi.loadPage( slug, false, function(){
    								parseNodeForChronologicalData(scalarapi.getNode(slug));
    							}, null, 1, false, null, 0, 20) == "loaded"){
    								parseNodeForChronologicalData(scalarapi.getNode(slug));
    							}
                }
              }
            })($widget, timelinePromise);
				 };

				 //Handle carousel inserted into this page
				 base.renderCarousel = function($widget){
           //Grab the container for this widget
           var $element = $widget.data('element');

           var carouselPromise = $.Deferred();

           $.when(carouselPromise).then($.proxy(function(){
             var $widget = this;

             $widget.on('slotCreated',function(){
               //Carousel rendering content
               var node = $widget.data('node');
               var nodes = [];
    					 var mediaLinks = page.getMediaLinks( node.current.content );
               $( mediaLinks ).each( function() {
                 node = scalarapi.getNode( $( this ).attr('resource') );
                 if ( node != null ) {
                   nodes.push( node );
                 }
               });

               nodes = nodes.concat( getChildrenOfType(node, 'media') );
               var n = nodes.length;

               var $carousel = $('<div class="carousel slide"></div>').appendTo($element);
               var $wrapper = $( '<div class="carousel-inner" role="listbox"></div>' ).appendTo( $carousel );


               if ( page.adaptiveMedia == "mobile" ) {
                 galleryHeight = 300;
               } else {
                 // this magic number matches a similar one in the calculateContainerSize method of jquery.mediaelement.js;
                 // keeping them synced up helps keep media vertically aligned in galleries
                 galleryHeight = Math.min(base.options.maxWidgetHeight,maxWidgetHeight);
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
                  if(touchLoaded){
                    $carousel.swiperight(function() {
                      $(this).carousel('prev');
                    }).swipeleft(function() {
                      $(this).carousel('next');
                    });
                  }else{
       							$.getScript(views_uri+'/melons/cantaloupe/js/jquery.mobile.touch.min.js',function(){
                      touchLoaded = true;
       								$carousel.swiperight(function() {
       	    		  			$(this).carousel('prev');
       		    				}).swipeleft(function() {
       			      			$(this).carousel('next');
       								});
       							});
                  }
     						}
             });

             if($widget.data('slot')!==undefined){
               $widget.trigger('slotCreated');
             }

           },$widget));


           base.getTargetNode($widget, carouselPromise);
				 };

				 //Handle card inserted into this page ( http://getbootstrap.com/components/#thumbnails-custom-content )
				 base.renderCard = function($widget){
           //Grab the container for this widget
           var $element = $widget.data('element');

           //Card rendering content
           var cardPromise = $.Deferred();
           $.when(cardPromise).then($.proxy(function(){
             var $widget = this;

             //For a card, we need an extant as well as a target. If the target is the current node, our extant will be a path.
             var node = $widget.data('node');
             var extant = $widget.data('extant');

             if(node == undefined){
               return;
             }else if(node instanceof Array){
               extant = 'list';
             }else if(node.slug == base.currentNode.slug){
               extant = 'path';
             }else if(extant == undefined){
               extant = 'self';
             }

             //Update the extant, so we can use that info inside of the slotCreated event
             $widget.data('extant',extant);

             $widget.on('slotCreated',function(){
               //Depending on the extant, we need to either add the selected node or the node's path.
               $(this).data('element').html('');
               var $cardContainer = $('<div class="row cardContainer"></div>').appendTo($(this).data('element'));
               switch($(this).data('extant')){
                 case 'path':
                     var nodes = node.getRelatedNodes("path", "outgoing");
                     var n = nodes.length;
                     for (var i=(n-1); i>=0; i--) {
                        widgets.createCardFromNode(nodes[i], $cardContainer);
                     }
                     break;
                 case 'list':
                     var n = node.length;
                     for (var i=(n-1); i>=0; i--) {
                        widgets.createCardFromNode(node[i], $cardContainer);
                     }
                     break;
                 default:
                     widgets.createCardFromNode($(this).data('node'),$cardContainer);
               }
             });

             if($widget.data('slot')!==undefined){
               $widget.trigger('slotCreated');
             }
          },$widget));

          base.getTargetNode($widget, cardPromise);
				 };

				 //Handle summary inserted into this page ( http://getbootstrap.com/components/#media-default )
				 base.renderSummary = function($widget){
           //Grab the container for this widget
           var $element = $widget.data('element');

           //Summary rendering content
           var summaryPromise = $.Deferred();
           $.when(summaryPromise).then($.proxy(function(){
             var $widget = this;

             //For a summary, we need an extant as well as a target. If the target is the current node, our extant will be a path.
             //If we have a list of node slugs, we will use that as the list and ignore paths
             var node = $widget.data('node');
             var extant = $widget.data('extant');

             if(node == undefined){
               return;
             }else if(node instanceof Array){
               extant = 'list';
             }else if(node.slug == base.currentNode.slug){
               extant = 'path';
             }else if(extant == undefined){
               extant = 'self';
             }

             //Update the extant, so we can use that info inside of the slotCreated event
             $widget.data('extant',extant);

             $widget.on('slotCreated',function(){
               //Depending on the extant, we need to either add the selected node or the node's path.
               $(this).data('element').html('');
               var $summaryContainer = $('<div class="summaryContainer"><div class="items"></div><div class="clearfix visible-xs-block"></div>').appendTo($(this).data('element'));
               switch($(this).data('extant')){
                 case 'path':
                     var nodes = node.getRelatedNodes("path", "outgoing");
                     var n = nodes.length;
                     for (var i=(n-1); i>=0; i--) {
                        widgets.createSummaryFromNode(nodes[i], $summaryContainer.find('.items'));
                     }
                     break;
                 case 'list':
                     var n = node.length;
                     for (var i=(n-1); i>=0; i--) {
                        widgets.createSummaryFromNode(node[i], $summaryContainer.find('.items'));
                     }
                     break;
                 default:
                     widgets.createSummaryFromNode($(this).data('node'),$summaryContainer.find('.items'));
               }
             });

             if($widget.data('slot')!==undefined){
               $widget.trigger('slotCreated');
             }
          },$widget));

          base.getTargetNode($widget, summaryPromise);
				 };

         base.createCardFromNode = function(node,$target){
            var markup = '<div class="col-md-4"><div class="thumbnail">';
            if (node.thumbnail != null) {
            	markup += '<img src="' + node.thumbnail + '" alt="" class="img-responsive center-block">';
            }
            markup += '<div class="caption"><h4 class="heading_font heading_weight">' + node.getDisplayTitle() + '</h4>';
            if (node.current.description != null) {
            	markup += '<p class="description-sm caption_font">' + node.current.description + '</p>';
            }
            markup += '<a href="' + node.url + '" class="btn btn-primary" role="button">Go there</a></div>' +
            		'</div>' +
            	'</div></div>';
            $target.prepend(markup);
         };

         base.createSummaryFromNode = function(node,$target){

              var markup = '<div class="media"><div class="media-left">';
              if (node.thumbnail != null) {
               markup += '<a href="' + node.url + '"><img src="' + node.thumbnail + '" alt="" class="media-object center-block"></a>';
              }
              markup += '</div><div class="media-body"><h4 class="heading_font heading_weight media-heading">' + node.getDisplayTitle() + '</h4>';
              if (node.current.description != null) {
               markup += '<p class="description-sm caption_font">' + node.current.description + '</p>';
              }
              markup += '<a href="' + node.url + '" class="btn btn-primary pull-right" role="button">Go there</a></div>' +
                 '</div>' +
               '</div>';
            $target.prepend(markup);
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
               height = maxWidgetHeight; // this varies depending on window size
             } else {
               vcenter = true;
             }
           }

           var containerLayout = (height==undefined)?"horizontal":"vertical";

           $container.width(width);

           var widgetType = $widget.data('widget');
           $slot.addClass('widget_'+widgetType);

           if(widgetType != 'card' && widgetType != 'summary'){
             $container.css('max-height',maxWidgetHeight);
             if(containerLayout == 'vertical'){
               $container.height(height);
             }
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
              return false;
            });


            $widget.trigger("slotCreated");
				 }

         // Run initializer
         base.init();
     };

     $.scalarwidgets.defaultOptions = {
       "maxWidgetHeight" : 500
     };

     $.fn.scalarwidgets = function(options){
         return this.each(function(){
             (new $.scalarwidgets(this, options));
         });
     };

 })(jQuery);
