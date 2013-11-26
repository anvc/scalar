<?php

// Arbor (wrapper) to use, e.g., 'html5_RDFa'
$config['arbor'] = 'html5_RDFa';

// Array of views that can be set as the default view
$config['views'] = array(
			'plain',
			'image_header',
			'splash',
			'book_splash',
			'gallery',
			'structured_gallery',
			'edit'
		);

// Default view
$config['default_view'] = 'plain';

// Media reference options (will translate to, e.g., data-property="value")
$config['reference_options'] = array(
			'size' => array('small', 'medium', 'large', 'full'),
			'align' => array('right', 'left'),
			/*'caption' => array("title", "description", "titledesc", "none"),
			'chrome' => array('true', 'false'),
			'autoplay' => array('false', 'true')*/
		);
