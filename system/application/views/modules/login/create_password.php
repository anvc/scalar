<?
if (!defined('BASEPATH')) exit('No direct script access allowed');
if (isset($_REQUEST['redirect_url'])) {
	$CI =& get_instance();
	$CI->redirect_url($_REQUEST['redirect_url']);
}
$this->template->add_js("\nvar strong_password_enabled=".$this->config->item('strong_password').";\n", 'embed');
$this->template->add_meta('viewport','width=device-width');
$this->template->add_css('system/application/views/arbors/admin/admin.css');
$this->template->add_js('system/application/views/arbors/admin/jquery-3.4.1.min.js');
?>
<?$this->template->add_js('system/application/views/arbors/admin/admin.js')?>
<script>
$(window).ready(function() {
	$('input[name="password_1"]').on('keyup', function() {
	    if (!strong_password_enabled) return;
		var passwd = $(this).val();
		var $bar = $('.strong_password_bar');
		var reservedWords = [];
		if ($('input[name="email"]').val().length) reservedWords = reservedWords.concat($('input[name="email"]').val().split('@'));
		var msg = '';
		if (passwd.length < 16) {
			msg = 'Password must be at least 16 characters long';
		}
		for (var j = 0; j < reservedWords.length; j++) {
			if (passwd.toLowerCase().indexOf(reservedWords[j].toLowerCase()) != -1) msg = 'Password cannot contain elements of email address';
		}
		$bar.css('display', 'inline-block');
		if (msg.length) {
			$bar.removeClass('strong_password_strong').addClass('strong_password_weak').text(msg);
		} else {
			$bar.removeClass('strong_password_weak').addClass('strong_password_strong').text('Password strength is strong');
		}
	});
});
</script>
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
		<input type="hidden" name="msg" value="<?=((isset($_REQUEST['msg']))?(int)$_REQUEST['msg']:'')?>" />
		<input type="hidden" name="key" value="<? if (isset($_REQUEST['key'])) echo htmlspecialchars($_REQUEST['key']) ?>" />
		<table class="form_fields">
			<tr>
				<td class="login_header" colspan="2">
					<img src="application/views/modules/login/scalar_logo.png" alt="Scalar logo" width="75" height="68" />
					<h4>Please enter your login email address, and set a new password below.</h4>
				</td>
			</tr>
			<tr>
				<td class="field">Email</td><td class="value"><input type="text" name="email" value="<?=(isset($_POST['email']))?htmlspecialchars(trim($_POST['email'])):''?>" class="input_text" /></td>
			</tr>
			<tr>
				<td class="field">New password</td><td class="value"><input type="password" name="password_1" value="" class="input_text" /><span class="strong_password_bar">&nbsp;</span></td>
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
