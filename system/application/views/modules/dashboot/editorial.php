<?php if ($editorial_is_on): ?>
<p>Lucas &amp; Erik add here.</p>
<p><button class="btn btn-primary" data-toggle="modal" data-target="#confirmEditorialWorkflow">Disable editorial workflow</button></p>
<div class="modal fade" id="confirmEditorialWorkflow" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <form action="<?=confirm_slash(base_url())?>system/dashboard" method="post">
      <input type="hidden" name="book_id" value="<?=$book->book_id?>" />  
      <input type="hidden" name="action" value="enable_editorial_workflow" />
      <input type="hidden" name="enable" value="0" />
      <div class="modal-header">
      	<h4>Confirm</h4>
      </div>
      <div class="modal-body">
       	  <p>Are you sure you wish to turn off the Editorial Workflow for this book?</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-primary">Turn off</button>
      </div>
      </form>
    </div>
  </div>
</div>
<?php elseif ($can_editorial): ?>
<div class="container-fluid properties">
  <div class="row">
    <section class="col-xs-7">
      <h3 style="margin-top:0px; padding-top:0px; margin-bottom:16px; padding-bottom:0px;">Editorial Workflow</h3>
      <p>
      Track the editorial state of each piece of content in your book.  Enable editorial workflow on the current
      book by clicking the button below, or <a href="javascript:void(null);">learn more</a>.
      <br /><br />
      <button class="btn btn-sm btn-primary" data-toggle="modal" data-target="#confirmEditorialWorkflow">Enable editorial workflow</button>
      </p>
    </section>
  </div>
</div>
<div class="modal fade" id="confirmEditorialWorkflow" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <form action="<?=confirm_slash(base_url())?>system/dashboard" method="post">
      <input type="hidden" name="book_id" value="<?=$book->book_id?>" />  
      <input type="hidden" name="action" value="enable_editorial_workflow" />
      <input type="hidden" name="enable" value="1" />
      <div class="modal-header">
      	<h4>Confirm</h4>
      </div>
      <div class="modal-body">
       	  <p>Are you sure you wish to turn on the Editorial Workflow for this book?</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-primary">Turn on</button>
      </div>
      </form>
    </div>
  </div>
</div>
<?php else: ?>
<div class="container-fluid properties">
  <div class="row">
    <section class="col-xs-7">
      <h3 style="margin-top:0px; padding-top:0px; margin-bottom:16px; padding-bottom:0px;">Editorial Workflow</h3>
      <p>
      Track the editorial state of each piece of content in your book.  Enable editorial workflow on the current
      book by clicking the button below, or <a href="javascript:void(null);">learn more</a>.
      </p>
      <p>
      <strong>The database for this Scalar install hasn't been updated to support Editorial Workflow features.</strong> 
      </p>
      <p>
      Contact a system administrator to <a href="https://github.com/anvc/scalar/wiki/Changes-to-config-files-over-time" target="_blank">update Scalar's database</a>. 
      </p>
    </section>
  </div>
</div>
<?php endif; ?>