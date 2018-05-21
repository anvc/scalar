CKEDITOR.plugins.add( 'editorialTools', {
    //icons: 'editorialTools',
    init: function( editor ) {
        base = this;
        base.$editorialToolsPanel;
        base.addedEditorialToolsPanel = false;
        base.expandedEditorWidth = 0;
        base.editorialState = $('header span.metadata[property="scalar:editorialState"]').text();

        base.is_author = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Author';
        base.is_commentator = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Commentator';
        base.is_reviewer = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Reviewer';
        base.is_editor = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Editor';

        base.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        base.hideVersions = function(){

        };

        base.currentToken = 57344;
        base.htmlTokens = {};
        base.tokenHTML = {};

        base.tokenizeHTML = function(content){
            var $content = $(content);
            var childNodes = $(content).find('*');
            if(childNodes.length > 0){
                childNodes.each(function(){
                    base.tokenizeHTML(this);
                });
            }
            if($content.data('diffContainer')){
                return;
            }
            $content.text('%%TEXT%%'+$content.text()+'%%TEXT%%');
            var text = $content[0].outerText;
            var tokens = $content[0].outerHTML.split(text);
            var newHTML = $content[0].outerHTML;

            for(var i in tokens){
                if(base.htmlTokens[tokens[i]] != null && typeof base.htmlTokens[tokens[i]] != undefined){
                    var regex = new RegExp(tokens[i], "g");
                    newHTML = newHTML.replace(regex, base.htmlTokens[tokens[i]]);
                }else{
                    base.htmlTokens[tokens[i]] = String.fromCharCode(base.currentToken);
                    base.tokenHTML[base.htmlTokens[tokens[i]]] = tokens[i];
                    base.currentToken++;
                    var regex = new RegExp(tokens[i], "g");
                    newHTML =   newHTML.replace(regex, base.htmlTokens[tokens[i]]);
                }
            }
            $content[0].outerHTML = newHTML.replace(/%%TEXT%%/g,'');
        };
        base.serializeQueries = function(){
            var queryJSON = {"queries":[]};
            base.$queries.children('.query').each(function(){
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
            base.$resolvedQueries.find('#resolvedQueries').children('.query').each(function(){
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
            $('#editorial_queries').val(JSON.stringify(queryJSON));
            $('#unsavedQueryWarning').show().attr('aria-hidden','false');
        }
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
                base.$resolvedQueries.show();
                var $query = $(this).parents('.query');
                $query.appendTo(base.$resolvedQueries.find('#resolvedQueries'));
                $(this).remove();
                $query.find('.newReply').remove();
                var query = $query.data('query');
                query.resolved = true;
                $query.data('query',query);
                base.$resolvedQueries.find('.queryCount').text(parseInt(base.$resolvedQueries.find('.queryCount').text())+1);
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
                base.$resolvedQueries.show();
                base.$resolvedQueries.find('.queryCount').text(parseInt(base.$resolvedQueries.find('.queryCount').text())+1);
                $query.appendTo(base.$resolvedQueries.find('#resolvedQueries'));
                if(scrollToQuery && scrollToQuery === true){
                    base.$queriesPanel.animate({
                        scrollTop: $query.offset().top-base.$queriesPanel.offset().top
                    }, 200);
                }
            }else{
                $query.appendTo(base.$queries);
                if(scrollToQuery && scrollToQuery === true){
                    base.$queries.find('.new').removeClass('new');
                    $query.addClass('new');
                    base.$queriesPanel.animate({
                        scrollTop: $query.offset().top-base.$queriesPanel.offset().top
                    }, 200);
                    window.setTimeout(function(){
                        base.$queries.find('.new').removeClass('new');
                    },200);
                }
            }
        }

        base.displayVersions = function(versions){
            //if we only have one version selected, simply show the version - otherwise, show the diff
            if(versions.length == 1){

            }else if(versions.length == 2){
                var oldContent = $('<div>'+versions[1].content+'</div>').data('diffContainer',true);
                base.tokenizeHTML(oldContent);
                var newContent = $('<div>'+versions[0].content+'</div>').data('diffContainer',true);
                base.tokenizeHTML(newContent);

                var dmp = new diff_match_patch();
                var diff = dmp.diff_main(oldContent.text(),newContent.text());
                dmp.diff_cleanupSemantic(diff);
                console.log(diff);
            }
        };

        $('head').append('<link rel="stylesheet" href="'+this.path + 'css/editorialTools.css" type="text/css" />');
        editor.addContentsCss( this.path + 'css/editorialToolsInner.css' );
	    
	    editor.on('mode',function(e){
            $(editor.container.$).find('.cke_button.cke_button__editorialtools').removeClass('active');
            $(editor.container.$).find('.cke_inner').removeClass('editorialToolsExpanded');
            if(!base.addedEditorialToolsPanel){
                base.$editorialToolsPanel = $('<div id="editorialToolsPanel" class="clearfix"></div>').insertAfter($(editor.container.$).find('.cke_contents'));
                base.$editorialToolsPanel.height($(editor.container.$).find('.cke_contents').height());
                base.addedEditorialToolsPanel = true;

                //Build out the various pages of the editorial tools panel
                base.$editorialToolsPanelHeader = $('<div id="editorialToolsPanelHeader"></div>').appendTo(base.$editorialToolsPanel);
                base.$editorialToolsPanelBody = $('<div id="editorialToolsPanelBody"></div>').appendTo(base.$editorialToolsPanel);

                var dropdownHTML =  '<div class="dropdown heading_font">'+
                                        '<button class="btn btn-default dropdown-toggle" type="button" id="editorialToolsPanelHeaderDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><span class="caret pull-right"></span><span class="text"></span></button>'+
                                        '<ul class="dropdown-menu" aria-labelledby="editorialToolsPanelHeaderDropdown">'+
                                        '</ul>'+
                                    '</div>';
                base.$editorialToolsPanelHeaderDropdown = $(dropdownHTML).appendTo(base.$editorialToolsPanelHeader);

                //Edits
                    if(base.is_author && base.editorialState === "editreview"){
                        //Build out the edits panel...
                        base.$editorialToolsPanelHeaderDropdown.find('.dropdown-menu').append('<li><a href="#">Edits</a></li>');
                    }
                //Queries
                    $('input[value="Save"]').click(function(){
                        $('#unsavedQueryWarning').hide().attr('aria-hidden','true');
                    });
                    base.$editorialToolsPanelHeaderDropdown.find('.dropdown-menu').append('<li><a href="#">Queries</a></li>');
                    if($('#editorial_queries').length > 0){
                        var queries = JSON.parse($('#editorial_queries').val()).queries;
                    }else{
                        var queries = [];
                    }

                    base.$queriesPanel = $('<div class="queriesPanel panel"></div>').appendTo(base.$editorialToolsPanelBody);
                    base.$addNewQueryForm = $('<div id="addNewQueryForm" class="clearfix"><textarea placeholder="Enter query..." class="form-control" id="addNewQueryFormText"></textarea><button type="button" class="pull-right btn btn-sm">Submit</button></div>').prependTo(base.$queriesPanel).hide();
                    base.$addNewQueryForm.find('button').click(function(e){
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

                    base.$addNewQueryButton = $('<button id="addNewQuery" class="pull-right btn">Add new</button>').prependTo(base.$editorialToolsPanelHeader);
                    base.$addNewQueryButton.click(function(e){
                        $('#addNewQueryForm').show();
                        base.$queriesPanel.animate({
                            scrollTop: $('#addNewQueryForm').offset().top-base.$queriesPanel.offset().top
                        }, 200);
                        e.preventDefault();
                    });
                    base.$queries = $('<div class="queries"></div>').appendTo(base.$queriesPanel);
                    var resolvedQueriesHTML = '<div class="resolvedQueries">'+
                                                    '<a class="queryDropdownToggle" href="#">'+
                                                        '<small class="glyphicon glyphicon-triangle-right dropdownCaret" aria-hidden="true" data-toggle="collapse" data-target="#resolvedQueries" aria-expanded="false" aria-controls="resolvedQueries"></small> Resolved queries (<span class="queryCount">0</span>)'+
                                                    '</a>'+
                                                    '<div class="collapse" id="resolvedQueries">'+
                                                    '</div>'+
                                              '</div>';

                    base.$resolvedQueries = $(resolvedQueriesHTML).appendTo(base.$queriesPanel).hide();

                    base.$resolvedQueries.find('.queryDropdownToggle').click(function(e){
                        $(this).parents('.resolvedQueries').find('.collapse').collapse('toggle');
                        e.stopPropagation();
                        return false;
                    });

                    base.$resolvedQueries.find('.collapse').collapse({toggle:false}).on('show.bs.collapse',function(){
                        $(this).parents('.resolvedQueries').find('.queryDropdownToggle small').removeClass('glyphicon-triangle-right').addClass('glyphicon-triangle-bottom');
                        $(this).parents('.panel').animate({
                            scrollTop: $('.resolvedQueries').offset().top-base.$queriesPanel.offset().top
                        }, 200);
                    }).on('hide.bs.collapse',function(){
                        $(this).parents('.resolvedQueries').find('.queryDropdownToggle small').removeClass('glyphicon-triangle-bottom').addClass('glyphicon-triangle-right');
                    });

                    base.highestID = -1;
                    for(var q in queries){
                        var query = queries[q];
                        if(query.id > base.highestID){
                            base.highestID = query.id;
                        }
                        base.addQuery(query);
                    }
                    if(base.highestID == -1){
                        $('<div id="noQueries" class="text-muted text-center">There are no queries yet.</div>').appendTo(base.$queries);
                    }

                //Versions
                base.$editorialToolsPanelHeaderDropdown.find('.dropdown-menu').append('<li><a href="#">Versions</a></li>');
                base.$versionsPanel = $('<div class="versionsPanel panel"><p>Select two versions to compare the differences between them.</div>').appendTo(base.$editorialToolsPanelBody);
                base.$versionList = $('<div class="versionList"><table><tbody><tr class="loading"><td col-span="3">Loading...</span></td></tr></tbody></table></div>').appendTo(base.$versionsPanel);
                base.$versionListBody = base.$versionList.find('tbody');
                scalarapi.loadPage( page_slug, true, function(){
                    //build the version tab...
                    base.$versionList.find('.loading').remove();
                    var node = scalarapi.getNode(page_slug);
                    var currentNode = true;
                    var prevAuthor = -1;
                    for(var i in node.versions){
                        var version = node.versions[i];
                        var authorID = version.author.split("/").pop();
                        var authorName = authorID != prevAuthor ? contributors[authorID] : '';
                        var versionNumber = version.number;
                        var classes = '';
                        var dateString = '';
                        var $version = $('<tr id="version_'+(version.number)+'"></tr>');
                        if(currentNode){
                            versionNumber = '('+versionNumber+')';
                            $version.addClass('current selected');
                            currentNode = false;
                            dateString = 'Current';
                            base.lastSelectedVersion = $version;
                        }else{
                            var date = new Date(version.created);
                            var hour = date.getHours();
                            var suffix = "am";
                            if(hour > 12){
                                hour -= 12;
                                suffix = "pm";
                            }else if(hour == 0){
                                hour = 12;
                            }
                            dateString = hour+':'+date.getMinutes()+' '+suffix+' '+base.monthNames[date.getMonth()]+' '+date.getDate();
                        }
                        
                        $version
                            .html('<td>'+versionNumber+'</td><td>'+authorName+'</td><td>'+dateString+'</td>')
                            .data('version',version)
                            .click(function(e){
                                e.preventDefault();
                                e.stopPropagation();
                                var version = $(this).data('version');
                                var currentlySelected = base.$versionListBody.find('.selected');
                                if($(this).hasClass('selected') && base.$versionListBody.find('.selected').length > 1){
                                    $(this).removeClass('selected');
                                    if(currentlySelected.length > 1){
                                        base.lastSelectedVersion = currentlySelected.not($(this));
                                    }else{
                                        base.lastSelectedVersion = null;
                                    }
                                }else if(!$(this).hasClass('selected')){
                                    if(base.$versionListBody.find('.selected').length == 0){
                                        base.lastSelectedVersion = $(this);
                                    }else if(base.$versionListBody.find('.selected').length > 1){
                                        base.lastSelectedVersion.removeClass('selected');
                                        base.lastSelectedVersion = base.$versionListBody.find('.selected').first();
                                    }
                                    $(this).addClass('selected');
                                }else{
                                    return false;
                                }
                                currentlySelected = base.$versionListBody.find('.selected');
                                if(currentlySelected.length == 1 && currentlySelected.first().hasClass('current')){
                                    base.hideVersions();
                                }else{
                                    var versions = [];
                                    currentlySelected.each(function(){
                                        versions.push($(this).data('version'));
                                    });
                                    base.displayVersions(versions);
                                }
                            })
                            .appendTo(base.$versionListBody);
                        prevAuthor = authorID;
                    }
                }, null, 0, false, null, 0, 100, false, true);

                //Set up dropdown functionality
                base.$editorialToolsPanelHeaderDropdown.find('button .text').text(base.$editorialToolsPanelHeaderDropdown.find('li>a').first().addClass('active').text());
                base.$editorialToolsPanel.addClass(base.$editorialToolsPanelHeaderDropdown.find('li>a').first().addClass('active').text().toLowerCase());
                if(base.$editorialToolsPanelHeaderDropdown.find('li>a').length > 1){
                    base.$editorialToolsPanelHeaderDropdown.find('li>a').click(function(e){
                        e.preventDefault();
                        base.$editorialToolsPanel.removeClass($(this).parents('ul').find('a.active').removeClass('active').text().toLowerCase());
                        $(this).addClass('active');
                        base.$editorialToolsPanelHeaderDropdown.find('button .text').text($(this).text());
                        base.$editorialToolsPanel.addClass($(this).text().toLowerCase());
                    });
                }else{
                    base.$editorialToolsPanelHeaderDropdown.find('button').prop('disabled',true).find('.caret').hide();
                }
            }else{
                $editorialToolsPanel.height($(editor.container.$).find('.cke_contents').height());
            }
        });

        editor.addCommand( 'toggleEditorialTools', {
            exec: function( editor ) {
                $(editor.container.$).find('.cke_inner').toggleClass('editorialToolsExpanded');
                $(editor.container.$).find('.cke_button.cke_button__editorialtools').toggleClass('active');
                base.expandedEditorWidth = $(editor.container.$).find('.cke_inner ').outerWidth();
                base.$editorialToolsPanel.width((base.expandedEditorWidth*.3)-10);
            }
        });

        editor.widgets.add( 'edit', {
            init: function() {
                // ...
            }
        });

        editor.ui.addButton( 'editorialTools', {
            label: 'Editorial Tools',
            command: 'toggleEditorialTools',
            toolbar: 'formatting'
        });
    }
});