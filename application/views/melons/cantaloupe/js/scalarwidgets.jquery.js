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
         base.loadedNodes = [];
         base.carouselCount = 0;

         // Access to jQuery and DOM versions of element
         base.$el = $(el);
         base.el = el;

         // Add a reverse reference to the DOM object
         base.$el.data("scalarwidgets", base);

         base.init = function(){
             if(page.bodyCopyWidth == null){
               page.calculatePageDimensions();
             }
             if(typeof loadedTimeline == 'undefined'){
               loadedTimeline = false;
             }
             base.options = $.extend({},$.scalarwidgets.defaultOptions, options);
             base.book_url = $('link#parent').attr('href');
             base.currentNode = scalarapi.model.getCurrentPageNode();
             //60% of (page height minus header and H1 height)
             maxWidgetHeight = Math.floor((window.innerHeight-179)*.6);
             $(window).on('resize', function(){
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
												loadedTimeline = true;
												for(var i = 0; i < base.pendingWidgets.timeline.length; i++){
														base.pendingWidgets.timeline[i].resolve();
												}
											});
										});
									}
                  //Create a deferred object and add it to a list of promises
									var promise = $.Deferred();
                  promise.then($.proxy(function(){
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
              case 'lens':
                base.renderLens($widget);
                break;
							case 'map':
                if(typeof page.pendingDeferredScripts.GoogleMaps == 'undefined'){
                    page.pendingDeferredScripts.GoogleMaps = [];
                    $.when(
                        $.getScript('https://maps.googleapis.com/maps/api/js?key=' + $('link#google_maps_key').attr('href'))
                    ).then(function(){
                        for(var i = 0; i < page.pendingDeferredScripts.GoogleMaps.length; i++){
                            page.pendingDeferredScripts.GoogleMaps[i].resolve();
                        }
                    });
                    promise = $.Deferred();
                    page.pendingDeferredScripts.GoogleMaps.push(promise);
                    $.when(promise).then($.proxy(function(){
                        base.renderMap($widget);
                    },this));
                } else {
                  base.renderMap($widget);
                }
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
               var handleNodes = $.proxy(function(slugs,promise){
                 if(this.data('node')!=undefined){
                   return;
                 }

                 var nodeList = [];

                 for(var i in slugs){
                   if(base.loadedNodes.indexOf(slugs[i].id) == -1){
                     return;
                   }
                 }
                 for(var i in slugs){
                   var node = jQuery.extend(true, {}, scalarapi.getNode(slugs[i].id));
                   if(slugs[i].children){
                     node.children = {};
                     for(var r in node.outgoingRelations){
                       var child = node.outgoingRelations[r];
                       var type = child.type.body;
                       if(typeof node.children[type] == "undefined"){
                         node.children[type] = [];
                       }
                       node.children[type].push(child.target);
                     }
                   }
                   nodeList.push(node);
                 }

                 this.data('node',nodeList);

                 promise.resolve();
               },$widget,slugs,promise);

               for(var i in slugs){
                 if(base.loadedNodes.indexOf(slugs[i].id) > -1){
                    handleNodes();
                 }else if(typeof base.pendingNodeLoads[slugs[i].id] == 'undefined'){
                    base.pendingNodeLoads[slugs[i].id] = [];
                    base.pendingNodeLoads[slugs[i].id].push(handleNodes);
                    (function(slug,fullReload,base){
                       if(scalarapi.loadPage( slug.id, fullReload, function(){
                          base.loadedNodes.push(slug.id);
                          for(var i in base.pendingNodeLoads[slug.id]){
                            base.pendingNodeLoads[slug.id][i]();
                          }
                       }, null, 1, false, null, 0, 20) == "loaded"){
                        base.loadedNodes.push(slug.id);
                        for(var i in base.pendingNodeLoads[slug.id]){
                          base.pendingNodeLoads[slug.id][i]();
                        }
                       }
                     })(slugs[i],fullReload,base);
                 }else{
                    base.pendingNodeLoads[slugs[i].id].push(handleNodes);
                 }
               }
             }
             else{
     					 var include_children = slug.indexOf('*')>-1;
     					 var slug = slug.replace(/\*/g, '');
               var handleNode = $.proxy(function(slug,promise,include_children){
                if(include_children){
                   var node = jQuery.extend(true, {}, scalarapi.getNode(slug));
                   node.children = {};
                   for(var r in node.outgoingRelations){
                     var child = node.outgoingRelations[r];
                     var type = child.type.body;
                     if(typeof node.children[type] == "undefined"){
                       node.children[type] = [];
                     }
                     node.children[type].push(child.target);
                   }
                   $widget.data('node',[node]);
                 }else{
                   $widget.data('node',[scalarapi.getNode(slug)]);
                 }
                 promise.resolve();
               },$widget,slug,promise,include_children);
               if(base.loadedNodes.indexOf(slug) > -1){
                    handleNode();
               }else if(typeof base.pendingNodeLoads[slug] == 'undefined'){
                  base.pendingNodeLoads[slug] = [handleNode];
                  (function(include_children,slug,base){
                     if(scalarapi.loadPage( slug, fullReload, function(){
                          base.loadedNodes.push(slug);
                          for(var i in base.pendingNodeLoads[slug]){
                            base.pendingNodeLoads[slug][i]();
                          }
                     }, null, 1, false, null, 0, 20) == "loaded"){
                      base.loadedNodes.push(slug);
                      for(var i in base.pendingNodeLoads[slug]){
                        base.pendingNodeLoads[slug][i]();
                      }
                     }
                  })(include_children,slug,base);
               }else{
                  base.pendingNodeLoads[slug].push(handleNode);
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

           var visType = $widget.data( 'visformat' ) || "force-directed";
           var content = $widget.data( 'viscontent' ) || "all";
           if (content == 'all') content = 'all-content';
           if (content == 'toc') content = 'table-of-contents';

           var modifiers = [];
           var contentTypes;
           var relations = $widget.data( 'visrelations' ) || "all";
           switch (relations) {

             case 'all':
             contentTypes = ['all-types'];
             relations = 'any-relationship';
             modifiers.push({
               "type": "filter",
               "subtype": "relationship",
               "content-types": contentTypes,
               "relationship": relations
             });
             break;

             case 'parents-children':
             if (content == 'current') {
               contentTypes = ['all-types'];
             } else {
               contentTypes = [content];
             }
             relations = 'any-relationship';
             modifiers.push({
               "type": "filter",
               "subtype": "relationship",
               "content-types": contentTypes,
               "relationship": relations
             });
             break;

             case 'none':
             // no filter needed
             break;

           }

           var lensObj = {
             "visualization": {
               "type": visType,
               "options": {}
             },
             "components": [
               {
                 "content-selector": null,
                 "modifiers": modifiers
               }
             ],
           }

           if (content == 'current') {
             lensObj.components[0]['content-selector'] = {
               "type": "specific-items",
               "items": [base.currentNode.slug]
             };
           } else {
             lensObj.components[0]['content-selector'] = {
               "type": "items-by-type",
               "content-type": content
             };
           }

           var options = {
               modal: false,
               widget: true,
               content : 'lens',
               lens: lensObj
           }

           visElement.scalarvis( options );
				 };

         //Handle lenses inserted into this page
				 base.renderLens = function($widget){
           //Grab the container for this widget
           var $element = $widget.data('element');
           visElement = $( '<div><div class="caption_font">Loading data...</div></div>' ).appendTo($element);
           var descriptionElement = $widget.data('container').find('.media_description');
           base.getLensData($widget, visElement, descriptionElement);
         }

         base.getLensData = function($widget, visElement, descriptionElement){
           let bookId = $('link#book_id').attr('href');
           let baseURL = $('link#approot').attr('href').replace('application', 'lenses');
           let mainURL = `${baseURL}?book_id=${bookId}`;
           $.ajax({
             url:mainURL,
             type: "GET",
             dataType: 'json',
             contentType: 'application/json',
             async: true,
             context: this,
             success: function(response) {
               let data = response;
               let slug = $widget.data('nodes');
               if (data.length > 0) {
                 data.forEach(lens => {
                   if (lens.slug == slug) {
                     let url = $('link#approot').attr('href').replace('application/','') + 'lenses';
                     $.ajax({
                       url: url,
                       type: "POST",
                       dataType: 'json',
                       contentType: 'application/json',
                       data: JSON.stringify(lens),
                       async: true,
                       context: this,
                       success: (data) => {
                         if ('undefined' != typeof(data.error)) {
                           console.log('There was an error attempting to get Lens data: '+data.error);
                           return;
                         };
                         scalarapi.parsePagesByType(data.items);
                        base.handleLensResults(data, visElement, descriptionElement)
                       },
                       error: function error(response) {
                          console.log('There was an error attempting to communicate with the server.');
                       }
                     });
                   }
                 });
               } else {
                 descriptionElement.parent().prepend('Unable to load lens; it may not have been made public yet.');
               }
             },
             error: function error(response) {
                console.log('There was an error attempting to communicate with the server.');
                console.log(response);
             }
           });
         }

         base.handleLensResults = function(lensObject, visElement, descriptionElement) {
           if (lensObject.visualization) {
             var visOptions = {
                 modal: false,
                 widget: true,
                 content: 'lens',
                 caption: descriptionElement,
                 lens: lensObject
             };
             visElement.empty();
             visElement.scalarvis(visOptions);
           }
           descriptionElement.prepend('<span class="viz-icon lens"></span>');
         }

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
                   if($widget.data('container').data('size') == 'full'){
                      height += 100;
                   }
                 }
                 var footer = $(this).data('container').find('.mediaElementFooter');
                 if (footer.outerHeight() != null) {
                   height -= $(this).data('container').find('.mediaElementFooter').outerHeight();
                 }

                 $gmaps.height(height);

                 var mapOptions = {
                   zoom: 8,
                   mapTypeId: google.maps.MapTypeId.ROADMAP
                 }

                 var map = new google.maps.Map( $gmaps[0], mapOptions );
                 // create info window
                 var infoWindow = new google.maps.InfoWindow({
                   maxWidth: 400
                 });

                 var properties = [
                     'http://purl.org/dc/terms/coverage',
                     'http://purl.org/dc/terms/spatial'
                   ];

                 var markers = [];

                 if(typeof $(this).data('node') == undefined){
                   return;
                 }

                 var nodes = $widget.data('node');
                 var parseNodes = function(nodes,properties,this_markers,map,$gmaps,isChild){
                   var n = nodes.length;
                   var hasNodes = false;
                   // add markers for each content element that has the spatial property
                   for ( var i = 0; i < n; i++ ) {

                     var node = nodes[ i ];
                     for ( var p in properties ) {
                       var property = properties[ p ];
                       if (node.current) {
                         if ( node.current.properties[ property ] != null ) {
                           var o = node.current.properties[ property ].length;
                           for ( j = 0; j < o; j++ ) {
                             var label = null;
                             if(page.addMarkerFromLatLonStrToMap(
                               node.current.properties[ property ][ j ].value,
                               node.getDisplayTitle(),
                               node.current.description,
                               node.url,
                               map,
                               infoWindow,
                               node.getAbsoluteThumbnailURL(),
                               label,
                               $gmaps,
                               this_markers
                             )){
                               hasNodes = true;
                             }
                           }
                         }
                       }
                     }

                     if(typeof node.children != "undefined"){
                       for(var t in node.children){
                         hasNodes = parseNodes(node.children[t],properties,this_markers,map,$gmaps,true) || hasNodes;
                       }
                     }
                   }
                   return hasNodes;
                 };

                 if(parseNodes(nodes,properties,markers,map,$gmaps)){
                   // adjust map bounds to marker bounds
                   var bounds = new google.maps.LatLngBounds();
                   $gmaps.data({'map':map,'bounds':bounds,'markers':markers});
                   $.each( markers, function ( index, marker ) {
                     bounds.extend( marker.position );
                   });
                 }else{
                   $gmaps.append( '<div class="alert alert-danger">Scalar couldn’t find any geographic metadata associated with this page.</div>' );
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
              var prepareTimelineContainer = function($widget){
                $widget.on('slotCreated',function(){
                  $(this).data('element').html('');
                  var $timeline = $('<div class="caption_font timeline_embed"></div>').appendTo($(this).data('element'));
                  $timeline.width($(this).data('element').width());
                  var timelineHeight = $(this).data('element').height();
                  if(timelineHeight == 0){
                    // We want timelines to be max-height of 70%, so remove 60% clamp, then add 70%;
                    // could be written as a number (~1.16666667), but this seemed to be a little less magic-number-y
                    //var height_adjust = (1/.6)*.7;
                    var timelineHeight = (base.options.maxWidgetHeight,maxWidgetHeight) + 100;
                  }
                  var footer = $(this).data('container').find('.mediaElementFooter');
                  if (footer.outerHeight() != null) {
                    timelineHeight -= $(this).data('container').find('.mediaElementFooter').outerHeight();
                  }
                  $timeline.height(timelineHeight - 10);
                  var zoom = $widget.data('zoom')?$widget.data('zoom'):2;
                  var timeline = new TL.Timeline($timeline[0],$(this).data('timeline'),{width:$timeline.width()+200,scale_factor:zoom});
                  $(this).off("slotCreated");
                });

                //Because we asynchronously load the Timeline javascript,
                //it's possible that we've already triggered the slotCreated event
                //before we got here, so check to see if we have a slot and if so,
                //trigger it again.
                if($widget.data('slot')!==undefined){
                 $widget.trigger('slotCreated');
                }
              };

              if($(this).data('timeline') == undefined){
                var tempdata = {
                  events : []
                };

                var nodes = $(this).data('node');

                var parseNodes = function(nodes,tempdata){
                  for(var n in nodes){
                    var node = nodes[n];
                    var currentNode = node.current;
                    if(typeof currentNode.auxProperties != 'undefined' && ((typeof currentNode.auxProperties['dcterms:temporal'] != 'undefined' && currentNode.auxProperties['dcterms:temporal'].length > 0) || (typeof currentNode.auxProperties['dcterms:date'] != 'undefined' && currentNode.auxProperties['dcterms:date'].length > 0))){
                        hasTimelineData = true;
                        if(typeof currentNode.auxProperties['dcterms:temporal'] != 'undefined' && currentNode.auxProperties['dcterms:temporal'].length > 0){
                          var temporal_data = currentNode.auxProperties['dcterms:temporal'][0];
                        }else{
                          var temporal_data = currentNode.auxProperties['dcterms:date'][0];
                        }

                        var entry = page.parseTimelineDate(temporal_data);

                        //Cool, got time stuff out of the way!
                        //Let's do the other components Timeline.js expects
                        entry.text = {
                          headline : '<a href="'+node.url+'">'+node.getDisplayTitle()+'</a>'
                        };

                        if(typeof entry.display_date != 'undefined' && node.getDisplayTitle() == entry.display_date){
                            entry.display_date = "&nbsp;";
                        }

                        if(typeof currentNode.description != 'undefined' && currentNode.description != '' && currentNode.description != null){
                          entry.text.text = currentNode.description
                        }

                        var thumbnail_url = node.getAbsoluteThumbnailURL();

                        //Now just check to make sure this node is a media node or not - if so, add it to the timeline entry
                        if(typeof node.scalarTypes.media !== 'undefined'){
                          entry.media = {
                            url : currentNode.sourceFile,
                            thumbnail : thumbnail_url
                          };
                          var mediaType = TL.lookupMediaType(entry.media);

                          if(mediaType.type=='imageblank' && thumbnail_url != null){
                            entry.media.url = thumbnail_url;
                          }else if(mediaType.type=='imageblank'){
                            delete entry.media;
                          }
                        }else if(typeof node.thumbnail !== 'undefined' && node.thumbnail != null && node.thumbnail != '') {
                          entry.media = {
                            url : thumbnail_url,
                            thumbnail : thumbnail_url
                          };
                        }

                        if(typeof node.background !== 'undefined'){
                          entry.background = {url:base.book_url+node.background}
                        }

                        tempdata.events.push(entry);

                    }

                    if(typeof node.children != "undefined"){
                      for(var t in node.children){
                        parseNodes(node.children[t], tempdata);
                      }
                    }
                  }
                }

                parseNodes(nodes,tempdata);

                $(this).data('timeline',tempdata);

              }

              prepareTimelineContainer($(this));

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
             base.carouselCount++;
             var carouselId = "carousel-" + base.carouselCount;
             var $carousel = $('<div id="' + carouselId + '" class="carousel slide" data-interval="false" style=""></div>').appendTo($element);
             var $wrapper = $( '<div class="carousel-inner" role="listbox"></div>' ).appendTo( $carousel );

             if ( page.adaptiveMedia == "mobile" ) {
               var galleryHeight = 300;
             } else {
               // this magic number matches a similar one in the calculateContainerSize method of jquery.mediaelement.js;
               // keeping them synced up helps keep media vertically aligned in galleries
               if($widget.parents('.placeholder').length > 0){
                var galleryHeight = Math.min(200,base.options.maxWidgetHeight,maxWidgetHeight);
               }else{
                var galleryHeight = Math.min(base.options.maxWidgetHeight,maxWidgetHeight);
               }

               if($widget.data('container').data('size') == 'full'){
                  galleryHeight += 100;
               }
             }
             $carousel.css('min-height',galleryHeight+'px');
             var media_nodes = [];
             var index = 0;
              var calculateMediaNodes = function(nodes){
                var n = nodes.length;
                for ( var i = 0; i < n; i++ ) {
                  var node = nodes[i];
                  if (node.scalarTypes != undefined) {
                    if(typeof node.scalarTypes.media != 'undefined'){
                      media_nodes[index++] = node;
                    }
                    if(typeof node.children != "undefined"){
                      for(var t in node.children){
                        calculateMediaNodes(node.children[t]);
                      }
                    }
                  }
                }
              }

               calculateMediaNodes($widget.data('node'));

               var parseNodes = function(nodes,galleryHeight,gallerySize,hasMedia){
                    var n = nodes.length;
                    for (var i = 0; i < n; i++) {
                        var node = nodes[i];

                        var item = $('<div class="item" style="height : ' + galleryHeight + 'px;"></div>').appendTo($wrapper);
                        if (!hasMedia) {
                            var hasMedia = true;
                            item.addClass("active");
                        }

                        // if this is a media link that's already part of the content of the page, then use it
                        var mediaContainer = $('<span><a href="' + node.current.sourceFile + '" resource="' + node.slug + '" data-size="' + gallerySize + '" data-caption="none" data-align="center">' + node.slug + '</a></span>').appendTo(item);
                        var link = mediaContainer.find('a');
                        link.css('display', 'none');

                        if (node.current.description != null) {
                            var description = node.current.description;
                            if (node.current.source != null) {
                                description += ' (Source: ' + node.current.source + ')';
                            }
                            description = description.replace(new RegExp("\"", "g"), '&quot;');

                            item.append('<div class="carousel-caption caption_font"><span>' +
                                '<a href="javascript:;" role="button" data-toggle="popover" data-placement="bottom" data-trigger="hover" data-title="' + node.getDisplayTitle().replace('"', '&quot;') + '" data-content="' + description + '">' + node.getDisplayTitle() + '</a>' + ($widget.data('hide_numbering') != undefined ? '' : (' (' + (i + 1) + '/' + n + ')')) +
                                '</span></div>');
                        } else {
                            item.append('<div class="carousel-caption caption_font"><span>' +
                                '<a href="javascript:;" >' + node.getDisplayTitle() + '</a>' + ($widget.data('hide_numbering') != undefined ? '' : (' (' + (i + 1) + '/' + n + ')')) +
                                '</span></div>');
                        }
                        item.find('a').data('node', node).on('click', function() {
                          if ($('.media_details').css('display') == 'none') {
                              page.mediaDetails.show($(this).data('node'));
                          }
                        });
                        page.addMediaElementForLink(link, mediaContainer, galleryHeight, {vcenter: true});
                    }
               };

               if(media_nodes.length > 0){
                 parseNodes(media_nodes,galleryHeight,$widget.data('container').data('size'));
                 if ( page.adaptiveMedia != "mobile" ) {
      							$wrapper.find( '[data-toggle="popover"]' ).popover( {
      								container: '#' + carouselId,
                      html: true,
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
                  $carousel.find('.carousel-control').on('click', function(e){
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
                }else{
                  $carousel.find('.loading').text("No media items found!");
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

             var nodes = $widget.data('node');

             $widget.on('slotCreated',function(){
               $(this).data('element').html('');
               var $cardContainer = $('<div class="row cardContainer"></div>').appendTo($(this).data('element'));
               var parseNodes = function(nodes,$cardContainer){
                 var n = nodes.length;
                 for (var i=0; i<n; i++) {
                    var node = nodes[i];
                    widgets.createCardFromNode(node, $cardContainer);
                    if(typeof node.children != "undefined"){
                      for(var t in node.children){
                        parseNodes(node.children[t],$cardContainer);
                      }
                    }
                 }
               }
               parseNodes(nodes,$cardContainer);

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

             var nodes = $widget.data('node');

             $widget.on('slotCreated',function(){
               $(this).data('element').html('');
               var $summaryContainer = $('<ul class="media-list"></ul>').appendTo($(this).data('element'));
               var parseNodes = function(nodes,$summaryContainer){
                 var n = nodes.length;
                 for (var i=0; i<n; i++) {
                    var node = nodes[i];
                    var children = [];
                    if(typeof node.children != "undefined"){
                      for(var t in node.children){
                        children = children.concat(node.children[t]);
                      }
                    }
                    widgets.createSummaryFromNode(node, $summaryContainer,children);
                 }
                 return true;
               }
               if(parseNodes(nodes,$summaryContainer)){
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
               }
               $(this).off("slotCreated");
             });

             if($widget.data('slot')!==undefined){
               $widget.trigger('slotCreated');
             }
          },$widget));

          base.getTargetNode($widget, summaryPromise, true);
				 };

         base.createCardFromNode = function(node,$target){
            var markup = '<div class="card"><div class="thumbnail">';
            if(typeof node.current.mediaSource != 'undefined' && node.current.mediaSource.contentType == 'image' && !node.current.mediaSource.isProprietary){
              markup += '<div class="thumbnail_container"><img src="' + node.current.sourceFile + '" alt="" class="img-responsive center-block"></div><hr />';
            }else if (node.thumbnail != null) {
            	markup += '<div class="thumbnail_container"><img src="' + node.getAbsoluteThumbnailURL() + '" alt="" class="img-responsive center-block"></div><hr />';
            }
            markup += '<div class="caption"><h4 class="heading_font heading_weight">' + node.getDisplayTitle() + '</h4>';
            if (node.current.description != null) {
            	markup += '<p class="description-sm">' + node.current.description + '</p>';
            }
            markup += '<a href="' + node.url + '" class="goThereLink btn btn-default" role="button">Go there &raquo;</a><span class="clearfix"></span></div><span class="clearfix"></span>' +
            		'</div>' +
            	'</div></div>';
            $target.append(markup);
         };

         base.createSummaryFromNode = function(node,$target,children){
              if(typeof children == 'undefined'){
                children = [];
              }

              var markup = '<li class="media summary"><div class="media-left">';
              if (node.thumbnail != null) {
               markup += '<a href="' + node.url + '"><img src="' + node.getAbsoluteThumbnailURL() + '" alt="" class="media-object center-block"></a>';
              }
              markup += '</div><div class="media-body"><h4 class="heading_font heading_weight media-heading">' + node.getDisplayTitle() + '</h4>';
              if (node.current.description != null) {
                markup += '<p class="description-sm">' + node.current.description +'</p>';
              }
              markup += '<a href="' + node.url + '" class="goThereLink btn btn-xs btn-default" role="button">Go there &raquo;</a><span class="clearfix"></span>';

              if(children.length > 0){
                markup += '<ul class="media-list">';
                for(var i in children){
                  var child = children[i];
                  markup += '<li class="media summary"><div class="media-left">';
                  if (child.thumbnail != null) {
                   markup += '<a href="' + child.url + '"><img src="' + child.getAbsoluteThumbnailURL() + '" alt="" class="media-object center-block"></a>';
                  }
                  markup += '</div><div class="media-body"><h4 class="heading_font heading_weight media-heading">' + child.getDisplayTitle() + '</h4>';
                  if (child.current.description != null) {
                    markup += '<p class="description-sm">' + child.current.description +'</p>';
                  }
                  markup += '<a href="' + child.url + '" class="goThereLink btn btn-xs btn-default" role="button">Go there &raquo;</a><span class="clearfix"></span></div></li>';
                }
                markup += '</ul>';
              }

              markup += '</div></li>';
            $target.append(markup);
         };

         base.calculateSize = function($widget){
           if($widget.parents('.placeholder').length > 0){
            var $container = $widget.data('container');
            var $slot = $widget.data('slot');
            var widgetType = $widget.data('widget');
            $slot.addClass('widget_'+widgetType);
            if(widgetType == 'carousel'){
               $container.css('min-height','200px');
             }
             $slot.appendTo($widget.parents('.placeholder').find('.body'));
            $('body').trigger("widgetElementLoaded");
            return;
           }
           var bodyWidth = page.bodyCopyWidth;
           var $slot = $widget.data('slot');
           var $container = $widget.data('container');
           var $parent = $widget.data('parent');
           var size = $widget.data('size');
           var height = $widget.data('height');

           var inline = $widget.data('inline');
           var align = $widget.data('align');

           if ( align == undefined ) {
             align = 'right';
           }

           $slot.detach();

           $slot.removeClass().addClass('widget_slot');
           $container.removeClass().addClass('widgetContainer well');

           if ( page.adaptiveMedia == 'mobile' ) {
            size = 'full';
           }else if ( size == undefined ) {
            size = 'medium';
           }
           $slot.addClass(size+'_widget');
           var $temp = $( '<div class="' + size + '_dim">&nbsp;</div>').appendTo( '.page' );
           var width = Math.min( parseInt( $( '.page' ).width() ), parseInt( $temp.width() ));
           $temp.remove();

           // break point for large widgets to become full
           if (( size == 'large' ) && (( page.pageWidthMinusMargins - page.bodyCopyWidth ) < 160 )) {
             size = "full";
             width = page.pageWidth;
           // break point for medium widgets to become full
           } else if (( size == 'medium' ) && ( width > ( page.bodyCopyWidth - 160 ))) {
             size = "full";
             width = page.pageWidth;
           }

           vcenter = false;
           if ( size == 'full' || size == 'native') {
             if ( height == null ) {
               height = maxWidgetHeight; // this varies depending on window size
             } else {
               vcenter = true;
             }
           }

           if (size == 'large' && (align == 'left' || inline)) {
             // we want 'large' inline or left-aligned widgets to be as wide as the text
             width = page.bodyCopyWidth;
           }

           var containerLayout = (height==undefined)?"horizontal":"vertical";

           $container.width(width);

           var widgetType = $widget.data('widget');
           $slot.addClass('widget_'+widgetType);

           if(widgetType != 'card' && widgetType != 'visualization' && widgetType != 'summary' && widgetType != 'carousel' ){
             if(containerLayout == 'vertical'){
             }
           }else if(widgetType == 'carousel'){
             $container.css('min-height','200px');
           }

           if ( inline ) {

             $slot.addClass(align+'_slot');
             $widget.after( $slot );
             $widget.hide();

             if ( size != 'full' ) {

               // wrap the widget in a body copy element so its alignment happens inside the
               // dimensions of the body copy
               if ($slot.parents('.body_copy').length == 0) {
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
               $slot.addClass( 'full' );
               $container.addClass('page_margins');
               $container.find('.media_description').addClass('body_copy');
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

           $container.data('size',size);

           $('body').trigger("widgetElementLoaded");
         }

				 //Implementation of slot manager for widgets
				 base.createWidgetSlot = function($widget){
            var $slot = $('<div class="widget_slot"></div>');
            var $container = $('<div class="widgetContainer well"></div>').appendTo($slot);
            $container.append($widget.data('element'));
            var slug = undefined;
            if($widget.data('nodes') != undefined){
              slug = $widget.data('nodes').replace(/\*/g, '');
            }else if($widget.attr('resource') != undefined){
              slug = $widget.attr('resource').replace(/\*/g, '');
            }
            if($widget.data('caption')!=undefined && $widget.data('caption')!='none' && ($widget.data('caption')=='custom_text' || (slug!=undefined && slug.indexOf(',')==-1))){

              var $widgetinfo = $('<div class="mediaElementFooter caption_font mediainfo"></div>').appendTo($container);

              var $descriptionPane = $('<div class="media_description pane"></div>').appendTo($widgetinfo);
              var caption_type = $widget.data('caption');
              if(caption_type=='custom_text'){
                $descriptionPane.html('<p>'+$widget.data('custom_caption')+'</p>').css('display','block');
              } else {
                (function($widget,$descriptionPane,caption_type,slug){
                  var load_caption = function(node){
                    switch ( caption_type ) {

              				case 'title':
              				description = '<div><a href="' + node.url + '"><strong>' + node.getDisplayTitle() + '</strong></a></div>';
              				break;

              				case 'title_and_description':
              				if ( node.current.description != null ) {
              					description = '<div><a href="' + node.url + '"><strong>' + node.getDisplayTitle() + '</strong></a><br>' + node.current.description + '</div>';
              				} else {
              					description = '<div><a href="' + node.url + '"><strong>' + node.getDisplayTitle() + '</strong></a></div>';
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
                })($widget,$descriptionPane,caption_type,slug);
              }
            }
            var parent = $widget.closest('.body_copy');

            // if the link is not a descendant of a body_copy region, then we'll put the media either
            // before or after the link itself
            if (parent.length == 0) {
                parent = $widget;
            }

            $widget.data({
                container: $container,
                slot: $slot,
                parent: parent
            });

            //$(window).on('resize',$.proxy(function(){widgets.calculateSize($(this));},$widget));
            base.calculateSize($widget);

            $widget.on('click', function(){

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

          	if($widget.hasClass('wrap')){
          		$slot.addClass('wrapped_slot');
          	}

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
