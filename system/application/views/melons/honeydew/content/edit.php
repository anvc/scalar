<?
$page = (isset($page->version_index)) ? $page : null;
$version = (isset($page->version_index)) ? $page->versions[$page->version_index] : null;
?>

<? if (@$_GET['action'] == 'saved'): ?>
<div class="saved"><p>Resource has been saved.&nbsp;  (<a href="<?=@$uri?>">View resource</a>)</p></div>
<? endif ?>
<? if (isset($save_error)): ?>
<div class="error"><p><?=$save_error?></p></div>
<? endif ?>
<div class="error" id="ie_warning" style="display:none;"><p>You appear to be using Internet Explorer, which has known compatibility problems with some parts of the edit page including the WYSIWYG content editor. For the best experience please switch to Firefox or Safari.</p></div>

<h4 class="content_title"><?=(!empty($page))?'Edit':'Add'?> <?
	switch ($user_level) {
		case 'Commentator':
			echo 'commentary';
			break;
		case 'Reviewer':
			echo 'review';
			break;
		default:
			echo 'content';
	}
?></h4>

<?
if ('cantaloupe' == $book->template) {
	echo('<form id="edit_form" method="post" enctype="multipart/form-data" onsubmit="return validate_form($(this), true);">');
} else {
	echo('<form id="edit_form" method="post" enctype="multipart/form-data" onsubmit="return validate_form($(this), false);">');
}
?>
<input type="hidden" name="action" value="<?=(isset($page->version_index))?'update':'add'?>" />
<input type="hidden" name="native" value="1" />
<input type="hidden" name="scalar:urn" value="<?=(isset($page->version_index)) ? $page->versions[$page->version_index]->urn : ''?>" />
<input type="hidden" name="id" value="<?=@$login->email?>" />
<input type="hidden" name="api_key" value="" />
<?if (!isset($page->version_index)): ?>
<input type="hidden" name="scalar:child_urn" value="<?=$book->urn?>" />
<input type="hidden" name="scalar:child_type" value="http://scalar.usc.edu/2012/01/scalar-ns#Book" />
<input type="hidden" name="scalar:child_rel" value="page" />
<? endif ?>
<input type="hidden" name="urn:scalar:book" value="<?=$book->urn?>" />
<?
// Commit message (if applicable)
if (@$_GET['commit']):
	echo '<div class="category_description">';
	echo 'After a final review, commit these changes by saving again';
	echo '<a style="float:right;margin-top:-2px;" href="javascript:;" class="generic_button large" onclick="$(this).closest(\'form\').submit();">Save changes</a>';
	echo '</div>';
endif;
?>

<table id="page_fields" class="form_fields">

	<tr>
	  <td class="field">Title</td><td class="value"><input type="text" id="title" class="input_text" name="dcterms:title" value="<?=@htmlspecialchars($version->title)?>" /></td>
	<tr>
	  <td class="field">Description</td><td class="value"><input type="text" class="input_text" name="dcterms:description" value="<?=@htmlspecialchars($version->description)?>" /></td>
	</tr>	

	<!--  Media file URL -->
	<tr class="type_media">
		<td class="field">Media File URL</td><td><input name="scalar:url" value="<?=(!empty($file_url))?$file_url:'http://'?>" style="width:100%;" onfocus="if (this.value=='http://') this.value='';" /></td>
	</tr>

	<!-- Edit content -->
	<tr id="edit_content" class="type_composite">
		<td colspan="2">
			<?
				if ($book->template == 'cantaloupe') {
					echo('<p>This book is set up to use an experimental new reading interface for Scalar which is still in development and may not implement all of Scalar\'s features. If you wish to view any page in the standard interface, simply add <code>?template=honeydew</code> to the end of its URL and reload the page. <a href="mailto:alliance4nvc@gmail.com?subject=New%20Scalar%20interface%20feedback">Feedback</a> is welcomed.</p>');
				}
			?>
			<br />
			<div class="wysiwyg_options"><span><a href="javascript:;" class="textarea_tab wysiwyg_handle_selected to_wysiwyg_handle" title="In the editor, view a visual representation of the HTML">Visual</a>&nbsp;<a href="javascript:;" class="textarea_tab to_html_handle" title="In the editor, view the source HTML">HTML</a></span><br clear="both"></div>
			<textarea class="wysiwyg input_textarea input_gap textarea_content" wrap="soft" name="sioc:content"><?
			if (isset($page->version_index)):
				$content = $page->versions[$page->version_index]->content;
				if (!empty($content)) {
					//$content = fix_latin($content);
					//$content = utf8_encode($content);
					echo cleanbr(htmlspecialchars($content));
				}
			endif;
			?></textarea>
			<br />
			<?
				if ($book->template == 'cantaloupe') {
					echo('<p>You can manually edit Scalar media links in the HTML tab above to <strong>change the size and layout of the embedded media.</strong> Scalar media links have this format: <code>&lt;a href="[media url]" resource="[media url title]" rel="[version id]"&gt;.</code> You can identify the link you\'re looking for by where it appears in the text.</p><p>Add the <code>data-size=""</code> parameter to change the size of the media; possible values are <code>small</code>, <code>medium</code>, <code>large</code>, and <code>full</code>.</p><p>Add the <code>data-align=""</code> parameter to change the position of the media; possible values are <code>left</code> and <code>right</code>.</p><p>A link that specified both values would look like this: <code>&lt;a href="[media url]" resource="[media url title] rel="[version id]" data-size="small" data-align="left"&gt;</code>. A future version of Scalar will provide a graphical interface for specifying these settings.</p>');
				}
			?>
		</td>
	</tr>

	<!--  default view -->
	<tr id="default_view" class="type_composite">
	  <td class="field field_middle spacer">Default view</td>
	  <td class="spacer" valign="middle"><select name="scalar:default_view" class="generic_button large" id="default_view_select"><?
			foreach ($page_views as $view_slug => $view_name) {
				echo '<option value="'.$view_slug.'" ';
				if (isset($page->version_index) && $page->versions[$page->version_index]->default_view==$view_slug) echo ' SELECTED';
				echo '>';
				echo $view_name;
				echo '</option>'."\n";
			}
			?></select>
		</td>
	</tr>

	<!-- relationships -->
	<tr id="relationships">
		<td class="field" valign="top"><div class="field_bump_down">Relationships</div></td>
		<td valign="top">
		
			<table class="form_fields">
			
			  <!-- paths -->
			  <tr id="tr_container_of">
			    <td valign="top"><span class="inline_icon_link path"></span></td>
			    <td valign="top"><?
			if (empty($page) || empty($page->versions[$page->version_index]->path_of)) {
				echo '<span id="path_msg"><b>To make this <span class="content_type">page</span> a path</b>, <a href="javascript:void(null);" onclick="listeditor_add($(this).parent().parent().find(\'#container_of_editor\'), \'add_path_item\')">specify the items that it contains</a></span><br />'."\n";
			} else {
				echo '<span id="path_msg"><b>This <span class="content_type">page</span> is also a path</b> which contains:</span><br />'."\n";
			}
			echo '      <ol id="container_of_editor" class="edit_relationship_list sortable">'."\n";
			if (!empty($page)&&!empty($page->versions[$page->version_index]->path_of)) {
				foreach ($page->versions[$page->version_index]->path_of as $node) {
					$title = $node->versions[0]->title;
					$rel_uri = $base_uri.$node->slug;
					echo '      <li>';
					echo '<input type="hidden" name="container_of" value="'.$node->versions[0]->urn.'" />';
					echo $title;
					echo '&nbsp; <span class="remove">(<a href="javascript:;" onclick="if (confirm(\'Are you sure you wish to remove this relationship?\')) $(this).closest(\'li\').remove();">remove</a>)</span>';
					echo '</li>'."\n";
				}
			}
			echo "      </ol>\n";
			?>
			      <div class="form_fields_sub_element" id="container_of_add_content" style="display:none;"><a class="generic_button border_radius" onclick="listeditor_add($(this).parent().parent().find('#container_of_editor'), 'add_path_item')">Add more content</a> or drag items to reorder</div>
			     
			      <div class="form_fields_sub_element form_fields_sub_element_border_top form_fields_sub_element_border_bottom" id="path_continue_to" style="display:none;margin-top:12px;">After path is completed, continue to <input type="hidden" name="scalar:continue_to_content_id" value="<?=((!empty($continue_to))?$continue_to->content_id:'')?>" /><span style="font-weight:bold"><?=((!empty($continue_to))?$continue_to->versions[$continue_to->version_index]->title:'none')?></span>&nbsp; <a href="javascript:;" onclick="listeditor_add(null,'add_continue_to', null, false, true)">add</a> | <a href="javascript:" onclick="clear_continue_to();">clear</a></div>
			
			<? if (!empty($page)&&!empty($page->versions[$page->version_index]->has_paths)): ?>
				  <div id="has_path">
			        <b>This page is contained by</b> the following paths:<br />
			        <ul class="edit_relationship_list">
			<?
				foreach ($page->versions[$page->version_index]->has_paths as $node) {
					$title = $node->versions[0]->title;
					$rel_uri = $base_uri.$node->slug;
					$rel_sort_number = 0;
					$count = 1;
					foreach ($node->versions[0]->path_of as $path_of) {
						if ($path_of->content_id == $page->content_id) {
							$rel_sort_number = $count;
							break;
						}
						$count++;
					}
					echo '<li>';
					echo '<input type="hidden" name="has_container" value="'.$node->versions[0]->urn.'" />';
					echo '<input type="hidden" name="has_container_sort_number" value="'.$rel_sort_number.'" />';
					echo '<a class="rel_link" href="'.$rel_uri.'" title="'.$rel_uri.'">'.$title.'</a> (page '.$rel_sort_number.')';
					echo '&nbsp; <span class="remove">(<a href="javascript:;" onclick="if (confirm(\'Are you sure you wish to remove this relationship?\')) $(this).closest(\'li\').remove();">remove</a>)</span>';
					echo '</li>';
				}
			?>	  
			        </ul>
			      </div>
			<? endif ?>   
			    </td>
			  </tr>
			
			  <!-- replies -->
			  <tr id="tr_reply_of">
			    <td valign="top"><span class="inline_icon_link reply"></span></td>
			    <td valign="top"><?
			if (empty($page) || empty($page->versions[$page->version_index]->reply_of)) {
				echo '<span id="reply_msg"><b>To make this <span class="content_type">page</span> a comment</b>, <a href="javascript:void(null);" onclick="listeditor_add($(this).parent().parent().find(\'#reply_of_editor\'), \'add_reply_of_item\')">specify the items that it comments on</a></span><br />'."\n";
			} else {
				echo '<span id="reply_msg"><b>This <span class="content_type">page</span> is also a comment</b> which comments on:</span><br />'."\n";
			}
			echo '      <ul id="reply_of_editor" class="edit_relationship_list">'."\n";
			if (!empty($page)&&!empty($page->versions[$page->version_index]->reply_of)) {
				foreach ($page->versions[$page->version_index]->reply_of as $node) {
					$title = $node->versions[0]->title;
					$rel_slug = $base_uri.$node->slug;
					echo '      <li>';
					echo '<input type="hidden" name="reply_of" value="'.$node->versions[0]->urn.'" />';
					echo '<input type="hidden" name="reply_of_paragraph_num" value="'.$node->versions[0]->paragraph_num.'" />';
					echo '<input type="hidden" name="reply_of_datetime" value="'.$node->versions[0]->datetime.'" />';
					echo '<a class="rel_link" href="'.$rel_slug.'" title="'.$rel_slug.'">'.$title.'</a> ('.date("j F Y", strtotime($node->versions[0]->datetime)).')&nbsp; ';
					echo '<span class="remove">(<a href="javascript:;" onclick="if (confirm(\'Are you sure you wish to remove this relationship?\')) $(this).closest(\'li\').remove();">remove</a>)</span>';
					echo '</li>'."\n";
				}
			}
			echo "      </ul>\n";
			?>
			      <div class="form_fields_sub_element" id="reply_of_add_content" style="display:none;"><a class="generic_button border_radius" onclick="listeditor_add($(this).parent().parent().find('#reply_of_editor'), 'add_reply_of_item')">Add more content</a></div>
			<? if (!empty($page)&&!empty($page->versions[$page->version_index]->has_replies)): ?>
			 	  <div id="has_reply">
			      	<b>This <span class="content_type">page</span> is commented on by</b> the following comments:<br />
			      	<ul class="edit_relationship_list">
			<?
				foreach ($page->versions[$page->version_index]->has_replies as $node) {
					$title = $node->versions[0]->title;
					$rel_slug = $base_uri.$node->slug;
					echo' <li resource="'.$node->slug.'">';
					echo '<input type="hidden" name="has_reply" value="'.$node->versions[$node->version_index]->urn.'" />';
					echo '<input type="hidden" name="has_reply_paragraph_num" value="'.$node->versions[$node->version_index]->paragraph_num.'" />';
					echo '<input type="hidden" name="has_reply_datetime" value="'.$node->versions[$node->version_index]->datetime.'" />';
					echo '<a class="rel_link" href="'.$rel_slug.'" title="'.$rel_slug.'">'.$title.'</a> ('.date("j F Y", strtotime($node->versions[$node->version_index]->datetime)).')';
					echo '&nbsp; <span class="remove">(<a href="javascript:;" onclick="if (confirm(\'Are you sure you wish to remove this relationship?\')) $(this).closest(\'li\').remove();">remove</a>)</span>';
					echo '</li>';
				}
			?>	  
			      	</ul>
			      </div>
			<? endif ?>   
			    </td>
			  </tr>    
			
			  <!-- annotations -->
			  <tr id="tr_annotation_of">
			    <td valign="top"><span class="inline_icon_link annotation"></span></td>
			    <td valign="top">
			    <div id="annotation_of">
			    <?
				if (empty($page) || empty($page->versions[$page->version_index]->annotation_of)) {
					echo '<span id="annotation_msg"><b>To make this <span class="content_type">page</span> an annotation</b>, <a href="javascript:void(null);" onclick="listeditor_add($(this).parent().parent().find(\'#annotation_of_editor\'), \'add_annotation_of_item\', \'media\', true)">specify media that it annotates</a></span>'."\n";
				} else {
					echo '<span id="annotation_msg"><b>This <span class="content_type">page</span> is also a annotation</b> which annotates:</span><br />'."\n";
				}    
				echo '      <ul id="annotation_of_editor" class="edit_relationship_list">'."\n";
				if (!empty($page)&&!empty($page->versions[$page->version_index]->annotation_of)) {
					foreach ($page->versions[$page->version_index]->annotation_of as $node) {
						$title = $node->versions[0]->title;
						$rel_slug = $base_uri.$node->slug;
						echo '      <li>';
						echo '<input type="hidden" name="annotation_of" value="'.$node->versions[0]->urn.'" />';		
						echo '<a class="rel_link" href="'.$rel_slug.'" title="'.htmlspecialchars($rel_slug).'">'.$title.'</a><br />';
						if (!empty($node->versions[0]->start_seconds) || !empty($node->versions[0]->end_seconds)) {
							echo 'Start seconds: <input onblur="check_start_end_values(this, $(this).nextAll(\'input:first\'))" type="text" style="width:75px;" name="annotation_of_start_seconds" value="'.$node->versions[0]->start_seconds.'" />';
							echo '&nbsp; End seconds<input onblur="check_start_end_values($(this).prevAll(\'input:first\'), this)" type="text" style="width:75px;" name="annotation_of_end_seconds" value="'.$node->versions[0]->end_seconds.'" />';				
							echo '<input type="hidden" name="annotation_of_start_line_num[]" value="'.@$node->versions[0]->start_line_num.'" />';	
							echo '<input type="hidden" name="annotation_of_end_line_num[]" value="'.@$node->versions[0]->end_line_num.'" />';	
							echo '<input type="hidden" name="annotation_of_points[]" value="'.@$node->versions[0]->points.'" />';
						} elseif (!empty($node->versions[0]->start_line_num) || !empty($node->versions[0]->end_line_num)) {
							echo 'Start line #: <input  onblur="check_start_end_values(this, $(this).nextAll(\'input:first\'))" type="text" style="width:75px;" name="annotation_of_start_line_num" value="'.$node->versions[0]->start_line_num.'" />';
							echo '&nbsp; End line #<input onblur="check_start_end_values($(this).prevAll(\'input:first\'), this)" type="text" style="width:75px;" name="annotation_of_end_line_num" value="'.$node->versions[0]->end_line_num.'" />';	
							echo '<input type="hidden" name="annotation_of_start_seconds" value="'.@$node->versions[0]->start_seconds.'" />';	
							echo '<input type="hidden" name="annotation_of_end_seconds" value="'.@$node->versions[0]->end_seconds.'" />';	
							echo '<input type="hidden" name="annotation_of_points" value="'.@$node->versions[0]->points.'" />';
						} elseif (!empty($node->versions[0]->points)) {
							echo 'Left (x), Top (y), Width, Height: <input type="text" style="width:125px;" name="annotation_of_points" value="'.$node->versions[0]->points.'" />';
							echo '<input type="hidden" name="annotation_of_start_seconds" value="'.@$node->versions[0]->start_seconds.'" />';	
							echo '<input type="hidden" name="annotation_of_end_seconds" value="'.@$node->versions[0]->end_seconds.'" />';	
							echo '<input type="hidden" name="annotation_of_start_line_num" value="'.@$node->versions[0]->start_line_num.'" />';
							echo '<input type="hidden" name="annotation_of_end_line_num" value="'.@$node->versions[0]->end_line_num.'" />';
							echo '<br /><small>May be pixel or percentage values; for percentage add "%" after each value.</small>';
						}
						echo '&nbsp; <span class="remove">(<a href="javascript:;" onclick="if (confirm(\'Are you sure you wish to remove this relationship?\')) $(this).closest(\'li\').remove();">remove</a>)';
						echo '</span>';
						echo '</li>'."\n";
					}
				}
				echo "      </ul>\n";
			?>
				<div class="form_fields_sub_element" id="annotation_of_add_content" style="display:none;"><a class="generic_button border_radius" onclick="listeditor_add($(this).parent().parent().find('#annotation_of_editor'), 'add_annotation_of_item', 'media')">Annotate additional media</a></div>
				</div>
			<?
			   if (!empty($page)&&!empty($page->versions[$page->version_index]->has_annotations)): ?>
			
			      <div id="has_annotation">
			        <b>This <span class="content_type">page</span> is annotated by</b> the following annotations:<br />
			        <ul class="edit_relationship_list">
			<?
				foreach ($page->versions[$page->version_index]->has_annotations as $node) {
					$title = $node->versions[0]->title;
					$rel_slug = $base_uri.$node->slug;
					echo' <li resource="'.$node->slug.'">';
					echo '<input type="hidden" name="has_annotation" value="'.$node->versions[0]->urn.'" />';
					echo '<a class="rel_link" href="'.$rel_slug.'" title="'.htmlspecialchars($rel_slug).'">'.$title.'</a><br />';
					if (!empty($node->versions[0]->start_seconds) || !empty($node->versions[0]->end_seconds)) {
						echo 'Start seconds: <input type="text" style="width:75px;" name="has_annotation_start_seconds" value="'.$node->versions[0]->start_seconds.'" />';
						echo '&nbsp; End seconds<input type="text" style="width:75px;" name="has_annotation_end_seconds" value="'.$node->versions[0]->end_seconds.'" />';				
						echo '<input type="hidden" name="has_annotation_start_line_num" value="'.@$node->versions[0]->start_line_num.'" />';	
						echo '<input type="hidden" name="has_annotation_end_line_num" value="'.@$node->versions[0]->end_line_num.'" />';	
						echo '<input type="hidden" name="has_annotation_points" value="'.@$node->versions[0]->points.'" />';
					} elseif (!empty($node->versions[0]->start_line_num) || !empty($node->versions[0]->end_line_num)) {
						echo 'Start line #: <input type="text" style="width:75px;" name="has_annotation_start_line_num" value="'.$node->versions[0]->start_line_num.'" />';
						echo '&nbsp; End line #<input type="text" style="width:75px;" name="has_annotation_end_line_num" value="'.$node->versions[0]->end_line_num.'" />';	
						echo '<input type="hidden" name="has_annotation_start_seconds" value="'.@$node->versions[0]->start_seconds.'" />';	
						echo '<input type="hidden" name="has_annotation_end_seconds" value="'.@$node->versions[0]->end_seconds.'" />';	
						echo '<input type="hidden" name="has_annotation_points" value="'.@$node->versions[0]->points.'" />';
					} elseif (!empty($node->versions[0]->points)) {
						echo 'Left (x), Top (y), Width, Height: <input type="text" style="width:125px;" name="has_annotation_points" value="'.$node->versions[0]->points.'" />';
						echo '<input type="hidden" name="has_annotation_start_seconds" value="'.@$node->versions[0]->start_seconds.'" />';
						echo '<input type="hidden" name="has_annotation_end_seconds" value="'.@$node->versions[0]->end_seconds.'" />';	
						echo '<input type="hidden" name="has_annotation_start_line_num" value="'.@$node->versions[0]->start_line_num.'" />';	
						echo '<input type="hidden" name="has_annotation_end_line_num" value="'.@$node->versions[0]->end_line_num.'" />';
						echo '<br /><small>May be pixel or percentage values; for percentage add "%" after each value.</small>';
					}		
					echo '&nbsp; <span class="remove">(<a href="javascript:;" onclick="if (confirm(\'Are you sure you wish to remove this relationship?\')) $(this).closest(\'li\').remove();">remove</a>)</span>';
					echo '</li>';
				}
			?>	  
			       </ul>
			     </div>
			<? endif ?>   
			    </td>
			  </tr>  
			
			  <!-- tags -->
			  <tr id="tr_tag_of">
			    <td valign="top"><span class="inline_icon_link tag"></span></td>
			    <td valign="top">
			    	<div class="tag_of">
			    <?
			if (empty($page) || empty($page->versions[$page->version_index]->tag_of)) {
				echo '<span id="tag_msg"><b>To make this <span class="content_type">page</span> a tag</b>, <a href="javascript:void(null);" onclick="listeditor_add($(this).parent().parent().find(\'#tag_of_editor\'), \'add_tag_of_item\')">specify the items that it tags</a></span><br />'."\n";
			} else {
				echo '<span id="tag_msg"><b>This <span class="content_type">page</span> is also a tag</b> which tags:</span><br />'."\n";
			}
			echo '      <ul id="tag_of_editor" class="edit_relationship_list">'."\n";
			if (isset($page->version_index) && !empty($page->versions[$page->version_index]->tag_of)) {
				foreach ($page->versions[$page->version_index]->tag_of as $node) {
					$title = $node->versions[0]->title;
					$rel_uri = $base_uri.$node->slug;
					echo '      <li>';
					echo '<input type="hidden" name="tag_of" value="'.$node->versions[0]->urn.'" />';
					echo '<a class="rel_link" href="'.$rel_uri.'" title="">';
					echo $title;
					echo '</a>';
					echo '&nbsp; <span class="remove">(<a href="javascript:;" onclick="if (confirm(\'Are you sure you wish to remove this relationship?\')) $(this).closest(\'li\').remove();">remove</a>)</span>';
					echo '</li>'."\n";
				}
			}
			echo "      </ul>\n";
			?>
				<div class="form_fields_sub_element" id="tag_of_add_content" style="display:none;"><a class="generic_button border_radius" onclick="listeditor_add($(this).parent().parent().find('#tag_of_editor'), 'add_tag_of_item')">Tag additional content</a></div>
				</div>
				<div id="has_tag">
			<?
				if (empty($page) || empty($page->versions[$page->version_index]->has_tags)) {
					echo '<span id="has_tag_msg"><b>To tag this <span class="content_type">page</span>,</b> <a href="javascript:void(null);" onclick="listeditor_add($(this).parent().parent().find(\'#has_tag_editor\'), \'add_has_tag_item\', \'tag\')">specify items that tag it</a></span><br />'."\n";
				} else {
					echo '<span id="has_tag_msg"><b>This <span class="content_type">page</span> is tagged by</b> the following tags:</span><br />'."\n";
				}
			?>
				<ul id="has_tag_editor" class="edit_relationship_list">
			<?
				if (isset($page->version_index) && !empty($page->versions[$page->version_index]->has_tags)) {
					foreach ($page->versions[$page->version_index]->has_tags as $node):
						$title = $node->versions[$page->version_index]->title;
						$rel_uri = $base_uri.$node->slug;
						echo' <li>';
						echo '<input type="hidden" name="has_tag" value="'.$node->versions[$page->version_index]->urn.'" />';
						echo '<a class="rel_link" href="'.$rel_uri.'" title="'.$rel_uri.'">'.$title.'</a>';
						echo '&nbsp; <span class="remove">(<a href="javascript:;" onclick="if (confirm(\'Are you sure you wish to remove this relationship?\')) $(this).closest(\'li\').remove();">remove</a>)</span>';
						echo '</li>';
					endforeach;
				}
			?>	  
				</ul>
				
				<div class="form_fields_sub_element" id="has_tag_add_content" style="display:none;"><a class="generic_button border_radius" onclick="listeditor_add($(this).parent().parent().find('#has_tag_editor'), 'add_has_tag_item')">Add additional tags</a></div>
				</div>
			    </td>
			  </tr>
			</table>
		</td>
	</tr>	

  <!-- styling -->
  <tr id="styling">
  	<td class="field" valign="top"><a class="edit_page_arrow edit_page_arrow_down">Style</a></td>
  	<td valign="top">
  		<table cellspacing="0" cellpadding="0" class="styling_table">
  		<tr><!-- thumbnail -->
  			<td>Thumbnail</td>
  			<td><?=((@!empty($page->thumbnail))?'<img src="'.abs_url($page->thumbnail, $base_uri).'" class="thumb_preview" />':'No thumbnail image has been set')?></td>
  			<td class="styling_last"><select name="scalar:thumbnail"><option value="">Choose an uploaded image</option><?
  				$matched = false;
  				foreach ($book_images as $book_image_row) {
  					if (@$page->thumbnail==$book_image_row->versions[$book_image_row->version_index]->url) $matched = true;
  					$slug_version = get_slug_version($book_image_row->slug);
  					echo '<option value="'.$book_image_row->versions[$book_image_row->version_index]->url.'" '.((@$page->thumbnail==$book_image_row->versions[$book_image_row->version_index]->url)?'selected':'').'>'.$book_image_row->versions[$book_image_row->version_index]->title.((!empty($slug_version))?' ('.$slug_version.')':'').'</option>';
  				}
  				if (!$matched) {
  					echo '<option value="'.@$page->thumbnail.'" selected>'.@$page->thumbnail.'</option>';
  				}
  			?></select></td>
  		</tr>
  		<tr class="styling_sub"><!-- color -->
  			<td>Color<br /><small>e.g., for path nav bar</small></td>
  			<td><input style="width:100%;" type="text" id="color_select" name="scalar:color" value="<?=(!empty($page->color))?$page->color:'#ffffff'?>" /></td>
  			<td class="styling_last">
  				 <a href="javascript:;" class="generic_button" onclick="$(this).next().toggle();">Choose</a>
  				<div style="display:none;margin-top:6px;"><div id="colorpicker"></div></div>
  			</td>
  		</tr>  	
  		<tr class="styling_sub"><!-- background image -->
  			<td>Background image</td>
  			<td><?=((@!empty($page->background))?'<img src="'.confirm_slash(base_url()).confirm_slash($book->slug).$page->background.'" class="thumb_preview" />':'No background image has been set')?></td>
  			<td class="styling_last"><select name="scalar:background"><option value="">Choose an uploaded image</option><?
  				$matched = false;
  				foreach ($book_images as $book_image_row) {
  					if (@$page->background==$book_image_row->versions[$book_image_row->version_index]->url) $matched = true;
  					$slug_version = get_slug_version($book_image_row->slug);
  					echo '<option value="'.$book_image_row->versions[$book_image_row->version_index]->url.'" '.((@$page->background==$book_image_row->versions[$book_image_row->version_index]->url)?'selected':'').'>'.$book_image_row->versions[$book_image_row->version_index]->title.((!empty($slug_version))?' ('.$slug_version.')':'').'</option>';
  				}
  				if (!$matched) {
  					echo '<option value="'.@$page->background.'" selected>'.@$page->background.'</option>';
  				}
  			?></td>
  		</tr>	
  		<tr class="styling_sub"><!-- custom style -->
   			<td style="position:relative;">
   				Custom CSS style<br />
   				<small>e.g., .cover_title {color:red;}</small><div style="height:6px;overflow:hidden;"></div>
   			</td>
  			<td colspan="2"><textarea name="scalar:custom_style" style="width:100%;height:50px;"><?=!empty($page->custom_style) ? $page->custom_style : ''?></textarea></td>
  		</tr>  	
  		<tr class="styling_sub">
   			<td style="position:relative;">
   				Custom Javascript
   				<div style="width:150px;white-space:normal;"><small>Javascript or jQuery source</div>
   			</td>
  			<td colspan="2"><textarea name="scalar:custom_scripts" style="width:100%;height:50px;"><?=!empty($page->custom_scripts) ? $page->custom_scripts : ''?></textarea></td>
  		</tr>  		
  		<tr class="styling_sub"><!-- background audio -->
  			<td>Background audio</td>
  			<td><?=((@!empty($page->audio))?basename($page->audio):'No background audio has been set')?></td>
  			<td class="styling_last"><select name="scalar:audio"><option value="">Choose an uploaded audio</option><?
  			  	$matched = false;
  				foreach ($book_audio as $book_audio_row) {
  					if (@$page->audio==$book_audio_row->versions[$book_audio_row->version_index]->url) $matched = true;
  					$slug_version = get_slug_version($book_audio_row->slug);
  					echo '<option value="'.$book_audio_row->versions[$book_audio_row->version_index]->url.'" '.((@$page->audio==$book_audio_row->versions[$book_audio_row->version_index]->url)?'selected':'').'>'.$book_audio_row->versions[$book_audio_row->version_index]->title.((!empty($slug_version))?' ('.$slug_version.')':'').'</option>';
  				}
  				if (!$matched) {
  					echo '<option value="'.@$page->audio.'" selected>'.@$page->audio.'</option>';
  				} 			
  			?></td>
  		</tr>   	
  		</table>  			
  	</td>
  </tr>

	<!--  meta -->
	<tr id="add_meta">
	  <td class="field" valign="top"><a class="edit_page_arrow edit_page_arrow_down">Metadata</a></td>
	  <td valign="top">
	  
		<table id="page_meta">
			<tr>
			  <td class="field">Scalar URL</td>
			  <td><?=$base_uri?><input name="scalar:slug" value="<?=$page_url?>" style="width:210px;" id="slug" /><? if (empty($page_url)) echo '<span style="white-space:nowrap;">&nbsp; (will auto-generate)</span>';?></td>
			</tr>
			<? if (@!empty($page->versions[$page->version_index]->attribution->fullname)): ?>
			<tr>
			  <td class="field">Attribution</td>
			  <td><input class="input_text" name="scalar:fullname" value="<?=htmlspecialchars($page->versions[$page->version_index]->attribution->fullname)?>" style="width:180px;"/>&nbsp; &nbsp; <small style="white-space:nowrap;">Alerts readers that page is by someone other than the book's authors (e.g. comments)</small></td>
			</tr>
			<? endif ?>
			
			<tr>
				<td>Page visibility?</td>
			    <td><select name="scalar:is_live"><option value="0" <?=((@!$page->is_live)?'selected':'')?>>Hidden</option><option value="1" <?=(!isset($page->version_index)||(@$page->is_live)?'selected':'')?>>Visible</option></select></td>
			</tr>			
			
			  <tr>
			  <td class="field">Content type</td>
			  <td>
			    <span style="display:none;"><!-- jQuery uses these fields to show/hide form fields related to page or media -->
			   	 	<input type="radio" name="rdf:type" id="type_text" onchange="checkTypeSelect()" value="http://scalar.usc.edu/2012/01/scalar-ns#Composite"<?=((!isset($page->type)||$page->type=='composite')?' CHECKED':'')?>><label for="type_text">Page</label>
			    	<input type="radio" name="rdf:type" id="type_media" onchange="checkTypeSelect()" value="http://scalar.usc.edu/2012/01/scalar-ns#Media"<?=((isset($page->type)&&$page->type!='composite')?' CHECKED':'')?>><label for="type_media">Media File</label>
			    	&nbsp; &nbsp; 
			    </span>
			    <select name="scalar:category">
			<?
				$category =@ (!empty($page->category)) ? $page->category : null;
				if (empty($category) && $is_new) {
					if (strtolower($user_level)=='commentator') $category = 'commentary';
					if (strtolower($user_level)=='reviewer') $category = 'review';
				}
			  	echo '<option value="" '.((empty($category))?'selected':'').'>'.@ucwords($book->scope).' content</option>';
			  	echo '<option value="commentary" '.(('commentary'==$category)?'selected':'').'>Commentary</option>';
			  	echo '<option value="review" '.(('review'==$category)?'selected':'').'>Review</option>';  		
			?>
			    </select>
			    <!--
			    <span style="padding-left:40px;">Page creator</span>
			    <span style="padding-left:16px;"><select name="page_creator"><option value="0" <?=((@$page->user==0)?'selected':'')?>>Anonymous</option>
			<?
			    $page_creator = false;
				foreach ($book->contributors as $contributor) {
					if (@$page->user==$contributor->user_id) $page_creator = true;
					echo '<option value="'.$contributor->user_id.'" '.((@$page->user==$contributor->user_id)?'selected':'').'>'.$contributor->fullname.'</option>';
				}
				if (!$page_creator && isset($page->user) && !empty($page->user)) {  // Could be created by someone not attached to the book
					echo 'option value="'.$page->user.'">'.$page->fullname.'</option>';
				}
			?>
			    </select></span>
			    -->
			  </td>
		   </tr>  			
		</table>	  
	  
	  	<table id="metadata_rows">
		<?
		if (isset($page->version_index) && isset($page->versions[$page->version_index]->rdf) && !empty($page->versions[$page->version_index]->rdf)):
			foreach ($page->versions[$page->version_index]->rdf as $p => $values):
				$p = toNS($p, $ns);
				foreach ($values as $value) {	
					echo '<tr class="'.$p.'">';
					echo '<td class="field">';
					echo $p;
					echo '</td>';
					echo '<td class="value">';				
					$o = trim($value['value']);
					echo '<input type="text" name="'.$p.'" class="input_text" value="'.htmlspecialchars($o).'" />';
					echo '</td>';
					echo "</tr>\n";
				}			
			endforeach;
		endif;
		?>	  
		</table>
	  
		<div class="pulldown pulldown_click" style="width:190px;">
			  <a href="javascript:;" class="generic_button border_radius">Add additional metadata</a>
			  <ul class="pulldown-content nodots" style="width:600px;white-space:normal;line-height:150%;">	
<?
				foreach ($ontologies as $ont => $ontterms):
?>
				<li style="color:black;"><?=strtoupper($ont)?></li>
				<li>
<?
				$terms = array();
				foreach ($ontterms as $p) {
					$terms[] = '<a href="javascript:;" onclick="add_meta_row(\''.$ont.':'.$p.'\')" title="'.$ont.':'.$p.'">'.$p.'</a>';
				}
				echo implode(', &nbsp; ',$terms);
?>
				</li>	
<?
				endforeach;
?>						
			  </ul>
		</div>
		
	  </td>
	</tr>

</table>

<div style="text-align:right;margin-top:10px;">
	<div id="spinner_wrapper" style="width:30px;display:inline-block;">&nbsp;</div>
	<a href="javascript:;" class="generic_button large" onclick="if (confirm('Are you sure you wish to cancel edits?  Any unsaved data will be lost.')) {document.location.href='<?=$base_uri?><?=@$page->slug?>'} else {return false;}">Cancel</a> 
	<input type="submit" class="generic_button large default" value="Save" />
 </div>
<br />

<? 
if (isset($page->version_index)):
	// Has references 
	if (!empty($page->versions[$page->version_index]->has_references)) {
		foreach ($page->versions[$page->version_index]->has_references as $node) {
			echo '<input type="hidden" name="has_reference" value="'.$node->versions[0]->urn.'" />';
			echo '<input type="hidden" name="has_reference_reference_text" value="'.htmlspecialchars(@$node->versions[0]->reference_text).'" />';
		}
	}
	// Table of Contents
	echo '<input type="hidden" name="scalar:sort_number" value="'.$page->versions[$page->version_index]->sort_number.'" />';
endif;
?> 

</form>




