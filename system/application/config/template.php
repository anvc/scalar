<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');
/*
|--------------------------------------------------------------------------
| Selectable templates
|--------------------------------------------------------------------------
|
| Templates that can be chosen as the default for a Scalar project.
|
*/
$template['selectable_templates'] = array('honeydew','cantaloupe');

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
$template['active_template'] = 'honeydew';

/*
|--------------------------------------------------------------------------
| Default Template Configuration (adjust this or create your own)
|--------------------------------------------------------------------------
*/

// Admin wrapper including book index page, login, and manage content area
$template['admin']['template'] = 'arbors/admin/wrapper';
$template['admin']['regions'] = array('cover', 'content', 'footer');

// Blank wrapper for outputting XML, JSON, or single widgets, etc
$template['blank']['template'] = 'arbors/blank/wrapper';
$template['blank']['regions'] = array('content');

// External wrapper for loading external pages in an iframe
$template['external']['template'] = 'arbors/external/wrapper';
$template['blank']['regions'] = array('content');

// Scalar's first wrapper (2010-2012)
$template['honeydew']['template'] = 'arbors/honeydew/wrapper';
$template['honeydew']['regions'] = array('cover', 'content', 'footer', 'nav');

// Scalar's second wrapper (2012-)
$template['cantaloupe']['template'] = 'arbors/cantaloupe/wrapper';
$template['cantaloupe']['regions'] = array('vis', 'content');

/* End of file template.php */
/* Location: ./system/application/config/template.php */