<?
if (empty($book)) {
	header('Location: '.$this->base_url.'?zone=user');
	exit;
}
?>
<?$this->template->add_css('system/application/views/modules/dashboot/css/custom.jquery-ui.min.css')?>
<?$this->template->add_css('system/application/views/modules/dashboot/css/bootstrap-dialog.min.css')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/custom.jquery-ui.min.js')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/bootstrap-dialog.min.js')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.predefined.js')?>

<link id="active_melon" href="<?=$this->config->item('active_melon')?>" />
<link id="book_melon" href="<?=$book->template?>" />
<link id="book_stylesheet" href="<?=$book->stylesheet?>" />
<script id="interfaces" type="application/json"><?=json_encode($interfaces)?></script>
<script id="predefined_css" type="application/json"><?=(($predefined_css)?json_encode($predefined_css):'')?></script>
<script>
$(document).on('change', ':file', function() {  // https://www.abeautifulsite.net/whipping-file-inputs-into-shape-with-bootstrap-3
    var input = $(this),
    numFiles = input.get(0).files ? input.get(0).files.length : 1,
    label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
});
$(document).ready(function() {
	// Bootstrap file label
    $(':file').on('fileselect', function(event, numFiles, label) {
		$(this).closest('.input-group').find('input[type="text"]').val(label);
    });
    // Select the interface template
	var active_melon = $('#active_melon').attr('href');
    var book_melon = $('#book_melon').attr('href');
    if (!book_melon.length) book_melon = active_melon;
	select_interface(book_melon);
    // Thumb upload change
    $('input[name="upload_thumb"]').on('change', function() {
        var oFReader = new FileReader();
        oFReader.readAsDataURL(this.files[0]);
        oFReader.onload = function(oFREvent) {
			$('#thumb_wrapper').show().find('img:first')[0].src = oFREvent.target.result;
        };
    });
	// Predefined CSS selector
    var predefined_css = $("#predefined_css").text();
    $('textarea[name="custom_style"]').predefined({msg:'Insert predefined CSS:',data:((predefined_css.length)?JSON.parse(predefined_css):{})});
    // Warn user about HTML in the Custom CSS and Custom JS boxes
    var html_warning = function() {
		var $this = $(this);
		if (true!==$this.data('open') && true!==$this.data('confirmed')) {
			if (-1 != $this.val().search(/<\/?(style|script)>/i)) {
				$this.data('open', true);
				var type_str = ('custom_style'===$this.prop('name')) ? 'style' : 'script';
				var acro_str = ('custom_style'===$this.prop('name')) ? 'CSS' : 'JS';
				BootstrapDialog.show({
					type: 'type-warning',
					title: 'Warning',
		            message: 'You have HTML tags included in the Custom '+acro_str+' box. Adding HTML to this box will cause errors which may cause problems with your Scalar book. Note that &lt;'+type_str+'&gt; and &lt;/'+type_str+'&gt; tags are automatically included by Scalar. Do you wish to continue?',
		            buttons: [{
		                label: 'Cancel',
		                cssClass: 'btn-default',
		                action: function(dialog) {
							$this.data('confirmed',false);
							dialog.close();
							$this.data('open', false);
							$this.val($this.data('orig-value'));
							$this.blur();
		                }
		            }, {
		                label: 'Continue',
		                cssClass: 'btn-primary',
		                action: function(dialog) {
							$this.data('confirmed',true);
							dialog.close();
							$this.data('open', false);
							$this.focus();
		                }
		            }]
		        });
			}
		}
    };
    $('textarea[name="custom_style"]').data('orig-value',$('textarea[name="custom_style"]').val()).on('keydown', html_warning);
    $('textarea[name="custom_js"]').data('orig-value',$('textarea[name="custom_js"]').val()).on('keydown', html_warning);
    // Background image
    var set_background_preview = function() {
		var $select = $('#background');
		var $preview = $('#background_preview');
		var url = $select.val();
		if (!url.length) {
			$preview.hide();
			return;
		}
		if (-1==url.indexOf('://')) url = $('link#parent').attr('href')+url;
		$preview.find('img').attr('src', url);
		$preview.show();
    };
    $('#background').on('change', set_background_preview);
    set_background_preview();
});
//Select the reader interface (Scalar 1, Scalar 2, ...)
function select_interface(melon) {
    var interfaces = JSON.parse($("#interfaces").text());
	$wrapper = $('#interface-wrapper');
	$wrapper.empty();
    var $template = $('<span><select style="width:auto;margin-right:8px;float:left;" class="form-control" name="template"></select></span>').appendTo($wrapper);
    var $whats_this = $('<label style="margin-right:12px;" class="control-label label-text"><small><a class="whatsthis" href="javascript:void(null);">What\'s this?</a></small></label>').appendTo($template);
	$whats_this.find('a').on('click', function() {
		var $modal = $('#selectInterfaceModal');
		if (!$modal.data('propagated')) {
			$modal.data('propagated',true);
			$appendTo = $modal.find('.row:first');
			for (var j = 0; j < interfaces.length; j++) {
				var $div = $('<div class="col-sm-6"></div>').appendTo($appendTo);
				$div.append('<img class="img-responsive" src="'+$('#approot').attr('href')+interfaces[j].meta.thumb_app_path+'" />');
				$div.append('<div class="radio"><label><input type="radio" name="interfaceOptions" value="'+interfaces[j]['meta']['slug']+'"'+((melon==interfaces[j]['meta']['slug'])?' checked':'')+((!interfaces[j]['meta']['is_selectable'])?' disabled':'')+'> <strong>'+interfaces[j]['meta']['name']+'</strong><br />'+interfaces[j]['meta']['description']+'</label></div>');
			};
			$modal.find('img').on('click', function() {
				$(this).parent().find('input[type="radio"]').trigger('click');
			});
			$modal.find('button:last').on('click', function() {
				var checked = $modal.find("input[type='radio']:checked").val();
				$('select[name="template"]').val(checked).trigger('change');
				$modal.modal('hide');
			});
		};
		$modal.modal();
	});
	var melon_obj = null;
    for (var j in interfaces) {
    	if (melon==interfaces[j]['meta']['slug']) melon_obj = interfaces[j];
		$('<option'+((melon==interfaces[j]['meta']['slug'])?' selected':'')+((!interfaces[j]['meta']['is_selectable'])?' disabled':'')+' value="'+interfaces[j]['meta']['slug']+'">'+interfaces[j]['meta']['name']+'</option>').appendTo($template.find('select:first'));
    };
    $template.find('select:first').on('change', function() {
		var selected = $(this).find(':selected').val();
		select_interface(selected);
    });
    if (melon_obj['stylesheets'].length) {
   		var $stylesheets = $('<label style="padding:0;" class="control-label label-text">Theme: <select style="display:inline-block;width:auto;" class="form-control" name="stylesheet"></select></span></label>').appendTo($wrapper);
   		var stylesheet = melon_obj['stylesheets'][0]['slug'];
   		if ($('#book_stylesheet').attr('href').length) stylesheet = $('#book_stylesheet').attr('href');
   		for (var j in melon_obj['stylesheets']) {
			$('<option'+((stylesheet==melon_obj['stylesheets'][j]['slug'])?' selected':'')+' value="'+melon_obj['stylesheets'][j]['slug']+'">'+melon_obj['stylesheets'][j]['name']+'</option>').appendTo($stylesheets.find('select:first'));
   		}
   	};
   	if ('cantaloupe'==melon_obj['meta']['slug']) {
		var $title = $('<div>'+$('input[name="title"]').val()+'</div>');
		var margin_nav = ('undefined'==typeof($title.children(":first").attr('data-margin-nav'))) ? false : true;
		$wrapper.append('<br clear="both" />');
		var $margin_nav = $('<div class="checkbox" style="display:block;"><label for="margin-nav"><input type="checkbox" id="margin-nav" value="1" /> Display navigation buttons in margins?</label></div>').appendTo($wrapper);
		$wrapper.find('#margin-nav').prop('checked', margin_nav).on('change', function() {
			var $title = $('<div>'+$('input[name="title"]').val()+'</div>');
			if (!$title.children(':first').is('span')) $title.contents().wrap('<span></span>');
			var $span = $title.children(':first');
			var prop_arr = ['margin-nav'];
			for (var j in prop_arr) {
				var prop = prop_arr[j];
				var make_true = ($('#'+prop).is(':checked')) ? true : false;
				if (make_true) {
					$span.attr('data-'+prop, 'true');
				} else {
					$span.removeAttr('data-'+prop);
				}
			}
			if($title.children(':first').is('span') && !$title.children(':first').get(0).attributes.length) {
				$title.children(':first').contents().unwrap();
			}
			$('input[name="title"]').val( $title.html() );
		});
		$wrapper.children().not('.checkbox').hide();
   	} else if ('honeydew'==melon_obj['meta']['slug']) {
		$wrapper.closest('.form-group').hide();
   	};
};
</script>

<div class="container-fluid properties">
  <div class="row">
<?php if (isset($_REQUEST['action']) && $_REQUEST['action']=='book_style_saved'): ?>
      <div class="alert alert-success">Book styling has been saved<span style="float:right;"><a href="<?=base_url().$book->slug?>">return to <?=$book->scope?></a> &nbsp;|&nbsp; </a><a href="?book_id=<?=@$book_id?>&zone=styling#tabs-styling">remove notice</a><span></span></div>
<?php endif; ?>
    <section class="col-xs-12">
	  <form class="form-horizontal" action="<?=confirm_slash(base_url())?>system/dashboard" method="post" enctype="multipart/form-data" id="properties_form">
	  <input type="hidden" name="action" value="do_save_style" />
	  <input type="hidden" name="zone" value="styling" />
	  <input type="hidden" name="book_id" value="<?=$book->book_id?>" />
	  <input type="hidden" name="slug" value="<?=$book->slug?>" />
	  <input type="hidden" name="title" value="<?=htmlspecialchars($book->title)?>" />
	  <input type="hidden" name="dont_save_versions" value="1" />
      <div class="form-group">
        <label for="scope" class="col-sm-2 control-label">Reader interface</label>
        <div class="col-sm-10" id="interface-wrapper"></div>
      </div>
      <div class="form-group">
        <label for="upload_thumb" class="col-sm-2 control-label">Thumbnail image</label>
        <div class="col-sm-4">
          <div class="input-group">
            <input type="hidden" name="thumbnail" value="<?=$book->thumbnail?>" />
            <label class="input-group-btn">
              <span class="btn btn-default">
                Choose file&hellip; <input type="file" name="upload_thumb" style="display:none;">
              </span>
            </label>
            <input type="text" class="form-control" readonly>
          </div>
        </div>
        <div class="col-sm-6 col-overrun-left">
		  <label class="control-label label-text"><small>JPG, PNG, or GIF&mdash;will be resized to 120px</small></label>
		</div>
        <div id="thumb_wrapper" class="col-sm-offset-2 col-sm-10" style="<?=(!empty($book->thumbnail))?'':'display:none;'?>">
          <div class="thumb-wrapper">
            <img src="<?=base_url().$book->slug.'/'.$book->thumbnail?>?t=<?=time()?>" />
          </div>
          <div class="checkbox" style="display:inline-block;">
            <label>
              <input type="checkbox" name="remove_thumbnail" value="1">
              Remove thumbnail image
            </label>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label for="background" class="col-sm-2 control-label">Background image</label>
        <div class="col-sm-10">
          <select style="width:auto;float:left;margin-right:12px;max-width:100%;" class="form-control" id="background" name="background">
		    <option value="">Choose an image</option><?php
			    $matched = false;
	  			foreach ($current_book_images as $book_image_row) {
	  				if ($book->background==$book_image_row->versions[$book_image_row->version_index]->url) $matched = true;
	  				$slug_version = get_slug_version($book_image_row->slug);
	  				echo '<option value="'.$book_image_row->versions[$book_image_row->version_index]->url.'" '.(($book->background==$book_image_row->versions[$book_image_row->version_index]->url)?'selected':'').'>'.$book_image_row->versions[$book_image_row->version_index]->title.((!empty($slug_version))?' ('.$slug_version.')':'').'</option>';
	  			}
	  			if (!empty($book->background) && !$matched) {
	  				echo '<option value="'.$book->background.'" selected>'.$book->background.'</option>';
	  			}
		    ?></select>
        </div>
        <div id="background_preview" style="display:none;" class="col-sm-offset-2 col-sm-10">
          <div class="thumb-wrapper">
            <img src="" />
          </div>
          <div class="checkbox" style="display:inline-block;">
            <label>
              <input type="checkbox" name="remove_background" value="1">
              Remove background image
            </label>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label for="custom_style" class="col-sm-2 control-label">Custom CSS</label>
        <div class="col-sm-10">
          <small>Example: &nbsp; .navbar {background-color:red;} &nbsp; no <?=htmlspecialchars('<style>')?> tags needed</small>
          <textarea class="form-control" rows="8" id="custom_style" name="custom_style"><?=htmlspecialchars($book->custom_style)?></textarea>
        </div>
      </div>
      <div class="form-group">
        <label for="custom_js" class="col-sm-2 control-label">Custom JavaScript</label>
        <div class="col-sm-10">
          <small>Example: &nbsp; JavaScript or jQuery source, Google Analytics embed code &nbsp; no <?=htmlspecialchars('<script>')?> tags needed</small>
          <textarea class="form-control" rows="8" id="custom_js" name="custom_js"><?=htmlspecialchars($book->custom_js)?></textarea>
          <div class="predefined_wrapper">Visit the <a href="http://scalar.usc.edu/works/guide2" target="_blank">Scalar 2 Guide</a> for <a href="http://scalar.usc.edu/works/guide2/advanced-topics" target="_blank">example Javascript snippets</a> including one for <a href="http://scalar.usc.edu/works/guide2/revealing-individual-authors-in-page-headers" target="_blank">revealing individual page authors</a>.</div>
        </div>
      </div>
      <div class="page-header"></div>
      <div class="form-group">
        <div class="col-sm-12">
          <div class="pull-right">
            <button type="submit" class="btn btn-default">Save</button> &nbsp;
            <button type="submit" class="btn btn-primary" name="back_to_book" value="1">Save and return to book</button>
          </div>
        </div>
      </div>
      </form>
    </section>
  </div>
</div>

<div class="modal fade" id="selectInterfaceModal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-body">
        <div class="page-header"><h4>Reader interfaces</h4></div>
        <div class="container-fluid">
		  <div class="row">
	        <div class="col-sm-12" style="margin-bottom:12px;">
			  Scalar 2 is our new, easier to read interface, while Scalar 1 is our original design. You can switch back and
			  forth between the two interfaces as much as you like, though
			  <a href="http://scalar.usc.edu/works/guide2/switching-books-authored-in-scalar-10?path=scalar-20-whats-new" target="_blank">some reformatting may be required</a>
			  to convert books created in Scalar 1 to take advantage of the features in Scalar 2.
	        </div>
		  </div>
		</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Continue</button>
      </div>
      </form>
    </div>
  </div>
</div>
