//getComputedStyle Polyfill - needed for IE<=8
"getComputedStyle"in this||(this.getComputedStyle=function(){function g(a,b,c,e){var d=b[c];b=parseFloat(d);d=d.split(/\d/)[0];e=null!=e?e:/%|em/.test(d)&&a.parentElement?g(a.parentElement,a.parentElement.currentStyle,"fontSize",null):16;a="fontSize"==c?e:/width/i.test(c)?a.clientWidth:a.clientHeight;return"em"==d?b*e:"in"==d?96*b:"pt"==d?96*b/72:"%"==d?b/100*a:b}function h(a,b){var c="border"==b?"Width":"",e=b+"Top"+c,d=b+"Right"+c,f=b+"Bottom"+c,c=b+"Left"+c;a[b]=(a[e]==a[d]==a[f]==a[c]?[a[e]]:
a[e]==a[f]&&a[c]==a[d]?[a[e],a[d]]:a[c]==a[d]?[a[e],a[d],a[f]]:[a[e],a[d],a[f],a[c]]).join(" ")}function k(a){var b=a.currentStyle,c=g(a,b,"fontSize",null);for(property in b)/width|height|margin.|padding.|border.+W/.test(property)&&"auto"!==this[property]?this[property]=g(a,b,property,c)+"px":"styleFloat"===property?this["float"]=b[property]:this[property]=b[property];h(this,"margin");h(this,"padding");h(this,"border");this.fontSize=c+"px";return this}k.prototype={constructor:k,getPropertyPriority:function(){},
getPropertyValue:function(a){return this[a]||""},item:function(){},removeProperty:function(){},setProperty:function(){},getPropertyCSSValue:function(){}};return function(a){return new k(a)}}(this));


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
 (function($){
    $.scalarheader = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        base.usingMobileView = false;
        base.parentNodes = [];
        base.checkedParents = [];
        base.visitedPages = [];
        base.oldScrollTop = 0;
        base.dataType = 'normal';
        base.usingHypothesis = $('link#hypothesis').attr('href') === 'true';
        base.editorialWorkflowEnabled = $('link#editorial_workflow').attr('href') === 'true';
        base.remToPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
        base.editorialStates = {
            "none": { id: "none", name: null },
            "draft": { id: "draft", name: "Draft" },
            "edit": { id: "edit", name: "Edit" },
            "editreview": { id: "editreview", name: "Edit Review" },
            "clean": { id: "clean", name: "Clean" },
            "ready": { id: "ready", name: "Ready" },
            "published": { id: "published", name: "Published" },
        }
        base.editorialBarData = {
            "author": {
                "draft": {
                    "text": "<strong>This $contentType is in the $editorialState state<span class=\"query-msg\"> and has $openQueryCount open queries</span>.</strong><br/>Continue working until you're ready to submit it for editing.",
                    "previousEditorialState": null,
                    "nextEditorialState": "edit",
                    "actions": ["Edit $contentType","Dashboard"]
                },
                "edit": {
                    "text": "<strong>This $contentType is in the $editorialState state<span class=\"query-msg\"> and has $openQueryCount open queries</span>.</strong><br/>Once an editor moves it into <strong>$nextEditorialState</strong>, you can respond to any changes or queries.",
                    "previousEditorialState": "draft",
                    "nextEditorialState": "editreview",
                    "actions": ["Dashboard"]
                },
                "editreview": {
                    "text": "<strong>This $contentType is in the $editorialState state<span class=\"query-msg\"> and has $openQueryCount open queries</span>.</strong><br/>Edit this page to review and respond to editor changes and queries, moving it to the <strong>$nextEditorialState</strong> state once all issues have been addressed. Use the <strong>Editorial Path</strong> to view all changes at once.",
                    "previousEditorialState": "edit",
                    "nextEditorialState": "clean",
                    "actions": ["Edit $contentType","Editorial Path"]
                },
                "clean": {
                    "text": "<strong>This $contentType is in the $editorialState state<span class=\"query-msg\"> and has $openQueryCount open queries</span>.</strong><br/>An editor will review and either move it back to the <strong>$previousEditorialState</strong> state for further changes, or into the <strong>$nextEditorialState</strong> state for publication.",
                    "previousEditorialState": "editreview",
                    "nextEditorialState": "ready",
                    "actions": ["Dashboard"]
                },
                "ready": {
                    "text": "<strong>This $contentType is in the $editorialState state<span class=\"query-msg\"> and has $openQueryCount open queries</span>.</strong><br/>An editor will move it to the <strong>$nextEditorialState</strong> state when it’s time to make it public.",
                    "previousEditorialState": "clean",
                    "nextEditorialState": "published",
                    "actions": ["Dashboard"]
                },
                "published": null,
                "pastVersion": {
                    "text": "<strong>Version $versionNum of this $contentType was in the $editorialState state.</strong><br/>Go to the latest version to see its current state.",
                    "previousEditorialState": null,
                    "nextEditorialState": null,
                    "actions": ["Latest version"]
                }
            },
            "editor": {
                "draft": {
                    "text": "<strong>This $contentType is in the $editorialState state<span class=\"query-msg\"> and has $openQueryCount open queries</span>.</strong><br/>Please wait for the author to submit it for editing.",
                    "previousEditorialState": null,
                    "nextEditorialState": "edit",
                    "actions": ["Dashboard"]
                },
                "edit": {
                    "text": "<strong>This $contentType is in the $editorialState state<span class=\"query-msg\"> and has $openQueryCount open queries</span>.</strong><br/>You can review it, make changes, and add queries for the author.",
                    "previousEditorialState": "draft",
                    "nextEditorialState": "editreview",
                    "actions": ["Edit $contentType","Dashboard"]
                },
                "editreview": {
                    "text": "<strong>This $contentType is in the $editorialState state<span class=\"query-msg\"> and has $openQueryCount open queries</span>.</strong><br/>Once an author moves it to the <strong>$nextEditorialState</strong> state, you can do your final review on it.",
                    "previousEditorialState": "edit",
                    "nextEditorialState": "clean",
                    "actions": ["Dashboard"]
                },
                "clean": {
                    "text": "<strong>This $contentType is in the $editorialState state<span class=\"query-msg\"> and has $openQueryCount open queries</span>.</strong><br/>Do your final review on the content and move it back to the <strong>$previousEditorialState</strong> state if it requires further changes, or to the <strong>$nextEditorialState</strong> state for publication.",
                    "previousEditorialState": "editreview",
                    "nextEditorialState": "ready",
                    "actions": ["Edit $contentType","Dashboard"]
                },
                "ready": {
                    "text": "<strong>This $contentType is in the $editorialState state<span class=\"query-msg\"> and has $openQueryCount open queries</span>.</strong><br/>Move it to the <strong>$nextEditorialState</strong> state to make it publicly available.",
                    "previousEditorialState": "clean",
                    "nextEditorialState": "published",
                    "actions": ["Dashboard"]
                },
                "published": null,
                "pastVersion": {
                    "text": "<strong>Version $versionNum of this $contentType was in the $editorialState state.</strong><br/>Go to the latest version to see its current state.",
                    "previousEditorialState": null,
                    "nextEditorialState": null,
                    "actions": ["Latest version"]
                }
            }
        }
        base.editorialState = base.editorialStates['none'];
        if (base.editorialWorkflowEnabled) {
            if($('header span.metadata[property="scalar:editorialState"]').length > 0){
                base.editorialState = base.editorialStates[$('header span.metadata[property="scalar:editorialState"]').text()];
            }else{
                base.editorialState = base.editorialStates["draft"];
            }
        }
        // Add a reverse reference to the DOM object
        base.$el.data("scalarheader", base);

        base.init = function(){
            base.dataType = scalarapi.getFileExtension(window.location.href);
            if(['edit','versions','history','meta','annotation_editor','manage_lenses'].indexOf(base.dataType)===-1){
              base.dataType = 'normal';
            }
            //Replace undefined options with defaults...
            base.options = $.extend({},$.scalarheader.defaultOptions, options);
            //Are we logged in? Check the RDF metadata.
            base.logged_in = $('link#logged_in').length > 0 && $('link#logged_in').attr('href')!='';

            base.currentNode = scalarapi.model.getCurrentPageNode();

            base.userId = 'unknown';
            if(base.logged_in){
                //While we are logged in, check what our user level is, and set the appropriate bools
                base.is_author = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Author';
                base.is_commentator = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Commentator';
                base.is_reviewer = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Reviewer';
                base.is_editor = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Editor';
                base.is_reader = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Reader';
                let temp = $('link#logged_in').attr('href').split('/');
                base.userId = parseInt(temp[temp.length - 1]);

                if(base.is_author || base.is_commentator || base.is_reviewer || base.is_editor){
                     base.$el.addClass('edit_enabled');
                }
            }
            base.isEditorialPathPage =  $('.editorialpath-page>#editorialPath').length > 0;
            base.okToAdd = (base.is_author || base.is_commentator);
            base.okToDelete = (base.is_author || base.is_commentator) && (base.editorialState != base.editorialStates['edit']) && (base.editorialState != base.editorialStates['clean']) && (base.editorialState != base.editorialStates['published']);
            base.okToCopyEdit = (((base.is_author || base.is_commentator) && (base.editorialState != base.editorialStates['edit']) && (base.editorialState != base.editorialStates['clean']) && (base.editorialState != base.editorialStates['ready'])) || (base.is_editor && ((base.editorialState != base.editorialStates['draft']) && (base.editorialState != base.editorialStates['editreview']) && (base.editorialState != base.editorialStates['ready']))));

            //We should also grab the book ID from the RDF stuff
            base.bookId = parseInt($('link#book_id').attr('href'));

            base.parent = $('link#parent').attr('href');

            //We need some wrapper classes for Bootstrap, so we'll add those here. There are also some helper classes as well.
            base.$el.addClass('text-uppercase heading_font navbar navbar-inverse navbar-fixed-top').attr('id','scalarheader');

            if(base.usingHypothesis){
                base.$el.addClass('hypothesis_active');
            }

            //Store the home URL so that we can use these later without making extra queries on the DOM
            var home_url = base.$el.find('#book-title').attr("href");

            //Book URL and Home URL (the latter can simply be the Book URL, since it will redirect to /index)
            var book_url = home_url = $('link#parent').attr('href');

            var index_url = book_url.slice(0,-1);
            index_url = index_url.substr(0, index_url.lastIndexOf('/'))+'/';

            //We might not have the current page loaded, but we can still get the slug; strip the book URL and the GET params from the current URL
            base.current_slug = window.location.href.split("?")[0].split("#")[0].replace(book_url,'');

            //Pop the title link DOM element off for a minute - we'll use this again later on.
            var title_link = base.$el.find('#book-title').addClass('navbar-link').detach().attr('id','').addClass('book-title');
            //Handle the internal structure of the navbar now.
            var navbar_html  =  '<div class="container-fluid">'+
                                    '<div class="navbar-header">'+
                                        '<span class="navbar-text navbar-left pull-left title_wrapper visible-xs"></span>'+
                                        '<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#ScalarHeaderMenu">'+
                                            '<span class="sr-only">Toggle navigation</span>'+
                                            '<span class="icon-bar"></span>'+
                                            '<span class="icon-bar"></span>'+
                                            '<span class="icon-bar"></span>'+
                                        '</button>'+
                                    '</div>'+
                                    '<div class="collapse navbar-collapse" id="ScalarHeaderMenu">'+
                                         '<ul class="nav navbar-nav" id="ScalarHeaderMenuLeft">'+
                                            '<li class="visible-xs">'+
                                                '<a href="'+base.get_param(addTemplateToURL( title_link.attr("href"), 'cantaloupe'))+'" class="headerIcon" id="homeLink">'+
                                                    '<span class="visible-xs">Home Page</span>'+
                                                '</a>'+
                                            '</li>'+
                                            '<li class="dropdown mainMenu">'+
                                                '<a class="dropdown-toggle headerIcon" data-toggle="dropdown" role="menuitem" aria-expanded="false">'+
                                                    '<span class="visible-xs">Table of Contents</span>'+
                                                '</a>'+
                                                '<ul class="dropdown-menu mainMenuDropdown" role="menu">'+
                                                    '<div id="mainMenuInside">'+
                                                        '<div class="close"><span class="menuIcon closeIcon"></span></div>'+
                                                        '<li class="header"><h2>Table of Contents</h2></li>'+
                                                        '<li class="top hidden-xs home_link static">'+
                                                            '<a href="'+base.get_param(home_url)+'"><span class="menuIcon" id="homeIcon"></span>Home</a>'+
                                                        '</li>'+
                                                        '<li class="body">'+
                                                            '<ol>'+
                                                            '</ol>'+
                                                        '</li>'+
                                                        '<li class="bottom index_link static dropdown" id="indexLink">'+
                                                            '<a role="menuitem"><span class="menuIcon" id="indexIcon"></span>Index</a>'+
                                                        '</li>'+
                                                    '</div>'+
                                                    '<div id="mainMenuSubmenus" class="tocMenu"></div>'+
                                                '</ul>'+
                                            '</li>'+
                                            '<li class="dropdown" id="navMenu">'+
                                                '<a class="dropdown-toggle headerIcon" data-toggle="dropdown" role="menuitem" aria-expanded="false" id="wayfindingIcon">'+
                                                    '<span class="visible-xs">Wayfinding</span>'+
                                                '</a>'+
                                                '<ul class="dropdown-menu" role="menu">'+
                                                    '<li id="recent_menu" class="dropdown">'+
                                                        '<a role="menuitem" aria-expanded="false"><span class="menuIcon rightArrowIcon pull-right"></span><span class="menuIcon" id="recentIcon"></span>Recent</a>'+
                                                        '<ul class="dropdown-menu" role="menu">'+
                                                            '<li><i class="loader"></i></li>'+
                                                        '</ul>'+
                                                    '</li>'+
                                                    '<li id="lenses_menu" class="dropdown">'+
                                                        '<a role="menuitem" aria-expanded="false"><span class="menuIcon rightArrowIcon pull-right"></span><span class="menuIcon" id="lensIcon"></span>Lenses</a>'+
                                                        '<ul class="dropdown-menu" role="menu">'+
                                                        '</ul>'+
                                                    '</li>'+
                                                    '<li id="vis_menu" class="dropdown">'+
                                                        '<a role="menuitem" aria-expanded="false"><span class="menuIcon rightArrowIcon pull-right"></span><span class="menuIcon" id="visIcon"></span>Visualizations</a>'+
                                                        '<ul class="dropdown-menu" role="menu">'+
                                                            '<li class="vis_link" data-vistype="viscurrent"><a role="menuitem"><span class="menuIcon" id="currentIcon"></span> Current</a></li>'+
                                                            '<li class="vis_link" data-vistype="vistoc"><a role="menuitem"><span class="menuIcon" id="tocIcon"></span> Contents</a></li>'+
                                                            '<li class="vis_link" data-vistype="visconnections"><a role="menuitem"><span class="menuIcon" id="connectionsIcon"></span> Connections</a></li>'+
                                                            '<li class="vis_link" data-vistype="visindex"><a role="menuitem"><span class="menuIcon" id="gridIcon"></span> Grid</a></li>'+
                                                            '<li class="vis_link" data-vistype="vismap"><a role="menuitem"><span class="menuIcon" id="mapIcon"></span> Map</a></li>'+
                                                            '<li class="vis_link" data-vistype="visradial"><a role="menuitem"><span class="menuIcon" id="radialIcon"></span> Radial</a></li>'+
                                                            '<li class="vis_link" data-vistype="vispath"><a role="menuitem"><span class="menuIcon" id="pathIcon"></span> Path</a></li>'+
                                                            '<li class="vis_link" data-vistype="vismedia"><a role="menuitem"><span class="menuIcon" id="mediaIcon"></span> Media</a></li>'+
                                                            '<li class="vis_link" data-vistype="vistag"><a role="menuitem"><span class="menuIcon" id="tagIcon"></span> Tag</a></li>'+
                                                            '<li class="vis_link" data-vistype="viswordcloud"><a role="menuitem"><span class="menuIcon" id="wordCloudIcon"></span> Word Cloud</a></li>'+
                                                        '</ul>'+
                                                    '</li>'+
                                                    '<li id="scalar_menu" class="dropdown">'+
                                                        '<a role="menuitem" aria-expanded="false"><span class="menuIcon rightArrowIcon pull-right"></span><span class="menuIcon" id="scalarIcon"></span>Scalar</a>'+
                                                        '<ul class="dropdown-menu" role="menu">'+
                                                            '<li><a role="menuitem" href="http://scalar.usc.edu/">About Scalar</a></li>'+
                                                            '<li><a role="menuitem" href="http://scalar.usc.edu/works/guide2" target="_scalar">User\'s Guide</a></li>'+
                                                            '<li><a role="menuitem" href="'+base.get_param(index_url)+'">More Scalar Projects</a></li>'+
                                                        '</ul>'+
                                                    '</li>'+
                                                '</ul>'+
                                            '</li>'+
                                        '</ul>'+
                                        '<span class="navbar-text navbar-left pull-left title_wrapper hidden-xs" id="desktopTitleWrapper"><span class="hidden-xs author_text"><span id="header_authors" data-placement="bottom"></span></span></span>'+
                                        '<ul class="nav navbar-nav navbar-right" id="ScalarHeaderMenuRight">'+
                                            '<li class="" id="ScalarHeaderMenuSearch">'+
                                                '<a class="headerIcon" id="searchIcon" title="Search button. Click to open search field.">'+
                                                    '<span class="visible-xs">Search Book</span>'+
                                                '</a>'+
                                            '</li>'+
                                            '<li id="ScalarHeaderMenuSearchForm">'+
                                                '<form class="navbar-form" role="search" action="./">'+
                                                    '<div class="form-group">'+
                                                        '<input title="Search this book" type="text" class="form-control" placeholder="Search this book...">'+
                                                        '<input type="submit" class="hidden_submit" value="Search">'+
                                                    '</div>'+
                                                  '</form>'+
                                            '</li>'+
                                            /*
                                            '<li id="ScalarHeaderVisualization" class="hidden-xs">'+
                                                '<a class="headerIcon">'+
                                                    '<img src="' + base.options.root_url + '/images/visualization_icon.png" alt="Visualization button. Click to toggle visualization showing current position."/>'+
                                                '</a>'+
                                            '</li>'+
                                            */
                                            '<li id="ScalarHeaderHelp">'+
                                                '<a class="headerIcon" id="helpIcon" title="Help button. Click to toggle help info."><span class="hidden-sm hidden-md hidden-lg">Help</span></a>'+
                                            '</li>'+
                                            (base.okToAdd?
                                                '<li id="ScalarHeaderNew"><a class="headerIcon" href="' + base.get_param(scalarapi.model.urlPrefix + 'new.edit')+'" id="newIcon" title="New page button. Click to create a new page."><span class="visible-xs">New page</span></a></li>'
                                                :'')+
                                            (base.okToCopyEdit&&!base.isEditorialPathPage?
                                                '<li id="ScalarHeaderEdit"><a class="headerIcon" href="' + scalarapi.stripEdition(base.get_param(scalarapi.model.urlPrefix + base.current_slug + '.edit')) + '" id="editIcon" title="Edit button. Click to edit the current page or media."><span class="visible-xs">Edit page</span></a></li>'
                                                :'')+
                                            (base.okToAdd?
                                                ((base.currentNode!=null && base.currentNode.hasScalarType( 'media' ))?'<li id="ScalarHeaderAnnotate" class="hidden-xs"><a class="headerIcon" href="' + base.get_param(scalarapi.model.urlPrefix + scalarapi.basepath( window.location.href ) + '.annotation_editor')+'" id="annotateIcon" title="Annotate button. Click to annotate the current media."><span class="visible-xs">Annotate media</span></a></li>':'')
                                                :'')+
                                            (base.is_author?
                                                '<li class="dropdown" id="ScalarHeaderImport" class="hidden-xs">'+
                                                    '<a class="dropdown-toggle headerIcon" data-toggle="dropdown" role="menuitem" aria-expanded="false" id="importIcon" title="Import menu. Roll over to show import options.">'+
                                                        '<span class="visible-xs">Import</span>'+
                                                    '</a>'+
                                                    '<ul class="dropdown-menu" role="menu" id="ScalarHeaderMenuImportList">'+
                                                        '<li class="dropdown">'+
                                                            '<a role="menuitem" aria-expanded="false"><span class="menuIcon rightArrowIcon pull-right"></span>Affiliated archives</a>'+
                                                            '<ul class="dropdown-menu affiliated-archives" role="menu">'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/critical_commons') + '">Critical Commons</a></li>'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/internet_archive') + '">Internet Archive</a></li>'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/shoah_foundation_vha_online') + '">Shoah Foundation VHA Online</a></li>'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/shoah_foundation_vha') + '">Shoah Foundation VHA (partner site)</a></li>'+
                                                            '</ul>'+
                                                        '</li>'+
                                                        '<li class="dropdown">'+
                                                            '<a role="menuitem" aria-expanded="false"><span class="menuIcon rightArrowIcon pull-right"></span>Other archives</a>'+
                                                            '<ul class="dropdown-menu other-archives" role="menu">'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/omeka') + '">Omeka sites</a></li>'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/omeka_s') + '">Omeka S sites</a></li>'+
                                                                /*'<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/soundcloud') + '">SoundCloud</a></li>'+*/
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/youtube') + '">YouTube</a></li>'+
                                                                '<li id="import-harvard"><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/harvard_art_museums') + '">Harvard Art Museums</a></li>'+
                                                            '</ul>'+
                                                        '</li>'+
                                                        '<li class="dropdown">'+
                                                        	'<a role="menuitem" aria-expanded="false"><span class="menuIcon rightArrowIcon pull-right"></span>Files and URLs</a>'+
                                                        	'<ul class="dropdown-menu files-and-urls" role="menu">'+
		                                                        '<li class="dropdown">'+
		                                                            '<a role="menuitem" href="' + base.get_param(scalarapi.model.urlPrefix + 'upload') + '">Upload media files</a>'+
		                                                        '</li>'+
		                                                        '<li class="dropdown">'+
		                                                            '<a role="menuitem" href="' + base.get_param(scalarapi.model.urlPrefix + 'new.edit?type=media&') + '">Link to media files</a>'+
		                                                        '</li>'+
		                                                        /*
		                                                        '<li class="dropdown">'+
	                                                        		'<a role="menuitem" href="' + base.get_param(scalarapi.model.urlPrefix + 'criticalcommons') + '">Upload to Critical Commons</a>'+
	                                                        	'</li>'+
	                                                        	*/
	                                                        '</ul>'+
	                                                     '</li>'+
                                                    '</ul>'+
                                                '</li>'
                                                :'')+
                                            ((base.is_author||base.is_editor)?
                                                (base.okToDelete&&!base.isEditorialPathPage&&base.currentNode!=null?'<li id="ScalarHeaderDelete"><a class="headerIcon" id="deleteIcon" title="Delete"><span class="visible-xs">Delete page</span></a></li>':'')+
                                                (base.editorialWorkflowEnabled&&!base.isEditorialPathPage&&scalarapi.getEdition(document.location.href) == -1?'<li id="ScalarHeaderEditorialPath"><a href="' + base.get_param(scalarapi.model.urlPrefix + 'editorialpath') + '" class="headerIcon" id="editorialPathIcon" title="Editorial path. Click to access the editorial path for this book."><span class="hidden-sm hidden-md hidden-lg">Editorial path</span></a></li>':'')+
                                                ('<li id="ScalarHeaderOptions"><a href="' + system_uri + '/dashboard?book_id=' + base.bookId + '&zone=style#tabs-style" class="headerIcon" id="optionsIcon" title="Options button. Click to access the Dashboard."><span class="hidden-sm hidden-md hidden-lg">Dashboard</span></a></li>')
                                            :'')+
                                            '<li class="dropdown" id="userMenu">'+
                                                '<a class="dropdown-toggle headerIcon" data-toggle="dropdown" role="menuitem" aria-expanded="false" id="userIcon" title="User menu. Roll over to show account options.">'+
                                                    '<span class="visible-xs">User</span>'+
                                                '</a>'+
                                                '<ul class="dropdown-menu" role="menu" id="ScalarHeaderMenuUserList">'+
                                                '</ul>'+
                                            '</li>'+
                                        '</ul>'+
                                    '</div>'+
                                '</div>';
            base.mobileTOCMenu = $('<div id="mobileMainMenuSubmenus" class="heading_font tocMenu"><div class="toc"><header class="mainMenu"><a class="headerIcon"><span class="visible-xs">Table of Contents</span></a></header><footer><div class="footer_content"><button class="btn back text-center"><img src="' + $('link#approot').attr('href') + 'views/melons/cantaloupe/images/back_icon.png" width="30" alt="Go back"/></button><button class="btn close_menu text-center"><img src="' + $('link#approot').attr('href') + 'views/melons/cantaloupe/images/close_menu_icon.png" width="30" alt="Close all submenus"/></span></button></div></footer></div><div class="pages"></div></div>').appendTo('body');
            base.mobileTOCMenu.find('.close_menu, header>a').on('click', function(e){
                $('#mobileMainMenuSubmenus').removeClass('active');
                $('.mainMenuDropdown, #ScalarHeaderMenu').css({
                    'transform' : 'translateX(0px)',
                    '-webkit-transform' : 'translateX(0px)',
                    '-moz-transform' : 'translateX(0px)',
                    'position': ''
                });
                setTimeout(function(){
                    $('#mobileMainMenuSubmenus').find('.expandedPage').remove();
                },500);
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
            base.$el.on('hide.bs.collapse',function(){
                if($('#mobileMainMenuSubmenus').hasClass('active')){
                    $('#mobileMainMenuSubmenus').removeClass('active');
                    $('.mainMenuDropdown, #ScalarHeaderMenu').css({
                        'transform' : 'translateX(0px)',
                        '-webkit-transform' : 'translateX(0px)',
                        '-moz-transform' : 'translateX(0px)',
                        'position': ''
                    });
                    setTimeout(function(){
                        $('#mobileMainMenuSubmenus').find('.expandedPage').remove();
                    },500);
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }).on('mouseover', function(e){
                $(this).removeClass('short');
                $('body').removeClass('shortHeader').trigger('headerSizeChanged');
            });

            //Convert our navbar html into a jquery element
            var navbar = $(navbar_html);

            // Any custom menu items?
            if ('undefined' != typeof(customScalarHeaderMenuLeftItems) && Array.isArray(customScalarHeaderMenuLeftItems)) {
            	for (var c = 0; c < customScalarHeaderMenuLeftItems.length; c++) {
            		customnavbaritem = $('<li class="customMenuItem">'+customScalarHeaderMenuLeftItems[c]+'</li>');
            		navbar.find('#ScalarHeaderMenuLeft').append(customnavbaritem);
            	}
            }

            // remove import options with missing keys
            if (!$('link#harvard_art_museums_key').attr('href')) {
              navbar.find('#import-harvard').remove();
            }

            // Any Airtables?
            var $airtables = $('link#airtable');
            if ($airtables.length) {
            	for (var j = 0; j < $airtables.length; j++) {
            		navbar.find('#ScalarHeaderMenuImportList').find('ul.other-archives').append('<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/airtable/'+encodeURIComponent($airtables.eq(j).attr('href'))) + '">Airtable: '+$airtables.eq(j).attr('href')+'</a></li>');
            	}
            }

            //We don't always want all of the edit buttons for alternate data
            //type requests (ex: meta or versions) - remove these as necessary

            var remove_edit_icons = [];
            if(['edit','versions','history','annotation_editor','manage_lenses'].indexOf(base.dataType)!==-1){
              remove_edit_icons.push('#ScalarHeaderAnnotate');
            }
            if(['edit','versions','history','annotation_editor','manage_lenses'].indexOf(base.dataType)!==-1){
              remove_edit_icons.push('#ScalarHeaderEdit');
            }
            if(['versions','history','annotation_editor','manage_lenses'].indexOf(base.dataType)!==-1){
              remove_edit_icons.push('#ScalarHeaderDelete');
            }

            //Join the IDs of the edit icons to be removed and strip them from the navbar
            navbar.find(remove_edit_icons.join(', ')).remove();

            base.$el.append(navbar).find('.title_wrapper').prepend(title_link.clone());

            base.$el.find('.mainMenu').on('show.bs.dropdown',function(e){
                $(this).find('.body>ol>li').each(function(){
                    var height = $(this).find('a').first().height()+'px';
                    $(this).add($(this).find('.expand')).css({
                        'height' : height
                    });
                });
                if(!base.usingMobileView){
                    var containerHeight = $('#mainMenuInside').height() + 50;
                    var max_height = $(window).height()-50;
                    if(containerHeight >= max_height){
                        $('#mainMenuInside').css('max-height',max_height+'px').addClass('tall');
                    }
                }
            }).children('.dropdown-menu').on('click', function(e){
                e.stopPropagation();
            });

            base.$el.find('.mainMenu>a.dropdown-toggle').on('click', function(e){
                $(this).parent('.mainMenu').addClass('open').trigger('show.bs.dropdown');
                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            base.$el.find('#ScalarHeaderMenuLeft .mainMenu').on('hide.bs.dropdown',function(){
                if(base.usingMobileView || $('#mainMenuSubmenus .expandedPage').length == 0){
                    $('body').removeClass('in_menu'); //.css('margin-top','0px').scrollTop($('body').data('scrollTop'));
                    $(this).find('li.active').removeClass('active');
                     $('#mainMenuInside').css('max-height','').removeClass('tall');
                    return true;
                }else{
                    $(this).addClass('open');
                    return false;
                }
            });
            base.$el.find('.mainMenuDropdown>#mainMenuInside>.close').on('click', function(e){
                $('#mainMenuSubmenus').hide().find('.expandedPage').remove();
                base.$el.find('#ScalarHeaderMenuLeft .mainMenu').removeClass('open').trigger('hide.bs.dropdown');
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
            base.$el.find('#ScalarHeaderMenuLeft>li.dropdown, #ScalarHeaderMenuRight>li.dropdown').on('mouseenter', function(e){
                var base = $('#scalarheader.navbar').data('scalarheader');
                if(!base.usingMobileView){
                    if(!$(this).hasClass('mainMenu') && $('#mainMenuSubmenus .expandedPage').length > 0){
                        $('#mainMenuSubmenus .expandedPage').remove();
                        $('#mainMenusSubmenus').hide();
                        base.$el.find('#ScalarHeaderMenuLeft .mainMenu').removeClass('open').trigger('hide.bs.dropdown');
                    }else if($('#mainMenuSubmenus .expandedPage').length == 0){
                        $('.mainMenuDropdown, #ScalarHeaderMenu').css({
                            'transform' : 'translateX(0px)',
                            '-webkit-transform' : 'translateX(0px)',
                            '-moz-transform' : 'translateX(0px)'
                        }).removeClass('expandedMenuOpen');
                    }
                    $(this).addClass('open').trigger('show.bs.dropdown');
                }
            }).on('mouseleave', function(e){
            	// TODO: this is the area that is causing Win10 touch problems ~Craig
                var base = $('#scalarheader.navbar').data('scalarheader');
                if(!base.usingMobileView){
                    $(this).removeClass('open').trigger('hide.bs.dropdown');
                }
            }).on('keydown', function(e){
                if(e.which == 27){
                    var subdropdowns_open = $(this).find('li.dropdown.open');
                    if(subdropdowns_open.length > 0){
                        subdropdowns_open.removeClass('open').trigger('hide.bs.dropdown');
                        subdropdowns_open.first().children('a').trigger('focus');
                    }else{
                        $(this).removeClass('open').trigger('hide.bs.dropdown');
                        $(this).children('a').trigger('focus');
                    }
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                }
            }).find("ul.dropdown-menu li.dropdown").on('mouseenter', function(e){
                var base = $('#scalarheader.navbar').data('scalarheader');
                if(!base.usingMobileView){

                    var timeout = $(this).data('hoverEvent');
                    if($(this).data('hoverEvent')!=null){
                        clearTimeout($(this).data('hoverEvent'));
                        $(this).data('hoverEvent',null);
                    }

                    $(this).siblings('li.open').each(function(){
                        var timeout = $(this).data('hoverEvent');
                        if($(this).data('hoverEvent')!=null){
                            clearTimeout($(this).data('hoverEvent'));
                            $(this).data('hoverEvent',null);
                            $(this).removeClass('open').trigger('hide.bs.dropdown');
                        }
                    });

                    base.initSubmenus(this);
                }
            }).on('mouseleave', function(e){
                var base = $('#scalarheader.navbar').data('scalarheader');
                if(!base.usingMobileView){
                    $(this).data('hoverEvent',setTimeout($.proxy(function(){
                        $(this).removeClass('open').trigger('hide.bs.dropdown');
                    },$(this)),200));
                }else{
                    return true;
                }
            }).on('hide.bs.dropdown',function(e){
                e.stopPropagation();
            }).on('keydown', function(e){
                var base = $('#scalarheader.navbar').data('scalarheader');
                if($(this).children('a').first().is(':focus') && !base.usingMobileView){
                    if(e.which == 38){
                        //up
                        $(this).prev().children('a').trigger('focus');
                        e.stopPropagation();
                        return false;
                    }else if(e.which == 40){
                        //down
                        $(this).next().children('a').trigger('focus');
                        e.stopPropagation();
                        return false;
                    }
                }
            }).children('a').on('click', function(e){
                var base = $('#scalarheader.navbar').data('scalarheader');
                if(!$(this).hasClass('expand') && (typeof $(this).attr('href') == 'undefined' || $(this).attr('href') == '')){
                    base.initSubmenus(this);
                    e.preventDefault();
                    return false;
                }
            }).on('keyup', function(e){
                var base = $('#scalarheader.navbar').data('scalarheader');
                if(!base.usingMobileView){
                    if(e.which == 39 || e.which == 13 || e.which == 32){
                        base.initSubmenus($(this).parent());
                        e.stopPropagation();
                        return false;
                    }
                }
            })

            //Handle the book index...
            var indexElement = $( '<div></div>' ).prependTo( 'body' );
            base.index = indexElement.scalarindex( {} );
            base.$el.find('.index_link a').on('click', function(e){
                $('#scalarheader.navbar').data('scalarheader').index.data('plugin_scalarindex').showIndex();
            });

            //Handle the visualizations...
            var visElement = $( '<div></div>' ).prependTo( 'body' );
            base.vis = visElement.scalarvis( { modal: true, local: false } );
            base.$el.find('.vis_link').on('click', function(e){

                var options = {
                  modal: true
                }

                switch ( $( this ).attr( 'data-vistype' ) ) {

                    case "visconnections":
                    options.content = 'lens';
                    options.lens = {
                      "visualization": {
                        "type": "force-directed",
                        "options": {}
                      },
                      "components": [
                        {
                          "content-selector": {
                            "type": "items-by-type",
                            "content-type": "all-content"
                          },
                          "modifiers": [{
                              "type": "filter",
                              "subtype": "relationship",
                              "content-types": [
                                  "all-types"
                              ],
                              "relationship": "any-relationship"
                          }]
                        }
                      ],
                      "sorts": []
                    }
                    break;

                    case "vistoc":
                    options.content = 'lens';
                    options.lens = {
                      "visualization": {
                        "type": "tree",
                        "options": {}
                      },
                      "components": [
                        {
                          "content-selector": {
                            "type": "items-by-type",
                            "content-type": "table-of-contents"
                          },
                          "modifiers": [{
                              "type": "filter",
                              "subtype": "relationship",
                              "content-types": [
                                  "all-types"
                              ],
                              "relationship": "child"
                          }]
                        },
                        {
                          "content-selector": {
                            "type": "items-by-type",
                            "content-type": "all-content"
                          },
                          "modifiers": []
                        }
                      ],
                      "sorts": []
                    }
                    break;

                    case "vis":
                    case "visindex":
                    options.content = 'lens';
                    options.lens = {
                      "visualization": {
                        "type": "grid",
                        "options": {}
                      },
                      "components": [
                        {
                          "content-selector": {
                            "type": "items-by-type",
                            "content-type": "all-content"
                          },
                          "modifiers": [
                            {
                              "type": "filter",
                              "subtype": "relationship",
                              "content-types": [
                                  "all-types"
                              ],
                              "relationship": "any-relationship"
                            }
                          ]
                        }
                      ],
                      "sorts": []
                    }
                    break;

                    case "visradial":
                    options.content = 'lens';
                    options.lens = {
                      "visualization": {
                        "type": "radial",
                        "options": {}
                      },
                      "components": [
                        {
                          "content-selector": {
                            "type": "items-by-type",
                            "content-type": "all-content"
                          },
                          "modifiers": [{
                              "type": "filter",
                              "subtype": "relationship",
                              "content-types": [
                                  "all-types"
                              ],
                              "relationship": "any-relationship"
                          }]
                        }
                      ],
                      "sorts": []
                    }
                    break;

                    case "vismap":
                    options.content = 'lens';
                    options.lens = {
                      "visualization": {
                        "type": "map",
                        "options": {}
                      },
                      "components": [
                        {
                          "content-selector": {
                            "type": "items-by-type",
                            "content-type": "all-content"
                          },
                          "modifiers": []
                        }
                      ],
                      "sorts": []
                    }
                    break;

                    case "viswordcloud":
                    options.content = 'lens';
                    options.lens = {
                      "visualization": {
                        "type": "word-cloud",
                        "options": {}
                      },
                      "components": [
                        {
                          "content-selector": {
                            "type": "items-by-type",
                            "content-type": "page"
                          },
                          "modifiers": []
                        }
                      ],
                      "sorts": []
                    }
                    break;

                    case "vispath":
                    options.content = 'lens';
                    options.lens = {
                      "visualization": {
                        "type": "tree",
                        "options": {}
                      },
                      "components": [
                        {
                          "content-selector": {
                            "type": "items-by-type",
                            "content-type": "path"
                          },
                          "modifiers": [
                            {
                              "type": "filter",
                              "subtype": "relationship",
                              "content-types": [
                                "path"
                              ],
                              "relationship": "child"
                            },
                            {
                              "type": "filter",
                              "subtype": "relationship",
                              "content-types": [
                                "path"
                              ],
                              "relationship": "child"
                            }
                          ]
                        }
                      ],
                      "sorts": []
                    }
                    break;

                    case "vismedia":
                    options.content = 'lens';
                    options.lens = {
                      "visualization": {
                        "type": "force-directed",
                        "options": {}
                      },
                      "components": [
                        {
                          "content-selector": {
                            "type": "items-by-type",
                            "content-type": "media"
                          },
                          "modifiers": [
                            {
                              "type": "filter",
                              "subtype": "relationship",
                              "content-types": [
                                "reference"
                              ],
                              "relationship": "any-relationship"
                            }
                          ]
                        }
                      ],
                      "sorts": []
                    }
                    break;

                    case "vistag":
                    options.content = 'lens';
                    options.lens = {
                      "visualization": {
                        "type": "force-directed",
                        "options": {}
                      },
                      "components": [
                        {
                          "content-selector": {
                            "type": "items-by-type",
                            "content-type": "tag"
                          },
                          "modifiers": [
                            {
                              "type": "filter",
                              "subtype": "relationship",
                              "content-types": [
                                "tag"
                              ],
                              "relationship": "child"
                            },
                            {
                              "type": "filter",
                              "subtype": "relationship",
                              "content-types": [
                                "path"
                              ],
                              "relationship": "child"
                            }
                          ]
                        }
                      ],
                      "sorts": []
                    }
                    break;

                    case "viscurrent":
                    options.content = 'lens';
                    options.lens = {
                      "visualization": {
                        "type": "force-directed",
                        "options": {}
                      },
                      "components": [
                        {
                          "content-selector": {
                            "type": "specific-items",
                            "items": []
                          },
                          "modifiers": [
                            {
                              "type": "filter",
                              "subtype": "relationship",
                              "content-types": ["all-types"],
                              "relationship": "any-relationship"
                            }
                          ]
                        }
                      ],
                      "sorts": []
                    }
                    if (base.currentNode) {
                      options.lens.components[0]['content-selector'].items.push(base.currentNode.slug);
                    }
                    break;
                }
                $( '.modalVisualization' ).data( 'scalarvis' ).showModal( options );
            });

            base.book_id = $('link#book_id').attr('href');

            base.buildUserMenu(base.$el.find('#ScalarHeaderMenuUserList'));

            navbar.find('#header_authors').html(getAuthorCredit());

            var helpElement = $('<div></div>').appendTo('body');
            base.help = $( helpElement ).scalarhelp( { root_url: modules_uri + '/cantaloupe' } );

            $('body').on('click', function(e){
                var base = $('#scalarheader.navbar').data('scalarheader');
                if(!base.usingMobileView){
                    $('#mainMenuSubmenus').hide().find('.expandedPage').remove();
                    base.$el.find('#ScalarHeaderMenuLeft .mainMenu').removeClass('open').trigger('hide.bs.dropdown');
                }
            }).on('pageLoadComplete',function(){
              $('#desktopTitleWrapper').trigger("update");
            });

            $('body').on('lensUpdated', base.getLensData);
            base.getLensData();

            $( '#ScalarHeaderHelp>a' ).on('click', function(e) {
                base.help.data( 'plugin_scalarhelp' ).toggleHelp();
                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            $( '#ScalarHeaderVisualization>a' ).on('click', function(e) {
                if (state != ViewState.Navigating) {
                    setState(ViewState.Navigating);
                } else {
                    setState(ViewState.Reading);
                }
                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            $('#ScalarHeaderMenuSearch a').on('click', function(e){
                if(base.isMobile || base.$el.find('.navbar-toggle').is(':visible')){
                    $('#ScalarHeaderMenuSearch').toggleClass('search_open');
                    $('#ScalarHeaderMenuSearchForm').toggleClass('open');
                }else{
                    if($('#ScalarHeaderMenuSearch').hasClass('search_open')){
                        $('#ScalarHeaderMenuSearchForm').animate({
                            "width" : "0px"
                        },{
                            "duration" : 250,
                            "step" : function(){
                                base.handleResize();
                                $('.navbar-header .title_wrapper, #ScalarHeaderMenuSearch').hide().show(0);
                            },
                            "complete" : function(){
                                $('#ScalarHeaderMenuSearch').removeClass('search_open');
                                base.handleResize();
                            },
                        });
                    }else{
                        $('#ScalarHeaderMenuSearch').addClass('search_open');
                        base.handleResize(190);
                        $('#ScalarHeaderMenuSearchForm').animate({
                            "width" : "190px"
                        },{
                            "duration" : 250,
                            "step" : function(){
                                $('.navbar-header .title_wrapper, #ScalarHeaderMenuSearch').hide().show(0);
                            },
                            "complete" : function(){
                                base.handleResize();
                            }
                        });
                        $('#ScalarHeaderMenuSearchForm input').first().val('').trigger('focus').on('blur', function(e){
                            if($('#ScalarHeaderMenuSearch').hasClass('search_open')){
                                $('#ScalarHeaderMenuSearch a').trigger('click');
                            }
                            $(this).off('blur');
                        });

                    }
                }

                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            base.$el.find('.navbar-toggle').on('click', function(){
                $(this).parents('nav').toggleClass('in');
            });

            var searchElement = $('<div></div>').appendTo('body');
            base.search = searchElement.scalarsearch( { root_url: modules_uri+'/cantaloupe'} );

            $('#ScalarHeaderMenuSearchForm form').on('submit', function(e) {
                if($('#ScalarHeaderMenuSearchForm form input').val() != ''){
                    var base = $('#scalarheader.navbar').data('scalarheader');
                    base.search.data('plugin_scalarsearch').doSearch($('#ScalarHeaderMenuSearchForm form input').first().val());
                    if(base.isMobile || base.$el.find('.navbar-toggle').is(':visible')){
                        $('#ScalarHeaderMenuSearchForm').removeClass('open');
                    }else{
                        $('#ScalarHeaderMenuSearchForm').css('width','0px');
                    }
                    $('#ScalarHeaderMenuSearch').removeClass('search_open');
                }else{
                    $('#ScalarHeaderMenuSearchForm form input').trigger('focus');
                }

                e.stopPropagation();
                e.preventDefault();
                return false;
            });

            //Check if the current page should be logged in the "recent" menu - if so, do that and then render the menu. Otherwise, just get renderin'
            if(['import','edit'].indexOf($('head>link#view').attr('href')) > -1){
                base.load_recent(base.$el.find('#recent_menu>ul'));
            }else{
                $.when(scalarrecent_log_page()).then(function(){
                    var base = $('#scalarheader.navbar').data('scalarheader');
                    base.load_recent(base.$el.find('#recent_menu>ul'));
                });
            }

            base.$el.find('.dropdown-menu').on('mouseenter', function(){
                if(!base.usingMobileView){
                    var containerHeight = $(this).height() + 50;
                    var max_height = $(window).height()-50;
                    if(containerHeight >= max_height){
                        $(this).css('max-height',max_height+'px').addClass('tall');
                        var offset = $('body').scrollTop();
                        $('body').addClass('in_menu'); //.css('margin-top','-'+offset+'px').data('scrollTop',offset);
                    }
                }
            }).on('mouseleave', function(){
                if($(this).hasClass('tall')){
                    $(this).css('max-height','').removeClass('tall');
                    $('body').removeClass('in_menu'); //.css('margin-top','0px').scrollTop($('body').data('scrollTop'));
                }
            });

            $(window).on('resize', function(){
                var base = $('#scalarheader.navbar').data('scalarheader');
                base.handleResize();
            })
            .on('scroll', function(e){
                var base = $('#scalarheader.navbar').data('scalarheader');
                if ('undefined' == typeof(base)) return;
                if(base.usingMobileView){
                    base.oldScrollTop = 0;
                    base.$el.removeClass('short');
                    $('body').removeClass('shortHeader').trigger('headerSizeChanged');
                }else{
                    var scrollTop = $(this).scrollTop();
                    if(scrollTop >= 50 && scrollTop > base.oldScrollTop && $('#mainMenuSubmenus').find('.expandedPage').length == 0){
                        base.$el.addClass('short');
                        $('body').addClass('shortHeader').trigger('headerSizeChanged');
                    }else{
                        base.$el.removeClass('short');
                        $('body').removeClass('shortHeader').trigger('headerSizeChanged');
                    }
                    base.oldScrollTop = scrollTop;
                }
            });


            base.handleResize();
            base.handleBook(); // we used to bind this to the return of a loadBook call, but now we can call it immediately

            $('body').on('pageLoadComplete',$.proxy(function(){
                var base = this;
                base.$el.find('.title_wrapper.visible-xs .book-title').dotdotdot({
                      ellipsis: '…',
                      wrap: 'letter',
                      height: 50,
                      callback: function(isTruncated, fullText){
                        var mobileTitle = base.$el.find('.title_wrapper.visible-xs');
                        if (isTruncated && !mobileTitle.hasClass('withTooltip')) {
                          var titleHtml = $('#desktopTitleWrapper').text().split('by ');
                          titleHtml = '<strong>'+titleHtml[0]+'</strong> by '+(titleHtml.slice(1).join(' by '));

                          mobileTitle.tooltip({'title':titleHtml,'html':true,'container':'#scalarheader','placement':'bottom','template':'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner caption_font text-left"></div></div>'})
                                     .addClass('withTooltip')
                                     .on('hide.bs.tooltip',function(){
                                       $(this).find('a').removeClass('tooltipVisible');
                                     });
                          mobileTitle.find('a').on('click', function(e){
                            if(!$(this).hasClass('tooltipVisible')){
                              $(this).addClass('tooltipVisible');
                              e.preventDefault();
                              return false;
                            }else{
                              return true;
                            }
                          });
                        }else{
                          mobileTitle.tooltip('destroy').removeClass('withTooltip').find('a').off('click');
                        }
                      }
                    });

                var fullText = base.$el.find('#desktopTitleWrapper').text();
                base.$el.find('#desktopTitleWrapper').dotdotdot({
                  ellipsis: '…',
                  wrap: 'letter',
                  height: 50,
                  callback: function(isTruncated){
                    //Check if author text is overflowed - if so, add a bootstrap tooltip.
                    var base = $('#scalarheader.navbar').data('scalarheader');
                    var desktopTitle = base.$el.find('#desktopTitleWrapper');
                    if (isTruncated && !desktopTitle.hasClass('withTooltip')) {
                      var titleHtml = fullText.split('by ');
                      titleHtml = '<strong>'+titleHtml[0]+'</strong> by '+(titleHtml.slice(1).join(' by '));

                      desktopTitle.tooltip({'title':titleHtml,'html':true,'container':'#scalarheader','placement':'bottom','template':'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner caption_font text-left"></div></div>'}).addClass('withTooltip');
                    }else if(!isTruncated){
                      desktopTitle.tooltip('destroy').removeClass('withTooltip');
                    }
                  }
                }).addClass('overflowCalculated');
            },base));

            if(base.dataType == 'normal' && base.editorialWorkflowEnabled && scalarapi.getEdition(document.location.href) == -1){
                base.setupEditorialBar();
            }

            $('body').trigger('headerCreated');
        };
        base.setupEditorialBar = function() {
            editorialBar = $('<div class="editorial-status-bar caption_font"></div>').prependTo('article');
            if (typeof base.currentNode != 'undefined') {
                var userType = "visitor";
                if (base.is_author) {
                    userType = "author";
                } else if (base.is_editor) {
                    userType = "editor";
                }

                scalarType = base.currentNode.getDominantScalarType('page');
                if (scalarType == null) {
                    scalarType = base.currentNode.getDominantScalarType('media');
                }
                if (scalarType == null) {
                    contentType = 'content';
                } else {
                    contentType = scalarType.singular;
                    if (contentType == 'person') {
                        contentType = 'page';
                    }
                }

                var version = scalarapi.getVersionExtension(window.location.href);

                if (base.editorialBarData[userType] != null) {
                    var editorialBarData;
                    if (version == '') {
                        editorialBarData = base.editorialBarData[userType][base.editorialState.id];
                    } else {
                         editorialBarData = base.editorialBarData[userType]['pastVersion'];
                    }
                    if (editorialBarData != null) {
                        editorialBar.addClass(base.editorialState.id + '-state');

                        // get number of open queries
                        var queryCount = 0;
                        if (base.currentNode.current != null) {
                            if (base.currentNode.current.editorialQueries != null) {
                                var queryData = JSON.parse(base.currentNode.current.editorialQueries);
                                var i = 0;
                                var n = queryData.queries.length;
                                for (i=0; i<n; i++) {
                                    if (!queryData.queries[i].resolved) {
                                        queryCount++;
                                    }
                                }
                            }
                        }

                        // text
                        var text = editorialBarData.text;
                        text = text.replace('$contentType', contentType);
                        text = text.replace('$versionNum', version);
                        text = text.replace('$editorialState', base.editorialState.name);
                        if (queryCount > 0) {
                            text = text.replace('$openQueryCount', queryCount);
                            if (queryCount == 1) {
                                text = text.replace('open queries', 'open query');
                            }
                        }
                        if (editorialBarData.previousEditorialState != null) {
                            text = text.replace('$previousEditorialState', base.editorialStates[editorialBarData.previousEditorialState].name);
                        }
                        if (editorialBarData.nextEditorialState != null) {
                         text = text.replace('$nextEditorialState', base.editorialStates[editorialBarData.nextEditorialState].name);
                        }
                        editorialBar.append('<div class="message">' + text + '</div>');
                        if (queryCount == 0) {
                            editorialBar.find('span.query-msg').remove();
                        }

                        // buttons
                        editorialControls = $('<div></div>').appendTo(editorialBar);
                        editorialControls.wrap('<div class="controls"></div>');
                        var button, action;
                        for (var i in editorialBarData.actions) {
                            action = editorialBarData.actions[i];
                            action = action.replace('$contentType', contentType);
                            button = $('<a class="btn" href="javascript:;">' + action + '</a>').appendTo(editorialControls);
                            if ((i == 0) && (action != "Dashboard")) {
                                button.addClass('btn-primary');
                            } else {
                                button.addClass('btn-default hidden-sm hidden-xs');
                            }
                            switch (action) {
                                case "Dashboard":
                                button.attr('href', system_uri + '/dashboard?book_id=' + base.bookId + '&zone=editorial#tabs-editorial');
                                break;
                                case "Editorial Path":
                                button.attr('href', base.parent + 'editorialpath');
                                break;
                                case "Edit " + contentType:
                                button.attr('href', base.get_param(scalarapi.model.urlPrefix + base.current_slug + '.edit'));
                                break;
                                case "Latest version":
                                button.attr('href', scalarapi.stripEditionAndVersion(window.location.href));
                                break;
                            }
                        }
                    }
                }
            }
        }
        base.buildSubItem = function($container){
            var slug = $container.data('slug');
        }
        base.expandMenu = function(node,n){
            var expanded_menu = $('#mainMenuSubmenus');

            if(base.usingMobileView){
                $('#ScalarHeaderMenu').addClass('expandedMenuOpen');
                expanded_menu = $('#mobileMainMenuSubmenus').addClass('active').find('.pages');
            }else{
                $('#mainMenuSubmenus').show();
            }

            var currentMenuWidth = $('.mainMenuDropdown').width();


            var offset = 0;
            if(!base.usingMobileView){
                expanded_menu.find('.expandedPage').each(function(){
                    if($(this).data('index') >= n){
                        $(this).remove();
                    }else{
                        currentMenuWidth += (base.remToPx*38);
                    }
                });
            }

            if(!base.usingMobileView && ($(window).width() - currentMenuWidth) < (base.remToPx*38)){
                offset = parseInt('-'+(currentMenuWidth - ($(window).width()-(base.remToPx*38))));
            }else if(base.usingMobileView){
                offset = ($(window).width()*-n);
            }

            var translateX = 'translateX('+offset+'px)';
            if(base.usingMobileView){
                $('#ScalarHeaderMenu').css({
                    'transform' : 'translateX(-'+$(window).width()+'px)',
                    '-webkit-transform' : 'translateX(-'+$(window).width()+'px)',
                    '-moz-transform' : 'translateX(-'+$(window).width()+'px)'
                });
                $('#mobileMainMenuSubmenus .pages').css({
                    'transform' : translateX,
                    '-webkit-transform' : translateX,
                    '-moz-transform' : translateX
                });
            }else{
                $('.mainMenuDropdown').css({
                    'transform' : translateX,
                    '-webkit-transform' : translateX,
                    '-moz-transform' : translateX
                });
            }

            if(base.usingMobileView){
                offset = -n*$(window).width();
            }else{
                offset = -n*(base.remToPx*38);
            }

            var description = node.current.description;

            var container = $('<div class="expandedPage"><h2 class="title">'+node.getDisplayTitle(true)+'</h2><div class="description">'+description+'</div><ul class="description_more_link_container"><li class="pull-right"><a class="description_more_link" title="Display full description">more</a></li></ul><ul class="links"><!--<a class="details">Details</a>--><li><a class="visit" href="'+base.get_param(node.url)+'" title="Visit page, \''+node.getDisplayTitle(true)+'\'"tabindex="-1">Visit page</a></li></ul><div class="relationships"><i class="loader"></i></div></div>').data({'index': n, 'slug': node.slug}).css('right',offset+'px').appendTo(expanded_menu);

            if(!base.usingMobileView){
                container.prepend('<div class="close" role="link" tabindex="-1" title="Close expanded panel"><span class="menuIcon closeIcon"></span></div>');
            }
            if(typeof base.currentNode !== 'undefined' && container.data('slug') == base.currentNode.slug){
                container.addClass('is_current');
            }else if(typeof base.currentNode !== 'undefined' && base.parentNodes.indexOf(container.data('slug')) >= 0){
                container.addClass('is_parent');
            }
            container.on('click', function(e){
                e.stopPropagation();
            }).on('keydown', function(e){
                if(e.which == 27 || e.which == 9){
                    e.stopPropagation();
                    $(this).find('.close').trigger('click');
                    e.preventDefault();
                    return false;
                }
            });
            container.find('.close').add('#mobileMainMenuSubmenus footer button.back').off('click').on('click', function(e){
                var base = $('#scalarheader.navbar').data('scalarheader');
                var expanded_menu = $('#mainMenuSubmenus');
                if(base.usingMobileView){
                    expanded_menu = $('#mobileMainMenuSubmenus .pages');
                }
                var currentMenuWidth = base.remToPx*38;

                if(base.usingMobileView){
                    max_n = $('#mobileMainMenuSubmenus .expandedPage').length - 2;
                }else{
                    max_n = parseInt($(this).parents('.expandedPage').data('index'))-1;
                }
                var removed_pages = [];

                expanded_menu.find('.expandedPage').each(function(){
                    if(!base.usingMobileView){
                        if($(this).data('index') > max_n){
                            $(this).remove();
                        }
                    }
                });

                if(expanded_menu.find('.expandedPage').length > 0){
                    expanded_menu.find('.expandedPage').last().find('li.active').removeClass('active').find('.expand').trigger('focus');
                }else{
                    $('.mainMenuDropdown li.active .expand').trigger('focus');
                }

                currentMenuWidth += (expanded_menu.find('.expandedPage').length * (base.remToPx*38));
                offset = 0;
                if(!base.usingMobileView && ($(window).width() - currentMenuWidth) < 0){
                    offset = ($(window).width() - currentMenuWidth);
                }else if(base.usingMobileView){
                    offset = $(window).width()*(-max_n);
                }

                var translateX = 'translateX('+offset+'px)';
                if(base.usingMobileView){
                    $('#ScalarHeaderMenu').css({
                    'transform' : 'translateX(-'+$(window).width()+'px)',
                    '-webkit-transform' : 'translateX(-'+$(window).width()+'px)',
                    '-moz-transform' : 'translateX(-'+$(window).width()+'px)'
                    });
                    if(max_n < 0){
                        translateX = 'translateX(0px)';
                    }
                    $('#mobileMainMenuSubmenus .pages').css({
                        'transform' : translateX,
                        '-webkit-transform' : translateX,
                        '-moz-transform' : translateX
                    });
                }else{
                    $('.mainMenuDropdown').css({
                        'transform' : translateX,
                        '-webkit-transform' : translateX,
                        '-moz-transform' : translateX
                    });
                }

                if(expanded_menu.find('.expandedPage').length == 0 || max_n < 0){
                    if(base.usingMobileView){

                        $('#mobileMainMenuSubmenus').removeClass('active');
                        $('.mainMenuDropdown, #ScalarHeaderMenu').css({
                            'transform' : 'translateX(0px)',
                            '-webkit-transform' : 'translateX(0px)',
                            '-moz-transform' : 'translateX(0px)',
                            'position': ''
                        });
                        setTimeout(function(){
                            $('#mobileMainMenuSubmenus').find('.expandedPage').remove();
                        },500);
                    }else{
                        $('#mainMenuSubmenus').hide();
                        $('.mainMenuDropdown li.active').removeClass('active');
                    }
                }else if(base.usingMobileView){
                    setTimeout(function(){
                        $('#mobileMainMenuSubmenus .expandedPage').last().remove();
                    },500);
                }

                if(!base.usingMobileView && expanded_menu.find('.tall').length == 0){
                    $('body').removeClass('in_menu'); //.css('margin-top','0px').scrollTop($('body').data('scrollTop'));
                }

                return false;
            });
            if(description == null){
                container.find('.description').remove();
            }
            container.find('.description,.title').dotdotdot({
                ellipsis: '…',
                watch: "window"
            });

            if(container.find('.description').triggerHandler("isTruncated")){
                container.find('.description_more_link').on('click', function(){
                    if($(this).text() == 'more'){
                        container.find('.description').trigger('destroy').css('max-height','none');
                        container.find('.description_more_link').text('less');
                    }else{
                        container.find('.description').css('max-height','6.5rem')
                                                      .dotdotdot({
                                                            ellipsis: '…',
                                                            watch: "window"
                                                      });
                        container.find('.description_more_link').text('more');
                    }

                });
            }else{
                container.find('.description_more_link_container').remove();
            }

            if(!base.usingMobileView){
                base.focusExpandedPage(container);
            }

            var handleRequest = function(){ //this function is scoped instantaneously to this anonymous function, so we can pass it to loadPage while preserving the container reference
                    var relationships = $(this).find('.relationships');

                    var splitList = $('<ul></ul>');

                    var node = scalarapi.getNode($(this).data('slug'));
                    var splitList = $('<ul></ul>');

                    var path_of = node.getRelatedNodes('path', 'outgoing');
                    var features = node.getRelatedNodes('reference', 'outgoing');
                    var tag_of = node.getRelatedNodes('tag', 'incoming');
                    var annotates = node.getRelatedNodes('annotation', 'outgoing');
                    var comments_on = node.getRelatedNodes('comment', 'outgoing');

                    if(path_of.length > 0){
                        var newList = $('<li><strong>Contains</strong><ol></ol></li>').appendTo(splitList).find('ol');
                        for(var i in path_of){
                            var relNode = path_of[i];
                            var nodeItem = $('<li><a href="'+relNode.url+'?path='+node.slug+'" tabindex="-1">'+relNode.getDisplayTitle(true)+'</a></li>')
                                                .data({
                                                    'slug': relNode.slug,
                                                    'node': relNode
                                                })
                                                .addClass(((base.parentNodes.indexOf(relNode.slug) < 0  && (typeof base.currentNode === 'undefined' || relNode.slug != base.currentNode.slug)) )?'':'is_parent')
                                                .addClass((base.visitedPages.indexOf(relNode.url) < 0 && (typeof base.currentNode === 'undefined' || relNode.url != base.currentNode.url))?'':'visited');

                            $('<a class="expand" tabindex="-1"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(nodeItem);

                            newList.append(nodeItem);
                        }
                    }

                    if(features.length > 0){
                        var newList = $('<li><strong>Features</strong><ol></ol></li>').appendTo(splitList).find('ol');
                        for(var i in features){
                            var relNode = features[i];
                            var nodeItem = $('<li><a href="'+relNode.url+'" tabindex="-1">'+relNode.getDisplayTitle(true)+'</a></li>')
                                                .data({
                                                    'slug': relNode.slug,
                                                    'node': relNode
                                                })
                                                .addClass(((base.parentNodes.indexOf(relNode.slug) < 0  && (typeof base.currentNode === 'undefined' || relNode.slug != base.currentNode.slug)))?'':'is_parent')
                                                .addClass((base.visitedPages.indexOf(relNode.url) < 0 && (typeof base.currentNode === 'undefined' || relNode.url != base.currentNode.url))?'':'visited');

                            $('<a class="expand" tabindex="-1"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(nodeItem);

                            newList.append(nodeItem);

                        }
                    }

                    if(tag_of.length > 0){
                        var newList = $('<li><strong>Tagged by</strong><ol class="tags"></ol></li>').appendTo(splitList).find('ol');
                        for(var i in tag_of){
                            var relNode = tag_of[i];
                            var nodeItem = $('<li><a href="'+relNode.url+'" tabindex="-1">'+relNode.getDisplayTitle(true)+'</a></li>')
                                                .data({
                                                    'slug': relNode.slug,
                                                    'node': relNode
                                                })
                                                .addClass(((base.parentNodes.indexOf(relNode.slug) < 0  && (typeof base.currentNode === 'undefined' || relNode.slug != base.currentNode.slug)))?'':'is_parent')
                                                .addClass((base.visitedPages.indexOf(relNode.url) < 0 && (typeof base.currentNode === 'undefined' || relNode.url != base.currentNode.url))?'':'visited');

                            $('<a class="expand" tabindex="-1"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(nodeItem);

                            newList.append(nodeItem);

                        }
                    }

                    if(annotates.length > 0){
                        var newList = $('<li><strong>Annotates</strong><ol></ol></li>').appendTo(splitList).find('ol');
                        for(var i in annotates){
                            var relNode = annotates[i];
                            var nodeItem = $('<li><a href="'+relNode.url+'" tabindex="-1">'+relNode.getDisplayTitle(true)+'</a></li>')
                                                .data({
                                                    'slug': relNode.slug,
                                                    'node': relNode
                                                })
                                                .addClass(((base.parentNodes.indexOf(relNode.slug) < 0  && (typeof base.currentNode === 'undefined' || relNode.slug != base.currentNode.slug)))?'':'is_parent')
                                                .addClass((base.visitedPages.indexOf(relNode.url) < 0 && (typeof base.currentNode === 'undefined' || relNode.url != base.currentNode.url))?'':'visited');

                            $('<a class="expand" tabindex="-1"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(nodeItem);

                            newList.append(nodeItem);

                        }
                    }

                    if(comments_on.length > 0){
                        var newList = $('<li><strong>Comments on</strong><ol></ol></li>').appendTo(splitList).find('ol');
                        for(var i in comments_on){
                            var relNode = comments_on[i];
                            var nodeItem = $('<li><a href="'+relNode.url+'" tabindex="-1">'+relNode.getDisplayTitle(true)+'</a></li>')
                                                .data({
                                                    'slug': relNode.slug,
                                                    'node': relNode
                                                })
                                                .addClass(((base.parentNodes.indexOf(relNode.slug) < 0  && (typeof base.currentNode === 'undefined' || relNode.slug != base.currentNode.slug)))?'':'is_parent')
                                                .addClass((base.visitedPages.indexOf(relNode.url) < 0 && (typeof base.currentNode === 'undefined' || relNode.url != base.currentNode.url))?'':'visited');

                            $('<a class="expand" tabindex="-1"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(nodeItem);

                            newList.append(nodeItem);
                        }
                    }
                    if(splitList.children('li').length > 0){
                        relationships.html(splitList);
                        relationships.find('.expand').on('click', function(e){
                            var base = $('#scalarheader.navbar').data('scalarheader');
                            base.expandMenu($(this).parent().data('node'),$(this).parents('.expandedPage').data('index')+1);
                            $(this).parents('.relationships').find('li.active').removeClass('active');
                            $(this).parent().addClass('active');
                            e.preventDefault();
                            return false;
                        });
                        if(!base.usingMobileView){
                            var containerHeight = $(this).height() + 50;
                            var max_height = $(window).height()-50;
                            if(containerHeight >= max_height){
                                $(this).css('max-height',max_height+'px').addClass('tall');

                                var offset = $('body').scrollTop();
                                $('body').addClass('in_menu'); //.css('margin-top','-'+offset+'px').data('scrollTop',offset);
                            }
                        }
                    }else{
                        relationships.remove();
                        $(this).addClass('noRelations');
                        splitList.remove();
                    }
                    $(this).find('a').on('keyup', function(e){
                        if(e.which == 13 || e.which == 32){
                            $(this).trigger('click');
                        }
                    });
                    relationships.find('li>ol>li, li>ul>li').each(function(){
                      $(this).add($(this).find('.expand')).height($(this).find('a').first().height());
                    });
            }
            scalarapi.loadPage( container.data('slug'), true, $.proxy(handleRequest,container), null, 1, false, null, 0, 20 );
        };
        base.focusExpandedPage = function(container){
            if(container != null && typeof container !== 'undefined'){
                container.find('a').attr('tabindex','-1').first().trigger('focus');
            }
        }
        base.handleResize = function(extra_offset){

            var base = $('#scalarheader.navbar').data('scalarheader');
            var screen_width = $(window).width();
            var menu_button_visible = base.$el.find('.navbar-toggle').is(':visible');
            var max_width = (base.$el.width() - ($('#ScalarHeaderMenuLeft').outerWidth() + $('#ScalarHeaderMenuRight').outerWidth()))-30;

            base.$el.find('#desktopTitleWrapper,.title_wrapper.visible-xs .book-title').trigger("update");

            base.$el.find('.mainMenuDropdown .relationships').find('li>ol>li, li>ul>li').each(function(){
              $(this).add($(this).find('.expand')).height($(this).find('a').first().height());
            });

            if(base.isMobile || menu_button_visible){

                max_width -= base.$el.find('.navbar-toggle').outerWidth()+15;
                if(!base.usingMobileView){
                    base.$el.removeClass('short');
                    $('body').removeClass('shortHeader').trigger('headerSizeChanged');
                    $('#mainMenuSubmenus').hide().find('.expandedPage').remove();
                    base.$el.find('#ScalarHeaderMenuLeft .mainMenu').removeClass('open').trigger('hide.bs.dropdown');
                    //reset search form if switching to mobile view
                    $('#ScalarHeaderMenuSearchForm').stop().css('width','auto').removeClass('open');
                    $('#ScalarHeaderMenuSearch').removeClass('search_open');
                    $('#mainMenuSubmenus').hide();
                    var translateX = 'translateX(0px)';
                    $('.mainMenuDropdown').css({
                        'transform' : translateX,
                        '-webkit-transform' : translateX,
                        '-moz-transform' : translateX
                    });
                }
                base.usingMobileView = true;
                $(this).find('ul.dropdown-menu').css('max-width','auto');
            }else{
                if(base.usingMobileView){
                    $('#ScalarHeaderMenuSearch').removeClass('search_open');
                    $('#ScalarHeaderMenuSearchForm').css({"width" : "0px"}).removeClass('open');
                    $('#mainMenuSubmenus').hide();
                    $('.tocMenu').find('.expandedPage').remove();
                    base.$el.find('#ScalarHeaderMenuLeft .mainMenu').removeClass('open').trigger('hide.bs.dropdown');
                    //reset search form if switching from mobile view
                    $('#mobileMainMenuSubmenus').removeClass('active');
                    $('.mainMenuDropdown, #ScalarHeaderMenu').css({
                        'transform' : 'translateX(0px)',
                        '-webkit-transform' : 'translateX(0px)',
                        '-moz-transform' : 'translateX(0px)',
                        'position': ''
                    });
                    setTimeout(function(){
                        $('#mobileMainMenuSubmenus').find('.expandedPage').remove();
                    },500);
                }else{
                    var max_height = $(window).height()-50;
                    $('.expandedPage').css('max-height',max_height+'px');
                }
                var translateX = 'translateX(0px)';
                $('#ScalarHeaderMenu').css({
                    'transform' : translateX,
                    '-webkit-transform' : translateX,
                    '-moz-transform' : translateX
                });
                $('#mobileMainMenuSubmenus').removeClass('active');
                $('.mainMenuDropdown, #ScalarHeaderMenu').css({
                    'transform' : 'translateX(0px)',
                    '-webkit-transform' : 'translateX(0px)',
                    '-moz-transform' : 'translateX(0px)',
                    'position': ''
                });
                setTimeout(function(){
                    $('#mobileMainMenuSubmenus').find('.expandedPage').remove();
                },500);
                base.usingMobileView = false;
                //While we're here, handle sub-dropdowns
                base.$el.find('ul.dropdown-menu>li.dropdown.open').each(function(){
                    if($(this).hasClass('right')){
                        var max_width = $(window).width() - ($(this).offset().left + $(this).outerWidth());
                    }else{
                        var max_width = $(this).offset().left;
                    }
                    $(this).find('ul.dropdown-menu').css('max-width',max_width+'px');
                });
            }
            var title_width = $(window).width();

            if(base.usingMobileView){
                title_width -= 120;
            }else{
                title_width -= ($('#ScalarHeaderMenu>ul>li:not(.visible-xs)>a.headerIcon').length * 50) + 52; // 30 for the margin on the title, 2px for the border on the user menu items, then 20 for scrollbar

                $('#ScalarHeaderMenu>ul>li.customMenuItem').each(function() {
                	title_width -= $(this).outerWidth();
                });

                if($('#ScalarHeaderMenuSearch').hasClass('search_open')){
                    title_width -= 190;
                }else if(typeof extra_offset != 'undefined' && extra_offset!=null){
                    title_width -= extra_offset;
                }

                if(base.usingHypothesis){
                    title_width -= 60;
                }
            }

            $('#scalarheader .title_wrapper').css('max-width',title_width+'px');
            var desktopTitle = base.$el.find('#desktopTitleWrapper');
            if(desktopTitle.hasClass('overflowCalculated')){
              desktopTitle.trigger("update");
            }
            base.$el.removeClass('mobile_view desktop_view').addClass(base.usingMobileView?'mobile_view':'desktop_view');
        };

        base.buildUserMenu = function(userList){
            var redirect_url = '';
            if ( base.currentNode != null && typeof base.currentNode !== 'undefined') {
                redirect_url = encodeURIComponent(base.currentNode.url);
            }else{
                redirect_url = encodeURIComponent(window.location.href);
            }
            if (base.logged_in){
                userList.append('<li><a role="menuitem" href="' + base.get_param(addTemplateToURL(system_uri + '/dashboard?'+((base.is_author||base.is_editor)?'book_id=' + base.book_id + '&' : '')+'zone=user#tabs-user', 'cantaloupe')) + '">Account</a></li>');
                userList.append('<li><a role="menuitem" href="' + base.get_param(addTemplateToURL(system_uri+'/logout?action=do_logout&redirect_url='+redirect_url + '&', 'cantaloupe')) + '">Sign out</a></li>');
            } else {
                userList.append('<li><a role="menuitem" href="' + base.get_param(addTemplateToURL(system_uri+'/login?redirect_url='+redirect_url + '&', 'cantaloupe')) + '">Sign in</a></li>');
                userList.append('<li><a role="menuitem" href="' + base.get_param(addTemplateToURL(system_uri+'/register?redirect_url='+redirect_url + '&', 'cantaloupe')) + '">Register</a></li>');
            }
        }

        base.getLensData = function(){
          let bookId = $('link#book_id').attr('href');
          let baseURL = $('link#approot').attr('href').replace('application', 'lenses');
          let mainURL = `${baseURL}?book_id=${bookId}`;
          $.ajax({
            url:mainURL,
            type: "GET",
            dataType: 'json',
            contentType: 'application/json',
            async: true,
            context: this,
            success: base.handleLensData,
            error: function error(response) {
               console.log('There was an error attempting to communicate with the server.');
               console.log(response);
            }
          });
        }

        base.handleLensData = function(response){
          let data = response;
          let privateLensArray = [];
          let publicLensArray = [];

          data.forEach(lens => {
            if (!lens.hidden) {
              publicLensArray.push(lens);
            } else if (lens.user_id == base.userId) {
              privateLensArray.push(lens);
            }
          });
          let lensMenu = $('#lenses_menu>ul');
          lensMenu.empty();

          let manageLinkTitle = "Browse Lenses";
          if (base.is_author || base.is_editor) {
            manageLinkTitle = "Manage Lenses";
          }

          lensMenu.append('<li class="vis_link"><a role="menuitem" href="' + base.get_param(scalarapi.model.urlPrefix + 'manage_lenses') + '"><span class="menuIcon" id="lensIcon"></span> ' + manageLinkTitle + '</a></li>');

          // private lenses
          if (privateLensArray.length > 0) {
            lensMenu.append('<li class="header"><h2>My Private Lenses</h2></li>');
            privateLensArray.forEach(privateLensItem => {
              let vizType = privateLensItem.visualization.type;
              let lensLink = $('link#parent').attr('href') + privateLensItem.slug;
              let markup = $(`
                <li class="lens">
                  <a href="${lensLink}"><span class="title">${privateLensItem.title}</span>
                  <span class="viz-icon ${vizType}"></span>
                </li>`
              ).appendTo(lensMenu);
            });
          }

          // public lenses
          if (publicLensArray.length > 0) {
            lensMenu.append('<li class="header"><h2>Public Lenses</h2></li>');
            publicLensArray.forEach(publicLensItem => {
              let vizType = publicLensItem.visualization.type;
              let lensLink = $('link#parent').attr('href') + publicLensItem.slug;
              let markup = $(`
                <li class="lens">
                  <a href="${lensLink}"><span class="title">${publicLensItem.title}</span>
                  <span class="viz-icon ${vizType}"></span>
                </li>`
              ).appendTo(lensMenu);
            });
          }

        };

        base.initSubmenus = function(el){
            var li = $(el).is('li.dropdown')?$(el):$(el).parent('li.dropdown');
            var a = $(el).is('li.dropdown>a')?$(el):$(el).children('a').first();
            var dropdown = li.find('ul.dropdown-menu');
            li.addClass('open').removeClass('left right').addClass(a.offset().left>($(window).width()/2)?'left':'right').siblings('li').removeClass('open left right');
            if(li.hasClass('right')){
                max_width = $(window).width() - (a.offset().left + a.outerWidth() );
            }else{
                max_width = a.offset().left;
            }
            var max_height = ($(window).height() - (li.offset().top-15))+$(window).scrollTop();
            if(!base.usingMobileView){
                dropdown.css({
                    'max-height':max_height+'px',
                    'max-width':max_width+'px'
                });
            }
            $('body').on('keyup',function(e){
                if(e.which == 9 || e.which == 37){
                    if(e.which == 9){
                        li.removeClass('open');
                        li.parents('.dropdown').removeClass('open');
                    }else if(e.which == 37){
                        a.trigger('focus');
                        li.removeClass('open');
                    }
                    $('body').off('keyup');
                }
            });
            dropdown.find('a').first().trigger('focus');
        }

        base.load_recent = function(container){
            container.html($('<div></div>').scalarrecent().find('.history_content').html()).find('li>a').each(function(){
                var base = $('#scalarheader.navbar').data('scalarheader');
                $(this).removeClass('page').attr('href',base.get_param($(this).parent().attr('title',$(this).text()).attr('id')));
                base.visitedPages.push($(this).parent().attr('id'));
                $('.mainMenu>.dropdown-menu .body>ol>li>a').each(function(){
                    if(base.visitedPages.indexOf($(this).attr('href')) >= 0){
                        $(this).parent('li').addClass('visited');
                    }
                });
                $('.expandedPage ol>li>a').each(function(){
                    if(base.visitedPages.indexOf($(this).attr('href')) >= 0){
                        $(this).parent('li').addClass('visited');
                    }
                });
            });
        };
        base.get_param = function(url){
            //@TODO: Add non-book related Get Params back to URLs Here
            var allowable_vars = ['path','m'];
            if (scalarapi.getQuerySegment(window.location.href).length) {
                var vars = scalarapi.getQuerySegment(window.location.href).split('&');
                for (var j = 0; j < vars.length; j++) {
                    var field = vars[j].split('=')[0];
                    if (allowable_vars.indexOf(field) == -1) continue;
                    if (url.indexOf('?') == -1) url += '?';
                    url += vars[j];
                    if (j < vars.length-1) url += '&';
                }
            }
            return url;
        }
        base.getParents = function(node,depth){
            if(typeof base.currentNode !== 'undefined'){
                var in_path = node.getRelatedNodes('path', 'incoming');
                var featured = node.getRelatedNodes('reference', 'incoming');
                var tagged_by = node.getRelatedNodes('tag', 'outgoing');
                var annotated_by = node.getRelatedNodes('annotation', 'incoming');
                var commented_by = node.getRelatedNodes('comment', 'incoming');
                /*
                var in_path = node.getRelations('path', 'incoming', 'reverseindex');
                var featured = node.getRelations('reference', 'incoming', 'reverseindex');
                var tagged_by = node.getRelations('tag', 'outgoing', 'reverseindex');
                var annotated_by = node.getRelations('annotation', 'incoming', 'reverseindex');
                var commented_by = node.getRelations('comment', 'incoming', 'reverseindex');
                */

                var this_parent_nodes = [];
                var rel = '';
                for(n in in_path){
                    rel = in_path[n];
                    if(this_parent_nodes.indexOf(rel.slug)<0){
                        this_parent_nodes.push(rel.slug);
                    }
                    if(base.parentNodes.indexOf(rel.slug)<0){
                        base.parentNodes.push(rel.slug);
                    }
                }

                for(n in featured){
                    rel = featured[n];
                    if(this_parent_nodes.indexOf(rel.slug)<0){
                        this_parent_nodes.push(rel.slug);
                    }
                    if(base.parentNodes.indexOf(rel.slug)<0){
                        base.parentNodes.push(rel.slug);
                    }
                }

                for(n in tagged_by){
                    rel = tagged_by[n];
                    if(this_parent_nodes.indexOf(rel.slug)<0){
                        this_parent_nodes.push(rel.slug);
                    }
                    if(base.parentNodes.indexOf(rel.slug)<0){
                        base.parentNodes.push(rel.slug);
                    }
                }

                for(n in annotated_by){
                    rel = annotated_by[n];
                    if(this_parent_nodes.indexOf(rel.slug)<0){
                        this_parent_nodes.push(rel.slug);
                    }
                    if(base.parentNodes.indexOf(rel.slug)<0){
                        base.parentNodes.push(rel.slug);
                    }
                }

                for(n in commented_by){
                    rel = commented_by[n];
                    if(this_parent_nodes.indexOf(rel.slug)<0){
                        this_parent_nodes.push(rel.slug);
                    }
                    if(base.parentNodes.indexOf(rel.slug)<0){
                        base.parentNodes.push(rel.slug);
                    }
                }

                for(n in this_parent_nodes){
                    var slug = this_parent_nodes[n];
                    if(slug != base.currentNode.slug){
                        (function(slug,depth){
                            // if this is a comment relation, get the provenance data as well so we can
                            // attribute comments by name
                            var prov = ( commented_by.indexOf( scalarapi.getNode( slug ) ) != -1 );
                            scalarapi.loadPage( slug, true, function(){
                                var base = $('#scalarheader.navbar').data('scalarheader');
                                if(base.checkedParents.indexOf(slug)<0){
                                    base.checkedParents.push(slug);
                                    base.getParents(scalarapi.getNode(slug),++depth);
                                }
                            }, null, 1, false, null, 0, 20, prov );
                        })(slug,depth);
                    }
                }
                base.updateParents();
            }
        }
        base.updateParents = function(){
            $('.mainMenu>.dropdown-menu .body>ol>li').each(function(){
                if(base.parentNodes.indexOf($(this).data('slug')) >= 0){
                    $(this).addClass('is_parent');
                }
            });
            $('.expandedPage').each(function(){
                if(base.parentNodes.indexOf($(this).data('slug')) >= 0){
                    $(this).addClass('is_parent');
                    $(this).find('ol>li').each(function(){
                        if($(this).data('slug') == base.currentNode.slug || base.parentNodes.indexOf($(this).data('slug')) >= 0){
                            $(this).addClass('is_parent');
                        }
                    });
                }else if($(this).data('slug') == base.currentNode.slug){
                    $(this).addClass('is_current');
                }
            });
        }
        base.handleBook = function(){
            //Build the main menu
            var node = scalarapi.model.getMainMenuNode();

            var menu = $( '.mainMenu>.dropdown-menu .body>ol' );

            if (node != null) {
                var i, subMenu, subMenuItem,
                    menuItems = node.getRelatedNodes('reference', 'outgoing', true),
                    n = menuItems.length;
                if (n > 0) {
                    var tocNode, listItem;
                    for (i=n-1; i>=0; i--) { //going in reverse here, since we're prepending...
                        tocNode = menuItems[i];
                        listItem = $( '<li><a href="' + tocNode.url + '">'+ tocNode.getDisplayTitle(true) + '</a></li>' )
                                    .prependTo( menu )
                                    .data({
                                        'slug': tocNode.slug,
                                        'node': tocNode
                                    })
                                    .addClass((base.parentNodes.indexOf(tocNode.slug) < 0 && (typeof base.currentNode === 'undefined' || tocNode.slug != base.currentNode.slug))?'':'is_parent')
                                    .addClass((base.visitedPages.indexOf(tocNode.url) < 0 && (typeof base.currentNode === 'undefined' || tocNode.url != base.currentNode.url))?'':'visited');

                        $('<a class="expand" title="Explore '+tocNode.getDisplayTitle(true)+'"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(listItem).on('click', function(e){
                            var base = $('#scalarheader.navbar').data('scalarheader');
                            var target_toc_item = $(this).parent().data('node');
                            base.expandMenu(target_toc_item,0);
                            var menu = $( '.mainMenu>.dropdown-menu .body>ol>li.active').removeClass('active');
                            $(this).parent().addClass('active');

                            $("#mainMenuSubmenus").removeClass (function (index, className) {
                                return (className.match (/(^|\s)submenu-\S+/g) || []).join(' ');
                            });
                            $('#mainMenuSubmenus').addClass('submenu-' + target_toc_item.slug)

                            e.preventDefault();
                            return false;
                        })
                    }
                }
            }

            $('.mainMenu').addClass('ready');


            base.$el.find('#ScalarHeaderDelete').on('click', function(){
                var result = confirm('Are you sure you wish to hide this page from view?');

                if (result) {
                    // assemble params for the trash action
                    var pageData = {
                            native:1,
                            id:$('link#parent').attr('href'),
                            api_key:'',
                            action: 'DELETE',
                            'scalar:urn': $('link#urn').attr('href')
                        };
                    // execute the trash action (i.e. make is_live=0)
                    scalarapi.savePage(pageData, function(result) {
                        for (var url in result) break;
                        url = url.substr(0, url.lastIndexOf('.'));
                        window.location.href=url;
                        return;
                    }, function(result) {
                        alert('An error occurred attempting to hide this page: '+result);
                        var login = $('link#approot').attr('href').replace('application','login');
                        if ('/'==login.substr(login.length-1,1)) login = login.substr(0,login.length-1);
                        var url = $('link#parent').attr('href');
                        window.location.href=login+'?redirect_url='+encodeURIComponent(url);
                        return;
                    });
                }
            });

            // First attempt at determining the uber-parents of this page.
            // Commenting this out for now because it causes slowdown on pages with lots of connections
            //base.getParents(base.currentNode,0);

            var tabIndex = 1;
            $('#scalarheader>div>div>ul>li>a, .title_wrapper a').each(function(){
                $(this).attr('tabindex',tabIndex++);
            }).add($('#scalarheader>div>div>ul>li.dropdown>ul a, #scalarheader>div>div>ul>li input').attr('tabindex','-1')).on('keyup', function(e){
                if(!$(this).is('#scalarheader>div>div>ul>li.dropdown>ul a') || $(this).hasClass('expand') || $(this).parent().hasClass('vis_link') || $(this).parent().hasClass('index_link') || ($(this).attr('href')!=null && $(this).attr('href')!='')){
                    if(e.which == 13 || e.which == 32){
                        $(this).trigger('click');
                    }
                }
            });

            base.$el.find('#desktopTitleWrapper').trigger("update");
        }

        // Run initializer
        base.init();
    };

    $.scalarheader.defaultOptions = {
        root_url: ''
    };

    $.fn.scalarheader = function(options){
        return new $.scalarheader(this, options);
    };

})(jQuery);
