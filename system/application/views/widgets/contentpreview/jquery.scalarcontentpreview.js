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

/**
 * @projectDescription  Advanced tooltip for links in a Scalar page, with methods to grab the title and desc of pages being linked to
 * @author              Craig Dietrich
 * @version             2.1
 */

(function($) {

	var scalarcontentpreview_methods = {
	
		init : function() {
			 
			return this.each(function() {
	
				// Link properties
				var $link = $(this);
				if (!$link.is('a, span')) return;
				if ($link.hasClass('nopreview')) return;  // Deprecated, but present in past books
				if (false==$link.data('display-content-preview-box')) return; 
				if ($link.closest('.inline_slot').length) return;
				var is_note = (($link.hasClass('note')) ? true : false);
	
				// Box properties
				var box_min_width = 200;
				var width = parseInt($link.innerWidth());
				var height = parseInt($link.innerHeight());	
				
				// Setup
				$.fn.scalarcontentpreview('move_all_links_to_back');
				$.fn.scalarcontentpreview('remove_content_preview_boxes');
				
				// Create box
				var $box = $('<div class="content_preview border_radius content_preview_init_hide '+((is_note)?'content_preview_note':'')+'"><div class="link_buffer"></div><div class="type_bar" style="display:none;"></div><div class="preview_title">Loading ...</div><div class="preview_desc"></div><div class="preview_content"></div></div>');
				$('body').append($box);
				$link.data('content_preview', $box);
				$box.data('link', $link);	
				var $link_buffer = $box.find(':first-child');
				
				// Keep the HTML link in the same place but draw the box around it
				var offset = $link.offset();
				var y = parseInt(offset.top) - parseInt($box.css('padding-top'));
				if (is_note) {
					var $content = $('#content');
					$link_buffer.width( (parseInt($content.innerWidth())-37) +'px'); // Magic number
					var x = (parseInt($content.offset().left)-3); // Magic number
				} else {
					$link_buffer.width( ((width<box_min_width)?box_min_width:width) +'px');	
					var x = (width/2) + parseInt(offset.left) - (( parseInt($box.innerWidth()) ) / 2);
				}
				$box.css( 'left', x+'px' );	
				$box.css( 'top', y+'px' );	
				$link_buffer.height( (height + parseInt($box.css('padding-top')))+'px' );	 		
				
				// Make sure link floats above box, and box floats above rest			
				$link.css('position','relative').css('zIndex', 10);
				$box.css('zIndex', 9);
				
				// Attach events
				$('body').mousemove(function(event) {  // Don't use mouseout as it doesn't fire predictably (see notes in the fun below)
					$.fn.scalarcontentpreview('check_mo', $box, $link, event.pageX, event.pageY);
				});
				$box.click(function() {  // When the content preview box is clicked, remove it (for touch interfaces)
					$.fn.scalarcontentpreview('remove', $link);
				});
				$('#content').click(function() {  // Also for touch interfaces
					$.fn.scalarcontentpreview('remove', $link);
				});		
				
				// Display the box
				$box.delay('100').animate({opacity: 1.0}, 100);	  // Magic numbers
		  
				// Propagate title and description
				if ($link.data('rdf')) {
					$.fn.scalarcontentpreview('write_fields', $box, $link.data('rdf'));
				} else {
					var url = $.fn.scalarcontentpreview('meta_url', $link);
					// Get meta
					$.getJSON(url, function(data) {
						$link.data('rdf', data);
						var $box = $link.data('content_preview');
						if (!$box || 'undefined'==typeof($box)) return;  // Ajax could come back after the box has been removed
						$.fn.scalarcontentpreview('write_fields', $box, data);
					});		
				}					
				
			});	
			 
		},
		write_fields : function($box, data) {

			var $link = $box.data('link');
			var url = $.fn.scalarcontentpreview('meta_url', $link);
			var width = $box.find(':first-child').innerWidth();
			var is_note = (($link.hasClass('note')) ? true : false);
			for (uri in data) break;
			var node = data[uri];
			if (!$.fn.scalarcontentpreview('is_external_link', url)) {
				var version_uri = node['http://scalar.usc.edu/2012/01/scalar-ns#version'][0]['value'];
				var node = data[version_uri];	
			}	

			// Click to view / go to
			if ($.fn.scalarcontentpreview('is_external_link', url) && $link.attr('href')) {
				var click_to_msg = 'Click to go to page at '+$.fn.scalarcontentpreview('get_hostname_from_url', $link.attr('href'));
			} else {
				var click_to_msg = 'Click to view';
			}
			$box.find('.type_bar:first').show().html(click_to_msg).width(width+'px');

			// Title, description, and content (if applicable))
			var title_node = node['http://purl.org/dc/terms/title'];
			if (title_node && title_node.length) {
				var title = title_node[0]['value'];
				$box.find('.preview_title:first').show().html(title).width(width+'px');
			}
			if (!is_note) {
				var desc_node = node['http://purl.org/dc/terms/description'];
				if (desc_node && desc_node.length) {
					var desc = desc_node[0]['value'];
					$box.find('.preview_desc:first').show().html(desc).width(width+'px');
				}
			} else {
				var content_node = node['http://rdfs.org/sioc/ns#content'];
				var url_node = node['http://simile.mit.edu/2003/10/ontologies/artstor#url'];
				var content = '';
				if (content_node && content_node.length) {
					content = content_node[0]['value'].replace(/\n/g, "<br />");
				} else if (url_node && url_node.length) {
					content = '<a class="inline media_page" href="'+url_node[0]['value']+'" resource="'+uri+'"></a>';
				}
				$box.find('.preview_content:first').show().html(content).width(width+'px');
				$('.inline').inlineslotmanager();					
			}
		
		},
		get_hostname_from_url : function (url) {
			return url.split(/\/+/g)[1];  // http://bytes.com/topic/javascript/answers/835342-get-domain-name-url
		},
		move_all_links_to_back : function() {
			$('#content').find('a, .note').css('zIndex', 0); 
		},
		remove_content_preview_boxes : function() {
			$('.content_preview').remove();
		},
		meta_url : function($link) {
			var $parent = $('link#parent');
			var $approot = $('link#approot');
			var meta = $link.attr('href');   // Default: get meta from URL	
			// Get meta from resource attribute
			if (typeof $link.attr('resource') != 'undefined' && $link.attr('resource') != false) {
				meta = $link.attr('resource');
			}		
			// Internal link
			if (meta.indexOf('http://')==-1 && meta.indexOf('https://')==-1) {
				var base_url = (!$parent.length) ? '' : $parent.attr('href');  // If no paret href, hope for the best...
				meta = base_url+meta;
			}
			// External link
			if ($.fn.scalarcontentpreview('is_external_link', meta)) {
				if (!$approot.length) return;  // No external proxy
				meta = $approot.attr('href')+'rdf/html_to_rdf_proxy.php?url='+encodeURIComponent(meta)+'&format=json';	
			} else {
				meta += '.rdfjson'
			}
			return meta;		
		},
		is_external_link : function(str) {
			if (str.indexOf('http://')==-1 && str.indexOf('https://')==-1) return false;
			var $parent = $('link#parent');
			if (!$parent.length) return false;
			var base_url = $parent.attr('href');
			if (str.substr(0, base_url.length) != base_url) return true;
		},
		check_mo : function($box, $link, mouseX, mouseY) { 
			// There's seems to be a jQuery bug in Firefox such that mousing over the link triggers mouseleave
			// https://bugzilla.mozilla.org/show_bug.cgi?id=101197
			// This is a workaround to see if the mouse is within the confines of the $box
			try {
				var thisLeft = $box.offset().left;
				var thisTop = $box.offset().top;
				var thisWidth = $box.innerWidth();
				var thisHeight = $box.innerHeight();
				var thisRight = thisLeft + thisWidth;
				var thisBottom = thisTop + thisHeight;
				//alert (mouseX +' '+ thisLeft +' '+ mouseX +' '+ thisRight +' '+ mouseY +' '+ thisTop +' '+ mouseY +' '+ thisBottom);
				if (mouseX >= thisLeft && mouseX <= thisRight && mouseY >= thisTop && mouseY <= thisBottom) return;  // Don't remove
			} catch(e) {}
			$.fn.scalarcontentpreview('remove', $link);
		},
		remove : function($link) {
			$('#content').unbind('click');
			$('body').unbind('mousemove');
			$('#content').find('a, .note').css('zIndex', 0);
			$('.content_preview').remove();
			if ('undefined' != typeof($link)) {
				$link.data('content_preview', null);
			}
		}
		
	};

	$.fn.scalarcontentpreview = function(methodOrOptions) {		

		if ( scalarcontentpreview_methods[methodOrOptions] ) {
			return scalarcontentpreview_methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
			// Default to "init"
			return scalarcontentpreview_methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.tooltip' );
		}    
		
	};
	
})(jQuery);
