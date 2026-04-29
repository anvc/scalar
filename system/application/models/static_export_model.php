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
		// Core content — in normalized schema as title/description/body/layout/created/sourceUrl/thumbnail
		'http://purl.org/dc/terms/title',
		'http://purl.org/dc/terms/description',
		'http://rdfs.org/sioc/ns#content',
		'http://scalar.usc.edu/2012/01/scalar-ns#defaultView',
		'http://purl.org/dc/terms/created',
		'http://simile.mit.edu/2003/10/ontologies/artstor#url',
		'http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail',
		// Structural — versioning/identity bookkeeping, not meaningful in a static export
		'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
		'http://purl.org/dc/terms/hasVersion',
		'http://purl.org/dc/terms/isVersionOf',
		'http://scalar.usc.edu/2012/01/scalar-ns#urn',
		'http://open.vocab.org/terms/versionnumber',
		'http://www.w3.org/ns/prov#wasAttributedTo',
	);

	public function __construct() {

		parent::__construct();

		$this->load->model('book_model',       'books');
		$this->load->model('page_model',       'pages');
		$this->load->model('version_model',    'versions');
		$this->load->model('path_model',       'paths');
		$this->load->model('tag_model',        'tags');
		$this->load->model('annotation_model', 'annotations');

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
		$toc = $this->_build_toc($book_id);

		return array(
			'meta'        => $this->_build_meta($book),
			'pages'       => $pages,
			'media'       => $media,
			'paths'       => $paths,
			'tags'        => $tags,
			'annotations' => $annotations,
			'toc'         => $toc,
		);

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

		return array(
			'title'        => strip_tags($book->title),
			'slug'         => $book->slug,
			'description'  => isset($book->description) ? $book->description : '',
			'exportDate'   => date('c'),
			'scalarVersion'=> $scalar_version ?: '2.x',
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
			'title'              => $version->title,
			'description'        => $version->description,
			'body'               => $version->content,
			'layout'             => !empty($version->default_view) ? $version->default_view : 'plain',
			'created'            => !empty($version->created) ? date('c', strtotime($version->created)) : null,
			'modified'           => !empty($version->created) ? date('c', strtotime($version->created)) : null,
			'thumbnail'          => !empty($content->thumbnail) ? $content->thumbnail : null,
			'additionalMetadata' => $arc_meta,
		);

	}

	private function _normalize_media($content, $version, $base_uri, array $arc_meta = array()) {

		return array(
			'url'                => $base_uri . $content->slug,
			'slug'               => $content->slug,
			'title'              => $version->title,
			'mediaType'          => $this->_classify_media_type($version),
			'sourceUrl'          => $version->url,
			'localPath'          => null,   // populated later by the packaging step
			'thumbnail'          => !empty($content->thumbnail) ? $content->thumbnail : null,
			'annotations'        => array(),
			'additionalMetadata' => $arc_meta,
		);

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

}
