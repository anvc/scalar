<?php
	$current_page_uri = rtrim(base_url(), '/').$this->uri->uri_string;
	
	if(substr($current_page_uri,-1) == '/'){
		$current_page_uri = substr($current_page_uri,0,-1);
	}
	
	
	$login_url = $this->config->item('force_https') ? base_ssl() : base_url();
	
	
	$data = array(
		'melon_base_url' => base_url().'system/application/views/melons/aclsworkbench/',
		'extra_data' => array_slice($this->uri->rsegments,3),
		'login_url' => $login_url,
		'hide_page' => true,
		'current_page_uri' => $current_page_uri
	);
	
	
	if(!isset($page)){
		if(isset($this->uri->rsegments[3])){
			$view = htmlentities(str_replace('.',' ',$this->uri->rsegments[3]));
		}
		$data['page_title'] = ucwords(str_replace('_',' ',preg_replace('/(?!^)[A-Z]{2,}(?=[A-Z][a-z])|[A-Z][a-z]/', ' $0', $view)));
		$data['current_page'] = array();
	}else{
		$data['current_page'] = current($page->versions);
		
		$view = $data['current_page']->default_view;
		$data['page_title'] = $data['current_page']->title;
	}
	
	$modal = false;
	if(isset($_GET['modal']) && $_GET['modal'] === '1'){
		$modal = true;
	}
	
	$data['view'] = $view;
	
	$uris = 'var base_uri = "'.base_url().'"; var book_uri = "'.$base_uri.'"; var current_uri = "'.$current_page_uri.'"; var rdf_url = "'.$current_page_uri.'.rdf";  var melon_uri = "'.$data['melon_base_url'].'";';
	
	if(!$modal){
		if (!file_exists(confirm_slash(APPPATH).'views/melons/aclsworkbench/views/'.$view.'.php')) {
			$this->template->add_css(path_from_file(__FILE__).'css/reset.css');
			$this->template->add_css(path_from_file(__FILE__).'css/common.css');
			$this->template->add_css(path_from_file(__FILE__).'css/responsive.css');
			$this->template->add_css(path_from_file(__FILE__).'css/bootstrap.min.css');
			$this->template->add_css(path_from_file(__FILE__).'css/aclsworkbench.css');
			$this->template->add_css(path_from_file(__FILE__).'css/workbench_icons.css');
			$this->template->add_js($uris,'embed');
			$this->template->add_js(path_from_file(__FILE__).'js/scalarpage.jquery.js');
			$this->template->add_js(path_from_file(__FILE__).'js/scalarmedia.jquery.js');
			$this->template->add_js(path_from_file(__FILE__).'js/scalarmediadetails.jquery.js');
			$this->template->add_js(path_from_file(__FILE__).'js/scalarindex.jquery.js');
			$this->template->add_js(path_from_file(__FILE__).'js/scalarhelp.jquery.js');
			$this->template->add_js(path_from_file(__FILE__).'js/scalarcomments.jquery.js');
			$this->template->add_js(path_from_file(__FILE__).'js/scalarsearch.jquery.js');
			$this->template->add_js(path_from_file(__FILE__).'js/scalarvisualizations.jquery.js');
			$this->template->add_js(path_from_file(__FILE__).'js/scalarstructuredgallery.jquery.js');
			$this->template->add_js(path_from_file(__FILE__).'js/scalarpinwheel.jquery.js');
			$this->template->add_js(path_from_file(__FILE__).'js/bootstrap.min.js');
			$this->template->add_js(path_from_file(__FILE__).'js/main.js');
			$this->template->add_js(path_from_file(__FILE__).'js/aclsworkbench.js');
			$this->load->view('melons/aclsworkbench/header',$data);
		}else{
			$this->template->add_css(path_from_file(__FILE__).'css/bootstrap.min.css');
			$this->template->add_css(path_from_file(__FILE__).'css/aclsworkbench.css');
			$this->template->add_css(path_from_file(__FILE__).'css/workbench_icons.css');
			$this->template->add_js(path_from_file(__FILE__).'js/bootstrap.min.js');
			$this->template->add_js(path_from_file(__FILE__).'js/aclsworkbench.js');
			
			$data['hide_page'] = false;
			
			$this->load->view('melons/aclsworkbench/header',$data);
			$this->load->view('melons/aclsworkbench/views/'.$view,$data);
		}
	}else{
		$this->load->view('melons/aclsworkbench/views/'.$view,$data);
	}