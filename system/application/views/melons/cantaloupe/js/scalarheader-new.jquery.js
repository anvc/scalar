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
        return desktopHeader
      }

      base.navigationMenus = function() {
        let navigationMenus = $('<ul class="nav navbar-nav" id="ScalarHeaderMenuLeft"></ul>')

        navigationMenus.append(base.homeLink())
        navigationMenus.append(base.mainMenu())
        navigationMenus.append(base.wayfindingMenu())

        return navigationMenus
      }

      base.homeLink = function() {
        // home link is visible only on mobile
        let homeLink = $('<li class="visible-xs">'+
          '<a href="'+base.applyCurrentQueryVarsToURL(addTemplateToURL( base.title_link.attr("href"), 'cantaloupe'))+'" class="headerIcon" id="homeLink">'+
            '<span class="visible-xs">Home Page</span>'+
          '</a>'+
        '</li>')
        return homeLink
      }

      base.mainMenu = function() {
        let mainMenu = $('<li class="dropdown mainMenu">'+
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
        let visualizationMenuData = [
          {
            id: 'viscurrent',
            text: 'Current',
            icon: 'currentIcon',
          },
          {
            id: 'vistoc',
            text: 'Contents',
            icon: 'tocIcon',
          },
          {
            id: 'visconnections',
            text: 'Connections',
            icon: 'connectionsIcon',
          },
          {
            id: 'visindex',
            text: 'Grid',
            icon: 'gridIcon',
          },
          {
            id: 'vismap',
            text: 'Map',
            icon: 'mapIcon',
          },
          {
            id: 'visradial',
            text: 'Radial',
            icon: 'radialIcon',
          },
          {
            id: 'vispath',
            text: 'Path',
            icon: 'pathIcon',
          },
          {
            id: 'vismedia',
            text: 'Media',
            icon: 'mediaIcon',
          },
          {
            id: 'vistag',
            text: 'Tag',
            icon: 'tagIcon',
          },
          {
            id: 'viswordcloud',
            text: 'Word Cloud',
            icon: 'wordCloudIcon',
          },
        ]
        let index_url = scalarapi.model.parent_uri.slice(0, -1);
        index_url = index_url.substr(0, index_url.lastIndexOf('/'))+'/';
        let scalarMenuData = [
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
            url: base.applyCurrentQueryVarsToURL(index_url),
            target: '_scalar',
          },
        ]
        let wayfindingMenu = $('<li class="dropdown" id="navMenu">'+
          '<a class="dropdown-toggle headerIcon" data-toggle="dropdown" aria-labelledby="label-wayfinding" aria-expanded="false" role="menuitem" title="Various ways to explore Scalar" id="wayfindingIcon">'+
              '<span id="label-wayfinding" class="visible-xs">Wayfinding</span>'+
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
                  '</ul>'+
              '</li>'+
              '<li id="scalar_menu" class="dropdown">'+
                  '<a role="menuitem" aria-expanded="false"><span class="menuIcon rightArrowIcon pull-right"></span><span class="menuIcon" id="scalarIcon"></span>Scalar</a>'+
                  '<ul class="dropdown-menu" role="menu">'+
                  '</ul>'+
              '</li>'+
          '</ul>'+
        '</li>')
        for (let i=0; i<visualizationMenuData.length; i++) {
          wayfindingMenu.find('#vis_menu ul').append(base.visualizationMenuItem(visualizationMenuData[i]))
        }
        for (let i=0; i<scalarMenuData.length; i++) {
          wayfindingMenu.find('#scalar_menu ul').append(base.linkMenuItem(scalarMenuData[i]))
        }

        // STOPPED at line 290
        return wayfindingMenu
      }

      base.visualizationMenuItem = function(menuItem) {
        return $(`<li data-vistype="${menuItem.id}"><a role="menuitem"><span class="menuIcon" id="${menuItem.icon}"></span> ${menuItem.text}</a></li>`)
      }

      base.linkMenuItem = function(menuItem) {
        return $(`<li><a role="menuitem" href="${menuItem.url}" target="${menuItem.target}">${menuItem.text}</a></li>`)
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