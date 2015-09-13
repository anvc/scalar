<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_js('system/application/views/widgets/tablesorter/jquery.tablesorter.min.js')?>
<?$this->template->add_css('system/application/views/widgets/tablesorter/style.css')?>
<?$this->template->add_js('system/application/views/widgets/api/scalarapi.js')?>
<?$this->template->add_js('system/application/views/modules/dashboard/jquery.dashboardtable.js')?>
<?$this->template->add_css('system/application/views/widgets/edit/content_selector.css')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.content_selector.js')?>
<?
	if (empty($book)):
		echo 'Please select a book to manage using the pulldown menu above';
	else:
		$default_rel_type = 'term';  // Make comments default for easy access to hidden comments
?>

	<div id="slug-change-confirm" title="URI change">
	Changing the page's URI will change its location on the web, which will make its old URL unavailable. Do you wish to continue?
	</div>

	<script>

		var book_uri = '<?=addslashes(confirm_slash(base_url()).confirm_slash($book->slug))?>';
		var book_id = <?=$book->book_id?>;

		$(document).ready(function() {

			rel_type = $('#formRelType').find('[name="relType"] option:selected').val();  // Global

			$('#check_all').click(function() {
				var check_all = ($(this).is(':checked')) ? true : false;
				$('.table_wrapper').find('input[type="checkbox"]').prop('checked', check_all);
			});

			$('.table_wrapper:first').scalardashboardtable('paginate', {query_type:rel_type,start:null,results:null,book_uri:book_uri,resize_wrapper_func:resizeList,tablesorter_func:tableSorter,pagination_func:pagination,paywall:false,no_content_msg:'There is no content of this type<br />You can select a different category using the pulldown above'});

   			$(window).resize(function() { resizeList(); });
   			resizeList();

   			$('#formRelType').submit(function() {
   				rel_type = $(this).find('[name="relType"] option:selected').val();
   				$('.table_wrapper:first').scalardashboardtable('paginate', {query_type:rel_type,start:null,results:null,book_uri:book_uri,resize_wrapper_func:resizeList,tablesorter_func:tableSorter,pagination_func:pagination,paywall:false,no_content_msg:'There is no content of this type<br />You can select a different category using the pulldown above'});
				$('#add_term_btn').find('span:first').html(rel_type);
   				return false;
   			});
   			$('#formRelType').find('[name="relType"]').change(function() {
   	   			var $this = $(this);
   	   			$this.closest('form').submit();
   	   			$this.blur();
   			});
   			$('#formRelTypeReload a').click(function() {
   	   			var $this = $(this);
   	   			$this.closest('form').submit();
   	   			$this.blur();
   			});

   			$('body').on('rowSaved', function() {
				pagination();
   			});

   			$('#add_term_btn').click(function() {
   				$('<div></div>').content_selector({parent:book_uri,changeable:true,multiple:true,onthefly:true,msg:'Selected pages will be added to the <b>'+rel_type+'</b> category',callback:function(nodes){
   					console.log(nodes);
   					$('.table_wrapper:first').html('<div id="loading">Saving</div>');
   					for (var j = 0; j < nodes.length; j++) {
   						var urn = nodes[j].content["http://scalar.usc.edu/2012/01/scalar-ns#urn"][0].value;
   						var content_id = urn.substr(urn.lastIndexOf(':')+1);
   						var post = {book_id:book_id,content_id:content_id,category:rel_type};
   						$.post('api/save_content_category', post, function(data) {
   	   						if ($.isEmptyObject(data)) alert('Something went wring trying to save');
   	   						if ('undefined'!=typeof(data.error)) alert('There was an error trying to save: '+data.error);
   							$('.table_wrapper:first').scalardashboardtable('paginate', {query_type:rel_type,start:null,results:null,book_uri:book_uri,resize_wrapper_func:resizeList,tablesorter_func:tableSorter,pagination_func:function() {
								$('#add_term_msg').show().delay(2000).fadeOut(3000);
								pagination();
   							},paywall:false,no_content_msg:'There is no content of this type<br />You can select a different category using the pulldown above'});
   						}, 'json');

   					}
   				}});
   			});

		});

		function pagination(callee, num_nodes) {
			var $table = $('.table_wrapper:first');
			var num_not_live = parseInt($table.find('tr.not_live').length);
			var $tab = $('.tabs ul li a[href="#tabs-categories"]:first');
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

		function get_versions(content_id, version_id, the_link) {
			var $the_link = $(the_link);
			if ($the_link.html()=='Loading...') return;
			// Get versions
			if (!$the_link.data('is_open')) {
				$the_link.data('orig_html', $the_link.html());
				$the_link.blur();
				var $the_row = $('#row_'+content_id)
				$.get('api/get_versions', {content_id:content_id}, function(data) {
					var $next = $the_link.parent().parent().next();
					if ($next.hasClass('version_wrapper')) $next.remove();
					if (data.length == 0) {
						$the_row.after('<tr class="version_wrapper"><td>&nbsp;</td><td class="odd" colspan="8">No versions entered</td></tr>');
					} else {
					   	var $row = $('<tr class="version_wrapper"><td colspan="11" style="padding:0px 0px 0px 0px;"><table style="width:100%;" cellspacing="0" cellpadding="0"></table></td></tr>');
					   	var $header = ('<tr><th></th><th style=\"display:none;\">ID</th><th>Version</th><th>Title</th><th>Description</th><th>Content</th><th style=\"display:none;\">Created</th></tr>');
					   	$row.find('table').html($header);
					   	$the_row.after($row);
					    for (var j = 0; j < data.length; j++) {
					    	var $data_row = $('<tr class="bottom_border" content_id="'+content_id+'" id="version_row_'+data[j].version_id+'" typeof="versions"></tr>');
					    	if(j == 0) {
					    		$data_row.data('most_recent_version',data[j].version_id);
					    	}
					    	$data_row.html('<td style="white-space:nowrap;"><input type="checkbox" name="version_id_'+data[j].version_id+'" value="1" />&nbsp; <a href="javascript:;" onclick="edit_row($(this).parent().parent());" class="generic_button">Edit</a></td>');
							$data_row.append('<td property="id" style="display:none;">'+data[j].version_id+"</td>");
							$data_row.append('<td class="editable number" property="version_num">'+data[j].version_num+"</td>");
							$data_row.append('<td class="editable" property="title">'+data[j].title+"</td>");
							$data_row.append('<td class="editable textarea excerpt" property="description"><span class="full">'+data[j].description+'</span><span class="clip">'+create_excerpt(data[j].description,8)+'</span></td>');
							$data_row.append('<td class="editable textarea excerpt" property="content"><span class="full">'+data[j].content+'</span><span class="clip">'+create_excerpt(data[j].content,8)+'</span></td>');
							$row.find('table').find('tr:last').after($data_row);
					    }
						var $reorder = $('<tr><td></td><td colspan="3"><a href="javascript:;" class="generic_button">Reset version numbers</a></td><td colspan="2"</td></tr>');
						$data_row.after($reorder);
						$reorder.find('a:first').click(function() {
							if (!confirm('Are you sure you wish to reset version numbers? This might break links to specific versions in your book.')) return false;
							$.get('api/reorder_versions', {content_id:content_id}, function(data) {
								get_versions(content_id, the_link);  // close
								get_versions(content_id, the_link);  // open
							});
						});
						$the_link.html('Hide');
						$the_link.blur();
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
				$the_link.html('View');
				$the_link.data('is_open',false);
				$the_link.blur();
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
			  $('.table_wrapper:first').scalardashboardtable('paginate', {query_type:rel_type,start:null,results:null,book_uri:book_uri,resize_wrapper_func:resizeList,tablesorter_func:tableSorter,pagination_func:pagination,paywall:false,no_content_msg:'There is no content of this type<br />You can select a different category using the pulldown above'});
			});

		}

		</script>

		<a id="add_term_btn" href="javascript:void(null);" class="generic_button">Add content to <span>term</span> category</a>

		<div id="add_term_msg">Content has been added</div>

		<form style="float:left;" id="formRelType">
		<select name="relType" style="min-width:200px;float:left;margin-right:3px;" class="generic_text_input">
			<option value="review"<?=('review'==$default_rel_type)?' selected':''?>>Review</option>
			<option value="commentary"<?=('commentary'==$default_rel_type)?' selected':''?>>Commentary</option>
			<option value="term"<?=('term'==$default_rel_type)?' selected':''?>>Term</option>
		</select>
		<div id="formRelTypeReload"><a href="javascript:void(null);">reload</a></div>
		</form>

		<br clear="both" /><br />

		<div class="table_wrapper"><div id="loading">Loading</div></div>

		<br />

		<div style="float:right;">To remove a page from a category, edit the page's row and set the category field to (empty)</div>

		<form onsubmit="deleteFiles();return false;">
		<input type="submit" value="Delete selected pages" class="generic_button" />
		&nbsp; &nbsp;
		<input id="check_all" type="checkbox" /><label for="check_all"> Check all</label>
		</form>


<? endif ?>