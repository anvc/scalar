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

/**
 * @projectDescription  Find HTML links in a text and broadcast information about them including their location in a scroll area
 * @author              Craig Dietrich
 * @version             2.3  (Version 1.0 is used by http://vectors.usc.edu/projects/learningfromyoutube)
 * @abstract			Needs to be refactored
 * 
 * Usage:
 * 
 * <div id="content">
 *   Text text text <a href="">Link #1</a> text text.
 *   ...
 *   Text text text <a href="">Link #2</a> text text.
 * </div>
 * 
 * <script>
 * $('#content').texteo();
 * </script>
 * 
 * Broadcasts events:
 * texteoTags - An array of $tags.  Each has $tag.data('is_on_screem') which, if true, means that the tag is in the viewable area of the browser
 * texteoTagClicked - A $tag, which has just been clicked. 
 * texteoTagMouseOver - A $tag, which has just been moused-over.   
 * 
 * Transforms each tag:
 * 1) Trims inner html
 * 2) Adds class "texteo_element" to each found tag
 */

(function($) {

	$.fn.texteo = function(options) {

		var defaults = { tags: ['a', '.note'], scrolling_element: 'window' };   // scrolling_element: 'window'|'element'		  
  		var options = $.extend(defaults, options); 		

		return this.each(function() {

			var $text = $(this);

			$text.data('tags', []);
			// Sort out the scrolling element
			if (options['scrolling_element']=='window') {
				scrolling_element = $(window);
			} else if (options['scrolling_element']!==false) {
				scrolling_element = $text;
			} else {
				scrolling_element = null;
			}
			var base_url = $('link#parent').attr('href');
			if ('undefined'==typeof(base_url)||!base_url.length) base_url = null; 		
			
			// For each tag, perform some initial cleaning up, then rewrite the click event
		
			$text.find( options['tags'].join(', ') ).each(function() {  
				
				// Initial management
				var $link = $(this);
				if ('undefined'!=$link.attr('id')&&$link.attr('id')=='maximizeLink') return;
				if ('undefined'!=$link.attr('id')&&$link.attr('id')=='viewPageLink') return;
				if ($link.closest('.coda-slider-wrapper').length) return;
				$text.data('tags').push($link);
				$link.data( 'is_texteo_element', true );
				$link.data( 'is_highlighted', false );
				$link.texteo_set_position(scrolling_element, options);
				var resource = $link.attr('resource');
				var href = $link.attr('href');
				var target = ('undefined'!=typeof($link.attr('target'))) ? $link.attr('target') : null;

				var hide_icon = ($link.hasClass('hide_icon')) ? true : false;	
				if (!hide_icon && !jQuery.trim($link.html()).length) hide_icon = true
				
            	var can_use_external_page = ($('link#external_direct_hyperlink').length && 'true'==$('link#external_direct_hyperlink').attr('href')) ? false : true;

				// Link with resource="..." (media)
				if ('undefined'!=typeof(resource)) {
					$link.data('texteo_resource_link', true);
					if (!hide_icon) {
						$link.addClass('texteo_icon');
						$link.addClass('texteo_icon_generic_resource');
						// Link is a note
						if ($link.hasClass('note')) {
							$link.addClass('texteo_icon_note');
							$link.click(function() { 
								console.log('is a note');
								var resource = $(this).attr('resource');
								var link_to = resource;
								if (resource.indexOf('://')==-1) {  // relative url
									var parent = $('link#parent').attr('href');
									link_to = parent + '/' + resource;
								}
								link_to += '?origin=note';
								document.location.href = link_to;
								return false;
							});
						// Link doesn't need to worry about slot managers on the page
						} else if (options['click']=='native') {
							$link.click(function(event) {
								console.log('click:native');
								var resource = $(this).attr('resource');
								var link_to = (resource && resource.length) ? resource : $(this).attr('href');
								if (link_to.indexOf('://')==-1) {  // relative url
									var parent = $('link#parent').attr('href');
									link_to = parent + link_to;
								}
								document.location.href = link_to;
								return false;
							});
						// Link operates slot manager media	
						} else {
							$link.click(function(event) { 
								console.log('slot manager click');
								texteo_tag_clicked_event($(this), event);
							});
							$link.bind('touchstart', function(event) {  // iOS
								texteo_tag_clicked_event($(this), event);
								texteo_tag_over_event($(this), event);					
							}); 
						}
					}			 
				// Link without resource=""	(external or internal)		
				} else if ('undefined'!=typeof(href) && base_url) {
					if (href.indexOf('://') != -1 && href.indexOf(base_url) == -1) {  // External link
						$link.data('texteo_external_link', true);
						$link.click(function() {  // Open with previous header
							if (target) {  // E.g., open in a new page
								$link.click();
								return false;
							} else {
								if (!can_use_external_page) {
									$link.click();
									return false;
								} else {
									var link_to = base_url+'external?link='+encodeURIComponent($(this).attr('href'))+'&prev='+encodeURIComponent(document.location.href);
									document.location.href=link_to;
									return false;
								}
							}
						});
					} else if (href.indexOf('://') != -1) {  // Internal link with absolute URL
						$link.data('texteo_internal_link', true);
						$link.click(function() {  // Open with previous header
							if (target) {  // E.g., open in a new page
								$link.click();
								return false;
							} else {
								document.location.href=$(this).attr('href');
								return false;
							}
						});
					} else {  // Internal link with relative URL
						$link.data('texteo_internal_link', true);
						$link.click(function() {  // Open with previous header
							if (target) {  // E.g., open in a new page
								$link.click();
								return false;
							} else {
								var link_to = base_url+$(this).attr('href');
								document.location.href=link_to;
								return false;
							}
						});
					} 
				}	

				// Bind events	
				$link.mouseover(function(event) { texteo_tag_over_event($(this), event) });
				
				// Listen for media element and change icon if needed
				$('body').bind('mediaElementMetadataHandled', function(event, $link) {
					var hide_icon = ($link.hasClass('hide_icon')) ? true : false;	
					if (!hide_icon && !jQuery.trim($link.html()).length) hide_icon = true	
					$link.texteo_set_media_icon();							
				}); 					
				
			});
			
			// Set 'is on screen' on initial load and during certain browser events
			if (scrolling_element) {
				is_on_screen($text, options);
				$(window).resize(function() { set_positions($text, scrolling_element, options); is_on_screen($text, options); });
				scrolling_element.scroll(function() { is_on_screen($text, options); });  // TODO: this should be configurable
			}

		});
		
	}
	
	$.fn.texteo_set_position = function(scrolling_element, options) {

		// Set the 'top' (relative to parent element) and 'relative_top' (relative to scrollable element)
	
		if (!scrolling_element) return;
		$tag = $(this);
		var linkPosition = $tag.offset();  // TODO: trap for options[scrolling_element]
		$tag.data('top', Math.floor(linkPosition.top));	
		$tag.data('relative_top', ((options['scrolling_element']=='window')?$tag.data('top'):$tag.data('top')-Math.floor(scrolling_element.position().top)) );	
	
	}	
	
	$.fn.texteo_set_media_icon = function() {
		$link = $(this);
		if ($link.hasClass('hide_icon')) return false;
		if ($link.hasClass('inline')) return false;
		if (!$link.data('mediaelement')) return false;
		var icon_class = null;
		var extensions = $link.data('mediaelement').model.mediaSource.extensions;
		var extension = (extensions.length>0) ? extensions[0] : '';  // TODO: dangerous to assume first extension
		switch (extension) {
				// images
				case "jpg":
				case "jpeg":
				case "gif":
				case "png":
				icon_class = 'texteo_icon_image';
				break;
				// QuickTime
				case "mov":
				// Flash video
				case "flv":
				// HTML5 video
				case "mp4":
				case "ogg":
				// Special archive considerations
				case "hemi":
				case "youtube":
				case "youtubeLite":
				case "vimeo":
				icon_class = 'texteo_icon_video';
				break;
				case "mp3":
				case "aif":
				case "aiff":
				case "wav":
				case "oga":
				icon_class = 'texteo_icon_audio';
				break;
		}
		if (!icon_class) return;
		$link.addClass('texteo_icon');
		$link.removeClass('texteo_icon_generic_resource');	
		$link.addClass(icon_class);
	}	
	
	var set_positions = function($text, scrolling_element, options) {

		// Set position for each $tag connected to $text
	
		var $tags = $text.data('tags');
		for (var j = 0; j < $tags.length; j++) {
			$tags[j].texteo_set_position(scrolling_element, options);
		}
	
	}
	
	var is_on_screen = function($text, options) {

		// Find scroll properties... slightly different is the scrollable element is a DOM node or the window itself

		if (options['scrolling_element']=='window') {
			var $parent   = $(window);
			var height    = $parent.height();
			var scrollTop = $parent.scrollTop();
			var top       = 0;		
		} else {
			var $parent   = $text;
			var height    = $parent .height();
			var scrollTop = $parent .scrollTop();
			var position  = $parent .position();
			var top       = Math.floor(position.top);		
		}

		// Check the $tag's location against the scrollable elements, and set is on screen
	
		var $tags = $text.data('tags');
		for (var j = 0; j < $tags.length; j++) {
			if ( $tags[j].data('relative_top') >= scrollTop && $tags[j].data('relative_top') < (height + scrollTop) ) {
				$tags[j].data( 'is_on_screen', true );
			} else {
				$tags[j].data( 'is_on_screen', false );
			}

		};	
		
		tags_event($text);
		
	}	
	
	var tags_event = function($text) {

		$('body').trigger( 'texteoTags', [$text.data('tags')] );
	
	}
	
	var texteo_tag_clicked_event = function($tag, event) {
		
		$('body').trigger( 'texteoTagClicked', [$tag, event] );	
	
	}
	
	var texteo_tag_over_event = function($tag, event) {

		$('body').trigger( 'texteoTagMouseOver', [$tag, event] );	

	}

})(jQuery);

