$(document).ready(function(){
	if($('#container_home').length > 0){
		$('#start_tour').click(function(){
			introJs().setOption('doneLabel', 'Next page').start().oncomplete(function() {
			  window.location.href = './?multipage=true&action=index';
			}).onbeforechange(function(e){
				var step = $(e).data('step');
				if(step == 6){
					$('.introjs-tooltipbuttons').addClass('final');
				}else{
					$('.introjs-tooltipbuttons').removeClass('final');
				}
			});
		});
	}else if(RegExp('multipage', 'gi').test(window.location.search)){
		if($('#container_index').length > 0){
			var example_book_html = '<div data-step="3" data-intro="An example book has been made for this tour. Notice that you can see the book\'s cover, title, and authors in this view. You may click on the book\'s cover or title to view the book." data-position="top" data-book_id="-1" class="book_container col-md-2 col-sm-3 col-xs-6"><div class="book center-block"><div class="cover" style="background-image: url(/system/application/views/modules/aclsworkbench_book_list/default_book_logo.png)"></div></div><div class="text-center"><div class="btn-group"><button class="btn btn-sm btn-primary" data-id="-1" data-title="Example Book"><small>Clone</small></button><button class="btn btn-sm btn-primary" data-id="-1" data-title="Example Book"><small>Join</small></button></div></div><h4 class="title text-center"><a>Example Book</a><br><small class="authors">Jane Doe</small></h4></div>';
			var example_book = $(example_book_html).appendTo('.search_well .original');
			$('.no_books').hide();
			introJs().setOption('doneLabel', 'Next page').start().oncomplete(function() {
			  window.location.href = './?multipage=true&action=join';
			}).onexit(function(){
				example_book.remove();
				$('.no_books').show();
			}).onbeforechange(function(e){
				var step = $(e).data('step');
				if(step == 4){
					$('.introjs-tooltipbuttons').addClass('final');
				}else{
					$('.introjs-tooltipbuttons').removeClass('final');
				}
			});
		}else if($('#container_join').length > 0){
			var example_book_html = '<div data-step="2" data-intro="An example book has been made for this tour. Notice that the book is joinable, as noted by the blue button under its title. You can click this button to initiate the join book dialogue." data-position="top" data-book_id="-1" class="book_container col-md-2 col-sm-3 col-xs-6"><div class="book center-block"><div class="cover" style="background-image: url(/system/application/views/modules/aclsworkbench_book_list/default_book_logo.png)"></div></div><div class="text-center"><div class="btn-group"><button class="clone btn btn-sm btn-primary" data-id="-1" data-title="Example Book"><small>Clone</small></button><button class="join btn btn-sm btn-primary" data-id="-1" data-title="Example Book"><small>Join</small></button></div></div><h4 class="title text-center"><a>Example Book</a><br><small class="authors">Jane Doe</small></h4></div>';
			var original_body = $('#join_dialogue .modal-body').html();
			var example_book = $(example_book_html).appendTo('.search_well .original');
			$('.no_books').hide();
			$('#join_dialogue .modal-body').html('<div class="book_image"></div><p>You are about to join this book - this means that you will be added automatically as a subscribed reader, and it will show up under "Your Books" on the main book index. You may also optionally request to become a co-author of this book, pending current author approval.</p><br /><label>Would you like to be added as an author to this book? Note that current authors will receive an email and then may approve or deny your request.</label><div class="radio"><label><input type="radio" name="request_author" id="request_author_no" value="0" checked>I would only like to join to this book <br />  <em class="text-muted">(You will be able to read and comment on this book, but you will not be able to edit or create content)</em><br /></label></div><div class="radio"><label data-step="4" data-intro="Your second option is to request to become a co-author of the book at this time. If you choose this option, you will be given the choice to provide an optional note to the current authors. The book\'s authors will then receive an email and may choose to accept or decline your request. If you are approved, you will be able to edit existing or create new content."><input type="radio" name="request_author" id="request_author_yes" value="1">I would like to join and request to become co-author of this book <br /> <em class="text-muted">(Pending current author approval, you will be able to create and edit content on this book)</em><br /></label></div></div><br class="clearfix" /></div><div class="modal-footer"><input type="submit" disabled class="btn btn-muted pull-right" value="Join Book"></div>');
			example_book.find('.join').click(function(){
				$('#join_dialogue').hide();
				$('.modal-backdrop').hide();
			});
			introJs().setOption('doneLabel', 'Next page').start().oncomplete(function() {
			  window.location.href = './?multipage=true&action=clone';
			}).onexit(function(){
				example_book.remove();
				$('.no_books').show();
				$('#join_dialogue .modal-body').html(original_body);
				$('#join_dialogue').modal('hide');
			}).onbeforechange(function(e){
				var step = $(e).data('step');
				if(step == 3){
					$('.introjs-helperLayer').addClass('lighter');
					$('#join_dialogue').modal('show').fadeTo('fast',1).addClass('top');
				}
				if(step == 5){
					$('.introjs-helperLayer').removeClass('lighter')
					$('#join_dialogue').hide().modal('hide');
					$('.introjs-tooltipbuttons').addClass('final');
				}else{
					$('.introjs-tooltipbuttons').removeClass('final');
				}
			});
		}else if($('#container_clone').length > 0){
			var example_book_html = '<div data-step="2" data-intro="An example book has been made for this tour. Notice that the book is clonable, as noted by the blue button under its title. You can click this button to initiate the clone book dialogue." data-position="top" data-book_id="-1" class="book_container col-md-2 col-sm-3 col-xs-6"><div class="book center-block"><div class="cover" style="background-image: url(/system/application/views/modules/aclsworkbench_book_list/default_book_logo.png)"></div></div><div class="text-center"><div class="btn-group"><button class="clone btn btn-sm btn-primary" data-id="-1" data-title="Example Book"><small>Clone</small></button><button class="join btn btn-sm btn-primary" data-id="-1" data-title="Example Book"><small>Join</small></button></div></div><h4 class="title text-center"><a>Example Book</a><br><small class="authors">Jane Doe</small></h4></div>';
			var original_body = $('#clone_dialogue .modal-body').html();
			var example_book = $(example_book_html).appendTo('.search_well .original');
			$('.no_books').hide();
			$('#clone_dialogue .modal-body').html('<div class="book_image"></div><p>You are about to clone this book - a copy of this book with your new title will be added to "Your Books" on the book index.<p><p><em class="text-muted">Note that any pages that you have not edited will still show the previous author as the last editor. Once you have modified these files, you will be shown as the most recent editor. Any new files you will create will also show you as the editor.</em></p><br /><div class="form-group"><label for="clone_title">Title of new book:<input type="text" disabled name="title" id="clone_title"></label></div></div><div class="modal-footer"><input type="submit" disabled class="btn btn-muted pull-right" value="Clone Book">');
			example_book.find('.clone').click(function(){
				$('#clone_dialogue').hide();
				$('.modal-backdrop').hide();
			});
			introJs().setOption('doneLabel', 'Next page').start().oncomplete(function() {
			  window.location.href = './?multipage=true&action=create';
			}).onexit(function(){
				example_book.remove();
				$('.no_books').show();
				$('#clone_dialogue .modal-body').html(original_body);
				$('#clone_dialogue').modal('hide');
			}).onbeforechange(function(e){
				var step = $(e).data('step');
				if(step == 3){
					$('.introjs-helperLayer').addClass('lighter');
					$('#clone_dialogue').modal('show').fadeTo('fast',1).addClass('top');
				}
				if(step == 4){
					$('.introjs-helperLayer').removeClass('lighter')
					$('#clone_dialogue').hide().modal('hide');
					$('.introjs-tooltipbuttons').addClass('final');
				}else{
					$('.introjs-tooltipbuttons').removeClass('final');
				}
			});
		}else if($('#container_create').length > 0){
			var original_body = $('#create_wrapper').html();
			$('#create_wrapper').html('<p>You are about to create a new book. In order to start this process,  please enter the book\'s title. You may change this title at a later time, however your book\'s URL will be based on this initial value. You may also choose to allow or disallow users to subscribe to your book. A subscribed user will be listed as a "reader" of your book, but will be unable to edit or contribute outside of comments. By default, subscriptions are allowed.</p><p>Once you have entered your desired book title, click "Create book," below.</p><hr><div class="form-group text-center"><label for="create_book_title">New Book Title: <br /><input id="create_book_title" name="title" type="text" placeholder="(New book title)" style="width:200px;" disabled></label></div><div data-step="3" data-intro="Next, you must choose whether you would like people to be able to join your book. In most cases, you should allow users to join your book, as it promotes community-building within ACLS Workbench and it helps inform you of users\' interests. Users will be unable to edit or create content within your book without your permission." class="form-group text-center"><label for="joinable">Allow Users to Join* My Book:  <input id="joinable" name="joinable" type="checkbox" checked></label></div><hr><div class="form-group"><button disabled class="btn btn-muted pull-right" id="do_create_book">Create book</button></div>');
			introJs().setOption('doneLabel', 'Finish Tour').start().oncomplete(function() {
			  window.location.href = './?action=home';
			}).onexit(function(){
				$('#create_wrapper').html(original_body);
			}).onbeforechange(function(e){
				var step = $(e).data('step');
				if(step == 2){
					$('.introjs-helperLayer').addClass('white');
				}
				if(step==4){
					$('.introjs-tooltipbuttons').addClass('final');
					$('.introjs-helperLayer').removeClass('white');
				}else{
					$('.introjs-tooltipbuttons').removeClass('final');
				}
			});
		}
	}
	$('#clone_dialogue .btn-primary').click(function(){
		$('#clone_dialogue form').submit();
	});
	$('.book_container  .clone').click(function(){
		$('#clone_dialogue #clone_dialogue_title').text($(this).data('title'));
		$('#clone_dialogue #book_to_duplicate').val($(this).data('id'));
		$('#clone_dialogue').modal('show');
		$('#clone_dialogue .book_image').html($(this).parents('.book_container').find('.book').first().clone());
	});
	$('#join_dialogue .btn-primary').click(function(){
		$('#join_dialogue form').submit();
	});
	$('.book_container  .join').click(function(){
		$('#join_dialogue #join_dialogue_title').text($(this).data('title'));
		$('#join_dialogue #book_id').val($(this).data('id'));
		$('#join_dialogue').modal('show');
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