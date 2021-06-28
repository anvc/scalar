<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_meta('viewport','width=device-width, initial-scale=1');?>
<?$this->template->add_css('system/application/views/modules/dashboot/css/bootstrap.min.css')?>
<?$this->template->add_css('system/application/views/modules/dashboot/css/tabs.css')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/jquery-3.1.0.min.js')?>
<script src="https://code.jquery.com/jquery-migrate-3.1.0.js"></script>
<?$this->template->add_js('system/application/views/modules/dashboot/js/bootstrap.min.js')?>
<?$this->template->add_js('system/application/views/widgets/api/scalarapi.js')?>
<?$this->template->add_js('system/application/views/arbors/admin/admin.js')?>
<?$this->template->add_link('parent',((!empty($book)&&isset($book->slug))?base_url().$book->slug.'/':''))?>
<script>
var book_id = <?=((!empty($book)&&isset($book->book_id))?$book->book_id:0)?>;
var book_url = '<?=((!empty($book)&&isset($book->slug))?base_url().$book->slug.'/':'')?>';
$(document).ready(function() {
  // Keep the page from jumping to the anchor
  setTimeout(function() {
    $('html').css('position','static').css('overflow-y','auto');
  }, 100);
  // Tab is selected in the URL
  if (window.location.hash) {
     $('a[href="'+window.location.hash+'"]').trigger('click');
  };
  // Reload page when a new tab is selected
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var $shown = $(e.target);
    var zone = $shown.attr('href').substr($shown.attr('href').lastIndexOf('-')+1);
    document.location.href = '?book_id='+book_id+'&zone='+zone+'#tabs-'+zone;
  });
});
// Prevent page from bumping down due to the anchor
$(window).on('scroll',function() {
  $(window).scrollTop(0);
}).on('load',function() {
  setTimeout(function() {
    $(window).off('scroll');
  }, 5);
});
// The edition cookie is asked for on more than one page
function editionCookieName() {
  var url = book_url;
  if (url.slice(-1) == '/') url = url.substr(0, url.length-1);
  return 'scalar_edition_index_'+url.replace(/^(https?:|)\/\//, '').replace(/[/]/g, '_').replace(/\W/g, '');
}
</script>

<div class="bgcolor">

<header class="container-fluid">
  <div class="row">
    <div class="col-xs-12 col-sm-6">
      <h4>
        <a href="?book_id=<?=((isset($book) && !empty($book))?$book->book_id:'0')?>&zone=user#tabs-user" class="<?=(('user'==$zone)?'active':'')?>">
          <img class="avatar small" src="<?=$app_root.'views/modules/dashboot/images/generic-avatar.png'?>" alt="User avatar" />
          <?=$login->fullname?>
        </a>
<?php if ('user'!=$zone): ?>
        <span class="s">/</span>
        <div class="dropdown">
          <a href="javascript:void(null);" data-toggle="dropdown"><?=(!empty($book))?$book->title:'My books'?></a>
          <span class="caret"></span>
          <ul class="dropdown-menu"><?php
	    	  foreach ($my_books as $my_book) {
	    		echo '<li>';
	    		echo '<a href="?book_id='.$my_book->book_id.'&zone=style#tabs-style" class="'.(($my_book->book_id==$book_id)?'active':'').'">';
	    		echo strip_tags($my_book->title);
	    		echo '</a>';
	    		echo '</li>';
	    	  }
          ?></ul>
        </div>
<?php endif; ?>
      </h4>
    </div>
    <nav class="col-xs-12 col-sm-6">
      <h5>
        <a href="http://scalar.usc.edu">About Scalar</a> |
        <?
		$active_dashboard = $this->config->item('active_dashboard');
		if ('dashboard'==$active_dashboard):
		?>
        <a href="?dashboard=dashboard&book_id=<?=((!empty($book))?$book->book_id:0)?>&zone=style#tabs-style">Revert Dashboard</a> |
        <? endif; ?>
        <a href="http://scalar.usc.edu/works/guide2">User's Guide</a>
        <img class="scalar_logo small" src="<?=$app_root.'views/modules/dashboot/images/scalar-avatar.png'?>" alt="Small Scalar logo" />
      </h5>
    </nav>
  </div>
</header>

<?
$data = $this->session->userdata(base_url());
if (isset($data['password_exceeds_max_days']) && $data['password_exceeds_max_days']) {
	$days = $this->config->item('strong_password_days_to_reset');
	echo '<div class="alert alert-danger text-center">It\'s been more than '.$days.' '.(($days>1)?'days':'day').' since you updated your password &mdash; <a href="?book_id='.((isset($_GET['book_id']))?$_GET['book_id']:0).'&zone=user#tabs-user">please change your password</a></div>'."\n";
}
?>

<?php
if ('user'==$zone):

  $this->load->view('modules/dashboot/user');

else: ?>
<nav class="container-fluid">
  <div class="row">
    <div class="col-xs-12">
	  <ul class="nav nav-tabs" role="tablist">
	    <li role="presentation"<?=(('style'==$zone)?' class="active"':'')?>><a href="#tabs-style" data-toggle="tab">Properties</a></li>
	    <li role="presentation"<?=(('editorial'==$zone)?' class="active"':'')?>><a href="#tabs-editorial" data-toggle="tab">Editorial</a></li>
	    <li role="presentation"<?=(('styling'==$zone)?' class="active"':'')?>><a href="#tabs-styling" data-toggle="tab">Styling</a></li>
	    <li role="presentation"<?=(('pages'==$zone)?' class="active"':'')?>><a href="#tabs-pages" data-toggle="tab">Content</a></li>
	    <li role="presentation"<?=(('users'==$zone)?' class="active"':'')?>><a href="#tabs-users" data-toggle="tab">Users</a></li>
	    <li role="presentation"<?=(('utils'==$zone||'all-users'==$zone||'all-books'==$zone)?' class="active"':'')?>><a href="#tabs-utils" data-toggle="tab">Utilities</a></li>
	    <?php if (!empty($book)): ?>
	    <li role="presentation" class="right-tab"><a href="<?=((!empty($book)&&isset($book->slug))?base_url().$book->slug.'/':'')?>" title="Return to <?=(!empty($book))?htmlspecialchars(strip_tags($book->title)):''?>">Return to book &raquo;</a></li>
	    <?php endif; ?>
	  </ul>
	</div>
  </div>
</nav>

<section class="tab-content">
  <div role="tabpanel" class="tab-pane<?=(('style'==$zone)?' active':'')?>" id="tabs-style"><? if ('style'==$zone) { $this->load->view('modules/dashboot/props'); } else {echo '<h5 class="loading">Loading...</h5>';}?></div>
  <div role="tabpanel" class="tab-pane<?=(('editorial'==$zone)?' active':'')?>" id="tabs-editorial"><? if ('editorial'==$zone) { $this->load->view('modules/dashboot/editorial'); } else {echo '<h5 class="loading">Loading...</h5>';}?></div>
  <div role="tabpanel" class="tab-pane<?=(('styling'==$zone)?' active':'')?>" id="tabs-style"><? if ('styling'==$zone) { $this->load->view('modules/dashboot/styling'); } else {echo '<h5 class="loading">Loading...</h5>';}?></div>
  <div role="tabpanel" class="tab-pane<?=(('pages'==$zone)?' active':'')?>" id="tabs-pages"><? if ('pages'==$zone) { $this->load->view('modules/dashboot/pages'); } else {echo '<h5 class="loading">Loading...</h5>';}?></div>
  <div role="tabpanel" class="tab-pane<?=(('users'==$zone)?' active':'')?>" id="tabs-users"><? if ('users'==$zone) { $this->load->view('modules/dashboot/users'); } else {echo '<h5 class="loading">Loading...</h5>';}?></div>
  <div role="tabpanel" class="tab-pane<?=(('utils'==$zone||'all-users'==$zone||'all-books'==$zone)?' active':'')?>" id="tabs-utils"><? if ('utils'==$zone||'all-users'==$zone||'all-books'==$zone) { $this->load->view('modules/dashboot/utils'); } else {echo '<h5 class="loading">Loading...</h5>';}?></div>
</section>
<?php endif; ?>

</div>
