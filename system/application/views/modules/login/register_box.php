<?
if (!defined('BASEPATH')) exit('No direct script access allowed');
if (isset($_REQUEST['redirect_url'])) {
	$CI =& get_instance();
	$CI->redirect_url($_REQUEST['redirect_url']);
}
$this->template->add_meta('viewport','width=device-width');
$this->template->add_css('system/application/views/arbors/admin/admin.css');
$this->template->add_js('system/application/views/arbors/admin/jquery-3.4.1.min.js');
$this->template->add_js("\nvar strong_password_enabled=".$this->config->item('strong_password')."\n", 'embed');
?>
<script src="https://code.jquery.com/jquery-migrate-3.1.0.js"></script>
<?$this->template->add_js('system/application/views/arbors/admin/admin.js')?>
<script>
$(document).ready(function() {
	$('input[name="password"]').on('keyup', function() {
	    if (!strong_password_enabled) return;
		var passwd = $(this).val();
		var $bar = $('.strong_password_bar');
		var reservedWords = [];
		if ($('input[name="fullname"]').val().length) reservedWords = reservedWords.concat($('input[name="fullname"]').val().split(' '));
		if ($('input[name="email"]').val().length) reservedWords = reservedWords.concat($('input[name="email"]').val().split('@'));
		var msg = '';
		if (passwd.length < 16) {
			msg = 'Password must be at least 16 characters long';
		}
		for (var j = 0; j < reservedWords.length; j++) {
			if (passwd.toLowerCase().indexOf(reservedWords[j].toLowerCase()) != -1) msg = 'Password cannot contain elements of name or email';
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
<?
$registration_key = '';
if (isset($_GET['key'])) $registration_key = trim(htmlspecialchars($_GET['key']));
if (isset($_POST['registration_key'])) $registration_key = trim(htmlspecialchars($_POST['registration_key']));
?>
<div class="register_wrapper">
<? if (!empty($error)): ?>
<div class="error"><?=$error?></div>
<? endif ?>
	<form action="<?=confirm_slash(base_url())?>system/register" method="post" class="panel">
		<input type="hidden" name="action" value="do_register" />
		<table class="form_fields">
			<tr>
				<td class="login_header" colspan="2">
					<img src="application/views/modules/login/scalar_logo.png" alt="Scalar logo" width="75" height="68" />
					<h4>Please register a new account below</h4>
				</td>
			</tr>
			<tr>
				<td class="field">Email <span style="color:red;">*</span> <a class="question_answer" alt="Your email address is your login to Scalar, though no communication between your email provider and Scalar will occur."></a></td><td class="value"><input type="text" name="email" value="<?=(isset($_POST['email']))?trim(htmlspecialchars($_POST['email'])):''?>" class="input_text" /></td>
			</tr>
			<tr>
				<td class="field">Full name <span style="color:red;">*</span></td><td class="value"><input type="text" name="fullname" value="<?=(isset($_POST['fullname']))?trim(htmlspecialchars($_POST['fullname'])):''?>" class="input_text" /></td>
			</tr>
			<? if ($register_key): ?>
			<tr>
				<td class="field">Registration<br />key <span style="color:red;">*</span></td><td class="value"><input type="text" name="registration_key" value="<?=$registration_key?>" class="input_text" />
			<?
			   $reg_msg = $this->config->item('registration_key_msg');
			   if (!empty($reg_msg)):
			     echo '<div class="register_msg">'.$reg_msg.'</div>'."\n";
			   endif;
			?>
				</td>
			</tr>
			<? endif ?>
			<tr>
				<td class="field">
					Password <span style="color:red;">*</span></td><td class="value"><input type="password" name="password" class="input_text" autocomplete="off" /><br />
					<span class="strong_password_bar">&nbsp;</span>
				</td>
			</tr>
			<tr>
				<td class="field">Confirm<br />password <span style="color:red;">*</span></td><td class="value"><input type="password" name="password_2" class="input_text" autocomplete="off" /></td>
			</tr>
			<tr>
				<td class="field">Terms of Service <span style="color:red;">*</span></td><td class="value"><input type="checkbox" name="tos" value="1" id="tos" /><label for="tos"> I have found, read and accepted the <a href="http://scalar.usc.edu/terms-of-service/" target="_blank">Terms of Service</a></label></td>
			</tr>
			<!-- <tr>
				<td class="field">Title of<br />first book<br /><small>(optional)</small></td><td class="value"><input type="text" name="book_title" value="<?=(isset($_POST['book_title']))?trim(htmlspecialchars($_POST['book_title'])):''?>" class="input_text" /></td>
			</tr> -->
			<? if (!empty($recaptcha2_site_key)): ?>
			<tr>
				<td>CAPTCHA <span style="color:red;">*</span></td>
				<td>
		            <div class="g-recaptcha" data-sitekey="<?php echo $recaptcha2_site_key; ?>"></div>
		            <script type="text/javascript"
		                    src="https://www.google.com/recaptcha/api.js?hl=<?php echo 'en'; ?>">
		            </script>
	            </td>
	        </tr>
			<? elseif (!empty($recaptcha_public_key)): ?>
			<tr>
				<td>CAPTCHA <span style="color:red;">*</span></td>
				<td>
				<?  print(recaptcha_get_html($recaptcha_public_key, '', $this->config->item('is_https'))); ?>
				</td>
			</tr>
			<? endif ?>
			<tr>
				<td></td>
				<td class="form_buttons">
					<input type="submit" class="generic_button large default" value="Register" />
				</td>
			</tr>
		</table>
	</form>
	<small><a href="<?=base_url()?>">Return to index</a> | <a href="http://scalar.usc.edu/terms-of-service/" target="_blank">Terms of Service</a></small>
</div>
<br clear="both" />
</div>
</div>
