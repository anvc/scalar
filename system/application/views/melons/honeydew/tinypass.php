<script type="text/javascript" src="https://code.tinypass.com/tinypass.js"></script>
<style>
body {font-family:Helvetica; margin:80px 100px 80px 100px;}
</style>
<h3 title="Honeydew Tinypass landing page"><?=$book->title?></h3>
<h4>"<?=$page->versions[$page->version_index]->title?>" is part of this <?=$book->scope?>'s premium content</h4>
<?=first_paragraph(nl2br($page->versions[$page->version_index]->content))?>
<br /><br />
<div id="tinypass-button"><?=$buttonHTML?></div>
