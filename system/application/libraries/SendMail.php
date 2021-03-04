<?php

if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class SendMail {

    public function __construct()  {

    	require_once(APPPATH.'libraries/PHPMailer/PHPMailerAutoload.php');
    	$this->CI =& get_instance();

    }

    public function reset_password($email='', $reset_string='') {

    	$arr = array();
    	$arr['from'] = $this->from_address();
    	$arr['fromName'] = $this->install_name();
    	$arr['to'] = $email;
    	$arr['replyTo'] = $this->replyto_address();
    	$arr['replyToName'] = $this->replyto_name();
    	$arr['subject'] = $this->CI->lang->line('email.forgot_password_subject');

    	$arr['msg']  = $this->CI->lang->line('email.forgot_password_intro');
		$arr['msg'] .= confirm_slash(base_url()).'system/create_password?key='.$reset_string."\n\n";
		$arr['msg'] .= $this->CI->lang->line('email.forgot_password_outro');

		$this->send($arr);

		return true;

    }

    public function new_comment($book, $data=array(), $is_live=false) {

		$title       =@ trim($data['title']);
		$description =@ trim($data['description']);
		$content     =@ trim($data['content']);
		$book_url	 = confirm_slash(base_url()).$book->slug;
		$book_title  =@ strip_tags($book->title);
		$msg = '';
		$arr = array();

		if (!empty($title)) $msg .= '<b>'.$title.'</b>'."\n";
		if (!empty($description)) $msg .= $description."\n";
		if (!empty($content)) $msg .= $content."\n\n";

    	$author_emails = array();
		foreach ($book->contributors as $author) {
			if (strtolower($author->relationship) != 'author') continue;
			$author_emails[] = $author->email;
		}
		if (empty($author_emails)) return false;

    	$arr['from'] = 'no-reply@'.$this->domain_name();
    	$arr['fromName'] = $this->install_name();
    	$arr['to'] = $author_emails;
    	$arr['replyTo'] = $this->replyto_address();
    	$arr['replyToName'] = $this->replyto_name();
		$arr['subject'] = sprintf($this->CI->lang->line('email.new_comment_subject'),$book_title);
    	$arr['msg']  = sprintf($this->CI->lang->line('email.new_comment_intro'),$book_title)."\n\n";
		$arr['msg'] .= $msg;
		$arr['msg'] .= ($is_live) ? $this->CI->lang->line('email.new_comment_outro')."\n" : $this->CI->lang->line('email.new_comment_outro_moderated')."\n";
		$arr['msg'] .= '<a href="'.$book_url.'">'.$book_url.'</a>'."\n\n";
		$arr['msg'] .= $this->CI->lang->line('email.new_comment_footer');

    	$this->send($arr);

    	return true;

    }

    public function lens_submitted($book, $data) {

    	$title       =@ trim($data['title']);
    	$fullname    =@ trim($data['fullname']);
		$comment 	 =@ trim($data['comment']);
    	$book_url	 = confirm_slash(base_url()).$book->slug;
    	$book_title  =@ strip_tags($book->title);
    	$msg = '';
    	$arr = array();

    	if (!empty($title)) $msg .= '<b>'.$title.'</b> by '.$fullname."\n";
    	if (!empty($comment)) $msg .= $comment."\n\n";

    	$author_emails = array();
    	foreach ($book->contributors as $author) {
    		if (strtolower($author->relationship) != 'author') continue;
    		$author_emails[] = $author->email;
    	}
    	if (empty($author_emails)) return false;

    	$arr['from'] = 'no-reply@'.$this->domain_name();
    	$arr['fromName'] = $this->install_name();
    	$arr['to'] = $author_emails;
    	$arr['replyTo'] = $this->replyto_address();
    	$arr['replyToName'] = $this->replyto_name();
    	$arr['subject'] = sprintf($this->CI->lang->line('email.lens_submitted_subject'),$book_title);
    	$arr['msg']  = sprintf($this->CI->lang->line('email.lens_submitted_intro'),$book_title)."\n\n";
    	$arr['msg'] .= $msg;
    	$arr['msg'] .= $this->CI->lang->line('email.lens_submitted_outro')."\n\n";
    	$arr['msg'] .= '<a href="'.$book_url.'/manage-lenses">'.$book_url.'/manage-lenses</a>'."\n\n";
    	$arr['msg'] .= $this->CI->lang->line('email.lens_submitted_footer');

    	$this->send($arr);

    	return true;

    }

    private function send($arr=array()) {

		$mail = new PHPMailer;

		$smtp_host = $this->CI->config->item('smtp_host');
		if (!empty($smtp_host)) {
			$smtp_auth = $this->CI->config->item('smtp_auth');
			$smtp_username = $this->CI->config->item('smtp_username');
			$smtp_password = $this->CI->config->item('smtp_password');
			$smtp_secure = $this->CI->config->item('smtp_secure');
			$smtp_port = $this->CI->config->item('smtp_port');
			$mail->isSMTP();
			$mail->Host = trim($smtp_host);
			$mail->SMTPAuth = (!empty($smtp_auth)) ? true : false;
			$mail->Username = trim($smtp_username);
			$mail->Password = trim($smtp_password);
			$mail->SMTPSecure = trim($smtp_secure);
			$mail->Port = (int) $smtp_port;
		}

		$mail->From = $arr['from'];
		$mail->FromName = $arr['fromName'];
		if (!is_array($arr['to'])) $arr['to'] = array($arr['to']);
		foreach ($arr['to'] as $to) {
			$mail->addAddress($to);
		}
		$mail->addReplyTo($arr['replyTo'], $arr['replyToName']);

		$mail->WordWrap = 50;                                 // Set word wrap to 50 characters
		$mail->isHTML(true);                                  // Set email format to HTML

		$mail->Subject = $arr['subject'];
		$mail->Body    = '<p>'.nl2br($arr['msg']).'</p>';
		$mail->AltBody = $arr['msg'];

		if(!$mail->send()) {
			throw new Exception('Could not send email: '.$mail->ErrorInfo);
		}

		return true;

    }

    private function domain_name() {

    	// Check DNS record
		$dns =@ dns_get_record($_SERVER['HTTP_HOST']);
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

	private function from_address() {
		$from_address = $this->CI->config->item('email_from_address');
		if($from_address) {
			return $from_address;
		}
		return 'no-reply@'.$this->domain_name(); // fallback if none is provided (backward compatibility)
	}

    private function replyto_address() {

		return $this->CI->config->item('email_replyto_address');

    }

    private function replyto_name() {

    	return $this->CI->config->item('email_replyto_name');

    }

}
