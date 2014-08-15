<?php

class TPPolicy {

	const DISCOUNT_TOTAL_IN_PERIOD = "d1";
	const DISCOUNT_PREVIOUS_PURCHASE = "d2";
	const STRICT_METER_BY_TIME = "sm1";
	const REMINDER_METER_BY_TIME = "rm1";
	const REMINDER_METER_BY_COUNT = "rm2";
	const RESTRICT_MAX_PURCHASES = "r1";

	const POLICY_TYPE = "type";

	private $map = array();

	public function set($key, $value) {
		$this->map[$key] = $value;
		return $this;
	}

	public function toMap() {
		return $this->map;
	}
}


class TPPricingPolicy {

	public static function createBasic(array $priceOptions = null) {
		if($priceOptions == null)
				$priceOptions = array();
		return new TPBasicPricing($priceOptions);
	}
}

class TPBasicPricing extends TPPolicy {
	private $pos = array();

	public function __construct(array $pos) {
		$this->pos = array_merge($this->pos, $pos);
	}

	public function getPriceOptions() {
		return $this->pos;
	}

	public function addPriceOption($po) {
		$this->pos[] = $po;
		return $this;
	}

	public function hasActiveOptions() {
		if ($this->pos != null) {
			foreach ($this->pos as $po ) {
				if ($po->isActive(time()))
					return true;
			}
		}
		return false;
	}
}


?>