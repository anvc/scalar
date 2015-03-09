(function( $ ) {
	
	var defaults = {
			title:'',
			ontologies_url:'',
			data: null,
			ns: null,
			parser_url:'',
			url:''
	};  	
	
    $.fn.add_metadata = function(options) {
    	
    	// Options
    	$('.add_metadata_modal').remove();
    	var $this = $('<div class="add_metadata_modal" style="background-color:#eeeeee;"></div>');
    	var $insert_into = $(this);
    	opts = $.extend( {}, defaults, options );
    	
    	// Ok/cancel
    	opts['buttons'] = [ 
    	  	{ text: "Add selected fields", class: "generic_button default", click: function() { 
    	  		var selected = $(this).find(':checked');
    	  		$.each(selected, function() {
    	  			var val = $(this).attr('name');
    	  			var $insert = $('<tr class="'+val+'"><td class="field">'+val+'</td><td class="value"><input type="text" name="'+val+'" class="input_text" value="" /></td></tr>');
    	  			$insert_into.append($insert);
    	  		});
    	  		$this.dialog('destroy');
    	  		$this.remove();
    	  	} },
    	  	{ text: "Cancel", class: "generic_button", click: function() { $this.dialog( "destroy" ); $this.remove(); } }
    	];
    	
    	// Structure
    	var $div = $('<div>Loading ontologies ...</div>').appendTo($this);

       	// Hand over to jQuery UI
    	opts.width = parseInt($(window).width())*0.7;
    	opts.height = parseInt($(window).height())*0.8;
    	console.log(opts);
    	$this.dialog(opts);
    	
    	// Propagate with ontologies from the RDF config
    	$.getJSON(opts.ontologies_url, function( data ) {
        	$div.empty();
        	for (var prefix in data) {
        		$('<h1>'+prefix+'</h1>').appendTo($div);
        		var $table = $('<table cellspacing="5" style="width:100%;"></table>').appendTo($div);
        		for (var j = 0; j < data[prefix].length; j+=3) {
        			$tr = $('<tr></tr>').appendTo($table);
        			if ('undefined'!=typeof(data[prefix][j])) $('<td><label><input type="checkbox" name="'+prefix+':'+data[prefix][j]+'" value="1" /> '+data[prefix][j]+'</label></td>').appendTo($tr);
        			if ('undefined'!=typeof(data[prefix][j+1])) $('<td><label><input type="checkbox" name="'+prefix+':'+data[prefix][j+1]+'" value="1" /> '+data[prefix][j+1]+'</label></td>').appendTo($tr);
        			if ('undefined'!=typeof(data[prefix][j+2])) $('<td><label><input type="checkbox" name="'+prefix+':'+data[prefix][j+2]+'" value="1" /> '+data[prefix][j+2]+'</label></td>').appendTo($tr);
        		}
        	}
    	});
    	
    };
    
    $.fn.find_and_add_exif_metadata = function(options) {
    	
    	// Options
    	var $insert_into = $(this);
    	opts = $.extend( {}, defaults, options );
    	if ($(opts.button).data('active')) return;
    	$(opts.button).data('active', true);
    	
    	// Get image metadata on the resource
    	$.getJSON(opts.parser_url+'?url='+opts.url, function( data ) {
        	for (var uri in data) break;
        	var metadata = data[uri];
        	if (jQuery.isEmptyObject(metadata)) {
        		alert('No Exif data exists on the file '+opts.url);
        		return;
        	};
        	for (var p in data[uri]) {
        		for (var j = 0; j < data[uri][p].length; j++) {
        			var val = data[uri][p][j].value;
        			var $insert = $('<tr class="'+p+'"><td class="field">'+p+'</td><td class="value"></td></tr>');
        			var $input = $('<input type="text" name="'+p+'" class="input_text">');
        			$input.val(val).appendTo($insert.find('td:last'));
        			$insert_into.append($insert);
        		};
        	};
        	$(opts.button).data('active', false);
    	});
    	
    };   
    
}( jQuery ));