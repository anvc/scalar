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
        $body.find('.listItem:not(.listItemColumnHeaders)').each(function() {
        	var $this = $(this);
        	var $link = $this.find('a:first');
        	if (!$link.length) return;
        	var sourceLocation = origin+$link.attr('href');  // TODO: get the URL to the actual file
        	// URI GET values
        	var collection = $link.attr('itemcoll');
        	var id = $link.attr('item_id');
        	var scale = 30;
        	var width = 10000;  // some large amount ... the incoming image will be whatever size it comes in as
        	var height = 10000;  // some large amount ... the incoming image will be whatever size it comes in as
        	var uri = origin+"/utils/ajaxhelper/?CISOROOT="+collection+"&CISOPTR="+id+"&action=2&DMSCALE="+scale+"&DMWIDTH="+width+"&DMHEIGHT="+height+"&DMX=0&DMY=0&DMROTATE=0";
        	uri = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/SMPTE_Color_Bars.svg/2000px-SMPTE_Color_Bars.svg.png';
        	results[uri] = {
        		'http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail':[{type:'uri',value:origin+$link.find('img:first').attr('src')}],
        		'http://simile.mit.edu/2003/10/ontologies/artstor#url':[{type:'uri',value:uri}],
        		'http://purl.org/dc/terms/title':[{type:'literal',value:jQuery.trim($this.find('a:last').text())}],
        		'http://purl.org/dc/terms/source':[{type:'literal',value:archive.title}],
        		'http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation':[{type:'uri',value:sourceLocation}],
        	};
        	// TODO: for each row, activiate bt-wrapper
        });
        console.log(results);
        this.opts.complete_callback(results, archive);
	}    
    
}( jQuery ));