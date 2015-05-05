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
 * @projectDescription	Model for book database table
 * @author				Craig Dietrich
 * @version				2.2
 */

function sortBookVersions($a, $b) {
	$x = (int) strtolower($a->sort_number);
	$y = (int) strtolower($b->sort_number);
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
    	return $book;

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

    public function get_all($user_id=0, $is_live=false, $orderby='title',$orderdir='asc',$total=null,&$start=null) {

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

    	if (mysql_errno()!=0) echo mysql_error();
    	$result = $query->result();
    	for ($j = 0; $j < count($result); $j++) {
    		$result[$j]->users = $this->get_users($result[$j]->book_id, true, '');
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
    	if (mysql_errno()!=0) echo mysql_error();
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
    	if (mysql_errno()!=0) echo mysql_error();
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
	public function has_paywall($book) {
		if (empty($book)) return false;
		$tinypass_config_path = confirm_slash(FCPATH).$book->slug.'/tinypass.php';
    	if (file_exists($tinypass_config_path)) return true;
    	return false;
    }

    public function get_images($book_id) {

    	$q = "SELECT A.content_id, A.slug, B.version_id, B.url, B.title, B.version_num ".
    		 "FROM scalar_db_content A, scalar_db_versions B " .
    		 "WHERE B.content_id = A.content_id " .
    		 "AND A.book_id = $book_id " .
    		 "AND A.type='media' " .
    	     "AND A.is_live = 1 " .
    		 "AND (B.url LIKE '%.gif' OR B.url LIKE '%.jpg' OR B.url LIKE '%.jpeg' OR B.url LIKE '%.png' OR B.url LIKE '%JPEG%') " .
    		 "ORDER BY B.title ASC";
    	$query = $this->db->query($q);
    	if (mysql_errno()!=0) echo 'Error: '.mysql_error()."\n";
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
			$return[$content_id]->version_index = count($return[$content_id]->versions)-1;
		}
    	return $return;

    }

    public function get_audio($book_id) {

    	$q = "SELECT A.content_id, A.slug, B.version_id, B.url, B.title, B.version_num ".
    	     "FROM scalar_db_content A, scalar_db_versions B " .
    		 "WHERE B.content_id = A.content_id " .
    		 "AND A.book_id = $book_id " .
    		 "AND A.type='media' " .
    	     "AND A.is_live = 1 " .
    		 "AND (B.url LIKE '%.wav' OR B.url LIKE '%.mp3' OR B.url LIKE '%soundcloud%' OR B.url LIKE '%.oga' OR B.url LIKE '%.wav' OR B.url LIKE '%WAVE%' OR B.url LIKE '%MP3%') " .
    		 "ORDER BY B.title ASC";
    	$query = $this->db->query($q);
    	if (mysql_errno()!=0) echo 'Error: '.mysql_error()."\n";
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
			$return[$content_id]->version_index = count($return[$content_id]->versions)-1;
		}
    	return $return;

    }

	// Table of Contents
    public function get_book_versions($book_id, $is_live=false) {

    	$this->db->select($this->versions_table.'.*');
    	$this->db->from($this->versions_table);
    	$this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
    	$this->db->where($this->versions_table.'.sort_number >', 0);
    	$this->db->where($this->pages_table.'.book_id', $book_id);
    	if ($is_live) $this->db->where($this->pages_table.'.is_live', 1);
    	$query = $this->db->get();
    	if (mysql_errno()!=0)throw new Exception(mysql_error());
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

        if (!empty($is_featured)) {
            $temp = 'is_featured = 1 AND ';
            $temp .= 'display_in_index = 1 ';
        }
        else {
            $temp = 'is_featured = 0 AND ';
            $temp .= 'display_in_index = 1 ';
        }

        if(!empty($sq)) {
            $temp .= 'AND (slug LIKE \'%'.$sq.'%\' OR title LIKE \'%'.$sq.'%\' OR description LIKE \'%'.$sq.'%\')';
        }
        $this->db->where($temp);
        $this->db->order_by($orderby, $orderdir);

        $query = $this->db->get($this->books_table);
        $result = $query->result();
        for ($j = 0; $j < count($result); $j++) {
            $result[$j]->users = $this->get_users($result[$j]->book_id, true);
        }

        return $result;

    }

    public function add($array=array()) {

    	if ('array'!=gettype($array)) $array = (array) $array;
    	$CI =& get_instance();

 		$title =@ $array['title'];
 		if (empty($title)) $title = 'Untitled';
    	$user_id =@ (int) $array['user_id'];  // Don't validate, as admin functions can create books not connected to any author
 		$book_user = (empty($user_id)&&isset($CI->data['login'])) ? (int) $CI->data['login']->user_id : $user_id;
    	$template = (isset($array['template'])&&!empty($array['template'])) ? $array['template'] : null;
    	$stylesheet = (isset($array['stylesheet'])&&!empty($array['stylesheet'])) ? $array['stylesheet'] : $this->default_stylesheet;
		$chmod_mode = $this->config->item('chmod_mode');

    	if (empty($title)) throw new Exception('Could not resolve title');
    	$active_melon = $this->config->item('active_melon');
    	if (empty($template) && !empty($active_melon)) $template = trim($active_melon);  // Otherwise use MySQL default
    	if (empty($chmod_mode)) $chmod_mode = 0777;

    	$uri = $orig = safe_name($title, false);  // Don't allow forward slashes
    	$count = 1;
 		while (file_exists($uri)) {
 			$uri = create_suffix($orig, $count);
 			$count++;
 		}

 		if (!mkdir($uri)) {
 			throw new Exception('There was a problem creating the book\'s folder on the filesystem -- check permissions of the parent folder.');
 		}
 		if (!mkdir(confirm_slash($uri).'media')) {
 			throw new Exception('Could not create media folder in book folder -- check permissions on the parent folder.');
 		}

    	@chmod($uri, $chmod_mode);
    	@chmod(confirm_slash($uri).'media', $chmod_mode);

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

		$this->db->insert($this->books_table, $data);
		$book_id = mysql_insert_id();

		if (!empty($user_id)) $this->save_users($book_id, array($user_id), 'author');

    	return $book_id;

    }

    public function duplicate($array=array()) {

  		$book_id =@ $array['book_to_duplicate'];
 		if (empty($book_id)) throw new Exception('Invalid book ID');
    	// Don't validate, as admin functions can create books not connected to any author
		$book = $this->get($array['book_to_duplicate']);
		if (!self::is_duplicatable($book)) throw new Exception('Book is not duplicatable');

    	$this->load->library('Duplicate', 'duplicate');
    	try {
			$book_id = $this->duplicate->book($array);
		} catch (Exception $e) {
    		throw new Exception($e->getMessage());
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

 		if (file_exists($slug) && !recursive_remove_directory($slug)) die('Could not remove directory from file structure.');

   		$CI =& get_instance();
    	$CI->load->model('page_model','pages');  // NOTE: loading a model within a model
		$pages = $CI->pages->get_all($book_id);
		foreach ($pages as $page) {
			$CI->pages->delete($page->content_id);
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
		if (mysql_errno()!=0) throw new Exception(mysql_error());
		return true;

    }

    public function save($array=array()) {

        $this->load->library('File_Upload','file_upload');
    	// Get ID
    	$book_id =@ $array['book_id'];
    	if (empty($book_id)) throw new Exception('Invalid book ID');
    	unset($array['book_id']);
    	unset($array['section']);
    	unset($array['id']);

		// Remove thumbnail
    	if (isset($array['remove_thumbnail']) && !empty($array['remove_thumbnail'])) $array['thumbnail'] = '';
    	unset($array['remove_thumbnail']);

    	// Remove publisher thumbnail
    	if (isset($array['remove_publisher_thumbnail']) && !empty($array['remove_publisher_thumbnail'])) $array['publisher_thumbnail'] = '';
    	unset($array['remove_publisher_thumbnail']);

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

			// If slug has changed, rename folder on filesystem and update text content URLs
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
				// Rename folder on the filesystem
				if (!rename(confirm_slash(FCPATH).$slug, confirm_slash(FCPATH).$array['slug'])) die('Could not rename directory.'); // TODO: throw exception
				// Update hard URLs in version contet
				$old = confirm_slash(base_url()).confirm_slash($slug);
				$new = confirm_slash(base_url()).confirm_slash($array['slug']);
				$query = $this->db->query("UPDATE ".$dbprefix.$this->versions_table." SET content = replace(content, '$old', '$new')");
				if (mysql_errno()!=0) throw new Exception('Could not update URLs in database.  Note that the slug was changed on the filesystem. ('.mysql_error().')');
			}

    	}

		// File -- save thumbnail
		if (isset($_FILES['upload_thumb'])&&$_FILES['upload_thumb']['size']>0) {
			try {
                $chmod_mode = $this->config->item('chmod_mode');
                if (empty($chmod_mode)) $chmod_mode = 0777;
                $book = $this->get($book_id);
                $slug = $book->slug;
                $array['thumbnail'] = $this->file_upload->uploadThumb($slug,$chmod_mode);
			} catch (Exception $e) {
   				throw new Exception($e->getMessage());
			}
		}

		// File -- save publisher thumbnail
		if (isset($_FILES['upload_publisher_thumb'])&&$_FILES['upload_publisher_thumb']['size']>0) {
			try {
                $chmod_mode = $this->config->item('chmod_mode');
                if (empty($chmod_mode)) $chmod_mode = 0777;
                $book = $this->get($book_id);
                $slug = $book->slug;
                $array['publisher_thumbnail'] = $this->file_upload->uploadPublisherThumb($slug,$chmod_mode);
			} catch (Exception $e) {
   			 	throw new Exception($e->getMessage());
			}
		}

		// Remove book versions (ie, main menu), which is handled by save_versions()
		foreach ($array as $field => $value) {
			if (substr($field, 0, 13) != 'book_version_') continue;
			unset($array[$field]);
		}

		// Save row
		$this->db->where('book_id', $book_id);
		$this->db->update($this->books_table, $array);
		if (mysql_errno()!=0) throw new Exception('MySQL error: '.mysql_error());
		return $array;

    }

    public function save_versions($array=array()) {

    	// Get ID
    	$book_id =@ $array['book_id'];
    	if (empty($book_id)) throw new Exception('Invalid book ID');
    	// Book versions (ie, main menu)
		self::reset_book_versions($book_id);
		$sort_number = 1;
		foreach ($array as $field => $value) {
			if (substr($field, 0, 13) != 'book_version_') continue;
			$version_id = (int) substr($field,13);
			$value = (int) $value;
			if ($value) {
				$this->db->where('version_id', $version_id);
				$this->db->update($this->versions_table, array( 'sort_number'=>$sort_number++ ));
			}
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

    public function delete_users($book_id) {

    	if (empty($book_id)) throw new Exception('Could not resolve book ID');
    	$this->db->delete($this->user_book_table, array('book_id' => $book_id));

    }

    public function create_directory_from_slug($slug='') {

 		if (!mkdir($slug)) {
 			throw new Exception('There was a problem creating the '.$slug.' folder on the filesystem.');
 		}
 		if (!mkdir(confirm_slash($slug).'media')) {
 			echo 'Alert: could not create media folder for '.$slug.'.';
 		}

    	chmod($slug, 0777);
    	chmod(confirm_slash($slug).'media', 0777);


    }

    public function get_by_slug($uri='') {

 		$query = $this->db->get_where($this->books_table, array('slug'=>$uri));
		$result = $query->result();
		if (!isset($result[0])) return null;
    	for ($j = 0; $j < count($result); $j++) {
    		$result[$j]->urn = $this->urn($result[$j]->book_id);
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
    	}
		return $result[0];

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

    public function slug_exists($slug='') {

    	return ((file_exists($slug)) ? true : false);

    }

}
?>
