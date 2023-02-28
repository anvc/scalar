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
      var base = this
      base.$el = $(el)
      base.el = el

      base.init = function() {
        base.options = $.extend({},$.scalarheader.defaultOptions, options);
        base.currentNode = scalarapi.model.getCurrentPageNode();
        base.index_url = scalarapi.model.parent_uri.slice(0, -1);
        base.index_url = base.index_url.substr(0, base.index_url.lastIndexOf('/'))+'/';
        //We might not have the current page loaded, but we can still get the slug; strip the book URL and the GET params from the current URL
        base.current_slug = window.location.href.split("?")[0].split("#")[0].replace(scalarapi.model.parent_uri,'');

        base.menuData = {
          main: {
            menu: {
              class: 'mainMenu',
              label: 'Table of Contents',
              description: 'Main navigation for the project',
              contentsClass: 'mainMenuDropdown',
              contents: '<div id="mainMenuInside">'+
                '<div class="close"><span class="menuIcon closeIcon"></span></div>'+
                '<li class="header"><h2>Table of Contents</h2></li>'+
                '<li class="top hidden-xs home_link static">'+ // not visible on mobile (redundant)
                  '<a href="'+base.applyCurrentQueryVarsToURL(scalarapi.model.parent_uri)+'"><span class="menuIcon" id="homeIcon"></span>Home</a>'+
                '</li>'+
                '<li class="body">'+
                  '<ol>'+
                  '</ol>'+
                '</li>'+
                '<li class="bottom index_link static dropdown" id="indexLink">'+
                  '<a role="menuitem"><span class="menuIcon" id="indexIcon"></span>Index</a>'+
                '</li>'+
              '</div>'+
              '<div id="mainMenuSubmenus" class="tocMenu"></div>'
            },
            items: [],
          },
          wayfinding: {
            menu: {
              id: 'navMenu',
              label: 'Wayfinding',
              description: 'Various ways to explore Scalar',
              icon: 'wayfindingIcon',
            },
            items: [
              {
                id: 'recent_menu',
                text: 'Recent',
                icon: 'recentIcon',
                placeholder: '<li><i class="loader"></i></li>'
              },
              {
                id: 'lenses_menu',
                text: 'Lenses',
                icon: 'lensIcon',
              },
              {
                id: 'vis_menu',
                text: 'Visualizations',
                icon: 'visIcon',
                submenu: [
                  {
                    text: 'Current',
                    icon: 'currentIcon',
                    data: { vistype: 'viscurrent' },
                  },
                  {
                    text: 'Contents',
                    icon: 'tocIcon',
                    data: { vistype: 'vistoc' },
                  },
                  {
                    text: 'Connections',
                    icon: 'connectionsIcon',
                    data: { vistype: 'visconnections' },
                  },
                  {
                    text: 'Grid',
                    icon: 'gridIcon',
                    data: { vistype: 'visindex' },
                  },
                  {
                    text: 'Map',
                    icon: 'mapIcon',
                    data: { vistype: 'vismap' },
                  },
                  {
                    text: 'Radial',
                    icon: 'radialIcon',
                    data: { vistype: 'visradial' },
                  },
                  {
                    text: 'Path',
                    icon: 'pathIcon',
                    data: { vistype: 'vispath' },
                  },
                  {
                    text: 'Media',
                    icon: 'mediaIcon',
                    data: { vistype: 'vismedia' },
                  },
                  {
                    text: 'Tag',
                    icon: 'tagIcon',
                    data: { vistype: 'vistag' },
                  },
                  {
                    text: 'Word Cloud',
                    icon: 'wordCloudIcon',
                    data: { vistype: 'viswordcloud' },
                  },
                ],
              },
              {
                id: 'scalar_menu',
                text: 'Scalar',
                icon: 'scalarIcon',
                submenu: [
                  {
                    text: 'About Scalar',
                    url: 'https://scalar.usc.edu/',
                    target: '_scalar',
                  },
                  {
                    text: 'User’s Guide',
                    url: 'https://scalar.usc.edu/works/guide2',
                    target: '_scalar',
                  },
                  {
                    text: 'More Scalar Projects',
                    url: base.applyCurrentQueryVarsToURL(base.index_url),
                    target: '_scalar',
                  },
                ],
              },
            ]
          },
          import: {
            menu: {
              id: 'ScalarHeaderAnnotate',
              class: 'hidden-xs',
              label: 'Import',
              description: 'Media import options',
              icon: 'importIcon',
              contentsId: 'ScalarHeaderMenuImportList'
            },
            items: [
              {
                text: 'Affiliated archives',
                submenu: [
                  {
                    text: 'Critical Commons',
                    url: base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + 'import/critical_commons'),
                  },
                  {
                    text: 'Internet Archive',
                    url: base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + 'import/internet_archive'),
                  },
                  {
                    text: 'Shoah Foundation VHA Online',
                    url: base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + 'import/shoah_foundation_vha_online'),
                  },
                  {
                    text: 'Shoah Foundation VHA (partner site)',
                    url: base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + 'import/shoah_foundation_vha'),
                  },
                ],
              },
              {
                text: 'Other archives',
                submenu: [
                  {
                    text: 'Omeka sites',
                    url: base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + 'import/omeka'),
                  },
                  {
                    text: 'Omeka S sites',
                    url: base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + 'import/omeka_s'),
                  },
                  {
                    text: 'YouTube',
                    url: base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + 'import/youtube'),
                  },
                  {
                    text: 'Harvard Art Museums',
                    url: base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + 'import/harvard_art_museums'),
                    include: $('link#harvard_art_museums_key').attr('href')
                  },
                ],
              },
              {
                text: 'Files and URLs',
                submenu: [
                  {
                    text: 'Upload media files',
                    url: base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + 'upload'),
                  },
                  {
                    text: 'Link to media files',
                    url: base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + 'new.edit?type=media&'),
                  },
                ],
              },
            ],
          },
          account: {
            menu: {
              id: 'userMenu',
              class: 'hidden-xs',
              label: 'Account',
              description: 'User account options',
              icon: 'userIcon',
              contentsId: 'ScalarHeaderMenuUserList'
            },
            items: [
            ]
          },
        }

        base.controlData = {
          search: {
            id: 'ScalarHeaderMenuSearch',
            icon: 'searchIcon',
            label: 'Search',
            description: 'Open search field',
          },
          help: {
            id: 'ScalarHeaderHelp',
            icon: 'helpIcon',
            label: 'Help',
            description: 'Display help information'
          },
          addPage: {
            id: 'ScalarHeaderNew',
            icon: 'newIcon',
            url: base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + 'new.edit'),
            label: 'New page',
            description: 'Create a new page',
          },
          editContent: {
            id: 'ScalarHeaderEdit',
            icon: 'editIcon',
            url: scalarapi.stripEdition(base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + base.current_slug + '.edit')),
            label: 'New page',
            description: 'Create a new page',
            include: scalarapi.model.getUser().canEditThisUrl(window.location.href)
          },
          annotateMedia: {
            id: 'ScalarHeaderAnnotate',
            icon: 'annotateIcon',
            url: base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + scalarapi.basepath(window.location.href) + '.annotation_editor'),
            label: 'Annotate media',
            description: 'Annotate the current media',
            include: scalarapi.model.getUser().canEditThisUrl(window.location.href)
          },
          delete: {
            id: 'ScalarHeaderDelete',
            icon: 'deleteIcon',
            label: 'Delete',
            description: 'Make this content private',
            include: scalarapi.model.getUser().canDeleteThisUrl(window.location.href)
          },
          editorialPath: {
            id: 'ScalarHeaderEditorialPath',
            icon: 'editorialPathIcon',
            url: base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + 'editorialpath'),
            label: 'Editorial path',
            description: 'Access a catalog of items for editorial review',
          },
          dashboard: {
            id: 'ScalarHeaderOptions',
            icon: 'optionsIcon',
            url: system_uri + '/dashboard?book_id=' + scalarapi.model.bookId + '&zone=style#tabs-style',
            label: 'Dashboard',
            description: 'Open the Dashboard',
          }
        }

        // add classes and attributes
        if (scalarapi.model.getUser().canEdit()) base.$el.addClass('edit_enabled');
        if (scalarapi.model.usingHypothesis) base.$el.addClass('hypothesis_active');
        base.$el.addClass('text-uppercase heading_font navbar navbar-inverse navbar-fixed-top').attr('id','scalarheader');

        // pop the title link DOM element off for a minute - we'll use this again later on
        base.title_link = base.$el.find('#book-title').addClass('navbar-link').detach().attr('id','').addClass('book-title');

        let navbar = $('<div class="container-fluid"></div>')
        navbar.append(base.mobileHeader())
        navbar.append(base.desktopHeader())
        base.setupMobileMainMenu()
        base.addCustomMenuItems()
        base.setupMainMenuEventHandling()
        base.setupGlobalMenuEventHandling()

        // TODO stopped at line 636

        base.$el.append(navbar).find('.title_wrapper').prepend(base.title_link.clone());
      }

      base.mobileHeader = function() {
        let mobileHeader = $('<div class="navbar-header"></div>')
        // this is where the title will go
        mobileHeader.append('<span class="navbar-text navbar-left pull-left title_wrapper visible-xs"></span>')
        mobileHeader.append(base.hamburgerMenu())
        return mobileHeader
      }

      base.setupMobileMainMenu = function() {
        base.mobileMainMenu = $('<div id="mobileMainMenuSubmenus" class="heading_font tocMenu">' + 
          '<div class="toc">' + 
            '<header class="mainMenu">' + 
              '<a class="headerIcon">' + 
                '<span class="visible-xs">Table of Contents</span>' + 
              '</a>' + 
            '</header>' + 
            '<footer>' + 
              '<div class="footer_content">' + 
                '<button class="btn back text-center">' + 
                  '<img src="' + $('link#approot').attr('href') + 'views/melons/cantaloupe/images/back_icon.png" width="30" alt="Go back"/>' + 
                '</button>' + 
                '<button class="btn close_menu text-center">' + 
                  '<img src="' + $('link#approot').attr('href') + 'views/melons/cantaloupe/images/close_menu_icon.png" width="30" alt="Close all submenus"/>' + 
                '</button>' + 
              '</div>' + 
            '</footer>' + 
          '</div>' + 
          '<div class="pages"></div>' + 
        '</div>').appendTo('body');
        base.mobileMainMenu.find('.close_menu, header > a').on('click', function(e){
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
      }

      base.setupMainMenuEventHandling = function() {

        // main menu opens
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

        // main menu closes
        base.$el.find('#ScalarHeaderMenuLeft .mainMenu').on('hide.bs.dropdown',function(){
            if(base.usingMobileView || $('#mainMenuSubmenus .expandedPage').length == 0){
                $('body').removeClass('in_menu'); //.css('margin-top','0px').scrollTop($('body').data('scrollTop'));
                $(this).find('li.active').removeClass('active');
                $('#mainMenuInside').css('max-height','').removeClass('tall');
                return true;
            }else{
                $(this).addClass('open').find('[aria-expanded="false"]').attr('aria-expanded', 'true');
                return false;
            }
        });

        // submenu opens
        base.$el.find('.mainMenu>a.dropdown-toggle').on('click', function(e){
            $(this).attr('aria-expanded', 'true').parent('.mainMenu').addClass('open').trigger('show.bs.dropdown').find('[aria-expanded="false"]').attr('aria-expanded', 'true');
            e.preventDefault();
            e.stopPropagation();
            return false;
        });

        // submenu closes
        base.$el.find('.mainMenuDropdown>#mainMenuInside>.close').on('click', function(e){
            $('#mainMenuSubmenus').hide().find('.expandedPage').remove();
            base.$el.find('#ScalarHeaderMenuLeft .mainMenu').removeClass('open').trigger('hide.bs.dropdown').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
      }

      base.setupGlobalMenuEventHandling = function() {
        // Top level menu item
        base.$el.find('#ScalarHeaderMenuLeft>li.dropdown, #ScalarHeaderMenuRight>li.dropdown').on('mouseenter', function(e){
            var base = $('#scalarheader.navbar').data('scalarheader');
            if(!base.usingMobileView){
                if(!$(this).hasClass('mainMenu') && $('#mainMenuSubmenus .expandedPage').length > 0){
                    $('#mainMenuSubmenus .expandedPage').remove();
                    $('#mainMenusSubmenus').hide();
                    base.$el.find('#ScalarHeaderMenuLeft .mainMenu').removeClass('open').trigger('hide.bs.dropdown').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
                }else if($('#mainMenuSubmenus .expandedPage').length == 0){
                    $('.mainMenuDropdown, #ScalarHeaderMenu').css({
                        'transform' : 'translateX(0px)',
                        '-webkit-transform' : 'translateX(0px)',
                        '-moz-transform' : 'translateX(0px)'
                    }).removeClass('expandedMenuOpen');
                }
                $(this).addClass('open').trigger('show.bs.dropdown').find('[aria-expanded="false"]').attr('aria-expanded', 'true');
                console.log(this)
            }
        }).on('mouseleave', function(e){
          // TODO: this is the area that is causing Win10 touch problems ~Craig
            var base = $('#scalarheader.navbar').data('scalarheader');
            if(!base.usingMobileView){
                $(this).removeClass('open').trigger('hide.bs.dropdown').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
            }
        }).on('keydown', function(e){
            // press ESC
            if(e.which == 27){
                var subdropdowns_open = $(this).find('li.dropdown.open');
                if(subdropdowns_open.length > 0){
                    subdropdowns_open.removeClass('open').trigger('hide.bs.dropdown').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
                    subdropdowns_open.first().children('a').trigger('focus');
                }else{
                    $(this).removeClass('open').trigger('hide.bs.dropdown').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
                    $(this).children('a').trigger('focus');
                }
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
        }).find("ul.dropdown-menu li.dropdown").on('mouseenter', function(e){
            // individual menu items
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
                        $(this).removeClass('open').trigger('hide.bs.dropdown').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
                    }
                });

                base.initSubmenus(this);
            }
        }).on('mouseleave', function(e){
            var base = $('#scalarheader.navbar').data('scalarheader');
            if(!base.usingMobileView){
                $(this).data('hoverEvent',setTimeout($.proxy(function(){
                    $(this).removeClass('open').trigger('hide.bs.dropdown').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
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
                    // up
                    $(this).prev().children('a').trigger('focus');
                    e.stopPropagation();
                    return false;
                }else if(e.which == 40){
                    // down
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
                // right arrow, enter, space
                if(e.which == 39 || e.which == 13 || e.which == 32){
                    console.log($(this).parent())
                    base.initSubmenus($(this).parent());
                    e.stopPropagation();
                    return false;
                }
            }
        })
      }

      base.hamburgerMenu = function() {
        return $('<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#ScalarHeaderMenu">'+
          '<span class="sr-only">Toggle navigation</span>'+
          '<span class="icon-bar"></span>'+
          '<span class="icon-bar"></span>'+
          '<span class="icon-bar"></span>'+
        '</button>')
      }

      base.desktopHeader = function() {
        let desktopHeader = $('<div class="collapse navbar-collapse" id="ScalarHeaderMenu"></div>')
        desktopHeader.append(base.navigationMenus())
        desktopHeader.append(base.titleAndCredit())
        desktopHeader.append(base.utilityOptions())
        return desktopHeader
      }

      base.navigationMenus = function() {
        let navigationMenus = $('<ul class="nav navbar-nav" id="ScalarHeaderMenuLeft"></ul>')
        navigationMenus.append(base.homeLink())
        navigationMenus.append(base.headerMenu(base.menuData.main))
        navigationMenus.append(base.headerMenu(base.menuData.wayfinding))
        return navigationMenus
      }

      base.titleAndCredit = function() {
        return $('<span class="navbar-text navbar-left pull-left title_wrapper hidden-xs" id="desktopTitleWrapper">'+
          '<span class="hidden-xs author_text">'+
            '<span id="header_authors" data-placement="bottom"></span>'+
          '</span>'+
        '</span>')
      }

      base.utilityOptions = function() {
        let utilityOptions = $('<ul class="nav navbar-nav navbar-right" id="ScalarHeaderMenuRight"></ul>')
        utilityOptions.append(base.headerControl(base.controlData.search))
        utilityOptions.append(base.searchForm())
        utilityOptions.append(base.headerControl(base.controlData.help))
        let user = scalarapi.model.getUser()
        if (user.canAdd()) utilityOptions.append(base.headerControl(base.controlData.addPage))
        if (user.canCopyEdit() && !scalarapi.model.isEditorialPathPage) {
          utilityOptions.append(base.headerControl(base.controlData.editContent))
        }
        if (user.canAdd() && base.currentNode?.hasScalarType('media')) {
          utilityOptions.append(base.headerControl(base.controlData.annotateMedia))
        }
        if (user.role == ScalarRole.Author) {
          utilityOptions.append(base.headerMenu(base.menuData.import))
        }
        if (user.role == ScalarRole.Author || user.role == ScalarRole.Editor) {
          if (user.canDelete() && !scalarapi.model.isEditorialPathPage && base.currentNode != null) {
            utilityOptions.append(base.headerControl(base.controlData.delete))
          }
          if (scalarapi.model.editorialWorkflowEnabled && !scalarapi.model.isEditorialPathPage && scalarapi.getEdition(document.location.href) == -1) {
            utilityOptions.append(base.headerControl(base.controlData.editorialPath))
          }
          utilityOptions.append(base.headerControl(base.controlData.dashboard))
        }
        utilityOptions.append(base.headerMenu(base.menuData.account))
        base.addAirtableImportItems()

        return utilityOptions
      }

      base.homeLink = function() {
        // home link is visible only on mobile
        const homeUrl = base.applyCurrentQueryVarsToURL(addTemplateToURL( base.title_link.attr("href"), 'cantaloupe'))
        const homeLink = $('<li class="visible-xs">'+
          '<a href="' + homeUrl + '" class="headerIcon" id="homeLink">'+
            '<span class="visible-xs">Home Page</span>'+
          '</a>'+
        '</li>')
        return homeLink
      }

      base.headerMenu = function(menuData) {
        const menu = base.menuStructure(menuData.menu)
        for (let i=0; i<menuData.items.length; i++) {
          menu.find('ul').append(base.menuItem(menuData.items[i]))
        }
        return menu
      }

      base.menuStructure = function(menuData) {
        let menuStructure = $('<li class="dropdown">'+
          '<a class="dropdown-toggle headerIcon" data-toggle="dropdown" aria-expanded="false" role="menuitem">'+
            '<span class="visible-xs"></span>'+
          '</a>'+
          '<ul class="dropdown-menu" role="menu"></ul>'+
        '</li>')
        if (menuData.id) menuStructure.attr('id', menuData.id)
        if (menuData.class) menuStructure.addClass(menuData.class)
        const labelId = 'label-' + menuData.label.split(' ')[0].toLowerCase()
        menuStructure.find('span').attr('id', labelId).append(menuData.label)
        menuStructure.find('a').attr('id', menuData.icon).attr('aria-labelledby', labelId).attr('title', menuData.description)
        if (menuData.contentsId) menuStructure.find('ul').attr('id', menuData.contentsId)
        if (menuData.contentsClass) menuStructure.find('ul').addClass(menuData.contentsClass)
        if (menuData.contents) menuStructure.find('ul').append($(menuData.contents))
        return menuStructure
      }

      base.headerControl = function(controlData) {
        if (controlData.include == undefined || controlData.include) {
          const control = $('<li><a class="headerIcon" aria-role="button"><span class="hidden-sm hidden-md hidden-lg"></span></a></li>')
          control.attr('id', controlData.id)
          const labelId = 'label-' + controlData.label.split(' ')[0].toLowerCase()
          control.find('a').attr('id', controlData.icon).attr('aria-labelledby', labelId).attr('title', controlData.description)
          control.find('span').attr('id', labelId).append(controlData.label)
          if (controlData.url) control.find('a').attr('href', controlData.url).attr('aria-role', 'link')
          return control
        } else {
          return null
        }
      }

      base.searchForm = function() {
        const searchForm = $('<li id="ScalarHeaderMenuSearchForm">'+
          '<form class="navbar-form" role="search" action="./">'+
            '<div class="form-group">'+
              '<input title="Search this book" type="text" class="form-control" placeholder="Search this book...">'+
              '<input type="submit" class="hidden_submit" value="Search">'+
            '</div>'+
          '</form>'+
        '</li>')
        return searchForm
      }

      base.addAirtableImportItems = function() {
        var $airtables = $('link#airtable');
        if ($airtables.length) {
          for (var j = 0; j < $airtables.length; j++) {
            navbar.find('#ScalarHeaderMenuImportList').find('ul.other-archives').append('<li><a href="' + base.get_param(scalarapi.model.urlPrefix + 'import/airtable/'+encodeURIComponent($airtables.eq(j).attr('href'))) + '">Airtable: '+$airtables.eq(j).attr('href')+'</a></li>');
          }
        }
      }

      base.menuItem = function(itemData) {
        let listItem = $(`<li id="${itemData.id}" class="dropdown"></li>`)
        let link = $('<a role="menuitem" aria-expanded="false"><span class="menuIcon rightArrowIcon pull-right"></a>')
        if (itemData.icon) {
          link.append(`<span class="menuIcon" id="${itemData.icon}"></span>`)
        }
        link.append(itemData.text)
        listItem.append(link)
        if (itemData.submenu) {
          submenu = $('<ul class="dropdown-menu" role="menu"><ul>')
          for (let i=0; i<itemData.submenu.length; i++) {
            if (itemData.submenu[i].include == undefined || itemData.submenu[i].include) {
              submenu.append(base.submenuItem(itemData.submenu[i]))
            }
          }
          listItem.append(submenu)
        }
        return listItem
      }

      base.submenuItem = function(itemData) {
        let listItem = $('<li></li>')
        for (let key in itemData.data) {
          listItem.attr('data-'+key, itemData.data[key])
        }
        let link = $('<a role="menuitem"></a>')
        if (itemData.url) {
          link.attr('href', itemData.url)
        } else {
          link.attr('href', '#')
        }
        if (itemData.target) {
          link.attr('target', itemData.target)
        }
        if (itemData.icon) {
          link.append(`<span class="menuIcon" id="${itemData.icon}"></span>`)
        }
        link.append(itemData.text)
        listItem.append(link)
        return listItem
      }

      base.applyCurrentQueryVarsToURL = function(url){
        // @TODO: Add non-book related query vars as well
        var allowableVars = ['path','m'];
        const queryVars = scalarapi.getQueryVars(window.location.href)
        let currentVar
        for (let i=0; i<allowableVars.length; i++) {
          currentVar = allowableVars[i]
          if (queryVars[currentVar]) {
            if (url.indexOf('?') == -1) {
              url += '?'
            } else {
              url += '&'
            }
            url += currentVar + '=' + queryVars[currentVar]
          }
        }
        return url;
      }

      base.addCustomMenuItems = function() {
        if ('undefined' != typeof(customScalarHeaderMenuLeftItems) && Array.isArray(customScalarHeaderMenuLeftItems)) {
          for (var c = 0; c < customScalarHeaderMenuLeftItems.length; c++) {
            customnavbaritem = $('<li class="customMenuItem">'+customScalarHeaderMenuLeftItems[c]+'</li>');
            navbar.find('#ScalarHeaderMenuLeft').append(customnavbaritem);
          }
        }
      }

      base.init()

  }

  $.scalarheader.defaultOptions = {
      root_url: ''
  }

  $.fn.scalarheader = function(options){
      return new $.scalarheader(this, options);
  }

})(jQuery)