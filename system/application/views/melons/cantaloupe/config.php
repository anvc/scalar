<?php

// Arbor (wrapper) to use, e.g., 'html5_RDFa'
$config['arbor'] = 'html5_RDFa';

// Array of views; leave value empty and it won't be displayed as a default view option in the editor
$config['views'] = array(
			'plain' => array('name'=>'Basic','description'=>'This page\'s text and media interspersed','image'=>''),
			'image_header' => array('name'=>'Image Header','description'=>'This page\'s background image shown as a header','image'=>''),
			'splash' => array('name'=>'Splash','description'=>'This page\'s background image shown full screen w/ title at the bottom','image'=>''),
			'book_splash' => array('name'=>'Book Splash','description'=>'This page\'s background image shown full screen w/ book title and author at the bottom','image'=>''),
			'gallery' => array('name'=>'Media Gallery','description'=>'Media contained or tagged by this page shown in a gallery','image'=>''),
			'structured_gallery' => array('name'=>'Structured Media Gallery','description'=>'Media contained or tagged up to two levels deep shown in an indexed gallery','image'=>''),
			'iframe' => array('name'=>'IFrame','description'=>'Page title hidden, content displayed at full width, ideal taking over a view with iframe content','image'=>''),
			'google_maps' => array('name'=>'Google Map','description'=>'Plots any page with "spatial" metadata, along with its path/tag contents','image'=>''),
			'edit' => '',
			'annotation_editor' => ''
		);

// Default view
$config['default_view'] = 'plain';

// Media reference options (will translate to, e.g., data-property="value")
$config['reference_options'] = array(
			'size' => array('small', 'medium', 'large', 'full'),
			'align' => array('right', 'left'),
			'caption' => array('description', 'title', 'title-and-description', 'none'),
			/*'autoplay' => array('false', 'true'),
			'display-content-preview-box' => array('true', 'false')*/
		);

//Available Visualization Methods
$config['available_visualizations'] = array(
	'pinwheel',
	'sidebar'
);

//Cantaloupe Visualization Method - Default: 'pinwheel'
$config['visualization'] = 'pinwheel'; //Can also be "sidebar" for new vis