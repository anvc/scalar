<?php

function template_link_tag_relative($rel='', $path='') {
	
    $rel = url_from_file($rel);
	$rel .= $path;
	return link_tag($rel);
	
}

function template_script_tag_relative($rel='', $path='', $args=array()) {
	
    $rel = path_from_file($rel);
	$rel .= $path;
	return script_tag($rel, $args);
	
}

function url_from_file($rel='') {
	
    $rel = dirname(str_replace(FCPATH, base_url(), $rel));
	$rel = str_replace('\\', '/', $rel).'/';
	return $rel;
	
}

function path_from_file($rel='') {
	
    $rel = dirname(str_replace(FCPATH, '', $rel));
	$rel = str_replace('\\', '/', $rel).'/';
	return $rel;
	
}

// http://codeigniter.com/wiki/script_-_html_helper
if ( ! function_exists('script_tag')) {
  function script_tag($rpath, $args) {
  	$return = '';
    $return .= '<script type="text/javascript" src="'.base_url().$rpath.'"';
	foreach ($args as $field => $value) {
		$return .= ' '.$field.'="'.$value.'"';
	} 
	$return .= '></script>';
	return $return;
  }
}

function create_excerpt($str='', $word_limit=15) {
	
	$str = trim(strip_tags($str));
	$beg_count = strlen($str);
	$str = string_limit_words($str, $word_limit);
	$str = str_replace("\n", ' ', $str);
	$str = str_replace("\r", '', $str);
	$str = str_replace("\t", ' ', $str);
	if (strlen($str) < $beg_count) $str .= ' ...';
	return $str;
	
}

// http://php.net/manual/en/function.nl2br.php
function nl2brPre($string)
{
    // First, check for <pre> tag
    if(strpos($string, "<pre>") === false) 
    {
        return nl2br($string);
    }

    // If there is a <pre>, we have to split by line 
    // and manually replace the linebreaks with <br />
    $strArr=explode("\n", $string);
    $output="";
    $preFound=3;

    // Loop over each line
    foreach($strArr as $line)
    {    // See if the line has a <pre>. If it does, set $preFound to true
        if(strpos($line, "<pre>") === true)
        {
            $preFound=1;
        }
        elseif(strpos($line, "</pre>"))
        {
            $preFound=2;
        }

        // If we are in a pre tag, just give a \n, else a <br />
        switch($preFound) {
            case 1: // found a <pre> tag, close the <p> element
                //$output .= "</p>\n" . $line . "\n";
                $output .= "\n" . $line . "\n";
                break;
            case 2: // found the closing </pre> tag, append a newline and open a new <p> element
                //$output .= $line . "\n<p>";
                $output .= $line . "\n<br />";
                $preFound = 3; // switch to normal behaviour
                break;
            case 3: // simply append a <br /> element
                $output .= $line . "<br />";
                break;
        }
    }

    return $output;
}

// http://vision-media.ca/resources/php/php-word-limit
function string_limit_words($string, $word_limit) {
	
     $words = explode(' ', $string);
     return implode(' ', array_slice($words, 0, $word_limit));
     
}

function closeOpenTags($html) {
  preg_match_all ( "#<([a-z]+)( .*)?(?!/)>#iU", $html, $result );
  $openedtags = $result[1];
  preg_match_all ( "#</([a-z]+)>#iU", $html, $result );
  $closedtags = $result[1];
  $len_opened = count ( $openedtags );
  if( count ( $closedtags ) == $len_opened ) {
    return $html;
  }
  $openedtags = array_reverse ( $openedtags );
  for( $i = 0; $i < $len_opened; $i++ ) {
    if ( !in_array ( $openedtags[$i], $closedtags ) ) {
      $html .= "</" . $openedtags[$i] . ">";
    } else {
      unset ( $closedtags[array_search ( $openedtags[$i], $closedtags)] );
    }
  }
  return $html;
}

// http://php.net/manual/en/function.strip-tags.php
function remove_HTML($s , $keep = '' , $expand = 'script|style|noframes|select|option'){ 
	
	// This function is throwing the server into an infinite loop on a specific MS-Word WYSIWYG gobledeegook
	// So, for now, revert to strip_tags()
	return strip_tags($s);	
	
	/**///prep the string 
	$s = ' ' . $s; 
	/**///initialize keep tag logic 
 	if(strlen($keep) > 0){ 
            $k = explode('|',$keep); 
            for($i=0;$i<count($k);$i++){ 
                $s = str_replace('<' . $k[$i],'[{(' . $k[$i],$s); 
                $s = str_replace('</' . $k[$i],'[{(/' . $k[$i],$s); 
            } 
	} 
	//begin removal 
	/**///remove comment blocks 
	while(stripos($s,'<!--') > 0){ 
            $pos[1] = stripos($s,'<!--'); 
            $pos[2] = stripos($s,'-->', $pos[1]); 
            $len[1] = $pos[2] - $pos[1] + 3; 
            $x = substr($s,$pos[1],$len[1]); 
            $s = str_replace($x,'',$s); 
	}   
	/**///remove tags with content between them 
	if(strlen($expand) > 0){ 
            $e = explode('|',$expand); 
            for($i=0;$i<count($e);$i++){ 
                while(stripos($s,'<' . $e[$i]) > 0){ 
                    $len[1] = strlen('<' . $e[$i]); 
                    $pos[1] = stripos($s,'<' . $e[$i]); 
                    $pos[2] = stripos($s,$e[$i] . '>', $pos[1] + $len[1]); 
                    $len[2] = $pos[2] - $pos[1] + $len[1]; 
                    $x = substr($s,$pos[1],$len[2]); 
                    $s = str_replace($x,'',$s); 
                } 
            } 
	}  
	/**///remove remaining tags 
	while(stripos($s,'<') > 0){ 
            $pos[1] = stripos($s,'<'); 
            $pos[2] = stripos($s,'>', $pos[1]); 
            $len[1] = $pos[2] - $pos[1] + 1; 
            $x = substr($s,$pos[1],$len[1]); 
            $s = str_replace($x,'',$s); 
	} 
	/**///finalize keep tag 
	if(strlen($keep) > 0){ 
        	for($i=0;$i<count($k);$i++){ 
          	  $s = str_replace('[{(' . $k[$i],'<' . $k[$i],$s); 
          	  $s = str_replace('[{(/' . $k[$i],'</' . $k[$i],$s); 
        	}
	} 	
        
	return trim($s); 
} 

?>