<?php
	$authors = array();
	$is_member = false;
	foreach($book->contributors as $contributor){
		if($contributor->relationship == 'author'){
			$authors[] = $contributor->fullname;
		}
		//Check to see if the current user is a member (author or "joined")
		if(isset($login->user_id) && $contributor->user_id == $login->user_id){
			$is_member = true;
		}
	}
	if(count($authors) > 1){
		$last_author = array_pop($authors);
		$authors_text = '<strong>'.implode('</strong>, <strong>',$authors).'</strong> and <strong>'.$last_author.'</strong>';
	}else{
		$authors_text = $authors[0];
	}

	if(!isset($current_page) || !isset($current_page->default_view)){
		$current_page = new stdClass();
		$current_page->default_view='default';
	}
	?>
	<div id="background-image"></div>
	<div id="modal" class="modal fade bs-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
				  <div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
					<h3 class="modal-title" id="clone_dialogue_title"></h3>
				  </div>
				  <div class="modal-body">
				  </div>
				</div><!-- /.modal-content -->
			</div>
		</div>
	</div>
	
	<div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
        </div>
        <div class="collapse navbar-collapse">
          <ul class="nav navbar-nav">
            <li class="text-center"><a data-toggle="tooltip"  title="Workbench Index" href="<?php echo base_url(); ?>" class="link_workbench_home"><span class="icon-workbench" style=""></span><span class="mobile_only">&nbsp;&nbsp;Workbench Index</span></a></li>
            <li class="text-center"><a data-toggle="tooltip"  title="Book Home" href="<?php echo $base_uri; ?>" class="link_book_home"><span class="glyphicon glyphicon-home" style=""></span><span class="mobile_only">&nbsp;Book Home</span></a></li>
            <li class="text-center"><a data-toggle="tooltip"  title="Book Index" href="<?php echo $base_uri; ?>index" class="link_book_index"><span class="glyphicon glyphicon-th-list" style=""></span><span class="mobile_only">&nbsp;Book Index</span></a></li>
            <?php 
				if(!empty($current_page->has_paths) || !empty($current_page->path_of) || !empty($current_page->has_tags) || !empty($current_page->tag_of)){ 
			?>
				<li class="text-center"><a data-toggle="tooltip"  title="Book Map" href="<?php echo $base_uri; ?>map" class="link_book_map"><span class="glyphicon glyphicon-map-marker" style=""></span><span class="mobile_only">&nbsp;Book Map</span></a></li>
			<?php
				}
				$num_data_attributes = preg_match_all('/data-(?<data_type>\w+)="(?<value>\w+)"/',trim($book->title),$data_attributes);
				if(count($data_attributes['data_type']) == $num_data_attributes &&  count($data_attributes['value'])  ==  $num_data_attributes && $num_data_attributes > 0){
					for($i = 0; $i < $num_data_attributes; $i++){
						$extra_data[$data_attributes['data_type'][$i]] = $data_attributes['value'][$i];
					}
				}
				
				if((isset($extra_data['duplicatable']) && $extra_data['duplicatable']=='true') || (!$is_member && (!isset($extra_data['joinable']) || $extra_data['joinable']!='false'))){
			?>
				<li class="divider"><hr class="dark mobile_only"></li>
			<?php
					if(!$is_member && (!isset($extra_data['joinable']) || $extra_data['joinable']!='false')){
				?>
					<li class="text-center"><a data-toggle="tooltip" title="Join Book" href="<?php echo $base_uri; ?>join" class="link_join"><span class="icon-join" style=""></span><span class="mobile_only">&nbsp;&nbsp;Join&quot;<?php echo strip_tags($book->title); ?>&quot;</span></a></li>
				<?php			
					}
					if(isset($extra_data['duplicatable']) && $extra_data['duplicatable']=='true'){
				?>
					<li class="text-center"><a data-toggle="tooltip"  title="Clone Book" href="<?php echo $base_uri; ?>clone" class="link_clone"><span class="icon-clone" style=""></span><span class="mobile_only">&nbsp;&nbsp;Clone &quot;<?php echo strip_tags($book->title); ?>&quot;</span></a></li>
				<?php
					}
				}
			?>
		 </ul>
		 <ul class="nav navbar-nav navbar-right">
		<li class="divider"><hr class="dark mobile_only"></li>
		<li class="text-center"><a data-toggle="popover"  title="Search Book" class="link_search" data-toggle="popover" data-placement="bottom" data-content="<form id='search_form'><input></form>"><span class="glyphicon glyphicon-search" style=""></span><span class="mobile_only">&nbsp;Search Book</span></a></li>
		 <?php
			if($can_edit){
		 ?>
				<li class="text-center"><a data-toggle="tooltip"  title="Create New Page" href="<?php echo $base_uri; ?>new.edit"><span class="glyphicon glyphicon-file" style=""></span><span class="mobile_only">&nbsp;Create New Page</span></a></li>
				<li class="text-center"><a data-toggle="tooltip"  title="Edit This Page" href="<?php echo $current_page_uri; ?>.edit"><span class="glyphicon glyphicon-pencil" style=""></span><span class="mobile_only">&nbsp;Edit This Page</span></a></li>
				<?php if(isset($page->type) && $page->type == 'media' && strpos($current_page->url,'.code')===false){ ?>
					<li class="text-center"><a data-toggle="tooltip"  title="Anotate This Page" href="<?php echo $current_page_uri; ?>.annotation_editor"  class="link_annotate"><span class="glyphicon glyphicon-pushpin" style=""></span><span class="mobile_only">&nbsp;Annotate This Page</span></a></li>
				<?php } ?>
				<li class="text-center"><a data-toggle="tooltip"  title="Manage Media" href="<?php echo base_url().'system/dashboard?book_id='.$book->book_id.'&zone=media#tabs-media'; ?>"><span class="glyphicon glyphicon-picture" style=""></span><span class="mobile_only">&nbsp;Manage Media</span></a></li>
				<li class="text-center"><a data-toggle="tooltip"  title="Edit Book" href="<?php echo base_url().'system/dashboard?book_id='.$book->book_id; ?>"><span class="glyphicon glyphicon-cog" style=""></span><span class="mobile_only">&nbsp;Edit This Book</span></a></li>
			
		<?php
			}
			if($login->is_logged_in){
		 ?>
				<li class="text-center"><a href="<?php echo strip_base_ssl().'system/logout?action=do_logout&redirect_url='.urlencode($_SERVER['REQUEST_URI']); ?>" onclick="return confirm('<?php echo lang('login.confirm_sign_out'); ?>')" data-toggle="tooltip"  title="Log Out"><span class="glyphicon glyphicon-log-out" style=""></span><span class="mobile_only">&nbsp;Log Out</span></a></li>
		<?php
			}else{
				$login_url = $this->config->item('force_https') ? base_ssl() : base_url();
		?>
			<li class="text-center"><a data-toggle="tooltip"  title="Log In" href="<?php echo $login_url; ?>system/login?redirect_url=<?php echo urlencode($_SERVER['REQUEST_URI']); ?>"><span class="glyphicon glyphicon-log-in" style=""></span><span class="mobile_only">&nbsp;Log In</span></a></li>
			<li class="text-center"><a data-toggle="tooltip"  title="Register Account" href="<?php echo $login_url; ?>system/register?redirect_url=<?php echo urlencode($_SERVER['REQUEST_URI']); ?>"><span class="glyphicon glyphicon-user" style=""></span><span class="mobile_only">&nbsp;Register Account</span></a></li>
		<?php
			}
		?>
		 </ul>
        </div><!--/.nav-collapse -->
      </div>
    </div>
	<div id="hide_map"><a href="#">Close Map</a></div>
    <?php
    	if($current_page->default_view == 'splash' || $current_page->default_view=='book_splash'){
    		?>
				<div id="splash_cover">
					<div class="row">
						<div class="col-sm-12 col-md-<?php echo (isset($current_page->content) & $current_page->content!='')?'6 text-right':'12 text-center';?>">
							<h1><?php echo $current_page->default_view == 'splash'?$current_page->title:($book->title.(isset($book->subtitle) && $book->subtitle!='' ? '<small>'.$book->subtitle.'</small>':'').'</h1><p class="text-muted">By '.$authors_text.'</p>'); ?></h1>
						</div>
						<?php if(isset($current_page->content) & $current_page->content!=''){ ?>
							<div class="col-sm-12 col-md-6">
								<?php echo $current_page->content; ?>
							</div>
						<?php } ?>
					</div>
					<div class="relationships text-center"></div>
				</div>
    		<?php
    	}
    ?>
	<div class="container <?php echo $current_page->default_view; ?>" role="main" id="page_body">
		<?php
			switch($current_page->default_view){
				case 'image_header': ?>
					<header class="main image" style="background-image: url('<?php echo $page->background; ?>')">
				<?php break;
				default: ?>
					<header class="main dark">
				<?php
			}
		?>
			<h1><?php echo $book->title.(isset($book->subtitle) && $book->subtitle!='' ? '<small>'.$book->subtitle.'</small>':''); ?></h1>
			<p class="text-muted">By <?php echo $authors_text; ?></p>
		</header>
		
		<div id="body" class="<?php  echo $login->is_logged_in?'logged_in':'not_logged_in';  echo $hide_page?' with_loader':''?>">
			<div id="spinner" class="text-center">
				<br />
				<img src="<?php echo $melon_base_url; ?>img/spinner.gif">
				<br />
			</div>