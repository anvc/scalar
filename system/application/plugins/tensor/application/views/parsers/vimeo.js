(function( $ ) {
	
    $.fn.parse = function(options) {
    	var model = new $.fn.spreadsheet_model(options);
    	model.parse = parse;
    	model.fetch('json');
    };
    
	function parse(data, archive) {
        var results = {};
        if ('undefined'==typeof(data.body) || 'undefined'==typeof(data.body.data)) {
        	this.opts.complete_callback(results, archive);
        	return;
        }
        for (var j in data.body.data) {
        	var uri = 'http://player.vimeo.com'+data.body.data[j].uri.replace('videos','video');
        	var sourceLocation = data.body.data[j].link;
        	var title = data.body.data[j].name;
        	var description = data.body.data[j].description;
        	var date = data.body.data[j].created_time;
        	var width = data.body.data[j].width.toString();
        	var height = data.body.data[j].height.toString();
        	var thumbnail = ('undefined'!=typeof(data.body.data[j].user.pictures) && data.body.data[j].user.pictures) ? data.body.data[j].user.pictures.sizes[3].link : null;
        	var temporal = data.body.data[j].duration+' seconds';
        	var license = data.body.data[j].license;
        	var creator = data.body.data[j].user.name;
        	var subjects = [];
        	if ('undefined'!=typeof(data.body.data[j].tags) && data.body.data[j].tags) {
	        	for (var k in data.body.data[j].tags) {
	        		if ('undefined'!=typeof(data.body.data[j].tags[k]) && data.body.data[j].tags[k]) {
	        			subjects.push(data.body.data[j].tags[k].name);
	        		}
	        	}
        	}
        	results[uri] = {};
        	results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation'] = [{type:'uri',value:sourceLocation}];
        	results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:uri}];
        	results[uri]['http://purl.org/dc/terms/title'] = [{type:'literal',value:title}];
        	if ('undefined'!=typeof(description) && description) results[uri]['http://purl.org/dc/terms/description'] = [{type:'literal',value:description}];
        	results[uri]['http://purl.org/dc/terms/source'] = [{type:'literal',value:archive.title}];     
        	if ('undefined'!=typeof(date) && date) results[uri]['http://purl.org/dc/terms/date'] = [{type:'literal',value:date}];
        	if ('undefined'!=typeof(width) && width) results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#width'] = [{type:'uri',value:width}];
        	if ('undefined'!=typeof(height) && height) results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#height'] = [{type:'uri',value:height}];
        	if ('undefined'!=typeof(thumbnail) && thumbnail) results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumbnail}];
        	if ('undefined'!=typeof(temporal) && temporal) results[uri]['http://purl.org/dc/terms/temporal'] = [{type:'literal',value:temporal}];
        	if ('undefined'!=typeof(license) && license) results[uri]['http://purl.org/dc/terms/license'] = [{type:'literal',value:license}];
        	if ('undefined'!=typeof(creator) && creator) results[uri]['http://purl.org/dc/terms/creator'] = [{type:'literal',value:creator}];
        	for (var k in subjects) {
        		if ('undefined'==typeof(results[uri]['http://purl.org/dc/terms/subject'])) {
        			results[uri]['http://purl.org/dc/terms/subject'] = [];
        		}
        		results[uri]['http://purl.org/dc/terms/subject'].push({type:'literal',value:subjects[k]});
        	}
        };
        console.log(results);
        this.opts.complete_callback(results, archive);
	};
    
}( jQuery ));