<?php
defined('BASEPATH') OR exit('No direct script access allowed');

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
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	https://codeigniter.com/user_guide/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES
| -------------------------------------------------------------------------
|
| There are three reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router which controller/method to use if those
| provided in the URL cannot be matched to a valid route.
|
|	$route['translate_uri_dashes'] = FALSE;
|
| This is not exactly a route, but allows you to automatically route
| controller and method names that contain dashes. '-' isn't a valid
| class or method name character, so it requires translation.
| When you set this option to TRUE, it will replace ALL dashes in the
| controller and method URI segments.
|
| Examples:	my-controller/index	-> my_controller/index
|		my-controller/my-method	-> my_controller/my_method
*/
$route['default_controller'] = 'main';
$route['404_override'] = '';
$route['translate_uri_dashes'] = FALSE;

/* Routes added by Craig */

$route['main/(.*)'] = "main/$1";		    // main/ This used to be a controller called "system", but CI3
                                            // can't handle that due to new .htaccess mod_authz support.
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

