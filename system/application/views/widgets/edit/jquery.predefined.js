(function( $ ) {
	
	var defaults = {
			data: null,
			msg: '',
			approot: $('link#approot').attr('href')
	};  	
	
    $.fn.predefined = function(options) {
    	
    	// Options
    	var self = this;
    	var $this = $(this);
    	var opts = $.extend( {}, defaults, options );
    	
    	var set_descriptions = function($div) {
    		$div.find('select').each(function() {
    			var $this = $(this);
    			$this.blur();
    			var data = $this.find('option:selected').data('predefined');
    			if ('undefined'!=typeof(data) && data.description.length) {
    				$this.closest('.predefined_wrapper').find('.desc').html(data.description);
    			} else {
    				$this.closest('.predefined_wrapper').find('.desc').empty();
    			}
    		});
    	};    	
    	
    	var commit = function($div) {
    		$div.find('select').each(function() {
    			var $this = $(this);
    			var data = $this.find('option:selected').data('predefined');
    			if ('undefined'!=typeof(data) && data.insert.length) {
    				var val = $(self).val();
    				val = '/* '+data.title+' */'+"\n" + data.insert + "\n" + val;
    				$(self).val(val);
    			} 
    		});    		
    	};

    	if ('undefined'==typeof(opts.data) || $.isEmptyObject(opts.data)) {
    		return;
    	}
    	
    	$div = $('<div class="predefined_wrapper form-inline"><span class="interface"></span></div>').insertAfter($this);
    	$div.append('<span class="msg">'+opts.msg+'</span>');
    	$div.append('<span class="select">&nbsp; <select class="form-control"><option value=""></option></select> </span>');
    	$div.append('<span class="button"><input type="button" class="btn btn-default" value="Insert" /></span>');
    	$div.append('<div class="desc"></div>');
    	for (var j in options.data) {
    		var $option = $('<option value="">'+options.data[j].title+'</option>');
    		$option.data('predefined', options.data[j]);
    		$div.find('select').append($option);
    	}
    	
    	set_descriptions($div);
    	$div.find('select').change(function() {
    		set_descriptions($div);
    	});
    	
    	$div.find('input[type="button"]').click(function() {
    		commit($div);
    	});

    };
    
}( jQuery ));