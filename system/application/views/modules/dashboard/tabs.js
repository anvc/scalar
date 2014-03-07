
var hash = document.location.hash.replace('#','');

$(document).ready(function() {

	// When a book is selected from the HTML form, jump to the Book Style tab

	if ($.isFunction($.fn.tabs)) {
		
		if (document.location.href.indexOf('zone=style') != -1 && !document.location.hash.length) {
			document.location.hash = '#tabs-style';
			$('.tabs').tabs({selected:1});
		} else {
			$('.tabs').tabs();
		}
	}

    // Reload the page when a tab is selected so PHP can load its content in the controller

	$('.tabs').bind('tabsselect', function(event, ui) {	
		
		$('#page_load_time').hide();
		
		var str = ui.tab+'';
		var hash = str.substr((str.indexOf('#')+1));
		if (hash.indexOf('?')!=-1) hash = hash.substr(0,hash.indexOf('?'));
		if (hash.indexOf('&')!=-1) hash = hash.substr(0,hash.indexOf('&'));
		var zone = hash.replace('tabs-','');
		var book_id = getUrlVars()['book_id'];
		if (book_id && book_id.indexOf('#')!=-1) book_id = book_id.substr(0, book_id.indexOf('#'));
		
		str = '?';
		if ('undefined' != typeof(book_id)) str += 'book_id='+book_id+'&';
		str += 'zone='+zone+'#'+hash; 
		document.location.href = str;
		
	});
	
	// If changes are made in the form, reveal save button
	
	$('form input, form textarea').keyup(function() {
		$(this).closest('form').find('.save_changes').fadeIn();
	});
	$('form select, form input:checkbox').change(function() {
		$(this).closest('form').find('.save_changes').fadeIn();
	});
	
	$('form input:file').live('change', function(){
		$(this).closest('form').find('.save_changes').fadeIn();
    });
	$('form .ui-sortable').live('sortchange', function(event, ui) {
		$(this).closest('form').find('.save_changes').fadeIn();
	});  
    $('form input:submit').button();		
    
    // Excerpts
    
    $('.full').each(function() {
    	var $full = $(this);
    	var $clip = $full.next();
    	if (!$clip.hasClass('clip')) return;
    	$clip.after('<a style="margin-left:10px;" href="javascript:void(null);">expand</a>');
    	$clip.next().click(function() {
    		$full.toggle();
    		$clip.toggle();
    	});
    });
    
    // Scroll to top after a short delay (for Safari)
	
	setTimeout("$(window).scrollTop(0)", 10); 
	
	// Duplicate/join feature: overload the title field with <span data-duplicatable="true" data-joinable="true">
	
	var is_duplicatable = ( $($('input[name="title"]').val()).attr('data-duplicatable') ) ? 1 : 0;
	var is_joinable = ( $($('input[name="title"]').val()).attr('data-joinable') ) ? 1 : 0;
	$('#duplicatable').val(is_duplicatable);
	$('#joinable').val(is_joinable);
	
	$('#duplicatable, #joinable').change(function() {
		var has_span = ( $($('input[name="title"]').val()).is('span') ) ? true : false;
		var $span = (has_span) ? $($('input[name="title"]').val()) : $('<span></span>');
		var title = (has_span) ? $($('input[name="title"]').val()).html() : $('input[name="title"]').val();
		var prop_arr = ['duplicatable', 'joinable'];
		// Add or remove attribute
		for (var j in prop_arr) {
			var prop = prop_arr[j];
			var make_true = (parseInt($('#'+prop).val())) ? true : false;
			console.log('make '+prop+' true: '+make_true);
			if (make_true) {
				$span.attr('data-'+prop, 'true');
			} else {
				$span.removeAttr('data-'+prop);
			}
		}
		// Add or replace span
		$span.html(title);
		console.log($span.html($span.clone()).html());
		$('input[name="title"]').val( $span.html() );
		
		/*
		if (is_duplicatable && !reqested_duplicatability) {
			console.log('removing duplicatability');
			var value = $($('input[name="title"]').val()).html();
			$('input[name="title"]').val(value);
		} else if (!is_duplicatable && reqested_duplicatability) {
			console.log('adding duplicatability');
			$('input[name="title"]').val( '<span data-duplicatable="true">'+$('input[name="title"]').val()+'</span>' );
		}
		*/
	});
	
});

// http://phpjs.org/functions/dirname:388
function dirname (path) {
    return path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
}
