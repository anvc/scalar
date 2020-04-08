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
      /// main object for a lens
      //
      let scalarLensObject = {
        "expanded": false,
        "submitted": false,
        "frozen": false,
        "frozen-items": [],
        "visualization": {
          "type": "",
          "options": {
            "option":""
          }
        },
        "components": [
          {
            "content-selector": {
              "type": "items",
              "content-type": "",
              "items":[],
              "quantity": "",
              "units": "",
              "coordinates": ""
            },
          "modifiers": [
            {
              "type": "filter",
              "subtype": "type/content/relationship/distance/quantity/metadata/visitdate",
              "content-types": [ "page", "path"],
              "relationship": "parent/child",
              "operator": "inclusive/exclusive",
              "content": "arbitrary string",
              "quantity": 100,
              "units": "miles/kilometers/hours/days/months",
              "metadata-field": "dcterms:title",
              "datetime": "01/02/2020 11:37 AM"
            },
            {
              "type": "sort",
              "metadata-field": "dcterms:title",
              "sort-order": "ascending/descending",
              "sort-type": "alphabetical/numerical/creation-date/edit-date/distance/type/match-count/relationship-count/relationship-ordinal/visit-date",
              "content": "arbitrary string"
            }
          ]
        }
      ]
      };


      //
      /// HTML for ScalarLens
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
                      '<div id="content-selector-btn" class="btn-group"><button type="button" class="btn btn-primary btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
                          'Select items...<span class="caret"></span></button>'+
                        '<ul class="dropdown-menu">'+
                          '<li class="content-selector"><a>Specific items...</a></li>'+
                          '<li><a data-toggle="modal" data-target="#modalByType">Items by type...</a></li>'+
                          '<li><a data-toggle="modal" data-target="#modalByDistance">Items by distance...</a></li>'+
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
                      '<div id="byItem" class="btn-group"><button type="button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
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
                      '<button type="button" class="btn btn-primary" data-dismiss="modal">Done</button>'+
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
                            '<input id="distanceInput" type="text" class="form-control" aria-label="..." placeholder="Enter distance">'+
                          '</div>'+
                          '<div class="col-sm-5">'+
                            '<div id="byDistance" class="btn-group">'+
                              '<button type="button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
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
                      '<button type="button" class="btn btn-primary" data-dismiss="modal">Done</button>'+
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
            case 'Specific items...':
              $('<div></div>').content_selector({
                changeable: true,
                multiple: true,
                onthefly: true,
                msg: 'Choose items to be included in this lens.',
                callback: me.handleAddTags
              });
              break;
            case 'Items by type...':
              //alert('Trigger modal for type');
              break;
            case 'Items by distance...':
              //alert('Trigger modal for distance');
              break;
          }

          scalarLensObject["visualization"]["type"] = $('#visualization-button').val();
          console.log(scalarLensObject);


        });
      });



      $("[property|='sioc:content']").append(lensHtml);



      //
      /// callback for content selector
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
      }





    };






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
