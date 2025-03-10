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

    base.usingMobileView = false;
    // TODO: fill in the rest of these items
    base.$el.data("scalarheader", base);

    base.init = function() {
      base.options = $.extend({},$.scalarheader.defaultOptions, options);
      base.currentNode = scalarapi.model.getCurrentPageNode();
      base.parentNodes = [];
      base.checkedParents = [];
      base.visitedPages = [];
      base.index_url = scalarapi.model.parent_uri.slice(0, -1);
      base.index_url = base.index_url.substr(0, base.index_url.lastIndexOf('/'))+'/';
      base.remToPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
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
                '<a role="menuitem" href="'+base.applyCurrentQueryVarsToURL(scalarapi.model.parent_uri)+'"><span class="menuIcon" id="homeIcon"></span>Home</a>'+
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
              placeholder: '<li><i class="loader"></i></li>',
              submenu: []
            },
            {
              id: 'lenses_menu',
              text: 'Lenses',
              icon: 'lensIcon',
              submenu: []
            },
            {
              id: 'vis_menu',
              text: 'Visualizations',
              icon: 'visIcon',
              submenu: [
                {
                  text: 'Current',
                  icon: 'currentIcon',
                  class: 'vis_link',
                  data: { vistype: 'viscurrent' },
                },
                {
                  text: 'Contents',
                  icon: 'tocIcon',
                  class: 'vis_link',
                  data: { vistype: 'vistoc' },
                },
                {
                  text: 'Connections',
                  icon: 'connectionsIcon',
                  class: 'vis_link',
                  data: { vistype: 'visconnections' },
                },
                {
                  text: 'Grid',
                  icon: 'gridIcon',
                  class: 'vis_link',
                  data: { vistype: 'visindex' },
                },
                {
                  text: 'Map',
                  icon: 'mapIcon',
                  class: 'vis_link',
                  data: { vistype: 'vismap' },
                },
                {
                  text: 'Radial',
                  icon: 'radialIcon',
                  class: 'vis_link',
                  data: { vistype: 'visradial' },
                },
                {
                  text: 'Path',
                  icon: 'pathIcon',
                  class: 'vis_link',
                  data: { vistype: 'vispath' },
                },
                {
                  text: 'Media',
                  icon: 'mediaIcon',
                  class: 'vis_link',
                  data: { vistype: 'vismedia' },
                },
                {
                  text: 'Tag',
                  icon: 'tagIcon',
                  class: 'vis_link',
                  data: { vistype: 'vistag' },
                },
                {
                  text: 'Word Cloud',
                  icon: 'wordCloudIcon',
                  class: 'vis_link',
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
        search: {
          menu: {
            id: 'ScalarHeaderSearch',
            label: 'Search',
          },
          items: [
            {
              text: 'Advanced search'
            }
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

      base.visualizationData = {
        visconnections: {
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
        },
        vistoc: {
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
        },
        vis: {
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
        },
        visindex: {
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
        },
        visradial: {
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
        },
        vismap: {
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
        },
        viswordcloud: {
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
        },
        vispath: {
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
        },
        vismedia: {
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
        },
        vistag: {
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
        },
        viscurrent: {
          "visualization": {
            "type": "force-directed",
            "options": {}
          },
          "components": [
            {
              "content-selector": {
                "type": "specific-items",
                "items": base.currentNode ? [base.currentNode.slug] : []
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

      base.$el.append(navbar).find('.title_wrapper').prepend(base.title_link.clone());

      base.setupMainMenuEventHandling()
      base.setupGlobalMenuEventHandling()
      base.setupIndexModal()
      base.setupVisualizationModal()
      base.setupUserMenu()
      base.setupHelpModal()
      base.setupLensUpdateHandling()
      base.setupSearchModal()
      base.addSearchFunctionality()
      base.updateRecentMenu()

      $(window).on('resize', () => { base.handleResize(); }).on('scroll', base.handleScroll);

      base.handleResize()
      base.handleBook()

      $('body').on('pageLoadComplete', $.proxy(base.setupTitleTruncate, base))

      if (base.dataType == 'normal' && base.editorialWorkflowEnabled && scalarapi.getEdition(document.location.href) == -1) {
        base.setupEditorialBar();
      }

      $('body').trigger('headerCreated');
    }

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
                for (i = 0; i < n; i++) {
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

    base.mobileHeader = function() {
      let mobileHeader = $('<div class="navbar-header"></div>')
      // this is where the title will go
      mobileHeader.append('<span class="navbar-text navbar-left pull-left title_wrapper visible-xs"></span>')
      mobileHeader.append(base.hamburgerMenu())
      mobileHeader.find('.navbar-toggle').on('click', function(){
        $(this).parents('nav').toggleClass('in');
      });
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
      base.$el.find('#ScalarHeaderMenuLeft>li.dropdown, #ScalarHeaderMenuRight>li.dropdown').on('mouseenter', function(e) {
        var base = $('#scalarheader.navbar').data('scalarheader');
        if (!base.usingMobileView) {
          if (!$(this).hasClass('mainMenu') && $('#mainMenuSubmenus .expandedPage').length > 0) {
            $('#mainMenuSubmenus .expandedPage').remove();
            $('#mainMenusSubmenus').hide();
            base.$el.find('#ScalarHeaderMenuLeft .mainMenu').removeClass('open').trigger('hide.bs.dropdown').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
          } else if ($('#mainMenuSubmenus .expandedPage').length == 0) {
            $('.mainMenuDropdown, #ScalarHeaderMenu').css({
              'transform': 'translateX(0px)',
              '-webkit-transform': 'translateX(0px)',
              '-moz-transform': 'translateX(0px)'
            }).removeClass('expandedMenuOpen');
          }
          $(this).addClass('open').trigger('show.bs.dropdown').children('[aria-expanded="false"]').attr('aria-expanded', 'true');
        }
      }).on('mouseleave', function(e) {
        // TODO: this is the area that is causing Win10 touch problems ~Craig
        var base = $('#scalarheader.navbar').data('scalarheader');
        if (!base.usingMobileView) {
          if ($(this).find('ul [aria-expanded="true"]').length == 0) {
            $(this).removeClass('open').trigger('hide.bs.dropdown').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
          }
        }
      }).on('keydown', function(e) {
        // press ESC
        if (e.which == 27) {
          var subdropdowns_open = $(this).find('li.dropdown.open');
          if (subdropdowns_open.length > 0) {
            subdropdowns_open.removeClass('open').trigger('hide.bs.dropdown').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
            subdropdowns_open.first().children('a').trigger('focus');
          } else {
            $(this).removeClass('open').trigger('hide.bs.dropdown').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
            $(this).children('a').trigger('focus');
          }
          e.stopPropagation();
          e.preventDefault();
          return false;
        }
      }).find("ul.dropdown-menu li.dropdown").on('click', function(e) {
        var base = $('#scalarheader.navbar').data('scalarheader');
        if (!base.usingMobileView) {
          base.initSubmenus(this);
        }
      }).on('hide.bs.dropdown', function(e) {
        e.stopPropagation();
      }).on('keydown', function(e) {
        var base = $('#scalarheader.navbar').data('scalarheader');
        if ($(this).children('a').first().is(':focus') && !base.usingMobileView) {
          if (e.which == 38) {
            // up
            $(this).prev().children('a').trigger('focus');
            e.stopPropagation();
            return false;
          } else if (e.which == 40) {
            // down
            $(this).next().children('a').trigger('focus');
            e.stopPropagation();
            return false;
          }
        }
      }).children('a').on('click', function(e) {
        var base = $('#scalarheader.navbar').data('scalarheader');
        if (!$(this).hasClass('expand') && (typeof $(this).attr('href') == 'undefined' || $(this).attr('href') == '')) {
          base.initSubmenus(this);
          e.preventDefault();
          return false;
        }
      }).on('keyup', function(e) {
        var base = $('#scalarheader.navbar').data('scalarheader');
        if (!base.usingMobileView) {
          // right arrow, enter, space
          if (e.which == 39 || e.which == 13 || e.which == 32) {
            base.initSubmenus($(this).parent());
            e.stopPropagation();
            return false;
          }
        }
      })
      $('body').on('click', function(e) {
        var base = $('#scalarheader.navbar').data('scalarheader');
        if (!base.usingMobileView) {
          $('#mainMenuSubmenus').hide().find('.expandedPage').remove();
          base.$el.find('#ScalarHeaderMenuLeft .mainMenu').removeClass('open').trigger('hide.bs.dropdown').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
        }
      })
    }

    base.setupIndexModal = function() {
      var indexElement = $('<div></div>').prependTo('body');
      base.index = indexElement.scalarindex( {} );
      base.$el.find('.index_link a').on('click', function(e){
        $('#scalarheader.navbar').data('scalarheader').index.data('plugin_scalarindex').showIndex();
      });
    }

    base.setupVisualizationModal = function() {
      var visElement = $('<div></div>').prependTo('body');
      base.vis = visElement.scalarvis({ modal: true, local: false });
      base.$el.find('.vis_link').on('click', function(e){
        var options = {
          modal: true,
          content: 'lens',
          lens: base.visualizationData[$(this).attr('data-vistype')]
        }
        $('.modalVisualization').data('scalarvis').showModal(options);
        e.preventDefault();
        e.stopPropagation();
      })
    }

    base.setupHelpModal = function() {
      var helpElement = $('<div></div>').appendTo('body');
      base.help = $( helpElement ).scalarhelp({ root_url: modules_uri + '/cantaloupe' });
      $( '#ScalarHeaderHelp>a' ).on('click', function(e) {
        base.help.data( 'plugin_scalarhelp' ).toggleHelp();
        e.preventDefault();
        e.stopPropagation();
        return false;
    });
    }

    base.setupSearchModal = function() {
      var searchElement = $('<div></div>').appendTo('body');
      base.search = searchElement.scalarsearch( { root_url: modules_uri+'/cantaloupe'} );
    }

    base.setupLensUpdateHandling = function() {
      $('body').on('lensUpdated', base.getLensData);
      base.getLensData();
    }

    base.getLensData = function(){
      let baseURL = scalarapi.model.baseURL.replace('application', 'lenses');
      let mainURL = `${baseURL}?book_id=${scalarapi.model.bookId}`;
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

      lensMenu.append('<li class="vis_link"><a role="menuitem" href="' + base.applyCurrentQueryVarsToURL(scalarapi.model.urlPrefix + 'manage_lenses') + '"><span class="menuIcon" id="lensIcon"></span> ' + manageLinkTitle + '</a></li>');

      // private lenses
      if (privateLensArray.length > 0) {
        lensMenu.append('<li class="header"><h2>My Private Lenses</h2></li>');
        privateLensArray.forEach(privateLensItem => {
          let vizType = privateLensItem.visualization.type;
          let lensLink = $('link#parent').attr('href') + privateLensItem.slug;
          let markup = $(`
            <li class="lens">
              <a role="menuitem" href="${lensLink}"><span class="title">${privateLensItem.title}</span>
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
              <a role="menuitem" href="${lensLink}"><span class="title">${publicLensItem.title}</span>
              <span class="viz-icon ${vizType}"></span>
            </li>`
          ).appendTo(lensMenu);
        });
      }

    };

    base.setupUserMenu = function(){
      const userList = base.$el.find('#ScalarHeaderMenuUserList')
      var redirect_url = '';
      if (base.currentNode) {
        redirect_url = encodeURIComponent(base.currentNode.url);
      }else{
        redirect_url = encodeURIComponent(window.location.href);
      }
      const user = scalarapi.model.getUser()
      if (user.logged_in){
        userList.append('<li><a role="menuitem" href="' + base.applyCurrentQueryVarsToURL(addTemplateToURL(system_uri + '/dashboard?'+((user.role == ScalarRole.Author || user.role == ScalarRole.Editor)?'book_id=' + base.book_id + '&' : '')+'zone=user#tabs-user', 'cantaloupe')) + '">Account</a></li>');
        userList.append('<li><a role="menuitem" href="' + base.applyCurrentQueryVarsToURL(addTemplateToURL(system_uri+'/logout?action=do_logout&redirect_url='+redirect_url + '&', 'cantaloupe')) + '">Sign out</a></li>');
      } else {
        userList.append('<li><a role="menuitem" href="' + base.applyCurrentQueryVarsToURL(addTemplateToURL(system_uri+'/login?redirect_url='+redirect_url + '&', 'cantaloupe')) + '">Sign in</a></li>');
        userList.append('<li><a role="menuitem" href="' + base.applyCurrentQueryVarsToURL(addTemplateToURL(system_uri+'/register?redirect_url='+redirect_url + '&', 'cantaloupe')) + '">Register</a></li>');
      }
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
      navigationMenus.append(base.skipLink())
      navigationMenus.append(base.homeLink())
      navigationMenus.append(base.headerMenu(base.menuData.main))
      navigationMenus.append(base.headerMenu(base.menuData.wayfinding))
      return navigationMenus
    }

    base.titleAndCredit = function() {
      const element = $('<span class="navbar-text navbar-left pull-left title_wrapper hidden-xs" id="desktopTitleWrapper" role="banner">'+
        '<span class="hidden-xs author_text">'+
          '<span id="header_authors" data-placement="bottom"></span>'+
        '</span>'+
      '</span>')
      element.find('#header_authors').html(getAuthorCredit());
      $('body').on('pageLoadComplete',function(){
        $('#desktopTitleWrapper').trigger("update");
      });
      return element
    }

    base.utilityOptions = function() {
      let utilityOptions = $('<ul class="nav navbar-nav navbar-right" id="ScalarHeaderMenuRight"></ul>')
      utilityOptions.append(base.headerControl(base.controlData.search, base.menuData.search))
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

    base.skipLink = function() {
      const skipLink = $('<button id="skip">Skip to Main Content</button>')
      skipLink.on('click', () => {
        if ($('.title_card').length) {
          $('.title_card a:not(.metadata):not([inert]):not("li a")').first().focus()
        } else {
          $('article a:not(.metadata), article input').first().focus()
        }
      })
      return skipLink
    }

    base.homeLink = function() {
      // home link is visible only on mobile
      const homeUrl = base.applyCurrentQueryVarsToURL(addTemplateToURL( base.title_link.attr("href"), 'cantaloupe'))
      const homeLink = $('<li class="visible-xs">'+
        '<a role="menuitem" href="' + homeUrl + '" class="headerIcon" id="homeLink">'+
          '<span class="visible-xs">Home Page</span>'+
        '</a>'+
      '</li>')
      return homeLink
    }

    base.headerMenu = function(menuData) {
      const menu = base.menuStructure(menuData.menu)
      for (let i=0; i<menuData.items.length; i++) {
        menu.children('ul').append(base.menuItem(menuData.items[i]))
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

    base.headerControl = function(controlData, menuData) {
      if (controlData.include == undefined || controlData.include) {
        const control = $('<li><a class="headerIcon" role="button"><span class="hidden-sm hidden-md hidden-lg"></span></a></li>')
        control.attr('id', controlData.id)
        const labelId = 'label-' + controlData.label.split(' ')[0].toLowerCase()
        control.find('a').attr('id', controlData.icon).attr('aria-labelledby', labelId).attr('title', controlData.description)
        control.find('span').attr('id', labelId).append(controlData.label)
        if (controlData.url) control.find('a').attr('href', controlData.url).attr('aria-role', 'link')
        if (menuData) {
          control.addClass('dropdown')
          control.find('a').addClass('dropdown-toggle').attr({'data-toggle': 'dropdown', 'aria-expanded': 'false', 'role': 'menuitem'})
          control.append('<ul class="dropdown-menu dropdown-menu-left" role="menu"></ul>')
          for (let i=0; i<menuData.items.length; i++) {
            control.children('ul').append(base.menuItem(menuData.items[i]))
          }
        }
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

    base.addSearchFunctionality = function() {
      $('#ScalarHeaderMenuSearch>a').on('click', function(e) {
        if (base.isMobile || base.$el.find('.navbar-toggle').is(':visible')) {
          $('#ScalarHeaderMenuSearch').toggleClass('search_open');
          $('#ScalarHeaderMenuSearchForm').toggleClass('open');
        } else {
          if ($('#ScalarHeaderMenuSearch').hasClass('search_open')) {
            $('#ScalarHeaderMenuSearchForm').animate({
              "width" : "0px"
            }, {
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
          } else {
            $('#ScalarHeaderMenuSearch').addClass('search_open');
            base.handleResize(190);
            $('#ScalarHeaderMenuSearchForm').animate({
              "width" : "190px"
            }, {
              "duration" : 250,
              "step" : function(){
                $('.navbar-header .title_wrapper, #ScalarHeaderMenuSearch').hide().show(0);
              },
              "complete" : function(){
                base.handleResize();
              }
            });
            $('#ScalarHeaderMenuSearchForm input').first().val('').trigger('focus').on('blur', function(e) {
              if ($('#ScalarHeaderMenuSearch').hasClass('search_open')) {
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
      $('#ScalarHeaderMenuSearch ul>li>a').on('click', function(e) {
        base.search.data('plugin_scalarsearch').showSearch();
        e.stopPropagation();
        e.preventDefault();
        return false;
      })
    }

    base.addAirtableImportItems = function() {
      var $airtables = $('link#airtable');
      if ($airtables.length) {
        for (var j = 0; j < $airtables.length; j++) {
          // TODO: this doesn't work anymore after the refactor ~Craig
          $('#ScalarHeaderMenuImportList').find('ul:eq(2)').append('<li><a  role="menuitem" ref="' + base.get_param(scalarapi.model.urlPrefix + 'import/airtable/'+encodeURIComponent($airtables.eq(j).attr('href'))) + '">Airtable: '+$airtables.eq(j).attr('href')+'</a></li>');
        }
      }
    }

    base.updateRecentMenu = function() {
      // Check if the current page should be logged in the "recent" menu - if so, do that and then render the menu. Otherwise, just get renderin'
      if (['import','edit'].indexOf($('head>link#view').attr('href')) > -1) {
        base.loadRecentMenuEntries(base.$el.find('#recent_menu>ul'));
      } else {
        $.when(scalarrecent_log_page()).then(function(){
          var base = $('#scalarheader.navbar').data('scalarheader');
          base.loadRecentMenuEntries(base.$el.find('#recent_menu>ul'));
        });
      }
    }

    base.loadRecentMenuEntries = function(container) {
      container.html($('<div></div>').scalarrecent().find('.history_content').html()).find('li>a').each(function(){
        var base = $('#scalarheader.navbar').data('scalarheader');
        $(this).removeClass('page').attr('href',base.applyCurrentQueryVarsToURL($(this).parent().attr('title',$(this).text()).attr('id')));
        base.visitedPages.push($(this).parent().attr('id'));
        $('.mainMenu>.dropdown-menu .body>ol>li>a').each(function() {
          if (base.visitedPages.indexOf($(this).attr('href')) >= 0) {
            $(this).parent('li').addClass('visited');
          }
        });
        $('.expandedPage ol>li>a').each(function(){
          if (base.visitedPages.indexOf($(this).attr('href')) >= 0) {
            $(this).parent('li').addClass('visited');
          }
        });
      });
    };

    base.menuItem = function(itemData) {
      let listItem = $(`<li id="${itemData.id}" class="dropdown"></li>`)
      let link = $('<a role="menuitem" aria-expanded="false"><span class="menuIcon pull-right"></a>')
      if (itemData.icon) {
        link.append(`<span class="menuIcon" id="${itemData.icon}"></span>`)
      }
      link.append(itemData.text)
      listItem.append(link)
      if (itemData.submenu) {
        link.find('span').eq(0).addClass('rightArrowIcon')
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
      if (itemData.class) {
        listItem.addClass(itemData.class)
      }
      link.append(itemData.text)
      listItem.append(link)
      return listItem
    }

    base.initSubmenus = function(el) {
      $(el).attr('aria-expanded', 'true');
      var li = $(el).is('li.dropdown')?$(el):$(el).parent('li.dropdown');
      var a = $(el).is('li.dropdown>a')?$(el):$(el).children('a').first();
      var dropdown = li.find('ul.dropdown-menu');
      li.addClass('open').removeClass('left right').addClass(a.offset().left>($(window).width()/2)?'left':'right').siblings('li').removeClass('open left right').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
      if (li.hasClass('right')) {
        max_width = $(window).width() - (a.offset().left + a.outerWidth() );
      } else {
        max_width = a.offset().left;
      }
      var max_height = ($(window).height() - (li.offset().top-15))+$(window).scrollTop();
      if (!base.usingMobileView) {
        dropdown.css({
          'max-height':max_height+'px',
          'max-width':max_width+'px'
        });
      }
      $('body').on('keyup',function(e){
        if(e.which == 9 || e.which == 37){
          if (e.which == 9) {
            li.removeClass('open').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
            li.parents('.dropdown').removeClass('open').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
          } else if (e.which == 37) {
            a.trigger('focus');
            li.removeClass('open').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
          }
          $('body').off('keyup');
        }
      });
      dropdown.find('a').first().trigger('focus');
    }

    base.get_param = function(url) {
      //@TODO: Add non-book related Get Params back to URLs Here
      var allowable_vars = ['path', 'm'];
      if (scalarapi.getQuerySegment(window.location.href).length) {
        var vars = scalarapi.getQuerySegment(window.location.href).split('&');
        for (var j = 0; j < vars.length; j++) {
          var field = vars[j].split('=')[0];
          if (allowable_vars.indexOf(field) == -1) continue;
          if (url.indexOf('?') == -1) url += '?';
          url += vars[j];
          if (j < vars.length - 1) url += '&';
        }
      }
      return url;
    }

    base.applyCurrentQueryVarsToURL = function(url) {
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

    base.focusExpandedPage = function(container) {
      if (container != null && typeof container !== 'undefined') {
        container.find('a')/* .attr('tabindex', '-1') */.first().trigger('focus');
      }
    }

    base.handleResize = function(extra_offset) {
      var base = $('#scalarheader.navbar').data('scalarheader');
      var screen_width = $(window).width();
      var menu_button_visible = base.$el.find('.navbar-toggle').is(':visible');
      var max_width = (base.$el.width() - ($('#ScalarHeaderMenuLeft').outerWidth() + $('#ScalarHeaderMenuRight').outerWidth()))-30;

      base.$el.find('#desktopTitleWrapper,.title_wrapper.visible-xs .book-title').trigger("update");

      base.$el.find('.mainMenuDropdown .relationships').find('li>ol>li, li>ul>li').each(function(){
        $(this).add($(this).find('.expand')).height($(this).find('a').first().height());
      });

      if (base.isMobile || menu_button_visible) {
        max_width -= base.$el.find('.navbar-toggle').outerWidth()+15;
        if(!base.usingMobileView){
          base.$el.removeClass('short');
          $('body').removeClass('shortHeader').trigger('headerSizeChanged');
          $('#mainMenuSubmenus').hide().find('.expandedPage').remove();
          base.$el.find('#ScalarHeaderMenuLeft .mainMenu').removeClass('open').trigger('hide.bs.dropdown').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
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
      } else {
        if(base.usingMobileView){
          $('#ScalarHeaderMenuSearch').removeClass('search_open');
          $('#ScalarHeaderMenuSearchForm').css({"width" : "0px"}).removeClass('open');
          $('#mainMenuSubmenus').hide();
          $('.tocMenu').find('.expandedPage').remove();
          base.$el.find('#ScalarHeaderMenuLeft .mainMenu').removeClass('open').trigger('hide.bs.dropdown').find('[aria-expanded="true"]').attr('aria-expanded', 'false');
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
          if ($(this).hasClass('right')) {
            var max_width = $(window).width() - ($(this).offset().left + $(this).outerWidth());
          } else {
            var max_width = $(this).offset().left;
          }
          $(this).find('ul.dropdown-menu').css('max-width',max_width+'px');
        });
      }
      var title_width = $(window).width();

      if (base.usingMobileView) {
          title_width -= 120;
      } else {
        title_width -= ($('#ScalarHeaderMenu>ul>li:not(.visible-xs)>a.headerIcon').length * 50) + 52; // 30 for the margin on the title, 2px for the border on the user menu items, then 20 for scrollbar

        $('#ScalarHeaderMenu>ul>li.customMenuItem').each(function() {
          title_width -= $(this).outerWidth();
        });

        if ($('#ScalarHeaderMenuSearch').hasClass('search_open')) {
          title_width -= 190;
        }else if(typeof extra_offset != 'undefined' && extra_offset!=null){
          title_width -= extra_offset;
        }
        
        if (scalarapi.model.usingHypothesis) {
          title_width -= 60;
        }
      }

      $('#scalarheader .title_wrapper').css('max-width',title_width+'px');
      var desktopTitle = base.$el.find('#desktopTitleWrapper');
      if(desktopTitle.hasClass('overflowCalculated')){
        desktopTitle.trigger("update");
      }
      base.$el.removeClass('mobile_view desktop_view').addClass(base.usingMobileView?'mobile_view':'desktop_view');
    }

    base.handleScroll = function (e) {
      var base = $('#scalarheader.navbar').data('scalarheader');
      if ('undefined' == typeof(base)) return;
      if (base.usingMobileView) {
        base.oldScrollTop = 0;
        base.$el.removeClass('short');
        $('body').removeClass('shortHeader').trigger('headerSizeChanged');
      } else {
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
    }

    base.setupTableOfContents = function() {
      var node = scalarapi.model.getMainMenuNode();
      var menu = $('.mainMenu>.dropdown-menu .body>ol');
      if (node != null) {
        var i,
          menuItems = node.getRelatedNodes('reference', 'outgoing', true),
          n = menuItems.length;
        if (n > 0) {
          var tocNode, listItem;
          for (i = n - 1; i >= 0; i--) { //going in reverse here, since we're prepending...
            tocNode = menuItems[i];
            listItem = $('<li><a href="' + tocNode.url + '">' + tocNode.getDisplayTitle(true) + '</a></li>')
              .prependTo(menu)
              .data({
                'slug': tocNode.slug,
                'node': tocNode
              })
              .addClass((base.parentNodes.indexOf(tocNode.slug) < 0 && (typeof base.currentNode === 'undefined' || tocNode.slug != base.currentNode.slug)) ? '' : 'is_parent')
              .addClass((base.visitedPages.indexOf(tocNode.url) < 0 && (typeof base.currentNode === 'undefined' || tocNode.url != base.currentNode.url)) ? '' : 'visited');
    
            $('<a class="expand" title="Explore ' + tocNode.getDisplayTitle(true) + '" aria-expanded="false"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(listItem).on('click', function(e) {
              var base = $('#scalarheader.navbar').data('scalarheader');
              var target_toc_item = $(this).parent().data('node');
              base.expandMenu(target_toc_item, 0);
              $('.mainMenu>.dropdown-menu .body>ol>li.active > a').attr('aria-expanded', 'false');
              var menu = $('.mainMenu>.dropdown-menu .body>ol>li.active').removeClass('active');
              $(this).attr('aria-expanded', 'true')
              $(this).parent().addClass('active');
    
              $("#mainMenuSubmenus").removeClass(function(index, className) {
                return (className.match(/(^|\s)submenu-\S+/g) || []).join(' ');
              });
              $('#mainMenuSubmenus').addClass('submenu-' + target_toc_item.slug)
    
              e.preventDefault();
              return false;
            })
          }
        }
      }
      $('.mainMenu').addClass('ready');
    }
    
    base.setupTrash = function() {
      base.$el.find('#ScalarHeaderDelete').on('click', function() {
        var result = confirm('Are you sure you wish to hide this page from view?');
    
        if (result) {
          // assemble params for the trash action
          var pageData = {
            native: 1,
            id: $('link#parent').attr('href'),
            api_key: '',
            action: 'DELETE',
            'scalar:urn': $('link#urn').attr('href')
          };
          // execute the trash action (i.e. make is_live=0)
          scalarapi.savePage(pageData, function(result) {
            for (var url in result) break;
            url = url.substr(0, url.lastIndexOf('.'));
            window.location.href = url;
            return;
          }, function(result) {
            alert('An error occurred attempting to hide this page: ' + result);
            var login = $('link#approot').attr('href').replace('application', 'login');
            if ('/' == login.substr(login.length - 1, 1)) login = login.substr(0, login.length - 1);
            var url = $('link#parent').attr('href');
            window.location.href = login + '?redirect_url=' + encodeURIComponent(url);
            return;
          });
        }
      });
    }
    
    base.setupKeyboardNavigation = function() {
      $('#scalarheader>div>div>ul>li>a, .title_wrapper a').each(function() {
        $(this).attr('tabindex', 0);
      }).add($('#scalarheader>div>div>ul>li.dropdown>ul a, #scalarheader>div>div>ul>li input').attr('tabindex', '-1')).on('keyup', function(e) {
        if (!$(this).is('#scalarheader>div>div>ul>li.dropdown>ul a') || $(this).hasClass('expand') || $(this).parent().hasClass('vis_link') || $(this).parent().hasClass('index_link') || ($(this).attr('href') != null && $(this).attr('href') != '')) {
          // enter, space
          if (e.which == 13 || e.which == 32) {
            $(this).trigger('click');
          }
        }
      });
    }

    base.expandMenu = function(node, n) {
      var expanded_menu = $('#mainMenuSubmenus');
      if (base.usingMobileView) {
        $('#ScalarHeaderMenu').addClass('expandedMenuOpen');
        expanded_menu = $('#mobileMainMenuSubmenus').addClass('active').find('.pages');
      } else {
        $('#mainMenuSubmenus').show();
      }
    
      var currentMenuWidth = $('.mainMenuDropdown').width();
      var offset = 0;
      if (!base.usingMobileView) {
        expanded_menu.find('.expandedPage').each(function() {
          if ($(this).data('index') >= n) {
            $(this).remove();
          } else {
            currentMenuWidth += (base.remToPx * 38);
          }
        });
      }
    
      if (!base.usingMobileView && ($(window).width() - currentMenuWidth) < (base.remToPx * 38)) {
        offset = parseInt('-' + (currentMenuWidth - ($(window).width() - (base.remToPx * 38))));
      } else if (base.usingMobileView) {
        offset = ($(window).width() * -n);
      }
    
      var translateX = 'translateX(' + offset + 'px)';
      if (base.usingMobileView) {
        $('#ScalarHeaderMenu').css({
          'transform': 'translateX(-' + $(window).width() + 'px)',
          '-webkit-transform': 'translateX(-' + $(window).width() + 'px)',
          '-moz-transform': 'translateX(-' + $(window).width() + 'px)'
        });
        $('#mobileMainMenuSubmenus .pages').css({
          'transform': translateX,
          '-webkit-transform': translateX,
          '-moz-transform': translateX
        });
      } else {
        $('.mainMenuDropdown').css({
          'transform': translateX,
          '-webkit-transform': translateX,
          '-moz-transform': translateX
        });
      }
    
      if (base.usingMobileView) {
        offset = -n * $(window).width();
      } else {
        offset = -n * (base.remToPx * 38);
      }
    
      var description = node.current.description;
    
      var container = $('<div class="expandedPage"><h2 class="title">' + node.getDisplayTitle(true) + '</h2><div class="description">' + description + '</div><ul class="description_more_link_container"><li class="pull-right"><a class="description_more_link" title="Display full description">more</a></li></ul><ul class="links"><!--<a class="details">Details</a>--><li><a class="visit" href="' + base.get_param(node.url) + '" title="Visit page, \'' + node.getDisplayTitle(true) + '\'">Visit page</a></li></ul><div class="relationships"><i class="loader"></i></div></div>').data({
        'index': n,
        'slug': node.slug
      }).css('right', offset + 'px').appendTo(expanded_menu);
    
      if (!base.usingMobileView) {
        container.prepend('<div class="close" role="link" title="Close expanded panel"><span class="menuIcon closeIcon"></span></div>');
      }
      if (typeof base.currentNode !== 'undefined' && container.data('slug') == base.currentNode.slug) {
        container.addClass('is_current');
      } else if (typeof base.currentNode !== 'undefined' && base.parentNodes.indexOf(container.data('slug')) >= 0) {
        container.addClass('is_parent');
      }
      container.on('click', function(e) {
        e.stopPropagation();
      }).on('keydown', function(e) {
        if (e.which == 27 || e.which == 9) {
          e.stopPropagation();
          $(this).find('.close').trigger('click');
          e.preventDefault();
          return false;
        }
      });
      container.find('.close').add('#mobileMainMenuSubmenus footer button.back').off('click').on('click', function(e) {
        var base = $('#scalarheader.navbar').data('scalarheader');
        var expanded_menu = $('#mainMenuSubmenus');
        if (base.usingMobileView) {
          expanded_menu = $('#mobileMainMenuSubmenus .pages');
        }
        var currentMenuWidth = base.remToPx * 38;

        $(this).parent().parent().parent().find('[aria-expanded="true"]').attr('aria-expanded', 'false');
    
        if (base.usingMobileView) {
          max_n = $('#mobileMainMenuSubmenus .expandedPage').length - 2;
        } else {
          max_n = parseInt($(this).parents('.expandedPage').data('index')) - 1;
        }
        var removed_pages = [];
    
        expanded_menu.find('.expandedPage').each(function() {
          if (!base.usingMobileView) {
            if ($(this).data('index') > max_n) {
              $(this).remove();
            }
          }
        });
    
        if (expanded_menu.find('.expandedPage').length > 0) {
          expanded_menu.find('.expandedPage').last().find('li.active').removeClass('active').find('.expand').trigger('focus');
        } else {
          $('.mainMenuDropdown li.active .expand').trigger('focus');
        }
    
        currentMenuWidth += (expanded_menu.find('.expandedPage').length * (base.remToPx * 38));
        offset = 0;
        if (!base.usingMobileView && ($(window).width() - currentMenuWidth) < 0) {
          offset = ($(window).width() - currentMenuWidth);
        } else if (base.usingMobileView) {
          offset = $(window).width() * (-max_n);
        }
    
        var translateX = 'translateX(' + offset + 'px)';
        if (base.usingMobileView) {
          $('#ScalarHeaderMenu').css({
            'transform': 'translateX(-' + $(window).width() + 'px)',
            '-webkit-transform': 'translateX(-' + $(window).width() + 'px)',
            '-moz-transform': 'translateX(-' + $(window).width() + 'px)'
          });
          if (max_n < 0) {
            translateX = 'translateX(0px)';
          }
          $('#mobileMainMenuSubmenus .pages').css({
            'transform': translateX,
            '-webkit-transform': translateX,
            '-moz-transform': translateX
          });
        } else {
          $('.mainMenuDropdown').css({
            'transform': translateX,
            '-webkit-transform': translateX,
            '-moz-transform': translateX
          });
        }
    
        if (expanded_menu.find('.expandedPage').length == 0 || max_n < 0) {
          if (base.usingMobileView) {
    
            $('#mobileMainMenuSubmenus').removeClass('active');
            $('.mainMenuDropdown, #ScalarHeaderMenu').css({
              'transform': 'translateX(0px)',
              '-webkit-transform': 'translateX(0px)',
              '-moz-transform': 'translateX(0px)',
              'position': ''
            });
            setTimeout(function() {
              $('#mobileMainMenuSubmenus').find('.expandedPage').remove();
            }, 500);
          } else {
            $('#mainMenuSubmenus').hide();
            $('.mainMenuDropdown li.active').removeClass('active');
          }
        } else if (base.usingMobileView) {
          setTimeout(function() {
            $('#mobileMainMenuSubmenus .expandedPage').last().remove();
          }, 500);
        }
    
        if (!base.usingMobileView && expanded_menu.find('.tall').length == 0) {
          $('body').removeClass('in_menu'); //.css('margin-top','0px').scrollTop($('body').data('scrollTop'));
        }
    
        return false;
      });
      if (description == null) {
        container.find('.description').remove();
      }
      container.find('.description,.title').dotdotdot({
        ellipsis: '…',
        watch: "window"
      });
    
      if (container.find('.description').triggerHandler("isTruncated")) {
        container.find('.description_more_link').on('click', function() {
          if ($(this).text() == 'more') {
            container.find('.description').trigger('destroy').css('max-height', 'none');
            container.find('.description_more_link').text('less');
          } else {
            container.find('.description').css('max-height', '6.5rem')
              .dotdotdot({
                ellipsis: '…',
                watch: "window"
              });
            container.find('.description_more_link').text('more');
          }
    
        });
      } else {
        container.find('.description_more_link_container').remove();
      }
    
      if (!base.usingMobileView) {
        base.focusExpandedPage(container);
      }
    
      var handleRequest = function() { //this function is scoped instantaneously to this anonymous function, so we can pass it to loadPage while preserving the container reference
        var relationships = $(this).find('.relationships');
    
        var splitList = $('<ul></ul>');
    
        var node = scalarapi.getNode($(this).data('slug'));
        var splitList = $('<ul></ul>');
    
        var path_of = node.getRelatedNodes('path', 'outgoing');
        var features = node.getRelatedNodes('reference', 'outgoing');
        var tag_of = node.getRelatedNodes('tag', 'incoming');
        var annotates = node.getRelatedNodes('annotation', 'outgoing');
        var comments_on = node.getRelatedNodes('comment', 'outgoing');
    
        if (path_of.length > 0) {
          var newList = $('<li><strong>Contains</strong><ol></ol></li>').appendTo(splitList).find('ol');
          for (var i in path_of) {
            var relNode = path_of[i];
            var nodeItem = $('<li><a href="' + relNode.url + '?path=' + node.slug + '" tabindex="-1">' + relNode.getDisplayTitle(true) + '</a></li>')
              .data({
                'slug': relNode.slug,
                'node': relNode
              })
              .addClass(((base.parentNodes.indexOf(relNode.slug) < 0 && (typeof base.currentNode === 'undefined' || relNode.slug != base.currentNode.slug))) ? '' : 'is_parent')
              .addClass((base.visitedPages.indexOf(relNode.url) < 0 && (typeof base.currentNode === 'undefined' || relNode.url != base.currentNode.url)) ? '' : 'visited');
    
            $('<a class="expand" tabindex="-1"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(nodeItem);
    
            newList.append(nodeItem);
          }
        }
    
        if (features.length > 0) {
          var newList = $('<li><strong>Features</strong><ol></ol></li>').appendTo(splitList).find('ol');
          for (var i in features) {
            var relNode = features[i];
            var nodeItem = $('<li><a href="' + relNode.url + '">' + relNode.getDisplayTitle(true) + '</a></li>')
              .data({
                'slug': relNode.slug,
                'node': relNode
              })
              .addClass(((base.parentNodes.indexOf(relNode.slug) < 0 && (typeof base.currentNode === 'undefined' || relNode.slug != base.currentNode.slug))) ? '' : 'is_parent')
              .addClass((base.visitedPages.indexOf(relNode.url) < 0 && (typeof base.currentNode === 'undefined' || relNode.url != base.currentNode.url)) ? '' : 'visited');
    
            $('<a class="expand" tabindex="-1"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(nodeItem);
    
            newList.append(nodeItem);
    
          }
        }
    
        if (tag_of.length > 0) {
          var newList = $('<li><strong>Tagged by</strong><ol class="tags"></ol></li>').appendTo(splitList).find('ol');
          for (var i in tag_of) {
            var relNode = tag_of[i];
            var nodeItem = $('<li><a href="' + relNode.url + '">' + relNode.getDisplayTitle(true) + '</a></li>')
              .data({
                'slug': relNode.slug,
                'node': relNode
              })
              .addClass(((base.parentNodes.indexOf(relNode.slug) < 0 && (typeof base.currentNode === 'undefined' || relNode.slug != base.currentNode.slug))) ? '' : 'is_parent')
              .addClass((base.visitedPages.indexOf(relNode.url) < 0 && (typeof base.currentNode === 'undefined' || relNode.url != base.currentNode.url)) ? '' : 'visited');
    
            $('<a class="expand"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(nodeItem);
    
            newList.append(nodeItem);
    
          }
        }
    
        if (annotates.length > 0) {
          var newList = $('<li><strong>Annotates</strong><ol></ol></li>').appendTo(splitList).find('ol');
          for (var i in annotates) {
            var relNode = annotates[i];
            var nodeItem = $('<li><a href="' + relNode.url + '">' + relNode.getDisplayTitle(true) + '</a></li>')
              .data({
                'slug': relNode.slug,
                'node': relNode
              })
              .addClass(((base.parentNodes.indexOf(relNode.slug) < 0 && (typeof base.currentNode === 'undefined' || relNode.slug != base.currentNode.slug))) ? '' : 'is_parent')
              .addClass((base.visitedPages.indexOf(relNode.url) < 0 && (typeof base.currentNode === 'undefined' || relNode.url != base.currentNode.url)) ? '' : 'visited');
    
            $('<a class="expand" tabindex="-1"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(nodeItem);
    
            newList.append(nodeItem);
    
          }
        }
    
        if (comments_on.length > 0) {
          var newList = $('<li><strong>Comments on</strong><ol></ol></li>').appendTo(splitList).find('ol');
          for (var i in comments_on) {
            var relNode = comments_on[i];
            var nodeItem = $('<li><a href="' + relNode.url + '">' + relNode.getDisplayTitle(true) + '</a></li>')
              .data({
                'slug': relNode.slug,
                'node': relNode
              })
              .addClass(((base.parentNodes.indexOf(relNode.slug) < 0 && (typeof base.currentNode === 'undefined' || relNode.slug != base.currentNode.slug))) ? '' : 'is_parent')
              .addClass((base.visitedPages.indexOf(relNode.url) < 0 && (typeof base.currentNode === 'undefined' || relNode.url != base.currentNode.url)) ? '' : 'visited');
    
            $('<a class="expand"><span class="menuIcon rightArrowIcon pull-right"></span></a>').appendTo(nodeItem);
    
            newList.append(nodeItem);
          }
        }
        if (splitList.children('li').length > 0) {
          relationships.html(splitList);
          relationships.find('.expand').on('click', function(e) {
            var base = $('#scalarheader.navbar').data('scalarheader');
            base.expandMenu($(this).parent().data('node'), $(this).parents('.expandedPage').data('index') + 1);
            $(this).parents('.relationships').find('li.active').removeClass('active');
            $(this).parent().addClass('active');
            e.preventDefault();
            return false;
          });
          if (!base.usingMobileView) {
            var containerHeight = $(this).height() + 50;
            var max_height = $(window).height() - 50;
            if (containerHeight >= max_height) {
              $(this).css('max-height', max_height + 'px').addClass('tall');
    
              var offset = $('body').scrollTop();
              $('body').addClass('in_menu'); //.css('margin-top','-'+offset+'px').data('scrollTop',offset);
            }
          }
        } else {
          relationships.remove();
          $(this).addClass('noRelations');
          splitList.remove();
        }
        $(this).find('a').on('keyup', function(e) {
          // enter, space
          if (e.which == 13 || e.which == 32) {
            $(this).trigger('click');
          }
        });
        relationships.find('li>ol>li, li>ul>li').each(function() {
          $(this).add($(this).find('.expand')).height($(this).find('a').first().height());
        });
      }
      scalarapi.loadPage(container.data('slug'), true, $.proxy(handleRequest, container), null, 1, false, null, 0, 20);
    }

    base.handleBook = function() {
      this.setupTableOfContents()
      this.setupTrash()
      this.setupKeyboardNavigation()
      base.$el.find('#desktopTitleWrapper').trigger("update");
    }

    base.setupTitleTruncate = function() {
      var base = this;
      base.$el.find('.title_wrapper.visible-xs .book-title').dotdotdot({
        ellipsis: '…',
        wrap: 'letter',
        height: 50,
        callback: function(isTruncated, fullText) {
          var mobileTitle = base.$el.find('.title_wrapper.visible-xs');
          if (isTruncated && !mobileTitle.hasClass('withTooltip')) {
            var titleHtml = $('#desktopTitleWrapper').text().split('by ');
            titleHtml = '<strong>' + titleHtml[0] + '</strong> by ' + (titleHtml.slice(1).join(' by '));

            mobileTitle.tooltip({
                'title': titleHtml,
                'html': true,
                'container': '#scalarheader',
                'placement': 'bottom',
                'template': '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner caption_font text-left"></div></div>'
              })
              .addClass('withTooltip')
              .on('hide.bs.tooltip', function() {
                $(this).find('a').removeClass('tooltipVisible');
              });
            mobileTitle.find('a').on('click', function(e) {
              if (!$(this).hasClass('tooltipVisible')) {
                $(this).addClass('tooltipVisible');
                e.preventDefault();
                return false;
              } else {
                return true;
              }
            });
          } else {
            mobileTitle.tooltip('destroy').removeClass('withTooltip').find('a').off('click');
          }
        }
      });

      var fullText = base.$el.find('#desktopTitleWrapper').text();
      base.$el.find('#desktopTitleWrapper').dotdotdot({
        ellipsis: '…',
        wrap: 'letter',
        height: 50,
        callback: function(isTruncated) {
          //Check if author text is overflowed - if so, add a bootstrap tooltip.
          var base = $('#scalarheader.navbar').data('scalarheader');
          var desktopTitle = base.$el.find('#desktopTitleWrapper');
          if (isTruncated && !desktopTitle.hasClass('withTooltip')) {
            var titleHtml = fullText.split('by ');
            titleHtml = '<strong>' + titleHtml[0] + '</strong> by ' + (titleHtml.slice(1).join(' by '));

            desktopTitle.tooltip({
              'title': titleHtml,
              'html': true,
              'container': '#scalarheader',
              'placement': 'bottom',
              'template': '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner caption_font text-left"></div></div>'
            }).addClass('withTooltip');
          } else if (!isTruncated) {
            desktopTitle.tooltip('destroy').removeClass('withTooltip');
          }
        }
      }).addClass('overflowCalculated');
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