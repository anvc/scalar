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

(function($){

    $.scalarvis = function( el, options ){

        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        
        // Access to jQuery and DOM versions of element
        base.$el = $( el );
        base.el = el;

        base.visStarted = false;
		base.resultsPerPage = 25;
		base.loadedAllContent = false;
		base.canonicalTypeOrder = [ "path", "page", "comment", "tag", "annotation", "media" ];
		base.canonicalRelationOrder = [
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
		base.neutralColor = "#dddddd";
		base.VisualizationContent = {
			"all": "All content",
			"toc": "Table of contents",
			"page": "All pages",
			"path": "All paths",
			"tag": "All tags",
			"annotation": "All annotations",
			"media": "All media",
			"comment": "All comments",
			"current": "Current page"
		}
		base.currentNode = scalarapi.model.getCurrentPageNode();
		base.modalIsOpen = false;

        // one-time setup
        base.init = function(){
  
            //Replace undefined options with defaults...
            base.setOptions( $.extend( {}, $.scalarvis.defaultOptions, options ) );

			// if we're booting the vis up in a modal, then 
			if ( base.options.modal ) {

				// create the modal elements around the core vis element
				base.$el.addClass( 'modal fade' );
				base.$el.attr( {
					'tabindex': '-1',
					'role': 'dialog',
					'aria-labelledby': 'myModalLabel'
				} );
				base.$el.append( '<div class="modal-dialog modal-lg modal-xlg"><div class="modal-content index_modal"></div></div>' );
				var modalContent = base.$el.find( '.modal-content' );
				var header = $( '<header class="modal-header"><h2 class="modal-title heading_font heading_weight">Visualization</h2><button tabindex="10000" type="button" title="Close" class="close" data-dismiss="modal"><span>Close</span></button></header>' ).appendTo( modalContent );
				var body = $( '<div class="modal-body"></div>' ).appendTo( modalContent );
				base.visElement = $( '<div class="modalVisualization"></div>' ).appendTo( body );

				// when the modal is hidden, pause loading and drawing
				base.$el.on( 'hide.bs.modal', function() {
					if ( base.force != null ) {
						base.force.stop();
					}
					$( 'body' ).trigger( 'closeModalVis' );
					base.pause();
					base.modalIsOpen = false;
				});

				// when the modal is shown, redraw the visualization
				base.$el.on( 'shown.bs.modal', function() {
					base.draw();
					base.modalIsOpen = true;
				});

				// adjust overflow so the modal hides correctly
				base.$el.on( 'hidden.bs.modal', function() {
					$( 'body' ).css( 'overflowY', 'auto' );
				});

			// otherwise, if the vis is embedded directly in the page
			} else {

				base.visElement = base.$el;

				// redraw non-modal vis whenever a modal vis is closed so coordinates get reset on the nodes
				$( 'body' ).bind( 'closeModalVis', function() { base.draw(); } );

			}

			// inform all instances that content has finished loading
			$( 'body' ).bind( 'visLoadedAllContent', function() { base.loadedAllContent = true; } );

			// Add a reverse reference to the DOM object
			base.visElement.data( "scalarvis", base );

			// other setup goes here

			// build global markup
			base.visElement.addClass( 'caption_font' );

			var container = $( '<div class="container-fluid"><div class="row" style="max-width: 75%;"></div></div>' ).appendTo( base.visElement );

			// create loading message
			base.loadingMsg = $( '<div class="loadingMsg"><p>Loading data...</p></div>' ).appendTo( container.find( '.row' ) );
			if ( base.options.modal ) {
				base.loadingMsg.addClass( 'bounded' ); // removes left page margin padding
			}
			base.progressBar = $( '<div class="progress"><div class="progress-bar" role="progressbar" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100" style="width: 10%;"><span class="sr-only">10% complete</span></div></div>' ).appendTo( base.loadingMsg );

			// only modal visualizations get the controls
			if ( base.options.modal ) {

				base.controls = $( '<div class="vis-controls form-inline"></div>' ).appendTo( base.visElement );

				var controls_html = 	'<select class="vis-content-control form-control">';
				for ( var prop in base.VisualizationContent ) {
					controls_html += '<option value="' + prop + '">' + base.VisualizationContent[ prop ] + '</option>';
				}
				controls_html += 	'</select> ' +	
									'<select class="vis-relations-control form-control">' +
										'<option value="all">All relationships</option>' +
										'<option value="parents-children">Parents and children</option>' +
										'<option value="none">No relationships</option>' +
									'</select> ' +
									'<select class="vis-format-control form-control">' +
										'<option value="grid">Grid format</option>' +
										'<option value="tree">Tree format</option>' +
										'<option value="radial">Radial format</option>' +
										'<option value="force-directed">Force-directed format</option>' +
									'</select>';
				base.controls.append( controls_html );

				base.visElement.find( ".vis-content-control" ).change( function( evt ) {
					var contentValue = $( this ).val();
					var relationsValue = base.visElement.find( ".vis-relations-control" ).val();
					base.options.content = contentValue;

					// if content is set to current and relations are parent-child, then choose the relation
					// type based on the dominant scalar type of the current content
					if ( contentValue == "current" ) {
						if (( relationsValue != "all" ) && ( relationsValue != "none" )) {
							base.options.relations = base.currentNode.getDominantScalarType().id;
						}

					} else if ( contentValue == "toc" ) {
						// nothing

					// if content is set to a specific type, make the relation type match it
					} else if ( contentValue != "all" ) {
						if (( relationsValue != "all" ) && ( relationsValue != "none" )) {
							base.options.relations = contentValue;
						}
					}
					if ( base.options.relations == "media" ) {
						base.options.relations = "referee";
					}
					base.visualize();
				});

				base.visElement.find( ".vis-relations-control" ).change( function( evt ) {
					var contentValue = base.visElement.find( ".vis-content-control" ).val();
					switch ( $( this ).val() ) {

						case "all":
						base.options.relations = "all";
						break;

						case "parents-children":
						if ( contentValue == "current" ) {
							base.options.relations = base.currentNode.type.id;
						} else if ( contentValue == "all" ) {
							base.options.relations = contentValue;
						} else if ( contentValue == "toc" ) {
							base.options.relations = "all";
						} else {
							base.options.relations = base.options.content;
						}
						if ( base.options.relations == "media" ) {
							base.options.relations = "referee";
						}
						break;

						case "none":
						base.options.relations = "none";
						break;

					}
					base.visualize();
				});

				base.visElement.find( ".vis-format-control" ).change( function( evt ) {
					base.options.format = base.visElement.find( ".vis-format-control" ).val();
					base.visualize();
				});

				base.updateControls();
			}

			// create visualization div
			base.visualization = $( '<div class="scalarvis"></div>' ).appendTo( base.visElement );
			if ( base.options.content != 'current' ) {
				base.visualization.css('padding', '0');
			}

			// footer
			var visFooter = $( '<div class="vis_footer"></div>' ).appendTo( base.visElement );
			if ( options.modal ) {
				visFooter.css( 'text-align', 'center' );
			}
			
			// help popover
			base.helpButton = $( '<button class="btn btn-link btn-xs" data-toggle="popover" data-placement="top">About this visualization</button>' );
			visFooter.append( base.helpButton );
			base.helpButton.popover( { trigger: "hover click", html: true } );
			
			// legend popover
			visFooter.append( '|' );
			base.legendButton = $( '<button class="btn btn-link btn-xs" data-toggle="popover" data-placement="top" >Legend</button>' );
			visFooter.append( base.legendButton );
			var type, name,
				legendMarkup = "";
			n = base.canonicalTypeOrder.length;
			for ( i = 0; i < n; i++ ) {
				type = base.canonicalTypeOrder[ i ];
				name = scalarapi.model.scalarTypes[ type ].plural;
				name = name.charAt(0).toUpperCase() + name.slice(1)
				legendMarkup += '<span style="color:' + base.highlightColorScale( type ) + ';">&#9632;</span> ' + name + '<br>';
			}
			legendMarkup += '<br><div style="max-width: 175px;">Since content can have more than one type, a given item may change colors depending on context.</div>';
			base.legendButton.attr( "data-content", legendMarkup );
			base.legendButton.popover( { trigger: "hover click", html: true } );

			// if we're not in a modal, then start immediately
			if ( !base.options.modal ) {
				base.visualize();
			}

			$( 'body' ).bind( 'delayedResize', function() { 
				if (( base.options.modal && base.modalIsOpen ) || !base.options.modal ) {
					base.visualize(); 
				}
			} );

        };

        base.setOptions = function( options ) {
        	if ( options.content == "reply" ) {
        		options.content = "comment";
        	}
        	base.options = options;
        	if ( base.controls != null ) {
 				base.updateControls();
        	}
      	};

       	base.updateControls = function() {
       		base.visElement.find( ".vis-content-control" ).val( base.options.content );
       		switch ( base.options.relations ) {

       			case "all":
       			case "none":
       			case "toc":
       			base.visElement.find( ".vis-relations-control" ).val( base.options.relations );
       			break;

       			default:
       			base.visElement.find( ".vis-relations-control" ).val( "parents-children" );
       			break;

       		}
       		base.visElement.find( ".vis-format-control" ).val( base.options.format );
       	}
		
		// color scheme generated at http://colorbrewer2.org
		base.highlightColorScale = function( d, t, n ) {
		
			if ( t == null ) {
				t = "noun";
			}

			if ( n == null ) {
				n = this.neutralColor;
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
				case "reply":
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
				color = n;
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
					return n;
					break;
					
				}
				break;
			
			}
			
		}
		
		// pop-up that shows information about the selected node
		base.nodeInfoBox = function( d ) { 

			var i, n, description, relatedNodes, itemCount, itemName, itemType, type, direction, relationType;

			var str = '<div class="arrow"></div><div class="content"><p><strong>';
			str += d.getDisplayTitle( true );
			str += '</strong></p>';

			n = base.canonicalRelationOrder.length;
			for (i=0; i<n; i++) {
				type = base.canonicalRelationOrder[i].type;
				direction = base.canonicalRelationOrder[i].direction;
				(direction == 'incoming') ? itemType = 'body' : itemType = 'target';
				relationType = scalarapi.model.relationTypes[type];
				description = relationType[direction];
				relatedNodes = d.getRelatedNodes(type, direction);
				itemCount = relatedNodes.length;
				(itemCount > 1) ? itemName = relationType[itemType+'Plural'] : itemName = relationType[itemType];
				if (itemCount > 0) str += '<p style="color:'+d3.rgb(base.neutralColor).brighter(1.5)+';">'+description+' '+itemCount+' '+itemName+'</p>';
			}

			if (base.rolloverNode != null) {
				if ((base.rolloverNode.url != d.url) || (base.selectedNodes.indexOf(d) != -1) || isMobile) {
					str += '<a href="'+d.url+'" class="btn btn-primary btn-xs" role="button">Visit &raquo;</a>';
				}
			} else {
				str += '<a href="'+d.url+'" class="btn btn-primary btn-xs" role="button">Visit &raquo;</a>';
			}

			str += '</div></div>';

			return str; 
		}

		// Source: https://github.com/Caged/d3-tip
		// Gets the screen coordinates of a shape
		//
		// Given a shape on the screen, will return an SVGPoint for the directions
		// n(north), s(south), e(east), w(west), ne(northeast), se(southeast), nw(northwest),
		// sw(southwest).
		//
		//    +-+-+
		//    |   |
		//    +   +
		//    |   |
		//    +-+-+
		//
		// Returns an Object {n, s, e, w, nw, sw, ne, se}
		base.getScreenBBox = function( target ) {

			var targetel = target /*|| d3.event.target*/;

			while ('undefined' === typeof targetel.getScreenCTM && 'undefined' === targetel.parentNode) {
				targetel = targetel.parentNode;
			}

			var svg = base.getSVGNode(base.svg)
      		var point = svg.createSVGPoint()

			var bbox = {},
				matrix = targetel.getScreenCTM(),
				//tbbox = targetel.getBBox(),
				tbbox = targetel.getBoundingClientRect(),
				width = tbbox.width,
				height = tbbox.height,
				x = tbbox.left,
				y = tbbox.top;

			point.x = x;
			point.y = y;
			bbox.nw = point.matrixTransform(matrix);
			point.x += width;
			bbox.ne = point.matrixTransform(matrix);
			point.y += height;
			bbox.se = point.matrixTransform(matrix);
			point.x -= width;
			bbox.sw = point.matrixTransform(matrix);
			point.y -= height / 2;
			bbox.w  = point.matrixTransform(matrix);
			point.x += width;
			bbox.e = point.matrixTransform(matrix);
			point.x -= width / 2;
			point.y -= height / 2;
			bbox.n = point.matrixTransform(matrix);
			point.y += height;
			bbox.s = point.matrixTransform(matrix);

			bbox.bbox = tbbox;

			//console.log( tbbox );

			return bbox;
		}

		// Source: https://github.com/Caged/d3-tip
		base.getSVGNode = function( el ) {
			el = el.node();
			if ( el.tagName.toLowerCase() === 'svg' ) {
				return el;
			}
			return el.ownerSVGElement;
		}

        // boots/reboots the visualization with the current options
        base.visualize = function() {

			base.clear();

    		base.loadIndex = -1;
        	base.loadingPaused = false;
        	base.loadingDone = false;
        	base.drawingPaused = false;
        	base.visStarted = true;
			base.pageIndex = 0;
			base.reachedLastPage = true;
			base.typeCounts = {};
			base.maxNodesPerType = 0;
			base.startTime = new Date();
			base.loadingMsgShown = false;
			base.contentNodes = [];
			base.activeNodes = [];
			base.rolloverNode = null;
			base.relations = [];
			base.links = [];
			base.linksBySlug = {};
			base.relatedNodes = [];
			base.sortedNodes = [];
			base.nodesBySlug = {};
			base.svg = null;
			base.selectedNodes = [ base.currentNode ];
			base.hasBeenDrawn = false;
			base.loadSequence = null;
			base.maxConnections = 0;
			base.hierarchy = null;
			base.selectedHierarchyNodes = null;
			base.processedNodesForHierarchy = [];

 			base.visualization.css( 'height', '' );

			if ( base.options.modal ) {
				base.visualization.removeClass( 'bounded' );
				base.visElement.find( '.loadingMsg' ).addClass( 'bounded' );
				base.visElement.find( '.vis_footer' ).addClass( 'bounded' );

			} else {
				base.visElement.addClass( 'page_margins' );
			}

			/*console.log( '----' );
			for ( var prop in base ) {
				if ( typeof(base[prop]) !== "function" ) {
					console.log( prop + ': ' + base[prop] );
				}
			}*/

 			if ( !base.loadedAllContent ) {
 				base.buildLoadSequence();
       			base.loadNextData();
 			} else {
 				base.loadingDone = true;
 				base.filter();
 				setTimeout( function() { base.draw(); }, 0 );
 			}

        };

        // figures out what data to load based on current options
        base.buildLoadSequence = function() {

        	var i, n, nodes, node;

        	base.loadSequence = [];

			switch ( base.options.content ) {

				case "all":
				base.loadSequence.push( { id: 'book', desc: "book", relations: 'none' } );
				base.loadSequence.push( { id: 'current', desc: "current page", relations: 'none' } );
				base.loadSequence.push( { id: 'current', desc: "current page's connections", relations: 'all' } );
				base.loadSequence.push( { id: 'path', desc: "paths", relations: 'path' } );
				base.loadSequence.push( { id: 'tag', desc: "tags", relations: 'tag' } );
				base.loadSequence.push( { id: 'media', desc: "media", relations: 'referee' } );
				base.loadSequence.push( { id: 'page', desc: "pages", relations: 'none' } );
				base.loadSequence.push( { id: 'annotation', desc: "annotations", relations: 'annotation' } );
				base.loadSequence.push( { id: 'reply', desc: "comments", relations: 'reply' } );
				break;

				case "current":
				base.loadSequence.push( { id: 'current', desc: "current page", relations: base.options.relations } );
				break;

				case "toc":
				var nodes = scalarapi.model.getMainMenuNode().getRelatedNodes( 'referee', 'outgoing', true );
				n = nodes.length;
				for ( i = 0; i < n; i++ ) {
					node = nodes[i];
					base.loadSequence.push( { id: 'toc', desc: "table of contents", node: node, relations: base.options.relations } );
				}
				break;

				case "path":
				case "tag":
				case "media":
				case "annotation":
				base.loadSequence.push( { id: base.options.content, desc: scalarapi.model.scalarTypes[ base.options.content ].plural, relations: base.options.relations } );
				break;

				case "comment":
				base.loadSequence.push( { id: "reply", desc: scalarapi.model.scalarTypes[ base.options.content ].plural, relations: base.options.relations } );
				break;

			}

        };

		base.loadNode = function( slug, ref ) {
			//console.log( 'load node' );
			scalarapi.loadNode( slug, true, base.parseNode, null, 1, ref );
		}
		
		base.parseNode = function( data ) {
			//console.log( 'parse node' );
			base.filter();
			base.draw( true );
		}

        // pauses loading and drawing
        base.pause = function() {
			base.loadingPaused = !base.loadingDone;
			base.drawingPaused = true;
        };

        // resumes loading and drawing
        base.resume = function() {
			base.drawingPaused = false;
			if ( base.loadingPaused ) {
				base.loadingPaused = false;
				base.loadNextData();
			}
        };

        // shows a modal containing the visualization of the given type
        base.showModal = function( options ) {

        	// enforce modal
        	options.modal = true;

        	// if the vis has never been started or if any options have changed, then start it
        	if ( !base.visStarted || (( base.options.content != options.content ) || ( base.options.relations != options.relations ) || ( base.options.format != options.format ))) {
	            base.setOptions( $.extend( {}, base.options, options ) );
	            base.visualize();
       		
       		// otherwise, resume it
        	} else {
        		base.resume();
        	}

			base.$el.modal();

        }

        base.loadNextData = function() {

			// if we've reached the last page of the current content type, increment/reset the counters
			if ( base.reachedLastPage ) {
				base.loadIndex++;
				base.pageIndex = 0;
				base.reachedLastPage = false;
				
			// otherwise, just increment the page counter
			} else {
				base.pageIndex++;
			}
			
			var url, result, start, end, loadInstruction, forceReload, depth, references, relations;
			
			// if we still have more data to load, then load it
			if ( base.loadIndex < base.loadSequence.length ) {
			
				loadInstruction = base.loadSequence[ base.loadIndex ];

				switch ( loadInstruction.id ) {
				
					case 'book':
					base.reachedLastPage = true;
					result = scalarapi.loadBook( false, base.parseData, null );
					start = end = -1;
					break;
				
					case 'current':
					if ( loadInstruction.relations == 'none' ) {
						forceReload = false;
						depth = 0;
						references = false;
						relations = null;
					} else {
						forceReload = true;
						depth = 1;
						references = ( loadInstruction.relations == 'referee' );
						if ( loadInstruction.relations == 'all' ) {
							relations = null;
						} else {
							relations = loadInstruction.relations;
						}
					}
					base.reachedLastPage = true;
					start = end = -1;
					result = scalarapi.loadCurrentPage( forceReload, base.parseData, null, depth, references, relations);
					break;

					case 'toc':
					if ( loadInstruction.relations == 'none' ) {
						forceReload = false;
						depth = 0;
						references = false;
						relations = null;
					} else {
						forceReload = true;
						depth = 1;
						references = ( loadInstruction.relations == 'referee' );
						if ( loadInstruction.relations == 'all' ) {
							relations = null;
						} else {
							relations = loadInstruction.relations;
						}
					}
					start = ( this.pageIndex * this.resultsPerPage );
					end = start + this.resultsPerPage;
					result = scalarapi.loadPage( loadInstruction.node.slug, forceReload, base.parseData, null, depth, references, relations, start, base.resultsPerPage );
					break;

					default:
					if ( loadInstruction.relations == 'none' ) {
						depth = 1;
						references = false;
						relations = null;
					} else {
						depth = 1;
						references = (( loadInstruction.relations == 'referee' ) || ( loadInstruction.relations == 'all' ));
						if ( loadInstruction.relations == 'all' ) {
							relations = null;
						} else {
							relations = loadInstruction.relations;
						}
					}
					start = ( this.pageIndex * this.resultsPerPage );
					end = start + this.resultsPerPage;
					result = scalarapi.loadPagesByType( loadInstruction.id, true, base.parseData, null, depth, references, relations, start, base.resultsPerPage );
					break;
				
				}

				//console.log( "load next data: " + loadInstruction.id + ' ' + start + ' ' + end );
		
				base.updateLoadingMsg(
					loadInstruction.desc, 
					(( base.loadIndex + 1 ) / ( base.loadSequence.length + 1 )) * 100, 
					( start == -1 ) ? -1 : start + 1, 
					end,
					base.typeCounts[ loadInstruction.id ]
				);
				
				if ( result == 'loaded' ) {
					base.parseData();
				}
				
			// otherwise, hide the loading message
			} else {
				base.hideLoadingMsg();
				base.loadingDone = true;
				if ( base.options.content == 'all' ) {
					base.loadedAllContent = true;
					$( 'body' ).trigger( 'visLoadedAllContent' );
				}
			}

        };

        base.parseData = function( json ) {
		
			if ( jQuery.isEmptyObject( json ) || ( json == null ) ) {
				base.reachedLastPage = true;
			}

			var loadInstruction = base.loadSequence[ base.loadIndex ];

			if ( loadInstruction != null ) {
			
				var typedNodes = scalarapi.model.getNodesWithProperty( 'scalarType', loadInstruction.id );
				base.maxNodesPerType = Math.max( base.maxNodesPerType, typedNodes.length );

				// attempt to find the total count of the current item type as returned in the data
				var i, n, count, citation, tempA, tempB;
				for ( var prop in json ) {
					citation = json[ prop ][ "http://scalar.usc.edu/2012/01/scalar-ns#citation" ];
					if ( citation != null ) {
						tempA = citation[ 0 ].value.split( ";" );
						n = tempA.length;
						for ( i = 0; i < n; i++ ) {
							if ( tempA[ i ].indexOf( "methodNumNodes=" ) == 0 ) {
								tempB = tempA[ i ].split( "=" );
								count = parseInt( tempB[ tempB.length - 1 ] );
								break;
							}
						}
						break;
					}
				}

				// if a count was found, store it
				if ( count != null ) {
					base.typeCounts[ loadInstruction.id ] = count;	

					// if the count is less than the point at which we'd start our next load, then
					// we've reached the last page of data for this item type
					if ( count < (( base.pageIndex + 1 ) * base.resultsPerPage )) {
						base.reachedLastPage = true;
					}
				}
			
				// redraw the view
				base.filter();
				base.draw();
				
				// get next chunk of data
				if ( !base.loadingPaused ) {
					base.loadNextData();
				}

			}

        };
		
		base.showLoadingMsg = function() {
			base.loadingMsg.slideDown();
		}

		base.updateLoadingMsg = function( typeName, percentDone, start, end, total ) {
			
			// only show the loading message if it's taking a while to load the data
			if ( !base.loadingMsgShown && (( new Date().getTime() - base.startTime.getTime() ) > 1000 )) {
				base.showLoadingMsg();
				base.loadingMsg.show();
				base.loadingMsgShown = true;
			}
			
			if (( start != -1 ) && ( total != null )) {
				base.loadingMsg.find('p').text( 'Loading ' + typeName + ' (' + start + '/' + total + ')...' );
			} else {
				base.loadingMsg.find('p').text( 'Loading ' + typeName + '...' );
			}
			base.progressBar.find( ".progress-bar" ).attr( "aria-valuenow", percentDone ).css( "width", percentDone + "%" );
			base.progressBar.find( ".sr-only" ).text( percentDone + "% complete" );

		}
		
		base.hideLoadingMsg = function() {
			base.loadingMsg.slideUp( 400, function() { base.draw(); } );
		}
		
		/**
		 * Returns a new string no longer than the specified amount of characters,
		 * shortening with ellipses if necessary.
		 *
		 * @param	str			The source string.
		 * @param	maxChars	Maximum string length.
		 * @return				The modified string.
		 */
		base.getShortenedString = function(str, maxChars) {
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

		base.arrayUnique = function( array ) {
		    var a = array.concat();
		    for(var i=0; i<a.length; ++i) {
		        for(var j=i+1; j<a.length; ++j) {
		            if(a[i] === a[j])
		                a.splice(j--, 1);
		        }
		    }
		    return a;
		}

		base.filter = function() {

			var i, n, node, relation, link, index, rels, relNodes, subRels, subRelNodes,
				newSortedNodes;

			base.maxConnections = 0.0;
			base.relatedNodes = [];
			base.relations = [];
			base.processedNodesForHierarchy = [];

			base.sortedNodes = [];
			
			// sort nodes by type, and then alphabetically
			switch ( base.options.content ) {

				case "all":
				base.contentNodes = [];

				// gather nodes of all types
				n = base.canonicalTypeOrder.length;
				for ( i = 0; i < n; i++ ) {
					base.contentNodes = base.contentNodes.concat( scalarapi.model.getNodesWithProperty( 'scalarType', base.canonicalTypeOrder[ i ] ) );
				}
				base.contentNodes = base.arrayUnique( base.contentNodes );

				// get relationships for each node
				n = base.contentNodes.length;
				for ( i = 0; i < n; i++ ) {
					node = base.contentNodes[ i ];
					rels = [];
					relNodes = [];
					if ( base.options.relations == "all" ) {
						relNodes = node.getRelatedNodes( null, "both" );
						rels = node.getRelations( null, "both" );
						base.relatedNodes = base.relatedNodes.concat( relNodes );
						base.relations = base.relations.concat( rels );
					} else if ( base.options.relations != "none" ) {
						relNodes = node.getRelatedNodes( base.options.relations, "both" );
						rels = node.getRelations( base.options.relations, "both" );
						base.relatedNodes = base.relatedNodes.concat( relNodes );
						base.relations = base.relations.concat( rels );
					}
					node.connectionCount = rels.length;
					base.maxConnections = Math.max( base.maxConnections, node.connectionCount );
				}
				break;

				case "toc":
				base.contentNodes = [];
				relNodes = scalarapi.model.getMainMenuNode().getRelatedNodes( 'referee', 'outgoing', true );
				rels = scalarapi.model.getMainMenuNode().getRelations( 'referee', 'outgoing', true );
				base.relatedNodes = base.relatedNodes.concat( relNodes );
				base.relations = base.relations.concat( rels );
				if ( base.options.relations != "none" ) {
					n = relNodes.length;
					for ( i = 0; i < n; i++ ) {
						node = relNodes[ i ];
						subRelNodes = node.getRelatedNodes( null, "both" );
						subRels = node.getRelations( null, "both" );
						base.relatedNodes = base.relatedNodes.concat( subRelNodes );
						base.relations = base.relations.concat( subRels );
						node.connectionCount = subRels.length;
						base.maxConnections = Math.max( base.maxConnections, node.connectionCount );
					}
					node.connectionCount = base.relations.length;
					base.maxConnections = Math.max( base.maxConnections, node.connectionCount );
				}
				break;

				case "current":
				base.contentNodes = [ base.currentNode ];

				// get relationships for the current node and any selected nodes
				if ( base.options.relations == "all" ) {
					base.relatedNodes = base.currentNode.getRelatedNodes( null, "both" );
					base.relations = base.currentNode.getRelations( null, "both" );
					n = base.selectedNodes.length;
					for ( i = 0; i < n; i++ ) {
						node = base.selectedNodes[ i ];
						relNodes = node.getRelatedNodes( null, "both" );
						rels = node.getRelations( null, "both" );
						base.relatedNodes = base.relatedNodes.concat( relNodes );
						base.relations = base.relations.concat( rels );
						node.connectionCount = rels.length;
						base.maxConnections = Math.max( base.maxConnections, node.connectionCount );
					}
				} else if ( base.options.relations != "none" ) {
					base.relatedNodes = base.currentNode.getRelatedNodes( base.options.relations, "both" );
					base.relations = base.currentNode.getRelations( base.options.relations, "both" );
					n = base.selectedNodes.length;
					for ( i = 0; i < n; i++ ) {
						node = base.selectedNodes[ i ];
						relNodes = node.getRelatedNodes( base.options.relations, "both" );
						rels = node.getRelations( base.options.relations, "both" );
						base.relatedNodes = base.relatedNodes.concat( relNodes );
						base.relations = base.relations.concat( rels );
						node.connectionCount = rels.length;
						base.maxConnections = Math.max( base.maxConnections, node.connectionCount );
					}
				}
				break;

				default:

				// get nodes of the current type
				base.contentNodes = scalarapi.model.getNodesWithProperty( 'scalarType', base.options.content );

				// get relationships for each node
				n = base.contentNodes.length;
				for ( i = 0; i < n; i++ ) {
					node = base.contentNodes[ i ];
					relNodes = [];
					rels = [];
					if ( base.options.relations == "all" ) {
						relNodes = node.getRelatedNodes( null, "both" );
						rels = node.getRelations( null, "both" );
						base.relatedNodes = base.relatedNodes.concat( relNodes );
						base.relations = base.relations.concat( rels );
					} else if ( base.options.relations != "none" ) {
						relNodes = node.getRelatedNodes( base.options.relations, "both" );
						rels = node.getRelations( base.options.relations, "both" );
						base.relatedNodes = base.relatedNodes.concat( relNodes );
						base.relations = base.relations.concat( rels );
					}
					node.connectionCount = rels.length;
					base.maxConnections = Math.max( base.maxConnections, node.connectionCount );
				}
				break;

			}

			//console.log( 'related nodes: ' + base.relatedNodes.length );

			newSortedNodes = base.arrayUnique( base.contentNodes.concat( base.relatedNodes ) );
			oldNodes = base.sortedNodes.concat();

			n = newSortedNodes.length;
			for ( i = ( n - 1 ); i >= 0; i-- ) {
				node = newSortedNodes[ i ];
				base.processNode( node );
				index = base.sortedNodes.indexOf( node );

				// add nodes that are new to us
				if ( index == -1 ) {
					base.sortedNodes.push( node );
					base.nodesBySlug[ node.slug ] = node;
					newSortedNodes.splice( i, 1 );

				// keep track of nodes that aren't
				} else {
					index = oldNodes.indexOf( node );
					oldNodes.splice( index, 1 );
				}
			}

			// remove any nodes which shouldn't be shown anymore
			n = oldNodes.length;
			for ( i = 0; i < n; i++ ) {
				node = oldNodes[ i ];
				index = base.sortedNodes.indexOf( node );
				if ( index != -1 ) {
					base.sortedNodes.splice( index, 1 );
				}
			}

			base.relations = base.arrayUnique( base.relations );

			switch ( base.options.format ) {

				case "force-directed":
				base.updateLinks();
				break;

				case "radial":
				base.updateLinks();
				if ( base.options.content == "toc" ) {
					// TODO: enable includeToc here, problem is that nodes are duplicated,
					// but when the nodes are manually removed, the relationship chords aren't
					// drawn in radial view
					base.updateTypeHierarchy( true, false, false, false ); 
				} else {
					base.updateTypeHierarchy( true, false, false, false );
				}
				break;

				case "tree":
				switch ( base.options.content ) {

					case "all":
					base.updateTypeHierarchy( false, true, false, false );
					break;

					case "toc":
					base.updateTypeHierarchy( false, true, true, true );
					break;

					case "current":
					base.updateTypeHierarchy( false, true, true, false );
					break;

					default:
					base.updateTypeHierarchy( false, true, true, false );
					break;

				}
				break;

			}

			//console.log( 'sorted: ' + base.sortedNodes.length );
			//console.log( 'links: ' + base.links.length );

		}

		base.processNode = function( node ) {
			if ( node.title == null ) {
				node.title = node.getDisplayTitle( true );
				node.shortTitle = this.getShortenedString(node.getDisplayTitle( true ), 15 )
				node.sortTitle = node.getSortTitle();
			}
			node.type = node.getDominantScalarType( base.options.content );
		}

		/**
		  * Rebuilds hierarchical node data.
		  *
		  * @param	{Boolean} includeSubgroups			Subdivide type branches such that no single branch has too many children
		  * @param	{Boolean} includeRelations			Recursively include nodes that are related to existing nodes in the hierarchy
		  * @param	{Boolean} restrictTopLevelTypes		Don't create top level branches for nodes not of the current content type
		  * @param	{Boolean} includeToc				Include the table of contents as a top level branch
		  */
		base.updateTypeHierarchy = function( includeSubgroups, includeRelations, restrictTopLevelTypes, includeToc ) {

			var maxNodeChars = 115 / 6;
			
			var i, j, n, o, index, node, hierarchyNode, indexType, typedNodes, bookTitle, title,
				hierarchyNodes = [],
				anglePerNode = 360 / base.sortedNodes.length,
				groupAngle = 10,
				nodeForCurrentContent = null,
				typedNodeStorage = {};

			bookTitle = $('.book-title').eq( 0 ).clone();
			bookTitle.find( 'span' ).remove();
			bookTitle = this.getShortenedString(  bookTitle.text(), 15 )

			base.hierarchy = { title: bookTitle, shortTitle: bookTitle, children: [], showsTitle: false };
			base.selectedHierarchyNodes = [];
			
			// add the current node
			//if ( base.options.content == "current" ) {
				/*indexType = { name: "", id: "current" };
				var nodeForCurrentContent = {title:indexType.name, type:indexType.id, isTopLevel:true, index:0, size:1, parent:types, maximizedAngle:360, children:[], descendantCount:1};
				types.children.push(nodeForCurrentContent);
				nodeForCurrentContent.children = setChildren(nodeForCurrentContent, [ base.currentNode ]);*/
			//}

			if ( includeToc ) {
				var tocNodes = scalarapi.model.getMainMenuNode().getRelatedNodes( 'referee', 'outgoing', true );
			}

			// sort nodes by type
			n = base.sortedNodes.length;
			for ( i = 0; i < n; i++ ) {
				node = base.sortedNodes[ i ];
				if (( includeToc && ( tocNodes.indexOf( node ) == -1 )) || !includeToc ) {
					if ( typedNodeStorage[ node.type.singular ] == null ) {
						typedNodeStorage[ node.type.singular ] = [];
					}
					typedNodeStorage[ node.type.singular ].push( node );
				}
			}

			if ( includeToc ) {

				var tocRoot = {
					title: "Table of Contents",
					shortTitle: "Table of Contents",
					type: "toc",
					isTopLevel: true, 
					index: base.hierarchy.length, 
					size: 1, 
					showsTitle: true,
					parent: base.hierarchy, 
					maximizedAngle: 360, 
					children: [],
					descendantCount: tocNodes.length
				}

				base.hierarchy.children.push( tocRoot );

				n = tocNodes.length;
				for ( i=0; i<n; i++ ) {
					node = tocNodes[i];
					//if (processedNodes.indexOf(node) == -1) {
						hierarchyNode = { 
							title: node.title,
							shortTitle: node.shortTitle,
							showsTitle: true, 
							node: node, 
							type: node.type.id,
							children: null
						};
						tocRoot.children.push( hierarchyNode );
						if ( includeRelations ) {
							base.addRelationsForHierarchyNode( hierarchyNode );
						}
					//}
				}
			}

			if ( base.options.content == "current" ) {

				// replace the root node with the current node if showing types
				// is not a priority
				if ( restrictTopLevelTypes ) {
					base.hierarchy = { 
						title: base.currentNode.title,
						shortTitle: base.currentNode.shortTitle,
						showsTitle: true, 
						node: base.currentNode, 
						type: base.currentNode.type.id,
						children: null
					};
					if ( includeRelations ) {
						base.addRelationsForHierarchyNode( base.hierarchy );
					}
				}

			}

			var typeList;
			switch ( base.options.content ) {

				case "all":
				typeList = base.canonicalTypeOrder;
				break;

				case "toc":
				case "current":
				if ( restrictTopLevelTypes ) {
					typeList = [];
				} else {
					typeList = base.canonicalTypeOrder;
				}
				break;

				default:
				if ( restrictTopLevelTypes ) {
					typeList = [ base.options.content ];
				} else {
					typeList = base.canonicalTypeOrder;
				}
				break;

			}
			
			// loop through each type
			n = typeList.length;
			for ( i = 0; i < n; i++ ) {
				indexType = typeList[ i ];
				
				// we do this so the highlight color scheme matches the regular
				base.highlightColorScale( indexType );
				
				typedNodes = typedNodeStorage[ indexType ];
				
				if ( typedNodes != null ) {

					// don't allow the current node to be added anywhere else
					//if ( base.options.content == "current" ) {
					/*	index = typedNodes.indexOf( base.currentNode );
						if ( index != -1 ) {
							typedNodes.splice( index, 1 );
						}*/
					//}
					
					// post-processing
					o = typedNodes.length;
					for ( j = ( o - 1 ); j >= 0; j-- ) {
						node = typedNodes[ j ];

						// remove nodes whose dominant type isn't page
						if (( indexType == "page" ) && ( node.type.singular != "page" )) {
							typedNodes.splice( j, 1 );
						}
					}

					title = scalarapi.model.scalarTypes[ indexType ].plural;
					
					// these are the top-level type nodes
					hierarchyNode = {
						title: title.charAt(0).toUpperCase() + title.slice(1), 
						shortTitle: title.charAt(0).toUpperCase() + title.slice(1),
						type: indexType, 
						isTopLevel: true,
						index: base.hierarchy.length, 
						size: 1, 
						showsTitle: false,
						parent: base.hierarchy, 
						maximizedAngle: 360, 
						children: [], 
						descendantCount: typedNodes.length
					};
					
					if ( base.hierarchy.children != null ) {
						base.hierarchy.children.push( hierarchyNode );
					}
					
					// recursively assign children to the node
					hierarchyNode.children = setChildren( hierarchyNode, typedNodes, includeSubgroups, includeRelations );

				}

			}
			
			/**
			 * Recursive function for assigning children, grandchildren, etc. to the top-level nodes based on density.
			 */
			function setChildren( curNode, childNodes, includeSubgroups, includeRelations ) {
			
				var j, curChild,
					n = childNodes.length,
					curChildren = [];
				
				// how big a node gets when maximized -- the smaller of the number of children * 15¡, or 270¡ total
				var maximizedAngle = Math.min(270, (n * 15));
				
				// maximized angle of each child
				var localAnglePerNode = curNode.maximizedAngle / n;
				
				// if the children of this segment, when maximized, will still be below a certain angle threshold, then
				// we need to make sub-groups for them
				if (( localAnglePerNode < 5 ) && includeSubgroups )  {
					
					// groups can't be smaller than the groupAngle (10¡) -- so figure out how many children
					// need to be in each group for that to be true
					var nodesPerGroup = Math.ceil(groupAngle / anglePerNode);
					
					// how many sub-groups will this node have?
					var groupCount = Math.ceil(n / nodesPerGroup);
					
					// split this group into as many sub-groups as needed so that each group is the group angle with maximized parent.
					for (j=0; j<groupCount; j++) {
					
						curChild = {title:curNode.title+'_group'+j, type:indexType, isGroup: true, isTopLevel:false, parent:curNode, maximizedAngle:maximizedAngle, children:[]};
						
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
						curChild = {
							title:childNodes[j].title, 
							shortTitle:childNodes[j].shortTitle, 
							type:indexType, 
							showsTitle: true,
							isTopLevel:false, 
							node:childNodes[j], 
							parent:curNode
						};
						/*if (childNodes[j].current) {
							curChild = {title:childNodes[j].current.title, shortTitle:me.getShortenedString(childNodes[j].current.title, maxNodeChars), type:indexType.id, isTopLevel:false, node:childNodes[j], parent:curNode};
						} else {
							curChild = {title:childNodes[j].title, shortTitle:me.getShortenedString(childNodes[j].title, maxNodeChars), type:indexType.id, isTopLevel:false, node:childNodes[j], parent:curNode};
						}*/
						curChildren.push(curChild);
						if (base.selectedNodes.indexOf(childNodes[j]) != -1) {
							base.selectedHierarchyNodes.push(curChild);
						}
						base.nodesBySlug[curChild.node.slug] = curChild;

						if ( includeRelations ) {
							base.addRelationsForHierarchyNode( curChild );
						}

						hierarchyNodes.push(curChild);
					}
				}
				
				return curChildren;
			}

		}

		// recursively parse through the nodes contained by this node and store their relationships
		base.addRelationsForHierarchyNode = function( sourceData ) {

			var destNode, destData, i, j, n, o, relation, comboUrl, nodes;

			var relationList;
			switch ( base.options.relations ) {

				case "all":
				relationList = base.canonicalRelationOrder;
				break;

				case "none":
				relationList = [];
				break;

				default:
				if ( base.options.relations == "referee" ) {
					relationList = [ { type: base.options.relations, direction: 'incoming' } ];
				} else {
					relationList = [ { type: base.options.relations, direction: 'outgoing' } ];
				}
				break;

			}

			n = relationList.length;
			for ( i = 0; i < n; i++ ) {
				relation = relationList[ i ];
				if ( relation.direction == "outgoing" ) {
					nodes = sourceData.node.getRelatedNodes( relation.type, relation.direction );
					if (nodes.length > 0) {
						if ( sourceData.children == null ) {
							sourceData.children = [];
						}
						o = nodes.length;
						for (j=0; j<o; j++) {
							destNode = nodes[j];
							base.processNode( destNode );
							destData = { 
								title: destNode.title,
								shortTitle: destNode.shortTitle, 
								node: destNode, 
								type: destNode.type.id,
								showsTitle: true,
								parent: sourceData,
								children: null 
							};
							sourceData.children.push( destData );
							if ( base.processedNodesForHierarchy.indexOf( destNode ) == -1 ) {
								base.processedNodesForHierarchy.push( destNode );
								base.addRelationsForHierarchyNode( destData );
							}
						}
					}
				}
			}

		}
		
		/**
		 * Returns true if the given hierarchy node has the candidate hierarchy node as an ancestor.
		 */
		base.hasHierarchyNodeAsAncestor = function( self, candidate ) {
			while ((self.parent != null) && (self.parent != candidate)) {
				self = self.parent;
			}
			return ((self.parent == candidate) && (candidate != null));
		}

		base.updateLinks = function() {

			var i, n, slug, existingLink,
				oldLinks = base.links.concat();

			n = base.relations.length;
			for ( i = 0; i < n; i++ ) {
				relation = base.relations[ i ];
				if (( base.sortedNodes.indexOf( relation.body ) != -1 ) && ( base.sortedNodes.indexOf( relation.target ) != -1 )) {
					slug = relation.body.slug + '-' + relation.target.slug;
					existingLink = base.linksBySlug[ slug ];

					// add links that are new to us
					if ( existingLink == null ) {
						link = { source: relation.body, target: relation.target, value: 1, type: relation.type };
						base.links.push( link );
						base.linksBySlug[ slug ] = link;

					// keep track of links that aren't
					} else {
						index = oldLinks.indexOf( existingLink );
						oldLinks.splice( index, 1 );
					}
				}
			}

			// remove any links that shouldn't be shown anymore
			n = oldLinks.length;
			for ( i = 0; i < n; i++ ) {
				link = oldLinks[ i ];
				slug = link.source.slug + '-' + link.target.slug;
				base.linksBySlug[ slug ] = null;
				index = base.links.indexOf( link );
				if ( index != -1 ) {
					base.links.splice( index, 1 );
				}
			}

			/*console.log( '----' );
			var link
			n = base.links.length;
			for ( i = 0; i < n; i++ ) {
				link = base.links[ i ];
				console.log( link.source.slug + ' - ' + link.target.slug );
			}*/

		}

		base.typeSort = function( a, b ) {
			var idSortA = base.canonicalTypeOrder.indexOf( a.type.singular );
			var idSortB = base.canonicalTypeOrder.indexOf( b.type.singular );
			if ( a.type.singular == base.options.content ) {
				idSortA = -1;
			}
			if ( b.type.singular == base.options.content ) {
				idSortB = -1;
			}
			if ( a.current && b.current ) {
				var alphaSort = 0;
				if ( idSortA < idSortB ) {
					return -1;
				} else if ( idSortA > idSortB ) {
					return 1;
				} else if ( a.sortTitle < b.sortTitle ) {
					return -1;
				} else if ( a.sortTitle > b.sortTitle ) {
					return 1;
				} else {
					return 0;
				}
			} else {
				return idSortA - idSortB;
			}
		};

		base.updateActiveNodes = function() {

			var i, n, newActiveNodes, node, index;

			if (base.rolloverNode && (base.selectedNodes.indexOf(base.rolloverNode) == -1)) {
				newActiveNodes = base.selectedNodes.concat([base.rolloverNode]);
			} else {
				newActiveNodes = base.selectedNodes.concat();
			}

			// handle node persistence; adding new and removing old
			n = base.activeNodes.length;
			for ( i = ( n - 1 ); i >= 0; i-- ) {
				node = base.activeNodes[ i ];
				index = newActiveNodes.indexOf( node );
				if ( index != -1 ) {
					newActiveNodes.splice( index, 1 );
				} else {
					base.activeNodes.splice( index, 1 );
				}
			}
			n = newActiveNodes.length;
			for ( i = 0; i < n; i++ ) {
				base.activeNodes.push( newActiveNodes[ i ] );
			}

			// remove any nodes that aren't in the current sort
			n = base.activeNodes.length;
			for ( i = ( n - 1 ); i >= 0; i-- ) {
				node = base.activeNodes[ i ];
				if ( base.sortedNodes.indexOf( node ) == -1 ) {
					base.activeNodes.splice( i, 1 );
				}
			}
		}

        base.clear = function() {

        	if ( base.svg != null ) {
        		base.svg.empty();
        	}
        	base.visualization.empty();

        	switch ( base.options.format ) {

        		case "force-directed":
	         	if ( base.force != null ) {
	        		base.force.on( "tick", null );
	        	}
	        	base.force = null;
        		base.links = [];
	       		break;

        	}
        }

        base.draw = function() {

        	// select the current node by default
			if ( base.options.content == 'current' ) {
				if (( base.selectedNodes.length == 0 ) && !base.loadingDone ) {
					var node = scalarapi.model.getCurrentPageNode();
					if ( node != null ) {
						base.selectedNodes = [ node ];
					}
				}
			}

        	switch ( base.options.format ) {

        		case "grid":
        		base.drawGrid();
        		break;

        		case "tree":
        		base.drawTree();
        		break;

        		case "radial":
        		base.drawRadial();
        		break;

        		case "force-directed":
        		base.drawForceDirected();
        		break;

        	}

        };

        /**********************
         * GRID VISUALIZATION *
         **********************/
        base.drawGrid = function( updateOnly ) {

			var i, j, k, n, o, helpContent,
				colWidth = 36,
				boxSize = 36,
				currentNode = scalarapi.model.getCurrentPageNode();

			// if we're drawing from scratch, do some setup
			if ( !base.hasBeenDrawn && ( base.visElement.width() > 0 )) {

				base.hasBeenDrawn = true;

				if ( base.options.content != 'current' ) {
					helpContent = "This visualization shows <b>how content is interconnected</b> in this work.<ul>";
				} else {
					helpContent = "This visualization shows how <b>&ldquo;" + currentNode.getDisplayTitle() + "&rdquo;</b> is connected to other content in this work.<ul>";
				}

				helpContent += 	"<li>Each box represents a piece of content, color-coded by type.</li>" +
					"<li>The darker the box, the more connections it has to other content (relative to the other boxes).</li>" +
					"<li>Each line represents a connection, color-coded by type.</li>" + 
					"<li>You can roll over the boxes to browse connections, or click to add more content to the current selection.</li>" +
					"<li>Click the &ldquo;View&rdquo; button of any selected item to navigate to it.</li></ul>";

				base.helpButton.attr( "data-content", helpContent );

				base.visualization.removeClass( 'bounded' );

				//var fullWidth = Math.max( base.visElement.width(), (( base.maxNodesPerType + 1 ) * colWidth ) );

				var fullWidth = base.visElement.width();

				base.visualization.css('width', base.visElement.width() - 20); // accounts for padding

				base.svg = d3.select( base.visualization[ 0 ] ).append('svg:svg').attr('width', fullWidth);
					
				this.gridBoxLayer = base.svg.append('svg:g')
					.attr('width', fullWidth)
					.attr('height', fullHeight);	
					
				this.gridPathLayer = base.svg.append('svg:g')
					.attr('width', fullWidth)
					.attr('height', fullHeight);	
					
				this.gridLinkLayer = base.svg.append('svg:g')
					.attr('width', fullWidth)
					.attr('height', fullHeight);	

			}

			if ( base.svg != null ) {

				var itemsPerRow = Math.floor( base.svg.attr( 'width' ) / colWidth );

				var colScale = d3.scale.linear()
					.domain( [ 0, itemsPerRow ] )
					.range( [ 0, itemsPerRow * colWidth ] );

				var unitWidth = Math.max( colScale( 1 ) - colScale( 0 ), 36 );
							
				var rowCount = Math.ceil(base.sortedNodes.length / itemsPerRow);
				var visWidth = base.visElement.width();
				var visHeight = rowCount * 46;
				var rowScale = d3.scale.linear()
					.domain([0, rowCount])
					.range([0, visHeight]);
				var unitHeight = rowScale(1) - rowScale(0);
				var fullHeight = unitHeight * rowCount + 20;
				var maxNodeChars = unitWidth / 7;
				var node;
				
				base.svg.attr('height', fullHeight);

				var box = base.gridBoxLayer.selectAll( '.rowBox' );

				box = box.data( base.sortedNodes, function(d) { return d.type.id + '-' + d.slug; } );
					
				// draw squares
				var selection = box.enter().append('svg:rect')
					.each( function(d) { d.svgTarget = this; } )
					.attr('class', 'rowBox')
					.attr('x', function(d,i) { d.x = colScale(i % itemsPerRow) + 0.5; return d.x; })
					.attr('y', function(d,i) { d.y = rowScale(Math.floor(i / itemsPerRow)+1) - boxSize + 0.5; return d.y; })
					.attr('width', boxSize)
					.attr('height', boxSize)
					.attr('stroke', '#000')
					.style('cursor', 'pointer')
					.attr('stroke-opacity', '.2')
					.attr('fill-opacity', function(d) {
						return .1 + ((((d.outgoingRelations ? d.outgoingRelations.length : 0) + (d.incomingRelations ? d.incomingRelations.length : 0) + 1) / base.maxConnections) * .75);
					})
					.attr('fill', function(d) {
						return base.highlightColorScale(d.type.singular);
					})
					.on("click", function(d) { 
						var index = base.selectedNodes.indexOf(d);
						if (index == -1) {
							base.selectedNodes.push(d);
						} else {
							base.selectedNodes.splice(index, 1);
						}
						updateGraph();
						return true;
					});

				if ( !isMobile ) {
					selection
						.on("mouseover", function(d) { 
							console.log( 'mouseover' );
							base.rolloverNode = d;
							updateGraph();
						})
						.on("mouseout", function(d) { 
							console.log( 'mouseout' );
							base.rolloverNode = null; 
							updateGraph();
						});
				}

				var linkGroup, linkEnter, infoBoxes;

				var redrawGrid = function() {

					box.sort( base.typeSort )
						.attr('fill', function(d) { return (base.rolloverNode == d) ? d3.rgb(base.highlightColorScale(d.type.singular)).darker() : base.highlightColorScale(d.type.singular); })
						.attr('x', function(d,i) { d.x = colScale(i % itemsPerRow) + 0.5; return d.x; })
						.attr('y', function(d,i) { d.y = rowScale(Math.floor(i / itemsPerRow)+1) - boxSize + 0.5; return d.y; });

					base.gridPathLayer.selectAll( 'path' ).attr('d', line);
					base.gridPathLayer.selectAll('circle.pathDot')
						.attr('cx', function(d) {
							return d.x + (boxSize * .5);
						})
						.attr('cy', function(d) {
							return d.y + (boxSize * .5);
						});
					base.gridPathLayer.selectAll('text.pathDotText')
						.attr('dx', function(d) {
							return d.x + 3;
						})
						.attr('dy', function(d) {
							return d.y + boxSize - 3;
						});

					var visPos = base.visualization.position();

					d3.select( base.visualization[ 0 ] ).selectAll('div.info_box')
						.style('left', function(d) { return ( d.x + visPos.left + (boxSize * .5) ) + 'px'; })
						.style('top', function(d) { return ( d.y + visPos.top + boxSize + 5 ) + 'px'; });

					base.gridLinkLayer.selectAll('line.connection')
						.attr('x1', function(d) { return d.body.x + (boxSize * .5); })
						.attr('y1', function(d) { return d.body.y + (boxSize * .5); })
						.attr('x2', function(d) { return d.target.x + (boxSize * .5); })
						.attr('y2', function(d) { return d.target.y + (boxSize * .5); });						
					base.gridLinkLayer.selectAll('circle.connectionDot')
						.attr('cx', function(d) {
							return d.node.x + (boxSize * .5);
						})
						.attr('cy', function(d) {
							return d.node.y + (boxSize * .5);
						});
				}
				
				var updateGraph = function() {

					base.updateActiveNodes();
					
					box.attr('fill', function(d) { return (base.rolloverNode == d) ? d3.rgb(base.highlightColorScale(d.type.singular)).darker() : base.highlightColorScale(d.type.singular); });
						
					//}

					var infoBox = d3.select( base.visualization[ 0 ] ).selectAll('div.info_box');

					// turn on/off path lines
					base.gridPathLayer.selectAll('g.pathGroup')
						.attr('visibility', function(d) { 
							return ((base.activeNodes.indexOf(d[0]) != -1)) ? 'visible' : 'hidden'; 
						});

					infoBox = infoBox.data( base.activeNodes, function(d) { return d.slug; } );

					var visPos = base.visualization.position();
						
					infoBox.enter().append('div')
						.attr('class', 'info_box')
						.style('left', function(d) { return ( d.x + visPos.left + (boxSize * .5) ) + 'px'; })
						.style('top', function(d) { return ( d.y + visPos.top + boxSize + 5 ) + 'px'; });
						
					infoBox.style('left', function(d) { return ( d.x + visPos.left + (boxSize * .5) ) + 'px'; })
						.style('top', function(d) { return ( d.y + visPos.top + boxSize + 5 ) + 'px'; })
						.html(base.nodeInfoBox);
						
					infoBox.exit().remove();

					// connections
					linkGroup = base.gridLinkLayer.selectAll('g.linkGroup')
						.data(base.activeNodes);
					
					// create a container group for each node's connections
					linkEnter = linkGroup
						.enter().append('g')
						.attr('width', visWidth)
						.attr('height', base.svg.attr( 'height' ) )
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
								if (( relation.type.id == base.options.relations ) || ( base.options.relations == "all" )) {
									if ((relation.type.id != 'path') && ( base.sortedNodes.indexOf( relation.body ) != -1 ) && ( base.sortedNodes.indexOf( relation.target ) != -1 )) {
										relationArr.push(relations[i]);
									}
								}
							}
							return relationArr;
						})
						.enter().append('line')
						.attr('class', 'connection')
						.attr('x1', function(d) { return d.body.x + (boxSize * .5); })
						.attr('y1', function(d) { return d.body.y + (boxSize * .5); })
						.attr('x2', function(d) { return d.target.x + (boxSize * .5); })
						.attr('y2', function(d) { return d.target.y + (boxSize * .5); })
						.attr('stroke-width', 1)
						.attr('stroke-dasharray', '1,2')
						.attr('stroke', function(d) { return base.highlightColorScale((d.type.id == 'referee') ? 'media' : d.type.id ); });
							
					// draw connection dots
					linkEnter.selectAll('circle.connectionDot')
						.data(function (d) { 
							var nodeArr = [];
							var relations = d.outgoingRelations.concat(d.incomingRelations);
							var relation;
							var i;
							var n = relations.length;
							for (i=0; i<n; i++) {
								relation = relations[i];
								if (( relation.type.id == base.options.relations ) || ( base.options.relations == "all" )) {
									if ((relation.type.id != 'path') && ( base.sortedNodes.indexOf( relation.body ) != -1 ) && ( base.sortedNodes.indexOf( relation.target ) != -1 )) {
										nodeArr.push({role:'body', node:relation.body, type:relation.type});
										nodeArr.push({role:'target', node:relation.target, type:relation.type});
									}
								}
							}
							return nodeArr;
						})
						.enter().append('circle')
						.attr('fill', function(d) { return base.highlightColorScale((d.type.id == 'referee') ? 'media' : d.type.id); })
						.attr('class', 'connectionDot')
						.attr('cx', function(d) {
							return d.node.x + (boxSize * .5);
						})
						.attr('cy', function(d) {
							return d.node.y + (boxSize * .5);
						})
						.attr('r', function(d,i) { return (d.role == 'body') ? 5 : 3; });
									
				}

				if ((( base.options.content == "path" ) || ( base.options.content == "all" )) && (( base.options.relations == "path" ) || ( base.options.relations == "all" ))) {

					// path vis line function
					var line = d3.svg.line()
						.x(function(d) {
							return d.x + (boxSize * .5);
						})
						.y(function(d) {
							return d.y + (boxSize * .5);
						})
						.interpolate('cardinal');
					
					typedNodes = scalarapi.model.getNodesWithProperty('dominantScalarType', 'path', 'alphabetical');
					
					// build array of path contents
					n = typedNodes.length;
					var pathRelations;
					var allPathContents = [];
					var pathContents;
					for (i=0; i<n; i++) {
						node = typedNodes[ i ];
						pathContents = node.getRelatedNodes( 'path', 'outgoing' );
						pathContents.unshift( node );
						allPathContents.push(pathContents);
					}
					
					var pathGroups = base.gridPathLayer.selectAll('g.pathGroup')
						.data( allPathContents, function( d ) { return d[ 0 ].slug; } );
						
					// create a container group for each path vis
					var groupEnter = pathGroups.enter().append('g')
						.attr('width', visWidth)
						.attr('height', base.svg.attr( 'height' ) )
						.attr('class', 'pathGroup')
						.attr('visibility', 'hidden')
						.attr('pointer-events', 'none');
						
					// add the path to the group
					groupEnter.append('path')
						.attr('class', 'pathLink')
						.attr('stroke', function(d) {
							return base.highlightColorScale( "path", "verb" ); 
						})
						.attr('stroke-dasharray', '5,2')
						.attr('d', line);

					// add the path's dots to the group
					groupEnter.selectAll('circle.pathDot')
						.data(function(d) { return d; })
						.enter().append('circle')
						.attr('fill', function(d) { 
							return base.highlightColorScale( "path", "verb" );
						})
						.attr('class', 'pathDot')
						.attr('cx', function(d) {
							return d.x + (boxSize * .5);
						})
						.attr('cy', function(d) {
							return d.y + (boxSize * .5);
						})
						.attr('r', function(d,i) { return (i == 0) ? 5 : 3; });
					
					// add the step numbers to the group
					groupEnter.selectAll('text.pathDotText')
						.data(function(d) { return d; })
						.enter().append('text')
						.attr('fill', function(d) { 
							return base.highlightColorScale( "path", "verb" );
						})
						.attr('class', 'pathDotText')
						.attr('dx', function(d) {
							return d.x + 3;
						})
						.attr('dy', function(d) {
							return d.y + boxSize - 3;
						})
						.text(function(d,i) { return (i == 0) ? '' : i; });

				}
					
				redrawGrid();
				updateGraph();
			}   	
        }

        /**********************
         * TREE VISUALIZATION *
         **********************/
        base.drawTree = function( updateOnly ) {
			
			var i, j, k, n, o, columnWidth, fullHeight, fullWidth,
				currentNode = scalarapi.model.getCurrentPageNode();

			fullWidth = base.visElement.width();
			if ( window.innerWidth > 768 ) {
				if ( base.options.modal ) {
					fullHeight = Math.max( 300, window.innerHeight * .9 - 200 );
				} else {
					fullHeight = 568;
				}
			} else {
				fullHeight = 300;
			}

			// if we're drawing from scratch, do some setup
			if ( !base.hasBeenDrawn && ( base.visElement.width() > 0 )) {

				base.hasBeenDrawn = true;

				if ( base.options.content != 'current' ) {
					helpContent = "This visualization shows <b>how content is interconnected</b> in this work.<ul>";
				} else {
					helpContent = "This visualization shows how <b>&ldquo;" + currentNode.getDisplayTitle() + "&rdquo;</b> is connected to other content in this work.<ul>";
				}

				helpContent += 	"<li>Each circle represents a piece of content, color-coded by type.</li>" +
					"<li>Scroll or pinch to zoom, or click and hold to drag.</li>" +
					"<li>Click any filled circle to reveal its connections; click again to hide them.</li>" + 
					"<li>Click the name of any item to navigate to it.</li></ul>";

				base.helpButton.attr( "data-content", helpContent );

				base.visualization.addClass( 'bounded' );

				base.visualization.css( 'height', fullHeight + 'px' );
				base.visualization.css( 'width', fullWidth + 'px' );	


				// create visualization base element
				base.svg = d3.select( base.visualization[ 0 ] ).append('svg:svg')
					.attr('width', fullWidth - 2)
					.attr('height', fullHeight - 2);

				var container = base.svg.append( "g" ).attr( 'class', 'container' );
			
				var zoom = d3.behavior.zoom().scaleExtent([ .25, 7 ])
				zoom.on("zoom", function() {
					container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
				});

				base.svg.call( zoom );
				base.svg.style( "cursor", "move" );
			
				base.tree = d3.layout.tree().nodeSize([ 30, fullHeight ])
				    /*.size([fullHeight, fullWidth])*/;

				base.diagonal = d3.svg.diagonal()
				    .projection(function(d) { return [d.y, d.x]; });

			}

			if (( base.svg != null ) && ( base.hierarchy != null )) {

				if ( window.innerWidth > 768 ) {
					columnWidth = 180;
				} else {
					columnWidth = 90;
				}

				var container = base.svg.selectAll( 'g.container' );

				// Toggle children.
				function branchToggle(d) {
					if (d.children) {
						d._children = d.children;
						d.children = null;
					} else {
						d.children = d._children;
						d._children = null;
					}
				}  

				function branchToggleAll(d) {
				    if (d.children) {
				      	d.children.forEach(branchToggleAll);
				      	branchToggle(d);
				    }
				}

				// collapse all nodes except the root's children
				if ( base.options.content != "all" ) {
					if ( base.hierarchy.children ) {
						base.hierarchy.children.forEach( function( d ) {
							if ( d.children != null ) {
								d.children.forEach( branchToggleAll );
							}
						});
					}

				// collapse all nodes except the root
				} else {
					base.hierarchy.children.forEach( branchToggleAll );
				}

				function pathUpdate( source, instantaneous ) {

					var duration = instantaneous ? 0 : d3.event && d3.event.altKey ? 5000 : 500;

					// Compute the new tree layout.
					var nodes = base.tree.nodes(base.hierarchy).reverse();

					//base.hierarchy.x0 = fullHeight * .5;
					//base.hierarchy.y0 = 0;

					// Normalize for fixed-depth.
					nodes.forEach( function(d) { 
						d.x += ( fullHeight * .5 );
						d.y = ( d.depth + 1 ) * columnWidth; 
					} );

					// Update the nodes…
					var treevis_node = container.selectAll("g.node")
						.data(nodes, function(d) { 
							var self = ( d.node == null ) ? d.title : d.node.slug;
							var parent = ( d.parent == null ) ? 'none' : ( d.parent.node == null ) ? d.parent.title : d.parent.node.title;
							return self + '-' + parent + '-' + d.depth; 
						});

					// Enter any new nodes at the parent's previous position.
					var nodeEnter = treevis_node.enter().append("svg:g")
						.attr("class", "node")
						.attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; });

					nodeEnter.append("svg:circle")
						.attr("r", 1e-6)
						.style("fill", function(d) { return d._children ? d3.hsl( base.highlightColorScale( d.type, "noun", '#777' ) ).brighter( 1.5 ) : "#fff"; })
						.style( "stroke", function(d) { return base.highlightColorScale( d.type, "noun", '#777' ) })  
					.on('touchstart', function(d) { d3.event.stopPropagation(); })
					.on('mousedown', function(d) { d3.event.stopPropagation(); })
					.on("click", function(d) { 
						if (d3.event.defaultPrevented) return; // ignore drag
						branchToggle(d); 
						pathUpdate(d); 
					});

					nodeEnter.append("svg:text")
						.attr("x", function(d) { return d.children || d._children ? -14 : 14; })
						.attr("dy", ".35em")
						.attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
						.text(function(d) { return d.shortTitle; })
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
					var nodeUpdate = treevis_node.transition()
						.duration(duration)
						.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

					nodeUpdate.select("circle")
						.attr("r", 8)
						.style("fill", function(d) { return d._children ? d3.hsl( base.highlightColorScale( d.type, "noun", '#777' ) ).brighter( 1.5 ) : "#fff"; });

					nodeUpdate.select("text")
						.style("fill-opacity", 1);

					// Transition exiting nodes to the parent's new position.
					var nodeExit = treevis_node.exit().transition()
						.duration(duration)
						.attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
						.remove();

					nodeExit.select("circle")
						.attr("r", 1e-6);

					nodeExit.select("text")
						.style("fill-opacity", 1e-6);

					// Update the links…
					var treevis_link = container.selectAll("path.clusterlink")
						.data(base.tree.links(nodes), function(d) { 
							var source = ( d.source.node == null ) ? d.source.title : d.source.node.slug;
							var target = ( d.target.node == null ) ? d.target.title : d.target.node.slug;
							return source + '-' + target + '-' + d.source.depth; 
						});

					// Enter any new links at the parent's previous position.
					treevis_link.enter().insert("svg:path", "g")
						.attr("class", "clusterlink")
						.attr("d", function(d) {
						var o = {x: source.x0, y: source.y0};
							return base.diagonal({source: o, target: o});
						})
					.transition()
						.duration(duration)
						.attr("d", base.diagonal);

					// Transition links to their new position.
					treevis_link.transition()
						.duration(duration)
						.attr("d", base.diagonal);

					// Transition exiting nodes to the parent's new position.
					treevis_link.exit().transition()
						.duration(duration)
						.attr("d", function(d) {
							var o = {x: source.x, y: source.y};
							return base.diagonal({source: o, target: o});
						})
						.remove();

					// Stash the old positions for transition.
					nodes.forEach(function(d) {
						d.x0 = d.x;
						d.y0 = d.y;
					});
				}

				pathUpdate( base.hierarchy, true );

			}
				      	
        }

        /************************
         * RADIAL VISUALIZATION *
         ************************/
        base.drawRadial = function( updateOnly ) {

			var vis, rollover, fullWidth, fullHeight,
				currentNode = scalarapi.model.getCurrentPageNode(),
				minChordAngle = .02,
				maximizedNode = null,
				highlightedNode = null;

			base.visualization.empty();

			//if ( !base.hasBeenDrawn && ( base.visElement.width() > 0 )) {
				
				fullWidth = base.visElement.width();
				if ( window.innerWidth > 768 ) {
					if ( base.options.modal ) {
						fullHeight = Math.max( 300, window.innerHeight * .9 - 200 );
					} else {
						fullHeight = 568;
					}
				} else {
					fullHeight = 300;
				}
				base.visualization.css( 'min-height', fullHeight + 'px' );

				if (( base.options.content == 'all' ) || ( base.options.content == 'current' )) {
					helpContent = "This visualization shows how <b>&ldquo;" + currentNode.getDisplayTitle() + "&rdquo;</b> is connected to other content in this work.<ul>";
				} else {
					helpContent = "This visualization shows <b>how content is interconnected</b> in this work.<ul>";
				}

				helpContent += 	"<li>Each inner arc represents a connection, color-coded by type.</li>" +
					"<li>Roll over the visualization to browse connections.</li>" +
					"<li>Click to add more content to the current selection.</li>" + 
					"<li>To explore a group of connections in more detail, click its outer arc to expand the contents.</li>" + 
					"<li>Click the name of any item to navigate to it.</li></ul>";

				base.helpButton.attr( "data-content", helpContent );

				base.visualization.removeClass( 'bounded' );

				// rollover label
				rollover = $('<div class="rollover caption_font">Test</div>').appendTo( base.visualization );
				base.visualization.mousemove(function(e) {
					rollover.css('left', (e.pageX-$(this).offset().left+parseInt($(this).parent().parent().css('padding-left'))+10)+'px');
					rollover.css('top', (e.pageY-$(this).parent().parent().offset().top)+15+'px');
				})
					
				// create visualization base element
				base.svg = d3.select( base.visualization[ 0 ] ).append('svg:svg')
					.attr('width', fullWidth)
					.attr('height', fullHeight);
					
				vis = base.svg.append("g")
	     			.attr("transform", "translate(" + fullWidth / 2 + "," + fullHeight / 2 + ")")
	     			.attr( "class", "radialvis" );
					
				// create canvas
				var canvas = vis.append('svg:rect')
					.attr('width', fullWidth)
					.attr('height', fullHeight)
					.attr('class', 'viscanvas');
					
				this.radialBaseLayer = base.svg.append('svg:g')
					.attr('width', fullWidth)
					.attr('height', fullHeight);

				base.hasBeenDrawn = true;

			/*} else if ( base.svg != null ) {
				vis = base.svg.selectAll( "g.radialvis" );
				rollover = $( ".rollover" );
				fullWidth = base.svg.attr( "width" );
				fullHeight = base.svg.attr( "height" );
			}*/

			if ( base.svg != null ) {
							
				var myModPercentage = 1;		// relative value of the farthest descendants maximized item
				var otherModPercentage = 1;		// relative value of the farthest descendants of the not-maximized item

				var r = ( Math.min(fullWidth, fullHeight) - 70 ) * .5;
				if ( fullWidth < fullHeight ) {
					r -= 120;
				} else {
					r -= 60;
				}
				var radiusMod = 1.55;
				var textRadiusOffset = 10;
					
				//var numChildren = nodeForCurrentContent.descendantCount;
				//var arcOffset = (( numChildren / nodes.length ) * ( Math.PI * 2 )) * -.5;
				var arcOffset = 0;
				
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
								if (base.hasHierarchyNodeAsAncestor(d, maximizedNode)) {
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
				/*var path = vis.data([types]).selectAll('path')
					.data(partition.nodes);*/

				vis = vis.data( [ base.hierarchy ] );

				var path = vis.selectAll( 'path' );

				path = path.data( partition.nodes );
					
				path.enter().append('svg:path')
					.attr('class', 'ring')
					.attr('d', arcs)
					.style("stroke-width", function(d) { return (d.dx > minChordAngle) ? 1 : 0; })
					.style("stroke", 'white')
					.attr('cursor', 'pointer')
					.attr("display", function(d) { return d.depth ? null : "none"; })
					.style('fill', function(d, i) { return base.neutralColor; } )
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
					
						//if ( d != nodeForCurrentContent ) {
						
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
								
									var numChildren = d.descendantCount;
									var curPercentage = numChildren / base.sortedNodes.length;
									var targetPercentage = Math.min(.75, (numChildren * 15) / 360);

									if ( targetPercentage > curPercentage ) {
							
										maximizedNode = d;
										
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

							    	}
								    	
								} else {
									toggleNodeSelected(d);
								}
							}
						//}
					});
					
				path.exit().remove();
				
				
				/**
				 * Selects the given node data.
				 */
				function toggleNodeSelected(d) {
					var index;
					index = base.selectedNodes.indexOf(d.node);
					if (index == -1) {
						base.selectedNodes.push(d.node);
						index = base.selectedHierarchyNodes.indexOf(d);
						if (index == -1) {
							base.selectedHierarchyNodes.push(d);
						}
					} else {
						base.selectedNodes.splice(index, 1);
						index = base.selectedHierarchyNodes.indexOf(d);
						if (index != -1) {
							base.selectedHierarchyNodes.splice(index, 1);
						}
					}
					updateSelectedLabels();
					updateHighlights(d);
				}
				
				/**
				 * Updates the display of labels for selected nodes.
				 */
				function updateSelectedLabels() {
				
				    var selectedLabels = vis.selectAll('text.selectedLabel').data(base.selectedHierarchyNodes);
				    
				    selectedLabels.enter().append('svg:text')
				    	.attr('class', 'selectedLabel')
				    	.attr('dx', function(d) {
				    	if (arcs.centroid(d)[0] < 0) {
				    			return -(fullWidth * .5) + 90;
				    		} else {
				    			return (fullWidth * .5) - 90;
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
				    			return -(fullWidth * .5) + 90;
				    		} else {
				    			return (fullWidth * .5) - 90;
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
				    	
				    var selectedPointers = vis.selectAll('polyline.selectedPointer').data(base.selectedHierarchyNodes);
				    
				    selectedPointers.enter().append('svg:polyline')
				    	.attr('class', 'selectedPointer')
				    	.attr('points', function(d) {
				    		var dx = arcs.centroid(d)[0];
				    		var dy = arcs.centroid(d)[1];
				    		var hw = fullWidth * .5;
				    		if (arcs.centroid(d)[0] < 0) {
				    			return (95-hw)+','+dy+' '+(105-hw)+','+dy+' '+dx+','+dy;
				    		} else {
				    			return (hw-95)+','+dy+' '+(hw-105)+','+dy+' '+dx+','+dy;
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
				    			return (95-hw)+','+dy+' '+(105-hw)+','+dy+' '+dx+','+dy;
				    		} else {
				    			return (hw-95)+','+dy+' '+(hw-105)+','+dy+' '+dx+','+dy;
				    		}
				    	});

				}
				
				/**
				 * Update the highlight elements.
				 */
				function updateHighlights(d) {
				
					// show the rollover label if this item has no children, i.e. is a single content item, not a parent
					if (highlightedNode && d.showsTitle) {
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
						
							var color = base.neutralColor,
								okToHighlight = true;
								
							// if the item isn't the root, then
							if ( d.parent != null ) {	
							
								// if it's representing the current content, then make it white
								if ( d.type == "current" ) {
									if (( d.children == null ) || ( !base.options.local && ( d.children == null ))) {
										color = "#000000";
									} else {
										color = "#ffffff";
									}
									
								// if the mouse is over the arc and it's not representing an individual item, then color it by noun
								} else if (( d == highlightedNode ) /*&& ( d.children != null )*/) {
								
									if ( d.children != null ) {
										color = base.highlightColorScale( d.type, "noun" ); 
									} else {
										color = base.neutralColor;
									}
									
									// if we got an actual color, then don't darken it when highlighted
									if ( color != base.neutralColor ) {
										okToHighlight = false;							
									}
								}
							}
							return (
								((d == highlightedNode) || 
								(base.hasHierarchyNodeAsAncestor(d, highlightedNode)) || 
								((base.selectedNodes.indexOf(d.node) != -1) /*&& (d == nodeForCurrentContent)*/)) && 
								okToHighlight ) 
							? d3.rgb(color).darker() 
							: color;
						})
						
					// darken the chords connected to the rolled-over node
					vis.selectAll('path.chord')
						.attr('opacity', function(d) {
						
							// chord is connected to a selected node
							if (
								(base.selectedNodes.indexOf(d.source.node) != -1) || 
								(base.selectedNodes.indexOf(d.target.node) != -1)
							)  {
								return .9;
								
							// chord is connected to a rolled over node
							} else if (
								(
									(d.source == highlightedNode) || 
									(d.target == highlightedNode) || 
									base.hasHierarchyNodeAsAncestor(d.source, highlightedNode)
								) || (
									base.hasHierarchyNodeAsAncestor(d.target, highlightedNode)
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
								base.hasHierarchyNodeAsAncestor(d.source, highlightedNode) ||
								base.hasHierarchyNodeAsAncestor(d.target, highlightedNode) || 
								(base.selectedNodes.indexOf(d.source.node) != -1) || 
								(base.selectedNodes.indexOf(d.target.node) != -1)
							) 
							? base.highlightColorScale( d.type, "verb" ) 
							: base.neutralColor;
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
				/*n = nodes.length;
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
							console.log( j + ' ' + srcNode + ' ' + destNode + ' ' + parent.type );
						}
					//}
					
				}*/

				var link;
				n = base.links.length;
				for ( i = 0; i < n; i++ ) {
					link = base.links[ i ];
					links.push( {
						source: base.nodesBySlug[ link.source.slug ],
						target: base.nodesBySlug[ link.target.slug ],
						type: link.type.id
					})
				}
				
				// chord generator
				var chords = d3.svg.chord()
	    			.startAngle(function(d) { return d.x - (Math.PI * .5) + arcOffset; })
	     			.endAngle(function(d) { return d.x + d.dx - (Math.PI * .5) + arcOffset; })
					.radius(function(d) { return (r * radiusMod) - Math.sqrt(d.y + d.dy); });
				
				// create the chords
				var chordvis = vis.selectAll('path.chord').data( links );
				
				chordvis.enter().append('svg:path')
					.attr('class', 'chord')
					.attr('d', function(d) { return chords(d); })
					.attr('opacity', .25)
					.attr('display', function(d) { return ((d.source.dx > minChordAngle) || (d.target.dx > minChordAngle)) ? null : 'none'; })
					.attr('fill', function(d) { return base.highlightColorScale(d.type.id); })
					.each(stashChord);
					
				chordvis.exit().remove();

				if ( base.hierarchy.children != null ) {
				
					// create the type labels		    
				    var labels = vis.selectAll('text.typeLabel').data(base.hierarchy.children);
				    
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
			}
				
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

        /********************************
         * FORCE-DIRECTED VISUALIZATION *
         ********************************/
        base.drawForceDirected = function( updateOnly ) {
			
			var i, j, n, o, node, targetNode, fullWidth, fullHeight,
				currentNode = scalarapi.model.getCurrentPageNode();
			
			// if we're drawing from scratch, do some setup
			if ( !base.hasBeenDrawn && ( base.visElement.width() > 0 )) {

        		base.hasBeenDrawn = true;

				if ( base.options.content != 'current' ) {
					helpContent = "This visualization shows <b>how content is interconnected</b> in this work.<ul>";
				} else {
					helpContent = "This visualization shows how <b>&ldquo;" + currentNode.getDisplayTitle() + "&rdquo;</b> is connected to other content in this work.<ul>";
				}

				helpContent += 	"<li>Each dot represents a piece of content, color-coded by type.</li>" +
					"<li>Scroll or pinch to zoom, or click and hold to drag.</li>" +
					"<li>Click any item to add it to the current selection, and to reveal the content it's related to in turn.</li>" + 
					"<li>Click the &ldquo;View&rdquo; button of any selected item to navigate to it.</li></ul>";

				base.helpButton.attr( "data-content", helpContent );

				fullWidth = base.visElement.width();
				if ( window.innerWidth > 768 ) {
					if ( base.options.modal ) {
						fullHeight = Math.max( 300, window.innerHeight * .9 - 200 );
					} else {
						fullHeight = 568;
					}
				} else {
					fullHeight = 300;
				}

				base.visualization.addClass( 'bounded' );

				base.visualization.css( 'height', fullHeight + 'px' );
				base.visualization.css( 'width', fullWidth + 'px' );		
			
				base.visualization.css('padding', '0px');
				
				base.svg = d3.select( base.visualization[ 0 ] ).append('svg:svg')
					.attr('width', fullWidth)
					.attr('height', fullHeight);

				var container = base.svg.append( 'g' ).attr( 'class', 'container' );
					
				var zoom = d3.behavior.zoom().center([ fullWidth * .5, fullHeight * .5 ]).scaleExtent([ .25, 7 ]);
				zoom.on("zoom", function() {
					container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");					
				});
				
				base.svg.call(zoom);
				base.svg.style("cursor","move");

				base.force = d3.layout.force()
					.nodes( base.sortedNodes )
					.links( base.links )
					.linkDistance(120)
					.charge(-400)
					.size([fullWidth, fullHeight])
					.on('tick', function() {
						
						//console.log( '-----' );

						if ( base.svg != null ) {

							base.svg.selectAll('line.link')
								.attr('x1', function(d) { return d.source.x; })
								.attr('y1', function(d) { return d.source.y; })
								.attr('x2', function(d) { return d.target.x; })
								.attr('y2', function(d) { return d.target.y; });
								
							base.svg.selectAll('circle.node')
								.attr('cx', function(d) { /*if ( isNaN(d.x) ) console.log( 'bad: ' + d.title );*/ return d.x; })
								.attr('cy', function(d) { return d.y; });
								
							base.svg.selectAll('text.label')
								.attr('x', function(d) { return d.x; })
								.attr('y', function(d) { return d.y + 28; });
								
							base.svg.selectAll('rect.visit-button')
								.attr('x', function(d) { return d.x - 24; })
								.attr('y', function(d) { return d.y + 38; });
								
							base.svg.selectAll('text.visit-button')
								.attr('x', function(d) { return d.x; })
								.attr('y', function(d) { return d.y + 53; });

						}
						
					});
			}

			if ( base.svg != null ) {

				base.force.nodes( base.sortedNodes ).links( base.links );

				var container = base.svg.selectAll( 'g.container' );
				var node = container.selectAll('g.node');
				var link = container.selectAll('.link');

				link = link.data( base.force.links(), function(d) { return d.source.slug + '-' + d.target.slug; } );
					
				link.enter().insert('svg:line', '.node')
					.attr('class', 'link');
					
				link.exit().remove();
					
				node = node.data( base.force.nodes(), function(d) { return d.slug; } );

				var nodeEnter = node.enter().append('svg:g')
					.attr('class', 'node')
					.call(base.force.drag)
					.on('touchstart', function(d) { d3.event.stopPropagation(); })
					.on('mousedown', function(d) { d3.event.stopPropagation(); })
					.on('click', function(d) {
						if (d3.event.defaultPrevented) return; // ignore drag
						d3.event.stopPropagation();
						var index = base.selectedNodes.indexOf(d);
						if (index == -1) {
							base.selectedNodes.push(d);
							if ( base.options.content == "current" ) {
								base.loadNode( d.slug, false );
							}
						} else {
							base.selectedNodes.splice(index, 1);
							base.filter();
							base.draw();
						}
						updateGraph();
					})
					.on("mouseover", function(d) { 
						base.rolloverNode = d;
						updateGraph();
					})
					.on("mouseout", function() { 
						base.rolloverNode = null;
						updateGraph();
					});

				node.append('svg:circle')
					.attr('class', 'node')
					.attr('r', '16');
					
				// create the text labels
				nodeEnter.append('svg:text')
					.attr('class', 'label')
					.attr('x', function(d) { return d.x; })
					.attr('y', function(d) { return d.y + 21; })
					.attr('text-anchor', 'middle')				
					.text(function(d) { 
						return ((base.rolloverNode == d) || (base.selectedNodes.indexOf(d) != -1)) ? d.title : d.shortTitle; 
					});

				nodeEnter.append('svg:rect')
					.attr( 'class', 'visit-button' )
					.attr( 'rx', '5' )
					.attr( 'ry', '5' )
					.attr( 'width', '48' )
					.attr( 'height', '22' )
					.style( 'display', 'none' )
					.on( 'click', function(d) { 
						d3.event.stopPropagation();
						if ( self.location != d.url ) {
							return self.location = d.url;
						}
					});

				nodeEnter.append('svg:text')
					.attr( 'class', 'visit-button' )
					.attr( 'text-anchor', 'middle')		
					.style( 'display', 'none' )		
					.text( 'View »' );

				node.exit().remove();

				base.force.start();
				
				var updateGraph = function() {
						
					link.attr('stroke-width', function(d) { return ((base.rolloverNode == d.source) || (base.selectedNodes.indexOf(d.source) != -1) || (base.rolloverNode == d.target) || (base.selectedNodes.indexOf(d.target) != -1)) ? "3" : "1"; })
						.attr('stroke-opacity', function(d) { return ((base.rolloverNode== d.source) || (base.selectedNodes.indexOf(d.source) != -1) || (base.rolloverNode == d.target) || (base.selectedNodes.indexOf(d.target) != -1)) ? '1.0' : '0.5'; })
						.attr('stroke', function(d) { return ((base.rolloverNode == d.source) || (base.selectedNodes.indexOf(d.source) != -1) || (base.rolloverNode == d.target) || (base.selectedNodes.indexOf(d.target) != -1)) ? base.neutralColor : '#999'; });
						
					node.selectAll( '.node' ).attr('fill', function(d) {
							var interpolator = d3.interpolateRgb(base.highlightColorScale(d.type.id), d3.rgb(255,255,255));
							return ((base.rolloverNode == d) || (base.selectedNodes.indexOf(d) != -1)) ? interpolator(0) : interpolator(.5);
						 });
				
					node.selectAll('.label')
						.attr('fill', function(d) { return ((base.rolloverNode == d) || (base.selectedNodes.indexOf(d) != -1)) ? "#000" :"#999"; })
						.attr('font-weight', function(d) { return ((base.rolloverNode == d) || (base.selectedNodes.indexOf(d) != -1)) ? 'bold' : 'normal'; })
						.text(function(d) { 
							return ((base.rolloverNode == d) || (base.selectedNodes.indexOf(d) != -1)) ? d.title : d.shortTitle; 
						});
				
					node.selectAll('rect.visit-button')
						.style( 'display', function(d) { 
							return (base.selectedNodes.indexOf(d) != -1) ? 'inherit' : 'none'; 
						});
				
					node.selectAll('text.visit-button')
						.style( 'display', function(d) { 
							return (base.selectedNodes.indexOf(d) != -1) ? 'inherit' : 'none'; 
						});
				
				}
				
				updateGraph();

			}
       	
        }
        
        // Run initializer
        base.init();

    };
    
    $.scalarvis.defaultOptions = {
    	content: 'all',
    	relations: 'all',
    	format: 'grid', 
        modal: false
    };
    
    $.fn.scalarvis = function( options ){
        return this.each( function(){
            ( new $.scalarvis( this, options ) );
        });
    };
    
})(jQuery);