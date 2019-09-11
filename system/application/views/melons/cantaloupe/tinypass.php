<!-- 
Book icon, in PHP: 
if (!empty($book->book_thumbnail)) {
  echo '<img src="'.base_url().$book->slug.'/'.$book->book_thumbnail.'" />';
}
Publisher icon, in PHP: 
if (!empty($book->publisher_thumbnail)) {
  echo '<img src="'.base_url().$book->slug.'/'.$book->publisher_thumbnail.'" />';
} 
-->
<? $view_url = base_url().'system/application/views/'; ?>
<link href="<?=$view_url?>melons/cantaloupe/css/bootstrap.min.css" rel="stylesheet" type="text/css">
<link href="<?=$view_url?>melons/cantaloupe/css/reset.css" rel="stylesheet" type="text/css">
<link href="<?=$view_url?>melons/cantaloupe/css/common.css" rel="stylesheet" type="text/css">
<script type="text/javascript" src="<?=$view_url?>arbors/html5_RDFa/js/jquery-3.4.1.min.js"></script>
<script type="text/javascript" src="<?=$view_url?>melons/cantaloupe/js/bootstrap.min.js"></script>
<script type="text/javascript" src="https://code.tinypass.com/tinypass.js"></script>
<style>
	body { visibility: visible; background: url('<?=$view_url?>arbors/admin/images/background.png') no-repeat center top #f8f8f8; }
	.panel { position: absolute; width: 50rem; left: 50%; margin-left: -25rem; top: 10%; text-align: center; padding: 2rem; }
	h2 { padding-left: 0; padding-right: 0; line-height: 100%; margin-bottom: 1rem; margin-top: 3rem; }
	h3 { margin-top: 0; font-style: italic; margin-bottom: 3rem; }
	.tinypass_button {width:100% !important;}
</style>
<div class="panel panel-default">
  <div class="panel-body">
  	<img src="<?=$view_url?>modules/login/scalar_logo.png"/>
	<h2 class="heading_font"><b><?=$book->title?></b></h2>
	<h3 class="heading_font"><?=$page->versions[$page->version_index]->title?></h3>
    <p>To gain full access to this book for an affordable price, please click the button below.</p>
    <div id="tinypass-button"><?=$buttonHTML?></div>
  </div>
</div>