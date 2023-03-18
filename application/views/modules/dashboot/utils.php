<?$this->template->add_css('application/views/modules/dashboot/css/custom.jquery-ui.min.css')?>
<?$this->template->add_css('application/views/modules/dashboot/css/bootstrap-dialog.min.css')?>
<?$this->template->add_js('application/views/modules/dashboot/js/custom.jquery-ui.min.js')?>
<?$this->template->add_js('application/views/modules/dashboot/js/bootstrap-dialog.min.js')?>
<?$this->template->add_css('
.section {display:none;}
#import {display:block;}
.m {margin-top:18px; margin-bottom:22px;}
.i {width:100%; border:0; margin:0; padding:0; margin-top:16px;}
.div_list {width:100%; height:300px; box-shadow:inset 0 1px 1px rgba(0,0,0,.075); border-radius:4px; border:solid 1px #aaaaaa; overflow:auto; resize:vertical; white-space:nowrap;}
.div_list > div {padding:0px 10px 0px 10px;}
.div_list > div > input[type="checkbox"], .div_list > div label {cursor:pointer;}
.div_list > div.active {background-color:#eeeeee;}
#do_delete_users_form, #do_delete_books_form {margin-top:6px; text-align:right;}
', 'embed')?>
<?
$pill = (isset($_GET['pill']) && !empty($_GET['pill'])) ? $_GET['pill'] : 'import';
?>

<script>
$(document).ready(function() {
	$('.nav-pills').find('li').on('click', function() {
		var $this = $(this);
		$this.closest('.nav').find('li').removeClass('active');
		$this.addClass('active');
		$this.closest('.row').find('.section').hide();
		var $section = $this.closest('.row').find('#'+$this.data('id'));
		$section.show();
	});
	if (-1!=document.location.href.indexOf('&pill=')) {
		var pill = document.location.href.substr(document.location.href.indexOf('&pill=')+6);
		if (pill.indexOf('&')!=-1) pill = pill.substr(0, pill.indexOf('&'));
		if (pill.indexOf('#')!=-1) pill = pill.substr(0, pill.indexOf('#'));
		$('.nav-pills:first').find('[data-id="'+pill+'"]').trigger('click');
	};
	$('.export-link').on('click', function(e) {
		e.preventDefault();
		var url = $(this).attr('href');
		var $content = $('#export-content').show();
		$content.find('#export-content-url').html('<a href="'+url+'">'+url+'</a>');
		$content.find('#export-content-text').val('Loading...');
		$.get(url, function(data) {
			$content.find('#export-content-text').val(data);
		}, 'text');
	});
	$('#do_delete_books_form').on('submit', function() {
		if (!$(this).prev().find('input:checked').length) return false;
		var msg='Are you sure you wish to delete the selected books';
		if ($(this).find('[name="delete_creators"]').val()==1) msg+=' and their creator user accounts';
		if (!confirm(msg+'?')) return false;
		var book_ids=[];
		$(this).prev().find('input:checked').each(function() {
			book_ids.push($(this).val());
		});
		$(this).find('[name="book_ids"]').val(book_ids.join(','));
		return true;
	});
	$('#do_delete_users_form').on('submit', function() {
		if (!$(this).prev().find('input:checked').length) return false;
		var msg='Are you sure you wish to delete the selected users';
		if ($(this).find('[name="delete_books"]').val()==1) msg+=' and books they author';
		msg += '?';
		if ($(this).find('[name="delete_books"]').val()==1) msg+=' This might include books with multiple authors.';
		if (!confirm(msg)) return false;
		var user_ids=[];
		$(this).prev().find('input:checked').each(function() {
			user_ids.push($(this).val());
		});
		$(this).find('[name="user_ids"]').val(user_ids.join(','));
		return true;
	});
	$('.div_list').find('input[type="checkbox"]').on('change', function() {
		var checked = $(this).is(':checked') ? true : false;
		if (checked) {
			$(this).closest('div').addClass('active');
		} else {
			$(this).closest('div').removeClass('active');
		};
	});
});
</script>
<div class="container-fluid properties">
  <div class="row">
    <aside class="col-xs-2" style="width:21%;">
	  <ul class="nav nav-pills nav-stacked">
	    <li class="active" data-id="import"><a href="?book_id=<?=((isset($book) && !empty($book))?$book->book_id:'0')?>&zone=utils&pill=import#tabs-utils">Import</a></li>
	    <li data-id="export"><a href="?book_id=<?=((isset($book) && !empty($book))?$book->book_id:'0')?>&zone=utils&pill=export#tabs-utils">Export</a></li>
	    <li data-id="api-explorer"><a href="?book_id=<?=((isset($book) && !empty($book))?$book->book_id:'0')?>&zone=utils&pill=api-explorer#tabs-utils">API Explorer</a></li>
<? if ($login_is_super): ?>
		<li class="admin" data-id="google-authenticator"><a href="?book_id=<?=((isset($book) && !empty($book))?$book->book_id:'0')?>&zone=utils&pill=google-authenticator#tabs-utils">Google Authenticator</a></li>
		<li class="admin" data-id="disallowed-emails"><a href="?book_id=<?=((isset($book) && !empty($book))?$book->book_id:'0')?>&zone=utils&pill=disallowed-emails#tabs-utils">Disallowed emails</a></li>
		<li class="admin" data-id="manage-users"><a href="?book_id=<?=((isset($book) && !empty($book))?$book->book_id:'0')?>&zone=all-users&pill=manage-users#tabs-utils">Manage users</a></li>
		<li class="admin" data-id="manage-books"><a href="?book_id=<?=((isset($book) && !empty($book))?$book->book_id:'0')?>&zone=all-books&pill=manage-books#tabs-utils">Manage books</a></li>
		<li class="admin" data-id="generate-email-list"><a href="?book_id=<?=((isset($book) && !empty($book))?$book->book_id:'0')?>&zone=utils&pill=generate-email-list#tabs-utils">Generate email list</a></li>
		<li class="admin" data-id="recreate-book-folders"><a href="?book_id=<?=((isset($book) && !empty($book))?$book->book_id:'0')?>&zone=utils&pill=recreate-book-folders#tabs-utils">Recreate book folders</a></li>
		<li class="admin" data-id="list-all-users"><a href="?book_id=<?=((isset($book) && !empty($book))?$book->book_id:'0')?>&zone=utils&pill=list-all-users#tabs-utils">List all users</a></li>
		<li class="admin" data-id="list-all-books"><a href="?book_id=<?=((isset($book) && !empty($book))?$book->book_id:'0')?>&zone=utils&pill=list-all-books#tabs-utils">List all books</a></li>
		<li class="admin" data-id="list-recent-pages"><a href="?book_id=<?=((isset($book) && !empty($book))?$book->book_id:'0')?>&zone=utils&pill=list-recent-pages#tabs-utils">List recently edited pages</a></li>
		<li class="admin" data-id="normalize-id2val"><a href="?book_id=<?=((isset($book) && !empty($book))?$book->book_id:'0')?>&zone=utils&pill=normalize-id2val#tabs-utils">Normalize predicate table</a></li>
<? endif ?>
	  </ul>
    </aside>
    <section class="col-xs-10" style="width:79%;">
    	<div class="section" id="import">
    	<?php if ('import'==$pill): ?>
    		<h4>Import</h4>
	        <p class="m">Import content and relationships from public Scalar books, raw Scalar RDF-JSON, or comma seperated values files. For more information visit the <a href="http://scalar.usc.edu/works/guide2">Scalar 2 Guide</a>'s <a href="http://scalar.usc.edu/works/guide2/advanced-topics">Advanced Topics</a> path.</p><?php
	        $path = 'application/plugins/transfer/index.html';
	        $get_vars = '';
	        if (!empty($book)) {
	        	$dest_url = confirm_slash(base_url()).$book->slug;
	        	$email = $login->email;
	        	$source_url = (isset($_REQUEST['source_url']) && !empty($_REQUEST['source_url'])) ? $_REQUEST['source_url'] : '';
	        	$get_vars = '?dest_url=' . $dest_url . '&dest_id=' . $email . ((!empty($source_url)) ? ('&source_url='.$source_url) : '');
	        }
	        echo '<div class="plugin transfer">';
	        if (file_exists(FCPATH.$path)) {
	        	echo '<iframe style="width:100%; min-height:700px; border:none;" src="'.confirm_slash(base_url()).$path.$get_vars.'"></iframe>'."\n";
	        	//echo '<iframe style="width:100%; min-height:700px; border:none;" src="http://localhost/scalar-book-transfer-tool/index.html'.$get_vars.'"></iframe>'."\n";
	        } else {
	        	echo '<div class="alert alert-warning">Please contact a system administrator to install the <b>Transfer</b> plugin at <b style="white-space:nowrap;">/application/plugins/transfer</b>.</div>';
	        }
	        echo '</div>';
    		?>
    	<?php endif; ?>
    	</div>
    	<div class="section" id="export">
    	<?php if ('export'==$pill): ?>
    		<?php
    			$rdf_url_json = confirm_slash(base_url()).$book->slug.'/rdf/instancesof/content?format=json&rec=1&ref=1&';
    			$rdf_url_xml = confirm_slash(base_url()).$book->slug.'/rdf/instancesof/content?&rec=1&ref=1';
    		?>
    		<h4>Export</h4>
	        <p class="m">
	        	Use the buttons below to generate exports containing all pages and relationships in this work (physical media
				files are not included). This data can be used for backing up your book, for importing at a later date, or for using the data in other ways. The export
			    process may take a minute or two depending on the amount of content in the project. For more information see
			    the <a href="http://scalar.usc.edu/works/guide2/working-with-the-api">Working with the API</a> path in the <a href="http://scalar.usc.edu/works/guide2">Scalar 2 Guide</a>, or to
			    explore the API more thoroughly head over to the API Explorer utlity.
			</p>
			<p>
	       		<a class="btn btn-default export-link" href="<?=$rdf_url_json?>" style="width:160px;">Export as RDF-JSON</a> &nbsp; &nbsp;
  				<small>Best for using with the Scalar Import/Transfer tool</small><br /><br />
  				<a class="btn btn-default export-link" href="<?=$rdf_url_xml?>" style="width:160px;">Export as RDF-XML</a> &nbsp; &nbsp;
  				<small>Best for working with external Semantic Web applications</small>
	     	</p>
	     	<p class="m" id="export-content">
	     		<small>URL: <span id="export-content-url"></span></small>
	     		<textarea id="export-content-text" class="form-control"></textarea>
	     	</p>
	    <?php endif; ?>
    	</div>
    	<div class="section" id="api-explorer">
    	<?php if ('api-explorer'==$pill): ?>
    		<h4>API Explorer</h4>
    		<div class="m">
				<p>You can use this utility to:</p>
				<ul>
					<li>Generate API queries for this Scalar book</li>
					<li>Grab an excerpt of this book to copy to another using the Import tool</li>
					<li>Get word counts for specific pages, groups of pages, or the entire book</li>
				</ul>
    		</div><?php
	        $path = 'application/plugins/apiexplorer/index.html';
	        $get_vars = '?book_url='.confirm_slash(base_url()).$book->slug;
	        echo '<div class="plugin apiexplorer">';
	        if (file_exists(FCPATH.$path)) {
	        	echo '<iframe id="api-explorer-frame" style="width:100%; min-height:700px; border:none;" src="'.confirm_slash(base_url()).$path.$get_vars.'"></iframe>'."\n";
	        } else {
	        	echo '<div class="alert alert-warning">Please contact a system administrator to install the <b>API Explorer</b> plugin at <b style="white-space:nowrap;">/application/plugins/apiexplorer</b>.</div>';
	        }
	        echo '</div>';
	        ?>
	    <?php endif; ?>
    	</div>
    	<div class="section" id="manage-users">
    	<?php if ('manage-users'==$pill): ?>
    		<h4>
	    		<? if (!empty($register_key)): ?>
				<a href="javascript:void(null);" id="register_key" style="float:right;" class="btn btn-warning btn-sm" data-key="<?=implode(' OR ', $register_key)?>">Show registration key<?=((count($register_key)>1)?'s':'')?></a>
				<? else: ?>
				<small style="float:right;">No registration key</small>
				<? endif; ?>
    			Manage users
    		</h4>
			<style>
			.admin-nav-wrap {margin-top:18px;}
			.table_wrapper {margin-top:8px; overflow:auto; margin-bottom:12px;}
			.jump-form input {border-radius:5px; border-color:#aaaaaa; border-style:solid; border-width:1px;}
			#manage-users-add-new input {margin-bottom:4px;}
			.table_wrapper td {font-size:smaller;}
			.alert {max-width:none;margin-bottom:16px;padding:10px;}
			</style>
			<script>
			$(document).ready(function() {

				$('.jump-form').on('submit', function() {
					var x = parseInt($(this).children('.jump-to-page').val());
					if(!isNaN(x)) {
						var start = <?=$total?> * (x-1);
		 				window.location.href = "<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&zone=all-users&pill=manage-users&start=" + start + "&total=<?=$total?>#tabs-utils";
					}
					return false;
				});

				var search_text = "<?=isset($_REQUEST['sq'])?htmlspecialchars($_REQUEST['sq']):''?>";
				if (search_text) {
					$('.user-search').val(search_text);
				}

				$('.user-search-form').on('submit', function() {
					var sq = $(this).find('.user-search').val();
	 				window.location.href = "<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&zone=all-users&pill=manage-users&sq=" + encodeURIComponent(sq) + "#tabs-utils";
					return false;
				});

	   			$(window).on('resize', function() { resizeList(); });
	   			resizeList();

	   			$('#register_key').on('click', function() {
	   	   			var $this = $(this);
	   	   			$this.replaceWith('<small style="padding-left:20px;padding-top:8px;float:right;cursor:pointer;"><b>key'+(($this.data('key').toString().indexOf(' OR ')!=-1)?'s':'')+'</b>: '+$this.data('key').toString()+'</small>');
	   			});

			});

			function resizeList() {
	    		$('.table_wrapper').height(Math.max(200, $(window).height() - ($('.table_wrapper').offset().top + 80))+'px'); // magic number to get list height right
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
			<div class="alert alert-danger">You left out a required field<a style="float:right;" href="?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&pill=manage-users&zone=all-users#tabs-utils">clear</a></div>
			<? elseif (isset($_GET['error']) && $_GET['error']==2): ?>
			<div class="alert alert-danger">Password and Retype password did not match<a style="float:right;" href="?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&pill=manage-users&zone=all-users#tabs-utils">clear</a></div>
			<? elseif (isset($_GET['error']) && $_GET['error']==3): ?>
			<div class="alert alert-danger">A user with that email address already exists<a style="float:right;" href="?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&pill=manage-users&zone=all-users#tabs-utils">clear</a></div>
			<? elseif (isset($_GET['error'])): ?>
			<div class="alert alert-danger"><? echo $_GET['error']; ?><a style="float:right;" href="?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&pill=manage-users&zone=all-users#tabs-utils">clear</a></div>
			<? endif; ?>
			<? if (isset($_REQUEST['action']) && 'deleted'==$_REQUEST['action']): ?>
			<div class="alert alert-success">User has been deleted<a style="float:right;" href="?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&pill=manage-users&zone=all-users#tabs-utils">clear</a></div>
			<? endif ?>
			<? if (isset($_REQUEST['action']) && 'added'==$_REQUEST['action']): ?>
			<div class="alert alert-success">User has been added and is present in the list below<a style="float:right;" href="?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&pill=manage-users&zone=all-users#tabs-utils">clear</a></div>
			<? endif ?>

			<div class="admin-nav-wrap">
			<?
				if((count($users)-1) != $total)
					$count = count($users);
				else
					$count = count($users)-1;
			?>
			<? if ($start !== 0 || (count($users)-1) == $total): ?>
			  <small style="float:left;padding-top:4px;">
			  <? if ($start !== 0): ?>
			    <span class="prev"><a href="<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&zone=all-users&pill=manage-users&start=<?=$start-$total?>&total=<?=$total?>#tabs-utils">Prev page</a></span> &nbsp;
			  <? endif ?>
			  <b class="total"><?=$start+1?> - <?=$start + $count?></b>
			  <? if(count($users)-1 == $total): ?>
			    &nbsp; <span class="prev"><a href="<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&zone=all-users&pill=manage-users&start=<?=$start+$total?>&total=<?=$total?>#tabs-utils">Next page</a></span>
			  <? endif ?>
			  <form style="display:inline-block" class="jump-form">
			 	<span>&nbsp;&nbsp;&nbsp;&nbsp;Go to page: &nbsp; </span>
			 	<input style="text-align:right" placeholder="<?=$start/$total+1?>" type="text" class="jump-to-page" size="2" />
			  </form>
			  &nbsp; &nbsp; &nbsp; &nbsp;
			  </small>
			<? endif ?>
			<form class="form-inline user-search-form" style="<?=(($start !== 0 || (count($users)-1) == $total)?'float:right;':'float:left;')?>">
				<div class="form-group form-group-sm">
				 	<input placeholder="Search for a user" type="text" class="form-control user-search" />
					<input type="submit" value="Search" class="btn btn-sm" />
					<?=(isset($_REQUEST['id']) && is_numeric($_REQUEST['id'])) ? ' &nbsp; Showing user ID '.$_REQUEST['id'].' &nbsp; ' : ''?>
					<small style="padding-left:3px;"><a href="<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&zone=all-users&pill=manage-users#tabs-utils">clear</a></small>
				</div>
			 </form>
			 <br clear="both" />
			</div>

			<div class="table_wrapper">
			<table cellspacing="0" cellpadding="0" class="table table-sm">
				<thead>
					<tr>
						<th></th>
						<th style="display:none;"></th>
						<th>Full name</th>
						<th>Email</th>
						<th>Password</th>
						<th>URL</th>
						<th>Books</th>
						<th>Actions</th>
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
					echo '<td style="white-space:nowrap;"><a style="color:#337ab7" title="Edit this row" href="javascript:;" onclick="edit_row($(this).parents(\'tr\'));">';
					echo '<span class="glyphicon glyphicon-pencil edit_button" aria-hidden="true"></span>';
					echo '</a> &nbsp; ';
					echo '<a style="color:#ac2925;" title="Delete this row" href="'.confirm_slash(base_url()).'system/dashboard?action=do_delete&book_id='.((isset($book->book_id))?$book->book_id:0).'&delete='.$users[$i]->user_id.'&type=users&zone=all-users&pill=manage-users&tab=tabs-utils" onclick="if (!confirm(\'Are you sure you wish to DELETE this user?\')) return false;">';
					echo '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
					echo '</a></td>'."\n";
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
					$user_is_deactivated = false;
					if (isset($disallowed_emails)) {
						if (in_array($users[$i]->email, $disallowed_emails)) {
							$user_is_deactivated = true;
						}
					}
					if (!$user_is_deactivated) {
						echo '<td><a href="'.confirm_slash(base_url()).'system/dashboard?action=do_deactivate&user_id='.$users[$i]->user_id.'&type=users&zone=all-users&pill=manage-users&tab=tabs-utils" onclick="if (!confirm(\'Are you sure you wish to DEACTIVATE this user? This will make all of their books private and add their email to the disallowed list, preventing them from logging in.\')) return false;">Deactivate</a><br />';
					} else {
						echo '<td>Inactive<br />';
					}
					echo "</td>\n";
					echo "</tr>\n";
				}
			}
	?>
				</tbody>
			</table>
			</div>
			<form class="form-inline" action="<?=confirm_slash(base_url())?>system/dashboard" method="post" onsubmit="checkAddUserForm(this);">
			<input type="hidden" name="zone" value="all-users" />
			<input type="hidden" name="hash" value="#tabs-utils" />
			<input type="hidden" name="pill" value="manage-users" />
			<input type="hidden" name="book_id" value="<?=((isset($book->book_id))?$book->book_id:0)?>" />
			<input type="hidden" name="action" value="do_add_user" />
			<small>Add new user:</small>
			<div id="manage-users-add-new" class="form-group form-group-sm">
				<input tabindex="1" class="form-control" type="text" name="email" value="" placeholder="Email address" />&nbsp;
				<input tabindex="2" class="form-control" type="text" name="fullname" value="" placeholder="Full name" />&nbsp;
				<input tabindex="3" class="form-control" type="password" name="password_1" value="" placeholder="Password" />&nbsp;
				<input tabindex="4" class="form-control" type="password" name="password_2" value="" placeholder="Retype password" />&nbsp;
				<input tabindex="5" class="btn btn-sm" type="submit" value="Add" />
			</div>
			</form>
    	<?php endif; ?>
    	</div>
    	<div class="section" id="google-authenticator">
    	<?php if ('google-authenticator'==$pill): ?>
			<form action="<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book)&&!empty($book))?$book->book_id:0)?>&zone=utils&pill=google-authenticator#tabs-utils" method="post">
			<input type="hidden" name="zone" value="utils" />
			<input type="hidden" name="pill" value="google-authenticator" />
			<input type="hidden" name="action" value="enable_google_authenticator" />
			<h4>Google Authenticator</h4><br />
			<div><div style="width:50%;float:left;"><?php
				$salt = $this->config->item('google_authenticator_salt');
				if (empty($salt)) {
					echo 'Two factor authentication is disabled. To enable, enter a "google_authenticator_salt" key in local_settings.php.'."\n";
				} else {
					echo 'To enable two-factor authentication for your super admin account (<b>'.$login->email.'</b>) first open Google Authenticator on your device and scan the QR code:<br />'."\n";
					echo $qr_image;
					echo '<br />';
					echo 'Then, check the box below to enable two-factor authentication for your account:<br />';
					echo '<label><input style="margin-top:8px;" type="checkbox" name="enable_google_authenticator" value="1" '.(($google_authenticator_is_enabled)?'checked':'').' /> &nbsp;Enable two-factor authentication for my account</labe><br />';
					echo '<input type="submit" value="Save" class="btn btn-primary" style="margin-top:8px;" />';
				}
			?></div><div style="width:50%;float:right;border-left:solid 1px #aaaaaa;padding-left:20px;">
				List of super admins (<b>bold</b> = authentication enabled):<br /><br /><?php
				foreach ($super_admins as $admin) {
					$enabled = (isset($admin->google_authenticator_is_enabled) && $admin->google_authenticator_is_enabled) ? true : false;
					echo (($enabled)?'<b>':'').$admin->fullname.' ('.$admin->email.')'.(($enabled)?'</b>':'').'<br />';
				}
				?>
			</div></div>
			</form>
		<?php endif; ?>
    	</div>
    	<div class="section" id="disallowed-emails">
    	<?php if ('disallowed-emails'==$pill): ?>
			<form action="<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book)&&!empty($book))?$book->book_id:0)?>&zone=utils&pill=disallowed-emails#tabs-utils" method="post" id="disallowed_emails_form">
			<input type="hidden" name="zone" value="utils" />
			<input type="hidden" name="action" value="get_disallowed_emails" />
			<h4>Disallowed emails</h4>
			<?php
			if (isset($_POST['action']) && $_POST['action'] == 'do_save_disallowed_emails') {
				echo '<div class="alert alert-success" style="margin-left:0px; margin-right:0px;">List of disallowed emails has been saved</div>';
			}
			?>
			Disallow email addresses from being used to register or login<br /><br />
			<div class="div_list"><?php
			if (!isset($disallowed_emails)) {

			} elseif (empty($disallowed_emails)) {

			} else {
				foreach($disallowed_emails as $email) {
					echo '<div><label>';
					echo '<input type="checkbox" name="email[]" value="'.$email.'" /> &nbsp; ';
					echo $email;
					echo '</label></div>'."\n";
				}
			}
			?></div></form>
			<?php
			if (isset($disallowed_emails)) {
				echo '<form id="do_remove_disallowed_emails" action="'.confirm_slash(base_url()).'system/dashboard?book_id='.((isset($book)&&!empty($book))?$book->book_id:0).'&zone=utils&pill=disallowed-emails#tabs-utils" method="post" style="display:inline-block;margin-top:3px;float:right;">';
				echo '<input type="hidden" name="action" value="do_save_disallowed_emails" />';
				echo '<input type="hidden" name="emails" value="" />';
				echo '<input type="submit" class="btn btn-default" value="Remove selected from list" />';
				echo '</form>';
				echo '<form id="do_save_disallowed_emails" action="'.confirm_slash(base_url()).'system/dashboard?book_id='.((isset($book)&&!empty($book))?$book->book_id:0).'&zone=utils&pill=disallowed-emails#tabs-utils" method="post" style="display:inline-block;margin-top:3px;">';
				echo '<input type="hidden" name="action" value="do_save_disallowed_emails" />';
				echo '<input type="hidden" name="emails" value="" />';
				echo '<input type="text" name="email" value="" placeholder="name@example.com" class="form-control" style="display:inline-block;width:200px;position:relative;top:1px;" /> ';
				echo '<input type="submit" value="Add email" class="btn btn-primary" /> &nbsp; ';
				echo '</form>'."\n";
			}
			?>
			<br />
			<script>
			$('#do_remove_disallowed_emails').on('submit', function() {
    			var emails = [];
    			$('#disallowed_emails_form').find('.div_list').find('input[type="checkbox"]').each(function() {
        			var $this = $(this);
        			if ($this.is(':checked')) return;
    				var _email = $(this).val();
    				emails.push(_email);
    			});
    			emails.sort();
    			$(this).find('input[name="emails"]').val(emails.join(','));
    			return true;
			});
    		$('#do_save_disallowed_emails').on('submit', function() {
    			var email = $(this).find('[name="email"]').val();
    			if (!email.length) return false;
    			var emails = [email];
    			$('#disallowed_emails_form').find('.div_list').find('input[type="checkbox"]').each(function() {
    				var _email = $(this).val();
    				emails.push(_email);
    			});
    			emails.sort();
    			$(this).find('input[name="emails"]').val(emails.join(','));
    			return true;
    		});
    		$('#disallowed_emails_form').find('.div_list').on('click', 'a', function() {
    			$(this).parent().remove();
    		});
    		</script>
		<?php endif; ?>
    	</div>
    	<div class="section" id="manage-books">
    	<?php if ('manage-books'==$pill): ?>
    		<h4>Manage books</h4>
			<style>
			.admin-nav-wrap {margin-top:18px;}
			.table_wrapper {margin-top:8px; overflow:auto; margin-bottom:12px;}
			.jump-form input {border-radius:5px; border-color:#aaaaaa; border-style:solid; border-width:1px;}
			#manage-books-add-new input, #manage-books-add-new select {margin-bottom:4px;}
			.table_wrapper td {font-size:smaller;}
			.alert {max-width:none;margin-bottom:16px;padding:10px;}
			</style>
			<script>
			$(document).ready(function() {

				$('.jump-form').on('submit', function() {
					var x = parseInt($(this).children('.jump-to-page').val());
					if(!isNaN(x)) {
						var start = <?=$total?> * (x-1);
		 				window.location.href = "<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&zone=all-books&pill=manage-books&start=" + start + "&total=<?=$total?>#tabs-utils";
					}
					return false;
				});

				var search_text = "<?=isset($_REQUEST['sq'])?htmlspecialchars($_REQUEST['sq']):''?>";
				if(search_text) {
					$('.book-search').val(search_text);
				}

				$('.book-search-form').on('submit', function() {
					var sq = $(this).find('.book-search').val();
	 				window.location.href = "<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&pill=manage-books&zone=all-books&sq=" + encodeURIComponent(sq) + "#tabs-utils";
					return false;
				});

	   			$(window).on('resize', function() { resizeList(); });
	   			resizeList();

			});

			function resizeList() {
	    		$('.table_wrapper').height(Math.max(200, $(window).height() - ($('.table_wrapper').offset().top + 80))+'px'); // magic number to get list height right
			}
			</script>

			<? if (isset($_GET['error']) && $_GET['error']==1): ?>
			<div class="alert alert-warning">Title is a required field<a style="float:right;" href="?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&pill=manage-books&zone=all-books#tabs-utils">clear</a></div>
			<? endif; ?>
			<? if (isset($_REQUEST['action']) && 'deleted'==$_REQUEST['action']): ?>
			<div class="alert alert-success" style="max-width:none; margin-bottom:16px;">
			<a style="float:right;" href="?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&pill=manage-books&zone=all-books#tabs-utils">clear</a>
			Book has been deleted
			</div>
			<? endif ?>
			<? if (isset($_REQUEST['action']) && 'added'==$_REQUEST['action']): ?>
			<div class="alert alert-success" style="max-width:none; margin-bottom:16px;">
			<a style="float:right;" href="?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&pill=manage-books&zone=all-books#tabs-utils">clear</a>
			Book has been added and is present in the list below
			</div>
			<? endif ?>

			<div class="admin-nav-wrap">
			<?
				if((count($books)-1) != $total)
					$count = count($books);
				else
					$count = count($books)-1;
			?>
			<? if ($start !== 0 || (count($books)-1) == $total): ?>
			  <small style="float:left;padding-top:4px;">
				  <? if($start !== 0): ?>
				    <span class="prev"><a href="<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&pill=manage-books&zone=all-books&amp;start=<?=$start-$total?>&amp;total=<?=$total?>#tabs-utils">Prev page</a></span> &nbsp;
				  <? endif ?>
				  <b class="total"><?=$start+1?> - <?=$start + $count?></b>
				  <? if(count($books)-1 == $total): ?>
				    &nbsp; <span class="next"><a href="<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&pill=manage-books&zone=all-books&amp;start=<?=$start+$total?>&amp;total=<?=$total?>#tabs-utils">Next page</a></span>
				  <? endif ?>
				  <form style="display:inline-block" class="jump-form">
				 	<span>&nbsp;&nbsp;&nbsp;&nbsp;Go to page: &nbsp; </span>
				 	<input style="text-align:right" placeholder="<?=$start/$total+1?>" type="text" class="jump-to-page" size="2" />
				   </form>
		           &nbsp; &nbsp; &nbsp; &nbsp;
	           </small>
			<? endif ?>
			<form class="form-inline book-search-form" style="<?=(($start !== 0 || (count($users)-1) == $total)?'float:right;':'float:left;')?>">
				<div class="form-group form-group-sm">
				 	<input placeholder="Search for a book" type="text" class="form-control book-search" />
					<input type="submit" value="Search" class="btn btn-sm" />
					<?=(isset($_REQUEST['id']) && is_numeric($_REQUEST['id'])) ? ' &nbsp; Showing book ID '.$_REQUEST['id'].' &nbsp; ' : ''?>
					<small style="padding-left:3px;"><a href="<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&pill=manage-books&zone=all-books&amp;start=<?=$start?>&amp;total=<?=$total?>#tabs-utils">clear</a></small>
				</div>
			</form>
			<br clear="both" />
			</div>

			<div class="table_wrapper">
			<table cellspacing="0" cellpadding="0" class="table table-sm">
				<thead>
					<tr>
						<th></th>
						<th style="display:none;">ID</th>
						<th style="display:none;">Book Id</th>
						<th style="white-space:nowrap;">Title</th>
						<th style="white-space:nowrap;">URI</th>
						<th style="white-space:nowrap;">Public</th>
						<th style="white-space:nowrap;">In index</th>
						<th style="white-space:nowrap;">Featured</th>
						<th style="white-space:nowrap;">Contributors</th>
						<th style="white-space:nowrap;">Created</th>
					</tr>
				</thead>
				<tbody>
	<?
			if (!empty($books)) {
				$count = count($books);
				for($i=0;$i<$count;$i++) {
					$desc_excerpt = create_excerpt($books[$i]->description);
					if (strlen($books[$i]->description) == strlen($desc_excerpt)) $desc_excerpt = null;
					echo '<tr class="bottom_border" typeof="books">';
					echo '<td style="white-space:nowrap;">';
					echo '<a title="Edit row" href="javascript:;" style="color:#337ab7" onclick="edit_row($(this).parents(\'tr\'));">';
					echo '<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>';
					echo '</a> &nbsp; ';
					echo '<a title="Go to Dashboard" href="javascript:;" style="color:#337ab7" onclick="window.location.href=\''.confirm_slash(base_url()).'system/dashboard?book_id='.$books[$i]->book_id.'&zone=style#tabs-style\';">';
					echo '<span class="glyphicon glyphicon glyphicon-wrench" aria-hidden="true"></span>';
					echo '</a> &nbsp; ';
					echo '<a title="Delete row" style="color:#ac2925;" href="'.confirm_slash(base_url()).'system/dashboard?action=do_delete&delete='.$books[$i]->book_id.'&type=books&zone=all-books&pill=manage-books&tab=tabs-utils" onclick="if (!confirm(\'Are you sure you wish to DELETE this book and all associated content?\')) return false;">';
					echo '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
					echo '</a>';
					echo '</td>'."\n";
					echo '<td property="id" style="display:none;">'.$books[$i]->book_id."</td>\n";
					echo '<td property="book_id" style="display:none;">'.$books[$i]->book_id."</td>\n";
					echo '<td class="editable" property="title" style="width:100px;">'.$books[$i]->title."</td>\n";
					echo '<td class="editable has_link uri_link" property="slug"><a href="'.confirm_slash(base_url()).$books[$i]->slug.'">'.$books[$i]->slug."</a></td>\n";
					echo '<td class="editable boolean" property="url_is_public">'.$books[$i]->url_is_public."</td>\n";
					echo '<td class="editable boolean" property="display_in_index">'.$books[$i]->display_in_index."</td>\n";
					echo '<td class="editable boolean" property="is_featured">'.$books[$i]->is_featured."</td>\n";
					echo '<td style="width=150px;" id="save_book_users_'.$books[$i]->book_id.'">';
					foreach ($books[$i]->users as $user) {
						echo '<span id="'.$user->user_id.'">'.$user->fullname.'</span>';
						if ($user->list_in_index) echo ' <span style="color:red;font-weight:bold">*</span>';
						echo '<br />';
					}
					echo "</td>\n";
					echo '<td style="white-space:nowrap;">'.date( 'M j, Y', strtotime($books[$i]->created) )."</td>\n";
					echo "</tr>\n";
				}
			}
	?>
				</tbody>
			</table>
			</div>
			<form class="form-inline" action="<?=confirm_slash(base_url())?>system/dashboard" method="post">
			<input type="hidden" name="zone" value="all-books" />
			<input type="hidden" name="hash" value="#tabs-utils" />
			<input type="hidden" name="pill" value="manage-books" />
			<input type="hidden" name="book_id" value="<?=((isset($book->book_id))?$book->book_id:0)?>" />
			<input type="hidden" name="action" value="do_add_book" />
			<small>Add new book:</small><br />
			<div id="manage-books-add-new" class="form-group form-group-sm">
				<input type="text" name="title" value="" placeholder="Title" class="form-control" />
				<input type="text" name="subtitle" value="" placeholder="Subtitle" class="form-control" />
				<select name="user_id" class="form-control" style="width:150px;">
					<option value="0">Initial author</option>
				<? foreach ($users as $user): ?>
					<option value="<?=$user->user_id?>"><?=$user->fullname?></option>
				<? endforeach ?>
				</select>
				<input type="submit" value="Add"  class="btn btn-sm" />
			</div>
			<br clear="both" />
			</form>
    	<?php endif; ?>
    	</div>
    	<div class="section" id="generate-email-list">
    	<?php if ('generate-email-list'==$pill): ?>
			<form action="<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book)&&!empty($book))?$book->book_id:0)?>&zone=utils&pill=generate-email-list#tabs-utils" method="post">
			<input type="hidden" name="zone" value="utils" />
			<input type="hidden" name="action" value="get_email_list" />
			<h4>Generate email list</h4><br />
			Please cut-and-paste into the "Bcc" (rather than "Cc") field to protect anonymity<br />
			<textarea class="textarea_list form-control" style="width:100%; height:300px;"><?php
				if (!isset($email_list)) {

				} elseif (empty($email_list)) {
					echo 'No email addresses could be found';
				} else {
					echo implode(", ", $email_list);
				}
			?></textarea><br />
			<input type="submit" value="Generate" class="btn btn-primary" onclick="this.disabled=true;" />
			</form>
		<?php endif; ?>
    	</div>
    	<div class="section" id="recreate-book-folders">
    	<?php if ('recreate-book-folders'==$pill): ?>
			<form action="<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book)&&!empty($book))?$book->book_id:0)?>&zone=utils&pill=recreate-book-folders#tabs-utils" method="post">
			<input type="hidden" name="zone" value="utils" />
			<input type="hidden" name="action" value="recreate_book_folders" />
			<h4>Recreate book folders</h4>
			Will rebuild book folders that may have gone missing from the Scalar root directory.<br /><br />
			<textarea class="textarea_list form-control" style="width:100%; height:300px;"><?php
				if (!isset($book_list)) {

				} elseif (empty($book_list)) {
					echo 'No book folders required recreating';
				} else {
					echo implode("\n", $book_list);
				}
			?></textarea><br />
			<input type="submit" value="Recreate" class="btn btn-primary" onclick="this.disabled=true;" />
			</form>
		<?php endif; ?>
    	</div>

    	<div class="section" id="list-all-users">
    	<?php if ('list-all-users'==$pill): ?>
			<form action="<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book)&&!empty($book))?$book->book_id:0)?>&zone=utils&pill=list-all-users#tabs-utils" method="post">
			<input type="hidden" name="zone" value="utils" />
			<input type="hidden" name="action" value="get_recent_users" />
			<h4>List all users</h4>
			You can delete users and their associated books from this list; links will open in the All Users tab in new window.<br /><br />
			<div class="div_list"><?php
				if (!isset($recent_user_list)) {

				} elseif (empty($recent_user_list)) {
					echo 'No users could be found!';
				} else {
					foreach($recent_user_list as $user) {
						echo '<div>';
						echo '<label><input type="checkbox" name="user_id[]" value="'.$user->user_id.'" /> &nbsp; ';
						echo $user->email.'</label> &nbsp; ';
						echo '<a href="'.base_url().'system/dashboard?zone=all-users&id='.$user->user_id.'#tabs-all-users" target="_blank">'.((!empty($user->fullname))?trim($user->fullname):'(No fullname)').'</a> &nbsp; ';
						echo (!empty($user->url)) ? '<a href="'.$user->url.'" target="_blank">'.$user->url.'</a> &nbsp; ' : '';
						echo '</div>'."\n";
					}
				}
			echo '</div>'."\n";
			echo '</form>'."\n";
			if (isset($recent_user_list) && !empty($recent_user_list)) {
				echo '<form id="do_delete_users_form" action="'.confirm_slash(base_url()).'system/dashboard?book_id='.((isset($book)&&!empty($book))?$book->book_id:0).'&zone=utils&pill=list-all-users#tabs-utils" method="post">';
				echo '<input type="hidden" name="zone" value="utils" />';
				echo '<input type="hidden" name="action" value="do_delete_users" />';
				echo '<input type="hidden" name="user_ids" value="" />';
				echo '<input type="hidden" name="delete_books" value="0" />';
				echo '<input type="submit" class="btn btn-default btn-sm" value="Delete selected users" onclick="$(this).closest(\'form\').find(\'[name=\\\'delete_books\\\']\').val(0)" /> &nbsp; ';
				echo '<input type="submit" class="btn btn-default btn-sm" value="Delete selected users and books they author" onclick="$(this).closest(\'form\').find(\'[name=\\\'delete_books\\\']\').val(1)" />';
				echo '</form>'."\n";
			}
			?>
			<br />
			<input type="button" value="Generate" class="btn btn-primary" onclick="this.disabled=true;$(this).parent().find('form:first').trigger('submit');" />
    	<?php endif; ?>
    	</div>

			<div class="section" id="list-recent-pages">
    	<?php if ('list-recent-pages'==$pill): ?>
			<form action="<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book)&&!empty($book))?$book->book_id:0)?>&zone=utils&pill=list-recent-pages#tabs-utils" method="post">
			<input type="hidden" name="zone" value="utils" />
			<input type="hidden" name="action" value="get_recent_pages" />
			<h4>List recently edited pages and media</h4>
			Lists the 400 most recently edited pages and media items, across all books.<br /><br />
			<div class="div_list"><?php
				if (!isset($recent_pages_list)) {

				} elseif (empty($recent_pages_list)) {
					echo 'No content could be found!';
				} else {
					foreach($recent_pages_list as $page) {
						echo '<div>';
						echo '<a href="'.confirm_slash(base_url()).$page->book_slug.'/'.$page->page_slug.'">'.$page->page_slug.'</a>';
						echo '</div>'."\n";
					}
				}
			echo '</div>'."\n";
			echo '</form>'."\n";
			?>
			<br />
			<input type="button" value="Generate" class="btn btn-primary" onclick="this.disabled=true;$(this).parent().find('form:first').trigger('submit');" />
    	<?php endif; ?>
    	</div>

    	<div class="section" id="list-all-books">
    	<?php if ('list-all-books'==$pill): ?>
			<form action="<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book)&&!empty($book))?$book->book_id:0)?>&zone=utils&pill=list-all-books#tabs-utils" method="post">
			<input type="hidden" name="zone" value="utils" />
			<input type="hidden" name="action" value="get_recent_book_list" />
			<h4>List all books</h4>
			Delete books and their creators from this list; links will open in the All Books or All Users tab in new window.<br /><br />
			<div class="div_list"><?php
				if (!isset($recent_book_list)) {

				} elseif (empty($recent_book_list)) {
					echo 'No books could be found!';
				} else {
					foreach($recent_book_list as $book) {
						echo '<div>';
						echo '<label><input type="checkbox" name="book_id[]" value="'.$book->book_id.'" /> &nbsp; ';
						echo date('Y-m-d', strtotime($book->created)).'</label> &nbsp; ';
						echo '<a href="'.base_url().'system/dashboard?zone=all-books&id='.$book->book_id.'#tabs-all-books" target="_blank">'.((!empty($book->title))?trim($book->title):'(No title)').'</a> &nbsp; ';
						echo (!empty($book->subtitle)) ? $book->subtitle.' &nbsp; ' : '';
						echo (!empty($book->description)) ? $book->subtitle.' &nbsp; ' : '';
						if (!empty($book->creator)) {
							echo 'created by &nbsp; <a href="'.base_url().'system/dashboard?zone=all-users&id='.$book->creator->user_id.'#tabs-all-users" target="_blank">';
							echo $book->creator->fullname;
							echo '</a> &nbsp; ';
						} else {
							echo 'created by user no longer exists &nbsp; ';
						}
						echo '</div>'."\n";
					}
				}
			echo '</div>'."\n";
			echo '</form>'."\n";
			if (isset($recent_book_list) && !empty($recent_book_list)) {
				echo '<form id="do_delete_books_form" action="'.confirm_slash(base_url()).'system/dashboard?book_id='.((isset($book)&&!empty($book))?$book->book_id:0).'&zone=utils&pill=list-all-books#tabs-utils" method="post">';
				echo '<input type="hidden" name="zone" value="utils" />';
				echo '<input type="hidden" name="action" value="do_delete_books" />';
				echo '<input type="hidden" name="book_ids" value="" />';
				echo '<input type="hidden" name="delete_creators" value="0" />';
				echo '<input type="submit" class="btn btn-default btn-sm" value="Delete selected books" onclick="$(this).closest(\'form\').find(\'[name=\\\'delete_creators\\\']\').val(0)" /> &nbsp; ';
				echo '<input type="submit" class="btn btn-default btn-sm" value="Delete selected books and their creator user accounts" onclick="$(this).closest(\'form\').find(\'[name=\\\'delete_creators\\\']\').val(1)" />';
				echo '</form>'."\n";
			}
			?>
			<br />
			<input type="button" value="Generate" class="btn btn-primary" onclick="this.disabled=true;$(this).parent().find('form:first').trigger('submit');" />
    	<?php endif; ?>
    	</div>
    	<div class="section" id="normalize-id2val">
    	<?php if ('normalize-id2val'==$pill): ?>
			<form action="<?=confirm_slash(base_url())?>system/dashboard?book_id=<?=((isset($book)&&!empty($book))?$book->book_id:0)?>&zone=utils&pill=normalize-id2val#tabs-utils" method="post">
			<input type="hidden" name="zone" value="utils" />
			<input type="hidden" name="action" value="normalize_predicate_table" />
			<h4>Normalize id2val table</h4>
			Will remove duplicates from the ARC2 id2val table so that predicate searches work as expected.<br /><br />
			<div class="div_list"><?php
			if (!isset($normalize_predicate_table)) {

			} elseif (empty($normalize_predicate_table)) {
				echo 'No book folders required recreating';
			} else {
				echo implode("<br />\n", $normalize_predicate_table);
			}
			echo '</div>'."\n";
			echo '</form>'."\n";
			?>
			<br />
			<input type="button" value="Normalize" class="btn btn-primary" onclick="this.disabled=true;$(this).parent().find('form:first').trigger('submit');" />
    	<?php endif; ?>
    	</div>
    </section>
  </div>
</div>
