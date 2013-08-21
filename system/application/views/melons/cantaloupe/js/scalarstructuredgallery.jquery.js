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

	$.scalarstructuredgallery = function(e, options) {

		var SortMethod = {
			Alpha: 'Alpha'
		}
		
		var DisplayMode = {
			All: 'All',
			Path: 'Path',
			Tag: 'Tag'
		}
	
		var element = e;
		var controlBar;
		var mediaContainer;
		var historyBtn;
		var shrinkBtn;
		var expandBtn;
		var allBtn;
		var pathBtn;
		var tagBtn;
		var thumbnailHeight = 84;
		var currentScale = 1.0;
		var mediaCollection;
		var childPaths;
		var childTags;
		var relationships = ['path', 'tag', 'referee'];
		var mediaDetails;
			
		var gallery = {
			options: $.extend({
			}, options),
			
			gatherChildMedia: function(node, maxDepth, currentDepth, collection) {
				if (currentDepth == undefined) currentDepth = 0;
				if (collection == undefined) collection = [];
				var i,j,childNodes,childNode,relationship;
				for (j in relationships) {
					relationship = relationships[j];
					childNodes = node.getRelatedNodes(relationship, 'outgoing');
					//console.log('checking '+relationship+' relationship');
					for (i in childNodes) {
						childNode = childNodes[i];
						if ((childNode.hasScalarType('media')) && (collection.indexOf(childNode) == -1)) {
							collection.push(childNode);
						}
						if (currentDepth < maxDepth) {
							gallery.gatherChildMedia(childNode, maxDepth, currentDepth+1, collection);
						}
					}
				}
				return collection;
			},
			
			getChildrenOfType: function(node, type) {
				var children = [];
				var i,j,childNodes,childNode,relationship;
				for (j in relationships) {
					relationship = relationships[j];
					childNodes = node.getRelatedNodes(relationship, 'outgoing');
					for (i in childNodes) {
						childNode = childNodes[i];
						if (childNode.hasScalarType(type) && (children.indexOf(childNode) == -1)) children.push(childNode);
					}
				}	
				return children;		
			},
			
			build: function(collection) {
			
				var i,node,alttext,thumbnail;
				for (i in mediaCollection) {
					node = mediaCollection[i];
					if (node.current.description != undefined) {
						alttext = node.current.description.replace(/([^"\\]*(?:\\.[^"\\]*)*)"/g, '$1\\"');
					} else {
						alttext = '';
					}			
					if (node.thumbnail != undefined) {
						thumbnail = $('<img id="img-'+node.slug+'" class="thumbnail" src="'+node.thumbnail+'" alt="'+alttext+'"/>').appendTo(mediaContainer);
					} else {
						thumbnail = $('<img id="img-'+node.slug+'" class="thumbnail" src="'+modules_uri+'/cantaloupe/images/media_icon_chip.png" alt="'+alttext+'"/>').appendTo(mediaContainer);
						//element.append('<div class="media_placeholder"><img src="'+modules_uri+'/cantaloupe/images/media_icon.png" alt="'+alttext+'" width="30" height="30"/></div>');
					}
					thumbnail.data('node', node);
					var me = this;
					thumbnail.click(function() {
						if (me.currentDisplayMode != DisplayMode.All) {
							var source = $(this).prevAll('.child_header').eq(0);
							me.mediaDetails.show($(this).data('node'), source.data('node'), source.nextUntil('.child_header', 'img'));
						} else {
							me.mediaDetails.show($(this).data('node'));
						}
					});
				}
				
				gallery.resizeThumbnails();
			
			},
			
			update: function(collection) {
			
				$('.child_header').remove();
				$('.minor_message').remove();
				
				var i,j,k,n,path,header,childNodes,childNode,grandchildNodes,grandchildNode,thumbnail;
				switch (this.currentDisplayMode) {
				
					case DisplayMode.All:
					n = mediaCollection.length;
					for (i=(n-1); i>=0; i--) {
						childNode = mediaCollection[i];
						thumbnail = $('#img-'+childNode.slug);
						mediaContainer.children().eq(0).before(thumbnail);
					}
					mediaContainer.children('img').show();
					break;
					
					case DisplayMode.Path:
					case DisplayMode.Tag:
					
					var sourceNodes,sourceNode,relationship;
					if (this.currentDisplayMode == DisplayMode.Path) {
						sourceNodes = childPaths;
						relationship = 'path';
					} else {
						sourceNodes = childTags;
						relationship = 'tag';
					}
					
					var visibleMedia = [];
					for (i in sourceNodes) {
						sourceNode = sourceNodes[i];
						header = $('<div id="path_'+sourceNode.slug+'" class="child_header"></div>').appendTo(mediaContainer);
						header.data('node', sourceNode);
						//header.append('<h3 class="heading_font">'+sourceNode.getDisplayTitle()+' &raquo;</h3>');
						header.append('<h3 class="heading_font"><a href="'+addTemplateToURL(sourceNode.url, 'cantaloupe')+'">'+sourceNode.getDisplayTitle()+'</a></h3>');
						if (sourceNode.current.description != null) {
							header.append(' <div class="one_line_description">'+sourceNode.current.description+' <a href="'+addTemplateToURL(sourceNode.url, 'cantaloupe')+'"><img src="'+modules_uri+'/cantaloupe/images/permalink_icon.png" alt="permalink_icon" width="16" height="16" /></a></div>');
						}
						childNodes = sourceNode.getRelatedNodes(relationship, 'outgoing');
						for (j in childNodes) {
						
							childNode = childNodes[j];
							thumbnail = $('#img-'+childNode.slug);
							thumbnail.show();
							mediaContainer.append(thumbnail);
							if (thumbnail.length > 0) visibleMedia.push(thumbnail[0]);
							
							grandchildNodes = childNode.getRelatedNodes( 'referee', 'outgoing' );
							for ( k in grandchildNodes ) {
								grandchildNode = grandchildNodes[k];
								thumbnail = $('#img-'+grandchildNode.slug);
								thumbnail.show();
								mediaContainer.append(thumbnail);
								if (thumbnail.length > 0) visibleMedia.push(thumbnail[0]);
							}
						}
					}
					mediaContainer.children('img').not(visibleMedia).hide();
					mediaContainer.append('<div class="minor_message caption_font">'+(mediaCollection.length - visibleMedia.length)+' media files not shown because they are not referenced by any '+relationship+'s.</div>');
					break;
				
				}
			
			},
			
			resizeThumbnails: function(isAnimated) {
				if (!isAnimated) {
					mediaContainer.find('.thumbnail').attr('height', (thumbnailHeight * currentScale));
				} else {
					mediaContainer.find('.thumbnail').animate({'height': (thumbnailHeight * currentScale)});
				}
				//mediaContainer.find('.media_placeholder').height((thumbnailHeight * currentScale)).width((thumbnailHeight * currentScale));
			},
			
			sortCollection: function(collection, method) {
			
				switch (method) {
				
					case 'alpha':
					collection.sort(function(a, b) {
						var sortTitleA = a.getSortTitle();
						var sortTitleB = b.getSortTitle();
						if (sortTitleA > sortTitleB) {
							return 1;
						} else if (sortTitleA < sortTitleB) {
							return -1;
						}
						return 0;
					});
					break;
				
				}
			
			},
			
			decrementGalleryScale: function() {
				currentScale *= .5;
				gallery.resizeThumbnails(true);
			},
			
			incrementGalleryScale: function() {
				currentScale *= 2.0;
				gallery.resizeThumbnails(true);
			},
			
			setDisplayMode: function(mode) {
			
				if (mode != this.currentDisplayMode) {
					this.currentDisplayMode = mode;
					controlBar.find('.toggle_btn').removeClass('on');
					$('#'+mode.toLowerCase()+'Btn').addClass('on');
					gallery.update();
				}
			
			}

		};

		gallery.currentDisplayMode = DisplayMode.All;
		gallery.mediaDetails = $.scalarmediadetails($('<div></div>').appendTo('body'));
		
		controlBar = $('<div class="control_bar"></div>').appendTo(element);
		allBtn = $('<span id="allBtn" class="toggle_btn on caption_font">All</span>').appendTo(controlBar);
		pathBtn = $('<span id="pathBtn" class="toggle_btn caption_font">By path</span>').appendTo(controlBar);
		tagBtn = $('<span id="tagBtn" class="toggle_btn caption_font">By tag</span>').appendTo(controlBar);
		allBtn.click(function () { gallery.setDisplayMode(DisplayMode.All); });
		pathBtn.click(function () { gallery.setDisplayMode(DisplayMode.Path); });
		tagBtn.click(function () { gallery.setDisplayMode(DisplayMode.Tag); });
		
		// TODO: Don't show path/tag links if gallery contains no paths/tags
		
		var buttons = $('<div class="right"></div>').appendTo(controlBar);
		//historyBtn = addIconBtn(buttons, 'history_icon.png', 'history_icon_hover.png', 'Show history');
		shrinkBtn = addIconBtn(buttons, 'minus_icon.png', 'minus_icon_hover.png', 'Shrink');
		expandBtn = addIconBtn(buttons, 'plus_icon.png', 'plus_icon_hover.png', 'Expand');
		shrinkBtn.click(gallery.decrementGalleryScale);
		expandBtn.click(gallery.incrementGalleryScale);
		
		mediaContainer = $('<div id="gallery_content"></div>').appendTo(element);
		scalarapi.loadPage(currentNode.slug, true, function() {
			childPaths = gallery.getChildrenOfType(currentNode, 'path');
			childTags = gallery.getChildrenOfType(currentNode, 'tag');
			mediaCollection = gallery.gatherChildMedia(currentNode, 2);
			gallery.sortCollection(mediaCollection, SortMethod.Alpha);
			gallery.build(mediaCollection);
		}, function() {
			console.log('an error occurred while retrieving structured gallery info.');
		}, 3, true);
	
	}

})(jQuery);