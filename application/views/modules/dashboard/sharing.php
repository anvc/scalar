<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>

<script>
$(window).ready(function() {

    $('.save_changes').next('a').on('click', function() {
    	$('#sharing_form').trigger('submit');
    	return false;
    });

	var $title = $('<div>'+$('input[name="title"]').val()+'</div>');
	var is_duplicatable = ('undefined'==typeof($title.children(":first").attr('data-duplicatable'))) ? 0 : 1;
	var is_joinable = ('undefined'==typeof($title.children(":first").attr('data-joinable'))) ? 0 : 1;
	var auto_approve = ('undefined'==typeof($title.children(":first").attr('data-auto-approve'))) ? 0 : 1;
	var email_authors = ('undefined'==typeof($title.children(":first").attr('data-email-authors'))) ? 0 : 1;
	var hypothesis = ('undefined'==typeof($title.children(":first").attr('data-hypothesis'))) ? 0 : 1;
	var thoughtmesh = ('undefined'==typeof($title.children(":first").attr('data-thoughtmesh'))) ? 0 : 1;
	var semantic_annotation_tool = ('undefined'==typeof($title.children(":first").attr('data-semantic-annotation-tool'))) ? 0 : 1;
	$('#duplicatable').val(is_duplicatable);
	$('#joinable').val(is_joinable);
	$('#hypothesis').val(hypothesis);
	$('#thoughtmesh').val(thoughtmesh);
	$('#semantic-annotation-tool').val(semantic_annotation_tool);
	$('#auto-approve').val(auto_approve);
	$('#email-authors').val(email_authors);
	$('#duplicatable, #joinable, #hypothesis,#thoughtmesh,#auto-approve,#email-authors').on('change', function() {
		var $title = $('<div>'+$('input[name="title"]').val()+'</div>');
		if (!$title.children(':first').is('span')) $title.contents().wrap('<span></span>');
		var $span = $title.children(':first');
		var prop_arr = ['duplicatable', 'joinable', 'hypothesis', 'thoughtmesh','auto-approve','email-authors'];
		var all_false = true;
		for (var j in prop_arr) {
			var prop = prop_arr[j];
			var make_true = (parseInt($('#'+prop).val())) ? true : false;
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
		var make_true = (parseInt($('#semantic-annotation-tool').val())) ? true : false;
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

});
</script>

<form id="sharing_form" action="<?=confirm_slash(base_url())?>main/dashboard" method="post" enctype="multipart/form-data">
<input type="hidden" name="action" value="do_save_sharing" />
<input type="hidden" name="zone" value="sharing" />
<? if (!empty($book)): ?>
<input type="hidden" name="book_id" value="<?=$book->book_id?>" />
<? endif ?>
<table cellspacing="0" cellpadding="0" style="width:100%;" class="trim_horz_padding">


<?php
	if (empty($book)) {
		echo 'Please select a book to manage using the pulldown menu above';
	}
	if (isset($_REQUEST['action']) && $_REQUEST['action']=='book_sharing_saved') {
		echo '<div class="saved">';
		echo 'Sharing options have been saved ';
		echo '<div style="float:right;">';
		echo '<a href="'.confirm_slash(base_url()).$book->slug.'">back to '.$book->scope.'</a>';
		echo ' | ';
		echo '<a href="?book_id='.$book->book_id.'&zone=sharing#tabs-sharing">clear</a>';
		echo '</div>';
		echo '</div><br />';
	}

	$row = $book;
	if (!empty($row)):
		// Double check that we're looking at the correct book
		if (!empty($book_id) && $row->book_id != $book_id) die('Could not match book with book ID');

	echo '<tr style="display:none;">';
	echo '<td><p>Title</p></td>';
	echo '<td colspan="2"><input name="title" type="text" value="'.htmlspecialchars($row->title).'" style="width:100%;" /></td>';
	echo '</tr>'."\n";

	echo '<tr typeof="books">';
	echo '<td><p>Availability</p>';
	echo '</td>'."\n";
	echo '<td style="vertical-align:middle;" colspan="2">';
	echo '<p>';
	echo 'Make URL public? &nbsp;<select name="url_is_public"><option value="0"'.(($row->url_is_public)?'':' selected').'>No</option><option value="1"'.(($row->url_is_public)?' selected':'').'>Yes</option></select>';
	echo '<br /><small>Book can be accessed via its URL without requiring login permissions</small>';
	echo '</p>';
	echo '<p>';
	echo 'Display in Scalar indexes? &nbsp;<select name="display_in_index"><option value="0"'.(($row->display_in_index)?'':' selected').'>No</option><option value="1"'.(($row->display_in_index)?' selected':'').'>Yes</option></select>';
	echo '<br /><small>Book will be listed in lists of public books, feeds, etc</small>';
	echo '</p>';
	echo "</td>\n";
	echo "</tr>\n";
	echo '<tr typeof="books">';
	echo '<td><p>Reviewability<br />&amp; Readability</p>';
	echo '</td>'."\n";
	echo '<td style="vertical-align:middle;" colspan="2">';
	echo '<p>';
	echo 'Automatically approve all user comments? &nbsp;<select id="auto-approve"><option value="0" selected>No</option><option value="1">Yes</option></select>';
	echo '<br /><small>If set to "No" comments are moderated and can be approved by authors in the Comments tab</small>';
	echo '</p>';
	echo '<p>';
	echo 'Email book authors about new comments? &nbsp;<select id="email-authors"><option value="0" selected>No</option><option value="1">Yes</option></select>';
	echo '<br /><small>If set to "Yes" users with author privileges (set in Book users tab) will be emailed when new comments are contributed</small>';
	echo '</p>';
	echo '<p>';
	echo 'Add the <a href="https://hypothes.is/" target="_blank">Hypothes.is</a> sidebar? &nbsp;<select id="hypothesis"><option value="0" selected>No</option><option value="1">Yes</option></select>';
	echo '<br /><small>A sidebar will be layered over your book adding <a href="https://hypothes.is/" target="_blank">Hypothes.is</a> collaborative review and commenting features</small>';
	echo '</p>';
	if(isset($plugins) && isset($plugins['thoughtmesh'])) {
		echo '<p>';
		echo 'Add the <a href="http://thoughtmesh.net/" target="_blank">Thoughtmesh</a> widget to the footer? &nbsp;<select id="thoughtmesh"><option value="0" selected>No</option><option value="1">Yes</option></select>';
		echo '<br /><small>A widget will be added to the footer of each Scalar 2 page in your book adding <a href="http://thoughtmesh.net/" target="_blank">Thoughtmesh</a> page interconnections</small>';
		echo '</p>';
	}
	echo '<p>';
	echo 'Use <a href="http://mediaecology.dartmouth.edu/" target="_blank">MEP</a>\'s <a href="http://mediaecology.dartmouth.edu/wp/projects/technology/the-semantic-annotation-tool" target="_blank">Semantic Annotation Tool</a> rather than the browser\'s player for HTML5 videos &nbsp;<select id="semantic-annotation-tool"><option value="0" selected>No</option><option value="1">Yes</option></select>';
	echo '<div style="margin-top:0px;margin-bottom:8px;">Tag taxonomy URL: <input type="text" name="sat-tax" value="https://onomy.org/published/83/json" style="width:30%;" /> &nbsp; <span style="white-space:nowrap;">Tag taxonomy language: ';
	echo '<select name="sat-lang" style="width:100px;"><option value="ab">Abkhaz</option><option value="aa">Afar</option><option value="af">Afrikaans</option><option value="ak">Akan</option><option value="sq">Albanian</option><option value="am">Amharic</option><option value="ar">Arabic</option><option value="an">Aragonese</option><option value="hy">Armenian</option><option value="as">Assamese</option><option value="av">Avaric</option><option value="ae">Avestan</option><option value="ay">Aymara</option><option value="az">Azerbaijani</option><option value="bm">Bambara</option><option value="ba">Bashkir</option><option value="eu">Basque</option><option value="be">Belarusian</option><option value="bn">Bengali; Bangla</option><option value="bh">Bihari</option><option value="bi">Bislama</option><option value="bs">Bosnian</option><option value="br">Breton</option><option value="bg">Bulgarian</option><option value="my">Burmese</option><option value="ca">Catalan; Valencian</option><option value="ch">Chamorro</option><option value="ce">Chechen</option><option value="ny">Chichewa; Chewa; Nyanja</option><option value="zh">Chinese</option><option value="cv">Chuvash</option><option value="kw">Cornish</option><option value="co">Corsican</option><option value="cr">Cree</option><option value="hr">Croatian</option><option value="cs">Czech</option><option value="da">Danish</option><option value="dv">Divehi; Dhivehi; Maldivian;</option><option value="nl">Dutch</option><option value="dz">Dzongkha</option><option value="en" selected>English</option><option value="eo">Esperanto</option><option value="et">Estonian</option><option value="ee">Ewe</option><option value="fo">Faroese</option><option value="fj">Fijian</option><option value="fi">Finnish</option><option value="fr">French</option><option value="ff">Fula; Fulah; Pulaar; Pular</option><option value="gl">Galician</option><option value="ka">Georgian</option><option value="de">German</option><option value="el">Greek, Modern</option><option value="gn">Guaraní</option><option value="gu">Gujarati</option><option value="ht">Haitian; Haitian Creole</option><option value="ha">Hausa</option><option value="he">Hebrew (modern)</option><option value="hz">Herero</option><option value="hi">Hindi</option><option value="ho">Hiri Motu</option><option value="hu">Hungarian</option><option value="ia">Interlingua</option><option value="id">Indonesian</option><option value="ie">Interlingue</option><option value="ga">Irish</option><option value="ig">Igbo</option><option value="ik">Inupiaq</option><option value="io">Ido</option><option value="is">Icelandic</option><option value="it">Italian</option><option value="iu">Inuktitut</option><option value="ja">Japanese</option><option value="jv">Javanese</option><option value="kl">Kalaallisut, Greenlandic</option><option value="kn">Kannada</option><option value="kr">Kanuri</option><option value="ks">Kashmiri</option><option value="kk">Kazakh</option><option value="km">Khmer</option><option value="ki">Kikuyu, Gikuyu</option><option value="rw">Kinyarwanda</option><option value="ky">Kyrgyz</option><option value="kv">Komi</option><option value="kg">Kongo</option><option value="ko">Korean</option><option value="ku">Kurdish</option><option value="kj">Kwanyama, Kuanyama</option><option value="la">Latin</option><option value="lb">Luxembourgish, Letzeburgesch</option><option value="lg">Ganda</option><option value="li">Limburgish, Limburgan, Limburger</option><option value="ln">Lingala</option><option value="lo">Lao</option><option value="lt">Lithuanian</option><option value="lu">Luba-Katanga</option><option value="lv">Latvian</option><option value="gv">Manx</option><option value="mk">Macedonian</option><option value="mg">Malagasy</option><option value="ms">Malay</option><option value="ml">Malayalam</option><option value="mt">Maltese</option><option value="mi">M�ori</option><option value="mr">Marathi (Mar�ṭhī)</option><option value="mh">Marshallese</option><option value="mn">Mongolian</option><option value="na">Nauru</option><option value="nv">Navajo, Navaho</option><option value="nb">Norwegian Bokmål</option><option value="nd">North Ndebele</option><option value="ne">Nepali</option><option value="ng">Ndonga</option><option value="nn">Norwegian Nynorsk</option><option value="no">Norwegian</option><option value="ii">Nuosu</option><option value="nr">South Ndebele</option><option value="oc">Occitan</option><option value="oj">Ojibwe, Ojibwa</option><option value="cu">Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic</option><option value="om">Oromo</option><option value="or">Oriya</option><option value="os">Ossetian, Ossetic</option><option value="pa">Panjabi, Punjabi</option><option value="pi">P�li</option><option value="fa">Persian (Farsi)</option><option value="pl">Polish</option><option value="ps">Pashto, Pushto</option><option value="pt">Portuguese</option><option value="qu">Quechua</option><option value="rm">Romansh</option><option value="rn">Kirundi</option><option value="ro">Romanian, [])</option><option value="ru">Russian</option><option value="sa">Sanskrit (Sa�skṛta)</option><option value="sc">Sardinian</option><option value="sd">Sindhi</option><option value="se">Northern Sami</option><option value="sm">Samoan</option><option value="sg">Sango</option><option value="sr">Serbian</option><option value="gd">Scottish Gaelic; Gaelic</option><option value="sn">Shona</option><option value="si">Sinhala, Sinhalese</option><option value="sk">Slovak</option><option value="sl">Slovene</option><option value="so">Somali</option><option value="st">Southern Sotho</option><option value="es">Spanish; Castilian</option><option value="su">Sundanese</option><option value="sw">Swahili</option><option value="ss">Swati</option><option value="sv">Swedish</option><option value="ta">Tamil</option><option value="te">Telugu</option><option value="tg">Tajik</option><option value="th">Thai</option><option value="ti">Tigrinya</option><option value="bo">Tibetan Standard, Tibetan, Central</option><option value="tk">Turkmen</option><option value="tl">Tagalog</option><option value="tn">Tswana</option><option value="to">Tonga (Tonga Islands)</option><option value="tr">Turkish</option><option value="ts">Tsonga</option><option value="tt">Tatar</option><option value="tw">Twi</option><option value="ty">Tahitian</option><option value="ug">Uyghur, Uighur</option><option value="uk">Ukrainian</option><option value="ur">Urdu</option><option value="uz">Uzbek</option><option value="ve">Venda</option><option value="vi">Vietnamese</option><option value="vo">Volapük</option><option value="wa">Walloon</option><option value="cy">Welsh</option><option value="wo">Wolof</option><option value="fy">Western Frisian</option><option value="xh">Xhosa</option><option value="yi">Yiddish</option><option value="yo">Yoruba</option><option value="za">Zhuang, Chuang</option><option value="zu">Zulu</option></select>';
	echo '</span></div>';
	echo '<small>The Semantic Annotation Tool (SAT) presents video annotations in an expanded area that is Accessible to the visually impared, along with other features</small>';
	echo '</p>';
	echo "</td>\n";
	echo "</tr>\n";
	echo '<td><p>Joinability</p>';
	echo '</td>'."\n";
	echo '<td style="vertical-align:middle;" colspan="2">';
	echo '<p>';
	echo 'Allow requests to join book? &nbsp;<select id="joinable"><option value="0" selected>No</option><option value="1">Yes</option></select>';
	echo '<br /><small>An email will be sent to you when a user requests book authorship</small>';
	echo '</p>';
	echo "</td>\n";
	echo "</tr>\n";
	echo '<tr typeof="books">';
	echo '<td><p>Duplicability</p>';
	echo '</td>'."\n";
	echo '<td style="vertical-align:middle;" colspan="2">';
	echo '<p>';
	echo 'Allow book to be duplicated by others? &nbsp;<select id="duplicatable"><option value="0" selected>No</option><option value="1">Yes</option></select>';
	echo '<br /><small>Book will display in list of duplicatable books regardless of availability settings</small>';
	echo '</p>';
	echo "</td>\n";
	echo "</tr>\n";
	// Saves
	echo "<tr>\n";
	echo '<td style="padding-top:8px;text-align:right;" colspan="3"><span class="save_changes">You have unsaved changes.</span> &nbsp; <a class="generic_button large default" href="javascript:;">Save</a></td>';
	echo "</tr>\n";
	endif;
?>
</table>
</form>
