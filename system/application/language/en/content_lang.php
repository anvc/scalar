<?php
// English

$lang['scalar']       = 'Scalar';

$lang['install_name'] = (getenv('SCALAR_INSTALL_NAME') ? getenv('SCALAR_INSTALL_NAME') : 'Scalar');  // Will be displayed on the top of the book index page, e.g., could be changed to "Scalar for the Maker Lab"

$lang['book']     = 'book';
$lang['or']       = 'or';
$lang['and']      = 'and';
$lang['language'] = 'language';

$lang['login.hello']           = 'Hello';
$lang['login.sign_in']         = 'Sign in';
$lang['login.sign_out']        = 'Sign out';
$lang['login.register']        = 'register';
$lang['login.more_privileges'] = 'for additional privileges';
$lang['login.unknown_user']    = 'form.hello';
$lang['login.you_have']        = 'You have';
$lang['login.privileges']      = 'privileges';
$lang['login.back_to_book']    = 'Back to book';
$lang['login.back_to_index']   = 'Back to index';
$lang['login.manage_content']  = 'Dashboard';
$lang['login.index']  		   = 'Index';
$lang['login.guide']  		   = 'Guide';
$lang['login.confirm_sign_out'] = 'Are you sure you wish to sign out?';
$lang['login.choose_new_lang'] = 'Please choose language';
$lang['login.invalid'] 			= 'Invalid email or password';
$lang['login.is_reset'] 		= 'The password for this account has been reset.  Please see your email for reset instructions or contact an administrator.';

$lang['form.submit']          = 'Go';
$lang['form.clear']           = 'clear';
$lang['form.begin']           = 'begin';

$lang['welcome.search_book']    = "Search Books";
$lang['welcome.showing_books']  = 'Showing your books and others that have been revealed as live by their authors';
$lang['welcome.featured_books'] = 'Featured Books';
$lang['welcome.other_books']    = 'Self-published Books';

$lang['page.no_content_author'] = 'Content hasn\'t yet been added to this page, click Edit below to add some.';
$lang['page.no_content']        = 'Content hasn\'t yet been added to this page.';

$lang['email.forgot_password_subject'] = 'Password Reset';
$lang['email.admin_intro'] = 'You are receiving this email because you are a Scalar admin'."\n\n";
$lang['email.forgot_password_intro'] = 'You are receiving this email because you provided your email address in Scalar\'s forgot password form.  Please follow the link below to reset your password.'."\n\n".'The link may be broken due to a line break, in which case please cut-and-paste the full URL into your browser window.'."\n\n";
$lang['email.forgot_password_outro'] = 'Thank you!'."\n\n".'The Scalar Team';

$lang['email.new_comment_subject'] = 'New Comment for "%s"';
$lang['email.new_comment_intro'] = 'A new comment has been submitted to the book "%s":';
$lang['email.new_comment_outro'] = 'The comment is already live, but you can manage it by logging in to your book below and visiting the Dashboard\'s Comments tab:';
$lang['email.new_comment_outro_moderated'] = '<b>The comment isn\'t live yet.</b> To moderate, log in to your book below and visit the Dashboard\'s Comments tab:';
$lang['email.new_comment_footer'] = 'Thank you!'."\n\n".'The Scalar Team';

//EOF

?>
