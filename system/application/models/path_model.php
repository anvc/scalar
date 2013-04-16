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
 * @projectDescription	Model for path database table
 * @author				Craig Dietrich
 * @version				2.2
 */

class Path_model extends MY_Model {

	private $urn_template = 'urn:scalar:path:$1:$2';

    public function __construct() {
    	
        parent::__construct();
        
    }
    
	public function urn($pk_1=0, $pk_2=0) {
		
		$return = str_replace('$1', $pk_1, $this->urn_template);
		$return = str_replace('$2', $pk_2, $return);
		return $return;
		
	}      
    
    public function get_all($book_id=null, $type=null, $category=null, $is_live=true, $version_datetime=null) {
    
    	return parent::get_all($this->paths_table, $book_id, $type, $category, $is_live, $version_datetime);
    
    }    
    
	public function get_parents($child_version_id=0, $orderby='', $orderdir='', $version_datetime=null, $is_live=false) {

		if (empty($orderby)) $orderby = $this->paths_table.'.sort_number';
		if (empty($orderdir)) $orderdir = 'asc';
		return parent::get_parents($this->paths_table, $child_version_id, $orderby, $orderdir, $version_datetime, $is_live);
		
	}
	
	public function get_children($parent_version_id=0, $orderby='', $orderdir='', $version_datetime=null, $is_live=false) {
	
		if (empty($orderby)) $orderby = $this->paths_table.'.sort_number';
		if (empty($orderdir)) $orderdir = 'asc';		
		return parent::get_children($this->paths_table, $parent_version_id, $orderby, $orderdir, $version_datetime, $is_live);
		
	}         
    
    public function save_children($parent_version_id=0, $array=array(), $sort_numbers=array()) {	
    	
    	// Inser new relationships
    	$temp_sort_number = 1;
    	$j = 0;
    	foreach ($array as $version_urn) {
    		
    		if (isURN($version_urn)) $child_version_id = $this->version_urn_to_version_id($version_urn);
    		if (empty($child_version_id)) continue;
    		
    		$sort_number = (isset($sort_numbers[$j])) ? $sort_numbers[$j] : $temp_sort_number;
            
			$data = array(
 				'parent_version_id' => $parent_version_id,
 				'child_version_id' => $child_version_id,
 				'sort_number' => $sort_number
            );            

			$done = $this->db->insert($this->paths_table, $data);		
			if (mysql_errno()!=0) echo 'MySQL ERROR: '.mysql_error()."\n";
    		
    		$temp_sort_number++;
    		$j++;
    		
    	}
    	return true;
    	
    }    
    
    public function save_parents($child_version_id=0, $array=array(), $sort_numbers=0) { 	

		if (count($array) == 0) return;

    	// Inser new relationships
    	$count = 0;
    	foreach ($array as $version_urn) {
    		
    		if (isURN($version_urn)) $parent_version_id = $this->version_urn_to_version_id($version_urn);
    		if (empty($parent_version_id)) continue;
            
            $sort_number =@ (int) $sort_numbers[$count]; 
            
			$data = array(
 				'parent_version_id' => $parent_version_id,
 				'child_version_id' => $child_version_id,
 				'sort_number' => $sort_number
            );            

			$done = $this->db->insert($this->paths_table, $data);		
			if (mysql_errno()!=0) echo 'MySQL ERROR: '.mysql_error()."\n";
			
			$count++;
    		
    	}
    	return true;
    	
    }                 
	
}
?>
