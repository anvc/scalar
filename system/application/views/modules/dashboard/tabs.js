
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
	
	// Duplicatable feature: overload the title field with <span data-duplicatable="true"></span>
	// NOTE: Removes <span> from the title regardless of whether it's the span that controls duplicatability,
	// though don't anticipate overloading the title field with anything else
	
	var is_duplicatable = ( $($('input[name="title"]').val()).attr('data-duplicatable') ) ? 1 : 0;
	$('#duplicatable').val(is_duplicatable);
	
	$('#duplicatable').change(function() {
		console.log('craig');
		var is_duplicatable = ( $($('input[name="title"]').val()).attr('data-duplicatable') ) ? true : false;
		var reqested_duplicatability = ('1'==$(this).val()) ? true : false;
		if (is_duplicatable && !reqested_duplicatability) {
			console.log('removing duplicatability');
			var value = $($('input[name="title"]').val()).html();
			$('input[name="title"]').val(value);
		} else if (!is_duplicatable && reqested_duplicatability) {
			console.log('adding duplicatability');
			$('input[name="title"]').val( '<span data-duplicatable="true">'+$('input[name="title"]').val()+'</span>' );
		}
	});
	
});

// http://phpjs.org/functions/dirname:388
function dirname (path) {
    return path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
}
