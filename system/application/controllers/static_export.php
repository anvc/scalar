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
 *                      URL pattern: /<book-slug>/static_export
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

	public function index() {

		// Require Author-level access (same pattern as book.php __construct for private books)
		if (!$this->login_is_book_admin('Author')) {
			if ($this->data['login']->is_logged_in) {
				$this->no_permissions();
			} else {
				$this->require_login();
			}
		}

		// Stub: confirm the route is wired correctly before implementing real export logic
		http_response_code(200);
		header('Content-Type: text/plain');
		echo 'static_export OK';
		exit;

	}

}
