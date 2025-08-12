<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_js("\nvar fullname='".$login->fullname."';\nvar email='".$login->email."';\nvar strong_password_enabled=".$this->config->item('strong_password')."\n", 'embed')?>
<script>
$(document).ready(function() {
    // Table row mousovers
	$('.table-hover-custom').find('tbody tr').on('mouseover', function() {
		var $row = $(this);
		$row.css('cursor','pointer').addClass('info');
		$row.find('.showme').css('visibility','visible');
	}).on('mouseout', function() {
		var $row = $(this);
		$row.removeClass('info');
		$row.find('.showme').css('visibility','hidden');
	});
	$('.table-row-click').find('a').on('click', function(e) {
		e.stopPropagation();
	});
	$('.table-row-click').find('tr').on('click', function() {
		var url = $(this).find('a:first').attr('href');
		document.location.href = url;
	});
	// Duplicate modal
	var $duplicateBookModal = $('#duplicateBookModal');
	$duplicateBookModal.find('.loading').show();
	$duplicateBookModal.find('.no-rows').hide();
	$duplicateBookModal.find('.rows').hide();
	$duplicateBookModal.find('button:last').prop('disabled','disabled');
	$duplicateBookModal.on('shown.bs.modal', function () {
		var url = $('link#sysroot').attr('href')+'system/api/get_duplicatable_books';
		$.getJSON(url, function(data) {
			$duplicateBookModal.find('.loading').hide();
			if (!data || !data.length) {
				$duplicateBookModal.find('.no-rows').show();
			} else {
				$duplicateBookModal.find('.rows').show();
				$duplicateBookModal.find('button:last').prop('disabled',false);
				var $content = $duplicateBookModal.find('tbody:first');
				$content.empty().css({
					maxHeight:210,
					overflow:'auto',
				});
				for (var j = 0; j < data.length; j++) {
	    			var str = data[j].title.replace(/<.*?>/g, '');
	    			if (data[j].subtitle!=null && data[j].subtitle.length) str += ': '+data[j].subtitle.replace(/<.*?>/g, '');
					var $row = $('<tr data-id="'+data[j].book_id+'"><td>'+str+'</td></tr>').appendTo($content);
				};
				$duplicateBookModal.find('tbody tr').each(function() {
					var $this = $(this);
					$this.removeClass('active').removeClass('info').off('click');
					$this.on('click', function() {
						var $row = $(this);
						var book_id = parseInt($row.data('id'));
						$row.addClass('active').addClass('info').siblings().removeClass('active').removeClass('info');
						$this.closest('form').find('input[name="book_to_duplicate"]').val(book_id);
					});
				});
			};
		});
	}).on('hidden.bs.modal', function() {
		var $duplicateBookModal = $('#duplicateBookModal');
		$duplicateBookModal.find('.loading').show();
		$duplicateBookModal.find('.no-rows').hide();
		$duplicateBookModal.find('.rows').hide();
		$duplicateBookModal.find('button:last').prop('disabled','disabled');
	});
    $('input[name="password"]').on('keyup', function() {
        if (!strong_password_enabled) return;
		var passwd = $(this).val();
		var $bar = $('.strong_password_bar');
		var reservedWords = fullname.split(' ');
		reservedWords = reservedWords.concat(email.split('@'));
		var msg = '';
		if (passwd.length < 16) {
			msg = 'Password must be at least 16 characters long';
		}
		for (var j = 0; j < reservedWords.length; j++) {
			if (passwd.toLowerCase().indexOf(reservedWords[j].toLowerCase()) != -1) msg = 'Password cannot contain elements of name or email';
		}
		$('.strong_password_bar_wrapper').show();
		if (msg.length) {
			$bar.removeClass('strong_password_strong').addClass('strong_password_weak').text(msg);
		} else {
			$bar.removeClass('strong_password_weak').addClass('strong_password_strong').text('Password strength is strong');
		}
    });
});
</script>

<? if (isset($_REQUEST['action']) && 'user_saved'==$_REQUEST['action']): ?>
<div class="alert alert-success">User profile has been saved<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">remove notice</a></div>
<? endif ?>
<? if (isset($_REQUEST['action']) && 'duplicated'==$_REQUEST['action']): ?>
<div class="alert alert-success">Book has been duplicated (and the new book is now present in the list to the right)<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">remove notice</a></div>
<? endif ?>
<? if (isset($_REQUEST['action']) && 'added'==$_REQUEST['action']): ?>
<div class="alert alert-success">Book has been created (and is now present in the list to the right)<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">remove notice</a></div>
<? endif ?>
<? if (isset($_REQUEST['error']) && 'email_exists'==$_REQUEST['error']): ?>
<div class="alert alert-danger">The email address entered already exists in the system. Please try again with a different email.<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">remove notice</a></div>
<? endif ?>
<? if (isset($_REQUEST['error']) && 'fullname_required'==$_REQUEST['error']): ?>
<div class="alert alert-danger">Full name is a required field.  Please enter a full name and try again.<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">remove notice</a></div>
<? endif ?>
<? if (isset($_REQUEST['error']) && 'incorrect_password'==$_REQUEST['error']): ?>
<div class="alert alert-danger">Incorrect current password<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">remove notice</a></div>
<? endif ?>
<? if (isset($_REQUEST['error']) && 'password_match'==$_REQUEST['error']): ?>
<div class="alert alert-danger">New password and retype password do not match<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">remove notice</a></div>
<? endif ?>
<? if (isset($_REQUEST['error']) && 'strong_password'==$_REQUEST['error']): ?>
<div class="alert alert-danger">New password did not pass strong password test<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">remove notice</a></div>
<? endif ?>
<? if (isset($_REQUEST['error']) && 'previous_password'==$_REQUEST['error']): ?>
<div class="alert alert-danger">New password has previously been used<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">remove notice</a></div>
<? endif ?>
<? if (isset($_REQUEST['error']) && 'invalid_captcha_1'==$_REQUEST['error']): ?>
<div class="alert alert-danger">Invalid CAPTCHA response<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">remove notice</a></div>
<? endif ?>
<? if (isset($_REQUEST['error']) && 'invalid_captcha_2'==$_REQUEST['error']): ?>
<div class="alert alert-danger">The CAPTCHA was not successful<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">remove notice</a></div>
<? endif ?>
<? if (isset($_REQUEST['error']) && 'no_dir_created'==$_REQUEST['error']): ?>
<div class="alert alert-danger">Could not create the directory for this new book on the filesystem<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">remove notice</a></div>
<? endif ?>
<? if (isset($_REQUEST['error']) && 'no_media_dir_created'==$_REQUEST['error']): ?>
<div class="alert alert-danger">Could not create the media folder inside this new book's folder on the filesystem; something may be wrong with the file permissions<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">remove notice</a></div>
<? endif ?>
<? if (isset($_REQUEST['error']) && 'not_duplicatable'==$_REQUEST['error']): ?>
<div class="alert alert-danger">The chosen book is not duplicatable<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">remove notice</a></div>
<? endif ?>
<? if (isset($_REQUEST['error']) && 'error_while_duplicating'==$_REQUEST['error']): ?>
<div class="alert alert-danger">There was an error attempting to duplicate the chosen book<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">remove notice</a></div>
<? endif ?>
<? if (isset($_REQUEST['error']) && 'error_add_book'==$_REQUEST['error']): ?>
    <div class="alert alert-danger">Could not create book. Please try again with a different book name.<a href="?book_id=<?=@$book_id?>&zone=user" style="float:right;">remove notice</a></div>
<? endif ?>

<div class="container-fluid user">
  <div class="row">
    <section class="col-xs-12 col-sm-6">
      <div class="page-header"><h4>Account<a class="sign-out" href="<?=confirm_slash(base_url())?>system/logout?action=do_logout&redirect_url=<?=confirm_slash(base_url())?>">Sign out</a></h4></div>
	  <form class="form-horizontal" action="<?=confirm_slash(base_url())?>system/dashboard" method="post" id="user_form">
	    <input type="hidden" name="action" value="do_save_user" />
	    <input type="hidden" name="id" value="<?=$login->user_id?>" />
	    <input type="hidden" name="book_id" value="<?=@$book_id?>" />
        <div class="form-group">
          <label for="fullname" class="col-sm-4 control-label">Full name</label>
          <div class="col-sm-8">
            <input type="text" class="form-control" id="fullname" name="fullname" value="<?=htmlspecialchars($login->fullname ?? '')?>">
          </div>
        </div>
        <div class="form-group">
          <label for="email" class="col-sm-4 control-label">Email (login)</label>
          <div class="col-sm-8">
            <input type="email" class="form-control" id="email" name="email" value="<?=htmlspecialchars($login->email ?? '')?>">
          </div>
        </div>
        <div class="form-group">
          <label for="url" class="col-sm-4 control-label">Website</label>
          <div class="col-sm-8">
            <input type="url" class="form-control" id="url" name="url" value="<?=htmlspecialchars($login->url ?? '')?>" placeholder="http://">
          </div>
        </div>
<?php if ($login_is_super): ?>
        <div class="form-group">
          <label class="col-sm-4 control-label">Admin status</label>
          <label class="col-sm-8 control-label label-text">You are an admin</label>
        </div>
<?php endif; ?>
        <!-- Avatar? -->
        <div class="form-group">
          <div class="col-sm-offset-4 col-sm-8">
            <small>To change your password enter the following values:</small>
          </div>
        </div>
        <div class="form-group">
          <label for="old_password" class="col-sm-4 control-label">Current password</label>
          <div class="col-sm-8">
            <input type="password" class="form-control" id="old_password" name="old_password">
          </div>
        </div>
        <div class="form-group">
          <label for="password" class="col-sm-4 control-label">New password</label>
          <div class="col-sm-8">
            <input type="password" class="form-control" id="password" name="password">
          </div>
        </div>
        <div class="form-group">
          <label for="password_2" class="col-sm-4 control-label">Retype new</label>
          <div class="col-sm-8">
            <input type="password" class="form-control" id="password_2" name="password_2">
          </div>
        </div>
        <div class="form-group strong_password_bar_wrapper" style="display:none;">
          <label for="password_2" class="col-sm-4 control-label">&nbsp;</label>
          <div class="col-sm-8">
            <span class="strong_password_bar">&nbsp;</span>
          </div>
        </div>
        <div class="page-header">&nbsp;</div>
        <div class="form-group">
          <div class="col-sm-12">
            <button type="submit" class="btn btn-primary pull-right">Save changes</button>
          </div>
        </div>
	  </form>
    </section>
    <section class="col-xs-12 col-sm-6">
      <div class="page-header"><h4>Books</h4></div>
      <div class="form-inline">
      	<button class="btn btn-default" data-toggle="modal" data-target="#createBookModal">Create new book</button> &nbsp;
      	<button class="btn btn-default" data-toggle="modal" data-target="#duplicateBookModal">Duplicate existing book</button>
      </div>
      <div class="page-v-spacer"></div>
      <div class="table-responsive">
        <table class="table table-condensed table-hover-custom table-row-click">
          <thead>
            <tr>
              <th>Title</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody><?php
	    	  foreach ($my_books as $my_book) {
	    	  	$role = '(No role)';
	    	  	foreach ($my_book->users as $my_user) {
	    	  		if ($my_user->user_id == $login->user_id) $role = ucwords($my_user->relationship);
	    	  	}
	    		echo '<tr class="'.(($my_book->book_id==$book_id)?'current-book':'').'">';
	    		echo '<td>';
	    		echo '<a href="'.base_url().$my_book->slug.'">';
	    		echo strip_tags($my_book->title);
	    		echo '</a>';
	    		echo '</td>';
	    		echo '<td>';
	    		echo '<a href="'.base_url().$my_book->slug.'/users/'.$login->user_id.'">'.$role.'</a>';
	    		echo '</td>';
	    		echo '<td>';
	    		echo '<a href="?book_id='.$my_book->book_id.'&zone=style#tabs-style" class="btn btn-default btn-xs pull-right showme">Dashboard</a>';
	    		echo '</td>';
	    		echo '</tr>';
	    	  }
          ?></tbody>
        </table>
      </div>
    </section>
  </div>
</div>

<div class="modal fade" id="createBookModal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <form class="form-horizontal" action="<?=confirm_slash(base_url())?>system/dashboard" method="post" onsubmit="if (!this.title.value.length||this.title.value=='New book title') {alert('Please enter a book title');return false;}">
      <input type="hidden" name="action" value="do_add_book" />
      <input type="hidden" name="user_id" value="<?=$login->user_id?>" />
      <div class="modal-body">
        <div class="page-header"><h4>Create new book</h4></div>
        <div class="form-group">
          <label for="title" class="col-sm-2 control-label">Title</label>
          <div class="col-sm-10">
            <input type="text" class="form-control" id="title" name="title" placeholder="New book title">
          </div>
        </div>
        <div class="form-group">
          <label for="subtitle" class="col-sm-2 control-label">Subtitle</label>
          <div class="col-sm-10">
            <input type="text" class="form-control" id="subtitle" name="subtitle" placeholder="New book subtitle">
          </div>
        </div>
        <div class="form-group">
          <label for="scope" class="col-sm-2 control-label">Genre</label>
          <div class="col-sm-4">
            <select class="form-control" id="scope" name="scope">
              <option value="book">Book</option>
              <option value="article">Article</option>
              <option value="project">Project</option>
            </select>
          </div>
          <div class="col-sm-6">
            <small>For cosmetic purposes only&mdash;will be displayed throughout the interface</small>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="submit" class="btn btn-primary">Create</button>
      </div>
      </form>
    </div>
  </div>
</div>

<div class="modal fade" id="duplicateBookModal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
	  <form class="form-horizontal" action="<?=confirm_slash(base_url())?>system/dashboard" method="post" onsubmit="if (0==this.book_to_duplicate.value) {alert('Please select a book to duplicate');return false;} else if (!this.title.value.length||this.title.value=='New book title') {alert('Please enter a title for the new book');return false;}">
	  <input type="hidden" name="action" value="do_add_book" />
	  <input type="hidden" name="user_id" value="<?=$login->user_id?>" />
	  <input type="hidden" name="book_to_duplicate" value="0" />
      <div class="modal-body">
      	<div class="page-header"><h4>Duplicate a book</h4></div>
      	<div class="loading">Loading...</div>
      	<div class="no-rows alert alert-danger">There are no books presently set to be duplicatable in this Scalar install.</div>
      	<div class="rows" class="table-responsive" style="max-height: 300px; overflow: auto;">
          <table class="table table-condensed table-hover">
            <thead>
              <tr><th>Book to duplicate</th></tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
        <div class="rows page-v-spacer"></div>
        <div class="rows form-group">
          <label for="title" class="col-sm-1 control-label">Title</label>
          <div class="col-sm-11">
            <input type="text" class="form-control" id="title" name="title" placeholder="New book title">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="submit" class="btn btn-primary">Duplicate</button>
      </div>
      </form>
    </div>
  </div>
</div>
