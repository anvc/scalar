<?php
	//$new_header = isset($_GET['h']) && $_GET['h']=='1';
	$new_header = true;
?>
<?$this->template->add_css(path_from_file(__FILE__).'css/reset.css')?>
<?$this->template->add_css(path_from_file(__FILE__).'css/bootstrap.min.css')?>
<?$this->template->add_css(path_from_file(__FILE__).'css/bootstrap-accessibility.css')?>
<?$this->template->add_css(path_from_file(__FILE__).'css/common.css')?>
<?$this->template->add_css(path_from_file(__FILE__).'css/responsive.css')?>
<?$this->template->add_css(path_from_file(__FILE__).'css/scalarvis.css')?>
<?php
	if($new_header){
		$this->template->add_css(path_from_file(__FILE__).'css/updated_header.css');
	}else{
		$this->template->add_css(path_from_file(__FILE__).'css/header.css');
	}
?>
<?$this->template->add_css(path_from_file(__FILE__).'css/screen_print.css', 'link', 'screen,print')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/bootstrap.min.js');?>
<?$this->template->add_js(path_from_file(__FILE__).'js/jquery.bootstrap-modal.js');?>
<?$this->template->add_js(path_from_file(__FILE__).'js/jquery.bootstrap-accessibility.js');?>
<?$this->template->add_js(path_from_file(__FILE__).'js/main.js')?>
<?php
	if($new_header){
		$this->template->add_js(path_from_file(__FILE__).'js/jquery.dotdotdot.min.js');
		$this->template->add_js(path_from_file(__FILE__).'js/jquery.scrollTo.min.js');
		$this->template->add_js(path_from_file(__FILE__).'js/updated_scalarheader.jquery.js');
	}else{
		$this->template->add_js(path_from_file(__FILE__).'js/scalarheader.jquery.js');
	}
?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarpage.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarmedia.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarmediadetails.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarindex.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarhelp.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarcomments.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarsearch.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarvisualizations.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarstructuredgallery.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/jquery.tabbing.js')?>
<?
if (file_exists(confirm_slash(APPPATH).'views/melons/cantaloupe/'.$view.'.php')) {
	$this->template->add_html($this->load->view('melons/cantaloupe/'.$view, null, true), $view.'-page');
}
?>