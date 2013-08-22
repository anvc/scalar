<?$this->template->add_css(path_from_file(__FILE__).'css/reset.css')?>
<?$this->template->add_css(path_from_file(__FILE__).'css/common.css')?>
<?$this->template->add_css(path_from_file(__FILE__).'css/responsive.css')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/main.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarheader.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarpage.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarmedia.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarmediadetails.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarindex.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarhelp.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarsearch.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarstructuredgallery.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarpinwheel.jquery.js')?>
<?
if (file_exists(confirm_slash(APPPATH).'views/melons/cantaloupe/'.$view.'.php')) {
  $this->load->view('melons/cantaloupe/'.$view);
}
?>