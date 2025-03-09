$(document).ready(function() {

	var $wrapper = $('#wrapper');
	
	// Pre-load fields
	var source = getURLParameter('source_url');
	if (source && 'null'!=source && source.length) {
		$('.source_url').val(source);
	}
	var dest = getURLParameter('dest_url');
	if (dest && 'null'!=dest && dest.length) {
		$('.dest_url').val(dest);
	}	
	var email = getURLParameter('dest_id');
	if (email && 'null'!=email && email.length) {
		$('.dest_id').val(email);
	}	
	
	// File upload -- http://www.abeautifulsite.net/whipping-file-inputs-into-shape-with-bootstrap-3
	$(document).on('change', '.btn-file :file', function() {
		var input = $(this), numFiles = input.get(0).files ? input.get(0).files.length : 1, label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		input.trigger('fileselect', [numFiles, label]);
	});
	$('.btn-file :file').on('fileselect', function(event, numFiles, label) {
		var input = $(this).parents('.input-group').find(':text'), log = numFiles > 1 ? numFiles + ' files selected' : label;
		if ( input.length ) input.val(log);
	});
	
	// Commit user input
	var commit = function() {
		if ('undefined'==typeof(commit.active)) commit.active = 0;
		commit.active++;
		if (commit.active<2) return;
		$commitform = $('#commitform');
		$source_rdf = $commitform.find('#source_rdf');
		$source_rdf.val('Loading (this may take some time depending on the size of the source book) ...');
		$modal = $commitform.closest('.modal');
		$modal.find('.book_title').html($commitform.find('#dest_title').val());
		$modal.modal('show');
		$modal.find('button').attr('disabled', 'disabled');
		$modal.find('button.cancel').unbind("click");
		$modal.find('button.cancel').click(function() {
			$modal.modal('hide');
			commit.active = 0;
		});
		$modal.find('button[type="submit"]').unbind("click");
		$modal.find('button[type="submit"]').click(function() {
			$modal.find('button[type="submit"]').attr('disabled', 'disabled');
			$source_url = $commitform.find('#source_url').val();
			$dest_id = $commitform.find('#dest_id').val();
			$dest_urn = $commitform.find('#dest_urn').val();
			$dest_url = $commitform.find('#dest_url').val().replace(/\/$/, "");
			$modal.rdfimporter({rdf:$commitform.data('rdf'),source_url:$source_url,dest_urn:$dest_urn,dest_id:$dest_id,dest_url:$dest_url,check_for_existing_pages:true}, function() {
				var $this = $modal.find('button[type="submit"]');
				$this.removeAttr('disabled');
				$this.button('finished');
				$this.unbind('click');
				$this.click(function() {
					$this.unbind('click');
					$this.button('reset');
					$modal.find('#content_progress, #relations_progress').css('width', '0%').find('span').text('');
					$modal.modal('hide');
				});
				$('#urlform button[type="submit"], #rdfform button[type="submit"], #fileform button[type="submit"]').hide().prev().show().find('a').click(function() {
					$('#urlform button[type="submit"], #rdfform button[type="submit"], #fileform button[type="submit"]').show().prev().hide();
					$('.source_msg, .dest_msg').empty().parent().hide();
				});				
				commit.active = 0;
			});
		});
		if ($commitform.data('rdf')) {
			$source_rdf.val(JSON.stringify($commitform.data('rdf'), null, 1));
			commit.active = 0;
			$modal.find('button').removeAttr('disabled');
		} else {
			$.fn.rdfimporter('rdf', {url:$commitform.find('#source_url').val()}, function(obj) {
				if ('undefined'!=typeof(obj.err)) {
					var err = (obj.err.length) ? obj.err : 'Could not retrieve source RDF-JSON.  Please try again.';
					$source_rdf.val(err);
					return;
				}
				$source_rdf.val(JSON.stringify(obj.rdf, null, 1));
				$commitform.data('rdf', obj.rdf);
				commit.active = 0;
				$modal.find('button').removeAttr('disabled');
			});
		}
	}

	// Validate user input from url form
	$('#urlform').submit(function() {
		commit.active = 0;
		var $form = $(this);
		var $commitform = $('#commitform');
		$commitform.removeData('rdf');
		var $source_msg = $form.find('.source_msg');
		var $dest_msg = $form.find('.dest_msg');
		var source_url = $form.find('.source_url').val();
		var dest_url = $form.find('.dest_url').val();
		var dest_id = $form.find('.dest_id').val();
		// Validate source book URL
		$source_msg.html('Loading source book data ...').parent().removeClass('alert-danger').addClass('alert-success').fadeIn();
		$.fn.rdfimporter('book_rdf', {url:source_url}, function(obj) {
			if ('undefined'!=typeof(obj.err)) {
				var err = (obj.err.length) ? obj.err : 'Either the URL is incorrect or the book isn\'t public';
				$source_msg.html('<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> '+err).parent().removeClass('alert-success').addClass('alert-danger');
				return;
			}
			source_url = obj.uri;  // This ensures that the URL is to the book regardless of whether the user inputted a page in that book
			var title = $.fn.rdfimporter('rdf_value',{rdf:obj.rdf,p:'http://purl.org/dc/terms/title'});
			var urn = $.fn.rdfimporter('rdf_value',{rdf:obj.rdf,p:'http://scalar.usc.edu/2012/01/scalar-ns#urn'});		
			$source_msg.html('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> Source book <b title="'+urn+'">'+title+'</b> checks out.');
			$commitform.find('#source_url').val(source_url);
			commit();
		});
		// Validate destination book URL then check logged in status
		$dest_msg.html('Checking destination book and login status ...').parent().removeClass('alert-danger').addClass('alert-success').fadeIn();
		$.fn.rdfimporter('book_rdf', {url:dest_url}, function(obj) {
			if ('undefined'!=typeof(obj.err)) {
				var err = (obj.err.length) ? obj.err : 'Either the URL is incorrect or the book isn\'t public.';
				$dest_msg.html('<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> '+err).parent().removeClass('alert-success').addClass('alert-danger');;
				return;
			}
			dest_url = obj.uri;  // This ensures that the URL is to the book regardless of whether the user inputted a page in that book
			$.fn.rdfimporter('perms', {url:dest_url}, function(status) {
				if (!status.is_logged_in) {
					$dest_msg.html('<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> '+dest_id+' isn\'t logged in to the destination book.').parent().removeClass('alert-success').addClass('alert-danger');;
					return;				
				} else if (!status.is_author) {
					$dest_msg.html('<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> '+dest_id+' isn\'t an author of the destination book.').parent().removeClass('alert-success').addClass('alert-danger');;
					return;					
				}
				var title = $.fn.rdfimporter('rdf_value',{rdf:obj.rdf,p:'http://purl.org/dc/terms/title'});
				var urn = $.fn.rdfimporter('rdf_value',{rdf:obj.rdf,p:'http://scalar.usc.edu/2012/01/scalar-ns#urn'});
				$dest_msg.html('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> Destination book <b title="'+urn+'">'+title+'</b> checks out.');
				$commitform.find('#dest_url').val(dest_url);
				$commitform.find('#dest_urn').val(urn);
				$commitform.find('#dest_id').val($form.find('.dest_id').val());
				$commitform.find('#dest_title').val(title);
				commit();				
			});
		});				
		return false;
	});

	// Validate user input from rdf form
	$('#rdfform').submit(function() {
		commit.active = 0;
		var $form = $(this);
		var $commitform = $('#commitform');
		$commitform.removeData('rdf');
		var $source_msg = $form.find('.source_msg');
		var $dest_msg = $form.find('.dest_msg');
		var source_rdf = $form.find('.source_rdf').val();
		var dest_url = $form.find('.dest_url').val();
		var dest_id = $form.find('.dest_id').val();
		// Check the source RDF string
		$source_msg.html('Validating source ...').parent().removeClass('alert-danger').addClass('alert-success').fadeIn();
		$.fn.rdfimporter('rdf', {rdf:source_rdf}, function(obj) {
			if ('undefined'!=typeof(obj.err)) {
				var err = (obj.err.length) ? obj.err : 'Invalid source';
				$source_msg.html('<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> '+err).parent().removeClass('alert-success').addClass('alert-danger');;
				return;
			}			
			$source_msg.html('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> Source checks out');
			$commitform.find('#source_url').val( $.fn.rdfimporter('source_url_from_rdf_fields', obj.rdf) );
			$commitform.data('rdf', obj.rdf);
			commit();
		});
		// Validate destination book URL then check logged in status
		$dest_msg.html('Checking destination book login status ...').parent().removeClass('alert-danger').addClass('alert-success').fadeIn();
		$.fn.rdfimporter('book_rdf', {url:dest_url}, function(obj) {
			if ('undefined'!=typeof(obj.err)) {
				var err = (obj.err.length) ? obj.err : 'Either the URL is incorrect or the book isn\'t public.';
				$dest_msg.html('<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> '+err).parent().removeClass('alert-success').addClass('alert-danger');;
				return;
			}
			dest_url = obj.uri;  // This ensures that the URL is to the book regardless of whether the user inputted a page in that book
			$.fn.rdfimporter('perms', {url:dest_url}, function(status) {
				if (!status.is_logged_in) {
					$dest_msg.html('<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> '+dest_id+' isn\'t logged in to the destination book.').parent().removeClass('alert-success').addClass('alert-danger');;
					return;				
				} else if (!status.is_author) {
					$dest_msg.html('<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> '+dest_id+' isn\'t an author of the destination book.').parent().removeClass('alert-success').addClass('alert-danger');;
					return;					
				}			
				var title = $.fn.rdfimporter('rdf_value',{rdf:obj.rdf,p:'http://purl.org/dc/terms/title'});
				var urn = $.fn.rdfimporter('rdf_value',{rdf:obj.rdf,p:'http://scalar.usc.edu/2012/01/scalar-ns#urn'});
				$dest_msg.html('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> Destination book <b title="'+urn+'">'+title+'</b> checks out.');
				$commitform.find('#dest_url').val(dest_url);
				$commitform.find('#dest_urn').val(urn);
				$commitform.find('#dest_id').val($form.find('.dest_id').val());
				$commitform.find('#dest_title').val(title);
				commit();
			});
		});						
		return false;
	});	
	
	// Validate user input from file upload form
	$('#fileform').submit(function() {
		commit.active = 0;
		var $form = $(this);
		var $commitform = $('#commitform');
		$commitform.removeData('rdf');
		var $source_msg = $form.find('.source_msg');
		var $dest_msg = $form.find('.dest_msg');
		var dest_url = $form.find('.dest_url').val();
		var dest_id = $form.find('.dest_id').val();
		var source_file_obj = document.getElementById('fileUpload');
		// Checking file and validating
		$source_msg.html('Reading &amp; validating source RDF or CSV ...').parent().removeClass('alert-danger').addClass('alert-success').fadeIn();
		$.fn.rdfimporter('rdf', {file:source_file_obj}, function(obj) {
			if ('undefined'!=typeof(obj.err)) {
				var err = (obj.err.length) ? obj.err : 'Invalid RDF-JSON or CSV';
				$source_msg.html('<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> '+err).parent().removeClass('alert-success').addClass('alert-danger');
				return;
			}			
			$source_msg.html('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> Valid RDF-JSON or CSV');
			$commitform.find('#source_url').val( $.fn.rdfimporter('source_url_from_rdf_fields', obj.rdf) );
			$commitform.data('rdf', obj.rdf);
			commit();
		});
		// Validate destination book URL then check logged in status
		$dest_msg.html('Checking destination book login status ...').parent().removeClass('alert-danger').addClass('alert-success').fadeIn();
		$.fn.rdfimporter('book_rdf', {url:dest_url}, function(obj) {
			if ('undefined'!=typeof(obj.err)) {
				var err = (obj.err.length) ? obj.err : 'Either the URL is incorrect or the book isn\'t public.';
				$dest_msg.html('<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> '+err).parent().removeClass('alert-success').addClass('alert-danger');
				return;
			}
			dest_url = obj.uri;  // This ensures that the URL is to the book regardless of whether the user inputted a page in that book
			$.fn.rdfimporter('perms', {url:dest_url}, function(status) {
				if (!status.is_logged_in) {
					$dest_msg.html('<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> '+dest_id+' isn\'t logged in to the destination book.').parent().removeClass('alert-success').addClass('alert-danger');;
					return;				
				} else if (!status.is_author) {
					$dest_msg.html('<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> '+dest_id+' isn\'t an author of the destination book.').parent().removeClass('alert-success').addClass('alert-danger');;
					return;					
				}			
				var title = $.fn.rdfimporter('rdf_value',{rdf:obj.rdf,p:'http://purl.org/dc/terms/title'});
				var urn = $.fn.rdfimporter('rdf_value',{rdf:obj.rdf,p:'http://scalar.usc.edu/2012/01/scalar-ns#urn'});
				$dest_msg.html('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> Destination book <b title="'+urn+'">'+title+'</b> checks out.');
				$commitform.find('#dest_url').val(dest_url);
				$commitform.find('#dest_urn').val(urn);
				$commitform.find('#dest_id').val($form.find('.dest_id').val());
				$commitform.find('#dest_title').val(title);
				commit();
			});
		});						
		return false;
	});		
	
});

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}