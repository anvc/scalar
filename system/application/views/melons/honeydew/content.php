<?php
if (!file_exists(confirm_slash(APPPATH).'views/melons/honeydew/content/'.$view.'.php')) show_404();
$this->template->add_css(path_from_file(__FILE__).'../../modules/cover/login.css');
$this->template->add_css(path_from_file(__FILE__).'../../modules/cover/title.css');
$this->template->add_css(path_from_file(__FILE__).'content.css');
if (isset($book->stylesheet) && !empty($book->stylesheet)) $this->template->add_css(path_from_file(__FILE__).'themes/'.$book->stylesheet.'.css');
$this->template->add_js(path_from_file(__FILE__).'main.js');
$this->load->view('melons/honeydew/content/'.$view);
?>