<? if (!defined('BASEPATH')) exit('No direct script access allowed') ?>
<? $this->template->add_css(path_from_file(__FILE__).'title.css') ?>
<div class="system_wrapper system_cover">
<div class="cover">
<? $this->load->view('modules/cover/login') ?>
<img src="system/application/views/modules/cover/scalar_logo.png" alt="Scalar logo"/>
<h2 class="title dashboard_title">
<?=$cover_title?>
</h2>
</div>
</div>
