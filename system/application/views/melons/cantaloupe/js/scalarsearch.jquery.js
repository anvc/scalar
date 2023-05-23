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

	ScalarSearch.prototype.bodyContent = null;
	ScalarSearch.prototype.resultsTable = null;
	ScalarSearch.prototype.modal = null;
	ScalarSearch.prototype.searchField = null;
	ScalarSearch.prototype.currentPage = null;
	ScalarSearch.prototype.pagination = null;
	ScalarSearch.prototype.resultsPerPage = null;
	ScalarSearch.prototype.maxPages = null;
	ScalarSearch.prototype.query = null;

	ScalarSearch.prototype.init = function () {
		this.element.addClass('search');
		this.bodyContent = $('<div class="body_copy"></div>').appendTo(this.element);

		this.modal = this.bodyContent.bootstrapModal({title: 'Search', size_class:'modal-lg'});
		if (typeof CustomSearchManager === 'function') {
			this.searchManager = new CustomSearchManager(this.modal)
		} else {
			this.searchManager = new SearchManager(this.modal)
		}

		// tabbing forward from close button brings focus to search field
		this.modal.find( '.close' ).on('keydown', (e) => {
			var keyCode = e.keyCode || e.which;
			if (keyCode == 9) {
				if (!e.shiftKey) {
					e.preventDefault();
					this.searchManager.firstFocus();
				}
			}
		});
	}

	ScalarSearch.prototype.showSearch = function() {
		this.modal.modal('show');
	}

	ScalarSearch.prototype.hideSearch = function() {
		this.element.hide();
	}

	ScalarSearch.prototype.doSearch = function(query, callback) {
		if ($.isFunction(query))  {
			callback = query;
		}
		this.searchManager.setSearchField(query)
		this.showSearch()
		setTimeout(() => { this.searchManager.doSearch(query) }, 500)
	}

	$.fn[pluginName] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data( this, "plugin_" + pluginName,
				new ScalarSearch(this, options));
			}
		});
	}

})( jQuery, window, document );

class SearchManager {
	constructor(modal) {
		this.modal = modal
		this.bodyContent = this.modal.find('.modal-body')
		this.setup()
	}
	
	setup() {
		$('<form role="form" class="form-horizontal">'+
			'<div class="form-group">'+
				'<label for="modal_search_term" class="col-sm-2 text-right">Search for</label>'+
				'<div class="col-sm-6">'+
					'<input id="modal_search_term" name="search_term" type="text" autocomplete="off" class="form-control" tabindex="9000" placeholder="Enter search terms">'+
				'</div>'+
			'</div>'+
			'<div class="form-group">'+
				'<label for="modal_scope" class="col-sm-2 text-right">in</label>'+
				'<div class="col-sm-4">'+
					'<select id="modal_scope" class="form-control">'+
					'<option selected="selected">content only</option>'+
						'<option>titles only</option>'+
						'<option>titles and descriptions</option>'+
						'<option>a metadata field</option>'+
					'</select>'+
					'<small class="caption_font">Want more search options? Try <a href="https://scalar.usc.edu/works/guide2/lenses" target="_blank">Lenses</a></small>'+
				'</div>'+
				'<div class="col-sm-2">'+
					'<button tabindex="9001" type="submit" class="btn btn-default">Search</button> &nbsp; '+
				'</div>'+
			'</div>'+
		'</form><br>').appendTo(this.bodyContent)
		
		this.resultsTable = $('<div class="modalVisualization"></div>').appendTo(this.bodyContent);
		this.searchField = this.modal.find('input[name="search_term"]');
		this.searchForm = this.modal.find('form');
		this.searchForm.on('submit', (event) => {
			event.preventDefault();
			this.doSearch(this.searchField.val());
		});

		$('#modal_scope').on('change', (event) => {
			this.updateForm();
		})

		// upate main search field
		this.searchField.on('keyup', (event) => {
			$('#search').val($(this).val());
		})

		// tabbing backwards from search field link brings focus to close button
		this.searchField.on('keydown', (e) => {
			var keyCode = e.keyCode || e.which;
			if(keyCode == 9) {
				if(e.shiftKey) {
					e.preventDefault();
					me.modal.find( '.close' )[ 0 ].trigger('focus');
				}
			}
		});
	}

	setSearchField(query) {
		this.searchField.val(query);
	}

	firstFocus() {
		this.searchField.trigger('focus');
	}

	updateForm() {
		console.log('update form')
	}
	
	doSearch(query) {
		let lens = {
			"visualization": {
				"type": "list",
				"options": {
					"operation": "or"
				}
			},
			"components": [
				{
					"content-selector": {
						"type": "items-by-type",
						"content-type": "all-content"
					},
					"modifiers": [
						{
							"type": "filter",
							"subtype": "content",
							"operator": "inclusive",
							"content": query,
							"metadata-field": "sioc:content"
						}
					]
				},
			],
			"sorts": [],
		}
		const visOptions = {
			modal: false,
			widget: true,
			content: 'lens',
			lens: lens
		}
		this.resultsTable.scalarvis(visOptions);
	}
}