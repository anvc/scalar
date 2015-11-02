<?php
/**
 * @projectDescription	Archive List config for Workbench
*/

$config['archives'] = array();

$config['archives'][] = array(
	'title'   		=> 'USC Digital Library',
	'subtitle'		=> 'USC Libraries Digital Collections',
	'categories' 	=> array('audio', 'video', 'image','contentdm','other'),
	'thumbnail'		=> 'views/images/archives/uscdigitallibrary.thumb.png',
	'request'		=> array(
		'handler'		=> 'http',
		'parser'  		=> "contentdm-icons",
		'source'		=> "http://digitallibrary.usc.edu/cdm/search/searchterm/%1/field/all/mode/all/conn/and/order/nosort/page/%2/display/50",
		'content_type'	=> "xml"
	)
);
$config['archives'][] = array(
	'title'   		=> 'Iowa Digital Library',
	'subtitle'		=> 'The Iowa Digital Library features more than a million digital objects created from the holdings of the University of Iowa Libraries and its campus partners. Included are illuminated manuscripts, historic maps, fine art, historic newspapers, scholarly works, and more. Digital collections are coordinated by Digital Research & Publishing.',
	'categories' 	=> array('audio', 'video', 'image','contentdm','other'),
	'thumbnail'		=> 'views/images/archives/iowadigitallibrary.thumb.png',
	'request'		=> array(
		'handler'		=> 'http',
		'parser'  		=> "contentdm-icons",
		'source'        => "http://digital.lib.uiowa.edu/cdm/search/searchterm/%1/mode/all/page/%2",
		'content_type'	=> "xml"
	)
);
$config['archives'][] = array(
	'title'   		=> 'University of Washington Digital Collections',
	'subtitle'		=> 'This site features materials such as photographs, maps, newspapers, posters, reports and other media from the University of Washington Libraries, University of Washington Faculty and Departments, and organizations that have participated in partner projects with the UW Libraries. The collections emphasize rare and unique materials.',
	'categories' 	=> array('audio', 'video', 'image','contentdm','other'),
	'thumbnail'		=> 'views/images/archives/washingtondigitalcollections.thumb.png',
	'request'		=> array(
		'handler'		=> 'http',
		'parser'  		=> "contentdm-icons",
		'source'		=> "http://digitalcollections.lib.washington.edu/cdm/search/searchterm/%1/mode/all/order/title/page/%2",
		'content_type'	=> "xml"
	)
);
$config['archives'][] = array(
	'title'   		=> 'University of Victoria Digital Collections',
	'subtitle'		=> 'The University of Victoria Libraries support a variety of digital initiatives to promote wider access to our unique UVic collections.',
	'categories' 	=> array('audio', 'video', 'image','contentdm','other'),
	'thumbnail'		=> 'views/images/archives/uvicdigitalcollections.thumb.png',
	'request'		=> array(
		'handler'		=> 'http',
		'parser'  		=> "contentdm-table",
		'source'		=> "http://contentdm.library.uvic.ca/cdm/search/searchterm/%1/field/all/mode/all/conn/and/order/nosort/page/%2/display/50",
		'content_type'	=> "xml"
	)
);
$config['archives'][] = array(
	'title'   		=> 'Claremont Colleges Digital Library',
	'subtitle'		=> 'The Claremont Colleges Digital Library (CCDL) provides access to historical and visual resources collections created both by and for The Claremont Colleges community.',
	'categories' 	=> array('audio', 'video', 'image','contentdm','other'),
	'thumbnail'		=> 'views/images/archives/ccdl.thumb.png',
	'request'		=> array(
		'handler'		=> 'http',
		'parser'  		=> "contentdm-table",
		'source' 		=> "http://ccdl.libraries.claremont.edu/cdm/search/searchterm/%1/field/all/mode/all/conn/and/order/nosort/page/%2/display/50",
		'content_type'	=> "xml"
	)
);
$config['archives'][] = array(
	'title'   		=> 'Huntington Digital Library',
	'subtitle'		=> 'The Huntington History collection is an artificial collection of photographs and text that deal with Henry Edwards Huntington, his family, and The Huntington as an institution.',
	'categories' 	=> array('audio', 'video', 'image','contentdm','other'),
	'thumbnail'		=> 'views/images/archives/huntington.thumb.png',
	'request'		=> array(
		'handler'		=> 'http',
		'parser'  		=> "contentdm-table",
		'source'		=> "http://hdl.huntington.org/cdm/search/searchterm/%1/field/all/mode/all/conn/and/order/nosort/page/%2/display/50",
		'content_type'	=> "xml"
	)
);
/*
$config['archives'][] = array(
	'title'   		=> 'UBC Library Digital Collections',
	'subtitle'		=> 'UBC Library Digital Collections represents many of the locally-created digital collections developed and maintained by the University of British Columbia Library. Collectively they document a diverse range of people and places, activities and events, and serve as a resource for students, historians, genealogists, and other researchers.',
	'categories' 	=> array('audio', 'video', 'image','contentdm','other'),
	'thumbnail'		=> 'views/images/archives/ubc.thumb.png',
	'request'		=> array(
		'handler'		=> 'http',
		'parser'  		=> "contentdm-table",
		'source'		=> "http://digitalcollections.library.ubc.ca/cdm/search/searchterm/%1/field/all/mode/all/conn/and/order/nosort/page/%2/display/50",
		'content_type'	=> "xml"
	)
);
*/
$config['archives'][] = array(
	'title'   		=> 'Critical Commons',
	'subtitle'		=> 'For Fair &amp; Critical Participation in Media Culture',
	'categories' 	=> array('affiliated', 'video', 'image'),
	'thumbnail'		=> 'views/images/archives/criticalcommons.thumb.png',
	'request'		=> array(
		'handler'		=> 'http',
		'parser'  		=> "critical_commons",
		'source'  		=> "http://criticalcommons.org/cc/playlist?SearchableText=%1",
		'content_type'	=> "xml"
	)
);
$config['archives'][] = array(
	'title'   		=> 'YouTube',
	'subtitle'		=> 'Hosts user-generated videos. Includes network and professional content.',
	'categories' 	=> array('video','other'),
	'thumbnail'		=> 'views/images/archives/youtube.thumb.png',
	'request'		=> array(
		'handler'		=> 'https',
		'parser'  		=> "youtube",
		'source'  		=> "https://www.googleapis.com/youtube/v3/search?part=snippet&q=%1&maxResults=50&type=video&key=AIzaSyAI9koLGtnZpygU7nMuHVT7xJbwUU-sQBw",
		'content_type' 	=> "json"
	)
);
$config['archives'][] = array(
	'title'   		=> 'Vimeo',
	'subtitle'		=> 'Upload, store, share and manage HD videos. ',
	'categories' 	=> array('video','other'),
	'thumbnail'		=> 'views/images/archives/vimeo.thumb.png',
	'request'		=> array(
		'handler'		=> 'vimeo',
		'parser'  		=> "vimeo",
		'source'  		=> "http://vimeo.com",
		'content_type' 	=> "json"
	)
);
$config['archives'][] = array(
	'title'   		=> 'Internet Archive',
	'subtitle'		=> 'The Internet Archive is a non-profit digital library with the stated mission: "universal access to all knowledge." It offers permanent storage and access to collections of digitized materials, including websites, music, moving images, and books. The Internet Archive was founded by Brewster Kahle in 1996. (Wikipedia)',
	'categories' 	=> array('video','image','audio','affiliated'),
	'thumbnail'		=> 'views/images/archives/internetarchive.thumb.png',
	'request'		=> array(
		'handler'		=> 'http',
		'parser'  		=> "internetarchive",
		'source'  		=> "http://archive.org/advancedsearch.php?q=%1&fl[]=avg_rating&fl[]=call_number&fl[]=collection&fl[]=contributor&fl[]=coverage&fl[]=creator&fl[]=date&fl[]=description&fl[]=downloads&fl[]=foldoutcount&fl[]=format&fl[]=headerImage&fl[]=identifier&fl[]=imagecount&fl[]=language&fl[]=licenseurl&fl[]=mediatype&fl[]=month&fl[]=num_reviews&fl[]=oai_updatedate&fl[]=publicdate&fl[]=publisher&fl[]=rights&fl[]=scanningcentre&fl[]=source&fl[]=subject&fl[]=title&fl[]=type&fl[]=volume&fl[]=week&fl[]=year&sort[]=&sort[]=&sort[]=&rows=50&page=%2&callback=callback&output=xml#raw",
		'content_type' 	=> "xml"
	)
);