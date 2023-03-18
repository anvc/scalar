<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_meta('viewport','width=device-width');?>
<?$this->template->add_css('application/views/arbors/admin/admin.css')?>
<div class="system_wrapper">
<div class="content">
<div class="login_wrapper">
	<form action="<?=confirm_slash(base_url())?>" method="get" class="panel">
		<div class="login_header">
			<img src="<?=base_url('application/views/modules/login/scalar_logo.png')?>" alt="Scalar logo" width="75" height="68" />
			<h4 class="generic_notice no_border">You are attempting to access a Scalar book that you do not have permissions to view.</h4>
		</div>
		<div class="center_text">
			<input type="submit" class="generic_button large" value="Return to index" /><br />
		</div>
		<div class="center_text">
			<a href="<?=confirm_slash(base_url())?>system/login<?=((isset($_REQUEST['redirect_url']))?'?redirect_url='.urlencode($_REQUEST['redirect_url']):'')?>">Login with another account</a>
		</div>
	</form>
</div>
<br clear="both" />
</div>
</div>
