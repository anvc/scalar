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

;(function( $, window, document, undefined ) {

	var pluginName = "scalarcomments",
		defaults = {
			root_url: ''
		};

	/**
	 * Manages the comments dialog.
	 */
	function ScalarComments( element, options ) {

		this.element = $(element);
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this.quickStart = false;

		this.firstRun = true;

		this.init();

	}

	ScalarComments.prototype.bodyContent = null;	// body content container
	ScalarComments.prototype.results = null;		// results container
	ScalarComments.prototype.userReply = null;		// user reply container
	ScalarComments.prototype.firstRun = null;		// is this the first run of the plug-in?
	ScalarComments.prototype.tabIndex = null;		// tracks element tab indexes
	ScalarComments.prototype.quickStart = null;		// true if the dialog is just being loaded to show an alert

	ScalarComments.prototype.init = function () {

		var node, container,
			me = this;

		this.element.addClass('comments');

		var $modal = $('<div><div class="results"></div></div>').bootstrapModal({
			title: 'Comments',
			size_class: 'modal-lg'
		}).appendTo(this.element);

		this.bodyContent = this.element.find('.modal-body');
		this.results = this.element.find('.results');
		this.modal = this.element.find('.modal');

		var queryVars = scalarapi.getQueryVars( document.location.href );
		if ( queryVars.action == 'comment_saved' ) {
			this.bodyContent.prepend( '<div class="alert alert-success heading_font"><span class="heading_weight">Your comment has been saved and is now awaiting moderation.</span> Thank you for your contribution!</div>' )
		}

		this.modal.on('shown.bs.modal', function() { me.firstFocus() });

		this.modal.find('.close').onTab(function() { me.firstFocus() });


	}

	ScalarComments.prototype.firstFocus = function() {
		if ( this.bodyContent.find( '.comment' ).length > 0 ) {
			this.bodyContent.find('.comment:eq(0) h3 a').focus();
		} else {
			this.bodyContent.find( 'p:visible > a:eq(0)' ).focus();
		}
	}

	ScalarComments.prototype.showComments = function( qs ) {
		this.quickStart = qs;
		this.getComments();
		this.modal.modal('show');
	}

	ScalarComments.prototype.hideComments = function() {
		this.modal.modal('hide');
	}

	ScalarComments.prototype.getComments = function() {

		var me = this;

		this.results.empty();
		scalarapi.loadPage(currentNode.slug, true, function() {
			me.handleComments();
		}, null, 1, false, 'reply');

	}

	ScalarComments.prototype.handleComments = function() {

		var relation, node,
			relations = currentNode.getRelations('comment', 'incoming', 'reverseindex');
			
		this.tabIndex = 100;

		for (var i in relations) {
			relation = relations[i];
			container = $('<div class="comment"></div>').appendTo(this.results);
			var date = new Date(relation.properties.datetime);
			container.append('<h3 class="heading_font heading_weight"><a tabindex="'+(++this.tabIndex)+'" href="'+relation.body.url+'">'+relation.body.getDisplayTitle()+'</a></h3><div>'+relation.body.current.content+'</div><div class="attribution caption_font">Posted on '+date.toLocaleString()+'</div>');
		}

		if (relations.length > 0) {
			this.results.append('<hr>');
		}

		if ( this.firstRun && !this.quickStart ) {
			this.setupCommentForm();
			this.firstRun = false;
		}
		this.firstFocus();

		var me = this;
		this.bodyContent.find('.comment:eq(0) h3 a').onTabBack(function() {
			me.modal.find('.close').focus();
		});

	}

	ScalarComments.prototype.updateTabIndexForReCaptcha = function() {
		var ti = parseInt( $( '.comment_form' ).find( "input[class='input_text']" ).attr( 'tabindex' ) );
		$( '#comment_captcha' ).find( 'input' ).each( function() {
			$( this ).attr( 'tabindex', ++ti );
		} );
		$( '#comment_captcha' ).find( 'a' ).each( function() {
			$( this ).attr( 'tabindex', ++ti );
			if ( $( this ).attr( 'href' ) == null ) {
				$( this ).attr( 'href', 'javascript:;' );
			}
		} );
		$( '.comment_form' ).find( "input[type='submit']" ).attr( 'tabindex', ++ti );
	}
	
	ScalarComments.prototype.setupCommentForm = function() {
	
		var me = this;

		this.userReply = $('<div class="comment_form"></div>').appendTo(this.bodyContent);
		this.userReply.append('<h3 class="heading_font heading_weight">Add your voice</h3>');
		this.userReply.append('<p id="checking_logged_in_status">Checking your signed in status…</p>');
		this.userReply.append('<p id="commenter_logged_in" style="display:none;">You are signed in as <a tabindex="'+(++this.tabIndex)+'" title="Your user page" href=""></a> (<a tabindex="'+(++this.tabIndex)+'" href="javascript:void(null);" title="Logout">Sign out</a>).<br />Enter your comment below. Submissions are moderated. Please be respectful.</p>');
		this.userReply.append('<p id="commenter_anonymous" style="display:none;">To comment, enter your name and text below (you can also <a tabindex="'+(++this.tabIndex)+'" href="'+addTemplateToURL(system_uri+'/login?redirect_url='+encodeURIComponent(currentNode.url), 'cantaloupe')+'">sign in</a> to use your Scalar account).<br />Comments are moderated. Please be respectful.</p>');

		var commentFormWrapper = $('<div id="comment_form_wrapper" style="display:none;">').appendTo(this.userReply);
		var commentForm = $('<form id="comment_contribute_form" method="post" action="'+currentNode.url+'" onsubmit="ajaxComment();return false;">').appendTo(commentFormWrapper);
		commentForm.append('<input type="hidden" name="action" value="ADD" />');
		commentForm.append('<input type="hidden" name="scalar:child_urn" value="'+currentNode.current.urn+'" />');
		commentForm.append('<input type="hidden" name="dcterms:description" value="" />');
		commentForm.append('<input type="hidden" name="user" value="0" id="comment_user_id" />');
		commentForm.append('<input type="hidden" name="recaptcha_public_key" value="'+$('link#recaptcha_public_key').attr('href')+'" />');
		commentForm.append('<table summary="Comment form" class="form_fields comment_form_table"><tbody><tr id="comment_your_name"><td class="field"><label for="fullname_field">Your name</label></td><td class="value"><input id="fullname_field" autocomplete="off" tabindex="'+(++this.tabIndex)+'" type="text" name="fullname" value="" class="input_text"></td></tr><tr><td class="field"><label for="title_field">Comment title</label></td><td class="value"><input id="title_field" autocomplete="off" tabindex="'+(++this.tabIndex)+'" type="text" name="dcterms:title" value="" class="input_text"></td></tr><tr><td class="field"><label for="comment_field">Content</label><br /><small style="color:#222222;"></small></td><td class="value"><textarea id="comment_field" tabindex="'+(++this.tabIndex)+'" name="sioc:content" value="" rows="6" class="input_text"></textarea></td></tr><tr id="comment_captcha"><td class="field"></td><td class="value" id="comment_captcha_wrapper"></td></tr><tr><td></td><td class="form_buttons" colspan="4"><input type="submit" class="generic_button large" value="Submit comment" /></td></tr></tbody></table>');

		// Check whether a user is logged in or not, and change the UI accordingly
		var parent = scalarapi.model.parent_uri;
		var check_login_url = parent+'login_status';
		$.post(check_login_url, function(data) {
			$('#checking_logged_in_status').hide();
			if (data.is_logged_in) {
				if ('undefined'==data.user_id || !data.user_id) return alert('Could not determine your user ID. Please try logging in again.');
				$('#comment_user_id').val(data.user_id);
				$commenter_logged_in = $('#commenter_logged_in');
				$commenter_logged_in.fadeIn('fast');
				$commenter_logged_in.find('[title="Your user page"]').attr('href', 'javascript:;').html(data.fullname);
				$commenter_logged_in.find('[title="Logout"]').click(function() {
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
				$( '.comment_form' ).find( "input[type='submit']" ).attr( 'tabindex', ++me.tabIndex );
				
				// handle tab back on first link
				$( '#commenter_logged_in' ).find( 'a:eq(0)' ).onTabBack(function() {
				
					// tab back to close button if no comments are visible
					if ( me.bodyContent.find('.comment:eq(0) h3 a').length == 0 ) {
						me.modal.find('.close').focus();
						
					// otherwise tab back to the last comment
					} else {
						me.bodyContent.find('.comment:last h3 a').focus();
					}
				});
				
			} else {
				$('#commenter_anonymous').fadeIn('fast');
				$('#comment_your_name').show();
				$('#comment_captcha').show();
				var recaptcha_public_key = $('input[name="recaptcha_public_key"]:first').val();
				if ('undefined'==typeof(Recaptcha)) {
					alert('There was a problem contacting ReCAPTCHA to create CAPTCHA test.  Please reload the page and try again.')
				} else if (!recaptcha_public_key.length) {
					alert('No ReCAPTCHA key is provided, therefore anonymous commenting is disabled.');
				} else {
					Recaptcha.create(recaptcha_public_key, "comment_captcha_wrapper", { theme: "white", tabindex: ++me.tabIndex });
					setTimeout( me.updateTabIndexForReCaptcha, 500 );
				}
				
				// handle tab back on first link
				$( '#commenter_anonymous' ).find( 'a:eq(0)' ).onTabBack(function() {
				
					// tab back to close button if no comments are visible
					if ( me.bodyContent.find('.comment:eq(0) h3 a').length == 0 ) {
						me.modal.find('.close').focus();
						
					// otherwise tab back to the last comment
					} else {
						me.bodyContent.find('.comment:last h3 a').focus();
					}
				});
			}
			$('#comment_form_wrapper').fadeIn('fast');
		});

	}

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if ( !$.data(this, "plugin_" + pluginName )) {
                $.data( this, "plugin_" + pluginName,
                new ScalarComments( this, options ));
            }
        });
    }

})( jQuery, window, document );