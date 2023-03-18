// https://github.com/matthijsgroen/html-diff-js
// Creates a HTML Diff based on content changes and not
// based on markup changes.
// Ideal to compare a HTML invalid formatting with a 
// valid one.

// Dependencies:

// jQuery -> converting text into plain text including HTML Entities
// Diff Match Path -> http://code.google.com/p/google-diff-match-patch/
//= require ./diff_match_patch_uncompressed
window.HtmlDiff = {
  formatTextDiff: function(originalText, finalText) {
    var finalDiff;
    //console.log originalText
    //console.log finalText
    // First create a correct diff of these 2 texts, disregarding markup changes
    finalDiff = this.makeDiff(originalText, finalText);
    console.log(finalDiff);
    //@consoleDiff finalDiff
    finalDiff = this.aggregateDiff(finalDiff);
    console.log(finalDiff);
    finalDiff = this.filterRemovedSpaces(finalDiff);
    console.log(finalDiff);
    // format the diff to HTML tags
    return this.formatDiff(finalDiff);
  },
  // private method
  // This methods does 4 things:
  // 1. Make sanitized plain text versions of the original and final text to compare
  // 2. Makes a diff of the marked-up version of the original and final text
  // 3. sanitizes the marked-up diff
  // 4. plots the plain text changes in the final markup
  makeDiff: function(originalText, finalText) {
    var changeType, diff, diffIndex, finalDiff, initialPlain, lastChangeType, plainChanges, plainDiff, plainPreChange, plainText, plainTextChange, postChange, preChange, ref, replacePos, scramble, text, textChange, updatedPlain;
    originalText = this.fixEntities(originalText);
    finalText = this.fixEntities(finalText);
    // To make a correct diff, we need to have the real content changes,
    // so 1. Convert both texts to comparable plain text strings
    initialPlain = this.sanitizePlainText(originalText);
    updatedPlain = this.sanitizePlainText(finalText);
    //console.log initialPlain, updatedPlain

    // 2. Make the plain text diff
    plainDiff = diff_match_patch.prototype.diff_main(initialPlain, updatedPlain);
    diff_match_patch.prototype.diff_cleanupSemantic(plainDiff);
    if (plainDiff.length === 1) {
      // no text changes, accept the final text
      return [[DIFF_EQUAL, finalText]];
    }
    //@consoleDiff plainDiff
    // Only keep the changes, strip all changes of trailing and leading spaces
    plainChanges = this.makeSmallestPlainChanges(plainDiff);
    //console.log "plain changes:"
    //@consoleDiff plainChanges

    // 3. Make the diff with the 2 marked up texts
    diff = diff_match_patch.prototype.diff_main(originalText, finalText);
    diff_match_patch.prototype.diff_cleanupSemantic(diff);
    //@consoleDiff diff
    diff = this.makeSmallestMarkupChanges(diff);
    // store our final diff.
    // It's a list of changes, each entry is of the form [change, content]
    // where change is one of DIFF_ADD, DIFF_DELETE or DIFF_EQUAL
    finalDiff = [];
    // Walk through our messy markup diff
    diffIndex = 0;
    while (diffIndex < diff.length) {
      [changeType, text] = diff[diffIndex];
      //@consoleDiff [diff[diffIndex]]

      // Try to find the markup change within our plain text changes
      // Take into account the changes that are alread added to the final
      // diff using the lookupPos var. The markup change could also contain
      // our plain text change. e.g. '<h2>Hello' => 'Hello'
      // These should also be detected, so indexOf is used instead of ==
      plainTextChange = text;
      textChange = null;
      if (plainTextChange.length) {
        textChange = _.find(plainChanges, ([plainChange, plainText], index) => {
          var scramble;
          scramble = this.scrambleMarkup(plainTextChange, plainText);
          // check if:
          // - the markup change contains our plain text change
          // - the change is of the same direction (addition, deletion)
          // - the change is not already in our final diff.
          if ((scramble.indexOf(plainText) > -1) && (changeType === plainChange) && (changeType !== DIFF_EQUAL)) {
            //@consoleDiff plainChanges
            //@consoleDiff finalDiff
            plainChanges.splice(0, index + 1); // shrink our 'todo'
            return true;
          }
        });
      }
      if (textChange) {
        plainText = textChange[1];
        // scramble the markup code to find the position of the replacement. By scrambling all markup the position will be a true
        // text position, and not a markup position. e.g. 'p' wrongly matching in '<p>hello p'
        scramble = this.scrambleMarkup(text, plainText);
        // scramble own entities for matching.
        replacePos = scramble.indexOf(this.scrambleMarkup(plainText, plainText));
        preChange = text.substr(0, replacePos);
        plainPreChange = this.sanitizePlainText(preChange);
        postChange = text.substr(replacePos + plainText.length);
        //console.log "'#{plainText}' as change for: '#{text}'", "'#{scramble}', starting: #{replacePos}, change: #{changeType}, pre: #{preChange}"
        lastChangeType = (ref = finalDiff[finalDiff.length - 1]) != null ? ref[0] : void 0;
        if ((lastChangeType === DIFF_DELETE && changeType === DIFF_INSERT) && plainPreChange.length) {
          //console.log "prechanges is a swap"
          finalDiff.push([
            DIFF_INSERT,
            preChange // we are in a swap (del - ins)
          ]);
        } else {
          //console.log "prechanges is equal (not interesting)"
          finalDiff.push([DIFF_EQUAL, preChange]);
        }
        finalDiff.push([changeType, plainText]);
        if (postChange.length) {
          //console.log "injecting '#{postChange}' into diff for processing"
          diff.splice(diffIndex + 1, 0, [changeType, postChange]);
        }
      } else {
        if (changeType === DIFF_DELETE) {
          if (text.match(/^\s+$/)) {
            // only pass through delete spaces (which get filtered in the end)
            finalDiff.push([DIFF_DELETE, text]);
          }
        } else {
          finalDiff.push([DIFF_EQUAL, text]);
        }
      }
      diffIndex++;
    }
    return finalDiff;
  },
  // private method
  // scramble markup code to prevent matching with our plain text change
  scrambleMarkup: function(markup, text) {
    var scramble, scrambler;
    scrambler = function(content) {
      return content.replace(text, text.substr(1).concat("~"));
    };
    scramble = markup.replace(/(<[^>]*>)/g, scrambler);
    scramble = scramble.replace(/^([a-zA-Z]*>)/, scrambler);
    scramble = scramble.replace(/(<[a-zA-Z]*)$/, scrambler);
    if (!text.match(/&[^;]+;/)) { // no entity placement?
      scramble = scramble.replace(/(&[^;]*;)/g, scrambler);
    }
    return scramble;
  },
  // private method
  // Split the diff components into the smallest parts possible.
  // no multiple words, no large replacements
  makeSmallestPlainChanges: function(plainDiff) {
    var change, content, deletion, i, index, insertion, len, plainChanges, pos, prefix, ref, ref1, suffix;
    plainChanges = [];
    for (index = i = 0, len = plainDiff.length; i < len; index = ++i) {
      [change, content] = plainDiff[index];
      if (change === DIFF_DELETE && ((ref = plainDiff[index + 1]) != null ? ref[0] : void 0) === DIFF_INSERT) {
        // word replacement. check if it should be split up more
        deletion = content;
        insertion = plainDiff[index + 1][1];
        if ((pos = insertion.indexOf(deletion)) > -1) { // insertion contains deletion, split up
          prefix = insertion.substr(0, pos).replace(/^\s+/, '').replace(/\s+$/, '');
          suffix = insertion.substr(pos + deletion.length).replace(/^\s+/, '').replace(/\s+$/, '');
          //console.log "'#{insertion}' => '#{prefix}' '#{deletion}' '#{suffix}'"
          this.addDiffPart(plainChanges, DIFF_INSERT, prefix);
          this.addDiffPart(plainChanges, DIFF_INSERT, suffix);
        } else if ((pos = deletion.indexOf(insertion)) > -1) { // deletion contains insertion, split up
          prefix = deletion.substr(0, pos).replace(/^\s+/, '').replace(/\s+$/, '');
          suffix = deletion.substr(pos + insertion.length).replace(/^\s+/, '').replace(/\s+$/, '');
          //console.log "'#{insertion}' => '#{prefix}' '#{deletion}' '#{suffix}'"
          this.addDiffPart(plainChanges, DIFF_DELETE, prefix);
          this.addDiffPart(plainChanges, DIFF_DELETE, suffix);
        } else {
          this.addDiffPart(plainChanges, DIFF_DELETE, deletion);
          this.addDiffPart(plainChanges, DIFF_INSERT, insertion);
        }
      //console.log "Replacement: '#{deletion}' => '#{insertion}'"
      } else if (change === DIFF_INSERT && ((ref1 = plainDiff[index - 1]) != null ? ref1[0] : void 0) === DIFF_DELETE) {

      // Already handled by block above
      } else if (change !== DIFF_EQUAL) {
        this.addDiffPart(plainChanges, change, content);
      }
    }
    return plainChanges;
  },
  addDiffPart: function(diff, change, text) {
    var i, len, plainText, ref, results, word;
    plainText = $("<div>").text(text).html();
    plainText = this.sanitizeSpaces(plainText);
    ref = plainText.split(/\s+/);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      word = ref[i];
      results.push(diff.push([change, word]));
    }
    return results;
  },
  makeSmallestMarkupChanges: function(markupDiff) {
    var change, content, deletedParts, deletion, deletions, equals, i, index, insertedParts, insertion, inserts, intersected, len, markupChanges, pos, prefix, ref, ref1, suffix, text;
    this.consoleDiff(markupDiff);
    this.completeTags(markupDiff);
    this.consoleDiff(markupDiff);
    markupChanges = [];
    for (index = i = 0, len = markupDiff.length; i < len; index = ++i) {
      [change, content] = markupDiff[index];
      if (change === DIFF_DELETE && ((ref = markupDiff[index + 1]) != null ? ref[0] : void 0) === DIFF_INSERT) {
        // word replacement. check if it should be split up more
        deletion = content;
        insertion = markupDiff[index + 1][1];
        if ((pos = insertion.indexOf(deletion)) > -1) { // insertion contains deletion, split up
          prefix = insertion.substr(0, pos);
          suffix = insertion.substr(pos + deletion.length);
          this.addMarkupDiff(markupChanges, DIFF_INSERT, prefix);
          this.addMarkupDiff(markupChanges, DIFF_EQUAL, deletion);
          this.addMarkupDiff(markupChanges, DIFF_INSERT, suffix);
        } else if ((pos = deletion.indexOf(insertion)) > -1) { // deletion contains insertion, split up
          prefix = deletion.substr(0, pos);
          suffix = deletion.substr(pos + insertion.length);
          this.addMarkupDiff(markupChanges, DIFF_DELETE, prefix);
          this.addMarkupDiff(markupChanges, DIFF_EQUAL, insertion);
          this.addMarkupDiff(markupChanges, DIFF_DELETE, suffix);
        } else {
          deletions = [];
          this.addMarkupDiff(deletions, DIFF_DELETE, deletion);
          inserts = [];
          this.addMarkupDiff(inserts, DIFF_INSERT, insertion);
          deletedParts = (function() {
            var j, len1, results;
            results = [];
            for (j = 0, len1 = deletions.length; j < len1; j++) {
              [change, text] = deletions[j];
              results.push(text);
            }
            return results;
          })();
          insertedParts = (function() {
            var j, len1, results;
            results = [];
            for (j = 0, len1 = inserts.length; j < len1; j++) {
              [change, text] = inserts[j];
              results.push(text);
            }
            return results;
          })();
          //console.log deletedParts
          //console.log insertedParts
          equals = [];
          intersected = _.reject(_.intersection(deletedParts, insertedParts), function(elem) {
            return elem.match(/^\s+$/);
          });
          //console.log intersected
          if (intersected.length > 0) {
            while ((deletions[0] != null) && (deletions[0][1] !== intersected[0])) {
              markupChanges.push(deletions.shift());
            }
            while ((inserts[0] != null) && (inserts[0][1] !== intersected[0])) {
              markupChanges.push(inserts.shift());
            }
            while ((inserts[0] != null) && (deletions[0] != null) && (inserts[0][1] === deletions[0][1])) {
              equals.push([DIFF_EQUAL, inserts[0][1]]);
              inserts.shift();
              deletions.shift();
            }
          }
          markupChanges = markupChanges.concat(equals).concat(deletions).concat(inserts);
        }
      } else if (change === DIFF_INSERT && ((ref1 = markupDiff[index - 1]) != null ? ref1[0] : void 0) === DIFF_DELETE) {

      } else {
        // Already handled by block above
        this.addMarkupDiff(markupChanges, change, content);
      }
    }
    return markupChanges;
  },
  addMarkupDiff: function(diff, change, text) {
    var i, item, items, len, results;
    items = this.splitCollect(text, /\s+|<[^>]+>/g);
    results = [];
    for (i = 0, len = items.length; i < len; i++) {
      item = items[i];
      results.push(diff.push([change, item]));
    }
    return results;
  },
  splitCollect: function(text, separator) {
    var collection, element, elements, i, len, sep, splittings;
    elements = text.split(separator);
    splittings = [];
    text.replace(separator, function(content) {
      return splittings.push(content);
    });
    collection = [];
    for (i = 0, len = elements.length; i < len; i++) {
      element = elements[i];
      if (element.length) {
        collection.push(element);
      }
      sep = splittings.shift();
      if (sep != null) {
        collection.push(sep);
      }
    }
    return collection;
  },
  // private
  // Complete broken tags in diff parts
  tagStart: /<[\w\/]*$/,
  tagEnd: /^[\/\w]*>/,
  completeTags: function(markupDiff) {
    var change, content, i, index, len, result, results;
    results = [];
    for (index = i = 0, len = markupDiff.length; i < len; index = ++i) {
      [change, content] = markupDiff[index];
      if (change === DIFF_EQUAL) {
        if (result = content.match(this.tagStart)) {
          markupDiff[index][1] = content.replace(this.tagStart, '');
          this.placeTagStart(result[0], markupDiff, index + 1);
        }
        if (result = content.match(this.tagEnd)) {
          markupDiff[index][1] = content.replace(this.tagEnd, '');
          results.push(this.placeTagEnd(result[0], markupDiff, index - 1));
        } else {
          results.push(void 0);
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  },
  placeTagStart: function(tagStart, diff, position) {
    var change, negate, newTag, nextEnd, passOnProblem, ref, res, results, tagEnd;
    results = [];
    while ((diff[position] != null) && ((ref = diff[position]) != null ? ref[0] : void 0) !== DIFF_EQUAL) {
      if (tagEnd = diff[position][1].match(this.tagEnd)) {
        //console.log "#{tagStart}#{diff[position][1]}"
        diff[position][1] = `${tagStart}${diff[position][1]}`;
        if (res = diff[position][1].match(this.tagStart)) {
          // passing on problem, another equal may be missing this start
          if (res[0] !== tagStart) {
            if ((diff[position + 1] != null) && (nextEnd = diff[position + 1][1].match(this.tagEnd))) {
              //console.log tagEnd[0], nextEnd[0]
              if (tagEnd[0] === nextEnd[0]) {
                //console.log "shift left problem #{tagEnd[0]}"
                newTag = `${tagStart}${tagEnd[0]}`;
                diff[position - 1][1] = `${diff[position - 1][1]}${newTag}`;
                diff[position][1] = diff[position][1].substr(newTag.length);
              }
            }
          }
        }
      } else {
        //console.log "duplication problem"
        if ((diff[position + 1] != null) && (nextEnd = diff[position + 1][1].match(this.tagEnd))) {
          change = diff[position];
          change[1] = `${tagStart}${diff[position][1]}${nextEnd[0]}`;
          negate = [diff[position][0] * -1, `${tagStart}${nextEnd[0]}`];
          //@consoleDiff [change, negate]
          diff.splice(position, 0, negate[0] === DIFF_DELETE ? negate : change);
          position++;
          diff[position] = change[0] === DIFF_DELETE ? negate : change;
          diff[position + 1][1] = diff[position + 1][1].replace(this.tagEnd, '');
          passOnProblem = false;
        }
      }
      results.push(position++);
    }
    return results;
  },
  placeTagEnd: function(tagEnd, diff, position) {
    var ref, results;
    results = [];
    //console.log "placeTagEnd", tagEnd
    while ((diff[position] != null) && ((ref = diff[position]) != null ? ref[0] : void 0) !== DIFF_EQUAL) {
      if (diff[position][1].match(this.tagStart)) {
        diff[position][1] = `${diff[position][1]}${tagEnd}`;
      }
      results.push(position--);
    }
    return results;
  },
  // private method
  // grab all plain text from a piece of HTML, separate all words
  // with a single space and strip the leading and trailing spaces
  sanitizePlainText: function(text) {
    var plainText;
    plainText = $(`<div>${text.replace(/>/g, "> ")}</div>`).text();
    return plainText = this.sanitizeSpaces(plainText);
  },
  sanitizeSpaces: function(plainText) {
    return plainText = plainText.replace(/\s+/g, " ").replace(/^\s*/, "").replace(/\s*$/, "");
  },
  htmlText: function(text) {
    var plainText;
    plainText = $(`<div>${text.replace(/>/g, "> ")}</div>`).text();
    return $("<div>").text(plainText).html();
  },
  formatDiff: function(diff) {
    var change, html, i, len, text;
    html = [];
    for (i = 0, len = diff.length; i < len; i++) {
      [change, text] = diff[i];
      switch (change) {
        case DIFF_INSERT:
          html.push(`<ins>${text}</ins>`);
          break;
        case DIFF_DELETE:
          html.push(`<del>${text}</del>`);
          break;
        case DIFF_EQUAL:
          html.push(text);
      }
    }
    return html.join('');
  },
  aggregateDiff: function(diff) {
    var aggregatedDiff, change, content, i, index, lastChange, lastChangePos, lastChangeType, lastContent, lastPos, len, previousChangeType, previousContent, spaces;
    aggregatedDiff = [diff[0]];
    spaces = [];
    lastChangeType = aggregatedDiff[0][0];
    for (index = i = 0, len = diff.length; i < len; index = ++i) {
      [change, content] = diff[index];
      if (!(index > 0)) {
        continue;
      }
      lastPos = aggregatedDiff.length - 1;
      [lastChange, lastContent] = aggregatedDiff[lastPos];
      if (change === lastChange) {
        aggregatedDiff[lastPos][1] = lastContent.concat(content);
      } else {
        lastChangePos = aggregatedDiff.length - 2;
        if (lastChangePos >= 0) {
          [previousChangeType, previousContent] = aggregatedDiff[lastChangePos];
          if ((previousChangeType === change) && (lastChange === DIFF_EQUAL) && (lastContent.match(/^\s*$/))) {
            aggregatedDiff[lastChangePos][1] = previousContent.concat(lastContent).concat(content);
            aggregatedDiff.pop();
          } else {
            aggregatedDiff.push([change, content]);
          }
        } else {
          aggregatedDiff.push([change, content]);
        }
      }
    }
    return aggregatedDiff;
  },
  fixEntities: function(text) {
    return $(`<div>${text}</div>`).html();
  },
  consoleDiff: function(diff) {
    var change, items, sign, text;
    if (typeof console === "undefined" || console === null) {
      return;
    }
    items = (function() {
      var i, len, ref, results;
      ref = _.clone(diff);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        [change, text] = ref[i];
        sign = "";
        if (change === DIFF_INSERT) {
          sign = "+";
        }
        if (change === DIFF_DELETE) {
          sign = "-";
        }
        results.push(`${sign}${text}`);
      }
      return results;
    })();
    return console.log(items);
  },
  filterRemovedSpaces: function(diff) {
    var filtered;
    return filtered = _.select(diff, function([change, content]) {
      if (change === DIFF_DELETE && content.match(/^\s+$/)) {
        return false;
      } else {
        return true;
      }
    });
  }
};
