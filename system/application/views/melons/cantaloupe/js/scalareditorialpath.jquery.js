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

        base.node_states = { 
        						'draft' : 'Draft',
	        					'edit'  : 'Edit',
	        					'edit_review' : 'Edit Review',
	        					'clean' : 'Clean',
	        					'ready' : 'Ready',
	        					//'published' : 'Published'
        				   };

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

                                    console.log(path_of,features,tag_of,annotates,comments_on);
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

                                    var nodeMatchItemHTML = '<li class="heading_font">'+
                                                                '<a class="resultTitle" data-toggle="collapse" data-target="#result_'+node.slug.replace(/\//g, '_')+'" aria-expanded="false" aria-controls="result_'+node.slug.replace(/\//g, '_')+'">'+
                                                                    '<small class="glyphicon glyphicon-triangle-right" aria-hidden="true"></small>'+node.getDisplayTitle()+
                                                                '</a>'+
                                                                '<div class="collapse" id="result_'+node.slug.replace(/\//g, '_')+'">'+
                                                                  '<div class="content">'+$('<div>'+node.current.content+'</div>').text().substring(0,100)+'... <a class="moreLink" href="#">[More]</a></div>'+
                                                                  '<div class="relations">'+
                                                                  '</div>'+
                                                                '</div>'+
                                                            '</li>';
                                    //var nodeMatchItemHTML = '<li class="'+node.editorialState+'"><a data-node="'+node.slug+'" href="#node_'+node.slug.replace(/\//g, '_')+'">'+node.getDisplayTitle()+'</a></li>';
                                    var $nodeMatchItem = $(nodeMatchItemHTML).appendTo('#matchedNodes');
                                    $nodeMatchItem.find('.relations').append(splitList);
                                    $nodeMatchItem.find('.moreLink').click($.proxy(function(slug, e){
                                        e.preventDefault();
                                        $('#editorialSidePanel').addClass('loading_nodes');
                                        window.setTimeout($.proxy(function(slug){ this.scrollToNode(slug,false); },base,slug),1);
                                        return false;
                                    },base, node.slug));
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
		        	base.$contentLoader = $('<div class="loader text-muted well text-center"><strong>Loading book content... Please wait, this might take a little while.</strong><br /><small class="info"></small></span>').appendTo(base.options.contents);
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
                        console.log(data[uri],node);
                        var regex = /(?:\.)(\d+)\b/;
                        var matches = null;
                        if((matches = regex.exec(uri)) === null){
                            if(uri.lastIndexOf('http', 0) === 0){
                                //We don't have a version node! Load the node.
                                var node = scalarapi.getNode( uri );
                                node.editorialState = base.node_state_classes[Math.floor(Math.random()*(base.node_state_classes.length))];
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
                    var filterTypes = [];
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
                    $('#filterTypeText').text(base.currentFilterType);
                    base.fuse = new Fuse(base.nodeList.splitByType[base.currentFilterType], base.searchOptions);
                    for(var t in filterTypes){
                        $('<li><a role="button" data-type="'+filterTypes[t]+'" href="#">'+base.ucwords(filterTypes[t])+'</a></li>').appendTo('#editorialContentFinder .dropdown-menu').find('a').click(function(e){
                                e.preventDefault();
                                $('#editorialPathSearchText').removeClass('resolved');
                                console.log($(this).data('type'));
                                base.currentFilterType = $(this).data('type');
                                $('#filterTypeText').text(base.currentFilterType);
                                base.fuse = new Fuse(base.nodeList.splitByType[base.currentFilterType], base.searchOptions);
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

                    base.resize();

        			base.$nodeList.appendTo(base.options.contents);
                    
                    $('body').scrollspy({ target: '#editorialOutline', offset: 69 });

                    // //Set up inline editor for editable content
                    // var editorial_nodes = base.$nodeList.find('.editorial_node').hide();
                    // var num_editorial_nodes = editorial_nodes.length;
                    // var editorial_node_index = 1;

                    // base.$contentLoaderInfo.text('Loading editors...');

                    // var editable_fields = [];
                    // editorial_nodes.each(function(){

                    //     base.updateLinks($(this));
                    //     $(this).show().fadeTo(0,0);
                    //     var $parent = $(this);
                    //     $(this).find('[contenteditable]').each(function(){
                    //         if(!$(this)[0].isContentEditable){
                    //             return;
                    //         }

                    //         $parent.data('editableFields',$parent.data('editableFields')+1);

                    //         var editor = CKEDITOR.inline( $(this).attr('id'), {
                    //             // Remove scalar plugin for description - also remove codeMirror, as it seems to have issues with inline editing
                    //             removePlugins: $(this).hasClass('descriptionContent')?'scalar, codemirror, removeformat':'codemirror, removeformat',
                    //             startupFocus: false,
                    //             toolbar : 'ScalarInline'
                    //         } );

                    //         editor.on('focus', $.proxy(function(editor,base,ev) {
                    //                 if($(this).hasClass('descriptionContent')) return;
                                    
                    //                 $('html, body').animate({
                    //                     scrollTop: $(this).offset().top - ($(this).offset().top > $('body').scrollTop() ? 99 : 139)
                    //                 }, 1000);
                    //                 base.stripPlaceholders($(this));
                    //                 editor.plugins['scalar'].init(editor);
                    //         },this,editor,base));  


                    //         editor.on('blur', $.proxy(function($parent,base,ev) {
                    //                 if($('.bootbox').length > 0) return;
                    //                 if($(this).hasClass('descriptionContent')) return;
                                    
                    //                 base.updateLinks($parent);
                    //         },this,$parent,base)); 
                            

                    //         editor.on('instanceReady', $.proxy(function(base,ev) {
                    //             $(this).fadeTo(1000,100);
                    //             base.$contentLoader.fadeOut('fast',function(){
                    //                 $(this).remove();
                    //             });
                    //         },$parent,base));
                    //     });
                    // });
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

        base.addNode = function(node,callback){
        	var currentVersion = node.current;
        	var state = node.editorialState;
        	var stateName = base.node_states[state];
            var node_url = scalarapi.model.urlPrefix+node.slug;
        	var nodeView = typeof node.current.defaultView !== 'undefined' ? node.current.defaultView : 'plain';
            var queryCount = 0;
            var hasContent = typeof node.current.content !== 'undefined' && node.current.content != null;
            var viewName = typeof views[nodeView] !== 'undefined' ? views[nodeView].name : nodeView;

            if(typeof viewName == 'undefined' || viewName == null){
                viewName = views['plain'];
            }

        	var nodeItemHTML = '<div id="node_'+node.slug.replace(/\//g, '_')+'" class="editorial_node node caption_font">' +
        							'<div class="row">'+
        								'<div class="col-xs-12 col-sm-8 col-md-9 leftInfo">'+
                                            '<div class="notice"></div>'+
        									'<h2 class="heading_font heading_weight clearboth title"><a href="'+node_url+'">'+node.getDisplayTitle()+'</a></h2>'+
                                            '<div id="node_'+node.slug.replace(/\//g, '_')+'_description" class="descriptionContent caption_font"></div>'+
        									'<div class="header_font badges">'+
                                                '<span class="header_font badge view_badge">'+viewName+'</span>'+
                                                '<span class="header_font badge no_queries_badge">'+(queryCount>0?queryCount:'No')+' Quer'+(queryCount!=1?'ies':'y')+'</span>'+
                                                '<span class="header_font badge type_badge">'+base.ucwords(node.domType.singular)+'</span>'+
                                                '<a href="'+node_url+'.edit" class="edit_btn btn btn-sm btn-default">Open in page editor</a>'+
                                            '</div>'+
        								'</div>'+
        								'<div class="col-xs-12 col-sm-4 col-md-3">'+
        									'<div class="dropdown state_dropdown">'+
        										'<button class="'+state+' btn state_btn btn-block dropdown-toggle" type="button" id="stateSelectorDropdown_'+node.slug.replace(/\//g, '_')+'" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="btn_text">'+stateName+'</span><span class="caret pull-right"></span></button>'+
        										'<ul class="dropdown-menu" aria-labelledby="stateSelectorDropdown_'+node.slug.replace(/\//g, '_')+'">';

        	for(var stateClass in base.node_states){
        		nodeItemHTML += 					'<li class="'+stateClass+'"><a href="#" data-state="'+stateClass+'" class="'+(state == stateClass ? 'active':'')+'">'+base.node_states[stateClass]+'</a></li>';
        	}
        											
			nodeItemHTML += 					'</ul>'+
        									'</div>'+
											'<div class="checkbox">'+
												'<label>'+
													'<input type="checkbox"> Usage rights'+
												'</label>'+
											'</div>'+
        								'</div>'+
        							'</div>'+
                                    (hasContent?'<div id="node_'+node.slug.replace(/\//g, '_')+'_body" class="clearfix bodyContent body_font">'+node.current.content+'</div>':
                                                 '<div id="node_'+node.slug.replace(/\//g, '_')+'_body" class="clearfix bodyContent body_font">[No Content]</div>')+
        						'</div>';

        	var $node = $(nodeItemHTML).appendTo(base.$nodeList).hide().fadeIn();
            $node.data('node',node);

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
        	});

        	$node.data({
        		title : currentVersion.title,
        		slug : node.slug,
                state : state
        	});

            $node.find('.descriptionContent, .bodyContent').each(function(){
                $node.data('editableFields',$node.data('editableFields')+1);

                $(this).on('click',function(e){
                    if($(this).hasClass('noDescription')){
                        $(this).removeClass('noDescription').text('');
                    }
                    
                    if($(this).data('editor')==null){
                        $(this).data('unloading',false);
                        $(this).prop('contenteditable',true);
                        e.preventDefault();
                        var editor = CKEDITOR.inline( $(this).attr('id'), {
                            // Remove scalar plugin for description - also remove codeMirror, as it seems to have issues with inline editing
                            removePlugins: $(this).hasClass('descriptionContent')?'scalar, codemirror, removeformat, colorbutton, format, specialchar, indent, indentlist, list, blockquote, iframe, codeTag'
                                                                                 :'codemirror, removeformat',
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
                                base.ckeditorSaveTimeout = window.setTimeout($.proxy(function(){
                                    if(base.wasDirty){
                                        base.wasDirty = false;
                                        base.saveNode(base.currentEditNode);
                                    }
                                },this),1000);
                            }
                        },editor),500);

                        $(this).data('editor',editor);


                        editor.on('focus', $.proxy(function(editor,base,ev) {
                                if($(this).hasClass('descriptionContent')) return;
                                //base.stripPlaceholders($(this));
                                editor.plugins['scalar'].init(editor);
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

                                if($(this).hasClass('descriptionContent') && $(this).text() == ""){
                                    $(this).text("(This page does not have a description.)").addClass('noDescription');
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

            base.updateLinks($node);

        };

        base.saveNode = function($node){
            var node = $node.data('node');
            var notice = $('<div class="alert" role="alert">Saving...</div>').hide().appendTo($node.find('.notice').html('')).fadeIn('fast');
            var title = $node.find('.title').text();
            var $description = $node.find('.descriptionContent');
            var description = $description.hasClass('noDescription')?'':$description.text();
            var $body = $node.find('.bodyContent');
            var $body_copy = $body.clone();
            $body_copy.find('.placeholder').remove();
            var body = $body_copy.html();
            var baseProperties =  {
                native: 1,
                id: userId,
                'api_key':''
            };
            var pageData = {
                action: 'UPDATE',
                uriSegment: scalarapi.basepath(node.url),
                'dcterms:title': title,
                'dcterms:description': description,
                'sioc:content': body
            };
            scalarapi.modifyPageAndRelations(baseProperties,pageData,undefined,function(e){
                var notice = $('<div class="alert alert-success" role="alert">Page updated successfully!</div>').hide().appendTo($node.find('.notice').html('')).fadeIn('fast');
            },function(e){
                var notice = $('<div class="alert alert-danger" role="alert">Error in saving page! ('+e+')</div>').hide().appendTo($node.find('.notice').html('')).fadeIn('fast');
            });
        };

        base.resize = function(){
	    	$('#editorialSidePanel>div,#editorialSidePanel>.scrollUp').width($('#editorialSidePanel').width());
            $('#editorialSidePanel>div .collapse').css('max-height',$(window).height()-100);
	    };

        base.updateLinks = function($node){
            base.stripPlaceholders($node.find('.bodyContent'));
            var linkCount = 0; //$node.find('.bodyContent a[resource]').length + $node.find('.bodyContent a[data-widget]').length;
            $node.data('linkCount',linkCount);
            $node.find('.bodyContent a[resource], .bodyContent a[data-widget]').each(function(){

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
                    }else if($(this).parent().is('p')){
                        $(this).parent().prepend($placeholder);
                    }else if($(this).prev('br, div, p').length > 0){
                        $(this).prev('br, div, p').last().after($placeholder);
                    }else{
                        $(this).parents('.bodyContent').prepend($placeholder);
                    }
                }
                
                $(this).attr('data-linkid',$(this).parents('.bodyContent').attr('id')+'_'+linkCount);
                $placeholder.attr('data-linkid',$(this).parents('.bodyContent').attr('id')+'_'+linkCount);
                $placeholder.click(function(e){
                    e.preventDefault();
                    e.stopPropagation();
                });

                if($(this).is('[resource]')){
                    (function($placeholder,resource,$node){
                        var handleMedia = function(){
                            var media = scalarapi.getNode(resource);
                            var description = media.current.description;
                            if(typeof description !== 'undefined' && description != null){
                                $placeholder.find('content').append('<div class="description">'+description+'</div>');
                            }
                            if(typeof media !== 'undefined' && media !== null && media !== undefined){
                                $placeholder.find('.body').html('<img class="placeholder_thumbnail" src="'+media.thumbnail+'"><br />'+media.getDisplayTitle()+'<br />(Click to load '+media.current.mediaSource.contentType+')');
                            }else{
                                $placeholder.find('.body').html('Missing Media! ('+resource+')');
                            }
                        };
                        if(scalarapi.loadPage( resource, false, handleMedia, null, 1, false, null, 0, 0) == "loaded"){
                            handleMedia();
                        }
                    })($placeholder,$(this).attr('resource'),$node);
                }else{
                    $placeholder.find('.body').html('<img class="placeholder_thumbnail" src="'+$('link#approot').attr('href')+'views/melons/cantaloupe/images/widget_image_'+$(this).data('widget')+'.png"><br />'+base.ucwords($(this).data('widget'))+' Widget<br />(Click to load widget)');
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

            if($node.find('.bodyContent a[resource][data-align="right"]:not(.inline),.bodyContent a[data-widget][data-align="right"]:not(.inline)').length > 0){
                $node.addClass('gutter');
            }

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