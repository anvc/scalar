<?
header ("content-type: text/xml");

$uri =@ urldecode($_REQUEST['uri']);
$xsl =@ urldecode($_REQUEST['xsl']);

//John added this line to make SSL work
if(substr($xsl, 0, 8)=='https://') $xsl = 'http://'.substr($xsl, 8);

$format =@ ($_REQUEST['format']=='json') ? 'json' : 'xml';

if (empty($uri)) die ('Invalid URI');

$uri = str_replace(' ', '+', $uri);

function jsonToXML($json) {
	$return = '<?xml version="1.0" ?>';
	$return .= '<root>';
	foreach ($json as $field => $row) {
		$return .= '<node>';
		$return .= jsonToXMLNodes($row);
		$return .= '</node>';
	}
	$return .= '</root>';
	return $return;
}
function jsonToXMLNodes($row) {
	$return = '';
	foreach ($row as $field => $value) {
		if (is_numeric($field)) $field = 'node';
		$field = str_replace(' ','_',$field);
		$return .= '<'.$field.'>';
		if ('array'==gettype($value)) {
			$return .= jsonToXMLNodes($value);
		} else {
			$return .= '<![CDATA['.trim($value).']]>';
		}
		$return .= '</'.$field.'>';
	}
	return $return;
}

if ('json'==$format) {
	$json = json_decode(file_get_contents($uri), true);
	$xml = jsonToXML($json);
} else {
	$xml = file_get_contents($uri);
}
if ($xml===false) {
	echo '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"></rdf:RDF>';
	exit;
}

if (empty($xsl)) {
	echo $xml;
	exit;
}

$is_html = (false!==strpos(substr($xml, 0, 100), '<html>')) ? true : false;

$XML = new DOMDocument(); 
if ($is_html) {
	@$XML->loadHTML( $xml ); 
} else {
	$XML->loadXML( $xml );
}

$xslt = new XSLTProcessor(); 
$XSL = new DOMDocument(); 
$XSL->load( $xsl , LIBXML_NOCDATA); 
$xslt->importStylesheet( $XSL ); 

$xml = $xslt->transformToXML( $XML );

echo $xml;
exit; 
?>