<?php
/**
 * Scalar
 * Copyright 2013 The Alliance for Networking Visual Culture.
 * http://scalar.usc.edu/scalar
 * Alliance4NVC@gmail.com
 *
 * Licensed under the Educational Community License, Version 2.0
 * (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

function s_array_merge($array1, $array2) {  // merge array removing duplicates based on obj->id
	if (!is_array($array1)) $array1 = array();
	if (!is_array($array2)) return $array1;
	foreach ($array2 as $el2) {
		$can_add = true;
		foreach ($array1 as $el1) {
			if ($el1->id == $el2->id) {
				$can_add = false;
				break;
			}
		}
		if ($can_add) $array1[] = $el2;
	}
	return $array1;
}

function spacify($camel, $glue = ' ') {  // camel to spaces
    return preg_replace( '/([a-z0-9])([A-Z])/', "$1$glue$2", $camel );
}

session_start();  // Storing items and geolocations from previous queries

$uri =@ trim($_GET['uri']);
if (empty($uri)) die('{}');
$page =@ (int) $_GET['page'];
if (empty($page)) $page = 1;

if (substr($uri, -1, 1) == '/') $uri = substr($uri, 0, -1);

if (1==$page) {
	$items_url = 'http://'.$uri.'/api/items?page='.$page;
	$items =@ file_get_contents($items_url);
	$items = json_decode($items);
	$s_items = array();
	if (isset($_SESSION[urlencode('http://'.$uri.'/api/items')])) {
		$s_items = $_SESSION[urlencode('http://'.$uri.'/api/items')];
	}
	$items = s_array_merge($s_items, $items);
	$_SESSION[urlencode('http://'.$uri.'/api/items')] = $items;
}

$items_url = 'http://'.$uri.'/api/items?page='.($page+1);
$items =@ file_get_contents($items_url);
$items = json_decode($items);
$s_items = array();
if (isset($_SESSION[urlencode('http://'.$uri.'/api/items')])) {
	$s_items = $_SESSION[urlencode('http://'.$uri.'/api/items')];
}
$items = s_array_merge($s_items, $items);
$_SESSION[urlencode('http://'.$uri.'/api/items')] = $items;

if (1==$page) {
	$geo_url = 'http://'.$uri.'/api/geolocations?page='.$page;
	$locations =@ file_get_contents($geo_url);
	$locations = json_decode($locations);
	$s_locations = array();
	if (isset($_SESSION[urlencode('http://'.$uri.'/api/geolocations')])) {
		$s_locations = $_SESSION[urlencode('http://'.$uri.'/api/geolocations')];
	}
	$locations = s_array_merge($s_locations, $locations);
	$_SESSION[urlencode('http://'.$uri.'/api/geolocations')] = $locations;
}

$geo_url = 'http://'.$uri.'/api/geolocations?page='.($page+1);
$locations =@ file_get_contents($geo_url);
$locations = json_decode($locations);
$s_locations = array();
if (isset($_SESSION[urlencode('http://'.$uri.'/api/geolocations')])) {
	$s_locations = $_SESSION[urlencode('http://'.$uri.'/api/geolocations')];
}
$locations = s_array_merge($s_locations, $locations);
$_SESSION[urlencode('http://'.$uri.'/api/geolocations')] = $locations;

$output = array();

header('Content-Type: application/json');
echo json_encode($output);

?>