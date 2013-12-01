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
    	
    	if ('object'!=gettype($this->CI->rdf_store)) $this->CI->load->model('RDF_Store', 'rdf_store');
    	if ('object'!=gettype($this->CI->books)) $this->CI->load->model('Book_model', 'books');
    	if ('object'!=gettype($this->CI->pages)) $this->CI->load->model('Page_model', 'pages');
    	if ('object'!=gettype($this->CI->versions)) $this->CI->load->model('Version_model', 'versions');
    	
  		$duplicated_book_id =@ $array['book_to_duplicate'];
 		if (empty($duplicated_book_id)) throw new Exception('Invalid book ID');
    	$user_id =@ (int) $array['user_id'];
    	
    	$book = $this->_scrub_book_fields($this->CI->books->get($duplicated_book_id), $user_id);
    	
    	// Create book
	 	$book_id 	= $this->CI->books->add($book);
	 	$book 		= $this->CI->books->get($book_id);

	 	// Copy pages
	 	$pages = $this->CI->pages->get_all($duplicated_book_id);  // Only live pages
	 	for ($j = 0; $j < count($pages); $j++) {
	 		// Get version first, because it depends on pre-scribbed content_id field
	 		$version = $this->CI->versions->get_all($pages[$j]->content_id, null, 1);  // Most recent version
	 		// Save new page
	 		$page = $this->_scrub_page_fields($pages[$j], $book_id);
	 		$content_id = $this->CI->pages->create($page);
	 		// Save new version
	 		$version = (is_array($version)) ? $version[0] : $version;
	 		$version = $this->_scrub_version_fields($version, $content_id);
	 		$version_id = $this->CI->versions->create($content_id, $version);
	 		// Save relate
	 		// TODO
	 	}	 	

		//die('In library');
	 	
	 	// Copy thumbnail and background images (if applicable)
    	
    	return $book_id;
    	
    }
    
    private function _scrub_book_fields($obj, $user_id=0) {
    	
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
    
    private function _scrub_page_fields($obj, $book_id=0) {
    	
    	if (isset($obj->content_id)) unset($obj->content_id);
    	if (isset($obj->created)) unset($obj->created);
    	if (isset($obj->urn)) unset($obj->urn);
	 	$obj->user_id = (isset($obj->user)) ? (int) $obj->user : 0;
	 	$obj->book_id = (int) $book_id;
	 	
	 	return $obj;
    	
    }
    
    private function _scrub_version_fields($obj, $content_id=0) {
    	
    	$ns_array = $this->CI->config->item('namespaces');
    	$array = (array) $obj;
    	
		if (isset($array['version_id'])) unset($array['version_id']);
    	if (isset($array['created'])) unset($array['created']);
    	if (isset($array['urn'])) unset($array['urn']);	
    	$array['user_id'] = (isset($array['user'])) ? (int) $array['user'] : 0;	
    	$array['content_id'] = (int) $content_id;
    	
	 	if (isset($array['rdf'])) { 
		 	foreach ($array['rdf'] as $field => $value) {
		 		$field = toNS($field, $ns_array);
		 		$array[$field] = $value;
		 	}
	 	}
	 	unset($array['rdf']);    	
	 	
	 	return $array;
    
    }
    
}