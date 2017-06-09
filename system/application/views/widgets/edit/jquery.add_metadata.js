(function( $ ) {
	
	var defaults = {
			title:'',
			ontologies_url:'',
			data: null,
			ns: null,
			parser_url:'',
			url:'',
			row_class:'',
			input_class:''
	};  	
	
    $.fn.add_metadata = function(options) {
    	
    	$('.add_metadata_modal, .add_metadata_bootbox').remove();
    	var $this = $('<div class="add_metadata_modal"></div>');
    	var $insert_into = $(this);
    	opts = $.extend( {}, defaults, options );
    	var $div = $('<div>Loading ontologies ...</div>').appendTo($this);
    	var bootstrap_enabled = false;

		if ('undefined'!=typeof($.fn.dialog)) {  // jQuery UI
	    	opts['buttons'] = [ 
	    	           	    { text: "Cancel", class: "generic_button", click: function() { $this.dialog( "destroy" ); $this.remove(); } },
	    	           	  	{ text: "Add selected fields", class: "generic_button default", click: function() { 
	    	           	  		var selected = $(this).find(':checked');
	    	           	  		$.each(selected, function() {
	    	           	  			var val = $(this).attr('name');
	    	           	  			var $insert = $('<tr class="'+val+'"><td class="field">'+val+'</td><td class="value"><input type="text" name="'+val+'" class="input_text" value="" /></td></tr>');
	    	           	  			$insert_into.append($insert);
	    	           	  		});
	    	           	  		$this.dialog('destroy');
	    	           	  		$this.remove();
	    	           	  	} }
	    	           	];			
	    	opts.width = parseInt($(window).width())*0.8;
	    	opts.height = parseInt($(window).height())*0.8;
	    	opts.modal = true;	
			$this.dialog(opts);
		} else if ('undefined'!=typeof($.fn.modal)) {  // Bootstrap
			bootstrap_enabled = true;
	    	opts.width = parseInt($(window).width())*0.7;
	    	opts.height = parseInt($(window).height())*0.6;			
			bootbox.dialog({
				message: '<div id="bootbox-content"></div>',
				title: opts.title+'&nbsp; &nbsp; <span class="title-links" style="white-space:nowrap;"></span>',
				animate: true,
				className: 'add_metadata_bootbox',
				buttons: {
				    cancel: {
				      label: "Cancel",
				      className: "btn-default",
				      callback: function() {
						$('.add_metadata_bootbox').modal('hide').data('bs.modal', null);  
				      }
				    },
				    add: {
				      label: "Add fields",
				      className: "btn-primary",
				      callback: function() {
				    	var $content = $('.add_metadata_bootbox #bootbox-content:first');
		    	  		var selected = $content.find('input:checked');
		    	  		$.each(selected, function() {
		    	  			var val = $(this).attr('name');
                            var $insert;
                            if ($insert_into.is('ul') || $insert_into.is('ol')) { // scalarimport
                            	$insert = $('<li><span class="field">'+val+'</span><span class="value"><input type="text" name="'+val+'" value="" /></span></li>');
                            } else if ( $( 'article' ).length ) { // cantaloupe
                                $insert = $('<div class="form-group '+val+' '+((opts.row_class.length)?opts.row_class:'')+'"><label class="col-sm-3 control-label">'+val+'</label><div class="col-sm-9"><input type="text" name="'+val+'" class="form-control '+((opts.input_class.length)?opts.input_class:'')+'" value="" /></div></div>');
                            } else {  // honeydew
                                $insert = $('<tr class="'+val+'"><td class="field">'+val+'</td><td class="value"><input type="text" name="'+val+'" class="form-control" value="" /></td></tr>');
                            }
		    	  			$insert_into.append($insert);
		    	  		});
		    	  		$('.add_metadata_bootbox').modal('hide').data('bs.modal', null);  
				      }
				    },
				}				
			});
			$this.appendTo($('.add_metadata_bootbox #bootbox-content'));
			$('.add_metadata_bootbox .modal-dialog').width('auto').css('margin-left','20px').css('margin-right','20px');
            $('.add_metadata_bootbox .bootbox-close-button').empty();
			$('.add_metadata_bootbox .add_metadata_modal').height(opts.height).css('overflow', 'auto');
			$('.add_metadata_bootbox').css('z-index', '1070');
			$('.add_metadata_bootbox').next().css('z-index', '1060');
		} else {
			alert('Could not find a modal/dialog library');
		}
    	
    	$.getJSON(opts.ontologies_url, function( data ) {  // Propagate with ontologies from the RDF config
        	$div.empty();
        	var $title_links = $('.add_metadata_bootbox .title-links');
        	var has_title_links = ($title_links.length) ? true : false;
        	var title_links = [];
        	// Featured
        	$('<h1 name="featured">Featured &nbsp; <small>Fields that have special uses in Scalar\'s interface</small></h1>').appendTo($div);
        	title_links.push('<a href="javascript:void(null);">Featured</a>');
        	var $content = $('<div></div>').appendTo($div);
        	var featured = ['dcterms:source','iptc:By-line','dcterms:coverage','dcterms:spatial','dcterms:temporal','dcterms:date'];
    		for (var j = 0; j < featured.length; j+=3) {
    			var $row = $('<div class="row"></div>').appendTo($content);
    			if ('undefined'!=typeof(featured[j])) $('<div class="cell col-xs-12 col-sm-4"><label><input type="checkbox" name="'+featured[j]+'" value="1" /> '+featured[j]+'</label></div>').appendTo($row);
    			if ('undefined'!=typeof(featured[j+1])) $('<div class="cell col-xs-12 col-sm-4"><label><input type="checkbox" name="'+featured[j+1]+'" value="1" /> '+featured[j+1]+'</label></div>').appendTo($row);
    			if ('undefined'!=typeof(featured[j+2])) $('<div class="cell col-xs-12 col-sm-4"><label><input type="checkbox" name="'+featured[j+2]+'" value="1" /> '+featured[j+2]+'</label></div>').appendTo($row);
    		}
    		// Hard-coded descriptions for certain ontology prefixes
    		var descriptions = {
    			'dcterms':'Dublin Core terms',
    			'art': 'ARTstore terms',
    			'iptc': 'Photo metadata',
    			'bibo': 'Bibliographic Ontology Specification',
    			'id3': 'MP3 de facto metadata standard'
    		};
        	// Ontologies
        	for (var prefix in data) {
        		var $header = $('<h1 name="'+prefix+'">'+prefix+' &nbsp; </h1>').appendTo($div);
        		if ('undefined'!=typeof(descriptions[prefix])) $header.append('<small>'+descriptions[prefix]+'</small>'); 
        		title_links.push('<a href="javascript:void(null);">'+prefix+'</a>');
        		var $content = $('<div></div>').appendTo($div);
        		for (var j = 0; j < data[prefix].length; j+=3) {
        			var $row = $('<div class="row"></div>').appendTo($content);
        			if ('undefined'!=typeof(data[prefix][j])) $('<div class="cell col-xs-12 col-sm-4"><label><input type="checkbox" name="'+prefix+':'+data[prefix][j]+'" value="1" /> '+data[prefix][j]+'</label></div>').appendTo($row);
        			if ('undefined'!=typeof(data[prefix][j+1])) $('<div class="cell col-xs-12 col-sm-4"><label><input type="checkbox" name="'+prefix+':'+data[prefix][j+1]+'" value="1" /> '+data[prefix][j+1]+'</label></div>').appendTo($row);
        			if ('undefined'!=typeof(data[prefix][j+2])) $('<div class="cell col-xs-12 col-sm-4"><label><input type="checkbox" name="'+prefix+':'+data[prefix][j+2]+'" value="1" /> '+data[prefix][j+2]+'</label></div>').appendTo($row);
        		}
            	if (!bootstrap_enabled) {
            		$content.css('display','table').css('width','100%');
            		$content.children('.row').css('display','table-row');
            		$content.find('.cell').css('display','table-cell').css('padding-top','3px').css('padding-bottom','3px');
            	}
        	}
        	if (has_title_links) {
        		$title_links.append(title_links.join('&nbsp; '));
    			$('.add_metadata_bootbox .title-links').find('a').click(function() {
    				var name = $(this).text().toLowerCase();
    				var $content = $('.add_metadata_bootbox .add_metadata_modal');
    				$content.scrollTop(0);
    				var top = $content.find('[name="'+name+'"]').position().top;
    				$content.scrollTop(top-20); // Magic number
    			});        		
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
        		alert('No IPTC or ID3 metadata appears to exist in the file '+opts.url);
        		return;
        	};
        	for (var p in data[uri]) {
        		for (var j = 0; j < data[uri][p].length; j++) {
        			var val = data[uri][p][j].value;
                    var $insert;
                    var $input = $('<input type="text" name="'+p+'" class="input_text form-control">');
                    if ( $( 'article' ).length ) { // if cantaloupe
                        $insert = $('<div class="form-group '+p+'"><label class="col-sm-3 control-label">'+p+'</label><div class="col-sm-9"></div></div>');
                        $input.val(val).appendTo($insert.find('div:last'));
                    } else {
           			    $insert = $('<tr class="'+p+'"><td class="field">'+p+'</td><td class="value"></td></tr>');
           			    $input.val(val).appendTo($insert.find('td:last'));
                    }
        			$insert_into.append($insert);
        		};
        	};
        	$(opts.button).data('active', false);
    	});
    	
    };   
    
}( jQuery ));