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

	$.scalarmediadetails = function(e, options) {

		var element = e;
		var node;

		var mediaDetails = {
			options: $.extend({
			}, options),

			loadCount: 0,

			showMedia: function(node, source, collection) {
				if(node != undefined) {
					$.scalarmediadetailsstate = {
						node:node,
						source:source,
						collection:collection
					}
				} else {
					node = $.scalarmediadetailsstate.node;
					source = $.scalarmediadetailsstate.source;
					collection = $.scalarmediadetailsstate.collection;
				}
				mediaDetails.source = source;
				mediaDetails.collection = collection;
				mediaDetails.targetNode = node;

				mediaDetails.loadCount = 0;

				mediaDetails.slideshowElement = $('<div class="manual_slideshow"></div>').appendTo(mediaDetails.contentElement);
				mediaDetails.infoElement = $('<div></div>').appendTo(mediaDetails.contentElement);
				var sizeTest = $('<div id="media_details_buffer"></div>').appendTo(mediaDetails.contentElement);
				var slotWidth = Math.round(parseInt($(element).width() - sizeTest.width()) * .68);

				sizeTest.remove();
				if (collection == undefined) {

					var link = $('<a href="'+node.current.sourceFile+'" resource="'+node.slug+'" rel="'+node.urn+'">Media file</a>');
					link.data('mediaDetails', mediaDetails);
          var options = {
            url_attributes: ['href', 'src'],
            solo: true,
            getRelated: true,
            typeLimits: typeLimits,
            deferTypeSizing:true
          }
          if ($('body').width() < 769) {
            options.size = 'full';
          }
 					var slot = link.slotmanager_create_slot(slotWidth, null, options);
					if (slot) {
						slotDOMElement = slot.data('slot');
						slotMediaElement = slot.data('mediaelement');
						mediaDetails.slideshowElement.append(slotDOMElement);
					}

				} else {

					collection.each(function() {
						var currentNode = $(this).data('node');
						var link = $('<a href="'+currentNode.current.sourceFile+'" resource="'+currentNode.slug+'" rel="'+currentNode.urn+'">Media file</a>');
						link.data('mediaDetails', mediaDetails);

						var slot = link.slotmanager_create_slot(slotWidth, null, {url_attributes: ['href', 'src'], solo: true});
						if (slot) {
							slotDOMElement = slot.data('slot');
							slotDOMElement.attr('id', currentNode.slug+'_slot');
							slotMediaElement = slot.data('mediaelement');
							mediaDetails.slideshowElement.append(slotDOMElement);
						}
					});
				}

				slotMediaElement.model.element.css('visibility', 'hidden');

				var slideshowHeader = $('<div class="dialog_header heading_font"></div>').prependTo(mediaDetails.contentElement);
				if (source != undefined) {
					slideshowHeader.html('Media from the '+source.getDominantScalarType().singular+' <a href="'+source.url+'">&ldquo;'+source.getDisplayTitle()+'&rdquo;</a>:');
				} else {
					slideshowHeader.html('Media file');
				}
				//mediaDetails.contentElement.prepend('<div class="dialog_header heading_font">From &ldquo;'+source.getDisplayTitle()+'&rdquo;:</div>');
				var buttons = $('<div class="right"></div>').appendTo(slideshowHeader);
				slideshowHeader.append('<hr>');
				addIconBtn(buttons, 'close_icon_dark.png', 'close_icon_dark_hover.png', 'Close');
				mediaDetails.contentElement.find('[title="Close"]').click(mediaDetails.hide);

				element.show();

				setState( ViewState.Modal );

			},

			hasNodeForParent: function(node, parentNode) {
				var pathParents = node.getRelatedNodes('path', 'incoming');
				var tagParents = node.getRelatedNodes('tag', 'incoming');
				return ((pathParents.indexOf(parentNode) != -1) || (tagParents.indexOf(parentNode) != -1));
			},

			hide: function() {
				mediaDetails.contentElement.empty();
				element.hide();
				restoreState();
			},

			/**
			 * Called when a mediaelement instance has gathered metadata about the media.
			 *
			 * @param {Object} event			The event object.
			 * @param {Object} link				The link which spawned the mediaelement, and which contains its data.
			 */
			handleMediaElementMetadata: function(event, link) {
				var mediaelement = link.data('mediaelement');
				var mediaDetails = link.data('mediaDetails');

				var okToProceed = false;
				if ( mediaDetails != null ) {
					if ( mediaDetails.collection != null ) {
						if ( mediaDetails.loadCount < mediaDetails.collection.length ) {
							okToProceed = true;
						}
					} else {
						if ( mediaDetails.loadCount == 0 ) {
							okToProceed = true;
						}
					}
				}

				if ( okToProceed ) {
					var overlay = $('<div class="media_sidebar caption_font" style="min-height:initial;"><h2><a href="' + mediaelement.model.node.url + '">'+mediaelement.model.node.getDisplayTitle()+'</a></h2></div>').prependTo(mediaelement.model.element.parent());
					var i, relation, relations;

					// show annotations
					relations = mediaelement.model.node.getRelations('annotation', 'incoming', 'index');
					var annotationWrap = $('<div class="media_sidebar caption_font"></div>').appendTo(mediaelement.model.element.parent());

					var sourceFileLink = $('<div class="citations"><a class="btn btn-primary btn-sm" href="'+mediaelement.model.node.current.sourceFile+'" target="popout">View source file</a></div>').appendTo(annotationWrap);
					if ('undefined'!=typeof(scalarMediaDetailsSourceFileLink) && !scalarMediaDetailsSourceFileLink) sourceFileLink.hide();

					if (relations.length > 0) {
						var annotationCitations = $('<div class="citations media_annotations"><h3>Annotations of this media</h3></div>').appendTo(annotationWrap);
						annotationCitations.show();
						var table = $('<table></table>').appendTo(annotationCitations);
						for (i in relations) {
							relation = relations[i];
							row = $('<tr><td>'+relation.startString+'</td><td>'+relation.body.getDisplayTitle()+'</td></tr>').appendTo(table);
							row.data('relation', relation);
							row.click(function() {
								var relation = $(this).data('relation');
								mediaelement.seek(relation);
								mediaelement.play();
							});
						}
					}

					if(link.data('fullWidth')) {
						mediaelement.model.element.wrap("<div class='pillarbox'></div>");
					}

					var citations = $('<div class="citations"><h3>Citations of this media</h3></div>').appendTo(annotationWrap);

					// show media references with excerpts
					relations = mediaelement.model.node.getRelations('referee', 'incoming');
					for (i in relations) {
						relation = relations[i];
	                    if (relation.body.current.content != null) {
							var temp = $('<div>'+relation.body.current.content+'</div>').appendTo(annotationWrap);
							wrapOrphanParagraphs(temp);
							var is_inline = (temp.find('a[resource*="'+relation.target.slug+'"]').hasClass('inline')) ? true : false;
							if (is_inline) {
								citingContent = '<i>Inline media</i>';
							} else {
								citingContent = '&ldquo;'+temp.find('a[resource*="'+relation.target.slug+'"]').parent().html().replace(/(<br>\s*)+$/,'')+'&rdquo;';  // Media page could have been edited since the link was established, making 'mediaelement.model.node.current' not-found
							}
							citations.append('<blockquote>'+citingContent+'</blockquote><p class="attribution">&mdash;from <a href="'+relation.body.url+'">&ldquo;'+relation.body.getDisplayTitle()+'&rdquo;</a></p>');
							temp.remove();
						}
					}

					// show containing paths
					relations = mediaelement.model.node.getRelations('path', 'incoming', 'index');
					for (i in relations) {
						relation = relations[i];
						citations.append('<p><a href="'+mediaelement.model.node.url+'?path='+relation.body.slug+'">Step '+relation.index+'</a> of the <a href="'+relation.body.url+'">&ldquo;'+relation.body.getDisplayTitle()+'&rdquo;</a> path</p>');
					}

					// show tags
					relations = mediaelement.model.node.getRelations('tag', 'incoming');
					for (i in relations) {
						relation = relations[i];
						citations.append('<p>Tagged by <a href="'+relation.body.url+'">&ldquo;'+relation.body.getDisplayTitle()+'&rdquo;</a></p>');
					}
					
					// No citations
					if (!citations.children(':not(h3)').length) {
						citations.append('<i>There are no citations of this media.</i>');
					}

					/*for (i in relations) {
						relation = relations[i];
						annotationCitations.append('<p>Annotated by <a href="'+relation.body.url+'">&ldquo;'+relation.body.getDisplayTitle()+'&rdquo;</a><br><span class="annotation_extents">'+relation.startString+relation.separator+relation.endString+'</span></p>');
					}*/

					// scroll to the clicked media once all media has loaded
					mediaDetails.loadCount++;
					if (mediaDetails.collection != undefined) {
						if (mediaDetails.loadCount == mediaDetails.collection.length) {
							setTimeout(function() { $(mediaDetails.slideshowElement).animate({'scrollTop': $(mediaDetails.slideshowElement).find('#'+mediaDetails.targetNode.slug+'_slot').offset().top-140-parseInt($(document).scrollTop())}); }, 500);
						}
					}

					// additional metadata list
					var metadata = $('<div class="citations citations_metadata"><h3>Details</h3></div>').appendTo(annotationWrap);
					addMetadataTableForNodeToElement(mediaelement.model.node, metadata);
					
				}
			}
		};

		$('body').bind('mediaElementMetadataHandled', mediaDetails.handleMediaElementMetadata);

		element.addClass('media_details');
		/*mediaDetails.blackoutElement = $('<div class="blackout"></div>').appendTo(element);
		mediaDetails.blackoutElement.click(mediaDetails.hide);*/
		mediaDetails.contentElement = $('<div class="content"></div>').appendTo(element);

		return {
			show: mediaDetails.showMedia
		}

	}

})(jQuery);
