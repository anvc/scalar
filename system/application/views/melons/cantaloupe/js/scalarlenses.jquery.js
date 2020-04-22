/*!
 * Scalar Lens plugin
 * Author: Michael Morgan
 * Licensed under the MIT license
 */

;(function ( $, window, document, undefined ) {

    const pluginName = 'ScalarLenses', defaults = {};

    function ScalarLenses( element, options) {
        this.element = element;
        this.options = $.extend( {}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    // Init
    ScalarLenses.prototype.init = function () {
      // You already have access to the DOM element and
      // the options via the instance, e.g. this.element
      // and this.options


      // reference for saveLens callback function
      let me = this;

      this.visualizationOptions = {
          'force-directed': {
                id: 1,
                text:'Force-Directed',
                //iconDark:'../images/icon_forcedir_dark.png',
                iconLight:'light'
              },
              'grid': {
                id: 2,
                text:'Grid'

              },
              'list':{
                id: 3,
                text:'List'

              },
              'map':{
                id: 4,
                text:'Map'

              },
              'radial':{
                id: 5,
                text:'Radial'

              },
            'tree':  {
                id: 6,
                text:'Tree'

              },
              'word-cloud':{
                id: 7,
                text:'Word Cloud'

              }

      }

      this.scalarLensObject = this.getEmbeddedJson();
      if(!this.scalarLensObject) {
        this.scalarLensObject = this.getDefaultJson();
      }
      this.getLensResults();
      this.buildEditorDom();
      this.updateEditorDom();

    }

    // get Embedded data
    ScalarLenses.prototype.getEmbeddedJson = function(){

      // convert metadata div content into a JSON object
      if ($("[property|='scalar:isLensOf']").length > 0) {
        return JSON.parse($("[property|='scalar:isLensOf']").html());
      } else {
        return null;
      }
    }

    // get Default data
    ScalarLenses.prototype.getDefaultJson = function() {
      //console.log('Get default JSON');

      // the Lens object
      return {
        "urn": $('link#urn').attr('href').replace("version", "lens"),
        "submitted": false,
        "frozen": false,
        "frozen-items": [],
        "visualization": null,
        "components": []
      };

    }

    // build DOM
    ScalarLenses.prototype.buildEditorDom = function () {

      /// HTML for Lens default state
      let lensHtml = $(
      '<div class="paragraph_wrapper">'+
        '<div class="body_copy">'+
          '<div class="row lens">'+
            '<div id="lens">'+
              '<div class="col-xs-12">'+
                '<div class="lens-expand-container" data-toggle="collapse" data-target="">'+
                  '<div class="lens-icon-wrapper col-xs-1">'+
                    '<span class="lens-icon"></span>'+
                  '</div>'+
                  '<div class="lens-content col-xs-11">'+
                    '<h3 class="lens-title heading_font heading_weight">(Untitled lens)</h3>' +
                    '<div class="badge">0</div>'+
                  '<div class="lens-tags">'+



                '</div>'+ //lens-expanded container
              '</div>'+ // col-12 wrapper
            '</div>'+ // lens wrapper
          '</div>'+ // row
        '</div>'+ // body copy
      '</div>' // paragraph wrapper

    )
      lensHtml.find('.lens-tags').append(this.addVisualizationButton())
      lensHtml.append(this.addContentTypeModal());
      lensHtml.append(this.addDistanceModal());

      $(this.element).append(lensHtml);

      this.buttonContainer = $(this.element).find('.lens-tags').eq(0);

      let me = this

    }

    // update DOM
    ScalarLenses.prototype.updateEditorDom = function(){

      if (!this.scalarLensObject.title) {
        $(this.element).find('.lens-title').text('(Untitled Lens)');
      }

      this.updateVisualizationButton(this.scalarLensObject.visualization);

      if(this.scalarLensObject.components.length == 0){
         let button = this.addContentSelectorButton(this.buttonContainer, 0);
         this.updateContentSelectorButton(null, button);
         this.scalarLensObject.components[0] = { "content-selector": {}, "modifiers": []}

      } else {

        this.scalarLensObject.components.forEach((component, index) => {
          let button = $(this.element).find('.content-selector-button').eq(index)
          if(button.length == 0){
            button = this.addContentSelectorButton(this.buttonContainer, index);
          }

          this.updateContentSelectorButton(component["content-selector"], button);

        });
      }
    }

    // add content-type modal
    ScalarLenses.prototype.addContentTypeModal = function(){

      let element = $(
        '<div id="modalByType" class="modal fade caption_font" role="dialog">'+
          '<div class="modal-dialog">'+
            '<div class="modal-content">'+
              '<div class="modal-body">'+
                //'<button type="button" class="close" data-dismiss="modal">&times;</button>'+
                '<p>Select all items of this type:</p>'+
                '<div class="btn-group"><button id="byType" type="button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" value"">'+
                    'Select item...<span class="caret"></span></button>'+
                  '<ul id="content-type-dropdown" class="dropdown-menu">'+
                    '<li><a>All content</a></li>'+
                    '<li><a>Page</a></li>'+
                    '<li><a>Media</a></li>'+
                    '<li><a>Path</a></li>'+
                    '<li><a>Tag</a></li>'+
                    '<li><a>Annotation</a></li>'+
                    '<li><a>Comment</a></li>'+
                  '</ul>'+
                '</div>'+
              '</div>'+ // modal body
              '<div class="modal-footer">'+
                '<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>'+
                '<button type="button" class="btn btn-primary done" data-dismiss="modal">Done</button>'+
            '  </div>'+
            '</div>'+ // modal content
          '</div>'+ // modal dialog
        '</div>'
      )

      var me = this

      // store 'items by type' modal content
      element.find('li').on('click', function(){
        $('#byType').text($(this).text()).append('<span class="caret"></span>')
      });

      element.find('.done').on('click', function(){
        let contentSelector = {
          "type": "items-by-type",
          "content-type": $('#byType').text().split(/[_\s]/).join("-").toLowerCase()
        }
        me.scalarLensObject.components[me.editedComponentIndex]["content-selector"] = contentSelector
        me.updateContentSelectorButton(me.scalarLensObject.components[me.editedComponentIndex]["content-selector"], $(me.element).find('.content-selector-button').eq(me.editedComponentIndex))
        me.saveLens(me.getLensResults)
      });
      return element
    }

    // add Distance modal
    ScalarLenses.prototype.addDistanceModal = function(){

      let element = $(
          // Modal for items by Distance
          '<div id="modalByDistance" class="modal fade caption_font" role="dialog">'+
            '<div class="modal-dialog">'+
              '<div class="modal-content">'+
                '<div class="modal-body">'+
                  //'<button type="button" class="close" data-dismiss="modal">&times;</button>'+
                  '<p>Add any item that is within</p>'+
                  '<div class="row">'+
                    '<div class="col-sm-10">'+
                      '<div class="col-sm-5">'+
                        '<input id="distanceQuantity" type="text" class="form-control" aria-label="..." placeholder="Enter distance">'+
                      '</div>'+
                      '<div class="col-sm-5">'+
                        '<div class="btn-group">'+
                          '<button id="distanceUnits" type="button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" value"">'+
                            'Select unit...<span class="caret"></span></button>'+
                          '<ul id="distance-dropdown" class="dropdown-menu">'+
                            '<li><a>miles</a></li>'+
                            '<li><a>kilometers</a></li>'+
                          '</ul>'+
                        '</div>'+ // distance dropdown
                      '</div>'+
                    '</div>'+
                  '</div>'+ // row
                  '<p>of these coordinates:</p>'+
                  '<div class="row">'+
                    '<div class="col-sm-10">'+
                      '<div class="col-sm-5">'+
                        '<input id="latitude" type="text" class="form-control" aria-label="..." placeholder="Latitude (decimal)">'+
                      '</div>'+
                      '<div class="col-sm-5">'+
                        '<input id="longitude" type="text" class="form-control" aria-label="..." placeholder="Longitude (decimal)">'+
                      '</div>'+
                    '</div>'+
                  '</div>'+ // row
                '</div>'+ // modal body
                '<div class="modal-footer">'+
                  '<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>'+
                  '<button id="distanceDone" type="button" class="btn btn-primary done" data-dismiss="modal">Done</button>'+
              '  </div>'+
              '</div>'+
            '</div>'+
          '</div>'
        )

        var me = this

        element.find('li').on('click', function(){
          $('#distanceUnits').text($(this).text()).append('<span class="caret"></span>')
        });

        element.find('.done').on('click', function(){
          let contentSelector = {
            "type":"items-by-distance",
            "quantity": $('#distanceQuantity').val(),
            "units": $('#distanceUnits').text(),
            "coordinates": $('#latitude').val() + ', ' + $('#longitude').val()
          }

          me.scalarLensObject.components[me.editedComponentIndex]["content-selector"] = contentSelector
          me.updateContentSelectorButton(me.scalarLensObject.components[me.editedComponentIndex]["content-selector"], $(me.element).find('.content-selector-button').eq(me.editedComponentIndex))
          me.saveLens(me.getLensResults);

        });

        return element

    }

    // add Visualization button
    ScalarLenses.prototype.addVisualizationButton = function(){

      let element = $(
          '<div class="btn-group"><button type="button" class="btn btn-primary btn-xs dropdown-toggle caption_font visualization-button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
            ' Select visualization <span class="caret"></span></button>'+
            '<ul id="visualization-dropdown" class="dropdown-menu">'+
            '<li><a><span class="viz-icon force"></span>Force-Directed</a></li>'+
            '<li><a><span class="viz-icon grid"></span>Grid</a></li>'+
            '<li><a><span class="viz-icon list"></span>List</a></li>'+
            '<li><a><span class="viz-icon map"></span>Map</a></li>'+
            '<li><a><span class="viz-icon radial"></span>Radial</a></li>'+
            '<li><a><span class="viz-icon tree"></span>Tree</a></li>'+
            '<li><a><span class="viz-icon word-cloud"></span>Word Cloud</a></li>'+
            '</ul>'+
          '</div>'
        )

      var me = this

        element.find('li').on('click', function(){
           let visualizationObj = {
             "type": $(this).text().split(/[_\s]/).join("-").toLowerCase()
           }

          me.scalarLensObject.visualization = visualizationObj
          me.updateVisualizationButton(me.scalarLensObject.visualization)
          me.saveLens(me.getLensResults);

        });
        return element
    }

    // update Visualization button
    ScalarLenses.prototype.updateVisualizationButton = function(visualizationObj){

      let button = $(this.element).find('.visualization-button')

      if(!visualizationObj) {
          button.text('Select visualization...').append('<span class="caret"></span>')
        } else {
          button.text(this.visualizationOptions[visualizationObj.type].text).prepend('<span class="viz-icon '  + visualizationObj.type + ' light"</span>').append('<span class="caret"></span>')
        }
    }

    // add Content-selector button
    ScalarLenses.prototype.addContentSelectorButton = function(element, componentIndex){

      let button = $(
        '<div class="btn-group content-selector-button"><button type="button" class="btn btn-primary btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
              'Select items...<span class="caret"></span></button>'+
            '<ul id="content-dropdown" class="dropdown-menu">'+
              '<li><a>Specific items</a></li>'+
              '<li><a data-toggle="modal" data-target="#modalByType">Items by type</a></li>'+
              '<li><a data-toggle="modal" data-target="#modalByDistance">Items by distance</a></li>'+
            '</ul>'+
          '</div>'
        ).appendTo(element)

        button.data('componentIndex', componentIndex);

        var me = this;

        button.find('li').on('click', function (event) {

          let buttonText = $(this).text();

          me.editedComponentIndex = componentIndex

          switch(buttonText) {
              case 'Specific items':
                // trigger content-selector
                $('<div></div>').content_selector({
                  changeable: true,
                  multiple: true,
                  onthefly: true,
                  msg: 'Choose items to be included in this lens.',
                  callback: function(a){
                    me.handleContentSelected(a)
                  }
                });
              break;

              case 'Items by type':
              break;

              case 'Items by distance':
              break;

          }

        }); // content-selection

      return button

    }

    // update Content-selector button
    ScalarLenses.prototype.updateContentSelectorButton = function(contentSelectorObj, element) {

        let button = element.find('button');

          if(!contentSelectorObj) {
            button.text('Select items...').append('<span class="caret"></span>');
          }

          else {

            let type = contentSelectorObj.type;

            switch(type){

              case 'specific-items':

                  let items = contentSelectorObj.items;
                  let buttonText;

                  if(items.length <= 1){
                    buttonText = '&#8220;'+ items + '&#8221;';
                  } else {
                    let remainingItems = items.length - 1;
                    buttonText = '&#8220;'+ items[0] + '&#8221;' + ' and ' + remainingItems + ' more...';
                  }

                  button.html(buttonText).append('<span class="caret"></span>');

                  break;

              case 'items-by-type':
                  let contentType = contentSelectorObj["content-type"];
                  switch (contentType) {
                    case 'all-content':
                    button.text('All content').append('<span class="caret"></span>');
                    break;
                    case 'page':
                    case 'media':
                    button.text('All ' + scalarapi.model.scalarTypes[contentType].plural).append('<span class="caret"></span>');
                    break;
                    default:
                    button.text('All ' + scalarapi.model.relationTypes[contentType].bodyPlural).append('<span class="caret"></span>');
                    break;
                  }
                  break;

              case 'items-by-distance':
                  let units = contentSelectorObj.units;
                  let abbreviateUnits;

                  // abbreviate units for display
                  if(units === "miles") {
                    abbreviateUnits = "mi";
                  } else if(units === "kilometers") {
                    abbreviateUnits = "km";
                  }

                  let quantity = contentSelectorObj.quantity;
                  let coordinates = contentSelectorObj.coordinates;

                  // JSON updates content button text
                  let updateByDistance = quantity + ' ' + abbreviateUnits + ' from ' + coordinates;

                  button.text('Items ≤ ' + updateByDistance + '').append('<span class="caret"></span>');

                break;

            }
          }



    }

    ScalarLenses.prototype.getLensResults = function() {
      this.scalarLensObject.book_urn = 'urn:scalar:book:' + $('link#book_id').attr('href');
      let url = $('link#approot').attr('href').replace('application/','') + 'lenses';
      $.ajax({
        url: url,
        type: "POST",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(this.scalarLensObject),
        async: true,
        context: this,
        success: function success(data) {
      	  if ('undefined' != typeof(data.error)) {
        		console.log('There was an error attempting to get Lens data: '+data.error);
        		return;
      	  };
          console.log('lens results:');
          console.log(JSON.stringify(data));
        },
        error: function error(response) {
    	     console.log('There was an error attempting to communicate with the server.');
    	     console.log(response);
        }
      });
    }

    // ajax call to post user lens selections
    ScalarLenses.prototype.saveLens = function(successHandler) {
      this.baseURL = $('link#parent').attr('href');
      $.ajax({
        url: this.baseURL + "api/relate",
        type: "POST",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(this.scalarLensObject),
        async: true,
        context: this,
        success: successHandler,
        error: function error(response) {
          console.log(response);
        }
      });
    }

    // callback for content-selector
    ScalarLenses.prototype.handleContentSelected = function(nodes) {

      if (nodes && nodes.length != 0) {
        //console.log(nodes);

        // extract the 'slug' property of each node and put into an array;
        // this gets stored in the "items" property
        let nodeTitles = nodes.map(node => node.title);

        // set JSON object value
        this.scalarLensObject.components[this.editedComponentIndex]["content-selector"].type = 'specific-items';
        this.scalarLensObject.components[this.editedComponentIndex]["content-selector"].items = nodeTitles;

        this.updateEditorDom();
        this.saveLens(this.getLensResults);

      }
    }




    // plugin wrapper around the constructor,
    // to prevent against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                new ScalarLenses( this, options ));
            }
        });
    }



})( jQuery, window, document );
