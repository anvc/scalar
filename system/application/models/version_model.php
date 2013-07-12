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
 * @projectDescription	Model for versions database table
 * @author				Craig Dietrich
 * @version				2.2
 */

class Version_model extends MY_Model {

    public function __construct() {
    	
        parent::__construct();
        
    }
  
    public function urn($pk=0) {
    	
    	return $this->version_urn($pk);
    	
    }    
    
  	public function rdf($row, $prefix='') {
  		
  		$row->type = (isset($row->type)) ? $row->type : 'version';
  		if (isset($row->url)) {
  			if (!is_array($row->url)) $row->url = array($row->url);
  			foreach ($row->url as $key => $value) {
  				if (!isURL($value)) $row->url[$key] = abs_url($value, $prefix);
  			}
  		}
  		$rdf = parent::rdf($row);
  		
  		// Blend with RDF from the semantic store
  		if (!empty($row->rdf)) {
	  		foreach ($row->rdf as $p => $values) {
	  			if (array_key_exists($p, $rdf)) {
	  				// TODO: Not sure we should allow a collision between the semantic and relational tables?
	  			} else {
	  				$rdf[$p] = $values;
	  			}
	  		}
  		}
  		
  		return $rdf;
  		
  	}
    
    public function get($version_id=0) {

		$this->db->where('version_id', $version_id);
    	$query = $this->db->get($this->versions_table);
    	if (mysql_errno()!=0) die(mysql_error());
    	$result = $query->result();
    	$result[0]->urn = $this->urn($result[0]->version_id);
    	$result[0]->attribution = unserialize($result[0]->attribution);
    	return $result[0];    	
    	
    }       
    
    public function get_all($content_id=0, $version_datetime=null, $limit=null, $sq='') {

		$ci =& get_instance();  // for use with the rdf_store
		
     	if (!empty($content_id)) $this->db->where('content_id',$content_id);
    	$this->db->order_by('version_num', 'desc');
    	if (!empty($version_datetime)) $this->db->where('created <=', $version_datetime);
    	// Don't run $sq here because it might return an older version than the most recent
    	if (!empty($limit)) $this->db->limit($limit);
    	$query = $this->db->get($this->versions_table);
    	if (mysql_errno()!=0) die(mysql_error());
    	$result = $query->result();
  
        if (!empty($sq)) {
    		for ($j = (count($result)-1); $j >= 0; $j--) {
    			if (!self::filter_result_i($result[$j], $sq)) unset($result[$j]);
    		}
    	}

    	foreach ($result as $key => $value) {
    		$result[$key]->urn = $this->urn($result[$key]->version_id);
    		$result[$key]->attribution = unserialize($result[$key]->attribution);
    		$result[$key]->rdf = $ci->rdf_store->get_by_urn('urn:scalar:version:'.$result[$key]->version_id);
    	}
    	
    	return $result;    	
    	
    }     
    
    public function filter_result_i($result, $sq) {
    	
    	$result = (array) $result;
    	$results = array();
        
        foreach ($sq as $term) {
    		foreach($result as $key => $value) { 
        		if (stristr($value,$term)) $results[] = $term; 
    		}   
        }
        if (count($results)==count($sq)) return true;
        return false;
    	
    }
    
    public function get_by_version_num($content_id=0, $version_num=0) {
    	
    	$this->db->where('content_id', $content_id);
		$this->db->where('version_num', $version_num);
    	$query = $this->db->get($this->versions_table);
    	if (mysql_errno()!=0) die(mysql_error());
    	$result = $query->result();
    	$result[0]->urn = $this->urn($result[0]->version_id);
    	return $result[0];    
    	
    } 
    
    public function get_by_url($url='', $is_live=false) {
    	
    	$this->db->where('url', $url);
    	$query = $this->db->get($this->versions_table);
    	if (mysql_errno()!=0) die(mysql_error());
    	if (!$query->num_rows) return false;
    	$result = $query->result();
    	$result[0]->urn = $this->urn($result[0]->version_id);
    	return $result[0];    
    	
    }        
    
    public function get_book($version_id=0) {
    	
    	$this->db->select($this->pages_table.'.book_id');
    	$this->db->from($this->versions_table);
    	$this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
    	$this->db->where($this->versions_table.'.version_id', $version_id);
    	$query = $this->db->get();
    	if (mysql_errno()!=0) die(mysql_error());
    	$result = $query->result();
    	if (!isset($result[0])) return false;
    	return (int) $result[0]->book_id;
    	
    }
    
    public function get_uri($version_id=0) {
    	
    	$this->db->select('*');
    	$this->db->where($this->books_table.'.book_id', $this->get_book($version_id));
    	$query = $this->db->get($this->books_table);
    	if (mysql_errno()!=0) die(mysql_error());
    	$result = $query->result();
    	$book_slug = $result[0]->slug;
    	return confirm_slash(base_url().confirm_slash($book_slug).$this->slug($version_id));
    	
    }
    
    public function is_owner($user_id=0, $id=0) {
    	
    	$user_id = (int) $user_id;
    	$this->db->select('user');
    	$this->db->from($this->version_table);
    	$this->db->where('version_id', $id);
    	$this->db->limit(1);
    	$query = $this->db->get();
    	if (mysql_errno()!=0) die('MySQL: '.mysql_error());
    	$result = $query->result();
    	$single_result = $result[0];
    	if ($single_result->user != $user_id) return false;
    	return true;
    	
    }    
  
    public function delete($version_id=0) {

    	if (empty($version_id)) return false;

		$this->db->where('version_id', $version_id);
		$this->db->delete($this->versions_table); 
		if (mysql_errno()!=0) echo 'ERROR: '.mysql_error()."\n";	
		
		// Parents
		
		$this->db->where('parent_version_id', $version_id);
		$this->db->delete($this->paths_table); 	
		if (mysql_errno()!=0) echo 'ERROR: '.mysql_error()."\n";
	
		$this->db->where('parent_version_id', $version_id);
		$this->db->delete($this->tags_table); 	
		if (mysql_errno()!=0) echo 'ERROR: '.mysql_error()."\n";
		
		$this->db->where('parent_version_id', $version_id);
		$this->db->delete($this->annotations_table); 	
		if (mysql_errno()!=0) echo 'ERROR: '.mysql_error()."\n";				
		
		$this->db->where('parent_version_id', $version_id);
		$this->db->delete($this->replies_table); 	
		if (mysql_errno()!=0) echo 'ERROR: '.mysql_error()."\n";			

		$this->db->where('parent_version_id', $version_id);
		$this->db->delete($this->references_table); 	
		if (mysql_errno()!=0) echo 'ERROR: '.mysql_error()."\n";				
	
		// Children
		
		$this->db->where('child_version_id', $version_id);
		$this->db->delete($this->paths_table); 	
		if (mysql_errno()!=0) echo 'ERROR: '.mysql_error()."\n";
	
		$this->db->where('child_version_id', $version_id);
		$this->db->delete($this->tags_table); 	
		if (mysql_errno()!=0) echo 'ERROR: '.mysql_error()."\n";
		
		$this->db->where('child_version_id', $version_id);
		$this->db->delete($this->annotations_table); 	
		if (mysql_errno()!=0) echo 'ERROR: '.mysql_error()."\n";				
		
		$this->db->where('child_version_id', $version_id);
		$this->db->delete($this->replies_table); 	
		if (mysql_errno()!=0) echo 'ERROR: '.mysql_error()."\n";			

		$this->db->where('child_version_id', $version_id);
		$this->db->delete($this->references_table); 	
		if (mysql_errno()!=0) echo 'ERROR: '.mysql_error()."\n";		
		
		// RDF Store
		$this->rdf_store->delete_urn($this->urn($version_id));
		
		return true;
    	
    }    
    
    // Save is likely to not be used as new 'saves' in the system increment the version number and therefore always 'create'
    public function save($array=array()) {
    	
    	// Get ID
    	$version_id = $array['id'];
    	unset($array['id']);
    	unset($array['section']);
    	unset($array['ci_session']); 
    	unset($array['book_id']);	
		
		// Save row
		$this->db->where('version_id', $version_id);
		$this->db->update($this->versions_table, $array); 
		if (mysql_errno()!=0) die('MySQL: '.mysql_error());
		return $array;
    	
    }      
    
    public function create($content_id=0, $array=array()) {

    	if (empty($content_id)) throw new Exception('Invalid content ID');

		// Validate
		
		$user_id = $array['user_id'];
		if (empty($user_id)) $user_id = 0;  // Talk to Craig and John about this
    	
    	$url = (isset($array['url'])) ? trim($array['url']) : '';
    	if ('http://'==$url) $url = ''; // the default value
    	
    	// Save to the relational tables
    	
    	$data = array();
    	$data['content_id'] = $content_id;
    	$data['title'] = (isset($array['title'])) ? trim($array['title']) : '';
    	$data['description'] = (isset($array['description'])) ? trim($array['description']) : '';
    	$data['content'] = (isset($array['content'])) ? trim($array['content']) : '';
    	$data['url'] = $url;
    	$data['default_view'] = (isset($array['default_view']) && !empty($array['default_view'])) ? trim($array['default_view']) : 'plain';
    	$data['user'] = $user_id;
    	$data['created'] = date('c');
    	$data['continue_to_content_id'] = (isset($array['continue_to_content_id'])) ? (int) $array['continue_to_content_id'] : 0; 
    	$data['version_num'] = ($this->get_version_num($content_id) + 1);
    	$data['sort_number'] = (isset($array['sort_number'])) ? (int) $array['sort_number'] : 0;
    	$data['attribution'] = isset($array['attribution']) ? $array['attribution'] : 0;

 		$this->db->insert($this->versions_table, $data);
 		if (mysql_errno()!=0) throw new Exception('Error trying to save to the relational tables: '.mysql_error());
 		$version_id = mysql_insert_id();		
 		
 		// Save to the semantic tables, but first make sure that each predicate isn't a hard coded value in $this->rdf_fields
 		if (empty($version_id)) throw new Exception('Could not resolve version ID before saving to the semantic store.');
 		$additional_metadata = array();
 		if (isset($this->rdf_store)) {
 			foreach ($array as $key => $value) {
 				if (!strstr($key, ':')) continue; 
 				$in_rdf_fields = false;
 				foreach ($this->rdf_store->ns as $ns_pname => $ns_uri) {
 					if ($this->rdf_field_exists(str_replace($ns_pname.':', $ns_uri, $key))) $in_rdf_fields = true;
 				}
 				if (!$in_rdf_fields) {
 					if (!isset($additional_metadata[$key])) $additional_metadata[$key] = array();
 					if (is_array($value)) {
 						foreach ($value as $value_el) $additional_metadata[$key][] = $value_el;
 					} else {
 						$additional_metadata[$key][] = $value;
 					}
 				}
 			}
 			if (!empty($additional_metadata)) $this->rdf_store->save_by_urn($this->urn($version_id), $additional_metadata);
 		}
 		
 		return $version_id; 
 
    }          
    
    public function save_order($parent_version_id=0, $child_version_ids=array()) {
    	
		$count = 1;
		foreach ($child_version_ids as $child_version_id) {
			$data = array(
               'sort_number' => $count
            );
			$this->db->where('parent_version_id', $parent_version_id);
			$this->db->where('child_version_id', $child_version_id);
			$this->db->update($this->paths_table, $data);
			$count++; 
		} 
		return 1;
    	
    }
    
    public function reorder_versions($content_id=0) {
    	
    	if (empty($content_id)) throw new Exception('Could not resolve content ID');
    	$versions = $this->get_all($content_id, null);
    	$count = count($versions);
    	foreach ($versions as $version) {
    		$versoin_id = $version->version_id;
			$data = array( 'version_num' => $count );
			$this->db->where('version_id', $versoin_id);
			$this->db->update($this->versions_table, $data); 
    		$count--;
    	}	
    	return true;
    	
    }           
    
    public function set_live($version_id=0, $bool=true) {

    	$ver = $this->get($version_id);
    	$this->db->where('content_id',$ver->content_id);
    	$this->db->set('is_live', $bool ? 1 : 0);
    	$this->db->update($this->pages_table);
    	if (mysql_errno()!=0) die(mysql_error());
    	
    }    
    
    public function slug($version_id=0) {
    	
    	$this->db->select($this->versions_table.'.version_num');
    	$this->db->select($this->pages_table.'.slug');
    	$this->db->from($this->versions_table);
    	$this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
    	$this->db->where($this->versions_table.'.version_id',$version_id);
    	$query = $this->db->get();
    	if (mysql_errno()!=0) die(mysql_error());
    	$result = $query->result();
    	return $result[0]->slug.'.'.$result[0]->version_num;
    	
    }    

    public function build_attribution($fullname='', $ip='', $serialize=true) {
    	
    	$attribution = new stdClass;
    	$attribution->fullname = $fullname;
    	$attribution->ip = $ip;
    	if($serialize) return serialize($attribution);
    	else return $attribution;
    	
    }
    
    public function rdf_field_exists($field) {
    	
    	foreach ($this->rdf_fields as $value) {
    		if (is_array($value) && isset($value['pname'])) {
    			if ($value['pname'] == $field) return true;
    		} else {
    			if ($field == $value) return true;
    		}
    	}
    	return false;
    	
    }
    
}
?>
