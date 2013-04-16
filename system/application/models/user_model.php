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
 * http://www.osedu.org/licenses /ECL-2.0 
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

class User_model extends My_Model {

	private $user_levels = array('author', 'commentator', 'reviewer', 'reader');  // In order of level (top level first)
	
    public function __construct() {
    	
        parent::__construct();
        
    }
    
  	public function rdf($row, $prefix='') {

  		$row->type = 'http://xmlns.com/foaf/0.1/Person';
  		if (isset($row->fullname) && !isset($row->name)) {
			$row->name = $row->fullname;
			unset($row->fullname);
		}						  
		if (isset($row->url) && !isset($row->homepage)) {
			$row->homepage = $row->url;
			unset($row->url);
		}
  		return parent::rdf($row);
  		
  	}        
    
    public function get_all($book_id=0, $is_live=false, $orderby='fullname',$orderdir='asc') {

		$this->db->select('*');
		if (!empty($book_id)) {
			$this->db->from($this->user_book_table);
			$this->db->where($this->user_book_table.'.book_id', $book_id);
			$this->db->join($this->users_table, $this->users_table.'.user_id='.$this->user_book_table.'.user_id');
		} else {
			$this->db->from($this->users_table);
		}
    	$this->db->order_by($orderby, $orderdir); 
    	$query = $this->db->get();
    	if (mysql_errno()!=0) die(mysql_error());
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
    	if (mysql_errno()!=0) echo mysql_error();
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
    	
    	$this->db->select('*');
    	$this->db->from($this->user_book_table);
    	$this->db->join($this->users_table, $this->users_table.'.user_id='.$this->user_book_table.'.user_id');
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
    
    public function email_exists_for_different_user($email='', $user_id=0) {
    	
    	// Note that user_id is inverse, it's what not to search for (the user asking the question)
    	$this->db->select('*');
    	$this->db->from($this->users_table);
    	$this->db->where('email', $email);
    	$query = $this->db->get();
    	if (mysql_errno()!=0) echo mysql_error();
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
    	if (mysql_errno()!=0) echo 'MySQL: '.mysql_error();
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
    	if (mysql_errno()!=0) die('MySQL Error: '.mysql_error());
    	$result = $query->result();

    	$return = array();

		foreach ($result as $row) {
			$content_id = $row->content_id;
			$key = count($return);
			// Get current version
			$this->db->select('*');
			$this->db->from($this->version_table);
			$this->db->where('content_id', $content_id);
			$this->db->orderby('version_num', 'desc');
			$this->db->limit(1);
			$query = $this->db->get();
			if (mysql_errno()!=0) die('MySQL Error: '.mysql_error());
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
    
	public function get_book_ids($array=array()) {
		
		$return = array();
		foreach ($array as $row) {
			$return[] = $row->book_id;
		}
		return $return;
			
	}      
    
    public function search($sq='',$orderby='title',$orderdir='asc') {
    	
    	$this->db->like('fullname', $sq); 
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
		if (empty($array['fullname'])) throw new Exception('Full name is a required field');

		$fullname = trim($array['fullname']);
		$email = trim($array['email']);

    	if (empty($fullname)) throw new Exception('Could not result fullname');
    
		$data = array('fullname' => $fullname );
		if (!empty($email)) $data['email'] = $email;
		$this->db->insert($this->users_table, $data); 
		$user_id = mysql_insert_id();
		
		if (isset($array['password']) && !empty($array['password'])) $this->save_password($user_id, $array['password']);
		
    	return $user_id;
    	
    }
    
    public function register($array=array()) {
    	
    	require_once(APPPATH.'libraries/recaptcha/recaptchalib.php');
    	
    	if (empty($array['tos'])) throw new Exception('Please indicate that you have accepted the Terms of Service');
		if (empty($array['password'])) throw new Exception('Password is a required field');
		if (empty($array['password_2'])) throw new Exception('Confirm password is a required field');
		if ($array['password'] != $array['password_2']) throw new Exception('Password and confirm password do not match');
		$resp = recaptcha_check_answer($this->config->item('recaptcha_private_key'), $_SERVER["REMOTE_ADDR"], $array["recaptcha_challenge_field"], $array["recaptcha_response_field"]);
		if (!$resp->is_valid) throw new Exception ('Incorrect CAPTCHA value');	
		
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
    	$user_id = (int) $array['id'];
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
			if ($email_user->user_id != $user_id) throw new Exception('Email already in use');
		}
		
    	// Remove password for saving seperately
		$password =@ $array['password'];
		unset($array['password']);		
		
    	// Remove relationship fields but save for later
		if (!empty($book_id)) {
			$rel_fields = array('relationship', 'list_in_index', 'sort_number');
			$spool = array();
			foreach ($rel_fields as $rel_field) {
				if (!isset($array[$rel_field])) continue;
				$this->db->where('user_id', $user_id);
				$this->db->where('book_id', $book_id);
				$this->db->update($this->user_book_table, array($rel_field=>$array[$rel_field])); 
				$spool[$rel_field] = $array[$rel_field];
				unset($array[$rel_field]);
			}
		}			
		
		// Save row
		$this->db->where('user_id', $user_id);
		$this->db->update($this->users_table, $array); 
		if (mysql_errno()!=0) echo mysql_error();
		
		// Save password
		if (!empty($password)) $this->set_password($user_id, $password);
		
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
		
		// Add relationship fields back
		if (isset($spool)) $array = array_merge($array, $spool);	
		
		return $array;
    	
    }    
    
    public function save_books($user_id, $book_ids=array(), $role='author', $list_in_index=1) {
    	
    	foreach ($book_ids as $book_id) {
    		if (empty($book_id)) continue;
    		$this->db->where('user_id', $user_id);
    		$this->db->where('book_id', $book_id);
			$this->db->delete($this->user_book_table);      		
			$data = array(
               'book_id' => $book_id,
               'user_id' => $user_id,
               'relationship' => $role,
               'list_in_index' => $list_in_index
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

		$this->save_password($user_id, $password);
		
		return true;
		
	}
	
	private function save_password($user_id=0, $password=''){
		
		if (empty($user_id) || empty($password)) throw new Exception('Invalid user ID or password');

		$data['password'] = $this->get_hash($password);
		$this->db->where('user_id', $user_id);
		$this->db->update($this->users_table, $data); 	
		
		return true;	
		
	}    
    
    private function get_hash($password) {
    	
    	if (empty($password)) return $password;
    	return hash('sha512', $password . $this->config->item('shasalt'));
    	
    }
   
}
?>
