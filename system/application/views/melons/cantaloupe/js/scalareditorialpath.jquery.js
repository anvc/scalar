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

        base.nodeList = {};

        base.nodeTypes = ['page', 'media'];

        base.$nodeList = $('<div>');

        base.numPages = {};

        base.loadedPages = {};
        
        base.currentLoadType = 0;

        base.is_author = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Author';
        base.is_commentator = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Commentator';
        base.is_reviewer = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Reviewer';
        base.is_editor = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Editor';

        base.node_states = { 
        						'draft' : 'Draft',
	        					'edit'  : 'Edit',
	        					'editreview' : 'Edit Review',
	        					'clean' : 'Clean',
	        					'ready' : 'Ready',
	        					'published' : 'Published'
        				   };
        base.node_state_flow = {
            'author' : {
                'draft' : [
                    'draft',
                    'edit'
                ],
                'editreview' : [
                    'editreview',
                    'clean'
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
                    'editreview',
                    'clean',
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

        base.setup = function(data){
        	switch(base.stage){
        		case 0:
        			//Do a little bit of preliminary setup...
                    base.highestID = -1;
                    $(window).click(function(){
                        $('#editorialQueries').hide();
                    });
                    $('#editorialQueries').click(function(e){
                        e.stopPropagation();
                    });
                     $('#editorialQueries').find('.queryDropdownToggle').click(function(e){
                        $(this).parents('.resolvedQueries').find('.collapse').collapse('toggle');
                        e.stopPropagation();
                        return false;
                    });
                    $('#editorialQueries').find('.collapse').collapse({toggle:false}).on('show.bs.collapse',function(){
                        $(this).parents('.resolvedQueries').find('.queryDropdownToggle small').removeClass('glyphicon-triangle-right').addClass('glyphicon-triangle-bottom');
                    }).on('hide.bs.collapse',function(){
                        $(this).parents('.resolvedQueries').find('.queryDropdownToggle small').removeClass('glyphicon-triangle-bottom').addClass('glyphicon-triangle-right');
                    });
                    $('#addNewQuery').click(function(){
                        $('#addNewQueryForm').show();
                        $('#editorialQueries').animate({
                            scrollTop: 0
                        }, 200);
                    });
                    $('#addNewQueryForm').find('button').click(function(e){
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

                    base.$saveNotice = $('<div class="alert alert-success" role="alert" id="saveNotice">Page updated</div>').appendTo('body');
                    base.$warningNotice = $('<div class="alert alert alert-danger" role="alert" id="saveErrorNotice">Error saving page</div>').appendTo('body');

                    $('#editorialSidePanel .dropdown .dropdown-menu a').click(function(e){
                        e.preventDefault();
                        $('#editorialSidePanel .dropdown #panelDropdownText').text($(this).text());
                        $($(this).attr('href')).addClass('in').siblings('.collapse').removeClass('in');
                        $('.bookname').text($('meta[property="og:site_name"]').attr('content'));
                        base.resize();
                    });

                    $('body').on('headerSizeChanged',function(){
                        var offset = $(this).hasClass('shortHeader')?32:69;
                        if(typeof $('body').data('bs.scrollspy') != 'undefined'){
                                $('body').data('bs.scrollspy').options.offset = offset;
                        }
                        $('body').scrollspy('refresh');
                    });

                    $(window).scroll(function(e) {
                       if($(window).scrollTop() + $(window).height() >= ($(document).height()-50)) {
                           if(base.$nodeList.find('.loader').length == 0 && typeof base.nextNodeIndexToLoad !== 'undefined' && typeof base.currentNodeList !== 'undefined' && base.nextNodeIndexToLoad < base.currentNodeList.length){
                              $('body').css('overflow-y','hidden');
                              base.$nodeList.append('<div class="loader">Loading...</div>');
                              base.addNode(base.currentNodeList[base.nextNodeIndexToLoad++],$.proxy(function(){$(this).remove();$('body').css('overflow-y','auto').scrollspy('refresh');},base.$nodeList.find('.loader')));
                           }
                       }
                    });

                    $('#contentOrderDropdown a').click(function(e){
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
                      top: 'auto', // Top position relative to parent in px
                      right: 'auto' // Left position relative to parent in px
                    };
                    var spinner = new Spinner(spinner_options).spin();
                    $('#editorialSidePanel .editorialSidePanelLoaderIndicator').find('.spinner_container').each(function(){
                        $(this).append(spinner.el);
                    });

        			base.node_state_classes = [];
        			for(var stateClass in base.node_states){
        				base.node_state_classes.push(stateClass);
        			}
					base.node_state_string = base.node_state_classes.join(' ');
					$(window).on('resize',base.resize);

                    $('#contentFinder').submit(function(e){
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
                                    var features = node.getRelatedNodes('referee', 'outgoing');
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
                                            nodeItem.find('a').click($.proxy(function(slug, e){
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
                                            nodeItem.find('a').click($.proxy(function(slug, e){
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
                                            nodeItem.find('a').click($.proxy(function(slug, e){
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
                                            nodeItem.find('a').click($.proxy(function(slug, e){
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
                                            nodeItem.find('a').click($.proxy(function(slug, e){
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
                                    
                                    $nodeMatchItem.find('.resultTitle').click(function(e){
                                        e.preventDefault();
                                        $('#editorialSidePanel').addClass('loading_nodes');
                                        var slug = $(this).parents('li').data('slug');
                                        window.setTimeout(function(){base.scrollToNode(slug,false);},1);
                                        return false;
                                    });
                                    

                                    $nodeMatchItem.find('.dropdownCaret').click(function(e){
                                        $(this).parents('li').find('.collapse').collapse('toggle');
                                        e.stopPropagation();
                                        return false;
                                    });
                                    
                                    $nodeMatchItem.find('.collapse').collapse({toggle:false}).on('show.bs.collapse',function(){
                                        $(this).parents('li').find('.resultTitle small').removeClass('glyphicon-triangle-right').addClass('glyphicon-triangle-bottom');
                                    }).on('hide.bs.collapse',function(){
                                        $(this).parents('li').find('.resultTitle small').removeClass('glyphicon-triangle-bottom').addClass('glyphicon-triangle-right');
                                    });
                                    /*$nodeMatchItem.data('slug',node.slug).find('a').click($.proxy(function(slug, e){
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
	        		base.$contentLoaderInfo.fadeOut('fast',function(){$(this).text('Loading '+base.nodeTypes[base.currentLoadType]+' nodes - 0%').fadeIn('fast')});

                    scalarapi.loadNodesByType(
                        base.nodeTypes[base.currentLoadType], true, base.setup,
                        null, 1, false, null, (base.currentChunk++)*base.options.pagesPerChunk, base.options.pagesPerChunk
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
                            base.$contentLoaderInfo.text('Loading '+base.nodeTypes[base.currentLoadType-1]+' nodes - 100%');
                            base.stage = 3;
                            base.setup();
                            return;
                        }else{
                            base.currentChunk = 0;
                            base.$contentLoaderInfo.text('Loading '+base.nodeTypes[base.currentLoadType]+' nodes - 0%');
                        }
                    }else{
                        base.$contentLoaderInfo.text('Loading '+base.nodeTypes[base.currentLoadType]+' nodes - '+Math.round((base.currentChunk*base.options.pagesPerChunk)/base.numPages[base.nodeTypes[base.currentLoadType]])*100+'%');
                        base.currentChunk++;
                    }
                    scalarapi.loadNodesByType(
                        base.nodeTypes[base.currentLoadType], true, base.setup,
                        null, 1, false, null, base.currentChunk*base.options.pagesPerChunk, base.options.pagesPerChunk
                    );

        			break;
                case 3:
                    //remove any duplicate nodes - since we are grabbing relationships, we will likely have some.
                    var uniqueNodes = [];
                    $.each(base.nodeList.unsorted, function(i, el){
                        if($.inArray(el, uniqueNodes) === -1) uniqueNodes.push(el);
                    });
                    base.nodeList.unsorted = uniqueNodes;


                    //Name
                    base.nodeList.sortedByName = base.nodeList.unsorted.slice();
                    base.nodeList.sortedByName.sort(function(a, b) {
                      a = a.current.title.toLowerCase(), b = b.current.title.toLowerCase();
                      return a>b?1:(a<b?-1:0);
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
                        $('<li><a role="button" data-type="'+filterTypes[t]+'" href="#">'+base.ucwords(filterTypes[t])+'</a></li>').appendTo('#editorialContentFinder .dropdown-menu').find('a').click(function(e){
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
                        namea = a.current.title.toLowerCase(), nameb = b.current.title.toLowerCase();
                      a = new Date(a.current.created), b = new Date(b.current.created);
                        return a>b?1:(a<b?-1:(namea>nameb?1:(namea<nameb?-1:0)));
                    });

                    //Date Desc
                    base.nodeList.sortedByLastModifiedDateDesc = base.nodeList.sortedByName.slice();
                    base.nodeList.sortedByLastModifiedDateDesc.sort(function(a, b) {
                      namea = a.current.title.toLowerCase(), nameb = b.current.title.toLowerCase();
                      a = new Date(a.current.created), b = new Date(b.current.created);
                        return a>b?-1:(a<b?1:(namea>nameb?1:(namea<nameb?-1:0)));
                    });
                    base.propogateInitialPage();
        		case 4:

                    $('#editorialSidePanel>div').affix({
                      offset: {
                        top: 50
                      }
                    });
                    window.setTimeout(base.resize,400);

        			base.$nodeList.appendTo(base.options.contents);
                    
                    $('body').scrollspy({ target: '#editorialOutline', offset: 69 });
                    base.$contentLoader.fadeOut('fast');
        	}
        };

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

            var activeSlug = undefined;


            if(base.$nodeList.find('.editorial_node').length > 0){
                activeSlug = $('#editorialOutline>ul>li.active').data('slug');
            }

            $('#editorialOutline>ul').add(base.$nodeList).html('');

            var callback = function(){
                var nodeListBottom = base.$nodeList.height() + base.$nodeList.offset().top;
                if(base.nextNodeIndexToLoad < base.currentNodeList.length && nodeListBottom < $(window).height()){
                    base.addNode(base.currentNodeList[base.nextNodeIndexToLoad++],callback);
                }else{
                    base.stage = 4;
                    base.loadOutline();
                    $('body').scrollspy('refresh');
                    base.setup();
                }
            }
            base.addNode(base.currentNodeList[base.nextNodeIndexToLoad++],callback);
        };

        base.loadOutline = function(){
            for(var node in base.currentNodeList){
                node = base.currentNodeList[node];
                var nodeOutlineItemHTML = '<li class="'+node.editorialState+'"><a data-node="'+node.slug+'" href="#node_'+node.slug.replace(/\//g, '_')+'">'+node.getDisplayTitle()+'</a></li>';
                var $nodeOutlineItem = $(nodeOutlineItemHTML).appendTo('#editorialOutline>ul');

                $nodeOutlineItem.data('slug',node.slug).find('a').click($.proxy(function(slug, e){
                    e.preventDefault();
                    $('#editorialSidePanel').addClass('loading_nodes');

                    window.setTimeout($.proxy(function(slug){ this.scrollToNode(slug,false); },base,slug),1);
                },base, node.slug));
            }
        };

        base.scrollToNode = function(nodeSlug,reloadOutline){
            var $node = $('#node_'+nodeSlug.replace(/\//g, '_'));
            if($node.length > 0){
                $('html, body').animate({
                        scrollTop: $node.offset().top - ($node.offset().top > $('body').scrollTop() ? 0 : 30)
                }, 1000);
                window.setTimeout(function(){$('#editorialSidePanel').removeClass('loading_nodes');},1000);
            }else{
                var callback = function(){
                    if(base.nextNodeIndexToLoad >= base.currentNodeList.length || base.currentNodeList[base.nextNodeIndexToLoad-1].slug == nodeSlug){
                        $node = $('#node_'+nodeSlug.replace(/\//g, '_'));

                        window.setTimeout($.proxy(function(){
                            $('html, body').animate({
                                    scrollTop: this.offset().top - (this.offset().top > $('body').scrollTop() ? 0 : 30)
                            }, 1000);
                            if(reloadOutline){
                                base.loadOutline();
                            }
                            window.setTimeout(function(){$('body').scrollspy('refresh'); $('#editorialSidePanel').removeClass('loading_nodes');},1000);
                        },$node,base,reloadOutline),1000);
                    }else{
                        base.addNode(base.currentNodeList[base.nextNodeIndexToLoad++],callback);
                    }
                }
                base.addNode(base.currentNodeList[base.nextNodeIndexToLoad++],callback);
            }
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
            base.saveNode($node);
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
            var dateString = hour+':'+date.getMinutes()+' '+suffix+' '+base.monthNames[date.getMonth()]+' '+date.getDate();
            var $query = $('<div class="query" id="query_'+query.id+'">'+
                                (!query.resolved?'<button class="btn btn-sm pull-right resolve">Resolve</button>':'')+
                                '<strong class="user">'+query.user+'</strong>'+
                                '<small class="date">'+dateString+'</small>'+
                                '<div class="body">'+query.body+'</div>'+
                           '</div>');
            $query.data('query',query);
            $query.find('.resolve').click(function(){
                $('#editorialQueries .resolvedQueries').show();
                var $query = $(this).parents('.query');
                $query.appendTo('#editorialQueries .resolvedQueries .queries');
                $(this).remove();
                $query.find('.newReply').remove();
                var query = $query.data('query');
                query.resolved = true;
                $query.data('query',query);
                $('#editorialQueries .resolvedQueries .queryCount').text(parseInt($('#editorialQueries .resolvedQueries .queryCount').text())+1);
                $('#editorialQueries .resolvedQueries').find('.collapse').collapse('show');
                base.serializeQueries();
            });
            var $replies = $('<div class="replies"></div>').appendTo($query);
            if(!query.resolved){
                var $newReply = $('<div class="newReply">'+
                                        '<form class="form-inline">'+
                                            '<div class="form-group">'+
                                                '<label class="sr-only" for="reply_'+query.id+'">New reply</label>'+
                                                '<input type="text" class="form-control input-sm" id="reply_'+query.id+'" placeholder="New reply">'+
                                                '<button type="submit" class="btn btn-default btn-sm pull-right">Submit</button>'+
                                            '</div>'+
                                        '</form>'+
                                  '</div>').appendTo($query);
                $newReply.find('button').click(function(e){
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
                    dateString = hour+':'+date.getMinutes()+' '+suffix+' '+base.monthNames[date.getMonth()]+' '+date.getDate();
                    var $reply = $('<div class="query">'+
                                        '<strong class="user">'+newReply.user+'</strong>'+
                                        '<small class="date">'+dateString+'</small>'+
                                        '<div class="body">'+newReply.body+'</div>'+
                                   '</div>').appendTo($replies);
                    $reply.data('query',newReply);

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
                dateString = hour+':'+date.getMinutes()+' '+suffix+' '+base.monthNames[date.getMonth()]+' '+date.getDate();
                var $reply = $('<div class="query" id="query_'+reply.id+'">'+
                                    '<strong class="user">'+reply.user+'</strong>'+
                                    '<small class="date">'+dateString+'</small>'+
                                    '<div class="body">'+reply.body+'</div>'+
                               '</div>').appendTo($replies);
                $reply.data('query',reply);
            }
            if(query.resolved){
                $query.appendTo($('#editorialQueries .resolvedQueries .queries'));
                $('#editorialQueries .resolvedQueries').show();
                $('#editorialQueries .resolvedQueries .queryCount').text(parseInt($('#editorialQueries .resolvedQueries .queryCount').text())+1);
                if(scrollToQuery && scrollToQuery === true){
                    $('#editorialQueries').animate({
                        scrollTop: $query.offset().top-$('#editorialQueries').offset().top
                    }, 200);
                }
            }else{
                $query.appendTo($('#editorialQueries>.queries'));
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
        base.populateQueries = function(queries,$parentNodeElement){
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
            
            if(base.highestID == -1){
                $('<div id="noQueries" class="text-muted text-center">There are no queries yet.</div>').appendTo($('#editorialQueries>.queries'));
            }

            $('#editorialQueries').show();
        };
        base.addNode = function(node,callback){
        	var currentVersion = node.current;
            var queries = currentVersion.editorialQueries?JSON.parse(currentVersion.editorialQueries).queries:[];
        	var state = node.editorialState;
        	var stateName = base.node_states[state];
            var node_url = scalarapi.model.urlPrefix+node.slug;
        	var nodeView = (typeof node.current.defaultView !== 'undefined' && node.current.defaultView != null) ? node.current.defaultView : 'plain';
            var queryCount = 0;
            for(var i in queries){
                var query = queries[i];
                if(!query.resolved){
                    queryCount++;
                }
            }
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
        									'<div class="header_font badges">'+
                                                '<span class="header_font badge view_badge">'+viewName+'</span>'+
                                                '<span class="header_font badge '+(queryCount>0?'with_queries_badge':'no_queries_badge')+'">'+(queryCount>0?queryCount:'No')+' Quer'+(queryCount!=1?'ies':'y')+'</span>'+
                                                '<span class="header_font badge type_badge">'+base.ucwords(node.domType.singular)+'</span>'+
                                                '<a href="'+node_url+'.edit" class="edit_btn btn btn-sm btn-default">Open in page editor</a>'+
                                            '</div>'+
        								'</div>'+
        								'<div class="col-xs-12 col-sm-4 col-md-3">';
        									
        	if(base.node_state_flow[state]){
                nodeItemHTML += '<div class="dropdown state_dropdown">'+
                                                '<button class="'+state+' btn state_btn btn-block dropdown-toggle" type="button" id="stateSelectorDropdown_'+node.slug.replace(/\//g, '_')+'" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="caret pull-right"></span><span class="btn_text">'+stateName+'</span></button>'+
                    								'<ul class="dropdown-menu" aria-labelledby="stateSelectorDropdown_'+node.slug.replace(/\//g, '_')+'">';
            	for(var stateClassIndex in base.node_state_flow[state]){
                    var stateClass = base.node_state_flow[state][stateClassIndex];
            		nodeItemHTML += 					'<li class="'+stateClass+'"><a href="#" data-state="'+stateClass+'" class="'+(state == stateClass ? 'active':'')+'">'+base.node_states[stateClass]+'</a></li>';
            	}

        	    nodeItemHTML +=                     '</ul>'+
                                            '</div>';
            }else{
                nodeItemHTML += '<button disabled class="'+state+' btn state_btn btn-block" type="button"></span><span class="btn_text">'+stateName+'</span></button>';
            }
			nodeItemHTML += 				'<div class="checkbox usageRightsField disabled">'+
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
                                                     '<div id="node_'+node.slug.replace(/\//g, '_')+'_body" class="clearfix bodyContent body_font noContent">[No Content]</div>')+
        						'</div>';     

        	var $node = $(nodeItemHTML).appendTo(base.$nodeList).hide().fadeIn();
            $node.find('.with_queries_badge').click(function(e){
                if($('#editorialQueries').is(':visible') && $('#editorialQueries').data('$currentNode') == $node){
                    return true;
                }
                e.stopPropagation();
                var offsetTop = $node.position().top;
                $('#editorialQueries').css('top',offsetTop);
                $('#editorialQueries').css('max-height',$node.innerHeight()-50);
                base.populateQueries(queries,$node);
            });
            if(node.domType.singular == "media"){
                $node.find('.bodyContent').addClass('media').html('').append('<div class="mediaView"><a data-size="native" data-align="center" class="inline" resource="'+node.slug+'" name="'+node.getDisplayTitle()+'" href="'+node.current.sourceFile+'" data-linkid="node_inline-media_body_1"></a>');
            }
            $node.data('node',node);
            
            // Added by Craig
            var additionalMetadataFields = {};
            if ('undefined' != typeof(window['rdfFields']) && 'undefined' != typeof(window['namespaces'])) {
                var isBuiltInField = function(pnode) {
                    for (var fieldname in window['rdfFields']) {
                        if (window['rdfFields'][fieldname] == pnode) return true;
                    }
                    return false;
                };
                for (var uri in node.current.properties) {
                    for (var prefix in window['namespaces']) {
                        if (-1 != uri.indexOf(window['namespaces'][prefix])) {
                            pnode = uri.replace(window['namespaces'][prefix], prefix+':');
                            if (isBuiltInField(pnode)) continue;
                            additionalMetadataFields[pnode] = node.current.properties[uri];
                        }
                    }
                };
                if (!$.isEmptyObject(additionalMetadataFields)) {
                	var $additionalMetadata = $('<div class="clearfix additionalMetadata" style="padding-bottom:2rem;"><h3>Additional Metadata</h3></div>').appendTo($node);
                	for (var pnode in additionalMetadataFields) {
            			var $row = $('<div class="row"><div class="col-xs-4 fieldName"></div><div class="col-xs-8 fieldVal"></div></div>').appendTo($additionalMetadata);
            			$row.find('.fieldName').text(pnode);
            			$row.find('.fieldVal').text(additionalMetadataFields[pnode][0].value);
            		};
            	}
            };                   

            if($.isFunction(callback)){
                $node.on('initialNodeLoad',callback);
            }

            if(typeof node.current.description === 'undefined' || node.current.description == null){
                $node.find('.descriptionContent').text("(This page does not have a description.)").addClass('noDescription');
            }else{
                $node.find('.descriptionContent').text(node.current.description);
            }
        	
        	$node.find('.state_dropdown li>a').click(function(e){
        		e.preventDefault();
        		$(this).parents('ul').find('a.active').removeClass('active');
        		$(this).addClass('active');
        		$(this).parents('.state_dropdown').find('.state_btn').removeClass(base.node_state_string).addClass($(this).data('state')).find('.btn_text').text($(this).text());
                base.saveNode($(this).parents('.editorial_node').data('state',$(this).data('state')));
        	});

        	$node.data({
        		title : currentVersion.title,
        		slug : node.slug,
                state : state
        	});
            if(base.node_state_flow[state]){
                $node.find('.usageRights').removeAttr("disabled");
                $node.find('.disabled').removeClass('disabled');
                $node.find('.descriptionContent,.additionalMetadata .fieldVal')
                    .addClass('editable')
                    .prop('contenteditable',true)
                    .on('focus', function() {
                        $(this).data('before', $(this).text());
                    })
                    .on('blur', function() {
                        if ($(this).data('before') !== $(this).text()) {
                            base.saveNode($node);
                        }
                    }).on('keydown', function(e) {
                      if (e.which == 13) {
                        $(this).blur();
                        return false;
                      }
                    });
                $node.find('.bodyContent:not(.media)').each(function(){
                    $node.data('editableFields',$node.data('editableFields')+1);
                    $(this).addClass('editable');
                    $(this).on('click',function(e){
                        if(!base.node_state_flow[$node.data('state')]){
                            return false;
                        }
                        if($(this).hasClass('noDescription')){
                            $(this).removeClass('noDescription').text('');
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
                                removePlugins: 'scalar, codemirror, removeformat',
                                extraPlugins: 'scalarbeta',
                                startupFocus: true,
                                allowedContent: true,
                                extraAllowedContent : 'code pre a[*]',
                                toolbar : 'ScalarInline'
                            } );

                            if(typeof base.ckeditorWatcher != 'undefined' && base.ckeditorWatcher !== null){
                                if(base.wasDirty){
                                    base.wasDirty = false;
                                    base.saveCurrentEditor(base.currentEditNode);
                                }
                                window.clearInterval(base.ckeditorWatcher);
                                window.clearTimeout(base.ckeditorSaveTimeout); 
                            }

                            base.currentEditNode = $(this).parents('.editorial_node');
                            base.wasDirty = false;

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


                            $(this).data('editor',editor);


                            editor.on('focus', $.proxy(function(editor,base,ev) {
                                    editor.plugins['scalarbeta'].init(editor);
                            },this,editor,base));
                            editor.on('blur',function(){
                                return false;
                            });
                            $(window).off('hidden.bs.modal').on("hidden.bs.modal", function() {
                                editor.focus();
                            });
                            $(this).on('blur', $.proxy(function($parent,base,ev) {
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
                                    $(this).find('.placeholder').off('hover');
                                    $(this).prop('contenteditable',false);
                                    base.updatePlaceholders($(this));
                                    //Save the current watcher then unload it.
                                    if(base.wasDirty){
                                        base.saveNode(base.currentEditNode);
                                        base.wasDirty = false;
                                    }
                                    window.clearInterval(base.ckeditorWatcher);
                                    window.clearTimeout(base.ckeditorSaveTimeout);

                                    if($(this).data('editor')!=null){
                                        CKEDITOR.instances[$(this).data('editor').name].destroy(true);
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
            
            $node.find('.usageRights').change(function(){
                base.saveNode($node);
            });

            base.updateLinks($node);

        };

        base.saveNode = function($node){
            var node = $node.data('node');
            var notice = $('<div class="alert" role="alert">Saving...</div>').hide().appendTo($node.find('.notice').html('')).fadeIn('fast');
            var title = $node.find('.title').text();
            var $description = $node.find('.descriptionContent');
            var description = $description.hasClass('noDescription')?'':$description.text();
            var editorialState = $node.data('state');
            var $body = $node.find('.bodyContent');
            var $body_copy = $body.clone();
            $body_copy.find('.placeholder').remove();
            $body_copy.find('a[data-linkid]').removeAttr('data-linkid');
            $body_copy.find('a[data-cke-saved-href]').removeAttr('data-cke-saved-href');
            var body = $body_copy.html();
            if($body.hasClass('media')){
                body = null;
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
                pageData[$(this).find('.fieldName').text()] = $(this).find('.fieldVal').text();    
            });
            
            //Add the editorial queries in:
            if(node.current.editorialQueries){
                pageData["scalar:editorial_queries"] = node.current.editorialQueries;
            }

            //Add usage rights:
            pageData["scalar:usage_rights"] = $node.find('.usageRights').prop('checked')?1:0;

            scalarapi.modifyPageAndRelations(baseProperties,pageData,undefined,function(e){
                base.$saveNotice.fadeIn('fast',function(){
                    window.setTimeout($.proxy(function(){$(this).fadeOut('fast');},this),2000);
                });
            },function(e){
                base.$warningNotice.text('Error saving page: '+e+'</div>').fadeIn('fast',function(){
                   window.setTimeout($.proxy(function(){$(this).fadeOut('fast');},this),2000);    
                });
            });
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

            $node.find('.placeholder').off('click').click(function(e){
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
                    if($(this).siblings('.placeholder').length > 0){
                        $(this).siblings('.placeholder').last().after($placeholder);
                    }else if($(this).parent().is('p, div')){
                        $(this).parent().prepend($placeholder);
                    }else if($(this).parents('br, div, p, h1, h2, h3, h4, h5, h6, h7').length > 0){
                        $(this).parents('br, div, p, h1, h2, h3, h4, h5, h6, h7').first().prepend($placeholder);
                    }else if($(this).prev('br, div, p, h1, h2, h3, h4, h5, h6, h7').length > 0){
                        $(this).prev('br, div, p, h1, h2, h3, h4, h5, h6, h7').last().after($placeholder);
                    }else{
                        $(this).parents('.bodyContent').prepend($placeholder);
                    }
                }
                
                $(this).attr('data-linkid',$(this).parents('.bodyContent').attr('id')+'_'+linkCount);
                $placeholder.attr('data-linkid',$(this).parents('.bodyContent').attr('id')+'_'+linkCount);

                if($(this).is('[resource]')){
                    (function($placeholder,resource,$node){
                        var handleMedia = function(){
                            var media = scalarapi.getNode(resource);
                            var description = media.current.description;
                            var thumbnail_url = media.getAbsoluteThumbnailURL();
                            if(!thumbnail_url){
                                if(media.current.mediaSource.contentType == "image" && !media.current.mediaSource.isProprietary){
                                    thumbnail_url = media.current.sourceFile;
                                }else{
                                    thumbnail_url = $('link#approot').attr('href')+'/views/melons/cantaloupe/images/media_icon_chip.png';
                                }
                            }
                            if(typeof description !== 'undefined' && description != null){
                                $placeholder.find('content').append('<div class="description">'+description+'</div>');
                            }
                            if(typeof media !== 'undefined' && media !== null && media !== undefined){
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
                                    description = node.current.description;
                                    if ( node.current.description == null ) {
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