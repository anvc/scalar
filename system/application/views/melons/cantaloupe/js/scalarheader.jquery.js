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
		
		$('#book-title').parent().wrap('<span id="home_menu_link"></span>');
		
		//$('#book-title').parent().wrap('<span class="breadcrumb"></span>');
		//element.find('.breadcrumb').append('<span class="leaves"> &nbsp;&gt;&nbsp; <a href="#">Filmic Texts</a> &nbsp;&gt;&nbsp; The Limits of Television</span>');
		
		addTemplateLinks($('.breadcrumb'), 'cantaloupe');
		
		var buttons = $('<div class="right"></div>').appendTo(this.element);
		
		// various feature buttons
		addIconBtn(buttons, 'search_icon.png', 'search_icon_hover.png', 'Search');
		addIconBtn(buttons, 'visualization_icon.png', 'visualization_icon_hover.png', 'Visualizations');
		addIconBtn(buttons, 'api_icon.png', 'api_icon_hover.png', 'Data');
		$('[title="Visualizations"]').click(function() {
			if (state != ViewState.Navigating) {
				setState(ViewState.Navigating);
			} else {
				setState(ViewState.Reading);
			}
		})
		
		// editing buttons
		if ((scalarapi.model.user_level == "scalar:Author") || (scalarapi.model.user_level == "scalar:Commentator") || (scalarapi.model.user_level == "scalar:Reviewer")) {
			buttons.append('<img class="vrule" src="'+this.options.root_url+'/images/'+'gray1x1.gif"/>');
			addIconBtn(buttons, 'new_icon.png', 'new_icon_hover.png', 'New', scalarapi.model.urlPrefix+'new.edit?'+template_getvar+'=honeydew');
			addIconBtn(buttons, 'edit_icon.png', 'edit_icon_hover.png', 'Edit', scalarapi.basepath(window.location.href)+'.edit?'+template_getvar+'=honeydew');
			
			if (currentNode.getDominantScalarType().id == 'media') {
				addIconBtn(buttons, 'annotate_icon.png', 'annotate_icon_hover.png', 'Annotate', scalarapi.basepath(window.location.href)+'.annotation_editor?'+template_getvar+'=honeydew');
			}
			addIconBtn(buttons, 'delete_icon.png', 'delete_icon_hover.png', 'Delete');
			addIconBtn(buttons, 'options_icon.png', 'options_icon_hover.png', 'Options', system_uri+'/dashboard?book_id='+bookId+'&zone=style#tabs-style');
		}
		addIconBtn(buttons, 'user_icon.gif', 'user_icon_hover.gif', 'User');
		$('[title="Delete"]').click(this.handleDelete);
		$('[title="User"]').click(function() {
			document.location = system_uri+'/login?redirect_url='+encodeURIComponent(scalarapi.model.currentPageNode.url);
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
	
		var node = scalarapi.model.getMainMenuNode();
		
		if (node != null) {
	
			// gather the main menu items
			var i,
				menu = $('<div class="menu"><ol></ol></div>').appendTo(this.element);
			var menuList = menu.find('ol'),
				menuItems = node.getRelatedNodes('referee', 'outgoing', true);
			var n = menuItems.length;
			
			// add them
			if (n > 0) {
				var tocNode, listItem;
				for (i=0; i<n; i++) {
					tocNode = menuItems[i];
					listItem = $('<li>'+tocNode.getDisplayTitle()+'</li>').appendTo(menuList);
					listItem.data('url', tocNode.url+'?m=cantaloupe');
					listItem.click(function() {
						console.log(window);
						window.location = $(this).data('url');
					});
				}
			}
		}
		
		// wait a bit before setting up rollovers to avoid accidental triggering of the menu
		setTimeout(function() {
		
			$('#home_menu_link').mouseenter(function(e) {
				$(this).css('backgroundColor', '#eee');
				$('#header > .menu').show();
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