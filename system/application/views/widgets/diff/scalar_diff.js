var scalar_diff = {

    // First entry in Unicode's Private Use Area; will roll over into supplemental Private Use Areas if needed...
    // See: https://www.unicode.org/versions/Unicode6.0.0/ch16.pdf
	'_currentToken' : 57344,
	'_decodeEntities' : function(encodedString) {
	  var textArea = document.createElement('textarea');
	  textArea.innerHTML = encodedString;
	  return textArea.value;
	},
	'_areTagStringsEquivalent' : function(stringA, stringB) {
		var tokensA = stringA.substring(1, stringA.length - 1).split(' ');
		var tokensB = stringB.substring(1, stringA.length - 1).split(' ');
		for (var i in tokensA) {
			if (tokensB.indexOf(tokensA[i]) == -1) {
				return false;
			}
		}
		return true;
	},
	'_tokenizeHTML' : function($content,htmlTokens,htmlTokenRelationships){
		//Actually do the tokenization - don't call this directly!
	    var childNodes = $content.find('*');
	    if(childNodes.length > 0){
          for(var i = 0; i < childNodes.length; i++){
              scalar_diff._tokenizeHTML($(childNodes[i]),htmlTokens,htmlTokenRelationships);
          }
	    }
	    if($content.data('diffContainer')){
	        return $content.text();
	    }
      if($content.html() != ''){
          var tags = $content[0].outerHTML.split($content.html());
      }else{
          var tags = [$content[0].outerHTML];
      }
	    var newHTML = scalar_diff._decodeEntities($content[0].outerHTML); // prevents html entities from being encoded multiple times inside nested tags
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
									tagsAreEquivalent = scalar_diff._areTagStringsEquivalent(existing_combinedTag[0], combinedTag[0]);
									if (scalar_diff._areTagStringsEquivalent(existing_combinedTag[0], combinedTag[0])) {
											// nothing; foundMatch will be set to true
									}else if(existing_combinedTag[0] != combinedTag[0] || existing_combinedTag.length != combinedTag.length){
	                    continue;
	                }else if(combinedTag.length == 2 && existing_combinedTag[1] != combinedTag[1]){
	                    continue;
	                }
	                foundMatch = true;
	                tokens = htmlTokens[t].tokens;
	            }
	            if(!foundMatch){
	                var t = String.fromCharCode(scalar_diff._currentToken++);
	                if(scalar_diff._currentToken > 63743 && scalar_diff._currentToken < 983040){
	                    //Move over to supplemental unicode set A - will roll over to set B if needed...
	                    scalar_diff._currentToken = 983040; //This should probably never happen - but if somehow someone has more than 6,400 changed tags...
	                }
	                tokens.push(t);
	                htmlTokenRelationships[t] = {endTag:null};
	                if(combinedTag.length == 2){
	                    htmlTokenRelationships[t].endTag = String.fromCharCode(scalar_diff._currentToken++);
	                    if(scalar_diff._currentToken > 63743 && scalar_diff._currentToken < 983040){
	                        //Move over to Supplementary Private Use Area-A - will roll over to set B if needed...
	                        scalar_diff._currentToken = 983040;
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
	                newHTML = newHTML.replace(regex, '\r\n'+tokens[i]+'\r\n');
	            }
	        }
	    }
	    newHTML = newHTML;
	    $content.replaceWith(document.createTextNode(newHTML));
	},
	'_addNewLinePlaceholders' : function(html){
        if (!!html) { //Just make sure HTML isn't null or empty or anything...
            return html.replace(/<\s?br\s?\/?>/g,'<span class="br_tag"></span>').replace(/<\s?p\s?\/?>(<\/?\s?p\s?>)?/g,'<span class="p_tag open"></span>').replace(/<\s?\/p\s?\/?>(<\/?\s?\/p\s?>)?/g,'<span class="p_tag close"></span>');
        } else {
            return html;
        }
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

				// take care of cases where the diff resulted in chunks that occur between tags
				var chunk, unclosedTags, char, o;
				unclosedTags = [];
				// loop through all of the diff chunks
				for (var d in diff.body) {
					chunk = diff.body[d][1];
					var n = chunk.length;
					// loop through each character in the chunk
					for (var i=0; i<n; i++) {
						// if we have lefover unclosed tags from the previous chunk, reopen them here
						if (i == 0 && unclosedTags.length > 0) {
							o = unclosedTags.length;
							for (var j=0; j<o; j++) {
								diff.body[d][1] = unclosedTags[j] + diff.body[d][1];
							}
						}
						char = chunk[i];
						// found an opening tag; keep track of it
						if (diff.tokens.relationships[char] != null && diff.tokens.relationships[char].endTag != null) {
							unclosedTags.push(char);
						} else if (unclosedTags.length > 0) {
							// found a closing tag; stop tracking it
							if (diff.tokens.relationships[unclosedTags[unclosedTags.length-1]].endTag == char) {
								unclosedTags.pop();
							}
						}
						// if we're at the end of the chunk, close any unclosed tags
						// (we'll open them again at the start of the next chunk)
						if (i == (n-1)) {
							o = unclosedTags.length;
							for (var j=o-1; j>=0; j--) {
								diff.body[d][1] += diff.tokens.relationships[unclosedTags[j]].endTag;
							}
						}
					}
				}

        //Clean up some white space
        for(var d in diff.body){
            diff.body[d][1] = diff.body[d][1].replace(/\n/g, '').replace(/\r/g, '');
						if (diff.body[d][1].trim().length != 0) {
							diff.body[d][2] = diff.body[d][1].trim();
						} else {
							diff.body[d][2] = diff.body[d][1];
						}
        }

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
                if(diff.tokens.relationships[thisDiff[2]] && diff.tokens.relationships[thisDiff[2]].endTag){
                    //we have a closing tag somewhere... wait until we've found the closing one.
                    waitingTags.push({
                        type : 'del',
                        waitingFor : diff.tokens.relationships[thisDiff[2]].endTag,
                        tags : [
                            '<span data-diff="del">'+thisDiff[2]
                        ]
                    });
                }else{
                    var newTag = '<span data-diff="del">'+thisDiff[1]+'</span>';
                    var content = thisDiff[1];
                    for(var h in diff.tokens.list){
                        var tokenSet = diff.tokens.list[h];
                        for(var t in tokenSet.tokens){
                            var regex = new RegExp(tokenSet.tokens[t], "g");
                            content = content.replace(regex, '');
                        }
                    }
                    var isTag = typeof diff.tokens.relationships[thisDiff[2]] !== 'undefined';
                    for(var w in waitingTags){
                        if(waitingTags[w].waitingFor.charCodeAt(0) == thisDiff[2].charCodeAt(0)){
                            //We found a closing tag! Huzzah!
                            for(var t = 1; t < waitingTags[w].tags.length; t++){
                                content+=waitingTags[w].tags[t];
                            }
                            newTag = waitingTags[w].tags.join('')+thisDiff[2]+'</span>';
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
                if(diff.tokens.relationships[thisDiff[2]] && diff.tokens.relationships[thisDiff[2]].endTag){
                    //we have a closing tag somewhere... wait until we've found the closing one.
                    waitingTags.push({
                        type : 'ins',
                        waitingFor : diff.tokens.relationships[thisDiff[2]].endTag,
                        tags : [
                            '<span data-diff="ins">'+thisDiff[2]
                        ]
                    });
                }else{
                    var newTag = '<span data-diff="ins">'+thisDiff[1]+'</span>';
                    var content = thisDiff[1];
                    for(var h in diff.tokens.list){
                        var tokenSet = diff.tokens.list[h];
                        for(var t in tokenSet.tokens){
                            var regex = new RegExp(tokenSet.tokens[t], "g");
                            content = content.replace(regex, '');
                        }
                    }
                    var isTag = typeof diff.tokens.relationships[thisDiff[2]] !== 'undefined';
                    for(var w in waitingTags){
                        if(waitingTags[w].waitingFor.charCodeAt(0) == thisDiff[2].charCodeAt(0)){
                            //We found a closing tag! Huzzah!
                            for(var t = 1; t < waitingTags[w].tags.length; t++){
                                content+=waitingTags[w].tags[t];
                            }
                            newTag = waitingTags[w].tags.join('')+thisDiff[2]+'</span>';
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
            var $segment = $('<div>'+segment+'</div>').children().first();

            if(!!$segment && !!$segment.data('diff')){
                if(!html[s+1] || (html[s].content != html[s+1].content && !(html[s].dir == -1 && html[s+1].dir == 1))){
                    var new_segment = '<span data-diff="placeholder"></span>';
                    cleanedHTML.push('<span data-diff="chunk">'+((html[s].dir==-1)?(segment+new_segment):(new_segment+segment))+'</span>');
                }else{
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
                var falsePositive = (oldAttr.length == newAttr.length && oldAttr.length > 0);
                //If so, check each attribute in the old element to see if they equal the new element
								if ($old.html() != $new.html()) {
									falsePositive = false;
								}
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
            if($(this).find('span[data-diff]:last').find('a[data-widget],a[resource]').length > 0){
                var $first = $(this).find('span[data-diff]:first').find('a[data-widget],a[resource]');
                if($first.length > 0){
                    $first.addClass('hiddenVisual').parents('span[data-diff="chunk"]').addClass('showSolo');
                }
            }
        });

        $tempBody.find('span[data-diff="chunk"]').each(function(){
            if($(this).find('div,p,br,.br_tag,.p_tag.open,.inline').length > 0){
                $(this).addClass('withBlockElement');
            }
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

        var htmlTokens = [];
        var htmlTokenRelationships = {};

        if(!_old.body) _old.body = '';
        if(!_new.body) _new.body = '';

        $old = $('<div>'+_old.body+'</div>');
        $new = $('<div>'+_new.body+'</div>');

        $old.add($new).find('div').each(function(){
            $(this).replaceWith(this.childNodes);
        });

        _old.body = $old.html();
        _new.body = $new.html();

		if(addNewLinePlaceholders){
			_old.body = scalar_diff._addNewLinePlaceholders(_old.body);
			_new.body = scalar_diff._addNewLinePlaceholders(_new.body);
		}

		var $body = $('<div>'+_old.body+'</div>').data('diffContainer',true);
		$body.find('[name="cke-scalar-empty-anchor"]').attr('name',null);
    $body.find('[data-cke-saved-name]').attr('data-cke-saved-name',null);
		var oldTokenizedBody = scalar_diff._tokenizeHTML(
			$body,
			htmlTokens,
			htmlTokenRelationships
		);

    $body = $('<div>'+_new.body+'</div>').data('diffContainer',true);
		$body.find('[name="cke-scalar-empty-anchor"]').attr('name',null);
    $body.find('[data-cke-saved-name]').attr('data-cke-saved-name',null);

		var newTokenizedBody = scalar_diff._tokenizeHTML(
			$body,
			htmlTokens,
			htmlTokenRelationships
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
