<?php
$client_id = '';
$client_secret = '';

require(FCPATH."application/models/handlers/vimeo/autoload.php");
$lib = new \Vimeo\Vimeo($client_id, $client_secret);
$token = $lib->clientCredentials();
$access_token = $token['body']['access_token'];
//echo '$access_token: '.$access_token."\n";
//echo 'query: '.$query."\n";
//echo 'page: '.$page."\n";

$lib->setToken($access_token);
$response = $lib->request('/videos', array(
										'page' => $page,
										'per_page' => 50,
										'query' => $query,
										'sort' => 'relevant'
									 ), 'GET');
$content = json_encode($response);
?>