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
 * @projectDescription		Base controller class to handle database and login tasks useful for all controllers
 * @author					Craig Dietrich
 * @version					2.3
 */

class MY_Controller extends CI_Controller {

	public $data = array();
	protected $fallback_page = 'index';

	public function __construct() {

		parent::__construct();

		header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
		header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past

		// GET vars, note that this requires 'uri_protocol' to be 'PATH_INFO' in config.php
		parse_str($_SERVER['QUERY_STRING'], $_GET);

		$this->load->library( 'session' );
		$this->load->helper( 'url' );
		$this->load->helper( 'html' );
		$this->load->helper( 'string' );
		$this->load->helper( 'language' );
		$this->load->helper( 'array' );
		$this->load->helper( 'directory' );
		$this->config->load( 'rdf' );
		$this->config->load( 'local_settings' );
		$this->data['recaptcha2_site_key'] = ($this->config->item('recaptcha2_site_key')) ? $this->config->item('recaptcha2_site_key') : '';
		$this->data['recaptcha_public_key'] = ($this->config->item('recaptcha_public_key')) ? $this->config->item('recaptcha_public_key') : '';

		// Models
		$this->load->model( 'user_model', 'users' );   // Interact with user database
		$this->load->model( 'login_model', 'login' );  // Handle login session

		// Language (default set in config/config.php)
		$lang = (isset($_REQUEST['lang']) && file_exists(APPPATH.'language/'.$_REQUEST['lang'])) ? $_REQUEST['lang'] : null;
		$this->lang->load('content', $lang);

		// Database
		// TODO: I believe this opens two different connections to the same database
		$this->load->database();
		$this->load->library('RDF_Store', 'rdf_store');

		// Initalize view data
		$this->data['app_root'] = base_url().'system/application/';
		$this->data['ns'] = $this->config->item('namespaces');

		$this->set_login_params();
	}

	/**
	 * Set information about the logged-in user such as the books they are attached to
	 * @requires	$this->login
	 * @requires	$this->data
	 * @return 		null
	 */

	protected function set_login_params() {

		$this->data['login']          = $this->login->get();
		$this->data['login_is_super'] = (isset($this->data['login']->is_super) && $this->data['login']->is_super) ? true : false;
		$this->data['login_books']    = (isset($this->data['login']->user_id)) ? $this->login->get_books($this->data['login']->user_id) : array();
		$this->data['login_book_ids'] = $this->login->get_book_ids($this->data['login_books']);

	}

	/**
	 * Set information about whether a logged-in user can edit a book or open the dashboard
	 * @requires	$this->data
	 * @return 		null
	 */

	protected function set_user_book_perms() {

		$this->data['user_level'] = null;  // For general permissions
		$this->data['user_level_as_defined'] = null;  // For user interface options
		
		if (!empty($this->data['book']) && in_array($this->data['book']->book_id, $this->data['login_book_ids'])) {
			$user_level = array_get_node('book_id', $this->data['book']->book_id, $this->data['login_books']);
			$this->data['user_level'] = ucwords($user_level['value']['relationship']);
			$this->data['user_level_as_defined'] = ucwords($user_level['value']['relationship']);
		}

		if ($this->data['login_is_super']) {
			$this->data['user_level'] = 'Author';
		}

	}
	
	/**
	 * Set information about the current location (and validate editions if the editorial workflow is active)
	 * @requires $this->data
	 * @return null
	 */
	
	protected function set_url_params() {
		
		if (empty($this->data['book'])) return;

		$this->data['url_params'] = array();
		$this->data['url_params']['uri'] = $this->uri->uri_string();
		$this->data['url_params']['book_segment'] = no_edition(strtolower($this->uri->segment('1')));
		$this->data['url_params']['edition_num'] = get_edition(strtolower($this->uri->segment('1')));
		$this->data['url_params']['edition_num'] = (is_numeric($this->data['url_params']['edition_num'])) ? (int) $this->data['url_params']['edition_num']: null;
		$this->data['url_params']['edition_index'] = ($this->data['url_params']['edition_num']) ? $this->data['url_params']['edition_num'] - 1 : null;
		$this->data['url_params']['page_segments'] = array_slice($this->uri->segments, 1);
		$this->data['url_params']['ext'] = (!empty($this->data['url_params']['page_segments'])) ? get_ext($this->data['url_params']['page_segments'][count($this->data['url_params']['page_segments'])-1]) : '';
		for ($j = 0; $j < count($this->data['url_params']['page_segments']); $j++) $this->data['url_params']['page_segments'][$j] = no_version($this->data['url_params']['page_segments'][$j]);
		$this->data['url_params']['version_num'] = get_version($this->uri->uri_string());
		$this->data['url_params']['version_num'] = (is_numeric($this->data['url_params']['version_num'])) ? (int) $this->data['url_params']['version_num'] : null;
		$this->data['url_params']['page_first_segment'] = (count($this->data['url_params']['page_segments']) > 0) ? no_version($this->data['url_params']['page_segments'][0]) : null;

		$this->data['slug'] = implode('/', $this->data['url_params']['page_segments']);
		$this->data['use_versions'] = null;
		
		// Standard state (Editorial Workflow is off)
		if (!$this->editorial_is_on()) {
			$this->data['base_uri'] = confirm_slash(base_url()).$this->data['book']->slug.'/';
			if (empty($this->data['url_params']['page_first_segment']) || !empty($this->data['url_params']['edition_num'])) {
				$redirect_to = base_url().$this->data['url_params']['book_segment'].'/';
				$redirect_to .= (!empty($this->data['url_params']['page_segments'])) ? implode('/', $this->data['url_params']['page_segments']) : $this->fallback_page;
				$redirect_to .= ((null !== $this->data['url_params']['version_num']) ? '.'.$this->data['url_params']['version_num']: '');
				$redirect_to .= ((!empty($this->data['url_params']['ext'])) ? '.'.$this->data['url_params']['ext'] : '');
				$redirect_to .= ((!empty($_SERVER['QUERY_STRING'])) ? '?'.$_SERVER['QUERY_STRING'] : '');
				header('Location: '.$redirect_to);
				exit;
			}
			return;
		}
		
		$is_editing = ('edit' == get_ext($this->uri->uri_string())) ? true : false;
		$edition_index = $this->data['url_params']['edition_index'];
		$cookie_name = edition_cookie_name(base_url().$this->data['book']->slug);
		$cookie_edition_index = (isset($_COOKIE[$cookie_name])) ? (int) $_COOKIE[$cookie_name] : null;
		
		// The edition and version numbers to-be-routed-to based on the various forks below
		$edition_num = null;
		$version_num = $this->data['url_params']['version_num'];
		
		// Author, Editor permissions
		if ($this->login_is_book_admin()) {
			if (null === $cookie_edition_index && null !== $edition_index) {  // Asking for an edition but Cookie set to Latest Edits
				$edition_num = null;
			} elseif (!$is_editing && null !== $edition_index && isset($this->data['book']->editions[$edition_index])) {  // Asking for an edition
				$edition_num = $this->data['url_params']['edition_num'];
			} elseif (!$is_editing && null !== $cookie_edition_index && isset($this->data['book']->editions[$cookie_edition_index]))  {  // Cookie asking for an edition
				$edition_num = $cookie_edition_index + 1;
			}
		// Reader permissions
		} else {
			if (null !== $edition_index && isset($this->data['book']->editions[$edition_index])) {  // Asking for an edition
				$edition_num = $this->data['url_params']['edition_num'];
			} elseif (!empty($this->data['book']->editions)) {  // Go to most recent edition if there are any
				$edition_num = count($this->data['book']->editions);
			}
		}
		
		// Never use an Edition URL if requesting a Version
		if (null !== $edition_num && null !== $this->data['url_params']['version_num']) $version_num = null;
		
		// Redirect a book URL or incorrect edition URL to the home page
		if (empty($this->data['url_params']['page_segments']) || $edition_num != $this->data['url_params']['edition_num'] || $version_num != $this->data['url_params']['version_num']) {
			$redirect_to = base_url().$this->data['url_params']['book_segment'];
			$redirect_to .= ((null !== $edition_num) ? '.'.$edition_num : '') . '/';
			$redirect_to .= (!empty($this->data['url_params']['page_segments'])) ? implode('/', $this->data['url_params']['page_segments']) : $this->fallback_page;
			$redirect_to .= ((!empty($this->data['url_params']['ext'])) ? '.'.$this->data['url_params']['ext'] : '');
			$redirect_to .= ((!empty($_SERVER['QUERY_STRING'])) ? '?'.$_SERVER['QUERY_STRING'] : '');
			header('Location: '.$redirect_to);
			exit;
		}
		
		// Redirect if version isn't in the edition
		$this->data['base_uri'] = confirm_slash(base_url()).$this->data['book']->slug.((!empty($edition_num))?'.'.$edition_num:'').'/';
		if (null !== $edition_num && isset($this->data['book']->editions[$edition_num-1])) {
			$this->data['use_versions'] = $this->data['book']->editions[$edition_num-1]['pages'];
		}
		
	}

	/**
	 * Test a user level against logged-in status
	 * @param 	int $book_id
	 * @param	str $level
	 * @return 	bool
	 */

	protected function login_is_book_admin($level='Editor') {

		if ($this->users->is_a(strtolower($this->data['user_level']), $level)) return true;
		return false;

	}

	/**
	 * Protect a book against a user level
	 * @param 	int $book_id
	 * @param	str	$level
	 * @return 	null
	 */

	protected function protect_book($level='Editor') {

		if (!$this->login_is_book_admin($level)) $this->kickout();

	}

	/**
	 * Redirect the page to the base URL
	 * @return 	null
	 */

	protected function kickout() {

		header('Location: '.base_url());
		exit;

	}

	/**
	 * Redirect the page to login
	 * @return 	null
	 */

	protected function require_login($msg='') {

		$uri = (confirm_slash(base_url())).'system/login?redirect_url='.urlencode($this->redirect_url());
		if (!empty($msg)) $uri .= '&msg='.$msg;
		header('Location: '.$uri);
		exit;

	}
	
	/** 
	 * Redirect the page to the no-permissions box
	 * @return null
	 */
	
	protected function no_permissions() {

		$uri = (confirm_slash(base_url())).'system/permissions?redirect_url='.urlencode($this->redirect_url());
		header('Location: '.$uri);
		exit;
		
	}
	
	/**
	 * Redirect to the fallback page
	 * @return null
	 */
	
	protected function fallback() {
		
		if (isset($this->data['base_uri']) && !empty($this->data['base_uri'])) {
			$url = $this->data['base_uri'].$this->fallback_page;
		} else if (isset($this->data['book']) && !empty($this->data['book']) && isset($this->data['book']->slug)) {
			$url = confirm_slash(base_url()).confirm_slash($this->data['book']->slug).$this->fallback_page;
		} else {
			$this->kickout();
		}
		header('Location: '.$url);
		exit;
		
	}
	
	/**
	 * Test whether the editorial workflow feature is turned on for the current book
	 * @return bool
	 */
	
	protected function editorial_is_on() {
		
		if (isset($this->data['book']) && isset($this->data['book']->editorial_is_on) && $this->data['book']->editorial_is_on) {
			return true;
		}
		return false;
		
	}
	
	/**
	 * Test whether the editorial workflow can be turned on based on the database configuration
	 * @return bool
	 */
	
	protected function can_editorial() {
		
		$can = true;
		if (!isset($this->data['book']) || !isset($this->data['book']->editorial_is_on)) $can = false;
		if (isset($this->data['book']->template) && 'honeydew' == $this->data['book']->template) $can = false;
		if (!$this->db->field_exists('editorial_state', 'versions')) $can = false;
		if (!$this->db->field_exists('usage_rights', 'versions')) $can = false;
		if (!$this->db->field_exists('editorial_queries', 'versions')) $can = false;
		return $can;
		
	}
	
	/**
	 * Test whether the editions can be turned on and/or used based on the database configuration
	 * @return bool
	 */
	
	protected function can_edition() {
		
		if (!$this->can_editorial()) return false;
		if (!$this->db->field_exists('editions', 'books')) return false;
		return true;
		
	}

	/**
	 * Return a redirect URL
	 * @return 	str 	URI
	 */

   	protected function redirect_url() {

   		// A specific redirect URL has been sent via GET/POST
   		if (isset($_REQUEST{'redirect_url'}) && !empty($_REQUEST['redirect_url'])) {
   			return urldecode(trim($_REQUEST{'redirect_url'}));
   		}
    	// Book is present and might have a page slug
    	if (isset($this->data['book']) && isset($this->data['book']->slug) && !empty($this->data['book']->slug)) {
   			$segs = $this->uri->segment_array();
    		return confirm_slash(base_url()).implode('/',$segs);
    	}
    	// Dashboard
		$segs = $this->uri->segment_array();
		if ('system'==$segs[1] && 'dashboard'==$segs[2]) {
			$book_id = (isset($_GET['book_id']) && !empty($_GET['book_id'])) ? (int) $_GET['book_id'] : 0;
			$zone = (isset($_GET['zone']) && !empty($_GET['zone'])) ? $_GET['zone'] : 'style';
			return confirm_slash(base_url()).'system/dashboard'.urlencode('?book_id='.$book_id.'&zone='.$zone.'#tabs-'.$zone);
		}
   		// Default to the install index
   		return base_url();

   	}

   	/**
   	 * Determine if a melon (skin) exists
   	 */

   	protected function melon_exists($name='') {

   		$path = confirm_slash(APPPATH).'views/melons/'.$name;
   		if (!file_exists($path)) return false;
   		return true;

   	}

   	/**
   	 * Force a melon to be loaded/used
   	 */

   	protected function force_melon($name='') {

   		$name = strtolower($name);
		$this->data['melon'] = $name;
		if (!file_exists(APPPATH.'views/melons/'.$name.'/config.php')) echo '<p>Warning: '.ucwords($name).' theme does not exist, this page might render oddly.</p>';
		include(APPPATH.'views/melons/'.$name.'/config.php');
		$this->config->set_item('arbor', $config['arbor']);
		$this->data['template'] = $this->template->config['active_template'];

   	}

   	/**
   	 * Load info about a melon (skin)
   	 */

   	protected function load_melon_config($name='') {

   		$this->config->load('../views/melons/'.$name.'/config');

   	}

   	/**
   	 * Get paths to melons
   	 */

   	protected function melon_paths() {

   		$melon_dir = APPPATH.'views/melons';
   		$files = scandir($melon_dir);
   		$paths = array();
   		foreach ($files as $file) {
   			if ($file=='.'||$file=='..') continue;
   			$paths[] = $melon_dir.'/'.$file.'/';
   		}
   		return $paths;

   	}

   	/**
   	 * Determine if paywall page should be presented rather than the protected page content
   	 */
   	
   	protected function can_bypass_paywall() {
   		
   	   	try {
   			if ($this->login_is_book_admin('Reader')) throw new Exception('Reader logged in');
   			$book_slug = $this->data['book']->slug;
   			if (empty($book_slug)) throw new Exception('Invalid book slug');
   			$tinypass_config_path = confirm_slash(FCPATH).$book_slug.'/tinypass.php';
   			if (!file_exists($tinypass_config_path)) throw new Exception('Could not find Tinypass config');
   			require_once($tinypass_config_path);
   			if (empty($tinypass) || !is_array($tinypass)) throw new Exception('No $tinypass in tinypass.php');
   			$this->load->library('Tinypass_Helper', $tinypass);
   			return false;
		} catch (Exception $e) {
			return $e->getMessage();
		}
		
   	}
   	
   	/**
   	 * Invoke the payway view
   	 * @return null
   	 */

   	protected function paywall() {

   		try {
   			$msg = $this->can_bypass_paywall();
			if (false!==$msg) throw new Exception($msg);
   			// Load Tinypass
			if (!$this->tinypass_helper->accessGranted()) {
				$this->data['buttonHTML'] = $this->tinypass_helper->getHTML();
				$this->template->set_template('external');
				$this->template->write_view('content', 'melons/'.$this->data['melon'].'/tinypass', $this->data);
				$this->template->render();
				$this->template_has_rendered = true;
			}
		} catch (Exception $e) {}

   	}
   	
	/**
	 * Test whether TK Labels are enabled and, if so, return the TK Label array from the resources table
	 * @return array or null
	 */
   	
	protected function tklabels() {   		
   		
		if (empty($this->data['book']) || empty($this->data['book']->book_id)) return null;
		$enable = $this->config->item('enable_tklabels');
		if (!$enable) return null;
		$namespaces = $this->config->item('namespaces');
		if (!isset($namespaces['tk'])) return null;
		$this->load->model('resource_model', 'resources');
		$flush = (isset($_GET['flush_tklabel_texts']) && $_GET['flush_tklabel_texts']) ? true : false;
		$tklabels = $this->resources->get('tklabels_'.$this->data['book']->book_id);
		if (empty($tklabels)) {  // For now go get a file called "tklabels.json" and insert it into the resources table
			$json = FCPATH.$this->data['book']->slug.'/tklabels.json';
			if (file_exists($json)) {
				$json = json_decode(file_get_contents($json), true);
				$save = array('labels'=>$json);
				$tklabels = $this->resources->put('tklabels_'.$this->data['book']->book_id, serialize($save));
			}
		} elseif (!empty($tklabels) && $flush) {  // Replace the texts
			$json = FCPATH.$this->data['book']->slug.'/tklabels.json';
			if (file_exists($json)) {
				$tklabels = unserialize($tklabels);
				$json = json_decode(file_get_contents($json), true);
				$save = array('labels'=>$json);
				$tklabels = $this->resources->put('tklabels_'.$this->data['book']->book_id, serialize($save));
			}
		}
		if (!empty($tklabels)) $tklabels = unserialize($tklabels);
		return $tklabels;
   		
	}

}

?>
