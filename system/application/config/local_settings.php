<?php
/**
 * @projectDescription	Application config for Scalar installations
*/

// SALT, any string you want as long as it is complicated
$config['shasalt'] = '';

// ReCAPTCHA key (leave blank for no ReCAPTCHA)
$config['recaptcha_public_key'] = '';
$config['recaptcha_private_key'] = '';

// Register key (leave blank if no register key required, e.g., array())
$config['register_key'] = array();

// Soundcloud key
$config['soundcloud_key'] = '';

// Custom message for the book index page (leave blank for no message)				   
$config['index_msg'] = '';

// Redlisted domains that won't let themselves be included in expernal.php's iframe
$config['iframe_redlist'] = array('youtube.com'); 

// Default style theme (for newly created books)
$config['default_stylesheet'] = 'minimal';

// Number of history records per user
$config['user_history_max_records'] = 20; 

// Emails
$config['email_replyto_address'] = ''; 
$config['email_replyto_name'] = '';
$config['email_send_live_books_to_admins'] = true;
					   
?>