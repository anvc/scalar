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

		$this->db->select($this->lenses_table.'.*');
		$this->db->from($this->lenses_table);
		$this->db->join($this->versions_table, $this->versions_table.'.version_id='.$this->lenses_table.'.parent_version_id');
		$this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
		$this->db->where($this->pages_table.'.book_id', $book_id);
		if (!empty($is_live)) $this->db->where($this->pages_table.'.is_live', 1);
		$query = $this->db->get();
		$result = $query->result();
		$return = array();
		for ($j = 0; $j < count($result); $j++) {
			if (isset($result[$j]->contents) && !empty($result[$j]->contents)) {
				$result[$j]->contents = json_decode($result[$j]->contents);
				$result[$j]->contents->urn = $this->urn($result[$j]->parent_version_id);
				$return[] = $result[$j]->contents;
			}
		}
		return json_encode($return);
		
    }

    public function get_children($parent_version_id=0) {
    	
    	$this->db->select('*');
    	$this->db->from($this->lenses_table);
    	$this->db->where('parent_version_id', $parent_version_id);
    	$query = $this->db->get();
    	$result = $query->result();
    	if (!count($result)) return false;
    	for ($j = 0; $j < count($result); $j++) {
    		$result[$j]->contents = json_decode($result[$j]->contents);
    		$result[$j]->contents->urn = $this->urn($result[$j]->parent_version_id);
    		$result[$j]->contents = json_encode($result[$j]->contents);
    	}
    	return $result[0]->contents;

	}
	
	public function get_nodes_from_json($book_id=0, $json='', $prefix='') {
		
		$CI =& get_instance();
		if (!isset($CI->pages) || 'object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
		if (!isset($CI->versions) || 'object'!=gettype($CI->versions)) $CI->load->model('version_model','versions');
		if (empty($book_id)) throw new Exception("Invalud Book ID");
		$operator = 'and';  // TODO: from header
		$contents = array();
		$has_used_filter = false;

		foreach ($json['components'] as $component) {
			// Modifiers that get content
			if (isset($component['modifiers'])) {
				foreach ($component['modifiers'] as $modifier) {
					switch ($modifier['type']) {
						case "filter":
							switch ($modifier['subtype']) {
								case "metadata":
									$has_used_filter = true;
									$field = trim($modifier['metadata-field']);
									$value = trim($modifier['content']);
									$content = $CI->versions->get_by_predicate($book_id, $field, false, null, $value);
									$content = $this->filter_by_content_selector($content, $component);
									$contents = $this->combine_by_operator($contents, $content, $operator);
									break;
								case "distance":
									$has_used_filter = true;
									$from_arr = $this->get_pages_from_content_selector($component['content-selector'], $book_id);
									$distance_in_meters = $modifier['quantity'];
									$items = $CI->versions->get_by_predicate($book_id, array('dcterms:spatial','dcterms:coverage'));
									foreach ($from_arr as $from) {
										$content = array();
										$item = $this->filter_by_slug($items, $from->slug);
										if (!empty($item)) {
											$latlng = $this->get_latlng_from_item($item[0]);
											$content = $this->filter_by_location($items, $latlng, $distance_in_meters);
										}
										$contents = $this->combine_by_operator($contents, $content, $operator);
									}
									break;
								case "relationship":
									$has_used_filter = true;
									$from_arr = $this->get_pages_from_content_selector($component['content-selector'], $book_id);
									foreach ($from_arr as $page) {
										$version = $CI->versions->get_single($page->content_id, $page->recent_version_id, null, false);
										if (empty($version)) continue;
										$types = $modifier['content-types'];
										$parent_or_child = (isset($modifier['relationship']) && 'parent'==$modifier['relationship']) ? 'parent' : 'child';
										$content = array();
										foreach ($types as $type) {
											$type_p = $type.'s';
											if ($type_p== 'replys') $type_p= 'replies';
											if (!isset($CI->$type_p) || 'object'!=gettype($CI->$type_p)) $CI->load->model($type.'_model',$type_p);
											if ('child' == $parent_or_child) {
												$items = $CI->$type_p->get_children($version->version_id, '', '', true, null);
												foreach ($items as $item) {
													$page = $CI->pages->get($item->child_content_id);
													$page->versions = array();
													$page->versions[] = $CI->versions->get_single($page->content_id, $page->recent_version_id, null, true);
													$content[] = $page;
												}
											} else {
												$items = $CI->$type_p->get_parents($version->version_id, '', '', true, null);
												foreach ($items as $item) {
													$page = $CI->pages->get($item->parent_content_id);
													$page->versions = array();
													$page->versions[] = $CI->versions->get_single($page->content_id, $page->recent_version_id, null, true);
													$content[] = $page;
												}
											}
										}
										$contents = $this->combine_by_operator($contents, $content, $operator);
									}
									break;
								case "content-type":
									$has_used_filter = true;
									$operator = (isset($modifier['operator']) && 'exclusive'==$modifier['operator']) ? 'exclusive' : 'inclusive';
									$types = $modifier['content-types'];
									switch ($operator) {
										case 'exclusive':
											$all = $this->get_pages_of_type('all-content', $book_id);
											foreach ($types as $type) {  // Subtract content from each type
												$content = $this->get_pages_of_type($type, $book_id);
												$all = $this->subtract_content($all, $content);
											}
											foreach ($all as $key => $row) {
												$all[$key]->versions = array();
												$all[$key]->versions[] = $CI->versions->get_single($row->content_id, $row->recent_version_id, null, true);
											}
											$contents = $this->combine_by_operator($contents, $all, 'and');
											break;
										case 'inclusive':
											foreach ($types as $type) {
												$content = $this->get_pages_of_type($type, $book_id);
												foreach ($content as $key => $row) {
													$content[$key]->versions = array();
													$content[$key]->versions[] = $CI->versions->get_single($row->content_id, $row->recent_version_id, null, true);
												}
												$contents = $this->combine_by_operator($contents, $content, 'and');
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
				for ($j = 0; $j < count($content); $j++) {
					$content[$j]->versions = array();
					$content[$j]->versions[] = $CI->versions->get_single($content[$j]->content_id, $content[$j]->recent_version_id, null, true);
				}
				$contents = $this->combine_by_operator($contents, $content, $operator);
			}
			// Modifiers that sort
			if (isset($component['modifiers'])) {
				foreach ($component['modifiers'] as $modifier) {
					switch ($modifier['type']) {
						case "sort":
							$field = $modifier['metadata-field'];
							$direction = ('descending' == $modifier['sort-order']) ? 'desc' : 'asc';
							$contents = $this->sort_by_predicate($contents, $field, $direction);
							break;
					}
				}
			}
			// Modifiers that filter content
			if (isset($component['modifiers'])) {
				foreach ($component['modifiers'] as $modifier) {
					if (isset($modifier['subtype'])) {
						switch ($modifier['subtype']) {
							case "quantity":
								$quantity = (int) $modifier['quantity'];
								$contents = array_slice($contents, 0, $quantity);
								break;
						}
					}
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
    
    public function filter_by_location($items, $location, $distance_in_meters) {
    	
    	$arr = explode(',',$location);
    	$loc_lat = trim($arr[0]);
    	$loc_lng = trim($arr[1]);
    	$return = array();
    	
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
    
    public function filter_by_slug($items, $slug) {
    	
    	$return = array();
    	foreach ($items as $item) {
    		if ($item->slug != $slug) continue;
    		$return[] = $item;
    		break;
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
    
    public function combine_by_operator($contents, $content, $operator) {
    	
    	switch ($operator) {
    		case "and":  // exclusive
    			// TODO
    			return array_merge($contents, $content);
    		default:  // inclusive
    			return array_merge($contents, $content);
    	}
    	
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
    		if ('all-content' != $content_type) {
	    		if ('page' == $content_type) $content_type = 'composite';
	    		foreach ($content as $key => $row) {
	    			if ($row->type != $content_type) unset($content[$key]);
	    		}
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
    
    public function sort_by_predicate($contents, $field, $dir='asc') {
    	
    	// Check "built-in" fields
    	$rdf_fields = $this->config->item('rdf_fields');
    	if (in_array($field, $rdf_fields)) {
    		$name = array_search($field, $rdf_fields);
    		usort($contents, array(new LensFieldCmpClosure($name, $dir), "call"));
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
 * Sorting functions that can be passed variables
 * https://stackoverflow.com/questions/8230538/pass-extra-parameters-to-usort-callback
 */

function lens_field_cmp($a, $b, $meta, $dir='asc') {
	$name_a = $a->versions[0]->{$meta};
	$name_b = $b->versions[0]->{$meta};
	if ('desc' == $dir) {
		return strcasecmp($name_b, $name_a);
	} else {
		return strcasecmp($name_a, $name_b);
	}
}

class LensFieldCmpClosure {
	private $meta;
	private $dir;
	
	function __construct( $meta, $dir ) {
		$this->meta = $meta;
		$this->dir = $dir;
	}
	
	function call( $a, $b ) {
		return lens_field_cmp($a, $b, $this->meta, $this->dir);
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
