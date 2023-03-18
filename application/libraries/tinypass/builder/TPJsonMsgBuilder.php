<?php

class TPJsonMsgBuilder {

	public function parseAccessTokens($raw) {

		if($raw == null || $raw == "")
			return null;

		$json = (array) json_decode($raw);
		$accessTokenList = array();

		if(!is_array($json)) {
			$tokenMap = $json;
			$ridHash = TPRIDHash::parse($tokenMap[TPTokenData::RID]);
			$token = $this->parseAccessToken($ridHash, $tokenMap);
			$accessToken = new TPAccessToken($token);
			$accessTokenList[] = $accessToken;
		} else {
			try {
				//1.0 tokens cannot be parsed in this version
				if(isset($json['tokens']))
					return new TPAccessTokenList($accessTokenList);

				foreach($json as $tokenMap) {
					$tokenMap = (array) $tokenMap;

					if(isset($tokenMap['rid']) == false)
						continue;

					if(array_key_exists('rid', $tokenMap) && $tokenMap['rid'] == '')
						continue;

					$rid = TPRID::parse($tokenMap[TPTokenData::RID]);
					$token = $this->parseAccessToken($rid->toString(), $tokenMap);
					$accessToken = new TPAccessToken($token);
					$accessTokenList[] = $accessToken;
				}
			} catch(Exception $e) {
				return new TPAccessTokenList($accessTokenList);
			}
		}

		return new TPAccessTokenList($accessTokenList);
	}

	private function parseAccessToken($rid, $map) {

		$token = new TPTokenData($rid);

		$fields = array(
				TPTokenData::ACCESS_ID,
				TPTokenData::EX,
				TPTokenData::IPS,
				TPTokenData::UID,
				TPTokenData::EARLY_EX,
				TPTokenData::CREATED_TIME,
				TPTokenData::METER_TRIAL_ENDTIME,
				TPTokenData::METER_LOCKOUT_PERIOD,
				TPTokenData::METER_LOCKOUT_ENDTIME,
				TPTokenData::METER_TRIAL_ACCESS_ATTEMPTS,
				TPTokenData::METER_TRIAL_MAX_ACCESS_ATTEMPTS,
				TPTokenData::METER_TYPE,
		);


		foreach($fields as $f) {
			if(isset($map[$f]))
				$token->addField($f, $map[$f]);
		}


		return $token;
	}

	public function buildPurchaseRequest(array $requestData) {
		$list = array();

		foreach($requestData as $request) {
			$list[] = $this->buildRequest($request);
		}

		return json_encode($list);
	}

	public function buildRequest(TPPurchaseRequest $request) {

		$ticketMap = array();

		$ticketMap["o1"] = $this->buildOffer($request->getPrimaryOffer());
		$ticketMap["t"] = TPUtils::now();
		$ticketMap["v"] = TPConfig::$MSG_VERSION;
		$ticketMap["cb"] = $request->getCallback();

		if($request->getClientIP())
			$ticketMap["ip"] = $request->getClientIP();

		if($request->getUserRef() != null)
			$ticketMap["uref"] = $request->getUserRef();

		if($request->getOptions() != null && count($request->getOptions()) > 0)
			$ticketMap["opts"] = $request->getOptions();

		if($request->getSecondaryOffer() != null) {
			$ticketMap["o2"] = $this->buildOffer($request->getSecondaryOffer());
		}


		return $ticketMap;
	}

	private function buildOffer(TPOffer $offer, $options = array()) {

		$map = array();
		$map["rid"] = $offer->getResource()->getRID();
		$map["rnm"] = $offer->getResource()->getName();
		$map["rurl"] = $offer->getResource()->getURL();

		if($offer->getTags())
			$map["tags"] = $offer->getTags();

		$pos = array();
		$priceOptions = $offer->getPricing()->getPriceOptions();
		for($i = 0; $i < count($priceOptions); $i++)
			$pos["opt" . ($i)] = $this->buildPriceOption($priceOptions[$i], $i);
		$map["pos"] = $pos;

		$pol = array();
		$policies = $offer->getPolicies();
		foreach($policies as $policy) {
			$pol[] = $policy->toMap();
		}
		$map["pol"] = $pol;

		return $map;
	}

	public function buildAccessTokens(TPAccessTokenList $list) {
		$tokens = array();

		foreach($list->getTokens() as $token) {
			$tokens[] = $token->getTokenData()->getValues();
		}
		return json_encode($tokens);
	}

	public function buildAccessToken($accessToken) {
		return json_encode($accessToken->getTokenData()->getValues());
	}

	private function nuller($value) {
		return $value != null ? $value : "";
	}

	private function buildPriceOption(TPPriceOption $po, $index) {
		$map = array();
		$map["price"] = $this->nuller($po->getPrice());
		$map["exp"] = $this->nuller($po->getAccessPeriod());

		if($po->getStartDateInSecs() != null && $po->getStartDateInSecs() != 0)
			$map["sd"] = $this->nuller($po->getStartDateInSecs());

		if($po->getEndDateInSecs() != null && $po->getEndDateInSecs() != 0)
			$map["ed"] = $this->nuller($po->getEndDateInSecs());

		$map["cpt"] = $this->nuller($po->getCaption());

		if(count($po->getSplitPays()) > 0) {
			$splits = array();
			foreach($po->getSplitPays() as $email => $amount) {
				array_push($splits, "$email=$amount");
			}
			$map["splits"] = $splits;
		}
		return $map;
	}

}

?>
