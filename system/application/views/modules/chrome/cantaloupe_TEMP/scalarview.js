
var scalarview = new ScalarView();

function nl2br (str) {
	var breakTag = '<br>'; 
	str = (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+breakTag+'$2'); 
	str = (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, ''); 
	return str;
} 

// TODO: Use SVG to draw circular backgrounds behind icon buttons
// TODO: Enable zooming in basin
// TODO: Show history with colored highlights in basin (current vs. all)

/**
 * Creates a new instance of the ScalarView class. You do not need to
 * call this constructor; this file calls it itself and places
 * the resulting instance in the global variable sclarview.
 * @class 		Handles configuration and display of the Scalar interface.
 * @author		Erik Loyer
 *
 * @property {Number} windowWidth			Width of the current window.
 * @property {Array} visitedURLs			Array of all visited URLs in the book.
 * @property {Array} markedURLs				Array of all marked URLs in the book.
 * @property {Object} basin					Navigation interface.
 * @property {Object} surface				Reading interface.
 * @property {Boolean} marginsCollapsed		Are horizontal margins currently collapsed?
 */
function ScalarView() {

	var me = this;
	
	this.visitedURLs = [];
	this.markedURLs = [];
	this.singlePageMode = false;
	
}

ScalarView.prototype.state = null;
ScalarView.prototype.surface = null;
ScalarView.prototype.basin = null;
ScalarView.prototype.pinwheel = null;
ScalarView.prototype.windowWidth = null;
ScalarView.prototype.marginsCollapsed = null;
ScalarView.prototype.currentURL = null;
ScalarView.prototype.visitedURLs = null;
ScalarView.prototype.markedURLs = null;
ScalarView.prototype.currentNode = null;
ScalarView.prototype.tocNode = null;
ScalarView.prototype.stateProperties = null;
ScalarView.prototype.startTime = null;
ScalarView.prototype.transitionDuration = null;
ScalarView.prototype.transitionTimer = null;
ScalarView.prototype.viewType = null;
ScalarView.prototype.singlePageMode = null;
ScalarView.prototype.instance = null;
ScalarView.prototype.book = null;

/*
ScalarView.prototype.surfaceMargin = null;
ScalarView.prototype.collapsedSurfaceMargin = null;
ScalarView.prototype.visScaleY = null;
ScalarView.prototype.editor = null;
ScalarView.prototype.editorPlates = null;
ScalarView.prototype.wysiwyg = null;
ScalarView.prototype.pageScroll = null;
ScalarView.prototype.startValues = null;
ScalarView.prototype.changeAmounts = null;
ScalarView.prototype.surfaceMarginCollapsed = null;
ScalarView.prototype.index = null;
ScalarView.prototype.navmap = null;
ScalarView.prototype.marker = null;
ScalarView.prototype.maxSurfaceWidth = null;
ScalarView.prototype.diagram = null;
ScalarView.prototype.footer = null;
*/


/**
 * Shows a dialog box which prompts the user to enter the URL
 * of a Scalar book to render in the interface.
 */
ScalarView.prototype.showBookDialog = function(errorMessage) {

	dialog = $('<div id="book_dialog"><h1><img src="images/scalar_logo.png" alt="scalar_logo" width="76" height="70"> Scalar Interface Explorer</h1><p class="explanation">You can use this utility to test how existing Scalar books will function when rendered in the new reading interfaces we&rsquo;re currently exploring.</p><p><strong>To get started, copy and paste any URL from your book here.</strong></p><p>(The book&rsquo;s URL must be set to public.)</p><p><input id="bookUrl" type="text" onKeyPress="scalarview.handleBookDialogKeyPress(this, event)" size="80"></p><p>Select a view: <select id="viewType"><option value="standardView">Single column, linked media</option><option value="textOnlyView">Single column, no linked media</option><option value="fullScreenMedia">Single column, linked media only</option><option value="multiColumnView">Multi-column</option><option value="fullScreenTitle">Title only</option><option value="tagVisualization">Tag visualization</option></select></p><p><input type="button" class="button" value="Launch book with alternate interface" onclick="scalarview.launchBook(this, event, $(\'#viewType\').val())"></p><div id="link_list"><p>Or, try these books:</p><ul><li><a href="javascript:;">Filmic Texts and the Rise of the Fifth Estate</a>, by Virginia Kuhn</li><li><a href="javascript:;">The Knotted Line</a>, by Evan Bissell</li><li>&ldquo;<a href="javascript:;">We Are All Children of Algeria&rdquo;: Visuality and Countervisuality 1954-2011</a>, by Nicholas Mirzoeff</li><li><a href="javascript:;">The Nicest Kids in Town</a>, by Matthew F. Delmont</li></ul></div></div>').appendTo('body');
	
	$('#link_list > ul > li > a').each(function(index) { 
	
		switch (index) {
		
			case 0:
			$(this).click(function() { 
				$('#bookUrl').val('http://scalar.usc.edu/anvc/kuhn/');
				scalarview.launchBook(this, event, $('#viewType').val()); 
			});
			break;
		
			case 1:
			$(this).click(function() { 
				$('#bookUrl').val('http://scalar.usc.edu/anvc/the-knotted-line/');
				scalarview.launchBook(this, event, $('#viewType').val()); 
			});
			break;
		
			case 2:
			$(this).click(function() { 
				$('#bookUrl').val('http://scalar.usc.edu/nehvectors/mirzoeff/');
				scalarview.launchBook(this, event, $('#viewType').val()); 
			});
			break;
		
			case 3:
			$(this).click(function() { 
				$('#bookUrl').val('http://scalar.usc.edu/nehvectors/nicest-kids/');
				scalarview.launchBook(this, event, $('#viewType').val()); 
			});
			break;
		
		}
		
	});
	
	if (errorMessage != undefined) {
		dialog.append('<div class="error_message">'+errorMessage+'</div>');
	}
 
	dialog.fadeIn();
	
}

/**
 * Handles key presses in the book dialog box.
 *
 * @param {Object} control		The text field where the key press occurred.
 * @param {Object} event		The key press event.
 */
ScalarView.prototype.handleBookDialogKeyPress = function(control, event) {

	if ((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13)) {
		this.launchBook();
	}

}

/**
 * Initializes the view.
 */
ScalarView.prototype.init = function() {
	
	this.windowWidth = $(window).width();
	$(window).resize(function() { scalarview.setState(scalarview.state, 0); });
	window.onorientationchange = function() { scalarview.setState(scalarview.state, 0); };

}

/**
 * Launches the book whose URL was entered in the book dialog box.
 */
ScalarView.prototype.launchBook = function(view, event, viewType) {

	var scalarInstallId;
	var bookId;
	if ($('#bookUrl').val().indexOf('http://') != -1) {
		scalarInstallId = $('#bookUrl').val().split('/')[3];
		bookId = $('#bookUrl').val().split('/')[4];
	} else {
		scalarInstallId = $('#bookUrl').val().split('/')[1];
		bookId = $('#bookUrl').val().split('/')[2];
	}
	
	this.viewType = viewType;
	this.setBook('http://scalar.usc.edu/'+scalarInstallId+'/'+bookId+'/');
	this.setPage('index');
	
	$('#book_dialog').fadeOut();

}

/**
 * Sets the current book to be rendered in the interface.
 */
ScalarView.prototype.setBook = function(bookUrl) {

	this.singlePageMode = true;
	scalarapi.model.urlPrefix = bookUrl;
	
	var path = scalarapi.stripAllExtensions(bookUrl);
	var arr = path.split('://');
	var str;
	if (arr.length > 1) {
		str = arr[1];
	} else {
		str = arr[0];
	}
	arr = str.split('/');
	
	this.instance = arr[1];
	this.book = arr[2];

}

/**
 * Sets the current page to be rendered in the interface.
 */
ScalarView.prototype.setPage = function(pageId) {
	
	$('body').empty();
	
	this.currentURL = scalarapi.model.urlPrefix+pageId;
	if (pageId != 'toc') {
		if (scalarapi.loadPage(pageId, true, this.handlePageLoad, null, 2, false) == 'loaded') this.handlePageLoad();
	} else {
		if (scalarapi.loadBook(false, this.handleBookLoad, null) == 'loaded') this.handleBookLoad();
	}

}

/**
 * Parses the specified url and returns an object containing its Scalar
 * instance, book, and page.
 *
 * @param {String} url		The url to parse.
 * @param {String} parent	The parent book url
 */
ScalarView.prototype.scalarInfoFromURL = function(url, parent) {

	if (!url || !parent) return null;
	if (parent!=url.substr(0,parent.length)) return null;
	
	var info = {};
	
	// Get the current page slug (which could have multiple / of its own) by subtracting the parent
	if ('/'!=parent.substr(-1, 1)) parent += '/';
	info.page = scalarapi.stripAllExtensions(url.substr(parent.length));
	if (!info.page.length) info.page = 'index';

	// Assume the last segment of the parent is the book slug
	if ('/'==parent.substr(-1, 1)) parent = parent.substr(0, parent.length-1);
	info.book = parent.substr(parent.lastIndexOf('/')+1);
	
	// TODO: Assuming the instance var is only needed for prototyping ... highly dangerous to trust the URL segments as Scalar gets distributed
	var arr = parent.split('/');   // won't have trailing slash because of book slug call above
	info.instance = arr[arr.length-2];
		
	return info;

	/*if (url.indexOf('http://scalar.usc.edu') != -1) {
	
		var info = {};

		var path = scalarapi.stripAllExtensions(url);
		var arr = path.split('://');
		var str;
		if (arr.length > 1) {
			str = arr[1];
		} else {
			str = arr[0];
		}
		arr = str.split('/');
		
		info.instance = arr[1];
		info.book = arr[2];
		
		info.page = scalarapi.basepath(url);
		if (info.page = '') info.page = 'index';
		
		return info;
	}

	return null;*/
}

ScalarView.prototype.reloadForScalarPage = function(uri) {

	var path = scalarapi.stripAllExtensions(uri);
	var arr = path.split('://');
	var str;
	if (arr.length > 1) {
		str = arr[1];
	} else {
		str = arr[0];
	}
	arr = str.split('/');

	var instance = arr[1];
	if (instance == null) instance = scalarview.instance;
	var book = arr[2];
	if (book == null) book = scalarview.book;
	
	var page = scalarapi.basepath(uri);
	if ((page == '') && (uri.indexOf('/') == -1)) {
		page = uri;
	} else {
		page = 'index';
	}
	
	//console.log('reload: '+scalarapi.stripAllExtensions(document.URL)+'.html#instance='+instance+'&book='+book+'&page='+page);
	
	window.location = scalarapi.stripAllExtensions(document.URL)+'.html#instance='+instance+'&book='+book+'&page='+page;
	window.location.reload();
	
}

/**
 * Handles processing of the data for the current page.
 */
ScalarView.prototype.handlePageLoad = function() {
	scalarview.currentNode = scalarapi.model.nodesByURL[scalarview.currentURL];
	if (scalarapi.loadBook(false, scalarview.handleBookLoad, null) == 'loaded') scalarview.handleBookLoad();
}

/**
 * Handles processing of the data for the current book.
 */
ScalarView.prototype.handleBookLoad = function() {

	scalarview.tocNode = scalarapi.model.nodesByURL[scalarapi.model.urlPrefix+'toc'];

	if (scalarview.currentURL == (scalarapi.model.urlPrefix+'toc')) {
		scalarview.currentNode = scalarview.tocNode;
	}

	var visited = $.cookie('scalarvisited');
	if (visited) {
		scalarview.visitedURLs = visited.split('|');
		if (scalarview.visitedURLs.indexOf(scalarview.currentURL) == -1) {
			visited += '|'+scalarview.currentURL;
		}
	} else {
		visited = scalarview.currentURL;
	}
	$.cookie('scalarvisited', scalarview.visitedURLs.join('|'), {path:"/"});
	
	var marked = $.cookie('scalarmarked');
	if (marked) {
		this.markedURLs = marked.split('|');
	}
	
	var currentZoom = -1;
	if (scalarview.pinwheel) {
		currentZoom = scalarview.pinwheel.currentZoom;
	}
	
	scalarview.basin = new ScalarBasin();
	scalarview.pinwheel = new ScalarPinwheel();
	scalarview.surface = new ScalarSurface();
	
	if (currentZoom != -1) {
		scalarview.pinwheel.currentZoom = currentZoom;
	}
	
	//scalarview.navmap = new NavigationMap();
	
	scalarview.basin.render();
	scalarview.pinwheel.render();
	scalarview.surface.render(scalarview.viewType);
	//scalarview.surface.render('fullScreenMedia');
	
	// restore last state, if any
	var currentState = $.cookie('viewstate');
	if (currentState == null) currentState = 'reading';
	scalarview.setState(currentState, 0, true);
	//scalarview.surface.render('fullScreenTitle');
	
	scalarview.setState(currentState, 0, false);
	
}

/**
 * Sets the current state of the page.
 *
 * @param	newState 	The new state.
 * @param	duration	Duration of the transition to the new state.
 * @param	propsOnly	If true, modify properties only, not dom elements.
 */
ScalarView.prototype.setState = function(newState, duration, propsOnly) {

	if (duration == 'fast') duration = 300;
	
	this.stateProperties = [];
	
	switch (newState) {
	
		case 'reading':
		if ((this.state == 'editing') || (this.state == 'designing')) {
			scrollTo(0,0);
		}
		break;
		
		case 'navigating':
		break;
		
		case 'editing':
		if (this.state == 'reading') {
			scrollTo(0,0);
		}
		break;
		
		case 'designing':
		break;
	
	}
	
	this.basin.setState(newState, duration, propsOnly);
	this.surface.setState(newState, duration, propsOnly);
	this.pinwheel.setState(newState, duration, propsOnly);

	this.state = newState;
	
	this.marginsCollapsed = (this.windowWidth < (1024 - (this.surface.defaultMargin * 2) + 20));
	
	if (!propsOnly) {
		this.startTransition(this.stateProperties, duration);
	} else {
		var i;
		var n = this.stateProperties.length;
		var propData;
		for (i=0; i<n; i++) {
			propData = this.stateProperties[i];
			propData.context[propData.property] = propData.value;
		}
	}
	
	$.cookie('viewstate', this.state, {path: '/'});
	
	this.update();

}

/**
 * Updates layout of items in the view.
 *
 * @param	duration		Duration of the update.
 */
ScalarView.prototype.update = function(duration) {
	this.windowWidth = $(window).width();
	this.basin.update(duration);
	this.surface.update(duration);
	this.pinwheel.update(duration);
}

/**
 * Sets up an animated property transition on the view.
 */
ScalarView.prototype.startTransition = function(propertyList, duration) {

	var currentTime = new Date();
	this.startTime = currentTime.getTime();
	this.transitionDuration = duration;
	this.transitionTimer = setTimeout('handleTransitionStep()', 13);
	
	var i;
	var n = this.stateProperties.length;
	var propData;
	for (i=0; i<n; i++) {
		propData = this.stateProperties[i];
		propData.start = propData.context[propData.property];
		propData.change = propData.value - propData.context[propData.property];
	}

}

/**
 * @param t a raphael text shape
 * @param width - pixels to wrapp text width
 * @param textAnchor - desired end state of text anchor (added by Erik)
 * modify t text adding new lines characters for wrapping it to given width.
 * source: http://stackoverflow.com/questions/3142007/how-to-either-determine-svg-text-box-width-or-force-line-breaks-after-x-chara
 */
ScalarView.prototype.wrapText = function(t, width, textAnchor) {
    var content = t.attr("text");
    var abc="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    t.attr({'text-anchor': 'start', "text": abc});
    var letterWidth=t.getBBox().width / abc.length;
    t.attr({"text": content});
    var words = content.split(" "), x=0, s=[];
    var wordsInThisLine = 0;
    for ( var i = 0; i < words.length; i++) {
        var l = words[i].length;
        if (((x+(l*letterWidth))>width) && (wordsInThisLine > 0)) {
            s.push("\n")
            x=0;
            wordsInThisLine = 0;
        } else {
            x+=l*letterWidth;
            wordsInThisLine++;
        }
        s.push(words[i]+" ");
    }
    t.attr({"text": s.join(""), 'text-anchor':textAnchor});
    var boxHeight = t.getBBox().height;
	t.attr('y', t.attr('y')+(boxHeight * .5));
};

function handleTransitionStep() {

	var currentTime = new Date();
	var progress = (currentTime.getTime() - scalarview.startTime) / scalarview.transitionDuration;
	var value;
	var i;
	var n = scalarview.stateProperties.length;
	var propData;

	if (progress < 1) {
		for (i=0; i<n; i++) {
			propData = scalarview.stateProperties[i];
			value = swingEasing(progress, propData.start, propData.change);
			propData.context[propData.property] = value;
		}
		scalarview.transitionTimer = setTimeout('handleTransitionStep()', 13);
	} else {
		for (i=0; i<n; i++) {
			propData = scalarview.stateProperties[i];
			propData.context[propData.property] = propData.value;
		}
	}
	
	scalarview.update(0);

}

// G: progress, E: start value, F: change in value
function swingEasing(G,E,F) {
	return ((-Math.cos(G*Math.PI)/2)+0.5)*F+E;
}

function ScalarPinwheel() {

	this.nodeGraph = [];
	this.relationsToDraw = ['path','tag'];
	this.showHistory = false;
	this.showIcons = false;
	this.expandedNodes = [];
	this.currentZoom = 0;
	this.zoomThreshold = 6;
	this.filter = null;
	this.pathGraphs = {};
	this.pathGraphCount = 0;

}

ScalarPinwheel.prototype.nodeGraph = null;
ScalarPinwheel.prototype.relationsToDraw = null;
ScalarPinwheel.prototype.showHistory = null;
ScalarPinwheel.prototype.showIcons = null;
ScalarPinwheel.prototype.expandedNodes = null;
ScalarPinwheel.prototype.currentZoom = null;
ScalarPinwheel.prototype.zoomThreshold = null;
ScalarPinwheel.prototype.canvas = null;
ScalarPinwheel.prototype.canvasSet = null;
ScalarPinwheel.prototype.center = null;
ScalarPinwheel.prototype.unitSize = null;
ScalarPinwheel.prototype.filter = null;
ScalarPinwheel.prototype.pathGraphs = null;
ScalarPinwheel.prototype.pathGraphCount = null;
ScalarPinwheel.prototype.viewer = null;

ScalarPinwheel.prototype.render = function() {
	
	//console.log('**** RENDER ****');

	this.element = $('<div id="graph"></div>').appendTo('body');
	
	var handleBackgroundClick = function(e) {
	
		switch (scalarview.state) {
		
			case 'reading':
			scalarview.setState('navigating', 'fast', false);
			break;
			
			case 'navigating':
			scalarview.setState('reading', 'fast', false);
			break;
			
			case 'editing':
			scalarview.setState('reading', 'fast', false);
			break;
			
			case 'designing':
			scalarview.setState('reading', 'fast', false);
			break;
			
		}
		
	}
	
	this.element.click(handleBackgroundClick);
	
	viewerElement = $('<div id="gnViewer" class="graphNodeViewer"></div>').appendTo('body');
	this.viewer = new GraphNodeViewer('gnViewer');
	
	//this.element.css('display', 'none');

	this.canvas = Raphael('graph', $(window).width(), $(window).height());
	
	var zoomControls = $('<div id="zoomControls"></div>').appendTo('#graph');
	this.zoomIn = Raphael('zoomControls', 32, 32);
	this.zoomIn.path('M25.979,12.896 19.312,12.896 19.312,6.229 12.647,6.229 12.647,12.896 5.979,12.896 5.979,19.562 12.647,19.562 12.647,26.229 19.312,26.229 19.312,19.562 25.979,19.562z').attr({fill: '#000', stroke: 'none'}).click(function(event) {
		event.stopImmediatePropagation();
		if (scalarview.pinwheel.currentZoom > 0) {
			scalarview.pinwheel.currentZoom--;
		}
		scalarview.pinwheel.buildGraph();
	});
	this.zoomOut = Raphael('zoomControls', 32, 32);
	this.zoomOut.path('M25.979,12.896,5.979,12.896,5.979,19.562,25.979,19.562z').attr({fill: '#000', stroke: 'none'}).click(function(event) {
		event.stopImmediatePropagation();
		if (scalarview.pinwheel.currentZoom < 6) {
			scalarview.pinwheel.currentZoom++;
		}
		scalarview.pinwheel.buildGraph();
	})
	
	/*
	var circle = this.canvas.circle(50, 40, 10);
	circle.attr('fill', '#f00');
	circle.attr('stroke', '#fff');
	
	var path = this.canvas.path('M65 144 q 126 0 252 144 q 126 144 252 144');
	path.attr('stroke', '#f00');
	path.attr('stroke-width', '5');
	*/
	
	this.buildGraph();
	
	//console.log('---- current node graph ----');
	//console.log(this.nodeGraph);

}

ScalarPinwheel.prototype.buildGraph = function() {

	this.nodeGraph = [];
	this.pathGraphs = {};
	this.pathGraphCount = 0;
	
	this.calculateDimensions();

	var graphNode = this.createGraphNode([scalarview.currentNode], {x:0, y:0}, 'none', {type:'current', data: null});
	
	this.resetNodeGraphDrawing();
	this.canvas.setStart();
	
	if (graphNode != null) {
		this.addGraphNodeRelations(graphNode, 0);
		//this.makeSiblingsLateral();
		this.drawGraphNode(graphNode);
	}
	
	this.canvasSet = this.canvas.setFinish();

}

ScalarPinwheel.prototype.update = function(duration) {
	
	//console.log('**** UPDATE ****');
	
	this.calculateDimensions();
	this.canvas.setSize($(window).width(), $(window).height());
	this.resetNodeGraphDrawing();
	this.canvas.setStart();
	this.drawGraphNode(this.nodeGraph[0]);
	this.canvasSet = this.canvas.setFinish();

}

/**
 * Sets the current state of the page.
 *
 * @param	newState 	The new state.
 * @param	duration	Duration of the transition to the new state.
 * @param	propsOnly	If true, modify properties only, not dom elements.
 */
ScalarPinwheel.prototype.setState = function(newState, duration, propsOnly) {

	switch (newState) {
	
		case 'reading':
		if (this.currentZoom != 0) {
			this.currentZoom = 0;
			this.update(duration);
		}
		break;
	
	}

}

ScalarPinwheel.prototype.resetNodeGraphDrawing = function() {

	this.canvas.clear();

	var i;
	var n = this.nodeGraph.length;
	for (i=0; i<n; i++) {
		this.nodeGraph[i].reset();
	}

}

ScalarPinwheel.prototype.calculateDimensions = function() {

	this.center = {
		x: $(window).width() * .5, 
		y: $(window).height() * .5
	};
	
	this.unitSize = {
		x: (($(window).width() * .5) - (scalarview.surface.currentMargin * .5)) / (this.currentZoom + 1),
		y: Math.round($(window).height() / (((this.currentZoom + 1) * 2) + 1))
	}  

}

ScalarPinwheel.prototype.invertGraphVector = function(graphVector) {

	switch (graphVector) {
	
		case 'up':
		return 'down';
		break;
		
		case 'down':
		return 'up';
		break;
		
		case 'left':
		return 'right';
		break;
		
		case 'right':
		return 'left';
		break;
	
	}

	return 'up';
}

ScalarPinwheel.prototype.createGraphNode = function(nodes, graphPosition, graphVector, reason) {  
	
	// TODO: figure out some way to sort the vectors based on the type of relationship being expressed (i.e. paths before tags, etc.)  
	
	if (nodes.length > 0) {  
 		var graphNode = new GraphNode(nodes, graphPosition, reason); 
		this.addNodeToGraph(graphNode, graphVector); 
		return graphNode;     
	}   
	 
	return null;
}          

ScalarPinwheel.prototype.addNodeToGraph = function(graphNode, graphVector) { 
	
	var existingNode = this.graphNodeAtPosition(graphNode);    
	
	if (existingNode != null) {
		if (existingNode.isCurrentNode()) {
			this.moveGraphNode(graphNode, this.invertGraphVector(graphVector));
		} else {
			this.moveGraphNode(existingNode, graphVector);
		}
	}
	
	//console.log('---- add graph node "'+graphNode.getDisplayTitle()+'" at '+graphNode.position.x+','+graphNode.position.y+' ----');
	
	this.nodeGraph.push(graphNode);
	
} 

ScalarPinwheel.prototype.addGraphNodeRelations = function(graphNode, currentDepth) {   

	//console.log('add relations for '+graphNode.nodes[0].getDisplayTitle()+' at depth '+currentDepth);
	
	//console.log('  -- add relations for graph node "'+graphNode.getDisplayTitle()+'" ----');
	
	if (((this.currentZoom == 0) && (currentDepth <= this.currentZoom)) || ((this.currentZoom > 0) && (currentDepth <= 6))) {
		
 		var parentNodes = 0;     
		var childNodes = 0;
		var olderSiblingNodes = -1;     
		var youngerSiblingNodes = -1;     

		var position;     
		var newGraphNode; 
		var parents;
		var parent;
		var relation;
		var pathGraph;
		var children;   
		var sibling;      
		var stepSiblings; 
		var index;  
		var okToProceed;
		var i;
		var j;
		
		if (graphNode.nodes.length == 1) {

			// add parents  
			if ((graphNode.reason.type == 'current') || (graphNode.reason.type == 'parent')) {
				for (i=0; i<this.relationsToDraw.length; i++) {
					parents = graphNode.getNewParentsForRelation(this.relationsToDraw[i], 'incoming', currentDepth); 
					if (parents.length > 0) {
		
						/*
						// separate all expanded nodes into their own nodes  
						for (j=0; j<expandedNodes.length; j++) {   
							index = parents.indexOf(expandedNodes[i]);
							if (index != -1) {
								parentNodes++;    
								parents.splice(index, 1);
		 						position = (graphNode.x - 1, graphNode.y - parentNodes);
								newGraphNode = createGraphNode(expandedNodes[i], position, 'up'); 
								addGraphNodeRelations(newGraphNode, currentDepth+1);
								graphNode.parents.push({relation:relationsToDraw[i], node:newGraphNode});
		   					}
						}  
						*/
						if (parents.length < 6) {
							for (j=0; j<parents.length; j++) {
								parentNodes++;        
								position = {x:graphNode.position.x - 1, y:graphNode.position.y - parentNodes};
								newGraphNode = this.createGraphNode([parents[j]], position, 'none', {type:'parent', data:null}); 
								graphNode.parents.push({relation:this.relationsToDraw[i], node:newGraphNode});
								newGraphNode.children.push({relation:this.relationsToDraw[i], node:graphNode});
								this.addGraphNodeRelations(newGraphNode, currentDepth+1);
							}
						} else {
							parentNodes++;        
							position = {x:graphNode.position.x - 1, y:graphNode.position.y - parentNodes};
							newGraphNode = this.createGraphNode(parents, position, 'none', {type:'parent', data:null}); 
							graphNode.parents.push({relation:this.relationsToDraw[i], node:newGraphNode});
							newGraphNode.children.push({relation:this.relationsToDraw[i], node:graphNode});
							//this.addGraphNodeRelations(newGraphNode, currentDepth+1);
						}
		
						/*
						parentNodes++;        
						position = {x:graphNode.position.x - 1, y:graphNode.position.y - parentNodes};
						newGraphNode = this.createGraphNode(parents, position); 
						graphNode.parents.push({relation:this.relationsToDraw[i], node:newGraphNode});
						newGraphNode.children.push({relation:this.relationsToDraw[i], node:graphNode});
						if (parents.length == 1) this.addGraphNodeRelations(newGraphNode, currentDepth+1);
						*/
					}     
				}
			}
	
			// add children    
			if ((graphNode.reason.type == 'current') || (graphNode.reason.type == 'child')) {
				for (i=0; i<this.relationsToDraw.length; i++) {
					children = graphNode.getNewChildrenForRelation(this.relationsToDraw[i], 'outgoing'); 
					if (children.length > 0) {
						
						/*
						// separate all expanded nodes into their own nodes  
						for (j=0; j<expandedNodes.length; j++) {   
							index = children.indexOf(expandedNodes[i]);
							if (index != -1) {
								childNodes++;    
								children.splice(index, 1);
		 						position = (graphNode.x - 1, graphNode.y + childNodes);
								newGraphNode = createGraphNode(expandedNodes[i], position, 'down', {type:'child', data:null}); 
								addGraphNodeRelations(newGraphNode, currentDepth+1); 
								graphNode.children.push({relation:relationsToDraw[i], node:newGraphNode});
		   					}
						} */
						
						/*
						for (j=0; j<children.length; j++) {
							childNodes++;
							position = {x:graphNode.position.x + 1, y:graphNode.position.y + childNodes};
							newGraphNode = this.createGraphNode([children[j]], position, {type:'child', data:null});
							graphNode.children.push({relation:this.relationsToDraw[i], node:newGraphNode});
							newGraphNode.parents.push({relation:this.relationsToDraw[i], node:graphNode});
							if (children.length == 1) this.addGraphNodeRelations(newGraphNode, currentDepth+1);
						}*/
						
						childNodes++;
						position = {x:graphNode.position.x + 1, y:graphNode.position.y + childNodes};
						/*if ((currentDepth+1) < this.currentZoom) {
							newGraphNode = this.createGraphNode([children[0]], position, {type:'child', data:null});
						} else {*/
							newGraphNode = this.createGraphNode(children, position, 'none', {type:'child', data:graphNode});
						//}
						graphNode.children.push({relation:this.relationsToDraw[i], node:newGraphNode});
						newGraphNode.parents.push({relation:this.relationsToDraw[i], node:graphNode});
						if (newGraphNode.nodes.length == 1) this.addGraphNodeRelations(newGraphNode, currentDepth+1);
					}     
				}
			}
		
		}

		// add siblings (note "older" = "on the left")                            
 
 		//if (graphNode.parents.length > 0) {
 		if (graphNode.nodes[0].getRelations('path', 'incoming', 'index').length > 0) {
 		
 			switch (graphNode.reason.type) {
 			
 				case 'current':
 				for (i=0; i<graphNode.parents.length; i++) {
 				
 					parent = graphNode.parents[i].node;
 					
 					sibling = graphNode.getNextOlderSiblingForParent(parent);
 					if (sibling != null) {
	 					pathGraph = this.pathGraphs[parent.nodes[0].url];
	 					position = {x:graphNode.position.x-1, y:graphNode.position.y+pathGraph.offset.y};
	 					newGraphNode = this.createGraphNode([sibling.node], position, 'left', {type:'olderSibling', data:parent});
						graphNode.olderStepSiblings.push({node:newGraphNode});  
						newGraphNode.youngerStepSiblings.push({node:graphNode});
 						this.addGraphNodeRelations(newGraphNode, currentDepth+1);
					}
 					
 					sibling = graphNode.getNextYoungerSiblingForParent(parent);
 					if (sibling != null) {
	 					pathGraph = this.pathGraphs[parent.nodes[0].url];
	 					position = {x:graphNode.position.x+1, y:graphNode.position.y-pathGraph.offset.y};
	 					newGraphNode = this.createGraphNode([sibling.node], position, 'left', {type:'youngerSibling', data:parent});
						graphNode.youngerStepSiblings.push({node:newGraphNode});  
						newGraphNode.olderStepSiblings.push({node:graphNode});
 						this.addGraphNodeRelations(newGraphNode, currentDepth+1);
					}
 				}
 				break;
 				
 				case 'olderSibling':
				parent = graphNode.reason.data;
				sibling = graphNode.getNextOlderSiblingForParent(parent);
				if (sibling != null) {
 					position = {x:graphNode.position.x-1, y:graphNode.position.y};
 					newGraphNode = this.createGraphNode([sibling.node], position, 'left', {type:'olderSibling', data:parent});
					graphNode.olderStepSiblings.push({node:newGraphNode});  
					newGraphNode.youngerStepSiblings.push({node:graphNode});
					this.addGraphNodeRelations(newGraphNode, currentDepth+1);
				}
 				break;
 				
 				case 'youngerSibling':
				parent = graphNode.reason.data;
				sibling = graphNode.getNextYoungerSiblingForParent(parent);
				if (sibling != null) {
 					position = {x:graphNode.position.x+1, y:graphNode.position.y};
 					newGraphNode = this.createGraphNode([sibling.node], position, 'left', {type:'youngerSibling', data:parent});
					graphNode.youngerStepSiblings.push({node:newGraphNode});  
					newGraphNode.olderStepSiblings.push({node:graphNode});
					this.addGraphNodeRelations(newGraphNode, currentDepth+1);
				}
 				break;
 			
 			}
 			
 			/*
			sibling = graphNode.getNextOlderSibling();
			//sibling = // next older sibling from the nearest parent (don't include siblings that have already been processed)           
			if (sibling != null) {
				//console.log(graphNode.nodes[0].getDisplayTitle()+' has an older sibling');
				olderSiblingNodes++;
				position = {x:graphNode.position.x - 1, y:graphNode.position.y + olderSiblingNodes};
				newGraphNode = this.graphNodeForScalarNode(sibling.node);
				if (newGraphNode == null) newGraphNode = this.createGraphNode([sibling.node], position, 'left'); 
				graphNode.olderSibling = {node:newGraphNode, parent:this.graphNodeForScalarNode(sibling.parent), scalarParent:sibling.parent};  
				newGraphNode.youngerSibling = {node:graphNode, parent:this.graphNodeForScalarNode(sibling.parent), scalarParent:sibling.parent};
				this.addGraphNodeRelations(newGraphNode, currentDepth+1);
			}

			sibling = graphNode.getNextYoungerSibling();
			//sibling = // next younger sibling from the nearest parent (don't include siblings that have already been processed)
	   		if (sibling != null) {  
				//console.log(graphNode.nodes[0].getDisplayTitle()+' has a younger sibling');
				youngerSiblingNodes++;
				position = {x:graphNode.position.x + 1, y:graphNode.position.y + youngerSiblingNodes};
				newGraphNode = this.graphNodeForScalarNode(sibling.node);
				if (newGraphNode == null) newGraphNode = this.createGraphNode([sibling.node], position, 'right'); 
				graphNode.youngerSibling = {node:newGraphNode, parent:this.graphNodeForScalarNode(sibling.parent), scalarParent:sibling.parent};     
				newGraphNode.olderSibling = {node:graphNode, parent:this.graphNodeForScalarNode(sibling.parent), scalarParent:sibling.parent};
				this.addGraphNodeRelations(newGraphNode, currentDepth+1);       
			}
			
			//if ((graphNode.nodes.length == 1) && (graphNode.nodes[0] == scalarview.currentNode)) {
			
				// add older step-siblings
				stepSiblings = graphNode.getNextOlderStepSiblings();
				//console.log(graphNode.nodes[0].getDisplayTitle()+' has '+stepSiblings.length+' older step-siblings');
				for (i=0; i<stepSiblings.length; i++) {
					okToProceed = true;
					if (graphNode.olderSibling != null) {
						okToProceed = (stepSiblings[i] != graphNode.olderSibling.node.nodes[0]);
					}
					if (okToProceed) {
						olderSiblingNodes++;  
						position = {x:graphNode.position.x - 1, y:graphNode.position.y + olderSiblingNodes};
						newGraphNode = this.graphNodeForScalarNode(stepSiblings[i].node);
						if (newGraphNode == null) newGraphNode = this.createGraphNode([stepSiblings[i].node], position, (olderSiblingNodes > 0) ? 'down' : 'left');
						graphNode.olderStepSiblings.push({node:newGraphNode, parent:this.graphNodeForScalarNode(stepSiblings[i].parent), scalarParent:stepSiblings[i].parent});
						newGraphNode.youngerStepSiblings.push({node:graphNode, parent:this.graphNodeForScalarNode(stepSiblings[i].parent), scalarParent:stepSiblings[i].parent});
						this.addGraphNodeRelations(newGraphNode, currentDepth+1);
					}
				}
				
				// add younger step-siblings
				stepSiblings = graphNode.getNextYoungerStepSiblings();
				//console.log(graphNode.nodes[0].getDisplayTitle()+' has '+stepSiblings.length+' younger step-siblings');
				for (i=0; i<stepSiblings.length; i++) {
					okToProceed = true;
					if (graphNode.youngerSibling != null) {
						okToProceed = (stepSiblings[i] != graphNode.youngerSibling.node.nodes[0]);
					}
					if (okToProceed) {
						youngerSiblingNodes++;  
						position = {x:graphNode.position.x + 1, y:graphNode.position.y - youngerSiblingNodes};
						newGraphNode = this.graphNodeForScalarNode(stepSiblings[i].node);
						if (newGraphNode == null) newGraphNode = this.createGraphNode([stepSiblings[i].node], position, (youngerSiblingNodes > 0) ? 'up' : 'right');
						graphNode.youngerStepSiblings.push({node:newGraphNode, parent:this.graphNodeForScalarNode(stepSiblings[i].parent), scalarParent:stepSiblings[i].parent});
						newGraphNode.olderStepSiblings.push({node:graphNode, parent:this.graphNodeForScalarNode(stepSiblings[i].parent), scalarParent:stepSiblings[i].parent});
						this.addGraphNodeRelations(newGraphNode, currentDepth+1); 
					}
				}
			
			//}*/
		}

		// TODO: collapse successive siblings with no changes in parentage and no children into single graph nodes if currentZoom > 0, and expand any expanded nodes within that
		
   }
	
	//console.log('  -- done adding relations for graph node "'+graphNode.getDisplayTitle()+'" ----');
	
} 

ScalarPinwheel.prototype.makeSiblingsLateral = function() {
	
	var i;
	var j;
	var n = this.nodeGraph.length;
	var o;
	var graphNode;
	var sibling;
	for (i=0; i<n; i++) {
		graphNode = this.nodeGraph[i];
		if (graphNode.olderSibling != null) {
			if (graphNode.sharesColumnWithNode(graphNode.olderSibling.node)) {
				this.moveGraphNode(graphNode.olderSibling.node, 'left');
			}
		}
		o = graphNode.olderStepSiblings.length;
		for (j=0; j<o; j++) {
			sibling = graphNode.olderStepSiblings[j];
			if (graphNode.sharesColumnWithNode(sibling.node)) {
				this.moveGraphNode(sibling.node, 'left');
			}
			if (graphNode.sharesRowWithNode(sibling.node) && (Math.abs(graphNode.position.x - sibling.node.position.x) > 1)) {
				this.moveGraphNode(sibling.node, 'down');
			}
		}
		if (graphNode.youngerSibling != null) {
			if (graphNode.sharesColumnWithNode(graphNode.youngerSibling.node)) {
				this.moveGraphNode(graphNode.youngerSibling.node, 'right');
			}
		}
		o = graphNode.youngerStepSiblings.length;
		for (j=0; j<o; j++) {
			sibling = graphNode.youngerStepSiblings[j];
			if (graphNode.sharesColumnWithNode(sibling.node)) {
				this.moveGraphNode(sibling.node, 'right');
			}
			if (graphNode.sharesRowWithNode(sibling.node) && (Math.abs(graphNode.position.x - sibling.node.position.x) > 1)) {
				this.moveGraphNode(sibling.node, 'up');
			}
		}
	}
	
}

/**
 * Returns the first graph node encountered at the specified position (if any).
 *
 * @param {Object} graphNode		The node whose position we're going to check (we won't include this node in the results).
 */
ScalarPinwheel.prototype.graphNodeAtPosition = function(graphNode) {

	var i;
	var n = this.nodeGraph.length;
	var position;
	for (i=0; i<n; i++) {
		if (this.nodeGraph[i] != graphNode) {
			position = this.nodeGraph[i].position;
			if ((position.x == graphNode.position.x) && (position.y == graphNode.position.y)) {
				return this.nodeGraph[i];
			}
		}
	}

	return null;
}

/**
 * Returns true if the given Scalar node is already represented by a graph node.
 *
 * @param {Object} scalarNode		The Scalar node to look for.
 */
ScalarPinwheel.prototype.graphNodeForScalarNode = function(scalarNode) {

	var i;
	var n = this.nodeGraph.length;
	for (i=0; i<n; i++) {
		if (this.nodeGraph[i].nodes.indexOf(scalarNode) != -1) {
			return this.nodeGraph[i];
		}
	}

	return null;
}

/**
 * Attemps to move the specified graph node in the specified direction.
 *
 * @param {Object} graphNode		The node to be moved.
 * @param {String} vector			The direction in which to move the node.
 */
ScalarPinwheel.prototype.moveGraphNode = function(graphNode, graphVector) {   
	
	var existingNode;  
	var actualVector = graphVector;
	
	switch (graphVector) {
		
		case 'up':    
		graphNode.position.y--;
		break;
		
		case 'right':   
		//if ((graphNode.parents.length == 0) && (graphNode.olderSibling == null) && (graphNode.olderStepSiblings.length == 0)) {
			graphNode.position.x++;
		/*} else {
			actualVector = 'down';
			graphNode.position.y++;
		}*/
		break;
		
		case 'down':    
		graphNode.position.y++;
		break;
		
		case 'left':   
		//if ((graphNode.children.length == 0) && (graphNode.youngerSibling == null) && (graphNode.youngerStepSiblings.length == 0)) {
			graphNode.position.x--;
		/*} else {
			actualVector = 'up';
			graphNode.position.y--;
		}*/
		break;
		
		default:
		actualVector = 'down';
		graphNode.position.y++;
		break;
		
	}   
	
	//console.log('---- move graph node "'+graphNode.getDisplayTitle()+'" to '+graphNode.position.x+','+graphNode.position.y+' ----');
	
	existingNode = this.graphNodeAtPosition(graphNode);    
	
	if (existingNode != null) {
		this.moveGraphNode(existingNode, actualVector);
	}  
	
	var siblings = this.getGraphNodeSiblings(graphNode, []);
	for (i=0; i<siblings.length; i++) {
		existingNode = this.graphNodeAtPosition(siblings[i].node);    
 		if (existingNode != null) {
			this.moveGraphNode(existingNode, actualVector);
		}  
	}
	
}

ScalarPinwheel.prototype.drawGraphNode = function(graphNode) {

	var me = this;

	if (!graphNode.hasBeenDrawn) {

		//console.log('---- draw graph node "'+graphNode.getDisplayTitle()+'"----');
		
		graphNode.hasBeenDrawn = true;
		
		var drawLabels = (this.currentZoom <= this.zoomThreshold);
		
		var labelWidth;
		if (this.currentZoom == 0) {
			labelWidth = scalarview.surface.currentMargin * .8;
		} else {
			labelWidth = this.unitSize.x * .8;
		}
	
		var drawAsContainer = false;
		var color;
		if (graphNode.nodes.length == 1) {
			if ((graphNode.children.length > 0)) {
				drawAsContainer = true;
				if (graphNode.nodes[0].color) {
					color = graphNode.nodes[0].color;
				} else {
					color = '#888';
				}
			}
		}
		
		var canvasPosition = {
			x: this.center.x + (graphNode.position.x * this.unitSize.x),
			y: this.center.y + (graphNode.position.y * this.unitSize.y) 
		}
		
		//console.log('     '+graphNode.position.x+','+graphNode.position.y);
		
		//console.log('draw node '+graphNode.nodes[0].getDisplayTitle()+' at '+canvasPosition.x+','+canvasPosition.y);
		
		graphNode.drawing = this.canvas.set();
		var outerCircle;
		var innerCircle;
		var label;
		var i;
		
		var goToPage = function(event) { 
			event.stopImmediatePropagation();
			if (scalarview.state == 'navigating') {
				me.canvasSet.animate({'transform':'t'+(-me.unitSize.x*graphNode.position.x)+','+(-me.unitSize.y*graphNode.position.y)}, 350, '<>', function() {
					scalarview.setPage(scalarapi.basepath(graphNode.nodes[0].url)); 
				})
			} else {
				scalarview.setPage(scalarapi.basepath(graphNode.nodes[0].url));
			}
		};

		//console.log(graphNode.nodes[0].getDisplayTitle()+' '+graphNode.nodes.length);
	
		if (graphNode.nodes.length > 0) {
			
			if (graphNode.nodes.length > 1) {
		
				outerCircle = this.canvas.circle(canvasPosition.x, canvasPosition.y, 16);
			
				if (!this.showIcons) {
					// draw homogenous multi-node
					innerCircle = this.canvas.circle(canvasPosition.x, canvasPosition.y, 3.5);
					var innerCircleA = this.canvas.circle(canvasPosition.x - 9, canvasPosition.y, 3.5);
					var innerCircleB = this.canvas.circle(canvasPosition.x + 9, canvasPosition.y, 3.5);
					outerCircle.attr({'fill':'#fff', 'stroke':'#000', 'stroke-width':2, 'cursor':'pointer'});
					innerCircle.attr({'fill':'#000', 'stroke':'none', 'cursor':'pointer'});
					innerCircleA.attr({'fill':'#000', 'stroke':'none', 'cursor':'pointer'});
					innerCircleB.attr({'fill':'#000', 'stroke':'none', 'cursor':'pointer'});
					graphNode.drawing.push(outerCircle, innerCircle, innerCircleA, innerCircleB);
					if (drawLabels) {
						label = this.canvas.text(canvasPosition.x, canvasPosition.y+20, graphNode.getDisplayTitle());
						label.attr({'font-family':'\'Lato\', Arial, sans-serif', 'font-size':'16px', 'cursor':'pointer'});
						scalarview.wrapText(label, labelWidth, 'middle');
						graphNode.drawing.push(label);
					}
					outerCircle.click(function() { 
						me.viewer.showForGraphNode(graphNode);
					});
				} else {
					// draw heterogeneous multi-node
				}
				
			} else if (graphNode.nodes[0] == scalarview.currentNode) {    
		
				if (scalarview.currentNode.color) {
					outerCircle = this.canvas.circle(canvasPosition.x, canvasPosition.y, 18);
				} else {
					outerCircle = this.canvas.circle(canvasPosition.x, canvasPosition.y, 16);
				}
			 
				if (!this.showIcons) {
					innerCircle = this.canvas.circle(canvasPosition.x, canvasPosition.y, 3.5);
					if (scalarview.currentNode.color) {
						color = Raphael.getRGB(graphNode.nodes[0].color);
						color = Raphael.rgb2hsl(color.r, color.g, color.b);
						color.l = Math.max(0, color.l - .1);
						outerCircle.attr({'fill':Raphael.hsl2rgb(color).hex, 'stroke':'#eee', 'stroke-width':2, 'cursor':'pointer'});
						innerCircle.attr({'fill':'#eee', 'stroke':'none', 'cursor':'pointer'});
					} else {
						outerCircle.attr({'fill':'#fff', 'stroke-width':2, 'cursor':'pointer'});
						innerCircle.attr({'fill':'#000', 'stroke':'none', 'cursor':'pointer'});
					}
					graphNode.drawing.push(outerCircle, innerCircle);
					if (drawLabels) {
						label = this.canvas.text(canvasPosition.x, canvasPosition.y+20, graphNode.getDisplayTitle());
						label.attr({'font-family':'\'Lato\', Arial, sans-serif', 'font-size':'16px', 'cursor':'pointer'});
						scalarview.wrapText(label, labelWidth, 'middle');
						graphNode.drawing.push(label);
					}
				} else {
					// draw node with dominant type icon in currentNode style
				}  
				
			} else {  
			
				if (this.currentZoom == 0) {
					outerCircle = this.canvas.circle(canvasPosition.x, canvasPosition.y, 18);
					var rotationString = '';
					if (graphNode.position.x < 0) {
						if (graphNode.position.y < 0) {
							rotationString = 'r-90t1,-0.5';
						} else {
							rotationString = 'r180t1,0';
						}
					} else {
						if (graphNode.position.y > 0) {
							rotationString = 'r90t0,0.5';
						}
					}
					var transformString = 't'+canvasPosition.x+','+canvasPosition.y+rotationString;
					var pathString = Raphael.transformPath('M1,9.219V4H-9v-8H1v-5.219l9.375,9.062L1,9.219z', transformString);
					innerCircle = this.canvas.path(pathString);
					
				} else {
					outerCircle = this.canvas.circle(canvasPosition.x, canvasPosition.y, 16);
					innerCircle = this.canvas.circle(canvasPosition.x, canvasPosition.y, 3.5);
				}
				
				if (graphNode.nodes[0].color) {
					color = Raphael.getRGB(graphNode.nodes[0].color);
					color = Raphael.rgb2hsl(color.r, color.g, color.b);
					color.l = Math.max(0, color.l - .1);
					outerCircle.attr({'fill':Raphael.hsl2rgb(color).hex, 'stroke':'#eee', 'stroke-width':3, 'cursor':'pointer'});
					innerCircle.attr({'fill':'#fff', 'stroke':'none', 'cursor':'pointer'});
					
				} else if (((graphNode.reason.type == 'child') || (graphNode.reason.type == 'youngerSibling') || (graphNode.reason.type == 'olderSibling'))) {
					color = Raphael.getRGB(graphNode.reason.data.nodes[0].color);
					color = Raphael.rgb2hsl(color.r, color.g, color.b);
					color.l = Math.max(0, color.l - .1);
					
					// color stroke, white interior, gray arrow
					//outerCircle.attr({'fill':'#fff', 'stroke':Raphael.hsl2rgb(color).hex, 'stroke-width':4, 'cursor':'pointer'});
					//innerCircle.attr({'fill':'#666', 'stroke':'none', 'cursor':'pointer'});
					
					outerCircle.attr({'fill':Raphael.hsl2rgb(color).hex, 'stroke':'#eee', 'stroke-width':3, 'cursor':'pointer'});
					innerCircle.attr({'fill':'#fff', 'stroke':'none', 'cursor':'pointer'});
					
					//outerCircle.attr({'fill':graphNode.reason.data.nodes[0].color, 'stroke-width':2, 'cursor':'pointer'});
					//innerCircle.attr({'fill':'#000', 'stroke':'none', 'cursor':'pointer'});*/
				} else if (drawAsContainer) {
					outerCircle.attr({'fill':color, 'stroke':'#eee', 'stroke-width':3, 'cursor':'pointer'});
					outerCircle.data('node', graphNode);
					/*outerCircle.mouseover(function() {
						scalarview.pinwheel.filter = this.data('node');
						scalarview.pinwheel.update();
					});
					outerCircle.mouseout(function() {
						scalarview.pinwheel.filter = null;
					});*/
					innerCircle.attr({'fill':'#eee', 'stroke':'none', 'cursor':'pointer'});
				} else {
					/*if (this.currentZoom == 0) {
						outerCircle.attr({'fill':'#000', 'stroke':'none', 'cursor':'pointer'});
						innerCircle.attr({'fill':'#eee', 'stroke':'none', 'cursor':'pointer'});
					} else {*/
						outerCircle.attr({'fill':'#999', 'stroke':'#000', 'stroke':'none', 'cursor':'pointer'});
						innerCircle.attr({'fill':'#fff', 'stroke':'none', 'cursor':'pointer'});
					//}
				}
				
				outerCircle.click(goToPage);
				innerCircle.click(goToPage);
				
				graphNode.drawing.push(outerCircle, innerCircle);
				if (drawLabels) {
					label = this.canvas.text(canvasPosition.x, canvasPosition.y+20, graphNode.nodes[0].getDisplayTitle());
					label.attr({'font-family':'\'Lato\', Arial, sans-serif', 'font-size':'16px', 'cursor':'pointer'});
					scalarview.wrapText(label, labelWidth, 'middle');
					graphNode.drawing.push(label);
					}
					
				/*} else if (!this.showIcons) {
					innerCircle = this.canvas.circle(canvasPosition.x, canvasPosition.y, 3.5);
					if (scalarview.currentNode.color) {
						outerCircle.attr({'fill':scalarview.currentNode.color, 'stroke':'none'});
						innerCircle.attr({'fill':'#eee', 'stroke':'none'});
					} else if (drawAsContainer) {
						outerCircle.attr({'fill':color, 'stroke':'none'});
						innerCircle.attr({'fill':'#eee', 'stroke':'none'});
					} else {
						outerCircle.attr({'fill':'#fff', 'stroke':'#000', 'stroke-width':2});
						innerCircle.attr({'fill':'#000', 'stroke':'none'});
					}
					graphNode.drawing.push(outerCircle, innerCircle);
					if (drawLabels) {
						label = this.canvas.text(canvasPosition.x, canvasPosition.y+26, graphNode.nodes[0].getDisplayTitle());
						label.attr({'font-family':'\'Lato\', Arial, sans-serif', 'font-size':'16px'});
						graphNode.drawing.push(label);
					}
					
				} else {
					// draw node with dominant type icon
				}  */
			}
		}
		      
		/*    
		var inHistory;
		if (showHistory) {   
			inHistory = anyNodeInHistory(nodes);
			if (!inHistory) {
				// reduce opacity of node
			}
		} else {
			inHistory = true;
		} 
		*/    
		
		if (this.currentZoom < this.zoomThreshold) {
			// draw node title
		}  
		
		// TODO: figure out some way to avoid drawing duplicate items (i.e. children of the current item's parent)
		    
	   	for (i=0; i<graphNode.parents.length; i++) {
			this.drawGraphNode(graphNode.parents[i].node);
			this.drawRelation(graphNode.parents[i].relation+'_parent', graphNode, graphNode.parents[i]);
		}
		for (i=0; i<graphNode.children.length; i++) {
			this.drawGraphNode(graphNode.children[i].node);
			//this.drawRelation(graphNode.children[i].relation+'_child', graphNode, graphNode.children[i].node);
		}
		
		if (graphNode.olderSibling != null) {
			this.drawGraphNode(graphNode.olderSibling.node);
			this.drawRelation('sibling', graphNode, graphNode.olderSibling);
		}
		
		if (graphNode.youngerSibling != null) {
			this.drawGraphNode(graphNode.youngerSibling.node);
			//this.drawRelation('sibling', graphNode, graphNode.youngerSibling);
		} 
		
		for (i=0; i<graphNode.olderStepSiblings.length; i++) {
			this.drawGraphNode(graphNode.olderStepSiblings[i].node);
			this.drawRelation('olderStepSibling', graphNode, graphNode.olderStepSiblings[i]);
		}
		
		for (i=0; i<graphNode.youngerStepSiblings.length; i++) {
			this.drawGraphNode(graphNode.youngerStepSiblings[i].node);
			//this.drawRelation('youngerStepSibling', graphNode, graphNode.youngerStepSiblings[i]);
		}
		
	} else {
		//console.log('     "'+graphNode.getDisplayTitle()+'" has already been drawn     ');
	}
	
}

ScalarPinwheel.prototype.drawRelation = function(type, sourceGraphNode, destGraphNodeData) {  
		
	var sourcePos = {
		x: this.center.x + (sourceGraphNode.position.x * this.unitSize.x),
		y: this.center.y + (sourceGraphNode.position.y * this.unitSize.y)
	}
		
	var destPos = {
		x: this.center.x + (destGraphNodeData.node.position.x * this.unitSize.x),
		y: this.center.y + (destGraphNodeData.node.position.y * this.unitSize.y) 
	}
	
	var relDestPos = {
		x: ((destGraphNodeData.node.position.x - sourceGraphNode.position.x) * this.unitSize.x),
		y: ((destGraphNodeData.node.position.y - sourceGraphNode.position.y) * this.unitSize.y)
	}
	
	var fullW = (sourcePos.x - destPos.x);
	var fullH = (sourcePos.y - destPos.y);
	var halfW = fullW * .5;
	var halfH = fullH * .5;
	var qtrW = fullW * .25;
	var qtrH = fullH * .25;
	
	var path;
	var pathString = '';
	var color;
	var strokeWidth = 2;
	var arrowPosition;

	switch (type) {
	
		case 'path_parent':
		pathString += 'M'+destPos.x+' '+destPos.y;
		pathString += 'q'+qtrW+' '+0+' '+halfW+' '+halfH;
		pathString += 'q'+qtrW+' '+halfH+' '+halfW+' '+halfH;
		//var path = this.canvas.path('M65 144 q 126 0 252 144 q 126 144 252 144');
		if (destGraphNodeData.node.nodes.length > 1) {
			color = '#000';
		} else if (destGraphNodeData.node.nodes[0].color) {
			color = destGraphNodeData.node.nodes[0].color;
		} else {
			color = '#888';
		}
		arrowPosition = 'arrow-start';
		break;
		
		case 'tag_parent':
		pathString += 'M'+destPos.x+' '+destPos.y;
		pathString += 'L'+sourcePos.x+' '+sourcePos.y;
		pathString += 'L'+sourcePos.x+' '+sourcePos.y;
		if (destGraphNodeData.node.nodes.length > 1) {
			color = '#000';
		} else if (destGraphNodeData.node.nodes[0].color) {
			color = destGraphNodeData.node.nodes[0].color;
		} else {
			color = '#888';
		}
		arrowPosition = 'arrow-start';
		break;
		
		case 'sibling':
		/*pathString += 'M'+destPos.x+' '+destPos.y;
		pathString += 'L'+sourcePos.x+' '+sourcePos.y;
		if (destGraphNodeData.parent.nodes.length > 1) {
			color = '#000';
		} else if (destGraphNodeData.parent.nodes[0].color) {
			color = destGraphNodeData.parent.nodes[0].color;
		} else {
			color = '#888';
		}
		strokeWidth = 5;
		break;*/
		
		case 'olderStepSibling':
		
		// if the new nodes have the same y position, draw a simple line
		if (fullH == 0) {
			pathString += 'M'+destPos.x+' '+destPos.y;
			pathString += 'L'+sourcePos.x+' '+sourcePos.y;
			/*if (Math.abs(sourceGraphNode.position.x - destGraphNodeData.node.position.x) > 1) {
				pathString += 'q'+halfW+' '+this.unitSize.y+' '+fullW+' '+fullH;
			} else {*/
				//pathString += 'q'+halfW+' '+(halfH+((Math.random()*10)-5))+' '+fullW+' '+fullH;
			//}
			arrowPosition = 'arrow-end';
			
		} else {
		
			/*var youngerSiblingWithCommonParent = null;
			if (sourceGraphNode.youngerSibling != null) {
				if (sourceGraphNode.youngerSibling.scalarParent == destGraphNodeData.scalarParent) {
					youngerSiblingWithCommonParent = sourceGraphNode.youngerSibling;
				}
			}
			var i;
			var n = sourceGraphNode.youngerStepSiblings.length;
			var stepSibling;
			for (i=0; i<n; i++) {
				stepSibling = sourceGraphNode.youngerStepSiblings[i];
				if (stepSibling.scalarParent == destGraphNodeData.scalarParent) {
					youngerSiblingWithCommonParent = stepSibling;
					break;
				}
			}
			if (youngerSiblingWithCommonParent != null) {*/
			
				//if (((sourceGraphNode.position.y > destGraphNodeData.node.position.y) && (sourceGraphNode.position.y < youngerSiblingWithCommonParent.node.position.y)) || ((sourceGraphNode.position.y < destGraphNodeData.node.position.y) && (sourceGraphNode.position.y > youngerSiblingWithCommonParent.node.position.y))) {
				if (sourceGraphNode.reason.type == 'current') {
					pathString += 'M'+sourcePos.x+' '+sourcePos.y;
					pathString += 'q'+0+' '+(-fullH)+' '+relDestPos.x+' '+relDestPos.y;
					arrowPosition = 'arrow-start';
				} else {
					pathString += 'M'+sourcePos.x+' '+sourcePos.y;
					pathString += 'q'+(-fullW)+' '+0+' '+relDestPos.x+' '+relDestPos.y;
					arrowPosition = 'arrow-start';
				}
			
				/*
				// older sibling is higher than self
				if (sourceGraphNode.position.y > destGraphNodeData.node.position.y) {
				
					// and younger sibling is equal to or higher than self
					if (youngerSiblingWithCommonParent.node.position.y <= sourceGraphNode.position.y) {
						// hump down
						pathString += 'M'+destPos.x+' '+destPos.y;
						pathString += 'q'+0+' '+fullH+' '+(-relDestPos.x)+' '+(-relDestPos.y);
						
					// and younger sibling is lower than self
					} else {
						// hump up
						pathString += 'M'+destPos.x+' '+destPos.y;
						pathString += 'q'+fullW+' '+0+' '+(-relDestPos.x)+' '+(-relDestPos.y);
					}
					
				// older sibling is equal to or lower than self
				} else {
				
					// younger sibling is lower than self
					if (youngerSiblingWithCommonParent.node.position.y >= sourceGraphNode.position.y) {
						// hump up
						pathString += 'M'+destPos.x+' '+destPos.y;
						pathString += 'q'+fullW+' '+0+' '+(-relDestPos.x)+' '+(-relDestPos.y);
						
					// younger sibling is equal to or higher than self
					} else {
						// hump down
						pathString += 'M'+destPos.x+' '+destPos.y;
						pathString += 'q'+0+' '+fullH+' '+(-relDestPos.x)+' '+(-relDestPos.y);
					}
				}*/
			/*	
			// no younger sibling
			} else {
				// hump down
				pathString += 'M'+destPos.x+' '+destPos.y;
				pathString += 'q'+0+' '+fullH+' '+(-relDestPos.x)+' '+(-relDestPos.y);
				arrowPosition = 'arrow-end';
			}*/
		
		}
			
		// if the destination node has no older step siblings, then draw a curve with the hump pointing up
		/*} else if (destGraphNodeData.node.olderStepSiblings.length == 0) {
			pathString += 'M'+destPos.x+' '+destPos.y;
			pathString += 'q'+fullW+' '+0+' '+(-relDestPos.x)+' '+(-relDestPos.y);
			
		// otherwise, draw a curve with the hump pointing down
		} else {
			pathString += 'M'+destPos.x+' '+destPos.y;
			pathString += 'q'+0+' '+fullH+' '+(-relDestPos.x)+' '+(-relDestPos.y);
		}*/
		
		if (sourceGraphNode.reason.type == 'current') {
			if (destGraphNodeData.node.reason.data.nodes[0].color) {
			//if (destGraphNodeData.scalarParent.color) {
				//color = destGraphNodeData.scalarParent.color;
				color = destGraphNodeData.node.reason.data.nodes[0].color;
			} else {
				color = '#888';
			}
		} else {
			if (sourceGraphNode.reason.data.nodes[0].color) {
			//if (destGraphNodeData.scalarParent.color) {
				//color = destGraphNodeData.scalarParent.color;
				color = sourceGraphNode.reason.data.nodes[0].color;
			} else {
				color = '#888';
			}
		}
		strokeWidth = 4;
		break;
	
	}
	
	if (pathString != '') {
	
		if (this.filter != null) {
			if ((destGraphNodeData.scalarParent == this.filter.nodes[0]) || (destGraphNodeData.node.nodes[0] == this.filter.nodes[0])) {
				
			} else {
				color = '#ddd';
			}
		}
		
		path = this.canvas.path(pathString);
		if (arrowPosition == 'arrow-start') {
			path.attr({/*'arrow-start':'class-wide-long',*/ 'stroke':color, 'stroke-width':strokeWidth});
		} else {
			path.attr({/*'arrow-end':'class-wide-long',*/ 'stroke':color, 'stroke-width':strokeWidth});
		}
		path.toBack();
	}
	
}

/**
 * Returns all of the nodes that will need to be moved if this node is moved.
 *
 * @param {Object} graphNode		The node to interrogate.
 * @param {Array} siblings			The array in which all of the sibling nodes will be stored.
 */
ScalarPinwheel.prototype.getGraphNodeSiblings = function(graphNode, siblings) {  
	
	if (graphNode.youngerSibling) {
		if (siblings.indexOf(graphNode.youngerSibling) == -1) {
			siblings.push(graphNode.youngerSibling);
			this.getGraphNodeSiblings(graphNode.youngerSibling, siblings);
		}
	}
	
	if (graphNode.olderSibling) {
		if (siblings.indexOf(graphNode.olderSibling) == -1) {
			siblings.push(graphNode.olderSibling);
			this.getGraphNodeSiblings(graphNode.olderSibling, siblings);
		}
	}
	
	return siblings;
} 

function PathGraph(pathNode, offset) {
	
	this.pathNode = pathNode;
	this.offset = offset;
	this.children = [];
	
}

function GraphNodeViewer(elementName) {

	this.element = $('body').find('#'+elementName);
	this.canvas = Raphael(elementName, 100, 100);

}

GraphNodeViewer.prototype.element = null;

GraphNodeViewer.prototype.showForGraphNode = function(graphNode) {

	var canvasPosition = {
		x: scalarview.pinwheel.center.x + (graphNode.position.x * scalarview.pinwheel.unitSize.x),
		y: scalarview.pinwheel.center.y + (graphNode.position.y * scalarview.pinwheel.unitSize.y) 
	}
	
	this.element.css('left', canvasPosition.x);
	this.element.css('top', canvasPosition.y);
	this.element.css('display', 'block');

}

GraphNodeViewer.prototype.hide = function() {
	
}

function GraphNode(nodes, position, reason) {
	
	this.nodes = nodes; 
	this.position = position;   
	this.parents = [];  
	this.children = [];
	this.youngerSibling = null;
	this.olderSibling = null;
	this.youngerStepSiblings = [];
	this.olderStepSiblings = [];
	this.drawing = null;
	this.hasBeenDrawn = false;
	this.reason = reason;
	
	GraphNode.prototype.getNewParentsForRelation = function(relationName, direction, currentDepth) {
	
		var allRelations = [];
		var allRelatedNodes = [];
		var newRelatedNodes = [];
		
		var i;
		var j;
		var n;
		var o;
		var isNew;
		var node;
		var relation;
		var index;
		
		n = this.nodes.length;
		for (i=0; i<n; i++) {
			allRelations = allRelations.concat(this.nodes[i].getRelations(relationName, direction));
		}
		
		n = allRelations.length;
		for (i=0; i<n; i++) {
		
			relation = allRelations[i];
			
			if (scalarview.pinwheel.graphNodeForScalarNode(relation.body) == null) {
				if (this.currentZoom > 0) {
					if (this.currentZoom == currentDepth) {
						allRelatedNodes.push(relation);
					}
				} else {
					allRelatedNodes.push(relation);
				}
			}
			
		}
		
		n = allRelatedNodes.length;
		for (i=0; i<n; i++) {
		
			isNew = true;
			node = allRelatedNodes[i].body;
			
			if (isNew) {
				o = this.parents.length;
				for (j=0; j<o; j++) {
					if (this.parents[j].node.nodes.indexOf(node) != -1) {
						isNew = false;
					}
				}
			}
			
			if (isNew) {
				newRelatedNodes.push(node);
				if (relationName == 'path') {
					if (scalarview.pinwheel.pathGraphs[node.url] == undefined) {
						scalarview.pinwheel.pathGraphs[node.url] = new PathGraph(node, {x:allRelatedNodes[i].index, y:scalarview.pinwheel.pathGraphCount});
						scalarview.pinwheel.pathGraphCount++;
					}
				}
			}
		}
	                           
		// if currentZoom == 0, then we should include the path parent
		// no matter what the index of the child is, however, if currentZoom
		// == 5, then we should only include the path parent if currentDepth
		// is also 5 so the path is attached to its oldest child     
		
		// the 'new' means that we only return parents whose nodes haven't
		// already been addressed in the node's current parents array
		
		//if (newRelatedNodes.length > 0) console.log('     found new '+relationName+'-'+direction+' parent of "'+this.getDisplayTitle()+'"');
		
		return newRelatedNodes;
	}   
	
	GraphNode.prototype.isCurrentNode = function() {
		return (this.nodes.indexOf(scalarview.currentNode != -1));
	}
	
	GraphNode.prototype.sharesColumnWithNode = function(graphNode) {
		return (this.position.x == graphNode.position.x);
	}
	
	GraphNode.prototype.sharesRowWithNode = function(graphNode) {
		return (this.position.y == graphNode.position.y);
	}
	
	GraphNode.prototype.getDisplayTitle = function() { 
	
		if (this.nodes.length == 0) {
			return '[empty]';
		} else if (this.nodes.length == 1) {
			return this.nodes[0].getDisplayTitle();
		} else {
			return (this.nodes.length-1)+' items';
		}
	
	}
	
	GraphNode.prototype.getNewChildrenForRelation = function(relationName, direction) { 
	
		var relatedNodes = [];
		
		var i;
		var j;
		var n;
		var o;
		var childGraphNode;
		var node;
		var relations;
		var relation;
		var index;
		
		n = this.nodes.length;
		for (i=0; i<n; i++) {
			relations = relatedNodes.concat(this.nodes[i].getRelations(relationName, direction));
		}
		
		//console.log('checking '+this.nodes[0].getDisplayTitle());
		//console.log('my children: '+this.children.length);
		//console.log(relatedNodes);
		
		//console.log('found '+relations.length+' relations for '+relationName+', '+direction);
		
		switch (relationName) {
		
			case 'path':
			var minIndex = 999999;
			var minNode = null;
			n = relations.length;
			for (i=0; i<n; i++) {
				relation = relations[i];
				if (relation.index < minIndex) {
					minIndex = relation.index;
					minNode = relation.target;
				}
			}
			if (minNode != null) {
				relatedNodes.push(minNode);
			}
			break;
			
			case 'tag':
			n = relations.length;
			for (i=0; i<n; i++) {
				relation = relations[i];
				relatedNodes.push(relation.target);
			}
			break;
		
			/*
			n = this.children.length;
			for (i=0; i<n; i++) {
				childGraphNode = this.children[i].node;
				o = childGraphNode.nodes.length;
				for (j=0; j<o; j++) {
					node = childGraphNode.nodes[j];
					index = relatedNodes.indexOf(node);
					if (index != -1) {
						relatedNodes = [];
						break;
					}
				}
			}
			*/
		}
		
		// if this is a path, and a member of the path is already registered
		// as a child, then don't return any other children
		
		//if (relatedNodes.length > 0) console.log('     found new '+relationName+'-'+direction+' child of "'+this.getDisplayTitle()+'"');
		
		//console.log('returning '+relatedNodes.length+' nodes');
		
		return relatedNodes;
		
	}
	
	GraphNode.prototype.getNextOlderSibling = function() {
		
		var sibling = null;
		var oldestNode = this.nodes[0];
		
		if ((this.parents.length > 0) && (this.parents[0].relation == 'path') && (this.parents[0].node.nodes.length == 1)) {
		//if (oldestNode.getRelations('path', 'incoming', 'index').length > 0) {
		
			var parentNode = this.parents[0].node.nodes[0];
			
			var relations = oldestNode.getRelations('path', 'incoming', 'index');
			var relation;
			var index;
			var i;
			var n = relations.length;
			for (i=0; i<n; i++) {
				relation = relations[i];
				if (relation.body == parentNode) {
					index = relation.index;
					break;
				}
			}
			
			if (index > 1) { // path indexes are 1-based
				relations = parentNode.getRelations('path', 'outgoing', 'index');
				n = relations.length;
				var maxLesserIndex = -999999;
				var maxLesserNode = null;
				for (i=0; i<n; i++) {
					relation = relations[i];
					if ((relation.index > maxLesserIndex) && (relation.index < index)) {
						maxLesserIndex = relation.index;
						maxLesserNode = {node:relation.target, parent:parentNode};
					}
				}
				if (maxLesserNode != null) {
					sibling = maxLesserNode;
				}
			}
			
		}
		
		//if (sibling != null) console.log('     found older sibling of "'+this.getDisplayTitle()+'": "'+sibling.node.getDisplayTitle()+'"');
		
		return sibling;
	}
	
	GraphNode.prototype.getNextOlderSiblingForParent = function(parent) {
		
		var sibling = null;
		var oldestNode = this.nodes[0];
		
		var parentNode = parent.nodes[0];
		
		var relations = oldestNode.getRelations('path', 'incoming', 'index');
		var relation;
		var index;
		var i;
		var n = relations.length;
		for (i=0; i<n; i++) {
			relation = relations[i];
			if (relation.body == parentNode) {
				index = relation.index;
				break;
			}
		}
		
		if (index > 1) { // path indexes are 1-based
			relations = parentNode.getRelations('path', 'outgoing', 'index');
			n = relations.length;
			/*
			for (i=0; i<n; i++) {
				relation = relations[i];
				if (relation.index == (index - 1)) {
					sibling = {node:relation.target, parent:parentNode};
					break;
				}
			}*/
			var maxLesserIndex = -999999;
			var maxLesserNode = null;
			for (i=0; i<n; i++) {
				relation = relations[i];
				if ((relation.index > maxLesserIndex) && (relation.index < index)) {
					maxLesserIndex = relation.index;
					maxLesserNode = {node:relation.target, parent:parentNode};
				}
			}
			if (maxLesserNode != null) {
				sibling = maxLesserNode;
			}
		}
		
		//if (sibling != null) console.log('     found older sibling of "'+this.getDisplayTitle()+'": "'+sibling.node.getDisplayTitle()+'"');
		
		return sibling;
	}
	
	GraphNode.prototype.getNextYoungerSiblingForParent = function(parent) {
		
		var sibling = null;
		var youngestNode = this.nodes[this.nodes.length - 1];
		
		var parentNode = parent.nodes[0];
		
		var relations = youngestNode.getRelations('path', 'incoming', 'index');
		var relation;
		var index;
		var i;
		var n = relations.length;
		for (i=0; i<n; i++) {
			relation = relations[i];
			if (relation.body == parentNode) {
				index = relation.index;
				break;
			}
		}
		
		relations = parentNode.getRelations('path', 'outgoing', 'index');
		n = relations.length;
		/*for (i=0; i<n; i++) {
			relation = relations[i];
			if (relation.index == (index + 1)) {
				sibling = {node:relation.target, parent:parentNode};
				break;
			}
		}*/
		var minGreaterIndex = 999999;
		var minGreaterNode = null;
		for (i=0; i<n; i++) {
			relation = relations[i];
			if ((relation.index < minGreaterIndex) && (relation.index > index)) {
				minGreaterIndex = relation.index;
				minGreaterNode = {node:relation.target, parent:parentNode};
			}
		}
		if (minGreaterNode != null) {
			sibling = minGreaterNode;
		}
		
		//if (sibling != null) console.log('     found younger sibling of "'+this.getDisplayTitle()+'": "'+sibling.node.getDisplayTitle()+'"');
		
		return sibling;
	}
	
	GraphNode.prototype.getNextYoungerSibling = function() {
		
		var sibling = null;
		var youngestNode = this.nodes[this.nodes.length - 1];
		
		if ((this.parents.length > 0) && (this.parents[0].relation == 'path') && (this.parents[0].node.nodes.length == 1)) {
		//if (youngestNode.getRelations('path', 'incoming', 'index').length > 0) {
		
			var parentNode = this.parents[0].node.nodes[0];
			
			var relations = youngestNode.getRelations('path', 'incoming', 'index');
			var relation;
			var index;
			var i;
			var n = relations.length;
			for (i=0; i<n; i++) {
				relation = relations[i];
				if (relation.body == parentNode) {
					index = relation.index;
					break;
				}
			}
			
			relations = parentNode.getRelations('path', 'outgoing', 'index');
			n = relations.length;
			/*for (i=0; i<n; i++) {
				relation = relations[i];
				if (relation.index == (index + 1)) {
					sibling = {node:relation.target, parent:parentNode};
					break;
				}
			}*/
			var minGreaterIndex = 999999;
			var minGreaterNode = null;
			for (i=0; i<n; i++) {
				relation = relations[i];
				if ((relation.index < minGreaterIndex) && (relation.index > index)) {
					minGreaterIndex = relation.index;
					minGreaterNode = {node:relation.target, parent:parentNode};
				}
			}
			if (minGreaterNode != null) {
				sibling = minGreaterNode;
			}
			
		}
		
		//if (sibling != null) console.log('     found younger sibling of "'+this.getDisplayTitle()+'": "'+sibling.node.getDisplayTitle()+'"');
		
		return sibling;
	}
	
	GraphNode.prototype.getNextOlderStepSiblings = function() {
		
		var siblings = [];
		var oldestNode = this.nodes[0];
		var parentScalarNodes = [];
		var parentScalarNode;
		var parentGraphNode;
		var relations;
		var relation;
		var index;
		var currentOlderStepSiblings = [];
		
		var i;
		var j;
		var n;
		var o;
		
		/*
		n = this.parents.length;
		for (i=0; i<n; i++) {
		
			if (this.parents[i].relation == 'path') {
				parentGraphNode = this.parents[i].node;
				if (i == 0) {
					if (parentGraphNode.nodes.length > 1) {
						parentScalarNodes = parentScalarNodes.concat(parentGraphNode.nodes);
					}
				} else {
					parentScalarNodes = parentScalarNodes.concat(parentGraphNode.nodes);
				}
			}
		
		}*/
		
		n = this.olderStepSiblings.length;
		for (i=0; i<n; i++) {
			currentOlderStepSiblings = currentOlderStepSiblings.concat(this.olderStepSiblings[i].node.nodes);
		}
		
		parentScalarNodes = oldestNode.getRelatedNodes('path', 'incoming', 'index');
		n = parentScalarNodes.length;
		for (i=0; i<n; i++) {
			
			parentScalarNode = parentScalarNodes[i];
			
			relations = oldestNode.getRelations('path', 'incoming', 'index');
			o = relations.length;
			for (j=0; j<o; j++) {
				relation = relations[j];
				if (relation.body == parentScalarNode) {
					index = relation.index;
					break;
				}
			}
			
			if (index > 1) { // path indexes are 1-based
				relations = parentScalarNode.getRelations('path', 'outgoing', 'index');
				o = relations.length;
				for (j=0; j<o; j++) {
					relation = relations[j];
					if (relation.index == (index - 1)) {
						if (this.olderSibling != null) {
							if (this.olderSibling.node.nodes.indexOf(relation.target) == -1) {
								if (currentOlderStepSiblings.indexOf(relation.target) == -1) {
									siblings.push({node:relation.target, parent:parentScalarNode});
									currentOlderStepSiblings.push(relation.target);
								}
								break;
							}
						} else {
							if (currentOlderStepSiblings.indexOf(relation.target) == -1) {
								siblings.push({node:relation.target, parent:parentScalarNode});
								currentOlderStepSiblings.push(relation.target);
							}
							break;
						}
					}
				}
			}
			
		}
		
		//if (siblings.length > 0) console.log('     found '+siblings.length+' older step-siblings');
		
		return siblings;
	}
	
	GraphNode.prototype.getNextYoungerStepSiblings = function() {
		
		var siblings = [];
		var youngestNode = this.nodes[0];
		var parentScalarNodes = [];
		var parentScalarNode;
		var parentGraphNode;
		var relations;
		var relation;
		var index;
		var currentYoungerStepSiblings = [];
		
		var i;
		var j;
		var n;
		var o;
		
		/*n = this.parents.length;
		for (i=0; i<n; i++) {
		
			if (this.parents[i].relation == 'path') {
				parentGraphNode = this.parents[i].node;
				if (i == 0) {
					if (parentGraphNode.nodes.length > 1) {
						parentScalarNodes = parentScalarNodes.concat(parentGraphNode.nodes);
					}
				} else {
					parentScalarNodes = parentScalarNodes.concat(parentGraphNode.nodes);
				}
			}
		
		}*/
		
		n = this.youngerStepSiblings.length;
		for (i=0; i<n; i++) {
			currentYoungerStepSiblings = currentYoungerStepSiblings.concat(this.youngerStepSiblings[i].node.nodes);
		}
		
		parentScalarNodes = youngestNode.getRelatedNodes('path', 'incoming', 'index');
		n = parentScalarNodes.length;
		for (i=0; i<n; i++) {
			
			parentScalarNode = parentScalarNodes[i];
			
			relations = youngestNode.getRelations('path', 'incoming', 'index');
			o = relations.length;
			for (j=0; j<o; j++) {
				relation = relations[j];
				if (relation.body == parentScalarNode) {
					index = relation.index;
					break;
				}
			}
		
			relations = parentScalarNode.getRelations('path', 'outgoing', 'index');
			o = relations.length;
			for (j=0; j<o; j++) {
				relation = relations[j];
				if (relation.index == (index + 1)) {
					//console.log('possible younger step sibling: '+relation.target.getDisplayTitle());
					//console.log(this.youngerSibling);
					if (this.youngerSibling != null) {
						if (this.youngerSibling.node.nodes.indexOf(relation.target) == -1) {
							if (currentYoungerStepSiblings.indexOf(relation.target) == -1) {
								siblings.push({node:relation.target, parent:parentScalarNode});
								currentYoungerStepSiblings.push(relation.target);
							}
							//console.log('confirmed');
							break;
						}
					} else {
						if (currentYoungerStepSiblings.indexOf(relation.target) == -1) {
							siblings.push({node:relation.target, parent:parentScalarNode});
							currentYoungerStepSiblings.push(relation.target);
						}
						//console.log('confirmed');
						break;
					}
				}
			}
			
		}
		
		if (siblings.length > 0) console.log('     found '+siblings.length+' younger step-siblings');
		
		return siblings;
	}
	
	GraphNode.prototype.reset = function() {
		this.hasBeenDrawn = false;
	}
	
} 

/**
 * Creates a new ScalarBasin.
 * @class		Manages the primary navigation interface for a Scalar book.
 *
 * @property {Object} element		Root DOM element for the basin.
 * @property {Number} visScaleY		Vertical scaling applied to the basin visualization.
 * @property {Object} navMap		Data which drives the layout of the basin visualization.
 */
function ScalarBasin() {

	this.visScaleY = 1;

}

ScalarBasin.prototype.element = null;
ScalarBasin.prototype.visScaleY = null;
ScalarBasin.prototype.navMap = null;
ScalarBasin.prototype.diagram = null;
ScalarBasin.prototype.editor = null;
ScalarBasin.prototype.editorPlates = null;
ScalarBasin.prototype.wysiwyg = null;

/**
 * Initial construction of the basin.
 */
ScalarBasin.prototype.render = function() {

	this.element = $('<div id="basin"></div>').appendTo('body');
	
	// get page title
	var title;
	if (scalarview.currentNode == scalarview.tocNode) {
		title = 'Contents';
	} else {
		title = scalarview.currentNode.getDisplayTitle();
	}
	
	this.navmap = new NavigationMap();
	
	var handleBasinClick = function(e) {
	
		switch (scalarview.state) {
		
			case 'reading':
			scalarview.setState('navigating', 'fast', false);
			break;
			
			case 'navigating':
			scalarview.setState('reading', 'fast', false);
			break;
			
			case 'editing':
			scalarview.setState('reading', 'fast', false);
			break;
			
			case 'designing':
			scalarview.setState('reading', 'fast', false);
			break;
			
		}
		
	}
	
	this.element.click(handleBasinClick);
	
	this.editor = $('<div id="editor"><div class="header">'+title+'</div><div class="controls"><div class="edit"></div><div class="design"></div></div><div id="editor-plates"></div></div>').appendTo('body');
	this.editorPlates = $('#editor-plates');
	
	var htmlContent = $('<div id="content"></div>');
	if (scalarview.currentNode.current) {
		if (scalarview.currentNode.current.content != null) {
			htmlContent = $('<div id="content">'+nl2br(scalarview.currentNode.current.content)+'</div>');
		}
	}
	this.wysiwyg = $('<div class="plate"><div class="sidebar"><p>[ Formatting options ]</p><br/><p>[ Media options ]</p></div><div class="body"><div class="wysiwyg"></div></div></div><div class="spacer"></div>').appendTo(this.editorPlates);
	this.wysiwyg.find('.wysiwyg').append(htmlContent.html());
	this.wysiwyg.children().height('500px');
	$('.wysiwyg').height('480px');
	
	this.editorPlates.append('<div class="plate"><div class="sidebar" style="height:460px;"></div><div class="body">[Linked media configuration]</div></div><div class="spacer"></div><div class="plate"><div class="sidebar" style="height:460px;"></div><div class="body">[Relationship editor]</div></div><div class="spacer"></div>');
	
	this.editor.find('.edit').click(function(event) {
		event.stopImmediatePropagation();
		scalarview.setState('editing', 'fast', false);
	});
	
	this.index = $('<div id="index"><div class="item-btn path">11</div><div class="item-btn page">115</div><div class="item-btn media">216</div><div class="item-btn tag">13</div><div class="item-btn annotation">22</div><div class="item-btn comment">17</div></div>').appendTo(this.element);
	
	this.diagram = $('<svg xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>').appendTo(this.element);

	this.buildNavigation();
	this.layoutNavigation(0);

}

/**
 * Updates layout of items in the basin.
 *
 * @param	duration		Duration of the update.
 */
ScalarBasin.prototype.update = function(duration) {

	this.editor.css('left', scalarview.surface.currentMargin);
	this.editor.css('right', scalarview.surface.currentMargin);
	$('.plate>.body').width(this.windowWidth - (scalarview.surface.currentMargin * 2) - 255);
	
	this.layoutNavigation(duration);

}

/**
 * Sets the current state of the page.
 *
 * @param	newState 	The new state.
 * @param	duration	Duration of the transition to the new state.
 * @param	propsOnly	If true, modify properties only, not dom elements.
 */
ScalarBasin.prototype.setState = function(newState, duration, propsOnly) {

	switch (newState) {
	
		case 'reading':
		if (!propsOnly) {
			$('#editor-plates').fadeOut(duration);
			this.element.css('position', 'fixed');
			this.element.css('height', '100%');
		}
		scalarview.stateProperties.push({context:this, property:'visScaleY', value:1});
		break;
		
		case 'navigating':
		if (!propsOnly) {
			$('#editor-plates').fadeOut(duration);
			this.element.css('position', 'absolute');
			this.element.css('height', '100%');
		}
		scalarview.stateProperties.push({context:this, property:'visScaleY', value:1});
		break;
		
		case 'editing':
		if (!propsOnly) {
			$('#editor-plates').fadeIn(duration);
			this.element.css('position', 'absolute');
			this.element.css('height', this.editor.height() + parseInt(this.editor.css('top')));
		}
		scalarview.stateProperties.push({context:this, property:'visScaleY', value:.5});
		break;
		
		case 'designing':
		if (!propsOnly) {
			$('#editor-plates').fadeOut(duration);
			this.element.css('position', 'fixed');
			this.element.css('height', '100%');
		}
		scalarview.stateProperties.push({context:this, property:'visScaleY', value:.5});
		break;
	
	}

}

/**
 * Create the navigation elements.
 */
ScalarBasin.prototype.buildNavigation = function() {
	
	var me = this;
	
	var row;
	var col;
	var btnType;
	var button;
	var label;
	var contentArr;
	var content;
	var path;
	
	for (row=0; row<3; row++) {
		
		for (col=0; col<3; col++) {
			
			contentArr = this.navmap.content[row][col];

			if (contentArr.length > 0) {
			
				content = contentArr[0];
				
				var title;
				if (content == scalarview.tocNode) {
					title = 'Contents';
				} else {
					title = content.getDisplayTitle();
				}
				
				// create navigation button
				if (this.navmap.btnType[row][col] != 'self') {
					button = $('<div id="r'+row+'c'+col+'" class="nav-btn '+this.navmap.btnType[row][col]+'"><div class="nav-label">'+title+'</div></div>').appendTo(this.element);
				} else {
					button = $('<div id="r'+row+'c'+col+'" class="nav-btn '+this.navmap.btnType[row][col]+'"></div>').appendTo(this.element);
				}
				button.data('url', scalarapi.basename(content.url));
				button.data('row', row);
				button.data('col', col);
				button.click(function(event) {
					event.stopImmediatePropagation();
					if (scalarview.singlePageMode) {
						scalarview.reloadForScalarPage($(this).data('url'));
					} else {
						scalarview.setPage($(this).data('url'));
					}
				});
				
				// button label state
				label = button.find('.nav-label');
				if (scalarview.marginsCollapsed) {
					label.css('display', 'none');
				} else {
					label.css('display', 'block');
				}
				
				// create svg diagram
				path = document.createElementNS('http://www.w3.org/2000/svg','path');
				path.setAttribute('stroke', '#a6a6a6');
				path.setAttribute('id', 'r'+row+'c'+col+'curve');
				path.setAttribute('fill', 'none');
				path.setAttribute('stroke-width', '5');
				path.setAttribute('stroke-dasharray', '4,2');
				this.diagram[0].appendChild(path);
			}
			
		}
	}
		
	// set default button state
	var buttonIndices = [{row:2, col:2}, {row:1, col:2}, {row:0, col:0}];
	var quadrant;
	var j;
	var o;
	var data;
	var foundDefault = false;
	n = buttonIndices.length;
	for (i=0; i<n; i++) {
		quadrant = this.navmap.content[buttonIndices[i].row][buttonIndices[i].col];
		o = quadrant.length;
		for (j=0; j<o; j++) {
			data = quadrant[j];
			
			//if ((data.attr('visited') != 'true') || (i == (n-1))) {
				button = $('#r'+buttonIndices[i].row+'c'+buttonIndices[i].col);
				path = $('#r'+buttonIndices[i].row+'c'+buttonIndices[i].col+'curve')[0];
				label = button.find('.nav-label');
				button.addClass('default');
				label.addClass('default-choice');
				path.setAttribute('stroke', '#000000');
				foundDefault = true;
				break;
			//}
		}
		if (foundDefault) break;
	}
	
}

/**
 * Layout the navigation elements.
 *
 * @param	duration		Duration of the update.
 */
ScalarBasin.prototype.layoutNavigation = function(duration) {

	var me = this;
	
	var unitWidth = (scalarview.windowWidth * .5) - (scalarview.surface.currentMargin * .5);
	var unitHeight = Math.round($(window).height() / 6) * this.visScaleY;
	
	var row;
	var col;
	var btnType;
	var top;
	var left;
	var button;
	var label;
	var isCollapsed;
	var content;
	
	this.editor.css('top', unitHeight * 3);
	
	for (row=0; row<3; row++) {
		
		top = unitHeight + ((row * 2) * unitHeight);
		
		for (col=0; col<3; col++) {
		
			left = Math.round(scalarview.surface.currentMargin * .5) + (col * unitWidth);

			if (this.navmap.content[row][col].length > 0) {
			
				button = $('#r'+row+'c'+col);
				button.css('left', left);
				button.css('top', top);
				label = button.find('.nav-label');
				// TODO: make this not be a fade (i.e. interpolate property instead)
				if (scalarview.marginsCollapsed && (scalarview.state == 'reading')) {
					label.fadeOut(duration);
				} else {
					label.fadeIn(duration);
				}
		
				var path = $('#r'+row+'c'+col+'curve')[0];
					
				if (col == 0) {
				
					// line from center left to center
					if (row == 1) {
						path.setAttribute(
							'd', 'M'+left+' '+top+
							' L '+(scalarview.windowWidth * .5)+' '+top
						);
						
					// line from top left to center (maybe bottom left too?)
					} else {
						path.setAttribute(
							'd', 'M'+left+' '+top+
							' q '+(unitWidth * .25)+' 0 '+(unitWidth * .5)+' '+unitHeight+
							' q '+(unitWidth * .25)+' '+unitHeight+' '+(unitWidth * .5)+' '+unitHeight
						);
					}
					
				} else if (col == 2) {
				
					// line from center right to center
					if (row == 1) {
						path.setAttribute(
							'd', 'M'+left+' '+top+
							' L '+(scalarview.windowWidth * .5)+' '+top
						);
						
					// line from bottom left to center (maybe top left too?) 
					} else {
						path.setAttribute(
							'd', 'M'+left+' '+top+
							' q '+(unitWidth * -.25)+' 0 '+(unitWidth * -.5)+' '+(unitHeight * -1)+
							' q '+(unitWidth * -.25)+' '+(unitHeight * -1)+' '+(unitWidth * -.5)+' '+(unitHeight * -1)
						);
					}
				}
			}
			
		}
	}
	
}


/**
 * Defines a local navigation map.
 *
 * @param	data		The page data from which the map should be generated.
 * @param	model		The model.
 */
function NavigationMap() {

	this.content = [
		[[],[],[]],
		[[],[scalarview.currentNode],[]],
		[[],[],[]]
	]
	this.btnType = [
		['up','up','up'],
		['left','self','right'],
		['down','down','down']
	]
	this.enclosingPaths = [];
	
	var containedNodes;
	if (scalarview.currentNode == scalarview.tocNode) {
		containedNodes = scalarview.currentNode.getRelatedNodes('referee', 'outgoing', true);
	} else {
		containedNodes = scalarview.currentNode.getRelatedNodes('path', 'outgoing');
	}
	if (containedNodes.length > 0) {
		this.content[2][2].push(containedNodes[0]);
	}
	
	var containingNodes = scalarview.currentNode.getRelatedNodes('path', 'incoming');
	if (containingNodes.length > 0) {
	
		// what if we're contained by more than one path?
	
		var containingNode = containingNodes[0];
		this.content[0][0].push(containingNode);
		
		containedNodes = containingNode.getRelatedNodes('path', 'outgoing');
		
		var i;
		var n = containedNodes.length;
		var node;
		var pageIndex = -2;
		for (i=0; i<n; i++) {
			node = containedNodes[i];
			if (node == scalarview.currentNode) {
				pageIndex = i;
				if (i > 0) {
					this.content[1][0].push(containedNodes[i-1]);
				}
			}
			if (i == (pageIndex + 1)) {
				this.content[1][2].push(node);
				break;
			}
		}

	} else if (scalarview.currentNode != scalarview.tocNode) {
		this.content[0][0].push(scalarview.tocNode);
	}
	
}

NavigationMap.prototype.model = null;
NavigationMap.prototype.navmap = null;
NavigationMap.prototype.enclosingPaths = null;


/**
 * Creates a new ScalarSurface.
 * @class		Manages the primary reading interface for a Scalar book.
 *
 * @property {Object} element				Root DOM element for the surface.
 * @property {Number} defaultMargin			Minimum width of the default horizontal margin of the surface.
 * @property {Number} collapsedMargin		Minimum width of the collapsed margin of the surface (used only when space is at a premium).
 * @property {Number} currentMargin			Current margin of the surface.
 * @property {Number} maxWidth				Maximum width of the surface.
 */
function ScalarSurface() {

	this.defaultMargin = 130;
	this.collapsedMargin = 65;
	this.currentMargin = 130;
	this.maxWidth = 960;

}

ScalarSurface.prototype.element = null;
ScalarSurface.prototype.defaultMargin = null;
ScalarSurface.prototype.collapsedMargin = null;
ScalarSurface.prototype.currentMargin = null;
ScalarSurface.prototype.maxWidth = null;

/**
 * Updates layout of items in the view.
 *
 * @param	duration		Duration of the update.
 */
ScalarSurface.prototype.update = function(duration) {
	this.element.css('left', this.currentMargin);
	this.element.css('right', this.currentMargin);
}

/**
 * Sets the current state of the page.
 *
 * @param	newState 	The new state.
 * @param	duration	Duration of the transition to the new state.
 * @param	propsOnly	If true, modify properties only, not dom elements.
 */
ScalarSurface.prototype.setState = function(newState, duration, propsOnly) {

	switch (newState) {
	
		case 'reading':
		if (!propsOnly) {
			this.element.fadeIn(duration);
		}
		break;
		
		case 'navigating':
		if (!propsOnly) {
			if (this.element.css('display') != 'none') this.element.fadeOut(duration);
		}
		break;
		
		case 'editing':
		if (!propsOnly) {
			if (this.element.css('display') != 'none') this.element.fadeOut(duration);
		}
		break;
		
		case 'designing':
		if (!propsOnly) {
			if (this.element.css('display') != 'none') this.element.fadeOut(duration);
		}
		break;
	
	}
	
	// surface layout
	if (scalarview.marginsCollapsed && (newState == 'reading')) {
		scalarview.stateProperties.push({context:this, property:'currentMargin', value:this.collapsedMargin});
	} else {
		var currentSurfaceWidth = Math.min(scalarview.windowWidth - (this.defaultMargin * 2), this.maxWidth);
		scalarview.stateProperties.push({context:this, property:'currentMargin', value:Math.round((scalarview.windowWidth - currentSurfaceWidth) * .5)});
	}

}

/**
 * Initial construction of the surface.
 *
 * @param {String} viewType		Name of the view to be used to render the page.
 */
ScalarSurface.prototype.render = function(viewType) {

	var me = this;
	
	this.element = $('<div id="surface"></div>').appendTo('body');

	this[viewType]();

}

/**
 * The default view renderer.
 */
ScalarSurface.prototype.textOnlyView = function() {
	
	// visibility
	var surfaceVisible = $.cookie('surface visible');
	if (surfaceVisible != null) {
		$('#surface').css('display', surfaceVisible);
	}
	
	// get page title
	var title;
	if (scalarview.currentNode == scalarview.tocNode) {
		title = 'Contents';
	} else {
		title = scalarview.currentNode.getDisplayTitle();
	}
	
	// window title
	document.title = scalarapi.model.bookNode.title +' : '+ title;

	// book icon and link to home
	var bookTitle = $('<div id="header">'+scalarapi.model.bookNode.title+'</div>').appendTo(this.element);
	bookTitle.click(function() {
		scalarview.setPage('index');
	});
	
	// marker
	this.element.append('<h1>'+title+'<div class="marker"></div></h1>');
	this.marker = $('.marker');
	this.marker.data('id', scalarview.currentNode.url);
	this.marker.click(function() {
		
		var marked = $.cookie('scalarmarked');
		var id = $(this).data('id');
		var model = $(this).data('model');
		
		var index = scalarview.markedURLs.indexOf(scalarview.currentNode.url);
		if (index != -1) {
			scalarview.markedURLs.splice(index, 1);
			$(this).removeClass('marked');
		} else {
			scalarview.markedURLs.push(scalarview.currentNode.url);
			$(this).addClass('marked');
		}
		$.cookie('scalarmarked', scalarview.markedURLs.join('|'), {path:"/"});
		
	});
	if (scalarview.visitedURLs.indexOf(scalarview.currentNode.url) != -1) {
		this.marker.addClass('visited');
	}
	if (scalarview.markedURLs.indexOf(scalarview.currentNode.url) != -1) {
		this.marker.addClass('marked');
	}
	
	// body content
	var htmlContent = $('<div id="content"></div>');
	if (scalarview.currentNode.current) {
		if (scalarview.currentNode.current.content != null) {
			htmlContent = $('<div id="content">'+nl2br(scalarview.currentNode.current.content)+'</div>');
		}
	}
	this.element.append(htmlContent);
	htmlContent.find('a').each(function() {
		if ($(this).attr('href').indexOf('://') == -1) {
			$(this).data('url', $(this).attr('href'));
			$(this).attr('href', 'javascript:;');
			$(this).click(function(event) {
				event.stopImmediatePropagation();
				if (scalarview.singlePageMode) {
					scalarview.reloadForScalarPage($(this).data('url'));
				} else {
					scalarview.setPage($(this).data('url'));
				}
			});
		}
	});
	$('#content').css('display', 'block');
	
	// footer
	var comments = scalarview.currentNode.getRelatedNodes('comment', 'incoming');
	this.footer = $('<div id="footer"><div id="comment">'+((comments.length > 0) ? comments.length : '&nbsp;')+'</div><div id="footer-right"><div class="edit"></div><div class="design"></div></div></div>').appendTo(this.element);
	this.footer.find('.edit').click(function() {
		scalarview.setState('editing', 'fast', false);
	});
	
	// path items or content items
	var relatedNodes;
	if (scalarview.currentNode == scalarview.tocNode) {
		relatedNodes = scalarview.currentNode.getRelatedNodes('referee', 'outgoing', true);
	} else {
		relatedNodes = scalarview.currentNode.getRelatedNodes('path', 'outgoing');
	}
	if (relatedNodes.length > 0) {
		
		$('#content').append('<ol></ol>');
		var i;
		var n = relatedNodes.length;
		var node;
		var listItem;
		for (i=0; i<n; i++) {
			node = relatedNodes[i];
			listItem = $('<li><a href="javascript:;">'+node.getDisplayTitle()+'</a></li>').appendTo('#content>ol');
			listItem.data('url', scalarapi.basename(node.url));
			listItem.click(function() {
				if (scalarview.singlePageMode) {
					scalarview.reloadForScalarPage($(this).data('url'));
				} else {
					scalarview.setPage($(this).data('url'));
				}
			});
		}
	}	
	
}

/**
 * The standard view renderer.
 */
ScalarSurface.prototype.standardView = function() {
	
	// visibility
	var surfaceVisible = $.cookie('surface visible');
	if (surfaceVisible != null) {
		$('#surface').css('display', surfaceVisible);
	}
	
	// get page title
	var title;
	if (scalarview.currentNode == scalarview.tocNode) {
		title = 'Contents';
	} else {
		title = scalarview.currentNode.getDisplayTitle();
	}
	
	// window title
	document.title = scalarapi.model.bookNode.title +' : '+ title;

	// book icon and link to home
	var bookTitle = $('<div id="header">'+scalarapi.model.bookNode.title+'</div>').appendTo(this.element);
	bookTitle.click(function() {
		scalarview.setPage('index');
	});
	
	// marker
	this.element.append('<h1>'+title+'<div class="marker"></div></h1>');
	this.marker = $('.marker');
	this.marker.data('id', scalarview.currentNode.url);
	this.marker.click(function() {
		
		var marked = $.cookie('scalarmarked');
		var id = $(this).data('id');
		var model = $(this).data('model');
		
		var index = scalarview.markedURLs.indexOf(scalarview.currentNode.url);
		if (index != -1) {
			scalarview.markedURLs.splice(index, 1);
			$(this).removeClass('marked');
		} else {
			scalarview.markedURLs.push(scalarview.currentNode.url);
			$(this).addClass('marked');
		}
		$.cookie('scalarmarked', scalarview.markedURLs.join('|'), {path:"/"});
		
	});
	if (scalarview.visitedURLs.indexOf(scalarview.currentNode.url) != -1) {
		this.marker.addClass('visited');
	}
	if (scalarview.markedURLs.indexOf(scalarview.currentNode.url) != -1) {
		this.marker.addClass('marked');
	}
	
	// body content
	var htmlContent = $('<div id="content"></div>');
	if (scalarview.currentNode.current) {
		if (scalarview.currentNode.current.content != null) {
			htmlContent = $('<div id="content"><div id="interior">'+nl2br(scalarview.currentNode.current.content)+'</div></div>');
		}
	}
	//console.log(htmlContent);
	this.element.append(htmlContent);
	htmlContent.find('a').each(function() {
		/*if ($(this).attr('resource')) {
			var temp = $(this).attr('href').split('.');
			temp.pop()
			var url = temp.join('.')+'.mp4';
			$(this).parent().before('<video style="margin-bottom:30px;" controls="controls" width="100%"><source src="'+url+'" type="video/mp4">');
		}*/
		if ($(this).attr('href') != null) {
			if ($(this).attr('href').indexOf('://') == -1) {
				$(this).data('url', $(this).attr('href'));
				$(this).attr('href', 'javascript:;');
				$(this).click(function(event) {
					event.stopImmediatePropagation();
					scalarview.setPage($(this).data('url'));
				});
			}
		} else if ($(this).attr('resource')) {
			var slot ;
			if (Math.random() < .75) {
				slot = $(this).slotmanager_create_slot(300 + (Math.round((Math.random() * 5)) * 50), {url_attributes: ['href', 'src']});
			} else {
				slot = $(this).slotmanager_create_slot(820, {url_attributes: ['href', 'src']});
			}
			if (slot) slot.addClass('right');
			//$(this).before(slot);
			/*
			var className;
			var rand = Math.random();
			if (rand < .4) {
				className = "media_file right";
			} else if (rand < .8) {
				className = "media_file right";
			} else {
				className = "media_file right";
			}
			var mediaFileHTML = '<div class="'+className+'">'+$(this).attr('resource')+'</div>';
			$(this).before(mediaFileHTML);*/
			
			if ($(this).parent('li').length > 0) {
				$(this).parent('li').before(slot);
			} else if ($(this).prev('br').length > 0) {
				$(this).prev('br').before(slot);
			} else {
				$(this).parent().prepend(slot);
			}
		}
	});
	$('#content').css('display', 'block');
	
	// footer
	var comments = scalarview.currentNode.getRelatedNodes('comment', 'incoming');
	this.footer = $('<div id="footer"><div id="comment">'+((comments.length > 0) ? comments.length : '&nbsp;')+'</div><div id="footer-right"><div class="edit"></div><div class="design"></div></div></div>').appendTo(this.element);
	this.footer.find('.edit').click(function() {
		scalarview.setState('editing', 'fast', false);
	});
	
	// path items or content items
	var relatedNodes;
	if (scalarview.currentNode == scalarview.tocNode) {
		relatedNodes = scalarview.currentNode.getRelatedNodes('referee', 'outgoing', true);
	} else {
		relatedNodes = scalarview.currentNode.getRelatedNodes('path', 'outgoing');
	}
	if (relatedNodes.length > 0) {
		
		$('#content').append('<ol></ol>');
		var i;
		var n = relatedNodes.length;
		var node;
		var listItem;
		for (i=0; i<n; i++) {
			node = relatedNodes[i];
			listItem = $('<li><a href="javascript:;">'+node.getDisplayTitle()+'</a></li>').appendTo('#content>ol');
			listItem.data('url', scalarapi.basename(node.url));
			listItem.click(function() {
				scalarview.setPage($(this).data('url'));
			});
		}
	}	
	
}

/**
 * The multi-column view renderer.
 */
ScalarSurface.prototype.multiColumnView = function() {
	
	// visibility
	var surfaceVisible = $.cookie('surface visible');
	if (surfaceVisible != null) {
		$('#surface').css('display', surfaceVisible);
	}
	
	// get page title
	var title;
	if (scalarview.currentNode == scalarview.tocNode) {
		title = 'Contents';
	} else {
		title = scalarview.currentNode.getDisplayTitle();
	}
	
	// window title
	document.title = scalarapi.model.bookNode.title +' : '+ title;

	// book icon and link to home
	var bookTitle = $('<div id="header">'+scalarapi.model.bookNode.title+'</div>').appendTo(this.element);
	bookTitle.click(function() {
		scalarview.setPage('index');
	});
	
	// marker
	this.element.append('<h1>'+title+'<div class="marker"></div></h1>');
	this.marker = $('.marker');
	this.marker.data('id', scalarview.currentNode.url);
	this.marker.click(function() {
		
		var marked = $.cookie('scalarmarked');
		var id = $(this).data('id');
		var model = $(this).data('model');
		
		var index = scalarview.markedURLs.indexOf(scalarview.currentNode.url);
		if (index != -1) {
			scalarview.markedURLs.splice(index, 1);
			$(this).removeClass('marked');
		} else {
			scalarview.markedURLs.push(scalarview.currentNode.url);
			$(this).addClass('marked');
		}
		$.cookie('scalarmarked', scalarview.markedURLs.join('|'), {path:"/"});
		
	});
	if (scalarview.visitedURLs.indexOf(scalarview.currentNode.url) != -1) {
		this.marker.addClass('visited');
	}
	if (scalarview.markedURLs.indexOf(scalarview.currentNode.url) != -1) {
		this.marker.addClass('marked');
	}
	
	// body content
	var htmlContent = $('<div id="content"></div>');
	if (scalarview.currentNode.current) {
		if (scalarview.currentNode.current.content != null) {
			htmlContent = $('<div id="content"><div id="multiColumn">'+nl2br(scalarview.currentNode.current.content)+'</div></div>');
		}
	}
	//console.log(htmlContent);
	this.element.append(htmlContent);
	htmlContent.find('a').each(function() {
		/*if ($(this).attr('resource')) {
			var temp = $(this).attr('href').split('.');
			temp.pop()
			var url = temp.join('.')+'.mp4';
			$(this).parent().before('<video style="margin-bottom:30px;" controls="controls" width="100%"><source src="'+url+'" type="video/mp4">');
		}*/
		if ($(this).attr('href').indexOf('://') == -1) {
			$(this).data('url', $(this).attr('href'));
			$(this).attr('href', 'javascript:;');
			$(this).click(function(event) {
				event.stopImmediatePropagation();
				scalarview.setPage($(this).data('url'));
			});
		} else if ($(this).attr('resource')) {
			var slot ;
			slot = $(this).slotmanager_create_slot(260, {url_attributes: ['href', 'src']});
			if ($(this).parent('li').length > 0) {
				$(this).parent('li').parent('ul').before(slot);
			} else if ($(this).prev('br').length > 0) {
				$(this).prev('br').before(slot);
			} else {
				$(this).parent().prepend(slot);
			}
		}
	});
	$('#content').css('display', 'block');
	
	// footer
	var comments = scalarview.currentNode.getRelatedNodes('comment', 'incoming');
	this.footer = $('<div id="footer"><div id="comment">'+((comments.length > 0) ? comments.length : '&nbsp;')+'</div><div id="footer-right"><div class="edit"></div><div class="design"></div></div></div>').appendTo(this.element);
	this.footer.find('.edit').click(function() {
		scalarview.setState('editing', 'fast', false);
	});
	
	// path items or content items
	var relatedNodes;
	if (scalarview.currentNode == scalarview.tocNode) {
		relatedNodes = scalarview.currentNode.getRelatedNodes('referee', 'outgoing', true);
	} else {
		relatedNodes = scalarview.currentNode.getRelatedNodes('path', 'outgoing');
	}
	if (relatedNodes.length > 0) {
		
		$('#content').append('<ol></ol>');
		var i;
		var n = relatedNodes.length;
		var node;
		var listItem;
		for (i=0; i<n; i++) {
			node = relatedNodes[i];
			listItem = $('<li><a href="javascript:;">'+node.getDisplayTitle()+'</a></li>').appendTo('#content>ol');
			listItem.data('url', scalarapi.basename(node.url));
			listItem.click(function() {
				scalarview.setPage($(this).data('url'));
			});
		}
	}	
	
}

/**
 * Experimental view.
 */
ScalarSurface.prototype.fullScreenTitle = function() {
	
	// get page title
	var title;
	if (scalarview.currentNode == scalarview.tocNode) {
		title = 'Contents';
	} else {
		title = scalarview.currentNode.getDisplayTitle();
	}
	
	// window title
	document.title = scalarapi.model.bookNode.title +' : '+ title;
	
	var title = $('<div><h1>'+title+'<h1></div>').appendTo(this.element);
	title.css('color', 'white');
	this.element.css('background-color', '#000');
	//this.element.css('max-width', '100%');
	//this.element.css('width', '100%');
	//this.element.css('margin', '0');
	this.element.css('padding-top', '100px');
	this.element.css('text-align', 'center');

}

/**
 * Experimental view.
 */
ScalarSurface.prototype.fullScreenMedia = function() {

	var me = this;
	
	// get page title
	var title;
	if (scalarview.currentNode == scalarview.tocNode) {
		title = 'Contents';
	} else {
		title = scalarview.currentNode.getDisplayTitle();
	}
	
	// window title
	document.title = scalarapi.model.bookNode.title +' : '+ title;
	
	this.element.css('background-color', '#333');
	/*this.element.css('max-width', '100%');
	this.element.css('width', '100%');*/
	//this.element.css('margin', '0');
	this.element.css('text-align', 'center');
	//this.element.css('padding', '0');
	
	// body content
	var htmlContent = $('<div id="content"></div>');
	if (scalarview.currentNode.current) {
		if (scalarview.currentNode.current.content != null) {
			htmlContent = $('<div id="content"><div id="interior">'+nl2br(scalarview.currentNode.current.content)+'</div></div>');
		}
	}
	$(htmlContent).find('a').each(function() {
		if ($(this).attr('href').indexOf('://') == -1) {
			$(this).data('url', $(this).attr('href'));
			$(this).attr('href', 'javascript:;');
			$(this).click(function(event) {
				event.stopImmediatePropagation();
				scalarview.setPage($(this).data('url'));
			});
		} else if ($(this).attr('resource')) {
			var slot = $(this).slotmanager_create_slot(820, {url_attributes: ['href', 'src']});
			me.element.append(slot);
		}
	});
	$('#content').css('display', 'block');

}



/**
 * Experimental view.
 */
ScalarSurface.prototype.tagVisualization = function() {

	// get page title
	var title;
	if (scalarview.currentNode == scalarview.tocNode) {
		title = 'Contents';
	} else {
		title = scalarview.currentNode.getDisplayTitle();
	}
	
	// window title
	document.title = scalarapi.model.bookNode.title +' : '+ title;
	
	this.element.width('960px');
	this.element.css('padding', '0');
	this.element.css('max-width', '960px');
	
	this.element.append('<div id="visualization"></div>');
	
	var options = {parent_uri:scalarapi.model.urlPrefix, default_tab:'vistag'}; 
	$('#visualization').scalarvis(options);
	
}

/**
 * Get paths to script and style directories
 */
var script_uri = document.getElementsByTagName("script")[0].src;
var base_uri = script_uri.substr(0, script_uri.lastIndexOf('/'));
var arbors_uri = base_uri.substr(0, base_uri.lastIndexOf('/'));
var views_uri = arbors_uri.substr(0, arbors_uri.lastIndexOf('/'));
var modules_uri = views_uri+'/modules';
var widgets_uri = views_uri+'/widgets';

/*
 * $.fn.slotmanager_create_slot
 * Create a slot and attach to a tag
 * @param obj options, required 'url_attributes' 
 */	

$.fn.slotmanager_create_slot = function(width, options) {

	$tag = $(this); 
	if ($tag.hasClass('inline')) return;
	$tag.data( 'slot', $('<div class="slot"></div>') );
	var url = null;
	
	// Get URL
	
	var url = null;
	for (var k in options['url_attributes']) {;
		if ('undefined'==typeof($tag.attr(options['url_attributes'][k]))) continue;
		if ($tag.attr(options['url_attributes'][k]).length>0) {
			url = $tag.attr(options['url_attributes'][k]);
			break;
		}
	}
	if (!url) return;
	
	// Seperate seek hash if present
	
	var annotation_url = null;
	var uri_components = url.split('#');
	
	// TODO: Special case for hypercities #, until we correctly variable-ify #'s
	if (uri_components.length>1 && uri_components[0].toLowerCase().indexOf('hypercities')!=-1) {
		// keep URL as it is
	} else if (uri_components.length>1) {
		var url = uri_components[0];
		annotation_url = uri_components[1];	
		//if (annotation_url && annotation_url.indexOf('://')==-1) annotation_url = dirname(document.location.href)+'/'+annotation_url;	
		// modified by Erik below to remove duplicated 'annotations/' in url
		if (annotation_url && annotation_url.indexOf('://')==-1) annotation_url = scalarapi.model.urlPrefix+annotation_url;	
	}

	// Metadata resource
	var resource = $tag.attr('resource');		
	
	// Create media element object
	
	var opts = {};
	opts.width = width; 
	opts.player_dir = $('link#approot').attr('href')+'static/players/';
	opts.base_dir = scalarapi.model.urlPrefix;
	opts.seek = annotation_url;
	//if (opts.seek && opts.seek.length) alert('[Test mode] Asking to seek: '+opts.seek);		
	$tag.data('path', url);
	$tag.data('meta', resource);
	$tag.mediaelement(opts);
	
	// Insert media element's embed markup
	
	if (!$tag.data('mediaelement')) return false;  // mediaelement rejected the file
	$tag.data('slot').html( $tag.data('mediaelement').getEmbedObject() );

	return $tag.data('slot');

}