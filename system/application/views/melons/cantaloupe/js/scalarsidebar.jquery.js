(function($){
    $.scalarSidebar = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        
        // Add a reverse reference to the DOM object
        base.$el.data("scalarSidebar", base);
        
        base.init = function(){
            base.options = $.extend({},$.scalarSidebar.defaultOptions, options);
            
            console.log('Init\'d Sidebar Class!');
        };
        
        // Sample Function, Uncomment to use
        // base.functionName = function(paramaters){
        // 
        // };
        
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