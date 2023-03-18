<?php

class TPClientBuilder {

	const TYPE_JSON = 'j';

	const ENCODING_AES = 'a';
	const ENCODING_OPEN = 'o';

	const STD_ENC = "{jax}";
	const ZIP_ENC = "{jzx}";
	const OPEN_ENC = "{jox}";

	private $builder;
	private $encoder;

	private $privateKey;

	private $mask = "";

	function __construct($settings = null) {
		$this->privateKey = TinyPass::$PRIVATE_KEY;
		$this->mask.=("{");
		switch ($settings!=null && strlen($settings)>1 ? $settings{1} : self::TYPE_JSON) {
			case self::TYPE_JSON:
			default:
				$this->builder = new TPJsonMsgBuilder();
				$this->mask.=(self::TYPE_JSON);
		}
		switch ($settings!=null && strlen($settings)>2 ? $settings{2} : self::ENCODING_AES) {
			case self::ENCODING_OPEN:
				$this->encoder = new TPOpenEncoder();
				$this->mask.=(self::ENCODING_OPEN);
				break;
			case self::ENCODING_AES:
			default:
				$this->encoder = new TPSecureEncoder($this->privateKey);
				$this->mask.=(self::ENCODING_AES);
		}
		$this->mask.=("x");
		$this->mask.=("}");
	}

	/**
	 *
	 * @param <type> $tokens - can be a TPAccessTokne or TPAccessTokenList
	 * @return <type>
	 */
	public function buildAccessTokens($tokens) {

		if($tokens instanceof TPAccessToken) {
//			$tokens = array($tokens);
			$tokens = new TPAccessTokenList(array($tokens));
		}

		return $this->mask . $this->encoder->encode($this->builder->buildAccessTokens($tokens));
	}

	public function buildPurchaseRequest($requests) {

		if($requests instanceof TPPurchaseRequest) {
			$requests = array($requests);
		}

		return $this->mask . $this->encoder->encode($this->builder->buildPurchaseRequest($requests));
	}

}

?>