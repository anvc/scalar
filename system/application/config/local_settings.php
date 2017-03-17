<?php
/**
 * @projectDescription	Application config for Scalar installations
*/

// Default melon (Scalar skin), must have a corresponding folder in system/application/views/melons/ 
$config['active_melon'] = 'cantaloupe';

// Default book index module (note that the index can be rerouted completely in /.htaccess)
$config['active_book_list'] = 'book_list';

// Default cover module 
$config['active_cover'] = 'cover';

// SALT, any string you want as long as it is complicated
$config['shasalt'] = (getenv('SCALAR_SHASALT') ? getenv('SCALAR_SHASALT') : '');

// chmod permissions when the system creates directories or places uploaded files (e.g., 0775)
$config['chmod_mode'] = 0775;

// ReCAPTCHA key (leave blank for no ReCAPTCHA)
$config['recaptcha_public_key'] = (getenv('SCALAR_RECAPTCHA_PUBLIC_KEY') ? getenv('SCALAR_RECAPTCHA_PUBLIC_KEY') : '');
$config['recaptcha_private_key'] = (getenv('SCALAR_RECAPTCHA_PRIVATE_KEY') ? getenv('SCALAR_RECAPTCHA_PRIVATE_KEY') : '');

// ReCAPTCHA version 2 key (leave blank for no ReCAPTCHA version 2)
$config['recaptcha2_site_key'] = (getenv('SCALAR_RECAPTCHA2_SITE_KEY') ? getenv('SCALAR_RECAPTCHA2_SITE_KEY') : '');
$config['recaptcha2_secret_key'] = (getenv('SCALAR_RECAPTCHA2_SECRET_KEY') ? getenv('SCALAR_RECAPTCHA2_SECRET_KEY') : '');

// Register key (leave blank if no register key required, e.g., array())
// One of the strings placed in this array will be required in order for new users to register
$config['register_key'] = array();

// Soundcloud key
$config['soundcloud_id'] = (getenv('SCALAR_SOUNDCLOUD_ID') ? getenv('SCALAR_SOUNDCLOUD_ID') : '');

// Digital Public Library of America key
$config['dpla_key'] = (getenv('SCALAR_DPLA_KEY') ? getenv('SCALAR_DPLA_KEY') : '');

// Flowplayer key
$config['flowplayer_key'] = (getenv('SCALAR_FLOWPLAYER_KEY') ? getenv('SCALAR_FLOWPLAYER_KEY') : '');

// Google Maps key
$config['google_maps_key'] = (getenv('SCALAR_GOOGLE_MAPS_KEY') ? getenv('SCALAR_GOOGLE_MAPS_KEY') : '');

// New York Public Library key
$config['nypl_key'] = (getenv('SCALAR_NYPL_KEY') ? getenv('SCALAR_NYPL_KEY') : '');

// Custom message for the book index page (leave blank for no message)		   
$config['index_msg'] = '';

// Custom message displayed inside a book. Will remain hidden after user closes the popup for the first time.
$config['book_msg'] = '';
$config['book_msg_cookie_name'] = 'ci_hide_scalar_book_msg';

// LDAP authentication settings
$config['use_ldap'] = (getenv('SCALAR_USE_LDAP') ? getenv('SCALAR_USE_LDAP') : false);  // Default: off
$config['ldap_server'] = (getenv('SCALAR_LDAP_SERVER') ? getenv('SCALAR_LDAP_SERVER') : "ldap.server.name");
$config['ldap_port'] = (getenv('SCALAR_LDAP_PORT') ? getenv('SCALAR_LDAP_PORT') : 389);
$config['ldap_basedn'] = (getenv('SCALAR_LDAP_BASEDN') ? getenv('SCALAR_LDAP_BASEDN') : "dc=organization,dc=tld");
$config['ldap_uname_field'] = (getenv('SCALAR_LDAP_UNAME_FIELD') ? getenv('SCALAR_LDAP_UNAME_FIELD') : "uid");

// Emails
$config['email_replyto_address'] = (getenv('SCALAR_EMAIL_REPLYTO_ADDRESS') ? getenv('SCALAR_EMAIL_REPLYTO_ADDRESS') : ''); 
$config['email_replyto_name'] = (getenv('SCALAR_EMAIL_REPLYTO_NAME') ? getenv('SCALAR_EMAIL_REPLYTO_NAME') : '');
// SMTP (leave smtp_host field empty to use phpmailer instead). If using Gmail, you may need to enable access in security settings.
$config['smtp_host'] = (getenv('SCALAR_SMTP_HOST') ? getenv('SCALAR_SMTP_HOST') : ''); 
$config['smtp_auth'] = true; 
$config['smtp_username'] = (getenv('SCALAR_SMTP_USERNAME') ? getenv('SCALAR_SMTP_USERNAME') : '');    
$config['smtp_password'] = (getenv('SCALAR_SMTP_PASSWORD') ? getenv('SCALAR_SMTP_PASSWORD') : '');     
$config['smtp_secure'] = 'ssl';   // 'ssl' or 'tls'       
$config['smtp_port'] = 465; 

// If true, keep self-published books on the book index page hidden under a tab
$config['index_hide_published'] = true;

// Redlisted domains that won't let themselves be included in expernal.php's iframe
$config['iframe_redlist'] = array('youtube.com', 'vimeo.com', 'google.com', 'microsoft.com', 'metmuseum.org', 'bloomberg.com', 'nytimes.com', 'nationalreview.com', 'theguardian.com'); 

// Default style theme (for newly created books)
$config['default_stylesheet'] = 'minimal';

// Number of history records per user
$config['user_history_max_records'] = 20; 

//EOF

?>
