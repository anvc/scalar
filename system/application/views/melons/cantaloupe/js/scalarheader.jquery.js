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
	 * Creates and manages the header bar at the top of the book.
	 */
	function ScalarHeader( element, options ) {
		this.element = $(element);
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}
	
	ScalarHeader.prototype.index = null;		// Scalar index plugin
	ScalarHeader.prototype.help = null;			// Scalar help plugin
	ScalarHeader.prototype.search = null;		// Scalar search plugin
	
	/**
	 * DOM setup for the header.
	 */
	ScalarHeader.prototype.init = function () {
	
		var me = this;
	
		this.lastScroll = $('body').scrollTop();
		
		me.element.attr('id', 'header');
		me.element.data('state', 'maximized');
		
		var bookId = parseInt($('#book-id').text());
		$('header').hide();
		
		if (!isMobile) {
			$(window).scroll(function() {
				var currentScroll = $('body').scrollTop();
				
				// if we're scrolling down in Reading mode, then slide the header upwards
				if ((currentScroll > me.lastScroll) && (currentScroll > 50) && (state == ViewState.Reading)) {
					if (me.element.data('state') == 'maximized') {
						me.element.data('state', 'minimized').stop().animate({top:'-40px'}, 200);
					}
					
				// if we're scrolling down, slide the header downwards
				} else if ((me.lastScroll - currentScroll) > 10) {
					if (me.element.data('state') == 'minimized') {
						me.element.data('state', 'maximized').stop().animate({top:'0'}, 200);
					}
				}
				
				me.lastScroll = $('body').scrollTop();
			});
		}
		
		var img_url_1 = this.options.root_url+'/images/home_icon.png';
		this.element.prepend('<div id="home_menu_link"><img src="'+img_url_1+'" alt="Home" width="30" height="30" /></div> ');
		
		$('#book-title').parent().wrap('<span id="breadcrumb"></span>');
		
		//$('#book-title').parent().wrap('<span class="breadcrumb"></span>');
		//element.find('.breadcrumb').append('<span class="leaves"> &nbsp;&gt;&nbsp; <a href="#">Filmic Texts</a> &nbsp;&gt;&nbsp; The Limits of Television</span>');
		
		addTemplateLinks($('#breadcrumb'), 'cantaloupe');
		
		var buttons = $('<div class="right"></div>').appendTo(this.element);
		
		// various feature buttons
		var searchControl = $('<div class="search_control"></div>').appendTo(buttons);
		addIconBtn(searchControl, 'search_icon.png', 'search_icon_hover.png', 'Search');
		searchControl.append('<form><input class="search_input caption_font" placeholder="Search this book…" type="search" value="" name="search" id="search"/><input class="search_submit" type="submit" value=""></form>');
		$('.search_input').keydown(function(e) {
			if (e.keyCode == 13) {
				me.search.data('plugin_scalarsearch').doSearch(this.value);
				e.preventDefault();
				return false;
			}
		});
		var searchElement = $('<div></div>').appendTo('body');
		this.search = searchElement.scalarsearch( { root_url: modules_uri+'/cantaloupe'} );
		searchControl.find('img').click(function() {
			if (parseInt($('.search_input').width()) == 0) {
				$('.search_input').animate({'width': '150%', 'borderColor': '#ddd'}, 250).focus();
			} else {
				$('.search_input').animate({'width': '0', 'borderColor': '#fff'}, 250).blur();
			}
		});
		
		
		addIconBtn(buttons, 'visualization_icon.png', 'visualization_icon_hover.png', 'Visualizations');
		//addIconBtn(buttons, 'api_icon.png', 'api_icon_hover.png', 'Data');
		addIconBtn(buttons, 'help_icon.png', 'help_icon_hover.png', 'Help');
		$('[title="Visualizations"]').click(function() {
			if (state != ViewState.Navigating) {
				setState(ViewState.Navigating);
			} else {
				setState(ViewState.Reading);
			}
		})
		
		var helpElement = $('<div></div>').appendTo('body');
		this.help = helpElement.scalarhelp( { root_url: modules_uri+'/cantaloupe'} );
		$('[title="Help"]').click(function() {
			me.help.data('plugin_scalarhelp').toggleHelp();
		});
		
		// editing buttons
		if ((scalarapi.model.user_level == "scalar:Author") || (scalarapi.model.user_level == "scalar:Commentator") || (scalarapi.model.user_level == "scalar:Reviewer")) {
			buttons.append('<img class="vrule" src="'+this.options.root_url+'/images/'+'gray1x1.gif"/>');
			addIconBtn(buttons, 'new_icon.png', 'new_icon_hover.png', 'New', scalarapi.model.urlPrefix+'new.edit?'+template_getvar+'=honeydew');
			addIconBtn(buttons, 'edit_icon.png', 'edit_icon_hover.png', 'Edit', scalarapi.basepath(window.location.href)+'.edit?'+template_getvar+'=honeydew');
			
			if (currentNode.hasScalarType('media')) {
				addIconBtn(buttons, 'annotate_icon.png', 'annotate_icon_hover.png', 'Annotate', scalarapi.model.urlPrefix+scalarapi.basepath(window.location.href)+'.annotation_editor?'+template_getvar+'=honeydew');
			}
			//addIconBtn(buttons, 'delete_icon.png', 'delete_icon_hover.png', 'Delete');
			addIconBtn(buttons, 'options_icon.png', 'options_icon_hover.png', 'Options', system_uri+'/dashboard?book_id='+bookId+'&zone=style#tabs-style');
		}
		addIconBtn(buttons, 'user_icon.gif', 'user_icon_hover.gif', 'User');
		//$('[title="Delete"]').click(this.handleDelete);
		$('[title="User"]').click(function() {
			document.location = addTemplateToURL(system_uri+'/login?redirect_url='+encodeURIComponent(scalarapi.model.currentPageNode.url), 'cantaloupe');
		});

		// load info about the book, build main menu when done
		scalarapi.loadBook(true, function() {
			me.buildMainMenu();
		});
		
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
	 * Constructs the main menu in the DOM.
	 */
	ScalarHeader.prototype.buildMainMenu = function() {
	
		var node = scalarapi.model.getMainMenuNode(),
			me = this;
		
		if (node != null) {
	
			// gather the main menu items
			var i,
				menu = $('<div class="menu"><ol></ol></div>').appendTo(this.element);
			var menuList = menu.find('ol'),
				menuItems = node.getRelatedNodes('referee', 'outgoing', true);
			var n = menuItems.length;
			
			listItem = $('<p class="unordered">'+$('#book-title').text()+'</p>').appendTo(menuList);
			listItem.data('url', $('#book-title').parent().attr("href"));
			listItem.click(function() {
				window.location = addTemplateToURL($(this).data('url'), 'cantaloupe');
			});
			
			// add them
			if (n > 0) {
				var tocNode, listItem;
				for (i=0; i<n; i++) {
					tocNode = menuItems[i];
					listItem = $('<li>'+tocNode.getDisplayTitle()+'</li>').appendTo(menuList);
					listItem.data('url', tocNode.url);
					listItem.click(function() {
						window.location = addTemplateToURL($(this).data('url'), 'cantaloupe');
					});
				}
			}
			
			listItem = $('<p class="unordered">Index</p>').appendTo(menuList);
			var indexElement = $('<div></div>').appendTo('body');
			this.index = indexElement.scalarindex( {} );
			listItem.click( function() { me.index.data('plugin_scalarindex').showIndex(); } );
		}
		
		// wait a bit before setting up rollovers to avoid accidental triggering of the menu
		setTimeout(function() {
		
			$('#home_menu_link').mouseenter(function(e) {
				$(this).css('backgroundColor', '#eee');
				$('#header > .menu').show();
			});
		
			$('#home_menu_link').click(function(e) {
				if ($('#header > .menu').css('display') == "block") {
					$(this).css('backgroundColor', '#fff');
					$('#header > .menu').hide();
				} else {
					$(this).css('backgroundColor', '#eee');
					$('#header > .menu').show();
				}
				e.stopImmediatePropagation();
			});
			
			$('#header > .menu').mouseleave(function() {
				$('#home_menu_link').css('backgroundColor', 'inherit');
				$('#header > .menu').hide();
			})
			
			$('body').click(function() {
				$('#home_menu_link').css('backgroundColor', 'inherit');
				$('#header > .menu').hide();
			});
		
		}, 1000);
		
	}
	
	ScalarHeader.prototype.buildAdminMenu = function() {
	
		// gather the main menu items
		var menu = $('<div class="menu"><ul></ul></div>').appendTo(this.element);
		var menuList = menu.find('ul');
		
		listItem = $('<ul>Dashboard</ul>').appendTo(menuList);
		listItem = $('<ul>Import</ul>').appendTo(menuList);
		
		// add them
		if (n > 0) {
			var tocNode, listItem;
			for (i=0; i<n; i++) {
				tocNode = menuItems[i];
				listItem = $('<li>'+tocNode.getDisplayTitle()+'</li>').appendTo(menuList);
				listItem.data('url', tocNode.url);
				listItem.click(function() {
					window.location = addTemplateToURL($(this).data('url'), 'cantaloupe');
				});
			}
		}
		
		listItem = $('<p class="unordered">Index</p>').appendTo(menuList);
		
		// wait a bit before setting up rollovers to avoid accidental triggering of the menu
		setTimeout(function() {
		
			$('#home_menu_link').mouseenter(function(e) {
				$(this).css('backgroundColor', '#eee');
				$('#header > .menu').show();
			});
		
			$('#home_menu_link').click(function(e) {
				if ($('#header > .menu').css('display') == "block") {
					$(this).css('backgroundColor', '#fff');
					$('#header > .menu').hide();
				} else {
					$(this).css('backgroundColor', '#eee');
					$('#header > .menu').show();
				}
				e.stopImmediatePropagation();
			});
			
			$('#header > .menu').mouseleave(function() {
				$('#home_menu_link').css('backgroundColor', 'inherit');
				$('#header > .menu').hide();
			})
			
			$('body').click(function() {
				$('#home_menu_link').css('backgroundColor', 'inherit');
				$('#header > .menu').hide();
			});
		
		}, 1000);
	
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