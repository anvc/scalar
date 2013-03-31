/**
 * @projectDescription  For handling inline media elements
 * @author              Craig Dietrich
 * @version             1.1
 */

(function($) {

	$.fn.inlineslotmanager = function(options) { 

		return this.each(function() {

			var $link = $(this);
			if (!$link.attr('resource')=='undefined') return;
			
			// Properties
			var url = $link.attr('href');
			var resource = $link.attr('resource');
			var annotation_url = null;
			var parent = $('link#parent').attr('href');
			var approot = $('link#approot').attr('href');
			var uri_components = url.split('#');
			// TODO: Special case for hypercities #, until we correctly variable-ify #'s
			if (uri_components.length>1 && uri_components[0].toLowerCase().indexOf('hypercities')!=-1) {
				// keep URL as it is
			} else if (uri_components.length>1) {
				var url = uri_components[0];
				annotation_url = uri_components[1];	
				if (annotation_url && annotation_url.indexOf('://')==-1) annotation_url = scalarapi.model.urlPrefix+annotation_url;	
			}
			if (url.indexOf('://')==-1) url = parent+url;	
			if (resource.indexOf('://')==-1) resource = parent+resource;		
		
			// Options to send to mediaelement
			var opts = {};
			if ($link.hasClass('media_page')) {
				if (-1==document.location.href.indexOf('annotation_editor')) {
					opts.height = '375px';
				} else {
					opts.width = '795px';
				}
			} else {
				opts.height = '375px';
			}
			// Create mediaelement
			opts.player_dir = approot+'static/players/';
			opts.base_dir = dirname(document.location.href)+'/';
			opts.seek = annotation_url;
			$link.data('path', url);
			$link.data('meta', resource);
			$link.mediaelement(opts);
			if (!$link.data('mediaelement')) return false;  // mediaelement rejected the file
			$slot = $('<div class="inline_slot"></div>');
			$link.after($slot);	
			$slot.html( $link.data('mediaelement').getEmbedObject() );	
			// Autoplay (if applicable)
			if ($link.hasClass('auto_play')) {
				this.play = function() {
					try {
						$link.data('mediaelement').play();  // mediaObjectView might not exist yet depending on how long the player takes to load
					} catch(err) {
						setTimeout(this.play, 1000);
					};
				};
				this.play();
			}		
			
		});
		
	}

})(jQuery);

