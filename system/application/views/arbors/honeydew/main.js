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
 * @version             Honeydew 1.3
 */

/**
 * Get paths to script and style directories
 */
var script_uri = document.getElementsByTagName("script")[0].src;
var base_uri = script_uri.substr(0, script_uri.lastIndexOf('/'));
var arbors_uri = base_uri.substr(0, base_uri.lastIndexOf('/'));
var views_uri = arbors_uri.substr(0, arbors_uri.lastIndexOf('/'));
var modules_uri = views_uri+'/modules';
var widgets_uri = views_uri+'/widgets';

/**
 * There's no good way to wait for a CSS file to load (even with yepnope doing a good job in Firefox)
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

/**
 * Trigger an event when yepnope has completed its load sequence
 */
/*
$(window).load(function() {  
	when(function(){if ($('script[src*="jquery.scalarliveannotations.js"]').length) return true}, function() {  // The last item in the yesnope load
		$('body').trigger('yepnopeLoadComplete', []);
	});		
});
*/	

/**
 * Boot the interface
 */   
$(window).ready(function() {
	
	yepnope([
 
		  // Scalar API
		  {load: [widgets_uri+'/api/scalarapi.js'], complete:function() {
		  	$('.hide_page_link').click(function() {
		  		var uri = document.location.href;
		  		if (uri.indexOf('?')!=-1) uri = uri.substr(0, uri.indexOf('?'));
		  		if (uri.indexOf('#')!=-1) uri = uri.substr(0, uri.indexOf('#'));
		  		document.location.href = uri + '?action=removed';
		  		return false;
		  	});
		  }},   
		  
		  // Mediaelement
		  {load: [widgets_uri+'/mediaelement/AC_QuickTime.js',widgets_uri+'/mediaelement/flowplayer.js',widgets_uri+'/mediaelement/jquery.annotate.js',widgets_uri+'/mediaelement/froogaloop.min.js',widgets_uri+'/mediaelement/mediaelement.css',widgets_uri+'/mediaelement/annotation.css',widgets_uri+'/mediaelement/jquery.mediaelement.js',widgets_uri+'/mediaelement/jquery.jplayer.min.js']},
		  
		  // Slot managers
		  {load: [widgets_uri+'/slotmanager/jquery.texteo.js',widgets_uri+'/slotmanager/texteo.css',widgets_uri+'/slotmanager/jquery.inlineslotmanager.js'], complete:function() {
			// View being asked for or revert to the default view
		    var ext = get_url_extension();
		    var view = (ext.length) ? ext : $('link#default_view').attr('href');
		    switch(view) {
		      case 'split':
		      case 'text':
		        var stylesheet = ('split'==view) ? 'splitslotmanager' : 'vertslotmanager';
		        yepnope({load:[widgets_uri+'/slotmanager/'+stylesheet+'.css',widgets_uri+'/slotmanager/jquery.vertslotmanager.js'], complete:function() {
		          when(function(){if ($('.vert_slots').width()<$('#content_wrapper').width()) return true}, function() {
		          	$('.vert_slots').vertslotmanager();
		         	$('#content').texteo({scrolling_element:'window'});		          
		          });
		        }});	
		        break;
		      case 'media':
		        yepnope({load:[widgets_uri+'/slotmanager/horizslotmanager.css',widgets_uri+'/slotmanager/jquery.horizslotmanager.js'], complete:function() {
		          $('.horiz_slots').horizslotmanager();
		          $('#content').texteo({scrolling_element:'element'});
		        }}); 
		        break;
		      case 'par':
		        yepnope({load:[widgets_uri+'/slotmanager/paragraphmanager.css',widgets_uri+'/slotmanager/jquery.inparagraphslotmanager.js'], complete:function() {	         
                  $('#content').inparagraphslotmanager();
		          $('#content').texteo();
		        }}); 
		        break;
		      case 'revpar':
			    yepnope({load:[widgets_uri+'/slotmanager/paragraphmanager.css',widgets_uri+'/slotmanager/jquery.reverseinparagraphsslotmanager.js'], complete:function() {	         
		          $('#content').reverseinparagraphsslotmanager();
				  $('#content').texteo();
				}}); 
				break;		    	  
		      case 'vis':
		      case 'visindex':
		      case 'vispath':
		      case 'vismedia':
		      case 'vistag':
		        yepnope({load: [widgets_uri+'/d3/d3.v2.js',widgets_uri+'/vis/scalarvis.css',widgets_uri+'/vis/jquery.scalarvis.js'], complete:function() {
		          $('#content').texteo({scrolling_element:'window', click:'native'});
		          var default_tab = get_url_extension();
		          if (!default_tab.length) default_tab = $('link#default_view').attr('href').toLowerCase();
		          var options = {parent_uri:$('link#parent').attr('href'), default_tab:default_tab}; 
		          $('#visualization').scalarvis(options);	
		        }});   
		        break;
		      case 'history':
		        yepnope({load: [widgets_uri+'/historybrowser/historybrowser.css']});   
		      case 'edit':
		        yepnope({load: [modules_uri+'/chrome/honeydew/content/edit.css',widgets_uri+'/farbtastic/farbtastic.js',widgets_uri+'/farbtastic/farbtastic.css',widgets_uri+'/wysiwyg/jquery.wysiwyg.js',widgets_uri+'/wysiwyg/jquery.wysiwyg.css',modules_uri+'/chrome/honeydew/content/edit.js',widgets_uri+'/spinner/spin.min.js'], complete:function() {
		        }});    
		        break;     
		      case 'annotation_editor':
		        yepnope({load: [widgets_uri+'/annobuilder/jquery.annobuilder.js',widgets_uri+'/annobuilder/annobuilder.css',widgets_uri+'/spinner/spin.min.js'], complete:function() {    
		        	// Set up for the possibility of more than one anno builder, but for now, break after first tag
		        	var tags = $('#content').find('.inline');
					for (var j = 0; j < tags.length; j++) {
						var $tag = $(tags[j]);
						if (typeof($tag.data('mediaelement'))=='object') {
							$('.annobuilder:first').annobuilder( {link:$tag} );  /* Erik: not sure why this isn't firing */
							break;
						}
					}       	
		        }});      	
		      default:
		        $('#content').texteo({scrolling_element:'element', click:'native'});      
		        break;
		    } 
			// Inline media elements
			$('.inline').inlineslotmanager();			    
		    // Tag page
		  	if (-1!=document.location.href.indexOf('/tags')) {
				yepnope({load: [widgets_uri+'/tagcloud/jquery.tagcloud.min.js'], complete:function() {
					$('.tags').tagcloud( {type:'list',sizemin:12,sizemax:26,colormax:'25447e',colormin:'4259a4'} );
				}});  
		 	}	
		 	// Upload page
		  	if (-1!=document.location.href.indexOf('/upload')) {
				yepnope({load: [widgets_uri+'/spinner/spin.min.js']});  
		 	}	 
		  	// Title
		  	$('.cover_title').click(function() {
		  		var parent = $('link#parent').attr('href');
		  		if (!parent.length) return;
		  		document.location.href=parent;
		  	});
		  }},
		  
		  // Scalar Nav which includes a few dependencies
		  {load: [widgets_uri+'/cookie/jquery.cookie.js',widgets_uri+'/pulldown/jquery.scalarpulldown.js',widgets_uri+'/nav/jquery.rdfquery.rules.min-1.0.js',widgets_uri+'/nav/jquery.scalarrecent.js',widgets_uri+'/nav/jquery.scalarnav.js',widgets_uri+'/nav/nav.css'], complete:function() {
			var options = {parent_uri: $('link#parent').attr('href'),logged_in: $('link#logged_in').attr('href'),user_level: $('link#user_level').attr('href')};
		    scalarrecent_log_page();
		    $('#scalarnav').scalarnav(options);
		    $('.pulldown').scalarpulldown();
		  }},		  
		  
		  // Link content preview
		  {load: [widgets_uri+'/contentpreview/jquery.scalarcontentpreview.js'], complete:function() {
		    $('body').bind('texteoTagMouseOver', function(event, $link, mouseOverEvent) {  
		      if ($link.data('content_preview')) return;
		      $link.scalarcontentpreview();
		    });
		  }},
		  
		  // Maximize + comments
		  {load: [widgets_uri+'/maximize/maximize.css',widgets_uri+'/maximize/jquery.scalarmaximize.js','//www.google.com/recaptcha/api/js/recaptcha_ajax.js',widgets_uri+'/replies/replies.js'], complete:function() {
			$('.reply_link').click(function() {
		    	commentFormDisplayForm();
		    	return false;
		    });
			if (document.location.hash.indexOf('comment')!=-1) commentFormDisplayForm();
		  }},
		  
		  // Live annotations
		  {load: [widgets_uri+'/liveannotations/jquery.scalarliveannotations.js'], complete:function() {
			$('body').bind('show_annotation', function(event, annotation, mediaelement) {
				if (!mediaelement.isPlaying()) return;	// Guard against the Live Annotatiob being re-created every second or more
				$('<div></div>').appendTo('body').live_annotation({
					annotation:annotation, 
					mediaelement:mediaelement, 
					mode:(($("script[src*='vertslotmanager.js']").length) ? 'vert' : 'horiz'), 
					content_wrapper_id:'content_wrapper', 
					content_id:'content'
				});
			});	
			$('body').bind('hide_annotation', function(event) {});	
		  }}
  	  
	]);  // !yepnope
	
});

