(function($){
    $.scalarSidebar = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        
        base.container;
        base.queryVars;
        base.current_pane;
        
        base.icons = {};

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        
        // Add a reverse reference to the DOM object
        base.$el.data("scalarSidebar", base);
        
        base.init = function(){
        	base.stime = new Date();
            base.options = $.extend({},$.scalarSidebar.defaultOptions, options);
            if(currentNode != null){
            	//Sorry, I need this to be readable for now - is this the fastest way? Seems to be: http://stackoverflow.com/questions/51185/are-javascript-strings-immutable-do-i-need-a-string-builder-in-javascript/4717855#4717855
				var html = '<div id="info_panel">'+
								'<div id="info_panel_arrow"></div>'+
								'<div id="info_panel_content">'+
									'<div id="info_panel_header">'+
										'<a class="overview_link active" data-page="overview">overview</a>'+
										'<a class="comments_link" data-page="comments">comments</a>'+
										'<a class="metadata_link" data-page="metadata">metadata</a>'+
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
											'<ul class="metadata_list"></ul>'+
										'</div>'+
									'</div>'+
								'</div>'+
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
									'</header><br/>'+
									'<div id="sidebar_panes"></div>'+
								'</div>'+
							'</div>';

				base.container = $(html).appendTo('body');
				base.lastScroll = $(document).scrollTop();
				if (!isMobile) {
					$(window).scroll(function() {
						var currentScroll = $(document).scrollTop();
						if ((currentScroll > base.lastScroll) && (currentScroll > 50) && (state == ViewState.Reading)) {
							$('#sidebar').addClass('tall');
						} else if ((base.lastScroll - currentScroll) > 10) {
							$('#sidebar').removeClass('tall');
						}
						base.lastScroll = currentScroll;
					});
					$('#header').mouseenter(function(){
						$('#sidebar').removeClass('tall');
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
	            /*base.build_index_pane();
	            base.build_recent_pane();
	            base.build_markers_pane();*/

	            
	            base.current_pane = $('#sidebar_panes .pane').first().data('type');
	            $('#sidebar header').hide();
	          	$('#sidebar_'+base.current_pane+'_pane').fadeIn('slow',function(){$(this).addClass('active').removeAttr('style');});
	          	$('#sidebar header .title').text(base.current_pane.toUpperCase());
			    $('#sidebar header .header_icon').html(base.icons[base.current_pane]);
			    $('#sidebar header').fadeIn('slow');

			    $('#sidebar_inside header').click(function(e){
			    	if(!$('body').hasClass('sidebar_expanded')){
			    		base.triggerSidebar(true);
			    	}else{
				    	//Clicked on the header - show the selection dialogue.
				    	console.log('TODO: Show Selection Dialogue');
				    }
			    });

	          	$('.sidebar_collapse').click(function(e){
	          		if($('body').hasClass('sidebar_full')){
	          			$('body').removeClass('sidebar_full');
	          		}else{
	          			base.triggerSidebar(false);
	          		}
	          		base.hideInfo();
	          		e.stopPropagation();
	          	});
	          	$('.sidebar_maximize').click(function(e){
	          		if(!$('body').hasClass('sidebar_full')){
	          			$('body').addClass('sidebar_full');
	          			e.stopPropagation();
	          			base.hideInfo();
	          		}
	          	});
	          	if($('#sidebar_panes .pane').length < 2){
	          		$('.sidebar_next').addClass('disabled');
	          	}

			}

			
        };

        base.build_paths_pane = function(){
        	base.icons['path'] = '<span class="icon-path"></span>';
        	var html = '<div class="pane" data-type="path" id="sidebar_path_pane"><div class="smallmed"><ul class="path"><li class="active" data-slug="'+currentNode.slug+'" data-url="'+currentNode.url+'"><span class="sidebar_icon ';

			switch(currentNode.current.mediaSource.contentType){
				case 'document':
					html += 'icon-page';
					break;
			}

			html += '"></span><div class="title">'+currentNode.current.title+'</div></li></ul></div><div class="large"></div></div>';

			//Make a jQuery object from the new pane's html - will make appending/prepending easier.
			var new_pane = $(html);

			if(typeof base.queryVars.path != undefined){
				//We're on a path - show 1the current page's siblings, too.
				//First, we need to find the structure of the current path
				for(p in currentNode.incomingRelations){
					var parent = currentNode.incomingRelations[p].body;
					if(parent.slug == base.queryVars.path){
						var before_current = true; //We'll flip this once we come to the current page;

						// Unfortunately, the outgoing relations list does not sort by index by default, so we're just going to reformat that list. 
						// We could probably write a custom sort function, but in the end, this is a faster process.
						var relations_list = {};
						for(r in parent.outgoingRelations){
							var path_step = parent.outgoingRelations[r];
							relations_list[path_step.index] = path_step;
						}
						
						//Alright, iterate through our properly ordered list.
						for(r in relations_list){
							var path_step = relations_list[r];
							if(path_step.target.slug == currentNode.slug){
								before_current = false;
							}else{
								//Same as the active page, pretty much.
								var item_html = '<li data-url="'+path_step.target.url+'" data-slug="'+path_step.target.slug+'"><span class="sidebar_icon ';
								switch(path_step.target.current.mediaSource.contentType){
									case 'document':
										item_html += 'icon-page';
										break;
									default:
										console.log(path_step.target.current.defaultView);
								}
								item_html += '"></span><div class="title">'+path_step.target.current.title+'</div></li></ul></div>';

								if(before_current){
									new_pane.find('ul.path').prepend(item_html);
								}else{
									new_pane.find('ul.path').append(item_html);
								}
							}
						}	
						break; //Alright, we can exit the loop now.
					}
				}
			}

			new_pane.find('li').click(function(e){
				var slug = $(this).data('slug');
				$('#info_panel .title, #info_panel .description, #info_panel .featured_list,#info_panel .tagged_by_list, #info_panel .comment_list, #info_panel .metadata_list').html('');
				if($('#info_panel').data('slug')!==slug){
					var top_offset = $(this).offset();
					$('#info_panel_arrow').css({
						'top':(top_offset.top-7)+'px'
					});

					//Prepare yourself for some hot jQuery chaining action.
					$('#info_panel').data('slug',slug)
									.removeClass()
									.addClass('overview')
									.find('.overview_link')
									.addClass('active')
									.siblings('a')
									.removeClass('active');

					$('body').addClass('info_panel_open');

					var node_info = scalarapi.getNode(slug);

					if(typeof node_info === 'object'){
						base.showInfo(node_info);
					}else{
						scalarapi.loadNode(
		        			slug,
		        			false,
		        			function(json){
		        				base.showInfo(json);
		        			},
		        			function(err){
		        				console.log(err);
		        			},
		        			1, null
		        		);
					}
				}else{
					base.hideInfo();
				}
				e.stopPropagation();
			});

			$('body>.bg_screen,body>.page').click(function(e){
				if($('body').hasClass('info_panel_open')){
					$('body').removeClass('info_panel_open');
					$('#info_panel').removeData('slug');	
				}
			});

			$('#sidebar #sidebar_panes').append(new_pane);
        }

        base.build_tags_pane = function(){
        	base.icons.tags = '<span class="ion-pricetag"></span>';

        	var html = '<div class="pane" data-type="tags" id="sidebar_tags_pane"><ul class="tags"></ul></div>';


        	$('#sidebar #sidebar_panes').append($(html));	
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
        	console.log(page.current);
        	
        }
        base.hideInfo = function(){
        	$('body').removeClass('info_panel_open');
			$('#info_panel').removeData('slug');
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