<?php
require_once(FCPATH."/application/views/common/arc2/ARC2.php");

$url = 'http://karmarestserver.dig.isi.edu:8080/publishrdf/rdf/r2rml/rdf';
$arr = array(
	'SparqlEndPoint'=>urlencode($store_uri),
	'GraphURI'=>urlencode($graph_uri),
	'TripleStore'=>'Virtuoso',
	'Overwrite'=>'true',
	'DataURL'=>rawurlencode(str_replace(' ','+',$source_uri)),
	'R2rmlURI'=>urlencode($mapping_uri),
	'ContentType'=>strtoupper($content_type),
	'RefreshModel'=>'true'
);

/*
echo 'URL '.$url."\n";
echo 'DataURL: '.$source_uri."\n";
echo 'R2rmlURI: '.$mapping_uri."\n";
print_r($arr);
*/

// url-ify the data for the POST
$arr_string = '';
foreach($arr as $key=>$value) { $arr_string .= $key.'='.$value.'&'; }
rtrim($arr_string, '&');

// CURL
$ch = curl_init();
curl_setopt($ch,CURLOPT_URL, $url);
curl_setopt($ch,CURLOPT_POST, count($arr));
curl_setopt($ch,CURLOPT_POSTFIELDS, $arr_string);
curl_setopt($ch,CURLOPT_RETURNTRANSFER, 1);
$content = curl_exec($ch);
$curlinfo = curl_getinfo($ch);
curl_close($ch);

// Convert from TTL to RDF-JSON
if (!empty($content)) {
	$parser = ARC2::getTurtleParser();
	$parser->parse('http://example.com/', $content);
	$triples = $parser->getTriples();
	$ser = ARC2::getRDFJSONSerializer();
	$content = $ser->getSerializedTriples($triples);
}
?>
