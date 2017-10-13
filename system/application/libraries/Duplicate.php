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
		
    	if ('object'!=@gettype($this->CI->rdf_store)) 	$this->CI->load->model('RDF_Store', 'rdf_store');
    	if ('object'!=@gettype($this->CI->books)) 		$this->CI->load->model('Book_model', 'books');
    	if ('object'!=@gettype($this->CI->pages)) 		$this->CI->load->model('Page_model', 'pages');
    	if ('object'!=@gettype($this->CI->versions)) 	$this->CI->load->model('Version_model', 'versions');	
    	if ('object'!=@gettype($this->CI->rdf_object)) 	$this->CI->load->library('RDF_Object', 'rdf_object');	

    	if ('object'!=@gettype($this->CI->annotations)) $this->CI->load->model('annotation_model', 'annotations');
    	if ('object'!=@gettype($this->CI->paths)) 		$this->CI->load->model('path_model', 'paths');
    	if ('object'!=@gettype($this->CI->references)) 	$this->CI->load->model('reference_model', 'references');
    	if ('object'!=@gettype($this->CI->replies)) 	$this->CI->load->model('reply_model', 'replies');
    	if ('object'!=@gettype($this->CI->tags)) 		$this->CI->load->model('tag_model', 'tags');
		
    }
    
    public function book($array=array()) {
    	
  		$duplicated_book_id =@ $array['book_to_duplicate'];
 		if (empty($duplicated_book_id)) throw new Exception('Invalid book ID');
    	$user_id =@ (int) $array['user_id'];
    	$title = (isset($array['title']) && !empty($array['title'])) ? trim($array['title']) : null;
    	
    	$duplicated_book = $this->CI->books->get($duplicated_book_id);
    	
    	// Create book
    	$book 		= $this->_scrub_book_fields($duplicated_book, $user_id, $title);
	 	$book_id 	= $this->CI->books->add($book, false);  // Don't test CAPTCHA
	 	$book 		= $this->CI->books->get($book_id);

	 	// Old and new paths and URLs
	 	$duplicated_uri = confirm_slash(base_url()).$duplicated_book->slug;
	 	$duplicated_path = confirm_slash(FCPATH).$duplicated_book->slug;
	 	$uri = confirm_slash(base_url()).$book->slug;
	 	$path = confirm_slash(FCPATH).$book->slug;
	 	
	 	// Copy book physical media
	 	if (!empty($duplicated_book->thumbnail) && file_exists($duplicated_path.'/'.$duplicated_book->thumbnail)) {
	 		if (!copy($duplicated_path.'/'.$duplicated_book->thumbnail, $path.'/'.$duplicated_book->thumbnail)) {	
	 			// Not critical so don't throw an exception
	 		}
	 	}
    	if (!empty($duplicated_book->publisher_thumbnail) && file_exists($duplicated_path.'/'.$duplicated_book->publisher_thumbnail)) {
	 		if (!copy($duplicated_path.'/'.$duplicated_book->publisher_thumbnail, $path.'/'.$duplicated_book->publisher_thumbnail)) {	
	 			// Not critical so don't throw an exception
	 		}
	 	} 	

	 	// Copy pages
	 	$pages = $this->CI->pages->get_all($duplicated_book_id);  // Only live pages
	 	for ($j = 0; $j < count($pages); $j++) {
	 		// Get version
	 		$pages[$j]->versions = array();
	 		$pages[$j]->versions = $this->CI->versions->get_all($pages[$j]->content_id, null, 1);  // Most recent version
	 		// Save new page
	 		$page = $this->_scrub_page_fields($pages[$j], $book_id, array('prev_uri'=>$duplicated_uri,'uri'=>$uri));
	 		$content_id = $this->CI->pages->create($page);
	 		// Save new version (_scrub_version_fields() will turn object into array, to allow RDF fields to be flattened)
	 		$pages[$j]->versions[0] = $this->_scrub_version_fields($pages[$j]->versions[0], $content_id, array('prev_uri'=>$duplicated_uri,'uri'=>$uri,'prev_title'=>$duplicated_book->title));
	 		$version_id = $this->CI->versions->create($content_id, $pages[$j]->versions[0]);
	 		$pages[$j]->versions[0] = (object) $pages[$j]->versions[0];  // Was converted to array by _scrub_version_fields()
	 	}

	 	// Save relate (after all the pages have been created)
	 	foreach ($pages as $page) {
	 		$parent = $this->CI->pages->get_by_slug($book->book_id, $page->slug);  // Get the page from the new book's content
			$parent->versions = $this->CI->versions->get_all($parent->content_id, null, 1);  // Most recent version	 		 		
	 		$this->_do_relate($book, $page, $parent);
	 	}

    	return $book_id;
    	
    }
    
    private function _do_relate($book, $page, $parent) {
    	
    	$parent_id = $parent->versions[0]->version_id;
    	$save = array();

		// Build nested array of page relationship
		$settings = array( 
			'book'		   => $book,
			'content'      => $page, 
			'base_uri'     => confirm_slash(base_url()),
			'versions'	   => RDF_Object::VERSIONS_MOST_RECENT,
			'ref'          => RDF_Object::REFERENCES_ALL,
			'rel'          => RDF_Object::REL_CHILDREN_ONLY, 
			'max_recurses' => 1 
		);
		$index = $this->CI->rdf_object->index($settings);
		$index = (is_array($index)) ? $index[0] : $index;

		// Annotations
		$save['scalar:child_urn'] = $save['start_seconds'] = $save['end_seconds'] = $save['start_line_num'] = $save['end_line_num'] = $save['points'] = array();
    	foreach ($index->versions[0]->annotation_of as $annotation_of) {
    		$child 						= $this->CI->pages->get_by_slug($book->book_id, $annotation_of->slug);
			$child->versions 			= $this->CI->versions->get_all($child->content_id, null, 1);  // Most recent version
			$save['scalar:child_urn'][] = $this->CI->versions->urn($child->versions[0]->version_id);
    		$save['start_seconds'][] 	= $annotation_of->versions[0]->start_seconds;
    		$save['end_seconds'][] 		= $annotation_of->versions[0]->end_seconds;
    		$save['start_line_num'][] 	= $annotation_of->versions[0]->start_line_num;
    		$save['end_line_num'][] 	= $annotation_of->versions[0]->end_line_num;
    		$save['points'][]			= $annotation_of->versions[0]->points;
    	} 
    	$this->CI->annotations->save_children($parent_id, $save['scalar:child_urn'], $save['start_seconds'], $save['end_seconds'], $save['start_line_num'], $save['end_line_num'], $save['points']);
		// Paths
		$save['scalar:child_urn'] = $save['sort_numbers'] = array();
		$j = 1;
    	foreach ($index->versions[0]->path_of as $path_of) {
    		$child 						= $this->CI->pages->get_by_slug($book->book_id, $path_of->slug);
			$child->versions 			= $this->CI->versions->get_all($child->content_id, null, 1);  // Most recent version
			$save['scalar:child_urn'][] = $this->CI->versions->urn($child->versions[0]->version_id);
    		$save['sort_numbers'][] 	= $j;
    		$j++;
    	}       	   	
   		$this->CI->paths->save_children($parent_id, $save['scalar:child_urn'], $save['sort_numbers']);
		// References
		$save['scalar:child_urn'] = array();
    	foreach ($index->versions[0]->reference_of as $reference_of) {
    		$child 						= $this->CI->pages->get_by_slug($book->book_id, $reference_of->slug);
			$child->versions 			= $this->CI->versions->get_all($child->content_id, null, 1);  // Most recent version
			$save['scalar:child_urn'][] = $this->CI->versions->urn($child->versions[0]->version_id);
    	}       	   	
   		$this->CI->references->save_children($parent_id, $save['scalar:child_urn'], $save['sort_numbers']);
		// Replies
		$save['scalar:child_urn'] = $save['datetimes'] = array();
    	foreach ($index->versions[0]->reply_of as $reply_of) {
    		$child 						= $this->CI->pages->get_by_slug($book->book_id, $reply_of->slug);
			$child->versions 			= $this->CI->versions->get_all($child->content_id, null, 1);  // Most recent version
			$save['scalar:child_urn'][] = $this->CI->versions->urn($child->versions[0]->version_id);
			$save['datetimes'][] 		= $reply_of->versions[0]->datetime;
    	}       	   	
   		$this->CI->replies->save_children($parent_id, $save['scalar:child_urn'], array(), $save['datetimes']);
		// Tags
		$save['scalar:child_urn'] = array();
    	foreach ($index->versions[0]->tag_of as $tag_of) {
    		$child 						= $this->CI->pages->get_by_slug($book->book_id, $tag_of->slug);
			$child->versions 			= $this->CI->versions->get_all($child->content_id, null, 1);  // Most recent version
			$save['scalar:child_urn'][] = $this->CI->versions->urn($child->versions[0]->version_id);
    	}       	   	
   		$this->CI->tags->save_children($parent_id, $save['scalar:child_urn'], $save['sort_numbers']);   		
	
    }
    
    private function _scrub_book_fields($obj, $user_id=0, $title=null) {
    	
    	if (isset($obj->book_id)) unset($obj->book_id);
    	
    	// Remove the duplicatable attribute in the title field (that allows the book to be duplicatable)
    	if (!empty($title)) $obj->title = $title;	 
	 	if (isset($obj->title)) $obj->title = preg_replace('/(<[^>]+) data-duplicatable=".*?"/i', '$1', $obj->title);
	 	
	 	// User to connect to the book
	 	if (!empty($user_id)) $obj->user_id = $user_id;
	 	
	 	// Permissions
	 	if (isset($obj->url_is_public)) unset($obj->url_is_public);
	 	if (isset($obj->display_in_index)) unset($obj->display_in_index);
	 	if (isset($obj->is_featured)) unset($obj->is_featured);
	 	
	 	return $obj;
    	
    }
    
    private function _scrub_page_fields($obj, $book_id=0, $options) {
    	
    	if (isset($obj->content_id)) unset($obj->content_id);
    	if (isset($obj->created)) unset($obj->created);
    	if (isset($obj->urn)) unset($obj->urn);
	 	$obj->user_id = (isset($obj->user)) ? (int) $obj->user : 0;
	 	$obj->book_id = (int) $book_id;
	 	
	 	if (!empty($obj->thumbnail) && !isURL($obj->thumbnail)) $obj->thumbnail = confirm_slash($options['prev_uri']).$obj->thumbnail;
	 	if (!empty($obj->background) && !isURL($obj->background)) $obj->background = confirm_slash($options['prev_uri']).$obj->background;
	 	if (!empty($obj->banner) && !isURL($obj->banner)) $obj->banner = confirm_slash($options['prev_uri']).$obj->banner;
	 	if (!empty($obj->audio) && !isURL($obj->audio)) $obj->audio = confirm_slash($options['prev_uri']).$obj->audio;
	 	
	 	return $obj;
    	
    }
    
    private function _scrub_version_fields($obj, $content_id=0, $options=array()) {
    	
    	$ns_array = $this->CI->config->item('namespaces');
    	$array = (array) $obj;  // RDF fields have colons in them, invalid as object field names
    	
    	// Scrub fields
    	if (isset($array['created'])) unset($array['created']);
    	if (isset($array['urn'])) unset($array['urn']);	
    	$array['user_id'] = (isset($array['user'])) ? (int) $array['user'] : 0;	
    	$array['content_id'] = (int) $content_id;
    	
    	// Flatten RDF fields in the array, then remove the RDF field
	 	if (isset($array['rdf'])) { 
		 	foreach ($array['rdf'] as $field => $value) {
		 		$field = toNS($field, $ns_array);
		 		$array[$field] = $value;
		 	}
	 	}
	 	unset($array['rdf']);    

	 	// URLs: set to previous book's URL, to avoid duplicating media
	 	if (isset($array['url']) && !empty($array['url']) && isset($options['prev_uri'])) {
	 		$has_transcribed = false;
	 		// Soft URL
	 		if (!isURL($array['url'])) {
	 			$array['url'] = confirm_slash($options['prev_uri']).$array['url'];
	 			// Update RDF dcterms:source with title of previous book
		 		if (!isset($array['dcterms:source'])) $array['dcterms:source'] = array();
		 		$array['dcterms:source'][] = array('value'=>strip_tags($options['prev_title']),'type'=>'literal'); 	 			
	 		}
	 	}

 		// Text content: remove hard URLs in resource="" and make hard href=""
 		if (isset($options['prev_uri'])) {
	 		$array['content'] = str_replace('resource="'.confirm_slash($options['prev_uri']), 'resource="', $array['content']);
 			// TODO: replace with regex on the href="" attribute
	 		$array['content'] = str_replace('href="media/', 'href="'.confirm_slash($options['prev_uri']).'media/', $array['content']);
 		}

	 	return $array;
    
    }
    
}