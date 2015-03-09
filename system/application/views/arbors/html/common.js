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

function validate_upload_form_file($form) {

	// Make sure title is present
	var title = $form.find('input[name="dcterms:title"]').val();
	if (title.length==0) {
		alert('Title is a required field.  Please enter a title at the top of the form.');
		return false;
	}
	
	// Make sure file is present
	var slug = $form.find('input[name="source_file"]').val();
	if (slug.length==0) {
		alert('Please choose a file to upload.');
		return false;
	}		
	
	send_form_show_loading();
	
	// Save using standard POST to the system, then route to the save API for creating the page
	$form.find('#hidden_upload').load(function() {
		validate_upload_form_file_return($form);
	});
	
	return true;
	
}

function validate_upload_form_file_return($form) {

	var iframe = $form.find('iframe:first')[0];
	var content = iframe.contentWindow.document.getElementsByTagName("body")[0].innerHTML;
	var obj = jQuery.parseJSON(content);
	console.log(obj);
	if ('undefined'!=typeof(obj.error) && obj.error.length) {
		$(iframe).unbind();
		$(iframe).attr('src', '');
		send_form_hide_loading();
		alert('There was an error saving the file: '+obj.error);
		return;
	}
	
	validate_upload_form($form, obj);

}

function validate_upload_form($form, obj) {
	
	for (var url in obj) break;
	var metadata = obj[url];

	// Make sure title is present
	var title = $form.find('input[name="dcterms:title"]').val();
	if (title.length==0) {
		send_form_hide_loading();
		alert('Title is a required field.  Please enter a title at the top of the form.');
		return false;
	}
	
	// Make sure URL is present
	if ('undefined'==typeof(url) || url.length==0) {
		send_form_hide_loading();
		alert('Could not resolve the file URL for creating the new page.');
		return false;
	}	
	
	var values = {};
	values['scalar:url'] = url;
	if (!jQuery.isEmptyObject(metadata)) $.extend( values, metadata );
	
	// Construct slug (if applicable)
	var name_policy = $form.find('input[name="name_policy"]:checked').val();
	if ('filename' == name_policy) {
		var slug = url;
		if (slug.indexOf('.')!=-1) slug = slug.substr(0, slug.lastIndexOf('.'));
		values['scalar:slug'] = slug;
	} else if ('title' == name_policy) {
		var slug_prepend = $form.find('input[name="slug_prepend"]:checked').val();
		var slug = (slug_prepend.length) ? slug_prepend+'/' : '';
		slug += title;
		values['scalar:slug'] = slug;		
	}

	// Set scalar:urn if 'replace' is present (e.g., update vs add)
	if ($form.find('select[name="replace"] option:selected').val().length) {
		$form.find('input[name="scalar:urn"]').val( $form.find('select[name="replace"] option:selected').val() );
		$form.find('input[name="action"]').val('update');
	}

	return send_form($form, values);

}

/**
 * Functions to send form information through Scalar's save API
 */

function send_form($form, additional_values, redirect_url) {

	send_form_show_loading();

	var values = {};
	$.each($form.serializeArray(), function(i, field) {
		if ('undefined'!=typeof(values[field.name])) {
			if (!is_array(values[field.name])) {
				values[field.name] = [values[field.name]];
			}
			values[field.name].push(field.value);
		} else {
			values[field.name] = field.value;
		}
	});	
	
	if ('undefined'!=typeof(additional_values)) {
		for (var field in additional_values) {
			if ('undefined'!=typeof(values[field.name])) {
				if (!is_array(values[field.name])) {
					values[field.name] = [values[field.name]];
				}
				values[field].push(additional_values[field]);
			} else {
				values[field] = additional_values[field];
			}	
		}
	}

	var success = function(version) {
	    for (var version_uri in version) break;
	    if ('undefined'==typeof(redirect_url)) redirect_url = version_uri.substr(0, version_uri.lastIndexOf('.'));
	    var version_urn = version[version_uri]['http://scalar.usc.edu/2012/01/scalar-ns#urn'][0].value;
		send_form_relationships($form, version_urn, redirect_url);     
	}
	
	var error = function(obj) {
		alert('Something went wrong while attempting to save: '+obj.statusText);
		send_form_hide_loading();
	}

	scalarapi.savePage(values, success, error);
	return false;

}

function send_form_relationships($form, version_urn, redirect_url) {		
	
	var values = {};
	// The version just saved
	values['scalar:urn'] = version_urn;
	// Validation params
	values['action'] = 'relate';
	values['native'] = $('input[name="native"]').val();
	values['id'] = $('input[name="id"]').val();
	values['api_key'] = '';
	
	// Container of 
	values['container_of'] = $('input[name="container_of"]');
	// Reply of
	values['reply_of'] = $('input[name="reply_of"]');
	values['reply_of_paragraph_num'] = $('input[name="reply_of_paragraph_num"]');
	// Annotation of
	values['annotation_of'] = $('input[name="annotation_of"]');
	values['annotation_of_start_seconds'] = $('input[name="annotation_of_start_seconds"]');
	values['annotation_of_end_seconds'] = $('input[name="annotation_of_end_seconds"]');
	values['annotation_of_start_line_num'] = $('input[name="annotation_of_start_line_num"]');
	values['annotation_of_end_line_num'] = $('input[name="annotation_of_end_line_num"]');
	values['annotation_of_points'] = $('input[name="annotation_of_points"]');
	// Tag of
	values['tag_of'] = $('input[name="tag_of"]');
	// Reference of
	values['references'] = [];
	var textarea = $('textarea[name="sioc:content"]').val();
	var $temp = $('<div>'+textarea+'</div>');
	$temp.find('a').each(function() {
		var resource = $(this).attr('resource');
		if ('undefined'==typeof(resource)) return;
		values['references'].push($('<input value="'+resource+'" />'));
		// TODO: reference_text
	});
	
	// Has container
	values['has_container'] = $('input[name="has_container"]');
	values['has_container_sort_number'] = $('input[name="has_container_sort_number"]');
	// Has reply
	values['has_reply'] = $('input[name="has_reply"]');
	values['has_reply_paragraph_num'] = $('input[name="has_reply_paragraph_num"]');	
	values['has_reply_datetime'] = $('input[name="has_reply_datetime"]');	
	// Has Annotation
	values['has_annotation'] = $('input[name="has_annotation"]');
	values['has_annotation_start_seconds'] = $('input[name="has_annotation_start_seconds"]');
	values['has_annotation_end_seconds'] = $('input[name="has_annotation_end_seconds"]');
	values['has_annotation_start_line_num'] = $('input[name="has_annotation_start_line_num"]');
	values['has_annotation_end_line_num'] = $('input[name="has_annotation_end_line_num"]');
	values['has_annotation_points'] = $('input[name="has_annotation_points"]');	
	// Has Tag
	values['has_tag'] = $('input[name="has_tag"]');	
	// Has reference
	values['has_reference'] = $('input[name="has_reference"]');	
	values['has_reference_reference_text'] = $('input[name="has_reference_reference_text"]');		
	
	// Save relationships
	var success = function() {
		document.location.href=redirect_url + '?t=' + (new Date).getTime();
	} 
	scalarapi.saveManyRelations(values, success);   	

}

function send_form_show_loading() {

    $('input[type="submit"]').attr("disabled", "disabled");

	if (window['Spinner']) {
		var opts = {
		  lines: 13, // The number of lines to draw
		  length: 5, // The length of each line
		  width: 2, // The line thickness
		  radius: 6, // The radius of the inner circle
		  rotate: 0, // The rotation offset
		  color: '#000', // #rgb or #rrggbb
		  speed: 1, // Rounds per second
		  trail: 60, // Afterglow percentage
		  shadow: false, // Whether to render a shadow
		  hwaccel: false, // Whether to use hardware acceleration
		  className: 'spinner', // The CSS class to assign to the spinner
		  zIndex: 2e9, // The z-index (defaults to 2000000000)
		  top: 'auto', // Top position relative to parent in px
		  right: 'auto' // Left position relative to parent in px
		};
		var target = document.getElementById('spinner_wrapper');
		var spinner = new Spinner(opts).spin(target);
	}

}

function send_form_hide_loading() {

	$('input[type="submit"]').removeAttr("disabled");
	
	if (window['Spinner']) {
		$('.spinner').remove();
	}

}

function strip_tags (input, allowed) {
	allowed = (((allowed || "") + "")
			.toLowerCase()
			.match(/<[a-z][a-z0-9]*>/g) || [])
			.join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
		commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
 	return input.replace(commentsAndPhpTags, '').replace(tags, function($0, $1){
 		return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
	});
}

// http://stackoverflow.com/questions/2883697/in-javascript-how-to-find-element-is-array
function is_array(input){
  return typeof(input)=='object'&&(input instanceof Array);
}

function isIOS() {
	var deviceAgent = navigator.userAgent.toLowerCase();
	var agentID = deviceAgent.match(/(iphone|ipod|ipad)/);
	if (agentID) return true;
	return false;
}

function isIPhone(){
	var deviceAgent = navigator.userAgent.toLowerCase();
	var agentID = deviceAgent.match(/(iphone|ipod)/);
	if (agentID) return true;
	return false;
}

function basename(path) {
	if ('undefined'==typeof(path) || !path.length) return '';
    return path.replace(/\\/g,'/').replace( /.*\//, '' );
}
 
function dirname(path) {
	if ('undefined'==typeof(path) || !path.length) return '';
    return path.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');;
}

// http://phpjs.org/functions/wordwrap
function wordwrap (str, int_width, str_break, cut) {
    var m = ((arguments.length >= 2) ? arguments[1] : 75   );
    var b = ((arguments.length >= 3) ? arguments[2] : "\n" );
    var c = ((arguments.length >= 4) ? arguments[3] : false);
    var i, j, l, s, r;
    str += '';
    if (m < 1) {
        return str;
    }
    for (i = -1, l = (r = str.split(/\r\n|\n|\r/)).length; ++i < l; r[i] += s) {
        for (s = r[i], r[i] = ""; s.length > m; r[i] += s.slice(0, j) + ((s = s.slice(j)).length ? b : "")){
            j = c == 2 || (j = s.slice(0, m + 1).match(/\S*(\s)?$/))[1] ? m : j.input.length - j[0].length || c == 1 && m || j.input.length + (j = s.slice(m).match(/^\S*/)).input.length;
        }
    }
    return r.join("\n");
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }

    return vars;
}

// http://phpjs.org/functions/in_array
function in_array (needle, haystack, argStrict) {
    var key = '', strict = !!argStrict;
 
    if (strict) {
        for (key in haystack) {
            if (haystack[key] === needle) {
                return true;
            }
        }
    } else {
        for (key in haystack) {
            if (haystack[key] == needle) {
                return true;
            }
        }
    }
    return false;
}

function get_url_extension() {
	if (-1==document.location.href.indexOf('.')) return '';
	if (-1==document.location.href.indexOf('/')) return '';
	var ending_segment = document.location.href.substr(document.location.href.lastIndexOf('/')+1);
	if (-1==ending_segment.indexOf('.')) return '';
	var segment = ending_segment.substr(ending_segment.lastIndexOf('.')+1);
	if (-1!=segment.indexOf('?')) segment = segment.substr(0, segment.indexOf('?'));
	if (-1!=segment.indexOf('#')) segment = segment.substr(0, segment.indexOf('#'));
	return (is_numeric(segment)) ? '' : segment;
}

function get_str(remove_arr) {

	if (document.location.href.indexOf('?')==-1) return '';
	if ('undefined'==typeof(remove_arr)) remove_arr = new Array;
	var varstr = '';
	var getvars = getUrlVars();
	var count = 1;
	for (var field in getvars) {
		if (is_numeric(field)) continue;
		var value = getvars[field];
		if (in_array(field, remove_arr)) continue;
		varstr += field+'='+encodeURIComponent(value);
		varstr += '&';
	}
	if ('&'==varstr.substr(varstr.length-1)) varstr = varstr.substr(0, varstr.length-1);
	return varstr;

}

// http://stackoverflow.com/questions/11920697/how-to-get-hash-value-in-a-url-in-js
function getHashValue(key) {
	return location.hash.match(new RegExp(key+'=([^&]*)'))[1];
}

// http://phpjs.org/functions/htmlspecialchars
function htmlspecialchars (string, quote_style, charset, double_encode) {
	if (!string || string.length===0) return string;
    var optTemp = 0, i = 0, noquotes= false;
    if (typeof quote_style === 'undefined' || quote_style === null) {
        quote_style = 2;
    }
    string = string.toString();
    if (double_encode !== false) { // Put this first to avoid double-encoding
        string = string.replace(/&/g, '&amp;');
    }
    string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');
 
    var OPTS = {
        'ENT_NOQUOTES': 0,
        'ENT_HTML_QUOTE_SINGLE' : 1,
        'ENT_HTML_QUOTE_DOUBLE' : 2,
        'ENT_COMPAT': 2,
        'ENT_QUOTES': 3,
        'ENT_IGNORE' : 4
    };
    if (quote_style === 0) {
        noquotes = true;
    }
    if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
        quote_style = [].concat(quote_style);
        for (i=0; i < quote_style.length; i++) {
            // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
            if (OPTS[quote_style[i]] === 0) {
                noquotes = true;
            }
            else if (OPTS[quote_style[i]]) {
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

function create_excerpt(str, num_words) {

	if (!str || !str.length) return str;
	var str = strip_tags(str);
	var arr = str.split(' ');
	if (arr.length <= num_words) return str;
	str = arr.slice(0,num_words).join(' ')+' ...';
	return str;

}

function strip_tags (input, allowed) {
	allowed = (((allowed || "") + "")
			.toLowerCase()
			.match(/<[a-z][a-z0-9]*>/g) || [])
			.join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
		commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
 	return input.replace(commentsAndPhpTags, '').replace(tags, function($0, $1){
 		return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
	});
}

function ucwords(str) {
    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
        return $1.toUpperCase();
    });
}

// Convert numbers to words
// copyright 25th July 2006, by Stephen Chapman http://javascript.about.com
// permission to use this Javascript on your web page is granted
// provided that all of the code (including this copyright notice) is
// used exactly as shown (you can change the numbering system if you wish)
// http://javascript.about.com/library/bltoword.htm
// American Numbering System
var th = ['','thousand','million', 'billion','trillion'];
// uncomment this line for English Number System
// var th = ['','thousand','million', 'milliard','billion'];
var dg = ['zero','one','two','three','four', 'five','six','seven','eight','nine']; var tn = ['ten','eleven','twelve','thirteen', 'fourteen','fifteen','sixteen', 'seventeen','eighteen','nineteen']; var tw = ['twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety']; 
function toWords(s){s = s.toString(); s = s.replace(/[\, ]/g,''); if (s != parseFloat(s)) return 'not a number'; var x = s.indexOf('.'); if (x == -1) x = s.length; if (x > 15) return 'too big'; var n = s.split(''); var str = ''; var sk = 0; for (var i=0; i < x; i++) {if ((x-i)%3==2) {if (n[i] == '1') {str += tn[Number(n[i+1])] + ' '; i++; sk=1;} else if (n[i]!=0) {str += tw[n[i]-2] + ' ';sk=1;}} else if (n[i]!=0) {str += dg[n[i]] +' '; if ((x-i)%3==0) str += 'hundred ';sk=1;} if ((x-i)%3==1) {if (sk) str += th[(x-i-1)/3] + ' ';sk=0;}} if (x != s.length) {var y = s.length; str += 'point '; for (var i=x+1; i<y; i++) str += dg[n[i]] +' ';} return str.replace(/\s+/g,' ');}

// http://phpjs.org/functions/is_numeric:449
function is_numeric (mixed_var) {
    return (typeof(mixed_var) === 'number' || typeof(mixed_var) === 'string') && mixed_var !== '' && !isNaN(mixed_var);
}
	