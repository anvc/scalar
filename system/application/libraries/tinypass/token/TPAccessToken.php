<?php

/**
 * Requires PHP 5.2 or later (5.2.17 or 5.3.5 highly recommended) with the following extensions:

 * SimpleXML
 * JSON
 * PCRE
 * SPL
 * cURL with HTTPS support
 */
class TPAccessToken {

	private $token;
	private $accessState;

	public function __construct() {

		$numargs = func_num_args();
		$this->token = new TPTokenData();

		if($numargs == 1 && func_get_arg(0) instanceof TPTokenData) {
			$this->token = func_get_arg(0);
			return;
		}

		if($numargs == 1 && func_get_arg(0) instanceof TPRID) {
			$rid = TPRID::parse(func_get_arg(0));
			$this->token->addField(TPTokenData::RID,$rid->toString());
			return;
		}

		if($numargs == 2) {
			$rid = TPRID::parse(func_get_arg(0));
			$expiration = func_get_arg(1);
			$this->token->addField(TPTokenData::RID,$rid->toString());
			$this->token->addField(TPTokenData::EX, $expiration != null ? TPTokenData::convertToEpochSeconds($expiration) : 0);
			return;
		}

		if($numargs == 3) {
			$rid = TPRID::parse(func_get_arg(0));
			$expiration = func_get_arg(1);
			$eex = func_get_arg(2);
			$this->token->addField(TPTokenData::RID,$rid->toString());
			$this->token->addField(TPTokenData::EX, $expiration != null ? TPTokenData::convertToEpochSeconds($expiration) : 0);
			$this->token->addField(TPTokenData::EARLY_EX, $eex != null ? TPTokenData::convertToEpochSeconds($eex) : 0);
			return;
		}


	}

	public function getTokenData() {
		return $this->token;
	}

	public function getAccessID() {
		return $this->token->getField(TPTokenData::ACCESS_ID);
	}

	public function getRID() {
		return new TPRID($this->token->getRID());
	}

	public function getExpirationInMillis() {
		return $this->getExpirationInSecs() * 1000;
	}

	public function getExpirationInSecs() {
		return $this->token->getFromMap(TPTokenData::EX, 0);
	}

	public function getExpirationInSeconds() {
		return $this->token->getFromMap(TPTokenData::EX, 0);
	}

	public function getEarlyExpirationInSecs() {
		return $this->token->getFromMap(TPTokenData::EARLY_EX, 0);
	}

	public function getEarlyExpirationInSeconds() {
		return $this->token->getFromMap(TPTokenData::EARLY_EX, 0);
	}

	public function getCreatedTimeInSecs() {
		return $this->token->getFromMap(TPTokenData::CREATED_TIME, 0);
	}

	public function isMetered() {
		return array_key_exists(TPTokenData::METER_TYPE, $this->token->getValues());
	}

	public function getMeterType() {
		return $this->token->getFromMap(TPTokenData::METER_TYPE, 0);
	}

	public function isTrialPeriodActive() {

		if($this->isMetered()) {

			if ($this->getMeterType() == TPTokenData::METER_STRICT) {

				$expires = $this->getTrialEndTimeSecs();
				if ($expires == null || $expires == 0)
					return false;
				return time() <= $expires;

			} else {

				if ($this->isMeterViewBased()) {
					return $this->getTrialViewCount() <= $this->getTrialViewLimit() && TPUtils::now() <= $this->getTrialEndTimeSecs();
				} else {
					$expires = $this->getTrialEndTimeSecs();
					if ($expires == null || $expires == 0)
						return true;
					return time() <= $expires;
				}

			}
		}
		return false;
	}

	public function isMeterViewBased() {
		return $this->isMetered() && array_key_exists(TPTokenData::METER_TRIAL_MAX_ACCESS_ATTEMPTS, $this->token->getValues());
	}

	public function isMeterPeriodBased() {
		return $this->isMetered() && !$this->isMeterViewBased();
	}

	public function isLockoutPeriodActive() {
		if($this->isMetered()) {
			$expires = $this->getLockoutEndTimeSecs();

			if ($this->isTrialPeriodActive())
				return false;

			if ($expires == null || $expires == 0)
				return false;

			return TPUtils::now() <= $expires;
		}
		return false;
	}

	public function _isTrialDead() {
		return $this->isLockoutPeriodActive() == false && $this->isTrialPeriodActive() == false;
	}

	public function getTrialEndTimeSecs() {
		return $this->token->getFromMap(TPTokenData::METER_TRIAL_ENDTIME, 0);
	}

	public function getLockoutEndTimeSecs() {
		return $this->token->getFromMap(TPTokenData::METER_LOCKOUT_ENDTIME, 0);
	}

	public function getTrialViewCount() {
		return $this->token->getFromMap(TPTokenData::METER_TRIAL_ACCESS_ATTEMPTS, 0);
	}

	public function getTrialViewLimit() {
		return $this->token->getFromMap(TPTokenData::METER_TRIAL_MAX_ACCESS_ATTEMPTS, 0);
	}

	public function getUID() {
		return $this->token->getFromMap(TPTokenData::UID, 0);
	}

	public function containsIP($currentIP) {
		$list = $this->token->getFromMap(TPTokenData::IPS, null);
		if($list == null) return false;
		return in_array(TPUtils::shortenIP($currentIP), $this->token->getField(TPTokenData::IPS));
	}

	public function hasIPs() {
		if($this->token->getFromMap(TPTokenData::IPS, null) == null) return false;
		return count($this->getIPs()) > 0;
	}

	public function getIPs() {
		$list = $this->token->getFromMap(TPTokenData::IPS, null);
		$res = array();
		if($list==null) return $res;
		foreach($list as $ip) {
			$res[] = TPUtils::unshortenIP($ip);
		}
		return $res;
	}


	/**
	 * Access checking functions
	 */

	public function isExpired() {
		$time = $this->getEarlyExpirationInSeconds();

		if ($time == null || $time == 0)
			$time = $this->getExpirationInSecs();

		if ($time == null || $time == 0)
			return false;

		return $time <= time();
	}
	public function isAccessGranted($clientIP = null) {
		if($this->getExpirationInSecs() == -1) {
			//special case. RID_NOT_FOUND
			if($this->accessState!=TPAccessState::NO_TOKENS_FOUND) $this->accessState = TPAccessState::RID_NOT_FOUND;
			return false;
		}

		if(TPUtils::isIpValid($clientIP) && $this->hasIPs() && !$this->containsIP($clientIP)) {
			$this->accessState = TPAccessState::CLIENT_IP_DOES_NOT_MATCH_TOKEN;
			return false;
		}

		if ($this->isMetered()) {
			if ($this->isTrialPeriodActive()) {
				$this->accessState = TPAccessState::METERED_IN_TRIAL;
				return true;
			} else if ($this->isLockoutPeriodActive()) {
				$this->accessState = TPAccessState::METERED_IN_LOCKOUT;
				return false;
			} else {
				$this->accessState = TPAccessState::METERED_TRIAL_DEAD;
				return false;
			}
		} else if ($this->isExpired()) {
			$this->accessState = TPAccessState::EXPIRED;
			return false;
		} else {
			$this->accessState = TPAccessState::ACCESS_GRANTED;
			return true;
		}
	}


//V2-CHANGE moved from TinyPass class
	public function setAccessState($accessState) {
		$this->accessState = $accessState;
	}
	public function getAccessState() {
		if($this->accessState==null) $this->isAccessGranted();
		return $this->accessState;
	}






}


class TPAccessState {

	const ACCESS_GRANTED = 100;
	const CLIENT_IP_DOES_NOT_MATCH_TOKEN = 200;
	const RID_NOT_FOUND = 201;
	const NO_TOKENS_FOUND = 202;
	const METERED_IN_TRIAL = 203;
	const EXPIRED = 204;
	const NO_ACTIVE_PRICES = 205;
	const METERED_IN_LOCKOUT = 206;
	const METERED_TRIAL_DEAD = 207;


}
?>