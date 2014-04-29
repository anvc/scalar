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

	var pluginName = "scalarsearch",
		defaults = {
			root_url: ''
		};

	/**
	 * Manages the search results dialog.
	 */
	function ScalarSearch( element, options ) {

		this.element = $(element);
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;

		this.init();

	}

	ScalarSearch.prototype.bodyContent = null;			// body content container
	ScalarSearch.prototype.resultsTable = null;			// Table for the results
	ScalarSearch.prototype.modal = null; // bootstrap modal

	ScalarSearch.prototype.init = function () {

		var me = this;

		this.element.addClass('search');
		this.bodyContent = $('<div class="body_copy"></div>').appendTo(this.element);
		$( '<div class="results_list caption_font"><table summary="Search Results" class="table table-striped table-hover table-responsive"></table></div>' ).appendTo( this.bodyContent );

		this.modal = this.bodyContent.bootstrapModal({title: 'Search Results'});

		this.resultsTable = this.modal.find('.results_list table');
	}

	ScalarSearch.prototype.showSearch = function() {
		this.modal.modal('show');
	}

	ScalarSearch.prototype.hideSearch = function() {
		this.element.hide();
	}

	ScalarSearch.prototype.doSearch = function(query) {

		var me = this;
		this.resultsTable.empty();
		$( '<tr><td style="width:30%">Searching…</td><td></td></tr>' ).appendTo( this.resultsTable );
		this.showSearch();
		scalarapi.model.removeNodes();
		scalarapi.nodeSearch(
			query,
			function( data ) { me.handleResults( data ); },
			null, 0, false, null
		);

	}

	ScalarSearch.prototype.handleResults = function( data ) {

		var i, node, description, row, prev, next,
			me = this,
			nodes = scalarapi.model.getNodes();

		this.resultsTable.empty();

		for ( i in nodes ) {

			node = nodes[i];
			if (node.current != null) {
				description = node.current.description;
			}
			if (description == null) {
				description = '(No description)';
			} else {
				description = description.replace(/<\/?[^>]+>/gi, '');
			}
			row = $( '<tr><td style="width:30%">'+node.getDisplayTitle()+'</td><td>'+description+'</td></tr>' ).appendTo( this.resultsTable );
			row.data( 'node', node );
			row.click( function() { document.location = addTemplateToURL($(this).data('node').url, 'cantaloupe'); } );
		}

		if ( nodes.length == 0 ) {
			row = $( '<tr><td style="width:30%">No results found.</td><td></td></tr>' ).appendTo( this.resultsTable );
		}

	}

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if ( !$.data(this, "plugin_" + pluginName )) {
                $.data( this, "plugin_" + pluginName,
                new ScalarSearch( this, options ));
            }
        });
    }

})( jQuery, window, document );