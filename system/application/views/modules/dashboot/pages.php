<?$this->template->add_css('system/application/views/widgets/edit/content_selector.css')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.content_selector_bootstrap.js')?>
<?$this->template->add_css('body {margin-bottom:0;}','embed')?>

<div class="alert alert-danger awaiting-comments" role="alert">You have comments awaiting moderation. <a href="javascript:void(null);" id="review-comments">Review &raquo;</a></div>

<script>
$(document).ready(function() {
	var $selector = $('<div class="selector" style="width: 100%; margin-top:-10px; padding-left:15px; padding-right:15px;"></div>').appendTo('#tabs-pages');
	var height = parseInt($(window).height()) - parseInt($selector.offset().top) - 10;
	$selector.height(height + 'px');
	var options = {
		fields:["visible","title","description","last_edited_by","date_edited","versions","edit"],
		deleteOptions:true,
		addOptions:true,
		allowMultiple:true,
		rowSelectMethod:'highlight',
		isEdit:true,
		editable:["title","description"]
	};
	$selector.node_selection_dialogue(options);	
	$('#review-comments').click(function() {
		$('.selector .node_types select:first').val('reply');
		$('.selector .node_types button:first').click();
	});
});
</script>