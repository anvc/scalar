/*!
 * Scalar Lens plugin
 * Author: Michael Morgan
 * Licensed under the MIT license
 */


;(function ( $, window, document, undefined ) {

    var pluginName = 'ScalarLenses',
        defaults = {
          "expanded": false,
          "submitted": false,
          "frozen": false,
          "frozen-items": [],
          "visualization": {
            "type": "force-directed/grid/list/map/radial/tree/word-cloud",
            "options": {}
          },
          "components": [
            {
              "content-selector": {
                "type": "items/content-type/distance",
                "content-type": "page/path/tag/annotation",
                "items":[],
                "quantity":"",
                "units":"",

              }
            }
          ]
        };


        // HTML for ScalarLens
        //
        var lensHtml = '<div class="paragraph_wrapper">'+
        '<div class="body_copy">'+
        '<div class="row lens">'+
        '<div id="lens">'+
        '<div class="col-xs-12">'+
        '<div class="lens-expand-container" data-toggle="collapse" data-target="">'+
        '<div class="lens-icon-wrapper col-xs-1"><span class="lens-icon"></span></div>'+
        '<div class="lens-content col-xs-11">'+
        '<h3 class="lens-title heading_font heading_weight"> Tokyo Area Commercial Networks <span class="badge">4</span></h3>' +
        '<div class="lens-tags">'+
        '<div id="visualization-btn" class="btn-group"><button type="button" class="btn btn-primary btn-xs dropdown-toggle caption_font" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
        'Select visualization<span class="caret"></span></button>'+
        '<ul class="dropdown-menu">'+
        '<li><a><span class="dropdown-item-icon force"></span>Force-Directed</a></li>'+
        '<li><a><span class="dropdown-item-icon grid"></span>Grid</a></li>'+
        '<li><a><span class="dropdown-item-icon list"></span>List</a></li>'+
        '<li><a><span class="dropdown-item-icon map"></span>Map</a></li>'+
        '<li><a><span class="dropdown-item-icon radial"></span>Radial</a></li>'+
        '<li><a><span class="dropdown-item-icon tree"></span>Tree</a></li>'+
        '<li><a><span class="dropdown-item-icon word-cloud"></span>Word Cloud</a></li>'+
        '</ul>'+
        '</div>'+
        '<div id="content-selector-btn" class="btn-group"><button type="button" class="btn btn-primary btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
        'Select items...<span class="caret"></span></button>'+
        '<ul class="dropdown-menu">'+
        '<li><a>Specific items...</a></li>'+
        '<li><a>Items by type...</a></li>'+
        '<li><a>Items by distance...</a></li>'+
        '</ul>'+
        '</div>'+
        '</div></div>'+
        '</div></div></div>'+
        '</div></div></div>';


    function Plugin( element, options) {
        this.element = element;
        this.options = $.extend( {}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype.init = function () {
      // Place initialization logic here
      // You already have access to the DOM element and
      // the options via the instance, e.g. this.element
      // and this.options

      // function to populate dropdown value
      // handles multiple instances of dropdowns
      $(function(){
        $(".dropdown-menu").on('click', 'li a', function(){
          $(this).parent().parent().siblings(".btn:first-child").html($(this).text()+' <span class="caret"></span>');
          $(this).parent().parent().siblings(".btn:first-child").val($(this).text());

          if($(this).text() == 'Force-Directed'){
            $(this).parent().parent().siblings(".btn:first-child").html($(this).text()+' <span class="caret"></span>').prepend('<span class="dropdown-item-icon force light"></span>');
          }
          if($(this).text() == 'Grid'){
            $(this).parent().parent().siblings(".btn:first-child").html($(this).text()+' <span class="caret"></span>').prepend('<span class="dropdown-item-icon grid light"></span>');
          }
          if($(this).text() == 'List'){
            $(this).parent().parent().siblings(".btn:first-child").html($(this).text()+' <span class="caret"></span>').prepend('<span class="dropdown-item-icon list light"></span>');
          }
          if($(this).text() == 'Map'){
            $(this).parent().parent().siblings(".btn:first-child").html($(this).text()+' <span class="caret"></span>').prepend('<span class="dropdown-item-icon map light"></span>');
          }
          if($(this).text() == 'Radial'){
            $(this).parent().parent().siblings(".btn:first-child").html($(this).text()+' <span class="caret"></span>').prepend('<span class="dropdown-item-icon radial light"></span>');
          }
          if($(this).text() == 'Tree'){
            $(this).parent().parent().siblings(".btn:first-child").html($(this).text()+' <span class="caret"></span>').prepend('<span class="dropdown-item-icon tree light"></span>');
          }
          if($(this).text() == 'Word Cloud'){
            $(this).parent().parent().siblings(".btn:first-child").html($(this).text()+' <span class="caret"></span>').prepend('<span class="dropdown-item-icon word-cloud light"></span>');
          }




        });
      });


      $("[property|='sioc:content']").append(lensHtml);

    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                new Plugin( this, options ));
            }
        });
    }

})( jQuery, window, document );
