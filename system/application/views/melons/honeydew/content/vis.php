<?$this->template->add_css('system/application/views/melons/honeydew/jquery-ui-1.8.12.custom.css')?>
<?$this->template->add_js('system/application/views/melons/honeydew/jquery-ui-1.8.12.custom.min.js')?>
<?
// Title
if (isset($page->version_index)):
	if (!empty($page->color)) echo '<div class="path_nav_color" style="background-color:'.$page->color.'"></div>';
	echo '<h4 class="content_title">'.$page->versions[$page->version_index]->title.'</h4>'."\n";
endif;
?>
<div id="visualization"></div>
<?
// Content
if (isset($page->version_index)):
	echo '<div id="content">'.nl2brPre($page->versions[$page->version_index]->content).'</div>';
endif;
?>