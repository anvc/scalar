<?php
	if (!defined('BASEPATH')){exit('No direct script access allowed');}
	$this->template->add_js(path_from_file(__FILE__).'js/fuse.min.js');
	$this->template->add_js(path_from_file(__FILE__).'js/aclsworkbench_book_list.js');
	$this->template->add_js(path_from_file(__FILE__).'js/aclsworkbench_tour.js');
	$this->template->add_css(path_from_file(__FILE__).'css/aclsworkbench_book_list.css');
	//Loop through each book, producing the book wrapping html for the book index
	function print_books($books, $user_id) {
		$num_books = count($books);
		echo '<div class="original book_list row">';
		foreach ($books as $i=>$row) {
		
			$uri 		   = confirm_slash(base_url()).$row->slug;
			$title		   = trim(strip_tags($row->title));
			$book_id       = (int) $row->book_id;
			$thumbnail     = (!empty($row->thumbnail)) ? confirm_slash($row->slug).$row->thumbnail : null;
						
			$is_live       = ($row->display_in_index && $row->url_is_public); 
			$is_featured   =@ ($row->is_featured) ? true : false;
			
			if (empty($thumbnail)||!file_exists(FCPATH.$thumbnail)) $thumbnail = 'system/application/views/modules/aclsworkbench_book_list/default_book_logo.png';
			
			$thumbnail = base_url().$thumbnail;
			
			$authors = array();
			$user_is_reader = false;
			foreach ($row->users as $user) {
				if (isset($user_id) && $user->relationship!=strtolower('author')){
					if($user->user_id == $user_id){
						$user_is_reader = true;
					}
					continue;
				}
				if (!$user->list_in_index) continue;
				$authors[] = $user->fullname;
			}
			echo '<div data-book_id="',$book_id,'" class="book_container col-md-2 col-sm-3 col-xs-6">
			<div class="book center-block',($is_featured?' featured':''),'" ><div class="cover" style="background-image: url(',$thumbnail,')"><a href="',$uri,'">',($is_featured?'<p class="bg-primary text-center"><span class="glyphicon glyphicon-star"></span> Featured</p>':''),($user_is_reader?'<p class="bg-success text-center"><span class="glyphicon glyphicon-check"></span> Joined</p>':''),($is_live?'':'<p class="bg-danger text-center"><small><span class="glyphicon glyphicon-eye-close"></span> Not Published</small></p>'),'</a></div>',
			'</div>';
			
			if((isset($row->data['duplicatable']) && $row->data['duplicatable'] == 'true') || ( !$row->current_user  && (!isset($row->data['joinable']) || !in_array($row->data['joinable'],array('false','0')))) || ($row->current_user && !$user_is_reader)){
				echo '<div class="text-center"><div class="btn-group">';
				if(isset($row->data['duplicatable']) && $row->data['duplicatable'] == 'true'){
					echo '<button class="clone btn btn-sm btn-primary"  data-id="',$book_id,'" data-title="',$title,'" data-uri="',$uri,'"></i><small>Clone</small></button>';
				}
				if( !$row->current_user  && (!isset($row->data['joinable']) || !in_array($row->data['joinable'],array('false','0')))){
					echo '<button class="join btn btn-sm btn-primary"  data-id="',$book_id,'" data-title="',$title,'" data-uri="',$uri,'"><small>Join</small></button>';
				}else if($row->current_user && !$user_is_reader){
					echo '<a class="btn btn-sm btn-primary"  href="',base_url(),'system/dashboard?book_id=',$book_id,'&zone=style#tabs-style"><small>Edit</small></a>';
				}
				echo '</div></div>';
			}
				
			echo '<h4 class="title text-center"><a href="',$uri,'">',$row->title,'</a><br /><small class="authors">',implode(', ',$authors),'</small></h4>
			</div>';
			if(($i+1)%6 == 0){
				echo '</div><div class="book_list row">';
			}

			if(($i+1)%2 == 0){
				echo '<div class="clearfix visible-xs"></div>';
			}
		}
		echo '</div>';
	}
	
	//Helper function to format a search form for a book list; prevents having to write it for each index view
	function show_search_form($book_list,$title,$user_id){
	?>
			<div class="well search_well">
				<form role="form">
				  <div class="form-group">
				    <label for="searchBox">Search for Books</label>
				    <input type="text" class="form-control" id="searchBox" placeholder="Search by Title, Description, or Author">
				  </div>
				  <p>
				  	<a class="pull-right" id="clear_form">Or View All Books</a>
				  </p>
				  <br />
				  <hr />
				</form>
				<?php echo isset($title)?"<h1>$title</h1>":'<br />'; ?>
				<div class="results book_list row"></div>
				<?php
					if(count($book_list)>0){
						print_books($book_list,6,4,2,$user_id);
					}else{
				?>
					<div class="original book_list row">
						<p class="no_books">Unfortunately, there are currently no books in this view. If you would like to start your own book, you may instead choose to <a href="./?view_all&action=create">Create a Book</a></p>
					</div>
				<?php
					}
				?>
			</div>
		<?php
	}
	//Make one giant list of all of the books - this will be used later in traversing the Scalar installation
	$every_book = $user_books + $other_books + $featured_books;

	//We need to make lots of different lists of the books, so that we can filter and show the books based on certain criteria; Initialize all the arrays!
	$user_books = $featured_books = $all_books = $other_books = $duplicatable = $featured_duplicatable = $duplicatable_stripped = $other_stripped  = $joinable = $featured_joinable = $joinable_stripped= array();
	
	//Build array of all books. Arrays ending in "_stripped" are used as JSON arrays later for the search javascript.
	foreach ($every_book as $row) {
		$book_id       =@ (int) $row->book_id;
		$is_live       =@ ($row->display_in_index) ? true : false;
		$is_featured   =@ ($row->is_featured) ? true : false;
		$is_public =@ ($row->url_is_public) ? true : false;
		$hide_other    =  ($this->config->item('index_hide_published')) ? true : false;
		
		$authors = array();
		foreach ($row->users as $user) {
			if ($user->relationship!=strtolower('author')) continue;
			if (!$user->list_in_index) continue;
			$authors[] = $user->fullname;
		}
		$extra_data = array();
		$num_data_attributes = preg_match_all('/data-(?<data_type>\w+)="(?<value>\w+)"/',trim($row->title),$data_attributes);
		if(count($data_attributes['data_type']) == $num_data_attributes &&  count($data_attributes['value'])  ==  $num_data_attributes && $num_data_attributes > 0){
			for($i = 0; $i < $num_data_attributes; $i++){
				$extra_data[$data_attributes['data_type'][$i]] = $data_attributes['value'][$i];
			}
		}
		
		$row->title = strip_tags($row->title);
				
		$row->data = $extra_data;
		
		$row->current_user = in_array($book_id, $login_book_ids);
		if($is_live && $is_public){
			if ($is_featured) {
				if(!empty($row->data['duplicatable']) && $row->data['duplicatable'] == 'true'){
					$featured_duplicatable[] = $row;
					$duplicatable_stripped[] = array(
						'id'=>$book_id,
						'authors'=>implode(', ',$authors),
						'title'=>$row->title,
						'description'=>$row->description
					);
				}
				if(!$row->current_user && (!isset($row->data['joinable']) || !in_array($row->data['joinable'],array('false','0')))){
					$featured_joinable[] = $row;
					$joinable_stripped[] = array(
						'id'=>$book_id,
						'authors'=>implode(', ',$authors),
						'title'=>$row->title,
						'description'=>$row->description
					);
				}
				$featured_books[] = $row;
				$other_stripped[] = array(
					'id'=>$book_id,
					'authors'=>implode(', ',$authors),
					'title'=>$row->title,
					'description'=>$row->description
				);
			}else{
				if(!empty($row->data['duplicatable']) && $row->data['duplicatable'] == 'true'){
					$duplicatable[] = $row;
					$duplicatable_stripped[] = array(
						'id'=>$book_id,
						'authors'=>implode(', ',$authors),
						'title'=>$row->title,
						'description'=>$row->description
					);
				}
				if(!$row->current_user && (!isset($row->data['joinable']) || !in_array($row->data['joinable'],array('false','0')))){
					$joinable[] = $row;
					$joinable_stripped[] = array(
						'id'=>$book_id,
						'authors'=>implode(', ',$authors),
						'title'=>$row->title,
						'description'=>$row->description
					);
				}			
				$other_books[] = $row;
				$other_stripped[] = array(
					'id'=>$book_id,
					'authors'=>implode(', ',$authors),
					'title'=>$row->title,
					'description'=>$row->description
				);
			}
			$all_books[] = $row;
		}
		if ($row->current_user ) {
			$user_books[] = $row;
		}
			
		
	}
	
	$base_url = '//' . $_SERVER['HTTP_HOST'].'/';
	
	//Any methods that we can sort books by; key is the short name, value is the html for the main menu
	$list_methods = array(
		'index'=>'View <span class="text-muted">all Books</small>',
		'join'=>'Join <span class="text-muted">a Book</small>',
		'clone'=>'Clone <span class="text-muted">a Book</small>',
		'create'=>'Create <span class="text-muted">a Book</small>'
	);
	
	if(ACLSWORKBENCH_METHOD !== 'home'){
		//Do the main menu
	?>
		<div class="hidden-xs">
			<hr class="dark" />
			<div class="text-center">
				<a href="./?view_all&multipage=true&action=home" class="btn btn-success btn-lg">Take a Tour of ACLS Workbench</a>
			</div>
		</div>
		<hr class="dark" />
		<div class="row menu hidden-xs"<?php 
			if(ACLSWORKBENCH_METHOD=='index'){ echo ' data-step="1" data-intro="The top menu can be used to quickly jump from one ACLS Workbench view to another."'; }
			if(ACLSWORKBENCH_METHOD=='create'){ echo ' data-step="4" data-intro="That concludes the ACLS Workbench tour. Thank you for checking out the features, and we look forward to seeing, sharing, and joining your writing. You can click \'Finish Tour\' to return to the home page, or you may click anywhere else or press <kbd>ESC</kbd> to leave the tour and stay on this page."'; }
		?>>
			<?php
				foreach($list_methods as $method=>$text){
					echo '<div class="col-xs-12 col-sm-6 col-md-3 text-center"><a href="./?view_all&action='.$method.'" class="center-block '.(ACLSWORKBENCH_METHOD==$method?' active':'').'"',
						($method == ACLSWORKBENCH_METHOD && ACLSWORKBENCH_METHOD =='index'?' data-step="2" data-intro="When \'View all Books\' is selected, books you have created and books you have joined will be listed at the top of the page. Below these, a list of each book that has been published will be displayed."':''),
						($method == ACLSWORKBENCH_METHOD && ACLSWORKBENCH_METHOD =='join'?' data-step="1" data-intro="When \'Join a Book\' is selected, books that are available to join will be displayed. Joining a book makes getting updates easier and tells the authors that you are interested. You can also ask to become a co-author here."':''),
						($method == ACLSWORKBENCH_METHOD && ACLSWORKBENCH_METHOD =='clone'?' data-step="1" data-intro="When \'Clone a Book\' is selected, books that are available to be duplicated will be displayed. Duplicating a book will copy all of the information and media that is within the source book, providing a great framework for your book."':''),
						($method == ACLSWORKBENCH_METHOD && ACLSWORKBENCH_METHOD =='clone'?' data-step="1" data-intro="When \'View all Books\' is selected, books you have created and books you have joined will be listed at the top of the page. Below these, a list of each book that has been published will be displayed."':''),
						($method == ACLSWORKBENCH_METHOD && ACLSWORKBENCH_METHOD =='create'?' data-step="1" data-intro="\'Create a Book\' is the final page of the ACLS Workbench. On this page, you can create a new book from scratch."':''),
						($method == 'join' && ACLSWORKBENCH_METHOD =='index'?' data-step="4" data-intro="Click \'Next page\' to continue to the Join a Book view; otherwise, click anywhere else or press <kbd>ESC</kbd> to leave the tour."':''),
						($method == 'clone' && ACLSWORKBENCH_METHOD =='join'?' data-step="5" data-intro="Once you have joined a book, it will show  up under \'My Books\' on the \'View all Books\' page. Click \'Next page\' to continue to the Clone a Book view; otherwise, click anywhere else or press <kbd>ESC</kbd> to leave the tour."':''),
						($method == 'create' && ACLSWORKBENCH_METHOD =='clone'?' data-step="4" data-intro="You are almost done with the tour - click \'Next page\' to continue to the Create a Book view; otherwise, click anywhere else or press <kbd>ESC</kbd> to leave the tour."':''),
					'><i class="text-muted icon-'.$method.'"></i> '.$text.'</a></div>';
				}
			?>
		</div>
		<hr class="dark hidden-xs" />
		<br />
	<?php
	
		//Make the Modal Windows for Join and Clone
		//Join
		?>
			<div class="modal fade" id="join_dialogue">
			  <div class="modal-dialog">
				<div class="modal-content"<?php if(ACLSWORKBENCH_METHOD =='join'){echo ' data-step="3" data-intro="There are two ways you can join a book. The first option is to simply subscribe to it - this will place the book under \'My Books\' for easy reading, however you will be unable to edit or create content."';} ?>>
				  <div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
					<h4 class="modal-title" id="join_dialogue_title">Join Book</h4>
				  </div>
				  <div class="modal-body">
					<?php
						if($login->is_logged_in){
					?>
						<form action="<?php echo base_url(); ?>system/dashboard" method="post">
							<input type="hidden" name="redirect" value="<?php echo base_url().'?'; ?>">
							<input type="hidden" name="action" value="acls_join_book">
							<input type="hidden" name="book_to_join" id="book_to_join" value="">
							<input type="hidden" name="user_id" value="<?php echo $login->user_id; ?>">
							<div class="book_image"></div>
							<p>You are about to join this book - this means that you will be added automatically as a subscribed reader, and it will show up under "Your Books" on the main book index. You may also optionally request to become a co-author of this book, pending current author approval.</p>
							<br />
							<label>Would you like to be added as an author to this book? Note that current authors will receive an email and then may approve or deny your request.</label>
							<div class="radio">
							<label>
							  <input type="radio" name="request_author" id="request_author_no" value="0" checked>
									I would only like to join to this book <br />  <em class="text-muted">(You will be able to read and comment on this book, but you will not be able to edit or create content)</em><br />
								</label>
							</div>
							<div class="radio">
							  <label>
								<input type="radio" name="request_author" id="request_author_yes" value="1">
									I would like to join and request to become co-author of this book <br /> <em class="text-muted">(Pending current author approval, you will be able to create and edit content on this book)</em><br />
								</label>
								<div class="hidden" id="author_reason_container">
									<div class="form-group well">
										<label for="author_reason">Message for Current Authors <em class="text-muted">(Optional)</em>
											<textarea id="author_reason" name="author_reason"></textarea>
										</label>
									</div>
								</div>
							</div>
							<br class="clearfix" />
					</div>
					<div class="modal-footer">
						<input type="submit" class="btn btn-primary pull-right" value="Join Book">
						</form>
					<?php
						}else{
							echo '<div class="alert alert-danger">In order to join this book, you must first either <a href="'.ACLSWORKBENCH_LOGIN_URL.'system/login?redirect_url='.urlencode($_SERVER['REQUEST_URI'].(strpos($_SERVER['REQUEST_URI'],'?')!==false?'&view_all':'?view_all')).'">', lang('login.sign_in'), '</a> ',lang('or'),' <a href="'.ACLSWORKBENCH_LOGIN_URL.'system/register?redirect_url='.urlencode($_SERVER['REQUEST_URI'].(strpos($_SERVER['REQUEST_URI'],'?')!==false?'&view_all':'?view_all')).'">', lang('login.register'), '</a> </div>';
						}
					?>
				  </div>
				  
				</div><!-- /.modal-content -->
			  </div><!-- /.modal-dialog -->
			</div><!-- /.modal -->
		<?php
		
		//Clone
		?>
			<div class="modal fade" id="clone_dialogue">
			  <div class="modal-dialog">
				<div class="modal-content"<?php if(ACLSWORKBENCH_METHOD =='clone'){echo ' data-step="3" data-intro="Cloning a book is simple - when you select a clonable book to be duplicated, all you need to enter is a new title, and click \'Clone Book!\' The new book will appear under \'My Books\' on the \'View all Books\' page."';} ?>>
				  <div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
					<h4 class="modal-title" id="clone_dialogue_title">Clone Book</h4>
				  </div>
				  <div class="modal-body">
					<?php
						if($login->is_logged_in){
					?>
						<form action="<?php echo base_url(); ?>system/dashboard" method="post">
							<input type="hidden" name="redirect" value="<?php echo base_url().'?'; ?>">
							<input type="hidden" name="action" value="do_duplicate_book">
							<input type="hidden" name="book_to_duplicate" id="book_to_duplicate" value="">
							<input type="hidden" name="user_id" value="<?php echo $login->user_id; ?>">
							<div class="book_image"></div>
							<p>You are about to clone this book - a copy of this book with your new title will be added to "Your Books" on the book index.<p>
							<p><em class="text-muted">Note that any pages that you have not edited will still show the previous author as the last editor. Once you have modified these files, you will be shown as the most recent editor. Any new files you will create will also show you as the editor.</em></p>
							<br />
							<div class="form-group">
								<label for="clone_title">Title of new book:
									<input type="text" name="title" id="clone_title">
								</label>
							</div>
						
					</div>
					<div class="modal-footer">
						<input type="submit" class="btn btn-primary pull-right" value="Clone Book">
						</form>
					<?php
						}else{
							echo '<div class="alert alert-danger">In order to clone this book, you must first either <a href="'.ACLSWORKBENCH_LOGIN_URL.'system/login?redirect_url='.urlencode($_SERVER['REQUEST_URI'].(strpos($_SERVER['REQUEST_URI'],'?')!==false?'&view_all':'?view_all')).'">', lang('login.sign_in'), '</a> ',lang('or'),' <a href="'.ACLSWORKBENCH_LOGIN_URL.'system/register?redirect_url='.urlencode($_SERVER['REQUEST_URI'].(strpos($_SERVER['REQUEST_URI'],'?')!==false?'&view_all':'?view_all')).'">', lang('login.register'),'</a> </div>';
						}
					?>
				  </div>
				  
				</div><!-- /.modal-content -->
			  </div><!-- /.modal-dialog -->
			</div><!-- /.modal -->
		<?php
	}
	
	$book_json = '[]';
	
	if($login->is_logged_in){
		if(isset($_GET['joined']) && is_numeric($_GET['joined'])){
			if($_GET['joined'] == '1'){
				echo '<div class="alert alert-success"><strong>Book Joined!</strong>  ',lang('acls.join_success'),'</div>';
			}else{
				echo '<div class="alert alert-danger"><strong>Book Not Joined</strong> There was an error when attempting to join this book. The error returned was: "',lang($_GET['error_name']),'"</div>';
			}
		}else if(isset($_GET['duplicated']) && is_numeric($_GET['duplicated'])){
			if($_GET['duplicated'] == '1'){
				echo '<div class="alert alert-success"><strong>Book Cloned!</strong> ',lang('acls.clone_success'),'</div>';
			}else{
				echo '<div class="alert alert-danger"><strong>Book Not Joined</strong> There was an error when attempting to join this book. The error returned was: "',lang($_GET['error_name']),'"</div>';
			}
		}else if(isset($_GET['created']) && is_numeric($_GET['created'])){
			if($_GET['created'] == '1'){
				echo '<div class="alert alert-success"><strong>Book Created!</strong> ',lang('acls.create_success'),'</div>';
			}else{
				echo '<div class="alert alert-danger"><strong>Book Not Created</strong> There was an error when attempting to create your book. The error returned was: "',lang($_GET['error_name']),'"</div>';
			}
		}
	}
	
	switch(ACLSWORKBENCH_METHOD){
		case 'home':
			?>
				<hr class="dark mobile_only" />
				<div class="hidden-xs">
				<br /><br /><button id="start_tour" class="btn btn-success btn-lg center-block">Take a Tour of ACLS Workbench</button><br /><br /><br />
				</div>
				<div data-step="2" data-intro="ACLS Workbench has four main functions:">
					<div class="row" data-step="2">
					  <div class="col-sm-6 col-xs-12 action" data-step="3" data-intro="First, ACLS Workbench provides a user-friendly, community-driven way of viewing books written with Scalar.">
						<a href="./?view_all&action=index"><h2><i class="icon-index"></i> <strong>View</strong> all Books</h2></a>
						<span class="text-muted">Sorted index of all books currently part of the <strong>ACLS Workbench</strong>. This is a good place to start if you are new to this project.</span>
					  </div>
					  <div class="col-sm-6 col-xs-12 action" data-step="4" data-intro="Second, ACLS Workbench introduces the ability to 'Join' a Scalar book, which allows you to follow the progress of a book that interests you. You may also request to become a co-author and  help to make the book even better!">
						  <a href="./?view_all&action=join"><h2><i class="glyphicon icon-join"></i> <strong>Join</strong> a Book</h2></a>
						  <span class="text-muted">Interested in helping to write a book? Search by title or view all books to request access.</span>
					  </div>
				  </div>
				  <div class="row">
					  <div class="col-sm-6 col-xs-12 action"  data-step="5" data-intro="Next, ACLS Workbench is based upon the idea of creating duplicatable 'seed' books. You can choose to clone any of these books to use and add to their existing assets and research to create your own spin-off publication.">
						<a href="./?view_all&action=clone"><h2><i class="icon-clone"></i> <strong>Clone</strong> a Book</h2></a>
						<span class="text-muted">Get started quickly by expanding on one of our template books - search by title or view a list of all books.</span>
					  </div>
					  <div class="col-sm-6 col-xs-12 action"  data-step="6" data-intro="Finally, if you wish to start a book from scratch, ACLS Workbench uses the power of Scalar to allow you to create your own metadata-rich digital literature.">
						  <a href="./?view_all&action=create"><h2><i class="icon-create"></i> <strong>Create</strong> a Book</h2></a>
						  <span class="text-muted">Start a book from scratch - choose a title and create your own content.</span>
					  </div>
				  </div>
				</div>
			<?php
			break;
		case 'join':
			$book_json = json_encode($joinable_stripped);
			show_search_form( array_merge($featured_joinable, $joinable), 'Joinable Books', $login->is_logged_in?$login->user_id:null );
			break;
		case 'clone':
			$book_json = json_encode($duplicatable_stripped);
			show_search_form( array_merge($featured_duplicatable, $duplicatable), 'Cloneable Books', $login->is_logged_in?$login->user_id:null );
			break;
		case 'create':
			echo '<div class="well"><h1>Create a new Book</h1><div id="create_wrapper" data-step="2" data-intro="In order to create a book, you must first enter a title. Your book\'s URL will be based off of this value.">';
			if($login->is_logged_in){
				?>
					<form id="create_book_form" action="<?php echo base_url(); ?>system/dashboard" method="post">
						<input type="hidden" name="redirect" value="<?php echo base_url().'?'; ?>">
						<input type="hidden" name="action" value="do_add_book">
						<input type="hidden" name="user_id" value="<?php echo $login->user_id; ?>">
						<p>You are about to create a new book. In order to start this process,  please enter the book's title. You may change this title at a later time, however your book's URL will be based on this initial value. You may also choose to allow or disallow users to subscribe to your book. A subscribed user will be listed as a "reader" of your book, but will be unable to edit or contribute outside of comments. By default, subscriptions are allowed.</p>
						<p>Once you have entered your desired book title, click "Create book," below.</p>
						<hr>
						<div class="form-group text-center">
							<label for="create_book_title">New Book Title: <br /><input id="create_book_title" name="title" type="text" placeholder="(New book title)" style="width:200px;"></label>
						</div>
						<div class="form-group text-center">
							<label for="joinable">Allow Users to Join* My Book:  <input id="joinable" name="joinable" type="checkbox" checked></label>
							<br />
							<br />
							<em><small class="text-muted"><?php echo lang('acls.join_explaination'); ?></small></em>
						</div>
						<hr>
						<div class="form-group">
							<button class="btn btn-primary pull-right" id="do_create_book">Create book</button>
						</div>
						<br class="clearfix" />
					</form>
				<?php 
			}else{
				echo '<div class="alert alert-danger">In order to create a new book, you must first either <a href="'.ACLSWORKBENCH_LOGIN_URL.'system/login?redirect_url='.urlencode($_SERVER['REQUEST_URI'].(strpos($_SERVER['REQUEST_URI'],'?')!==false?'&view_all':'?view_all')).'">', lang('login.sign_in'), '</a> ',lang('or'),' <a href="'.ACLSWORKBENCH_LOGIN_URL.'system/register?redirect_url='.urlencode($_SERVER['REQUEST_URI'].(strpos($_SERVER['REQUEST_URI'],'?')!==false?'&view_all':'?view_all')).'">', lang('login.register'), '</a> </div>';
			} 
?>
			</div></div>
<?php
			break;
		case 'elevate':
			if(!$login->is_logged_in){
				$this_url = urlencode(base_url().'?'.$_SERVER['QUERY_STRING']);
				redirect(base_url().'system/login?redirect_url='.$this_url);
			}else{
				$invalid_request = true;
				$selected_book = null;
				$selected_user = null;
				$errors = array(
					'invalid_book' => 'The specified book is either invalid, or you do not have access to manage it.',
					'invalid_user' => 'The specified user is either invalid, or does not belong to this book.',
				);
				if(isset($_GET['user_id']) && isset($_GET['book_id'])){
					foreach($user_books as $book){
						if($book->book_id == $_GET['book_id']){
							$selected_book = $book;
							foreach($book->users as $user){
								if($user->user_id == $_GET['user_id']){
									$selected_user = $user;
									$invalid_request = false;
									break 2;
								}
							}
						}
					}
				}
				if(isset($_GET['elevated'])){
					switch($_GET['elevated']){
						case 'true':
							?>
								<div class="well text-center">
									The user, "<strong><?php echo $selected_user->fullname;?></strong>," has been elevated to author status for the book, "<strong><?php echo $selected_book->title; ?></strong>." If you would like to continue to edit this book's users, you can <a href="<?php echo base_url(); ?>system/dashboard?book_id=<?php echo $selected_book->book_id; ?>&zone=users#tabs-users">click here</a>.
								</div>
							<?php
							break;
						case 'false':
							?>
								<div class="well text-center">
									The user, "<strong><?php echo $selected_user->fullname;?></strong>," <strong>has not</strong> been elevated to author status for the book, "<strong><?php echo $selected_book->title; ?></strong>." If you would like to edit this book's users, you can <a href="<?php echo base_url(); ?>system/dashboard?book_id=<?php echo $selected_book->book_id; ?>&zone=users#tabs-users">click here</a>.
								</div>
							<?php
							break;
						default:
							?>
								<div class="well text-center">
									<h4>There was an error with your request:</h4>
									<strong><?php echo $errors[$_GET['error']]; ?></strong>

								</div>
							<?php
							break;
					}
				}else{
					if($invalid_request || $selected_user->relationship != 'reader'){
						?>
							<div class="well text-center"><h4>Invalid Request</h4> Unfortunately, we cannot complete your request, as the request was not properly formed, you do not have permission to elevate users for this book, or the specified user cannot be elevated for this book.</div>
						<?php
					}else{
						?>
							<div class="well text-center"><h4>Would you like to elevate the user, "<strong><?php echo $selected_user->fullname;?></strong>," to an author for the book, "<strong><?php echo $selected_book->title; ?></strong>?"</h4><br /><a href="<?php echo base_url(); ?>system/dashboard?action=acls_elevate_user&user_id=<?php echo $selected_user->user_id; ?>&book_id=<?php echo $selected_book->book_id; ?>" class="btn btn-success btn-lg">Yes*</a>&nbsp;&nbsp;<a href="./?view_all&action=elevate&elevated=false&user_id=<?php echo $selected_user->user_id; ?>&book_id=<?php echo $selected_book->book_id; ?>" class="btn btn-danger btn-lg">No</a><br /><br /><small class="text-muted">*Note: By setting a user as an author, they will be able to edit and create content in your book. They will also be able to approve/deny new users to your book.</div>
						<?php
					}
				}
			}
			break;
		default:
			$book_json = json_encode($other_stripped);
			if($login->is_logged_in){
				?>
					<h3>Your Books</h3>
				<?php
				if(count($user_books) > 0){
					print_books($user_books,$login->user_id);
				}else{
					?>
						<div class="row">
							<div class="col-xs-12">
								It doesn't look like you have any books at this time. Please <a href="./?view_all&action=join">Join</a>, <a href="./?view_all&action=clone">Clone</a>, or <a href="./?view_all&action=create">Create</a> one!
							</div>
						</div>
					<?php
				}
			}
			show_search_form( array_merge($featured_books, $other_books), 'All Books', $login->is_logged_in?$login->user_id:null );
	}
	echo '<script> var book_list = ',$book_json,'; </script>';

//Some closing DIVs left over from the cover
?>
</div>
</div>
</div>