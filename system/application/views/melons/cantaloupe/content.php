<?$this->template->add_css(path_from_file(__FILE__).'css/reset.css')?>
<?$this->template->add_css(path_from_file(__FILE__).'css/bootstrap.min.css')?>
<?$this->template->add_css(path_from_file(__FILE__).'css/bootstrap-accessibility.css')?>
<?$this->template->add_css(path_from_file(__FILE__).'css/common.css')?>
<?$this->template->add_css(path_from_file(__FILE__).'css/responsive.css')?>
<?$this->template->add_css(path_from_file(__FILE__).'css/sidebar_vis.css')?>
<?$this->template->add_css(path_from_file(__FILE__).'css/ionicons_with_scalar.css')?>
<?$this->template->add_css(path_from_file(__FILE__).'css/screen_print.css', 'link', 'screen,print')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/bootstrap.min.js');?>
<?$this->template->add_js(path_from_file(__FILE__).'js/bootstrap-accessibility.min.js');?>
<?$this->template->add_js(path_from_file(__FILE__).'js/jquery.bootstrap-modal.js');?>
<?$this->template->add_js(path_from_file(__FILE__).'js/jquery.bootstrap-accessibility.js');?>
<?$this->template->add_js(path_from_file(__FILE__).'js/main.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarheader.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarpage.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarmedia.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarmediadetails.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarindex.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarhelp.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarcomments.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarsearch.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarvisualizations.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarstructuredgallery.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarpinwheel.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/scalarsidebar.jquery.js')?>
<?$this->template->add_js(path_from_file(__FILE__).'js/jquery.tabbing.js')?>
<?

//Check which visualization type we are using - default is 'pinwheel'
$visualization = $this->config->item('visualization');

//If we have a valid value for the GET variable, "visualization," use it instead.
if(isset($_GET['visualization']) && in_array($_GET['visualization'], $this->config->item('available_visualizations'))){
	$visualization = $_GET['visualization'];
}

$this->template->add_js("var cantaloupe_visualization = '$visualization'; \$(function(){\$('body').addClass(cantaloupe_visualization+'_vis');});",'embed');

if (file_exists(confirm_slash(APPPATH).'views/melons/cantaloupe/'.$view.'.php')) {
  $this->load->view('melons/cantaloupe/'.$view);
}
?>