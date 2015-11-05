<?php
// TODO: https

session_start();  // contentdm requires session to move to next page
$opts = array('http' => array('header'=> 'Cookie: ' . @$_SERVER['HTTP_COOKIE']."\r\n"));  // Send cookies for session_start of target
$context = stream_context_create($opts);
session_write_close();
$content = file_get_contents($source_uri, false, $context);
?>