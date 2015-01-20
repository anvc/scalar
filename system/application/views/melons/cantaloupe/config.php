<?php

// Arbor (wrapper) to use, e.g., 'html5_RDFa'
$config['arbor'] = 'html5_RDFa';

// Melon metadata
$config['melon_meta'] = array(
    'is_selectable' => true,
	'slug'=>'cantaloupe',
	'name'=>'Scalar 2.0',
	'description'=>'Evolutionary Scalar interface optimized for desktop, tablet, and mobile',
	'thumb_app_path'=>'views/melons/honeydew/images/generic_media_thumb.jpg'
);

// Stylesheets
$config['stylesheets'] = array();

// Array of views; leave key value empty and it won't be displayed as a default view option in the editor
$config['views'] = array(
	'plain' => array(
		'name' => '',
		'components' => array(
			'size' => array(
				'name' => 'Page size',
				'multi' => false,
				'views' => array(
					'standard' => array(
						'name' => 'Standard',
						'description' => 'Standard page size'
					),
					'full' => array(
						'name' => 'Full width',
						'description' => 'Full width page size, useful for embedded objects'
					)
				)
			),
			'textheader' => array(
				'name' => 'Text header',
				'multi' => true,
				'views' => array(
					'title' => array(
						'name' => 'Title',
						'description' => 'Display the page title'
					),
					'' => array(
						'name' => 'None',
						'description' => ''
					),					
					'desc' => array(
						'name' => 'Description',
						'description' => 'Display the page description'
					),
					'mainmenu' => array(
						'name' => 'Main menu',
						'description' => 'Display the book main menu'
					),									
				)
			),
			'visheader' => array(
				'name' => 'Visual header',
				'multi' => false,
				'views' => array(
					'' => array(
						'name' => 'None',
						'description' => ''
					),	
					'google_maps' => array(
						'name' => 'Map',
						'description' => 'Display an Google Map in the header plotting current coordinates'
					),	
					'image_header' => array(
						'name' => 'Image',
						'description' => 'Display the background image in the header'
					),	
					'gallery' => array(
						'name' => 'Image gallery',
						'description' => 'Displayed embedded images in a gallery'
					),
					'structured_gallery' => array(
						'name' => 'Structured gallery',
						'description' => 'Display thumbnails of all media related to this page'
					),
					'carousel' => array(
						'name' => 'Carousel',
						'description' => 'Display embedded images in a carousel'	
					),	
					'coverflow' => array(
						'name' => 'Coverflow',
						'description' => 'Display embedded images in a coverflow'	
					),													
				)
			),
			'body' => array(
				'name' => 'Body',
				'multi' => true,
				'views' => array(
					'contentmedia' => array(
						'name' => 'Content + media',
						'description' => 'Content area includes text content and attached media'
					),				
					'' => array(
						'name' => 'None',
						'description' => ''
					),	
					'content' => array(
						'name' => 'Content',
						'description' => 'Content area includes text content'	
					),	
					'iframe' => array(
						'name' => 'IFrame',
						'description' => 'Content area optimized to display an embedded IFrame'	
					),	
					'splash' => array(
						'name' => 'Splash',
						'description' => 'Display a splash page for this section'
					),
					'book_splash' => array(
						'name' => 'Book splash',
						'description' => 'Display a splash page for this book'
					),
					'vistag' => array(
						'name' => 'Tag visualization',
						'description' => 'Content area displays the tag visualization'	
					),	
					'visradial' => array(
						'name' => 'Radial visualization',
						'description' => 'Content area displays the radial visualization'	
					),	
					'visindex' => array(
						'name' => 'Index visualization',
						'description' => 'Content area displays the index visualization'
					),		
					'vispath' => array(
						'name' => 'Path visualization',
						'description' => 'Content area displays the path visualization'	
					),	
					'vismedia' => array(
						'name' => 'Media visualization',
						'description' => 'Content area displays the media visualization'
					),																								
				)
			),	
			'footer' => array(
				'name' => 'Footer',
				'multi' => false,
				'views' => array(
					'metadata_footer' => array(
						'name' => 'Additional metadata',
						'description' => 'Footer displays page metadata'
					),			
					'' => array(
						'name' => 'None',
						'description' => ''	
					),
					'tags_footer' => array(
						'name' => 'Tag list',
						'description' => 'Footer displays list of tags'	
					),
					'path_footer' => array(
						'name' => 'Path options',
						'description' => 'Footer displays current path navigation'	
					),		
					'pathtags_footer' => array(
						'name' => 'Tag list + path options',
						'description' => 'Footer displays tags and path navigation'	
					),												
				)
			),
			'nav' => array(
				'name' => 'Nav bar',
				'multi' => false,
				'views' => array(
					'page_nav' => array(
						'name' => 'Current page info',
						'description' => 'Displays the current page info in the sidebar nav'
					)
				)
			)
		)
	),
	'edit' => '',
	'annotation_editor' => ''
);

// Default view
$config['default_view'] = 'plain';

// Media reference options (will translate to, e.g., data-property="value")
$config['reference_options'] = array(
	'insertMediaLink' 		=> array( 
								'size' => array('small', 'medium', 'large', 'full'),
								'align' => array('right', 'left'),
								'caption' => array('description', 'title', 'title-and-description', 'none')
						 		),
	'insertMediaelement' 	=> array( 
								'size' => array('small', 'medium', 'large', 'full'),
								'align' => array('left', 'center', 'right'),
								'caption' => array('description', 'title', 'title-and-description', 'none')
						    	),
	'insertAnnotation' 		=> array( 
								'size' => array('small', 'medium', 'large', 'full'),
								'align' => array('right', 'left'),
								'caption' => array('description', 'title', 'title-and-description', 'none')
						  		),
	'insertInlineAnnotation'=> array( 
								'size' => array('small', 'medium', 'large', 'full'),
								'align' => array('left', 'center', 'right'),
								'caption' => array('description', 'title', 'title-and-description', 'none')
							    ),
	'insertNote' 			=> array(),
	'createInternalLink' 	=> array()							   							   							   							   							   
);	

// Available visualization methods
$config['available_visualizations'] = array(
	'pinwheel',
	'sidebar'
);

// Default visualization method
$config['visualization'] = 'pinwheel'; 
