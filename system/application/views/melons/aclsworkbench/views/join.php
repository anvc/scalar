<?php
	$num_data_attributes = preg_match_all('/data-(?<data_type>\w+)="(?<value>\w+)"/',trim($book->title),$data_attributes);
	if(count($data_attributes['data_type']) == $num_data_attributes &&  count($data_attributes['value'])  ==  $num_data_attributes && $num_data_attributes > 0){
		for($i = 0; $i < $num_data_attributes; $i++){
			$extra_data[$data_attributes['data_type'][$i]] = $data_attributes['value'][$i];
		}
	}
	
	if(!isset($extra_data['clonable']) || $extra_data['clonable']!='false'){
		if($login->is_logged_in){
		?>
			<form action="<?php echo base_url(); ?>system/dashboard" method="post">
							<input type="hidden" name="redirect" value="<?php echo base_url().'?'; ?>">
							<input type="hidden" name="action" value="acls_join_book">
							<input type="hidden" name="user_id" value="<?php echo $login->user_id; ?>">
							<input type="hidden" name="book_to_join" id="book_to_join" value="<?php echo $book->book_id; ?>">
							<div class="book_image"></div>
							<p>You are about to join this book - this means that you will be added automatically as a subscribed reader, and it will show up under "Your Books" on the main book index. You may also optionally request to become a co-author of this book, pending current author approval.</p>
							<br />
							<label>Would you like to be added as an author to this book? Note that current authors will receive an email and then may approve or deny your request.</label>
							<div class="radio">
							<label>
							  <input type="radio" name="request_author" id="request_author_no" value="0" checked>
									I would only like to join to this book <br />  <em class="text-muted">(You will be able to read and comment on this book, but you will not be able to edit or create content)</em><br />
								</label>
							</div>
							<div class="radio">
							  <label>
								<input type="radio" name="request_author" id="request_author_yes" value="1">
									I would like to join and request to become co-author of this book <br /> <em class="text-muted">(Pending current author approval, you will be able to create and edit content on this book)</em><br />
								</label>
								<div class="hidden" id="author_reason_container">
									<div class="form-group well">
										<label for="author_reason">Message for Current Authors <em class="text-muted">(Optional)</em>
											<textarea id="author_reason" name="author_reason"></textarea>
										</label>
									</div>
								</div>
							</div>
							<br class="clearfix" />
							<div class="modal-footer">
								<input type="submit" class="btn btn-primary pull-right" value="Join Book">
							</div>
						</form>
					<?php
						}else{
				echo '<div class="alert alert-danger">In order to join this book, you must first either <a href="'.$login_url.'system/login?redirect_url='.urlencode(str_replace('modal=1','',$_SERVER['REQUEST_URI'])).'">', lang('login.sign_in'), '</a> ',lang('or'),' <a href="'.$login_url.'system/register?redirect_url='.urlencode(str_replace('modal=1','',$_SERVER['REQUEST_URI'])).'">', lang('login.register'), '</a> </div>';
			}
	}else{
		?>
			<p class="bg-warning"><strong>Book Not Joinable</strong>: Unfortunately, this book is not currently marked as joinable.</p>
		<?
	}
?>