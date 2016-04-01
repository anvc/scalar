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
		};

		this.tabIndex = {
			Path: 1001,
			Page: 1002,
			Media: 1003,
			Tag: 1004,
			Annotation: 1005,
			Comment: 1006,
			Close: 100000
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
			'aria-labelledby': 'myModalLabel'
		} );
		this.element.append( '<div class="modal-dialog modal-lg"><div class="modal-content index_modal"></div></div>' );
		var modalContent = this.element.find( '.modal-content' );
		var header = $( '<header class="modal-header"><h2 class="modal-title heading_font heading_weight">Index</h2><button tabindex="'+this.tabIndex.Close+'" type="button" title="Close" class="close" data-dismiss="modal"><span>Close</span></button></header>' ).appendTo( modalContent );
		this.bodyContent = $( '<div class="modal-body"></div>' ).appendTo( modalContent );

		this.controlBar = $( '<ul class="nav nav-tabs"></ul>' ).appendTo( this.bodyContent );
		var pathBtn = $( '<li id="pathBtn" class="active caption_font"><a tabindex="'+this.tabIndex.Path+'" href="#Path">Paths</a></li>' ).appendTo( this.controlBar );
		var pageBtn = $( '<li id="pageBtn" class="caption_font"><a tabindex="'+this.tabIndex.Page+'" href="#Page">Pages</a></li>' ).appendTo( this.controlBar );
		var mediaBtn = $( '<li id="mediaBtn" class="caption_font"><a tabindex="'+this.tabIndex.Media+'" href="#Media">Media</a></li>' ).appendTo( this.controlBar );
		var tagBtn = $( '<li id="tagBtn" class="caption_font"><a tabindex="'+this.tabIndex.Tag+'" href="#Tag">Tags</a></li>' ).appendTo( this.controlBar );
		var annotationBtn = $( '<li id="annotationBtn" class="caption_font"><a tabindex="'+this.tabIndex.Annotation+'" href="#Annotation">Annotations</a></li>' ).appendTo( this.controlBar );
		var commentBtn = $( '<li id="replyBtn" class="caption_font"><a tabindex="'+this.tabIndex.Comment+'" href="#Comment">Comments</a></li>' ).appendTo( this.controlBar );

		var showTab = function(event) {
			event.preventDefault();
			var mode = $(this).attr('href').substr(1);
			me.setDisplayMode( me.DisplayMode[mode] );
		}

		this.controlBar.find('li>a').click(showTab);

		// tabbing forward from close button brings focus to path tab
		header.find( '.close' ).onTab(function() {
			pathBtn.find( 'a' )[ 0 ].focus();
		});

		// tabbing backwards from path tab brings focus to close button
		pathBtn.find('a').onTabBack(function() {
			header.find( '.close' )[ 0 ].focus();
		});

		var resultsDiv = $( '<div class="results_list caption_font"></div>' ).appendTo( this.bodyContent );
		this.resultsTable = $( '<table summary="" class="table table-striped table-hover table-responsive small"></table>' ).appendTo( resultsDiv );
		this.loading = $('<div class="loading"><p>Loading...</p></div>').hide().insertAfter(this.resultsTable);

		this.pagination = $( '<ul class="pagination caption_font"></ul>' ).appendTo( this.bodyContent );
		//this.controlBar.accessibleBootstrapTabs();
	}

	ScalarIndex.prototype.showIndex = function() {

		this.element.modal().on('hidden.bs.modal', function (e) {
			$( 'body' ).css( 'overflowY', 'auto' );
		});

		var mode = this.currentMode || this.DisplayMode.Path;

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

		if ( me.currentMode != mode ) {
			this.currentMode = mode;
			this.maxPages = 0;
			mode = mode.toLowerCase();
			this.controlBar.find('li').removeClass('active');
			$('#'+mode+'Btn').addClass('active');
			me.pagination.empty();
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

	ScalarIndex.prototype.getResults = function(callback) {
		var me = this;
		this.showLoading();
		scalarapi.loadNodesByType(
			this.currentMode.toLowerCase(), true,
			function( data ) {
				me.loading.hide();
				me.handleResults( data );
				if (callback) callback();
			},
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
				if(me.maxPages == 0){
					//We have not yet calculated the number of pages - use the citation property to determine maxPages
					var citationProp = node.properties['http://scalar.usc.edu/2012/01/scalar-ns#citation'][0].value;
					var p = new RegExp('.*?(methodNumNodes=)(\\d+)',["i"]);
					var m = p.exec(citationProp);
					me.maxPages = Math.ceil(parseInt(m[2])/me.resultsPerPage);
				}
				nodes.push( node );
			}
		}

		this.resultsTable.parent().scrollTop( 0 );
		this.resultsTable.empty();
		var $a = this.controlBar.find('li.active a');
		if ($a.length) {
			this.resultsTable.attr('summary', 'Results for '+$a.html().toLowerCase());
		}

		// tabindex
		var tabindex = this.tabIndex.Comment;

		for ( i in nodes ) {
			tabindex++;
			node = nodes[i];
			description = node.current.description;
			if (description == null) {
				description = '(No description)';
			} else {
				description = description.replace(/<\/?[^>]+>/gi, '');
			}
			var thumb = '';
			if (node.thumbnail) {
				thumb = '<img src="'+node.thumbnail+'" alt="Thumbnail for '+node.getDisplayTitle()+'" />';
			}
			row = $( '<tr><td class="title"><a href="javascript:;" tabindex="'+tabindex+'">'+node.getDisplayTitle()+'</a></td><td class="desc">'+description+'</td><td class="thumb">'+thumb+'</td></tr>' ).appendTo( this.resultsTable );
			row.data( 'node', node );
			row.click( function() { document.location = addTemplateToURL($(this).data('node').url, 'cantaloupe'); } );
		}

		if ( nodes.length == 0 ) {
			row = $( '<tr><td style="width:30%">No results found.</td><td></td></tr>' ).appendTo( this.resultsTable );
		}
		if ( this.currentPage > 1 ) {
			this.pagination.find('.prevPage').removeClass('disabled');
		}else{
			this.pagination.find('.prevPage').addClass('disabled');
		}

		if(this.currentPage < me.maxPages){
			this.pagination.find('.nextPage').removeClass('disabled');
		}else{
			this.pagination.find('.nextPage').addClass('disabled');
		}

		if(data.length > 0){
		}
		if(me.maxPages > 1 && this.pagination.html() == ""){
				tabindex++;
				if(me.maxPages > 1){
					prev = $('<li class="disabled prevPage"><a tabindex="'+tabindex+'" title="Previous results page" href="javascript:;">&laquo;</a></li>').appendTo( this.pagination );
					prev.find('a').click( function() { if(!$(this).parent().hasClass('disabled')){me.previousPage();} } );
				}
				//var maxPages = this.tabPageCount[this.currentMode] || 1;
				for ( i = 1; i <= me.maxPages; i++ ) {
					tabindex++;
					var pageBtn = $( '<li><a data-page="'+i+'" title="Go to results page ' + i + '" tabindex="'+tabindex+'" href="javascript:;">' + i + '</a></li>' ).appendTo( this.pagination );
					pageBtn.data( 'page', i );
					if ( i == this.currentPage ) {
						pageBtn.addClass( 'active' );
					}
					pageBtn.click( function() {
						me.goToPage( $( this ).data( 'page' ) );
						$(this).addClass( 'active' ).siblings('.active').removeClass('active');
					} );
				}
				if(me.maxPages > 1){
					tabindex++;
					next = $( '<li class="nextPage"><a tabindex="'+tabindex+'" title="Next results page" href="javascript:;">&raquo;</a></li>' ).appendTo( this.pagination );
					next.find('a').click( function() { if(!$(this).parent().hasClass('disabled')){me.nextPage();} } );
				}
			}

		// dynamically update tab index of close button
		tabindex++;
		this.element.find( '.close' ).attr( 'tabindex', tabindex );

	}

	ScalarIndex.prototype.previousPage = function() {
		if ( this.currentPage > 1) {
			this.currentPage--;
			this.pagination.find('li.active').removeClass('active').prev('li').addClass('active');
			this.getResults(function(){

			});
		}
	}

	ScalarIndex.prototype.nextPage = function() {
		this.currentPage++;
		this.pagination.find('li.active').removeClass('active').next('li').addClass('active');
		var self = this;
		this.getResults(function() { self.focusOnCurrentPage() });
	}

	ScalarIndex.prototype.goToPage = function( pageNum ) {
		this.currentPage = pageNum;
		var self = this;
		this.getResults(function() { self.focusOnCurrentPage() });
	}

	ScalarIndex.prototype.focusOnCurrentPage = function() {
		this.pagination.find('a[data-page="'+this.currentPage+'"]').focus();
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
