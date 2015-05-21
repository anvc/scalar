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
    	
    	$('.add_metadata_modal, .add_metadata_bootbox').remove();
    	var $this = $('<div class="add_metadata_modal"></div>');
    	var $insert_into = $(this);
    	opts = $.extend( {}, defaults, options );
    	var $div = $('<div>Loading ontologies ...</div>').appendTo($this);

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
	    	opts.width = parseInt($(window).width())*0.7;
	    	opts.height = parseInt($(window).height())*0.8;
	    	opts.modal = true;			
			$this.dialog(opts);
		} else if ('undefined'!=typeof($.fn.modal)) {  // Bootstrap
	    	opts.width = parseInt($(window).width())*0.7;
	    	opts.height = parseInt($(window).height())*0.6;			
			bootbox.dialog({
				message: '<div id="bootbox-content"></div>',
				title: opts.title+'&nbsp; (<span class="title-links"></span>)',
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
                                $insert = $('<div class="form-group '+val+'"><label class="col-sm-3 control-label">'+val+'</label><div class="col-sm-9"><input type="text" name="'+val+'" class="form-control" value="" /></div></div>');
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
			$('.add_metadata_bootbox .modal-dialog').width(opts.width);
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
        	for (var prefix in data) {
        		$('<h1 name="'+prefix+'">'+prefix+'</h1>').appendTo($div);
        		title_links.push('<a href="javascript:void(null);">'+prefix+'</a>');
        		var $table = $('<table cellspacing="5" style="width:100%;"></table>').appendTo($div);
        		for (var j = 0; j < data[prefix].length; j+=3) {
        			$tr = $('<tr></tr>').appendTo($table);
        			if ('undefined'!=typeof(data[prefix][j])) $('<td><label><input type="checkbox" name="'+prefix+':'+data[prefix][j]+'" value="1" /> '+data[prefix][j]+'</label></td>').appendTo($tr);
        			if ('undefined'!=typeof(data[prefix][j+1])) $('<td><label><input type="checkbox" name="'+prefix+':'+data[prefix][j+1]+'" value="1" /> '+data[prefix][j+1]+'</label></td>').appendTo($tr);
        			if ('undefined'!=typeof(data[prefix][j+2])) $('<td><label><input type="checkbox" name="'+prefix+':'+data[prefix][j+2]+'" value="1" /> '+data[prefix][j+2]+'</label></td>').appendTo($tr);
        		}
        	}
        	if (has_title_links) {
        		$title_links.append(title_links.join(', '));
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
        		alert('No Exif data exists on the file '+opts.url);
        		return;
        	};
        	for (var p in data[uri]) {
        		for (var j = 0; j < data[uri][p].length; j++) {
        			var val = data[uri][p][j].value;
                    var $insert;
                    if ( $( 'article' ).length ) { // if cantaloupe
                        $insert = $('<div class="form-group '+val+'"><label class="col-sm-3 control-label">'+val+'</label><div class="col-sm-9"></div></div>');
                    } else {
           			    $insert = $('<tr class="'+p+'"><td class="field">'+p+'</td><td class="value"></td></tr>');
                    }
        			$input.val(val).appendTo($insert.find('div:last'));
        			$insert_into.append($insert);
        		};
        	};
        	$(opts.button).data('active', false);
    	});
    	
    };   
    
}( jQuery ));