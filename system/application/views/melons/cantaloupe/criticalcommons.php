<?php
$this->template->add_js('system/application/views/widgets/spinner/spin.min.js');
$css = <<<END

.ci-template-html {font-family:Georgia,Times,serif !important;}
h2 {margin-top:0; padding-top:0; margin-left:0; padding-left:7.2rem !important; margin-right:0; padding-right:7.2rem !important;}
p {padding-left:7.2rem; padding-right:7.2rem;}
#creating {margin-top:-10px; margin-bottom:30px; display:none;}
#spinner {display:inline-block; margin:0px 24px 0px 12px;}
#spinner > div {top:-7px !important;}
#cc {margin:0; padding:0; border:0; width:100%;}
END;
$this->template->add_css($css, 'embed');
?>
<span property="sioc:content">
<div class="ci-template-html import-page">
<h2 class="heading_font">Critical Commons Media Uploader</h2>
<p>This tool allows you to upload media to <a href="http://criticalcommons.org">Critical Commons</a> and then import it automatically into Scalar. You may need to log in to your Critical Commons account first; once logged in, a form will appear below which you can use to upload your media.</p>
<hr/>
<h3 id="creating" class="alert alert-warning"><div id="spinner"></div>Creating Scalar pages for your uploaded media and commentary ...</h3>
<iframe id="cc" src="http://www.criticalcommons.org/scpublisher?prev=<? echo base_url().$book->slug; ?>/criticalcommons/result"></iframe>
<hr/>
</div>
</span>
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
		setTimeout(function() {
			window.scrollTo(0,0);
		}, 500);
        $.ajax({  // Requires CORS header on Critical Commons page
            url: redirect_to,
            dataType: 'text',
            type: 'GET',
            async: true,
            statusCode: {
                404: function(response) {
                    console.log('404');
                },
                200: function(data) {
                	parse_html_page(data, redirect_to, filename);
                }
            },
            error: function(jqXHR, status, errorThrown) {
                console.log('There was an error:');
                console.log(jqXHR);
            }
        });
	});
};
window.parse_html_page = function(data, page_url, filename) {
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
	obj.is_image = false;
	if ($clip.find('#video-core > div > img').length) obj.is_image = true;
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
	obj.contributor = $content.find('span:first em:first a:first').text().trim();
	var $temp = $('<div></div>');
	$temp.append( $($content.find('span:first').html()) );
	obj.commentary.content = $temp.find('p:nth-of-type(2)').html().trim();

	// Thumbnail and media URLs
	var arr = page_url.split('/');
	obj.username = arr[4];
	obj.slug = arr[6];
	obj.thumbnail = 'http://www.criticalcommons.org/Members/'+obj.username+'/clips/'+obj.slug+'/thumbnailImage';
	obj.source_url = 'http://www.criticalcommons.org/Members/'+obj.username+'/clips/'+obj.slug+'/view';
	if (obj.is_image) {
		obj.filename = filename;
		obj.url = 'http://www.criticalcommons.org/Members/'+obj.username+'/clips/'+obj.slug+'/@@download/video_file/'+obj.filename;
	} else {
		obj.filename = filename;
		obj.encoded_filename = obj.filename.trim().toLowerCase().replace(/\W+/g, "-");  // Best guess for how FFmpeg encodes filenames
		obj.url = 'http://videos.criticalcommons.org/transcoded/http/www.criticalcommons.org/Members/'+obj.username+'/clips/'+obj.slug+'/video_file/mp4-high/'+obj.encoded_filename+'.mp4';
	};

	create_media_page(obj);
};
window.create_media_page = function(obj) {
	var data = {
		'action' : 'ADD',
		'native' : 1,
		'id' : '',
		'api_key' : '',
		'rdf:type' : 'http://scalar.usc.edu/2012/01/scalar-ns#Media',
		'scalar:child_urn' : 'urn:scalar:book:'+$('link#book_id').attr('href'),
		'scalar:child_type' : 'http://scalar.usc.edu/2012/01/scalar-ns#Book',
		'scalar:child_rel' : 'page',
		'sioc:content' : '',
		'scalar:url' : obj.url,
		'dcterms:title' : obj.title,
		'dcterms:description' : obj.description,
		'dcterms:source' : 'Critical Commons',
		'dcterms:format' : obj.format,
		'dcterms:language' : obj.language,
		'dcterms:contributor' : obj.contributor,
		'scalar:thumbnail' : obj.thumbnail,
		'dcterms:accrualMethod' : 'Critical Commons Inline Importer',
		'art:sourceLocation' : obj.source_url
	};
	scalarapi.savePage(data, function(returnObj) {
		for (var url in returnObj) break;
		var media_urn = returnObj[url]['http://scalar.usc.edu/2012/01/scalar-ns#urn'][0].value;
		var media_slug = url.substr(0, url.lastIndexOf('.'));
		media_slug = media_slug.substr(media_slug.lastIndexOf('/')+1);
		create_page(obj, media_urn, media_slug);
	}, function(error) {
		console.log(error);
		alert('Something went wrong trying to save the media-page: '+error);
	});
};
window.create_page = function(obj, media_urn, media_slug) {
	obj.content = '<a name="scalar-inline-media" data-size="medium" data-align="left" data-caption="title-and-description" data-annotations="" class="inline wrap" href="'+obj.url+'" resource="'+media_slug+'"></a>';
	obj.content += obj.commentary.content;
	var data = {
			'action' : 'ADD',
			'native' : 1,
			'id' : '',
			'api_key' : '',
			'rdf:type' : 'http://scalar.usc.edu/2012/01/scalar-ns#Composite',
			'scalar:child_urn' : 'urn:scalar:book:'+$('link#book_id').attr('href'),
			'scalar:child_type' : 'http://scalar.usc.edu/2012/01/scalar-ns#Book',
			'scalar:child_rel' : 'page',
			'sioc:content' : obj.content,
			'dcterms:title' : obj.commentary.title,
	};
	scalarapi.savePage(data, function(returnObj) {
		for (var url in returnObj) break;
		var urn = returnObj[url]['http://scalar.usc.edu/2012/01/scalar-ns#urn'][0].value;
		var url = url.substr(0, url.lastIndexOf('.'));
		create_relationship(urn, media_urn, url);
	}, function(error) {
		console.log(error);
		alert('Something went wrong trying to save the commentary page: '+error);
	});
};
window.create_relationship = function(urn, media_urn, url) {
	var data = {
			'action' : 'RELATE',
			'native' : 1,
			'id' : '',
			'api_key' : '',
			'rdf:type' : 'http://scalar.usc.edu/2012/01/scalar-ns#Composite',
			'scalar:urn' : urn,
			'scalar:child_urn' : media_urn,
			'scalar:child_rel' : 'referenced',
			'scalar:reference_text' : ''
	};
	scalarapi.saveRelate(data, function(returnObj) {
		document.location.href = url;
	}, function(error) {
		console.log(error);
		alert('Something went wrong attempting to establish the referenced relationship: '+error);
	});
};
$(document).ready(function() {
	$cc = $('#cc');
	var height = 1100;  // The static height of the CC page
	$cc.height(height);
});
</script>
