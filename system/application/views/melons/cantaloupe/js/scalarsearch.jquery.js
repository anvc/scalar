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
	ScalarSearch.prototype.searchField = null;

	ScalarSearch.prototype.currentPage = null;			// Current page of results being displayed
	ScalarSearch.prototype.pagination = null;			// Pagination interface
	ScalarSearch.prototype.resultsPerPage = null;		// Results to show per page
	ScalarSearch.prototype.maxPages = null;				// Maximum number of pages with known results
	ScalarSearch.prototype.tabIndex = 9000; // starting tabindex

	ScalarSearch.prototype.query = null; // query

	ScalarSearch.prototype.init = function () {

		var me = this;

		this.currentPage = 1;
		this.maxPages = 1;
		this.resultsPerPage = 10;

		this.element.addClass('search');
		this.bodyContent = $('<div class="body_copy"></div>').appendTo(this.element);

		$('<div><form><label for="modal_keyword">You searched for</label>&nbsp;<input tabindex="'+this.tabIndex+'" name="keyword" id="modal_keyword"  /></form></div>').appendTo(this.bodyContent);

		$( '<div class="results_list search_results caption_font"><table summary="Search Results" class="table table-striped table-hover table-responsive"></table></div>' ).appendTo( this.bodyContent );
		$( '<ul class="pagination caption_font"></ul>' ).appendTo( this.bodyContent );
		$('<div class="loading"><p>Loading...</p></div>').hide().insertAfter(this.resultsTable);

		this.modal = this.bodyContent.bootstrapModal({title: 'Search Results', size_class:'modal-lg'});
		this.resultsTable = this.modal.find('.results_list table');
		this.loading = this.modal.find('.loading');
		this.pagination = this.modal.find('ul.pagination');
		this.searchField = this.modal.find('input[name="keyword"]');
		this.searchForm = this.modal.find('form');

		this.searchForm.submit(function(event) {
			event.preventDefault();
			me.doSearch(me.searchField.val());
		})
	}

	ScalarSearch.prototype.showSearch = function() {
		this.modal.modal('show');
	}

	ScalarSearch.prototype.hideSearch = function() {
		this.element.hide();
	}

	ScalarSearch.prototype.doSearch = function(query, callback) {
		var firstTime = false;
		if ($.isFunction(query))  {
			callback = query;
		} else {
			newQuery = !this.query || query != this.query;
			if (newQuery) {
				this.reset()
			}
			this.query = query;
		}
		this.searchField.val(query);
		var me = this;
		this.showLoading();
		this.showSearch();
		scalarapi.model.removeNodes();
		scalarapi.nodeSearch(
			this.query,
			function( data ) {
				me.handleResults( data, callback );
				if (newQuery) {
					me.firstFocus();
				}
			},
			null, 0, false, null ,( me.currentPage - 1 ) * me.resultsPerPage, me.resultsPerPage
		);
	}

	ScalarSearch.prototype.reset = function() {
		this.currentPage = 0;
		this.pagination.empty();
	}

	ScalarSearch.prototype.showLoading = function() {
		var h = this.resultsTable.height();
		var $p = this.loading.find('p');
		this.loading.width(this.resultsTable.width()).height(h);
		$p.css('top', (((h-$p.height())/2)-5)+'px');
		this.loading.show();
	}

	ScalarSearch.prototype.handleResults = function( data, callback ) {

		var i, node, description, row, prev, next,
			me = this,
			nodes = scalarapi.model.getNodes();

		this.resultsTable.empty();
		var tabindex = this.tabIndex;
		for ( i in nodes ) {
			tabindex++;
			node = nodes[i];
			if (node.current != null) {
				description = node.current.description;
			}
			if (description == null) {
				description = '(No description)';
			} else {
				description = description.replace(/<\/?[^>]+>/gi, '');
			}
			var thumb = '';
			if (node.thumbnail) {
				thumb = '<img src="'+node.thumbnail+'" alt="Thumbnail for '+node.getDisplayTitle()+'" />';
			}
			row = $( '<tr><td class="title"><a title="View '+node.getDisplayTitle()+'" href="javascript:;" tabindex="'+tabindex+'">'+node.getDisplayTitle()+'</a></td><td class="desc">'+description+'</td><td class="thumb">'+thumb+'</td></tr>' ).appendTo( this.resultsTable );

			row.data( 'node', node );
			row.click( function() { document.location = addTemplateToURL($(this).data('node').url, 'cantaloupe'); } );
		}

		this.pagination.empty();
		if ( nodes.length == 0 ) {
			row = $( '<tr><td style="width:30%">No results found.</td><td></td></tr>' ).appendTo( this.resultsTable );

			this.modal.on('shown.bs.modal', function(e) {
				me.modal.find('button.close').focus();
			});
		} else {
			this.modal.on('shown.bs.modal', function(e) {
				me.firstFocus();
			});
		}
		// pagination
		if (( nodes.length == this.resultsPerPage ) || ( this.currentPage > 1 )) {
			if ( this.currentPage > 1 ) {
				tabindex++;
				prev = $('<li><a tabindex="'+tabindex+'" href="javascript:;">&laquo;</a></li>').appendTo( this.pagination );
				prev.find('a').click( function() { me.previousPage(); } );
			} else {
				prev = $('<li class="disabled"><a href="javascript:;">&laquo;</a></li>').appendTo( this.pagination );
			}
			for ( i = 1; i <= this.maxPages; i++ ) {
				tabindex++;
				var pageBtn = $( '<li><a data-page="'+i+'" tabindex="'+tabindex+'" href="javascript:;">' + i + '</a></li>' ).appendTo( this.pagination );
				pageBtn.data( 'page', i );
				if ( i == this.currentPage ) {
					pageBtn.addClass( 'active' );
				}
				pageBtn.click( function() {
					me.goToPage( $( this ).data( 'page' ) );
				} );
			}
			if ( nodes.length == this.resultsPerPage ) {
				tabindex++;
				next = $( '<li><a tabindex="'+tabindex+'" href="javascript:;">&raquo;</a></li>' ).appendTo( this.pagination );
				next.find('a').click( function() { me.nextPage(); } );
			} else {
				next = $( '<li class="disabled"><a href="javascript:;">&raquo;</a></li>' ).appendTo( this.pagination );
			}
		}

		if (callback) callback();
	}

	ScalarSearch.prototype.firstFocus = function() {
		this.searchField.focus();
	}


	ScalarSearch.prototype.previousPage = function() {
		if ( this.currentPage > 1) {
			this.currentPage--;
			this.doSearch();
		}
	}

	ScalarSearch.prototype.nextPage = function() {
		this.currentPage++;
		this.maxPages = Math.max( this.maxPages, this.currentPage );
		var self = this;
		this.doSearch(function() { self.focusOnCurrentPage() });
	}

	ScalarSearch.prototype.goToPage = function( pageNum ) {
		this.currentPage = pageNum;
		var self = this;
		this.doSearch(function() { self.focusOnCurrentPage() });
	}

	ScalarSearch.prototype.focusOnCurrentPage = function() {
		this.pagination.find('a[data-page="'+this.currentPage+'"]').focus();
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