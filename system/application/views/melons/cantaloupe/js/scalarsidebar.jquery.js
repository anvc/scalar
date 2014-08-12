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
            base.options = $.extend({},$.scalarSidebar.defaultOptions, options);
            if(currentNode != null){

				var html = '<div id="sidebar"><div id="sidebar_inside"><header><span class="header_icon"></span><span class="controls"><a class="sidebar_previous ion-ios7-arrow-left"></a> <a class="sidebar_next ion-ios7-arrow-right"></a></span><span class="title"></span></header><br /><div id="sidebar_panes"></div></div></div>';

	            base.container = $(html).appendTo('body').css('opacity',0).fadeTo('fast',1).hover(function(){
	            	if($(window).width() > 580){
	            		base.triggerSidebar(true);
	            	}
	            },function(){
	            	if($(window).width() > 580){
	            		base.triggerSidebar(false);
	            	}
	            });


				base.queryVars = scalarapi.getQueryVars( document.location.href );

	            base.build_paths_pane();
	            base.build_tags_pane();
	            /*base.build_index_pane();
	            base.build_recent_pane();
	            base.build_markers_pane();*/

	            base.current_pane = $('#sidebar_panes .pane').first().data('type');
	          	$('#sidebar_'+base.current_pane+'_pane').addClass('active');
	          	$('#sidebar header .title').text(base.current_pane.toUpperCase());
			    $('#sidebar header .header_icon').html(base.icons[base.current_pane]);
	          	$('.sidebar_previous').click(function(){
	          		if(!$(this).hasClass('disabled')){
	          			$('#sidebar_panes .pane.active').removeClass('active').prev().addClass('active');
	          			$('.sidebar_next').removeClass('disabled');
	          			if($('#sidebar_panes .pane.active').prev().length == 0){
	          				$(this).addClass('disabled');			
	          			}
	          			base.current_pane = $('#sidebar_panes .pane.active').data('type');
	          			$('#sidebar_'+base.current_pane+'_pane').addClass('active');
			          	$('#sidebar header .title').text(base.current_pane.toUpperCase());
			          	$('#sidebar header .header_icon').html(base.icons[base.current_pane]);
	          		}
	          	}).addClass('disabled');
	          	$('.sidebar_next').click(function(){
	          		if(!$(this).hasClass('disabled')){
	          			$('#sidebar_panes .pane.active').removeClass('active').next().addClass('active');
	          			$('.sidebar_previous').removeClass('disabled');
	          			if($('#sidebar_panes .pane.active').next().length == 0){
	          				$(this).addClass('disabled');			
	          			}
	          			base.current_pane = $('#sidebar_panes .pane.active').data('type');
	          			$('#sidebar_'+base.current_pane+'_pane').addClass('active');
			          	$('#sidebar header .title').text(base.current_pane.toUpperCase());
			          	$('#sidebar header .header_icon').html(base.icons[base.current_pane]);
	          		}
	          	});
	          	if($('#sidebar_panes .pane').length < 2){
	          		$('.sidebar_next').addClass('disabled');
	          	}
			}


			
        };

        base.build_paths_pane = function(){
        	base.icons['path'] = '<span class="scalar_path_icon"></span>';
        	var html = '<div class="pane" data-type="path" id="sidebar_path_pane"><ul class="path"><li class="active"><span class="sidebar_icon ';

			switch(currentNode.current.mediaSource.contentType){
				case 'document':
					html += 'ion-document-text';
					break;
			}

			html += '"></span><div class="title">'+currentNode.current.title+'</div></li></ul></div>';

			//Make a jQuery object from the new pane's html - will make appending/prepending easier.
			var new_pane = $(html);

			if(typeof base.queryVars.path != undefined){
				//We're on a path - show 1the current page's siblings, too.
				//First, we need to find the structure of the current path
				for(p in currentNode.incomingRelations){
					var parent = currentNode.incomingRelations[p].body;
					if(parent.slug == base.queryVars.path){
						var before_current = true; //We'll flip this once we come to the current page;
						console.log(parent.outgoingRelations);
						for(r in parent.outgoingRelations){
							var path_step = parent.outgoingRelations[r];
							if(path_step.target.slug == currentNode.slug){
								before_current = false;
							}else{
								//Same as the active page, pretty much.
								var item_html = '<li><span class="sidebar_icon ';
								switch(path_step.target.current.mediaSource.contentType){
									case 'document':
										item_html += 'ion-document-text';
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

					}
				}
			}


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