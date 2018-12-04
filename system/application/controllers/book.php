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
 * @projectDescription		Book controller for outputting the HTML for Scalar's front-end
 * @author					Craig Dietrich
 * @version					2.6
 */

function sortSearchResults($a, $b) {
	$x = strtolower($a->versions[key($a->versions)]->title);
	$y = strtolower($b->versions[key($a->versions)]->title);
    return strcmp($x, $y);
}

class Book extends MY_Controller {

	protected $template_has_rendered = false;
	private $models = array('annotations', 'paths', 'tags', 'replies', 'references');
	private $rel_fields = array('start_seconds','end_seconds','start_line_num','end_line_num','points','datetime','paragraph_num');
	private $vis_views = array('vis', 'visindex', 'vispath', 'vismedia', 'vistag');
	private $fallback_melon = 'cantaloupe';  // This is independant of the default melon set in the config, which is used for new book creation
	private $max_recursions = 2;  // Get relationships of the current page, and the relationships of those relationships (e.g., get this pages tags, and the pages those tags tag)

	/**
	 * Load the current book
	 */

	public function __construct() {

		parent::__construct();
		$this->load->model('book_model', 'books');
		$this->load->model('page_model', 'pages');
		$this->load->model('version_model', 'versions');
		$this->load->model('annotation_model', 'annotations');
		$this->load->model('path_model', 'paths');
		$this->load->model('tag_model', 'tags');
		$this->load->model('reply_model', 'replies');
		$this->load->model('reference_model', 'references');
		$this->load->library('SendMail', 'sendmail');
		$this->load->library('RDF_Object', 'rdf_object');
		$this->load->library('statusCodes');
		$this->load->helper('inflector');

		$this->data['book'] = $this->data['page'] = null;
		// Book being asked for
		$this->scope = strtolower($this->uri->segment('1'));
		$this->data['book'] = (!empty($this->scope)) ? $this->books->get_by_slug(no_edition($this->scope)) : null;
		if (empty($this->data['book'])) show_404();	// Book couldn't be found
		$this->set_user_book_perms();
		if (!$this->data['book']->url_is_public && !$this->login_is_book_admin('reader')) {  // Protect book
			if ($this->data['login']->is_logged_in) {
				$this->no_permissions();
			} else {
				$this->require_login(1);
			}
		}
		// Authors
		$this->data['book']->contributors = $this->books->get_users($this->data['book']->book_id);
		// Table of contents
		$this->data['book']->versions = $this->books->get_book_versions($this->data['book']->book_id, true); // TOC
		// Melon (skin)
		$this->data['melon'] = $this->config->item('active_melon');
		if (!$this->melon_exists($this->data['melon'])) $this->data['melon'] = null;
		if (isset($_GET['m']) && $this->melon_exists($_GET['m'])) {
			$this->data['melon'] = $_GET['m'];
		} elseif ($this->melon_exists($this->data['book']->template)) {
			$this->data['melon'] = $this->data['book']->template;
		}
		if (empty($this->data['melon'])) $this->data['melon'] = $this->fallback_melon;
		$this->load_melon_config($this->data['melon']);
		// Init
		$this->data['views'] = $this->config->item('views');
		$this->data['media_views'] = $this->config->item('media_views');
		$this->data['view'] = key($this->data['views']);
		$this->data['models'] = $this->models;
		$this->data['mode'] = null; // e.g., "editing"
		$this->data['can_edit'] = $this->login_is_book_admin('reviewer');
		//$this->data['use_proxy'] = $this->config->item('is_https') ? true : false;
		$this->data['use_proxy'] = false;  // The proxy is a work-in-progress solution for installs running SSL, which disrupts third-party plugins

	}

	/**
	 * Load the current page
	 */

	public function _remap() {
		
		try {
			$this->set_url_params();
			if ('login_status'==$this->data['url_params']['page_first_segment']) return $this->login_status();  // Ajax login check
			// Load page based on slug
			$page = $this->pages->get_by_slug($this->data['book']->book_id, $this->data['slug']);
			if ($page && !$page->is_live) $this->protect_book('Reader');
			$page_not_found = false;
			if (!empty($page)) {
				// Version being asked for
				if (null !== $this->data['url_params']['version_num']) {
					$version = $this->versions->get_by_version_num($page->content_id, $this->data['url_params']['version_num']);
					if (!empty($version) && null == $this->data['use_versions']) $this->data['use_versions'] = array();
					if (!empty($version)) $this->data['use_versions'][$page->content_id] = $version->version_id;
				}
				// Build (hierarchical) RDF object for the page's version(s)
				$settings = array(
								 	'book'         => $this->data['book'],
									'content'      => $page,
									'use_versions' => $this->data['use_versions'],
									'use_versions_restriction' => ($this->editorial_is_on() && (null!==$this->data['url_params']['edition_index'] || !$this->login_is_book_admin())) ? RDF_OBJECT::USE_VERSIONS_EDITORIAL : RDF_OBJECT::USE_VERSIONS_INCLUSIVE,
									'base_uri'     => $this->data['base_uri'],
									'versions'     => RDF_Object::VERSIONS_MOST_RECENT,
									'ref'          => RDF_Object::REFERENCES_ALL,
									'prov'		   => RDF_Object::PROVENANCE_ALL,
							  		'max_recurses' => $this->max_recursions,
									'tklabeldata'  => $this->tklabels(),
									'tklabels' 	   => RDF_Object::TKLABELS_ALL,
									'is_book_admin'=> $this->login_is_book_admin()
								 );
				$index = $this->rdf_object->index($settings);
				if (null !== $index) {
				    if (is_array($index) && !count($index)) throw new Exception('Problem getting page index');
				    $this->data['page'] = $index[0];
				    unset($index);
					// Paywall
					if (isset($page->paywall) && $page->paywall) $this->paywall();
					// If a media page, overwrite the views with the media_views if applicable
					if ('media'==$this->data['page']->type && !empty($this->data['media_views'])) $this->data['views'] = $this->data['media_views'];
					// Set the view based on the page's default view
					$default_view = $this->data['page']->versions[$this->data['page']->version_index]->default_view;
					if (array_key_exists($default_view, $this->data['views'])) $this->data['view'] = $default_view;
				} else {
					$page_not_found = true;
				}
			} else {
				$page_not_found = true;
			}
			
			// View methods
			if (array_key_exists(get_ext($this->uri->uri_string()), $this->data['views'])) $this->data['view'] = get_ext($this->uri->uri_string());
			if (in_array($this->data['view'], $this->vis_views)) {
				$this->data['viz_view'] = $this->data['view'];  // Keep a record of the specific viz view being asked for
				$this->data['view'] = $this->vis_views[0];  // There's only one viz page (Javascript handles the specific viz types)
			}
			$method_name = $this->data['view'];
			if (method_exists($this, $method_name)) $this->$method_name();
			if (method_exists($this, $this->data['url_params']['page_first_segment']) && !array_key_exists($this->data['url_params']['page_first_segment'], $this->data['views'])) {
				$page_not_found = false;
				$method = $this->data['url_params']['page_first_segment'];
				$this->$method();
			}

			if ($page_not_found) {
				header("HTTP/1.1 404 Not Found");
			}

		} catch (Exception $e) {
			header($e->getMessage());
			exit;
		}

		// Placeholder for ThoughtMesh plugin
		if (!isset($this->data['plugins'])) $this->data['plugins'] = array();
		$path = APPPATH.'plugins/thoughtmesh_pi.php';
		if (file_exists($path) && (stristr($this->data['book']->title, 'data-thoughtmesh="true"'))) {
			require_once($path);
			$this->data['plugins']['thoughtmesh'] = new ThoughtMesh($this->data);
		}

		if ($this->template_has_rendered) return;  // Template might be rendered in one of the methods below
		$this->template->set_template($this->config->item('arbor'));
		foreach ($this->template->template['regions'] as $region) {
			$this->template->write_view($region, 'melons/'.$this->data['melon'].'/'.$region, $this->data);
		}
		$this->template->render();

	}

	// Return logged in status in JSON format
	private function login_status() {

		header('Content-type: application/json');
		if ($this->data['login']->is_logged_in) {
			echo '{"is_logged_in":1,"is_author":'.(($this->login_is_book_admin())?'1':'0').',"user_id":'.$this->data['login']->user_id.',"fullname":"'.htmlspecialchars($this->data['login']->fullname).'"}';
			exit;
		} else {
			die('{"is_logged_in":0}');
		}

	}

	// Proxy (e.g., for non-SSL content on SSL servers
	private function proxy() {

		if (!$this->data['use_proxy']) die('{"error":"Proxy is disabled"}');
		$path = APPPATH.'libraries/miniproxy/miniproxy.php';
		if (!file_exists($path)) die('{"error":"Could not find proxy library"}');
		if (empty($_GET)) die('{"error":"Invalid proxy input"}');
		require($path);
		exit;

	}

	// Save a comment (an anonymous new page) with ReCAPTCHA check (not logged in) or authentication check (logged in)
	// This is a special case; we didn't want to corrupt the security of the Save API and its native (session) vs non-native (api_key) authentication
	private function save_anonymous_comment() {

		header('Content-type: application/json');
		$return = array('error'=>'');

		// Validate
		try {

			if (!isset($_POST['action'])||'add'!=strtolower($_POST['action'])) throw new Exception('Invalid action');

			// Either logged in or not
			$child_urn   =@ trim($_POST['scalar:child_urn']);
			$title       =@ trim($_POST['dcterms:title']);
			$description =@ trim($_POST['dcterms:description']);
			$content     =@ trim($_POST['sioc:content']);
			$user_id     =@ (int) trim($_POST['user']);

			if (empty($child_urn)) throw new Exception('Could not determine child URN');
			if (empty($title)) throw new Exception('Comment title is a required field');
			if (empty($content)) throw new Exception('Content is a required field');

			// Not logged in
			if (empty($user_id)) {
				$fullname  =@ trim($_POST['fullname']);
				if (empty($fullname)) throw new Exception('Your name is a required field');
				// ReCAPTCHA version 1
				$recaptcha_public_key = $this->config->item('recaptcha_public_key');
				$recaptcha_private_key = $this->config->item('recaptcha_private_key');
				if (empty($recaptcha_public_key)||empty($recaptcha_private_key)) $recaptcha_public_key = $recaptcha_private_key = null;
				// ReCAPTCHA version 2
				$recaptcha2_site_key = $this->config->item('recaptcha2_site_key');
				$recaptcha2_secret_key = $this->config->item('recaptcha2_secret_key');
				if (empty($recaptcha2_site_key)||empty($recaptcha2_secret_key)) $recaptcha2_site_key = $recaptcha2_secret_key = null;
		    	// Choose one or the other
		    	if (!empty($recaptcha2_site_key)) {
		    		require_once(APPPATH.'libraries/recaptcha2/autoload.php');
		    	} elseif (!empty($recaptcha_public_key)) {
		    		require_once(APPPATH.'libraries/recaptcha/recaptchalib.php');
		    	}
				// Check CAPTCHA
				if (!empty($recaptcha2_site_key)) {
					if (!isset($_POST['g-recaptcha-response'])) throw new Exception('Invalid ReCAPTCHA form field');
					$recaptcha = new \ReCaptcha\ReCaptcha($recaptcha2_secret_key);
					$resp = $recaptcha->verify($_POST['g-recaptcha-response'], $_SERVER['REMOTE_ADDR']);
					if ($resp->isSuccess()):
						// Success
					else:
		            	throw new Exception('CAPTCHA did not validate');
					endif;
		    	} elseif (!empty($recaptcha_private_key)) {
					$resp = recaptcha_check_answer($recaptcha_private_key, $_SERVER["REMOTE_ADDR"], $_POST["recaptcha_challenge_field"], $_POST["recaptcha_response_field"]);
					if (!$resp->is_valid) throw new Exception ('Incorrect CAPTCHA value');
				}

			// Logged in
			// Note that we're not saving the user as the creator of the page but rather fullname to the attribution field
			} else {
 				$user = $this->users->get_by_user_id($user_id);
 				if (!$user) throw new Exception('Could not find user');
 				if ($user->user_id != $this->data['login']->user_id) throw new Exception('Could not match your user ID with your login session.  You could be logged out.');
 				$fullname = $user->fullname;
 				if (empty($fullname)) throw new Exception('Logged in user does not have a name');
			}

			// Save page
			$save = array();
			$save['book_id'] = $this->data['book']->book_id;
			$save['user_id'] = $user_id;
			$save['title'] = $title;  // for creating slug
			$save['type'] = 'composite';
			$save['is_live'] = $this->books->is_auto_approve($this->data['book']);
			$content_id = $this->pages->create($save);
			if (empty($content_id)) throw new Exception('Could not save the new content');

			// Save version
			$save = array();
			$save['user_id'] = $user_id;
			$save['title'] = $title;
			$save['description'] = '';
			$save['content'] = $content;
			$save['attribution'] = $this->versions->build_attribution($fullname, $this->input->server('REMOTE_ADDR'));
			$version_id = $this->versions->create($content_id, $save);
			if (empty($version_id)) throw new Exception('Could not save the new version');  // TODO: delete prev made content

			// Save relation
			if (!$this->replies->save_children($version_id, array($child_urn), array(0))) throw new Exception('Could not save relation');  // TODO: delete prev made content and version
			// I suppose we could get the newly created node and output as RDF-JSON to sync with the save API return, but since this is a special case anyways...

			// Email authors
			if ($this->books->is_email_authors($this->data['book'])) {
				$this->sendmail->new_comment($this->data['book'], $save, $this->books->is_auto_approve($this->data['book']));
			}

		} catch (Exception $e) {
			$return['error'] =  $e->getMessage();
		}

		$return['moderated'] = ($this->books->is_auto_approve($this->data['book'])) ? 0 : 1;
		echo json_encode($return);
		exit;

	}

	// Tags (list all tags in cloud)
	private function tags() {

		if (strlen($this->uri->segment(3))) return;
		if ($this->data['mode'] == 'editing') return;
		$this->data['book_tags'] = $this->tags->get_all($this->data['book']->book_id, null, null, true);  // TODO: editions
		for ($j = 0; $j < count($this->data['book_tags']); $j++) {
			$this->data['book_tags'][$j]->versions = array();
			$this->data['book_tags'][$j]->versions[0] = $this->versions->get_single($this->data['book_tags'][$j]->content_id, $this->data['book_tags'][$j]->recent_version_id);
			$this->data['book_tags'][$j]->versions[0]->tag_of = $this->tags->get_children($this->data['book_tags'][$j]->versions[0]->version_id);
		}
		$this->data['login_is_author'] = $this->login_is_book_admin();
		$this->data['view'] = __FUNCTION__;

	}

	// Resources (list of all pages|media)
	private function resources() {

		if ('vis'==$this->data['view']) return;
		if ($this->data['mode'] == 'editing') return;
		$this->data['book_content'] = $this->pages->get_all($this->data['book']->book_id, null, null, true);
		for ($j = 0; $j < count($this->data['book_content']); $j++) {
			$this->data['book_content'][$j]->versions = array();
			$this->data['book_content'][$j]->versions[0] = $this->versions->get_single($this->data['book_content'][$j]->content_id, $this->data['book_content'][$j]->recent_version_id);
		}
		$this->data['login_is_author'] = $this->login_is_book_admin();
		$this->data['view'] = __FUNCTION__;

	}

	// Table of contents (designed by each books' authors)
	private function toc() {

		if ($this->data['mode'] == 'editing') return;
		$this->data['book_versions'] = $this->books->get_book_versions($this->data['book']->book_id, true);
		$this->data['login_is_author'] = $this->login_is_book_admin();
		$this->data['view'] = __FUNCTION__;

	}

	// Search page
	private function search() {

		$this->load->helper('text');
		$this->data['can_edit'] = false;
		$this->data['sq'] =@ $_GET['sq'];;
		$this->data['terms'] = search_split_terms($this->data['sq']);
		$this->data['result'] = $this->pages->search($this->data['book']->book_id, $this->data['terms']);
		usort($this->data['result'], "sortSearchResults");
		$this->data['view'] = __FUNCTION__;

	}

	// Place an external page in an iframe with Scalar header
	private function external() {

		$this->data['link'] = (@!empty($_GET['link'])) ? $_GET['link'] : null;
		$this->data['prev'] = (@!empty($_GET['prev'])) ? $_GET['prev'] : null;

		// Check to make sure URLs have a valid host
		if ((filter_var($this->data['prev'],FILTER_VALIDATE_URL,FILTER_FLAG_HOST_REQUIRED) === FALSE) || (filter_var($this->data['link'],FILTER_VALIDATE_URL,FILTER_FLAG_HOST_REQUIRED) === FALSE)) {
			$this->kickout();
		}
		
		// Prevent MailTo and other non-standard URIs
		$linkParts = parse_url($this->data['link']);
		$prevParts = parse_url($this->data['prev']);
		if (($linkParts['scheme'] != 'http' && $linkParts['scheme'] != 'https') || ($prevParts['scheme'] != 'http' && $prevParts['scheme'] != 'https')) {
			$this->kickout();
		}
		
		// Strip any remaining HTML tags out of the URLs
		$this->data['link'] = htmlspecialchars(filter_var(strip_tags($this->data['link']),FILTER_SANITIZE_URL));
		$this->data['prev'] = htmlspecialchars(filter_var(strip_tags($this->data['prev']),FILTER_SANITIZE_URL));
		if (empty($this->data['link']) || empty($this->data['prev'])) $this->kickout();
		if (!stristr($this->data['prev'], base_url())) $this->kickout();

		// Make sure the link is contained in the text body of the prev page
		$slug = str_replace(base_url().$this->data['book']->slug.'/', '', abs_url(no_edition($this->data['prev']),base_url()));
		if (strpos($slug, '?')) $slug = substr($slug, 0, strpos($slug, '?'));
		$page = $this->pages->get_by_slug($this->data['book']->book_id, $slug);
		if (empty($page)) $this->kickout();
		$contents = $this->versions->get_all_page_contents($page->content_id);
		$has_link = false;
		foreach ($contents as $content) {
			if (stristr($content, $this->data['link'])) {
				$has_link = true;
				break;
			}
		}
		if (!$has_link) $this->kickout();

		// Bypass if configured to do so... the front-end shouldn't be pointing to /external at all, though, if setting is true
		if (true === $this->config->item('external_direct_hyperlink')) {
			header('Location: '.$this->data['link']);
			exit;
		}
		
		// Special case known domains that don't allow iframes from local_settings.php
		foreach ($this->config->item('iframe_redlist') as $forbidden) {
			if (stristr($this->data['link'], $forbidden)) {
				header('Location: '.$this->data['link']);
				exit;
			}
		}

		// Proxy non-SSL content if the proxy is enabled and the URL is non-SSL
		if ($this->data['use_proxy']) {
			if ('http'==substr($this->data['link'],0,4) && 'https'!=substr($this->data['link'],0,5)) {
				$this->data['link'] = base_url().$this->data['book']->slug.'/proxy?'.$this->data['link'];
			}
		}

		$this->template->set_template('external');
		$this->template->write_view('content', 'melons/'.$this->data['melon'].'/external', $this->data);
		$this->template->render();
		$this->template_has_rendered = true;

	}

	// Import from an external archive
	private function import() {

		if (!$this->login_is_book_admin('Commentator')) $this->require_login(4);

		// Set params
		$archive = no_ext($this->uri->segment(3));
		$this->data['hide_edit_bar'] = true;

		switch ($archive) {

			case false:

				$this->data['plugins'] = array();
				$path = APPPATH.'plugins/tensor_pi.php';
				if (file_exists($path)) {
					require_once($path);
					$this->data['plugins']['tensor'] = new Tensor($this->data);
				}
				$this->data['view'] = __FUNCTION__;
				break;

			case 'system':

				// Import from another Scalar book on the same install
				$this->data['view'] = 'import_system';
				break;

			default:

				// Translate the import URL to information about the archive
				$archive_title = str_replace('_',' ',$archive);
				$archives_rdf_url = confirm_slash(APPPATH).'rdf/xsl/archives.rdf';
				$archives_rdf = file_get_contents($archives_rdf_url);
				$archives_rdf = str_replace('{$base_url}', confirm_slash($this->data['app_root']), $archives_rdf);
				$archives =  $this->rdf_store->parse($archives_rdf);
				$found = array();
				foreach ($archives as $archive_uri => $archive) {
					$title = $archive['http://purl.org/dc/elements/1.1/title'][0]['value'];
					$identifier =@ $archive['http://purl.org/dc/terms/identifier'][0]['value'];
					if (strtolower($title) == strtolower($archive_title)) $found[$archive_uri] = $archive;
					if (!isset($found[$archive_uri]) && strtolower($identifier) == strtolower($archive_title)) $found[$archive_uri] = $archive;
				}
				if (!$found) die('Could not find archive');
				$this->data['external'] = $this->rdf_store->helper($found);

				// API key from config if applicable
				$id = $this->data['external']->getPropValue('http://purl.org/dc/terms/identifier');
				if (empty($id)) $id = $this->data['external']->getPropValue('http://purl.org/dc/elements/1.1/title');
				$id = str_replace(' ', '_', strtolower($id));
				$archive_api_key = $this->config->item($id.'_key');
				if (empty($archive_api_key)) $archive_api_key = $this->config->item($id.'_id');
				$this->data['archive_api_key'] = (!empty($archive_api_key)) ? trim($archive_api_key) : null;
				$this->data['view'] = __FUNCTION__;
				$this->data['tklabels'] = $this->tklabels();

		}

	}

	// Special import + upload page just for Critical Commons
	private function criticalcommons() {

		if (!$this->login_is_book_admin('Commentator')) $this->require_login(4);

		// Set params
		$this->data['hide_edit_bar'] = true;
		$this->data['view'] = 'criticalcommons';
		$this->data['slug'] = substr($_SERVER['REQUEST_URI'], strrpos($_SERVER['REQUEST_URI'],'/')+1);
		if (strpos($this->data['slug'],'?')) $this->data['slug'] = substr($this->data['slug'], 0, strpos($this->data['slug'],'?'));
		if (empty($this->data['slug']) || 'criticalcommons'==$this->data['slug']) $this->data['slug'] = null;
		
		if ('/result'==substr(uri_string(), -7)) {
			$this->data['redirect_to'] = $_SERVER['QUERY_STRING'];
			$this->data['filename'] = '';
			if (strpos($this->data['redirect_to'], '&filename=')) {
				$this->data['filename'] = substr($this->data['redirect_to'], strpos($this->data['redirect_to'], '&filename=')+10);
				$this->data['redirect_to'] = substr($this->data['redirect_to'], 0, strpos($this->data['redirect_to'], '&filename='));
			}
			echo '<script>'."\n";
			echo 'var redirect_to="'.$this->data['redirect_to'].'";'."\n";
			echo 'var filename="'.str_replace('"', '\"', $this->data['filename']).'";'."\n";
			echo 'window.parent.has_redirected(redirect_to, filename);'."\n";
			echo '</script>'."\n";
			$this->template_has_rendered = true;
		}

	}

	// Upload a file and create its thumbnail
	// This uploads a file only and returns its URL; all other operations to create a media page are through the Save API
	private function upload() {

		$this->load->library('File_Upload', 'file_upload');

		$action = (isset($_POST['action'])) ? strtolower($_POST['action']) : null;
		$chmod_mode = $this->config->item('chmod_mode');
		if (empty($chmod_mode)) $chmod_mode = 0777;

		if (!$this->login_is_book_admin('Commentator')) {
			if ($action == 'add') {
				echo json_encode( array('error'=>'Not logged in or not an author') );
			} else {
				$this->require_login(4);
			}
			exit;
		};

		$this->data['view'] = __FUNCTION__;

		if (empty($_FILES) && empty($_POST) && isset($_SERVER['REQUEST_METHOD']) && 'post'==strtolower($_SERVER['REQUEST_METHOD'])) {

			echo json_encode( array('error'=>'The file is larger than the server\'s max upload size') );
			exit;

		} elseif ($action == 'add' || $action == 'replace') {

			$return = array();

			try {
	            $slug = confirm_slash($this->data['book']->slug);
				$url = $this->file_upload->uploadMedia($slug, $chmod_mode, $this->versions);
				$path = confirm_slash(FCPATH).confirm_slash($this->data['book']->slug).$url;
				$thumbUrl = $this->file_upload->createMediaThumb($slug, $url, $chmod_mode);
			} catch (Exception $e) {
				$return['error'] =  $e->getMessage();
				echo json_encode($return);
				exit;
			}

			try {
				$this->load->library('Image_Metadata', 'image_metadata');
				$return[$url] = $this->image_metadata->get($path, Image_Metadata::FORMAT_NS);
			} catch (Exception $e) {
				// Don't throw exception since this isn't critical
			}

			if (false!==$thumbUrl) {
				$return[$url]['scalar:thumbnail'] = (strstr($thumbUrl,'//')) ? $thumbUrl : confirm_slash(base_url()).$slug.$thumbUrl;
			}
			echo json_encode($return);
			exit;

		} // if
		
		$this->data['book_media'] = $this->pages->get_all($this->data['book']->book_id, 'media', null, false);  // List of media pages
		$to_remove = array();
		for ($j = 0; $j < count($this->data['book_media']); $j++) {
			$this->data['book_media'][$j]->versions = array();
			$this->data['book_media'][$j]->versions[0] = $this->versions->get_single($this->data['book_media'][$j]->content_id, $this->data['book_media'][$j]->recent_version_id);
		}
		$this->data['tklabels'] = $this->tklabels();

	}

	// Upload a thumbnail
	// This uploads a file only and returns its URL; all other operations to create a media page are through the Save API
	private function upload_thumb() {

		$browser_redirect_to = base_url().$this->data['book']->slug.'/upload';
		$this->load->library('File_Upload', 'file_upload');
		$action = (isset($_POST['action'])) ? strtolower($_POST['action']) : null;
		$chmod_mode = $this->config->item('chmod_mode');
		if (empty($chmod_mode)) $chmod_mode = 0777;

		if (!$this->login_is_book_admin()) {
			header('Location: '.$browser_redirect_to);
			exit;
		}

		if (empty($_FILES) && empty($_POST) && isset($_SERVER['REQUEST_METHOD']) && 'post'==strtolower($_SERVER['REQUEST_METHOD'])) {

			echo json_encode( array('error'=>'The file is larger than the server\'s max upload size') );
			exit;

		} elseif ($action == 'add' || $action == 'update') {

			$return = array();
			try {
	            $slug = confirm_slash($this->data['book']->slug);
				$thumbUrl = $this->file_upload->uploadPageThumb($slug, $chmod_mode);
				if (false===$thumbUrl) throw new Exception ('Something went wrong creating a thumbnail from the file upload');
				$return['scalar:thumbnail'] = confirm_slash(base_url()).$slug.$thumbUrl;
			} catch (Exception $e) {
				$return['error'] =  $e->getMessage();
				echo json_encode($return);
				exit;
			}
			echo json_encode($return);
			exit;

		} // if

		header('Location: '.$browser_redirect_to);
		exit;

	}

	// List versions of the current page
	private function versions() {

		if (!isset($this->data['page'])) $this->fallback();
		$this->data['hide_versions'] = $this->books->is_hide_versions($this->data['book']);
		if ($this->data['hide_versions'] && !$this->login_is_book_admin()) $this->fallback();
		
		$action = (isset($_REQUEST['action']) && !empty($_REQUEST['action'])) ? $_REQUEST['action'] : null;
		if ($action == 'do_delete_versions') {
			$this->load->model('version_model', 'versions');
			// Check persmissions
			if (!$this->data['login_is_super'] && !$this->login_is_book_admin('Reviewer')) $this->require_login(4);
			// Delete versions
			$versions = (array) $_POST['delete_version'];
			if (empty($versions)) die('Could not find versions to delete');
			foreach ($versions as $version_id) {
				$this->versions->delete($version_id);
			}
			$redirect_to = $this->data['base_uri'].$this->data['page']->slug.'.versions?action=deleted_versions';
			header('Location: '.$redirect_to);
			exit;
		} elseif ($action == 'do_reorder_versions') {
			if (!$this->data['login_is_super'] && !$this->login_is_book_admin('Reviewer')) $this->require_login(4);
			$content_id = (int) $this->data['page']->content_id;
			if (empty($content_id)) die('Could not resolve content ID');
			$this->versions->reorder_versions($content_id);
			$redirect_to = $this->data['base_uri'].$this->data['page']->slug.'.versions?action=versions_reordered';
			header('Location: '.$redirect_to);
			exit;
		}		

		// Overwrite previous page array (which only has the most recent version)
		$this->data['page']->user = (int) $this->data['page']->user->user_id;
		unset($this->data['page']->versions);
		$settings = array(
							'book'         => $this->data['book'],
							'content'      => array($this->data['page']),
							'base_uri'     => $this->data['base_uri'],
							'versions'     => RDF_Object::VERSIONS_ALL,
							'ref'          => RDF_Object::REFERENCES_NONE,
							'prov'		   => RDF_Object::PROVENANCE_ALL,
							'max_recurses' => 0,
							'use_versions' => $this->data['use_versions'],
							'use_versions_restriction' => ($this->editorial_is_on() && (null!==$this->data['url_params']['edition_index'] || !$this->login_is_book_admin())) ? RDF_OBJECT::USE_VERSIONS_EDITORIAL : RDF_Object::USE_VERSIONS_INCLUSIVE,
							'is_book_admin'=> ($this->login_is_book_admin() && null == $this->data['url_params']['edition_index']) ? 1 : 0 
		);
		$index = $this->rdf_object->index($settings);
		if (!count($index)) throw new Exception('Problem getting page index');
		$this->data['page'] = $index[0];
		unset($index);

		$key = 0;
		$version_num = get_version($this->uri->uri_string());
		if ($version_num != 0) {
			foreach ($this->data['page']->versions as $key => $version) {
				if ($version->version_num == $version_num) break;
			}
		}
		$this->data['page']->version_index = $key;

		$this->data['hide_edit_bar'] = true;

	}

	// List versions of the current page in a digest format
	private function history() {
		
		if (!isset($this->data['page'])) $this->fallback();
		$this->data['hide_versions'] = $this->books->is_hide_versions($this->data['book']);
		if ($this->data['hide_versions'] && !$this->login_is_book_admin()) $this->fallback();

		// Overwrite previous page array (which only has the most recent version)
		$this->data['page']->user = (int) $this->data['page']->user->user_id;
		unset($this->data['page']->versions);
		$settings = array(
							'book'         => $this->data['book'],
							'content'      => array($this->data['page']),
							'base_uri'     => $this->data['base_uri'],
							'versions'     => RDF_Object::VERSIONS_ALL,
							'ref'          => RDF_Object::REFERENCES_NONE,
							'prov'		   => RDF_Object::PROVENANCE_ALL,
							'max_recurses' => 0,
							'use_versions' => $this->data['use_versions'],
							'use_versions_restriction' => ($this->editorial_is_on() && (null!==$this->data['url_params']['edition_index'] || !$this->login_is_book_admin())) ? RDF_OBJECT::USE_VERSIONS_EDITORIAL : RDF_Object::USE_VERSIONS_INCLUSIVE,
							'is_book_admin'=> ($this->login_is_book_admin() && null == $this->data['url_params']['edition_index']) ? 1 : 0
		);
		$index = $this->rdf_object->index($settings);
		if (!count($index)) throw new Exception('Problem getting page index');
		$this->data['page'] = $index[0];
		unset($index);
		reset($this->data['page']->versions);
		$this->data['page']->version_index = key($this->data['page']->versions);
		$this->data['hide_edit_bar'] = true;

	}

	// List metadata in a human-readable way
	private function meta() {

		if (!isset($this->data['page'])) $this->fallback();
		$this->data['hide_versions'] = $this->books->is_hide_versions($this->data['book']);
		$all = (isset($_GET['versions']) && 1==$_GET['versions']) ? true : false;
		if ($all && $this->data['hide_versions'] && !$this->login_is_book_admin()) $this->fallback();
		$this->data['is_book_admin'] = $this->login_is_book_admin();

		if ($all) {  // Overwrite previous page's versions array (which only has the most recent version)
			unset($this->data['page']->versions);
			$this->data['page']->user = $this->data['page']->user->user_id;
			$settings = array(
								'book'         => $this->data['book'],
								'content'      => array($this->data['page']),
								'base_uri'     => $this->data['base_uri'],
								'versions'     => RDF_Object::VERSIONS_ALL,
								'ref'          => RDF_Object::REFERENCES_NONE,
								'prov'		   => RDF_Object::PROVENANCE_ALL,
								'max_recurses' => 0,
								'use_versions' => $this->data['use_versions'],
								'use_versions_restriction' => ($this->editorial_is_on() && (null!==$this->data['url_params']['edition_index'] || !$this->login_is_book_admin())) ? RDF_OBJECT::USE_VERSIONS_EDITORIAL : RDF_Object::USE_VERSIONS_INCLUSIVE,
								'is_book_admin'=> ($this->login_is_book_admin() && null == $this->data['url_params']['edition_index']) ? 1 : 0,
								'tklabeldata'  => $this->tklabels(),
								'tklabels' 	   => RDF_Object::TKLABELS_ALL,
			);
			$index = $this->rdf_object->index($settings);
			if (!count($index)) throw new Exception('Problem getting page index');
			$this->data['page'] = $index[0];
			unset($index);
			reset($this->data['page']->versions);
			$this->data['page']->version_index = key($this->data['page']->versions);
		}

		foreach ($this->data['page']->versions as $key => $version) {
			$this->data['page']->versions[$key]->meta = $this->versions->rdf($this->data['page']->versions[$key]);
		}

		$this->data['page']->meta = $this->pages->rdf($this->data['page']);
		$this->data['hide_edit_bar'] = true;

	}

	// Edit page
	private function edit() {

		// User
		$user_id = @$this->data['login']->user_id;
		if (empty($user_id)) $this->require_login(3);

		// Book
		$book_id =@ (int) $this->data['book']->book_id;
		$book_slug = $this->data['book']->slug;
		if (empty($book_id)) show_404();
		if (empty($book_slug)) show_404();

		// Content
		$content_id = (!empty($this->data['page'])) ? (int) $this->data['page']->content_id : null;
		$is_new = (!empty($content_id)) ? false : true;

		// Protect
		if ($is_new) {
			$this->protect_book('commentator');
		} elseif (!$this->pages->is_owner($user_id, $content_id)) {
			$this->protect_book('reviewer');
		}

		$this->data['mode'] = 'editing';
		$this->data['is_new'] = $is_new;

		// Page or media file, continue to
		$this->data['is_file'] = false;
		$this->data['file_url'] = null;
		$this->data['continue_to'] = null;
		if (!empty($this->data['page']) && !empty($this->data['page']->versions) && isset($this->data['page']->versions[$this->data['page']->version_index])) {
			if ($this->data['page']->type=='media') {
				$this->data['is_file'] = true;
				$this->data['file_url'] = $this->data['page']->versions[$this->data['page']->version_index]->url;
			}
			if (!empty($this->data['page']->versions[$this->data['page']->version_index]->continue_to_content_id)) {
				$this->data['continue_to'] = $this->pages->get($this->data['page']->versions[$this->data['page']->version_index]->continue_to_content_id);
				if (!empty($this->data['continue_to'])) {
					$this->data['continue_to']->versions = array();
					$this->data['continue_to']->versions[0] = $this->versions->get_single($this->data['continue_to']->content_id, $this->data['continue_to']->recent_version_id);
					$this->data['continue_to']->version_index = 0;
				}
			}
		}

		// Page URI segment
		if (!empty($this->data['page']) && !empty($this->data['page']->slug)) {
			$this->data['page_url'] = $this->data['page']->slug;
		} elseif (substr($this->uri->uri_string(),-9,9)=='/new.edit') {
			$this->data['page_url'] = '';
		} else {
			$this->data['page_url'] = ltrim($this->uri->uri_string(),'/');
			if (substr($this->data['page_url'], 0, strlen($this->data['book']->slug))==$this->data['book']->slug) $this->data['page_url'] = substr($this->data['page_url'], strlen($this->data['book']->slug));
			$this->data['page_url'] = ltrim($this->data['page_url'], '/');
			// Don't use rtrim(..., '.edit'.), seems to have a bug with "workscited.edit" => "worksc"
			if ('.edit'==substr($this->data['page_url'], -5, 5)) $this->data['page_url'] = substr($this->data['page_url'], 0, -5);
		}

		// Enum types
		$this->data['categories'] = $this->books->get_enum_values('content','category');

		// Metadata terms
		$this->data['ontologies'] = $this->config->item('ontologies');
		$this->data['rdf_fields'] = $this->versions->rdf_fields;
		$this->data['tklabels'] = $this->tklabels();

		// List of images/audio
		$this->data['book_images'] = $this->books->get_images($book_id);
		$this->data['book_images_and_mp4'] = $this->books->get_images($book_id, array('mp4','video'));
		$this->data['book_audio'] = $this->books->get_audio($book_id);

	}

	// Annotation editor page
	private function annotation_editor() {

		$this->data['mode'] = 'editing';
		if (!$this->login_is_book_admin('Commentator')) $this->require_login(4);

	}

	// Editorial path
	private function editorialpath() {

		if (!$this->editorial_is_on() || !$this->login_is_book_admin()) $this->fallback();
		$this->data['view'] = __FUNCTION__;

	}

	// User pages
	private function users() {

		if (method_exists($this, $this->data['view'])) return;
		if ($this->data['mode'] == 'editing') return;
		$this->load->model('user_book_model', 'user_books');
		$user_id = (int) no_ext($this->uri->segment(3));
		$user = $this->user_books->get($this->data['book']->book_id, $user_id);
		if (empty($user) || !$this->users->is_a($user->relationship, 'reviewer')) $user = null;
		$this->data['book_user'] = $user;
		$this->data['view'] = __FUNCTION__;

	}

}
?>
