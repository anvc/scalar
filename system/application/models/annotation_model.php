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
 * @projectDescription	Model for annotation database table
 * @author				Craig Dietrich
 * @version				2.2
 */

class Annotation_model extends MY_Model {

	private $urn_template = 'urn:scalar:anno:$1:$2:$3';

    public function __construct() {

        parent::__construct();

    }

  	public function rdf($row, $prefix='') {

  		$row->type = 'http://www.openannotation.org/ns/Annotation';
  		return parent::rdf($row);

  	}

	public function urn($pk_1=0, $pk_2=0, $fields=null) {

		$cardinal = '';
		if (is_object($fields)) {
			if (isset($fields->start_seconds) && !empty($fields->start_seconds)) $cardinal .= $fields->start_seconds.'-';
			if (isset($fields->end_seconds) && !empty($fields->end_seconds)) $cardinal .= $fields->end_seconds;
			if (isset($fields->start_line_num) && !empty($fields->start_line_num)) $cardinal .= $fields->start_line_num.'-';
			if (isset($fields->end_line_num) && !empty($fields->end_line_num)) $cardinal .= $fields->end_line_num;
			if (isset($fields->points) && !empty($fields->points)) $cardinal .= preg_replace("/[^a-zA-Z0-9]+/", "", $fields->points);
		}
		
		$return = str_replace('$1', $pk_1, $this->urn_template);
		$return = str_replace('$2', $pk_2, $return);
		$return = str_replace('$3', $cardinal, $return);
		return $return;

	}

	public function get_all($book_id=null, $type=null, $category=null, $is_live=true, $id_array=null) {

		return parent::get_all($this->annotations_table, $book_id, $type, $category, $is_live, $id_array);

    }

    public function get_parents($child_version_id=0, $orderby='', $orderdir='', $is_live=false, $id_array=null) {

		return parent::get_parents($this->annotations_table, $child_version_id, $orderby, $orderdir, $is_live, $id_array);

	}

	public function get_children($parent_version_id=0, $orderby='', $orderdir='', $is_live=false, $id_array=null) {

		return parent::get_children($this->annotations_table, $parent_version_id, $orderby, $orderdir, $is_live, $id_array);

	}

    public function save_children($parent_version_id=0, $array=array(), $start_seconds=array(), $end_seconds=array(), $start_line_nums=array(), $end_line_nums=array(), $points=array()) {

    	// Insert new relationships
    	$j = 0;
    	foreach ($array as $version_urn) {

    		if (isURN($version_urn)) $child_version_id = $this->page_urn_to_content_id($version_urn);
    		if (empty($child_version_id)) continue;

    		$_start_seconds = (!empty($start_seconds[$j])) ? $start_seconds[$j] : 0;
    		$_end_seconds   = (!empty($end_seconds[$j])) ? $end_seconds[$j] : 0;
    		$_start_line_num = (!empty($start_line_nums[$j])) ? $start_line_nums[$j] : 0;
    		$_end_line_num   = (!empty($end_line_nums[$j])) ? $end_line_nums[$j] : 0;
    		$_points        = (!empty($points[$j])) ? $points[$j] : '';

			$data = array(
 				'parent_version_id' => $parent_version_id,
 				'child_version_id' => $child_version_id,
 				'start_seconds' => $_start_seconds,
 				'end_seconds' => $_end_seconds,
	 			'start_line_num' => $_start_line_num,
	 			'end_line_num' => $_end_line_num,
 				'points' => $_points
            );
			$this->db->insert($this->annotations_table, $data);

			$j++;

    	}
    	return true;

    }

    public function save_parents($child_version_id=0, $array=array(), $start_seconds=array(), $end_seconds=array(), $start_line_nums=array(), $end_line_nums=array(), $points=array()) {

    	// Insert new relationships
    	$j = 0;
    	foreach ($array as $version_urn) {

    		if (isURN($version_urn)) $parent_version_id = $this->version_urn_to_version_id($version_urn);
    		if (empty($parent_version_id)) continue;

    		$_start_seconds  = (isset($start_seconds[$j])) ? $start_seconds[$j] : 0;
    		$_end_seconds    = (isset($end_seconds[$j])) ? $end_seconds[$j] : 0;
    		$_start_line_num = (isset($start_line_nums[$j])) ? $start_line_nums[$j] : 0;
    		$_end_line_num   = (isset($end_line_nums[$j])) ? $end_line_nums[$j] : 0;
    		$_points         = (isset($points[$j])) ? $points[$j] : '';

			$data = array(
	 			'parent_version_id' => $parent_version_id,
	 			'child_version_id' => $child_version_id,
	 			'start_seconds' => $_start_seconds,
	 			'end_seconds' => $_end_seconds,
	 			'start_line_num' => $_start_line_num,
	 			'end_line_num' => $_end_line_num,
	 			'points' => $_points,
	           );

			$this->db->insert($this->annotations_table, $data);

			$j++;

    	}
    	return true;

    }

}
?>
