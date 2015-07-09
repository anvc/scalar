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

$uri =@ $_GET['uri'];
if (empty($uri)) die('{}');

$uri = str_replace('http://','',$uri);
$uri = str_replace('https://','',$uri);
if (substr($uri, -1, 1) == '/') $uri = substr($uri, 0, -1);
$items_url = 'http://'.$uri.'/api/items';
$files_url = 'http://'.$uri.'/api/files';
$geo_url = 'http://'.$uri.'/api/geolocations';

$items = file_get_contents($items_url);
if (!$items) die('{}');
$items = json_decode($items);
if (!is_array($items)) die('{}');

$files = file_get_contents($files_url);
$files = json_decode($files);

$locations = file_get_contents($geo_url);
$locations = json_decode($locations);

foreach ($files as $file) {
	$file_data = new stdClass();
	$file_data->url = $file->file_urls->original;
	$file_data->thumb = $file->file_urls->thumbnail;
	$file_data->filename = $file->original_filename;
	$file_data->archive = $uri;
	$item_id = $file->item->id;
	for ($j = 0; $j < count($items); $j++) {
		if ($items[$j]->id != $item_id) continue;
		$items[$j]->file_data = $file_data;
	}
}
for ($j = (count($items)-1); $j >= 0; $j--) {
	if (!isset($items[$j]->file_data)) {
		unset($items[$j]);
		continue;
	}
	$location = null;
	if (isset($items[$j]->extended_resources->geolocations->id)) {
		$geo_id = $items[$j]->extended_resources->geolocations->id;
		for ($k = 0; $k < count($locations); $k++) {
			if ($locations[$k]->id == $geo_id) $location = $locations[$k]->latitude.','.$locations[$k]->longitude;
		}
	}
	$items[$j]->location_data = $location;
}

header('Content-Type: application/json');
echo json_encode($items);

?>