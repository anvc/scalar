
var hash = document.location.hash.replace('#','');

$(document).ready(function() {

	function loadTab(event, ui) {

		console.log('load tab');
		console.log(event);
		console.log(ui);

		$('#page_load_time').hide();

		//var str = ui.tab+'';
		var str = $(ui.newTab).find('a').attr('href');
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

	}

	// When a book is selected from the HTML form, jump to the Book Style tab

	if ($.isFunction($.fn.tabs)) {

		if (document.location.href.indexOf('zone=style') != -1 && !document.location.hash.length) {
			document.location.hash = '#tabs-style';
			$('.tabs').tabs({active:1, beforeActivate: loadTab});
		} else {
			$('.tabs').tabs({beforeActivate: loadTab});
		}
	}

    // Reload the page when a tab is selected so PHP can load its content in the controller

	/*$('.tabs').on('tabsselect', function(event, ui) {

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

	});*/

	// If changes are made in the form, reveal save button

	$('form input, form textarea').on('keyup', function() {
		$(this).closest('form').find('.save_changes').fadeIn();
	});
	$('select').on('change', function() {
		$(this).closest('form').find('.save_changes').fadeIn();
	});
	$('form input:file').on('change', function() {
		$(this).closest('form').find('.save_changes').fadeIn();
    });
	$('form .ui-sortable').on('sortchange', function(event, ui) {
		$(this).closest('form').find('.save_changes').fadeIn();
	});
    $('form input:submit').button();

    // Excerpts

    $('.full').each(function() {
    	var $full = $(this);
    	var $clip = $full.next();
    	if (!$clip.hasClass('clip')) return;
    	$clip.after('<a style="margin-left:10px;" href="javascript:void(null);">expand</a>');
    	$clip.next().on('click', function() {
    		$full.toggle();
    		$clip.toggle();
    	});
    });

    // Scroll to top to counteract anchor
    setTimeout(function() {
    	$(window).scrollTop(0);
    }, 100);

});

// http://phpjs.org/functions/dirname:388
function dirname (path) {
    return path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
}
