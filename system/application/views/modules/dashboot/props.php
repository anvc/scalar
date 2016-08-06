<?$this->template->add_css('system/application/views/modules/dashboot/css/custom.jquery-ui.min.css')?>
<?$this->template->add_css('system/application/views/modules/dashboot/css/bootstrap-dialog.min.css')?>
<?$this->template->add_css('system/application/views/widgets/edit/content_selector.css')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/custom.jquery-ui.min.js')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/bootstrap-dialog.min.js')?>
<?$this->template->add_js('system/application/views/melons/cantaloupe/js/bootbox.min.js')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.content_selector.js')?>


<script id="book_versions" type="application/json"><?=json_encode($current_book_versions)?></script>
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
 	// Convert checkboxes to hidden inputs (so zero values can be sent through post)
    $('#url_is_public_el, #display_in_index_el').change(function() {
    	var $el = $(this);
    	var name = $el.attr('id').replace('_el','');
    	var value = ($el.is(':checked')) ? 1 : 0;
    	$el.parent().find('input[name="'+name+'"]').val(value);
    });
    // Warn user about changing the book slug
    $('input[name="slug"]').data('orig-value',$('input[name="slug"]').val()).keydown(function() {
		var $this = $(this);
		if (true!==$this.data('confirmed')) {
			BootstrapDialog.show({
				type: 'type-warning',
				title: 'Warning',
	            message: 'Changing the URL segment of the book will change its location on the web, which will make the old book URL unavailable.  Do you wish to continue?',
	            buttons: [{
	                label: 'Cancel',
	                cssClass: 'btn-default',
	                action: function(dialog) {
						$this.data('confirmed',false);
						dialog.close();
						$this.val($this.data('orig-value'));
						$this.blur();	                    
	                }
	            }, {
	                label: 'Continue',
	                cssClass: 'btn-primary',
	                action: function(dialog) {
						$this.data('confirmed',true);
						dialog.close();
						$this.focus();	                    
	                }
	            }]	            
	        });
		}
    });
    // Properties that overload the title via its <span> tag
	var title_init_values = function() {
		var $title = $('<div>'+$('input[name="title"]').val()+'</div>');
		var is_duplicatable = ('undefined'==typeof($title.children(":first").attr('data-duplicatable'))) ? false : true;
		var is_joinable = ('undefined'==typeof($title.children(":first").attr('data-joinable'))) ? false : true;
		var auto_approve = ('undefined'==typeof($title.children(":first").attr('data-auto-approve'))) ? false : true;
		var email_authors = ('undefined'==typeof($title.children(":first").attr('data-email-authors'))) ? false : true;
		var hypothesis = ('undefined'==typeof($title.children(":first").attr('data-hypothesis'))) ? false : true;
		$('#duplicatable').prop('checked', is_duplicatable);
		$('#joinable').prop('checked', is_joinable);
		$('#hypothesis').prop('checked', hypothesis);
		$('#auto-approve').prop('checked', auto_approve);
		$('#email-authors').prop('checked', email_authors);
    };
    title_init_values();
    $('input[name="title"]').change(title_init_values);
	$('#duplicatable, #joinable, #hypothesis,#auto-approve,#email-authors').change(function() {
		var $title = $('<div>'+$('input[name="title"]').val()+'</div>');
		if (!$title.children(':first').is('span')) $title.contents().wrap('<span></span>');
		var $span = $title.children(':first');
		var prop_arr = ['duplicatable', 'joinable', 'hypothesis','auto-approve','email-authors'];
		var all_false = true;
		for (var j in prop_arr) {
			var prop = prop_arr[j];
			var make_true = $('#'+prop).is(':checked') ? true : false;
			all_false = (all_false && !make_true) ? true : false;
			if (make_true) {
				$span.attr('data-'+prop, 'true');
			} else {
				$span.removeAttr('data-'+prop);
			}
		}
		if(all_false && $title.children(':first').is('span')) {
			$title.children(':first').contents().unwrap();
		}
		$('input[name="title"]').val( $title.html() );
	});
	// Main menu
	book_versions = JSON.parse($("#book_versions").text());  // global
	set_versions(book_versions);
	$('#toc-wrapper').find('button').click(function() {
		select_versions();
	});
});
// Main menu items
function set_version_numbers() {
	var $wrapper = $('#toc-wrapper');
	var num = 1;
	$wrapper.find('li').each(function() {
		$(this).find('.num').text(num);
		num++;
	});
	book_versions = [];
	$wrapper.find('li').each(function() {
		book_versions.push($(this).data('node'));
	});
}
function set_versions(nodes) {
	if (!nodes.length) return;
	var $wrapper = $('#toc-wrapper');
	var $versions = $wrapper.find('ul:first');
	if (!$versions.length) $versions = $('<ul class="list-group"></ul>').prependTo($wrapper);
	$versions.empty();
	var ids = [];
	$versions.find('li').unbind("mouseover").each(function() {
		ids.push($(this).data('version_id'));
	});
	for (var j = 0; j < nodes.length; j++) {
		var $item = $('<li class="list-group-item"><span class="num"></span>. '+nodes[j].versions[0].title+'</li>').appendTo($versions);
		var $close = $('<span class="glyphicon glyphicon-remove pull-right"></span>').prependTo($item);
		var $menu = $('<span class="glyphicon glyphicon-menu-hamburger pull-left"></span>').prependTo($item);
		var $input = $('<input type="hidden" name="book_version_'+nodes[j].versions[0].version_id+'" value="1" />').appendTo($item);
		$item.data('version_id', nodes[j].versions[0].version_id);
		$item.data('node', nodes[j]);
		$close.click(function() {
			$(this).closest('li').remove();
			set_version_numbers();
		});
	};
	set_version_numbers();
	$versions.find('li').find('.glyphicon:first').mouseover(function() {
		$(this).closest('li').addClass('list-group-item-info');
	}).mouseout(function() {
		$(this).closest('li').removeClass('list-group-item-info')
	});
	$versions.sortable({
		  axis: "y",
		  containment: "parent",
		  handle: ".pull-left",
		  tolerance: 'intersect',
		  helper: function(event, ui){
		    var $clone =  $(ui).clone();
		    $clone .css('position','absolute');
		    return $clone.get(0);
	  	  },
	  	  stop: function(event, ui) {
	  		set_version_numbers();
	  	  }
	});
}
function select_versions() {
	$('<div></div>').content_selector({
		parent:book_url,
		changeable:true,
		multiple:true,
		onthefly:false,
		msg:'Selected content will be added to the <b>Table of Contents</b> list of items',
		callback:function(nodes){
			var ids = [];
			for (var j = 0; j < book_versions.length; j++) {
				ids.push(book_versions[j].versions[0].version_id);
			};
			for (var j = 0; j < nodes.length; j++) {  // Convert nodes to book_versions format and add to nodes array
				var title = nodes[j].title;
				var urn = nodes[j].version["http://scalar.usc.edu/2012/01/scalar-ns#urn"][0].value;
				var version_id = urn.substr(urn.lastIndexOf(':')+1);
				if (-1!=ids.indexOf(version_id)) continue;
				book_versions.push({versions:[{version_id:version_id,title:title}]});
			};
			set_versions(book_versions);
		}
	});
}
</script>

<div class="container-fluid properties">
  <div class="row">
<?php if (isset($_REQUEST['action']) && $_REQUEST['action']=='book_style_saved'): ?>
      <div class="alert alert-success">Book properties have been saved<span style="float:right;"><a href="<?=base_url().$book->slug?>">return to <?=$book->scope?></a> &nbsp;|&nbsp; </a><a href="?book_id=<?=@$book_id?>&zone=style#tabs-style">remove notice</a><span></span></div>
<?php endif; ?>
    <section class="col-xs-12">
	  <form class="form-horizontal" action="<?=confirm_slash(base_url())?>system/dashboard" method="post" enctype="multipart/form-data" id="properties_form">
	  <input type="hidden" name="action" value="do_save_style" />
	  <input type="hidden" name="zone" value="style" />
	  <input type="hidden" name="book_id" value="<?=$book->book_id?>" />   
      <div class="form-group">
        <label for="title" class="col-sm-2 control-label">Title</label>
        <div class="col-sm-10">
          <input type="text" class="form-control" id="title" name="title" value="<?=htmlspecialchars($book->title)?>" required>
        </div>
      </div>
      <div class="form-group">
        <label for="subtitle" class="col-sm-2 control-label">Subtitle</label>
        <div class="col-sm-10">
          <input type="text" class="form-control" id="subtitle" name="subtitle" value="<?=htmlspecialchars($book->subtitle)?>">
        </div>
      </div>
      <div class="form-group">
        <label for="description" class="col-sm-2 control-label">Description</label>
        <div class="col-sm-10">
          <input type="text" class="form-control" id="description" name="description" value="<?=htmlspecialchars($book->description)?>">
        </div>
      </div>
      <div class="form-group">
        <label for="url" class="col-sm-2 control-label">URL</label>
        <div class="col-sm-10">
          <label style="margin-right:4px;" class="control-label label-text"><?=base_url()?></label>
          <input style="width:auto;" type="text" class="form-control" id="url" name="slug" value="<?=htmlspecialchars($book->slug)?>" required>
        </div>
      </div>
      <div class="form-group">
        <label for="scope" class="col-sm-2 control-label">Genre</label>
        <div class="col-sm-10">
          <select style="width:auto;float:left;margin-right:12px;" class="form-control" id="scope" name="scope">
            <option value="book"<?=(('book'==$book->scope)?' selected':'')?>>Book</option>
            <option value="article"<?=(('article'==$book->scope)?' selected':'')?>>Article</option>
            <option value="project"<?=(('project'==$book->scope)?' selected':'')?>>Project</option>
          </select>
          <label class="control-label label-text"><small>For cosmentic purposes only&mdash;will be displayed throughout the interface</small></label>
        </div>
      </div>
      <div class="form-group">
        <label for="permissions" class="col-sm-2 control-label">Permissions</label>
        <div class="col-sm-10">
		  <div class="checkbox">
		    <label>
		      <input type="checkbox" id="url_is_public_el"<?=(($book->url_is_public)?' checked':'')?>>
		      <input type="hidden" name="url_is_public" value="<?=(($book->url_is_public)?1:0)?>" />
		      No login required
		    </label>
		  </div>   
		  <div class="checkbox">
		    <label>
		      <input type="checkbox" id="display_in_index_el"<?=(($book->display_in_index)?' checked':'')?>>
		      <input type="hidden" name="display_in_index" value="<?=(($book->display_in_index)?1:0)?>" />
		      Can be found in Scalar index and by search engines
		    </label>
		  </div> 
		  <div class="checkbox">
		    <label>
		      <input type="checkbox" id="duplicatable" value="1">
		      Can be duplicated by you and others
		    </label>
		  </div>  
		  <!-- joinability isn't in the spec, so putting as a hidden element for now -->     
		  <input type="checkbox" id="joinable" value="1" style="display:none;">
        </div>
      </div>
      <div class="form-group">
        <label for="comments" class="col-sm-2 control-label">Comments</label>
        <div class="col-sm-10">
		  <div class="checkbox">
		    <label>
		      <input type="checkbox" id="auto-approve" value="1">
		      Automatically approve new comments
		    </label>
		  </div>   
		  <div class="checkbox">
		    <label>
		      <input type="checkbox" id="email-authors" value="1">
		      Email authors when comments are added
		    </label>
		  </div> 
		  <div class="checkbox">
		    <label>
		      <input type="checkbox" id="hypothesis" value="1">
		      Enable <a href="http://hypothes.is" target="_blank">Hypothes.is</a> sidebar
		    </label>
		  </div>       
        </div>
      </div>   
      <div class="form-group">
        <label for="toc" class="col-sm-2 control-label">Table of Contents</label>
        <div class="col-sm-5" id="toc-wrapper">
          <button type="button" class="btn btn-default">Add item</button>
        </div>
      </div>
      <div class="form-group">
        <label for="publisher" class="col-sm-2 control-label">Publisher credit</label>
        <div class="col-sm-10">
          <input type="text" class="form-control" id="publisher" name="publisher" value="<?=htmlspecialchars($book->publisher)?>">
          <small>Any HTML hyperlink included here will also be applied to the publisher logo</small>
        </div>
      </div>      
      <div class="form-group">
        <label for="upload_publisher_thumb" class="col-sm-2 control-label">Publisher logo</label>
        <div class="col-sm-4">
          <div class="input-group">
            <input type="hidden" name="publisher_thumbnail" value="<?=$book->publisher_thumbnail?>" />
            <label class="input-group-btn">
              <span class="btn btn-default">
                Choose file&hellip; <input type="file" name="upload_publisher_thumb" style="display:none;">
              </span>
            </label>
            <input type="text" class="form-control" readonly>
          </div>  
        </div>    
        <div class="col-sm-6 col-overrun-left">            
		  <label class="control-label label-text"><small>JPG, PNG, or GIF&mdash;will be resized to 120px</small></label>
		</div>
<?php if (!empty($book->publisher_thumbnail)): ?>
        <div class="col-sm-offset-2 col-sm-10">
          <div class="thumb-wrapper">
            <img src="<?=base_url().$book->slug.'/'.$book->publisher_thumbnail?>" />
          </div>
          <div class="checkbox" style="display:inline-block;">
            <label>
              <input type="checkbox" name="remove_publisher_thumbnail" value="1"> 
              Remove publisher thumbnail
            </label>
          </div>
        </div>
<?php endif; ?>
      </div>
      <div class="page-header"></div>  
      <div class="form-group">
        <div class="col-sm-12">
          <div class="pull-right">
            <button type="submit" class="btn btn-default">Save</button> &nbsp; 
            <button type="button" class="btn btn-primary">Save and return to book</button>
          </div>
        </div>
      </div>
      <div class="page-v-spacer">&nbsp;</div>     
      </form>
    </section>
  </div>
</div>

