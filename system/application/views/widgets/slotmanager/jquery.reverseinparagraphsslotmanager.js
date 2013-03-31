/**
 * @projectDescription  A vertical bar with slots for content
 * @author              Craig Dietrich
 * @version             1.0
 */

(function($) {

	$.fn.reverseinparagraphsslotmanager = function(options) {

		return this.each(function() {

			// Wrappers

			var $this = $(this);
			$this.data('tags', []);

			// Listen for tags, and create or update the status of each tag's slot
			
			$('body').bind('texteoTags', function(event, $tags) {
	
				// Create slot rows
				$tag.parents('div#content').inline_set_slots();
				
				// Predict the number of elements in each slot
				for (var j = 0; j < $tags.length; j++) {
					$tags[j].set_slot_row_count();
				}	
						
				// Create slots
				for (var j = 0; j < $tags.length; j++) {
					var slot = $tags[j].slotmanager_set_slot();
				}						
				
			});				
		
			$('body').bind('texteoTagClicked', function(event, $link, clickEvent) {
			
				if (!$link.data('texteo_resource_link')) return;

				clickEvent.preventDefault()
				clickEvent.stopPropagation();			
				unhighlight_all($this.data('tags'));
				if ($link.slotmanager_is_playing()) {
					$link.slotmanager_pause();
				} else {
					stop_playing_all($this.data('tags'));
					$link.slotmanager_highlight();
					$link.slotmanager_play();
				}
				
			});		
			
		});
		
	}
	
	$.fn.set_slot_row_count = function() {
	
		var $tag = $(this); 
		var $slot_row = slotmanager_get_closest_slot_row($tag);
		var count = $slot_row.data('num_slots');
		if (!count) count = 0;
		count++;
		$slot_row.data('num_slots', count);

	}
	
	function slotmanager_get_closest_slot_row($tag) {
	
		var $slot_row = $tag.nextAll('.slot_row:first');
		if (!$slot_row.length)  $slot_row = $tag.parent().nextAll('.slot_row:first'); // unsafe..	
		return $slot_row;
	
	}
	
	$.fn.slotmanager_set_slot = function() {

		var slot_width = 300;
		var slot_height = null;
		var $tag = $(this); 
		if ($tag.data('slot')) return;
		var $slot_row = slotmanager_get_closest_slot_row($tag);

		// If the only element, change dimensions
		if ($slot_row.data('num_slots') <= 1) {
			if ($tag.attr('href') && $tag.attr('href').indexOf('svn')!=-1) { // TODO: hack, because having trouble getting annotation type from mediaelement
				slot_width = $slot_row.parent().width();
			}		
		}

		// Creat mediaelement
		$tag.slotmanager_create_slot(slot_width, slot_height);
		$slot_row.append( $tag.data('slot') );
		
		// Garbage collect
		$slot_row.children('br').remove();
		if ($slot_row.find('.slot').length) $slot_row.append('<br clear="both" />');	
		
		// The slot row will center itself, but needs to have a width; set it to the combined with of its children
		$slot_row.set_width_to_children(slot_width);
		
		
		
		return true;
		
	}	
	
	// http://stackoverflow.com/questions/1015669/calculate-total-width-of-children-with-jquery
	jQuery.fn.set_width_to_children = function(slot_width) {
	
		var $this = $(this);
		var width = 0;
		var max_width = $this.parent().innerWidth();
		$this.children('.slot').each(function() {
			var $child = $(this);
			var margin = parseInt($child.css('margin-left')) + parseInt($child.css('margin-right'));
    		width += slot_width + margin; // Unfortunately we can't know the width dynamically since there's a latency to the media loading
		});
		if (width > max_width) width = max_width;
		
		$this.css('width', width);	
	
	}
	
	jQuery.fn.slotmanager_create_slot = function(width, height) {
	
		var options = {'url_attributes':['href', 'src']};
		$tag = $(this); 
		if ($tag.hasClass('inline')) return;
		var url = null;
		
		// Get URL
		
		var url = null;
		for (var k in options['url_attributes']) {
			if ('undefined'==typeof($tag.attr(options['url_attributes'][k]))) continue;
			if ($tag.attr(options['url_attributes'][k]).length>0) {
				url = $tag.attr(options['url_attributes'][k]);
				break;
			}
		}
		if (!url) return;

		// Seperate seek hash if present
		
		var annotation_url = null;
		var uri_components = url.split('#');
		
		// TODO: Special case for hypercities #, until we correctly variable-ify #'s
		if (uri_components.length>1 && uri_components[0].toLowerCase().indexOf('hypercities')!=-1) {
			// keep URL as it is
		} else if (uri_components.length>1) {
			var url = uri_components[0];
			annotation_url = uri_components[1];	
			//if (annotation_url && annotation_url.indexOf('://')==-1) annotation_url = dirname(document.location.href)+'/'+annotation_url;	
			// modified by Erik below to remove duplicated 'annotations/' in url
			if (annotation_url && annotation_url.indexOf('://')==-1) annotation_url = scalarapi.model.urlPrefix+annotation_url;	
		}

		// Metadata resource
		var resource = $tag.attr('resource');	
		if (typeof(resource)=='undefined') return;
		// Create media element object
			
		$tag.data( 'slot', $('<div class="slot"></div>') );	

		var opts = {};
		opts.width = width;
		opts.height = height;
		opts.player_dir = $('link#approot').attr('href')+'static/players/';
		opts.base_dir = dirname(document.location.href)+'/';
		opts.seek = annotation_url;
		//if (opts.seek && opts.seek.length) alert('[Test mode] Asking to seek: '+opts.seek);		
		$tag.data('path', url);
		$tag.data('meta', resource);
		$tag.mediaelement(opts);

		// Insert media element's embed markup
		
		if (!$tag.data('mediaelement')) return false;  // mediaelement rejected the file
		$tag.data('slot').html( $tag.data('mediaelement').getEmbedObject() );
		$tag.data('slot').css('width', width+'px');

		return $tag.data('slot');
	
	}
	
	jQuery.fn.inline_set_slots = function() {
	
		var $parent = $(this);
		$parent.htmlClean();

		// Insert a slot after paragraphs indicated by "<br /><br />"
		$parent.find('br').each(function() {
			var $this = $(this);
			var $next = $this.next();
			if ($next.is('br') && !$this.prev().is('.slot_row')) {
				$this.before('<div class="slot_row"></div>');
				$next.remove();
			}
		});
		
		// Insert a slot after paragraphs indicated by "<p>" or "<div>"
		$parent.children('p, div').not('.slot_row').each(function() {
			var $this = $(this);
			if (!$this.next().is('.slot_row')) {
				$this.after('<div class="slot_row rev_slot_row"></div>');		
			}
		});		
		
		// Insert a slot at the end (if not already present)
		if (!$parent.children().last().is('.slot_row')) {
			$parent.append('<div class="slot_row"></div>');
		}			
		
		return $parent;
	
	}
	
	jQuery.fn.inline_set_slots_after = function() {
		
		var $parent = $(this);
		$parent.htmlClean();

		// Insert a slot after paragraphs indicated by "<br /><br />"
		$parent.find('br').each(function() {
			var $this = $(this);
			var $next = $this.next();
			if ($next.is('br') && !$this.prev().is('.slot_row')) {
				$this.before('<div class="slot_row"></div>');
			}
		});
		
		// Insert a slot after paragraphs indicated by "<p>" or "<div>"
		$parent.children('p, div').not('.slot_row').each(function() {
			var $this = $(this);
			if (!$this.next().is('.slot_row')) {
				$this.after('<div class="slot_row"></div>');		
			}
		});		
		
		return $parent;
	
	}	

	// http://stackoverflow.com/questions/1539367/remove-whitespace-and-line-breaks-between-html-elements-using-jquery
	jQuery.fn.htmlClean = function() {
	    this.contents().filter(function() {
	        if (this.nodeType != 3) {
	            $(this).htmlClean();
	            return false;
	        }
	        else {
	            return !/\S/.test(this.nodeValue);
	        }
	    }).remove();
	}
	
	/*
	 * $.fn.slotmanager_is_playing
	 * Determine if a slot if playing.  Also is a safety to make sure data('is_playing') is set.
     */		
	
	$.fn.slotmanager_is_playing = function() {
	
		var $tag = $(this);
	    if (!$tag.data('mediaelement')) return false;
		return $tag.data('mediaelement').is_playing();
	}	
	
	/*
	 * $.fn.slotmanager_play
	 * Play a slot's mediaelement
     */		
	
	$.fn.slotmanager_play = function() {

		var $tag = $(this);
		if (!$tag.data('mediaelement')) return false;
		$tag.data('mediaelement').play();
	
	}
	
	/*
	 * $.fn.slotmanager_pause
	 * Pause a slot's mediaelement
     */			
	
	$.fn.slotmanager_pause = function() {
	
		var $tag = $(this);
		if (!$tag.data('mediaelement')) return false;
		$tag.data('mediaelement').pause();
	
	}	

	/*
	 * $.fn.slotmanager_unhighlight
	 * Unhlighlight a tag
     */		
	
	$.fn.slotmanager_unhighlight = function() {
	
		$tag = $(this);
		if ($tag.data('slot')) {
			$tag.data('slot').find('.mediaElementHeader:first').css('background-color', '');
			$tag.data('slot').find('.mediaElementHeader:first').css('padding', '');
			$tag.data('slot').find('.mediaElementFooter:first').css('background-color', '');
			$tag.css('background-color', '');
		}	
	}
	
	/*
	 * $.fn.slotmanager_highlight
	 * Hlighlight a tag
     */			
	
	$.fn.slotmanager_highlight = function() {
	
		$tag = $(this);
		if ($tag.data('slot')) {
			$tag.data('slot').find('.mediaElementHeader:first').css('background-color', '#c5dceb');
			$tag.data('slot').find('.mediaElementHeader:first').css('padding', '0px 4px 0px 7px');
			$tag.data('slot').find('.mediaElementFooter:first').css('background-color', '#c5dceb');
			$tag.css('background-color', '#c5dceb');
		}
	
	}	
	
	/*
	 * unhighlight_all
	 * Unhlighlight an array of tags
	 * @param arr $tags a list of jQuery tags
     */		
	
	var unhighlight_all = function($tags) {
	
		for (var j = 0; j < $tags.length; j++) {
			$tags[j].slotmanager_unhighlight();
		}
	
	}	

	/*
	 * stop_playing_all
	 * Stop playing an array of tags
	 * @param arr $tags a list of jQuery tags
     */		
	
	var stop_playing_all = function($tags) {
	
		for (var j = 0; j < $tags.length; j++) {
			$tags[j].slotmanager_pause();
		}	
	
	}		

})(jQuery);

