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
		this.view.controller = this.controller;
		
		element.addClass( 'caption_font' );

		/**
		 * Basic initialization.
		 */
		this.setup = function() {
			this.view.setup();
			this.controller.loadNextData();
		}
		
		this.setup();

		$( 'body' ).bind( 'delayedResize', function() { me.view.update( false ); } );

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
			this.book_title = $('#book-title').html();

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
				{id:'path', desc:"paths"}
			];
			break;
		
			case "vismedia":
			// just load the local media
			if ( window.location.href.indexOf( 'resources.vismedia' ) == -1 ) {
				this.loadSequence = [
					{id:'currentRelations', desc:"current page"}
				];
			// if this is the global media vis page, try to load all media
			} else {
				this.loadSequence = [
					{id:'media', desc:"media"}
				];
			}
			break;
		
			case "vistag":
			// just load the local tags
			if ( window.location.href.indexOf( 'resources.vistag' ) == -1 ) {
				this.loadSequence = [
					{id:'current', desc:"current page"}
				];
			// if this is the global tag vis page, try to load all tags
			} else {
				this.loadSequence = [
					{id:'tag', desc:"tags"}
				];
			}
			break;
			
			/*case "visradial":
			this.loadSequence = [
				{id:'currentRelations', desc:"current page"}
			];
			break;*/
					
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
		
		jQuery.VisController.prototype.loadNode = function( slug, ref ) {
			scalarapi.loadNode( slug, true, me.parseNode, null, 1, ref );
		}
		
		jQuery.VisController.prototype.parseNode = function( data ) {
			me.view.update( true );
		}
		
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
					result = scalarapi.loadCurrentPage(false, me.parseData, null, 1, false);
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
		
				this.view.updateLoadingMsg(this.loadSequence[this.loadIndex].desc, ((this.loadIndex + 1) / (this.loadSequence.length + 1)) * 100, ( start == -1 ) ? -1 : start + 1, end );
				
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
			/*{id:"commentary", name:"Commentaries"},
			{id:"review", name:"Reviews"},*/
			{id:"comment", name:"Comments"}/*,
			{id:"person", name:"People"}*/
		];
		this.indexTypeStrings = ['path', 'page', 'media', 'tag', 'annotation', 'commentary', /*'review',*/ 'comment'/*, 'person'*/];
		this.scaleFactorH = 1;									// available width multiplier
		this.hasSelectedCurrentContent = false;					// has the current content been selected by default yet?
		this.selectedNodes = [];								// currently selected nodes
		this.deselectedSelf = false;							// has the user deselected the node for the page she's on?
		this.currentNode = null;								// currently highlighted 
		this.mouseX = -600;
		this.mouseY = -600;
		this.startTime = null;
		this.loadingMsgShown = false;
		
		this.neutralColor = "#dddddd";
		this.colorScale = function() { return this.neutralColor; };
		
		// color scheme generated at http://colorbrewer2.org
		this.highlightColorScale = function( d, t ) {
		
			if ( t == null ) {
				t = "noun";
			}
			
			// base colors
			var color;
			switch ( d ) {
				
				case "page":
				color = "#ff7f00";
				break;
				
				case "path":
				color = "#377eb8";
				break;
				
				case "comment":
				color = d3.rgb( "#ffff33" ).darker();
				break;
				
				case "annotation":
				color = "#984ea3";
				break;
				
				case "tag":
				color = "#e41a1c";
				break;
				
				case "media":
				color = "#4daf4a";
				break;
				
				default:
				color = this.neutralColor;
				break;
				
			}
			
			// "noun" colors are used to describe what things are, "verb" colors
			// are used to types of relationships between things. Not all content
			// types (i.e. "nouns") have corresponding relationship types ("verbs"),
			// so we mute them to gray if the verb form is what we care about.
			// "Path" describes both an item and a relationship; "page" does not.
			switch ( t ) {
			
				// pass through the noun color
				case "noun":
				return color;
				break;
				
				// pass through only selected noun colors, neutralize the others
				case "verb":
				switch ( d ) {
					
					case "path":
					case "comment":
					case "annotation":
					case "tag":
					return color;
					break;
					
					default:
					return this.neutralColor;
					break;
					
				}
				break;
			
			}
			
		}
		
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
					//str += '<p><a href="'+d.url+'">View &raquo;</a></p>';
					str += '<a href="'+d.url+'" class="btn btn-primary btn-xs" role="button">View &raquo;</a>';
				}
			} else {
				str += '<a href="'+d.url+'" class="btn btn-primary btn-xs" role="button">View &raquo;</a>';
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
			
			// create loading message
			this.startTime = new Date();
			this.loadingMsg = $('<div id="loadingMsg"><p>Loading data...</p></div>').appendTo(this.model.element);
			this.progressBar = $( '<div class="progress"><div class="progress-bar" role="progressbar" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100" style="width: 10%;"><span class="sr-only">10% complete</span></div></div>' ).appendTo( this.loadingMsg );
			//this.showLoadingMsg();
			
			// create visualization div
			this.visualization = $('<div id="scalarvis"></div>').appendTo(this.model.element);
			
			this.visualization.mousemove(function(e) {
				me.mouseX = e.pageX;
				me.mouseY = e.pageY;
			});

			var visFooter = $( '<div class="vis_footer"></div>' ).appendTo( this.model.element );
			
			this.helpButton = $( '<button class="btn btn-link btn-xs" data-toggle="popover" data-placement="top">About this visualization</button>' );
			visFooter.append( this.helpButton );
			this.helpButton.popover( { trigger: "hover click", html: true } );
			
			visFooter.append( '|' );
			
			this.legendButton = $( '<button class="btn btn-link btn-xs" data-toggle="popover" data-placement="top" >Legend</button>' );
			visFooter.append( this.legendButton );
			var legendMarkup = "";
			var type;
			n = this.indexTypeOrder.length;
			for ( i = 0; i < n; i++ ) {
				type = this.indexTypeOrder[ i ];
				legendMarkup += '<span style="color:' + this.highlightColorScale( type.id ) + ';">&#9632;</span> ' + type.name + '<br>';
			}
			this.legendButton.attr( "data-content", legendMarkup );
			this.legendButton.popover( { trigger: "hover click", html: true } );
			
		}
		
		/**
		 * Hides the loading message.
		 */
		jQuery.VisView.prototype.showLoadingMsg = function() {
			this.loadingMsg.slideDown();
		}
		
		/**
		 * Updates the loading message.
		 *
		 * @param {String} typeName			The type of node being loaded.
		 * @param {Number} percentDone		Percentage of loads completed (0-100)
		 */
		jQuery.VisView.prototype.updateLoadingMsg = function( typeName, percentDone, start, end ) {
		
			// only show the loading message if it's taking a while to load the data
			if ( !this.loadingMsgShown && (( new Date().getTime() - this.startTime.getTime() ) > 1000 )) {
				this.showLoadingMsg();
				this.loadingMsg.show();
				this.loadingMsgShown = true;
			}
			
			if ( start != -1 ) {
				this.loadingMsg.find('p').text( 'Loading ' + typeName + ' ' + start + ' through ' + end + '...' );
			} else {
				this.loadingMsg.find('p').text( 'Loading ' + typeName + '...' );
			}
			this.progressBar.find( ".progress-bar" ).attr( "aria-valuenow", percentDone ).css( "width", percentDone + "%" );
			this.progressBar.find( ".sr-only" ).text( percentDone + "% complete" );
		}
		
		/**
		 * Hides the loading message.
		 */
		jQuery.VisView.prototype.hideLoadingMsg = function() {
			var me = this;
			this.loadingMsg.slideUp( 400, function() { me.update(); } );
		}
		
		/**
		 * Updates the currently visible visualization.
		 */
		jQuery.VisView.prototype.update = function( updateOnly ) {
		
			clearInterval(this.int);
			
			switch (this.model.options.default_tab) {
						
				case "vis":
				case "visradial":
		 		this.drawRadialVisualization(updateOnly);
				break;
				
				case "visindex":
		 		this.drawIndexVisualization(updateOnly);
				break;
			
				case "vispath":
		 		this.drawPathVisualization(updateOnly);
				break;
			
				case "vismedia":
		 		this.drawMediaVisualization(updateOnly);
				break;
			
				case "vistag":
		 		this.drawTagVisualization(updateOnly);
				break;
				
				default:
		 		this.drawRadialVisualization(updateOnly);
				break;
			
			}
		 
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

				var i,
					words = str.split( " " ),
					n = words.length;

				shortStr = words[ 0 ];
				if ( shortStr.length > maxChars ) {
					shortStr = shortStr.substr(0, maxChars - 3) + '...';

				} else {
					for ( i = 1; i < n; i++ ) {
						if (( shortStr.length + ( words[ i ].length + 1 ) ) > maxChars ) {
							shortStr += "...";
							break;
						} else {
							shortStr += " " + words[ i ];
						}
					}					
				}
				
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
				.attr('fill', function(d) { return me.highlightColorScale(d.id); });
				
			group.selectAll('text.legend')
				.data(this.indexTypeOrder)
				.enter().append('svg:text')
				.attr('class', 'legend')
				.attr('dx', 15 + xOffset)
				.attr('dy', function(d,i) { return legendOffset + 9 + (i * 14); })
				.attr('fill', '#aaa')
				.text(function(d) { return d.name; });
				
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
			
			var columnWidth;

			this.model.element.addClass( 'page_margins' );
			if ( window.innerWidth > 768 ) {
				this.visualization.css( 'min-height', '568px' );
				columnWidth = 180;
			} else {
				this.visualization.css( 'min-height', '300px' );
				columnWidth = 90;
			}
		
			this.helpButton.attr( "data-content", "This visualization shows all of the content in the path <b>&ldquo;" + scalarapi.model.currentPageNode.getDisplayTitle() + "&rdquo;</b>.<ul><li>Content is color-coded by type.</li><li>Scroll or pinch to zoom, or click and hold empty areas to drag.</li><li>Filled circles indicate sub-paths; click them to show their contents.</li><li>Click the title of any item to navigate to it.</li></ul>" );

			var i, j, k, n, o,
				
				maxNodeChars = Math.floor( columnWidth / 6 );
			
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
						destData = { 
							name: me.getShortenedString( destNode.getDisplayTitle( true ), maxNodeChars ), 
							node: destNode, 
							type: destNode.getDominantScalarType().id,
							children: null 
						};
						sourceData.children.push(destData);
						if (processedNodes.indexOf(sourceData.node) == -1) {
							processedNodes.push(sourceData.node);
							getRelationsForData(destData);
						}
					}
				}
			}

			var root = { 
				name: this.getShortenedString( currentNode.getDisplayTitle( true ), maxNodeChars ), 
				type: currentNode.getDominantScalarType().id, 
				children:[] 
			};
			
			//var root = { name: scalarapi.removeMarkup( this.model.book_title ), type:'root', children:[] };
			
			// add all other paths and their children to the graph
			//var paths = scalarapi.model.getNodesWithProperty('scalarType', 'path');
			var paths = currentNode.getRelatedNodes( "path", "outgoing" );
			
			var pathChildren = [];
		
			n = paths.length;
			for (i=0 ;i<n; i++) {
				node = paths[i];
				if (processedNodes.indexOf(node) == -1) {
					data = { 
						name: this.getShortenedString( node.getDisplayTitle( true ), maxNodeChars ), 
						node: node, 
						type: node.getDominantScalarType().id,
						children: null 
					};
					pathChildren.push(data);
					getRelationsForData(data);
				}
			}

			root.children = pathChildren;

			if ( pathChildren.length == 0 ) {
				root.name += " (not a path)";
			}
			
			this.visualization.css('width', this.model.element.width());
			this.visualization.css('padding', '0px');

			var fullWidth = this.visualization.width();
			var fullHeight = this.visualization.height();

			$( '#loadingMsg' ).addClass( 'bounded' );
			$( '.vis_footer' ).addClass( 'bounded' );
			$( '#scalarvis' ).addClass( 'bounded' );

			root.x0 = fullHeight * .5;
			root.y0 = 0;
							
			var tree = d3.layout.tree()
			    .size([fullHeight, fullWidth]);

			var diagonal = d3.svg.diagonal()
			    .projection(function(d) { return [d.y, d.x]; });

			// create visualization base element
			var visparent = d3.select('#scalarvis').append('svg:svg')
				.attr('width', fullWidth)
				.attr('height', fullHeight);

			var vis = visparent.append("svg:g");


			  function pathToggleAll(d) {
			    if (d.children) {
			      d.children.forEach(pathToggleAll);
			      pathToggle(d);
			    }
			  }
		
			var zoom = d3.behavior.zoom().scaleExtent([ .25, 7 ])
			zoom.on("zoom", function() {
				vis.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
			});
			visparent.call( zoom );
			visparent.style( "cursor", "move" );

			// expand the root node
			root.children.forEach(pathToggleAll);

			pathUpdate( root, true );

			function pathUpdate( source, instantaneous ) {

				var duration = instantaneous ? 0 : d3.event && d3.event.altKey ? 5000 : 500;

				// Compute the new tree layout.
				var nodes = tree.nodes(root).reverse();

				// Normalize for fixed-depth.
				nodes.forEach(function(d) { d.y = ( d.depth + 1 ) * columnWidth; });

				// Update the nodes…
				me.pathvis_node = vis.selectAll("g.node")
					.data(nodes, function(d) { return d.id || (d.id = ++i); });

				// Enter any new nodes at the parent's previous position.
				var nodeEnter = me.pathvis_node.enter().append("svg:g")
					.attr("class", "node")
					.attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; });

				nodeEnter.append("svg:circle")
					.attr("r", 1e-6)
					.style("fill", function(d) { return d._children ? d3.hsl( me.highlightColorScale( d.type, "noun" ) ).brighter( 1.5 ) : "#fff"; })
					.style( "stroke", function(d) { return me.highlightColorScale( d.type, "noun" ) })  
				.on('touchstart', function(d) { d3.event.stopPropagation(); })
				.on('mousedown', function(d) { d3.event.stopPropagation(); })
				.on("click", function(d) { 
					if (d3.event.defaultPrevented) return; // ignore drag
					pathToggle(d); pathUpdate(d); 
				});

				nodeEnter.append("svg:text")
					.attr("x", function(d) { return d.children || d._children ? -14 : 14; })
					.attr("dy", ".35em")
					.attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
					.text(function(d) { return d.name; })
					.style("fill-opacity", 1e-6)
				.on('touchstart', function(d) { d3.event.stopPropagation(); })
				.on('mousedown', function(d) { d3.event.stopPropagation(); })
				.on( 'click', function(d) { 
					if (d3.event.defaultPrevented) return; // ignore drag
					d3.event.stopPropagation();
					if ( self.location != d.node.url ) {
						return self.location = d.node.url;
					}
				});

				// Transition nodes to their new position.
				var nodeUpdate = me.pathvis_node.transition()
					.duration(duration)
					.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

				nodeUpdate.select("circle")
					.attr("r", 8)
					.style("fill", function(d) { return d._children ? d3.hsl( me.highlightColorScale( d.type, "noun" ) ).brighter( 1.5 ) : "#fff"; });

				nodeUpdate.select("text")
					.style("fill-opacity", 1);

				// Transition exiting nodes to the parent's new position.
				var nodeExit = me.pathvis_node.exit().transition()
					.duration(duration)
					.attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
					.remove();

				nodeExit.select("circle")
					.attr("r", 1e-6);

				nodeExit.select("text")
					.style("fill-opacity", 1e-6);

				// Update the links…
				me.pathvis_link = vis.selectAll("path.clusterlink")
					.data(tree.links(nodes), function(d) { return d.target.id; });

				// Enter any new links at the parent's previous position.
				me.pathvis_link.enter().insert("svg:path", "g")
					.attr("class", "clusterlink")
					.attr("d", function(d) {
					var o = {x: source.x0, y: source.y0};
						return diagonal({source: o, target: o});
					})
				.transition()
					.duration(duration)
					.attr("d", diagonal);

				// Transition links to their new position.
				me.pathvis_link.transition()
					.duration(duration)
					.attr("d", diagonal);

				// Transition exiting nodes to the parent's new position.
				me.pathvis_link.exit().transition()
					.duration(duration)
					.attr("d", function(d) {
						var o = {x: source.x, y: source.y};
						return diagonal({source: o, target: o});
					})
					.remove();

				// Stash the old positions for transition.
				nodes.forEach(function(d) {
					d.x0 = d.x;
					d.y0 = d.y;
				});
			}

			// Toggle children.
			function pathToggle(d) {
				if (d.children) {
					d._children = d.children;
					d.children = null;
				} else {
					d.children = d._children;
					d._children = null;
				}
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
			
			this.helpButton.attr( "data-content", "This visualization shows all of the media referenced or annotated by <b>&ldquo;" + scalarapi.model.currentPageNode.getDisplayTitle() + "&rdquo;</b>.<ul><li>Content is color-coded by type.</li><li>Scroll or pinch to zoom, or click and hold to drag.</li><li>Click any item to add it to the current selection, and to reveal the media it references or annotates in turn.</li><li>Click the &ldquo;View&rdquo; button of any selected item to navigate to it.</li></ul>" );

			// if we're drawing from scratch, wipe out the previous vis
			if (!updateOnly) {
				this.visualization.empty();
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

			if ( this.mediaNodesByURL[ scalarapi.model.currentPageNode.url ] == null ) {
				datum = {
					index: this.mediaNodes.length,
					node: scalarapi.model.currentPageNode,
					title: scalarapi.model.currentPageNode.getDisplayTitle( true ),
					shortTitle: this.getShortenedString( scalarapi.model.currentPageNode.getDisplayTitle( true ), maxNodeChars ),
					type: scalarapi.model.currentPageNode.getDominantScalarType().id
				}
				this.mediaNodesByURL[ scalarapi.model.currentPageNode.url ] = datum;
				this.mediaNodes.push( datum );
			}
						
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
					if ( this.mediaNodesByURL[targetNode.url] == null ) {
						targetDatum = {index:this.mediaNodes.length, node:targetNode, title:targetNode.getDisplayTitle( true ), shortTitle:this.getShortenedString(targetNode.getDisplayTitle( true ), maxNodeChars), type:targetNode.getDominantScalarType().id};
						this.mediaNodesByURL[targetNode.url] = targetDatum;
						this.mediaNodes.push(targetDatum);
					} else {
						targetDatum = this.mediaNodesByURL[targetNode.url];
					}
			
					// add the link to the array of links
					if ( this.mediaLinksByURL[node.url+targetNode.url] == null ) {
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
					if (this.mediaNodesByURL[targetNode.url] == null) {
						targetDatum = {index:this.mediaNodes.length, node:targetNode, title:targetNode.getDisplayTitle( true ), shortTitle:this.getShortenedString(targetNode.getDisplayTitle( true ), maxNodeChars), type:targetNode.getDominantScalarType().id};
						this.mediaNodesByURL[targetNode.url] = targetDatum;
						this.mediaNodes.push(targetDatum);
					} else {
						targetDatum = this.mediaNodesByURL[targetNode.url];
					}
				
					// add the link to the array of links
					if ( this.mediaLinksByURL[node.url+targetNode.url] == null ) {
						link = {source:datum.index, target:targetDatum.index, value:1};
						this.mediaLinksByURL[node.url+targetNode.url] = link;
						this.mediaLinks.push(link);
					}
				}
			}
					
			// now, figure out which of those stored nodes we are actually going to show
			this.currentMediaNodes = [];
			this.currentMediaLinks = [];
			var source;
			var target;
			n = this.selectedNodes.length;
			for (i=0; i<n; i++) {
				this.currentMediaNodes.push(this.mediaNodesByURL[this.selectedNodes[i].url]);
			}
			n = this.mediaLinks.length;
			for (i=0; i<n; i++) {
				link = this.mediaLinks[i];
				var newLink = false;
				
				// d3 converts the link source and target from indexes to objects, but we may have
				// mixed types at this point, so we have to check for both
				if (typeof link.source == 'number') {
					datum = this.mediaNodes[link.source];
				} else if (typeof link.source == 'object') {
					datum = link.source;
				}
				
				if (typeof link.target == 'number') { 
					targetDatum = this.mediaNodes[link.target];
				} else if (typeof link.target == 'object') {
					targetDatum = link.target;
				}
				
				if ((this.selectedNodes.indexOf(datum.node) != -1) || (this.selectedNodes.indexOf(targetDatum.node) != -1)) newLink = true;
				
				if (newLink) {
					if (this.currentMediaNodes.indexOf(datum) == -1) this.currentMediaNodes.push(datum);
					if (this.currentMediaNodes.indexOf(targetDatum) == -1) this.currentMediaNodes.push(targetDatum);
					if (this.currentMediaLinks.indexOf(link) == -1) {
						this.currentMediaLinks.push( link );
					}
				}
				
			}

			// if we're drawing from scratch, do some setup
			if (!updateOnly) {
			
				this.model.element.addClass( 'page_margins' );
				if ( window.innerWidth > 768 ) {
					this.visualization.css( 'min-height', '568px' );
				} else {
					this.visualization.css( 'min-height', '300px' );
				}
				this.visualization.css('width', this.model.element.width());
				this.visualization.css('padding', '0px');
		
				var fullWidth = this.visualization.width();
				var fullHeight = this.visualization.height();
					
				$( '#loadingMsg' ).addClass( 'bounded' );
				$( '.vis_footer' ).addClass( 'bounded' );
								
				$( '#scalarvis' ).addClass( 'bounded' );
				this.mediavis = d3.select('#scalarvis').append('svg:svg')
					.attr('width', fullWidth)
					.attr('height', fullHeight);

				var zoom = d3.behavior.zoom().center([ fullWidth * .5, fullHeight * .5 ]).scaleExtent([ .25, 7 ])
				zoom.on("zoom", function() {
					
					me.mediavis_pathLayer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
					me.mediavis_dotLayer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
					me.mediavis_textLayer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
					
				});
				
				this.mediavis.call(zoom);
				this.mediavis.style("cursor","move");

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

				// force-directed layout
				this.force = d3.layout.force()
					.nodes( this.mediaNodes )
					.links((this.selectedNodes.length > 0) ? this.currentMediaLinks : this.mediaLinks)
					.linkDistance(120)
					.charge(-400)
					.size([fullWidth, fullHeight])
					.start();	

			// if the vis is already set up, then
			} else {

				// update the force-directed layout's data
				this.force
					.nodes( this.mediaNodes )
					.links((this.selectedNodes.length > 0) ? this.currentMediaLinks : this.mediaLinks)
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

				me.mediavis.selectAll('rect.visit-button')
					.attr('x', function(d) { return d.x - 24; })
					.attr('y', function(d) { return d.y + 38; });
					
				me.mediavis.selectAll('text.visit-button')
					.attr('x', function(d) { return d.x; })
					.attr('y', function(d) { return d.y + 53; });

			});
			
			// create the lines
			var lines = this.mediavis_pathLayer.selectAll('line.link')
				.data((this.selectedNodes.length > 0) ? this.currentMediaLinks : this.mediaLinks);
				
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
				.data((this.selectedNodes.length > 0) ? this.currentMediaNodes : this.mediaNodes);
				
			dots.enter().append('svg:circle')
				.attr('class', function(d) { return (d.type == 'media') ? 'node mediaFile' : 'node'; })
				.attr('cx', function(d) { return d.x; })
				.attr('cy', function(d) { return d.y; })
				.attr('r', '16')
				.call(me.force.drag)
				.on('touchstart', function(d) { d3.event.stopPropagation(); })
				.on('mousedown', function(d) { d3.event.stopPropagation(); })
				.on('click', function(d) {
					if (d3.event.defaultPrevented) return; // ignore drag
					d3.event.stopPropagation();
					me.lastClickedNode = d.node;
					var index = me.selectedNodes.indexOf(d.node);
					if (index == -1) {
						me.selectedNodes.push(d.node);
						me.controller.loadNode( d.node.slug, true );
						if (d.node == scalarapi.model.currentPageNode) {
							me.deselectedSelf = false;
						}
					} else if ( d.node != scalarapi.model.currentPageNode ) {
						me.selectedNodes.splice(index, 1);
						if (d.node == scalarapi.model.currentPageNode) {
							me.deselectedSelf = true;
						}
					}
					me.drawMediaVisualization(true);
				})
				.on("mouseover", function(d) { 
					me.currentNode = d.node; 
					updateGraph( 'mouseover' );
				})
				.on("mouseout", function() { 
					me.currentNode = null; 
					updateGraph( 'mouseout' );
				})
				.attr('fill', function(d) { 
					var interpolator = d3.interpolateRgb(me.highlightColorScale(d.type), d3.rgb(255,255,255));
					return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? interpolator(0) : interpolator(.5);
				});
				
			dots.exit().remove();
							
			// create the text labels
			var labels = this.mediavis_textLayer.selectAll('text.label')
				.data((this.selectedNodes.length > 0) ? this.currentMediaNodes : this.mediaNodes);
				
			labels.enter().append('svg:text')
				.attr('class', 'label')
				.attr('x', function(d) { return d.x; })
				.attr('y', function(d) { return d.y + 21; })
				.attr('text-anchor', 'middle')
				.text(function(d) { 
					return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? d.title : d.shortTitle; 
				});
				
			labels.enter().append('svg:rect')
				.attr( 'class', 'visit-button' )
				.attr( 'rx', '5' )
				.attr( 'ry', '5' )
				.attr( 'width', '48' )
				.attr( 'height', '22' )
				.on( 'click', function(d) { 
					d3.event.stopPropagation();
					if ( self.location != d.node.url ) {
						return self.location = d.node.url;
					}
				});

			labels.enter().append('svg:text')
				.attr( 'class', 'visit-button' )
				.attr( 'text-anchor', 'middle')				
				.text( 'View »' );

			labels.exit().remove();
			
			var updateGraph = function( event ) {
					
				lines.attr('stroke-width', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? "3" : "1"; })
					.attr('stroke-opacity', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? '1.0' : '0.5'; })
					.attr('stroke', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? me.colorScale('media') : '#999'; });
					
				dots.attr('fill', function(d) { 
						var interpolator = d3.interpolateRgb(me.highlightColorScale(d.type), d3.rgb(255,255,255));
						return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? interpolator(0) : interpolator(.5);
					 });
						
				me.mediavis_textLayer.selectAll('text.label')
					.attr('fill', function(d) { return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? "#000" :"#999"; })
					.attr('font-weight', function(d) { return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? 'bold' : 'normal'; })
					.text(function(d) { 
						return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? d.title : d.shortTitle; 
					});
			
				me.mediavis_textLayer.selectAll('rect.visit-button')
					.style( 'display', function(d) { 
						return ((me.selectedNodes.indexOf(d.node) != -1) && (scalarapi.model.currentPageNode != d.node)) ? 'inherit' : 'none'; 
					});
			
				me.mediavis_textLayer.selectAll('text.visit-button')
					.style( 'display', function(d) { 
						return ((me.selectedNodes.indexOf(d.node) != -1) && (scalarapi.model.currentPageNode != d.node)) ? 'inherit' : 'none'; 
					});

			}
			
			updateGraph( 'default' );
			
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

			this.helpButton.attr( "data-content", "This visualization shows all of the content tagged by <b>&ldquo;" + scalarapi.model.currentPageNode.getDisplayTitle() + "&rdquo;</b>.<ul><li>Content is color-coded by type.</li><li>Scroll or pinch to zoom, or click and hold to drag.</li><li>Click any item to add it to the current selection, and to reveal the content it tags in turn.</li><li>Click the &ldquo;View&rdquo; button of any selected item to navigate to it.</li></ul>" );
			
			// if we're drawing from scratch, wipe out the previous vis
			if (!updateOnly) {
				this.visualization.empty();
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
			/*n = this.selectedNodes.length;
			for (i=0; i<n; i++) {
				node = this.selectedNodes[i];
				if (!this.tagNodesByURL[node.url]) {
					datum = {index:this.tagNodes.length, node:node, title:node.getDisplayTitle( true ), shortTitle:this.getShortenedString(node.getDisplayTitle( true ), maxNodeChars), type:node.getDominantScalarType().id};
					this.tagNodesByURL[node.url] = datum;
					this.tagNodes.push(datum);
				} else {
					datum = this.tagNodesByURL[node.url];
				}
			}*/
			
			// loop through all the tags
			var rawTagNodes = scalarapi.model.getNodesWithProperty('scalarType', 'tag');
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
					if ( this.tagNodesByURL[targetNode.url] == null ) {
						targetDatum = {index:this.tagNodes.length, node:targetNode, title:targetNode.getDisplayTitle( true ), shortTitle:this.getShortenedString(targetNode.getDisplayTitle( true ), maxNodeChars), type:targetNode.getDominantScalarType().id};
						this.tagNodesByURL[targetNode.url] = targetDatum;
						this.tagNodes.push(targetDatum);
					} else {
						targetDatum = this.tagNodesByURL[targetNode.url];
					}
					
					// add the link to the array of links
					if ( this.tagLinksByURL[node.url+targetNode.url] == null ) {
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
						if ( this.tagNodesByURL[targetNode.url] == null ) {
							targetDatum = {index:this.tagNodes.length, node:targetNode, title:targetNode.getDisplayTitle( true ), shortTitle:this.getShortenedString(targetNode.getDisplayTitle( true ), maxNodeChars), type:targetNode.getDominantScalarType().id};
							this.tagNodesByURL[targetNode.url] = targetDatum;
							this.tagNodes.push(targetDatum);
						} else {
							targetDatum = this.tagNodesByURL[targetNode.url];
						}
						
						// add the link to the array of links
						if ( this.tagLinksByURL[targetNode.url+node.url] == null ) {
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
						this.currentTagLinks.push( link );
					}
				}
				
			}
		
			// if we're drawing from scratch, do some setup
			if (!updateOnly) {
			
				this.model.element.addClass( 'page_margins' );
				if ( window.innerWidth > 768 ) {
					this.visualization.css( 'min-height', '568px' );
				} else {
					this.visualization.css( 'min-height', '300px' );
				}
				this.visualization.css('width', this.model.element.width());
				this.visualization.css('padding', '0px');
		
				var fullWidth = this.visualization.width();
				var fullHeight = this.visualization.height();
				
				$( '#loadingMsg' ).addClass( 'bounded' );
				$( '.vis_footer' ).addClass( 'bounded' );
								
				$( '#scalarvis' ).addClass( 'bounded' );
				this.tagvis = d3.select('#scalarvis').append('svg:svg')
					.attr('width', fullWidth)
					.attr('height', fullHeight);
					
				var zoom = d3.behavior.zoom().center([ fullWidth * .5, fullHeight * .5 ]).scaleExtent([ .25, 7 ])
				zoom.on("zoom", function() {
					
					me.tagvis_pathLayer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
					me.tagvis_dotLayer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
					me.tagvis_textLayer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
					
				});
				
				this.tagvis.call(zoom);
				this.tagvis.style("cursor","move");
					
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
								
				// force-directed layout
				this.force = d3.layout.force()
					.nodes( this.tagNodes )
					.links((this.selectedNodes.length > 0) ? this.currentTagLinks : this.tagLinks)
					.linkDistance(120)
					.charge(-400)
					.size([fullWidth, fullHeight])
					.start();
					
			// if the vis is already set up, then
			} else {
					
				// update the force-directed layout's data
				this.force
					.nodes( this.tagNodes )
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
					.attr('y', function(d) { return d.y + 28; });
					
				me.tagvis.selectAll('rect.visit-button')
					.attr('x', function(d) { return d.x - 24; })
					.attr('y', function(d) { return d.y + 38; });
					
				me.tagvis.selectAll('text.visit-button')
					.attr('x', function(d) { return d.x; })
					.attr('y', function(d) { return d.y + 53; });
				
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
				.attr('r', '16')
				.call(me.force.drag)
				.on('touchstart', function(d) { d3.event.stopPropagation(); })
				.on('mousedown', function(d) { d3.event.stopPropagation(); })
				.on('click', function(d) {
					if (d3.event.defaultPrevented) return; // ignore drag
					d3.event.stopPropagation();
					me.lastClickedNode = d.node;
					var index = me.selectedNodes.indexOf(d.node);
					if (index == -1) {
						me.selectedNodes.push(d.node);
						me.controller.loadNode( d.node.slug, false );
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
				.on("mouseover", function(d) { 
					me.currentNode = d.node;
					updateGraph( 'mouseover' );
				})
				.on("mouseout", function() { 
					me.currentNode = null;
					updateGraph( 'mouseout' );
				})
				.attr('fill', function(d) { 
					var interpolator = d3.interpolateRgb(me.highlightColorScale(d.type), d3.rgb(255,255,255));
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
				.text(function(d) { 
					return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? d.title : d.shortTitle; 
				});

			labels.enter().append('svg:rect')
				.attr( 'class', 'visit-button' )
				.attr( 'rx', '5' )
				.attr( 'ry', '5' )
				.attr( 'width', '48' )
				.attr( 'height', '22' )
				.on( 'click', function(d) { 
					d3.event.stopPropagation();
					if ( self.location != d.node.url ) {
						return self.location = d.node.url;
					}
				});

			labels.enter().append('svg:text')
				.attr( 'class', 'visit-button' )
				.attr( 'text-anchor', 'middle')				
				.text( 'View »' );
			
			labels.exit().remove();
			
			var updateGraph = function( event ) {
					
				me.tagvis_pathLayer.selectAll('line.link')
					.attr('stroke-width', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? "3" : "1"; })
					.attr('stroke-opacity', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? '1.0' : '0.5'; })
					.attr('stroke', function(d) { return ((me.currentNode == d.source.node) || (me.selectedNodes.indexOf(d.source.node) != -1) || (me.currentNode == d.target.node) || (me.selectedNodes.indexOf(d.target.node) != -1)) ? me.colorScale('tag') : '#999'; });
					
				me.tagvis_dotLayer.selectAll('circle.node')
					.attr('fill', function(d) { 
						var interpolator = d3.interpolateRgb(me.highlightColorScale(d.type), d3.rgb(255,255,255));
						return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? interpolator(0) : interpolator(.5);
					 });
			
				me.tagvis_textLayer.selectAll('text.label')
					.attr('fill', function(d) { return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? "#000" :"#999"; })
					.attr('font-weight', function(d) { return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? 'bold' : 'normal'; })
					.text(function(d) { 
						return ((me.currentNode == d.node) || (me.selectedNodes.indexOf(d.node) != -1)) ? d.title : d.shortTitle; 
					});
			
				me.tagvis_textLayer.selectAll('rect.visit-button')
					.style( 'display', function(d) { 
						return ((me.selectedNodes.indexOf(d.node) != -1) && (scalarapi.model.currentPageNode != d.node)) ? 'inherit' : 'none'; 
					});
			
				me.tagvis_textLayer.selectAll('text.visit-button')
					.style( 'display', function(d) { 
						return ((me.selectedNodes.indexOf(d.node) != -1) && (scalarapi.model.currentPageNode != d.node)) ? 'inherit' : 'none'; 
					});
			
			}
			
			updateGraph( 'default' );
			
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
			
			this.helpButton.attr( "data-content", "This visualization shows how <b>&ldquo;" + scalarapi.model.currentPageNode.getDisplayTitle() + "&rdquo;</b> is connected to other content in this work.<ul><li>Each colored arc represents a connection, color-coded by type.</li><li>Roll over the visualization to browse connections.</li><li>Click to add more content to the current selection.</li><li>To explore a group of connections in more detail, click its outer arc to expand the contents.</li><li>Click any item's title to navigate to it.</li></ul>" );
			
			this.visualization.empty();
			if ( window.innerWidth > 768 ) {
				this.visualization.css( 'min-height', '568px' );
			} else {
				this.visualization.css( 'min-height', '300px' );
			}
			this.visualization.css('padding', '10px');
			
			var maxNodeChars = 115 / 6;
			
			var i, j, k, n, o, p, index, node;
			
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
			var isRelated = false;
			var relatedNodes;
			
			// add the current node
			indexType = { name: "", id: "current" };
			var nodeForCurrentContent = {title:indexType.name, type:indexType.id, isTopLevel:true, index:0, size:1, parent:types, maximizedAngle:360, children:[], descendantCount:1};
			types.children.push(nodeForCurrentContent);
			nodeForCurrentContent.children = setChildren(nodeForCurrentContent, [ scalarapi.model.currentPageNode ]);
			
			//var maximizedNode = nodeForCurrentContent;
			var maximizedNode = null;
			var highlightedNode = null;
			
			// loop through each type
			for (i=0; i<this.indexTypeOrder.length; i++) {
				indexType = this.indexTypeOrder[i];
				
				// we do this so the highlight color scheme matches the regular
				this.highlightColorScale( indexType.id );
				
				typedNodes = scalarapi.model.getNodesWithProperty('scalarType', indexType.id, 'alphabetical');
				
				// don't allow the current node to be added anywhere else
				index = typedNodes.indexOf( scalarapi.model.currentPageNode );
				if ( index != -1 ) {
					typedNodes.splice( index, 1 );
				}
				
				if ( indexType.id == "page" ) {
					o = typedNodes.length;
					for ( j = ( o - 1 ); j >= 0; j-- ) {
						if ( typedNodes[ j ].getDominantScalarType().id != "page" ) {
							typedNodes.splice( j, 1 );
						}
					}
				}
				
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
			
			var r = Math.min(fullWidth, fullHeight) / 2
			if ( fullWidth < fullHeight ) {
				r -= 120;
			} else {
				r -= 60;
			}
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
				
			//this.drawLegend(this.radialBaseLayer, 10, fullHeight);
				
			var numChildren = nodeForCurrentContent.descendantCount;
			var arcOffset = (( numChildren / nodes.length ) * ( Math.PI * 2 )) * -.5;
			
			// arc generator
			var arcs = d3.svg.arc()
    			.startAngle(function(d) { 
    				return d.x - (Math.PI * .5) + arcOffset; 
    			})
     			.endAngle(function(d) { return d.x + d.dx - (Math.PI * .5) + arcOffset; })
     			.innerRadius(function(d) { return (r * radiusMod) - Math.sqrt(d.y); })
    			.outerRadius(function(d) { return (r * radiusMod) - Math.sqrt(d.y + d.dy); });
				
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
				
					if ( d != nodeForCurrentContent ) {
					
						// if the node was maximized, normalize it
						if (maximizedNode == d) {
						
							maximizedNode = null;
							
							// return the vis to its normalized state
							path.data(partition.nodes).transition()
								.duration(1000)
								.style("stroke-width", function(d) { 
									return (d.dx > minChordAngle) ? 1 : 0;
								})
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
									.style("stroke-width", function(d) { 
										if ( d.parent != null ) {	
											if (( d.parent.type == "current" ) || ( d.type == "current" )) {
												return 10;
											} else {
												return (d.dx > minChordAngle) ? 1 : 0;
											} 
										} else {
											return (d.dx > minChordAngle) ? 1 : 0;
										}
									})
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
			    	.attr('fill', '#000')
			    	.attr('font-weight', 'bold')
			        .attr('text-anchor', function(d) {
			    		if (arcs.centroid(d)[0] < 0) {
			    			return 'end';
			    		} else {
			    			return null;
			    		}
			        })
					.on("click", function(d) {
						if (d.node) {
							return self.location = d.node.url;
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
					.style('stroke-width', function(d) {
						if ( d.parent != null ) {	
							if (( d.parent.type == "current" ) || ( d.type == "current" )) {
								return 5;
							} else {
								return (d.dx > minChordAngle) ? 1 : 0;
							} 
						} else {
							return (d.dx > minChordAngle) ? 1 : 0;
						}
					})
					.style('fill', function(d) {
					
						var color = me.colorScale(d.type),
							okToHighlight = true;
							
						// if the item isn't the root, then
						if ( d.parent != null ) {	
						
							// if it's representing the current content, then make it white
							if ( d.type == "current" ) {
								if ( d.children == null ) {
									color = "#000000";
								} else {
									color = "#ffffff";
								}
								
							// if the mouse is over the arc and it's not representing an individual item, then color it by verb
							} else if (( d == highlightedNode ) && ( d.children != null )) {
							
								color = me.highlightColorScale( d.type, "verb" ); 
								
								// if we got an actual color, then don't darken it when highlighted
								if ( color != me.neutralColor ) {
									okToHighlight = false;							
								}
							}
						}
						return (
							(
								(d == highlightedNode) || 
								(hasNodeAsAncestor(d, highlightedNode)
							) || 
							(
								(me.selectedNodes.indexOf(d.node) != -1) && 
								(d == nodeForCurrentContent)
							)
						) && okToHighlight ) 
						? d3.rgb(color).darker() 
						: color;
					})
					
				// darken the chords connected to the rolled-over node
				vis.selectAll('path.chord')
					.attr('opacity', function(d) {
					
						// chord is connected to a selected node
						if (
							(me.selectedNodes.indexOf(d.source.node) != -1) || 
							(me.selectedNodes.indexOf(d.target.node) != -1)
						)  {
							return .9;
							
						// chord is connected to a rolled over node
						} else if (
							(
								(d.source == highlightedNode) || 
								(d.target == highlightedNode) || 
								hasNodeAsAncestor(d.source, highlightedNode)
							) || (
								hasNodeAsAncestor(d.target, highlightedNode)
							)
						) {
							return .25;
							
						// chord isn't connected to anything selected or rolled over
						} else {
							return .25;
						}
						
					})
					.attr('fill', function(d) { 
						return (
							(d.source == highlightedNode) || 
							(d.target == highlightedNode) || 
							hasNodeAsAncestor(d.source, highlightedNode) ||
							hasNodeAsAncestor(d.target, highlightedNode) || 
							(me.selectedNodes.indexOf(d.source.node) != -1) || 
							(me.selectedNodes.indexOf(d.target.node) != -1)
						) 
						? me.highlightColorScale( d.type, "verb" ) 
						: me.colorScale( d.type );
					});
			} 
				
			var parent;
			var linkedNodes = [];
			var srcNode;
			var destNode;
			var candidateRelatedNodes;
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
				
				parent = srcNode.parent;
				while ( !parent.isTopLevel ) {
					parent = parent.parent;
				};
				
				if ( parent.type == "current" ) {
					p = linkSpecs.length;
					for (k=0; k<p; k++) {
						relatedNodes = srcNode.node.getRelatedNodes(linkSpecs[k].type, linkSpecs[k].direction);
				
						o = relatedNodes.length;
						for (j=0; j<o; j++) {
							destNode = nodesByUrl[relatedNodes[j].url];
							links.push({
								source: srcNode, 
								target: destNode,
								type: linkSpecs[k].type
							});
						}
					}
				} else {
					relatedNodes = srcNode.node.getRelatedNodes( parent.type, "outgoing" );
					
					o = relatedNodes.length;
					for (j=0; j<o; j++) {
						destNode = nodesByUrl[relatedNodes[j].url];
						links.push({
							source: srcNode,
							target: destNode,
							type: parent.type
						});
					}
				}
				
			}
			
			// chord generator
			var chords = d3.svg.chord()
    			.startAngle(function(d) { return d.x - (Math.PI * .5) + arcOffset; })
     			.endAngle(function(d) { return d.x + d.dx - (Math.PI * .5) + arcOffset; })
				.radius(function(d) { return (r * radiusMod) - Math.sqrt(d.y + d.dy); });
			
			// create the chords
			var chordvis = vis.selectAll('path.chord').data(links);
			
			chordvis.enter().append('svg:path')
				.attr('class', 'chord')
				.attr('d', function(d) { return chords(d); })
				.attr('opacity', .25)
				.attr('display', function(d) { return ((d.source.dx > minChordAngle) || (d.target.dx > minChordAngle)) ? null : 'none'; })
				.attr('fill', function(d) { return me.highlightColorScale(d.type); })
				.each(stashChord);
				
			chordvis.exit().remove();

			if ( types.children != null ) {
			
				// create the type labels		    
			    var labels = vis.selectAll('text.typeLabel').data(types.children);
			    
			    labels.enter().append('svg:text')
			    	.attr('class', 'typeLabel')
			    	.attr('dx', function(d) { 
			    		d.angle = (((d.x+(d.dx*.5) + arcOffset)/(Math.PI*2))*360-180);
			    		d.isFlipped = ((d.angle > 90) || (d.angle < -90));
			    		return d.isFlipped ? -10 : 10; 
			    	})
			    	.attr('dy', '.35em')
			    	.attr('fill', '#666')
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
			    
			}
		    
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
			
			this.helpButton.attr( "data-content", "This visualization shows how <b>&ldquo;" + scalarapi.model.currentPageNode.getDisplayTitle() + "&rdquo;</b> is connected to other content in this work.<ul><li>Each box represents a piece of content, color-coded by type.</li><li>The darker the box, the more connections it has to other content.</li><li>Each line represents a connection, color-coded by type.</li><li>You can roll over the boxes to browse connections, or click to add more content to the current selection.</li><li>Click the &ldquo;View&rdquo; button of any selected item to navigate to it.</li></ul>" );
			
			this.visualization.empty();
			this.visualization.css('padding', '10px');
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
				if ( node ) {
					if ( node.getDominantScalarType() != '' ) {
						maxConnections = Math.max(maxConnections, (node.outgoingRelations ? node.outgoingRelations.length : 0) + (node.incomingRelations ? node.incomingRelations.length : 0));
					} else {
						sortedNodes.splice(i, 1);
					}
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
			var fullHeight = unitHeight * rows.length + 20;
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
				
			//this.drawLegend(this.indexvis_boxLayer, 0, fullHeight);
				
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
						return me.highlightColorScale(d.node.getDominantScalarType().singular);
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
						.attr('fill', function(d) { return (me.currentNode == d.node) ? d3.rgb(me.highlightColorScale(d.node.getDominantScalarType().singular)).darker() : me.highlightColorScale(d.node.getDominantScalarType().singular); });
					
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
					.attr('stroke', function(d) { return me.highlightColorScale((d.type.id == 'referee') ? 'media' : d.type.id, "verb" ); });
						
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
					.attr('fill', function(d) { return me.highlightColorScale((d.type.id == 'referee') ? 'media' : d.type.id); })
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
					return me.highlightColorScale( "path", "verb" ); 
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
		
	}

}) (jQuery);