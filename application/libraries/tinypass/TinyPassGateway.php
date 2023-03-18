<?php

/**
 * TinyPassGateway
 */
class TinyPassGateway {

	private $config;

	public function __construct($config = null) {
		if(!$config)
			$config = TinyPass::config();

		$this->config = $config;
	}

	public static function cancelSubscription($params) {
		$gw = new TinyPassGateway();
		try {
			return $gw->call("POST", TPConfig::$REST_CONTEXT . "/subscription/cancel", $params);
		} catch(Exception $e) {
			throw $e;
		}
	}

	public static function fetchSubscriptionDetails($params) {
		$gw = new TinyPassGateway();
		try {
			return $gw->call("GET", TPConfig::$REST_CONTEXT . "/subscription/search", $params);
		} catch(Exception $e) {
			throw $e;
		}
	}

	public static function grantAccess($params) {
		$gw = new TinyPassGateway();
		try {
			return $gw->call("POST", TPConfig::$REST_CONTEXT . "/access/grant", $params);
		} catch(Exception $e) {
			throw $e;
		}
	}

	public static function revokeAccess($params) {
		$gw = new TinyPassGateway();
		try {
			return $gw->call("POST", TPConfig::$REST_CONTEXT . "/access/revoke", $params);
		} catch(Exception $e) {
			throw $e;
		}
	}

	public static function fetchAccessDetail($params) {
		$gw = new TinyPassGateway();
		try {
			return $gw->call("GET", TPConfig::$REST_CONTEXT . "/access", $params);
		} catch(Exception $e) {
			if($e->getCode() == 404)
				return null;
			throw $e;
		}
	}

	public static function fetchAccessDetails($params, $page = 0, $pagesize = 500) {
		$gw = new TinyPassGateway();
		if(is_array($params)) {
			$params['page'] = $page;
			$params['pagesize'] = $pagesize;
		}
		return $gw->call("GET", TPConfig::$REST_CONTEXT . "/access/search", $params);
	}

	public static function fetchDownload($params) {
		$gw = new TinyPassGateway();
		try {
			return $gw->call("GET", TPConfig::$REST_CONTEXT . "/download", $params);
		} catch (Exception $e) {
			if ($e->getCode() == 404)
				return null;
			throw $e;
		}
	}

	public static function fetchUser($uid) {
		$gw = new TinyPassGateway();
		try {
			return $gw->call("GET", TPConfig::$REST_CONTEXT . "/user/" . $uid, array());
		} catch (Exception $e) {
			if ($e->getCode() == 404)
				return null;
			throw $e;
		}
	}
	
	public static function generateDownloadURL($params) {
		$gw = new TinyPassGateway();
		try {
			return $gw->call("GET", TPConfig::$REST_CONTEXT . "/download/url", $params);
		} catch (Exception $e) {
			if ($e->getCode() == 404)
				return null;
			throw $e;
		}
	}
	public function call($method, $action, $query) {


		$signature = $this->buildSignature($method, $action, $query);
		$header = array("authorization: " . $signature);

		$url = $this->config->getEndPoint() . $this->buildURL($method, $action, $query);

		$ch = curl_init();

		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_setopt($ch, CURLOPT_VERBOSE, 0);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

		if(strtolower($method) == "get") {
			curl_setopt($ch, CURLOPT_URL, $url);
		} else {
			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_POST, 0);
			curl_setopt($ch, CURLOPT_POSTFIELDS, "");
		}

		$response = curl_exec($ch);
		$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

		$json = json_decode($response, 1);

		if($httpcode != 200) {
			if(isset($json["error"])) {
				$message = $json["error"]['message'];
				throw new Exception("API error($httpcode):" . $message, $httpcode);
			} else {
				throw new Exception("API error($httpcode):");
			}
		} else {
			return $json;
		}
	}

	public function buildURL($method, $action, $query) {
		if(is_array($query))
			$query = http_build_query($query);

		return $action . (($query != null && strlen($query) > 0) ? "?" . $query : "");
	}

	public function buildSignature($method, $action, $query) {
		$aq = $this->buildURL($method, $action, $query);
		$signStr = ($this->config->AID . ":" . TPSecurityUtils::hashHmacSha($this->config->PRIVATE_KEY, $method . " " . $aq));
		return $signStr;
	}

}

?>
