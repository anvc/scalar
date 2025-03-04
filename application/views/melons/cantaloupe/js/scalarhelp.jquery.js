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
		this.modal = null;
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;

		this.init();

	}

	ScalarHelp.prototype.init = function () {

		var me = this;

		var canEdit = ( !isMobile && ((scalarapi.model.getUser().user_level == "scalar:Author") || (scalarapi.model.getUser().user_level == "scalar:Commentator") || (scalarapi.model.getUser().user_level == "scalar:Reviewer")));

		var content = $('<div class="body_copy"></div>');
		content.append('<p>The <strong>header bar</strong> at the top of the screen gives you access to utilities for navigating and editing (if you&rsquo;re logged in and have editing privileges). If the header bar is currently hidden, scroll towards the top of the page to make it appear. Here&rsquo;s a quick reference guide to the header bar icons:</p>');

		var table = $( '<table summary="Description of icons"></table>' ).appendTo( content );
		var descStyle;
		if ( canEdit ) {
			descStyle = 'half-description';
		} else {
			descStyle = 'description';
		}

		var row = $( '<tr></tr>' ).appendTo( table );
		row.append( '<td class="icon"><img src="'+this.options.root_url+'/images/menu_icon.png" alt="Main menu icon" width="30" height="30" /></td><td class="' + descStyle + '">Table of contents</td>' );

		row = $( '<tr></tr>' ).appendTo( table );
		row.append( '<td class="icon"><img src="'+this.options.root_url+'/images/search_icon.png" alt="Search icon" width="30" height="30" /></td><td class="' + descStyle + '">Search</td>' );

		row = $( '<tr></tr>' ).appendTo( table );
		row.append( '<td class="icon"><img src="'+this.options.root_url+'/images/help_icon.png" alt="Help icon" width="30" height="30" /></td><td class="' + descStyle + '">Help</td>' );

		row = $( '<tr></tr>' ).appendTo( table );
		row.append( '<td class="icon"><img src="'+this.options.root_url+'/images/user_icon.png" alt="Sign in / Sign out icon" width="30" height="30" /></td><td class="' + descStyle + '">Sign in</td>' );

		if ( canEdit ) {
			table.find( 'tr' ).eq( 0 ).append( '<td class="icon"><img src="'+this.options.root_url+'/images/new_icon.png" alt="New page icon" width="30" height="30" /></td><td class="' + descStyle + '">New page</td>' );
			table.find( 'tr' ).eq( 1 ).append( '<td class="icon"><img src="'+this.options.root_url+'/images/edit_icon.png" alt="Edit icon" width="30" height="30" /></td><td class="' + descStyle + '">Edit page/media</td>' );
			table.find( 'tr' ).eq( 2 ).append( '<td class="icon"><img src="'+this.options.root_url+'/images/annotate_icon.png" alt="Annotate icon" width="30" height="30" /></td><td class="' + descStyle + '">Annotate images or time-based media</td>' );
			table.find( 'tr' ).eq( 3 ).append( '<td class="icon"><img src="'+this.options.root_url+'/images/import_icon.png" alt="Import icon" width="30" height="30" /></td><td class="' + descStyle + '">Import media</td>' );
			table.find( 'tr' ).eq( 4 ).append( '<td class="icon"><img src="'+this.options.root_url+'/images/options_icon.png" alt="Book dashboard icon" width="30" height="30" /></td><td class="' + descStyle + '">Dashboard</td>' );

			content.append('<p>If you need help authoring your Scalar project, please consult the <a href="http://scalar.usc.edu/works/guide2" target="_scalar">User’s Guide.</a></p>')
		}

		content.append('<p>Got a question or concern? We welcome <a href="mailto:alliance4nvc@gmail.com?subject=New%20Scalar%20interface%20feedback" title="Send your feedback by email">your feedback.</a></p>')
		this.modal = content.bootstrapModal({title: 'Help'});

		this.modal.on('shown.bs.modal', function() {
			me.modal.find( '.modal-body a' )[ 0 ].focus();
			var firstFocusable = me.modal.find('.close');
			var lastFocusable = me.modal.find('.modal-body a').last();
			setupFocusTrap(firstFocusable, lastFocusable)
		});

		this.modal.on('hidden.bs.modal', function() {
			removeFocusTrap();
		} );

		this.element.replaceWith(this.element);
	}

	ScalarHelp.prototype.showHelp = function() {
		this.modal.modal('show');
		setState( ViewState.Modal );
	}

	ScalarHelp.prototype.hideHelp = function() {
		this.modal.modal('hide');
		restoreState();
	}

	ScalarHelp.prototype.toggleHelp = function() {
		this.modal.modal('toggle');
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
