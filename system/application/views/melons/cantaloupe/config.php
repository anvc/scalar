<?php

// Arbor (wrapper) to use, e.g., 'html5_RDFa'
$config['arbor'] = 'html5_RDFa';

// Array of views; leave value empty and it won't be displayed as a default view option in the editor
$config['views'] = array(
			'plain' => 'Basic (This page\'s text and media interspersed)',
			'image_header' => 'Image Header (This page\'s background image shown as a header)',
			'splash' => 'Splash (This page\'s background image shown full screen w/ title at the bottom)',
			'book_splash' => 'Book Splash (This page\'s background image shown full screen w/ book title and author at the bottom)',
			'gallery' => 'Media Gallery (Media contained or tagged by this page shown in a gallery)',
			'structured_gallery' => 'Structured Media Gallery (Media contained or tagged up to two levels deep shown in an indexed gallery)',
			'edit' => ''
		);

// Default view
$config['default_view'] = 'plain';

// Media reference options (will translate to, e.g., data-property="value")
$config['reference_options'] = array(
			'size' => array('small', 'medium', 'large', 'full'),
			'align' => array('right', 'left'),
			/*'caption' => array("title", "description", "titledesc", "none"),
			'chrome' => array('true', 'false'),
			'autoplay' => array('false', 'true'),
			'display-content-preview-box' => array('true', 'false')*/
		);
