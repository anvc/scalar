<?php


class TPClientMsgBuilder {

	private $builder;
	private $privateKey;

	function __construct($privateKey) {
		$this->privateKey = $privateKey;
		$this->builder = new TPClientBuilder($privateKey);
	}
	public function parseLocalTokenList($aid, array $cookies) {
		return $this->parseToken($aid, $cookies, TinyPass::$LOCAL_COOKIE_SUFFIX);
	}

	public function parseAccessTokenList($aid, array $cookies) {
		return $this->parseToken($aid, $cookies, TinyPass::$COOKIE_SUFFIX);
	}

	public function buildPurchaseRequest($tickets) {
		return $this->builder->buildPurchaseRequest($tickets);
	}

	public function buildAccessTokenList($tokentList) {
		return $this->builder->buildAccessTokenList($tokentList);
	}

	public function parseToken($aid, array $cookies, $cookieName) {
		if (($cookies == null) || (count($cookies) == 0)) return new TPAccessTokenList();
		$cookieName = TinyPass::getAppPrefix($aid) . $cookieName;
		$token = null;

		foreach ($cookies as $name => $value) {
			if ($name == $cookieName) {
				$token = $value;
				break;
			}
		}

		if($token == null)
			return new TPAccessTokenList($aid, null);

		$token = urldecode($token);

		if (($token != null) && (count($token) > 0)) {
			$parser = new TPClientParser($this->privateKey);
			$accessTokenList = $parser->parseAccessTokenList($token);
			$accessTokenList->setRawToken($token);
			return $accessTokenList;
		}

		return new TPAccessTokenList($aid, null);
	}




}
?>
