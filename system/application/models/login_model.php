<?php
/**
 * Scalar
 * Copyright 2013 The Alliance for Networking Visual Culture.
 * http://scalar.usc.edu/scalar
 * Alliance4NVC@gmail.com
 *
 * Licensed under the Educational Community License, Version 2.0
 * (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

class Login_model extends User_model {

	protected $login_basename = null;

    public function __construct() {

        parent::__construct();

        $this->login_basename = confirm_slash(base_url());

    }

    public function get() {

		// Check session
		$data = $this->session->userdata($this->login_basename);
		if (!empty($data) && $data['is_logged_in']) {
			$result = new stdClass;
			$user_id = (int) $data['user_id'];
			$result = $this->get_by_user_id($user_id);
			$result->is_logged_in = true;
			$result->error = null;
			$this->session->set_userdata(array($this->login_basename => (array) $result));
			return (object) $data;
		}

		// Return empty

		$data = new stdClass;
		$data->is_logged_in = false;
		$data->error = null;
		$this->session->set_userdata(array($this->login_basename => (array) $data));
		return (object) $data;

    }

    public function do_logout($force=false) {

    	// Run user logout (if applicable)

    	$action = (isset($_REQUEST['action'])) ? $_REQUEST['action'] : null;
    	if ($force || $action == 'do_logout') {
    		$this->session->unset_userdata($this->login_basename);
			return true;
    	}

    	return false;

    }

	public function do_login($force=false) {

		$action = (isset($_REQUEST['action'])) ? $_REQUEST['action'] : null;
		if ($force || $action == 'do_login') {

			$email = trim($_POST['email']);
			$password = trim($_POST['password']);

			if ($this->has_empty_password($email)) {
				$result = $this->get_by_email($email);
			} else {
				$result = $this->get_by_email_and_password($email, $password);
			}

			if (!$result) {
				$result = new stdClass;
				$result->is_logged_in = false;
				$result->books = array();
				$this->session->set_userdata(array($this->login_basename => (array) $result));
				throw new Exception( lang('login.invalid') );
			} else {
				if (!empty($result->reset_string)) {
					throw new Exception( lang('login.is_reset') );
				}
				$result->is_logged_in = true;
				$this->session->set_userdata(array($this->login_basename => (array) $result));
				return true;
			}

		}

		return false;

	}

	public function has_empty_password($email='') {

		if (empty($email)) {
			$data = $this->session->userdata($this->login_basename);
			if (isset($data['password']) && empty($data['password'])) return true;
			return false;
		}

		return parent::has_empty_password($email);

	}

}
?>
