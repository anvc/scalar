<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_css('system/application/views/arbors/admin/admin.css')?>
<?$this->template->add_js('system/application/views/arbors/admin/jquery-3.4.1.min.js')?>
<script src="https://code.jquery.com/jquery-migrate-3.1.0.js"></script>
<?$this->template->add_js('system/application/views/arbors/admin/admin.js')?>
<div class="system_wrapper">
<div class="content">
<div class="login_wrapper">
<? if (!empty($create_login_error)): ?>
<div class="error"><?=$create_login_error?></div>
<? endif ?>
<? if (isset($_REQUEST['action']) && $_REQUEST['action']=='sent'): ?>
<div class="saved">An email has been sent to the address you provided, with instructions on how to continue.</div>
<? endif ?>
	<form action="<?=confirm_slash(base_url())?>system/create_password" method="post" class="panel">
		<input type="hidden" name="action" value="do_create_password" />
		<input type="hidden" name="redirect_url" value="<?=((isset($_REQUEST['redirect_url']))?htmlspecialchars($_REQUEST['redirect_url']):'')?>" />
		<input type="hidden" name="msg" value="<?=((isset($_REQUEST['msg']))?filter_var($_REQUEST['msg'],FILTER_SANITIZE_STRING):'')?>" />
		<input type="hidden" name="key" value="<? if (isset($_REQUEST['key'])) echo htmlspecialchars($_REQUEST['key']) ?>" />
		<table class="form_fields">
			<tr>
				<td class="login_header" colspan="2">
					<img src="application/views/modules/login/scalar_logo.png" alt="scalar_logo" width="75" height="68" />
					<h4>Please enter your login email address, and set a new password below.</h4>
				</td>
			</tr>
			<tr>
				<td class="field">Email</td><td class="value"><input type="text" name="email" value="<?=(isset($_POST['email']))?htmlspecialchars(trim($_POST['email'])):''?>" class="input_text" /></td>
			</tr>
			<tr>
				<td class="field">New password</td><td class="value"><input type="password" name="password_1" value="" class="input_text" /></td>
			</tr>
			<tr>
				<td class="field">Retype password</td><td class="value"><input type="password" name="password_2" value="" class="input_text" /></td>
			</tr>
			<tr>
				<td></td>
				<td class="form_buttons">
					<input type="submit" class="generic_button large default" value="Reset password" />
				</td>
			</tr>
		</table>
	</form>
	<small><a href="<?=base_url()?>">Return to index</a> | <a href="http://scalar.usc.edu/terms-of-service/" target="_blank">Terms of Service</a></small>
</div>
<br clear="both" />
</div>
</div>
