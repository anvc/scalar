(function( $ ) {
	
	var defaults = {
	   form:null,
	   p:['dcterms:title','dcterms:description','dcterms:contributor','dcterms:subject']
	};  	
	
    $.fn.advanced_search = function(options) {
    	var $self = $(this);
    	opts = $.extend( {}, defaults, options );
    	var $form = $(opts.form);
    	var $submit = $form.find('[type="submit"]').closest('.tr');
    	var $add = $submit.find('a:first');
    	$form.find('.tr:not(:last)').remove();
    	var search_arr = [];
    	
    	// Get terms from the search field (removing any predicates())
    	var terms = function() {
    		var terms = [];
    		var live = true;
    		var arr = $self.val().split(' ');
    		for (var j = 0; j < arr.length; j++) {
    			if (!live) continue;
    			if (!arr[j].length) continue;
    			if (arr[j].indexOf(':')!=-1 && arr[j].indexOf('(')!=-1) {
    				live = false;
    				continue;
    			}
    			terms.push(arr[j]);
    		}
    		return terms;
    	};   
    	
    	// Form fields
    	var write_fields = function(val, p) {
    		var $div = $('<div class="tr"><div class="field"></div><div class="value"></div></div>').insertBefore($submit);
    		$div.find('div:first').html('<input name="p" value="'+val+'" class="form-control" placeholder="" />');
    		$div.find('div:last').html('<input name="o" class="form-control" placeholder="" />');
    		if ('undefined'!=typeof(p[val])) {
    			$div.find('input:last').val( p[val].join(' ') );
    		}    		
    	};
    	
    	// Insert default form fields and any additional fields defined in the search form
    	var p = $.fn.parse_search($self.val());
    	for (var j = 0; j < opts.p.length; j++) {
    		write_fields(opts.p[j], p);
    	}
    	var extra = [];
    	for (var key in p) {
    		if ('terms'==key) continue;
    		if (opts.p.indexOf(key)!=-1) continue;
    		extra.push(key);
    	}
    	for (var j = 0; j < extra.length; j++) {
    		write_fields(extra[j], p);
    	}
    	
    	// Add a blank form field
    	$add.click(function() {
    		var $tr = $form.find('.tr:first').clone();
    		$tr.find('input').val('');
    		$tr.insertBefore($submit);
    		$(this).blur();
    	});
    	
    	// Propagate the search form based on the values in the form fields
    	$form.submit(function() {
    		search_arr = $.extend([], terms());
    		$(this).find('input[name="o"]').each(function() {
    			var $input = $(this);
    			if (!$input.val().length) return;
    			var name = $input.closest('.tr').find('input:first').val();
    			if (!name.length) return;
    			search_arr.push($.trim(name)+'('+$.trim($input.val())+')');
    		});
    		$self.val(search_arr.join(' '));
    		if ('undefined'!=typeof(opts.callback)) opts.callback();
    		return false;
    	});
    	
        return $self;
    };
    
    // Extract search form into terms and predicates
    $.fn.parse_search = function(sq) {
    	
    	var arr = sq.split(' ');
    	var obj = {};
    	var is_on = 'terms';
    	obj['terms'] = [];
    	for (var j = 0; j < arr.length; j++) {
    		if (!arr[j].length) continue;
    		if (arr[j].indexOf(':')!=-1 && arr[j].indexOf('(')!=-1) {  // E.g., dcterms:title{
    			var p = arr[j].substr(0, arr[j].indexOf('('));
    			obj[p] = [];
    			is_on = p;
    			var term = arr[j].substr(arr[j].indexOf('(')+1);
    			if (term.indexOf(')')!=-1) term = term.substr(0, term.indexOf(')'));
    			obj[is_on].push(term);
    		} else if (arr[j].indexOf(')')!=-1) {  // E.g., term)
    			obj[is_on].push($.trim(arr[j].substr(0,arr[j].indexOf(')'))));
    			is_on = 'terms';
    		} else {
    			obj[is_on].push($.trim(arr[j]));
    		}
    	}
    	return obj;
    	
    };
    
}( jQuery ));