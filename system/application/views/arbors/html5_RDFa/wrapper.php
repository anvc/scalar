<?
// Define page style based on precedence (book -> current path -> page)
$title = $description = $color = $primary_role = $default_view = '';
$background = $banner = $style = $js = $hypothesis = null;
$publisher = $publisher_thumbnail = null;
$is_new = true;
if (isset($book) && !empty($book)) {
	$title = $book->title;
	$description = $book->description;
	if (!empty($book->background)) $background = trim($book->background);
	if (!empty($book->custom_style)) $style .= $book->custom_style."\n";
	if (!empty($book->custom_js)) $js .= $book->custom_js."\n";
	if (stristr($book->title, 'data-hypothesis="true"')) $hypothesis = true;
	if (!empty($book->publisher)) $publisher = $book->publisher;
	if (!empty($book->publisher_thumbnail)) $publisher_thumbnail = $book->publisher_thumbnail;
}
if (isset($page->versions) && isset($page->versions[$page->version_index]->has_paths) && !empty($page->versions[$page->version_index]->has_paths)) {
	$path_index = $page->versions[$page->version_index]->requested_path_index;
	if (!empty($page->versions[$page->version_index]->has_paths[$path_index]->background)) $background = trim($page->versions[$page->version_index]->has_paths[$path_index]->background);
	if (!empty($page->versions[$page->version_index]->has_paths[$path_index]->custom_style)) $style .= trim($page->versions[$page->version_index]->has_paths[$path_index]->custom_style)."\n";
	if (!empty($page->versions[$page->version_index]->has_paths[$path_index]->custom_scripts)) $js .= trim($page->versions[$page->version_index]->has_paths[$path_index]->custom_scripts)."\n";
}
if (isset($page->version_index)) {
	$title = $page->versions[$page->version_index]->title;
	$description = $page->versions[$page->version_index]->description;
	$default_view = $page->versions[$page->version_index]->default_view;
	$color = $page->color;
	$primary_role = $page->primary_role;
	if (!empty($page->background)) $background = trim($page->background);
	if (!empty($page->banner)) $banner = trim($page->banner);
	if (!empty($page->custom_style)) $style .= $page->custom_style."\n";
	if (!empty($page->custom_scripts)) $js .= $page->custom_scripts."\n";
	$is_new = false;
}
if (isset($mode) && !empty($mode)) $background = null;
$rdf_fields = $this->config->item('rdf_fields');
if (!isset($rdf_fields['content'])) $rdf_fields['content'] = 'sioc:content';
function print_rdf($rdf, $tabs=0, $ns=array(), $hide=array(), $aria=false) {
	$hide = array_merge($hide, array('rdf:type','dcterms:title','sioc:content','scalar:customStyle','scalar:customScript'));
	foreach ($rdf as $p => $values) {
		if (in_array($p, $hide)) continue;
		foreach ($values as $value) {
			if (isURL($value['value'])) {
				$str = '<a class="metadata" aria-hidden="'.(($aria)?'false':'true').'" rel="'.toNS($p,$ns).'" href="'.$value['value'].'"></a>'."\n";
			} else {
				$str = '<span class="metadata" aria-hidden="'.(($aria)?'false':'true').'" property="'.toNS($p,$ns).'">'.$value['value'].'</span>'."\n";
			}
			for ($j = 0; $j < $tabs; $j++) {$str = "\t".$str;}
			echo $str;
		}
	}
}
echo '<?xml version="1.0" encoding="UTF-8"?>'."\n";
?>
<!DOCTYPE html>
<html xml:lang="en" lang="en"
	xmlns:dcterms="http://purl.org/dc/terms/"
	xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
	xmlns:sioc="http://rdfs.org/sioc/ns#"
	xmlns:foaf="http://xmlns.com/foaf/0.1/"
	xmlns:ov="http://open.vocab.org/terms/"
	xmlns:oac="http://www.openannotation.org/ns/"
	xmlns:scalar="http://scalar.usc.edu/2012/01/scalar-ns#"
	xmlns:prov="http://www.w3.org/ns/prov#"
	xmlns:exif="http://ns.adobe.com/exif/1.0/"
	xmlns:iptc="http://ns.exiftool.ca/IPTC/IPTC/1.0/"
	xmlns:bibo="http://purl.org/ontology/bibo/">
<head>
<title><?=strip_tags($title)?></title>
<base href="<?=$base_uri.((isset($page)&&!empty($page))?$page->slug.'.'.$page->versions[$page->version_index]->version_num:$slug.'.0')?>" />
<meta name="description" content="<?=htmlspecialchars(strip_tags($description))?>" />
<meta name="viewport" content="initial-scale=1, maximum-scale=1" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<? if (!$book->display_in_index || $is_new || !empty($version_datetime)): ?>
<meta name="robots" content="noindex, nofollow">
<? endif ?>
<meta property="og:title" content="<?=((isset($book))?htmlspecialchars(trim(strip_tags($book->title))).': ':'').((isset($page->version_index))?htmlspecialchars(trim(strip_tags($title))):'Untitled')?>" />
<meta property="og:site_name" content="<? if (isset($book)) { echo htmlspecialchars(trim(strip_tags($book->title))).((!empty($book->subtitle))?': '.htmlspecialchars(trim(strip_tags($book->subtitle))):''); } ?>" />
<meta property="og:url" content="<? echo confirm_slash($base_uri).((isset($page->version_index))?$page->slug:''); ?>" />
<meta property="og:description" content="<? if (isset($page->version_index)) {echo htmlspecialchars(create_excerpt($page->versions[$page->version_index]->content, 34));} else {echo htmlspecialchars(trim(strip_tags($description)));} ?>" />
<meta property="og:image" content="<?php
$default_img = $app_root.'views/arbors/html5_RDFa/scalar_logo_300x300.png';
if (isset($page->version_index)) {
	$img = first_og_image_from_html_string($page->versions[$page->version_index]->content);
	$url = $page->versions[$page->version_index]->url;
	if (!empty($img)) {
		echo abs_url(str_replace(' ','%20',$img),base_url().$book->slug);
	} elseif (!empty($url) && is_opengraphable_image($url)) {
		echo abs_url(str_replace(' ','%20',$url),base_url().$book->slug);
	} elseif (!empty($banner)) {
		echo abs_url(str_replace(' ','%20',$banner),base_url().$book->slug);
	} elseif (!empty($background)) {
		echo abs_url(str_replace(' ','%20',$background),base_url().$book->slug);
	} else {
		echo $default_img;
	}
} else {
	echo $default_img = $app_root.'views/arbors/html5_RDFa/scalar_logo_300x300.png';
}
?>" />
<meta property="og:type" content="article" />
<? if (isset($page) && !empty($page)): ?>
<link rel="canonical" href="<?=confirm_slash($base_uri).$page->slug?>" />
<? endif ?>
<link rel="shortcut icon" href="<?=confirm_slash($app_root)?>views/arbors/html5_RDFa/favicon_16.gif" />
<link rel="apple-touch-icon" href="<?=confirm_slash($app_root)?>views/arbors/html5_RDFa/favicon_114.jpg" />
<? if (isset($page)&&!empty($page)): ?>
<link id="urn" rel="scalar:urn" href="<?=$page->versions[$page->version_index]->urn?>" />
<? endif ?>
<? if (!empty($view)): ?>
<link id="view" href="<?=('vis'==$view)?$viz_view:$view?>" />
<link id="default_view" href="<?=$default_view?>" />
<? endif ?>
<? if (!empty($color)): ?>
<link id="color" rel="scalar:color" href="<?=$color?>" />
<? endif ?>
<? if (!empty($primary_role)): ?>
<link id="primary_role" rel="scalar:primary_role" href="<?=$primary_role?>" />
<? endif ?>
<? if (isset($use_proxy) && $use_proxy): ?>
<link id="use_proxy" href="true" />
<link id="proxy_url" href="<?=base_url().$book->slug.'/proxy'?>" />
<? endif ?>
<link id="book_id" href="<?=$book->book_id?>" />
<link id="parent" href="<?=$base_uri?>" />
<link id="approot" href="<?=confirm_slash(base_url())?>system/application/" />
<? if ($login->is_logged_in): ?>
<link id="logged_in" href="<?=confirm_slash(base_url())?>system/users/<?=$login->user_id?>" />
<? endif ?>
<? if ($login_is_super || $this->users->is_a($user_level,'reviewer')): ?>
<link id="user_level" href="scalar:<?=(($login_is_super)?'Author':ucwords($user_level))?>" />
<? endif ?>
<link id="flowplayer_key" href="<?=$this->config->item('flowplayer_key')?>" />
<link id="soundcloud_id" href="<?=$this->config->item('soundcloud_id')?>" />
<link id="recaptcha_public_key" href="<?=$recaptcha_public_key?>" />
<? if ($hypothesis): ?>
<link id="hypothesis" href="true" />
<? endif ?>
<link id="CI_elapsed_time" href="<?php echo $this->benchmark->elapsed_time()?>" />
<? if (!empty($_styles)) echo $_styles?>
<?=template_script_tag_relative(__FILE__, 'js/jquery-1.7.min.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/yepnope.1.5.3-min.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/yepnope.css.js')."\n"?>
<?="<script type=\"text/javascript\" src=\"https://maps.googleapis.com/maps/api/js?key=".$this->config->item('google_maps_key')."\"></script>"."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/html5shiv/dist/html5shiv.js')."\n" // Keep thus UNDER jQuery, etc., otherwise things go haywire?>
<? if (!empty($_scripts)) echo $_scripts?>
<?
if (!$mode && !empty($style)):
echo '<style>'."\n";
echo $style."\n";
echo '</style>'."\n";
endif;
if (!$mode && !empty($js)):
echo '<script>'."\n";
echo $js."\n";
echo '</script>'."\n";
endif;
?>
</head>
<body class="<?=((!empty($primary_role))?'primary_role_'.strtolower(substr($primary_role,strpos($primary_role,'#')+1)):'')?>"<?=(!empty($background))?' style="background-image:url('.str_replace(' ','%20',abs_url($background,$base_uri)).');"':''?>>

<?php echo $content; ?>
<article>
	<header>
<?
		$this->load->view('arbors/html5_RDFa/noticebar');
?>
		<!-- Book -->
		<span resource="<?=rtrim($base_uri,'/')?>" typeof="scalar:Book">
			<span property="dcterms:title" content="<?=htmlspecialchars(strip_tags($book->title))?>"><a id="book-title" href="<?=$base_uri?>index"><?=$book->title?><?=(isset($book->subtitle)&&!empty($book->subtitle))?'<span class="subtitle">: '.$book->subtitle.'</span>':''?></a></span>
<? if (isset($page->slug)) echo '			<a class="metadata" aria-hidden="true" rel="dcterms:hasPart" href="'.$base_uri.$page->slug.'"></a>'."\n"; ?>
			<a class="metadata" aria-hidden="true" rel="dcterms:tableOfContents" href="<?=$base_uri?>toc"></a>
<?
			foreach ($book->contributors as $contrib):
				if (empty($contrib->list_in_index)) continue;
				echo '			<a class="metadata" aria-hidden="true" rel="sioc:has_owner" href="'.$base_uri.'users/'.$contrib->user_id.$this->rdf_object->annotation_append($contrib).'"></a>'."\n";
			endforeach;
?>
<?=(($publisher||$publisher_thumbnail)?'			<a class="metadata" aria-hidden="true" rel="dcterms:publisher" href="'.$base_uri.'publisher"></a>'."\n":'')?>
		</span>
		<span aria-hidden="true" resource="<?=$base_uri?>toc" typeof="scalar:Page">
			<span class="metadata" property="dcterms:title">Main Menu</span>
<?			for ($j = 0; $j < count($book->versions); $j++): ?>
			<a class="metadata" rel="dcterms:references" href="<?=$base_uri.$book->versions[$j]->slug?>#index=<?=($j+1)?>"></a>
<?	 		endfor;?>
		</span>
<?		for ($j = 0; $j < count($book->versions); $j++):
			if ($book->versions[$j]->content_id == @$page->content_id) continue;
?>
		<span aria-hidden="true" resource="<?=$base_uri.$book->versions[$j]->slug?>" typeof="scalar:<?=('media'==$book->versions[$j]->type)?'Media':'Composite'?>">
			<a class="metadata" rel="dcterms:hasVersion" href="<?=$base_uri.$book->versions[$j]->slug.'.'.$book->versions[$j]->versions[0]->version_num?>"></a>
			<a class="metadata" rel="dcterms:isPartOf" href="<?=rtrim($base_uri,'/')?>"></a>
		</span>
		<span aria-hidden="true" resource="<?=$base_uri.$book->versions[$j]->slug.'.'.$book->versions[$j]->versions[0]->version_num?>" typeof="scalar:Version">
			<span class="metadata" property="dcterms:title"><?=$book->versions[$j]->versions[0]->title?></span>
			<span class="metadata" property="dcterms:description"><?=$book->versions[$j]->versions[0]->description?></span>
			<a class="metadata" rel="dcterms:isVersionOf" href="<?=$base_uri.$book->versions[$j]->slug?>"></a>
		</span>
<?
 		endfor;
		foreach ($book->contributors as $contrib):
			if (empty($contrib->list_in_index)) continue;
			echo '		<span resource="'.$base_uri.'users/'.$contrib->user_id.'" typeof="foaf:Person">'."\n";
			print_rdf($this->users->rdf($contrib, $base_uri), 3, $ns);
			echo '		</span>'."\n";
		endforeach;
		if ($publisher||$publisher_thumbnail):
?>
		<span aria-hidden="true" resource="<?=$base_uri?>publisher" typeof="scalar:Page">
			<span class="metadata" property="dcterms:title"><?=$publisher?></span>
<? if ($publisher_thumbnail): echo '			<a class="metadata" rel="art:thumbnail" href="'.abs_url($publisher_thumbnail, $base_uri).'"></a>'."\n"; endif; ?>
		</span>
<?		endif; ?>
<?php if (isset($page) && !empty($page)): ?>
		<!-- Page -->
		<h1 property="dcterms:title"><?=$title?></h1>
		<span resource="<?=$base_uri.$page->slug?>" typeof="scalar:<?=('media'==$page->type)?'Media':'Composite'?>">
			<a class="metadata" aria-hidden="true" rel="dcterms:hasVersion" href="<?=$base_uri.$page->slug.'.'.$page->versions[$page->version_index]->version_num?>"></a>
			<a class="metadata" aria-hidden="true" rel="dcterms:isPartOf" href="<?=rtrim($base_uri,'/')?>"></a>
<? 		print_rdf($this->pages->rdf($page, $base_uri), 3, $ns); ?>
		</span>
		<span resource="<?=$page->user->uri?>" typeof="foaf:Person">
<?		print_rdf($this->users->rdf($page->user, $base_uri), 3, $ns); ?>
		</span>
		<span class="metadata" aria-hidden="true" id="book-id"><?=$book->book_id?></span>
		<a class="metadata" aria-hidden="true" rel="dcterms:isVersionOf" href="<?=$base_uri.$page->slug?>"></a>
<?
		print_rdf($this->versions->rdf($page->versions[$page->version_index], $base_uri), 2, $ns, array('sioc:content'));
?>
		<span resource="<?=$page->versions[$page->version_index]->user->uri?>" typeof="foaf:Person">
<?		print_rdf($this->users->rdf($page->versions[$page->version_index]->user, $base_uri), 3, $ns); ?>
		</span>
<?
		if (isset($page->versions[$page->version_index]->continue_to)):
			echo '		<a aria-hidden="true" rel="scalar:continue_to" href="'.$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug.'.'.$page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->version_num.'"></a>'."\n";
?>
		<span aria-hidden="true" resource="<?=$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug?>" typeof="scalar:<?=('media'==$base_uri.$page->versions[$page->version_index]->continue_to[0]->type)?'Media':'Composite'?>">
			<span class="metadata" class="color" style="background-color:<?=$page->versions[$page->version_index]->continue_to[0]->color?>" property="scalar:color" content="<?=$page->versions[$page->version_index]->continue_to[0]->color?>"></span>
			<a class="metadata" rel="dcterms:hasVersion" href="<?=$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug.'.'.$page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->version_num?>"></a>
		</span>
		<span aria-hidden="true" resource="<?=$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug.'.'.$page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->version_num?>" typeof="scalar:Version">
			<span property="dcterms:title" content="<?=htmlspecialchars($page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->title)?>">
				<a href="<?=$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug?>"><?=$page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->title?></a>
			</span>
			<span class="metadata" property="dcterms:description"><?=$page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->description?></span>
			<a class="metadata" rel="dcterms:isVersionOf" href="<?=$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug?>"></a>
		</span>
<?
		endif;
?>
<?php endif; ?>
	</header>
	<span property="<?=$rdf_fields['content']?>"><?php
		if (!empty($_html)) {
			echo $_html;
		} elseif (isset($page) && !empty($page)) {
			echo str_replace("\r",'',str_replace("\n",'',nl2br($page->versions[$page->version_index]->content)));
		}
	?></span>

<?php
if (isset($page) && !empty($page)):
$has_references = (isset($page->versions[$page->version_index]->has_references)) ? $page->versions[$page->version_index]->has_references : array();
$reference_of = (isset($page->versions[$page->version_index]->reference_of)) ? $page->versions[$page->version_index]->reference_of : array();
unset($models[array_search('references',$models)]);
foreach ($models as $rel):
	$inward_rel = 'has_'.$rel;
	$inward_array = (isset($page->versions[$page->version_index]->$inward_rel)) ? $page->versions[$page->version_index]->$inward_rel : array();;
	$output_inward_content = (true===$this->config->item('output_rel_node_content')||@in_array($rel,$this->config->item('output_rel_node_content'))) ? true : false;
	$outward_rel = singular($rel).'_of';
	$outward_array = (isset($page->versions[$page->version_index]->$outward_rel)) ? $page->versions[$page->version_index]->$outward_rel : array();
	$output_outward_content = (true===$this->config->item('output_rel_node_content')||@in_array(singular($rel),$this->config->item('output_rel_node_content'))) ? true : false;
	if (!empty($inward_array)):
?>
	<section>
		<h1>This page has <?=$rel?>:</h1>
		<ol class="has_<?=$rel?>">
<?
		foreach ($inward_array as $inward_item):
			$page->versions[$page->version_index]->sort_number =@ (int) $inward_item->versions[$inward_item->version_index]->page_index;
			if ('paths'==$rel) $inward_item->versions[0]->sort_number =@ $inward_item->versions[0]->page_num;
			//if ('replies'==$rel) $inward_item->versions[0]->datetime =@ $inward_item->versions[$inward_item->version_index]->created;
?>
			<!-- Inward item -->
			<li resource="<?=$this->$rel->urn($inward_item->versions[$inward_item->version_index]->version_id,$page->versions[$page->version_index]->version_id,$inward_item->versions[$inward_item->version_index])?>" typeof="oac:Annotation">
				<a aria-hidden="true" rel="oac:hasBody" href="<?=$base_uri.$inward_item->slug.'.'.$inward_item->versions[$inward_item->version_index]->version_num?>"></a>
				<span resource="<?=$base_uri.$inward_item->slug?>" typeof="scalar:<?=('media'==$inward_item->type)?'Media':'Composite'?>">
					<a aria-hidden="true" rel="dcterms:hasVersion" href="<?=$base_uri.$inward_item->slug.'.'.$inward_item->versions[$inward_item->version_index]->version_num?>"></a>
<? 		print_rdf($this->pages->rdf($inward_item, $base_uri), 5, $ns); ?>				</span>
				<span resource="<?=$inward_item->user->uri?>" typeof="foaf:Person">
<?		print_rdf($this->users->rdf($inward_item->user, $base_uri), 5, $ns); ?>				</span>
				<span resource="<?=$base_uri.$inward_item->slug.'.'.$inward_item->versions[$inward_item->version_index]->version_num?>" typeof="scalar:Version">
					<a aria-hidden="true" rel="dcterms:isVersionOf" href="<?=$base_uri.$inward_item->slug?>"></a>
					<span aria-hidden="true" property="dcterms:title" content="<?=htmlspecialchars($inward_item->versions[$inward_item->version_index]->title)?>">
						<a href="<?=$base_uri.$inward_item->slug?>"><?=$inward_item->versions[$inward_item->version_index]->title?></a>
					</span>
					<span aria-hidden="true" property="scalar:fullname"><?=@$inward_item->versions[$inward_item->version_index]->user->fullname?></span>
<?
		print_rdf($this->versions->rdf($inward_item->versions[$inward_item->version_index], $base_uri), 5, $ns);
		if ($output_inward_content) echo "\t\t\t\t\t".'<span class="metadata" property="'.$rdf_fields['content'].'">'.$inward_item->versions[$inward_item->version_index]->content.'</span>'."\n";
?>				</span>
				<span aria-hidden="true" resource="<?=$inward_item->versions[$inward_item->version_index]->user->uri?>" typeof="foaf:Person">
<?		print_rdf($this->users->rdf($inward_item->versions[$inward_item->version_index]->user, $base_uri), 5, $ns); ?>				</span>
				<a rel="oac:hasTarget" href="<?=$base_uri.$page->slug.'.'.$page->versions[$page->version_index]->version_num?><?=annotation_append($inward_item->versions[$inward_item->version_index])?>"></a>
<? 				if (isset($inward_item->versions[0]->$outward_rel) && !empty($inward_item->versions[0]->$outward_rel)): ?>
				<!-- Items that the inward item contains -->
				<aside>
					<h4>Contents of this <?=singular($rel)?>:</h4>
					<ol class="<?=singular($rel)?>_of">
<?					foreach ($inward_item->versions[0]->$outward_rel as $key => $outward_item):
						$family_rel = '';
						if ($key===$inward_item->versions[0]->page_index) $family_rel = 'current-page';
						if ($key===$inward_item->versions[0]->prev_index) $family_rel = 'prev-page';
						if ($key===$inward_item->versions[0]->next_index) $family_rel = 'next-page';
						//$page->versions[$page->version_index]->sort_number =@ (int) $inward_item->versions[$inward_item->version_index]->page_index;
						if ('paths'==$rel) {
							$outward_item->versions[0]->sort_number = ($key+1);
						} else {
							$outward_item->versions[0]->sort_number = null;
						}
						if ('replies'==$rel) {
							//$outward_item->versions[0]->datetime =@ $outward_item->versions[$outward_item->version_index]->created;
						} else {
							$outward_item->versions[0]->datetime = null;
						}
?>
						<li class="<?=$family_rel?>" resource="<?=$this->$rel->urn($inward_item->versions[$inward_item->version_index]->version_id,$outward_item->versions[$outward_item->version_index]->version_id,$outward_item->versions[$outward_item->version_index])?>" typeof="oac:Annotation">
							<a rel="oac:hasBody" href="<?=$base_uri.$inward_item->slug.'.'.$inward_item->versions[$inward_item->version_index]->version_num?>"></a>
							<span aria-hidden="true" resource="<?=$base_uri.$outward_item->slug?>" typeof="scalar:<?=('media'==$outward_item->type)?'Media':'Composite'?>">
								<a rel="dcterms:hasVersion" href="<?=$base_uri.$outward_item->slug.'.'.$outward_item->versions[$outward_item->version_index]->version_num?>"></a>
<? 		print_rdf($this->pages->rdf($outward_item, $base_uri), 8, $ns); ?>							</span>
							<span aria-hidden="true" resource="<?=$base_uri.$outward_item->slug.'.'.$outward_item->versions[$outward_item->version_index]->version_num?>" typeof="scalar:Version">
								<a rel="dcterms:isVersionOf" href="<?=$base_uri.$outward_item->slug?>"></a>
								<span property="dcterms:title" content="<?=htmlspecialchars($outward_item->versions[$outward_item->version_index]->title)?>">
									<a href="<?=$base_uri.$outward_item->slug?>"><?=$outward_item->versions[$outward_item->version_index]->title?></a>
								</span>
<?
		print_rdf($this->versions->rdf($outward_item->versions[$outward_item->version_index], $base_uri), 8, $ns);
		if ($output_inward_content) echo "\t\t\t\t\t\t\t\t".'<span class="metadata" property="'.$rdf_fields['content'].'">'.$outward_item->versions[$outward_item->version_index]->content.'</span>'."\n";
?>							</span>
							<a rel="oac:hasTarget" href="<?=$base_uri.$outward_item->slug.'.'.$outward_item->versions[$outward_item->version_index]->version_num?><?=annotation_append($outward_item->versions[$outward_item->version_index])?>"></a>
						</li>
<? 					endforeach; ?>
					</ol>
				</aside>
<?				endif; ?>
			</li>
<? 		endforeach; ?>
		</ol>
	</section>
<?
	endif;
	if (!empty($outward_array)):
?>
	<section>
		<h1>Contents of this <?=singular($rel)?>:</h1>
		<ol class="<?=singular($rel)?>_of">
<?
		foreach ($outward_array as $outward_item):
			$outward_item->versions[$outward_item->version_index]->sort_number =@ (int) $outward_item->page_index;
			if ('paths'==$rel) $outward_item->versions[0]->sort_number =@ $outward_item->versions[0]->page_num;
			if ('replies'==$rel) $outward_item->versions[$outward_item->version_index]->datetime =@ $outward_item->versions[$outward_item->version_index]->created;
?>
			<!-- Outward item -->
			<li resource="<?=$this->$rel->urn($page->versions[$page->version_index]->version_id,$outward_item->versions[$outward_item->version_index]->version_id,$outward_item->versions[$outward_item->version_index])?>" typeof="oac:Annotation">
				<a aria-hidden="true" rel="oac:hasBody" href="<?=$base_uri.$page->slug.'.'.$page->versions[$page->version_index]->version_num?>"></a>
				<a aria-hidden="true" rel="oac:hasTarget" href="<?=$base_uri.$outward_item->slug.'.'.$outward_item->versions[$outward_item->version_index]->version_num?><?=annotation_append($outward_item->versions[$outward_item->version_index])?>"></a>
				<span resource="<?=$base_uri.$outward_item->slug?>" typeof="scalar:<?=('media'==$outward_item->type)?'Media':'Composite'?>">
					<a aria-hidden="true"  rel="dcterms:hasVersion" href="<?=$base_uri.$outward_item->slug.'.'.$outward_item->versions[$outward_item->version_index]->version_num?>"></a>
<? 		print_rdf($this->pages->rdf($outward_item), 5, $ns); ?>				</span>
				<span aria-hidden="true" resource="<?=$outward_item->user->uri?>" typeof="foaf:Person">
<?		print_rdf($this->users->rdf($outward_item->user, $base_uri), 5, $ns); ?>				</span>
				<span resource="<?=$base_uri.$outward_item->slug.'.'.$outward_item->versions[$outward_item->version_index]->version_num?>" typeof="scalar:Version">
					<a aria-hidden="true" rel="dcterms:isVersionOf" href="<?=$base_uri.$outward_item->slug?>"></a>
					<span aria-hidden="true" property="dcterms:title" content="<?=htmlspecialchars($outward_item->versions[$outward_item->version_index]->title)?>">
						<a href="<?=$base_uri.$outward_item->slug?>"><?=$outward_item->versions[$outward_item->version_index]->title?></a>
					</span>
					<span aria-hidden="true" property="scalar:fullname"><?=@$outward_item->versions[$outward_item->version_index]->fullname?></span>
<?
		print_rdf($this->versions->rdf($outward_item->versions[$outward_item->version_index]), 5, $ns);
		if ($output_outward_content) echo "\t\t\t\t\t".'<span class="metadata" property="'.$rdf_fields['content'].'">'.$outward_item->versions[$outward_item->version_index]->content.'</span>'."\n";
?>				</span>
				<span resource="<?=$outward_item->versions[$outward_item->version_index]->user->uri?>" typeof="foaf:Person">
<?		print_rdf($this->users->rdf($outward_item->versions[$outward_item->version_index]->user, $base_uri), 5, $ns); ?>				</span>
			</li>
<? 		endforeach; ?>
		</ol>
	</section>
<?
	endif;
endforeach;

if (!empty($has_references)):
	$output_references_content = (true===$this->config->item('output_rel_node_content')||@in_array('references',$this->config->item('output_rel_node_content'))) ? true : false;
?>
	<section>
		<h1>This page is referenced by:</h1>
		<ol>
<? 		foreach ($has_references as $reference_item): ?>
			<li>
				<a aria-hidden="true" rel="dcterms:isReferencedBy" href="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>"></a>
				<span resource="<?=$base_uri.$reference_item->slug?>" typeof="scalar:<?=('media'==$reference_item->type)?'Media':'Composite'?>">
					<a aria-hidden="true" rel="dcterms:hasVersion" href="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>"></a>
<? 		print_rdf($this->pages->rdf($reference_item), 5, $ns); ?>				</span>
				<span aria-hidden="true" resource="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>" typeof="scalar:Version">
					<span property="dcterms:title" content="<?=htmlspecialchars($reference_item->versions[$reference_item->version_index]->title)?>">
						<a href="<?=$base_uri.$reference_item->slug?>"><?=$reference_item->versions[$reference_item->version_index]->title?></a>
					</span>
					<a rel="dcterms:isVersionOf" href="<?=$base_uri.$reference_item->slug?>"></a>
<?
		print_rdf($this->versions->rdf($reference_item->versions[$reference_item->version_index]), 5, $ns);
		if ($output_references_content) echo "\t\t\t\t\t".'<span class="metadata" property="'.$rdf_fields['content'].'">'.$reference_item->versions[$reference_item->version_index]->content.'</span>'."\n";
?>				</span>
			</li>
<? 		endforeach; ?>
		</ol>
	</section>
<? endif; ?>
<?
if (!empty($reference_of)):
	$output_reference_content = (true===$this->config->item('output_rel_node_content')||@in_array('reference',$this->config->item('output_rel_node_content'))) ? true : false;
?>
	<section>
		<h1>This page references:</h1>
		<ol class="reference_of">
<? 		foreach ($reference_of as $reference_item): ?>
			<li>
				<a rel="dcterms:references" href="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>"></a>
				<span resource="<?=$base_uri.$reference_item->slug?>" typeof="scalar:<?=('media'==$reference_item->type)?'Media':'Composite'?>">
					<a aria-hidden="true" rel="dcterms:hasVersion" href="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>"></a>
<? 		print_rdf($this->pages->rdf($reference_item), 5, $ns); ?>				</span>
				<span resource="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>" typeof="scalar:Version">
					<span property="dcterms:title" content="<?=htmlspecialchars($reference_item->versions[$reference_item->version_index]->title)?>">
						<a href="<?=$base_uri.$reference_item->slug?>"><?=$reference_item->versions[$reference_item->version_index]->title?></a>
					</span>
					<a aria-hidden="true" rel="dcterms:isVersionOf" href="<?=$base_uri.$reference_item->slug?>"></a>
<?
		print_rdf($this->versions->rdf($reference_item->versions[$reference_item->version_index]), 5, $ns);
		if ($output_reference_content) echo "\t\t\t\t\t".'<span class="metadata" property="'.$rdf_fields['content'].'">'.$reference_item->versions[$reference_item->version_index]->content.'</span>'."\n";
?>				</span>
			</li>
<? 		endforeach; ?>
		</ol>
	</section>
<? endif; ?>
<?php endif; ?>
<?php
	$audio = null;
	if (isset($page->versions) && isset($page->versions[$page->version_index]->has_paths) && !empty($page->versions[$page->version_index]->has_paths)) {
		$path_index = $page->versions[$page->version_index]->requested_path_index;
		if (!empty($page->versions[$page->version_index]->has_paths[$path_index]->audio)) $audio = trim($page->versions[$page->version_index]->has_paths[$path_index]->audio);
	}
	if (isset($page->version_index)) {
		if (!empty($page->audio)) $audio = $page->audio;
	}
	if (!empty($audio)) {
		$audio = $this->pages->get_by_version_url($book->book_id, $audio, true); // Shortcut
		if (!empty($audio)) {
			$audio_href = $audio[key($audio)]->versions[0]->url;
			$audio_uri = $audio[key($audio)]->slug;
?>
	<section class="audio">
		<div class="paragraph_wrapper">
			<div class="body_copy">
				<!-- <div style="width:200px;"> -->
					<a aria-hidden="true" class="inline auto_play media_page" data-autoplay="true" data-size="medium" data-align="left" href="<?=$audio_href?>" resource="<?=$audio_uri?>"></a>
				<!-- </div> -->
			</div>
		</div>
	</section>
<?php
		}
	}?>
	</article>

</body>
</html>