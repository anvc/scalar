<?php
$client_id = '6c51c66e8d70204578142f8048abc9204050d54c';
$client_secret = 'EmdMMY4bLRXpm4bNyx/Mt9i6Vt/N3DtRY36wRif3i57xjdPCsDKRf/tYuckIr+qFEk2aNNKC/6NFKbEW9Q8jUDzDK2yY8yO/+hSCZftHq5tHC+vkikT5NwXZC8j0vtMt';

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