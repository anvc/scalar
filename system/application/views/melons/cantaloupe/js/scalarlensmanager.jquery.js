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

      const element = this.element;

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

        console.log(this.userLevel);
        console.log(data)

        //this.userLevel = 'scalar:Reader';

        // author view
        if(this.userLevel == 'scalar:Author'){
          let privateLensArray = [];
          let submittedLensArray = [];
          let publicLensArray = [];

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


            // display author private lenses
            if(privateLensArray.length == 0){
              $('.private-lenses-list').append(`
                  <li class="caption_font">
                    <a>No private lenses to view</a>
                  </li>`
                );
            }
            $('.private-lenses-list').append(`
                <li class="caption_font">
                  <a>${privateLensItem.title}</a>
                  <span id="private-lens-count" class="badge dark caption_font">0</span>
                  <span class="viz-icon ${vizType}"></span>
                </li>`
              );
          });

          // display submitted lenses created by anyone
          $(element).find('.submitted-lenses .title').text('Awaiting My Review');

          if(submittedLensArray.length == 0){
            $('.submitted-lenses-list').append(`
                <li class="caption_font">
                  <a>No submissions to review</a>
                </li>`
              );
          }
          submittedLensArray.forEach(submittedLensItem => {
            let vizType = submittedLensItem.visualization.type;

            $('.submitted-lenses-list').append(`
                <li class="caption_font">
                  <a>${submittedLensItem.title}</a>
                  <span id="submitted-lens-count" class="badge dark caption_font">0</span>
                  <span class="viz-icon ${vizType}"></span>
                </li>`
              );
          });


          // display public lenses created by anyone
          $('.public-lenses .title').text('Public Lenses');
          $('#public-lens-count').text(publicLensArray.length);

          if(publicLensArray.length == 0){
            $('.public-lenses-list').append(`
                <li class="caption_font">
                  <a>No public lenses view</a>
                </li>`
              );
          }
          publicLensArray.forEach(publicLensItem => {
            let vizType = publicLensItem.visualization.type;
            //console.log(vizType)

            $('.public-lenses-list').append(`
                <li class="caption_font">
                  <a>${publicLensItem.title}</a>
                  <span id="public-lens-count" class="badge dark caption_font">0</span>
                  <span class="viz-icon ${vizType}"></span>
                </li>`
              );
          });


        }

        // display reader view
        // Reader
        if(this.userLevel == 'scalar:Reader'){
          // My Private Lenses: Private lenses created by me
          // My Submitted Lenses: Submitted lenses created by me (a non-author or editor)
          // Author Lenses: Public lenses created by anyone
        }


      }

      this.getLensData();

    }

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
