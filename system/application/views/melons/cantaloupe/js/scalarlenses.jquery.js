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

    // get Embedded data
    ScalarLenses.prototype.getEmbeddedJson = function(){

      console.log('Get Embedded JSON');
      // convert metadata div content into a JSON object
      return JSON.parse($("[property|='scalar:isLensOf']").html());

    }

    // get Default data
    ScalarLenses.prototype.getDefaultJson = function() {
      console.log('Get default JSON');

      // the Lens object
      return {
        "urn": $('link#urn').attr('href').replace("version", "lens"),
        "expanded": false,
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
      let lensHtml =
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
                    '<h3 class="lens-title heading_font heading_weight"> Tokyo Area Commercial Networks <span class="badge">0</span></h3>' +
                  '<div class="lens-tags">'+
                  //
                  /// Visualization dropdown
                  //
                  '<div id="visualization-btn" class="btn-group"><button type="button" class="btn btn-primary btn-xs dropdown-toggle caption_font visualization-button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
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
                  '</div>'+


                '</div>'+ //lens-expanded container
              '</div>'+ // col-12 wrapper
            '</div>'+ // lens wrapper
          '</div>'+ // row
        '</div>'+ // body copy
      '</div>'+ // paragraph wrapper


      //
      /// Modal for items by Type
      //
      '<div id="modalByType" class="modal fade caption_font" role="dialog">'+
        '<div class="modal-dialog">'+
          '<div class="modal-content">'+
            '<div class="modal-body">'+
              //'<button type="button" class="close" data-dismiss="modal">&times;</button>'+
              '<p>Select all items of this type:</p>'+
              '<div class="btn-group"><button id="byType" type="button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" value"">'+
                  'Select item...<span class="caret"></span></button>'+
                '<ul id="content-type-dropdown" class="dropdown-menu">'+
                  '<li><a>Annotation</a></li>'+
                  '<li><a>Comment</a></li>'+
                  '<li><a>Media</a></li>'+
                  '<li><a>Page</a></li>'+
                  '<li><a>Path</a></li>'+
                  '<li><a>Tag</a></li>'+
                '</ul>'+
              '</div>'+
            '</div>'+ // modal body
            '<div class="modal-footer">'+
              '<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>'+
              '<button id="typeDone" type="button" class="btn btn-primary" data-dismiss="modal">Done</button>'+
          '  </div>'+
          '</div>'+ // modal content
        '</div>'+ // modal dialog
      '</div>'+

      //
      // Modal for items by Distance
      //
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
              '<button id="distanceDone" type="button" class="btn btn-primary" data-dismiss="modal">Done</button>'+
          '  </div>'+
          '</div>'+
        '</div>'+
      '</div>';


      // append html when plugin is called
      $(this.element).append(lensHtml);


      this.buttonContainer = $(this.element).find('.lens-tags').eq(0);

      console.log($(this.element).find('.lens-tags'));
      console.log(this.element);
    }

    // update DOM
    ScalarLenses.prototype.updateEditorDom = function(){

      this.updateVisualizationButton(this.scalarLensObject.visualization);

        if(this.scalarLensObject.components.length == 0){
           let button = this.addContentSelectorButton(this.buttonContainer);
           console.log(button);
           this.updateContentSelectorButton(null, button);
           console.log('no compoenents');

        } else {

          this.scalarLensObject.components.forEach((component, index) => {
            let button = $(this.element).find('.content-selector-button').eq(index)
            if(!button){
              button = this.addContentSelectorButton(this.buttonContainer);
            }
            this.updateContentSelectorButton(component["content-selector"], button);

            console.log('some components');

          });

        }

    }

    // add Visualization button
    ScalarLenses.prototype.addVisualizationButton = function(){

        $('#visualization-dropdown li').on('click', function(){
          // show selection in button text
          $('.visualization-button').text($(this).text()).prepend('<span class="viz-icon '  + $(this).text().split(/[_\s]/).join("-").toLowerCase() + ' light"</span>').append('<span class="caret"></span>');

          // now store the text in the scalarOBject viz type property
          // store visualization-type value as kebab-case
          scalarLensObject["visualization"]["type"] = $('#visualization-button').text().split(/[_\s]/).join("-").toLowerCase();

          console.log(scalarLensObject);
          me.saveLens();

        });
    }

    // update Visualization button
    ScalarLenses.prototype.updateVisualizationButton = function(visualizationObj){

      if(!visualizationObj) {
          $('.visualization-button').text('Select visualization...').append('<span class="caret"></span>')
        } else {
          $('.visualization-button').text(this.visualizationOptions[visualizationObj.type].text).prepend('<span class="viz-icon '  + visualizationObj.type + ' light"</span>').append('<span class="caret"></span>')
        }

    }

    // add Content-selector button
    ScalarLenses.prototype.addContentSelectorButton = function(element){

      let button = $(
        '<div class="btn-group"><button type="button" class="btn btn-primary btn-xs dropdown-toggle content-selector-button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
              'Select items...<span class="caret"></span></button>'+
            '<ul id="content-dropdown" class="dropdown-menu">'+
              '<li><a>Specific items</a></li>'+
              '<li><a data-toggle="modal" data-target="#modalByType">Items by type</a></li>'+
              '<li><a data-toggle="modal" data-target="#modalByDistance">Items by distance</a></li>'+
            '</ul>'+
          '</div>'
        ).appendTo(element);

        console.log(element);

      button.on('click', function(event){

        let buttonText = $(this).text();

        // show selection in button text
        //$(this).text($(this).text()).append('<span class="caret"></span>');


        // switch(buttonText) {
        //
        //     case 'Specific items':
        //       // trigger content-selector
        //       $('<div></div>').content_selector({
        //         changeable: true,
        //         multiple: true,
        //         onthefly: true,
        //         msg: 'Choose items to be included in this lens.',
        //         callback: me.handleAddTags
        //       });
        //     break;
        //
        //     case 'Items by type':
        //       // store 'items by type' modal content
        //       $('#content-type-dropdown li').on('click', function(){
        //
        //         $('#byType').text($(this).text()).append('<span class="caret"></span>');
        //
        //         scalarLensObject["components"][0]["content-selector"]["content-type"] = $('#byType').text().split(/[_\s]/).join("-").toLowerCase();
        //
        //       });
        //
        //       $('#typeDone').on('click', function(){
        //
        //         delete scalarLensObject["components"][0]["content-selector"]["items"];
        //         delete scalarLensObject["components"][0]["content-selector"]["quantity"];
        //         delete scalarLensObject["components"][0]["content-selector"]["units"];
        //         delete scalarLensObject["components"][0]["content-selector"]["coordinates"];
        //
        //         let updateByType = scalarLensObject["components"][0]["content-selector"]["content-type"];
        //
        //         // plural names for content-type
        //         if(updateByType === 'page' || updateByType === 'media'){
        //           $('#content-selector-button').text('All ' + scalarapi.model.scalarTypes[updateByType].plural).append('<span class="caret"></span>');
        //         } else {
        //           $('#content-selector-button').text('All ' + scalarapi.model.relationTypes[updateByType].bodyPlural).append('<span class="caret"></span>');
        //         }
        //
        //         console.log(scalarLensObject);
        //         me.saveLens();
        //       });
        //     break;
        //
        //     case 'Items by distance':
        //       // store 'items by distance' values
        //       $('#distance-dropdown li').on('click', function(){
        //         $('#distanceUnits').text($(this).text()).append('<span class="caret"></span>');
        //       });
        //
        //       $('#distanceDone').on('click', function(){
        //         delete scalarLensObject["components"][0]["content-selector"]["items"];
        //         delete scalarLensObject["components"][0]["content-selector"]["content-type"];
        //         $('#byType').text('Select item...');
        //
        //         // quantity
        //         scalarLensObject["components"][0]["content-selector"]["quantity"] = $('#distanceQuantity').val();
        //         // units
        //         scalarLensObject["components"][0]["content-selector"]["units"] = $('#distanceUnits').text();
        //         // coordinates
        //         scalarLensObject["components"][0]["content-selector"]["coordinates"] = $('#latitude').val() + ', ' + $('#longitude').val();
        //
        //         let units = scalarLensObject["components"][0]["content-selector"]["units"];
        //         let abbreviateUnits;
        //
        //         // abbreviate units for display
        //         if(units === "miles") {
        //           abbreviateUnits = "mi";
        //         } else if(units === "kilometers") {
        //           abbreviateUnits = "km";
        //         }
        //
        //         let quantity = scalarLensObject["components"][0]["content-selector"]["quantity"];
        //         let coordinates = scalarLensObject["components"][0]["content-selector"]["coordinates"];
        //
        //         // JSON updates content button text
        //         let updateByDistance = quantity + ' ' + abbreviateUnits + ' from ' + coordinates;
        //
        //         $('.content-selector-button').text('Items ≤ ' + updateByDistance + '').append('<span class="caret"></span>');
        //
        //
        //         console.log(scalarLensObject);
        //
        //         me.saveLens();
        //
        //       });
        //
        //     break;
        //
        // }

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

            let type = contentSelectorObj["type"];

            switch(type){

              case 'specific-items':


                  let items = contentSelectorObj.items;

                  if(items.length <= 1){
                    let buttonText = '&#8220;'+ items + '&#8221;';
                  } else if(items.length > 1){
                    let remainingItems = items.length - 1;
                    let buttonText = '&#8220;'+ items[0] + '&#8221;' + ' and ' + remainingItems + ' more...';
                  }

                  button.html(buttonText).append('<span class="caret"></span>');

                  break;

              case 'items-by-type':
                  let contentType = contentSelectorObj["content-type"];

                  // retrieve plural name types for selections
                  if( contentType === 'page' || contentType === 'media'){
                    button.text('All ' + scalarapi.model.scalarTypes[contentType].plural).append('<span class="caret"></span>');
                  } else {
                    button.text('All ' + scalarapi.model.relationTypes[contentType].bodyPlural).append('<span class="caret"></span>');
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


                //console.log(scalarLensObject);

                //me.saveLens();
            }
          }



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

    //  this.scalarLensObject = this.getEmbeddedJson();

      if(!this.scalarLensObject) {
        this.scalarLensObject = this.getDefaultJson();
      }
      this.buildEditorDom();
      this.updateEditorDom();


        // if($("[property|='scalar:isLensOf']")){
        //
        //   // convert metadata div content into a JSON object
        //   let metaData = JSON.parse($("[property|='scalar:isLensOf']").html());
        //
        //   console.log(JSON.stringify(metaData));
        //
        //   let scalarLensObject = metaData;
        //   // console.log(scalarLensObject);
        //
        //   $('#visualization-button').text(metaData["visualization"]["type"]).css({'text-transform':'capitalize'}).prepend('<span class="viz-icon '  + metaData["visualization"]["type"].split(/[_\s]/).join("-").toLowerCase() + ' light"</span>').append('<span class="caret"></span>');
        //   //$('#content-selector-button').text(scalarLensObject["components"][0]["content-selector"]["type"]).css({'text-transform':'capitalize'}).append('<span class="caret"></span>');
        //
        //
        //
        //
        //     /// saved 'content-type' updates HTML
        //     //
        //     let newContentButtonText = metaData["components"][0]["content-selector"]["content-type"];
        //
        //     switch(metaData["components"][0]["content-selector"]["type"]){
        //
        //       case 'specific-items':
        //
        //           delete metaData["components"][0]["content-selector"]["content-type"];
        //           delete metaData["components"][0]["content-selector"]["quantity"];
        //           delete metaData["components"][0]["content-selector"]["units"];
        //           delete metaData["components"][0]["content-selector"]["coordinates"];
        //
        //           let newItemsValue = metaData["components"][0]["content-selector"]["items"];
        //
        //           if(newItemsValue.length <= 1){
        //             $('#content-selector-button').html('&#8220;'+ newItemsValue + '&#8221;').append('<span class="caret"></span>');
        //           } else if(newItemsValue.length > 1){
        //             let remainingItems = newItemsValue.length - 1;
        //             $('#content-selector-button').html('&#8220;'+ newItemsValue[0] + '&#8221;' + ' and ' + remainingItems + ' more...').append('<span class="caret"></span>');
        //           }
        //
        //           break;
        //
        //       case 'items-by-type':
        //
        //           // retrieve plural name types for selections
        //           if(newContentButtonText === 'page' || newContentButtonText === 'media'){
        //             $('#content-selector-button').text('All ' + scalarapi.model.scalarTypes[newContentButtonText].plural).append('<span class="caret"></span>');
        //           } else {
        //             $('#content-selector-button').text('All ' + scalarapi.model.relationTypes[newContentButtonText].bodyPlural).append('<span class="caret"></span>');
        //           }
        //
        //           delete metaData["components"][0]["content-selector"]["items"];
        //
        //           break;
        //
        //       case 'items-by-distance':
        //
        //           delete metaData["components"][0]["content-selector"]["items"];
        //
        //           let units = metaData["components"][0]["content-selector"]["units"];
        //           let abbreviateUnits;
        //
        //           // abbreviate units for display
        //           if(units === "miles") {
        //             abbreviateUnits = "mi";
        //           } else if(units === "kilometers") {
        //             abbreviateUnits = "km";
        //           }
        //
        //           let quantity = metaData["components"][0]["content-selector"]["quantity"];
        //           let coordinates = metaData["components"][0]["content-selector"]["coordinates"];
        //
        //           // JSON updates content button text
        //           let updateByDistance = quantity + ' ' + abbreviateUnits + ' from ' + coordinates;
        //
        //           $('#content-selector-button').text('Items ≤ ' + updateByDistance + '').append('<span class="caret"></span>');
        //
        //         break;
        //
        //
        //         //console.log(scalarLensObject);
        //
        //         //me.saveLens();
        //     }
        //
        // }


      //
      //
      // } // handleAddTags callback

    }

    // ajax call to post user lens selections
    ScalarLenses.prototype.saveLens = function() {
      this.baseURL = $('link#parent').attr('href');
      $.ajax({
        url: this.baseURL + "api/relate",
        type: "POST",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(scalarLensObject),
        async: true,
        context: this,
        success: function success(data) {
          console.log(data);
        },
        error: function error(response) {
          console.log(response);
        }
      });
    }

    // callback for content-selector
    ScalarLenses.prototype.handleAddTags = function(nodes) {
      if (nodes && nodes.length != 0) {
        //console.log(nodes);

        // extract the 'slug' property of each node and put into an array;
        // this gets stored in the "items" property
        let nodeTitle = nodes.map(node => node.title);

        // set JSON object value
        scalarLensObject["components"][0]["content-selector"]["type"] = $('#content-selector-button').text().split(/[_\s]/).join("-").toLowerCase();
        scalarLensObject["components"][0]["content-selector"]["items"] = nodeTitle;


        // show selections in content-selector button

        if(nodeTitle.length <= 1){
          $('#content-selector-button').html('&#8220;'+ nodeTitle + '&#8221;').append('<span class="caret"></span>');
        } else if(nodeTitle.length > 1){
          let remainingItems = nodeTitle.length - 1;
          $('#content-selector-button').html('&#8220;'+ nodeTitle[0] + '&#8221;' + ' and ' + remainingItems + ' more...').append('<span class="caret"></span>');
        }

        console.log(scalarLensObject);

        me.saveLens();

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
