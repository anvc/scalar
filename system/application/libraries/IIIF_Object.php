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
 * @projectDescription		Convert internal structures to IIIF, with help from RDF_Object
 * @author					Craig Dietrich
 * @version					1.0
 */

if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once(APPPATH.'libraries/RDF_Object.php');

class IIIF_Object extends RDF_Object {

	public function __construct() {

		parent::__construct();

    }
    
    public function serialize(&$return=null, $format='jsonld') {

    	$rel_types = array('has_annotations');
    	$output = array();
    	$output = $this->_header_node($return);
    	foreach ($return as $node) {
    		$row = $this->_content_node($node);
    		foreach ($rel_types as $type) {
    			if (!isset($node->versions[$node->version_index]->{$type})) continue;
    			for ($j = 0; $j < count($node->versions[$node->version_index]->{$type}); $j++) {
    				$row['items'][] = $this->_annotation_node($node->versions[$node->version_index]->{$type}[$j], $node);
    			}
    		}
    		$output['items'][] = $row;
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
    
    public function decode_annotations($arr=array(), $book=null) {
    	
    	$CI =& get_instance();
    	if (!isset($CI->pages) || 'object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
    	if (!isset($CI->versions) || 'object'!=gettype($CI->versions)) $CI->load->model('version_model','versions');
    	$return = array();

    	// Validate the book and get the page based on the item ID
    	if (empty($book) || !isset($book->book_id)) return $return;
    	$book_url = base_url() . $book->slug . '/';
    	$media_url = urldecode($arr['items'][0]['content']['id']);
    	$content = $CI->pages->get_by_version_url($book->book_id, $media_url);
    	if (empty($content)) {  // %20 spaces
    		$media_url = str_replace(' ', '%20', $media_url);
    		$content= $CI->pages->get_by_version_url($book->book_id, $media_url);
    	}
    	if (empty($content) && !stristr($media_url, $book_url)) {  // Could not be found
    		return $return;
    	}
    	if (empty($content)) {  // Look for a relative URL
    		$media_url = str_replace($book_url, '', $media_url);
    		$content = $CI->pages->get_by_version_url($book->book_id, $media_url);
    	}
    	if (empty($content)) {
    		$media_url = str_replace('%20', ' ', $media_url);
    		$content = $CI->pages->get_by_version_url($book->book_id, $media_url);
    	}
    	
    	foreach ($content as $content_id => $page) {
    	
	    	// Version
	    	$page->versions = array($CI->versions->get_single($page->content_id));
	    	$page->version_index = 0;
	    	if (empty($page->versions[0])) return $return;
	    	
		    foreach ($arr['items'][0]['items'] as $annotation_page) {
	    	
		    	$row = array();
		    	
		    	$annotation = $annotation_page['items'][0];
		    	$annotation_url = (isset($annotation['id'])) ? $annotation['id'] : '';
		    	if (empty($annotation_url)) {
		    		$_annotation_page = null;
		    	} else {
			    	$annotation_slug = str_replace($book_url, '', $annotation_url);
			    	$_annotation_page = $CI->pages->get_by_slug($book->book_id, $annotation_slug, true);
		    	}
		    	
		    	if (isset($arr['service'][0]['items']['action']) && strtolower($arr['service'][0]['items']['action']) == 'delete') {
		    		$_annotation_page->versions = array($CI->versions->get_single($_annotation_page->content_id));
		    		$_annotation_page->version_index = 0;
		    		$row['action'] = 'delete';
		    		$row['scalar:urn'] = $CI->versions->urn($_annotation_page->versions[$_annotation_page->version_index]->version_id);
		    	} elseif (empty($_annotation_page)) {
			    	$row['action'] = 'add';
		    	} else {
		    		$_annotation_page->versions = array($CI->versions->get_single($_annotation_page->content_id));
		    		$_annotation_page->version_index = 0;
		    		$row['action'] = 'update';
		    		$row['scalar:urn'] = $CI->versions->urn($_annotation_page->versions[$_annotation_page->version_index]->version_id);
		    	}
		    	
		    	$row['rdf:type'] = $CI->versions->rdf_type('composite');
		    	$row['scalar:child_type'] = $CI->versions->rdf_type('version');
		    	$row['scalar:child_urn'] = $CI->versions->urn($page->versions[$page->version_index]->version_id);
		    	$row['scalar:child_rel'] = 'annotated';
		    	
		    	$row['dcterms:creator'] = $annotation['creator']['nickname'];
		    	$row['dcterms:identifier'] = $annotation['creator']['email_sha1'];
		    	$row['dcterms:mediator'] = $annotation['generator'];
		    	$row['dcterms:rights'] = $annotation['rights'];
	
		    	foreach ($annotation['body'] as $body) {
		    		if ('describing' == $body['purpose']) {
		    			$row['dcterms:title'] = $body['value'];
		    			$row['dcterms:language'] = $body['language'];
		    			$row['dcterms:format'] = $body['format'];
			    	}
		    	}
		    	
		    	$target = $annotation['target']['selector'];
		    	$value = $target['value'];
		    	$value = str_replace('npt:', '', $value);
		    	$value_arr = explode('=', $value);
		    	$value = $value_arr[1];
		    	$value_arr = explode(',', $value);
		    	$row['scalar:start_seconds'] = $value_arr[0];
		    	$row['scalar:end_seconds'] = $value_arr[1];
		    	if (isset($target['refinedBy'])) {
		    		$value = $target['refinedBy']['value'];
		    		$row['dcterms:spatial'] = $value;
		    	}
		    	
		    	$return[] = $row;
		    	
		    }
		    
    	}
		    	
	    return $return;
	    	
    	
    }
    
    public function decode_tags($arr=array(), $book=null, $annotation_index=0, $annotation_version_id=0) {
    	
    	$CI =& get_instance();
    	if (!isset($CI->pages) || 'object'!=gettype($CI->pages)) $CI->load->model('page_model','pages');
    	if (!isset($CI->versions) || 'object'!=gettype($CI->versions)) $CI->load->model('version_model','versions');
    	$return = array();
    	
    	if (empty($book) || !isset($book->book_id)) return $return;
    	$book_url = base_url() . $book->slug . '/';
    	
    	$annotation_page = $arr['items'][0]['items'][$annotation_index];
    	$annotation = $annotation_page['items'][0];
    	
    	foreach ($annotation['body'] as $body) {

    		$row = array();
    		
    		$row['rdf:type'] = $CI->versions->rdf_type('composite');
    		$row['scalar:child_type'] = $CI->versions->rdf_type('version');
    		$row['scalar:child_urn'] = $CI->versions->urn($annotation_version_id);
    		$row['scalar:child_rel'] = 'tagged';
    		
	    	if ('tagging' == $body['purpose'] && 'SpecificResource' == $body['type']) {  // Complex tag

	    		foreach ($body['source']['label'] as $language => $title) {
	    			$row['dcterms:title'] = $title;
	    			$row['dcterms:language'] = $language;
	    			break;
	    		}
	    		$row['dcterms:description'] = $body['source']['description'][$language];
	    		$row['dcterms:format'] = $body['source']['format'];
	    		$row['dcterms:source'] = $body['source']['id'];
	    		
	    		$_tag_pages = $CI->versions->get_by_predicate($book->book_id, 'dcterms:source', false, null, $row['dcterms:source'], false);
	    		
	    	} elseif ('tagging' == $body['purpose']) {  // Simple tag
	    		
	    		$row['dcterms:title'] = $body['value'];
	    		
	    		$_tag_pages = $CI->versions->get_by_predicate($book->book_id, 'dcterms:title', false, null, $row['dcterms:title'], false);
	    		
	    	} else {
	    		continue;
	    	}
	    	
	    	if (empty($_tag_pages)) {
	    		$row['action'] = 'add';
	    	} else {
	    		$row['action'] = 'update';
	    		foreach ($_tag_pages as $key => $value) {
		    		$row['scalar:urn'] = $CI->versions->urn($value->versions[0]->version_id);
		    		break;
	    		}
	    	}
	    	
	    	$return[] = $row;
	    	
    	}
    	
    	return $return;
    	
    	
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
    
    private function _header_node($nodes) {
    	
    	$titles = array();
    	foreach ($nodes as $node) {
    		$title = $node->versions[$node->version_index]->title;
    		$titles[] = $title;
    	}
    	$output = array();
    	$output["@context"] = array(
    		"http://www.w3.org/ns/anno.jsonld",
    		"http://iiif.io/api/presentation/3/context.json"
    	);
    	$protocol = (stripos($_SERVER['SERVER_PROTOCOL'],'https')===0 || $_SERVER['HTTP_X_FORWARDED_PROTO']=='https') ? 'https://' : 'http://';
    	$output["id"] = $protocol.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
    	$output["type"] = "Manifest";
    	$output["label"] = array(
    		"en" => array( 'Annotations for "'.implode('", "', $titles).'"' )
    	);
    	$output["rights"] = "http://creativecommons.org/licenses/by/4.0/";
    	$output["items"] = array();
    	return $output;
    	
    }
    
    private function _content_node($node) {

    	$CI =& get_instance();
    	$row = array();
    	$row['id'] = base_url().$CI->data['book']->slug.'/'.$node->slug;
    	$row['type'] = 'Canvas';
    	$row['width'] = (isset($node->versions[$node->version_index]->rdf['http://purl.org/vra/width'])) ? (int) $node->versions[$node->version_index]->rdf['http://purl.org/vra/width'][0]['value'] : 0;
    	$row['height'] = (isset($node->versions[$node->version_index]->rdf['http://purl.org/vra/height'])) ? (int) $node->versions[$node->version_index]->rdf['http://purl.org/vra/height'][0]['value'] : 0;
    	$row['duration'] = (isset($node->versions[$node->version_index]->rdf['http://purl.org/vra/duration'])) ? (float) $node->versions[$node->version_index]->rdf['http://purl.org/vra/duration'][0]['value'] : 0;
    	
    	$url = '';
    	if (isset($node->versions[$node->version_index]->url) && !empty($node->versions[$node->version_index]->url)) {
    		$url = $node->versions[$node->version_index]->url;
    	}
    	$description = '';
    	if (isset($node->versions[$node->version_index]->description) && !empty($node->versions[$node->version_index]->description)) {
    		$description= $node->versions[$node->version_index]->description;
    	}
    	$row['content'] = array(
    		'id' => $url,
    		'type' => 'Video',
    		'width' => (int) $row['width'],
    		'height' => (int) $row['height'],
    		'duration' => (float) $row['duration'],
    		'label' => array(
    			'en' => $node->versions[$node->version_index]->title
    		),
    		'description' => array(
    			'en' => $description
    		)
    	);
    	$row['items'] = array();
    	
    	return $row;
    	
    }
    
    private function _annotation_node($node, $target) {

    	$CI =& get_instance();
    	$row = array();
    	$row['id'] = base_url().$CI->data['book']->slug.'/'.$node->slug;
    	$row['type'] = 'AnnotationPage';
    	$row['items'] = array();
    	
    	$anno = array(
    		'id' => base_url().$CI->data['book']->slug.'/'.$node->slug,
    		'type' => 'Annotation',
    		'generator' => (isset($node->versions[$node->version_index]->rdf['http://purl.org/dc/terms/mediator'])) ? $node->versions[$node->version_index]->rdf['http://purl.org/dc/terms/mediator'][0]['value'] : '',
    		'motivation' => 'highlighting' 
    	);
    	if (isset($node->versions[$node->version_index]->user) && isset($node->versions[$node->version_index]->user->fullname)) {
    		$anno['creator'] = array(
    			'type' => 'Person',
    			'nickname' => (isset($node->versions[$node->version_index]->rdf['http://purl.org/dc/terms/creator'])) ? $node->versions[$node->version_index]->rdf['http://purl.org/dc/terms/creator'][0]['value'] : '',
    			'email_sha1' => (isset($node->versions[$node->version_index]->rdf['http://purl.org/dc/terms/identifier'])) ? $node->versions[$node->version_index]->rdf['http://purl.org/dc/terms/identifier'][0]['value'] : ''
    		);
    	}
    	$anno['created'] = str_replace(' ', 'T', $node->versions[$node->version_index]->created);
    	$anno['rights'] = (isset($node->versions[$node->version_index]->rdf['http://purl.org/dc/terms/rights'])) ? $node->versions[$node->version_index]->rdf['http://purl.org/dc/terms/rights'][0]['value'] : '';
    	
    	$anno['body'] = array(
    			array(
    				"type" => "TextualBody",
    				"value" => $node->versions[$node->version_index]->title,
    				"format" => (isset($node->versions[$node->version_index]->rdf['http://purl.org/dc/terms/format'])) ? $node->versions[$node->version_index]->rdf['http://purl.org/dc/terms/format'][0]['value'] : '',
    				"language" => (isset($node->versions[$node->version_index]->rdf['http://purl.org/dc/terms/language'])) ? $node->versions[$node->version_index]->rdf['http://purl.org/dc/terms/language'][0]['value'] : '',
    				"purpose" => "describing"
    			)
    	);
    	if (isset($node->versions[$node->version_index]->has_tags)) {
    		for ($j = 0; $j < count($node->versions[$node->version_index]->has_tags); $j++) {
    			$version_index = $node->versions[$node->version_index]->has_tags[$j]->version_index;
    			$source = (isset($node->versions[$node->version_index]->has_tags[$j]->versions[$version_index]->rdf['http://purl.org/dc/terms/source'])) ? $node->versions[$node->version_index]->has_tags[$j]->versions[$version_index]->rdf['http://purl.org/dc/terms/source'][0]['value'] : '';
    			if (!empty($source)) {
    				$description = '';
    				if (isset($node->versions[$node->version_index]->has_tags[$j]->versions[$version_index]->description)) {
    					$description = $node->versions[$node->version_index]->has_tags[$j]->versions[$version_index]->description;
    				}
    				$format = (isset($node->versions[$node->version_index]->has_tags[$j]->versions[$version_index]->rdf['http://purl.org/dc/terms/format'])) ? $node->versions[$node->version_index]->has_tags[$j]->versions[$version_index]->rdf['http://purl.org/dc/terms/format'][0]['value'] : '';
    				$language = (isset($node->versions[$node->version_index]->has_tags[$j]->versions[$version_index]->rdf['http://purl.org/dc/terms/language'])) ? $node->versions[$node->version_index]->has_tags[$j]->versions[$version_index]->rdf['http://purl.org/dc/terms/language'][0]['value'] : '';
    				$anno['body'][] = array(
    					"type" => "SpecificResource",
    					"purpose" => "tagging",
	    				"source" => array(
	    					"id" => $source,
	    					"format" => "application/json",
	    					"label" => array(
	    						$language=> $node->versions[$node->version_index]->has_tags[$j]->versions[$version_index]->title
	    					),
	    					"description" => array(
	    						$language => $description
	    					)
	    				)
    				);
    			} else {
    				$anno['body'][] = array(
    					"type" => "TextualBody",
    					"purpose" => "tagging",
    					"value" => $node->versions[$node->version_index]->has_tags[$j]->versions[$version_index]->title
    				);
    			}
    		}
    	}
    	$anno['target'] = array(
    			"source" => $target->versions[$target->version_index]->url,
   				"type" => "SpecificResource",
    			"selector" => array(
    				"type" => "FragmentSelector",
    				"conformsTo" => "http://www.w3.org/TR/media-frags/",
    				"value" => $this->annotation_append($node->versions[$node->version_index])
    			)
    	);
    	if (isset($node->versions[$node->version_index]->rdf) && isset($node->versions[$node->version_index]->rdf['http://purl.org/dc/terms/spatial'])) {
    		$svg = $node->versions[$node->version_index]->rdf['http://purl.org/dc/terms/spatial'][0]['value'];
    		if (substr($svg, 0, 4) == '<svg') {
    			$anno['target']['selector']['refinedBy'] = array(
    				"type" => "SvgSelector",
    				"conformsTo" => 'http://www.w3.org/TR/SVG/',
    				"value" => $svg
    			);
    		}
    	}
    	if (isset($node->versions[$node->version_index]->additional) && !empty($node->versions[$node->version_index]->additional)) {
    		$anno['target']['selector']['refinedBy'] = array(
    			"type" => "SvgSelector",
    			"conformsTo" => 'http://www.w3.org/TR/SVG/',
    			"value" => $node->versions[$node->version_index]->additional
    		);
    	}
    	
    	$row['items'][] = $anno;
    	
    	return $row;
    	
    }

}

/* End of file JSONLD_Object.php */
