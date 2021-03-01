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
      this.myLenses = [];
      this.maxLenses = 5;
      this.userLevel = 'unknown';
      if ($('link#user_level').length > 0) {
        this.userLevel = $('link#user_level').attr('href');
      }
      this.loggedIn = $('link#logged_in').length > 0;
      this.userId = 'unknown';
      if (this.loggedIn) {
        let temp = $('link#logged_in').attr('href').split('/');
        this.userId = parseInt(temp[temp.length - 1]);
      }
      this.isConnectedToBook = ($('link#user_level').length) ? true : false;
      $('heading').append('<p>Lenses are living snapshots of the content of this project, visualizing dynamic selections of pages and media. <a href="#">Learn more »</a></p>');
      $('body').on('lensUpdated', (evt, lens) => { this.handleLensUpdated(evt, lens); });
      $('.lens-edit-container>h4,.vis-container>h4').after('<div class="non-ideal-state-message caption_font">No lens selected.</div>');
      this.addSubmittedMessage();
      this.getLensData();
    }

    ScalarLensManager.prototype.updateAddLensButton = function() {
      if (this.addLensButton) this.addLensButton.remove();
      console.log(this.loggedIn,this.myLenses.length,this.userLevel);
      if (this.loggedIn) {
        if (!this.isConnectedToBook) {
          if (this.myLenses.length < this.maxLenses) {
            this.addLensButton = $('<button class="btn btn-sm btn-primary">Add lens</button>').appendTo($('.my-private-lenses'));
            this.addLensButton.on('click', () => { this.addLensByUserId() });
          } else {
            this.addLensButton = $('<div class="caption_font">You have reached the maximum of ' + this.maxLenses + ' lenses.</div>').appendTo($('.my-private-lenses'));
          }
      	} else if (this.userLevel == 'scalar:Reader') {
          if (this.myLenses.length < this.maxLenses) {
            this.addLensButton = $('<button class="btn btn-sm btn-primary">Add lens</button>').appendTo($('.my-private-lenses'));
            this.addLensButton.on('click', () => { this.addLensByUserId() });
          } else {
            this.addLensButton = $('<div class="caption_font">You have reached the maximum of ' + this.maxLenses + ' lenses.</div>').appendTo($('.my-private-lenses'));
          }
      	} else {
          this.addLensButton = $('<button class="btn btn-sm btn-primary">Add lens</button>').appendTo($('.my-private-lenses'));
          this.addLensButton.on('click', () => { this.addLens() });
        }
      }
    }

    ScalarLensManager.prototype.addLens = function() {

			data = {
				'action': 'ADD',
				'native': '1',
				'id': this.userId,
				'api_key': '',
				'dcterms:title': 'Lens: Untitled',
				'dcterms:description': 'A snapshot of the content of this project.',
				'sioc:content': '',
        'scalar:metadata:is_live': '0',
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

    ScalarLensManager.prototype.addLensByUserId = function() {

    	var self = this;
    	var json = this.getDefaultLensJson();
    	json.user_id = this.userId;

    	var data = {
    	   action : 'add',
    		'dcterms:title' : 'Lens: Untitled',
    		'dcterms:description' : '',
    		'sioc:content' : '',
        'scalar:metadata:is_live': '0',
    		contents : JSON.stringify(json),
    		user : this.userId
    	};

    	$.ajax({
    		type: "POST",
    		url: $('link#parent').attr('href') + 'save_lens_page_by_user_id',
    		data: data,
    		success: function(json) {
    			if ('undefined' != typeof(json['error'])) {
    				alert('There was an error: ' + json['error']);
    				return;
    			};
    			var url = $('link#parent').attr('href') + json['slug'];
    			self.getLensData();
    		},
    		error: function(err) {
    			alert('There was an error connecting to the server');
    		},
    		dataType: 'json'
    	});

    }

    ScalarLensManager.prototype.getDefaultLensJson = function(){
      return {
        "submitted": false,
        "hidden": true,
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
      if (!lens) {
        this.selectLens(null);
      }
    }

    ScalarLensManager.prototype.saveLens = function() {
      this.baseURL = $('link#parent').attr('href');
      var baseProperties =  {
          'native': 1,
          'id': this.userId,
          'api_key':''
      };
      var pageData = {
        action: 'UPDATE',
        'scalar:urn': this.selectedLens.urn,
        uriSegment: this.selectedLens.slug,
        'dcterms:title': this.selectedLens.title
      };
      var relationData = {};
      relationData[this.baseURL + this.selectedLens.slug + 'null'] = {
        action: 'RELATE',
        'scalar:urn': this.selectedLens.urn.replace('lens','version'),
        'scalar:child_rel': 'grouped',
        'scalar:contents': JSON.stringify(this.selectedLens)
      };
      scalarapi.modifyPageAndRelations(baseProperties, pageData, relationData, () => {
        $('body').trigger('lensUpdated', this.selectedLens);
      });
    }

    ScalarLensManager.prototype.selectLens = function(lens) {
      this.selectedLens = lens;
      this.updateLensHighlight();
      $('.page-lens-editor').remove();
      $('.visualization').empty();
      var div = $('<div class="page-lens-editor"></div>');
      $('.lens-edit-container').append(div);
      $('.lens-edit-container').append(this.submittedMessage);
      this.updateSubmittedMessage(lens);
      if (lens) {
        div.ScalarLenses({
          lens: lens,
          onLensResults: this.handleLensResults
        });
        $('.lens-edit-container>.non-ideal-state-message,.vis-container>.non-ideal-state-message').hide();
        var visualization = $('.visualization');
        visualization.empty();
        visualization.append('<div class="caption_font">Loading data...</div>');
      } else {
        $('.lens-edit-container>.non-ideal-state-message,.vis-container>.non-ideal-state-message').show();
      }
    }

    ScalarLensManager.prototype.addSubmittedMessage = function() {
      this.submittedMessage = $('<div id="submitted-message" class="bg-info">'+
        '<div style="float:right; width:140px;">'+
        '<button id="reject-lens-btn" class="btn btn-block btn-default">Reject submission</button>'+
        '<button id="accept-lens-btn" class="btn btn-block btn-primary">Make lens public</button></div>'+
        '<p><strong>Submitted by:</strong> Erik Loyer (<a href="#">erikcloyer@gmail.com</a>)</p>'+
        '<p><strong>Comments:</strong> “Hi, I thought readers might find this lens valuable. Thanks for considering.”</p>'+
        '</div>').appendTo($('.lens-edit-container'));
      $('#reject-lens-btn').on('click', (evt) => { this.rejectLens(evt); });
      $('#accept-lens-btn').on('click', (evt) => { this.acceptLens(evt); });
    }

    ScalarLensManager.prototype.updateSubmittedMessage = function(lens) {
      if (!lens) {
        this.submittedMessage.hide();
      } else {
        if (lens.submitted) {
          this.submittedMessage.show();
        } else {
          this.submittedMessage.hide();
        }
      }
    }

    ScalarLensManager.prototype.rejectLens = function() {
      this.selectedLens.submitted = false;
      this.saveLens();
    }

    ScalarLensManager.prototype.acceptLens = function() {
      this.selectedLens.submitted = false;
      this.saveLens();

      var duplicateJson = JSON.parse(JSON.stringify(this.selectedLens));
      duplicateJson.user_level = this.userLevel;
      duplicateJson.public = true;
      delete duplicateJson.slug;
      delete duplicateJson.urn;
      delete duplicateJson.book_urn;
			data = {
				'action': 'ADD',
				'native': '1',
				'id': this.userId,
				'api_key': '',
				'dcterms:title': duplicateJson.title,
				'dcterms:description': '',
				'sioc:content': '',
				'rdf:type': 'http://scalar.usc.edu/2012/01/scalar-ns#Composite',
        'scalar:child_urn': 'urn:scalar:book:' + this.bookId,
        'scalar:child_type': 'http://scalar.usc.edu/2012/01/scalar-ns#Book',
        'scalar:child_rel': 'grouped',
        'scalar:contents': JSON.stringify(duplicateJson)
			};
  		var error = function(error) {
        console.log(error);
  			alert('An error occurred while duplicating the lens.');
  		}
  		scalarapi.savePage(data, function(response) {
        $('body').trigger('lensUpdated', duplicateJson);
      }, error);
    }

    ScalarLensManager.prototype.updateLensHighlight = function() {
      $('.lens-item').removeClass('highlight');
      if (this.selectedLens) {
        $('.lens-' + this.selectedLens.slug).addClass('highlight');
      }
    }

    ScalarLensManager.prototype.handleLensResults = function(lens) {
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
        $('.visualization').empty();
        $('.visualization').scalarvis(visOptions);
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
      this.myLenses = [];
      let myPrivateLensArray = [];
      let otherPrivateLensArray = [];
      let submittedLensArray = [];
      let publicLensArray = [];

      if (!this.count) {
        this.count = 0;
      }

      // build sidebar list
      data.forEach((lens, index) => {
        /*if (index == 0 && this.count == 0) {
          lens.submitted = true; // temporary
          this.count++;
        }*/
        if (!lens.hidden) {
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
        if (lens.user_id == this.userId) {
          this.myLenses.push(lens);
        }
      });

      $('.my-private-lenses-list,.other-private-lenses-list,.submitted-lenses-list,.public-lenses-list').empty();

      this.loggedIn ? $('.my-private-lenses').show() : $('.my-private-lenses').hide();
      otherPrivateLensArray.length > 0 && this.loggedIn ? $('.other-private-lenses').show() : $('.other-private-lenses').hide();
      submittedLensArray.length > 0 ? $('.submitted-lenses').show() : $('.submitted-lenses').hide();
      //publicLensArray.length > 0 ? $('.public-lenses').show() : $('.public-lenses').hide();

      // my private lenses
      if (myPrivateLensArray.length > 0) {
        myPrivateLensArray.forEach(privateLensItem => {
          let vizType = privateLensItem.visualization.type;
          let lensLink = $('link#parent').attr('href') + privateLensItem.slug;
          let markup = $(`
            <li class="caption_font lens-item lens-${privateLensItem.slug}">
              <a href="${lensLink}" target="_blank">${privateLensItem.title}</a>
              <span class="viz-icon ${vizType}"></span>
            </li>`
          ).appendTo($('.my-private-lenses-list'));
          markup.find('a').on('click', function(evt) { evt.stopPropagation(); }); // stop clicks on the link from selecting the lens
          markup.data('lens', privateLensItem);
        });
      } else {
        $('.my-private-lenses-list').append('<div class="non-ideal-state-message caption_font">You have no private lenses.</div>');
      }

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
        markup.find('a').on('click', function(evt) { evt.stopPropagation(); }); // stop clicks on the link from selecting the lens
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
        markup.find('a').on('click', function(evt) { evt.stopPropagation(); }); // stop clicks on the link from selecting the lens
        markup.data('lens', submittedLensItem);
      });

      // public lenses
      if (publicLensArray.length > 0) {
        publicLensArray.forEach(publicLensItem => {
          let vizType = publicLensItem.visualization.type;
          let lensLink = $('link#parent').attr('href') + publicLensItem.slug;
          let markup = $(`
            <li class="caption_font lens-item lens-${publicLensItem.slug}">
              <a href="${lensLink}" target="_blank">${publicLensItem.title}</a>
              <span class="viz-icon ${vizType}"></span>
            </li>`
          ).appendTo($('.public-lenses-list'));
          markup.find('a').on('click', function(evt) { evt.stopPropagation(); }); // stop clicks on the link from selecting the lens
          markup.data('lens', publicLensItem);
        });
      } else {
        $('.public-lenses-list').append('<div class="non-ideal-state-message caption_font">No public lenses available.</div>');
      }

      if (this.selectedLens == null) {
        if (data.length > 0) {
          this.selectLens(data[0]);
        } else {
          this.selectLens(null);
        }
      } else {
        this.updateLensHighlight();
        this.updateSubmittedMessage(this.selectedLens);
      }

      this.updateAddLensButton();

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
