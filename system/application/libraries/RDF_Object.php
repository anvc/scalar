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
 * @version					1.3
 */

if ( ! defined('BASEPATH')) exit('No direct script access allowed'); 

class RDF_Object {

	const RESTRICT_NONE = null;
    const REL_ALL = null;
	const REL_CHILDREN_ONLY = 1;
	const REL_PARENTS_ONLY = 2;
	const VERSIONS_ALL = 0;
	const VERSIONS_MOST_RECENT = 1;
	const REFERENCES_ALL = 1;
	const REFERENCES_NONE = 0;
	const NO_SEARCH = null;
	const NO_PAGINATION = null;
	public $ns = array();
	private $version_cache = array();
	private $rel_fields = array('start_seconds','end_seconds','start_line_num','end_line_num','points','datetime','paragraph_num');	
	private $defaults = array(
							 'books'		=> null,
			                 'book'         => null, 
							 'users' 		=> null,
			                 'content'      => null, 
			                 'base_uri'     => null,
	 						 'method'		=> '',
	                         'restrict'     => self::RESTRICT_NONE, 
							 'rel'          => self::REL_ALL, 
							 'sq'           => self::NO_SEARCH,
							 'versions'     => self::VERSIONS_MOST_RECENT, 
						     'ref'          => self::REFERENCES_NONE, 
	                         'pagination'   => self::NO_PAGINATION, 
	                         'max_recurses' => 0,  
	                         'num_recurses' => 0,
							 'total'   		=> 0
							 );
	
	public function __construct() {

		$CI =& get_instance(); 
		$CI->load->helper('inflector');
		$this->ns = $CI->config->item('namespaces');	
		if ('array'!=gettype($this->ns)) {
			$CI->config->load('local_settings');
			$this->ns = $CI->config->item('namespaces');	
		}
		if ('array'!=gettype($this->ns)) throw new Exception('Could not locate namespaces configuration');		
		
    }
    
    public function serialize(&$return=null, $format='xml') {

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
    
    public function system(&$arg0=null, $arg1=null) {

		$numargs = func_num_args();
		if (!$numargs) throw new Exception('Invalid arguments');    	
    	
    	if (!is_array($arg0)) {
			$this->_system_by_ref($arg0, $arg1);
		} else {
			return $this->_system($arg0);
		}		
		
    }
   
    public function book(&$arg0=null, $arg1=null) {

		$numargs = func_num_args();
		if (!$numargs) throw new Exception('Invalid arguments');

		if (!is_array($arg0)) {
			$this->_book_by_ref($arg0, $arg1);
		} else {
			return $this->_book($arg0);
		}
    	
    }    
    
    public function index(&$arg0=null, $arg1=null) {

    	$numargs = func_num_args();
		if (!$numargs) throw new Exception('Invalid arguments');

		if (!is_array($arg0)) {
			$this->_index_by_ref($arg0, $arg1);
		} else {
			return $this->_index($arg0);
		}
    	
    }
    
    private function _system($settings) {
    
    	throw new Exception('System by value is not yet supported');
    
    }    
    
    private function _system_by_ref(&$return, $settings) {

    	$CI =& get_instance(); 
    	if ('object'!=gettype($CI->books)) $CI->load->model('book_model','books');
    	$settings = $this->_settings($settings);
    	
    	foreach ($settings['books'] as $row) {
    		if (!isset($settings['content']->has_part)) $settings['content']->has_part = array();
			$settings['content']->has_part[] = $settings['base_uri'].$row->slug;
    	}

    	$return[rtrim($settings['base_uri'],'/')] = $CI->books->rdf($settings['content']);
    	
	 	// Book nodes
		foreach ($settings['books'] as $row) {	
			unset($row->users);
			if (isset($row->thumbnail) && !empty($row->thumbnail)) $row->thumbnail = $settings['base_uri'].confirm_slash($row->slug).$row->thumbnail;
			$return[$settings['base_uri'].$row->slug] = $CI->books->rdf($row, $settings['base_uri']);
		}       	
    	
    }
    
    private function _book($settings) {
    
    	throw new Exception('Book by value is not yet supported');
    
    }
    
    private function _book_by_ref(&$return, $settings) {

		$CI =& get_instance(); 	
		if ('object'!=gettype($CI->books)) $CI->load->model('book_model','books');
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if ('object'!=gettype($CI->versions)) $CI->load->model('version_model','versions');
		$settings = $this->_settings($settings);
		
		// Publisher
		if($settings['book']->publisher || $settings['book']->publisher_thumbnail) {
	 		$pub = new stdClass;
	 		$pub->title = ($settings['book']->publisher) ? $settings['book']->publisher : null;
	 		$pub->publisher_thumbnail = ($settings['book']->publisher_thumbnail) ? $settings['book']->publisher_thumbnail : null;
	 		$pub->type = 'Resource';			
			$settings['book']->publisher = $settings['base_uri'].'publisher';
			unset($settings['book']->publisher_thumbnail);
		}
    	
		// Write TOC URI first, to make the output reader friendly
	 	$settings['book']->table_of_contents = $settings['base_uri'].'toc';

		// Book users
		$settings['book']->users = array();
		foreach ($settings['users'] as $row) {
			if (!$row->list_in_index) continue;  
			$sort_number = (int) $row->sort_number;
			$user_base = $settings['base_uri'].'users/'.$row->user_id;
			$settings['book']->users[] = $user_base.$this->_annotation_append($row);
		}
		
		// Book node
	 	$return[rtrim($settings['base_uri'],'/')] = $CI->books->rdf($settings['book'], $settings['base_uri']);

	 	// Publisher
	 	if($settings['book']->publisher) {
	 		$return[$settings['base_uri'].'publisher'] = $CI->versions->rdf($pub);
	 	}
	 		
	 	// Table of contents
	 	$toc = new stdClass;
	 	$toc->title = 'Main Menu';
	 	$toc->type = 'Page';
	 	$toc->references = array();	 
	 	$toc_content = $CI->books->get_book_versions($settings['book']->book_id, true);
		foreach ($toc_content as $row) {
			$toc->references[] = $settings['base_uri'].$row->slug.$this->_annotation_append($row);
		}	 	
	 	$return[$settings['base_uri'].'toc'] = $CI->versions->rdf($toc);

	 	// Users
		foreach ($settings['users'] as $row) {
			if (!$row->list_in_index) continue;  
			$return[$settings['base_uri'].'users/'.$row->user_id] = $CI->users->rdf($row);
		}	 	
		
	 	// Table of contents nodes
		foreach ($toc_content as $row) {
			foreach ($row->versions as $version) {
				$row->has_version[] = $settings['base_uri'].$row->slug.'.'.$version->version_num;
			}		
			$return[$settings['base_uri'].$row->slug] = $CI->pages->rdf($row, $settings['base_uri']);
			foreach ($row->versions as $version) {	
				$return[$settings['base_uri'].$row->slug.'.'.$version->version_num] = $CI->versions->rdf($version, $settings['base_uri']);
			}
		}   

    }    
    
    private function _index($settings=array()) {

    	$settings = $this->_settings($settings);
		if (empty($settings['content'])) return $settings['content'];
		if (!is_array($settings['content'])) $settings['content'] = array($settings['content']);
		if (!empty($settings['pagination']) && $settings['pagination']['start']>0) $settings['content'] = array_slice($settings['content'], $settings['pagination']['start']);
		$count = 0;	
		
		foreach ($settings['content'] as $row) {
			if (!empty($settings['pagination']) && $count >= $settings['pagination']['results']) break;
			$index = $this->_content($row, $settings);
			if (!empty($index)) {
				$return[] = $index; 
				$count++;
			}
		}
		
		return $return;    	
    	
    }
    
    private function _index_by_ref(&$return, $settings) {

    	$settings = $this->_settings($settings);
		if (empty($settings['content'])) return;
		if (!is_array($settings['content'])) $settings['content'] = array($settings['content']);	
		$total = count($settings['content']);
		if (!empty($settings['pagination']) && $settings['pagination']['start']>0) $settings['content'] = array_slice($settings['content'], $settings['pagination']['start']);
		$count = 0;

		foreach ($settings['content'] as $row) {
			if (!empty($settings['pagination']) && $count >= $settings['pagination']['results']) break;
			$this->_content_by_ref($return, $row, $settings);
			if (!isset($this->version_cache[$row->content_id])) {
				$total--;
				continue;
			} 
			$this->_relationships_by_ref($return, $this->version_cache[$row->content_id], $settings);
			$count++;
		}

		if (empty($return)) return;
		
		$CI =& get_instance(); 
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if (!empty($settings['sq'])) {
			$total = 0;
			foreach ($return as $uri => $values) {
				if (
				    !$this->_object_exists($values, 'rdf:type', $CI->pages->rdf_type('composite')) &&
					!$this->_object_exists($values, 'rdf:type', $CI->pages->rdf_type('media'))    
				) continue;
				$total++;
			}		
		}
		foreach ($return as $uri => $values) {
			if (
				!$this->_object_exists($values, 'rdf:type', $CI->pages->rdf_type('composite')) &&
				!$this->_object_exists($values, 'rdf:type', $CI->pages->rdf_type('media'))    
			) continue;			
			$return[$uri] = array_merge($values, $CI->pages->rdf(array('citation'=>'method='.$settings['method'].';methodNumNodes='.$total.';'), $settings['base_uri']));
		}
		    	
    }
    
	private function _content($row, $settings) {
		
		// Grab list of relationship models
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
		
		// Versions attached to the content
		if (!isset($row->versions) || empty($row->versions)) {
			//if (!is_int($settings['versions']) || empty($row->recent_version_id)) {
				//echo 'get_all: '.$settings['versions']."\n";
				$row->versions = $CI->versions->get_all(
														$row->content_id, 
														((is_int($settings['versions']))?null:$settings['versions']), 
														((is_int($settings['versions']))?$settings['versions']:1), 
														$settings['sq']
													   );
			/*
			} else {
				//echo 'get: '.$row->recent_version_id."\n";
				$row->versions[0] = $CI->versions->get($row->recent_version_id, $settings['sq']);
			}
			*/
		}
		if (!count($row->versions)) return null;
		$row->version_index = 0; 
		//if (empty($row->recent_version_id)) $CI->versions->set_recent_version_id($row->content_id, $row->versions[$row->version_index]->version_id);
		if (null!==$settings['max_recurses'] && $settings['num_recurses']==$settings['max_recurses']) return $row;

		// Relationships
		for ($j = 0; $j < count($row->versions); $j++) {
			$version_id = $row->versions[$j]->version_id;
			foreach ($models as $model) {
				if (!empty($settings['restrict']) && $model != $settings['restrict']) continue;
				$model_s = singular($model);
				if ('object'!=@gettype($CI->$model)) $CI->load->model($model_s.'_model',$model);
				if ($settings['rel'] == self::REL_PARENTS_ONLY || $settings['rel'] == self::REL_ALL) {
					$name = 'has_'.$model;
					$row->versions[$j]->$name = array();
					$nodes = $CI->$model->get_parents($version_id, null, null, null, 1);
					foreach ($nodes as $node) {
						array_push($row->versions[$j]->$name, $this->_annotation_parent($node, $settings));
					}
				}
				if ($settings['rel'] == self::REL_CHILDREN_ONLY || $settings['rel'] == self::REL_ALL) {
					$name = $model_s.'_of';
					$row->versions[$j]->$name = array();
					$nodes = $CI->$model->get_children($version_id, null, null, null, 1);
					foreach ($nodes as $node) {
						array_push($row->versions[$j]->$name, $this->_annotation_child($node, $settings));
					}	
				}			
			}		
		}	

		$row = $this->_relationship_pagination($row);
		return $row;
		 
	}    
    
    private function _content_by_ref(&$return, $row, $settings) {

		if ($this->_uri_exists($return, $settings['base_uri'].$row->slug)) return;
		
		$CI =& get_instance(); 	
		if ('object'!=gettype($CI->books)) $CI->load->model('book_model','books');
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if ('object'!=gettype($CI->versions)) $CI->load->model('version_model','versions');	
		if ('object'!=gettype($CI->references)) $CI->load->model('reference_model','references');	

		// Versions attached to each node
    	// if (!is_int($settings['versions']) || empty($row->recent_version_id)) {
			$versions = $CI->versions->get_all(
												$row->content_id, 
												((is_int($settings['versions']))?null:$settings['versions']), 
												((is_int($settings['versions']))?$settings['versions']:1), 
												$settings['sq']
											   );
		/*
    	} else {
			$versions = array();
			$version = $CI->versions->get($row->recent_version_id, $settings['sq']);
			if (!empty($version)) $versions[0] = $version;
			unset($version);
		}
		*/		
		if (!count($versions)) return;
		// if (empty($row->recent_version_id)) $CI->versions->set_recent_version_id($row->content_id, $versions[0]->version_id);
		
		// Special fields including references (if applicable)
		$row->version = $settings['base_uri'].$row->slug.'.'.$versions[0]->version_num; 
		foreach ($versions as $key => $version) {
			$row->has_version[] = $settings['base_uri'].$row->slug.'.'.$version->version_num;
			$row->has_version_id[] = $version->version_id;
			$versions[$key]->version_of = $settings['base_uri'].$row->slug;
			if (isset($versions[($key+1)])) $versions[$key]->replaces = $settings['base_uri'].$row->slug.'.'.$versions[($key+1)]->version_num;
			if (isset($versions[($key-1)])) $versions[$key]->replaced_by = $settings['base_uri'].$row->slug.'.'.$versions[($key-1)]->version_num;
			// References
			if ($settings['ref'] && $settings['num_recurses'] <= $settings['max_recurses']) {
				$nodes = $CI->references->get_parents($version->version_id, null, null, null, true);
				foreach ($nodes as $node) {
					$versions[$key]->has_reference[] = $settings['base_uri'].$node->parent_content_slug;
				}					
				$nodes = $CI->references->get_children($version->version_id, null, null, null, true);
				foreach ($nodes as $node) {
					$versions[$key]->references[] = $settings['base_uri'].$node->child_content_slug;
				}		
			}
			// Categories (commentaries, reviews) (comments on the book itself)
			if (!empty($row->category)) $versions[$key]->category = $row->category;				
		}
		
		// Place into object for use later in relationship building
		$this->version_cache[$row->content_id] = $versions;
		unset($versions);
			
		// Write page RDF before version RDF so they show up in the correct human-readable order
		$return[$settings['base_uri'].$row->slug] = $CI->pages->rdf($row, $settings['base_uri']);
		foreach ($this->version_cache[$row->content_id] as $version) {
			$return[$settings['base_uri'].$row->slug.'.'.$version->version_num] = $CI->versions->rdf($version, $settings['base_uri']);
		}								

		// Write references nodes (down here so they show up at the bottom of the graph)
		if ($settings['ref'] && $settings['num_recurses'] < $settings['max_recurses']) {
			foreach ($this->version_cache[$row->content_id] as $version) {
				if (isset($version->has_reference)) {
					foreach ($version->has_reference as $parent_content_uri) {
						if ($this->_uri_exists($return, $parent_content_uri)) continue;
						$ref_content = $CI->pages->get_by_slug($settings['book']->book_id, substr($parent_content_uri, strlen($settings['base_uri']))); 
						++$settings['num_recurses'];
						$settings['rel'] = self::REL_CHILDREN_ONLY;
						$settings['pagination'] = self::NO_PAGINATION;
						if (!empty($ref_content)) $this->_content_by_ref($return, $ref_content, $settings);
					}	
				}					
				if (isset($version->references)) {
					foreach ($version->references as $child_content_uri) {
						if ($this->_uri_exists($return, $child_content_uri)) continue;
						$ref_content = $CI->pages->get_by_slug($settings['book']->book_id, substr($child_content_uri, strlen($settings['base_uri']))); 
						++$settings['num_recurses'];
						$settings['rel'] = self::REL_CHILDREN_ONLY;
						$settings['pagination'] = self::NO_PAGINATION;
						if (!empty($ref_content)) $this->_content_by_ref($return, $ref_content, $settings);
					}	
				}				
			}
		}	
		
		// Write category relationships (again, down here so they show up at the bottom of the graph)
		foreach ($this->version_cache[$row->content_id] as $version) {
			if (!empty($version->category)) {
				$this->_annotation_category_by_ref($return, $version, $settings);
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
					$page->versions[$page->version_index]->{$model}[$j]->versions[0]->page_index = 0;
					if (isset($page->versions[$page->version_index]->{$model}[$j]->versions[0]->$rev_model)) {
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
					}
					// Continue to
					if (empty($page->versions[$page->version_index]->{$model}[$j]->versions[0]->next_index)) {
						if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
						$continue_to_content_id = (int) $page->versions[$page->version_index]->{$model}[$j]->versions[0]->continue_to_content_id;
						if ($continue_to_content_id) {
							$continue_to = $CI->pages->get($continue_to_content_id);
							if (empty($continue_to) || !$continue_to->is_live) $continue_to = null;
							$page->versions[$page->version_index]->{$model}[$j]->versions[0]->continue_to = $continue_to;
							$page->versions[$page->version_index]->continue_to = $this->_index(array('content'=>$continue_to));
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
		//print_r($page);
		return $page;		
		
	}    
    
    private function _relationships_by_ref(&$return, $versions, $settings) {

		if (empty($versions)) return;
		if ($settings['num_recurses'] >= $settings['max_recurses']) return;

		// Grab list of models
		$CI =& get_instance(); 	
		$models = $CI->config->item('rel');	
		if ('array'!=gettype($models)) {
			$CI->config->load('local_settings');
			$models = $CI->config->item('rel');	
		}
		if ('array'!=gettype($models)) throw new Exception('Could not locate relationship configuration');		

		// Load relationships for each content row
		foreach ($versions as $row) {
			$uri = $row->version_of.'.'.$row->version_num;
			foreach ($models as $model) {
				if (!empty($settings['restrict']) && $model != $settings['restrict']) continue;
				$model_s = singular($model);
				if ('object'!=gettype($CI->$model)) $CI->load->model($model_s.'_model',$model);
				if (empty($settings['rel']) || $settings['rel'] == self::REL_PARENTS_ONLY) {
					$nodes = $CI->$model->get_parents($row->version_id, null, null, null, true);
					foreach ($nodes as $node) {
						$this->_annotation_parent_by_ref($return, $node, $uri, $settings);
					}
				}
				if (empty($settings['rel']) || $settings['rel'] == self::REL_CHILDREN_ONLY) {
					$nodes = $CI->$model->get_children($row->version_id, null, null, null, true);
					foreach ($nodes as $node) {
						$this->_annotation_child_by_ref($return, $node, $uri, $settings);	
					}
				}	
			}		
		}	 
    	
    } 
    
	private function _annotation_parent($annotation, $settings) {

		$CI =& get_instance(); 	
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');		
		
		$content = $CI->pages->get_by_slug($settings['book']->book_id, $annotation->parent_content_slug);
		// Changed the versions param to VERSIONS_MOST_RECENT here; passing the incoming value through was causing problems
		$settings['rel'] = self::REL_CHILDREN_ONLY;
		$settings['versions'] = self::VERSIONS_MOST_RECENT;
		++$settings['num_recurses'];
		$content = $this->_content($content, $settings);
		foreach ($this->rel_fields as $field) {
			if (isset($annotation->$field)) {
				$content->versions[$content->version_index]->$field = $annotation->$field;
			}
		} 	
		
		return $content;

	}	    
    
	private function _annotation_parent_by_ref(&$return, $annotation, $target_uri, $settings) {

		$CI =& get_instance(); 	
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if ('object'!=gettype($CI->annotations)) $CI->load->model('annotation_model','annotations');		
		
		$annotation->has_body = $settings['base_uri'].$annotation->parent_content_slug.'.'.$annotation->parent_version_num;
		$annotation->has_target = $target_uri.$this->_annotation_append($annotation);
		$return[$annotation->urn] = $CI->annotations->rdf($annotation);	
		// Body might not exist in the graph
		// Target should already exist because it's what pulled its annotations
		if (!$this->_uri_exists($return, $annotation->has_body)) {
			$settings['content'] = $CI->pages->get_by_slug($settings['book']->book_id, $annotation->parent_content_slug);
			++$settings['num_recurses'];
			$this->_index_by_ref($return, $settings);
		}		
		
	}	
	
	private function _annotation_child($annotation, $settings) {

		$CI =& get_instance(); 	
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');				
		
		$content = $CI->pages->get_by_slug($settings['book']->book_id, $annotation->child_content_slug);
		// Changed the versions param to VERSIONS_MOST_RECENT here; passing the incoming value through was causing problems
		$settings['rel'] = self::REL_CHILDREN_ONLY;
		$settings['versions'] = self::VERSIONS_MOST_RECENT;
		++$settings['num_recurses'];		
		$content = $this->_content($content, $settings);
		foreach ($this->rel_fields as $field) {
			if (isset($annotation->$field)) {
				$content->versions[$content->version_index]->$field = $annotation->$field;
			}
		} 	
		
		return $content;			
		
	}		
	
	private function _annotation_child_by_ref(&$return, $annotation, $body_uri, $settings) {
		
		$CI =& get_instance(); 	
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if ('object'!=gettype($CI->annotations)) $CI->load->model('annotation_model','annotations');	
		
		$annotation->has_body = $body_uri;		
		$target_base = $settings['base_uri'].$annotation->child_content_slug.'.'.$annotation->child_version_num;
		$annotation->has_target = $target_base.$this->_annotation_append($annotation);
		$return[$annotation->urn] = $CI->annotations->rdf($annotation);	
		// Target might not exist in the graph
		// Body should already exist because it's what pulled its annotations
		if (!$this->_uri_exists($return, $target_base)) {
			$settings['content'] = $CI->pages->get_by_slug($settings['book']->book_id, $annotation->child_content_slug); 
			++$settings['num_recurses'];	
			$this->_index_by_ref($return, $settings);	
		}			
		
	}	    
    
	private function _annotation_category_by_ref(&$return, $version, $settings) {

		$CI =& get_instance(); 	
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if ('object'!=gettype($CI->annotations)) $CI->load->model('annotation_model','annotations');		
		
		$annotation = new stdClass;
		$version->datatime = $version->created;
		$annotation->has_body = $version->version_of.'.'.$version->version_num;
		$annotation->has_target = rtrim($settings['base_uri'],'/').'#datetime='.rdf_timestamp($version->created).'&type='.$version->category;  // The book 
		$return[$CI->pages->category_urn($version->category,$version->version_id)] = $CI->annotations->rdf($annotation);			
		
	}       
	
	private function _settings($settings=array()) {
		
		return array_merge($this->defaults, $settings);
		
	}
	
	private function _uri_exists($return, $uri='') {
		
		if (empty($return)) return false;
		if (array_key_exists($uri, $return)) return true;
		return false;
		
	}   

	private function _object_exists($s, $p, $o) {
		
		if (!array_key_exists($p,$s)) return false;
		foreach ($s[$p] as $rdf_type) {
			if ($rdf_type['value'] == $o) return true;
		}
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
