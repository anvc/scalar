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

		var handleFormUpdated = function() {
			this.removeFocusTrap()
			this.setupFocusTrap()
		}

		this.modal = this.bodyContent.bootstrapModal({title: 'Search', size_class:'modal-lg'});
		if (typeof CustomSearchManager === 'function') {
			this.searchManager = new CustomSearchManager(this.modal, handleFormUpdated.bind(this))
		} else {
			this.searchManager = new SearchManager(this.modal, handleFormUpdated.bind(this))
		}

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
		setTimeout(() => {
			this.searchManager.getInitialFocusable().focus()
			this.setupFocusTrap()
		}, 500)
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
		setTimeout(() => {
			this.searchManager.doSearch(query)
		}, 500)
	}

	ScalarSearch.prototype.setupFocusTrap = function() {

		this.closeBtn = this.modal.find( '.close' )
		this.firstFocusable = this.searchManager.getFirstFocusable()
		this.lastFocusable = this.searchManager.getLastFocusable()

		var me = this

		// tab from close btn to first/last focusable
		this.closeBtn.on('keydown.focusTrap', function(e) {
			var keyCode = e.keyCode || e.which;
			if (keyCode == 9) {
				if (!e.shiftKey) {
					e.preventDefault();
					me.firstFocusable.focus();
				} else {
					e.preventDefault();
					me.lastFocusable.focus()
				}
			}
		});

		// tab back from first focusable to close btn
		this.firstFocusable.on('keydown.focusTrap', function(e) {
			var keyCode = e.keyCode || e.which;
			if(keyCode == 9) {
				if (e.shiftKey) {
					e.preventDefault();
					me.closeBtn.focus();
				}
			}
		});

		// tap forward from last focusable to close btn
		this.lastFocusable.on('keydown.focusTrap', function(e) {
			var keyCode = e.keyCode || e.which;
			if(keyCode == 9) {
				if (!e.shiftKey) {
					e.preventDefault();
					me.closeBtn.focus();
				}
			}
		});
	}

	ScalarSearch.prototype.removeFocusTrap = function() {
		if (this.closeBtn) this.closeBtn.off('keydown.focusTrap')
		if (this.firstFocusable) this.firstFocusable.off('keydown.focusTrap')
		if (this.lastFocusable) this.lastFocusable.off('keydown.focusTrap')
	}

	ScalarSearch.prototype.getOntologyData = function() {
		let me = this;
		let newURL = $('link#approot').attr('href').replace('application', 'main/ontologies');
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
	constructor(modal, onFormUpdated) {
		this.modal = modal
		this.onFormUpdated = onFormUpdated
		this.bodyContent = this.modal.find('.modal-body')
		this.setup()
	}

	setup() {
		$('<form id="modal_search" role="form" class="form-horizontal">'+
			'<div class="form-group condensed">'+
				'<label for="modal_search_term" class="col-sm-2 text-right">Search for</label>'+
				'<div class="col-sm-6">'+
					'<input id="modal_search_term" name="search_term" type="text" autocomplete="off" class="form-control" placeholder="Enter search terms">'+
				'</div>'+
			'</div>'+
			'<div class="form-group condensed">'+
				'<label for="modal_scope" class="col-sm-2 text-right">in</label>'+
				'<div class="col-sm-4">'+
					'<select id="modal_scope" class="form-control">'+
						'<option value="titles" selected="selected">titles only</option>'+
						'<option value="content">content only</option>'+
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
					'<button type="submit" class="btn btn-default">Search</button> &nbsp; '+
				'</div>'+
			'</div>'+
			'<div class="error-msg hidden form-group condensed caption_font">'+
				'<label class="col-sm-2"></label>'+
				'<small class="text-danger col-sm-6">* Please correct the errors in the highlighted items above.</small>'+
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

		// wait a frame so init has a chance to happen
		setTimeout(this.updateForm.bind(this), 1);

		$('#modal_scope').on('change', (event) => {
			this.updateForm();
		})
	}

	setSearchField(query) {
		this.searchField.val(query);
	}

	getInitialFocusable() {
		return this.searchField
	}

	getFirstFocusable() {
		return this.modal.find('#modal_search_term')
	}

	getLastFocusable() {
		var visFooterBtns = this.modal.find('.vis_footer button')
		if (visFooterBtns.length > 0) {
			return visFooterBtns.last()
		} else {
			return this.modal.find('button[type="submit"]')
		}
	}

	updateForm() {
		if ($('#modal_scope').val() != 'metadata') {
			$('.search_metadata_option').hide()
		} else {
			$('.search_metadata_option').show()
		}
		if (this.onFormUpdated) this.onFormUpdated()
	}

	getOntologyMenu() {
		return this.ontologyMenu;
	}

	getOntologyPropertyMenu() {
		return this.ontologyPropertyMenu;
	}

	getLensForQuery(query) {
		let lens = {}
		let errors = []
		if (query == '') {
			errors.push('missingQuery')
		}
		switch ($('#modal_scope').val()) {

			case 'content':
				lens = {
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
				break

			case 'titles':
				lens = {
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
				break

			case 'titles_content':
				lens = {
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
				break

			case 'metadata':
				if (this.ontologyMenu.val() == 'none') {
					errors.push('missingMetadataOntology')
				}
				if (this.ontologyPropertyMenu.val() == 'none') {
					errors.push('missingMetadataProperty')
				}
				lens = {
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
				break
		}
		if (errors.length > 0) {
			return {
				error: errors
			}
		} else {
			return lens
		}
	}

	removeAllErrors() {
		$('#modal_search').find('div').removeClass('has-error')
		$('#modal_search').find('.error-msg').addClass('hidden')
	}

	handleErrors(errors) {
		$('#modal_search').find('.error-msg').removeClass('hidden')
		for (let i=0; i<errors.length; i++) {
			switch (errors[i]) {
				case 'missingQuery':
					$('#modal_search_term').parent().addClass('has-error')
					break
				case 'missingMetadataOntology':
					$('#modal_ontology').parent().addClass('has-error')
					break
				case 'missingMetadataProperty':
					$('#modal_metadata_field').parent().addClass('has-error')
					break
			}
		}
	}

	doSearch(query) {
		this.removeAllErrors()
		const lens = this.getLensForQuery(query)
		if (lens.error) {
			this.handleErrors(lens.error)
		} else {
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
			if (this.onFormUpdated) this.onFormUpdated()
		}
	}
}
