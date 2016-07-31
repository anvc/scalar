<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_css('system/application/views/modules/dashboot/css/bootstrap.min.css')?>
<?$this->template->add_css('system/application/views/modules/dashboot/css/tabs.css')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/jquery-3.1.0.min.js')?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/bootstrap.min.js')?>
<header class="container-fluid">
  <div class="row">
    <div class="col-xs-12 col-sm-6">
      <div class="dropdown">
        <a href="javascript:void(null);" data-toggle="dropdown">
        <h4>
          <img class="avatar small" src="<?=$app_root.'views/modules/dashboot/images/generic-avatar.png'?>" alt="User avatar" />
          Steve Anderson
          <span class="caret"></span>
        </h4>
        </a>
        <ul class="dropdown-menu"><?php 
    	  foreach ($my_books as $my_book) {
    		echo '<li>';
    		echo '<a href="?book_id='.$my_book->book_id.'" class="'.(($my_book->book_id==$book_id)?'active':'').'">';
    		echo strip_tags($my_book->title);
    		echo '</a>';
    		echo '</li>';
    	  }
        ?></ul>  
      </div>
    </div>
    <nav class="col-xs-12 col-sm-6">
      <h5>
        <a href="javascript:void(null);">About Scalar</a> | 
        <a href="javascript:void(null);">User's Guide</a> 
        <img class="scalar_logo small" src="<?=$app_root.'views/modules/dashboot/images/scalar-avatar.png'?>" alt="Small Scalar logo" />
      </h5>
    </nav>    
  </div>
</header>