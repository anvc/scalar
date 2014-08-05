
// jQuery no-double-tap-zoom plugin

// Triple-licensed: Public Domain, MIT and WTFPL license - share and enjoy!

(function($) {
  var IS_IOS = /iphone|ipad/i.test(navigator.userAgent);
  $.fn.nodoubletapzoom = function() {
    if (IS_IOS)
      $(this).bind('touchstart', function preventZoom(e) {
        var t2 = e.timeStamp
          , t1 = $(this).data('lastTouch') || t2
          , dt = t2 - t1
          , fingers = e.originalEvent.touches.length;
        $(this).data('lastTouch', t2);
        if (!dt || dt > 500 || fingers > 1) return; // not double-tap

        e.preventDefault(); // double tap - prevent the zoom
        // also synthesize click events we just swallowed up
        $(this).trigger('click').trigger('click');
      });
  };
})(jQuery);

function handleViewTypeClick(radioBtn) {
	$('#visualization').data('scalarvis').view.handleViewTypeClick(radioBtn);
}

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
 * @projectDescription		The ScalarVis plug-in visualizes Scalar projects.
 *							Scalar is a project of The Alliance for Networking Visual Culture (http://scalar.usc.edu).
 * @author					Erik Loyer
 * @version					1.0
 */

(function ($) {

	/**
	 * Plug-in setup.
	 *
	 * @param {Object} options	An object containing relevant data for the plug-in.
	 */
	$.fn.scalarvis = function(options) {
	
		return this.each(function() {

			// check to see if we've been passed a link to a Scalar media file
			var element = $(this);

				// don't create a new instance of the plug-in class if one already exists on this element
	    		if (element.data('scalarvis')) return;

				var scalarvis = new ScalarVis(element, options);

				// store the class in the data of the element itself
				element.data('scalarvis', scalarvis);

				// store the class in the data of the element itself
				element.data('scalarvis', scalarvis);

		});
	};

	/**
	 * The base class for the plug-in.
     *
     * @param	{Object} element	The element in which the visualization is to be rendered.
	 * @param 	{Object} options	An object containing relevant data for the plug-in.
	 */
	var ScalarVis = function(element, options) {
		
		var me = this;
		
		this.model = new $.VisModel(element, options);
		this.view = new $.VisView(this.model);
		this.controller = new $.VisController(this.model, this.view);

		/**
		 * Basic initialization.
		 */
		this.setup = function() {
			this.view.setup();
			this.controller.loadNextData();
		}
		
		this.setup();

	}

	/**
	 * Model for the plug-in.
	 * @constructor
	 *
     * @param	{Object} element	The element in which the visualization is to be rendered.
	 * @param	{Object} options	An object containing relevant data for the plug-in.
	 */
	jQuery.VisModel = function(element, options) {
	
		this.element = element;					// element in which the visualization will be displayed
		this.options = options;					// data passed into the plug-in
		this.maxNodesPerType = 0;				// maximum number of nodes per type
		this.doneLoading = false;				// has all data been loaded?
		this.crossDomain = false;				// are we making cross-domain requests for testing purposes?
		
		/**
		 * Initializes the model.
		 */
		jQuery.VisModel.prototype.init = function() {

			// scrape book title from page
			this.book_title = $('h2.cover_title').html();

		}
		
		this.init();
		
	}

	/**
	 * Controller for the plug-in.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} controller	Instance of the primary view.
	 */
	jQuery.VisController = function(model, view) {

		var me = this;

		this.model = model;															// instance of the model
		this.view = view;															// instance of the view
		
		switch (this.model.options.default_tab) {
		
			case "vispath":
			this.loadSequence = [
				{id:'path', desc:"paths"}, 
			];
			break;
		
			case "vismedia":
			this.loadSequence = [
				{id:'media_references', desc:"media"},
			];
			break;
		
			case "vistag":
			this.loadSequence = [
				{id:'tag', desc:"tags"}, 
			];
			break;
					
			default:
			this.loadSequence = [
				{id:'book', desc:'book'},
				{id:'current', desc:"current page"},
				{id:'currentRelations', desc:"current page's connections"},
				{id:'path', desc:"paths"}, 
				{id:'tag', desc:"tags"}, 
				{id:'media', desc:"media"},
				{id:'page', desc:"pages"}, 
				{id:'annotation', desc:"annotations"},
				{id:'commentary', desc:"commentaries"},
				{id:'review', desc:"reviews"},
				{id:'reply', desc:"comments"}
			];
			break;
		
		}

		this.loadIndex = -1;														// index of currently loading data
		this.pageIndex = 0;
		this.resultsPerPage = 25;
		this.reachedLastPage = true;
		
		/**
		 * Loads the next round of data.
		 */
		jQuery.VisController.prototype.loadNextData = function() {
		
			// if we've reached the last page of the current content type, increment/reset the counters
			if ( this.reachedLastPage ) {
				this.loadIndex++;
				this.pageIndex = 0;
				this.reachedLastPage = false;
				
			// otherwise, just increment the page counter
			} else {
				this.pageIndex++;
			}
			
			var url, result, start, end;
			
			// if we still have more data to load, then load it
			if (this.loadIndex < this.loadSequence.length) {
			
				switch (this.loadSequence[this.loadIndex].id) {
				
					case 'book':
					this.reachedLastPage = true;
					result = scalarapi.loadBook(false, me.parseData, null);
					start = end = -1;
					break;
				
					case "current":
					this.reachedLastPage = true;
					result = scalarapi.loadCurrentPage(false, me.parseData, null, 0);
					start = end = -1;
					break;
					
					case "currentRelations":
					this.reachedLastPage = true;
					start = end = -1;
					result = scalarapi.loadCurrentPage(true, me.parseData, null, 1, true);
					break;
					
					// we only need to make these calls with depth=0; relationships will come with the other calls
					case 'page':
					start = ( this.pageIndex * this.resultsPerPage );
					end = start + this.resultsPerPage;
					result = scalarapi.loadPagesByType(this.loadSequence[this.loadIndex].id, true, me.parseData, null, 0, false, null, start, this.resultsPerPage );
					break;
				
					case 'path':
					case 'tag':
					start = ( this.pageIndex * this.resultsPerPage );
					end = start + this.resultsPerPage;
					result = scalarapi.loadPagesByType(this.loadSequence[this.loadIndex].id, true, me.parseData, null, 1, false, this.loadSequence[this.loadIndex].id, start, this.resultsPerPage );
					break;
				
					case 'media':
					start = ( this.pageIndex * this.resultsPerPage );
					end = start + this.resultsPerPage;
					result = scalarapi.loadPagesByType(this.loadSequence[this.loadIndex].id, true, me.parseData, null, 0, false, null, start, this.resultsPerPage );
					break;
				
					case 'media_references':
					start = ( this.pageIndex * this.resultsPerPage );
					end = start + this.resultsPerPage;
					result = scalarapi.loadPagesByType( 'media', true, me.parseData, null, 1, true, null, start, this.resultsPerPage );
					break;
				
					default:
					start = ( this.pageIndex * this.resultsPerPage );
					end = start + this.resultsPerPage;
					result = scalarapi.loadPagesByType(this.loadSequence[this.loadIndex].id, true, me.parseData, null, 1, false, null, start, this.resultsPerPage );
					break;
				
				}
		
				this.view.showLoadingMsg(this.loadSequence[this.loadIndex].desc, ((this.loadIndex + 1) / (this.loadSequence.length + 1)) * 100, ( start == -1 ) ? -1 : start + 1, end );
				
				if (result == 'loaded') me.parseData();
				
				/*
				if (this.model.crossDomain) {
					url = 'http://localhost/utils/ba-simple-proxy.php?url='+url;
				}
				
				$.ajax({
					type:"GET",
					url:url,
					dataType:"json",
					success:me.parseData,
					error:function(XMLHttpRequest, textStatus, errorThrown) {
						//console.log(textStatus);
					}
				});*/
				
			// otherwise, hide the loading message
			} else {
				this.view.hideLoadingMsg();
				this.model.doneLoading = true;
			}
		
		}
		
		/**
		 * Parses the current round of data.
		 *
		 * @param {Object} json		The data to be parsed.
		 */
		jQuery.VisController.prototype.parseData = function(json) {
		
			if ( jQuery.isEmptyObject( json ) || ( json == null ) ) {
				me.reachedLastPage = true;
			}
			
			// parse its relations with other nodes
			if ((me.loadSequence[me.loadIndex].id != 'book') && (me.loadSequence[me.loadIndex].id != 'current') && (me.loadSequence[me.loadIndex].id != 'currentRelations')) {
				var typedNodes = scalarapi.model.getNodesWithProperty('scalarType', me.loadSequence[me.loadIndex].id);
				me.model.maxNodesPerType = Math.max(me.model.maxNodesPerType, typedNodes.length);
			}
		
			// redraw the view
			me.view.update();
			
			// get next chunk of data
			me.loadNextData();
		}		 
		
	}

	/**
	 * View for the plug-in.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 */
	jQuery.VisView = function(model) {

		var me = this;

		this.model = model;										// instance of the model
		this.leftMargin = 100;									// width of the visualization's left margin
		this.rightMargin = 70;									// width of the visualization's right margin
		this.indexTypeOrder = [									// determines the order in which types are shown in index view
			{id:"path", name:"Paths"},		
			{id:"page", name:"Pages"},
			{id:"media", name:"Media"},
			{id:"tag", name:"Tags"},
			{id:"annotation", name:"Annotations"},
			{id:"commentary", name:"Commentaries"},
			{id:"review", name:"Reviews"},
			{id:"comment", name:"Comments"},
			{id:"person", name:"People"}
		];
		this.indexTypeStrings = ['path', 'page', 'media', 'tag', 'annotation', 'commentary', 'review', 'comment', 'person'];
		this.selectedRadioBtn = "radio1";						// id of the currently selected radio button
		this.lastSelectedRadioBtn;								// id of the last selected radio button
		this.scaleFactorH = 1;									// available width multiplier
		this.hasSelectedCurrentContent = false;					// has the current content been selected by default yet?
		this.selectedNodes = [];								// currently selected nodes
		this.deselectedSelf = false;							// has the user deselected the node for the page she's on?
		this.currentNode = null;								// currently highlighted 
		this.mouseX = -600;
		this.mouseY = -600;
		this.colorScale = d3.scale.category10();
		this.relationOrder = [									// determines the order in which a node's relationships are described
			{type:'path', direction:'outgoing'},
			{type:'path', direction:'incoming'},
			{type:'tag', direction:'outgoing'},
			{type:'tag', direction:'incoming'},
			{type:'annotation', direction:'outgoing'},
			{type:'annotation', direction:'incoming'},
			{type:'referee', direction:'outgoing'},
			{type:'referee', direction:'incoming'},
			{type:'comment', direction:'outgoing'},
			{type:'comment', direction:'incoming'}
		];
		
		// pop-up that shows information about the selected node
		this.nodeInfoBox = function(d) { 
			var str = '<div class="arrow"></div><div class="content"><p><strong>';
			str += d.getDisplayTitle( true );
			str += '</strong></p>';
			var description;
			var relatedNodes;
			var itemCount;
			var itemName;
			var itemType;
			var type;
			var direction;
			var relationType;
			var i;
			var n = me.relationOrder.length;
			for (i=0; i<n; i++) {
				type = me.relationOrder[i].type;
				direction = me.relationOrder[i].direction;
				(direction == 'incoming') ? itemType = 'body' : itemType = 'target';
				relationType = scalarapi.model.relationTypes[type];
				description = relationType[direction];
				relatedNodes = d.getRelatedNodes(type, direction);
				itemCount = relatedNodes.length;
				(itemCount > 1) ? itemName = relationType[itemType+'Plural'] : itemName = relationType[itemType];
				if (itemCount > 0) str += '<p style="color:'+d3.rgb(me.colorScale((relationType.id == 'referee') ? 'media' : relationType.id)).brighter(1.5)+';">'+description+' '+itemCount+' '+itemName+'</p>';
			}
			if (me.currentNode) {
				if ((me.currentNode.url != d.url) || (me.selectedNodes.indexOf(d) != -1)) {
					str += '<p><a href="'+d.url+'">View &raquo;</a></p>';
				}
			} else {
				str += '<p><a href="'+d.url+'">View &raquo;</a></p>';
			}
			str += '</div></div>';
			return str; 
		}

		/**
		 * Basic initialization.
		 */
		jQuery.VisView.prototype.setup = function() {
		
			// makes sure color scheme is consistent no matter which vis loads first
			var i;
			var n = this.indexTypeOrder.length;
			for (i=0; i<n; i++) {
				this.colorScale(this.indexTypeOrder[i].id);
			}
		
			switch (this.model.options.default_tab) {
						
				case "vis":
				case "visradial":
				this.selectedRadioBtn = "radio1";
				break;
				
				case "visindex":
				this.selectedRadioBtn = "radio2";
				break;
			
				case "vispath":
				this.selectedRadioBtn = "radio3";
				break;
			
				case "vismedia":
				this.selectedRadioBtn = "radio4";
				break;
			
				case "vistag":
				this.selectedRadioBtn = "radio5";
				break;
				
				default:
				this.selectedRadioBtn = "radio1";
				break;
			
			}
			
			// create button bar
			if (this.model.options.minimal) {
				this.visTypeForm = $('<form><div id="radio"><input onClick="handleViewTypeClick(this);" type="radio" id="radio1" name="radio"/><label for="radio1">Radial</label><input onClick="handleViewTypeClick(this);" type="radio" id="radio2" name="radio" checked="checked"/><label for="radio2">Index</label><input onClick="handleViewTypeClick(this);" type="radio" id="radio3" name="radio"/><label for="radio3">Paths</label></div></form>').appendTo(this.model.element);
			} else {
				this.visTypeForm = $('<form><div id="radio"><input onClick="handleViewTypeClick(this);" type="radio" id="radio1" name="radio"/><label for="radio1">Radial</label><input onClick="handleViewTypeClick(this);" type="radio" id="radio2" name="radio" checked="checked"/><label for="radio2">Index</label><input onClick="handleViewTypeClick(this);" type="radio" id="radio3" name="radio"/><label for="radio3">Paths</label><input onClick="handleViewTypeClick(this);" type="radio" id="radio4" name="radio"/><label for="radio4">Media</label><input onClick="handleViewTypeClick(this);" type="radio" id="radio5" name="radio"/><label for="radio5">Tags</label></div></form>').appendTo(this.model.element);
			}
			$("#radio").buttonset();
			
			this.visTypeForm.find('input').each(function() {
				if ($(this).attr('id') == me.selectedRadioBtn) {
					$(this).attr('checked', 'checked');
				} else {
					$(this).removeAttr('checked');
				}
			})	
			$("#radio").buttonset('refresh');
			
			// create instructions div
			this.instructions = $('<div class="instructions"><b>Paths and their contents.</b> Click to select; double-click to view.</div>').appendTo(this.model.element);
			
			// create loading message
			this.loadingMsg = $('<div id="loadingMsg"><p>Loading data...</p><div id="progressbar"></div></div>').appendTo(this.model.element);
			$("#progressbar").progressbar({value:10, max:100});
			this.loadingMsg.hide();
			
			// create visualization div
			this.visualization = $('<div id="scalarvis"></div>').appendTo(this.model.element);
			
			this.visualization.mousemove(function(e) {
				me.mouseX = e.pageX;
				me.mouseY = e.pageY;
			});
			
		}
		
		/**
		 * Shows the loading message.
		 *
		 * @param {String} typeName			The type of node being loaded.
		 * @param {Number} percentDone		Percentage of loads completed (0-100)
		 */
		jQuery.VisView.prototype.showLoadingMsg = function( typeName, percentDone, start, end ) {
			if ( start != -1 ) {
				this.loadingMsg.find('p').text( 'Loading ' + typeName + ' ' + start + ' through ' + end + '...' );
			} else {
				this.loadingMsg.find('p').text( 'Loading ' + typeName + '...' );
			}
			$("#progressbar").progressbar('option', 'value', percentDone);
			this.loadingMsg.show();
		}
		
		/**
		 * Hides the loading message.
		 */
		jQuery.VisView.prototype.hideLoadingMsg = function() {
			this.loadingMsg.hide();
		}
		
		/**
		 * Updates the currently visible visualization.
		 */
		jQuery.VisView.prototype.update = function() {
		
			clearInterval(this.int);
			
			var updateOnly = (this.selectedRadioBtn == this.lastSelectedRadioBtn);
		 
		 	switch (this.selectedRadioBtn) {
		 		
		 		case "radio1":
		 		this.drawRadialVisualization(updateOnly);
				break;
		 		
		 		case "radio2":
		 		this.drawIndexVisualization(updateOnly);
				break;
		 	
		 		case "radio3":
		 		this.drawPathVisualization(updateOnly);
		 		break;
		 		
		 		case "radio4":
		 		this.drawMediaVisualization(updateOnly);
		 		break;
		 		
		 		case "radio5":
		 		this.drawTagVisualization(updateOnly);
				break;
		 		
		 	}
		 	
		 	this.lastSelectedRadioBtn = this.selectedRadioBtn;
		 
		}
		
		/**
		 * Returns a new string no longer than the specified amount of characters,
		 * shortening with ellipses if necessary.
		 *
		 * @param	str			The source string.
		 * @param	maxChars	Maximum string length.
		 * @return				The modified string.
		 */
		jQuery.VisView.prototype.getShortenedString = function(str, maxChars) {
			var shortStr;
			if (str == null) {
				shortStr = '';
			} else if (str.length > maxChars) {
				shortStr = str.substr(0, maxChars - 3) + '...';
			} else {
				shortStr = str;
			}
			return shortStr;
		}
		
		
		/**
		 * Adds a legend to the specified svg group.
		 *
		 * @param	group		The svg group to which the legend should be added.
		 * @param	xOffset		Horizontal offset to use in drawing the legend.
		 * @param	height		Height of the group enclosing the legend.
		 */
		jQuery.VisView.prototype.drawLegend = function(group, xOffset, height) {	
		
			var legendOffset = height - (14 * this.indexTypeOrder.length);
			
			group.selectAll('rect.legend')
				.data(this.indexTypeOrder)
				.enter().append('svg:rect')
				.attr('class', 'legend')
				.attr('x', xOffset)
				.attr('y', function(d,i) { return legendOffset + (i * 14); })
				.attr('width', 10)
				.attr('height', 10)
				.attr('fill', function(d) { return me.colorScale(d.id); });
				
			group.selectAll('text.legend')
				.data(this.indexTypeOrder)
				.enter().append('svg:text')
				.attr('class', 'legend')
				.attr('dx', 15 + xOffset)
				.attr('dy', function(d,i) { return legendOffset + 9 + (i * 14); })
				.attr('fill', '#aaa')
				.text(function(d) { return d.name; });
				
			$('.legend').nodoubletapzoom();
		}
		
		/**
		 * Draws the paths visualization.
		 */
		jQuery.VisView.prototype.drawPathVisualization = function() {
		
			// if the user hasn't already made a selection, and either not all data has been loaded yet or we
			// haven't selected the current page yet, then see if we can find the node for the current page
			// and select it
			if ((this.selectedNodes.length == 0) && (!this.model.doneLoading || !this.hasSelectedCurrentContent)) {
				if (scalarapi.model.currentPageNode != null) {
					this.selectedNodes = [scalarapi.model.currentPageNode];
					if (this.model.doneLoading) {
						this.hasSelectedCurrentContent = true;
					}
				}
			}
			
			this.visualization.empty();
			this.visualization.css('padding', '10px');
			this.instructions.html('<b>All paths and their contents.</b> Double-click an item to view.<br><br>');
			
			var i;
			var j;
			var k;
			var n;
			var o;
			
			// build a tree starting with the index page
			
			var processedNodes = [];
			
			// recursively parse through the nodes contained by this node and store their relationships
			function getRelationsForData(sourceData) {
				var destNode;
				var destData;
				var j;
				var o;
				var comboUrl;
				var pathContents = sourceData.node.getRelatedNodes('path', 'outgoing');
				if (pathContents.length > 0) {
					sourceData.children = [];
					o = pathContents.length;
					for (j=0; j<o; j++) {
						destNode = pathContents[j];
						destData = {name:destNode.getDisplayTitle( true ), node:destNode, children:null};
						if (destNode == home) destData.name += ' [Home]';
						//comboUrl = sourceData.node.url+destData.node.url;
						sourceData.children.push(destData);
						if (processedNodes.indexOf(sourceData.node) == -1) {
							processedNodes.push(sourceData.node);
							getRelationsForData(destData);
						}
					}
				}
			}
			
			var root = { name: scalarapi.removeMarkup( this.model.book_title ), type:'root', children:[] };
			var home = scalarapi.model.nodesByURL[scalarapi.model.urlPrefix+'index'];
			
			// if we can find a home node,
			if (home) {
			
				// and if it's contained by a path, then insert that path above it
				// in the hierarchy and then parse the home node's children
				var containingPaths = home.getRelatedNodes('path', 'incoming');
				if (containingPaths.length > 0) {
					n = containingPaths.length;
					for (i=0; i<n; i++) {
						node = containingPaths[i];
						data = {name:node.getDisplayTitle( true ), node:node, type:'pseudo', children:null};
						root.children.push(data);
						getRelationsForData(data);
					}
					
				// otherwise, make the home node next in the hierarchy and parse its
				// children
				} else {
					data = {name:home.getDisplayTitle( true ) +' [Home]', node:home, children:null};
					root.children.push(data);
					getRelationsForData(data);
				}
			}
			
			// add all other paths and their children to the graph
			var paths = scalarapi.model.getNodesWithProperty('scalarType', 'path');
			if (paths.length > 0) {
			
				var pathChildren = [];
			
				n = paths.length;
				for (i=0 ;i<n; i++) {
					node = paths[i];
					if (processedNodes.indexOf(node) == -1) {
						data = {name:node.getDisplayTitle( true ), node:node, children:null};
						pathChildren.push(data);
						getRelationsForData(data);
					}
				}
			
				if (pathChildren.length > 0) {
					var otherPaths = {name:'Other paths', type:'cipher', children:pathChildren};
					root.children.push(otherPaths);
				}
				
			}
			
			if (root.children.length > 0) {
			
				this.visualization.css('width', this.model.element.width());
				this.visualization.css('padding', '0px');
				var fullWidth = this.visualization.width();
				var fullHeight = this.visualization.height();
				
				// do initial cluster processing
				var cluster = d3.layout.cluster()
					.size([fullHeight, fullWidth - 210]);
				var clusterNodes = cluster.nodes(root);
					
				// find out how deep the cluster goes (used to figure out long to let
				// the titles get)
				var maxDepth = d3.max(clusterNodes, function(d) { return d.depth; });
	
				var maxNodeChars = Math.floor((fullWidth / (maxDepth + 1)) / 6);
				var curNode;
				var name;
				var shortName;
				var data;
				
				// generate short versions of node names that will fit in the node boxes
				/*for (i=0; i<this.model.nodes.length; i++) {    
					curNode = this.model.nodes[i];
					name = curNode.name;
					if (curNode == home) name += ' [Home]';
					if (name.length > maxNodeChars) {
						shortName = name.substr(0, maxNodeChars - 3) + '...';
					} else {
						shortName = name;
					}
					curNode.shortName = shortName;
				}*/
				
				// find out how many nodes are at the lowest level (used to figure out
				// how tall the vis should be)
				var maxDepthCount = 0;
				clusterNodes.forEach(function(d) {
					if (d.children == null) {
						maxDepthCount++;
					}
				});
				
				// resize the cluster accordingly
				if (paths.length > 0) {
					fullHeight = Math.max(this.visualization.height(), 20 + (15 * maxDepthCount) + (30 * (paths.length - 1)));
					cluster.size([fullHeight, fullWidth - (fullWidth / (maxDepth + 1)) - 20]);
					cluster.nodes(root);
				}
					
				var diagonal = d3.svg.diagonal()
					.projection(function(d) { return [d.y, d.x]; });
				
				// create visualization base element
				var vis = d3.select('#scalarvis').append('svg:svg')
					.attr('width', fullWidth)
					.attr('height', fullHeight)
					.append("svg:g")
					.attr("transform", "translate(15, 0)");
					
				// lines
				var link = vis.selectAll("path.clusterlink")
					.data(cluster.links(clusterNodes))
					.enter().append("svg:path")
					.attr("class", "clusterlink")
					.attr("d", diagonal);
					
				// node groups
				var clusterNode = vis.selectAll("g.clusternode")
					.data(clusterNodes)
					.enter().append("svg:g")
					.attr("class", "clusternode")
					.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
					.on("dblclick", function(d) {
						if (d.node) {
							return self.location = d.node.url;
						}
					});
					
				// dots
				clusterNode.append("svg:circle")
					.style('fill', function(d, i) { return (d.node) ? me.colorScale(d.node.getDominantScalarType().id) : (d.type == 'root') ? '#ddd' : '#fff'; } )
					.attr("class", function(d) { return d.type == 'cipher' ? 'cipher' : ''; })
					/*.attr("class", function(d) { if (d.node) { console.log(d.node.name+' '+home.name); } return d.node == home ? 'current' : ''; })*/
					.attr("r", 5);
					
				// texts
				clusterNode.append("svg:text")
					.attr("dx", function(d) { return /*d.children ? -8 :*/ 8; })
					.attr("dy", 3)
					.attr("class", function(d) { return d.type == 'cipher' ? 'cipher' : ''; })
					.attr('font-weight', function(d) { return (((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) && d.node) ? 'bold' : 'normal'; })
					.attr("text-anchor", function(d) { /*return d.children ? "end" :*/ "start"; })
					.text(function(d) { return (d.node) ? me.getShortenedString(d.name, maxNodeChars) : d.name; });
					
				this.drawLegend(vis, -5, fullHeight);
				
			}

		}
				
		/**
		 * Draws the media visualization.
		 *
		 * @param	updateOnly		If true, then the vis only needs to be updated, not built from scratch.
		 */
		jQuery.VisView.prototype.drawMediaVisualization = function(updateOnly) {
			
			// if the user hasn't already made a selection, and either not all data has been loaded yet or we
			// haven't selected the current page yet, then see if we can find the node for the current page
			// and select it
			if ((this.selectedNodes.length == 0) && (!this.model.doneLoading || !this.hasSelectedCurrentContent)) {
				if (scalarapi.model.currentPageNode != null) {
					this.selectedNodes = [scalarapi.model.currentPageNode];
					if (this.model.doneLoading) {
						this.hasSelectedCurrentContent = true;
					}
				}
			}
			
			var i;
			var j;
			var n;
			var o;
			var node;
			var targetNode;
			var maxNodeChars = 15;
			
			// if we're drawing from scratch, wipe out the previous vis
			if (!updateOnly) {
				this.visualization.empty();
				this.instructions.html('<b>Media and their relationships.</b> Roll over the visualization to explore. Click to select; drag to move; double-click to view.');
			}
			
			// init our local model
			if (!this.mediaNodesByURL) {
				this.mediaNodesByURL = {};
				this.mediaNodes = [];
				this.mediaLinksByURL = {};
				this.mediaLinks = [];
			}
				
			var link;
			var datum;
			var targetDatum;
			
			// build arrays of nodes and links which describe media and their connections
			
			// loop through all the media files
			var rawMediaNodes = scalarapi.model.getNodesWithProperty('scalarType', 'media');
			n = rawMediaNodes.length;
			for (i=0; i<n; i++) {
			
				// add each file to the array of nodes
				node = rawMediaNodes[i];
				if (!this.mediaNodesByURL[node.url]) {
					datum = {index:this.mediaNodes.length, node:node, title:node.getDisplayTitle( true ), shortTitle:this.getShortenedString(node.getDisplayTitle( true ), maxNodeChars), type:node.getDominantScalarType().id};
					this.mediaNodesByURL[node.url] = datum;
					this.mediaNodes.push(datum);
				} else {
					datum = this.mediaNodesByURL[node.url];
				}
				
				// loop through all the nodes which reference the media file
				var referencingNodes = node.getRelatedNodes('referee', 'incoming');
				o = referencingNodes.length;
				for (j=0; j<o; j++) {
				
					// add them to the array of nodes
					targetNode = referencingNodes[j];
					if (!this.mediaNodesByURL[targetNode.url]) {
						targetDatum = {index:this.mediaNodes.length, node:targetNode, title:targetNode.getDisplayTitle( true ), shortTitle:this.getShortenedString(targetNode.getDisplayTitle( true ), maxNodeChars), type:targetNode.getDominantScalarType().id};
						this.mediaNodesByURL[targetNode.url] = targetDatum;
						this.mediaNodes.push(targetDatum);
					} else {
						targetDatum = this.mediaNodesByURL[targetNode.url];
					}
					
					// add the link to the array of links
					if (!this.mediaLinksByURL[node.url+targetNode.url]) {
						link = {source:datum.index, target:targetDatum.index, value:1};
						this.mediaLinksByURL[node.url+targetNode.url] = link;
						this.mediaLinks.push(link);
					}
				}
				
				// loop through all the nodes which annotate the media file
				var annotatingNodes = node.getRelatedNodes('annotation', 'incoming');
				o = annotatingNodes.length;
				for (j=0; j<o; j++) {
				
					// add them to the array of nodes
					targetNode = annotatingNodes[j];
					if (!this.mediaNodesByURL[targetNode.url]) {
						targetDatum = {index:this.mediaNodes.length, node:targetNode, title:targetNode.getDisplayTitle( true ), shortTitle:this.getShortenedString(targetNode.getDisplayTitle( true ), maxNodeChars), type:targetNode.getDominantScalarType().id};
						this.mediaNodesByURL[targetNode.url] = targetDatum;
						this.mediaNodes.push(targetDatum);
					} else {
						targetDatum = this.mediaNodesByURL[targetNode.url];
					}
					
					// add the link to the array of links
					if (!this.mediaLinksByURL[node.url+targetNode.url]) {
						link = {source:datum.index, target:targetDatum.index, value:1};
						this.mediaLinksByURL[node.url+targetNode.url] = link;
						this.mediaLinks.push(link);
					}
				}
			}
		
			// if we're drawing from scratch, do some setup
			if (!updateOnly) {
			
				this.visualization.css('width', this.model.element.width());
				this.visualization.css('padding', '0px');
		
				var fullWidth = this.visualization.width();
				var fullHeight = this.visualization.height();
					
				this.mediavis = d3.select('#scalarvis').append('svg:svg')
					.attr('width', fullWidth)
					.attr('height', fullHeight);
					
				this.mediavis_pathLayer = this.mediavis.append('svg:g')
					.attr('width', fullWidth)
					.attr('height', fullHeight)
					.attr('class', 'pathLayer');
					
				this.mediavis_dotLayer = this.mediavis.append('svg:g')
					.attr('width', fullWidth)
					.attr('height', fullHeight)
					.attr('class', 'dotLayer');
					
				this.mediavis_textLayer = this.mediavis.append('svg:g')
					.attr('width', fullWidth)
					.attr('height', fullHeight)
					.attr('class', 'textLayer');
					
				this.drawLegend(this.mediavis, 10, fullHeight);
								
				// force-directed layout
				this.force = d3.layout.force()
					.nodes(this.mediaNodes)
					.links(this.mediaLinks)
					.linkDistance(60)
					.charge(-80)
					.size([fullWidth, fullHeight])
					.start();
					
			// if the vis is already set up, then
			} else {
							
				// update the force-directed layout's data
				this.force.nodes(this.mediaNodes)
					.links(this.mediaLinks)
					.start();
			
			}
			
			// update positions of the nodes and labels
			this.force.on('tick', function() {
				me.mediavis.selectAll('line.link')
					.attr('x1', function(d) { return d.source.x; })
					.attr('y1', function(d) { return d.source.y; })
					.attr('x2', function(d) { return d.target.x; })
					.attr('y2', function(d) { return d.target.y; });
					
				me.mediavis.selectAll('circle.node')
					.attr('cx', function(d) { return d.x; })
					.attr('cy', function(d) { return d.y; });
					
				me.mediavis.selectAll('text.label')
					.attr('x', function(d) { return d.x; })
					.attr('y', function(d) { { return d.y + 21; } })
			});
			
			// create the lines
			var lines = this.mediavis_pathLayer.selectAll('line.link')
				.data(this.mediaLinks);
				
			lines.enter().append('svg:line')
				.attr('class', 'link mediaFile')
				.attr('x1', function(d) { return d.source.x; })
				.attr('y1', function(d) { return d.source.y; })
				.attr('x2', function(d) { return d.target.x; })
				.attr('y2', function(d) { return d.target.y; })
				.attr('stroke-width', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? "3" : "1"; })
					.attr('stroke-opacity', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? '1.0' : '0.5'; })
					.attr('stroke', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? '#000' : '#999'; });
					
			lines.exit().remove();
				
			// create the dots
			var dots = this.mediavis_dotLayer.selectAll('circle.node')
				.data(this.mediaNodes);
				
			dots.enter().append('svg:circle')
				.attr('class', function(d) { return (d.type == 'media') ? 'node mediaFile' : 'node'; })
				.attr('cx', function(d) { return d.x; })
				.attr('cy', function(d) { return d.y; })
				.attr('r', '8')
				.attr('fill', function(d) { 
					var interpolator = d3.interpolateRgb(me.colorScale(d.type), d3.rgb(255,255,255));
					return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? interpolator(0) : interpolator(.5);
				 })
				.call(me.force.drag)
				.on('click', function(d) {
					var index = me.selectedNodes.indexOf(d.node);
					if (index == -1) {
						me.selectedNodes.push(d.node);
					} else {
						me.selectedNodes.splice(index, 1);
					}
				})
				.on("dblclick", function(d) { return self.location=d.node.url; })
				.on("mouseover", function(d) { 
					me.currentNode = d.node; 
					updateGraph();
				})
				.on("mouseout", function() { 
					me.currentNode = null; 
					updateGraph();
				});
				
			dots.exit().remove();
							
			// create the text labels
			var labels = this.mediavis_textLayer.selectAll('text.label')
				.data(this.mediaNodes);
				
			labels.enter().append('svg:text')
				.attr('class', 'label')
				.attr('x', function(d) { return d.x; })
				.attr('y', function(d) { return d.y + 21; })
				.attr('text-anchor', 'middle')
				.attr('fill-opacity', '0.0')
				.attr('opacity', '0.0')
				.text(function(d) { return d.shortTitle; });
				
			labels.exit().remove();
			
			var updateGraph = function() {
					
				lines.attr('stroke-width', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? "3" : "1"; })
					.attr('stroke-opacity', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? '1.0' : '0.5'; })
					.attr('stroke', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? me.colorScale('media') : '#999'; });
					
				dots.attr('fill', function(d) { 
						var interpolator = d3.interpolateRgb(me.colorScale(d.type), d3.rgb(255,255,255));
						return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? interpolator(0) : interpolator(.5);
					 });
			
			}
			
			// update visual elements per frame
			var perFrame = function() {
							
				labels.attr('fill', function(d) { return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? '#000' : '#999'; })
					.attr('opacity', function(d) {
						if ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) {
							return 1.0;
						} else if (me.currentNode) {
							return 0.0;
						} else {
							var dist = Math.sqrt(Math.pow(d.x - (me.mouseX - me.visualization.offset().left), 2) + Math.pow(d.y - (me.mouseY - me.visualization.offset().top), 2));
							return (1.0 - Math.min(150, dist) / 150.0);
						}
					 })
					.attr('fill-opacity', function(d) {
						if ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) {
							return 1.0;
						} else if (me.currentNode) {
							return 0.0;
						} else {
							var dist = Math.sqrt(Math.pow(d.x - (me.mouseX - me.visualization.offset().left), 2) + Math.pow(d.y - (me.mouseY - me.visualization.offset().top), 2));
							return (1.0 - Math.min(150, dist) / 150.0);
						}
					 })
					.attr('font-weight', function(d) { return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? 'bold' : 'normal'; })
					.text(function(d) { return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? d.node.getDisplayTitle( true ) : d.shortTitle; });
					
			}
		
			this.int = self.setInterval(perFrame, 100);
			
			updateGraph();
			
		}
		
		/**
		 * Draws the tags visualization.
		 *
		 * @param	updateOnly		If true, then the vis only needs to be updated, not built from scratch.
		 */
		jQuery.VisView.prototype.drawTagVisualization = function(updateOnly) {
			
			// if the user hasn't already made a selection, and either not all data has been loaded yet or we
			// haven't selected the current page yet, then see if we can find the node for the current page
			// and select it
			if ((this.selectedNodes.length == 0) && (!this.model.doneLoading || !this.hasSelectedCurrentContent)) {
				if (scalarapi.model.currentPageNode != null) {
					this.selectedNodes = [];
					if (!this.deselectedSelf) {	
						this.selectedNodes.push(scalarapi.model.currentPageNode);
					}
					if (this.model.doneLoading) {
						this.hasSelectedCurrentContent = true;
					}
				}
			}
			
			var i;
			var j;
			var n;
			var o;
			var node;
			var targetNode;
			var maxNodeChars = 15;
			
			// if we're drawing from scratch, wipe out the previous vis
			if (!updateOnly) {
				this.visualization.empty();
				this.instructions.html('<b>Tags and their relationships.</b> Deselect all items to show every tag in the book, otherwise only local tags are shown. Roll over the visualization to explore. Click to select; drag to move; double-click to view.');
			}
			
			// init our local model
			if (!this.tagNodesByURL) {
				this.tagNodesByURL = {};
				this.tagNodes = [];
				this.tagLinksByURL = {};
				this.tagLinks = [];
			}
							
			var link;
			var datum;
			var targetDatum;
			
			// build arrays of nodes and links which describe tags and their connections
			n = this.selectedNodes.length;
			for (i=0; i<n; i++) {
				node = this.selectedNodes[i];
				if (!this.tagNodesByURL[node.url]) {
					datum = {index:this.tagNodes.length, node:node, title:node.getDisplayTitle( true ), shortTitle:this.getShortenedString(node.getDisplayTitle( true ), maxNodeChars), type:node.getDominantScalarType().id};
					this.tagNodesByURL[node.url] = datum;
					this.tagNodes.push(datum);
				} else {
					datum = this.tagNodesByURL[node.url];
				}
			}
			
			// if something is selected, only render what's connected to it
			var rawTagNodes = scalarapi.model.getNodesWithProperty('scalarType', 'tag');
		
			// loop through all the tags
			n = rawTagNodes.length;
			for (i=0; i<n; i++) {
			
				// add each tag to the array of nodes
				node = rawTagNodes[i];
				if (!this.tagNodesByURL[node.url]) {
					datum = {index:this.tagNodes.length, node:node, title:node.getDisplayTitle( true ), shortTitle:this.getShortenedString(node.getDisplayTitle( true ), maxNodeChars), type:node.getDominantScalarType().id};
					this.tagNodesByURL[node.url] = datum;
					this.tagNodes.push(datum);
				} else {
					datum = this.tagNodesByURL[node.url];
				}
					
				
				// loop through all the nodes tagged by the tag
				var taggedNodes = node.getRelatedNodes('tag', 'outgoing');
				o = taggedNodes.length;
				for (j=0; j<o; j++) {
				
					// add them to the array of nodes
					targetNode = taggedNodes[j];
					if (!this.tagNodesByURL[targetNode.url]) {
						targetDatum = {index:this.tagNodes.length, node:targetNode, title:targetNode.getDisplayTitle( true ), shortTitle:this.getShortenedString(targetNode.getDisplayTitle( true ), maxNodeChars), type:targetNode.getDominantScalarType().id};
						this.tagNodesByURL[targetNode.url] = targetDatum;
						this.tagNodes.push(targetDatum);
					} else {
						targetDatum = this.tagNodesByURL[targetNode.url];
					}
					
					// add the link to the array of links
					if (!this.tagLinksByURL[node.url+targetNode.url]) {
						link = {source:datum.index, target:targetDatum.index, value:1};
						this.tagLinksByURL[node.url+targetNode.url] = link;
						this.tagLinks.push(link);
					}
				}

				// if something is selected, then those the nodes that tag this node as well
				var taggingNodes = node.getRelatedNodes('tag', 'incoming');
				if ((this.selectedNodes.length > 0) && (taggingNodes.length > 0)) {
					o = taggingNodes.length;
					for (j=0; j<o; j++) {
					
						// add them to the array of nodes
						targetNode = taggingNodes[j];
						if (!this.tagNodesByURL[targetNode.url]) {
							targetDatum = {index:this.tagNodes.length, node:targetNode, title:targetNode.getDisplayTitle( true ), shortTitle:this.getShortenedString(targetNode.getDisplayTitle( true ), maxNodeChars), type:targetNode.getDominantScalarType().id};
							this.tagNodesByURL[targetNode.url] = targetDatum;
							this.tagNodes.push(targetDatum);
						} else {
							targetDatum = this.tagNodesByURL[targetNode.url];
						}
						
						// add the link to the array of links
						if (!this.tagLinksByURL[targetNode.url+node.url]) {
							link = {source:datum.index, target:targetDatum.index, value:1};
							this.tagLinksByURL[targetNode.url+node.url] = link;
							this.tagLinks.push(link);
						}
					}
				}
			}
			
			// now, figure out which of those stored nodes we are actually going to show
			this.currentTagNodes = [];
			this.currentTagLinks = [];
			var source;
			var target;
			n = this.selectedNodes.length;
			for (i=0; i<n; i++) {
				this.currentTagNodes.push(this.tagNodesByURL[this.selectedNodes[i].url]);
			}
			n = this.tagLinks.length;
			for (i=0; i<n; i++) {
				link = this.tagLinks[i];
				var newLink = false;
				
				// d3 converts the link source and target from indexes to objects, but we may have
				// mixed types at this point, so we have to check for both
				if (typeof link.source == 'number') {
					datum = this.tagNodes[link.source];
				} else if (typeof link.source == 'object') {
					datum = link.source;
				}
				
				if (typeof link.target == 'number') { 
					targetDatum = this.tagNodes[link.target];
				} else if (typeof link.target == 'object') {
					targetDatum = link.target;
				}
				
				if ((this.selectedNodes.indexOf(datum.node) != -1) || (this.selectedNodes.indexOf(targetDatum.node) != -1)) newLink = true;
				
				if (newLink) {
					if (this.currentTagNodes.indexOf(datum) == -1) this.currentTagNodes.push(datum);
					if (this.currentTagNodes.indexOf(targetDatum) == -1) this.currentTagNodes.push(targetDatum);
					if (this.currentTagLinks.indexOf(link) == -1) {
						this.currentTagLinks.push(link);
					}
				}
				
			}
		
			// if we're drawing from scratch, do some setup
			if (!updateOnly) {
			
				this.visualization.css('width', this.model.element.width());
				this.visualization.css('padding', '0px');
		
				var fullWidth = this.visualization.width();
				var fullHeight = this.visualization.height();
					
				this.tagvis = d3.select('#scalarvis').append('svg:svg')
					.attr('width', fullWidth)
					.attr('height', fullHeight);
					
				this.tagvis_pathLayer = this.tagvis.append('svg:g')
					.attr('width', fullWidth)
					.attr('height', fullHeight)
					.attr('class', 'pathLayer');
					
				this.tagvis_dotLayer = this.tagvis.append('svg:g')
					.attr('width', fullWidth)
					.attr('height', fullHeight)
					.attr('class', 'dotLayer');
					
				this.tagvis_textLayer = this.tagvis.append('svg:g')
					.attr('width', fullWidth)
					.attr('height', fullHeight)
					.attr('class', 'textLayer');
					
				this.drawLegend(this.tagvis, 10, fullHeight);
								
				// force-directed layout
				this.force = d3.layout.force()
					.nodes((this.selectedNodes.length > 0) ? this.currentTagNodes : this.tagNodes)
					.links((this.selectedNodes.length > 0) ? this.currentTagLinks : this.tagLinks)
					.linkDistance(60)
					.charge(-80)
					.size([fullWidth, fullHeight])
					.start();
					
			// if the vis is already set up, then
			} else {
					
				// update the force-directed layout's data
				this.force.nodes((this.selectedNodes.length > 0) ? this.tagNodes : this.tagNodes) // modified here
					.links((this.selectedNodes.length > 0) ? this.currentTagLinks : this.tagLinks)
					.start();
			
			}		
					
			// update positions of the nodes and labels
			this.force.on('tick', function() {
				
				me.tagvis.selectAll('line.link')
					.attr('x1', function(d) { return d.source.x; })
					.attr('y1', function(d) { return d.source.y; })
					.attr('x2', function(d) { return d.target.x; })
					.attr('y2', function(d) { return d.target.y; });
					
				me.tagvis.selectAll('circle.node')
					.attr('cx', function(d) { return d.x; })
					.attr('cy', function(d) { return d.y; });
					
				me.tagvis.selectAll('text.label')
					.attr('x', function(d) { return d.x; })
					/*.attr('y', function(d) { return d.y + ((d.shortType == "tag") ? (8 + tagDotSize(d.outgoing.tag_of.length)) : 8) + 12; })*/
					.attr('y', function(d) { return d.y + 21; })
				
			});
			
			// create the lines
			var lines = this.tagvis_pathLayer.selectAll('line.link')
				.data((this.selectedNodes.length > 0) ? this.currentTagLinks : this.tagLinks);
				
			lines.enter().append('svg:line')
				.attr('class', 'link tag')
				.attr('x1', function(d) { return d.source.x; })
				.attr('y1', function(d) { return d.source.y; })
				.attr('x2', function(d) { return d.target.x; })
				.attr('y2', function(d) { return d.target.y; })
				.attr('stroke-width', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? "3" : "1"; })
				.attr('stroke-opacity', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? '1.0' : '0.5'; })
				.attr('stroke', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? '#ff8888' : '#999'; });
				
			lines.exit().remove();
				
			// create the dots
			var dots = this.tagvis_dotLayer.selectAll('circle.node')
				.data((this.selectedNodes.length > 0) ? this.currentTagNodes : this.tagNodes);
			
			dots.enter().append('svg:circle')
				.attr('class', function(d) { return (d.type == 'tag') ? 'node tag' : 'node'; })
				.attr('cx', function(d) { return d.x; })
				.attr('cy', function(d) { return d.y; })
				.attr('r', '8')
				.call(me.force.drag)
				.call(function(d) { 
					$(d).nodoubletapzoom(); 
				})
				.on('click', function(d) {
					me.lastClickedNode = d.node;
					var index = me.selectedNodes.indexOf(d.node);
					if (index == -1) {
						me.selectedNodes.push(d.node);
						if (d.node == scalarapi.model.currentPageNode) {
							me.deselectedSelf = false;
						}
					} else {
						me.selectedNodes.splice(index, 1);
						if (d.node == scalarapi.model.currentPageNode) {
							me.deselectedSelf = true;
						}
					}
					me.drawTagVisualization(true);
				})
				.on("dblclick", function(d) { 
					return self.location=me.lastClickedNode.url; 
				})
				.on("mouseover", function(d) { 
					me.currentNode = d.node;
					updateGraph();
				})
				.on("mouseout", function() { 
					me.currentNode = null;
					updateGraph();
				})
				.attr('fill', function(d) { 
					var interpolator = d3.interpolateRgb(me.colorScale(d.type), d3.rgb(255,255,255));
					return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? interpolator(0) : interpolator(.5);
				 });
				 
			dots.exit().remove();
				
			// create the text labels
			var labels = this.tagvis_textLayer.selectAll('text.label')
				.data((this.selectedNodes.length > 0) ? this.currentTagNodes : this.tagNodes);
				
			labels.enter().append('svg:text')
				.attr('class', 'label')
				.attr('x', function(d) { return d.x; })
				.attr('y', function(d) { return d.y + 21; })
				.attr('text-anchor', 'middle')
				.attr('opacity', '0.0')
				.text(function(d) { return d.shortTitle; });
				
			labels.exit().remove();
			
			var updateGraph = function() {
					
				me.tagvis_pathLayer.selectAll('line.link')
					.attr('stroke-width', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? "3" : "1"; })
					.attr('stroke-opacity', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? '1.0' : '0.5'; })
					.attr('stroke', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? me.colorScale('tag') : '#999'; });
					
				me.tagvis_dotLayer.selectAll('circle.node')
					.attr('fill', function(d) { 
						var interpolator = d3.interpolateRgb(me.colorScale(d.type), d3.rgb(255,255,255));
						return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? interpolator(0) : interpolator(.5);
					 });
			
			}
			
			// update visual elements per frame
			var perFrame = function() {
			
				me.tagvis_textLayer.selectAll('text.label')
					.attr('fill', function(d) { return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? "#000" :"#999"; })
					.attr('opacity', function(d) {
						if ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) {
							return 1.0;
						} else if (me.currentNode) {
							return 0.0;
						} else {
							var dist = Math.sqrt(Math.pow(d.x - (me.mouseX - me.visualization.offset().left), 2) + Math.pow(d.y - (me.mouseY - me.visualization.offset().top), 2));
							return (1.0 - Math.min(150, dist) / 150.0);
						}
					})
					.attr('font-weight', function(d) { return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? 'bold' : 'normal'; })
					.text(function(d) { return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? d.title : d.shortTitle; });
			}
		
			this.int = self.setInterval(perFrame, 200);
			
			updateGraph();
			
		}
		 
		/**
		 * Draws the radial visualization.
		 */
		jQuery.VisView.prototype.drawRadialVisualization = function() {
		
			// if the user hasn't already made a selection, and either not all data has been loaded yet or we
			// haven't selected the current page yet, then see if we can find the node for the current page
			// and select it
			if ((this.selectedNodes.length == 0) && (!this.model.doneLoading || !this.hasSelectedCurrentContent)) {
				node = scalarapi.model.currentPageNode;
				if (node != null) {
					this.selectedNodes = [node];
					if (this.model.doneLoading) {
						this.hasSelectedCurrentContent = true;
					}
				}
			}
			
			this.visualization.empty();
			this.visualization.css('padding', '10px');
			this.instructions.html('<b>All content and its relationships.</b> Roll over the visualization to explore. Click to expand an area or to select content to view its relationships; double-click content to view.');
			
			var maxNodeChars = 130 / 6;
			var node;
			
			var i;
			var j;
			var k;
			var n;
			var o;
			var p;
			
			// parse data into rows by type
			var types = {title:"root", children:[]};
			var nodes = [];
			var nodesByUrl = {};
			var selectedNodeData = [];
			var selectedNodeLabels = [];
			var indexType;
			var count;
			var node;
			var child;
			var anglePerNode = 360 / scalarapi.model.nodes.length;
			var groupAngle = 10;
			var minAngle = 1;
			var minChordAngle = .02;
			var typedNodes;
			
			// loop through each type
			for (i=0; i<this.indexTypeOrder.length; i++) {
				indexType = this.indexTypeOrder[i];
				
				typedNodes = scalarapi.model.getNodesWithProperty('scalarType', indexType.id, 'alphabetical');
				
				// if we have nodes of that type, then
				if (typedNodes.length > 0) {
					
					// these are the top-level type nodes
					node = {title:indexType.name, type:indexType.id, isTopLevel:true, index:types.length, size:1, parent:types, maximizedAngle:360, children:[], descendantCount:typedNodes.length};
					types.children.push(node);
					
					// recursively assign children to the node
					node.children = setChildren(node, typedNodes);
					
				}
			}
			
			/**
			 * Recursive function for assigning children, grandchildren, etc. to the top-level nodes based on density.
			 */
			function setChildren(curNode, childNodes) {
			
				var j;
				var n = childNodes.length;
				var curChildren = [];
				var curChild;
				
				// how big a node gets when maximized -- the smaller of the number of children * 15¡, or 270¡ total
				var maximizedAngle = Math.min(270, (n * 15));
				
				// maximized angle of each child
				var localAnglePerNode = curNode.maximizedAngle / n;
				
				// groups can't be smaller than the groupAngle (10¡) -- so figure out how many children
				// need to be in each group for that to be true
				var nodesPerGroup = Math.ceil(groupAngle / anglePerNode);
				
				// if the children of this segment, when maximized, will still be below a certain angle threshold, then
				// we need to make sub-groups for them
				if (localAnglePerNode < 5) {
					
					// how many sub-groups will this node have?
					var groupCount = Math.ceil(n / nodesPerGroup);
					
					// split this group into as many sub-groups as needed so that each group is the group angle with maximized parent.
					for (j=0; j<groupCount; j++) {
					
						curChild = {title:curNode.title+'_group'+j, type:indexType.id, isTopLevel:false, parent:curNode, maximizedAngle:maximizedAngle, children:[]};
						
						// if the next group will have less than the targeted number of children, combine it with the current group
						if ((n - ((j + 1) * nodesPerGroup)) < nodesPerGroup) {
							curChild.children = setChildren(curChild, childNodes.slice(j * nodesPerGroup));
							j++;
							
						} else {
							var descendants = childNodes.slice(j * nodesPerGroup, (j + 1) * nodesPerGroup);
							curChild.children = setChildren(curChild, descendants);
						}
						
						curChild.descendantCount = descendants.length;
						curChildren.push(curChild);
					}
					
				// otherwise, if there are enough children to fit in the group comfortably, then those
				// children will be the end of the line; no sub-groups need to be created
				} else {
					for (j=0; j<n; j++) {
						curChild = {title:childNodes[j].getDisplayTitle( true ), shortTitle:me.getShortenedString(childNodes[j].getDisplayTitle( true ), maxNodeChars), type:indexType.id, isTopLevel:false, node:childNodes[j], parent:curNode};
						/*if (childNodes[j].current) {
							curChild = {title:childNodes[j].current.title, shortTitle:me.getShortenedString(childNodes[j].current.title, maxNodeChars), type:indexType.id, isTopLevel:false, node:childNodes[j], parent:curNode};
						} else {
							curChild = {title:childNodes[j].title, shortTitle:me.getShortenedString(childNodes[j].title, maxNodeChars), type:indexType.id, isTopLevel:false, node:childNodes[j], parent:curNode};
						}*/
						curChildren.push(curChild);
						if (me.selectedNodes.indexOf(childNodes[j]) != -1) {
							selectedNodeData.push(curChild);
						}
						nodesByUrl[curChild.node.url] = curChild;
						nodes.push(curChild);
					}
				}
				
				return curChildren;
			}
			
			var maximizedNode = null;
			var highlightedNode = null;
			
			/**
			 * Returns true if the given node has the candidate node as an ancestor.
			 */
			function hasNodeAsAncestor(self, candidate) {
				while ((self.parent != null) && (self.parent != candidate)) {
					self = self.parent;
				}
				return ((self.parent == candidate) && (candidate != null));
			}
			
			this.visualization.css('width', this.model.element.width());
			this.visualization.css('padding', '0px');
			var fullWidth = this.visualization.width();
			var fullHeight = this.visualization.height();
			
			var myModPercentage = 1;		// relative value of the farthest descendants maximized item
			var otherModPercentage = 1;		// relative value of the farthest descendants of the not-maximized item
			
			var r = Math.min(fullWidth, fullHeight) / 2 - 60;
			var radiusMod = 1.55;
			var textRadiusOffset = 10;
			
			// rollover label
			var rollover = $('<div class="rollover">Test</div>').appendTo('#scalarvis');
			$('#scalarvis').mousemove(function(e) {
				rollover.css('left', (e.pageX-$(this).offset().left+parseInt($(this).parent().parent().css('padding-left'))+10)+'px');
				rollover.css('top', (e.pageY-$(this).parent().parent().offset().top)+15+'px');
			})
				
			// create visualization base element
			var root = d3.select('#scalarvis').append('svg:svg')
				.attr('width', fullWidth)
				.attr('height', fullHeight);
				
			var vis = root.append("svg:g")
     			.attr("transform", "translate(" + fullWidth / 2 + "," + fullHeight / 2 + ")");
				
			// create canvas
			var canvas = vis.append('svg:rect')
				.attr('width', fullWidth)
				.attr('height', fullHeight)
				.attr('class', 'viscanvas');
				
			this.radialBaseLayer = root.append('svg:g')
				.attr('width', fullWidth)
				.attr('height', fullHeight);
				
			this.drawLegend(this.radialBaseLayer, 10, fullHeight);
				
			// arc generator
			var arcs = d3.svg.arc()
    			.startAngle(function(d) { return d.x - (Math.PI * .5); })
     			.endAngle(function(d) { return d.x + d.dx - (Math.PI * .5); })
     			.innerRadius(function(d) { return (r * radiusMod) - Math.sqrt(d.y); })
    			.outerRadius(function(d) { return (r * radiusMod) - 	Math.sqrt(d.y + d.dy); });
				
			// layout which drives the arc display
			var partition = d3.layout.partition()
				.sort(null)
				.size([Math.PI * 2, r * r])
				
				// returns the relative value for a given node d
				.value(function(d) {
				
					// if a node is currently maximized, then
					if (maximizedNode) {
					
						// if the maximized node is a top-level node, and this node is a bottom-level node, then
						if ((maximizedNode.children != null) && (d.depth >= 2) && (d.children == null)) {
						
							// if the maximized node is an ancestor of this node, then return its maximized value
							if (hasNodeAsAncestor(d, maximizedNode)) {
								return myModPercentage;
								
							// otherwise, return its minimized value
							} else {
								return otherModPercentage;
							}
						
						// otherwise, just return the standard value
						} else {
							return 1;
						}
						
					// return the standard value
					} else {
						return 1;
					}
				});
				
			// create the arcs
			var path = vis.data([types]).selectAll('path')
				.data(partition.nodes);
				
			path.enter().append('svg:path')
				.attr('class', 'ring')
				.attr('d', arcs)
				.style("stroke-width", function(d) { return (d.dx > minChordAngle) ? 1 : 0; })
				.style("stroke", 'white')
				.attr('cursor', 'pointer')
				.attr("display", function(d) { return d.depth ? null : "none"; })
				.style('fill', function(d, i) { return me.colorScale(d.type); } )
				.each(function(d) { d.centroid = arcs.centroid(d); })
				.each(stash)
				
				// roll over a node
				.on('mouseover', function(d) { 
					highlightedNode = d;
					updateHighlights(d);
				})
				
				// roll off of a node
				.on('mouseout', function(d) { 
					if (highlightedNode == d) {
						highlightedNode = null;
						updateHighlights(d);
					}
				})
				
				// double-click a node
				.on("dblclick", function(d) {
					if (d.node) {
						return self.location = d.node.url;
					}
				})
				
				// click on a node
				.on('click', function(d) {
				
		    		var dx = arcs.centroid(d)[0];
		    		var dy = arcs.centroid(d)[1];
		    		var hw = fullWidth * .5;
				
					// if the node was maximized, normalize it
					if (maximizedNode == d) {
					
						maximizedNode = null;
						
						// return the vis to its normalized state
						path.data(partition.nodes).transition()
							.duration(1000)
							.style("stroke-width", function(d) { return (d.dx > minChordAngle) ? 1 : 0; })
							.attrTween('d', arcTween);
						vis.selectAll('path.chord').transition()
							.duration(1000)
							.attr('display', function(d) { return (d.source.dx > minChordAngle) ? null : 'none'; })
							.attrTween('d', chordTween);
					    vis.selectAll('text.typeLabel').transition()
					    	.duration(1000)
					    	.attrTween('dx', textDxTween)
					    	.attrTween('text-anchor', textAnchorTween)
					    	.attrTween('transform', textTransformTween);
					    vis.selectAll('text.selectedLabel').transition()
					    	.duration(1000)
					    	.attr('dx', function(d) {
					    	if (arcs.centroid(d)[0] < 0) {
					    			return -(fullWidth * .5) + 120;
					    		} else {
					    			return (fullWidth * .5) - 120;
					    		}
					    	})
					    	.attr('dy', function(d) { return arcs.centroid(d)[1] + 4; })
					        .attr('text-anchor', function(d) {
					    		if (arcs.centroid(d)[0] < 0) {
					    			return 'end';
					    		} else {
					    			return null;
					    		}
					        })
					    	.each('end', function(d) { updateSelectedLabels() });
					    vis.selectAll('polyline.selectedPointer').transition()
					    		.duration(1000)
					    		.attr('points', function(d) {
						    		var dx = arcs.centroid(d)[0];
						    		var dy = arcs.centroid(d)[1];
						    		if (arcs.centroid(d)[0] < 0) {
						    			return (125-hw)+','+dy+' '+(135-hw)+','+dy+' '+dx+','+dy;
						    		} else {
						    			return (hw-125)+','+dy+' '+(hw-135)+','+dy+' '+dx+','+dy;
						    		}
						    	});
					    	
					} else {
						
						// if the node has children, then maximize it and transition the vis to its maximized state
						if (d.children != null) {
					
							maximizedNode = d;
						
							var numChildren = d.descendantCount;
							var curPercentage = numChildren / nodes.length;
							var targetPercentage = Math.min(.75, (numChildren * 15) / 360);
							
							// set the relative values of the farthest descendants of the maximized and non-maximized nodes
							myModPercentage = targetPercentage / curPercentage;
							otherModPercentage = (1 - targetPercentage) / (1 - curPercentage);
							
							path.data(partition.nodes).transition()
								.duration(1000)
								.style("stroke-width", function(d) { return (d.dx > minChordAngle) ? 1 : 0; })
								.attrTween('d', arcTween);
							vis.selectAll('path.chord').transition()
								.duration(1000)
								.attr('display', function(d) { return ((d.source.dx > minChordAngle) || (d.target.dx > minChordAngle)) ? null : 'none'; })
								.attrTween('d', chordTween);
						    vis.selectAll('text.typeLabel').transition()
						    	.duration(1000)
						    	.attrTween('dx', textDxTween)
						    	.attrTween('text-anchor', textAnchorTween)
						    	.attrTween('transform', textTransformTween);
						    vis.selectAll('text.selectedLabel').transition()
						    	.duration(1000)
						    	.attr('dx', function(d) {
						    	if (arcs.centroid(d)[0] < 0) {
						    			return -(fullWidth * .5) + 120;
						    		} else {
						    			return (fullWidth * .5) - 120;
						    		}
						    	})
					    		.attr('dy', function(d) { return arcs.centroid(d)[1] + 4; })
						        .attr('text-anchor', function(d) {
						    		if (arcs.centroid(d)[0] < 0) {
						    			return 'end';
						    		} else {
						    			return null;
						    		}
						        })
					    		.each('end', function(d) { updateSelectedLabels() });
						    vis.selectAll('polyline.selectedPointer').transition()
						    		.duration(1000)
						    		.attr('points', function(d) {
							    		var dx = arcs.centroid(d)[0];
							    		var dy = arcs.centroid(d)[1];
							    		if (arcs.centroid(d)[0] < 0) {
							    			return (125-hw)+','+dy+' '+(135-hw)+','+dy+' '+dx+','+dy;
							    		} else {
							    			return (hw-125)+','+dy+' '+(hw-135)+','+dy+' '+dx+','+dy;
							    		}
							    	});
						    	
						} else {
							toggleNodeSelected(d);
						}
					}
				});
				
			path.exit().remove();
			
			
			/**
			 * Selects the given node data.
			 */
			function toggleNodeSelected(d) {
				var index;
				index = me.selectedNodes.indexOf(d.node);
				if (index == -1) {
					me.selectedNodes.push(d.node);
					index = selectedNodeData.indexOf(d);
					if (index == -1) {
						selectedNodeData.push(d);
					}
				} else {
					me.selectedNodes.splice(index, 1);
					index = selectedNodeData.indexOf(d);
					if (index != -1) {
						selectedNodeData.splice(index, 1);
					}
				}
				updateSelectedLabels();
				updateHighlights(d);
			}
			
			/**
			 * Updates the display of labels for selected nodes.
			 */
			function updateSelectedLabels() {
			
			    var selectedLabels = vis.selectAll('text.selectedLabel').data(selectedNodeData);
			    
			    selectedLabels.enter().append('svg:text')
			    	.attr('class', 'selectedLabel')
			    	.attr('dx', function(d) {
			    	if (arcs.centroid(d)[0] < 0) {
			    			return -(fullWidth * .5) + 120;
			    		} else {
			    			return (fullWidth * .5) - 120;
			    		}
			    	})
			    	.attr('dy', function(d) {
			    		return arcs.centroid(d)[1] + 4;
			    	})
			    	.attr('fill', '#444')
			    	.attr('font-weight', 'bold')
			        .attr('text-anchor', function(d) {
			    		if (arcs.centroid(d)[0] < 0) {
			    			return 'end';
			    		} else {
			    			return null;
			    		}
			        })
			        .text(function(d) { return d.shortTitle; });

				selectedLabels.exit().remove();
				
				selectedLabels.attr('dx', function(d) {
			    	if (arcs.centroid(d)[0] < 0) {
			    			return -(fullWidth * .5) + 120;
			    		} else {
			    			return (fullWidth * .5) - 120;
			    		}
			    	})
					.attr('dy', function(d) {
			    		return arcs.centroid(d)[1] + 4;
			    	})
			        .attr('text-anchor', function(d) {
			    		if (arcs.centroid(d)[0] < 0) {
			    			return 'end';
			    		} else {
			    			return null;
			    		}
			        })
			        .text(function(d) { return d.shortTitle; });
			    	
			    var selectedPointers = vis.selectAll('polyline.selectedPointer').data(selectedNodeData);
			    
			    selectedPointers.enter().append('svg:polyline')
			    	.attr('class', 'selectedPointer')
			    	.attr('points', function(d) {
			    		var dx = arcs.centroid(d)[0];
			    		var dy = arcs.centroid(d)[1];
			    		var hw = fullWidth * .5;
			    		if (arcs.centroid(d)[0] < 0) {
			    			return (125-hw)+','+dy+' '+(135-hw)+','+dy+' '+dx+','+dy;
			    		} else {
			    			return (hw-125)+','+dy+' '+(hw-135)+','+dy+' '+dx+','+dy;
			    		}
			    	})
			    	.attr('stroke','#444')
			    	.attr('stroke-width',1);
			    	
			    selectedPointers.exit().remove();
			    
			    selectedPointers.attr('points', function(d) {
			    		var dx = arcs.centroid(d)[0];
			    		var dy = arcs.centroid(d)[1];
			    		var hw = fullWidth * .5;
			    		if (arcs.centroid(d)[0] < 0) {
			    			return (125-hw)+','+dy+' '+(135-hw)+','+dy+' '+dx+','+dy;
			    		} else {
			    			return (hw-125)+','+dy+' '+(hw-135)+','+dy+' '+dx+','+dy;
			    		}
			    	});

			}
			
			/**
			 * Update the highlight elements.
			 */
			function updateHighlights(d) {
			
				// show the rollover label if this item has no children, i.e. is a single content item, not a parent
				if (highlightedNode && (highlightedNode.children == null)) {
					rollover.html(d.title);
					rollover.css('display', 'block');
				
				// otherwise, hide the rollover label
				} else {
					rollover.css('display', 'none');
				}
				
				// darken the arcs of the rolled-over node and its descendants
				vis.selectAll('path.ring')
					.data(partition.nodes)
					.style('fill', function(d) {
						return ((d == highlightedNode) || (hasNodeAsAncestor(d, highlightedNode)) || (me.selectedNodes.indexOf(d.node) != -1)) ? d3.rgb(me.colorScale(d.type)).darker() : me.colorScale(d.type);
					})
					
				// darken the chords connected to the rolled-over node
				vis.selectAll('path.chord')
					.attr('opacity', function(d) {
						return ((d.source == highlightedNode) || (d.target == highlightedNode) || (hasNodeAsAncestor(d.source, highlightedNode)) || (hasNodeAsAncestor(d.target, highlightedNode)) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? .75 : (((highlightedNode == null) && (me.selectedNodes.length == 0)) ? .25 : 0);
					});
			} 
				
			var linkedNodes = [];
			var srcNode;
			var destNode;
			var relatedNodes;
			var index;
			var links = [];
			
			var linkSpecs = [
				{type:'referee', direction:'incoming'},
				{type:'annotation', direction:'outgoing'},
				{type:'tag', direction:'outgoing'},
				{type:'comment', direction:'outgoing'},
				{type:'path', direction:'outgoing'},
			];
				
			// parse all of the links between nodes so they can be used to draw chords
			n = nodes.length;
			for (i=0; i<n; i++) {
				srcNode = nodes[i];
				p = linkSpecs.length;
				for (k=0; k<p; k++) {
					relatedNodes = srcNode.node.getRelatedNodes(linkSpecs[k].type, linkSpecs[k].direction);
					o = relatedNodes.length;
					for (j=0; j<o; j++) {
						destNode = nodesByUrl[relatedNodes[j].url];
						links.push({source:srcNode, target:destNode});
					}
				}
			}
			
			// chord generator
			var chords = d3.svg.chord()
    			.startAngle(function(d) { return d.x - (Math.PI * .5); })
     			.endAngle(function(d) { return d.x + d.dx - (Math.PI * .5); })
				.radius(function(d) { return (r * radiusMod) - Math.sqrt(d.y + d.dy); });
			
			// create the chords
			var chordvis = vis.selectAll('path.chord').data(links);
			
			chordvis.enter().append('svg:path')
				.attr('class', 'chord')
				.attr('d', function(d) { return chords(d); })
				.attr('opacity', .25)
				.attr('display', function(d) { return ((d.source.dx > minChordAngle) || (d.target.dx > minChordAngle)) ? null : 'none'; })
				.attr('fill', function(d) { return me.colorScale(d.source.type); })
				.each(stashChord);
				
			chordvis.exit().remove();

			// create the type labels		    
		    var labels = vis.selectAll('text.typeLabel').data(types.children);
		    
		    labels.enter().append('svg:text')
		    	.attr('class', 'typeLabel')
		    	.attr('dx', function(d) { 
		    		d.angle = (((d.x+(d.dx*.5))/(Math.PI*2))*360-180);
		    		d.isFlipped = ((d.angle > 90) || (d.angle < -90));
		    		return d.isFlipped ? -10 : 10; 
		    	})
		    	.attr('dy', '.35em')
		    	.attr('fill', '#aaa')
		    	.attr('text-anchor', function(d) {
		    		return d.isFlipped ? 'end' : null; 
		    	})
		    	.attr('transform', function(d) {
		    		d.amount = r + textRadiusOffset;
				    if (d.isFlipped) {
		    			d.angle += 180;
		    			d.amount *= -1;
		    		}
		    		return 'rotate('+d.angle+') translate('+d.amount+',0) '; 
		    	})
		    	.text(function(d) { return d.title; });
		    	
		    labels.exit().remove();
		    
		    updateSelectedLabels();
		    updateHighlights();
				
			// store current arc data for use in transitions
			function stash(d) {
				d.x0 = d.x;
				d.dx0 = d.dx;
			}
			
			// store current chord data for use in transitions
			function stashChord(d) {
				d.source0 = {x:d.source.x, dx:d.source.dx};
				d.target0 = {x:d.target.x, dx:d.target.dx};
			}
			
			// interpolates between path data for two arcs
			function arcTween(a) {
				var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
				return function(t) {
					var b = i(t);
					a.x0 = b.x;
					a.dx0 = b.dx;
					return arcs(b);
				};
			}
			
			// interpolates between path data for two chords
			function chordTween(a) {
				var i = d3.interpolate({source: {x:a.source0.x, dx:a.source0.dx}, target: {x:a.target0.x, dx:a.target0.dx}}, a);
				return function(t) {
					var b = i(t);
					a.source0 = {x:b.source.x, dx:b.source.dx};
					a.target0 ={x:b.target.x, dx:b.target.dx};
					return chords(b);
				};
			}
			
			// calculates the position of a type label
			function calcTextDx(d) {
	    		d.angle = (((d.x+(d.dx*.5))/(Math.PI*2))*360-180);
	    		d.isFlipped = ((d.angle > 90) || (d.angle < -90));
	    		return d.isFlipped ? -10 : 10; 
			}
			
			// calculates the anchor point of a type label
			function calcTextAnchor(d) {
	    		d.angle = (((d.x+(d.dx*.5))/(Math.PI*2))*360-180);
	    		d.isFlipped = ((d.angle > 90) || (d.angle < -90));
		    	return d.isFlipped ? 'end' : null; 
			}
			
			// calculates the transform (rotation) of a type label
			function calcTextTransform(d) {
	    		d.angle = (((d.x+(d.dx*.5))/(Math.PI*2))*360-180);
	    		d.isFlipped = ((d.angle > 90) || (d.angle < -90));
	    		d.amount = r + textRadiusOffset;
			    if (d.isFlipped) {
	    			d.angle += 180;
	    			d.amount *= -1;
	    		}
	    		return 'rotate('+d.angle+') translate('+d.amount+',0) '; 
			}
			
			// interpolates between position data for two type labels			
			function textDxTween(a) {
				var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
				return function(t) {
					var b = i(t);
					a.x0 = b.x;
					a.dx0 = b.dx;
					return calcTextDx(b);
				};
			}
			
			// interpolates between anchor point data for two type labels			
			function textAnchorTween(a) {
				var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
				return function(t) {
					var b = i(t);
					a.x0 = b.x;
					a.dx0 = b.dx;
					return calcTextAnchor(b);
				};
			}
			
			// interpolates between transform data for two type labels			
			function textTransformTween(a) {
				var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
				return function(t) {
					var b = i(t);
					a.x0 = b.x;
					a.dx0 = b.dx;
					return calcTextTransform(b);
				};
			}
			
		}
		 
		/**
		 * Draws the index visualization (D3 version).
		 */
		jQuery.VisView.prototype.drawIndexVisualization = function() {
			
			// if the user hasn't already made a selection, and either not all data has been loaded yet or we
			// haven't selected the current page yet, then see if we can find the node for the current page
			// and select it
			if ((this.selectedNodes.length == 0) && (!this.model.doneLoading || !this.hasSelectedCurrentContent)) {
				node = scalarapi.model.currentPageNode;
				if (node != null) {
					this.selectedNodes = [node];
					if (this.model.doneLoading) {
						this.hasSelectedCurrentContent = true;
					}
				}
			}
			
			this.visualization.empty();
			this.visualization.css('padding', '10px');
			this.instructions.html('<b>All content, sorted by type.</b> Roll over the visualization to explore. Darker colors indicate more connections. Click to select content and view its relationships; double-click to view.');
			this.leftMargin = 0;
			this.rightMargin = 0;
			
			var i;
			var j;
			var k;
			var n;
			var o;
		
			var colWidth = 36;
			var fullWidth = Math.max(this.model.element.width() * this.scaleFactorH - (this.leftMargin + this.rightMargin), ((this.model.maxNodesPerType + 1) * colWidth) - (this.leftMargin + this.rightMargin));
			var colScale = d3.scale.linear()
				.domain([0, this.model.maxNodesPerType])
				.range([0, this.model.maxNodesPerType * colWidth]);
			var unitWidth = Math.max(colScale(1) - colScale(0), 36);
			
			// parse data into rows by type
			var row;
			var rows = [];
			var rowCounter = 0;
			var indexType;
			var itemsPerRow = Math.floor((this.model.element.width() - 20 - this.leftMargin - this.rightMargin) / unitWidth);
			var typedNodes;
			var rowItems;
			var node;
			var datum;
			
			if (!this.indexNodesByURL) {
				this.indexNodesByURL = {};
			}
			
			// sort nodes by type, and then alphabetically
			var sortedNodes = scalarapi.model.nodes.concat();
			sortedNodes.sort(function(a,b) {
				var idSortA = me.indexTypeStrings.indexOf(a.getDominantScalarType().singular);
				var idSortB = me.indexTypeStrings.indexOf(b.getDominantScalarType().singular);
				if (a.current && b.current) {
					var alphaSort = 0;
					if (idSortA < idSortB) {
						return -1;
					} else if (idSortA > idSortB) {
						return 1;
					} else if (a.getSortTitle() < b.getSortTitle()) {
						return -1;
					} else if (a.getSortTitle() > b.getSortTitle()) {
						return 1;
					} else {
						return 0;
					}
				} else {
					return idSortA - idSortB;
				}
			})
			
			// count connections for each node so we can adjust opacity accordingly,
			// cull null nodes
			var maxConnections = 0.0;
			var n = sortedNodes.length;
			for (i=n-1; i>=0; i--) {
				node = sortedNodes[i];
				if (node) {
					maxConnections = Math.max(maxConnections, (node.outgoingRelations ? node.outgoingRelations.length : 0) + (node.incomingRelations ? node.incomingRelations.length : 0));
				} else {
					sortedNodes.splice(i, 1);
				}
			}
			maxConnections++;
				
			// build rows of nodes
			n = sortedNodes.length;
			row = {index:rows.length, name:'', data:[]};
			for (j=0; j<n; j++) {
			
				if (row.data.length >= itemsPerRow) {
					rows.push(row);
					row = {index:rows.length, name:'', data:[]};
				}
				
				node = sortedNodes[j];
				
				// non-page/media nodes don't have anything in their 'current' property
				datum = {title:node.getDisplayTitle( true ), shortTitle:this.getShortenedString(node.getDisplayTitle( true ), 20), node:node, row:rows.length, column:row.data.length};
				row.data.push(datum);
				/*if (node.current) {
					datum = {title:node.current.title, shortTitle:this.getShortenedString(node.current.title, 20), node:node, row:rows.length, column:row.data.length};
					row.data.push(datum);
				} else {
					datum = {title:node.title, shortTitle:this.getShortenedString(node.title, 20), node:node, row:rows.length, column:row.data.length};
					if (node.scalarTypes.person) {
						row.data.push(datum);
					}
				}*/
				
				// store info for new node
				if (!this.indexNodesByURL[node.url]) {
					this.indexNodesByURL[node.url] = datum;
					
				// or update info for a node we already know about
				} else if ((node.current) || node.scalarTypes.person) {
					this.indexNodesByURL[node.url].row = rows.length;
					this.indexNodesByURL[node.url].column = row.data.length - 1;
				}
			
			}
			rows.push(row);
						
			var visHeight = rows.length * 46;
			var visWidth = this.model.element.width();
			var rowScale = d3.scale.linear()
				.domain([0, rows.length])
				.range([0, visHeight]);
			var unitHeight = rowScale(1) - rowScale(0);
			var fullHeight = unitHeight * rows.length + 20 + (14 * this.indexTypeOrder.length);
			var maxNodeChars = unitWidth / 7;
			var node;
			
			this.visualization.css('width', this.model.element.width() - 20); // accounts for padding
					
			this.indexvis = d3.select('#scalarvis').append('svg:svg')
				.attr('width', visWidth)
				.attr('height', fullHeight);
					
			// holds squares
			this.indexvis_boxLayer = this.indexvis.append('svg:g')
				.attr('width', visWidth)
				.attr('height', fullHeight)
				.attr('class', 'boxlayer');
					
			// holds lines for paths
			this.indexvis_pathLayer = this.indexvis.append('svg:g')
				.attr('width', visWidth)
				.attr('height', fullHeight)
				.attr('class', 'pathLayer');
					
			// holds all other drawn connections between nodes
			this.indexvis_linkLayer = this.indexvis.append('svg:g')
				.attr('width', visWidth)
				.attr('height', fullHeight)
				.attr('class', 'linkLayer');
				
			this.drawLegend(this.indexvis_boxLayer, 0, fullHeight);
				
			var url;
			var pathData;
			
			var boxSize = 36;
			
			// loop through the rows
			for (i=0; i<rows.length; i++) {
				row = rows[i];
				
				// draw squares
				this.indexvis_boxLayer.selectAll('rect.row'+i)
					.data(row.data)
					.enter().append('svg:rect')
					.attr('class', 'rowBox row'+i)
					.attr('x', function(d,n) { return me.leftMargin + colScale(n) + 0.5; })
					.attr('y', rowScale(i+1) - boxSize + 0.5)
					.attr('width', boxSize)
					.attr('height', boxSize)
					.attr('stroke', '#000')
					.style('cursor', 'pointer')
					.attr('stroke-opacity', '.2')
					.attr('fill-opacity', function(d) {
						return .1 + ((((d.node.outgoingRelations ? d.node.outgoingRelations.length : 0) + (d.node.incomingRelations ? d.node.incomingRelations.length : 0) + 1) / maxConnections) * .9);
					})
					.attr('fill', function(d) {
						return me.colorScale(d.node.getDominantScalarType().singular);
					})
					.on("mouseover", function(d) { 
						me.currentNode = d.node;
						perFrame();
					})
					.on("mouseout", function() { 
						me.currentNode = null; 
						perFrame();
					})
					.on("click", function(d) { 
						var index = me.selectedNodes.indexOf(d.node);
						if (index == -1) {
							me.selectedNodes.push(d.node);
						} else {
							me.selectedNodes.splice(index, 1);
						}
						perFrame();
						return true;
					})
					.on("dblclick", function(d) { return self.location=d.node.url; });
				
			}
			
			var activeNodes;
			var linkGroup;
			var linkEnter;
			var infoBoxes;
			
			// called whenever we need to update something, not literally every frame
			var perFrame = function() {
			
				// get all highlighted nodes
				if (me.currentNode && (me.selectedNodes.indexOf(me.currentNode) == -1)) {
					activeNodes = me.selectedNodes.concat([me.currentNode]);
				} else {
					activeNodes = me.selectedNodes.concat();
				}
				
				linkGroup = me.indexvis_linkLayer.data(activeNodes);
			
				// loop through the rows and update box fills
				for (i=0; i<rows.length; i++) {
					row = rows[i];
				
					me.indexvis_boxLayer.selectAll('rect.row'+i)
						.attr('fill', function(d) { return (me.currentNode == d.node) ? d3.rgb(me.colorScale(d.node.getDominantScalarType().singular)).darker() : me.colorScale(d.node.getDominantScalarType().singular); });
					
				}
				
				// turn on/off path lines
				me.indexvis_pathLayer.selectAll('g.pathGroup')
					.attr('visibility', function(d) { 
						return ((me.currentNode == d[0]) || (me.selectedNodes.indexOf(d[0]) != -1)) ? 'visible' : 'hidden'; 
					});
				
				// draw info boxes for selected/highlighted nodes
				infoBoxes = d3.select('#scalarvis').selectAll('div.info_box')
					.data(activeNodes);
					
				infoBoxes.enter().append('div')
					.attr('class', 'info_box')
					.style('left', function(d) { return ($('#scalarvis').position().left + 10 + me.leftMargin + colScale(me.indexNodesByURL[d.url].column) + (boxSize * .5))+'px'; })
					.style('top', function(d) { return ($('#scalarvis').position().top - 10 + rowScale(me.indexNodesByURL[d.url].row + 2) - (boxSize * .5))+'px'; });
					
				infoBoxes.style('left', function(d) { return ($('#scalarvis').position().left + 10 + me.leftMargin + colScale(me.indexNodesByURL[d.url].column) + (boxSize * .5))+'px'; })
					.style('top', function(d) { return ($('#scalarvis').position().top - 10 + rowScale(me.indexNodesByURL[d.url].row + 2) - (boxSize * .5))+'px'; })
					.html(me.nodeInfoBox);
					
				infoBoxes.exit().remove();
				
				// connections
				linkGroup = me.indexvis_linkLayer.selectAll('g.linkGroup')
					.data(activeNodes);
				
				// create a container group for each node's connections
				linkEnter = linkGroup
					.enter().append('g')
					.attr('width', visWidth)
					.attr('height', unitHeight * rows.length + 20)
					.attr('class', 'linkGroup')
					.attr('pointer-events', 'none');
					
				linkGroup.exit().remove();
					
				// draw connection lines
				linkEnter.selectAll('line.connection')
					.data(function (d) { 
						var relationArr = [];
						var relations = d.outgoingRelations.concat(d.incomingRelations);
						var relation;
						var i;
						var n = relations.length;
						for (i=0; i<n; i++) {
							relation = relations[i];
							if ((relation.type.id != 'path') && relation.body.current && relation.target.current) {
								relationArr.push(relations[i]);
							}
						}
						return relationArr;
					})
					.enter().append('line')
					.attr('class', 'connection')
					.attr('x1', function(d) { return me.leftMargin + colScale(me.indexNodesByURL[d.body.url].column) + (boxSize * .5); })
					.attr('y1', function(d) { return rowScale(me.indexNodesByURL[d.body.url].row + 1) - (boxSize * .5); })
					.attr('x2', function(d) { return me.leftMargin + colScale(me.indexNodesByURL[d.target.url].column) + (boxSize * .5); })
					.attr('y2', function(d) { return rowScale(me.indexNodesByURL[d.target.url].row + 1) - (boxSize * .5); })
					.attr('stroke-width', 1)
					.attr('stroke-dasharray', '1,2')
					.attr('stroke', function(d) { return me.colorScale((d.type.id == 'referee') ? 'media' : d.type.id); });
						
				// draw connection dots
				linkEnter.selectAll('circle.connectionDot'+i)
					.data(function (d) { 
						var nodeArr = [];
						var relations = d.outgoingRelations.concat(d.incomingRelations);
						var relation;
						var i;
						var n = relations.length;
						for (i=0; i<n; i++) {
							relation = relations[i];
							if ((relation.type.id != 'path') && relation.body.current && relation.target.current) {
								nodeArr.push({role:'body', node:relations[i].body, type:relations[i].type});
								nodeArr.push({role:'target', node:relations[i].target, type:relations[i].type});
							}
						}
						return nodeArr;
					})
					.enter().append('circle')
					.attr('fill', function(d) { return me.colorScale((d.type.id == 'referee') ? 'media' : d.type.id); })
					.attr('class', 'connectionDot')
					.attr('cx', function(d) {
						return me.leftMargin + colScale(me.indexNodesByURL[d.node.url].column) + (boxSize * .5);
					})
					.attr('cy', function(d) {
						return rowScale(me.indexNodesByURL[d.node.url].row + 1) - (boxSize * .5);
					})
					.attr('r', function(d,i) { return (d.role == 'body') ? 5 : 3; });
								
			}
			
			// path vis line function
			var line = d3.svg.line()
				.x(function(d) {
					return me.leftMargin + colScale(me.indexNodesByURL[d.url].column) + (boxSize * .5);
				})
				.y(function(d) {
					return rowScale(me.indexNodesByURL[d.url].row + 1) - (boxSize * .5);
				})
				.interpolate('cardinal');
			
			typedNodes = scalarapi.model.getNodesWithProperty('dominantScalarType', 'path', 'alphabetical');
			
			// build array of path contents
			n = typedNodes.length;
			var pathRelations;
			var allPathContents = [];
			var pathContents;
			for (i=0; i<n; i++) {
				pathRelations = typedNodes[i].getRelations('path', 'outgoing');
				o = pathRelations.length;
				pathContents = [typedNodes[i]];
				for (j=0; j<o; j++) {
					if (pathRelations[j].target) {
						pathContents.push(pathRelations[j].target);
					}
				}
				allPathContents.push(pathContents);
			}
			
			var pathGroups = this.indexvis_pathLayer.selectAll('g.pathGroup')
				.data(allPathContents);
				
			// create a container group for each path vis
			var groupEnter = pathGroups.enter().append('g')
				.attr('width', visWidth)
				.attr('height', unitHeight * rows.length + 20)
				.attr('class', 'pathGroup')
				.attr('visibility', 'hidden')
				.attr('pointer-events', 'none');
				
			// add the path to the group
			groupEnter.append('path')
				.attr('class', 'pathLink')
				.attr('stroke', function(d) {
					return d[0].color ? d[0].color : '#555'; 
				})
				.attr('stroke-dasharray', '5,2')
				.attr('d', line);
					
			// add the path's dots to the group
			groupEnter.selectAll('circle.pathDot'+i)
				.data(function(d) { return d; })
				.enter().append('circle')
				.attr('fill', function(d) { 
					var parentData = $(this).parent()[0].__data__;
					return (parentData[0].color) ? parentData[0].color : '#555'; 
				})
				.attr('class', 'pathDot')
				.attr('cx', function(d) {
					return me.leftMargin + colScale(me.indexNodesByURL[d.url].column) + (boxSize * .5);
				})
				.attr('cy', function(d) {
					return rowScale(me.indexNodesByURL[d.url].row + 1) - (boxSize * .5);
				})
				.attr('r', function(d,i) { return (i == 0) ? 5 : 3; });
			
			// add the step numbers to the group
			groupEnter.selectAll('text.pathDotText'+i)
				.data(function(d) { return d; })
				.enter().append('text')
				.attr('fill', function(d) { 
					var parentData = $(this).parent()[0].__data__;
					return (parentData[0].color) ? parentData[0].color : '#555'; 
				})
				.attr('class', 'pathDotText')
				.attr('dx', function(d) {
					return me.leftMargin + colScale(me.indexNodesByURL[d.url].column) + 3;
				})
				.attr('dy', function(d) {
					return rowScale(me.indexNodesByURL[d.url].row + 1) - 3;
				})
				.text(function(d,i) { return (i == 0) ? '' : i; });
				
			perFrame();
			
		}
		
		/**
		 * Updates the visualization when a radio button is clicked.
		 *
		 * @property {Object} radioBtn		The button that was clicked.
		 */
		jQuery.VisView.prototype.handleViewTypeClick = function(radioBtn) {
			if (radioBtn.id != this.selectedRadioBtn) {
			
				var url = scalarapi.stripAllExtensions( window.location.href );
				
				switch ( radioBtn.id ) {
				
					case "radio1":
					window.location.href = url + ".vis";
					break;
				
					case "radio2":
					window.location.href = url + ".visindex";
					break;
				
					case "radio3":
					window.location.href = url + ".vispath";
					break;
				
					case "radio4":
					window.location.href = url + ".vismedia";
					break;
				
					case "radio5":
					window.location.href = url + ".vistag";
					break;
				
				}
			}
		}
		
	}

}) (jQuery);