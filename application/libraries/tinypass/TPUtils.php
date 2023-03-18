<?php

class TPUtils {
	const SPLIT_ADDR = "/\./";

	const EXPIRE_PARSER = '/(\d+)\s*(\w+)/';

	public static function isIpValid($ipAddress) {
		return $ipAddress && preg_match("/\d{1,3}\.\d{1,3}\.\d{1,3}.\d{1,3}/", $ipAddress);
	}

	public static function shortenIP($idAddress) {
		if("0:0:0:0:0:0:0:1" == $idAddress) $idAddress = "127.0.0.1";

		try {
			$elems = preg_split(TPUtils::SPLIT_ADDR, $idAddress);
			$value = $elems[0] | ($elems[1] << 8) | ($elems[2] << 16) | ($elems[3] << 24);
			return dechex($value);
		} catch(Exception $ex) {

		}

		return null;
	}

	public static function unshortenIP($address) {
		if ($address == null) return "";

		$res = "";
		$res.=(hexdec($address) & 0xff);
		$res.=(".");
		$res.=((hexdec($address) >> 8) & 0xff);
		$res.=(".");
		$res.=((hexdec($address) >> 16) & 0xff);
		$res.=(".");
		$res.=((hexdec($address) >> 24) & 0xff);

		return $res;
	}



	public static function parseLoosePeriodInSecs($period) {
		return self::parseLoosePeriodInMsecs($period)	/1000;
	}

	public static function parseLoosePeriodInMsecs($period) {
		if (preg_match("/^-?\d+$/", $period)) {
			return (int)$period;
		}
		$matches = array();
		if (preg_match(self::EXPIRE_PARSER, $period, $matches)) {
			$num = $matches[1];
			$str = $matches[2];
			switch ($str[0]) {
				case 's':
					return $num * 1000;
				case 'm':

					if (strlen($str) > 1 && $str[1] == 'i')
						return $num * 60 * 1000;
					else if (strlen($str) > 1 && $str[1] == 's')
						return $num;
					else if (strlen($str) == 1 || $str[1] == 'o')
						return $num * 30 * 24 * 60 * 60 * 1000;

				case 'h':
					return $num * 60 * 60 * 1000;
				case 'd':
					return $num * 24 * 60 * 60 * 1000;
				case 'w':
					return $num * 7 * 24 * 60 * 60 * 1000;
				case 'y':
					return $num * 365 * 24 * 60 * 60 * 1000;
			}
		}

		throw new TinyPassException("Cannot parse the specified period: " . $period);
	}

	public static function now(){
		return time();
	}

}
?>
