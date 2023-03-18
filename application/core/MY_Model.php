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
 * @projectDescription		Model base for getting pages, parent, childs, and other methods useful for all models
 * @author					Craig Dietrich
 * @version					2.2
 */

function sortMostRecentContentFirst($a, $b) {
	$x = (int) $a->content_id;
	$y = (int) $b->content_id;
    if ($x == $y) return 0;
    return ($x > $y) ? -1 : 1;
}

class MY_Model extends CI_Model {

	var $books_table = 'books';
	var $users_table = 'users';
	var $user_book_table = 'user_books';
	var $user_history_table = 'user_history';
	var $pages_table = 'content';
	var $versions_table = 'versions';
	var $annotations_table = 'rel_annotated';
	var $paths_table = 'rel_contained';
	var $references_table = 'rel_referenced';
	var $replies_table = 'rel_replied';
	var $tags_table = 'rel_tagged';
	var $lenses_table = 'rel_grouped';
	var $whitelist_table = 'whitelist';
	var $book_urn_template = 'urn:scalar:book:$1';
	var $page_urn_template = 'urn:scalar:content:$1';
	var $version_urn_template = 'urn:scalar:version:$1';
	var $category_urn_template = 'urn:scalar:$1:$2';
	var $rdf_fields = array();

	public function __construct() {

		parent::__construct();

		$this->rdf_fields = $this->config->item('rdf_fields');

	}

	/**
	 * Get all pages of a certain type
	 * @return $result
	 */

    public function get_all() {

    	list($table, $book_id, $type, $category, $is_live, $id_array) = array_pad(func_get_args(), 6, null);
    	if (empty($table)) $table = '';
    	if (empty($book_id)) $book_id = 0;
    	if (empty($type)) $type = null;
    	if (empty($category)) $category = null;
    	if (false!==$is_live) $is_live = true;
    	if (empty($sq)) $sq = null;
    	if (empty($id_array)) $id_array= null;

    	// Get content from the relational tables that connect to the current book
    	$this->db->distinct();
    	$this->db->select($this->pages_table.'.*');
    	$this->db->select($this->pages_table.'.content_id AS parent_content_id');
    	$this->db->select($this->versions_table.'.version_num AS parent_version_num');
    	$this->db->from($table);
    	$this->db->join($this->versions_table, $this->versions_table.'.version_id='.$table.'.parent_version_id');
    	$this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
    	if (!empty($book_id)) $this->db->where($this->pages_table.'.book_id', $book_id);
    	if (!empty($is_live)) $this->db->where($this->pages_table.'.is_live', 1);
    	if (!empty($id_array)) $this->db->where_in($this->pages_table.'.content_id', $id_array);
    	$this->db->order_by($this->versions_table.'.version_num', 'desc');
    	$query = $this->db->get();
		$result = $query->result();

		// Add URN
    	for ($j = 0; $j < count($result); $j++) $result[$j]->urn = $this->page_urn($result[$j]->parent_content_id);

		// Group by content
		$content = array();
		foreach ($result as $row) {
			if (!isset($content[$row->parent_content_id])) $content[$row->parent_content_id] = array();
			$content[$row->parent_content_id][] = $row;
		}

		// Remove if parent isn't the most recent version
		if (empty($id_array)) {
			$remove = array();
			foreach ($content as $content_id => $row) {
				if (!$this->is_top_version($row[0]->parent_content_id, $row[0]->parent_version_num)) {
					$remove[] = $content_id;
				}
			}
	    	foreach ($remove as $content_id) {
	    		unset($content[$content_id]);
	    	}
		}

		// Revert back to just a list of the content nodes
		$result = array();
		foreach ($content as $content_id => $row) {
			$result[] = $row[0];
		}

		// Sort most recent first
		uasort($result, 'sortMostRecentContentFirst');

    	return $result;

    }

	/**
	 * Get all pages that are a parent of a certain type
	 * @return $result
	 */

	public function get_parents() {

		list($table, $child_version_id, $orderby, $orderdir, $is_live, $id_array) = array_pad(func_get_args(), 6, null);
		if (empty($table)) $table = '';
		if (empty($child_version_id)) $child_version_id = 0;
		if (empty($orderby)) $orderby = $this->versions_table.'.version_num';
		if (empty($orderdir)) $orderdir = 'desc';
		if (true!==$is_live) $is_live = false;

		$this->db->select($this->versions_table.'.version_num AS parent_version_num');
		$this->db->select($this->versions_table.'.content_id AS parent_content_id');
		$this->db->select($this->versions_table.'.created AS parent_created');
		$this->db->select($this->pages_table.'.slug AS parent_content_slug');
		$this->db->select($this->pages_table.'.type AS parent_content_type');
		$this->db->select($table.'.*');
		$this->db->from($table);
		$this->db->join($this->versions_table, $this->versions_table.'.version_id='.$table.'.parent_version_id');
		$this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
		$this->db->where($table.'.child_version_id', $child_version_id);
		if (!empty($is_live)) $this->db->where($this->pages_table.'.is_live', 1);
		$this->db->order_by($orderby, $orderdir);
		$query = $this->db->get();
		$result = $query->result();
		$remove = array();
    	for ($j = 0; $j < count($result); $j++) {
			// Add URN
			$result[$j]->urn = $this->urn($result[$j]->parent_version_id,$result[$j]->child_version_id,$result[$j]);
			// Remove rows if they are not the most recent version
			foreach ($result as $row) {
				if ($row->parent_content_id==$result[$j]->parent_content_id && $row->parent_version_num > $result[$j]->parent_version_num) $remove[] = $j;
			}
    	}
    	foreach ($remove as $j) {
    		unset($result[$j]);
    	}
    	// Remove rows if they are not the most recent version in the DB
    	if (empty($id_array)) {
	    	$remove = array();
	    	foreach ($result as $j => $row) {
	    		if (!$this->is_top_version($result[$j]->parent_content_id, $result[$j]->parent_version_num)) $remove[] = $j;
	    	}
	    	foreach ($remove as $j) {
	    		unset($result[$j]);
	    	}
    	}
		return $result;

	}

	/**
	 * Get all pages that are a child of a certain type
	 * @return $result
	 */

	public function get_children() {

		list($table, $parent_version_id, $orderby, $orderdir, $is_live, $id_array) = array_pad(func_get_args(), 6, null);
		if (empty($table)) $table = '';
		if (empty($parent_version_id)) $parent_version_id = 0;
		if (empty($orderby)) $orderby = $this->versions_table.'.version_num';
		if (empty($orderdir)) $orderdir = 'desc';
		if (true!==$is_live) $is_live = false;		

		$this->db->distinct();
		$this->db->select($this->versions_table.'.version_num AS child_version_num');
		$this->db->select($this->versions_table.'.content_id AS child_content_id');
		$this->db->select($this->versions_table.'.created AS child_created');
		$this->db->select($this->pages_table.'.slug AS child_content_slug');
		$this->db->select($this->pages_table.'.type AS child_content_type');
		$this->db->select($table.'.*');
		$this->db->from($table);
		$this->db->join($this->versions_table, $this->versions_table.'.version_id='.$table.'.child_version_id');
		$this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
		$this->db->where($table.'.parent_version_id', $parent_version_id);
		if (!empty($is_live)) $this->db->where($this->pages_table.'.is_live', 1);
		$this->db->order_by($orderby, $orderdir);
		$query = $this->db->get();
		if ($this->db->_error_message()) echo 'Database error: '.$this->db->_error_message();
		$result = $query->result();
		$remove = array();
    	for ($j = 0; $j < count($result); $j++) {
			// Add URN
			$result[$j]->urn = $this->urn($result[$j]->parent_version_id,$result[$j]->child_version_id,$result[$j]);
			// Remove rows if they are not the most recent version in the results
			foreach ($result as $row) {
				if ($row->child_content_id==$result[$j]->child_content_id && $row->child_version_num > $result[$j]->child_version_num) $remove[] = $j;
			}
    	}
    	foreach ($remove as $j) {
    		unset($result[$j]);
    	}
    	// Remove rows if theey are not the most recent version in the DB
    	if (empty($id_array)) {
	    	$remove = array();
	    	foreach ($result as $j => $row) {
	    		if (!$this->is_top_version($result[$j]->child_content_id, $result[$j]->child_version_num)) $remove[] = $j;
	    	}
	    	foreach ($remove as $j) {
	    		unset($result[$j]);
	    	}
    	}
		return $result;

	}
	
	public function delete_relationship() {
		
		list($table, $parent_version_id, $child_version_id) = func_get_args();
		$this->db->where('parent_version_id', $parent_version_id);
		$this->db->where('child_version_id', $child_version_id);
		$this->db->delete($table);
		return true;
		
	}

	/**
	 * Convert fields to RDF
	 * @return $return
	 */

	public function rdf($row, $base_uri='') {

		$return = array();
		foreach ($row as $field => $values) {
			if (empty($values) || !array_key_exists($field, $this->rdf_fields)) continue;
			if (!is_array($values)) $values = array($values);
			if (!is_array($this->rdf_fields[$field])) $this->rdf_fields[$field] = array($this->rdf_fields[$field]);
			for ($j = 0; $j < count($this->rdf_fields[$field]); $j++) {
				if (!is_array($this->rdf_fields[$field][$j])) {
					$this->rdf_fields[$field][$j] = array('pname'=>$this->rdf_fields[$field][$j],'func_name'=>str_replace(':','_',$this->rdf_fields[$field][$j]));
				}
				$count = 0;
				foreach ($values as $value) {
					if (empty($value)) continue;
					$func = $this->rdf_fields[$field][$j]['func_name'];
					if (method_exists($this, $func)) $value = $this->$func($value, $base_uri);
					$return[$this->rdf_fields[$field][$j]['pname']][$count] = $this->rdf_value($value);
					$count++;
				}
			}
		}
		return $return;

	}

	/**
	 * Convert a value to an RDF (value, type)
	 * @return 	$return
	 * @todo 	language
	 */

	public function rdf_value($value='', $j=0) {

		$output = array(
			'value' => $value,
			'type' => ((isURL($value)) ? 'uri' : 'literal')
		);
		return $output;

	}

	/**
	 * Covert values to specific RDF values
	 */

	public function dcterms_created($value) {

		return rdf_timestamp($value);

	}

	public function rdf_type($value) {

		if (isURL($value)) return $value;
		return 'http://scalar.usc.edu/2012/01/scalar-ns#'.ucwords($value);

	}
	
	public function foaf_homepage($value, $base_uri, $attribution=null) {  // TODO: temporary for legacy

		if (isset($value->uri) && !empty($value->uri)) {
			$value = $value->uri;
		} elseif (!empty($attribution) && isset($attribution->fullname) && !empty($attribution->fullname)) {
			$value = safe_name($attribution->fullname);
		} elseif (!is_numeric($value) && isset($value->user_id)) {
			$value = $value->user_id;
		}
		if (isURL($value)) return $value;
		return confirm_slash($base_uri).'users/'.$value;

	}

	public function prov_wasAttributedTo($value, $base_uri, $attribution=null) {

		if (isset($value->uri) && !empty($value->uri)) {
			$value = $value->uri;
		} elseif (!empty($attribution) && isset($attribution->fullname) && !empty($attribution->fullname)) {
			$value = safe_name($attribution->fullname);
		} elseif (!is_numeric($value) && isset($value->user_id)) {
			$value = $value->user_id;
		}
		if (isURL($value)) return $value;
		return confirm_slash($base_uri).'users/'.$value;

	}

	public function foaf_name($value, $attribution=null) {

		if (!empty($attribution) && isset($attribution->fullname) && !empty($attribution->fullname)) {
			$value = $attribution->fullname;
		}
		return $value;

	}

    /**
     * Return the top version for a content node
     */

    public function get_top_version($content_id=0) {

    	$this->db->select('*');
    	$this->db->from($this->versions_table);
    	$this->db->where('content_id', $content_id);
    	$this->db->order_by('version_num','desc');
    	$this->db->limit(1);
    	$query = $this->db->get();
		$result = $query->result();
		if (!isset($result[0]) || !isset($result[0]->version_num)) return false;
		return $result[0];

    }

    /**
     * Get possible values of an enumerated field
     */

    public function get_enum_values($table, $field) {

    	$table =@ trim($this->db->dbprefix.$table);
    	$q = "SHOW COLUMNS FROM {$table} WHERE Field = '{$field}'";
    	$type = $this->db->query($q)->row( 0 )->Type;
	    preg_match("/^enum\(\'(.*)\'\)$/", $type, $matches);
	    $enum = explode("','", $matches[1]);

	    return $enum;

	}

    /**
     * Determine if a version is the top version for a content node
     */

    protected function is_top_version($content_id=0, $version_num=0) {

    	$this->db->select('version_num');
    	$this->db->from($this->versions_table);
    	$this->db->where('content_id', $content_id);
    	$this->db->order_by('version_num','desc');
    	$this->db->limit(1);
    	$query = $this->db->get();
		$result = $query->result();
		if (!isset($result[0]) || !isset($result[0]->version_num)) return false;
		$top_version_num = $result[0]->version_num;
    	return ($top_version_num==$version_num) ? true : false;

    }

    /**
     * Return the version number for a content node
     */

    protected function get_version_num($content_id) {

		$this->db->select('version_num');
    	$this->db->from($this->versions_table);
    	$this->db->where('content_id', $content_id);
    	$this->db->order_by('version_num', 'desc');
    	$this->db->limit(1);
    	$query = $this->db->get();
    	if ($query->num_rows==0) return 0;
    	$result = $query->result();
    	$version_num = $result[0]->version_num;
    	return $version_num;

    }

	/**
	 * Return an ID from an URN
	 */

	protected function page_urn_to_content_id($urn='') {

		$id = explode(':',$urn);
		return $id[(count($id)-1)];

	}

	protected function version_urn_to_version_id($urn='') {

		$id = explode(':',$urn);
		return $id[(count($id)-1)];

	}

	/**
	 * Create URNs
	 */

	protected function page_urn($pk=0) {

		return str_replace('$1', $pk, $this->page_urn_template);

	}

	protected function version_urn($pk=0) {

		return str_replace('$1', $pk, $this->version_urn_template);

	}

	public function category_urn($category='', $pk=0) {

		$return = str_replace('$1', $category, $this->category_urn_template);
		$return = str_replace('$2', $pk, $return);
		return $return;

	}

}

?>