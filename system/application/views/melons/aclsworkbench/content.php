<?php
	$current_page_uri = rtrim(base_url(), '/').$this->uri->uri_string;
	
	
	$login_url = $this->config->item('force_https') ? base_ssl() : base_url();
	
	if(substr($current_page_uri,-1) == '/'){
		$current_page_uri = substr($current_page_uri,0,-1);
	}
	
	$data = array(
		'melon_base_url' => base_url().'system/application/views/melons/aclsworkbench/',
		'extra_data' => array_slice($this->uri->rsegments,3),
		'login_url' => $login_url,
		'hide_page' => true
	);
	
	
	if(!isset($page)){
		if(isset($this->uri->rsegments[3])){
			$view = htmlentities(str_replace('.',' ',$this->uri->rsegments[3]));
		}
		$data['page_title'] = ucwords(str_replace('_',' ',preg_replace('/(?!^)[A-Z]{2,}(?=[A-Z][a-z])|[A-Z][a-z]/', ' $0', $view)));
		$data['current_page'] = array();
		$data['current_page_uri'] = '';
	}else{
		$data['current_page'] = current($page->versions);
		
		$view = $data['current_page']->default_view;
		$data['page_title'] = $data['current_page']->title;
		$data['current_page_uri'] = $current_page_uri;
		
		
		$current_path_block = '';
		if(count($data['current_page']->has_paths)>0){
			foreach($data['current_page']->has_paths as $path){
				if($path->is_live){
					$path_slug = $path->slug;
					$path_start = current($path->versions);
					$previous = null;
					$next = null;
					foreach($path_start->path_of as $i=>$path){
						if($i > 0){
							$previous = $i-1;
						}else{
							$previous = null;
						}
						if(isset($path_start->path_of[$i+1])){
							$next = $i+1;
						}else{
							$next = null;
						}
						if($path->content_id == $data['current_page']->content_id){
							break;
						}
					}
					
					$current_path_block .= '<div class="alert alert-info">';
					if(isset($next)){
						$current_path_block .=  '<a class="cf pull-right btn btn-primary btn-sm" style="margin-top: -5px;"  href="'.$base_uri.$path_start->path_of[$next]->slug.'">Next Page ("'.current($path_start->path_of[$next]->versions)->title.'") <span class="glyphicon glyphicon-chevron-right"></span></a>';
					}else if(isset($path_start->continue_to)){
						$current_path_block .=  '<a class="cf pull-right btn btn-success btn-sm" style="margin-top: -5px;" href="'.$base_uri.$path_start->continue_to->slug.'">End of Path. Continue to <strong>"'.current($path_start->continue_to->versions)->title.'"</strong> <span class="glyphicon glyphicon-chevron-right"></span></a>';
					}
					$current_path_block .=  '<a  href="'.$base_uri.$path_slug.'"><span class="glyphicon glyphicon-chevron-up"></span> This page is part of the <em>"'.$path_start->title.'"</em> path.</a></div></div>';
				}
			}
		}
		$data['current_path_block'] = $current_path_block;
		
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