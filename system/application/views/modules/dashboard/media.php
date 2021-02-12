<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_js('system/application/views/widgets/tablesorter/jquery.tablesorter.min.js')?>
<?$this->template->add_css('system/application/views/widgets/tablesorter/style.css')?>
<?$this->template->add_js('system/application/views/widgets/api/scalarapi.js')?>
<?$this->template->add_js('system/application/views/modules/dashboard/jquery.dashboardtable.js')?>
<?
	if (empty($book)):
		echo 'Please select a book to manage using the pulldown menu above';
	else:
?>

	<div id="slug-change-confirm" title="URI change">
	Changing the media page's URI will change its location on the web, which will make its old URL unavailable. Do you wish to continue?
	</div>

	<script>

		var book_uri = '<?=addslashes(confirm_slash(base_url()).confirm_slash($book->slug))?>';
		var start = <?=(isset($_GET['start'])?$_GET['start']:0)?>;
		var results = 20;
		var max_results = 100;
		var paywall = <?=(($book->has_paywall)?'true':'false')?>;

		$(document).ready(function() {

			$('#check_all').on('click', function() {
				var check_all = ($(this).is(':checked')) ? true : false;
				$('.table_wrapper').find('input[type="checkbox"]').prop('checked', check_all);
			});

			$('#selectImportPages').on('change', function() {
				var url = $('#selectImportPages option:selected').val();
				document.location.href = url;
			});

			$('.table_wrapper:first').scalardashboardtable('paginate', {query_type:'media',start:start,results:results,book_uri:book_uri,resize_wrapper_func:resizeList,tablesorter_func:tableSorter,pagination_func:pagination,paywall:paywall});

   			$(window).on('resize', function() { resizeList(); });
   			resizeList();

   			$('#formSearch').on('submit', function() {
   				start = 0;
   				$('.table_wrapper').html('<div id="loading">Loading</div>');
   	   			var sq = $(this).find('input[name="sq"]').val().toLowerCase();
   	   			var s_all = ($(this).find('input[name="s_all"][value="1"]').is(':checked')) ? 1 : null;
   	   			if (!sq.length || 'Search for a media file'.toLowerCase()==sq) {
					alert('Please enter a search query');
					return false;
   	   			}
   	   			$('.table_wrapper:first').scalardashboardtable('search', {query_type:'media',sq:sq,s_all:s_all,start:start,results:results,book_uri:book_uri,resize_wrapper_func:resizeList,tablesorter_func:tableSorter,pagination_func:pagination,paywall:paywall});
   	   			return false;
   			});

   			$('#formSearch').find('a').on('click', function() {
   	   			start = 0;
   				$('.table_wrapper').html('<div id="loading">Loading</div>');
				$(this).parent().find('input:first').val('Search for a media file');
				$('.table_wrapper:first').scalardashboardtable('paginate', {query_type:'media',start:start,results:results,book_uri:book_uri,resize_wrapper_func:resizeList,tablesorter_func:tableSorter,pagination_func:pagination,paywall:paywall});
   			});

   			var handle_jump_to = function(invoke) {
   	   			if ('undefined'==typeof(invoke)) invoke = false;
	   			var $jump_to = $('select[name="jump_to"]');
	   			$jump_to.empty();
	   			var total = parseInt($('.total:first').html());
				for (j = 1; j <= total; j+=results) {
					$jump_to.append('<option value="'+j+'">'+j+'</option>');
				}
				$jump_to.on('change', function() {
					start = parseInt($(this).find('option:selected').val() - 1);
					if (-1==start) start = 0;
					$('.table_wrapper:first').scalardashboardtable('paginate', {query_type:'media',start:start,results:results,book_uri:book_uri,resize_wrapper_func:resizeList,tablesorter_func:tableSorter,pagination_func:pagination,paywall:paywall});
	   			});
	   			if (invoke) $jump_to.trigger('change');
   			}
   			handle_jump_to();

   			var $num_results = $('select[name="num_results"]');
			for (j = results; j <= max_results; j+=results) {
				$num_results.append('<option value="'+j+'"'+((j==results)?' selected':'')+'>'+j+'</option>');
			}
			$num_results.on('change', {handle_jump_to:handle_jump_to}, function(e) {
				results = parseInt($num_results.val());
				e.data.handle_jump_to(true);
			});

		});

		function resizeList() {
    		$('.table_wrapper').height(Math.max(200, $(window).height() - ($('.table_wrapper').offset().top + 76))+'px'); // magic number to get list height right
		}

		function tableSorter() {
			$(".tablesorter").tablesorter({
        		headers: {
        			0: {sorter: false },
        			3: {sorter: false },
        			9: {sorter: false }
        		}
   			});
		}

		function pagination(callee, num_nodes) {
			$('.prev, .next').html('');
			$('div[class="search_metadata"]').hide();
			if ('paginate'==callee) {
				var total = parseInt($('.total:first').html());
				var prev = (start > 0) ? start : 0;
				var next = (start+results < total) ? start+results : total;
				var _prev = (start - results > 0) ? start - results : 0;
				var _next = (start + results < total) ? start + results : total;
				$('.pagination').html('<b>'+(prev+1)+'</b> - <b>'+(next)+'</b> of ');
				var $prev = $('<a href="javascript:;">'+((prev>0)?'Previous':'')+'</a>').appendTo('.prev');
				var $next = $('<a href="javascript:;">'+((next<total)?'Next':'')+'</a>').appendTo('.next');
				$prev.on('click', function() {
					$('.table_wrapper:first').scalardashboardtable('paginate', {query_type:'media',start:_prev,results:results,book_uri:book_uri,resize_wrapper_func:resizeList,tablesorter_func:tableSorter,pagination_func:pagination,paywall:paywall});
					start = _prev;
				});
				$next.on('click', function() {
					$('.table_wrapper:first').scalardashboardtable('paginate', {query_type:'media',start:_next,results:results,book_uri:book_uri,resize_wrapper_func:resizeList,tablesorter_func:tableSorter,pagination_func:pagination,paywall:paywall});
					start = _next;
				});
				$('.total').show();
				$('select[name="jump_to"]').val((start+1));
			} else if ('search'==callee) {
				$('.total').hide();
				$('.pagination').html('<b>'+num_nodes+'</b> search result'+((num_nodes>1)?'s':'')+' of ');
				$('select[name="jump_to"]').val('');
				$('div[class="search_metadata"]').show();
			}
		}

		function deleteFiles() {

			var items_to_delete = $('.tablesorter').find("input[type='checkbox']:checked");
			var content_ids_to_delete = new Array;
			var version_ids_to_delete = new Array;
			for (var j = 0; j < items_to_delete.length; j++) {
				var $to_delete = $(items_to_delete[j]);
				var id_to_delete = parseInt($to_delete.attr('name').replace('content_id_','').replace('version_id_',''));
				if ($to_delete.attr('name').indexOf('content_id')!=-1) {
					content_ids_to_delete.push(id_to_delete);
				} else if ($to_delete.attr('name').indexOf('version_id')!=-1) {
					var sibling_unchecked = false;
					$to_delete.parent().parent().siblings('.bottom_border').each(function() {
						sibling_unchecked = $(this).find("input[type='checkbox']:checked").length ? false : true;
					});
					if (!sibling_unchecked) {
						alert('A content row does not have at least one version unchecked (each content row must have at least one version).  Please check each row to make sure that there is at least one version attached.');
						return false;
					}
					version_ids_to_delete.push(id_to_delete);
				}
			}
			if (content_ids_to_delete.length==0 && version_ids_to_delete.length==0) {
				alert('Please select items to delete');
				return false;
			}
			str = 'Are you sure you wish to DELETE ';
			if (content_ids_to_delete.length > 0) str += toWords(content_ids_to_delete.length) + 'media file'+((content_ids_to_delete.length>1)?'s':'');
			if (version_ids_to_delete.length > 0) {
				if (content_ids_to_delete.length > 0) str += ' and ';
				str += toWords(version_ids_to_delete.length) + 'versions';
			}
			str+='?';
			str += ' This action cannot be undone—the media will be removed permanently from your project.';
			if (!confirm(str)) {
				return false;
			}
			$('#check_all').prop('checked',false);
			var data = {};
			data.action = 'delete_content';
			data.book_id = parseInt($('select[name="book_id"]').val());
			data.content_ids = content_ids_to_delete.join(',');
			data.version_ids = version_ids_to_delete.join(',');
			$.post('api/delete_content', data, function(data) {
			  for (var j = 0; j < data.content.length; j++) {
			  	 var content_id = data.content[j];
				 var $next = $('#file_row_'+content_id).next();
				 if ($next.hasClass('version_wrapper')) $next.remove();
			  	 $('#row_'+content_id).remove();
			  }
			  for (var j = 0; j < data.versions.length; j++) {
			  	 var version_id = data.versions[j];
			  	 $('#version_row_'+version_id).remove();
			  }
			  var str = '';
			  if (data.content.length > 0) str += ucwords(toWords(data.content.length))+'content';
			  if (data.versions.length > 0) {
			  	 if (data.content.length > 0) str += ', ';
			  	 str += ucwords(toWords(data.versions.length))+'versions';
			  }
			  str += ' deleted. ';
			  str += 'Do you wish to reload page content?';
			  if (confirm(str)) location.reload();
			});

		}

		function resetMediaVersionNums(content_id) {
			if (!confirm('Are you sure you wish to resent version numbers?  This might impact webpages that link to specific version numbers of your media.')) {
				return false;
			}
		}

		function get_versions(content_id, version_id, the_link) {
			var $the_link = $(the_link);
			// Get versions
			if (!$the_link.data('is_open')) {
				$the_link.data('orig_html', $the_link.html());
				$the_link.trigger('blur');
				var $the_row = $('#row_'+content_id)
				$.get('api/get_versions', {content_id:content_id}, function(data) {
					var $next = $the_link.parent().parent().next();
					if ($next.hasClass('version_wrapper')) $next.remove();
					if (data.length == 0) {
						$the_row.after('<tr class="version_wrapper"><td>&nbsp;</td><td class="odd" colspan="8">No versions entered</td></tr>');
					} else {
					   	var $row = $('<tr class="version_wrapper"><td colspan="11" style="padding:0px 0px 0px 0px;"><table style="width:100%;" cellspacing="0" cellpadding="0"></table></td></tr>');
					   	var $header = ('<tr><th></th><th style=\"display:none;\">ID</th><th>Version</th><th>Title</th><th>Description</th><th>URL</th><th style=\"display:none;\">Created</th></tr>');
					   	$row.find('table').html($header);
					   	$the_row.after($row);
					    for (var j = 0; j < data.length; j++) {
					    	var $data_row = $('<tr class="bottom_border" id="version_row_'+data[j].version_id+'" typeof="versions"></tr>');
					    	if(j == 0) {
					    		$data_row.data('most_recent_version',data[j].version_id);
					    	}
					    	$data_row.html('<td style="white-space:nowrap;"><input type="checkbox" name="version_id_'+data[j].version_id+'" value="1" />&nbsp; <a href="javascript:;" onclick="edit_row($(this).parent().parent());" class="generic_button">Edit</a></td>');
							$data_row.append('<td property="id" style="display:none;">'+data[j].version_id+"</td>");
							$data_row.append('<td class="editable number" property="version_num">'+data[j].version_num+"</td>");
							$data_row.append('<td class="editable" property="title">'+data[j].title+"</td>");
							$data_row.append('<td class="editable textarea excerpt" property="description"><span class="full">'+data[j].description+'</span><span class="clip">'+create_excerpt(data[j].description,8)+'</span></td>');
							$data_row.append('<td class="editable has_link'+((data[j].url.indexOf('://')!=-1)?'':' uri_link')+'" property="url" style="max-width:200px;overflow:hidden;"><a target="_blank" href="'+data[j].url+'">'+((data[j].url.indexOf('://')!=-1)?$.fn.scalardashboardtable('basename', data[j].url):data[j].url)+'</td>');
							$row.find('table').find('tr:last').after($data_row);
					    }
						var $reorder = $('<tr><td></td><td colspan="3"><a href="javascript:;" class="generic_button">Re-order version numbers</a></td><td colspan="2"</td></tr>');
						$data_row.after($reorder);
						$reorder.find('a:first').on('click', function() {
							if (!confirm('Are you sure you wish to re-order version numbers?  This might break links to specific versions in your book.')) return false;
							$.get('api/reorder_versions', {content_id:content_id}, function(data) {
								get_versions(content_id, the_link);  // close
								get_versions(content_id, the_link);  // open
							});
						});
						$the_link.html('Hide');
						$the_link.trigger('blur');
						$the_link.data('is_open',true);
					}
					$('body').on("contentUpdated",function(e,update_opts) {
						var $content_row = $('#row_'+content_id);
						var $version_row = $('#version_row_'+update_opts.version_id);
						$content_row.find('td').each(function() {
							var $content = $(this);
							var prop = $content.attr('property');
							if ('undefined'!=typeof(prop) && prop) {
								var $version = $version_row.find('td.editable[property="'+prop+'"]').eq(0);
								if ($version.length) {
									var $span = $version.find('span:first');
									if($span.length) {  // Excerpt field
										$content.html($span.html());
									} else {  // Typical field
										$content.html($version.html());
									}
								}
							}
						});
					});
				});
			// Remove versions
			} else {
				var $next = $the_link.parent().parent().next();
				if ($next.hasClass('version_wrapper')) $next.remove();
				$the_link.data('is_open',false);
				$the_link.html('View');
				$the_link.trigger('blur');
			}
		}

		</script>

		<form style="float:left;" id="formSearch">
		<input type="text" name="sq" style="width:300px;float:left;margin-right:3px;" class="generic_text_input" value="Search for a media file" onmousedown="if (this.value=='Search for a media file') this.value='';" />
		<input type="submit" value="Go" class="generic_button" />&nbsp; <a href="javascript:;">clear</a>&nbsp;
		<? if (count($current_book_files)): ?>
		&nbsp; <span class="prev"></span>&nbsp; <span class="pagination"></span> <b class="total"><?=count($current_book_files)?></b> media &nbsp;<span class="next"></span>
		&nbsp; &nbsp;<div class="search_metadata">Search: <label for="s_not_all"><input type="radio" id="s_not_all" name="s_all" value="0" checked /> title &amp; description (fast)</label> &nbsp;<label for="s_all"><input type="radio" id="s_all" name="s_all" value="1" /> all fields &amp; metadata (slow)</label></div>
		<? endif ?>
		</form>

<?
		if (!empty($book)):
			$url_base = confirm_slash(base_url()).confirm_slash($book->slug);
?>
		<div style="float:right;">
			Import pages:&nbsp;
			<select id="selectImportPages" class="generic_text_input">
				<option value="">&nbsp;</option>
				<optgroup label="Affiliated archives">
					<option value="<?=$url_base?>import/critical_commons">Critical Commons</option>
					<option value="<?=$url_base?>import/internet_archive">Internet Archive</option>
					<option value="<?=$url_base?>import/shoah_foundation_vha_online">VHA Online</option>
					<option value="<?=$url_base?>import/shoah_foundation_vha">VHA</option>
				</optgroup>
				<optgroup label="Other archives">
					<option value="<?=$url_base?>import/omeka">Omeka sites</option>
					<option value="<?=$url_base?>import/omeka_s">Omeka S sites</option>
					<option value="<?=$url_base?>import/soundcloud">SoundCloud</option>
					<option value="<?=$url_base?>import/youtube">YouTube</option>
				</optgroup>
				<optgroup label="Files, URLs">
					<option value="<?=$url_base?>upload">Upload file</option>
					<option value="<?=$url_base?>new.edit#type=media">Internet URL</option>
				</optgroup>
			</select>
		</div>
<? 		endif; ?>

		<br clear="both" /><br />

		<div class="table_wrapper"><div id="loading">Loading</div></div>

		<br />

		<form onsubmit="deleteFiles();return false;">
		<input type="submit" value="Delete selected files" class="generic_button" />
		&nbsp; &nbsp;
		<input id="check_all" type="checkbox" /><label for="check_all"> Check all</label>
		&nbsp; &nbsp;
		<span class="prev"></span>&nbsp; <span class="pagination"></span> <b class="total"><?=count($current_book_files)?></b> media &nbsp;<span class="next"></span>
		&nbsp; &nbsp; &nbsp;
		Jump to: <select name="jump_to"><option value=""></option></select> of  <b><?=count($current_book_files)?></b> media
		&nbsp; &nbsp;
		<span style="white-space:nowrap;">Show: <select name="num_results"></select> at a time</span>
		</form>
<? endif ?>
