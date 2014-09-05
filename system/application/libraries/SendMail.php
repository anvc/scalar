<?php

if ( ! defined('BASEPATH')) exit('No direct script access allowed'); 

class SendMail {

    public function __construct()  {

    	$this->CI =& get_instance();
    	$this->CI->load->library('email');

    }

    public function reset_password($email='', $reset_string='') {

		$this->CI->email->from('no-reply@'.$this->domain_name(), $this->install_name());
		$this->CI->email->reply_to($this->replyto_address(), $this->replyto_name());
		$this->CI->email->to($email); 
		$this->CI->email->subject($this->CI->lang->line('email.forgot_password_subject'));
		$msg  = $this->CI->lang->line('email.forgot_password_intro');
		$msg .= confirm_slash(base_url()).'system/create_password?key='.$reset_string."\n\n";
		$msg .= $this->CI->lang->line('email.forgot_password_outro');
		$this->CI->email->message($msg);  
		
		if (!$this->CI->email->send()) {
			throw new Exception('Could not send email.  Please try again or contact an administrator.');
		}

		return true;

    }
	
	//@Lucas - Adding "Join Book"  helper function
	public function acls_join_book($user, $book, $request_author = 0, $message){
		$author_emails = array();
		foreach($book->users as $author){
			if($author->relationship == 'author'){
				$author_emails[] = $author->email;
			}
		}
		
		$this->CI->load->helper('url');
		
		$data = array(
			'book_title' => strip_tags($book->title),
			'book_id' => $book->book_id,
			'author_request_message'=>wordwrap($message, 70),
			'user_name' => $user->fullname,
			'site_url' => base_url(),
			'email_type' => 'join_only'
		);
		
		
		$this->CI->email->from('no-reply@'.$this->domain_name(), $this->install_name());
		$this->CI->email->reply_to($user->email, $user->fullname);
		$this->CI->email->to($author_emails); 
		
		if($request_author){
			$this->CI->email->subject(sprintf($this->CI->lang->line('acls_email.request_author_role_subject'),$data['book_title']));
			if(!empty($message)){
				$data['email_type'] = 'author_with_message';
			}else{
				$data['email_type'] = 'author_no_message';
			}
		}else{
			$this->CI->email->subject(sprintf($this->CI->lang->line('acls_email.user_joined_subject'),$data['book_title']));
		}
		$msg  = $this->CI->load->view('modules/aclsworkbench_book_list/email',$data,TRUE);
		
		$this->CI->email->message($msg);  
		
		if (!$this->CI->email->send()) {
			throw new Exception('Could not send email.  Please try again or contact an administrator.');
		}

		return true;
	}
    
    private function domain_name() {
    	
    	// Check DNS record
		$dns = dns_get_record($_SERVER['HTTP_HOST']);
		if (is_array($dns) && isset($dns[0]) && isset($dns[0]['target']) && !empty($dns[0]['target'])) {
			return $dns[0]['target'];
		}
    	// Check hostname
    	if (!empty($_SERVER['HTTP_HOST'])) return $_SERVER['HTTP_HOST'];
		// Check server name
		if (!empty($_SERVER['SERVER_NAME'])) return $_SERVER['SERVER_NAME'];
		
    }
    
    private function install_name() {

    	$install_name = $this->CI->lang->line('install_name');
    	if (empty($install_name)) $install_name = 'Test';
    	return $install_name;
    	
    }
    
    private function replyto_address() {
    	
		return $this->CI->config->item('email_replyto_address');
    	
    }
    
    private function replyto_name() {
    	
    	return $this->CI->config->item('email_replyto_name');

    }
    
}