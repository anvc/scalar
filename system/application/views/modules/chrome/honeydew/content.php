<?php

$this->template->add_css(path_from_file(__FILE__).'content.css');
if (isset($book->stylesheet) && !empty($book->stylesheet)) $this->template->add_css(path_from_file(__FILE__).'themes/'.$book->stylesheet.'.css');
if (!file_exists(confirm_slash(APPPATH).'views/modules/chrome/honeydew/content/'.$view.'.php')) show_404();

$this->load->view('modules/chrome/honeydew/pathbar');
$this->load->view('modules/chrome/honeydew/noticebar');
echo '<div class="content" id="content_wrapper">'."\n";   // Indented content
$this->load->view('modules/chrome/honeydew/content/'.$view);
$this->load->view('modules/chrome/honeydew/path_of_list');
$this->load->view('modules/chrome/honeydew/tag_of_list');
$this->load->view('modules/chrome/honeydew/annotation_of_list');
$this->load->view('modules/chrome/honeydew/reply_of_list');
$this->load->view('modules/chrome/honeydew/referenced_list');
$this->load->view('modules/chrome/honeydew/reply_list');
$this->load->view('modules/chrome/honeydew/pathbar_bottom');
$this->load->view('modules/chrome/honeydew/background_audio');
echo "</div>\n";
$this->load->view('modules/chrome/honeydew/tagbar');

?>
