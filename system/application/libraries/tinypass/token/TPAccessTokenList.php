<?php

class TPAccessTokenList {

	public static $MAX = 20;
	private $tokens = array();

	function __construct(array $tokens = null) {
		if ($tokens) {
			foreach ($tokens as $token) {
				$this->add($token, false);
			}
		}
	}

	public function getAccessTokens() {
		return $this->tokens;
	}

	public function getTokens() {
		return $this->tokens;
	}

	public function contains($rid) {
		$rid = TPRID::parse($rid);
		return array_key_exists($rid->toString(), $this->tokens);
	}

	public function remove($rid) {
		$rid = TPRID::parse($rid);
		unset($this->tokens[$rid->toString()]);
	}

	public function add(TPAccessToken $token, $checkLimit = true) {
		if ($checkLimit && count($this->tokens) >= TPAccessTokenList::$MAX) {
			array_pop($this->tokens);
		}
		$this->tokens[$token->getRID()->getID()] = $token;
	}

	public function addAll($tokens) {
		foreach ($tokens as $token) {
			$this->add($token);
		}
	}

	/**
	 *
	 * @param <String> $rid String RID
	 */
	public function getAccessTokenByRID($rid) {
		$rid = TPRID::parse($rid);
		if ($this->contains($rid)) {
			return $this->tokens[$rid->getID()];
		}
		return null;
	}

	public function isEmpty() {
		return $this->tokens == null || count($this->tokens) == 0;
	}

	public function size() {
		return count($this->tokens);
	}

	public function first() {
		foreach ($this->tokens as $key => $value)
			return $value;
	}

}

?>