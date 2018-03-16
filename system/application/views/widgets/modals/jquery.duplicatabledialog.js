(function( $ ) {
	
	var defaults = {
			data: null,
			select: null,
			modal: true,
			url: '',
			selected: null,
			title: 'Choose a book to duplicate',
			width: 480,
			height: 370,
			callback: null
	};  	
	
    $.fn.duplicatabledialog = function(options) {
    	
    	// Options
    	var $this = $(this);
    	opts = $.extend( {}, defaults, options );
    	
    	// Ok/cancel
    	opts['buttons'] = [ 
    	  	{ text: "Cancel", class: "generic_button", click: function() { 
    	  		$this.dialog( "destroy" ); 
    	  		$this.remove();
    	  		opts.callback(0);
    	  	} }
    	];
    	opts['open'] = function(event, ui) {
    		$(this).parent().children().children('.ui-dialog-titlebar-close').hide();
    	};
    	
    	// Structure
    	$this.addClass('duplicatabledialog');
    	var msg = 'The books listed below can be duplicated in the creation of new books. This permission is set in the Sharing tab of the Dashboard.';
    	$('<p>'+msg+'</p>').appendTo($this);
    	var $div = $('<div>Loading...</div>').appendTo($this);
    	$div.css({
    		height:210,
    		overflow:'auto',
    		backgroundColor:'#eeeeee'
    	});
    	
    	// Hand over to jQuery UI
    	$this.dialog(opts);
    	
    	// List books
    	$.getJSON(opts.url, function(data) {
    		$div.empty();
    		for (var j = 0; j < data.length; j++) {
    			var str = data[j].title.replace(/<.*?>/g, '');
    			if (data[j].subtitle!=null && data[j].subtitle.length) str += ': '+data[j].subtitle.replace(/<.*?>/g, '');
    			var $row = $('<a data-book-id="'+data[j].book_id+'" data-title="'+data[j].title.replace(/<.*?>/g, '')+'" href="javascript:void(null);">'+str+'</a>').appendTo($div);
    			$row.css({
    				display:'block',
    				padding:'6px 8px 0px 8px',
    			});
    		};
    		$div.find('a').click(function() {
    			var book_id = $(this).data('book-id');
    			var title = $(this).data('title');
    	  		$this.dialog('destroy');
    	  		$this.remove();
    	  		opts.callback(book_id, title);
    		});
    	});
    	
    };
    
}( jQuery ));