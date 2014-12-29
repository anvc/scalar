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
 
class User_book_model extends User_model {

    public function __construct() {
    	
        parent::__construct();
        
    }
    
    public function save($array=array()) {
    	
    	$user_id =@ (int) $array['id'];
    	if (empty($user_id)) throw new Exception('Invalid user ID');
    	$book_id =@ (int) $array['book_id'];
    	if (empty($user_id)) throw new Exception('Invalid book ID');
    	
    	$relationship = (isset($array['relationship']) && !empty($array['relationship'])) ? trim($array['relationship']) : '';
    	$list_in_index = (isset($array['list_in_index']) && !empty($array['list_in_index'])) ? 1 : 0;
    	$sort_number = (isset($array['sort_number']) && !empty($array['sort_number'])) ? (int) $array['sort_number'] : 0;
    	
    	parent::save_books($user_id, array($book_id), $relationship, $list_in_index, $sort_number);
    	
    	return $array;
    	
    }
    
}
