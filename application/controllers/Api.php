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
* @projectDescription	Save API controller for adding and modifying Scalar data remotely via POST
* @abstract				This controller dispatches authentication requests and database updates received via POST
* @return				On success returns RDF-JSON; error messages are sent as HTTP response codes
* @author				John Bell w/ Craig Dietrich
* @version				1.3
*/

// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
	header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
	header('Access-Control-Allow-Credentials: true');
	header('Access-Control-Max-Age: 86400');
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
	if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
	if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
	exit(0);
}

Class Api extends CI_Controller {

	private $actions = array('ADD', 'DELETE', 'UNDELETE', 'UPDATE', 'RELATE');	//valid actions, redundant with URI but kept for clarity's sake

	//Valid fields for each type of action
	//TODO: Pretty sure we can clean up the add_fields|update_fields array then remove options_* arrays, since 'scalar' prefix is now allowed globally ~cd
	private $add_fields = array('dcterms:title','dcterms:description','rdf:type','scalar:child_urn','scalar:child_type','scalar:child_rel','scalar:fullname','sioc:content');
	private $optional_add_fields = array('dcterms:description','scalar:fullname','sioc:content');
	private $update_fields = array('dcterms:title','dcterms:description','rdf:type','scalar:urn','scalar:fullname','sioc:content');
	private $optional_update_fields = array('dcterms:description','scalar:fullname','sioc:content');
	private $relate_fields = array('scalar:urn', 'scalar:child_urn', 'scalar:child_rel');
	private $content_metadata = array('category', 'thumbnail', 'background', 'banner', 'custom_style', 'custom_scripts', 'color', 'slug', 'audio', 'is_live');
	private $version_metadata = array('url', 'default_view', 'continue_to_content_id', 'sort_number','editorial_state','usage_rights','editorial_queries');
	private $delete_fields = array('scalar:urn');
	private $content_types = array('book', 'media', 'composite', 'version');

	//Valid relationship types and metadata
	private $rel_types = array('page', 'annotated', 'contained', 'referenced', 'replied', 'tagged','grouped');
	private $rel_annotated = array('start_seconds', 'end_seconds', 'start_line_num', 'end_line_num', 'points', 'position_3d');
	private $rel_contained = array('sort_number');
	private $rel_referenced = array('reference_text');
	private $rel_replied = array('paragraph_num', 'datetime');
	private $rel_tagged = array();
	private $rel_grouped = array('contents');

	//Defaults
	private $default_return_format = 'json';
	private $allowable_formats = array('xml'=>'xml', 'json'=>'json','rdfxml'=>'xml','rdfjson'=>'json');
	private $allowable_metadata_prefixes = array('dc', 'shoah', 'scalar', 'exif');  // The rest are propagated by config['ontologies']
	private $disallowable_metadata_prefixes = array('scalar:metadata');
	public $data;

	public function __construct(){

		parent::__construct();

		header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
		header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past

		//Since this isn't using the MY_Controller parent (too much unneeded overhead), load infrastructure
		$this->load->helper(array('url', 'string', 'language', 'array', 'directory'));
		$this->load->database();
		$this->config->load('rdf');
		$this->config->load('local_settings');
		$this->ns = $this->config->item('namespaces');
		$this->template->set_template('blank');
		$this->load->library('statusCodes');
		$this->load->library('RDF_Store','rdf_store');
 		$this->data = array();

 		//Determine if the incoming request has a payload (JSON blob) and convert to post fields if available
		$this->_payload_to_auth_data();

 		//All requests to this controller must be accompanied by authentication credentials and a valid action
 		if(!$this->_load_auth_data()) $this->_output_error(StatusCodes::HTTP_UNAUTHORIZED, 'Invalid auth data');

 		$this->load->library('session');
 		$this->load->model('user_model', 'users');
 		$this->load->model('api_login_model', 'api_users');

 		//Get the current book, used to authenticate the user
 		$this->load->model('book_model', 'books');
 		$this->data['book'] = $this->books->get_by_slug(strtolower(no_edition($this->uri->segment(1))));
 		if (empty($this->data['book'])) $this->_output_error(StatusCodes::HTTP_NOT_FOUND, 'Could not find book');

 		//Session login first
 		if ($this->data['native']===true || $this->data['native']==='true'){
 			$this->user = $this->api_users->do_session_login($this->data['book']->book_id);
 			if (!$this->user && $this->api_users->is_super()) $this->_output_error(StatusCodes::HTTP_UNAUTHORIZED, 'You do not have permission to modify this book');
 			if (!$this->user) $this->_output_error(StatusCodes::HTTP_UNAUTHORIZED, 'You are not logged in');
 		// API key login
 		} else if (!$this->user = $this->api_users->do_login($this->data['email'], $this->data['api_key'], $this->data['host'], $this->data['book']->book_id)){
 			$this->_output_error(StatusCodes::HTTP_UNAUTHORIZED, 'Could not log in via API key');
 		}
 		$this->_fill_user_session_data();

 		//Propagate allowable prefixes
 		$ontologies = $this->config->item('ontologies');
 		foreach (array_keys($ontologies) as $key) {
 			array_push($this->allowable_metadata_prefixes, $key);
 		}

 		//TKLabels if applicable
 		$this->tklabels = $this->_tklabels($this->user->book_id);
 		if (!isset($this->tklabels['labels'])) $this->tklabels = null;
 		if (!empty($this->tklabels)) array_push($this->allowable_metadata_prefixes, 'tk');

 		//Determine if the incoming request has a payload (JSON blob) and convert to post fields if available
 		$this->_payload_to_data($this->data['book']);
	}

	/**
	 * No access without an action
	 */
	public function index(){
		$this->_output_error(StatusCodes::HTTP_FORBIDDEN);
	}

	/**
	 * Debug post data
	 */
 	public function debug(){
 		$this->_output_error(StatusCodes::HTTP_FORBIDDEN);
 		$this->data['content']=array('postdata'=>$this->data);
 		$this->data['content'] = $this->_rdf_serialize($this->data['content'], $this->config->item('RDF_vocab_prefix'));
 		$this->template->write_view('content', 'modules/data/'.$this->data['format'], $this->data);
 		$this->template->render();
 	}


	/**
	 * Adds a new page and version.  This function requires that the new content have some relationship to
	 * existing content elsewhere in the book.
	 */
	public function add($output=true){
		$this->load->model('page_model', 'pages');
		$this->load->model('version_model', 'versions');
		$this->load->model('book_model', 'books');

		//parse data
		$this->_load_add_data();

		// Validate user
		if (!$this->users->is_a($this->user->relationship,'commentator')) {
			$this->_output_error(StatusCodes::HTTP_UNAUTHORIZED);
		}

    	// if the content is a iiif resource, try to get the thumbnail & dc:terms metadata
    	$this->_load_iiif_data();

		//save the content entry
		$save_content = $this->_array_remap_content();
		$this->data['content_id'] = $this->pages->create($save_content);

		//save the version
		$save_version = $this->_array_remap_version($this->data['content_id']);
		$this->data['version_id'] = $this->versions->create($this->data['content_id'], $save_version);

		//establish the relationship to the passed child
		$this->_do_relate($this->data['version_id']);

		$row = $this->versions->get($this->data['version_id']);
		$this->data['content'] = array($this->versions->get_uri($this->data['version_id'])=>$this->versions->rdf($row));

		if ($output) $this->_output();
	}

	/**
	 * Relates a passed child and parent (should it really be subject and object?)
	 * Won't modify either node
	 */
	public function relate($output=true){
		$this->load->model('page_model', 'pages');
		$this->load->model('version_model', 'versions');

		// Validate user
		if (!$this->users->is_a($this->user->relationship,'reviewer')) {
			$this->_output_error(StatusCodes::HTTP_UNAUTHORIZED);
		}

		//parse data
		$this->_load_relate_data();

		if (empty($this->data['version_id'])) $this->_output_error(StatusCodes::HTTP_NOT_FOUND, 'Could not find version ID from scalar:urn (version URN or slug)');
		$this->_do_relate($this->data['version_id']);

		$row = $this->versions->get($this->data['version_id']);
		$this->data['content'] = array($this->versions->get_uri($this->data['version_id'])=>$this->versions->rdf($row));

		if ($output) $this->_output();
	}

	/**
	 * Updates an existing page and creates a new version to go with it
	 */

	public function update($output=true){
		$this->load->model('page_model', 'pages');
		$this->load->model('version_model', 'versions');

		//parse data
		$this->_load_update_data();

		// if the content is a iiif resource, try to get the thumbnail & dc:terms metadata
		$this->_load_iiif_data();

		//validate and save the content entry
		$save_content = $this->_array_remap_content_update();
		if (!$this->users->is_a($this->user->relationship,'reviewer')&&!$this->pages->is_owner($this->user->user_id,$this->data['content_id'])) {
			$this->_output_error(StatusCodes::HTTP_UNAUTHORIZED);
		}
		$this->pages->save($save_content);

		//save the version
		$save_version = $this->_array_remap_version($this->data['content_id']);
		$this->data['version_id'] = $this->versions->create($this->data['content_id'], $save_version);

		$row = $this->versions->get($this->data['version_id']);
		$this->data['content'] = array($this->versions->get_uri($this->data['version_id'])=>$this->versions->rdf($row));

		if ($output) $this->_output();
	}

	/**
	 * Note that this does not actually do a deletion, it just marks the content as not live
	 * This may be an unexpected behavior, but is kept this way because the API ignores not live content
	 * and should not have permission to truly delete anything
	 */
	public function delete($set_live_to=false, $output=true){
		//load models
		$this->load->model('page_model', 'pages');
		$this->load->model('version_model', 'versions');

		//parse data
		$this->_load_delete_data();

		//validate and update content entry
		$arr = explode(':',$this->data['scalar:urn']);  // Avoid E_STRICT pass by reference warning
		$this->data['version_id'] = array_pop($arr);
		if (!$this->users->is_a($this->user->relationship,'reviewer')&&!$this->pages->is_owner($this->user->user_id,$this->data['content_id'])) {
			$this->_output_error(StatusCodes::HTTP_UNAUTHORIZED);
		}
		$this->versions->set_live($this->data['version_id'], $set_live_to);

		$row = $this->versions->get($this->data['version_id']);
		$this->data['content'] = array($this->versions->get_uri($this->data['version_id'])=>$this->versions->rdf($row));

		if ($output) $this->_output();
	}

	/**
	 * Marks content as live
	 */
	public function undelete(){
		$this->delete(true);
	}

	/** Private Functions **/

   /**
	* If the data being uploaded is a IIIF resource, get the thumbnail
	* and other metadata from the iiif json itself.
	**/
	private function _load_iiif_data(){
		if (isset($this->data['scalar:url']) && strpos($this->data['scalar:url'], '?iiif-manifest=1') > -1){
			$iiif_metadata_array = $this->_get_IIIF_metadata($this->data['scalar:url']);
			if($iiif_metadata_array !== false){
				foreach ($iiif_metadata_array as $key => $value){
					if (empty($this->data[$key])){
						$this->data[$key] = $value;
					}
				}
			}
		}
	}

	/**
	 *
	 * Output an error in the specified return format with the correct HTTP header, and possibly with a custom message
	 * @param int $errorcode	HTTP response code
	 * @param str $msg			Custom error message (still will get the generic HTTP header)
	 * @param bool $continue 	Whether to continue the script after outputting the error, defaults to false
	 */
	private function _output_error($errorcode, $msg=false, $continue=false){
		header(StatusCodes::httpHeaderFor($errorcode));

		$this->data['content']=array('error'=>array('message'=> $msg ? $msg : StatusCodes::getMessageForCode($errorcode), 'code'=>$errorcode));
		$this->_output();

		if(!$continue) exit;
	}

	/**
	 * ->_output renders $this->data['content'] into the format specified by $this->data['format']
	 * TODO: only really tried JSON, XML doesn't seem to work
	 */
	private function _output(){

		if (empty($this->data['format'])) $this->data['format'] = 'json';
		$this->data['content'] = $this->_rdf_serialize($this->data['content'], $this->config->item('RDF_vocab_prefix'));
		$this->template->write_view('content', 'modules/data/'.$this->data['format'], $this->data);
		$this->template->render();
	}

	/**
	 * _load_x functions parse POST data and do some validation for each type of x
	 */
	private function _load_auth_data(){
		$this->data['native'] = $this->input->post('native');
		$this->data['email'] = $this->input->post('id');
		$this->data['api_key'] = $this->input->post('api_key');
		$this->data['action'] = $this->input->post('action');
		$this->data['format'] = $this->input->post('format');

		//get the request's originator for whitelist validation
		$this->data['host'] = gethostbyaddr($this->input->server('REMOTE_ADDR'));

		//verify format
		if(!$this->data['format'] || !array_key_exists($this->data['format'],$this->allowable_formats)) $this->data['format'] = $this->default_return_format;
		else $this->data['format'] = $this->allowable_formats[$this->data['format']];

		if(!$this->data['native'] && (!$this->data['email'] || !$this->data['api_key'] || !$this->data['action'])) return false;
		if(!in_array($this->data['action'], $this->actions)) return false;
		return true;
	}

	private function _load_add_data() {

		foreach($this->add_fields as $idx) {
			$this->data[$idx] = $this->input->post($idx);
			if(!$this->data[$idx] && !in_array($idx, $this->optional_add_fields)) $this->_output_error(StatusCodes::HTTP_BAD_REQUEST, 'Incomplete or missing field: '.$idx);
		}

		// TODO: remove scalar:metadata block once migrations are complete
		foreach($this->content_metadata as $idx){
			if($this->input->post('scalar:metadata:'.$idx)===false){
				//$this->data['scalar:metadata:'.$idx] = '';
			} else {
				$this->data['scalar:metadata:'.$idx] = $this->input->post('scalar:metadata:'.$idx);
			}
		}
		foreach($this->version_metadata as $idx){
			if($this->input->post('scalar:metadata:'.$idx)===false){
				//$this->data['scalar:metadata:'.$idx] = '';
			} else {
				$this->data['scalar:metadata:'.$idx] = $this->input->post('scalar:metadata:'.$idx);
			}
		}
		$rel_meta = 'rel_'.$this->input->post('scalar:child_rel');
		if (isset($this->$rel_meta)) {
			foreach($this->$rel_meta as $idx){
				if($this->input->post('scalar:metadata:'.$idx)===false){
					//$this->data['scalar:metadata:'.$idx] = '';
				} else {
					$this->data['scalar:metadata:'.$idx] = $this->input->post('scalar:metadata:'.$idx);
				}
			}
		}

		if(!in_array($this->data['scalar:child_rel'], $this->rel_types)) $this->_output_error(StatusCodes::HTTP_BAD_REQUEST, 'Invalid scalar:child_rel value.');

		$all_post_data = $_POST;   // $this->input->post() is supposed to return the full array, but doesn't
		foreach ($all_post_data as $key => $value) {
			foreach ($this->allowable_metadata_prefixes as $prefix) {
				if ('tk' == $prefix && 'tk:hasLabel' == $key && !is_array($value)) $value = array($value);
				if (substr($key, 0, strlen($prefix))==$prefix) $this->data[$key] = $value;
			}
		}

		// Check user permissions to edit book
		if($this->data['scalar:child_type'] == $this->versions->rdf_type('book')){
			$arr = explode(':', $this->data['scalar:child_urn']);  // Avoid E_STRICT pass by reference warning
			$the_book = $this->books->get(array_pop($arr));
			if(@$the_book->book_id != @$this->user->book_id){
				$this->_output_error(StatusCodes::HTTP_UNAUTHORIZED, 'You do not have permission to modify this node');
			}
		} else {
			$arr = explode(':', $this->data['scalar:child_urn']);  // Avoid E_STRICT pass by reference warning
			if($this->versions->get_book(array_pop($arr)) != $this->user->book_id){
				$this->_output_error(StatusCodes::HTTP_UNAUTHORIZED, 'You do not have permission to modify this node');
			}
		}

		$this->_validate_rdf_type($this->data['rdf:type']);
		$this->_validate_rdf_type($this->data['scalar:child_type']);

	}

	private function _load_relate_data() {

		// Required fields
		$rel_meta = 'rel_'.$this->input->post('scalar:child_rel');
		foreach($this->relate_fields as $idx) {
			$this->data[$idx] = $this->input->post($idx);
			if(!$this->data[$idx]) {
				if ('rel_grouped'==$rel_meta && 'scalar:child_urn'==$idx) continue;  // Special consideration for lenses, which don't have a 'child' in the relationship
				$this->_output_error(StatusCodes::HTTP_BAD_REQUEST, 'Incomplete or missing field: '.$idx);
			}
		}
		if (isset($this->$rel_meta)) {
			foreach($this->$rel_meta as $idx){
				if($this->input->post('scalar:'.$idx)!==false){
					$this->data['scalar:'.$idx] = $this->input->post('scalar:'.$idx);
				}
			}
		}

		// Addtional metadata: not the same as with ADD or UPDATE where metadata is saved into the version, rather this is relational meta such as "sort_number"
		$all_post_data = $_POST;   // $this->input->post() is supposed to return the full array, but doesn't
		foreach ($all_post_data as $key => $value) {
			foreach ($this->allowable_metadata_prefixes as $prefix) {   // Includes 'scalar' which is the only form relational meta should take
				if (substr($key, 0, strlen($prefix))==$prefix) $this->data[$key] = $value;
			}
		}

		// Validate scalar:urn (parent) and set its version ID + possibly glean URN from slug if that's what is sent
		if (strpos($this->data['scalar:urn'], ':')) {   // e.g., urn:scalar:version:12345
			$arr = explode(':', $this->data['scalar:urn']);  // Avoid E_STRICT pass by reference warning
			$this->data['version_id'] = array_pop($arr);
			$book_id = $this->versions->get_book($this->data['version_id']);
			if (!$book_id) $this->_output_error(StatusCodes::HTTP_NOT_FOUND, 'Requested scalar:urn does not exist');
			if ($book_id != $this->user->book_id) $this->_output_error(StatusCodes::HTTP_UNAUTHORIZED, 'Requested scalar:child_urn is not part of the request book');
		} else {  // e.g., my-first-scalar-page
			$page = $this->pages->get_by_slug($this->user->book_id, $this->data['scalar:urn']);
			if (empty($page)) $this->_output_error(StatusCodes::HTTP_NOT_FOUND, 'Requested scalar:urn (page slug) does not exist');
			$version = $this->versions->get_single($page->content_id, $page->recent_version_id);
			if (empty($version)) $this->_output_error(StatusCodes::HTTP_NOT_FOUND, 'Requested scalar:urn (page slug) does not have a version');
			$this->data['version_id'] = $version->version_id;
		}

		// Validate scalar:child_urn + possibly glean URN from slug if that's what is sent
		if (!empty($this->data['scalar:child_urn']) && strpos($this->data['scalar:child_urn'], ':')) {   // e.g., urn:scalar:version:12345
			$arr = explode(':', $this->data['scalar:child_urn']);  // Avoid E_STRICT pass by reference warning
			$book_id = $this->versions->get_book(array_pop($arr));
			if (!$book_id) $this->_output_error(StatusCodes::HTTP_NOT_FOUND, 'Requested scalar:child_urn does not exist');
			if ($book_id != $this->user->book_id) $this->_output_error(StatusCodes::HTTP_UNAUTHORIZED, 'Requested scalar:child_urn is not part of the request book');
		} elseif (!empty($this->data['scalar:child_urn'])) {  // e.g., my-first-scalar-page
			$page = $this->pages->get_by_slug($this->user->book_id, $this->data['scalar:child_urn']);
			if (empty($page)) $this->_output_error(StatusCodes::HTTP_NOT_FOUND, 'Requested scalar:child_urn (page slug) does not exist');
			$version = $this->versions->get_single($page->content_id, $page->recent_version_id);
			if (empty($version)) $this->_output_error(StatusCodes::HTTP_NOT_FOUND, 'Requested scalar:child_urn (page slug) does not have a version');
			$this->data['scalar:child_urn'] = $this->versions->urn($version->version_id);
		}

	}

	private function _load_update_data() {

		foreach($this->update_fields as $idx) {
			$this->data[$idx] = $this->input->post($idx);
			if(!$this->data[$idx] && !in_array($idx, $this->optional_update_fields)) {
				$this->_output_error(StatusCodes::HTTP_BAD_REQUEST, 'Incomplete or missing field ['.$idx.'].');
			}
		}

		// TODO: remove scalar:metadata block once migrations are complete
		foreach($this->content_metadata as $idx){
			if($this->input->post('scalar:metadata:'.$idx)===false){
				//$this->data['scalar:metadata:'.$idx] = '';
			} else {
				$this->data['scalar:metadata:'.$idx] = $this->input->post('scalar:metadata:'.$idx);
			}
		}
		foreach($this->version_metadata as $idx){
			if($this->input->post('scalar:metadata:'.$idx)===false){
				//$this->data['scalar:metadata:'.$idx] = '';
			} else {
				$this->data['scalar:metadata:'.$idx] = $this->input->post('scalar:metadata:'.$idx);
			}
		}

		$arr = explode(':', $this->data['scalar:urn']);  // Avoid E_STRICT pass by reference warning
		$this->data['version_id'] = array_pop($arr);

		if($this->versions->get_book($this->data['version_id']) != $this->user->book_id){
			$this->_output_error(StatusCodes::HTTP_UNAUTHORIZED, 'You do not have permission to modify this node');
		}

		$all_post_data = $_POST;   // $this->input->post() is supposed to return the full array, but doesn't
		foreach ($all_post_data as $key => $value) {
			foreach ($this->allowable_metadata_prefixes as $prefix) {
				if ('tk' == $prefix && 'tk:hasLabel' == $key && !is_array($value)) $value = array($value);
				if (substr($key, 0, strlen($prefix))==$prefix) $this->data[$key] = $value;
			}
		}

	}

	private function _load_delete_data(){
		foreach($this->delete_fields as $idx) $this->data[$idx] = $this->input->post($idx);
		if(!$this->data[$idx]) $this->_output_error(StatusCodes::HTTP_BAD_REQUEST, 'Incomplete or missing field.');
		$arr = explode(':', $this->data['scalar:urn']); // Avoid E_STRICT pass by reference warning
		if($this->versions->get_book(array_pop($arr)) != $this->user->book_id){
			$this->_output_error(StatusCodes::HTTP_UNAUTHORIZED, 'You do not have permission to modify this node');
		}
	}

	private function _validate_rdf_type($type){
		$types = (is_array($type)) ? $type : array($type);
		$urls = array();
		foreach($this->content_types as $name) $urls[$name] = $this->versions->rdf_type($name);
		$valid_type = false;
		foreach ($types as $type) {
			if($hit=array_search($type, $urls)) $valid_type = true;
		}
		if(!$valid_type) $this->_output_error(StatusCodes::HTTP_BAD_REQUEST, 'Invalid rdf:type value.');
		return $hit;
	}

	/**
	 * _array_remap_content() translates the raw form data into the array format that the page model is expecting
	 * @return array
	 */
	private function _array_remap_content(){
		$save = array();
		$save['book_id'] = $this->user->book_id;
		$save['user_id'] = $this->user->user_id;
		$save['title'] = $this->data['dcterms:title'];
		$save['slug'] =@ $this->data['scalar:slug'];
		$arr = explode('#', $this->data['rdf:type']);  // Avoid E_STRICT pass by reference warning
		$save['type'] = strtolower(array_pop($arr));

		foreach($this->content_metadata as $idx){
			if(isset($this->data['scalar:metadata:'.$idx])) $save[$idx] = $this->data['scalar:metadata:'.$idx];  // TODO: remove me after migration
			if(isset($this->data['scalar:'.$idx])) {
				$save[$idx] = $this->data['scalar:'.$idx];
				unset($this->data['scalar:'.$idx]);
			}
		}

		if(isset($save['slug']) && empty($save['slug'])) unset($save['slug']);

		return $save;
	}

	/**
	* _array_remap_content_update() translates the raw form data into the array format that the page model is expecting to update existing pages
	* @return array
	*/
	private function _array_remap_content_update(){
		$save = array();
		$ver = $this->versions->get($this->data['version_id']);
		$this->data['content_id'] = $ver->content_id;
		$save['id'] = $ver->content_id;
		$arr = explode('#', $this->data['rdf:type']);  // Avoid E_STRICT pass by reference warning
		$save['type'] =@ strtolower(array_pop($arr));

		foreach($this->content_metadata as $idx){
			 if(isset($this->data['scalar:metadata:'.$idx])) $save[$idx] = $this->data['scalar:metadata:'.$idx];  // TODO: remove me after migration
			 if(isset($this->data['scalar:'.$idx])) {
			 	$save[$idx] = $this->data['scalar:'.$idx];
			 	unset($this->data['scalar:'.$idx]);
			 }
		}

		if(isset($save['slug']) && empty($save['slug'])) unset($save['slug']);

		return $save;
	}

	/**
	* _get_IIIF_metadata takes IIIF manifest url, and returns associative array of metadata.
	* Otherwise, it will return False
	* @return array
	*/
	private function _get_IIIF_metadata($url=''){
		$ontologies = $this->config->item('ontologies');
        $dc_check_fields = array_diff($ontologies['dcterms'], array('title', 'description', 'license'));
		$formated_check_fields = array_combine($dc_check_fields, array_map('strtolower', $dc_check_fields));
		if ($url !== ''){
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
			curl_setopt($ch, CURLOPT_TIMEOUT, 15);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
			$response = curl_exec($ch);
			curl_close($ch);
			$response_json = json_decode($response, true);
			if (is_array($response_json)) {
				$return_array = [];
				if (isset($response_json['thumbnail'])){
					if(isset($response_json['thumbnail']['@id'])){
				        $return_array['scalar:thumbnail'] = $response_json['thumbnail']['@id'];
					} else {
					    $return_array['scalar:thumbnail'] = $response_json['thumbnail'];
					}
				}
				if (isset($response_json['license'])) {
					$return_array['dcterms:license'] = $response_json['license'];
				}
				if (isset($response_json['metadata'])) {
					foreach ($response_json['metadata'] as $obj) {
						$formated_label = strtolower(str_replace(' ', '', $obj['label']));
						$key = array_search($formated_label, $formated_check_fields);
						if($key) {
							$label = 'dcterms:' . $key;
							$return_array[$label] = $obj['value'];
						}
					}
				}
				return $return_array;
			}
		}
		return false;
	}

	/**
	* _array_remap_version() translates the raw form data into the array format that the version model is expecting
	* @return array
	*/
	private function _array_remap_version($content_id=0){
		if($content_id==0) $this->_output_error(StatusCodes::HTTP_INTERNAL_SERVER_ERROR, 'Could not resolve content ID when remapping version');

		$save = array();
		$save['content_id'] = $content_id;
		$save['user_id'] = $this->user->user_id;
		$save['title'] = $this->data['dcterms:title'];
		$save['description'] = $this->data['dcterms:description'];
		$save['content'] = isset($this->data['sioc:content']) ? $this->data['sioc:content'] : '';
		$save['type'] = $this->data['rdf:type'];
		if (!isset($this->data['scalar:fullname'])) $this->data['scalar:fullname'] = '';
		$save['attribution'] = $this->versions->build_attribution($this->data['scalar:fullname'], $this->input->server('REMOTE_ADDR'));

		foreach($this->version_metadata as $idx){
			if(isset($this->data['scalar:metadata:'.$idx])) $save[$idx] = $this->data['scalar:metadata:'.$idx];  // TODO: remove me after migration
			if(isset($this->data['scalar:'.$idx])) {
				$save[$idx] = $this->data['scalar:'.$idx];
				unset($this->data['scalar:'.$idx]);
			}
		}

		$rel_predicates = array();
		foreach($this->rel_types as $type) {
			$rel_type = 'rel_'.$type;
			if (!isset($this->$rel_type)) continue;
			foreach($this->$rel_type as $idx) {
				$rel_predicates[] = 'scalar:'.$idx;
			}
		}

		foreach ($this->data as $key => $value) {
			if (in_array($key, $rel_predicates)) continue;
			$key_is_allowable = false;
			foreach ($this->allowable_metadata_prefixes as $prefix) {
				if (substr($key, 0, strlen($prefix))==$prefix) $key_is_allowable = true;
			}
			foreach ($this->disallowable_metadata_prefixes as $prefix) {
				if (substr($key, 0, strlen($prefix))==$prefix) $key_is_allowable = false;
			}
			foreach ($this->add_fields as $predicate) {
				if ($key==$predicate) $key_is_allowable = false;
			}
			foreach ($this->relate_fields as $predicate) {
				if ($key==$predicate) $key_is_allowable = false;
			}
			if ($key_is_allowable) $save[$key] = $value;
		}

		return $save;
	}

	/**
	 *
	 * _do_relate relates a passed parent_id to the child specified in post data.  Call after parsing and cleaning.
	 * @param int $parent_id
	 */
	private function _do_relate($parent_id=0) {
		$save = array();
		$rel_meta = 'rel_'.$this->input->post('scalar:child_rel');
		if (isset($this->$rel_meta)) {
			foreach($this->$rel_meta as $idx) {
				if (isset($this->data['scalar:metadata:'.$idx])) {
					$save[$idx] = $this->data['scalar:metadata:'.$idx];  // TODO: remove me after migration
					unset($this->data['scalar:metadata:'.$idx]);
				} elseif (isset($this->data['scalar:'.$idx])) {
					$save[$idx] = $this->data['scalar:'.$idx];
					unset($this->data['scalar:'.$idx]);
				} else {
					$save[$idx] = null;
				}
			}
		}

		switch($this->data['scalar:child_rel']) {
			case 'annotated':
				$this->load->model('annotation_model', 'annotations');
				$this->annotations->save_children($parent_id, array($this->data['scalar:child_urn']), array($save['start_seconds']), array($save['end_seconds']), array($save['start_line_num']), array($save['end_line_num']), array($save['points']), array($save['position_3d']));
				break;
			case 'contained':
				$this->load->model('path_model', 'paths');
				$this->paths->save_children($parent_id, array($this->data['scalar:child_urn']), array($save['sort_number']));
				break;
			case 'referenced':
				$this->load->model('reference_model', 'references');
				$this->references->save_children($parent_id, array($this->data['scalar:child_urn']), array($save['reference_text']));
				break;
			case 'replied':
				$this->load->model('reply_model', 'replies');
				$this->replies->save_children($parent_id, array($this->data['scalar:child_urn']), array($save['paragraph_num']), array($save['datetime']));
				break;
			case 'tagged':
				$this->load->model('tag_model', 'tags');
				$this->tags->save_children($parent_id, array($this->data['scalar:child_urn']));
				break;
			case 'grouped':
				$this->load->model('lens_model', 'lenses');
				$this->lenses->save_children($parent_id, array($save['contents']));
				break;
		}

		return $parent_id;
	}

	private function _versions_copy_relations($old_version_id=0, $new_version_id=0, $exempt_types=array()) {

		$this->load->model('annotation_model', 'annotations');
		$this->load->model('path_model', 'paths');
		$this->load->model('tag_model', 'tags');
		$this->load->model('reply_model', 'replies');
		$this->load->model('reference_model', 'references');

		$rel_types = array_merge($this->config->item('rel'), $this->config->item('ref'));
		foreach ($rel_types as $rel_type) {
			if (in_array($rel_type, $exempt_types)) continue;
			switch($rel_type) {
				case 'annotations':
					$children = $this->annotations->get_children($old_version_id);
					foreach ($children as $child) {
						$this->annotations->save_children($new_version_id, array($child->child_version_id), array($child->start_seconds), array($child->end_seconds), array($child->start_line_num), array($child->end_line_num), array($child->points), array($child->position_3d));
					}
					$parents = $this->annotations->get_parents($old_version_id);
					foreach ($parents as $parent) {
						$this->annotations->save_parents($new_version_id, array($parent->parent_version_id), array($parent->start_seconds), array($parent->end_seconds), array($parent->start_line_num), array($parent->end_line_num), array($parent->points), array($parent->position_3d));
					}
					break;
				case 'paths':
					$children = $this->paths->get_children($old_version_id);
					foreach ($children as $child) {
						$this->paths->save_children($new_version_id, array($child->child_version_id), array($child->sort_number));
					}
					$parents = $this->paths->get_parents($old_version_id);
					foreach ($parents as $parent) {
						$this->paths->save_parents($new_version_id, array($parent->parent_version_id), array($parent->sort_number));
					}
					break;
				case 'tags':
					$children = $this->tags->get_children($old_version_id);
					foreach ($children as $child) {
						$this->tags->save_children($new_version_id, array($child->child_version_id));
					}
					$parents = $this->tags->get_parents($old_version_id);
					foreach ($parents as $parent) {
						$this->tags->save_parents($new_version_id, array($parent->parent_version_id));
					}
					break;
				case 'replies':
					$children = $this->replies->get_children($old_version_id);
					foreach ($children as $child) {
						$this->replies->save_children($new_version_id, array($child->child_version_id), array($child->paragraph_num), array($child->datetime));
					}
					$parents = $this->replies->get_parents($old_version_id);
					foreach ($parents as $parent) {
						$this->replies->save_parents($new_version_id, array($parent->parent_version_id), array($parent->paragraph_num), array($parent->datetime));
					}
					break;
				case 'references':
					$children = $this->references->get_children($old_version_id);
					foreach ($children as $child) {
						$this->references->save_children($new_version_id, array($child->child_version_id), array($child->reference_text));
					}
					$parents = $this->references->get_parents($old_version_id);
					foreach ($parents as $parent) {
						$this->references->save_parents($new_version_id, array($parent->parent_version_id), array($parent->reference_text));
					}
					break;
			}
 		}

	}

	private function _fill_user_session_data(){
		if($this->user){
			$this->data['email'] = $this->user->email;
			$this->data['api_key'] = $this->user->api_key;
		}
	}

	/**
	* Serialize an RDF structure (e.g, to RDF-XML or RDF-JSON)
	* TODO: Shared function with /rdf, move to model?
	*/
	private function _rdf_serialize($return, $prefix='') {

		if (empty($return)) $this->_output_error(StatusCodes::HTTP_INTERNAL_SERVER_ERROR, 'Attempting to serialize, the return value is empty');
		$output = array();
		foreach ($return as $key => $row) {
			foreach ($row as $field => $value) {
				if (substr($field, 0, 1)=='@') continue;
				$output[$key][fromNS($field, $this->ns)] = $value;
			}
		}
		return $this->rdf_store->serialize($output, $prefix, $this->data['format']);

	}

	/**
	 * Get TK Lables to the resources table if the feature is enabled
	 */
	private function _tklabels($book_id) {

		$enable = $this->config->item('enable_tklabels');
		if (empty($enable)) return null;
		$namespaces = $this->config->item('namespaces');
		if (!isset($namespaces['tk'])) return null;
		$this->load->model('resource_model', 'resources');

		$tklabels = $this->resources->get('tklabels_'.$book_id);
		if (!empty($tklabels)) $tklabels = unserialize($tklabels);

		return $tklabels;

	}

	/**
	 *
	 */
	private function _payload_to_auth_data() {

		$request_body = file_get_contents('php://input');
		if (empty($request_body)) return false;
		$json = json_decode($request_body, true);
		if (!$json) return false;
		if (!isset($json[0])) $json = array($json);

		// IIIF from the Semantic Annotation Tool
		if (isset($json[0]['@context']) && is_array($json[0]['@context']) && 'http://www.w3.org/ns/anno.jsonld' == $json[0]['@context'][0] && 'http://iiif.io/api/presentation/3/context.json' == $json[0]['@context'][1]) {
			$_POST['native'] = 'true';
			$_POST['action'] = 'ADD';
			if (isset($json[0]['service']) && isset($json[0]['service'][0]) && isset($json[0]['service'][0]['items'])) {
				$_POST["native"] = (isset($json[0]['service'][0]['items']['native']) && $json[0]['service'][0]['items']['native']) ? true : false;
				$_POST["id"] = (isset($json[0]['service'][0]['items']['id'])) ? $json[0]['service'][0]['items']['id'] : '';
				$_POST["api_key"] = (isset($json[0]['service'][0]['items']['api_key'])) ? $json[0]['service'][0]['items']['api_key'] : '';
				$_POST["action"] = (isset($json[0]['service'][0]['items']['action'])) ? strtoupper($json[0]['service'][0]['items']['action']) : '';
				$_POST["format"] = (isset($json[0]['service'][0]['items']['format'])) ? $json[0]['service'][0]['items']['format'] : 'json';
			}

		// OAC from Semantic Annotation Tool
		} elseif (isset($json[0]['@context']) && 'http://www.w3.org/ns/anno.jsonld' == $json[0]['@context']) {
			$_POST['native'] = 'true';
			$_POST['action'] = 'ADD';
			if (isset($json[0]['request']) && isset($json[0]['request']['items'])) {
				$_POST["native"] = (isset($json[0]['request']['items']['native'])) ? $json[0]['request']['items']['native'] : false;
				$_POST["id"] = (isset($json[0]['request']['items']['id'])) ? $json[0]['request']['items']['id'] : '';
				$_POST["api_key"] = (isset($json[0]['request']['items']['api_key'])) ? $json[0]['request']['items']['api_key'] : '';
				$_POST["action"] = (isset($json[0]['request']['items']['action'])) ? strtoupper($json[0]['request']['items']['action']) : '';
				$_POST["format"] = (isset($json[0]['request']['items']['format'])) ? $json[0]['request']['items']['format'] : 'json';
			}

		// Lens JSON
		} elseif (isset($json[0]['urn']) && 'urn:scalar:lens:' == substr($json[0]['urn'], 0, 16)) {
			$_POST['native'] = 'true';
			$_POST['action'] = 'RELATE';
		}

	}

	/**
	 *
	 */
	private function _payload_to_data($book=null) {

		$request_body = file_get_contents('php://input');
		if (empty($request_body)) return false;
		$json = json_decode($request_body, true);
		if (false === $json) return false;
		if (!isset($json[0])) $json = array($json);

		// IIIF from the Semantic Annotation Tool
		if (isset($json[0]['@context']) && is_array($json[0]['@context']) && 'http://www.w3.org/ns/anno.jsonld' == $json[0]['@context'][0] && 'http://iiif.io/api/presentation/3/context.json' == $json[0]['@context'][1]) {
			$this->load->model('annotation_model', 'annotations');
			$this->load->library('IIIF_Object','iiif_object');
			$annotations = $this->iiif_object->decode_annotations($json[0], $book);
			for ($j = 0; $j < count($annotations); $j++) {
				$_POST = $annotations[$j];
				$this->data = array();
				if ($annotations[$j]['action'] == 'add') {
					$this->add(false);
				} elseif ($annotations[$j]['action'] == 'delete') {
					$this->delete(false, false);
				} elseif ($annotations[$j]['action'] == 'update') {
					$arr = explode(':', $_POST['scalar:urn']);
					$parent_version_id = (int) array_pop($arr);
					$arr = explode(':', $_POST['scalar:child_urn']);
					$child_version_id = (int) array_pop($arr);
					$this->annotations->delete_relationship($parent_version_id, $child_version_id);  // Delete existing annotation relationship
					$this->relate(false);  // Create new annotation relationship
					$this->update(false);  // Update the annotation-page
					$new_version_id = (int) $this->data['version_id'];
					$this->_versions_copy_relations($parent_version_id, $new_version_id, array('tags'));  // Copy all relationships to new annotation-page
				}
				$this->save_data = $this->data;
				if ($annotations[$j]['action'] != 'delete') {
					$tags = $this->iiif_object->decode_tags($json[0], $book, $j, $this->data['version_id']);
					for ($k = 0; $k < count($tags); $k++) {
						$_POST = $tags[$k];
						$this->data = array();
						if ($tags[$k]['action'] == 'add') {
							$this->add(false);
						} else {
							$this->relate(false);
						}
					}
					$this->data = $this->save_data;
				}
				$this->_output();
				exit;  // There will only be one annotation to save
			}

		// OAC from Semantic Annotation Tool
		} elseif (isset($json[0]['@context']) && 'http://www.w3.org/ns/anno.jsonld' == $json[0]['@context']) {
			$this->load->library('OAC_Object','oac_object');
			$annotations = $this->oac_object->decode_annotations($json[0], $book);
			for ($j = 0; $j < count($annotations); $j++) {
				$_POST = $annotations[$j];
				$this->data = array();
				if ($annotations[$j]['action'] == 'add') {
					$this->add(false);
				} elseif ($annotations[$j]['action'] == 'update') {
					$this->update(false);
				}
				$this->save_data = $this->data;
				$tags = $this->oac_object->decode_tags($json[0], $book, $j, $this->data['version_id']);
				for ($k = 0; $k < count($tags); $k++) {
					$_POST = $tags[$k];
					$this->data = array();
					if ($tags[$k]['action'] == 'add') {
						$this->add(false);
					} else {
						$this->relate(false);
					}
				}
				$this->data = $this->save_data;
				$this->_output();
				exit;  // There will only be one annotation to save
			}

		// Lens JSON
		} elseif (isset($json[0]['urn']) && 'urn:scalar:lens:' == substr($json[0]['urn'], 0, 16)) {
			$this->load->model('lens_model', 'lenses');
			$_POST = array_merge($_POST, $this->lenses->decode($json[0], $book));
		}

	}
}

?>
