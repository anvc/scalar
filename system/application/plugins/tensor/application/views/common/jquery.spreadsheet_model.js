(function( $ ) {
	
	var defaults = {
    		source: null,
    		content_type: null,
    		page: null,
    		proxy: true,
    		proxy_url: null,
    		error_callback: null,
    		complete_callback: null
	};  	
	
    $.fn.spreadsheet_model = function(options) {
    	
    	var self = this;
    	var opts = $.extend( {}, defaults, options );
    	this.opts = opts;
    	
    	this.parse = function() {alert('You need to override spreadsheet_model\'s parse() method!')}; 
    	
        this.fetch = function(data_type) {
        	if (!opts.proxy) {
        		alert('Non-proxy ajax requests not supported');
        		return;
        	};	
            $.ajax({
                url: opts.proxy_url,
                data: proxy_data(),
                dataType: data_type,
                type: 'GET',
                success: function (data) {
            		parse_store_results(data);
                },
                error: function (jqXHR) {
                	error_callback(jqXHR);
                }
            });        	
        };
        
        var proxy_data = function() {
        	return {
        		handler:(opts.handler)?opts.handler:'',
        		source:(opts.source)?opts.source:'',
        		content_type:(opts.content_type)?opts.content_type:'',
        		parser:(opts.parser)?opts.parser:'',
        		page:(opts.page)?opts.page:'',
        		query:(opts.query)?opts.query:''
        	};
        };
        
        var error_callback = function(jqXHR) {
        	opts.error_callback(jqXHR.status+' '+jqXHR.statusText, opts);  	
        };
        
        var parse_store_results = function(data) {
        	try {
        		var obj = $.parseJSON(data);
            	if ('undefined'!=typeof(obj.error) && obj.error.length) {
            		error_callback({status:'Proxy error:',statusText:obj.error});
            		return;
            	};        		
        	} catch(e) {};
        	self.parse(data, opts);
        }    	

    };
    
}( jQuery ));