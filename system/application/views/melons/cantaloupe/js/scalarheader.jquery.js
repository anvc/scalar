(function($) {

	$.scalarheader = function(e, options) {
	
		var element = e;
		var lastScroll = $('body').scrollTop();
		
		var header = {
			options: $.extend({
				'root_url': ''
			}, options),
			
			addIconBtn: function(element, filename, hoverFilename, title, url) {
				var img_url_1 = header.options.root_url+'/images/'+filename;
				var img_url_2 = header.options.root_url+'/images/'+hoverFilename;
				if (url == undefined) url = 'javascript:;';
				element.append('<a href="'+url+'" title="'+title+'"><img src="'+img_url_1+'" onmouseover="this.src=\''+img_url_2+'\'" onmouseout="this.src=\''+img_url_1+'\'" alt="Search" width="30" height="30" /></a>');
			},
			
			handleDelete: function() {
			
				var result = confirm('Are you sure you wish to hide this page from view (move it to the trash)?');
				
				if (result) {
				
					var node = scalarapi.model.currentPageNode;
					
					var baseProperties =  {
						'native': 1,
						id: $('link#parent').attr('href')
					};
					
					console.log(baseProperties);
				
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
						console.log(result);
						if (result) {
							window.location.reload();
						} else {
							alert('An error occurred while moving this content to the trash. Please try again.');
						}
					});
				}
			
			},
			
			buildMainMenu: function() {
				this.node = scalarapi.model.getMainMenuNode();
				
				if (this.node) {
			
					var menu = $('<div class="menu"><ol></ol></div>').appendTo(element);
					var menuList = menu.find('ol');
				
					var menuItems = this.node.getRelatedNodes('referee', 'outgoing', true);
					
					var i;
					var n = menuItems.length;
					
					// add all of the main menu items
					if (n > 0) {
						var tocNode;
						var listItem;
						for (i=0; i<n; i++) {
							tocNode = menuItems[i];
							listItem = $('<li>'+tocNode.getDisplayTitle()+'</li>').appendTo(menuList);
							listItem.data('url', tocNode.url+'?m=cantaloupe');
							listItem.click(function() {
								window.location = $(this).data('url');
							});
						}
					}
				}
				
				
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
		};
		
		element.attr('id', 'header');
		element.data('state', 'maximized');
		
		var bookId = parseInt($('#book-id').text());
		$('header').hide();
		
		$(window).scroll(function() {
			var currentScroll = $('body').scrollTop();
			if ((currentScroll > lastScroll) && (currentScroll > 0) && (state == ViewState.Reading)) {
				if (element.data('state') == 'maximized') {
					element.data('state', 'minimized').stop().animate({top:'-40px'}, 200);
				}
			} else if ((lastScroll - currentScroll) > 10) {
				if (element.data('state') == 'minimized') {
					element.data('state', 'maximized').stop().animate({top:'0'}, 200);
				}
			}
			lastScroll = $('body').scrollTop();
		});
		
		
		//var img_url_1 = header.options.root_url+'/images/home_icon.png';
		//element.prepend('<div id="home_menu_link"><img src="'+img_url_1+'" alt="Home" width="30" height="30" /></div> ');
		
		$('#book-title').parent().wrap('<span id="home_menu_link"></span>');
		//$('#book-title').parent().wrap('<span class="breadcrumb"></span>');
		//element.find('.breadcrumb').append('<span class="leaves"> &nbsp;&gt;&nbsp; <a href="#">Filmic Texts</a> &nbsp;&gt;&nbsp; The Limits of Television</span>');
		addTemplateLinks($('.breadcrumb'), 'cantaloupe');
		
		var buttons = $('<div class="right"></div>').appendTo(element);
		
		header.addIconBtn(buttons, 'search_icon.png', 'search_icon_hover.png', 'Search');
		header.addIconBtn(buttons, 'visualization_icon.png', 'visualization_icon_hover.png', 'Visualizations');
		header.addIconBtn(buttons, 'api_icon.png', 'api_icon_hover.png', 'Data');
		
		if ((scalarapi.model.user_level == "scalar:Author") || (scalarapi.model.user_level == "scalar:Commentator") || (scalarapi.model.user_level == "scalar:Reviewer")) {
			buttons.append('<img class="vrule" src="'+header.options.root_url+'/images/'+'gray1x1.gif"/>');
			header.addIconBtn(buttons, 'new_icon.png', 'new_icon_hover.png', 'New', scalarapi.model.urlPrefix+'new.edit?'+template_getvar+'=honeydew');
			header.addIconBtn(buttons, 'edit_icon.png', 'edit_icon_hover.png', 'Edit', scalarapi.basepath(window.location.href)+'.edit?'+template_getvar+'=honeydew');
			
			if (currentNode.getDominantScalarType().id == 'media') {
				header.addIconBtn(buttons, 'annotate_icon.png', 'annotate_icon_hover.png', 'Annotate', scalarapi.basepath(window.location.href)+'.annotation_editor?'+template_getvar+'=honeydew');
			}
			header.addIconBtn(buttons, 'delete_icon.png', 'delete_icon_hover.png', 'Delete');
			header.addIconBtn(buttons, 'options_icon.png', 'options_icon_hover.png', 'Options', system_uri+'/dashboard?book_id='+bookId+'&zone=style#tabs-style');
		}
		header.addIconBtn(buttons, 'user_icon.gif', 'user_icon_hover.gif', 'User');
		
		$('[title="Delete"]').click(header.handleDelete);
		
		$('[title="Visualizations"]').click(function() {
			if (state != ViewState.Navigating) {
				setState(ViewState.Navigating);
			} else {
				setState(ViewState.Reading);
			}
		})
		
		scalarapi.loadBook(true, header.buildMainMenu)
	
	}

})(jQuery);