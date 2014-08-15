<?php

class TPRID {

	private $id;

	function __construct($id = null) {
		$this->id = $id;
	}

	public function getID() {
		return $this->id;
	}

	public function __toString() {
		return $this->id;
	}

	public function toString() {
		return $this->id;
	}

	public static function parse($s) {
		if(is_numeric($s)) {
			return new TPRID("" . $s);
		} else if(is_string($s)) {
			return new TPRID($s);
		} else if(is_a($s, 'TPRID')) {
			return $s;
		} else {
			return "";
		}
	}

}

?>