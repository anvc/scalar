<?
if (empty($book)) {
	header('Location: '.$this->base_url.'?zone=user');
	exit;
}
?>
<?$this->template->add_js('system/application/views/modules/dashboot/js/jquery-dateformat.min.js')?>
<?$this->template->add_css('system/application/views/widgets/edit/content_selector.css')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.content_selector_bootstrap.js')?>
<?php
$css = <<<STR
#cstitle {font-weight:bold; margin:22px 0px 22px 0px;}
#cs .selector {padding-left:0px !important; padding-right:0px !important;}
STR;
?>
<?$this->template->add_css($css,'embed')?>
<?php if ($editorial_is_on): ?>
<script>
  var user_type = '<?echo($user_level);?>'.toLowerCase();
  var project_type = '<?echo($book->scope);?>';

  // editorial constants
  var editorial_state_array = ['hidden','draft','edit','editreview','clean','ready','published'];
  var editorial_states = {
    "hidden": {'id': "hidden", 'name': "Hidden" , 'next': 'draft'},
    "draft": {'id': "draft", 'name': "Draft" , 'next': 'edit'},
    "edit": {'id': "edit", 'name': "Edit", 'next': 'editreview' },
    "editreview": {'id': "editreview", 'name': "Edit Review", 'next': 'clear' },
    "clean": {'id': "clean", 'name': "Clean", 'next': 'ready' },
    "ready": {'id': "ready", 'name': "Ready", 'next': 'published' },
    "published": {'id': "published", 'name': "Published" },
    "empty": {'id': "empty", 'name': "empty"}
  };
  var editorial_quantifiers = {
    'all': 'This',
    'majority': 'Most of this',
    'minority': 'Some of this'
  };
  var editorial_messaging = {
    'author': {
      'draft': {
        'all': {
          'current_task': 'Continue working until you’re ready to submit it for editing.',
          'next_task': 'When you’re ready, click the button below to move all <strong>Draft</strong> content into the <strong>Edit</strong> state so it can be reviewed.',
          'next_task_buttons': ['Move all <strong>Draft</strong> content to <strong>Edit</strong>'],
          'next_task_ids': ['allToEdit']
        },
        'majority': {
          'current_task': 'Continue working on the <strong>Draft</strong> portions until you’re ready to submit them for editing.',
          'next_task': 'When you’re ready, click the button below to move all <strong>Draft</strong> content into the <strong>Edit</strong> state so it can be reviewed.',
          'next_task_buttons': ['Move all <strong>Draft</strong> content to <strong>Edit</strong>'],
          'next_task_ids': ['allToEdit']
        },
        'minority': {
          'current_task': 'Continue working on the <strong>Draft</strong> portions until you’re ready to submit them for editing.',
          'next_task': 'When you’re ready, click the button below to move all <strong>Draft</strong> content into the <strong>Edit</strong> state so it can be reviewed.',
          'next_task_buttons': ['Move all <strong>Draft</strong> content to <strong>Edit</strong>'],
          'next_task_ids': ['allToEdit']
        }
      },
      'edit': {
        'all': {
          'current_task': 'As the editor completes their review, they will move content into the <strong>Edit Review</strong> state so you can respond.',
          'next_task': 'Please wait for an editor to move content into <strong>Edit Review</strong>.'
        },
        'majority': {
          'current_task': 'Review and respond to changes and queries on content in the <strong>Edit Review</strong> state.',
          'next_task': 'Move content from the <strong>Edit Review</strong> state to the Clean state as you respond to editor changes and queries.'
        },
        'minority': {
          'current_task': 'Review and respond to changes and queries on content in the <strong>Edit Review</strong> state.',
          'next_task': 'Move content from the <strong>Edit Review</strong> state to the Clean state as you respond to editor changes and queries.'
        }
      },
      'editreview': {
        'all': {
          'current_task': 'Review and respond to editor changes and queries.',
          'next_task': 'Move content from the <strong>Edit Review</strong> state to the Clean state as you respond to editor changes and queries.'
        },
        'majority': {
          'current_task': 'Review and respond to changes and queries on content in the <strong>Edit Review</strong> state.',
          'next_task': 'Move content from the <strong>Edit Review</strong> state to the Clean state as you respond to editor changes and queries.'
        },
        'minority': {
          'current_task': 'Review and respond to changes and queries on content in the <strong>Edit Review</strong> state.',
          'next_task': 'Move content from the <strong>Edit Review</strong> state to the Clean state as you respond to editor changes and queries.'
        }
      },
      'clean': {
        'all': {
          'current_task': 'As the editor finalizes their review, they will either move content back to the <strong>Edit Review</strong> state for further changes, or into the <strong>Ready</strong> state for publication.',
          'next_task': 'Please wait for an editor to do their final review of the content.'
        },
        'majority': {
          'current_task': 'As the editor finalizes their review, they will either move content back to the <strong>Edit Review</strong> state for further changes, or into the <strong>Ready</strong> state for publication.',
          'next_task': 'Please wait for an editor to do their final review of the content.'
        },
        'minority': {
          'current_task': 'As the editor finalizes their review, they will either move content back to the <strong>Edit Review</strong> state for further changes, or into the <strong>Ready</strong> state for publication.',
          'next_task': 'Please wait for an editor to do their final review of the content.'
        }
      },
      'ready': {
        'all': {
          'current_task': 'An editor will move content to the <strong>Published</strong> state when ready.',
          'next_task': 'Please wait for an editor to publish the content of this '+project_type+'.'
        },
        'majority': {
          'current_task': 'An editor will move content to the <strong>Published</strong> state when ready.',
          'next_task': 'Please wait for an editor to publish the content of this '+project_type+'.'
        },
        'minority': {
          'current_task': 'An editor will move content to the <strong>Published</strong> state when ready.',
          'next_task': 'Please wait for an editor to publish the content of this '+project_type+'.'
        }
      },
      'published': {
        'all': {
          'current_task': 'Congratulations!',
          'next_task': 'Any changes you make to the '+project_type+' will be published automatically.'
        }
      },
      'publishedWithEditions': {
        'all': {
          'current_task': 'Congratulations!',
          'next_task': 'Once an edition is created, its content cannot be changed. Any changes you make will be automatically moved to the <strong>Latest Edits</strong> edition.'
        }
      },
      'empty': {
        'all': {
          'current_task': 'Add some content to get started.',
          'next_task': 'Return here to check on your progress through editorial.'
        }
      }
    },
    'editor': {
      'draft': {
        'all': {
          'current_task': 'As the author finishes their initial draft, they will move content to the <strong>Edit</strong> state for your review.',
          'next_task': 'Please wait for the author to submit content for editing.'
        },
        'majority': {
          'current_task': 'Review, make changes, and add queries to content in the <strong>Edit</strong> state by editing individual pages or using the <a href="'+$('link#parent').attr('href')+'editorialpath">Editorial Path</a>.',
          'next_task': 'Move content in the <strong>Edit</strong> state to the <strong>Edit Review</strong> state as you finish making changes and adding queries to it.'
        },
        'minority': {
          'current_task': 'Review, make changes, and add queries to content in the <strong>Edit</strong> state by editing individual pages or using the <a href="'+$('link#parent').attr('href')+'editorialpath">Editorial Path</a>.',
          'next_task': 'Move content in the <strong>Edit</strong> state to the <strong>Edit Review</strong> state as you finish making changes and adding queries to it.'
        }
      },
      'edit': {
        'all': {
          'current_task': 'Review, make changes, and add queries to content by editing individual pages or using the <a href="'+$('link#parent').attr('href')+'editorialpath">Editorial Path</a>.',
          'next_task': 'Move content to the <strong>Edit Review</strong> state as you finish making changes and adding queries to it.'
        },
        'majority': {
          'current_task': 'Review, make changes, and add queries to content in the <strong>Edit</strong> state by editing individual pages or using the <a href="'+$('link#parent').attr('href')+'editorialpath">Editorial Path</a>.',
          'next_task': 'Move content in the <strong>Edit</strong> state to the <strong>Edit Review</strong> state as you finish making changes and adding queries to it.'
        },
        'minority': {
          'current_task': 'Review, make changes, and add queries to content in the <strong>Edit</strong> state by editing individual pages or using the <a href="'+$('link#parent').attr('href')+'editorialpath">Editorial Path</a>.',
          'next_task': 'Move content in the <strong>Edit</strong> state to the <strong>Edit Review</strong> state as you finish making changes and adding queries to it.'
        }
      },
      'editreview': {
        'all': {
          'current_task': 'As the author responds to the edits, they will move content to the <strong>Clean</strong> state for final review.',
          'next_task': 'Please wait for the author to move content to the <strong>Clean</strong> state.'
        },
        'majority': {
          'current_task': 'Do your final review on content in the <strong>Clean</strong> state.',
          'next_task': 'Move content in the <strong>Clean</strong> state back to <strong>Edit Review</strong> if it requires further changes, or to the <strong>Ready</strong> state for publication.'
        },
        'minority': {
          'current_task': 'Do your final review on content in the <strong>Clean</strong> state.',
          'next_task': 'Move content in the <strong>Clean</strong> state back to <strong>Edit Review</strong> if it requires further changes, or to the <strong>Ready</strong> state for publication.'
        }
      },
      'clean': {
        'all': {
          'current_task': 'Do your final review on the content.',
          'next_task': 'Move content back to the <strong>Edit Review</strong> state if it requires further changes, or to the <strong>Ready</strong> state for publication.'
        },
        'majority': {
          'current_task': 'Do your final review on content in the <strong>Clean</strong> state.',
          'next_task': 'Move content in the <strong>Clean</strong> state back to <strong>Edit Review</strong> if it requires further changes, or to the <strong>Ready</strong> state for publication.'
        },
        'minority': {
          'current_task': 'Do your final review on content in the <strong>Clean</strong> state.',
          'next_task': 'Move content in the <strong>Clean</strong> state back to <strong>Edit Review</strong> if it requires further changes, or to the <strong>Ready</strong> state for publication.'
        }
      },
      'ready': {
        'all': {
          'current_task': 'Publish it whenever the time is right.',
          'next_task': 'Move all content into the <strong>Published</strong> state to make it publicly available, or create a new public edition.',
          'next_task_buttons': ['Move all <strong>Draft</strong> content to <strong>Published</strong>','Create a new edition'],
          'next_task_ids': ['allToPublished','newEdition']
        },
        'majority': {
          'current_task': 'Publish it whenever the time is right.',
          'next_task': 'Move all content into the <strong>Published</strong> state to make it publicly available, or create a new public edition.',
          'next_task_buttons': ['Move all content to <strong>Published</strong>','Create a new edition'],
          'next_task_ids': ['allToPublished','newEdition']
        },
        'minority': {
          'current_task': 'Publish it whenever the time is right.',
          'next_task': 'Move all content into the <strong>Published</strong> state to make it publicly available, or create a new public edition.',
          'next_task_buttons': ['Move all content to <strong>Published</strong>','Create a new edition'],
          'next_task_ids': ['allToPublished','newEdition']
        }
      },
      'published': {
        'all': {
          'current_task': 'Congratulations!',
          'next_task': 'Any changes authors make to the '+project_type+' will be published automatically.'
        }
      },
      'publishedWithEditions': {
        'all': {
          'current_task': 'Congratulations!',
          'next_task': 'Once an edition is created, its content cannot be changed. Any changes authors make will be automatically moved to the <strong>Latest Edits</strong> edition.'
        }
      },
      'empty': {
        'all': {
          'current_task': 'An author needs to start adding content.',
          'next_task': 'Return here to check on the status of editorial.'
        }
      }
    }
  }

  function moveAllContentToState(newState) {
    $.ajax({
      url: $('link#sysroot').attr('href')+'system/api/save_editorial_state?book_id='+book_id+'&state='+newState,
      success: function(data) {
        location.reload();
      },
      error: function(error) {
        location.reload();
      }
    })
  }

  function createNewEdition() {
    console.log('create new edition');
  }

  function calculateFragmentOverflow(){
    var additionalPadding = 10;
    $('.editorial-fragment').each(function() {
      $(this).css('text-indent',($(this).find('strong').width()+additionalPadding) > $(this).innerWidth()?'100vw':0);
    });
  }

  $(document).ready(function() {

    $.ajax({
      url: $('link#sysroot').attr('href')+'system/api/get_editorial_count?book_id='+book_id,
      success: function(data) {

        var content_count = 0;
        var non_hidden_content_count = 0;
        var earliest_state = {'state':'published', 'count':0};

        // initial data processing; figure out the overall book state
        var currentIndex;
        var newIndex;
        for (var key in data) {
          if (key != 'usagerights') {
            currentIndex = editorial_state_array.indexOf(earliest_state.state);
            newIndex = editorial_state_array.indexOf(key);
            if (data[key] > 0 && newIndex <= currentIndex && newIndex != 0) {
              earliest_state.state = key;
              earliest_state.count = data[key];
            }
            if (newIndex != 0) {
              non_hidden_content_count += data[key];
            }
            content_count += data[key];
          }
        }

        var editorial_state;
        if (non_hidden_content_count == 0) {
          editorial_state = editorial_states['empty'];
        } else {
          editorial_state = editorial_states[earliest_state.state];
        }

        var has_editions = false; // TODO: make this real
        var proxy_editorial_state = editorial_state;
        if (has_editions && editorial_state == 'published') {
          proxy_editorial_state += 'WithEditions';
        }

        // figure out how to quantify the overall book state
        var editorial_quantifier;
        if (earliest_state.count == non_hidden_content_count) {
          editorial_quantifier = 'all';
        } else if (earliest_state.count >= non_hidden_content_count * .5) {
          editorial_quantifier = 'majority';
        } else {
          editorial_quantifier = 'minority';
        }

        var current_messaging = editorial_messaging[user_type][proxy_editorial_state.id][editorial_quantifier];

        $('#primary-message > p').remove();
        if (editorial_state.id == 'empty') {
          $('#primary-message').prepend('<p><strong>'+editorial_quantifiers[editorial_quantifier]+' '+project_type+' is '+editorial_state['name']+'.</strong><br>'+current_messaging['current_task']+'</p>');
        } else {
          $('#primary-message').prepend('<p><strong>'+editorial_quantifiers[editorial_quantifier]+' '+project_type+' is in the '+editorial_state['name']+' state.</strong><br>'+current_messaging['current_task']+'</p>');
        }

        // build the editorial state gauge
        var percentage;
        var key;
        var item_quantifier;
        for (var index in editorial_state_array) {
          key = editorial_state_array[index];
          if (data[key] > 0) {
            percentage = parseFloat(data[key]) / content_count * 100;
            item_quantifier = (data[key] != 1) ? 'items' : 'item';
            $('.editorial-gauge').append('<a href="#" class="'+key+'-state editorial-fragment" style="width: '+percentage+'%" data-toggle="popover" role="button" data-placement="bottom" title="'+editorial_states[key]['name']+'" data-content="'+Math.round(percentage)+'% / '+data[key]+' '+item_quantifier+'">&nbsp;&nbsp;<strong>'+editorial_states[key]['name']+'</strong>&nbsp;&nbsp;</a>');
          }
        }
        $('.editorial-fragment').each(function() {
          $(this).popover({ 
            trigger: "hover click", 
            html: true, 
            template: '<div class="popover caption_font" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
          });
        });

        $(window).resize(calculateFragmentOverflow);
        calculateFragmentOverflow();

        // build the usage rights gauge
        if (content_count > 0) {
          usage_rights_percentage = parseFloat(data['usagerights']) / content_count * 100;
          item_quantifier = (data['usagerights'] != 1) ? 'items' : 'item';
          $('.usage-rights-gauge').append('<div class="usage-rights-fragment" style="width: '+usage_rights_percentage+'%"></div><span>Usage rights: '+Math.round(usage_rights_percentage)+'% / '+data['usagerights']+' '+item_quantifier+'</span><span class="pull-right"><a href="'+$('link#parent').attr('href')+'editorialpath">Open editorial path</a></span>');
        }

        // build the next steps messaging
        $('#secondary-message').append('<p>'+current_messaging['next_task']+'</p>');
        for (var index in current_messaging['next_task_buttons']) {
          var button = $('<button class="btn btn-block btn-state '+editorial_state['next']+'-state">'+current_messaging['next_task_buttons'][index]+'</button>').appendTo($('#secondary-message'));
          switch (current_messaging['next_task_ids'][index]) {
            case 'allToEdit':
            button.click(function() { 
              button.prop('disabled', 'disabled');
              moveAllContentToState('edit'); 
            });
            break;
            case 'allToPublished':
            button.click(function() { moveAllContentToState('published'); });
            break;
            case 'newEdition':
            button.click(createNewEdition);
            break;
          }
        }
      }
    }); // Ajax

	$('#manageEditions').on('show.bs.modal', function() {
		$('.editions .btn').blur();
		var $modal = $(this);
		$body = $modal.find('.modal-body:first');
		var do_save_editions = function(add) {
			var json = {'editions':[]};
			$body.find('.edition').each(function() {
				if ($(this).hasClass('deleted')) return;
				var obj = {'title':$(this).find('.title').html(),'millisecond_timestamp':parseInt($(this).find('.formatted').attr('title'))};
				json.editions.push(obj);
			});
			if ('undefined'!=typeof(add)) {
				json.editions.push({'title':add.title,'millisecond_timestamp':parseInt(add.millisecond_timestamp)});
			};
			$.post($('link#sysroot').attr('href')+'system/api/save_editions', {book_id:book_id,editions:JSON.stringify(json)}, function(data) {
				if ('undefined'!=typeof(data.error) && data.error.length) {
					alert('Something went wrong attempting to save: '+data.error);
					return;
				};
				$('#manageEditions').trigger('show.bs.modal');
			}, 'json');
		};
		$.getJSON($('link#sysroot').attr('href')+'system/api/get_editions?book_id='+book_id, function(json) {	
			if ('undefined'==typeof(json.editions) || !Array.isArray(json.editions)) json.editions = [];
			if ('undefined'!=typeof(json.error) && json.error.length) {
				alert('There was an error attempting to get Editions: '+json.error);
				return;
			}
			$.getJSON($('link#sysroot').attr('href')+'system/api/get_editorial_count?book_id='+book_id, function(count) {
				if ('undefined'==typeof(count.published)) {
					alert('Something went wrong trying to get the editorial counts: the data returned was formatted incorrectly.');
					return;
				};
				$body.empty();
				$('<div class="row title"><div class="col-sm-12">Editions</div></div>').appendTo($body);
				if ('undefined'!=typeof(json.editions) && json.editions.length) {
					for (var j = 0; j < json.editions.length; j++) {
						json.editions[j].formatted = $.format.date(json.editions[j].millisecond_timestamp, "ddd, MMMM D, yyyy");
						$row = $('<div class="row edition"></div>').appendTo($body);
						$('<div class="col-sm-2"><a class="glyphicon glyphicon-pencil" href="javascript:void(null);"></a> &nbsp; <a class="glyphicon glyphicon-remove text-danger" href="javascript:void(null);"></a></div>').appendTo($row);
						$('<div class="col-sm-4 formatted" title="'+json.editions[j].millisecond_timestamp+'">'+json.editions[j].formatted+'</div>').appendTo($row);
						$('<div class="col-sm-6"><b class="title">'+json.editions[j].title+'</b></div>').appendTo($row);
					};
					$('<div class="row"><div class="col-sm-12">&nbsp;</div></div>').appendTo($body);
					$body.find('.edition a:nth-child(1)').click(function() {
						alert('Pending...');
					});
					$body.find('.edition a:nth-child(2)').click(function() {
						if (confirm('Are you sure you wish to DELETE this '+$(this).closest('.edition').find('.title').text()+'? This operation can not be undone.')) {
							$(this).closest('.edition').addClass('deleted');
							do_save_editions();
						};
					});
				} else {
					$('<p>No Editions have been created for this <?=$book->scope?>.</p>').appendTo($body);
				};
				var can_create_edition = true;
				for (var type in count) {
					if ('published'==type || 'hidden'==type || 'usagerights'==type) continue;
					if (parseInt(count[type]) > 0) can_create_edition = false; 
				};
				$('<div class="row title"><div class="col-sm-12">Create</div></div>').appendTo($body);
				if (!can_create_edition) {
					$body.append('<p>Right now you can\'t create a new Edition.  All of your pages must be in <b>Published</b> state to create an Edition.</p>');
					return;					
				} else {
					$body.append('<p>You can create a new Edition since all of your pages are in <b>Published</b> state.</p>');
					var $fields_row = $('<form class="row fields"></form').appendTo($body);
					$fields_row.append('<div class="col-sm-8"><div class="input-group"><input required type="text" class="form-control" placeholder="Edition title"><span class="input-group-btn"><button class="btn btn-primary" type="submit">Create</button></span></div>');
					$fields_row.submit(function() {
						var $form = $(this);
						var title = $form.find('input[type="text"]:first').val();
						if (!title.length) {
							alert('Title is a required field.');
							return false;
						};
						$form.find('.btn:last').prop('disabled','disabled');
						// Create edition JSON
						do_save_editions({title:title,millisecond_timestamp:(new Date().getTime())});
						return false;
					});
				};
			});
		});
	});

	var $selector = $('<div class="selector" style="width: 100%; margin-top:-10px; padding-left:15px; padding-right:15px;"></div>').appendTo('#cs');
	var height = parseInt($(window).height()) - parseInt($selector.offset().top) - 10;
	$selector.height(height + 'px');
	var types = ['content'];
	for (var type in editorial_states) {
		if ('hidden'==type.toLowerCase() || 'empty'==type.toLowerCase()) continue;
		types.push(editorial_states[type].name);
	};
	node_options = {  /* global */
		fields:["visible","title","description","last_edited_by","date_edited"],
		allowMultiple:true,
		rowSelectMethod:'highlight',
		rec:"0",
		ref:"0",
		editorialOptions:true,
		defaultType:"content",
		types:types,
		isEdit:true
	};
	$selector.node_selection_dialogue(node_options);
    
  }); // load

</script>

<div class="container-fluid properties">
  <? if (0): ?>
  <div class="row editions">
    <div class="col-sm-12">
      <h3 class="message">There are no editions of this <?=$book->scope?></h3>
      <p class="message">You can create new editions that checkpoint the work you are doing.</p>
      <div class="btn-group">
	    <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
	      Seeing latest edits &nbsp; <span class="caret"></span>
	    </button>
	    <ul class="dropdown-menu">
	      <li><a href="#">Latest edits</a></li>
	    </ul>
	  </div> &nbsp; 
	  <button class="btn btn-default" data-toggle="modal" data-target="#manageEditions">Manage editions</button>
    </div>
  </div>
  <? endif; ?>
  <div class="row editorial-summary">
    <div class="col-md-8">
      <div id="primary-message" class="message-pane">
        <p>Getting current editorial status, one moment...</p>
        <div class="editorial-gauge"></div>
        <div class="usage-rights-gauge"></div>
      </div>
    </div>
    <div class="col-md-4">
      <div id="secondary-message" class="message-pane dark"></div>
    </div>
  </div>
  <div class="row">
    <div class="col-md-12">
      <h5 id="cstitle">Browse content by state</h5>
      <div id="cs"></div>
    </div>
  </div>
  <div class="row">
    <section class="col-xs-7">
      <p><br><br><button class="btn btn-default" data-toggle="modal" data-target="#confirmEditorialWorkflow">Disable editorial workflow</button></p>
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
      <div class="modal-body caption_font">
       	  <p><b>Turning off the Editorial Workflow will disable any Editions.</b> Your readers will see all pages in their most up-to-date
       	  version. However, all data will be maintained in case you wish to turn the Editorial Workflow back on.<br /><br />
       	  Are you sure you wish to turn off the Editorial Workflow for this <?=$book->scope?>?</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-primary">Turn off</button>
      </div>
      </form>
    </div>
  </div>
</div>
<div class="modal fade" id="manageEditions" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <form action="<?=confirm_slash(base_url())?>system/dashboard" method="post" onsubmit="return false;">
      <input type="hidden" name="book_id" value="<?=$book->book_id?>" />  
      <input type="hidden" name="action" value="enable_editorial_workflow" />
      <div class="modal-header">
      	<h4>Manage editions</h4>
      </div>
      <div class="modal-body caption_font">
       	  <p>Loading...</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
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
      Track the editorial state of each piece of content in your <?=$book->scope?>.  Enable editorial workflow on the current
      <?=$book->scope?> by clicking the button below, or <a href="javascript:void(null);">learn more</a>.
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
      <div class="modal-body caption_font">
       	  <p><b>There will be performance and user interface changes to every page in your <?=$book->scope?>.</b><br /><br />
       	  Are you sure you wish to turn on the Editorial Workflow?</p>
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
      Track the editorial state of each piece of content in your <?=$book->scope?>.  Enable editorial workflow on the current
      <?=$book->scope?> by clicking the button below, or <a href="javascript:void(null);">learn more</a>.
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