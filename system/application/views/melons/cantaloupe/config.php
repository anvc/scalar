<?php

// Arbor (wrapper) to use, e.g., 'html5_RDFa'
$config['arbor'] = 'html5_RDFa';

// Melon metadata
$config['melon_meta'] = array(
	'is_selectable' => true,
	'slug'=>'cantaloupe',
	'name'=>'Scalar 2',
	'description'=>'Clean design, new page layout options including splash pages and media galleries, new media sizing and placement options, mobile support, <a target="_blank" href="http://scalar.usc.edu/works/guide2/scalar-20-whats-new">and more</a>....',
	'thumb_app_path'=>'views/melons/cantaloupe/images/scalar_cantaloupe_thumb.png'
);

// Stylesheets
$config['stylesheets'] = array();

// Array of views
// Items with a value will appear in the edit page's Layout pulldown as options
// Image paths are relative to Scalar's application folder
// First item will be the default
$config['views'] = array(
	'plain' => array('name'=>'Basic','description'=>'<b>Freely mixes text and media.</b> In the Basic layout, the page\'s text and media are interspersed. You can set the size and placement of linked media as they are added to the page.','image'=>'views/melons/cantaloupe/images/view_basic.gif'),
	'image_header' => array('name'=>'Image Header','description'=>'<b>Adds a large image at the top.</b> In the Image Header layout, the page\'s key image is shown as a header, with the title and description of the page overlaid. The rest of the page follows the Basic layout, with text and media interspersed.','image'=>'views/melons/cantaloupe/images/view_image_header.gif'),
	'splash' => array('name'=>'Splash','description'=>'<b>Shows a full screen cover for a section.</b> In the Splash layout, the page\'s key image is shown full screen, with the page\'s title at the bottom. If the page is part of a path or is itself a path, a navigation button is shown as well.','image'=>'views/melons/cantaloupe/images/view_splash.gif'),
	'book_splash' => array('name'=>'Book Splash','description'=>'<b>Shows a full screen cover for your book.</b> In the Book Splash layout, the page\'s key image (either its own, or one inherited from its parent) is shown full screen, with the book\'s title and author(s) at the bottom. If the page is part of a path or is itself a path, a navigation button is shown as well.','image'=>'views/melons/cantaloupe/images/view_book_splash.gif'),
	'gallery' => array('name'=>'Media Gallery','description'=>'<b>Embeds all the related media.</b> In the Media Gallery layout, media referenced, contained, or tagged by the page are compiled into a full width gallery just below the page\'s title.','image'=>'views/melons/cantaloupe/images/view_gallery.gif'),
	'structured_gallery' => array('name'=>'Structured Media Gallery','description'=>'<b>Shows thumbnail galleries for all the media related to this page and its children.</b> In the Structured Media Gallery layout, media contained, tagged, or linked up to two levels deep are grouped into titled galleries of thumbnails which reveal the media in a larger view when clicked. The description for each path and tag is included just above its gallery.','image'=>'views/melons/cantaloupe/images/view_structured_gallery.gif'),
	'google_maps' => array('name'=>'Google Map','description'=>'<b>Adds a map at the top.</b> The Google Map layout plots the current page plus any content it contains or tags on a Google Map embedded at the top of the page. Every piece of content to be plotted must include <i>dcterms:coverage</i> or <i>dcterms:spatial</i> (either will work) metadata in the format <i>decimal latitude,decimal longitude</i> (which can be added using the \'Metadata\' tab above). Each pin shown on the map will reveal the title, description, and link for its content when clicked. The rest of the page follows the Basic layout, with text and media interspersed.','image'=>'views/melons/cantaloupe/images/view_google_map.gif'),
	'blank' => array('name'=>'Blank slate','description'=>'<b>Provides a blank canvas for experimental uses.</b> This layout removes the page\'s title, footer, margins, linked media, and navigation to make room for your content. Ideal for full screen embedded media or alternative interfaces.','image'=>'views/melons/cantaloupe/images/view_blank.gif'),
	'visindex' => array('name'=>'Grid','description'=>'<b>Visualizes all content by type.</b> The Grid layout embeds a visualization at the top of the page that shows content as boxes in a grid. Colored lines are drawn representing connections between the current page and its related content. The rest of the page follows the Basic layout, with text and media interspersed.','image'=>'views/melons/cantaloupe/images/view_grid.gif'),
	'visradial' => array('name'=>'Radial','description'=>'<b>Visualizes all related content.</b> The Radial layout embeds a circular visualization at the top of the page that shows connections between content. Colored arcs are drawn representing connections between the current page and its related content, set against the backdrop of all of the other connections in the work. The rest of the page follows the Basic layout, with text and media interspersed.','image'=>'views/melons/cantaloupe/images/view_radial.gif'),
	'vispath' => array('name'=>'Path','description'=>'<b>Visualizes the current path.</b> The Path layout embeds a visualization at the top of the page that shows the path contents of the current page in a tree diagram. The reader can expand sub-paths of the tree to explore its contents. The rest of the page follows the Basic layout, with text and media interspersed.','image'=>'views/melons/cantaloupe/images/view_path.gif'),
	'vismedia' => array('name'=>'Media','description'=>'<b>Visualizes this page’s media.</b> The Media layout embeds a force-directed visualization at the top of the page that shows the media it references or annotates. The rest of the page follows the Basic layout, with text and media interspersed.','image'=>'views/melons/cantaloupe/images/view_tag.gif'),
	'vistag' => array('name'=>'Tag','description'=>'<b>Visualizes content tagged by this page.</b> The Tag layout embeds a force-directed visualization at the top of the page that shows the content it tags. The rest of the page follows the Basic layout, with text and media interspersed.','image'=>'views/melons/cantaloupe/images/view_tag.gif'),
	'meta' => array('name'=>'Metadata','description'=>'<b>Displays all metadata for the page.</b> The Metadata layout displays a table containing all of the metadata for the page, including all of its prior versions.','image'=>'views/melons/cantaloupe/images/view_metadata.gif'),
	'edit' => '',
	'annotation_editor' => '',
	'versions' => '',
	'history' => ''
);
// Optional media views array; if not empty, will overwrite the views array when page type is scalar:Media
// It's important to keep some functional views present, such as 'plain', 'edit', and 'versions', otherwise these will become unavailable
$config['media_views'] = array(
	'plain' => array('name'=>'Basic','description'=>'<b>Shows the media file on its own.</b> In the Basic layout, the media file is presented as a standalone object.','image'=>'views/melons/cantaloupe/images/view_media.gif'),
	'meta' => array('name'=>'Metadata','description'=>'<b>Displays all metadata for the media file.</b> The Metadata layout displays the media file at the top with all of its metadata in a table below.','image'=>'views/melons/cantaloupe/images/view_media_metadata.gif'),
	'edit' => '',
	'annotation_editor' => '',
	'versions' => '',
	'history' => ''
);

// Default view
$config['default_view'] = 'plain';

// By default, HTML5-RDFa 'sioc:content' won't be outputted for relationship nodes (nodes other than the current page node)
// Possible values: true | false | array('<rel name, e.g., "replies","reply","references","reference",etc>')
$config['output_rel_node_content'] = array('replies','references');

// Media reference options (will translate to, e.g., data-property="value")
$config['reference_options'] = array(
	'insertMediaLink' 		=> array(
								'size' => array('small', 'medium', 'large', 'native', 'full'),
								'align' => array('right', 'left'),
								'caption' => array('description', 'title', 'title-and-description', 'none')
						 		),
	'insertMediaelement' 	=> array(
								'size' => array('small', 'medium', 'large', 'native', 'full'),
								'align' => array('left', 'center', 'right'),
								'caption' => array('description', 'title', 'title-and-description', 'none')
						    	),
	'insertAnnotation' 		=> array(
								'size' => array('small', 'medium', 'large', 'native', 'full'),
								'align' => array('right', 'left'),
								'caption' => array('description', 'title', 'title-and-description', 'none')
						  		),
	'insertInlineAnnotation'=> array(
								'size' => array('small', 'medium', 'large', 'native',  'full'),
								'align' => array('left', 'center', 'right'),
								'caption' => array('description', 'title', 'title-and-description', 'none')
							    ),
	'insertNote' 			=> array(),
	'createInternalLink' 	=> array()
);

$config['predefined_css'] = array(
	array(
		'title'=>'Keep linked media with their source paragraphs',
		'description'=>'Text wraps around linked media by default, which can sometimes result in media being positioned far away from the text that references it. This CSS adds extra space to the page to make sure that linked media are aligned with the top of the paragraphs that reference them.',
		'insert'=>".clearboth { clear: both; }\n"
	),
	array(
		'title'=>'Show path contents in sidebar',
		'description'=>'By default, the contents of the current path are displayed at the bottom of the page. This CSS (which is only recommended for pages that don\'t include media) places the path contents in a second column to the right of the page content.',
		'insert'=>"@media screen and (min-width: 768px) {\n.primary_role_path span[property=\"sioc:content\"] {width:50%; float:left; clear:none;}\n.primary_role_path span[property=\"sioc:content\"] .body_copy {padding-right:0px;}\n.primary_role_path article .relationships {width:50%; float:right; clear:none !important; padding-top:0px !important;}\n.primary_role_path article .relationships a.nav_btn {display:none;} /* Hides path navigation buttons */ }\n"
	)
);
