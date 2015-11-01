$(document).ready(function() {
	set_collections();
	set_search();
	set_sync();
	set_events();
});
$(window).load(function() {
	set_sheet();
});

/**
 * Show or hide the loading dialog
 * @param bool whether to turn off or on
 * @param archive_title title of the archive be added to the list
 * @return null
 */
function loading(bool, archive_title) {
	var $loading = $('#loading');
	if (bool) {
		if ('undefined'!=typeof(archive_title)) $loading.children(':first').append('<div class="a" title="'+archive_title+'">'+archive_title+'</div>');
		$loading.show();
	} else {
		if ('undefined'!=typeof(archive_title)) $loading.find('.a[title="'+archive_title+'"]').remove();
		if (!$loading.find('.a').length) $loading.hide();
	}
}

/**
 * Set UI for the collections sidebar
 * @return null
 */
function set_collections() {

	$('input[name="color"]').spectrum({
	    color: "#9999ff"
	});
	$('#collections_form').children('.all').click(function() {
		switch_to('collections');
		collections_ui(); 
	});
	$('#collections_spreadsheet').find('.view-buttons').find('button').click(function() {
		var $clicked = $(this);
		$clicked.blur();
		$clicked.siblings(':not(.page)').addClass('btn-default').removeClass('btn-primary');
		$clicked.addClass('btn-primary').removeClass('btn-default');
		collections_ui(collections_ui.col_id, $clicked.attr('id'), collections_ui.col_view);
	});	
	$('#edit_collection').on('show.bs.modal', function (event) {
		var $modal = $(this);
		var collections = get_collections();
		var collection = collections[collections_ui.col_id];
		$modal.data('collection_id', collections_ui.col_id);
		$modal.find('[name="title"]').val(collection.title);
		$modal.find('[name="description"]').val(collection.description);
		$modal.find('input[name="color"]').spectrum("set", collection.color);
	});
	$('#edit_collection').find('button:last').click(function() {
		$('#edit_collection').submit();
	});	
	$('#edit_collection').submit(function() {
		var $this = $(this);
		var obj = {};
		var col_id = $this.data('collection_id');
		if ('undefined'==typeof(col_id)) {
			alert('Problem determining the collection ID');
			return false;
		}
		obj.title = $this.find('[name="title"]').val();
		obj.description = $this.find('[name="description"]').val();
		obj.color = '#'+$this.find('input[name="color"]').spectrum("get").toHex();
		if (!obj.title.length) {
			alert('Please enter a title for the collection');
		} else {
			$('body').trigger("collection_edit_node", [ col_id, obj ] );
			$this.find('[name="title"]').val('');
			$this.find('[name="description"]').val('');
			$this.modal('hide');
		}
		return false;
	});	
	$('#create_collection').find('button:last').click(function() {
		$('#create_collection').submit();
	});
	$('#create_collection').submit(function() {
		var $this = $(this);
		var obj = {};
		obj.title = $this.find('[name="title"]').val();
		obj.description = $this.find('[name="description"]').val();
		obj.color = '#'+$this.find('input[name="color"]').spectrum("get").toHex();
		if (!obj.title.length) {
			alert('Please enter a title for the collection');
		} else {
			$('body').trigger("collection_add_node", [ obj ] );
			$this.find('[name="title"]').val('');
			$this.find('[name="description"]').val('');
			$this.modal('hide');
		}	
		return false;
	});
	$('#collection_view').find('button').click(function() {
		collections_ui(collections_ui.col_id, null, $(this).val());
	});	
	$('#delete_collection_link').click(function() {
		if (confirm('Are you sure you wish to delete this collection?')) {
			$('body').trigger("collection_remove_node", [ collections_ui.col_id ] );
		}
	});
	var $filter_collections_form = $('#filter_collections_form');
	$filter_collections_form.submit(function() {  // Submit find archives
		var $this = $(this);
		var $collections_form = $('#collections_form');
		var val = $this.find('input[name="search"]').val().toLowerCase();
		if (!val.length) {
			$collections_form.children().show();
		} else {
			$collections_form.children(':not(.notice,.all)').hide();
			$collections_form.children().each(function() {
				if (-1!=$(this).text().toLowerCase().indexOf(val)) $(this).show();
			});
		}
		return false;
	});	
	$filter_collections_form.find('a').click(function() {
		$(this).closest('form').submit();
	});
	$filter_collections_form.find('input[name="search"]').on('keyup focusout', function() {
		$(this).closest('form').submit();
	});
	$('#advanced_collections_link').click(function() {
		// TODO
	});
	
	collections_ui();
	
}

/**
 * Set UI for the left-side search area
 * @return null
 */
function set_search() {
	
	$find_archives_form = $('#find_archives_form');
	$findable_form = $('#findable_form');
	$findable_form.children('.archive').click(function() {
		switch_to('archives');
		var $this = $(this);
		$this.parent().find('.archive').removeClass('clicked');
		$this.addClass('clicked');
		var index = $this.data('index');
		search_ui(index); 
	});
	// Find archives 
	$find_archives_form.submit(function() {  // Submit find archives
		var val = $find_archives_form.find('input[name="search"]').val().toLowerCase();
		if (!val.length) {
			$findable_form.children().show();
		} else {
			$findable_form.children().hide();
			$findable_form.children().each(function() {
				if (-1!=$(this).attr('title').toLowerCase().indexOf(val)) $(this).show();
			});
		}
		return false;
	});
	$find_archives_form.find('a').click(function() {
		$(this).closest('form').submit();
	});
	$find_archives_form.find('input[name="search"]').on('keyup focusout', function() {
		$(this).closest('form').submit();
	});
	$search_form = $('#search_form');
	$search_form.submit(function() {
		search(1);
		return false;
	});
	$search_form.find('a').click(function() {
		$(this).closest('form').submit();
	});
	var $search_bar = $('#search_bar');
	$search_bar.find('.view-buttons').find('button').click(function() {
		var $clicked = $(this);
		$clicked.blur();
		$clicked.siblings(':not(.page)').addClass('btn-default').removeClass('btn-primary');
		$clicked.addClass('btn-primary').removeClass('btn-default');
		search_results_ui($clicked.attr('id'));
	});		
	$search_bar.find('.page').click(function() {
		var $this = $(this);
		var dir = null;
		var page = null;
		if ($this.hasClass('prev-page')) dir = 'prev';
		if ($this.hasClass('next-page')) dir = 'next';
		switch (dir) {
			case 'prev':
				page = do_search.page - 1;
				break;
			case 'next':
				page = do_search.page + 1;
				break;
		};
		if (null!=page) search(page);
	});	
	
}

/**
 * Set the sync modal
 * @return null
 */
function set_sync() {
	
	var $sync = $('#sync');
	$sync.find('button:last').click(function() {
		sync();
	});
	
	$sync.on('show.bs.modal', function (event) {
		$sync.find('#sync_complete_btn').remove();
		$sync.find('.modal-footer button').show();
		$sync.find('.sync_details').empty();
		$sync.find('#content_progress').width('0%');
		$sync.find('#content_progress span').html('Content 0 of 0');
		var $modal = $(this);
		var $collections = $modal.find('#sync_collections');
		var $destinations = $modal.find('#sync_destinations');
		$collections.empty();
		$destinations.html('Loading Scalar books ....');
		var all = get_imported();
		var collections = get_collections();
		// Collections
		$('#collections_form').find('.collection:not(.notice)').clone().removeClass('clicked').appendTo($collections);
		$collections.find('.collection').click(function() {
			var $this = $(this);
			var is_clicked = $this.hasClass('clicked') ? true : false;
			if ($this.hasClass('all')) {
				$this.parent().children().removeClass('clicked');
				if (is_clicked) {
					$this.removeClass('clicked');
				} else {
					$this.addClass('clicked');
				}
			} else {
				$this.parent().find('.all').removeClass('clicked');
				if (is_clicked) {
					$this.removeClass('clicked');
				} else {
					$this.addClass('clicked');
				}				
			};
			sync_ui();
		});
		// Scalar books
		var base = getParameterByName('base');
		var slug = getParameterByName('slug');
		if (!base.length) {
			$destinations.html('<div class="alert alert-danger" role="alert">Could not find a Scalar install to search for books.</div>');
			return;
		}
		var url = base+'system/api/get_user_books';
		$.getJSON(url, function(data) {
			if (jQuery.isEmptyObject(data)) {
				$destinations.html('<div class="alert alert-warning" role="alert">You are not the author of any books in the Scalar install at <b><a href="'+base+'" target="_blank">'+base+'</a></b>.</div>');
				return;
			}
			$destinations.empty();
			for (var j in data) {
				var uri = base+data[j].slug+'/';
				var id = data[j].book_id;
				var thumb = (data[j].thumbnail.length) ? uri+data[j].thumbnail : '';
				var $node = $('<div class="collection" data-slug="'+data[j].slug+'"><div style="background-image:url('+thumb+');" class="thumb"></div><h5>'+data[j].title+'</h5><div class="desc">'+data[j].description+'</div></div>');
				$node.data('uri',uri);
				$node.data('id',id);
				$destinations.append($node);
			}
			$destinations.find('.collection').click(function() {
				var $this = $(this);
				var is_clicked = $this.hasClass('clicked') ? true : false;
				if (is_clicked) {
					$this.removeClass('clicked');
				} else {
					$this.addClass('clicked');
				};
				sync_ui();
			});
			if (slug.length) {
				var $book = $destinations.find('.collection[data-slug="'+slug+'"]');
				if ($book.length) $book.click();
			};
		}).fail(function() {
			$destinations.html('<div class="alert alert-danger" role="alert">You don\'t appear to be logged in to the Scalar install at <b><a href="'+base+'" target="_blank">'+base+'</a></b>.  Please log in to the install and try again.</div>');
		});
	});	
	
}

/**
 * Set the UI for for the current collection in one of many possible views
 * @view str optional view to set 
 * @return null
 */
function collections_ui(col_id, view, col_view) {
	
	var collections = get_collections();
	if ('undefined'==typeof(col_id)) col_id = null;
	collections_ui.col_id = col_id;
	if ('undefined'==typeof(view) || null==view) view = $('#collections_spreadsheet').find('.view-buttons').find('button[class*="btn-primary"]').attr('id');
	var $collections_spreadsheet = $('#collections_spreadsheet');
	var $collection_bar = $('#collection_bar');
	var $collection_view = $('#collection_view');
	var $filter_collections_form = $('#filter_collections_form');
	var $collections_form = $('#collections_form');
	var $edit_collection_link = $('#edit_collection_link');
	var $delete_collection_link = $('#delete_collection_link');

	// Collection view
	var col_view = ('undefined'==typeof(col_view)) ? $collection_view.find('.btn-primary:first').val() : col_view;
	collections_ui.col_view = col_view;
	$collection_view.find('button').removeClass('btn-primary').addClass('btn-default');
	$collection_view.find('button[value="'+col_view+'"]').removeClass('btn-default').addClass('btn-primary');
	
	// Collections
	$filter_collections_form.find('input[name="search"]').val('');
	$collections_form.children('.all').removeClass('clicked');
	$collections_form.children(':not(.notice, .all)').remove();
	for (var j = 0; j < collections.length; j++) {
		var $collection = $('<div class="collection'+((j==col_id)?' clicked':'')+'"></div>');
		$collection.append('<div class="color" style="background-color:'+collections[j].color+';"><span class="num_items">0</span></div>');
		$collection.append('<h5>'+collections[j].title+'</h5>');
	    $collection.append('<div class="desc">'+collections[j].description+'</div>');
	    $collections_form.append($collection);
	    $collection.data('collections_index', j)
	    $collection.click(function() {
			$('#welcome_msg').hide();
			$('#search_spreadsheet').hide();
			$('#findable_form').find('.archive').removeClass('clicked');
			$collection_view.find('button').removeClass('btn-primary').addClass('btn-default');
			$collection_view.find('button[value="view"]').removeClass('btn-default').addClass('btn-primary');
	    	var index = $(this).data('collections_index');
	    	collections_ui(index);
	    });
	}

	set_collections_numbers();
	if (!$('#welcome_msg').is(':hidden')) return;
	if ($collections_spreadsheet.is(':hidden')) $collections_spreadsheet.show();
	var welcome_msg = '<div class="welcome_msg">There are no items in this collection<br />You can add some by clicking <a href="javascript:void(null);"><span class="glyphicon glyphicon-plus"></span> Add / remove</a> above</div>';
	if (null==col_id) var welcome_msg = '<div class="welcome_msg">No items have been imported<br />You can begin importing by selecting an archive to search</div>';
	
	// Current collection
	var results = {};
	var check = {};
	var checkable = false;
	if (null==col_id) {
		if ('edit'==col_view) {
			results = get_imported();
			check = get_imported();
			checkable = true;
		} else {
			results = get_imported();
		}
		//$('#spreadsheet_gradient').css('background', '');
		$collections_form.find('.all').addClass('clicked');
		$edit_collection_link.hide();
		$delete_collection_link.hide();
		$collection_bar.find('#title').html('All imported media');
	} else {
		if ('undefined'==typeof(collections[col_id])) {
			alert('There was a problem trying to find the collection.  Please try again.');
			return;
		}
		if ('edit'==col_view) {
			results = get_imported();
			check = collections[col_id].items;	
			checkable = true;
		} else {
			results = collections[col_id].items;
		}
		//$('#spreadsheet_gradient').css('background', 'linear-gradient(to bottom, '+convertHex(collections[col_id].color,40)+', white)' );
		$edit_collection_link.show();
		$delete_collection_link.show();
		$collection_bar.find('#title').html('<span class="color" style="background-color:'+collections[col_id].color+';"></span>' + collections[col_id].title);
	}

	// Load current view
	if (view == collections_ui.view) {
		$('#collections_spreadsheet_content').attr('class',view+'_view').spreadsheet_view({rows:results,check:check,num_archives:2,checkable:checkable,msg:welcome_msg});
	} else {
		var view_path = $('link#base_url').attr('href')+'application/views/templates/jquery.'+view+'.js';
		$.getScript(view_path, function() {
			collections_ui.view = view;
			$('#collections_spreadsheet_content').attr('class',view+'_view').spreadsheet_view({rows:results,check:check,num_archives:2,checkable:checkable,msg:welcome_msg});
		});
	}
	
}

/**
 * Set the UI for search results in one of many possible views
 * @view str optional view to set 
 * @return null
 */
function search_ui(index) {

	var $search_spreadsheet = $('#search_spreadsheet');
	$search_spreadsheet.show();	
	
	var $archive = $('#findable_form').children('.archive').eq(index);
	$search_spreadsheet.find('[name="search"]').val('').attr('placeholder', $archive.find('h5').text()).focus();
	$search_spreadsheet.find('.page').css('visibility','hidden');
	$('#search_spreadsheet_content').html('<div class="welcome_msg"><br />You can search the archive by entering terms<br />in the <a href="javascript:void(null);"><span class="glyphicon glyphicon-search"></span> search field</a> above<br /><br />You can choose to have imported content populate a specific<br />collection by selecting it in the adjacent pulldown</div>');
	
	$('#select_archive').find('button:first').html('No collection');
	var $into_collection = $('#into_collection');
	$into_collection.empty();
	$into_collection.append('<li><a data-index="" href="javascript:void(null);">No collection</a></li>');
	var collections = get_collections();
	for (var j in collections) {
		$into_collection.append('<li><a data-index="'+j+'" href="javascript:void(null);"><span class="color" style="background-color:'+collections[j].color+'"></span>'+collections[j].title+'</a></li>');
	};
	$into_collection.find('a').click(function() {
		var $this = $(this);
		$('#select_archive').find('button:first').html($this.parent().html());
		var $collections_form = $('#collections_form');
		$collections_form.find('.collection').removeClass('clicked');
		var index = parseInt($this.data('index'));
		if (!isNaN(index)) $collections_form.find('.collection:not(.all)').eq(index).addClass('clicked');
		collections_ui.col_id = (isNaN(index)) ? null : index;
	});
	if (null!=collections_ui.col_id) {
		$into_collection.find('a').eq(collections_ui.col_id+1).click();
	}
	
}

/**
 * Set the UI for when results are returned
 */
function search_results_ui(view) {
	
	// Presets
	var $error = $('#error');
	if (jQuery.isEmptyObject(do_search.results) && $error.is(':hidden')) {};
	if ('undefined'==typeof(view)) view = $('#search_spreadsheet').find('.view-buttons').find('button[class*="btn-primary"]').attr('id');
	if ('undefined'!=typeof($.fn.spreadsheet_view)) $.fn.spreadsheet_view.remove();
	// Sort results, but only if there's more than one archive being search
	if (do_search.total > 1) do_search.results = sort_rdfjson_by_prop(do_search.results, 'http://purl.org/dc/terms/title');
	// Set num results
	$('.num_results').html( $.map(do_search.results, function(n, i) { return i; }).length );
	// Pagination
	$('.page').css('visibility','hidden');
	if (do_search.page > 1) $('.prev-page').css('visibility','visible').find('.num').html(do_search.page-1);
	$('.next-page').css('visibility','visible').find('.num').html(do_search.page+1);
	// Load current view
	var view_path = $('link#base_url').attr('href')+'application/views/templates/jquery.'+view+'.js';
	$.getScript(view_path, function() {
		$('#search_spreadsheet_content').attr('class',view+'_view').spreadsheet_view({rows:do_search.results,check:get_imported(),num_archives:do_search.total});
	});	
	
}

/** 
 * Interactions inside the sync modal
 * @return null
 */
function sync_ui() {
	
	var items = {};
	var num_collections = 0;
	var num_destinations = 0;
	var $sync_details = $('.sync_details');
	if ($('#sync_collections').find('.all').hasClass('clicked')) {
		items = get_imported();
		num_collections = 1;
	} else {
		var collections = get_collections();
		$('#sync_collections').find('.collection:not(.all)').each(function(index) {
			var $this = $(this);
			if (!$this.hasClass('clicked')) return;
			num_collections++;
			$.extend(items, collections[index].items);
		});
	};
	$('#sync_destinations').children().each(function(index) {
		var $this = $(this);
		if (!$this.hasClass('clicked')) return;
		num_destinations++;
	});
	$sync_details.empty();
	var num_items = $.map(items, function(n, i) { return i; }).length;
	if (num_collections > 0) $sync_details.html('Sync <b>'+num_items+'</b> item'+((num_items>1)?'s':'')+' from <b>'+num_collections+'</b> collection'+((num_collections>1)?'s':''));
	if (num_destinations > 0) $sync_details.append('<span>&nbsp; <span class="glyphicon glyphicon-arrow-right"></span> &nbsp;</span> <b>'+num_destinations+'</b> Scalar book'+((num_destinations>1)?'s':''));	
	
}

/**
 * Set event handlers for managing imported and collection items 
 * @return null
 */
function set_events() {

	if ('undefined'==typeof(ns)) ns = $.initNamespaceStorage('tensor_ns');  // global
	if ('undefined'==typeof(storage)) storage = ns.localStorage;  // global
	
	var imported = ('undefined'!=typeof(storage.get('imported'))) ? storage.get('imported') : {};
	$('.num_imported').html( $.map(imported, function(n, i) { return i; }).length );
	
	$("body").on( "import_add_node", function( event, uri, values ) {
		// All
		var imported = storage.get('imported');
		if ('undefined'==typeof(imported)) imported = {};
		imported[uri] = values;
		storage.set('imported', imported);		
		// Collection
		var col_id = collections_ui.col_id;
		if (null!=col_id) {
			var collections = storage.get('collections');
			if ('undefined'!=typeof(collections[col_id])) {
				collections[col_id].items[uri] = values;
				storage.set('collections', collections);
			};		
		};
		// UI
		set_collections_numbers();
	});	
	$("body").on( "import_remove_node", function( event, uri ) {
		var col_id = collections_ui.col_id;
		if (null==col_id) {		
			var imported = storage.get('imported');
			if ('undefined'==typeof(imported)) imported = {};
			if ('undefined'!=typeof(imported[uri])) delete imported[uri];
			storage.set('imported', imported);	
			// Remove from collection items
			var collections = storage.get('collections');
			if ('undefined'==typeof(collections)) collections = [];
			for (var j in collections) {
				if ('undefined'!=collections[j].items[uri]) {
					delete collections[j].items[uri];
				}
			}
			storage.set('collections', collections);
		} else {
			var collections = storage.get('collections');
			delete collections[col_id].items[uri];
			storage.set('collections', collections);
		}
		set_collections_numbers();
	});		
	
	$("body").on( "node_not_clickable", function( event, uri, values, $el ) {
		var $edit_metadata = $('#edit_metadata');
		var $header = $edit_metadata.find('.modal-header');
		var $body = $edit_metadata.find('.modal-body');
		$header.find('.thumb').css('background-image', '');
		$body.empty();
		$edit_metadata.modal('show');
		values = sort_predicates_by_prop(values);
		var thumb = '';
		for (var p in values) {
			var $p = $('<div class="row"><div class="col-xs-12 col-sm-2 p"></div><div class="col-xs-12 col-sm-10 v"></div></div>');
			$p.find('div:first').data('p',p).html( pnode(p) );
			for (var j = 0; j < values[p].length; j++) {
				$p.find('div:last').append('<input type="text" class="form-control" value="'+escapeHtml(values[p][j].value)+'" />');
			}
			$body.append($p);
			if ('http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail' == p && 'undefined'!=typeof(values[p][0])) {
				thumb = values[p][0].value;
			}
		}
		if (thumb.length) {
			$header.find('.thumb').css('background-image', 'url('+thumb+')');
		}
	});		
	
	$("body").on( "collection_add_node", function( event, obj ) {
		var collections = storage.get('collections');
		if ('undefined'==typeof(collections)) collections = [];
		obj.items = {};
		collections.push(obj);
		storage.set('collections', collections);
		switch_to('collections');
		collections_ui(collections.length-1);
	});	
	$("body").on( "collection_edit_node", function( event, col_id, obj ) {
		var collections = storage.get('collections');
		if ('undefined'==typeof(collections[col_id])) return;
		collections[col_id].title = obj.title;
		collections[col_id].description = obj.description;
		collections[col_id].color = obj.color;
		storage.set('collections', collections);
		collections_ui(col_id);
	});		
	$("body").on( "collection_remove_node", function( event, index ) {
		var collections = storage.get('collections');
		if ('undefined'==typeof(collections)) collections = [];
		if ('undefined'!=typeof(collections[index])) collections.splice(index, 1);
		storage.set('collections', collections);
		collections_ui();
		$('#collections_form').find('.all').click();
	});		
	
}

/**
 * Get the imported object from localStorage
 * @return obj imported items
 */
function get_imported() {
	
	if ('undefined'==typeof(ns)) ns = $.initNamespaceStorage('tensor_ns');  // global
	if ('undefined'==typeof(storage)) storage = ns.localStorage;  // global
	var obj = storage.get('imported');
	if ('undefined'==typeof(obj)) obj = {};
	return obj
	
}

/**
 * Get the collections object from localStorage
 * @return obj imported items
 */
function get_collections() {
	
	if ('undefined'==typeof(ns)) ns = $.initNamespaceStorage('tensor_ns');  // global
	if ('undefined'==typeof(storage)) storage = ns.localStorage;  // global
	var arr = storage.get('collections');
	if ('undefined'==typeof(arr)) arr = [];
	return arr;
	
}

function switch_to(type) {
	
	if ('collections'==type) {
		$('#welcome_msg').hide();
		$('#search_spreadsheet').hide();
		$('#findable_form').find('.archive').removeClass('clicked');
		$('#collection_view').find('button').removeClass('btn-primary').addClass('btn-default');
		$('#collection_view').find('button[value="view"]').removeClass('btn-default').addClass('btn-primary');	
		$('#select_archive').find('button:first').html('Import into collection');
	} else if ('archives'==type) {
		$('#welcome_msg').hide();
		$('#collections_spreadsheet').hide();
		$('#select_archive').find('button:first').html('Import into collection');		
		if (null==collections_ui.col_id) {
			$('#collections_form').find('.collection').removeClass('clicked');
		}
	}
	
}

function set_collections_numbers() {

	var collections = get_collections();
	for (var j in collections) {
		var num = $.map(collections[j].items, function(n, i) { return i; }).length;
		$('#collections_form').find('.collection:not(.all)').eq(j).find('.num_items').text(num);
	}
	var imported = get_imported();
	var num = $.map(imported, function(n, i) { return i; }).length;
	$('#collections_form').find('.all').find('.num_items').text(num);
	
}

function set_sheet() {
	var $search = $('.search:first');
	var $manage = $('.collections:first');

	// Set sheet height
	//set_sheet_height();
	
	// Advanced search
	$('#advanced_search_link').click(function() {
		var $advanced_search = $('#advanced_search');
		if (!$advanced_search.is(':hidden')) {
			$('.spreadsheet_panel').hide();
			return;
		}
		$('.spreadsheet_panel').hide();
		$advanced_search.show();
		$advanced_search.css('min-height', $advanced_search.parent().innerHeight());
		$('#advanced_search_link').blur();
		set_advanced_search();
		$advanced_search.find('.close_btn').click(function() {
			$advanced_search.hide();
		});
	});	
	// Manage archives
	$('#advanced_find_archives_link').click(function() {
		var $manage_archives = $('#manage_archives');
		if (!$manage_archives.is(':hidden')) {
			$('.spreadsheet_panel').hide();
			return;
		}		
		$('.spreadsheet_panel').hide();
		if (!$manage_archives.is(':hidden')) return;
		$manage_archives.show();
		$manage_archives.css('min-height', $manage_archives.parent().innerHeight());
		$('#advanced_find_archives_link').blur();
		set_manage_archives();
		$manage_archives.find('.close_btn').click(function() {
			$manage_archives.hide();
		});
	});
}

function set_sheet_height() {
	var $spreadsheets = $('.spreadsheet');
	var h = parseInt($(window).height());
	$spreadsheets.css('min-height',h);
}

/** 
 * Setup sync between imported items and destinations
 * $return null
 */
function sync() {
	
	var items = {};
	var destinations = [];
	var collections = get_collections();
	var $sync_collections = $('#sync_collections');
	var $sync_destinations = $('#sync_destinations');
	// Items
	if ($sync_collections.find('.all').hasClass('clicked')) {
		items = get_imported();
	} else {
		$sync_collections.find('.collection:not(.all)').each(function(index) {
			var $this = $(this);
			if (!$this.hasClass('clicked')) return;
			$.extend(items, collections[index].items);
		});
	};
	if ($.isEmptyObject(items)) {
		alert('There are no items to import.  Please select one or more collections that contain items.');
		return;
	}
	// Destinations
	$sync_destinations.find('.collection').each(function(index) {
		var $this = $(this);
		if (!$this.hasClass('clicked')) return;
		destinations.push({'uri':rtrim($this.data('uri'),'/'),'id':$this.data('id')});
	});
	if (!destinations.length) {
		alert('Please select one or more destination Scalar books.');
		return;
	}
	// Run sync
	do_sync(items, destinations);
	
}

/** 
 * Run sync
 * @return null
 */
function do_sync(items, destinations) {
	
	var $sync = $('#sync');
	$sync.find('button').attr('disabled','disabled');
	
	for (var j in items) {
		items[j]['http://scalar.usc.edu/2012/01/scalar-ns#slug'] = [{type:'uri',value:'media/'+items[j]['http://purl.org/dc/terms/title'][0].value}];
	}
	
	for (var j in destinations) {
		$sync.rdfimporter({
			rdf:items,
			source_url:'',
			dest_urn:'urn:scalar:book:'+destinations[j].id,
			dest_id:'foo',
			dest_url:destinations[j].uri
		}, function() {
			$sync.find('button').removeAttr('disabled');
			var $parent = $sync.find('.modal-footer');
			$parent.find('button').hide();
			$parent.append('<button id="sync_complete_btn" type="button" class="btn btn-success">Return to collections and archives</button>');
			$parent.find('button:last').click(function() {
				$sync.modal('hide');
			});
		});
	};
	
}

/**
 * Setup search on archives in the searchable form based on keyword in the search form
 * @return null
 */
function search(page) {

	if ('undefined'==typeof(page)) page = 1;
	var $search_form = $('#search_form');
	var $search = $search_form.find('[name="search"]:first');
	
	$search_form.children().removeClass('has-warning');
	$search_form.find('.glyphicon').removeClass('bg-danger');
	var sq = $search.val();
	if (!sq.length) {
		$search_form.children().addClass('has-warning');
		$search_form.find('.glyphicon').addClass('bg-danger');
		return;
	}

	var obj = $.fn.parse_search(sq);
	if (!obj.terms.length) {
		alert('Please enter one or more search terms');
		return;
	}

	do_search(obj, $('#findable_form').children('.clicked'), page);
	
};

/**
 * Run search
 * @param obj search object including terms
 * @param $archives list of archives to run search on
 * @return null
 */
function do_search(obj, $archives, page) {
	
	do_search.results = {}; 
	do_search.total = $archives.length;
	do_search.returned = 0;
	if ('undefined'==typeof(page)) page = 1;
	do_search.page = page;

	$archives.each(function() {
		var $archive = $(this);
		var archive = $.extend({}, $archive.data('request'));
		var proxy_url = $('link#proxy_url').attr('href');
		var parser_path = $('link#base_url').attr('href')+'application/views/parsers/'+archive.parser+'.js';
		archive.source = archive.source.replace('%2',page);
		archive.source = archive.source.replace('%1',obj.terms.join('%20'));
		$.extend(archive, {page:page,query:obj.terms.join(' '),proxy_url:proxy_url,error_callback:store_error_callback,complete_callback:store_complete_callback});
		$.getScript(parser_path, function() {
			loading(true, archive.title);
			$.fn.parse(archive);
		}).fail(function() {
			var $error = $('#error');
			$error.find('[class="modal-body"]').html('<p>Could not find parser</p>');
			$error.modal();
		});			
	});
	
}

function store_error_callback(error, archive) {
	
	loading(false, archive.title);
	do_search.returned++;
	var $error = $('#error');
	if ('200 OK'==error) error = error+', but the request returned empty';
	var html = '<p>There was an error attempting to gather results from the triples store:</p>';
	html += '<p><b>'+error+'</b></p>';
	html += '<p>Please try again</p>';
	$error.find('[class="modal-body"]').html(html);
	$error.modal();
	if (do_search.returned==do_search.total) search_results_ui();
	
}

function store_complete_callback(_results, archive) {

	loading(false, archive.title);
	do_search.returned++;
	jQuery.extend(do_search.results, _results); 
	if (do_search.returned==do_search.total) search_results_ui();

}

function set_advanced_search() {
	$('#search').advanced_search({form:$('#advanced_form'),callback:function() {
		$('#search_form').submit();
	}});
}

function set_manage_archives() {
	var $manage_archives = $('#manage_archives');
	var $managable_form = $('#managable_form');
	$managable_form.empty();
	// Set archives
	var archives = [];
	$('#searchable_form, #findable_form').children('.archive').each(function() {
		var $cloned = $(this).clone();
		if ($(this).closest('#searchable_form').length) $cloned.addClass('active');
		$cloned.unbind('click');
		$managable_form.append($cloned);
	});
	var $divs = $managable_form.children();
    var alphabeticallyOrderedDivs = $divs.sort(function(a,b){
        return $(a).attr('title') > $(b).attr('title');
    });
    $managable_form.html(alphabeticallyOrderedDivs);	
    $managable_form.children().click(function(event, dont_trigger_click) {
    	var $this = $(this);
    	var title = $this.attr('title');
    	if ($this.hasClass('active')) {
    		$this.removeClass('active');
    	} else {
    		$this.addClass('active');
    	}
    	if (!dont_trigger_click) $('.search').find('.archive[title="'+title+'"]').trigger('click', [true]);
    });
    // Set buttons
    $manage_archives.find('button').click(function() {
    	var $this = $(this);
    	var selected = $this.val();
        $manage_archives.find('button').removeClass('btn-primary').addClass('btn-default');
        $this.addClass('btn-primary');  // All   	
        $manage_archives.find('.archive').each(function() {
        	var $archive = $(this);
        	if (!selected.length) {
        		$archive.show();
        		return;
        	}
        	var arr = $archive.data('categories').split(',');
        	if (arr.indexOf(selected)!=-1) {
        		$archive.show();
        		return;
        	}
        	$archive.hide();
        });
    });
    $manage_archives.find('button:first').trigger('click');  // All
}

function sort_rdfjson_by_prop(obj, p) {
	
    ps = [];
    for (var k in obj) {
    	ps.push(obj[k][p][0].value.toLowerCase());
	}
    ps.sort();
	
    var results = {};
    for (var j = 0; j < ps.length; j++) {
    	pv = ps[j];
    	for (var key in obj) {
    		if (obj[key][p][0].value.toLowerCase() == pv) {
    			results[key] = obj[key];
    			continue;
    		}
    	}
    }
    
    return results;

}

//http://jsfiddle.net/ekinertac/3Evx5/1/
function convertHex(hex,opacity){
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);

    result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
    return result;
}

// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// http://phpjs.org/functions/rtrim/
function rtrim(str, charlist) {
	  charlist = !charlist ? ' \\s\u00A0' : (charlist + '')
	    .replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\\$1');
	  var re = new RegExp('[' + charlist + ']+$', 'g');
	  return (str + '')
	    .replace(re, '');
}

function pnode(uri) {
	var namespaces = {
		'rdf':'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
		'rdfs':'http://www.w3.org/2000/01/rdf-schema#',
		'dc':'http://purl.org/dc/elements/1.1/',
		'dcterms':'http://purl.org/dc/terms/',
		'ctag':'http://commontag.org/ns#',
		'art':'http://simile.mit.edu/2003/10/ontologies/artstor#',
		'sioc':'http://rdfs.org/sioc/ns#',
		'sioctypes':'http://rdfs.org/sioc/types#',
		'foaf':'http://xmlns.com/foaf/0.1/',
		'owl':'http://www.w3.org/2002/07/owl#',
		'ov':'http://open.vocab.org/terms/',
		'oac':'http://www.openannotation.org/ns/',
		'scalar':'http://scalar.usc.edu/2012/01/scalar-ns#',
		'shoah':'http://tempuri.org/'
	};
	for (var j in namespaces) {
		if (uri.substr(0, namespaces[j].length) == namespaces[j]) return j + ':' + uri.substr(namespaces[j].length);
	}
	return '';
}

function sort_predicates_by_prop(obj) {
    ps = [];
    for (var p in obj) {
    	ps.push(pnode(p).toLowerCase());
	}
    ps.sort();
    var results = {};
    for (var j = 0; j < ps.length; j++) {
    	p = ps[j];
    	for (var key in obj) {
    		if (pnode(key).toLowerCase() == p) {
    			results[key] = obj[key];
    			continue;
    		}
    	}
    }
    return results;
}

// http://stackoverflow.com/questions/1787322/htmlspecialchars-equivalent-in-javascript
function escapeHtml(text) {
	  var map = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#039;'
	  };
	  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
