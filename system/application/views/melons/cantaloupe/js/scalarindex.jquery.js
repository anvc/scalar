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

	var pluginName = "scalarindex",
		defaults = {
			root_url: ''
		};

	/**
	 * Manages the index dialog.
	 */
	function ScalarIndex( element, options ) {

		this.element = $(element);
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;

		this.DisplayMode = {
			Path: 'Path',
			Page: 'Page',
			Media: 'Media',
			Tag: 'Tag',
			Annotation: 'Annotation',
			Comment: 'Reply'
		}

		this.init();

	}

	ScalarIndex.prototype.bodyContent = null;			// body content container
	ScalarIndex.prototype.currentMode = null;			// Current display mode
	ScalarIndex.prototype.currentPage = null;			// Current page of results being displayed
	ScalarIndex.prototype.resultsTable = null;			// Table for the results
	ScalarIndex.prototype.pagination = null;			// Pagination interface
	ScalarIndex.prototype.resultsPerPage = null;		// Results to show per page
	ScalarIndex.prototype.controlBar = null;			// Index controls
	ScalarIndex.prototype.firstRun = null;				// First time the plug-in has run?
	ScalarIndex.prototype.maxPages = null;				// Maximum number of pages with known results in the current tab

	ScalarIndex.prototype.init = function () {

		var me = this;

		this.currentPage = 1;
		this.maxPages = 1;
		this.resultsPerPage = 10;
		this.firstRun = true;

		this.element.addClass( 'modal fade' );
		this.element.attr( {
			'tabindex': '-1',
			'role': 'dialog',
			'aria-labelledby': 'myModalLabel',
			'aria-hidden': 'true'
		} );
		this.element.append( '<div class="modal-dialog modal-lg"><div class="modal-content"></div></div>' );
		var modalContent = this.element.find( '.modal-content' );
		var header = $( '<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h2 class="modal-title heading_font">Index</h2></div>' ).appendTo( modalContent );
		this.bodyContent = $( '<div class="modal-body"></div>' ).appendTo( modalContent );

		this.controlBar = $( '<ul class="nav nav-pills"></ul>' ).appendTo( this.bodyContent );
		var pathBtn = $( '<li id="pathBtn" class="active caption_font"><a href="javascript:;">Paths</li>' ).appendTo( this.controlBar );
		var pageBtn = $( '<li id="pageBtn" class="caption_font"><a href="javascript:;">Pages</li>' ).appendTo( this.controlBar );
		var mediaBtn = $( '<li id="mediaBtn" class="caption_font"><a href="javascript:;">Media</li>' ).appendTo( this.controlBar );
		var tagBtn = $( '<li id="tagBtn" class="caption_font"><a href="javascript:;">Tags</li>' ).appendTo( this.controlBar );
		var annotationBtn = $( '<li id="annotationBtn" class="caption_font"><a href="javascript:;">Annotations</li>' ).appendTo( this.controlBar );
		var commentBtn = $( '<li id="replyBtn" class="caption_font"><a href="javascript:;">Comments</li>' ).appendTo( this.controlBar );

		pathBtn.click(function () { me.setDisplayMode( me.DisplayMode.Path ); });
		pageBtn.click(function () { me.setDisplayMode( me.DisplayMode.Page ); });
		mediaBtn.click(function () { me.setDisplayMode( me.DisplayMode.Media ); });
		tagBtn.click(function () { me.setDisplayMode( me.DisplayMode.Tag ); });
		annotationBtn.click(function () { me.setDisplayMode( me.DisplayMode.Annotation ); });
		commentBtn.click(function () { me.setDisplayMode( me.DisplayMode.Comment ); });

		var resultsDiv = $( '<div class="results_list caption_font"></div>' ).appendTo( this.bodyContent );
		this.resultsTable = $( '<table class="table table-striped"></table>' ).appendTo( resultsDiv );
		this.loading = $('<div class="loading"><p>Loading...</p></div>').hide().insertAfter(this.resultsTable);

		this.pagination = $( '<ul class="pagination caption_font"></ul>' ).appendTo( this.bodyContent );


	}

	ScalarIndex.prototype.showIndex = function() {

		this.element.modal().on('hidden.bs.modal', function (e) {
			$( 'body' ).css( 'overflowY', 'auto' );
		});

		if ( this.firstRun ) {
			this.setDisplayMode(this.DisplayMode.Path);
			this.firstRun = false;
		}
		setState( ViewState.Modal );
	}

	ScalarIndex.prototype.hideIndex = function() {

		this.element.modal( 'hide' );
		restoreState();
	}

	ScalarIndex.prototype.setDisplayMode = function( mode ) {

		var me = this;

		if ( this.currentMode != mode ) {
			this.currentMode = mode;
			this.currentPage = 1;
			this.maxPages = 1;
			mode = mode.toLowerCase();
			this.controlBar.find('li').removeClass('active');
			$('#'+mode+'Btn').addClass('active');
			me.getResults();
		}

	}

	ScalarIndex.prototype.showLoading = function() {
		var h = this.resultsTable.height();
		var $p = this.loading.find('p');
		this.loading.width(this.resultsTable.width()).height(h);
		$p.css('top', (((h-$p.height())/2)-5)+'px');
		this.loading.show();
	}

	ScalarIndex.prototype.getResults = function() {
		var me = this;
		this.showLoading();
		scalarapi.loadNodesByType(
			this.currentMode.toLowerCase(), true,
			function( data ) { me.loading.hide(); me.handleResults( data ); },
			null, 0, false, null, ( me.currentPage - 1 ) * me.resultsPerPage, me.resultsPerPage
		);
	}

	ScalarIndex.prototype.handleResults = function( data ) {

		var i, node, description, row, prev, next,
			nodes = [],
			me = this;

		for ( i in data ) {
			node = scalarapi.getNode( i );
			if ( node !== undefined ) {
				nodes.push( node );
			}
		}

		this.resultsTable.empty();

		for ( i in nodes ) {
			node = nodes[i];
			description = node.current.description;
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

		this.pagination.empty();
		if (( nodes.length == this.resultsPerPage ) || ( this.currentPage > 1 )) {
			if ( this.currentPage > 1 ) {
				prev = $('<li><a href="javascript:;">&laquo;</a></li>').appendTo( this.pagination );
				prev.find('a').click( function() { me.previousPage(); } );
			} else {
				prev = $('<li class="disabled"><a href="javascript:;">&laquo;</a></li>').appendTo( this.pagination );
			}
			for ( i = 1; i <= this.maxPages; i++ ) {
				var pageBtn = $( '<li><a href="javascript:;">' + i + '</a></li>' ).appendTo( this.pagination );
				pageBtn.data( 'page', i );
				if ( i == this.currentPage ) {
					pageBtn.addClass( 'active' );
				}
				pageBtn.click( function() {
					me.goToPage( $( this ).data( 'page' ) );
				} );
			}
			if ( nodes.length == this.resultsPerPage ) {
				next = $( '<li><a href="javascript:;">&raquo;</a></li>' ).appendTo( this.pagination );
				next.find('a').click( function() { me.nextPage(); } );
			} else {
				next = $( '<li class="disabled"><a href="javascript:;">&raquo;</a></li>' ).appendTo( this.pagination );
			}
		}

	}

	ScalarIndex.prototype.previousPage = function() {
		if ( this.currentPage > 1) {
			this.currentPage--;
			this.getResults();
		}
	}

	ScalarIndex.prototype.nextPage = function() {
		this.currentPage++;
		this.maxPages = Math.max( this.maxPages, this.currentPage );
		this.getResults();
	}

	ScalarIndex.prototype.goToPage = function( pageNum ) {
		this.currentPage = pageNum;
		this.getResults();
	}

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if ( !$.data(this, "plugin_" + pluginName )) {
                $.data( this, "plugin_" + pluginName,
                new ScalarIndex( this, options ));
            }
        });
    }

})( jQuery, window, document );