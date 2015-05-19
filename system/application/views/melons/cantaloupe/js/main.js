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
 * @projectDescription  Boot Scalar Javascript/jQuery using yepnope.js
 * @author              Craig Dietrich
 * @version             Cantaloupe 1.0
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
var script_uri = $('script[src]')[0].src;
var base_uri = 'http://'+script_uri.replace('http://','').split('/').slice(0,-2).join('/');
var system_uri = 'http://'+script_uri.replace('http://','').split('/').slice(0,-6).join('/');
var index_uri = 'http://'+script_uri.replace('http://','').split('/').slice(0,-7).join('/');
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



/**
 * Not an easy way to wait for a CSS file to load (even with yepnope doing a good job in Firefox)
 * This function takes a test, for example, that the width of an element has changed, and runs a callback
 */
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

// rewrite Scalar hyperlinks to point to the cantaloupe melon
function addTemplateLinks(element, templateName) {
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
  var $par = $pull.parent();
  if($pull.parents('.manual_slideshow').length != 0)
  	return;
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
 * Finds all contiguous elements that aren't paragraphs or divs and wraps them
 * in divs.
 *
 * @param {Object} selection		The jQuery selection to modify.
 */
function wrapOrphanParagraphs(selection) {
	selection.each(function() {
      var buffer = null;
	  	$(this).contents().each(function() {
	  		if (!$(this).is('p,div,br')) {
          if(buffer === null) {
            buffer = $(this);
            buffer.wrap("<div></div>");
            buffer = buffer.parent();
          } else {
            $(this).appendTo(buffer);
          }
	  		} else {
	  		  if(buffer !== null) {
            buffer.insertBefore(this);
	  		    buffer = null;
	  		  }
	  		}
	  	});
      if(buffer !== null) {
        buffer.appendTo(this);
        buffer = null;
      }

      $(this).find('br').each(function() {
      	if($(this).parents('pre').length === 0) {
	      	if($(this).next().is('br')) {
		        pullOutElement($(this));
	      	}
	      	else {
	      		$(this).remove();
	      	}      		
      	}
      })


	  	$(this).contents().each(function() {
  			// unwrap inline media links and set them to full size if not already specified
  			$(this).find( '.inline' ).each( function() {
          // remove inline links from wrapper while maintaining position relative to siblings
          pullOutElement($(this))
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


/*
 * $.fn.slotmanager_create_slot
 * Create a slot and attach to a tag
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

	if ($tag.hasClass('auto_play')) {
		this.play = function() {
			try {
				$tag.data('mediaelement').play();  // mediaObjectView might not exist yet depending on how long the player takes to load
			} catch(err) {
				setTimeout(this.play, 1000);
			};
		};
		this.play();
	}		
	return $tag;

}


/**
 * Boot the interface
 */
$(window).ready(function() {

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
		          base_uri+'/js/form-validation.js',
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
				/**
				 * Navigating the RDFa using jquery.RDFa.js' methods if needed
				 */
				/*console.log('------- Current page from RDFa ---------------');
				console.log( 'current page title: '+rdf.predicate('http://purl.org/dc/terms/title') );
				console.log( 'current page description: '+rdf.predicate('http://purl.org/dc/terms/description') );
				console.log( 'current page content: '+rdf.predicate('http://rdfs.org/sioc/ns#content') );
				console.log('------- Relationships from RDFa  -------------');*
				// Tags
				var rel = rdf.relations('in').nodes_by_type();
				//for (var uri in rel) console.log('has tag: '+rdf.predicate(rel[uri], 'http://purl.org/dc/terms/title'));
				var rel = rdf.relations('out').nodes_by_type();
				//for (var uri in rel) console.log('tag of: '+rdf.predicate(rel[uri], 'http://purl.org/dc/terms/title'));
				// Paths
				var rel = rdf.relations('in').nodes_by_type('index');
				//for (var uri in rel) console.log('has path: '+rdf.predicate(rel[uri], 'http://purl.org/dc/terms/title')+" at '"+rdf.types(rel[uri])+"'");
				var rel = rdf.relations('out').nodes_by_type('index');
				//for (var uri in rel) console.log('path of: '+rdf.predicate(rel[uri], 'http://purl.org/dc/terms/title')+" at '"+rdf.types(rel[uri])+"'");
				// Annotations
				var rel = rdf.relations('in').nodes_by_type('t');
				//for (var uri in rel) console.log('has annotation: '+rdf.predicate(rel[uri], 'http://purl.org/dc/terms/title')+" at '"+rdf.types(rel[uri])+"'");
				var rel = rdf.relations('out').nodes_by_type('t');
				//for (var uri in rel) console.log('annotation of: '+rdf.predicate(rel[uri], 'http://purl.org/dc/terms/title')+" at '"+rdf.types(rel[uri])+"'");
				// Comments
				var rel = rdf.relations('in').nodes_by_type('datetime');
				//for (var uri in rel) console.log('has reply: '+rdf.predicate(rel[uri], 'http://purl.org/dc/terms/title')+" at '"+rdf.types(rel[uri])+"'");
				var rel = rdf.relations('out').nodes_by_type('datetime');
				//for (var uri in rel) console.log('reply of: '+rdf.predicate(rel[uri], 'http://purl.org/dc/terms/title')+" at '"+rdf.types(rel[uri])+"'");
				// References
				var rel = rdf.predicates('http://purl.org/dc/terms/isReferencedBy');
				//for (var uri in rel) console.log('is referenced by: '+rdf.predicate(rel[uri].value, 'http://purl.org/dc/terms/title'));
				var rel = rdf.predicates('http://purl.org/dc/terms/references');
				//for (var uri in rel) console.log('references: '+rdf.predicate(rel[uri].value, 'http://purl.org/dc/terms/title'));	*/

		  }},

		  {load: [widgets_uri+'/spinner/spin.min.js',
		          widgets_uri+'/d3/d3.min.js'], complete:function() {
			  
		        var currentNode = scalarapi.model.getCurrentPageNode();
		   		if ( currentNode == null ) {
		   			$( 'body' ).append( '<nav role="navigation"><a href="#"><span id="book-title"></span></a></nav>' );
		   			$( 'body' ).append( '<div id="centered-message">This page contains no content. Click the <img src="' + modules_uri + '/cantaloupe/images/edit_icon.png" alt="Edit button. Click to edit the current page or media." width="30" height="30" /> button above to add some.</div>' );
		   		} else {
				  	$('#book-title').parent().wrap('<nav role="navigation"></nav>');
				  	$('article').before($('#book-title').parent().parent());
		   		}
				header = $('#book-title').parent().parent().scalarheader( { root_url: modules_uri+'/cantaloupe'} );

				page = $.scalarpage( $('article'),  { root_url: modules_uri+'/cantaloupe'} );

				$( '[property="art:url"]' ).css( 'display', 'none' );

				$('body').css('visibility', 'visible').attr( 'ontouchstart', '' );

				var timeout;
				$(window).resize( function() {
					clearTimeout( timeout );
					timeout = setTimeout( handleDelayedResize, 300 );
				});

		  }},

		  // Mediaelement
		  {load: [widgets_uri+'/mediaelement/AC_QuickTime.js',
		          widgets_uri+'/mediaelement/flowplayer.js',
		          widgets_uri+'/mediaelement/jquery.annotate.js',
		          widgets_uri+'/mediaelement/froogaloop.min.js',
		          widgets_uri+'/mediaelement/soundcloudapi.js',
		          widgets_uri+'/mediaelement/soundcloudsdk.js',
		          widgets_uri+'/mediaelement/openseadragon/openseadragon.min.js',
		          widgets_uri+'/mediaelement/mediaelement.css',
		          widgets_uri+'/mediaelement/annotation.css',
		          widgets_uri+'/mediaelement/jquery.mediaelement.js',
		          widgets_uri+'/mediaelement/jquery.jplayer.min.js'], complete:function() {
			
		        var currentNode = scalarapi.model.getCurrentPageNode();
		        
				if ( currentNode != null ) {
					page.addMediaElements();
				}

				$audio = $('section.audio');
				if($audio.length) {
					$audio.show();
					page.addMediaElementsForElement($audio);
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

