<?
if (!defined('BASEPATH')) exit('No direct script access allowed');
if (isset($_REQUEST['redirect_url'])) {
	$CI =& get_instance();
	$CI->redirect_url($_REQUEST['redirect_url']);
}
$this->template->add_meta('viewport','width=device-width');
$this->template->add_css('application/views/arbors/admin/admin.css');
$this->template->add_js('application/views/arbors/admin/jquery-3.4.1.min.js');
?>
<script src="https://code.jquery.com/jquery-migrate-3.1.0.js"></script>
<?$this->template->add_js('application/views/arbors/admin/admin.js')?>
<div class="system_wrapper">
<div class="content">
<div class="login_wrapper">
<? if (!empty($login_error)): ?>
<div class="error"><?=$login_error?></div>
<? endif ?>
	<form action="<?=confirm_slash(base_url())?>main/authenticator" method="post" class="panel">
		<input type="hidden" name="action" value="do_authenticator" />
		<table class="form_fields">
			<tr>
				<td class="login_header" colspan="2">
					<img src="<?=base_url('application/views/modules/login/scalar_logo.png')?>" alt="Scalar logo" width="75" height="68" />
					<h4>Please enter Google Authenticator code</h4>
				</td>
			</tr>
			<tr>
				<td class="field">Code</td><td class="value"><input type="text" name="code" value="" class="input_text" autofocus /></td>
			</tr>
			<tr>
				<td class="field">&nbsp;</td><td class="value">
					<label><input type="checkbox" name="trust_browser" value="1" style="position:relative;top:2px;" /> Trust this browser</label>
				</td>
			</tr>
			<tr>
				<td></td>
				<td class="form_buttons">
					<input type="submit" class="generic_button large default" value="Submit" />
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
