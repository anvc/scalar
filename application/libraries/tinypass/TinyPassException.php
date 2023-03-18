<?php

class TinyPassException extends Exception {

	public $code = 0;

	public function __construct($message, $code = 0) {
		parent::__construct($message);
		$this->code = 0;
	}


}

class TPTokenUnparseable extends Exception {

	public function __construct($message) {
		parent::__construct($message);
	}

}
?>
