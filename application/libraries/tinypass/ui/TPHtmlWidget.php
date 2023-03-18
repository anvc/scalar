<?php

class TPHtmlWidget {


	private $config;

	public function __construct($config = null) {
		if(!$config)
			$config = TinyPass::config();
	
		$this->config = $config;

	}

	public function createButtonHTML($request) {

		$options = $request->getOptions();
		$rid = $request->getPrimaryOffer()->getResource()->getRID();
		$builder = new TPClientBuilder();
		$rdata = $builder->buildPurchaseRequest($request);

		$sb = "";

		$sb.=("<tp:request type=\"purchase\" ");

		$sb.=("rid=\"").($rid).("\"");

		$sb.=(" url=\"").($this->config->getEndPoint()).(TPConfig::$CONTEXT).("\"");
		$sb.=(" rdata=\"").(preg_replace('/"/', '\"', $rdata)).("\"");
		$sb.=(" aid=\"").($this->config->AID).("\"");
		$sb.=(" cn=\"").(TPConfig::getTokenCookieName($this->config->AID)).("\"");
		$sb.=(" v=\"").(TPConfig::$VERSION).("\"");

		if ($request->getCallback())
			$sb.=(" oncheckaccess=\"").($request->getCallback()).("\"");

		if ($options != null) {

			if (isset($options["button.html"])) {
				$sb.=(" custom=\"").(preg_replace('/"/', '&quot;', $options["button.html"])).("\"");
			} elseif (isset($options["button.link"])) {
				$sb.=(" link=\"").(preg_replace('/"/', '&quot;', $options["button.link"])).("\"");
			}

		}

		$sb.=(">");
		$sb.=("</tp:request>");

		return $sb;
	}

}
?>
