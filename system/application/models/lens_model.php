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
 * http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

/**
 * @projectDescription  Model for grouped database table
 * @author              Craig Dietrich
 * @version             1.0
 */

class Lens_model extends MY_Model {

	private $urn_template = 'urn:scalar:lens:$1';

    public function __construct() {

        parent::__construct();

    }

	public function urn($pk_1=0) {

		$return = str_replace('$1', $pk_1, $this->urn_template);
		return $return;

	}
	
	private function select() {
		
	}
	
	private function filter() {
		
	}
	
	private function sort() {
		
	}
	
	public function decode($arr=array(), $book=null) {
		
		$CI =& get_instance();
		if (!isset($CI->pages) || 'object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if (!isset($CI->versions) || 'object'!=gettype($CI->versions)) $CI->load->model('version_model','versions');
		$return = array();
		
		if (empty($book) || !isset($book->book_id)) return $return;
		$version_urn = $arr['urn'];
		$version_urn_arr = explode(':', $version_urn);
		$version_id = (int) array_pop($version_urn_arr);

		$return['scalar:urn'] = $this->versions->urn($version_id);
		$return['scalar:child_urn'] = null;
		$return['scalar:child_rel'] = 'grouped';
		if (!empty($arr) && is_array($arr)) $return['scalar:contents'] = $arr; 
		
		return $return;
		
	}

	public function get_all($book_id=null, $type=null, $category=null, $is_live=true, $sq='', $id_array=null) {

		$this->db->select($this->lenses_table.'.*');
		$this->db->from($this->lenses_table);
		$this->db->join($this->versions_table, $this->versions_table.'.version_id='.$this->lenses_table.'.parent_version_id');
		$this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
		$this->db->where($this->pages_table.'.book_id', $book_id);
		if (!empty($is_live)) $this->db->where($this->pages_table.'.is_live', 1);
		$query = $this->db->get();
		$result = $query->result();
		$return = array();
		for ($j = 0; $j < count($result); $j++) {
			if (isset($result[$j]->contents) && !empty($result[$j]->contents)) {
				$result[$j]->contents = json_decode($result[$j]->contents);
				$result[$j]->contents->urn = $this->urn($result[$j]->parent_version_id);
				$return[] = $result[$j]->contents;
			}
		}
		return json_encode($return);
		
    }

    public function get_children($parent_version_id=0) {
    	
    	$this->db->select('*');
    	$this->db->from($this->lenses_table);
    	$this->db->where('parent_version_id', $parent_version_id);
    	$query = $this->db->get();
    	$result = $query->result();
    	if (!count($result)) return false;
    	for ($j = 0; $j < count($result); $j++) {
    		$result[$j]->contents = json_decode($result[$j]->contents);
    		$result[$j]->contents->urn = $this->urn($result[$j]->parent_version_id);
    		$result[$j]->contents = json_encode($result[$j]->contents);
    	}
    	return $result[0]->contents;

	}

    public function save_children($parent_version_id=0, $array=array()) {

    	// Insert new relationships
    	foreach ($array as $contents) {
    		
    		if (is_string($contents)) $contents = json_decode($contents, true);
    		$contents['urn'] = $this->urn($parent_version_id);
    		$contents = json_encode($contents);
    		
    		$this->db->select('*');
    		$this->db->from($this->lenses_table);
    		$this->db->where('parent_version_id', $parent_version_id);
    		$query = $this->db->get();
    		$result = $query->result();
    		if (count($result)) {  // Update
    			$data = array(
    					'contents' => $contents,
    			);
    			$this->db->where('parent_version_id', $parent_version_id);
    			$this->db->update($this->lenses_table, $data);
    		} else {  // Add
				$data = array(
	 				'parent_version_id' => $parent_version_id,
	 				'contents' => $contents
	            );
				$this->db->insert($this->lenses_table, $data);
    		}

    	}
    	return true;

    }

}
?>
