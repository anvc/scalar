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

window.scalarvis = { instanceCount: -1 };

(function($) {

  $.scalarvis = function(el, options) {

    // To avoid scope issues, use 'base' instead of 'this'
    // to reference this class from internal events and functions.
    var base = this;

    // Access to jQuery and DOM versions of element
    base.$el = $(el);
    base.el = el;

    base.visStarted = false;
    base.resultsPerPage = 50;
    base.loadedAllContent = false;
    base.inspectorVisible = false;
    base.canonicalTypeOrder = ["path", "page", "comment", "tag", "annotation", "media"];
    base.canonicalRelationOrder = [
      { type: 'path', direction: 'outgoing' },
      { type: 'path', direction: 'incoming' },
      { type: 'tag', direction: 'outgoing' },
      { type: 'tag', direction: 'incoming' },
      { type: 'annotation', direction: 'outgoing' },
      { type: 'annotation', direction: 'incoming' },
      { type: 'reference', direction: 'outgoing' },
      { type: 'reference', direction: 'incoming' },
      { type: 'comment', direction: 'outgoing' },
      { type: 'comment', direction: 'incoming' }
    ];
    base.neutralColor = "#dddddd";
    base.VisualizationTypes = {
      'force-directed': 'Force-directed',
      'grid': 'Grid',
      'list': 'List',
      'map': 'Map',
      'radial': 'Radial',
      'tree': 'Tree',
      'word-cloud': 'Word cloud'
    }
    base.VisualizationContent = {
      "all-content": "All content",
      "table-of-contents": "Table of contents",
      "page": "All pages",
      "path": "All paths",
      "tag": "All tags",
      "annotation": "All annotations",
      "media": "All media",
      "reply": "All comments",
      "current": "Current page"
    }
    base.VisualizationFilters = {
      'none': 'and nothing else',
      'any-relationship': 'and any related item',
      'parent': 'and their parents',
      'child': 'and their children'
    }
    base.VisualizationSorts = {
      'none': 'Select a sort...',
      'alphabetical': 'A-Z',
      'creation-date': 'Date created',
      'edit-date': 'Date last modified',
      'type': 'Item type',
      'relationship-count': 'Relationship count',
      'visit-date': 'Visit date'
    }
    base.popoverTemplate = '<div class="popover vis-help caption_font" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>';
    base.currentNode = scalarapi.model.getCurrentPageNode();
    base.modalIsOpen = false;
    base.instanceId = 'scalarvis-' + window.scalarvis.instanceCount++;
    base.selectedNodes = [];

    // one-time setup
    base.init = function() {

      // replace undefined options with defaults...
      base.setOptions($.extend({}, $.scalarvis.defaultOptions, options));

      if (base.currentNode != null) {
        base.processNode(base.currentNode);
      }

      // if we're booting the vis up in a modal, then
      if (base.options.modal) {

        // create the modal elements around the core vis element
        base.$el.addClass('modal fade');
        base.$el.attr({
          'tabindex': '-1',
          'role': 'dialog',
          'aria-labelledby': 'vis-modal-title'
        });
        base.$el.append('<div class="modal-dialog modal-lg modal-xlg"><div class="modal-content index_modal"></div></div>');
        var modalContent = base.$el.find('.modal-content');
        var header = $('<header class="modal-header"><h2 id="vis-modal-title" class="modal-title heading_font heading_weight">Visualization</h2><button tabindex="10000" type="button" title="Close" class="close" data-dismiss="modal"><span>Close</span></button></header>').appendTo(modalContent);
        var body = $('<div class="modal-body"></div>').appendTo(modalContent);
        base.visElement = $('<div class="modalVisualization"></div>').appendTo(body);

        // when the modal is hidden, pause loading and drawing
        base.$el.on('hide.bs.modal', function() {
          if (base.force != null) {
            base.force.stop();
          }
          $('body').trigger('closeModalVis');
          base.visInstance = null;
          base.pause();
          base.modalIsOpen = false;
        });

        // when the modal is shown, redraw the visualization
        base.$el.on('shown.bs.modal', function() {
          base.draw();
          base.modalIsOpen = true;
        });

        // adjust overflow so the modal hides correctly
        base.$el.on('hidden.bs.modal', function() {
          $('body').css('overflowY', 'auto');
        });

        // otherwise, if the vis is embedded directly in the page
      } else {

        base.visElement = base.$el;

        // redraw non-modal vis whenever a modal vis is closed so coordinates get reset on the nodes
        $('body').on('closeModalVis', function() { base.draw(); });

      }

      // inform all instances that content has finished loading
      $('body').on('visLoadedAllContent', function() { base.loadedAllContent = true; });

      // add a reverse reference to the DOM object
      base.visElement.data("scalarvis", base);

      // other setup goes here

      // build global markup
      base.visElement.addClass('caption_font');

      var container = $('<div class="container-fluid"><div class="row" style="max-width: 75%;"></div></div>').appendTo(base.visElement);

      // create loading message
      base.loadingMsg = $('<div class="loadingMsg"><p>Loading data...</p></div>').appendTo(container.find('.row'));
      if (base.options.modal) {
        base.loadingMsg.addClass('bounded'); // removes left page margin padding
      }
      base.progressBar = $('<div class="progress"><div class="progress-bar" role="progressbar" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100" style="width: 10%;"><span class="sr-only">10% complete</span></div></div>').prependTo(base.loadingMsg);

      // only modal visualizations get the controls
      if (base.options.modal) {

        base.controls = $('<div class="vis-controls form-inline form-group-sm"></div>').appendTo(base.visElement);

        var controls_html = '<div id="vis-type-label" class="vis-control-header"><b>Type</b></br><select aria-labelledby="vis-type-label" class="vis-type-control form-control">';
        for (var prop in base.VisualizationTypes) {
          controls_html += '<option value="' + prop + '">' + base.VisualizationTypes[prop] + '</option>';
        }
        controls_html += '</select></div> ' +
          '<div id="vis-content-label" class="vis-control-header"><b>Content</b></br><select aria-labelledby="vis-content-label" class="vis-content-control form-control">';
        for (var prop in base.VisualizationContent) {
          controls_html += '<option value="' + prop + '">' + base.VisualizationContent[prop] + '</option>';
        }
        controls_html += '</select> ' +
          '<select aria-labelledby="vis-content-label" class="vis-filter-control form-control">';
        for (var prop in base.VisualizationFilters) {
          controls_html += '<option value="' + prop + '">' + base.VisualizationFilters[prop] + '</option>';
        }
        controls_html += '</select></div> ' +
          '<div id="vis-sort-label" class="vis-control-header"><b>Sort</b></br><select aria-labelledby="vis-sort-label" class="vis-sort-control form-control">';
        for (var prop in base.VisualizationSorts) {
          controls_html += '<option value="' + prop + '">' + base.VisualizationSorts[prop] + '</option>';
        }
        controls_html += '</select> ' +
          '<select aria-labelledby="vis-sort-label" class="vis-sort-order-control form-control">' +
          '<option value="none">Select order...</option>' +
          '<option value="ascending">ascending</option>' +
          '<option value="descending">descending</option>' +
          '</select></div>'

        base.controls.append(controls_html);

        base.visElement.find(".vis-type-control").on('change', base.onTypeSelect);
        base.visElement.find(".vis-content-control").on('change', base.onContentSelect);
        base.visElement.find(".vis-filter-control").on('change', base.onFilterSelect);
        base.visElement.find(".vis-sort-control").on('change', base.onSortSelect);
        base.visElement.find(".vis-sort-order-control").on('change', base.onSortOrderSelect);

        base.updateControls();
      }


      // create visualization div
      base.visualization = $('<div id="' + base.instanceId + '" class="scalarvis"></div>').appendTo(base.visElement);
      if (!base.isVisOfCurrentPage()) {
        base.visualization.css('padding', '0');
      }

      base.abstractedNodesBySlug = {};

      base.inspector = $('<div class="vis_inspector hidden"></div>').appendTo(base.visElement);

      // footer
      var visFooter = $('<div class="vis_footer"></div>').appendTo(base.visElement);
      if (options.modal) {
        visFooter.css('text-align', 'center');
      }

      if (options.caption) {
        visFooter.append($(options.caption));
        visFooter.css('text-align', 'left');
      }

      // help popover
      base.helpButton = $('<button tabindex class="btn btn-link btn-xs" data-toggle="popover" data-placement="top">About this visualization</button>');
      visFooter.append(base.helpButton);
      base.helpButton.popover({
        trigger: "hover click",
        html: true,
        template: base.popoverTemplate
      });

      // legend popover
      let format = base.getFormat();
      if (format != "tagcloud" && format != "list" && format != "word-cloud") {
        visFooter.append(' | ');
        base.legendButton = $('<button tabindex class="btn btn-link btn-xs" data-toggle="popover" data-placement="top" >Legend</button>');
        visFooter.append(base.legendButton);
        var type, color, name,
          legendMarkup = "";
        n = base.canonicalTypeOrder.length;
        for (i = 0; i < n; i++) {
          type = base.canonicalTypeOrder[i];
          color = base.highlightColorScale(type);
          name = scalarapi.model.scalarTypes[type].plural;
          name = name.charAt(0).toUpperCase() + name.slice(1)
          legendMarkup += '<span style="color:' + color + ';">&#9632;</span> ' + name + '<br>';
        }
        legendMarkup += '<br><div>Since content can have more than one type, a given item may change colors depending on context.</div>';
        base.legendButton.attr("data-content", legendMarkup);
        base.legendButton.popover({
          trigger: "hover click",
          template: base.popoverTemplate,
          html: true
        }).on('shown.bs.popover', function() {
          // It seems that the popover's html insert no longer preserves HTML attributes, so overwriting here to bring back colors ~Craig
          var html = $(this).attr('data-content');
          base.legendButton.next().find('.popover-content').html(html);
        });
      }

      if (!isMobile) {
        base.inspectorSpan = $('<span> | </span>').appendTo(visFooter);
        base.inspectorButton = $('<button tabindex class="btn btn-link btn-xs">Inspector</button>').appendTo(base.inspectorSpan);
        base.inspectorButton.on('click', base.toggleInspector);

        visFooter.append(' | ');
        base.fullScreenButton = $('<button tabindex class="btn btn-link btn-xs"><img style="margin-top: -1px;" src="' + modules_uri + '/cantaloupe/images/fs_icon@2x.png" width="15" height="12" alt=""/> Full screen</button>');
        visFooter.append(base.fullScreenButton);
        base.fullScreenButton.on('click', base.enterFullScreen);
      }

      // if we're not in a modal, then start immediately
      if (!base.options.modal) {
        base.deriveRelationsFromContent(base.options.content);
        base.visualize();
      }

      $('body').on('delayedResize', function() {
        if (((base.options.modal && base.modalIsOpen) || !base.options.modal) && (base.getFormat() != "tagcloud")) {
          base.visualize(true);
        }
      });

    };

    base.toggleInspector = function() {
      if (!isMobile) {
        base.inspectorVisible = !base.inspectorVisible;
        if (base.inspectorVisible) {
          base.inspector.removeClass('hidden');
        } else {
          base.inspector.addClass('hidden');
        }
        if (!base.visStarted) {
          base.visualize();
        } else {
          base.filter();
          base.draw();
        }
      }
    }

    base.updateInspector = function() {
      if (!isMobile) {
        let visWidth = base.visElement.width();
        if ((visWidth <= 700 && visWidth != 0) || base.getFormat() == 'word-cloud') {
          if (base.inspectorVisible) {
            base.toggleInspector();
          }
          base.inspectorSpan.hide();
        } else {
          base.inspectorSpan.show();
        }
        base.inspector.empty();
        if (base.selectedNodes.length > 0) {
          let node = base.selectedNodes[base.selectedNodes.length - 1];
          base.addInspectorInfoForNode(node);
        } else {
          base.inspector.append('<p>No items selected.</p>');
        }
      }
    }

    base.addInspectorInfoForNode = function(node) {
      if (node) {
        base.inspector.append('<h3 class="inspector-title heading_weight">' + node.title + '</h3>');
        let inspectorInfo;
        if (node.scalarTypes.page != null) {
          inspectorInfo = $('<div class="page-preview">' +
            '<p class="inspector-description"></p>' +
            '<div class="inspector-buttons">' +
            '<a class="btn btn-primary btn-xs view-node-btn" role="button" target="_blank" href="' + node.url + '">View page</a> ' +
            '</div>' +
            '<h4>Details</h4>' +
            '<div class="citations citations_metadata"></div>' +
            '</div>').appendTo(base.inspector);
        } else {
          let thumbnailClass = 'inspector-thumbnail';
          let thumbnailUrl = '#';
          if (node.thumbnail) {
            thumbnailUrl = node.thumbnail;
          } else {
            thumbnailClass += ' hidden';
          }
          inspectorInfo = $('<div class="media-preview">' +
            '<p class="inspector-description"></p>' +
            '<img class="' + thumbnailClass + '" src="' + thumbnailUrl + '" alt="' + node.current.getAltTextWithFallback() + '" />' +
            '<div class="inspector-buttons">' +
            '<a class="btn btn-primary btn-xs view-node-btn" role="button" target="_blank" href="' + node.url + '">View media page</a> ' +
            '<a class="btn btn-primary btn-xs view-media-btn" role="button" target="_blank" href="' + node.current.sourceFile + '">View source file</a>' +
            '</div>' +
            '<h4>Details</h4>' +
            '<div class="citations citations_metadata"></div>' +
            '</div>').appendTo(base.inspector);
        }
        inspectorInfo.find('.inspector-description').html(node.current.description);
        addMetadataTableForNodeToElement(node, inspectorInfo.find('.citations_metadata'));
      }
    }

    base.enterFullScreen = function() {
      page.isFullScreen = true; // a hack, but if we don't do this then Safari tries to reload the media before it recieves the full screen event that tells it not to reload the media
      if ('function' == typeof (base.visualization[0].webkitRequestFullscreen)) {
        base.visualization[0].webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if ('function' == typeof (base.visualization[0].mozRequestFullScreen)) {
        base.visualization[0].mozRequestFullScreen();
      } else if ('function' == typeof (base.visualization[0].msRequestFullscreen)) {
        base.visualization[0].msRequestFullscreen();
      } else if ('function' == typeof (base.visualization[0].requestFullscreen)) {
        base.visualization[0].requestFullscreen(); // standard
      } else {
        alert('Full screen is not supported in this version of your browser. Please update your browser and try again.');
      }
    }

    base.onTypeSelect = function() {
      base.options.lens.visualization.type = $(this).val();
      // only the map vis triggers a call to re-get lens data since it needs metadata to work
      if (base.options.lens.visualization.type == 'map') {
        base.getLensResults();
      }
      base.visualize();
    }

    base.onContentSelect = function() {
      if ($(this).val() == 'current') {
        base.options.lens.components[0]['content-selector']['content-type'] = 'specific-items';
        if (base.currentNode) {
          base.options.lens.components[0]['content-selector']['items'] = [base.currentNode.slug];
        } else {
          base.options.lens.components[0]['content-selector']['items'] = [];
        }
      } else {
        base.options.lens.components[0]['content-selector']['content-type'] = $(this).val();
        delete base.options.lens.components[0]['content-selector'].items;
      }
      base.updateLensModifiers();
      base.getLensResults();
    }

    base.onFilterSelect = function() {
      base.updateLensModifiers();
      base.getLensResults();
    }

    base.onSortSelect = function() {
      base.updateSorts();
      base.getLensResults();
    }

    base.onSortOrderSelect = function() {
      base.updateSorts();
      base.getLensResults();
    }

    base.updateLensModifiers = function() {
      base.options.lens.components[0].modifiers = [];
      let filterControlVal = base.visElement.find(".vis-filter-control").val();
      if (filterControlVal != 'none') {
        let filter = {
          "type": "filter",
          "subtype": "relationship",
          "relationship": base.visElement.find(".vis-filter-control").val()
        };
        let contentControlVal = base.visElement.find(".vis-content-control").val();
        switch (contentControlVal) {

          case 'all-content':
          case 'table-of-contents':
          case 'current':
          case 'page':
            filter["content-types"] = ["all-types"];
            break;

          case 'media':
            filter["content-types"] = ["reference"];
            break;

          default:
            filter["content-types"] = [contentControlVal];
            break;

        }
        base.options.lens.components[0].modifiers.push(filter);
      }
    }

    base.updateSorts = function() {
      if (base.visElement.find(".vis-sort-control").val() != 'none') {
        if (base.visElement.find(".vis-sort-order-control").val() == 'none') {
          base.visElement.find(".vis-sort-order-control").val('ascending')
        }
        let sortOrder = base.visElement.find(".vis-sort-order-control").val();
        let sort = {
          "type": "sort",
          "sort-type": base.visElement.find(".vis-sort-control").val(),
          "sort-order": sortOrder
        };
        if (sort['sort-type'] == 'alphabetical') {
          sort['metadata-field'] = "dcterms:title";
        }
        base.options.lens.sorts = [sort];
      }
    }

    base.getLensResults = function(success) {
      base.options.lens.book_urn = 'urn:scalar:book:' + $('link#book_id').attr('href');
      let url = $('link#approot').attr('href').replace('application/', '') + 'lenses';
      base.loadingMsgShown = false;
      base.startTime = new Date();
      var percentDone = 0;
      if (base.progressInterval) clearInterval(base.progressInterval);
      base.progressInterval = setInterval(() => {
        percentDone = Math.min(90, percentDone + 10);
        base.updateLoadingMsg('', percentDone, 0, 1, null);
      }, 1000)
      if (base.lensRequest) base.lensRequest.abort();
      let requestData = JSON.parse(JSON.stringify(base.options.lens));
      delete requestData.items;
      base.lensRequest = $.ajax({
        url: url,
        type: "POST",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(requestData),
        async: true,
        context: this,
        success: (data) => {
          if ('undefined' != typeof (data.error)) {
            console.log('There was an error attempting to get Lens data: ' + data.error);
            return;
          };
          clearInterval(base.progressInterval);
          base.updateLoadingMsg('', 100, 0, 1, null);
          base.hideLoadingMsg();
          base.options.lens = data;
          scalarapi.parsePagesByType(data.items);
          if (success) {
            success(data);
          }
          if (!base.visStarted) {
            base.visualize();
          } else {
            base.filter();
            base.draw();
          }
        },
        error: function error(response) {
          console.log('There was an error attempting to communicate with the server.');
          console.log(response.responseText);
        }
      });
    }

    base.deriveRelationsFromContent = function(content) {
      switch (base.options.relations) {

        case "all":
          base.options.relations = "all";
          break;

        case "parents-children":
          if (content == "current") {
            base.options.relations = base.currentNode.type.id;
          } else if (content == "all") {
            base.options.relations = content;
          } else if (content == "toc") {
            base.options.relations = "all";
          } else {
            base.options.relations = content;
          }
          if (base.options.relations == "media") {
            base.options.relations = "reference";
          }
          break;

        case "none":
          base.options.relations = "none";
          break;

      }
    }

    base.setOptions = function(options) {
      if (options.content == "reply") {
        options.content = "comment";
      }
      base.options = options;
      if (base.controls != null) {
        if (!base.options.lens) {
          base.options.lens = base.getDefaultLens();
        }
        base.updateControls();
      }
      if (base.options.lens) {
        delete (base.options.format);
        base.options.relations = 'from-lens';
        if (!base.options.lens.items) {
          base.getLensResults();
        }
      }
    };

    base.getFormat = function() {
      if (base.options.content == 'lens') {
        return base.options.lens.visualization.type;
      } else {
        return base.options.format;
      }
    }

    base.getDefaultLens = function() {
      return {
        "urn": $('link#urn').attr('href').replace("version", "lens"),
        "submitted": false,
        "public": false,
        "frozen": false,
        "frozen-items": [],
        "visualization": {
          "type": "force-directed"
        },
        "components": [base.getDefaultLensComponent()]
      }
    }

    base.getDefaultLensComponent = function() {
      return {
        "content-selector": {
          "type": "items-by-type",
          "content-type": "all-content"
        },
        "modifiers": []
      };
    }

    base.validateLens = function() {
      if (!base.options.lens.visualization) base.options.lens.visualization = { "type": "force-directed" };
      if (!base.options.lens.visualization.type) base.options.lens.visualization.type = "force-directed";
      if (!base.options.lens.components) base.options.lens.components = [base.getDefaultLensComponent()];
      if (!base.options.lens.components[0]) base.options.lens.components = base.getDefaultLensComponent();
      if (!base.options.lens.components[0].modifiers) base.options.lens.components[0].modifiers = [];
    }

    base.isVisOfSinglePage = function() {
      if (base.options.content == 'current') {
        return true;
      } else if (base.options.content == 'lens') {
        let items = base.options.lens.components[0]["content-selector"].items;
        if (items) {
          if (base.options.lens.components[0]['content-selector'].type == 'specific-items' && items.length == 1) {
            return true;
          }
        }
      }
      return false;
    }

    base.isVisOfCurrentPage = function() {
      if (base.options.content == 'current') {
        return true;
      } else if (base.options.content == 'lens') {
        if (base.options.lens.components.length > 0) {
          let items = base.options.lens.components[0]["content-selector"].items;
          if (items) {
            if (base.options.lens.components[0]['content-selector'].type == 'specific-items' && items.length == 1) {
              if (base.currentNode) {
                if (items[0] == base.currentNode.slug) {
                  return true;
                }
              }
            }
          }
        }
      }
      return false;
    }

    base.updateControls = function() {
      if (base.options.lens) {
        base.validateLens();
        base.visElement.find(".vis-type-control").val(base.options.lens.visualization.type);
        if (base.isVisOfCurrentPage()) {
          base.visElement.find(".vis-content-control").val('current');
        } else {
          base.visElement.find(".vis-content-control").val(base.options.lens.components[0]['content-selector']['content-type']);
        }
        base.visElement.find(".vis-filter-control").val('none');
        base.visElement.find(".vis-sort-control").val('none');
        base.visElement.find(".vis-sort-order-control").val('none');
        base.options.lens.components[0].modifiers.forEach(modifier => {
          switch (modifier.type) {

            case 'filter':
              if (base.options.lens.components[0].modifiers[0]['content-types'].length == 0) {
                base.visElement.find(".vis-filter-control").val('none');
              } else {
                base.visElement.find(".vis-filter-control").val(base.options.lens.components[0].modifiers[0].relationship);
              }
              break;

          }
        });
        if (base.options.lens.sorts) {
          if (base.options.lens.sorts.length > 0) {
            let sort = base.options.lens.sorts[0];
            base.visElement.find(".vis-sort-control").val(sort['sort-type']);
            base.visElement.find(".vis-sort-order-control").val(sort['sort-order']);
          } else {
            base.visElement.find(".vis-sort-control").val('none');
            base.visElement.find(".vis-sort-order-control").val('none');
          }
        }
      }
    }

    // color scheme generated at http://colorbrewer2.org
    base.highlightColorScale = function(d, t, n) {

      if (t == null) {
        t = "noun";
      }

      if (n == null) {
        n = this.neutralColor;
      }

      // base colors
      var color;
      switch (d) {

        case "page":
          color = "#ff7f00";
          break;

        case "path":
          color = "#377eb8";
          break;

        case "comment":
        case "reply":
          var componentToHex = function(c) {
            var hex = Math.round(c).toString(16);
            return hex.length == 1 ? "0" + hex : hex;
          }
          color = d3.rgb("#ffff33").darker();
          color = "#" + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
          break;

        case "annotation":
          color = "#984ea3";
          break;

        case "tag":
          color = "#e41a1c";
          break;

        case "media":
        case "reference":
          color = "#4daf4a";
          break;

        default:
          color = n;
          break;

      }

      // "noun" colors are used to describe what things are, "verb" colors
      // are used to types of relationships between things. Not all content
      // types (i.e. "nouns") have corresponding relationship types ("verbs"),
      // so we mute them to gray if the verb form is what we care about.
      // "Path" describes both an item and a relationship; "page" does not.
      switch (t) {

        // pass through the noun color
        case "noun":
          return color;
          break;

        // pass through only selected noun colors, neutralize the others
        case "verb":
          switch (d) {

            case "path":
            case "comment":
            case "annotation":
            case "tag":
            case "reference":
              return color;
              break;

            default:
              return n;
              break;

          }
          break;

      }

    }

    base.linkIsBeingInteractedWith = function(link) {
      return ((base.rolloverNode == link.source.node) ||
        (base.selectedNodes.indexOf(link.source.node) != -1) ||
        (base.rolloverNode == link.target.node) ||
        (base.selectedNodes.indexOf(link.target.node) != -1));
    }

    // pop-up that shows information about the selected node
    base.nodeInfoBox = function(d) {

      var i, n, description, relatedNodes, itemCount, itemName, itemType, type, direction, relationType;

      var str = '<div class="arrow"></div><div class="content"><p><strong>';
      str += d.getDisplayTitle(true);
      str += '</strong></p>';

      n = base.canonicalRelationOrder.length;
      for (i = 0; i < n; i++) {
        type = base.canonicalRelationOrder[i].type;
        direction = base.canonicalRelationOrder[i].direction;
        (direction == 'incoming') ? itemType = 'body' : itemType = 'target';
        relationType = scalarapi.model.relationTypes[type];
        description = relationType[direction];
        relatedNodes = d.getRelatedNodes(type, direction);
        itemCount = relatedNodes.length;
        (itemCount > 1) ? itemName = relationType[itemType + 'Plural'] : itemName = relationType[itemType];
        if (itemCount > 0) str += '<p style="color:' + d3.rgb(base.neutralColor).brighter(1.5) + ';">' + description + ' ' + itemCount + ' ' + itemName + '</p>';
      }

      if (base.rolloverNode != null) {
        if ((base.rolloverNode.url != d.url) || (base.selectedNodes.indexOf(d) != -1) || isMobile) {
          str += '<a href="' + d.url + '" target="_blank" class="btn btn-primary btn-xs" role="button">Visit &raquo;</a>';
        }
      } else {
        str += '<a href="' + d.url + '" target="_blank" class="btn btn-primary btn-xs" role="button">Visit &raquo;</a>';
      }

      str += '</div></div>';

      return str;
    }

    // Source: https://github.com/Caged/d3-tip
    // Gets the screen coordinates of a shape
    //
    // Given a shape on the screen, will return an SVGPoint for the directions
    // n(north), s(south), e(east), w(west), ne(northeast), se(southeast), nw(northwest),
    // sw(southwest).
    //
    //    +-+-+
    //    |   |
    //    +   +
    //    |   |
    //    +-+-+
    //
    // Returns an Object {n, s, e, w, nw, sw, ne, se}
    base.getScreenBBox = function(target) {

      var targetel = target /*|| d3.event.target*/;

      while ('undefined' === typeof targetel.getScreenCTM && 'undefined' === targetel.parentNode) {
        targetel = targetel.parentNode;
      }

      var svg = base.getSVGNode(base.svg)
      var point = svg.createSVGPoint()

      var bbox = {},
        matrix = targetel.getScreenCTM(),
        //tbbox = targetel.getBBox(),
        tbbox = targetel.getBoundingClientRect(),
        width = tbbox.width,
        height = tbbox.height,
        x = tbbox.left,
        y = tbbox.top;

      point.x = x;
      point.y = y;
      bbox.nw = point.matrixTransform(matrix);
      point.x += width;
      bbox.ne = point.matrixTransform(matrix);
      point.y += height;
      bbox.se = point.matrixTransform(matrix);
      point.x -= width;
      bbox.sw = point.matrixTransform(matrix);
      point.y -= height / 2;
      bbox.w = point.matrixTransform(matrix);
      point.x += width;
      bbox.e = point.matrixTransform(matrix);
      point.x -= width / 2;
      point.y -= height / 2;
      bbox.n = point.matrixTransform(matrix);
      point.y += height;
      bbox.s = point.matrixTransform(matrix);

      bbox.bbox = tbbox;

      //console.log( tbbox );

      return bbox;
    }

    // Source: https://github.com/Caged/d3-tip
    base.getSVGNode = function(el) {
      el = el.node();
      if (el.tagName.toLowerCase() === 'svg') {
        return el;
      }
      return el.ownerSVGElement;
    }

    // boots/reboots the visualization with the current options
    base.visualize = function(preserveExistingNodes = false) {

      if (!preserveExistingNodes) base.clear();

      base.loadIndex = -1;
      base.loadingPaused = false;
      base.loadingDone = false;
      base.drawingPaused = false;
      base.visStarted = true;
      base.pageIndex = 0;
      base.reachedLastPage = true;
      base.typeCounts = {};
      base.maxNodesPerType = 0;
      base.startTime = new Date();
      base.loadingMsgShown = false;
      if (!preserveExistingNodes) {
        base.contentNodes = [];
        base.activeNodes = [];
        base.manuallyLoadedNodes = [];
        base.relatedNodes = [];
        base.relations = [];
        base.sortedNodes = [];
        base.visInstance = null;
      }
      base.rolloverNode = null;
      base.links = [];
      base.linksBySlug = {};
      base.nodesBySlug = {};
      if (base.currentNode && base.currentNode.type.id != 'lens') {
        base.selectedNodes.push(base.currentNode);
        base.loadNode(base.currentNode.slug, 0, 0, base.updateInspector, true, false);
        base.updateInspector();
      }
      base.hasBeenDrawn = false;
      base.loadSequence = null;
      base.maxConnections = 0;
      base.hierarchy = null;
      base.selectedHierarchyNodes = null;
      base.processedNodesForHierarchy = [];

      base.visualization.css('height', '');

      if (base.options.modal) {
        base.visualization.removeClass('bounded');
        base.visElement.find('.loadingMsg').addClass('bounded');
        base.visElement.find('.vis_footer').addClass('bounded');

      } else if (base.options.widget) {
        base.visElement.addClass('vis_widget');
      } else {
        base.visElement.addClass('page_margins');
      }

      if (!base.loadedAllContent) {
        base.buildLoadSequence();
        if (base.loadSequence.length > 0) {
          base.loadNextData();
        } else {
          base.loadingDone = true;
          base.draw(true);
        }
      } else {
        base.loadingDone = true;
        base.filter();
        setTimeout(function() { base.draw(true); }, 0);
      }

    };

    // figures out what data to load based on current options
    base.buildLoadSequence = function() {

      var i, n, nodes, node;

      base.loadSequence = [];

      switch (base.options.content) {

        case "all":
        case "toc":
          base.loadSequence.push({ id: 'book', desc: "book", relations: 'none' });
          base.loadSequence.push({ id: 'current', desc: "current page", relations: 'none' });
          base.loadSequence.push({ id: 'current', desc: "current page's connections", relations: 'all' });
          base.loadSequence.push({ id: 'path', desc: "paths", relations: 'path' });
          base.loadSequence.push({ id: 'tag', desc: "tags", relations: 'tag' });
          base.loadSequence.push({ id: 'media', desc: "media", relations: 'reference' });
          base.loadSequence.push({ id: 'page', desc: "pages", relations: 'none' });
          base.loadSequence.push({ id: 'annotation', desc: "annotations", relations: 'annotation' });
          base.loadSequence.push({ id: 'reply', desc: "comments", relations: 'reply' });
          break;

        case "lens":
          base.filter();
          base.draw();
          break;

        case "current":
          base.loadSequence.push({ id: 'current', desc: "current page", relations: base.options.relations });
          break;

        case "page":
        case "path":
        case "tag":
        case "media":
        case "annotation":
          base.loadSequence.push({ id: base.options.content, desc: scalarapi.model.scalarTypes[base.options.content].plural, relations: base.options.relations });
          break;

        case "comment":
          base.loadSequence.push({ id: "reply", desc: scalarapi.model.scalarTypes[base.options.content].plural, relations: base.options.relations });
          break;

      }

    };

    base.loadNode = function(slug, ref, depth, success = null, parseNode = true, addToManuallyLoadedNodes = true) {
      if (depth == null) {
        depth = 1;
      }
      scalarapi.loadNode(slug, true, function(d) {
        if (success) success(d);
        // only add related nodes to those manually loaded if the user
        // actually requested the load by clicking on a node
        if (addToManuallyLoadedNodes) {
          let node = scalarapi.getNode(slug);
          base.manuallyLoadedNodes = base.manuallyLoadedNodes.concat(node.getRelatedNodes(null, 'both'));
        }
        if (parseNode) base.parseNode(d);
      }, null, depth, ref, null, 0, 100, null, null, true);
    }

    base.removeRelatedNodesFromManuallyLoaded = function(node, lineage = []) {
      let relatedNodes = node.getRelatedNodes(null, 'both');
      let removedNodes = [];
      relatedNodes.forEach(node => {
        if (base.selectedNodes.indexOf(node) == -1 && base.contentNodes.indexOf(node) == -1 && lineage.indexOf(node) == -1) {
          let index = base.manuallyLoadedNodes.indexOf(node);
          if (index != -1) {
            removedNodes.push(node);
            base.manuallyLoadedNodes.splice(index, 1);
          }
        }
      });
      lineage.push(node);
      removedNodes.forEach(node => base.removeRelatedNodesFromManuallyLoaded(node, lineage));
      base.parseNode(node);
    }

    base.parseNode = function(data) {
      base.filter();
      base.draw(true);
    }

    // pauses loading and drawing
    base.pause = function() {
      base.loadingPaused = !base.loadingDone;
      base.drawingPaused = true;
    };

    // resumes loading and drawing
    base.resume = function() {
      base.drawingPaused = false;
      if (base.loadingPaused) {
        base.loadingPaused = false;
        base.loadNextData();
      }
    };

    // shows a modal containing the visualization of the given type
    base.showModal = function(options) {

      // enforce modal
      options.modal = true;

      // if the vis has never been started or if any options have changed, then start it
      if (!base.visStarted || ((base.options.content != options.content) || (base.options.relations != options.relations) || (base.options.format != options.format) || base.options.lens != options.lens)) {
        base.setOptions($.extend({}, base.options, options));
        base.visualize();

        // otherwise, resume it
      } else {
        base.resume();
      }

      base.$el.modal();

    }

    base.loadNextData = function() {

      // if we've reached the last page of the current content type, increment/reset the counters
      if (base.reachedLastPage) {
        base.loadIndex++;
        base.pageIndex = 0;
        base.reachedLastPage = false;

        // otherwise, just increment the page counter
      } else {
        base.pageIndex++;
      }

      var url, result, start, end, loadInstruction, forceReload, depth, references, relations;

      // if we still have more data to load, then load it
      if (base.loadIndex < base.loadSequence.length) {

        loadInstruction = base.loadSequence[base.loadIndex];

        switch (loadInstruction.id) {

          case 'book':
            base.reachedLastPage = true;
            result = scalarapi.loadBook(false, base.parseData, null);
            start = end = -1;
            break;

          case 'current':
            if (loadInstruction.relations == 'none') {
              forceReload = false;
              depth = 0;
              references = false;
              relations = null;
            } else {
              forceReload = true;
              depth = 2;
              references = (loadInstruction.relations == 'reference');
              if (loadInstruction.relations == 'all') {
                relations = null;
              } else {
                relations = loadInstruction.relations;
              }
            }
            base.reachedLastPage = true;
            start = end = -1;
            result = scalarapi.loadCurrentPage(forceReload, base.parseData, null, depth, references, relations, false);
            break;

          case 'toc':
            if (loadInstruction.relations == 'none') {
              forceReload = false;
              depth = 0;
              references = false;
              relations = null;
            } else {
              forceReload = true;
              depth = 1;
              references = (loadInstruction.relations == 'reference');
              if (loadInstruction.relations == 'all') {
                relations = null;
              } else {
                relations = loadInstruction.relations;
              }
            }
            start = (this.pageIndex * this.resultsPerPage);
            end = start + this.resultsPerPage;
            result = scalarapi.loadPage(loadInstruction.node.slug, forceReload, base.parseData, null, depth, references, relations, start, base.resultsPerPage, null, null, false);
            break;

          default:
            if (loadInstruction.relations == 'none') {
              depth = 1;
              references = false;
              relations = null;
            } else {
              depth = 1;
              references = ((loadInstruction.relations == 'reference') || (loadInstruction.relations == 'all'));
              if (loadInstruction.relations == 'all') {
                relations = null;
              } else {
                relations = loadInstruction.relations;
              }
            }
            start = (this.pageIndex * this.resultsPerPage);
            end = start + this.resultsPerPage;
            result = scalarapi.loadPagesByType(loadInstruction.id, true, base.parseData, null, depth, references, relations, start, base.resultsPerPage, false, false);
            break;
        }

        console.log("load next data: " + loadInstruction.id + ' ' + start + ' ' + end);

        base.updateLoadingMsg(
          loadInstruction.desc,
          ((base.loadIndex + 1) / (base.loadSequence.length + 1)) * 100,
          (start == -1) ? -1 : start + 1,
          end,
          base.typeCounts[loadInstruction.id]
        );

        if (result == 'loaded') {
          base.parseData();
        }

        // otherwise, hide the loading message
      } else {
        base.hideLoadingMsg();
        base.loadingDone = true;
        base.draw(true);
        if (base.shouldLoadAllContent()) {
          base.loadedAllContent = true;
          $('body').trigger('visLoadedAllContent');
        }
      }
      base.visElement.find(".vis-format-control").val(base.getFormat());
    }

    base.shouldLoadAllContent = function() {
      // when content is set to 'toc', we still load everything so users can drill down as far as they want
      if (base.options.content == 'all' || base.options.content == 'toc') {
        return true;
      } else if (base.options.content == 'lens') {
        if (lens.components[0]['content-selector']['content-type'] == 'table-of-contents') {
          return true;
        }
      }
      return false;
    }

    base.parseData = function(json) {

      if (jQuery.isEmptyObject(json) || (json == null)) {
        base.reachedLastPage = true;
      }

      if ((base.getFormat() == "force-directed") && (base.force != null)) {
        base.force.stop();
      }

      var loadInstruction = base.loadSequence[base.loadIndex];

      if (loadInstruction != null) {

        var typedNodes = scalarapi.model.getNodesWithProperty('scalarType', loadInstruction.id);
        base.maxNodesPerType = Math.max(base.maxNodesPerType, typedNodes.length);

        // attempt to find the total count of the current item type as returned in the data
        var i, n, count, citation, tempA, tempB;
        for (var prop in json) {
          citation = json[prop]["http://scalar.usc.edu/2012/01/scalar-ns#citation"];
          if (citation != null) {
            tempA = citation[0].value.split(";");
            n = tempA.length;
            for (i = 0; i < n; i++) {
              if (tempA[i].indexOf("methodNumNodes=") == 0) {
                tempB = tempA[i].split("=");
                count = parseInt(tempB[tempB.length - 1]);
                break;
              }
            }
            break;
          }
        }

        // if a count was found, store it
        if (count != null) {
          base.typeCounts[loadInstruction.id] = count;

          // if the count is less than the point at which we'd start our next load, then
          // we've reached the last page of data for this item type
          //if ( count < (( base.pageIndex + 1 ) * base.resultsPerPage )) {

          // 'methodNumNodes' (count) decreases in each consecutive API call... it's the
          // number of nodes remaining (current call nodes inclusive) rather than the total
          // number of nodes across all API calls of a particular type ~Craig
          if (count < base.resultsPerPage) {
            base.reachedLastPage = true;
          }
        }

        // redraw the view
        base.filter();
        base.draw();

        // get next chunk of data
        if (!base.loadingPaused) {
          base.loadNextData();
        }

      }

      if ((base.getFormat() == "force-directed") && (base.force != null)) {
        base.force.start();
      }

    };

    base.showLoadingMsg = function() {
      base.loadingMsg.slideDown();
    }

    base.updateLoadingMsg = function(typeName, percentDone, start, end, total) {

      // only show the loading message if it's taking a while to load the data
      if (!base.loadingMsgShown && ((new Date().getTime() - base.startTime.getTime()) > 1000)) {
        base.showLoadingMsg();
        base.loadingMsg.show();
        base.loadingMsgShown = true;
      }

      if ((start != -1) && (total != null)) {
        //base.loadingMsg.find('p').text( 'Loading ' + typeName + ' (' + start + '/' + total + ')...' );
        base.loadingMsg.find('p').text('Loading ' + typeName + ' (' + (total - base.resultsPerPage) + ' remaining) ...');
      } else {
        base.loadingMsg.find('p').text('Loading ' + typeName + ' ...');
      }
      base.progressBar.find(".progress-bar").attr("aria-valuenow", percentDone).css("width", percentDone + "%");
      base.progressBar.find(".sr-only").text(percentDone + "% complete");

    }

    base.hideLoadingMsg = function() {
      base.loadingMsg.slideUp(400, function() { base.draw(); });
    }

		/**
		 * Returns a new string no longer than the specified amount of characters,
		 * shortening with ellipses if necessary.
		 *
		 * @param	str			The source string.
		 * @param	maxChars	Maximum string length.
		 * @return				The modified string.
		 */
    base.getShortenedString = function(str, maxChars) {
      var shortStr;
      if (str == null) {
        shortStr = '';
      } else if (str.length > maxChars) {

        var i,
          words = str.split(" "),
          n = words.length;

        shortStr = words[0];
        if (shortStr.length > maxChars) {
          shortStr = shortStr.substr(0, maxChars - 3) + '...';

        } else {
          for (i = 1; i < n; i++) {
            if ((shortStr.length + (words[i].length + 1)) > maxChars) {
              shortStr += "...";
              break;
            } else {
              shortStr += " " + words[i];
            }
          }
        }

      } else {
        shortStr = str;
      }
      return shortStr;
    }

    base.arrayUnique = function(array) {
      var a = array.concat();
      for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
          if (a[i] === a[j])
            a.splice(j--, 1);
        }
      }
      return a;
    }

    base.filter = function() {

      var i, n, node, relation, link, index, rels, relNodes, subRels, subRelNodes,
        newSortedNodes;

      base.maxConnections = 0.0;
      base.relatedNodes = [];
      base.relations = [];
      base.processedNodesForHierarchy = [];

      base.sortedNodes = [];

      // sort nodes by type, and then alphabetically
      switch (base.options.content) {

        case "all":
          base.contentNodes = [];

          // gather nodes of all types
          n = base.canonicalTypeOrder.length;
          for (i = 0; i < n; i++) {
            base.contentNodes = base.contentNodes.concat(scalarapi.model.getNodesWithProperty('scalarType', base.canonicalTypeOrder[i]));
          }
          base.contentNodes = base.arrayUnique(base.contentNodes);

          // get relationships for each node
          n = base.contentNodes.length;
          for (i = 0; i < n; i++) {
            node = base.contentNodes[i];
            rels = [];
            relNodes = [];
            if (base.options.relations == "all") {
              relNodes = node.getRelatedNodes(null, "both");
              rels = node.getRelations(null, "both");
              base.relatedNodes = base.relatedNodes.concat(relNodes);
              base.relations = base.relations.concat(rels);
            } else if (base.options.relations != "none") {
              relNodes = node.getRelatedNodes(base.options.relations, "both");
              rels = node.getRelations(base.options.relations, "both");
              base.relatedNodes = base.relatedNodes.concat(relNodes);
              base.relations = base.relations.concat(rels);
            }
            node.connectionCount = rels.length;
            base.maxConnections = Math.max(base.maxConnections, node.connectionCount);
          }
          break;

        case "lens":
          base.contentNodes = [];
          for (var url in base.options.lens.items) {
            if (scalarapi.model.nodesByURL[url] != null) {
              base.contentNodes.push(scalarapi.model.nodesByURL[url]);
            }
          }

          // get relationships for each node
          // if we're in a modal that means there will never be more than one modifier
          // this is needed since the lens doesn't return relationships
          // since we don't know which node was returned from which part of the lens,
          // we cast a wide net, possibly getting more relationships than we need
          // any extra nodes will be filtered out below
          if (base.options.modal) {
            if (base.options.lens.components[0].modifiers.length > 0) {
              n = base.contentNodes.length;
              for (i = 0; i < n; i++) {
                node = base.contentNodes[i];
                relNodes = [];
                rels = [];
                if (base.options.lens.components[0].modifiers[0].relationship == 'any-relationship') {
                  relNodes = node.getRelatedNodes(null, "both");
                  rels = node.getRelations(null, "both");
                  relNodes.forEach((relNode, index) => {
                    if (base.options.lens.items[relNode.url]) {
                      base.relatedNodes.push(relNode);
                      base.relations.push(rels[index]);
                    }
                  });
                } else {
                  relNodes = node.getRelatedNodes(base.options.lens.components[0].modifiers[0]['content-types'][0], "both");
                  rels = node.getRelations(base.options.lens.components[0].modifiers[0]['content-types'][0], "both");
                  relNodes.forEach((relNode, index) => {
                    if (base.options.lens.items[relNode.url]) {
                      base.relatedNodes.push(relNode);
                      base.relations.push(rels[index]);
                    }
                  });
                }
                node.connectionCount = rels.length;
                base.maxConnections = Math.max(base.maxConnections, node.connectionCount);
              }
            }
          } else {
            // get relationships for each node
            n = base.contentNodes.length;
            for (i = 0; i < n; i++) {
              node = base.contentNodes[i];
              relNodes = node.getRelatedNodes(null, "both");
              rels = node.getRelations(null, "both");
              base.relatedNodes = base.relatedNodes.concat(relNodes);
              base.relations = base.relations.concat(rels);
              node.connectionCount = rels.length;
              base.maxConnections = Math.max(base.maxConnections, node.connectionCount);
            }
          }

          // get relationships for each selected node that we haven't already gotten
          n = base.selectedNodes.length;
          for (i = n - 1; i >= 0; i--) {
            node = base.selectedNodes[i];
            if (base.contentNodes.indexOf(node) == -1) {
              relNodes = node.getRelatedNodes(null, "both");
              rels = node.getRelations(null, "both");
              base.relatedNodes = base.relatedNodes.concat(relNodes);
              base.relations = base.relations.concat(rels);
              node.connectionCount = rels.length;
              base.maxConnections = Math.max(base.maxConnections, node.connectionCount);
              if (base.relatedNodes.indexOf(node) == -1) {
                base.relatedNodes.push(node);
              }
            }
          }

          // filter out any related node not actually returned by the lens or requested by the user
          n = base.relatedNodes.length;
          for (i = n - 1; i >= 0; i--) {
            node = base.relatedNodes[i];
            if (base.contentNodes.indexOf(node) == -1 && base.manuallyLoadedNodes.indexOf(node) == -1) {
              base.relatedNodes.splice(i, 1);
            }
          }
          break;

        case "toc":
          base.contentNodes = [];
          relNodes = scalarapi.model.getMainMenuNode().getRelatedNodes('reference', 'outgoing', true);
          rels = scalarapi.model.getMainMenuNode().getRelations('reference', 'outgoing', true);
          base.relatedNodes = base.relatedNodes.concat(relNodes);
          base.relations = base.relations.concat(rels);
          if (base.options.relations != "none") {
            n = relNodes.length;
            for (i = 0; i < n; i++) {
              node = relNodes[i];
              subRelNodes = node.getRelatedNodes(null, "both");
              subRels = node.getRelations(null, "both");
              base.relatedNodes = base.relatedNodes.concat(subRelNodes);
              base.relations = base.relations.concat(subRels);
              node.connectionCount = subRels.length;
              base.maxConnections = Math.max(base.maxConnections, node.connectionCount);
            }
            if (n > 0) {
              node.connectionCount = base.relations.length;
              base.maxConnections = Math.max(base.maxConnections, node.connectionCount);
            }
          }
          break;

        case "current":
          base.contentNodes = [base.currentNode];

          // get relationships for the current node and any selected nodes
          if (base.options.relations == "all") {
            base.relatedNodes = base.currentNode.getRelatedNodes(null, "both");
            base.relations = base.currentNode.getRelations(null, "both");
            n = base.selectedNodes.length;
            for (i = 0; i < n; i++) {
              node = base.selectedNodes[i];
              relNodes = node.getRelatedNodes(null, "both");
              rels = node.getRelations(null, "both");
              base.relatedNodes = base.relatedNodes.concat(relNodes);
              base.relations = base.relations.concat(rels);
              node.connectionCount = rels.length;
              base.maxConnections = Math.max(base.maxConnections, node.connectionCount);
            }
          } else if (base.options.relations != "none") {
            base.relatedNodes = base.currentNode.getRelatedNodes(base.options.relations, "both");
            base.relations = base.currentNode.getRelations(base.options.relations, "both");
            n = base.selectedNodes.length;
            for (i = 0; i < n; i++) {
              node = base.selectedNodes[i];
              relNodes = node.getRelatedNodes(base.options.relations, "both");
              rels = node.getRelations(base.options.relations, "both");
              base.relatedNodes = base.relatedNodes.concat(relNodes);
              base.relations = base.relations.concat(rels);
              node.connectionCount = rels.length;
              base.maxConnections = Math.max(base.maxConnections, node.connectionCount);
            }
          }
          break;

        default:

          // get nodes of the current type
          base.contentNodes = scalarapi.model.getNodesWithProperty('scalarType', base.options.content);

          // get relationships for each node
          n = base.contentNodes.length;
          for (i = 0; i < n; i++) {
            node = base.contentNodes[i];
            relNodes = [];
            rels = [];
            if (base.options.relations == "all") {
              relNodes = node.getRelatedNodes(null, "both");
              rels = node.getRelations(null, "both");
              base.relatedNodes = base.relatedNodes.concat(relNodes);
              base.relations = base.relations.concat(rels);
            } else if (base.options.relations != "none") {
              relNodes = node.getRelatedNodes(base.options.relations, "both");
              rels = node.getRelations(base.options.relations, "both");
              base.relatedNodes = base.relatedNodes.concat(relNodes);
              base.relations = base.relations.concat(rels);
            }
            node.connectionCount = rels.length;
            base.maxConnections = Math.max(base.maxConnections, node.connectionCount);
          }
          break;

      }

      newSortedNodes = base.arrayUnique(base.contentNodes.concat(base.relatedNodes));
      oldNodes = base.sortedNodes.concat();

      n = newSortedNodes.length;
      for (i = (n - 1); i >= 0; i--) {
        node = newSortedNodes[i];
        base.processNode(node);
        index = base.sortedNodes.indexOf(node);

        // add nodes that are new to us
        if (index == -1) {
          base.sortedNodes.push(node);
          base.nodesBySlug[node.slug] = node;
          newSortedNodes.splice(i, 1);

          // keep track of nodes that aren't
        } else {
          index = oldNodes.indexOf(node);
          oldNodes.splice(index, 1);
        }
      }

      // remove any nodes which shouldn't be shown anymore
      n = oldNodes.length;
      for (i = 0; i < n; i++) {
        node = oldNodes[i];
        index = base.sortedNodes.indexOf(node);
        if (index != -1) {
          base.sortedNodes.splice(index, 1);
        }
      }

      base.abstractedSortedNodes = [];
      n = base.sortedNodes.length;
      for (i = 0; i < n; i++) {
        node = base.sortedNodes[i];
        if (base.abstractedNodesBySlug[node.slug] == null) {
          base.abstractedNodesBySlug[node.slug] = { "node": node };
        }
        base.abstractedSortedNodes[i] = base.abstractedNodesBySlug[node.slug];
      }

      base.relations = base.arrayUnique(base.relations);

      switch (base.getFormat()) {

        case "force-directed":
          base.updateLinks();
          break;

        case "radial":
          base.updateLinks();
          if (base.options.content == "toc") {
            // TODO: enable includeToc here, problem is that nodes are duplicated,
            // but when the nodes are manually removed, the relationship chords aren't
            // drawn in radial view
            base.updateTypeHierarchy(true, false, false, false);
          } else {
            base.updateTypeHierarchy(true, base.isVisOfSinglePage(), false, false);
          }
          break;

        case "tree":
          switch (base.options.content) {

            case "all":
              base.updateTypeHierarchy(false, true, null, false);
              break;

            case "toc":
              base.updateTypeHierarchy(false, true, base.options.content, true);
              break;

            case "current":
              base.updateTypeHierarchy(false, true, base.options.content, false);
              break;

            case "lens":
              let hasToc = false;
              base.options.lens.components.forEach(component => {
                if (component['content-selector'].type === 'items-by-type' && component['content-selector']['content-type'] === 'table-of-contents') {
                  hasToc = true;
                }
              })
              let topLevelType = true;
              if (base.options.lens.components.length === 1) {
                let component = base.options.lens.components[0];
                if (component['content-selector'].type === 'items-by-type') {
                  if (component['content-selector']['content-type'] === 'all-content') {
                    topLevelType = false;
                  } else {
                    topLevelType = component['content-selector']['content-type'];
                  }
                } else if (component['content-selector'].type === 'specific-items') {
                  if (component['content-selector'].items.length === 1) {
                    topLevelType = false;
                  }
                }
              }
              base.updateTypeHierarchy(false, true, topLevelType, hasToc);
              break;

            default:
              base.updateTypeHierarchy(false, true, base.options.content, false);
              break;

          }
          break;

      }

      //if (!base.loadingDone) this.validateSelectedNodes();

    }

    base.validateSelectedNodes = function() {
      // remove any nodes from the current selection that aren't in the current results
      let n = base.selectedNodes.length;
      for (let i = n - 1; i >= 0; i--) {
        let node = base.selectedNodes[i];
        if (base.sortedNodes.indexOf(node) == -1) {
          base.selectedNodes.splice(i, 1);
        }
      }
    }

    base.processNode = function(node) {
      if (node.title == null) {
        node.title = node.getDisplayTitle(true);
        node.shortTitle = this.getShortenedString(node.getDisplayTitle(true), 15);
        node.sortTitle = node.getSortTitle();
      }
      if (node[base.instanceId] == null) {
        node[base.instanceId] = {};
      }
      node.type = node.getDominantScalarType(base.options.content);
      if (node.parentsOfMaximizedInstances == null) {
        node.parentsOfMaximizedInstances = [];
      }
    }

		/**
		  * Rebuilds hierarchical node data.
		  *
		  * @param	{Boolean} includeSubgroups			Subdivide type branches such that no single branch has too many children
		  * @param	{Boolean} includeRelations			Recursively include nodes that are related to existing nodes in the hierarchy
		  * @param	{Boolean} topLevelType		      Top level branches will be restricted to this type
		  * @param	{Boolean} includeToc			    	Include the table of contents as a top level branch
		  */
    base.updateTypeHierarchy = function(includeSubgroups, includeRelations, topLevelType, includeToc) {

      var maxNodeChars = 115 / 6;

      var i, j, n, o, index, node, hierarchyNode, indexType, typedNodes, bookTitle, title,
        hierarchyNodes = [],
        anglePerNode = 360 / base.sortedNodes.length,
        groupAngle = 10,
        nodeForCurrentContent = null,
        typedNodeStorage = {};

      bookTitle = $('.book-title').eq(0).clone();
      bookTitle.find('span').contents().unwrap();
      bookTitle = this.getShortenedString(bookTitle.text(), 15);

      base.hierarchy = { title: bookTitle, shortTitle: bookTitle, children: [], showsTitle: false };
      base.selectedHierarchyNodes = [];

      // add the current node
      if (base.isVisOfCurrentPage()) {
        indexType = { name: "", id: "current" };
        var nodeForCurrentContent = { title: indexType.name, type: indexType.id, isTopLevel: true, index: 0, size: 1, parent: base.hierarchy, maximizedAngle: 360, children: [], descendantCount: 1 };
        base.hierarchy.children.push(nodeForCurrentContent);
        nodeForCurrentContent.children = setChildren(nodeForCurrentContent, [base.currentNode]);
      }

      if (includeToc) {
        var tocNodes = scalarapi.model.getMainMenuNode().getRelatedNodes('reference', 'outgoing', true);
      }

      // sort nodes by type
      n = base.sortedNodes.length;
      for (i = 0; i < n; i++) {
        node = base.sortedNodes[i];
        if ((includeToc && (tocNodes.indexOf(node) == -1)) || !includeToc) {
          if (typedNodeStorage[node.type.singular] == null) {
            typedNodeStorage[node.type.singular] = [];
          }
          typedNodeStorage[node.type.singular].push(node);
        }
      }

      if (includeToc) {

        var tocRoot = {
          title: "Table of Contents",
          shortTitle: "Table of Contents",
          type: "toc",
          isTopLevel: true,
          index: base.hierarchy.length,
          size: 1,
          showsTitle: true,
          parent: base.hierarchy,
          maximizedAngle: 360,
          children: [],
          descendantCount: tocNodes.length
        }

        base.hierarchy.children.push(tocRoot);

        n = tocNodes.length;
        for (i = 0; i < n; i++) {
          node = tocNodes[i];
          if (node.type) {
            hierarchyNode = {
              title: node.title,
              shortTitle: node.shortTitle,
              showsTitle: true,
              node: node,
              type: node.type.id,
              children: null,
              parent: tocRoot
            };
            tocRoot.children.push(hierarchyNode);
            if (includeRelations) {
              base.addRelationsForHierarchyNode(hierarchyNode);
            }
          }
        }
      }

      /*let isCurrentContent = false;
      if (base.options.content == "current") {
        isCurrentContent = true;
      } else if (base.options.lens) {
        if (base.options.lens.components[0]['content-selector'].items) {
          if (base.options.lens.components[0]['content-selector'].type == 'specific-items' && base.options.lens.components[0]['content-selector'].items.length == 1) {
            if (base.currentNode) {
              if (base.options.lens.components[0]['content-selector'].items[0] == base.currentNode.slug) {
                isCurrentContent = true;
              }
            }
          }
        }
      }*/

      if (base.isVisOfSinglePage()) {

        // replace the root node with the current node if showing types
        // is not a priority
        if (!topLevelType) {
          if (base.isVisOfCurrentPage()) {
            base.hierarchy = {
              title: base.currentNode.title,
              shortTitle: base.currentNode.shortTitle,
              showsTitle: true,
              node: base.currentNode,
              type: base.currentNode.type.id,
              children: null
            };
          } else {
            let node = scalarapi.getNode(base.options.lens.components[0]['content-selector'].items[0]);
            base.hierarchy = {
              title: node.title,
              shortTitle: node.shortTitle,
              showsTitle: true,
              node: node,
              type: node.type.id,
              children: null
            };
          }
          if (includeRelations) {
            base.addRelationsForHierarchyNode(base.hierarchy);
          }
        }

      }

      var typeList;
      switch (base.options.content) {

        case "all":
          typeList = base.canonicalTypeOrder;
          break;

        case "toc":
        case "current":
          if (topLevelType) {
            typeList = [];
          } else {
            typeList = base.canonicalTypeOrder;
          }
          break;

        case "lens":
          if (topLevelType) {
            if (base.isVisOfSinglePage()) {
              typeList = [];
            } else {
              typeList = [topLevelType];
            }
          } else {
            if (base.isVisOfSinglePage()) {
              typeList = [];
            } else {
              typeList = base.canonicalTypeOrder;
            }
          }
          break;

        default:
          if (topLevelType) {
            typeList = [topLevelType];
          } else {
            typeList = base.canonicalTypeOrder;
          }
          break;

      }

      // loop through each type
      n = typeList.length;
      for (i = 0; i < n; i++) {
        indexType = typeList[i];

        // we do this so the highlight color scheme matches the regular
        base.highlightColorScale(indexType);

        typedNodes = typedNodeStorage[indexType];

        if (typedNodes != null) {

          // don't allow the current node to be added anywhere else
          //if ( base.options.content == "current" ) {
					/*	index = typedNodes.indexOf( base.currentNode );
						if ( index != -1 ) {
							typedNodes.splice( index, 1 );
						}*/
          //}

          // post-processing
          o = typedNodes.length;
          for (j = (o - 1); j >= 0; j--) {
            node = typedNodes[j];

            // remove nodes whose dominant type isn't page
            if ((indexType == "page") && (node.type.singular != "page")) {
              typedNodes.splice(j, 1);
            }
          }

          title = scalarapi.model.scalarTypes[indexType].plural;

          // these are the top-level type nodes
          hierarchyNode = {
            title: title.charAt(0).toUpperCase() + title.slice(1),
            shortTitle: title.charAt(0).toUpperCase() + title.slice(1),
            type: indexType,
            isTopLevel: true,
            index: base.hierarchy.length,
            size: 1,
            showsTitle: false,
            parent: base.hierarchy,
            maximizedAngle: 360,
            children: [],
            descendantCount: typedNodes.length
          };

          if (base.hierarchy.children != null) {
            base.hierarchy.children.push(hierarchyNode);
          }

          // recursively assign children to the node
          hierarchyNode.children = setChildren(hierarchyNode, typedNodes, includeSubgroups, includeRelations);

        }

      }

			/**
			 * Recursive function for assigning children, grandchildren, etc. to the top-level nodes based on density.
			 */
      function setChildren(curNode, childNodes, includeSubgroups, includeRelations) {

        var j, curChild,
          n = childNodes.length,
          curChildren = [];

        // how big a node gets when maximized -- the smaller of the number of children * 15¡, or 270¡ total
        var maximizedAngle = Math.min(270, (n * 15));

        // maximized angle of each child
        var localAnglePerNode = curNode.maximizedAngle / n;

        // if the children of this segment, when maximized, will still be below a certain angle threshold, then
        // we need to make sub-groups for them
        if ((localAnglePerNode < 5) && includeSubgroups) {

          // groups can't be smaller than the groupAngle (10¡) -- so figure out how many children
          // need to be in each group for that to be true
          var nodesPerGroup = Math.ceil(groupAngle / anglePerNode);

          // how many sub-groups will this node have?
          var groupCount = Math.ceil(n / nodesPerGroup);

          // split this group into as many sub-groups as needed so that each group is the group angle with maximized parent.
          for (j = 0; j < groupCount; j++) {

            curChild = { title: curNode.title + '_group' + j, type: indexType, isGroup: true, isTopLevel: false, parent: curNode, maximizedAngle: maximizedAngle, children: [] };

            // if the next group will have less than the targeted number of children, combine it with the current group
            if ((n - ((j + 1) * nodesPerGroup)) < nodesPerGroup) {
              curChild.children = setChildren(curChild, childNodes.slice(j * nodesPerGroup));
              j++;

            } else {
              var descendants = childNodes.slice(j * nodesPerGroup, (j + 1) * nodesPerGroup);
              curChild.children = setChildren(curChild, descendants);
            }

            curChild.descendantCount = descendants.length;
            curChildren.push(curChild);
          }

          // otherwise, if there are enough children to fit in the group comfortably, then those
          // children will be the end of the line; no sub-groups need to be created
        } else {
          for (j = 0; j < n; j++) {
            curChild = {
              title: childNodes[j].title,
              shortTitle: childNodes[j].shortTitle,
              type: indexType,
              showsTitle: true,
              isTopLevel: false,
              node: childNodes[j],
              parent: curNode
            };
						/*if (childNodes[j].current) {
							curChild = {title:childNodes[j].current.title, shortTitle:me.getShortenedString(childNodes[j].current.title, maxNodeChars), type:indexType.id, isTopLevel:false, node:childNodes[j], parent:curNode};
						} else {
							curChild = {title:childNodes[j].title, shortTitle:me.getShortenedString(childNodes[j].title, maxNodeChars), type:indexType.id, isTopLevel:false, node:childNodes[j], parent:curNode};
						}*/
            curChildren.push(curChild);
            if (base.selectedNodes.indexOf(childNodes[j]) != -1) {
              base.selectedHierarchyNodes.push(curChild);
            }
            base.nodesBySlug[curChild.node.slug] = curChild;
            base.abstractedNodesBySlug[curChild.node.slug] = curChild

            if (includeRelations) {
              base.addRelationsForHierarchyNode(curChild);
            }

            hierarchyNodes.push(curChild);
          }
        }

        return curChildren;
      }

    }

    // recursively parse through the nodes contained by this node and store their relationships
    base.addRelationsForHierarchyNode = function(sourceData) {

      var destNode, destData, i, j, n, o, relation, comboUrl, nodes;

      var relationList;
      switch (base.options.relations) {

        case "all":
          relationList = base.canonicalRelationOrder;
          break;

        case "none":
          relationList = [];
          break;

        case "from-lens":
          relationList = [];
          if (base.options.lens.components[0].modifiers.length > 0) {
            switch (base.options.lens.components[0].modifiers[0].relationship) {
              case 'any-relationship':
                relationList = base.canonicalRelationOrder;
                break;
              case 'parent':
                relationList = [{ type: null, direction: 'incoming' }];
                break;
              case 'child':
                relationList = [{ type: null, direction: 'outgoing' }];
                break;
            }
          }
          break;

        default:
          if (base.options.relations == "reference") {
            relationList = [{ type: base.options.relations, direction: 'incoming' }];
          } else {
            relationList = [{ type: base.options.relations, direction: 'outgoing' }];
          }
          break;

      }

      n = relationList.length;
      for (i = 0; i < n; i++) {
        relation = relationList[i];
        if (relation.direction == "outgoing") {
          nodes = sourceData.node.getRelatedNodes(relation.type, relation.direction);
          if (nodes.length > 0) {
            if (sourceData.children == null) {
              sourceData.children = [];
            }
            o = nodes.length;
            let okToProcess;
            for (j = 0; j < o; j++) {
              destNode = nodes[j];
              okToProcess = true;
              // if this is a lens, don't include items not returned by the lens
              if (base.options.content == 'lens') {
                if (base.options.lens.items) {
                  if (base.contentNodes.indexOf(destNode) == -1 && base.manuallyLoadedNodes.indexOf(destNode) == -1) {
                    okToProcess = false;
                  }
                }
              }
              if (okToProcess) {
                base.processNode(destNode);
                destData = {
                  title: destNode.title,
                  shortTitle: destNode.shortTitle,
                  node: destNode,
                  type: destNode.type.id,
                  showsTitle: true,
                  parent: sourceData,
                  children: null,
                  localIndex: sourceData.children.length
                };
                sourceData.children.push(destData);
                if (base.processedNodesForHierarchy.indexOf(destNode) == -1) {
                  base.processedNodesForHierarchy.push(destNode);
                  base.addRelationsForHierarchyNode(destData);
                }
              }
            }
          }
        }
      }

    }

    // Returns true if the given hierarchy node has the candidate hierarchy node as an ancestor.
    base.hasHierarchyNodeAsAncestor = function(self, candidate) {
      var okToLog = false;
      while (self.parent && self.parent !== candidate) {
        self = self.parent;
      }
      return (self.parent === candidate && candidate !== null);
    }

    base.parentIdForHierarchyNode = function(d) {
      var parentId;
      if (d.parent != null) {
        if (d.parent.data.node == null) {
          parentId = d.parent.data.title;
        } else {
          parentId = d.parent.data.node.slug;
        }
      }
      return parentId;
    }

    base.isHierarchyNodeMaximized = function(d) {
      var isMaximized = (d.children != null);
      if (d.data.node != null) {
        if (d.data.node.parentsOfMaximizedInstances.indexOf(base.parentIdForHierarchyNode(d)) != -1) {
          isMaximized = true;
        } else {
          isMaximized = false;
        }
      }
      return isMaximized;
    }

    base.updateLinks = function() {

      var i, n, slug, existingLink,
        oldLinks = base.links.concat();

      n = base.relations.length;
      for (i = 0; i < n; i++) {
        relation = base.relations[i];
        if ((base.sortedNodes.indexOf(relation.body) != -1) && (base.sortedNodes.indexOf(relation.target) != -1)) {
          slug = relation.body.slug + '-' + relation.target.slug;
          existingLink = base.linksBySlug[slug];

          // add links that are new to us
          if (existingLink == null) {
            link = {
              source: base.abstractedNodesBySlug[relation.body.slug],
              target: base.abstractedNodesBySlug[relation.target.slug],
              value: 1,
              type: relation.type
            };
            base.links.push(link);
            base.linksBySlug[slug] = link;

            // keep track of links that aren't
          } else {
            index = oldLinks.indexOf(existingLink);
            oldLinks.splice(index, 1);
          }
        }
      }

      // remove any links that shouldn't be shown anymore
      n = oldLinks.length;
      for (i = 0; i < n; i++) {
        link = oldLinks[i];
        slug = link.source.node.slug + '-' + link.target.node.slug;
        base.linksBySlug[slug] = null;
        index = base.links.indexOf(link);
        if (index != -1) {
          base.links.splice(index, 1);
        }
      }
    }

    base.typeSort = function(a, b) {
      var idSortA = base.canonicalTypeOrder.indexOf(a.type.singular);
      var idSortB = base.canonicalTypeOrder.indexOf(b.type.singular);
      if (a.type.singular == base.options.content) {
        idSortA = -1;
      }
      if (b.type.singular == base.options.content) {
        idSortB = -1;
      }
      if (a.current && b.current) {
        var alphaSort = 0;
        if (idSortA < idSortB) {
          return -1;
        } else if (idSortA > idSortB) {
          return 1;
        } else if (a.sortTitle < b.sortTitle) {
          return -1;
        } else if (a.sortTitle > b.sortTitle) {
          return 1;
        } else {
          return 0;
        }
      } else {
        return idSortA - idSortB;
      }
    };

    base.updateActiveNodes = function() {
      //console.log('update active nodes');

      var i, n, newActiveNodes, node, index;

      if (base.rolloverNode && (base.selectedNodes.indexOf(base.rolloverNode) == -1)) {
        newActiveNodes = base.selectedNodes.concat([base.rolloverNode]);
      } else {
        newActiveNodes = base.selectedNodes.concat();
      }

      //console.log(base.activeNodes,newActiveNodes);

      // handle node persistence; adding new and removing old
      n = base.activeNodes.length;
      for (i = (n - 1); i >= 0; i--) {
        node = base.activeNodes[i];
        index = newActiveNodes.indexOf(node);
        if (index != -1) {
          newActiveNodes.splice(index, 1);
        } else {
          base.activeNodes.splice(i, 1);
        }
      }
      n = newActiveNodes.length;
      for (i = 0; i < n; i++) {
        base.activeNodes.push(newActiveNodes[i]);
      }

      // remove any nodes that aren't in the current sort
      n = base.activeNodes.length;
      for (i = (n - 1); i >= 0; i--) {
        node = base.activeNodes[i];
        if (base.sortedNodes.indexOf(node) == -1) {
          base.activeNodes.splice(i, 1);
        }
      }
    }

    base.clear = function() {

      if (base.svg != null) {
        base.svg.empty();
        base.svg = null;
      }
      if (base.visualization) {
        base.visualization.empty();
      }

      if (base.getFormat() != 'force-directed' && base.force != null) {
        base.force.on("tick", null);
        base.force = null;
        base.links = [];
      }
    }

    base.draw = function() {

      // select the current node by default
      if (base.isVisOfCurrentPage()) {
        if (base.selectedNodes.length == 0) {
          var node = scalarapi.model.getCurrentPageNode();
          if (node != null) {
            base.selectedNodes = [node];
          }
        }
      }

      var needsInstantiation;
      switch (base.getFormat()) {

        case "grid":
          needsInstantiation = base.visInstance ? base.visInstance.constructor.name != 'GridVisualization' : true;
          if (needsInstantiation) {
            if (base.visInstance) base.visInstance.destroy();
            base.visInstance = new GridVisualization();
          }
          break;

        case "tree":
          base.visInstance = new TreeVisualization(); // rebuild it every time to avoid issues with data constancy
          break;

        case "radial":
          needsInstantiation = base.visInstance ? base.visInstance.constructor.name != 'RadialVisualization' : true;
          if (needsInstantiation) {
            if (base.visInstance) base.visInstance.destroy();
            base.visInstance = new RadialVisualization();
          }
          break;

        case "force-directed":
          needsInstantiation = base.visInstance ? base.visInstance.constructor.name != 'ForceDirectedVisualization' : true;
          if (needsInstantiation) {
            if (base.visInstance) base.visInstance.destroy();
            base.visInstance = new ForceDirectedVisualization();
          }
          break;

        case "tagcloud":
          needsInstantiation = base.visInstance ? base.visInstance.constructor.name != 'TagCloudVisualization' : true;
          if (needsInstantiation) {
            if (base.visInstance) base.visInstance.destroy();
            base.visInstance = new TagCloudVisualization();
          }
          break;

        case "map":
          needsInstantiation = base.visInstance ? base.visInstance.constructor.name != 'MapVisualization' : true;
          if (needsInstantiation) {
            if (base.visInstance) base.visInstance.destroy();
            base.visInstance = new MapVisualization();
          }
          break;

        case "word-cloud":
          needsInstantiation = base.visInstance ? base.visInstance.constructor.name != 'WordCloudVisualization' : true;
          if (needsInstantiation) {
            if (base.visInstance) base.visInstance.destroy();
            base.visInstance = new WordCloudVisualization();
          }
          break;

        case "list":
          needsInstantiation = base.visInstance ? base.visInstance.constructor.name != 'ListVisualization' : true;
          if (needsInstantiation) {
            if (base.visInstance) base.visInstance.destroy();
            base.visInstance = new ListVisualization();
          }
          break;

      }
      base.updateInspector();
      if (base.visInstance) base.visInstance.draw();
    };

    /**************************
     * ABSTRACT VISUALIZATION *
     **************************/

    class AbstractVisualization {
      // Not a strict abstract class, contains some utitlity methods
      // and a guide for creating new visualizations

      // call using super() to do needed init
      constructor() {
        this.hasBeenDrawn = false;
        this.size = { width: 0, height: 0 };
        this.updateNoResultsMessage();
      }

      // no need to call directly
      updateSize() {
        var isFullScreenNow = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
        this.size.width = base.visElement.width() - (base.inspectorVisible ? 320 : 0);
        if (!isFullScreenNow) {
          if (window.innerWidth > 768) {
            if (base.options.modal) {
              this.size.height = Math.max(300, window.innerHeight * .9 - 170);
            } else {
              this.size.height = 568;
            }
          } else {
            this.size.height = 300;
          }
        } else {
          this.size.width = window.innerWidth;
          this.size.height = window.innerHeight;
        }
        if (this.isFullScreen != isFullScreenNow) {
          this.hasBeenDrawn = false;
        }
        this.isFullScreen = isFullScreenNow;
      }

      // call using super.draw() from your draw method
      draw() {
        this.updateSize();
        base.visualization.removeClass('scrollable');
        base.visualization.css('width', this.size.width + 'px');
        if (!this.hasBeenDrawn && base.visElement.width() > 0) {
          base.helpButton.attr('data-content', this.getHelpContent());
          this.setupElement();
          this.hasBeenDrawn = true;
        }
      }

      updateNoResultsMessage(nodeArray) {
        if (!nodeArray) {
          if (base.visualization.find('.no-results-msg').length == 0) {
            base.visualization.prepend('<div class="no-results-msg caption_font">One moment...</div>');
          }
        } else if (nodeArray.length == 0) {
          if (base.visualization.find('.no-results-msg').length == 0) {
            base.visualization.prepend('<div class="no-results-msg caption_font">No results to show.</div>');
          }
        } else {
          base.visualization.find('.no-results-msg').remove();
        }
      }

      // override with your own version that returns HTML
      // to insert in the "About this visualization" popover
      getHelpContent() {
        return 'This is sample help content.';
      }

      // override to set up the base.visualization element
      setupElement() {
        // set up the element
      }

      // override to clean up the vis if neccessary
      destroy() {
        // clean up the vis
      }

    }

    /**********************
     * GRID VISUALIZATION *
     **********************/

    class GridVisualization extends AbstractVisualization {

      constructor() {
        super();
        this.colWidth = 36;
        this.boxSize = 36;
        this.currentNode = scalarapi.model.getCurrentPageNode();
      }

      draw() {
        super.draw();
        if (this.isFullScreen) {
          base.visualization.addClass('scrollable');
        }
        if (base.svg != null) {
          this.itemsPerRow = Math.floor((this.size.width - 1) / this.colWidth);
          this.colScale = d3.scaleLinear([0, this.itemsPerRow], [0, this.itemsPerRow * this.colWidth]);
          var unitWidth = Math.max(this.colScale(1) - this.colScale(0), this.boxSize);
          var rowCount = Math.ceil(base.sortedNodes.length / this.itemsPerRow);
          var visHeight = rowCount * (this.boxSize + 10);
          this.rowScale = d3.scaleLinear([0, rowCount], [0, visHeight]);
          var unitHeight = this.rowScale(1) - this.rowScale(0);
          var fullHeight = unitHeight * rowCount + 20;
          var maxNodeChars = unitWidth / 7;
          var node;
          base.svg.attr('height', fullHeight);

          var tocNode = scalarapi.model.getMainMenuNode();

          this.isLocallySorted = true;
          if (base.options.content === 'lens') {
            if (base.options.lens.sorts) {
              if (base.options.lens.sorts.length > 0) {
                this.isLocallySorted = false;
              }
            }
          }

          if (this.isLocallySorted) {
            this.gridNodes = base.sortedNodes.concat();
          } else {
            this.gridNodes = base.contentNodes.concat();
          }

          this.updateNoResultsMessage(this.gridNodes);

          var index = this.gridNodes.indexOf(tocNode);
          if (index != -1) {
            this.gridNodes.splice(index, 1);
          }

          this.box = this.gridBoxLayer.selectAll('.rowBox')
            .data(this.gridNodes, (d) => { return d.type.id + '-' + d.slug; })
            .join(
              enter => enter.append('svg:rect')
                .each(function(d) { d.svgTarget = this; })
                .attr('class', 'rowBox')
                .attr('x', (d, i) => { d[base.instanceId].x = this.colScale(i % this.itemsPerRow) + 0.5; return d[base.instanceId].x; })
                .attr('y', (d, i) => { d[base.instanceId].y = this.rowScale(Math.floor(i / this.itemsPerRow) + 1) - this.boxSize + 0.5; return d[base.instanceId].y; })
                .attr('width', this.boxSize)
                .attr('height', this.boxSize)
                .attr('stroke', '#000')
                .style('cursor', 'pointer')
                .attr('stroke-opacity', '.2')
                .attr('fill-opacity', this.calculateOpacity)
                .attr('fill', function(d) {
                  return base.highlightColorScale(d.type.singular);
                })
                .on("click", (d) => {
                  var index = base.selectedNodes.indexOf(d);
                  if (index == -1) {
                    base.selectedNodes.push(d);
                    base.loadNode(d.slug, 0, 0, base.updateInspector);
                  } else {
                    base.selectedNodes.splice(index, 1);
                  }
                  base.updateInspector();
                  this.updateGraph();
                  return true;
                })
                .on("mouseover", (d) => {
                  if (!isMobile) {
                    base.rolloverNode = d;
                    this.updateGraph();
                  }
                })
                .on("mouseout", (d) => {
                  if (!isMobile) {
                    base.rolloverNode = null;
                    this.updateGraph();
                  }
                })
            );

          let visualizePaths = false;
          if ((base.options.content == "path" || base.options.content == "all") && (base.options.relations == "path" || base.options.relations == "all")) {
            visualizePaths = true;
          }
          let filterControlVal = base.visElement.find(".vis-filter-control").val();
          if (base.options.content == "lens" && (filterControlVal == 'any-relationship' || filterControlVal == 'child' || !filterControlVal)) {
            visualizePaths = true;
          }

          if (visualizePaths) {
            // path vis line function
            this.line = d3.line()
              .x((d) => {
                if (d[base.instanceId]) {
                  return d[base.instanceId].x + (this.boxSize * .5);
                } else {
                  return 0;
                }
              })
              .y((d) => {
                if (d[base.instanceId]) {
                  return d[base.instanceId].y + (this.boxSize * .5);
                } else {
                  return 0;
                }
              })
              .curve(d3.curveCatmullRom.alpha(0.5));

            var typedNodes = scalarapi.model.getNodesWithProperty('dominantScalarType', 'path', 'alphabetical');

            // build array of path contents
            n = typedNodes.length;
            var pathRelations;
            var allPathContents = [];
            var pathContents;
            for (i = 0; i < n; i++) {
              node = typedNodes[i];
              let okToInclude = true;
              if (base.options.content == "lens") {
                if (!base.options.lens.items) {
                  okToInclude = false;
                } else if (!base.options.lens.items[node.url]) {
                  okToInclude = false;
                }
              }
              if (okToInclude) {
                pathContents = node.getRelatedNodes('path', 'outgoing');
                pathContents.unshift(node);
                allPathContents.push(pathContents);
              }
            }

            var pathGroups = this.gridPathLayer.selectAll('g.pathGroup')
              .data(allPathContents, function(d) { return d[0].slug; });

            // create a container group for each path vis
            var groupEnter = pathGroups.enter().append('g')
              .attr('width', this.size.width)
              .attr('height', base.svg.attr('height'))
              .attr('class', 'pathGroup')
              .attr('visibility', 'hidden')
              .attr('pointer-events', 'none');

            // add the path to the group
            groupEnter.append('path')
              .attr('class', 'pathLink')
              .attr('stroke', function(d) {
                return base.highlightColorScale("path", "verb");
              })
              .attr('stroke-dasharray', '5,2')
              .attr('d', this.line);

            // add the path's dots to the group
            groupEnter.selectAll('circle.pathDot')
              .data(function(d) { return d; })
              .enter().append('circle')
              .attr('fill', function(d) {
                return base.highlightColorScale("path", "verb");
              })
              .attr('class', 'pathDot')
              .attr('cx', (d) => {
                return d[base.instanceId] ? d[base.instanceId].x + (this.boxSize * .5) : 0;
              })
              .attr('cy', (d) => {
                return d[base.instanceId] ? d[base.instanceId].y + (this.boxSize * .5) : 0;
              })
              .attr('r', function(d, i) { return (i == 0) ? 5 : 3; });

            // add the step numbers to the group
            groupEnter.selectAll('text.pathDotText')
              .data(function(d) { return d; })
              .enter().append('text')
              .attr('fill', function(d) {
                return base.highlightColorScale("path", "verb");
              })
              .attr('class', 'pathDotText')
              .attr('dx', function(d) {
                return d[base.instanceId] ? d[base.instanceId].x + 3 : 0;
              })
              .attr('dy', function(d) {
                return d[base.instanceId] ? d[base.instanceId].y + this.boxSize - 3 : 0;
              })
              .text(function(d, i) { return (i == 0) ? '' : i; });

          } else {
            this.gridPathLayer.selectAll('g.pathGroup').remove();
          }

          this.redrawGrid();
          this.updateGraph();
        }
      }

      getHelpContent() {
        var helpContent;
        if (!base.isVisOfCurrentPage()) {
          helpContent = "This visualization shows <b>how content is interconnected</b> in this work.<ul>";
        } else {
          helpContent = "This visualization shows how <b>&ldquo;" + this.currentNode.getDisplayTitle() + "&rdquo;</b> is connected to other content in this work.<ul>";
        }
        helpContent += "<li>Each box represents a piece of content, color-coded by type.</li>" +
          "<li>The darker the box, the more connections it has to other content (relative to the other boxes).</li>" +
          "<li>Each line represents a connection, color-coded by type.</li>" +
          "<li>You can roll over the boxes to browse connections, or click to add more content to the current selection.</li>" +
          "<li>Click the &ldquo;View&rdquo; button of any selected item to navigate to it.</li></ul>";
        return helpContent;
      }

      setupElement() {
        base.visualization.empty();
        base.visualization.removeClass('bounded');
        base.svg = d3.select(base.visualization[0]).append('svg:svg').attr('width', this.size.width);
        this.gridBoxLayer = base.svg.append('svg:g')
          .attr('width', this.size.width)
          .attr('height', this.size.height);
        this.gridPathLayer = base.svg.append('svg:g')
          .attr('width', this.size.width)
          .attr('height', this.size.height);
        this.gridLinkLayer = base.svg.append('svg:g')
          .attr('width', this.size.width)
          .attr('height', this.size.height);
      }

      calculateOpacity(d) {
        var val = 0;
        if (base.maxConnections > 0) {
          if (d.outgoingRelations) {
            val = d.outgoingRelations.length;
          }
          if (d.incomingRelations) {
            val += d.incomingRelations.length;
          }
          val += 1;
          val /= base.maxConnections;
          val *= .75;
        } else {
          val = .1;
        }
        val += .1;
        return val;
      }

      redrawGrid() {
        if (this.isLocallySorted) {
          this.box.sort(base.typeSort).attr('fill', (d) => { return (base.rolloverNode == d) ? d3.rgb(base.highlightColorScale(d.type.singular)).darker() : base.highlightColorScale(d.type.singular); })
            .attr('fill-opacity', this.calculateOpacity)
            .attr('x', (d, i) => { d[base.instanceId].x = this.colScale(i % this.itemsPerRow) + 0.5; return d[base.instanceId].x; })
            .attr('y', (d, i) => { d[base.instanceId].y = this.rowScale(Math.floor(i / this.itemsPerRow) + 1) - this.boxSize + 0.5; return d[base.instanceId].y; });
        } else {
          this.box.attr('fill', (d) => { return (base.rolloverNode == d) ? d3.rgb(base.highlightColorScale(d.type.singular)).darker() : base.highlightColorScale(d.type.singular); })
            .attr('fill-opacity', this.calculateOpacity)
            .attr('x', (d, i) => { d[base.instanceId].x = this.colScale(i % this.itemsPerRow) + 0.5; return d[base.instanceId].x; })
            .attr('y', (d, i) => { d[base.instanceId].y = this.rowScale(Math.floor(i / this.itemsPerRow) + 1) - this.boxSize + 0.5; return d[base.instanceId].y; });
        }

        this.gridPathLayer.selectAll('path').attr('d', this.line);
        this.gridPathLayer.selectAll('circle.pathDot')
          .attr('cx', (d) => {
            return d[base.instanceId] ? d[base.instanceId].x + (this.boxSize * .5) : 0;
          })
          .attr('cy', (d) => {
            return d[base.instanceId] ? d[base.instanceId].y + (this.boxSize * .5) : 0;
          });
        this.gridPathLayer.selectAll('text.pathDotText')
          .attr('dx', (d) => {
            return d[base.instanceId] ? d[base.instanceId].x + 3 : 0;
          })
          .attr('dy', (d) => {
            return d[base.instanceId] ? d[base.instanceId].y + this.boxSize - 3 : 0;
          });

        var visPos = base.visualization.position();

        d3.select(base.visualization[0]).selectAll('div.info_box')
          .style('left', (d) => { return (d[base.instanceId].x + visPos.left + (this.boxSize * .5)) + 'px'; })
          .style('top', (d) => { return (d[base.instanceId].y + visPos.top + this.boxSize + 5) + 'px'; });

        this.gridLinkLayer.selectAll('line.connection')
          .attr('x1', (d) => { return d.body[base.instanceId].x + (this.boxSize * .5); })
          .attr('y1', (d) => { return d.body[base.instanceId].y + (this.boxSize * .5); })
          .attr('x2', (d) => { return d.target[base.instanceId].x + (this.boxSize * .5); })
          .attr('y2', (d) => { return d.target[base.instanceId].y + (this.boxSize * .5); });
        this.gridLinkLayer.selectAll('circle.connectionDot')
          .attr('cx', (d) => { return d.node[base.instanceId].x + (this.boxSize * .5); })
          .attr('cy', (d) => { return d.node[base.instanceId].y + (this.boxSize * .5); });
      }

      updateGraph() {
        base.updateActiveNodes();
        this.box.attr('fill', function(d) { return (base.rolloverNode == d) ? d3.rgb(base.highlightColorScale(d.type.singular)).darker() : base.highlightColorScale(d.type.singular); });
        var infoBox = d3.select(base.visualization[0]).selectAll('div.info_box');

        // turn on/off path lines
        this.gridPathLayer.selectAll('g.pathGroup')
          .attr('visibility', function(d) {
            return ((base.activeNodes.indexOf(d[0]) != -1)) ? 'visible' : 'hidden';
          });

        infoBox = infoBox.data(base.activeNodes, function(d) { return d.slug; });

        var visPos = base.visualization.position();

        infoBox.join(
          enter => enter.append('div')
            .attr('class', 'info_box')
            .style('left', (d) => { return (d[base.instanceId].x + visPos.left + (this.boxSize * .5)) + 'px'; })
            .style('top', (d) => { return (d[base.instanceId].y + visPos.top + this.boxSize + 5) + 'px'; })
            .html(base.nodeInfoBox),
          update => update.style('left', (d) => { return (d[base.instanceId].x + visPos.left + (this.boxSize * .5)) + 'px'; })
            .style('top', (d) => { return (d[base.instanceId].y + visPos.top + this.boxSize + 5) + 'px'; })
            .html(base.nodeInfoBox),
          exit => exit.remove()
        );

        // connections
        var linkGroup = this.gridLinkLayer.selectAll('g.linkGroup')
          .data(base.activeNodes);

        var linkEnter = linkGroup.join(
          enter => {
            // container group for each node's connections
            enter.append('g')
              .attr('width', this.size.width)
              .attr('height', base.svg.attr('height'))
              .attr('class', 'linkGroup')
              .attr('pointer-events', 'none')
            // draw connection lines
            enter.selectAll('line.connection')
              .data((d) => {
                var relationArr = [];
                var relations = d.outgoingRelations.concat(d.incomingRelations);
                var relation;
                var i;
                var n = relations.length;
                for (i = 0; i < n; i++) {
                  relation = relations[i];
                  if (relation.type.id == base.options.relations || base.options.relations == "all" || base.options.content == "lens") {
                    if (relation.type.id != 'path' && this.gridNodes.indexOf(relation.body) != -1 && this.gridNodes.indexOf(relation.target) != -1) {
                      if (!relation.body.scalarTypes.toc) {
                        relationArr.push(relations[i]);
                      }
                    }
                  }
                }
                return relationArr;
              })
              .join(
                enter => enter.append('line')
                  .attr('class', 'connection')
                  .attr('x1', (d) => { return d.body[base.instanceId].x + (this.boxSize * .5); })
                  .attr('y1', (d) => { return d.body[base.instanceId].y + (this.boxSize * .5); })
                  .attr('x2', (d) => { return d.target[base.instanceId].x + (this.boxSize * .5); })
                  .attr('y2', (d) => { return d.target[base.instanceId].y + (this.boxSize * .5); })
                  .attr('stroke-width', 1)
                  .attr('stroke-dasharray', '1,2')
                  .attr('stroke', function(d) { return base.highlightColorScale((d.type.id == 'reference') ? 'media' : d.type.id); }),
                update => update.attr('class', 'connection')
                  .attr('x1', (d) => { return d.body[base.instanceId].x + (this.boxSize * .5); })
                  .attr('y1', (d) => { return d.body[base.instanceId].y + (this.boxSize * .5); })
                  .attr('x2', (d) => { return d.target[base.instanceId].x + (this.boxSize * .5); })
                  .attr('y2', (d) => { return d.target[base.instanceId].y + (this.boxSize * .5); })
                  .attr('stroke-width', 1)
                  .attr('stroke-dasharray', '1,2')
                  .attr('stroke', function(d) { return base.highlightColorScale((d.type.id == 'reference') ? 'media' : d.type.id); }),
                exit => exit.remove()
              )
            // draw connection dots
            enter.selectAll('circle.connectionDot')
              .data((d) => {
                var nodeArr = [];
                var relations = d.outgoingRelations.concat(d.incomingRelations);
                var relation;
                var i;
                var n = relations.length;
                for (i = 0; i < n; i++) {
                  relation = relations[i];
                  if (relation.type.id == base.options.relations || base.options.relations == "all" || base.options.content == "lens") {
                    if ((relation.type.id != 'path') && (this.gridNodes.indexOf(relation.body) != -1) && (this.gridNodes.indexOf(relation.target) != -1)) {
                      if (!relation.body.scalarTypes.toc) {
                        nodeArr.push({ role: 'body', node: relation.body, type: relation.type });
                        nodeArr.push({ role: 'target', node: relation.target, type: relation.type });
                      }
                    }
                  }
                }
                return nodeArr;
              })
              .join(
                enter => enter.append('circle')
                  .attr('fill', function(d) { return base.highlightColorScale((d.type.id == 'reference') ? 'media' : d.type.id); })
                  .attr('class', 'connectionDot')
                  .attr('cx', (d) => { return d.node[base.instanceId].x + (this.boxSize * .5); })
                  .attr('cy', (d) => { return d.node[base.instanceId].y + (this.boxSize * .5); })
                  .attr('r', (d, i) => { return (d.role == 'body') ? 5 : 3; }),
                update => update.attr('fill', function(d) { return base.highlightColorScale((d.type.id == 'reference') ? 'media' : d.type.id); })
                  .attr('class', 'connectionDot')
                  .attr('cx', (d) => { return d.node[base.instanceId].x + (this.boxSize * .5); })
                  .attr('cy', (d) => { return d.node[base.instanceId].y + (this.boxSize * .5); })
                  .attr('r', (d, i) => { return (d.role == 'body') ? 5 : 3; }),
                exit => exit.remove()
              )
          },
          // update is largely redundant here (but needed), possible refactor oppty
          update => {
            // container group for each node's connections
            update.append('g')
              .attr('width', this.size.width)
              .attr('height', base.svg.attr('height'));
            // draw connection lines
            update.selectAll('line.connection')
              .data((d) => {
                var relationArr = [];
                var relations = d.outgoingRelations.concat(d.incomingRelations);
                var relation;
                var i;
                var n = relations.length;
                for (i = 0; i < n; i++) {
                  relation = relations[i];
                  if (relation.type.id == base.options.relations || base.options.relations == "all" || base.options.content == "lens") {
                    if (relation.type.id != 'path' && this.gridNodes.indexOf(relation.body) != -1 && this.gridNodes.indexOf(relation.target) != -1) {
                      if (!relation.body.scalarTypes.toc) {
                        relationArr.push(relations[i]);
                      }
                    }
                  }
                }
                return relationArr;
              })
              .join(
                enter => enter.append('line')
                  .attr('class', 'connection')
                  .attr('x1', (d) => { return d.body[base.instanceId].x + (this.boxSize * .5); })
                  .attr('y1', (d) => { return d.body[base.instanceId].y + (this.boxSize * .5); })
                  .attr('x2', (d) => { return d.target[base.instanceId].x + (this.boxSize * .5); })
                  .attr('y2', (d) => { return d.target[base.instanceId].y + (this.boxSize * .5); })
                  .attr('stroke-width', 1)
                  .attr('stroke-dasharray', '1,2')
                  .attr('stroke', function(d) { return base.highlightColorScale((d.type.id == 'reference') ? 'media' : d.type.id); }),
                update => update.attr('class', 'connection')
                  .attr('x1', (d) => { return d.body[base.instanceId].x + (this.boxSize * .5); })
                  .attr('y1', (d) => { return d.body[base.instanceId].y + (this.boxSize * .5); })
                  .attr('x2', (d) => { return d.target[base.instanceId].x + (this.boxSize * .5); })
                  .attr('y2', (d) => { return d.target[base.instanceId].y + (this.boxSize * .5); })
                  .attr('stroke-width', 1)
                  .attr('stroke-dasharray', '1,2')
                  .attr('stroke', function(d) { return base.highlightColorScale((d.type.id == 'reference') ? 'media' : d.type.id); }),
                exit => exit.remove()
              )
            // draw connection dots
            update.selectAll('circle.connectionDot')
              .data((d) => {
                var nodeArr = [];
                var relations = d.outgoingRelations.concat(d.incomingRelations);
                var relation;
                var i;
                var n = relations.length;
                for (i = 0; i < n; i++) {
                  relation = relations[i];
                  if (relation.type.id == base.options.relations || base.options.relations == "all" || base.options.content == "lens") {
                    if ((relation.type.id != 'path') && (this.gridNodes.indexOf(relation.body) != -1) && (this.gridNodes.indexOf(relation.target) != -1)) {
                      if (!relation.body.scalarTypes.toc) {
                        nodeArr.push({ role: 'body', node: relation.body, type: relation.type });
                        nodeArr.push({ role: 'target', node: relation.target, type: relation.type });
                      }
                    }
                  }
                }
                return nodeArr;
              })
              .join(
                enter => enter.append('circle')
                  .attr('fill', function(d) { return base.highlightColorScale((d.type.id == 'reference') ? 'media' : d.type.id); })
                  .attr('class', 'connectionDot')
                  .attr('cx', (d) => { return d.node[base.instanceId].x + (this.boxSize * .5); })
                  .attr('cy', (d) => { return d.node[base.instanceId].y + (this.boxSize * .5); })
                  .attr('r', (d, i) => { return (d.role == 'body') ? 5 : 3; }),
                update => update.attr('fill', function(d) { return base.highlightColorScale((d.type.id == 'reference') ? 'media' : d.type.id); })
                  .attr('class', 'connectionDot')
                  .attr('cx', (d) => { return d.node[base.instanceId].x + (this.boxSize * .5); })
                  .attr('cy', (d) => { return d.node[base.instanceId].y + (this.boxSize * .5); })
                  .attr('r', (d, i) => { return (d.role == 'body') ? 5 : 3; }),
                exit => exit.remove()
              )
          },
          exit => exit.remove()
        );
      }
    }

    /**********************
     * TREE VISUALIZATION *
     **********************/

    class TreeVisualization extends AbstractVisualization {

      constructor() {
        super();
        this.columnWidth = window.innerWidth > 768 ? 180 : 90;
        this.container = null;
        this.root = null;
      }

      draw() {
        super.draw();
        if (base.svg != null && base.hierarchy != null) {
          this.root = d3.hierarchy(base.hierarchy);
          this.root.descendants().forEach((d, i) => {
            d._children = d.children;
          })
          this.updateNoResultsMessage(base.sortedNodes);
          this.container = base.svg.selectAll('g.container');
          // collapse all nodes except the root and its children
          this.branchExpand(this.root);
          if (this.root.children != null) {
            this.root.children.forEach((d) => {
              this.branchExpand(d);
              if (d.children != null) {
                d.children.forEach((d) => { this.branchCollapseAll(d); });
              }
            });
          }
          this.branchConformAll(this.root);
          this.pathUpdate(this.root, true);
        }
      }

      getHelpContent() {
        var helpContent;
        if (!base.isVisOfCurrentPage()) {
          helpContent = "This visualization shows <b>how content is interconnected</b> in this work.<ul>";
        } else {
          helpContent = "This visualization shows how <b>&ldquo;" + base.currentNode.getDisplayTitle() + "&rdquo;</b> is connected to other content in this work.<ul>";
        }
        helpContent += "<li>Each circle represents a piece of content, color-coded by type.</li>" +
          "<li>Click and hold to drag.</li>" +
          "<li>Click any filled circle to reveal its connections; click again to hide them.</li>" +
          "<li>Click the name of any item to navigate to it.</li></ul>";
        return helpContent;
      }

      setupElement() {
        base.visualization.empty();
        base.visualization.addClass('bounded');
        base.visualization.css('height', this.size.height + 'px');
        base.visualization.css('width', this.size.width + 'px');
        base.svg = d3.select(base.visualization[0]).append('svg:svg')
          .attr('width', this.size.width - 2)
          .attr('height', this.size.height - 2);
        var container = base.svg.append("g").attr('class', 'container');
        base.svg.call(d3.zoom().on("zoom", function() { container.attr("transform", d3.event.transform); }));
        base.svg.style("cursor", "move");
        base.tree = d3.tree().nodeSize([30, this.size.height]);
        base.diagonal = d3.linkHorizontal()
          .x(function(d) { return d.y; })
          .y(function(d) { return d.x; });
      }

      branchCollapse(d) {
        var parentId = base.parentIdForHierarchyNode(d);
        d.children = null;
        if (d.data.node != null) {
          var index = d.data.node.parentsOfMaximizedInstances.indexOf(parentId);
          if (index != -1) {
            d.data.node.parentsOfMaximizedInstances.splice(index, 1);
          }
        }
      }

      branchExpand(d) {
        var parentId = base.parentIdForHierarchyNode(d);
        d.children = d._children;
        if (d.data.node != null) {
          if (d.data.node.parentsOfMaximizedInstances.indexOf(parentId) == -1) {
            d.data.node.parentsOfMaximizedInstances.push(parentId);
          }
        }
      }

      // toggle children
      branchToggle(d) {
        if (base.isHierarchyNodeMaximized(d)) {
          this.branchCollapse(d);
        } else {
          this.branchExpand(d);
        }
      }

      // makes sure node's data matches its state
      branchConform(d) {
        if (!base.isHierarchyNodeMaximized(d)) {
          d.children = null;
        } else {
          d.children = d._children;
        }
      }

      branchConformAll(d) {
        if (d._children) {
          d._children.forEach((d) => { this.branchConformAll(d); });
        }
        this.branchConform(d);
      }

      branchCollapseAll(d) {
        d.children = null;
        if (d._children) {
          d._children.forEach((d) => { this.branchCollapseAll(d); });
        }
      }

      getDescendantForData(data) {
        let descendant;
        let descendants = this.root.descendants();
        for (let i = 0; i < descendants.length; i++) {
          let candidate = descendants[i];
          if (candidate.data.title == data.title && candidate.data.node == data.node) {
            descendant = candidate;
            break;
          }
        }
        return descendant;
      }

      pathUpdate(root, instantaneous) {
        var duration = instantaneous ? 0 : d3.event && d3.event.altKey ? 5000 : 500;

        base.tree(this.root);
        var nodes = this.root.descendants();

        // Normalize for fixed-depth.
        nodes.forEach((d) => {
          d.x += (this.size.height * .5);
          d.y = (d.depth + 1) * this.columnWidth;
        });

        // Update the nodes…
        var treevis_node = this.container.selectAll("g.node")
          .data(nodes, function(d, i) {
            var self = (d.node == null) ? d.data.title : d.data.node.slug;
            var parent = (d.parent == null) ? 'none' : (d.parent.data.node == null) ? d.parent.data.title : d.parent.data.node.title;
            var id = self + '-' + parent + '-' + d.depth;
            if (d.data.localIndex != null) {
              id += '-' + d.data.localIndex;
            }
            return id;
          });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = treevis_node.enter().append("svg:g")
          .attr("class", "node")
          .attr("transform", (d) => {
            var source;
            if (this.lastToggledNode) {
              source = this.lastToggledNode;
            } else if (d.parent) {
              source = d.parent;
            } else {
              source = d;
            }
            return "translate(" + source.y0 + "," + source.x0 + ")";
          });

        nodeEnter.append("svg:circle")
          .attr("r", 1e-6)
          .style("fill", (d) => { return !d.children && d._children ? d3.hsl(base.highlightColorScale(d.data.type, "noun", '#777')).brighter(1.5) : "#fff"; })
          .style("stroke", (d) => { return base.highlightColorScale(d.data.type, "noun", '#777') })
          .on('touchstart', function(d) { d3.event.stopPropagation(); })
          .on('mousedown', function(d) { d3.event.stopPropagation(); })
          .on("click", (d) => {
            // the non-node "d" items here aren't the right ones, for some reason...
            // so getDescendantForData finds the most updated "d" (shouldn't be necessary)
            d = this.getDescendantForData(d.data);
            if (d.data.children) {
              this.lastToggledNode = d;
              if (d3.event.defaultPrevented) return; // ignore drag
              this.branchToggle(d);
              this.pathUpdate(this.root);
              if (base.isHierarchyNodeMaximized(d)) {
                if (base.isVisOfCurrentPage()) {
                  setTimeout(function() { base.loadNode(d.data.node.slug, false, 2, base.updateInspector); }, 500);
                }
              }
            }
            var index;
            index = base.selectedNodes.indexOf(d.data.node);
            if (index == -1) {
              base.selectedNodes = [d.data.node];
            } else {
              base.selectedNodes = [];
            }
            base.updateInspector();
          });

        nodeEnter.append("svg:text")
          .attr("x", function(d) { return d.children || d._children ? -14 : 14; })
          .attr("dy", ".35em")
          .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
          .text(function(d) { return d.data.title; })
          .style("fill-opacity", 1e-6)
          .on('touchstart', function(d) { d3.event.stopPropagation(); })
          .on('mousedown', function(d) { d3.event.stopPropagation(); })
          .on('click', function(d) {
            if (d3.event.defaultPrevented) return; // ignore drag
            d3.event.stopPropagation();
            if (d.data.node) {
              window.open(d.data.node.url, '_blank');
            }
          });

        // Transition nodes to their new position.
        var nodeUpdate = treevis_node.merge(nodeEnter).transition()
          .duration(duration)
          .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

        nodeUpdate.selectAll("circle")
          .attr("r", 8)
          .style("fill", (d) => { d = this.getDescendantForData(d.data); return !d.children && d._children ? d3.hsl(base.highlightColorScale(d.data.type, "noun", '#777')).brighter(1.5) : "#fff"; });

        nodeUpdate.selectAll("text")
          .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = treevis_node.exit().transition()
          .duration(duration)
          .attr("transform", function(d) {
            var source = d.parent;
            if (d.parent) {
              while (base.isHierarchyNodeMaximized(source) && source.parent) {
                source = source.parent;
              }
              return "translate(" + source.y + "," + source.x + ")";
            } else {
              return "translate(" + d.y + "," + d.x + ")";
            }
          })
          .remove();

        nodeExit.selectAll("circle")
          .attr("r", 1e-6);

        nodeExit.selectAll("text")
          .style("fill-opacity", 1e-6);

        // Update the links…
        var treevis_link = this.container.selectAll("path.clusterlink")
          .data(root.links(nodes), function(d, i) {
            var source = (d.source.data.node == null) ? d.source.data.title : d.source.data.node.slug;
            var target = (d.target.data.node == null) ? d.target.data.title : d.target.data.node.slug;
            return source + '-' + target + '-' + d.source.depth + '-' + d.target.data.localIndex;
          });

        // Enter any new links at the parent's previous position.
        var linkEnter = treevis_link.enter().insert("svg:path", "g")
          .attr("class", "clusterlink")
          .attr("d", (d) => {
            var source;
            if (this.lastToggledNode) {
              source = this.lastToggledNode;
            } else {
              source = d.source;
            }
            var o;
            o = { x: source.x0, y: source.y0 };
            return base.diagonal({ source: o, target: o });
          })
          .transition()
          .duration(duration)
          .attr("d", base.diagonal);

        // Transition links to their new position.
        treevis_link.merge(linkEnter).transition()
          .duration(duration)
          .attr("d", base.diagonal);

        // Transition exiting nodes to the parent's new position.
        treevis_link.exit().transition()
          .duration(duration)
          .attr("d", function(d) {
            var source = d.source;
            while (base.isHierarchyNodeMaximized(source) && source.parent) {
              source = source.parent;
            }
            var o = { x: source.x, y: source.y };
            return base.diagonal({ source: o, target: o });
          })
          .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
          d.x0 = d.x;
          d.y0 = d.y;
        });
      }
    }

    /************************
     * RADIAL VISUALIZATION *
     ************************/

    class RadialVisualization extends AbstractVisualization {

      constructor() {
        super();
        this.currentNode = null;
        this.minChordAngle = .02;
        this.maximizedNode = null;
        this.highlightedNode = null;
        this.currentNode = scalarapi.model.getCurrentPageNode();
      }

      draw() {
        this.hasBeenDrawn = false; // vis overdraws itself if we don't do this; need to investigate
        super.draw();

        // setup rollover caption
        this.rollover = $('<div class="rollover caption_font">Test</div>').appendTo(base.visualization);
        base.visualization.on('mousemove', (e) => {
          this.rollover.css('left', (e.pageX - $(base.visualization).offset().left + parseInt($(base.visualization).parent().parent().css('padding-left')) + 10) + 'px');
          this.rollover.css('top', (e.pageY - $(base.visualization).parent().offset().top) + 15 + 'px');
        })

        if (base.svg != null) {
          this.myModPercentage = 1;		// relative value of the farthest descendants maximized item
          this.otherModPercentage = 1;		// relative value of the farthest descendants of the not-maximized item
          this.r = (Math.min(this.size.width, this.size.height) - 70) * .5;
          this.size.width < this.size.height ? this.r -= 120 : this.r -= 60;
          var radiusMod = 1.55;
          this.textRadiusOffset = 10;

          this.updateNoResultsMessage(base.sortedNodes);

          // arc generator
          this.arcs = d3.arc()
            .startAngle((d) => { return d.x0 - (Math.PI * .5); })
            .endAngle((d) => { return d.x1 - (Math.PI * .5); })
            .innerRadius((d) => { return (this.r * radiusMod) - Math.sqrt(d.y0); })
            .outerRadius((d) => { return (this.r * radiusMod) - Math.sqrt(d.y1); });

          // note: d3.hierarchy takes each node of base.hierarchy and sets it
          // as the 'data' property of a new node that takes the old node's place in a recreated hierarchy
          // bear this in mind when translating between base.[whatever] items and root.descendants() items,
          // as the former will lack that additional level of abstraction
          this.root = d3.hierarchy(base.hierarchy)
            .sum((d) => { return this.sumHierarchy(d); })
            .sort();

          // layout which drives the arc display
          d3.partition().size([Math.PI * 2, this.r * this.r])(this.root);

          this.vis.selectAll('path.ring')
            .data(this.root.descendants())
            .join(
              enter => enter.append('svg:path')
                .attr('class', 'ring')
                .attr('d', this.arcs)
                .style('stroke-width', (d) => { return this.calculateRingStroke(d); })
                .style('stroke', 'white')
                .attr('cursor', 'pointer')
                .attr('display', function(d) { return d.depth ? null : "none"; })
                .style('fill', function() { return base.neutralColor; })
                .each(this.stash)
                .on('mouseover', (d) => {
                  this.highlightedNode = d;
                  this.updateHighlights(d);
                })
                .on('mouseout', function(d) {
                  if (this.highlightedNode == d) {
                    this.highlightedNode = null;
                    this.updateHighlights(d);
                  }
                })
                .on('dblclick', function(d) {
                  if (d.data.node) {
                    window.open(d.data.node.url, '_blank');
                  }
                })
                .on('click', (d) => {
                  var dx = this.arcs.centroid(d)[0];
                  var dy = this.arcs.centroid(d)[1];
                  var hw = this.size.width * .5;

                  // if the node was maximized, normalize it
                  if (this.maximizedNode == d) {
                    this.maximizedNode = null;
                    this.root.sum((d) => { return this.sumHierarchy(d); }).sort();
                    d3.partition().size([Math.PI * 2, this.r * this.r])(this.root);
                    this.transitionRings();
                    this.transitionChords();
                    this.transitionTypeLabels();
                    this.transitionSelectedLabels();
                    this.transitionSelectedPointers();

                  } else {
                    // if the node has children, then maximize it and transition the vis to its maximized state
                    if (d.children != null) {
                      var numChildren = d.data.descendantCount;
                      var curPercentage = numChildren / base.sortedNodes.length;
                      var targetPercentage = Math.min(.75, (numChildren * 15) / 360);
                      if (targetPercentage > curPercentage) {
                        this.maximizedNode = d;

                        // set the relative values of the farthest descendants of the maximized and non-maximized nodes
                        this.myModPercentage = targetPercentage / curPercentage;
                        this.otherModPercentage = (1 - targetPercentage) / (1 - curPercentage);

                        this.root.sum((d) => { return this.sumHierarchy(d); }).sort();
                        d3.partition().size([Math.PI * 2, this.r * this.r])(this.root);
                        this.transitionRings();
                        this.transitionChords();
                        this.transitionTypeLabels();
                        this.transitionSelectedLabels();
                        this.transitionSelectedPointers();
                      }
                    } else {
                      this.toggleNodeSelected(d);
                    }
                  }
                })
            )

          if (this.root.height > 1) {
            this.calculateChords();

            this.ribbon = d3.ribbon()
              .startAngle(function(d) { return d.x0 - (Math.PI * .5); })
              .endAngle(function(d) { return d.x1 - (Math.PI * .5); })
              .radius(function(d) { return (this.r * radiusMod) - Math.sqrt(d.y1); });

            // create the chords
            this.vis.selectAll('path.chord')
              .data(this.links)
              .join(
                enter => enter.append('svg:path')
                  .attr('class', 'chord')
                  .attr('d', (d) => { return this.ribbon(d); })
                  .attr('opacity', .25)
                  .attr('display', (d) => { return this.calculateChordDisplay(d); })
                  .attr('fill', (d) => { return base.highlightColorScale(d.type); })
                  .each(this.stashChord),
                exit => exit.remove()
              );
          }

          if (base.hierarchy.children != null) {

            // create the type labels
            var labels = this.vis.selectAll('text.typeLabel')
              .data(this.root.children)
              .join(
                enter => enter.append('svg:text')
                  .attr('class', 'typeLabel')
                  .attr('dx', (d) => { return this.calculateTextDx(d); })
                  .attr('dy', '.35em')
                  .attr('fill', '#666')
                  .attr('text-anchor', (d) => { return this.calculateTextAnchor(d); })
                  .attr('transform', (d) => { return this.calculateTextTransform(d); })
                  .text((d) => { return d.data.title; }),
                exit => exit.remove()
              )
          }

          this.updateSelectedLabels();
          this.updateHighlights();
        }
      }

      getHelpContent() {
        var helpContent;
        if (base.options.content == 'all' || base.isVisOfCurrentPage()) {
          helpContent = "This visualization shows how <b>&ldquo;" + this.currentNode.getDisplayTitle() + "&rdquo;</b> is connected to other content in this work.<ul>";
        } else {
          helpContent = "This visualization shows <b>how content is interconnected</b> in this work.<ul>";
        }
        helpContent += "<li>Each inner arc represents a connection, color-coded by type.</li>" +
          "<li>Roll over the visualization to browse connections.</li>" +
          "<li>Click to add more content to the current selection.</li>" +
          "<li>To explore a group of connections in more detail, click its outer arc to expand the contents.</li>" +
          "<li>Click the name of any item to navigate to it.</li></ul>";
        return helpContent;
      }

      setupElement() {
        base.visualization.empty();
        base.visualization.addClass('bounded');
        base.svg = d3.select(base.visualization[0]).append('svg:svg')
          .attr('width', this.size.width)
          .attr('height', this.size.height);
        this.vis = base.svg.append("g")
          .attr("transform", "translate(" + this.size.width / 2 + "," + this.size.height / 2 + ")")
          .attr("class", "radialvis");
        this.vis.append('svg:rect')
          .attr('width', this.size.width)
          .attr('height', this.size.height)
          .attr('class', 'viscanvas');
        this.radialBaseLayer = base.svg.append('svg:g')
          .attr('width', this.size.width)
          .attr('height', this.size.height);
      }

      transitionRings() {
        this.vis.selectAll('path.ring').transition()
          .duration(1000)
          .style("stroke-width", (d) => { return this.calculateRingStroke(d); })
          .attrTween('d', (d) => { return this.arcTween(d); });
      }

      transitionChords() {
        this.vis.selectAll('path.chord').transition()
          .duration(1000)
          .attr('display', (d) => { return this.calculateChordDisplay(d); })
          .attrTween('d', (d) => { return this.chordTween(d); });
      }

      transitionTypeLabels() {
        this.vis.selectAll('text.typeLabel').transition()
          .duration(1000)
          .attrTween('dx', (d) => { return this.textDxTween(d); })
          .attrTween('text-anchor', (d) => { return this.textAnchorTween(d); })
          .attrTween('transform', (d) => { return this.textTransformTween(d); });
      }

      transitionSelectedLabels() {
        this.vis.selectAll('text.selectedLabel').transition()
          .duration(1000)
          .attr('dx', (d) => {
            if (this.arcs.centroid(d)[0] < 0) {
              return -(this.size.width * .5) + 10;
            } else {
              return (this.size.width * .5) - 10;
            }
          })
          .attr('dy', (d) => { return this.arcs.centroid(d)[1] + 4; })
          .attrTween('text-anchor', (d) => { return this.selectedTextAnchorTween(d); });
      }

      transitionSelectedPointers() {
        this.vis.selectAll('polyline.selectedPointer').transition()
          .duration(1000)
          .attr('points', (d) => { return this.getPointerPoints(d); });
      }

      getPointerPoints(d) {
        var dx = this.arcs.centroid(d)[0];
        var dy = this.arcs.centroid(d)[1];
        var hw = this.size.width * .5 - 10;
        if (this.arcs.centroid(d)[0] < 0) {
          return ((d.textWidth + 5) - hw) + ',' + dy + ' ' + ((d.textWidth + 5) - hw) + ',' + dy + ' ' + dx + ',' + dy;
        } else {
          return (hw - (d.textWidth + 5)) + ',' + dy + ' ' + (hw - (d.textWidth + 5)) + ',' + dy + ' ' + dx + ',' + dy;
        }
      }

      toggleNodeSelected(d) {
        var index;
        index = base.selectedNodes.indexOf(d.data.node);
        if (index == -1) {
          base.selectedNodes.push(d.data.node);
          index = base.selectedHierarchyNodes.indexOf(d.data);
          if (index == -1) {
            base.selectedHierarchyNodes.push(d.data);
          }
          //base.loadNode(d.data.node.slug, 0, 0, base.updateInspector);
        } else {
          base.selectedNodes.splice(index, 1);
          index = base.selectedHierarchyNodes.indexOf(d.data);
          if (index != -1) {
            base.selectedHierarchyNodes.splice(index, 1);
          }
        }
        base.updateInspector();
        this.updateSelectedLabels();
        this.updateHighlights(d);
      }

      updateSelectedLabels() {
        var labelCharCount = Math.round(((((this.size.width - (this.r * 2)) - 70) - 70) / 120) * 15);

        // create a local version of selectedHierarchyNodes that
        // includes arc coordinates
        this.selectedHierarchyNodes = [];
        var descendant, index;
        var descendants = this.root.descendants();
        var n = descendants.length;
        for (var i = 0; i < n; i++) {
          descendant = descendants[i];
          index = base.selectedHierarchyNodes.indexOf(descendant.data);
          if (index != -1) {
            this.selectedHierarchyNodes.push(descendant);
          }
        }

        this.vis.selectAll('text.selectedLabel')
          .data(this.selectedHierarchyNodes)
          .join(
            enter => enter.append('svg:text')
              .attr('class', 'selectedLabel')
              .attr('dx', (d) => {
                if (this.arcs.centroid(d)[0] < 0) {
                  return -(this.size.width * .5) + 10;
                } else {
                  return (this.size.width * .5) - 10;
                }
              })
              .attr('dy', (d) => {
                return this.arcs.centroid(d)[1] + 4;
              })
              .attr('text-anchor', (d) => {
                if (this.arcs.centroid(d)[0] < 0) {
                  return null;
                } else {
                  return 'end';
                }
              })
              .text((d) => { return base.getShortenedString(d.data.node.getDisplayTitle(true), labelCharCount); })
              .attr('fill', '#000')
              .attr('font-weight', 'bold')
              .on("click", (d) => {
                if (d.data.node) {
                  window.open(d.data.node.url, '_blank');
                }
              })
              .each(function(d) { d.textWidth = this.getComputedTextLength(); }),
            update => update
              .attr('dx', (d) => {
                var title = base.getShortenedString(d.data.node.getDisplayTitle(true), labelCharCount);
                if (this.arcs.centroid(d)[0] < 0) {
                  return -(this.size.width * .5) + 10;
                } else {
                  return (this.size.width * .5) - 10;
                }
              })
              .attr('dy', (d) => {
                return this.arcs.centroid(d)[1] + 4;
              })
              .text((d) => { return base.getShortenedString(d.data.node.getDisplayTitle(true), labelCharCount); })
              .attr('text-anchor', (d) => {
                if (this.arcs.centroid(d)[0] < 0) {
                  return null;
                } else {
                  return 'end';
                }
              })
              .each(function(d) { d.textWidth = this.getComputedTextLength(); }),
            exit => exit.remove()
          );

        this.vis.selectAll('polyline.selectedPointer')
          .data(this.selectedHierarchyNodes)
          .join(
            enter => enter.append('svg:polyline')
              .attr('class', 'selectedPointer')
              .attr('points', (d) => { return this.getPointerPoints(d); })
              .attr('stroke', '#444')
              .attr('stroke-width', 1),
            update => update
              .attr('points', (d) => { return this.getPointerPoints(d); }),
            exit => exit.remove()
          )
      }

      updateHighlights(d) {

        // show the rollover label if this item has no children, i.e. is a single content item, not a parent
        let rolloverVisible = false;
        if (d != null) {
          if (this.highlightedNode && d.data.showsTitle) {
            this.rollover.html(d.data.title);
            this.rollover.css('display', 'block');
            rolloverVisible = true;
          }
        }

        if (!rolloverVisible) {
          this.rollover.css('display', 'none');
        }

        // darken the arcs of the rolled-over node and its descendants
        this.vis.selectAll('path.ring')
          //.data(partition.nodes)
          .style('stroke-width', (d) => {
            if (d.parent != null) {
              if ((d.parent.data.type == "current") || (d.data.type == "current")) {
                return 5;
              } else {
                return (Math.abs(d.x1 - d.x0) > this.minChordAngle) ? 1 : 0;
              }
            } else {
              return (Math.abs(d.x1 - d.x0) > this.minChordAngle) ? 1 : 0;
            }
          })
          .style('fill', (d) => {

            var color = base.neutralColor,
              okToHighlight = true;

            // if the item isn't the root, then
            if (d.parent != null) {

              // if it's representing the current content, then make it white
              if (d.data.type == "current") {
                if ((d.children == null) || (!base.options.local && (d.children == null))) {
                  color = "#000000";
                } else {
                  color = "#ffffff";
                }

                // if the mouse is over the arc and it's not representing an individual item, then color it by noun
              } else if (d == this.highlightedNode) {

                if (d.children != null) {
                  color = base.highlightColorScale(d.data.type, "noun");
                } else {
                  color = base.neutralColor;
                }

                // if we got an actual color, then don't darken it when highlighted
                if (color != base.neutralColor) {
                  okToHighlight = false;
                }
              }
            }
            return (
              ((d == this.highlightedNode) ||
                (base.hasHierarchyNodeAsAncestor(d.data, this.highlightedNode !== null ? this.highlightedNode.data : null)) ||
                ((base.selectedNodes.indexOf(d.data.node) != -1) && (d.data.node != null))) &&
              okToHighlight)
              ? d3.rgb(color).darker()
              : color;
          })

        // darken the chords connected to the rolled-over node
        this.vis.selectAll('path.chord')
          .attr('opacity', (d) => {
            // chord is connected to a selected node
            if (
              (base.selectedNodes.indexOf(d.source.data.node) != -1) ||
              (base.selectedNodes.indexOf(d.target.data.node) != -1)
            ) {
              return .9;

              // chord is connected to a rolled over node
            } else if (
              (
                (d.source == this.highlightedNode) ||
                (d.target == this.highlightedNode) ||
                base.hasHierarchyNodeAsAncestor(d.source.data, this.highlightedNode ? this.highlightedNode.data : null)
              ) || (
                base.hasHierarchyNodeAsAncestor(d.target.data, this.highlightedNode ? this.highlightedNode.data : null)
              )
            ) {
              return .9;

              // chord isn't connected to anything selected or rolled over
            } else {
              return .25;
            }

          })
          .attr('fill', (d) => {
            return (
              (d.source == this.highlightedNode) ||
              (d.target == this.highlightedNode) ||
              base.hasHierarchyNodeAsAncestor(d.source.data, this.highlightedNode ? this.highlightedNode.data : null) ||
              base.hasHierarchyNodeAsAncestor(d.target.data, this.highlightedNode ? this.highlightedNode.data : null) ||
              (base.selectedNodes.indexOf(d.source.data.node) != -1) ||
              (base.selectedNodes.indexOf(d.target.data.node) != -1)
            )
              ? base.highlightColorScale(d.type, "verb")
              : base.neutralColor;
          });
      }

      // store current arc data for use in transitions
      stash(d) {
        d.x0_s = d.x0;
        d.x1_s = d.x1;
      }

      // store current chord data for use in transitions
      stashChord(d) {
        d.source_s = { x0: d.source.x0, x1: d.source.x1 };
        d.target_s = { x0: d.target.x0, x1: d.target.x1 };
      }

      sumHierarchy(d) {
        if (this.maximizedNode) {
          // if the maximized node is a top-level node, and this node is a bottom-level node, then
          if ((this.maximizedNode.children != null) && (d.parent ? (d.parent.parent ? true : false) : false) && (d.children == null)) {
            // if the maximized node is an ancestor of this node, then return its maximized value
            if (base.hasHierarchyNodeAsAncestor(d, this.maximizedNode.data)) {
              return this.myModPercentage;
              // otherwise, return its minimized value
            } else {
              return this.otherModPercentage;
            }
            // otherwise, just return the standard value
          } else {
            return d.children ? 0 : 1;
          }
          // return the standard value
        } else {
          return d.children ? 0 : 1;
        }
      }

      // interpolates between path data for two arcs
      arcTween(a) {
        var i = d3.interpolate({ x0: a.x0_s, x1: a.x1_s }, a);
        return (t) => {
          var b = i(t);
          a.x0_s = b.x0;
          a.x1_s = b.x1;
          return this.arcs(b);
        };
      }

      // interpolates between path data for two chords
      chordTween(a) {
        var i = d3.interpolate({ source: { x0: a.source_s.x0, x1: a.source_s.x1 }, target: { x0: a.target_s.x0, x1: a.target_s.x1 } }, a);
        return (t) => {
          var b = i(t);
          a.source_s = { x0: b.source.x0, x1: b.source.x1 };
          a.target_s = { x0: b.target.x0, x1: b.target.x1 };
          return this.ribbon(b);
        };
      }

      calculateChords() {
        this.links = [];

        // recreate the abstractedNodesBySlug locally since the global
        // version doesn't include the arc coordinates
        this.abstractedNodesBySlug = {};
        var descendant;
        var descendants = this.root.descendants();
        var n = descendants.length;
        for (var i = 0; i < n; i++) {
          descendant = descendants[i];
          if (descendant.data.node) {
            this.abstractedNodesBySlug[descendant.data.node.slug] = descendant;
          }
        }

        var link, localLink;
        n = base.links.length;
        for (i = 0; i < n; i++) {
          link = base.links[i];
          localLink = {
            source: this.abstractedNodesBySlug[link.source.node.slug],
            target: this.abstractedNodesBySlug[link.target.node.slug],
            type: link.type.id
          };
          // this prevents toc links from being added, since their source node is null
          if (localLink.source && localLink.target) {
            this.links.push(localLink);
          }
        }
      }

      calculateRingStroke(d) {
        if (d.parent != null) {
          if ((d.parent.type == "current") || (d.type == "current")) {
            return 10;
          } else {
            return (d.x1 > this.minChordAngle) ? 1 : 0;
          }
        } else {
          return (d.x1 > this.minChordAngle) ? 1 : 0;
        }
      }

      calculateChordDisplay(d) {
        return ((Math.abs(d.source.x1 - d.source.x0) > this.minChordAngle) || (Math.abs(d.target.x1 - d.target.x0) > this.minChordAngle)) ? null : 'none';
      }

      calculateTextAngleOrientation(d) {
        d.angle = (((d.x0 + ((d.x1 - d.x0) * .5)) / (Math.PI * 2)) * 360 - 180);
        d.isFlipped = (d.angle > 90 || d.angle < -90);
      }

      // calculates the position of a type label
      calculateTextDx(d) {
        this.calculateTextAngleOrientation(d);
        return d.isFlipped ? -10 : 10;
      }

      // calculates the anchor point of a type label
      calculateTextAnchor(d) {
        this.calculateTextAngleOrientation(d);
        return d.isFlipped ? 'end' : null;
      }

      // calculates the transform (rotation) of a type label
      calculateTextTransform(d) {
        this.calculateTextAngleOrientation(d);
        d.amount = this.r + this.textRadiusOffset;
        var angleProxy = d.angle;
        var amountProxy = d.amount;
        if (d.isFlipped) {
          angleProxy += 180;
          amountProxy *= -1;
        }
        return 'rotate(' + angleProxy + ') translate(' + amountProxy + ',0) ';
      }

      // interpolates between position data for two type labels
      textDxTween(a) {
        var i = d3.interpolate({ x0: a.x0_s, x1: a.x1_s }, a);
        return (t) => {
          var b = i(t);
          a.x0_s = b.x0;
          a.x1_s = b.x1;
          return this.calculateTextDx(b);
        };
      }

      // interpolates between anchor point data for two type labels
      textAnchorTween(a) {
        var i = d3.interpolate({ x0: a.x0_s, x1: a.x1_s }, a);
        return (t) => {
          var b = i(t);
          a.x0_s = b.x0;
          a.x1_s = b.x1;
          return this.calculateTextAnchor(b);
        };
      }

      // interpolates between transform data for two type labels
      textTransformTween(a) {
        var i = d3.interpolate({ x0: a.x0_s, x1: a.x1_s }, a);
        return (t) => {
          var b = i(t);
          a.x0_s = b.x0;
          a.x1_s = b.x1;
          return this.calculateTextTransform(b);
        };
      }

      // interpolates anchor for the selected text label
      selectedTextAnchorTween(d) {
        var i = d3.interpolate({ x0: d.x0_s, x1: d.x1_s }, d);
        return (t) => {
          var angle;
          if (t < .5) {
            angle = (((d.x0_s + ((d.x1_s - d.x0_s) * .5)) / (Math.PI * 2)) * 360 - 180);
          } else {
            angle = (((d.x0 + ((d.x1 - d.x0) * .5)) / (Math.PI * 2)) * 360 - 180);
          }
          var isFlipped = (angle > 90 || angle < -90);
          if (isFlipped) {
            return null;
          } else {
            return 'end';
          }
        }
      }
    }

    /********************************
     * FORCE-DIRECTED VISUALIZATION *
     ********************************/
    class ForceDirectedVisualization extends AbstractVisualization {

      constructor() {
        super();
      }

      draw() {
        super.draw();

        if (base.svg != null) {
          this.forceLink.links(base.links);
          base.force.nodes(base.abstractedSortedNodes).alpha(.3);

          this.updateNoResultsMessage(base.abstractedSortedNodes);

          this.container = base.svg.selectAll('g.container');

          this.linkSelection = this.container.selectAll('.link')
            .data(base.links, function(d) { return d.source.node.slug + '-' + d.target.node.slug; });
          this.linkSelection.enter().insert('svg:line', '.node')
            .attr('class', 'link')
            .attr('stroke-width', function(d) {
              return base.linkIsBeingInteractedWith(d) ? "3" : "1";
            })
            .attr('stroke-opacity', function(d) {
              return base.linkIsBeingInteractedWith(d) ? '1.0' : '0.5';
            })
            .attr('stroke', function(d) {
              return base.linkIsBeingInteractedWith(d) ? base.neutralColor : '#999';
            });
          this.linkSelection.exit().remove();

          this.nodeSelection = this.container.selectAll('g.node')
            .data(base.force.nodes(), function(d) { return d.node.slug; });

          var nodeEnter = this.nodeSelection.enter().append('svg:g')
            .attr('class', 'node')
            .attr('x', (d) => { d.x = this.size.width * .5 + (Math.random() * 200 - 100); return d.x; })
            .attr('y', (d) => { d.y = this.size.height * .5 + (Math.random() * 200 - 100); return d.y; })
            .call(this.dragHandling(base.force))
            .on('touchstart', function(d) { d3.event.stopPropagation(); })
            .on('mousedown', function(d) { d3.event.stopPropagation(); })
            .on('click', (d) => {
              if (d3.event.defaultPrevented) return; // ignore drag
              d3.event.stopPropagation();
              var index = base.selectedNodes.indexOf(d.node);
              if (index == -1) {
                base.selectedNodes.push(d.node);
                if (base.options.content == "current" || base.options.content == "lens") {
                  base.loadNode(d.node.slug, false, 1, base.updateInspector);
                }
              } else {
                base.selectedNodes.splice(index, 1);
                base.removeRelatedNodesFromManuallyLoaded(d.node);
              }
              base.updateInspector();
              this.updateGraph();
            })
            .on("mouseover", (d) => {
              base.rolloverNode = d.node;
              this.updateGraph();
            })
            .on("mouseout", () => {
              base.rolloverNode = null;
              this.updateGraph();
            });

          nodeEnter.append('svg:circle')
            .attr('class', 'node')
            .attr('r', '16')
            .attr('fill', function(d) {
              var interpolator = d3.interpolateRgb(base.highlightColorScale(d.node.type.id), d3.rgb(255, 255, 255));
              return ((base.rolloverNode == d.node) || (base.selectedNodes.indexOf(d.node) != -1)) ? interpolator(0) : interpolator(.5);
            });

          // create the text labels
          nodeEnter.append('svg:text')
            .attr('class', 'label')
            .attr('x', function(d) { return d.x; })
            .attr('y', function(d) { return d.y + 21; })
            .attr('text-anchor', 'middle')
            .text(function(d) {
              return ((base.rolloverNode == d.node) || (base.selectedNodes.indexOf(d.node) != -1)) ? d.node.title : d.node.shortTitle;
            });

          nodeEnter.append('svg:rect')
            .attr('class', 'visit-button')
            .attr('rx', '5')
            .attr('ry', '5')
            .attr('width', '48')
            .attr('height', '22')
            .style('display', 'none')
            .on('click', function(d) {
              d3.event.stopPropagation();
              window.open(d.node.url, '_blank');
            });

          nodeEnter.append('svg:text')
            .attr('class', 'visit-button')
            .attr('text-anchor', 'middle')
            .style('display', 'none')
            .text('View »');

          this.nodeSelection.exit().remove();

          base.force.restart();
          this.updateGraph();
        }
      }

      getHelpContent() {
        var helpContent;
        if (!base.isVisOfCurrentPage()) {
          helpContent = "This visualization shows <b>how content is interconnected</b> in this work.<ul>";
        } else {
          helpContent = "This visualization shows how <b>&ldquo;" + base.currentNode.getDisplayTitle() + "&rdquo;</b> is connected to other content in this work.<ul>";
        }

        helpContent += "<li>Each dot represents a piece of content, color-coded by type.</li>" +
          "<li>Scroll or pinch to zoom, or click and hold to drag.</li>" +
          "<li>Click any item to add it to the current selection, and to reveal the content it's related to in turn.</li>" +
          "<li>Click the &ldquo;View&rdquo; button of any selected item to navigate to it.</li></ul>";
        return helpContent;
      }

      setupElement() {
        this.hasBeenDrawn = true;
        base.visualization.empty();
        base.visualization.addClass('bounded');
        base.visualization.css('height', this.size.height + 'px');
        base.visualization.css('padding', '0px');
        base.svg = d3.select(base.visualization[0]).append('svg:svg')
          .attr('width', this.size.width)
          .attr('height', this.size.height);
        var container = base.svg.append('g').attr('class', 'container');
        base.svg.call(d3.zoom().on("zoom", function() { container.attr("transform", d3.event.transform); }));
        base.svg.style("cursor", "move");

        // once we upgrade to D3 4.0, we should implement custom x and y accessors
        // so multiple instances don't try to change each other's positions

        this.forceLink = d3.forceLink().distance(120);

        base.force = d3.forceSimulation()
          .force('link', this.forceLink)
          .force('charge', d3.forceManyBody().strength(-200))
          .force('center', d3.forceCenter(this.size.width * .5, this.size.height * .5))
          .on('tick', () => {
            if (base.svg != null) {
              base.svg.selectAll('line.link')
                .attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; })
                .attr('visibility', function(d) { return (d.source.node.slug == 'toc' || d.target.node.slug == 'toc') ? 'hidden' : 'visible'; });
              base.svg.selectAll('g.node')
                .attr('x', function(d) { return d.x; })
                .attr('y', function(d) { return d.y; })
                .attr('visibility', function(d) { return d.node.slug == 'toc' ? 'hidden' : 'visible'; });
              base.svg.selectAll('circle.node')
                .attr('cx', function(d) { return d.x; })
                .attr('cy', function(d) { return d.y; });
              base.svg.selectAll('text.label')
                .attr('x', function(d) { return d.x; })
                .attr('y', function(d) { return d.y + 28; });
              base.svg.selectAll('rect.visit-button')
                .attr('x', function(d) { return d.x - 24; })
                .attr('y', function(d) { return d.y + 38; });
              base.svg.selectAll('text.visit-button')
                .attr('x', function(d) { return d.x; })
                .attr('y', function(d) { return d.y + 53; });
            }
          });
      }

      dragHandling() {

        function dragStarted(d) {
          if (!d3.event.active) base.force.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(d) {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        }

        function dragEnded(d) {
          if (!d3.event.active) base.force.alphaTarget(0.01);
          d.fx = null;
          d.fy = null;
        }

        return d3.drag()
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded);
      }

      updateGraph() {

        this.linkSelection
          .attr('stroke-width', function(d) {
            return base.linkIsBeingInteractedWith(d) ? "3" : "1";
          })
          .attr('stroke-opacity', function(d) {
            return base.linkIsBeingInteractedWith(d) ? '1.0' : '0.5';
          })
          .attr('stroke', function(d) {
            return base.linkIsBeingInteractedWith(d) ? base.neutralColor : '#999';
          });

        this.container.selectAll('circle.node').attr('fill', function(d) {
          var interpolator = d3.interpolateRgb(base.highlightColorScale(d.node.type.id), d3.rgb(255, 255, 255));
          return ((base.rolloverNode == d.node) || (base.selectedNodes.indexOf(d.node) != -1)) ? interpolator(0) : interpolator(.5);
        });

        this.container.selectAll('.label')
          .attr('fill', function(d) { return ((base.rolloverNode == d.node) || (base.selectedNodes.indexOf(d.node) != -1)) ? "#000" : "#999"; })
          .attr('font-weight', function(d) { return ((base.rolloverNode == d.node) || (base.selectedNodes.indexOf(d.node) != -1)) ? 'bold' : 'normal'; })
          .text(function(d) {
            return ((base.rolloverNode == d.node) || (base.selectedNodes.indexOf(d.node) != -1)) ? d.node.title : d.node.shortTitle;
          });

        this.container.selectAll('rect.visit-button')
          .style('display', function(d) {
            return (base.selectedNodes.indexOf(d.node) != -1) ? 'inherit' : 'none';
          });

        this.container.selectAll('text.visit-button')
          .style('display', function(d) {
            return (base.selectedNodes.indexOf(d.node) != -1) ? 'inherit' : 'none';
          });
      }
    }

    /***************************
     * TAG CLOUD VISUALIZATION *
     ***************************/
    class TagCloudVisualization extends AbstractVisualization {

      constructor() {
        super();
      }

      draw() {
        super.draw();
        this.updateNoResultsMessage(tags);
      }

      getHelpContent() {
        var helpContent = "This visualization shows the relative <b>prevalence of tags</b> in this work." +
          "<ul><li>Each tag&rsquo;s title is sized and colored according to how many items it tags.</li>" +
          "<li>Click any tag&rsquo;s title to navigate to it.</li></ul>";
        return helpContent;
      }

      setupElement() {
        var approot = $('link#approot').attr('href');
        $('head').append('<link rel="stylesheet" type="text/css" href="' + approot + 'views/widgets/jQCloud/jqcloud.min.css">');
        $.getScript(approot + 'views/widgets/jQCloud/jqcloud.min.js', function() {
          base.visualization.addClass("tag_cloud caption_font");
          base.visualization.jQCloud(tags, {
            autoResize: true,
            colors: ['#a50f15', '#cb181d', '#ef3b2c', '#fb6a4a']
          });
        });
      }
    }

    /*********************
     * MAP VISUALIZATION *
     *********************/
    class MapVisualization extends AbstractVisualization {

      constructor() {
        super();
        this.map = null;
        this.oms = null;
        this.markers = [];
        this.infowindows = [];
        this.paths = [];
        this.icons = {}
        this.generateIcon('page');
        this.generateIcon('media');
        this.generateIcon('reply');
        this.generateIcon('tag');
        this.generateIcon('annotation');
        this.generateIcon('path');
      }

      draw() {
        super.draw();

        if (null == this.map) return;

        this.clearMarkers();
        var bounds = new google.maps.LatLngBounds();
        var urls = [];
        var titleMarkup = '';
        var thumbnailMarkup = '';
        var descriptionMarkup = '';
        var contentString = '';
        // Contents of paths connected by lines
        for (var j = 0; j < base.sortedNodes.length; j++) {
          if ('undefined' == typeof (base.sortedNodes[j].scalarTypes.path)) continue;
          var pathTitle = base.sortedNodes[j].getDisplayTitle();
          var pathCoordinates = [];
          let relations = base.sortedNodes[j].getRelations('path', 'outgoing');
          for (var k = 0; k < relations.length; k++) {
            if (null == relations[k].index) continue;  // Not part of the path
            if (null == relations[k].target) continue;  // Not part of the path
            var containingPathNodes = relations[k].body.getRelations('path', 'outgoing');
            if (-1 == urls.indexOf(relations[k].target.url)) urls.push(relations[k].target.url);
            var thumbnail = relations[k].target.thumbnail;
            var description = relations[k].target.getDescription(true);
            titleMarkup = '<div class="caption_font path-breadcrumb"><a href="' + relations[k].body.url + '">' + pathTitle + '</a> (' + relations[k].index + '/' + containingPathNodes.length + ')</div><h2 class="heading_font heading_weight"><a href="' + relations[k].target.url + '">' + relations[k].target.getDisplayTitle() + '</a></h2>';
            thumbnailMarkup = (null != thumbnail) ? '<img style="float:right; margin: 0 0 1rem 1rem;" src="' + thumbnail + '" alt="Thumbnail image" width="120" />' : '';
            descriptionMarkup = (description && description.length) ? description : '';
            contentString = '<div class="google-info-window caption_font">' + titleMarkup + '<div>' + thumbnailMarkup + descriptionMarkup + '</div>';
            var icon = this.getIcon(relations[k].target.scalarTypes);
            var coords = this.drawMarkers(relations[k].target, pathTitle, contentString, icon);
            if (coords.length) {
              for (var m = 0; m < coords.length; m++) {
                pathCoordinates.push(coords[m]);
                bounds.extend(new google.maps.LatLng(coords[m].lat, coords[m].lng));
              };
            }
          }
          var path_key = this.paths.length;
          this.paths[path_key] = new google.maps.Polyline({
            path: pathCoordinates,
            geodesic: true,
            strokeColor: d3.rgb(base.highlightColorScale('path')),
            strokeOpacity: 1.0,
            strokeWeight: 2
          });
          this.paths[path_key].setMap(this.map);
        }
        // All other nodes
        for (var j = 0; j < base.sortedNodes.length; j++) {
          if (-1 != urls.indexOf(base.sortedNodes[j].url)) continue;
          var title = base.sortedNodes[j].getDisplayTitle();
          var thumbnail = base.sortedNodes[j].thumbnail;
          var description = base.sortedNodes[j].getDescription(true);
          titleMarkup = '<h2 class="heading_font heading_weight"><a href="' + base.sortedNodes[j].url + '">' + title + '</a></h2>';
          thumbnailMarkup = (null != thumbnail) ? '<img style="float:right; margin: 0 0 1rem 1rem;" src="' + thumbnail + '" alt="Thumbnail image" width="120" />' : '';
          descriptionMarkup = (description && description.length) ? description : '';
          contentString = '<div class="google-info-window caption_font">' + titleMarkup + '<div>' + thumbnailMarkup + descriptionMarkup + '</div>';
          var icon = this.getIcon(base.sortedNodes[j].scalarTypes);
          var coords = this.drawMarkers(base.sortedNodes[j], title, contentString, icon);
          if (coords.length) {
            for (var m = 0; m < coords.length; m++) {
              bounds.extend(new google.maps.LatLng(coords[m].lat, coords[m].lng));
            };
          }
        }
        this.map.fitBounds(bounds);
        google.maps.event.addListener(this.map, 'idle', () => {  // Prevent map from being zoomed out so far it gets buggy
          var zoom = parseInt(this.map.getZoom());
          if (zoom < 1) {
            this.map.setCenter(new google.maps.LatLng(0, 0));
            this.map.setZoom(1);
          }
        });
        if (!this.markers.length) {
          this.displayNoContentWarning();
        } else {
          this.removeNoContentWarning();
        }
      }

      getHelpContent() {
        return "This visualization will display any selected content that contains geospatial metadata (dcterms:coverage, dcterms:spatial). In the event that pages are part of a path, route lines will be drawn between each page.";
      }

      // one-time visualization setup
      setupElement() {
        this.hasBeenDrawn = true;
        base.visualization.empty();
        base.visualization.css('height', this.size.height + 'px');
        if ('undefined' == typeof (google) || 'undefined' == typeof (google.maps)) {
          $.getScript($('link#approot').attr('href') + 'views/melons/cantaloupe/js/oms.min.js', () => {
            $.getScript('https://maps.googleapis.com/maps/api/js?callback=initGoogleMap&key=' + $('link#google_maps_key').attr('href'), () => {
              this.setupMap();
            });
          });
        } else {
          this.setupMap();
        }
      }

      setupMap() {
        this.map = new google.maps.Map(base.visualization[0], {
          center: { lat: -25.344, lng: 131.036 },
          zoom: 4
        });
        this.oms = new OverlappingMarkerSpiderfier(this.map, {  // https://github.com/jawj/OverlappingMarkerSpiderfier
          markersWontMove: true,
          markersWontHide: false,
          basicFormatEvents: true,
          keepSpiderfied: true
        });
        this.oms.legColors.usual['hybrid'] = this.oms.legColors.usual['satellite'] = this.oms.legColors.usual['terrain'] = this.oms.legColors.usual['roadmap'] = d3.rgb(base.highlightColorScale('path'));
        this.oms.legColors.highlighted['hybrid'] = this.oms.legColors.highlighted['satellite'] = this.oms.legColors.highlighted['terrain'] = this.oms.legColors.highlighted['roadmap'] = 'black';
        this.draw();
      }

      displayNoContentWarning() {
        base.visualization.find('.no-content-warning').remove();
        var $el = $('<div class="no-content-warning" style="position:absolute; z-index:999; top:0px; left:0px; right:0px; bottom:0px; text-align:center; color:#000000;"></div>').appendTo(base.visualization);
        var $inner = $('<div style="background-color:rgba(255, 255, 255, 0.5); margin-top:100px; padding:30px 0px 30px 0px;">Either no items were returned, or no geospatial<br/>metadata could be found on the returned items.<br /><br /><button type="button" class="btn btn-primary btn-sm">Dismiss</button></div>').appendTo($el);
        $inner.find('button').on('click', function() {
          $(this).parent().remove();
        });
      }

      removeNoContentWarning() {
        base.visualization.find('.no-content-warning').remove();
      }

      clearMarkers() {
        this.markers.forEach(function(marker) {
          marker.setMap(null);
        });
        this.markers = [];
        this.infowindows = {};
      }

      drawMarkers(obj, title, content, icon) {
        var coords = this.getCoords(obj);
        if (!coords.length) return false;
        for (var j = 0; j < coords.length; j++) {
          var coord = coords[j];
          // Marker
          var key = this.markers.length;
          this.markers[key] = new google.maps.Marker({
            position: coord,
            title: title,
            html: content,
            icon: {
              url: icon,
              scaledSize: new google.maps.Size(40, 40)
            }
          });
          this.oms.addMarker(this.markers[key]);
          // Infowindow
          this.infowindows[key] = new google.maps.InfoWindow({
            content: content,
            maxWidth: 300
          });
          $(this.markers[key]).data('infowindow', this.infowindows[key]).data('map', this.map);
          this.markers[key].addListener('click', (evt) => {
            base.selectedNodes = [obj];
            base.loadNode(obj.slug, 0, 0, base.updateInspector, false);
            base.updateInspector();
          });
          this.markers[key].addListener('spider_click', function(evt) {
            var infowindow = $(this).data('infowindow');
            var map = $(this).data('map');
            infowindow.open(map, this);
          });
        };
        return coords;
      }

      getCoords(obj) {
        var coords = [];
        if (('undefined' != typeof (obj.current.auxProperties["dcterms:spatial"]))) {
          for (var j = 0; j < obj.current.auxProperties["dcterms:spatial"].length; j++) {
            var spatial = obj.current.auxProperties["dcterms:spatial"][j];
            var latlng = '';
            if (/-?[0-9]{1,3}[.][0-9]+/.test(spatial)) latlng = spatial;
            if (!latlng.length) continue;
            var arr = latlng.split(',');
            if ('undefined' == typeof (arr[1])) continue;
            var row = {};
            row.lat = parseFloat(arr[0].trim());
            row.lng = parseFloat(arr[1].trim());
            coords.push(row);
          }
        }
        if (('undefined' != typeof (obj.current.auxProperties["dcterms:coverage"]))) {
          for (var j = 0; j < obj.current.auxProperties["dcterms:coverage"].length; j++) {
            var coverage = obj.current.auxProperties["dcterms:coverage"][j];
            var latlng = '';
            if (/-?[0-9]{1,3}[.][0-9]+/.test(coverage)) latlng = coverage;
            if (!latlng.length) continue;
            var arr = latlng.split(',');
            if ('undefined' == typeof (arr[1])) continue;
            var row = {};
            row.lat = parseFloat(arr[0].trim());
            row.lng = parseFloat(arr[1].trim());
            coords.push(row);
          }
        }
        return coords;
      }

      generateIcon(type) {

        var imageWidth = 80;
        var imageHeight = 80;

        var svg = d3.select(document.createElement('div')).append('svg')
          .attr('width', '60')
          .attr('height', '60')
          .attr('viewBox', '0 0 60 60');

        var gradient = svg.append("defs")
          .append("linearGradient")
          .attr("id", "grad")
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "0%")
          .attr("y2", "100%");

        gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", d3.rgb(base.highlightColorScale(type)).brighter())
          .attr("stop-opacity", 1);

        gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", d3.rgb(base.highlightColorScale(type)))
          .attr("stop-opacity", 1);

        var g = svg.append('g')

        var path = g.append('path')
          .attr('transform', 'matrix(0.03,0,0,0.03,8,6)')
          .attr('d', 'M730.94,1839.63C692.174,1649.33 623.824,1490.96 541.037,1344.19C479.63,1235.32 408.493,1134.83 342.673,1029.25C320.701,994.007 301.739,956.774 280.626,920.197C238.41,847.06 204.182,762.262 206.357,652.265C208.482,544.792 239.565,458.581 284.387,388.093C358.106,272.158 481.588,177.104 647.271,152.124C782.737,131.7 909.746,166.206 999.814,218.872C1073.41,261.91 1130.41,319.399 1173.73,387.152C1218.95,457.868 1250.09,541.412 1252.7,650.384C1254.04,706.214 1244.9,757.916 1232.02,800.802C1218.99,844.211 1198.03,880.497 1179.38,919.256C1142.97,994.915 1097.33,1064.24 1051.52,1133.6C915.083,1340.21 787.024,1550.91 730.94,1839.63L730.94,1839.63Z')
          .attr('fill', 'url(#grad)')
          .attr('stroke-width', 40)
          .attr('stroke', d3.rgb(base.highlightColorScale(type)).darker());

        var circles = svg.append('circle')
          .attr('cx', '30.2')
          .attr('cy', '27.2')
          .attr('r', '5')
          .style('fill', 'rgb(90,20,16)');

        var svgNode = g.node().parentNode.cloneNode(true),
          image = new Image();

        d3.select(svgNode).select('clippath').remove();

        var xmlSource = (new XMLSerializer()).serializeToString(svgNode);

        image.onload = ((imageWidth, imageHeight) => {
          var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            dataURL;
          d3.select(canvas)
            .attr('width', imageWidth)
            .attr('height', imageHeight);
          context.drawImage(image, 0, 0, imageWidth, imageHeight);
          dataURL = canvas.toDataURL();
          this.icons[type] = dataURL;
        }).bind(this, imageWidth, imageHeight);

        image.src = 'data:image/svg+xml;base64,' + btoa(encodeURIComponent(xmlSource).replace(/%([0-9A-F]{2})/g, function(match, p1) {
          return String.fromCharCode('0x' + p1);
        }));
      }

      getIcon(types) {
        var icon = this.icons.page;
        if ('undefined' != typeof (types.media)) icon = this.icons.media;
        if ('undefined' != typeof (types.reply)) icon = this.icons.reply;
        if ('undefined' != typeof (types.tag)) icon = this.icons.tag;
        if ('undefined' != typeof (types.annotation)) icon = this.icons.annotation;
        if ('undefined' != typeof (types.path)) icon = this.icons.path;
        return icon;
      }

    }

    /*********************
     * WORD CLOUD VISUALIZATION *
     *********************/
    class WordCloudVisualization extends AbstractVisualization {

      constructor() {
        super();
        this.words = [];
        this.isDrawing = false;
        this.stopwords = ['a', 'about', 'above', 'across', 'after', 'afterwards']  // https://programminghistorian.org/en/lessons/counting-frequencies
        this.stopwords += ['again', 'against', 'all', 'almost', 'alone', 'along']
        this.stopwords += ['already', 'also', 'although', 'always', 'am', 'among']
        this.stopwords += ['amongst', 'amoungst', 'amount', 'an', 'and', 'another']
        this.stopwords += ['any', 'anyhow', 'anyone', 'anything', 'anyway', 'anywhere']
        this.stopwords += ['are', 'around', 'as', 'at', 'back', 'be', 'became']
        this.stopwords += ['because', 'become', 'becomes', 'becoming', 'been']
        this.stopwords += ['before', 'beforehand', 'behind', 'being', 'below']
        this.stopwords += ['beside', 'besides', 'between', 'beyond', 'bill', 'both']
        this.stopwords += ['bottom', 'but', 'by', 'call', 'can', 'cannot', 'cant']
        this.stopwords += ['co', 'computer', 'con', 'could', 'couldnt', 'cry', 'de']
        this.stopwords += ['describe', 'detail', 'did', 'do', 'done', 'down', 'due']
        this.stopwords += ['during', 'each', 'eg', 'eight', 'either', 'eleven', 'else']
        this.stopwords += ['elsewhere', 'empty', 'enough', 'etc', 'even', 'ever']
        this.stopwords += ['every', 'everyone', 'everything', 'everywhere', 'except']
        this.stopwords += ['few', 'fifteen', 'fifty', 'fill', 'find', 'fire', 'first']
        this.stopwords += ['five', 'for', 'former', 'formerly', 'forty', 'found']
        this.stopwords += ['four', 'from', 'front', 'full', 'further', 'get', 'give']
        this.stopwords += ['go', 'had', 'has', 'hasnt', 'have', 'he', 'hence', 'her']
        this.stopwords += ['here', 'hereafter', 'hereby', 'herein', 'hereupon', 'hers']
        this.stopwords += ['herself', 'him', 'himself', 'his', 'how', 'however']
        this.stopwords += ['hundred', 'i', 'ie', 'if', 'in', 'inc', 'indeed']
        this.stopwords += ['interest', 'into', 'is', 'it', 'its', 'itself', 'keep']
        this.stopwords += ['last', 'latter', 'latterly', 'least', 'less', 'ltd', 'made']
        this.stopwords += ['many', 'may', 'me', 'meanwhile', 'might', 'mill', 'mine']
        this.stopwords += ['more', 'moreover', 'most', 'mostly', 'move', 'much']
        this.stopwords += ['must', 'my', 'myself', 'name', 'namely', 'neither', 'never']
        this.stopwords += ['nevertheless', 'next', 'nine', 'no', 'nobody', 'none']
        this.stopwords += ['noone', 'nor', 'not', 'nothing', 'now', 'nowhere', 'of']
        this.stopwords += ['off', 'often', 'on', 'once', 'one', 'only', 'onto', 'or']
        this.stopwords += ['other', 'others', 'otherwise', 'our', 'ours', 'ourselves']
        this.stopwords += ['out', 'over', 'own', 'part', 'per', 'perhaps', 'please']
        this.stopwords += ['put', 'rather', 're', 's', 'same', 'see', 'seem', 'seemed']
        this.stopwords += ['seeming', 'seems', 'serious', 'several', 'she', 'should']
        this.stopwords += ['show', 'side', 'since', 'sincere', 'six', 'sixty', 'so']
        this.stopwords += ['some', 'somehow', 'someone', 'something', 'sometime']
        this.stopwords += ['sometimes', 'somewhere', 'still', 'such', 'system', 'take']
        this.stopwords += ['ten', 'than', 'that', 'the', 'their', 'them', 'themselves']
        this.stopwords += ['then', 'thence', 'there', 'thereafter', 'thereby']
        this.stopwords += ['therefore', 'therein', 'thereupon', 'these', 'they']
        this.stopwords += ['thick', 'thin', 'third', 'this', 'those', 'though', 'three']
        this.stopwords += ['three', 'through', 'throughout', 'thru', 'thus', 'to']
        this.stopwords += ['together', 'too', 'top', 'toward', 'towards', 'twelve']
        this.stopwords += ['twenty', 'two', 'un', 'under', 'until', 'up', 'upon']
        this.stopwords += ['us', 'very', 'via', 'was', 'we', 'well', 'were', 'what']
        this.stopwords += ['whatever', 'when', 'whence', 'whenever', 'where']
        this.stopwords += ['whereafter', 'whereas', 'whereby', 'wherein', 'whereupon']
        this.stopwords += ['wherever', 'whether', 'which', 'while', 'whither', 'who']
        this.stopwords += ['whoever', 'whole', 'whom', 'whose', 'why', 'will', 'with']
        this.stopwords += ['within', 'without', 'would', 'yet', 'you', 'your']
        this.stopwords += ['yours', 'yourself', 'yourselves']
        this.stopwords += ['-', 'nbsp', 'nbspnbsp', 'nbspnbspnbsp', 'p']
      }

      draw() {
        if (this.isDrawing) return;
        this.isDrawing = true;
        super.draw();
        base.visualization.addClass("tag_cloud caption_font");
        if ('undefined' == typeof ($.fn.jQCloud)) {
          var approot = $('link#approot').attr('href');
          $('head').append('<link rel="stylesheet" type="text/css" href="' + approot + 'views/melons/cantaloupe/css/vis.css">');
          $('head').append('<link rel="stylesheet" type="text/css" href="' + approot + 'views/widgets/jQCloud/jqcloud.min.css">');
          $.getScript(approot + 'views/widgets/jQCloud/jqcloud.min.js', () => {
            this.drawWordCloud();
          });
        } else {
          this.drawWordCloud();
        }
      }

      getHelpContent() {
        return "This visualization shows the most commonly used words across the main text content of the selected items. For example, if the word \"scholarship\" is present in the main text content of ten pages it will be displayed larger than another word that is present in the text content of only five pages.";
      }

      // one-time visualization setup
      setupElement() {
        this.hasBeenDrawn = true;
      }

      drawWordCloud() {
        base.visualization.css('height', this.size.height + 'px');
        //base.visualization.css('width', this.size.width + 'px');
        if ('undefined' != typeof (base.visualization.jQCloud)) base.visualization.jQCloud('destroy');
        base.visualization.html('<div style="font-weight:normal;">Parsing data...</div>');
        // Create array of words
        var j = 0;
        setTimeout(() => {
          this.doDrawWordCloud(j);
        }, 1);
      }

      doDrawWordCloud(j) {
        if (j >= base.sortedNodes.length) {
          this.finishDrawWordCloud();
          return;
        };
        if (base.sortedNodes[j]) {
          if (base.sortedNodes[j].current) {
            var words = this.getWords(base.sortedNodes[j].current.content);
            this.words = this.mergeWords(this.words, words);
          }
          setTimeout(() => {
            this.doDrawWordCloud(j + 1);
          }, 1);
        } else {
          setTimeout(() => {
            this.doDrawWordCloud(j);
          }, 10);
        }
      }

      finishDrawWordCloud() {

        base.visualization.empty();
        // Render cloud
        base.visualization.jQCloud(this.words, {
          afterCloudRender: function() {
            removeOverflowing: false
          }
        });
        this.updateNoResultsMessage(base.sortedNodes);
        this.isDrawing = false;

      }

      getWords(content) {

        if (!content) return [];
        content = content.replace(/(<([^>]+)>)/ig, " ");  // Strip tags
        content = content.replace(/&nbsp;/g, ' ');  // Non-breaking space to space
        content = $('<textarea />').html(content).text();  // HTML entity decode
        var words = content.split(' ');
        return words;

      }

      mergeWords(arr1, arr2) {

        for (var j = 0; j < arr2.length; j++) {
          if (!arr2[j].length) continue;
          var word = arr2[j].replace(/[^0-9a-zA-Z-]/g, '');
          if (word.length < 3) continue;  // Remove empty or short
          if (this.isAStopWord(word)) continue;  // Remove stop words
          if (!isNaN(word) && word.length != 4) continue;  // Remove numbers if not a year
          var wordIncluded = false;
          for (var k = 0; k < arr1.length; k++) {
            if (arr1[k].text.toLowerCase() == word.toLowerCase()) {
              arr1[k].weight = arr1[k].weight + 1;
              wordIncluded = true;
            }
          }
          if (!wordIncluded) {
            arr1.push({ text: word, weight: 1 });
          }
        }
        return arr1;

      }

      isAStopWord(word) {

        if (word.substr(0, 1) == '&') return true;
        if (this.stopwords.indexOf(word.toLowerCase()) != -1) return true;
        false;

      }
    }

    /**********************
     * LIST VISUALIZATION *
     **********************/
    class ListVisualization extends AbstractVisualization {

      constructor() {
        super();
        this.visList = null;
        this.columnSpecs = {
          'author': { size: 'lg', name: 'Edited By', style: '' },
          'content': { size: 'md', name: 'Content', style: '' },
          'dateCreated': { size: 'lg', name: 'Date Created', style: 'text-align:center' },
          'description': { size: 'md', name: 'Description', style: '' },
          'originalAuthor': { size: 'lg', name: 'Author', style: '' },
          'lastEdited': { size: 'lg', name: 'Last Edited', style: 'text-align:center' },
          'numRelations': { size: 'md', name: '# Relations', style: 'text-align:center' },
          'relationType': { size: 'md', name: 'Item Type', style: 'text-align:center' },
          'stringMatches': { size: 'md', name: 'Matches', style: 'text-align:center' },
          'title': { size: 'sm', name: 'Title', style: '' },
          'version': { size: 'sm', name: 'Version', style: 'text-align:center' },
          'visitDate': { size: 'md', name: 'Visit Date', style: 'text-align:center' }
        }
        this.defaultColumns = ['title', 'description', 'content', 'originalAuthor', 'author', 'lastEdited', 'version']
        this.conditionalColumns = ['created', 'relationType', 'numRelations', 'stringMatches', 'visitDate']
      }

      draw() {
        super.draw();

        this.updateNoResultsMessage(base.contentNodes);

        var columns = this.getColumns();
        this.setupTable(columns);

        // Output rows
        var $tbody = this.visList.find('tbody');
        $tbody.find('.visListRow').remove();
        var maxLength = 100;
        for (var j = 0; j < base.contentNodes.length; j++) {
          var node = base.contentNodes[j]
          var isSelected = (base.selectedNodes.indexOf(base.contentNodes[j]) != -1) ? true : false;
          var $row = $('<tr class="visListRow ' + ((isSelected) ? 'selected' : '') + '" data-index="' + j + '"></div>').appendTo($tbody);
          for (var i = 0; i < columns.length; i++) {
            this.addColumnToRowForNode(columns[i], $row, node)
          }
        };

        // Add/remove items from selectedNodes
        this.visList.find('.visListRow').on('click', function() {
          var $this = $(this);
          var isSelected = $this.hasClass('selected') ? true : false;
          var index = parseInt($this.data('index'));
          var node = base.contentNodes[index];
          if (isSelected) {
            var match = base.selectedNodes.indexOf(node);
            base.selectedNodes.splice(match, 1);
            $this.removeClass('selected');
          } else {
            base.selectedNodes.push(node);
            $this.addClass('selected');
          };
          base.updateInspector();
        });

        // Add/remove columns based on size of parent area
        var width = parseInt(this.visList.parent().width());
        if (width < 400) {  // sm
          this.visList.find('.sm').show();
          this.visList.find('.md, .lg').hide();
        } else if (width < 600) {  // md
          this.visList.find('.sm, .md').show();
          this.visList.find('.lg').hide();
        } else {  // lg
          this.visList.find('.sm, .md, .lg').show();
        };

      }

      getColumns() {
        var columns = this.defaultColumns.concat();
        var hiddenColumns = base.options.lens.visualization.options.hiddenColumns;
        this.setOriginalAuthorColumnInfo();
        if (this.originalAuthor) {
          this.columnSpecs.originalAuthor.name = this.originalAuthor.name;
        } else {
          var index = columns.indexOf('originalAuthor');
          columns.splice(index, 1);
        }
        // add sort-based conditional columns
        for (var i=0; i < this.conditionalColumns.length; i++) {
          var column = this.conditionalColumns[i]
          if (this.lensHasSort(column)) {
            columns.push(column)
          }
        }
        if (hiddenColumns) {
          for (var i=0; i < hiddenColumns.length; i++) {
            var hiddenColumn = hiddenColumns[i];
            var index = columns.indexOf(hiddenColumn);
            if (index != -1) {
              columns.splice(index, 1);
            }
          }
        }
        return columns;
      }

      setOriginalAuthorColumnInfo() {
        // Determine if there is an original author/creator field to add based on metadata
        var candidates = {
          "http://ns.exiftool.ca/IPTC/IPTC/1.0/By-line": "iptc:By-line",
          "http://ns.exiftool.ca/IPTC/IPTC/1.0/Writer-Editor": "iptc:Writer-Editor",
          "http://purl.org/dc/terms/creator": "dcterms:creator"
        }
        var counts = {};
        for (var j = 0; j < base.contentNodes.length; j++) {
          for (var uri in candidates) {
            if ('undefined' != typeof (base.contentNodes[j].current.properties[uri])) {
              if ('undefined' == typeof (counts[uri])) counts[uri] = 0;
              counts[uri]++;
            }
          }
        };
        var fieldValue = 0;
        var fieldToAdd = null;
        for (var field in counts) {
          if (counts[field] > 0 && counts[field] > fieldValue) {
            fieldValue = counts[field];
            fieldToAdd = field;
          }
        };
        if (fieldToAdd) {
          this.originalAuthor =  { field: fieldToAdd, name: candidates[fieldToAdd] }
        } else {
          this.originalAuthor = null
        }
      }

      lensHasSort(sort) {
        return 'undefined' != typeof (base.options.lens.sorts) && 'undefined' != typeof (base.options.lens.sorts[sort])
      }

      headerExistsForColumn(columnType) {
        return this.visList.find('td[prop="' + columnType + '"]').length
      }

      appendColumnHeader(columnType, columnSpec) {
        var row = '<td class="' + columnSpec.size + '" prop="' + columnType + '" style="' + columnSpec.style + '"><a href="javascript:void(null);">' + columnSpec.name + '</a></td>'
        this.visList.find('.header').append(row);
      }

      getRowContent(columnType, columnSpec, content, url) {
        var row = $('<td class="' + columnSpec.size + '" prop="' + columnType + '"></td>');
        if (url) {
          row.append('<a href="' + url + '" target="_blank">' + content + '</a>')
        } else {
          row.append(content);
        }
        return row;
      }

      addColumnToRowForNode(columnType, row, node) {
        var maxLength = 100;
        var columnSpec = this.columnSpecs[columnType];
        switch (columnType) {

          case 'title':
            var url = node.url;
            var title = node.current.title;
            if (null === title) return;
            title = title.replace(/(<([^>]+)>)/gi, "");
            row.append(this.getRowContent(columnType, columnSpec, title, url));
            break

          case 'description':
            var description = ('undefined' != typeof (node.current.description) && null !== node.current.description) ? node.current.description : '';
            if (description.length > maxLength) description = description.substr(0, maxLength) + '...';
            description = description.replace(/(<([^>]+)>)/gi, "");
            row.append(this.getRowContent(columnType, columnSpec, description));
            break

          case 'content':
            var content = ('undefined' != typeof (node.current.content) && null !== node.current.content) ? node.current.content : '';
            if (content.length > maxLength) content = content.substr(0, maxLength) + '...';
            content = content.replace(/(<([^>]+)>)/gi, "");
            row.append(this.getRowContent(columnType, columnSpec, content));
            break
          
          case 'originalAuthor':
            //console.log(columnType, content, node.current.properties)
            var valueToAdd = ('undefined' != typeof (node.current.properties[this.originalAuthor.field])) ? node.current.properties[this.originalAuthor.field][0].value : '';
            row.append(this.getRowContent(columnType, columnSpec, valueToAdd));
            break

          case 'author':
            var author = node.current.properties['http://www.w3.org/ns/prov#wasAttributedTo'][0].value;  // Most recent version
            var authorUrl = $('link#parent').attr('href') + author;
            var authorId = parseInt(authorUrl.substr(authorUrl.lastIndexOf('/') + 1));
            var fullname = ('undefined' != typeof (base.options.lens) && 'undefined' != typeof (base.options.lens.users[authorId])) ? base.options.lens.users[authorId] : '';
            row.append(this.getRowContent(columnType, columnSpec, fullname, authorUrl));
            break

          case 'lastEdited':
            var lastEdited = (node.current.created) ? node.current.created.substr(0, node.current.created.indexOf('T')) : '';
            row.append(this.getRowContent(columnType, columnSpec, lastEdited));
            break

          case 'version':
            var versions = node.current.number;
            row.append(this.getRowContent(columnType, columnSpec, versions));
            break

          case 'created':
            row.append(this.getRowContent(columnType, columnSpec, node.sorts.created.split(" ")[0]));
            break;

          case 'relationType':
            row.append(this.getRowContent(columnType, columnSpec, node.sorts.relationType));
            break;

          case 'numRelations':
            row.append(this.getRowContent(columnType, columnSpec, node.sorts.numRelations));
            break;
          
          case 'stringMatches':
            row.append(this.getRowContent(columnType, columnSpec, node.sorts.stringMatches));
            break;

          case 'visitDate':
            var date = '';
            if (node.sorts.visitDate != 0) {
              var date = new Date(parseInt(node.sorts.visitDate));
              date = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
            }
            row.append(this.getRowContent(columnType, columnSpec, date));
            break;
          
        }
      }

      getHelpContent() {
        var helpContent;
        helpContent = "This visualization shows a list of content in this work.<ul>";
        helpContent += "<li>Each row represents one piece of content.</li>" +
          "<li>You can re-sort the list by clicking the headers.</li>" +
          "<li>Click the title of any item to navigate to it.</li>";
        return helpContent;
      }

      setupTable(columns) {
        console.log('setup table', columns);
        this.visList.empty();
        var $tbody = this.visList.append('<tbody></tbody>');
        var $header = $('<tr class="header"></tr>').appendTo($tbody);
        for (var i=0; i<columns.length; i++) {
          var columnType = columns[i];
          var columnSpec = this.columnSpecs[columnType];
          this.appendColumnHeader(columnType, columnSpec);
        }
        $header.on('click', 'a', function() {
          var $this = $(this);
          var index = $header.find('a').index($this);
          if ($header.data('sortBy') != index) {
            $header.data('sortBy', index);
            $header.data('sortDir', 'asc');
          } else {
            $header.data('sortDir', (($header.data('sortDir') == 'asc') ? 'desc' : 'asc'));
          }
          $tbody.find('tr:not(.header)').sort(function(a, b) {
            if ($header.data('sortDir') == 'asc') {
              return $('td:eq(' + $header.data('sortBy') + ')', a).text().localeCompare($('td:eq(' + $header.data('sortBy') + ')', b).text());
            } else {
              return $('td:eq(' + $header.data('sortBy') + ')', b).text().localeCompare($('td:eq(' + $header.data('sortBy') + ')', a).text());
            }
          }).appendTo($tbody);
        });
      }

      // one-time visualization setup
      setupElement() {
        this.hasBeenDrawn = true;
        base.visualization.empty(); // empty the element where this vis is to be shown
        base.visualization.css('height', this.size.height + 'px');
        var approot = $('link#approot').attr('href');
        var css = approot + 'views/melons/cantaloupe/css/vis.css';
        if (!$('head').find('[href="' + css + '"]').length) $('head').append('<link rel="stylesheet" type="text/css" href="' + css + '">');
        var $overflow = $('<div style="overflow:auto;"></div>').appendTo(base.visualization);
        $overflow.height($overflow.parent().height());
        this.visList = $('<table class="visList"></table>').appendTo($overflow);
      }

    }

    base.init();

  };

  $.scalarvis.defaultOptions = {
    content: 'all',
    relations: 'all',
    format: 'grid',
    modal: false,
    widget: false,
    caption: null
  };

  $.fn.scalarvis = function(options) {
    return this.each(function() {
      (new $.scalarvis(this, options));
    });
  };

})(jQuery);
