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
 * http://www.osedu.org/licenses/ECL-2.0 
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.       
 */  

/**
 * @projectDescription  Draw table of nodes
 * @author              Craig Dietrich
 * @version             1.0
 * @required			Instantiated scalarapi obj (default: window['scalarapi'])
 */ 

if ('undefined'==typeof(escape_html)) {
	function escape_html(unsafe) {
	    return unsafe
	         .replace(/&/g, "&amp;")
	         .replace(/</g, "&lt;")
	         .replace(/>/g, "&gt;")
	         .replace(/"/g, "&quot;")
	         .replace(/'/g, "&#039;");
	 }
}

(function($) {

    var defaults = {
    		scalarapi: null,
    		error_el: '#error',
    		results_el: '#results',
    		loading_el: '#loading',
      };
    
	var scalardashboardtable_methods = {
			
		init : function(options) {
		
			options = $.extend(defaults, options);	
			$(options.results_el).hide();
			$(window).resize(function() { $.fn.scalarimport('resize_results', options); });
		
			// Required scalarapi obj
			if (null===options.scalarapi) {
				if ('undefined'==typeof(window['scalarapi'])) {
					$.fn.scalarimport('error', 'init function could not find required Scalar API object (window[\'scalarapi\']), please try again', options);
					return;
				}
				options.scalarapi = window['scalarapi'];
			}
			
			return this.each(function() {
				
				try {

				} catch(err) {
					$.fn.scalardashboardtable('error', err, options);
				}
				
			});	
			 
		},
		
		error : function(err, options) {
			
			$('<div><p>'+err+'</p></div>').addClass('error').appendTo(options.error_el);
			
		},
		
		// http://phpjs.org/functions/htmlspecialchars/
		htmlspecialchars : function (string, quote_style, charset, double_encode) {

			  var optTemp = 0,
			    i = 0,
			    noquotes = false;
			  if (typeof quote_style === 'undefined' || quote_style === null) {
			    quote_style = 2;
			  }
			  string = string.toString();
			  if (double_encode !== false) { // Put this first to avoid double-encoding
			    string = string.replace(/&/g, '&amp;');
			  }
			  string = string.replace(/</g, '&lt;')
			    .replace(/>/g, '&gt;');

			  var OPTS = {
			    'ENT_NOQUOTES': 0,
			    'ENT_HTML_QUOTE_SINGLE': 1,
			    'ENT_HTML_QUOTE_DOUBLE': 2,
			    'ENT_COMPAT': 2,
			    'ENT_QUOTES': 3,
			    'ENT_IGNORE': 4
			  };
			  if (quote_style === 0) {
			    noquotes = true;
			  }
			  if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
			    quote_style = [].concat(quote_style);
			    for (i = 0; i < quote_style.length; i++) {
			      // Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
			      if (OPTS[quote_style[i]] === 0) {
			        noquotes = true;
			      } else if (OPTS[quote_style[i]]) {
			        optTemp = optTemp | OPTS[quote_style[i]];
			      }
			    }
			    quote_style = optTemp;
			  }
			  if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
			    string = string.replace(/'/g, '&#039;');
			  }
			  if (!noquotes) {
			    string = string.replace(/"/g, '&quot;');
			  }

			  return string;
		}
		
	};

	$.fn.scalardashboardtable = function(methodOrOptions) {		

		if ( scalardashboardtable_methods[methodOrOptions] ) {
			return scalardashboardtable_methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
			// Default to "init"
			return scalardashboardtable_methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  methodOrOptions + ' does not exist.' );
		}    
		
	};
	
})(jQuery);