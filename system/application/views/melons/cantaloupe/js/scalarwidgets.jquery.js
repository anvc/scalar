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
         base.pendingNodeLoads = {};
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

           var $element = $('<div class="widgetElement"></div>').data('widget',$widget);
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

         base.getTargetNode = function($widget, promise, fullReload){
           if(typeof fullReload == "undefined" || fullReload!==true){
             fullReload = false;
           }
           if($widget.attr('resource') == undefined && $widget.data('nodes') == undefined){
             //Use the current node, if it has related chronological nodes
             $widget.data('node',base.currentNode);
             promise.resolve();
           }else{
             //We have a target node
             if($widget.data('nodes') != undefined){
               var slug = $widget.data('nodes');
             }else{
               var slug = $widget.attr('resource');
             }
             if(slug.indexOf(',') > -1){
               var slugs = [];
               var slug_list = slug.split(',');
               for(var i in slug_list){
                   var include_children = slug_list[i].indexOf('*')>-1;
                   var slug = slug_list[i].replace(/\*/g, '');
                  slugs.push({id : slug, children: include_children, loaded : false});
               }
               $widget.removeData('node');
               for(var i in slugs){

                 (function(slug,promise,slugs){


                   if(scalarapi.loadPage( slug.id, fullReload, function(){

                     if($widget.data('node')!=undefined){
                       return;
                     }

                     var nodeList = [];

                     slug.loaded = true;
                     for(var i in slugs){
                       if(!slugs[i].loaded){
                         return;
                       }
                     }
                     for(var i in slugs){
                       var node = scalarapi.getNode(slugs[i].id);
                       nodeList.push(node);
                       if(slugs[i].children){
                         for(var r in node.outgoingRelations){
                           nodeList.push(node.outgoingRelations[r].target);
                         }
                       }
                     }

                     $widget.data('node',nodeList);

                     promise.resolve();
                   }, null, 1, false, null, 0, 20) == "loaded"){

                      if($widget.data('node')!=undefined){
                        return;
                      }

                     var nodeList = [];

                     slug.loaded = true;

                     for(var i in slugs){
                       if(!slugs[i].loaded){
                         return;
                       }
                     }

                     for(var i in slugs){
                       var node = scalarapi.getNode(slugs[i].id);
                       nodeList.push(node);
                       if(slugs[i].children){
                         for(var r in node.outgoingRelations){
                           nodeList.push(node.outgoingRelations[r].body);
                         }
                       }
                     }


                     $widget.data('node',nodeList);

                     promise.resolve();
                   }
                 })(slugs[i],promise,slugs);
               }
             }else{

     					 var include_children = slug.indexOf('*')>-1;
     					 var slug = slug.replace(/\*/g, '');

               if(typeof base.pendingNodeLoads[slug] == "undefined"){
                 base.pendingNodeLoads[slug] = [];
               }
               base.pendingNodeLoads[slug].push({widget:$widget,promise:promise,children:include_children});
               if(scalarapi.loadPage( slug, fullReload, function(){
                   for(var i in base.pendingNodeLoads[slug]){
                     if(base.pendingNodeLoads[slug][i].children){
                       var node = scalarapi.getNode(slug);
                       base.pendingNodeLoads[slug][i].widget.data('node',[node]);
                       for(var r in node.outgoingRelations){
                         base.pendingNodeLoads[slug][i].widget.data('node').push(node.outgoingRelations[r].target);
                       }
                     }else{
                       base.pendingNodeLoads[slug][i].widget.data('node',[scalarapi.getNode(slug)]);
                     }
                     base.pendingNodeLoads[slug][i].promise.resolve();
                   }
                   base.pendingNodeLoads[slug] = [];
               }, null, 1, false, null, 0, 20) == "loaded"){
                 for(var i in base.pendingNodeLoads[slug]){
                   if(base.pendingNodeLoads[slug][i].children){
                     var node = scalarapi.getNode(slug);
                     base.pendingNodeLoads[slug][i].widget.data('node',[node]);
                     for(var r in node.outgoingRelations){
                       base.pendingNodeLoads[slug][i].widget.data('node').push(node.outgoingRelations[r].target);
                     }
                   }else{
                     base.pendingNodeLoads[slug][i].widget.data('node',[scalarapi.getNode(slug)]);
                   }
                   base.pendingNodeLoads[slug][i].promise.resolve();
                 }
                 base.pendingNodeLoads[slug] = [];
               }
             }
           }
         }

				 //Handle visualizations inserted into this page
				 base.renderVisualization = function($widget){
           //Grab the container for this widget
           $widget.data('slot').addClass(($widget.data( 'visformat' ) || "force-directed")+"_visualization");
           var $element = $widget.data('element');

           //Visualization rendering content

           var visElement = $( '<div></div>' ).appendTo($element);

           var options = {
               modal: false,
               widget: true,
               content : $widget.data( 'viscontent' ) || "all",
               relations : $widget.data( 'visrelations' ) || "all",
               format : $widget.data( 'visformat' ) || "force-directed"
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

                 var property, contents, node, contentString, label, pathIndex,
                   properties = [
                     'http://purl.org/dc/terms/coverage',
                     'http://purl.org/dc/terms/spatial'
                   ]
                   markers = null;

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
                        markers = page.addMarkerFromLatLonStrToMap(
                         node.current.properties[ property ][ i ].value,
                         node.getDisplayTitle(),
                         node.current.description,
                         null,
                         map,
                         infoWindow,
                         node.thumbnail,
                         null,
                         $gmaps,
                         markers
                       );
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

                         markers = page.addMarkerFromLatLonStrToMap(
                           node.current.properties[ property ][ j ].value,
                           node.getDisplayTitle(),
                           node.current.description,
                           node.url,
                           map,
                           infoWindow,
                           node.thumbnail,
                           label,
                           $gmaps,
                           markers
                         );
                       }
                     }
                   }

                 }
                 // no valid coords found on page or its children
                 if ( markers == null ) {
                   $gmaps.append( '<div class="alert alert-danger" style="margin: 1rem;">Scalar couldn’t find any geographic metadata associated with this page.</div>' );
                 }else{
                   // adjust map bounds to marker bounds
                   var bounds = new google.maps.LatLngBounds();
                   $gmaps.data({'map':map,'bounds':bounds,'markers':markers});
                   $.each( markers, function ( index, marker ) {
                     bounds.extend( marker.position );
                   });
                   if ( markers != null ) {
                     map.fitBounds(bounds);
                   }

                   var doResize = $.proxy(function(){
                     var markers = $(this).data('markers');
                     if(markers.length > 1){
                       $(this).data('map').fitBounds($(this).data('bounds'));
                     }
                   },$gmaps);

                   $(window).on('resize',doResize);
                 }

                 $(this).off("slotCreated");
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
              if($(this).data('timeline') == undefined){
                var tempdata = {
                  events : []
                };

                for(var n in $(this).data('node')){
                  var node = $(this).data('node')[n].current;
                  if(typeof node.auxProperties != 'undefined' && ((typeof node.auxProperties['dcterms:temporal'] != 'undefined' && node.auxProperties['dcterms:temporal'].length > 0) || (typeof node.auxProperties['dcterms:date'] != 'undefined' && node.auxProperties['dcterms:date'].length > 0))){
                      var entry = {};
                      var useDateStringAsDateValue = false;
                      if(typeof node.auxProperties['dcterms:temporal'] != 'undefined' && node.auxProperties['dcterms:temporal'].length > 0){
                        var temporal_data = node.auxProperties['dcterms:temporal'][0];
                      }else{
                        var temporal_data = node.auxProperties['dcterms:date'][0];
                      }

                      var dashCount = (temporal_data.match(/-/g) || []).length;
                      var slashCount = (temporal_data.match(/\//g) || []).length;

                      var contains_seperator = (temporal_data.indexOf(" until ")+temporal_data.indexOf(" to "))>-2;
                      if(dashCount != 1 && !contains_seperator){
                        //Assume we have a single date, either dash seperated (more than one dash) or slash seperated (no dash)
                        var d_string = temporal_data.replace(/~+$/,''); //strip whitespace
                        var d = new Date(d_string);  //parse as a date
                        if(d instanceof Date){
                          entry.start_date = parseDate(d,d_string);
                        }
                        if(dashCount < 2 || slashCount < 2){
                          useDateStringAsDateValue = true;
                        }
                      }else{
                        if(contains_seperator){
                          temporal_data = temporal_data.replace('from ','');
                          if(temporal_data.indexOf(" until ") >= 0){
                            var dateParts = temporal_data.split(" until ");
                          }else{
                            var dateParts = temporal_data.split(" to ");
                          }
                        }else{
                          var dateParts = temporal_data.replace(' - ','-').split('-');
                        }

                        //We should now have two dates - a start and and end
                        if(dateParts.length == 2){
                          dateParts[0] = dateParts[0].replace(/~+$/,''); //Remove white space
                          dateParts[1] = dateParts[1].replace(/~+$/,''); //Remove white space

                          for(var x in dateParts){
                            var dashCount = (dateParts[x].match(/-/g) || []).length;
                            var slashCount = (dateParts[x].match(/\//g) || []).length;

                            if(dashCount < 2 || slashCount < 2){
                              useDateStringAsDateValue = true;
                              break;
                            }
                          }

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
                        headline : '<a href="'+$(this).data('node')[n].url+'">'+$(this).data('node')[n].getDisplayTitle()+'</a>'
                      };

                      if(useDateStringAsDateValue){
                        entry.display_date =  temporal_data.replace(/~+$/,'');
                        if($(this).data('node')[n].getDisplayTitle() == entry.display_date){
                          entry.display_date = "&nbsp;";
                        }
                      }

                      if(typeof node.description != 'undefined' && node.description != '' && node.description != null){
                        entry.text.text = node.description
                      }

                      //Parse thumbnail url
                      var thumbnail_url = $(this).data('node')[n].thumbnail;
                      if(thumbnail_url != null && thumbnail_url.indexOf("http:")!=0&&thumbnail_url.indexOf("https:")!=0){
                        thumbnail_url = base.book_url+thumbnail_url;
                      }

                      //Now just check to make sure this node is a media node or not - if so, add it to the timeline entry
                      if(typeof $(this).data('node')[n].scalarTypes.media !== 'undefined'){
                        entry.media = {
                          url : node.sourceFile,
                          thumbnail : thumbnail_url
                        };
                      }else if(typeof $(this).data('node')[n].thumbnail !== 'undefined' && $(this).data('node')[n].thumbnail != null && $(this).data('node')[n].thumbnail != '') {
                        entry.media = {
                          url : thumbnail_url,
                          thumbnail : thumbnail_url
                        };
                      }

                      if(typeof $(this).data('node')[n].background !== 'undefined'){
                        entry.background = {url:base.book_url+$(this).data('node')[n].background}
                      }

                      tempdata.events.push(entry);
                  }
                }
                $(this).data('timeline',tempdata);
              }

              //Timeline rendering content
              var $widget = this;
              $widget.on('slotCreated',function(){
                $(this).data('element').html('');
                var $timeline = $('<div class="caption_font timeline_embed"></div>').appendTo($(this).data('element'));
                $timeline.width($(this).data('element').width());
                var height = $(this).data('element').height();
                if(height == 0){
                  // We want timelines to be max-height of 70%, so remove 60% clamp, then add 70%;
                  // could be written as a number (~1.16666667), but this seemed to be a little less magic-number-y
                  var height_adjust = (1/.6)*.7;
                  height = Math.min(base.options.maxWidgetHeight*height_adjust,maxWidgetHeight*height_adjust);
                }
                $timeline.height(height - 10);
                var timeline = new TL.Timeline($timeline[0],$(this).data('timeline'),{width:$timeline.width()+200});

                $(this).off("slotCreated");
              });

              //Because we asynchronously load the Timeline javascript,
              //it's possible that we've already triggered the slotCreated event
              //before we got here, so check to see if we have a slot and if so,
              //trigger it again.
              if($widget.data('slot')!==undefined){
               $widget.trigger('slotCreated');
              }

            },$widget));

            base.getTargetNode($widget, timelinePromise, true);
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
               //Get the media nodes...
               var nodes = [];
               if($widget.data('node') instanceof Array){
                 for(var n in $widget.data('node')){
                   if(typeof $widget.data('node')[n].scalarTypes.media != 'undefined'){
                     nodes.push($widget.data('node')[n]);
                   }
                 }
               }else{
                 if(typeof $widget.data('node').scalarTypes.media != 'undefined'){
                   nodes.push($widget.data('node'));
                 }
               }

               var n = nodes.length;

               var $carousel = $('<div class="carousel slide" data-interval="false"></div>').appendTo($element);
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
                 var mediaContainer = $('<span><a href="'+node.current.sourceFile+'" resource="'+node.slug+'" data-size="full" data-caption="none">'+node.slug+'</a></span>').appendTo( item );
 								 var link = mediaContainer.find( 'a' );
 								 link.css('display', 'none');

                 if ( node.current.description != null ) {
   								description = node.current.description;
   								if ( node.current.source != null ) {
   									description += ' (Source: ' + node.current.source + ')';
   								}
   								description = description.replace( new RegExp("\"", "g"), '&quot;' );
   								item.append( '<div class="carousel-caption caption_font"><span>' +
   									'<a href="' + node.url + '" role="button" data-toggle="popover" data-placement="bottom" data-trigger="hover" data-title="' + node.getDisplayTitle().replace( '"', '&quot;' ) + '" data-content="' + description + '">' + node.getDisplayTitle() + '</a>' + ($widget.data('hide_numbering')!=undefined?'':(' ('+( i + 1 ) + '/' + n + ')')) +
   									'</span></div>' );
   							} else {
   								item.append( '<div class="carousel-caption caption_font"><span>' +
   									'<a href="' + node.url + '" >' + node.getDisplayTitle() + '</a>'+($widget.data('hide_numbering')!=undefined?'':(' ('+( i + 1 ) + '/' + n + ')')) +
   									'</span></div>' );
   							}

                 page.addMediaElementForLink( link, mediaContainer, galleryHeight );
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

                $carousel.carousel( { interval: false } );
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
                $(this).off("slotCreated");
             });

             if($widget.data('slot')!==undefined){
               $widget.trigger('slotCreated');
             }

           },$widget));

           base.getTargetNode($widget, carouselPromise, true);
				 };

				 //Handle card inserted into this page ( http://getbootstrap.com/components/#thumbnails-custom-content )
				 base.renderCard = function($widget){
           //Grab the container for this widget
           var $element = $widget.data('element');

           //Card rendering content
           var cardPromise = $.Deferred();
           $.when(cardPromise).then($.proxy(function(){
             var $widget = this;

             var node = $widget.data('node');
             if(!$.isArray(node)){
               node = [node];
             }

             $widget.on('slotCreated',function(){
               $(this).data('element').html('');
               var $cardContainer = $('<div class="row cardContainer"></div>').appendTo($(this).data('element'));
               var n = node.length;
               for (var i=(n-1); i>=0; i--) {
                  widgets.createCardFromNode(node[i], $cardContainer);
               }
               $(this).off("slotCreated");
             });

             if($widget.data('slot')!==undefined){
               $widget.trigger('slotCreated');
             }
          },$widget));

          base.getTargetNode($widget, cardPromise, true);
				 };

				 //Handle summary inserted into this page ( http://getbootstrap.com/components/#media-default )
				 base.renderSummary = function($widget){
           //Grab the container for this widget
           var $element = $widget.data('element');

           //Summary rendering content
           var summaryPromise = $.Deferred();
           $.when(summaryPromise).then($.proxy(function(){
             var $widget = this;

             var node = $widget.data('node');
             if(!$.isArray(node)){
               node = [node];
             }

             $widget.on('slotCreated',function(){
               $(this).data('element').html('');
               var $summaryContainer = $('<ul class="media-list"></ul>').appendTo($(this).data('element'));
               var n = node.length;
               for (var i=(n-1); i>=0; i--) {
                  widgets.createSummaryFromNode(node[i], $summaryContainer);
               }
               if($summaryContainer.find('img').length > 0){
                 $summaryContainer.addClass('hasThumbnail');
               }
               $summaryContainer.find('.description-sm').each(function(){
                 var num_lines = 4;
                 var line_height = parseInt($(this).css('line-height'));
                 $(this).dotdotdot({
                		ellipsis	: '…',
                    wrap		: 'word',
                    fallbackToLetter: true,
                    height		: num_lines*line_height
                	});
               });
               $(this).off("slotCreated");
             });

             if($widget.data('slot')!==undefined){
               $widget.trigger('slotCreated');
             }
          },$widget));

          base.getTargetNode($widget, summaryPromise, true);
				 };

         base.createCardFromNode = function(node,$target){
            var widget_size = $target.parents('.widgetElement').data('widget').data('size');
            var markup = '<div class="card"><div class="thumbnail">';
            if(typeof node.current.mediaSource != 'undefined' && node.current.mediaSource.contentType == 'image' && !node.current.mediaSource.isProprietary){
              markup += '<div class="thumbnail_container"><img src="' + node.current.sourceFile + '" alt="" class="img-responsive center-block"></div><hr />';
            }else if (node.thumbnail != null) {
            	markup += '<div class="thumbnail_container"><img src="' + node.thumbnail + '" alt="" class="img-responsive center-block"></div><hr />';
            }
            markup += '<div class="caption"><h4 class="heading_font heading_weight">' + node.getDisplayTitle() + '</h4>';
            if (node.current.description != null) {
            	markup += '<p class="description-sm">' + node.current.description + '</p>';
            }
            markup += '<a href="' + node.url + '" class="goThereLink btn btn-primary" role="button">Go there &raquo;</a></div><span class="clearfix"></span>' +
            		'</div>' +
            	'</div></div>';
            $target.prepend(markup);
         };

         base.createSummaryFromNode = function(node,$target){

              var markup = '<li class="media summary"><div class="media-left">';
              if (node.thumbnail != null) {
               markup += '<a href="' + node.url + '"><img src="' + node.thumbnail + '" alt="" class="media-object center-block"></a>';
              }
              markup += '</div><div class="media-body"><a href="' + node.url + '"><h4 class="heading_font heading_weight media-heading">' + node.getDisplayTitle() + '</h4></a>';
              if (node.current.description != null) {
               markup += '<p class="description-sm">' + node.current.description + '</p>';
              }
              markup += '<a href="' + node.url + '" class="goThereLink btn btn-primary" role="button">Go there &raquo;</a></div><span class="clearfix"></span>' +
              		'</div>' +
              	'</div></li>';
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
           $slot.addClass(size+'_widget');
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

           if(widgetType != 'card' && widgetType != 'visualization' && widgetType != 'summary'){
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
            if($widget.data('caption')!=undefined || $widget.data('caption')=='none'){
              var $widgetinfo = $('<div class="mediaElementFooter caption_font mediainfo"></div>').appendTo($container);
              var $descriptionPane = $('<div class="media_description pane"></div>').appendTo($widgetinfo);
              var caption_type = $widget.data('caption');
              if(caption_type=='custom_text'){
                $descriptionPane.html('<p>'+$widget.data('custom_caption')+'</p>').css('display','block');
              }else{
                (function($widget,$descriptionPane,caption_type){
                  if($widget.data('nodes') != undefined){
                    var slug = $widget.data('nodes').replace(/\*/g, '');
                  }else{
                    var slug = $widget.attr('resource').replace(/\*/g, '');
                  }
                  var load_caption = function(node){
                    switch ( caption_type ) {

              				case 'title':
              				description = node.getDisplayTitle();
              				break;

              				case 'title_and_description':
              				if ( node.current.description != null ) {
              					description = '<strong>' + node.getDisplayTitle() + '</strong><br>' + node.current.description;
              				} else {
              					description = node.getDisplayTitle();
              				}
              				break;

              				default:
              				description = node.current.description;
              				if ( node.current.description == null ) {
              					description = '<p><i>No description available.</i></p>';
              				}
              				break;

              			}
                    $descriptionPane.html(description).css('display','block');
                  };
                  if(scalarapi.loadPage( slug, true, function(){
                    load_caption(scalarapi.getNode(slug));
                  }, null, 1, false, null, 0, 20) == "loaded"){
                    load_caption(scalarapi.getNode(slug));
                  }
                })($widget,$descriptionPane,caption_type);
              }
            }
            $widget.data({
                container: $container,
                slot: $slot,
                parent: $widget.parent()
            });

            //$(window).on('resize',$.proxy(function(){widgets.calculateSize($(this));},$widget));

            base.calculateSize($widget);

            $widget.click(function(){

              var scroll_buffer = 100;
              var scroll_time = 750;
              var $body = $('html,body');
              var $slot = $(this).data('slot');
              if (!(($slot.offset().top + $slot.height()) <= (-$body.offset().top + $body.height()) &&
                      $slot.offset().top >= (-$body.offset().top))) {
                  $body.animate({
                      scrollTop: $slot.offset().top - scroll_buffer
                  }, scroll_time);
              }
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
