<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Wb extends CI_Controller {

	public function __construct() {

		parent::__construct();

		$this->data = array();

		$this->load->helper('url');

		$this->load->library("template");
		$this->template->set_layout('wrapper.php');

	}

	public function index() {

		header('Location: '.base_url().'wb/pegboard');
		exit;

	}

	public function proxy() {

		$this->load->model('proxy_model');
		$this->data['results'] = $this->proxy_model->get();
		$this->load->view('proxy', $this->data);

	}

	public function simple_proxy() {

		$url =@ $_REQUEST['url'];
		$content = file_get_contents($url);
		echo $content;
		exit;

	}

	public function pegboard() {

		$this->load->helper('array');

		$this->data['title'] = 'Tensor: Import';
		$this->data['proxy_url'] = base_url().strtolower(get_class()).'/proxy';

		$this->config->load('archives');
		$this->data['archives'] = $this->config->item('archives');
		usort($this->data['archives'], "cmp_archives");

		$this->template->add_css(APPPATH.'views/common/jquery-ui-1.11.4.custom/jquery-ui.min.css');
		$this->template->add_css(APPPATH.'views/common/bootstrap/css/bootstrap.min.css');
		$this->template->add_css(APPPATH.'views/common/tablesorter/theme.default.css');
		$this->template->add_css(APPPATH.'views/common/spectrum/spectrum.css');
		$this->template->add_css(APPPATH.'views/wb.css');
		$this->template->add_js(base_url().APPPATH.'views/common/jquery-1.11.3.min.js');
		$this->template->add_js(base_url().APPPATH.'views/common/jquery-ui-1.11.4.custom/jquery-ui.min.js');
		$this->template->add_js(base_url().APPPATH.'views/common/bootstrap/js/bootstrap.min.js');
		$this->template->add_js(base_url().APPPATH.'views/common/tablesorter/jquery.tablesorter.min.js');
		$this->template->add_js(base_url().APPPATH.'views/common/tablesorter/jquery.tablesorter.widgets.js');
		$this->template->add_js(base_url().APPPATH.'views/common/endless_scroll/endless_scroll.min.js');
		$this->template->add_js(base_url().APPPATH.'views/common/match-height/jquery.matchHeight.js');
		$this->template->add_js(base_url().APPPATH.'views/common/spectrum/spectrum.js');
		$this->template->add_js(base_url().APPPATH.'views/common/jquery.storageapi.js');
		$this->template->add_js(base_url().APPPATH.'views/common/linkify/linkify.js');
		$this->template->add_js(base_url().APPPATH.'views/common/jquery.spreadsheet_model.js');
		$this->template->add_js(base_url().APPPATH.'views/common/jquery.importrdf.js');
		$this->template->add_js(base_url().APPPATH.'views/common/jquery.advanced_search.js');
		$this->template->add_js(base_url().APPPATH.'views/pegboard.js');
		$this->template->render("pegboard", $this->data);

	}

}
?>