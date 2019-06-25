		<style>
		.admin-nav-wrap {
			margin:12px 0px 0px 0px;
			width:100%;
		}
		.user-search-form {
			display:inline-block;
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

			var search_text = "<?=isset($_REQUEST['sq'])?htmlspecialchars($_REQUEST['sq']):''?>";
			if(search_text) {
				$('.user-search').val(search_text);
			}

			$('.user-search-form').submit(function() {
				var sq = $(this).children('.user-search').val();
 				window.location.href = "<?=confirm_slash(base_url())?>system/dashboard?zone=all-users&sq=" + encodeURIComponent(sq) + "#tabs-all-users";
				return false;
			});

   			$(window).resize(function() { resizeList(); });
   			resizeList();

   			$('#register_key').click(function() {
   	   			var $this = $(this);
   	   			$this.replaceWith('<span style="padding-left:20px;padding-top:2px;float:right;"><b>key'+(($this.data('key').toString().indexOf(' OR ')!=-1)?'s':'')+'</b>: '+$this.data('key').toString()+'</span>');
   			});

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
		
		<? if (isset($_GET['error']) && $_GET['error']==1): ?>
		<div class="error" style="max-width:none; margin-bottom:16px;">You left out a required field<a style="float:right;" href="?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&zone=all-users#tabs-all-users">clear</a></div>
		<? endif; ?>
		<? if (isset($_GET['error']) && $_GET['error']==2): ?>
		<div class="error" style="max-width:none; margin-bottom:16px;">Password and Retype password did not match<a style="float:right;" href="?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&zone=all-users#tabs-all-users">clear</a></div>
		<? endif; ?>
		<? if (isset($_GET['error']) && $_GET['error']==3): ?>
		<div class="error" style="max-width:none; margin-bottom:16px;">A user with that email address already exists<a style="float:right;" href="?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&zone=all-users#tabs-all-users">clear</a></div>
		<? endif; ?>
		<? if (isset($_REQUEST['action']) && 'deleted'==$_REQUEST['action']): ?>
		<div class="saved" style="max-width:none; margin-bottom:16px;">User has been deleted<a style="float:right;" href="?zone=all-users#tabs-all-users">clear</a></div>
		<? endif ?>
		<? if (isset($_REQUEST['action']) && 'added'==$_REQUEST['action']): ?>
		<div class="saved" style="max-width:none; margin-bottom:16px;">User has been added and is present in the list below<a style="float:right;" href="?zone=all-users#tabs-all-users">clear</a></div>
		<? endif ?>

		<form style="margin:10px 0px 18px 0px; white-space:nowrap;" action="<?=confirm_slash(base_url())?>system/dashboard#tabs-all-users" method="post" onsubmit="checkAddUserForm(this);">
		<input type="hidden" name="zone" value="all-users" />
		<input type="hidden" name="action" value="do_add_user" />
		<? if (!empty($register_key)): ?>
		<a href="javascript:void(null);" id="register_key" style="padding-left:20px; float:right;" class="generic_button" data-key="<?=implode(' OR ', $register_key)?>">Show registration key<?=((count($register_key)>1)?'s':'')?></a>
		<? else: ?>
		<span style="padding-left:20px; padding-top:2px; float:right; color:#777777;">No registration key</span>
		<? endif; ?>
		Add new user: 
		<input tabindex="1" type="text" name="email" value="" placeholder="Email address" style="width:170px;" />&nbsp;
		<input tabindex="2" type="text" name="fullname" value="" placeholder="Full name" style="width:170px;" />&nbsp;
		<input tabindex="3" type="password" name="password_1" value="" placeholder="Password" style="width:170px;" />&nbsp;
		<input tabindex="4" type="password" name="password_2" value="" placeholder="Retype password" style="width:170px;" />&nbsp;
		<input tabindex="5" style="padding:3px 8px 1px 8px !important" type="submit" value="Add" class="generic_button default" />
		</form>

		<div class="table_wrapper">
		<table cellspacing="0" cellpadding="0" class="tablesorter">
			<thead>
				<tr class="head">
					<th></th>
					<th style="display:none;"></th>
					<th>Full name</th>
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
				echo '<td class="editable has_link" property="url"><a href="'.$users[$i]->url.'" target="_blank">'.$users[$i]->url."</a></td>\n";
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
		&nbsp;
		<? endif ?>
		<b class="total"><?=$start+1?> - <?=$start + $count?></b>
		<? if(count($users)-1 == $total): ?>
		 &nbsp;		<span class="prev"><a href="<?=confirm_slash(base_url())?>system/dashboard?zone=all-users&amp;start=<?=$start+$total?>&amp;total=<?=$total?>#tabs-all-users">Next page</a></span>
		<? endif ?>
		<form style="display:inline-block" class="jump-form">
		 	<span>&nbsp;&nbsp;&nbsp;&nbsp;Go to page:</span>
		 	<input style="text-align:right" placeholder="<?=$start/$total+1?>" type="text" class="jump-to-page" size="2" />
		 </form>
		 &nbsp; &nbsp; &nbsp; &nbsp;
		<? endif ?>
		<form class="user-search-form">
		 	<input placeholder="Search for a user" type="text" class="user-search" style="width:170px;" />
			<input type="submit" value="Search" class="generic_button" style="padding:3px 8px 1px 8px !important; vertical-align:top;"  />
			<?=(isset($_REQUEST['id']) && is_numeric($_REQUEST['id'])) ? ' &nbsp; Showing user ID '.$_REQUEST['id'].' &nbsp; ' : ''?>
			<a href="<?=confirm_slash(base_url())?>system/dashboard?zone=all-users&amp;start=<?=$start?>&amp;total=<?=$total?>#tabs-all-users">clear</a>
		 </form>
		</div>
