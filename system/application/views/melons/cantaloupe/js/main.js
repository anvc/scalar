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
 * @projectDescription  Boot Scalar Javascript/jQuery using yepnope.js
 * @author              Erik Loyer
 * @author				Craig Dietrich
 * @version             Cantaloupe 1.1
 */

var ViewState = {
	Reading: 'reading',
	Navigating: 'navigating',
	Modal: 'modal',
	Editing: 'editing'
}

/**
 * Get paths to script and style directories
 */
var script_uri = '';
$('script[src]').each(function() {  // Certain hotel wifi are injecting spam <script> tags into the page
  var $this = $(this);
  if ($this.attr('src').indexOf('jquery-1.7.min.js') != -1) {
    script_uri = $this.attr('src');
    return false;
  }
});
var scheme = (script_uri.indexOf('https://') != -1) ? 'https://' : 'http://';
var base_uri = scheme+script_uri.replace(scheme,'').split('/').slice(0,-2).join('/');
var system_uri = scheme+script_uri.replace(scheme,'').split('/').slice(0,-6).join('/');
var index_uri = scheme+script_uri.replace(scheme,'').split('/').slice(0,-7).join('/');
var arbors_uri = base_uri.substr(0, base_uri.lastIndexOf('/'));
var views_uri = arbors_uri.substr(0, arbors_uri.lastIndexOf('/'));
var modules_uri = views_uri+'/melons';
var widgets_uri = views_uri+'/widgets';
var header = null;
var page = null;
var pinwheel = null;
var sidebar = null;
var state = ViewState.Reading;
var lastState = state;
var template_getvar = 'template';
var maxMediaHeight = Math.min( window.innerWidth, 1040 );
var isMobile = ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/KFOT/i)) || (navigator.userAgent.match(/Kindle/i)) || (navigator.userAgent.match(/iPad/i)) || ((navigator.userAgent.match(/Android/i)) && (navigator.userAgent.match(/mobile/i))));
var isTablet = ((navigator.userAgent.match(/iPad/i)) || (navigator.userAgent.match(/KFOT/i)) || (navigator.userAgent.match(/Kindle/i)) || (navigator.userAgent.match(/Android/i)));
var isMobileNotTablet = ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || ((navigator.userAgent.match(/Android/i)) && (navigator.userAgent.match(/mobile/i)))); // TODO: Does this weed out Android tablets?
var isNative = (document.location.href.indexOf('=cantaloupe') == -1);
var typeLimits = null;

function when(tester_func, callback) {
	var timeout = 50;
	var passed = tester_func();
	if ('undefined'!=typeof(passed) && passed) {
		callback();
		return;
	}
	setTimeout(function() {
		when(tester_func, callback)
	}, timeout);
}

function setState(newState, instantaneous) {
	if ((instantaneous == undefined) || (instantaneous == null)) instantaneous = false;
	if (state != newState) {
		lastState = state;
		state = newState;
		$('body').trigger('setState', {state:state, instantaneous:instantaneous});
		$.cookie('viewstate', this.state, {path: '/'});
	}
}

function restoreState() {
	state = lastState;
	$('body').trigger('setState', {state:state, instantaneous:true});
}

function addTemplateLinks(element, templateName) {  // rewrite Scalar hyperlinks to point to the cantaloupe melon
	if (!isNative) {
		element.find('a').each(function() {
			var href = $(this).attr('href');
			if (href !== undefined) {
				if ((href.indexOf(scalarapi.model.urlPrefix.substr(0, scalarapi.model.urlPrefix.length-1)) != -1) || (href.indexOf('http://') == -1)) {
					if (href.split('?').length > 1) {
						href += '&'+template_getvar+'='+templateName;
					} else {
						href += '?'+template_getvar+'='+templateName;
					}
					$(this).attr('href', href);
				}
			}
		});
	}
}

// rewrite Scalar urls to point to the cantaloupe melon
function addTemplateToURL(url, templateName) {
	if (!isNative) {
		if ((url.indexOf(scalarapi.model.urlPrefix.substr(0, scalarapi.model.urlPrefix.length-1)) != -1) || (url.indexOf('http://') == -1)) {
			if (url.split('?').length > 1) {
				url += '&'+template_getvar+'='+templateName;
			} else {
				url += '?'+template_getvar+'='+templateName;
			}
			return url;
		}
	}
	return url;
}

// TODO: Consider moving this into scalarapi
function getChildrenOfType(node, type) {
	var children = [];
	var i,j,childNodes,childNode,relationship;
	var relationships = ['path', 'tag'];
	for (j in relationships) {
		relationship = relationships[j];
		childNodes = node.getRelatedNodes(relationship, 'outgoing');
		for (i in childNodes) {
			childNode = childNodes[i];
			if (childNode.hasScalarType(type) && (children.indexOf(childNode) == -1)) children.push(childNode);
		}
	}
	return children;
}

function handleDelayedResize() {
	maxMediaHeight = Math.min( window.innerWidth, 1040 );
	$( 'body' ).trigger( 'delayedResize' );
}

function addIconBtn(element, filename, hoverFilename, title, url) {
	var img_url_1 = modules_uri+'/cantaloupe/images/'+filename;
	var img_url_2 = modules_uri+'/cantaloupe/images/'+hoverFilename;
	if (url == undefined) url = 'javascript:;';
	var button = $('<a href="'+url+'" title="'+title+'"><img src="'+img_url_1+'" onmouseover="this.src=\''+img_url_2+'\'" onmouseout="this.src=\''+img_url_1+'\'" width="30" height="30" /></a>').appendTo(element);
	return button;
}

function pullOutElement($pull) {
  if (!$pull.is('[property="sioc:content"] *') || !$pull.is('.manual_slideshow *')) {
    return;
  }
  var $par = $pull.parent();
  while($par.attr('property') !== 'sioc:content') {
    var $clone = $par.clone();
    $clone.empty();
    var $nextElement = ($pull[0].nextSibling ? $($pull[0].nextSibling) : $pull.next());
    while($nextElement.length != 0) {
      $nextElement.appendTo($clone);
      $nextElement = ($pull[0].nextSibling ? $($pull[0].nextSibling) : $pull.next());
    }
    if($clone.contents().length !== 0){
      $clone.insertAfter($par);
    }
    $pull.insertAfter($par);
    $par = $pull.parent();
  }
}

/**
 * Finds all contiguous elements that aren't paragraphs or divs and wraps them in divs.
 *
 * @param {Object} selection		The jQuery selection to modify.
 */
function wrapOrphanParagraphs(selection) {

	selection.each(function() {

      	var buffer = null;
      	var lastElement;
      	var brCount = 0;

	  	$( this ).contents().each(function() {

	  		var me = this;
  	  		var newParagraph = false;
	  		var is_br =  $( this ).is( 'br' );
	  		var is_nbsp = $( this ).text() == '\xA0';

	  		// trigger a new paragraph for these elements
	  		if ( $( this ).is('p,div,h1,h2,h3,ul,ol') ) {
	  			newParagraph = true;

	  		// trigger a new paragraph for blockquotes, but wrap them in another div first
	  		} else if ( $( this ).is('blockquote') ) {
	  			newParagraph = true;
	  			 $( this ).wrap( '<div>' );
	  			 me = $( this ).parent();

	  		// trigger a new paragraph for two consecutive br tags
	  		} else if ( is_br && ( brCount == 1 ) ) {
	  			newParagraph = true;

	  		// trigger a new paragraph for a br tag followed by an nbsp
	  		} else if ( is_nbsp && ( brCount == 1 ) ) {
	  			newParagraph = true;
	  		}

	  		// if this isn't a new paragraph, then
	  		if ( !newParagraph ) {

	  			// if this element is either not a br, or is a single br,
	  			// AND if this element is either not an nbsp, or an nbsp that doesn't immediately follow a br,
	  			// then add it
	  			if (( !is_br || ( is_br && ( brCount == 0 ))) && ( !is_nbsp || ( is_nbsp && ( brCount != 1 ) ))) {

	  				// for the first element in a new paragraph, we need to do some extra work
	          		if ( buffer === null ) {
	            		buffer = $( me );
	            		buffer.wrap( "<div></div>" );
	            		buffer = buffer.parent();

	            	// otherwise just add it
	          		} else {
	            		$( me ).appendTo( buffer );
	          		}
	          	}

	        // if this is a new paragraph, then insert the contents of the previous paragraph
	        // before the current element, and start a new paragraph buffer
	  		} else {
	  		  	if( buffer !== null ) {
            		buffer.insertBefore( me );
	  		    	buffer = null;
	  		  	}
	  		  	// even if this element contains no free-floating text, we still need to make a paragraph out of it
	  		  	if (!is_br && ($(me).clone().children().remove().end().text() == '')) {
            		buffer = $( me );
            		buffer.wrap( "<div></div>" );
            		buffer = buffer.parent();
	  		  	}
	  		}

	  		// keep track of the last element traversed, and a count of consecutive br elements
	  		lastElement = this;
	  		if ( $( lastElement ).is( 'br' ) ) {
	  			brCount++;
	  		} else {
	  			brCount = 0;
	  		}

	  	});

      	if (buffer !== null) {
       		buffer.appendTo(this);
        	buffer = null;
      	}

      	/*$(this).find('br').each(function() {
      		if($(this).parents('pre').length === 0) {
	      		if($(this).next().is('br')) {
		        	pullOutElement($(this));
	      		} else {
	      			$(this).remove();
	      		}
      		}
      	})*/

	  	$(this).contents().each(function() {
  			// unwrap inline media links and set them to full size if not already specified
  			$(this).find( '.inline' ).each( function() {
	          	// remove inline links from wrapper while maintaining position relative to siblings
	         	if(!$(this).hasClass('wrap')){
					pullOutElement($(this));
				}
				if ( $( this ).attr( 'data-size' ) == null ) {
					$( this ).attr( 'data-size', 'full' );
				}
  			});
  			// if the element has no children after whitespace and line breaks are removed, then remove it
  			if ( $(this).text().trim().length < 1 ) {
  				$(this).find( 'br' ).remove();
  				if ( $(this).children().length == 0 ) {
	  				$(this).remove();
  				}
  			}
	  	});
	});
}


/**
 * Create a slot and attach to a tag (ported from honeydew slot manager)
 *
 * @param obj options, required 'url_attributes'
 */
$.fn.slotmanager_create_slot = function(width, height, options) {
	$tag = $(this);
	//if ($tag.hasClass('inline')) return;
	$tag.data( 'slot', $('<div class="slot"></div>') );
	var url = null;

	// Get URL

	var url = null;
	for (var k in options['url_attributes']) {;
		if ('undefined'==typeof($tag.attr(options['url_attributes'][k]))) continue;
		if ($tag.attr(options['url_attributes'][k]).length>0) {
			url = $tag.attr(options['url_attributes'][k]);
			break;
		}
	}
	if (!url) return;

	// Separate seek hash if present

	var annotation_url = null;
	var uri_components = url.split('#');

	// TODO: Special case for hypercities #, until we correctly variable-ify #'s
	if (uri_components.length>1 && uri_components[0].toLowerCase().indexOf('hypercities')!=-1) {
		// keep URL as it is
	} else if (uri_components.length>1) {
		var url = uri_components[0];
		annotation_url = uri_components[1];
		if (annotation_url && annotation_url.indexOf('://')==-1) {
			annotation_url = scalarapi.model.urlPrefix+annotation_url;
			$tag.data( 'targetAnnotation', annotation_url );
		}
	}

	// Metadata resource
	var resource = $tag.attr('resource');

	// Create media element object

	var opts = {};

	if ( width != null ) {
		opts.width = width;
	}
	if ( height != null ) {
		opts.height = height;
	}

	opts.player_dir = $('link#approot').attr('href')+'static/players/';
	opts.base_dir = scalarapi.model.urlPrefix;
	opts.seek = annotation_url;
	opts.chromeless = true;

	// copy all other properties
	for ( var prop in options ) {
		opts[ prop ] = options[ prop ];
	}

	//if (opts.seek && opts.seek.length) alert('[Test mode] Asking to seek: '+opts.seek);
	$tag.data('path', url);
	$tag.data('meta', resource);
	$tag.mediaelement(opts);
	// Insert media element's embed markup

	if (!$tag.data('mediaelement')) return false;  // mediaelement rejected the file
	$tag.data('slot').html( $tag.data('mediaelement').getEmbedObject() );
	$tag.data('mediaelement').model.element.addClass('caption_font');

	if($tag.hasClass('wrap')){
		$tag.data('slot').addClass('wrapped_slot');
		var align = $tag.data('align');
		if(undefined == align){
			align = 'right';
		}
		$tag.data('slot').addClass(align+'_slot');
	}

	return $tag;

}

/**
 * Boot the interface
 */
$(window).ready(function() {

	// Proxy <iframe src=""> if the proxy is on and the src points to non-SSL content
	var use_proxy = ($('link#use_proxy').length && 'true'==$('link#use_proxy').attr('href')) ? true : false;
	if (use_proxy && 'edit' != $('link#view').attr('href')) {
		var proxy_url = $('link#proxy_url').attr('href');
		$('span[property="sioc:content"]').find('iframe').each(function() {
			var $this = $(this);
			var src = $this.prop('src');
			if ('http' != src.substr(0,4)) return;  // not a URL?
			if ('https' == src.substr(0,5)) return;  // already SSL
			$this.prop('src', proxy_url+'?'+src);
		});
	}

	// Trash button
  	$('.hide_page_link').click(function() {
  		var uri = document.location.href;
  		if (uri.indexOf('?')!=-1) uri = uri.substr(0, uri.indexOf('?'));
  		if (uri.indexOf('#')!=-1) uri = uri.substr(0, uri.indexOf('#'));
  		document.location.href = uri + '?action=removed';
  		return false;
  	});

	if ($('.scalarnotice').length) {
		yepnope([
		   {load: [widgets_uri+'/cookie/jquery.cookie.js',widgets_uri+'/notice/jquery.scalarnotice.js'], complete:function() {
			  $('.scalarnotice').scalarnotice();
           }},
	    ]);
	};

	yepnope([

		  // Scalar API
		  {load: [base_uri+'/js/jquery.rdfquery.rules-1.0.js',
		          base_uri+'/js/jquery.RDFa.js',
		          base_uri+'/js/form-validation.js?v=2',
		          widgets_uri+'/nav/jquery.scalarrecent.js',
		          widgets_uri+'/cookie/jquery.cookie.js',
		          widgets_uri+'/api/scalarapi.js'], complete:function() {

				/**
				 * Get raw JSON
				 */

				var rdf = $(document.body).RDFa();
				var rdf_json = rdf.dump();
				//console.log('------- RDFa JSON ----------------------------');
				//console.log(rdf_json);

				// use the RDF data for the book to set the book's base URL
				var datum;
				for ( var i in rdf_json ) {
					datum = rdf_json[ i ];
					if ( datum[ 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' ] ) {
						if ( datum[ 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' ][ 0 ].value == 'http://scalar.usc.edu/2012/01/scalar-ns#Book' ) {
							scalarapi.model.urlPrefix = i + '/';
							break;
						}
					}
				}

				// fallback method for determining the book URL; will fail if URL structure is non-standard
				if ( scalarapi.model.urlPrefix == null ) {
					scalarapi.model.urlPrefix = $( 'link[id="parent"]' ).attr( "href" );
				}

				// use scalarapi to parse the JSON
				scalarapi.model.parseNodes(rdf_json);
				scalarapi.model.parseRelations(rdf_json);
				var currentNode = scalarapi.model.getCurrentPageNode();

				//console.log(JSON.stringify(rdf_json));
				/*
				console.log('------- Current page from RDFa ---------------');
				console.log( 'current page title: '+rdf.predicate('http://purl.org/dc/terms/title') );
				console.log( 'current page description: '+rdf.predicate('http://purl.org/dc/terms/description') );
				console.log( 'current page content: '+rdf.predicate('http://rdfs.org/sioc/ns#content') );
				console.log('------- Relationships from RDFa  -------------');
				// Tags
				var rel = rdf.relations('in').nodes_by_type();
				for (var uri in rel) console.log('has tag: '+rdf.predicate(rel[uri], 'http://purl.org/dc/terms/title'));
				var rel = rdf.relations('out').nodes_by_type();
				for (var uri in rel) console.log('tag of: '+rdf.predicate(rel[uri], 'http://purl.org/dc/terms/title'));
				// Paths
				var rel = rdf.relations('in').nodes_by_type('index');
				for (var uri in rel) console.log('has path: '+rdf.predicate(rel[uri], 'http://purl.org/dc/terms/title')+" at '"+rdf.types(rel[uri])+"'");
				var rel = rdf.relations('out').nodes_by_type('index');
				for (var uri in rel) console.log('path of: '+rdf.predicate(rel[uri], 'http://purl.org/dc/terms/title')+" at '"+rdf.types(rel[uri])+"'");
				// Annotations
				var rel = rdf.relations('in').nodes_by_type('t');
				for (var uri in rel) console.log('has annotation: '+rdf.predicate(rel[uri], 'http://purl.org/dc/terms/title')+" at '"+rdf.types(rel[uri])+"'");
				var rel = rdf.relations('out').nodes_by_type('t');
				for (var uri in rel) console.log('annotation of: '+rdf.predicate(rel[uri], 'http://purl.org/dc/terms/title')+" at '"+rdf.types(rel[uri])+"'");
				// Comments
				var rel = rdf.relations('in').nodes_by_type('datetime');
				for (var uri in rel) console.log('has reply: '+rdf.predicate(rel[uri], 'http://purl.org/dc/terms/title')+" at '"+rdf.types(rel[uri])+"'");
				var rel = rdf.relations('out').nodes_by_type('datetime');
				for (var uri in rel) console.log('reply of: '+rdf.predicate(rel[uri], 'http://purl.org/dc/terms/title')+" at '"+rdf.types(rel[uri])+"'");
				// References
				var rel = rdf.predicates('http://purl.org/dc/terms/isReferencedBy');
				for (var uri in rel) console.log('is referenced by: '+rdf.predicate(rel[uri].value, 'http://purl.org/dc/terms/title'));
				var rel = rdf.predicates('http://purl.org/dc/terms/references');
				for (var uri in rel) console.log('references: '+rdf.predicate(rel[uri].value, 'http://purl.org/dc/terms/title'));
				*/

		  }},

		  {load: [widgets_uri+'/spinner/spin.min.js',
		          widgets_uri+'/d3/d3.min.js'], complete:function() {

		        var currentNode = scalarapi.model.getCurrentPageNode();
		        var extension = scalarapi.getFileExtension( window.location.href );

		   		if ( currentNode == null || currentNode.current == null) {
		   			if ( extension != 'edit' && $('span[property="sioc:content"]').is(':empty')) {
		   				$( 'body' ).append( '<div id="centered-message"><span>This page contains no content.</span> <span>Click the <img src="' + modules_uri + '/cantaloupe/images/edit_icon.png" alt="Edit button. Click to edit the current page or media." width="30" height="30" /> button above to add some.</span></div>' );
		   			}
		   		}

			  	$('#book-title').parent().wrap('<nav role="navigation"></nav>');
			  	$('article').before($('#book-title').parent().parent());

				header = $('#book-title').parent().parent().scalarheader( { root_url: modules_uri+'/cantaloupe'} );

				page = $.scalarpage( $('article'),  { root_url: modules_uri+'/cantaloupe'} );

				widgets = page.bodyContent().scalarwidgets().data('scalarwidgets');


				$( '[property="art:url"]' ).css( 'display', 'none' );

				$('body').css('visibility', 'visible').attr( 'ontouchstart', '' );

				var timeout;
				$( window ).resize( function() {
					clearTimeout( timeout );
					timeout = setTimeout( handleDelayedResize, 300 );
				});

				$('body').trigger( "pageLoadComplete" );

		  }},

		  // Mediaelement
		  {load: [
				widgets_uri+'/mediaelement/annotorious.debug.js',
				widgets_uri+'/mediaelement/css/annotorious.css',
				widgets_uri+'/mediaelement/mediaelement.css',
				widgets_uri+'/mediaelement/jquery.mediaelement.js'], complete:function() {

		        var currentNode = scalarapi.model.getCurrentPageNode();

				if ( currentNode != null ) {
					page.addMediaElements();
				}

				var extension = scalarapi.getFileExtension( window.location.href );
				if (extension == "") {
					$audio = $('section.audio');
					if($audio.length) {
						$audio.show();
						page.addMediaElementsForElement($audio);
					}
				}

				var savedState = $.cookie('viewstate');

		  }},

		  // Maximize + comments
		  {load: ['//www.google.com/recaptcha/api/js/recaptcha_ajax.js',
		          widgets_uri+'/replies/replies.js'], complete:function() {}
		  },

		  // Hypothesis
		  {
			  test: ('true'==$('link#hypothesis').attr('href')),
			  yep: 'https://hypothes.is/embed.js'
		  },

	]);  // !yepnope

});
