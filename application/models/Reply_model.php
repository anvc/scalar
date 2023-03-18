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
 * @projectDescription	Model for reply database table
 * @author				Craig Dietrich
 * @version				2.2
 */

class Reply_model extends MY_Model {

	private $urn_template = 'urn:scalar:reply:$1:$2:$3';

    public function __construct() {

        parent::__construct();

    }

	public function urn($pk_1=0, $pk_2=0, $fields=null) {

		$cardinal = 0;
		if (is_object($fields) && isset($fields->datetime)) $cardinal = preg_replace("/[^a-zA-Z0-9]+/", "", $fields->datetime);	
		
		$return = str_replace('$1', $pk_1, $this->urn_template);
		$return = str_replace('$2', $pk_2, $return);
		$return = str_replace('$3', $cardinal, $return);
		return $return;

	}

	public function get_all($book_id=null, $type=null, $category=null, $is_live=true, $id_array=null) {

		return parent::get_all($this->replies_table, $book_id, $type, $category, $is_live, $id_array);

    }

    public function get_parents($child_version_id=0, $orderby='', $orderdir='', $is_live=false, $id_array=null) {

		if (empty($orderby)) $orderby = $this->replies_table.'.datetime';
		if (empty($orderdir)) $orderdir = 'asc';
		return parent::get_parents($this->replies_table, $child_version_id, $orderby, $orderdir, $is_live, $id_array);

	}

	// For comment tree
	function get_parents_recursive($child_version_id=0, $maintain_version=false, $id_array=null) {

    	$parents = $this->get_parents($child_version_id, $maintain_version, null, false, $id_array);
    	if (!count($parents)) return $parents;

    	foreach ($parents as $content_id => $row) {
    		$parents[$content_id]->versions[0]->has_reply = $this->get_parents_recursive($parents[$content_id]->versions[0]->version_id, $maintain_version, $id_array);
    	}

    	return $parents;

    }

    public function get_children($parent_version_id=0, $orderby='', $orderdir='', $is_live=false, $id_array=null) {

		if (empty($orderby)) $orderby = $this->replies_table.'.datetime';
		if (empty($orderdir)) $orderdir = 'asc';
		return parent::get_children($this->replies_table, $parent_version_id, $orderby, $orderdir, $is_live, $id_array);

	}

    public function save_children($parent_version_id=0, $array=array(), $paragraph_num_array=array(), $datetime_array=array()) {

    	// Insert new relationships
    	$j = 0;
    	foreach ($array as $version_urn) {
    		
    		$child_version_id = (isURN($version_urn)) ? $this->page_urn_to_content_id($version_urn) : (int) $version_urn;
    		if (empty($child_version_id)) continue;

    		$paragraph_num =@ (int) $paragraph_num_array[$j];
    		$datetime =@ $datetime_array[$j];
    		if (empty($datetime)) $datetime = date('Y-m-d H:i:s');

			$data = array(
 				'parent_version_id' => $parent_version_id,
 				'child_version_id' => $child_version_id,
 				'paragraph_num' => $paragraph_num,
 				'datetime' => $datetime
            );

			$this->db->insert($this->replies_table, $data);

    		$j++;

    	}
    	return true;

    }

    public function save_parents($child_version_id, $array=array(), $paragraph_num_array=array(), $created_array=array()) {

    	$array = array_unique($array);

		// Establish new connections
		$j = 0;
		foreach ($array as $version_urn) {

			$parent_version_id = (isURN($version_urn)) ? $this->version_urn_to_version_id($version_urn) : (int) $version_urn;
    		if (empty($parent_version_id)) continue;

    		$paragraph_num = (int) $paragraph_num_array[$j];
    		$created = $created_array[$j];

    		if (empty($created)) $created = date('Y-m-d H:i:s');

			$data = array(
               'parent_version_id' => $parent_version_id,
               'child_version_id' => $child_version_id,
			   'paragraph_num' => $paragraph_num,
 			   'datetime' => $created
            );

			$this->db->insert($this->replies_table, $data);

			$j++;

		}
    	return true;

    }

}
?>
