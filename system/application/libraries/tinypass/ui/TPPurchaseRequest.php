<?php

class TPPurchaseRequest {


	private $primaryOffer;
	private $secondaryOffer;
	private $options;
	private $userRef;
	private $ipAddress;
	private $callback;
	private $config;

	function __construct(TPOffer $offer, array $options = null) {
		$this->config = TinyPass::config();
		$this->primaryOffer = $offer;

		if($options == null)
			$options = array();

		$this->options = $options;

	}

	public function getPrimaryOffer() {
		return $this->primaryOffer;
	}

	public function getSecondaryOffer() {
		return $this->secondaryOffer;
	}

	public function setSecondaryOffer(TPOffer $offer = null) {
		$this->secondaryOffer = $offer;
		return $this;
	}

	public function getOptions() {
		return $this->options;
	}

	public function setOptions($options) {
		$this->options = $options;
	}

	public function setUserRef($userRef) {
		if (!$userRef) return $this;
		$userRef = trim($userRef);
		if (strlen($userRef) == 0) return $this;
		$this->userRef = $userRef;
		return $this;
	}

	public function getUserRef() {
		return $this->userRef;
	}


	public function enableIPTracking($userIPAddress) {
		if ($userIPAddress == null) return $this;
		$userIPAddress = trim($userIPAddress);
		if (strlen($userIPAddress) == 0) return $this;
		$this->ipAddress = $userIPAddress;
		return $this;
	}


	public function getClientIP() {
		return $this->ipAddress;
	}

	public function generateTag() {
		$widget = new TPHtmlWidget($this->config);
		return $widget->createButtonHTML($this);
	}

	public function setCallback($s) {
		$this->callback = $s;
		return $this;
	}

	public function getCallback() {
		return $this->callback;
	}


	public function generateLink($returnURL, $cancelURL = null) {
		if ($returnURL != null) $this->options["return_url"] = $returnURL;
		if ($cancelURL != null) $this->options["cancel_url"] = $cancelURL;

		$builder = new TPClientBuilder();
		$ticketString = $builder->buildPurchaseRequest($this);

		return $this->config->getEndPoint() . TPConfig::$CONTEXT . "/jsapi/auth.js?aid=" . $this->config->AID . "&r=" . $ticketString;
	}

}


?>
