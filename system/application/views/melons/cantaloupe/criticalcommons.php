<?php
$this->template->add_js('system/application/views/melons/cantaloupe/js/bootbox.min.js');
$this->template->add_css('system/application/views/widgets/import/scalarimport.css');
$this->template->add_js('system/application/views/widgets/import/jquery.scalarimport.js');
$this->template->add_js('system/application/views/widgets/spinner/spin.min.js');
$css = <<<END

.ci-template-html {font-family:Georgia,Times,serif !important;}
h2, h3 {padding-left:92px !important; padding-right:0px !important; padding-bottom:20px;}
#creating {margin-top:-16px; display:none;}
#spinner {display:inline-block; margin:0px 24px 0px 12px;}
#spinner > div {top:-7px !important;}
#cc {margin:0; padding:0; border:0; width:100%;}
END;
$this->template->add_css($css, 'embed');
?>
<h2 class="heading_font">Critical Commons Inline Importer</h2>
<h3 id="creating" class="text-success"><div id="spinner"></div>Creating Scalar media and commentary pages ...</h3>
<iframe id="cc" src="http://www.criticalcommons.org/scpublisher?prev=<? echo base_url().$book->slug; ?>/criticalcommons/result"></iframe>
<script>
window.has_redirected = function(redirect_to, filename) {
	filename = ('undefined'!=typeof(filename) && null!==filename) ? decodeURIComponent(filename) : '';
	var $cc = $('#cc');
	$cc.prop('src', redirect_to);
	$cc.off('load').load(function() {
		$('#creating').show();
		if (window['Spinner']) {
			var opts = {
			  lines: 13, // The number of lines to draw
			  length: 5, // The length of each line
			  width: 2, // The line thickness
			  radius: 6, // The radius of the inner circle
			  rotate: 0, // The rotation offset
			  color: '#000', // #rgb or #rrggbb
			  speed: 1, // Rounds per second
			  trail: 60, // Afterglow percentage
			  shadow: false, // Whether to render a shadow
			  hwaccel: false, // Whether to use hardware acceleration
			  className: 'spinner', // The CSS class to assign to the spinner
			  zIndex: 2e9, // The z-index (defaults to 2000000000)
			  top: 'auto', // Top position relative to parent in px
			  right: 'auto' // Left position relative to parent in px
			};
			var target = document.getElementById('spinner');
			var spinner = new Spinner(opts).spin(target);
		};
		document.body.scrollTop = 0;
        $.ajax({  // Requires CORS header on Critical Commons page
            url: redirect_to,
            dataType: 'text',
            type: 'GET',
            async: true,
            /*
            xhrFields: {
         		withCredentials: true  // Requires CORS header on Critical Commons page
            },
            */
            statusCode: {
                404: function(response) {
                    console.log('404');
                },
                200: function(data) {
				      var obj = {};
					  var parser, xmlDoc;
					  parser = new DOMParser();
					  var xmlDoc = parser.parseFromString(data,"text/html");
					  // Elements from <head>
					  var head = xmlDoc.getElementsByTagName("head")[0];
					  var $head = $(head);
					  obj.description = ($head.find('meta[name="description"]').length) ? $head.find('meta[name="description"]').attr('content') : null;
					  obj.subjects = ($head.find('meta[name="keywords"]').length) ? $head.find('meta[name="keywords"]').attr('content').split(',') : [];
					  for (var j = 0; j < obj.subjects.length; j++) {
						obj.subjects[j] = obj.subjects[j].trim().toLowerCase();
					  }
					  obj.format = ($head.find('meta[name="DC.format"]').length) ? $head.find('meta[name="DC.format"]').attr('content') : null;
					  obj.type = ($head.find('meta[name="DC.type"]').length) ? $head.find('meta[name="DC.type"]').attr('content') : null;
					  obj.created = ($head.find('meta[name="DC.date.created"]').length) ? $head.find('meta[name="DC.date.created"]').attr('content') : null;
					  obj.language = ($head.find('meta[name="DC.language"]').length) ? $head.find('meta[name="DC.language"]').attr('content') : null;
					  // Elements from the clip area
					  var clip = xmlDoc.getElementById('clip-area');
					  var $clip = $(clip);
					  obj.title = $clip.find('span:first').text().replace(/\n/g, '').trim();
					  obj.thumbnail = $clip.find('#video-core img:first').attr('src');
					  $clip.find('dl:first ').children().each(function() {
						 if ($(this).is('dt')) {
							obj.source = $(this).text();
						 } else if ($(this).text().indexOf('Creator:') != -1) {
							obj.contributor = $(this).text().replace('Creator: ','');
						 } else if ($(this).text().indexOf('Distributor:') != -1) {
								obj.publisher = $(this).text().replace('Distributor: ','');
						 }
					  });
					  // Commentary
					  var content = xmlDoc.getElementById('content');
					  var $content = $(content);
					  obj.commentary = {};
					  obj.commentary.title = $content.find('span:first h4:first').text().trim();
					  var $temp = $('<div></div>');
					  $temp.append( $($content.find('span:first').html()) );
					  obj.commentary.content = $temp.find('p:nth-of-type(2)').html().trim();
					  // Thumbnail and media URLs
					  var arr = redirect_to.split('/');
					  obj.username = arr[4];
					  obj.slug = arr[6];
					  obj.thumbnail = 'http://www.criticalcommons.org/Members/'+obj.username+'/clips/'+obj.slug+'/thumbnailImage';
					  console.log('filename: '+filename);
					  obj.url = null;		  
					  console.log(obj);
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
