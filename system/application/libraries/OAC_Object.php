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
 * @projectDescription		Convert internal structures to OAC, with help from RDF_Object
 * @author					Craig Dietrich
 * @version					1.0
 */

if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once(APPPATH.'libraries/RDF_Object.php');

class OAC_Object extends RDF_Object {

	public function __construct() {

		parent::__construct();

    }
    
    public function serialize(&$return=null, $format='jsonld') {

    	$rel_types = array('has_annotations');
    	$output = array();
    	foreach ($return as $node) {
    		$output[] = $this->_content_node($node);
    		foreach ($rel_types as $type) {
    			if (!isset($node->versions[$node->version_index]->{$type})) continue;
    			for ($j = 0; $j < count($node->versions[$node->version_index]->{$type}); $j++) {
    				$output[] = $this->_annotation_node($node->versions[$node->version_index]->{$type}[$j], $node);
    			}
    		}
    	}
    	$return = json_encode($output);
    	return $return;
    	
    }
    
    public function index(&$arg0=null, $arg1=null) {
    	
    	$numargs = func_num_args();
    	if (!$numargs) throw new Exception('Invalid arguments');
    	
    	if (!is_array($arg0)) {
    		$this->_index_by_ref($arg0, $arg1);
    	} else {
    		die('Only passing by ref is supported.');
    		return $this->_index($arg0);
    	}
    	
    }
    
    protected function _index_by_ref(&$return, $settings) {
    	
    	$settings = $this->_settings($settings);
    	if (empty($settings['content'])) return;
    	if (!is_array($settings['content'])) $settings['content'] = array($settings['content']);
    	$settings['total'] = count($settings['content']);
    	$settings['rel'] = self::REL_PARENTS_ONLY;
    	$settings['max_recurses'] = (isset($settings['max_recurses']) && null!==$settings['max_recurses']) ? (int) $settings['max_recurses'] : 0;
    	$return = array();
    	
    	$count = 0;
    	$skips = 0;
    	foreach ($settings['content'] as $row) {  // Content node
    		$temp_return = $this->_content($row, $settings);
    		if (null === $temp_return) continue;
    		if ($settings['max_recurses'] > 0) {  // Annotations of the content node
    			$temp_return = $this->_relationships($temp_return, $settings);
    			if ($settings['max_recurses'] > 1) {  // Tags of the annotations
    				$rel_types = array('has_annotations');
    				foreach ($rel_types as $type) {
    					if (!isset($temp_return->versions[$temp_return->version_index]->{$type})) continue;
    					for ($j = 0; $j < count($temp_return->versions[$temp_return->version_index]->{$type}); $j++) {
    						$temp_return->versions[$temp_return->version_index]->{$type}[$j] = $this->_relationships($temp_return->versions[$temp_return->version_index]->{$type}[$j], $settings);
    					}
    				}
    			}
    		}
    		$return[] = $temp_return;
    		$count++;
    	}
    	
    }
    
    protected function _content($row, $settings) {
    	
    	$CI =& get_instance();
    	if ('object'!=gettype($CI->versions)) $CI->load->model('version_model','versions');
    	$row->versions = array();
    	
    	// Versions attached to the content
    	$use_version_id = $this->_use_version($settings['use_versions'], $row->content_id);
    	if (false===$use_version_id && $settings['use_versions_restriction'] >= self::USE_VERSIONS_EXCLUSIVE) return null;
    	if (self::VERSIONS_ALL === $settings['versions']) {
    		$row->versions = $CI->versions->get_all($row->content_id, null, $settings['sq']);
    	} else {
    		$row->versions[0] = $CI->versions->get_single(
    			$row->content_id,
    			(!empty($use_version_id))?$use_version_id:$row->recent_version_id,
    			$settings['sq']
    		);
    		if (isset($row->versions[0]->url) && !isURL($row->versions[0]->url)) $row->versions[0]->url = confirm_slash(base_url()).$settings['book']->slug.'/'.$row->versions[0]->url;
    	}
    	if ($settings['use_versions_restriction'] == self::USE_VERSIONS_EDITORIAL) {
    		for ($j = count($row->versions) - 1; $j >= 0; $j--) {
    			if (!empty($use_version_id) && $row->versions[$j]->version_id != $use_version_id) {
    				array_splice($row->versions, $j, 1);
    			} elseif (!$settings['is_book_admin'] && 'published' != $row->versions[$j]->editorial_state) {
    				array_splice($row->versions, $j, 1);
    			}
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
    	$row = $this->_tklabels($row, $settings);
    	return $row;  // Temp
    	$row = $this->_pagination($row, $settings);
    	
    	return $row;
    	
    }
    
    private function _content_node($node) {

    	$CI =& get_instance();
    	$row = array();
    	$row['@context'] = array(
    			'http://www.w3.org/ns/anno.jsonld',
    			array(
    				'dcterms' => $this->ns['dcterms'],
    				'sioc' => $this->ns['sioc'],
    				'art' => $this->ns['art']
    			)
    	);
    	$row['id'] = (string) $node->versions[$node->version_index]->version_id;  // String: according to spec
    	$row['type'] = 'Video';
    	$row['dcterms:title'] = $node->versions[$node->version_index]->title;
    	if (isset($node->versions[$node->version_index]->description) && !empty($node->versions[$node->version_index]->description)) {
    		$row['dcterms:description'] = $node->versions[$node->version_index]->description;
    	}
    	if (isset($node->versions[$node->version_index]->content) && !empty($node->versions[$node->version_index]->content)) {
    		$row['sioc:content'] = $node->versions[$node->version_index]->content;
    	}
    	if (isset($node->versions[$node->version_index]->url) && !empty($node->versions[$node->version_index]->url)) {
    		$row['art:url'] = $node->versions[$node->version_index]->url;
    	}
    	if (isset($node->versions[$node->version_index]->user) && isset($node->versions[$node->version_index]->user->fullname)) {
    		$row['creator'] = array(
    				'type' => 'Person',
    				'nickname' => $node->versions[$node->version_index]->user->fullname,
    				'email' => sha1('mailto:'.$node->versions[$node->version_index]->user->email)
    		);
    	}
    	return $row;
    	
    }
    
    private function _annotation_node($node, $target) {

    	$CI =& get_instance();
    	$row = array();
    	$row['@context'] = 'http://www.w3.org/ns/anno.jsonld';
    	$row['id'] = (string) $node->versions[$node->version_index]->version_id;  // String: according to spec
    	$row['type'] = 'Annotation';
    	$row['motivation'] = 'highlighting';
    	if (isset($node->versions[$node->version_index]->user) && isset($node->versions[$node->version_index]->user->fullname)) {
    		$row['creator'] = array(
    				'type' => 'Person',
    				'nickname' => $node->versions[$node->version_index]->user->fullname,
    				'email' => sha1('mailto:'.$node->versions[$node->version_index]->user->email)
    		);
    	}
    	$row['body'] = array(
    			array(
    					"type" => "TextualBody",
    					"value" => $node->versions[$node->version_index]->title,
    					"format" => "text/plain",
    					"language" => "en",
    					"purpose" => "describing"
    			)
    	);
    	if (isset($node->versions[$node->version_index]->has_tags)) {
    		for ($j = 0; $j < count($node->versions[$node->version_index]->has_tags); $j++) {
    			$version_index = $node->versions[$node->version_index]->has_tags[$j]->version_index;
    			$row['body'][] = array(
    					"type" => "TextualBody",
    					"purpose" => "tagging",
    					"value" => $node->versions[$node->version_index]->has_tags[$j]->versions[$version_index]->title
    			);
    		}
    	}
    	$row['target'] = array(
    			"id" => $target->versions[$target->version_index]->url,
   				"type" => "Video",
    			"selector" => array(
    					array(
    						"type" => "FragmentSelector",
    						"conformsTo" => "http://www.w3.org/TR/media-frags/",
    						"value" => $this->annotation_append($node->versions[$node->version_index])
    					)
    			)
    	);
    	if (isset($node->versions[$node->version_index]->additional) && !empty($node->versions[$node->version_index]->additional)) {
    		$row['target']['selector'][] = array(
    			"type" => "SvgSelector",
    			"value" => $node->versions[$node->version_index]->additional
    		);
    	}
    	return $row;
    	
    }

}

/* End of file JSONLD_Object.php */
