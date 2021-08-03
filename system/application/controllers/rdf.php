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
 * @projectDescription		RDF API controller for displaying RDF graphs based on REST (GET) queries
 * @return					On success outputs RDF-JSON or RDF-XML; errors are processed as HTTP response codes
 * @author					Craig Dietrich
 * @version					3.2
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
		$this->data['book'] = (!empty($this->scope)) ? $this->books->get_by_slug(no_edition($this->scope)) : null;
		if (empty($this->data['book'])) {  // Book couldn't be found
			$this->data['base_uri'] = confirm_slash(base_url());
		} else {  // Book was found
			$this->data['base_uri'] = confirm_slash(base_url()).confirm_slash($this->data['book']->slug);
			$this->set_user_book_perms();
			if (!$this->data['book']->url_is_public && !$this->login_is_book_admin('reader')) {
				header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
				exit;
			};
		}
		// Format (e.g., 'xml', 'json')
		$allowable_formats = array('xml'=>'xml', 'json'=>'json','rdfxml'=>'xml','rdfjson'=>'json','turtle'=>'turtle','jsonld'=>'jsonld','oac'=>'oac','iiif'=>'iiif');
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
		if (in_array('reference', $restrict) || in_array('references', $restrict)) $this->data['restrict'][] = 'references';
		// Include ARC tables ("Additional Metadata")?
		$this->data['include_meta'] = (isset($_REQUEST['meta']) && 0 === (int) $_REQUEST['meta']) ? false : true;
		$this->data['meta_recursion'] = (isset($_REQUEST['metarec']) && is_numeric($_REQUEST['metarec'])) ? (int) $_REQUEST['metarec']: null;
		if (is_int($this->data['meta_recursion'])) $this->data['include_meta'] = true;
		// Display all versions?
		$this->data['versions'] = (isset($_REQUEST['versions']) && $_REQUEST['versions']) ? true : false;
		if ($this->books->is_hide_versions($this->data['book']) && !$this->login_is_book_admin()) $this->data['versions'] = false;
		// Search terms
		$this->data['sq'] = (isset($_REQUEST['sq']) && !empty($_REQUEST['sq'])) ? search_split_terms($_REQUEST['sq']) : null;
		$this->data['s_all'] = (isset($_REQUEST['s_all']) && 1==$_REQUEST['s_all']) ? true : false;
		// Provenance
		$this->data['provenance'] = (isset($_REQUEST['prov']) && !empty($_REQUEST['prov'])) ? 1 : null;
		// Show tk:TKLabel nodes
		$this->data['tklabels'] = (isset($_REQUEST['tklabels']) && !empty($_REQUEST['tklabels'])) ? 1 : null;
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
		// Display all users regardless of list-in-index status?
		$this->data['u_all'] = (isset($_REQUEST['u_all']) && 1==$_REQUEST['u_all'] && $this->login_is_book_admin()) ? true : false;

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
										  	'u_all'	   => (($this->data['u_all'])?RDF_Object::USERS_ALL:RDF_Object::USERS_LISTED),
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
	 * Get pages based on queries of the semantic (ARC) tables
	 */
	
	public function query() {

		if (empty($this->data['book'])) {
			header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
			exit;
		}
		$this->set_url_params();
		$type = $category = null;
		$rel = RDF_Object::REL_CHILDREN_ONLY;
		$method = (isset($_REQUEST['method']) && !empty($_REQUEST['method'])) ? trim($_REQUEST['method']) : null;
		$field = (isset($_REQUEST['field']) && !empty($_REQUEST['field'])) ? trim($_REQUEST['field']) : null;
		if (empty($method)) {
			header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
			exit;
		} elseif (empty($field)) {
			header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
			exit;
		}
		$this->load->library('RDF_Store', 'rdf_store');
		switch ($method) {
			case 'hasPredicate':
				$content = $this->versions->get_by_predicate($this->data['book']->book_id, $field, $this->data['versions']);
				break;
			case 'objectLiteralContains':
				$value = (isset($_REQUEST['value']) && !empty($_REQUEST['value'])) ? trim($_REQUEST['value']) : null;
				if (empty($value)) {
					header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
					exit;
				}
				$content = $this->versions->get_by_predicate($this->data['book']->book_id, $field, $this->data['versions'], null, $value);
				break;
			case 'pagesDistanceFromPageInMeters':
				$value = (isset($_REQUEST['value']) && !empty($_REQUEST['value'])) ? (int) trim($_REQUEST['value']) : null;
				if (empty($value)) {
					header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
					exit;
				}
				$this->load->model( 'lens_model', 'lenses' );
				$content = $this->versions->get_by_predicate($this->data['book']->book_id, array('dcterms:spatial','dcterms:coverage'), $this->data['versions'], null);
				$item = $this->lenses->filter_by_slug($content, $field);
				if (!count($item)) {
					header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
					exit;
				}
				$latlng = $this->lenses->get_latlng_from_item($item[0]);
				$content = $this->lenses->filter_by_location($content, $latlng, $value);
				break;
			default:
				header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
				exit;
		}
		$this->rdf_object->index(
				$this->data['content'],
				array(
						'book'			=> $this->data['book'],
						'content'		=> $content,
						'base_uri'		=> $this->data['base_uri'],
						'use_versions' => $this->data['use_versions'],
						'use_versions_restriction' => ($this->editorial_is_on() && (null!==$this->data['url_params']['edition_index'] || !$this->login_is_book_admin())) ? RDF_OBJECT::USE_VERSIONS_EDITORIAL : RDF_OBJECT::USE_VERSIONS_INCLUSIVE,
						'method'		=> __FUNCTION__.'/'.$method.'/'.$field,
						'restrict'		=> $this->data['restrict'],
						'rel'			=> $rel,
						'sq'			=> $this->data['sq'],
						'versions'		=> (($this->data['versions'])?RDF_Object::VERSIONS_ALL:RDF_Object::VERSIONS_MOST_RECENT),
						'ref'			=> (($this->data['references'])?RDF_Object::REFERENCES_ALL:RDF_Object::REFERENCES_NONE),
						'prov'			=> (($this->data['provenance'])?RDF_Object::PROVENANCE_ALL:RDF_Object::PROVENANCE_NONE),
						'pagination'   => $this->data['pagination'],
						'max_recurses' => $this->data['recursion'],
						'meta'			=> $this->data['include_meta'],
						'max_meta_recs'=> $this->data['meta_recursion'],
						'paywall_msg'	=> $this->can_bypass_paywall(),
						'editorial_state' => ((isset($this->data['editorial_state']))?$this->data['editorial_state']:null),
						'tklabeldata'	=> $this->tklabels(),
						'tklabels' 	=> (($this->data['tklabels'])?RDF_Object::TKLABELS_ALL:RDF_Object::TKLABELS_NONE),
						'is_book_admin'=> $this->login_is_book_admin()
				)
		);
		$this->rdf_object->serialize($this->data['content'], $this->data['format']);
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
			switch ($this->data['format']) {
				case 'oac':
					$this->load->library( 'OAC_Object', 'oac_object' );
					$object = 'oac_object';
					break;
				case 'iiif':
					$this->load->library( 'IIIF_Object', 'iiif_object' );
					$object = 'iiif_object';
					break;
				default:
					$object = 'rdf_object';
			}
			$this->set_url_params();
			$this->data['slug'] = implode('/',array_slice(array_no_edition($this->uri->segments), array_search(__FUNCTION__, array_no_edition($this->uri->segments))));
			$this->data['slug']= str_replace($this->data['book']->slug.'/', '', $this->data['slug']);
			$content = $this->pages->get_by_slug($this->data['book']->book_id, $this->data['slug']);
			// Version being asked for
			if (!empty($this->data['url_params']['version_num'])) {
				if ($this->books->is_hide_versions($this->data['book']) && !$this->login_is_book_admin() && $this->pages->is_using_recent_version_id($this->data['book']->book_id)) {
					header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
					exit;
				}
				$version = $this->versions->get_by_version_num($content->content_id, $this->data['url_params']['version_num']);
				if (!empty($version) && null == $this->data['use_versions']) $this->data['use_versions'] = array();
				if (!empty($version)) $this->data['use_versions'][$content->content_id] = $version->version_id;
			}
			// Don't throw an error here if $content is empty, let through to return empty RDF
			if (!empty($content) && !$content->is_live && !$this->login_is_book_admin($this->data['book']->book_id) && $content->user != $this->data['login']->user_id) $content = null; // Protect
			$this->$object->index(
			 						   $this->data['content'],
									   array(
						                 'book'         => $this->data['book'],
						                 'content'      => $content,
									   	 'use_versions'	=> $this->data['use_versions'],
									   	 'use_versions_restriction' => ($this->editorial_is_on() && (null!==$this->data['url_params']['edition_index'] || !$this->login_is_book_admin())) ? RDF_OBJECT::USE_VERSIONS_EDITORIAL : RDF_OBJECT::USE_VERSIONS_INCLUSIVE,
						                 'base_uri'     => $this->data['base_uri'],
									   	 'method'		=> __FUNCTION__.'/'.$this->data['slug'],
				                         'restrict'     => $this->data['restrict'],
										 'versions'     => (($this->data['versions'])?RDF_Object::VERSIONS_ALL:RDF_Object::VERSIONS_MOST_RECENT),
									     'ref'          => (($this->data['references'])?RDF_Object::REFERENCES_ALL:RDF_Object::REFERENCES_NONE),
									     'prov'			=> (($this->data['provenance'])?RDF_Object::PROVENANCE_ALL:RDF_Object::PROVENANCE_NONE),
				                         'pagination'   => $this->data['pagination'],
				                         'max_recurses' => $this->data['recursion'],
									   	 'meta'			=> $this->data['include_meta'],
									   	 'max_meta_recs'=> $this->data['meta_recursion'],
									   	 'paywall_msg'	=> $this->can_bypass_paywall(),
									   	 'lens_recurses'=> (($this->can_save_lenses()) ? $this->data['recursion']: RDF_Object::LENSES_NONE),
									   	 'tklabeldata'	=> $this->tklabels(),
									   	 'tklabels' 	=> (($this->data['tklabels'])?RDF_Object::TKLABELS_ALL:RDF_Object::TKLABELS_NONE),
									   	 'is_book_admin'=> $this->login_is_book_admin()
									   )
			                        );
			$this->$object->serialize($this->data['content'], $this->data['format']);
		} catch (Exception $e) {
			header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_INTERNAL_SERVER_ERROR));
			exit;
		}
		$this->template->set_template('blank');
		$this->template->write_view('content', 'modules/data/'.$this->data['format'], $this->data);
		$this->template->render();

	}
	
	/**
	 * Output information about a media-page based on a file URL
	 */
	
	public function file() {

		if (empty($this->data['book'])) {
			header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
			exit;
		}
		try {
			switch ($this->data['format']) {
				case 'oac':
					$this->load->library( 'OAC_Object', 'oac_object' );
					$object = 'oac_object';
					break;
				case 'iiif':
					$this->load->library( 'IIIF_Object', 'iiif_object' );
					$object = 'iiif_object';
					break;
				default:
					$object = 'rdf_object';
			}
			$this->set_url_params();
			$this->data['url'] = implode('/',array_slice($this->uri->segments, array_search(__FUNCTION__, $this->uri->segments)));
			$this->data['url'] = trim(str_replace(':/', '://', $this->data['url']));  // Turns "https:/..." into "https://..."
			$content = $this->pages->get_by_version_url($this->data['book']->book_id, $this->data['url'], true);  // Could be an absolute or relative URL
			if (null == $content) {
				$this->data['url'] = trim(str_replace(' ', '%20', $this->data['url']));
				$content = $this->pages->get_by_version_url($this->data['book']->book_id, $this->data['url'], true);  // Try the URL with %20s
			}
			if (!empty($content)) {
				foreach ($content as $content_id => $row) {
					if (!$row->is_live && !$this->login_is_book_admin($this->data['book']->book_id)) {
						unset($content[$content_id]);  // Protect
					}
				}
				if (!$this->data['versions']) {
					foreach ($content as $content_id => $row) {
						$content[$content_id]->versions = array(array_shift($content[$content_id]->versions));  // Most recent version
					}
				}
			}
			$this->$object->index(
					$this->data['content'],
					array(
							'book'         => $this->data['book'],
							'content'      => $content,
							'use_versions'	=> $this->data['use_versions'],
							'use_versions_restriction' => ($this->editorial_is_on() && (null!==$this->data['url_params']['edition_index'] || !$this->login_is_book_admin())) ? RDF_OBJECT::USE_VERSIONS_EDITORIAL : RDF_OBJECT::USE_VERSIONS_INCLUSIVE,
							'base_uri'     => $this->data['base_uri'],
							'method'		=> __FUNCTION__.'/'.$this->data['url'],
							'restrict'     => $this->data['restrict'],
							'versions'     => (($this->data['versions'])?RDF_Object::VERSIONS_ALL:RDF_Object::VERSIONS_MOST_RECENT),
							'ref'          => (($this->data['references'])?RDF_Object::REFERENCES_ALL:RDF_Object::REFERENCES_NONE),
							'prov'			=> (($this->data['provenance'])?RDF_Object::PROVENANCE_ALL:RDF_Object::PROVENANCE_NONE),
							'pagination'   => $this->data['pagination'],
							'max_recurses' => $this->data['recursion'],
							'meta'			=> $this->data['include_meta'],
							'max_meta_recs' => $this->data['meta_recursion'],
							'paywall_msg'	=> $this->can_bypass_paywall(),
							'tklabeldata'	=> $this->tklabels(),
							'tklabels' 	=> (($this->data['tklabels'])?RDF_Object::TKLABELS_ALL:RDF_Object::TKLABELS_NONE),
							'is_book_admin'=> $this->login_is_book_admin()
					)
					);
			$this->$object->serialize($this->data['content'], $this->data['format']);
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
		if (empty($this->data['book'])) {
			header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
			exit;
		}
		try {
			$this->set_url_params();
			$class = strtolower(no_ext($class));
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
					$rel = RDF_Object::REL_ALL;
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
				case 'lens':
					$this->load->model($class.'_model', plural($class));
					$model = plural($class);
					break;
				case 'hidden':
					if (!$this->data['login'] || !$this->login_is_book_admin()) {
						header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
						exit;
					}
					$this->data['hidden'] = 1;
					$model = 'pages';
					break;
				default:
					$editorial_states = array('draft','edit','editreview','clean','ready','published');
					if ($this->can_editorial() && in_array($class, $editorial_states)) {
						$model = 'pages';
						$this->data['editorial_state'] = substr($class, 0);  // clone
					} else {
						header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
						exit;
					}
			}

			// If there is a search, this is a much speadier search only on title and description based on the presence of recent_version_id
			if (!empty($this->data['sq']) && 'pages'==$model && !$this->data['s_all']) {
				$content = $this->$model->search_with_recent_version_id($this->data['book']->book_id, $this->data['sq'], $type, (($this->data['hidden'])?false:true));
				if (!count($content) && !$this->$model->is_using_recent_version_id($this->data['book']->book_id)) {
					$content = $this->$model->get_all($this->data['book']->book_id, $type, $category, (($this->data['hidden'])?false:true));  // This is the same as the slow call below
				} else {
					$this->data['sq'] = null;
				}
			// All other gathering of content
			} else {
				$content = $this->$model->get_all(
					$this->data['book']->book_id, 
					$type, 
					$category, 
					(($this->data['hidden'])?false:true),
					(is_array($this->data['use_versions'])) ? array_keys($this->data['use_versions']) : null
				);
			}
			if ('hidden'==$class) {
				for ($j = count($content)-1; $j >= 0; $j--) {
					if ($content[$j]->is_live) unset($content[$j]);
				}
			}
			$this->rdf_object->index(
			                           $this->data['content'],
			                           array(
			                         	 'book'			=> $this->data['book'],
			                         	 'content'		=> $content,
			                         	 'base_uri'		=> $this->data['base_uri'],
			                           	 'use_versions' => $this->data['use_versions'],
			                           	 'use_versions_restriction' => ($this->editorial_is_on() && (null!==$this->data['url_params']['edition_index'] || !$this->login_is_book_admin())) ? RDF_OBJECT::USE_VERSIONS_EDITORIAL : RDF_OBJECT::USE_VERSIONS_INCLUSIVE,
			                           	 'method'		=> __FUNCTION__.'/'.$class,
			                         	 'restrict'		=> $this->data['restrict'],
			                         	 'rel'			=> $rel,
			                         	 'sq'			=> $this->data['sq'],
			                         	 'versions'		=> (($this->data['versions'])?RDF_Object::VERSIONS_ALL:RDF_Object::VERSIONS_MOST_RECENT),
			                         	 'ref'			=> (($this->data['references'])?RDF_Object::REFERENCES_ALL:RDF_Object::REFERENCES_NONE),
			                           	 'prov'			=> (($this->data['provenance'])?RDF_Object::PROVENANCE_ALL:RDF_Object::PROVENANCE_NONE),
			                         	 'pagination'   => $this->data['pagination'],
			                         	 'max_recurses' => $this->data['recursion'],
			                           	 'lens_recurses'=> (($this->can_save_lenses()) ? 0 : RDF_Object::LENSES_NONE),
			                           	 'meta'			=> $this->data['include_meta'],
			                           	 'max_meta_recs'=> $this->data['meta_recursion'],
			                             'paywall_msg'	=> $this->can_bypass_paywall(),
			                           	 'editorial_state' => ((isset($this->data['editorial_state']))?$this->data['editorial_state']:null),
			                           	 'tklabeldata'	=> $this->tklabels(),
			                           	 'tklabels' 	=> (($this->data['tklabels'])?RDF_Object::TKLABELS_ALL:RDF_Object::TKLABELS_NONE),
			                           	 'is_book_admin'=> $this->login_is_book_admin()
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
