<? if (!defined('BASEPATH')) exit('No direct script access allowed') ?>
<? $this->template->add_css(path_from_file(__FILE__).'title.css') ?>
<div class="system_wrapper system_cover">
<div class="cover">
<? $this->load->view('modules/cover/login') ?>
<h2 class="title dashboard_title">
<form action="<?=confirm_slash(base_url())?>system/dashboard" method="get" class="book_form">
<select name="book_id" onchange="$(this).parent().submit();" style="margin:0;max-width:300px;">
<option value="0">Select a book to manage</option>
<?
foreach ($my_books as $row) {
	echo '<option value="'.$row->book_id.'"'.((@$book->book_id==$row->book_id)?' SELECTED':'').'>';
	echo strip_tags($row->title);
	echo '</option>';
}
?>
</select>
<input type="hidden" name="zone" value="style" />
</form> 
<?=$cover_title?>
</h2>
</div>
</div>