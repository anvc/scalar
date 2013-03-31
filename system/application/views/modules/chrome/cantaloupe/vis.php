<?php
$this->template->add_css(path_from_file(__FILE__).'css/vis.css');
$this->template->add_js(path_from_file(__FILE__).'js/vis.js');

echo '<div id="vis"></div>'."\n";