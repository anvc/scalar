<?php 
	if (!defined('BASEPATH')){ exit('No direct script access allowed'); }
	$this->template->add_css(path_from_file(__FILE__).'css/bootstrap.min.css');
	$this->template->add_css(path_from_file(__FILE__).'css/cover.css?v=2');
	$this->template->add_css(path_from_file(__FILE__).'css/workbench_icons.css?v=2');
	$this->template->add_js(path_from_file(__FILE__).'js/bootstrap.min.js');
	$this->template->add_css(path_from_file(__FILE__).'css/introjs.min.css');
	$this->template->add_js(path_from_file(__FILE__).'js/intro.min.js');
	$method = $this->router->fetch_method();

	$login_url = $this->config->item('force_https') ? base_ssl() : base_url();
	
	$valid_methods = array('home','index','join','clone','create','elevate');
	
	$method = 'index';
	
	if(!empty($_GET['action'])){
		$method = preg_replace('/[^a-z_]+/','',strtolower($_GET['action']));
	}else if (!$login->is_logged_in && $method == 'index') {
		$method = 'home';
	}
	
	if(!in_array($method,$valid_methods)){
		$method = 'index';
	}
	
	define('ACLSWORKBENCH_METHOD',$method);
	define('ACLSWORKBENCH_ICON_URL',base_url().path_from_file(__FILE__).'img/project_icon.svg');
	define('ACLSWORKBENCH_LOGIN_URL',$login_url);
	
?>

<div class="visible-xs navbar navbar-inverse navbar-fixed-top" role="navigation">
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
      	<li><a href="./?view_all&action=index" class="<?php echo (ACLSWORKBENCH_METHOD=='index'?'active':''); ?>"><i class="text-muted icon-index"></i> View all Books</a></li>
        <li><a href="./?view_all&action=join" class="<?php echo (ACLSWORKBENCH_METHOD=='join'?'active':''); ?>"><i class="text-muted icon-join"></i> Join a Book</a></li>
        <li><a href="./?view_all&action=clone" class="<?php echo (ACLSWORKBENCH_METHOD=='clone'?'active':''); ?>"><i class="text-muted icon-clone"></i> Clone a Book</a></li>
        <li><a href="./?view_all&action=create" class="<?php echo (ACLSWORKBENCH_METHOD=='create'?'active':''); ?>"><i class="text-muted icon-create"></i> Create a Book</a></li>  
      </ul>
    </div><!--/.nav-collapse -->
  </div>
</div>
<meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
<div class="main_container container" id="container_<?php echo ACLSWORKBENCH_METHOD; ?>">
	<div class="row">
	    <div class="col-md-6 col-sm-8  col-xs-12">
	     <?php $this->load->view('modules/aclsworkbench_cover/dashboard_title'); ?>
	    </div>
	    <div class="col-md-6  col-sm-4  col-xs-12">
	     <span class="pull-right top_tag">
	     <?php $this->load->view('modules/aclsworkbench_cover/login'); ?>
	     </span>
		</div>
	</div>
	<? if ($this->config->item('index_msg')): ?>
	<div class="saved msg"><?=$this->config->item('index_msg')?></div>
	<? endif ?>	
	<?php
		if($method == 'home'){
	?>
		<hr class="dark mobile_only" />
		<div class="row">
        <div class="col-xs-8 col-xs-offset-2 col-sm-3 col-sm-offset-0" data-step="1" data-intro="Welcome to ACLS Workbench, a new, responsive, user-friendly interface for Scalar!">
          <img src="<?php echo ACLSWORKBENCH_ICON_URL; ?>" class="img-responsive" id="icon">
          <?php
          	if (!$login->is_logged_in){
          ?>
          	<small class="text-muted">Registration is required in order to join, clone, or create a book. You may either <?php echo '<a href="'.ACLSWORKBENCH_LOGIN_URL.'system/login?redirect_url='.urlencode($_SERVER['REQUEST_URI'].(strpos($_SERVER['REQUEST_URI'],'?')!==false?'&view_all':'?view_all')).'">', lang('login.sign_in'), '</a> ',
				  lang('or'),' <a href="'.ACLSWORKBENCH_LOGIN_URL.'system/register?redirect_url='.urlencode($_SERVER['REQUEST_URI'].(strpos($_SERVER['REQUEST_URI'],'?')!==false?'&view_all':'?view_all')).'">', lang('login.register'), '</a> ';?> to access these features.</small>
		  <?php 
		  	}
		  ?>
		 </div>
		 <div class="col-sm-9 col-xs-12">
	<?php
		}else{
	?>
		<div class="row">
        <div class="col-xs-12">
	<?php
		}
	?>
