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

abstract class MY_Model extends Model {

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
	var $whitelist_table = 'whitelist';
	var $book_urn_template = 'urn:scalar:book:$1';	
	var $page_urn_template = 'urn:scalar:content:$1';
	var $version_urn_template = 'urn:scalar:version:$1';
	var $category_urn_template = 'urn:scalar:$1:$2';
	var $rdf_fields = array();	
	
	public function MY_Model() {

		parent::__construct();		
		
		$this->rdf_fields = $this->config->item('rdf_fields');

	}
	
	/**
	 * Get all pages of a certain type
	 * @return $result
	 */
	
    public function get_all($table='', $book_id=null, $type=null, $category=null, $is_live=true, $sq, $version_datetime=null) {

    	// Get annotations that connect to the current book
    	$this->db->distinct();
    	$this->db->select($this->pages_table.'.*');
    	$this->db->select($this->pages_table.'.content_id AS parent_content_id');
    	$this->db->select($this->versions_table.'.version_num AS parent_version_num');
    	if (!empty($version_datetime)) $this->db->where($this->versions_table.'.created <=', $version_datetime);
    	$this->db->from($table);
    	$this->db->join($this->versions_table, $this->versions_table.'.version_id='.$table.'.parent_version_id');
    	$this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
    	if (!empty($book_id)) $this->db->where($this->pages_table.'.book_id', $book_id);
    	if (!empty($is_live)) $this->db->where($this->pages_table.'.is_live', 1);
    	$this->db->order_by($this->versions_table.'.version_num', 'desc');
    	$query = $this->db->get();
		if (mysql_errno()!=0) echo 'MySQL Error: '.mysql_error()."\n";
		$result = $query->result();

		// Add URN
    	for ($j = 0; $j < count($result); $j++) $result[$j]->urn = $this->page_urn($result[$j]->parent_content_id);    		

		// Group by content
		$content = array();
		foreach ($result as $row) {
			if (!isset($content[$row->parent_content_id])) $content[$row->parent_content_id] = array();
			$content[$row->parent_content_id][] = $row;	
		}	

		// Remove where parent content isn't top verison
		$remove = array();
		foreach ($content as $content_id => $row) {
			if (empty($version_datetime) && !$this->is_top_version($row[0]->parent_content_id, $row[0]->parent_version_num)) {
				$remove[] = $content_id;
			} 
		}
    	foreach ($remove as $content_id) {
    		unset($content[$content_id]);
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
    
	public function get_parents($table='', $child_version_id=0, $orderby='', $orderdir='', $version_datetime=null, $is_live=false) {

		if (empty($orderby)) {
			$orderby = $this->versions_table.'.version_num';
			$orderdir = 'desc';
		}

		$this->db->select($this->versions_table.'.version_num AS parent_version_num');
		$this->db->select($this->versions_table.'.content_id AS parent_content_id');
		$this->db->select($this->versions_table.'.created AS parent_created');
		$this->db->select($this->pages_table.'.slug AS parent_content_slug');
		$this->db->select($this->pages_table.'.type AS parent_content_type');
		$this->db->select($table.'.*');
		$this->db->from($table);
		if (!empty($version_datetime)) $this->db->where($this->versions_table.'.created <=', $version_datetime);
		$this->db->join($this->versions_table, $this->versions_table.'.version_id='.$table.'.parent_version_id');
		$this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
		$this->db->where($table.'.child_version_id', $child_version_id);
		if (!empty($is_live)) $this->db->where($this->pages_table.'.is_live', 1);
		$this->db->orderby($orderby, $orderdir);
		$query = $this->db->get();
		if (mysql_errno()!=0) echo 'MySQL Error: '.mysql_error()."\n";
		$result = $query->result();
		$remove = array();
    	for ($j = 0; $j < count($result); $j++) {
			// Add URN
			$result[$j]->urn = $this->urn($result[$j]->parent_version_id,$result[$j]->child_version_id);    		
			// Remove rows if they are not the most recent version
			foreach ($result as $row) {
				if ($row->parent_content_id==$result[$j]->parent_content_id && $row->parent_version_num > $result[$j]->parent_version_num) $remove[] = $j;
			}			
    	}    
    	foreach ($remove as $j) {
    		unset($result[$j]);
    	}	
    	// Remove rows if theey are not the most recent version in the DB
    	$remove = array();
    	foreach ($result as $j => $row) {
    		if (!$this->is_top_version($result[$j]->parent_content_id, $result[$j]->parent_version_num)) $remove[] = $j;
    	}
    	foreach ($remove as $j) {
    		unset($result[$j]);
    	}	      	
		return $result;
		
	}
	
	/**
	 * Get all pages that are a child of a certain type
	 * @return $result
	 */ 	
	
	public function get_children($table='', $parent_version_id=0, $orderby='', $orderdir='', $version_datetime=null, $is_live=false) {
		
		if (empty($orderby)) {
			$orderby = $this->versions_table.'.version_num';
			$orderdir = 'desc';
		}

		$this->db->distinct();  
		$this->db->select($this->versions_table.'.version_num AS child_version_num');
		$this->db->select($this->versions_table.'.content_id AS child_content_id');
		$this->db->select($this->versions_table.'.created AS child_created');
		$this->db->select($this->pages_table.'.slug AS child_content_slug');
		$this->db->select($this->pages_table.'.type AS child_content_type');
		$this->db->select($table.'.*');
		$this->db->from($table);
		if (!empty($version_datetime)) $this->db->where($this->versions_table.'.created <=', $version_datetime);
		$this->db->join($this->versions_table, $this->versions_table.'.version_id='.$table.'.child_version_id');
		$this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
		$this->db->where($table.'.parent_version_id', $parent_version_id);
		if (!empty($is_live)) $this->db->where($this->pages_table.'.is_live', 1);
		$this->db->orderby($orderby, $orderdir);
		$query = $this->db->get();
		if (mysql_errno()!=0) echo 'MySQL Error: '.mysql_error()."\n";
		$result = $query->result();
		$remove = array();
    	for ($j = 0; $j < count($result); $j++) {
			// Add URN
			$result[$j]->urn = $this->urn($result[$j]->parent_version_id,$result[$j]->child_version_id);    		
			// Remove rows if they are not the most recent version in the results
			foreach ($result as $row) {
				if ($row->child_content_id==$result[$j]->child_content_id && $row->child_version_num > $result[$j]->child_version_num) $remove[] = $j;
			}
    	}
    	foreach ($remove as $j) {
    		unset($result[$j]);
    	}	
    	// Remove rows if theey are not the most recent version in the DB
    	$remove = array();
    	foreach ($result as $j => $row) {
    		if (!$this->is_top_version($result[$j]->child_content_id, $result[$j]->child_version_num)) $remove[] = $j;
    	}
    	foreach ($remove as $j) {
    		unset($result[$j]);
    	}	    	
		return $result;
		
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
					if (method_exists($this, $func)) $value = $this->$func($value);
					$return[$this->rdf_fields[$field][$j]['pname']][$count] = $this->rdf_value($value);
					$count++;
				}
			}
		} 
		// Creator
		if (!empty($base_uri) && isset($row->user)) {
			$return['foaf:homepage'][0] = $this->rdf_value(confirm_slash($base_uri).'users/'.$row->user);
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
	
	/**
	 * Convert a string to safe URI slug
	 */
	
    public function safe_slug($slug='', $book_id=0) {
    	
    	if (!$this->slug_exists($slug, $book_id)) return $slug;
    	
    	$j = 1;
    	$adj_slug = $slug.'-'.$j;

    	while ($this->slug_exists($adj_slug, $book_id)) {
    		$j++;
    		$adj_slug = $slug.'-'.$j;
    	}

    	return $adj_slug;
    	
    }    
    
    /**
     * Return the top version for a content node
     */    
    
    public function get_top_version($content_id=0) {
    	
    	$this->db->select('*');
    	$this->db->from($this->versions_table);
    	$this->db->where('content_id', $content_id);
    	$this->db->orderby('version_num','desc');
    	$this->db->limit(1);
    	$query = $this->db->get();
    	if (mysql_errno()!=0) echo 'MySQL Error: '.mysql_error()."\n";
		$result = $query->result();
		if (!isset($result[0]) || !isset($result[0]->version_num)) return false;
		return $result[0];	
    	
    }    

    /**
     * Determine if a version is the top version for a content node
     */
    
    protected function is_top_version($content_id=0, $version_num=0) {

    	$this->db->select('version_num');
    	$this->db->from($this->versions_table);
    	$this->db->where('content_id', $content_id);
    	$this->db->orderby('version_num','desc');
    	$this->db->limit(1);
    	$query = $this->db->get();
    	if (mysql_errno()!=0) echo 'MySQL Error: '.mysql_error()."\n";
		$result = $query->result();
		if (!isset($result[0]) || !isset($result[0]->version_num)) return false;
		$top_version_num = $result[0]->version_num;
    	return ($top_version_num==$version_num) ? true : false;
    	
    }
    
    /**
     * Return the verion number for a content node
     */       
    
    protected function get_version_num($content_id) {
    	
		$this->db->select('version_num');
    	$this->db->from($this->versions_table);
    	$this->db->where('content_id', $content_id);
    	$this->db->orderby('version_num', 'desc');
    	$this->db->limit(1);
    	$query = $this->db->get();
    	if ($query->num_rows==0) return 0;
    	$result = $query->result();
    	$version_num = $result[0]->version_num;
    	return $version_num;
    	
    }

	/**
	 * Deterine whether a slug exists in the database
	 */
	 
    protected function slug_exists($slug='', $book_id=0) {

     	$this->db->select('*');
    	$this->db->from($this->pages_table);
    	$this->db->where('slug', $slug);
    	$this->db->where('book_id', $book_id);
    	$this->db->limit(1);
    	$query = $this->db->get();
    	if (mysql_errno()!=0) echo 'MySQL: '.mysql_error();
    	if ($query->num_rows > 0) {
    		$result = $query->result();
    		return (int) $result[0]->content_id;
    	}
    	return false;
    	
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