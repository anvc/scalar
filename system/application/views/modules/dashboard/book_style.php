<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
	
<style>
.removed {color:#bbbbbb;}
.removed a {color:#999999;}
</style>			
<script>
var interfaces = <?=json_encode($interfaces)?>;
var active_melon = '<?=$this->config->item('active_melon')?>';
var book_melon = '<?=$book->template?>';
var book_stylesheet = '<?=$book->stylesheet?>';
function select_interface(melon) {
    $('#interface').empty();
    var $template = $('<span style="display:none;">Template: <select name="template"></select>&nbsp; &nbsp; </span>').appendTo('#interface');
    var selected_melon = null;
    for (var j in interfaces) {
        if (melon==interfaces[j]['meta']['slug']) selected_melon = interfaces[j];
		$('<option '+((melon==interfaces[j]['meta']['slug'])?'SELECTED ':'')+' '+((!interfaces[j]['meta']['is_selectable'])?'DISABLED ':'')+' value="'+interfaces[j]['meta']['slug']+'">'+interfaces[j]['meta']['name']+((interfaces[j]['meta']['description'].length)?' - '+interfaces[j]['meta']['description']:'')+'</option>').appendTo($template.find('select:first'));
    }
    $template.find('select:first').change(function() {
		var selected = $(this).find(':selected').val();
		select_interface(selected);
    });    
    if (selected_melon['stylesheets'].length) {
   		var $stylesheets = $('<span>Theme: <select name="stylesheet"></select>&nbsp; &nbsp; </span>').appendTo('#interface');
   		var stylesheet = selected_melon['stylesheets'][0]['slug'];
   		if (book_stylesheet.length) stylesheet = book_stylesheet;
   		var style_thumb = '';
   		for (var j in selected_melon['stylesheets']) {
   	   		if (stylesheet==selected_melon['stylesheets'][j]['slug']) style_thumb = selected_melon['stylesheets'][j]['thumb_app_path'];
			$('<option '+((stylesheet==selected_melon['stylesheets'][j]['slug'])?'SELECTED ':'')+'value="'+selected_melon['stylesheets'][j]['slug']+'">'+selected_melon['stylesheets'][j]['name']+'</option>').appendTo($stylesheets.find('select:first'));
   		}
   		var $style_thumb = $('<span id="style_thumb"><img src="'+$('link#approot').attr('href')+style_thumb+'" align="top" /></span>').appendTo('#interface');
		$stylesheets.find('select:first').change(function() {
			var selected = $(this).find(':selected').val();
			for (var j in selected_melon['stylesheets']) {
				if (selected==selected_melon['stylesheets'][j]['slug']) {
					var url = $('link#approot').attr('href')+selected_melon['stylesheets'][j]['thumb_app_path'];
					$(this).closest('#interface').find('#style_thumb img').attr('src', url);
					break;
				}
			}
		});
   	} else {
		$('<span>There are no theme options for the current template</span>').appendTo('#interface');
    }
}
$(window).ready(function() {
	
    $('.save_changes').next('a').click(function() {
    	$('#style_form').submit();
    	return false;
    });

    if (!book_melon.length) book_melon = active_melon;
	select_interface(book_melon);   
    
    $('#book_versions').sortable();
    $('#book_versions a').live('click', function() {
		$(this).closest('li').find('input').attr('value', 0);
		$(this).closest('li').addClass('removed');
    });
    $('#book_versions_add_another').click(function() {
        var $link = $(this);
        if (true==$link.data('loading')) return false;
        $link.data('loading', true);
        var prev_link_text = $link.html();
        $link.html('Loading...');
    	$('#book_versions_add_box').remove();
    	var book_id = parseInt(document.getElementById('style_form').book_id.value);
    	$.get('api/get_content', {book_id:book_id}, function(data) {
    	    var $wrapper = $('<div id="book_versions_add_box"><h4>Please choose a content item to be added to the main menu</h4><a href="javascript:void(null);" onclick="$(this).parent().remove();" style="font-weight:bold;position:absolute;top:10px;right:10px;font-size:larger;"> X </a></div>');
    	    $wrapper.append('<div style="padding:10px 0px 10px 0px; font-weight:bold;">Pages</div>');
  			var $content = $('<ul class="nodots"></ul>');
  			for (var j = 0; j < data.length; j++) {
  				if (data[j].type!='composite') continue;
				if ('undefined'==typeof(data[j].versions) || !data[j].versions.length) {
					 console.log('Missing composite version:');
					 console.log(data[j]);
					 continue;
				}  	  			
  				var $li = $('<li><a href="#version_id_'+data[j].versions[0].version_id+'">'+data[j].versions[0].title+'</a></li>');
  				$content.append($li);
  			}
  			$wrapper.append($content);
    	    $wrapper.append('<div style="padding:10px 0px 10px 0px; font-weight:bold;">Media</div>');
  			var $content = $('<ul class="nodots"></ul>');
  			for (var j = 0; j < data.length; j++) {
  				if (data[j].type!='media') continue;
				if ('undefined'==typeof(data[j].versions) || !data[j].versions.length) {
					 console.log('Missing media version:');
					 console.log(data[j]);
					 continue;
				}  	  			
  				var $li = $('<li><a href="#version_id_'+data[j].versions[0].version_id+'">'+data[j].versions[0].title+'</a></li>');
  				$content.append($li);
  			}
  			$wrapper.append($content);
  			var padding = 400;
  			$wrapper.css({
  				position: 'absolute',
  				width: (parseInt($(window).width())-padding)+'px',
  				height: (parseInt($(window).height())-padding)+'px',
  				top: (padding/2)+parseInt($(window).scrollTop())+'px',
  				left: (padding/2)+'px',
  				overflow: 'auto',
  				padding: '20px',
  				background: 'white',
  				border: 'solid 8px #bbbbbb'
  			}); 	
  			$wrapper.find('a').click(function() {
  				var version_id = parseInt($(this).attr('href').replace('#version_id_',''));
  				var title = $(this).html();
  				var $ol = $('#book_versions_add_another').prev();
  				$ol.append('<li><input type="hidden" name="book_version_'+version_id+'" value="1" />'+title+' <small>(<a href="javascript:void(null);">remove</a>)</small></li>');
  				$('#book_versions_add_box').remove();
  				$('.save_changes').fadeIn();
  				return false;
  			});
  			$('body').append($wrapper);
  			$link.data('loading', false);
  			$link.html(prev_link_text);
    		return false;
    	});
    });    
    
});
</script>
<?
	if (empty($book)) {
		echo 'Please select a book to manage using the pulldown menu above';
	}

	if (@$_REQUEST['action']=='book_style_saved') {
		echo '<div class="saved">';
		echo 'Book style has been saved ';
		echo '<div style="float:right;">';
		echo '<a href="'.confirm_slash(base_url()).$book->slug.'">back to '.$book->scope.'</a>';
		echo ' | ';
		echo '<a href="?book_id='.$book->book_id.'&zone=style">clear</a>';
		echo '</div>';
		echo '</div><br />';
	}
?>		
		
		<form id="style_form" action="<?=confirm_slash(base_url())?>system/dashboard" method="post" enctype="multipart/form-data">
		<input type="hidden" name="action" value="do_save_style" />
		<input type="hidden" name="zone" value="style" />
		<? if (!empty($book)): ?>
		<input type="hidden" name="book_id" value="<?=$book->book_id?>" />
		<? endif ?>
		<table cellspacing="0" cellpadding="0" style="width:100%;" class="trim_horz_padding">
<?
		$row = $book; 
		if (!empty($row)):
			if (!empty($book_id) && $row->book_id != $book_id) continue;	
			// Title
			echo '<tr typeof="books" class="styling_sub">';
			echo '<td><h4 class="content_title">Basics</h4></td><td></td></tr>';
			echo '<tr>';
			echo '<tr typeof="books">';
			echo '<td style="vertical-align:middle;">Title';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" colspan="2">';
			echo '<input name="title" type="text" value="'.htmlspecialchars($row->title).'" style="width:100%;" />';
			echo "</td>\n";
			echo "</tr>\n";
			// Subtitle
			echo '<tr typeof="books">';
			echo '<td style="vertical-align:middle;">Subtitle';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" colspan="2">';
			echo '<input name="subtitle" type="text" value="'.htmlspecialchars($row->subtitle).'" style="width:100%;" />';
			echo "</td>\n";
			echo "</tr>\n";			
			// Description
			echo '<tr typeof="books">';
			echo '<td style="vertical-align:middle;">Description';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" colspan="2">';
			echo '<input name="description" type="text" value="'.htmlspecialchars($row->description).'" style="width:100%;" />';
			echo "</td>\n";
			echo "</tr>\n";	
			// URI segment
			echo '<tr>';
			echo '<td style="vertical-align:middle;">URI Segment';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" class="row_div" colspan="2">';
			echo confirm_slash(base_url()).'<input name="slug" type="text" value="'.htmlspecialchars($row->slug).'" style="width:150px;" />';
			echo "</td>\n";
			echo "</tr>\n";		
			echo '<tr typeof="books" class="styling_sub">';
			echo '<td><h4 class="content_title">Style</h4></td><td></td></tr>';
			// Interface
			echo '<tr>';
			echo '<td><p>Interface</p></td>'."\n";
			echo '<td>';
			echo '<p id="interface">';
			echo '</p>';
			echo "</td>\n";
			echo '<td>';
			echo "</td>\n";
			echo "</tr>\n";															
			// Background
			echo '<tr typeof="books">';
			echo '<td><p>Background image</p></td>'."\n";
			echo '<td style="vertical-align:middle;">';
			if (!empty($row->background)) {
				echo '<img src="'.abs_url($row->background,confirm_slash(base_url()).$row->slug).'?t='.time().'" style="vertical-align:middle;margin-right:10px;height:75px;border:solid 1px #aaaaaa;" /> '."\n";
			}
			echo '<p>Select image: <select name="background" style="max-width:400px;"><option value="">Choose an imported image</option>';
  			$matched = false;
  			foreach ($current_book_images as $book_image_row) {
  				if (@$row->background==$book_image_row->versions[$book_image_row->version_index]->url) $matched = true;
  				$slug_version = get_slug_version($book_image_row->slug);
  				echo '<option value="'.$book_image_row->versions[$book_image_row->version_index]->url.'" '.((@$row->background==$book_image_row->versions[$book_image_row->version_index]->url)?'selected':'').'>'.$book_image_row->versions[$book_image_row->version_index]->title.((!empty($slug_version))?' ('.$slug_version.')':'').'</option>';
  			}
  			if (!$matched) {
  				echo '<option value="'.@$row->background.'" selected>'.@$row->background.'</option>';
  			}
			echo '</select></p>';
			if (!empty($row->background)) echo '<p><input type="checkbox" name="remove_background" id="remove_background" value="1" /><label for="remove_background"> Remove image</label></p></td>'."\n";
			echo '<td>';
			echo '</td>'."\n";
			echo "</tr>\n";																			
			// Thumbnail
			echo '<tr typeof="books">';
			echo '<td><p>Thumbnail image</p></td>'."\n";
			echo '<td style="vertical-align:middle;">';
			if (!empty($row->thumbnail)) {
				echo '<input type="hidden" name="thumbnail" value="'.$row->thumbnail.'" />';
				echo '<img src="'.confirm_slash(base_url()).confirm_slash($row->slug).$row->thumbnail.'?t='.time().'" style="vertical-align:middle;margin-right:10px;height:75px;border:solid 1px #aaaaaa;" /> ';
				echo basename($row->thumbnail)."\n";
			}
			echo '<p>Upload image: <input type="file" name="upload_thumb" />';
			echo '<br /><span style="font-size:smaller;">JPG, PNG, or GIF format; will be resized to 120px</span></p>';
			if (!empty($row->thumbnail)) echo '<p><input type="checkbox" name="remove_thumbnail" id="remove_thumbnail" value="1" /><label for="remove_thumbnail"> Remove image</label></p>';
			echo '</td>'."\n";
			echo '<td>';
			echo '</td>'."\n";
			echo "</tr>\n";										
			// Custom style
			echo '<tr typeof="books">';
			echo '<td style="width:190px;">Custom style';
			echo '<br /><small>Example:<br /><span style="color:#333333;">body {font-family:Helvetica;}<br />No &lt;style&gt; or &lt;/style&gt; tags</span></small>';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" colspan="2">';
			echo '<textarea name="custom_style" style="width:100%;height:80px;">';
			echo (!empty($row->custom_style)) ? trim($row->custom_style) : '';
			echo '</textarea></td>'."\n";
			echo "</tr>\n";	
			// Custom javascript
			echo '<tr typeof="books">';
			echo '<td style="width:190px;">Custom Javascript';
			echo '<br /><small>E.g., Google Analytics code<br />No &lt;script&gt; or &lt;/script&gt; tags</small>';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" class="row_div" colspan="2">';
			echo '<textarea name="custom_js" style="width:100%;height:80px;">';
			echo (!empty($row->custom_js)) ? trim($row->custom_js) : '';
			echo '</textarea></td>'."\n";
			echo "</tr>\n";										
			// Row div
			//echo '<tr class="row_div"><td colspan="3"></td></tr>';	
			// Availability
			echo '<tr typeof="books" class="styling_sub">';
			echo '<td><h4 class="content_title">Public/Private</h4></td><td></td></tr>';
			echo '<tr>';
			echo '<td colspan="2">';
			echo 'This section has been moved to the <b>sharing</b> tab.';
			echo '</td>';
			echo "</tr>\n";								
			// Scope
			echo '<tr typeof="books" class="styling_sub">';
			echo '<td><h4 class="content_title">Other</h4></td><td></td></tr>';
			echo '<tr>';
			echo '<td style="vertical-align:middle;">Scope';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" colspan="2">';
			echo 'Select scope: <select name="scope">';
			echo '<option value="book"'.(($row->scope=='book')?' SELECTED':'').'>Book</option>';
			echo '<option value="article"'.(($row->scope=='article')?' SELECTED':'').'>Article</option>';
			echo '<option value="project"'.(($row->scope=='project')?' SELECTED':'').'>Project</option>';
			echo '</select>';
			echo "</td>\n";
			echo "</tr>\n";												
			// Main menu
			echo '<tr typeof="books">';
			echo '<td style="width:190px;">Main menu items';
			echo '<br /><small>Drag items to reorder</small>';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" colspan="2"><ol id="book_versions">';
			foreach ($current_book_versions as $book_version) {
				echo '<li>';
				echo '<input type="hidden" name="book_version_'.$book_version->versions[0]->version_id.'" value="1" />';
				echo $book_version->versions[0]->title;
				echo ' <small>(<a href="javascript:void(null);">remove</a>)</small>';
				echo '</li>';
			}
			echo '</ol><a href="javascript:void(null);" id="book_versions_add_another"><small>Add menu item</small></a></td>'."\n";
			echo "</tr>\n";		
			// Publisher
			echo '<tr>';
			echo '<td style="vertical-align:middle;">Publisher name<br /><small>Include HTML <b>'.htmlspecialchars('<a>').'</b> to create link</small>';
			echo '</td>'."\n";
			echo '<td style="vertical-align:middle;" colspan="2">';
			echo '<input name="publisher" type="text" value="'.htmlspecialchars($row->publisher).'" style="width:100%;" />';
			echo "</td>\n";
			echo "</tr>\n";		
			// Publisher icon
			echo '<tr>';
			echo '<td><p>Publisher logo<br /><small><b>'.htmlspecialchars('<a>').'</b> in previous field makes link</p></td>'."\n";
			echo '<td style="vertical-align:middle;">';
			if (!empty($row->publisher_thumbnail)) {
				echo '<input type="hidden" name="publisher_thumbnail" value="'.$row->publisher_thumbnail.'" />';
				echo '<img src="'.confirm_slash(base_url()).confirm_slash($row->slug).$row->publisher_thumbnail.'?t='.time().'" style="vertical-align:middle;margin-right:10px;height:75px;border:solid 1px #aaaaaa;" />';
				echo '<b>'.$row->publisher_thumbnail.'</b>';
			}
			echo '<p>Upload image: <input type="file" name="upload_publisher_thumb" /><br /><span style="font-size:smaller;">JPG, PNG, or GIF format; will be resized to 120px</span></p>'."\n";
			if (!empty($row->publisher_thumbnail)) echo '<p><input type="checkbox" name="remove_publisher_thumbnail" value="1" /> Remove image</p>';
			echo '</td>'."\n";
			echo "</tr>\n";								
			// Saves				
			echo "<tr>\n";
			echo '<td style="padding-top:8px;text-align:right;" colspan="3"><span class="save_changes">You have unsaved changes.</span> &nbsp; <a class="generic_button large default" href="javascript:;">Save</a></td>';
			echo "</tr>\n";							
		endif;	
?>
		<td>

		</td>
		</tr>
		</table>	
		</form>