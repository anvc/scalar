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
        	var sourceLocation = origin+$link.attr('href');  
        	// URI GET values
        	var collection = $link.attr('itemcoll');
        	var id = $link.attr('item_id');
        	var scale = 30;
        	var width = 10000;  // some large amount ... the incoming image will be whatever size it comes in as
        	var height = 10000;  // some large amount ... the incoming image will be whatever size it comes in as
        	//var uri = origin+"/utils/ajaxhelper/?CISOROOT="+collection+"&CISOPTR="+id+"&action=2&DMSCALE="+scale+"&DMWIDTH="+width+"&DMHEIGHT="+height+"&DMX=0&DMY=0&DMROTATE=0";
        	var uri = origin+"/utils/ajaxhelper/?CISOROOT="+collection+"&CISOPTR="+id+"&action=2&DMSCALE="+scale+"&DMWIDTH="+width+"&DMHEIGHT="+height+"&DMX=0&DMY=0&DMTEXT=&DMROTATE=0";
        	//var uri = origin+'/cdm/singleitem/collection'+collection+'/id/'+id+'/rec/2';
        	//var temp_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/SMPTE_Color_Bars.svg/2000px-SMPTE_Color_Bars.svg.png';
        	var temp_url = 'Loading ...';
        	results[uri] = {
        		'http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail':[{type:'uri',value:origin+$link.find('img:first').attr('src')}],
        		'http://simile.mit.edu/2003/10/ontologies/artstor#url':[{type:'uri',value:temp_url}],
        		'http://purl.org/dc/terms/title':[{type:'literal',value:jQuery.trim($this.find('a:last').text())}],
        		'http://purl.org/dc/terms/source':[{type:'literal',value:archive.title}],
        		'http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation':[{type:'uri',value:sourceLocation}],
        	};
        });
        console.log(results);
        this.opts.complete_callback(results, archive);
        // Get the URL by a seperate request to CONTENTdm
        $( document ).off( ".geturl" );
        $( document ).on( "click.geturl", "#search_spreadsheet_content .row", function() {
        	 var $row = $(this);
        	 var uri = $row.data('uri');
        	 var values = $row.data('values');
        	 var url = values['http://simile.mit.edu/2003/10/ontologies/artstor#url'][0].value;
        	 // Make sure we don't do this twice
        	 if (url != 'Loading ...') return;
        	 values['http://simile.mit.edu/2003/10/ontologies/artstor#url'][0].value = 'Loading ....';
        	 $row.data('values',values);
        	 // Get collection and ID
        	 var collection = uri.substr( uri.indexOf('CISOROOT=')+9 );  // has a slash
        	 collection  = collection.substr( 0, collection.indexOf('&CISOPTR=') );
        	 console.log('collection: '+collection);
        	 var id = uri.substr( uri.indexOf('CISOPTR=')+8 );
        	 id  = id.substr( 0, id.indexOf('&action') );
        	 console.log('id: '+id);        	
        	 // Get the HTML page
        	 var page = origin+'/cdm/singleitem/collection'+collection+'/id/'+id+'/rec/2';
        	 $.ajax({
        		 dataType: 'html',
        		 url: $('#base_url').attr('href')+'wb/simple_proxy?url='+page,
        		 success: function(data) {
        		 	var js = data.substr( data.indexOf('var cdm_selected_lang') );
        		 	js = js.substr( 0, js.indexOf('</script>') );
        		 	console.log(js);
        		 	eval(js);  // Breaking all of the rules here
        		 	var new_title = thisImageInfo.imageinfo.title;
        		 	if ('undefined'!=typeof(thisImageInfo.imageinfo.title[0])) new_title = thisImageInfo.imageinfo.title[0];        		 	
        		 	var new_url  = origin+'/utils/getdownloaditem/collection'+collection+'/id/'+id;
        		 		new_url += '/type/singleitem/filename/'+thisImageInfo.imageinfo.filename[0];
        		 		new_url += '/width/'+thisImageInfo.imageinfo.width+'/height/'+thisImageInfo.imageinfo.height;
        		 		new_url += '/mapsto/image/';
        		 		new_url += '/title/'+new_title+'/size/large';
        		 	values['http://simile.mit.edu/2003/10/ontologies/artstor#url'][0].value = new_url;
        		 	$row.data('values',values);
        		 	// Set imported and in collections
        			var imported = storage.get('imported');
        			if ('undefined'==typeof(imported)) imported = {};
        			if ('undefined'!=typeof(imported[uri])) imported[uri] = values;
        			storage.set('imported', imported);		
        			var collections = storage.get('collections');
        			if ('undefined'==typeof(collections)) collections = {};
        			for (var col_id in collections) {
        				if ('undefined'!=typeof(collections[col_id].items[uri])) {
        					collections[col_id].items[uri] = values;
        				}
        			}
        			storage.set('collections', collections);
        	 	 }
        	 });       	 
        });
	}    
    
}( jQuery ));