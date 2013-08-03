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
			
			showMedia: function(node, source, collection) {
				
				mediaDetails.slideshowElement = $('<div class="manual_slideshow"><div class="slot_slider"></div></div>').appendTo(mediaDetails.contentElement);
				mediaDetails.infoElement = $('<div></div>').appendTo(mediaDetails.contentElement);
				
				if (collection == undefined) {
		
					var link = $('<a href="'+node.current.sourceFile+'" resource="'+node.slug+'" rel="'+node.urn+'">Media file</a>');
					link.data('mediaDetails', mediaDetails);
					
					var slot = link.slotmanager_create_slot(null, maxMediaHeight, {url_attributes: ['href', 'src']});
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
						
						var slot = link.slotmanager_create_slot(null, maxMediaHeight, {url_attributes: ['href', 'src']});
						if (slot) {
							slotDOMElement = slot.data('slot');
							slotMediaElement = slot.data('mediaelement');
							mediaDetails.slideshowElement.find('.slot_slider').append(slotDOMElement);
						}
					});
				}
				
				if (source != undefined) {
					console.log(source);
					mediaDetails.contentElement.prepend('<div class="source_header heading_font">From &ldquo;'+source.getDisplayTitle()+'&rdquo;:</div>');
				}
				
				element.show();
			
			},
			
			hide: function() {
				mediaDetails.contentElement.empty();
				element.hide();
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
				$.scalarmedia(mediaelement, mediaDetails.infoElement, {'shy':false});
			}

		};
		
		$('body').bind('mediaElementMetadataHandled', mediaDetails.handleMediaElementMetadata);
		
		element.addClass('media_details');
		mediaDetails.blackoutElement = $('<div class="blackout"></div>').appendTo(element);
		mediaDetails.blackoutElement.click(mediaDetails.hide);
		mediaDetails.contentElement = $('<div class="content"></div>').appendTo(element);
		
		return {
			show: mediaDetails.showMedia
		}
	
	}

})(jQuery);