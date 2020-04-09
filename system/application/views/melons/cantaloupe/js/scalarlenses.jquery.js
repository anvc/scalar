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



    ScalarLenses.prototype.init = function () {
      // You already have access to the DOM element and
      // the options via the instance, e.g. this.element
      // and this.options

      // reference for content-selector callback function
      let me = this;

      //
      /// the Lens object
      //
      let scalarLensObject = {
        "urn": $('link#urn').attr('href').replace("version", "lens"),
        "expanded": false,
        "submitted": false,
        "frozen": false,
        "frozen-items": [],
        "visualization": {
          "type": ""
        },
        "components": [
          {
            "content-selector": {
              "type": "items",
              "items":[],
              "quantity": "",
              "units": "",
              "coordinates": ""
            },
          }
        ]
      };


      //
      /// HTML for the Lens
      //
      let lensHtml =
      '<div class="paragraph_wrapper">'+
        '<div class="body_copy">'+
          '<div class="row lens">'+
            '<div id="lens">'+
              '<div class="col-xs-12">'+
                '<div class="lens-expand-container" data-toggle="collapse" data-target="">'+
                  '<div class="lens-icon-wrapper col-xs-1"><span class="lens-icon"></span></div>'+
                    '<div class="lens-content col-xs-11">'+
                      '<h3 class="lens-title heading_font heading_weight"> Tokyo Area Commercial Networks <span class="badge">4</span></h3>' +
                    '<div class="lens-tags">'+
                      //
                      /// Visualization dropdown
                      //
                      '<div id="visualization-btn" class="btn-group"><button id="visualization-button" type="button" class="btn btn-primary btn-xs dropdown-toggle caption_font" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
                        'Select visualization<span class="caret"></span></button>'+
                        '<ul id="visualization-dropdown" class="dropdown-menu">'+
                          '<li><a><span class="dropdown-item-icon force"></span>Force-Directed</a></li>'+
                          '<li><a><span class="dropdown-item-icon grid"></span>Grid</a></li>'+
                          '<li><a><span class="dropdown-item-icon list"></span>List</a></li>'+
                          '<li><a><span class="dropdown-item-icon map"></span>Map</a></li>'+
                          '<li><a><span class="dropdown-item-icon radial"></span>Radial</a></li>'+
                          '<li><a><span class="dropdown-item-icon tree"></span>Tree</a></li>'+
                          '<li><a><span class="dropdown-item-icon word-cloud"></span>Word Cloud</a></li>'+
                        '</ul>'+
                      '</div>'+
                      //
                      /// Content selector dropdown
                      //
                      '<div class="btn-group"><button id="content-selector-button" type="button" class="btn btn-primary btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
                          'Select items...<span class="caret"></span></button>'+
                        '<ul class="dropdown-menu">'+
                          '<li class="content-selector"><a>Specific items</a></li>'+
                          '<li><a data-toggle="modal" data-target="#modalByType">Items by type</a></li>'+
                          '<li><a data-toggle="modal" data-target="#modalByDistance">Items by distance</a></li>'+
                        '</ul>'+
                      '</div>'+
                  '</div></div>'+
                '</div></div></div>'+
              '</div></div></div>'+ // paragraph wrapper

              //
              /// Modal for items by Type
              //
              '<div id="modalByType" class="modal fade caption_font" role="dialog">'+
                '<div class="modal-dialog">'+
                  '<div class="modal-content">'+
                    '<div class="modal-body">'+
                      //'<button type="button" class="close" data-dismiss="modal">&times;</button>'+
                      '<p>Select all items of this type:</p>'+
                      '<div class="btn-group"><button id="byType" type="button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
                          'Select item...<span class="caret"></span></button>'+
                        '<ul class="dropdown-menu">'+
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
                              '<button id="distanceUnits" type="button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
                                'Select unit...<span class="caret"></span></button>'+
                              '<ul class="dropdown-menu">'+
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



      // function to populate dropdown value
      // handles multiple instances of dropdowns
      $(function(){
        $(".dropdown-menu").on('click', 'li a', function(ev){
          ev.preventDefault();
          let buttonValue = $(this).parent().parent().siblings(".btn:first-child").html($(this).text()+' <span class="caret"></span>');
          buttonValue
          $(this).parent().parent().siblings(".btn:first-child").val($(this).text());

          // Display icons inside visualization dropdown button
          switch($(this).text()) {
            case 'Force-Directed':
              buttonValue.prepend('<span class="dropdown-item-icon force light"></span>');
              break;
            case 'Grid':
              buttonValue.prepend('<span class="dropdown-item-icon grid light"></span>');
              break;
            case 'List':
              buttonValue.prepend('<span class="dropdown-item-icon list light"></span>');
              break;
            case 'Map':
              buttonValue.prepend('<span class="dropdown-item-icon map light"></span>');
              break;
            case 'Radial':
              buttonValue.prepend('<span class="dropdown-item-icon radial light"></span>');
              break;
            case 'Tree':
              buttonValue.prepend('<span class="dropdown-item-icon tree light"></span>');
              break;
            case 'Word Cloud':
              buttonValue.prepend('<span class="dropdown-item-icon word-cloud light"></span>');
              break;
            //
            // trigger content-selector
            //
            case 'Specific items':
              $('<div></div>').content_selector({
                changeable: true,
                multiple: true,
                onthefly: true,
                msg: 'Choose items to be included in this lens.',
                callback: me.handleAddTags
              });
              $('#byType').val(" ").text("Select item...");
              $('#distanceUnits').val(" ").text("Select unit...");
              $('#distanceQuantity, #latitude, #longitude').val("");
              //delete scalarLensObject["components"][0]["content-selector"]["content-type"];
              delete scalarLensObject["components"][0]["content-selector"]["quantity"];
              delete scalarLensObject["components"][0]["content-selector"]["units"];
              delete scalarLensObject["components"][0]["content-selector"]["coordinates"];
              break;
            case 'Items by type':
              $('#distanceQuantity, #latitude, #longitude').val("");
              $('#distanceUnits').val(" ").text("Select unit...");

              delete scalarLensObject["components"][0]["content-selector"]["items"];
              delete scalarLensObject["components"][0]["content-selector"]["quantity"];
              delete scalarLensObject["components"][0]["content-selector"]["units"];
              delete scalarLensObject["components"][0]["content-selector"]["coordinates"];

              break;
            case 'Items by distance':
              delete scalarLensObject["components"][0]["content-selector"]["items"];
              delete scalarLensObject["components"][0]["content-selector"]["content-type"];
              $('#byType').val("Select item...");
              break;
          }


            // store visualization-type value as kebab-case
            scalarLensObject["visualization"]["type"] = $('#visualization-button').val().split(/[_\s]/).join("-").toLowerCase();
            // store content-selector type as kebab-case
            scalarLensObject["components"][0]["content-selector"]["type"] = $('#content-selector-button').val().split(/[_\s]/).join("-").toLowerCase();
            // store content-selector content-type as kebab-case
            //scalarLensObject["components"][0]["content-selector"]["content-type"] = $('#byType').val().split(/[_\s]/).join("-").toLowerCase();


        });



        // store 'items by type' modal content-type
        $('#typeDone').click(function(){
          scalarLensObject["components"][0]["content-selector"]["content-type"] = $('#byType').val().split(/[_\s]/).join("-").toLowerCase();
          console.log(scalarLensObject);
        });

        // store 'items by distance' values
        $('#distanceDone').click(function(){
          // quantity
          scalarLensObject["components"][0]["content-selector"]["quantity"] = $('#distanceQuantity').val();
          // units
          scalarLensObject["components"][0]["content-selector"]["units"] = $('#distanceUnits').val();

          // coordinates
          scalarLensObject["components"][0]["content-selector"]["coordinates"] = $('#latitude').val() + ', ' + $('#longitude').val() ;

          console.log(scalarLensObject);
        });




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

        console.log(JSON.parse($('span[property="scalar:isLensOf"]').text()));

      });



      $("[property|='sioc:content']").append(lensHtml);



      //
      /// callback for content-selector
      //
      ScalarLenses.prototype.handleAddTags = function(nodes) {
        if (nodes && nodes.length != 0) {
          //console.log(nodes);

          // extract the 'slug' property of each node and put into an array;
          // this will be what gets stored in the "items" property
          let contentItem = nodes.map(node => node.slug);
          let contentItemsArray = JSON.stringify(contentItem);

          scalarLensObject["components"][0]["content-selector"]["items"] = contentItem;
          console.log(scalarLensObject);

        }


      } // handleAddTags callback








    }; // init function






    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                new ScalarLenses( this, options ));
            }
        });
    }






})( jQuery, window, document );
