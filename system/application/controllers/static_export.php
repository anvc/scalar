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
 *                                  $route['(.*)/static_export/(check|start|step|download)'] = "static_export/$2"
 *                      URL pattern: /<book-slug>/static_export[/check|/start|/step|/download]
 *
 * The Utilities tab exports in short requests, because a server can stop any one request after
 * a fixed time — PHP-FPM's request_terminate_timeout, for one, kills it outright, and on
 * scalar.usc.edu that is 30 seconds — and a big book takes far longer than that to export.
 * start creates an export job, step advances it (repeatedly, each call stopping before
 * static_export_step_seconds are up), and download sends the finished ZIP. See
 * Static_Export_Model::job_step() for what a job is.
 *
 * index still exports in one request, for curl and ?debug=1, and for anyone whose server's
 * limits allow it.
 */

class Static_Export extends MY_Controller {

	/** Seconds a step may spend before stopping, unless static_export_step_seconds says otherwise. */
	const DEFAULT_STEP_SECONDS = 20;

	/** Jobs untouched for this long are deleted when the next export starts (24 hours). */
	const JOB_MAX_AGE = 86400;

	/**
	 * Set while answering ?debug=1, which reports the job directory it built and so must not
	 * then delete it. Read by _cleanup() on shutdown.
	 */
	private $keep_job_dir = false;

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
	 * Build the whole export in this one request and send it. Accepts GET, or POST with the
	 * same fields as start(). ?debug=1 answers with what was built instead of the file, and
	 * leaves the job directory in place so there is something to go and look at.
	 */
	public function index() {

		$this->_require_author();

		@set_time_limit(0);
		ignore_user_abort(true);

		$job_dir = $this->_create_job();
		register_shutdown_function(array($this, '_cleanup'), $job_dir);

		$progress = $this->static_export_model->job_step($job_dir, INF);
		if ($progress['failed']) return $this->_fail(500, $progress['failed']);

		$job = $this->static_export_model->job_load($job_dir);

		if ($this->input->get('debug')) {
			$this->keep_job_dir = true;
			return $this->_debug($job_dir, $job);
		}

		if (empty($job['rendered'])) {
			return $this->_fail(500, 'The export produced no pages. ' . $this->_error_summary($job['errors']));
		}

		$this->_stream_zip($this->static_export_model->job_zip_path($job_dir, $job), $job['slug'] . '-static-site.zip');

	}

	/**
	 * Start an export. POSTed by the Utilities tab, which asks the author how the site should
	 * be built (see check()) and sends the answers: maps_provider ('google' or 'leaflet') and
	 * google_maps_key for a book that draws maps, and search_engines plus site_url for whether
	 * to write a sitemap. Answers JSON: {job: <id>} for step() and download().
	 *
	 * Starting an export deletes any other export of the same book, finished or not — so two
	 * tabs can't fill the server with copies of one book — and any export left untouched for a
	 * day.
	 */
	public function start() {

		$this->_require_author();

		$job_dir = $this->_create_job();
		$this->_json(array('job' => substr(basename($job_dir), strrpos(basename($job_dir), '_') + 1)));

	}

	/**
	 * Advance an export by as much as fits in static_export_step_seconds, and answer JSON
	 * saying how far along it is (see Static_Export_Model::_progress()), or {busy: true} if
	 * another request is advancing it right now — a step the browser gave up on, still
	 * running — in which case the tab should wait a moment and ask again.
	 *
	 * Runs on even if the browser goes away, so the job's state is always saved.
	 */
	public function step() {

		$this->_require_author();

		$job_dir = $this->_job_dir_from_request(true);

		@set_time_limit(0);
		ignore_user_abort(true);

		$lock = fopen($job_dir . '/lock', 'c');
		if (false === $lock || !flock($lock, LOCK_EX | LOCK_NB)) return $this->_json(array('busy' => true));

		// Measured from when the request arrived, so the budget covers Scalar's own start-up.
		$seconds  = (float) $this->config->item('static_export_step_seconds');
		$started  = isset($_SERVER['REQUEST_TIME_FLOAT']) ? $_SERVER['REQUEST_TIME_FLOAT'] : microtime(true);
		$deadline = $started + ($seconds > 0 ? $seconds : self::DEFAULT_STEP_SECONDS);

		$this->_json($this->static_export_model->job_step($job_dir, $deadline));

	}

	/**
	 * Send a finished export's ZIP, then delete the job. GET, with ?job=<id>. ?debug=1 answers
	 * with what was built instead, as index() does, and keeps the job.
	 *
	 * The job is only deleted once the whole file has gone, so a download that breaks off can
	 * be tried again; one never fetched goes when the next export starts, or after a day.
	 */
	public function download() {

		$this->_require_author();

		$job_dir = $this->_job_dir_from_request(false);
		$job     = $this->static_export_model->job_load($job_dir);

		if (!$job['finished']) {
			return $this->_fail(409, 'This export hasn\'t finished yet.');
		}

		if ($this->input->get('debug')) return $this->_debug($job_dir, $job);

		ignore_user_abort(true);
		$sent = $this->_stream_zip($this->static_export_model->job_zip_path($job_dir, $job), $job['slug'] . '-static-site.zip', false);
		if ($sent) $this->_cleanup($job_dir);
		exit;

	}

	/**
	 * Create a job for this book with the author's answers, after clearing away this book's
	 * other jobs and anyone's stale ones. Fails the request if it can't.
	 *
	 * @return string The job directory
	 */
	private function _create_job() {

		$this->load->model('static_export_model', 'static_export_model');

		$book_id = (int) $this->data['book']->book_id;
		$this->_sweep_jobs($book_id);

		$job_dir = self::_job_dir($book_id, bin2hex(random_bytes(12)));
		if (!mkdir($job_dir, 0755, true)) {
			return $this->_fail(500, 'Could not create a temporary directory for the export: ' . $job_dir);
		}

		$ok = $this->static_export_model->job_create($job_dir, $this->data['book'],
			$this->data['login']->user_id, $this->_export_options());
		if (!$ok) {
			$this->_delete_dir($job_dir);
			return $this->_fail(500, 'Could not start the export: the temporary directory isn\'t writable.');
		}

		return $job_dir;

	}

	/**
	 * The job named by the request's 'job' parameter, if it exists and belongs to this book and
	 * this user. Fails the request otherwise — with JSON for step(), whose caller is a script,
	 * and plain text for download(), whose caller is a person.
	 *
	 * @param  bool   $json
	 * @return string The job directory
	 */
	private function _job_dir_from_request($json) {

		$this->load->model('static_export_model', 'static_export_model');

		$id  = (string) $this->input->get_post('job');
		$job = null;
		if (preg_match('/^[a-f0-9]{24}$/', $id)) {
			$job_dir = self::_job_dir($this->data['book']->book_id, $id);
			$job     = $this->static_export_model->job_load($job_dir);
		}

		if (null === $job) {
			$message = 'This export has expired or was replaced by a newer one. Please start it again.';
			return $json ? $this->_json(array('failed' => $message)) : $this->_fail(404, $message);
		}
		if ((int) $job['bookId'] !== (int) $this->data['book']->book_id
		 || (int) $job['userId'] !== (int) $this->data['login']->user_id) {
			return $json ? $this->_json(array('failed' => 'This export belongs to someone else.')) : $this->no_permissions();
		}

		return $job_dir;

	}

	/**
	 * Where a job lives: the server's temp directory, named for the book so that _sweep_jobs()
	 * can find a book's jobs without opening them.
	 */
	private static function _job_dir($book_id, $id) {

		return rtrim(sys_get_temp_dir(), '/') . '/scalar_export_' . (int) $book_id . '_' . $id;

	}

	/**
	 * Delete $book_id's jobs, and every job not touched in JOB_MAX_AGE. Matches only the names
	 * _job_dir() makes, so nothing else in the temp directory is at risk.
	 */
	private function _sweep_jobs($book_id) {

		$dirs = glob(rtrim(sys_get_temp_dir(), '/') . '/scalar_export_*_*', GLOB_ONLYDIR);
		foreach ((array) $dirs as $dir) {
			if (!preg_match('/^scalar_export_(\d+)_[a-f0-9]{24}$/', basename($dir), $m)) continue;
			$touched = @filemtime(is_file($dir . '/job.ser') ? $dir . '/job.ser' : $dir);
			if ((int) $m[1] === (int) $book_id || $touched < time() - self::JOB_MAX_AGE) {
				$this->_delete_dir($dir);
			}
		}

	}

	/**
	 * Send $path to the browser as a download named $filename. Read in chunks rather than with
	 * readfile() so that a multi-gigabyte book doesn't have to fit in memory, and with every
	 * output buffer torn down first so CodeIgniter's own buffering doesn't do it for us.
	 *
	 * This is still one request, so a server's time limit applies to it: a ZIP too big to
	 * download within that limit is cut off.
	 *
	 * @param  string $path
	 * @param  string $filename
	 * @param  bool   $exit      Stop once sent (_cleanup() then runs on shutdown, if registered)
	 * @return bool   Whether the whole file reached the browser
	 */
	private function _stream_zip($path, $filename, $exit = true) {

		while (ob_get_level()) ob_end_clean();

		$fh = fopen($path, 'rb');
		if (false === $fh) return $this->_fail(500, 'The ZIP file could not be opened for sending.');

		header('Content-Type: application/zip');
		header('Content-Disposition: attachment; filename="' . str_replace('"', '', $filename) . '"');
		header('Content-Length: ' . filesize($path));
		header('Content-Transfer-Encoding: binary');
		header('Cache-Control: private, no-store');
		header('Pragma: no-cache');

		while (!feof($fh) && !connection_aborted()) {
			echo fread($fh, 1048576);
			flush();
		}
		$sent = feof($fh) && !connection_aborted();
		fclose($fh);

		if ($exit) exit;
		return $sent;

	}

	/**
	 * Remove a job directory. Public only because index() registers it as a shutdown function;
	 * nothing else outside this class should call it.
	 *
	 * @param string $job_dir
	 */
	public function _cleanup($job_dir) {

		if ($this->keep_job_dir) return;
		$this->_delete_dir($job_dir);

	}

	private function _delete_dir($dir) {

		if (!is_dir($dir)) return;

		$it = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
			RecursiveIteratorIterator::CHILD_FIRST
		);
		foreach ($it as $item) {
			if ($item->isDir()) @rmdir($item->getPathname()); else @unlink($item->getPathname());
		}
		@rmdir($dir);

	}

	/**
	 * What a job built, as JSON, for ?debug=1 — the quickest way to see what a book produced
	 * without unzipping. Sets keep_job_dir so the directory survives to be looked at.
	 */
	private function _debug($job_dir, array $job) {

		$this->keep_job_dir = true;
		$this->_json(array(
			'job_dir'   => $job_dir,
			'rendered'  => $job['rendered'],
			'errors'    => $job['errors'],
			'steps'     => $job['steps'],
			'dataBytes' => isset($job['result']['dataBytes']) ? $job['result']['dataBytes'] : 0,
			'maps'      => isset($job['result']['maps']) ? $job['result']['maps'] : null,
		), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

	}

	private function _json($data, $flags = 0) {

		while (ob_get_level()) ob_end_clean();
		header('Content-Type: application/json');
		header('Cache-Control: no-store');
		echo json_encode($data, $flags);
		exit;

	}

	/**
	 * Answer with a plain-text explanation rather than a half-written download. The reader is an
	 * author in a dashboard, not a developer reading a log, so the message says what happened
	 * and nothing about where in the code it happened.
	 *
	 * @param int    $status
	 * @param string $message
	 */
	private function _fail($status, $message) {

		while (ob_get_level()) ob_end_clean();
		http_response_code($status);
		header('Content-Type: text/plain; charset=utf-8');
		echo $message . "\n";
		exit;

	}

	/**
	 * The first few problems from a failed render, for a message an author can act on or quote.
	 *
	 * @param  array $errors
	 * @return string
	 */
	private function _error_summary(array $errors) {

		if (empty($errors)) return 'No reason was recorded. Re-run with ?debug=1 for details.';

		$lines = array();
		foreach (array_slice($errors, 0, 5, true) as $where => $what) {
			$lines[] = $where . ': ' . $what;
		}
		if (count($errors) > 5) $lines[] = '(and ' . (count($errors) - 5) . ' more)';

		return "Problems:\n  " . implode("\n  ", $lines);

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

		$this->_json(array(
			'usesMaps'      => $this->static_export_model->uses_maps($this->data['book']->book_id),
			'googleMapsKey' => $defaults['googleMapsKey'],
		));

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
	 * The job's site settings: this installation's defaults, with the author's answers from
	 * the export dialog applied. Neither the Google Maps key nor the site address is stored
	 * anywhere but the job, which is deleted once its ZIP is downloaded.
	 */
	private function _export_options() {

		$options  = $this->static_export_model->default_map_options();
		$provider = $this->input->post('maps_provider');

		if ('google' === $provider) {
			$options['googleMapsKey'] = trim((string) $this->input->post('google_maps_key'));
		} elseif (is_string($provider) && '' !== $provider) {
			$options['googleMapsKey'] = '';
		}

		// Search engines: off unless the author ticked the box *and* gave an address. A sitemap
		// needs absolute URLs, so without one there is nothing to write; the address is also
		// what lets 404.html offer a reliable way back to the book.
		$site_url = trim((string) $this->input->post('site_url'));
		if ('' !== $site_url && !preg_match('#^https?://#i', $site_url)) $site_url = 'https://' . $site_url;

		$options['searchEngines'] = ('1' === (string) $this->input->post('search_engines')) && '' !== $site_url;
		$options['siteUrl']       = $site_url;

		return $options;

	}

}
