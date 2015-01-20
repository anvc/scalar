(function( $ ) {
	
	var defaults = {
			data: null,
			default_value: null
	};  	
	
    $.fn.select_view = function(options) {
    	
    	// Options
    	var self = this;
    	var $this = $(this);
    	var opts = $.extend( {}, defaults, options );

    	// View pulldown
    	var $select = $('<select name="scalar:default_view" class="generic_button large"></select>').appendTo($this);
    	$select.hide();
    	for (var key in opts.data) {
    		// Validate
    		var value = opts.data[key];
    		if (jQuery.isEmptyObject(value) && !value.length) continue;
    		if ('string'==typeof(value)) value = {name:value};
    		console.log(value);
    		// Add base select
    		if (value.name.length) $select.show();
    		$select.append('<option value="'+key+'"'+((key==opts.default_value)?' SELECTED':'')+'>'+((value.name.length)?value.name:'(No name)')+'</option>');
    		// Component pulldowns
    		var $components = $('<div style="display:table;" id="'+key+'_components" class="components"></div>').appendTo($this);
    		if (!jQuery.isEmptyObject(value.components)) {
    			for (var component_key in value.components) {
    				$component_wrapper = $('<div style="display:table-row;" class="'+key+'_component"></div>').appendTo($components);
    				$component_wrapper.append('<span style="display:table-cell;white-space:nowrap;">'+value.components[component_key].name+'</span>');
    				var $component_select_wrapper = $('<span style="display:table-cell;white-space:nowrap;"><select name="" class="component generic_button large"></select></span>').appendTo($component_wrapper);
    				if (value.components[component_key].multi) {
    					$addanother = $('<span class="addanother"><a href="javascript:void(null);" style="font-weight:bold;font-size:bigger;text-decoration:none;"> + </a></span>').appendTo($component_select_wrapper);
    					$addanother.click(function() {
    						var $cloned = $(this).closest('div').clone(true,true);
    						$cloned.find('span:first, .addanother').empty();
    						$cloned.insertAfter($(this).closest('div'));
    					});
    				}
    				$component_wrapper.append('<span style="display:table-cell;" class="component_desc"></span>');
    				$component_select = $component_wrapper.find('select:first');
    				for (var view_key in value.components[component_key].views) {
    					var $option = $('<option value="'+view_key+'"'+((view_key==opts.default_value)?' SELECTED':'')+'>'+value.components[component_key].views[view_key].name+'</option>').appendTo($component_select);
    					$option.data('desc', value.components[component_key].views[view_key].description);
    				}
    			}
    		}
    		$components.find('select').change(function() {
    			set_descriptions();
    		});
    	}
    	
    	var display_components = function() {
    		// Remove name field from all
    		$this.find('.components').hide();
    		$this.find('select.component').attr('name','');
    		// Add values and other things to selected components
    		var selected = $select.val();
    		$comp = $this.find('#'+selected+'_components');
    		$comp.find('.'+selected+'_component').children().css('padding','3px 16px 3px 0px').css('vertical-align','middle');
    		$comp.find('select').attr('name','scalar:default_view');
    		$comp.show();
    		// Make the select's all the same width
    		var max_width = Math.max.apply( null, $comp.find('select').map( function () {return $( this ).outerWidth( true );}).get() );
    		$comp.find('select').width(max_width);
    		set_descriptions();
    	}
    	
    	var set_descriptions = function() {
    		$('.components').each(function() {
    			$(this).find('select').each(function() {
    				var desc = $(this).find(':selected').data('desc');
    				$(this).parent().siblings('.component_desc').html(desc);
    			});
    		});
    	}
    	
    	display_components();
    	$select.change(function() {
    		display_components();
    	});

    };
    
}( jQuery ));