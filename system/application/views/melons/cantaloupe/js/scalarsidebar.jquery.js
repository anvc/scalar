(function($){
    $.scalarSidebar = function(el){
        var base = this;
        
        base.$el = $(el);
        base.el = el;
        
        base.$el.data("scalarSidebar", base);
        
        base.loaded_nodes = {};
        base.hovered_item = null;

        base.hideSidebarViews = ['book_splash'];
        base.fullScreenViews = ['iframe'];

        //UTILITY FUNCTIONS
        base.detectScreenSize = function(){
            base.isMobile = isMobile || $(window).width()<=768;
            $('body').removeClass('desktop mobile').addClass(base.isMobile?'mobile':'desktop');
        };

        base.getURL = function(page, queryvars){
            queryvars = $.extend({},base.queryVars, queryvars);
            var url = page+'?';
            for(v in queryvars){
                if(queryvars[v]!='' && queryvars[v]!=null){
                    url += v+'='+queryvars[v]+'&';
                }
            }
            return url.substring(0, url.length - 1); //Remove last &
        };
        base.changeSidebarSize = function(size){
            base.container.removeClass('large medium small').addClass(size);
            $('body').removeClass('large_sidebar medium_sidebar small_sidebar').addClass(size+'_sidebar');
        };
        base.getIconByType = function(type){
            var icons = {
                'image' : 'icon-photo',
                'default' : 'icon-page'
            };
            if(typeof icons[type] !== 'undefined'){
                return icons[type];
            }else{
                return icons.default;
            }
        }

        base.load_info_panel = function(panel,id){
            base.info_container.addClass(panel+' open').find('#info_panel').html('<section id="info_panel_loading_text" class="heading_font">Loading&hellip;</section>');
            if(panel != 'grid'){
                if(typeof base.loaded_nodes[id] == 'undefined'){
                    scalarapi.loadNode(id, true, function(json){
                        base.loaded_nodes[id] = scalarapi.getNode(id);
                        base.show_info_panel(panel,base.loaded_nodes[id]);
                    },
                    function(err){
                        console.log(err);
                    },1, true);
                }else{
                    base.show_info_panel(panel,base.loaded_nodes[id]);
                }
            }else{
                //Just pass the the "id" as the second property for grid or tags - show_info_panel will do the rest.
                base.show_info_panel(panel,id);
            }
        };

        base.show_info_panel = function(panel, item){
            if(panel=='linear'){
                //Detemine what side we need to show this on.
                if(base.hovered_item.parents('.panel').hasClass('left')){
                    base.info_container.addClass('left');
                }else if(base.hovered_item.parents('.panel').hasClass('right')){
                    base.info_container.addClass('right');
                }
            }else{
                base.info_container.removeClass('left right');
            }
            base.info_container.removeClass('path recent linear tags grid').addClass(panel);
            var sidebar_html = '';
            switch(panel){
                case 'path':
                case 'recent':
                case 'linear':
                case 'tags':
                    if(typeof item.info_panel == 'undefined' || item.info_panel == null){
                        if(typeof item.info_panel == 'undefined' || item.info_panel == null){
                            item.info_panel = '';
                        }
                        var thumbnail = '';
                        if(item.thumbnail != null && typeof item.thumbnail != 'undefined'){
                            thumbnail = item.thumbnail;
                        }else if(item.current.mediaSource.contentType=='image'){
                            thumbnail = item.current.sourceFile;
                        }else{
                            var outgoing_references = item.getRelations('referee', 'outgoing', 'reverseindex');
                            for(var i = 0; i< outgoing_references.length; i++){
                                var this_reference = outgoing_references[i].target;
                                if(this_reference.current.mediaSource.contentType=='image'){
                                    thumbnail = this_reference.current.sourceFile;
                                    break;
                                }
                            }
                        }
                        item.thumbnail = thumbnail;
                        if(thumbnail!=''){

                            if(thumbnail.indexOf('http') != 0){
                                thumbnail = scalarapi.model.urlPrefix+thumbnail;
                                item.thumbnail = thumbnail;
                            }

                            item.info_panel += '<section id="info_panel_thumbnail" style="background-image: url('+thumbnail+')"><img src="'+thumbnail+'"></section>';
                        }

                        item.info_panel += '<h2 id="info_panel_title" class="heading_font">'+item.current.title+'</h2>';
                        
                        if(item.current.description!=null){
                            item.info_panel += '<section id="info_panel_description" class="caption_font">'+item.current.description+'</section>';
                        }

                        var featured_in = item.getRelations('referee', 'incoming', 'reverseindex');
                        var features = item.getRelations('referee', 'outgoing', 'reverseindex');
                        var tagged_by = item.getRelations('tag', 'incoming', 'reverseindex');
                        var tag_of = item.getRelations('tag', 'outgoing', 'reverseindex');
                        var annotates = item.getRelations('annotation', 'outgoing', 'reverseindex');
                        var annotated_by = item.getRelations('annotation', 'incoming', 'reverseindex');

                        var comments_on = item.getRelations('comment', 'outgoing', 'reverseindex');
                        var has_comments = item.getRelations('comment', 'incoming', 'reverseindex');
                        
                        if(featured_in.length > 0 || features.length > 0 || tagged_by.length > 0 || tag_of.length > 0 || annotates.length > 0 || annotated_by.length > 0 || comments_on.length > 0 || has_comments.length > 0){
                        
                            //Handle incoming featured
                            if(featured_in.length > 0){
                                item.info_panel += '<section id="info_panel_featured_in"><h3 class="heading_font">Featured In</h3><ul class="caption_font">';
                                for(var i = 0; i< featured_in.length; i++){
                                    var this_reference = featured_in[i].body;

                                    target_url = base.getURL(this_reference.url,{});

                                    item.info_panel += '<li><a href="'+target_url+'"><span class="text caption_font">'+this_reference.current.title+'</span></a></li>';

                                }
                                item.info_panel += '</ul></section>';
                            }

                            //Handle outgoing featured
                            if(features.length > 0){
                                item.info_panel += '<section id="info_panel_features_in"><h3 class="heading_font">Features</h3><ul class="caption_font">';
                                for(var i = 0; i< features.length; i++){
                                    var this_reference = features[i].target;

                                    target_url = base.getURL(this_reference.url,{});


                                    item.info_panel += '<li><a href="'+target_url+'"><span class="text caption_font">'+this_reference.current.title+'</span></a></li>';
                                }
                                item.info_panel += '</ul></section>';
                            }

                            //Handle incoming tagged
                            if(tagged_by.length > 0){
                                item.info_panel += '<section id="info_panel_tagged_by"><h3 class="heading_font">Tagged By</h3><ul class="caption_font">';
                                for(var i = 0; i< tagged_by.length; i++){
                                    var this_reference = tagged_by[i].body;

                                    target_url = base.getURL(this_reference.url,{});
                                    
                                    item.info_panel += '<li><a href="'+target_url+'"><span class="text caption_font">'+this_reference.current.title+'</span></a></li>';
                                }
                                item.info_panel += '</ul></section>';
                            }

                            //Handle outgoing tagged
                            if(tag_of.length > 0){
                                item.info_panel += '<section id="info_panel_tagged_by"><h3 class="heading_font">Tag Of</h3><ul class="caption_font">';
                                for(var i = 0; i< tag_of.length; i++){
                                    var this_reference = tag_of[i].target;

                                    target_url = base.getURL(this_reference.url,{});
                                    
                                    item.info_panel += '<li><a href="'+target_url+'"><span class="text caption_font">'+this_reference.current.title+'</span></a></li>';
                                }
                                item.info_panel += '</ul></section>';
                            }

                            //Handle incoming annotation
                            if(annotated_by.length > 0){
                                item.info_panel += '<section id="info_panel_tagged_by"><h3 class="heading_font">Annotated By</h3><ul class="caption_font">';
                                for(var i = 0; i< annotated_by.length; i++){
                                    var this_reference = annotated_by[i].body;

                                    target_url = base.getURL(this_reference.url,{});
                                    
                                    item.info_panel += '<li><a href="'+target_url+'"><span class="text caption_font">'+this_reference.current.title+'</span></a></li>';
                                }
                                item.info_panel += '</ul></section>';
                            }

                            //Handle outgoing annotation
                            if(annotates.length > 0){
                                item.info_panel += '<section id="info_panel_tagged_by"><h3 class="heading_font">Annotates</h3><ul class="caption_font">';
                                for(var i = 0; i< annotates.length; i++){
                                    var this_reference = annotates[i].target;

                                    target_url = base.getURL(this_reference.url,{});
                                    
                                    item.info_panel += '<li><a href="'+target_url+'"><span class="text caption_font">'+this_reference.current.title+'</span></a></li>';
                                }
                                item.info_panel += '</ul></section>';
                            }

                            //Handle the comments:
                            //Handle outgoing comments
                            if(comments_on.length > 0){
                                item.info_panel += '<section id="info_panel_comment_of"><h3 class="heading_font">Comment Of</h3><ul class="caption_font">';
                                for(var i = 0; i< comments_on.length; i++){
                                    var this_reference = comments_on[i].target;

                                    target_url = base.getURL(this_reference.url,{});
                                    
                                    item.info_panel += '<li><a href="'+target_url+'"><span class="text caption_font">'+this_reference.current.title+'</span></a></li>';
                                }
                                item.info_panel += '</ul></section>';
                            }
                        }

                        //We show the comments section regardless...
                        item.info_panel += '<section id="info_panel_comments"><h3 class="heading_font">Comments</h3><ul class="caption_font">';
                        
                        //Hide discuss link if not current item...
                        if(item.slug==currentNode.slug && base.logged_in){

                            item.info_panel += '<div id="info_panel_discuss_field"><a href="#" class="btn btn-lg center-block caption_font"><i class="icon-add-comment"></i> Discuss</a></div>';
                            
                        }
                        if(has_comments.length > 0){

                            for(var c in has_comments){              
                                var this_reference = has_comments[c].body;

                                target_url = base.getURL(this_reference.url,{});
                                
                                var date = new Date(this_reference.properties.datetime);
                                item.info_panel += '<li class="comment caption_font"><a href="'+target_url+'"><span class="icon"><i class="icon-comment"></i></span><span class="text"><span class="title caption_font">'+this_reference.getDisplayTitle()+'</span> <span class="caption_font body">'+this_reference.current.content+'</span></span></a></li>';
                            }
                        }else{
                            item.info_panel += '<li class="caption_font">There are currently no comments for this item.</li>';
                        }
                        item.info_panel += '</ul></section>';

                        //Handle Metadata
                        var properties = item.current.properties;
                        var items = {
                            dcterms : {},
                            scalarterms : {},
                            art : {},
                            rdf : {},
                            other : {}
                        };
                        var no_items = 0;
                        for(prop in properties){
                            if(typeof properties[prop] != 'undefined' && properties[prop] != null && properties[prop].length > 0 && properties[prop][properties[prop].length-1].value!=''){
                                no_items++;
                                var filtered_prop = properties[prop][properties[prop].length-1].value.replace('http://scalar.usc.edu/2012/01/scalar-ns#','').replace(scalarapi.model.urlPrefix,'');

                                if(prop.indexOf('dc/terms')>=0){
                                    items.dcterms[prop.replace('http://purl.org/dc/terms/','dc.')] = filtered_prop;
                                }else if(prop.indexOf('scalar.usc.edu')>=0){
                                    items.scalarterms[prop.replace('http://scalar.usc.edu/2012/01/scalar-ns#','scalar.')] = filtered_prop;
                                }else if(prop.indexOf('artstor')>=0){
                                    items.art[prop.replace('http://simile.mit.edu/2003/10/ontologies/artstor#','art.')] = filtered_prop;
                                }else if(prop.indexOf('rdf-syntax-ns')>=0){
                                    items.rdf[prop.replace('http://www.w3.org/1999/02/22-rdf-syntax-ns#','rdf.')] = filtered_prop;
                                }else if(
                                    prop == 'http://rdfs.org/sioc/ns#content' || 
                                    prop == 'http://xmlns.com/foaf/0.1/homepage' || 
                                    prop == 'http://open.vocab.org/terms/versionnumber'
                                ){
                                    //Skip these ones - either they are more content than metadata, or they are back-end info.
                                }else{
                                    items.other[prop] = filtered_prop;
                                }
                            }
                        }
                        if(no_items > 0){
                            item.info_panel += '<section id="info_panel_metadata"><h3 class="heading_font">Metadata</h3><dl class="caption_font">';
                            for(type in items){
                                for(term in items[type]){
                                    item.info_panel += '<div class="term"><dt class="caption_font">'+term+'</dt> <dd class="caption_font">'+(items[type][term])+'</dd></div>';
                                }
                                if(items[type].length > 0){
                                    item.info_panel += '<br />';
                                }
                            }
                            item.info_panel += '</dl></section>';
                        }
                    }
                    
                    sidebar_html = item.info_panel;

                    break;
                case 'grid':
                    //item = page type
                    var pages = base[item];
                    
                    sidebar_html = '<header class="heading_font">'+item+'s</header><ul id="info_panel_grid_list" class="caption_font">';
                    for(var i in pages){
                        var page = pages[i];
                        sidebar_html += '<li><a href="'+base.getURL(page.url,{p:'grid',path:''})+'">'+page.current.title+'</a></li>';
                    }
                    sidebar_html += '</ul>';
                    break;
            }
            var sidebar_content = $(sidebar_html);
            if(typeof item.url != 'undefined' && item.url != ''){
                var path = base.queryVars.path;
                if(path == item.slug){
                    path = null;
                }
                base.info_container.find('#visit_info_panel').attr('href',base.getURL(item.url,{p:panel,path:path}));
            }
            if(typeof item.thumbnail != 'undefined' && item.thumbnail != ''){
                $("<img/>").attr("src", item.thumbnail).load(function(){
                    var ratio = base.info_container.find('#info_panel').width()/this.width;
                    var offset = (ratio*this.height)-160;
                    base.info_container.find('#info_panel').html('').append(sidebar_content).stop().scrollTop(0).animate({ scrollTop: offset }, 400);
                });
            }else{
                //No sidebar thumbnail to figure out - just show it, already!
                base.info_container.find('#info_panel').html('').append(sidebar_content).stop().scrollTop(0);
            }
        };

        base.init = function(){
            if(currentNode != null && base.hideSidebarViews.indexOf(currentNode.current.defaultView)<0){
                if(base.fullScreenViews.indexOf(currentNode.current.defaultView)>=0){
                    $('body').addClass('fullscreen_page');
                }
                base.logged_in = $('link#logged_in').length > 0 && $('link#logged_in').attr('href')!='';
                base.isMobile = isMobile;

                $(window).on('resize',base.detectScreenSize);
                base.detectScreenSize();

                base.queryVars = scalarapi.getQueryVars( document.location.href );

                var sidebar_html =  '<div id="sidebar_container" class="small">' +
                                        '<header class="heading_font">'+
                                            '<nav id="sidebar_nav">'+
                                                '<div id="current_menu_item"><i class="icon-path"></i><span class="text">Path</span></li></div>'+
                                                '<ul>'+
                                                    '<li data-sidebar="path" class="selected"><i class="icon-path"></i><span class="text">Path</span></li>'+
                                                    '<li data-sidebar="tags"><i class="icon-tags"></i><span class="text">Tags</span></li>'+
                                                    '<li data-sidebar="grid"><i class="icon-index"></i><span class="text">Grid</span></li>'+
                                                    '<li data-sidebar="linear"><i class="icon-linear"></i><span class="text">Linear</span></li>'+
                                                    '<li data-sidebar="recent"><i class="icon-recent"></i><span class="text">Recent</span></li>'+
                                                '</ul>'+
                                            '</nav>'+
                                        '</header>'+
                                        '<div id="sidebar">'+
                                            '<section id="path">'+
                                                '<div class="left tall panel">'+
                                                    '<header class="heading_font panel_header">'+
                                                    '</header>'+
                                                    '<ul id="path_list" class="heading_font">'+
                                                    '</ul>'+
                                                '</div>'+
                                            '</section>'+
                                            '<section id="tags">'+
                                                '<div class="left tall panel">'+
                                                    '<header class="heading_font panel_header">Tags</header>'+
                                                    '<ul id="tags_list" class="heading_font">'+
                                                    '</ul>'+
                                                '</div>'+
                                            '</section>'+
                                            '<section id="grid">'+
                                                '<div class="left tall panel">'+
                                                    '<header class="heading_font panel_header">Grid</header>'+
                                                    '<div id="grid_list" class="heading_font row">'+
                                                    '</ul>'+
                                                '</div>'+
                                            '</section>'+
                                            '<section id="linear">'+
                                                '<div class="left short panel">'+
                                                    '<a id="linear_left" href="#" class="heading_font btn btn-lg center-block"><i class="icon-arrow-left pull-left"></i><span class="title">Title Here</span></a>'+
                                                '</div>'+
                                                '<div class="right short panel">'+
                                                    '<a id="linear_right" href="#" class="heading_font btn btn-lg center-block"><i class="icon-arrow-right pull-right"></i><span class="title">Title Here</span></a>'+
                                                '</div>'+
                                            '</section>'+
                                            '<section id="recent">'+
                                                '<div class="left tall panel">'+
                                                    '<header class="heading_font panel_header">Recent</header>'+
                                                    '<ul id="recent_list" class="heading_font">'+
                                                    '</ul>'+
                                                '</div>'+
                                            '</section>'+
                                        '</div>'+
                                        '<footer>'+
                                            '<a id="close_sidebar" href="#" class="heading_font btn btn-lg btn-primary center-block">Close</a>'+
                                        '</footer>'+
                                    '</div>';
                
                var info_panel_html =   '<div id="info_panel_container">'+
                                            '<div id="info_panel"><section id="info_panel_loading_text">Loading&hellip;</section></div>'+
                                            '<footer>'+
                                                '<a id="close_info_panel" href="#" class="heading_font btn btn-lg btn-primary center-block half_width">Back</a>'+
                                                '<a id="visit_info_panel" href="#" class="heading_font btn btn-lg btn-primary center-block half_width">Visit</a>'+
                                            '</footer>'+
                                        '</div>';

                base.container = $(sidebar_html).appendTo('body').hide();
                base.info_container = $(info_panel_html).appendTo('body');

                base.container.find('#sidebar_nav').click(function(e){
                    if(base.isMobile && (base.container.hasClass('small') && !$('body').hasClass('linear'))){
                        base.changeSidebarSize('medium');
                    }else{
                        $(this).toggleClass('open',!$(this).hasClass('open'));
                    }
                    e.stopPropagation();
                });

                base.container.find('#sidebar_nav li').click(function(e){
                    if(base.container.find('#sidebar_nav').hasClass('open')){
                        if(!$(this).hasClass('active')){
                            base.changePanel($(this).data('sidebar'));
                            $(this).addClass('selected').siblings().removeClass('selected');
                            base.container.find('#current_menu_item').html($(this).html());
                        }
                        base.container.find('#sidebar_nav').removeClass('open');
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });

                base.changeSidebarSize('small');
                base.container.find('#close_sidebar').click(function(e){
                    base.container.find('#sidebar_nav').removeClass('open');
                    base.changeSidebarSize('small');
                    base.info_container.removeClass();
                    e.preventDefault();
                    return false;
                });

                base.load_path_linear(base.container.find('#path'),base.container.find('#linear'));
                base.load_tags(base.container.find('#tags'));
                base.load_grid(base.container.find('#grid'));
                $.when(
                    $.getScript( arbors_uri+'/html/common.js' ),
                    $.getScript( widgets_uri+'/cookie/jquery.cookie.js' ),
                    $.getScript( widgets_uri+'/nav/jquery.rdfquery.rules.min-1.0.js' ),
                    $.getScript( widgets_uri+'/nav/jquery.scalarrecent.js' ),
                    $.Deferred(function( deferred ){
                        $( deferred.resolve );
                    })
                ).done(function(){
                        scalarrecent_log_page();
                        base.load_recent(base.container.find('#recent'));
                });

                base.container.addClass('loaded');

                base.current_panel = 'path';

                $('body').addClass(base.current_panel);

                base.info_container.find('#close_info_panel').click(function(e){
                    base.info_container.removeClass().find('#info_panel').html('');
                    $('.info_panel_item').removeClass('info_panel_item');
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                });

                if (!base.isMobile){
                    base.lastScroll = $(document).scrollTop();
                    $(window).scroll(function() {
                        var currentScroll = $(document).scrollTop();
                        if ((currentScroll > base.lastScroll) && (currentScroll > 50) && (state == ViewState.Reading)) {
                            $('body').addClass('tall');
                        } else if ((base.lastScroll - currentScroll) > 10) {
                            $('body').removeClass('tall');
                        }
                        base.lastScroll = currentScroll;
                    });
                    $('#header').mouseenter(function(){
                        $('body').removeClass('tall');
                    });
                }

                if(typeof base.queryVars.p != 'undefined'){
                    base.changePanel(base.queryVars.p,false);
                    var menu_item = base.container.find('#sidebar_nav li[data-sidebar='+base.queryVars.p+']');
                    menu_item.addClass('selected').siblings().removeClass('selected');
                    base.container.show().find('#current_menu_item').html(menu_item.html());
                }else{
                    base.container.fadeIn('fast');
                }
                $('html').click(function(){
                    base.info_container.removeClass('open');
                    $('#sidebar_nav').removeClass('open');
                    base.changeSidebarSize('small');
                    $('.info_panel_item').removeClass('info_panel_item');
                });
                base.info_container.click(function(e){
                    e.stopPropagation();
                });
                $([base.info_container, base.container]).each(function(){
                    $(this).hover(
                        function(e){
                            if(!base.isMobile){
                                clearTimeout(base.sidebar_timeout);
                                clearTimeout(base.info_panel_timeout);
                            }
                        },function(e){
                            if(!base.isMobile){
                                base.info_panel_timeout = setTimeout(function(){
                                    base.info_container.removeClass();
                                    $('.info_panel_item').removeClass('info_panel_item');
                                },100);
                                base.sidebar_timeout = setTimeout(function(){
                                    base.info_container.removeClass('open');
                                    $('#sidebar_nav').removeClass('open');
                                    base.changeSidebarSize('small');
                                    $('.info_panel_item').removeClass('info_panel_item');
                                },100);
                            }
                        }
                    );
                });
            }
        }; 

        //THE MEAT AND POTATO FUNCTIONS
        base.changePanel = function(new_panel,expand){
            base.previous_panel = base.current_panel;
            base.current_panel = new_panel;

            $('body').removeClass(base.previous_panel).addClass(base.current_panel);
            if(base.current_panel=='linear'){
                base.changeSidebarSize('small');
            }else if(expand!==false){
                if(base.container.hasClass('small')){
                    base.changeSidebarSize('medium');
                }
            }

            $('.info_panel_item').removeClass('info_panel_item');
            base.info_container.removeClass();
        };

        base.load_path_linear = function(path_container,linear_container){
            var paths = currentNode.getRelations('path', 'incoming', 'reverseindex');
            var path_of = currentNode.getRelations('path', 'outgoing', 'reverseindex');

            //Do we have a path currently?
            var current_path = null;
            var current_page_on_path = false;
            if(typeof base.queryVars.path != 'undefined' || base.queryVars.path != null){
                for(path in paths){
                    if(paths[path].body.slug == base.queryVars.path){
                        current_page_on_path = true;
                        current_path =  paths[path].body.outgoingRelations;
                        path_container.addClass('has_header');
                        path_container.find('.panel_header').html(paths[path].body.title).data({
                            slug : paths[path].body.slug,
                            url : paths[path].body.url
                        });
                        break;
                    }
                }
            }else if(path_of.length > 0){
                current_path = path_of;
                path_container.addClass('has_header');
                path_container.find('.panel_header').html(currentNode.title).data({
                    slug : currentNode.slug,
                    url : currentNode.url
                });
                base.queryVars.path = currentNode.slug;
            }

            var path_items = [];
            if(current_path!=null){
                
                var previous_item = null;
                var next_item = null;

                //Determine the correct order that the items should be displayed in...
                current_page_index = 0;
                for(relationship in current_path){
                    var this_relationship = current_path[relationship];
                    if(this_relationship.target.slug == currentNode.slug){
                        current_page_index = this_relationship.index;
                    }
                    path_items[this_relationship.index] = $('<li class="'+(current_page_index==this_relationship.index?'current':'')+'" data-url="'+this_relationship.target.url+'" data-slug="'+this_relationship.target.slug+'"><span class="index">'+this_relationship.index+'</span><span class="title">'+this_relationship.target.current.title+'</span></li>');
                }
                for(index in path_items){
                    //Now just to add them in the right order.
                    var this_item = path_items[index];

                    var distance = Math.abs(index-current_page_index);
                    
                     if(current_page_on_path){
                        this_item.data('distance',distance);
                    }

                    if(distance == 1){
                        next_item = this_item;
                    }else if(distance == -1){
                        previous_item = this_item;
                    }

                    $('#path_list').append(this_item);
                }
                if(current_page_on_path && previous_item==null){
                    previous_item = path_container.find('.panel_header');
                }

                //We can also do the linear panel now!
                if(previous_item == null){
                    base.container.find('#linear .left.panel').hide();
                }else{
                    if(previous_item.hasClass('panel_header')){
                        base.container.find('#linear_left .title').html(previous_item.html());
                    }else{
                        base.container.find('#linear_left .title').html(previous_item.find('.title').html());
                    }
                    base.container.find('#linear_left').data({
                        url : previous_item.data('url'),
                        path : previous_item.hasClass('panel_header')?'':path_container.find('.panel_header').data('slug')
                    }).show().click(function(e){
                        window.location = base.getURL($(this).data('url'),{path:$(this).data('path'), p : 'linear'});
                        e.preventDefault();
                        return false;
                    });
                }
                if(next_item == null){
                    base.container.find('#linear .right.panel').hide();
                }else{
                    base.container.find('#linear_right').data({
                        url : next_item.data('url'),
                        path : path_container.find('.panel_header').data('slug')
                    }).click(function(e){
                        window.location = base.getURL($(this).data('url'),{path:$(this).data('path'), p : 'linear'});
                        e.preventDefault();
                        return false;
                    }).show().find('.title').html(next_item.find('.title').html());
                }
            }else{
                //No path, just show the current page.
                path_container.removeClass('has_header');
                $('<li class="current" data-url="'+currentNode.url+'" data-slug="'+currentNode.slug+'"><span class="index">1</span><span class="title">'+currentNode.current.title+'</span></li>').appendTo($('#path_list'));
                base.container.find('#linear').hide();
                $('body').addClass('no_linear');
            }
            $('#sidebar #path header, #sidebar #path #path_list li').click(function(e){
                if(base.isMobile && !$(this).hasClass('info_panel_item')){
                    base.changeSidebarSize('medium');
                    base.hovered_item = $(this);
                    $('.info_panel_item').removeClass('info_panel_item');
                    $(this).addClass('info_panel_item');
                    base.load_info_panel('path',$(this).data('slug'));
                    e.stopPropagation();
                }else if(!base.isMobile){
                    window.location = base.getURL($(this).data('url'),{'p':'path'});
                    e.stopPropagation();
                    e.preventDefault();
                }
            }).hover(
                function(e){
                    if(!base.isMobile){
                        if(!$(this).hasClass('info_panel_item')){
                            base.changeSidebarSize('medium');
                            base.hovered_item = $(this);
                            $('.info_panel_item').removeClass('info_panel_item');
                            $(this).addClass('info_panel_item');
                            base.load_info_panel('path',$(this).data('slug'));
                        }
                    }
                },function(e){
                }
            );
        };

        base.load_tags = function(container){
            var tags = currentNode.getRelations('tag', 'incoming', 'reverseindex');
            var index = 0;
            if(tags.length > 0){
                for(t in tags){
                    index++;
                    var tag = tags[t];

                    var item_html = '<li class="" data-url="'+tag.body.url+'" data-slug="'+tag.body.slug+'"><span class="index">'+index+'</span><span class="title">'+tag.body.current.title+'</span></li>';

                    var new_item = $(item_html).appendTo(container.find('#tags_list'));
                }
                container.find('#tags_list li').click(function(e){
                    if(base.isMobile && !$(this).hasClass('info_panel_item')){
                        base.changeSidebarSize('medium');
                        $('.info_panel_item').removeClass('info_panel_item');
                        $(this).addClass('info_panel_item');
                        base.hovered_item = $(this);
                        base.load_info_panel('tags',$(this).data('slug'));
                        e.stopPropagation();
                    }else if(!base.isMobile){
                        window.location = base.getURL($(this).data('url'),{'p':'path'});
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }).hover(
                    function(e){
                        if(!base.isMobile){
                            if(!$(this).hasClass('info_panel_item')){
                                base.changeSidebarSize('medium');
                                $('.info_panel_item').removeClass('info_panel_item');
                                $(this).addClass('info_panel_item');
                                base.hovered_item = $(this);
                                base.load_info_panel('tags',$(this).data('slug'));
                                e.stopPropagation();
                            }
                        }
                    },function(e){
                    }
                );
            }
        };

        base.load_grid = function(container){
            var type_urls = {
                path : scalarapi.model.urlPrefix+'rdf/instancesof/path?format=json',
                page : scalarapi.model.urlPrefix+'rdf/instancesof/page?format=json',
                media : scalarapi.model.urlPrefix+'rdf/instancesof/media?format=json',
                comment : scalarapi.model.urlPrefix+'rdf/instancesof/reply?format=json',
                annotation : scalarapi.model.urlPrefix+'rdf/instancesof/annotation?format=json',
                tag : scalarapi.model.urlPrefix+'rdf/instancesof/tag?format=json'
            }

            for(type in type_urls){
                url = type_urls[type];
                if(type == 'media'){
                    item_html = '<div data-type="image" class="col-xs-6 col-sm-12 grid_item text-center"><span class="sidebar_icon icon-photo"></span><br /><div class="title"></div></div>';
                    var images_item = $(item_html).appendTo(base.container.find('#grid_list')).hide();

                    //Video...
                    item_html = '<div data-type="video" class="col-xs-6 col-sm-12 grid_item text-center"><span class="sidebar_icon icon-video"></span><br /><div class="title"></div></div>';
                    var video_item = $(item_html).appendTo(base.container.find('#grid_list')).hide();

                    //Audio...
                    item_html = '<div data-type="audio" class="col-xs-6 col-sm-12 grid_item text-center"><span class="sidebar_icon icon-audio"></span><br /><div class="title"></div></div>';
                    var audio_item = $(item_html).appendTo(base.container.find('#grid_list')).hide();
                    (function(url,images_item,video_item,audio_item){
                        $.getJSON(url,function(json){
                            base.media = scalarapi.model.parseNodes(json);
                            base.image = [];
                            base.video = [];
                            base.audio = [];

                            for(var i in base.media){
                                switch(base.media[i].current.mediaSource.contentType){
                                    case 'image':
                                        base.image.push(base.media[i]);
                                        break;
                                    case 'video':
                                        base.video.push(base.media[i]);
                                        break;
                                    case 'audio':
                                        base.audio.push(base.media[i]);
                                        break;
                                }
                            }

                            if(base.image.length > 0){
                                images_item.show().click(function(e){
                                    if(base.isMobile && !$(this).hasClass('info_panel_item')){
                                        base.changeSidebarSize('medium');
                                        $('.info_panel_item').removeClass('info_panel_item');
                                        $(this).addClass('info_panel_item');
                                        base.hovered_item = $(this);
                                        base.load_info_panel('grid',$(this).data('type'));
                                        e.stopPropagation();
                                    }
                                }).hover(
                                    function(e){
                                        if(!base.isMobile){
                                            if(!$(this).hasClass('info_panel_item')){
                                                base.changeSidebarSize('medium');
                                                $('.info_panel_item').removeClass('info_panel_item');
                                                $(this).addClass('info_panel_item');
                                                base.hovered_item = $(this);
                                                base.load_info_panel('grid',$(this).data('type'));
                                                e.stopPropagation();
                                            }
                                        }
                                    },function(e){}
                                ).find('.title').text(base.image.length);
                            }
                            
                            if(base.video.length > 0){
                                video_item.show().click(function(e){
                                    if(base.isMobile && !$(this).hasClass('info_panel_item')){
                                        base.changeSidebarSize('medium');
                                        $('.info_panel_item').removeClass('info_panel_item');
                                        $(this).addClass('info_panel_item');
                                        base.hovered_item = $(this);
                                        base.load_info_panel('grid',$(this).data('type'));
                                        e.stopPropagation();
                                    }
                                }).hover(
                                    function(e){
                                        if(!base.isMobile){
                                            if(!$(this).hasClass('info_panel_item')){
                                                base.changeSidebarSize('medium');
                                                $('.info_panel_item').removeClass('info_panel_item');
                                                $(this).addClass('info_panel_item');
                                                base.hovered_item = $(this);
                                                base.load_info_panel('grid',$(this).data('type'));
                                                e.stopPropagation();
                                            }
                                        }
                                    },function(e){}
                                ).find('.title').text(base.video.length);
                            }
                            
                            if(base.audio.length > 0){
                                audio_item.show().click(function(e){
                                    if(base.isMobile && !$(this).hasClass('info_panel_item')){
                                        base.changeSidebarSize('medium');
                                        $('.info_panel_item').removeClass('info_panel_item');
                                        $(this).addClass('info_panel_item');
                                        base.hovered_item = $(this);
                                        base.load_info_panel('grid',$(this).data('type'));
                                        e.stopPropagation();
                                    }
                                }).hover(
                                    function(e){
                                        if(!base.isMobile){
                                            if(!$(this).hasClass('info_panel_item')){
                                                base.changeSidebarSize('medium');
                                                $('.info_panel_item').removeClass('info_panel_item');
                                                $(this).addClass('info_panel_item');
                                                base.hovered_item = $(this);
                                                base.load_info_panel('grid',$(this).data('type'));
                                                e.stopPropagation();
                                            }
                                        }
                                    },function(e){}
                                ).find('.title').text(base.audio.length);
                            }
                        });
                    })(url,images_item,video_item,audio_item);
                }else{
                    icon = type;   
                    (function(url,item,type){
                        $.getJSON(url,function(json){
                            base[type] = scalarapi.model.parseNodes(json);
                            if(base[type].length > 0){
                                item.show().click(function(e){
                                    if(base.isMobile && !$(this).hasClass('info_panel_item')){
                                        base.changeSidebarSize('medium');
                                        $('.info_panel_item').removeClass('info_panel_item');
                                        $(this).addClass('info_panel_item');
                                        base.hovered_item = $(this);
                                        base.load_info_panel('grid',$(this).data('type'));
                                        e.stopPropagation();
                                    }
                                }).hover(
                                    function(e){
                                        if(!base.isMobile){
                                            if(!$(this).hasClass('info_panel_item')){
                                                base.changeSidebarSize('medium');
                                                $('.info_panel_item').removeClass('info_panel_item');
                                                $(this).addClass('info_panel_item');
                                                base.hovered_item = $(this);
                                                base.load_info_panel('grid',$(this).data('type'));
                                                e.stopPropagation();
                                            }
                                        }
                                    },function(e){}
                                ).find('.title').text(base[type].length);
                            }
                        });
                    })(url,$('<div data-type="'+type+'" class="col-xs-6 col-sm-12 grid_item text-center"><span class="sidebar_icon icon-'+icon+'"></span><br /><div class="title"></div></div>').appendTo(base.container.find('#grid_list')).hide(),type);
                }
            }
        };

        base.load_recent = function(container){
            try {
                var prev_string = localStorage.getItem('scalar_user_history');
            } catch(err) {
                // Most likely user is in Safari private browsing mode
            }
            if ('undefined'==typeof(prev_string) || !prev_string || !prev_string.length) {
                //No nodes - handle empty recent pane here...
                container.find('#recent_list').append('<li class="empty active">Your history is currently empty.</li>');
            } else {
                var nodes = JSON.parse(prev_string);
                var index = 0;
                for(var uri in nodes){
                    var this_node = nodes[uri];
                    if(uri.indexOf(scalarapi.model.urlPrefix)>=0){
                        var slug = uri.replace(scalarapi.model.urlPrefix,'');
                        index++;
                        if(typeof this_node['http://purl.org/dc/elements/1.1/title']!='undefined' && this_node['http://purl.org/dc/elements/1.1/title'] != null && this_node['http://purl.org/dc/elements/1.1/title'].length > 0){
                            var title = this_node['http://purl.org/dc/elements/1.1/title'][this_node['http://purl.org/dc/elements/1.1/title'].length-1].value;
                        }else{
                            //We don't have a title... Skip this one?
                            index--;
                            continue;
                        }
                        var item_html = '<li data-url="'+uri+'" data-slug="'+slug+'"><span class="index">'+index+'</span><div class="title">'+title+'</div></li>';
                        var new_item = $(item_html).appendTo(container.find('#recent_list')).find('.title');

                        if(slug == currentNode.slug){
                            new_item.addClass('active');
                        }
                    }
                }
                container.find('#recent_list li').click(function(e){
                    if(base.isMobile && !$(this).hasClass('info_panel_item')){
                        base.changeSidebarSize('medium');
                        $('.info_panel_item').removeClass('info_panel_item');
                        $(this).addClass('info_panel_item');
                        base.hovered_item = $(this);
                        base.load_info_panel('recent',$(this).data('slug'));
                        e.stopPropagation();
                    }else if(!base.isMobile){
                        window.location = base.getURL($(this).data('url'),{'p':'path'});
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }).hover(
                    function(e){
                        if(!base.isMobile){
                            if(!$(this).hasClass('info_panel_item')){
                                base.changeSidebarSize('medium');
                                $('.info_panel_item').removeClass('info_panel_item');
                                $(this).addClass('info_panel_item');
                                base.hovered_item = $(this);
                                base.load_info_panel('recent',$(this).data('slug'));
                                e.stopPropagation();
                            }
                        }
                    },function(e){}
                );
            }
        };

        base.init();
    };
    
    $.fn.scalarSidebar = function(){
        return this.each(function(){
            (new $.scalarSidebar(this));
        });
    };
    

})(jQuery);
