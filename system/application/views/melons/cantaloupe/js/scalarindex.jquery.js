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

	var pluginName = "scalarindex",
		defaults = {
			root_url: ''
		};
	
	/**
	 * Manages the index dialog.
	 */
	function ScalarIndex( element, options ) {
	
		this.element = $(element);
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		
		this.DisplayMode = {
			Path: 'Path',
			Page: 'Page',
			Media: 'Media',
			Tag: 'Tag',
			Annotation: 'Annotation',
			Comment: 'Reply'
		}
		
		this.init();
		
	}
	
	ScalarIndex.prototype.bodyContent = null;			// body content container
	ScalarIndex.prototype.currentMode = null;			// Current display mode
	ScalarIndex.prototype.currentPage = null;			// Current page of results being displayed
	ScalarIndex.prototype.resultsTable = null;			// Table for the results
	ScalarIndex.prototype.pagination = null;			// Pagination interface
	ScalarIndex.prototype.resultsPerPage = null;		// Results to show per page
	ScalarIndex.prototype.controlBar = null;			// Index controls
	ScalarIndex.prototype.firstRun = null;				// First time the plug-in has run?
	
	ScalarIndex.prototype.init = function () {
	
		var me = this;
	
		this.currentPage = 1;
		this.resultsPerPage = 10;
		this.firstRun = true;
	
		this.element.addClass('dialog index');
		
		var header = $('<div class="dialog_header heading_font"></div>').appendTo(this.element);
		header.append('<h2 class="heading_font">Index</h2>');
		var buttons = $('<div class="right"></div>').appendTo(header);
		addIconBtn(buttons, 'close_icon.png', 'close_icon_hover.png', 'Close');
		buttons.find('[title="Close"]').click( function() { me.hideIndex(); } );
		
		this.controlBar = $('<div class="control_bar"></div>').appendTo(header);
		var pathBtn = $('<span id="pathBtn" class="toggle_btn on caption_font">Paths</span>').appendTo(this.controlBar);
		var pageBtn = $('<span id="pageBtn" class="toggle_btn caption_font">Pages</span>').appendTo(this.controlBar);
		var mediaBtn = $('<span id="mediaBtn" class="toggle_btn caption_font">Media</span>').appendTo(this.controlBar);
		var tagBtn = $('<span id="tagBtn" class="toggle_btn caption_font">Tags</span>').appendTo(this.controlBar);
		var annotationBtn = $('<span id="annotationBtn" class="toggle_btn caption_font">Annotations</span>').appendTo(this.controlBar);
		var commentBtn = $('<span id="replyBtn" class="toggle_btn caption_font">Comments</span>').appendTo(this.controlBar);
		
		pathBtn.click(function () { me.setDisplayMode( me.DisplayMode.Path ); });
		pageBtn.click(function () { me.setDisplayMode( me.DisplayMode.Page ); });
		mediaBtn.click(function () { me.setDisplayMode( me.DisplayMode.Media ); });
		tagBtn.click(function () { me.setDisplayMode( me.DisplayMode.Tag ); });
		annotationBtn.click(function () { me.setDisplayMode( me.DisplayMode.Annotation ); });
		commentBtn.click(function () { me.setDisplayMode( me.DisplayMode.Comment ); });
		
		this.bodyContent = $('<div class="body_copy"></div>').appendTo(this.element);
		var resultsDiv = $( '<div class="results_list caption_font"></div>' ).appendTo( this.bodyContent );
		this.resultsTable = $( '<table></table>' ).appendTo( resultsDiv );
		
		this.pagination = $( '<div class="pagination caption_font">Page '+this.currentPage+'</div>' ).appendTo( this.bodyContent );
		
	}
	
	ScalarIndex.prototype.showIndex = function() {
		this.element.show();
		if ( this.firstRun ) {
			this.setDisplayMode(this.DisplayMode.Path);
			this.firstRun = false;
		}
		setState( ViewState.Modal );
	}
	
	ScalarIndex.prototype.hideIndex = function() {
		this.element.hide();
		restoreState();
	}
	
	ScalarIndex.prototype.setDisplayMode = function( mode ) {
	
		var me = this;
	
		if ( this.currentMode != mode ) {
			this.currentMode = mode;
			this.currentPage = 1;
			mode = mode.toLowerCase();
			this.controlBar.find('.toggle_btn').removeClass('on');
			$('#'+mode+'Btn').addClass('on');
			me.getResults();
		}
		
	}
	
	ScalarIndex.prototype.getResults = function() {
		var me = this;
		scalarapi.loadNodesByType( 
			this.currentMode.toLowerCase(), true, 
			function( data ) { me.handleResults( data ); }, 
			null, 0, false, null, ( me.currentPage - 1 ) * me.resultsPerPage, me.resultsPerPage 
		);
	}
	
	ScalarIndex.prototype.handleResults = function( data ) {
		
		var i, node, description, row, prev, next,
			nodes = [],
			me = this;
		
		for ( i in data ) {
			node = scalarapi.getNode( i );
			if ( node !== undefined ) {
				nodes.push( node );
			}
		}
		
		this.resultsTable.empty();
		
		for ( i in nodes ) {
			node = nodes[i];
			description = node.current.description;
			if (description == null) {
				description = '(No description)';
			} else {
				description = description.replace(/<\/?[^>]+>/gi, '');
			}
			row = $( '<tr><td style="width:30%">'+node.getDisplayTitle()+'</td><td>'+description+'</td></tr>' ).appendTo( this.resultsTable );
			row.data( 'node', node );
			row.click( function() { document.location = addTemplateToURL($(this).data('node').url, 'cantaloupe'); } );
		}
		
		if ( nodes.length == 0 ) {
			row = $( '<tr><td style="width:30%">No results found.</td><td></td></tr>' ).appendTo( this.resultsTable );
		}
		
		this.pagination.empty();
		if (( nodes.length == this.resultsPerPage ) || ( this.currentPage > 1 )) {
			if ( this.currentPage > 1 ) {
				prev = $('<span><a href="javascript:;">&laquo; Prev</a>&nbsp;&nbsp;&nbsp;</span>').appendTo( this.pagination );
				prev.find('a').click( function() { me.previousPage(); } );
			} else {
				prev = $('<span class="disabled">&laquo; Prev&nbsp;&nbsp;&nbsp;</span>').appendTo( this.pagination );
			}
			this.pagination.append( '<strong>Page ' + this.currentPage + '</strong>' );
			if ( nodes.length == this.resultsPerPage ) {
				next = $( '<span>&nbsp;&nbsp;&nbsp;<a href="javascript:;">Next &raquo;</a></span>' ).appendTo( this.pagination );
				next.find('a').click( function() { me.nextPage(); } );
			} else {
				next = $( '<span class="disabled">&nbsp;&nbsp;&nbsp;Next &raquo;</span>' ).appendTo( this.pagination );
			}
		}
		
	}
	
	ScalarIndex.prototype.previousPage = function() {
		if ( this.currentPage > 1) {
			this.currentPage--;
			this.getResults();
		}
	}
	
	ScalarIndex.prototype.nextPage = function() {
		this.currentPage++;
		this.getResults();
	}
			
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if ( !$.data(this, "plugin_" + pluginName )) {
                $.data( this, "plugin_" + pluginName,
                new ScalarIndex( this, options ));
            }
        });
    }

})( jQuery, window, document );