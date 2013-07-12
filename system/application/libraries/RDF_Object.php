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
 * @projectDescription		Convert internal structures into RDF; includes two approaches -- one where the object is
 *                          non-hierarchical/recursive, the other nested -- based on arguments passed to book() or index()
 * @author					Craig Dietrich
 * @version					1.2
 */

if ( ! defined('BASEPATH')) exit('No direct script access allowed'); 

class RDF_Object {

	const RESTRICT_NONE = null;
    const REL_ALL = null;
	const REL_CHILDREN_ONLY = 1;
	const REL_PARENTS_ONLY = 2;
	const VERSIONS_ALL = null;
	const VERSIONS_MOST_RECENT = 1;
	const REFERENCES_ALL = 1;
	const REFERENCES_NONE = 0;
	const NO_SEARCH = null;
	const NO_PAGINATION = null;
	public $ns = array();
	private $version_cache = array();
	private $rel_fields = array('start_seconds','end_seconds','start_line_num','end_line_num','points','datetime','paragraph_num');	
	
	public function __construct() {

		$CI =& get_instance(); 
		$this->ns = $CI->config->item('namespaces');	
		if ('array'!=gettype($this->ns)) {
			$CI->config->load('local_settings');
			$this->ns = $CI->config->item('namespaces');	
		}
		if ('array'!=gettype($this->ns)) throw new Exception('Could not locate namespaces configuration');		
		
    }
    
    public function serialize(&$return=null, $format=xml) {

		$CI =& get_instance(); 	
		if ('object'!=gettype($CI->rdf_store)) $CI->load->library('RDF_Store', 'rdf_store');  
		
		$output = array();
		if (!empty($return)) {
			foreach ($return as $key => $row) {
				foreach ($row as $field => $value) {
					if ('@'==substr($field, 0, 1)) continue;
					$output[$key][fromNS($field, $this->ns)] = $value;
				}
			}
		}
		$return = $CI->rdf_store->serialize($output, '', $format);  // by reference   
		return $return;  // by value
    	
    }
    
    public function system(&$arg0=null, $arg1=null, $arg2=null, $arg3=null) {

		$numargs = func_num_args();
		if (1>$numargs) throw new Exception('Invalid arguments');    	
    	
    	if ($arg1) {
			$this->_system_by_ref($arg0, $arg1, $arg2, $arg3);
		} else {
			return $this->_system($arg0, $arg1, $arg2);
		}		
		
    }
   
    public function book(&$arg0=null, $arg1=null, $arg2=null, $arg3=null) {

		$numargs = func_num_args();
		if (1>$numargs) throw new Exception('Invalid arguments');

		if ($arg1) {
			$this->_book_by_ref($arg0, $arg1, $arg2, $arg3);
		} else {
			return $this->_book($arg0, $arg1, $arg2);
		}
    	
    }    
    
    public function index(&$arg0=null, $arg1=null, $arg2=null, $arg3=null, $arg4=null, $arg5=null, $arg6=null, $arg7=null, $arg8=null, $arg9=null, $arg10=null) {

    	$numargs = func_num_args();
		if (8>$numargs) throw new Exception('Invalid arguments');

		if ('string'!=gettype($arg2)) {
			$this->_index_by_ref($arg0, $arg1, $arg2, $arg3, $arg4, $arg5, $arg6, $arg7, $arg8, $arg9, $arg10);
		} else {
			return $this->_index($arg0, $arg1, $arg2, $arg3, $arg4, $arg5, $arg6, $arg7, $arg8, $arg9);
		}
    	
    }
    
    private function _system($content, $base_uri='') {
    
    	throw new Exception('System by value is not yet supported');
    
    }    
    
    private function _system_by_ref(&$return, $content, $books, $base_uri='') {

    	$CI =& get_instance(); 
    	if ('object'!=gettype($CI->books)) $CI->load->model('book_model','books');
    	
    	foreach ($books as $row) {
    		if (!isset($content->has_part)) $content->has_part = array();
			$content->has_part[] = $base_uri.$row->slug;
    	}
    	
    	$return[rtrim($base_uri,'/')] = $CI->books->rdf($content);
    	
	 	// Book nodes
		foreach ($books as $row) {	
			unset($row->users);
			if (isset($row->thumbnail) && !empty($row->thumbnail)) $row->thumbnail = $base_uri.confirm_slash($row->slug).$row->thumbnail;
			$return[$base_uri.$row->slug] = $CI->books->rdf($row);
		}       	
    	
    }
    
    private function _book($content, $users, $base_uri='') {
    
    	throw new Exception('Book by value is not yet supported');
    
    }
    
    private function _book_by_ref(&$return, $content, $users, $base_uri='') {

		$CI =& get_instance(); 	
		if ('object'!=gettype($CI->books)) $CI->load->model('book_model','books');
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if ('object'!=gettype($CI->versions)) $CI->load->model('version_model','versions');
    	
		// Write TOC URI first, to make the output reader friendly
	 	$content->table_of_contents = $base_uri.'toc';

		// Book users
		$content->users = array();
		foreach ($users as $row) {
			if (!$row->list_in_index) continue;  // Added 2012 06 21, seems like a privacy issue to expose this
			$sort_number = (int) $row->sort_number;
			$user_base = $base_uri.'users/'.$row->user_id;
			$content->users[] = $user_base.$this->_annotation_append($row);
		}	 	
		
		// Book node
	 	$return[rtrim($base_uri,'/')] = $CI->books->rdf($content);

	 	// Table of contents
	 	$toc = new stdClass;
	 	$toc->title = 'Main Menu';
	 	$toc->type = 'Page';
	 	$toc->references = array();	 	
	 	$toc_content = $CI->books->get_book_versions($content->book_id, true);
		foreach ($toc_content as $row) {
			$toc->references[] = $base_uri.$row->slug.$this->_annotation_append($row);
		}	 	
	 	$return[$base_uri.'toc'] = $CI->versions->rdf($toc);
	 	
	 	// Users
		foreach ($users as $row) {
			$return[$base_uri.'users/'.$row->user_id] = $CI->users->rdf($row);
		}	 	
		
	 	// Table of contents nodes
		foreach ($toc_content as $row) {
			foreach ($row->versions as $version) {
				$row->has_version[] = $base_uri.$row->slug.'.'.$version->version_num;
			}		
			$return[$base_uri.$row->slug] = $CI->pages->rdf($row);
			foreach ($row->versions as $version) {	
				$return[$base_uri.$row->slug.'.'.$version->version_num] = $CI->versions->rdf($version);
			}
		}   
    	
    }    
    
    private function _index($book, $content, $base_uri='', $restrict=null, $rel=self::REL_ALL, $sq=null, $versions=self::VERSIONS_MOST_RECENT, $ref=self::REFERENCES_ALL, $pagination=self::NO_PAGINATION, $max_recurses=0, $num_recurses=0) {

		if (empty($content)) return $content;
		if (!is_array($content)) $content = array($content);
		if (!empty($pagination) && $pagination['start']>0) $content = array_slice($content, $pagination['start']);
		$count = 0;		

		foreach ($content as $row) {
			if (!empty($pagination) && $count >= $pagination['results']) break;
			$index = $this->_content($book, $row, $base_uri, $restrict, $rel, $sq, $versions, $ref, $pagination, $max_recurses);
			if (!empty($index)) {
				$return[] = $index;
				$count++;
			}
		}
		
		return $return;    	
    	
    }
    
    private function _index_by_ref(&$return, $book, $content, $base_uri='', $restrict=null, $rel=self::REL_ALL, $sq=null, $versions=self::VERSIONS_MOST_RECENT, $ref=self::REFERENCES_ALL, $pagination=self::NO_PAGINATION, $max_recurses=0, $num_recurses=0) {

		if (empty($content)) return;
		if (!is_array($content)) $content = array($content);	
		if (!empty($pagination) && $pagination['start']>0) $content = array_slice($content, $pagination['start']);
		$count = 0;

		foreach ($content as $row) {
			if (!empty($pagination) && $count >= $pagination['results']) break;
			$this->_content_by_ref($return, $book, $row, $base_uri, $restrict, $rel, $sq, $versions, $ref, self::NO_PAGINATION, $max_recurses, $num_recurses);
			if (!isset($this->version_cache[$row->content_id])) continue;
			$this->_relationships_by_ref($return, $book, $this->version_cache[$row->content_id], $base_uri, $restrict, $rel, self::NO_SEARCH, $versions, $ref, self::NO_PAGINATION, $max_recurses, $num_recurses);
			$count++;
		}
		    	
    }
    
	private function _content($book, $content, $base_uri='', $restrict=null, $rel=self::REL_ALL, $sq=null, $versions=self::VERSIONS_MOST_RECENT, $ref=self::REFERENCES_ALL, $pagination=self::NO_PAGINATION, $max_recurses=0, $num_recurses=0) {

		$CI =& get_instance(); 	
		if ('object'!=gettype($CI->versions)) $CI->load->model('version_model','versions');	
		$models = $CI->config->item('rel');	
		$ref_models = $CI->config->item('ref');	
		if ('array'!=gettype($models)) {
			$CI->config->load('local_settings');
			$models = $CI->config->item('rel');	
			$ref_models = $CI->config->item('ref');
		}
		if ('array'!=gettype($models)) throw new Exception('Could not locate relationship configuration');		
		if (!empty($ref_models)) $models = array_merge($models, $ref_models);	
		
		// Versions attached to each content
		$content->versions = $CI->versions->get_all($content->content_id, null, $versions, $sq);
		if (!count($content->versions)) return null;
		$content->version_index = 0; 
		if (null!==$max_recurses && $num_recurses==$max_recurses) return $content;

		// Relationships
		for ($j = 0; $j < count($content->versions); $j++) {
			$version_id = $content->versions[$j]->version_id;
			foreach ($models as $model) {
				if (!empty($restrict) && $model != $restrict) continue;
				$model_s = singular($model);
				if ('object'!=gettype($CI->$model)) $CI->load->model($model_s.'_model',$model);
				if ($rel == self::REL_PARENTS_ONLY || $rel == self::REL_ALL) {
					$name = 'has_'.$model;
					$content->versions[$j]->$name = array();
					$nodes = $CI->$model->get_parents($version_id, null, null, null, 1);
					foreach ($nodes as $node) {
						array_push($content->versions[$j]->$name, $this->_annotation_parent($book, $node, $base_uri, $model, $rel, self::NO_SEARCH, $versions, $ref, self::NO_PAGINATION, $max_recurses, $num_recurses));
					}
				}
				if ($rel == self::REL_CHILDREN_ONLY || $rel == self::REL_ALL) {
					$name = $model_s.'_of';
					$content->versions[$j]->$name = array();
					$nodes = $CI->$model->get_children($version_id, null, null, null, 1);
					foreach ($nodes as $node) {
						array_push($content->versions[$j]->$name, $this->_annotation_child($book, $node, $base_uri, $model, $rel, self::NO_SEARCH, $versions, $ref, self::NO_PAGINATION, $max_recurses, $num_recurses));
					}	
				}			
			}		
		}	

		$content = $this->_relationship_pagination($content);

		return $content;
		 
	}    
    
    private function _content_by_ref(&$return, $book, $content, $base_uri='', $restrict=null, $rel=self::REL_ALL, $sq=null, $display_versions=self::VERSIONS_MOST_RECENT, $ref=self::REFERENCES_ALL, $pagination=self::NO_PAGINATION, $max_recurses=0, $num_recurses=0) {

		if ($this->_uri_exists($return, $base_uri.$content->slug)) return;
		
		$CI =& get_instance(); 	
		if ('object'!=gettype($CI->books)) $CI->load->model('book_model','books');
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if ('object'!=gettype($CI->versions)) $CI->load->model('version_model','versions');	
		if ('object'!=gettype($CI->references)) $CI->load->model('reference_model','references');	
		
		// Versions attached to each node
		$versions = $CI->versions->get_all($content->content_id, null, $display_versions, $sq);
		if (!count($versions)) return;
		
		$content->version = $base_uri.$content->slug.'.'.$versions[0]->version_num; 
		foreach ($versions as $key => $version) {
			$content->has_version[] = $base_uri.$content->slug.'.'.$version->version_num;
			$content->has_version_id[] = $version->version_id;
			$versions[$key]->version_of = $base_uri.$content->slug;
			if (isset($versions[($key+1)])) $versions[$key]->replaces = $base_uri.$content->slug.'.'.$versions[($key+1)]->version_num;
			if (isset($versions[($key-1)])) $versions[$key]->replaced_by = $base_uri.$content->slug.'.'.$versions[($key-1)]->version_num;
			// References
			if ($ref && $num_recurses <= $max_recurses) {
				$nodes = $CI->references->get_parents($version->version_id, null, null, null, true);
				foreach ($nodes as $node) {
					$versions[$key]->has_reference[] = $base_uri.$node->parent_content_slug;
				}					
				$nodes = $CI->references->get_children($version->version_id, null, null, null, true);
				foreach ($nodes as $node) {
					$versions[$key]->references[] = $base_uri.$node->child_content_slug;
				}		
			}
			// Categories (commentaries, reviews) (comments on the book itself)
			if (!empty($content->category)) $versions[$key]->category = $content->category;				
		}
		
		// Place into object for use later in relationship building
		$this->version_cache[$content->content_id] = $versions;
		unset($versions);
			
		// Write page RDF before version RDF so they show up in the correct human-readable order
		$return[$base_uri.$content->slug] = $CI->pages->rdf($content);
		foreach ($this->version_cache[$content->content_id] as $version) {
			$return[$base_uri.$content->slug.'.'.$version->version_num] = $CI->versions->rdf($version);
		}								

		// Write references nodes (down here so they show up at the bottom of the graph)
		if ($ref && $num_recurses < $max_recurses) {
			foreach ($this->version_cache[$content->content_id] as $version) {
				if (isset($version->has_reference)) {
					foreach ($version->has_reference as $parent_content_uri) {
						if ($this->_uri_exists($return, $parent_content_uri)) continue;
						$ref_content = $CI->pages->get_by_slug($book->book_id, substr($parent_content_uri, strlen($base_uri))); 
						if (!empty($ref_content)) $this->_content_by_ref($return, $book, $ref_content, $base_uri, $restrict, self::REL_CHILDREN_ONLY, self::NO_SEARCH, $display_versions, $ref, self::NO_PAGINATION, $max_recurses, ++$num_recurses);
					}	
				}					
				if (isset($version->references)) {
					foreach ($version->references as $child_content_uri) {
						if ($this->_uri_exists($return, $child_content_uri)) continue;
						$ref_content = $CI->pages->get_by_slug($book->book_id, substr($child_content_uri, strlen($base_uri))); 
						if (!empty($ref_content)) $this->_content_by_ref($return, $book, $ref_content, $base_uri, $restrict, self::REL_CHILDREN_ONLY, self::NO_SEARCH, $display_versions, $ref, self::NO_PAGINATION, $max_recurses, ++$num_recurses);
					}	
				}				
			}
		}	
		
		// Write category relationships (again, down here so they show up at the bottom of the graph)
		foreach ($this->version_cache[$content->content_id] as $version) {
			if (!empty($version->category)) {
				$this->_annotation_category_by_ref($return, $version, $base_uri);
			}	
		}	  
    	
    }
    
	private function _relationship_pagination($page) {

		$CI =& get_instance(); 	
		$models = $CI->config->item('rel');	
		if ('array'!=gettype($models)) {
			$CI->config->load('local_settings');
			$models = $CI->config->item('rel');	
		}
		if ('array'!=gettype($models)) throw new Exception('Could not locate relationship configuration');			
		$namespaces = $CI->config->item('namespaces');
		if ('array'!=gettype($namespaces)) throw new Exception('Could not locate namespaces configuration');		
		
		foreach ($models as $_model) {
			$requested = (isset($_REQUEST[singular($_model)]) && !empty($_REQUEST[singular($_model)])) ? trim($_REQUEST[singular($_model)]) : null;
			$requested_name = 'requested_'.singular($_model).'_index';
			$page->versions[$page->version_index]->$requested_name = 0;	
			// Child -> parent
			$model = 'has_'.$_model;
			$rev_model = singular($_model).'_of';
			if (isset($page->versions[$page->version_index]->$model)) {
				for ($j = 0; $j < count($page->versions[$page->version_index]->$model); $j++) {
					// Requested
					if ($requested==$page->versions[$page->version_index]->{$model}[$j]->slug) $page->versions[$page->version_index]->$requested_name = $j;		
					// Current page, prev and next
					$page->versions[$page->version_index]->{$model}[$j]->versions[0]->page_index = null;
					for ($k = 0; $k < count($page->versions[$page->version_index]->{$model}[$j]->versions[0]->$rev_model); $k++) {
						if ($page->versions[$page->version_index]->{$model}[$j]->versions[0]->{$rev_model}[$k]->content_id == $page->content_id) {
							$page->versions[$page->version_index]->{$model}[$j]->versions[0]->page_index = $k;
							break;
						}
					}
					$page->versions[$page->version_index]->{$model}[$j]->versions[0]->prev_index = ($page->versions[$page->version_index]->{$model}[$j]->versions[0]->page_index > 0) ? $page->versions[$page->version_index]->{$model}[$j]->versions[0]->page_index - 1 : null;
					$page->versions[$page->version_index]->{$model}[$j]->versions[0]->next_index = ($page->versions[$page->version_index]->{$model}[$j]->versions[0]->page_index < (count($page->versions[$page->version_index]->{$model}[$j]->versions[0]->$rev_model)-1)) ? $page->versions[$page->version_index]->{$model}[$j]->versions[0]->page_index + 1 : null;
					$page->versions[$page->version_index]->{$model}[$j]->versions[0]->page_num = $page->versions[$page->version_index]->{$model}[$j]->versions[0]->page_index + 1;
					$page->versions[$page->version_index]->{$model}[$j]->versions[0]->total_pages = count($page->versions[$page->version_index]->{$model}[$j]->versions[0]->$rev_model);
					// Continue to
					if (empty($page->versions[$page->version_index]->{$model}[$j]->versions[0]->next_index)) {
						if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
						$continue_to_content_id = (int) $page->versions[$page->version_index]->{$model}[$j]->versions[0]->continue_to_content_id;
						if ($continue_to_content_id) {
							$continue_to = $CI->pages->get($continue_to_content_id);
							if (empty($continue_to) || !$continue_to->is_live) $continue_to = null;
							$page->versions[$page->version_index]->{$model}[$j]->versions[0]->continue_to = $continue_to;
						}
					}
				} 
			}
			// Parent -> child
			$model = singular($_model).'_of';
			$rev_model = 'has_'.$_model;
			if (isset($page->versions[$page->version_index]->$model)) {
				for ($j = 0; $j < count($page->versions[$page->version_index]->$model); $j++) {	
					$page->versions[$page->version_index]->{$model}[$j]->versions[0]->page_index = $j;
					$page->versions[$page->version_index]->{$model}[$j]->versions[0]->prev_index = ($page->versions[$page->version_index]->{$model}[$j]->versions[0]->page_index > 0) ? $page->versions[$page->version_index]->{$model}[$j]->versions[0]->page_index - 1 : null;
					$page->versions[$page->version_index]->{$model}[$j]->versions[0]->next_index = ($page->versions[$page->version_index]->{$model}[$j]->versions[0]->page_index < (count($page->versions[$page->version_index]->$model))) ? $page->versions[$page->version_index]->{$model}[$j]->versions[0]->page_index + 1 : null;
					$page->versions[$page->version_index]->{$model}[$j]->versions[0]->page_num = $page->versions[$page->version_index]->{$model}[$j]->versions[0]->page_index + 1;
					$page->versions[$page->version_index]->{$model}[$j]->versions[0]->total_pages = count($page->versions[$page->version_index]->$model);
				} 	
			}
		}

		// Primary role
		if (!isset($page->version_index) || empty($page->versions)) return $page;
		$type = 'composite';
		if ('media'==$page->type) $type='media';
		if (!empty($page->versions[$page->version_index]->tag_of)) $type = 'tag';
		if (!empty($page->versions[$page->version_index]->path_of)) $type = 'path';
		$scalar_ns = $namespaces['scalar'];
		$page->primary_role = $scalar_ns.ucwords($type);
		
		return $page;		
		
	}    
    
    private function _relationships_by_ref(&$return, $book, $content, $base_uri='', $restrict=null, $rel=self::REL_ALL, $sq=null, $versions=self::VERSIONS_MOST_RECENT, $ref=self::REFERENCES_ALL, $pagination=self::NO_PAGINATION, $max_recurses=0, $num_recurses=0) {

		if (empty($content)) return;
		if ($num_recurses >= $max_recurses) return;
		
		$CI =& get_instance(); 	
		$models = $CI->config->item('rel');	
		if ('array'!=gettype($models)) {
			$CI->config->load('local_settings');
			$models = $CI->config->item('rel');	
		}
		if ('array'!=gettype($models)) throw new Exception('Could not locate relationship configuration');		
		
		foreach ($content as $row) {
			$uri = $row->version_of.'.'.$row->version_num;
			foreach ($models as $model) {
				if (!empty($restrict) && $model != $restrict) continue;
				$model_s = singular($model);
				if ('object'!=gettype($CI->$model)) $CI->load->model($model_s.'_model',$model);
				if (empty($rel) || $rel == self::REL_PARENTS_ONLY) {
					$nodes = $CI->$model->get_parents($row->version_id, null, null, null, true);
					foreach ($nodes as $node) {
						$this->_annotation_parent_by_ref($return, $book, $node, $uri, $base_uri, $restrict, $rel, $sq, $versions, $ref, $pagination, $max_recurses, $num_recurses);
					}
				}
				if (empty($rel) || $rel == self::REL_CHILDREN_ONLY) {
					$nodes = $CI->$model->get_children($row->version_id, null, null, null, true);
					foreach ($nodes as $node) {
						$this->_annotation_child_by_ref($return, $book, $node, $uri, $base_uri, $restrict, $rel, $sq, $versions, $ref, $pagination, $max_recurses, $num_recurses);	
					}
				}		
			}		
		}	    	
    	
    } 
    
	private function _annotation_parent($book, $annotation, $base_uri='', $restrict=null, $rel=self::REL_ALL, $sq=null, $versions=self::VERSIONS_MOST_RECENT, $ref=self::REFERENCES_ALL, $pagination=self::NO_PAGINATION, $max_recurses=0, $num_recurses=0) {

		$CI =& get_instance(); 	
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');		
		
		$content = $CI->pages->get_by_slug($book->book_id, $annotation->parent_content_slug);
		$content = $this->_content($book, $content, $base_uri, $restrict, self::REL_CHILDREN_ONLY, $sq, $versions, $ref, $pagination, $max_recurses, ++$num_recurses);
		foreach ($this->rel_fields as $field) {
			if (isset($annotation->$field)) {
				$content->versions[$content->version_index]->$field = $annotation->$field;
			}
		} 	
		
		return $content;

	}	    
    
	private function _annotation_parent_by_ref(&$return, $book, $annotation, $target_uri, $base_uri, $restrict, $rel, $sq, $versions, $ref, $pagination, $max_recurses=0, $num_recurses=0) {

		$CI =& get_instance(); 	
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if ('object'!=gettype($CI->annotations)) $CI->load->model('annotation_model','annotations');		
		
		$annotation->has_body = $base_uri.$annotation->parent_content_slug.'.'.$annotation->parent_version_num;
		$annotation->has_target = $target_uri.$this->_annotation_append($annotation);
		$return[$annotation->urn] = $CI->annotations->rdf($annotation);	
		// Body might not exist in the graph
		// Target should already exist because it's what pulled its annotations
		if (!$this->_uri_exists($return, $annotation->has_body)) {
			$content = $CI->pages->get_by_slug($book->book_id, $annotation->parent_content_slug);
			$this->_index_by_ref($return, $book, $content, $base_uri, $restrict, $rel, $sq, $versions, $ref, $pagination, $max_recurses, ++$num_recurses);
		}		
		
	}	
	
	private function _annotation_child($book, $annotation, $base_uri='', $restrict=null, $rel=self::REL_ALL, $sq=null, $versions=self::VERSIONS_MOST_RECENT, $ref=self::REFERENCES_ALL, $pagination=self::NO_PAGINATION, $max_recurses=0, $num_recurses=0) {

		$CI =& get_instance(); 	
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');				
		
		$content = $CI->pages->get_by_slug($book->book_id, $annotation->child_content_slug);
		$content = $this->_content($book, $content, $base_uri, $restrict, self::REL_CHILDREN_ONLY, $sq, $versions, $ref, $pagination, $max_recurses, ++$num_recurses);
		foreach ($this->rel_fields as $field) {
			if (isset($annotation->$field)) {
				$content->versions[$content->version_index]->$field = $annotation->$field;
			}
		} 	
		
		return $content;			
		
	}		
	
	private function _annotation_child_by_ref(&$return, $book, $annotation, $body_uri, $base_uri, $restrict, $rel, $sq, $versions, $ref, $pagination, $max_recurses=0, $num_recurses=0) {
		
		$CI =& get_instance(); 	
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if ('object'!=gettype($CI->annotations)) $CI->load->model('annotation_model','annotations');	
		
		$annotation->has_body = $body_uri;		
		$target_base = $base_uri.$annotation->child_content_slug.'.'.$annotation->child_version_num;
		$annotation->has_target = $target_base.$this->_annotation_append($annotation);
		$return[$annotation->urn] = $CI->annotations->rdf($annotation);	
		// Target might not exist in the graph
		// Body should already exist because it's what pulled its annotations
		if (!$this->_uri_exists($return, $target_base)) {
			$content = $CI->pages->get_by_slug($book->book_id, $annotation->child_content_slug); 		
			$this->_index_by_ref($return, $book, $content, $base_uri, $restrict, $rel, $sq, $versions, $ref, $pagination, $max_recurses, ++$num_recurses);	
		}			
		
	}	    
    
	private function _annotation_category_by_ref(&$return, $version, $base_uri) {

		$CI =& get_instance(); 	
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if ('object'!=gettype($CI->annotations)) $CI->load->model('annotation_model','annotations');		
		
		$annotation = new stdClass;
		$version->datatime = $version->created;
		$annotation->has_body = $version->version_of.'.'.$version->version_num;
		$annotation->has_target = rtrim($base_uri,'/').'#datetime='.rdf_timestamp($version->created).'&type='.$version->category;  // The book 
		$return[$CI->pages->category_urn($version->category,$version->version_id)] = $CI->annotations->rdf($annotation);			
		
	}       
	
	private function _uri_exists($return, $uri='') {
		
		if (empty($return)) return false;
		if (array_key_exists($uri, $return)) return true;
		return false;
		
	}    
    
	private function _annotation_append($content) {

		$append = '';
		if (!empty($content->start_seconds) || !empty($content->end_seconds)) {
			$append = '#t=npt:'.$content->start_seconds.','.$content->end_seconds;
		} elseif (!empty($content->start_line_num) || !empty($content->end_line_num)) {
			$append = '#line='.$content->start_line_num.','.$content->end_line_num;
		} elseif (!empty($content->points)) {
			$append = '#xywh='.$content->points;
		} elseif (!empty($content->datetime)) {
			$append = '#datetime='.rdf_timestamp($content->datetime);
			if (!empty($content->paragraph_num)) $append .= '&paragraph='.$content->paragraph_num;		
		} elseif (isset($content->sort_number)) {
			if (!empty($content->sort_number) || !empty($content->relationship) || isset($content->list_in_index)) {
				$append = '#index='.$content->sort_number;
				if (!empty($content->relationship)) $append .= '&role='.$content->relationship;
				if (isset($content->list_in_index)) $append .= '&listed='.$content->list_in_index;	
			}
		}
		return $append;		
		
	}    	
	
}

/* End of file RDF_Object.php */
