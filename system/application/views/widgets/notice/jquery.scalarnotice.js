/**
 * Scalar    
 * Copyright 2013 The Alliance for Networking Visual Culture.
 * http://scalar.usc.edu/scalar
 * Alliance4NVC@gmail.com
 *
 * Licensed under the Educational Community License, Version 2.0 
 * (the "License"); you may not use this file except in compliance 
 * with the License. You may obtain a copy of the License at
 * 
 * http://www.osedu.org/licenses /ECL-2.0 
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.       
 */  

/**
 * @projectDescription  Draw and popup alert on the page
 * @author              Craig Dietrich
 * @version             1.0
 */

(function($) {

	var scalarnotice_methods = {
	
		init : function() {
			 
			return this.each(function() {
	
				var $node = $(this);
				
				if ($.fn.scalarnotice('check_hide_cookie', $node)) return;
				
				var $close = $('<span class="close_link"><a alt="Close" href="javascript:void(null);">&nbsp;</a></span>').appendTo($node);
				$close.find('a').click(function() {
					$.fn.scalarnotice('set_hide_cookie', $node);
					$(this).parent().parent().remove();
				});
			
				$node.css({
							display: 'none',
				    		top: "10px",
				    		left: "10px",
				    		right: "20px",
				    		position: "fixed",
				    		zIndex: 9,
				    		padding: "10px 11px 10px 16px",
				    		backgroundColor: "#ceffc8",
				    		border: "solid 1px #ccc"
				         });

				$node.slideDown();
				
			});	
			 
		},
		check_hide_cookie : function($node) {
			var cookie_name = $node.data('cookie');
			var is_hidden = ('1'==$.cookie(cookie_name)) ? true : false;	
			return is_hidden;
		},
		set_hide_cookie : function($node) {
			var cookie_name = $node.data('cookie');
			$.cookie(cookie_name, '1');
			if (!$.fn.scalarnotice('check_hide_cookie', $node)) {
				alert('Please enable cookies in your browser to keep the alert message hidden while browsing from page to page.');
			}
		}
		
	};

	$.fn.scalarnotice = function(methodOrOptions) {		

		if ( scalarnotice_methods[methodOrOptions] ) {
			return scalarnotice_methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
			// Default to "init"
			return scalarnotice_methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  methodOrOptions + ' does not exist.' );
		}    
		
	};
	
})(jQuery);
