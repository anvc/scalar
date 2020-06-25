<?php 

$output = array();
$q = (isset($_REQUEST['q']) && !empty($_REQUEST['q'])) ? $_REQUEST['q'] : null;
$url = 'https://criticalcommons.org/api/v1/search';
$item_url = 'https://criticalcommons.org/api/v1/media/';
if (empty($q)) die();

$contents = file_get_contents($url.'?q='.$q);
$contents = json_decode($contents);

for ($j = 0; $j < count($contents->results); $j++) {
	$token = $contents->results[$j]->friendly_token;
	$item = file_get_contents($item_url.$token);
	$item = json_decode($item);
	$url = '';
	if (isset($item->encodings_info) && isset($item->encodings_info->{360}) && isset($item->encodings_info->{360}->h264)) {
		$url = 'https://criticalcommons.org'.$item->encodings_info->{360}->h264->url;
	} else {
		$url = 'https://criticalcommons.org'.$item->original_media_url;
	}
	$item->media_url = $url;
	$output[] = $item;
}

header('Content-Type: application/json');
echo json_encode($output);
?>