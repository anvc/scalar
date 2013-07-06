<h4>Admin Tools</h4>
<form action="<?=confirm_slash(base_url())?>system/dashboard#tabs-tools" method="post">
<input type="hidden" name="zone" value="tools" />
<input type="hidden" name="action" value="get_email_list" />
Generate email list:&nbsp; <input type="submit" value="Generate" />&nbsp; <a href="?zone=tools#tabs-tools">clear</a>
<span style="float:right;">Please cut-and-paste into the "Bcc" (rather than "Cc") field to protect anonymity</span>
<textarea class="textarea_list"><?php 
	if (!isset($email_list)) {
		
	} elseif (empty($email_list)) {
		echo 'No email addresses could be found';
	} else {
		echo implode(", ", $email_list);
	}
?></textarea>
</form>