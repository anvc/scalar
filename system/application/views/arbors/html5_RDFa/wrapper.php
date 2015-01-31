<?
// Define page style based on precedence (book -> current path -> page)
$title = $description = $color = $primary_role = '';
$background = $default_view = $style = $js = $hypothesis = null;
$publisher = $publisher_thumbnail = null;
$is_new = true;
if (isset($book) && !empty($book)) {
	$title = $book->title;
	if (!empty($book->background)) $background = trim($book->background);
	if (!empty($book->custom_style)) $style .= $book->custom_style."\n";
	if (!empty($book->custom_js)) $js .= $book->custom_js."\n";
	if (stristr($book->title, 'data-hypothesis="true"')) $hypothesis = true;
	if (!empty($book->publisher)) $publisher = $book->publisher;
	if (!empty($book->publisher_thumbnail)) $publisher_thumbnail = $book->publisher_thumbnail;
}
if (isset($page->versions) && isset($page->versions[$page->version_index]->has_paths) && !empty($page->versions[$page->version_index]->has_paths)) {
	if (!empty($page->versions[$page->version_index]->has_paths[0]->background)) $background = trim($page->versions[$page->version_index]->has_paths[0]->background);
	if (!empty($page->versions[$page->version_index]->has_paths[0]->custom_style)) $style .= trim($page->versions[$page->version_index]->has_paths[0]->custom_style)."\n";
	if (!empty($page->versions[$page->version_index]->has_paths[0]->custom_scripts)) $js .= trim($page->versions[$page->version_index]->has_paths[0]->custom_scripts)."\n";
}
if (isset($page->version_index)) {
	$title = $page->versions[$page->version_index]->title;
	$description = $page->versions[$page->version_index]->description;
	$color = $page->color;
	$primary_role = $page->primary_role;
	if (!empty($page->background)) $background = trim($page->background);
	if (!empty($page->default_view)) $default_view = $page->default_view;
	if (!empty($page->custom_style)) $style .= $page->custom_style."\n";
	if (!empty($page->custom_scripts)) $js .= $page->custom_scripts."\n";
	$is_new = false;
}
if (isset($mode) && !empty($mode)) $background = null;
function print_rdf($rdf, $tabs=0, $ns=array()) {
	$hide = array('rdf:type','sioc:content','dcterms:title');
	foreach ($rdf as $p => $values) {
		if (in_array($p, $hide)) continue;
		foreach ($values as $value) {
			if (isURL($value['value'])) {
				$str = '<a class="metadata" rel="'.toNS($p,$ns).'" href="'.$value['value'].'"></a>'."\n";
			} else {
				$str = '<span class="metadata" property="'.toNS($p,$ns).'">'.$value['value'].'</span>'."\n";
			}
			for ($j = 0; $j < $tabs; $j++) {$str = "\t".$str;}
			echo $str;
		}
	}
}
echo '<?xml version="1.0" encoding="UTF-8"?>'."\n";
?>
<!DOCTYPE html>
<html xml:lang="en" lang="en" xmlns:scalar="http://scalar.usc.edu/2012/01/scalar-ns#" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:sioc="http://rdfs.org/sioc/ns#" xmlns:oac="http://www.openannotation.org/ns/" xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#" xmlns:foaf="http://xmlns.com/foaf/0.1/" xmlns:ov="http://open.vocab.org/terms/" xmlns:prov="http://www.w3.org/ns/prov#">
<head>
<title><?=strip_tags($title)?></title>
<base href="<?=$base_uri.((isset($page)&&!empty($page))?$page->slug.'.'.$page->versions[$page->version_index]->version_num:$slug.'.0')?>" />
<meta name="description" content="<?=htmlspecialchars(strip_tags($description))?>" />
<meta name="viewport" content="initial-scale=1" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<? if (!$book->display_in_index || $is_new || !empty($version_datetime)): ?>
<meta name="robots" content="noindex, nofollow">
<? endif ?>
<? if (isset($page) && !empty($page)): ?>
<link rel="canonical" href="<?=confirm_slash($base_uri).$page->slug?>" />
<? endif ?>
<link rel="shortcut icon" href="<?=confirm_slash($app_root)?>views/arbors/html5_RDFa/favicon_16.gif" />
<link rel="apple-touch-icon" href="<?=confirm_slash($app_root)?>views/arbors/html5_RDFa/favicon_114.jpg" />
<? if (isset($page)&&!empty($page)): ?>
<link id="urn" rel="scalar:urn" href="<?=$page->versions[$page->version_index]->urn?>" />
<? endif ?>
<? if (!empty($view)): ?>
<link id="default_view" rel="scalar:default_view" href="<?=('vis'==$view)?$viz_view:$view?>" />
<? endif ?>
<? if (!empty($color)): ?>
<link id="color" rel="scalar:color" href="<?=$color?>" />
<? endif ?>
<? if (!empty($primary_role)): ?>
<link id="primary_role" rel="scalar:primary_role" href="<?=$primary_role?>" />
<? endif ?>
<link id="book_id" href="<?=$book->book_id?>" />
<link id="parent" href="<?=$base_uri?>" />
<link id="approot" href="<?=confirm_slash(base_url())?>system/application/" />
<? if ($login->is_logged_in): ?>
<link id="logged_in" href="<?=confirm_slash(base_url())?>system/users/<?=$login->user_id?>" />
<? endif ?>
<? if ($login_is_super || $this->users->is_a($user_level,'commentator')): ?>
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
<?=template_script_tag_relative(__FILE__, 'js/raphael-min.js')."\n"?>
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
<body<?=(!empty($background))?' style="background-image:url('.str_replace(' ','%20',abs_url($background,$base_uri)).');"':''?>>

<?php echo $content ?>
<?php // print_r($page) ?>
<?php if (isset($page) && !empty($page)):?>

<article>

	<header>
<?
		$this->load->view('arbors/html5_RDFa/noticebar');
?>
		<h1 property="dcterms:title"><?=$page->versions[$page->version_index]->title?></h1>
		<span resource="<?=rtrim($base_uri,'/')?>" typeof="scalar:Book">
			<span property="dcterms:title" content="<?=htmlspecialchars(strip_tags($book->title))?>"><a id="book-title" href="<?=$base_uri?>index"><?=$book->title?></a></span>
			<a class="metadata" rel="dcterms:hasPart" href="<?=$base_uri.$page->slug?>"></a>
			<a class="metadata" rel="dcterms:tableOfContents" href="<?=$base_uri?>toc"></a>
<?
			foreach ($book->contributors as $contrib):
				if (empty($contrib->list_in_index)) continue;
				echo '			<a class="metadata" rel="sioc:has_owner" href="'.$base_uri.'users/'.$contrib->user_id.$this->rdf_object->annotation_append($contrib).'"></a>'."\n";
			endforeach;
?>
<?=(($publisher||$publisher_thumbnail)?'			<a class="metadata" rel="dcterms:publisher" href="'.$base_uri.'publisher"></a>'."\n":'')?>
		</span>
		<span resource="<?=$base_uri?>toc" typeof="scalar:Page">
			<span class="metadata" property="dcterms:title">Main Menu</span>
<?			for ($j = 0; $j < count($book->versions); $j++): ?>
			<a class="metadata" rel="dcterms:references" href="<?=$base_uri.$book->versions[$j]->slug?>#index=<?=($j+1)?>"></a>
<?	 		endfor;?>
		</span>
<?		for ($j = 0; $j < count($book->versions); $j++):
			if ($book->versions[$j]->content_id == $page->content_id) continue;
?>
		<span resource="<?=$base_uri.$book->versions[$j]->slug?>" typeof="scalar:<?=('media'==$book->versions[$j]->type)?'Media':'Composite'?>">
			<a class="metadata" rel="dcterms:hasVersion" href="<?=$base_uri.$book->versions[$j]->slug.'.'.$book->versions[$j]->versions[0]->version_num?>"></a>
			<a class="metadata" rel="dcterms:isPartOf" href="<?=rtrim($base_uri,'/')?>"></a>
		</span>
		<span resource="<?=$base_uri.$book->versions[$j]->slug.'.'.$book->versions[$j]->versions[0]->version_num?>" typeof="scalar:Version">
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
		<span resource="<?=$base_uri?>publisher" typeof="scalar:Resource">
			<span class="metadata" property="dcterms:title"><?=$publisher?></span>
<? if ($publisher_thumbnail): echo '			<a class="metadata" rel="art:thumbnail" href="'.abs_url($publisher_thumbnail, $base_uri).'"></a>'."\n"; endif; ?>
		</span>
<?		endif; ?>
		<span resource="<?=$base_uri.$page->slug?>" typeof="scalar:<?=('media'==$page->type)?'Media':'Composite'?>">
			<a class="metadata" rel="dcterms:hasVersion" href="<?=$base_uri.$page->slug.'.'.$page->versions[$page->version_index]->version_num?>"></a>
			<a class="metadata" rel="dcterms:isPartOf" href="<?=rtrim($base_uri,'/')?>"></a>
<? 		print_rdf($this->pages->rdf($page, $base_uri), 3, $ns); ?>
		</span>
		<span resource="<?=$page->user->uri?>" typeof="foaf:Person">
<?		print_rdf($this->users->rdf($page->user, $base_uri), 3, $ns); ?>
		</span>
		<span class="metadata" id="book-id"><?=$book->book_id?></span>
		<a class="metadata" rel="dcterms:isVersionOf" href="<?=$base_uri.$page->slug?>"></a>
<?
		print_rdf($this->versions->rdf($page->versions[$page->version_index], $base_uri), 2, $ns);
?>
		<span resource="<?=$page->versions[$page->version_index]->user->uri?>" typeof="foaf:Person">
<?		print_rdf($this->users->rdf($page->versions[$page->version_index]->user, $base_uri), 3, $ns); ?>
		</span>
<?
		if (isset($page->versions[$page->version_index]->continue_to)):
			echo '		<a rel="scalar:continue_to" href="'.$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug.'.'.$page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->version_num.'"></a>'."\n";
?>
		<span resource="<?=$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug?>" typeof="scalar:<?=('media'==$base_uri.$page->versions[$page->version_index]->continue_to[0]->type)?'Media':'Composite'?>">
			<span class="metadata" class="color" style="background-color:<?=$page->versions[$page->version_index]->continue_to[0]->color?>" property="scalar:color" content="<?=$page->versions[$page->version_index]->continue_to[0]->color?>"></span>
			<a class="metadata" rel="dcterms:hasVersion" href="<?=$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug.'.'.$page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->version_num?>"></a>
		</span>
		<span resource="<?=$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug.'.'.$page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->version_num?>" typeof="scalar:Version">
			<span property="dcterms:title" content="<?=htmlspecialchars($page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->title)?>">
				<a href="<?=$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug?>"><?=$page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->title?></a>
			</span>
			<span class="metadata" property="dcterms:description"><?=$page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->description?></span>
			<a class="metadata" rel="dcterms:isVersionOf" href="<?=$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug?>"></a>
		</span>
<?
		endif;
?>
	</header>

	<span property="sioc:content"><?=str_replace("\r",'',str_replace("\n",'',nl2br($page->versions[$page->version_index]->content)))?></span>
<?

$has_references = $page->versions[$page->version_index]->has_references;
$reference_of = $page->versions[$page->version_index]->reference_of;
unset($models[array_search('references',$models)]);
foreach ($models as $rel):
	$inward_rel = 'has_'.$rel;
	$inward_array = $page->versions[$page->version_index]->$inward_rel;
	$outward_rel = singular($rel).'_of';
	$outward_array = $page->versions[$page->version_index]->$outward_rel;
	if (!empty($inward_array)):
?>
	<section>
		<h1>This page has <?=$rel?>:</h1>
		<ol class="has_<?=$rel?>">
<?
		foreach ($inward_array as $inward_item):
			$page->versions[$page->version_index]->sort_number =@ (int) $inward_item->versions[$inward_item->version_index]->page_index;
			if ('paths'==$rel) $inward_item->versions[0]->sort_number =@ $inward_item->versions[0]->page_num;
			if ('replies'==$rel) $inward_item->versions[0]->datetime =@ $inward_item->versions[$inward_item->version_index]->created;
?>
			<!-- Inward item -->
			<li resource="urn:scalar:<?=singular($rel)?>:<?=$inward_item->versions[$inward_item->version_index]->version_id?>:<?=$page->versions[$page->version_index]->version_id?>" typeof="oac:Annotation">
				<a rel="oac:hasBody" href="<?=$base_uri.$inward_item->slug.'.'.$inward_item->versions[$inward_item->version_index]->version_num?>"></a>
				<span resource="<?=$base_uri.$inward_item->slug?>" typeof="scalar:<?=('media'==$inward_item->type)?'Media':'Composite'?>">
					<a rel="dcterms:hasVersion" href="<?=$base_uri.$inward_item->slug.'.'.$inward_item->versions[$inward_item->version_index]->version_num?>"></a>
<? 		print_rdf($this->pages->rdf($inward_item, $base_uri), 5, $ns); ?>				</span>
				<span resource="<?=$inward_item->user->uri?>" typeof="foaf:Person">
<?		print_rdf($this->users->rdf($inward_item->user, $base_uri), 5, $ns); ?>				</span>
				<span resource="<?=$base_uri.$inward_item->slug.'.'.$inward_item->versions[$inward_item->version_index]->version_num?>" typeof="scalar:Version">
					<a rel="dcterms:isVersionOf" href="<?=$base_uri.$inward_item->slug?>"></a>
					<span property="dcterms:title" content="<?=htmlspecialchars($inward_item->versions[$inward_item->version_index]->title)?>">
						<a href="<?=$base_uri.$inward_item->slug?>"><?=$inward_item->versions[$inward_item->version_index]->title?></a>
					</span>
					<span property="scalar:fullname"><?=@$inward_item->versions[$inward_item->version_index]->user->fullname?></span>
<? 		print_rdf($this->versions->rdf($inward_item->versions[$inward_item->version_index], $base_uri), 5, $ns); ?>				</span>
				<span resource="<?=$inward_item->versions[$inward_item->version_index]->user->uri?>" typeof="foaf:Person">
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
							$outward_item->versions[0]->datetime =@ $outward_item->versions[$outward_item->version_index]->created;
						} else {
							$outward_item->versions[0]->datetime = null;
						}
?>
						<li class="<?=$family_rel?>" resource="urn:scalar:<?=singular($rel)?>:<?=$outward_item->versions[$outward_item->version_index]->version_id?>:<?=$inward_item->versions[$inward_item->version_index]->version_id?>" typeof="oac:Annotation">
							<a rel="oac:hasBody" href="<?=$base_uri.$inward_item->slug.'.'.$inward_item->versions[$inward_item->version_index]->version_num?>"></a>
							<span resource="<?=$base_uri.$outward_item->slug?>" typeof="scalar:<?=('media'==$outward_item->type)?'Media':'Composite'?>">
								<a rel="dcterms:hasVersion" href="<?=$base_uri.$outward_item->slug.'.'.$outward_item->versions[$outward_item->version_index]->version_num?>"></a>
<? 		print_rdf($this->pages->rdf($outward_item, $base_uri), 8, $ns); ?>							</span>
							<span resource="<?=$base_uri.$outward_item->slug.'.'.$outward_item->versions[$outward_item->version_index]->version_num?>" typeof="scalar:Version">
								<a rel="dcterms:isVersionOf" href="<?=$base_uri.$outward_item->slug?>"></a>
								<span property="dcterms:title" content="<?=htmlspecialchars($outward_item->versions[$outward_item->version_index]->title)?>">
									<a href="<?=$base_uri.$outward_item->slug?>"><?=$outward_item->versions[$outward_item->version_index]->title?></a>
								</span>
<? 		print_rdf($this->versions->rdf($outward_item->versions[$outward_item->version_index], $base_uri), 8, $ns); ?>							</span>
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
			<li resource="urn:scalar:<?=singular($rel)?>:<?=$page->versions[$page->version_index]->version_id?>:<?=$outward_item->versions[$outward_item->version_index]->version_id?>" typeof="oac:Annotation">
				<a rel="oac:hasBody" href="<?=$base_uri.$page->slug.'.'.$page->versions[$page->version_index]->version_num?>"></a>
				<a rel="oac:hasTarget" href="<?=$base_uri.$outward_item->slug.'.'.$outward_item->versions[$outward_item->version_index]->version_num?><?=annotation_append($outward_item->versions[$outward_item->version_index])?>"></a>
				<span resource="<?=$base_uri.$outward_item->slug?>" typeof="scalar:<?=('media'==$outward_item->type)?'Media':'Composite'?>">
					<a rel="dcterms:hasVersion" href="<?=$base_uri.$outward_item->slug.'.'.$outward_item->versions[$outward_item->version_index]->version_num?>"></a>
<? 		print_rdf($this->pages->rdf($outward_item), 5, $ns); ?>				</span>
				<span resource="<?=$outward_item->user->uri?>" typeof="foaf:Person">
<?		print_rdf($this->users->rdf($outward_item->user, $base_uri), 5, $ns); ?>				</span>
				<span resource="<?=$base_uri.$outward_item->slug.'.'.$outward_item->versions[$outward_item->version_index]->version_num?>" typeof="scalar:Version">
					<a rel="dcterms:isVersionOf" href="<?=$base_uri.$outward_item->slug?>"></a>
					<span property="dcterms:title" content="<?=htmlspecialchars($outward_item->versions[$outward_item->version_index]->title)?>">
						<a href="<?=$base_uri.$outward_item->slug?>"><?=$outward_item->versions[$outward_item->version_index]->title?></a>
					</span>
					<span property="scalar:fullname"><?=@$outward_item->versions[$outward_item->version_index]->fullname?></span>
<? 		print_rdf($this->versions->rdf($outward_item->versions[$outward_item->version_index]), 5, $ns); ?>				</span>
				<span resource="<?=$outward_item->versions[$outward_item->version_index]->user->uri?>" typeof="foaf:Person">
<?		print_rdf($this->users->rdf($outward_item->versions[$outward_item->version_index]->user, $base_uri), 5, $ns); ?>				</span>
			</li>
<? 		endforeach; ?>
		</ol>
	</section>
<?
	endif;
endforeach;

if (!empty($has_references)): ?>
	<section>
		<h1>This page is referenced by:</h1>
		<ol>
<? 		foreach ($has_references as $reference_item): ?>
			<li>
				<a rel="dcterms:isReferencedBy" href="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>"></a>
				<span resource="<?=$base_uri.$reference_item->slug?>" typeof="scalar:<?=('media'==$reference_item->type)?'Media':'Composite'?>">
					<a rel="dcterms:hasVersion" href="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>"></a>
<? 		print_rdf($this->pages->rdf($reference_item), 5, $ns); ?>				</span>
				<span resource="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>" typeof="scalar:Version">
					<span property="dcterms:title" content="<?=htmlspecialchars($reference_item->versions[$reference_item->version_index]->title)?>">
						<a href="<?=$base_uri.$reference_item->slug?>"><?=$reference_item->versions[$reference_item->version_index]->title?></a>
					</span>
					<a rel="dcterms:isVersionOf" href="<?=$base_uri.$reference_item->slug?>"></a>
<? 		print_rdf($this->versions->rdf($reference_item->versions[$reference_item->version_index]), 5, $ns); ?>				</span>
			</li>
<? 		endforeach; ?>
		</ol>
	</section>
<? endif; ?>
<? if (!empty($reference_of)): ?>
	<section>
		<h1>This page references:</h1>
		<ol class="reference_of">
<? 		foreach ($reference_of as $reference_item): ?>
			<li>
				<a rel="dcterms:references" href="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>"></a>
				<span resource="<?=$base_uri.$reference_item->slug?>" typeof="scalar:<?=('media'==$reference_item->type)?'Media':'Composite'?>">
					<a rel="dcterms:hasVersion" href="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>"></a>
<? 		print_rdf($this->pages->rdf($reference_item), 5, $ns); ?>				</span>
				<span resource="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>" typeof="scalar:Version">
					<span property="dcterms:title" content="<?=htmlspecialchars($reference_item->versions[$reference_item->version_index]->title)?>">
						<a href="<?=$base_uri.$reference_item->slug?>"><?=$reference_item->versions[$reference_item->version_index]->title?></a>
					</span>
					<a rel="dcterms:isVersionOf" href="<?=$base_uri.$reference_item->slug?>"></a>
<? 		print_rdf($this->versions->rdf($reference_item->versions[$reference_item->version_index]), 5, $ns); ?>				</span>
			</li>
<? 		endforeach; ?>
		</ol>
	</section>
<? endif; ?>

</article>

<?php endif?>

</body>
</html>