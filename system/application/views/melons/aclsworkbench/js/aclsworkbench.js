var rdf_json = {};
var index;
$(function(){

	//06/02/2015: Fix for menu height
	$('.navbar-collapse').css('max-height',($(window).height()-50)+'px');
	$('.navbar-collapse').on('show.bs.collapse',function(){
		$('body').addClass('in_menu');
	}).on('hide.bs.collapse',function(){
		$('body').removeClass('in_menu');
	});
	$(window).on('resize',function(){
		$('.navbar-collapse').css('max-height',($(window).height()-50)+'px');
		$('.navbar-collapse').trigger('hide.bs.collapse');
	});

	var indexElement = $('#modal .modal-body');
	var searchElement = $('#modal .modal-body');
	$('#background-image').css('background-image',$('body').css('background-image'));
	$('body').css('background-image','');
	$('a.link_book_map, #hide_map a').click(function(){
		$('#graph svg').click();
		return false;
	});
	$('body').bind('setState',function(e,data){
		$('a.link_book_map').toggleClass('active',data.state == ViewState.Navigating);
		$('#background-image').fadeTo('fast',data.state==ViewState.Navigating?.25:.5);
		if(data.state==ViewState.Navigating){
			$('#hide_map').slideDown('fast');
		}else{
			if($('#hide_map').is(':visible')){
				$('#hide_map').slideUp('fast');
			}
		}

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
		maxMediaHeight = window.innerHeight - 300;
		maxMediaWidth = $('#body').width();
		$('.mediaelement').each(function(){
			if($(this).find('pre, code, iframe').length > 0){
				$('.link_annotate').hide();
				$(this).find('.mediaObject').css({
					'max-height':maxMediaHeight,
					height:'auto',
					overflow:$(this).find('iframe').length>0?'hidden':'auto'
				});
				$(this).find('.mediaContainer').css({
					'max-height':maxMediaHeight
				});
				$(this).find('.mediaelement, .mediaElementAnnotationSidebar').css({
					height:'auto'
				});
			}
		});
}
