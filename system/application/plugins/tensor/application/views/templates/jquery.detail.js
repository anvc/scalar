(function( $ ) {
	
	var defaults = {
			namespaces: {
					'rdf':'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
			    	'rdfs':'http://www.w3.org/2000/01/rdf-schema#',
					'dc':'http://purl.org/dc/elements/1.1/',
					'dcterms':'http://purl.org/dc/terms/',
					'ctag':'http://commontag.org/ns#',
					'art':'http://simile.mit.edu/2003/10/ontologies/artstor#',
					'sioc':'http://rdfs.org/sioc/ns#',
					'sioctypes':'http://rdfs.org/sioc/types#',
					'foaf':'http://xmlns.com/foaf/0.1/',
					'owl':'http://www.w3.org/2002/07/owl#',
					'ov':'http://open.vocab.org/terms/',
					'oac':'http://www.openannotation.org/ns/',
					'scalar':'http://scalar.usc.edu/2012/01/scalar-ns#',
					'shoah':'http://tempuri.org/'
			},
			rows: null,
			default_num_predicates: 4,
			check: [],
			checkable: true,
			msg:''
	};  	
	var opts = {};
	var predicates = [];
	var $self = null;
	
    $.fn.spreadsheet_view = function(options) {
    	opts = $.extend( {}, defaults, options );
    	namespaces_reversed();
    	$self = this;
        do_create_details();
        return $self;
    };
    
    $.fn.spreadsheet_view.remove = function() {}    
    
    function namespaces_reversed() {
    	opts.namespaces_reversed = {};
    	$.each(opts.namespaces, function(key, value) {
    		opts.namespaces_reversed[value] = key; 
    	});    	
    }
    
    function do_create_details() {
    	$self.children(':not(.spreadsheet_panel)').remove();
    	$self.children('.spreadsheet_panel').hide();
    	var $wrapper = $('<div class="container-fluid details"></div>').appendTo($self);
    	var num_rows = $.map(opts.rows, function(n, i) { return i; }).length;
    	if (!num_rows) $self.html(opts.msg);    	
    	if (opts.checkable) {
	    	$wrapper.on( "click", ".detail", function() {
	    		var $this = $(this);
	    		var is_clicked = ($this.hasClass('clicked')) ? true : false;
	    		if (is_clicked) {
	    			$this.removeClass('clicked');
	    			$("body").trigger( "import_remove_node", [$this.data('uri'), $this.data('values'), $this] );
	    		} else {
	    			$this.addClass('clicked');
	    			$("body").trigger( "import_add_node", [$this.data('uri'), $this.data('values'), $this] );
	    		}   		
	    	});  
    	} else {
    		$wrapper.on( "click", ".detail", function() {
    			var $this = $(this);
    			$("body").trigger( "node_not_clickable", [$this.data('uri'), $this.data('values'), $this] );
    		});    		
    	}
    	for (var j in opts.rows) {
    		var row = opts.rows[j];
    		var thumb = ('undefined'!=typeof(row['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'])) ? row['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'][0].value : $('link#base_url').attr('href')+'application/views/images/missing_thumb.jpg';
    		var $row = $('<div class="detail"></div>').appendTo($wrapper);
    		$row.data('uri', j);
    		$row.data('values', opts.rows[j]);
    		if ('undefined'!=typeof(opts.check[j])) $row.addClass('clicked');
    		var $thumb = $('<div class="thumb col-lg-3 col-md-3 col-sm-3 col-xs-3"><img src="'+thumb+'" /></div>').appendTo($row);  		
    		var $content = $('<div class="content col-lg-9 col-md-9 col-sm-9 col-xs-9"><div class="container-fluid"></div></div>').appendTo($row);
    		$('<br clear="both" />').appendTo($row);
    		var $p = $content.find('.container-fluid');
    		row = sort_predicates_by_prop(row);
    		for (var p in row) {
    			var o = [];
    			for (k = 0; k < row[p].length; k++) {
    				var value = ('undefined'==typeof(row[p][k]) || 'undefined'==typeof(row[p][k].value)) ? '' : row[p][k].value.linkify();
    				o.push(value);
    			}
    			var pp = pnode(p);
                if(pp.indexOf('dcterms:title') > -1) {
                    $uri = $('<div class="row '+pp.replace(/:/g, "-")+'"></div>').prependTo($p);
                    $('<div class="urn col-lg-3 col-md-3 col-sm-3 col-xs-3"><b>'+pp+'</b></div>').appendTo($uri);
                    $('<div class="value col-lg-9 col-md-9 col-sm-9 col-xs-9">'+o.join('<br />')+'</div>').appendTo($uri);                    
                } else {
                    $uri = $('<div class="row '+pp.replace(/:/g, "-")+'"></div>').appendTo($p);
                    $('<div class="urn col-lg-3 col-md-3 col-sm-3 col-xs-3"><b>'+pp+'</b></div>').appendTo($uri);
                    $('<div class="value col-lg-9 col-md-9 col-sm-9 col-xs-9">'+o.join('<br />')+'</div>').appendTo($uri);
                }
    		}
    	}   	
        $wrapper.find('a').on('click', function(e) {
            e.stopPropagation();
            $(this).blur();
        });     	
    }
    
    function check(input, bool) {
    	$input = $(input);
		if (bool) {
			$input.closest('.row').addClass('details_row_checked');
			$input.prop('checked', true);
		} else {
			$input.closest('.row').removeClass('details_row_checked');
			$input.prop('checked', false);
		}   	
    }    
    
    function pnode(str) {
    	for (var j in opts.namespaces_reversed) {
    		if (-1==str.indexOf(j)) continue;
    		str = str.replace(j, opts.namespaces_reversed[j]+':');
    		return str;
    	}
    }
    
    function sort_predicates_by_prop(obj) {
        ps = [];
        for (var p in obj) {
        	ps.push(pnode(p).toLowerCase());
    	}
        ps.sort();
    	
        var results = {};
        for (var j = 0; j < ps.length; j++) {
        	p = ps[j];
        	for (var key in obj) {
        		if (pnode(key).toLowerCase() == p) {
        			results[key] = obj[key];
        			continue;
        		}
        	}
        }
        
        return results;

    }
    
}( jQuery ));