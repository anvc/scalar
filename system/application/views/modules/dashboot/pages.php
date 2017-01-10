<?$this->template->add_css('system/application/views/widgets/edit/content_selector.css')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.content_selector_bootstrap.js')?>
<?$this->template->add_css('body {margin-bottom:0;}','embed')?>

<script>
$(document).ready(function() {
	var $selector = $('<div class="selector" style="width: 100%; margin-top:-10px; padding-left:15px; padding-right:15px;"></div>').appendTo('#tabs-pages');
	var height = parseInt($(window).height()) - parseInt($selector.offset().top) - 10;
	$selector.height(height + 'px');
	var options = {
		fields:["visible","title","description","last_edited_by","date","versions","edit"],
		deleteOptions:true,
		addOptions:true,
		allowMultiple:true,
		rowSelectMethod:'highlight'
	};
	$selector.node_selection_dialogue(options);	
});
</script>