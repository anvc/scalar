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
* @projectDescription	Wrapper for ARC2
* @abstract				ARC2 has its own resource helper, but this class includes methods for making interaction with it more direct (such as getting or saving resources)
* @author				Craig Dietrich
* @version				2.2
* @requires				This has been built as a CodeIgniter Library class, so assumes certain CI functions (such as base_url())
* @todo					By booting up ARC2 in the constructor here, I think we're creating two connections to MySQL on one page load (this + the one CodeIgniter began earlier)
*/

class RDF_Store {

	private $store;
	public $ns;

    public function __construct() {

		$ci=& get_instance();

		if ($ci->db->port != '') {
			$hostname_port = $ci->db->hostname;
			$hostname = strstr($hostname_port, ':', true);
		} else {
			$hostname = $ci->db->hostname;
		}

		$config = array(
  			'db_host' => $hostname,
  			'db_port' => $ci->db->port,
  			'db_name' => $ci->db->database,
  			'db_user' => $ci->db->username,
  			'db_pwd'  => $ci->db->password,
  			'store_name' => rtrim($ci->db->ARC_dbprefix, '_'),
		);

		$this->store =@ ARC2::getStore($config);
		//$this->store->createDBCon();
		if (!$this->store->isSetUp()) $this->store->setUp();

		$this->ns = $ci->config->item('namespaces');

    }

    /**
     * Describe a single node by URN
     */

    public function get_by_urn($urn='') {

		$q = 'DESCRIBE <'.$urn.'>';
		$rs = $this->store->query($q);
		if ($this->store->getErrors()) return null;
		if (empty($rs['result'])) return null;
		if (!isset($rs['result'][$urn]) || empty($rs['result'][$urn])) return null;
		return $rs['result'][$urn];

    }
    
    /**
     * Select based on a predicate
     */
    
    public function get_urns_from_predicate($p_arr=array(), $in_version_urns=array()) {
    	
    	if (!is_array($p_arr)) $p_arr= array($p_arr);
    	for ($j = 0; $j < count($p_arr); $j++) {
    		if (strstr($p_arr[$j], '//')) $p_arr[$j]= '<' . $p_arr[$j]. '>';
    		$p_arr[$j] = '
               { ?s '.$p_arr[$j].' ?o }';
    	}
    	
    	
    	$list = array();
    	foreach ($in_version_urns as $urn) {
    		$list[] = '?s = "'.$urn.'"';
    	}
    	
    	$q = '';
    	foreach ($this->ns as $prefix => $uri) {
    		$q .= 'PREFIX '.$prefix.': <'.$uri.'> . '."\n";
    	}
    	
    	$q .= '
              SELECT *
              WHERE {';
		
		$q .= implode(' UNION ', $p_arr);
    	
		$q .= '
               FILTER ('.implode(' || ',$list).') . ';
    	$q .= '
              }';

    	$rows = $this->store->query($q, 'rows');
    	if (!is_array($rows)) return false;
    	$return = array();
    	foreach ($rows as $row) {
    		$return[] = $row['s'];
    	}
    	return $return;
    	
    }
    
    /**
     * Look for versions that match the predicate and a search on the object
     */
    
    public function get_urns_from_predicate_and_object($p_arr=array(), $o='', $in_version_urns=array()) {
    	
    	if (!is_array($p_arr)) $p_arr= array($p_arr);
    	for ($j = 0; $j < count($p_arr); $j++) {
    		if (strstr($p_arr[$j], '//')) $p_arr[$j]= '<' . $p_arr[$j]. '>';
    		$p_arr[$j] = '
               { ?s '.$p_arr[$j].' ?o }';
    	}
    	
    	$list = array();
    	foreach ($in_version_urns as $urn) {
    		$list[] = '?s = "'.$urn.'"';
    	}
    	
    	$q = '';
    	foreach ($this->ns as $prefix => $uri) {
    		$q .= 'PREFIX '.$prefix.': <'.$uri.'> . '."\n";
    	}
    	
    	$q .= '
              SELECT *
              WHERE {';

    	$q .= implode(' UNION ', $p_arr);
    	
    	$q .= '
               FILTER ('.implode(' || ',$list).') . ';
    	$q .= '
               FILTER (regex (?o,"'.$o.'","i")) . ';
    	$q .= '
              }';
    	
    	$rows = $this->store->query($q, 'rows');
    	if (!is_array($rows)) return false;
    	$return = array();
    	foreach ($rows as $row) {
    		$return[] = $row['s'];
    	}
    	return $return;
    	
    }
    
	/**
	 * Save an array of fields and values for a single node by URN
	 */

	public function save_by_urn($urn, $array=array(), $g='urn:scalar') {

		$conf = array('ns' => $this->ns);
		$resource = ARC2::getResource($conf);
		$resource->setURI($urn);

		foreach ($array as $field => $valueArray) {

			if (!isNS($field)&&!isURL($field)) continue;
			$field = toURL($field, $this->ns);
			if (!is_array($valueArray)) $valueArray = array($valueArray);

			$insert_values = array();
			foreach ($valueArray as $value) {
				if (empty($value)) continue;
				if (is_string($value)) {
					if (substr($value, -1, 1)=='"') $value .= ' ';  // ARC bug fix
					//$value = closeOpenTags($value);
				}
				if (is_array($value)) {
					if (empty($value['value'])) continue;
					$insert_values[] = $value;
				} else {
					$insert_values[] = array('value' => $value, 'type' => ((isURL($value)||isNS($value,$this->ns))?'uri':'literal') );
				}
			}

			if (!empty($insert_values)) $resource->setProp($field, $insert_values);

		}

		$this->store->insert($resource->index, $g);
		if ($errs = $this->store->getErrors()) {
			print_r($errs);
		}

		return true;

	}

	/**
	 * Delete all predicates for a node by URN
	 */

	public function delete_urn($urn) {

		if (empty($urn)) return true;

		$q = 'DELETE {
				<'.$urn.'> ?p ?o .
		}';
		$done = $this->store->query($q);
		if ($errs = $this->store->getErrors()) {
			print_r($errs);
		}

		return true;

	}

	/**
	 * Return an ARC Helper object around a supplied index
	 */

	public function helper($index='') {

		$conf = array('ns' => $this->ns);
		$resource = ARC2::getResource($conf);
		if (!empty($index)) $resource->setIndex($index);
		if (!empty($index)) $resource->setURI(key($index));
		return $resource;

	}

	/**
	 * Serialize an index into either RDF-XML or RDF-JSON
	 */

	public function serialize($index, $prefix='', $format='xml') {

		if (!empty($prefix)) $this->ns['scalar'] = $prefix;

		switch (strtolower($format)) {
			case 'json';
				$parser =@ ARC2::getRDFParser();
				$doc =@ $parser->toRDFJSON( $index );
				break;
			case 'turtle':
				$parser =@ ARC2::getRDFParser();
				$doc =@ $parser->toTurtle( $index, $this->ns );
				break;
			case 'jsonld':
				$conf = array('ns' => $this->ns, 'serializer_prettyprint_container' => true); // , 'serializer_type_nodes' => true
				$ser =@ ARC2::getJSONLDSerializer($conf);
				$doc =@ $ser->getSerializedIndex( $index );
				break;
			default:  // xml
				$conf = array('ns' => $this->ns, 'serializer_prettyprint_container' => true); // , 'serializer_type_nodes' => true
				$ser =@ ARC2::getRDFXMLSerializer($conf);
				$doc =@ $ser->getSerializedIndex( $index );
		}

		return $doc;

	}

 	/**
 	 * Parse RDF, either from a string or a URL
 	 */

	public function parse($url) {

		$parser =@ ARC2::getRDFXMLParser();
		if (stristr($url, '<rdf')) {
			$parser->parse(confirm_slash(base_url()), $url);  // Parse an existing string
		} else {
			@$parser->parse($url);  // Go out and get via the URL
		}

		$index = $parser->getSimpleIndex(0);
		return $index;

	}

}
?>
