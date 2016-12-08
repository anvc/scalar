<?php
$this->template->add_js('system/application/views/melons/cantaloupe/js/bootbox.min.js');
$this->template->add_css('system/application/views/widgets/import/scalarimport.css');
$this->template->add_js('system/application/views/widgets/import/jquery.scalarimport.js');
$this->template->add_js('system/application/views/widgets/import/jQuery-File-Upload/js/vendor/jquery.ui.widget.js');
$this->template->add_js('system/application/views/widgets/import/jQuery-File-Upload/js/jquery.iframe-transport.js');
$this->template->add_js('system/application/views/widgets/import/jQuery-File-Upload/js/jquery.fileupload.js');
$this->template->add_js('system/application/views/widgets/import/jQuery-File-Upload/js/jquery.fileupload-process.js');
$js = <<<EOT

$(document).ready(function() {
	var url = 'http://craigdietrich.com/tmp/upload/index.php';
	$('#fileupload').fileupload({
		url:url,
	    forceIframeTransport: true,
        add: function (e, data) {
        	$('#start_upload').show();
            data.context = $('#start_upload').click(function () {
				data.context = $('#start_upload').text('Uploading...').prop('disabled','disabled').blur();
				$('#loading').show();
				$('.progress-bar').removeClass('progress-bar-danger').css('width','0%');
				$('#file_props').html('Your upload is in progress. In the meantime you can fill out and save the metadata fields below to activate your upload on Critical Commons.');
				var jqXHR = data.submit();
            });
        },
        done: function(e, data) {
        	var result = $.parseJSON($(data.result).find('body').html());
        	$('#loading').hide();
        	if (!result.files.length) {
        		$('.progress-bar').addClass('progress-bar-danger');
        		$('#start_upload').text('Try Again').removeProp('disabled').blur();
        	} else {
        		$('#start_upload').text('Upload Complete!').prop('disabled','disabled').blur();
        		var file_type = result.files[0].type.substr(result.files[0].type.lastIndexOf('/')+1).toUpperCase();
        		var url = result.files[0].url;
        		var name = result.files[0].name;
				var size = result.files[0].size;
        		$('#file_props').html('The uploaded '+file_type+' ('+size+'KB) will be available at <a href="'+url+'" target="_blank">'+name+'</a> when processing is complete. In the meantime you can fill out and save the metadata fields below to activate your upload on Critical Commons.').fadeIn();
        	};
        },
	    progressall: function (e, data) {
	    	/*
	        var progress = parseInt(data.loaded / data.total * 100, 10);
	        $('#progress .progress-bar').css(
	            'width',
	            progress + '%'
	        )
	        */
	    },
	});
	$('#fileupload').fileupload(
	    'option',
	    'redirect',
	    'http://localhost/scalar/craig-dietrich/criticalcommons/upload/result?%s'
	);
	$('#fileupload').bind('fileuploadprocessfail', function (e, data) {
	    alert(data.files[data.index].error);
	});
	$("#fileupload").change(function (e) {
		var path = this.value;
		$('.upload_message').text(path);
	});
});

EOT;
$this->template->add_js($js, 'embed');
$css = <<<END

h2 {margin-top:0; padding-top:0; margin-left:0; padding-left:0; margin-right:0; padding-right:0;}
h4 {margin-left:0; margin-right:0; padding-left:0; padding-right:0; font-weight:bold;}
.ci-template-html {font-family:Georgia,Times,serif !important; padding-left:7.2rem; padding-right:7.2rem;}
#centered-message {display:none;}
.bootbox h1, .bootbox h4 {margin-left:0px; padding-left:0px;}
.bootbox h1 {margin-bottom:12px; padding-bottom:0px; font-size:30px; line-height:100%;}
.bootbox td {padding:0px 10px 10px 0px;}
.bootbox label {font-size:16px !important;}

table.upload {width:100%;}
table.upload td {vertical-align:middle; padding-bottom:16px;}
table.upload td:first-of-type {padding-right:10px; width:100px; white-space:nowrap;}
table.upload td:last-of-type {padding-left:10px;}
table.upload td.file_field {vertical-align:top; padding-top:5px;}
.fileinput-button {position: relative; overflow: hidden; display: inline-block;}
.fileinput-button > span {display:block; margin-top:-2px;}
.fileinput-button input {
  position: absolute; top: 0; right: 0; margin: 0; opacity: 0; -ms-filter: 'alpha(opacity=0)';
  direction: ltr; cursor: pointer;
}
@media screen\9 {  /* Fixes for IE < 8 */
  .fileinput-button input {filter: alpha(opacity=0); font-size: 100%; height: 100%;}
}
#progress {margin-top:10px; margin-bottom:10px;}
.progress-bar {text-align:left;}
.upload_message {display:inline-block; padding:0px 0px 0px 6px;}
#start_upload {display:none;}
#loading {height:20px; margin:0;}

END;
$this->template->add_css($css, 'embed');

if (empty($slug)):
?>
<h2 class="heading_font">Upload to Critical Commons</h2>
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc euismod pellentesque porta. In in dolor felis. Cras quis libero libero. Aliquam
volutpat a dui eget mattis. Integer pharetra nulla nec velit pharetra mollis. Vestibulum at pellentesque est. Nam in quam sed
turpis varius rhoncus in vitae libero.<br />
<br />
<form action="<?=trim("http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]",'/').'/upload'?>" method="get">
<div style="background-color:yellow">OAuth login fields here</div><br />
<button type="submit" class="btn btn-primary">Sign In</button>
</form><br />
<br />
<b>Forgot your Critical Commons password?</b><br />
If you have forgotten your password, we can <a href="javascript:void(null);">send you a new one</a>.<br />
<br />
<b>New user?</b><br />
If you do not have an account here, head over to the <a href="javascript:void(null);">registration form</a>.<br />
<br />
<?php
elseif ('upload'==$slug):
?>
<h2 class="heading_font">Upload to Critical Commons</h2><br />

<table class="upload">
<tr><td class="file_field">Add a video or image</td><td>
    <span class="btn btn-success fileinput-button">
        <span>Browse...</span>
        <input id="fileupload" type="file" name="files">
    </span>
    <small class="upload_message">No file selected</small>
	<!-- <div id="progress" class="progress">
        <div class="progress-bar progress-bar-success"></div>
    </div> -->
    &nbsp; &nbsp; &nbsp;
    <button type="button" class="btn btn-primary" id="start_upload">Begin Upload</button>
    &nbsp;
    <img id="loading" src="<?=base_url().'system/application/views/widgets/import/jQuery-File-Upload/img/loading.gif'?>" />
</td></tr>
</table>
<table class="upload" id="upload_form">
<tr><td>&nbsp;</td><td id="file_props"></td></tr>
<tr><td>Title</td><td><input type="text" name="title" class="form-control" /></td></tr>
<tr><td>Description</td><td><input type="text" name="description" class="form-control" /></td></tr>
<!-- <tr><td>&nbsp;</td><td><button type="button" class="btn btn-primary">Save Metadata</button></td></tr> -->
</table>

<?php
endif;
?>

