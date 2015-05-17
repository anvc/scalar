(function( $ ) {
	
	var defaults = {
			data: null,
			default_value: null,
			no_prefix: 'no_',
			approot: $('link#approot').attr('href')
	};  	
	
    $.fn.select_view = function(options) {
    	
    	// Options
    	var self = this;
    	var $this = $(this);
    	var opts = $.extend( {}, defaults, options );
    	opts.default_values = opts.default_value.split(',');  
    	opts.values = [];  // Values set previously
    	for (var key in opts.default_values) {
    		if (opts.no_prefix==opts.default_values[key].substr(0,3) || !opts.default_values[key].length) continue;
    		opts.values.push(opts.default_values[key]);
    	}

    	var array_remove = function(arr) {  // http://stackoverflow.com/questions/3954438/remove-item-from-array-by-value
    	    var what, a = arguments, L = a.length, ax;
    	    while (L > 1 && arr.length) {
    	        what = a[--L];
    	        while ((ax= arr.indexOf(what)) !== -1) {
    	            arr.splice(ax, 1);
    	        }
    	    }
    	    return arr;
    	}    	
    	
    	var get_component_key = function(_view_key) {
    		for (var key in opts.data) {
    			for (var component_key in opts.data[key].components) {
	    			for (var view_key in opts.data[key].components[component_key].views) {
	    				if (_view_key == view_key) return component_key;
	    			}
    			}
    		}
    		return false;
    	}
    	
    	var display_components = function() {
    		// Remove name field from all
    		$this.find('.components').hide();
    		$this.find('select.component').attr('name','');
    		// Add name field and other things to selected components
    		var selected = $select.val();
    		$comp = $this.find('#'+selected+'_components');
    		$comp.find('.'+selected+'_component').children().css('padding','3px 16px 3px 0px').css('vertical-align','middle');
    		$comp.find('select').attr('name','scalar:default_view');
    		$comp.show();
    		// Make the select's all the same width
    		var max_width = Math.max.apply( null, $comp.find('select').map( function () {return $( this ).outerWidth( true );}).get() );
    		$comp.find('select').width(max_width);
    		set_descriptions();
    	};
    	
    	var set_descriptions = function() {
    		$this.find('select').each(function() {
    			var $this = $(this);
    			$this.blur();
    			var desc = $this.find(':selected').data('desc');
    			var img_path = $this.find(':selected').data('img');
    			var img = (img_path.length)? '<img src="'+opts.approot+img_path+'" align="left" style="margin-right:10px;width:100px;" />' : '';
    			$this.parent().siblings('.select_desc, .component_desc').html(img+desc);
    		});
    	};    	
    	
    	var add_another = function(el) {
    		var $el = $(el);
			var $cloned = $el.closest('div').clone(true, true);
			$cloned.find('span:first, .addanother').empty();
			$cloned.insertAfter($el.closest('div'));   		
    	};
    	
    	var duplicate = function(component_key, value) {
    		var $component = $('.'+component_key+':last');
    		var $cloned = $component.clone(true, true);
    		$cloned.find('span:first, .addanother').empty();
    		$cloned.insertAfter($component);
    		$cloned.find('select:first').val(value);
    	};
    	
    	// View pulldown
    	var $select_wrapper = $('<div><select name="scalar:default_view" class="btn btn-default generic_button large" style="text-align:left;"></select></div>').appendTo($this);
    	var $select = $select_wrapper.find('select:first');
    	$('<div class="select_desc" style="margin-top:10px;"></div>').insertAfter($select_wrapper);
    	$select.hide();
    	for (var key in opts.data) {
    		// Validate
    		var value = opts.data[key];
    		if (jQuery.isEmptyObject(value) && !value.length) continue;
    		if ('string'==typeof(value)) value = {name:value};
    		// Add base select
    		if (value.name.length) $select.show();
    		var $option = $('<option value="'+key+'"'+((-1!=opts.default_values.indexOf(key))?' SELECTED':'')+'>'+((value.name.length)?value.name:'(No name)')+'</option>').appendTo($select);
    		$option.data('desc', ('undefined'!=typeof(value.description))?value.description:'');
    		$option.data('img', ('undefined'!=typeof(value.image))?value.image:'');
    		// Component pulldowns
    		var $components = $('<div style="display:table;" id="'+key+'_components" class="components"></div>').appendTo($this);
    		if (!jQuery.isEmptyObject(value.components)) {
    			for (var component_key in value.components) {
    				$component_wrapper = $('<div style="display:table-row;" class="'+key+'_component '+component_key+'"></div>').appendTo($components);
    				$component_wrapper.append('<span style="display:table-cell;white-space:nowrap;">'+value.components[component_key].name+'</span>');
    				var $component_select_wrapper = $('<span style="display:table-cell;white-space:nowrap;"><select name="" class="component generic_button large"></select></span>').appendTo($component_wrapper);
    				if (value.components[component_key].multi) {
    					$addanother = $('<span class="addanother"><a href="javascript:void(null);" style="font-weight:bold;font-size:bigger;text-decoration:none;"> + </a></span>').appendTo($component_select_wrapper);
    					$addanother.click(function() { add_another(this); });
    				}
    				$component_wrapper.append('<span style="display:table-cell;" class="component_desc"></span>');
    				$component_select = $component_wrapper.find('select:first');
    				for (var view_key in value.components[component_key].views) {
    					if (!$component_select.data('selected') && -1!=opts.default_values.indexOf(view_key)) {
    						$component_select.data('selected', view_key);
    						opts.values = array_remove(opts.values, view_key);
    					}
    					var $component_option = $('<option value="'+view_key+'"'+(($component_select.data('selected')==view_key)?' SELECTED':'')+'>'+value.components[component_key].views[view_key].name+'</option>').appendTo($component_select);
    					$component_option.data('desc', value.components[component_key].views[view_key].description);
    				}
    			}
    		}
    		$components.find('select').change(function() { set_descriptions(); });
    	}
    	
    	// Add additional component pulldowns based on extra saved values
    	for (var key in opts.values) {
    		var value = opts.values[key];
    		var component_key = get_component_key(value);
    		if (!component_key) continue;
    		duplicate(component_key, value);
    	}
    	
    	display_components();
    	$select.change(function() { display_components(); });

    };
    
}( jQuery ));