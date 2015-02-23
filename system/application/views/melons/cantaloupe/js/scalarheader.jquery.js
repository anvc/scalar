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
        // Add a reverse reference to the DOM object
        base.$el.data("scalarheader", base);

        base.init = function(){
            //Replace undefined options with defaults...
            base.options = $.extend({},$.scalarheader.defaultOptions, options);
            //Are we logged in? Check the RDF metadata.
            base.logged_in = $('link#logged_in').length > 0 && $('link#logged_in').attr('href')!='';

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
            base.bookId = parseInt($('#book-id').text());

            //We need some wrapper classes for Bootstrap, so we'll add those here. There are also some helper classes as well.
            base.$el.addClass('text-uppercase heading_font navbar navbar-inverse navbar-fixed-top').attr('id','scalarheader');

            //Store the home URL so that we can use these later without making extra queries on the DOM
            var home_url = base.$el.find('#book-title').attr("href");

            //Book URL and Home URL (the latter can simply be the Book URL, since it will redirect to /index)
            var book_url = $('link#parent').attr('href');
            var home_url = $('link#parent').attr('href');

            var index_url = book_url.slice(0,-1);
            index_url = index_url.substr(0, index_url.lastIndexOf('/'))+'/';

            //We might not have the current page loaded, but we can still get the slug; strip the book URL and the GET params from the current URL
            base.current_slug = window.location.href.split("?")[0].replace(book_url,'');

            //Pop the title link DOM element off for a minute - we'll use this again later on.
            var title_link = base.$el.find('#book-title').addClass('navbar-link').detach();
            //Handle the internal structure of the navbar now.
            var navbar_html  =  '<div class="container-fluid">'+
                                    '<div class="navbar-header">'+
                                        '<ul class="hidden-xs nav navbar-nav" id="ScalarHeaderMenuLeft">'+
                                            '<li class="hidden-xs">'+
                                                '<a href="'+addTemplateToURL( home_url, 'cantaloupe')+'" class="headerIcon">'+
                                                    '<img src="' + base.options.root_url + '/images/home_icon.png" alt="Click to go to home page." width="30" height="30" />'+
                                                '</a>'+
                                            '</li>'+
                                            '<li  class="dropdown mainMenu">'+
                                                '<a class="dropdown-toggle headerIcon" data-toggle="dropdown" role="button" aria-expanded="false">'+
                                                    '<img src="' + base.options.root_url + '/images/menu_icon.png" alt="Main menu. Roll over to access navigation to primary sections." width="30" height="30" />'+
                                                    '<span class="hidden-sm hidden-md hidden-lg">Main menu</span>'+
                                                '</a>'+
                                                '<ul class="dropdown-menu" role="menu">'+
                                                    '<li class="index_link static"><a>Index</a></li>'+
                                                    '<li role="presentation" class="static divider"></li>'+
                                                    '<li class="static"><a href="http://scalar.usc.edu/works/guide">Scalar User\'s Guide</a></li>'+
                                                    '<li class="static"><a href="'+index_url+'">More Scalar Projects</a></li>'+
                                                    '<li class="static"><a href="http://scalar.usc.edu/">More About Scalar</a></li>'+
                                                '</ul>'+
                                            '</li>'+
                                        '</ul>'+
                                        '<span class="navbar-text navbar-left pull-left" id="title_wrapper"><span class="hidden-xs author_text"> By <span id="header_authors"></span></span></span>'+
                                        '<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#ScalarHeaderMenu">'+
                                            '<span class="sr-only">Toggle navigation</span>'+
                                            '<span class="icon-bar"></span>'+
                                            '<span class="icon-bar"></span>'+
                                            '<span class="icon-bar"></span>'+
                                        '</button>'+
                                    '</div>'+
                                    '<div class="collapse navbar-collapse" id="ScalarHeaderMenu">'+
                                        '<ul class="nav navbar-nav navbar-right" id="ScalarHeaderMenuRight">'+
                                            '<li class="hidden-sm hidden-md hidden-lg">'+
                                                '<a href="'+addTemplateToURL( title_link.attr("href"), 'cantaloupe')+'" class="headerIcon">'+
                                                    '<img src="' + base.options.root_url + '/images/home_icon.png" alt="Click to go to home page." width="30" height="30" /><span>Home page</span>'+
                                                '</a>'+
                                            '</li>'+
                                            '<li  class="dropdown mainMenu hidden-sm hidden-md hidden-lg">'+
                                                '<a class="dropdown-toggle headerIcon" data-toggle="dropdown" role="button" aria-expanded="false">'+
                                                    '<img src="' + base.options.root_url + '/images/menu_icon.png" alt="Main menu. Roll over to access navigation to primary sections." width="30" height="30" /><span>Main menu</span>'+
                                                '</a>'+
                                                '<ul class="dropdown-menu" role="menu">'+
                                                    '<li class="index_link static"><a>Index</a></li>'+
                                                    '<li role="presentation" class="static divider"></li>'+
                                                    '<li class="static"><a href="http://scalar.usc.edu/works/guide">Scalar User\'s Guide</a></li>'+
                                                    '<li class="static"><a href="'+index_url+'">More Scalar Projects</a></li>'+
                                                    '<li class="static"><a href="http://scalar.usc.edu/">More About Scalar</a></li>'+
                                                '</ul>'+
                                            '</li>'+
                                            '<li class="" id="ScalarHeaderMenuSearch">'+
                                                '<a class="headerIcon">'+
                                                    '<img src="' + base.options.root_url + '/images/search_icon.png" alt="Search button. Click to open search field." width="30" height="30" />'+
                                                    '<span class="hidden-sm hidden-md hidden-lg">Search book</span>'+
                                                '</a>'+
                                            '</li>'+
                                            '<li id="ScalarHeaderMenuSearchForm">'+
                                                '<form class="navbar-form" role="search">'+
                                                    '<div class="form-group">'+
                                                        '<input type="text" class="form-control" placeholder="Search this book...">'+
                                                    '</div>'+
                                                  '</form>'+
                                            '</li>'+
                                            '<li id="ScalarHeaderHelp" class="hidden-xs">'+
                                                '<a class="headerIcon">'+
                                                    '<img src="' + base.options.root_url + '/images/help_icon.png" alt="Help button. Click to toggle help info." width="30" height="30" />'+
                                                '</a>'+
                                            '</li>'+
                                            ((base.is_author||base.is_commentator||base.is_reviewer)?
                                                '<li id="ScalarHeaderNew" class="hidden-xs"><a class="headerIcon" href="' + scalarapi.model.urlPrefix + 'new.edit"><img src="' + base.options.root_url + '/images/new_icon.png" alt="New page button. Click to create a new page." width="30" height="30" /><span class="hidden-sm hidden-md hidden-lg">New page</span></a></li>'+
                                                '<li id="ScalarHeaderEdit" class="hidden-xs"><a class="headerIcon" href="' + scalarapi.model.urlPrefix + base.current_slug + '.edit"><img src="' + base.options.root_url + '/images/edit_icon.png" alt="Edit button. Click to edit the current page or media." width="30" height="30" /><span class="hidden-sm hidden-md hidden-lg">Edit page</span></a></li>'+
                                                ((currentNode!=null && currentNode.hasScalarType( 'media' ))?'<li id="ScalarHeaderAnnotate" class="hidden-xs"><a class="headerIcon" href="' + scalarapi.model.urlPrefix + scalarapi.basepath( window.location.href ) + '.annotation_editor?template=honeydew"><img src="' + this.options.root_url + '/images/annotate_icon.png" alt="Annotate button. Click to annotate the current media." width="30" height="30" /><span class="hidden-sm hidden-md hidden-lg">Annotate media</span></a></li>':'')+
                                                '<li class="dropdown" id="ScalarHeaderImport" class="hidden-xs">'+
                                                    '<a class="dropdown-toggle headerIcon" data-toggle="dropdown" role="button" aria-expanded="false">'+
                                                        '<img src="' + this.options.root_url + '/images/import_icon.png" alt="Import menu. Roll over to show import options." width="30" height="30" />'+
                                                        '<span class="hidden-sm hidden-md hidden-lg">Import</span>'+
                                                    '</a>'+
                                                    '<ul class="dropdown-menu" role="menu" id="ScalarHeaderMenuImportList">'+
                                                        '<li class="dropdown">'+
                                                            '<a class="dropdown-toggle" data-toggle="dropdown" data-target="" role="button" aria-expanded="false">Affiliated archives</a>'+
                                                            '<ul class="dropdown-menu" role="menu">'+
                                                                '<li><a href="' + scalarapi.model.urlPrefix + 'import/critical_commons">Critical Commons</a></li>'+
                                                                '<li><a href="' + scalarapi.model.urlPrefix + 'import/cuban_theater_digital_archive">Cuban Theater Digital Archive</a></li>'+
                                                                '<li><a href="' + scalarapi.model.urlPrefix + 'import/hemispheric_institute">Hemispheric Institute Digital Video Library</a></li>'+
                                                                '<li><a href="' + scalarapi.model.urlPrefix + 'import/hypercities">Hypercities</a></li>'+
                                                                '<li><a href="' + scalarapi.model.urlPrefix + 'import/internet_archive">Internet Archive</a></li>'+
                                                                '<li><a href="' + scalarapi.model.urlPrefix + 'import/play">Play!</a></li>'+
                                                                '<li><a href="' + scalarapi.model.urlPrefix + 'import/shoah_foundation_vha_online">Shoah Foundation VHA Online</a></li>'+
                                                                '<li><a href="' + scalarapi.model.urlPrefix + 'import/shoah_foundation_vha">Shoah Foundation VHA (partner site)</a></li>'+
                                                            '</ul>'+
                                                        '</li>'+
                                                        '<li class="dropdown">'+
                                                            '<a class="dropdown-toggle" data-toggle="dropdown" data-target="" role="button" aria-expanded="false">Other archives</a>'+
                                                            '<ul class="dropdown-menu" role="menu">'+
                                                                '<li><a href="' + scalarapi.model.urlPrefix + 'import/getty_museum_collection">Getty Museum Collection</a></li>'+
                                                                '<li><a href="' + scalarapi.model.urlPrefix + 'import/prezi">Prezi</a></li>'+
                                                                '<li><a href="' + scalarapi.model.urlPrefix + 'import/soundcloud">SoundCloud</a></li>'+
                                                                '<li><a href="' + scalarapi.model.urlPrefix + 'import/the_metropolitan_museum_of_art">The Metropolitan Museum of Art</a></li>'+
                                                                '<li><a href="' + scalarapi.model.urlPrefix + 'import/vimeo">Vimeo</a></li>'+
                                                            '</ul>'+
                                                        '</li>'+
                                                        '<li>'+
                                                            '<a href="' + scalarapi.model.urlPrefix + 'upload">Local media files</a>'+
                                                        '</li>'+
                                                        '<li>'+
                                                            '<a href="' + scalarapi.model.urlPrefix + 'new.edit#type=media">Internet media files</a>'+
                                                        '</li>'+
                                                        '<li>'+
                                                            '<a href="' + scalarapi.model.urlPrefix + 'import/system">Other Scalar books</a>'+
                                                        '</li>'+
                                                    '</ul>'+
                                                '</li>'+
                                                ((!isNaN( base.bookId ))?
                                                    '<li id="ScalarHeaderDelete" class="hidden-xs"><a class="headerIcon"><img src="' + this.options.root_url + '/images/delete_icon.png" alt="Delete" width="30" height="30" /><span class="hidden-sm hidden-md hidden-lg">Delete page</span></a></li>'+
                                                    '<li id="ScalarHeaderOptions"><a href="' + system_uri + '/dashboard?book_id=' + base.bookId + '&zone=style#tabs-style" class="headerIcon"><img src="' + base.options.root_url + '/images/options_icon.png" alt="Options button. Click to access the Dashboard." width="30" height="30" /><span class="hidden-sm hidden-md hidden-lg">Dashboard</span></a></li>'
                                                :'')
                                            :'')+
                                            '<li class="dropdown" id="ScalarHeaderMenuMain">'+
                                                '<a class="dropdown-toggle headerIcon" data-toggle="dropdown" role="button" aria-expanded="false">'+
                                                    '<img src="' + base.options.root_url + '/images/user_icon.png" alt="User menu. Roll over to show account options." width="30" height="30" />'+
                                                    '<span class="hidden-sm hidden-md hidden-lg">User</span>'+
                                                '</a>'+
                                                '<ul class="dropdown-menu" role="menu" id="ScalarHeaderMenuUserList">'+
                                                '</ul>'+
                                            '</li>'+
                                        '</ul>'+
                                    '</div>'+
                                '</div>';

            base.$el.append(navbar_html).find('#title_wrapper').prepend(title_link);
            
            base.$el.find('#ScalarHeaderMenuLeft>li.dropdown, #ScalarHeaderMenuRight>li.dropdown').hover(function(e){
                var base = $('#scalarheader.navbar').data('scalarheader');
                if(!base.usingMobileView){
                    $(this).addClass('open').trigger('show.bs.dropdown');
                }else{
                    return true;
                }
            },function(e){
                var base = $('#scalarheader.navbar').data('scalarheader');
                if(!base.usingMobileView){
                    $(this).removeClass('open').trigger('hide.bs.dropdown');
                }else{
                    return true;
                }
            }).find("ul.dropdown-menu>li.dropdown").hover(function(e){
                var base = $('#scalarheader.navbar').data('scalarheader');
                if(!base.usingMobileView){
                    base.initSubmenus(this);
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }else{
                    return true;
                }
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
            author_text.parent('.author_text').show();
            

            base.handleBook(); // we used to bind this to the return of a loadBook call, but now we can call it immediately

            var helpElement = $('<div></div>').appendTo('body');
            base.help = $( helpElement ).scalarhelp( { root_url: modules_uri + '/cantaloupe' } );
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
                if(base.isMobile || $(window).width()<768){
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
                                $('#title_wrapper, #ScalarHeaderMenuSearch').hide().show(0);
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
                                $('#title_wrapper, #ScalarHeaderMenuSearch').hide().show(0);
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
                if(base.isMobile || $(window).width()<768){
                    $('#ScalarHeaderMenuSearchForm').removeClass('open');
                }else{
                    $('#ScalarHeaderMenuSearchForm').css('width','0px');
                }
                $('#ScalarHeaderMenuSearch').removeClass('search_open');
                e.preventDefault();
                return false;
            });

            $( '#ScalarHeaderMenuLeft .mainMenu' ).on('show.bs.dropdown',function(){
                $('#scalarheader.navbar').data('scalarheader').renderMainMenuDropdownChildren();
            });

            $(window).resize(function(){base.handleResize()});
            base.handleResize();
        };
        base.renderMainMenuDropdownChildren = function(){
            var mainMenu = $( '#ScalarHeaderMenuLeft .mainMenu' );
            if(mainMenu.hasClass('ready') && !mainMenu.hasClass('loaded')){
                mainMenu.addClass('loaded');
                var unloaded = mainMenu.find('li:not(".static, .loaded, .in_progress")');
                if(unloaded.length>0){
                    unloaded.each(function(){
                        listItem = $(this);
                        listItem.addClass('in_progress');
                        
                        tocNode = scalarapi.getNode($(this).data('slug'));

                        var pathChildren = tocNode.getRelatedNodes( 'path', 'outgoing' );

                        if(pathChildren.length > 0){
                            base.buildSubmenu($(this));
                            listItem.removeClass('in_progress').addClass('loaded');
                        }else{
                            if ( pathChildren.length == 0 ) {
                                // Sort of crafty here - we're doing a self-calling anonymous function here to pull this element out of the scope; 
                                // We are then shoving it back into this class when we get the ajax response; this allows us to pass the call directly back to ScalarHeader
                                // without having to build up a queue of stored elements
                                (function(listItem,base){
                                    var handleRequest = function(){ //this function is scoped instantaneously to this anonymous function, so we can pass it to loadPage while preserving the listItem reference
                                            listItem.removeClass('in_progress').addClass('loaded');
                                            base.buildSubmenu(listItem);
                                    }
                                    scalarapi.loadPage( listItem.data('slug'), true, handleRequest, null, 1, false, 'path', 0, 20 );
                                }($(this),base));
                            }
                        }
                    });
                }
            }
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
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }else{
                        return true;
                    }
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
                    $( '<li><a href="' + child.url + '">' + ( ++i ) + '. ' + child.getDisplayTitle() + '</a></li>' ).appendTo( new_list );
                }
            }

        }
        base.handleResize = function(extra_offset){
            var base = $('#scalarheader.navbar').data('scalarheader');
            var screen_width = $(window).width();
            var max_width = (base.$el.width() - ($('#ScalarHeaderMenuLeft').outerWidth() + $('#ScalarHeaderMenuRight').outerWidth()))-30;

            if(base.isMobile || screen_width<768){
                max_width -= base.$el.find('.navbar-toggle').outerWidth()+15;
                if(!base.usingMobileView){
                    //reset search form if switching to mobile view
                    $('#ScalarHeaderMenuSearchForm').stop().css('width','auto').removeClass('open');
                    $('#ScalarHeaderMenuSearch').removeClass('search_open');
                }
                base.usingMobileView = true;
            }else{
                if(base.usingMobileView){
                    //reset search form if switching from mobile view
                    $('#ScalarHeaderMenuSearchForm').css('width','0px');
                    $('#ScalarHeaderMenuSearch').removeClass('search_open');
                }
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
            if(typeof extra_offset != 'undefined' && extra_offset!=null){
                max_width -= extra_offset;
            }
            $('#title_wrapper').css('max-width',max_width+'px');

            base.$el.removeClass('mobile_view desktop_view').addClass(base.usingMobileView?'mobile_view':'desktop_view');
        };

        base.buildUserMenu = function(userList){
            var redirect_url = '';
            if ( currentNode != null ) {
                redirect_url = encodeURIComponent(currentNode.url);
            }else{
            	redirect_url = encodeURIComponent(window.location.href);
            }

            if (base.logged_in){
                userList.append('<li><a href="' + addTemplateToURL( system_uri + '/dashboard?'+(base.is_author||base.is_commentator||base.is_reviewer?'book_id=' + base.book_id + '&' : '')+'zone=user#tabs-user', 'cantaloupe') + '">Account</a></li>');
                userList.append('<li><a href="' + addTemplateToURL(system_uri+'/logout?action=do_logout&redirect_url='+redirect_url, 'cantaloupe') + '">Sign out</a></li>');
            } else {
                userList.append('<li><a href="' + addTemplateToURL(system_uri+'/login?redirect_url='+redirect_url, 'cantaloupe') + '">Sign in</a></li>');
                userList.append('<li><a href="' + addTemplateToURL(system_uri+'/register?redirect_url='+redirect_url, 'cantaloupe') + '">Register</a></li>');
            }       
        }

        base.initSubmenus = function(el){
            var li = $(el).is('li.dropdown')?$(el):$(el).parent('li.dropdown');
            var a = $(el).is('li.dropdown>a')?$(el):$(el).children('a').first();
            li.toggleClass('open').removeClass('left right').addClass(a.offset().left>($(window).width()/2)?'left':'right').siblings('li').removeClass('open left right');
            if(a.hasClass('right')){
                max_width -= $(window).width() - (a.offset().left + a.width());
            }else{
                max_width = a.offset().left;
            }
            a.find('ul.dropdown-menu').css('max-width',max_width+'px');
        }

        base.handleBook = function(){
            //Build the main menu
            var node = scalarapi.model.getMainMenuNode();

            var menu = $( '.mainMenu>.dropdown-menu' );

            if (node != null) {
                var i, subMenu, subMenuItem,
                    menuItems = node.getRelatedNodes('referee', 'outgoing', true),
                    n = menuItems.length;
                if (n > 0) {
                    var tocNode, listItem;
                    for (i=n-1; i>=0; i--) { //going in reverse here, since we're prepending...
                        tocNode = menuItems[i];
                        listItem = $( '<li><a href="' + tocNode.url + '">' + ( i + 1 ) + '. ' + tocNode.getDisplayTitle() + '</a></li>' ).prependTo( menu ).data( 'slug', tocNode.slug );
                    }
                }
            }

            $('.mainMenu').addClass('ready');
            if($( '#ScalarHeaderMenuLeft .mainMenu' ).hasClass('open')){
                base.renderMainMenuDropdownChildren();
            }

            
            base.$el.find('#ScalarHeaderDelete').click(function(){
                var result = confirm('Are you sure you wish to hide this page from view (move it to the trash)?');

                if (result) {
                    var base = $('#scalarheader.navbar').data('scalarheader');        
                    // assemble params for the trash action
                    var node = currentNode,
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