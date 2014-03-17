var rdf_json = {};
var index;
$(function(){
	
	var indexElement = $('#modal .modal-body');
	var searchElement = $('#modal .modal-body');
	
	$('a.link_book_map').toggle(function(){		
		$('body>div.container').fadeOut('fast');
		$('#graph, #pinwheel_center, #zoomControls').fadeTo('fast',1);
		return false;
	},function(){
		$('body>div.container').fadeIn('fast');
		$('#graph, #pinwheel_center, #zoomControls').fadeTo('fast',.25);
		return false;
	});
	$('a.link_join, a.link_clone').click(function(e){
		e.preventDefault();
		var modal_url = $(this).attr("href")+'?modal=1';
		console.log($(this).html());
		$('#modal .modal-title').text($(this).find('.mobile_only').text());
		$('#modal .modal-body').load(modal_url,function(){
			$('#modal').modal('show');
			$('#request_author_yes, #request_author_no').click(function(){
				$('#author_reason_container').toggleClass('hidden',$('#request_author_yes').attr('checked')!= 'checked');
			});
		});
		return false;
	});
	$('a.link_book_index').click( function(e) { 
		e.preventDefault();
		index = indexElement.scalarindex( {} );
		index.data('plugin_scalarindex').showIndex();  
		$('#modal .modal-title').text('Index');
		$('#modal').modal('show');
		return false;
	});
	$('a.link_search').popover({
		placement : 'bottom',
		html : true
	}).on('shown.bs.popover',function(e){
		$('#search_form').submit(function(e){
			e.preventDefault();
			search = searchElement.scalarsearch( { root_url: modules_uri+'/cantaloupe'} );
			search.data('plugin_scalarsearch').doSearch($(this).find('input').val());
			$('#modal .modal-title').text('Search');
			$('#modal').modal('show');
			$('a.link_search').popover('hide');
			return false;
		});
	});
	$('.nav a:not(.link_search)').tooltip({
		placement : 'bottom'
	});
	if($('#body').hasClass('with_loader')){
		$(' .container, #book-title, article, header').hide();
	}else{
		$('#spinner').hide();
	}
	
	$('#request_author_yes, #request_author_no').click(function(){
		$('#author_reason_container').toggleClass('hidden',$('#request_author_yes').attr('checked')!= 'checked');
	});
	
	
	$('body').on('mediaElementMetadataHandled',function(){
		$('.mediaObject, .mediaContainer').css('max-height',maxMediaHeight);
		$('.mediaObject').css('height','auto');
	});
});
