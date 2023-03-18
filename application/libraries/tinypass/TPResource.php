<?php

class TPResource {

	protected $rid;
	protected $rname;
	protected $url;

	function __construct($rid = null, $rname = null, $url = null) {
		$this->rid = $rid;
		$this->rname = $rname;
		$this->url = $url;
	}

	public function getRID() {
		return $this->rid;
	}

	public function setRID($rid) {
		$this->rid = $rid;
		return $this;
	}

	public function getRIDHash() {
		return new TPRIDHash($this->rid);
	}

	public function getName() {
		return $this->rname;
	}

	public function setName($rname) {
		$this->rname = $rname;
		return $this;
	}
	public function getURl() {
		return $this->url;
	}

	public function setURL($url) {
		$this->url = $url;
		return $this;
	}


}
