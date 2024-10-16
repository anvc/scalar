<?php
/**
 * This contains a temporay fix for a missing str_contains function if using
 * PHP < 8.
 */

if (!function_exists('str_contains')) {
    function str_contains(string $haystack, string $needle): bool {
        return '' === $needle || false !== strpos($haystack, $needle);
    }
}
?>
