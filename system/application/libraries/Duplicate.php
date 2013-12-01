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
 * @projectDescription		Duplicate a book
 * @author					Craig Dietrich
 * @version					1.0
 */

if ( ! defined('BASEPATH')) exit('No direct script access allowed'); 

class Duplicate {
	
	private $CI = null;
	
	public function __construct() {

		$this->CI =& get_instance(); 	
		
    }
    
    public function book($array=array()) {
    	
    	$this->CI->load->model('Book_model', 'books');
    	$this->CI->load->model('Page_model', 'pages');
    	
  		$book_id =@ $array['book_to_duplicate'];
 		if (empty($book_id)) throw new Exception('Invalid book ID');
    	$user_id =@ (int) $array['user_id'];
    	
    	$book = $this->scrub_book_fields($this->CI->books->get($book_id), $user_id);
    	
    	// Create book
	 	$book_id 	= $this->CI->books->add($book);
	 	$book 		= $this->CI->books->get($book_id);
	 	
	// 	die('In library');
	 	
	 	// Copy thumbnail and background images (if applicable)
    	
    	return $book_id;
    	
    }
    
    private function scrub_book_fields($obj, $user_id=0) {
    	
    	if (isset($obj->book_id)) unset($obj->book_id);
    	
    	// Remove the duplicatable attribute in the title field (that allows the book to be duplicatable)
	 	if (isset($obj->title)) $obj->title = preg_replace('/(<[^>]+) data-duplicatable=".*?"/i', '$1', $obj->title);
	 	
	 	// User to connect to the book
	 	if (!empty($user_id)) $obj->user_id = $user_id;
	 	
	 	// Permissions
	 	if (isset($obj->url_is_public)) unset($obj->url_is_public);
	 	if (isset($obj->display_in_index)) unset($obj->display_in_index);
	 	if (isset($obj->is_featured)) unset($obj->is_featured);
	 	
	 	return $obj;
    	
    }
    
}