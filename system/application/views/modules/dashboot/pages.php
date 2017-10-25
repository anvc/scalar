<?$this->template->add_css('system/application/views/widgets/edit/content_selector.css')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.content_selector_bootstrap.js')?>
<?$this->template->add_css('body {margin-bottom:0;}','embed')?>
<?php 
if ($replies_not_live > 0):
	echo '<div class="alert alert-danger awaiting-comments" role="alert">You have comments awaiting moderation. <a href="javascript:void(null);" id="review-comments">Review &raquo;</a></div>'."\n";
endif;
?>
<script>
$(document).ready(function() {
	var $selector = $('<div class="selector" style="width: 100%; margin-top:-10px; padding-left:15px; padding-right:15px;"></div>').appendTo('#tabs-pages');
	var height = parseInt($(window).height()) - parseInt($selector.offset().top) - 10;
	$selector.height(height + 'px');
	node_options = {  /* global */
		fields:["visible","title","description","last_edited_by","date_edited","versions","edit"],
		deleteOptions:deleteOptions,
		addOptions:true,
		allowMultiple:true,
		rowSelectMethod:'highlight',
		isEdit:true,
		editable:["title","description"]
	};
	$selector.node_selection_dialogue(node_options);	
	$('#review-comments').click(function() {
		$('.selector .node_types select:first').val('reply');
		$('.selector .node_types button:first').click();
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