<?$this->template->add_js(path_from_file(__FILE__).'tablesorter/jquery.tablesorter.min.js')?>
<?$this->template->add_css(path_from_file(__FILE__).'tablesorter/style.css')?>

<? if ('deleted'==@$_REQUEST['action']): ?>
<div class="saved">
<a style="float:right;" href="?zone=all-users#tabs-all-users">clear</a>
User has been deleted
</div><br />
<? endif ?>	
<? if ('added'==@$_REQUEST['action']): ?>
<div class="saved">
<a style="float:right;" href="?zone=all-users#tabs-all-users">clear</a>
User has been added
</div><br />
<? endif ?>	

		<script>
		$(document).ready(function() {
			
			$(".tablesorter").tablesorter({ 
        		headers: { 
        			0: {sorter: false },
       				1: {sorter: false }, // this column is hidden
        			4: {sorter: false },
        			6: {sorter: false }
        		}
   			});  					
   			
   			$(window).resize(function() { resizeList(); });
   			resizeList();
   			
		});	
		
		function resizeList() {
    		$('.table_wrapper').height(Math.max(200, $(window).height() - ($('.table_wrapper').offset().top + 60))+'px'); // magic number to get list height right
		}

		function checkAddUserForm(the_form) {
			var $form = $(the_form);
			var password = $form.find("input[tabindex='3']");
			if (password.val() == 'password') password.val('');
			var book_title = $form.find("input[tabindex='4']");
			if (book_title.val() == 'title of first book (optional)') book_title.val('');		
		}
		</script>		
		
		<form  action="<?=confirm_slash(base_url())?>system/dashboard#tabs-all-users" method="post" onsubmit="checkAddUserForm(this);">
		<input type="hidden" name="zone" value="all-users" />
		<input type="hidden" name="action" value="do_add_user" />
		Add new user: <input tabindex="1" type="text" name="fullname" value="full name" style="width:180px;" onfocus="if (this.value=='full name') this.value='';" />&nbsp; 
		<input tabindex="2" type="text" name="email" value="email" style="width:180px;" onfocus="if (this.value=='email') this.value='';" />&nbsp; 
		<input tabindex="3" type="text" name="password" value="password" style="width:180px;" onfocus="if (this.value=='password') {this.value=''; this.type='password';}" />&nbsp; 		
		<input tabindex="4" type="text" name="book_title" value="title of first book (optional)" style="width:180px;" onfocus="if (this.value=='title of first book (optional)') this.value='';" />&nbsp; 
		<input type="submit" value="Go" class="generic_button" />
		</form>				
		
		<br clear="both" />
		
		<div class="table_wrapper">
		<table cellspacing="0" cellpadding="0" class="tablesorter">
			<thead>
				<tr class="head">
					<th></th>
					<th style="display:none;"></th>
					<th>User</th>
					<th>Email</th>
					<th>Password</th>
					<th>URL</th>
					<th>Books</th>
				</tr>
			</thead>
			<tbody>
<?
		$count = 1;
		if (!empty($users)) {
			foreach ($users as $row) {
				echo '<tr class="bottom_border" typeof="users">';
				echo '<td style="white-space:nowrap;"><a href="javascript:;" onclick="edit_row($(this).parents(\'tr\'));" class="generic_button">Edit</a> <a style="color:#888888;" href="'.confirm_slash(base_url()).'system/dashboard?action=do_delete&delete='.$row->user_id.'&type=users&zone=all-users#tabs-all-users" onclick="if (!confirm(\'Are you sure you wish to DELETE this user?\')) return false;" class="generic_button">Remove</a></td>'."\n";
				echo '<td property="id" style="display:none;">'.$row->user_id."</td>\n";
				echo '<td class="editable" property="fullname">'.$row->fullname."</td>\n";
				echo '<td class="editable" property="email">'.$row->email."</td>\n";
				echo '<td class="editable" property="password">'.(strlen($row->password)?str_repeat('&bull;', 10):'')."</td>\n";
				echo '<td class="editable" property="url">'.$row->url."</td>\n";
				echo '<td>';
				foreach ($row->books as $book) {
					echo '<a href="'.confirm_slash(base_url()).$book->slug.'">';
					echo $book->title;
					echo '</a>, '.$book->relationship.'<br />';
				}
				echo "</td>\n";
				echo "</tr>\n";
				$count++;
			}
		}
?>
			</tbody>
		</table>
		</div>

		<br />		