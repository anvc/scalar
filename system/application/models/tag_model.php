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
 * @projectDescription	Model for tag database table
 * @author				Craig Dietrich
 * @version				2.2
 */

class Tag_model extends MY_Model {

	private $urn_template = 'urn:scalar:tag:$1:$2';

    public function __construct() {

        parent::__construct();

    }

	public function urn($pk_1=0, $pk_2=0) {

		$return = str_replace('$1', $pk_1, $this->urn_template);
		$return = str_replace('$2', $pk_2, $return);
		return $return;

	}

    public function get_all($book_id=null, $type=null, $category=null, $is_live=true, $sq='', $version_datetime=null) {

    	return parent::get_all($this->tags_table, $book_id, $type, $category, $is_live, $sq, $version_datetime);

    }

	public function get_parents($child_version_id=0, $orderby='', $orderdir='', $version_datetime=null, $is_live=false) {

		return parent::get_parents($this->tags_table, $child_version_id, $orderby, $orderdir, $version_datetime, $is_live);

	}

	public function get_children($parent_version_id=0, $orderby='', $orderdir='', $version_datetime=null, $is_live=false) {

		return parent::get_children($this->tags_table, $parent_version_id, $orderby, $orderdir, $version_datetime, $is_live);

	}

    public function save_children($parent_version_id=0, $array=array()) {

    	// Inser new relationships
    	foreach ($array as $version_urn) {

    		if (isURN($version_urn)) $version_id = $this->page_urn_to_content_id($version_urn);
    		if (empty($version_id)) continue;

			$data = array(
 				'parent_version_id' => $parent_version_id,
 				'child_version_id' => $version_id
            );
			$this->db->insert($this->tags_table, $data);

    	}
    	return true;

    }

    public function save_parents($child_version_id, $array=array()) {

    	$array = array_unique($array);

		// Establish new connections
		foreach ($array as $version_urn) {

    		if (isURN($version_urn)) $parent_version_id = $this->version_urn_to_version_id($version_urn);
    		if (empty($parent_version_id)) continue;

			$data = array(
               'parent_version_id' => $parent_version_id,
               'child_version_id' => $child_version_id
            );

			$this->db->insert($this->tags_table, $data);

		}
    	return true;

    }

}
?>
