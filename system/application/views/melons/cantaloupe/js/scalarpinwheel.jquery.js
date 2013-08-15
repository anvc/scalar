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

(function($) {

	$.scalarpinwheel = function(e, options) {
	
		var element = e;
		
		var basin = {
		
			options: $.extend({}, options)
			
		}
		
		var pinwheel = new ScalarPinwheel();
		pinwheel.render();
		
		return pinwheel;
	}
	
})(jQuery);

/**
 * @param t a raphael text shape
 * @param width - pixels to wrap text width
 * @param textAnchor - desired end state of text anchor (added by Erik)
 * modify t text adding new lines characters for wrapping it to given width.
 * source: http://stackoverflow.com/questions/3142007/how-to-either-determine-svg-text-box-width-or-force-line-breaks-after-x-chara
 */
function wrapText(t, width, textAnchor) {
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


// G: progress, E: start value, F: change in value
function swingEasing(G,E,F) {
	return ((-Math.cos(G*Math.PI)/2)+0.5)*F+E;
}

function ScalarPinwheel(element) {

	this.element = element;
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
	
	$(window).resize(this.update);
	window.onorientationchange = this.update;

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
ScalarPinwheel.prototype.currentMargin = null;

ScalarPinwheel.prototype.render = function() {

	var me = this;
	
	//console.log('**** RENDER ****');

	//this.element = $('<div id="graph"></div>').appendTo('body');
	
	/*var handleBackgroundClick = function(e) {
	
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
	
	this.element.click(handleBackgroundClick);*/
	
	viewerElement = $('<div id="gnViewer" class="graphNodeViewer"></div>').appendTo('body');
	this.viewer = new GraphNodeViewer('gnViewer', this);
	
	//this.element.css('display', 'none');

	this.canvas = Raphael('graph', $(window).width(), $(window).height());
	
	var zoomControls = $('<div id="zoomControls"></div>').appendTo('#graph');
	this.zoomIn = Raphael('zoomControls', 32, 32);
	this.zoomIn.path('M25.979,12.896 19.312,12.896 19.312,6.229 12.647,6.229 12.647,12.896 5.979,12.896 5.979,19.562 12.647,19.562 12.647,26.229 19.312,26.229 19.312,19.562 25.979,19.562z').attr({fill: '#000', stroke: 'none'}).click(function(event) {
		event.stopImmediatePropagation();
		if (me.currentZoom > 0) {
			me.currentZoom--;
		}
		me.buildGraph();
	});
	this.zoomOut = Raphael('zoomControls', 32, 32);
	this.zoomOut.path('M25.979,12.896,5.979,12.896,5.979,19.562,25.979,19.562z').attr({fill: '#000', stroke: 'none'}).click(function(event) {
		event.stopImmediatePropagation();
		if (me.currentZoom < 6) {
			me.currentZoom++;
		}
		me.buildGraph();
	})
	
	this.buildGraph();
	
	//console.log('---- current node graph ----');
	//console.log(this.nodeGraph);

}

ScalarPinwheel.prototype.buildGraph = function() {

	this.nodeGraph = [];
	this.pathGraphs = {};
	this.pathGraphCount = 0;
	
	this.calculateDimensions();

	var graphNode = this.createGraphNode([currentNode], {x:0, y:0}, 'none', {type:'current', data: null});
	
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
	
	pinwheel.calculateDimensions();
	pinwheel.canvas.setSize($(window).width(), $(window).height());
	pinwheel.resetNodeGraphDrawing();
	pinwheel.canvas.setStart();
	pinwheel.drawGraphNode(pinwheel.nodeGraph[0]);
	pinwheel.canvasSet = pinwheel.canvas.setFinish();

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
	
	this.currentMargin = ($(window).width() - $('.page').width()) * .5;
	
	this.unitSize = {
		/*x: (($(window).width() * .5) - (scalarview.surface.currentMargin * .5)) / (this.currentZoom + 1),*/
		x: (($(window).width() * .5) - (this.currentMargin * .5)) / (this.currentZoom + 1),
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
 		var graphNode = new GraphNode(nodes, graphPosition, reason, this); 
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

	//console.log('add relations for '+glraphNode.nodes[0].getDisplayTitle()+' at depth '+currentDepth);
	
	//console.log('  -- add relations for graph node "'+graphNode.getDisplayTitle()+'" ----');
	//console.log(graphNode.nodes);
	
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
			
			//if ((graphNode.nodes.length == 1) && (graphNode.nodes[0] == currentNode)) {
			
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
			//labelWidth = scalarview.surface.currentMargin * .8;
			labelWidth = this.currentMargin * .8;
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
		var outerRadius;
		var innerCircle;
		var label;
		var i;
		
		var goToPage = function(event) { 
			console.log('go to page');
			event.stopImmediatePropagation();
			if (state == ViewState.Navigating) {
				me.canvasSet.animate({'transform':'t'+(-me.unitSize.x*graphNode.position.x)+','+(-me.unitSize.y*graphNode.position.y)}, 350, '<>', function() {
					//scalarview.setPage(scalarapi.basepath(graphNode.nodes[0].url)); 
					window.location = addTemplateToURL(graphNode.nodes[0].url, 'cantaloupe'); // TODO: make this dynamic
				})
			} else {
				//scalarview.setPage(scalarapi.basepath(graphNode.nodes[0].url));
				window.location = addTemplateToURL(graphNode.nodes[0].url, 'cantaloupe');
			}
		};

		//console.log(graphNode.nodes[0].getDisplayTitle()+' '+graphNode.nodes.length);
	
		if (graphNode.nodes.length > 0) {
			
			if (graphNode.nodes.length > 1) {
		
				outerRadius = 18;
				if (graphNode.children.length > 0) outerRadius += 6;
				outerCircle = this.canvas.circle(canvasPosition.x, canvasPosition.y, outerRadius);
			
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
						// replace with css fonts
						label.attr({'font-family':'\'Lato\', Arial, sans-serif', 'font-size':'16px', 'cursor':'pointer'});
						wrapText(label, labelWidth, 'middle');
						graphNode.drawing.push(label);
					}
					outerCircle.click(function() { 
						me.viewer.showForGraphNode(graphNode);
					});
				} else {
					// draw heterogeneous multi-node
				}
				
			} else if (graphNode.nodes[0] == currentNode) {    
		
				/*if (currentNode.color) {
					outerRadius = 18;
				} else {*/
					outerRadius = 18;
				//}
				//if (graphNode.children.length > 0) outerRadius += 6;
				outerCircle = this.canvas.circle(canvasPosition.x, canvasPosition.y, outerRadius);
			 
				if (!this.showIcons) {
					innerCircle = this.canvas.circle(canvasPosition.x, canvasPosition.y, 3.5);
					if (currentNode.color) {
						color = Raphael.getRGB(graphNode.nodes[0].color);
						color = Raphael.rgb2hsl(color.r, color.g, color.b);
						color.l = Math.max(0, color.l - .1);
						outerCircle.attr({'fill':Raphael.hsl2rgb(color).hex, 'stroke':'#eee', 'stroke-width':3, 'cursor':'pointer'});
						innerCircle.attr({'fill':'#eee', 'stroke':'none', 'cursor':'pointer'});
					} else {
						outerCircle.attr({'fill':'#fff', 'stroke-width':3, 'cursor':'pointer'});
						innerCircle.attr({'fill':'#000', 'stroke':'none', 'cursor':'pointer'});
					}
					graphNode.drawing.push(outerCircle, innerCircle);
					if (drawLabels) {
						label = this.canvas.text(canvasPosition.x, canvasPosition.y+20, graphNode.getDisplayTitle());
						// replace with css fonts
						label.attr({'font-family':'\'Lato\', Arial, sans-serif', 'font-size':'16px', 'cursor':'pointer'});
						wrapText(label, labelWidth, 'middle');
						graphNode.drawing.push(label);
					}
				} else {
					// draw node with dominant type icon in currentNode style
				}  
				
			} else {  
			
				if (this.currentZoom == 0) {
		
					outerRadius = 18;
					//if (graphNode.children.length > 0) outerRadius += 6;
					outerCircle = this.canvas.circle(canvasPosition.x, canvasPosition.y, outerRadius);
					
					var rotationString = '';
					if (graphNode.position.x < 0) {
						if (graphNode.position.y < 0) {
							rotationString = 'r-90t1,-0.5';
						} else {
							rotationString = 'r180t1,0';
						}
					} else {
						if (graphNode.position.y > 0) {
							//rotationString = 'r90t0,0.5';
						}
					}
					var transformString = 't'+canvasPosition.x+','+canvasPosition.y+rotationString;
					var pathString = Raphael.transformPath('M1,9.219V4H-9v-8H1v-5.219l9.375,9.062L1,9.219z', transformString);
					innerCircle = this.canvas.path(pathString);
					
				} else {
					
					/*if (graphNode.children.length > 0) {
						outerRadius = 22;
					} else {*/
						outerRadius = 18;
					//}
					outerCircle = this.canvas.circle(canvasPosition.x, canvasPosition.y, outerRadius);
					innerCircle = this.canvas.circle(canvasPosition.x, canvasPosition.y, 3.5);
				}
				
				if (graphNode.nodes[0].color) {
					color = Raphael.getRGB(graphNode.nodes[0].color);
					color = Raphael.rgb2hsl(color.r, color.g, color.b);
					color.l = Math.max(0, color.l - .1);
					outerCircle.attr({'fill':Raphael.hsl2rgb(color).hex, 'stroke':'#eee', 'stroke-width':1, 'cursor':'pointer'});
					innerCircle.attr({'fill':'#fff', 'stroke':'none', 'cursor':'pointer'});
					
				} else if (((graphNode.reason.type == 'child') || (graphNode.reason.type == 'youngerSibling') || (graphNode.reason.type == 'olderSibling'))) {
					color = Raphael.getRGB(graphNode.reason.data.nodes[0].color);
					color = Raphael.rgb2hsl(color.r, color.g, color.b);
					color.l = Math.max(0, color.l - .1);
					
					// color stroke, white interior, gray arrow
					//outerCircle.attr({'fill':'#fff', 'stroke':Raphael.hsl2rgb(color).hex, 'stroke-width':4, 'cursor':'pointer'});
					//innerCircle.attr({'fill':'#666', 'stroke':'none', 'cursor':'pointer'});
					
					outerCircle.attr({'stroke':Raphael.hsl2rgb(color).hex, 'fill':'#eee', 'stroke-width':3, 'cursor':'pointer'});
					innerCircle.attr({'fill':Raphael.hsl2rgb(color).hex, 'stroke':'none', 'cursor':'pointer'});
					//outerCircle.attr({'fill':Raphael.hsl2rgb(color).hex, 'stroke':'#eee', 'stroke-width':3, 'cursor':'pointer'});
					//innerCircle.attr({'fill':'#fff', 'stroke':'none', 'cursor':'pointer'});
					
					//outerCircle.attr({'fill':graphNode.reason.data.nodes[0].color, 'stroke-width':2, 'cursor':'pointer'});
					//innerCircle.attr({'fill':'#000', 'stroke':'none', 'cursor':'pointer'});*/
				} else if (drawAsContainer) {
					outerCircle.attr({'fill':color, 'stroke':'#eee', 'stroke-width':3, 'cursor':'pointer'});
					outerCircle.data('node', graphNode);
					/*outerCircle.mouseover(function() {
						this.pinwheel.filter = this.data('node');
						this.pinwheel.update();
					});
					outerCircle.mouseout(function() {
						this.pinwheel.filter = null;
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
					var labelOffsetV = 20;
					if (graphNode.children.length > 0) labelOffsetV = 26;
					label = this.canvas.text(canvasPosition.x, canvasPosition.y+labelOffsetV, graphNode.nodes[0].getDisplayTitle());
					// replace with css fonts
					label.attr({'font-family':'\'Lato\', Arial, sans-serif', 'font-size':'16px', 'cursor':'pointer', 'fill':'#000000'});
					/*if (graphNode.children.length > 0) {
						label.attr({'font-weight':'bold'});
					}*/
					wrapText(label, labelWidth, 'middle');
					graphNode.drawing.push(label);
				}
					
				/*} else if (!this.showIcons) {
					innerCircle = this.canvas.circle(canvasPosition.x, canvasPosition.y, 3.5);
					if (currentNode.color) {
						outerCircle.attr({'fill':currentNode.color, 'stroke':'none'});
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
	var strokeWidth = 2; // nee 4
	var arrowPosition;

	switch (type) {
	
		case 'path_parent':
		pathString += 'M'+destPos.x+' '+destPos.y;
		// horizontal s curve
		pathString += 'q'+qtrW+' '+0+' '+halfW+' '+halfH;
		pathString += 'q'+qtrW+' '+halfH+' '+halfW+' '+halfH;
		
		// vertical s curve
		//pathString += 'q'+0+' '+halfH+' '+halfW+' '+halfH;
		//pathString += 'q'+halfW+' '+0+' '+halfW+' '+halfH;
		
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
		strokeWidth = 2;
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

function GraphNodeViewer(elementName, pinwheel) {

	this.element = $('body').find('#'+elementName);
	this.canvas = Raphael(elementName, 100, 100);
	this.pinwheel = pinwheel;

}

GraphNodeViewer.prototype.element = null;
GraphNodeViewer.prototype.canvas = null;
GraphNodeViewer.prototype.pinwheel = null;

GraphNodeViewer.prototype.showForGraphNode = function(graphNode) {

	var canvasPosition = {
		//x: this.pinwheel.center.x + (graphNode.position.x * this.pinwheel.unitSize.x),
		//y: this.pinwheel.center.y + (graphNode.position.y * this.pinwheel.unitSize.y) 
		x: 300 + (graphNode.position.x * 100),
		y: 300 + (graphNode.position.y * 100) 
	}
	
	this.element.css('left', canvasPosition.x);
	this.element.css('top', canvasPosition.y);
	this.element.css('display', 'block');

}

GraphNodeViewer.prototype.hide = function() {
	
}

function GraphNode(nodes, position, reason, pinwheel) {
	
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
	this.pinwheel = pinwheel;
	
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
			
			if (this.pinwheel.graphNodeForScalarNode(relation.body) == null) {
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
					if (this.pinwheel.pathGraphs[node.url] == undefined) {
						this.pinwheel.pathGraphs[node.url] = new PathGraph(node, {x:allRelatedNodes[i].index, y:this.pinwheel.pathGraphCount});
						this.pinwheel.pathGraphCount++;
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
		return (this.nodes.indexOf(currentNode != -1));
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
		
		if (relatedNodes.length > 0) console.log('     found new '+relationName+'-'+direction+' child of "'+this.getDisplayTitle()+'"');
		
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
		
		if (sibling != null) console.log('     found older sibling of "'+this.getDisplayTitle()+'": "'+sibling.node.getDisplayTitle()+'"');
		
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
		
		if (sibling != null) console.log('     found younger sibling of "'+this.getDisplayTitle()+'": "'+sibling.node.getDisplayTitle()+'"');
		
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
		
		if (siblings.length > 0) console.log('     found '+siblings.length+' older step-siblings');
		
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
