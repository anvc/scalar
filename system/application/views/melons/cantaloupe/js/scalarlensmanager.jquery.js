/*!
 * Scalar Lens manager plugin
 */

;(function ( $, window, document, undefined ) {

    const pluginName = 'ScalarLensManager', defaults = {};

    function ScalarLensManager(element, options) {
        this._defaults = defaults;
        this._name = pluginName;
        this.element = element;
        this.options = $.extend( {}, defaults, options);
        this.selectedLens = null;

        this.init();
    }

    ScalarLensManager.prototype.init = function () {
      this.bookId = $('link#book_id').attr('href');
      this.userLevel = 'unknown';
      if ($('link#user_level').length > 0) {
        this.userLevel = $('link#user_level').attr('href');
      }
      this.loggedIn = $('link#logged_in').length > 0;
      this.userId = 'unknown';
      if (this.loggedIn) {
        let temp = $('link#logged_in').attr('href').split('/');
        this.userId = parseInt(temp[temp.length - 1]);
        this.addLensButton = $('<button class="btn btn-sm btn-primary">Add lens</button>').appendTo($('.my-private-lenses'));
        this.addLensButton.on('click', () => { this.addLens() });
      }
      $('heading').append('<p>Lenses are living snapshots of the content of a book, visualizing dynamic selections of pages and media. <a href="#">Learn more »</a></p>');
      $('body').on('lensUpdated', (evt, lens) => { this.handleLensUpdated(evt, lens); });
      this.getLensData();
    }

    ScalarLensManager.prototype.addLens = function() {

			data = {
				'action': 'ADD',
				'native': '1',
				'id': this.userId,
				'api_key': '',
				'dcterms:title': 'Untitled lens',
				'dcterms:description': '',
				'sioc:content': '',
				'rdf:type': 'http://scalar.usc.edu/2012/01/scalar-ns#Composite',
        'scalar:child_urn': 'urn:scalar:book:' + this.bookId,
        'scalar:child_type': 'http://scalar.usc.edu/2012/01/scalar-ns#Book',
        'scalar:child_rel': 'grouped',
        'scalar:contents': JSON.stringify(this.getDefaultLensJson())
			};

  		var error = function(error) {
  			//me.hideSpinner();
        console.log(error);
  			alert('An error occurred while creating a new lens.');
  		}

  		//me.showSpinner();

  		scalarapi.savePage(data, () => { this.getLensData() }, error);
    }

    ScalarLensManager.prototype.getDefaultLensJson = function(){
      return {
        "submitted": false,
        "public": false,
        "frozen": false,
        "frozen-items": [],
        "visualization": {
          "type": null,
          "options": {}
        },
        "components": [],
        "sorts": [],
        "title": "Untitled lens",
        "slug": "untitled-lens",
        "user_level": this.userLevel
      };
    }

    ScalarLensManager.prototype.handleLensUpdated = function(evt, lens) {
      this.getLensData();
    }

    ScalarLensManager.prototype.selectLens = function(lens) {
      this.selectedLens = lens;
      this.updateLensHighlight();
      $('.page-lens-editor').remove();
      $('.visualization').empty();
      var div = $('<div class="page-lens-editor"></div>');
      $('.lens-edit-container').append(div);
      div.ScalarLenses({
        lens: lens,
        onLensResults: this.handleLensResults
      });
    }

    ScalarLensManager.prototype.updateLensHighlight = function() {
      $('.lens-item').removeClass('highlight');
      if (this.selectedLens) {
        $('.lens-' + this.selectedLens.slug).addClass('highlight');
      }
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
      let myPrivateLensArray = [];
      let otherPrivateLensArray = [];
      let submittedLensArray = [];
      let publicLensArray = [];

      // build sidebar list
      data.forEach(lens => {
        if (lens.public) {
          publicLensArray.push(lens);
        } else {
          if (lens.user_id == this.userId) {
            myPrivateLensArray.push(lens);
          } else {
            otherPrivateLensArray.push(lens);
          }
          if (lens.submitted) {
            submittedLensArray.push(lens);
          }
        }
      });

      $('.my-private-lenses-list,.other-private-lenses-list,.submitted-lenses-list,.public-lenses-list').empty();

      this.loggedIn ? $('.my-private-lenses').show() : $('.my-private-lenses').hide();
      otherPrivateLensArray.length > 0 && this.loggedIn ? $('.other-private-lenses').show() : $('.other-private-lenses').hide();
      submittedLensArray.length > 0 ? $('.submitted-lenses').show() : $('.submitted-lenses').hide();
      publicLensArray.length > 0 ? $('.public-lenses').show() : $('.public-lenses').hide();

      // my private lenses
      myPrivateLensArray.forEach(privateLensItem => {
        let vizType = privateLensItem.visualization.type;
        let lensLink = $('link#parent').attr('href') + privateLensItem.slug;
        let markup = $(`
          <li class="caption_font lens-item lens-${privateLensItem.slug}">
            <a href="${lensLink}" target="_blank">${privateLensItem.title}</a>
            <span class="viz-icon ${vizType}"></span>
          </li>`
        ).appendTo($('.my-private-lenses-list'));
        markup.data('lens', privateLensItem);
      });

      // other private lenses
      otherPrivateLensArray.forEach(privateLensItem => {
        let vizType = privateLensItem.visualization.type;
        let lensLink = $('link#parent').attr('href') + privateLensItem.slug;
        let markup = $(`
          <li class="caption_font lens-item lens-${privateLensItem.slug}">
            <a href="${lensLink}" target="_blank">${privateLensItem.title}</a>
            <span class="viz-icon ${vizType}"></span>
          </li>`
        ).appendTo($('.other-private-lenses-list'));
        markup.data('lens', privateLensItem);
      });

      // submitted lenses
      submittedLensArray.forEach(submittedLensItem => {
        let vizType = submittedLensItem.visualization.type;
        let lensLink = $('link#parent').attr('href') + submittedLensItem.slug;
        let markup = $(`
          <li class="caption_font lens-item lens-${submittedLensItem.slug}">
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
          <li class="caption_font lens-item lens-${publicLensItem.slug}">
            <a href="${lensLink}" target="_blank">${publicLensItem.title}</a>
            <span class="viz-icon ${vizType}"></span>
          </li>`
        ).appendTo($('.public-lenses-list'));
        markup.data('lens', publicLensItem);
      });

      if (this.selectedLens == null && data.length > 0) {
        this.selectLens(data[0]);
      } else {
        this.updateLensHighlight();
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
