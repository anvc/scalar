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

        base.menuData = {
          wayfinding: [
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
        desktopHeader.append(base.utilityMenus())
        return desktopHeader
      }

      base.navigationMenus = function() {
        let navigationMenus = $('<ul class="nav navbar-nav" id="ScalarHeaderMenuLeft"></ul>')
        navigationMenus.append(base.homeLink())
        navigationMenus.append(base.mainMenu())
        navigationMenus.append(base.wayfindingMenu())
        return navigationMenus
      }

      base.titleAndCredit = function() {
        return $('<span class="navbar-text navbar-left pull-left title_wrapper hidden-xs" id="desktopTitleWrapper">'+
          '<span class="hidden-xs author_text">'+
            '<span id="header_authors" data-placement="bottom"></span>'+
          '</span>'+
        '</span>')
      }

      base.utilityMenus = function() {
        let utilityMenus = $('<ul class="nav navbar-nav navbar-right" id="ScalarHeaderMenuRight"></ul>')
        utilityMenus.append(base.searchControl())
        utilityMenus.append(base.helpControl())
        let user = scalarapi.model.getUser()
        if (user.canAdd()) utilityMenus.append(base.addPageControl())
        if (user.canCopyEdit() && !scalarapi.model.isEditorialPathPage) {
          utilityMenus.append(base.editContentControl())
        }
        if (user.canAdd() && base.currentNode?.hasScalarType('media')) {
          utilityMenus.append(base.annotateMediaControl())
        }

        // TODO stopped at line 335

        return utilityMenus
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

      base.mainMenu = function() {
        const mainMenu = $('<li class="dropdown mainMenu">'+
          '<a class="dropdown-toggle headerIcon" data-toggle="dropdown" aria-labelledby="label-toc" aria-expanded="false" role="menuitem" title="Main navigation for the project">'+
              '<span id="label-toc" class="visible-xs">Table of Contents</span>'+
          '</a>'+
          '<ul class="dropdown-menu mainMenuDropdown" role="menu">'+
              '<div id="mainMenuInside">'+
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
              '<div id="mainMenuSubmenus" class="tocMenu"></div>'+
          '</ul>'+
        '</li>')
        return mainMenu
      }

      base.wayfindingMenu = function() {
        let wayfindingMenu = $('<li class="dropdown" id="navMenu">'+
          '<a class="dropdown-toggle headerIcon" data-toggle="dropdown" aria-labelledby="label-wayfinding" aria-expanded="false" role="menuitem" title="Various ways to explore Scalar" id="wayfindingIcon">'+
              '<span id="label-wayfinding" class="visible-xs">Wayfinding</span>'+
          '</a>'+
          '<ul class="dropdown-menu" role="menu"></ul>'+
        '</li>')
        for (let i=0; i<base.menuData.wayfinding.length; i++) {
          wayfindingMenu.find('ul').append(base.menuItem(base.menuData.wayfinding[i]))
        }
        return wayfindingMenu
      }

      base.searchControl = function() {
        const searchControl = $('<li class="" id="ScalarHeaderMenuSearch">'+
          '<a class="headerIcon" id="searchIcon" aria-labelledby="label-search" aria-role="button" title="Open search field">'+
            '<span id="label-search" class="visible-xs">Search</span>'+
          '</a>'+
        '</li>'+
        '<li id="ScalarHeaderMenuSearchForm">'+
          '<form class="navbar-form" role="search" action="./">'+
            '<div class="form-group">'+
              '<input title="Search this book" type="text" class="form-control" placeholder="Search this book...">'+
              '<input type="submit" class="hidden_submit" value="Search">'+
            '</div>'+
          '</form>'+
        '</li>')
        return searchControl
      }

      base.helpControl = function() {
        const helpControl = $('<li id="ScalarHeaderHelp">'+
          '<a class="headerIcon" id="helpIcon" aria-labelledby="label-help" title="Display help information"><span id="label-help" class="hidden-sm hidden-md hidden-lg">Help</span></a>'+
        '</li>')
        return helpControl
      }

      base.addPageControl = function() {
        const addUrl = base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + 'new.edit')
        const addPageControl = $('<li id="ScalarHeaderNew">'+
          '<a class="headerIcon" href="' + addUrl + '" id="newIcon" aria-labelledby="label-new" aria-role="link" title="Create a new page">' + 
            '<span id="label-new" class="visible-xs">New page</span>' + 
          '</a>' + 
        '</li>')
        return addPageControl
      }

      base.editContentControl = function() {
        const editUrl = scalarapi.stripEdition(base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + base.current_slug + '.edit'))
        const editContentControl = $('<li id="ScalarHeaderEdit">' + 
          '<a class="headerIcon" href="' + editUrl + '" id="editIcon" aria-labelledby="label-edit" aria-role="link" title="Edit the current content">' + 
            '<span id="label-edit" class="visible-xs">Edit page</span>' + 
          '</a>' + 
        '</li>')
        return editContentControl
      }

      base.annotateMediaControl = function() {
        const annotateUrl = base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + scalarapi.basepath(window.location.href) + '.annotation_editor')
        const annotateMediaControl = $('<li id="ScalarHeaderAnnotate" class="hidden-xs">' + 
          '<a class="headerIcon" href="' + annotateUrl + '" id="annotateIcon" aria-labelledby="label-annotate" aria-role="link" title="Annotate the current media">' + 
            '<span id="label-annotate" class="visible-xs">Annotate media</span>' + 
          '</a>' + 
        '</li>')
        return annotateMediaControl
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