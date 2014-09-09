(function($){
    $.scalarSidebar = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        
        base.container;
        base.queryVars;
        base.current_pane;

        base.hovered_item;
        base.infobar_timeout;
        
        base.icons = {};
        base.loaded_nodes = {};

        base.fullScreenViews = ['iframe'];

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        
        // Add a reverse reference to the DOM object
        base.$el.data("scalarSidebar", base);
        
        base.init = function(){
        	base.stime = new Date();
            base.options = $.extend({},$.scalarSidebar.defaultOptions, options);
            if(currentNode != null){
            	//Determine first whether we are in a full screen layout or not - if so, add a class to the body tag.
            	if(base.fullScreenViews.indexOf(currentNode.current.defaultView)>=0){
            		$('body').addClass('fullscreen_page');
            	}
            	//Sorry, I need this to be readable for now - is this the fastest way? Seems to be: http://stackoverflow.com/questions/51185/are-javascript-strings-immutable-do-i-need-a-string-builder-in-javascript/4717855#4717855
				var html = '<div id="info_panel">'+
								'<div id="info_panel_arrow"></div>'+
								'<div id="info_panel_content">'+
									'<div id="info_panel_header">'+
										'<a class="overview_link active" data-page="overview">overview</a>'+
										'<a class="metadata_link" data-page="metadata">metadata</a>'+
										'<a class="comments_link" data-page="comments">comments</a>'+
										'<div id="info_panel_selector">'+
											'<ul>'+
												'<li class="">'+
											'</ul>'+
										'</div>'+
									'</div>'+
									'<h3 class="title"></h3>'+
									'<div class="section" id="overview_info">'+
										'<div class="content">'+
											'<p class="description"></p>'+
											'<div class="featured_block">'+
												'<h4>Featured In</h4>'+
												'<ul class="featured_list"></ul>'+
											'</div>'+
											'<div class="tagged_by_block">'+
												'<h4>Tagged By</h4>'+
												'<ul class="tagged_by_list"></ul>'+
											'</div>'+
										'</div>'+
									'</div>'+
									'<div class="section" id="comments_info">'+
										'<div class="content">'+
											'<h4>Comments</h4>'+
											'<a class="discuss_link"><div class="icon"><span class="icon-add-comment"></span></div> <span class="text">Discuss</span></a><br/>'+
											'<ul class="comment_list"></ul>'+
										'</div>'+
									'</div>'+
									'<div class="section" id="metadata_info">'+
										'<div class="content">'+
											'<dl class="metadata_list"></dl>'+
										'</div>'+
									'</div>'+
								'</div>'+
								'<footer>'+
									'<a class="info_hide">Back</a>'+
									'<a class="info_visit">Visit</a>'+
								'</footer>'+
							'</div>'+
							'<div id="sidebar">'+
								'<div id="sidebar_inside">'+
									'<header>'+
										'<span class="header_icon"></span>'+
										'<span class="controls">'+
											'<a class="sidebar_collapse icon-arrow-left"></a>'+
											'<a class="sidebar_maximize icon-arrow-right"></a>'+
										'</span>'+
										'<span class="title"></span>'+
										'<div id="sidebar_selector">'+
											'<ul>'+
												'<li class="path" data-pane="path"><span class="header_icon"><span class="icon-path"></span></span><span class="title">Path</span></li>'+
												'<li class="tags" data-pane="tags"><span class="header_icon"><span class="icon-tags"></span></span><span class="title">Tags</span></li>'+
												'<li class="index" data-pane="index"><span class="header_icon"><span class="icon-index"></span></span><span class="title">Index</span></li>'+
												'<li class="linear" data-pane="linear"><span class="header_icon"><span class="icon-linear"></span></span><span class="title">Linear</span></li>'+
												'<li class="recent" data-pane="recent"><span class="header_icon"><span class="icon-recent"></span></span><span class="title">Recent</span></li>'+
												'<li class="markers" data-pane="markers"><span class="header_icon"><span class="icon-markers"></span></span><span class="title">Markers</span></li>'+
											'</ul>'+
										'</div>'+
									'</header><br/>'+
									'<div id="sidebar_panes"></div>'+
									'<footer id="sidebar_close_footer">'+
										'<a class="sidebar_hide">Close</a>'+
									'</footer>'+
								'</div>'+
							'</div>';

				base.container = $(html).appendTo('body');
				base.lastScroll = $(document).scrollTop();
				if (!isMobile) {
					$(window).scroll(function() {
						var currentScroll = $(document).scrollTop();
						if ((currentScroll > base.lastScroll) && (currentScroll > 50) && (state == ViewState.Reading)) {
							$('#sidebar, #info_panel').addClass('tall');
						} else if ((base.lastScroll - currentScroll) > 10) {
							$('#sidebar, #info_panel').removeClass('tall');
						}
						var hovered_item = base.hovered_item;
						var top_offset = ((hovered_item.offset().top + $('#sidebar_panes').position().top) - (hovered_item.height()/2))-$(window).scrollTop();
						$('#info_panel_arrow').css({
							'top':(top_offset+8)+'px'
						});
						base.lastScroll = currentScroll;
					});
					$('#header').mouseenter(function(){
						$('#sidebar, #info_panel').removeClass('tall');
					});
				}

				$('#info_panel_header a').click(function(){
					var current_page = $(this).data('page');
					$('#info_panel').removeClass().addClass(current_page);
					$(this).addClass('active').siblings('a').removeClass('active');
				});

	           	base.queryVars = scalarapi.getQueryVars( document.location.href );

	            base.build_paths_pane();
				base.build_tags_pane();
	            base.build_index_pane();
	            base.build_linear_pane();
	            base.build_recent_pane();
	            base.build_markers_pane();

	            
	            base.current_pane = $('#sidebar_panes .pane').first().data('type');
	            $('#sidebar header').hide();
	          	$('#sidebar_'+base.current_pane+'_pane').fadeIn('slow',function(){$(this).addClass('active').removeAttr('style');});
	          	$('#sidebar_selector li.'+base.current_pane).addClass('active');
	          	$('#sidebar header>.title').text(base.current_pane.toUpperCase());

	          	$('#sidebar header>.header_icon').html(base.icons[base.current_pane]);
			    $('#sidebar header').fadeIn('slow');

			    $('#sidebar_inside>header').click(function(e){
			    	if(!$('body').hasClass('sidebar_expanded')){
			    		base.triggerSidebar(true);
			    	}else{
			    		if($(this).hasClass('selector_open')){
			    			//Clicked on the header - hide the selection dialogue.
			    			$(this).removeClass('selector_open');
			    		}else{
				    		//Clicked on the header - show the selection dialogue.
			    			$(this).addClass('selector_open');
			    		}
				    }
			    });

	          	$('#sidebar header .controls .sidebar_collapse').click(function(e){
	          		if($('body').hasClass('sidebar_full')){
	          			$('body').removeClass('sidebar_full');
	          		}else{
	          			base.triggerSidebar(false);
	          		}
	          		$('#sidebar_inside>header').removeClass('selector_open');
	          		base.hideInfo();
	          		e.stopPropagation();
	          	});
	          	$('#sidebar .sidebar_hide').click(function(e){
	          		$('#sidebar_inside>header').removeClass('selector_open');
	          		base.triggerSidebar(false);
	          		base.hideInfo();
	          		e.stopPropagation();
	          	});
	          	$('#sidebar header .controls .sidebar_maximize').click(function(e){
	          		if(!$('body').hasClass('sidebar_full')){
	          			$('#sidebar_inside>header').removeClass('selector_open');
	          			$('body').addClass('sidebar_full');
	          			e.stopPropagation();
	          			base.hideInfo();
	          		}
	          	});
	          	$('#sidebar_selector li').click(function(){
	          		if($(this).hasClass('enabled')){
	          			base.current_pane = $(this).data('pane');
			            $('#sidebar header').hide();
			            $('#sidebar .pane').removeClass('active');
			          	$('#sidebar_'+base.current_pane+'_pane').fadeIn('slow',function(){$(this).addClass('active').removeAttr('style');});
			          	$('#sidebar_selector li').removeClass('active');
			          	$('#sidebar_selector li.'+base.current_pane).addClass('active');
			          	$('#sidebar header>.title').text(base.current_pane.toUpperCase());
					    $('#sidebar header>.header_icon').html(base.icons[base.current_pane]);
					    $('#sidebar header').fadeIn('slow');
					    console.log(base.current_pane);
					    console.log(base.icons);
	          		}
	          	});
			}

			
        };

        base.build_paths_pane = function(){
        	var paths = currentNode.getRelations('path', 'incoming', 'reverseindex');
        	base.icons['path'] = '<span class="icon-path"></span>';
        	var html = '<div class="pane" data-type="path" id="sidebar_path_pane">'+
        					'<div class="smallmed"><ul class="current path"></ul></div>'+
        					'<div class="large list">'+
        						'<header><a class="all_link" data-view="all">View All</a><a class="list_link" data-view="list">List View</a></header>'+
        						'<div class="view" id="path_list_view"></div>'+
        						'<div class="view" id="path_all_view"></div>'+
        					'</div>'+
        				'</div>';

			//Make a jQuery object from the new pane's html - will make appending/prepending easier.
			var new_pane = $(html);
			new_pane.find('.large>a').click(function(){
				var view = $(this).data('view');
				if(!$('#sidebar_path_pane .large').hasClass(view)){
					$('#sidebar_path_pane .large').removeClass('list all').addClass(view);
				}
			});
			//We're on a path - show 1the current page's siblings, too.
			//First, we need to find the structure of the current path
			for(p in paths){
				var parent = currentNode.incomingRelations[p].body;
				if(parent.slug == base.queryVars.path){
					
					$(new_pane).find('ul.current.path').data('path',parent.slug);

					var before_current = true; //We'll flip this once we come to the current page;

					// Unfortunately, the outgoing relations list does not sort by index by default, so we're just going to reformat that list. 
					// We could probably write a custom sort function, but in the end, this is a faster process.
					var relations_list = {};
					for(r in parent.outgoingRelations){
						var path_step = parent.outgoingRelations[r];
						relations_list[path_step.index] = path_step;
					}

					var show_icon = function(slug, new_item){
						var item = base.loaded_nodes[slug];
						var item_html = '<span class="sidebar_icon ';

						item_html += base.getIconByType(item.current.mediaSource.contentType);
						
						item_html += '" style="display: none;"></span>';

						$(item_html).prependTo(new_item).fadeIn('slow');
					}
					
					//Alright, iterate through our properly ordered list.
					for(r in relations_list){
						var path_step = relations_list[r];
						var node_info = scalarapi.getNode(path_step.target.slug);
						//console.log(node_info);
						//Same as the active page, pretty much.
						var item_html = '<li data-url="'+path_step.target.url+'" data-slug="'+path_step.target.slug+'"><div class="title">'+path_step.target.current.title+'</div></li></ul></div>';

						var new_item = $(item_html).appendTo(new_pane.find('ul.current.path'));

						if(path_step.target.slug == currentNode.slug){
							new_item.addClass('active');
						}
						var slug = path_step.target.slug;

						if(slug == currentNode.slug){
							//We already have this page loaded - let's show it now.
							base.loaded_nodes[slug] = currentNode;
							show_icon(slug, new_item);
						}else{
							//We don't have this loaded yet - let's do a little bit of asynchronous magic here; Self-calling anonymous function to load the icon using the API.
							(function(slug, new_item){
								scalarapi.loadNode(
									slug,
									true,
									function(json){
										base.loaded_nodes[slug] = scalarapi.getNode(slug);
										show_icon(slug, new_item);	
									},
									function(err){},
									1, null);
							})(slug, new_item);
						}

					}	
					break; //Alright, we can exit the loop now.
				}
			}
			console.log(isMobile);
			var load_show_info = function(slug){
				//Prepare yourself for some hot jQuery chaining action.
					$('#info_panel').data('slug',slug)
									.removeClass()
									.addClass('overview')
									.find('.overview_link')
									.addClass('active')
									.siblings('a')
									.removeClass('active');

					$('body').addClass('info_panel_open');
					$('#info_panel .title').text('Loading...');
					if(typeof base.loaded_nodes[slug] != 'undefined'){
						base.showInfo(base.loaded_nodes[slug]);
					}else{
						scalarapi.loadNode(
		        			slug,
		        			true,
		        			function(json){
		        				base.loaded_nodes[slug] = scalarapi.getNode(slug);
		        				//console.log(base.loaded_nodes[slug]);
		        				base.showInfo(base.loaded_nodes[slug]);
		        			},
		        			function(err){
		        				//console.log(err);
		        			},
		        			1, null
		        		);
		        	}
			}
			new_pane.find('li').mouseenter(function(e){
				clearTimeout(base.infobar_timeout);
				base.hovered_item = $(this);
				var slug = $(this).data('slug');
				$('#info_panel .title, #info_panel .description, #info_panel .featured_list,#info_panel .tagged_by_list, #info_panel .comment_list, #info_panel .metadata_list').html('');
				var top_offset = (($(this).offset().top + $('#sidebar_panes').position().top) - ($(this).height()/2))-$(window).scrollTop();
				$('#info_panel_arrow').css({
					'top':(top_offset+8)+'px'
				});

				load_show_info(slug);
				e.stopPropagation();
			}).mouseleave(function(){
				base.infobar_timeout = setTimeout(function(){
					base.hovered_item = null;
					base.hideInfo();
				},500);
			}).click(function(){
				var slug = $(this).data('slug');
				if(isMobile){
					if($('#info_panel').data('slug')!==slug){
						load_show_info(slug);
					}else{
						base.hideInfo();
					}
				}else{
					var node = scalarapi.getNode(slug);
					var path = $(this).parent('ul.path').data('path');
					window.location = node.url+'?path='+path;
				}
			});

			$('#info_panel').mouseenter(function(e){
				clearTimeout(base.infobar_timeout);
			}).mouseleave(function(){
				base.infobar_timeout = setTimeout(function(){
					base.hovered_item = null;
					base.hideInfo();
				},500);
			});

			$('body>.bg_screen,body>.page,body>#info_panel>footer>.info_hide').click(function(e){
				if($('body').hasClass('info_panel_open')){
					$('body').removeClass('info_panel_open');
					$('#info_panel').removeData('slug');	
				}
			});

			$('#sidebar #sidebar_panes').append(new_pane);
			$('#sidebar_selector .path').addClass('enabled');
        }

        base.build_tags_pane = function(){
        	
        	var tags = currentNode.getRelations('tag', 'incoming', 'reverseindex');
        	//Determine if we need the tags pane...
        	base.icons.tags = '<span class="icon-tags"></span>';

        	var html = '<div class="pane" data-type="tags" id="sidebar_tags_pane"><div class="smallmed"><ul class="current tags"></ul></div></div>';
        	var new_pane = $(html);
        	for(t in tags){
        		var tag = tags[t];
				console.log(tag);

        		var item_html = '<li class="active" data-url="'+tag.body.url+'" data-slug="'+tag.body.slug+'"><span class="sidebar_icon"><span class="icon-tags"></span></span><div class="title">'+tag.body.current.title+'</div></li></ul></div>';

				var new_item = $(item_html).appendTo(new_pane.find('ul.current.tags'));
        	}

        	$('#sidebar #sidebar_panes').append(new_pane);	
			$('#sidebar_selector .tags').addClass('enabled');
        }
        base.build_index_pane = function(){
        	base.icons.index = '<span class="icon-index"></span>';

        	var html = '<div class="pane" data-type="index" id="sidebar_tags_pane"><ul class="index"></ul></div>';


        	$('#sidebar #sidebar_panes').append($(html));	
			$('#sidebar_selector .index').addClass('enabled');
        }
        base.build_linear_pane = function(){
        	base.icons.linear = '<span class="icon-linear"></span>';

        	var html = '<div class="pane" data-type="linear" id="sidebar_tags_pane"><ul class="linear"></ul></div>';


        	$('#sidebar #sidebar_panes').append($(html));	
			$('#sidebar_selector .linear').addClass('enabled');
        }
        base.build_recent_pane = function(){
        	base.icons.recent = '<span class="icon-recent"></span>';

        	var html = '<div class="pane" data-type="recent" id="sidebar_tags_pane"><ul class="recent"></ul></div>';


        	$('#sidebar #sidebar_panes').append($(html));	
			$('#sidebar_selector .recent').addClass('enabled');
        }
        base.build_markers_pane = function(){
        	base.icons.markers = '<span class="icon-markers"></span>';

        	var html = '<div class="pane" data-type="markers" id="sidebar_tags_pane"><ul class="markers"></ul></div>';


        	$('#sidebar #sidebar_panes').append($(html));	
			$('#sidebar_selector .markers').addClass('enabled');
        }
        
        base.triggerSidebar = function(do_expand){
        	if(typeof do_expand !== 'undefined'){
        		if(do_expand === true){
        			$('body').addClass('sidebar_expanded');
        		}else if(do_expand === false){
        			$('body').removeClass('sidebar_expanded');
        		}
        	}else if($('body').hasClass('sidebar_expanded')){
				$('body').removeClass('sidebar_expanded');
        	}else{
        		$('body').addClass('sidebar_expanded');
        	}
        };

        base.showInfo = function(page){
        	$('#info_panel .title').text(page.current.title);
        	$('#info_panel .description').text(page.current.description);
        	$('body>#info_panel .info_visit').attr('href',page.url);

        	//Handle the comments:
        	var comments = page.getRelations('comment', 'incoming', 'reverseindex');
        	$('#info_panel #comments_info .comment_list').html('');
        	if(comments.length > 0){
        		for(var c in comments){
        			comment = comments[c];				
        			//console.log(comment);
					var date = new Date(comment.properties.datetime);
					$('#info_panel #comments_info .comment_list').append('<li><a href="'+comment.body.url+'"><div class="icon"><span class="icon-add-comment"></span></div> <span class="text"><strong>'+comment.body.getDisplayTitle()+'</strong> '+comment.body.current.content+'</span></a></li>');
	        	}
        	}else{
        		$('#info_panel #comments_info .comment_list').append('<li>There are currently no comments for this page.</li>');
        	}
        	//console.log(page);
        	
        }
        base.hideInfo = function(){
        	$('body').removeClass('info_panel_open');
			$('#info_panel').removeData('slug');
        }

        base.getIconByType = function(type){
        	//console.log(type);
        	var icons = {
        		'image' : 'icon-photo',
        		'default' : 'icon-page'
        	};
        	if(typeof icons[type] !== 'undefined'){
        		return icons[type];
        	}else{
        		return icons.default;
        	}
        }
        
        // Run initializer
        base.init();
    };
    
    $.scalarSidebar.defaultOptions = {
    };
    
    $.fn.scalarSidebar = function(options){
        return this.each(function(){
            (new $.scalarSidebar(this, options));
        });
    };
    
})(jQuery);