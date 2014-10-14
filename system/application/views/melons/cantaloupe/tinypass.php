<script type="text/javascript" src="../../arbors/html5_RDFa/js/jquery-1.7.min.js"></script>
<script type="text/javascript" src="js/bootstrap.min.js"></script>
<script type="text/javascript" src="https://code.tinypass.com/tinypass.js"></script>
<link href="css/bootstrap.min.css" rel="stylesheet" type="text/css">
<link href="css/reset.css" rel="stylesheet" type="text/css">
<link href="css/common.css" rel="stylesheet" type="text/css">
<style>
	body { visibility: visible; background: url('../../arbors/admin/images/background.png') no-repeat center top #f8f8f8; }
	.panel { position: absolute; width: 50rem; left: 50%; margin-left: -25rem; top: 10%; text-align: center; padding: 2rem; }
	h2 { padding-left: 0; padding-right: 0; line-height: 100%; margin-bottom: 1rem; margin-top: 3rem; }
	h3 { margin-top: 0; font-style: italic; margin-bottom: 3rem; }
</style>
<div class="panel panel-default">
  <div class="panel-body">
  	<img src="../../modules/login/scalar_logo.png"/>
	<h2 class="heading_font"><b><?=$book->title?></b></h2>
	<h3 class="heading_font"><?=$page->versions[$page->version_index]->title?></h3>
    <p>A purchase is required to view the content on this page.</p>
    <div id="tinypass-button"><?=$buttonHTML?></div>
  </div>
</div>