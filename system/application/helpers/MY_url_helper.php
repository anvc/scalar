<?php

	function annotation_append($content) {

		$append = '';
		if (!empty($content->start_seconds) || !empty($content->end_seconds)) {
			$append = '#t=npt:'.$content->start_seconds.','.$content->end_seconds;
		} elseif (!empty($content->start_line_num) || !empty($content->end_line_num)) {
			$append = '#line='.$content->start_line_num.','.$content->end_line_num;
		} elseif (!empty($content->points)) {
			$append = '#xywh='.$content->points;
		} elseif (!empty($content->position_3d)) {
			$append = '#xyzhtf='.$content->position_3d;
		} elseif (!empty($content->datetime)) {
			$append = '#datetime='.rdf_timestamp($content->datetime);
			if (!empty($content->paragraph_num)) $append .= '&paragraph='.$content->paragraph_num;
		} elseif (isset($content->sort_number)) {
			if (!empty($content->sort_number) || !empty($content->relationship) || isset($content->list_in_index)) {
				$append = '#index='.$content->sort_number;
				if (!empty($content->relationship)) $append .= '&role='.$content->relationship;
				if (isset($content->list_in_index)) $append .= '&listed='.$content->list_in_index;
			}
		}
		return $append;

	}

	function abs_url($url, $prefix='') {

		if (is_array($url)) $url = $url[0];
		if (empty($url)) return null;
		if (strstr($url, '://')) return $url;
		if (substr($url,0,2) == '//') return 'http:'.$url;  // A lot of javascript depends on the existance of "://"
		return confirm_slash($prefix).$url;

	}

	function remove_get_str($uri='') {

		$uri_array = explode('?', $uri);
		return $uri_array[0];

	}

	function toURL($uri, $ns_array=array()) {

		if (isURL($uri)) return $uri;
		return toggleNS($uri, $ns_array);

	}

	function toNS($uri, $ns_array=array()) {

		if (isNS($uri)) return $uri;
		return toggleNS($uri, $ns_array);

	}

	function fromNS($uri, $ns_array=array()) {

		if (!isNS($uri)) return $uri;
		return toggleNS($uri, $ns_array);

	}

    function isNS($uri='', $ns=null) {

		if (!empty($ns)) {
			foreach ($ns as $namespace => $p) {
				if (substr($uri, 0, (strlen($namespace)+1))==$namespace.':') return true;
			}
			return false;
		}

    	return (strstr($uri, ':') && !strstr($uri, '://')) ? true : false;

    }

    // TODO: use parse_url() [http://stackoverflow.com/questions/6240414/add-http-prefix-to-url-when-missing]
    function isURL($uri='') {

    	return (substr($uri,0,7)== 'http://'||substr($uri,0,8)== 'https://'||substr($uri,0,4)=='urn:') ? true : false;

    }

   function isURN($uri='') {

    	return (substr($uri, 0, 4)=='urn:') ? true : false;

    }

    function getNS($uri='') {

    	if (!isNS($uri)) return;
    	$split = explode(':', $uri);
    	return $split[0];

    }

    function no_ns($uri='') {

    	if (isURL($uri)) return basename($uri);
    	$uri = str_replace( getNS($uri).':', '', $uri);
    	return $uri;

    }

    function no_ext($uri='') {

		// Always look at the last URI segment
		$orig = $array = explode('/', $uri);
		$segment = $array[count($array)-1];

    	$array = explode('.',$segment);
    	if (1==count($array)) return $uri;

    	if (is_numeric($array[count($array)-1])) return $uri;  // version number

		array_pop($array);
		array_pop($orig);
		if (empty($orig)) return implode('.',$array);
    	return implode('/',$orig).'/'.implode('.',$array);

    }

    function get_ext($uri='') {

		$basename = basename($uri);
		if (!strstr($basename, '.')) return null;
    	$ext = substr($basename, (strrpos($basename, '.')+1));
    	if (is_numeric($ext)) return null; // version number
    	return $ext;

    }

    function get_edition($uri) {

    	if (!strstr($uri, '.')) return null;
    	$uri = str_replace(base_url(), '', $uri);
    	$array = explode('/',$uri);
    	$seg = $array[0];
    	if (!strstr($seg, '.')) return null;
    	$array = explode('.',$seg);
    	if (is_numeric($array[1])) return $array[1];
    	return null;

    }

    function get_version($uri='') {

    	$uri = no_ext($uri);
    	$array = explode('.',$uri);
    	$candidate = $array[count($array)-1];
    	if (is_numeric($candidate)) return $candidate;
    	return null;

    }

    function get_slug_version($slug='') {

    	$array = explode('-',$slug);
    	$candidate = $array[count($array)-1];
    	if (is_numeric($candidate)) return $candidate;
    	return null;

    }

    function no_edition($uri) {

    	if (!strstr($uri, '.')) return $uri;
		$uri = str_replace(base_url(), '', $uri);
    	$array = explode('/',$uri);
    	for ($j = 0; $j < count($array); $j++) {
    		if (strstr($array[$j], '.')) {
    			$temp = explode('.',$array[$j]);
    			$array[$j] = $temp[0];
    		}
    	}
    	$uri = implode('/',$array);
		return $uri;

    }

    function array_no_edition($segments=array()) {

    	foreach ($segments as $j => $segment) {
    		$segments[$j] = no_edition($segments[$j]);
    	}
    	return $segments;

    }

    function no_version($uri) {

    	if (!strstr($uri, '.')) return $uri;
    	$uri = no_ext($uri);
    	if (!strstr($uri, '.')) return $uri;
    	$array = explode('.',$uri);
    	$candidate = $array[count($array)-1];
    	if (is_numeric($candidate)) {
    		array_pop($array);
    	}
    	return implode('.',$array);

    }

    function no_version_ext($uri) {

    	$array = explode('.',$uri);
    	$candidate = $array[count($array)-2];
    	if (is_numeric($candidate)) {
    		array_splice($array, count($array)-2, 1);
    	}
    	return implode('.',$array);

    }

    function get_dir($uri='') {

    	return (strstr($uri, '/')) ? substr($uri, 0, strrpos($uri, '/')) : $uri;

    }

    function getPrefix($uri='') {

    	if (strstr($uri, '#')) {
    		$uri = explode('#', $uri);
    		return $uri[0].'#';
    	}
    	return dirname($uri).'/';

    }

    function toggleNS($uri='', $ns_array=array()) {

    	// Convert NS to full URL
    	if (isNS($uri)) {
    		$ns = getNS($uri);
    		foreach ($ns_array as $candidate_ns => $candidate_prefix) {
    			if ($ns == $candidate_ns) {
    				return str_replace($candidate_ns.':', $candidate_prefix, $uri);
    			}
    		}

    	// Convert full URL to NS
    	} elseif (isURL($uri)) {
    		$prefix = getPrefix($uri);
     		foreach ($ns_array as $candidate_ns => $candidate_prefix) {
    			if ($prefix == $candidate_prefix) {
    				return str_replace($candidate_prefix, $candidate_ns.':', $uri);
    			}
    		}

    	}
    	return $uri;

    }

    function safe_name($filename='', $allow_forward_slash=true, $max_length=100) {

    	$reserved_words = array('system', 'application', 'media');
    	$filename = strip_tags($filename);
    	$filename = str_replace(" ","-",$filename);
    	if (strlen($filename) > $max_length) $filename = substr($filename, 0, $max_length);
    	if ($allow_forward_slash) {  // TODO: presently book slugs are hard-wired to only be one URL segment
			$filename =@ preg_replace('/[^A-Za-z0-9-_\/]/', '', $filename);
    	} else {
    		$filename =@ preg_replace('/[^A-Za-z0-9-_]/', '', $filename);
    	}
		$filename = strtolower($filename);
		if (in_array($filename, $reserved_words)) $filename .= '-1';
   		return $filename;

    }

    function create_suffix($filename='', $count=1) {

    	$has_numerical_ext = is_numeric(substr($filename, strrpos($filename, '-')+1)) ? true : false;
    	if ($has_numerical_ext) {
    		$filename = substr($filename, 0, strrpos($filename, '-'));
    	}
    	$filename = $filename.'-'.$count;
    	return $filename;

    }

    function confirm_base($uri) {

    	if (empty($uri)) return $uri;
    	if (isURL($uri)) return $uri;
    	return base_url().$uri;

    }

    function base_ssl(){
    	return str_replace('http://', 'https://', base_url());
    }

    function strip_base_ssl(){
    	return str_replace('https://', 'http://', base_url());
    }

    function get_str($remove=array(), $add=array()) {

		if (!is_array($add)) $add = array($add);

    	if (!is_array($remove)) $remove = array($remove);
    	$return = array();
    	foreach ($_GET as $field => $value) {
    		if (in_array($field, $remove)) continue;
    		$return[] = $field.'='.urlencode(trim($value));
    	}
    	foreach ($add as $value) {
    		$return[] = $value;
    	}
    	if (empty($return)) return '';
    	return '?'.implode('&',$return);

    }

    function confirm_slash($uri='') {

    	if (empty($uri)) return $uri;
    	$end = substr($uri, -1, 1);
    	if ($end != '/' && $end != '\\') $uri .= '/';
    	return $uri;

    }

    // http://php.net/manual/en/function.rawurlencode.php#48792
    function linkencode($p_url, $encode_hash=false) {

	   $uparts = @parse_url($p_url);
	   $scheme = array_key_exists('scheme',$uparts) ? $uparts['scheme'] : "";
	   $pass = array_key_exists('pass',$uparts) ? $uparts['pass']  : "";
	   $user = array_key_exists('user',$uparts) ? $uparts['user']  : "";
	   $port = array_key_exists('port',$uparts) ? $uparts['port']  : "";
	   $host = array_key_exists('host',$uparts) ? $uparts['host']  : "";
	   $path = array_key_exists('path',$uparts) ? $uparts['path']  : "";
	   $query = array_key_exists('query',$uparts) ? $uparts['query']  : "";
	   $fragment = array_key_exists('fragment',$uparts) ? $uparts['fragment']  : "";

	   if (!empty($scheme)) $scheme .= '://';

	   if (!empty($pass) && !empty($user)) {
	     $user = rawurlencode($user).':';
	     $pass = rawurlencode($pass).'@';
	   } elseif (!empty($user)) {
	     $user .= '@';
	   }

	   if (!empty($port) && !empty($host)) {
	       $host = ''.$host.':';
	   } elseif (!empty($host)) {
	       $host = $host;
	   }

	   if (!empty($path)) {
	     $arr = preg_split("/([\/;=])/", $path, -1, PREG_SPLIT_DELIM_CAPTURE); // needs php > 4.0.5.
	     $path = "";
	     foreach ($arr as $var) {
	       switch ($var) {
	       case "/":
	       case ";":
	       case "=":
	         $path .= $var;
	         break;
	       default:
	         $path .= rawurlencode($var);
	       }
	     }
	     $path = str_replace("/%7E","/~",$path);  // legacy patch for servers that need a literal /~username
	   }

	   if (!empty($query)) {
	     $arr = preg_split("/([&=])/", $query, -1, PREG_SPLIT_DELIM_CAPTURE); // needs php > 4.0.5.
	     $query = "?";
	     foreach ($arr as $var){
	       if ( "&" == $var || "=" == $var ) {
	         $query .= $var;
	       } else {
	         $query .= rawurlencode($var);
	       }
	     }
	   }

	   if (!empty($fragment)) { // Hash causes problems with Scalar's URL handing javascript ~Craig
	     $fragment = (($encode_hash)?'%23':'#').rawurlencode($fragment);
	   }

	   return implode('', array($scheme, $user, $pass, $host, $port, $path, $query, $fragment));
	}

?>
