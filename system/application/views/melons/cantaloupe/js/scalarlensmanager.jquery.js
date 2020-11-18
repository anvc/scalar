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

      //_______________//
      //
      /// author view
      //_______________//

      if(this.userLevel == 'scalar:Author'){
        let privateLensArray = [];
        let submittedLensArray = [];
        let publicLensArray = [];

        $('.private-lenses .title').text('My Private Lenses');
        $(this.element).find('.submitted-lenses .title').text('Awaiting My Review');
        $('.public-lenses .title').text('Public Lenses');

        if (data.length > 0) {
          this.selectLens(data[0]);
        }

        // build sidebar list
        data.forEach(lens => {
          // sort lenses
          if(lens.user_level == 'scalar:Author'){
            lens.public ? publicLensArray.push(lens) : privateLensArray.push(lens);
            if(lens.submitted == true){
              submittedLensArray.push(lens);
            }
          }
        });
        // private lenses
        privateLensArray.forEach(privateLensItem => {
          let vizType = privateLensItem.visualization.type;
          let lensLink = $('link#parent').attr('href') + privateLensItem.slug;
          // display author private lenses
          if(privateLensArray.length == 0){
            $('.private-lenses').hide()
          } else {
            $('.private-lenses').show()
          }
          let markup = $(`
            <li class="caption_font">
              <a href="${lensLink}" target="_blank">${privateLensItem.title}</a>
              <span id="private-lens-count" class="badge dark caption_font">0</span>
              <span class="viz-icon ${vizType}"></span>
            </li>`
          ).appendTo($('.private-lenses-list'));
          markup.data('lens', privateLensItem);
        });

        // submitted lenses
        if(submittedLensArray.length == 0){
          $('.submitted-lenses').hide()
        } else {
          $('.submitted-lenses').show()
        }
        submittedLensArray.forEach(submittedLensItem => {
          let vizType = submittedLensItem.visualization.type;
          let lensLink = $('link#parent').attr('href') + submittedLensItem.slug;
          let markup = $(`
            <li class="caption_font">
              <a href="${lensLink}" target="_blank">${submittedLensItem.title}</a>
              <span id="submitted-lens-count" class="badge dark caption_font">0</span>
              <span class="viz-icon ${vizType}"></span>
            </li>`
          ).appendTo($('.submitted-lenses-list'));
          markup.data('lens', submittedLensItem);
        });

        // public lenses
        if(publicLensArray.length == 0){
          $('.public-lenses').hide()
        } else {
          $('.public-lenses').show()
        }
        publicLensArray.forEach(publicLensItem => {
          let vizType = publicLensItem.visualization.type;
          let lensLink = $('link#parent').attr('href') + publicLensItem.slug;
          let markup = $(`
            <li class="caption_font">
              <a href="${lensLink}" target="_blank">${publicLensItem.title}</a>
              <span id="public-lens-count" class="badge dark caption_font">0</span>
              <span class="viz-icon ${vizType}"></span>
            </li>`
          ).appendTo($('.public-lenses-list'));
          markup.data('lens', publicLensItem);
        });


      }
      //_______________//
      /// Reader view

      else if(this.userLevel == 'scalar:Reader'){
        let privateLensArray = [];
        let submittedLensArray = [];
        let publicLensArray = [];

        $('.private-lenses .title').text('My Private Lenses');
        $(this.element).find('.submitted-lenses .title').text('My Submitted Lenses');
        $('.public-lenses .title').text('Public Lenses');

        // build sidebar list
        data.forEach(lens => {
          // sort lenses
          lens.public ? publicLensArray.push(lens) : privateLensArray.push(lens);
          if(lens.submitted == true){
            submittedLensArray.push(lens);
          }
        });
        // private lenses
        privateLensArray.forEach(privateLensItem => {
          let vizType = privateLensItem.visualization.type;
          let lensLink = $('link#parent').attr('href') + privateLensItem.slug;
          // display author private lenses
          if(privateLensArray.length == 0){
            $('.private-lenses').hide()
          } else {
            $('.private-lenses').show()
          }
          let markup = $(`
            <li class="caption_font">
              <a href="${lensLink}" target="_blank">${privateLensItem.title}</a>
              <span id="private-lens-count" class="badge dark caption_font">0</span>
              <span class="viz-icon ${vizType}"></span>
            </li>`
          ).appendTo($('.private-lenses-list'));
          markup.data('lens', privateLensItem);
        });
        // submitted lenses
        if(submittedLensArray.length == 0){
          $('.submitted-lenses').hide()
        } else {
          $('.submitted-lenses').show()
        }
        submittedLensArray.forEach(submittedLensItem => {
          let vizType = submittedLensItem.visualization.type;
          let lensLink = $('link#parent').attr('href') + submittedLensItem.slug;
          let markup = $(`
            <li class="caption_font">
              <a href="${lensLink}" target="_blank">${submittedLensItem.title}</a>
              <span id="submitted-lens-count" class="badge dark caption_font">0</span>
              <span class="viz-icon ${vizType}"></span>
            </li>`
          ).appendTo($('.submitted-lenses-list'));
          markup.data('lens', submittedLensItem);
        });
        // public lenses
        if(publicLensArray.length == 0){
          $('.public-lenses').hide()
        } else {
          $('.public-lenses').show()
        }
        publicLensArray.forEach(publicLensItem => {
          let vizType = publicLensItem.visualization.type;
          let lensLink = $('link#parent').attr('href') + publicLensItem.slug;
          let markup = $(`
            <li class="caption_font">
              <a href="${lensLink}" target="_blank">${publicLensItem.title}</a>
              <span id="public-lens-count" class="badge dark caption_font">0</span>
              <span class="viz-icon ${vizType}"></span>
            </li>`
          ).appendTo($('.public-lenses-list'));
          markup.data('lens', publicLensItem);
        });
      }

      // non-authors and non-readers
      else {
        let publicLensArray = [];
        $('.public-lenses .title').text('Public Lenses');
        // build sidebar list
        data.forEach(lens => {
          if(lens.public == true){
            publicLensArray.push(lens);
          }
        });
        // public lenses
        if(publicLensArray.length == 0){
          $('.public-lenses').hide()
        } else {
          $('.public-lenses').show()
        }
        publicLensArray.forEach(publicLensItem => {
          let vizType = publicLensItem.visualization.type;
          let lensLink = $('link#parent').attr('href') + publicLensItem.slug;
          let markup = $(`
            <li class="caption_font">
              <a href="${lensLink}" target="_blank">${publicLensItem.title}</a>
              <span id="public-lens-count" class="badge dark caption_font">0</span>
              <span class="viz-icon ${vizType}"></span>
            </li>`
          ).appendTo($('.public-lenses-list'));
          markup.data('lens', publicLensItem);
        });
      };

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
