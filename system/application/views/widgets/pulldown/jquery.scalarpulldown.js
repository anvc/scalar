(function ($) {

	$.fn.scalarpulldown = function() {

		return this.each(function() {

			var $this = $(this);
			var $content = $this.children('.pulldown-content');
			var $content_nudge_center = $this.children('.pulldown-content-nudge-center');
			var $content_li = $content.children('li');
			var on_click = ($this.hasClass('pulldown_click')) ? true : false;
		
			if (!on_click) {
				$this.mouseover(function(){ $content.show(); $this.css('zIndex', 10); $("body").trigger("pulldownIsOpen", this); });
				$this.mouseout(function(){ $content.hide(); $this.css('zIndex', 1); });
			}
			
			$this.click(function(){ 
				if ($content.css('display') == 'block') {
					if ($this.find('.history_bar').length == 0) {
						$content.hide();
						$this.css('zIndex', 1);
					}
				} else {
					$content.show();
					$this.css('zIndex', 10); $("body").trigger("pulldownIsOpen", this);
				}
			}); 
				
			$content_nudge_center.each(function() {
				var nudge = parseInt($(this).innerWidth());
				var left = parseInt($(this).css('left'));
				$(this).css('left', (left - (nudge/2)));
			});
			
			$content_li.each(function() {
				// Rollover effect
				$(this).mouseover(function() {
					$(this).addClass('sel');
				});
				$(this).mouseout(function() {
					$(this).removeClass('sel');
				});		
			});

		});
	};
}) (jQuery);