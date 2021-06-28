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
 * @projectDescription  A vertical bar with slots for content
 * @author              Craig Dietrich
 * @version             1.0
 */

/**
 * TODO: refactor me
 */

(function($) {

	$.fn.vertslotmanager = function(options) {

		var options = {
                   url_attributes: ['href', 'src'],   // tag attribute to find URL
                   tag_event: 'texteoTags',           // event to listen for to gain list of tags to create slots
                   scrolling_element: 'window'        // the scrolling element
                      };

		return this.each(function() {

			// Wrappers

			var $this = $(this);
			$this.data('tags', []);
			$this.data('centering_mode', 'middle');
			var $container = $('<div class="slot_container"></div>');    // keeps the bar at a fixed position for better UI
			$this.append($container);
			var $fixer = $('<div class="slot_fixer"></div>');    // keeps the bar at a fixed position for better UI
			$container.append($fixer);
			var $slider = $('<div class="slot_slider"></div>');  // the slot wrapper, which slides up and down as the user scrolls
			$fixer.append($slider);
			var $controls = $('<div class="slot_controls"><div class="control_bar"><table class="control_bar_items"><tr><td class="up">&nbsp;</td><td class="spacer">&nbsp;</td><td class="slot_count" valign="top"></td><td class="spacer">&nbsp;</td><td class="down">&nbsp;</td></tr></table></div></div>');
			$this.append($controls);
			var $scrollable_element = $(window);

			setTimeout(function () {manage_height($this, $container, $fixer, $controls)},100);
			$(window).on('resize', function() {
				manage_height($this, $container, $fixer, $controls);
			});
			$(window).on('scroll', function() {
				manage_height($this, $container, $fixer, $controls);
				//$slider.data('current_tag').slotmanager_move_to($scrollable_element, $this);
			});

			// Listen for tag clicks, and run play or pause actions

			$('body').on('texteoTagClicked', function(event, $link, clickEvent) {

				if (!$link.data('texteo_resource_link')) return;

				clickEvent.preventDefault()
				clickEvent.stopPropagation();

				unhighlight_all($this.data('tags'));
				//if (!$link.data('slot').slotmanager_is_on_screen($this)) {
					$link.slotmanager_move_to($scrollable_element, $this);
				//}
				if ($link.slotmanager_is_playing()) {
					$link.slotmanager_pause();
				} else {
					stop_playing_all($this.data('tags'));
					$link.slotmanager_highlight();
					$link.slotmanager_play();
				}
				manage_height($this, $container, $fixer, $controls);

			});

			// Controls
			// TODO: refactor me

			$controls.find('.up').on('click', function() {
				unhighlight_all($this.data('tags'));
				// Default to the first tag
				var move_to = $this.data('tags')[0];
				// Find current slot if applicable
				for (var j = 0; j < $this.data('tags').length; j++) {
					if ($this.data('tags')[j].data('slot') == $slider.data('current_slot')) {
						if ($this.data('tags')[j]) move_to = $this.data('tags')[j];
						if ($this.data('tags')[j-1]) move_to = $this.data('tags')[j-1];
					}
				}
				move_to.slotmanager_move_to($scrollable_element, $this);
				move_to.slotmanager_highlight();
				slotmanager_set_count($this);
			});
			$controls.find('.down').on('click', function() {
				unhighlight_all($this.data('tags'));
				// Default to the first tag
				var move_to = $this.data('tags')[0];
				// Default to the second tag if present
				if ($this.data('tags')[1]) move_to = $this.data('tags')[1];
				// Find current slot if applicable
				for (var j = 0; j < $this.data('tags').length; j++) {
					if ($this.data('tags')[j].data('slot') == $slider.data('current_slot')) {
						if ($this.data('tags')[j]) move_to = $this.data('tags')[j];
						if ($this.data('tags')[j+1]) move_to = $this.data('tags')[j+1];
					}
				}
				move_to.slotmanager_move_to($scrollable_element, $this);
				move_to.slotmanager_highlight();
				slotmanager_set_count($this);
			});

			// Listen for tags, and create or update the status of each tag's slot

			$('body').on(options['tag_event'], function(event, $tags) {

				// Create slots if they don't already exist

				for (var j = 0; j < $tags.length; j++) {
					if (!$tags[j].data('slot')) {
						var slot = $tags[j].slotmanager_create_slot($slider.innerWidth(), options);
						if (!slot) continue;
						$slider.append(slot);
						$this.data('tags').push($tags[j]);
					}
				}

				// Move the slider if applicable

				var onScreenTags = [];
				for (var j = 0; j < $tags.length; j++) {
					if ($tags[j].data('is_on_screen') && $tags[j].data('mediaelement')) {
						/* Modified by Erik on 8/22/11, tweaked how we decide what media element to scroll to (see below)
						unhighlight_all($this.data('tags'));
						$tags[j].slotmanager_move_to($scrollable_element, $this);
						break;*/
						onScreenTags.push(j); // store indexes of on-screen tags for later
					}
				}

				// if there's at least one tag on screen, then
				if (onScreenTags.length > 0) {
					var tagIndex;

					// when the top-most tag is showing, we want to scroll to its media, but as we proceed down the page,
					// we want to gradually transition to scrolling to the media of the tag that's closest to the
					// vertical center of the visible portion of the page -- this ratio helps us accomplish this
					var tagRatio = Math.min((onScreenTags[0] / $tags.length), .5);
					tagIndex = Math.floor((onScreenTags.length - 1) * tagRatio);

					//unhighlight_all($this.data('tags'));
					//$tags[onScreenTags[tagIndex]].slotmanager_highlight();
					$tags[onScreenTags[tagIndex]].slotmanager_move_to($scrollable_element, $this);

				// otherwise, scroll to the top element
				} else {
					$tags[0].slotmanager_move_to($scrollable_element, $this);
				}

			});

		});

	}

	var slotmanager_set_count = function($this) {

		var $slider = $this.find('.slot_slider');
		var num_slots = $this.data('tags').length;
		var current_slot = 1;
		for (var j = 0; j < $this.data('tags').length; j++) {
			if ($this.data('tags')[j].data('slot') == $slider.data('current_slot')) {
				current_slot = j + 1;
			}
		}

		$this.find('.slot_count').html(current_slot+' of '+num_slots);

		// Hide controls if there is only one media (purely for aesthetic reasons)
		if (num_slots==1) {
			$this.find('.slot_controls').hide();
		} else {
			$this.find('.slot_controls').show();
		}

	}

	/*
	 * $.fn.slotmanager_is_on_screen
	 * Determine if a slot is in the viewable area of the browser window.
     */

	$.fn.slotmanager_is_on_screen = function($slot_container) {

		var $slot = $(this);
		var $container = $slot_container.find('.slot_container');
		var $controls = $slot_container.find('.slot_controls');
		var $slider = $slot.parent();

		// Get the  position of the slot in the window as if there were no scroll or fixed boxes

		var slot_top = $slot.position().top + parseInt($slider.css('top'));

		// Determine if the slot is inside the window

		var slot_height = $slot.height();
		var controls_top = parseInt($controls.css('top'));

		$slot.data('is_on_screen', false);
		if (slot_top > 0 && (slot_top + slot_height) < controls_top) {
			$slot.data('is_on_screen', true);
		}

		return $slot.data('is_on_screen');

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

		try {
			var $tag = $(this);
			if (!$tag.data('mediaelement')) return false;
			$tag.data('mediaelement').play();
		} catch(err) {}

	}

	/*
	 * $.fn.slotmanager_pause
	 * Pause a slot's mediaelement
     */

	$.fn.slotmanager_pause = function() {

		try {
			var $tag = $(this);
			if (!$tag.data('mediaelement')) return false;
			$tag.data('mediaelement').pause();
		} catch(err) {}

	}

	/*
	 * $.fn.slotmanager_move_to
	 * Move the slider to a certain tag's slot
	 * @param obj $scrollable_elemt the scrollable handle
	 * #param obj $slot_container the parent of the slots that the movement is inside
     */

	$.fn.slotmanager_move_to = function($scrollable_element, $slot_container) {

		$tag = $(this);
		if ('undefined'==typeof($tag.data('slot'))) return;
		$slider = $tag.data('slot').parent();
		$vert_slots = $slot_container.parent();

		// if ($tag.data('slot') == $slider.data('current_slot')) return;

		var top = parseInt($slider.css('top'));  // "Reset" the slider to 0
		top = top - $tag.data('slot').offset().top;  // The location of the slot relative to the window
		top = top + $scrollable_element.scrollTop(); // Offset the scroll amount

		if ($scrollable_element.scrollTop() < $slot_container.offset().top) {
			top = top + ( $slot_container.offset().top - $scrollable_element.scrollTop() );
		} else if ($tag.data('slot') == $slider.data('current_slot')) {
			//return;
		}

		// If vert slots bar isn't tall enough...
		var slot_max_height = parseInt($slot_container.find('.mediaContainer:first').css('max-height'));
		if ('undefined'!=typeof(slot_max_height) && slot_max_height) {
			if ($vert_slots.height() < (slot_max_height * 2)) $slot_container.data('centering_mode', 'top');
		}

		// Have the node center on the page, if it's not the first element

		if ($tag.data('slot').position().top && $slot_container.data('centering_mode')=='middle') {
			// Height of window
			var the_height = parseInt($scrollable_element.height());
			// If vert slots area is less than height of window, use that instead
			if (parseInt($vert_slots.height()) < the_height) {
				the_height = parseInt($vert_slots.height());
			}
			// Set top
			top = top + (parseInt(the_height) / 2) - ($tag.data('slot').height() * 1.0);
		} else if (top > 20) {
			top = top + 20;  // Magic number
		}

		// Run animationa

		$slider.data('current_slot', $tag.data('slot'));
		$slider.data('current_tag', $tag);
		$slider.stop();
		$slider.clearQueue();
		hide_problem_formats($slot_container.data('tags'));
		$slider.animate({
    		top: top+'px'
  		}, 600, function() {
  			show_all($slot_container.data('tags'));
  			$('body').trigger('vert_slider_moved');
  		});

  		slotmanager_set_count($slot_container);

	}

	/*
	 * $.fn.slotmanager_unhighlight
	 * Unhlighlight a tag
     */

	$.fn.slotmanager_unhighlight = function() {

		$tag = $(this);
		$tag.data('slot').find('.mediaElementHeader:first').css('background-color', '');
		$tag.data('slot').find('.mediaElementHeader:first').css('padding', '');
		$tag.data('slot').find('.mediaElementFooter:first').css('background-color', '');
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
		$tag.data('slot').find('.mediaElementFooter:first').css('background-color', '#c5dceb');
		$tag.css('background-color', '#c5dceb');

	}

	/*
	 * $.fn.slotmanager_create_slot
	 * Create a slot and attach to a tag
	 * @param obj options, required 'url_attributes'
     */

	$.fn.slotmanager_create_slot = function(width, options) {

		$tag = $(this);
		if ($tag.hasClass('inline')) return;
		$tag.data( 'slot', $('<div class="slot"></div>') );
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
			if (annotation_url && annotation_url.indexOf('://')==-1) annotation_url = scalarapi.model.urlPrefix+annotation_url;
		}

		// Metadata resource
		var resource = $tag.attr('resource');

		// Create media element object

		var opts = {};
		opts.width = width;
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

		return $tag.data('slot');

	}

	/*
	 * hide_problem_formats
	 * Hide the embed markup of media types (e.g., quicktime) that have problems with the animation effect
	 * @param arr $tags a list of jQuery tags
     */

	var hide_problem_formats = function($tags) {
		var do_hide;
		for (var j = 0; j < $tags.length; j++) {
			do_hide = ($tags[j].data('slot').find('embed').length > 0) ? true : false;
			if (do_hide) $tags[j].data('slot').find('.mediaContainer').css('visibility', 'hidden');
		}
	}

	var show_all = function($tags) {

		for (var j = 0; j < $tags.length; j++) {
			$tags[j].data('slot').find('.mediaContainer').css('visibility', 'visible');
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
	 * manage_height
	 * Set clipping and the location of the control bar
     */

	var manage_height = function($this, $container, $fixer, $controls) {

			// Determine values for various elements
			var content_height = parseInt($('#content').outerHeight()) + parseInt($('h4.content_title').outerHeight());
		    // The above assumes that the vert slot CSS has loaded, making the text column thinner and thus longer
		    // If CSS loading can't be detected (ie, using yepnopejs) use the call below
			// var content_height = parseInt($('#reply_list').position().top);
			var container_offset = parseInt($container.offset().top);
			var top_offset = parseInt($this.offset().top);
			var scrolltop = parseInt($(window).scrollTop());
			var window_height = parseInt($(window).height());
			var controls_height = parseInt($controls.outerHeight());
			var clip_top = scrolltop*-1;

			// Clip the sidebar

			var innerWidth = $this.innerWidth();
			$container.height(content_height+'px');
			$container.width(innerWidth);

			// Place controls (fixed position)

			var controls_top = content_height - controls_height;
			$this.data('centering_mode', 'middle');

			// If the bottom of the controls is below the window, move up
			var controls_bottom = controls_top+controls_height;
			if ( !isIPhone() && controls_bottom > (window_height - top_offset + scrolltop ) ) {
				controls_top = ( window_height - top_offset + scrolltop ) - controls_height;
			}

			// $container.css('clip', 'rect(0px,'+innerWidth+'px,'+(controls_top)+'px,0px)');

			$controls.css('top', controls_top+'px');

	}

})(jQuery);
