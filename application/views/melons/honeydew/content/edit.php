<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_css('application/views/melons/honeydew/content/edit.css')?>
<?$this->template->add_css('application/views/melons/honeydew/jquery-ui.min.css')?>
<?$this->template->add_css('application/views/widgets/wysiwyg/jquery.wysiwyg.css')?>
<?$this->template->add_css('application/views/widgets/spectrum/spectrum.css')?>
<?$this->template->add_css('application/views/widgets/edit/content_selector.css')?>
<?$this->template->add_css('application/views/widgets/tablesorter/style.css')?>
<?$this->template->add_js('application/views/melons/honeydew/content/edit.js')?>
<?$this->template->add_js('application/views/melons/honeydew/jquery-ui.min.js')?>
<?$this->template->add_js('application/views/widgets/wysiwyg/jquery.wysiwyg.js')?>
<?$this->template->add_js('application/views/widgets/edit/jquery.select_view.js')?>
<?$this->template->add_js('application/views/widgets/edit/jquery.add_metadata.js')?>
<?$this->template->add_js('application/views/widgets/edit/jquery.content_selector.js')?>
<?$this->template->add_js('application/views/widgets/tablesorter/jquery.tablesorter.min.js')?>
<?$this->template->add_js('application/views/widgets/spectrum/spectrum.js')?>
<?$this->template->add_js('application/views/widgets/spinner/spin.min.js')?>
<?
if ($this->config->item('reference_options')) {
	$this->template->add_js('var reference_options='.json_encode($this->config->item('reference_options')), 'embed');
}
$this->template->add_js('var views='.json_encode($views), 'embed');
?>
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
<div id="style-confirm" title="Extra HTML Tags">
You have HTML tags included in the Custom CSS box. Adding HTML to this box will cause style errors which may cause problems with your Scalar book. Note that &lt;style&gt; and &lt;/style&gt; tags are automatically included by Scalar.
</div>
<div id="script-confirm" title="Extra HTML Tags">
You have HTML tags included in the Custom JS box. Adding HTML to this box will cause Javascript errors which may cause problems with your Scalar book. Note that &lt;script&gt; and &lt;/script&gt; tags are automatically included by Scalar.
</div>
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
<input type="hidden" name="path" value="<?=(isset($_GET['path']))?trim($_GET['path']):''?>" />
<?
// Commit message (if applicable)
if (@$_GET['commit']):
	echo '<div class="category_description">';
	echo 'After a final review, commit these changes by saving again';
	echo '<a style="float:right;margin-top:-2px;" href="javascript:;" class="generic_button large" onclick="$(this).closest(\'form\').trigger(\'submit\');">Save changes</a>';
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
	<? if (isset($page) && $this->versions->url_is_local($page->versions[0]->url)): ?>
	<tr class="type_media">
		<td class="field"></td><td>File can be replaced with another upload at <a href="<?=confirm_slash(base_url()).$book->slug?>/upload#replace=<?=$version->version_id?>">Import > Local Media Files</a></td>
	</tr>
	<? endif ?>

	<!-- Edit content -->
	<tr id="edit_content" class="type_composite">
		<td colspan="2">
			<br />
			<div class="wysiwyg_options"><span><a href="javascript:;" class="textarea_tab wysiwyg_handle_selected to_wysiwyg_handle" title="In the editor, view a visual representation of the HTML">Visual</a>&nbsp;<a href="javascript:;" class="textarea_tab to_html_handle" title="In the editor, view the source HTML">HTML</a></span><br clear="both"></div>
			<textarea class="wysiwyg input_textarea input_gap textarea_content <?=$book->template?>" wrap="soft" name="sioc:content"><?
			if (isset($page->version_index)):
				$content = $page->versions[$page->version_index]->content;
				if (!empty($content)) {
					//$content = fix_latin($content);
					//$content = utf8_encode($content);
					echo cleanbr(htmlspecialchars($content));
				}
			endif;
			?></textarea>
		</td>
	</tr>

	<!--  default view + components-->
	<tr id="select_view" class="type_composite">
	  <td class="field" valign="top" style="padding-top:10px;">Layout</td>
	  <td valign="top"></td>
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
				echo '<span class="path_of_msg"><b>To make this <span class="content_type">page</span> a path</b>, <a href="javascript:void(null);">specify the items that it contains</a></span><br />'."\n";
			} else {
				echo '<span class="path_of_msg"><b>This <span class="content_type">page</span> is also a path</b> which contains:</span><br />'."\n";
			}
			echo '      <ol id="path_of" class="edit_relationship_list sortable">'."\n";
			if (!empty($page)&&!empty($page->versions[$page->version_index]->path_of)) {
				foreach ($page->versions[$page->version_index]->path_of as $node) {
					$title = $node->versions[0]->title;
					$rel_uri = $base_uri.$node->slug;
					echo '      <li>';
					echo '<input type="hidden" name="container_of" value="'.$node->versions[0]->urn.'" />';
					echo $title;
					echo '&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span>';
					echo '</li>'."\n";
				}
			}
			echo "      </ol>\n";
			?>
			      <div class="form_fields_sub_element path_of_msg" style="display:none;"><a class="generic_button border_radius">Add more content</a> or drag items to reorder</div>

			      <div class="form_fields_sub_element form_fields_sub_element_border_top form_fields_sub_element_border_bottom path_of_continue_msg" style="display:none;margin-top:12px;">After path is completed, continue to <input type="hidden" name="scalar:continue_to_content_id" value="<?=((!empty($continue_to))?$continue_to->content_id:'')?>" /><span class="title" style="font-weight:bold"><?=((!empty($continue_to))?$continue_to->versions[$continue_to->version_index]->title:'none')?></span>&nbsp; <a href="javascript:;">add</a> | <a href="javascript:">clear</a></div>

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
						echo $title.' (page '.$rel_sort_number.')';
						echo '&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span>';
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
				echo '<span class="reply_of_msg"><b>To make this <span class="content_type">page</span> a comment</b>, <a href="javascript:void(null);">specify the items that it comments on</a></span><br />'."\n";
			} else {
				echo '<span class="reply_of_msg"><b>This <span class="content_type">page</span> is also a comment</b> which comments on:</span><br />'."\n";
			}
			echo '      <ul id="reply_of" class="edit_relationship_list">'."\n";
			if (!empty($page)&&!empty($page->versions[$page->version_index]->reply_of)) {
				foreach ($page->versions[$page->version_index]->reply_of as $node) {
					$title = $node->versions[0]->title;
					$rel_slug = $base_uri.$node->slug;
					echo '      <li>';
					echo '<input type="hidden" name="reply_of" value="'.$node->versions[0]->urn.'" />';
					echo '<input type="hidden" name="reply_of_paragraph_num" value="'.$node->versions[0]->paragraph_num.'" />';
					echo '<input type="hidden" name="reply_of_datetime" value="'.$node->versions[0]->datetime.'" />';
					echo $title.' ('.date("j F Y", strtotime($node->versions[0]->datetime)).')&nbsp; ';
					echo '<span class="remove">(<a href="javascript:;">remove</a>)</span>';
					echo '</li>'."\n";
				}
			}
			echo "      </ul>\n";
			?>
			      <div class="form_fields_sub_element reply_of_msg" style="display:none;"><a class="generic_button border_radius">Add more content</a></div>

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
					echo $title.' ('.date("j F Y", strtotime($node->versions[$node->version_index]->datetime)).')';
					echo '&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span>';
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
			    <?
				if (empty($page) || empty($page->versions[$page->version_index]->annotation_of)) {
					echo '<span class="annotation_of_msg"><b>To make this <span class="content_type">page</span> an annotation</b>, <a href="javascript:void(null);">specify media that it annotates</a></span><br />'."\n";
				} else {
					echo '<span class="annotation_of_msg"><b>This <span class="content_type">page</span> is also a annotation</b> which annotates:</span><br />'."\n";
				}
				echo '      <ul id="annotation_of" class="edit_relationship_list">'."\n";
				if (!empty($page)&&!empty($page->versions[$page->version_index]->annotation_of)) {
					foreach ($page->versions[$page->version_index]->annotation_of as $node) {
						$title = $node->versions[0]->title;
						$rel_slug = $base_uri.$node->slug;
						echo '      <li>';
						echo '<input type="hidden" name="annotation_of" value="'.$node->versions[0]->urn.'" />';
						echo $title.'<br />';
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
						echo '&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)';
						echo '</span>';
						echo '</li>'."\n";
					}
				}
				echo "      </ul>\n";
			?>
				<div class="form_fields_sub_element annotation_of_msg" style="display:none;"><a class="generic_button border_radius">Annotate additional media</a></div>

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
					echo $title.'<br />';
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
					echo '&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span>';
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
			    <?
			if (empty($page) || empty($page->versions[$page->version_index]->tag_of)) {
				echo '<span class="tag_of_msg"><b>To make this <span class="content_type">page</span> a tag</b>, <a href="javascript:void(null);">specify the items that it tags</a></span><br />'."\n";
			} else {
				echo '<span class="tag_of_msg"><b>This <span class="content_type">page</span> is also a tag</b> which tags:</span><br />'."\n";
			}
			echo '      <ul id="tag_of" class="edit_relationship_list">'."\n";
			if (isset($page->version_index) && !empty($page->versions[$page->version_index]->tag_of)) {
				foreach ($page->versions[$page->version_index]->tag_of as $node) {
					$title = $node->versions[0]->title;
					$rel_uri = $base_uri.$node->slug;
					echo '      <li>';
					echo '<input type="hidden" name="tag_of" value="'.$node->versions[0]->urn.'" />';
					echo $title;
					echo '&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span>';
					echo '</li>'."\n";
				}
			}
			echo "      </ul>\n";
			?>
				<div class="form_fields_sub_element tag_of_msg" style="display:none;"><a class="generic_button border_radius">Tag additional content</a><br /><br /></div>

				<div id="tr_has_tag">
			<?
				if (empty($page) || empty($page->versions[$page->version_index]->has_tags)) {
					echo '<span class="has_tag_msg"><b>To tag this <span class="content_type">page</span>,</b> <a href="javascript:void(null);">specify items that tag it</a></span><br />'."\n";
				} else {
					echo '<span class="has_tag_msg"><b>This <span class="content_type">page</span> is tagged by</b> the following tags:</span><br />'."\n";
				}
			?>
				<ul id="has_tag" class="edit_relationship_list">
			<?
				if (isset($page->version_index) && !empty($page->versions[$page->version_index]->has_tags)) {
					foreach ($page->versions[$page->version_index]->has_tags as $node):
						$title = $node->versions[$page->version_index]->title;
						$rel_uri = $base_uri.$node->slug;
						echo' <li>';
						echo '<input type="hidden" name="has_tag" value="'.$node->versions[$page->version_index]->urn.'" />';
						echo $title;
						echo '&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span>';
						echo '</li>';
					endforeach;
				}
			?>
				</ul>

				<div class="form_fields_sub_element has_tag_msg" style="display:none;"><a class="generic_button border_radius">Add additional tags</a></div>
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
  		<tr class="styling_sub"><!-- thumbnail -->
  			<td valign="top">Thumbnail</td>
  			<td colspan="2">
  			<p>Choose an image from your library:</p>
  			<select id="choose_thumbnail" style="margin:3px 0px 3px 0px; max-width:100%;"><option value="">Choose an image</option><?
  				foreach ($book_images as $book_image_row) {
  					$slug_version = get_slug_version($book_image_row->slug);
  					echo '<option value="'.$book_image_row->versions[$book_image_row->version_index]->url.'" '.((@$page->thumbnail==$book_image_row->versions[$book_image_row->version_index]->url)?'selected':'').'>'.$book_image_row->versions[$book_image_row->version_index]->title.((!empty($slug_version))?' ('.$slug_version.')':'').'</option>';
  				}
  			?></select><br /><br />
  			<p>Or enter any URL:</p>
  			<input type="text" name="scalar:thumbnail" value="<?=@$page->thumbnail?>" style="margin:3px 0px 3px 0px; width:100%;" />
  			</td>
  		</tr>
  		<tr class="styling_sub"><!-- color -->
  			<td>Color<br /><small>e.g., for path nav bar</small></td>
  			<td><input style="width:100%;" type="text" id="color_select" name="scalar:color" value="<?=(!empty($page->color))?$page->color:'#ffffff'?>" /></td>
  		</tr>
  		<tr class="styling_sub"><!-- background image -->
  			<td>Background image</td>
  			<td><?=((@!empty($page->background))?'<img src="'.abs_url($page->background,confirm_slash(base_url()).confirm_slash($book->slug)).'" class="thumb_preview" />':'No background image has been set')?></td>
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
   				Custom JavaScript
   				<div style="width:150px;white-space:normal;"><small>Javascript or jQuery source</small></div>
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
				foreach ($categories as $_category) {
					echo '<option value="'.strtolower($_category).'" '.((strtolower($_category)==strtolower($category))?'selected':'').'>'.ucwords($_category).'</option>';
				}
			?>
			    </select>
			    <!--
			    <span style="padding-left:40px;">Page creator</span>
			    <span style="padding-left:16px;"><select name="page_creator"><option value="0" <?=((@$page->user->user_id==0)?'selected':'')?>>Anonymous</option>
			<?
			/*
			    $page_creator = false;
				foreach ($book->contributors as $contributor) {
					if (@$page->user->user_id==$contributor->user->user_id) $page_creator = true;
					echo '<option value="'.$contributor->user->user_id.'" '.((@$page->user->user_id==$contributor->user->user_id)?'selected':'').'>'.$contributor->user->fullname.'</option>';
				}
				if (!$page_creator && isset($page->user) && !empty($page->user)) {  // Could be created by someone not attached to the book
					echo 'option value="'.$page->user->user_id.'">'.$page->user->fullname.'</option>';
				}
			*/
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

		<a href="javascript:;" class="generic_button border_radius default add_additional_metadata">Add additional metadata</a>&nbsp; &nbsp;
		<a href="javascript:;" class="generic_button border_radius populate_exif_fields">Auto-populate IPTC fields</a>

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
