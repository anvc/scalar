<?php

class TPTokenData {

	protected $map = array();

	const MARK_YEAR_MILLIS = 1293858000000;

	const METER_REMINDER = 10;
	const METER_STRICT = 20;

	const METER_TRIAL_ENDTIME = "mtet";
	const METER_TRIAL_ACCESS_PERIOD = "mtap";

	const METER_LOCKOUT_ENDTIME = "mlet";
	const METER_LOCKOUT_PERIOD = "mlp";

	const METER_TRIAL_MAX_ACCESS_ATTEMPTS = "mtma";
	const METER_TRIAL_ACCESS_ATTEMPTS = "mtaa";
	const METER_TYPE = "mt";

	//V2-CHANGE public ID field (12 char string)
	const ACCESS_ID = "id";

	const RID = "rid";
	const UID = "uid";
	const EX = "ex";
	const EARLY_EX = "eex";
	const CREATED_TIME = "ct";
	const IPS = "ips";


	public function __construct($rid = null) {
		if($rid && is_a($rid, 'TPRID')) {
			$this->map[TPTokenData::RID] = $rid->toString();
		} else if(is_string($rid)) {
			$this->map[TPTokenData::RID] = $rid;
		}
	}

	public function getRID() {
		return $this->map[TPTokenData::RID];
	}

	public function addField($s, $o) {
		$this->map[$s] = $o;
	}

	public function addFields($map) {
		$this->map = array_merge($this->map, $map);
	}

	public function getField($s) {
		return $this->map[$s];
	}

	public function getValues() {
		return $this->map;
	}

	public function size() {
		return count($this->map);
	}

	public function getFromMap($key, $defaultValue) {
		if (!array_key_exists($key, $this->map))
			return $defaultValue;
		return $this->map[$key];
	}

	public static function convertToEpochSeconds($time) {
		if ($time > TPTokenData::MARK_YEAR_MILLIS)
			return $time / 1000;
		return $time;
	}

}

?>
