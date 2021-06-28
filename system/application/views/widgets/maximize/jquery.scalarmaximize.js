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
 * @projectDescription  A slot manager of sorts, though only one media element intended
 * @author              Craig Dietrich
 * @version             1.0
 */

(function($) {

	$.fn.scalarmaximize = function() {

		return this.each(function() {

			var $link = $(this);
			var mediaelement = $link.data('mediaelement');
			var json = $link.data('json');

			$('.maximize').remove();
			var $div = $('<div class="maximize"><div class="maximize_fade"></div><div class="maximize_content"></div></div>');
			$div.css({ opacity: 0.0 });  // For fading in later (can't use fadeIn() because display:block disrupts the fixed positioning)
			$('body').append($div);

			// Set height of maximize box + reposition based on vertical scroll position
			// Normally position:fixed would take care of this, but want it to work on iOS, etc
			var content_top_margin = parseInt($div.find('.maximize_content').css('top'));
			$div.find('.maximize_fade').css('height', $(document).height());  // Is there a way to height:100% the entire document area?
			$div.find('.maximize_content')
				.css( 'top', parseInt($(document).scrollTop())+content_top_margin )
				.css( 'height', parseInt($(window).height())-(content_top_margin*2) );
			$(document).on('scroll', function() {
				$div.find('.maximize_content').stop(true).animate({
					top: parseInt($(document).scrollTop())+content_top_margin,
			  	}, 'fast');
			});

			// Clone link, to create a new mediaelement that doesn't conflict with the existing
			$link.data('clone', $link.clone()); // added by Erik so maximized media elements can receive messages from Flash
			$link = $link.data('clone');
			$link.data('json', json);

			// Slot properties
			$slot = $div.find('.maximize_content:first');
			var width = $slot.innerWidth() - 2;   // Magic number: adjust for 1px border
			var height = $slot.innerHeight() -2;  // Magic number: adjust for 1px border

			// Create media element

			var url = $link.attr('href');
			var uri_components = $link.attr('href').split('#');
			// TODO: Special case for hypercities #, until we correctly variable-ify #'s
			if (uri_components.length>1 && uri_components[0].toLowerCase().indexOf('hypercities')!=-1) {
				// keep URL as it is
			} else if (uri_components.length>1) {
				var url = uri_components[0];
				var annotation_url = uri_components[1];
				//if (annotation_url && annotation_url.indexOf('http://')==-1) annotation_url = dirname(document.location.href)+'/'+annotation_url;
				if (annotation_url && annotation_url.indexOf('http://')==-1) annotation_url = scalarapi.model.urlPrefix+annotation_url;
			}

			var resource = $link.attr('resource');
			var opts = {
						height: height,
						auto_width: true,
						header: 'nav_bar',
						show_footer: false,
						show_annotations: true
					   };
			opts.player_dir = $('link#approot').attr('href')+'static/players/';
			//opts.base_dir = dirname(document.location.href)+'/';
			opts.base_dir = scalarapi.model.urlPrefix;
			$link.data('path', url);
			$link.data('meta', resource);

			$('body').on('mediaElement_wrapperCreated', function(event, $wrapper) {
			   $slot.html( $wrapper );
			});

			$link.mediaelement(opts);

			// Insert media element's embed markup

			if (!$link.data('mediaelement')) return alert('There was a problem attempting to build the media player.  Please try again.');
			//$slot.html( $link.data('mediaelement').getEmbedObject() );

			$link.data('mediaelement').finishAutoWidth();  // Takes the place of an creation complete event

			// Add a close button
			/*
			var close_link = $('<a alt="Close" href="javascript:;">&nbsp;</a>');
			var close_span = $('<span class="close_link"></span>');
			close_span.append(close_link);
			$slot.find('.mediaElementHeader').append(close_span);
			close_link.on('click', function() {
				$(this).parents('.maximize').remove();
				$('.vert_slots').find('.slot').find('object, embed').css('visibility','visible');
			});
			$slot.find('.mediaElementAlignRight').remove();*/

			// Play the media

			//$link.data('mediaelement').play();

			$div.fadeTo(500, 1.0);

			$('.vert_slots').find('.slot').find('object, embed').css('visibility','hidden');

		});

	}


})(jQuery);
