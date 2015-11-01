(function( $ ) {
	
    $.fn.parse = function(options) {
    	var model = new $.fn.spreadsheet_model(options);
    	model.parse = parse;
    	model.fetch('html');
    };
    
	function parse(data, archive) {
		var origin = $('<a>').prop('href', archive.source).prop('origin');
        var matched = data.match(/<body[^>]*>([\w|\W]*)<\/body>/im);
        $body = $('<div>'+matched[1]+'</div>');
        var results = {};
        // Determine placement of fields
        var children = {};
        var pos = 1;
        $body.find('.listItemColumnHeaders:first li').each(function(index) {
        	var field = jQuery.trim($(this).text()).toLowerCase();
        	if (!field.length || -1!=field.indexOf('uncheck')) pos--;
        	children[field] = (index + pos);
        });
        console.log(children);
        // Propagate values
        $body.find('.listItem:not(.listItemColumnHeaders)').each(function() {
        	var $this = $(this);
        	var $link = $this.find('a:first');
        	if (!$link.length) return;
        	var uri =  origin+$link.attr('href');  // TODO: get the URL to the actual file
        	uri = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/SMPTE_Color_Bars.svg/2000px-SMPTE_Color_Bars.svg.png';
        	results[uri] = {};
        	results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation'] = [{type:'uri',value:uri}];
        	results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:uri}];
        	results[uri]['http://purl.org/dc/terms/source'] = [{type:'uri',value:archive.title}];  
        	var thumb = origin+$link.find('img:first').attr('src');
        	results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumb}];      	
        	if ('undefined'!=typeof(children['title'])) {
        		var title = jQuery.trim($this.find('li:nth-child('+children['title']+')').text());
        		if (!title.length) title = '[No title]';
        		results[uri]['http://purl.org/dc/terms/title'] = [{type:'uri',value:title}];
        	}
        	if ('undefined'!=typeof(children['description'])) {
        		var desc = jQuery.trim($this.find('li:nth-child('+children['description']+')').text());
        		results[uri]['http://purl.org/dc/terms/description'] = [{type:'uri',value:desc}];
        	}
        	if ('undefined'!=typeof(children['date'])) {
        		var date = jQuery.trim($this.find('li:nth-child('+children['date']+')').text());
        		results[uri]['http://purl.org/dc/terms/date'] = [{type:'uri',value:date}];
        	}  
        	if ('undefined'!=typeof(children['collection'])) {
        		var collection = jQuery.trim($this.find('li:nth-child('+children['collection']+')').text());
        		results[uri]['http://purl.org/dc/terms/identifier'] = [{type:'uri',value:collection}];
        	}          	
        	if ('undefined'!=typeof(children['subject'])) {
	            var subjects = [];
	            var subject_str = jQuery.trim($this.find('li:nth-child('+children['subject']+')').text());
	            if (subject_str.length) subjects = subject_str.split('--');
	            for (var j in subjects) {
	            	if ('undefined'==typeof(results[uri]['http://purl.org/dc/terms/subject'])) {
	            		results[uri]['http://purl.org/dc/terms/subject'] = [];
	            	}
	            	results[uri]['http://purl.org/dc/terms/subject'].push({type:'literal',value:subjects[j]});
	            }
        	}
        	// TODO: for each row, activiate bt-wrapper
        });
        console.log(results);
        this.opts.complete_callback(results, archive);
	}    
    
}( jQuery ));