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

/**
 * @projectDescription	Model for user database table
 * @author				Craig Dietrich
 * @version				2.2
 */

class User_model extends MY_Model {

	private $user_levels = array('author', 'editor', 'commentator', 'reviewer', 'reader');  // In order of level (top level first)

    public function __construct() {

        parent::__construct();

    }

  	public function rdf($row, $prefix='', $can_show_email=false) {

  		$row->type = 'http://xmlns.com/foaf/0.1/Person';
		if (isset($row->url) && !isset($row->homepage)) {
			$row->homepage = $row->url;
			unset($row->url);
		}
		if ($can_show_email && isset($row->email) && !isset($row->mbox)) {
			$row->mbox = $row->email;
		}
		if (isset($row->email) && !isset($row->mbox_sha1sum)) {
			$row->mbox_sha1sum = sha1('mailto:'.$row->email);
		}
  		return parent::rdf($row);

  	}

    public function get_all($book_id=0, $is_live=false, $orderby='fullname',$orderdir='asc',$total=null,$start=null) {

		$this->db->select('*');
		if (!empty($book_id)) {
			$this->db->from($this->user_book_table);
			$this->db->where($this->user_book_table.'.book_id', $book_id);
			$this->db->join($this->users_table, $this->users_table.'.user_id='.$this->user_book_table.'.user_id');
		} else {
			$this->db->from($this->users_table);
		}
    	$this->db->order_by($orderby, $orderdir);

        // add one to total so that paginated input can detect the end of list
        if(isset($total) && !isset($start)) {
            $this->db->limit($total+1);
            $query = $this->db->get();
        }
        elseif(isset($start)) {
            $temp1 = $this->db->get();
            $temp2 = count($temp1->result());
            if($temp2 <= $start)
                $start = $temp2 - (isset($total)? $temp2%$total:1);
            $temp3 = $this->db->last_query();
            if(isset($total))
                $temp3 .= ' LIMIT ' . $start . ', ' . ($total+1);
            else
                $temp3 .= ' OFFSET ' . $start;
            $query = $this->db->query($temp3);
        }
        else {
            $query = $this->db->get();
        }

    	$result = $query->result();
    	/*
    	for ($j = 0; $j < count($result); $j++) {
    		$result[$j]->books = $this->get_books($result[$j]->user_id);
    	}
    	*/
    	return $result;

    }

    public function get_book_users($book_id=0, $orderby='fullname',$orderdir='asc') {

		$this->db->select('*');
		$this->db->from($this->users_table);
		$this->db->join($this->user_book_table, $this->user_book_table.'.user_id='.$this->users_table.'.user_id');
		$this->db->where($this->user_book_table.'.book_id',$book_id);
    	$this->db->order_by($orderby, $orderdir);
    	$query = $this->db->get();
		$result = $query->result();
    	for ($j = 0; $j < count($result); $j++) {
    		$result[$j]->books = $this->get_books($result[$j]->user_id);
    	}
    	return $result;

    }

    public function is_a($user_level, $check_against) {

    	if (empty($user_level)) return false;
    	$user_level_int = array_search(strtolower($user_level), $this->user_levels);
    	$check_against_int = array_search(strtolower($check_against), $this->user_levels);
		if ($user_level_int > $check_against_int) return false;
		return true;

    }

    public function get_by_user_id($user_id='') {

    	$this->db->select('*');
    	$this->db->from($this->users_table);
    	$this->db->where('user_id', $user_id);
    	$query = $this->db->get();
    	if ($query->num_rows == 0) return false;
    	$result = $query->result();
    	return $result[0];

    }

    public function get_by_email($email='') {

    	$this->db->select('*');
    	$this->db->from($this->users_table);
    	$this->db->where('email', $email);
    	$query = $this->db->get();
    	if ($query->num_rows == 0) return false;
    	$result = $query->result();
    	return $result[0];

    }

    public function get_by_email_and_password($email='', $password='') {

    	$this->db->select('*');
    	$this->db->from($this->users_table);
    	$this->db->where('email', $email);
    	$this->db->where('password', $this->get_hash($password));
    	$query = $this->db->get();
    	if ($query->num_rows == 0) return false;
    	$result = $query->result();
    	return $result[0];

    }

    // Function to authenticate using an LDAP server.
    // The configuration for the LDAP server is in application/config/local_settings.php.
    // The use_ldap variable must be set to true for this to be used.
    public function get_from_ldap_by_email_and_password($email='', $password='') {
        // Users still use their e-mail address as their Scalar username when using this authentication method.
        // The LDAP username is assumed to be whatever comes before the '@' sign in the e-mail address.
        $atpos = strpos($email, '@');
        $uname = substr($email, 0, $atpos);

        $ldap_host = $this->config->item('ldap_server');
        $ldap_port = $this->config->item('ldap_port');
        $basedn = $this->config->item('ldap_basedn');
        $uname_field = $this->config->item('ldap_uname_field');
        $filter = $this->config->item('ldap_filter');
        $use_ad = $this->config->item('use_ad_ldap');
        $set_referrals = $this->config->item('set_ldap_referrals');
        $ad_bind_user = $this->config->item('ad_bind_user');
        $ad_bind_pass = $this->config->item('ad_bind_pass');

        if ( strlen(trim($password)) == 0 ) {
           return false;
        }

        $ldapCon = ldap_connect( $ldap_host, $ldap_port );
        if ( !$ldapCon) {
            throw new Exception("Unable to connect to LDAP server");
        }

        ldap_set_option($ldapCon, LDAP_OPT_PROTOCOL_VERSION, 3);

        if( $set_referrals !== null )
            ldap_set_option($ldapCon, LDAP_OPT_REFERRALS, (int) $set_referrals );

        if ( !ldap_start_tls($ldapCon) ) {
            throw new Exception('Unable to start TLS on LDAP connection');
        }

        if ( $use_ad === true ) {
            $ldapBind = ldap_bind($ldapCon, $ad_bind_user, $ad_bind_pass);
        }

        $ldapFilter = '(&(objectClass=user)(' . $uname_field . '=' . $uname . ')' . $filter . ')';

        $ldapSearch = ldap_search($ldapCon, $basedn, $ldapFilter);

        // Found the user, now check the password by trying to bind as that user
        $info = ldap_get_entries($ldapCon, $ldapSearch);
        if ( $info['count'] ) {
            $ldapBind = ldap_bind($ldapCon, $info[0]['dn'], $password);
            if ( $ldapBind ) {
                // Success, now that we've bound as that user we can look up the user's data
                $attributes = array("displayName", "cn", "description", "cn", "givenname", "sn", "mail");
                $ldapSearch = ldap_search( $ldapCon, $basedn, $ldapFilter, $attributes);
                $data = ldap_get_entries($ldapCon, $ldapSearch);
                $fullname = $data[0]['givenname'][0] . " " . $data[0]['sn'][0];
            } else {
                return false;
            }

        } else {
            return false;
        }

        // We were able to successfully bind -- great, but we need
        // to return a user object.  First we check if the user
        // is already in the database
        $user = $this->get_by_email($email);
        if (!$user) {
            // We didn't find them.
            // Create a new user in the database using LDAP information, but a random password,
            // since it shouldn't be using that password for an LDAP user.
            // I use the handy pwgen program for this, but there are plenty of other ways.
            $tmp_password = `pwgen -1`;
            $array = array('email' => $email, 'fullname' => $fullname, 'password' => $tmp_password);
            $this->add($array);
            // Now that they're added, this should work:
            $user = $this->get_by_email($email);
            if (!$user) {
                throw new Exception("Unable to fetch newly created LDAP user, apparently.  User creation must have failed.");
            }
        }
        return $user;
    }

    public function get_by_email_and_api($email='', $api=''){

    	$this->db->select('*');
    	$this->db->from($this->user_book_table);
    	$this->db->join($this->users_table, $this->users_table.'.user_id='.$this->user_book_table.'.user_id');
    	$this->db->where($this->users_table.'.email', $email);
    	$this->db->where($this->user_book_table.'.api_key', $api);
    	$query = $this->db->get();
    	if ($query->num_rows == 0) return false;
    	$result = $query->result();
    	return $result[0];

    }

    public function get_by_email_and_reset_string($email='', $reset_string='') {

    	if (empty($email) || empty($reset_string)) return false;
    	
    	$this->db->select('*');
    	$this->db->from($this->users_table);
    	$this->db->where($this->users_table.'.email', $email);
    	$this->db->where($this->users_table.'.reset_string', $reset_string);
    	$query = $this->db->get();
    	if ($query->num_rows == 0) return false;
    	$result = $query->result();
    	return $result[0];

    }

    public function get_by_fullname($fullname='') {

     	$this->db->select('*');
    	$this->db->from($this->users_table);
			$this->db->where('fullname', $fullname);
    	$query = $this->db->get();
    	if ($query->num_rows == 0) return false;
    	return $query->result();  	// Could be more than one

    }
    
    public function get_super_admins() {
    	
    	$this->db->select('*');
    	$this->db->from($this->users_table);
    	$this->db->where('is_super', 1);
    	$query = $this->db->get();
    	if ($query->num_rows == 0) return false;
    	return $query->result();  	// Could be more than one
    	
    }

    public function email_exists_for_different_user($email='', $user_id=0) {

    	// Note that user_id is inverse, it's what not to search for (the user asking the question)
    	$this->db->select('*');
    	$this->db->from($this->users_table);
    	$this->db->where('email', $email);
    	$query = $this->db->get();
    	if ($query->num_rows == 0) return false;
    	$result = $query->result();
    	if ($result[0]->user_id != $user_id) return true;
    	return false;

    }

    public function has_empty_password($email='') {

    	$this->db->select('password');
    	$this->db->from($this->users_table);
    	$this->db->where('email', $email);
    	$query = $this->db->get();
    	if ($query->num_rows == 0) return true;
    	$result = $query->result();
    	if (empty($result[0]->password)) return true;
    	return false;

    }

    public function log_history($user_id=0, $content_id=0, $book_id=0) {

    	if (empty($user_id)) return;
    	if (empty($content_id)) return;
    	if (empty($book_id)) return;

    	// See if the item already exists in the log (delete if so to avoid duplicates)

    	$this->db->delete($this->user_history_table, array('user_id' => (int) $user_id, 'content_id' => (int) $content_id));

    	// Insert new record

    	$data = array(
   			'user_id' => (int) $user_id,
  	 		'content_id' => (int) $content_id,
  	 		'book_id' => (int) $book_id
		);
		$this->db->insert($this->user_history_table, $data);

		// See if the log is getting too big
		// TODO: there's probably a better way to do this

		$this->db->select('history_id');
		$this->db->from($this->user_history_table);
		$this->db->where('user_id',$user_id);
		$this->db->where('book_id',$book_id);
		$this->db->order_by('history_id', 'desc');
		$query = $this->db->get();
		if ($query->num_rows==0) return;
		$result = $query->result();
		$num = count($result);
		if ($num > $this->config->item('user_history_max_records')) {
			for ($j = $this->config->item('user_history_max_records'); $j < $num; $j++) {
				$history_id = (int) $result[$j]->history_id;
				$this->db->delete($this->user_history_table, array('history_id'=>$history_id));
			}
		}

    }

    public function get_history($user_id, $book_id) {

    	//$this->db->distinct();
    	$this->db->select($this->pages_table.'.*');
    	$this->db->select($this->user_history_table.'.created AS history_created');
    	$this->db->from($this->pages_table);
    	$this->db->join($this->user_history_table, $this->user_history_table.'.content_id='.$this->pages_table.'.content_id');
    	$this->db->join($this->books_table, $this->books_table.'.book_id='.$this->pages_table.'.book_id');
    	$this->db->where($this->user_history_table.'.user_id', $user_id);
    	$this->db->where($this->books_table.'.book_id', $book_id);
    	$this->db->order_by($this->user_history_table.'.history_id', 'asc');
    	$query = $this->db->get();
    	$result = $query->result();

    	$return = array();

		foreach ($result as $row) {
			$content_id = $row->content_id;
			$key = count($return);
			// Get current version
			$this->db->select('*');
			$this->db->from($this->version_table);
			$this->db->where('content_id', $content_id);
			$this->db->order_by('version_num', 'desc');
			$this->db->limit(1);
			$query = $this->db->get();
			if ($query->num_rows==0) continue;
			$result = $query->result();
			$row->versions = array($result[0]);
			$row->version = $row->versions[0];
			$return[$key] = $row;
		}

		return $return;

    }

    public function get_books($user_id) {

		$this->db->select('*');
		$this->db->from($this->books_table);
		$this->db->where($this->user_book_table.'.user_id', $user_id);
		$this->db->join($this->user_book_table, $this->user_book_table.'.book_id = '.$this->books_table.'.book_id');

		$query = $this->db->get();
		$result = $query->result();
		if (!count($result)) return array();
		return $result;

    }

	public function make_books_private($user_id) {
		$books = $this->get_books($user_id);
		foreach ($books as $row) {
			$this->db->set('url_is_public', 0);
			$this->db->set('display_in_index', 0);
			$this->db->where('book_id', $row->book_id);
			$this->db->update($this->books_table);
		}
	}

	public function get_book_ids($array=array()) {

		$return = array();
		foreach ($array as $row) {
			$return[] = $row->book_id;
		}
		return $return;

	}

	public function get_pages_contributed_to($book_id=0, $user_id=0) {

		$this->db->select('*');
		$this->db->from($this->versions_table);
		$this->db->where($this->versions_table.'.user', $user_id);
		$this->db->join($this->pages_table, $this->pages_table.'.content_id = '.$this->versions_table.'.content_id');
		$this->db->where($this->pages_table.'.book_id = '.$book_id);

		$query = $this->db->get();
		$result = $query->result();
		if (!count($result)) return array();

		$CI =& get_instance();
		$return = array();
		foreach ($result as $version) {
			if (!array_key_exists($version->content_id, $return)) {
				$page = $CI->pages->get($version->content_id);
				$return[$version->content_id] = $page;
				$return[$version->content_id]->versions = $CI->versions->get_all($version->content_id);
			}
		}

		return $return;

	}

    public function search($sq='',$orderby='title',$orderdir='asc') {

    	$this->db->like('fullname', $sq);
			$this->db->or_like('email', $sq);
    	$query = $this->db->get($this->users_table);
    	$result = $query->result();
    	for ($j = 0; $j < count($result); $j++) {
    		$result[$j]->books = $this->get_books($result[$j]->user_id);
    	}
    	return $result;

    }

    public function add($array=array()) {

		if (empty($array['email'])) throw new Exception('Email is a required field');
		if ($this->get_by_email($array['email'])) throw new Exception('Email already in use');
		if ($this->email_is_disallowed($array['email'])) throw new Exception('Email is disallowed');
		if (empty($array['fullname'])) throw new Exception('Full name is a required field');
		if (empty($array['password'])) throw new Exception('Password is a required field');
		
		$fullname = trim($array['fullname']);
		$email = trim($array['email']);
    	if (empty($fullname)) throw new Exception('Could not resolve fullname');  // E.g., a string of all spaces
    	if (empty($email)) throw new Exception('Could not resolve email');  // E.g., a string of all spaces

    	$strong_password_enabled = $this->config->item('strong_password');
    	if ($strong_password_enabled && !$this->test_strong_password($array['password'], $fullname, $email)) throw new Exception('Password did not pass strong password test');
    	if ($strong_password_enabled && !$this->test_previous_password($array['password'], $email)) throw new Exception('Password has previously been used');
    	
		$data = array('fullname' => $fullname, 'email' => $email);
		$this->db->insert($this->users_table, $data);
		if ($this->db->_error_message()) echo 'Database error: '.$this->db->_error_message();
		$user_id = $this->db->insert_id();
		$user = $this->get_by_user_id($user_id);
		
		$this->save_password($user_id, $array['password'], $user->fullname, $user->email);  // Hashes the string

    	return $user_id;

    }

    public function register($array=array()) {

		// ReCAPTCHA version 1
		$recaptcha_public_key = $this->config->item('recaptcha_public_key');
		$recaptcha_private_key = $this->config->item('recaptcha_private_key');
		if (empty($recaptcha_public_key)||empty($recaptcha_private_key)) $recaptcha_public_key = $recaptcha_private_key = null;
		// ReCAPTCHA version 2
		$recaptcha2_site_key = $this->config->item('recaptcha2_site_key');
		$recaptcha2_secret_key = $this->config->item('recaptcha2_secret_key');
		if (empty($recaptcha2_site_key)||empty($recaptcha2_secret_key)) $recaptcha2_site_key = $recaptcha2_secret_key = null;	    	
    	// Choose one or the other
    	if (!empty($recaptcha2_site_key)) {
    		require_once(APPPATH.'libraries/recaptcha2/autoload.php');
    	} elseif (!empty($recaptcha_public_key)) {
    		require_once(APPPATH.'libraries/recaptcha/recaptchalib.php');
    	}

    	if (empty($array['tos'])) throw new Exception('Please indicate that you have accepted the Terms of Service');
		if (empty($array['password'])) throw new Exception('Password is a required field');
		if (empty($array['password_2'])) throw new Exception('Confirm password is a required field');
		if ($array['password'] != $array['password_2']) throw new Exception('Password and confirm password do not match');
		
		if (!empty($recaptcha2_site_key)) {
			if (!isset($_POST['g-recaptcha-response'])) throw new Exception('Invalid ReCAPTCHA form field');
			$recaptcha = new \ReCaptcha\ReCaptcha($recaptcha2_secret_key);
			$resp = $recaptcha->verify($_POST['g-recaptcha-response'], $_SERVER['REMOTE_ADDR']);
			if ($resp->isSuccess()):
				// Success
			else:
				/*
				$errors = array();
		        foreach ($resp->getErrorCodes() as $code) {
                	$errors[] = $code;
            	}
            	*/
            	throw new Exception('CAPTCHA did not validate');
			endif;
    	} elseif (!empty($recaptcha_private_key)) {
			$resp = recaptcha_check_answer($recaptcha_private_key, $_SERVER["REMOTE_ADDR"], $array["recaptcha_challenge_field"], $array["recaptcha_response_field"]);
			if (!$resp->is_valid) throw new Exception ('Incorrect CAPTCHA value');
		}
		
		return $this->add($array);

    }

    public function delete($user_id=0) {

    	if (empty($user_id)) return false;

		$this->db->where('user_id', $user_id);
		$this->db->delete($this->users_table);

		$this->db->where('user_id', $user_id);
		$this->db->delete($this->user_book_table);

		return true;

    }

    public function save($array=array()) {

    	// Get ID
    	$user_id =@ (int) $array['id'];
    	if (empty($user_id)) throw new Exception('Invalid user ID');
    	$book_id =@ (int) $array['book_id'];
    	unset($array['id']);
    	unset($array['section']);
    	unset($array['ci_session']);
    	unset($array['book_id']);
    	unset($array['action']);

		// Make sure the email address isn't already in use
		$email =@ $array['email'];
		if (!empty($email)) {
			$email_user = $this->get_by_email($email);
			if (!empty($email_user) && $email_user->user_id != $user_id) throw new Exception('Email already in use');
		}

    	// Remove password from save array, for saving later
		$password = (isset($array['password'])) ? $array['password'] : null;
		unset($array['password']);

    	// Remove user_book fields
		$rel_fields = array('relationship', 'list_in_index', 'sort_number');
		foreach ($rel_fields as $rel_field) {
			if (!isset($array[$rel_field])) continue;
			unset($array[$rel_field]);
		}

		// Save row
		$this->db->where('user_id', $user_id);
		$this->db->update($this->users_table, $array);

		// Clear reset string and save password, if applicable
		if (!empty($password)) {
			$this->save_reset_string($user_id, '');
			$this->set_password($user_id, $password);
		}

		// Determine if password has been set
		$password_is_null = true;
		$this->db->select('password');
		$this->db->from($this->users_table);
		$this->db->where('user_id', $user_id);
		$query = $this->db->get();
		$result = $query->result();
		if (!isset($result[0])) throw new Exception('Could not find user');
		$single_result = $result[0];
		if (!empty($single_result->password)) $password_is_null = false;
		$array['password_is_null'] = $password_is_null;

		return $array;

    }

    public function save_books($user_id, $book_ids=array(), $role='author', $list_in_index=1, $sort_number=0) {

    	foreach ($book_ids as $book_id) {
    		if (empty($book_id)) continue;
    		$this->db->where('user_id', $user_id);
    		$this->db->where('book_id', $book_id);
			$this->db->delete($this->user_book_table);
			$data = array(
               'book_id' => $book_id,
               'user_id' => $user_id,
               'relationship' => $role,
               'list_in_index' => $list_in_index,
			   'sort_number' => $sort_number
            );
			$this->db->insert($this->user_book_table, $data);
    	}

    	return $this->get_books($user_id);

    }

    public function set_reset_string($email) {

    	$user = $this->get_by_email($email);
    	$reset_string = randString(24);
    	$this->save_reset_string($user->user_id, $reset_string);
    	return $reset_string;

    }

    public function save_reset_string($user_id, $reset_string) {

		if (empty($user_id)) throw new Exception('Invalid user ID or reset string');

		$data['reset_string'] = $reset_string;
		$this->db->where('user_id', $user_id);
		$this->db->update($this->users_table, $data);

		return true;

    }

    public function set_password_from_form_fields($user_id=0, $array=array()) {

 		$password_1 = $array['password_1'];
		$password_2 = $array['password_2'];

		// Validate
		if (empty($user_id)) {
			throw new Exception ('Could not resolve user ID');
		}
		if (empty($password_1) || empty($password_1)) {
			throw new Exception ('New password or confirm new password was missing');
		}
		if ($password_1 != $password_2) {
			throw new Exception ('New password and confirm did not match');
		}
		$this->users->set_password($user_id, $password_1);

    }

	public function set_password($user_id, $password='') {

		if (empty($user_id)) throw new Exceptiom ('Invalud user ID');
		if (empty($password)) throw new Exception('Invalid password');

		$user = $this->get_by_user_id($user_id);
		$user_id =@ (int) $user->user_id;
		if (empty($user_id)) throw new Exception('Invalid user');

		$this->save_password($user_id, $password, $user->fullname, $user->email);

		return true;

	}

	private function save_password($user_id=0, $password='', $fullname='', $email=''){

		if (empty($user_id) || empty($password)) throw new Exception('Invalid user ID or password');

		$strong_password_enabled = $this->config->item('strong_password');
		if ($strong_password_enabled && !$this->test_strong_password($password, $fullname, $email)) throw new Exception('Password did not pass strong password test');
		if ($strong_password_enabled && !$this->test_previous_password($password, $email)) throw new Exception('Password has previously been used');
		if ($strong_password_enabled) $this->save_previous_password($password, $email);
		
		$data['password'] = $this->get_hash($password);
		$this->db->where('user_id', $user_id);
		$this->db->update($this->users_table, $data);

		return true;

	}

    private function get_hash($password) {

    	if (empty($password)) return $password;
    	return hash('sha512', $password . $this->config->item('shasalt'));

    }
    
    public function test_strong_password($password, $fullname='', $email='') {  // Conforms to USC's strong password mandate

    	if (strlen($password) < 16) return false;
    	if (!empty($fullname) && !empty($email)) {
    		$arr = explode(' ', $fullname);
	    	$arr = array_merge($arr, explode('@', $email));
	    	foreach ($arr as $el) {
	    		if (stristr(strtolower($password), strtolower($el))) return false;
	    	}
    	}
    	return true;
    	
    }
    
    public function test_previous_password($password, $email='') {
    	
    	if (empty($email)) return true;
    	$user = $this->get_by_email($email);
    	if (empty($user)) return true;  // User hasn't been created yet (e.g., is registering)
    	if (!property_exists($user, 'previous_passwords')) return true;  // Database hasn't been updated
    	$previous_passwords = json_decode($user->previous_passwords, true);
    	if (empty($previous_passwords)) $previous_passwords = array();
    	if (in_array($this->get_hash($password), $previous_passwords)) return false;
    	return true;
    	
    }
    
    private function save_previous_password($password, $email='') {
    	

    	if (empty($email)) return;
    	$user = $this->get_by_email($email);
    	if (!property_exists($user, 'previous_passwords')) return;  // Database hasn't been updated
    	$previous_passwords = json_decode($user->previous_passwords, true);
    	if (empty($previous_passwords)) $previous_passwords = array();
    	$previous_passwords[time()] = $this->get_hash($password);
    	$previous_passwords = array_slice($previous_passwords, -10, 10, true);  // Limit to last 10
    	$this->db->where('user_id', $user->user_id);
    	$this->db->update($this->users_table, array('previous_passwords'=>json_encode($previous_passwords)));
    	
    }
    
    public function days_since_last_password_change($user_id) {
    	
    	if (empty($user_id)) return;
    	$user = $this->get_by_user_id($user_id);
    	if (!property_exists($user, 'previous_passwords')) return;  // Database hasn't been updated
    	if ($user->previous_passwords) {
	    	$previous_passwords = json_decode($user->previous_passwords, true);
    	} else {
    		$previous_passwords = array();
    	}
    	if (empty($previous_passwords) || !is_array($previous_passwords)) $previous_passwords = array();
    	$current_time = time();
    	$least_days = null;
    	foreach ($previous_passwords as $previous_time => $previous_password) {
    		$days = abs($current_time - $previous_time)/60/60/24;
    		if ($least_days == null || $days < $least_days) $least_days = $days;
    	}
    	return $least_days;
    	
    }
    
    protected function email_is_disallowed($email='') {
    	
    	$this->load->model('resource_model', 'resources');
    	$json = $this->resources->get('disallowed_emails');
    	$arr = json_decode($json, true);
    	if (empty($arr)) $arr = array();
    	if (in_array($email, $arr)) return true;
    	return false;
    	
    }

}
?>
