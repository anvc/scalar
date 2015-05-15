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

/**
 * @projectDescription		The ScalarNav jQuery plug-in provides a compact navigation interface for Scalar projects.
 *							Scalar is a project of The Alliance for Networking Visual Culture (http://scalar.usc.edu).
 * @author					Erik Loyer
 * @version					1.0
 */
  
(function ($) {

	/**
	 * Plug-in setup.
	 *
	 * @param {Object} options	An object containing relevant data for the plug-in.
	 * @return					New instance of the plug-in.
	 */
	$.fn.scalarnav = function(options) {

		return this.each(function() {

			// check to see if we've been passed a link to a Scalar media file
			var element = $(this);

				// don't create a new instance of the plug-in class if one already exists on this element
	    		if (element.data('scalarnav')) return;

				var scalarnav = new ScalarNav(element, options);

				// store the class in the data of the element itself
				element.data('scalarnav', scalarnav);

		});
	};

	/**
	 * The base class for the plug-in.
	 * @constructor
     *
     * @param	{Object} element	The element in which the nav is to be rendered.
	 * @param 	{Object} options	An object containing relevant data for the plug-in.
	 */
	var ScalarNav = function(element, options) {
		
		var me = this;
		
		this.model = new $.NavModel(element, options);
		this.view = new $.NavView(this.model);
		this.controller = new $.NavController(this.model, this.view);

		// Basic initialization.
		this.setup = function() {
			this.view.setup(this.controller);
			this.controller.setup();
		}
		
		this.setup();

	}

	/**
	 * Model for the ScalarNav plug-in. Contains general plug-in info, flags relating to
	 * data that has or hasn't been loaded, info about available interface modes.
	 * @constructor
	 *
     * @param	{Object} element	The element in which the nav is to be rendered.
	 * @param	{Object} options	An object containing relevant data for the plug-in.
	 */
	jQuery.NavModel = function(element, options) {
	
		this.element = element;						// element in which the nav will be displayed
		this.options = options;						// data passed into the plug-in
		this.currentPageDataLoaded = false;			// has current page data been loaded?
		this.indexDataLoaded = false;				// has index data been loaded?
		this.mainMenuDataLoaded = false;			// has main menu data been loaded?
		this.modes = null;							// data about the possible modes in which the nav can appear
		
		/**
		 * Initializes the model.
		 */
		jQuery.NavModel.prototype.init = function() {

			switch (scalarapi.model.user_level) {
			
				// these roles get an added "import" option in the menu
				case "scalar:Author":
				this.modes = [
					{id:'mainMenu', name:"Main menu"}, 
					{id:'current', name:"Current page"}, 
					{id:"about", name:"About"}, 
					{id:"explore", name:"Explore"}, 
					{id:"import", name:"Import"}, 
					{id:"index", name:"Index"}
				];
				break;
				
				// standard options for the menu
				default:
				this.modes = [
					{id:'mainMenu', name:"Main menu"}, 
					{id:'current', name:"Current page"}, 
					{id:"about", name:"About"}, 
					{id:"explore", name:"Explore"}, 
					{id:"index", name:"Index"}
				];
				break;
			
			}
			
			this.currentMode = this.modes[0];
			
			// attempt to retrive last used mode from cookie
			var lastModeViewId = $.cookie("stripeModeView");
			if (lastModeViewId) {
				var i;
				var n = this.modes.length;
				var modeData;
				for (i=0; i<n; i++) {
					modeData = this.modes[i];
					if (modeData.id == lastModeViewId) {
						this.currentMode = modeData;
						break;
					}
				}
			}
			
		}

		/**
		 * Returns the index of the mode data with the given id.
		 *
		 * @param {String} id		The id to match.
		 * @return					The index of the matching mode data.
		 */
		jQuery.NavModel.prototype.getModeIndexForId = function(id) {
		
			var index = -1;
			
			var i;
			var n = this.modes.length;
			for (i=0; i<n; i++) {
				if (this.modes[i].id == id) {
					index = i;
					break;
				}
			}
			
			return index;
		}
						
		this.init();
		
	}
	
	/**
	 * Controller for the ScalarNav plug-in. Manages loading of data, plus a few utility
	 * functions.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} controller	Instance of the primary view.
	 */
	jQuery.NavController = function(model, view) {

		var me = this;

		this.model = model;															// instance of the model
		this.view = view;															// instance of the view
		this.loadSequence = ["path", 												// array of ids corresponding with data being loaded
			"page", 
			"media",
			"tag",
			"annotation", 
			"commentary",
			"review",
			"reply"
		];																			
		this.loadIndex = -1;														// index of currently loading data
		
		/**
		 * Sets up the controller.
		 */
		jQuery.NavController.prototype.setup = function() {
			this.view.showModeView(this.model.currentMode);
		}
		
		/**
		 * Loads the home page for the current book.
		 */
		jQuery.NavController.prototype.goHome = function() {
			window.location = scalarapi.model.urlPrefix;
		}
		
		/**
		 * Loads next data set for the index mode.
		 */
		jQuery.NavController.prototype.loadNextIndexData = function() {
		
			this.loadIndex++;
			
			// if we still have more data to load, then load it
			if (this.loadIndex < this.loadSequence.length) {
				scalarapi.loadPagesByType(this.loadSequence[this.loadIndex], true, me.parseIndexData, null, 1, true);
			}
			
		}
		
		/**
		 * Parses data for the next batch of index content.
		 */
		jQuery.NavController.prototype.parseIndexData = function(json) {
			
			if (me.loadIndex >= (me.loadSequence.length - 1)) {
				me.model.indexDataLoaded = true;
			}
		
			me.view.updateModeView();
			me.loadNextIndexData();
			
		}
						
	}


	/**
	 * View for the ScalarNav plug-in. Manages the navigation interface and its various modes
	 * and functions.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 */
	jQuery.NavView = function(model) {

		var me = this;

		this.model = model;										// instance of the model
		this.modeViews = {};									// array of root elements for each mode view	
		this.maxLettersPerAbbr = 6;								// maximum number of letters per abbreviation
		this.pageViewTypes = [									// page view types
			{id:'plain', name:'Single column'},
			{id:'text', name:'Text emphasis'},
			{id:'media', name:'Media emphasis'},
			{id:'split', name:'Split emphasis'},
			{id:'par', name:'Media per paragraph (above)'},
			{id:'revpar', name:'Media per paragraph (below)'},
			{id:'vis', name:'Visualization: Radial'},
			{id:'visindex', name:'Visualization: Index'},
			{id:'vispath', name:'Visualization: Paths'},
			{id:'vismedia', name:'Visualization: Media'},
			{id:'vistag', name:'Visualization: Tags'},
			{id:'versions', name:'History editor'},
			{id:'history', name:'History browser'},
			{id:'meta', name:'Metadata'},
			{id:'rdf', name:'RDF'}
		];
		this.fileViewTypes = [									// file (media) view types
			{id:'file', name:'File'},
			{id:'vis', name:'Visualization: Radial'},
			{id:'visindex', name:'Visualization: Index'},
			{id:'vispath', name:'Visualization: Paths'},
			{id:'vismedia', name:'Visualization: Media'},
			{id:'vistag', name:'Visualization: Tags'},
			{id:'versions', name:'History editor'},
			{id:'meta', name:'Metadata'},
			{id:'rdf', name:'RDF'},
			{id:'manage_annotations', name:'Annotation editor'}
		];
		
		/**
		 * Sets up the view.
		 *
		 * @param {Object} controller		The plug-in controller.
		 */
		jQuery.NavView.prototype.setup = function(controller) {
			
			this.controller = controller;
			
			// home link
			this.home_link = $('<div class="icon_link home"></div>').appendTo(this.model.element);
			this.home_link.click(this.controller.goHome);
			
			// body content
			this.body = $('<div class="body"></div>').appendTo(this.model.element);
			
			// position the nav to align vertically with the main body content
			$('#scalarnav').css('margin-top', $('#content_wrapper').offset().top - 1);
			
			// create mode view menu
			this.modeMenu = $('<div class="pulldown"><p><span class="menu modeMenu"><a href="javascript:;" class="view_link">'+this.model.currentMode.name+'</a></span></p><ul class="pulldown-content nodots narrow-pulldown pulldown-content-nudge-left"></ul></div>').appendTo(this.body);
			this.populateModeMenu();
			this.modeViewElement = $('<div id="modeView"></div>').appendTo(this.body);
			
			// create search field
			var parent = $('link#parent').attr('href');
			var search_uri = parent+'search';
			this.searchElement = $('<form method="get" action="'+search_uri+'"><input value="Search" onFocus="if (this.value == \'Search\') this.value = \'\'" onBlur="if (this.value == \'\') this.value = \'Search\'" type="text" name="sq"/></form>').appendTo(this.model.element);
			
			// create view/recent menus
			this.utilityElement = $('<div class="utility"><span class="pulldown viewMenu"><a class="menu" href="javascript:;">View</a><ul class="pulldown-content nodots narrow-pulldown pulldown-content-nudge-right"></ul></span> <span class="pulldown recentMenu"><a class="menu" href="javascript:;">Recent</a><ul class="pulldown-content nodots narrow-pulldown pulldown-content-nudge-right"></ul></span></div>').appendTo(this.model.element);
			if ($.isFunction($.fn.scalarrecent)) {
				$(this.utilityElement.find('span:nth-child(2)')).mouseover(function(){ 
					$(this).find('.pulldown-content').scalarrecent();
					$(this).find('.pulldown-content').show();  // Needed because .scalarpulldown()'s mouseover might be overwritten here
					$(this).css('zIndex', 10);                 // Needed because .scalarpulldown()'s mouseover might be overwritten here
				});
			}
			this.populateViewMenu();
			
		}
		
		/**
		 * Creates the contents of the mode menu.
		 */
		jQuery.NavView.prototype.populateModeMenu = function() {
		
			this.modeMenu.find('ul').empty();
			
			// add mode view items to menu
			var i;
			var n = this.model.modes.length;
			var menuItem;
			for (i=0; i<n; i++) {
			
				menuItem = $('<li>'+this.model.modes[i].name+'</li>').appendTo(this.modeMenu.find('ul'));
				menuItem.data('mode', this.model.modes[i]);
				menuItem.data('view', this);
				
				// handle clicks/touches on the menu item
				var clickFunc = function(event) { 
					event.stopPropagation();
					$(this).data('view').showModeView($(this).data('mode')); 
					$(this).data('view').hideMenu();
				};
				var clickFuncTouch = function(event) { 
					event.stopPropagation();
					$(this).data('view').showModeView($(this).data('mode')); 
					setTimeout($(this).data('view').hideMenu, 500); 
				};
				menuItem.click(clickFunc);
				menuItem.bind('touchend', clickFuncTouch);
			}
			
		}
		
		/**
		 * Creates the contents of the view menu.
		 */
		jQuery.NavView.prototype.populateViewMenu = function() {
		
			this.utilityElement.find('.viewMenu').find('ul').empty();
			
			var i;
			var n;
			var menuItem;
			var sourceList;
			var uri;
			var urlVars = get_str(document.location.href);
			var ext;
			
			// get the name of the current view type
			if (urlVars.length > 0) {
				ext = scalarapi.getFileExtension(document.location.href.substr(0, document.location.href.length - (urlVars.length + 1)));
			} else {
				ext = scalarapi.getFileExtension(document.location.href);
			}
			
			// figure out whether to show the view list for pages, or media (default is pages)
			if (this.model.currentPageNode == null) {
				sourceList = this.pageViewTypes;
			} else if (this.model.currentPageNode.shortType != 'media') {
				sourceList = this.pageViewTypes;
			} else {
				sourceList = this.fileViewTypes;
			}
			
			n = sourceList.length;
			for (i=0; i<n; i++) {
			
				// construct the uri for the view
				if (urlVars == '') {
					uri = scalarapi.stripAllExtensions(document.location.href) +'.'+ sourceList[i].id;
				} else {
					uri = scalarapi.stripAllExtensions(document.location.href) +'.'+ sourceList[i].id +'?'+ get_str(document.location.href);
				}
				
				menuItem = $('<li><a href="javascript:;">'+sourceList[i].name+'</a></li>').appendTo(this.utilityElement.find('.viewMenu').find('ul'));
				
				// highlight the default and currently selected views for the current content
				if (this.model.currentPageNode) {
					if (sourceList[i].id == this.model.currentPageNode.shortDefaultView) {
						menuItem.find('a').text(sourceList[i].name+'*');
					}
					if (ext == '') {
						if (sourceList[i].id == this.model.currentPageNode.shortDefaultView) {
							menuItem.addClass('current_view');
						}
					} else if (ext == sourceList[i].id) {
						menuItem.addClass('current_view');
					}
				}
				
				// click/touch handling
				menuItem.data('uri', uri);
				var clickFunc = function(event) {
					document.location.href = $(this).data('uri');
				};
				menuItem.click(clickFunc);
				menuItem.bind('touchend', clickFunc);
			}
	
		}
				
		/**
		 * Shows the view for the specified mode.
		 *
		 * @param {Object} modeData		Data for the mode view to be shown.
		 */
		jQuery.NavView.prototype.showModeView = function(modeData) {
		
			this.model.currentMode = modeData;
			this.modeViewElement.empty();
			
			// pre-emptively load data for the Scalar book as a whole and the current content
			if (scalarapi.loadBook(false, this.updateModeView) == 'loaded') this.updateModeView();
			if (scalarapi.loadCurrentPage(false, this.handleCurrentPage, null, 1, true) == 'loaded') this.handleCurrentPage();
			
			if (this.modeViews[modeData.id] == null) {
				
				// load the appropriate view
				switch (modeData.id) {
				
					case "mainMenu":
					this.currentModeView = new $.MainMenuModeView(this.model, this);
					break;
				
					case "current":
					this.currentModeView = new $.CurrentPageModeView(this.model, this);
					break;
					
					case "about":
					this.currentModeView = new $.AboutModeView(this.model, this);
					break;
					
					case "explore":
					this.currentModeView = new $.ExploreModeView(this.model, this);
					break;
					
					case "import":
					this.currentModeView = new $.ImportModeView(this.model, this);
					break;
					
					case "index":
					this.currentModeView = new $.IndexModeView(this.model, this);
					//if (!this.indexDataLoaded) this.controller.loadNextIndexData(); // start loading data for all content in the Scalar book
					break;
				
				}
				
				this.modeViews[modeData.id] = this.currentModeView;
				
			} else {
				this.currentModeView = this.modeViews[modeData.id];
			}
			
			// store the id of the selected mode
			$.cookie("stripeModeView", modeData.id, {path:"/"});
			
			this.modeMenu.find('.view_link').html(this.model.currentMode.name);
			this.updateModeView();
			
		}
		
		/**
		 * Hides the menu.
		 */
		jQuery.NavView.prototype.hideMenu = function() {
			me.modeMenu.find('.pulldown-content').hide();
			me.modeMenu.css('zIndex', 1);
		}
		
		/**
		 * Handles arrival of data about the current page.
		 */
		jQuery.NavView.prototype.handleCurrentPage = function() {
		
			// hide the view menu if we're not looking at the user's book content (i.e. if we're on a search or import page)
			if (!scalarapi.model.currentPageNode) {
				$('.viewMenu').hide();
			}
			
			me.updateModeView();
			
		}		
		
		/**
		 * Updates the current mode view.
		 */
		jQuery.NavView.prototype.updateModeView = function() {
		
			// if data about the Scalar has been loaded, display its title
			if (scalarapi.model.getBookNode() != null) {
				me.home_link.html(scalarapi.model.getBookNode().getDisplayTitle());
			}
			
			// update and display the current mode view
			if (me.currentModeView) {
				me.currentModeView.update();
				me.modeViewElement.html(me.currentModeView.element);
			}
			
			// fire an event that the view has been updated
			$('body').trigger('scalarnav_modeview_updated');
			
		}
	
		/**
		 * Returns the index-style abbreviation name for an array of Scalar nodes, i.e. 'A-Br'
		 *
		 * @param itemSets {Array}			An array of arrays--chunked collections of Scalar nodes.
		 * @param itemSetIndex {Number}		Index of the item set for which the abbreviation is to be returned.
		 * @return 							A string containing the abbreviated name.
		 */
		jQuery.NavView.prototype.getAbbreviatedName = function(itemSets, itemSetIndex) {
	
			var itemSet = itemSets[itemSetIndex];
			var firstProxyName = itemSet.data[0].getSortTitle();
			var abbreviation;
	
			// if this is the first item in the set, it's first abbreviation is the first letter of the name of the first item
			if (itemSetIndex == 0) {
				itemSet.startAbbr = firstProxyName.charAt(0);
	
			// otherwise, it's the most minimally distinguishing string between it and its predecessor
			} else {
	 			itemSet.startAbbr = this.minimallyDistinctAbbreviation(firstProxyName, itemSets[itemSetIndex - 1].endAbbr);
			}
	
	   		var n = itemSet.data.length;
	
			// if there's more than one item in the set, then create a second abbreviation that is the most 
			// minimally distinguishing string between it and the first abbreviation, and combine the two
			if (n > 1) {
				itemSet.endAbbr = this.minimallyDistinctAbbreviation(itemSet.data[itemSet.data.length - 1].getSortTitle(), itemSet.startAbbr);
				
				// Note: this script assumes that the first letter of each name is capitalized
				
				// if this is an intra-letter set, then
				if (itemSet.startAbbr.charAt(0) == itemSet.endAbbr.charAt(0)) {
				
					// if this is the only set, then just use the start
					if (itemSets.length == 1) {
						abbreviation = itemSet.startAbbr;
						
					// if this is the last set, then
					} else if (itemSetIndex == (itemSets.length - 1)) {
					
						// if the previous set belongs to the same letter, then use the full abbreviation
						if (itemSet.startAbbr.charAt(0) == itemSets[itemSetIndex - 1].startAbbr.charAt(0)) {
							abbreviation = itemSet.startAbbr + ' - ' + itemSet.endAbbr;
							
						// otherwise, just use the start
						} else {
							abbreviation = itemSet.startAbbr;
						}
						
					// if this is the first set, then
					} else if (itemSetIndex == 0) {
							
						// if the next set belongs to a different letter, then just use the start
						if (itemSet.startAbbr.charAt(0) != itemSets[itemSetIndex + 1].data[0].getSortTitle().charAt(0)) {
							abbreviation = itemSet.startAbbr;
						
						} else {
							
							// if no distinction can be made between the first and last items, then
							if (itemSet.data[0].getSortTitle().substr(0, this.maxLettersPerAbbr).toUpperCase() == itemSet.data[itemSet.data.length - 1].getSortTitle().substr(0, this.maxLettersPerAbbr).toUpperCase()) {
							
								// if the first abbreviation is only one letter long, then make it two letters
								if (itemSet.startAbbr.length == 1) {
									abbreviation = firstProxyName.substr(0, 2);
									
								// otherwise, use it as is
								} else {
									abbreviation = itemSet.startAbbr;
								}
								
							// otherwise, use the full abbreviation
							} else {
								abbreviation = itemSet.startAbbr + ' - ' + itemSet.endAbbr;
							}
						}						
					
					} else {
						
						// if the previous set belongs to the same letter, then use the full abbreviation
						if (itemSet.startAbbr.charAt(0) == itemSets[itemSetIndex - 1].startAbbr.charAt(0)) {
							
							// if no distinction can be made between the first and last items, then
							if (itemSet.data[0].getSortTitle().substr(0, this.maxLettersPerAbbr).toUpperCase() == itemSet.data[itemSet.data.length - 1].getSortTitle().substr(0, this.maxLettersPerAbbr).toUpperCase()) {
							
								// if the first abbreviation is only one letter long, then make it two letters
								if (itemSet.startAbbr.length == 1) {
									abbreviation = firstProxyName.substr(0, 2);
									
								// otherwise, use it as is
								} else {
									abbreviation = itemSet.startAbbr;
								}
								
							// otherwise, use the full abbreviation
							} else {
								abbreviation = itemSet.startAbbr + ' - ' + itemSet.endAbbr;
							}
							
						// if the next set belongs to the same letter, then use the full abbreviation
						} else if (itemSet.startAbbr.charAt(0) == itemSets[itemSetIndex + 1].data[0].getSortTitle().charAt(0)) {
							
							// if no distinction can be made between the first and last items, then
							if (itemSet.data[0].getSortTitle().substr(0, this.maxLettersPerAbbr).toUpperCase() == itemSet.data[itemSet.data.length - 1].getSortTitle().substr(0, this.maxLettersPerAbbr).toUpperCase()) {
							
								// if the first abbreviation is only one letter long, then make it two letters
								if (itemSet.startAbbr.length == 1) {
									abbreviation = firstProxyName.substr(0, 2);
									
								// otherwise, use it as is
								} else {
									abbreviation = itemSet.startAbbr;
								}
								
							// otherwise, use the full abbreviation
							} else {
								abbreviation = itemSet.startAbbr + ' - ' + itemSet.endAbbr;
							}
						
						} else {
							
							// if no distinction can be made between the first and last items, then
							if (itemSet.data[0].getSortTitle().substr(0, this.maxLettersPerAbbr).toUpperCase() == itemSet.data[itemSet.data.length - 1].getSortTitle().substr(0, this.maxLettersPerAbbr).toUpperCase()) {
							
								// if the first abbreviation is only one letter long, then make it two letters
								if (itemSet.startAbbr.length == 1) {
									abbreviation = firstProxyName.substr(0, 2);
									
								// otherwise, use it as is
								} else {
									abbreviation = itemSet.startAbbr;
								}
								
							// otherwise, just use the start
							} else {
								abbreviation = itemSet.startAbbr;
							}
						}						
					}
				
				// if this set covers multiple letters, then use the full abbreviation
				} else {
					abbreviation = itemSet.startAbbr + ' - ' + itemSet.endAbbr;
				}
	
			// otherwise, the first abbreviation is the whole abbreviation
			} else {
				abbreviation = firstProxyName.charAt(0);
			}
	
			return abbreviation;
		}
	
		/**
		 * Returns a abbreviation of the source string containing as few characters as are necessary to
		 * distinguish it from the comparison string.
		 *
		 * @param {String} source			The source text to draw from.
		 * @param {String} comparison		The string to compare with.
		 * @return							The abbreviated string.
		 */
		jQuery.NavView.prototype.minimallyDistinctAbbreviation = function(source, comparison) {
			var proxyComparison = comparison;
			var charIndex = 0;
			var abbr = source.charAt(charIndex);
			while (((abbr.charAt(charIndex) == proxyComparison.charAt(charIndex)) || (abbr.charAt(charIndex) == " ")) && (charIndex < source.length) && (charIndex < this.maxLettersPerAbbr)) {
				charIndex++;
				abbr += source.charAt(charIndex);
	    	};
			return abbr;
		}

		
	}
	
	/**
	 * Main menu mode view. Shows content designated for the main menu in the Dashboard area.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parent		Instance of the view's parent.
	 */
	jQuery.MainMenuModeView = function(model, parent) {
	
		var me = this;

		this.model = model;										// instance of the model
		this.parent = parent;									// parent view
		this.buttons = {};										// storage for the view's buttons
		this.node = null;										// the main menu node
		
		/**
		 * Updates the contents of the view.
		 */
		jQuery.MainMenuModeView.prototype.update = function() {
		
			// has data for the main menu node just arrived?
			var newNode = (this.node != scalarapi.model.getMainMenuNode());
		
			// if so, then reset and get the data
			if (newNode) {
				this.buttons = {};
				this.node = scalarapi.model.getMainMenuNode();
			}
			
			if (this.node) {
			
				this.element = $('<div class="listButton" style="text-align:left;"></div>');
				var menuItems = this.node.getRelatedNodes('referee', 'outgoing', true);
				
				var i;
				var n = menuItems.length;
				
				// add all of the main menu items
				if (n > 0) {
					var tocNode;
					for (i=0; i<n; i++) {
						tocNode = menuItems[i];
						this.element.append('<p class="mainMenuItem">'+(i+1)+'. <a href="'+tocNode.url+'"><b class="displayTitle">'+tocNode.getDisplayTitle()+'</b><br /><span class="displayDesc">'+((tocNode.current.description)?tocNode.current.description:'')+'</span></a></p>');
					}
					
				// show a message if there are no main menu items
				} else {
					this.element.append("<p>This work doesn't have a main menu, but you can still navigate it by selecting an option above.</p>");
				}
				
				// show a spinner if we're still loading data
				if (scalarapi.model.getBookNode() == null) {
					this.element = this.element.add('<div class="loader_anim"></div>');
				}
				
			// show a spinner if we're still loading data
			} else if (scalarapi.model.getBookNode() == null) {				
				this.element = $('<div class="loader_anim"></div>');
			}

		}
		
	}
		
	/**
	 * Current content mode view. Shows information and relationships for the current page/media.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parent		Instance of the view's parent.
	 */
	jQuery.CurrentPageModeView = function(model, parent) {
	
		var me = this;

		this.model = model;										// instance of the model
		this.parent = parent;									// parent view
		this.buttons = {};										// storage for the view's buttons
		this.undefinedCount = 0;								// number of times update has been run when currentNode has been undefined
		this.newNode = false;									// has the node being rendered changed?
		
		/**
		 * Updates the contents of the view.
		 */
		jQuery.CurrentPageModeView.prototype.update = function() {
		
			// has data for the main menu node just arrived?
			this.newNode = (this.node != scalarapi.model.currentPageNode);
		
			// if so, then reset and get the data
			if (this.newNode) {
				this.buttons = {};
				this.node = scalarapi.model.currentPageNode;
			}
			
			if (this.node) {
			
				this.element = $('<div class="header"><div class="icon_link '+this.node.getDominantScalarType().id+'"><p>'+this.node.getDisplayTitle()+'</p></div>');
				this.element.find('.icon_link').css('margin-top', '0');
				
				// add buttons for all relationships to the current page
				this.element = this.element.add(this.createButton('path', 'outgoing'));
				this.element = this.element.add(this.createButton('path', 'incoming'));
				this.element = this.element.add(this.createButton('tag', 'outgoing'));
				this.element = this.element.add(this.createButton('tag', 'incoming'));
				this.element = this.element.add(this.createButton('annotation', 'outgoing'));
				this.element = this.element.add(this.createButton('annotation', 'incoming'));
				this.element = this.element.add(this.createButton('referee', 'outgoing'));
				this.element = this.element.add(this.createButton('referee', 'incoming'));
				this.element = this.element.add(this.createButton('comment', 'outgoing'));
				this.element = this.element.add(this.createButton('comment', 'incoming'));
			
				// add editing buttons if the user has the right privileges
				if (((scalarapi.model.user_level == "scalar:Author") || (scalarapi.model.user_level == "scalar:Commentator") || (scalarapi.model.user_level == "scalar:Reviewer")) && (window.location.href.substr(window.location.href.length - 5) != '.edit')) {
					this.element = this.element.add('<div class="utility"><p><a class="utility_button" href="'+scalarapi.model.urlPrefix+'/new.edit">New</a> <a class="utility_button" href="'+this.node.url+'.edit">Edit</a> <a class="utility_button" href="javascript:;">Hide</a> </p></div>').appendTo(this.model.element);
					this.element.find('.utility_button').eq(2).click(this.handleDelete);
				}
				
				// show a spinner if we're still loading data
				if (!scalarapi.model.currentPageNode) {
					this.element = this.element.add('<div class="loader_anim"></div>');
				}
				
			} else if (!scalarapi.model.currentPageNode) {
			
				this.undefinedCount++;
				
				// show a spinner if we're still loading data, or a message if no data appears
				// to be forthcoming
				if (this.undefinedCount == 0) {
					this.element = $('<div class="loader_anim"></div>');
				} else {
					this.element = $('<div>No data available.<br /><br /></div>');
				}
			}

		}

		/**
		 * Returns a jQuery element for the button with the specified characteristics.
		 *
		 * @param {String} type				Name of the relation.
		 * @param {String} direction		Directionality of the relation.
		 * @return							The matching button.
		 */
		jQuery.CurrentPageModeView.prototype.createButton = function(type, direction) {
		
			var button = $('');
			
			// the button proxy is where events get attached; for closed buttons it's the entire
			// element, for open buttons it's just the header
			var buttonProxy;
			
			// get the right terminology for the kind of item we're looking for
			var itemType;
			if (direction == 'incoming') {
				itemType = 'body';
			} else {
				itemType = 'target';
			}
			
			// stock data about the relationship being rendered
			var description = scalarapi.model.relationTypes[type][direction];
						
			var relatedNodes = this.node.getRelatedNodes(type, direction);
			var i;
			var itemCount = relatedNodes.length;
			var relatedNode;
			
			// if the relation exists on the current node, then
			if (itemCount > 0) {
			
				relatedNode = relatedNodes[i];
			
				var itemName;
				
				// pick the singular or plural version of the item name
				(itemCount > 1) ? itemName = scalarapi.model.relationTypes[type][itemType+'Plural'] : itemName = scalarapi.model.relationTypes[type][itemType];
				
				if (itemCount > 0) {
			
					// if storage for the button hasn't already been allocated, then do so
					if (this.buttons[type+direction] == null) this.buttons[type+direction] = {};
					
					// if this is a button for a new node, or if the existing button is closed, then
					// create the button in its closed form
					if (this.newNode || !this.buttons[type+direction].open) {
						button = $('<div class="button"><p>'+description+' <b>'+itemCount+' '+itemName+'</b></p></div>');
						buttonProxy = button;
						this.buttons[type+direction].open = false;
						
					// otherwise, create the button in its open form
					} else {
					
						button = $('<div class="button"><p class="subhead">'+description+' <b>'+itemCount+' '+itemName+'</b></p></div>');
						var node;
						
						// loop through all of the related items
						for (i=0; i<itemCount; i++) {
							node = relatedNodes[i];
							
							// if there are five or fewer related items, show them with their icons/graphics
							var link;
							if (itemCount <= 5) {
							
								// show a colored box for paths
								if (node.scalarTypes.path) {
									button.append('<div class="box" style="background-color:'+node.color+';"></div>').click(function() {window.location=node.url;});
									link = $('<p class="boxItem"><a href="'+node.url+'"><b>'+node.getDisplayTitle()+'</b></a></p>').appendTo(button);
									
								// show an icon for everything else
								} else {
									link = $('<div class="icon_link '+node.getDominantScalarType().id+'"><p class="boxItem"><a href="'+node.url+'"><b>'+node.getDisplayTitle()+'</b></a></p></div>').appendTo(button);
								}
							
							// otherwise, just show them as names
							} else {
								link = $('<p class="item"><a href="'+node.url+'"><b>'+node.getDisplayTitle()+'</b></a></p>').appendTo(button);
							}
							
							// if this button displays comments on the current page, alter link so it brings up the comment viewer
							if ((type == 'reply') && (direction == 'outgoing')) {
								link.find('a').attr('href', '#');
								link.click(function() {$('#reply_list #comments').fadeIn('fast')});
							}
						}
						buttonProxy = button.find('.subhead');
						this.buttons[type+direction].open = true;
					}
				}
				
				// set up data and interaction
				if (buttonProxy) {
					buttonProxy.data('relation', type+direction);
					buttonProxy.data('open', this.buttons[type+direction].open);
					buttonProxy.data('view', this.parent);
					buttonProxy.click(function() { $(this).data('view').currentModeView.buttons[$(this).data('relation')].open = !$(this).data('open'); $(this).data('view').updateModeView(); });
				}
				
			}
			return button;
		}

		/**
		 * Handles clicks on the control to delete the current page.
		 *
		 * @param {Object} event		An object representing the event.
		 */
		jQuery.CurrentPageModeView.prototype.handleDelete = function(event) {
			
			var result = confirm('Are you sure you wish to hide this page from view (move it to the trash)?');
			
			if (result) {
			
				var node = scalarapi.model.currentPageNode;
				
				var baseProperties =  {
					'native': $('input[name="native"]').val(),
					id: $('input[name="id"]').val(),
					api_key: $('input[name="api_key"]').val(),
				};
				
				var pageData = {
					action: 'UPDATE',
					'scalar:urn': node.current.urn,
					uriSegment: scalarapi.basepath(node.url),
					'dcterms:title': node.current.title,
					'dcterms:description': node.current.description,
					'sioc:content': node.current.content,
					'rdf:type': node.baseType,
					'scalar:metadata:is_live': 0
				};
				
				var relationData = {};
				
				scalarapi.modifyPageAndRelations(baseProperties, pageData, relationData, function(result) {
					if (result) {
						window.location.reload();
					} else {
						alert('An error occurred while moving this content to the trash. Please try again.');
					}
				});
			}
			
		}
				
	}
	
	/**
	 * About mode view. Shows links to information about the book as a whole.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parent		Instance of the view's parent.
	 */
	jQuery.AboutModeView = function(model, parent) {
	
		var me = this;

		this.model = model;										// instance of the model
		this.parent = parent;									// parent view
		this.authorBtn = {open:false};							// metadata about the author button
		this.commentatorBtn = {open:false};						// metadata about the commentator button
		this.reviewerBtn = {open:false};						// metadata about the reviewer button
		
		/**
		 * Updates the contents of the view.
		 */
		jQuery.AboutModeView.prototype.update = function() {
		
			this.element = $('');
			
			// acknowledgements button
			var ackBtn = $('<div class="button"><p><b>Acknowledgements</b></p></div>');
			ackBtn.data('url', scalarapi.model.urlPrefix+'acknowledgements');
			ackBtn.click(function() { window.location = $(this).data('url'); });
			this.element = this.element.add(ackBtn);
			
			// works cited button
			var worksBtn = $('<div class="button"><p><b>Works Cited</b></p></div>');
			worksBtn.data('url', scalarapi.model.urlPrefix+'workscited');
			worksBtn.click(function() { window.location = $(this).data('url'); });
			this.element = this.element.add(worksBtn);
			
			// the button proxy is where events get attached; for closed buttons it's the entire
			// element, for open buttons it's just the header
			var buttonProxy;
			var button
			
			// create buttons for people
			var peopleNodes;
			var peopleTypes = ['author', 'commentator', 'reviewer'];
			var personType;
			var i;
			var j;
			var n = peopleTypes.length;
			for (i=0; i<n; i++) {
			
				button = $('');
				
				personType = peopleTypes[i];
				
				// if the relation exists on the current node, then
				peopleNodes = scalarapi.model.getNodesWithProperty('scalarType', personType, 'alphabetical');
				if (peopleNodes.length > 0) {
				
					var itemCount = peopleNodes.length;
					var itemName;
					
					// pick the singular or plural version of the item name
					(itemCount > 1) ? itemName = scalarapi.model.scalarTypes[personType].plural : itemName = scalarapi.model.scalarTypes[personType].singular;
					itemName = itemName.charAt(0).toUpperCase() + itemName.slice(1);
					
					if (itemCount > 0) {
						
						// if this is a button for a new node, or if the existing button is closed, then
						// create the button in its closed form
						if (this.newNode || !this[personType+'Btn'].open) {
							button = $('<div class="button"><p><b>About the '+itemName+'</b></p></div>');
							buttonProxy = button;
							this[personType+'Btn'].open = false;
							
						// otherwise, create the button in its open form
						} else {
						
							button = $('<div class="button"><p class="subhead"><b>About the '+itemName+'</b></p></div>');
							var node;
							
							// loop through all of the related items
							for (j=0; j<itemCount; j++) {
								node = peopleNodes[j];
								button.append('<p class="item"><a href="'+node.url+'"><b>'+node.name+'</b></a></p>');
							}
							buttonProxy = button.find('.subhead');
							this[personType+'Btn'].open = true;
						}
					}
					
					// set up data and interaction
					buttonProxy.data('open', this[personType+'Btn'].open);
					buttonProxy.data('view', this.parent);
					buttonProxy.data('personType',personType);
					buttonProxy.click(function() { $(this).data('view').currentModeView[$(this).data('personType')+'Btn'].open = !$(this).data('open'); $(this).data('view').updateModeView(); });
					
				}
				
				this.element = this.element.add(button);
			}
			
			this.element = this.element.add(button);	
			
			// show spinner if data is still loading		
			if (scalarapi.model.getBookNode() == null) {
				this.element = this.element.add('<div class="loader_anim"></div>');
			}
			
		}
		
	}
	
	/**
	 * Explore mode view. Shows links for exploring the content of the book.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parent		Instance of the view's parent.
	 */
	jQuery.ExploreModeView = function(model, parent) {
	
		var me = this;

		this.model = model;										// instance of the model
		this.parent = parent;									// parent view
		
		/**
		 * Updates the contents of the view.
		 */
		jQuery.ExploreModeView.prototype.update = function() {
		
			this.element = $('');
			
			// visualization button
			var visBtn = $('<div class="button"><p><b>Visualization</b></p></div>');
			visBtn.data('url', scalarapi.model.urlPrefix+'resources.visindex');
			visBtn.click(function() { window.location = $(this).data('url'); });
			this.element = this.element.add(visBtn);
			
			// tag cloud button
			var tagBtn = $('<div class="button"><p><b>Tag Cloud</b></p></div>');
			tagBtn.data('url', scalarapi.model.urlPrefix+'tags');
			tagBtn.click(function() { window.location = $(this).data('url'); });
			this.element = this.element.add(tagBtn);
			
			// user's guide button, only shown to those with authoring privileges
			if ((scalarapi.model.user_level == "scalar:Author") || (scalarapi.model.user_level == "scalar:Commentator") || (scalarapi.model.user_level == "scalar:Reviewer")) {
				var guideBtn = $('<div class="button"><p><b>User\'s Guide</b></p></div>');
				guideBtn.data('url', 'http://scalar.usc.edu/works/guide/');
				guideBtn.click(function() { window.open($(this).data('url'), '_blank'); });
				this.element = this.element.add(guideBtn);
			}
			
		}
		
	}
	
	/**
	 * Import mode view. Shows options for importing media.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parent		Instance of the view's parent.
	 */
	jQuery.ImportModeView = function(model, parent) {
	
		var me = this;

		this.model = model;										// instance of the model
		this.parent = parent;									// parent view
		this.archivesBtn = {open:false};						// metadata for archives button
		this.otherBtn = {open:false};							// metadata for other sources button
		
		/**
		 * Updates the contents of the view.
		 */
		jQuery.ImportModeView.prototype.update = function() {
		
			this.element = $('');
		
			// archives button
			button = $('');
	
			// if the existing button is closed, then
			// create the button in its closed form
			if (!this.archivesBtn.open) {
				button = $('<div class="button"><p><b>Affiliated archives</b></p></div>');
				buttonProxy = button;
				this.archivesBtn.open = false;
				
			// otherwise, create the button in its open form
			} else {
				button = $('<div class="button"><p class="subhead"><b>Affiliated archives</b></p></div>');
				button.append('<p class="item"><a href="'+scalarapi.model.urlPrefix+'import/critical_commons"><b>Critical Commons</b></a></p>');
				button.append('<p class="item"><a href="'+scalarapi.model.urlPrefix+'import/cuban_theater_digital_archive"><b>Cuban Theater Digital Archive</b></a></p>');
				button.append('<p class="item"><a href="'+scalarapi.model.urlPrefix+'import/hemispheric_institute"><b>Hemispheric Institute Digital Video Library</b></a></p>');
				button.append('<p class="item"><a href="'+scalarapi.model.urlPrefix+'import/hypercities"><b>HyperCities</b></a></p>');
				button.append('<p class="item"><a href="'+scalarapi.model.urlPrefix+'import/internet_archive"><b>Internet Archive</b></a></p>');
				button.append('<p class="item"><a href="'+scalarapi.model.urlPrefix+'import/play"><b>PLAY!</b></a></p>');
				button.append('<p class="item"><a href="'+scalarapi.model.urlPrefix+'import/shoah_foundation_vha_online"><b>Shoah Foundation VHA Online</b></a></p>');
				button.append('<p class="item"><a href="'+scalarapi.model.urlPrefix+'import/shoah_foundation_vha"><b>Shoah Foundation VHA (partner site)</b></a></p>');
				buttonProxy = button.find('.subhead');
				this.archivesBtn.open = true;
			}
			
			// set up data and interaction
			buttonProxy.data('open', this.archivesBtn.open);
			buttonProxy.data('view', this.parent);
			buttonProxy.click(function() { $(this).data('view').currentModeView.archivesBtn.open = !$(this).data('open'); $(this).data('view').updateModeView(); });
			
			this.element = this.element.add(button);
		
			// other sources button
			var button = $('');
			
			// the button proxy is where events get attached; for closed buttons it's the entire
			// element, for open buttons it's just the header
			var buttonProxy;
	
			// if the existing button is closed, then
			// create the button in its closed form
			if (!this.otherBtn.open) {
				button = $('<div class="button"><p><b>Other archives</b></p></div>');
				buttonProxy = button;
				this.otherBtn.open = false;
				
			// otherwise, create the button in its open form
			} else {
			
				button = $('<div class="button"><p class="subhead"><b>Other archives</b></p></div>');
				button.append('<p class="item"><a href="'+scalarapi.model.urlPrefix+'import/prezi"><b>Prezi</b></a></p>');
				button.append('<p class="item"><a href="'+scalarapi.model.urlPrefix+'import/soundcloud"><b>SoundCloud</b></a></p>');
				button.append('<p class="item"><a href="'+scalarapi.model.urlPrefix+'import/the_metropolitan_museum_of_art"><b>The Metropolitan Museum of Art</b></a></p>');
				button.append('<p class="item"><a href="'+scalarapi.model.urlPrefix+'import/vimeo"><b>Vimeo</b></a></p>');
				button.append('<p class="item"><a href="'+scalarapi.model.urlPrefix+'import/youtube"><b>YouTube</b></a></p>');
				buttonProxy = button.find('.subhead');
				this.otherBtn.open = true;
			}
			
			// set up data and interaction
			buttonProxy.data('open', this.otherBtn.open);
			buttonProxy.data('view', this.parent);
			buttonProxy.click(function() { $(this).data('view').currentModeView.otherBtn.open = !$(this).data('open'); $(this).data('view').updateModeView(); });
			
			this.element = this.element.add(button);
			
			// local media files button
			var localFilesBtn = $('<div class="button"><p><b>Local media files</b></p></div>');
			localFilesBtn.data('url', scalarapi.model.urlPrefix+'upload');
			localFilesBtn.click(function() { window.location = $(this).data('url'); });
			this.element = this.element.add(localFilesBtn);
			
			// internet media files button
			var internetFilesBtn = $('<div class="button"><p><b>Internet media files</b></p></div>');
			internetFilesBtn.data('url', scalarapi.model.urlPrefix+'new.edit#type=media');
			internetFilesBtn.click(function() { window.location = $(this).data('url'); });
			this.element = this.element.add(internetFilesBtn);
			
			// other Scalar books button
			var scalarBooksBtn = $('<div class="button"><p><b>Other Scalar books</b></p></div>');
			scalarBooksBtn.data('url', scalarapi.model.urlPrefix+'import/system');
			scalarBooksBtn.click(function() { window.location = $(this).data('url'); });
			this.element = this.element.add(scalarBooksBtn);
			
		}
		
	}
			
	/**
	 * Index mode view. Shows all content in the book.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parent		Instance of the view's parent.
	 */
	jQuery.IndexModeView = function(model, parent) {
	
		var me = this;

		this.model = model;										// instance of the model
		this.parent = parent;									// parent view
		this.buttons = {};										// storage for the view's buttons
		this.maxItemsPerButton = 15;							// maximum number of items to show in a button
		this.fullIndexRequested = false;						// has the user requested the full index?
		
		/**
		 * Updates the contents of the view.
		 */
		jQuery.IndexModeView.prototype.update = function() {
		
			this.element = $('');
			
			// create buttons for all media types
			this.element = this.element.add(this.createButton(scalarapi.model.getNodesWithProperty('scalarType', 'path', 'alphabetical'), 'path'));
			this.element = this.element.add(this.createButton(scalarapi.model.getNodesWithProperty('scalarType', 'page', 'alphabetical'), 'page'));
			this.element = this.element.add(this.createButton(scalarapi.model.getNodesWithProperty('scalarType', 'media', 'alphabetical'), 'media'));
			this.element = this.element.add(this.createButton(scalarapi.model.getNodesWithProperty('scalarType', 'tag', 'alphabetical'), 'tag'));
			this.element = this.element.add(this.createButton(scalarapi.model.getNodesWithProperty('scalarType', 'annotation', 'alphabetical'), 'annotation'));
			this.element = this.element.add(this.createButton(scalarapi.model.getNodesWithProperty('scalarType', 'commentary', 'alphabetical'), 'commentary'));
			this.element = this.element.add(this.createButton(scalarapi.model.getNodesWithProperty('scalarType', 'comment', 'alphabetical'), 'comment'));
			this.element = this.element.add(this.createButton(scalarapi.model.getNodesWithProperty('scalarType', 'review', 'alphabetical'), 'review'));
			
			if (!this.model.indexDataLoaded) {
			
				// present option to load the full index
				if (!this.fullIndexRequested) {
					this.element = this.element.add('<p>This is a partial index. <a id="load_index_link" href="javascript:;">Load the full index.</a></p>');
					this.element.find('#load_index_link').data('index_view', this);
					this.element.find('#load_index_link').click(function() {
						var indexView = $(this).data('index_view');
						indexView.fullIndexRequested = true;
						indexView.element = indexView.element.add('<div class="loader_anim"></div>');
						indexView.element.find('#load_index_link').parent().remove();
						indexView.parent.controller.loadNextIndexData();
					});
					
				} else {
					this.element = this.element.add('<div class="loader_anim"></div>');
				}
			}
			
		}

		/**
		 * Returns a jQuery element for the button with the specified characteristics.
		 *
		 * @param {Object} source			Where to look for items of the specified type.
		 * @param {String} type				Name of the item's type.
		 * @return							The new button.
		 */
		jQuery.IndexModeView.prototype.createButton = function(source, type) {
		
			var button = $('');
			
			// the button proxy is where events get attached; for closed buttons it's the entire
			// element, for open buttons it's just the header
			var buttonProxy;
			
			var i;
			var itemCount = source.length;
			var relatedNode;
			
			// if the relation exists on the current node, then
			if (itemCount > 0) {
			
				var itemName;
				
				// pick the singular or plural version of the item name
				(itemCount > 1) ? itemName = scalarapi.model.scalarTypes[type].plural : itemName = scalarapi.model.scalarTypes[type].singular;
				
				if (itemCount > 0) {
				
					// if storage for the button hasn't already been allocated, then do so
					if (this.buttons[type] == null) this.buttons[type] = {};
					
					// if the existing button is closed, then
					// create the button in its closed form
					if (!this.buttons[type].open) {
					
						this.buttons[type].open = false;
					
						switch (type) {
						
							case "video":
							case "audio":
							case "image":
							case "map":
							case "document":
							case "other":
							button = $('<div class="button"><div class="icon_link '+type+'"><p><b>'+itemCount+' '+itemName+'</b></p></div></div>');
							break;
						
							default:
							button = $('<div class="button"><p><b>'+itemCount+' '+itemName+'</b></p></div>');
							break;
							
						}
						this.addInteractivity(button, type);
						
					// otherwise, create the button in its open form
					} else {
					
						this.buttons[type].open = true;
						
						// the media button has sub-categories for each media type
						if (type == 'media') {
						
							button = $('<div class="button"><p class="indexSubhead"><b>'+itemCount+' '+itemName+'</b></p></div>');
							this.addInteractivity(button.find('.indexSubhead'), type);
							
							button.append(this.createButton(scalarapi.model.getNodesWithProperty('contentType', 'video', 'alphabetical'), 'video'));
							button.append(this.createButton(scalarapi.model.getNodesWithProperty('contentType', 'audio', 'alphabetical'), 'audio'));
							button.append(this.createButton(scalarapi.model.getNodesWithProperty('contentType', 'image', 'alphabetical'), 'image'));
							button.append(this.createButton(scalarapi.model.getNodesWithProperty('contentType', 'map', 'alphabetical'), 'map'));
							button.append(this.createButton(scalarapi.model.getNodesWithProperty('contentType', 'document', 'alphabetical'), 'document'));
							button.append(this.createButton(scalarapi.model.getNodesWithProperty('contentType', 'other', 'alphabetical'), 'other'));
							
						} else {
						
							var isMedia = false;
					
							switch (type) {
							
								// buttons for different media types
								case "video":
								case "audio":
								case "image":
								case "map":
								case "document":
								case "other":
								isMedia = true;
								button = $('<div class="button"><div class="icon_link '+type+'"><p class="describedSubhead"><b>'+itemCount+' '+itemName+'</b></p></div></div>');
								button.find('.icon_link').css('margin-bottom', '0');
								button.find('.describedSubhead').css('margin-bottom', '0');
								this.addInteractivity(button.find('.icon_link'), type);
								break;
							
								// buttons for non-media content types (paths, pages, annotations, tags, etc.)
								default:
								button = $('<div class="button"><p class="describedSubhead"><b>'+itemCount+' '+itemName+'</b></p></div>');
								this.addInteractivity(button.find('.describedSubhead'), type);
								break;
								
							}
							
							// list items individually if below the count threshold
							if (itemCount <= this.maxItemsPerButton) {
								var i;
								var node;
								
								// loop through all of the items
								for (i=0; i<itemCount; i++) {
									node = source[i];
									
									// if there are five or fewer related items, show them with their icons/graphics
									if ((itemCount <= 5) && !isMedia) {
									
										// show a colored box for paths
										if (node.scalarTypes.path) {
											button.append('<div class="box" style="background-color:'+node.color+';"></div>').click(function() {window.location=node.url;});
											button.append('<p class="boxItem"><a href="'+node.url+'"><b>'+node.getDisplayTitle()+'</b></a></p>');
											
										// show an icon for everything else
										} else {
											button.append('<div class="icon_link '+node.getDominantScalarType().id+'"><p class="boxItem"><a href="'+node.url+'"><b>'+node.getDisplayTitle()+'</b></a></p></div>');
										}
									
									// otherwise, just show them as names
									} else {
										// show a colored box for paths
										if (node.scalarTypes.path) {
											button.append('<div class="box" style="background-color:'+node.color+';"></div>').click(function() {window.location=node.url;});
											button.append('<p class="boxItem"><a href="'+node.url+'"><b>'+node.getDisplayTitle()+'</b></a></p>');
										} else {
											button.append('<p class="item"><a href="'+node.url+'"><b>'+node.getDisplayTitle()+'</b></a></p>');
										}
									}
								}
								
							// otherwise, create buttons representing groups of items
							} else {
								this.createIndexButtons(button, type, source);
							}
						}
					}
				}
				
			}
			return button;
		}
		
		/**
		 * Adds interactivity to a given button.
		 *
		 * @param {Object} buttonProxy		Element to which the interactivity should be added.
		 * @param {String} type				The type of the item.
		 */
		jQuery.IndexModeView.prototype.addInteractivity = function(buttonProxy, type) {
			buttonProxy.data('type', type);
			buttonProxy.data('open', this.buttons[type].open);
			buttonProxy.data('view', this.parent);
			buttonProxy.click(function(event) { 
				$(this).data('view').currentModeView.buttons[$(this).data('type')].open = !$(this).data('open');
				$(this).data('view').updateModeView(); 
			});
		}
		
		/**
		 * Creates the buttons for large numbers of items.
		 *
		 * @param {Object} buttonParent		DOM parent of the button.
		 * @param {String} sourceType		Type of button being created.
		 * @param {Object} sourceData		Data for the content of the button.
		 */
		jQuery.IndexModeView.prototype.createIndexButtons = function(buttonParent, sourceType, sourceData) {
		
			var alphaChunks = [];
			var chunkedData = [];
			var data = sourceData.slice();
			var nextLetter;
			var chunk = {startLetter:'', endLetter:'', data:[]};
						
			// first step: build chunks of items organized by starting letter
			var i;
			var n = data.length;
			for (i=0; i<n; i++) {
				nextLetter = data[i].getSortTitle().substr(0, 1).toUpperCase();
				if (chunk.startLetter == '') {
					chunk.startLetter = nextLetter;
					chunk.endLetter = nextLetter;
				} else if (chunk.startLetter != nextLetter) {
					alphaChunks.push(chunk);
					chunk = {startLetter:nextLetter, endLetter:nextLetter, data:[]};
				}
				chunk.data.push(data[i]);
			}
			if (chunk.data.length > 0) alphaChunks.push(chunk);
			
			// next step: fine tune the chunks according to other criteria
			var alphaChunk;
			var useCount;
			n = alphaChunks.length;
			chunk = {startAbbr:'', endAbbr:'', data:[]};
			for (i=0; i<n; i++) {
				alphaChunk = alphaChunks[i];
				while (alphaChunk.data.length > 0) {
				
					// if this is a new chunk, add the next first letter-indexed chunk to it
					if (chunk.data.length == 0) {
						chunk.data = chunk.data.concat(alphaChunk.data.splice(0, this.maxItemsPerButton));
						
					// otherwise, if there's room in the chunk to add another complete letter-indexed chunk, then do so
					} else if ((chunk.data.length + alphaChunk.data.length) < this.maxItemsPerButton) {
						useCount = this.maxItemsPerButton - chunk.data.length;
						chunk.data = chunk.data.concat(alphaChunk.data.splice(0, useCount));
					
					// otherwise, if the abbreviation of the next chunk is the same as this one, 
					// then try to keep adding elements from the next one until they differ
					} else if (alphaChunk.data[Math.min(this.maxItemsPerButton - 1, alphaChunk.data.length - 1)].getDisplayTitle().substr(0, this.parent.maxLettersPerAbbr).toUpperCase() == chunk.data[0].getDisplayTitle().substr(0, this.parent.maxLettersPerAbbr).toUpperCase()) {
						chunk.data = chunk.data.concat(alphaChunk.data.splice(0, this.maxItemsPerButton));
						useCount = 0;
						while ((useCount < alphaChunk.data.length) && (alphaChunk.data[useCount].getDisplayTitle().substr(0, this.parent.maxLettersPerAbbr) == chunk.data[0].getDisplayTitle().substr(0, this.parent.maxLettersPerAbbr))) {
							useCount++;
						}
						if (useCount > 0) {
							chunk.data = chunk.data.concat(alphaChunk.data.splice(0, useCount));
						}
						
					// otherwise, add the new chunk
					} else {
						chunkedData.push(chunk);
						chunk = {startAbbr:'', endAbbr:'', data:[]};
					}
				}
			}
			if (chunk.data.length > 0) chunkedData.push(chunk);
			
			var button;
			var chunk;
			var abbrName;
			var type;
			n = chunkedData.length;
			var j;
			var o;
			var node;
			
			// create the buttons
			for (i=0; i<n; i++) {
			
				button = $('');
				
				chunk = chunkedData[i];
				type = sourceType+"_chunk"+i;
				
				abbrName = this.parent.getAbbreviatedName(chunkedData, i);
				
				// if storage for the button hasn't already been allocated, then do so
				if (this.buttons[type] == null) this.buttons[type] = {};
				
				// if the existing button is closed, then
				// create the button in its closed form
				if (!this.buttons[type].open) {
				
					this.buttons[type].open = false;
				
					button = $('<div class="indexButton"><p><b>'+abbrName+'</b></p></div>');
					this.addInteractivity(button, type);
					
				// otherwise, create the button in its open form
				} else {
				
					this.buttons[type].open = true;
				
					button = $('<div class="indexButton selected"><p class="indexSubhead"><b>'+abbrName+'</p></div>');
					this.addInteractivity(button.find('.indexSubhead'), type);
					
					o = chunk.data.length;
					
					// loop through all of the items
					for (j=0; j<o; j++) {
					
						node = chunk.data[j];
						
						// show a colored box for paths
						if (node.shortType == 'path') {
							$(button[0]).append('<div class="box" style="background-color:'+node.color+';"></div>').click(function() {window.location=node.url;});
							$(button[0]).append('<p class="boxItem"><a href="'+node.url+'"><b>'+node.getDisplayTitle()+'</b></a></p>');
						} else {
							$(button[0]).append('<p class="item"><a href="'+node.url+'"><b>'+node.getDisplayTitle()+'</b></a></p>');
						}
						
					}
				}
				
				buttonParent.append(button);
			}
			
		}
		
	}
			
}) (jQuery);