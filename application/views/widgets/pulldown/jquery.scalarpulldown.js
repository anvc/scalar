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

(function ($) {

	$.fn.scalarpulldown = function() {

		return this.each(function() {

			var $this = $(this);
			var $content = $this.children('.pulldown-content');
			var $content_nudge_center = $this.children('.pulldown-content-nudge-center');
			var $content_li = $content.children('li');
			var on_click = ($this.hasClass('pulldown_click')) ? true : false;

			if (!on_click) {
				$this.on('mouseover', function(){ $content.show(); $this.css('zIndex', 10); $("body").trigger("pulldownIsOpen", this); });
				$this.on('mouseout', function(){ $content.hide(); $this.css('zIndex', 1); });
			}

			$this.on('click', function() {  // Add click even regardless of on_click, for gestural (e.g., iPad) support
				if ($content.css('display') == 'block') {
					$content.hide();
					$this.css('zIndex', 1);
				} else {
					$content.show();
					$this.css('zIndex', 10);
					$("body").trigger("pulldownIsOpen", this);
					if (on_click) {
						setTimeout(function() {
							$('body').on('click', function() {
								$content.hide();
								$this.css('zIndex', 1);
								$('body').off('click');
							});
						}, 50);
					}
				}
			});

			$content_nudge_center.each(function() {
				var nudge = parseInt($(this).innerWidth());
				var left = parseInt($(this).css('left'));
				$(this).css('left', (left - (nudge/2)));
			});

			$content_li.each(function() {
				// Rollover effect
				$(this).on('mouseover', function() {
					$(this).addClass('sel');
				});
				$(this).on('mouseout', function() {
					$(this).removeClass('sel');
				});
			});

		});
	};
}) (jQuery);
