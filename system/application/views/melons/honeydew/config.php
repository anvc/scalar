<?php

// Arbor (wrapper) to use, e.g., 'html5_RDFa'
$config['arbor'] = 'html';

// Array of views; leave value empty and it won't be displayed as a default view option in the editor
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
			'display-content-preview-box' => array('true', 'false')
		);