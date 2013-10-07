<?
// Define page style based on precedence (book -> current path -> page)
$title = $description = $color = $primary_role = '';
$background = $default_view = $style = $js = null;
$is_new = true;
if (isset($book) && !empty($book)) {
	$title = $book->title;
	if (!empty($book->background)) $background = trim($book->background);
	if (!empty($book->custom_style)) $style .= $book->custom_style."\n";
	if (!empty($book->custom_js)) $js .= $book->custom_js."\n";
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
echo '<?xml version="1.0" encoding="UTF-8"?>'."\n";
?>
<!DOCTYPE html>
<html xml:lang="en" lang="en" xmlns:scalar="http://scalar.usc.edu/2012/01/scalar-ns#" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:sioc="http://rdfs.org/sioc/ns#" xmlns:oac="http://www.openannotation.org/ns/" xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#">
<head>
<title><?=strip_tags($title)?></title>
<base href="<?=$base_uri.((isset($page)&&!empty($page))?$page->slug.'.'.$page->versions[$page->version_index]->version_num:$slug.'.0')?>" />
<meta name="description" content="<?=htmlspecialchars(strip_tags($description))?>" />
<meta name="viewport" content="initial-scale=1" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<? if (!$book->display_in_index || $is_new): ?>
<meta name="robots" content="noindex, nofollow">
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
<? if (!empty($_styles)) echo $_styles?>
<?=template_link_tag_relative(__FILE__, 'css/jquery-ui-1.8.12.custom.css')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/jquery-1.7.min.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/jquery-ui-1.8.12.custom.min.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/yepnope.1.5.3-min.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/yepnope.css.js')."\n"?>
<?=template_script_tag_relative(__FILE__, 'js/raphael-min.js')."\n"?>
<? if (!empty($_scripts)) echo $_scripts?>
</head>
<body<?=(!empty($background))?' style="background-image:url('.str_replace(' ','%20',abs_url($background,$base_uri)).');"':''?>>

<?php echo $content ?>

<?php if (isset($page) && !empty($page)):?>

<article>

	<header>
		<span resource="<?=rtrim($base_uri,'/')?>" typeof="scalar:Book">
			<a href="<?=$base_uri?>index"><span id="book-title" property="dcterms:title"><?=$book->title?> </span></a>
			<a rel="dcterms:hasPart" href="<?=$base_uri.$page->slug?>"></a>
		</span>
		<span resource="<?=$base_uri.$page->slug?>" typeof="scalar:<?=('media'==$page->type)?'Media':'Composite'?>">
			<a rel="dcterms:hasVersion" href="<?=$base_uri.$page->slug.'.'.$page->versions[$page->version_index]->version_num?>"></a>
			<a rel="dcterms:isPartOf" href="<?=rtrim($base_uri,'/')?>"></a>	
		</span>	
		<span id="book-id" property=""><?=$book->book_id?></span>
	</header>

	<h1 property="dcterms:title"><?=$page->versions[$page->version_index]->title?></h1>
	<span property="dcterms:description"><?=$page->versions[$page->version_index]->description?></span>
	<span property="art:url"><?=$page->versions[$page->version_index]->url?></span>
	<span property="sioc:content"><?=nl2br($page->versions[$page->version_index]->content)?></span>
	<span property="scalar:defaultView"><?=$page->versions[$page->version_index]->default_view?></span>
	<a rel="dcterms:isVersionOf" href="<?=$base_uri.$page->slug?>"></a>
<?
	if (isset($page->versions[$page->version_index]->continue_to)):
		echo '	<a rel="scalar:continue_to" href="'.$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug.'.'.$page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->version_num.'"></a>'."\n";
?>
	<span resource="<?=$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug?>" typeof="scalar:<?=('media'==$base_uri.$page->versions[$page->version_index]->continue_to[0]->type)?'Media':'Composite'?>">
		<span class="color" style="background-color:<?=$page->versions[$page->version_index]->continue_to[0]->color?>" property="scalar:color" content="<?=$page->versions[$page->version_index]->continue_to[0]->color?>"></span>
		<a rel="dcterms:hasVersion" href="<?=$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug.'.'.$page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->version_num?>"></a>
	</span>				
	<span resource="<?=$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug.'.'.$page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->version_num?>" typeof="scalar:Version">				
		<span property="dcterms:title" content="<?=htmlspecialchars($page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->title)?>">
			<a href="<?=$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug?>"><?=$page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->title?></a>
		</span>
		<span property="dcterms:description"><?=$page->versions[$page->version_index]->continue_to[0]->versions[$page->versions[$page->version_index]->continue_to[0]->version_index]->description?></span>
		<a rel="dcterms:isVersionOf" href="<?=$base_uri.$page->versions[$page->version_index]->continue_to[0]->slug?>"></a>	
	</span>	
<?	
	endif;
?>
	
	
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
		<h3>This page has <?=$rel?>:</h3>
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
					<span class="color" style="background-color:<?=$inward_item->color?>" property="scalar:color" content="<?=$inward_item->color?>"></span>
					<a rel="dcterms:hasVersion" href="<?=$base_uri.$inward_item->slug.'.'.$inward_item->versions[$inward_item->version_index]->version_num?>"></a>
				</span>				
				<span resource="<?=$base_uri.$inward_item->slug.'.'.$inward_item->versions[$inward_item->version_index]->version_num?>" typeof="scalar:Version">				
					<span property="dcterms:title" content="<?=htmlspecialchars($inward_item->versions[$inward_item->version_index]->title)?>">
						<a href="<?=$base_uri.$inward_item->slug?>"><?=$inward_item->versions[$inward_item->version_index]->title?></a>
					</span>
					<span property="dcterms:description"><?=$inward_item->versions[$inward_item->version_index]->description?></span>
					<a rel="dcterms:isVersionOf" href="<?=$base_uri.$inward_item->slug?>"></a>	
				</span>	
				<a rel="oac:hasTarget" href="<?=$base_uri.$page->slug.'.'.$page->versions[$page->version_index]->version_num?><?=annotation_append($inward_item->versions[$inward_item->version_index])?>"></a>
<? 				if (isset($inward_item->versions[0]->$outward_rel) && !empty($inward_item->versions[0]->$outward_rel)): ?>
				<!-- Items that the inward item contains -->
				<aside>
					<h4>This page is <?=(('a'==substr($rel,0,1))?'an':'a')?> <?=singular($rel)?> of:</h4>
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
								<span class="color" style="background-color:<?=$outward_item->color?>" property="scalar:color" content="<?=$outward_item->color?>"></span>
								<a rel="dcterms:hasVersion" href="<?=$base_uri.$outward_item->slug.'.'.$outward_item->versions[$outward_item->version_index]->version_num?>"></a>
							</span>								
							<span resource="<?=$base_uri.$outward_item->slug.'.'.$outward_item->versions[$outward_item->version_index]->version_num?>" typeof="scalar:Version">
								<span property="dcterms:title" content="<?=htmlspecialchars($outward_item->versions[$outward_item->version_index]->title)?>">
									<a href="<?=$base_uri.$outward_item->slug?>"><?=$outward_item->versions[$outward_item->version_index]->title?></a>
								</span>
								<span property="dcterms:description"><?=$outward_item->versions[$outward_item->version_index]->description?></span>
								<a rel="dcterms:isVersionOf" href="<?=$base_uri.$outward_item->slug?>"></a>	
							</span>				
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
		<h3>This page is <?=(('a'==substr($rel,0,1))?'an':'a')?> <?=singular($rel)?> of:</h3>
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
					<span class="color" style="background-color:<?=$outward_item->color?>" property="scalar:color" content="<?=$outward_item->color?>"></span>
					<a rel="dcterms:hasVersion" href="<?=$base_uri.$outward_item->slug.'.'.$outward_item->versions[$outward_item->version_index]->version_num?>"></a>
				</span>
				<span resource="<?=$base_uri.$outward_item->slug.'.'.$outward_item->versions[$outward_item->version_index]->version_num?>" typeof="scalar:Version">
					<span property="dcterms:title" content="<?=htmlspecialchars($outward_item->versions[$outward_item->version_index]->title)?>">
						<a href="<?=$base_uri.$outward_item->slug?>"><?=$outward_item->versions[$outward_item->version_index]->title?></a>
					</span>
					<span property="dcterms:description"><?=$outward_item->versions[$outward_item->version_index]->description?></span>
					<a rel="dcterms:isVersionOf" href="<?=$base_uri.$outward_item->slug?>"></a>			
				</span>
			</li>
<? 		endforeach; ?>
		</ol>
	</section>
<? 
	endif; 
endforeach;

if (!empty($has_references)): ?>
	<section>
		<h3>This page is referenced by:</h3>
		<ol>
<? 		foreach ($has_references as $reference_item): ?>
			<li>
				<a rel="dcterms:isReferencedBy" href="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>"></a>
				<span resource="<?=$base_uri.$reference_item->slug?>" typeof="scalar:<?=('media'==$reference_item->type)?'Media':'Composite'?>">
					<span class="color" style="background-color:<?=$reference_item->color?>" property="scalar:color" content="<?=$reference_item->color?>"></span>
					<a rel="dcterms:hasVersion" href="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>"></a>
				</span>				
				<span resource="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>" typeof="scalar:Version">
					<span property="dcterms:title" content="<?=htmlspecialchars($reference_item->versions[$reference_item->version_index]->title)?>">
						<a href="<?=$base_uri.$reference_item->slug?>"><?=$reference_item->versions[$reference_item->version_index]->title?></a>
					</span>
					<span property="dcterms:description"><?=$reference_item->versions[$reference_item->version_index]->description?></span>
					<a rel="dcterms:isVersionOf" href="<?=$base_uri.$reference_item->slug?>"></a>	
				</span>					
			</li>
<? 		endforeach; ?>
		</ol>		
	</section>
<? endif; ?>
<? if (!empty($reference_of)): ?>
	<section>
		<h3>This page references:</h3>
		<ol>
<? 		foreach ($reference_of as $reference_item): ?>
			<li>
				<a rel="dcterms:references" href="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>"></a>
				<span resource="<?=$base_uri.$reference_item->slug?>" typeof="scalar:<?=('media'==$reference_item->type)?'Media':'Composite'?>">
					<span class="color" style="background-color:<?=$reference_item->color?>" property="scalar:color" content="<?=$reference_item->color?>"></span>
					<a rel="dcterms:hasVersion" href="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>"></a>
				</span>						
				<span resource="<?=$base_uri.$reference_item->slug.'.'.$reference_item->versions[$reference_item->version_index]->version_num?>" typeof="scalar:Version">
					<span property="dcterms:title" content="<?=htmlspecialchars($reference_item->versions[$reference_item->version_index]->title)?>">
						<a href="<?=$base_uri.$reference_item->slug?>"><?=$reference_item->versions[$reference_item->version_index]->title?></a>
					</span>
					<span property="dcterms:description"><?=$reference_item->versions[$reference_item->version_index]->description?></span>
					<a rel="dcterms:isVersionOf" href="<?=$base_uri.$reference_item->slug?>"></a>	
				</span>				
			</li>
<? 		endforeach; ?>
		</ol>		
	</section>
<? endif; ?>
		
</article>

<?php endif?>

</body>
</html>