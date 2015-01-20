<?php

function is_multi($arr) {
	if (!is_array($arr)) return false;
	if (count($arr) == count($arr, COUNT_RECURSIVE)) return false;
	return true;
}

function array_unique_no_empty($arr=array()) {
	$arr = array_unique($arr);
	$arr = array_filter($arr);
	return $arr;
}

function array_with_strings_to_multi_array($arr=array(), $default_key='name') {
	
	foreach ($arr as $key => $value) {
		if (empty($value)) continue;
		if (!is_array($value)) $value = array($default_key => $value);
		$arr[$key] = $value;
	}
	return $arr;
	
}

function sort_contributors($a, $b) {
	
    if ($a->sort_number == $b->sort_number) {
        return 0;
    }
    return ($a->sort_number < $b->sort_number) ? -1 : 1;
    
}

function unserialize_recursive($str='') {
	
    if (!is_string($str)) { 
        return $str;
    } else {	
    	$str = unserialize($str);
        return unserialize_recursive($str); 
    } 
	
}

function array_get_node($field, $value, $array) { 
	
	$j = 0;
	foreach ($array as $key => $segment) {
		$segment = (array) $segment;
		if ($segment[$field] == $value)	{
			return array('value'=>$segment, 'num'=>($j+1), 'total'=>count($array), 'key'=>$key, 'index'=>$j);
		}
		$j++;
	}
	return null;	
	
}

function array_prev($field, $value, $array) {
	
	for ($j = 0; $j < count($array); $j++) {
		$segment = (array) $array[$j];
		if ($segment[$field] == $value)	{
			if (isset($array[$j-1])) {
				return $array[$j-1];
			}
		}
	}
	return null;
	
}

function array_next($field, $value, $array) {
	
	for ($j = 0; $j < count($array); $j++) {
		$segment = (array) $array[$j];
		if ($segment[$field] == $value)	{
			if (isset($array[$j+1])) {
				return $array[$j+1];
			}
		}
	}
	return null;
	
}

?>
