<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_js('system/application/views/widgets/tablesorter/jquery.tablesorter.min.js')?>
<?$this->template->add_css('system/application/views/widgets/tablesorter/style.css')?>
<?
	if (empty($book)):
		echo 'Please select a book to manage using the pulldown menu above';
	else:	
?>	

	<script>
	
		var book_uri = '<?=addslashes(confirm_slash(base_url()).confirm_slash($book->slug))?>';
		$(document).ready(function() {
			
			$(".tablesorter").tablesorter({ 
        		headers: { 
        			0: {sorter: false }, 
        			1: {sorter: false }, // this is a hidden column
            		8: {sorter: false }
        		} 
   			}); 
   			
   			$(window).resize(function() { resizeList(); });
   			resizeList();

			$('#check_all').click(function() {
				var check_all = ($(this).is(':checked')) ? true : false;
				$('#media').find('input[type="checkbox"]').prop('checked', check_all);
			});    			
   			
		});	
		
		function resizeList() {
    		$('.table_wrapper').height(Math.max(200, $(window).height() - ($('.table_wrapper').offset().top + 100))+'px'); // magic number to get list height right
		}
	
		function searchFiles(sq) {
			sq = sq.toLowerCase();
			var rows = $('#media').find("tr[typeof='pages']").each(function() {
				var $row = $(this);
				$row.hide();
				var slug = $row.find("td[property='slug']:first").find('a:first').html();
				var title = $row.find("td[property='title']:first").html();
				if (slug.toLowerCase().indexOf(sq)!=-1) $row.show();
				if (title.toLowerCase().indexOf(sq)!=-1) $row.show();
			});
		}
		function clearSearchFiles() {
			var rows = $('#media').find("tr[typeof='pages']").each(function() {
				var $row = $(this);
				$row.show();
			});
			document.getElementById('formSearchContent').sq.value = 'Search <?=@addslashes($book->title)?>';
		}		
		function deleteFiles() {
			
			var items_to_delete = $('#media').find("input[type='checkbox']:checked");
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
			if (content_ids_to_delete.length > 0) str += toWords(content_ids_to_delete.length) + 'file'+((content_ids_to_delete.length>1)?'s':'');
			if (version_ids_to_delete.length > 0) {
				if (content_ids_to_delete.length > 0) str += ' and ';
				str += toWords(version_ids_to_delete.length) + 'versions';
			}
			str+='?';
			if (!confirm(str)) {
				return false;
			}
			
			var data = {};
			data.action = 'delete_content';
			data.content_ids = content_ids_to_delete.join(','); 
			data.version_ids = version_ids_to_delete.join(','); 
			$.post('api/delete_content', data, function(data) {
			  for (var j = 0; j < data.content.length; j++) {
			  	 var content_id = data.content[j];
				 var $next = $('#file_row_'+content_id).next();
				 if ($next.hasClass('version_wrapper')) $next.remove();			  	 
			  	 $('#file_row_'+content_id).remove();
			  }
			  for (var j = 0; j < data.versions.length; j++) {
			  	 var version_id = data.versions[j];
			  	 $('#file_version_row_'+version_id).remove();
			  }			  
			  var str = '';
			  if (data.content.length > 0) str += ucwords(toWords(data.content.length))+'content';
			  if (data.versions.length > 0) {
			  	 if (data.content.length > 0) str += ', ';
			  	 str += ucwords(toWords(data.versions.length))+'versions';
			  }
			  str += ' deleted';
			  alert(str);
			});
			
		}
		function resetMediaVersionNums(content_id) {
			if (!confirm('Are you sure you wish to resent version numbers?  This might impact webpages that link to specific version numbers of your media.')) {
				return false;
			}
		}	
		function media_get_versions(content_id, the_link) {
			var $the_link = $(the_link);
			// Get versions
			if (!$the_link.data('is_open')) {
				$the_link.data('orig_html', $the_link.html());
				$the_link.blur();
				var $the_row = $('#file_row_'+content_id)
				$.get('api/get_versions', {content_id:content_id}, function(data) {
					var $next = $the_link.parent().parent().next();
					if ($next.hasClass('version_wrapper')) $next.remove();					
					if (data.length == 0) {
						$the_row.after('<tr class="version_wrapper"><td>&nbsp;</td><td class="odd" colspan="8">No versions entered</td></tr>');
					} else {
					   	var $row = $('<tr class="version_wrapper"><td colspan="8" style="padding:0px 0px 0px 0px;"><table style="width:100%;" cellspacing="0" cellpadding="0"></table></td></tr>');
					   	var $header = ('<tr><th></th><th style=\"display:none;\">ID</th><th>Version</th><th>Title</th><th>Description</th><th>URL</th><th style=\"display:none;\">Created</th></tr>');
					   	$row.find('table').html($header);
					   	$the_row.after($row);			
					    for (var j = 0; j < data.length; j++) {
					    	var $data_row = $('<tr class="bottom_border" id="file_version_row_'+data[j].version_id+'" typeof="versions"></tr>');
					    	$data_row.html('<td style="white-space:nowrap;"><input type="checkbox" name="version_id_'+data[j].version_id+'" value="1" />&nbsp; <a href="javascript:;" onclick="edit_row($(this).parent().parent());" class="generic_button">Edit</a></td>');
							$data_row.append('<td property="id" style="display:none;">'+data[j].version_id+"</td>");
							$data_row.append('<td class="editable number" property="version_num">'+data[j].version_num+"</td>");
							$data_row.append('<td class="editable" property="title">'+data[j].title+"</td>");
							$data_row.append('<td class="editable textarea excerpt" property="description"><span class="full">'+data[j].description+'</span><span class="clip">'+create_excerpt(data[j].description,8)+'</span></td>');
							$data_row.append('<td class="editable" property="url" style="max-width:200px;overflow:hidden;">'+data[j].url+'</td>');
							$row.find('table').find('tr:last').after($data_row);
					    }
						var $reorder = $('<tr><td></td><td colspan="3"><a href="javascript:;" class="generic_button">Re-order version numbers</a></td><td colspan="2"</td></tr>');
						$data_row.after($reorder);
						$reorder.find('a:first').click(function() {
							if (!confirm('Are you sure you wish to re-order version numbers?  This might break links to specific versions in your book.')) return false;
							$.get('api/reorder_versions', {content_id:content_id}, function(data) {
								media_get_versions(content_id, the_link);
								media_get_versions(content_id, the_link);
							});
						});					    
						$the_link.html($the_link.data('orig_html'));
						$the_link.blur();
						$the_link.data('is_open',true);				    
					}
				});
			// Remove versions	
			} else {
				var $next = $the_link.parent().parent().next();
				if ($next.hasClass('version_wrapper')) $next.remove();
				$the_link.data('is_open',false);
				$the_link.blur();
			}
			
		}			
		</script>
		
		<form style="float:left;" id="formSearchFiles" onsubmit="searchFiles(this.sq.value);return false;">
		<input type="text" name="sq" style="width:300px;" value="Search for a media file" onmousedown="if (this.value=='Search for a media file') this.value='';" />
		<input type="submit" value="Go" class="generic_button" />&nbsp; <a href="javascript:;" onclick="clearSearchFiles();$(this).blur();">clear</a>&nbsp;
		<? if (count($current_book_files)): ?>
		&nbsp; <b><?=count($current_book_files)?></b> media file(s)
		<? endif ?>
		</form>
		
		<br clear="both" />

<?
		if (!empty($book)):
			$url_base = confirm_slash(base_url()).confirm_slash($book->slug);
?>		
		<div style="padding-top:10px;padding-left:4px;">
			Import page quick links:&nbsp; 
			<a href="<?=$url_base?>import/critical_commons">Critical Commons</a>,&nbsp; 
			<a href="<?=$url_base?>import/cuban_theater_digital_archive">Cuban Theater Digital Archive</a>,&nbsp; 
			<a href="<?=$url_base?>import/hemispheric_institute">Hemispheric Institute</a>,&nbsp; 
			<a href="<?=$url_base?>import/hypercities">HyperCities</a>,&nbsp; 
			<a href="<?=$url_base?>import/internet_archive">Internet Archive</a>,&nbsp; 
			<a href="<?=$url_base?>import/play">PLAY!</a>,&nbsp; 
			<a href="<?=$url_base?>import/shoah_foundation_vha_online">VHA Online</a>,&nbsp;
			<a href="<?=$url_base?>import/shoah_foundation_vha">VHA</a>&nbsp; |&nbsp;
			<a href="<?=$url_base?>import/getty_museum_collection">Getty Museum Collection</a>,&nbsp; 
			<a href="<?=$url_base?>import/prezi">Prezi</a>,&nbsp;
			<a href="<?=$url_base?>import/soundcloud">SoundCloud</a>,&nbsp;
			<a href="<?=$url_base?>import/the_metropolitan_museum_of_art">The Metropolitan Museum of Art</a>,&nbsp;
			<a href="<?=$url_base?>import/vimeo">Vimeo</a>,&nbsp;
			<a href="<?=$url_base?>import/youtube">YouTube</a>&nbsp; |&nbsp; 
			<a href="<?=$url_base?>upload">Upload file</a>,&nbsp;
			<a href="<?=$url_base?>new.edit#type=media">Internet URL</a>,&nbsp; 
			<a href="<?=$url_base?>import/system">Another Scalar book</a>
		</div>
<? 		endif; ?>
		
		<br />
		
		<div class="table_wrapper">
		<table cellspacing="0" cellpadding="0" style="width:100%;" class="tablesorter" id="media">
		<thead>
			<tr class="head">
				<th></th>
				<th style="display:none;"></th>
				<th>Live?&nbsp; </th>
				<th>URI</th>
				<th>Title</th>
				<th>Category</th>
				<th>File URL</th>
				<th>Created</th>
				<th>User</th>
				<th>Versions</th>
			</tr>
		</thead>
		<tbody>
<?
		$count = 1;
		foreach ($current_book_files as $row) {
			$title = '(No title)';
			$url = '(No URL)';
			if (isset($row->versions[0])) {
				$title = $row->versions[0]->title;
				$url = $row->versions[0]->url;
			}
			$category = (!empty($row->category)) ? $row->category : '';
			echo '<tr class="bottom_border '.(($row->is_live)?'':'not_live').'" id="file_row_'.$row->content_id.'" typeof="pages">';
			echo '<td style="white-space:nowrap;width:60px;"><input type="checkbox" name="content_id_'.$row->content_id.'" value="1">&nbsp; <a href="javascript:;" onclick="edit_row($(this).parents(\'tr\'));" class="generic_button">Edit</a>'."</td>\n";
			echo '<td style="white-space:nowrap;width:50px;display:none;" property="id">'.$row->content_id."</td>\n";
			echo '<td class="editable boolean" property="is_live" style="text-align:center;width:65px;">'.$row->is_live."</td>\n";
			echo '<td class="editable has_link uri_link" property="slug" style="max-width:200px;overflow:hidden;"><a href="'.confirm_slash(base_url()).confirm_slash($book->slug).$row->slug.'">'.$row->slug."</a></td>\n";
			echo '<td property="title">'.$title."</td>\n";
			echo '<td class="editable enum {\'review\',\'commentary\'}" property="category" width="100px" style="white-space:nowrap;">'.$category."</td>\n";
			// URL
			echo '<td property="url" style="max-width:200px;overflow:hidden;">';
			echo '<a href="'.abs_url($url, confirm_slash(base_url()).$book->slug).'">'.basename($url).'</a> ';
			if ($this->versions->url_is_local($url)) echo '<a class="generic_button" href="'.confirm_slash(base_url()).confirm_slash($book->slug).'upload#replace='.$row->versions[0]->version_id.'">replace</a>';
			echo "</td>\n";
			echo '<td style="white-space:nowrap;">'.((!empty($row->created)&&$row->created!='0000-00-00 00:00:00')? date( 'M j, Y g:i A', strtotime($row->created)):'')."</td>\n";
			echo '<td class="editable number" property="user" style="white-space:nowrap;width:55px;text-align:center;">'.$row->user."</td>\n";
			echo '<td style="white-space:nowrap;text-align:center;"><a href="javascript:;" onclick="media_get_versions('.$row->content_id.',this);" class="generic_button">View</a></td>'."\n";
			echo "</tr>\n";	
			$count++;
		}
?>
		</tbody>
		</table>
		</div>
		
		<br />		
		
		<form onsubmit="deleteFiles();return false;">
		<input type="submit" value="Delete selected files" class="generic_button large" />
		&nbsp; &nbsp; 
		<input id="check_all" type="checkbox" /><label for="check_all"> Check all</label>		
		</form>	
<? endif ?>