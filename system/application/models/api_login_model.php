<?php
/**
 * @projectDescription	API login model
 * @author				John Bell
 * @version				1.0
 */

class Api_login_model extends User_model {

	protected $login_basename = null;

    public function __construct() {
        parent::__construct();

    }
    
	public function do_login($id, $api, $host) {
		// Run user login
		$email = trim($id);
		$temp = trim($api);
		$api_key = sha1(trim($api));		//TODO: This should really use crypt() for security, but unsure of install environment

		if(!$result = $this->get_by_email_and_api($email, $api_key)) return false;
		
		if($result->is_super=='1') return false;
		
		//Does this key require a whitelist check?
		if($result->whitelist=='0') return $result;
		if(!$this->check_whitelist($result->book_id, $host)) return false;

		return $result;
	}

	public function do_session_login($book_id){
		$session = $this->session->userdata(confirm_slash(base_url()));
		if(!empty($session) && $session['is_logged_in']){
			$this->db->select('*');
			$this->db->from($this->user_book_table);
			$this->db->join($this->users_table, $this->users_table.'.user_id='.$this->user_book_table.'.user_id');
			$this->db->where($this->users_table.'.user_id', $session['user_id']);
			$this->db->where($this->user_book_table.'.book_id', $book_id);
			$query = $this->db->get();
			if ($query->num_rows == 0) return false;
			$result = $query->result();
			return $result[0];	
		}
		
		return false;
	}	
	
	public function check_whitelist($book_id, $host){
		$this->db->select('*');
		$this->db->from($this->whitelist_table);
		$this->db->where('book_id', $book_id);
		$this->db->like('domain', $host, 'before');
		 
		$query=$this->db->get();
		if ($query->num_rows == 0) return false;
		return true;
	}
}
?>
