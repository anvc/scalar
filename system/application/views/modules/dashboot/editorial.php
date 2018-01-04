<?php 

$user_types = array('author', 'editor');
$project_types = array('book', 'project');
$editorial_quantifiers = array(
  'all' => 'This',
  'majority' => 'Most of this',
  'minority' => 'Some of this'
);
$editorial_states = array(
  "draft" => array( 'id' => "draft", 'name' => "Draft" , 'next' => 'edit'),
  "edit" => array( 'id' => "edit", 'name' => "Edit", 'next' => 'editreview' ),
  "editreview" => array( 'id' => "editreview", 'name' => "Edit Review", 'next' => 'clear' ),
  "clean" => array( 'id' => "clean", 'name' => "Clean", 'next' => 'ready' ),
  "ready" => array( 'id' => "ready", 'name' => "Ready", 'next' => 'published' ),
  "published" => array( 'id' => "published", 'name' => "Published" )
);
$state_counts = array(
  "draft" => rand(0, 100),
  "edit" => rand(0, 100),
  "editreview" => rand(0, 100),
  "clean" => rand(0, 100),
  "ready" => rand(0, 100),
  "published" => 0
);
$state_percentages = array();
$usage_rights_percentage = rand(0, 100) * .01;
$page_count = 0;
foreach ($state_counts as $key => $value) {
  $page_count += $value;
}
foreach ($state_counts as $key => $value) {
  $state_percentages[$key] = $value / $page_count;
}

$user_type = $user_types[array_rand($user_types, 1)];
$editorial_state = array_rand($editorial_states, 1);
$has_editions = false;
$proxy_editorial_state = $editorial_state;
if ($has_editions && $editorial_state == 'published') {
  $proxy_editorial_state .= 'WithEditions';
}
$project_type = $project_types[array_rand($project_types, 1)];
if ($editorial_state == 'published') {
  $editorial_quantifier = 'all';
} else {  
  $editorial_quantifier = array_rand($editorial_quantifiers, 1);
}

$editorial_messaging = array(
  'author' => array(
    'draft' => array(
      'all' => array(
        'current_task' => 'Continue working until you’re ready to submit it for editing.',
        'next_task' => 'When you’re ready, click the button below to move all <strong>Draft</strong> content into the <strong>Edit</strong> state so it can be reviewed.',
        'next_task_buttons' => array('Move all <strong>Draft</strong> content to <strong>Edit</strong>')
      ),
      'majority' => array(
        'current_task' => 'Continue working on the <strong>Draft</strong> portions until you’re ready to submit them for editing.',
        'next_task' => 'When you’re ready, click the button below to move all <strong>Draft</strong> content into the <strong>Edit</strong> state so it can be reviewed.',
        'next_task_buttons' => array('Move all <strong>Draft</strong> content to <strong>Edit</strong>')
      ),
      'minority' => array(
        'current_task' => 'Continue working on the <strong>Draft</strong> portions until you’re ready to submit them for editing.',
        'next_task' => 'When you’re ready, click the button below to move all <strong>Draft</strong> content into the <strong>Edit</strong> state so it can be reviewed.',
        'next_task_buttons' => array('Move all <strong>Draft</strong> content to <strong>Edit</strong>')
      )
    ),
    'edit' => array(
      'all' => array(
        'current_task' => 'As the editor completes their review, they will move content into the <strong>Edit Review</strong> state so you can respond.',
        'next_task' => 'Please wait for an editor to move content into <strong>Edit Review</strong>.'
      ),
      'majority' => array(
        'current_task' => 'Review and respond to changes and queries on content in the <strong>Edit Review</strong> state.',
        'next_task' => 'Move content from the <strong>Edit Review</strong> state to the Clean state as you respond to editor changes and queries.'
      ),
      'minority' => array(
        'current_task' => 'Review and respond to changes and queries on content in the <strong>Edit Review</strong> state.',
        'next_task' => 'Move content from the <strong>Edit Review</strong> state to the Clean state as you respond to editor changes and queries.'
      )
    ),
    'editreview' => array(
      'all' => array(
        'current_task' => 'Review and respond to editor changes and queries.',
        'next_task' => 'Move content from the <strong>Edit Review</strong> state to the Clean state as you respond to editor changes and queries.'
      ),
      'majority' => array(
        'current_task' => 'Review and respond to changes and queries on content in the <strong>Edit Review</strong> state.',
        'next_task' => 'Move content from the <strong>Edit Review</strong> state to the Clean state as you respond to editor changes and queries.'
      ),
      'minority' => array(
        'current_task' => 'Review and respond to changes and queries on content in the <strong>Edit Review</strong> state.',
        'next_task' => 'Move content from the <strong>Edit Review</strong> state to the Clean state as you respond to editor changes and queries.'
      )
    ),
    'clean' => array(
      'all' => array(
        'current_task' => 'As the editor finalizes their review, they will either move content back to the <strong>Edit Review</strong> state for further changes, or into the <strong>Ready</strong> state for publication.',
        'next_task' => 'Please wait for an editor to do their final review of the content.'
      ),
      'majority' => array(
        'current_task' => 'As the editor finalizes their review, they will either move content back to the <strong>Edit Review</strong> state for further changes, or into the <strong>Ready</strong> state for publication.',
        'next_task' => 'Please wait for an editor to do their final review of the content.'
      ),
      'minority' => array(
        'current_task' => 'As the editor finalizes their review, they will either move content back to the <strong>Edit Review</strong> state for further changes, or into the <strong>Ready</strong> state for publication.',
        'next_task' => 'Please wait for an editor to do their final review of the content.'
      )
    ),
    'ready' => array(
      'all' => array(
        'current_task' => 'An editor will move content to the <strong>Published</strong> state when ready.',
        'next_task' => 'Please wait for an editor to publish the content of this '.$project_type.'.'
      ),
      'majority' => array(
        'current_task' => 'An editor will move content to the <strong>Published</strong> state when ready.',
        'next_task' => 'Please wait for an editor to publish the content of this '.$project_type.'.'
      ),
      'minority' => array(
        'current_task' => 'An editor will move content to the <strong>Published</strong> state when ready.',
        'next_task' => 'Please wait for an editor to publish the content of this '.$project_type.'.'
      )
    ),
    'published' => array(
      'all' => array(
        'current_task' => 'Congratulations!',
        'next_task' => 'Any changes you make to the '.$project_type.' will be published automatically.'
      )
    ),
    'publishedWithEditions' => array(
      'all' => array(
        'current_task' => 'Congratulations!',
        'next_task' => 'Once an edition is created, its content cannot be changed. Any changes you make will be automatically moved to the <strong>Latest Edits</strong> edition.'
      )
    )
  ),
  'editor' => array(
    'draft' => array(
      'all' => array(
        'current_task' => 'As the author finishes their initial draft, they will move content to the <strong>Edit</strong> state for your review.',
        'next_task' => 'Please wait for the author to submit content for editing.'
      ),
      'majority' => array(
        'current_task' => 'Review, make changes, and add queries to content in the <strong>Edit</strong> state by editing individual pages or using the <strong>Editorial Path</strong>.',
        'next_task' => 'Move content in the <strong>Edit</strong> state to the <strong>Edit Review</strong> state as you finish making changes and adding queries to it.'
      ),
      'minority' => array(
        'current_task' => 'Review, make changes, and add queries to content in the <strong>Edit</strong> state by editing individual pages or using the <strong>Editorial Path</strong>.',
        'next_task' => 'Move content in the <strong>Edit</strong> state to the <strong>Edit Review</strong> state as you finish making changes and adding queries to it.'
      )
    ),
    'edit' => array(
      'all' => array(
        'current_task' => 'Review, make changes, and add queries to content by editing individual pages or using the <strong>Editorial Path</strong>.',
        'next_task' => 'Move content to the <strong>Edit Review</strong> state as you finish making changes and adding queries to it.'
      ),
      'majority' => array(
        'current_task' => 'Review, make changes, and add queries to content in the <strong>Edit</strong> state by editing individual pages or using the <strong>Editorial Path</strong>.',
        'next_task' => 'Move content in the <strong>Edit</strong> state to the <strong>Edit Review</strong> state as you finish making changes and adding queries to it.'
      ),
      'minority' => array(
        'current_task' => 'Review, make changes, and add queries to content in the <strong>Edit</strong> state by editing individual pages or using the <strong>Editorial Path</strong>.',
        'next_task' => 'Move content in the <strong>Edit</strong> state to the <strong>Edit Review</strong> state as you finish making changes and adding queries to it.'
      )
    ),
    'editreview' => array(
      'all' => array(
        'current_task' => 'As the author responds to the edits, they will move content to the <strong>Clean</strong> state for final review.',
        'next_task' => 'Please wait for the author to move content to the <strong>Clean</strong> state.'
      ),
      'majority' => array(
        'current_task' => 'Do your final review on content in the <strong>Clean</strong> state.',
        'next_task' => 'Move content in the <strong>Clean</strong> state back to <strong>Edit Review</strong> if it requires further changes, or to the <strong>Ready</strong> state for publication.'
      ),
      'minority' => array(
        'current_task' => 'Do your final review on content in the <strong>Clean</strong> state.',
        'next_task' => 'Move content in the <strong>Clean</strong> state back to <strong>Edit Review</strong> if it requires further changes, or to the <strong>Ready</strong> state for publication.'
      )
    ),
    'clean' => array(
      'all' => array(
        'current_task' => 'Do your final review on the content.',
        'next_task' => 'Move content back to the <strong>Edit Review</strong> state if it requires further changes, or to the <strong>Ready</strong> state for publication.'
      ),
      'majority' => array(
        'current_task' => 'Do your final review on content in the <strong>Clean</strong> state.',
        'next_task' => 'Move content in the <strong>Clean</strong> state back to <strong>Edit Review</strong> if it requires further changes, or to the <strong>Ready</strong> state for publication.'
      ),
      'minority' => array(
        'current_task' => 'Do your final review on content in the <strong>Clean</strong> state.',
        'next_task' => 'Move content in the <strong>Clean</strong> state back to <strong>Edit Review</strong> if it requires further changes, or to the <strong>Ready</strong> state for publication.'
      )
    ),
    'ready' => array(
      'all' => array(
        'current_task' => 'Publish it whenever the time is right.',
        'next_task' => 'Move all content into the <strong>Published</strong> state to make it publicly available, or create a new public edition.',
        'next_task_buttons' => array('Move all <strong>Draft</strong> content to <strong>Published</strong>','Create a new edition')
      ),
      'majority' => array(
        'current_task' => 'Publish it whenever the time is right.',
        'next_task' => 'Move all content into the <strong>Published</strong> state to make it publicly available, or create a new public edition.',
        'next_task_buttons' => array('Move all content to <strong>Published</strong>','Create a new edition')
      ),
      'minority' => array(
        'current_task' => 'Publish it whenever the time is right.',
        'next_task' => 'Move all content into the <strong>Published</strong> state to make it publicly available, or create a new public edition.',
        'next_task_buttons' => array('Move all content to <strong>Published</strong>','Create a new edition')
      )
    ),
    'published' => array(
      'all' => array(
        'current_task' => 'Congratulations!',
        'next_task' => 'Any changes authors make to the '.$project_type.' will be published automatically.'
      )
    ),
    'publishedWithEditions' => array(
      'all' => array(
        'current_task' => 'Congratulations!',
        'next_task' => 'Once an edition is created, its content cannot be changed. Any changes authors make will be automatically moved to the <strong>Latest Edits</strong> edition.'
      )
    )
  )
);
$current_messaging = $editorial_messaging[$user_type][$proxy_editorial_state][$editorial_quantifier];

if ($editorial_is_on): ?>
<div class="container-fluid properties">
  <div class="row editorial-summary">
    <div class="col-md-8">
      <div class="message-pane">
        <p><strong><? echo($editorial_quantifiers[$editorial_quantifier].' '.$project_type) ?> is in the <? echo($editorial_states[$editorial_state]['name']) ?> state.</strong><br><? echo($current_messaging['current_task']) ?></p>
        <div class="editorial-gauge"><? 
          foreach ($state_percentages as $key => $value) {
            $percentage = round($value*100);
            echo('<div class="'.$key.'-state editorial-fragment" style="width: '.($value*100).'%"><strong>'.$editorial_states[$key]['name'].'</strong> ('.$percentage.'%)</div>');
          }
        ?></div>
        <div class="usage-rights-gauge">
          <? echo('<div class="usage-rights-fragment" style="width: '.($usage_rights_percentage*100).'%"></div>Usage rights: '.($usage_rights_percentage*100).'%'); ?>    
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="message-pane dark">
        <p><? echo($current_messaging['next_task']); ?></p>
        <?
          if (array_key_exists('next_task_buttons', $current_messaging)) {
            foreach ($current_messaging['next_task_buttons'] as $value) {
              echo('<button class="btn btn-block btn-state '.$editorial_states[$editorial_state]['next'].'-state">'.$value.'</button>');             
            }
          }
        ?>
      </div>
    </div>
  </div>
  <!--<div class="row">
    <div class="col-md-12">
      <h4>Browse content by state</h4>
      <p>(Content selector goes here)</p>
    </div>
  </div>-->
  <div class="row">
    <section class="col-xs-7">
      <p><br><br><button class="btn btn-primary" data-toggle="modal" data-target="#confirmEditorialWorkflow">Disable editorial workflow</button></p>
    </section>
  </div>
</div>
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