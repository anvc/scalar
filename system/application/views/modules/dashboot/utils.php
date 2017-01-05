<?$this->template->add_css('system/application/views/modules/dashboot/css/custom.jquery-ui.min.css')?>
<?$this->template->add_css('system/application/views/modules/dashboot/css/bootstrap-dialog.min.css')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/custom.jquery-ui.min.js')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/bootstrap-dialog.min.js')?>
<?$this->template->add_css('
.section {display:none;}
#import {display:block;}
', 'embed')?>

<script>
$(document).ready(function() {
	$('.nav-pills').find('li').click(function() {
		var $this = $(this);
		$this.closest('.nav').find('li').removeClass('active');
		$this.addClass('active');
		$this.closest('.row').find('.section').hide();
		$this.closest('.row').find('#'+$this.text().toLowerCase().replace(' ','-')).show();
	});
});
</script>
<div class="container-fluid properties">
  <div class="row">
    <aside class="col-xs-2">
	  <ul class="nav nav-pills nav-stacked">
	    <li class="active"><a href="javascript:void(null);">Import</a></li>
	    <li><a href="javascript:void(null);">Export</a></li>
	    <li><a href="javascript:void(null);">API Explorer</a></li>
	  </ul> 
    </aside>
    <section class="col-xs-10">
    	<div class="section" id="import" data-iframe-url="">
    		Import
    	</div>
    	<div class="section" id="export" data-iframe-url="">
    		Export
    	</div>
    	<div class="section" id="api-explorer" data-iframe-url="">
    		API Explorer
    	</div>
    </section>
  </div>
</div>