<?php

class TPSecureEncoder {

	private $privateKey;

	function __construct($privateKey) {
		$this->privateKey = $privateKey;
	}

	public function encode($msg) {
		return TPSecurityUtils::encrypt($this->privateKey, $msg);
	}

	public function decode($msg) {
		return TPSecurityUtils::decrypt($this->privateKey, $msg);
	}
}

?>