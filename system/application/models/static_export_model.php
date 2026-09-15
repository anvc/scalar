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
 * @projectDescription  Model for fetching and normalizing a Scalar book's content
 *                      into the scalar-data.json structure used by the static exporter.
 *                      Data is sourced from the same model layer as the RDF-JSON export.
 */

if (!defined('BASEPATH')) exit('No direct script access allowed');

class Static_Export_Model extends MY_Model {

	/**
	 * Predicates already surfaced as top-level fields in the normalized schema.
	 * These are excluded from additionalMetadata to avoid duplication.
	 */
	private static $EXCLUDED_PREDICATES = array(
		// Core content — in normalized schema as
		// title/description/body/layout/created/sourceUrl/thumbnail/versionNumber
		'http://purl.org/dc/terms/title',
		'http://purl.org/dc/terms/description',
		'http://rdfs.org/sioc/ns#content',
		'http://scalar.usc.edu/2012/01/scalar-ns#defaultView',
		'http://purl.org/dc/terms/created',
		'http://simile.mit.edu/2003/10/ontologies/artstor#url',
		'http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail',
		'http://open.vocab.org/terms/versionnumber',
		// Structural — versioning/identity bookkeeping, not meaningful in a static export
		'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
		'http://purl.org/dc/terms/hasVersion',
		'http://purl.org/dc/terms/isVersionOf',
		'http://scalar.usc.edu/2012/01/scalar-ns#urn',
		'http://www.w3.org/ns/prov#wasAttributedTo',
	);

	/**
	 * Total bytes of self-hosted media above which _copy_media_files() logs a
	 * non-fatal size warning (200 MB).
	 */
	const MEDIA_SIZE_WARNING_BYTES = 209715200;

	/** Namespace URIs, spelled out because the baked graph is consumed as expanded RDF-JSON. */
	const RDF_TYPE  = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
	const NS_SCALAR = 'http://scalar.usc.edu/2012/01/scalar-ns#';
	const NS_ART    = 'http://simile.mit.edu/2003/10/ontologies/artstor#';

	public function __construct() {

		parent::__construct();

		$this->load->model('book_model',       'books');
		$this->load->model('page_model',       'pages');
		$this->load->model('version_model',    'versions');
		$this->load->model('path_model',       'paths');
		$this->load->model('tag_model',        'tags');
		$this->load->model('annotation_model', 'annotations');
		$this->load->model('reference_model',  'references');

	}

	// -------------------------------------------------------------------------
	// Public API
	// -------------------------------------------------------------------------

	/**
	 * Fetch all content for a book and return the normalized scalar-data.json structure.
	 *
	 * @param  int   $book_id
	 * @return array Normalized data ready for json_encode()
	 */
	public function get_book_data($book_id) {

		$book     = $this->books->get($book_id);
		$base_uri = confirm_slash(base_url()) . confirm_slash($book->slug);

		$pages       = array();
		$media       = array();
		$paths       = array();
		$tags        = array();
		$annotations = array();

		$this->_build_content($book_id, $base_uri, $pages, $media);
		$this->_build_paths($book_id, $base_uri, $paths);
		$this->_build_tags($book_id, $base_uri, $tags);
		$this->_build_annotations($book_id, $media, $annotations);
		$this->_build_references($book_id, $pages, $media);
		$this->_build_excerpts($pages, $media, $base_uri);
		$lenses = $this->_build_lenses($book_id, $pages);
		$toc = $this->_build_toc($book_id);

		$book_data = array(
			'meta'        => $this->_build_meta($book),
			'pages'       => $pages,
			'media'       => $media,
			'paths'       => $paths,
			'tags'        => $tags,
			'annotations' => $annotations,
			'lenses'      => $lenses,
			'toc'         => $toc,
		);

		// Flatten paths, tags and annotations into the single list of Open Annotation
		// relations both the page template and the baked graph render from, so the URN and
		// anchor-fragment rules live in one place rather than being restated in each.
		$book_data['relations'] = $this->_build_relations($book_data);

		return $book_data;

	}

	/**
	 * Render all composite pages and media items to <tmp_dir>/<slug>/index.html using
	 * page.php, bundling self-hosted media into <tmp_dir>/media/ along the way. Each item
	 * also gets a plain metadata page at <tmp_dir>/<slug>.meta/index.html (see
	 * _write_meta_page()).
	 *
	 * The home page is the one exception to the <slug>/index.html layout: a page with
	 * slug 'index' is written once, directly to <tmp_dir>/index.html, and gets no
	 * <tmp_dir>/index/ directory of its own. Books with no 'index' page get a
	 * <meta refresh> redirect to the first TOC page at <tmp_dir>/index.html instead.
	 * Either way the home page keeps its <tmp_dir>/index.meta/ sibling.
	 *
	 * @param  array  $book_data  Full normalized structure from get_book_data()
	 * @param  string $tmp_dir    Absolute path to the writable temp directory (no trailing slash)
	 * @return array  ['rendered' => [...], 'skipped' => [...], 'errors' => [slug => msg]]
	 */
	public function render_book($book_data, $tmp_dir) {

		$CI =& get_instance();

		$book_url  = confirm_slash(base_url()) . confirm_slash($book_data['meta']['slug']);
		$rendered  = array();
		$skipped   = array();
		$errors    = array();
		$wrote_root_index = false;   // true once <tmp_dir>/index.html has been written

		// Copy self-hosted media into the export first, so page bodies can be rewritten
		// (below) to point at the bundled local copies rather than the live server.
		$this->_copy_media_files($book_data, $tmp_dir, $errors);

		foreach ($book_data['pages'] as $slug => $page) {

			// The home page lives at the export root rather than in a directory of its
			// own, so it sits one level shallower than every other page and its relative
			// paths differ accordingly.
			$is_root_page = ($slug === 'index');
			$asset_root   = $is_root_page ? './' : self::_asset_root($slug);
			$page_dir     = $tmp_dir . '/' . $slug;
			$out_file     = $is_root_page ? $tmp_dir . '/index.html' : $page_dir . '/index.html';

			if (!$is_root_page && !is_dir($page_dir) && !mkdir($page_dir, 0755, true)) {
				$errors[$slug] = 'Could not create directory: ' . $page_dir;
				continue;
			}

			$render_page         = $page;
			$render_page['body'] = $this->_rewrite_links($page['body'], $book_data['media'], $book_url, $asset_root);

			$html = $this->_render_content_view($CI, $render_page, $book_data, $asset_root, $book_url, $slug, $errors);
			if ($html === null) continue;

			if (file_put_contents($out_file, $html) === false) {
				$errors[$slug] = 'Could not write: ' . $out_file;
				continue;
			}

			$rendered[] = $slug;

			if ($is_root_page) {
				$wrote_root_index = true;
			}

			// The .meta page is always a depth-1 sibling directory ('<slug>.meta/'), so it
			// is rendered with '../' even for the home page. It ignores the body passed in
			// here — _write_meta_page() substitutes a metadata table of its own.
			$this->_write_meta_page($CI, $render_page, $book_data, $tmp_dir, $book_url, $slug, $errors);
		}

		// Render each media item's own permalink page (<slug>/index.html). The current-page
		// media embed is generated entirely client-side (scalarpage.jquery.js, gated on
		// typeof="scalar:Media" — see page.php) once the node's RDFa carries its source URL.
		foreach ($book_data['media'] as $slug => $item) {

			$page_dir = $tmp_dir . '/' . $slug;

			if (!is_dir($page_dir) && !mkdir($page_dir, 0755, true)) {
				$errors[$slug] = 'Could not create directory: ' . $page_dir;
				continue;
			}

			// Media items carry body copy too (see _normalize_media), so it needs the same
			// link rewriting the page loop above does.
			$render_item         = $item;
			$render_item['body'] = $this->_rewrite_links(
				isset($item['body']) ? $item['body'] : '',
				$book_data['media'], $book_url, self::_asset_root($slug)
			);

			$html = $this->_render_content_view($CI, $render_item, $book_data, self::_asset_root($slug), $book_url, $slug, $errors);
			if ($html === null) continue;

			if (file_put_contents($page_dir . '/index.html', $html) === false) {
				$errors[$slug] = 'Could not write: ' . $page_dir . '/index.html';
				continue;
			}

			$rendered[] = $slug;

			$this->_write_meta_page($CI, $render_item, $book_data, $tmp_dir, $book_url, $slug, $errors);
		}

		// The book's lens browser, which is chrome rather than content and so is written
		// outside both loops above.
		$this->_write_lens_browser_page($CI, $book_data, $tmp_dir, $book_url, $errors);

		// Books with an 'index' page already wrote <tmp_dir>/index.html in the loop above.
		// Without one, stand in a meta-refresh redirect to the first TOC page so the export
		// root still lands somewhere.
		if (!$wrote_root_index) {
			$first_slug = !empty($book_data['toc']) ? $book_data['toc'][0] : null;
			if ($first_slug) {
				$index_html = '<!DOCTYPE html><html><head>'
					. '<meta http-equiv="refresh" content="0; url=' . htmlspecialchars($first_slug) . '/" />'
					. '<title>' . htmlspecialchars(strip_tags($book_data['meta']['title'])) . '</title>'
					. '</head><body></body></html>';

				if (file_put_contents($tmp_dir . '/index.html', $index_html) === false) {
					$errors['index.html'] = 'Could not write root index.html';
				}
			}
		}

		// Write the baked server data the bridge answers API calls from, then the bridge
		// itself. Order matters only for readability — page.php loads the data file first.
		$this->_write_static_data($tmp_dir, $book_data, $book_url, $errors);

		// Write the API intercept bridge script that all pages reference.
		$bridge_js = $CI->load->view('static_export/bridge', array(), true);
		if (file_put_contents($tmp_dir . '/scalar-static-bridge.js', $bridge_js) === false) {
			$errors['scalar-static-bridge.js'] = 'Could not write scalar-static-bridge.js';
		}

		$this->_copy_assets($tmp_dir, $errors);

		return array(
			'rendered' => $rendered,
			'skipped'  => $skipped,
			'errors'   => $errors,
			// Size of the one file every page loads at boot. Worth watching: it holds the whole
			// book's graph and, since content filters need it, the whole book's prose as well
			// (see _build_search_text). Reported rather than capped — a book big enough for this
			// to matter is a judgement call, not an error.
			'dataBytes' => file_exists($tmp_dir . '/scalar-static-data.js')
				? filesize($tmp_dir . '/scalar-static-data.js') : 0,
		);

	}

	/**
	 * Write <tmp_dir>/manage_lenses/index.html — the "Browse Lenses" page, which the header's
	 * Lenses menu links to on every page of every book (scalarheader.jquery.js builds that
	 * entry unconditionally, so before this existed the menu's first item was a 404).
	 *
	 * Rendered through the same static_export/page.php as everything else, so it carries the
	 * book's chrome, navigation and JS stack, with the lens manager's markup as its body and
	 * 'isLensBrowser' telling the template two things: load the lens editor's assets, and state
	 * no node for this page. The live site's own manage_lenses view is exactly that shape — a
	 * view rendered into the content region of a page with no $page behind it.
	 *
	 * The slug is 'manage_lenses' because that is what scalarheader builds the link from
	 * (urlPrefix + 'manage_lenses'), which puts it in the same namespace as the book's own
	 * slugs — and so under the same rewrite as any other node link, with no special case in
	 * the bridge. Scalar routes that name itself (see Book::manage_lenses()), so no page of a
	 * book can be holding it.
	 *
	 * No .meta sibling: there is no node here to describe.
	 */
	private function _write_lens_browser_page($CI, $book_data, $tmp_dir, $book_url, &$errors) {

		$slug       = 'manage_lenses';
		$asset_root = self::_asset_root($slug);
		$page_dir   = $tmp_dir . '/' . $slug;

		if (!is_dir($page_dir) && !mkdir($page_dir, 0755, true)) {
			$errors[$slug] = 'Could not create directory: ' . $page_dir;
			return false;
		}

		$item = array(
			'slug'          => $slug,
			'title'         => 'Lenses',
			'description'   => 'Lenses allow you to search and visualize the content of this project.',
			'layout'        => 'plain',
			'isLensBrowser' => true,
			'body'          => $CI->load->view(
				'static_export/lens_browser',
				array('asset_root' => $asset_root),
				true
			),
		);

		$html = $this->_render_content_view($CI, $item, $book_data, $asset_root, $book_url, $slug, $errors);
		if ($html === null) return false;

		if (file_put_contents($page_dir . '/index.html', $html) === false) {
			$errors[$slug] = 'Could not write: ' . $page_dir . '/index.html';
			return false;
		}

		return true;

	}

	/**
	 * Render a static_export view for one content item (page or media) and return the HTML,
	 * or null (with $errors populated) if rendering failed.
	 */
	private function _render_content_view($CI, $render_page, $book_data, $asset_root, $book_url, $slug, &$errors, $view = 'static_export/page') {

		$view_data = array(
			'page'       => $render_page,
			'book_data'  => $book_data,
			'asset_root' => $asset_root,
			'book_url'   => $book_url,
		);

		try {
			return $CI->load->view($view, $view_data, true);
		} catch (Exception $e) {
			$errors[$slug] = $e->getMessage();
			return null;
		}

	}

	/**
	 * Write <tmp_dir>/<slug>.meta/index.html — the same Scalar interface as <slug>/index.html
	 * (same static_export/page.php template, full header/JS chain), with the body replaced by
	 * a metadata table instead of the item's normal content. Replaces the live site's ".meta"
	 * URL extension (see static_export/bridge.php's colophon patch, which points the footer's
	 * "Metadata" link here instead).
	 *
	 * Rendering through the full page.php — rather than a bare, JS-free page, which is what
	 * this used to do — matters for more than cosmetics: main.js only reveals <body> (it's
	 * hidden by default until boot completes) once its own script chain finishes running, so a
	 * page carrying none of that JS never uncovers its content at all.
	 *
	 * The 'meta' item also carries 'isMetaView' => true, which page.php uses to emit
	 * scalar:defaultView=meta as RDFa on the current node — this is what makes
	 * scalarpage.jquery.js pick its case "meta" branch client-side (inserting the "Metadata"
	 * h2, etc.), the same way a live ".meta"-extension URL would. Extension-based routing
	 * itself doesn't work for us: scalarapi.getFileExtension() reads the last path segment of
	 * the URL, which for a directory-style static host is "index.html" (or empty), never
	 * literally "meta".
	 *
	 * Lives at the same directory depth as <slug>/index.html (a sibling directory), so it
	 * takes the same _asset_root() as that page. The home page is the one place the two
	 * differ: it is rendered at the export root with './', but its index.meta/ is a real
	 * directory and needs '../'.
	 */
	private function _write_meta_page($CI, $item, $book_data, $tmp_dir, $book_url, $slug, &$errors) {

		$meta_dir = $tmp_dir . '/' . $slug . '.meta';

		if (!is_dir($meta_dir) && !mkdir($meta_dir, 0755, true)) {
			$errors['meta:' . $slug] = 'Could not create directory: ' . $meta_dir;
			return;
		}

		$is_media = isset($book_data['media'][$slug]);

		// <slug>.meta/ is a sibling of <slug>/, so it sits at the same depth and shares
		// that page's asset root — including for the home page, which is rendered at the
		// export root with './' but whose index.meta/ still needs '../'.
		$asset_root = self::_asset_root($slug);

		$meta_item              = $item;
		$meta_item['body']      = $this->_build_meta_page_body($item, $is_media, $asset_root);
		$meta_item['isMetaView'] = true;
		// A lens page's .meta view is a metadata table, not the lens: scalarpage only runs the
		// lens editor on the 'plain' view, so the property and the editor's assets would both
		// be dead weight here.
		unset($meta_item['lens']);

		$html = $this->_render_content_view($CI, $meta_item, $book_data, $asset_root, $book_url, 'meta:' . $slug, $errors);
		if ($html === null) return;

		if (file_put_contents($meta_dir . '/index.html', $html) === false) {
			$errors['meta:' . $slug] = 'Could not write: ' . $meta_dir . '/index.html';
		}

	}

	/**
	 * Build the metadata table HTML shown on a content item's .meta page — a static-export
	 * equivalent of the live site's system/application/views/melons/cantaloupe/meta.php
	 * (resource row + one row per RDF predicate). Historical versions are omitted: the live
	 * template loops over $page->versions showing each one's full metadata, but a static
	 * export only ever contains the single most-recent version (see CLAUDE.md — version
	 * history is dropped), so there is nothing to loop over.
	 *
	 * Wrapped in the same "ci-template-html meta-page page_margins" div the live site's
	 * content wrapper puts around a loaded partial view (meta.php, versions.php, etc.) in
	 * place of ordinary sioc:content body-copy — scalarpage.jquery.js's case "meta" branch
	 * (see the switch(viewType) block) reclasses .meta-page to page_margins itself, but only
	 * if that class is already present to find; this bakes the end state in directly rather
	 * than relying on a swap it isn't otherwise triggering here.
	 *
	 * @param  array  $item      Normalized page or media entry (book_data['pages'|'media'])
	 * @param  bool   $is_media
	 * @param  string $asset_root  Relative path from this page's directory to the export root
	 * @return string              HTML for the wrapping <div> (<h3> label + <table>)
	 */
	private function _build_meta_page_body($item, $is_media, $asset_root) {

		$html  = '<div class="ci-template-html meta-page page_margins">' . "\n";
		$html .= '<h3 style="clear:both;">' . ($is_media ? 'Media' : 'Page') . '</h3>' . "\n";
		$html .= '<table class="table table-striped caption_font small" cellspacing="2" cellpadding="0">' . "\n";
		$html .= $this->_meta_table_row(
			'resource',
			'rdf:resource',
			'<a href="' . htmlspecialchars($item['url']) . '">' . htmlspecialchars($item['url']) . '</a>'
		);

		if (!empty($item['title'])) {
			$html .= $this->_meta_table_row('title', 'dcterms:title', htmlspecialchars($item['title']));
		}
		if (!empty($item['description'])) {
			$html .= $this->_meta_table_row('description', 'dcterms:description', htmlspecialchars($item['description']));
		}
		if (!empty($item['created'])) {
			$html .= $this->_meta_table_row('created', 'dcterms:created', htmlspecialchars($item['created']));
		}
		if (!empty($item['versionNumber'])) {
			$html .= $this->_meta_table_row('versionnumber', 'ov:versionnumber', (int) $item['versionNumber']);
		}

		if ($is_media) {
			$source_href = $item['localPath'] !== null ? $asset_root . $item['localPath'] : $item['sourceUrl'];
			$html .= $this->_meta_table_row(
				'url',
				'art:url',
				'<a href="' . htmlspecialchars($source_href) . '">' . htmlspecialchars($source_href) . '</a>'
			);
		}

		// Outside the $is_media branch: Scalar stores these on the content row, so a page can
		// carry them too. Each raw stored value is a path relative to the book root, not to
		// this page, so linking it verbatim (as the thumbnail row used to) produced a dead
		// link that the bridge's node-link rewriting then mistook for a page slug.
		$aux_predicates = array(
			'thumbnail'  => 'art:thumbnail',
			'banner'     => 'scalar:banner',
			'background' => 'scalar:background',
		);

		foreach ($aux_predicates as $field => $predicate) {
			$href = self::_aux_image_href($item, $field, $asset_root);
			if ($href === null) continue;
			$html .= $this->_meta_table_row(
				$field,
				$predicate,
				'<a href="' . htmlspecialchars($href) . '">' . htmlspecialchars($href) . '</a>'
			);
		}

		foreach ((isset($item['additionalMetadata']) ? $item['additionalMetadata'] : array()) as $predicate => $values) {
			foreach ((array) $values as $v) {
				if (empty($v['value'])) continue;
				$value_html = filter_var($v['value'], FILTER_VALIDATE_URL)
					? '<a href="' . htmlspecialchars($v['value']) . '">' . htmlspecialchars($v['value']) . '</a>'
					: htmlspecialchars($v['value']);
				$html .= $this->_meta_table_row($this->_humanize_predicate($predicate), htmlspecialchars($predicate), $value_html);
			}
		}

		$html .= '</table>' . "\n";
		$html .= '</div>' . "\n";

		return $html;

	}

	private function _meta_table_row($human_label, $predicate, $value_html) {
		return '<tr><td style="white-space:nowrap;"><b>' . $human_label . '</b></td>'
			. '<td>' . $predicate . '</td>'
			. '<td>' . $value_html . '</td></tr>' . "\n";
	}

	/**
	 * Mirrors the live meta.php template's predicate-to-label transform:
	 * no_ns($p) -> spacify() -> lowercase -> strip anything before a trailing '#' fragment.
	 */
	private function _humanize_predicate($predicate) {

		$CI =& get_instance();
		$CI->load->helper('string');

		$label = strtolower(spacify(str_replace('_', ' ', no_ns($predicate))));
		$hash  = strpos($label, '#');
		if ($hash !== false) {
			$label = substr($label, $hash + 1);
		}

		return htmlspecialchars($label);

	}

	// -------------------------------------------------------------------------
	// Private — section builders
	// -------------------------------------------------------------------------

	/**
	 * Build the meta block from the book row.
	 */
	private function _build_meta($book) {

		$CI =& get_instance();
		$scalar_version = trim($CI->load->view('scalar-version', array(), true));

		// The book's background is the fallback <body> background image for every page that
		// doesn't set one of its own — the same precedence the live wrapper.php applies.
		$background = !empty($book->background) ? trim($book->background) : null;

		return array(
			'title'          => strip_tags($book->title),
			'slug'           => $book->slug,
			// Every RDF prefix this install knows, for page.php's <html xmlns:*> declarations.
			// scalarapi builds model.namespaces from exactly those attributes, and uses it in
			// toNS() to decide whether a predicate is nameable at all — ScalarVersion.parseData()
			// drops any predicate toNS() can't shorten, so an undeclared prefix means that
			// metadata is invisible to the Details tab and unsearchable by a lens. The live
			// wrapper.php declares the whole config list for the same reason.
			'namespaces'     => (array) $CI->config->item('namespaces'),
			'description'    => isset($book->description) ? $book->description : '',
			'exportDate'     => date('c'),
			'scalarVersion'  => $scalar_version ?: '2.x',
			'background'     => $background,
			'backgroundUrl'  => abs_url($background, confirm_slash(base_url()) . confirm_slash($book->slug)),
			'localBackground'=> null,   // populated by _copy_media_files()
		);

	}

	/**
	 * Bulk-fetch all live content rows and their most recent versions in two queries,
	 * then sort into $pages and $media by content type.
	 *
	 * Using two queries (one for content, one bulk version fetch) rather than N+1
	 * per-item version lookups.
	 */
	private function _build_content($book_id, $base_uri, &$pages, &$media) {

		// 1. All live content rows for this book.
		$content_rows = $this->pages->get_all($book_id, null, null, true);

		if (empty($content_rows)) return;

		// 2. Collect the recent_version_ids, skipping any content with no version yet.
		$version_id_map = array();   // version_id => content_id
		foreach ($content_rows as $row) {
			if (empty($row->recent_version_id)) continue;
			$version_id_map[$row->recent_version_id] = $row->content_id;
		}

		if (empty($version_id_map)) return;

		// 3. Bulk-fetch all those versions in one query.
		$this->db->where_in('version_id', array_keys($version_id_map));
		$version_rows = $this->db->get($this->versions_table)->result();

		$version_by_id = array();
		foreach ($version_rows as $v) {
			$version_by_id[$v->version_id] = $v;
		}

		// 4. Bulk-fetch ARC2 additional metadata for all versions in one SPARQL query.
		$arc_meta = $this->_fetch_arc_metadata(array_keys($version_id_map));

		// 5. Normalize each content row.
		foreach ($content_rows as $row) {
			if (empty($row->recent_version_id)) continue;
			$version = isset($version_by_id[$row->recent_version_id])
				? $version_by_id[$row->recent_version_id]
				: null;
			if (empty($version)) continue;

			$meta = isset($arc_meta[$row->recent_version_id])
				? $this->_clean_arc_meta($arc_meta[$row->recent_version_id])
				: array();

			if ('media' === $row->type) {
				$media[$row->slug] = $this->_normalize_media($row, $version, $base_uri, $meta);
			} else {
				// 'composite' covers pages, paths, tags, and categorized pages
				// (commentary, review, term). All appear in $pages so the renderer
				// can display them; paths and tags are also indexed separately.
				$pages[$row->slug] = $this->_normalize_page($row, $version, $base_uri, $meta);
			}
		}

	}

	/**
	 * Backfill each item's 'references' — the other content it links to or embeds. A page that
	 * embeds a media item references it; so does a page whose body links to another page, and
	 * a "note" relationship. Scalar records all of them in rel_referenced.
	 *
	 * These are what draw the edges between pages and the media they use in the connections,
	 * radial and tree visualizations, and what fills the "Citations of this media" list in the
	 * media Citations dialog. Without them a book's content nodes appear in those views as
	 * unconnected islands.
	 *
	 * Stored on the referencing item rather than in a collection of their own because that is
	 * the direction the reader needs: ScalarVersion.parseRelations() builds the relation from
	 * dcterms:references on the referencing version, and derives the inverse itself.
	 *
	 * @param  int    $book_id
	 * @param  array  &$pages  book_data['pages']; mutated
	 * @param  array  &$media  book_data['media']; mutated
	 */
	private function _build_references($book_id, &$pages, &$media) {

		// As with paths and tags, MY_Model::get_all() on a relationship table returns the
		// *parent* content rows — here, the items doing the referencing — with content.*
		// fields, so recent_version_id is present.
		$parent_rows = $this->references->get_all($book_id);

		foreach ($parent_rows as $parent) {

			if (empty($parent->recent_version_id)) continue;

			$children = $this->references->get_children($parent->recent_version_id, null, null, true);
			if (empty($children)) continue;

			// A page can reference the same item more than once — embed a media file twice,
			// or link it and then annotate it. One relation per pair is all the model wants.
			$slugs = array();
			foreach ($children as $child) {
				if (empty($child->child_content_slug)) continue;
				$slugs[$child->child_content_slug] = true;
			}

			$slugs = array_keys($slugs);
			if (empty($slugs)) continue;

			if (isset($pages[$parent->slug])) {
				$pages[$parent->slug]['references'] = $slugs;
			} elseif (isset($media[$parent->slug])) {
				$media[$parent->slug]['references'] = $slugs;
			}

		}

	}

	/**
	 * Build the whole book's graph as RDF-JSON — the same shape jquery.RDFa's dump() produces
	 * from markup, so ScalarModel.parseNodes()/parseRelations() consume it unchanged:
	 *
	 *     { "<subject uri>": { "<predicate uri>": [ {value, type}, … ] } }
	 *
	 * This replaces the per-page RDFa block that used to restate every node on every page —
	 * an O(N^2) cost that reached hundreds of megabytes on a book of a few hundred items. Each
	 * page now carries only itself and its immediate neighbours (see page.php), and the bridge
	 * seeds this file into the model at boot.
	 *
	 * Asset paths (art:url, art:thumbnail, scalar:banner) are stored relative to the *export
	 * root*, not to any page — a shared file has no single page to be relative to. The bridge
	 * prefixes them with the reading page's own path back to the root when it seeds; see its
	 * ASSET_PREDICATES handling.
	 *
	 * @param  array  $book_data  Full normalized structure, including ['relations']
	 * @param  string $book_url   Live Scalar base URL for this book, trailing slash included
	 * @return array              RDF-JSON for the entire book
	 */
	private function _build_graph($book_data, $book_url) {

		$graph     = array();
		$all_pages = array_merge($book_data['pages'], $book_data['media']);
		$book_uri  = rtrim($book_url, '/');

		$uri = function ($v) { return array(array('value' => (string) $v, 'type' => 'uri')); };
		$lit = function ($v) { return array(array('value' => (string) $v, 'type' => 'literal')); };

		// --- Book node ---------------------------------------------------------------
		$has_part = array();
		foreach ($all_pages as $s => $ignored) $has_part[] = array('value' => $book_url . $s, 'type' => 'uri');

		$graph[$book_uri] = array(
			self::RDF_TYPE                       => $uri(self::NS_SCALAR . 'Book'),
			'http://purl.org/dc/terms/title'     => $lit(strip_tags($book_data['meta']['title'])),
			'http://purl.org/dc/terms/tableOfContents' => $uri($book_url . 'toc'),
		);
		if (!empty($has_part)) $graph[$book_uri]['http://purl.org/dc/terms/hasPart'] = $has_part;

		// --- Table of contents -------------------------------------------------------
		// scalarheader builds the main menu from this node's dcterms:references, in order.
		$toc_refs = array();
		foreach ($book_data['toc'] as $i => $toc_slug) {
			$toc_refs[] = array('value' => $book_url . $toc_slug . '#index=' . ($i + 1), 'type' => 'uri');
		}
		$graph[$book_url . 'toc'] = array(
			self::RDF_TYPE                   => $uri(self::NS_SCALAR . 'Page'),
			'http://purl.org/dc/terms/title' => $lit('Main Menu'),
		);
		if (!empty($toc_refs)) $graph[$book_url . 'toc']['http://purl.org/dc/terms/references'] = $toc_refs;

		// --- Every content node, and its version --------------------------------------
		foreach ($all_pages as $slug => $item) {
			$is_media = isset($book_data['media'][$slug]);
			$graph    = $graph + $this->_graph_entries_for_item($item, $slug, $is_media, $book_url, $all_pages);
		}

		// --- Relations ----------------------------------------------------------------
		foreach ($book_data['relations'] as $rel) {
			$graph[$rel['urn']] = array(
				self::RDF_TYPE => $uri('http://www.openannotation.org/ns/Annotation'),
				'http://www.openannotation.org/ns/hasBody'   => $uri($book_url . $rel['body'] . '.1'),
				'http://www.openannotation.org/ns/hasTarget' => $uri($book_url . $rel['target'] . '.1' . $rel['fragment']),
			);
		}

		return $graph;

	}

	/**
	 * The node and version subjects for one content item, in RDF-JSON. Kept beside
	 * _build_graph() but factored out because page.php emits the identical predicate set
	 * inline for the current page and its neighbours — the two have to stay in step, and a
	 * node parsed from either source must come out the same.
	 *
	 * @return array  two entries: the node URI and its version URI
	 */
	private function _graph_entries_for_item($item, $slug, $is_media, $book_url, $all_pages) {

		$uri = function ($v) { return array(array('value' => (string) $v, 'type' => 'uri')); };
		$lit = function ($v) { return array(array('value' => (string) $v, 'type' => 'literal')); };

		$node_uri = $book_url . $slug;
		$ver_uri  = $node_uri . '.1';

		// Node subject
		$node = array(
			self::RDF_TYPE                        => $uri(self::NS_SCALAR . ($is_media ? 'Media' : 'Composite')),
			'http://purl.org/dc/terms/hasVersion' => $uri($ver_uri),
			'http://purl.org/dc/terms/isPartOf'   => $uri(rtrim($book_url, '/')),
		);
		// The content URN, which is how a node is identified in the reader's own visit history.
		// jquery.scalarrecent.js stores it against each page the reader opens, ScalarLenses
		// hands the resulting id=>timestamp map to the lens endpoint as 'history', and both the
		// visit-date filter and the visit-date sort match nodes against it by content id. This
		// is the only place the id enters the export — everything else addresses nodes by slug.
		if (!empty($item['contentId'])) {
			$node[self::NS_SCALAR . 'urn'] = $uri('urn:scalar:content:' . (int) $item['contentId']);
		}
		// Node-level asset paths, stored export-root-relative for the bridge to resolve.
		if (!empty($item['localThumbnail'])) {
			$node[self::NS_ART . 'thumbnail'] = $lit($item['localThumbnail']);
		} elseif (!empty($item['thumbnailUrl'])) {
			$node[self::NS_ART . 'thumbnail'] = $lit($item['thumbnailUrl']);
		}
		if (!empty($item['localBanner'])) {
			$node[self::NS_SCALAR . 'banner'] = $lit($item['localBanner']);
		} elseif (!empty($item['bannerUrl'])) {
			$node[self::NS_SCALAR . 'banner'] = $lit($item['bannerUrl']);
		}

		// Version subject
		$version = array(
			self::RDF_TYPE                          => $uri(self::NS_SCALAR . 'Version'),
			'http://purl.org/dc/terms/isVersionOf'  => $uri($node_uri),
			'http://purl.org/dc/terms/title'        => $lit($item['title']),
			'http://purl.org/dc/terms/description'  => $lit(isset($item['description']) ? $item['description'] : ''),
		);
		// The passage that cites other content, which the media Citations dialog quotes. See
		// _build_excerpts() for why this is an excerpt rather than the whole body.
		if (!empty($item['excerpt'])) $version['http://rdfs.org/sioc/ns#content'] = $lit($item['excerpt']);
		if (!empty($item['created']))       $version['http://purl.org/dc/terms/created'] = $lit($item['created']);
		if (!empty($item['versionNumber'])) $version['http://open.vocab.org/terms/versionnumber'] = $lit((int) $item['versionNumber']);
		if (!empty($item['layout']) && 'plain' !== $item['layout']) {
			$version[self::NS_SCALAR . 'defaultView'] = $lit($item['layout']);
		}

		// References — the other content this item links to or embeds.
		if (!empty($item['references'])) {
			$refs = array();
			foreach ($item['references'] as $ref_slug) {
				if (!isset($all_pages[$ref_slug])) continue;
				$refs[] = array('value' => $book_url . $ref_slug, 'type' => 'uri');
			}
			if (!empty($refs)) $version['http://purl.org/dc/terms/references'] = $refs;
		}

		if ($is_media && !empty($item['sourceUrl'])) {
			$version[self::NS_ART . 'url'] = $lit(
				$item['localPath'] !== null ? $item['localPath'] : $item['sourceUrl']);
		}

		/* The item's additional metadata — every predicate an author (or an image's EXIF/IPTC
		 * block) put on the version beyond Scalar's own fields, already in RDF-JSON shape and
		 * already stripped of the predicates restated above (see _clean_arc_meta() and
		 * $EXCLUDED_PREDICATES). Previously only a media item's dcterms:accessRights and
		 * dcterms:type made it in, which is what jquery.mediaelement.js reads; the rest was
		 * dropped, and with it:
		 *
		 *   - every lens or search that filters on a metadata field, which is how Scalar's
		 *     search box works for anything but a plain title match;
		 *   - the distance filter and the items-by-distance selector, which read coordinates
		 *     out of dcterms:spatial / dcterms:coverage;
		 *   - the map visualization, which needs those same coordinates;
		 *   - the Details tab of the media info panel, which lists auxProperties.
		 *
		 * Added last, and only where the predicate is otherwise unspoken for, so the version
		 * row's own title/description/created always win over a stale copy in the triple store.
		 */
		foreach ((array) (isset($item['additionalMetadata']) ? $item['additionalMetadata'] : array())
				as $predicate => $values) {
			if (isset($version[$predicate]) || !is_array($values) || empty($values)) continue;
			$version[$predicate] = array_values($values);
		}

		return array($node_uri => $node, $ver_uri => $version);

	}

	/**
	 * Capture, for each item that references media, the passage of its body that does the
	 * referencing — the block element containing the link.
	 *
	 * This is what fills "Citations of this media" in the media Citations dialog. That panel
	 * quotes the sentence around each citation, and it builds the quote by reading the citing
	 * page's sioc:content, finding the <a resource="…"> for the media inside it and taking
	 * that anchor's parent's HTML (see scalarmediadetails.jquery.js). So the content it needs
	 * is not the whole page — only enough of it to contain the link and its surrounding block.
	 *
	 * Baking whole bodies instead would work, and the shared graph could carry them, but every
	 * page would then download and parse every other page's prose at boot to render a handful
	 * of quotations. Excerpts keep that cost proportional to the citations themselves.
	 *
	 * The consequence to know about: for any node other than the one being viewed, the model's
	 * version content is this excerpt rather than the full body. Nothing in an export rendered
	 * body copy from the model before — other nodes carried no content at all — so this is
	 * strictly more than was there, but a page-content widget pointed at another page will
	 * show the excerpt, not the whole thing.
	 *
	 * @param array &$pages
	 * @param array &$media
	 */
	private function _build_excerpts(&$pages, &$media, $base_uri) {

		foreach (array('pages', 'media') as $collection) {
			$items = ($collection === 'pages') ? $pages : $media;

			foreach ($items as $slug => $item) {
				if (empty($item['references']) || empty($item['body'])) continue;

				$excerpt = $this->_excerpt_for_references($item['body'], $item['references'], $base_uri);
				if ($excerpt === '') continue;

				if ($collection === 'pages') $pages[$slug]['excerpt'] = $excerpt;
				else                         $media[$slug]['excerpt'] = $excerpt;
			}
		}

	}

	/**
	 * The block elements of $html that contain a link to any of $slugs, concatenated.
	 *
	 * Scalar's editor writes an inline media link as <a resource="<slug>" …>, so the anchors
	 * are found by that attribute rather than by href, which varies with how the media is
	 * hosted. The enclosing block is returned whole — the dialog quotes the anchor's parent,
	 * and the anchor's own classes decide whether it reads as an inline embed or a citation.
	 *
	 * @param  string $html      Raw body HTML
	 * @param  array  $slugs     Referenced content slugs
	 * @param  string $base_uri  Live Scalar base URL for this book, trailing slash included
	 * @return string            Concatenated block HTML, or '' if no link was found
	 */
	private function _excerpt_for_references($html, array $slugs, $base_uri) {

		if (!class_exists('DOMDocument')) return '';

		$doc = new DOMDocument();
		$previous = libxml_use_internal_errors(true);   // body copy is rarely well-formed XML
		$loaded = $doc->loadHTML('<?xml encoding="UTF-8">' . $html,
			LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
		libxml_clear_errors();
		libxml_use_internal_errors($previous);

		if (!$loaded) return '';

		$blocks  = array('p', 'div', 'li', 'blockquote', 'td', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6');
		$wanted  = array_flip($slugs);
		$chosen  = array();
		$excerpt = '';

		foreach ($doc->getElementsByTagName('a') as $anchor) {
			$resource = $anchor->getAttribute('resource');
			if ($resource === '' || !isset($wanted[$resource])) continue;

			// Nearest block ancestor, or the anchor itself if it sits loose in the body.
			$node = $anchor;
			while ($node->parentNode !== null && $node->parentNode->nodeType === XML_ELEMENT_NODE) {
				if (in_array(strtolower($node->parentNode->nodeName), $blocks, true)) {
					$node = $node->parentNode;
					break;
				}
				$node = $node->parentNode;
			}

			// Repoint the link at the item's canonical node URL. In the body it addressed the
			// media file directly, relative to the page it sat on — which is meaningless once
			// the passage is quoted somewhere else in the book, as this one is. A node URL is
			// both correct from anywhere and the form the bridge's link rewriting recognises,
			// so it lands as a working relative path wherever the quote is rendered.
			$anchor->setAttribute('href', $base_uri . $resource);

			// One block can carry several links; emit it once.
			$key = spl_object_hash($node);
			if (isset($chosen[$key])) continue;
			$chosen[$key] = true;

			$excerpt .= $doc->saveHTML($node);
		}

		return trim($excerpt);

	}

	/**
	 * Flatten paths, tags and annotations into one list of Open Annotation relations.
	 *
	 * scalarapi derives a node's 'path'/'tag'/'annotation' scalarType — what the Index modal's
	 * tabs filter on, and what path navigation and tag lists read — purely from parsed
	 * relations (ScalarNode.addRelation), never from rdf:type. A relation reaches it only as a
	 * subject typed oac:Annotation carrying oac:hasBody (the path/tag/annotation node) and
	 * oac:hasTarget (the item it applies to).
	 *
	 * The relation's *kind* is inferred by ScalarRelation from the anchor fragment on the
	 * target URL, exactly as annotation_append() (MY_url_helper.php) builds it live:
	 *
	 *     (none)         -> tag
	 *     #index=N       -> path, at page N
	 *     #t=npt:s,e     -> annotation, temporal
	 *     #line=s,e      -> annotation, textual
	 *     #xywh=…        -> annotation, spatial region
	 *     #pos3d=…       -> annotation, 3D scene position
	 *     #posgis=…      -> annotation, geographic position
	 *
	 * Comments are deliberately absent: they are dropped from the export (see CLAUDE.md), so
	 * the Index's Comments tab reports no results rather than showing stale ones.
	 *
	 * Endpoints are slugs, left for the caller to turn into URLs — page.php needs versioned
	 * ones ('.1' suffixed, which ScalarRelation resolves with stripVersion(), so it only has
	 * to be present rather than accurate) and so does the graph.
	 *
	 * @param  array $book_data
	 * @return array  list of ['urn' => …, 'body' => slug, 'target' => slug, 'fragment' => …]
	 */
	private function _build_relations($book_data) {

		$relations = array();
		$all_pages = array_merge($book_data['pages'], $book_data['media']);

		$add = function ($urn, $body, $target, $fragment) use (&$relations, $all_pages) {
			// Skip when either endpoint was not exported — an unpublished or deleted node can
			// still be referenced by a path or tag row.
			if (!isset($all_pages[$body]) || !isset($all_pages[$target])) return;
			$relations[] = array(
				'urn'      => $urn,
				'body'     => $body,
				'target'   => $target,
				'fragment' => $fragment,
			);
		};

		// Paths: sort_number is 1-based, and is what scalarpage reads to build "page N of M"
		// navigation as well as what orders the path's contents in the Index.
		foreach ($book_data['paths'] as $path_slug => $path) {
			foreach ($path['children'] as $i => $child_slug) {
				$add('urn:scalar:path:' . $path_slug . ':' . $child_slug . ':' . ($i + 1),
					$path_slug, $child_slug, '#index=' . ($i + 1));
			}
		}

		foreach ($book_data['tags'] as $tag_slug => $tag) {
			foreach ($tag['tagged'] as $tagged_slug) {
				$add('urn:scalar:tag:' . $tag_slug . ':' . $tagged_slug, $tag_slug, $tagged_slug, '');
			}
		}

		foreach ($book_data['annotations'] as $anno_id => $anno) {
			$add($anno_id, $anno['bodySlug'], $anno['targetSlug'], self::_annotation_fragment($anno));
		}

		return $relations;

	}

	/**
	 * Rebuild the anchor fragment for one entry of book_data['annotations'], whose offsets
	 * _normalize_annotation() has already split out of the raw rel_annotated columns. Mirrors
	 * annotation_append()'s output field-for-field, including its habit of emitting nothing
	 * when every offset is empty or zero — in which case ScalarRelation falls back to typing
	 * the relation as a tag, the same as it would on the live site.
	 */
	private static function _annotation_fragment(array $a) {

		$type = isset($a['type']) ? $a['type'] : '';

		if ('textual' === $type) {
			if (empty($a['startLine']) && empty($a['endLine'])) return '';
			return '#line=' . $a['startLine'] . ',' . $a['endLine'];
		}

		if ('spatial' === $type) {
			switch ($a['spatialType']) {
				case 'xywh':
					return '#xywh=' . implode(',', array($a['x'], $a['y'], $a['width'], $a['height']));
				case 'pos3d':
					return '#pos3d=' . implode(',', array(
						$a['targetX'], $a['targetY'], $a['targetZ'],
						$a['cameraX'], $a['cameraY'], $a['cameraZ'],
						$a['roll'], $a['tilt'], $a['fieldOfView']));
				case 'posgis':
					return '#posgis=' . implode(',', array(
						$a['latitude'], $a['longitude'], $a['altitude'],
						$a['heading'], $a['tilt'], $a['fieldOfView']));
			}
			return '';
		}

		if (empty($a['start']) && empty($a['end'])) return '';
		return '#t=npt:' . $a['start'] . ',' . $a['end'];

	}

	/**
	 * Build the paths collection.
	 * Each path page also appears in $pages (already added by _build_content).
	 */
	private function _build_paths($book_id, $base_uri, &$paths) {

		$path_rows = $this->paths->get_all($book_id);

		foreach ($path_rows as $path) {
			// MY_Model::get_all returns the path's content row (via parent_version_id
			// JOIN) with content.* fields. recent_version_id is present on the row.
			if (empty($path->recent_version_id)) continue;

			$version  = $this->versions->get_single(
				$path->content_id,
				$path->recent_version_id,
				'',
				true    // include ARC additional metadata
			);
			if (empty($version)) continue;

			$children = $this->paths->get_children(
				$path->recent_version_id,
				$this->paths_table . '.sort_number',
				'asc'
			);

			$child_slugs = array();
			foreach ($children as $child) {
				$child_slugs[] = $child->child_content_slug;
			}

			$paths[$path->slug] = array(
				'url'                => $base_uri . $path->slug,
				'slug'               => $path->slug,
				'title'              => $version->title,
				'children'           => $child_slugs,
				'additionalMetadata' => !empty($version->rdf) ? $this->_clean_arc_meta($version->rdf) : array(),
			);
		}

	}

	/**
	 * Build the tags collection.
	 * Each tag page also appears in $pages (already added by _build_content).
	 */
	private function _build_tags($book_id, $base_uri, &$tags) {

		$tag_rows = $this->tags->get_all($book_id);

		foreach ($tag_rows as $tag) {
			if (empty($tag->recent_version_id)) continue;

			$version = $this->versions->get_single(
				$tag->content_id,
				$tag->recent_version_id,
				'',
				true    // include ARC additional metadata
			);
			if (empty($version)) continue;

			$tagged_rows = $this->tags->get_children($tag->recent_version_id);

			$tagged_slugs = array();
			foreach ($tagged_rows as $tagged) {
				$tagged_slugs[] = $tagged->child_content_slug;
			}

			$tags[$tag->slug] = array(
				'url'                => $base_uri . $tag->slug,
				'slug'               => $tag->slug,
				'title'              => $version->title,
				'tagged'             => $tagged_slugs,
				'additionalMetadata' => !empty($version->rdf) ? $this->_clean_arc_meta($version->rdf) : array(),
			);
		}

	}

	/**
	 * Build the annotations collection and backfill media[slug]['annotations'].
	 *
	 * In rel_annotated: parent_version_id = annotation body, child_version_id = media target.
	 * MY_Model::get_all() returns one row per unique annotation-body content node.
	 * get_children() then returns the media targets (with offset fields) for each body.
	 */
	private function _build_annotations($book_id, &$media, &$annotations) {

		$body_rows = $this->annotations->get_all($book_id);

		foreach ($body_rows as $body) {
			if (empty($body->recent_version_id)) continue;

			// Each child is a media target with offset fields from rel_annotated.
			$targets = $this->annotations->get_children($body->recent_version_id);

			foreach ($targets as $target) {
				$anno_id = $target->urn;  // urn:scalar:anno:pvid:cvid:hash
				$annotations[$anno_id] = $this->_normalize_annotation(
					$target,
					$target->child_content_slug,
					$body->slug
				);

				// Backfill onto the media entry if it exists.
				if (isset($media[$target->child_content_slug])) {
					$media[$target->child_content_slug]['annotations'][] = $anno_id;
				}
			}
		}

	}

	/**
	 * The book's public lenses — the saved searches-plus-visualizations that fill the
	 * header's Lenses menu and the "Browse Lenses" page.
	 *
	 * A lens is not a table of its own so much as a rider on a page: the page carries the
	 * title, slug and public/private flag, and rel_grouped carries a blob of JSON describing
	 * what the lens selects and how it draws the result. Lens_model::get_children() is what
	 * fuses the two, so this returns exactly what the live GET <approot>/lenses?book_id=N
	 * endpoint does (see System::lenses()) — which is what the static bridge answers that
	 * request with, so the menu and the browser page need no patching of their own.
	 *
	 * Only *public* lenses are exported, which is why get_all_with_lens() is asked for live
	 * content only. A private lens belongs to one signed-in reader, and neither the reader nor
	 * the sign-in survives the export; a submitted-but-unpublished one is editorial state,
	 * which CLAUDE.md drops along with comments and version history. The 'hidden' and
	 * 'submitted' flags are therefore restated rather than trusted: the lens manager branches
	 * on them to decide which list a lens belongs in, and anything not plainly public would
	 * land in a section no exported reader can act on.
	 *
	 * rel_grouped is an optional table (see MY_Controller::can_save_lenses()) — an install that
	 * predates lenses simply has no lenses to export.
	 *
	 * The stored JSON is also handed back to the lens's own page through $pages, which
	 * page.php emits as scalar:isLensOf RDFa exactly as a live Scalar does; that property is
	 * what makes scalarpage.jquery.js turn the page into a visualization of its lens rather
	 * than an empty page. That copy is the raw stored lens, without the listing fields added
	 * below: ScalarLenses.getEmbeddedJson() parses it as the lens's own definition, and the
	 * definition already carries its author's user_id and user_level.
	 *
	 * @param  int    $book_id
	 * @param  array  &$pages  book_data['pages']; the lens page entries gain a 'lens' key
	 * @return array  List of lens objects in GET /lenses response shape, oldest first
	 */
	private function _build_lenses($book_id, &$pages) {

		if (!$this->db->table_exists('rel_grouped')) return array();

		$this->load->model('lens_model', 'lenses');
		$this->load->model('user_model', 'users');

		$rows    = $this->lenses->get_all_with_lens($book_id, null, null, true);
		$lenses  = array();
		$authors = array();   // user_id => fullname, so a book of lenses by one author is one query

		// Backwards, because that is the order the live endpoint emits: get_all() sorts most
		// recent first and System::lenses() then walks the result from the end. The order is
		// the menu's order, and it decides which lens the browser page opens on (the manager
		// selects data[0] when nothing is chosen).
		for ($j = count($rows) - 1; $j >= 0; $j--) {

			$row = $rows[$j];

			if (empty($row->lens)) continue;
			$lens = json_decode($row->lens, true);
			if (!is_array($lens)) continue;

			// The lens as its own page states it — see the note above on why this copy is
			// taken before the listing fields are added.
			if (isset($pages[$row->slug])) $pages[$row->slug]['lens'] = $lens;

			$user_id = (int) $row->user;
			if (!array_key_exists($user_id, $authors)) {
				$user = $this->users->get_by_user_id($user_id);
				$authors[$user_id] = (!empty($user) && isset($user->fullname)) ? $user->fullname : '';
			}

			$lens['user_id']   = $user_id;
			$lens['hidden']    = false;
			$lens['submitted'] = false;
			unset($lens['submitted_comment']);
			// Only the name: the live endpoint adds the author's email as well, but for book
			// admins only, and an export has no admins.
			$lens['user'] = array('fullname' => $authors[$user_id]);

			$lenses[] = $lens;

		}

		return $lenses;

	}

	/**
	 * Build the TOC as an ordered array of slugs.
	 * Uses book_model::get_book_versions which returns versions with sort_number > 0,
	 * sorted by sort_number — i.e. the pages the author explicitly added to the
	 * book's main navigation.
	 */
	private function _build_toc($book_id) {

		$toc_rows = $this->books->get_book_versions($book_id, true);

		$toc = array();
		foreach ($toc_rows as $row) {
			$toc[] = $row->slug;
		}
		return $toc;

	}

	// -------------------------------------------------------------------------
	// Private — row normalizers
	// -------------------------------------------------------------------------

	private function _normalize_page($content, $version, $base_uri, array $arc_meta = array()) {

		return array(
			'url'                => $base_uri . $content->slug,
			'slug'               => $content->slug,
			// The database id behind urn:scalar:content:N. Not interesting in itself, but it is
			// the key Scalar's reader-history store uses (see _graph_entries_for_item), so a
			// lens that filters or sorts by visit date needs it to recognise a node.
			'contentId'          => (int) $content->content_id,
			'title'              => $version->title,
			'description'        => $version->description,
			'body'               => $version->content,
			'layout'             => !empty($version->default_view) ? $version->default_view : 'plain',
			'created'            => !empty($version->created) ? date('c', strtotime($version->created)) : null,
			'modified'           => !empty($version->created) ? date('c', strtotime($version->created)) : null,
			// The version number this export was taken at — NOT a link to the older versions
			// themselves (those are dropped, per CLAUDE.md). Surfacing just the count lets the
			// "Scalar URL (version N)" metadata-table row read correctly and gives readers a
			// sense of how much a page was revised, without exporting the revision history itself.
			'versionNumber'      => isset($version->version_num) ? (int) $version->version_num : null,
			'references'         => array(),   // populated by _build_references()
			'additionalMetadata' => $arc_meta,
		) + $this->_aux_images($content, $base_uri);   // thumbnail / banner / background

	}

	private function _normalize_media($content, $version, $base_uri, array $arc_meta = array()) {

		// versions.url is stored as a storage-relative path for self-hosted uploads
		// (e.g. 'media/foo.jpg') and as a full http(s):// URL for third-party media —
		// see File_Upload/Scalar_Storage_Adapter_Filesystem, which never prefixes the
		// stored value. isURL() is the same test Version_model::rdf() uses to decide
		// whether to prepend the book's base URI before serving the value as RDF.
		$raw_url     = trim($version->url);
		$is_external = isURL($raw_url);

		return array(
			'url'                => $base_uri . $content->slug,
			'slug'               => $content->slug,
			'contentId'          => (int) $content->content_id,
			'title'              => $version->title,
			'description'        => $version->description,
			// A media item has body copy just as a page does — Scalar renders it below the
			// media on the item's own page. _build_excerpts() has always looked for it here;
			// until now nothing put it here, so a media item contributed no text to citations
			// and none to the search index built by _build_search_text().
			'body'               => $version->content,
			'mediaType'          => $this->_classify_media_type($version),
			'sourceUrl'          => abs_url($raw_url, $base_uri),
			'localPath'          => null,   // populated by _copy_media_files() for self-hosted media
			'isExternal'         => $is_external,
			'rawUrl'             => $is_external ? null : $raw_url,   // storage-relative; used only to locate the file on disk
			'created'            => !empty($version->created) ? date('c', strtotime($version->created)) : null,
			'versionNumber'      => isset($version->version_num) ? (int) $version->version_num : null,
			'annotations'        => array(),
			'references'         => array(),   // populated by _build_references()
			'additionalMetadata' => $arc_meta,
		) + $this->_aux_images($content, $base_uri);   // thumbnail / banner / background

	}

	/**
	 * The thumbnail / banner / background trio every content row carries, each normalized the
	 * same way the media file itself is (see _normalize_media's sourceUrl/localPath/rawUrl):
	 *
	 *   <field>          the raw stored value — storage-relative for an uploaded image, a full
	 *                    URL for one hosted elsewhere. Only used to find the file on disk.
	 *   <field>Url       the live absolute address, to fall back on when bundling didn't happen.
	 *   local<Field>     the bundled copy, relative to the export root; filled in by
	 *                    _copy_media_files().
	 *
	 * Scalar stores all three on the content row rather than the version, so pages carry them
	 * as well as media items — a page's banner drives the splash and image-header layouts, and
	 * its background becomes the <body> background image.
	 */
	private function _aux_images($content, $base_uri) {

		$out = array();

		foreach (array('thumbnail', 'banner', 'background') as $field) {
			$raw = !empty($content->$field) ? trim($content->$field) : null;
			$out[$field]                    = $raw;
			$out[$field . 'Url']            = abs_url($raw, $base_uri);
			$out['local' . ucfirst($field)] = null;
		}

		return $out;

	}

	// -------------------------------------------------------------------------
	// Private — link rewriting
	// -------------------------------------------------------------------------

	/**
	 * Rewrite href attributes in body HTML that point to this book's live URL
	 * into relative paths that work in the static export.
	 *
	 * All content pages live at <export-root>/<slug>/index.html, so the caller passes in
	 * that page's own prefix back to the export root — see _asset_root(), which counts the
	 * slug's path segments rather than assuming one ('../' for 'introduction', '../../' for
	 * a media item at 'media/cover-art'). The root index.html sits at the export root
	 * itself, so its prefix is './'.
	 *
	 * The home page is the exception: it is written to <export-root>/index.html with no
	 * directory of its own (see render_book()), so links to the 'index' slug resolve to
	 * that file rather than to an 'index/' directory.
	 *
	 * Inline media links (<a href="[sourceFile]" resource="[slug]">, written by Scalar's
	 * editor with the media's raw source file URL, not its permalink) are also rewritten
	 * here: self-hosted files that were successfully bundled point at their local copy;
	 * everything else — external media, or a self-hosted file whose copy failed — is left
	 * pointing at its original absolute URL so the link degrades gracefully instead of
	 * being mistaken for a page slug by the generic rewriting below.
	 *
	 * @param  string $html        Raw page body HTML from the database.
	 * @param  array  $media       $book_data['media'] — used to redirect inline media hrefs.
	 * @param  string $book_url    Live Scalar base URL for this book, trailing slash included.
	 *                             e.g. 'https://scalar.usc.edu/works/mybook/'
	 * @param  string $asset_root  Relative path from this page's directory to the export root,
	 *                             as returned by _asset_root(); './' for the root index.
	 * @return string              HTML with internal hrefs rewritten.
	 */
	private function _rewrite_links($html, array $media, $book_url, $asset_root = '../') {

		if (empty($html)) return $html;

		// Self-hosted media, indexed by the exact raw storage-relative URL that Scalar's
		// editor would have written into an inline <a href="..."> for that item.
		$media_by_raw_url = array();
		foreach ($media as $item) {
			if (empty($item['isExternal']) && !empty($item['rawUrl'])) {
				$media_by_raw_url[$item['rawUrl']] = $item;
			}
		}

		// --- Pass 1: absolute internal URLs (href="https://scalar.../works/book/slug") ---
		$escaped = preg_quote($book_url, '/');

		$html = preg_replace_callback(
			'/\bhref=(["\'])' . $escaped . '([^"\']*)\1/i',
			function ($m) use ($asset_root, $media_by_raw_url) {
				$quote = $m[1];
				$after = $m[2];   // everything after the book_url prefix

				$path_only = preg_replace('/[?#].*$/', '', $after);
				$rest      = substr($after, strlen($path_only));

				if (isset($media_by_raw_url[$path_only])) {
					$media_item = $media_by_raw_url[$path_only];
					$target = $media_item['localPath'] !== null
						? $asset_root . $media_item['localPath']
						: $media_item['sourceUrl'];
					return 'href=' . $quote . $target . $quote;
				}

				$slug    = trim($path_only, '/');
				$rel_url = $asset_root . self::_slug_target($slug);

				return 'href=' . $quote . $rel_url . $rest . $quote;
			},
			$html
		);

		// --- Pass 2: bare-slug hrefs (href="getting-started") ---
		// Rewrite directly to the correct relative path. The $.fn.attr guard in
		// scalar-static-bridge.js prevents scalarpage.makeRelativeLinksAbsolute()
		// from overwriting these at runtime.
		$html = preg_replace_callback(
			'/\bhref=(["\'])([a-z0-9][a-z0-9_-]*)([?#][^"\']*)?(\1)/i',
			function ($m) use ($asset_root) {
				$quote = $m[1];
				$slug  = $m[2];
				$rest  = isset($m[3]) ? $m[3] : '';
				$end   = $m[4];
				return 'href=' . $quote . $asset_root . self::_slug_target($slug) . $rest . $end;
			},
			$html
		);

		return $html;

	}

	/**
	 * The export-root-relative target for a page slug: '<slug>/' for the usual
	 * <slug>/index.html layout, but 'index.html' for the home page, which render_book()
	 * writes to the export root without a directory of its own. An empty slug (a link to
	 * the book root) resolves to the same place.
	 *
	 * Named 'index.html' rather than the bare directory so the link also resolves when the
	 * export is opened from disk over file://, where no server supplies a directory index.
	 *
	 * @param  string $slug  Page slug, already trimmed of surrounding slashes.
	 * @return string        Path relative to the export root.
	 */
	private static function _slug_target($slug) {

		if ($slug === '' || $slug === 'index') return 'index.html';

		return $slug . '/';

	}

	/**
	 * The relative path back to the export root from a page written at <slug>/index.html,
	 * or from that page's <slug>.meta/ sibling — one '../' per path segment in the slug.
	 *
	 * Most slugs are a single segment, so this is usually '../'. Media slugs are not:
	 * Scalar names an uploaded item 'media/<filename>', which puts its permalink page at
	 * <export-root>/media/<filename>/index.html, two directories down. Assuming '../' there
	 * pointed every stylesheet, script and media reference on those pages one level short
	 * of the export root — at media/system/application/... rather than system/application/...
	 * — so media permalink and .meta pages loaded no CSS and no JS at all.
	 *
	 * The home page is the one page this does not describe: render_book() writes it to the
	 * export root itself rather than into a directory, so it passes './' directly.
	 *
	 * @param  string $slug  Page or media slug, e.g. 'introduction' or 'media/cover-art'
	 * @return string        Relative prefix ending in '/', e.g. '../' or '../../'
	 */
	private static function _asset_root($slug) {

		return str_repeat('../', substr_count(trim($slug, '/'), '/') + 1);

	}

	/**
	 * Where one of a content item's auxiliary images lives, as seen from a page rendered with
	 * $asset_root: the bundled copy when _copy_media_files() managed to make one, otherwise the
	 * live absolute URL so the image degrades to a remote fetch rather than a broken link (the
	 * fail-gracefully rule in docs/media-strategy.md). Null when the item has no such image.
	 *
	 * Also serves $book_data['meta'], which carries the book's own 'background' trio.
	 *
	 * @param  array  $item        Normalized page/media entry, or the meta block
	 * @param  string $field       'thumbnail', 'banner' or 'background'
	 * @param  string $asset_root  Relative path from the rendering page to the export root
	 * @return string|null
	 */
	private static function _aux_image_href(array $item, $field, $asset_root) {

		$local = 'local' . ucfirst($field);

		if (!empty($item[$local]))            return $asset_root . $item[$local];
		if (!empty($item[$field . 'Url']))    return $item[$field . 'Url'];

		return null;

	}

	// -------------------------------------------------------------------------
	// Private — ARC2 additional metadata helpers
	// -------------------------------------------------------------------------

	/**
	 * Fetch ARC2 additional metadata for a set of version IDs in one SPARQL DESCRIBE
	 * query per batch of 100, avoiding N+1 queries against the triple store.
	 *
	 * Returns: [ version_id (int) => [ predicate_uri => [{value, type}] ] ]
	 * Returns an empty array if the ARC2 store is unavailable or yields no results.
	 *
	 * @param  array $version_ids  Numeric version IDs
	 * @return array
	 */
	private function _fetch_arc_metadata(array $version_ids) {

		if (empty($version_ids)) return array();

		$CI =& get_instance();
		try {
			if ('object' !== gettype($CI->rdf_store)) {
				$CI->load->library('RDF_Store', 'rdf_store');
			}
		} catch (Exception $e) {
			return array();
		}

		$result = array();

		foreach (array_chunk($version_ids, 100) as $chunk) {
			$urns = array();
			foreach ($chunk as $vid) {
				$urns[] = 'urn:scalar:version:' . (int) $vid;
			}

			try {
				$raw = $CI->rdf_store->get_by_urns($urns);
			} catch (Exception $e) {
				continue;
			}

			if (empty($raw)) continue;

			foreach ($raw as $subject_urn => $predicates) {
				// Extract numeric version ID from urn:scalar:version:N
				$vid = (int) substr($subject_urn, strrpos($subject_urn, ':') + 1);
				if (!$vid) continue;
				$result[$vid] = $predicates;
			}
		}

		return $result;

	}

	/**
	 * Filter a raw ARC2 predicate map (as returned by RDF_Store::get_by_urn(s)),
	 * removing predicates already captured in the normalized schema and expanding
	 * any namespace-prefixed values to full URIs.
	 *
	 * @param  array $raw  [ predicate_uri => [{value, type}] ]
	 * @return array       Cleaned copy; empty array if nothing remains.
	 */
	private function _clean_arc_meta(array $raw) {

		if (empty($raw)) return array();

		$ns     = $this->config->item('namespaces');
		$result = array();

		foreach ($raw as $predicate => $values) {
			if (in_array($predicate, self::$EXCLUDED_PREDICATES, true)) continue;
			if (!is_array($values)) continue;

			$cleaned_values = array();
			foreach ($values as $v) {
				if (!isset($v['value'])) continue;
				// Expand NS-prefixed URI values to full URIs (mirrors version_model->rdf())
				if (isset($v['type']) && 'uri' === $v['type'] && function_exists('isNS') && isNS($v['value'])) {
					$v['value'] = toURL($v['value'], $ns);
				}
				$cleaned_values[] = $v;
			}

			if (!empty($cleaned_values)) {
				$result[$predicate] = $cleaned_values;
			}
		}

		return $result;

	}

	// -------------------------------------------------------------------------
	// Private — classification helpers
	// -------------------------------------------------------------------------

	/**
	 * Classify a media item's type from its URL and default_view.
	 *
	 * Rules are checked in order; the first match wins.
	 * Returns one of: image | video | audio | document | code | unity | arcgis | iiif
	 */
	private function _classify_media_type($version) {

		$url  = strtolower(trim($version->url));
		$view = strtolower(trim($version->default_view));

		if (empty($url)) return 'document';

		// IIIF — check before generic image/document rules
		if (strpos($url, '/iiif/') !== false || strpos($url, 'iiif-manifest') !== false) {
			return 'iiif';
		}

		// Unity scene
		if (substr($url, -8) === '.unity3d' || strpos($url, '.unity') !== false) {
			return 'unity';
		}

		// ArcGIS
		if (strpos($url, 'arcgis.com') !== false) {
			return 'arcgis';
		}

		// Extract file extension from URL path (before any query string)
		$path = parse_url($url, PHP_URL_PATH);
		$ext  = $path ? strtolower(pathinfo($path, PATHINFO_EXTENSION)) : '';

		// Video — by extension or well-known streaming host
		$video_exts  = array('mp4', 'webm', 'm4v', 'mov', 'avi', 'ogv', 'ogg');
		$video_hosts = array('youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com');
		if (in_array($ext, $video_exts)) return 'video';
		foreach ($video_hosts as $host) {
			if (strpos($url, $host) !== false) return 'video';
		}

		// Audio
		$audio_exts = array('mp3', 'wav', 'm4a', 'aac', 'flac', 'oga');
		if (in_array($ext, $audio_exts)) return 'audio';

		// Image
		$image_exts = array('jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'tif', 'tiff', 'bmp');
		if (in_array($ext, $image_exts)) return 'image';

		// Source code / plain text
		$code_exts = array('html', 'htm', 'js', 'ts', 'css', 'py', 'rb', 'php', 'java',
		                    'c', 'cpp', 'h', 'cs', 'go', 'rs', 'sh', 'txt', 'md', 'xml',
		                    'json', 'yaml', 'yml', 'csv');
		if (in_array($ext, $code_exts)) return 'code';

		// Document
		$doc_exts = array('pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'rtf');
		if (in_array($ext, $doc_exts)) return 'document';

		// Iframe default_view with no other match — treat as embedded external content.
		// (ArcGIS and Unity are already caught above; anything else that's iframed is
		// left as 'document' since we have no better category.)
		return 'document';

	}

	/**
	 * Normalize a single annotation relationship row into its type-specific structure.
	 *
	 * scalarapi stores annotation offsets as comma-separated strings in five distinct
	 * formats (corresponding to anchor-fragment types t, line, xywh, pos3d, posgis).
	 * We parse those strings here so the bridge JS receives named scalar values rather
	 * than having to re-parse the raw DB strings.
	 *
	 * Detection order:
	 *   1. position_3d set  → spatial / pos3d   (9 values: targetX–fieldOfView)
	 *   2. position_gis set → spatial / posgis  (6 values: latitude–fieldOfView)
	 *   3. points set       → spatial / xywh    (4 values: x, y, width, height)
	 *   4. line nums set    → textual
	 *   5. otherwise        → temporal (start/end seconds, defaulting to 0)
	 *
	 * @param  object $target      Row from annotations->get_children(); carries rel_annotated fields
	 * @param  string $target_slug Slug of the media being annotated
	 * @param  string $body_slug   Slug of the annotation body page
	 * @return array
	 */
	private function _normalize_annotation($target, $target_slug, $body_slug) {

		$base = array(
			'id'         => $target->urn,
			'targetSlug' => $target_slug,
			'bodySlug'   => $body_slug,
		);

		// --- spatial: 3D scene (Unity, etc.) ---
		if (!empty($target->position_3d)) {
			$p = array_pad(explode(',', $target->position_3d), 9, '0');
			return $base + array(
				'type'        => 'spatial',
				'spatialType' => 'pos3d',
				'targetX'     => $p[0],
				'targetY'     => $p[1],
				'targetZ'     => $p[2],
				'cameraX'     => $p[3],
				'cameraY'     => $p[4],
				'cameraZ'     => $p[5],
				'roll'        => $p[6],
				'tilt'        => $p[7],
				'fieldOfView' => $p[8],
			);
		}

		// --- spatial: GIS / map ---
		if (!empty($target->position_gis)) {
			$p = array_pad(explode(',', $target->position_gis), 6, '0');
			return $base + array(
				'type'        => 'spatial',
				'spatialType' => 'posgis',
				'latitude'    => $p[0],
				'longitude'   => $p[1],
				'altitude'    => $p[2],
				'heading'     => $p[3],
				'tilt'        => $p[4],
				'fieldOfView' => $p[5],
			);
		}

		// --- spatial: image region (xywh) ---
		if (!empty($target->points)) {
			$p = array_pad(explode(',', $target->points), 4, '0');
			return $base + array(
				'type'        => 'spatial',
				'spatialType' => 'xywh',
				'x'           => $p[0],
				'y'           => $p[1],
				'width'       => $p[2],
				'height'      => $p[3],
			);
		}

		// --- textual: line range ---
		if (!empty($target->start_line_num) || !empty($target->end_line_num)) {
			return $base + array(
				'type'      => 'textual',
				'startLine' => (int) $target->start_line_num,
				'endLine'   => (int) $target->end_line_num,
			);
		}

		// --- temporal: time range (default / fallback) ---
		return $base + array(
			'type'  => 'temporal',
			'start' => (float) $target->start_seconds,
			'end'   => (float) $target->end_seconds,
		);

	}

	// -------------------------------------------------------------------------
	// Private — asset bundling
	// -------------------------------------------------------------------------

	/**
	 * Copy self-hosted media files into the export, and set each copied item's 'localPath'
	 * (relative to the export root) so page rendering can link to the bundled copy instead
	 * of the live server. Thumbnails are bundled the same way, into 'localThumbnail', for
	 * every content item that has one — pages as well as media. Mutates $book_data['pages']
	 * and $book_data['media'] in place.
	 *
	 * Each file is written to <tmp_dir>/<slug>.<ext> — i.e. it mirrors the slug's own path
	 * exactly the way render_book() already does for that item's own permalink directory
	 * (<tmp_dir>/<slug>/index.html). This matters because Scalar's media slugs commonly
	 * carry their own 'media/' segment already (e.g. slug 'media/foo'), so a fixed
	 * '<tmp_dir>/media/' bucket would double up into '<tmp_dir>/media/media/foo.jpg' for
	 * those items; mirroring the slug avoids assuming any particular slug convention.
	 * A permalink directory and its bundled file for the same slug never collide: the
	 * directory is exactly <slug>, the file is always <slug>.<ext> (extensionless sources
	 * fall back to '.bin' so the file path can never equal the bare slug path).
	 *
	 * Self-hosted files live on the same filesystem this code is running on — Scalar's
	 * filesystem storage adapter resolves them to FCPATH/<book-slug>/<raw-url> (see
	 * Scalar_Storage_Adapter_Filesystem::_getAbsPath()) — so this is a local copy(),
	 * not a network fetch; no rate limiting is needed.
	 *
	 * Failures (missing source file, copy() failure) are recorded in $errors and leave
	 * 'localPath' null; the affected item's sourceUrl (the live absolute URL) is used as
	 * a fallback wherever it's linked, per docs/media-strategy.md's fail-gracefully rule.
	 *
	 * @param  array  &$book_data  Full normalized structure from get_book_data(); mutated.
	 * @param  string $tmp_dir     Absolute path to the export temp directory (no trailing slash)
	 * @param  array  &$errors     Errors array from render_book(); populated on failure
	 * @return array               ['filesCopied' => int, 'bytesCopied' => int] — media and
	 *                             thumbnails together, which is what the size warning measures
	 */
	private function _copy_media_files(&$book_data, $tmp_dir, &$errors) {

		$files_copied = 0;
		$bytes_copied = 0;

		$book_slug = $book_data['meta']['slug'];
		$src_base  = rtrim(FCPATH, '/') . '/' . $book_slug . '/';

		foreach ($book_data['media'] as $slug => &$item) {

			if (!empty($item['isExternal']) || empty($item['rawUrl'])) continue;

			$src = $src_base . $item['rawUrl'];

			if (!is_file($src)) {
				$errors['media:' . $slug] = 'Source media file not found on disk: ' . $item['rawUrl'];
				continue;
			}

			$ext       = pathinfo($item['rawUrl'], PATHINFO_EXTENSION);
			$local_path = $slug . '.' . ($ext !== '' ? $ext : 'bin');
			$dest       = $tmp_dir . '/' . $local_path;
			$dest_dir   = dirname($dest);

			if (!is_dir($dest_dir) && !mkdir($dest_dir, 0755, true)) {
				$errors['media:' . $slug] = 'Could not create media directory';
				continue;
			}

			if (copy($src, $dest)) {
				$item['localPath'] = $local_path;
				$bytes_copied      += filesize($dest);
				$files_copied++;
			} else {
				$errors['media:' . $slug] = 'Could not copy media file: ' . $item['rawUrl'];
			}

		}
		unset($item);

		// Auxiliary images — thumbnails, banners and backgrounds. Not part of the loop above
		// for two reasons: any content item can carry them, pages included (Scalar stores all
		// three on the content row, not the version), and an item whose media lives on a
		// third-party server can still have its own uploaded thumbnail — so locality has to be
		// judged per file rather than per item.
		//
		// Each lands at '<slug>.<suffix>.<ext>', mirroring the '<slug>.<ext>' convention above:
		// that can collide with neither the item's permalink directory (exactly <slug>) nor its
		// bundled media file, since none of the suffixes is a real file extension.
		$aux_images = array('thumbnail' => 'thumb', 'banner' => 'banner', 'background' => 'background');

		foreach (array('pages', 'media') as $collection) {

			foreach ($book_data[$collection] as $slug => &$item) {
				foreach ($aux_images as $field => $suffix) {
					$local_path = $this->_copy_aux_image(
						isset($item[$field]) ? $item[$field] : null,
						$src_base, $tmp_dir, $slug . '.' . $suffix,
						$field . ':' . $slug, $errors, $files_copied, $bytes_copied);

					if ($local_path !== null) $item['local' . ucfirst($field)] = $local_path;
				}
			}
			unset($item);

		}

		// And the book's own background, the fallback for pages that set none.
		$book_background = $this->_copy_aux_image(
			isset($book_data['meta']['background']) ? $book_data['meta']['background'] : null,
			$src_base, $tmp_dir, 'book.background',
			'background:book', $errors, $files_copied, $bytes_copied);

		if ($book_background !== null) $book_data['meta']['localBackground'] = $book_background;

		if ($bytes_copied > self::MEDIA_SIZE_WARNING_BYTES) {
			$errors['media:size-warning'] = sprintf(
				'Bundled media totals %.1f MB across %d file(s); this export may be slow to download and host.',
				$bytes_copied / 1048576,
				$files_copied
			);
		}

		return array('filesCopied' => $files_copied, 'bytesCopied' => $bytes_copied);

	}

	/**
	 * Copy one auxiliary image (a thumbnail, banner or background) into the export and return
	 * its path relative to the export root, or null if there was nothing to copy or the copy
	 * failed. Failures are recorded in $errors and leave the caller's 'local…' field null, so
	 * the live absolute URL is used instead — docs/media-strategy.md's fail-gracefully rule.
	 *
	 * @param  string|null $raw           Raw stored value: storage-relative path, or a URL
	 * @param  string      $src_base      Absolute path to the book's storage directory
	 * @param  string      $tmp_dir       Export temp directory (no trailing slash)
	 * @param  string      $dest_base     Destination path without extension, export-root-relative
	 * @param  string      $error_key     Key to record failures under
	 * @param  array       &$errors
	 * @param  int         &$files_copied
	 * @param  int         &$bytes_copied
	 * @return string|null
	 */
	private function _copy_aux_image($raw, $src_base, $tmp_dir, $dest_base, $error_key,
	                                 &$errors, &$files_copied, &$bytes_copied) {

		$raw = trim((string) $raw);

		if ($raw === '' || isURL($raw)) return null;   // nothing to bundle, or hosted elsewhere

		$src = $src_base . $raw;

		if (!is_file($src)) {
			$errors[$error_key] = 'Image file not found on disk: ' . $raw;
			return null;
		}

		$ext        = pathinfo($raw, PATHINFO_EXTENSION);
		$local_path = $dest_base . '.' . ($ext !== '' ? $ext : 'bin');
		$dest       = $tmp_dir . '/' . $local_path;
		$dest_dir   = dirname($dest);

		if (!is_dir($dest_dir) && !mkdir($dest_dir, 0755, true)) {
			$errors[$error_key] = 'Could not create directory for: ' . $raw;
			return null;
		}

		if (!copy($src, $dest)) {
			$errors[$error_key] = 'Could not copy image file: ' . $raw;
			return null;
		}

		$bytes_copied += filesize($dest);
		$files_copied++;

		return $local_path;

	}

	/**
	 * Write <tmp_dir>/scalar-static-data.js — the book's whole graph plus the server-side data
	 * the bridge answers API calls from, as a plain assignment to window.__scalarStaticData.
	 *
	 * A .js file rather than the scalar-data.json CLAUDE.md envisages, for two reasons. A
	 * <script> tag works when the export is opened from disk over file://, where fetching a
	 * sibling .json is blocked as a cross-origin read. And the bridge treats every
	 * extensionless same-origin URL as a Scalar endpoint to intercept, so a file parked at the
	 * endpoint's own path (system/ontologies) would never be reachable anyway.
	 *
	 * @param  string $tmp_dir  Absolute path to the export temp directory (no trailing slash)
	 * @param  array  &$errors  Errors array from render_book(); populated on failure
	 * @return bool             True if the file was written
	 */
	private function _write_static_data($tmp_dir, $book_data, $book_url, &$errors) {

		$data = array(
			'graph'      => $this->_build_graph($book_data, $book_url),
			'ontologies' => $this->_build_ontologies(),
			// The book's body copy as plain text, for lens and search content filters. Kept
			// beside the graph rather than in it — see _build_search_text() for why.
			'text'       => $this->_build_search_text($book_data),
			// The book's public lenses, verbatim in the shape GET <approot>/lenses?book_id=N
			// returns — see _build_lenses(). Both the header's Lenses menu and the "Browse
			// Lenses" page ask for them that way, and the bridge answers from here.
			'lenses'     => isset($book_data['lenses']) ? $book_data['lenses'] : array(),
		);

		$js = "/* scalar-static-data.js\n"
			. " * Server data baked in at export time, read by scalar-static-bridge.js.\n"
			. " * Auto-generated by the static exporter — do not edit manually.\n"
			. " */\n"
			. 'window.__scalarStaticData = ' . json_encode($data) . ";\n";

		if (file_put_contents($tmp_dir . '/scalar-static-data.js', $js) === false) {
			$errors['scalar-static-data.js'] = 'Could not write scalar-static-data.js';
			return false;
		}

		return true;

	}

	/**
	 * Every item's body copy as plain text, keyed by node URL — the corpus a lens's "content"
	 * filter searches, and with it Scalar's own search box, whose every scope but one builds
	 * exactly that filter (see ScalarSearch.getLensForQuery()).
	 *
	 * Deliberately *not* a predicate in the baked graph, which is where the rest of a node's
	 * facts live. Two reasons:
	 *
	 *   - resolveLens() answers a lens by JSON.stringify()ing an RDF-JSON entry for every node
	 *     it selected. A body-sized predicate on each node would put the whole book's prose
	 *     through that serializer on every keystroke in the search box, for a payload whose
	 *     only consumer re-parses it back into nodes the model already holds.
	 *   - sioc:content in the graph is an excerpt, not the body (see _build_excerpts), and it
	 *     has to stay one: the Citations dialog reads the markup around a citation out of it.
	 *     The two uses want different things from the same field, so they get different fields.
	 *
	 * Plain text rather than the stored HTML, which is what a live server matches against. The
	 * divergence is deliberate and in the reader's favour: searching a book for "span" or
	 * "class" should not return every page that happens to contain markup. Entities are decoded
	 * so a search for "don't" matches text stored as "don&rsquo;t", and runs of whitespace are
	 * collapsed so a phrase split across two lines of source still matches.
	 *
	 * @param  array $book_data  Full normalized structure; reads ['pages'] and ['media']
	 * @return array             node URL => plain text (items with no body are omitted)
	 */
	private function _build_search_text($book_data) {

		$text = array();

		foreach (array('pages', 'media') as $collection) {
			foreach ($book_data[$collection] as $item) {
				if (empty($item['body'])) continue;

				// Script and style blocks go whole: strip_tags() removes the tags but keeps what
				// is between them, and a page carrying an embedded widget would otherwise index
				// its JavaScript as prose.
				$plain = preg_replace('#<(script|style)\b[^>]*>.*?</\1>#is', ' ', $item['body']);

				// <br> and block ends become spaces next, or "one<br>two" would index as
				// "onetwo" and match neither word at its boundary.
				$plain = preg_replace('/<(br|\/p|\/div|\/li|\/h[1-6]|\/td|\/tr|\/blockquote)\b[^>]*>/i', ' $0',
					$plain);
				$plain = strip_tags($plain);
				$plain = html_entity_decode($plain, ENT_QUOTES | ENT_HTML5, 'UTF-8');
				$plain = trim(preg_replace('/\s+/u', ' ', $plain));

				if ($plain === '') continue;
				$text[$item['url']] = $plain;
			}
		}

		return $text;

	}

	/**
	 * The metadata-field vocabulary the live GET <approot>/ontologies endpoint serves: a map of
	 * namespace prefix to the predicates available under it, used to populate the "Additional
	 * metadata" field menus in search and the lens editor.
	 *
	 * Mirrors System::ontologies() exactly, including its removal of the predicates that are
	 * already built into Scalar's own model ($config['rdf_fields'] — dcterms:title,
	 * dcterms:description and the like). Those are offered separately by the consumers
	 * themselves, so leaving them in would list them twice.
	 *
	 * Baked from the exporting install's config rather than hardcoded here, so a site that has
	 * added its own namespaces (the documented way to extend Scalar's vocabulary — see the
	 * comments atop config/rdf.php) exports the vocabulary its own content actually uses.
	 *
	 * @return array  prefix => list of predicate names
	 */
	private function _build_ontologies() {

		$CI =& get_instance();

		$ontologies = $CI->config->item('ontologies');
		$rdf_fields = $CI->config->item('rdf_fields');

		if (!is_array($ontologies)) return array();
		if (!is_array($rdf_fields)) $rdf_fields = array();

		foreach ($ontologies as $prefix => $values) {
			foreach ($values as $key => $value) {
				if (in_array($prefix . ':' . $value, $rdf_fields)) {
					unset($ontologies[$prefix][$key]);
				}
			}
			// Reindex from 0 — the consumers treat these as JSON arrays, and gaps left by the
			// unset() above would otherwise make json_encode() emit objects instead.
			$ontologies[$prefix] = array_values($ontologies[$prefix]);
		}

		return $ontologies;

	}

	/**
	 * Copy all reader-facing static assets from the live Scalar installation into
	 * the export temp directory, preserving the same relative path structure that
	 * page.php's asset references already expect.
	 *
	 * Source root:      APPPATH . 'views/'
	 * Destination root: $tmp_dir . '/system/application/views/'
	 *
	 * After copying, applies a one-line patch to the vendored main.js so that
	 * relative jQuery <script> src paths are resolved to absolute URLs before
	 * main.js's scheme detection logic runs (which breaks on relative paths).
	 *
	 * @param  string $tmp_dir  Absolute path to the export temp directory (no trailing slash)
	 * @param  array  &$errors  Errors array from render_book(); populated on failure
	 * @return int              Number of files successfully copied
	 */
	private function _copy_assets($tmp_dir, &$errors) {

		$src_base  = APPPATH . 'views/';
		$dest_base = $tmp_dir . '/system/application/views/';

		// Static asset directories to vendor, relative to $src_base.
		$copy_dirs = array(
			'melons/cantaloupe/css',
			'melons/cantaloupe/js',
			'melons/cantaloupe/fonts',
			'melons/cantaloupe/images',
			'arbors/html5_RDFa/js',
		);

		// Individual files from arbors/html5_RDFa/ (favicons, book logo), plus the two files
		// the lens editor needs out of widgets/edit/ — the whole of that directory is skipped
		// below as editor-only, but the content selector is what a lens picks its content with
		// and so is reader-facing wherever lenses are (see $needs_lens_editor in page.php).
		$copy_files = array(
			'arbors/html5_RDFa/favicon_16.gif',
			'arbors/html5_RDFa/favicon_114.jpg',
			'arbors/html5_RDFa/scalar_logo_300x300.png',
			'widgets/edit/jquery.content_selector_bootstrap.js',
			'widgets/edit/content_selector.css',
		);

		// Widget subdirectories to skip — editor-only tools with no reader-facing role.
		// ckeditor alone is ~34 MB; excluding these keeps the export under 15 MB.
		// NOTE: slotmanager is NOT editor-only — jquery.mediaelement.js routes every media
		// element (inline or standalone) through $.fn.slotmanager_create_slot, so it must
		// be vendored for media to render at all.
		$exclude_widgets = array(
			'annobuilder', 'ckeditor', 'diff', 'edit', 'import',
			'spectrum', 'vrview', 'waldorf', 'wysiwyg',
		);

		// Discover all widget subdirs not on the exclusion list.
		$widget_src = $src_base . 'widgets/';
		if (is_dir($widget_src)) {
			foreach (scandir($widget_src) as $entry) {
				if ($entry === '.' || $entry === '..') continue;
				if (!is_dir($widget_src . $entry)) continue;
				if (in_array($entry, $exclude_widgets, true)) continue;
				$copy_dirs[] = 'widgets/' . $entry;
			}
		}

		$file_count = 0;

		foreach ($copy_dirs as $rel_dir) {
			$src  = $src_base . $rel_dir;
			$dest = $dest_base . $rel_dir;
			if (!is_dir($src)) continue;
			$count = $this->_copy_dir($src, $dest);
			if ($count === false) {
				$errors['assets:' . $rel_dir] = 'Could not copy asset directory: ' . $rel_dir;
			} else {
				$file_count += $count;
			}
		}

		foreach ($copy_files as $rel_file) {
			$src  = $src_base . $rel_file;
			$dest = $dest_base . $rel_file;
			if (!file_exists($src)) continue;
			$dir = dirname($dest);
			if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
				$errors['assets:' . $rel_file] = 'Could not create directory for: ' . $rel_file;
				continue;
			}
			if (copy($src, $dest)) {
				$file_count++;
			} else {
				$errors['assets:' . $rel_file] = 'Could not copy asset file: ' . $rel_file;
			}
		}

		// Patch main.js in the vendored copy only (never the live source).
		$this->_patch_main_js(
			$dest_base . 'melons/cantaloupe/js/main.js',
			$errors
		);

		return $file_count;

	}

	/**
	 * Recursively copy $src directory into $dest, skipping all .php files.
	 *
	 * @param  string $src   Absolute source path (no trailing slash)
	 * @param  string $dest  Absolute destination path (no trailing slash)
	 * @return int|false     Number of files copied, or false if dest could not be created
	 */
	private function _copy_dir($src, $dest) {

		if (!is_dir($dest) && !mkdir($dest, 0755, true)) return false;

		$count = 0;
		$it    = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator($src, RecursiveDirectoryIterator::SKIP_DOTS),
			RecursiveIteratorIterator::SELF_FIRST
		);

		foreach ($it as $item) {
			$rel       = $it->getSubPathName();
			$dest_path = $dest . '/' . $rel;

			if ($item->isDir()) {
				if (!is_dir($dest_path)) mkdir($dest_path, 0755, true);
			} elseif (strtolower($item->getExtension()) !== 'php') {
				copy($item->getPathname(), $dest_path);
				$count++;
			}
		}

		return $count;

	}

	/**
	 * Patch the vendored copy of main.js to replace its 4-line scheme+URI-derivation
	 * block with a URL-API-based version that works under http://, https://, and file://.
	 *
	 * The original block determines the scheme by checking for 'https://' in the jQuery
	 * script src, defaults to 'http://', then string-replaces that scheme out of the src
	 * to isolate the path. This fails in two ways for static exports:
	 *   1. Relative src (no '://') → invalid base URI like 'http://../system/...'
	 *   2. file:// src → 'http://' is not in the string, so replace() is a no-op,
	 *      yielding 'http://file:///...' — which browsers interpret as HTTP to host 'file'
	 *
	 * The replacement uses new URL() to resolve the src to an absolute URL regardless
	 * of protocol, then splits the pathname component for the directory derivations.
	 * The patch is idempotent.
	 *
	 * @param  string $path    Absolute path to the vendored main.js
	 * @param  array  &$errors Errors array; populated if the patch cannot be applied
	 */
	private function _patch_main_js($path, &$errors) {

		if (!file_exists($path)) {
			$errors['assets:main.js-patch'] = 'Vendored main.js not found; nav path resolution may fail';
			return;
		}

		$content = file_get_contents($path);

		// Already patched — nothing to do.
		if (strpos($content, 'new URL(script_uri, window.location.href)') !== false) return;

		// Match the exact 4-line block, tolerating both LF and CRLF line endings.
		$search_lf = "var scheme = (script_uri.indexOf('https://') != -1) ? 'https://' : 'http://';"
		           . "\nvar base_uri = scheme+script_uri.replace(scheme,'').split('/').slice(0,-2).join('/');"
		           . "\nvar system_uri = scheme+script_uri.replace(scheme,'').split('/').slice(0,-6).join('/');"
		           . "\nvar index_uri = scheme+script_uri.replace(scheme,'').split('/').slice(0,-7).join('/');";
		$search_crlf = str_replace("\n", "\r\n", $search_lf);

		if (strpos($content, $search_lf) !== false) {
			$search = $search_lf;
			$nl     = "\n";
		} elseif (strpos($content, $search_crlf) !== false) {
			$search = $search_crlf;
			$nl     = "\r\n";
		} else {
			$errors['assets:main.js-patch'] = 'Could not locate URI-derivation block in main.js; nav path resolution may fail in static export';
			return;
		}

		$replace = "var _su = new URL(script_uri, window.location.href);"
		         . $nl . "var scheme = _su.protocol === 'file:' ? 'file://' : (_su.protocol === 'https:' ? 'https://' : 'http://');"
		         . $nl . "var _origin = _su.protocol === 'file:' ? 'file://' : (_su.protocol + '//' + _su.host);"
		         . $nl . "var _strip = function(n) { return _origin + _su.pathname.split('/').slice(0, -n).join('/'); };"
		         . $nl . "var base_uri   = _strip(2);"
		         . $nl . "var system_uri = _strip(6);"
		         . $nl . "var index_uri  = _strip(7);";

		file_put_contents($path, str_replace($search, $replace, $content));

	}

}
