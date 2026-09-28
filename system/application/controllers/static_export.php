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
 * @projectDescription  Controller for exporting a Scalar book as a self-contained static website.
 *                      Routed via: $route['(.*)/static_export'] = "static_export/index"
 *                                  $route['(.*)/static_export/check'] = "static_export/check"
 *                      URL pattern: /<book-slug>/static_export
 *                                   /<book-slug>/static_export/check
 */

class Static_Export extends MY_Controller {

	public function __construct() {

		parent::__construct();

		$this->load->model('book_model', 'books');

		// Segment 1 of the original URI is the book slug (e.g. "mybook" in /mybook/static_export)
		$slug = no_edition(strtolower($this->uri->segment(1)));
		$this->data['book'] = (!empty($slug)) ? $this->books->get_by_slug($slug) : null;
		if (empty($this->data['book'])) show_404();

		$this->set_user_book_perms();

	}

	/**
	 * Build the export. Accepts GET, or POST from the Utilities tab — which, for a book that
	 * draws maps, first asks the author how the site should draw them (see check()) and posts
	 * the answer as maps_provider ('google' or 'leaflet') and google_maps_key.
	 */
	public function index() {

		$this->_require_author();

		// Stub: confirm the route is wired correctly before implementing real export logic
		/*http_response_code(200);
		header('Content-Type: text/plain');
		echo 'static_export OK';
		exit;*/

		$this->load->model('static_export_model', 'static_export_model');
		$book_data = $this->static_export_model->get_book_data($this->data['book']->book_id);

		$tmp_dir = sys_get_temp_dir() . '/scalar_export_' . $this->data['book']->slug . '_' . time();
		if (!mkdir($tmp_dir, 0755, true)) {
			http_response_code(500);
			header('Content-Type: text/plain');
			echo 'Could not create temp directory: ' . $tmp_dir;
			exit;
		}

		$result = $this->static_export_model->render_book($book_data, $tmp_dir, $this->_export_options());

		http_response_code(200);
		header('Content-Type: application/json');
		echo json_encode(array(
			'tmp_dir'  => $tmp_dir,
			'rendered' => $result['rendered'],
			'skipped'  => $result['skipped'],
			'errors'   => $result['errors'],
			'dataBytes' => $result['dataBytes'],
			'maps'      => $result['maps'],
		), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
		exit;

	}

	/**
	 * What the Utilities tab needs before it starts an export: whether the book draws maps,
	 * which decides whether to ask the author about Google Maps, and the key to suggest if
	 * this installation shares its own (static_export_share_google_maps_key). Answers JSON.
	 */
	public function check() {

		$this->_require_author();

		$this->load->model('static_export_model', 'static_export_model');
		$defaults = $this->static_export_model->default_map_options();

		header('Content-Type: application/json');
		header('Cache-Control: no-store');
		echo json_encode(array(
			'usesMaps'      => $this->static_export_model->uses_maps($this->data['book']->book_id),
			'googleMapsKey' => $defaults['googleMapsKey'],
		));
		exit;

	}

	// Require Author-level access (same pattern as book.php __construct for private books)
	private function _require_author() {

		if (!$this->login_is_book_admin('Author')) {
			if ($this->data['login']->is_logged_in) {
				$this->no_permissions();
			} else {
				$this->require_login();
			}
		}

	}

	/**
	 * The site settings for render_book(): this installation's defaults, with the author's
	 * answer to the maps question applied when there was one. The key is used for this export
	 * only and not stored anywhere else.
	 */
	private function _export_options() {

		$options  = $this->static_export_model->default_map_options();
		$provider = $this->input->post('maps_provider');

		if ('google' === $provider) {
			$options['googleMapsKey'] = trim((string) $this->input->post('google_maps_key'));
		} elseif (is_string($provider) && '' !== $provider) {
			$options['googleMapsKey'] = '';
		}

		return $options;

	}

}
