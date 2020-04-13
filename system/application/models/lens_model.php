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
		$operator = 'and';
		$contents = array();

		foreach ($json['components'] as $component) {
			foreach ($component['modifiers'] as $modifier) {
				switch ($modifier['type']) {
					case "filter":
						switch ($modifier['subtype']) {
							case "metadata":
								$field = trim($modifier['metadata-field']);
								$value = trim($modifier['content']);
								$content = $CI->versions->get_by_predicate($book_id, $field, false, null, $value);
								$contents = $this->combine_by_operator($contents, $content, $operator);
								break;
							case "distance":
								$from_arr = $this->get_pages_from_content_selector($component['content-selector']);
								$distance_in_meters = $modifier['quantity'];
								$items = $CI->versions->get_by_predicate($book_id, array('dcterms:spatial','dcterms:coverage'));
								foreach ($from_arr as $from) {
									$content = array();
									$item = $this->filter_by_slug($items, $from);
									if (!empty($item)) {
										$latlng = $this->get_latlng_from_item($item[0]);
										$content = $this->filter_by_location($items, $latlng, $distance_in_meters);
									}
									$contents = $this->combine_by_operator($contents, $content, $operator);
								}
								break;
							case "relationship":
								$from_arr = $this->get_pages_from_content_selector($component['content-selector']);
								foreach ($from_arr as $from) {
									$page = $CI->pages->get_by_slug($book_id, $from, true);
									$version = $CI->versions->get_single($page->content_id, $page->recent_version_id, null, false);
									$types = $modifier['content-types'];
									$content = array();
									foreach ($types as $type) {
										$type_p = $type.'s';
										if ($type_p== 'replys') $type_p= 'replies';
										if (!isset($CI->$type_p) || 'object'!=gettype($CI->$type_p)) $CI->load->model($type.'_model',$type_p);
										$items = $CI->$type_p->get_children($version->version_id, '', '', true, null);
										foreach ($items as $item) {
											$page = $CI->pages->get($item->child_content_id);
											$page->versions = array();
											$page->versions[] = $CI->versions->get_single($page->content_id, $page->recent_version_id, null, true);
											$content[] = $page;
										}
									}
									$contents = $this->combine_by_operator($contents, $content, $operator);
								}
								break;
						}
						break;
				}
			}
		}

		$return = array();
		if (empty($contents)) return $return;
		foreach ($contents as $content_id => $page) {
			$uri = $prefix.'/'.$page->slug;
			$return[$uri] = $CI->pages->rdf($page);
			$version_uri = $uri.'.'.$page->versions[0]->version_num;
			$return[$version_uri] = $CI->versions->rdf($page->versions[0]);
		}

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
    		case "and":
    			return array_merge($contents, $content);
    		default:  // or
    			// TODO: "or" operator
    	}
    	
    }
    
    public function get_pages_from_content_selector($json) {
    	
    	if (isset($json['items'])) {
    		return $json['items'];
    	}
    	return array();
    	
    }

}
?>
