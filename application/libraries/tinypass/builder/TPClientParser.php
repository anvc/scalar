<?php

class TPClientParser {

	private $parser;
	private $encoder;

	const DATA_BLOCK_START_SIGNATURE = '/[{]\w\w\w[}]/';
	private $config;

	function __construct() {
		$this->config = TinyPass::config();
	}

	public function parseAccessTokens($message) {
		$tokens = array();
		$blocks = $this->splitMessageString($message);
		foreach($blocks as $block) {
			$s = $this->setupImpls($block);
			$list = $this->parser->parseAccessTokens($this->encoder->decode($s));
			$tokens  = array_merge($tokens, $list->getTokens());
		}
		return new TPAccessTokenList($tokens);
	}

	function splitMessageString($message) {
		$list = array();
		$start = -1;

		$matches  = array();
		preg_match_all(TPClientParser::DATA_BLOCK_START_SIGNATURE, $message, $matches, PREG_OFFSET_CAPTURE);

		if(count($matches) == 0)
			return $list;

		$matches = $matches[0];


		foreach($matches as $match) {
			if($start >= 0) {
				$list[] = trim(substr($message, $start, ($match[1]-$start)));
			}
			$start = $match[1];
		}

		if($start >= 0) {
			$list[] = trim(substr($message, $start));
		}

		return $list;
	}


	private function setupImpls($str) {

		if(!$str)
			$str = TPClientBuilder::STD_ENC;

		switch (strlen($str)>1 ? $str{1} : TPClientBuilder::TYPE_JSON) {

			case TPClientBuilder::TYPE_JSON:
			default:
				$this->parser = new TPJsonMsgBuilder();

		}
		switch (strlen($str)>2 ? $str{2} : TPClientBuilder::ENCODING_AES) {

			case TPClientBuilder::ENCODING_OPEN:
				$this->encoder = new TPOpenEncoder();
				break;

			case TPClientBuilder::ENCODING_AES:
			default:
				$this->encoder = new TPSecureEncoder($this->config->PRIVATE_KEY);
		}
		return preg_replace('/^{...}/','', $str);
	}



}
?>