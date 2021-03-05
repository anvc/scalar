<?
if (!defined('BASEPATH')) exit('No direct script access allowed');
if (isset($_REQUEST['redirect_url'])) {
	$CI =& get_instance();
	$CI->redirect_url($_REQUEST['redirect_url']);
}
$this->template->add_meta('viewport','width=device-width');
$this->template->add_css('system/application/views/arbors/admin/admin.css');
$this->template->add_js('system/application/views/arbors/admin/jquery-3.4.1.min.js');
?>
<script src="https://code.jquery.com/jquery-migrate-3.1.0.js"></script>
<?$this->template->add_js('system/application/views/arbors/admin/admin.js')?>
<div class="system_wrapper">
<div class="content">
<div class="login_wrapper">
<? if (!empty($login_error)): ?>
<div class="error"><?=$login_error?></div>
<? endif ?>
<? if (isset($_REQUEST['action']) && $_REQUEST['action']=='created'): ?>
<div class="saved">Your account has been created.<br />Sign in for the first time below.</div>
<? endif ?>
<? if (isset($_REQUEST['msg']) && $_REQUEST['msg']==1): ?>
<div class="error">Please sign in to view the requested page</div>
<? endif ?>
<? if (isset($_REQUEST['msg']) && $_REQUEST['msg']==2): ?>
<div class="saved">Your password has been reset.  Please login below to continue.</div>
<? endif ?>
<? if (isset($_REQUEST['msg']) && $_REQUEST['msg']==3): ?>
<div class="error">Please sign in to edit the requested page</div>
<? endif ?>
<? if (isset($_REQUEST['msg']) && $_REQUEST['msg']==4): ?>
<div class="error">Please sign in to access pages that are restricted to book authors and editors</div>
<? endif ?>
<? if (isset($_REQUEST['msg']) && $_REQUEST['msg']==5): ?>
<div class="error">Please sign in to access a past version that is restricted to book authors and editors</div>
<? endif ?>
	<form action="<?=confirm_slash(base_url())?>system/login" method="post" class="panel">
		<input type="hidden" name="action" value="do_login" />
		<input type="hidden" name="msg" value="<?=((isset($_REQUEST['msg']))?(int)$_REQUEST['msg']:'')?>" />
		<table class="form_fields">
			<tr>
				<td class="login_header" colspan="2">
					<img src="application/views/modules/login/scalar_logo.png" alt="Scalar logo" width="75" height="68" />
					<h4>Please sign in below</h4>
				</td>
			</tr>
			<tr>
				<td class="field">Email</td><td class="value"><input type="text" name="email" value="<?=(isset($_POST['email']))?htmlspecialchars(trim($_POST['email'])):''?>" class="input_text" /></td>
			</tr>
			<tr>
				<td class="field">Password</td><td class="value"><input type="password" name="password" value="" class="input_text" autocomplete="off" /></td>
			</tr>
			<tr>
				<td></td>
				<td class="form_buttons">
					<input type="submit" class="generic_button large default" value="Login" />
					<?=str_repeat("&nbsp; ", 2)?><a href="forgot_password"><small>Forgot password?</small></a>
				</td>
			</tr>
		</table>
	</form>
	<div class="login_footer">
		<a href="<?=base_url()?>">Return to index</a> |
		<a href="http://scalar.usc.edu/terms-of-service/" target="_blank">Terms of Service</a> |
		<a href="register">Register an account</a>
	</div>
</div>
<br clear="both" />
</div>
</div>
