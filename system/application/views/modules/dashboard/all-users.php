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
		<style>
		.admin-nav-wrap {
			display:inline-block;
			float:right;
			margin: 7px 0;
		}
		</style>
		<script>
		$(document).ready(function() {

			$('.jump-form').submit(function() {
				var x = parseInt($(this).children('.jump-to-page').val());
				if(!isNaN(x)) {
					var start = <?=$total?> * (x-1);
	 				window.location.href = "<?=confirm_slash(base_url())?>system/dashboard?zone=all-users&start=" + start + "&total=<?=$total?>#tabs-all-users";
				}
				return false;
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
		<? if (!empty($users)): ?>
		<div class="admin-nav-wrap">
		<?
			if((count($users)-1) != $total)
				$count = count($users);
			else
				$count = count($users)-1;
		?>
		<? if ($start !== 0 || (count($users)-1) == $total): ?>
		<? if($start !== 0): ?>
		<span class="prev"><a href="<?=confirm_slash(base_url())?>system/dashboard?zone=all-users&amp;start=<?=$start-$total?>&amp;total=<?=$total?>#tabs-all-users">Prev page</a></span>
		<? endif ?>
		&nbsp; <b class="total"><?=$start+1?> - <?=$start + $count?></b>
		<? if(count($users)-1 == $total): ?>
		 &nbsp;		<span class="prev"><a href="<?=confirm_slash(base_url())?>system/dashboard?zone=all-users&amp;start=<?=$start+$total?>&amp;total=<?=$total?>#tabs-all-users">Next page</a></span>
		<? endif ?>
		<form style="display:inline-block" class="jump-form">
		 	<span>&nbsp;&nbsp;&nbsp;&nbsp;Go to page:</span>
		 	<input style="text-align:right" placeholder="<?=$start/$total+1?>" type="text" class="jump-to-page" size="2" />
		 </form>
		<? endif ?>
		</div>
		<? endif ?>
		
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
		if (!empty($users)) {
			if((count($users)-1) != $total)
				$count = count($users);
			else
				$count = count($users)-1;
			for ($i=0;$i<$count;$i++) {
				echo '<tr class="bottom_border" typeof="users">';
				echo '<td style="white-space:nowrap;"><a href="javascript:;" onclick="edit_row($(this).parents(\'tr\'));" class="generic_button">Edit</a> <a style="color:#888888;" href="'.confirm_slash(base_url()).'system/dashboard?action=do_delete&delete='.$users[$i]->user_id.'&type=users&zone=all-users#tabs-all-users" onclick="if (!confirm(\'Are you sure you wish to DELETE this user?\')) return false;" class="generic_button">Remove</a></td>'."\n";
				echo '<td property="id" style="display:none;">'.$users[$i]->user_id."</td>\n";
				echo '<td class="editable" property="fullname">'.$users[$i]->fullname."</td>\n";
				echo '<td class="editable" property="email">'.$users[$i]->email."</td>\n";
				echo '<td class="editable" property="password">'.(strlen($users[$i]->password)?str_repeat('&bull;', 10):'')."</td>\n";
				echo '<td class="editable" property="url">'.$users[$i]->url."</td>\n";
				echo '<td>';
				foreach ($users[$i]->books as $book) {
					echo '<a href="'.confirm_slash(base_url()).$book->slug.'">';
					echo $book->title;
					echo '</a>, '.$book->relationship.'<br />';
				}
				echo "</td>\n";
				echo "</tr>\n";
			}
		}
?>
			</tbody>
		</table>
		</div>
		<? if (!empty($users)): ?>
		<div class="admin-nav-wrap">
		<?
			if((count($users)-1) != $total)
				$count = count($users);
			else
				$count = count($users)-1;
		?>
		<? if ($start !== 0 || (count($users)-1) == $total): ?>
		<? if($start !== 0): ?>
		<span class="prev"><a href="<?=confirm_slash(base_url())?>system/dashboard?zone=all-users&amp;start=<?=$start-$total?>&amp;total=<?=$total?>#tabs-all-users">Prev page</a></span>
		<? endif ?>
		&nbsp; <b class="total"><?=$start+1?> - <?=$start + $count?></b>
		<? if(count($users)-1 == $total): ?>
		 &nbsp;		<span class="prev"><a href="<?=confirm_slash(base_url())?>system/dashboard?zone=all-users&amp;start=<?=$start+$total?>&amp;total=<?=$total?>#tabs-all-users">Next page</a></span>
		<? endif ?>
		<form style="display:inline-block" class="jump-form">
		 	<span>&nbsp;&nbsp;&nbsp;&nbsp;Go to page:</span>
		 	<input style="text-align:right" placeholder="<?=$start/$total+1?>" type="text" class="jump-to-page" size="2" />
		 </form>
		<? endif ?>
		</div>		
		<? endif ?>

		<br />		