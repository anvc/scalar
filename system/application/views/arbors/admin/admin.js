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
 * Save a row based on metadata kept in the HTML <tr> and <td> tags
 * Bloated over the years but gets the job done
 */

function edit_row($row) {

	if (!$row.data('mode') || 'read'==$row.data('mode')) {

		$row.data('mode', 'edit');
		$row.find('.editable').each(function(){
			var $this = $(this);
			var value = $this.html();
			if ('password'==$this.attr('property')) value='';
			if ($this.hasClass('has_link')) value = $this.find('a:first').html();
			if ($this.hasClass('excerpt')) value = $this.find("span[class='full']").html();
			var input_type = 'text';
			if ($this.hasClass('textarea')) input_type = 'textarea';
			if ($this.hasClass('boolean')) input_type='boolean';
			if ($this.hasClass('sortable')) input_type='sortable';
			if ($this.hasClass('number')) input_type='number';
			if ($this.hasClass('enum')) {
				var class_str = $this.attr('class');
				var begin = class_str.indexOf('{');
				var end = class_str.lastIndexOf('}');
				var enum_values = class_str.substr((begin+1), (end-begin-1));
				var enum_arr = enum_values.split(',');
				var values = [''];  
				for (var j = 0; j < enum_arr.length; j++) {
					var the_value = enum_arr[j];
					if (the_value.substr(0,1)=="'") the_value = the_value.substr(1);
					if (the_value.substr( (the_value.length-1) ,1)=="'") the_value = the_value.substr(0, (the_value.length-1));
					if (the_value.substr(0,1)=='"') the_value = the_value.substr(1);
					if (the_value.substr( (the_value.length-1) ,1)=='"') the_value = the_value.substr(0, (the_value.length-1));					
					values.push(the_value);
				}
				input_type='enum';
				input_values=values;
			}
			if (input_type == 'text') {
				$this.html('<input type="text" style="width:100%;" value="'+htmlspecialchars(value)+'" />');
			} else if (input_type == 'textarea') {
				$this.html('<textarea style="width:100%;height:75px;">'+value+'</textarea>');
			} else if (input_type == 'boolean') {
				$this.html('<select><option value="1"'+((parseInt(value))?' selected':'')+'>Yes</option><option value="0"'+((!parseInt(value))?' selected':'')+'>No</option></select');
			} else if (input_type == 'number') {
				$this.html('<input type="text" style="width:35px;" value="'+htmlspecialchars(value)+'" />');
			} else if (input_type == 'sortable') {
				$this.find('ol').sortable();
				$this.find('.edit_msg').show();
				$this.find('li').each(function() {
					var $li = $(this);
					var title = $li.attr('title');
					if (!title || !title.length) return;
					$li.prepend('<input type="hidden" value="'+title+'" />');
					var $remove_link = $('<a href="javascript:;" onclick=""><small>remove</small></a>');;
					$li.append('&nbsp;');
					$li.append($remove_link);
					$remove_link.click(function() {
						var $link = $(this);
						$link.parent().find('input:first').val(0);
						$link.parent().css('color','#aaaaaa');
						$link.parent().find('a:last').remove();
					});
				});
			} else if (input_type == 'enum') {
				var $select = $('<select style="width:100%;"></select>');
				var default_str = $this.html().toLowerCase();
				for (var j = 0; j < input_values.length; j++) {
					$select.append('<option value="'+input_values[j]+'" '+((default_str==input_values[j].toLowerCase())?'selected':'')+'>'+input_values[j]+'</option>');
				}
				$this.html($select);
			}
		});
		$row.find('a:first').html('Save');
		$row.find('a:first').addClass('default');
		$row.find('a:first').blur();
		
	} else {
	
		var urlroot = $('link#urlroot').attr('href');
		var section = $row.attr('typeof');
		var id = $row.find("td[property='id']").html();
		if ($row.find("td[property='book_id']").length) {
			var book_id = parseInt($row.find("td[property='book_id']").html());
		} else {
			var book_id = getUrlVars()['book_id'];
		}
		var post = {'section':section, 'id':id, 'book_id':book_id};

		$row.find('.editable').each(function(){
			var $this = $(this);
			var property = $this.attr('property');
			var value = '';
			if ($this.hasClass('textarea')) {
			 	value = $this.find('textarea').val();
			} else if ($this.hasClass('boolean') || $this.hasClass('enum')) {
				value = $this.find('select').val();
			} else if ($this.hasClass('sortable')) {
				$this.find('.edit_msg').hide();
				var $lis = $this.find('li');
				var value_array = new Array;
				var count = 1;
				for (var j = 0; j < $lis.length; j++) {
					var $li = $($lis[j]);
					var val = $li.find('input:first').val();
					var title = parseInt($li.attr('title'));
					if (!title) continue;
					value += title+':'+((val==0)?0:count)+',';
					if (val>0) count++;
					$li.find('a:last').remove(); // remove link
					if (0==val) $li.remove();
				}
			} else {
				value = $this.find('input').val();
			}
			post[property] = value;
		});		

		$.post('api/save_row', post, function(data) {
		
			try {
				var _data = eval("("+data+")");
				var error = _data['error'];
				if (error.length) {
					alert('Error: '+error);
					return;
				}
			} catch(e) {}

			if ('undefined'==typeof(data['is_live']) || parseInt(data['is_live'])) {
				$row.removeClass('not_live');
			} else {
				$row.addClass('not_live');
			}
			
			$row.find('.editable').each(function(){
				var $this = $(this);
				var property = $this.attr('property');
				if (property == 'password' && 'undefined'!=typeof(data['password_is_null'])) {
					value = (data['password_is_null']==true) ? '' : '&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;';
				} else if ('undefined'==typeof(data[property])) {
					return;
				} else {
					value = data[property];
				}
				if ($this.hasClass('uri_link') && 'undefined'!=typeof(window['book_uri'])) {
					value = '<a href="'+window['book_uri']+data['slug']+'">'+value+'</a>';
				} else if ($this.hasClass('has_link')) {
					value = '<a href="javascript:void(null);" onclick="alert(\'Please refresh to follow this link\');">'+value+'</a>';
				}
				if ($this.hasClass('excerpt')) value = '<span class="full">'+value+'</span><span class="clip">'+create_excerpt(value,8)+'</span>';
				$this.html(value);
			});
	
			$row.data('mode','read');
			$row.find('a:first').html('Edit');
			$row.find('a:first').removeClass('default');
			$row.find('a:first').blur();		 
		 
		});		
		
	}
	
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

function ucwords (str) {
    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
        return $1.toUpperCase();
    });
}
