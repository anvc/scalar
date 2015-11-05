(function( $ ) {
	
    $.fn.parse = function(options) {
    	var model = new $.fn.spreadsheet_model(options);
    	model.parse = parse;
    	model.fetch('xml');
    };
    
	function parse(data, archive) {
        var results = {};
        $(data).find('item').each(function() {
        	var sourceLocation = this.attributes['rdf:about'].value;
        	var obj;
        	obj = this.getElementsByTagName('link');
        	var uri = ('undefined'!=obj[0]) ? obj[0].childNodes[0].nodeValue : '';
        	if (!uri.length) return;
        	// TODO: URI is None/None
        	obj = this.getElementsByTagName('title');
        	var title = ('undefined'!=typeof(obj[0]) && 'undefined'!=typeof(obj[0].childNodes[0])) ? obj[0].childNodes[0].nodeValue : '';
        	obj = this.getElementsByTagName('description');
        	var desc = ('undefined'!=typeof(obj[0]) && 'undefined'!=typeof(obj[0].childNodes[0])) ? obj[0].childNodes[0].nodeValue : '';
        	obj = this.getElementsByTagNameNS("http://purl.org/dc/terms/", "date");        	
        	var date = ('undefined'!=typeof(obj[0]) && 'undefined'!=typeof(obj[0].childNodes[0])) ? obj[0].childNodes[0].nodeValue : '';
        	obj = this.getElementsByTagNameNS("http://purl.org/dc/terms/", "creator");
        	var creator = ('undefined'!=typeof(obj[0]) && 'undefined'!=typeof(obj[0].childNodes[0])) ? obj[0].childNodes[0].nodeValue : '';
        	obj = this.getElementsByTagNameNS("http://purl.org/dc/terms/", "publisher");
        	var publisher = ('undefined'!=typeof(obj[0]) && 'undefined'!=typeof(obj[0].childNodes[0])) ? obj[0].childNodes[0].nodeValue : ''; 
        	obj = this.getElementsByTagNameNS("http://purl.org/dc/terms/", "rights");
        	var rights = ('undefined'!=typeof(obj[0]) && 'undefined'!=typeof(obj[0].childNodes[0])) ? obj[0].childNodes[0].nodeValue : '';
        	obj = this.getElementsByTagNameNS("http://purl.org/dc/terms/", "type");
        	var type = ('undefined'!=typeof(obj[0]) && 'undefined'!=typeof(obj[0].childNodes[0])) ? obj[0].childNodes[0].nodeValue : '';         	
        	obj = this.getElementsByTagNameNS("http://simile.mit.edu/2003/10/ontologies/artstor#", "thumbnail");
        	var thumb = ('undefined'!=typeof(obj[0]) && 'undefined'!=typeof(obj[0].childNodes[0])) ? obj[0].attributes['url'].value : '';          	
        	results[uri] = {
        		'http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail':[{type:'uri',value:thumb}],
        		'http://purl.org/dc/terms/title':[{type:'literal',value:title}],
        		'http://purl.org/dc/terms/description':[{type:'literal',value:desc}],
        		'http://purl.org/dc/terms/source':[{type:'literal',value:archive.title}],
        		'http://purl.org/dc/terms/date':[{type:'literal',value:date}],
        		'http://purl.org/dc/terms/creator':[{type:'literal',value:creator}],
        		'http://purl.org/dc/terms/publisher':[{type:'literal',value:publisher}],
        		'http://purl.org/dc/terms/rights':[{type:'literal',value:rights}],
        		'http://purl.org/dc/terms/type':[{type:'literal',value:type}],
        		'http://simile.mit.edu/2003/10/ontologies/artstor#url':[{type:'uri',value:uri}],
        		'http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation':[{type:'uri',value:sourceLocation}],
        	};
        });
        console.log(results);
        this.opts.complete_callback(results, archive);
	};
    
}( jQuery ));