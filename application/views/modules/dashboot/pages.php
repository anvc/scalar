<?
if (empty($book)) {
	header('Location: '.$this->base_url.'?zone=user');
	exit;
}
?>
<?$this->template->add_css('application/views/widgets/edit/content_selector.css')?>
<?$this->template->add_js('application/views/widgets/edit/jquery.content_selector_bootstrap.js')?>
<?$this->template->add_css('body {margin-bottom:0;} #currentEditionViewText{padding-bottom: 2rem;float: left;width: 100%;}','embed')?>
<?php
if ($replies_not_live > 0):
	echo '<div class="alert alert-danger awaiting-comments" role="alert">You have comments awaiting moderation. <a href="javascript:void(null);" id="review-comments">Review &raquo;</a></div>'."\n";
endif;
?>
<script>
function getCookie(cname) {  // https://www.w3schools.com/js/js_cookies.asp
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
$(document).ready(function() {
	<?php
	if(!empty($book->editions)){ ?>
		var editions = {
			<?php
				if (!empty($book->editions)) {
					for ($j = count($book->editions)-1; $j >= 0; $j--) {
						echo '"'.$j.'": "'.$book->editions[$j]['title'].'",';
					}
				}
			?>
		};
		var currentEdition = 'Latest Edits';
		if(navigator.cookieEnabled && '' !== getCookie(editionCookieName())){
			currentEdition = editions[getCookie(editionCookieName())];
		}

		var $currentEditionViewText = $('<h4 id="currentEditionViewText" class="container">Currently viewing content from the "<strong>'+currentEdition+'</strong>" edition.</h4>').appendTo('#tabs-pages');
	<?php } ?>

	var $selector = $('<div class="selector" style="width: 100%; margin-top:-10px; padding-left:15px; padding-right:15px;"></div>').appendTo('#tabs-pages');
	var height = parseInt($(window).height()) - parseInt($selector.offset().top) - 10;
	$selector.height(height + 'px');
	node_options = {  /* global */
		fields:["thumbnail","visible","title","description","last_edited_by","date_edited","versions","edit"],
		deleteOptions:deleteOptions,
		addOptions:true,
		allowMultiple:true,
		rowSelectMethod:'highlight',
		isEdit:true,
		editable:["title","description"],
		startEditTrigger:'.editLink'
	};
	<?php
		if($editorial_is_on && $can_editorial){
	?>
		node_options['fields'].unshift('editorial_state_border');
		node_options['useEditorialRules'] = true;
		node_options['userType'] = '<?echo($user_level_as_defined);?>'.toLowerCase();
	<?php
		}
	?>
	$selector.node_selection_dialogue(node_options);
	$('#review-comments').on('click', function() {
		$('.selector .node_types select:first').val('reply').trigger('change');
	});
});
function deleteOptions($content) {
	if ('undefined'==typeof(book_id) || book_id == 0) {
		alert('Please select a book');
		return;
	};
	var content_ids = [];
	$content.each(function() {
		var item = $(this).data('item');
		var content_urn = item.content['http://scalar.usc.edu/2012/01/scalar-ns#urn'][0].value;
		var content_id = content_urn.substr(content_urn.lastIndexOf(':')+1);
		content_ids.push(content_id);
	});
	if (!confirm('Are you sure you wish to DELETE '+content_ids.length+' item'+((content_ids.length>1)?'s':'')+'? Deleting content from the Dashboard can not be undone.')) {
		return;
	};
	var data = {};
	data.action = 'delete_content';
	data.book_id = book_id;
	data.content_ids = content_ids.join(',');
	data.version_ids = [];
	$('.selector .botton_options_box button:nth-child(2)').prop('disabled','disabled');
	$.post('api/delete_content', data, function(data) {
		$('.selector .botton_options_box button:nth-child(2)').removeProp('disabled');
		var $selector = $('.selector');
		$selector.find('.node_selector').remove();
		// TODO: preserve correct filter
		$selector.html('<h5 class="loading">Loading...</h5>').node_selection_dialogue(node_options);
	});
};
</script>
