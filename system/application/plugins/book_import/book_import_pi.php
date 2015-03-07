<?php 
	$get_vars = (isset($_GET['source_url'])? 'source_url='.$_GET['source_url'] : '') . 
	(isset($_GET['dest_url'])? 'dest_url='.$_GET['dest_url'] : '') . (isset($_GET['dest_id'])? 'dest_id='.$_GET['dest_id'] : '');
	$get_vars = ($get_vars != '')? '?'.$get_vars : '';
?>
<div>
	<iframe style="width:100%;min-height:600px;border:none" src="application/plugins/book_import/index.html<?=$get_vars?>"></iframe>
</div>