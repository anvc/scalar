$(document).ready(function(){
	$('#clone_dialogue .btn-primary').click(function(){
		$('#clone_dialogue form').submit();
	});
	$('.book_container  .clone').click(function(){
		$('#clone_dialogue #clone_dialogue_title').text($(this).data('title'));
		$('#clone_dialogue #book_to_duplicate').val($(this).data('id'));
		$('#clone_dialogue').modal();
		$('#clone_dialogue .book_image').html($(this).parents('.book_container').find('.book').first().clone());
	});
	$('#join_dialogue .btn-primary').click(function(){
		$('#join_dialogue form').submit();
	});
	$('.book_container  .join').click(function(){
		$('#join_dialogue #join_dialogue_title').text($(this).data('title'));
		$('#join_dialogue #book_id').val($(this).data('id'));
		$('#join_dialogue').modal();
		$('#join_dialogue .book_image').html($(this).parents('.book_container').find('.book').first().clone());
	});
	$('#do_create_book').click(function(){
		if($('#create_book_title').val()==''){
			alert('Please enter a book title');
			return false;
		}
		if(!$('#joinable').prop('checked')){
			$('#create_book_title').hide().val('<span data-joinable="false">'+$('#create_book_title').val()+'</span>');
		}
		
		$('#create_book_form').submit();
		return false;
	});
	$('#request_author_yes, #request_author_no').click(function(){
		console.log($('#request_author_yes').attr('checked') == 'checked');
		$('#author_reason_container').toggleClass('hidden',$('#request_author_yes').attr('checked')!= 'checked');
	});
	if(typeof(book_list) !== 'undefined' && $('#searchBox').length > 0){
		var options = {
			keys : ['title', 'authors'],
			id : 'id'
		};
		var f = new Fuse(book_list,options);
		
		console.log(JSON.stringify(book_list));
		$('#clear_form').click(function(){
			$(this).parents('.search_well').find('.results').html('');
			$(this).parents('.search_well').find('.original').show();
			$('#searchBox').val('');
		});
		
		$('#searchBox').on('input',function(){
			var results = $(this).parents('.search_well').find('.results');
			var original = $(this).parents('.search_well').find('.original');
			
			if($(this).val() == ''){
				original.show();
				results.html('');
			}else{
				original.hide();
				results.html('');
				
				var res = f.search($(this).val());
				console.log(res);
				for(var a in res){
					var id = res[a];
					for(book in book_list){
						if(book_list[book]['id'] == id){
							console.log(book_list[book]);
						}
					}
				}
				var selector = [];
				
				for(var i = 0 in res){
					var book = $(this).parents('.search_well').find('[data-book_id="'+res[i]+'"]').first();
					results.append(book.clone());
					selector.push(book);
				}
				original.find('.book_container').each(function(){
					console.log($.inArray($(this).data('book_id'),res));
					if($.inArray($(this).data('book_id'),res)==-1){
						results.append($(this).clone().css('opacity',.5));
					}
				});
				
			}
		});

	}
});