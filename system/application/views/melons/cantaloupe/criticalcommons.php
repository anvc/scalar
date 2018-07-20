<?php
$this->template->add_js('system/application/views/melons/cantaloupe/js/bootbox.min.js');
$this->template->add_css('system/application/views/widgets/import/scalarimport.css');
$this->template->add_js('system/application/views/widgets/import/jquery.scalarimport.js');
$this->template->add_js('system/application/views/widgets/import/jQuery-File-Upload/js/vendor/jquery.ui.widget.js');
$this->template->add_js('system/application/views/widgets/import/jQuery-File-Upload/js/jquery.iframe-transport.js');
$this->template->add_js('system/application/views/widgets/import/jQuery-File-Upload/js/jquery.fileupload.js');
$this->template->add_js('system/application/views/widgets/import/jQuery-File-Upload/js/jquery.fileupload-process.js');
$css = <<<END

.ci-template-html {font-family:Georgia,Times,serif !important;}
h2, h3 {padding-left:92px !important; padding-right:0px !important; padding-bottom:20px;}
#creating {display:none;}
#cc {margin:0; padding:0; border:0; width:100%;}
END;
$this->template->add_css($css, 'embed');
?>
<h2 class="heading_font">Critical Commons Inline Importer</h2>
<h3 id="creating" class="text-success">Creating Scalar page ...</h3>
<iframe id="cc" src="http://www.criticalcommons.org/scpublisher?prev=<? echo base_url().$book->slug; ?>/criticalcommons/result"></iframe>
<script>
window.has_redirected = function(redirect_to) {
	var $cc = $('#cc');
	$cc.prop('src', redirect_to);
	$cc.off('load').load(function() {
		$('#creating').show();
		document.body.scrollTop = 0;
		// TODO: need CORS header on Critical Commons
        $.ajax({
            url: redirect_to,
            dataType: 'text',
            type: 'GET',
            async: true,
            statusCode: {
                404: function(response) {
                    alert('Could not find the start profile on GitHub');
                },
                200: function(response) {
                    var data = eval(response);
                    console.log(data);
                }
            },
            error: function(jqXHR, status, errorThrown) {
                console.log('There was an error:');
                console.log(jqXHR);
            }
        });
	});
};
$(document).ready(function() {
	$cc = $('#cc');
	var height = 1220;  // The static height of the CC page
	$cc.height(height);
});
</script>
