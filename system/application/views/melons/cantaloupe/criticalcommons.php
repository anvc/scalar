<?php
$this->template->add_js('system/application/views/melons/cantaloupe/js/bootbox.min.js');
$this->template->add_css('system/application/views/widgets/import/scalarimport.css');
$this->template->add_js('system/application/views/widgets/import/jquery.scalarimport.js');
$this->template->add_js('system/application/views/widgets/import/jQuery-File-Upload/js/vendor/jquery.ui.widget.js');
$this->template->add_js('system/application/views/widgets/import/jQuery-File-Upload/js/jquery.iframe-transport.js');
$this->template->add_js('system/application/views/widgets/import/jQuery-File-Upload/js/jquery.fileupload.js');
$this->template->add_js('system/application/views/widgets/import/jQuery-File-Upload/js/jquery.fileupload-process.js');
$this->template->add_js($js, 'embed');
$css = <<<END

.ci-template-html {font-family:Georgia,Times,serif !important;}
h2 {padding-left:7.2rem !important; padding-right:7.2rem !important;}
#cc {margin:0; padding:0; border:0; width:100%;}
END;
$this->template->add_css($css, 'embed');

if (empty($slug)):
?>
<h2 class="heading_font">Critical Commons Inline Importer</h2>
<iframe id="cc" src="http://www.criticalcommons.org/scpublisher?prev=<? echo base_url().$book->slug; ?>/criticalcommons/result"></iframe>
<script>
$(document).ready(function() {
	$cc = $('#cc');
	var height = 1220;  // The static height of the CC page
	$cc.height(height);
});
</script>
<?php
endif;
?>

