<?php
// English

$lang['scalar']       = 'Scalar';  

$lang['install_name'] = 'Scalar';  // Will be displayed on the top of the book index page, e.g., could be changed to "Scalar for the Maker Lab"

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

$lang['email.new_comment_subject'] = $lang['install_name'] . ': New Comment on "%s"';
$lang['email.new_comment_intro'] = 'A new comment has been submitted to the book, "%s":';
$lang['email.forgot_password_outro'] = 'To moderate this new comment, please visit the Comments tab on the book\'s dashboard.'."\n\n".'Thank you.';

//@LUCAS - general book list strings for ACLS Workbench
$lang['acls.site_header'] = $lang['install_name'].' <small>Powered by <a href="http://scalar.usc.edu">Scalar</a></small>';  // Will be displayed on the top of the ACLS Workbench book index page
$lang['acls.clone_success'] = 'You  will now find your cloned book under "Your Books" on the '.$lang['install_name'].' index. Pages that you have not yet modified will still have the previous author listed as the last editor. Once you edit these pages, you will be shown as the last editor.';
$lang['acls.join_success'] = 'You are now a subscribed reader and will find your subscribed book under "Your Books" on the '.$lang['install_name'].' index. If you have specified that you would like to be an author, this request and any message you have included have also been sent to the current author or authors for review.';
$lang['acls.create_success'] = 'Your book has been created, and you are ready to customize and build content. You may find your new book under "Your Books" on the '.$lang['install_name'].' index. To begin, either click on your book\'s cover to view your intro page or click on the "edit" button to change book settings or create new pages.';

$lang['acls.join_explaination'] = '*When a user joins your book, that user will be added as a dedicated "reader," and will be unable to edit or contribute content (aside from comments) to your book. <br /> When they join, they will be presented the option to request to become an author, able to edit and contribute content. <br /> You may then choose to upgrade the user\'s permissions to "author" or keep them as a "reader". You will receive an email whenever a user chooses to join your book. <br /> It is not required to join a published book to view it.';

//@LUCAS - Added ACLS Workbench email strings; these are parsed with sprintf, so apologies for the deciphering; first parameter is a string = book title.
$lang['acls_email.request_author_role_subject'] = $lang['install_name'].': Request to Become an Author of Your Book, "%s"';
$lang['acls_email.user_joined_subject'] = $lang['install_name'].': A User has Joined  Your Book, "%s"';
$lang['acls_email.elevate_user_subject'] = $lang['install_name'].': Author Request for "%s" Approved';

?>