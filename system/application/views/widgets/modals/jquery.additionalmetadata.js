(function( $ ) {
	
	var defaults = {
			data: null,
			ns: null
	};  	
	
    $.fn.additionalmetadata = function(options) {
    	
    	// Options
    	var $this = $(this);
    	opts = $.extend( {}, defaults, options );
    	var is_ie = ($.browser.msie) ? true : false;
    	
    	// URI to pnode
    	var toNS = function(uri) {
    		for (var prefix in opts.ns) {
    			var prefix_uri = opts.ns[prefix];
    			if (uri.substr(0, prefix_uri.length) == prefix_uri) {
    				return uri.replace(prefix_uri, prefix+':');
    			}
    		}
    		return uri;
    	}
    	
    	// Create maximize box
		$('.maximize').remove();
		var $div = $('<div class="maximize"><div class="maximize_fade"></div><div class="maximize_content"></div></div>');
		if (!is_ie) $div.css({ opacity: 0.0 });  // For fading in later (can't use fadeIn() because display:block disrupts the fixed positioning)
		$('body').append($div);
		
		// Set height of maximize box + reposition based on vertical scroll position
		// Normally position:fixed would take care of this, but want it to work on iOS, etc
		var content_top_margin = parseInt($div.find('.maximize_content').css('top'));
		$div.find('.maximize_fade').css('height', $(document).height()); 
		$div.find('.maximize_content')
			.css( 'top', parseInt($(document).scrollTop())+content_top_margin )
			.css( 'height', parseInt($(window).height())-(content_top_margin*2) );
		$(document).scroll(function() {
			$div.find('.maximize_content').stop(true).animate({
				top: parseInt($(document).scrollTop())+content_top_margin,
		  	}, 'fast');		
		});
    	
		// Create mediaelement box
    	$me = $('<div class="mediaelement" style="height:100%;"></div>').appendTo($div.find('.maximize_content'));
    	$header = $('<div class="mediaElementHeader mediaElementHeaderWithNavBar"><div class="nav_bar_options"><span class="downArrow"><li title="metadata" class="sel">Additional Metadata</li></span></div><span class="close_link"><a href="javascript:;" alt="Close">&nbsp;</a></span></div>').appendTo($me);
    	$content = $('<div style="padding:10px; overflow:auto;">There is no additional metadata for this content.</div>').appendTo($me);
    	$content.height( parseInt($me.innerHeight()) - parseInt($header.outerHeight()) - 20 );   // Magic number = padding
    	
    	// Sort data by pnode
    	var rdf = {};
    	for (var p in opts.data) {
    		var pnode = toNS(p);
    		var prefix = pnode.substr(0, pnode.indexOf(':'));
    		var field = pnode.substr(pnode.indexOf(':')+1);
    		if ('undefined'==typeof(rdf[prefix])) rdf[prefix] = {};
    		rdf[prefix][field] = opts.data[p];
    	}
    	// Write field/values
    	if (!jQuery.isEmptyObject(rdf)) {
    		$content.empty();
    		for (var prefix in rdf) {
    			$content.append('<h1 style="margin:12px 0px 12px 0px;">'+prefix+'</h1>');
    			var $table = $('<table cellpadding="5"></table>').appendTo($content);
    			for (var field in rdf[prefix]) {
    				var $tr = $('<tr><td valign="top"><b>'+field+'</b><td valign="top"></td></td></tr>').appendTo($table);
    				for (var val in rdf[prefix][field]) {
    					$tr.find('td:last').append(rdf[prefix][field][val].value+'<br />');
    				}
    			}
    		}
    	}
    	
    	// Display box
    	if (!is_ie) $div.fadeTo(500, 1.0);
    	$header.find('.close_link').click(function() {
    		$(this).closest('.maximize').remove();
    	});

    	
    };
    
}( jQuery ));