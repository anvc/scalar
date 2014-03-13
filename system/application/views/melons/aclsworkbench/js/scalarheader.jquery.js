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

	var pluginName = "scalarheader",
		defaults = {
			root_url: ''
		};
	
	/**
	 * Creates and manages the header bar at the top of the window.
	 */
	function ScalarHeader( element, options ) {
		this.element = $(element);
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}
	
	ScalarHeader.prototype.index = null;				// Scalar index plugin
	ScalarHeader.prototype.help = null;					// Scalar help plugin
	ScalarHeader.prototype.search = null;				// Scalar search plugin
	ScalarHeader.prototype.state = null;				// Scalar search plugin
	ScalarHeader.prototype.visualizations = null;		// Scalar visualizations plugin
	
	/**
	 * DOM and other setup for the header.
	 */
	ScalarHeader.prototype.init = function () {
	
		var me = this;
		
		this.state = 'maximized';
		this.lastScroll = $(document).scrollTop();
		this.element.attr('id', 'header');
		this.element.addClass( 'heading_font' );
		this.element.data( 'plugin_scalarheader', this );
		
		$( 'body' ).bind( 'setState', me.handleSetState );
		
		var bookId = parseInt($('#book-id').text());
		$('header').hide();
		
		// Header remains fixed on mobile devices
		if (!isMobile) {
			$(window).scroll(function() {
				var currentScroll = $(document).scrollTop();
				
				// If we're scrolling down in Reading mode, then slide the header upwards
				if ((currentScroll > me.lastScroll) && (currentScroll > 50) && (state == ViewState.Reading)) {
					if ( me.state == 'maximized' ) {
						me.state = 'minimized';
						me.element.addClass( 'header_slide' );
					}
					
				// If we're scrolling down, slide the header downwards
				} else if ((me.lastScroll - currentScroll) > 10) {
					if ( me.state == 'minimized' ) {
						me.state = 'maximized';
						me.element.removeClass( 'header_slide' );
					}
				}
				
				me.lastScroll = currentScroll;
			});
			
			// Slide header down when rolled over
			this.element.mouseenter(function() {
				if ( me.state == 'minimized' ) {
					me.state = 'maximized';
					me.element.removeClass( 'header_slide' );
				}
			});
		}
		
		// Header controls
		var list = $( '<ul></ul>' ).appendTo( this.element );
		
		// Home
		list.append( '<li id="home-item"><img src="' + this.options.root_url + '/images/home_icon.png" alt="Click to go to home page." width="30" height="30" /></li>' );
		$( '#home-item' ).click(function() {
			document.location = addTemplateToURL( $('#book-title').parent().attr("href"), 'cantaloupe');
		});
		
		// Main menu
		list.append( '<li id="main-menu-item"><img src="' + this.options.root_url + '/images/menu_icon.png" alt="Main menu. Roll over to access navigation to primary sections." width="30" height="30" /></li>' );
		
		// Book title
		$('#book-title').parent().wrap('<li id="book-title-item"><div><span></span></div></li>');
		$('#book-title').html( $.trim( $( '#book-title' ).html() ) );
		list.append( $( '#book-title-item' ) );
		addTemplateLinks($('#book_title'), 'cantaloupe');
		
		// Search control
		list.append( '<li id="search-item"><div class="search_control"></div></li>' );
		var searchControl = $( '.search_control' );
		searchControl.append( '<img src="' + this.options.root_url + '/images/search_icon.png" alt="Search button. Click to open search field." width="30" height="30" />' );	
		searchControl.append('<form><input class="search_input caption_font" placeholder="Search this book…" type="search" value="" title="Search terms" name="search" id="search"/><input class="search_submit" title="Press return or enter to search." type="submit" value=""></form>');
		$('.search_input').keydown(function(e) {
			if (e.keyCode == 13) {
				me.search.data('plugin_scalarsearch').doSearch(this.value);
				e.preventDefault();
				return false;
			}
		});
		var searchElement = $('<div></div>').appendTo('body');
		
		// Instantiate search plug-in
		this.search = searchElement.scalarsearch( { root_url: modules_uri+'/cantaloupe'} );
		searchControl.find('img').click(function() {
		
			// Slide open
			if (parseInt($( '#search' ).width()) == 0) {
				$( '#search' ).stop().delay( 100 ).animate({'width': '150%', 'borderColor': '#ddd'}, 250);
				setTimeout( function() { $( '#search' ).focus() }, 1000 );
				
			// Slide closed
			} else {
				$( '#search' ).stop().animate({'width': '0', 'borderColor': '#fff'}, 250).blur();
			}
		});
		
		// Visualization toggle
		list.append( '<li id="visualization-item"><img src="' + this.options.root_url + '/images/visualization_icon.png" alt="Visualization button. Click to toggle visualization showing current position." width="30" height="30" /></li>' );
		$( '#visualization-item' ).click(function() {
			if (state != ViewState.Navigating) {
				setState(ViewState.Navigating);
			} else {
				setState(ViewState.Reading);
			}
		});

		// Data button (to be used for accessing raw API info of page)
		//list.append( '<li id="data-item"><img src="' + this.options.root_url + '/images/api_icon.png" alt="Data" width="30" height="30" /></li>' );
		
		// Help
		list.append( '<li id="help-item"><img src="' + this.options.root_url + '/images/help_icon.png" alt="Help button. Click to toggle help info." width="30" height="30" /></li>' );
		var helpElement = $('<div></div>').appendTo('body');
		this.help = $( helpElement ).scalarhelp( { root_url: modules_uri + '/cantaloupe' } );
		$( '#help-item' ).click(function() {
			me.help.data( 'plugin_scalarhelp' ).toggleHelp();
		});
		
		// Editing options only available for users with privileges that aren't on mobile devices
		if ( !isMobile && ((scalarapi.model.user_level == "scalar:Author") || (scalarapi.model.user_level == "scalar:Commentator") || (scalarapi.model.user_level == "scalar:Reviewer"))) {
		
			// New page
			list.append( '<li id="new-item"><a href="' + scalarapi.model.urlPrefix + 'new.edit"><img src="' + this.options.root_url + '/images/new_icon.png" alt="New page button. Click to create a new page." width="30" height="30" /></a></li>' );
			
			// Edit page/media
			list.append( '<li id="edit-item"><a href="' + scalarapi.model.urlPrefix + scalarapi.basepath( window.location.href ) + '.edit"><img src="' + this.options.root_url + '/images/edit_icon.png" alt="Edit button. Click to edit the current page or media." width="30" height="30" /></a></li>' );
			
			// Annotate media
			if ( currentNode != null ) {
				if ( currentNode.hasScalarType( 'media' ) ) {
					list.append( '<li id="annotate-item"><a href="' + scalarapi.model.urlPrefix + scalarapi.basepath( window.location.href ) + '.annotation_editor"><img src="' + this.options.root_url + '/images/annotate_icon.png" alt="Annotate button. Click to annotate the current media." width="30" height="30" /></a></li>' );
				}
			}
			
			// Import media
			list.append( '<li id="import-item"><img src="' + this.options.root_url + '/images/import_icon.png" alt="Import menu. Roll over to show import options." width="30" height="30" /></li>' );
			this.buildImportMenu();
			
			// Delete page/media
			//list.append( '<li id="delete-item"><img src="' + this.options.root_url + '/images/delete_icon.png" alt="Delete" width="30" height="30" /></li>' );
			//$('[title="Delete"]').click(this.handleDelete);
			
			// Dashboard
			list.append( '<li id="options-item"><a href="' + system_uri + '/dashboard?book_id=' + bookId + '&zone=style#tabs-style"><img src="' + this.options.root_url + '/images/options_icon.png" alt="Options button. Click to access the Dashboard." width="30" height="30" /></a></li>' );
		}
		
		// Sign in
		list.append( '<li id="user-item"><img src="' + this.options.root_url + '/images/user_icon.png" alt="Account button. Click to sign in." width="30" height="30" /></li>' );
		$( '#user-item' ).click(function() {
			document.location = addTemplateToURL(system_uri+'/login?redirect_url='+encodeURIComponent(currentNode.url), 'cantaloupe');
		});
		
		// This is used to resize menus according to browser window size, to ensure they don't get too big
		// and allow area for user to scroll the page behind the menu
		$( 'body' ).bind( 'delayedResize', me.handleDelayedResize );
		$( 'body' ).bind( 'handleBook', function() {
			me.handleBook();
		} );
		
	}
	
	/**
	 * Adjusts position of the header when page state changes.
	 */
	ScalarHeader.prototype.handleSetState = function( event, data ) {
	
		if ( !isMobile ) {
			switch (data.state) {
			
				// Reading state: slide the header up if we're not at the top of the page
				case ViewState.Reading:
				if ( $(document).scrollTop() != 0 ) {
					header.data('plugin_scalarheader').state = 'minimized';
					$( '#header' ).addClass( 'header_slide' );
				}
				break;
			
				// Navigating state: slide the header down
				case ViewState.Navigating:
				header.data('plugin_scalarheader').state = 'maximized';
				$( '#header' ).removeClass( 'header_slide' );
				break;
			
				// Modal dialog: slide the header down
				case ViewState.Modal:
				header.data('plugin_scalarheader').state = 'maximized';
				$( '#header' ).removeClass( 'header_slide' );
				break;
			
			}
		}
	
	}
	
	/**
	 * Confirms that the user wants to trash an item, and does so if needed.
	 */
	ScalarHeader.prototype.handleDelete = function() {
	
		var result = confirm('Are you sure you wish to hide this page from view (move it to the trash)?');
		
		if (result) {
		
			// assemble params for the trash action
			var node = scalarapi.model.currentPageNode,
				baseProperties =  {
					'native': 1,
					id: $('link#parent').attr('href')
				},
				pageData = {
					action: 'UPDATE',
					'scalar:urn': node.current.urn,
					uriSegment: scalarapi.basepath(node.url),
					'dcterms:title': node.current.title,
					'dcterms:description': node.current.description,
					'sioc:content': node.current.content,
					'rdf:type': node.baseType,
					'scalar:metadata:is_live': 0
				},
				relationData = {};
			
			// execute the trash action (i.e. make is_live=0)
			scalarapi.modifyPageAndRelations(baseProperties, pageData, relationData, function(result) {
				if (result) {
					window.location.reload();
				} else {
					alert('An error occurred while moving this content to the trash. Please try again.');
				}
			});
		}
	
	}
	
	/**
	 * Crops menus to fit within browser window.
	 */
	ScalarHeader.prototype.handleDelayedResize = function() {
	
		var maxHeight = ( ( Math.floor( ( ( window.innerHeight - 50 ) * .8 ) / 50 ) * 50 ) + 25 ) + 'px';
		var maxWidth = Math.round( window.innerWidth - 108 ) + 'px';
		$( '#main-menu' ).css( {
			'maxHeight': maxHeight,
			'maxWidth': maxWidth
		} );
		$( '#affiliated-archives-menu' ).css( {
			'maxHeight': maxHeight,
			'maxWidth': maxWidth
		} );
		$( '#other-archives-menu' ).css( {
			'maxHeight': maxHeight,
			'maxWidth': maxWidth
		} );
	
	}
	
	ScalarHeader.prototype.handleBook = function() {
		
		var i, n,
			owners = scalarapi.model.bookNode.properties[ 'http://rdfs.org/sioc/ns#has_owner' ],
			authors = [],
			me = this;
			
		// Get authors of book
		if ( owners ) {
			n = owners.length;
			for ( i = 0; i < n; i++ ) {
				authors.push( scalarapi.getNode( scalarapi.stripAllExtensions( owners[ i ].value )));
			}
		}
		
		$( '#book-title' ).html( scalarapi.model.bookNode.getDisplayTitle() );
		
		var author,
			n = authors.length,
			bookTitle = $( '#book-title-item > div > span' );
			
		// Build string for author credit
		for ( var i = 0; i < n; i++ ) {
			author = authors[ i ];
			if ( i == 0 ) {
				bookTitle.append( ' by ' );
			} else if ( i == ( n - 1 )) {
				if ( n > 2 ) {
					bookTitle.append( ', and ' );
				} else {
					bookTitle.append( ' and ' );
				}
			} else {
				bookTitle.append( ', ' );
			}
			bookTitle.append( author.getDisplayTitle() );
		}
		
		me.buildMainMenu();
	
	}
			
	/**
	 * Constructs the main menu in the DOM.
	 */
	ScalarHeader.prototype.buildMainMenu = function() {
	
		var node = scalarapi.model.getMainMenuNode(),
			me = this;
		
		if (node != null) {
	
			var i,
				menu = $( '<ul id="main-menu" class="scrollable-menu"></div>' ).appendTo( '#main-menu-item' ),
				menuItems = node.getRelatedNodes('referee', 'outgoing', true),
				n = menuItems.length;
			
			// Book title is always first
			//listItem = $( '<li><a href="' + $('#book-title').parent().attr("href") + '">' + $( '#book-title' ).text() + '</a></li>' ).appendTo( menu );
			
			// Next, items in the book's main menu
			if (n > 0) {
				var tocNode, listItem;
				for (i=0; i<n; i++) {
					tocNode = menuItems[i];
					listItem = $( '<li><a href="' + tocNode.url + '">' + ( i + 1 ) + '. ' + tocNode.getDisplayTitle() + '</a></li>' ).appendTo( menu );
				}
			}
			
			// Finally, the index
			listItem = $( '<li>Index</li>' ).appendTo( menu );
			var indexElement = $( '<div></div>' ).appendTo( 'body' );
			this.index = indexElement.scalarindex( {} );
			listItem.click( function() { me.index.data('plugin_scalarindex').showIndex(); } );
			
		}
		
		this.handleDelayedResize();
		
	}
	
	/**
	 * Constructs the import menu in the DOM.
	 */
	ScalarHeader.prototype.buildImportMenu = function() {
	
		var listItem, subMenu, subMenuItem,
			menuLink = $( '#import-item' ),
			menu = $('<ul id="import-menu" class="align-right"></ul>').appendTo( menuLink );
			
		// Affiliated archives
		listItem = $( '<li>Affiliated archives</li>' ).appendTo( menu );
		subMenu = $( '<ul id="affiliated-archives-menu" class="align-right scrollable-menu"></ul>' ).appendTo( listItem );
		subMenuItem = $( '<li><a href="' + scalarapi.model.urlPrefix + 'import/critical_commons">Critical Commons</a>' ).appendTo( subMenu );
		subMenuItem = $( '<li><a href="' + scalarapi.model.urlPrefix + 'import/cuban_theater_digital_archive">Cuban Theater Digital Archive</a>' ).appendTo( subMenu );
		subMenuItem = $( '<li><a href="' + scalarapi.model.urlPrefix + 'import/hemispheric_institute">Hemispheric Institute Digital Video Library</a>' ).appendTo( subMenu );
		subMenuItem = $( '<li><a href="' + scalarapi.model.urlPrefix + 'import/hypercities">Hypercities</a>' ).appendTo( subMenu );
		subMenuItem = $( '<li><a href="' + scalarapi.model.urlPrefix + 'import/internet_archive">Internet Archive</a>' ).appendTo( subMenu );
		subMenuItem = $( '<li><a href="' + scalarapi.model.urlPrefix + 'import/play">Play!</a>' ).appendTo( subMenu );
		subMenuItem = $( '<li><a href="' + scalarapi.model.urlPrefix + 'import/shoah_foundation_vha_online">Shoah Foundation VHA Online</a>' ).appendTo( subMenu );
		subMenuItem = $( '<li><a href="' + scalarapi.model.urlPrefix + 'import/shoah_foundation_vha">Shoah Foundation VHA (partner site)</a>' ).appendTo( subMenu );
		
		// Other archives
		listItem = $( '<li>Other archives</li>' ).appendTo( menu );
		subMenu = $( '<ul id="other-archives-menu" class="align-right scrollable-menu"></ul>' ).appendTo( listItem );
		subMenuItem = $( '<li><a href="' + scalarapi.model.urlPrefix + 'import/prezi">Prezi</a>' ).appendTo( subMenu );
		subMenuItem = $( '<li><a href="' + scalarapi.model.urlPrefix + 'import/soundcloud">SoundCloud</a>' ).appendTo( subMenu );
		subMenuItem = $( '<li><a href="' + scalarapi.model.urlPrefix + 'import/vimeo">Vimeo</a>' ).appendTo( subMenu );
		subMenuItem = $( '<li><a href="' + scalarapi.model.urlPrefix + 'import/youtube">YouTube</a>' ).appendTo( subMenu );
		
		// Other import options
		listItem = $( '<li><a href="' + scalarapi.model.urlPrefix + 'upload">Local media files</a></li>' ).appendTo( menu );
		listItem = $( '<li><a href="' + scalarapi.model.urlPrefix + 'new.edit#type=media">Internet media files</a></li>' ).appendTo( menu );
		listItem = $( '<li><a href="' + scalarapi.model.urlPrefix + 'import/system">Other Scalar books</a></li>' ).appendTo( menu );

		this.handleDelayedResize();
		
	}
			
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if ( !$.data(this, "plugin_" + pluginName )) {
                $.data( this, "plugin_" + pluginName,
                new ScalarHeader( this, options ));
            }
        });
    }

})( jQuery, window, document );