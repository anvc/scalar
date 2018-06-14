var scalar_diff = {

    // First entry in Unicode's Private Use Area; will roll over into supplemental Private Use Areas if needed...
    // See: https://www.unicode.org/versions/Unicode6.0.0/ch16.pdf
	'_startingToken' : 57344,

	'_tokenizeHTML' : function($content,htmlTokens,htmlTokenRelationships,currentToken){
		//Actually do the tokenization - don't call this directly!
	    var childNodes = $content.find('*');
	    if(childNodes.length > 0){
	        childNodes.each(function(){
	            scalar_diff._tokenizeHTML($(this),htmlTokens,htmlTokenRelationships,currentToken);
	        });
	    }
	    if($content.data('diffContainer')){
	        return $content.text();
	    }
	    $content.text('%%TEXT%%'+$content.text()+'%%TEXT%%');
	    var text = $content.text();
	    var tags = $content[0].outerHTML.split(text);
	    var newHTML = $content[0].outerHTML;
	    var openingTag = null;
	    for(var i in tags){
	        var tag = tags[i];
	        if(i==0 && tags.length == 2){
	            openingTag = {
	                html : tag,
	                closingTag : null
	            };
	        }else{
	            var combinedTag = [];

	            if(!!openingTag){
	                combinedTag.push(openingTag.html);
	            }

	            combinedTag.push(tags[i]);

	            var foundMatch = false;
	            var tokens = [];
	            for(var t in htmlTokens){
	                var existing_combinedTag = htmlTokens[t].combinedTag;
	                if(existing_combinedTag[0] != combinedTag[0] || existing_combinedTag.length != combinedTag.length){
	                    continue;
	                }else if(combinedTag.length == 2 && existing_combinedTag[1] != combinedTag[1]){
	                    continue;
	                }
	                foundMatch = true;
	                tokens = htmlTokens[t].tokens;
	            }
	            if(!foundMatch){
	                var t = String.fromCharCode(currentToken++);
	                if(currentToken > 63743 && currentToken < 983040){
	                    //Move over to supplemental unicode set A - will roll over to set B if needed...
	                    currentToken = 983040; //This should probably never happen - but if somehow someone has more than 6,400 changed tags...
	                }
	                tokens.push(t);
	                htmlTokenRelationships[t] = {endTag:null};
	                if(combinedTag.length == 2){
	                    htmlTokenRelationships[t].endTag = String.fromCharCode(currentToken++);
	                    if(currentToken > 63743 && currentToken < 983040){
	                        //Move over to supplemental unicode set A - will roll over to set B if needed...
	                        currentToken = 983040;
	                    }
	                    tokens.push(htmlTokenRelationships[t].endTag);
	                }
	                htmlTokens.push({
	                    'combinedTag' : combinedTag,
	                    'tokens' : tokens
	                });
	            }

	            for(var i = 0; i < combinedTag.length; i++){
	                var regex = new RegExp(combinedTag[i].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), "g");
	                newHTML = newHTML.replace(regex, tokens[i]);
	            }
	        }
	    }
	    newHTML = '\n'+newHTML.replace(/\%\%TEXT\%\%/g,'')+'\n';
	    $content.replaceWith(newHTML);
	},
	'_addNewLinePlaceholders' : function(html){
		return html.replace(/<\s?br\s?\/?>/g,'<span class="br_tag"></span>').replace(/<\s?p\s?\/?>(<\/?\s?p\s?>)?/g,'<span class="p_tag"></span>');
	},
	'_addMarkup' : function(diff){
		var titleText = '';
        for(var d = 0; d<diff.title.length; d++){
            var thisDiff = diff.title[d];
            var nextDiff = diff.title[d+1];
            if(thisDiff[0] == 0){
                titleText += thisDiff[1];
            }else if(!nextDiff || nextDiff[0] == 0){
                //Either we are at the end, or the next item is unchanged - just highlight this chunk.
                titleText += '<span data-diff="chunk">';
                    var thisText = thisDiff[1].replace(/\</g,"&lt;").replace(/\>/g,"&gt;");
                    if(thisDiff[0]==1){
                        titleText += '<span data-diff="placeholder"></span>';    
                    }
                    titleText += '<span data-diff="'+(thisDiff[0]==-1?'del':'ins')+'">'+thisText+'</span>';
                    if(thisDiff[0]==-1){
                        titleText += '<span data-diff="placeholder"></span>';    
                    }
                titleText += '</span>';
            }else{
                //We have a following item and it is a change - let's pair these up.
                titleText += '<span data-diff="chunk">';
                    var thisText = thisDiff[1].replace('/&/g','&amp;').replace(/\</g,"&lt;").replace(/\>/g,"&gt;");
                    var nextText = nextDiff[1].replace('/&/g','&amp;').replace(/\</g,"&lt;").replace(/\>/g,"&gt;")
                    titleText += '<span data-diff="'+(thisDiff[0]==-1?'del':'ins')+'">'+thisText+'</span>';
                    titleText += '<span data-diff="'+(nextDiff[0]==-1?'del':'ins')+'">'+nextText+'</span>';
                titleText += '</span>';
                d++;
            }
        }

        var descriptionText = '';
        for(var d = 0; d<diff.description.length; d++){
            var thisDiff = diff.description[d];
            var nextDiff = diff.description[d+1];
            if(thisDiff[0] == 0){
                descriptionText += thisDiff[1];
            }else if(!nextDiff || nextDiff[0] == 0){
                //Either we are at the end, or the next item is unchanged - just highlight this chunk.
                descriptionText += '<span data-diff="chunk">';
                    var thisText = thisDiff[1].replace(/\</g,"&lt;").replace(/\>/g,"&gt;");
                    if(thisDiff[0]==1){
                        descriptionText += '<span data-diff="placeholder"></span>';    
                    }
                    descriptionText += '<span data-diff="'+(thisDiff[0]==-1?'del':'ins')+'">'+thisText+'</span>';
                    if(thisDiff[0]==-1){
                        descriptionText += '<span data-diff="placeholder"></span>';    
                    }
                descriptionText += '</span>';
            }else{
                //We have a following item and it is a change - let's pair these up.
                descriptionText += '<span data-diff="chunk">';
                    var thisText = thisDiff[1].replace('/&/g','&amp;').replace(/\</g,"&lt;").replace(/\>/g,"&gt;");
                    var nextText = nextDiff[1].replace('/&/g','&amp;').replace(/\</g,"&lt;").replace(/\>/g,"&gt;")
                    descriptionText += '<span data-diff="'+(thisDiff[0]==-1?'del':'ins')+'">'+thisText+'</span>';
                    descriptionText += '<span data-diff="'+(nextDiff[0]==-1?'del':'ins')+'">'+nextText+'</span>';
                descriptionText += '</span>';
                d++;
            }
        }

        //Now onto the body! First, build a tree...
        var html = [];
        var waitingTags = [];
        for(var d in diff.body){
            var thisDiff = diff.body[d];
            if(thisDiff[0] == 0){
                //No change!
                if(waitingTags.length == 0){
                    html.push({'html':thisDiff[1],'dir':thisDiff[0]});
                }else{
                    for(var w in waitingTags){
                        waitingTags[w].tags.push(thisDiff[1]);
                    }
                }
            }else if(thisDiff[0] == -1){
                //Subtraction... Let's see if this has any content or if it's a naked tag
                if(diff.tokens.relationships[thisDiff[1]] && diff.tokens.relationships[thisDiff[1]].endTag){
                    //we have a closing tag somewhere... wait until we've found the closing one.
                    waitingTags.push({
                        type : 'del',
                        waitingFor : diff.tokens.relationships[thisDiff[1]].endTag,
                        tags : [
                            '<span data-diff="del">'+thisDiff[1]
                        ]
                    });
                }else{
                    var newTag = '<span data-diff="del">'+thisDiff[1]+'</span>';
                    var content = '';
                    var isTag = !!diff.tokens.relationships[thisDiff[1]];
                    for(var w in waitingTags){
                        if(waitingTags[w].waitingFor == thisDiff[1]){
                            //We found a closing tag! Huzzah!
                            for(var t = 1; t < waitingTags[w].tags.length; t++){
                                content+=waitingTags[w].tags[t];
                            }
                            newTag = waitingTags[w].tags.join('')+thisDiff[1]+'</span>';
                            thisDiff[0] = waitingTags[w].type=='ins'?1:0;
                            waitingTags.splice(w, 1);
                            isTag = true;
                            break;
                        }
                    }
                    if(!isTag && waitingTags.length > 0){
                        for(var w in waitingTags){
                            waitingTags[w].tags.push(newTag);
                        }
                    }else{
                        html.push({'html':newTag,'content':content,'dir':thisDiff[0]});
                    }
                }
            }else if(thisDiff[0] == 1){
                //Addition... Let's see if this has any content or if it's a naked tag
                if(diff.tokens.relationships[thisDiff[1]] && diff.tokens.relationships[thisDiff[1]].endTag){
                    //we have a closing tag somewhere... wait until we've found the closing one.
                    waitingTags.push({
                        type : 'ins',
                        waitingFor : diff.tokens.relationships[thisDiff[1]].endTag,
                        tags : [
                            '<span data-diff="ins">'+thisDiff[1]
                        ]
                    });
                }else{
                    var newTag = '<span data-diff="ins">'+thisDiff[1]+'</span>';
                    var content = '';
                    var isTag = !!diff.tokens.relationships[thisDiff[1]];
                    for(var w in waitingTags){
                        if(waitingTags[w].waitingFor == thisDiff[1]){
                            //We found a closing tag! Huzzah!
                            for(var t = 1; t < waitingTags[w].tags.length; t++){
                                content+=waitingTags[w].tags[t];
                            }
                            newTag = waitingTags[w].tags.join('')+thisDiff[1]+'</span>';
                            thisDiff[0] = waitingTags[w].type=='ins'?1:0;
                            waitingTags.splice(w, 1);
                            isTag = true;
                            break;
                        }
                    }
                    if(!isTag && waitingTags.length > 0){
                        for(var w in waitingTags){
                            waitingTags[w].tags.push(newTag);
                        }
                    }else{
                        html.push({'html':newTag,'content':content,'dir':thisDiff[0]});
                    }
                }
            }
        }
        //Just clean up any insertions/deletions without a matching deletion/insertion...
        var cleanedHTML = [];
        for(var s = 0; s < html.length; s++){
            var segment = html[s].html;
            var $segment = $(segment);
            if(!!$segment.data('diff')){
                if(!html[s+1] || html[s].content != html[s+1].content){
                        var $new_segment = $('<span data-diff="placeholder">'+html[s].content+'</span>');
                        cleanedHTML.push('<span data-diff="chunk">'+((html[s].dir==-1)?(segment+$new_segment[0].outerHTML):($new_segment[0].outerHTML+segment))+'</span>');
                }else if(html[s].content == html[s+1].content){
                    cleanedHTML.push('<span data-diff="chunk" data-diffType="swap">'+segment+html[++s].html+'</span>');
                }
            }else{
                cleanedHTML.push(segment);
            }
        }
        cleanedHTML = cleanedHTML.join('');
        for(var h in diff.tokens.list){
            var tokenSet = diff.tokens.list[h];
            for(var t in tokenSet.tokens){
                var regex = new RegExp(tokenSet.tokens[t], "g");
                cleanedHTML = cleanedHTML.replace(regex, tokenSet.combinedTag[t]);
            }
        }
        //Look for false positives and clean up widgets/media links
        var $tempBody = $('<div>'+cleanedHTML+'</div>')
        $tempBody.find('span[data-diffType="swap"]').each(function(){
            var $children = $(this).children();
            var $old = $children.first().children().first();
            var $new = $children.last().children().first();
            if(!!$old[0] && !!$new[0]){
                var oldAttr = jQuery.makeArray($old[0].attributes).sort();
                var parsedOldAttr = {};
                for(var a in oldAttr){
                    parsedOldAttr[oldAttr[a].name] = oldAttr[a].nodeValue;
                }

                var newAttr = jQuery.makeArray($new[0].attributes).sort();
                var parsedNewAttr = {};
                for(var a in newAttr){
                    parsedNewAttr[newAttr[a].name] = newAttr[a].nodeValue;
                }

                //First check to see if we have the same number of attributes...
                var falsePositive = oldAttr.length == newAttr.length;

                //If so, check each attribute in the old element to see if they equal the new element
                if(falsePositive){
                    for(var a in parsedOldAttr){
                        if(typeof parsedNewAttr[a] === "undefined" || parsedOldAttr[a] != parsedNewAttr[a]){
                            falsePositive = false;
                            break;
                        }
                    }
                }

                if(falsePositive){
                    $(this).replaceWith($new);
                }
            }

            //We don't need to show both versions of a media/widget link - hide the older one
            $(this).find('span[data-diff]').not(':last').find('a.inline').addClass('hiddenVisual');
        });

        cleanedHTML = $tempBody.html();
        var chunkCount = $tempBody.find('span[data-diff="chunk"]').length;
        $tempBody.remove();

        return {
        	'title' : titleText,
        	'description' : descriptionText,
        	'body' : cleanedHTML,
        	'chunkCount' : chunkCount
        }
	},
	'diff' : function(_old,_new, addNewLinePlaceholders, addMarkup){
		if(addNewLinePlaceholders){
			_old.body = scalar_diff._addNewLinePlaceholders(_old.body);
			_new.body = scalar_diff._addNewLinePlaceholders(_new.body);
		}
		
		var htmlTokens = [];
		var htmlTokenRelationships = {};
		// First entry in Unicode's Private Use Area; will roll over into supplemental Private Use Areas if needed...
    	// See: https://www.unicode.org/versions/Unicode6.0.0/ch16.pdf
		var currentToken = scalar_diff._startingToken;

		var $body = $('<div>'+_old.body+'</div>').data('diffContainer',true);
		$body.find('[name="cke-scalar-empty-anchor"]').attr('name',null);
		var oldTokenizedBody = scalar_diff._tokenizeHTML(
			$body,
			htmlTokens,
			htmlTokenRelationships,
			currentToken
		);

		$body = $('<div>'+_new.body+'</div>').data('diffContainer',true);
		$body.find('[name="cke-scalar-empty-anchor"]').attr('name',null);
		var newTokenizedBody = scalar_diff._tokenizeHTML(
			$body,
			htmlTokens,
			htmlTokenRelationships,
			currentToken
		);		

		if(typeof diff_match_patch !== 'undefined' && !!diff_match_patch){
			var dmp = new diff_match_patch();

	        var bodyDiff = dmp.diff_main(oldTokenizedBody,newTokenizedBody);
	        dmp.diff_cleanupSemantic(bodyDiff);
	        
	        var titleDiff = dmp.diff_main(_old.title,_new.title);  
	        dmp.diff_cleanupSemantic(titleDiff);
	        
	        var descriptionDiff = dmp.diff_main(_old.description,_new.description);
			dmp.diff_cleanupSemantic(descriptionDiff);

			var diff = {
	        	'body' : bodyDiff,
	        	'title' : titleDiff,
	        	'description' : descriptionDiff,
	        	'tokens' : {'list' : htmlTokens, 'relationships' : htmlTokenRelationships}
	        };

			if(addMarkup){
				diff = scalar_diff._addMarkup(diff);
			}

	        return diff;
		}else{
			console.error("Must include Diff Match Patch library!");
		}
	}
}