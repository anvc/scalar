<?php
	if (!defined('BASEPATH')){exit('No direct script access allowed');}
	
	$this->template->add_js(path_from_file(__FILE__).'js/fuse.min.js');
	$this->template->add_js(path_from_file(__FILE__).'js/aclsworkbench_book_list.js');
	$this->template->add_css(path_from_file(__FILE__).'css/aclsworkbench_book_list.css');

	//Loop through each book, producing the book wrapping html for the book index
	function print_books($books,$cols, $tab_cols,  $mob_cols, $user_id) {
		if(!isset($tab_cols)){
			$tab_cols = $cols;
		}if(!isset($mob_cols)){
			$mob_cols = $tab_cols;
		}
		$num_books = count($books);
		echo '<div class="original book_list row">';
		foreach ($books as $i=>$row) {
			$uri 		   = confirm_slash(base_url()).$row->slug;
			$title		   = trim(strip_tags($row->title));
			$book_id       = (int) $row->book_id;
			$thumbnail     = (!empty($row->thumbnail)) ? confirm_slash($row->slug).$row->thumbnail : null;
			$is_live       = ($row->display_in_index) ? true : false; 
			$is_featured   =@ ($row->is_featured) ? true : false;
			if (empty($thumbnail) || !file_exists($thumbnail)) $thumbnail = path_from_file(__FILE__).'default_book_logo.png';
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
			echo '<div data-book_id="',$book_id,'" class="book_container col-md-'.round(12/$cols).' col-sm-'.round(12/$tab_cols).' col-xs-'.round(12/$mob_cols).'">
			<div class="book center-block',($is_featured?' featured':''),'" ><div class="cover" style="background-image: url(/',$thumbnail,')"><a href="',$uri,'">',($is_featured?'<p class="bg-primary text-center"><span class="glyphicon glyphicon-star"></span> Featured</p>':''),($user_is_reader?'<p class="bg-success text-center"><span class="glyphicon glyphicon-check"></span> Joined</p>':''),(($row->current_user && !$user_is_reader && $is_live)?'<p class="bg-danger text-center"><small><span class="glyphicon glyphicon-eye-close"></span> Not Published</small></p>':''),'</a></div>',
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
			if(($i+1)%$cols == 0){
				echo '</div><div class="book_list row">';
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
					print_books($book_list,6,4,2,$user_id);
				?>
			</div>
		<?php
	}
	
	
	//We need to make lots of different lists of the books, so that we can filter and show the books based on certain criteria; Initialize all the arrays!
	$user_books = $featured_books = $all_books = $other_books = $duplicatable = $featured_duplicatable = $duplicatable_stripped = $other_stripped  = $joinable = $featured_joinable = $joinable_stripped= array();
	
	//Build array of all books. Arrays ending in "_stripped" are used as JSON arrays later for the search javascript.
	foreach ($books as $row) {

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
				if(empty($row->data['duplicatable']) || $row->data['duplicatable'] == 'true'){
					$featured_duplicatable[] = $row;
					$duplicatable_stripped[] = array(
						'id'=>$book_id,
						'authors'=>implode(', ',$authors),
						'title'=>$row->title,
						'description'=>$row->description
					);
				}else{
					if(!$row->current_user_is_author && (!isset($row->data['joinable']) || !in_array($row->data['joinable'],array('false','0')))){
						$featured_joinable[] = $row;
						$joinable_stripped[] = array(
							'id'=>$book_id,
							'authors'=>implode(', ',$authors),
							'title'=>$row->title,
							'description'=>$row->description
						);
					}
				}
				$featured_books[] = $row;
				$other_stripped[] = array(
					'id'=>$book_id,
					'authors'=>implode(', ',$authors),
					'title'=>$row->title,
					'description'=>$row->description
				);
			}else{
				if(empty($row->data['duplicatable']) || $row->data['duplicatable'] == 'true'){
					$duplicatable[] = $row;
					$duplicatable_stripped[] = array(
						'id'=>$book_id,
						'authors'=>implode(', ',$authors),
						'title'=>$row->title,
						'description'=>$row->description
					);
				}else{
					if(!$row->current_user && (!isset($row->data['joinable']) || !in_array($row->data['joinable'],array('false','0')))){
						$joinable[] = $row;
						$joinable_stripped[] = array(
							'id'=>$book_id,
							'authors'=>implode(', ',$authors),
							'title'=>$row->title,
							'description'=>$row->description
						);
					}
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
		<hr class="dark" />
		<div class="row menu">
			<?php
				foreach($list_methods as $method=>$text){
					echo '<div class="col-xs-12 col-sm-6 col-md-3"><a href="./?action='.$method.'" class="center-block '.$method.(ACLSWORKBENCH_METHOD==$method?' active':'').'">'.$text.'</a></div>';
				}
			?>
		</div>
		<hr class="dark mobile_only" />
		<br />
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
				<div class="row">
	              <div class="col-sm-6 col-xs-12 action">
	                <a href="./?action=index"><h2><i class="large index icon"></i><strong>View</strong> all Books</h2></a>
	                <span class="text-muted">Sorted index of all books currently part of the <strong>ACLS Workbench</strong>. This is a good place to start if you are new to this project.</span>
	              </div>
	              <div class="col-sm-6 col-xs-12 action">
	                  <a href="./?action=join"><h2><i class="large join icon"></i><strong>Join</strong> a Book</h2></a>
	                  <span class="text-muted">Interested in helping to write a book? Search by title or view all books to request access.</span>
	              </div>
	          </div>
	          <div class="row">
	              <div class="col-sm-6 col-xs-12 action">
	                <a href="./?action=clone"><h2><i class="large clone icon"></i><strong>Clone</strong> a Book</h2></a>
	                <span class="text-muted">Get started quickly by expanding on one of our template books - search by title or view a list of all books.</span>
	              </div>
	              <div class="col-sm-6 col-xs-12 action">
	                  <a href="./?action=create"><h2><i class="large create icon"></i><strong>Create</strong> a Book</h2></a>
	                  <span class="text-muted">Start a book from scratch - choose a title and create your own content.</span>
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
			echo '<div class="well"><h1>Create a new Book</h1>';
			if($login->is_logged_in){
				?>
					<form id="create_book_form" action="http://scalar.faciam.us/system/dashboard" method="post">
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
				echo '<div class="alert alert-danger">In order to create a new book, you must first either <a href="'.ACLSWORKBENCH_LOGIN_URL.'system/login?redirect_url='.urlencode($_SERVER['REQUEST_URI']).'">', lang('login.sign_in'), '</a> ',lang('or'),' <a href="'.ACLSWORKBENCH_LOGIN_URL.'system/register?redirect_url='.urlencode($_SERVER['REQUEST_URI']).'">', lang('login.register'), '</a> </div>';
			} 
?>
			</div>
<?php
			break;
		default:
			$book_json = json_encode($other_stripped);
			if($login->is_logged_in){
				?>
					<h3>Your Books</h3>
				<?php
				if(count($user_books) > 0){
					print_books($user_books,6,4,2,$login->user_id);
				}else{
					?>
						<div class="row">
							<div class="col-xs-12">
								It doesn't look like you have any books at this time. Please <a href="./?action=join">Join</a>, <a href="./?action=clone">Clone</a>, or <a href="./?action=create">Create</a> one!
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