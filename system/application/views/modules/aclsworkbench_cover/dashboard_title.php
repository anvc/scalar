<?php
	if (!defined('BASEPATH')){exit('No direct script access allowed');}
	
	// Title
	if (isset($cover_title) && !empty($cover_title)){
		//Non-invasive method for rewriting the 
		if($cover_title == lang('install_name')){
			$cover_title = lang('acls.site_header');
		}
		echo '<h1 class="title dashboard_title">',(defined('ACLSWORKBENCH_METHOD') && ACLSWORKBENCH_METHOD!='home'?'<a title="Return to ACLS Workbench home page" href="'.base_url().'"><img src="'.ACLSWORKBENCH_ICON_URL.'" class="header_icon" id="icon"></a>':''),$cover_title,'</h1>',PHP_EOL;
	}
?>
