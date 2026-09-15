<?php
/**
 * Static export page template — plain layout.
 *
 * Variables provided by render_book():
 *   $page        array  — one entry from book_data['pages'] or ['media']
 *   $book_data   array  — full normalized scalar-data.json structure
 *   $asset_root  string — relative path from this page's directory to the export root
 *                         e.g. '../' for slug pages, './' for the root index
 *   $book_url    string — live Scalar base URI for this book, trailing slash included
 *                         e.g. 'https://scalar.usc.edu/works/mybook/'
 *                         Used as the RDF resource namespace so scalarapi resolves
 *                         node identifiers against the pre-baked scalar-data.json.
 */

$meta             = $book_data['meta'];
$all_pages        = array_merge($book_data['pages'], $book_data['media']);
$toc              = $book_data['toc'];
$slug             = $page['slug'];
$layout           = isset($page['layout']) ? $page['layout'] : 'plain';
$is_current_media = isset($book_data['media'][$slug]);
$is_meta_view     = !empty($page['isMetaView']);

// The "Browse Lenses" page (<export-root>/manage_lenses/), written by _write_lens_browser_page()
// in static_export_model.php. Like the live site's own manage_lenses view it is a page of the
// book's chrome wrapped around a lens UI rather than a node of the book, so it states no node
// of its own — see the "Current page" block below.
$is_lens_browser = !empty($page['isLensBrowser']);

// A lens page: an ordinary page whose stored lens definition, emitted below as scalar:isLensOf,
// is what makes scalarpage.jquery.js render it as a visualization of that lens. See
// _build_lenses() in static_export_model.php.
$lens_json = isset($page['lens']) ? $page['lens'] : null;

// Both of those run ScalarLenses, the lens editor, which pulls three of its dependencies in at
// runtime with $.getScript()/$("<link>") rather than declaring them. The bridge answers every
// same-origin .js request with an empty 200 (so jQuery's .done() chains fire without
// re-evaluating an already-loaded file), which means a script fetched that way arrives empty:
// the plugins have to be on the page as real <script> tags before the editor asks for them.
// Loaded only on the pages that run it — between them the three come to ~150 KB.
$needs_lens_editor = $is_lens_browser || $lens_json !== null;

// Relative path prefix for vendored assets (CSS/JS copied into the export root).
// All asset paths are expressed relative to $asset_root so the ZIP works
// regardless of where it is hosted or opened locally.
$assets = $asset_root . 'system/application/';

// This page's immediate neighbours — the items it is directly related to — and the relations
// joining them. Everything else in the book lives in scalar-static-data.js, which the bridge
// seeds into the model at boot (see _build_graph() in static_export_model.php); emitting the
// whole book on every page was quadratic and ran to hundreds of megabytes on a large one.
//
// Neighbours stay inline for two reasons. A page that asserts what it connects to is far more
// useful on its own — to a crawler, an archivist, or anyone opening a single file — than one
// asserting only itself. And if the shared file ever fails to load, relationship navigation,
// the media info tabs and the citations dialog still work from what the page carries; only
// book-wide views (Index, visualizations, table of contents) degrade.
//
// The total cost is linear, not quadratic: the sum of every node's degree is twice the number
// of relations, however lopsided the degree distribution.
$neighbour_slugs    = array();
$incident_relations = array();

foreach ($book_data['relations'] as $relation) {
	if ($relation['body'] === $slug) {
		$neighbour_slugs[$relation['target']] = true;
		$incident_relations[] = $relation;
	} elseif ($relation['target'] === $slug) {
		$neighbour_slugs[$relation['body']] = true;
		$incident_relations[] = $relation;
	}
}

// References are a plain dcterms:references predicate rather than an oac:Annotation subject,
// so they are not in the relations list; gather both directions.
foreach ((array) (isset($page['references']) ? $page['references'] : array()) as $ref_slug) {
	$neighbour_slugs[$ref_slug] = true;
}
foreach ($all_pages as $other_slug => $other_item) {
	if (!empty($other_item['references']) && in_array($slug, $other_item['references'], true)) {
		$neighbour_slugs[$other_slug] = true;
	}
}

unset($neighbour_slugs[$slug]);

// Relationship lists — the reader-facing sections a live Scalar renders server-side (see
// wrapper.php), which scalarpage.jquery.js's addRelationshipNavigation() then decorates:
// retitling the <h1>, appending "?path=<slug>" to each entry so path state carries, adding
// the "Begin with …" button, and reordering the sections. Book customizations target the
// same classes ($('.path_of').prev().text('Choose a page:') and the like), so the class
// names and the section > h1 + ol structure are a contract, not an implementation detail.
//
// Only the lists addRelationshipNavigation() actually handles are emitted. Sections are
// display:block by default, so one it doesn't claim would sit on the page undecorated;
// 'has_paths' is omitted for that reason — the containing path is already surfaced by the
// breadcrumb and prev/next buttons, which scalarpage builds from the model.
$relationship_lists = array();

// Each entry pairs the listed item with the relation that put it there, so the list can carry
// that relation's own RDFa the way a live Scalar's does — one piece of markup serving as both
// the visible list and the statement of the relationship. $rendered_* then lets the plain
// neighbour and relation blocks skip whatever a list has already spoken for.
$rendered_slugs     = array();
$rendered_relations = array();

$add_list = function ($class, $heading, $entries) use (&$relationship_lists, &$rendered_slugs, &$rendered_relations) {
	if (empty($entries)) return;
	foreach ($entries as $entry) {
		$rendered_slugs[$entry['slug']] = true;
		if ($entry['relation'] !== null) $rendered_relations[$entry['relation']['urn']] = true;
	}
	$relationship_lists[] = array('class' => $class, 'heading' => $heading, 'entries' => $entries);
};

// Relations this page is the body of, grouped by kind: what it collects or annotates.
$outgoing = array('path' => array(), 'tag' => array(), 'annotation' => array());
$incoming = array('tag' => array());

foreach ($incident_relations as $relation) {
	if ($relation['body'] === $slug) {
		if (isset($book_data['paths'][$slug]))     $outgoing['path'][]       = array('slug' => $relation['target'], 'relation' => $relation);
		elseif (isset($book_data['tags'][$slug]))  $outgoing['tag'][]        = array('slug' => $relation['target'], 'relation' => $relation);
		else                                       $outgoing['annotation'][] = array('slug' => $relation['target'], 'relation' => $relation);
	} elseif ($relation['target'] === $slug && isset($book_data['tags'][$relation['body']])) {
		$incoming['tag'][] = array('slug' => $relation['body'], 'relation' => $relation);
	}
}

$add_list('path_of',       'Contents of this path:',    $outgoing['path']);
$add_list('tag_of',        'This page is a tag of:',    $outgoing['tag']);
$add_list('annotation_of', 'This page annotates:',      $outgoing['annotation']);
$add_list('has_tags',      'This page is tagged by:',   $incoming['tag']);

// Incoming references are a plain dcterms:references predicate on the referencing item rather
// than an oac:Annotation subject, so these entries carry no relation of their own — the
// statement lives on the other item's version, which the list renders in full.
$referenced_by = array();
foreach ($all_pages as $other_slug => $other_item) {
	if ($other_slug === $slug) continue;
	if (!empty($other_item['references']) && in_array($slug, $other_item['references'], true)) {
		$referenced_by[] = array('slug' => $other_slug, 'relation' => null);
	}
}
$add_list('has_reference', 'This page is referenced by:', $referenced_by);

$annotates = $outgoing['annotation'];

// The item's primary role, as the live wrapper emits it — RDF_Object's precedence, path first.
// addRelationshipNavigation() reads it off <link id="primary_role"> to word the "referenced by"
// heading, and would throw on the link being absent.
if (isset($book_data['paths'][$slug]))      { $primary_role = 'Path'; }
elseif (isset($book_data['tags'][$slug]))   { $primary_role = 'Tag'; }
elseif (!empty($annotates))                 { $primary_role = 'Annotation'; }
elseif ($is_current_media)                  { $primary_role = 'Media'; }
else                                        { $primary_role = 'Composite'; }

// Where one of an item's auxiliary images (thumbnail, banner, background) lives as seen from
// this page: the bundled copy when _copy_media_files() made one, otherwise the live absolute
// URL so the image degrades to a remote fetch instead of a broken link. Mirrors
// _aux_image_href() in static_export_model.php, which does the same job for the .meta pages.
$aux_image_href = function ($item, $field) use ($asset_root) {
	$local = 'local' . ucfirst($field);
	if (!empty($item[$local]))         return $asset_root . $item[$local];
	if (!empty($item[$field . 'Url'])) return $item[$field . 'Url'];
	return null;
};

// Emits the RDFa a Media node's Version span needs so jquery.mediaelement.js can render it
// without a live API call: source file (required) and the couple of auxProperties
// (dcterms:accessRights, dcterms:type) it reads for content warnings / audio chrome. A closure
// (not a top-level function) because this template is included once per rendered page.
$emit_media_rdfa = function ($media_item) use ($asset_root) {
	$out = '';
	if (!empty($media_item['sourceUrl'])) {
		$source_href = $media_item['localPath'] !== null
			? $asset_root . $media_item['localPath']
			: $media_item['sourceUrl'];
		$out .= "\t\t\t" . '<span class="metadata" property="art:url">' . htmlspecialchars($source_href) . '</span>' . "\n";
	}
	$meta_props = isset($media_item['additionalMetadata']) ? $media_item['additionalMetadata'] : array();
	if (!empty($meta_props['http://purl.org/dc/terms/accessRights'][0]['value'])) {
		$out .= "\t\t\t" . '<span class="metadata" property="dcterms:accessRights">' . htmlspecialchars($meta_props['http://purl.org/dc/terms/accessRights'][0]['value']) . '</span>' . "\n";
	}
	if (!empty($meta_props['http://purl.org/dc/terms/type'][0]['value'])) {
		$out .= "\t\t\t" . '<span class="metadata" property="dcterms:type">' . htmlspecialchars($meta_props['http://purl.org/dc/terms/type'][0]['value']) . '</span>' . "\n";
	}
	return $out;
};

// Emits an item's dcterms:references — the other content it links to or embeds — onto its
// Version span, which is where ScalarVersion.parseRelations() looks for them. Each value is a
// bare node URL: that method resolves targets with an exact nodesByURL lookup and no extension
// stripping, so a version URL would silently match nothing.
//
// Emitted for pages and media alike (a media item's caption can link other content), and only
// for targets that were themselves exported — an unpublished or deleted page can still be
// referenced by a live one, and a dangling URL here would resolve to no node and drop the
// relation anyway. One direction is enough: parseRelations() derives the inverse.
//
// These edges are what connect pages to the media they use in the connections, radial and tree
// visualizations, and what fills "Citations of this media" in the media Citations dialog.
$emit_references_rdfa = function ($item) use ($book_url, $all_pages) {
	$out = '';
	if (empty($item['references'])) return $out;

	foreach ($item['references'] as $ref_slug) {
		if (!isset($all_pages[$ref_slug])) continue;
		$out .= "\t\t\t" . '<a class="metadata" tabindex="-1" rel="dcterms:references" href="'
			. htmlspecialchars($book_url . $ref_slug) . '"></a>' . "\n";
	}

	return $out;
};

// One item's node and version subjects, the pair that makes a node real to scalarapi. Used
// both for the plain neighbour spans and inside the relationship lists below, so an item
// carries identical RDFa whichever way this page happens to reach it.
//
// $visible_title turns the title into a rendered link rather than inert metadata — that is
// what a relationship list shows the reader, and the [property="dcterms:title"] > a shape is
// the selector addRelationshipNavigation() rewrites to carry "?path=…" state.
$emit_item_rdfa = function ($item_slug, $item, $visible_title = false)
		use ($book_url, $book_data, &$emit_node_rdfa, &$emit_references_rdfa, &$emit_media_rdfa) {

	$is_media  = isset($book_data['media'][$item_slug]);
	$node_url  = htmlspecialchars($book_url . $item_slug);
	$ver_url   = htmlspecialchars($book_url . $item_slug . '.1');
	$title     = htmlspecialchars($item['title']);
	$inert     = $visible_title ? '' : ' inert';

	// The explicit content= matters on the visible form, and the live wrapper.php carries it
	// for the same reason: with an <a> inside, the RDFa parser does not read the element's text
	// as the literal, and the title comes out empty — which surfaces as a blank "Begin with
	// ..." button and "(No title)" wherever the model is read.
	$title_span = $visible_title
		? '<span property="dcterms:title" content="' . $title . '"><a href="' . $node_url . '">' . $title . '</a></span>'
		: '<span class="metadata" property="dcterms:title">' . $title . '</span>';

	$out  = "\t\t" . '<span' . $inert . ' resource="' . $node_url . '" typeof="scalar:'
		. ($is_media ? 'Media' : 'Composite') . '">' . "\n";
	$out .= "\t\t\t" . '<a class="metadata" tabindex="-1" rel="dcterms:hasVersion" href="' . $ver_url . '"></a>' . "\n";
	$out .= "\t\t\t" . '<a class="metadata" tabindex="-1" rel="dcterms:isPartOf" href="'
		. htmlspecialchars(rtrim($book_url, '/')) . '"></a>' . "\n";
	$out .= $emit_node_rdfa($item);
	$out .= "\t\t" . '</span>' . "\n";

	$out .= "\t\t" . '<span' . $inert . ' resource="' . $ver_url . '" typeof="scalar:Version">' . "\n";
	$out .= "\t\t\t" . $title_span . "\n";
	$out .= "\t\t\t" . '<span class="metadata" property="dcterms:description">'
		. htmlspecialchars(isset($item['description']) ? $item['description'] : '') . '</span>' . "\n";
	if (!empty($item['created'])) {
		$out .= "\t\t\t" . '<span class="metadata" property="dcterms:created">'
			. htmlspecialchars($item['created']) . '</span>' . "\n";
	}
	if (!empty($item['versionNumber'])) {
		$out .= "\t\t\t" . '<span class="metadata" property="ov:versionnumber">'
			. (int) $item['versionNumber'] . '</span>' . "\n";
	}
	$out .= "\t\t\t" . '<a class="metadata" tabindex="-1" rel="dcterms:isVersionOf" href="' . $node_url . '"></a>' . "\n";
	$out .= $emit_references_rdfa($item);
	if ($is_media) $out .= $emit_media_rdfa($item);
	$out .= "\t\t" . '</span>' . "\n";

	return $out;
};

// Emits the RDFa that belongs to the *node* rather than to one of its versions. The
// distinction matters: Scalar stores these on the content row, so the live API reports them
// as node properties and every consumer reads them that way —
//
//   art:thumbnail  ScalarNode.thumbnail and getAbsoluteThumbnailURL(), which the Index modal,
//                  the structured gallery, path-navigation previews and video poster frames
//                  all go through. Emitting it on the Version span (as this template first
//                  did) left node.thumbnail null and every one of those fell back to the
//                  generic media icon.
//   scalar:banner  ScalarNode.banner, read directly by scalarpage.jquery.js's 'splash',
//                  'book_splash' and 'image_header' layouts for their header image or video.
//
// Any content item can have either, pages included — hence not folded into $emit_media_rdfa.
$emit_node_rdfa = function ($item) use ($aux_image_href) {
	$out = '';

	foreach (array('thumbnail' => 'art:thumbnail', 'banner' => 'scalar:banner') as $field => $predicate) {
		$href = $aux_image_href($item, $field);
		if ($href === null) continue;
		$out .= "\t\t\t" . '<span class="metadata" property="' . $predicate . '">'
			. htmlspecialchars($href) . '</span>' . "\n";
	}

	return $out;
};

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<!DOCTYPE html>
<?php
// Every prefix the exporting install knows, exactly as the live wrapper.php declares them. Two
// things read these attributes and nothing else: the RDFa parser, to expand the CURIEs below,
// and scalarapi, which builds model.namespaces from them at boot. The second is why the list
// has to be the whole config and not the handful of prefixes this template writes itself —
// ScalarVersion.parseData() puts a predicate into auxProperties only if toNS() can shorten it,
// so an author's iptc: or dwc: metadata is invisible to the media Details tab, and unreachable
// by a lens's metadata filter, unless its prefix is declared here.
$namespaces = array();
foreach ((array) (isset($meta['namespaces']) ? $meta['namespaces'] : array()) as $ns_prefix => $ns_uri) {
	// Prefix and URI both have to be real: a malformed map would otherwise be emitted verbatim
	// as attributes, and one bad xmlns is enough to make an RDFa parser distrust the document.
	if (is_string($ns_prefix) && $ns_prefix !== '' && is_string($ns_uri) && $ns_uri !== '') {
		$namespaces[$ns_prefix] = $ns_uri;
	}
}
if (empty($namespaces)) $namespaces = array(
	'rdf'     => 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
	'dc'      => 'http://purl.org/dc/elements/1.1/',
	'dcterms' => 'http://purl.org/dc/terms/',
	'sioc'    => 'http://rdfs.org/sioc/ns#',
	'scalar'  => 'http://scalar.usc.edu/2012/01/scalar-ns#',
	'art'     => 'http://simile.mit.edu/2003/10/ontologies/artstor#',
	'oac'     => 'http://www.openannotation.org/ns/',
	'foaf'    => 'http://xmlns.com/foaf/0.1/',
	'ov'      => 'http://open.vocab.org/terms/',
);
?>
<html xml:lang="en" lang="en"
<?php foreach ($namespaces as $ns_prefix => $ns_uri): ?>
  xmlns:<?= htmlspecialchars($ns_prefix) ?>="<?= htmlspecialchars($ns_uri) ?>"
<?php endforeach; ?>
>
<head>
<title><?= htmlspecialchars(strip_tags($page['title'])) ?><?= !empty($meta['title']) ? ' — ' . htmlspecialchars(strip_tags($meta['title'])) : '' ?></title>
<meta name="description" content="<?= htmlspecialchars(strip_tags(isset($page['description']) ? $page['description'] : '')) ?>" />
<meta name="viewport" content="initial-scale=1, maximum-scale=1" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta property="og:title" content="<?= htmlspecialchars(strip_tags($meta['title'])) ?>: <?= htmlspecialchars(strip_tags($page['title'])) ?>" />
<meta property="og:description" content="<?= htmlspecialchars(strip_tags(isset($page['description']) ? $page['description'] : '')) ?>" />
<meta property="og:type" content="article" />

<!-- Scalar identity links — read by scalarapi.js at boot -->
<link id="scalar_version"  href="<?= htmlspecialchars($meta['scalarVersion']) ?>" />
<link id="book_id"         href="<?= htmlspecialchars($meta['slug']) ?>" />
<link id="parent"          href="<?= htmlspecialchars($book_url) ?>" />
<link id="approot"         href="<?= htmlspecialchars($asset_root) ?>system/application/" />
<link id="view"            href="<?= $is_lens_browser ? 'manage_lenses' : 'plain' ?>" />
<link id="default_view"    href="<?= htmlspecialchars($layout) ?>" />
<?php if (!$is_lens_browser): ?>
<link id="current_node"    href="<?= htmlspecialchars($book_url . $slug) ?>" />
<?php endif; ?>
<link id="primary_role"    rel="scalar:primary_role" href="http://scalar.usc.edu/2012/01/scalar-ns#<?= $primary_role ?>" />

<!-- Favicon -->
<link rel="shortcut icon" href="<?= $assets ?>views/arbors/html5_RDFa/favicon_16.gif" />
<link rel="apple-touch-icon" href="<?= $assets ?>views/arbors/html5_RDFa/favicon_114.jpg" />

<!-- CSS — same order as cantaloupe/content.php -->
<link rel="stylesheet" href="<?= $assets ?>views/melons/cantaloupe/css/reset.css" />
<link rel="stylesheet" href="<?= $assets ?>views/melons/cantaloupe/css/bootstrap.min.css" />
<link rel="stylesheet" href="<?= $assets ?>views/melons/cantaloupe/css/bootstrap-accessibility.css" />
<link rel="stylesheet" href="<?= $assets ?>views/widgets/mediaelement/css/annotorious.css" />
<link rel="stylesheet" href="<?= $assets ?>views/widgets/mediaelement/mediaelement.css" />
<link rel="stylesheet" href="<?= $assets ?>views/melons/cantaloupe/css/common.css" />
<link rel="stylesheet" href="<?= $assets ?>views/melons/cantaloupe/css/scalarvis.css" />
<link rel="stylesheet" href="<?= $assets ?>views/melons/cantaloupe/css/header.css" />
<link rel="stylesheet" href="<?= $assets ?>views/melons/cantaloupe/css/widgets.css" />
<link rel="stylesheet" href="<?= $assets ?>views/melons/cantaloupe/css/responsive.css" />
<link rel="stylesheet" href="<?= $assets ?>views/melons/cantaloupe/css/timeline.css" />
<link rel="stylesheet" href="<?= $assets ?>views/melons/cantaloupe/css/timeline.theme.scalar.css" />
<link rel="stylesheet" href="<?= $assets ?>views/melons/cantaloupe/css/screen_print.css" media="screen,print" />
<?php if ($needs_lens_editor): ?>
<link rel="stylesheet" href="<?= $assets ?>views/melons/cantaloupe/css/lenses.css" />
<link rel="stylesheet" href="<?= $assets ?>views/widgets/edit/content_selector.css" />
<?php endif; ?>

<!-- JS — jQuery first, then the baked server data and the bridge that answers API calls
     from it, then the Scalar stack. The data file has to precede the bridge: the bridge
     reads window.__scalarStaticData when a request comes in, and a missing file would
     leave it serving the reduced fallbacks instead. -->
<script src="<?= $assets ?>views/arbors/html5_RDFa/js/jquery-3.4.1.min.js"></script>
<script src="<?= $asset_root ?>scalar-static-data.js"></script>
<script src="<?= $asset_root ?>scalar-static-bridge.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/bootstrap.min.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/jquery.bootstrap-modal.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/jquery.bootstrap-accessibility.js"></script>
<!-- Pre-load scripts that main.js fetches via $.get() so they run on any protocol.
     Over file:// browsers return no Content-Type, so jQuery won't eval dynamically-fetched
     JS; pre-loading as <script> tags guarantees the plugins are registered before main.js. -->
<script src="<?= $assets ?>views/arbors/html5_RDFa/js/jquery.rdfquery.rules-1.0.js"></script>
<script src="<?= $assets ?>views/arbors/html5_RDFa/js/jquery.RDFa.js"></script>
<script src="<?= $assets ?>views/arbors/html5_RDFa/js/form-validation.js"></script>
<script src="<?= $assets ?>views/widgets/nav/jquery.scalarrecent.js"></script>
<script src="<?= $assets ?>views/widgets/cookie/jquery.cookie.js"></script>
<script src="<?= $assets ?>views/widgets/spinner/spin.min.js"></script>
<script src="<?= $assets ?>views/widgets/d3/d3.v5.min.js"></script>
<script src="<?= $assets ?>views/widgets/mediaelement/annotorious.debug.js"></script>
<script src="<?= $assets ?>views/widgets/mediaelement/jquery.mediaelement.js"></script>
<script src="<?= $assets ?>views/widgets/api/scalarapi.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/main.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/jquery.dotdotdot.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/jquery.scrollTo.min.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/scalarheader.jquery.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/scalarpage.jquery.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/scalarmedia.jquery.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/scalarmediadetails.jquery.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/scalarindex.jquery.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/scalarhelp.jquery.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/scalarcomments.jquery.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/scalarsearch.jquery.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/scalarvisualizations.jquery.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/scalarstructuredgallery.jquery.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/scalarwidgets.jquery.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/scalarlenses.jquery.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/jquery.tabbing.js"></script>
<?php if ($needs_lens_editor): ?>
<!-- The lens editor's runtime-fetched dependencies, pre-loaded — see $needs_lens_editor above.
     bootbox and the content selector are what ScalarPage.addLensEditor() waits on before it
     builds anything; papaparse is what the lens menu's "Export to CSV" writes with. -->
<script src="<?= $assets ?>views/melons/cantaloupe/js/bootbox.min.js"></script>
<script src="<?= $assets ?>views/widgets/edit/jquery.content_selector_bootstrap.js"></script>
<script src="<?= $assets ?>views/melons/cantaloupe/js/papaparse.min.js"></script>
<?php endif; ?>
<?php if ($is_lens_browser): ?>
<script src="<?= $assets ?>views/melons/cantaloupe/js/scalarlensmanager.jquery.js"></script>
<?php endif; ?>
</head>
<?php
// Background image, applied inline exactly as the live wrapper.php does, with the same
// precedence: the book's background unless this page overrides it. (wrapper.php has a third
// step between the two — the background of the path the reader arrived by — which depends on
// the ?path= the request carried, so there is no single right answer to bake into a file.)
//
// This is a <body> style rather than RDFa because that is where the page chrome looks for it:
// scalarpage.jquery.js's setupScreenedBackground(), which the gallery, structured gallery and
// image-header layouts call, reads the computed background image straight off <body> and moves
// it onto a screening layer. No scalar:background property is emitted alongside it — its only
// consumer is the timeline layout's per-event background, which composes its URL as
// book_url + node.background and so cannot be handed either a page-relative path or an
// absolute one. (The .meta pages list the value for reference; see _build_meta_page_body().)
$background_href = $aux_image_href($page, 'background');
if ($background_href === null) $background_href = $aux_image_href($meta, 'background');
?>
<body<?= $background_href !== null
	? ' style="background-image:url(' . htmlspecialchars(str_replace(' ', '%20', $background_href)) . ');"'
	: '' ?>>

<article role="main">
	<header>

		<!-- Book node — main.js reads its URI to derive the model's urlPrefix, before
		     anything is parsed, so this one has to be inline on every page -->
		<span resource="<?= htmlspecialchars(rtrim($book_url, '/')) ?>" typeof="scalar:Book">
			<span property="dcterms:title" content="<?= htmlspecialchars(strip_tags($meta['title'])) ?>">
				<!-- scalarheader.jquery.js detaches this link and reuses its href for both the
				     navbar book title and the mobile "Home Page" link, so it has to resolve as
				     a file: "index.html", not the extensionless "index" a live Scalar routes. -->
				<a id="book-title" href="<?= $asset_root ?>index.html"><?= htmlspecialchars(strip_tags($meta['title'])) ?></a>
			</span>
			<a class="metadata" tabindex="-1" inert rel="dcterms:tableOfContents"
			   href="<?= htmlspecialchars($book_url . 'toc') ?>"></a>
		</span>
		<!-- The book's dcterms:hasPart list and the table-of-contents node (whose
		     dcterms:references drive the main menu) are book-level facts, not page-level ones,
		     and both are O(number of pages). They come from the baked graph instead. -->

		<!-- This page's immediate neighbours (inert). The rest of the book's nodes are seeded
		     from scalar-static-data.js; see the neighbour computation at the top of this file.
		     Neighbours a relationship list renders below are skipped here — that markup carries
		     the same RDFa, fused with the visible entry exactly as a live Scalar does it. -->
<?php foreach ($neighbour_slugs as $other_slug => $ignored):
	if (!isset($all_pages[$other_slug]) || isset($rendered_slugs[$other_slug])) continue;
	echo $emit_item_rdfa($other_slug, $all_pages[$other_slug]);
endforeach; ?>

<?php if ($is_lens_browser): ?>
		<!-- The lens browser states no node of its own: it is the book's chrome around a UI,
		     not a page of the book. A live Scalar's manage_lenses view renders with $page
		     empty for the same reason, and wrapper.php skips this whole block there too.
		     Asserting a node here would put a phantom "Lenses" page into every reader's model
		     — one with no content, showing up in the Index and in any lens that selects all
		     content. -->
<?php else: ?>
		<!-- Current page -->
		<h1 property="dcterms:title"><?= htmlspecialchars($page['title']) ?></h1>
		<span resource="<?= htmlspecialchars($book_url . $slug) ?>" typeof="scalar:<?= $is_current_media ? 'Media' : 'Composite' ?>">
			<a class="metadata" inert rel="dcterms:hasVersion"
			   href="<?= htmlspecialchars($book_url . $slug . '.1') ?>"></a>
			<a class="metadata" inert rel="dcterms:isPartOf"
			   href="<?= htmlspecialchars(rtrim($book_url, '/')) ?>"></a>
<?php if (!empty($page['contentId'])): ?>
			<!-- The content URN, which jquery.scalarrecent.js copies into the reader's local
			     visit history for this page. It finds it as the *first* [rel="scalar:urn"] in
			     <header>, so this is emitted for the current page alone and never for the
			     neighbour spans above — which is also why it isn't in $emit_node_rdfa(). Every
			     node's copy is in the baked graph instead, where the visit-date filter and sort
			     match a history entry back to the node it names. -->
			<a class="metadata" tabindex="-1" inert rel="scalar:urn"
			   href="urn:scalar:content:<?= (int) $page['contentId'] ?>"></a>
<?php endif; ?>
<?= $emit_node_rdfa($page) ?>
		</span>
		<span resource="<?= htmlspecialchars($book_url . $slug . '.1') ?>" typeof="scalar:Version">
			<a class="metadata" inert rel="dcterms:isVersionOf"
			   href="<?= htmlspecialchars($book_url . $slug) ?>"></a>
			<!-- The <h1> above carries dcterms:title too, but for the *document* subject, not
			     this Version — so without this span the current page is the one node in the
			     book whose version has no title, and anything reading titles from the model
			     renders it as "(No title)". Most visibly: its own entry in the Table of
			     Contents menu, on the very page a reader is looking at. -->
			<span class="metadata" property="dcterms:title"><?= htmlspecialchars($page['title']) ?></span>
			<span class="metadata" property="dcterms:description"><?= htmlspecialchars(isset($page['description']) ? $page['description'] : '') ?></span>
<?php if (!empty($page['created'])): ?>
			<span class="metadata" property="dcterms:created"><?= htmlspecialchars($page['created']) ?></span>
<?php endif; ?>
<?php if (!empty($page['versionNumber'])): ?>
			<span class="metadata" property="ov:versionnumber"><?= (int) $page['versionNumber'] ?></span>
<?php endif; ?>
<?= $emit_references_rdfa($page) ?>
<?php if ($is_current_media): ?>
<?= $emit_media_rdfa($page) ?>
<?php endif; ?>
<?php
// This page's own additional metadata — everything an author, or an image's EXIF/IPTC block,
// put on the version beyond Scalar's built-in fields. The baked graph carries it for every node
// in the book (see _graph_entries_for_item), so this is not what a lens or the media Details
// tab reads; it is here for the same reason the neighbour block above exists, so a single file
// opened on its own still states what it knows about itself. Emitted for the current page only,
// where it is a handful of values, rather than for every neighbour, where it would multiply.
//
// URI-valued entries become rel= links and literals become property= spans, the same split
// print_rdf() makes in the live wrapper.
foreach ((array) (isset($page['additionalMetadata']) ? $page['additionalMetadata'] : array())
		as $predicate => $values):
	$curie = null;
	foreach ($namespaces as $ns_prefix => $ns_uri) {
		if (strpos($predicate, $ns_uri) === 0) { $curie = $ns_prefix . ':' . substr($predicate, strlen($ns_uri)); break; }
	}
	if ($curie === null) continue;   // no declared prefix, so nothing downstream could name it
	foreach ((array) $values as $value):
		if (!isset($value['value'])) continue;
		if (isset($value['type']) && 'uri' === $value['type']): ?>
			<a class="metadata" tabindex="-1" inert rel="<?= htmlspecialchars($curie) ?>" href="<?= htmlspecialchars($value['value']) ?>"></a>
<?php	else: ?>
			<span class="metadata" property="<?= htmlspecialchars($curie) ?>"><?= htmlspecialchars($value['value']) ?></span>
<?php	endif;
	endforeach;
endforeach;
?>
<?php if ($lens_json !== null): ?>
			<!-- This page's lens, as a JSON literal — the same property a live Scalar emits
			     (config/rdf.php maps the version's is_lens_of to scalar:isLensOf), and the
			     same shape, because both come from Lens_model::get_children().
			     scalarpage.jquery.js tests for the property's presence to decide whether to
			     run addLensEditor(), and ScalarLenses.getEmbeddedJson() then reads the
			     definition straight back out of the element with .html() — so the text has to
			     survive innerHTML unchanged. Hence the hex escaping rather than
			     htmlspecialchars(): '<', '>' and '&' leave here as \u003C-style JSON escapes,
			     which are inert to the HTML parser and still parse as the characters they
			     stand for, where entities would come back from .html() literally and break
			     JSON.parse. -->
			<span class="metadata" property="scalar:isLensOf"><?=
				json_encode($lens_json, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT)
			?></span>
<?php endif; ?>
<?php if ($is_meta_view): ?>
			<!-- Drives scalarpage.jquery.js's case "meta" branch client-side (inserts the
			     "Metadata" h2, etc.) — see _write_meta_page() in static_export_model.php for
			     why this can't be triggered via URL-extension detection like the live site. -->
			<span class="metadata" property="scalar:defaultView">meta</span>
<?php elseif ('plain' !== $layout): ?>
			<!-- The author's chosen layout. Every place scalarpage.jquery.js decides what to
			     render — addMediaElements(), the main switch(viewType), the lens setup — reads
			     it from here, from the current node's RDFa; none of them looks at
			     <link id="default_view"> above, which is why every non-Basic layout used to
			     come out of the export as a plain text page. 'plain' is skipped because it is
			     already the default those call sites fall back to when the property is absent,
			     which is also what a live Scalar emits for a page with no stored view. -->
			<span class="metadata" property="scalar:defaultView"><?= htmlspecialchars($layout) ?></span>
<?php endif; ?>
		</span>

		<!-- Relations incident to this page that no relationship list above already states —
		     this page's place on a path, and annotations *of* it, neither of which Scalar
		     renders as a list here. ScalarRelation infers a relation's kind
		     — path, tag, or which flavour of annotation — from the anchor fragment on its
		     oac:hasTarget URL; _build_relations() in static_export_model.php builds both these
		     and the baked graph's copies from one list so the two cannot drift. The '.1'
		     version suffix only has to be present, not accurate: ScalarRelation resolves both
		     endpoints with stripVersion(). -->
<?php foreach ($incident_relations as $relation):
	if (isset($rendered_relations[$relation['urn']])) continue; ?>
		<span class="metadata" inert resource="<?= htmlspecialchars($relation['urn']) ?>" typeof="oac:Annotation">
			<a class="metadata" tabindex="-1" rel="oac:hasBody"
			   href="<?= htmlspecialchars($book_url . $relation['body'] . '.1') ?>"></a>
			<a class="metadata" tabindex="-1" rel="oac:hasTarget"
			   href="<?= htmlspecialchars($book_url . $relation['target'] . '.1' . $relation['fragment']) ?>"></a>
		</span>
<?php endforeach; ?>
<?php endif; ?>

	</header>

<?php foreach ($relationship_lists as $list): ?>
	<section>
		<h1><?= htmlspecialchars($list['heading']) ?></h1>
		<!-- Each entry states the relationship and renders it at once, the way the live
		     wrapper.php does: the <li> is the oac:Annotation subject, and the item's own node
		     and version spans sit inside it carrying the visible title link. That fusion is
		     why these items are skipped by the plain neighbour block above — this markup is
		     their RDFa, not a duplicate of it. -->
		<ol class="<?= $list['class'] ?>">
<?php	foreach ($list['entries'] as $entry):
			if (!isset($all_pages[$entry['slug']])) continue;
			$rel = $entry['relation']; ?>
<?php		if ($rel !== null): ?>
			<li resource="<?= htmlspecialchars($rel['urn']) ?>" typeof="oac:Annotation">
				<a class="metadata" tabindex="-1" inert rel="oac:hasBody"
				   href="<?= htmlspecialchars($book_url . $rel['body'] . '.1') ?>"></a>
				<a class="metadata" tabindex="-1" inert rel="oac:hasTarget"
				   href="<?= htmlspecialchars($book_url . $rel['target'] . '.1' . $rel['fragment']) ?>"></a>
<?php		else: ?>
			<li>
<?php		endif; ?>
<?= $emit_item_rdfa($entry['slug'], $all_pages[$entry['slug']], true) ?>
			</li>
<?php	endforeach; ?>
		</ol>
	</section>
<?php endforeach; ?>

	<span property="sioc:content"><?= isset($page['body']) ? $page['body'] : '' ?></span>

</article>

</body>
</html>
