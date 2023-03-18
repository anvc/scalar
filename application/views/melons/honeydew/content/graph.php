<?
$page_slug = is_object($page) ? $page->slug : $page['slug'];
?>

<div style="height:500px;">
<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
	id="GraphView" width="100%" height="500"
	codebase="http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab">
	<param name="movie" value="<?=confirm_slash($view_root)?>static/flash/GraphView.swf" />
	<param name="flashVars" value="parent_uri=<?=confirm_slash(base_url()).$book->slug?>&uri=<?=confirm_slash(base_url()).confirm_slash($book->slug).$page_slug?>">
	<param name="quality" value="high" />
	<param name="wmode" value="transparent" />
	<param name="bgcolor" value="#ffffff" />
  	<param name="allowScriptAccess" value="sameDomain" />
	<embed src="<?=confirm_slash($view_root)?>static/flash/GraphView.swf" quality="high" bgcolor="#ffffff"
		width="100%" height="500" name="GraphView" align="middle"
		flashVars="parent_uri=<?=((!empty($page)) ? confirm_slash(base_url()).$book->slug.'&uri='.confirm_slash(base_url()).confirm_slash($book->slug).$page_slug : confirm_slash(base_url()).$book->slug.'&uri='.confirm_slash(base_url()).confirm_slash($book->slug))?>"
		play="true"
		loop="false"
  		quality="high"
		allowScriptAccess="sameDomain"
		type="application/x-shockwave-flash"
		wmode="transparent"
		pluginspage="http://www.adobe.com/go/getflashplayer">
	</embed>
</object>
</div>

<?
$content =@ $version['content'];
if (!empty($content)):
	//$content = fix_latin($content);
	//$content = utf8_encode($content);
	echo '<div id="content">'.$content.'</div>';
endif;
?>