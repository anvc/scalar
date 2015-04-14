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
        base.usingHypothesis = $('link#hypothesis').attr('href') === 'true';
        base.remToPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
        // Add a reverse reference to the DOM object
        base.$el.data("scalarheader", base);

        base.init = function(){
            //Replace undefined options with defaults...
            base.options = $.extend({},$.scalarheader.defaultOptions, options);
            //Are we logged in? Check the RDF metadata.
            base.logged_in = $('link#logged_in').length > 0 && $('link#logged_in').attr('href')!='';

            base.currentNode = scalarapi.model.getCurrentPageNode();

            if(base.logged_in){
                //While we are logged in, check what our user level is, and set the appropriate bools
                base.is_author = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Author';
                base.is_commentator = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Commentator';
                base.is_reviewer = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Reviewer';

                if(base.is_author || base.is_commentator || base.is_reviewer){
                     base.$el.addClass('edit_enabled');
                }
            }

            //We should also grab the book ID from the RDF stuff
            base.bookId = parseInt($('link#book_id').attr('href'));

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
            base.current_slug = window.location.href.split("?")[0].replace(book_url,'');

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
                                                    '<span class="visible-xs">Home page</span>'+
                                                '</a>'+
                                            '</li>'+
                                            '<li class="dropdown mainMenu">'+
                                                '<a class="dropdown-toggle headerIcon" data-toggle="dropdown" role="button" aria-expanded="false">'+
                                                    '<span class="visible-xs">Table of contents</span>'+
                                                '</a>'+
                                                '<ul class="dropdown-menu mainMenuDropdown" role="menu">'+
                                                    '<div class="close"><span class="menuIcon closeIcon"></span></div>'+
                                                    '<li class="header"><h2>Table of Contents</h2></li>'+
                                                    '<li class="top hidden-xs">'+
                                                        '<ul>'+
                                                            '<li class="home_link static"><a href="'+base.get_param(home_url)+'">Home <span class="menuIcon rightArrowIcon pull-right"></span></a></li>'+
                                                        '</ul>'+
                                                    '</li>'+
                                                    '<li class="body">'+
                                                        '<ol>'+
                                                        '</ol>'+
                                                    '</li>'+
                                                    '<li class="bottom">'+
                                                        '<ul>'+
                                                            '<li class="index_link static dropdown">'+
                                                                '<a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Index <span class="menuIcon rightArrowIcon pull-right"></span></a>'+
                                                                '<ul class="dropdown-menu" role="menu">'+
                                                                    '<li><a><span class="menuIcon" id="pathIcon"></span> Paths</a></li>'+
                                                                    '<li><a><span class="menuIcon" id="pageIcon"></span> Pages</a></li>'+
                                                                    '<li><a><span class="menuIcon" id="mediaIcon"></span> Media</a></li>'+
                                                                    '<li><a><span class="menuIcon" id="tagIcon"></span> Tags</a></li>'+
                                                                    '<li><a><span class="menuIcon" id="annotationIcon"></span> Annotations</a></li>'+
                                                                    '<li><a><span class="menuIcon" id="commentIcon"></span> Comments</a></li>'+
                                                                '</ul>'+
                                                            '</li>'+
                                                        '</ul>'+
                                                    '</li>'+
                                                    '<div id="mainMenuSubmenus" class="tocMenu"></div>'+
                                                '</ul>'+
                                            '</li>'+
                                            '<li class="dropdown" id="navMenu">'+
                                                '<a class="dropdown-toggle headerIcon" data-toggle="dropdown" role="button" aria-expanded="false" id="wayfindingIcon">'+
                                                    '<span class="visible-xs">Navigation</span>'+
                                                '</a>'+
                                                '<ul class="dropdown-menu" role="menu">'+
                                                    '<li id="recent_menu" class="dropdown">'+
                                                        '<a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"><span class="menuIcon" id="recentIcon"></span> Recent <span class="menuIcon rightArrowIcon pull-right"></span></a>'+
                                                        '<ul class="dropdown-menu" role="menu">'+
                                                            '<li><i class="loader"></i></li>'+
                                                        '</ul>'+
                                                    '</li>'+
                                                    /*'<li id="bookmark_menu" class="dropdown">'+
                                                        '<a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"><span class="menuIcon" id="bookmarkIcon"></span> Bookmarks <span class="menuIcon rightArrowIcon pull-right"></span></a>'+
                                                        '<ul class="dropdown-menu" role="menu">'+
                                                        '</ul>'+
                                                    '</li>'+*/
                                                    '<li id="vis_menu" class="dropdown">'+
                                                        '<a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"><span class="menuIcon" id="visIcon"></span> Visualizations <span class="menuIcon rightArrowIcon pull-right"></span></a>'+
                                                        '<ul class="dropdown-menu" role="menu">'+
                                                            '<li><a><span class="menuIcon" id="gridIcon"></span> Grid</a></li>'+
                                                            '<li><a><span class="menuIcon" id="radialIcon"></span> Radial</a></li>'+
                                                            '<li><a><span class="menuIcon" id="pathIcon"></span> Path</a></li>'+
                                                            '<li><a><span class="menuIcon" id="mediaIcon"></span> Media</a></li>'+
                                                            '<li><a><span class="menuIcon" id="tagIcon"></span> Tag</a></li>'+
                                                        '</ul>'+
                                                    '</li>'+
                                                    '<li id="scalar_menu" class="dropdown">'+
                                                        '<a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"><span class="menuIcon" id="scalarIcon"></span> Scalar <span class="menuIcon rightArrowIcon pull-right"></span></a>'+
                                                        '<ul class="dropdown-menu" role="menu">'+
                                                            '<li><a href="http://scalar.usc.edu/">About Scalar</a></li>'+
                                                            '<li><a href="http://scalar.usc.edu/works/guide">User\'s Guide</a></li>'+
                                                            '<li><a href="'+base.get_param(index_url)+'">More Scalar Projects</a></li>'+
                                                        '</ul>'+
                                                    '</li>'+
                                                '</ul>'+
                                            '</li>'+
                                        '</ul>'+
                                        '<span class="navbar-text navbar-left pull-left title_wrapper hidden-xs"><span class="hidden-xs author_text"> By <span id="header_authors"></span></span></span>'+
                                        '<ul class="nav navbar-nav navbar-right" id="ScalarHeaderMenuRight">'+
                                            '<li class="" id="ScalarHeaderMenuSearch">'+
                                                '<a class="headerIcon" id="searchIcon" title="Search button. Click to open search field.">'+
                                                    '<span class="visible-xs">Search book</span>'+
                                                '</a>'+
                                            '</li>'+
                                            '<li id="ScalarHeaderMenuSearchForm">'+
                                                '<form class="navbar-form" role="search">'+
                                                    '<div class="form-group">'+
                                                        '<input type="text" class="form-control" placeholder="Search this book...">'+
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
                                            '<li id="ScalarHeaderHelp" class="hidden-xs">'+
                                                '<a class="headerIcon" id="helpIcon" title="Help button. Click to toggle help info."/></a>'+
                                            '</li>'+
                                            ((base.is_author||base.is_commentator||base.is_reviewer)?
                                                '<li id="ScalarHeaderNew" class="hidden-xs"><a class="headerIcon" href="' + base.get_param(scalarapi.model.urlPrefix + 'new.edit')+'" id="newIcon" title="New page button. Click to create a new page."><span class="visible-xs">New page</span></a></li>'+
                                                '<li id="ScalarHeaderEdit" class="hidden-xs"><a class="headerIcon" href="' + base.get_param(scalarapi.model.urlPrefix + base.current_slug + '.edit')+'" id="editIcon" title="Edit button. Click to edit the current page or media."><span class="visible-xs">Edit page</span></a></li>'+
                                                ((base.currentNode!=null && base.currentNode.hasScalarType( 'media' ))?'<li id="ScalarHeaderAnnotate" class="hidden-xs"><a class="headerIcon" href="' + base.get_param(scalarapi.model.urlPrefix + scalarapi.basepath( window.location.href ) + '.annotation_editor?template=honeydew')+'" id="annotateIcon" title="Annotate button. Click to annotate the current media."><span class="visible-xs">Annotate media</span></a></li>':'')+
                                                '<li class="dropdown" id="ScalarHeaderImport" class="hidden-xs">'+
                                                    '<a class="dropdown-toggle headerIcon" data-toggle="dropdown" role="button" aria-expanded="false" id="importIcon" title="Import menu. Roll over to show import options.">'+
                                                        '<span class="visible-xs">Import</span>'+
                                                    '</a>'+
                                                    '<ul class="dropdown-menu" role="menu" id="ScalarHeaderMenuImportList">'+
                                                        '<li class="dropdown">'+
                                                            '<a class="dropdown-toggle" data-toggle="dropdown" data-target="" role="button" aria-expanded="false">Affiliated archives <span class="menuIcon rightArrowIcon pull-right"></span></a>'+
                                                            '<ul class="dropdown-menu" role="menu">'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/critical_commons') + '">Critical Commons</a></li>'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/cuban_theater_digital_archive') + '">Cuban Theater Digital Archive</a></li>'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/hemispheric_institute') + '">Hemispheric Institute Digital Video Library</a></li>'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/hypercities') + '">Hypercities</a></li>'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/internet_archive') + '">Internet Archive</a></li>'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/play') + '">Play!</a></li>'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/shoah_foundation_vha_online') + '">Shoah Foundation VHA Online</a></li>'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/shoah_foundation_vha') + '">Shoah Foundation VHA (partner site)</a></li>'+
                                                            '</ul>'+
                                                        '</li>'+
                                                        '<li class="dropdown">'+
                                                            '<a class="dropdown-toggle" data-toggle="dropdown" data-target="" role="button" aria-expanded="false">Other archives <span class="menuIcon rightArrowIcon pull-right"></span></a>'+
                                                            '<ul class="dropdown-menu" role="menu">'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/getty_museum_collection') + '">Getty Museum Collection</a></li>'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/prezi') + '">Prezi</a></li>'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/soundcloud') + '">SoundCloud</a></li>'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/the_metropolitan_museum_of_art') + '">The Metropolitan Museum of Art</a></li>'+
                                                                '<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/vimeo') + '">Vimeo</a></li>'+
                                                            '</ul>'+
                                                        '</li>'+
                                                        '<li>'+
                                                            '<a href="' + base.get_param(scalarapi.model.urlPrefix + 'upload') + '">Local media files</a>'+
                                                        '</li>'+
                                                        '<li>'+
                                                            '<a href="' + base.get_param(scalarapi.model.urlPrefix + 'new.edit#type=media') + '">Internet media files</a>'+
                                                        '</li>'+
                                                        '<li>'+
                                                            '<a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/system') + '">Other Scalar books</a>'+
                                                        '</li>'+
                                                    '</ul>'+
                                                '</li>'+
                                                (typeof currentNode!=='undefined'?'<li id="ScalarHeaderDelete" class="hidden-xs"><a class="headerIcon" id="deleteIcon" title="Delete" /><span class="hidden-sm hidden-md hidden-lg">Delete page</span></a></li>':'')+
                                                ('<li id="ScalarHeaderOptions"><a href="' + system_uri + '/dashboard?book_id=' + base.bookId + '&zone=style#tabs-style" class="headerIcon" id="optionsIcon" title="Options button. Click to access the Dashboard."><span class="hidden-sm hidden-md hidden-lg">Dashboard</span></a></li>')
                                            :'')+
                                            '<li class="dropdown" id="userMenu">'+
                                                '<a class="dropdown-toggle headerIcon" data-toggle="dropdown" role="button" aria-expanded="false" id="userIcon" title="User menu. Roll over to show account options.">'+
                                                    '<span class="visible-xs">User</span>'+
                                                '</a>'+
                                                '<ul class="dropdown-menu" role="menu" id="ScalarHeaderMenuUserList">'+
                                                '</ul>'+
                                            '</li>'+
                                        '</ul>'+
                                    '</div>'+
                                '</div>';
            base.mobileTOCMenu = $('<div id="mobileMainMenuSubmenus" class="heading_font tocMenu"><div class="toc"><header class="mainMenu"><a class="headerIcon"><span class="visible-xs">Table of contents</span></a></header><footer><div class="footer_content"><button class="btn back text-center"></button><button class="btn close_menu text-center"><span class="menuIcon closeIcon"></span></button></div></footer></div><div class="pages"></div></div>').appendTo('body');
            base.mobileTOCMenu.find('.close_menu, header>a').click(function(e){
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
            }).mouseover(function(e){
            	$(this).removeClass('short');
            });
            base.$el.append(navbar_html).find('.title_wrapper').prepend(title_link.clone());
            base.$el.find('#ScalarHeaderMenuLeft .mainMenu').on('hide.bs.dropdown',function(){
                if(base.usingMobileView || $('#mainMenuSubmenus .expandedPage').length == 0){
                    $(this).find('li.active').removeClass('active');
                    return true;
                }else{
                    $(this).addClass('open');
                    return false;
                }
            });
            base.$el.find('.mainMenuDropdown>.close').click(function(e){
                $('#mainMenuSubmenus').hide().find('.expandedPage').remove();
                base.$el.find('#ScalarHeaderMenuLeft .mainMenu').removeClass('open').trigger('hide.bs.dropdown');
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
            base.$el.find('#ScalarHeaderMenuLeft>li.dropdown, #ScalarHeaderMenuRight>li.dropdown').hover(function(e){
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

                e.preventDefault();
                e.stopPropagation();
                return false;
            },function(e){
                var base = $('#scalarheader.navbar').data('scalarheader');
                if(!base.usingMobileView){
                    $(this).removeClass('open').trigger('hide.bs.dropdown');
                }

                e.preventDefault();
                e.stopPropagation();
                return false;
            }).find("ul.dropdown-menu li.dropdown").hover(function(e){
                var base = $('#scalarheader.navbar').data('scalarheader');
                if(!base.usingMobileView){
                    base.initSubmenus(this);
                }
                e.preventDefault();
                e.stopPropagation();
                return false;
            },function(e){
                var base = $('#scalarheader.navbar').data('scalarheader');
                if(!base.usingMobileView){
                    $(this).removeClass('open').trigger('hide.bs.dropdown');
                }else{
                    return true;
                }
            }).children('a').click(function(e){
                var base = $('#scalarheader.navbar').data('scalarheader');
                if(base.usingMobileView){
                    base.initSubmenus(this);
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }else{
                    return true;
                }
            });

            //Handle the book index...
            var indexElement = $( '<div></div>' ).prependTo( 'body' );
            base.index = indexElement.scalarindex( {} );
            base.$el.find('.index_link').click(function(e){
                $('#scalarheader.navbar').data('scalarheader').index.data('plugin_scalarindex').showIndex();
            });

            base.book_id = $('link#book_id').attr('href');

            base.buildUserMenu(base.$el.find('#ScalarHeaderMenuUserList'));

            var i, n, authors = [];

            // Get owners of book
            $('body').find('a.metadata[rel="sioc:has_owner"]').each(function(){
                authors.push($('body span[resource="'+($(this).attr('href').split('#')[0])+'"] span[property="foaf:name"]').html());
            });

            var author,
                n = authors.length,
                author_text = $( '#header_authors' );

            // Build string for author credit
            for ( var i = 0; i < n; i++ ) {
                author = authors[ i ];
                if(i > 0){
                    if ( i == ( n - 1 )) {
                        if ( n > 2 ) {
                            author_text.append( ', and ' );
                        } else {
                            author_text.append( ' and ' );
                        }
                    } else {
                        author_text.append( ', ' );
                    }
                }
                author_text.append( author );
            }
            author_text.parent('.author_text').fadeIn('fast');
            

            base.handleBook(); // we used to bind this to the return of a loadBook call, but now we can call it immediately

            var helpElement = $('<div></div>').appendTo('body');
            base.help = $( helpElement ).scalarhelp( { root_url: modules_uri + '/cantaloupe' } );

            $('body').on('click',function(e){
            	var base = $('#scalarheader.navbar').data('scalarheader');
        		if(!base.usingMobileView){
                	$('#mainMenuSubmenus').hide().find('.expandedPage').remove();
	                base.$el.find('#ScalarHeaderMenuLeft .mainMenu').removeClass('open').trigger('hide.bs.dropdown');
                }
            });

            base.$el.on('click',function(e){
        		var base = $('#scalarheader.navbar').data('scalarheader');
        		if(!base.usingMobileView){
                	e.stopPropagation();
                }
            })

            $( '#ScalarHeaderHelp>a' ).click(function(e) {
                base.help.data( 'plugin_scalarhelp' ).toggleHelp();
                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            $( '#ScalarHeaderHelp>a' ).click(function(e) {
                base.help.data( 'plugin_scalarhelp' ).toggleHelp();
                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            $( '#ScalarHeaderVisualization>a' ).click(function(e) {
                if (state != ViewState.Navigating) {
                    setState(ViewState.Navigating);
                } else {
                    setState(ViewState.Reading);
                }
                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            $('#ScalarHeaderMenuSearch a').click(function(e){
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
                        $('#ScalarHeaderMenuSearchForm input').first().val('').focus();
                        $('#ScalarHeaderMenuSearch').addClass('search_open');
                        base.handleResize(190);
                        var startTime = new Date().getTime();
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
                    }
                }
                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            base.$el.find('.navbar-toggle').click(function(){
                $(this).parents('nav').toggleClass('in');
            });

            var searchElement = $('<div></div>').appendTo('body');
            base.search = searchElement.scalarsearch( { root_url: modules_uri+'/cantaloupe'} );
            $('#ScalarHeaderMenuSearchForm form').submit(function(e) {
                base.search.data('plugin_scalarsearch').doSearch($(this).find('input').first().val());
                if(base.isMobile || base.$el.find('.navbar-toggle').is(':visible')){
                    $('#ScalarHeaderMenuSearchForm').removeClass('open');
                }else{
                    $('#ScalarHeaderMenuSearchForm').css('width','0px');
                }
                $('#ScalarHeaderMenuSearch').removeClass('search_open');
                e.preventDefault();
                return false;
            });

            //Gonna use jQuery promises to make sure we have common, cookie, rdfquery.rules, and scalarrecent included - when they are, we'll build out the recent panel
            $.when(
                $.getScript( arbors_uri+'/html/common.js' ),
                $.getScript( widgets_uri+'/nav/jquery.rdfquery.rules.min-1.0.js' ),
                $.getScript( widgets_uri+'/nav/jquery.scalarrecent.js' ),
                $.Deferred(function( deferred ){
                    $( deferred.resolve );
                })
            ).done(function(){
                    $.when(scalarrecent_log_page()).then(function(){
                        var base = $('#scalarheader.navbar').data('scalarheader');
                        base.load_recent(base.$el.find('#recent_menu>ul'));
                    });
            });

            $(window).resize(function(){
            			var base = $('#scalarheader.navbar').data('scalarheader');
            			base.handleResize();
            		 })
            		 .scroll(function(e){
                		var base = $('#scalarheader.navbar').data('scalarheader');
                		if(base.usingMobileView){
                			base.oldScrollTop = 0;
                			base.$el.removeClass('short');
                		}else{
	                		var scrollTop = $(this).scrollTop();
	            		 	if(scrollTop >= 50 && scrollTop > base.oldScrollTop){
	                			base.$el.addClass('short');
	                		}else{
	                			base.$el.removeClass('short');
	                		}
	       					base.oldScrollTop = scrollTop;
	       				}
           			 });
            base.handleResize();
        };
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

            var container = $('<div class="expandedPage"><h2 class="title">'+node.current.title+'</h2><div class="description">'+description+'</div><a class="description_more_link">more</a><div class="links"><a class="details">Details</a><a class="visit" href="'+base.get_param(node.url)+'">Visit</a></div><div class="relationships"><i class="loader"></i></div></div>').data({'index': n, 'slug': node.slug}).css('right',offset+'px').appendTo(expanded_menu);
            
            if(!base.usingMobileView){
                container.prepend('<div class="close"><span class="menuIcon closeIcon"></span></div>');
            }
            if(typeof base.currentNode !== 'undefined' && container.data('slug') == base.currentNode.slug){
                container.addClass('is_current');
            }else if(typeof base.currentNode !== 'undefined' && base.parentNodes.indexOf(container.data('slug')) >= 0){
                container.addClass('is_parent');
            }

            container.find('.close').add('#mobileMainMenuSubmenus footer button.back').off('click').click(function(e){
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
                    if($(this).data('index') == max_n){
                        $(this).find('li.active').removeClass('active');
                    }
                    if(!base.usingMobileView){
                        if($(this).data('index') > max_n){
                            $(this).remove();
                        }
                    }
                });
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
                    }
                }else if(base.usingMobileView){
                    setTimeout(function(){
                        $('#mobileMainMenuSubmenus .expandedPage').last().remove();
                    },500);
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
            	container.find('.description_more_link').click(function(){
            		container.find('.description').trigger('destroy').css('max-height','none');
            		container.find('.description_more_link').remove();
            	});
            }else{
				container.find('.description_more_link').remove();            	
            }

            // Sort of crafty here - we're doing a self-calling anonymous function here to pull this element out of the scope; 
            // We are then shoving it back into this class when we get the ajax response; this allows us to pass the call directly back to ScalarHeader
            // without having to dig for it again
            (function(container){
                var handleRequest = function(){ //this function is scoped instantaneously to this anonymous function, so we can pass it to loadPage while preserving the container reference
                        var relationships = container.find('.relationships');
                        
                        var groupList = $('<ol></ol>');
                        var splitList = $('<ul></ul>');

                        var node = scalarapi.getNode(container.data('slug'));
                        
                        var path_of = node.getRelatedNodes('path', 'outgoing');
                    
                        var features = node.getRelatedNodes('referee', 'outgoing');
                        var tag_of = node.getRelatedNodes('tag', 'outgoing');
                        var annotates = node.getRelatedNodes('annotation', 'outgoing');
                        var comments_on = node.getRelatedNodes('comment', 'outgoing');
                        
                        if(path_of.length > 0){
                            var newList = $('<li><strong>Paths</strong><ol></ol></li>').appendTo(splitList).find('ol');
                            for(var i in path_of){
                                var relNode = path_of[i];
                                var nodeItem = $('<li><a href="'+base.get_param(relNode.url)+'">'+relNode.current.title+'</a></li>')
                                                    .data({
                                                        'slug': relNode.slug,
                                                        'node': relNode
                                                    })
                                                    .addClass(((base.parentNodes.indexOf(relNode.slug) < 0  && (typeof base.currentNode === 'undefined' || relNode.slug != base.currentNode.slug))  || relNode.slug == base.currentNode.slug )?'':'is_parent')
                                                    .addClass((base.visitedPages.indexOf(relNode.url) < 0 && (typeof base.currentNode === 'undefined' || relNode.url != base.currentNode.url))?'':'visited');
                                
                                $('<a class="expand"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(nodeItem);

                                newList.add(groupList).append(nodeItem);
                            }
                        }

                        if(features.length > 0){
                            var newList = $('<li><strong>Features</strong><ol></ol></li>').appendTo(splitList).find('ol');
                            for(var i in features){
                                var relNode = features[i];
                                var nodeItem = $('<li><a href="'+base.get_param(relNode.url)+'">'+relNode.current.title+'</a></li>')
                                                    .data({
                                                        'slug': relNode.slug,
                                                        'node': relNode
                                                    })
                                                    .addClass(((base.parentNodes.indexOf(relNode.slug) < 0  && (typeof base.currentNode === 'undefined' || relNode.slug != base.currentNode.slug))  || relNode.slug == base.currentNode.slug )?'':'is_parent')
                                                    .addClass((base.visitedPages.indexOf(relNode.url) < 0 && (typeof base.currentNode === 'undefined' || relNode.url != base.currentNode.url))?'':'visited');
                                
                                $('<a class="expand"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(nodeItem);

                                newList.add(groupList).append(nodeItem);

                            }
                        }

                        if(tag_of.length > 0){
                            var newList = $('<li><strong>Tags</strong><ol class="tags"></ol></li>').appendTo(splitList).find('ol');
                            for(var i in tag_of){
                                var relNode = tag_of[i];
                                var nodeItem = $('<li><a href="'+base.get_param(relNode.url)+'">'+relNode.current.title+'</a></li>')
                                                    .data({
                                                        'slug': relNode.slug,
                                                        'node': relNode
                                                    })
                                                    .addClass(((base.parentNodes.indexOf(relNode.slug) < 0  && (typeof base.currentNode === 'undefined' || relNode.slug != base.currentNode.slug))  || relNode.slug == base.currentNode.slug )?'':'is_parent')
                                                    .addClass((base.visitedPages.indexOf(relNode.url) < 0 && (typeof base.currentNode === 'undefined' || relNode.url != base.currentNode.url))?'':'visited');
                                
                                $('<a class="expand"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(nodeItem);

                                newList.add(groupList).append(nodeItem);

                            }
                        }

                        if(annotates.length > 0){
                            var newList = $('<li><strong>Annotates</strong><ol></ol></li>').appendTo(splitList).find('ol');
                            for(var i in annotates){
                                var relNode = annotates[i];
                                var nodeItem = $('<li><a href="'+base.get_param(relNode.url)+'">'+relNode.current.title+'</a></li>')
                                                    .data({
                                                        'slug': relNode.slug,
                                                        'node': relNode
                                                    })
                                                    .addClass(((base.parentNodes.indexOf(relNode.slug) < 0  && (typeof base.currentNode === 'undefined' || relNode.slug != base.currentNode.slug))  || relNode.slug == base.currentNode.slug )?'':'is_parent')
                                                    .addClass((base.visitedPages.indexOf(relNode.url) < 0 && (typeof base.currentNode === 'undefined' || relNode.url != base.currentNode.url))?'':'visited');
                                
                                $('<a class="expand"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(nodeItem);

                                newList.add(groupList).append(nodeItem);

                            }
                        }

                        if(comments_on.length > 0){
                            var newList = $('<li><strong>Comments On</strong><ol></ol></li>').appendTo(splitList).find('ol');
                            for(var i in comments_on){
                                var relNode = comments_on[i];
                                var nodeItem = $('<li><a href="'+base.get_param(relNode.url)+'">'+relNode.current.title+'</a></li>')
                                                    .data({
                                                        'slug': relNode.slug,
                                                        'node': relNode
                                                    })
                                                    .addClass(((base.parentNodes.indexOf(relNode.slug) < 0  && (typeof base.currentNode === 'undefined' || relNode.slug != base.currentNode.slug))  || relNode.slug == base.currentNode.slug )?'':'is_parent')
                                                    .addClass((base.visitedPages.indexOf(relNode.url) < 0 && (typeof base.currentNode === 'undefined' || relNode.url != base.currentNode.url))?'':'visited');
                                
                                $('<a class="expand"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(nodeItem);

                                newList.add(groupList).append(nodeItem);
                            }
                        }
                        if(splitList.children('li').length > 1){
                            //Use the split list;
                            relationships.html(splitList);
                            groupList.remove();
                        }else if(groupList.children('li').length > 0){
                            relationships.html('<strong>Contents</strong>').append(groupList);
                            splitList.remove();
                        }else{
                            relationships.html('');
                            groupList.remove();
                            splitList.remove();
                        }
                        relationships.find('.expand').click(function(e){
                            var base = $('#scalarheader.navbar').data('scalarheader');
                            base.expandMenu($(this).parent().data('node'),$(this).parents('.expandedPage').data('index')+1);
                            container.find('li.active').removeClass('active');
                            $(this).parent().addClass('active');
                            e.preventDefault();
                            return false;
                        });
                }
                scalarapi.loadPage( container.data('slug'), true, handleRequest, null, 1, false, 1, 0, 20 );
            })(container);
        };

        base.buildSubmenu = function(listItem){
            var slug = listItem.data('slug');
            var node = scalarapi.getNode(slug);
            var pathChildren = node.getRelatedNodes( 'path', 'outgoing' );
            if(pathChildren.length > 0){
                listItem.addClass('dropdown');
                listItem.hover(function(e){
                    if(!base.usingMobileView){
                        base.initSubmenus(this);
                    }

                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }).children('a').first().addClass('dropdown-toggle').data('toggle','dropdown').attr({
                    "role" : "button",
                    "aria-expanded" : "false"
                }).click(function(e){
                    var base = $('#scalarheader.navbar').data('scalarheader');
                    if(base.usingMobileView){
                        base.initSubmenus(this);
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }else{
                        return true;
                    }
                });
                var new_list = $('<ul class="dropdown-menu" role="menu"></ul>').appendTo(listItem);
                var i = 0;
                for(c in pathChildren){
                    var child = pathChildren[c];
                    $( '<li><a href="' + base.get_param(child.url) + '">' + ( ++i ) + '. ' + child.getDisplayTitle() + '</a></li>' ).appendTo( new_list );
                }
            }

        }
        base.handleResize = function(extra_offset){

            var base = $('#scalarheader.navbar').data('scalarheader');
            var screen_width = $(window).width();
            var menu_button_visible = base.$el.find('.navbar-toggle').is(':visible');
            var max_width = (base.$el.width() - ($('#ScalarHeaderMenuLeft').outerWidth() + $('#ScalarHeaderMenuRight').outerWidth()))-30;
            if(base.isMobile || menu_button_visible){
                max_width -= base.$el.find('.navbar-toggle').outerWidth()+15;
                if(!base.usingMobileView){
                	base.$el.removeClass('short')
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
                        var max_width = $(window).width() - ($(this).offset().left + $(this).width());
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
            	title_width -= ($('#ScalarHeaderMenu>ul>li:not(.visible-xs)>a.headerIcon').length * 50) + 32; // 30 for the margin on the title, 2px for the border on the user menu items.
            	

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
                userList.append('<li><a href="' + base.get_param(addTemplateToURL( system_uri + '/dashboard?'+(base.is_author||base.is_commentator||base.is_reviewer?'book_id=' + base.book_id + '&' : '')+'zone=user#tabs-user', 'cantaloupe')) + '">Account</a></li>');
                userList.append('<li><a href="' + base.get_param(addTemplateToURL(system_uri+'/logout?action=do_logout&redirect_url='+redirect_url, 'cantaloupe')) + '">Sign out</a></li>');
            } else {
                userList.append('<li><a href="' + base.get_param(addTemplateToURL(system_uri+'/login?redirect_url='+redirect_url, 'cantaloupe')) + '">Sign in</a></li>');
                userList.append('<li><a href="' + base.get_param(addTemplateToURL(system_uri+'/register?redirect_url='+redirect_url, 'cantaloupe')) + '">Register</a></li>');
            }       
        }

        base.initSubmenus = function(el){
            var li = $(el).is('li.dropdown')?$(el):$(el).parent('li.dropdown');
            var a = $(el).is('li.dropdown>a')?$(el):$(el).children('a').first();
            var dropdown = li.find('ul.dropdown-menu');
            li.toggleClass('open').removeClass('left right').addClass(a.offset().left>($(window).width()/2)?'left':'right').siblings('li').removeClass('open left right');
            if(li.hasClass('right')){
                max_width = $(window).width() - (a.offset().left + a.width());
            }else{
                max_width = a.offset().left;
            }
            var max_height = ($(window).height() - li.offset().top)+$(window).scrollTop();
            if(!base.usingMobileView){
                dropdown.css({
                    'max-height':max_height+'px',
                    'max-width':max_width+'px'
                });
            }
        }

        base.load_recent = function(container){
            container.html($('<div></div>').scalarrecent().find('.history_content').html()).find('li>a').each(function(){
                var base = $('#scalarheader.navbar').data('scalarheader');
                $(this).removeClass('page').attr('href',base.get_param($(this).parent().attr('id')));
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
            if (url.indexOf('?') < 0) { url += '?h=1';} else {url += '&h=1';}
            return url;
        }
        base.getParents = function(node,depth){
            if(typeof base.currentNode !== 'undefined'){
                var in_path = node.getRelations('path', 'incoming', 'reverseindex');
                var featured = node.getRelations('referee', 'incoming', 'reverseindex');
                var tagged_by = node.getRelations('tag', 'incoming', 'reverseindex');
                var annotated_by = node.getRelations('annotation', 'incoming', 'reverseindex');
                var commented_by = node.getRelations('comment', 'incoming', 'reverseindex');
                
                var this_parent_nodes = [];
                var rel = '';
                for(n in in_path){
                    rel = in_path[n];
                    if(this_parent_nodes.indexOf(rel.body.slug)<0){
                        this_parent_nodes.push(rel.body.slug);
                    }
                    if(base.parentNodes.indexOf(rel.body.slug)<0){
                        base.parentNodes.push(rel.body.slug);
                    }
                }

                for(n in featured){
                    rel = featured[n];
                    if(this_parent_nodes.indexOf(rel.body.slug)<0){
                        this_parent_nodes.push(rel.body.slug);
                    }
                    if(base.parentNodes.indexOf(rel.body.slug)<0){
                        base.parentNodes.push(rel.body.slug);
                    }
                }

                for(n in tagged_by){
                    rel = tagged_by[n];
                    if(this_parent_nodes.indexOf(rel.body.slug)<0){
                        this_parent_nodes.push(rel.body.slug);
                    }
                    if(base.parentNodes.indexOf(rel.body.slug)<0){
                        base.parentNodes.push(rel.body.slug);
                    }
                }
                
                for(n in annotated_by){
                    rel = annotated_by[n];
                    if(this_parent_nodes.indexOf(rel.body.slug)<0){
                        this_parent_nodes.push(rel.body.slug);
                    }
                    if(base.parentNodes.indexOf(rel.body.slug)<0){
                        base.parentNodes.push(rel.body.slug);
                    }
                }
                
                for(n in commented_by){
                    rel = commented_by[n];
                    if(this_parent_nodes.indexOf(rel.body.slug)<0){
                        this_parent_nodes.push(rel.body.slug);
                    }
                    if(base.parentNodes.indexOf(rel.body.slug)<0){
                        base.parentNodes.push(rel.body.slug);
                    }
                }

                for(n in this_parent_nodes){
                    var slug = this_parent_nodes[n];
                    if(slug != base.currentNode.slug){
                        (function(slug,depth){
                            scalarapi.loadPage( slug, true, function(){
                                var base = $('#scalarheader.navbar').data('scalarheader');
                                if(base.checkedParents.indexOf(rel.body.slug)<0){
                                    base.checkedParents.push(rel.body.slug);
                                    base.getParents(scalarapi.getNode(slug),++depth);
                                }
                            }, null, 1, false, 1, 0, 20 );
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
                    menuItems = node.getRelatedNodes('referee', 'outgoing', true),
                    n = menuItems.length;
                if (n > 0) {
                    var tocNode, listItem;
                    for (i=n-1; i>=0; i--) { //going in reverse here, since we're prepending...
                        tocNode = menuItems[i];
                        listItem = $( '<li><a href="' + base.get_param(tocNode.url) + '">'+ tocNode.getDisplayTitle() + '</a></li>' )
                                    .prependTo( menu )
                                    .data({
                                        'slug': tocNode.slug,
                                        'node': tocNode
                                    })
                                    .addClass((base.parentNodes.indexOf(tocNode.slug) < 0 && (typeof base.currentNode === 'undefined' || tocNode.slug != base.currentNode.slug))?'':'is_parent')
                                    .addClass((base.visitedPages.indexOf(tocNode.url) < 0 && (typeof base.currentNode === 'undefined' || tocNode.url != base.currentNode.url))?'':'visited');
                        $('<a class="expand"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(listItem).click(function(e){
                            var base = $('#scalarheader.navbar').data('scalarheader');
                            var target_toc_item = $(this).parent().data('node');
                            base.expandMenu(target_toc_item,0);
                            var menu = $( '.mainMenu>.dropdown-menu .body>ol>li.active').removeClass('active');
                            $(this).parent().addClass('active');
                            e.preventDefault();
                            return false;
                        });
                    }
                }
            }

            $('.mainMenu').addClass('ready');

            
            base.$el.find('#ScalarHeaderDelete').click(function(){
                var result = confirm('Are you sure you wish to hide this page from view (move it to the trash)?');

                if (result) {
                    var base = $('#scalarheader.navbar').data('scalarheader');        
                    // assemble params for the trash action
                    var node = base.currentNode,
                        baseProperties =  {
                            'native': 1,
                            id: $('link#parent').attr('href'),
                            api_key: $('input[name="api_key"]').val()
                        },
                        pageData = {
                            action: 'UPDATE',
                            'scalar:urn': $('link#urn').attr('href'),
                            uriSegment: base.current_slug,
                            'dcterms:title': node.current.title,
                            'dcterms:description': node.current.description,
                            'sioc:content': node.current.content,
                            'rdf:type': node.baseType,
                            'scalar:metadata:is_live': 0
                        },
                        relationData = {};

                    // execute the trash action (i.e. make is_live=0)
                    scalarapi.modifyPageAndRelations(baseProperties, pageData, relationData, function(result) {
                        window.location.reload();
                    }, function(result) {
                        alert('An error occurred while moving this content to the trash. Please try again.');
                    });
                }
            });

            //First attempt at determining the uber-parents of this page.
            base.getParents(base.currentNode,0);
            
        }
        
        // Run initializer
        base.init();
    };
    
    $.scalarheader.defaultOptions = {
        root_url: ''
    };
    
    $.fn.scalarheader = function(options){
        return this.each(function(){
            (new $.scalarheader(this, options));
        });
    };
    
})(jQuery);