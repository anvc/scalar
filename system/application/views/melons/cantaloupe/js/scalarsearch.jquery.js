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
		this.ontologyOptions = {
			"dcterms":"Dublin Core (dcterms)",
			"art":"Artstor (art)",
			"iptc":"IPTC",
			"bibo":"BIBO",
			"id3":"ID3",
			"dwc":"Darwin Core (dwc)",
			"vra":"VRA Ontology (vra)",
			"cp":"Common Place (cp)",
			"gpano": "gpano",
			"scalar": "Scalar",
			"sioc": "SIOC",
			"rdf": "RDF"
		};
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

		this.ontologyMenu = this.searchManager.getOntologyMenu();
		if (this.ontologyMenu) {
			this.ontologyMenu.on('change', (event) => {
				this.updateOntologyPropertyMenu();
			})
		}

		this.getOntologyData();
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

	ScalarSearch.prototype.getOntologyData = function() {
		let me = this;
		let newURL = $('link#approot').attr('href').replace('application', 'ontologies');
		$.ajax({
			url: newURL,
			type: "GET",
			dataType: 'json',
			contentType: 'application/json',
			async: true,
			context: this,
			success: this.handleOntologyData,
			error: function error(response) {
				 console.log('There was an error attempting to communicate with the server.');
				 console.log(response);
			}
		})
	};

	ScalarSearch.prototype.handleOntologyData = function(response) {
		this.ontologyData = response;
		this.ontologyData.dcterms.unshift('description');
		this.ontologyData.dcterms.unshift('title');
		this.ontologyData.sioc = ['content'];
		this.ontologyData.rdf = ['type'];
		this.ontologyData.scalar = ['urn','url','default_view','continue_to_content_id','sort_number'];
		this.populateOntologyMenu(this.createOntologyList());
	}

	ScalarSearch.prototype.createOntologyList = function(){
		const ontologyArray = [];
		for (let [key, value] of Object.entries(this.ontologyData)) {
			ontologyArray.push({
				label: this.ontologyOptions[key],
				value: key
			});
		}
		return ontologyArray;
	};

	ScalarSearch.prototype.updateOntologyPropertyMenu = function() {
		const ontologyName = this.ontologyMenu.val();
		const propertyArray = this.createPropertyList(ontologyName);
		this.populateOntologyPropertyMenu(propertyArray);
	}

	ScalarSearch.prototype.populateOntologyMenu = function(ontologyArray) {
		const ontologyMenu = this.searchManager.getOntologyMenu();
		ontologyArray.forEach(element => {
			ontologyMenu.append($('<option>', {
				value: element.value,
				text: element.label
			}));
		});
	}

	ScalarSearch.prototype.createPropertyList = function(ontologyName){
		const propertyArray = [];
		if(!ontologyName || ontologyName === 'none') {
			propertyArray.push({
				label: 'Select field',
				value: null
			});
		} else {
			this.ontologyData[ontologyName].forEach(element =>  {
				propertyArray.push({
					label: element,
					value: element
				});
			});
		}
		return propertyArray;
	};

	ScalarSearch.prototype.populateOntologyPropertyMenu = function(propertyArray) {
		const ontologyPropertyMenu = this.searchManager.getOntologyPropertyMenu();
		ontologyPropertyMenu.empty();
		propertyArray.forEach(element => {
			ontologyPropertyMenu.append($('<option>', {
				value: element.value,
				text: element.label
			}));
		});
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
		$('<form id="modal_search" role="form" class="form-horizontal">'+
			'<div class="form-group condensed">'+
				'<label for="modal_search_term" class="col-sm-2 text-right">Search for</label>'+
				'<div class="col-sm-6">'+
					'<input id="modal_search_term" name="search_term" type="text" autocomplete="off" class="form-control" tabindex="9000" placeholder="Enter search terms">'+
				'</div>'+
			'</div>'+
			'<div class="form-group condensed">'+
				'<label for="modal_scope" class="col-sm-2 text-right">in</label>'+
				'<div class="col-sm-4">'+
					'<select id="modal_scope" class="form-control">'+
						'<option value="content" selected="selected">content only</option>'+
						'<option value="titles">titles only</option>'+
						'<option value="titles_content">titles and content</option>'+
						'<option value="metadata">a metadata field</option>'+
					'</select>'+
					'<small class="caption_font">Want more search options? Try <a href="https://scalar.usc.edu/works/guide2/lenses" target="_blank">Lenses</a></small>'+
				'</div>'+
				'<div class="col-sm-2 search_metadata_option">'+
					'<select id="modal_ontology" class="form-control" aria-label="Select ontology">'+
						'<option value="none" selected="selected">Select ontology</option>'+
					'</select>'+
				'</div>'+
				'<div class="col-sm-2 search_metadata_option">'+
					'<select id="modal_metadata_field" class="form-control" aria-label="Select ontology">'+
						'<option value="none" selected="selected">Select field</option>'+
					'</select>'+
				'</div>'+
				'<div class="col-sm-1">'+
					'<button tabindex="9001" type="submit" class="btn btn-default">Search</button> &nbsp; '+
				'</div>'+
			'</div>'+
		'</form><br>').appendTo(this.bodyContent)
		
		this.resultsTable = $('<div class="modalVisualization"></div>').appendTo(this.bodyContent);
		this.searchField = this.modal.find('input[name="search_term"]');
		this.ontologyMenu = this.modal.find('#modal_ontology');
		this.ontologyPropertyMenu = this.modal.find('#modal_metadata_field');
		this.searchForm = this.modal.find('form');
		this.searchForm.on('submit', (event) => {
			event.preventDefault();
			this.doSearch(this.searchField.val());
		});

		this.updateForm();
		$('#modal_scope').on('change', (event) => {
			this.updateForm();
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
		if ($('#modal_scope').val() != 'metadata') {
			$('.search_metadata_option').hide()
		} else {
			$('.search_metadata_option').show()
		}
	}

	getOntologyMenu() {
		return this.ontologyMenu;
	}

	getOntologyPropertyMenu() {
		return this.ontologyPropertyMenu;
	}

	getLensForQuery(query) {
		switch ($('#modal_scope').val()) {

			case 'content':
				return {
					"visualization": {
						"type": "list",
						"options": []
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

			case 'titles':
				return {
					"visualization": {
						"type": "list",
						"options": []
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
									"subtype": "metadata",
									"operator": "inclusive",
									"content": query,
									"metadata-field": "dcterms:title"
								}
							]
						}
					],
					"sorts": [],
				}

			case 'titles_content':
				return {
					"visualization": {
						"type": "list",
						"options": {
							"operation": "or"
						}
					},
					"components": [{
						"content-selector": {
							"type": "items-by-type",
							"content-type": "all-content"
						},
						"modifiers": [{
							"type": "filter",
							"subtype": "metadata",
							"operator": "inclusive",
							"content": query,
							"metadata-field": "dcterms:title"
						}]
					}, {
						"content-selector": {
							"type": "items-by-type",
							"content-type": "all-content"
						},
						"modifiers": [{
							"type": "filter",
							"subtype": "metadata",
							"operator": "inclusive",
							"content": query,
							"metadata-field": "sioc:content"
						}]
					}],
					"sorts": [],
				}
				
			case 'metadata':
				return {
					"visualization": {
						"type": "list",
						"options": []
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
									"subtype": "metadata",
									"operator": "inclusive",
									"content": query,
									"metadata-field": `${this.ontologyMenu.val()}:${this.ontologyPropertyMenu.val()}`
								}
							]
						}
					],
					"sorts": [],
				}
		}
		return {}
	}
	
	doSearch(query) {
		const visOptions = {
			modal: false,
			widget: true,
			content: 'lens',
			lens: this.getLensForQuery(query)
		}
		if (!this.scalarvis) {
			this.resultsTable.scalarvis(visOptions);
			this.scalarvis = this.resultsTable.data('scalarvis')
		} else {
			this.scalarvis.setOptions(visOptions)
		}
	}
}