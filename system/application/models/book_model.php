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

use ReCaptcha\ReCaptcha;

/**
 * @projectDescription	Model for book database table
 * @author				Craig Dietrich
 * @version				2.2
 */

function sortBookVersions($a, $b) {
	$x = (int) $a->sort_number;
	$y = (int) $b->sort_number;
	if ($x < $y) return -1;
	if ($x > $y) return 1;
	return 0;
}

function sortBookContent($a, $b) {
	$x = strtolower($a->versions[$a->version_index]->title);
	$y = strtolower($b->versions[$b->version_index]->title);
	if ($x < $y) return -1;
	if ($x > $y) return 1;
	return 0;
}

function sortBookContentVersions($a, $b) {
	$x = (int) $a->version_num;
	$y = (int) $b->version_num;
	if ($x < $y) return -1;
	if ($x > $y) return 1;
	return 0;
}

class Book_model extends MY_Model {

	public $default_stylesheet = '';

    public function __construct() {

        parent::__construct();

        $this->default_stylesheet = $this->config->item('default_stylesheet');

    }

	public function urn($pk=0) {

		return str_replace('$1', $pk, $this->book_urn_template);

	}

  	public function rdf($row, $base_uri='') {

  		if (!isset($row->type) || empty($row->type)) $row->type = 'book';
  		if (isset($row->subtitle) && !empty($row->subtitle)) $row->title = $row->title.'<span class="subtitle">: '.$row->subtitle.'</span>';
  		if (!isset($row->is_part_of)) $row->is_part_of = base_url();
  		return parent::rdf($row, $base_uri);

  	}

    public function get($book_id=0, $show_users=true) {

    	$this->db->select('*');
    	$this->db->from($this->books_table);
    	$this->db->where('book_id', $book_id);
    	$query = $this->db->get();
    	if ($query->num_rows < 1) return null;
    	$result = $query->result();
    	$book = $result[0];
    	if ($show_users) {
    		for ($j = 0; $j < count($result); $j++) {
    			$book->users = $this->get_users($book->book_id, true);
    		}
    	}
    	if (isset($book->editions) && !empty($book->editions)) $book->editions = unserialize($book->editions);
    	return $book;

    }
    
    public function get_by_slug($uri='') {
    	
    	$query = $this->db->get_where($this->books_table, array('slug'=>$uri));
    	$result = $query->result();
    	if (!isset($result[0])) return null;
    	for ($j = 0; $j < count($result); $j++) {
    		$result[$j]->urn = $this->urn($result[$j]->book_id);
    		if (isset($result[$j]->editions) && !empty($result[$j]->editions)) $result[$j]->editions = unserialize($result[$j]->editions);
    	}
    	return $result[0];
    	
    }
    
    public function get_by_urn($urn='') {
    	
    	$pk = (int) $this->urn_to_pk($urn);
    	$query = $this->db->get_where($this->books_table, array('page_id'=>$pk), 1);
    	$result = $query->result();
    	if (!isset($result[0])) return null;
    	for ($j = 0; $j < count($result); $j++) {
    		$result[$j]->urn = $this->urn($result[$j]->book_id);
    		if (isset($result[$j]->editions) && !empty($result[$j]->editions)) $result[$j]->editions = unserialize($result[$j]->editions);
    	}
    	return $result[0];
    	
    }

    public function get_by_content_id($content_id) {

    	$this->db->select($this->books_table.'.*');
    	$this->db->from($this->books_table);
    	$this->db->join($this->pages_table, $this->books_table.'.book_id='.$this->pages_table.'.book_id');
    	$this->db->where($this->pages_table.'.content_id',$content_id);

    	$query = $this->db->get();
		$result = $query->result();
    	if (isset($result[0]) && !empty($result[0])) return (object) $result[0];
    	return null;

    }

    public function get_by_version_id($version_id) {

    	$this->db->select($this->books_table.'.*');
    	$this->db->from($this->books_table);
    	$this->db->join($this->pages_table, $this->books_table.'.book_id='.$this->pages_table.'.book_id');
    	$this->db->join($this->versions_table, $this->versions_table.'.content_id='.$this->pages_table.'.content_id');
    	$this->db->where($this->versions_table.'.version_id',$version_id);

    	$query = $this->db->get();
    	$result = $query->result();
    	if (isset($result[0]) && !empty($result[0])) return (object) $result[0];
    	return null;

    }

    public function get_all($user_id=0, $is_live=false, $orderby='title',$orderdir='asc', $total=null, &$start=null) {

    	$this->db->select('*');
    	$this->db->from($this->books_table);
    	if (!empty($user_id)) {
            $this->db->join($this->user_book_table, $this->books_table.'.book_id='.$this->user_book_table.'.book_id');
            $this->db->where($this->user_book_table.'.user_id',$user_id);
    	}
    	if (!empty($is_live)) {
    		$this->db->where($this->books_table.'.url_is_public',1);
    		$this->db->where($this->books_table.'.display_in_index',1);
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
    	for ($j = 0; $j < count($result); $j++) {
    		$result[$j]->users = $this->get_users($result[$j]->book_id, true, '');
    		if (isset($result[$j]->editions) && !empty($result[$j]->editions)) $result[$j]->editions = unserialize($result[$j]->editions);
    	}

    	return $result;

    }

    public function get_all_with_creator($user_id=0, $is_live=false, $orderby='title', $orderdir='asc', $total=null) {

    	$this->db->select('*');
    	$this->db->from($this->books_table);
    	if (!empty($user_id)) {
    		$this->db->join($this->user_book_table, $this->books_table.'.book_id='.$this->user_book_table.'.book_id');
    		$this->db->where($this->user_book_table.'.user_id',$user_id);
    	}
    	if (!empty($is_live)) {
    		$this->db->where($this->books_table.'.url_is_public',1);
    		$this->db->where($this->books_table.'.display_in_index',1);
    	}
    	if (!empty($total)) {
    		$this->db->limit($total);
    	}
    	$this->db->order_by($orderby, $orderdir);

    	$query = $this->db->get();
    	$result = $query->result();
    	$ci=&get_instance();
    	for ($j = 0; $j < count($result); $j++) {
    		$result[$j]->creator = $ci->users->get_by_user_id($result[$j]->user);
    		if (isset($result[$j]->editions) && !empty($result[$j]->editions)) $result[$j]->editions = unserialize($result[$j]->editions);
    	}

    	return $result;

    }

    public function get_duplicatable($orderby='title',$orderdir='asc') {

    	$this->db->select('*');
    	$this->db->from($this->books_table);
		//@Lucas: Just changed "all" to "true" since, right now, we don't have any means of making this more granular; This may be changed in the future
		$this->db->like('title', 'data-duplicatable="true"');
    	$this->db->order_by($orderby, $orderdir);

    	$query = $this->db->get();
    	$result = $query->result();
    	for ($j = 0; $j < count($result); $j++) {
    		$result[$j]->users = $this->get_users($result[$j]->book_id, true, '');
    	}
    	return $result;

    }

	//@Lucas: Added second helper function to find 'joinable' books
	public function get_joinable($orderby='title',$orderdir='asc') {

    	$this->db->select('*');
    	$this->db->from($this->books_table);
		$this->db->not_like('title', 'data-joinable="false"');
    	$this->db->order_by($orderby, $orderdir);

    	$query = $this->db->get();
    	$result = $query->result();
    	for ($j = 0; $j < count($result); $j++) {
    		$result[$j]->users = $this->get_users($result[$j]->book_id, true, '');
    	}
    	return $result;

    }

    public function is_duplicatable($book) {
    	if (stristr($book->title, 'data-duplicatable="true"')) return true;
    	return false;
    }

	public function is_joinable($book) {
    	if (stristr($book->title, 'data-joinable="false"')) return false;  // TODO: not sure the reverse logic here... Joinable by default? ~cd
    	return true;
    }
	public function is_hypothesis($book) {
    	if (stristr($book->title, 'data-hypothesis="true"')) return true;
    	return false;
    }
    public function is_auto_approve($book) {
        if (stristr($book->title, 'data-auto-approve="true"')) return true;
        return false;
    }
    public function is_email_authors($book) {
        if (stristr($book->title, 'data-email-authors="true"')) return true;
        return false;
    }
    public function is_margin_nav($book) {
    	if (stristr($book->title, 'data-margin-nav="true"')) return true;
    	return false;
    }
    public function is_hide_versions($book) {
    	if (stristr($book->title, 'data-hide-versions="true"')) return true;
    	return false;
    }
	public function has_paywall($book) {
		if (empty($book)) return false;
		$tinypass_config_path = confirm_slash(FCPATH).$book->slug.'/tinypass.php';
    	if (file_exists($tinypass_config_path)) return true;
    	return false;
    }

    public function get_images($book_id, $additional_suffixes=array()) {

    	$add_str = '';
    	if (!empty($additional_suffixes)) {
    		foreach ($additional_suffixes as $suffix) {
    			$add_str .= "OR B.url LIKE '%".$suffix."' ";
    		}
    	}
    	$q = "SELECT A.content_id, A.slug, B.version_id, B.url, B.title, B.version_num ".
    		 "FROM scalar_db_content A, scalar_db_versions B " .
    		 "WHERE B.content_id = A.content_id " .
    		 "AND A.book_id = $book_id " .
    		 "AND A.type='media' " .
    	     "AND A.is_live = 1 " .
    		 "AND (B.url LIKE '%.gif' OR B.url LIKE '%.jpg' OR B.url LIKE '%.jpeg' OR B.url LIKE '%.png' OR B.url LIKE '%JPEG%' ".$add_str.") " .
    		 "ORDER BY B.title ASC, B.version_num ASC";
    	$query = $this->db->query($q);
    	$result = $query->result();
		$return = array();
		foreach ($result as $row) {
			if (!isset($return[$row->content_id])) {
				$return[$row->content_id] = new stdClass;
				$return[$row->content_id]->content_id = $row->content_id;
				$return[$row->content_id]->slug = $row->slug;
				$return[$row->content_id]->versions = array();
			}
			$return[$row->content_id]->versions[] = $row;
		}
		foreach ($return as $content_id => $row) {
			usort($return[$content_id]->versions, "sortBookContentVersions");
			$return[$content_id]->version_index = count($return[$content_id]->versions)-1;
		}
		usort($return, "sortBookContent");
    	return $return;

    }

    public function get_audio($book_id) {

    	$q = "SELECT A.content_id, A.slug, B.version_id, B.url, B.title, B.version_num ".
    	     "FROM scalar_db_content A, scalar_db_versions B " .
    		 "WHERE B.content_id = A.content_id " .
    		 "AND A.book_id = $book_id " .
    		 "AND A.type='media' " .
    	     "AND A.is_live = 1 " .
    		 "AND (B.url LIKE '%.wav' OR B.url LIKE '%.mp3' OR B.url LIKE '%soundcloud%' OR B.url LIKE '%.oga' OR B.url LIKE '%.wav' OR B.url LIKE '%WAVE%' OR B.url LIKE '%MP3%' OR B.url LIKE '%audio') " .
    		 "ORDER BY B.title ASC, B.version_num ASC";
    	$query = $this->db->query($q);
    	$result = $query->result();
    	$return = array();
		foreach ($result as $row) {
			if (!isset($return[$row->content_id])) {
				$return[$row->content_id] = new stdClass;
				$return[$row->content_id]->content_id = $row->content_id;
				$return[$row->content_id]->slug = $row->slug;
				$return[$row->content_id]->versions = array();
			}
			$return[$row->content_id]->versions[] = $row;
		}
		foreach ($return as $content_id => $row) {
			usort($return[$content_id]->versions, "sortBookContentVersions");
			$return[$content_id]->version_index = count($return[$content_id]->versions)-1;
		}
		usort($return, "sortBookContent");
    	return $return;

    }

	// Table of Contents
	// - The edit page will maintain a page's sort_number when incrementing versions
	// - The Dashboard points to specific versions, but save_versions() will make sure to save most up-to-date version
    public function get_book_versions($book_id, $is_live=false) {

    	$this->db->select($this->versions_table.'.*');
    	$this->db->from($this->versions_table);
    	$this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
    	$this->db->where($this->versions_table.'.sort_number >', 0);
    	$this->db->where($this->pages_table.'.book_id', $book_id);
    	if ($is_live) $this->db->where($this->pages_table.'.is_live', 1);
    	$query = $this->db->get();
    	$result = $query->result();

		$return = array();
		foreach ($result as $row) {
			$content_id = $row->content_id;
			if (!isset($return[$content_id])) {
				if (!$this->is_top_version($content_id, $row->version_num)) continue;
        		$ci=&get_instance();
				$ci->load->model("page_model","pages");
				$return[$content_id] = $ci->pages->get($content_id);
				$return[$content_id]->versions = array();
				$return[$content_id]->sort_number = $row->sort_number;
				$row->urn = $this->version_urn($row->version_id);
				$return[$content_id]->versions[] = $row;
			}
		}

    	usort($return, "sortBookVersions");
    	return $return;

    }

    public function reset_book_versions($book_id) {

    	$versions = self::get_book_versions($book_id, false);
    	foreach ($versions as $content_id => $content) {
    		foreach ($content->versions as $version) {
    			$version_id = (int) $version->version_id;
    			$this->db->where('version_id', $version_id);
				$this->db->update($this->versions_table, array('sort_number'=>0));
    		}
    	}

    }

    public function search($sq='',$orderby='title',$orderdir='asc') {

    	$this->db->or_like('slug', $sq);
     	$this->db->or_like('title', $sq);
     	$this->db->or_like('description', $sq);
    	$query = $this->db->get($this->books_table);
    	$result = $query->result();
    	for ($j = 0; $j < count($result); $j++) {
    		$result[$j]->users = $this->get_users($result[$j]->book_id, true);
    	}
    	return $result;

    }

    public function get_index_books($is_featured=true, $sq='', $orderby='title',$orderdir='asc') {

        $esc_sq = $this->db->escape_str($sq);
        $esc_orderby = $this->db->escape_str($orderby);
        $esc_orderdir = $this->db->escape_str($orderdir);

        $pref = $this->db->dbprefix;
        $temp = 'SELECT DISTINCT '.$pref.$this->books_table.'.* FROM '.$pref.$this->books_table.' JOIN ('.$pref.$this->user_book_table.' CROSS JOIN '.$pref.$this->users_table.')';
        $temp .= ' ON ('.$pref.$this->users_table.'.user_id='.$pref.$this->user_book_table.'.user_id AND '
            .$pref.$this->books_table.'.book_id='.$pref.$this->user_book_table.'.book_id)';
        $temp .= ' WHERE ';
        if (!empty($is_featured)) {
            $temp .= 'is_featured = 1 AND';
            $temp .= ' display_in_index = 1';
        }
        else {
            $temp .= 'is_featured = 0 AND';
            $temp .= ' display_in_index = 1';
        }

        if(!empty($sq)) {
            $temp .= ' AND ('.$pref.$this->books_table.'.slug LIKE \'%'.$esc_sq.'%\' OR '.$pref.$this->books_table.'.title LIKE \'%'.$esc_sq.'%\' OR '
                .$pref.$this->books_table.'.description LIKE \'%'.$esc_sq.'%\' OR ('
                .$pref.$this->users_table.'.fullname LIKE \'%'.$esc_sq.'%\' AND '.$pref.$this->user_book_table.'.list_in_index = 1))';
        }
        $temp .= ' ORDER BY '.$esc_orderby.' '.$esc_orderdir;
        $query = $this->db->query($temp);

        $result = $query->result();
        for ($j = 0; $j < count($result); $j++) {
            $result[$j]->users = $this->get_users($result[$j]->book_id, true);
        }

        return $result;

    }

    public function add($array=array(), $captcha=true) {

    	if ('array'!=gettype($array)) $array = (array) $array;
    	$CI =& get_instance();

 		$title =@ $array['title'];
 		if (empty($title)) $title = 'Untitled';
    	$user_id =@ (int) $array['user_id'];  // Don't validate, as admin functions can create books not connected to any author
 		$book_user = (empty($user_id)&&isset($CI->data['login'])) ? (int) $CI->data['login']->user_id : $user_id;
    	$template = (isset($array['template'])&&!empty($array['template'])) ? $array['template'] : null;
    	$stylesheet = (isset($array['stylesheet'])&&!empty($array['stylesheet'])) ? $array['stylesheet'] : $this->default_stylesheet;

    	if (empty($title)) throw new Exception('Could not resolve title');
    	$active_melon = $this->config->item('active_melon');
    	if (empty($template) && !empty($active_melon)) $template = trim($active_melon);  // Otherwise use MySQL default

    	if ($captcha) {
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
	    	// Validate ReCAPTCHA
	    	if (!empty($recaptcha2_site_key)) {
	    		if (!isset($_POST['g-recaptcha-response'])) throw new Exception('invalid_captcha_1');
			    $recaptcha = new ReCaptcha($recaptcha2_secret_key);
	    		$resp = $recaptcha->verify($_POST['g-recaptcha-response'], $_SERVER['REMOTE_ADDR']);
	    		if ($resp->isSuccess()):
	    			// Success
	    		else:
	    			throw new Exception('invalid_captcha_1');
	    		endif;
	    	} elseif (!empty($recaptcha_private_key)) {
	    		$resp = recaptcha_check_answer($recaptcha_private_key, $_SERVER["REMOTE_ADDR"], $array["recaptcha_challenge_field"], $array["recaptcha_response_field"]);
	    		if (!$resp->is_valid) throw new Exception ('invalid_captcha_2');
	    	}
    	}

    	$uri = $orig = safe_name($title, false);  // Don't allow forward slashes
    	$count = 1;
 		while ($this->slug_exists($uri)) {
 			$uri = create_suffix($orig, $count);
 			$count++;
 		}

    	// Required fields
		$data = array('title' => $title, 'slug' =>$uri, 'user'=>$book_user, 'created'=>$mysqldate = date('Y-m-d H:i:s'), 'stylesheet'=>$stylesheet);
		// Optional fields
		if (!empty($template)) $data['template'] = $template;
		if (isset($array['subtitle']) && !empty($array['subtitle'])) 		$data['subtitle'] = $array['subtitle'];
		if (isset($array['description']) && !empty($array['description'])) 	$data['description'] = $array['description'];
		if (isset($array['thumbnail']) && !empty($array['thumbnail'])) 		$data['thumbnail'] = $array['thumbnail'];
		if (isset($array['background']) && !empty($array['background'])) 	$data['background'] = $array['background'];
		if (isset($array['template']) && !empty($array['template'])) 		$data['template'] = $array['template'];
		if (isset($array['custom_style']) && !empty($array['custom_style'])) $data['custom_style'] = $array['custom_style'];
		if (isset($array['custom_js']) && !empty($array['custom_js'])) 		$data['custom_js'] = $array['custom_js'];
		if (isset($array['scope']) && !empty($array['scope'])) 				$data['scope'] = $array['scope'];
		if (isset($array['publisher']) && !empty($array['publisher'])) 		$data['publisher'] = $array['publisher'];
		if (isset($array['publisher_thumbnail']) && !empty($array['publisher_thumbnail'])) $data['publisher_thumbnail'] = $array['publisher_thumbnail'];

		try {
			$this->getStorage($data['slug'])->setUp();
		} catch (Scalar_Storage_Exception $e) {
			error_log($e->getMessage());
			throw new Exception('no_dir_created');
		}

		$result = $this->db->insert($this->books_table, $data);
		if ($result === false) {
			log_message('error', "Error inserting book into {$this->books_table}: [Errno:{$this->db->_error_number()}] {$this->db->_error_message()}");
			throw new Exception("error_add_book");
		}

		$book_id = $this->db->insert_id();
		if (!empty($user_id)) {
			$this->save_users($book_id, array($user_id), 'author');
		}

    	return $book_id;

    }

    public function duplicate($array=array(), $captcha=true) {

  		$book_id =@ $array['book_to_duplicate'];
 		if (empty($book_id)) throw new Exception('Invalid book ID');
    	// Don't validate author, as admin functions can create books not connected to any author
		$book = $this->get($array['book_to_duplicate']);
		if (!self::is_duplicatable($book)) throw new Exception('not_duplicatable');

		if ($captcha) {
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
			// Validate ReCAPTCHA
			if (!empty($recaptcha2_site_key)) {
				if (!isset($_POST['g-recaptcha-response'])) throw new Exception('invalid_captcha_1');
				$recaptcha = new ReCaptcha($recaptcha2_secret_key);
				$resp = $recaptcha->verify($_POST['g-recaptcha-response'], $_SERVER['REMOTE_ADDR']);
				if ($resp->isSuccess()):
					// Success
				else:
					throw new Exception('invalid_captcha_1');
				endif;
			} elseif (!empty($recaptcha_private_key)) {
				$resp = recaptcha_check_answer($recaptcha_private_key, $_SERVER["REMOTE_ADDR"], $array["recaptcha_challenge_field"], $array["recaptcha_response_field"]);
				if (!$resp->is_valid) throw new Exception ('invalid_captcha_2');
			}
		}

    	$this->load->library('Duplicate', 'duplicate');
    	try {
			$book_id = $this->duplicate->book($array);
		} catch (Exception $e) {
    		throw new Exception('error_while_duplicating');
		}

    	return $book_id;

    }

    public function delete($book_id=0) {

    	if (empty($book_id)) return false;

		$this->load->helper('directory');

		$this->db->select('slug');
		$this->db->from($this->books_table);
		$this->db->where('book_id', $book_id);
		$query = $this->db->get();
		$result = $query->result();
		if (!isset($result[0])) throw new Exception('Could not find book');
		$slug = $result[0]->slug;
		if (empty($slug)) die('Could not determine slug.');

 		try {
			$storage = $this->getStorage($slug)->destroy();
		} catch(Scalar_Storage_Exception $e) {
 			error_log($e->getMessage());
 			throw new Exception("Error removing directory from file structure.");
		}

   		$CI =& get_instance();
    	$CI->load->model('page_model','pages');  // NOTE: loading a model within a model
		$pages = $CI->pages->get_all($book_id);
		foreach ($pages as $page) {
			$CI->pages->delete($page->content_id);
			usleep(500);  // .0005 seconds -- let MySQL locked tables catch up
		}

		$this->db->where('book_id', $book_id);
		$this->db->delete($this->books_table);

		$this->db->where('book_id', $book_id);
		$this->db->delete($this->user_book_table);

		return true;

    }

    public function delete_user($book_id=0, $user_id=0) {

    	if (empty($book_id)) throw new Exception('Invalid book ID');
    	if (empty($user_id)) throw new Exception('Invalid user ID');

 		$this->db->where('book_id', $book_id);
 		$this->db->where('user_id', $user_id);
		$this->db->delete($this->user_book_table);
		return true;

    }

    public function save($array=array()) {

	    $this->load->library('File_Upload', array(
		    'slug' => $this->data['book']->slug,
		    'adapter' => $this->config->item('storage_adapter'),
		    'adapterOptions' => $this->config->item('storage_adapter_options'),
		));

	    // Get ID
	    $book_id = @ $array['book_id'];
	    if (empty($book_id)) throw new Exception('Invalid book ID');
	    unset($array['book_id']);
	    unset($array['section']);
	    unset($array['id']);

		// Remove background
	    if (isset($array['remove_background']) && !empty($array['remove_background'])) $array['background'] = '';
	    unset($array['remove_background']);
		// Remove thumbnail
	    if (isset($array['remove_thumbnail']) && !empty($array['remove_thumbnail'])) $array['thumbnail'] = '';
	    unset($array['remove_thumbnail']);
	    // Remove publisher thumbnail
	    if (isset($array['remove_publisher_thumbnail']) && !empty($array['remove_publisher_thumbnail'])) $array['publisher_thumbnail'] = '';
	    unset($array['remove_publisher_thumbnail']);
	    // Editions
	    if (isset($array['editions']) && !empty($array['editions'])) {
		    $array['editions'] = serialize($array['editions']);
	    } elseif (isset($array['editions'])) {
		    $array['editions'] = '';
	    }

	    // Manage slug
	    if (isset($array['slug'])) {

		    // Get previous slug
			$this->db->select('slug');
			$this->db->from($this->books_table);
			$this->db->where('book_id', $book_id);
			$query = $this->db->get();
			$result = $query->result();
			if (!isset($result[0])) throw new Exception('Could not find book');
			$slug = $result[0]->slug;

		    // Scrub slug
		    if (!function_exists('safe_name')) {
  				$ci = get_instance();
				$ci->load->helper('url');
		    }
		    $array['slug'] = safe_name($array['slug'], false);  // Don't allow forward slashes

			// If slug has changed, rename folder and update text content URLs
			if ($array['slug'] != $slug) {
				$dbprefix = $this->db->dbprefix;  // Since we're using a custom MySQL query below
				if (empty($dbprefix)) die('Could not resolve DB prefix. Nothing has been saved. Please try again');
				// Check if folder already exists, if so, add a "-N"
				$orig_slug = $array['slug'];
	    		$count = 1;
				while (file_exists($array['slug'])) {
					$array['slug'] = create_suffix($orig_slug, $count);
					$count++;
				}

				// Rename folder
				$storage = $this->getStorage($this->data['book']->slug);
				if (false === $storage->transferTo($array['slug'])) {
					throw new Exception('The destination folder already exists or the source folder doesn\'t exist.');
				}
				
				$columns = array('background', 'thumbnail', 'banner');
				foreach ($columns as $column) {
					// update background urls
					$q = "SELECT $column, content_id ".
						 "FROM $dbprefix"."content " .
						 "WHERE book_id = $book_id " .
						 "AND INSTR($column, '/$slug/')";
					$query = $this->db->query($q);
					
					
					if ($query->num_rows()) {
						$result = $query->result();
						foreach ($result as $row) {
							$old_url = $row->$column;
							$content_id = $row->content_id;
							$new_url = str_replace("/$slug/", "/".$array['slug']."/", $old_url);
							$this->db->where($column, $old_url);
							$this->db->update('scalar_db_content', array($column => $new_url));
							$this->db->where('content_id', $content_id);
							$this->db->update('scalar_db_versions', array('url' => $new_url));	
						}
					}
				}
			}
			
	    }

		// File -- save thumbnail
		if (isset($_FILES['upload_thumb'])&&$_FILES['upload_thumb']['size']>0) {
			$array['thumbnail'] = $this->file_upload->uploadBookThumb($_FILES['upload_thumb']);
		}

		// File -- save publisher thumbnail
		if (isset($_FILES['upload_publisher_thumb'])&&$_FILES['upload_publisher_thumb']['size']>0) {
			$array['publisher_thumbnail'] = $this->file_upload->uploadPublisherThumb($_FILES['upload_publisher_thumb']);
		}

		// Remove book versions (ie, main menu), which is handled by save_versions()
		foreach ($array as $field => $value) {
			if (substr($field, 0, 13) != 'book_version_') continue;
			unset($array[$field]);
		}

		// Validate HTML in title, subtitle, description
		/*
		if (isset($array['title']) && !empty($array['title'])) {
			$doc = new DOMDocument();
			$doc->substituteEntities = false;
			$array['title'] = mb_convert_encoding($array['title'], 'html-entities', 'utf-8');
			@$doc->loadHTML('<div>'.$array['title'].'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
			$array['title'] = substr($doc->saveXML($doc->getElementsByTagName('div')->item(0)), 5, -6);
		}
		if (isset($array['subtitle']) && !empty($array['subtitle'])) {
			$doc = new DOMDocument();
			$doc->substituteEntities = false;
			$array['subtitle'] = mb_convert_encoding($array['subtitle'], 'html-entities', 'utf-8');
			@$doc->loadHTML('<div>'.$array['subtitle'].'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
			$array['subtitle'] = substr($doc->saveXML($doc->getElementsByTagName('div')->item(0)), 5, -6);
		}
		if (isset($array['description']) && !empty($array['description'])) {
			$doc = new DOMDocument();
			$doc->substituteEntities = false;
			$array['description'] = mb_convert_encoding($array['description'], 'html-entities', 'utf-8');
			@$doc->loadHTML('<div>'.$array['description'].'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
			$array['description'] = substr($doc->saveXML($doc->getElementsByTagName('div')->item(0)), 5, -6);
		}
		if (isset($array['publisher']) && !empty($array['publisher'])) {
			$doc = new DOMDocument();
			$doc->substituteEntities = false;
			$array['publisher'] = mb_convert_encoding($array['publisher'], 'html-entities', 'utf-8');
			@$doc->loadHTML('<div>'.$array['publisher'].'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
			$array['publisher'] = substr($doc->saveXML($doc->getElementsByTagName('div')->item(0)), 5, -6);
		}
		*/

		// Save row
		$this->db->where('book_id', $book_id);
		$this->db->update($this->books_table, $array);
		return $array;

    }

    // Table of Contents
    // Always save most recent version; edit page ensures links stay established in the other direction
    public function save_versions($array=array()) {

    	$book_id =@ $array['book_id'];
    	if (empty($book_id)) throw new Exception('Invalid book ID');
		self::reset_book_versions($book_id);
		$CI =& get_instance();
		if (!is_object($CI->versions)) $this->load->model('version_model', 'versions');

		$sort_number = 1;
		foreach ($array as $field => $value) {
			if (substr($field, 0, 13) != 'book_version_') continue;
			$value = (int) $value;
			if (!$value) continue;
			$version_id = (int) substr($field,13);
			$content_id = $CI->versions->get_content_id($version_id);
			$top_version = $this->get_top_version($content_id);
			$top_version_id = $top_version->version_id;
			$this->db->where('version_id', $top_version_id);
			$this->db->update($this->versions_table, array( 'sort_number'=>$sort_number++ ));
		}
		return $array;

    }

    public function save_users($book_id, $user_ids=array(), $role='author') {

    	foreach ($user_ids as $user_id) {
    		if (empty($user_id)) continue;
    		$this->db->where('book_id', $book_id);
    		$this->db->where('user_id', $user_id);
			$this->db->delete($this->user_book_table);
			$data = array(
               'book_id' => $book_id,
               'user_id' => $user_id,
               'relationship' => $role,
               'list_in_index' => 1
            );
			$this->db->insert($this->user_book_table, $data);
    	}

    	return $this->get_users($book_id);

    }

    public function save_editorial_states($book_id=0, $state=null, $is_live=true, $only_if_in_state=null, $user_id=null) {

    	$ci=&get_instance();
    	$ci->load->model("version_model","versions");

    	// Get all pages in a book
    	$this->db->select('content_id');
    	$this->db->select('recent_version_id');
    	$this->db->from($this->pages_table);
    	$this->db->where('book_id', $book_id);
    	if ($is_live) $this->db->where('is_live', 1);
    	$query = $this->db->get();
    	$result = $query->result();

    	// Get most recent versions
    	$version_ids = array();
    	foreach ($result as $row) {
    		$version = $this->versions->get_single($row->content_id, $row->recent_version_id);
    		if (empty($version)) continue;
    		if (!empty($only_if_in_state) && $version->editorial_state != $only_if_in_state) continue;
    		$version_ids[] = (int) $version->version_id;
    	}
    	if (empty($version_ids)) return $version_ids;

    	// Set states
    	foreach ($version_ids as $version_id) {
    		$save = array('id'=>$version_id,'editorial_state'=>$state);
    		if (null!==$user_id) $save['user'] = $user_id;
    		$this->versions->save($save);
    	}
    	return $version_ids;

    }

    public function delete_users($book_id) {

    	if (empty($book_id)) throw new Exception('Could not resolve book ID');
    	$this->db->delete($this->user_book_table, array('book_id' => $book_id));

    }

    public function create_directory_from_slug($slug='') {
		try {
			$this->getStorage($slug)->setUp();
		} catch(Scalar_Storage_Exception $e) {
			throw new Exception('There was a problem creating the '.$slug.' folder.');
		}
	}

    public function enable_editorial_workflow($book_id, $bool) {

    	$val = ($bool) ? 1 : 0;
    	$this->db->where('book_id', $book_id);
    	$this->db->update($this->books_table, array('editorial_is_on'=>$val));

    }

    public function get_users($book_id, $return_personals=false, $order_by=null, $order_dir='ASC') {

    	if (empty($order_by)) $order_by = $this->user_book_table.'.sort_number';

		$this->db->select('*');
		$this->db->from($this->users_table);
		$this->db->where($this->user_book_table.'.book_id', $book_id);
		$this->db->join($this->user_book_table, $this->user_book_table.'.user_id = '.$this->users_table.'.user_id');
		$this->db->order_by($order_by, $order_dir);

		$query = $this->db->get();
		$result = $query->result();
		if (!$return_personals) {
			for ($j = 0; $j < count($result); $j++) {
				unset($result[$j]->password);
			}
		}
		return $result;

    }

	/**
	 * Determine whether a book slug exists in the database.
	 */
    public function slug_exists($slug) {
	    $result = $this->db->get_where($this->books_table, array('slug' => $slug));
	    if($result->num_rows > 0) {
		    return true;
	    }
	    return false;
    }

	private function getStorage($bookSlug) {
		require_once APPPATH . 'libraries/Scalar/Storage.php';
		return new Scalar_Storage(array(
			'folder' => $bookSlug,
			'adapter' => $this->config->item('storage_adapter'),
			'adapterOptions' => $this->config->item('storage_adapter_options'),
		));
	}
}
?>
