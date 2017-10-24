<?$this->template->add_css('system/application/views/widgets/edit/content_selector.css')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.content_selector_bootstrap.js')?>
<?$this->template->add_css('body {margin-bottom:0;}','embed')?>

<script>
var my_user_id = <?=(($login->is_logged_in)?$login->user_id:0)?>;
$(document).ready(function() {
	var $selector = $('<div class="selector" style="width: 100%; margin-top:-10px; padding-left:15px; padding-right:15px;"></div>').appendTo('#tabs-users');
	var height = parseInt($(window).height()) - parseInt($selector.offset().top) - 10;
	$selector.height(height + 'px');
	node_options = {  /* global */
		fields:["name",'homepage','role','listed','order','bio_contributions'],
		types:['users'],
		displayHeading:false,
		deleteOptions:deleteOptions,
		userOptions:userOptions,
		allowMultiple:true,
		rowSelectMethod:'highlight',
		isEdit:true,
		editable:["order","role"]
	};
	$selector.node_selection_dialogue(node_options);	
});
function deleteOptions($content) {
	if ('undefined'==typeof(book_id) || book_id == 0) {
		alert('Please select a book');
		return;
	};
	var user_ids = [];
	$content.each(function() {
		var item = $(this).data('item');
		var uri = item.uri;
		var user_id = parseInt(uri.substr(uri.lastIndexOf('/')+1));
		user_ids.push(user_id);
	});
	if (user_ids.indexOf(my_user_id) != -1) {
		alert('You can\'t remove yourself!');
		return;
	};
	if (!confirm('Are you sure you wish to remove '+user_ids.length+' user'+((user_ids.length>1)?'s':'')+'?')) {
		return;
	};
	$('.selector .botton_options_box button:nth-child(2)').prop('disabled','disabled');
	var total = user_ids.length;
	var finish = function(num) {
		if (num < total) return;
		$('.selector .botton_options_box button:nth-child(2)').removeProp('disabled');
		var $selector = $('.selector');
		$selector.find('.node_selector').remove();
		$selector.html('<h5 class="loading">Loading...</h5>').node_selection_dialogue(node_options);
	};
	for (var j = 0; j < user_ids.length; j++) {
		$.get('api/delete_book_user', {user_id:user_ids[j], book_id:book_id}, function() {
			finish(j+1);
		});
	};
};
function userOptions() {
	if ('undefined'==typeof(book_id) || book_id == 0) {
		alert('Please select a book');
		return;
	};
	$userOptionsModal = $('#userOptionsModal');
	$userOptionsModal.on('shown.bs.modal', function (e) {
		$(this).find('#fullname').val('').focus();
	});
	$userOptionsModal.modal();
	var last_sent = '';
	$userOptionsModal.find('#fullname').off('keyup').keyup(function() {
		var $this = $(this);
		var text = $this.val();
		if (text.length < 3) return;
		if (text == last_sent) return;
		last_sent = text.slice(0);
		$.getJSON('api/user_search', {fullname:text}, function(data) {
			if (!data.length) {
				$userOptionsModal.find('#alert').show();
				$userOptionsModal.find('.search_results').hide();
				return;
			};
			$userOptionsModal.find('#alert').hide();
			$userOptionsModal.find('.search_results').show();
			var $tbody = $userOptionsModal.find('.search_results tbody');
			$tbody.empty();
			for (var j = 0; j < data.length; j++) {
				var $row = $('<tr><td>'+data[j].fullname+'</td></tr>').appendTo($tbody);
				$row.data('user_id', data[j].user_id);
			};
			$tbody.find('tr').click(function() {
				var $this = $(this);
				$this.addClass('active').addClass('info').siblings().removeClass('active').removeClass('info');
			});
		});
		
	});
	$userOptionsModal.find('.glyphicon-remove').click(function() {
		$(this).closest('div').find('input').val('').focus();
	});
	$userOptionsModal.find('.modal-footer button:last').off('click').on('click', function() {
		var $selected = $userOptionsModal.find('tr.active');
		if (!$selected.length) {
			alert('Please select a user\'s name from the list');
			return;
		}
		var user_id = $selected.data('user_id');
		$(this).prop('disabled','disabled');
		$.get('api/save_user_books', {id:user_id, selected_ids:[book_id], list_in_index:0}, function() {
			$(this).removeProp('disabled');
			$userOptionsModal.modal('hide');
			var $selector = $('.selector');
			$selector.find('.node_selector').remove();
			$selector.html('<h5 class="loading">Loading...</h5>').node_selection_dialogue(node_options);
		});
	});
};
</script>

<div class="modal fade" id="userOptionsModal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
	  <form class="form-horizontal" onsubmit="return false;">
	  <input type="hidden" name="user_id" value="<?=$login->user_id?>" />
      <div class="modal-body">
        <div class="page-header"><h4>Add a user</h4></div>
        <div class="form-group has-feedback">
          <div class="col-sm-12">
            <input type="text" class="form-control" id="fullname" placeholder="Search for a user by their fullname" autocomplete="off">
            <span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>
          </div>
        </div>
        <div class="page-v-spacer"></div>
		<div class="text-danger" id="alert" style="display:none;">There are no users with that fullname in this Scalar install.</div>
		<div class="search_results" style="display:none;">
	        <div class="table-responsive">
	          <table class="table table-condensed table-hover">
	            <thead>
	              <tr><th>Name</th></tr>
	            </thead>
	            <tbody></tbody>
	          </table>
	        </div>
	    </div> 
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Add</button>
      </div>
      </form>
    </div>
  </div>
</div>