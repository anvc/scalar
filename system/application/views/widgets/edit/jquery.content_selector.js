(function( $ ) {
	var defaults = {
			parent:$('link#parent').attr('href'),
			type:null,
			changeable:true,
			desc_max_length: 100,
			filename_max_length: 20,
			data:[],
			msg:''
	};  	
    $.fn.content_selector = function(options) {
    	// Options
    	var self = this;
    	var $this = $(this);
    	var opts = $.extend( {}, defaults, options );
    	// Object to VAR str
    	var obj_to_vars = function(obj) {
    		var str = '';
    		for (var field in obj) {
    			str += field+'='+encodeURIComponent(obj[field])+'&';
    		}
    		return str;
    	};
    	// Helpers
    	var basename = function(path, suffix) {
    		var b = path;
    		var lastChar = b.charAt(b.length - 1);
    		if (lastChar === '/' || lastChar === '\\') {
    			b = b.slice(0, -1);
    		}
    		b = b.replace(/^.*[\/\\]/g, '');
    		if (typeof suffix === 'string' && b.substr(b.length - suffix.length) == suffix) {
    			b = b.substr(0, b.length - suffix.length);
    		}
    		return b;
    	};
    	// Reset
    	var reset = function() {  // TODO: for some reason defaults.data is getting set when it should only be opts.data that is
    		defaults.type = null;
    		defaults.changeable = true;
    		defaults.data = [];
    		defaults.msg = '';
    	}
    	// Create an API call
    	var url = function() {
    		var type = 'content';
    		var get_vars = {rec:0,ref:0};
    		if ('composite'==opts.type||'page'==opts.type) {
    			type = 'composite';
    		} else if ('media'==opts.type) {
    			type = 'media';
    		} else if (opts.type) {
    			type = opts.type;
    		}
    		opts.type = type;
    		if ('annotation'==opts.type) get_vars.rec = 1;
    		var url = opts.parent+'rdf/instancesof/'+type+'?format=json&'+obj_to_vars(get_vars);
    		return url;
    	};
    	// Search
    	var isearch = function(val) {
    		var $rows = $this.find('tr');
    		val = val.toLowerCase();
    		if (!val.length) {
    			$rows.show();
    		}
    		$rows.hide();
    		$rows.each(function() {
    			var $row = $(this);
    			$row.find('td:nth-child(2),td:nth-child(3),td:nth-child(4)').each(function() {
    				if ($(this).text().toLowerCase().indexOf(val)!=-1) $row.show();
    			});
    		});
    	}
    	// Initialize the interface
    	var init = function() {
    		$this.addClass('content_selector');
    		var $wrapper = $('<div class="wrapper"></div>').appendTo($this);
    		$('body').append($this);
    		var $options = $('<div class="options"></div>').appendTo($wrapper);
    		var $content = $('<div class="content"><div class="howto">Select a content type or enter a search term above</div></div>').appendTo($wrapper);
    		var $footer = $('<div class="footer"><div class="msg">'+opts.msg+'</div><a href="javascript:void(null);" class="generic_button">Cancel</a></div>').appendTo($wrapper);
    		$options.append('<form class="search_form"><input type="text" name="sq" placeholder="Search" /> <input type="submit" value="Go" />&nbsp; &nbsp; <label><input type="radio" name="type" value="content"> All</label> &nbsp;<label><input type="radio" name="type" value="composite"> Pages</label> &nbsp;<label><input type="radio" name="type" value="media"> Media</label> &nbsp;<label><input type="radio" name="type" value="path"> Paths</label> &nbsp;<label><input type="radio" name="type" value="tag"> Tags</label> &nbsp;<label><input type="radio" name="type" value="annotation"> Annotations</label> &nbsp;<label><input type="radio" name="type" value="reply"> Comments</label></form>');
    		$footer.find('a:first').click(function() {
    			reset();
    			$(this).closest('.content_selector').remove();
    		});
    		$options.find('input[value="'+opts.type+'"]').prop('checked',true);
    		if (!opts.changeable) {
    			$options.find('input[type="radio"]').prop('disabled', true);
    			$options.find('input[type="text"]').keyup(function() {
    				isearch($(this).val());
    			});
    			$options.submit(function() {
    				isearch($(this).find('input[type="text"]').val());
    				return false;
    			});    			
    		} else {
    			$options.find('input[name="type"]').change(function() {
    				var val = $(this).filter(':checked').val();
    				opts.type = val;
    				go();
    			});
    			$options.submit(function() {
    				alert('TODO');
    				return false;
    			});
    		}
    	};
    	// Propagate the interface
    	var propagate = function() {
    		console.log(opts.data);
    		$this.find('.content').html('<table cellspacing="0" cellpadding="0"><tbody><tr><th></th><th>Title</th><th>Description</th><th>URL</th><th></th></tr></tbody></table>');
    		var $tbody = $this.find('tbody:first');
    		for (var j in opts.data) {
    			var $tr = $('<tr class="'+((j%2==0)?'even':'odd')+'"></tr>').appendTo($tbody);
    			$tr.data('node', opts.data[j]);
    			var title = opts.data[j].version['http://purl.org/dc/terms/title'][0].value;
    			var desc = ('undefined'!=typeof(opts.data[j].version['http://purl.org/dc/terms/description'])) ? opts.data[j].version['http://purl.org/dc/terms/description'][0].value : null;
    			if (desc && desc.length > opts.desc_max_length) desc = desc.substr(0, opts.desc_max_length)+' ...';
    			var url = ('undefined'!=typeof(opts.data[j].version['http://simile.mit.edu/2003/10/ontologies/artstor#url'])) ? opts.data[j].version['http://simile.mit.edu/2003/10/ontologies/artstor#url'][0].value : null;
    			var filename = (url) ? basename(url) : basename(opts.data[j].uri);
	    		if (filename.length > opts.filename_max_length) filename = filename.substr(0, opts.filename_max_length)+'...';
    			var thumb = ('undefined'!=typeof(opts.data[j].content['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'])) ? opts.data[j].content['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'][0].value : null;
    			$tr.append('<td valign="top">'+((thumb)?'<img class="thumb" src="'+thumb+'" />':'')+'</td>');
    			$tr.append('<td valign="top">'+title+'</td>');
    			$tr.append('<td valign="top">'+((desc)?desc:'')+'</td>');
    			$tr.append('<td valign="top">'+filename+'</td>');
    			$tr.append('<td valign="top"><a target="_blank" class="generic_button" href="'+((url)?url:opts.data[j].uri)+'">'+((url)?'Preview':'Visit')+'</a></td>');
    		}
    		$('.thumb').parent().mouseover(function() {
    			var $this = $(this).children('.thumb:first');
    			var offset = $this.offset();
    			var $div = $('<div class="tt"></div>');
    			$div.css('left', parseInt(offset.left) + parseInt($this.outerWidth()) + 10);
    			$div.css('top', offset.top);
    			$('<img src="'+$this.attr('src')+'" />').appendTo($div);
    			$div.appendTo('body');
    			$this.parent().mouseout(function() {
    				$div.remove();
    			});
    		});
    	};
    	var go = function() {
    		opts.data = [];
    		$this.find('.content').html('<div class="loading">Loading ...</a>');
	    	$.getJSON(url(), function(){}).always(function(_data) {
	    		if ('undefined'!=typeof(_data.status)) {
	    			alert('There was a problem trying to get a list of content: '+_data.status+' '+_data.statusText+'. Please try again.');
	    			return;
	    		}
	    		var has_rec = false;
	    		for (var uri in _data) {
	    			if ('http://www.openannotation.org/ns/Annotation'==_data[uri]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][0].value) {
	    				has_rec = true;
	    				continue;
	    			}
	    			if ('undefined'!=typeof(_data[uri]['http://purl.org/dc/terms/hasVersion'])) {
	    				var item = {};
	    				item.uri = uri;
	    				item.content = _data[uri];
	    				item.version = _data[ _data[uri]['http://purl.org/dc/terms/hasVersion'][0].value ];
	    				opts.data.push(item);
	    			}
	    		}
	    		if (has_rec) {
	    			// TODO: filter
	    		}
	    		propagate();
	    	});
    	};
    	init();
    	if (opts.type) go();
    };
}( jQuery ));