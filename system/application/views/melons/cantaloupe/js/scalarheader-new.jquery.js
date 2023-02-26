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
                  /*{
                    text: 'SoundCloud',
                    url: base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + 'import/soundcloud'),
                  },*/
                  {
                    text: 'YouTube',
                    url: base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + 'import/youtube'),
                  },
                  {
                    text: 'Harvard Art Museums',
                    url: base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + 'import/harvard_art_museums'),
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
          },
          annotateMedia: {
            id: 'ScalarHeaderAnnotate',
            icon: 'annotateIcon',
            url: base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + scalarapi.basepath(window.location.href) + '.annotation_editor'),
            label: 'Annotate media',
            description: 'Annotate the current media',
          },
          delete: {
            id: 'ScalarHeaderDelete',
            icon: 'deleteIcon',
            label: 'Delete',
            description: 'Make this content private',
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
        //Pop the title link DOM element off for a minute - we'll use this again later on.
        base.title_link = base.$el.find('#book-title').addClass('navbar-link').detach().attr('id','').addClass('book-title');

        let navbar = $('<div class="container-fluid"></div>')
        navbar.append(base.mobileHeader())
        navbar.append(base.desktopHeader())

        base.$el.append(navbar)
      }

      base.mobileHeader = function() {
        let mobileHeader = $('<div class="navbar-header"></div>')
        // this is where the title will go
        mobileHeader.append('<span class="navbar-text navbar-left pull-left title_wrapper visible-xs"></span>')
        mobileHeader.append(base.hamburgerMenu())
        return mobileHeader
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

        // TODO stopped at line 335

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
        const control = $('<li><a class="headerIcon" aria-role="button"><span class="hidden-sm hidden-md hidden-lg"></span></a></li>')
        control.attr('id', controlData.id)
        const labelId = 'label-' + controlData.label.split(' ')[0].toLowerCase()
        control.find('a').attr('id', controlData.icon).attr('aria-labelledby', labelId).attr('title', controlData.description)
        control.find('span').attr('id', labelId).append(controlData.label)
        if (controlData.url) control.find('a').attr('href', controlData.url).attr('aria-role', 'link')
        return control
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
            submenu.append(base.submenuItem(itemData.submenu[i]))
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

      base.init()

  }

  $.scalarheader.defaultOptions = {
      root_url: ''
  }

  $.fn.scalarheader = function(options){
      return new $.scalarheader(this, options);
  }

})(jQuery)