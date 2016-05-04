(function( $ ) {
	
	var defaults = {
			data: null,
			select: null,
			modal: true,
			urlroot: '',
			selected: null,
			title: 'Choose a Scalar reader interface',
			msg: '<small>Scalar 2 is our new, easier to read interface, while Scalar 1 is our original design.<br><br>You can switch back and forth between the two interfaces as much as you like, though <a target="_blank" href="http://scalar.usc.edu/works/guide2/switching-books-authored-in-scalar-10?path=scalar-20-whats-new">some reformatting may be required</a> to convert books created in Scalar 1 to take advantage of the features in Scalar 2.</small>',
			width: 800,
			height: 630
	};  	
	
    $.fn.melondialog = function(options) {
    	
    	// Options
    	var $this = $(this);
    	opts = $.extend( {}, defaults, options );
    	
    	// Ok/cancel
    	opts['buttons'] = [ 
    	  	{ text: "Continue", class: "generic_button default", click: function() { 
    	  		var selected = $(this).find(':checked').val();
    	  		$(opts.select).val(selected).trigger('change');
    	  		$this.dialog('destroy');
    	  		$this.remove();
    	  	} },
    	  	{ text: "Cancel", class: "generic_button", click: function() { $this.dialog( "destroy" ); $this.remove(); } }
    	];
    	
    	// Structure
    	$this.addClass('melondialog');
    	$('<p>'+opts.msg+'</p>').appendTo($this);
    	var $table = $('<table><tbody><tr></tr></tbody></table>').appendTo($this);
    	
    	// List of melons
    	var num_melons = 0;
    	for (var j = 0; j < opts.data.length; j++) {
    		if (!opts.data[j]['meta']['is_selectable']) continue;
    		num_melons++;
    		var $cell = $('<td></td>').appendTo($table.find('tr'));
            var $radio = $('<p><input id="cb_'+j+'" type="radio" name="template" value="'+opts.data[j]['meta']['slug']+'" /><label for="cb_'+j+'"> '+opts.data[j]['meta']['name']+'</label></p>').appendTo($cell);
   		    var $img = $('<img style="border: 1px solid #aaa;" src="'+opts.urlroot+opts.data[j]['meta']['thumb_app_path']+'" />').appendTo($cell);
    		$('<p><small>'+opts.data[j]['meta']['description']+'</small></p>').appendTo($cell);
    		if (opts.selected==opts.data[j]['meta']['slug']) $radio.find('input').prop('checked', true);
    		$img.click(function() {
    			$(this).parent().find('input[type="radio"]').prop('checked', true);
    		});
    	}
    	
    	// Set cell widths
    	$table.find('td').width( ((1/num_melons)*100) + '%' );
    	
    	// Hand over to jQuery UI
    	$this.dialog(opts);
    	
    };
    
}( jQuery ));