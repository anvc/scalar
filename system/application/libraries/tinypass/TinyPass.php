<?php

require_once "policies/TPPolicy.php";
require_once "policies/Policies.php";
require_once "TPRIDHash.php";
require_once "TinyPassGateway.php";
require_once "TPResource.php";
require_once "TPOffer.php";
require_once "TinyPassException.php";
require_once "TPPriceOption.php";
require_once "TPUtils.php";
require_once "ui/TPPurchaseRequest.php";
require_once "ui/TPHtmlWidget.php";
require_once "TPClientMsgBuilder.php";
require_once "builder/TPClientBuilder.php";
require_once "builder/TPClientParser.php";
require_once "builder/TPCookieParser.php";
require_once "builder/TPSecureEncoder.php";
require_once "builder/TPOpenEncoder.php";
require_once "builder/TPJsonMsgBuilder.php";
require_once "builder/TPSecurityUtils.php";
require_once "token/TPAccessTokenStore.php";
require_once "token/TPMeterStore.php";
require_once "token/TPMeter.php";
require_once "token/TPAccessToken.php";
require_once "token/TPAccessTokenList.php";
require_once "token/TPTokenData.php";

class TinyPass {

	public static $API_ENDPOINT_PROD = "https://api.tinypass.com";
	public static $API_ENDPOINT_SANDBOX = "https://sandbox.tinypass.com";
	public static $API_ENDPOINT_DEV = "";

	public static $AID = "";
	public static $PRIVATE_KEY = "";
	public static $SANDBOX = false;

	public static $CONNECTION_TIMEOUT = 5000;
	public static $READ_TIMEOUT = 10000;

	public static function config($aid = null, $privateKey = null, $sandbox = null) {
		if($aid)
			return new TPConfig($aid, $privateKey, $sandbox);
		return new TPConfig(self::$AID, self::$PRIVATE_KEY, self::$SANDBOX);
	}

	public static function fetchAccessDetails($params, $page = 0, $pagesize = 500) {
		return TinyPassGateway::fetchAccessDetails($params);
	}

	public static function fetchAccessDetail($params) {
		return TinyPassGateway::fetchAccessDetail($params);
	}

	public static function grantAccess($params) {
		return TinyPassGateway::grantAccess($params);
	}

	public static function revokeAccess($params) {
		return TinyPassGateway::revokeAccess($params);
	}

	public static function cancelSubscription($params) {
		return TinyPassGateway::cancelSubscription($params);
	}

	public static function fetchSubscriptionDetails($params) {
		return TinyPassGateway::fetchSubscriptionDetails($params);
	}

	public static function fetchUserDetails($uid) {
		return TinyPassGateway::fetchUser($uid);
	}

	public static function fetchDownloadDetails($params) {
		return TinyPassGateway::fetchDownload($params);
	}

	public static function generateDownloadURL($params){
		return TinyPassGateway::generateDownloadURL($params);
	}

}

class TPConfig {

	public static $VERSION = "2.0.8";
	public static $MSG_VERSION = "2.0p";

	public static $CONTEXT = "/v2";
	public static $REST_CONTEXT = "/r2";

	public static $COOKIE_SUFFIX = "_TOKEN";
	public static $COOKIE_PREFIX = "__TP_";

	public $AID;
	public $PRIVATE_KEY;
	public $SANDBOX;

	public function __construct($aid, $privateKey, $sandbox) {
		$this->AID = $aid;
		$this->PRIVATE_KEY = $privateKey;
		$this->SANDBOX = $sandbox;
	}

	public function getEndPoint() {
		if(TinyPass::$API_ENDPOINT_DEV != null && strlen(TinyPass::$API_ENDPOINT_DEV) > 0) {
			return TinyPass::$API_ENDPOINT_DEV;
		} else if(TinyPass::$SANDBOX) {
			return TinyPass::$API_ENDPOINT_SANDBOX;
		} else {
			return TinyPass::$API_ENDPOINT_PROD;
		}
	}

	public static function getTokenCookieName($aid) {
		return self::$COOKIE_PREFIX . $aid . self::$COOKIE_SUFFIX;
	}

	public static function getAppPrefix($aid) {
		return "__TP_" . $aid;
	}

}

?>
