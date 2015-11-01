<?php
$this->template->add_js('system/application/views/melons/cantaloupe/js/jquery-iframe-auto-height.min.js');
?>
<style>
#centered-message {display:none;}
.page {position:static;}
#tensor_iframe {border:0; position:absolute; top:52px; left:0px; width:100%; min-height:300px;}
</style>
<iframe id="tensor_iframe" src="<?php echo $app_root.'plugins/tensor/wb/pegboard?base='.base_url().'&slug='.$book->slug ?>"></iframe>
<script>
  $('iframe#tensor_iframe').iframeAutoHeight({minHeight: 300});
</script>