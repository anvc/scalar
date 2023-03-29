<?$this->template->add_js('application/views/modules/dashboard/jquery.dashboardtable.js')?>

		<style>
		.admin-nav-wrap {
			margin:12px 0px 0px 0px;
			width:100%;
		}
		.book-search-form {
			display:inline-block;
		}
		</style>

		<script>
		$(document).ready(function() {

			$('.jump-form').on('submit', function() {
				var x = parseInt($(this).children('.jump-to-page').val());
				if(!isNaN(x)) {
					var start = <?=$total?> * (x-1);
	 				window.location.href = "<?=confirm_slash(base_url())?>main/dashboard?zone=all-books&start=" + start + "&total=<?=$total?>#tabs-all-books";
				}
				return false;
			});

			var search_text = "<?=isset($_REQUEST['sq'])?htmlspecialchars($_REQUEST['sq']):''?>";
			if(search_text) {
				$('.book-search').val(search_text);
			}

			$('.book-search-form').on('submit', function() {
				var sq = $(this).children('.book-search').val();
 				window.location.href = "<?=confirm_slash(base_url())?>main/dashboard?zone=all-books&sq=" + encodeURIComponent(sq) + "#tabs-all-books";
				return false;
			});

			$('.value_select_trigger').on('click', function() {
				var $this = $(this);
				var multiple = $this.hasClass('multiple');
				var resource = $this.attr('resource');
				var rel = $this.attr('rel');
				var id = $this.parents('tr').find("td[property='id']").html();
				var ids = new Array;
				var elements = $this.closest('td').find("span");
				for (var j = 0; j < elements.length; j++) {
					if (!$(elements[j]).attr('id')) continue;
					ids.push( $(elements[j]).attr('id') );
				}
				var post = {'id':id};
				var box = $('#value_selector');
				var form = box.find('form:first');
				form.find("input[name='section']").val(rel);
				form.find("input[name='id']").val(id);
				var selector = box.find('select');
				if (multiple) {selector.attr('multiple','multiple');selector.find('#multiple_info').show();} else {selector.removeAttr('multiple');selector.find('#multiple_info').hide();}
				selector.html('<option value="0">Loading...</option>');
				$.post('api/'+resource, post, function(data) {
					selector.html('');
					var option = $('<option value="0">(Select none)</option>');
					for (var j = 0; j < data.length; j++) {
						var rel_id = data[j].user_id;
						if ('undefined'==typeof(rel_id)) rel_id = data[j].book_id;
						var title = data[j].fullname;
						if ('undefined'==typeof(title)) title = data[j].title;
						var selected = (ids.indexOf(rel_id) != -1) ? true : false;
						console.log(ids);
						var option = $('<option value="'+rel_id+'"'+((selected)?' selected':'')+'>'+title+'</option>');
						selector.append(option);
					}
					box.css( 'top', ((parseInt($(window).height())/2)-(parseInt(box.height())/2))+parseInt($(window).scrollTop()) );
					box.css( 'left', ((parseInt($(window).width())/2)-(parseInt(box.width())/2)) );
					box.show();
				});

			});

   			$(window).on('resize', function() { resizeList(); });
   			resizeList();

		});

		function resizeList() {
    		$('.table_wrapper').height(Math.max(200, $(window).height() - ($('.table_wrapper').offset().top + 60))+'px'); // magic number to get list height right
		}

		function submit_value_selector($this) {

			var section = $this.find("input[name='section']").val();
			var id = $this.find("input[name='id']").val();
			var selected_ids = new Array;
			var selected = $this.find('select :selected');
			for (var j = 0; j < selected.length; j++) {
				selected_ids.push($(selected[j]).val());
			}
			var post = {'id':id, 'selected_ids':selected_ids, 'multi':1};
			$.post('api/'+section, post, function(data) {
				var element = $('#'+section+'_'+id);
				element.find('span, br').remove();
				for (var j = 0; j < data.length; j++) {
					var rel_id = data[j].id;
					var title = data[j].title;
					var relationship = data[j].relationship;
					var span = $('<span id="'+rel_id+'">'+title+'</span>');
					element.prepend(span);
					if ('undefined'!=typeof(relationship)) {
						span.append(' ('+relationship+')');
						span.append(' <span style="color:red;font-weight:bold">*</span>');
						span.after('<br />');
					}
				}
				$this.parent().hide();
			});

		}
		</script>

		<? if (isset($_GET['error']) && $_GET['error']==1): ?>
		<div class="error" style="max-width:none; margin-bottom:16px;">Title is a required field<a style="float:right;" href="?book_id=<?=((isset($book->book_id))?$book->book_id:0)?>&zone=all-books#tabs-all-books">clear</a></div>
		<? endif; ?>
		<? if (isset($_REQUEST['action']) && 'deleted'==$_REQUEST['action']): ?>
		<div class="saved" style="max-width:none; margin-bottom:16px;">
		<a style="float:right;" href="?zone=all-books#tabs-all-books">clear</a>
		Book has been deleted
		</div>
		<? endif ?>
		<? if (isset($_REQUEST['action']) && 'added'==$_REQUEST['action']): ?>
		<div class="saved" style="max-width:none; margin-bottom:16px;">
		<a style="float:right;" href="?zone=all-books#tabs-all-books">clear</a>
		Book has been added and is present in the list below
		</div>
		<? endif ?>

		<form style="margin:10px 0px 18px 0px; white-space:nowrap;" action="<?=confirm_slash(base_url())?>main/dashboard#tabs-all-books" method="post">
		<input type="hidden" name="zone" value="all-books" />
		<input type="hidden" name="action" value="do_add_book" />
		<span style="float:left; margin-right:6px;">Add new book:</span>
		<input type="text" name="title" value="" placeholder="Title" style="width:200px;float:left;" />
		<input type="text" name="subtitle" value="" placeholder="Subtitle" style="width:200px;float:left;margin-left:8px;" />
		<select name="user_id" style="font-size:12px; float:left; margin-left:8px; margin-right:8px; padding-top:1px; padding-bottom:0px; max-width:200px;">
			<option value="0">Initial author</option>
		<? foreach ($users as $user): ?>
			<option value="<?=$user->user_id?>"><?=$user->fullname?></option>
		<? endforeach ?>
		</select>
		<input type="submit" value="Add" style="padding:3px 8px 1px 8px !important; float:left;" class="generic_button default" />
		<br clear="both" />
		</form>

		<div class="table_wrapper">
		<table cellspacing="0" cellpadding="0" class="tablesorter">
			<thead>
				<tr class="head">
					<th></th>
					<th style="display:none;">ID</th>
					<th style="display:none;">Book Id</th>
					<th style="white-space:nowrap;">Title</th>
					<th style="white-space:nowrap;">Subtitle</th>
					<!--<th style="white-space:nowrap;">Description</th>-->
					<th style="white-space:nowrap;">URI</th>
					<th style="white-space:nowrap;">Public</th>
					<th style="white-space:nowrap;">In index</th>
					<th style="white-space:nowrap;">Featured</th>
					<th style="white-space:nowrap;">Contributors</th>
					<th style="white-space:nowrap;">Created</th>
				</tr>
			</thead>
			<tbody>
<?
		if (!empty($books)) {
			$count = count($books);
			for($i=0;$i<$count;$i++) {
				$desc_excerpt = create_excerpt($books[$i]->description);
				if (strlen($books[$i]->description) == strlen($desc_excerpt)) $desc_excerpt = null;
				echo '<tr class="bottom_border" typeof="books">';
				echo '<td style="white-space:nowrap;">';
				echo '<a href="javascript:;" onclick="edit_row($(this).parents(\'tr\'));" class="generic_button">Edit</a> ';
				echo '<a href="javascript:;" onclick="window.location.href=\''.confirm_slash(base_url()).'main/dashboard?book_id='.$books[$i]->book_id.'&zone=style#tabs-style\';" class="generic_button">Dashboard</a> ';
				echo '<a style="color:#888888;" href="'.confirm_slash(base_url()).'main/dashboard?action=do_delete&delete='.$books[$i]->book_id.'&type=books&zone=all-books#tabs-all-books" onclick="if (!confirm(\'Are you sure you wish to DELETE this book and all associated content?\')) return false;" class="generic_button">Remove</a>';
				echo '</td>'."\n";
				echo '<td property="id" style="display:none;">'.$books[$i]->book_id."</td>\n";
				echo '<td property="book_id" style="display:none;">'.$books[$i]->book_id."</td>\n";
				echo '<td class="editable" property="title" style="width:100px;">'.$books[$i]->title."</td>\n";
				echo '<td class="editable" property="subtitle">'.$books[$i]->subtitle."</td>\n";
				/*if ($desc_excerpt) {
					echo '<td class="editable textarea excerpt" property="description"><span class="full">'.$books[$i]->description.'</span><span class="clip">'.$desc_excerpt.'</span></td>'."\n";
				} else {
					echo '<td class="editable textarea" property="description">'.$books[$i]->description.'</td>';
				}	*/
				echo '<td class="editable has_link uri_link" property="slug"><a href="'.confirm_slash(base_url()).$books[$i]->slug.'">'.$books[$i]->slug."</a></td>\n";
				echo '<td class="editable boolean" property="url_is_public">'.$books[$i]->url_is_public."</td>\n";
				echo '<td class="editable boolean" property="display_in_index">'.$books[$i]->display_in_index."</td>\n";
				echo '<td class="editable boolean" property="is_featured">'.$books[$i]->is_featured."</td>\n";
				echo '<td style="width=150px;" id="save_book_users_'.$books[$i]->book_id.'">';
				foreach ($books[$i]->users as $user) {
					echo '<span id="'.$user->user_id.'">'.$user->fullname.'</span>';
					if ($user->list_in_index) echo ' <span style="color:red;font-weight:bold">*</span>';
					echo '<br />';
				}
				echo '<p><a href="javascript:;" class="value_select_trigger multiple generic_button" resource="get_system_users" rel="save_book_users" style="white-space:nowrap;">Edit users</a></p>';
				echo "</td>\n";
				echo '<td style="white-space:nowrap;">'.date( 'M j, Y', strtotime($books[$i]->created) )."</td>\n";
				echo "</tr>\n";
			}
		}
?>
			</tbody>
		</table>
		</div>

		<div class="admin-nav-wrap">
		<?
			if((count($books)-1) != $total)
				$count = count($books);
			else
				$count = count($books)-1;
		?>
		<? if ($start !== 0 || (count($books)-1) == $total): ?>
		<? if($start !== 0): ?>
		<span class="prev"><a href="<?=confirm_slash(base_url())?>main/dashboard?zone=all-books&amp;start=<?=$start-$total?>&amp;total=<?=$total?>#tabs-all-books">Prev page</a></span>
		&nbsp;
		<? endif ?>
		<b class="total"><?=$start+1?> - <?=$start + $count?></b>
		<? if(count($books)-1 == $total): ?>
		 &nbsp;		<span class="next"><a href="<?=confirm_slash(base_url())?>main/dashboard?zone=all-books&amp;start=<?=$start+$total?>&amp;total=<?=$total?>#tabs-all-books">Next page</a></span>
		<? endif ?>
		<form style="display:inline-block" class="jump-form">
		 	<span>&nbsp;&nbsp;&nbsp;&nbsp;Go to page:</span>
		 	<input style="text-align:right" placeholder="<?=$start/$total+1?>" type="text" class="jump-to-page" size="2" />
		 </form>
		 &nbsp; &nbsp; &nbsp; &nbsp;
		<? endif ?>
		<form class="book-search-form">
		 	<input placeholder="Search for a book" type="text" class="book-search" size="20" />
			<input type="submit" value="Search" class="generic_button" style="padding:3px 8px 1px 8px !important; vertical-align:top;" />
			<?=(isset($_REQUEST['id']) && is_numeric($_REQUEST['id'])) ? ' &nbsp; Showing book ID '.$_REQUEST['id'].' &nbsp; ' : ''?>
			<a href="<?=confirm_slash(base_url())?>main/dashboard?zone=all-books&amp;start=<?=$start?>&amp;total=<?=$total?>#tabs-all-books">clear</a>
		 </form>
		</div>
