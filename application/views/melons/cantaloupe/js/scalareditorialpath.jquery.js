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
 * http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

(function($){
    $.scalarEditorialPath = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        base.ckeditorLoader = $('<div id="ckeditorLoader"></div>');
        base.nodeList = {};
        base.nodeEditorialStates = {};

        base.book_id = $('#book_id').attr('href');
        $.ajax({
            url: $('link#parent').attr('href')+'login_status',
            success: function(data) {
                base.user_data = data;
            }
        });

        base.nodeTypes = ['page', 'media'];

        base.$nodeList = $('<div>');

        base.numPages = {};

        base.loadedPages = {};

        base.currentLoadType = 0;

        base.additional_nodes_to_load = 5; //Additional nodes to load below screen bottom to ensure lazy scrolling is smooth

        base.is_author = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Author';
        base.is_commentator = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Commentator';
        base.is_reviewer = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Reviewer';
        base.is_editor = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Editor';

        base.node_states = {
                            'draft':{
                                'id':0,
                                'name':'Draft',
                                'changeEffect':(base.is_editor?'you':'editors')+" won't be able to perform review actions until authors have finished their changes."
                            },
                            'edit' :{
                                'id':1,
                                'name':'Edit',
                                'changeEffect':(base.is_author?'you':'authors')+" won't be able to make changes until editors have finished their review."
                            },
                            'editreview' :{
                                'id':2,
                                'name':'Edit Review',
                                'changeEffect':(base.is_editor?'you':'editors')+" won't be able to make changes until authors have finished their review."
                            },
                            'clean' :{
                                'id':3,
                                'name':'Clean',
                                'changeEffect':(base.is_author?'you':'authors')+" will no longer be allowed to make edits."
                            },
                            'ready' :{
                                'id':4,
                                'name':'Ready',
                                'changeEffect':"it will be publishable by authors and editors."
                            },
                            'published' :{
                                'id':5,
                                'name':'Published',
                                'changeEffect':$('a.metadata[rel="scalar:hasEdition"]').length > 0?"it will no longer be editable within this book's edition, and will be made public.":"it will be made public."
                            }
                        };
        base.node_state_flow = {
            'author' : {
                'draft' : [
                    'draft',
                    'edit'
                ],
                'editreview' : [
                    'edit',
                    'editreview',
                    'clean'
                ],
                'published' : [
                    'ready',
                    'published'
                ]
            },
            'editor' : {
                'edit' : [
                    'draft',
                    'edit',
                    'editreview'
                ],
                'clean' : [
                    'editreview',
                    'clean',
                    'ready'
                ],
                'ready' : [
                    'clean',
                    'ready',
                    'published'
                ],
                'published' : [
                    'ready',
                    'published'
                ]
            }
        }
        base.node_state_flow = base.is_author?base.node_state_flow['author']:(base.is_editor?base.node_state_flow['editor']:[]);
        base.stage = 0;
        base.currentChunk = 0;
        base.needsScrollspyRefresh = false;
        base.currentFilterType = undefined;
        base.fuse = null;
        base.searchOptions = {
              shouldSort: true,
              includeMatches: false,
              threshold: 0.333,
              location: 0,
              distance: 100,
              maxPatternLength: 32,
              minMatchCharLength: 1,
              keys: [
                "current.title"
            ]
        };

        base.ucwords = function(str) {
          return (str + '')
            .replace(/^(.)|\s+(.)/g, function ($1) {
              return $1.toUpperCase()
            })
        };

        // Add a reverse reference to the DOM object
        base.$el.data("scalarEditorialPath", base);

        base.init = function(){
            base.options = $.extend({},$.scalarEditorialPath.defaultOptions, options);
            if(base.options.contents == null){
                console.error('Editorial path container not set!');
            }else if(base.options.outline == null){
                console.error('Editorial path outline container not set!');
            }else{
                base.setup();
            }
        };
        base.currentLoaderValue = 0;
        base.updateLoader = function(percent,sidebarText){
            if(percent === "increment"){
                base.currentLoaderValue += ((100-base.currentLoaderValue)/2)*Math.random();
                percent = base.currentLoaderValue;
            }
            base.$loadingBar.find('.inner').width(percent+'%');
            base.currentLoaderValue = percent;
            if(percent >= 100){
                base.$loadingBar.fadeOut('fast',function(){
                    base.currentLoaderValue = 0;
                    $(this).find('.inner').width(0);
                });
            }else{
                base.$loadingBar.show();
            }
            if(!!sidebarText){
                $('.editorialSidePanelLoaderIndicator').attr('data-text',sidebarText);
            }else{
                $('.editorialSidePanelLoaderIndicator').attr('data-text',"");
            }
        };

        base.findGetParameter = function(parameterName) {
            var result = null,
                tmp = [];
            location.search
                .substr(1)
                .split("&")
                .forEach(function (item) {
                  tmp = item.split("=");
                  if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
                });
            return result;
        };

        base.setup = function(data){
            switch(base.stage){
                case 0:
                    //Check to see if we have an edition cookie (and that it matches the current list of editions) - if so, put up a message and stop setup!
                    var editionName = $('span[typeof="scalar:Edition"][resource="'+$('a[rel="scalar:hasEdition"]').attr('href')+'"] .metadata[property="dcterms:title"]').text();
                    var regex = new RegExp("^(.*;)?\s*"+editionCookieName()+"\s*=\s*[^;]+(.*)?$");
                    if(!!editionName && document.cookie.match(regex)){
                        $('#editorialSidePanel').siblings('div').removeClass('col-md-9');
                        $('#editorialSidePanel').remove();
                        $('#pathHeading>p').text('The editorial path is currently inaccessible because you are viewing the published edition, \"'+editionName+'\"');
                        var $resetCookieButton = $('<button class="btn btn-primary">Go to Latest Edits</button>').on('click', function(e){
                            e.preventDefault();
                            document.cookie = editionCookieName()+"=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";  // Delete cookie
                            location.reload();
                        });
                        $('#pathOrderSelectionContainer').replaceWith($resetCookieButton);
                        return;
                    }

                    CKEDITOR.on("instanceReady", function(event)
                    {
                        $('.ckeditorLoading').removeClass('ckeditorLoading');
                        base.ckeditorLoader.detach().hide();
                    });
                    $('body').on('pageLoadComplete, delayedResize',base.resize);
                    //Do a little bit of preliminary setup...
                    base.highestID = -1;
                    $(window).on('click', function(){
                        $('#editorialQueries').hide();
                    });
                    $('#editorialQueries').on('click', function(e){
                        e.stopPropagation();
                    });
                     $('#editorialQueries').find('.queryDropdownToggle').on('click', function(e){
                        $(this).parents('.resolvedQueries').find('.collapse').collapse('toggle');
                        e.stopPropagation();
                        return false;
                    });
                    $('#editorialQueries').find('.collapse').collapse({toggle:false}).on('show.bs.collapse',function(){
                        $(this).parents('.resolvedQueries').find('.queryDropdownToggle small').removeClass('glyphicon-triangle-right').addClass('glyphicon-triangle-bottom');
                    }).on('hide.bs.collapse',function(){
                        $(this).parents('.resolvedQueries').find('.queryDropdownToggle small').removeClass('glyphicon-triangle-bottom').addClass('glyphicon-triangle-right');
                    });
                    $('#addNewQuery').on('click', function(){
                        $('#addNewQueryForm').show().find('#addNewQueryFormText').trigger('focus');
                        $('#editorialQueries').animate({
                            scrollTop: 0
                        }, 200);
                    });
                    $('#addNewQueryForm').find('button').on('click', function(e){
                        var id = ++base.highestID;
                        var query = {
                            id : id,
                            user : fullName,
                            date :  new Date(),
                            body : $('#addNewQueryForm textarea').val(),
                            resolved: false
                        };

                        $('#addNewQueryForm textarea').val('');
                        $('#addNewQueryForm').hide();
                        $('#noQueries').remove();
                        base.addQuery(query,true);
                        base.serializeQueries();
                        e.preventDefault();
                    });

                    var setupLoadingBar = function(){
                        base.$loadingBar.appendTo('#scalarheader');
                    }

                    base.$loadingBar = $('<div id="loadingBarHeader"><div class="inner"></div></div>').hide();

                    if($('#scalarheader').length > 0){
                        setupLoadingBar();
                    }else{
                        $('body').on('headerCreated',setupLoadingBar);
                    }

                    base.$saveNotice = $('<div class="alert alert-success caption_font" role="alert" id="saveNotice">Page updated</div>').appendTo('body');
                    base.$warningNotice = $('<div class="alert alert alert-danger caption_font" role="alert" id="saveErrorNotice">Error saving page</div>').appendTo('body');

                    var re = new RegExp("hideEditorialStateAlert=([^;]+)");
                    var value = re.exec(document.cookie);
                    base.hasEditorialStateAlertCookie = value != null;
                    $('#editorialStateConfirmationSave').on('click', function(e){
                        e.preventDefault();
                        if($('#editorialStateConfirmation .dontShow').prop('checked')){
                            var cookie_days = 7;
                            var cookie_months = 0;
                            var d = new Date();
                            d.setTime(d.setMonth(d.getMonth() + cookie_months) + (cookie_days*86400000));
                            var cookie_expiration = "; expires="+ d.toUTCString();
                            document.cookie = "hideEditorialStateAlert=true" + cookie_expiration;
                            base.hasEditorialStateAlertCookie = true;
                        }
                        $('#editorialStateConfirmation').modal('hide');
                        $('#editorialStateConfirmationSave').data('$link').data('changeState')();
                        return false;
                    });

                    $('#editorialSidePanel .dropdown .dropdown-menu a').on('click', function(e){
                        e.preventDefault();
                        $('#editorialSidePanel .dropdown #panelDropdownText').text($(this).text());
                        $($(this).attr('href')).addClass('in').siblings('.collapse').removeClass('in');
                        $('.bookname').text($('meta[property="og:site_name"]').attr('content'));
                    });

                    $('body').on('headerSizeChanged',function(){
                        var offset = 55;
                        if(typeof $('body').data('bs.scrollspy') != 'undefined'){
                                $('body').data('bs.scrollspy').options.offset = offset;
                        }
                        $('body').scrollspy('refresh');
                    });

                    $(window).on('scroll', function(e) {
                       if($(window).scrollTop() + $(window).height() >= ($(document).height()-50)) {
                           if(base.$nodeList.find('.loader').length == 0 && typeof base.nextNodeIndexToLoad !== 'undefined' && typeof base.currentNodeList !== 'undefined' && base.nextNodeIndexToLoad < base.currentNodeList.length){
                              var loadedNodes = 0;
                              base.updateLoader((loadedNodes/base.additional_nodes_to_load)*100);
                              var callback = function(){
                                base.updateLoader((loadedNodes/base.additional_nodes_to_load)*100);
                                window.setTimeout(function(){
                                    var nodeListBottom = base.$nodeList.height() + base.$nodeList.offset().top;
                                    if(base.nextNodeIndexToLoad < base.currentNodeList.length && (nodeListBottom < $(window).height() || ++loadedNodes < base.additional_nodes_to_load)){
                                        base.addNode(base.currentNodeList[base.nextNodeIndexToLoad++],callback);
                                    }else{
                                        base.updateLoader(100);
                                        $('body').scrollspy('refresh');
                                    }
                                },50);
                              }
                              loadedNodes++;
                              base.addNode(base.currentNodeList[base.nextNodeIndexToLoad++],callback);
                           }
                       }
                    });

                    $('#contentOrderDropdown a').on('click', function(e){
                        e.preventDefault();
                        base.changeSort($(this).data('sort'));
                        $(this).parent().addClass('active').siblings().removeClass('active');
                        $('#contentOrderDropdown .btn .text').text($(this).text());
                    });


                    var spinner_options = {
                      lines: 13, // The number of lines to draw
                      length: 5, // The length of each line
                      width: 2, // The line thickness
                      radius: 6, // The radius of the inner circle
                      rotate: 0, // The rotation offset
                      color: '#000', // #rgb or #rrggbb
                      speed: 1, // Rounds per second
                      trail: 60, // Afterglow percentage
                      shadow: false, // Whether to render a shadow
                      hwaccel: false, // Whether to use hardware acceleration
                      className: 'spinner', // The CSS class to assign to the spinner
                      zIndex: 2e9, // The z-index (defaults to 2000000000)
                      top: '50%', // Top position relative to parent in px
                      right: '50%' // Left position relative to parent in px
                    };
                    var spinner = new Spinner(spinner_options).spin();
                    $('#editorialSidePanel .editorialSidePanelLoaderIndicator').find('.spinner_container').each(function(){
                        $(this).append(spinner.el);
                    });

                    spinner = new Spinner(spinner_options).spin();
                    base.ckeditorLoader.append(spinner.el);

                    base.node_state_classes = [];
                    for(var stateClass in base.node_states){
                        base.node_state_classes.push(stateClass);
                    }
                    base.node_state_string = base.node_state_classes.join(' ');

                    $('#contentFinder').on('submit', function(e){
                        e.stopPropagation();
                        e.preventDefault();
                        $('#editorialPathSearchText').trigger('blur');
                        return false;
                    });

                    $('#editorialPathSearchText').on('keydown',function(){$(this).removeClass('resolved');}).on('keyup blur',function(){
                        if($(this).hasClass('resolved')){
                            return;
                        }
                        $(this).addClass('resolved');
                        if(typeof base.fuse == 'undefined') return;
                        var res = base.fuse.search($(this).val());
                        $('#matchedNodes').html('');
                        if($(this).val().length > 0){
                            var height = $('#filterDropdown .dropdown-menu').height();
                            $('#filterDropdown').addClass('hasContent');
                            $('#editorialContentFinder').css('padding-bottom',height);
                            if(res.length > 0){
                                for(var n in res){
                                    var node = res[n];
                                    var splitList = $('<ul></ul>');

                                    var path_of = node.getRelatedNodes('path', 'outgoing');
                                    var features = node.getRelatedNodes('reference', 'outgoing');
                                    var tag_of = node.getRelatedNodes('tag', 'incoming');
                                    var annotates = node.getRelatedNodes('annotation', 'outgoing');
                                    var comments_on = node.getRelatedNodes('comment', 'outgoing');


                                    var hasRelations = path_of.length + features.length + tag_of.length + annotates.length + annotates.length > 0;
                                    var hasDescription = (typeof node.current.description !== 'undefined' || typeof node.current.content !== 'undefined') &&
                                                         (node.current.description !== null || node.current.content !== null) &&
                                                         (node.current.description !== '' || node.current.content !== '');
                                    var description = '';
                                    if(hasDescription){
                                        if(typeof node.current.description !== 'undefined' && node.current.description !== null && node.current.description !== ''){
                                            description = node.current.description;
                                        }else{
                                            description = node.current.content;
                                        }

                                        var node_url = scalarapi.model.urlPrefix+node.slug;
                                        description = $('<div>'+description+'</div>').text().substring(0,100)+'... <a class="moreLink" href="'+node_url+'">[More]</a>';
                                    }

                                    if(path_of.length > 0){
                                        var newList = $('<li><strong>Contains</strong><ol></ol></li>').appendTo(splitList).find('ol');
                                        for(var i in path_of){
                                            var relNode = path_of[i];
                                            var nodeItem = $('<li><a href="#">'+relNode.current.title+'</a></li>');
                                            nodeItem.find('a').on('click', $.proxy(function(slug, e){
                                                e.preventDefault();
                                                $('#editorialSidePanel').addClass('loading_nodes');
                                                window.setTimeout($.proxy(function(slug){ this.scrollToNode(slug,false); },base,slug),1);
                                                return false;
                                            },base, relNode.slug));
                                            newList.append(nodeItem);
                                        }
                                    }

                                    if(features.length > 0){
                                        var newList = $('<li><strong>Features</strong><ol></ol></li>').appendTo(splitList).find('ol');
                                        for(var i in features){
                                            var relNode = features[i];
                                            var nodeItem = $('<li><a href="#">'+relNode.current.title+'</a></li>');
                                            nodeItem.find('a').on('click', $.proxy(function(slug, e){
                                                e.preventDefault();
                                                $('#editorialSidePanel').addClass('loading_nodes');
                                                window.setTimeout($.proxy(function(slug){ this.scrollToNode(slug,false); },base,slug),1);
                                                return false;
                                            },base, relNode.slug));
                                            newList.append(nodeItem);

                                        }
                                    }

                                    if(tag_of.length > 0){
                                        var newList = $('<li><strong>Tagged by</strong><ol class="tags"></ol></li>').appendTo(splitList).find('ol');
                                        for(var i in tag_of){
                                            var relNode = tag_of[i];
                                            var nodeItem = $('<li><a href="#">'+relNode.current.title+'</a></li>');
                                            nodeItem.find('a').on('click', $.proxy(function(slug, e){
                                                e.preventDefault();
                                                $('#editorialSidePanel').addClass('loading_nodes');
                                                window.setTimeout($.proxy(function(slug){ this.scrollToNode(slug,false); },base,slug),1);
                                                return false;
                                            },base, relNode.slug));
                                            newList.append(nodeItem);

                                        }
                                    }

                                    if(annotates.length > 0){
                                        var newList = $('<li><strong>Annotates</strong><ol></ol></li>').appendTo(splitList).find('ol');
                                        for(var i in annotates){
                                            var relNode = annotates[i];
                                            var nodeItem = $('<li><a href="#">'+relNode.current.title+'</a></li>');
                                            nodeItem.find('a').on('click', $.proxy(function(slug, e){
                                                e.preventDefault();
                                                $('#editorialSidePanel').addClass('loading_nodes');
                                                window.setTimeout($.proxy(function(slug){ this.scrollToNode(slug,false); },base,slug),1);
                                                return false;
                                            },base, relNode.slug));
                                            newList.append(nodeItem);

                                        }
                                    }

                                    if(comments_on.length > 0){
                                        var newList = $('<li><strong>Comments on</strong><ol></ol></li>').appendTo(splitList).find('ol');
                                        for(var i in comments_on){
                                            var relNode = comments_on[i];
                                            var nodeItem = $('<li><a href="#">'+relNode.current.title+'</a></li>');
                                            nodeItem.find('a').on('click', $.proxy(function(slug, e){
                                                e.preventDefault();
                                                $('#editorialSidePanel').addClass('loading_nodes');
                                                window.setTimeout($.proxy(function(slug){ this.scrollToNode(slug,false); },base,slug),1);
                                                return false;
                                            },base, relNode.slug));
                                            newList.append(nodeItem);
                                        }
                                    }

                                    if(hasRelations || hasDescription){
                                        var nodeMatchItemHTML = '<li class="heading_font">'+
                                                                    '<a class="resultTitle" href="#">'+
                                                                        '<small class="glyphicon glyphicon-triangle-right dropdownCaret" aria-hidden="true" data-toggle="collapse" data-target="#result_'+node.slug.replace(/\//g, '_')+'" aria-expanded="false" aria-controls="result_'+node.slug.replace(/\//g, '_')+'"></small>'+node.getDisplayTitle()+
                                                                    '</a>'+
                                                                    '<div class="collapse" id="result_'+node.slug.replace(/\//g, '_')+'">'+
                                                                      '<div class="description body_font"></div>'+
                                                                      '<div class="relations"></div>'+
                                                                    '</div>'+
                                                                '</li>';
                                    }else{
                                        var nodeMatchItemHTML = '<li class="heading_font">'+
                                                                    '<a class="resultTitle" href="#">'+
                                                                        node.getDisplayTitle()+
                                                                    '</a>'+
                                                                '</li>';
                                    }

                                    var $nodeMatchItem = $(nodeMatchItemHTML).appendTo('#matchedNodes').data('slug',node.slug);

                                    if(hasRelations){
                                        $nodeMatchItem.find('.relations').append(splitList);
                                    } else {
                                        $nodeMatchItem.find('.relations').remove();
                                    }

                                    if(hasDescription){
                                        $nodeMatchItem.find('.description').append('<div class="content">'+description+'</div>');
                                    } else {
                                        $nodeMatchItem.find('.description').remove();
                                    }

                                    $nodeMatchItem.find('.resultTitle').on('click', function(e){
                                        e.preventDefault();
                                        $('#editorialSidePanel').addClass('loading_nodes');
                                        var slug = $(this).parents('li').data('slug');
                                        window.setTimeout(function(){base.scrollToNode(slug,false);},1);
                                        return false;
                                    });


                                    $nodeMatchItem.find('.dropdownCaret').on('click', function(e){
                                        $(this).parents('li').find('.collapse').collapse('toggle');
                                        e.stopPropagation();
                                        return false;
                                    });

                                    $nodeMatchItem.find('.collapse').collapse({toggle:false}).on('show.bs.collapse',function(){
                                        $(this).parents('li').find('.resultTitle small').removeClass('glyphicon-triangle-right').addClass('glyphicon-triangle-bottom');
                                    }).on('hide.bs.collapse',function(){
                                        $(this).parents('li').find('.resultTitle small').removeClass('glyphicon-triangle-bottom').addClass('glyphicon-triangle-right');
                                    });
                                    /*$nodeMatchItem.data('slug',node.slug).find('a').on('click', $.proxy(function(slug, e){
                                        e.preventDefault();
                                        $('#editorialSidePanel').addClass('loading_nodes');
                                        window.setTimeout($.proxy(function(slug){ this.scrollToNode(slug,false); },base,slug),1);
                                        return false;
                                    },base, node.slug));*/
                                }
                            }else{
                                $('<li class="empty text-muted"><small>No content matched your search!</small></li>').appendTo('#matchedNodes');
                            }
                        }else{
                            $('#filterDropdown').removeClass('hasContent');
                            $('#editorialContentFinder').css('padding-bottom',0);
                        }
                    });

                    //Add the loader text for the content
                    base.$contentLoader = $('<div class="loader text-muted well text-center caption_font"><strong>Loading book content... Please wait, this might take a little while.</strong><br /><small class="info"></small></span>').appendTo(base.options.contents);
                    base.$contentLoaderInfo = base.$contentLoader.find('.info');

                    base.$contentLoaderInfo.fadeOut('fast',function(){$(this).text('Determining book size...').fadeIn('fast')});

                    var loadedTypes = 0;
                    var nodeLoadDeferred = $.Deferred();

                    nodeLoadDeferred.done(function(){
                        base.stage = 1;
                        base.setup();
                    });

                    for(var type in base.nodeTypes){
                        (function(base, type){
                            scalarapi.loadNodesByType(
                                type, true, function(data){
                                    base.nodeList[type] = data;
                                    if(++loadedTypes == base.nodeTypes.length){
                                        nodeLoadDeferred.resolve();
                                    }
                                }
                            );
                        })(base, base.nodeTypes[type]);
                    }

                    break;
                case 1:
                    base.numPages['total'] = 0;
                    for(var type in base.nodeList){
                        if(typeof base.numPages[type] === 'undefined'){
                            var data = base.nodeList[type];
                            for(var uri in data){
                                var regex = /(?:\.)(\d+)\b/;
                                var matches = null;
                                if((matches = regex.exec(uri)) !== null){
                                    //We have a version node... Just lop off that version number so we can get the citation property
                                    uri = uri.slice(0, uri.lastIndexOf('.'));
                                }
                                var node = data[uri];
                                if(typeof node == 'undefined'){
                                    continue;
                                }
                                var citationProp = node['http://scalar.usc.edu/2012/01/scalar-ns#citation'][0].value;
                                regex = /(?:.*methodNumNodes=(\d+))/;
                                matches = null;
                                if((matches = regex.exec(citationProp)) === null){
                                    continue;
                                }else{
                                    base.numPages[type] = parseInt(matches[1]);
                                    base.numPages['total'] += base.numPages[type];
                                    break;
                                }
                            }
                        }
                    }
                    base.stage = 2;
                    base.updateLoader(0);
                    base.$contentLoaderInfo.fadeOut('fast',function(){$(this).text('Loading '+base.nodeTypes[base.currentLoadType]+' nodes - 0%').fadeIn('fast')});

                    scalarapi.loadNodesByType(
                        base.nodeTypes[base.currentLoadType], true, base.setup,
                        null, null, null, null, (base.currentChunk++)*base.options.pagesPerChunk, base.options.pagesPerChunk
                    );

                    break;
                case 2:
                    //Parse the data!
                    var new_nodes = 0;
                    for(var uri in data){
                        var node = scalarapi.getNode( uri );
                        var regex = /(?:\.)(\d+)\b/;
                        var matches = null;
                        if((matches = regex.exec(uri)) === null){
                            if(uri.lastIndexOf('http', 0) === 0){
                                //We don't have a version node! Load the node.
                                var node = scalarapi.getNode( uri );
                                node.editorialState = node.current.editorialState || 'draft';
                                if(typeof base.nodeList.unsorted == 'undefined'){
                                    base.nodeList.unsorted = [];
                                }
                                base.nodeList.unsorted.push(node);
                                new_nodes++;
                            }
                        }
                    }


                    //Escape if we have loaded everything!
                    if(base.currentChunk*base.options.pagesPerChunk > base.numPages[base.nodeTypes[base.currentLoadType]] || new_nodes <= 0){
                       if(++base.currentLoadType >= base.nodeTypes.length){
                            base.updateLoader(100);
                            base.$contentLoaderInfo.text('Loading '+base.nodeTypes[base.currentLoadType-1]+' nodes - 100%');
                            base.stage = 3;
                            base.setup();
                            return;
                        }else{
                            base.updateLoader(0);
                            base.currentChunk = 0;
                            base.$contentLoaderInfo.text('Loading '+base.nodeTypes[base.currentLoadType]+' nodes - 0%');
                        }
                    }else{
                        var percent = Math.round((base.currentChunk*base.options.pagesPerChunk)/base.numPages[base.nodeTypes[base.currentLoadType]])*100;
                        base.updateLoader(percent);
                        base.$contentLoaderInfo.text('Loading '+base.nodeTypes[base.currentLoadType]+' nodes - '+percent+'%');
                        base.currentChunk++;
                    }
                    window.setTimeout(function(){
                        scalarapi.loadNodesByType(
                            base.nodeTypes[base.currentLoadType], true, base.setup,
                            null, 1, false, null, base.currentChunk*base.options.pagesPerChunk, base.options.pagesPerChunk
                        );
                    },50);

                    break;
                case 3:
                    //remove any duplicate nodes - since we are grabbing relationships, we will likely have some.
                    var uniqueNodes = [];
                    $.each(base.nodeList.unsorted, function(i, el){
                        if($.inArray(el, uniqueNodes) !== -1) return;
                        uniqueNodes.push(el);
                    });
                    base.nodeList.unsorted = uniqueNodes;

                    base.updateLists();

                    base.propogateInitialPage();
                case 4:

                    $('#editorialSidePanel>div').affix({
                      offset: {
                        top: 50
                      }
                    });

                    base.$nodeList.appendTo(base.options.contents);

                    $('body').scrollspy({ target: '#editorialOutline', offset: 69 });
                    base.$contentLoader.fadeOut('fast');

                    base.resize();
            }
        };

        base.updateLists = function(){
            //Name
            base.nodeList.sortedByName = base.nodeList.unsorted.slice();
            base.nodeList.sortedByName.sort(function(a, b) {
              a = a.current.title.toLowerCase(), b = b.current.title.toLowerCase();
              return a>b?1:(a<b?-1:0);
            });


            //State
            base.nodeList.sortedByEditorialStateAsc = base.nodeList.sortedByName.slice();
            base.nodeList.sortedByEditorialStateAsc.sort(function(a, b) {
              a = base.node_states[a.current.editorialState].id, b = base.node_states[b.current.editorialState].id;
              return a>b?1:(a<b?-1:0);
            });

            base.nodeList.sortedByEditorialStateDesc = base.nodeList.sortedByName.slice();
            base.nodeList.sortedByEditorialStateDesc.sort(function(a, b) {
              a = base.node_states[a.current.editorialState].id, b = base.node_states[b.current.editorialState].id;
              return a<b?1:(a>b?-1:0);
            });

            //Type
            base.nodeList.sortedByType = base.nodeList.sortedByName.slice();
            base.nodeList.splitByType = {};
            var filterTypes = ['all'];
            for(var node in base.nodeList.sortedByType){
                var a = base.nodeList.sortedByType[node];
                if(typeof a.domType == 'undefined'){
                    a.domType = a.getDominantScalarType();
                }

                if(typeof base.nodeList.splitByType[a.domType.singular] == 'undefined'){
                    base.nodeList.splitByType[a.domType.singular] = [];
                    filterTypes.push(a.domType.singular);
                }

                base.nodeList.splitByType[a.domType.singular].push(a);
            }


            filterTypes.sort();
            base.currentFilterType = filterTypes[0];
            $('#filterTypeText').text(base.ucwords(base.currentFilterType));
            base.fuse = new Fuse(base.nodeList.sortedByName, base.searchOptions);
            for(var t in filterTypes){
                $('<li><a role="button" data-type="'+filterTypes[t]+'" href="#">'+base.ucwords(filterTypes[t])+'</a></li>').appendTo('#editorialContentFinder .dropdown-menu').find('a').on('click', function(e){
                        e.preventDefault();
                        $('#editorialPathSearchText').removeClass('resolved');
                        base.currentFilterType = $(this).data('type');
                        $('#filterTypeText').text(base.ucwords(base.currentFilterType));
                        if(base.currentFilterType === 'all'){
                            base.fuse = new Fuse(base.nodeList.sortedByName,base.searchOptions);
                        }else{
                            base.fuse = new Fuse(base.nodeList.splitByType[base.currentFilterType], base.searchOptions);
                        }
                });
            }

            base.nodeList.sortedByType.sort(function(a, b) {
                namea = a.current.title.toLowerCase(), nameb = b.current.title.toLowerCase();
                a = a.domType.id; b = b.domType.id;
                return a>b?1:(a<b?-1:(namea>nameb?1:(namea<nameb?-1:0)));
            });


            //Date Asc
            base.nodeList.sortedByLastModifiedDateAsc = base.nodeList.sortedByName.slice();
            base.nodeList.sortedByLastModifiedDateAsc.sort(function(a, b) {
                a = new Date(a.current.created), b = new Date(b.current.created);
                return a<b?1:(a>b?-1:0);
            });

            //Date Desc
            base.nodeList.sortedByLastModifiedDateDesc = base.nodeList.sortedByName.slice();
            base.nodeList.sortedByLastModifiedDateDesc.sort(function(a, b) {
                a = new Date(a.current.created), b = new Date(b.current.created);
                return a>b?1:(a<b?-1:0);
            });

            base.loadOutline();
        }

        base.propogateInitialPage = function(){
            base.$nodeList.appendTo(base.options.contents);
            var pagePadding = ($(window).height()-$('.editorialpath-page').height())+60;
            base.changeSort('Name');
        };

        base.changeSort = function(sortName){
            for(name in CKEDITOR.instances)
            {
                CKEDITOR.instances[name].destroy(true);
            }
            base.nextNodeIndexToLoad = 0;
            base.currentNodeList = base.nodeList["sortedBy"+sortName];

            var extraLoadedNodes = 0;
            $(base.$nodeList).html('');
            base.updateLoader(0);
            var callback = function(){
                base.updateLoader("increment");
                window.setTimeout(function(){
                    var nodeListBottom = base.$nodeList.height() + base.$nodeList.offset().top;
                    if(base.nextNodeIndexToLoad < base.currentNodeList.length && (nodeListBottom < $(window).height() || extraLoadedNodes < (base.additional_nodes_to_load-1))){
                        if(nodeListBottom >= $(window).height()){
                            extraLoadedNodes++;
                        }
                        base.addNode(base.currentNodeList[base.nextNodeIndexToLoad++],callback);
                    }else{
                        base.updateLoader(100,"");
                        $('body').scrollspy('refresh');
                        base.stage = 4;
                        base.setup();
                    }
                },50);
            }
            base.addNode(base.currentNodeList[base.nextNodeIndexToLoad++],callback);
            base.loadOutline();
        };

        base.loadOutline = function(){
            $('#editorialOutline>ul').html('');
            for(var node in base.currentNodeList){
                node = base.currentNodeList[node];
                var nodeOutlineItemHTML = '<li class="'+node.current.editorialState+'"><a data-node="'+node.slug+'" href="#node_'+node.slug.replace(/\//g, '_')+'">'+node.getDisplayTitle()+'</a></li>';
                var $nodeOutlineItem = $(nodeOutlineItemHTML).appendTo('#editorialOutline>ul');

                $nodeOutlineItem.data('slug',node.slug).find('a').on('click', $.proxy(function(slug, e){
                    e.preventDefault();
                    $('#editorialSidePanel').addClass('loading_nodes');

                    window.setTimeout($.proxy(function(slug){ this.scrollToNode(slug,false); },base,slug),1);
                },base, node.slug));
            }
        };

        base.scrollToNode = function(nodeSlug,reloadOutline){
            var $node = $('#node_'+nodeSlug.replace(/\//g, '_'));
            if($node.length > 0){
                base.updateLoader(100,"");
                $('html, body').animate({
                        scrollTop: $node.offset().top - 49
                }, 1000);
                window.setTimeout(function(){$('#editorialSidePanel').removeClass('loading_nodes');},1000);
            }else{
                var percent = 0;
                var percentPerNode = 0;
                var currentPage = 1;
                var extraLoadedNodes = 0;
                var foundNode = false;
                var numNodes = 0;
                for(var i = base.nextNodeIndexToLoad; i < base.currentNodeList.length; i++){
                    numNodes++;
                    if(base.currentNodeList[i].slug == nodeSlug){
                        break;
                    }
                }
                base.updateLoader(percent,"Loading page 1 of "+numNodes);

                percentPerNode = (1/numNodes)*100;

                var callback = function(){
                    percent += percentPerNode;
                    base.updateLoader(percent,"Loading page "+(++currentPage)+" of "+numNodes);
                    window.setTimeout(function(){ //Do a timeout here to break node loading into its own asynchronous flow
                        if(base.nextNodeIndexToLoad >= base.currentNodeList.length || (base.currentNodeList[base.nextNodeIndexToLoad-1].slug == nodeSlug || extraLoadedNodes >= base.additional_nodes_to_load)){
                            $node = $('#node_'+nodeSlug.replace(/\//g, '_'));
                            base.updateLoader(100);
                            $('html, body').animate({
                                    scrollTop: $node.offset().top - ($node.offset().top > $('body').scrollTop() ? 0 : 30)
                            }, 1000);
                            if(reloadOutline){
                                base.loadOutline();
                            }
                            $('body').scrollspy('refresh');
                            $('#editorialSidePanel').removeClass('loading_nodes');
                        }else{
                            if(base.currentNodeList[base.nextNodeIndexToLoad-1].slug == nodeSlug){
                                foundNode = true;
                            }
                            if(foundNode){
                                extraLoadedNodes++;
                            }
                            base.addNode(base.currentNodeList[base.nextNodeIndexToLoad++],callback);
                        }
                    },50);
                }
                base.addNode(base.currentNodeList[base.nextNodeIndexToLoad++],callback);
            }
        };

        base.showStateChangeAlert = function($link){
            $('#editorialStateConfirmation .new_state').text(base.node_states[$link.data('state')].name);
            $('#editorialStateConfirmation .post_change_effect').text(base.node_states[$link.data('state')].changeEffect);
            $('#editorialStateConfirmation .content_type').text($link.parents('.editorial_node').find('.bodyContent').hasClass('media')?'media file':'page');
            $('#editorialStateConfirmationSave').data('$link',$link);
            $('#editorialStateConfirmation').modal('show');
        };

        base.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        base.serializeQueries = function(){
            //We need to serialize the queries then save them... Let's see.
            var queryJSON = {"queries":[]};
            $('#editorialQueries>.queries').children('.query').each(function(){
                var query = $(this).data('query');
                //Remove the replies - we'll build those again
                delete query.replyTo;
                query.replies = [];
                //Now add the replies...
                $(this).find('.replies .query').each(function(){
                    var reply = $(this).data('query');
                    delete reply.replyTo;
                    delete reply.id;
                    //These shouldn't have replies, but just in case...
                    delete reply.replies;
                    query.replies.push(reply);
                });
                queryJSON.queries.push(query);
            });
            $('#editorialQueries .resolvedQueries .queries').children('.query').each(function(){
                var query = $(this).data('query');
                //Remove the replies - we'll build those again
                query.replies = [];
                delete query.replyTo;
                query.resolved = true;
                //Now add the replies...
                $(this).find('.replies .query').each(function(){
                    var reply = $(this).data('query');
                    delete reply.replyTo;
                    delete reply.id;
                    delete reply.resolved;
                    //These shouldn't have replies, but just in case...
                    delete reply.replies;
                    query.replies.push(reply);
                });
                queryJSON.queries.push(query);
            });
            queryJSON.queries.sort(function(a,b){
                return a.id - b.id;
            });
            var $node = $('#editorialQueries').data('$currentNode');
            var node = $node.data('node');
            node.current.editorialQueries = JSON.stringify(queryJSON);
            $node.data('node',node);
            var queryCount = 0;
            for(var i in queryJSON.queries){
                var query = queryJSON.queries[i];
                if(!query.resolved){
                    queryCount++;
                }
            }
            $node.find('.with_queries_badge,.no_queries_badge')
                 .removeClass('with_queries_badge,no_queries_badge')
                 .addClass(queryCount>0?'with_queries_badge':'no_queries_badge')
                 .text((queryCount>0?queryCount:'No')+' Quer'+(queryCount!=1?'ies':'y'));
            base.saveNode($node,false);
        };

        base.sortResolved = function(){
            var queries = $('#editorialQueries .resolvedQueries .queries').children().get();
            queries.sort(function(a,b){
                return parseInt(b.dataset.time) - parseInt(a.dataset.time);
            });
            $('#editorialQueries .resolvedQueries .queries').append(queries);
        };

        base.addQuery = function(query,scrollToQuery){
            var date = query.date;
            if(typeof date === "string"){
                date = new Date(date);
            }
            var hour = date.getHours();
            var suffix = "am";
            if(hour > 12){
                hour -= 12;
                suffix = "pm";
            }else if(hour == 0){
                hour = 12;
            }
            var dateString = hour+':'+(('0' + date.getMinutes()).slice(-2))+' '+suffix+' '+base.monthNames[date.getMonth()]+' '+date.getDate();
            var $query = $('<div class="query caption_font" id="query_'+query.id+'">'+
                                (!query.resolved?'<button class="btn btn-sm pull-right resolve">Resolve</button>':'')+
                                '<strong class="user">'+query.user+'</strong>'+
                                '<small class="date">'+dateString+'</small>'+
                                '<div class="body">'+query.body+'</div>'+
                           '</div>').attr('data-time',date.getTime());
            $query.data('query',query);
            $query.find('.resolve').on('click', function(){
                $('#editorialQueries .resolvedQueries').show();
                var $query = $(this).parents('.query');
                $query.prependTo('#editorialQueries .resolvedQueries .queries');
                $(this).remove();
                $query.find('.newReply').remove();
                var query = $query.data('query');
                query.resolved = true;
                $query.data('query',query);
                $('#editorialQueries .resolvedQueries .queryCount').text(parseInt($('#editorialQueries .resolvedQueries .queryCount').text())+1);
                $('#editorialQueries .resolvedQueries').find('.collapse').collapse('show');
                base.serializeQueries();
                base.sortResolved();
            });
            var $replies = $('<div class="replies"></div>').appendTo($query);
            if(!query.resolved){
                var $newReply = $('<div class="newReply">'+
                                        '<form class="form-inline">'+
                                            '<div class="form-group">'+
                                                '<label class="sr-only" for="reply_'+query.id+'">New reply</label>'+
                                                '<input type="text" class="form-control input-sm replyText" id="reply_'+query.id+'" placeholder="New reply">'+
                                                '<button type="submit" class="btn btn-default btn-sm pull-right">Submit</button>'+
                                            '</div>'+
                                        '</form>'+
                                  '</div>').appendTo($query);
                $newReply.find('button').on('click', function(e){
                    e.preventDefault();
                    var $newReply = $(this).parents('.newReply');
                    var bodyText = $newReply.find('input').val();
                    if(bodyText==''){
                        return false;
                    }
                    var newReply = {
                        user : fullName,
                        date :  new Date(),
                        body : bodyText
                    };
                    $newReply.find('input').val('');
                    date = newReply.date;
                    hour = date.getHours();
                    suffix = "am";
                    if(hour > 12){
                        hour -= 12;
                        suffix = "pm";
                    }else if(hour == 0){
                        hour = 12;
                    }
                    dateString = hour+':'+(('0' + date.getMinutes()).slice(-2))+' '+suffix+' '+base.monthNames[date.getMonth()]+' '+date.getDate();
                    var $reply = $('<div class="query">'+
                                        '<strong class="user">'+newReply.user+'</strong>'+
                                        '<small class="date">'+dateString+'</small>'+
                                        '<div class="body">'+newReply.body+'</div>'+
                                   '</div>').appendTo($replies);

                    $('#editorialQueries').animate({
                        scrollTop: $newReply.offset().top-$('#editorialQueries').offset().top
                    }, 200);

                    $reply.data('query',newReply);
                    $(this).siblings('.replyText').trigger('focus');
                    base.serializeQueries();
                });
            }
            for(var r in query.replies){
                var reply = query.replies[r];
                date = reply.date;
                if(typeof date === "string"){
                    date = new Date(date);
                }
                hour = date.getHours();
                suffix = "am";
                if(hour > 12){
                    hour -= 12;
                    suffix = "pm";
                }else if(hour == 0){
                    hour = 12;
                }
                dateString = hour+':'+(('0' + date.getMinutes()).slice(-2))+' '+suffix+' '+base.monthNames[date.getMonth()]+' '+date.getDate();
                var $reply = $('<div class="query" id="query_'+reply.id+'">'+
                                    '<strong class="user">'+reply.user+'</strong>'+
                                    '<small class="date">'+dateString+'</small>'+
                                    '<div class="body">'+reply.body+'</div>'+
                               '</div>').appendTo($replies);
                $reply.data('query',reply);
            }
            if(query.resolved){
                $query.prependTo($('#editorialQueries .resolvedQueries .queries'));
                $('#editorialQueries .resolvedQueries').show();
                $('#editorialQueries .resolvedQueries .queryCount').text(parseInt($('#editorialQueries .resolvedQueries .queryCount').text())+1);
                if(scrollToQuery && scrollToQuery === true){
                    $('#editorialQueries').animate({
                        scrollTop: $query.offset().top-$('#editorialQueries').offset().top
                    }, 200);
                }
            }else{
                $query.prependTo($('#editorialQueries>.queries'));
                if(scrollToQuery && scrollToQuery === true){
                    $('#editorialqueries>.queries').find('.new').removeClass('new');
                    $query.addClass('new');
                    $('#editorialQueries').animate({
                        scrollTop: $query.offset().top-$('#editorialQueries').offset().top
                    }, 200);
                    window.setTimeout(function(){
                        $query.removeClass('new');
                    },200);
                }
            }
        };
        base.populateQueries = function($parentNodeElement){
            var canAddQueries = base.node_state_flow[$parentNodeElement.data('state')];
            var currentNode = $parentNodeElement.data('node').current;
            var queries = currentNode.editorialQueries?JSON.parse(currentNode.editorialQueries).queries:[];
            $('#editorialQueries').data('$currentNode',$parentNodeElement);
            $('#editorialQueries .queries').html('');
            $('#editorialQueries .resolvedQueries').hide();
            base.highestID = -1;
            for(var q in queries){
                var query = queries[q];
                if(query.id > base.highestID){
                    base.highestID = query.id;
                }
                base.addQuery(query);
            }
            base.sortResolved();

            if(base.highestID == -1){
                $('<div id="noQueries" class="text-muted text-center">There are no queries yet.</div>').appendTo($('#editorialQueries>.queries'));
            }

            $('#editorialQueries').toggleClass('disabled',!canAddQueries).show();
            $('#addNewQueryForm').hide();
        };
        base.addNode = function(node,callback,$replace){
            var currentVersion = node.current;
            var queries = currentVersion.editorialQueries?JSON.parse(currentVersion.editorialQueries).queries:[];
            var state = node.current.editorialState;
            var stateName = base.node_states[state].name;
            var node_url = scalarapi.model.urlPrefix+node.slug;
            var nodeView = (typeof node.current.defaultView !== 'undefined' && node.current.defaultView != null) ? node.current.defaultView : 'plain';
            var queryCount = 0;

            var diff = {};

            var deferred = $.Deferred();
            deferred.then(function(){

                $('#editorialQueries .resolvedQueries .queryCount').text('0');
                var hasContent = typeof node.current.content !== 'undefined' && node.current.content != null;
                var viewName = typeof views[nodeView] !== 'undefined' && views[nodeView] != null ? views[nodeView].name : nodeView;

                if(typeof viewName == 'undefined' || viewName == null){
                    viewName = views['plain'];
                }

                var nodeItemHTML = '<div id="node_'+node.slug.replace(/\//g, '_')+'" class="editorial_node node caption_font">' +
                                        '<div class="row">'+
                                            '<div class="col-xs-12 col-sm-8 col-md-9 leftInfo">'+
                                                '<h2 class="heading_font heading_weight clearboth title"><a href="'+node_url+'">'+node.getDisplayTitle()+'</a></h2>'+
                                                '<div id="node_'+node.slug.replace(/\//g, '_')+'_description" class="descriptionContent caption_font disabled"></div>'+
                                                '<div class="header_font badges">';
                if (viewName != 'Basic') {
                    nodeItemHTML += '<span class="header_font badge view_badge">'+viewName+'</span>';
                }
                nodeItemHTML += '<span class="header_font badge type_badge">'+base.ucwords(node.domType.singular)+'</span>';
                nodeItemHTML += '<span class="header_font badge '+(queryCount>0?'with_queries_badge':'no_queries_badge')+'">'+(queryCount>0?queryCount:'No')+' quer'+(queryCount!=1?'ies':'y')+'</span>'+
                                                    (!!base.node_state_flow[state]?'<a href="'+node_url+'.edit" class="edit_btn btn btn-sm btn-default">Open in page editor</a>':'')+
                                                '</div>'+
                                            '</div>'+
                                            '<div class="col-xs-12 col-sm-4 col-md-3">';

                if(!!base.node_state_flow[state] && !waitingForReview){
                    nodeItemHTML += '<div class="dropdown state_dropdown">'+
                                                    '<button class="'+state+' btn state_btn btn-block dropdown-toggle" type="button" id="stateSelectorDropdown_'+node.slug.replace(/\//g, '_')+'" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="caret pull-right"></span><span class="btn_text">'+stateName+'</span></button>'+
                                                        '<ul class="dropdown-menu" aria-labelledby="stateSelectorDropdown_'+node.slug.replace(/\//g, '_')+'">';
                    for(var stateClassIndex in base.node_state_flow[state]){
                        var stateClass = base.node_state_flow[state][stateClassIndex];
                        nodeItemHTML +=                     '<li class="'+stateClass+'"><a href="#" data-state="'+stateClass+'" class="'+(state == stateClass ? 'active':'')+'">'+base.node_states[stateClass].name+'</a></li>';
                    }

                    nodeItemHTML +=                     '</ul>'+
                                                '</div>';
                }else{
                    nodeItemHTML += '<button class="'+state+' btn state_btn btn-block btn-disabled" type="button"></span><span class="btn_text">'+stateName+'</span></button>';
                }
                nodeItemHTML +=                 '<div class="checkbox usageRightsField disabled">'+
                                                    '<label class="disabled">'+
                                                        '<input type="checkbox" val="1" disabled class="usageRights"'+(currentVersion.usageRights && currentVersion.usageRights === 1 ? ' checked':'')+'> Usage rights'+
                                                    '</label>'+
                                                '</div>'+
                                            '</div>'+
                                        '</div>';
                if(viewName!=='Basic'){
                    nodeItemHTML += '<div class="clearfix header_font viewWarning alert alert-warning text-center"><strong>Note:</strong> This page includes significant visual elements not shown here; <a href="'+node_url+'">View as reader</a> to see them.</div>';
                }
                nodeItemHTML +=      (hasContent?'<div id="node_'+node.slug.replace(/\//g, '_')+'_body" class="clearfix bodyContent body_font">'+node.current.content+'</div>':
                                                             '<div id="node_'+node.slug.replace(/\//g, '_')+'_body" class="clearfix bodyContent body_font noContent">(This page has no content.)</div>')+
                                        '</div>';

                if(typeof $replace !== 'undefined'){
                    var $node = $(nodeItemHTML).hide();
                    $replace.replaceWith($node);
                    $node.fadeIn();
                }else{
                    var $node = $(nodeItemHTML).appendTo(base.$nodeList).hide().fadeIn();
                }
                if(!waitingForReview){
                    $node.find('.with_queries_badge, .no_queries_badge').on('click', function(e){
                        if($(this).hasClass('disabled')){
                            return false;
                        }
                        if($('#editorialQueries').is(':visible') && $('#editorialQueries').data('$currentNode') == $node){
                            return true;
                        }
                        e.stopPropagation();
                        var offsetTop = $node.position().top;
                        $('#editorialQueries').css('top',offsetTop);
                        $('#editorialQueries').css('max-height',$node.innerHeight()-50);
                        base.populateQueries($node);
                    });
                }
                if(!!node.scalarTypes['media']){
                    $node.addClass('media').find('.bodyContent').html('').append('<div class="mediaView"><a data-size="native" data-align="center" class="inline" resource="'+node.slug+'" name="'+node.getDisplayTitle()+'" href="'+node.current.sourceFile+'" data-linkid="node_inline-media_body_1"></a>');
                }

                $node.data('node',node);

                var additionalMetadataFields = {};
                if ('undefined' != typeof(window['rdfFields']) && 'undefined' != typeof(window['namespaces'])) {
                    var isBuiltInField = function(pnode) {
                        for (var fieldname in window['rdfFields']) {
                        	if ('tklabels' == fieldname) return false;  // Special case for TK Labels which are held in the Resources table
                            if (window['rdfFields'][fieldname] == pnode) return true;
                        }
                        return false;
                    };
                    for (var uri in node.current.properties) {
                        for (var prefix in window['namespaces']) {
                            if (-1 != uri.indexOf(window['namespaces'][prefix])) {
                                pnode = uri.replace(window['namespaces'][prefix], prefix+':');
                                if (isBuiltInField(pnode)) continue;
                                for (var j = 0; j < node.current.properties[uri].length; j++) {
                                	if ('string'==typeof(node.current.properties[uri][j].value)) node.current.properties[uri][j].value = node.current.properties[uri][j].value.replace(window['namespaces']['tk'], 'tk:');  // TK Labels values are output as URIs by the RDF API but saved as pnodes to the Save API
                                };
                                additionalMetadataFields[pnode] = node.current.properties[uri];
                            }
                        }
                    };
                    if (!$.isEmptyObject(additionalMetadataFields)) {
                        var $additionalMetadata = $('<div class="clearfix additionalMetadata" style="padding-bottom:2rem;"><h3>Additional Metadata</h3></div>').appendTo($node);
                        for (var pnode in additionalMetadataFields) {
                        	for (var j = 0; j < additionalMetadataFields[pnode].length; j++) {
	                            var $row = $('<div class="row"><div class="col-xs-4 fieldName"></div><div class="col-xs-8 fieldVal"></div></div>').appendTo($additionalMetadata);
	                            $row.find('.fieldName').text(pnode);
	                            $row.find('.fieldVal').text(additionalMetadataFields[pnode][j].value);
                        	};
                        };
                    }
                };

                if($.isFunction(callback)){
                    $node.on('initialNodeLoad',callback);
                }

                if(typeof node.current.description === 'undefined' || node.current.description == null){
                    $node.find('.descriptionContent').text("(This item has no description.)").addClass('noDescription');
                }else{
                    $node.find('.descriptionContent').text(node.current.description);
                }

                $node.find('.state_dropdown li>a').each(function(){
                    $(this).on('click', function(e){
                        e.preventDefault();
                        //Present an alert if we haven't hidden alerts...
                        if(base.hasEditorialStateAlertCookie){
                            $(this).data('changeState')();
                        }else if(!$(this).hasClass('active')){
                            base.showStateChangeAlert($(this));
                        }
                    }).data('changeState',$.proxy(function(){
                        $(this).parents('ul').find('a.active').removeClass('active');
                        $(this).addClass('active');
                        $(this).parents('.state_dropdown').find('.state_btn').removeClass(base.node_state_string).addClass($(this).data('state')).find('.btn_text').text($(this).text());
                        base.saveNode($(this).parents('.editorial_node').data('state',$(this).data('state')),true);
                    },this));
                });

                var has_edition = false;
                if($('a.metadata[rel="scalar:hasEdition"]').length > 0){
                    var edition_timestamp = new Date($('span[resource="'+$('a.metadata[rel="scalar:hasEdition"]').attr('href')+'"] span[property="dcterms:created"]').text());
                    var version_timestamp = new Date(node.current.created);
                    if(version_timestamp <= edition_timestamp){
                        has_edition = true;
                        if(state == "published"){
                            $node.find('.dropdown-menu .ready').remove();
                            $node.find('.state_dropdown>button').addClass('btn-disabled').prop('disabled',true);
                        }
                    }
                    if(state == 'ready'){
                        $node.find('.dropdown-menu .published').remove();
                    }
                }

                $node.data({
                    title : currentVersion.title,
                    slug : node.slug,
                    state : state,
                    hasEdition : has_edition
                });

                if(waitingForReview){
                    $node.find('.bodyContent').html(diff.body);
                    $node.find('.state_btn').tooltip({
                        "title": 'All changes must be resolved before changing state. Click on the "Open in page editor" button to process changes.',
                        "trigger": "hover",
                        "template": '<div class="tooltip caption_font" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
                    });
                } else if(!!base.node_state_flow[state]){
                    $node.find('.usageRights').prop("disabled", false);
                    $node.find('.disabled').removeClass('disabled');
                    $node.find('.descriptionContent,.additionalMetadata .fieldVal')
                        .addClass('editable')
                        .prop('contenteditable',true)
                        .on('focus', function() {
                            if($(this).hasClass('noDescription')){
                                $(this).removeClass('noDescription').text('');
                            }
                            $(this).data('before', $(this).text());
                        })
                        .on('blur', function() {
                            if($(this).hasClass('descriptionContent') && $(this).text() == ''){
                                $(this).text("(This item has no description.)").addClass('noDescription');
                            }
                            if ($(this).data('before') !== $(this).text()) {
                                base.saveNode($node,false);
                            }
                        }).on('keydown', function(e) {
                          if (e.which == 13) {
                            $(this).trigger('blur');
                            return false;
                          }
                        });
                    if(!$node.hasClass('media')){
                        $node.find('.bodyContent').each(function(){
                            $node.data('editableFields',$node.data('editableFields')+1);
                            $(this).addClass('editable');
                            $(this).on('click',function(e){
                                if(!base.node_state_flow[$node.data('state')]){
                                    return false;
                                }

                                if($(this).hasClass('noContent')){
                                    $(this).removeClass('noContent').html('');
                                }

                                if($(this).data('editor')==null){
                                    if($(this).find('.placeholder.opened').length > 0){
                                        base.closePlaceholders($(this));
                                    }
                                    $(this).data('unloading',false);
                                    $(this).prop('contenteditable',true);
                                    e.preventDefault();
                                    //TODO: Remove scalarbeta and replace with scalar, once editor changes are released
                                    var editor = CKEDITOR.inline( $(this).attr('id'), {
                                        // Remove scalar plugin for description - also remove codeMirror, as it seems to have issues with inline editing
                                        removePlugins: 'scalar, codemirror, pastetext, pastefromword',
                                        extraPlugins: 'scalarbeta',
                                        startupFocus: true,
                                        allowedContent: true,
                                        extraAllowedContent : 'code pre a[*]',
                                        toolbar : 'ScalarInline',
                                        floatSpacePinnedOffsetY: 50
                                    } );

                                    base.currentEditNode = $(this).parents('.editorial_node');
                                    base.wasDirty = false;
                                    window.setTimeout(function(){
                                        editor.resetDirty();
                                        base.ckeditorWatcher = window.setInterval($.proxy(function(){
                                            if(editor.checkDirty()){
                                                base.wasDirty = true;
                                                editor.resetDirty();
                                                if(base.ckeditorSaveTimeout !== null){
                                                    window.clearTimeout(base.ckeditorSaveTimeout);
                                                }
                                                /*base.ckeditorSaveTimeout = window.setTimeout($.proxy(function(){
                                                    if(base.wasDirty){
                                                        base.wasDirty = false;
                                                        base.saveNode(base.currentEditNode);
                                                    }
                                                },this),1000);*/
                                            }
                                        },editor),500);
                                    },500);


                                    $(this).data('editor',editor);
                                    base.ckeditorLoader.appendTo($(this).addClass('ckeditorLoading')).show();

                                    editor.on('focus', $.proxy(function(editor,base,ev) {
                                            editor.plugins['scalarbeta'].init(editor);
                                    },this,editor,base));
                                    editor.on('blur',function(){
                                        return false;
                                    });
                                    $(window).off('hidden.bs.modal').on("hidden.bs.modal", function() {
                                        editor.trigger('focus');
                                    });
                                    $(this).on('blur', $.proxy(function($parent,base,ev) {
                                            if($('.cke_panel:visible').length > 0){ //We have a ckeditor panel currently open
                                                return false;
                                            }
                                            if($(ev.originalEvent.relatedTarget).hasClass('editLink') || $(ev.originalEvent.relatedTarget).hasClass('deleteLink')){
                                                return false;
                                            }
                                            if($(ev.originalEvent.relatedTarget).parents('.bootbox').length > 0){
                                                return false;
                                            }
                                            if($(ev.originalEvent.relatedTarget).hasClass('bootbox')){
                                                return false;
                                            }
                                            if($(this).data('unloading')){
                                                return false;
                                            }
                                            $(this).find('.placeholder').off('mouseenter').off('mouseleave');
                                            $(this).prop('contenteditable',false);
                                            base.updatePlaceholders($(this));
                                            //Save the current watcher then unload it.
                                            if(base.wasDirty){
                                                if($(this).html() == '' || $(this).html() == '<br>'){
                                                    $(this).addClass('noContent').html('(This page has no content.)');
                                                }

                                                base.saveNode(base.currentEditNode,false);
                                                base.wasDirty = false;
                                            }else{
                                                if($(this).html() == '' || $(this).html() == '<br>'){
                                                    $(this).addClass('noContent').html('(This page has no content.)');
                                                }
                                            }
                                            window.clearInterval(base.ckeditorWatcher);
                                            window.clearTimeout(base.ckeditorSaveTimeout);

                                            if($(this).data('editor')!=null){
                                                CKEDITOR.instances[$(this).data('editor').name].focusManager.blur(true);
                                                CKEDITOR.instances[$(this).data('editor').name].removeAllListeners();
                                                CKEDITOR.instances[$(this).data('editor').name].destroy(true);
                                                $('.cke_top,.cke_float').remove();
                                                $(this).data('editor',null);
                                            }
                                    },this,$node,base));

                                    editor.on('instanceReady', $.proxy(function(base,ev) {
                                        $(this).fadeTo(1000,100);
                                        base.$contentLoader.fadeOut('fast',function(){
                                            $(this).remove();
                                        });
                                    },$node,base));
                                }
                            });
                        });
                    }
                }

                $node.find('.usageRights').on('change', function(){
                    base.saveNode($node,false);
                });

                base.updateLinks($node);
            });

            for(var i in queries){
                var query = queries[i];
                if(!query.resolved){
                    queryCount++;
                }
            }
            var waitingForReview = false;
            var reviewVersions = [];
            if( (base.is_author && state === "editreview") ||
                (base.is_editor && (state === "clean" || state === "editreview")) ){
                waitingForReview = true;

                var previousState = ["edit","clean"];
                if(state == "clean"){
                    previousState = "editreview";
                }

                scalarapi.loadPage( node.slug, true, function(){
                    var versions = scalarapi.getNode(node.slug).versions;

                    versions.sort(function(a,b){
                        return b.number - a.number;
                    });

                    var old_version = null;
                    for(var v in versions){
                        if(previousState.indexOf(versions[v].editorialState) > -1){
                            old_version = versions[v];
                        }
                        if((v > 0 && versions[v].editorialState == state) || (old_version != null && previousState.indexOf(versions[v].editorialState) == -1)){
                            break;
                        }
                    }
                    console.log(old_version);
                    if(old_version != null){
                        reviewVersions = [versions[0],old_version];
                        diff = scalar_diff.diff(
                            {
                                'body' : reviewVersions[1].content || '',
                                'title' : reviewVersions[1].title || '',
                                'description' : reviewVersions[1].description || ''
                            },
                            {
                                'body' : reviewVersions[0].content || '',
                                'title' : reviewVersions[0].title || '',
                                'description' : reviewVersions[0].description || ''
                            },
                            true,
                            true
                        );

                        if(diff.chunkCount == 0){
                            waitingForReview = false;
                        }
                    }else{
                        waitingForReview = false;
                    }
                    deferred.resolve();
                }, null, 1, false, null, 0, 0, null, true);
            }else{
                deferred.resolve();
            }
        };

        base.saveNode = function($node, onlyUpdateState){
            var node = $node.data('node');
            var notice = $('<div class="alert" role="alert">Saving...</div>').hide().appendTo($node.find('.notice').html('')).fadeIn('fast');
            var title = $node.find('.title').text();
            var $description = $node.find('.descriptionContent');
            var description = $description.hasClass('noDescription')?'':$description.text();
            var editorialState = $node.data('state');
            var replace_node = false;
            var slug = node.slug;

            var pageSaved = function(){
                var reload_node = function(){
                    var node = scalarapi.getNode(slug);
                    for(var n in base.nodeList.unsorted){
                        if(base.nodeList.unsorted[n].slug == slug){
                            base.nodeList.unsorted[n] = node;
                        }
                    }
                    if(replace_node){
                        base.addNode(node,base.updateLists,$node);
                    }else{
                        base.updateLists();
                    }
                }

                if(scalarapi.loadPage( slug, true, reload_node, null, 1, false, null, 0, 20) == "loaded") reload_node();

                base.$saveNotice.text('"'+title+'" updated').fadeIn('fast',function(){
                    window.setTimeout($.proxy(function(){$(this).fadeOut('fast');},this),2000);
                });
            };

            if(!!onlyUpdateState){
                var data = {version_id:[node.current.urn.substr(node.current.urn.lastIndexOf(':')+1)],state:editorialState};
                if (base.user_data != null) {
                    data.user_id = base.user_data.user_id;
                }
                $.ajax({
                    url: $('link#approot').attr('href').replace('application/','main/api/save_editorial_state'),
                    data: data,
                    success: function(data) {
                      pageSaved();
                    },
                    error: function(e) {
                        base.$warningNotice.text('Error saving "'+title+'": '+e+'</div>').fadeIn('fast',function(){
                           window.setTimeout($.proxy(function(){$(this).fadeOut('fast');},this),2000);
                        });
                    }
                });
            }else{
                if($node.data('hasEdition') && editorialState == 'published'){
                    editorialState = 'draft';
                    replace_node = true;
                }

                if(!!base.node_state_flow[editorialState]){
                    $node.find('.descriptionContent,.additionalMetadata .fieldVal')
                            .addClass('editable')
                            .prop('contenteditable',true);
                }else{
                    $node.find('.descriptionContent,.additionalMetadata .fieldVal')
                            .removeClass('editable')
                            .prop('contenteditable',false);
                }


                $('#editorialOutline a[data-node="'+node.slug+'"]').parent('li').removeClass().addClass(editorialState+' active');

                var $body = $node.find('.bodyContent');

                if($body.hasClass('noContent') || $body.hasClass('media')){
                    var body = null;
                }else{
                    var $body_copy = $body.clone();
                    $body_copy.find('.placeholder').remove();

                    $body_copy.find('.tempWrapper').each(function(){
                        $(this).before($(this).html()).remove();
                    });

                    $body_copy.find('a[data-linkid]').removeAttr('data-linkid');
                    $body_copy.find('a[data-cke-saved-href]').removeAttr('data-cke-saved-href');
                    var body = $body_copy.html();
                }

                var baseProperties =  {
                    'native': 1,
                    'id': userId,
                    'api_key':''
                };

                var pageData = {
                    'action': 'UPDATE',
                    'uriSegment': scalarapi.basepath(node.url),
                    'dcterms:title': title,
                    'dcterms:description': description,
                    'sioc:content': body,
                    'scalar:editorial_state': editorialState
                };

                //Go through and add metadata to page data now:
                $node.find('.additionalMetadata .row').each(function(){
                    if ('undefined' == typeof(pageData[$(this).find('.fieldName').text()])) pageData[$(this).find('.fieldName').text()] = [];
                    pageData[$(this).find('.fieldName').text()].push($(this).find('.fieldVal').text());
                });

                //Add the editorial queries in:
                if(node.current.editorialQueries){
                    pageData["scalar:editorial_queries"] = node.current.editorialQueries;
                }

                //Add usage rights:
                pageData["scalar:usage_rights"] = $node.find('.usageRights').prop('checked')?1:0;
                scalarapi.modifyPageAndRelations(baseProperties,pageData,undefined,function(e){
                    pageSaved();
                },function(e){
                    base.$warningNotice.text('Error saving "'+title+'": '+e+'</div>').fadeIn('fast',function(){
                       window.setTimeout($.proxy(function(){$(this).fadeOut('fast');},this),2000);
                    });
                });
            }
        };

        base.resize = function(){
            $('#editorialSidePanel>div,#editorialSidePanel>.scrollUp').width($('#editorialSidePanel').width());
            $('#editorialSidePanel>div .collapse').css('max-height',$(window).height()-100);
        };

        base.closePlaceholders = function($node){
            $node.find('.placeholder.opened').each(function(){
                $(this).find('.body').remove();
                $(this).find('.oldBody').removeClass('oldBody').addClass('body').show();
                $(this).removeClass('opened');
            });
        };

        base.updatePlaceholders = function($node){

            var renderPlaceholderContent = function($placeholder){
              console.log('render placeholder content');
                if($placeholder.hasClass('opened')){
                    return false;
                }
                $placeholder.addClass('opened');
                //Load the media or widget!
                $placeholder.find('.content').append($placeholder.find('.body').clone().hide().addClass('oldBody').removeClass('body'));
                $tempLink = $('a[data-linkid='+$placeholder.data('linkid')+']').clone().appendTo($placeholder.find('.body').html('')).hide();
                $tempLink.data('fitToContainer',true);
                if($placeholder.data('widget')){
                    //Widget!
                    widgets.handleWidget($tempLink);
                }else{
                    //Media!
                    var options = {
                        url_attributes: ['href', 'src'],
                        autoplay: false,
                        solo: $tempLink.attr('data-caption') == 'none',
                        getRelated: false
                    };

                    $tempLink.slotmanager_create_slot($placeholder.width(), null, options);
                    $placeholder.find('.body').append($tempLink.data('slot'));
                }
            }

            $node.find('.placeholder').off('click').on('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                renderPlaceholderContent($(this));
                return false;
            });
        }
        base.updateLinks = function($node){
            base.stripPlaceholders($node.find('.bodyContent'));
            var linkCount = 0; //$node.find('.bodyContent a[resource]').length + $node.find('.bodyContent a[data-widget]').length;
            $node.data('linkCount',linkCount);
            $node.find('a[resource], a[data-widget]').each(function(){
                if($(this).hasClass('hiddenVisual')) return;
                var $placeholder = $('<div class="placeholder caption_font clearfix" contenteditable="false"><div class="content"><div class="body"></div></div></div>');
                if($(this).hasClass('wrap')){
                    $placeholder.addClass('wrap');
                }
                if($(this).is('[resource]')){
                    $placeholder.attr('resource',$(this).attr('resource'));
                }
                if($(this).is('[data-widget]')){
                    $placeholder.attr('data-widget',$(this).attr('data-widget'));
                }
                if($(this).is('[data-align]')){
                    $placeholder.attr('data-align',$(this).attr('data-align'));
                }
                if($(this).is('[data-size]')){
                    $placeholder.attr('data-size',$(this).attr('data-size'));
                }
                if($(this).hasClass('inline')){
                    $(this).after($placeholder.addClass('inline'));
                }else{
                    if($(this).parents('.bodyContent').find('.tempWrapper').length == 0){
                        $(this).parents('.bodyContent').wrapInner('<p class="tempWrapper">');
                    }
                    $(this).parents('.bodyContent').find('.tempWrapper').before($placeholder);
                }

                $(this).attr('data-linkid',$(this).parents('.bodyContent').attr('id')+'_'+linkCount);
                if(!$(this).text() || $(this).text() == ''){
                    $(this).text('&nbsp;')
                }
                $placeholder.attr('data-linkid',$(this).parents('.bodyContent').attr('id')+'_'+linkCount);

                if($(this).is('[resource]')){
                    (function($placeholder,resource,$node){
                        var handleMedia = function(){
                            var media = scalarapi.getNode(resource);
                            if(!!media.current && !!media.current.description){
                                $placeholder.find('content').append('<div class="description">'+media.current.description+'</div>');
                            }
                            if(!!media && !!media.current){
                                var thumbnail_url = media.getAbsoluteThumbnailURL();
                                if(!thumbnail_url){
                                    if(media.current.mediaSource.contentType == "image" && !media.current.mediaSource.isProprietary){
                                        thumbnail_url = media.current.sourceFile;
                                    }else{
                                        thumbnail_url = $('link#approot').attr('href')+'views/melons/cantaloupe/images/media_icon_chip.png';
                                    }
                                }

                                $placeholder.find('.body').html('<img class="placeholder_thumbnail" src="'+thumbnail_url+'"><br />'+media.getDisplayTitle()+'<span class="clickToLoadNotice"><br />(Click to load '+(media.current.mediaSource.contentType=='image'?'full image':media.current.mediaSource.contentType)+')</span>');
                            }else{
                                $placeholder.find('.body').html('Missing Media! ('+resource+')');
                            }
                        };
                        if(scalarapi.loadPage( resource, false, handleMedia, null, 1, false, null, 0, 0) == "loaded"){
                            handleMedia();
                        }
                    })($placeholder,$(this).attr('resource'),$node);
                }else{
                    $placeholder.find('.body').html('<img class="placeholder_thumbnail" src="'+$('link#approot').attr('href')+'views/melons/cantaloupe/images/widget_image_'+$(this).data('widget')+'.png"><br />'+base.ucwords($(this).data('widget'))+' Widget<span class="clickToLoadNotice"><br />(Click to load widget)</span>');
                    var slug = undefined;
                    if($(this).data('nodes') != undefined){
                      slug = $(this).data('nodes').replace(/\*/g, '');
                    }else if($(this).attr('resource') != undefined){
                      slug = $(this).attr('resource').replace(/\*/g, '');
                    }
                    if($(this).data('caption')!=undefined && $(this).data('caption')!='none' && ($(this).data('caption')=='custom_text' || (slug!=undefined && slug.indexOf(',')==-1))){
                        var $description = $('<div class="description">').appendTo($placeholder.find('content'));
                        var caption_type = $(this).data('caption');
                        if(caption_type=='custom_text'){
                            $description.html('<p>'+$(this).data('custom_caption')+'</p>').css('display','block');
                        }else {
                            (function($description,caption_type,slug){
                              var load_caption = function(node){
                                switch ( caption_type ) {

                                    case 'title':
                                    description = node.getDisplayTitle();
                                    break;

                                    case 'title_and_description':
                                    if ( node.current.description != null ) {
                                        description = '<strong>' + node.getDisplayTitle() + '</strong><br>' + node.current.description;
                                    } else {
                                        description = node.getDisplayTitle();
                                    }
                                    break;

                                    default:
                                        if(!!node && !!node.current && node.current.description){
                                            description = node.current.description;
                                        }else{
                                            description = '<p><i>No description available.</i></p>';
                                        }
                                        break;

                                }
                                $description.html(description).css('display','block');
                              };
                              if(scalarapi.loadPage( slug, true, function(){
                                load_caption(scalarapi.getNode(slug));
                              }, null, 1, false, null, 0, 20) == "loaded"){
                                load_caption(scalarapi.getNode(slug));
                              }
                            })($description,caption_type,slug);
                        }
                    }
                }
                linkCount++;
            });

            if($node.find('.bodyContent a[resource][data-align="right"]:not(.inline),.bodyContent a[data-widget][data-align="right"]:not(.inline),.bodyContent a[data-size="full"]').length > 0){
                //Don't add a gutter any more, because it makes for some weird visual artifacts
                //$node.addClass('gutter');
            }

            base.updatePlaceholders($node);
            $node.trigger('initialNodeLoad').off('initialNodeLoad');
        };

        base.stripPlaceholders = function($el){
            $el.find('a.inline').each(function(){
                if($(this).html() == '&nbsp;'){
                    $(this).html('');
                }
            });
            $el.find('.placeholder').remove();
        }

        // Run initializer
        base.$el.data('editorialPath',base);
        base.init();
    };

    $.scalarEditorialPath.defaultOptions = {
        contents : null,
        outline : null,
        pagesPerChunk : 100
    };

    $.fn.scalarEditorialPath = function(options){
        return this.each(function(){
            (new $.scalarEditorialPath(this, options));
        });
    };

})(jQuery);

$(function(){
    editorialPath = $('#editorialPath').scalarEditorialPath({
        contents : $('#editorialPathContents'),
        outline : $('#editorialOutline')
    });
});

CKEDITOR.disableAutoInline = true;
