(function( $ ) {
	
    $.fn.parse = function(options) {
    	var model = $.fn.spreadsheet_model(options);
    	model.parse = parse;
    	model.fetch();
    };
    
	function parse(data) {
		var results = {};
		for (var uri in data) {
			if ('http://scalar.usc.edu/2012/01/scalar-ns#Version'==data[uri]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][0].value) {
				var resource = uri.substr(0, uri.lastIndexOf('.'));
				var thumb = false;
				if ('undefined'!=typeof(data[resource]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'])) {
					thumb = data[resource]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'][0].value;
				}
				results[resource] = data[uri];
				if (thumb) results[resource]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumb}];
			}
		}		
		this.opts.complete_callback(results);
	}    
    
}( jQuery ));