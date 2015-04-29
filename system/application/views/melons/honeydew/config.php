<?php

// Arbor (wrapper) to use, e.g., 'html5_RDFa'
$config['arbor'] = 'html';

// Melon metadata
$config['melon_meta'] = array(
    'is_selectable' => true,
	'slug'=>'honeydew',
	'name'=>'Scalar 1.0',
	'description'=>'The original Scalar interface.',
	'thumb_app_path'=>'views/melons/honeydew/images/scalar_honeydew_thumb.png'
);

// Stylesheets
$config['stylesheets'] = array(
	array('slug'=>'minimal','name'=>'Minimal','description'=>'','thumb_app_path'=>'views/modules/dashboard/honeydew/theme_minimal.jpg'),
	array('slug'=>'denim','name'=>'Denim','description'=>'','thumb_app_path'=>'views/modules/dashboard/honeydew/theme_denim.jpg'),
	array('slug'=>'slate','name'=>'Slate','description'=>'','thumb_app_path'=>'views/modules/dashboard/honeydew/theme_slate.jpg'),
	array('slug'=>'linen','name'=>'Linen','description'=>'','thumb_app_path'=>'views/modules/dashboard/honeydew/theme_linen.jpg'),
	array('slug'=>'gloss','name'=>'Gloss','description'=>'','thumb_app_path'=>'views/modules/dashboard/honeydew/theme_gloss.jpg'),
	array('slug'=>'fathom','name'=>'Fathom','description'=>'','thumb_app_path'=>'views/modules/dashboard/honeydew/theme_fathom.jpg'),
	array('slug'=>'shale','name'=>'Shale','description'=>'','thumb_app_path'=>'views/modules/dashboard/honeydew/theme_shale.jpg')
);

// Array of views; leave a key value empty and it won't be displayed as a default view option in the editor
$config['views'] = array(
	'plain' => 'Single column',
	'text' => 'Text emphasis',
	'media' => 'Media emphasis',
	'split' => 'Split emphasis',
	'par' => 'Media per paragraph (above)',
	'revpar' => 'Media per paragraph (below)',
	'vis' => 'Visualization: Radial',
	'visindex' => 'Visualization: Index',
	'vispath' => 'Visualization: Paths',
	'vismedia' => 'Visualization: Media',
	'vistag' => 'Visualization: Tags',
	'versions' => 'History',
	'history' => 'History browser',
	'meta' => 'Metadata',
	'edit' => '',
	'annotation_editor' => ''
);

// Default view
$config['default_view'] = 'plain';

// Media reference options (will translate to, e.g., data-property="value")
$config['reference_options'] = array(
	'insertMediaLink' 		=> array( 'display-content-preview-box' => array('true', 'false') ),
	'insertMediaelement' 	=> array(),
	'insertAnnotation' 		=> array( 'display-content-preview-box' => array('true', 'false') ),
	'insertInlineAnnotation'=> array(),
	'insertNote' 			=> array( 'display-content-preview-box' => array('true', 'false') ),
	'createInternalLink' 	=> array( 'display-content-preview-box' => array('true', 'false') )
);
