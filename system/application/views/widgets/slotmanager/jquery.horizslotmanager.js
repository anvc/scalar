/**
 * @projectDescription  A horiozontal bar with slots for content
 * @author              Craig Dietrich
 * @version             1.0
 */

(function($) {

	$.fn.horizslotmanager = function(options) {

		var options = {
						url_attributes: ['href', 'src'],   // tag attribute to find URL
						tag_event: 'texteoTags',           // event to listen for to gain list of tags to create slots
					  };

		return this.each(function() {

			// Create wrappers

			var $this = $(this);
			$this.data('tags', []);
			var $slider = $('<div class="slot_slider"></div>');  // the slot wrapper, which slides left and right as the user scrolls
			$this.append($slider);
			var $nav = $('<div class="slot_nav"><div class="prev"></div><div class="current"></div><div class="next"></div><br clear="both" /></div>');
			$this.append($nav);

			// Listen for tag clicks, and run play or pause actions
			
			$('body').bind('texteoTagClicked', function(event, $link, clickEvent) {
			
				if (!$link.data('texteo_resource_link')) return;

				clickEvent.preventDefault()
				clickEvent.stopPropagation();	
			
				unhighlight_all($this.data('tags'));
				if (!$slider.data('current_slot') != $link.data('slot')) {
					$link.slotmanager_move_to($this.data('tags'), $this, $nav);
				}
				if ($link.slotmanager_is_playing()) {
					$link.slotmanager_pause();
				} else {
					stop_playing_all($this.data('tags'));
					$link.slotmanager_highlight();
					$link.slotmanager_play();
				}
				
			});	

			// Listen for tags, and create or update the status of each tag's slot

			$('body').bind(options['tag_event'], function(event, $tags) {

				// Setup slots

				for (var j = 0; j < $tags.length; j++) {

					// Create slot if it doesn't already exist
					
					if (!$tags[j].data('slot')) {
						var slot = $tags[j].slotmanager_create_slot(options);
						if (!slot) continue;
						$slider.append(slot);
						
						$this.data('tags').push($tags[j]);
					}

				}

				// Manage width

				set_width($this, $tags, options);
				$(window).resize(function() { set_width($this, $tags, options); });

				// Move to first element

				for (var j = 0; j < $tags.length; j++) {
					if ($tags[j].data('mediaelement')) {					
						$tags[j].slotmanager_move_to($tags, $this, $nav);
						break;
					}
				}

			});	

		});

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
		$tag.data('slot').find('.mediaElementHeader:first').css('background-color', '');
		$tag.data('slot').find('.mediaElementHeader:first').css('padding', '');
		//$tag.data('slot').find('.mediaElementFooter:first').css('background-color', '');
		$tag.css('background-color', '');
	
	}
	
	/*
	 * $.fn.slotmanager_highlight
	 * Hlighlight a tag
     */			
	
	$.fn.slotmanager_highlight = function() {
	
		$tag = $(this);
		$tag.data('slot').find('.mediaElementHeader:first').css('background-color', '#c5dceb');
		$tag.data('slot').find('.mediaElementHeader:first').css('padding', '0px 4px 0px 7px');
		//$tag.data('slot').find('.mediaElementFooter:first').css('background-color', '#c5dceb');
		$tag.css('background-color', '#c5dceb');
	
	}		

	/*
	 * $.fn.slotmanager_move_to
	 * Move the slider to a certain tag's slot
	 * @param obj $slot_container the wrapper element
	 * @param obj $nav that nav bar
     */		

	$.fn.slotmanager_move_to = function($tags, $slot_container, $nav) {

		var $tag = $(this);
		if ('undefined'==typeof($tag.data('slot'))) return;
		$slider = $tag.data('slot').parent();

		// Current index
		var index = get_slot_index($slot_container.data('tags'), $tag);

		slotmanager_set_buttons($tags, $slot_container, $nav, index);

		// Move slider
		if ($slider.data('current_slot') == $tag.data('slot')) return;
		var tag_left = parseInt($tag.data('slot').position().left);
		var slider_left = parseInt($slider.position().left);
		if (slider_left == tag_left) return;
		$slider.data('current_slot', $tag.data('slot'));
		var left = tag_left * -1;
		$slider.stop();
		$slider.clearQueue();
		hide_problem_formats($tags);
		$slider.animate({
    		left: left+'px'
  		}, 600, function() {
  			$tag.data('slot').find('.mediaContainer').css('visibility', 'visible');
  		});

	}
	
	var get_slot_index = function(tags, $tag) {
	
		for (var j = 0; j < tags.length; j++) {
			if (!tags[j].data('mediaelement')) continue;
			if (tags[j].data('slot') == $tag.data('slot')) return j;
		}
		return 0;
				
	}

	/*
	 * $.fn.slotmanager_create_slot
	 * Create a slot and attach to a tag
	 * @param obj options, required 'url_attributes'
     */

	$.fn.slotmanager_create_slot = function(options) {

		$tag = $(this);
		if ($tag.hasClass('inline')) return;
		$tag.data( 'slot', $('<div class="slot"></div>') );
		var is_file = $tag.hasClass('file') ? true : false;

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

		// Create media element object
		
		var opts = {height:((is_file)?'500px':'375px')}; // hack
		opts.player_dir = $('link#approot').attr('href')+'static/players/';
		opts.base_dir = dirname(document.location.href)+'/';
		opts.seek = annotation_url;
		//opts.header = 'nav_bar';
		//opts.show_annotations = true;
		//if (opts.seek && opts.seek.length) alert('[Test mode] Asking to seek: '+opts.seek);	
		$tag.data('path', url);
		//alert($tag.data('path'));
		$tag.data('meta', resource);
		$tag.mediaelement(opts);
		
		// Inser media element's embed markup
		if (!$tag.data('mediaelement')) return false;  // mediaelement rejected the file
		$tag.data('slot').html( $tag.data('mediaelement').getEmbedObject() );

		return $tag.data('slot');

	}

	var slotmanager_set_buttons = function($tags, $slot_container, $nav, index) {
	
		// Sort prev/current/next links
		var html;
		if ($slot_container.data('tags')[index-1]) {
			// html = ($slot_container.data('tags')[index-1].hasClass('hide_caption')) ? '' : jQuery.trim($slot_container.data('tags')[index-1].html());
			html = '';
			var $prev = $('<a href="javascript:;">&laquo; '+((html.length)?html:'Previous')+'</a>');
			$prev.click(function() { $slot_container.data('tags')[index-1].slotmanager_move_to($tags, $slot_container, $nav); });
			$nav.find('.prev').html($prev);
		} else {
			$nav.find('.prev').html('&nbsp;');
		}
		if ($slot_container.data('tags')[index+1]) {
			//html = ($slot_container.data('tags')[index+1].hasClass('hide_caption')) ? '' : jQuery.trim($slot_container.data('tags')[index+1].html());
			html = '';
			var $next = $('<a href="javascript:;">'+((html.length)?html:'Next')+' &raquo;</a>');
			$next.click(function() { $slot_container.data('tags')[index+1].slotmanager_move_to($tags, $slot_container, $nav); });
			$nav.find('.next').html($next);
		} else {
			$nav.find('.next').html('&nbsp;');
		}				
		if ($slot_container.data('tags').length==1) {
			$nav.hide();
		} else {
			$nav.show();
		}	
	
	}

	/*
	 * hide_problem_formats
	 * Hide the embed markup of media types (e.g., quicktime) that have problems with the animation effect 
	 * @param arr $tags a list of jQuery tags
     */	

	var hide_problem_formats = function($tags) {
	
		var do_hide;
		for (var j = 0; j < $tags.length; j++) {
			do_hide = ($tags[j].data('slot') && $tags[j].data('slot').find('embed').length > 0) ? true : false;
			if (do_hide) $tags[j].data('slot').find('.mediaContainer').css('visibility', 'hidden');
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

	/*
	 * set_width
	 * Set the height of the bar.  Since changing the bar's height changes the text's height, go into a calculus-like loop to refine the height
	 * @param $obj $this, the bar node
	 * @param obj options, which should include a 'height_to' string of the companion text element's ID
     */

	var set_width = function($this, $tags, options) {

		var width = $this.width();
		for (var j = 0; j < $tags.length; j++) {
			if (!$tags[j].data('slot')) continue;
			$tags[j].data('slot').width(width);
		}

	}

})(jQuery);

