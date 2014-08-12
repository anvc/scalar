<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_meta('viewport','width=device-width');?>
<?
$registration_key = '';
if (isset($_GET['key'])) $registration_key = trim($_GET['key']);
if (isset($_POST['registration_key'])) $registration_key = trim($_POST['registration_key']);
?>
<div class="register_wrapper">
<? if (!empty($error)): ?>
<div class="error"><?=$error?></div>
<? endif ?>
	<form action="<?=confirm_slash(base_url())?>system/register" method="post" class="panel">
		<input type="hidden" name="action" value="do_register" />
		<input type="hidden" name="redirect_url" value="<?=@htmlspecialchars($_REQUEST['redirect_url'])?>" />
		<table class="form_fields">
			<tr>
				<td class="login_header" colspan="2">
					<img src="application/views/modules/login/scalar_logo.png" alt="scalar_logo" width="75" height="68" />
					<h4>Please register a new account below</h4>
				</td>
			</tr>
			<tr>
				<td class="field">Email <span style="color:red;">*</span> <a class="question_answer" alt="Your email address is your login to Scalar, though no communication between your email provider and Scalar will occur."></a></td><td class="value"><input type="text" name="email" value="<?=(isset($_POST['email']))?trim($_POST['email']):''?>" class="input_text" /></td>
			</tr>
			<tr>
				<td class="field">Full name <span style="color:red;">*</span></td><td class="value"><input type="text" name="fullname" value="<?=(isset($_POST['fullname']))?trim($_POST['fullname']):''?>" class="input_text" /></td>
			</tr>		
			<? if ($register_key): ?>
			<tr>
				<td class="field">Registration<br />key <span style="color:red;">*</span> <a class="question_answer" alt="Scalar is presently in a 'closed alpha' release and requires a registration key to create a new account.  Please contact the Scalar team to acquire a registration key.  For more information please visit the <a href='http://scalar.usc.edu/anvc'>ANVC Scalar website</a>."></a></td><td class="value"><input type="text" name="registration_key" value="<?=$registration_key?>" class="input_text input_hl" /></td>
			</tr>	
			<? endif ?>		
			<tr>
				<td class="field">Password <span style="color:red;">*</span></td><td class="value"><input type="password" name="password" class="input_text" autocomplete="off" /></td>
			</tr>
			<tr>
				<td class="field">Confirm<br />password <span style="color:red;">*</span></td><td class="value"><input type="password" name="password_2" class="input_text" autocomplete="off" /></td>
			</tr>			
			<tr>
				<td class="field">Terms of Service <span style="color:red;">*</span></td><td class="value"><input type="checkbox" name="tos" value="1" id="tos" /><label for="tos"> I have found, read and accepted the <a href="http://scalar.usc.edu/terms-of-service/" target="_blank">Terms of Service</a></label></td>
			</tr>			
			<tr>
				<td class="field">Title of<br />new book<br /><small>(optional)</small><a class="question_answer" alt="Create a new Scalar book by entering its title below (for temporary titles, you can use your full name).  If you're registering to access an existing book, just leave this field blank."></a></td><td class="value"><input type="text" name="book_title" value="<?=(isset($_POST['book_title']))?trim($_POST['book_title']):''?>" class="input_text" /></td>
			</tr>	
			<? if (!empty($recaptcha_public_key)): ?>	
			<tr>
				<td>CAPTCHA <span style="color:red;">*</span> <a class="question_answer" alt="This CAPTCHA combats spam by asking you to decifer natural language questions"></a></td>
				<td>
				<?  $this->config->item('force_https') ? print(recaptcha_get_html($recaptcha_public_key, '', true)) : print(recaptcha_get_html($recaptcha_public_key));?>
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