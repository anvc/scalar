/*!
 * Scalar Lens manager plugin
 */

;(function ( $, window, document, undefined ) {

    const pluginName = 'ScalarLensManager', defaults = {};

    function ScalarLensManager(element, options) {
        this.element = element;
        this.options = $.extend( {}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    ScalarLensManager.prototype.init = function () {
      this.bookId = $('link#book_id').attr('href');
      this.userLevel = 'unknown';
      if ($('link#user_level').length > 0) {
        this.userLevel = $('link#user_level').attr('href');
      }
      this.userId = 'unknown';
      if ($('link#logged_in').length > 0) {
        this.userId = $('link#logged_in').attr('href');
      }
      $('heading').append('<p>Lenses are living snapshots of the content of a book, visualizing dynamic selections of pages and media. <a href="#">Learn more »</a></p>');
      this.getLensData();
    }

    ScalarLensManager.prototype.selectLens = function(lens) {
      $('.page-lens-editor').remove();
      $('.visualization').empty();
      var div = $('<div class="page-lens-editor"></div>');
      $('.lens-edit-container').append(div);
      div.ScalarLenses({
        lens: lens,
        onLensResults: this.handleLensResults
      });
    }

    ScalarLensManager.prototype.handleLensResults = function(lens) {
      var visualization = $('.visualization');
      if (visualization.length == 0) {
        visualization = $('<div class="visualization"></div>').appendTo($('.vis-container'));
      } else {
        visualization.empty();
      }
      var slugs = [];
      for (var url in lens.items) {
        if (scalarapi.model.nodesByURL[url] != null) {
          slugs.push(scalarapi.model.nodesByURL[url].slug);
        }
      }
      if (lens.visualization) {
        var visOptions = {
            modal: false,
            widget: true,
            content: 'lens',
            lens: lens
        };
        visualization.scalarvis(visOptions);
      }
    }

    ScalarLensManager.prototype.getLensData = function(){
      let bookId = $('link#book_id').attr('href');
      let baseURL = $('link#approot').attr('href').replace('application', 'lenses');
      let mainURL = `${baseURL}?book_id=${bookId}`;
      $.ajax({
        url:mainURL,
        type: "GET",
        dataType: 'json',
        contentType: 'application/json',
        async: true,
        context: this,
        success: this.handleLensData,
        error: function error(response) {
           console.log('There was an error attempting to communicate with the server.');
           console.log(response);
        }
      });
    }

    ScalarLensManager.prototype.handleLensData = function(response){

      let data = response;
      let privateLensArray = [];
      let submittedLensArray = [];
      let publicLensArray = [];

      // build sidebar list
      data.forEach(lens => {
        if (lens.public) {
          publicLensArray.push(lens);
        } else {
          privateLensArray.push(lens);
          if (lens.submitted) {
            submittedLensArray.push(lens);
          }
        }
      });

      privateLensArray.length > 0 ? $('.private-lenses').show() : $('.private-lenses').hide();
      submittedLensArray.length > 0 ? $('.submitted-lenses').show() : $('.submitted-lenses').hide();
      publicLensArray.length > 0 ? $('.public-lenses').show() : $('.public-lenses').hide();

      // private lenses
      privateLensArray.forEach(privateLensItem => {
        let vizType = privateLensItem.visualization.type;
        let lensLink = $('link#parent').attr('href') + privateLensItem.slug;
        let markup = $(`
          <li class="caption_font">
            <a href="${lensLink}" target="_blank">${privateLensItem.title}</a>
            <span class="viz-icon ${vizType}"></span>
          </li>`
        ).appendTo($('.private-lenses-list'));
        markup.data('lens', privateLensItem);
      });

      // submitted lenses
      submittedLensArray.forEach(submittedLensItem => {
        let vizType = submittedLensItem.visualization.type;
        let lensLink = $('link#parent').attr('href') + submittedLensItem.slug;
        let markup = $(`
          <li class="caption_font">
            <a href="${lensLink}" target="_blank">${submittedLensItem.title}</a>
            <span class="viz-icon ${vizType}"></span>
          </li>`
        ).appendTo($('.submitted-lenses-list'));
        markup.data('lens', submittedLensItem);
      });

      // public lenses
      publicLensArray.forEach(publicLensItem => {
        let vizType = publicLensItem.visualization.type;
        let lensLink = $('link#parent').attr('href') + publicLensItem.slug;
        let markup = $(`
          <li class="caption_font">
            <a href="${lensLink}" target="_blank">${publicLensItem.title}</a>
            <span class="viz-icon ${vizType}"></span>
          </li>`
        ).appendTo($('.public-lenses-list'));
        markup.data('lens', publicLensItem);
      });

      if (data.length > 0) {
        this.selectLens(data[0]);
      }

      var me = this;
      // display lens when clicked
      $('#lens-manager ul li').on('click', function(){
        me.selectLens($(this).data('lens'));
      });

    };

    // plugin wrapper around the constructor,
    // to prevent against multiple instantiations
    $.fn[pluginName] = function ( options ) {
      return this.each(function () {
        if (!$.data(this, 'plugin_' + pluginName)) {
          $.data(this, 'plugin_' + pluginName,
          new ScalarLensManager( this, options ));
        }
      });
    }

})( jQuery, window, document );

$(function(){
    lensManager = $('#lens-manager').ScalarLensManager({});
});
