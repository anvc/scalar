(function( $ ) {
	
	var defaults = {
			data: [],
			selected: [],
			modal: true,
			urlroot: '',
			title: 'Select main menu items',
			width: 700,
			height: 500,
			callback: null
	};  	
	
    $.fn.bookversionsdialog = function(options) {
    	
    	// Options
    	var $this = $(this);
    	opts = $.extend( {}, defaults, options );
    	opts.data = sort_data_by_title(opts.data);
  	
    	// Ok/cancel
    	opts['buttons'] = [ 
    	  	{ text: "Continue", class: "generic_button default", click: function() { 
    	  		var selected = [];
    	  		$(this).closest('.bookversionsdialog').find(':checked').each(function() {
    	  			selected.push( $(this).closest('.item').data('item') );
    	  		});
    	  		opts.callback(selected);
    	  		$this.dialog( "destroy" );
    	  		$this.remove();
    	  	} },
    	  	{ text: "Cancel", class: "generic_button", click: function() { $this.dialog( "destroy" ); $this.remove(); } }
    	];

    	// Selected items
    	var selected_ids = [];
    	for (var j = 0; j < opts.selected.length; j++) {
    		selected_ids.push(opts.selected[j].versions[0].version_id);
    	}
    	
    	// Structure
    	$this.addClass('bookversionsdialog');
    	var $pages = $('<div class="pages"></div>').appendTo($this);
    	var $media = $('<div class="media"></div>').appendTo($this);

    	// Propagate
    	$pages.append('<p>Pages</p>');
    	for (var j = 0; j < opts.data.length; j++) {
    		if (opts.data[j].type!='composite') continue;
    		var $div = $('<div class="item"></div>').appendTo($pages);
    		$div.data('item', opts.data[j]);
    		$div.append('<input id="cb_p'+j+'" type="checkbox" value="'+opts.data[j].versions[0].version_id+'"><div class="title"><label for="cb_p'+j+'" title="'+opts.data[j].slug+'">'+opts.data[j].versions[0].title+'</label></div>');
    		if (-1!=selected_ids.indexOf(opts.data[j].versions[0].version_id)) $div.find('input:first').prop('checked',true);
    	}
    	$media.append('<p>Media</p>');
    	for (var j = 0; j < opts.data.length; j++) {
    		if (opts.data[j].type!='media') continue;
    		var $div = $('<div class="item"></div>').appendTo($media);
    		$div.data('item', opts.data[j]);
    		$div.append('<input id="cb_m'+j+'" type="checkbox" value="'+opts.data[j].versions[0].version_id+'"><div class="title"><label for="cb_m'+j+'" title="'+opts.data[j].slug+'">'+opts.data[j].versions[0].title+'</label></div>');
    		if (-1!=selected_ids.indexOf(opts.data[j].versions[0].version_id)) $div.find('input:first').prop('checked',true);
    	}    	
    	
    	// Hand over to jQuery UI
    	$this.dialog(opts);
    	
    };
    
    function sort_data_by_title(arr) {
    
        var titles = [];
        for (var j = 0; j < arr.length; j++) {
        	if ('undefined'==typeof(arr[j].versions)) {
        		console.log('No versions for the following, skipping:');
        		console.log(arr[j]);
        		continue;
        	}
        	titles.push(arr[j].versions[0].title.toLowerCase());
        }
        titles.sort();

        var results = [];
        var used_slugs = [];
        for (var j = 0; j < titles.length; j++) {
        	for (var k in arr) {
        		if (-1==used_slugs.indexOf(arr[k].slug) && arr[k].versions[0].title.toLowerCase() == titles[j]) {
        			results.push(arr[k]);
        			used_slugs.push(arr[k].slug);
        			break;
        		}
        	}
        }
        
        return results;

    }    
    
}( jQuery ));