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
 * @projectDescription	Model for versions database table
 * @author				Craig Dietrich
 * @version				2.3
 */

class Version_model extends MY_Model {

    public function __construct() { parent::__construct(); }

	/**
	 * Return the URN of a version (e.g., urn:scalar:version:12345) based on a version ID
	 */
    public function urn($pk=0) {

    	return $this->version_urn($pk);

    }

	/**
	 * Return a version's URL segment with version number included (e.g., version-slug.#), for Scalar's URL rewriting
	 */
    public function slug($version_id=0) {

    	$this->db->select($this->versions_table.'.version_num');
    	$this->db->select($this->pages_table.'.slug');
    	$this->db->from($this->versions_table);
    	$this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
    	$this->db->where($this->versions_table.'.version_id',$version_id);
    	$query = $this->db->get();
    	$result = $query->result();
    	return $result[0]->slug.'.'.$result[0]->version_num;

    }

	/**
	 * Return an RDF object based an a $row
	 */
  	public function rdf($row, $prefix='') {

  		// rdf:type
  		$row->type = (isset($row->type)) ? $row->type : 'version';
  		// art:url
  		if (isset($row->url)) {
  			if (!is_array($row->url)) $row->url = array($row->url);
  			foreach ($row->url as $key => $value) {
  				if (!isURL($value)) $row->url[$key] = abs_url($value, $prefix);
  				//$row->url[$key] = linkencode($row->url[$key], true);
  			}
  		}
  		// dcterms:created
  		if (isset($row->timestamp) && !empty($row->timestamp)) {
  			if (!isset($row->created) || empty($row->created)) $row->created = date("c", $row->timestamp);
  		}

  		// Only show Editorial Workflow fields on edit page and RDF API when an author or editor
  		if (isset($row->editorial_queries)) {  // No access to MY_Controller->can_editorial()
  			$unset = false;
  			$am_in_book = ('book' == $this->router->fetch_class()) ? true : false;
  			$am_in_api = ('api' == $this->router->fetch_class()) ? true : false;
  			if (!$this->data['book']->editorial_is_on) {
  				$unset = true;
  			} elseif ($am_in_book && $this->data['mode'] != 'editing') {
  				$unset = true;
  			} elseif (!$am_in_book && !$am_in_api && isset($this->data['user_level']) && 'author' != strtolower($this->data['user_level']) && 'editor' != strtolower($this->data['user_level'])) {
  				$unset = true;	
  			}
  			if ($unset) {
  				unset($row->usage_rights);
  				unset($row->editorial_queries);
  			}
  		}

  		$rdf = parent::rdf($row, $prefix);

  		// Blend with RDF from the semantic store
  		if (!empty($row->rdf)) {
	  		foreach ($row->rdf as $p => $values) {
	  			if (array_key_exists($p, $rdf)) {
	  				// TODO: Not sure we should allow a collision between the semantic and relational tables? For now, don't.
	  			} else {
	  				$rdf[$p] = $values;
	  				foreach ($rdf[$p] as $key => $value) {  // If the type is URI and the value is a NS, try to convert the value to a URI
	  					if (isset($value['value']) && isset($value['type']) && 'uri'==$value['type'] && isNS($value['value'])) {
	  						$rdf[$p][$key]['value'] = toURL($rdf[$p][$key]['value'], $this->config->item('namespaces'));
	  					}
	  				}
	  			}
	  		}
  		}

  		return $rdf;

  	}

	/**
	 * Return a version row based on a version ID; sending an optional search query will filter the result
	 */
  	public function get($version_id=0, $sq='', $include_metadata=true) {

    	$ci =& get_instance();  // for use with the rdf_store

		$this->db->where('version_id', $version_id);
    	$query = $this->db->get($this->versions_table);
    	if (!$query->num_rows()) return null;

    	$result = $query->result();
    	$result[0]->urn = $this->urn($result[0]->version_id);
    	$result[0]->attribution = unserialize_recursive($result[0]->attribution);
    	$result[0]->rdf = ($include_metadata) ? $ci->rdf_store->get_by_urn('urn:scalar:version:'.$result[0]->version_id) : null;
    	$result[0]->citation = '';

        if (!empty($sq)) {
        	$matched = self::filter_result_i($result[0], $sq);
        	if (false===$matched) return array();
        	$result[0]->citation = 'sq_matched='.implode(',',$matched);
        }

    	return $result[0];

    }

    /**
     * Return the most recent version which can be cut off by a datetime
     * If 2nd argument is passed, it'll either be the specific version ID or a request to save the result to content's recent_version_id
     */
    public function get_single($content_id=0, $version_id=null, $sq='', $include_metadata=true) {

		if (!empty($version_id)) {
			$result = self::get($version_id, $sq, $include_metadata);
			if (null!==$result) return $result;
		}

    	$ci =& get_instance();  // for use with the rdf_store

     	$this->db->where('content_id',$content_id);
    	$this->db->order_by('version_num', 'desc');
    	$this->db->limit(1);
    	$query = $this->db->get($this->versions_table);
    	if (!$query->num_rows()) return array();
    	$result = $query->result();
    	$result[0]->urn = $this->urn($result[0]->version_id);
    	$result[0]->attribution = unserialize_recursive($result[0]->attribution);
    	$result[0]->rdf = ($include_metadata) ? $ci->rdf_store->get_by_urn('urn:scalar:version:'.$result[0]->version_id) : null;
    	$result[0]->citation = '';

        if (!empty($sq)) {
        	$matched = self::filter_result_i($result[0], $sq);
        	if (false===$matched) return array();
        	$result[0]->citation = 'sq_matched='.implode(',',$matched);
        }

		if (0===$version_id && empty($sq)) {  // 0 is passed to version ID; save result as content's recent_version_id
			self::set_recent_version_id($content_id, $result[0]->version_id);
		}

		return $result[0];

    }

	/**
	 * Return version(s) given a content ID
	 */
    public function get_all($content_id=0, $limit=null, $sq='', $include_metadata=true) {

		$ci =& get_instance();  // for use with the rdf_store

     	if (!empty($content_id)) $this->db->where('content_id',$content_id);
    	$this->db->order_by('version_num', 'desc');
    	if (!empty($limit)) $this->db->limit($limit);
    	$query = $this->db->get($this->versions_table);
    	$result = $query->result();

        if (!empty($sq)) {
    		for ($j = (count($result)-1); $j >= 0; $j--) {
    			$matched = self::filter_result_i($result[$j], $sq);
    			if (false===$matched) {
    				unset($result[$j]);
    			} else {
    				$result[$j]->citation = 'sq_matched='.implode(',',$matched);
    			}
    		}
    	}

    	foreach ($result as $key => $value) {
    		$result[$key]->urn = $this->urn($result[$key]->version_id);
    		$result[$key]->attribution = unserialize_recursive($result[$key]->attribution);
    		$result[$key]->rdf = ($include_metadata) ? $ci->rdf_store->get_by_urn('urn:scalar:version:'.$result[$key]->version_id) : null;
    	}

    	return $result;

    }

	/**
	 * Return version row of a specific version num, for a content ID
	 */
    public function get_by_version_num($content_id=0, $version_num=0) {

    	$this->db->where('content_id', $content_id);  // KEY 'content_id' is very selective
		$this->db->where('version_num', $version_num);
    	$query = $this->db->get($this->versions_table);
    	$result = $query->result();
    	$result[0]->urn = $this->urn($result[0]->version_id);
    	return $result[0];

    }

	/**
	 * Return version row based on the URL field
	 */
    public function get_by_url($url='', $is_live=false) {

    	$this->db->where('url', $url);
    	$query = $this->db->get($this->versions_table);
    	if (!$query->num_rows) return false;
    	$result = $query->result();
    	$result[0]->urn = $this->urn($result[0]->version_id);
    	return $result[0];

    }

	/**
	 * Return the book ID given a version ID
	 * TODO: This should be renamed get_book_id(...)
	 */
    public function get_book($version_id=0) {

	    $this->db->select($this->pages_table.'.book_id');
	    $this->db->from($this->versions_table);
	    $this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
	    $this->db->where($this->versions_table.'.version_id', $version_id);
	    $query = $this->db->get();
	    $result = $query->result();
	    if (!isset($result[0])) return false;
	    return (int) $result[0]->book_id;

    }

	/**
	 * Return the URI of a version (e.g., http://.../.../...) based on a version ID
	 */
    public function get_uri($version_id=0) {

    	$this->db->select('*');
    	$this->db->where($this->books_table.'.book_id', $this->get_book($version_id));
    	$query = $this->db->get($this->books_table);
    	$result = $query->result();
    	$book_slug = $result[0]->slug;
    	// TODO: this puts a trailing slasho on the URI
    	return confirm_slash(base_url().confirm_slash($book_slug).$this->slug($version_id));

    }

	/**
	 * Return the content ID of a version based on its ID
	 */
    public function get_content_id($version_id=0) {

    	$this->db->select('content_id');
    	$this->db->from($this->versions_table);
    	$this->db->where('version_id', $version_id);
    	$query = $this->db->get();
    	if (!$query->num_rows) return null;
    	$result = $query->result();
    	if (!isset($result[0])) return null;
    	return $result[0]->content_id;

    }
    
    /**
     * Return the content field from all versions of a certain content ID
     */
    public function get_all_page_contents($content_id=0) {
    	
		if (empty($content_id)) return false;
		
		$this->db->select('version_id');
		$this->db->select('content');
    	$this->db->where('content_id',$content_id);
    	$query = $this->db->get($this->versions_table);
    	$result = $query->result();

    	$return = array();
    	
    	foreach ($result as $key => $value) {
    		$version_id = $result[$key]->version_id;
    		$return[$version_id] = $result[$key]->content; 
    	}
    	
    	return $return;
    	
    }
    
    /**
     * Search the for versions that have a certain predicate $p (and, if sent, search its value for $o)
     */
    public function get_by_predicate($book_id=0, $p='', $all_versions=false, $id_array=null, $o='', $exact_match=false) {
    	
    	$ci =& get_instance();
    	if (!is_array($p)) $p = array($p);
    	
    	// Check if the predicate is a "built in" field
    	$rdf_fields = $this->config->item('rdf_fields');
    	if (isset($p[0]) && in_array($p[0], $rdf_fields)) {  // TODO: more than one $p
    		if (empty($o)) {
    			// TODO: return every page in the book where there is a value
    			die("Return all pages that have the field");
    		} else {
    			$field = array_search($p[0], $rdf_fields);
    			$content = $ci->pages->get_all($book_id, null, null, true, null);
    			for ($j = 0; $j < count($content); $j++) {
    				$content[$j]->versions = array($this->get_single($content[$j]->content_id, $content[$j]->recent_version_id, null, false));
    			}
    			for ($j = count($content)-1; $j >= 0; $j--) {  // Exclude words within words (e.g., japan in japanese)
    				if (isset($content[$j]->versions[0]->{$field})) {
    					if ($exact_match) {
    						$string = ' '.preg_replace("/[^\w\s]/", " ", strtolower($content[$j]->versions[0]->{$field})).' ';
    						//$arr = explode(' ', $string);
    						//if (!in_array($o, $arr)) unset($content[$j]); 
    						if (!strstr($string, ' '.strtolower(trim($o)).' ')) unset($content[$j]);
    					} else {
    						if (!stristr($content[$j]->versions[0]->{$field}, $o)) unset($content[$j]);
    					}
    				} elseif (isset($content[$j]->{$field})) {
    					if ($exact_match) {
    						$string = ' '.preg_replace("/[^\w\s]/", " ", strtolower($content[$j]->{$field})).' ';
    						//$arr = explode(' ', $string);
    						//if (!in_array($o, $arr)) unset($content[$j]);
    						if (!strstr($string, ' '.strtolower(trim($o)).' ')) unset($content[$j]);
    					} else {
    						if (!stristr($content[$j]->{$field}, $o)) unset($content[$j]);
    					}
    				} else {
    					unset($content[$j]); 
    				}
    			}
    		}
    	
    	// Otherwise, search metadata fields
    	} else {
    	
	    	// Get all URNs in the book
	    	$book_version_urns = array();
	    	$pages = $ci->pages->get_all($book_id, null, null, true, $id_array);
	    	for ($j = 0; $j < count($pages); $j++) {
	    		$pages[$j]->versions = array($this->get_single($pages[$j]->content_id, $pages[$j]->recent_version_id, $sq='', false));
	    		for ($k = 0; $k < count($pages[$j]->versions); $k++) {
	    			if (empty($pages[$j]->versions[$k])) continue;
	    			$book_version_urns[] = $this->urn($pages[$j]->versions[$k]->version_id);
	    		}
	    	}
	    	
	    	// Get all URNs that have the object in the predicate value
	    	if (!empty($o)) {
	    		$version_urns = $ci->rdf_store->get_urns_from_predicate_and_object($p, $o, $book_version_urns, $exact_match);
	    	// Get all URNs that have the predicate
	    	} else {
	    		$version_urns = $ci->rdf_store->get_urns_from_predicate($p, $book_version_urns);
	    	}
	
	    	rsort($version_urns, SORT_NATURAL);
	    	$content = array();
	    	foreach ($version_urns as $version_urn) {
	    		$version_urn_arr = explode(':', $version_urn);
	    		$version_id = (int) array_pop($version_urn_arr);
	    		$version = $this->versions->get($version_id, null, false);  // Get without metadata
	    		if (!isset($content[$version->content_id])) {
	    			$row = $this->pages->get($version->content_id);
	    			if (empty($row)) continue;
	    			$row->versions = array();
	    			$content[$row->content_id] = $row;
	    		}
	    		$content[$version->content_id]->versions[] = $version;
	    	}
	    	
    	}
    	
    	// Reload versions with metadata
    	if (!$all_versions) {
    		foreach ($content as $content_id => $row) {
    			 $top_version = reset($content[$content_id]->versions);
    			 $content[$content_id]->versions = array($this->versions->get($top_version->version_id, null, true));  // Get with metadata
    		}
    	}
    	
    	return $content;
    	
    }

	/**
	 * Return true of the owner ("user") of a version is the passed user ID
	 * Note that most permissions-handling will be based on content rather than specific versions
	 */
    public function is_owner($user_id=0, $id=0) {

    	$user_id = (int) $user_id;
    	$this->db->select('user');
    	$this->db->from($this->versions_table);
    	$this->db->where('version_id', $id);
    	$this->db->limit(1);
    	$query = $this->db->get();
    	$result = $query->result();
    	$single_result = $result[0];
    	if ($single_result->user != $user_id) return false;
    	return true;

    }

	/**
	 * Delete a versiom based on its ID
	 * Note that validation is assumed to have already occured (e.g., in the controller)
	 */
    public function delete($version_id=0) {

    	if (empty($version_id)) return false;

    	$ci =& get_instance();  // for use with the rdf_store

    	$content_id = $this->get_content_id($version_id);

    	// Delete version

		$this->db->where('version_id', $version_id);
		$this->db->delete($this->versions_table);

		// Parents

		$this->db->where('parent_version_id', $version_id);
		$this->db->delete($this->paths_table);

		$this->db->where('parent_version_id', $version_id);
		$this->db->delete($this->tags_table);

		$this->db->where('parent_version_id', $version_id);
		$this->db->delete($this->annotations_table);

		$this->db->where('parent_version_id', $version_id);
		$this->db->delete($this->replies_table);

		$this->db->where('parent_version_id', $version_id);
		$this->db->delete($this->references_table);

		// Children

		$this->db->where('child_version_id', $version_id);
		$this->db->delete($this->paths_table);

		$this->db->where('child_version_id', $version_id);
		$this->db->delete($this->tags_table);

		$this->db->where('child_version_id', $version_id);
		$this->db->delete($this->annotations_table);

		$this->db->where('child_version_id', $version_id);
		$this->db->delete($this->replies_table);

		$this->db->where('child_version_id', $version_id);
		$this->db->delete($this->references_table);

		// RDF store
		$ci->rdf_store->delete_urn($this->urn($version_id));

		// Reset recent version
		$recent_version = self::get_single($content_id);
		if (!empty($recent_version)) {
			$recent_version_id = (int) $recent_version->version_id;
			self::set_recent_version_id($content_id, $recent_version_id);
		}

		return true;

    }

	/**
	 * Create a new version with the passed content ID as parent
	 * Note that validation is assumed to have already occured (e.g., in the controller)
	 */
    public function create($content_id=0, $array=array()) {
 
    	if ('array'!=gettype($array)) $array = (array) $array;
    	if (empty($content_id)) throw new Exception('Invalid content ID');
    	$ci =& get_instance();  // for use with the rdf_store

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
    	$data['user'] = $user_id;
    	$data['created'] = date('Y-m-d H:i:s');
    	$data['continue_to_content_id'] = (isset($array['continue_to_content_id'])) ? (int) $array['continue_to_content_id'] : 0;
    	$data['version_num'] = ($this->get_version_num($content_id) + 1);
    	$data['sort_number'] = (isset($array['sort_number'])) ? (int) $array['sort_number'] : 0;
    	if (isset($array['editorial_state'])) $data['editorial_state'] = trim($array['editorial_state']);
    	if (isset($array['usage_rights'])) $data['usage_rights'] = (int) $array['usage_rights'];
    	if (isset($array['editorial_queries'])) {
    		$json = json_decode($array['editorial_queries']);
    		if (!is_null($json)) $data['editorial_queries'] = $array['editorial_queries'];
    		unset($json);
    	}
    	$data['attribution'] = isset($array['attribution']) ? serialize($array['attribution']) : '';
     	$data['default_view'] = 'plain';
     	if (isset($array['default_view'])) {
     		if (is_array($array['default_view'])) {
     			$data['default_view'] = implode(',',array_unique_no_empty($array['default_view']));
     		} else {
     			$data['default_view'] = trim($array['default_view']);
     		}
     	}

 		$this->db->insert($this->versions_table, $data);
 		$version_id = $this->db->insert_id();

 		self::set_recent_version_id($content_id, $version_id);

 		// Save to the semantic tables, but first make sure that each predicate isn't a hard coded value in $this->rdf_fields
 		if (empty($version_id)) throw new Exception('Could not resolve version ID before saving to the semantic store.');
 		$additional_metadata = array();
 		if (isset($ci->rdf_store)) {
 			foreach ($array as $key => $value) {
 				if (!strstr($key, ':')) continue;
 				$in_rdf_fields = false;
 				foreach ($ci->rdf_store->ns as $ns_pname => $ns_uri) {
 					if ($this->rdf_field_exists($key)) $in_rdf_fields = true;
 					if ($this->rdf_field_exists( lcfirst(str_replace(' ', '', ucwords(strtr($key, '_', ' ')))) )) $in_rdf_fields = true;  // underscore to camelcase
 				}
 				if (!$in_rdf_fields) {
 					if (!isset($additional_metadata[$key])) $additional_metadata[$key] = array();
 					if (is_array($value)) {
 						foreach ($value as $value_el) {
 							if (isset($value_el['value'])) {
 								$value_el['value'] = trim($value_el['value']);
 							} else {
 								$value_el = trim($value_el);
 							}
 							if (empty($value_el)) continue;
 							$additional_metadata[$key][] = $value_el;
 						}
 					} else {
 						if (isset($value['value'])) {
 							$value['value'] = trim($value['value']);
 						} else {
 							$value = trim($value);
 						}
 						if (!empty($value)) $additional_metadata[$key][] = $value;
 					}
 					if (empty($additional_metadata[$key])) unset($additional_metadata[$key]);
 				}
 			}
 			if (!empty($additional_metadata)) $ci->rdf_store->save_by_urn($this->urn($version_id), $additional_metadata);
 		}

 		return $version_id;

    }

	/**
	 * Save to an existing version row
	 * Note: at the moment save() doesn't accept semantic web fields (pnodes), just fields that save to the relational table
	 */
    public function save($array=array()) {

    	// Get ID
    	$version_id = (int) $array['id'];
    	if (empty($version_id)) throw new Exception('Could not resolve version ID');
    	unset($array['id']);
    	unset($array['section']);
    	unset($array['ci_session']);
    	unset($array['book_id']);

 		// Scrub pnodes
 		$unset = array();
    	foreach ($array as $key => $value) {
 			if (strstr($key, ':')) $unset[] = $key;
    	}
    	foreach ($unset as $key) {
    		unset($array[$key]);
    	}

		// Save row
		$this->db->where('version_id', $version_id);
		$this->db->update($this->versions_table, $array);
		return $array;

    }

	/**
	 * A method specific to Scalar paths, that re-orders child versions (pages within the path) within a parent version (path)
	 */
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

	/**
	 * Reset the version number for all versions of a content
	 * If a user deletes version # 6 of, say, 10, there will be a gap between version # 5 and 7... this resets the numbering
	 */
    public function reorder_versions($content_id=0) {

    	if (empty($content_id)) throw new Exception('Could not resolve content ID');
    	$versions = $this->get_all($content_id, null);
    	$count = count($versions);
    	foreach ($versions as $version) {
    		$version_id = $version->version_id;
			$data = array( 'version_num' => $count );
			$this->db->where('version_id', $version_id);
			$this->db->update($this->versions_table, $data);
    		$count--;
    	}

    	self::set_recent_version_id($content_id, $versions[0]->version_id);

    	return true;

    }

	/**
	 * Set a version's parent content to live or not live, useful if only a version ID is known (and not its parent content ID)
	 */
    public function set_live($version_id=0, $bool=true) {

    	$ver = $this->get($version_id);
    	$this->db->where('content_id',$ver->content_id);
    	$this->db->set('is_live', $bool ? 1 : 0);
    	$this->db->update($this->pages_table);

    }

	/**
	 * Set a content's recent_version_id field to a version ID
	 * NOTE: This method should be called at the end of any add or delete action
	 */
    public function set_recent_version_id($content_id=0, $version_id=0) {

    	if (empty($content_id)) return false;
    	if (empty($version_id)) return false;

    	//echo 'SETTING recent_version_id'."\n";
    	$this->db->where('content_id',$content_id);
    	$this->db->set('recent_version_id', $version_id);
    	$this->db->update($this->pages_table);

    	return true;

    }

    /**
     * Make an assumption on whether or not the URL field is local or external
     */
    public function url_is_local($url, $base_uri='') {

    	$arr = parse_url($url);
    	if (!isset($arr['scheme']) || empty($arr['scheme'])) return true;
    	if (!empty($base_uri) && $base_uri == substr($url, 0, strlen($base_uri))) return true;
    	return false;

    }

	/**
	 * Filter a DB result of versions based on a search query (an array of terms)
	 */
    public function filter_result_i($result, $sq, $field=null) {

    	$result = (array) $result;
    	$results = array();
    	$matched = array();
    	$ns = $this->config->item('namespaces');
        foreach ($sq as $term) {  // Version fields
    		foreach($result as $key => $value) {
				if (!is_string($value)) continue;
				$value = strip_tags($value);
				if (!stristr($value,$term)) continue;
        		if (!in_array($term,$results)) $results[] = $term;
        		$matched[] = toNS($key, $ns);
    		}
        }
        //if (count($results)==count($sq)) return $matched;
        if (isset($result['rdf']) && !empty($result['rdf'])) {
        	$has_matched_key = null;
	        foreach ($sq as $term) {  // RDF fields
	    		foreach($result['rdf'] as $key => $values) {
	    			foreach ($values as $value) {
		    			$type = $value['type'];
		    			if ('literal'!=$type) continue;
						$value = strip_tags($value['value']);
						if (!stristr($value,$term)) continue;
		        		if (!in_array($term,$results)) $results[] = $term;
		        		if ($has_matched_key != $key) $matched[] = toNS($key, $ns);
		        		$has_matched_key = $key;
	    			}
	    		}
	        }
        }
        if (count($results)==count($sq)) return $matched;
        return false;

    }

	/**
	 * Return attribution fields as an object, serialized if requested
	 */
    public function build_attribution($fullname='', $ip='', $serialize=true) {

    	$attribution = new stdClass;
    	$attribution->fullname = $fullname;
    	$attribution->ip = $ip;
    	if ($serialize) return serialize($attribution);
    	else return $attribution;

    }

	/**
	 * Determine if a field exists in the set of expected RDF values for a version
	 */
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
    
    /**
     * Remove duplicates from id2val table
     */
    public function normalize_predicate_table() {
    	
    	$predicate_lowest_id = array();
    	$query = $this->db->query("SELECT * FROM scalar_store_id2val");
    	$results = $query->result();
    	foreach ($results as $row) {
    		$id = (int) $row->id;
    		$p = $row->val;
    		if (!array_key_exists($p, $predicate_lowest_id)) {
    			$predicate_lowest_id[$p] = $id;
    		} else {
    			if ($id < $predicate_lowest_id[$p]) $predicate_lowest_id[$p] = $id;
    		}
    	}
    	foreach ($results as $row) {
    		$id = (int) $row->id;
    		$p = $row->val;
    		$should_be_id = (int) $predicate_lowest_id[$p];
    		if ($id != $should_be_id) {
    			$query = $this->db->query("DELETE FROM scalar_store_id2val WHERE id = ".$id);
    			$query = $this->db->query("UPDATE scalar_store_triple SET p = ".$should_be_id." WHERE p = ".$id);
    		}
    	}
    	return $predicate_lowest_id;
    	
    }

}
?>
