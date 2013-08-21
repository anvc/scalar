<?php

// TODO: only allow requests from Scalar itself

function error() {
	header("HTTP/1.0 404 Not Found");
	exit;
}

$url =@urldecode($_REQUEST['url']);

if (empty($url)) error();
if (substr($url, 0, 7)!='http://' && substr($url, 0, 8) !='https://' ) error();
if (strstr($url, '@')) error();

$text =@ file_get_contents($url);
if (!$text) error();

header("Content-Type: text/plain");
echo $text;

?>