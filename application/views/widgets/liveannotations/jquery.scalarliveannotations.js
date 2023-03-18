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
 * @projectDescription  Create a thought-bubble-style box that displays the page content of an annotation when media is playing
 * @author              Craig Dietrich
 * @version             2.1
 */

(function($) {

	var scalarliveannotations_methods = {

		init : function(options) {

			return this.each(function() {

				var $el = $(this);
				if ($.fn.live_annotation('exists', $el, options)) {
					$el.remove();
					return;
				}
				$.fn.live_annotation('commit', $el, options);
				$.fn.live_annotation('create', $el, options);
				$.fn.live_annotation('place', $el, options);
				$.fn.live_annotation('events', $el, options);
				$.fn.live_annotation('show', $el, options);

			});

		},

		exists : function ($el, options) {

			var prev_live_annotation = false;
			$('.live_annotation').each(function() {
				if ($(this).data('url') == options.annotation.body.url) prev_live_annotation = true;
			});
			if (prev_live_annotation) return true;
			return false;

		},

		commit : function ($el, options) {

			$.fn.live_annotation('remove_all');
			$el.addClass('live_annotation');
			$el.data('url', options.annotation.body.url);

		},

		create : function ($el, options) {

			var $mediaelement_el = $(options.mediaelement.model.element);
			var annotation = options.annotation.body;

			var url = annotation.url;
			var title = (annotation.versions[0].title && annotation.versions[0].title.length) ? annotation.versions[0].title : '(No title)';
			var desc = (annotation.versions[0].description && annotation.versions[0].description.length) ? annotation.versions[0].description : '';
			var content = (annotation.versions[0].content && annotation.versions[0].content.length) ? annotation.versions[0].content : '';
			if (annotation.versions[0].sourceFile && annotation.versions[0].sourceFile.length) content = '<a class="inline" href="'+annotation.versions[0].sourceFile+'" resource="'+url+'"></a>'+content;  // Media
			var timestamp = annotation.outgoingRelations[0].startString + annotation.outgoingRelations[0].separator + annotation.outgoingRelations[0].endString;

			var $arrow = $('<div class="arrow"></div>').appendTo($el);
			var $content = $('<div class="annotation_content"></div>').appendTo($el);

			$content.append('<div class="options"><a class="nopreview" title="Visit the permanent page for this annotation" href="'+url+'">Permalink</a> | <!--<span class="popout"><a class="nopreview" title="Popout this annotation in a new browser window" href="javascript:;">Popout</a> |--> </span><a href="javascript:;" class="close nopreview" title="Close this annotation overlay">Close</a></div>');
			$content.append('<div class="title">'+title+'</div>');
			$content.append('<div class="timestamp"><a class="nopreview" href="javascript:;" title="Seek to the beginning of this annotation">'+timestamp+'</a></div>');
			if (content.length > 0) {
				$content.append('<div class="annotation_text">'+$.fn.live_annotation('nl2br', content)+'</div>');
			} else if (desc.length > 0) {
				$content.append('<div class="annotation_text">'+$.fn.live_annotation('nl2br', desc)+'</div>');
			}

			if ($.isFunction($.fn.texteo)) {
				$el.find('.annotation_text').texteo({scrolling_element:false, click:'native'});
			}
			if ($.isFunction($.fn.inlineslotmanager)) {
				$('.annotation_text .inline').inlineslotmanager();
			}

		},

		place: function ($el, options) {

			var $mediaelement_el = $(options.mediaelement.model.element);
			var $wrapper_el = $('#'+options.content_wrapper_id);
			var $content_el = $('#'+options.content_id);

			switch (options.mode) {
				case 'horiz':
					var top_offset = 10;
					var top = parseInt( $mediaelement_el.offset().top ) + parseInt( $mediaelement_el.outerHeight() ) + top_offset;
					var left = parseInt( $wrapper_el.offset().left + 10 );
					$el.offset( {top: top, left: left} );
					$el.width( $wrapper_el.innerWidth() - 20 );
					break;
				case 'vert':
					$el.css( 'left', $wrapper_el.offset().left );
					$el.width( $content_el.innerWidth() );
					$.fn.live_annotation('vert_position', $el, options);
					break;
			}

		},

		events: function ($el, options) {

			var $content = $el.find('.annotation_content:first');

			// Clicking popout launches the annotation in a new browser window
			/*
			$content.find(".options .popout:first a").on('click', function() {
				var $temp = $('<div><div class="live_annotation popout_live_annotation">'+$el.html()+'</div></div>');
				$temp.find('.options:first').find('.popout:first').remove();
				$temp.find('.options .close:first').attr('onclick', 'window.close()');
				popoutContent(title + ' - Annotation', $temp.html() );
			});
			*/

			// Clicking the timestamp takes the user back to the beginning of the annotation
			$content.find('.timestamp a:first').on('click', function() {
				$.fn.live_annotation('seek', $el, options);
			});

			// Clicking close removes the overlay or closes the popout box
			$content.find(".options .close:first").on('click', function() {
				options.mediaelement.pause();
				$.fn.live_annotation('remove_all');
			});

		},

		show : function ($el, option) {

			$el.animate({opacity:1}, 'slow');

		},

		vert_position : function ($el, options) {

			var $mediaelement_el = $(options.mediaelement.model.element);
			var mediaelement_node_offset = parseInt( $mediaelement_el.offset().top );
			var anno_offset = parseInt( $el.offset().top );
			var top = (parseInt($el.css('top')) + (mediaelement_node_offset - anno_offset) );
			$el.animate({top:top}, 100);

		},

		seek : function ($el, options) {

			var startTime = options.annotation.properties.start;
			var view = options.mediaelement.controller.view;
			view.seek(startTime);
			view.play();

		},

		remove_all : function () {

			$('.live_annotation').remove();

		},

	 	nl2br : function (str) {
    		var breakTag = '<br />';
    		return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
		}

	};

	$.fn.live_annotation = function(methodOrOptions) {

		if ( scalarliveannotations_methods[methodOrOptions] ) {
			return scalarliveannotations_methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
			return scalarliveannotations_methods.init.apply( this, [methodOrOptions] );  // Default to "init"
		} else {
			$.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.tooltip' );
		}

	};

})(jQuery);
