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

/**
 * Given JSON structure for a media item, find the corresponding Omeka
 * S item and add its information to the medium structure.
 */
function add_item_info(&$medium, &$s_items) {
	// Get the item URL from the medium.
	if (!(isset($medium->{'o:item'}))) return;
	$item_ref = $medium->{'o:item'};
	if (!(isset($item_ref->{'@id'}))) return;
	$item_url = $item_ref->{'@id'};

	// Check our cache; fetch the item if necessary.
	if (isset($s_items[$item_url])) {
		$item = $s_items[$item_url];
	} else {
		$item =@ file_get_contents($item_url);
		$item = json_decode($item);
		$s_items[$item_url] = $item;
	}

	// Replace the item reference with the fetched or cached item.
	// Propagate properties upward if not overridden by the medium.
	if ($item !== null) {
		$medium->{'o:item'} = $item;
		foreach ($item as $key => $value) {
			if (!(isset($medium->$key))) {
				$medium->$key = $value;
			}
		}
	}

	return;
}

function s_array_merge($array1, $array2) {  // merge array removing duplicates based on obj->@id
	if (!is_array($array1)) $array1 = array();
	if (!is_array($array2)) return $array1;
	foreach ($array2 as $el2) {
		$can_add = true;
		foreach ($array1 as $el1) {
			if ($el1->{'@id'} == $el2->{'@id'}) {
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

// function copied from 
// https://php.net/manual/en/function.parse-url.php#106731
function unparse_url($parsed_url) {
	$scheme = isset($parsed_url['scheme']) ? $parsed_url['scheme'] . '://' : '';
	$host = isset($parsed_url['host']) ? $parsed_url['host'] : '';
	$port = isset($parsed_url['port']) ? ':' . $parsed_url['port'] : '';
	$user = isset($parsed_url['user']) ? $parsed_url['user'] : '';
	$pass = isset($parsed_url['pass']) ? ':' . $parsed_url['pass'] : '';
	$pass = ($user || $pass) ? "$pass@" : '';
	$path = isset($parsed_url['path']) ? $parsed_url['path'] : '';
	$query = isset($parsed_url['query']) ? '?' . $parsed_url['query'] : '';
	$fragment = isset($parsed_url['fragment']) ? '#' . $parsed_url['fragment'] : '';
	return "$scheme$user$pass$host$port$path$query$fragment";
}

session_start();  // Storing items and geolocations from previous queries

$uri =@ trim($_GET['uri']);
if (empty($uri)) die('{}');
$page =@ (int) $_GET['page'];
if (empty($page)) $page = 1;

$parsed_uri = parse_url($uri);
if (!array_key_exists('scheme', $parsed_uri)) {
	$parsed_uri['scheme'] = 'http';
	// If there is no scheme and no initial double-slash, PHP
	// interprets the entire URL as a path.
	if (!array_key_exists('host', $parsed_uri)){
		$path_parts = explode('/', $parsed_uri['path']);
		$parsed_uri['host'] = array_shift($path_parts);
		$parsed_uri['path'] = implode('/', $path_parts);
	}
} elseif ($parsed_uri['scheme'] != 'http' &&
		$parsed_uri['scheme'] != 'https') {
	die('{}');
}
if (substr($parsed_uri['path'], -1, 1) == '/') {
	$parsed_uri['path'] = substr($parsed_uri['path'], 0, -1);
}
unset($parsed_uri['query']);
unset($parsed_uri['fragment']);
$uri = unparse_url($parsed_uri);

$media_url = $uri.'/api/media?page='.$page;
$media =@ file_get_contents($media_url);
$media = json_decode($media);
$s_media = array();
if (isset($_SESSION[urlencode($uri.'/api/media')])) {
	$s_media = $_SESSION[urlencode($uri.'/api/media')];
}
$media = s_array_merge($s_media, $media);
$_SESSION[urlencode($uri.'/api/media')] = $media;

$s_items = array();
if (isset($_SESSION[urlencode($uri.'/api/items')])) {
	$s_items = $_SESSION[urlencode($uri.'/api/items')];
}

$output = array();

foreach ($media as $medium) {
	$medium->archive = $uri;

	add_item_info($medium, $s_items);

	$output[] = $medium;
}

$_SESSION[urlencode($uri.'/api/items')] = $s_items;

header('Content-Type: application/json');
echo json_encode($output);

?>