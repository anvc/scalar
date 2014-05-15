<?php
/**
 * @projectDescription	Application config for Scalar installations
*/

// Default melon (Scalar skin), must have a corresponding folder in system/application/views/mellons/ 
$config['active_melon'] = 'honeydew';

// Default book index module (note that the index can be rerouted completely in /.htaccess)
$config['active_book_list'] = 'book_list';

// Default cover module 
$config['active_cover'] = 'cover';

// SALT, any string you want as long as it is complicated
$config['shasalt'] = '';

// chmod permissions when the system creates directories or places uploaded files (e.g., 0775)
$config['chmod_mode'] = 0775;

// ReCAPTCHA key (leave blank for no ReCAPTCHA)
$config['recaptcha_public_key'] = '';
$config['recaptcha_private_key'] = '';

// Register key (leave blank if no register key required, e.g., array())
$config['register_key'] = array();

// Soundcloud key
$config['soundcloud_id'] = '';

// Digital Public Library of America key
$config['dpla_key'] = '';

// Flowplayer key
$config['flowplayer_key'] = '';

// Google Maps key
$config['google_maps_key'] = '';

// Custom message for the book index page (leave blank for no message)				   
$config['index_msg'] = '';

// Custom message displayed inside a book. Will remain hidden after user closes the popup for the first time.
$config['book_msg'] = '';
$config['book_msg_cookie_name'] = 'ci_hide_scalar_book_msg';

// If true, keep self-published books on the book index page hidden under a tab
$config['index_hide_published'] = true;

// Redlisted domains that won't let themselves be included in expernal.php's iframe
$config['iframe_redlist'] = array('youtube.com'); 

// Default style theme (for newly created books)
$config['default_stylesheet'] = 'minimal';

// Number of history records per user
$config['user_history_max_records'] = 20; 

// Emails
$config['email_replyto_address'] = 'usc.vectors@gmail.com'; 
$config['email_replyto_name'] = 'Vectors Journal';
$config['email_send_live_books_to_admins'] = true;
					   
?>