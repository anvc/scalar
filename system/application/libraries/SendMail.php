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
    
    private function domain_name() {
    	
		if (!empty($_SERVER['HTTP_HOST'])) return $_SERVER['HTTP_HOST'];
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