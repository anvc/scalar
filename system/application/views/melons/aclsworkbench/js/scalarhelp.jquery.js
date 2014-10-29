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
		
		var canEdit = ( !isMobile && ((scalarapi.model.user_level == "scalar:Author") || (scalarapi.model.user_level == "scalar:Commentator") || (scalarapi.model.user_level == "scalar:Reviewer")));
		
		var header = $('<div class="dialog_header heading_font"></div>').appendTo(this.element);
		header.append('<h2 class="heading_font">Help</h2>');
		var buttons = $('<div class="right"></div>').appendTo(header);
		addIconBtn(buttons, 'close_icon.png', 'close_icon_hover.png', 'Close');
		buttons.find('[title="Close"]').click( function() { me.hideHelp(); } );
		header.append('<hr>');
		
		var content = $('<div class="body_copy"></div>').appendTo(this.element);
		content.append('<p>This <a href="http://scalar.usc.edu/scalar">Scalar</a> book is presented using an <strong>experimental interface</strong> designed to streamline and enhance the reading experience. As this interface is <strong>currently under active development</strong>, you may encounter bugs.</p>');
		content.append('<p>The <strong>header bar</strong> at the top of the screen gives you access to utilities for navigating and editing (if you’re logged in and have editing privileges). If the header bar is currently hidden, scroll towards the top of the page to make it appear. Here’s a quick reference guide to the header bar icons:</p>');
		
		var table = $( '<table></table>' ).appendTo( content );
		var descStyle;
		if ( canEdit ) {
			descStyle = 'half-description';
		} else {
			descStyle = 'description';
		}
		
		var row = $( '<tr></tr>' ).appendTo( table );
		row.append( '<td class="icon"><img src="'+this.options.root_url+'/images/menu_icon.png" alt="Home icon" width="30" height="30" /></td><td class="' + descStyle + '">Main menu</td>' );
		
		row = $( '<tr></tr>' ).appendTo( table );
		row.append( '<td class="icon"><img src="'+this.options.root_url+'/images/search_icon.png" alt="Search icon" width="30" height="30" /></td><td class="' + descStyle + '">Search</td>' );
		
		row = $( '<tr></tr>' ).appendTo( table );
		row.append( '<td class="icon"><img src="'+this.options.root_url+'/images/visualization_icon.png" alt="Visualization icon" width="30" height="30" /></td><td class="' + descStyle + '">Toggles &ldquo;pinwheel&rdquo; visualization of your current location in the book</td>' );
		
		row = $( '<tr></tr>' ).appendTo( table );
		row.append( '<td class="icon"><img src="'+this.options.root_url+'/images/help_icon.png" alt="Help icon" width="30" height="30" /></td><td class="' + descStyle + '">Help</td>' );
			
		row = $( '<tr></tr>' ).appendTo( table );
		row.append( '<td class="icon"><img src="'+this.options.root_url+'/images/user_icon.png" alt="User icon" width="30" height="30" /></td><td class="' + descStyle + '">Sign in</td>' );

		if ( canEdit ) {
			table.find( 'tr' ).eq( 0 ).append( '<td class="icon"><img src="'+this.options.root_url+'/images/new_icon.png" alt="New page icon" width="30" height="30" /></td><td class="' + descStyle + '">New page</td>' );
			table.find( 'tr' ).eq( 1 ).append( '<td class="icon"><img src="'+this.options.root_url+'/images/edit_icon.png" alt="Edit icon" width="30" height="30" /></td><td class="' + descStyle + '">Edit page/media</td>' );
			table.find( 'tr' ).eq( 2 ).append( '<td class="icon"><img src="'+this.options.root_url+'/images/annotate_icon.png" alt="Annotate icon" width="30" height="30" /></td><td class="' + descStyle + '">Annotate images or time-based media</td>' );
			table.find( 'tr' ).eq( 3 ).append( '<td class="icon"><img src="'+this.options.root_url+'/images/import_icon.png" alt="Import icon" width="30" height="30" /></td><td class="' + descStyle + '">Import media</td>' );
			table.find( 'tr' ).eq( 4 ).append( '<td class="icon"><img src="'+this.options.root_url+'/images/options_icon.png" alt="Options icon" width="30" height="30" /></td><td class="' + descStyle + '">Dashboard</td>' );
		}
		
		content.append('<p>If you\'re used to reading Scalar books in their standard interface, you\'ll find that many things have changed, and that not all of Scalar\'s features have been implemented yet. Thanks for your patience as we continue to expand the capabilities of this new interface. We welcome <a href="mailto:alliance4nvc@gmail.com?subject=New%20Scalar%20interface%20feedback">your feedback.</a></p>')
	}
	
	ScalarHelp.prototype.showHelp = function() {
		this.element.show();
		setState( ViewState.Modal );
	}
	
	ScalarHelp.prototype.hideHelp = function() {
		this.element.hide();
		restoreState();
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