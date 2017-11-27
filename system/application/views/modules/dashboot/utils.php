<?$this->template->add_css('system/application/views/modules/dashboot/css/custom.jquery-ui.min.css')?>
<?$this->template->add_css('system/application/views/modules/dashboot/css/bootstrap-dialog.min.css')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/custom.jquery-ui.min.js')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/bootstrap-dialog.min.js')?>
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

<script>
$(document).ready(function() {
	$('.nav-pills').find('li').click(function() {
		var $this = $(this);
		$this.closest('.nav').find('li').removeClass('active');
		$this.addClass('active');
		$this.closest('.row').find('.section').hide();
		var $section = $this.closest('.row').find('#'+$this.data('id'));
		$section.show();
	});
	if (-1!=document.location.href.indexOf('&pill=')) {
		var pill = document.location.href.substr(document.location.href.indexOf('&pill=')+6);
		pill = pill.substr(0, pill.indexOf('#'));
		$('.nav-pills:first').find('[data-id="'+pill+'"]').click();
	};
	$('.export-link').click(function(e) {
		e.preventDefault();
		var url = $(this).attr('href');
		var $content = $('#export-content').show();
		$content.find('#export-content-url').html('<a href="'+url+'">'+url+'</a>');
		$content.find('#export-content-text').val('Loading...');
		$.get(url, function(data) {
			$content.find('#export-content-text').val(data);
		}, 'text');
	});
	$('#do_delete_books_form').submit(function() {
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
	$('#do_delete_users_form').submit(function() {
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
	$('.div_list').find('input[type="checkbox"]').change(function() {
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
	    <li class="active" data-id="import"><a href="javascript:void(null);">Import</a></li>
	    <li data-id="export"><a href="javascript:void(null);">Export</a></li>
	    <li data-id="api-explorer"><a href="javascript:void(null);">API Explorer</a></li>
<? if ($login_is_super): ?>
		<li class="admin" data-id="manage-users"><a href="javascript:void(null);">Manage users</a></li>
		<li class="admin" data-id="manage-books"><a href="javascript:void(null);">Manage books</a></li>
		<li class="admin" data-id="generate-email-list"><a href="javascript:void(null);">Generate email list</a></li>
		<li class="admin" data-id="recreate-book-folders"><a href="javascript:void(null);">Recreate book folders</a></li>
		<li class="admin" data-id="list-all-users"><a href="javascript:void(null);">List all users</a></li>
		<li class="admin" data-id="list-all-books"><a href="javascript:void(null);">List all books</a></li>
<? endif ?>
	  </ul> 
    </aside>
    <section class="col-xs-10" style="width:79%;">
    	<div class="section" id="import">
    		<h4>Import</h4>
	        <p class="m">Import content and relationships from public Scalar books, raw Scalar RDF-JSON, or comma seperated values files. For more information visit the <a href="http://scalar.usc.edu/works/guide2">Scalar 2 Guide</a>'s <a href="http://scalar.usc.edu/works/guide2/advanced-topics">Advanced Topics</a> path.</p><?php
	        $path = 'system/application/plugins/transfer/index.html';
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
	        } else {
	        	echo '<div class="alert alert-warning">Please contact a system administrator to install the <b>Transfer</b> plugin at <b>/system/application/plugins/transfer</b>.</div>';
	        }
	        echo '</div>';
    		?></div>
    	<div class="section" id="export"><?php 
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
  				<small>Better for using with the Scalar Transfer tool</small><br /><br />
  				<a class="btn btn-default export-link" href="<?=$rdf_url_xml?>" style="width:160px;">Export as RDF-XML</a> &nbsp; &nbsp;
  				<small>Better for working with external Semantic Web applications</small>
	     	</p>
	     	<p class="m" id="export-content">
	     		<small>URL: <span id="export-content-url"></span></small>
	     		<textarea id="export-content-text" class="form-control"></textarea>
	     	</p>
	     	<script>
	     	</script>
    	</div>
    	<div class="section" id="api-explorer">
    		<h4>API Explorer</h4> 
    		<div class="m">
				<p>You can use this utility to:</p>
				<ul>
					<li>Generate API queries for this Scalar book</li>
					<li>Grab an excerpt of this book to copy to another using the Import tool</li>
					<li>Get word counts for specific pages, groups of pages, or the entire book</li>
				</ul> 		
    		</div><?php
	        $path = 'system/application/plugins/apiexplorer/index.html';
	        $get_vars = '?book_url='.confirm_slash(base_url()).$book->slug;
	        echo '<div class="plugin apiexplorer">';
	        if (file_exists(FCPATH.$path)) {
	        	echo '<iframe id="api-explorer-frame" style="width:100%; min-height:700px; border:none;" src="'.confirm_slash(base_url()).$path.$get_vars.'"></iframe>'."\n";
	        } else {
	        	echo '<div class="alert alert-warning">Please contact a system administrator to install the <b>API Explorer</b> plugin at <b>/system/application/plugins/apiexplorer</b>.</div>';
	        }
	        echo '</div>';
	        ?>
    	</div>
    	<div class="section" id="manage-users">
    		<h4>Manage users</h4>
    		Pending...
    	</div>
    	<div class="section" id="manage-books">
    		<h4>Manage books</h4>
    		Pending...
    	</div>
    	<div class="section" id="generate-email-list">
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
    	</div>
    	<div class="section" id="recreate-book-folders">
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
    	</div>
    	<div class="section" id="list-all-users">
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
			<input type="button" value="Generate" class="btn btn-primary" onclick="this.disabled=true;$(this).parent().find('form:first').submit();" />
    	</div>
    	<div class="section" id="list-all-books">
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
			<input type="button" value="Generate" class="btn btn-primary" onclick="this.disabled=true;$(this).parent().find('form:first').submit();" />
    	</div>
    </section>
  </div>
</div>