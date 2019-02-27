(function( $ ) {
	
	var defaults = {
			title:'',
			ontologies_url:'',
			data: null,
			ns: null,
			parser_url:'',
			url:'',
			row_class:'',
			input_class:'',
			tklabels:null,
			active: 'featured',
			active_only: false,
			scope: 'book',
			add_fields_btn_text: 'Add fields',
			callback: null,
			show_featured: true
	};  	
	
    $.fn.add_metadata = function(options) {
    	
    	$('.add_metadata_modal, .add_metadata_bootbox').remove();
    	var $this = $('<div class="add_metadata_modal"></div>');
    	var $insert_into = $(this);
    	opts = $.extend( {}, defaults, options );
    	var $div = $('<div>Loading ontologies ...</div>').appendTo($this);
    	var bootstrap_enabled = false;
    	var can_localstorage = 'localStorage' in window && window['localStorage'] !== null;

		if ('undefined'!=typeof($.fn.dialog)) {  // jQuery UI
	    	opts['buttons'] = [ 
	    	           	    { text: "Cancel", class: "generic_button", click: function() { $this.dialog( "destroy" ); $this.remove(); } },
	    	           	  	{ text: opts.add_fields_btn_text, class: "generic_button default", click: function() { 
	    	           	  		var selected = $(this).find(':checked');
	    	           	  		$.each(selected, function() {
	    	           	  			var val = $(this).attr('name');
	    	           	  			var input_val = ($(this).attr('value') != '1') ? $(this).attr('value') : '';
	    	           	  			var $insert = $('<tr class="'+val+'"><td class="field">'+val+'</td><td class="value"><input type="text" name="'+val+'" class="input_text" value="'+input_val+'" /></td></tr>');
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
	    	opts.height = parseInt($(window).height())*0.7;			
			bootbox.dialog({
				message: '<div id="bootbox-content"></div>',
				title: opts.title,
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
				      label: opts.add_fields_btn_text,
				      className: "btn-primary",
				      callback: function() {
				    	var $content = $('.add_metadata_bootbox #bootbox-content:first');
		    	  		var selected = $content.find('input:checked');
		    	  		$.each(selected, function() {
		    	  			var val = $(this).attr('name');
		    	  			var input_val = ($(this).attr('value') != '1') ? $(this).attr('value') : '';
                            var $insert;
                            if ($insert_into.is('ul') || $insert_into.is('ol')) { // scalarimport
                            	$insert = $('<li><span class="field">'+val+'</span><span class="value"><input type="text" name="'+val+'" value="'+input_val+'" /></span></li>');
                            } else if ( $( 'article' ).length || $('#set_profiles').length ) { // cantaloupe & tensor
                                $insert = $('<div class="form-group '+val+' '+((opts.row_class.length)?opts.row_class:'')+'"><label class="col-sm-3 control-label">'+val+'</label><div class="col-sm-9"><input type="text" name="'+val+'" '+(($('#set_profiles').length)?'id="'+val+'"':'')+' class="form-control '+((opts.input_class.length)?opts.input_class:'')+'" value="'+input_val+'" /></div></div>');
                            } else {  // honeydew
                                $insert = $('<tr class="'+val+'"><td class="field">'+val+'</td><td class="value"><input type="text" name="'+val+'" class="form-control" value="'+input_val+'" /></td></tr>');
                            }
		    	  			$insert_into.append($insert);
		    	  		});
		    	  		$('.add_metadata_bootbox').modal('hide').data('bs.modal', null);  
		    	  		if (null !== opts.callback) opts.callback();
				      }
				    },
				}				
			});
			$this.appendTo($('.add_metadata_bootbox #bootbox-content'));
			$('.add_metadata_bootbox .modal-dialog').width('auto').css('margin-left','20px').css('margin-right','20px');
            $('.add_metadata_bootbox .bootbox-close-button').empty();
			$('.add_metadata_bootbox .add_metadata_modal').height(opts.height).css('overflow-y', 'auto').css('overflow-x','hidden');
			$('.add_metadata_bootbox').css('z-index', '1070');
			$('.add_metadata_bootbox').next().css('z-index', '1060');
		} else {
			alert('Could not find a modal/dialog library');
		}
    	
    	$.getJSON(opts.ontologies_url, function( data ) {  // Propagate with ontologies from the RDF config
        	$div.empty();
        	$div.append('<div style="font-size:16px;margin-bottom:25px;"><span style="float:left;padding:6px 12px 0px 0px">Select a field set:</span><div class="btn-group title-links"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="font-size:16px;"><span class="title" style="display:inline-block;min-width:110px;text-align:left;"></span> &nbsp; <span class="caret"></span></button><ul class="dropdown-menu"></div></div>');
        	var $title_links = $div.find('.title-links');
        	var $title_links_btn = $title_links.find('button:first');
        	var $title_links_list = $title_links.find('ul:first');
        	// Featured
        	if (opts.show_featured) {
	        	$('<div name="featured" class="description">Fields that have special uses in Scalar\'s interface, layouts, and widgets:</div>').appendTo($div);
	        	var $content = $('<div></div>').appendTo($div);
	        	var featured = ['dcterms:source','iptc:By-line','dcterms:coverage','dcterms:spatial','dcterms:temporal','dcterms:date'];
	    		for (var j = 0; j < featured.length; j+=3) {
	    			var $row = $('<div class="row"></div>').appendTo($content);
	    			if ('undefined'!=typeof(featured[j])) $('<div class="cell col-xs-12 col-sm-4"><label><input type="checkbox" name="'+featured[j]+'" value="1" />&nbsp; '+featured[j]+'</label></div>').appendTo($row);
	    			if ('undefined'!=typeof(featured[j+1])) $('<div class="cell col-xs-12 col-sm-4"><label><input type="checkbox" name="'+featured[j+1]+'" value="1" />&nbsp; '+featured[j+1]+'</label></div>').appendTo($row);
	    			if ('undefined'!=typeof(featured[j+2])) $('<div class="cell col-xs-12 col-sm-4"><label><input type="checkbox" name="'+featured[j+2]+'" value="1" />&nbsp; '+featured[j+2]+'</label></div>').appendTo($row);
	    		}
	    		$title_links_btn.children('.title').text('Featured fields');
	    		$title_links_list.append('<li><a href="javascript:void(null);" name="featured">Featured fields</a></li>');
        	};
    		// Hard-coded descriptions for certain ontology prefixes
    		var descriptions = {
    			'dcterms':{'short':'Dublin Core','long':'Dublin Core terms'},
    			'art': {'short':'ARTstor','long':'ARTstor terms'},
    			'iptc': {'short':'IPTC','long':'Photo metadata'},
    			'bibo': {'short':'BIBO','long':'Bibliographic Ontology Specification'},
    			'id3': {'short':'ID3','long':'MP3 de facto metadata standard'},
    			'dwc': {'short':'Darwin Core','long':'Darwin Core terms'},
    			'vra': {'short':'VRA Ontology','long':'VRA Ontology representing entities in the VRA data model'},
    			'cp': {'short':'CommonPlace','long':'Terms for describing publications'},
    			'tk': {'short':'TK Labels','long':'Traditional Knowledge labels'}
    		};
        	// Ontologies
        	for (var prefix in data) {
        		if ('undefined' != typeof(descriptions[prefix])) {
        			var $header = $('<div name="'+prefix+'" class="description">'+descriptions[prefix].long+':</div>').appendTo($div); 
        			$title_links_list.append('<li><a href="javascript:void(null);" name="'+prefix+'">'+descriptions[prefix].short+'</a></li>');
        		} else {
        			var $header = $('<div name="'+prefix+'" class="description">'+prefix+'</div>').appendTo($div); 
        			$title_links_list.append('<li><a href="javascript:void(null);" name="'+prefix+'">'+prefix+'</a></li>');        			
        		}
        		var $content = $('<div></div>').appendTo($div);
        		for (var j = 0; j < data[prefix].length; j+=3) {
        			var $row = $('<div class="row"></div>').appendTo($content);
        			if ('undefined'!=typeof(data[prefix][j])) $('<div class="cell col-xs-12 col-sm-4"><label><input type="checkbox" name="'+prefix+':'+data[prefix][j]+'" value="1" />&nbsp; '+data[prefix][j]+'</label></div>').appendTo($row);
        			if ('undefined'!=typeof(data[prefix][j+1])) $('<div class="cell col-xs-12 col-sm-4"><label><input type="checkbox" name="'+prefix+':'+data[prefix][j+1]+'" value="1" />&nbsp; '+data[prefix][j+1]+'</label></div>').appendTo($row);
        			if ('undefined'!=typeof(data[prefix][j+2])) $('<div class="cell col-xs-12 col-sm-4"><label><input type="checkbox" name="'+prefix+':'+data[prefix][j+2]+'" value="1" />&nbsp; '+data[prefix][j+2]+'</label></div>').appendTo($row);
        		}
            	if (!bootstrap_enabled) {
            		$content.css('display','table').css('width','100%');
            		$content.children('.row').css('display','table-row');
            		$content.find('.cell').css('display','table-cell').css('padding-top','3px').css('padding-bottom','3px');
            	}
        	}
        	// TK Labels
        	if (opts.tklabels && 'undefined' != typeof(opts.tklabels.labels)) {
        		var prefix = 'tk';
        		var $header = $('<div name="'+prefix+'" class="description">Traditional Knowledge (TK) Labels available for use in this '+opts.scope+':</div>').appendTo($div);
        		$title_links_list.append('<li><a href="javascript:void(null);" name="'+prefix+'">TK Labels</a></li>');
        		var $content = $('<div></div>').appendTo($div);
        		for (var j = 0; j < opts.tklabels.labels.length; j+=3) {
        			var $row = $('<div class="row"></div>').appendTo($content);
        			if ('undefined'!=typeof(opts.tklabels.labels[j])) $('<div class="cell col-xs-12 col-sm-4" style="padding-bottom:12px;"><label><input type="checkbox" name="'+prefix+':hasLabel" value="'+prefix+':'+opts.tklabels.labels[j].code+'" /><img src="'+opts.tklabels.labels[j].image+'" style="height:40px;vertical-align:middle;margin-left:12px;margin-bottom:6px;" /><br /><span style="padding-left:24px;">'+opts.tklabels.labels[j].title+'</span><br /><small style="display:inline-block;margin-left:24px;line-height:1.35;">'+(('undefined'!=typeof(opts.tklabels.labels[j].text.property2))?opts.tklabels.labels[j].text.property2.description:'')+'</small></label></div>').appendTo($row);
        			if ('undefined'!=typeof(opts.tklabels.labels[j+1])) $('<div class="cell col-xs-12 col-sm-4" style="padding-bottom:12px;"><label><input type="checkbox" name="'+prefix+':hasLabel" value="'+prefix+':'+opts.tklabels.labels[j+1].code+'" /><img src="'+opts.tklabels.labels[j+1].image+'" style="height:40px;vertical-align:middle;margin-left:12px;margin-bottom:6px;" /><br /><span style="padding-left:24px;">'+opts.tklabels.labels[j+1].title+'</span><br /><small style="display:inline-block;margin-left:24px;line-height:1.35;">'+(('undefined'!=typeof(opts.tklabels.labels[j].text.property2))?opts.tklabels.labels[j].text.property2.description:'')+'</small></label></div>').appendTo($row);
        			if ('undefined'!=typeof(opts.tklabels.labels[j+2])) $('<div class="cell col-xs-12 col-sm-4" style="padding-bottom:12px;"><label><input type="checkbox" name="'+prefix+':hasLabel" value="'+prefix+':'+opts.tklabels.labels[j+2].code+'" /><img src="'+opts.tklabels.labels[j+2].image+'" style="height:40px;vertical-align:middle;margin-left:12px;margin-bottom:6px;" /><br /><span style="padding-left:24px;">'+opts.tklabels.labels[j+2].title+'</span><br /><small style="display:inline-block;margin-left:24px;line-height:1.35;">'+(('undefined'!=typeof(opts.tklabels.labels[j].text.property2))?opts.tklabels.labels[j].text.property2.description:'')+'</small></label></div>').appendTo($row);
        		}
            	if (!bootstrap_enabled) {
            		$content.css('display','table').css('width','100%');
            		$content.children('.row').css('display','table-row');
            		$content.find('.cell').css('display','table-cell').css('padding-top','3px').css('padding-bottom','3px');
            	}
        	}
        	// Selector actions
        	$div.find('.description').each(function() {
        		var $this = $(this);
        		$this.css('margin-bottom','15px');
        		if (opts.active != $this.attr('name')) $this.hide().next().hide();
        	});
        	$title_links_list.find('a[name="'+opts.active+'"]').parent().addClass('active');
        	$title_links_btn.find('.title').text( $title_links_list.find('a[name="'+opts.active+'"]').text() );
        	if (true == opts.active_only) $div.children().first().hide();
        	$title_links.find('a').click(function() {
        		var $this = $(this);
        		$this.closest('ul').find('.active').removeClass('active');
        		$this.parent().addClass('active');
        		var name = $this.attr('name');
            	$div.find('.description').each(function() {
            		var $this = $(this);
            		$this.hide().next().hide();
            	});
            	$div.find('.description[name="'+name+'"]').show().next().show();
            	$title_links_btn.find('.title').text( $title_links_list.find('a[name="'+name+'"]').text() );
            	if ('undefined'!=typeof($.fn.dialog)) {  // jQuery UI
            		$title_links_list.children().css('text-decoration','none');
            		$title_links_list.children('.active').css('text-decoration','underline');
            	};
        	});
        	// Check and boxes based on opts.data
        	if (null != opts.data && opts.data.length) {
        		for (var j = 0; j < opts.data.length; j++) {
        			$div.find('[value="'+opts.data[j]+'"]').prop('checked',true);
        		}
        	}
        	// Default item
        	if (!opts.show_featured) {
        		$title_links.find('a:first').click();
        	};
        	// jQuery UI
        	if ('undefined'!=typeof($.fn.dialog)) {
        		$title_links.find('ul:first').insertBefore($title_links.parent());
        		$title_links.parent().hide();
        		$title_links_list.find('a').css('color','#026697');
        		$title_links_list.find('a[name="'+opts.active+'"]').parent().css('text-decoration','underline');
        		$title_links_list.css({
        			'list-style-type':'none',
        			'margin':'8px 0px 12px 0px',
        			'padding':'0px'
        		});
        		$title_links_list.children().css({
        			'display':'inline',
        			'padding':'0px',
        			'margin-right':'12px'
        		});
        		$div.find('.description').css({
        			'background':'none',
        			'margin-left':'0px',
        			'padding-left':'0px'
        		});
        	};
    	});
    	
    };
    
    $.fn.populate_metadata_from_localstorage = function(options) {
    
    	var $insert_into = $(this);
    	if ($insert_into.children().length) return;
    	opts = $.extend( {}, defaults, options )
    	var can_localstorage = 'localStorage' in window && window['localStorage'] !== null;
    	var skip_prefix = ['tk'];
    	
    	var arr = null;
    	if (can_localstorage) {
    		var obj = localStorage.getItem('scalar_previous_metadata_fields');
    		if (null!=obj) {
    			obj = JSON.parse(obj);
    			if (!$.isEmptyObject(obj)) {
    				arr = [];
	    			for (var j in obj) {
	    				if (skip_prefix.indexOf( obj[j].name.split(':')[0] ) != -1) continue;
	    				arr.push(obj[j].name);
	    			};
    			};
    		};
    	};
    	if (!arr || !arr.length) {
    		arr = ['dcterms:source','iptc:By-line','dcterms:coverage','dcterms:spatial','dcterms:temporal','dcterms:date'];
    	};
    	
    	var $insert;
    	for (var j = 0; j < arr.length; j++) {
    		var val = arr[j];
	        if ($insert_into.is('ul') || $insert_into.is('ol')) { // scalarimport
	        	$insert = $('<li><span class="field">'+val+'</span><span class="value"><input type="text" name="'+val+'" value="" /></span></li>');
	        } else if ( $( 'article' ).length ) { // cantaloupe
	            $insert = $('<div class="form-group '+val+' '+((opts.row_class.length)?opts.row_class:'')+'"><label class="col-sm-3 control-label">'+val+'</label><div class="col-sm-9"><input type="text" name="'+val+'" class="form-control '+((opts.input_class.length)?opts.input_class:'')+'" value="" /></div></div>');
	        } else {  // honeydew
	            $insert = $('<tr class="'+val+'"><td class="field">'+val+'</td><td class="value"><input type="text" name="'+val+'" class="form-control" value="" /></td></tr>');
	        }
			$insert_into.append($insert);
    	};
    	
    };
    
    $.fn.save_metadata_to_localstorage = function(options) {

    	var $insert_into = $(this);
    	opts = $.extend( {}, defaults, options )
    	var can_localstorage = 'localStorage' in window && window['localStorage'] !== null;
    	var obj = {};
    	var count = 0;
    	if (can_localstorage) {
    		$insert_into.find('input').each(function() {
    			var $this = $(this);
    			if (!$this.val().length) return;
    			var name = $this.attr('name');
    			obj[count] = {name:name};
    			count++;
    		});
    		localStorage.setItem('scalar_previous_metadata_fields', JSON.stringify(obj));
    	};
    	
    };
    
    $.fn.find_and_add_exif_metadata = function(options) {
    	
    	// Options
    	var $insert_into = $(this);
    	opts = $.extend( {}, defaults, options );
    	if ($(opts.button).data('active')) return;
    	$(opts.button).data('active', true).prop('disabled', 'disabled');
    	
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
        	$(opts.button).data('active', false).prop('disabled', false);
    	});
    	
    };   
    
}( jQuery ));