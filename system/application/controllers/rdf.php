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
 * @projectDescription		RDF API controller for displaying RDF graphs based on REST (GET) queries
 * @return					On success outputs RDF-JSON or RDF-XML; errors are processed as HTTP response codes
 * @author					Craig Dietrich
 * @version					3.1
 */

class Rdf extends MY_Controller {

	/**
	 * URL information and load the current book
	 */

	public function __construct() {

		parent::__construct();
		$this->load->model( 'book_model', 'books' );
		$this->load->model( 'page_model', 'pages' );
		$this->load->model( 'version_model', 'versions' );
		$this->load->model( 'reference_model', 'references' );
		$this->load->model( 'annotation_model', 'annotations' );
		$this->load->model( 'path_model', 'paths' );
		$this->load->model( 'tag_model', 'tags' );
		$this->load->model( 'reply_model', 'replies' );
		$this->load->library( 'RDF_Object', 'rdf_object' );
		$this->load->library( 'statusCodes' );
		$this->load->helper( 'inflector' );
		$this->models = $this->config->item('rel');

		// Determine the current book being asked for (if applicable)
		$this->scope = (strtolower(get_class($this)) == strtolower($this->uri->segment('1'))) ? null : strtolower($this->uri->segment('1'));
		// Load book beind asked for (if applicable)
		$this->data['book'] = (!empty($this->scope)) ? $this->books->get_by_slug($this->scope) : null;
		if (empty($this->data['book'])) {  // Book couldn't be found
			$this->data['base_uri'] = confirm_slash(base_url());
		} else {  // Book was found
			$this->data['base_uri'] = confirm_slash(base_url()).confirm_slash($this->data['book']->slug);
			// Protect book; TODO: provide api_key authentication like api.php
			$this->set_user_book_perms();
			if (!$this->data['book']->url_is_public && !$this->login_is_book_admin('reader')) {
				header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
				exit;
			};
		}
		// Format (e.g., 'xml', 'json')
		$allowable_formats = array('xml'=>'xml', 'json'=>'json','rdfxml'=>'xml','rdfjson'=>'json','turtle'=>'turtle');
		$this->data['format'] = (isset($_REQUEST['format']) && array_key_exists($_REQUEST['format'],$allowable_formats)) ? $allowable_formats[$_REQUEST['format']] : $allowable_formats[key($allowable_formats)];
		$ext = get_ext($this->uri->uri_string());
		$this->data['format'] = (!empty($ext) && array_key_exists($ext,$allowable_formats)) ? $allowable_formats[$ext] : $this->data['format'];
		// Recursion level
		$this->data['recursion'] = (isset($_REQUEST['rec']) && is_numeric($_REQUEST['rec'])) ? (int) $_REQUEST['rec'] : 0;
		// Display references?
		$this->data['references'] = (isset($_REQUEST['ref']) && $_REQUEST['ref']) ? true : false;
		// Restrict relationships to a certain relationship or set of relationships (seperated by a comma)?
		$this->data['restrict'] = array();
		$restrict = (isset($_REQUEST['res']) && !empty($_REQUEST['res'])) ? explode(',',$_REQUEST['res']) : array();
		foreach ($restrict as $res) {
			if (!in_array(plural(strtolower($res)), $this->models)) continue;
			$this->data['restrict'][] = (string) plural(strtolower($res));
		}
		// Display all versions?
		$this->data['versions'] = (isset($_REQUEST['versions']) && $_REQUEST['versions']) ? true : false;
		// Search terms
		$this->data['sq'] = (isset($_REQUEST['sq']) && !empty($_REQUEST['sq'])) ? search_split_terms($_REQUEST['sq']) : null;
		$this->data['s_all'] = (isset($_REQUEST['s_all']) && 1==$_REQUEST['s_all']) ? true : false;
		// Provenance
		$this->data['provenance'] = (isset($_REQUEST['prov']) && !empty($_REQUEST['prov'])) ? 1 : null;
		// Show hidden content
		$this->data['hidden'] = (isset($_REQUEST['hidden']) && !empty($_REQUEST['hidden'])) ? (int) $_REQUEST['hidden'] : 0;
		$this->set_user_book_perms();
		if (!$this->data['login'] || !$this->login_is_book_admin()) $this->data['hidden'] = 0;
		// Pagination
		$start = (isset($_REQUEST['start'])) ? (int) $_REQUEST['start'] : null;
		$results = (isset($_REQUEST['results']) && !empty($_REQUEST['results'])) ? (int) $_REQUEST['results'] : null;
		if (empty($results)) $start = $results = null;
		$this->data['pagination'] = array();
		if (!empty($start)||$start===0) $this->data['pagination']['start'] = $start;
		if (!empty($results)) $this->data['pagination']['results'] = $results;

	}

	/**
	 * Output information about the system or book (depending on whether 'scope' is set)
	 */

	public function index() {

		try {
			if (empty($this->data['book'])) {
				$render_published = (isset($this->config->config['index_render_published']) && false === $this->config->config['index_render_published']) ? false : true;  // Config item was added later so if it's not present default to true
				$system = new stdClass;
				$system->type = 'system';
				$system->title = $this->lang->line('install_name');
				$this->rdf_object->system(
										    $this->data['content'],
										    array(
										  	  'content'  => $system,
										  	  'books'    => ($render_published) ? $this->books->get_all(null, true) : array(),
										  	  'base_uri' => $this->data['base_uri']
										    )
										 );
			} else {
				$contrib = $this->books->get_users($this->data['book']->book_id);
				if (function_exists('sort_contributors')) usort($contrib, 'sort_contributors');
				$this->rdf_object->book(
										  $this->data['content'],
										  array(
										    'book'     => $this->data['book'],
										  	'users'    => $contrib,
										  	'base_uri' => $this->data['base_uri']
										  )
									   );
			}
			$this->rdf_object->serialize($this->data['content'], $this->data['format']);
		} catch (Exception $e) {
			throw new Exception(StatusCodes::httpHeaderFor(StatusCodes::HTTP_INTERNAL_SERVER_ERROR));
		}
		$this->template->set_template('blank');
		$this->template->write_view('content', 'modules/data/'.$this->data['format'], $this->data);
		$this->template->render();

	}

	/**
	 * Output information about a page
	 */

	public function node() {

		if (empty($this->data['book'])) {
			header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
			exit;
		}
		try {
			$slug = implode('/',array_slice($this->uri->segments, array_search(__FUNCTION__, $this->uri->segments)));
			$slug = no_version(no_ext(str_replace($this->data['book']->slug.'/', '', $slug)));
			$content = $this->pages->get_by_slug($this->data['book']->book_id, $slug);
			// Don't throw an error here if $content is empty, let through to return empty RDF
			if (!empty($content) && !$content->is_live && !$this->login_is_book_admin($this->data['book']->book_id)) $content = null; // Protect
			$this->rdf_object->index(
			 						   $this->data['content'],
									   array(
						                 'book'         => $this->data['book'],
						                 'content'      => $content,
						                 'base_uri'     => $this->data['base_uri'],
									   	 'method'		=> __FUNCTION__.'/'.$slug,
				                         'restrict'     => $this->data['restrict'],
										 'versions'     => (($this->data['versions'])?RDF_Object::VERSIONS_ALL:RDF_Object::VERSIONS_MOST_RECENT),
									     'ref'          => (($this->data['references'])?RDF_Object::REFERENCES_ALL:RDF_Object::REFERENCES_NONE),
									     'prov'			=> (($this->data['provenance'])?RDF_Object::PROVENANCE_ALL:RDF_Object::PROVENANCE_NONE),
				                         'pagination'   => $this->data['pagination'],
				                         'max_recurses' => $this->data['recursion'],
									   	 'paywall_msg'	=> $this->can_bypass_paywall()
									   )
			                        );
			$this->rdf_object->serialize($this->data['content'], $this->data['format']);
		} catch (Exception $e) {
			header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_INTERNAL_SERVER_ERROR));
			exit;
		}
		$this->template->set_template('blank');
		$this->template->write_view('content', 'modules/data/'.$this->data['format'], $this->data);
		$this->template->render();

	}

	/**
	 * Output information about a group of pages based on class name
	 */

	public function instancesof($class='') {

		if ('system'==$class) return self::system();  // Built-in pages

		try {
			$class = no_ext($class);
			$type = $category = null;
			$rel = RDF_Object::REL_CHILDREN_ONLY;
			switch ($class) {
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
					$this->load->model($class.'_model', plural($class));
					$model = plural($class);
					break;
				default:
					header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
					exit;
			}

			// The much speadier search only on title and description based on the presence of recent_version_id
			if (!empty($this->data['sq']) && 'pages'==$model && !$this->data['s_all']) {
				$content = $this->$model->search_with_recent_version_id($this->data['book']->book_id, $this->data['sq'], $type, (($this->data['hidden'])?false:true));
				if (!count($content) && !$this->$model->is_using_recent_version_id($this->data['book']->book_id)) {
					$content = $this->$model->get_all($this->data['book']->book_id, $type, $category, (($this->data['hidden'])?false:true));  // This is the same as the slow call below
				} else {
					$this->data['sq'] = null;  // Versions already exist in successful recent_version_id search
				}
			// The much slower search on all fields including metadata
			} else {
				$content = $this->$model->get_all($this->data['book']->book_id, $type, $category, (($this->data['hidden'])?false:true));
			}
			$this->rdf_object->index(
			                         $this->data['content'],
			                           array(
			                         	 'book'			=> $this->data['book'],
			                         	 'content'		=> $content,
			                         	 'base_uri'		=> $this->data['base_uri'],
			                           	 'method'		=> __FUNCTION__.'/'.$class,
			                         	 'restrict'		=> $this->data['restrict'],
			                         	 'rel'			=> $rel,
			                         	 'sq'			=> $this->data['sq'], 
			                         	 'versions'		=> (($this->data['versions'])?RDF_Object::VERSIONS_ALL:RDF_Object::VERSIONS_MOST_RECENT),
			                         	 'ref'			=> (($this->data['references'])?RDF_Object::REFERENCES_ALL:RDF_Object::REFERENCES_NONE),
			                           	 'prov'			=> (($this->data['provenance'])?RDF_Object::PROVENANCE_ALL:RDF_Object::PROVENANCE_NONE),
			                         	 'pagination'   => $this->data['pagination'],
			                         	 'max_recurses' => $this->data['recursion'],
			                             'paywall_msg'	=> $this->can_bypass_paywall()
			                           )
			                        );
			$this->rdf_object->serialize($this->data['content'], $this->data['format']);
		} catch (Exception $e) {
			header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_INTERNAL_SERVER_ERROR));
			exit;
		}

		$this->template->set_template('blank');
		$this->template->write_view('content', 'modules/data/'.$this->data['format'], $this->data);
		$this->template->render();

	}

	private function system() {

		$content = $this->pages->built_in($this->data['book']->book_id, (($this->data['hidden'])?false:true));
		$settings = array(
			'book'         => $this->data['book'],
			'content'      => $content,
			'base_uri'     => $this->data['base_uri']
		);
		$this->data['content'] = $this->rdf_object->model_to_rdf($settings);
		$this->data['content'] = $this->rdf_object->serialize($this->data['content'], $this->data['format']);

		$this->template->set_template('blank');
		$this->template->write_view('content', 'modules/data/'.$this->data['format'], $this->data);
		$this->template->render();

	}

}
?>
