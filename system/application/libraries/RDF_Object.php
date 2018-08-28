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

/**
 * @projectDescription		Convert internal structures into RDF; includes two approaches -- one where the object is
 *                          non-hierarchical/recursive, the other nested -- based on arguments passed to book() or index()
 * @author					Craig Dietrich
 * @version					1.5
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
	const PROVENANCE_ALL = 1;
	const PROVENANCE_NONE = null;
	const TKLABELS_ALL = 1;
	const TKLABELS_NONE = 0;
	const USERS_ALL = 1;
	const USERS_LISTED = 2;
	const USE_VERSIONS_INCLUSIVE = 0;
	const USE_VERSIONS_EXCLUSIVE = 1;
	public $ns = array();
	private $version_cache = array();
	private $user_cache = array();
	private $rel_fields = array('sort_number','start_seconds','end_seconds','start_line_num','end_line_num','points','datetime','paragraph_num');
	private $defaults = array(
		'books'			=> null,
		'book'			=> null,
		'users'			=> null,
		'content'		=> null,
		'use_versions'	=> null,
		'base_uri'		=> null,
		'method'		=> '',
		'restrict'		=> self::RESTRICT_NONE,
		'rel'			=> self::REL_ALL,
		'sq'			=> self::NO_SEARCH,
		'versions'		=> self::VERSIONS_MOST_RECENT,
		'ref'			=> self::REFERENCES_NONE,
		'prov'			=> self::PROVENANCE_NONE,
		'pagination'	=> self::NO_PAGINATION,
		'use_versions_restriction' => self::USE_VERSIONS_INCLUSIVE,
		'max_recurses'	=> 0,
		'num_recurses'	=> 0,
		'total'			=> 0,
		'anon_name'		=> 'anonymous',
		'u_all'			=> self::USERS_LISTED,
		'editorial_state' => null,
		'tklabeldata'	=> null,
		'tklabels'		=> self::TKLABELS_NONE
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

	public function annotation_append($content) {

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

    public function model_to_rdf($settings) {

		$CI =& get_instance();
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if ('object'!=gettype($CI->versions)) $CI->load->model('version_model','versions');
		$return = array();

		foreach ($settings['content'] as $row) {
			$row->has_version = $row->version = $settings['base_uri'].$row->slug.'.'.$row->versions[key($row->versions)]->version_num;
	    	$return[$settings['base_uri'].$row->slug] = $CI->pages->rdf($row, $settings['base_uri']);
			foreach ($row->versions as $version) {
				$version->version_of = $settings['base_uri'].$row->slug;
				$return[$settings['base_uri'].$row->slug.'.'.$version->version_num] = $CI->versions->rdf($version, $settings['base_uri']);
			}
		}

		return $return;

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

		// Remove user field (the book creator)
		unset($settings['book']->user);

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
			if ($settings['u_all']==self::USERS_LISTED && !$row->list_in_index) continue;
			$sort_number = (int) $row->sort_number;
			$user_base = $settings['base_uri'].'users/'.$row->user_id;
			$settings['book']->users[] = $user_base.$this->annotation_append($row);
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
			$toc->references[] = $settings['base_uri'].$row->slug.$this->annotation_append($row);
		}
	 	$return[$settings['base_uri'].'toc'] = $CI->versions->rdf($toc);

	 	// Users
		foreach ($settings['users'] as $row) {
			if ($settings['u_all']==self::USERS_LISTED && !$row->list_in_index) continue;
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
		// Don't cast $return, so a key won't be set if there is no $index returned below

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
		$settings['total'] = count($settings['content']);

		$count = 0;
		$skips = 0;
		foreach ($settings['content'] as $row) {
	  
			// The logic below is adaptable to results with or without versions already include; full search (get_all()) and quick search (search_with_recent_version_id())
			
			$temp_return = array();
			
			if (!empty($settings['pagination']) && $count >= $settings['pagination']['results']) break;

			if (!empty($settings['sq']) && empty($row->versions)) {
				$this->_content_by_ref($temp_return, $row, $settings);
				if (0==count($temp_return) || !isset($this->version_cache[$row->content_id])) {
					$settings['total']--;
					continue;
				}
			}
			
			if (!empty($settings['pagination']) && $settings['pagination']['start']>$skips) {
				$settings['total']--;
				$skips++;
				continue;
			}
			
			if (!empty($temp_return)) {
				$return = array_merge((array)$return,(array)$temp_return);
			} else {
				$temp_return = array();
				$this->_content_by_ref($temp_return, $row, $settings);
				if (0==count($temp_return) || !isset($this->version_cache[$row->content_id])) {
					$settings['total']--;
					continue;
				}
				$return = array_merge((array)$return,(array)$temp_return);
			}

			$this->_provenance_by_ref($return, $row, $this->version_cache[$row->content_id], $settings);
			$this->_tklabels_by_ref($return, $row, $this->version_cache[$row->content_id], $settings);
			$this->_relationships_by_ref($return, $this->version_cache[$row->content_id], $settings);
			$count++;
		}

		$this->_pagination_by_ref($return, $settings);

    }

	private function _content($row, $settings) {

		// Grab list of relationship models
		$CI =& get_instance();
		if ('object'!=gettype($CI->versions)) $CI->load->model('version_model','versions');

		// Versions attached to the content
		if (!isset($row->versions) || empty($row->versions)) {
			if (self::VERSIONS_ALL === $settings['versions']) {
				$row->versions = $CI->versions->get_all($row->content_id, null, $settings['sq']);
			} else {
				$use_version_id = $this->_use_version($settings['use_versions'], $row->content_id);
				if (false===$use_version_id && $settings['use_versions_restriction'] == self::USE_VERSIONS_EXCLUSIVE) return null;
				$row->versions = array();
				$row->versions[0] = $CI->versions->get_single(
					$row->content_id,
					(!empty($use_version_id))?$use_version_id:$row->recent_version_id,
					$settings['sq']
				);
			}
		}

		if (!count($row->versions)) return null;
		$row->version_index = 0;
		$row = $this->_provenance($row, $settings);
		if (!isset($settings['book']->editorial_is_on) || empty($settings['book']->editorial_is_on)) {
			for ($j = 0; $j < count($row->versions); $j++) {
				unset($row->versions[$j]->editorial_state);
			}
		}
		if (!isset($settings['max_recurses'])) return $row;
		if (null!==$settings['max_recurses'] && $settings['num_recurses']==$settings['max_recurses']) return $row;

		$row = $this->_relationships($row, $settings);
		$row = $this->_tklabels($row, $settings);
		$row = $this->_pagination($row, $settings);

		return $row;

	}

    private function _content_by_ref(&$return, $row, $settings) {

		if ($this->_uri_exists($return, $settings['base_uri'].$row->slug)) return;

		$CI =& get_instance();
		if ('object'!=gettype($CI->books)) $CI->load->model('book_model','books');
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if ('object'!=gettype($CI->versions)) $CI->load->model('version_model','versions');
		if ('object'!=gettype($CI->references)) $CI->load->model('reference_model','references');

    	// User
		if ($settings['prov']) {
			if (array_key_exists($row->user, $this->user_cache)) {
				$row->user = $this->user_cache[$row->user];
			} else {
				if ('object'!=gettype($CI->users)) $CI->load->model('user_model','users');
				if (!empty($row->user)) $row->user = $CI->users->get_by_user_id($row->user);
				if (is_object($row->user)) $this->user_cache[$row->user->user_id] = $row->user;
			}
			if (empty($row->user)) $row->user = $CI->users->prov_wasAttributedTo($settings['anon_name'],$settings['base_uri']);
		}

    	// Versions attached to the content
		if (!isset($row->versions) || empty($row->versions)) {
			if (self::VERSIONS_ALL === $settings['versions']) {
				$versions = $CI->versions->get_all($row->content_id, null, $settings['sq']);
			} else {
				$use_version_id = $this->_use_version($settings['use_versions'], $row->content_id);
				if (false===$use_version_id && $settings['use_versions_restriction'] == self::USE_VERSIONS_EXCLUSIVE) return null;
				$versions = array();
				$version = $CI->versions->get_single(
					$row->content_id,
					(!empty($use_version_id))?$use_version_id:$row->recent_version_id,
					$settings['sq']
				);
				if (!empty($version)) $versions[0] = $version;
			}
		} else {
			$versions = $row->versions;
		}

		if (!count($versions)) return;
		
		// If editorial_state is present only pass through versions that match
		if (!empty($settings['editorial_state'])) {
			if (!isset($versions[0]->editorial_state)) return;
			for ($j = count($versions)-1; $j >= 0; $j--) {
				if ($versions[$j]->editorial_state != $settings['editorial_state']) unset($versions[$j]);
			}
			if (!count($versions)) return;
		}

		// Special fields including references and users (if applicable)
		$row->version = $settings['base_uri'].$row->slug.'.'.$versions[0]->version_num;
		foreach ($versions as $key => $version) {
			$row->has_version[] = $settings['base_uri'].$row->slug.'.'.$version->version_num;
			$row->has_version_id[] = $version->version_id;
			$versions[$key]->version_of = $settings['base_uri'].$row->slug;
			if (isset($versions[($key+1)])) $versions[$key]->replaces = $settings['base_uri'].$row->slug.'.'.$versions[($key+1)]->version_num;
			if (isset($versions[($key-1)])) $versions[$key]->replaced_by = $settings['base_uri'].$row->slug.'.'.$versions[($key-1)]->version_num;
			// References
			if ($settings['ref'] && $settings['num_recurses'] <= $settings['max_recurses']) {
				$nodes = $CI->references->get_parents($version->version_id, null, null, true);
				foreach ($nodes as $node) {
					$versions[$key]->has_reference[] = $settings['base_uri'].$node->parent_content_slug;
				}
				$nodes = $CI->references->get_children($version->version_id, null, null, true);
				foreach ($nodes as $node) {
					$versions[$key]->references[] = $settings['base_uri'].$node->child_content_slug;
				}
			}
			// User
			if ($settings['prov']) {
				if (array_key_exists($versions[$key]->user, $this->user_cache)) {
					$versions[$key]->user = $this->user_cache[$versions[$key]->user];
				} else {
					if (!empty($versions[$key]->user)) $versions[$key]->user = $CI->users->get_by_user_id($versions[$key]->user);
					if (is_object($versions[$key]->user)) $this->user_cache[$versions[$key]->user->user_id] = $versions[$key]->user;
				}
				if (empty($versions[$key]->user)) $versions[$key]->user = $CI->users->prov_wasAttributedTo($settings['anon_name'],$settings['base_uri'],$versions[$key]->attribution);
			}
			// Categories (commentaries, reviews) (comments on the book itself)
			if (!empty($row->category)) $versions[$key]->category = $row->category;
			// Editorial Workflow
			if (!isset($settings['book']->editorial_is_on) || empty($settings['book']->editorial_is_on)) {
				unset($versions[$key]->editorial_state);
			}
			// Paywall
			if (isset($row->paywall) && 1 == $row->paywall && false===$settings['paywall_msg']) {
				unset($versions[$key]->content);
				unset($versions[$key]->url);
			}
			// TK Labels
			if (isset($settings['tklabeldata']) && !empty($settings['tklabeldata']) && isset($settings['tklabeldata']['versions']) && isset($settings['tklabeldata']['versions'][$versions[$key]->version_id])) {
				$tk_codes = $settings['tklabeldata']['versions'][$versions[$key]->version_id];
				$versions[$key]->tklabels = array();
				foreach ($tk_codes as $code) {
					foreach ($settings['tklabeldata']['labels'] as $label) {
						if ($label['code'] == $code) {
							$versions[$key]->tklabels[] = $label;
							break;
						}
					}
				}
			}
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

	private function _provenance($page, $settings) {

		if (!$settings['prov']) return $page;
  		$CI =& get_instance();
  		if ('object'!=gettype($CI->users)) $CI->load->model('user_model','users');

  		// Create anonymous user object
  		$blank_user = new stdClass();
  		$blank_user->uri = $CI->users->prov_wasAttributedTo($settings['anon_name'],$settings['base_uri']);
  		$blank_user->user_id = 0;
  		$blank_user->type = '';
  		$blank_user->fullname = ucwords($settings['anon_name']);
  		$blank_user->url = '';

	    // Content user
		if (array_key_exists($page->user, $this->user_cache)) {
			$page->user = $this->user_cache[$page->user];
		} else {
			if (!empty($page->user)) $page->user = $CI->users->get_by_user_id($page->user);
			if (is_object($page->user)) {
				$page->user->uri = $CI->users->prov_wasAttributedTo($page->user->user_id,$settings['base_uri']);
				$this->user_cache[$page->user->user_id] = $page->user;
			}
		}
		if (empty($page->user) || !is_object($page->user)) $page->user = clone $blank_user;

		// Version users
		foreach ($page->versions as $key => $version) {
			if (array_key_exists($version->user, $this->user_cache)) {
				$page->versions[$key]->user = $this->user_cache[$version->user];
			} else {
				if (!empty($version->user)) $page->versions[$key]->user = $CI->users->get_by_user_id($version->user);
				if (is_object($page->versions[$key]->user)) {
					$page->versions[$key]->user->uri = $CI->users->prov_wasAttributedTo($page->versions[$key]->user->user_id,$settings['base_uri']);
					$this->user_cache[$page->versions[$key]->user->user_id] = $page->versions[$key]->user;
				}
			}
			if (empty($page->versions[$key]->user) || !is_object($page->versions[$key]->user)) {
				$page->versions[$key]->user = clone $blank_user;
				$page->versions[$key]->user->uri = $CI->users->prov_wasAttributedTo($page->versions[$key]->user->user_id,$settings['base_uri'],$page->versions[$key]->attribution);
				$page->versions[$key]->user->fullname = $CI->users->foaf_name($page->versions[$key]->user->fullname,$page->versions[$key]->attribution);
			}
		}

		return $page;

	}

	private function _provenance_by_ref(&$return, $row, $versions, $settings) {

		if (!$settings['prov']) return;
  		$CI =& get_instance();
  		if ('object'!=gettype($CI->users)) $CI->load->model('user_model','users');

		// Content user
		if (isset($row->user) && is_object($row->user)) {  // User was found
			$uri = $CI->users->prov_wasAttributedTo($row->user->user_id,$settings['base_uri']);
			//if (!$this->_uri_exists($return, $uri)) $return[$uri] = $CI->users->rdf($row->user);
			$this->_safely_write_rdf($return, $uri, $CI->users->rdf($row->user));  // User page node might be same as User FOAF node
		} elseif (isset($row->user) && is_numeric($row->user)) {  // User wasn't found but there is an ID number (could be "0")
			$uri = $CI->users->prov_wasAttributedTo($row->user,$settings['base_uri']);
			if (!$this->_uri_exists($return, $uri)) $return[$uri] = $CI->users->rdf((object)array(
																					'fullname'=>'Anonymous'
																					));
		} elseif (isset($row->user)) {  // Catch-all
			$uri = $CI->users->prov_wasAttributedTo('anonymous',$settings['base_uri']);
			if (!$this->_uri_exists($return, $uri)) $return[$uri] = $CI->users->rdf((object)array(
																					'fullname'=>'Anonymous'
																					));
		}

		// Version users
		foreach ($versions as $version) {
			if (isset($version->user) && is_object($version->user)) {  // User was found
				$uri = $CI->users->prov_wasAttributedTo($version->user->user_id,$settings['base_uri'],$version->attribution);
				if (!$this->_uri_exists($return, $uri)) $return[$uri] = $CI->users->rdf($version->user);
			} elseif (isset($version->user) && isset($version->attribution) && !empty($version->attribution->fullname)) {  // Attribution is set
				$uri = $CI->users->prov_wasAttributedTo('anonymous',$settings['base_uri'],$version->attribution);
				if (!$this->_uri_exists($return, $uri)) $return[$uri] = $CI->users->rdf((object)array(
																						'fullname'=>$version->attribution->fullname
																						));
			} elseif (isset($version->user) && is_numeric($version->user)) {  // User wasn't found by there is an ID number (could be "0")
				$uri = $CI->users->prov_wasAttributedTo($version->user,$settings['base_uri']);
				if (!$this->_uri_exists($return, $uri)) $return[$uri] = $CI->users->rdf((object)array(
																						'fullname'=>'Anonymous'
																						));
			} elseif (isset($version->user)) {  // Catch-all
				$uri = $CI->users->prov_wasAttributedTo('anonymous',$settings['base_uri'],$version->attribution);
				if (!$this->_uri_exists($return, $uri)) $return[$uri] = $CI->users->rdf((object)array(
																						'fullname'=>'Anonymous'
																						));
			}
		}

	}
	
	private function _tklabels($page, $settings) {
		
		if (!$settings['tklabels'] || empty($settings['tklabeldata'])) return $page;
		$CI =& get_instance();
		foreach ($page->versions as $key => $version) {
			if (!array_key_exists($version->version_id, $settings['tklabeldata']['versions'])) continue;
			$page->versions[$key]->tklabels = array();
			$tk_codes = $settings['tklabeldata']['versions'][$version->version_id];
			foreach ($tk_codes as $code) {
				foreach ($settings['tklabeldata']['labels'] as $tklabel) {
						if ($tklabel['code'] != $code) continue;
						$arr = array(
								'type' => $CI->versions->tk_type(),
								'url' => $tklabel['image'],
								'code' => $code,
								'uri' => $CI->versions->tk_hasLabel($tklabel)
						);
						foreach ($tklabel['text'] as $text) {
							if ($text['locale'] != $tklabel['defaultlocale']) continue;
							$title = $text['title'];
							$arr[$title] = $text['description'];
						}
						$page->versions[$key]->tklabels[] = $arr;
				}
			}
		}
		
		return $page;
		
	}
	
	private function _tklabels_by_ref(&$return, $row, $versions, $settings) {
		
		if (!$settings['tklabels'] || empty($settings['tklabeldata'])) return;
		$CI =& get_instance();
		foreach ($versions as $version) {
			if (isset($version->tklabels) && is_array($version->tklabels)) {
				foreach ($version->tklabels as $tklabel) {
					$uri = $CI->versions->tk_hasLabel($tklabel);
					$tklabel['type'] = $CI->versions->tk_type();
					$tklabel['url'] = $tklabel['image'];
					foreach ($tklabel['text'] as $text) {
						if ($text['locale'] != $tklabel['defaultlocale']) continue;
						$title = $text['title'];
						$tklabel[$title] = $text['description'];
					}
					if (!$this->_uri_exists($return, $uri)) $return[$uri] = $CI->versions->rdf((object) $tklabel);
				}
			}
		}
		
	}

	private function _pagination($page, $settings) {

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
		// Composite, Media only win if there are no other types
		$type = 'composite';
		if ('media'==$page->type) $type='media';
		// Path always wins
		if (!empty($page->versions[$page->version_index]->path_of)) {
			$type = 'path';
		// Other types (note precedence order)
		} else {
			if (!empty($page->versions[$page->version_index]->tag_of)) $type = 'tag';
			if (!empty($page->versions[$page->version_index]->annotation_of)) $type = 'annotation';
			if (!empty($page->versions[$page->version_index]->reply_of)) $type = 'reply';
		}
		$scalar_ns = $namespaces['scalar'];
		$page->primary_role = $scalar_ns.ucwords($type);

		return $page;

	}

	private function _pagination_by_ref(&$return, $settings) {

		if (empty($return)) return;

		$CI =& get_instance();
		if ('object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if (!empty($settings['sq'])) {
			$settings['total'] = 0;
			foreach ($return as $uri => $values) {
				if (
				    !$this->_object_exists($values, 'rdf:type', $CI->pages->rdf_type('composite')) &&
					!$this->_object_exists($values, 'rdf:type', $CI->pages->rdf_type('media'))
				) continue;
				$settings['total']++;
			}
		}
		foreach ($return as $uri => $values) {
			if (
				!$this->_object_exists($values, 'rdf:type', $CI->pages->rdf_type('composite')) &&
				!$this->_object_exists($values, 'rdf:type', $CI->pages->rdf_type('media'))
			) continue;
			$return[$uri] = array_merge($values, $CI->pages->rdf(array('citation'=>'method='.$settings['method'].';methodNumNodes='.$settings['total'].';'), $settings['base_uri']));
		}

	}

	private function _relationships($row, $settings) {

		$CI =& get_instance();
		$models = $CI->config->item('rel');
		$ref_models = $CI->config->item('ref');
		if ('array'!=gettype($models)) throw new Exception('Could not locate relationship configuration');
		if (!empty($ref_models)) $models = array_merge($models, $ref_models);
		
		for ($j = 0; $j < count($row->versions); $j++) {
			$version_id = $row->versions[$j]->version_id;
			foreach ($models as $model) {
				if (!empty($settings['restrict']) && !in_array($model, $settings['restrict'])) continue;
				$model_s = singular($model);
				if ('object'!=@gettype($CI->$model)) $CI->load->model($model_s.'_model',$model);
				if ($settings['rel'] == self::REL_PARENTS_ONLY || $settings['rel'] == self::REL_ALL) {
					$name = 'has_'.$model;
					$row->versions[$j]->$name = array();
					$nodes = $CI->$model->get_parents($version_id, null, null, true, $settings['use_versions']);
					foreach ($nodes as $node) {
						array_push($row->versions[$j]->$name, $this->_annotation_parent($node, $settings));
					}
				}
				if ($settings['rel'] == self::REL_CHILDREN_ONLY || $settings['rel'] == self::REL_ALL) {
					$name = $model_s.'_of';
					$row->versions[$j]->$name = array();
					$nodes = $CI->$model->get_children($version_id, null, null, true, $settings['use_versions']);
					foreach ($nodes as $node) {
						array_push($row->versions[$j]->$name, $this->_annotation_child($node, $settings));
					}
				}
			}
		}

		return $row;

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
				if (!empty($settings['restrict']) && !in_array($model, $settings['restrict'])) continue;
				$model_s = singular($model);
				if ('object'!=gettype($CI->$model)) $CI->load->model($model_s.'_model',$model);
				if (empty($settings['rel']) || $settings['rel'] == self::REL_PARENTS_ONLY) {
					$nodes = $CI->$model->get_parents($row->version_id, null, null, true, $settings['use_versions']);
					foreach ($nodes as $node) {
						$this->_annotation_parent_by_ref($return, $node, $uri, $settings);
					}
				}
				if (empty($settings['rel']) || $settings['rel'] == self::REL_CHILDREN_ONLY) {
					$nodes = $CI->$model->get_children($row->version_id, null, null, true, $settings['use_versions']);
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
		if (isset($content->versions[$content->version_index]->sort_number)) unset($content->versions[$content->version_index]->sort_number);  // Avoid annotation_append collision
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

		// TODO: if in a edition this is outputting relational nodes for items that aren't displayed
		$annotation->has_body = $settings['base_uri'].$annotation->parent_content_slug.'.'.$annotation->parent_version_num;
		$annotation->has_target = $target_uri.$this->annotation_append($annotation);
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
		if (isset($content->versions[$content->version_index]->sort_number)) unset($content->versions[$content->version_index]->sort_number);  // Avoid annotation_append collision
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
		
		// TODO: if in a edition this is outputting relational nodes for items that aren't displayed
		$annotation->has_body = $body_uri;
		$target_base = $settings['base_uri'].$annotation->child_content_slug.'.'.$annotation->child_version_num;
		$annotation->has_target = $target_base.$this->annotation_append($annotation);
		$return[$annotation->urn] = $CI->annotations->rdf($annotation);
		// Target might not exist in the graph
		// Body should already exist because it's what pulled its annotations
		if (!$this->_uri_exists($return, $target_base)) {
			$settings['content'] = $CI->pages->get_by_slug($settings['book']->book_id, $annotation->child_content_slug);
			++$settings['num_recurses'];
			$this->_index_by_ref($return, $settings);
		}

	}

	private function _annotation_category_by_ref(&$return, $version, $settings) {  // E.g., "review", "commentary"

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
	
	private function _safely_write_rdf(&$return, $uri, $rdf) {
		
		if (!$this->_uri_exists($return, $uri)) $return[$uri] = $rdf;
		$return[$uri] = array_merge($return[$uri], $rdf);
		
	}

	private function _object_exists($s, $p, $o) {

		if (!array_key_exists($p,$s)) return false;
		foreach ($s[$p] as $rdf_type) {
			if ($rdf_type['value'] == $o) return true;
		}
		return false;

	}
	
	private function _use_version($use_versions, $content_id) {
		
		if (!is_array($use_versions)) return null;
		if (!isset($use_versions[$content_id])) return false;
		return (int) $use_versions[$content_id];
		
	}

}

/* End of file RDF_Object.php */
