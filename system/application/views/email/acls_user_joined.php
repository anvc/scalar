<?php
	echo  'Dear authors of "',$book_title,'", ',
				PHP_EOL,
				PHP_EOL,
				wordwrap($user_name.', a user on '.lang('site_name').' has chosen to join your book. This means that they are interested in your book and have chosen to be a subscribed reader.  They cannot edit or contribute to your book outside of comments. You may view the current list of authors and subscribed readers here: ',70),$site_url.'system/dashboard?book_id='.$book_id.'&zone=users#tabs-users',
				PHP_EOL,
				PHP_EOL,
				'Thank you,',
				PHP_EOL,
				'The '.lang('site_name').' Team.';
?>