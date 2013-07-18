<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');
/*
|--------------------------------------------------------------------------
| Active template
|--------------------------------------------------------------------------
|
| The $template['active_template'] setting lets you choose which template 
| group to make active.  By default there is only one group (the 
| "default" group).
|
*/
$template['active_template'] = 'blank';

/*
|--------------------------------------------------------------------------
| Default Template Configuration (adjust this or create your own)
|--------------------------------------------------------------------------
*/

// Blank wrapper for outputting XML, JSON, or single widgets, etc
$template['blank']['template'] = 'arbors/blank/wrapper';
$template['blank']['regions'] = array('content');

// External wrapper for loading external pages in an iframe
$template['external']['template'] = 'arbors/external/wrapper';
$template['blank']['regions'] = array('content');

// Admin wrapper including book index page, login, and dashboard area
$template['admin']['template'] = 'arbors/admin/wrapper';
$template['admin']['regions'] = array('cover', 'content');

// Scalar's first generation wrapper (2010-2012)
$template['html']['template'] = 'arbors/html/wrapper';
$template['html']['regions'] = array('content');

// Scalar's second generation wrapper (2012-)
$template['html5_RDFa']['template'] = 'arbors/html5_RDFa/wrapper';
$template['html5_RDFa']['regions'] = array('content');

/* End of file template.php */
/* Location: ./system/application/config/template.php */