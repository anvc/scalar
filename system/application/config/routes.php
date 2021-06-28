<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
| 	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	http://codeigniter.com/user_guide/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES
| -------------------------------------------------------------------------
|
| There are two reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['scaffolding_trigger'] = 'scaffolding';
|
| This route lets you set a "secret" word that will trigger the
| scaffolding feature for added security. Note: Scaffolding must be
| enabled in the controller in which you intend to use it.   The reserved 
| routes must come before any wildcard or regular expression routes.
|
*/

$route['default_controller'] = "system";
$route['404_override'] = '';

/* Routes added by Craig */      

$route['system/(.*)'] = "system/$1";		// system/
$route['(.*)\.rdf$'] = "rdf/node/$1";		// .rdf extension   
$route['(.*)\.rdfxml$'] = "rdf/node/$1";	// .rdfxml extension
$route['(.*)\.json$'] = "rdf/node/$1";		// .json  extension
$route['(.*)\.rdfjson$'] = "rdf/node/$1";	// .rdfjson  extension
$route['(.*)\.jsonld$'] = "rdf/node/$1";	// .jsonld  extension
$route['(.*)\.oac$'] = "rdf/node/$1";		// .oac  extension
$route['^rdf$'] = "rdf/index";               // rdf/ (system)
$route['(.*)/rdf$'] = "rdf/index";           // rdf/
$route['rdf/(.*)'] = "rdf/$1";               // rdf/
$route['(.*)/rdf/(.*)'] = "rdf/$2";          // rdf/
$route['(.*)/api/(.*)'] = "api/$2";          // api/
$route['api/(.*)'] = "api/$1";               // api/
$route['(.*)/api$'] = "api/index";           // api/
$route['(.*)'] = "book/$1";                  // Route everything else to the screen controller

/* End of file routes.php */
/* Location: ./system/application/config/routes.php */