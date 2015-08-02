<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>

<div class="login_wrapper">
<? if (!empty($create_login_error)): ?>
<div class="error"><?=$create_login_error?></div>
<? endif ?>
<? if (@$_REQUEST['action']=='sent'): ?>
<div class="saved">An email has been sent to the address you provided, with instructions on how to continue.</div>
<? endif ?>
	<form action="<?=confirm_slash(base_url())?>system/create_password" method="post" class="panel">
		<input type="hidden" name="action" value="do_create_password" />
		<input type="hidden" name="redirect_url" value="<?=@htmlspecialchars($_REQUEST['redirect_url'])?>" />
		<input type="hidden" name="msg" value="<? echo (int) @$_REQUEST['msg'] ?>" />
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