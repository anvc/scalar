<?php

function sort_contributors($a, $b) {
	
    if ($a->sort_number == $b->sort_number) {
        return 0;
    }
    return ($a->sort_number < $b->sort_number) ? -1 : 1;
    
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
