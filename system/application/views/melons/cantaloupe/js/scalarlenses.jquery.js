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
            //alert('you selected Force-Directed');
            //return $(this).parent().parent().siblings(".btn:first-child").val($(this));
          }
        });
      });




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
