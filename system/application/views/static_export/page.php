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

// Relative path prefix for vendored assets (CSS/JS copied into the export root).
// All asset paths are expressed relative to $asset_root so the ZIP works
// regardless of where it is hosted or opened locally.
$assets = $asset_root . 'system/application/';

// Emits the RDFa a Media node's Version span needs so jquery.mediaelement.js can render it
// without a live API call: source file (required), thumbnail, and the couple of auxProperties
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
	if (!empty($media_item['thumbnail'])) {
		$out .= "\t\t\t" . '<span class="metadata" property="art:thumbnail">' . htmlspecialchars($media_item['thumbnail']) . '</span>' . "\n";
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

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<!DOCTYPE html>
<html xml:lang="en" lang="en"
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:sioc="http://rdfs.org/sioc/ns#"
  xmlns:scalar="http://scalar.usc.edu/2012/01/scalar-ns#"
  xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
  xmlns:oac="http://www.openannotation.org/ns/"
  xmlns:foaf="http://xmlns.com/foaf/0.1/"
  xmlns:ov="http://open.vocab.org/terms/">
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
<link id="view"            href="plain" />
<link id="default_view"    href="<?= htmlspecialchars($layout) ?>" />
<link id="current_node"    href="<?= htmlspecialchars($book_url . $slug) ?>" />

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

<!-- JS — jQuery first, then bridge (intercepts API calls), then Scalar stack -->
<script src="<?= $assets ?>views/arbors/html5_RDFa/js/jquery-3.4.1.min.js"></script>
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
</head>
<body>

<article role="main">
	<header>

		<!-- Book node — scalarapi reads title, tableOfContents, hasPart -->
		<span resource="<?= htmlspecialchars(rtrim($book_url, '/')) ?>" typeof="scalar:Book">
			<span property="dcterms:title" content="<?= htmlspecialchars(strip_tags($meta['title'])) ?>">
				<!-- scalarheader.jquery.js detaches this link and reuses its href for both the
				     navbar book title and the mobile "Home Page" link, so it has to resolve as
				     a file: "index.html", not the extensionless "index" a live Scalar routes. -->
				<a id="book-title" href="<?= $asset_root ?>index.html"><?= htmlspecialchars(strip_tags($meta['title'])) ?></a>
			</span>
			<a class="metadata" tabindex="-1" inert rel="dcterms:hasPart"
			   href="<?= htmlspecialchars($book_url . $slug) ?>"></a>
			<a class="metadata" tabindex="-1" inert rel="dcterms:tableOfContents"
			   href="<?= htmlspecialchars($book_url . 'toc') ?>"></a>
		</span>

		<!-- TOC node — scalarapi builds the main nav from dcterms:references items -->
		<span resource="<?= htmlspecialchars($book_url . 'toc') ?>" typeof="scalar:Page">
			<span class="metadata" property="dcterms:title">Main Menu</span>
<?php foreach ($toc as $i => $toc_slug): ?>
			<a class="metadata" tabindex="-1" rel="dcterms:references"
			   href="<?= htmlspecialchars($book_url . $toc_slug) ?>#index=<?= ($i + 1) ?>"></a>
<?php endforeach; ?>
		</span>

		<!-- All other content nodes (inert) — scalarapi builds its full node index from these -->
<?php foreach ($all_pages as $other_slug => $other_page):
	if ($other_slug === $slug) continue;
	$is_media  = isset($book_data['media'][$other_slug]);
	$node_type = $is_media ? 'Media' : 'Composite';
	$node_url  = htmlspecialchars($book_url . $other_slug);
	$ver_url   = htmlspecialchars($book_url . $other_slug . '.1');
?>
		<span inert resource="<?= $node_url ?>" typeof="scalar:<?= $node_type ?>">
			<a class="metadata" tabindex="-1" rel="dcterms:hasVersion" href="<?= $ver_url ?>"></a>
			<a class="metadata" tabindex="-1" rel="dcterms:isPartOf"
			   href="<?= htmlspecialchars(rtrim($book_url, '/')) ?>"></a>
		</span>
		<span inert resource="<?= $ver_url ?>" typeof="scalar:Version">
			<span class="metadata" property="dcterms:title"><?= htmlspecialchars($other_page['title']) ?></span>
			<span class="metadata" property="dcterms:description"><?= htmlspecialchars(isset($other_page['description']) ? $other_page['description'] : '') ?></span>
<?php if (!empty($other_page['created'])): ?>
			<span class="metadata" property="dcterms:created"><?= htmlspecialchars($other_page['created']) ?></span>
<?php endif; ?>
<?php if (!empty($other_page['versionNumber'])): ?>
			<span class="metadata" property="ov:versionnumber"><?= (int) $other_page['versionNumber'] ?></span>
<?php endif; ?>
			<a class="metadata" tabindex="-1" rel="dcterms:isVersionOf" href="<?= $node_url ?>"></a>
<?php if ($is_media): ?>
<?= $emit_media_rdfa($other_page) ?>
<?php endif; ?>
		</span>
<?php endforeach; ?>

		<!-- Current page -->
		<h1 property="dcterms:title"><?= htmlspecialchars($page['title']) ?></h1>
		<span resource="<?= htmlspecialchars($book_url . $slug) ?>" typeof="scalar:<?= $is_current_media ? 'Media' : 'Composite' ?>">
			<a class="metadata" inert rel="dcterms:hasVersion"
			   href="<?= htmlspecialchars($book_url . $slug . '.1') ?>"></a>
			<a class="metadata" inert rel="dcterms:isPartOf"
			   href="<?= htmlspecialchars(rtrim($book_url, '/')) ?>"></a>
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
<?php if ($is_current_media): ?>
<?= $emit_media_rdfa($page) ?>
<?php endif; ?>
<?php if ($is_meta_view): ?>
			<!-- Drives scalarpage.jquery.js's case "meta" branch client-side (inserts the
			     "Metadata" h2, etc.) — see _write_meta_page() in static_export_model.php for
			     why this can't be triggered via URL-extension detection like the live site. -->
			<span class="metadata" property="scalar:defaultView">meta</span>
<?php endif; ?>
		</span>

	</header>

	<span property="sioc:content"><?= isset($page['body']) ? $page['body'] : '' ?></span>

</article>

</body>
</html>
