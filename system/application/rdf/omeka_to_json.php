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

session_start();  // Storing items and geolocations from previous queries

$uri =@ trim($_GET['uri']);
if (empty($uri)) die('{}');
$page =@ (int) $_GET['page'];
if (empty($page)) $page = 1;

$uri = str_replace('http://','',$uri);
$uri = str_replace('https://','',$uri);
if (substr($uri, -1, 1) == '/') $uri = substr($uri, 0, -1);
$items_url = 'http://'.$uri.'/api/items?page='.$page;
$files_url = 'http://'.$uri.'/api/files?page='.$page;
$geo_url = 'http://'.$uri.'/api/geolocations?page='.$page;

$files = file_get_contents($files_url);
if (!$files) die('{}');
$files = json_decode($files);
if (!is_array($files)) die('{}');

$items = file_get_contents($items_url);
$items = json_decode($items);
$s_items = array();
if (isset($_SESSION[urlencode('http://'.$uri.'/api/items')])) {
	$s_items = $_SESSION[urlencode('http://'.$uri.'/api/items')];
}
$items = s_array_merge($s_items, $items);
$_SESSION[urlencode('http://'.$uri.'/api/items')] = $items;

$locations = file_get_contents($geo_url);
$locations = json_decode($locations);
$s_locations = array();
if (isset($_SESSION[urlencode('http://'.$uri.'/api/geolocations')])) {
	$s_locations = $_SESSION[urlencode('http://'.$uri.'/api/geolocations')];
}
$locations = s_array_merge($s_locations, $locations);
$_SESSION[urlencode('http://'.$uri.'/api/geolocations')] = $locations;

$output = array();

foreach ($files as $file) {
	$obj = new stdClass();
	$obj->id = $file->id;
	$obj->url = $file->file_urls->original;
	$obj->thumb = $file->file_urls->thumbnail;
	$obj->filename = $file->original_filename;
	$obj->archive = $uri;
	$obj->added = $file->added;
	$obj->element_texts = new stdClass();
	// First try to get Dublin Core data from the file
	foreach ($file->element_texts as $text) {
		if ($text->element_set->name != 'Dublin Core') continue;
		$name = $text->element->name;
		$obj->element_texts->$name = trim(str_replace("\r",'',str_replace("\n",'',nl2br($text->text))));
	}
	// See what Dublin Core is available from the parent item
	$item_id = $file->item->id;
	for ($j = 0; $j < count($items); $j++) {
		if ($items[$j]->id != $item_id) continue;
		$obj->owner = $items[$j]->owner;
		$obj->tags = $items[$j]->tags;
		// DC Terms
		foreach ($items[$j]->element_texts as $text) {
			if ($text->element_set->name != 'Dublin Core') continue;
			$name = $text->element->name;
			if (!isset($obj->element_texts->$name)) {
				$obj->element_texts->$name = trim(str_replace("\r",'',str_replace("\n",'',nl2br($text->text))));
			}
		}
		// Geolocations
		$location = null;
		if (isset($items[$j]->extended_resources->geolocations->id)) {
			$geo_id = $items[$j]->extended_resources->geolocations->id;
			for ($k = 0; $k < count($locations); $k++) {
				if ($locations[$k]->id == $geo_id) $location = $locations[$k]->latitude.','.$locations[$k]->longitude;
			}
		}
		$obj->location_data = $location;
	}
	$output[] = $obj;
}

header('Content-Type: application/json');
echo json_encode($output);

?>