<?
$url = abs_url($page->version->url, confirm_slash(base_url()).$book->slug);

$title =@ $page->version->title;
if (!empty($title)):
?>
<h4 class="content_title">
<?
	if (!empty($title)):
		if (!empty($view_icon)):
			echo '<img src="'.$view_icon.'" class="title_icon" />'."\n";
		endif;
		echo $title."<br />\n";
		echo '<span class="contains">Manage Annotations</span>';
	endif;
	?> 	
</h4>
<? endif ?>

<div class="horiz_slots"></div>

<div id="content"><a class="hide_icon" typeof="scalar:File" href="<?=$url?>" class="file" rel="meta" resource="<?=$uri?>"></a></div>

<div class="annobuilder">Loading ...</div>

<a href="javascript:;" style="float:right;" onclick="if (confirm('Are you sure you wish to leave this page?  Any unsaved annotations will be lost.')) document.location.href='<?=$uri?>';">Stop editing and return to resource</a>
<br />
