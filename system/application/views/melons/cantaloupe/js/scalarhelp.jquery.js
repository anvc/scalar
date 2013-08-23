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

	var pluginName = "scalarhelp",
		defaults = {
			root_url: ''
		};
	
	/**
	 * Manages the help dialog.
	 */
	function ScalarHelp( element, options ) {
	
		this.element = $(element);
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		
		this.init();
		
	}
		
	ScalarHelp.prototype.init = function () {
	
		var me = this;
	
		this.element.addClass('dialog help');
		
		var header = $('<div class="dialog_header heading_font"></div>').appendTo(this.element);
		header.append('<h2 class="heading_font">Help</h2>');
		var buttons = $('<div class="right"></div>').appendTo(header);
		addIconBtn(buttons, 'close_icon.png', 'close_icon_hover.png', 'Close');
		buttons.find('[title="Close"]').click( function() { me.hideHelp(); } );
		header.append('<hr>');
		
		var content = $('<div class="body_copy"></div>').appendTo(this.element);
		content.append('<p>This Scalar book is being presented using an experimental new interface designed to streamline and enhance the reading experience. It\'s a work in progress, but here are some tips for getting around.</p>');
		content.append('<p>The header bar at the top of the screen gives you access to utilities for navigating and (if you have editing privileges) editing. If the header bar is currently hidden, scroll upwards to make it appear.</p>');

		var list = $('<ul></ul>').appendTo(content);
		list.append('<li>The main menu of the book can be accessed from the <img src="'+this.options.root_url+'/images/home_icon.png" alt="Home icon" width="30" height="30" /> icon.</li>');
		list.append('<li>The <img src="'+this.options.root_url+'/images/visualization_icon.png" alt="Visualization icon" width="30" height="30" /> icon toggles display of the background "pinwheel" visualization, which shows you your current location in the book. Once you\'re viewing the visualization, you can use the plus and minus buttons at the bottom to zoom in and out on your current location.</li>');
		list.append('<li>The <img src="'+this.options.root_url+'/images/help_icon.png" alt="Help icon" width="30" height="30" /> icon toggles this help display.</li>');
		list.append('<li>Use the <img src="'+this.options.root_url+'/images/user_icon.gif" alt="User icon" width="30" height="30" /> icon to sign in to the book if you have an account.</li>');
		
		content.append('<p>If you have editing privileges in this book, you\'ll also see these options:</p>');
		list = $('<ul></ul>').appendTo(content);
		list.append('<li>The <img src="'+this.options.root_url+'/images/new_icon.png" alt="New page icon" width="30" height="30" /> icon creates a new page.</li>');
		list.append('<li>The <img src="'+this.options.root_url+'/images/edit_icon.png" alt="Edit icon" width="30" height="30" /> icon edits the current page.</li>');
		list.append('<li>The <img src="'+this.options.root_url+'/images/options_icon.png" alt="Options icon" width="30" height="30" /> icon opens the Dashboard.</li>');
		
		content.append('<p>If you\'re used to reading Scalar books in their standard interface, you\'ll find that many things have changed, and that not all of Scalar\'s features have been implemented yet. Thanks for your patience as we continue to expand the capabilities of this new interface. We welcome <a href="mailto:alliance4nvc@gmail.com?subject=New%20Scalar%20interface%20feedback">your feedback.</a></p>')
	}
	
	ScalarHelp.prototype.showHelp = function() {
		this.element.show();
	}
	
	ScalarHelp.prototype.hideHelp = function() {
		this.element.hide();
	}
	
	ScalarHelp.prototype.toggleHelp = function() {
		if (this.element.css('display') != 'none') {
			this.hideHelp();
		} else {
			this.showHelp();
		}
	}
			
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if ( !$.data(this, "plugin_" + pluginName )) {
                $.data( this, "plugin_" + pluginName,
                new ScalarHelp( this, options ));
            }
        });
    }

})( jQuery, window, document );