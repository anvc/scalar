<?$this->template->add_css('system/application/views/widgets/edit/content_selector.css')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.content_selector_bootstrap.js')?>

<script>
$(document).ready(function() {
	var $selector = $('<div class="selector" style="width: 100%; margin-top:-10px; padding-left:15px; padding-right:15px;"></div>').appendTo('#tabs-pages');
	var height = parseInt($(window).height()) - parseInt($selector.offset().top) - 40;  // Magic number: <body> margin 
	$selector.height(height + 'px');
	var options = {
		deleteOptions:true,
		addOptions:true,
		allowMultiple:true,
		rowSelectMethod:'highlight'
	};
	$selector.node_selection_dialogue(options);	
});
</script>