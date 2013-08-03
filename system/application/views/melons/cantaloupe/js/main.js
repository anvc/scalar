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
	Editing: 'editing'
}

/**
 * Get paths to script and style directories
 */
var script_uri = document.getElementsByTagName("script")[0].src;
var base_uri = 'http://'+script_uri.replace('http://','').split('/').slice(0,-2).join('/');
var system_uri = 'http://'+script_uri.replace('http://','').split('/').slice(0,-6).join('/');
var arbors_uri = base_uri.substr(0, base_uri.lastIndexOf('/'));
var views_uri = arbors_uri.substr(0, arbors_uri.lastIndexOf('/'));
var modules_uri = views_uri+'/melons';
var widgets_uri = views_uri+'/widgets';
var currentNode = null;
var header = null;
var page = null;
var pinwheel = null;
var state = ViewState.Reading;
var template_getvar = 'm';
var maxMediaHeight = 650;

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
		state = newState;
		$('body').trigger('setState', {state:state, instantaneous:instantaneous});
		$.cookie('viewstate', this.state, {path: '/'});
	}
}
				
// rewrite Scalar hyperlinks to point to the cantaloupe melon
function addTemplateLinks(element, templateName) {
	element.find('a').each(function() {
		var href = $(this).attr('href');
		if ((href.indexOf(scalarapi.model.urlPrefix.substr(0, scalarapi.model.urlPrefix.length-1)) != -1) || (href.indexOf('http://') == -1)) {
			if (href.split('?').length > 1) {
				href += '&'+template_getvar+'='+templateName;
			} else {
				href += '?'+template_getvar+'='+templateName;
			}
			$(this).attr('href', href);
		}
	});
}

			
function addIconBtn(element, filename, hoverFilename, title, url) {
	var img_url_1 = modules_uri+'/cantaloupe/images/'+filename;
	var img_url_2 = modules_uri+'/cantaloupe/images/'+hoverFilename;
	if (url == undefined) url = 'javascript:;';
	var button = $('<a href="'+url+'" title="'+title+'"><img src="'+img_url_1+'" onmouseover="this.src=\''+img_url_2+'\'" onmouseout="this.src=\''+img_url_1+'\'" alt="Search" width="30" height="30" /></a>').appendTo(element);
	return button;
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
	
	// Seperate seek hash if present
	
	var annotation_url = null;
	var uri_components = url.split('#');
	
	// TODO: Special case for hypercities #, until we correctly variable-ify #'s
	if (uri_components.length>1 && uri_components[0].toLowerCase().indexOf('hypercities')!=-1) {
		// keep URL as it is
	} else if (uri_components.length>1) {
		var url = uri_components[0];
		annotation_url = uri_components[1];	
		//if (annotation_url && annotation_url.indexOf('://')==-1) annotation_url = dirname(document.location.href)+'/'+annotation_url;	
		// modified by Erik below to remove duplicated 'annotations/' in url
		if (annotation_url && annotation_url.indexOf('://')==-1) annotation_url = scalarapi.model.urlPrefix+annotation_url;	
	}

	// Metadata resource
	var resource = $tag.attr('resource');
	
	// Create media element object
	
	var opts = {};
	if (width != null) opts.width = width; 
	if (height != null) opts.height = height; 
	opts.player_dir = $('link#approot').attr('href')+'static/players/';
	opts.base_dir = scalarapi.model.urlPrefix;
	opts.seek = annotation_url;
	opts.chromeless = true;
	//if (opts.seek && opts.seek.length) alert('[Test mode] Asking to seek: '+opts.seek);		
	$tag.data('path', url);
	$tag.data('meta', resource);
	$tag.mediaelement(opts);
	
	// Insert media element's embed markup
	
	if (!$tag.data('mediaelement')) return false;  // mediaelement rejected the file
	$tag.data('slot').html( $tag.data('mediaelement').getEmbedObject() );

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
	
	yepnope([
	         
		  // Scalar API
		  {load: [base_uri+'/js/jquery.rdfquery.rules.min-1.0.js',
		          base_uri+'/js/jquery.RDFa.js',
		          widgets_uri+'/cookie/jquery.cookie.js',
		          widgets_uri+'/api/scalarapi.js'], complete:function() {
			  
				/**
				 * Get raw JSON
				 */			 
				var rdf = $(document.body).RDFa();
				var rdf_json = rdf.dump();
				//console.log('------- RDFa JSON ----------------------------');
				//console.log(rdf_json);
				
				// use scalarapi to parse the JSON
				scalarapi.model.urlPrefix = document.location.href.split('/').slice(0,5).join('/')+'/';
				scalarapi.model.parseNodes(rdf_json);
				scalarapi.model.parseRelations(rdf_json);
				currentNode = scalarapi.model.nodesByURL[scalarapi.stripAllExtensions(document.location.href)];
				//console.log(JSON.stringify(rdf_json));
				/**
				 * Navigating the RDFa using jquery.RDFa.js' methods if needed
				 */
				/*console.log('------- Current page from RDFa ---------------');
				console.log( 'current page title: '+rdf.predicate('http://purl.org/dc/terms/title') );
				console.log( 'current page description: '+rdf.predicate('http://purl.org/dc/terms/description') );
				console.log( 'current page content: '+rdf.predicate('http://rdfs.org/sioc/ns#content') );
				console.log('------- Relationships from RDFa  -------------');*/
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
				//for (var uri in rel) console.log('references: '+rdf.predicate(rel[uri].value, 'http://purl.org/dc/terms/title'));	
						  
		  }},   
		  
		  // Background visualization layer
		  /*{load: [widgets_uri+'/vis/scalarvis2.css',
		          widgets_uri+'/vis/jquery.scalarvis2.js',widgets_uri+'/vis/color-thief.js'], complete:function() {  
			  	// TODO: Background visualization initialization here
		  }}, */ 		  
		  
		  // Mediaelement
		  {load: [widgets_uri+'/mediaelement/AC_QuickTime.js',
		          widgets_uri+'/mediaelement/flowplayer.js',
		          widgets_uri+'/mediaelement/jquery.annotate.js',
		          widgets_uri+'/mediaelement/froogaloop.min.js',
		          widgets_uri+'/mediaelement/mediaelement.css',
		          widgets_uri+'/mediaelement/annotation.css',
		          widgets_uri+'/mediaelement/jquery.mediaelement.js',
		          widgets_uri+'/mediaelement/jquery.jplayer.min.js'], complete:function() {
		          
			  	$('#book-title').parent().wrap('<div></div>');
			  	$('article').before($('#book-title').parent().parent());
				header = $('#book-title').parent().parent().scalarheader( { root_url: modules_uri+'/cantaloupe'} );
				page = $.scalarpage($('article'));

				if ($('.bg_screen').length > 0) {
					pinwheel = $.scalarpinwheel($('.bg_screen').after('<div id="graph"></div>'));
				} else {
					pinwheel = $.scalarpinwheel($('body').prepend('<div id="graph"></div>'));
				}
				
				var savedState = $.cookie('viewstate');
				if (savedState != null) {
					setState(savedState, true);
				}
				
				$('body').css('visibility', 'visible');
				
		  }},
		  
		  /*// Slot managers
		  {load: [widgets_uri+'/slotmanager/jquery.texteo.js',
		          widgets_uri+'/slotmanager/texteo.css',
		          widgets_uri+'/slotmanager/jquery.inlineslotmanager.js'], complete:function() {
			  	// TODO
			  	

		  }},*/

		  // Content preview
		  /*{load: [widgets_uri+'/contentpreview/jquery.scalarcontentpreview.js'], complete:function() {
			  	// TODO: content preview
		  }},*/
		  
		  // Maximize + comments
		  {load: [/*widgets_uri+'/maximize/maximize.css',
		          widgets_uri+'/maximize/jquery.scalarmaximize.js',*/
		          '//www.google.com/recaptcha/api/js/recaptcha_ajax.js',
		          widgets_uri+'/replies/replies.js'], complete:function() {
				$('.reply_link').click(function() {
			    	commentFormDisplayForm();
			    	return false;
			    });
				if (document.location.hash.indexOf('comment')!=-1) commentFormDisplayForm();
		  }},
		  
		  // Live annotations
		 /* {load: [widgets_uri+'/liveannotations/jquery.scalarliveannotations.js'], complete:function() {
			$('body').bind('show_annotation', function(event, annotation, mediaelement) {
				if (!mediaelement.isPlaying()) return;
				$('<div></div>').appendTo('body').live_annotation({
					annotation:annotation, 
					mediaelement:mediaelement, 
					mode:(($("script[src*='vertslotmanager.js']").length) ? 'vert' : 'horiz'), 
					content_wrapper_id:'content_wrapper', 
					content_id:'content'
				});
			});	
			$('body').bind('hide_annotation', function(event) {});	
		  }}*/
  	  
	]);  // !yepnope
	
});

