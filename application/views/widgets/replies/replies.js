/**
 * Scalar
 * Copyright 2013 The Alliance for Networking Visual Culture.
 * http://scalar.usc.edu/scalar
 * Alliance4NVC@gmail.com
 *
 * Licensed under the Educational Community License, Version 2.0
 * (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.osedu.org/licenses /ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

/**
 * @projectDescription  Handle the display of the comment box
 * @abstract			This is a simple port from Scalar2 -- to keep things simple this is a set of functions rather than a plugin
 * @author              Craig Dietrich
 * @version             1.1
 */

function commentFormDisplayForm() {
	// Display comment box and scroll to its top
	document.location.hash = 'comments';
	var $comments = $('#comments')
	$comments.fadeIn('fast');
	window.scrollTo(0,parseInt($comments.offset().top));
	// Close button
	$('#comments #close_link').on('click', function() {
		document.location.hash='';
		$('#comments').hide();
	});
	// Check whether a user is logged in or not, and change the UI accordingly
	var parent = $('link#parent').attr('href');
	var check_login_url = parent+'login_status';
	$.post(check_login_url, function(data) {
		$('#checking_logged_in_status').hide();
		if (data.is_logged_in) {
			if ('undefined'==data.user_id || !data.user_id) return alert('Could not determine your user ID. Please try logging in again.');
			$('#comment_user_id').val(data.user_id);
			$commenter_logged_in = $('#commenter_logged_in');
			$commenter_logged_in.fadeIn('fast');
			$commenter_logged_in.find('[title="Your user page"]').attr('href', parent+'users/'+data.user_id).html(data.fullname);
			$commenter_logged_in.find('[title="Logout"]').on('click', function() {
				var url = document.location.href;
				if (url.indexOf('#')!=-1) url = url.substr(0, url.indexOf('#'));
				var url_append = 'action=do_logout&redirect_url='+encodeURIComponent(url+'#comments');
				if (url.indexOf('?')!=-1) {
					url += '&'+url_append;
				} else {
					url += '?'+url_append;
				}
				document.location.href=url;
				return false;
			});
			$('#comment_your_name').hide();
			$('#comment_captcha').hide();
		} else {
			$('#commenter_anonymous').fadeIn('fast');
			$('#comment_your_name').show();
			$('#comment_captcha').show();
			var recaptcha2_site_key = $('input[name="recaptcha2_site_key"]:first').val();
			var recaptcha_public_key = $('input[name="recaptcha_public_key"]:first').val();
			if ('undefined'==typeof(grecaptcha) && 'undefined'==typeof(Recaptcha)) {
				alert('There was a problem contacting ReCAPTCHA to create CAPTCHA test.  Please reload the page and try again.')
			} else if (!recaptcha2_site_key.length && !recaptcha_public_key.length) {
				alert('No ReCAPTCHA key is provided, therefore anonymous commenting is disabled.');
			} else {
				if (recaptcha2_site_key.length) {
			        grecaptcha.render("comment_captcha_wrapper", {
			            'sitekey' : recaptcha2_site_key
			          });
				} else if (recaptcha_public_key.length) {
					Recaptcha.create(recaptcha_public_key, "comment_captcha_wrapper", { theme: "white" });
				}
			}
		}
		$('#comment_form_wrapper').fadeIn('fast');
	});
}
function popoutComments() {
	var title = strip_tags($('#comments .comments .content_title:first').html());
	var content = $('#comments .comments').html();
	var $content = $('<div>'+content+'</div>');
	$content.find('#comment_contribute').replaceWith('<p><!-- disabled --></p>');
	content = $content.html();
	popoutContent(title, content);
	document.location.hash='';
	$('#comments').fadeOut();

}
function commentCheckPermalink(the_link) {
	var $link = $(the_link);
	if ('undefined'!=typeof(window.opener) && window.opener) {
		var url = $link.attr('href');
		window.opener.location.href = url;
		return false;
	}
	return true;
}
function ajaxComment() {
	var parent = $('link#parent').attr('href');
	var the_form = document.getElementById('comment_contribute_form');
	var post = {};
	post['action'] = 'do_save';
	for (var j = 0; j < the_form.elements.length; j++) {
		var $el = $(the_form.elements[j]);
		var field = $el.attr('name');
		var value = $el.val();
		if ('type'==field) continue;
		if ('submit'==$el.attr('type')) continue;
		post[field] = value;
	}
	// Redirect URL
	var redirect_url = document.location.href;
	if (redirect_url.indexOf('?')!=-1) redirect_url = redirect_url.substr(0, redirect_url.indexOf('?'));
	if (redirect_url.indexOf('#')!=-1) redirect_url = redirect_url.substr(0, redirect_url.indexOf('#'));
	redirect_url=redirect_url+'?action=comment_saved';
	// Save through page refresh
	$.ajax({
		url: parent+'save_anonymous_comment',
		data: post,
		type: 'POST',
		dataType: 'json',
		success: function(data) {
			if (data['error'].length) {
				alert('There was an error saving comment: '+data['error']);
				return;
			} else {
				if (data['moderated']) redirect_url += '&moderated=1';
				document.location.href= redirect_url + '#comments';
				return;
			}
		}
	});
	return false;
}
function popoutContent(title, content) {   // help from http://www.javascripter.net/faq/writingt.htm
	var basesheet = $('link[href*="content.css"]').attr('href');
	var stylesheet = $('link[href*="minimal.css"], link[href*="denim.css"], link[href*="slate.css"]').attr('href');
	var jquery = $('script[src*="jquery-3.4.1.min.js"]').attr('src');
	var repliesjs = $('script[src*="replies.js"]').attr('src');
 	consoleRef=window.open('','myconsole',
  		'width=600,height=600'
   		+',menubar=0'
   		+',toolbar=0'
   		+',status=0'
   		+',scrollbars=1'
   		+',resizable=1'
	);
	var stylesheet_str = (stylesheet && stylesheet.length) ? '<link href="'+stylesheet+'" rel="stylesheet" type="text/css" />' : '';
 	consoleRef.document.writeln(
  		'<html lang="en"><head><title>'+title+'</title>'
  		+'<link href="'+basesheet+'" rel="stylesheet" type="text/css" />'
  		+stylesheet_str
		+'<script src="'+jquery+'"></'+'s'+'cript>'
		+'<script src="'+repliesjs+'"></'+'s'+'cript>'
  		+'</head>'
   		+'<body bgcolor=white style="margin:30px;" onLoad="self.focus();">'
   		+content
   		+'</body></html>'
 	);
 	consoleRef.document.close();
 	consoleRef.focus();
}
