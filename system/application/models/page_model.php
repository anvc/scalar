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
 * @projectDescription	Model for content database table
 * @author				Craig Dietrich
 * @version				2.2
 */

class Page_model extends MY_Model {

    public function __construct() {

        parent::__construct();

    }

	public function urn($pk=0) {

		return str_replace('$1', $pk, $this->page_urn_template);

	}

    public function get($content_id=0) {

     	$this->db->where('content_id',$content_id);
    	$query = $this->db->get($this->pages_table);
    	if (!$query->num_rows) return null;
    	$result = $query->result();
    	$result[0]->urn = $this->urn($result[0]->content_id);
    	return $result[0];

    }

    public function get_all($book_id=null, $type=null, $category=null, $is_live=true, $id_array=null) {

    	$this->db->distinct();
    	$this->db->select($this->pages_table.'.*');
    	$this->db->from($this->pages_table);
     	if (!empty($type)) $this->db->where($this->pages_table.'.type',$type);
     	if (!empty($category)) $this->db->where($this->pages_table.'.category',$category);
     	if (!empty($book_id)) $this->db->where($this->pages_table.'.book_id',$book_id);
     	if (!empty($is_live)) $this->db->where($this->pages_table.'.is_live', 1);
     	if (!empty($id_array)) $this->db->where_in($this->pages_table.'.content_id', $id_array);
    	$this->db->order_by($this->pages_table.'.slug', 'asc');
    	$query = $this->db->get();
    	$result = $query->result();
    	for ($j = 0; $j < count($result); $j++) {
    		$result[$j]->urn = $this->urn($result[$j]->content_id);
    	}
    	return $result;

    }

    // Search assuming the recent_version_id field is set ... this should run fastly
    public function search_with_recent_version_id($book_id, $terms, $type=null, $is_live=true) {
    	
   		$content = array();
    	if (empty($terms)) return $content;
    	$terms = implode(' ', $terms);
    	$this->db->select($this->db->dbprefix($this->versions_table).'.*');
    	$this->db->select($this->db->dbprefix($this->pages_table).'.*');
    	$this->db->from($this->versions_table.','.$this->pages_table);
    	$this->db->where($this->pages_table.'.recent_version_id = '.$this->db->dbprefix($this->versions_table).'.version_id');
    	$this->db->where($this->pages_table.'.book_id', $book_id);
    	$this->db->where('('.$this->db->dbprefix($this->versions_table).'.title LIKE \'%'.$terms .'%\' OR '. $this->db->dbprefix($this->versions_table).'.description LIKE \'%'. $terms.'%\')');
    	if (!empty($type)) $this->db->where($this->pages_table.'.type',$type);
    	if (!empty($is_live)) $this->db->where($this->pages_table.'.is_live', 1);
    	$this->db->order_by($this->pages_table.'.slug');
    	// Adding URL and content slows the search down to the order of magnitude of the get_all() approach
 		$query = $this->db->get();
 		if (!$query->num_rows) return $content;
 		$result = $query->result();  

 		// Get page columns
 		$pages_fields = array();
 		$query = $this->db->query("SHOW COLUMNS FROM ".$this->db->dbprefix($this->pages_table));
		$_result = $query->result();
		foreach ($_result as $row) {
			$pages_fields[] = $row->Field;
		}
 		
 		// Get version columns
		$versions_fields = array();
		$query = $this->db->query("SHOW COLUMNS FROM ".$this->db->dbprefix($this->versions_table));
		$_result = $query->result();
		foreach ($_result as $row) {
			$versions_fields[] = $row->Field;
		}
 		
 		$count = 0;
 		foreach ($result as $row) {
 			$content[$count] = new stdClass();
 			foreach ($row as $field => $value) {
 				if (in_array($field, $pages_fields)) $content[$count]->$field = $value;
 			}
 			$content[$count]->urn = $this->urn($content[$count]->content_id);
 			$content[$count]->versions = array();
 			$content[$count]->versions[0] = new stdClass();
 			foreach ($row as $field => $value) {
 				if (in_array($field, $versions_fields)) $content[$count]->versions[0]->$field = $value;
 			}
 			$content[$count]->versions[0]->urn = $this->version_urn($content[$count]->versions[0]->version_id);
 			$count++;
 		}
 		
 		return $content;
    	
    }
    
    // Determine whether a book hasn't saved pages in a while (thus recent_version_id's are 0) or has (IDs filled in)
    public function is_using_recent_version_id($book_id) {

    	$this->db->select('content_id');
    	$this->db->from($this->pages_table);
    	$this->db->where('book_id', $book_id);
		$this->db->where('recent_version_id', 0);
    	$count = $this->db->count_all_results();
    	if ($count) return false;   // One or more recent_version_id values is 0 ... is this the best approach?
    	return true;
    	
    }
    
    // This is only used by Book->search() (the /search page)
    // TODO: do a better intersect between terms
    public function search($book_id=null, $terms=array(), $is_live=true) {

 		$content = array();
 		if (empty($terms)) return $content;
 		$count = 1;
 		foreach ($terms as $term) {
 			$this->db->select($this->versions_table.'.*');
 			$this->db->select($this->pages_table.'.slug');
 			$this->db->select($this->pages_table.'.book_id');
 			$this->db->select($this->pages_table.'.type');
 			$this->db->from($this->versions_table);
 			$this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
 			$this->db->where($this->pages_table.'.book_id', $book_id);
 			if (!empty($is_live)) $this->db->where($this->pages_table.'.is_live', 1);
			$this->db->where("(`".$this->db->dbprefix.$this->versions_table."`.title LIKE '%".$this->db->escape_like_str($term)."%' ESCAPE '!' OR `".$this->db->dbprefix.$this->versions_table."`.description LIKE '%".$this->db->escape_like_str($term)."%' ESCAPE '!' OR `".$this->db->dbprefix.$this->versions_table."`.content LIKE '%".$this->db->escape_like_str($term)."%' ESCAPE '!')", NULL);
 			$this->db->order_by($this->versions_table.'.version_num', 'desc');
 			$query = $this->db->get();
 			if (!$query->num_rows) continue;
 			$result = $query->result();
 			foreach ($result as $row) {
 				if ($count>1 && !isset($content[$row->content_id])) continue;  // so that terms refine rather than expand
 				if (!isset($content[$row->content_id])) {
 					$content[$row->content_id] = new stdClass;
 					$content[$row->content_id]->versions = array();
 				}
 				$content[$row->content_id]->versions[] = $row;
 			}
 			$count++;
 		}

 		$remove = array();
 		foreach ($content as $key => $row) {
 			if (!$this->is_top_version($row->versions[0]->content_id, $row->versions[0]->version_num)) {
 				$remove[] = $key;
 			} else {
 				$content[$key]->content_id = $row->versions[0]->content_id;
 				$content[$key]->slug = $row->versions[0]->slug;
 				$content[$key]->type = $row->versions[0]->type;
 			}
 		}
 		foreach ($remove as $key) {
 			unset($content[$key]);
 		}

 		return $content;

    }

    public function get_by_slug($book_id=0, $slug='', $is_live=false) {

    	$this->db->where('book_id',$book_id);
    	$this->db->where('slug',$slug);
    	if (!empty($is_live)) $this->db->where('is_live', 1);
    	$this->db->limit(1); // There should only be one item
    	$query = $this->db->get($this->pages_table);
    	if (!$query->num_rows) return null;
    	$result = $query->result();
    	$result[0]->urn = $this->urn($result[0]->content_id);
    	return $result[0];

    }

    public function get_by_version_url($book_id=0, $url='', $is_live=false) {

    	$return = array();
    	$ci=&get_instance();
    	$ci->load->model("version_model","versions");

    	// Get all versions
    	$this->db->select($this->versions_table.'.*');
    	$this->db->from($this->versions_table);
    	$this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
    	$this->db->join($this->books_table, $this->books_table.'.book_id='.$this->pages_table.'.book_id');
    	$this->db->where($this->books_table.'.book_id', $book_id);
    	$this->db->where($this->versions_table.'.url', $url);
    	if (!empty($is_live)) $this->db->where($this->pages_table.'.is_live', 1);
    	$this->db->order_by($this->versions_table.'.version_id', 'desc');
    	$query = $this->db->get();
    	if (!$query->num_rows) return null;
    	$result = $query->result();
    	
    	// Group by content ID
    	for ($j = 0; $j < count($result); $j++) {
    		if (!array_key_exists($result[$j]->content_id, $return)) {
    			$return[$result[$j]->content_id] = (object) array();
    			$return[$result[$j]->content_id]->versions = array();
    		}
    		$result[$j]->urn = $ci->versions->urn($result[$j]->version_id);
    		$result[$j]->attribution = unserialize_recursive($result[$j]->attribution);
    		$result[$j]->rdf = $ci->rdf_store->get_by_urn('urn:scalar:version:'.$result[$j]->version_id);
    		$result[$j]->citation = '';
    		$return[$result[$j]->content_id]->versions[] = $result[$j];
    	}

    	foreach ($return as $content_id => $row) {
    		$content = $this->get($content_id);
    		$content->versions = $return[$content_id]->versions;
    		$content->version_index = 0;
    		$return[$content_id] = $content;
    	}
    	
    	return $return;

    }

    public function is_owner($user_id=0, $content_id=0) {

    	$user_id = (int) $user_id;
    	$this->db->select('user');
    	$this->db->from($this->pages_table);
    	$this->db->where('content_id', $content_id);
    	$this->db->limit(1);
    	$query = $this->db->get();
    	$result = $query->result();
    	$single_result = $result[0];
    	if ($single_result->user != $user_id) return false;
    	return true;

    }

    public function set_live($content_id=0, $bool=true) {

    	$this->db->where('content_id',$content_id);
		$this->db->set('is_live', $bool ? '1' : '0');
		$this->db->update($this->pages_table);

    }

    public function delete($content=0) {

    	if (is_numeric($content)) $content_id = (int) $content;
    	if (isset($content->content_id)) $content_id = (int) $content->content_id;
    	if (empty($content_id)) return false;
    	unset($content);

		// Get book slug (for deleting files)
    	$this->db->select($this->books_table.".slug");
    	$this->db->select($this->books_table.".book_id");
    	$this->db->from($this->pages_table);
    	$this->db->join($this->books_table, $this->books_table.'.book_id='.$this->pages_table.'.book_id');
    	$this->db->where($this->pages_table.'.content_id',$content_id);
    	$query = $this->db->get();
    	$result = $query->result();
    	$book_id = (int) $result[0]->book_id;
    	$book_slug = $result[0]->slug;

		// Delete from content table

		$this->db->where('content_id', $content_id);
		$this->db->delete($this->pages_table);

		// Get versions and delete from relationship tables and meta

        $ci=&get_instance();
		$ci->load->model("version_model","versions");

		$this->db->where('content_id', $content_id);
		$query = $this->db->get($this->versions_table);
		$result = $query->result();
		$url_cache = array();
		foreach ($result as $row) {
			$version_id = (int) $row->version_id;
			$ci->versions->delete($version_id);
			$url_cache[] = $row->url;  // Physical file
		}

		// Delete physical file (if not used by another page)
		foreach ($url_cache as $url) {
			if (!empty($url) && !isURL($url) && !empty($book_slug)) { // is local
				// Make sure this resource isn't being used by another page in the same book
				$version = $ci->versions->get_by_url($url);
				if (!empty($version)) {
					$content = $this->get($version->content_id);
					if (!empty($content) && (int) $content->book_id == $book_id) {
						continue; // Don't delete
					}
				}
				// Go ahead and delete
				$thumb_url = confirm_slash(FCPATH).confirm_slash($book_slug).substr_replace($url, "_thumb", strrpos($url, "."),0);
				$url = confirm_slash(FCPATH).confirm_slash($book_slug).$url;
				if (file_exists($url) && !unlink($url)) echo 'Warning: could not delete file.';
				if (file_exists($thumb_url)) unlink($thumb_url);
			}
		}

		return true;

    }

    public function save($array=array()) {

    	// Get ID
    	$content_id = (int) $array['id'];
    	if (empty($content_id)) throw new Exception('Could not resolve content ID');
    	unset($array['id']);
    	unset($array['section']);
    	unset($array['ci_session']);
    	if (isset($array['color']) && $array['color']=='#ffffff') $array['color'] = '';
    	if (isset($array['category']) && $array['category']==='') $array['category'] = null;

    	// If the slug has changed...
    	if (isset($array['slug'])) {

	    	// Get previous slug
			$this->db->select('slug');
			$this->db->from($this->pages_table);
			$this->db->where('content_id', $content_id);
			$query = $this->db->get();
			$result = $query->result();
			if (!isset($result[0])) throw new Exception('Could not find book');
			$slug = $result[0]->slug;

	    	// Get book slug
			$this->db->select($this->books_table.'.slug');
			$this->db->select($this->books_table.'.book_id');
			$this->db->from($this->pages_table);
			$this->db->join($this->books_table, $this->books_table.'.book_id='.$this->pages_table.'.book_id');
			$this->db->where($this->pages_table.'.content_id', $content_id);
			$query = $this->db->get();
			$result = $query->result();
			if (!isset($result[0])) throw new Exception('Could not find book');
			$book_slug = $result[0]->slug;
			$book_id = (int) $result[0]->book_id;

    		// Scrub slug
    		if (!function_exists('safe_name')) {
  				$ci = get_instance();
				$ci->load->helper('url');
    		}
    		$array['slug'] = safe_name($array['slug']);
    	    $array['slug'] = $this->safe_slug($array['slug'], $book_id, $content_id);

			// Rewrite URLs in book text content
			// This is most likely not to be completely trusted but if working properly provides a userful service to authors since linking is important in Scalar
			if ($array['slug'] != $slug) {
				// Get all of the versions attached to this book
				$this->db->select($this->versions_table.'.version_id');
				$this->db->from($this->versions_table);
				$this->db->join($this->pages_table, $this->versions_table.'.content_id='.$this->pages_table.'.content_id');
				$this->db->join($this->books_table, $this->pages_table.'.book_id='.$this->books_table.'.book_id');
				$this->db->where($this->books_table.'.book_id', $book_id);
				$query = $this->db->get();
				if ($query->num_rows()) {
					$dbprefix = $this->db->dbprefix;  // Since we're using a custom MySQL query below
					if (empty($dbprefix)) die('Could not resolve DB prefix. Nothing has been saved. Please try again');
					$book_version_ids = array();
					$result = $query->result();
					foreach ($result as $row) $book_version_ids[] = $row->version_id;
					if (!empty($book_version_ids)) {
						// Update hard URLs in version contet
						$old = confirm_slash(base_url()).confirm_slash($book_slug).$slug;
						$new = confirm_slash(base_url()).confirm_slash($book_slug).$array['slug'];
						$query = $this->db->query("UPDATE ".$dbprefix.$this->versions_table." SET content = replace(content, ".$this->db->escape($old).", ".$this->db->escape($new).") WHERE version_id IN (".implode(',',$book_version_ids).")");
						// Update soft URLs in version contet - href
						$old = 'href="'.$slug.'"';
						$new = 'href="'.$array['slug'].'"';
						$query = $this->db->query("UPDATE ".$dbprefix.$this->versions_table." SET content = replace(content, ".$this->db->escape($old).", ".$this->db->escape($new).") WHERE version_id IN (".implode(',',$book_version_ids).")");
						// Update soft URLs in version contet - resource
						$old = 'resource="'.$slug.'"';
						$new = 'resource="'.$array['slug'].'"';
						$query = $this->db->query("UPDATE ".$dbprefix.$this->versions_table." SET content = replace(content, ".$this->db->escape($old).", ".$this->db->escape($new).") WHERE version_id IN (".implode(',',$book_version_ids).")");
					}
				}
			}
    	} // isset $array['slug']

		// Save row
		$this->db->where('content_id', $content_id);
		$this->db->update($this->pages_table, $array);
		return $array;

    }

    public function create($array=array()) {

    	if ('array'!=gettype($array)) $array = (array) $array;
    	if (!isset($array['book_id']) || empty($array['book_id'])) die('Could not find book ID');
    	if (!isset($array['user_id']) || empty($array['user_id'])) $array['user_id'] = 0;  // Talk to Craig and John about this
        if (!function_exists('safe_name')) {
  			$ci = get_instance();
			$ci->load->helper('url');
    	}

    	if (!isset($array['slug']) || empty($array['slug'])) {
    		if (!isset($array['title']) && !isset($array['identifier'])) die('Could not find slug, title, or identifier.');
    		if (isset($array['identifier']) && !empty($array['identifier'])) {
    			$title_for_slug = trim($array['identifier']);
    		} elseif (isset($array['title'])) {
    			$title_for_slug = trim($array['title']);
    		}
    		$slug = safe_name($title_for_slug, false);
    	} else {
    		$slug = safe_name($array['slug']);
    	}

    	$slug = $this->safe_slug($slug, $array['book_id']);

    	$data = array();
    	$data['book_id']    = (int) $array['book_id'];
		$data['slug']       = (string) $slug;
		$data['type']       = (isset($array['type'])) ? $array['type'] : 'composite';
		$data['is_live']    = (isset($array['is_live'])) ? $array['is_live'] : 1;
		$data['color']      = (isset($array['color']) && $array['color'] != '#ffffff') ? $array['color'] : '';
		$data['user']       = (int) $array['user_id'];
		$data['created']    = date('Y-m-d H:i:s');
		if (isset($array['category']) && !empty($array['category'])) $data['category'] = $array['category'];
		if (isset($array['thumbnail']))  		$data['thumbnail'] = (is_array($array['thumbnail'])) ? $array['thumbnail'][0] : $array['thumbnail'];
		if (isset($array['background']))  		$data['background'] = (is_array($array['background'])) ? $array['background'][0] : $array['background'];
		if (isset($array['banner']))  			$data['banner'] = (is_array($array['banner'])) ? $array['banner'][0] : $array['banner'];
		if (isset($array['custom_style']))  	$data['custom_style'] = (is_array($array['custom_style'])) ? $array['custom_style'][0] : $array['custom_style'];
		if (isset($array['custom_scripts']))  	$data['custom_scripts'] = (is_array($array['custom_scripts'])) ? $array['custom_scripts'][0] : $array['custom_scripts'];
		if (isset($array['audio']))  			$data['audio'] = (is_array($array['audio'])) ? $array['audio'][0] : $array['audio'];

    	$result = $this->db->insert($this->pages_table, $data);
    	// if ($result === false || !empty($this->db->_error_message())) echo 'Error: '.$this->db->_error_message()."\n";

    	$id = $this->db->insert_id();
    	return $id;

    }

	/**
	 * Convert a string to safe URI slug
	 */
	public function safe_slug($slug='', $book_id=0, $content_id=0) {

		if (!$this->slug_exists($slug, $book_id, $content_id)) return $slug;

		$has_numerical_ext = is_numeric(substr($slug, strrpos($slug, '-')+1)) ? true : false;
		if ($has_numerical_ext) {
			$slug = substr($slug, 0, strrpos($slug, '-'));
		}

		$j = 1;
		$adj_slug = $slug.'-'.$j;

		while ($this->slug_exists($adj_slug, $book_id, $content_id)) {
			$j++;
			$adj_slug = $slug.'-'.$j;
		}

		return $adj_slug;

	}

	/**
	 * Deterine whether a slug exists in the database
	 */

	protected function slug_exists() {

		list($slug, $book_id, $content_id) = array_pad(func_get_args(), 3, null);
		if (empty($slug)) $slug = '';
		if (empty($book_id)) $book_id = 0;
		if (empty($content_id)) $content_id = 0;

		$this->db->select('*');
		$this->db->from($this->pages_table);
		if (!empty($content_id)) $this->db->where('content_id !=', $content_id);
		$this->db->where('slug', $slug);
		$this->db->where('book_id', $book_id);
		$this->db->limit(1);
		$query = $this->db->get();
		if ($query->num_rows > 0) {
			$result = $query->result();
			return (int) $result[0]->content_id;
		}
		return false;

	}

}
?>
