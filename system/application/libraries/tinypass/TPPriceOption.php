<?php


require_once 'TinyPassException.php';

class TPPriceOption {

	protected $price;
	protected $accessPeriod;
	protected $startDateInSecs;
	protected $endDateInSecs;
	protected $caption;
	protected $trialPeriod;
	protected $recurring = false;

	protected $splitPay = array();


	public function __construct($price = null, $acessPeriod = null, $startDateInSecs = null, $endDateInSecs = null) {
		$this->setPrice($price);
		$this->accessPeriod = $acessPeriod;
		if($startDateInSecs)
			$this->startDateInSecs = TPTokenData::convertToEpochSeconds($startDateInSecs);
		if($endDateInSecs)
			$this->endDateInSecs = TPTokenData::convertToEpochSeconds($endDateInSecs);
	}

	public function getPrice() {
		return $this->price;
	}

	public function setPrice($price) {
		$this->price = $price;
		return $this;
	}

	public function getAccessPeriod() {
		return $this->accessPeriod;
	}

	public function getAccessPeriodInMsecs() {
		return TPUtils::parseLoosePeriodInMsecs($this->accessPeriod);
	}

	public function getAccessPeriodInSecs() {
		return $this->getAccessPeriodInMsecs() / 1000;
	}

	public function setAccessPeriod($expires) {
		$this->accessPeriod = $expires;
		return $this;
	}

	public function getStartDateInSecs() {
		return $this->startDateInSecs;
	}

	public function setStartDateInSecs($startDateInSecs) {
		$this->startDateInSecs = $startDateInSecs;
		return $this;
	}

	public function getEndDateInSecs() {
		return $this->endDateInSecs;
	}

	public function setEndDateInSecs($endDate) {
		$this->endDateInSecs = $endDate;
		return $this;
	}

	public function addSplitPay($email, $amount) {
		if(preg_match('/%$/', $amount)) {
			$amount = (double)substr($amount, 0, strlen($amount)-1);
			$amount = $amount / 100.0;
		}
		$this->splitPay[$email] = $amount;
		return $this;
	}

	public function getSplitPays() {
		return $this->splitPay;
	}

	public function getCaption() {
		return $this->caption;
	}

	public function setCaption($caption) {
		if($caption!=null && strlen($caption) > 50)
			$caption = substr($caption, 0, 50);
		$this->caption = $caption;
		return $this;
	}

	public function isActive($timestampSecs) {
		$timestampSecs = TPTokenData::convertToEpochSeconds($timestampSecs);
		if ($this->getStartDateInSecs() != null && $this->getStartDateInSecs() > $timestampSecs) return false;
		if ($this->getEndDateInSecs() != null && $this->getEndDateInSecs() < $timestampSecs) return false;
		return true;
	}

	public function __toString() {
		$sb = "";
		$sb.("Price:").($this->getPrice());
		$sb.("\tPeriod:").($this->getAccessPeriod());
		$sb.("\tTrial Period:").($this->getAccessPeriod());

		if ($this->getStartDateInSecs() != null) {
			$sb.("\tStart:").($this->getStartDateInSecs()).(":").( date('D, d M Y H:i:s' , $this->getStartDateInSecs()));
		}

		if ($this->getEndDateInSecs() != null) {
			$sb.("\tEnd:").($this->getEndDateInSecs()).(":").(date('D, d M Y H:i:s', $this->getEndDateInSecs()));
		}

		if ($this->getCaption() != null) {
			$sb.("\tCaption:").($this->getCaption());
		}

		if ($this->splitPay != null) {
			foreach ($this->splitPay as $key => $value)
				$sb.("\tSplit:").($key).(":").($value);
		}

		return $sb;
	}

}
?>