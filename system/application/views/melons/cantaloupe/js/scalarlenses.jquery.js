/*!
 * Scalar Lens plugin
 * Author: Michael Morgan
 * Licensed under the MIT license
 */


;(function ( $, window, document, undefined ) {

    var pluginName = 'scalarLenses',
        defaults = {

        };

    function Plugin( element, options) {
        this.element = element;
        this.options = $.extend( {
          lenseTitle: "untitled",
          expanded: false,
          visualization: {
            type: "force-directed/grid/list/map/radial/tree/word-cloud",
            options: {

            }
          }
        }, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype.init = function () {
      // Place initialization logic here
      // You already have access to the DOM element and
      // the options via the instance, e.g. this.element
      // and this.options

      // function to populate any dropdown value
      $(function(){

        $(".dropdown-menu li a").click(function(){

          $(".btn:first-child").text($(this).text());
          $(".btn:first-child").val($(this).text()).append('<span class="caret"></span>');

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
