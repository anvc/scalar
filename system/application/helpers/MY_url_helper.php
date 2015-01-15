<?php

	function annotation_append($content) {

		$append = '';
		if (!empty($content->start_seconds) || !empty($content->end_seconds)) {
			$append = '#t=npt:'.$content->start_seconds.','.$content->end_seconds;
		} elseif (!empty($content->start_line_num) || !empty($content->end_line_num)) {
			$append = '#line='.$content->start_line_num.','.$content->end_line_num;
		} elseif (!empty($content->points)) {
			$append = '#xywh='.$content->points;
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
		
		if (empty($url)) return null;
		if (strstr($url, '://')) return $url;
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
    
    function no_version($uri) {
    	
    	if (!strstr($uri, '.')) return $uri;
    	$uri = no_ext($uri);
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

    function safe_name($filename='', $allow_forward_slash=true) {

    	$filename = strip_tags($filename);
    	$filename = str_replace(" ","-",$filename);
    	if ($allow_forward_slash) {  // TODO: presently book slugs are hard-wired to only be one URL segment
			$filename =@ preg_replace('/[^A-Za-z0-9-_\/]/', '', $filename); 
    	} else {
    		$filename =@ preg_replace('/[^A-Za-z0-9-_]/', '', $filename); 
    	}
		$filename = strtolower($filename);
   		return $filename;

    }
    
    function create_suffix($filename='', $count=1) {
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
    
?>