<?php
/**
 * Calculates the great-circle distance between two points, with the Haversine formula.
 * https://stackoverflow.com/questions/10053358/measuring-the-distance-between-two-coordinates-in-php
 * @param float $latitudeFrom Latitude of start point in [deg decimal]
 * @param float $longitudeFrom Longitude of start point in [deg decimal]
 * @param float $latitudeTo Latitude of target point in [deg decimal]
 * @param float $longitudeTo Longitude of target point in [deg decimal]
 * @param float $earthRadius Mean earth radius in meters
 * @return float Distance between points in meters (same as earthRadius)
 */
function latlng_distance($latitudeFrom, $longitudeFrom, $latitudeTo, $longitudeTo, $earthRadius = 6371000) {
	// convert from degrees to radians
	$latFrom = deg2rad($latitudeFrom);
	$lonFrom = deg2rad($longitudeFrom);
	$latTo = deg2rad($latitudeTo);
	$lonTo = deg2rad($longitudeTo);

	$latDelta = $latTo - $latFrom;
	$lonDelta = $lonTo - $lonFrom;

	$angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) + cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));
	return $angle * $earthRadius;
}

function rdf_timestamp($value) {

	return date('c', strtotime($value));;

}

function search_split_terms($terms){

	if (empty($terms)) return $terms;

	$out = array();
	preg_match_all('/"(?:\\\\.|[^\\\\"])*"|\S+/', $terms, $matches);
	foreach ($matches[0] as $term) {
		$out[] = trim($term, "\",'");
	}

	return $out;
}

function edition_cookie_name($url) {  // This mimics cookieName() in javascript

	$url= preg_replace('#^https?://#', '', $url);
	$url = str_replace('/', '_', $url);
	$url= preg_replace("/[^a-zA-Z0-9_]+/", "", $url);
	return 'scalar_edition_index_'.$url;

}

// http://www.phpro.org/examples/Find-Position-Of-Nth-Occurrence-Of-String.html
function strposOffset($search, $string, $offset) {
    $arr = explode($search, $string);
    switch( $offset ) {
        case $offset == 0:
        return false;
        break;

        case $offset > max(array_keys($arr)):
        return false;
        break;

        default:
        return strlen(implode($search, array_slice($arr, 0, $offset)));
    }
}

// http://stackoverflow.com/questions/853813/how-to-create-a-random-string-using-php
function randString($length, $charset='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    $str = '';
    $count = strlen($charset);
    while ($length--) {
        $str .= $charset[mt_rand(0, $count-1)];
    }
    return $str;
}

// http://www.phpfreaks.com/forums/index.php?topic=209684.0
function getAttribute($attrib, $tag) {
  //get attribute from html tag
  $re = '/'.$attrib.'=["\']?([^"\' ]*)["\' ]/is';
  preg_match($re, $tag, $match);
  if($match){
    return urldecode($match[1]);
  }else {
    return false;
  }
}

function get_tag( $tag, $xml ) {
  $tag = preg_quote($tag);
  preg_match_all('{<'.$tag.'[^>]*>(.*?)</'.$tag.'>}',$xml,$matches,PREG_PATTERN_ORDER);
  return $matches[0];
}

function cleanbr($str='') {
	$str = nl2br($str);
	$str = str_replace("\n", '', str_replace("\r", '', $str));
	return $str;
}

function first_paragraph($str='') {

	$orig_strlen = strlen($str);
	$seek = array('</p','</br','<br /','<br/');
	foreach ($seek as $tag) {
		if (stripos($str,$tag)) {
			$str = substr($str, 0, strpos($str,$tag));
		}
	}
	if (strlen($str) < $orig_strlen) $str .= ' [...]';
	return $str;

}

function hl($text, $terms) {

	foreach ($terms as $term) {
		$text = preg_replace('/('.preg_quote($term).')/i','<span class="hl">\1</span>', $text);
	}
    return $text;

}

function spacify($camel, $glue = ' ') {
    return preg_replace( '/([a-z0-9])([A-Z])/', "$1$glue$2", $camel );
}

function init_byte_map(){
  global $byte_map;
  for($x=128;$x<256;++$x){
    $byte_map[chr($x)]=utf8_encode(chr($x));
  }
  $cp1252_map=array(
    "\x80"=>"\xE2\x82\xAC",    // EURO SIGN
    "\x82" => "\xE2\x80\x9A",  // SINGLE LOW-9 QUOTATION MARK
    "\x83" => "\xC6\x92",      // LATIN SMALL LETTER F WITH HOOK
    "\x84" => "\xE2\x80\x9E",  // DOUBLE LOW-9 QUOTATION MARK
    "\x85" => "\xE2\x80\xA6",  // HORIZONTAL ELLIPSIS
    "\x86" => "\xE2\x80\xA0",  // DAGGER
    "\x87" => "\xE2\x80\xA1",  // DOUBLE DAGGER
    "\x88" => "\xCB\x86",      // MODIFIER LETTER CIRCUMFLEX ACCENT
    "\x89" => "\xE2\x80\xB0",  // PER MILLE SIGN
    "\x8A" => "\xC5\xA0",      // LATIN CAPITAL LETTER S WITH CARON
    "\x8B" => "\xE2\x80\xB9",  // SINGLE LEFT-POINTING ANGLE QUOTATION MARK
    "\x8C" => "\xC5\x92",      // LATIN CAPITAL LIGATURE OE
    "\x8E" => "\xC5\xBD",      // LATIN CAPITAL LETTER Z WITH CARON
    "\x91" => "\xE2\x80\x98",  // LEFT SINGLE QUOTATION MARK
    "\x92" => "\xE2\x80\x99",  // RIGHT SINGLE QUOTATION MARK
    "\x93" => "\xE2\x80\x9C",  // LEFT DOUBLE QUOTATION MARK
    "\x94" => "\xE2\x80\x9D",  // RIGHT DOUBLE QUOTATION MARK
    "\x95" => "\xE2\x80\xA2",  // BULLET
    "\x96" => "\xE2\x80\x93",  // EN DASH
    "\x97" => "\xE2\x80\x94",  // EM DASH
    "\x98" => "\xCB\x9C",      // SMALL TILDE
    "\x99" => "\xE2\x84\xA2",  // TRADE MARK SIGN
    "\x9A" => "\xC5\xA1",      // LATIN SMALL LETTER S WITH CARON
    "\x9B" => "\xE2\x80\xBA",  // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK
    "\x9C" => "\xC5\x93",      // LATIN SMALL LIGATURE OE
    "\x9E" => "\xC5\xBE",      // LATIN SMALL LETTER Z WITH CARON
    "\x9F" => "\xC5\xB8"       // LATIN CAPITAL LETTER Y WITH DIAERESIS
  );
  foreach($cp1252_map as $k=>$v){
    $byte_map[$k]=$v;
  }
}

function fix_latin($instr){
  if(mb_check_encoding($instr,'UTF-8'))return $instr; // no need for the rest if it's all valid UTF-8 already
  global $nibble_good_chars,$byte_map;
  $outstr='';
  $char='';
  $rest='';
  while((strlen($instr))>0){
    if(1==preg_match($nibble_good_chars,$input,$match)){
      $char=$match[1];
      $rest=$match[2];
      $outstr.=$char;
    }elseif(1==preg_match('@^(.)(.*)$@s',$input,$match)){
      $char=$match[1];
      $rest=$match[2];
      $outstr.=$byte_map[$char];
    }
    $instr=$rest;
  }
  return $outstr;
}

/*
$byte_map=array();
init_byte_map();
$ascii_char='[\x00-\x7F]';
$cont_byte='[\x80-\xBF]';
$utf8_2='[\xC0-\xDF]'.$cont_byte;
$utf8_3='[\xE0-\xEF]'.$cont_byte.'{2}';
$utf8_4='[\xF0-\xF7]'.$cont_byte.'{3}';
$utf8_5='[\xF8-\xFB]'.$cont_byte.'{4}';
$nibble_good_chars = "@^($ascii_char+|$utf8_2|$utf8_3|$utf8_4|$utf8_5)(.*)$@s";
*/
?>