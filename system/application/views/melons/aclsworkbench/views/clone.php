<?php
	$num_data_attributes = preg_match_all('/data-(?<data_type>\w+)="(?<value>\w+)"/',trim($book->title),$data_attributes);
	if(count($data_attributes['data_type']) == $num_data_attributes &&  count($data_attributes['value'])  ==  $num_data_attributes && $num_data_attributes > 0){
		for($i = 0; $i < $num_data_attributes; $i++){
			$extra_data[$data_attributes['data_type'][$i]] = $data_attributes['value'][$i];
		}
	}
	
	if(isset($extra_data['duplicatable']) && $extra_data['duplicatable']=='true'){
		if($login->is_logged_in){
		?>
			<form action="<?php echo base_url(); ?>system/dashboard" method="post">
				<input type="hidden" name="redirect" value="<?php echo base_url().'?'; ?>">
				<input type="hidden" name="user_id" value="<?php echo $login->user_id; ?>">
				<input type="hidden" name="action" value="do_duplicate_book">
				<input type="hidden" name="book_to_duplicate" id="book_to_duplicate" value="<?php echo $book->book_id; ?>">
				<div class="book_image"></div>
				<p>You are about to clone this book - a copy of this book with your new title will be added to "Your Books" on the book index.<p>
				<p><em class="text-muted">Note that any pages that you have not edited will still show the previous author as the last editor. Once you have modified these files, you will be shown as the most recent editor. Any new files you will create will also show you as the editor.</em></p>
				<br />
				<div class="form-group">
					<label for="clone_title">Title of new book:
						<input type="text" name="title" id="clone_title">
					</label>
				</div>
			
			<div class="modal-footer">
				<input type="submit" class="btn btn-primary pull-right" value="Clone Book">
			</div>
			</form>
		<?php
			}else{
				echo '<div class="alert alert-danger">In order to clone this book, you must first either <a href="'.$login_url.'system/login?redirect_url='.urlencode(str_replace('modal=1','',$_SERVER['REQUEST_URI'])).'">', lang('login.sign_in'), '</a> ',lang('or'),' <a href="'.$login_url.'system/register?redirect_url='.urlencode(str_replace('modal=1','',$_SERVER['REQUEST_URI'])).'">', lang('login.register'), '</a> </div>';
			}
	}else{
		?>
			<p class="bg-warning"><strong>Book Not Clonable</strong>: Unfortunately, this book is not currently marked as clonable.</p>
		<?
	}
?>