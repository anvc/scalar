<?
$this->template->add_js(path_from_file(__FILE__).'scalarview.js');
?>
<script type="text/javascript">
		
$(document).ready(function() {

	scalarview.init();

	// if we're on a Scalar page, this will return info about it
	var scalarInfo = scalarview.scalarInfoFromURL(document.location.href, $('link#parent').attr('href'));
	console.log(scalarInfo);

	if (scalarInfo != null) {
				
		// use the Scalar page info to set up the view
		scalarview.viewType = 'standardView';
		scalarview.setBook('http://<?=$_SERVER['SERVER_NAME']?>/'+scalarInfo.instance+'/'+scalarInfo.book+'/');
		scalarview.setPage(scalarInfo.page);
					
	// otherwise, we're not on a Scalar page; look for anchor vars that specify the
	// Scalar install, book, and page
	} else {
				
		var anchorVars = scalarapi.getAnchorVars(document.URL);
					
		// if we find them, then load the page specified
		var singlePageFlag = false;
		if (anchorVars != null) {
			if ((anchorVars.instance != undefined) && (anchorVars.book != undefined)) {
				singlePageFlag = true;
				scalarview.viewType = 'standardView';
				scalarview.setBook('http://scalar.usc.edu/'+anchorVars.instance+'/'+anchorVars.book+'/');
				if (anchorVars.page != undefined) {
					scalarview.setPage(anchorVars.page);
				} else {
					scalarview.setPage('index');
				}
			}
		}
					
		// otherwise, show dialog to let user choose a book
		if (!singlePageFlag) {
			scalarview.showBookDialog();
		}
	}

});
			
</script>