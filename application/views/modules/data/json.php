<?php 
// See http://www.geekality.net/2010/06/27/php-how-to-easily-provide-json-and-jsonp/

header('content-type: application/json; charset=utf-8');

$content = (!is_string($content)) ? json_encode($content) : $content;

function is_valid_callback($subject) {
    $identifier_syntax = '/^[$_\p{L}][$_\p{L}\p{Mn}\p{Mc}\p{Nd}\p{Pc}\x{200C}\x{200D}]*+$/u';
    $reserved_words = array('break', 'do', 'instanceof', 'typeof', 'case',
      'else', 'new', 'var', 'catch', 'finally', 'return', 'void', 'continue', 
      'for', 'switch', 'while', 'debugger', 'function', 'this', 'with', 
      'default', 'if', 'throw', 'delete', 'in', 'try', 'class', 'enum', 
      'extends', 'super', 'const', 'export', 'import', 'implements', 'let', 
      'private', 'public', 'yield', 'interface', 'package', 'protected', 
      'static', 'null', 'true', 'false');
    return preg_match($identifier_syntax, $subject) && ! in_array(mb_strtolower($subject, 'UTF-8'), $reserved_words);
}

// JSON if no callback
if( !isset($_GET['callback'])) exit($content);

// JSONP if valid callback
if(is_valid_callback($_GET['callback'])) exit("{$_GET['callback']}($content)");

header('Status: 400 Bad Request', true, 400);
?>