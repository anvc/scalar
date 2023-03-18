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
 * @projectDescription	Model for references database table
 * @author				Craig Dietrich
 * @version				2.2
 */

class Reference_model extends MY_Model {

	private $urn_template = 'urn:scalar:reference:$1:$2';

    public function __construct() {

        parent::__construct();

    }

	public function urn($pk_1=0, $pk_2=0) {

		$return = str_replace('$1', $pk_1, $this->urn_template);
		$return = str_replace('$2', $pk_2, $return);
		return $return;

	}

	public function get_all($book_id=null, $type=null, $category=null, $is_live=true, $id_array=null) {

		return parent::get_all($this->references_table, $book_id, $type, $category, $is_live, $id_array);

    }

    public function get_parents($child_version_id=0, $orderby='', $orderdir='', $is_live=false, $id_array=null) {

		return parent::get_parents($this->references_table, $child_version_id, $orderby, $orderdir, $is_live, $id_array);

	}

	public function get_children($parent_version_id=0, $orderby='', $orderdir='', $is_live=false, $id_array=null) {

		// This used to return only type 'media' pages, which are references to media from the WYSIWYG editor
		// Now Scalar logs class="note" relationships as well, so this might return pages; leave it up to the front-end to figure out what to do with it
		return parent::get_children($this->references_table, $parent_version_id, $orderby, $orderdir, $is_live, $id_array);

	}

    public function save_parents($child_version_id=0, $array=array(), $reference_text_array=array()) {

    	// Insert new relationships
    	$j = 0;
    	foreach ($array as $version_urn) {

    		$parent_version_id = (isURN($version_urn)) ? $this->version_urn_to_version_id($version_urn) : (int) $version_urn;
    		if (empty($parent_version_id)) continue;

    		$reference_text = (isset($reference_text_array[$j])) ? $reference_text_array[$j] : '';

			$data = array(
	 			'parent_version_id' => $parent_version_id,
	 			'child_version_id' => $child_version_id,
	 			'reference_text' => $reference_text,
	           );

			$this->db->insert($this->references_table, $data);

			$j++;

    	}
    	return true;

    }

    public function save_children($parent_version_id=0, $array=array(), $reference_array=array()) {

    	if (empty($parent_version_id)) throw new Exception('Inalid parent version ID');
    	if (empty($array)) return;

    	for($i=0; $i<count($array); $i++) {

    		$child_version_id = (isURN($array[$i])) ? $this->page_urn_to_content_id($array[$i]) : (int) $array[$i];
    		if (empty($child_version_id)) continue;

    		$reference_text = (isset($reference_array[$i])) ? trim($reference_array[$i]) : '';

    		$this->db->select('*');
    		$this->db->from($this->references_table);
    		$this->db->where('parent_version_id', $parent_version_id);
    		$this->db->where('child_version_id', $child_version_id);
    		$query = $this->db->get();
    		if ($query->num_rows() > 0) continue;

    		$data = array(
    			   'parent_version_id' => $parent_version_id ,
    			   'child_version_id' => $child_version_id ,
    			   'reference_text' => $reference_text
    		);
    		$this->db->insert($this->references_table, $data);

    	}

    }

}
?>
