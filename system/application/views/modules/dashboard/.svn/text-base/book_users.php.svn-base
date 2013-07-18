<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_js(path_from_file(__FILE__).'tablesorter/jquery.tablesorter.min.js')?>
<?$this->template->add_css(path_from_file(__FILE__).'tablesorter/style.css')?>
		
		<script>
		$(document).ready(function() {
			$(".tablesorter").tablesorter({ 
        		headers: { 
        			0: {sorter: false }, 
            		4: {sorter: false }
        		}
   			}); 
   			
   			$(window).resize(function() { resizeList(); });
   			resizeList();
   			
		});	
		
		function resizeList() {
    		$('.table_wrapper').height(Math.max(200, $(window).height() - ($('.table_wrapper').offset().top + 100))+'px'); // magic number to get list height right
		}
		
		function add_book_user(book_id) {
			if ('undefined'==typeof(book_id) || book_id==0) return alert('Please select a book');
			var prev_text = $('#connect_book_user_link').html();
			//$('#connect_book_user_link').html('Loading...');
			$.get('api/get_system_users', function(data) {
				$('.select_box').remove();
				var $div = $('<div class="select_box"><h4 class="dialog_title">Add a user (admin)</h4>Connect a user by clicking their name below<br />(New accounts are added by system administrators)<br clear="both" /><br /><div id="user_list" style="height:200px;overflow:auto;line-height:150%;"></div><br /><a class="generic_button large" href="javascript:;" onclick="$(this).parent().remove();" style="float:right;">Cancel</a></div>');
				$('body').append($div);
				$user_list = $div.find('#user_list');	
				for (var j = 0; j < data.length; j++) {
					var fullname = (data[j].fullname.length > 0) ? data[j].fullname : '(Missing name)';
					var $link = $('<div><a href="javascript:;" title="'+data[j].user_id+'">'+fullname+'</a></div>');
					$user_list.append($link);
					
				}	
				$div.css('left', ((parseInt($(window).width())/2) - ($div.width()/2) + 'px') );
				$div.css('top', ((parseInt($(window).height())/2) - ($div.height()/2) + parseInt($(window).scrollTop()) + 'px') );
				$div.show();
				$('#connect_book_user_link').html(prev_text);
				$div.find('a').click(function() {
					var $clicked = $(this);
					var user_id = parseInt($clicked.attr('title'));
					$.get('api/save_user_books', {id:user_id, selected_ids:[book_id], list_in_index:0}, function() {
						window.location.reload();
					});
				});
			});
		}
		function remove_book_user(book_id, user_id) {
			if ('undefined'==typeof(book_id) || book_id==0) return alert('Please select a book');
			if ('undefined'==typeof(user_id) || user_id==0) return alert('Invalid user ID');
			$.get('api/delete_book_user', {user_id:user_id, book_id:book_id}, function() {
				window.location.reload();
			});			
		}
		function request_book_user(book_id) {
				var $div = $('<div class="select_box"><h4 class="dialog_title">Add a user</h4>To connect a user to your book, first search for them by their full name.<br clear="both" /><br /><form><input type="text" name="fullname" value="Full name" />&nbsp; <input type="submit" value="Search" /></form><div class="results" style="padding-top:16px;padding-bottom:10px;"></div><a class="generic_button large" href="javascript:;" onclick="$(this).parent().remove();" style="float:right;font-size:larger;">Cancel</a></div>');
				$div.find('input:first').focus(function() {if ($(this).val() == 'Full name') $(this).val('');});
				$('body').append($div);
				$div.find('form:first').submit(function() {
					if ($div.find('input:first').val()=='Full name') return false;
					$div.find('input:submit').attr("disabled", "disabled");
					var fullname = this.fullname.value;
					$.get('api/user_search', {fullname:fullname}, function(data) {
						if (!data.length) {
							$div.find('.results').html('No users were found with the provided full name');
							$div.find('input:submit').removeAttr("disabled");
							return false;
						}
						$div.find('.results').html('<div style="padding-bottom:10px;">Please select a user below to link them to your book:</div>');
						for (var j = 0; j < data.length; j++) {
							var $link = $('<a href="javascript:void(null);">'+data[j].fullname+'</a>');
							$link.data('user_id', data[j].user_id);
							var $row = $('<div></div>');
							$div.find('.results').append($row);
							$row.append($link);
						}
						$div.find('input:submit').removeAttr("disabled");
						$div.find('a').click(function() {
							var user_id = parseInt($(this).data('user_id'));
							$.get('api/save_user_books', {id:user_id, selected_ids:[book_id], list_in_index:0}, function() {
								window.location.reload();
							});
							return false;
						});
					});
					return false;
				});
				$div.css('left', ((parseInt($(window).width())/2) - ($div.width()/2) + 'px') );
				$div.css('top', ((parseInt($(window).height())/2) - ($div.height()/2) + parseInt($(window).scrollTop()) + 'px') );				
				$div.show();
			
		}
		</script>
<?
	if (empty($book)):
		echo 'Please select a book to manage using the pulldown menu above';
	else:	
?>	
		<div class="table_wrapper">
		<table cellspacing="0" cellpadding="0" style="width:100%;" class="tablesorter">
		<thead>
			<tr class="head">
				<th></th>
				<th>ID</th>
				<th>Relationship</th>
				<th>In index</th>
				<th>Order</th>				
				<th>Full name</th>
				<th>Email</th>
				<th>URL</th>
			</tr>
		</thead>
		<tbody>
<?
			$count = 1;
			foreach ($current_book_users as $row) {
				echo '<tr typeof="users">';
				echo '<td style="white-space:nowrap;"><a href="javascript:;" onclick="edit_row($(this).parents(\'tr\'));" class="generic_button">Edit</a> <a href="javascript:remove_book_user('.@$book->book_id.','.$row->user_id.');" style="color: rgb(136, 136, 136);" onclick="return confirm(\'Are you sure you wish to REMOVE the connection to '.htmlspecialchars($row->fullname,ENT_QUOTES).'?\');" class="generic_button">Remove</a></td>'."\n";
				echo '<td property="id">'.$row->user_id."</td>\n";
				echo '<td class="editable enum {\'author\',\'commentator\',\'reviewer\',\'reader\'}" property="relationship">'.$row->relationship."</td>\n";
				echo '<td class="editable boolean" property="list_in_index">'.$row->list_in_index."</td>\n";
				echo '<td class="editable number" property="sort_number">'.$row->sort_number."</td>\n";				
				echo '<td property="fullname">'.$row->fullname."</td>\n";
				echo '<td property="email">'.$row->email."</td>\n";
				echo '<td property="url">'.$row->url."</td>\n";
				echo "</tr>\n";
				$count++;
			}
?>
			</tr>
		</tbody>
		</table>
		</div>
		<div style="padding:20px 0 0 0">
			<? if (!empty($book) && $login_is_super): ?>
			<a class="generic_button large" title="Super admin feature" href="javascript:void(null);" onclick="add_book_user(<?=$book->book_id?>);" id="connect_book_user_link">Add a user (admin)</a>
			<? endif ?>
			<a class="generic_button large" href="javascript:void(null);" onclick="request_book_user(<?=$book->book_id?>)" id="request_book_user_link">Add a user</a>
		</div>
		<br />		
<? endif ?>