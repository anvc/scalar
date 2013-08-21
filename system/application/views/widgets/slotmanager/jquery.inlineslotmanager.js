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

