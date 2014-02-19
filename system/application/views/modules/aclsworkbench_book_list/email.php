<?php
	switch($email_type){
		case 'author_with_message':
			echo  'Dear authors of "',$book_title,'", ',
						PHP_EOL,
						PHP_EOL,
						wordwrap($user_name.', a user on '.lang('site_name').' has chosen to join your book. This means that they are interested in your book and have chosen to be a subscribed reader. They have also chosen to apply to become an author of your book, which would allow them to edit and contribute.  The user also included this message: ',70),
						PHP_EOL,
						PHP_EOL,
						'" ',$author_request_message,' "',
						PHP_EOL,
						PHP_EOL,
						wordwrap('The user can not currently edit or contribute to your book, as they are currently a reader. You may upgrade this user to an author, granting these permissions, by going to the Users tab in the dashboard, located here: ',70).$site_url.'system/dashboard?book_id='.$book_id.'&zone=users#tabs-users',
						PHP_EOL,
						PHP_EOL,
						'Thank you,',
						PHP_EOL,
						'The '.lang('site_name').' Team.';
			break;
		case 'author_no_message':
			echo  'Dear authors of "',$book_title,'", ',
						PHP_EOL,
						PHP_EOL,
						wordwrap($user_name.', a user on '.lang('site_name').' has chosen to join your book. This means that they are interested in your book and have chosen to be a subscribed reader. They have also chosen to apply to become an author of your book, which would allow them to edit and contribute. The user can not currently edit or contribute to your book, as they are currently a reader. You may upgrade this user to an author, granting these permissions, by going to the Users tab in the dashboard, located here: ',70).$site_url.'system/dashboard?book_id='.$book_id.'&zone=users#tabs-users',
						PHP_EOL,
						PHP_EOL,
						'Thank you,',
						PHP_EOL,
						'The '.lang('site_name').' Team.';
			break;
		default:
			echo  'Dear authors of "',$book_title,'", ',
						PHP_EOL,
						PHP_EOL,
						wordwrap($user_name.', a user on '.lang('site_name').' has chosen to join your book. This means that they are interested in your book and have chosen to be a subscribed reader.  They cannot edit or contribute to your book outside of comments. You may view the current list of authors and subscribed readers here: ',70),$site_url.'system/dashboard?book_id='.$book_id.'&zone=users#tabs-users',
						PHP_EOL,
						PHP_EOL,
						'Thank you,',
						PHP_EOL,
						'The '.lang('site_name').' Team.';
			break;
		}
?>