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
	
	$valid_methods = array('home','index','join','clone','create');
	
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
	<?php
		if($method == 'home'){
	?>
		<hr class="dark mobile_only" />
		<div class="row">
        <div class="col-xs-8 col-xs-offset-2 col-sm-3 col-sm-offset-0">
          <img src="<?php echo ACLSWORKBENCH_ICON_URL; ?>" class="img-responsive" id="icon" data-step="1" data-intro="Welcome to ACLS Workbench, a new, responsive, user-friendly interface for Scalar!">
          <?php
          	if (!$login->is_logged_in){
          ?>
          	<small class="text-muted">Registration is required in order to join, clone, or create a book. You may either <?php echo '<a href="'.ACLSWORKBENCH_LOGIN_URL.'system/login?redirect_url='.urlencode($_SERVER['REQUEST_URI']).'">', lang('login.sign_in'), '</a> ',
				  lang('or'),' <a href="'.ACLSWORKBENCH_LOGIN_URL.'system/register?redirect_url='.urlencode($_SERVER['REQUEST_URI']).'">', lang('login.register'), '</a> ';?> to access these features.</small>
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
