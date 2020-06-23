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
      // get all lenses in the book: http://[scalar_install]/system/lenses?book_id=XX
      let bookId = $('link#book_id').attr('href');
      let baseURL = $('link#parent').attr('href');
      let splitURL = baseURL.split("/");
      splitURL.splice(4,0, "system/lenses");
      let newURL = splitURL.join('/').replace(/\/$/, "")

      let mainURL = `${newURL}?book_id=${bookId}`;
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
      //this.userLevel = 'scalar:Reader';
      console.log(this.userLevel);
      console.log(data)

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

        // iterate through lenses
        data.forEach(lens => {
          // sort lenses
          if(lens.user_level == 'scalar:Author'){
            lens.public ? publicLensArray.push(lens) : privateLensArray.push(lens);
            if(lens.submitted == true){
              submittedLensArray.push(lens);
            }
          }
        });
        // build sidebar list
        privateLensArray.forEach(privateLensItem => {
          let vizType = privateLensItem.visualization.type;
          let lensLink = $('link#parent').attr('href') + privateLensItem.slug;
          // display author private lenses
          if(privateLensArray.length == 0){
            $('.private-lenses').hide()
          } else {
            $('.private-lenses').show()
          }
          $('.private-lenses-list').append(`
              <li class="caption_font">
                <a href="${lensLink}" target="_blank">${privateLensItem.title}</a>
                <span id="private-lens-count" class="badge dark caption_font">0</span>
                <span class="viz-icon ${vizType}"></span>
              </li>`
            );
        });

        if(submittedLensArray.length == 0){
          $('.submitted-lenses').hide()
        } else {
          $('.submitted-lenses').show()
        }
        submittedLensArray.forEach(submittedLensItem => {
          let vizType = submittedLensItem.visualization.type;
          let lensLink = $('link#parent').attr('href') + submittedLensItem.slug;

          $('.submitted-lenses-list').append(`
              <li class="caption_font">
                <a href="${lensLink}" target="_blank">${submittedLensItem.title}</a>
                <span id="submitted-lens-count" class="badge dark caption_font">0</span>
                <span class="viz-icon ${vizType}"></span>
              </li>`
            );
        });

        if(publicLensArray.length == 0){
          $('.public-lenses').hide()
        } else {
          $('.public-lenses').show()
        }
        publicLensArray.forEach(publicLensItem => {
          let vizType = publicLensItem.visualization.type;
          let lensLink = $('link#parent').attr('href') + publicLensItem.slug;

          $('.public-lenses-list').append(`
              <li class="caption_font">
                <a href="${lensLink}" target="_blank">${publicLensItem.title}</a>
                <span id="public-lens-count" class="badge dark caption_font">0</span>
                <span class="viz-icon ${vizType}"></span>
              </li>`
            );
        });

      };

      //_______________//
      //
      /// Reader view
      //_______________//

      if(this.userLevel == 'scalar:Reader'){
        let privateLensArray = [];
        let submittedLensArray = [];
        let publicLensArray = [];

        // iterate through lenses
        data.forEach(lens => {
          // sort lenses
          if(lens.user_level == 'scalar:Reader'){
            lens.public ? publicLensArray.push(lens) : privateLensArray.push(lens);
            if(lens.submitted == true){
              submittedLensArray.push(lens);
            }
          }
        });
        // build sidebar list
        privateLensArray.forEach(privateLensItem => {
          let vizType = privateLensItem.visualization.type;
          let lensLink = $('link#parent').attr('href') + privateLensItem.slug;
          // display author private lenses
          if(privateLensArray.length == 0){
            $('.private-lenses').hide()
          } else {
            $('.private-lenses').show()
          }
          $('.private-lenses-list').append(`
              <li class="caption_font">
                <a href="${lensLink}" target="_blank">${privateLensItem.title}</a>
                <span id="private-lens-count" class="badge dark caption_font">0</span>
                <span class="viz-icon ${vizType}"></span>
              </li>`
            );
        });
        // submitted lenses list
        if(submittedLensArray.length == 0){
          $('.submitted-lenses').hide()
        } else {
          $('.submitted-lenses').show()
        }
        submittedLensArray.forEach(submittedLensItem => {
          let vizType = submittedLensItem.visualization.type;
          let lensLink = $('link#parent').attr('href') + submittedLensItem.slug;
          $('.submitted-lenses-list').append(`
              <li class="caption_font">
                <a href="${lensLink}" target="_blank">${submittedLensItem.title}</a>
                <span id="submitted-lens-count" class="badge dark caption_font">0</span>
                <span class="viz-icon ${vizType}"></span>
              </li>`
            );
        });
        // public lenses list
        if(publicLensArray.length == 0){
          $('.public-lenses').hide()
        } else {
          $('.public-lenses').show()
        }
        publicLensArray.forEach(publicLensItem => {
          let vizType = publicLensItem.visualization.type;
          let lensLink = $('link#parent').attr('href') + publicLensItem.slug;
          $('.public-lenses-list').append(`
              <li class="caption_font">
                <a href="${lensLink}" target="_blank">${publicLensItem.title}</a>
                <span id="public-lens-count" class="badge dark caption_font">0</span>
                <span class="viz-icon ${vizType}"></span>
              </li>`
            );
        });
      };

      var me = this;
      // display lens when clicked
      $('#lens-manager ul li').on('click', function(){
        me.selectLens(data).data();
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
