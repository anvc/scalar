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
		var mediaDetails, children, interval;
		var relationships = ['path', 'tag', 'referee'],
			childRelationships = ['path', 'tag'],
			childLoadIndex = -1,
			contentBlocks = [];
			
		var gallery = {
			options: $.extend({
			}, options),
			
			addNodeToCollection: function( collection, parentNode, relationship, node ) {
				if (collection.all.indexOf(node) == -1) {
					collection.all.push(node);
				}
				if ( collection[parentNode.slug+'-'+relationship] == undefined ) {
					collection[parentNode.slug+'-'+relationship] = [node];
				} else {
					collection[parentNode.slug+'-'+relationship].push(node);
				}
			},
			
			gatherChildMedia: function(node, maxDepth, currentDepth, collection) {
			
				if (currentDepth == undefined) currentDepth = 0;
				if (collection == undefined) collection = { all: [] };
				
				var i,j,k,childNodes,childNode,relationship,refereeNodes,refereeNode;
				
				for (i in childRelationships) {
				
					relationship = childRelationships[i];
					childNodes = node.getRelatedNodes(relationship, 'outgoing');
					
					for (j in childNodes) {
						childNode = childNodes[j];
						if (childNode.hasScalarType('media')) {
							gallery.addNodeToCollection( collection, node, relationship, childNode );
							
						} else {
							refereeNodes = childNode.getRelatedNodes('referee', 'outgoing');
							
							for (k in refereeNodes) {
								refereeNode = refereeNodes[k];
								if (refereeNode.hasScalarType('media')) {
									gallery.addNodeToCollection( collection, node, relationship, refereeNode );
								}
							}
						}
						if (currentDepth < maxDepth) {
							gallery.gatherChildMedia(childNode, maxDepth, currentDepth+1, collection);
						}
					}
				}
				return collection;
			},
			
			loadNextChild: function() {
				childLoadIndex++;
				if ( childLoadIndex < ( children.length - 1 )) {
					scalarapi.loadPage(children[childLoadIndex].slug, true, function() {
						childPaths = gallery.getChildrenOfType(currentNode, 'path');
						childTags = gallery.getChildrenOfType(currentNode, 'tag');
						mediaCollection = gallery.gatherChildMedia(currentNode, 2);
						gallery.sortCollection(mediaCollection, SortMethod.Alpha);
						gallery.update(mediaCollection);
						gallery.loadNextChild();
					}, function() {
						console.log('an error occurred while retrieving structured gallery info.');
					}, 1, true);
				}
			},
			
			getChildrenOfType: function(node, type) {
				var children = [];
				var i,j,childNodes,childNode,relationship;
				for (j in relationships) {
					relationship = relationships[j];
					childNodes = node.getRelatedNodes(relationship, 'outgoing');
					for (i in childNodes) {
						childNode = childNodes[i];
						if ( type == 'all' ) {
							if ( children.indexOf( childNode ) == -1 ) {
								children.push(childNode);
							}
						} else if (childNode.hasScalarType(type) && (children.indexOf(childNode) == -1)) {
							children.push(childNode);
						}
					}
				}	
				return children;		
			},
			
			/*build: function(collection) {
			
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
			
			},*/
			
			/*update: function(collection) {
				
				mediaContainer.empty();
				
				var i,j,k,n,block,path,header,node,childNodes,childNode,grandchildNodes,grandchildNode,thumbnail;
				switch (this.currentDisplayMode) {
				
					case DisplayMode.All:
					for (i in collection.all) {
						node = collection.all[i];
						if (node.hasScalarType('media')) {
							gallery.addThumbnailForNode(mediaContainer, node);
						}
					}
					break;
					
					case DisplayMode.Path:
					case DisplayMode.Tag:
					n = children.length;
					for ( i=0; i<n; i++) {
						node = children[i];
						block = $('<div id="block_'+node.slug+'" class="content_block"></div>').appendTo(mediaContainer);
						block.data('node', node);
						contentBlocks.push(block);
					}
					
					var sourceNodes,sourceNode,relationship;
					if (this.currentDisplayMode == DisplayMode.Path) {
						sourceNodes = childPaths;
						relationship = 'path';
					} else {
						sourceNodes = childTags;
						relationship = 'tag';
					}
					sourceNodes = children;
					
					var visibleMediaCount = 0;;
					for (i in sourceNodes) {
						node = sourceNodes[i];
						header = $('<div id="container_'+node.slug+'" class="child_header"></div>').appendTo(mediaContainer);
						header.data('node', node);
						header.append('<h3 class="heading_font"><a href="'+addTemplateToURL(node.url, 'cantaloupe')+'">'+node.getDisplayTitle()+'</a></h3>');
						if (node.current.description != null) {
							//header.append(' <div class="one_line_description">'+node.current.description+' <a href="'+addTemplateToURL(node.url, 'cantaloupe')+'"><img src="'+modules_uri+'/cantaloupe/images/permalink_icon.png" alt="permalink_icon" width="16" height="16" /></a></div>');
							header.append(' <div class="one_line_description">'+node.current.description+'</div>');
						}
						//childNodes = node.getRelatedNodes(relationship, 'outgoing');
						childNodes = collection[node.slug+'-'+relationship];
						for (j in childNodes) {
							childNode = childNodes[j];
							gallery.addThumbnailForNode(mediaContainer, childNode);
							visibleMediaCount++;
						}
					}
					mediaContainer.append('<div class="minor_message caption_font">'+(mediaCollection.all.length - visibleMediaCount)+' media files not shown because they are not referenced by any '+relationship+'s.</div>');
					break;
				
				}
				
				gallery.resizeThumbnails();
			
			},
			
			/*update: function(collection) {
			
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
			
			},*/
			
			resizeThumbnails: function(isAnimated) {
				if (!isAnimated) {
					mediaContainer.find('.thumb').attr('height', (thumbnailHeight * currentScale));
				} else {
					mediaContainer.find('.thumb').animate({'height': (thumbnailHeight * currentScale)});
				}
				//mediaContainer.find('.media_placeholder').height((thumbnailHeight * currentScale)).width((thumbnailHeight * currentScale));
			},
			
			sortCollection: function(collection, method) {
			
				switch (method) {
				
					case SortMethod.Alpha:
					collection.all.sort(function(a, b) {
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
					gallery.update(mediaCollection);
				}
			
			},
			
			createContentBlocks: function() {
				
				var i, node, block,
					n = children.length;
					
				$( mediaContainer ).append( '<div id="block_head"></div>' );
				
				for ( i = 0; i < n; i++ ) {
					node = children[ i ];
					block = $( '<div id="block_' + node.slug + '" class="content_block"></div>' ).appendTo( mediaContainer );
					block.data( 'node', node );
					contentBlocks.push( block );
				}
				
			},
			
			handleTimer: function() {
			
				var node, scrolledPosition, block,
					n = contentBlocks.length;
					
				for ( var i = ( n - 1 ); i >= 0; i-- ) {
				
					block = contentBlocks[ i ];
					node = block.data( 'node' );
					scrolledPosition = block.offset().top - $( document ).scrollTop();
					//console.log(node.slug+' '+block.position().top+' '+$( document ).scrollTop()+' '+scrolledPosition);
					
					if ( ( scrolledPosition > 0 ) && ( scrolledPosition < window.innerHeight ) ) {
					
						//console.log('load '+node.slug);
						
						if (window['Spinner']) {
							var spinnerElement = $('<div class="spinner_wrapper"></div>').appendTo(block);
							var opts = {
							  lines: 13, // The number of lines to draw
							  length: 4, // The length of each line
							  width: 2, // The line thickness
							  radius: 5, // The radius of the inner circle
							  rotate: 0, // The rotation offset
							  color: '#000', // #rgb or #rrggbb
							  speed: 1, // Rounds per second
							  trail: 60, // Afterglow percentage
							  shadow: false, // Whether to render a shadow
							  hwaccel: false, // Whether to use hardware acceleration
							  className: 'spinner', // The CSS class to assign to the spinner
							  zIndex: 2e9, // The z-index (defaults to 2000000000)
							  top: 'auto', // Top position relative to parent in px
							  right: 'auto' // Left position relative to parent in px
							};
							var spinner = new Spinner(opts).spin(spinnerElement[0]);
						}
						
						scalarapi.loadPage( node.slug, true, function( data ) {
						
							var node, index, children;
							
							// get first property to find the node we loaded; technically we shouldn't
							// rely on browsers to deliver the properties in a certain order, but...
							for ( var prop in data ) {
								break;
							}
							node = scalarapi.getNode( prop );
							gallery.addImagesForNode( node );
							
						}, function() {
							console.log('an error occurred while retrieving structured gallery info.');
						}, 1, true);
						
						index = contentBlocks.indexOf( block );
						contentBlocks.splice( index, 1 );
						
					}
				}
				
				if ( n == 0 ) {
					clearInterval( interval );
				}
			},
			
			addHeaderForNode: function( node ) {
			
				var block = $( '#block_' + node.slug );
				
				if (node.current.description != null) {
					block.prepend(' <div class="one_line_description">'+node.current.description+'</div>');
				}
				block.prepend('<h3 class="heading_font"><a href="'+addTemplateToURL(node.url, 'cantaloupe')+'">'+node.getDisplayTitle()+'</a></h3>');
			
			},
			
			addImagesForNode: function( node ) {
			
				var child, i,
					block = $( '#block_' + node.slug ),
					children = gallery.getChildrenOfType( node, 'all' ),
					n = children.length;
					
				block.find('.spinner_wrapper').remove();
					
				for ( i = 0; i < n; i++ ) {
					child = children[ i ];
					if ( child.hasScalarType( 'media' ) ) {
						gallery.addThumbnailForNode( block, child );
					}
				}
				
				if ( node.hasScalarType( 'media' ) ) {
					gallery.addThumbnailForNode( $( '#block_head' ) , node );
				}
				
				if ( block.children().length == 0 ) {
					block.remove();
				} else {
					gallery.addHeaderForNode( node );
				}
				
			},
			
			addThumbnailForNode: function( element, node, method ) {
			
				var alttext, thumbnail,
					me = this;
					
				if ( method == null ) {
					method = 'appendTo';
				}
				
				if (node.current.description != undefined) {
					alttext = node.current.description.replace(/([^"\\]*(?:\\.[^"\\]*)*)"/g, '$1\\"');
				} else {
					alttext = '';
				}		
					
				if ( node.thumbnail != undefined ) {
					thumbnail = $( '<img id="img-' + node.slug + '" class="thumb" src="' + node.thumbnail + '" alt="' + 
						alttext + '" height="' + parseInt( thumbnailHeight * currentScale ) + '"/>' )[method]( element );
				} else {
					thumbnail = $( '<img id="img-' + node.slug + '" class="thumb" src="' + modules_uri + 
						'/cantaloupe/images/media_icon_chip.png" alt="' + alttext + '" height="' + 
						parseInt( thumbnailHeight * currentScale ) + '"/>' )[method]( element );
				}
				thumbnail.data('node', node);
				
				thumbnail.click(function() {
					/*if (me.currentDisplayMode != DisplayMode.All) {
						var source = $(this).parent();
						me.mediaDetails.show($(this).data('node'), source.data('node'), source.find('img'));
					} else {*/
						me.mediaDetails.show($(this).data('node'));
					//}
				});
			},
			
			addMedia: function() {
				interval = setInterval(gallery.handleTimer, 1000);
				children = gallery.getChildrenOfType(currentNode, 'all');
				gallery.createContentBlocks();
			}

		};

		gallery.currentDisplayMode = DisplayMode.Path;
		gallery.mediaDetails = $.scalarmediadetails($('<div></div>').appendTo('body'));
		
		mediaContainer = $('<div id="gallery_content"></div>').appendTo(element);

		/*// get the children of the current node
		scalarapi.loadPage(currentNode.slug, true, function(data) {
			children = gallery.getChildrenOfType(currentNode, 'all');
			gallery.createContentBlocks();
		}, function() {
			console.log('an error occurred while retrieving structured gallery info.');
		}, 1, true);*/
		
		return gallery;
	
	}

})(jQuery);