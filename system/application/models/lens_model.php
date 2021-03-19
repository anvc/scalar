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
 * @projectDescription  Model for grouped database table
 * @author              Craig Dietrich
 * @version             1.0
 */

class Lens_model extends MY_Model {

	private $urn_template = 'urn:scalar:lens:$1';

    public function __construct() {

        parent::__construct();

    }

	public function urn($pk_1=0) {

		$return = str_replace('$1', $pk_1, $this->urn_template);
		return $return;

	}
	
	public function decode($arr=array(), $book=null) {
		
		$CI =& get_instance();
		if (!isset($CI->pages) || 'object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if (!isset($CI->versions) || 'object'!=gettype($CI->versions)) $CI->load->model('version_model','versions');
		$return = array();
		
		if (empty($book) || !isset($book->book_id)) return $return;
		$version_urn = $arr['urn'];
		$version_urn_arr = explode(':', $version_urn);
		$version_id = (int) array_pop($version_urn_arr);

		$return['scalar:urn'] = $this->versions->urn($version_id);
		$return['scalar:child_urn'] = null;
		$return['scalar:child_rel'] = 'grouped';
		if (!empty($arr) && is_array($arr)) $return['scalar:contents'] = $arr; 
		
		return $return;
		
	}

	public function get_all($book_id=null, $type=null, $category=null, $is_live=true, $sq='', $id_array=null) {

		return parent::get_all($this->lenses_table, $book_id, $type, $category, $is_live, $sq, $id_array);
		
    }

    public function get_children($parent_version_id=0) {
    	
    	$this->db->select($this->versions_table.'.*');
    	$this->db->select($this->pages_table.'.slug');
    	$this->db->from($this->versions_table);
    	$this->db->where('version_id', $parent_version_id);
    	$this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
    	$query = $this->db->get();
    	$version = $query->result();
    	
    	$this->db->select('*');
    	$this->db->from($this->lenses_table);
    	$this->db->where('parent_version_id', $parent_version_id);
    	$query = $this->db->get();
    	$result = $query->result();
    	if (!count($result)) return false;
    	for ($j = 0; $j < count($result); $j++) {
    		$result[$j]->contents = json_decode($result[$j]->contents);
    		$result[$j]->contents->urn = $this->urn($result[$j]->parent_version_id);
    		$result[$j]->contents->title = $version[0]->title;
    		$result[$j]->contents->slug = $version[0]->slug;
    		$result[$j]->contents = json_encode($result[$j]->contents);
    	}
    	return $result[0]->contents;

	}
	
	public function get_all_with_lens($book_id=null, $type=null, $category=null, $is_live=true, $sq='', $id_array=null) {
		
		$result = $this->get_all($book_id, $type, $category, $is_live, $sq, $id_array);
		$return = array();
		foreach ($result as $row) {
			$row->lens = $this->get_children($row->recent_version_id);
			$return[] = $row;
		}
		return $return;
		
	}
	
	public function set_submitted_to($version_id, $bool=false, $comment='') {
		
		$contents = $this->get_children($version_id);
		if (empty($contents)) throw new Exception('Could not find Lens for the version');
		$contents = json_decode($contents, true);
		$contents['submitted'] = true;
		$contents['submitted_comment'] = $comment;
		$this->save_children($version_id, array($contents));
		return true;
		
	}
	
	public function get_nodes_from_json($book_id=0, $json='', $prefix='') {
		
		$CI =& get_instance();
		if (!isset($CI->pages) || 'object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if (!isset($CI->versions) || 'object'!=gettype($CI->versions)) $CI->load->model('version_model','versions');
		if (empty($book_id)) throw new Exception("Invalud Book ID");
		$how_to_combine = $this->get_operation_from_visualization($json['visualization']);
		$pages_load_metadata = false;
		if (isset($json['visualization']['type']) && $json['visualization']['type'] == 'map') $pages_load_metadata = true;
		if (isset($json['visualization']['type']) && $json['visualization']['type'] == 'list') $pages_load_metadata = true;
		$contents = array();
		
		if (isset($json['frozen']) && $json['frozen']) {
			return $this->frozen_items($book_id, $json, $prefix, $pages_load_metadata);
		}

		foreach ($json['components'] as $component) {
			$content = array();
			$has_used_filter = false;
			// Modifiers that get content
			if (isset($component['modifiers'])) {
				foreach ($component['modifiers'] as $modifier) {
					switch ($modifier['type']) {
						case "filter":
							switch ($modifier['subtype']) {
								case "metadata":
								case "content":
									$has_used_filter = true;
									$field = trim($modifier['metadata-field']);
									$value = trim($modifier['content']);
									$operator = (isset($modifier['operator']) && 'exclusive'==$modifier['operator']) ? 'exclusive' : 'inclusive';
									switch ($operator) {
										case 'exclusive':
											$content = (!empty($content)) ? $content : $this->get_pages_from_content_selector($component['content-selector'], $book_id);
											$to_subtract = $CI->versions->get_by_predicate($book_id, $field, false, null, $value);
											$content = $this->subtract_content($content, $to_subtract);
											$content = $this->do_versions($content, $pages_load_metadata);
											break;
										case 'inclusive':
											$content_with_predicate = $CI->versions->get_by_predicate($book_id, $field, false, null, $value);
											if (!empty($content)) {
												$content = $this->combine_items($content, $content_with_predicate, 'and');
											} else {
												$content = $this->filter_by_content_selector($content_with_predicate, $component);
											}
											break;
									}
									break;
								case "distance":
									$has_used_filter = true;
									$from_arr = $this->get_pages_from_content_selector($component['content-selector'], $book_id);
									$distance = $modifier['quantity'];
									$units = $modifier['units'];
									$items = $CI->versions->get_by_predicate($book_id, array('dcterms:spatial','dcterms:coverage'));
									foreach ($from_arr as $from) {
										$content = array();
										$item = $this->filter_by_slug($items, $from->slug);
										if (!empty($item)) {
											$latlng = $this->get_latlng_from_item($item[0]);
											$content = $this->filter_by_location($items, $latlng, $distance, $units);
										}
									}
									break;
								case "relationship":
									$has_used_filter = true;
									$from_arr = (!empty($content)) ? $content : $this->get_pages_from_content_selector($component['content-selector'], $book_id);
									foreach ($from_arr as $page) {
										$version = $CI->versions->get_single($page->content_id, $page->recent_version_id, null, false);
										if (empty($version)) continue;
										$page->versions = array($version);
										$content[] = $page;
										$types = $modifier['content-types'];
										if (isset($types[0]) && 'all-types' == $types[0]) {
											$types = array_merge($CI->config->item('rel'), $CI->config->item('ref'));
											for ($j = 0; $j < count($types); $j++) {
												$type = rtrim($types[$j], "s");
												if ($type == 'replie') $type = 'reply';
												$types[$j] = $type;
											}
										}
										$parent_or_child = $modifier['relationship'];
										foreach ($types as $type) {
											$type_p = $type.'s';
											if ($type_p== 'replys') $type_p= 'replies';
											if (!isset($CI->$type_p) || 'object'!=gettype($CI->$type_p)) $CI->load->model($type.'_model',$type_p);
											if ('any-relationship' == $parent_or_child || 'child' == $parent_or_child) {
												$items = $CI->$type_p->get_children($version->version_id, '', '', true, null);
												foreach ($items as $item) {
													$page = $CI->pages->get($item->child_content_id);
													$page->versions = array();
													$page->versions[] = $CI->versions->get_single($page->content_id, $page->recent_version_id, null, (($pages_load_metadata)?true:false));
													$content[] = $page;
												}
											}
											if ('any-relationship' == $parent_or_child || 'parent' == $parent_or_child) {
												$items = $CI->$type_p->get_parents($version->version_id, '', '', true, null);
												foreach ($items as $item) {
													$page = $CI->pages->get($item->parent_content_id);
													$page->versions = array();
													$page->versions[] = $CI->versions->get_single($page->content_id, $page->recent_version_id, null, (($pages_load_metadata)?true:false));
													$content[] = $page;
												}
											}
										}
									}
									break;
								case "content-type":
									$has_used_filter = true;
									$operator = (isset($modifier['operator']) && 'exclusive'==$modifier['operator']) ? 'exclusive' : 'inclusive';
									$types = (isset($modifier['content-types'])) ? $modifier['content-types'] : array();
									if (!is_array($types)) $types = array($types);
									if (isset($modifier['content-type'])) $types[] = $modifier['content-type'];
									switch ($operator) {
										case 'exclusive':
											$content = (!empty($content)) ? $content : $this->get_pages_from_content_selector($component['content-selector'], $book_id);
											foreach ($types as $type) {
												$to_subtract = $this->get_pages_of_type($type, $book_id);
												$content = $this->subtract_content($content, $to_subtract);
											}
											$content = $this->do_versions($content, $pages_load_metadata);
											break;
										case 'inclusive':
											foreach ($types as $type) {
												$content = $this->get_pages_of_type($type, $book_id);
												$content = $this->do_versions($content, $pages_load_metadata);
												$content = $this->filter_by_content_selector($content, $component);
											}
											break;
										}
									break;
							}
							break;
					}
				}
			}
			// If there were no modifiers that get content, revert to the content selector
			if (!$has_used_filter && isset($component['content-selector'])) {
				$content = $this->get_pages_from_content_selector($component['content-selector'], $book_id);
				$content = $this->do_versions($content, $pages_load_metadata);
			}
			// Combine content that has been gathered
			$contents[] = $content;
		}
		
		$contents = $this->combine_contents($contents, $how_to_combine);
		
		// Filters
		foreach ($json['components'] as $component) {
			if (isset($component['modifiers'])) {
				foreach ($component['modifiers'] as $modifier) {
					if (isset($modifier['subtype'])) {
						switch ($modifier['subtype']) {
							case "quantity":
								$quantity = (int) $modifier['quantity'];
								$contents = array_slice($contents, 0, $quantity);
								break;
							case "visit-date":
								if (isset($json['history'])) {
									for ($j = count($contents)-1; $j >= 0; $j--) {
										if (!array_key_exists($contents[$j]->content_id, $json['history'])) unset($contents[$j]);
									}
								}
								break;
							case "content-types":
								// TODO: is this needed? content-types are filtered above
								break;
						}
					}
				}
			}
		}
		
		// Sorts
		$sort_by_creation_date = false;
		if (isset($json['sorts'])) {
			foreach ($json['sorts'] as $sort) {
				switch ($sort['sort-type']) {
					case "alphabetical":
						$field = $sort['metadata-field'];
						$direction = ('descending' == $sort['sort-order']) ? 'desc' : 'asc';
						$contents = $this->sort_by_predicate($contents, $field, $direction);
						break;
					case "creation-date":
						$sort_by_creation_date = true;
						$direction = ('descending' == $sort['sort-order']) ? 'desc' : 'asc';
						$contents = $this->sort_by_predicate($contents, 'dcterms:created', $direction, true);
						break;
					case "edit-date":
						$direction = ('descending' == $sort['sort-order']) ? 'desc' : 'asc';
						$contents = $this->sort_by_predicate($contents, 'dcterms:created', $direction);
						break;
					case "distance":
						$direction = ('descending' == $sort['sort-order']) ? 'desc' : 'asc';
						$arr = explode(',',$sort['content']);
						$loc_lat = trim($arr[0]);
						$loc_lng = trim($arr[1]);
						for ($j = 0; $j < count($contents); $j++) {
							$contents[$j]->distance = 0;
							$latlng = $this->get_latlng_from_item($contents[$j]);
							if (empty($latlng)) continue;
							$arr = explode(',',$latlng);
							$dest_lat = trim($arr[0]);
							$dest_lng = trim($arr[1]);
							$dest_distance_in_meters = latlng_distance($loc_lat, $loc_lng, $dest_lat, $dest_lng);
							$contents[$j]->distance = $dest_distance_in_meters;
						}
						usort($contents, "lens_distance_cmp_".$direction);
						break;
					case "type":
						$direction = (isset($sort['sort-order']) && 'descending' == $sort['sort-order']) ? 'desc' : 'asc';
						for ($j = 0; $j < count($contents); $j++) {
							$contents[$j]->relation_type = $this->get_relation_type($contents[$j]);
						}
						usort($contents, "lens_relation_type_cmp_".$direction);
						break;
						break;
					case "relationship-count":
						$direction = ('descending' == $sort['sort-order']) ? 'desc' : 'asc';
						for ($j = 0; $j < count($contents); $j++) {
							$contents[$j]->num_relations = $this->get_num_relations($contents[$j]);
						}
						usort($contents, "lens_relationship_count_cmp_".$direction);
						break;
					case "match-count":
						$direction = ('descending' == $sort['sort-order']) ? 'desc' : 'asc';
						$field = $sort['metadata-field'];
						$match = $sort['content'];
						for ($j = 0; $j < count($contents); $j++) {
							$contents[$j]->string_matches = $this->get_num_string_matches($contents[$j], $field, $match);
						}
						usort($contents, "lens_string_matches_cmp_".$direction);
						break;
					case "visit-date":
						$direction = ('descending' == $sort['sort-order']) ? 'desc' : 'asc';
						for ($j = 0; $j < count($contents); $j++) {
							$content_id = $contents[$j]->content_id;
							if (isset($json['history']) && isset($json['history'][$content_id])) {
								$contents[$j]->visit_date = (int) $json['history'][$content_id];
							} else {
								$contents[$j]->visit_date = 0;
							}
						}
						usort($contents, "lens_visit_date_cmp_".$direction);
						break;
				}
			}
		}

		$return = array();
		if (empty($contents)) return $return;
		foreach ($contents as $content_id => $page) {
			$uri = $prefix.'/'.$page->slug;
			$version_uri = $uri.'.'.$page->versions[0]->version_num;
			$page->has_version = $version_uri;
			$page->versions[0]->version_of = $uri;
			$return[$uri] = $CI->pages->rdf($page);
			$return[$version_uri] = $CI->versions->rdf($page->versions[0]);
			// Sort-specific fields
			if (isset($page->relation_type)) $return[$uri]['relation_type'] = $page->relation_type;
			if (isset($page->num_relations)) $return[$uri]['num_relations'] = $page->num_relations;
			if (isset($page->string_matches)) $return[$uri]['string_matches'] = $page->string_matches;
			if (isset($page->visit_date)) $return[$uri]['visit_date'] = $page->visit_date;
			if ($sort_by_creation_date) $return[$uri]['created'] = $page->created;
		}
		
		$return = $this->rdf_ns_to_uri($return);
		$return = $this->add_relationships($return, $book_id);

		return $return;
		
	}
	
	public function frozen_items($book_id=0, $json='', $prefix='', $pages_load_metadata=false) {
		
		$CI =& get_instance();
		$contents = array();
		if (!isset($json['frozen-items'])) return $contents;
		foreach ($json['frozen-items'] as $slug) {
			$page = $CI->pages->get_by_slug($book_id, $slug, $is_live=true);
			if (!empty($page)) $contents[] = $page;
		}
		$contents = $this->do_versions($contents, $pages_load_metadata);

		$return = array();
		if (empty($contents)) return $return;
		foreach ($contents as $content_id => $page) {
			$uri = $prefix.'/'.$page->slug;
			$version_uri = $uri.'.'.$page->versions[0]->version_num;
			$page->has_version = $version_uri;
			$page->versions[0]->version_of = $uri;
			$return[$uri] = $CI->pages->rdf($page);
			$return[$version_uri] = $CI->versions->rdf($page->versions[0]);
		}
		
		$return = $this->rdf_ns_to_uri($return);
		$return = $this->add_relationships($return, $book_id);

		return $return;
		
	}

    public function save_children($parent_version_id=0, $array=array()) {

    	// Insert new relationships
    	foreach ($array as $contents) {
    		
    		if (is_string($contents)) $contents = json_decode($contents, true);
    		$contents['urn'] = $this->urn($parent_version_id);
    		$contents = json_encode($contents);
    		
    		$this->db->select('*');
    		$this->db->from($this->lenses_table);
    		$this->db->where('parent_version_id', $parent_version_id);
    		$query = $this->db->get();
    		$result = $query->result();
    		if (count($result)) {  // Update
    			$data = array(
    					'contents' => $contents,
    			);
    			$this->db->where('parent_version_id', $parent_version_id);
    			$this->db->update($this->lenses_table, $data);
    		} else {  // Add
				$data = array(
	 				'parent_version_id' => $parent_version_id,
	 				'contents' => $contents
	            );
				$this->db->insert($this->lenses_table, $data);
    		}

    	}
    	return true;

    }
    
    public function do_versions($items, $pages_load_metadata=false) {
    	
    	$CI =& get_instance();
    	foreach ($items as $key => $row) {
    		if (isset($row->versions)) continue;
    		$items[$key]->versions = array();
    		$items[$key]->versions[] = $CI->versions->get_single($row->content_id, $row->recent_version_id, null, (($pages_load_metadata)?true:false));
    	}
    	return $items;
    	
    }
    
    public function filter_by_location($items, $location, $distance, $units) {
    	
    	$arr = explode(',',$location);
    	$loc_lat = trim($arr[0]);
    	$loc_lng = trim($arr[1]);
    	$return = array();
    	
    	$distance_in_meters = $this->get_distance_in_meters($distance, $units);

    	foreach ($items as $item) {
    		$latlng = $this->get_latlng_from_item($item);
    		if (empty($latlng)) continue;
    		$arr = explode(',',$latlng);
    		$dest_lat = trim($arr[0]);
    		$dest_lng = trim($arr[1]);
    		$dest_distance_in_meters = latlng_distance($loc_lat, $loc_lng, $dest_lat, $dest_lng);
    		if ($dest_distance_in_meters > $distance_in_meters) continue;
    		$return[] = $item;
    	}
    	
    	return $return;
    	
    }
    
    public function get_num_relations($item, $book_id=0) {
    	
    	$CI =& get_instance();
    	$num = 0;
    	
    	// get parent version ID
    	$version = $this->versions->get_single($item->content_id, null, '', false);
    	$version_id = $version->version_id;
    	
    	// get references
    	$types = $CI->config->item('ref');
    	foreach ($types as $type_p) {
    		$type = rtrim($type_p, "s");
    		if (!isset($CI->$type_p) || 'object'!=gettype($CI->$type_p)) $CI->load->model($type.'_model',$type_p);
    		$items = $CI->$type_p->get_children($version_id, '', '', true, null);
			$num = $num + count($items);
			$items = $CI->$type_p->get_parents($version_id, '', '', true, null);
			$num = $num + count($items);
   		}
   		
    	// get parents
    	$types = $CI->config->item('rel');
    	foreach ($types as $type_p) {
    		$type = rtrim($type_p, "s");
    		if ($type == 'replie') $type = 'reply';
    		if (!isset($CI->$type_p) || 'object'!=gettype($CI->$type_p)) $CI->load->model($type.'_model',$type_p);
    		$items = $CI->$type_p->get_parents($version_id, '', '', true, null);
    		$num = $num + count($items);
    	}
    	
    	// get children
    	$types = $CI->config->item('rel');
    	foreach ($types as $type_p) {
    		$type = rtrim($type_p, "s");
    		if ($type == 'replie') $type = 'reply';
    		if (!isset($CI->$type_p) || 'object'!=gettype($CI->$type_p)) $CI->load->model($type.'_model',$type_p);
    		$items = $CI->$type_p->get_children($version_id, '', '', true, null);
    		$num = $num + count($items);
    	}
    	
    	return $num;
    	
    }
    
    public function get_relation_type($item) {
    	
    	$CI =& get_instance();
		$the_type = 'page';
		if ($item->type == 'media') $the_type= 'media';
    	
    	// get parent version ID
    	$version = $this->versions->get_single($item->content_id, null, '', false);
    	$version_id = $version->version_id;
    	
    	// Get types
    	$types = array('tags', 'annotations', 'replies');
    	foreach ($types as $type_p) {
    		$type = rtrim($type_p, "s");
    		if ($type == 'replie') $type = 'reply';
    		if (!isset($CI->$type_p) || 'object'!=gettype($CI->$type_p)) $CI->load->model($type.'_model',$type_p);
    		$items = $CI->$type_p->get_children($version_id, '', '', true, null);
    		if (count($items)) $the_type= $type;
    	}
    	
    	// Path always wins
    	$types = array('paths');
    	foreach ($types as $type_p) {
    		$type = rtrim($type_p, "s");
    		if ($type == 'replie') $type = 'reply';
    		if (!isset($CI->$type_p) || 'object'!=gettype($CI->$type_p)) $CI->load->model($type.'_model',$type_p);
    		$items = $CI->$type_p->get_parents($version_id, '', '', true, null);
    		if (count($items)) $the_type= $type;
    	}
    	
		// Ignore references
    	
    	return $the_type;
    	
    }
    
    public function get_distance_in_meters($distance, $units) {
    	
    	$distance_in_meters = 0;
    	switch ($units) {
    		case 'meters':
    			$distance_in_meters = $distance;
    			break;
    		case 'kilometers':
    			$distance_in_meters = $distance * 1000;
    			break;
    		case 'miles':
    			$distance_in_meters = $distance * 1609.344;
    			break;
    	}
    	
    	return $distance_in_meters;
    	
    }
    
    public function filter_by_slug($items, $slug) {
    	
    	$return = array();
    	foreach ($items as $item) {
    		if ($item->slug != $slug) continue;
    		$return[] = $item;
    		break;
    	}
    	return $return;
    	
    }
    
    public function get_operation_from_visualization($json) {
    	
    	$return = 'or';
    	if (isset($json['options']) && isset($json['options']['operation'])) $return = $json['options']['operation'];
    	return $return;
    	
    }
    
    public function combine_items($contents, $content, $operator) {
    	
    	switch ($operator) {
    		case "and":
    			$keys_to_remove = array();
    			foreach ($contents as $key => $row) {
    				$exists = false;
    				foreach ($content as $content_key => $content_row) {
    					if ($content_row->content_id == $row->content_id) {
    						$exists = true;
    						break;
    					}
    				}
    				if (!$exists) {
    					$keys_to_remove[] = $key;
    				}
    			}
    			foreach ($keys_to_remove as $key) {
    				unset($contents[$key]);
    			}
    			return $contents;
    		default:  // or
    			return array_merge($contents, $content);
    	}
    	
    }
    
    public function combine_contents($contents, $operator) {

    	$return = array();
    	switch ($operator) {
    		case "and":
    			if (!isset($contents[0])) return $return;
    			$return = $contents[0];
				for ($j = 1; $j < count($contents); $j++) {
					$return = $this->combine_items($return, $contents[$j], 'and');
				}
				break;
    		default:  // or
    			foreach ($contents as $items) {
    				$return = array_merge($return, $items);
    			}
    	}
    	return $return;
    	
    }
    
    public function get_latlng_from_item($item) {
    	
    	$latlng = false;
    	if (!isset($item->versions[0]->rdf)) return $latlng;
    	$rdf = $item->versions[0]->rdf;
    	$latlng = '';
    	$spatial = '';
    	$coverage = '';
    	if (isset($rdf['http://purl.org/dc/terms/spatial'])) {
    		$spatial = $rdf['http://purl.org/dc/terms/spatial'][0]['value'];
    	}
    	if (isset($rdf['http://purl.org/dc/terms/coverage'])) {
    		$coverage = $rdf['http://purl.org/dc/terms/coverage'][0]['value'];
    	}
    	if (preg_match('/^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/', $spatial)) {
    		$latlng = $spatial;
    	} elseif (preg_match('/^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/', $coverage)) {
    		$latlng = $coverage;
    	}
    	return $latlng;
    	
    }
    
    public function get_pages_of_type($content_type, $book_id=0) {
    	
    	$type = $category = null;
    	switch ($content_type) {
    		case 'all-content':
    		case 'content':
    			$model = 'pages';
    			break;
    		case 'page':
    		case 'composite':
    			$model = 'pages';
    			$type = 'composite';
    			break;
    		case 'file':
    		case 'media':
    			$model = 'pages';
    			$type = 'media';
    			break;
    		case 'review':
    		case 'commentary':
    		case 'term':
    			$model = 'pages';
    			$category = $class;
    			break;
    		case 'annotation':
    		case 'reply':
    		case 'tag':
    		case 'path':
    		case 'reference':
    			$this->load->helper('inflector');
    			$this->load->model($content_type.'_model', plural($content_type));
    			$model = plural($content_type);
    			break;
    	}
    	$content = $this->$model->get_all($this->data['book']->book_id, $type, $category, true, null);
    	return $content;
    	
    }
    
    public function get_pages_from_content_selector($json, $book_id=0) {

    	if (isset($json['items']) && !empty($json['items'])) {
    		$CI =& get_instance();
    		$content = array();
    		foreach ($json['items'] as $item) {
    			$row = 	$CI->pages->get_by_slug($book_id, $item, true);
    			if (!empty($row)) $content[] = $row;
    		}
    		return $content;
    	
    	} elseif (isset($json['type']) && 'items-by-distance' == $json['type']) {
    		$CI =& get_instance();
    		$distance = $json['quantity'];
    		$units = $json['units'];
    		$latlng = $json['coordinates'];
    		$items = $CI->versions->get_by_predicate($book_id, array('dcterms:spatial','dcterms:coverage'));
    		$content = $this->filter_by_location($items, $latlng, $distance, $units);
    		return $content;
    		
    	} elseif (isset($json['type']) && 'items-by-type' == $json['type'] && isset($json['content-type']) && 'table-of-contents' == $json['content-type']) {
    		$CI =& get_instance();
    		$content = $CI->books->get_book_versions($book_id, true);
    		return $content;
    		
    	// items-by-type | content-type = current
    		
    	} elseif (isset($json['type']) && 'items-by-type' == $json['type']) {
    		$content_type = $json['content-type'];
    		$type = $category = null;
    		switch ($content_type) {
    			case 'all-content':
    			case 'content':
    				$model = 'pages';
    				break;
    			case 'page':
    			case 'composite':
    				$model = 'pages';
    				$type = 'composite';
    				break;
    			case 'file':
    			case 'media':
    				$model = 'pages';
    				$type = 'media';
    				break;
    			case 'review':
    			case 'commentary':
    			case 'term':
    				$model = 'pages';
    				$category = $class;
    				break;
    			case 'annotation':
    			case 'reply':
    			case 'tag':
    			case 'path':
    			case 'reference':
    				$this->load->helper('inflector');
    				$this->load->model($content_type.'_model', plural($content_type));
    				$model = plural($content_type);
    				break;
    		}
    		$content = $this->$model->get_all($this->data['book']->book_id, $type, $category, true, null);
    		return $content;
    		
    	}
    	
    	return array();
    	
    }
    
    public function filter_by_content_selector($content, $component) {
    	
    	if (isset($component['content-selector']) && empty($component['content-selector']['items'])) {
    		$content_type = $component['content-selector']['content-type'];
    		if ('page' == $content_type) $content_type = 'composite';
    		if ('all-content' == $content_type) {
	    		// Nothing to filter
    		} elseif ('composite' == $content_type || 'media' == $content_type) {
	    		foreach ($content as $key => $row) {
	    			if ($row->type != $content_type) unset($content[$key]);
	    		}
    		} elseif ('annotation'==$content_type||'reply'==$content_type||'tag'==$content_type||'path'==$content_type||'reference'==$content_type) {
    			$this->load->helper('inflector');
    			$model = plural($content_type);
    			if (!isset($this->$model) || empty($this->$model)) $this->load->model($content_type.'_model', $model);
    			foreach ($content as $key => $row) {
    				$version_id = $row->versions[0]->version_id;
	    			$relational_content = $this->$model->get_children($version_id, '', '', true);
	    			if (empty($relational_content)) unset($content[$key]);
    			}
    		}
    	} elseif (isset($component['content-selector'])) {
    		$items = $component['content-selector']['items'];
    		foreach ($content as $key => $row) {
    			if (!in_array($row->slug, $items)) unset($content[$key]);
    		}
    	}

    	return $content;
    	
    }
    
    public function subtract_content($all, $subtract) {
    	
    	foreach ($subtract as $subtract_row) {
    		foreach ($all as $all_key => $all_row) {
    			if ($all_row->content_id == $subtract_row->content_id) {
    				unset($all[$all_key]);
    				break;
    			}
    		}
    	}
    	return $all;
    	
    }
    
    public function sort_by_predicate($contents, $field, $dir='asc', $field_is_in_content=false) {
    	
    	// Check "built-in" Version fields
    	$rdf_fields = $this->config->item('rdf_fields');
    	if (in_array($field, $rdf_fields)) {
    		$name = array_search($field, $rdf_fields);
    		if ($field_is_in_content) {
    			usort($contents, array(new LensContentFieldCmpClosure($name, $dir), "call"));
    		} else {
    			usort($contents, array(new LensVersionFieldCmpClosure($name, $dir), "call"));
    		}
    		return $contents;
    		
    	// Check RDF fields
    	} else {
    		$ns = $this->config->item('namespaces');
    		$arr = explode(':', $field);
    		$prefix = $arr[0];
    		$name =@ $arr[1];
    		$base = (array_key_exists($prefix, $ns)) ? $ns[$prefix] : '';
    		$uri = $base.$name;
    		usort($contents, array(new LensRDFCmpClosure($uri, $dir), "call"));
    		return $contents;
    	}
    	
    }
    
    public function get_num_string_matches($item, $field='', $match='') {
    	
    	// Check "built-in" fields
    	$rdf_fields = $this->config->item('rdf_fields');
    	if (in_array($field, $rdf_fields)) {
    		$name = array_search($field, $rdf_fields);
    		if (isset($item->{$name})) {
    			return substr_count(strtolower($item->{$name}), $match);
    		} elseif (isset($item->versions[0]->{$name})) {
    			return substr_count(strtolower($item->versions[0]->{$name}), $match);
    		}
    		
    		// Check RDF fields
    	} else {
    		$ns = $this->config->item('namespaces');
    		$arr = explode(':', $field);
    		$prefix = $arr[0];
    		$name =@ $arr[1];
    		$base = (array_key_exists($prefix, $ns)) ? $ns[$prefix] : '';
    		$uri = $base.$name;
    		if (isset($item->versions[0]->rdf[$uri]) && isset($item->versions[0]->rdf[$uri][0]['value'])) {
    			return substr_count(strtolower($item->versions[0]->rdf[$uri][0]['value']), $match);
    		}
    		return 0;
    	}
    	
    }
    
    public function rdf_ns_to_uri($return) {
    	
    	$ns = $this->config->item('namespaces');
    	foreach ($return as $uri => $row) {
    		foreach ($row as $key => $value) {
    			if (isNS($key, $ns)) {
    				$new_key = toURL($key, $ns);
    				$return[$uri][$new_key] = $value;
    				unset($return[$uri][$key]);
    			}
    		}
    	}
    	return $return;
    	
    }
    
    public function add_relationships($return, $book_id=0) {
    	
    	$CI =& get_instance();
    	$CI->load->library( 'RDF_Object', 'rdf_object' );
    	$num = 1;
    	$book = $CI->books->get($book_id, false);

    	foreach ($return as $uri => $fields) {
    		// get parent version ID
    		if (!isset($return[$uri]['http://purl.org/dc/terms/isVersionOf'])) continue;
    		$urn = $return[$uri]['http://scalar.usc.edu/2012/01/scalar-ns#urn'][0]['value'];
    		$arr = explode(':', $urn);
    		$version_id = (int) array_pop($arr);
    		// get references
    		$types = $CI->config->item('ref');
    		foreach ($types as $type_p) {
    			$type = rtrim($type_p, "s");
    			if (!isset($CI->$type_p) || 'object'!=gettype($CI->$type_p)) $CI->load->model($type.'_model',$type_p);
    			$items = $CI->$type_p->get_children($version_id, '', '', true, null);
    			foreach ($items as $item) {
    				if (!isset($return[$uri]['http://purl.org/dc/terms/references'])) $return[$uri]['http://purl.org/dc/terms/references'] = array();
    				$return[$uri]['http://purl.org/dc/terms/references'][] = array(
    					'type' => 'uri',
    					'value' => base_url().$book->slug.'/'.$item->child_content_slug
    				);
    			}
    		}
    		// get parents
    		$types = $CI->config->item('rel');
    		foreach ($types as $type_p) {
    			$type = rtrim($type_p, "s");
    			if ($type == 'replie') $type = 'reply';
    			if (!isset($CI->$type_p) || 'object'!=gettype($CI->$type_p)) $CI->load->model($type.'_model',$type_p);
    			$items = $CI->$type_p->get_parents($version_id, '', '', true, null);
    			foreach ($items as $item) {
    				$rel_uri = 'urn:scalar:'.$type.':'.$item->parent_version_id.':'.$item->child_version_id.':'.$num;
    				$append = $CI->rdf_object->annotation_append($item);
    				$num++;
    				$node = array(
    						'http://scalar.usc.edu/2012/01/scalar-ns#urn' => array(array(
    								'type' => 'uri',
    								'value' => $rel_uri
    						)),
    						'http://www.openannotation.org/ns/hasBody' => array(array(
    								'type' => 'uri',
    								'value' => base_url().$book->slug.'/'.$item->parent_content_slug.'.'.$item->parent_version_num
    						)),
    						'http://www.openannotation.org/ns/hasTarget' => array(array(
    								'type' => 'uri',
    								'value' => $uri.$append
    						)),
    						'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' => array(array(
    								'type' => 'uri',
    								'value' => 'http://www.openannotation.org/ns/Annotation'
    						)),
    				);
    				$return[$rel_uri] = $node;
    			}
    		}
    		// get children
    		$types = $CI->config->item('rel');
    		foreach ($types as $type_p) {
    			$type = rtrim($type_p, "s");
    			if ($type == 'replie') $type = 'reply';
    			if (!isset($CI->$type_p) || 'object'!=gettype($CI->$type_p)) $CI->load->model($type.'_model',$type_p);
    			$items = $CI->$type_p->get_children($version_id, '', '', true, null);
    			foreach ($items as $item) {
    				$rel_uri = 'urn:scalar:'.$type.':'.$item->parent_version_id.':'.$item->child_version_id.':'.$num;
    				$append = $CI->rdf_object->annotation_append($item);
    				$num++;
    				$node = array(
    					'http://scalar.usc.edu/2012/01/scalar-ns#urn' => array(array(
    						'type' => 'uri',
    						'value' => $rel_uri
    					)),
    					'http://www.openannotation.org/ns/hasBody' => array(array(
    						'type' => 'uri',
    						'value' => $uri
    					)),
    					'http://www.openannotation.org/ns/hasTarget' => array(array(
    						'type' => 'uri',
    						'value' => base_url().$book->slug.'/'.$item->child_content_slug.'.'.$item->child_version_num.$append
    					)),
    					'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' => array(array(
    						'type' => 'uri',
    						'value' => 'http://www.openannotation.org/ns/Annotation'
    					)),
    				);
    				$return[$rel_uri] = $node;
    			}
    		}
    	}

    	return $return;
    	
    }

}

/** 
 * Sorting functions
 */

function lens_visit_date_cmp_asc($a, $b) {
	if ($a->visit_date == $b->visit_date) return 0;
	return ($a->visit_date< $b->visit_date) ? -1 : 1;
}
function lens_visit_date_cmp_desc($a, $b) {
	if ($a->visit_date== $b->visit_date) return 0;
	return ($a->visit_date< $b->visit_date) ? 1 : -1;
}

function lens_distance_cmp_asc($a, $b) {
	if ($a->distance == $b->distance) return 0;
	return ($a->distance< $b->distance) ? -1 : 1;
}
function lens_distance_cmp_desc($a, $b) {
	if ($a->distance== $b->distance) return 0;
	return ($a->distance< $b->distance) ? 1 : -1;
}

function lens_relationship_count_cmp_asc($a, $b) {
	if ($a->num_relations== $b->num_relations) return 0;
	return ($a->num_relations< $b->num_relations) ? -1 : 1;
}
function lens_relationship_count_cmp_desc($a, $b) {
	if ($a->num_relations == $b->num_relations) return 0;
	return ($a->num_relations< $b->num_relations) ? 1 : -1;
}

function lens_relation_type_cmp_asc($a, $b) {
	if ($a->relation_type == $b->relation_type) return 0;
	return ($a->relation_type< $b->relation_type) ? -1 : 1;
}
function lens_relation_type_cmp_desc($a, $b) {
	if ($a->relation_type== $b->relation_type) return 0;
	return ($a->relation_type< $b->relation_type) ? 1 : -1;
}

function lens_string_matches_cmp_asc($a, $b) {
	if ($a->string_matches == $b->string_matches) return 0;
	return ($a->string_matches< $b->string_matches) ? -1 : 1;
}
function lens_string_matches_cmp_desc($a, $b) {
	if ($a->string_matches== $b->string_matches) return 0;
	return ($a->string_matches< $b->string_matches) ? 1 : -1;
}

/**
 * Sorting functions that can be passed variables
 * https://stackoverflow.com/questions/8230538/pass-extra-parameters-to-usort-callback
 */

function lens_content_field_cmp($a, $b, $meta, $dir='asc') {
	$name_a = $a->{$meta};
	$name_b = $b->{$meta};
	if ('desc' == $dir) {
		return strcasecmp($name_b, $name_a);
	} else {
		return strcasecmp($name_a, $name_b);
	}
}

class LensContentFieldCmpClosure {
	private $meta;
	private $dir;
	
	function __construct( $meta, $dir ) {
		$this->meta = $meta;
		$this->dir = $dir;
	}
	
	function call( $a, $b ) {
		return lens_content_field_cmp($a, $b, $this->meta, $this->dir);
	}
}

function lens_version_field_cmp($a, $b, $meta, $dir='asc') {
	$name_a = $a->versions[0]->{$meta};
	$name_b = $b->versions[0]->{$meta};
	if ('desc' == $dir) {
		return strcasecmp($name_b, $name_a);
	} else {
		return strcasecmp($name_a, $name_b);
	}
}

class LensVersionFieldCmpClosure {
	private $meta;
	private $dir;
	
	function __construct( $meta, $dir ) {
		$this->meta = $meta;
		$this->dir = $dir;
	}
	
	function call( $a, $b ) {
		return lens_version_field_cmp($a, $b, $this->meta, $this->dir);
	}
}

function lens_rdf_cmp($a, $b, $meta, $dir='asc') {
	$name_a = (isset($a->versions[0]->rdf[$meta])) ? $a->versions[0]->rdf[$meta][0]['value'] : '';
	$name_b = (isset($b->versions[0]->rdf[$meta])) ? $b->versions[0]->rdf[$meta][0]['value'] : '';
	if ('desc' == $dir) {
		return strcasecmp($name_b, $name_a);
	} else {
		return strcasecmp($name_a, $name_b);
	}
}

class LensRDFCmpClosure{
	private $meta;
	private $dir;
	
	function __construct( $meta, $dir ) {
		$this->meta = $meta;
		$this->dir = $dir;
	}
	
	function call( $a, $b ) {
		return lens_rdf_cmp($a, $b, $this->meta, $this->dir);
	}
}
?>