<?
if (empty($book)) {
	header('Location: '.$this->base_url.'?zone=user');
	exit;
}
?>
<?$this->template->add_css('system/application/views/modules/dashboot/css/custom.jquery-ui.min.css')?>
<?$this->template->add_css('system/application/views/modules/dashboot/css/bootstrap-dialog.min.css')?>
<?$this->template->add_css('system/application/views/widgets/edit/content_selector.css')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/custom.jquery-ui.min.js')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/bootstrap-dialog.min.js')?>
<?$this->template->add_js('system/application/views/melons/cantaloupe/js/bootbox.min.js')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.content_selector_bootstrap.js')?>


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
    $('#url_is_public_el, #display_in_index_el').on('change', function() {
    	var $el = $(this);
    	var name = $el.attr('id').replace('_el','');
    	var value = ($el.is(':checked')) ? 1 : 0;
    	$el.parent().find('input[name="'+name+'"]').val(value);
    });
    // Thumb upload change
    $('input[name="upload_publisher_thumb"]').on('change', function() {
        var oFReader = new FileReader();
        oFReader.readAsDataURL(this.files[0]);
        oFReader.onload = function(oFREvent) {
			$('#publisher_thumb_wrapper').show().find('img:first')[0].src = oFREvent.target.result;
        };
    });
    // Warn user about changing the book slug
    $('input[name="slug"]').data('orig-value',$('input[name="slug"]').val()).on('keydown', function() {
		var $this = $(this);
		if ($this.data('active')) return;
		$this.data('active',true);
		if (true!==$this.data('confirmed')) {
			BootstrapDialog.show({
				type: 'type-warning',
				title: 'Warning',
	            message: 'Changing the URL segment of the project will change its location on the web, which will make its old URLs, any uploaded media, and any existing bookmarks inaccessible. Do you wish to continue?',
	            buttons: [{
	                label: 'Cancel',
	                cssClass: 'btn-default',
	                action: function(dialog) {
		                $this.data('active',false);
						$this.data('confirmed',false);
						dialog.close();
						$this.val($this.data('orig-value'));
						$this.trigger('blur');
	                }
	            }, {
	                label: 'Continue',
	                cssClass: 'btn-primary',
	                action: function(dialog) {
	                	$this.data('active',false);
						$this.data('confirmed',true);
						dialog.close();
						$this.trigger('focus');
	                }
	            }]
	        });
		}
    });
    // Properties that overload the title via its <span> tag
	var title_init_values = function() {
		var $title = $('<div>'+$('input[name="title"]').val()+'</div>');
		var is_duplicatable = ('undefined'==typeof($title.children(":first").attr('data-duplicatable'))) ? false : true;
		var hide_versions = ('undefined'==typeof($title.children(":first").attr('data-hide-versions'))) ? false : true;
		var is_joinable = ('undefined'==typeof($title.children(":first").attr('data-joinable'))) ? false : true;
		var auto_approve = ('undefined'==typeof($title.children(":first").attr('data-auto-approve'))) ? false : true;
		var email_authors = ('undefined'==typeof($title.children(":first").attr('data-email-authors'))) ? false : true;
		var hypothesis = ('undefined'==typeof($title.children(":first").attr('data-hypothesis'))) ? false : true;
		var thoughtmesh = ('undefined'==typeof($title.children(":first").attr('data-thoughtmesh'))) ? false : true;
		var semantic_annotation_tool = ('undefined'==typeof($title.children(":first").attr('data-semantic-annotation-tool'))) ? false : true;
		$('#duplicatable').prop('checked', is_duplicatable);
		$('#hide-versions').prop('checked', hide_versions);
		$('#joinable').prop('checked', is_joinable);
		$('#hypothesis').prop('checked', hypothesis);
		$('#thoughtmesh').prop('checked', thoughtmesh);
		$('#semantic-annotation-tool').prop('checked', semantic_annotation_tool);
		$('#auto-approve').prop('checked', auto_approve);
		$('#email-authors').prop('checked', email_authors);
    };
    title_init_values();
    $('input[name="title"]').trigger('change', title_init_values);
	$('#duplicatable,#hide-versions,#joinable,#hypothesis,#thoughtmesh,#auto-approve,#email-authors').on('change', function() {
		var $title = $('<div>'+$('input[name="title"]').val()+'</div>');
		if (!$title.children(':first').is('span')) $title.contents().wrap('<span></span>');
		var $span = $title.children(':first');
		var prop_arr = ['duplicatable', 'hide-versions', 'joinable', 'hypothesis', 'thoughtmesh', 'auto-approve','email-authors'];
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
	var $title = $('<div>'+$('input[name="title"]').val()+'</div>');
	var sat_value = ('undefined'!=typeof($title.children(":first").attr('data-semantic-annotation-tool'))) ? $title.children(":first").attr('data-semantic-annotation-tool') : null;
	if (sat_value != null) {
		var arr = sat_value.split(',');
		var onomy_url = arr[0];
		var language = ('undefined'!=typeof(arr[1])) ? arr[1] : 'en';
		$('input[name="sat-tax"]').val(onomy_url);
		$('select[name="sat-lang"]').val(language);
	}
	$('#semantic-annotation-tool').on('change', function() {
		var $title = $('<div>'+$('input[name="title"]').val()+'</div>');
		if (!$title.children(':first').is('span')) $title.contents().wrap('<span></span>');
		var $span = $title.children(':first');
		var make_true = ($('#semantic-annotation-tool').is(':checked')) ? true : false;
		if (make_true) {
			var value = '';
			value += $('input[name="sat-tax"]').val();
			value += ','+$('select[name="sat-lang"]').val();
			$span.attr('data-semantic-annotation-tool', value);
		} else {
			$span.removeAttr('data-semantic-annotation-tool');
		}
		if($title.children(':first').is('span') && !$title.children(':first').get(0).attributes.length) {
			$title.children(':first').contents().unwrap();
		}
		$('input[name="title"]').val( $title.html() );
	});
	$('input[name="sat-tax"], select[name="sat-lang"]').on('change', function() {
		var $title = $('<div>'+$('input[name="title"]').val()+'</div>');
		if (!$title.children(':first').is('span')) $title.contents().wrap('<span></span>');
		var $span = $title.children(':first');
		var value = '';
		value += $('input[name="sat-tax"]').val();
		value += ','+$('select[name="sat-lang"]').val();
		$span.attr('data-semantic-annotation-tool', value);
		if($title.children(':first').is('span') && !$title.children(':first').get(0).attributes.length) {
			$title.children(':first').contents().unwrap();
		}
		$('input[name="title"]').val( $title.html() );
	});
	// Main menu
	book_versions = JSON.parse($("#book_versions").text());  // global
	set_versions(book_versions);
	$('#toc-wrapper').find('button').on('click', function() {
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
	$versions.find('li').off("mouseover").each(function() {
		ids.push($(this).data('version_id'));
	});
	for (var j = 0; j < nodes.length; j++) {
		var $item = $('<li class="list-group-item"><span class="num"></span>. '+nodes[j].versions[0].title+'</li>').appendTo($versions);
		var $close = $('<span class="glyphicon glyphicon-remove pull-right"></span>').prependTo($item);
		var $menu = $('<span class="glyphicon glyphicon-menu-hamburger pull-left"></span>').prependTo($item);
		var $input = $('<input type="hidden" name="book_version_'+nodes[j].versions[0].version_id+'" value="1" />').appendTo($item);
		$item.data('version_id', nodes[j].versions[0].version_id);
		$item.data('node', nodes[j]);
		$close.on('click', function() {
			$(this).closest('li').remove();
			set_version_numbers();
		});
	};
	set_version_numbers();
	$versions.find('li').find('.glyphicon:first').on('mouseover', function() {
		$(this).closest('li').addClass('list-group-item-info');
	}).on('mouseout', function() {
		$(this).closest('li').removeClass('list-group-item-info')
	});
	$versions.sortable({
		  axis: "y",
		  containment: "#toc-wrapper",
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
          <label class="control-label label-text"><small>For cosmetic purposes only&mdash;will be displayed throughout the interface</small></label>
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
		  <div class="checkbox">
		    <label>
		      <input type="checkbox" id="hide-versions" value="1">
		      Only authors and editors can see past versions
		    </label>
		  </div>
		  <!-- joinability isn't in the spec, so putting as a hidden element for now -->
		  <input type="checkbox" id="joinable" value="1" style="display:none;">
        </div>
      </div>
      <div class="form-group form-group-bottom-margin">
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
      <div class="form-group form-group-bottom-margin">
        <label for="comments" class="col-sm-2 control-label">Plugins</label>
        <div class="col-sm-10">
          <!--
		  <div class="checkbox">
		    <label>
		      <input type="checkbox" id="thoughtmesh" value="1">
		      Add <a href="http://thoughtmesh.net/" target="_blank">ThoughtMesh</a> to the footer
		    </label>
		  </div>
		  -->
		  <div class="checkbox">
		    <label>
		      <input type="checkbox" id="semantic-annotation-tool" value="1">
		      Use <a href="http://mediaecology.dartmouth.edu/" target="_blank">MEP</a>'s <a href="http://mediaecology.dartmouth.edu/wp/projects/technology/the-semantic-annotation-tool" target="_blank">Semantic Annotation Tool</a> rather than the browser's player for HTML5 videos
		      <div style="margin-top:4px;margin-bottom:0px;">Tag taxonomy URL: <input type="text" name="sat-tax" value="https://onomy.org/published/83/json" style="width:250px;" /> &nbsp; <span style="white-space:nowrap;">Tag taxonomy language: 
		      <select name="sat-lang" style="width:100px;"><option value="ab">Abkhaz</option><option value="aa">Afar</option><option value="af">Afrikaans</option><option value="ak">Akan</option><option value="sq">Albanian</option><option value="am">Amharic</option><option value="ar">Arabic</option><option value="an">Aragonese</option><option value="hy">Armenian</option><option value="as">Assamese</option><option value="av">Avaric</option><option value="ae">Avestan</option><option value="ay">Aymara</option><option value="az">Azerbaijani</option><option value="bm">Bambara</option><option value="ba">Bashkir</option><option value="eu">Basque</option><option value="be">Belarusian</option><option value="bn">Bengali; Bangla</option><option value="bh">Bihari</option><option value="bi">Bislama</option><option value="bs">Bosnian</option><option value="br">Breton</option><option value="bg">Bulgarian</option><option value="my">Burmese</option><option value="ca">Catalan; Valencian</option><option value="ch">Chamorro</option><option value="ce">Chechen</option><option value="ny">Chichewa; Chewa; Nyanja</option><option value="zh">Chinese</option><option value="cv">Chuvash</option><option value="kw">Cornish</option><option value="co">Corsican</option><option value="cr">Cree</option><option value="hr">Croatian</option><option value="cs">Czech</option><option value="da">Danish</option><option value="dv">Divehi; Dhivehi; Maldivian;</option><option value="nl">Dutch</option><option value="dz">Dzongkha</option><option value="en" selected>English</option><option value="eo">Esperanto</option><option value="et">Estonian</option><option value="ee">Ewe</option><option value="fo">Faroese</option><option value="fj">Fijian</option><option value="fi">Finnish</option><option value="fr">French</option><option value="ff">Fula; Fulah; Pulaar; Pular</option><option value="gl">Galician</option><option value="ka">Georgian</option><option value="de">German</option><option value="el">Greek, Modern</option><option value="gn">Guaraní</option><option value="gu">Gujarati</option><option value="ht">Haitian; Haitian Creole</option><option value="ha">Hausa</option><option value="he">Hebrew (modern)</option><option value="hz">Herero</option><option value="hi">Hindi</option><option value="ho">Hiri Motu</option><option value="hu">Hungarian</option><option value="ia">Interlingua</option><option value="id">Indonesian</option><option value="ie">Interlingue</option><option value="ga">Irish</option><option value="ig">Igbo</option><option value="ik">Inupiaq</option><option value="io">Ido</option><option value="is">Icelandic</option><option value="it">Italian</option><option value="iu">Inuktitut</option><option value="ja">Japanese</option><option value="jv">Javanese</option><option value="kl">Kalaallisut, Greenlandic</option><option value="kn">Kannada</option><option value="kr">Kanuri</option><option value="ks">Kashmiri</option><option value="kk">Kazakh</option><option value="km">Khmer</option><option value="ki">Kikuyu, Gikuyu</option><option value="rw">Kinyarwanda</option><option value="ky">Kyrgyz</option><option value="kv">Komi</option><option value="kg">Kongo</option><option value="ko">Korean</option><option value="ku">Kurdish</option><option value="kj">Kwanyama, Kuanyama</option><option value="la">Latin</option><option value="lb">Luxembourgish, Letzeburgesch</option><option value="lg">Ganda</option><option value="li">Limburgish, Limburgan, Limburger</option><option value="ln">Lingala</option><option value="lo">Lao</option><option value="lt">Lithuanian</option><option value="lu">Luba-Katanga</option><option value="lv">Latvian</option><option value="gv">Manx</option><option value="mk">Macedonian</option><option value="mg">Malagasy</option><option value="ms">Malay</option><option value="ml">Malayalam</option><option value="mt">Maltese</option><option value="mi">M�ori</option><option value="mr">Marathi (Mar�ṭhī)</option><option value="mh">Marshallese</option><option value="mn">Mongolian</option><option value="na">Nauru</option><option value="nv">Navajo, Navaho</option><option value="nb">Norwegian Bokmål</option><option value="nd">North Ndebele</option><option value="ne">Nepali</option><option value="ng">Ndonga</option><option value="nn">Norwegian Nynorsk</option><option value="no">Norwegian</option><option value="ii">Nuosu</option><option value="nr">South Ndebele</option><option value="oc">Occitan</option><option value="oj">Ojibwe, Ojibwa</option><option value="cu">Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic</option><option value="om">Oromo</option><option value="or">Oriya</option><option value="os">Ossetian, Ossetic</option><option value="pa">Panjabi, Punjabi</option><option value="pi">P�li</option><option value="fa">Persian (Farsi)</option><option value="pl">Polish</option><option value="ps">Pashto, Pushto</option><option value="pt">Portuguese</option><option value="qu">Quechua</option><option value="rm">Romansh</option><option value="rn">Kirundi</option><option value="ro">Romanian, [])</option><option value="ru">Russian</option><option value="sa">Sanskrit (Sa�skṛta)</option><option value="sc">Sardinian</option><option value="sd">Sindhi</option><option value="se">Northern Sami</option><option value="sm">Samoan</option><option value="sg">Sango</option><option value="sr">Serbian</option><option value="gd">Scottish Gaelic; Gaelic</option><option value="sn">Shona</option><option value="si">Sinhala, Sinhalese</option><option value="sk">Slovak</option><option value="sl">Slovene</option><option value="so">Somali</option><option value="st">Southern Sotho</option><option value="es">Spanish; Castilian</option><option value="su">Sundanese</option><option value="sw">Swahili</option><option value="ss">Swati</option><option value="sv">Swedish</option><option value="ta">Tamil</option><option value="te">Telugu</option><option value="tg">Tajik</option><option value="th">Thai</option><option value="ti">Tigrinya</option><option value="bo">Tibetan Standard, Tibetan, Central</option><option value="tk">Turkmen</option><option value="tl">Tagalog</option><option value="tn">Tswana</option><option value="to">Tonga (Tonga Islands)</option><option value="tr">Turkish</option><option value="ts">Tsonga</option><option value="tt">Tatar</option><option value="tw">Twi</option><option value="ty">Tahitian</option><option value="ug">Uyghur, Uighur</option><option value="uk">Ukrainian</option><option value="ur">Urdu</option><option value="uz">Uzbek</option><option value="ve">Venda</option><option value="vi">Vietnamese</option><option value="vo">Volapük</option><option value="wa">Walloon</option><option value="cy">Welsh</option><option value="wo">Wolof</option><option value="fy">Western Frisian</option><option value="xh">Xhosa</option><option value="yi">Yiddish</option><option value="yo">Yoruba</option><option value="za">Zhuang, Chuang</option><option value="zu">Zulu</option></select>
		      </span></div>
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
        <label for="publisher" class="col-sm-2 control-label">Publisher Credit</label>
        <div class="col-sm-10">
          <input type="text" class="form-control" id="publisher" name="publisher" value="<?=htmlspecialchars($book->publisher)?>">
          <small>Any HTML hyperlink included here will also be applied to the publisher logo</small>
        </div>
      </div>
      <div class="form-group">
        <label for="upload_publisher_thumb" class="col-sm-2 control-label">Publisher Logo</label>
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
        <div id="publisher_thumb_wrapper" class="col-sm-offset-2 col-sm-10" style="<?=(!empty($book->publisher_thumbnail))?'':'display:none'?>">
          <div class="thumb-wrapper">
            <img src="<?=base_url().$book->slug.'/'.$book->publisher_thumbnail?>?t=<?=time()?>" />
          </div>
          <div class="checkbox" style="display:inline-block;">
            <label>
              <input type="checkbox" name="remove_publisher_thumbnail" value="1">
              Remove publisher thumbnail
            </label>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="publisher" class="col-sm-2 control-label">Terms of Service</label>
        <div class="col-sm-10">
          <input type="text" class="form-control" id="terms_of_service" name="terms_of_service" value="<?=htmlspecialchars($book->terms_of_service)?>">
          <small>Enter the URL to your Terms of Service</small>
        </div>
      </div>

			<div class="form-group">
				<label for="publisher" class="col-sm-2 control-label">Privacy Policy</label>
				<div class="col-sm-10">
					<input type="text" class="form-control" id="privacy_policy" name="privacy_policy" value="<?=htmlspecialchars($book->privacy_policy)?>">
          <small>Enter the URL to your Privacy Policy</small>
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
