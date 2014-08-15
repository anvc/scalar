<?php


class TPOffer {

	private $resource;
	private $pricing;
	private $policies = array();
	private $tags = array();

	public function __construct(TPResource $resource, $priceOptions) {
		$this->resource = $resource;

		if($priceOptions instanceof TPBasicPricing) {
			$this->pricing = $priceOptions;
		} else {
			if(!is_array($priceOptions))
				$priceOptions = array($priceOptions);
			$this->pricing = TPPricingPolicy::createBasic($priceOptions);
		}
	
	}

	public function getResource() {
		return $this->resource;
	}

	public function getPricing() {
		return $this->pricing;
	}

	public function addPolicy($policy) {
		$this->policies[] = $policy;
		return $this;
	}

	public function getPolicies() {
		return $this->policies;
	}

	public function addPriceOption(TPPriceOption $priceOption) {
		$this->pricing->addPriceOption($priceOption);
	}

	public function addPriceOptions() {
		foreach(func_get_args() as $arg) {
			if($arg instanceof TPPriceOption)
				$this->pricing->addPriceOption($arg);
		}
	}

	public function hasActivePrices() {
		return $this->getPricing()->hasActiveOptions();
	}

	public function addTags($tags) {
		if(!is_array($tags)) {
			$tags = func_get_args();
		}
		$this->tags = array_merge($this->tags, $tags);
		return $this;
	}

	public function getTags() {
		return $this->tags;
	}



}
?>