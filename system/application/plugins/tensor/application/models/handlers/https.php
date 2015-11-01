<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $source_uri);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
$content = curl_exec($ch);
curl_close($ch);
?>