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

;(function( $, window, document, undefined ) {

	var pluginName = "scalarvisualizations",
		defaults = {
			root_url: ''
		};
	
	/**
	 * Manages the visualizations dialog.
	 */
	function ScalarVisualizations( element, options ) {
	
		this.element = $(element);
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		
		this.firstRun = true;
		
		this.init();
		
	}
	
	ScalarVisualizations.prototype.bodyContent = null;			// body content container
	ScalarVisualizations.prototype.firstRun = null;			
	
	ScalarVisualizations.prototype.init = function () {
	
		var me = this;
	
		this.element.addClass('dialog visualizations');
		
		var header = $('<div class="dialog_header heading_font"></div>').appendTo(this.element);
		header.append('<h2 class="heading_font">Visualizations</h2>');
		var buttons = $('<div class="right"></div>').appendTo(header);
		addIconBtn(buttons, 'close_icon.png', 'close_icon_hover.png', 'Close');
		buttons.find('[title="Close"]').click( function() { me.hideVisualizations(); } );
		header.append('<hr>');
		
		this.bodyContent = $('<div class="body_copy"></div>').appendTo(this.element);
		
		this.vis = $('<div id="visualization"></div>').appendTo(this.bodyContent);
		
	}
	
	ScalarVisualizations.prototype.showVisualizations = function() {
		if ( this.firstRun ) {
			var options = {
				parent_uri: scalarapi.urlPrefix, 
				default_tab: 'visindex',
				minimal: true
			}; 
			this.vis.scalarvis(options);
			this.firstRun = false;
		}
		this.element.show();
	}
	
	ScalarVisualizations.prototype.hideVisualizations = function() {
		this.element.hide();
	}

			
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if ( !$.data(this, "plugin_" + pluginName )) {
                $.data( this, "plugin_" + pluginName,
                new ScalarVisualizations( this, options ));
            }
        });
    }

})( jQuery, window, document );