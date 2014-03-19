var rdf_json = {};
var index;
$(function(){
	
	var indexElement = $('#modal .modal-body');
	var searchElement = $('#modal .modal-body');
	
	$('a.link_book_map').click(function(){
		$('#graph svg').click();
		return false;
	});
	$('body').bind('setState',function(e,data){
		$('a.link_book_map').toggleClass('active',data.state == ViewState.Navigating);
		
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
		resize_media();
	});
	$(window).resize(function(){resize_media();});
});
function resize_media(){
		maxMediaHeight = window.innerHeight - 400;
		maxMediaWidth = $('#body').width();

	$('.mediaObject, .mediaContainer').css({
		'max-height':maxMediaHeight, 
		'max-width':maxMediaWidth
	});
	$('.mediaObject, .mediaelement').css({
		height:'auto',
		width:'auto'
	});
}
