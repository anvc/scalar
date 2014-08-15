<?php

class TPAccessTokenStore {

	protected $config;
	protected $tokens;
	protected $rawCookie;

	public function __construct($config = null) {
		$this->config = TinyPass::config();
		if($config)
			$this->config = $config;
		$this->tokens = new TPAccessTokenList();
	}

	public function getAccessToken($rid) {

		$token = $this->tokens->getAccessTokenByRID($rid);

		if($token != null)
			return $token;

		$token = new TPAccessToken(new TPRID($rid));
		$token->getTokenData()->addField(TPTokenData::EX, -1);

		if($token->getAccessState() == null) {
			if($tokens->size() == 0) {
				$token->setAccessState(TPAccessState::NO_TOKENS_FOUND);
			} else {
				$token->setAccessState(AccessState::RID_NOT_FOUND);
			}
		}

		return $token;
	}

	public function loadTokensFromCookie($cookies, $cookieName = null) {

		if($cookieName == null) {
			$cookieName = TPConfig::getAppPrefix($this->config->AID) . TPConfig::$COOKIE_SUFFIX;
		}

		$unparsedTokenValue = '';
		if(is_array($cookies)) {
			foreach($cookies as $name => $value) {
				if($name == $cookieName) {
					$unparsedTokenValue = $value;
					break;
				}
			}
		} else {
			$unparsedTokenValue = $cookies;
		}

		$this->rawCookie = $unparsedTokenValue;

		if($unparsedTokenValue != null) {
			$parser = new TPClientParser();
			$this->tokens = $parser->parseAccessTokens(urldecode($unparsedTokenValue));
		}
	}

	public function getTokens() {
		return $this->tokens;
	}

	public function hasToken($rid) {
		return $this->tokens->getAccessTokenByRID($rid);
	}

	public function getRawToken() {
		return "";
	}

	protected function _cleanExpiredTokens() {
		$tokens = $this->tokens->getTokens();

		foreach($tokens as $rid => $token) {

			if($token->isMetered() && $token->_isTrialDead()) {
				$this->tokens->remove($rid);
			} else if($token->isExpired()) {
				$this->tokens->remove($rid);
			}
		}
	}

	public function findActiveToken($regexp) {
		$tokens = $this->tokens->getTokens();

		foreach($tokens as $rid => $token) {
			if(preg_match($regexp, $rid)) {
				if($token->isExpired() == false)
					return $token;
			}
		}
		return null;
	}

	public function getUID() {
		$tokens = $this->tokens->getTokens();
		foreach ($tokens as $rid => $token) {
			return $token->getUID();
		}
		return null;
	}

}

?>