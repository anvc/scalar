<?
$this->template->add_css(path_from_file(__FILE__).'import.css');
$this->template->add_js(path_from_file(__FILE__).'import.js');
$this->template->add_js(path_from_file(__FILE__).'../../../widgets/ddSlick/jquery.ddslick.min.js');
?>
<script>
$(document).ready(function() {
	$.ajax({
		type:"GET",
		url:systemURI()+'/rdf?format=json',
		dataType:"jsonp",
		success:systemSuccess,
		error:systemError
	});
});
function systemURI() {
	return $('.search_archive_form').find('input[name="system_uri"]').val();
}
function parentURI() {
	var uri = $('link#parent').attr('href');
	if (uri.substr((uri.length-1),1) == '/') uri = uri.substr(0,(uri.length-1));
	return uri;
}
function bookURIMediaAppend() {
	return '/rdf/instancesof/media';
}
function systemSuccess(data) {
	var book_uris = data[systemURI()]['http://purl.org/dc/terms/hasPart'];
	var ddData = [];
	if (book_uris && book_uris.length) {
		for (var j = 0; j < book_uris.length; j++) {
			var book_uri = book_uris[j].value;
			if (book_uri == parentURI()) continue;
			var title = data[book_uri]['http://purl.org/dc/terms/title'][0].value;
			var thumb = ('undefined'==typeof(data[book_uri]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'])) ? null : data[book_uri]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'][0].value;
			if (!thumb||'undefined'==typeof(thumb)||!thumb.length) thumb = $('#approot').attr('href')+'views/melons/honeydew/images/generic_media_thumb.jpg';
			var ddDataNode = {};
			ddDataNode.text = title;
			ddDataNode.value = book_uri+bookURIMediaAppend();
			ddDataNode.selected = false;
			ddDataNode.description = book_uri;
			ddDataNode.imageSrc = thumb;
			ddData.push(ddDataNode);
		}
		$('#ddSlick-htmlselect').ddslick({
			data: ddData,
			height:'300px',
		    selectText: "<div class=\"dd-first-selected\">Please select a book to search</div>",
		});
	} else {
		$('#ddSlick-htmlselect').replaceWith('<div>There are no public books on this install</div>');
	}
}
function systemError() {
	alert('There was an error attempting to load books');
}
function search_archive() {

	var selected_index = $('#ddSlick-htmlselect').data('ddslick').selectedIndex;
	if (-1==selected_index) {
		alert('Please select a book');
		return false;
	}

	var the_form = $('.search_archive_form:first').get(0);
	var proxy = the_form.proxy.value;
	var uri = $('#ddSlick-htmlselect').data('ddslick').selectedData.value;
	var xsl = the_form.xsl.value;
	var sq = jQuery.trim(the_form.sq.value);

	// Validate
	if (sq.length==0) {
		if (!confirm('Without a search term, all media from the selected book will be accessed.  Do you wish to continue?')) return false;
	}

	// Enter the query
	uri = uri+((-1==uri.indexOf('?')) ? '?' : '&')+'sq='+encodeURIComponent(sq);

	// Show loading bar
	$('.search_archive_form_wrapper:first').find('.search_results_title:first').show();

	// Run request
	var the_request = proxy+'?xsl='+encodeURIComponent(xsl)+'&uri='+encodeURIComponent(uri);

	$.ajax({
	  url: the_request,
	  type: 'GET',
	  dataType: "xml",
	  success: function(xml) {
	  	var result;
		// Fork to either jQuery-based XML processing or Javascript-based.  Kludgy but works in FF, Safari, IE, Opera.
		if ($(xml).find('rdf\\:Description').length) {
			result = import_parse_xml_with_jquery(xml, sq, 1, false, uri, null);      // Firefox, IE
		} else {
			result = import_parse_xml_with_javascript(xml, sq, 1, false, uri, null);  // Safari
		}
		return result;
	  }
	});

	return false;

}
</script>

<h4 class="content_title">Import from another Scalar book</h4>

<div class="search_archive_form_wrapper" id="external">

	<form action="" class="search_archive_form" method="get" onsubmit="return search_archive();">
		<!-- Fields used for proxy search -->
		<input type="hidden" name="proxy" value="<?=confirm_slash($app_root)?>rdf/proxy.php" />
		<input type="hidden" name="system_uri" value="<?=rtrim(base_url(),'/')?>" />
		<input type="hidden" name="xsl" value="<?=confirm_slash($app_root)?>rdf/xsl/system.xsl" />
		<select id="ddSlick-htmlselect" name="uri"></select>&nbsp;
		<input type="text" name="sq" class="input_search_query generic_input large" value="" />&nbsp;
		<input type="submit" value="Search" class="input_search_submit generic_button large" />
		<br clear="both" /><br />
		<!-- Fields used for ADD -->
		<input type="hidden" name="action" value="add" />
		<input type="hidden" name="native" value="1" />
		<input type="hidden" name="scalar:urn" value="" />
		<input type="hidden" name="id" value="<?=@$login->email?>" />
		<input type="hidden" name="api_key" value="" />
		<input type="hidden" name="rdf:type" value="http://scalar.usc.edu/2012/01/scalar-ns#Media" />
		<input type="hidden" name="scalar:child_urn" value="<?=$book->urn?>" />
		<input type="hidden" name="scalar:child_type" value="http://scalar.usc.edu/2012/01/scalar-ns#Book" />
		<input type="hidden" name="scalar:child_rel" value="page" />
		<input type="hidden" name="sioc:content" value="" />
	</form>

	<p class="search_results_title"><img src="<?=confirm_slash($app_root)?>views/melons/honeydew/images/loading.gif" height="16" align="absmiddle" />&nbsp; Searching the archive (may take a moment)</p>
	<div class="search_results_header"></div>

	<div class="search_results_wrapper">
	<table class="search_archive_results" cellspacing="0" cellpadding="0"><tbody></tbody></table>
	</div>

	<div class="search_results_footer"><a class="generic_button large default" href="javascript:;" onclick="search_archive_import();">Import selected media</a></div>

	<br clear="both" />

</div>
