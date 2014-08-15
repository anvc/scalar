<?php

class TPCookieParser {


	const COOKIE_PARSER = "/([^=\s]+=[^=;]*)/";

	public static function extractCookieValue($cookieName, $rawCookieString) {

		if (!$rawCookieString) {
			return;
		}

		$splitWorked = false;

		$matches = array();

		preg_match_all(self::COOKIE_PARSER, $rawCookieString, $matches);

		if(count($matches[1]) == 0)
			return $rawCookieString;

		$matches = $matches[1];

		foreach($matches as $match) {

			$splitWorked = true;
			$match = preg_split("/=/", $match);
			$key = $match[0];
			$val = $match[1];
			if ($cookieName == $key) {
				return $val;
			}
		}

		if ($splitWorked)
			return null;

		return $rawCookieString;

	}
}
?>