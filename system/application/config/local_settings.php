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

// Default dashboard ("dashboard", "dashboot") ... setting to "dashboard" will keep the current dashboard but will add an "opt-in" link to dashboot
$config['active_dashboard'] = 'dashboard';

// SALT, any string you want as long as it is complicated
$config['shasalt'] = (getenv('SCALAR_SHASALT') ? getenv('SCALAR_SHASALT') : '');

// Default storage to use for uploaded files. 
// File system storage is the default.
$config['storage_adapter'] = 'Scalar_Storage_Adapter_Filesystem';
$config['storage_adapter_options'] = array(
    'fileMode' => 0664,   // file permissions for uploads (default: 0664)
    'dirMode'  => 0775,   // directory permissions for uploads (default: 0775)
    'localDir' => '',     // path to directory on local filesystem for uploads (default: FCPATH)
);
//$config['storage_adapter'] = 'Scalar_Storage_Adapter_S3';
//$config['storage_adapter_options'] = array(
//    'awsAccessKey' => (getenv('SCALAR_AWS_ACCESS_KEY_ID') ? getenv('SCALAR_AWS_ACCESS_KEY_ID') : ''),
//    'awsSecretKey' => (getenv('SCALAR_AWS_SECRET_ACCESS_KEY') ? getenv('SCALAR_AWS_SECRET_ACCESS_KEY') : ''),
//    'bucket'       => (getenv('SCALAR_S3_BUCKET') ? getenv('SCALAR_S3_BUCKET') : ''),
//    'hostname'     => (getenv('SCALAR_S3_HOSTNAME') ? getenv('SCALAR_S3_HOSTNAME') : ''),
//    'forceSSL'     => (bool) (getenv('SCALAR_S3_FORCE_SSL') ? getenv('SCALAR_S3_FORCE_SSL') : ''),
//);

// ReCAPTCHA key (leave blank for no ReCAPTCHA)
$config['recaptcha_public_key'] = (getenv('SCALAR_RECAPTCHA_PUBLIC_KEY') ? getenv('SCALAR_RECAPTCHA_PUBLIC_KEY') : '');
$config['recaptcha_private_key'] = (getenv('SCALAR_RECAPTCHA_PRIVATE_KEY') ? getenv('SCALAR_RECAPTCHA_PRIVATE_KEY') : '');

// ReCAPTCHA version 2 key (leave blank for no ReCAPTCHA version 2)
$config['recaptcha2_site_key'] = (getenv('SCALAR_RECAPTCHA2_SITE_KEY') ? getenv('SCALAR_RECAPTCHA2_SITE_KEY') : '');
$config['recaptcha2_secret_key'] = (getenv('SCALAR_RECAPTCHA2_SECRET_KEY') ? getenv('SCALAR_RECAPTCHA2_SECRET_KEY') : '');

// Register key (leave blank if no register key required, e.g., array())
// One of the strings placed in this array will be required in order for new users to register
$config['register_key'] = array();

// Max login attempts (e.g., 10) and the penalty wait time in seconds (e.g., 120)
$config['max_login_attempts'] = 6;
$config['max_login_attempts_penalty_seconds'] = 120;

// To enable two-factor authentication (using the Google Authenticator), enter a salt string here
// The string needs to be a 'base32' string 'without equals signs at the end' or the QR barcode will not work
$config['google_authenticator_salt'] = '';

// Enable stronger-password verification (min 16 characters, can't use previous passwords)
$config['strong_password'] = false;

// If 'strong_password' is enabled, number of days until the user is requested to reset their password (e.g., 60)
$config['strong_password_days_to_reset'] = 60;

// Soundcloud key
$config['soundcloud_id'] = (getenv('SCALAR_SOUNDCLOUD_ID') ? getenv('SCALAR_SOUNDCLOUD_ID') : '');

// Google Maps key
$config['google_maps_key'] = (getenv('SCALAR_GOOGLE_MAPS_KEY') ? getenv('SCALAR_GOOGLE_MAPS_KEY') : '');

// YouTube Data API key
$config['youtube_data_key'] = (getenv('SCALAR_YOUTUBE_DATA_KEY') ? getenv('SCALAR_YOUTUBE_DATA_KEY') : '');

// Flowplayer key
$config['flowplayer_key'] = (getenv('SCALAR_FLOWPLAYER_KEY') ? getenv('SCALAR_FLOWPLAYER_KEY') : '');

// Digital Public Library of America key
$config['dpla_key'] = (getenv('SCALAR_DPLA_KEY') ? getenv('SCALAR_DPLA_KEY') : '');

// New York Public Library key
$config['nypl_key'] = (getenv('SCALAR_NYPL_KEY') ? getenv('SCALAR_NYPL_KEY') : '');

// Custom message for the book index page (leave blank for no message)		   
$config['index_msg'] = '';

// Custom message displayed inside a book. Will remain hidden after user closes the popup for the first time.
$config['book_msg'] = '';
$config['book_msg_cookie_name'] = 'ci_hide_scalar_book_msg';

// Custom message displayed beneath the registration key field on the register page
$config['registration_key_msg'] = '';    

// LDAP authentication settings
$config['use_ldap'] = (getenv('SCALAR_USE_LDAP') ? getenv('SCALAR_USE_LDAP') : false);  // Default: off
$config['ldap_server'] = (getenv('SCALAR_LDAP_SERVER') ? getenv('SCALAR_LDAP_SERVER') : "ldap://ldap.server.name");  // Use 'ldap://' prefix even if connecting to ldaps
$config['ldap_port'] = (getenv('SCALAR_LDAP_PORT') ? getenv('SCALAR_LDAP_PORT') : 389);
$config['ldap_basedn'] = (getenv('SCALAR_LDAP_BASEDN') ? getenv('SCALAR_LDAP_BASEDN') : "dc=organization,dc=tld");
$config['ldap_uname_field'] = (getenv('SCALAR_LDAP_UNAME_FIELD') ? getenv('SCALAR_LDAP_UNAME_FIELD') : "uid");  // Default 'uid', For AD use 'sAMAccountName'
$config['ldap_filter'] = (getenv('SCALAR_LDAP_FILTER') ? getenv('SCALAR_LDAP_FILTER') : '');

// Active Directory LDAP settings
$config['use_ad_ldap'] = (getenv('SCALAR_USE_AD_LDAP') ? getenv('SCALAR_USE_AD_LDAP') : false);  // Default: off
$config['ad_bind_user'] = (getenv('SCALAR_AD_BIND_USER') ? getenv('SCALAR_AD_BIND_USER') : "");  // Use LDAP Distinguished Name
$config['ad_bind_pass'] = (getenv('SCALAR_AD_BIND_PASS') ? getenv('SCALAR_AD_BIND_PASS') : "");
   // explicity enable/disable ldap referrals. Expects 1 or 0. If not set, defaults to previous behavior, which is:
   // if AD is active, turn referrals OFF, otherwise, don't set the value
if( getenv('SCALAR_SET_LDAP_REFERRALS') )
	$config['set_ldap_referrals'] = getenv('SCALAR_SET_LDAP_REFERRALS');
else
	$config['set_ldap_referrals'] = ($config['use_ad_ldap']) ? 0 : null;	

// Emails
$config['email_replyto_address'] = (getenv('SCALAR_EMAIL_REPLYTO_ADDRESS') ? getenv('SCALAR_EMAIL_REPLYTO_ADDRESS') : ''); 
$config['email_replyto_name'] = (getenv('SCALAR_EMAIL_REPLYTO_NAME') ? getenv('SCALAR_EMAIL_REPLYTO_NAME') : '');
$config['email_from_address'] = (getenv('SCALAR_EMAIL_FROM_ADDRESS') ? getenv('SCALAR_EMAIL_FROM_ADDRESS') : '');

// SMTP (leave smtp_host field empty to use phpmailer instead). If using Gmail, you may need to enable access in security settings.
$config['smtp_host'] = (getenv('SCALAR_SMTP_HOST') ? getenv('SCALAR_SMTP_HOST') : ''); 
$config['smtp_auth'] = true; 
$config['smtp_username'] = (getenv('SCALAR_SMTP_USERNAME') ? getenv('SCALAR_SMTP_USERNAME') : '');    
$config['smtp_password'] = (getenv('SCALAR_SMTP_PASSWORD') ? getenv('SCALAR_SMTP_PASSWORD') : '');     
$config['smtp_secure'] = 'ssl';   // 'ssl' or 'tls'       
$config['smtp_port'] = 465; 

// Whether to activate the self-published books feature on the book index page
$config['index_render_published'] = true;

// If true, keep self-published books on the book index page hidden under a tab
$config['index_hide_published'] = true;

// Redlisted domains that won't let themselves be included in expernal.php's iframe
$config['iframe_redlist'] = array('youtube.com', 'vimeo.com', 'google.com', 'microsoft.com', 'metmuseum.org', 'bloomberg.com', 'nytimes.com', 'nationalreview.com', 'theguardian.com', 'twitter.com'); 

// If true, external hyperlinks will go directly to the external page rather than attempt to be rendered in Scalar's external.php
$config['external_direct_hyperlink'] = false;

// Default style theme (for newly created books)
$config['default_stylesheet'] = 'minimal';

// Number of history records per user
$config['user_history_max_records'] = 20; 

// On the Edit page the first tab, Layout, is the default opened tab; this will allow an override to another tab per book
$config['override_edit_page_default_tab'] = array(
  'book_0' => array(  // replace 0 with the book's ID
    'composite' => '#metadata-pane',  // text pages
    'media' => '#metadata-pane'  // media pages
  )
);

// Load local_settings_custom.php, if it exists, to allow overrides via a separate file.
if (file_exists(dirname(__FILE__).'/local_settings_custom.php')) { include 'local_settings_custom.php'; }

//EOF

?>
