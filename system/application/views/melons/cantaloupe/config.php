<?php

// Arbor (wrapper) to use, e.g., 'html5_RDFa'
$config['arbor'] = 'html5_RDFa';

// Melon metadata
$config['melon_meta'] = array(
	'is_selectable' => false,
	'slug'=>'cantaloupe',
	'name'=>'Scalar 2.0',
	'description'=>'Evolutionary Scalar interface optimized for desktop, tablet, and mobile',
	'thumb_app_path'=>'views/melons/honeydew/images/generic_media_thumb.jpg'
);

// Stylesheets
$config['stylesheets'] = array();

// Array of views; leave value empty and it won't be displayed as a default view option in the editor
// Image paths are relative to Scalar's application folder
$config['views'] = array(
	'plain' => array('name'=>'Basic','description'=>'<b>Freely mix text and media.</b> In the Basic view, the page\'s text and media are interspersed. You can set the size and placement of linked media as they are added to the page.','image'=>'views/melons/honeydew/images/view_basic.gif'),
	'image_header' => array('name'=>'Image Header','description'=>'<b>Add a large image at the top.</b> In the Image Header view, the page\'s background image is shown as a header, with the title and description of the page overlaid. The rest of the page follows the Basic layout, with text and media interspersed.','image'=>'views/melons/honeydew/images/view_image_header.gif'),
	'splash' => array('name'=>'Splash','description'=>'<b>Show a full screen cover for a section.</b> In the Splash view, the page\'s background image is shown full screen, with the page\'s title at the bottom. If the page is part of a path or is itself a path, a navigation button is shown as well.','image'=>'views/melons/honeydew/images/view_splash.gif'),
	'book_splash' => array('name'=>'Book Splash','description'=>'<b>Show a full screen cover for your book.</b> In the Book Splash layout, the page\'s background image (either its own, or one inherited from its parent) is shown full screen, with the book\'s title and author(s) at the bottom. If the page is part of a path or is itself a path, a navigation button is shown as well.','image'=>'views/melons/honeydew/images/view_book_splash.gif'),
	'gallery' => array('name'=>'Media Gallery','description'=>'<b>Embed all the related media.</b> In the Media Gallery view, media contained or tagged by the page are embedded at full width into a vertically scrolling gallery.','image'=>'views/melons/honeydew/images/view_gallery.gif'),
	'structured_gallery' => array('name'=>'Structured Media Gallery','description'=>'<b>Show thumbnail galleries for all the media related to this page and its children.</b> In the Structured Media Gallery view, media contained, tagged, or linked up to two levels deep are grouped into titled galleries of thumbnails which reveal the media in a larger view when clicked. The description for each path and tag is included just above its gallery.','image'=>'views/melons/honeydew/images/view_structured_gallery.gif'),
	'google_maps' => array('name'=>'Google Map','description'=>'<b>Add a map at the top.</b> The Google Map view plots the current page plus any content it contains or tags on a Google Map embedded at the top of the page. Every piece of content to be plotted must include <i>dcterms:spatial</i> metadata (added using the \'Metadata\' section below) in the format <i>decimal latitude,decimal longitude</i>. Each pin shown on the map will reveal the title, description, and link for its content when clicked. The rest of the page follows the Basic layout, with text and media interspersed.','image'=>'views/melons/honeydew/images/view_google_map.gif'),
	'iframe' => array('name'=>'IFrame','description'=>'<b>Embed a third party component.</b> Many third party tools allow their content to be embedded using iframe code which can be pasted into your Scalar page. The iframe view makes this content more immersive by removing the page\'s title and margins so that setting the iframe\'s width to 100% will cause it to fill all of the available horizontal space on the page.','image'=>'views/melons/honeydew/images/view_iframe.gif'),
	'visindex' => array('name'=>'Grid','description'=>'<b>Visualize all content by type.</b> The Grid view embeds a visualization at the top of the page that shows content as boxes in a grid. Colored lines are drawn representing connections between the current page and its related content. The rest of the page follows the Basic layout, with text and media interspersed.','image'=>'views/melons/honeydew/images/view_grid.gif'),
	'visradial' => array('name'=>'Radial','description'=>'<b>Visualize all related content.</b> The Radial view embeds a circular visualization at the top of the page that shows connections between content. Colored arcs are drawn representing connections between the current page and its related content, set against the backdrop of all of the other connections in the work. The rest of the page follows the Basic layout, with text and media interspersed.','image'=>'views/melons/honeydew/images/view_radial.gif'),
	'vispath' => array('name'=>'Path','description'=>'<b>Visualize and navigate the current path.</b> The Path view embeds a visualization at the top of the page that shows the path contents of the current page in a tree diagram. The reader can expand sub-paths of the tree to explore its contents. The rest of the page follows the Basic layout, with text and media interspersed.','image'=>'views/melons/honeydew/images/view_path.gif'),
	'vismedia' => array('name'=>'Media','description'=>'<b>Visualize and navigate this page’s media.</b> The Media view embeds a force-directed visualization at the top of the page that shows the media it references or annotates. The rest of the page follows the Basic layout, with text and media interspersed.','image'=>'views/melons/honeydew/images/view_tag.gif'),
	'vistag' => array('name'=>'Tag','description'=>'<b>Visualize and navigate content tagged by this page.</b> The Tag view embeds a force-directed visualization at the top of the page that shows the content it tags. The rest of the page follows the Basic layout, with text and media interspersed.','image'=>'views/melons/honeydew/images/view_tag.gif'),
	'edit' => '',
	'annotation_editor' => '',
	'versions' => '',
	'meta' => array('name'=>'Metadata','description'=>'<b>Display all metadata for the page.</b> The Metadata view displays a table containing all of the metadata for the page, including all of its prior versions.','image'=>'views/melons/honeydew/images/view_metadata.gif'),
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
