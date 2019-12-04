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
	private $max_login_attempts = 0;
	private $max_login_attempts_penalty_seconds = 0;

    public function __construct() {

        parent::__construct();

        $this->login_basename = confirm_slash(base_url());
        $this->max_login_attempts = (int) $this->config->item('max_login_attempts');  // 0 = no restriction on login attempts
        $this->max_login_attempts_penalty_seconds = (int) $this->config->item('max_login_attempts_penalty_seconds');

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
			$result->uri = $_SERVER['REQUEST_URI'];
			$this->session->set_userdata(array($this->login_basename => (array) $result));
			return (object) $data;
		}

		// Return empty
		$data = new stdClass;
		$data->is_logged_in = false;
		$data->error = null;
		$data->uri = $_SERVER['REQUEST_URI'];
		$this->session->set_userdata(array($this->login_basename => (array) $data));
		return (object) $data;

    }

    public function do_logout($force=false) {

    	// Run user logout (if applicable)
    	$action = (isset($_REQUEST['action'])) ? $_REQUEST['action'] : null;
    	if ($force || $action == 'do_logout') {
    		if (isset($_REQUEST['redirect_url'])) {
    			$CI =& get_instance();
    			$CI->redirect_url($_REQUEST['redirect_url']);
    		}
    		$this->session->unset_userdata($this->login_basename);
			return true;
    	}

    	return false;

    }

	public function getUserIpAddr() {
	    if(!empty($_SERVER['HTTP_CLIENT_IP'])){
	        //ip from share internet
	        $ip = $_SERVER['HTTP_CLIENT_IP'];
	    }elseif(!empty($_SERVER['HTTP_X_FORWARDED_FOR'])){
	        //ip pass from proxy
	        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
	    }else{
	        $ip = $_SERVER['REMOTE_ADDR'];
	    }
	    return $ip;
	}

	public function do_login($force=false) {

		$action = (isset($_REQUEST['action'])) ? $_REQUEST['action'] : null;
		if ($force || $action == 'do_login') {

			$email = trim($_POST['email']);
			if (empty($email)) throw new Exception( lang('login.invalid') );
			log_message('error', 'Scalar: Login attempt by '.$email.', from '.$this->getUserIpAddr().'.');
			$password = trim($_POST['password']);
            $result = false;

            if (!$this->increment_and_check_login_attempts()) {
            	$this->session->unset_userdata($this->login_basename);
            	$msg = lang('login.attempts');
            	if (empty($msg)) $msg = 'Too many login attempts, try again in a few minutes';
            	throw new Exception($msg);
            }

            if ( $this->config->item('use_ldap') ) {  // LDAP
                $result = $this->get_from_ldap_by_email_and_password($email, $password);
            }

            if (!$result) {  // Database
                $result = $this->get_by_email_and_password($email, $password);
            }

			if (!$result) {
				$result = new stdClass;
				$result->is_logged_in = false;
				$result->books = array();
				$this->session->set_userdata(array($this->login_basename => (array) $result));
				throw new Exception( lang('login.invalid') );
			} else {
				parent::save_reset_string($result->user_id, '');  // Get rid of any reset string if the user successfully logs in
				$result->is_logged_in = true;
				$this->session->set_userdata(array($this->login_basename => (array) $result));
				$this->reset_login_attempts();
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

	private function increment_and_check_login_attempts() {

		// Is user on a penalty?
		$start = $this->session->userdata($this->login_basename.'__penalty_start');
		if (!empty($start)) {
			$diff = time() - $start;
			if ($diff < $this->max_login_attempts_penalty_seconds) return false;
			$this->session->unset_userdata($this->login_basename.'__penalty_start');
			$this->session->set_userdata($this->login_basename.'__login_attempts', 0);
		}
		// Max login attempts not set or deactivated
		if (0 === $this->max_login_attempts) return true;
		// Current attempt
		$attempt = (int) $this->session->userdata($this->login_basename.'__login_attempts');
		if (empty($attempt)) $attempt = 0;
		$attempt++;
		// User has hit the max attempts
		if ($attempt > $this->max_login_attempts) {
			$this->session->set_userdata($this->login_basename.'__penalty_start', time());
			$email = trim($_POST['email']);
			log_message('error', 'Scalar: User exceeded max login attempts for account '.$email.' ('.$this->getUserIpAddr().').');
			return false;
		}
		// Increment the number of attempts
		$this->session->set_userdata($this->login_basename.'__login_attempts', $attempt);
		return true;

	}

	private function reset_login_attempts() {

		$this->session->unset_userdata($this->login_basename.'__penalty_start');
		$this->session->unset_userdata($this->login_basename.'__login_attempts');

	}

}
?>
