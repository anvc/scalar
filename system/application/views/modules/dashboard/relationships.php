<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_js('system/application/views/widgets/tablesorter/jquery.tablesorter.min.js')?>
<?$this->template->add_css('system/application/views/widgets/tablesorter/style.css')?>
<?$this->template->add_js('system/application/views/widgets/api/scalarapi.js')?>
<?$this->template->add_js('system/application/views/modules/dashboard/jquery.dashboardtable.js')?>
<?
	if (empty($book)):
		echo 'Please select a book to manage using the pulldown menu above';
	else:
		$default_rel_type = 'reply';  // Make comments default for easy access to hidden comments
?>

	<div id="slug-change-confirm" title="URI change">
	Changing the page's URI will change its location on the web, which will make its old URL unavailable. Do you wish to continue?
	</div>

	<script>

		var book_uri = '<?=addslashes(confirm_slash(base_url()).confirm_slash($book->slug))?>';

		$(document).ready(function() {

			rel_type = $('#formRelType').find('[name="relType"] option:selected').val();  // Global

			$('#check_all').on('click', function() {
				var check_all = ($(this).is(':checked')) ? true : false;
				$('.table_wrapper').find('input[type="checkbox"]').prop('checked', check_all);
			});

			$('.table_wrapper:first').scalardashboardtable('paginate', {query_type:rel_type,start:null,results:null,book_uri:book_uri,resize_wrapper_func:resizeList,tablesorter_func:tableSorter,expand_column:{name:rel_type.capitalizeFirstLetter()+' of',func:'getParentOf'},pagination_func:pagination,paywall:false,no_content_msg:'There is no content of this type<br />You can select a different relationship type using the pulldown above'});

   			$(window).on('resize', function() { resizeList(); });
   			resizeList();

   			$('#formRelType').on('submit', function() {
   				rel_type = $(this).find('[name="relType"] option:selected').val();
   				$('.table_wrapper:first').scalardashboardtable('paginate', {query_type:rel_type,start:null,results:null,book_uri:book_uri,resize_wrapper_func:resizeList,tablesorter_func:tableSorter,expand_column:{name:rel_type.capitalizeFirstLetter()+' of',func:'getParentOf'},pagination_func:pagination,paywall:false,no_content_msg:'There is no content of this type<br />You can select a different relationship type using the pulldown above'});
   				return false;
   			});
   			$('#formRelType').find('[name="relType"]').on('change', function() {
   	   			var $this = $(this);
   	   			$this.closest('form').trigger('submit');
   	   			$this.trigger('blur');
   			});

   			$('body').on('rowSaved', function() {
				pagination();
   			});

		});

		function pagination(callee, num_nodes) {
			var $table = $('.table_wrapper:first');
			var num_not_live = parseInt($table.find('tr.not_live').length);
			var $tab = $('.tabs ul li a[href="#tabs-relationships"]:first');
			$tab.find('sup').remove();
			if (num_not_live) $tab.append('<sup>'+num_not_live+'</sup>');
		}

		String.prototype.capitalizeFirstLetter = function() {
		    return this.charAt(0).toUpperCase() + this.slice(1);
		}

		function resizeList() {
    		$('.table_wrapper').height(Math.max(200, $(window).height() - ($('.table_wrapper').offset().top + 76))+'px'); // magic number to get list height right
		}

		function tableSorter() {
			$(".tablesorter").tablesorter({
        		headers: {
    				0: {sorter: false },
        			7: {sorter: false },
        		}
   			});
		}

		function getParentOf(content_id, version_id, the_link) {
			var $the_link = $(the_link);
			var $the_row = $the_link.parent().parent();
			if (!$the_link.data('is_open')) {
				var data = {action:'get_'+rel_type+'_of',version_id:version_id}
				$.get('api/get_'+rel_type+'_of', data, function(data) {
					$('#'+rel_type+'_of_row_'+version_id).remove();
					if (data.length == 0) {
						$the_row.after('<tr class="container_of_wrapper" id="'+rel_type+'_of_row_'+version_id+'"><td style="padding:0px 0px 0px 0px;" colspan="8"><div class="no_items">'+rel_type.capitalizeFirstLetter()+' of <b>0</b> items (all '+rel_type+' relationships were removed from this page)</div></td></tr>');
					} else {
						var $row = $('<tr class="container_of_wrapper" id="'+rel_type+'_of_row_'+version_id+'"><td colspan="8" style="padding:0px 0px 0px 0px;"><table style="width:100%;" cellspacing="0" cellpadding="0"></table></td></tr>');
						var $header = $('<tr><th></th><th style=\"display:none;\">ID</th><th>URI</th><th>Title</th></tr>');
						$row.find('table').html($header);
						$the_row.after($row);
						var has_added_th = false;
						for (var j in data) {
							var $data_row = $('<tr class="bottom_border '+rel_type+'_of_row"></tr>');
							$data_row.html('<td style="white-space:nowrap;width:90px;">'+rel_type.capitalizeFirstLetter()+' of</td>');
							$data_row.append('<td property="id" style="display:none;">'+data[j].content_id+"</td>");
							$data_row.append('<td property="slug" style="max-width:250px;overflow:hidden;"><a href="'+book_uri+data[j].slug+'">'+data[j].slug+"</a></td>");
							$data_row.append('<td property="title">'+data[j]['versions'][0]['title']+'</td>');
							// Path
							if ('undefined'!=typeof(data[j]['sort_number'])) {
								$data_row.append('<td property="sort_number">'+data[j]['sort_number']+'</td>');
								if (!has_added_th) {
									has_added_th = true;
									$header.append('<th>#</th>');
								}
							// Annotation
							} else if ('undefined'!=typeof(data[j]['start_seconds'])) {
								var str = '';
								if (data[j]['start_seconds'].length && '0'!=data[j]['start_seconds']) str += 'start sec '+Math.round(data[j]['start_seconds'])+'; ';
								if (data[j]['end_seconds'].length && '0'!=data[j]['end_seconds']) str += 'end sec '+Math.round(data[j]['end_seconds'])+'; ';
								if (data[j]['points'].length && '0'!=data[j]['points']) str += 'points '+data[j]['points']+'; ';
								if (data[j]['start_line_num'].length && '0'!=data[j]['start_line_num']) str += 'start line '+data[j]['start_line_num']+'; ';
								if (data[j]['end_line_num'].length && '0'!=data[j]['end_line_num']) str += 'end line '+data[j]['end_line_num']+'; ';
								$data_row.append('<td>at '+str+'</td>');
								if (!has_added_th) {
									has_added_th = true;
									$header.append('<th>Parameters</th>');
								}
							// Other rel types
							} else {
								$data_row.append('<td property="description">'+$.fn.scalardashboardtable('cut_string',data[j]['versions'][0]['description'],50)+'</td>');
								if (!has_added_th) {
									has_added_th = true;
									$header.append('<th>Description</th>');
								}
							}
							$row.find('table').find('tr:last').after($data_row);
						}
					}
					$the_link.html('Hide');
					$the_link.trigger('blur');
					$the_link.data('is_open',true);
				});
			} else {
				$('#'+rel_type+'_of_row_'+version_id).remove();
				$the_link.html('View');
				$the_link.data('is_open',false);
				$the_link.trigger('blur');
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
			if (content_ids_to_delete.length > 0) str += toWords(content_ids_to_delete.length) + 'page'+((content_ids_to_delete.length>1)?'s':'');
			if (version_ids_to_delete.length > 0) {
				if (content_ids_to_delete.length > 0) str += ' and ';
				str += toWords(version_ids_to_delete.length) + 'versions';
			}
			str+='?';
			str += ' This action cannot be undone—the page' + ((content_ids_to_delete.length>1)?'s’':'’s') + ' content will be removed permanently.';
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
			  $('.table_wrapper:first').scalardashboardtable('paginate', {query_type:rel_type,start:null,results:null,book_uri:book_uri,resize_wrapper_func:resizeList,tablesorter_func:tableSorter,expand_column:{name:rel_type.capitalizeFirstLetter()+' of',func:'getParentOf'},pagination_func:pagination,paywall:false,no_content_msg:'There is no content of this type<br />You can select a different relationship type using the pulldown above'});
			});

		}

		</script>

		<form style="float:left;" id="formRelType">
		<select name="relType" style="min-width:200px;float:left;margin-right:3px;" class="generic_text_input">
			<option value="path"<?=('path'==$default_rel_type)?' selected':''?>>Paths</option>
			<option value="tag"<?=('tag'==$default_rel_type)?' selected':''?>>Tags</option>
			<option value="annotation"<?=('annotation'==$default_rel_type)?' selected':''?>>Annotations</option>
			<option value="reply"<?=('reply'==$default_rel_type)?' selected':''?>>Comments</option>
		</select>
		</form>

		<br clear="both" /><br />

		<div class="table_wrapper"><div id="loading">Loading</div></div>

		<br />

		<form onsubmit="deleteFiles();return false;">
		<input type="submit" value="Delete selected pages" class="generic_button" />
		&nbsp; &nbsp;
		<input id="check_all" type="checkbox" /><label for="check_all"> Check all</label>
		</form>
<? endif ?>
