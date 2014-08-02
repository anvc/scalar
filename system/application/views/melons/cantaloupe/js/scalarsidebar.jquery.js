(function($){
    $.scalarSidebar = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        
        var container;
        var queryVars;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        
        // Add a reverse reference to the DOM object
        base.$el.data("scalarSidebar", base);
        
        base.init = function(){
            base.options = $.extend({},$.scalarSidebar.defaultOptions, options);
            if(currentNode != null){
				var html = '<div id="sidebar"><ul class="path"><li class="active"><span class="sidebar_icon ';

				switch(currentNode.current.defaultView){
					case 'plain':
						html += 'ion-document-text';
						break;
				}

				html += '"></span><div class="title">'+currentNode.current.title+'</div></li></ul></div>';

	            base.container = $(html).appendTo('body').css('opacity',0).fadeTo('fast',1).hover(function(){
	            	if($(window).width() > 580){
	            		base.triggerSidebar(true);
	            	}
	            },function(){
	            	if($(window).width() > 580){
	            		base.triggerSidebar(false);
	            	}
	            });
			}


			base.queryVars = scalarapi.getQueryVars( document.location.href );
			
            console.log('Init\'d Sidebar Class!');
        };
        
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