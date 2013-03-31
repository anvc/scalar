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
	</header>

	<h1 property="dcterms:title"><?=$page->versions[$page->version_index]->title?></h1>
	<span property="dcterms:description"><?=$page->versions[$page->version_index]->description?></span>
	<span property="art:url"><a href="<?=$page->versions[$page->version_index]->url?>"><?=$page->versions[$page->version_index]->url?></a></span>
	<span property="sioc:content"><?=nl2br($page->versions[$page->version_index]->content)?></span>
	<a rel="dcterms:isVersionOf" href="<?=$base_uri.$page->slug?>"></a>
	
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
						if ('paths'==$rel) $outward_item->versions[0]->sort_number = ($key+1);;
						if ('replies'==$rel) $outward_item->versions[0]->datetime =@ $outward_item->versions[$outward_item->version_index]->created;
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