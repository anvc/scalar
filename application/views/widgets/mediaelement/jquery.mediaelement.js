/**
 * Scalar
 * Copyright 2013 The Alliance for Networking Visual Culture.
 * http://scalar.usc.edu/scalar
 * Alliance4NVC@gmail.com
 *
 * Licensed under the Educational Community License, Version 2.0
 * (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.osedu.org/licenses /ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */


/**
 * @projectDescription		The MediaElement plug-in creates and manages the interface for a Scalar media resource.
 *							Scalar is a project of The Alliance for Networking Visual Culture (http://scalar.usc.edu).
 * @author					Erik Loyer
 * @version					1.1
 */

var mediaElementUniqueID = 0;
var youTubeMediaElementViews = [];
var soundCloudInitialized = false;
var pendingDeferredMedia = {};
var imagesWithAnnotations = {};

/**
* Get YouTube ID from various YouTube URL
* @author: takien
* @url: http://takien.com
* For PHP YouTube parser, go here http://takien.com/864
*/

function YouTubeGetID(url){
  var ID = '';
  url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if(url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_-]/i);
    ID = ID[0];
  }
  else {
    ID = url;
  }
    return ID;
}

(function($) {

	/**
	 * The base class for the plug-in.
	 * @constructor
     *
	 * @param	{Object} link		An object encapsulating the original hyperlink and other data from which the media element is being generated.
	 * @param 	{Object} options	An object containing other relevant data for the media element.
	 */
	var MediaElement = function(link, options) {

		this.model = new $.MediaElementModel(options, link);				   	 		// instance of the model
		this.link = link;																// the original hyperlink
		this.controller = new $.MediaElementController(this.model, this.link);			// instance of the main controller
		this.view = new $.MediaElementView(this.model, this.controller, this.link);		// instance of the main view
		this.model.id = mediaElementUniqueID++;											// unique id for the instance

		this.controller.view = this.view;

		if (options['auto_width']) $(this.link).data('auto_width', true);  // To pass to media creation prototypes

		var me = this;

		/**
		 * Basic initalization.
		 */
		this.setup = function() {
			this.model.init($(link), options);
 			this.controller.loadMetadata();
		}

		/**
		 * Returns a jQuery object containing the media player.
		 * @return		The media player object.
		 */
		this.getEmbedObject = function() {
			return(this.model.element);
		};

		/**
		 * Set the height of the mediaContainer and child elements in such a way that they are flexible when 'auto_width' is set to true
		 * Call this after calling this.getEmbedObject() ... takes the place of a "creation complete" event, which I don't think exists in JS?
		 * @return null
		 */
		this.finishAutoWidth = function() {
			$(this.model).trigger('finishAutoWidth');
		}

		/**
		 * Returns the function to be called after the media player is added to the page.
		 * @return		The callback function.
		 */
		this.getCallback = function() {
			return this.callback;
		}

		/**
		 * Takes any action needed after the player has been added to the page.
		 */
		this.callback = function() {
		}

		/**
		 * Returns a string describing the type of media being presented.
		 * @return		The content type string.
		 */
		// TODO: I don't this is valid anymore, should be this.model.mediaSource.extensions? (returns array) -- Craig
		this.getContentType = function() {
			return this.model.extension;
		}

		/**
		 * Starts playback of time-based media.
		 */
		this.play = function() {
			this.view.play();
		}

		/**
		 * Pauses playback of time-based media.
		 */
		this.pause = function() {
			this.view.pause();
		}

		/**
		 * Seeks to a given time position within a piece of time-based media.
		 *
		 * @param {Object} data			Data representing the seek point.
		 */
		this.seek = function(data) {
			// if the data has a url property, then we assume it's an annotation node that could represent
			// a temporal, spatial, or 3D annotation
			if ( data != null ) {
				if (data.properties) {
					this.view.seek(data);
				// otherwise, we assume its a number, string, or JSON representing the start time of a temporal annotation
        // or the position data of a 3D annotation
				} else {
					this.view.mediaObjectView.seek(data);
				}
			}
		}

    /**
     * Sends a message to the media element.
     *
		 * @param {String} message			Message to be sent.
		 */
    this.sendMessage = function(message) {
      if (this.view.mediaObjectView.sendMessage) {
        this.view.mediaObjectView.sendMessage(message);
      }
    }

		/**
		 * For time-based media, returns the current playback time.
		 * @return	Returns the current playback time for temporal media in seconds.
		 */
		this.getCurrentTime = function() {
			return this.view.getCurrentTime();
		}

    this.getPosition3D = function() {
      return this.view.getPosition3D();
    }

    this.handleAnnotationsUpdated = function() {
      return this.view.handleAnnotationsUpdated();
    }

		/**
		 * Returns true if the link passed to the plugin should be turned into a media player.
		 * @return		Returns true if the link is to a file that's been imported into Scalar.
		 */
		this.is_valid = function() {
			return (this.link.data('meta') && this.link.data('meta').length);
		}

		/**
		 * Returns true if the media element instance is currently playing (time-based media only).
		 * @return	Returns true if the time-based media is currently playing.
		 */
		this.is_playing = function() {
			return this.view.isPlaying();
		}

		this.setup();

	}

	/**
	 * Plug-in setup.
	 *
	 * @param {Object} options	An object containing relevant data for the media element.
	 */
	$.fn.mediaelement = function(options) {

		return this.each(function() {

			// check to see if we've been passed a link to a Scalar media file
			var element = $(this);
			if (element.data('meta') && element.data('meta').length) {

				// don't create a new instance of the plug-in class if one already exists on this element
	    		if (element.data('mediaelement')) return;

				var mediaelement = new MediaElement(this, options);

				// store the class in the data of the element itself
				element.data('mediaelement', mediaelement);

				// broadcast an event to the page once the element is created
				$('body').trigger( 'mediaElementComplete', [$(this)] );

			}

		});
	};

	/**
	 * Model for the plug-in.
	 * @constructor
	 */
	jQuery.MediaElementModel = function(options, link) {

		this.options = options;									// miscellaneous configuration data
		this.element = $('<div class="mediaelement"></div>');	// jQuery object that will contain the player
		this.mediaelement_dir = widgets_uri+'/mediaelement/';	// url of the mediaelement directory
		this.base_dir = options.base_dir;						// url of the current book
		this.seek = options.seek;								// initial seek position (optional)
		this.seekAnnotation = null;								// when doing an inital seek, this is the destination
		this.node = null;										// the Scalar node for the media
		this.isChromeless = options.chromeless;					// should the media be rendered in 'chromeless' style?

		$('body').trigger('mediaElement_wrapperCreated', [this.element]);

		/**
		 * Initializes the model.
	     *
		 * @param	{Object} link		An object encapsulating the original hyperlink and other data from which the media element is being generated.
		 * @param 	{Object} options	An object containing other relevant data for the media element.
		 */
		jQuery.MediaElementModel.prototype.init = function(link, options) {
			this.link = link; 															// encapsulates the original hyperlink and other data
			this.sidebarWidth = 270;  			   										// width of the annotation sidebar

			if ( this.options.autoplay == undefined ) {
				this.options.autoplay = false;
			}

			// path to the media file
			this.path = (this.link.data('path')) ? this.link.data('path') : '';
			this.path = (this.path.indexOf('://')==-1) ? scalarapi.model.urlPrefix + this.path : this.path;
			this.path = this.path.replace(/ /g, "%20").replace(/#/g, "%23");  // Simple urlencode for annotorious

			// Scalar url for the media
			this.meta = this.link.data('meta');
			this.meta = (this.meta.indexOf('://')==-1) ? scalarapi.model.urlPrefix + this.meta : this.meta;
      this.meta = scalarapi.model.urlPrefix.indexOf('https://') != -1 ? this.meta.replace('http://','https://') : this.meta;

			// filename of the media
			this.filename = scalarapi.basename(this.path);
			this.filename = this.filename.replace(/ /g, '_');
			this.filename = this.filename.replace(/%20/g, '_');
			this.filename = this.filename.replace(/[^a-zA-Z 0-9-_]+/g, '');

			// if height has been specified, assume the container has a horizontal layout
			if (this.options.height) {
 				this.containerLayout = "horizontal";

			// if width has been specified, assume the container has a vertical layout
			} else if (this.options.width) {
				this.containerLayout = "vertical";
			}

	   }

	}

	/**
	 * Controller for the plug-in.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} link			The hyperlink from which the mediaelement originated.
	 */
	jQuery.MediaElementController = function(model, link) {

		var me = this;

		this.model = model;			// instance of the model
		this.link = link;           // original HTML node

		/**
		 * Loads metadata for the media.
		 */
		jQuery.MediaElementController.prototype.loadMetadata = function() {
			// don't load metadata if we're in cantaloupe (unless specifically requested using the "solo' option)
			// (only cantaloupe pages should contain the "article" element)
			//if (( $.find( 'article' ).length == 0 ) || this.model.options.solo ) {
				if ( this.model.options.getRelated ) {
					// get all relationships
					if (scalarapi.loadNode(this.model.meta.substr(scalarapi.model.urlPrefix.length), true, this.handleMetadata, null, 1, true) == 'loaded') this.handleMetadata();
				} else {
					// get annotations only
					if (scalarapi.loadNode(this.model.meta.substr(scalarapi.model.urlPrefix.length), true, this.handleMetadata, null, 2, false, 'annotation,tag') == 'loaded') this.handleMetadata();
				}
			/*} else {
				// we need the delay so the plugin has the chance to make itself available to the page
				setTimeout( this.handleMetadata, 10 );
			}*/
		}

		/**
		 * Handles metadata load.
		 *
		 * @param {Object} json		JSON data comprising the media metadata.
		 */
		jQuery.MediaElementController.prototype.handleMetadata = function(json) {

			me.model.node = scalarapi.getNode( me.model.meta );

			if ( me.model.node != null ) {
        me.model.path = me.model.node.current.sourceFile;
				me.model.mediaSource = me.model.node.current.mediaSource;
				me.view.beginSetup();
			}

			$('body').trigger('mediaElementMetadataHandled', [$(link)]);

 		}

		/**
		 * Given the dimensions of a source rectangle, and a destination rectangle, returns an object containing the new dimensions of the source rectangle such that it will fit within the destination rectangle.
		 *
		 * @property {Number} sourceWidth		Width of the source rectangle.
		 * @property {Number} sourceHeight		Height of the source rectangle.
		 * @property {Number} destWidth			Width of the destination rectangle.
		 * @property {Number} destHeight		Height of the destination rectangle.
		 * @return								An object containing the new source rectangle dimensions.
		 */
		jQuery.MediaElementController.prototype.getFittedDimensions = function(sourceWidth, sourceHeight, destWidth, destHeight) {

			var fittedWidth;
			var fittedHeight;
			var sourceAspectRatio = sourceWidth / sourceHeight;
			var destAspectRatio = destWidth / destHeight;

			if (destAspectRatio < sourceAspectRatio) {
				fittedWidth = destWidth;
				fittedHeight = destWidth / sourceAspectRatio;
			} else {
				fittedHeight = destHeight;
				fittedWidth = destHeight * sourceAspectRatio;
			}

			return {width:fittedWidth, height:fittedHeight};
		}

		/**
		 * Toggles the annotation viewer open and closed.
		 */
		jQuery.MediaElementController.prototype.toggleAnnotations = function() {
			this.view.toggleAnnotations();
		}

	}

	/**
	 * Root view for the plug-in.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} controller	Instance of the primary controller.
	 */
	jQuery.MediaElementView = function(model, controller, link) {

		var me = this;

		this.link = link;											// original HTML node
		this.model = model;											// instance of the model
		this.controller = controller;								// instance of the primary controller
		this.annotationsVisible = false;							// are annotations currently visible?
		this.intervalId = null;										// id for timer interval
		this.playingSeekAnnotation = false;							// are we currently playing the annotation that we initially seeked to?
		this.containerDim = {x:0, y:0};								// maximum dimensions of the media container
		this.minContainerDim = {x:0, y:0};							// minimum dimensions of the media container
		this.intrinsicDim = {x:0, y:0};								// intrinsic dimensions of the media
		this.resizedDim = {x:0, y:0};								// resized dimensions of the media
		this.mediaMargins = {horz:0, vert:0};						// margin between media and its container
		this.gutterSize = 5;										// size of gutter between media and container
		this.controllerOffset = 0;									// size of controller for media
		this.controllerOnly = false;								// does the media lack a visual display?
		this.controllerHeight = 0;									// height of a controller-only container
		this.initialContainerWidth = 0;								// initial width of the media container
		this.overrideAutoSeek = false;								// whether we should override the automatic seek to a specific annotation
		this.annotationTimerRunning = false;						// true if the timer that checks for annotation seek success is running
		this.seekAttemptCount = 0;									// number of times we've tried to seek
		this.cachedPlayCommand = false;								// if true, then we should play after a successful seek
		this.currentAnnotation = null;								// currently active annotation
		this.native_full = true;                                    // whether media is set to full in native size
		/**
		 * Starts the process of initializing the view.
		 */
		jQuery.MediaElementView.prototype.beginSetup = function() {

			/**
			 *  Create a promise for any additional media libraries that must be loaded
			 *  This is done to ensure that any additional library is loaded only once, as if we simply pass getScripts as promises,
			 *  the way that the media elements are created will cause the library to load more than once upon media element
			 *  of the same type that immediately follows - by deferring all media element functions on those elements until we are
			 *  sure that the appropriate library is loaded, we can batch them together rather than possibly expend extra bandwidth.
			 */

			//Declare a self-resolving promise. This will be replaced if we need to wait to load a library
			var promise = $.Deferred(function( deferred ){
					$( deferred.resolve );
			});

			//We can only really detect libraries needed if the browser can support this type - otherwise, it will become an invalid media type later on
			if ( this.model.mediaSource.browserSupport[scalarapi.scalarBrowser] !== null ) {
				var player;
				if ( this.model.mediaSource.browserSupport[scalarapi.scalarBrowser] != null ) {
					player = this.model.mediaSource.browserSupport[scalarapi.scalarBrowser].player;
				}

				//QuickTime media elements need to load the quicktime library
				if(typeof QT_GenerateOBJECTText_XHTML === 'undefined' && player == 'QuickTime'){
					//If this is the first quicktime media element, then we need to initialize a list of promises and then start loading the library
					if(typeof pendingDeferredMedia.QuickTime == 'undefined'){
						pendingDeferredMedia.QuickTime = [];
						$.getScript(widgets_uri+'/mediaelement/AC_QuickTime.js',function(){
							//We have Quicktime loaded, so iterate through each deferred object and resolve it.
							for(var i = 0; i < pendingDeferredMedia.QuickTime.length; i++){
									pendingDeferredMedia.QuickTime[i].resolve();
							}
						});
					}
					//Here we make our promise and add it to the list of Quicktime deferred objects
					promise = $.Deferred();
					pendingDeferredMedia.QuickTime.push(promise);

				//Below we have the same structure for OpenSeadragon and FlowPlayer. Additional media libraries may be added here.
				}else if(typeof OpenSeadragon === 'undefined' && this.model.mediaSource.contentType == 'tiledImage'){
					if(typeof pendingDeferredMedia.OpenSeadragon == 'undefined'){
						pendingDeferredMedia.OpenSeadragon = [];
						$.getScript(widgets_uri+'/mediaelement/openseadragon/openseadragon.min.js',function(){
							for(var i = 0; i < pendingDeferredMedia.OpenSeadragon.length; i++){
									pendingDeferredMedia.OpenSeadragon[i].resolve();
							}
						});
					}
					promise = $.Deferred();
					pendingDeferredMedia.OpenSeadragon.push(promise);

				}else if(typeof Mirador === 'undefined' && this.model.mediaSource.contentType == 'manifest'){
					if(typeof pendingDeferredMedia.Mirador == 'undefined'){
						pendingDeferredMedia.Mirador = [];
						$.getScript(widgets_uri+'/mediaelement/mirador.min.js',function(){
							for(var i = 0; i < pendingDeferredMedia.Mirador.length; i++){
									pendingDeferredMedia.Mirador[i].resolve();
							}
						});
					}
					promise = $.Deferred();
					pendingDeferredMedia.Mirador.push(promise);

				}else if(typeof Hls === 'undefined' && player == 'HLS'){
					if(typeof pendingDeferredMedia.Hls == 'undefined'){
						pendingDeferredMedia.Hls = [];
						$.when(
							$.ajax({
								url: widgets_uri+'/mediaelement/hls.min.js',
								dataType: "script",
								cache: true,
							})
						).then(function(){
							for(var i = 0; i < pendingDeferredMedia.Hls.length; i++){
									pendingDeferredMedia.Hls[i].resolve();
							}
						});
					}
					promise = $.Deferred();
					pendingDeferredMedia.Hls.push(promise);

				}else if(typeof SC === 'undefined' && this.model.mediaSource.contentType == 'audio' && this.model.mediaSource.name == 'SoundCloud'){
					if(typeof pendingDeferredMedia.SoundCloud == 'undefined'){
						pendingDeferredMedia.SoundCloud = [];
						$.when(
							$.getScript('https://connect.soundcloud.com/sdk/sdk-3.3.2.js'),
							$.getScript('https://w.soundcloud.com/player/api.js')
						).then(function(){
							for(var i = 0; i < pendingDeferredMedia.SoundCloud.length; i++){
									pendingDeferredMedia.SoundCloud[i].resolve();
							}
						});
					}
					promise = $.Deferred();
					pendingDeferredMedia.SoundCloud.push(promise);

				}else if(typeof THREE === 'undefined' && player == 'Threejs'){
					if(typeof pendingDeferredMedia.Threejs == 'undefined'){
						pendingDeferredMedia.Threejs = [];
						//Because TrackballControls and STLLoader immediately require THREE to be set,
						//we will first load three.min.js to make sure it is defined, then
						//asynchronously load the other two files.
						$.getScript(widgets_uri+'/mediaelement/three.min.js',function(){
							$.when(
								$.getScript(widgets_uri+'/mediaelement/TrackballControls.js'),
								$.getScript(widgets_uri+'/mediaelement/STLLoader.js')
							).then(function(){
								for(var i = 0; i < pendingDeferredMedia.Threejs.length; i++){
										pendingDeferredMedia.Threejs[i].resolve();
								}
							});
						});
					}
					promise = $.Deferred();
					pendingDeferredMedia.Threejs.push(promise);

				}else if(typeof Vimeo === 'undefined' && this.model.mediaSource.contentType == 'video' && this.model.mediaSource.name == 'Vimeo'){
					if(typeof pendingDeferredMedia.Vimeo == 'undefined'){
						pendingDeferredMedia.Vimeo = [];
						$.when(
							$.getScript(widgets_uri+'/mediaelement/player.js')
						).then(function(){
							for(var i = 0; i < pendingDeferredMedia.Vimeo.length; i++){
									pendingDeferredMedia.Vimeo[i].resolve();
							}
						});
					}
					promise = $.Deferred();
					pendingDeferredMedia.Vimeo.push(promise);

				}else if(typeof Prism == 'undefined' && this.model.mediaSource.contentType == 'document' && (this.model.mediaSource.name == 'SourceCode' || scalarapi.getQueryVars( this.model.path ).lang != null)){
					if(typeof pendingDeferredMedia.Prism == 'undefined'){
						pendingScripts = 0;
						pendingDeferredMedia.Prism = [];
						$.when(
							$.getScript(widgets_uri+'/mediaelement/prism.js')
						).then(function(){
							var doc = document;
							var approot = $('link#approot').attr('href');
							var cssLink = document.createElement("link");
							cssLink.href = approot+'views/widgets/mediaelement/prism.css';
							cssLink.rel = "stylesheet";
							cssLink.type = "text/css";
							doc.body.appendChild(cssLink);
							for(var i = 0; i < pendingDeferredMedia.Prism.length; i++){
								pendingDeferredMedia.Prism[i].resolve();
							}
						});
					}
					promise = $.Deferred();
					pendingScripts++;
					pendingDeferredMedia.Prism.push(promise);
				}else if((typeof google == 'undefined' || typeof google.maps == 'undefined') && this.model.mediaSource.name == 'KML'){
					if(typeof pendingDeferredMedia.GoogleMaps == 'undefined'){
						pendingScripts = 0;
						pendingDeferredMedia.GoogleMaps = [];
						$.when(
							$.getScript('https://maps.googleapis.com/maps/api/js?key=' + $('link#google_maps_key').attr('href'))
						).then(function(){
							for(var i = 0; i < pendingDeferredMedia.GoogleMaps.length; i++){
								pendingDeferredMedia.GoogleMaps[i].resolve();
							}
						});
					}
					promise = $.Deferred();
					pendingDeferredMedia.GoogleMaps.push(promise);
				}else if(player == 'native' && $('.book-title').children('[data-semantic-annotation-tool]').length && !$.isFunction($.fn.annotate)){
					if(typeof pendingDeferredMedia.Waldorf == 'undefined'){
						pendingDeferredMedia.Waldorf = [];
						var waldorfLocation = $('link#approot').attr('href') + 'views/widgets/waldorf/';
						$.when(
							$.getScript(waldorfLocation + 'jquery-ui-1.12.1.custom/jquery-ui.min.js'),
							$.getScript(waldorfLocation + 'annotator-frontend-scalar.js')
						).then(function(){
							for(var i = 0; i < pendingDeferredMedia.Waldorf.length; i++){
								pendingDeferredMedia.Waldorf[i].resolve();
							}
						});
					}
					promise = $.Deferred();
					pendingDeferredMedia.Waldorf.push(promise);
				}
			}

			$.when(promise).then($.proxy(function(){
				this.parseMediaType();

				// don't parse annotations if this is an image and we're in the annotation editor (in that case, the annotation editor
				// will take care of displaying the annotations)
				if ((this.model.mediaSource.contentType != 'image') || (document.location.href.indexOf('.annotation_editor') == -1)) {
					this.parseAnnotations();
				}

				this.header = $('<div class="mediaElementHeader"></div>').appendTo(this.model.element);
	  			this.annotationSidebar = $('<div class="mediaElementAnnotationSidebar"></div>').appendTo(this.model.element);
	  			this.mediaContainer = $('<div class="mediaContainer"></div>').appendTo(this.model.element);
	  			if (this.model.mediaSource.name == "image") this.spatialAnnotation = $('<div class="spatialAnnotation"><div></div></div>').appendTo(this.mediaContainer);
	  			this.footer = $('<div class="mediaElementFooter"></div>').appendTo(this.model.element);

	 			this.initialContainerWidth = parseInt(this.mediaContainer.width());

	 			if ( this.model.isChromeless ) {
	 				this.gutterSize = 0;
	 			}

				this.populateHeader();
	   			this.populateFooter();

	  			this.calculateContainerSize();

	  			this.populateSidebar();
				this.populateContainer();


				if ('undefined'!=typeof(this.mediaObjectView)) {

					// Native YouTube player requires that we download API code first
					if (this.model.mediaSource.name == "YouTube") {

						// check to see if another mediaelement instance has already downloaded the API
						me.foundYouTubeAPI = false;
						$('script').each(
							function() {
								if (this.src.indexOf('www.youtube.com') != -1) {
									me.foundYouTubeAPI = true;
								}
							}
						);

						// if not, then do so, delay creation of the media object, and create function which
						// will create all the YouTube instances once the API is ready
						if (!me.foundYouTubeAPI) {
							youTubeMediaElementViews.push(this);

							// load the API
							var tag = document.createElement('script');
							tag.src = "//www.youtube.com/player_api";
							//tag.src = "https://www.youtube.com/iframe_api"; // needed only if testing locally
							var firstScriptTag = document.getElementsByTagName('script')[0];
							firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

							// set up function to handle API arrival
							window['onYouTubePlayerAPIReady'] = function() {
								var i;
								var n = youTubeMediaElementViews.length;
								// loop through all the waiting instances and create each one
								for (i=0; i<n; i++) {
									var mediaObjectHTML = youTubeMediaElementViews[i].mediaObjectView.createObject();
									if (mediaObjectHTML != null) youTubeMediaElementViews[i].mediaContainer.html(mediaObjectHTML);
									youTubeMediaElementViews[i].layoutMediaObject();
									$('body').trigger('mediaElementReady', [$(youTubeMediaElementViews[i])]);
								}
								youTubeMediaElementViews = [];
							}

						// if this is a maximized instance or the array of waiting YouTube views has been emptied,
						// assume the API has been loaded and create the player immediately
						} else if ((this.model.options.header == 'nav_bar') || (youTubeMediaElementViews.length == 0)) {
				  			var mediaObjectHTML = this.mediaObjectView.createObject();
							if (mediaObjectHTML != null) this.mediaContainer.html(mediaObjectHTML);
							$('body').trigger('mediaElementReady', [$(this)]);
							this.layoutMediaObject();

						// otherwise, delay creation of the player until the API loads
						} else {
							youTubeMediaElementViews.push(this);
						}

					// initialize the SoundCloud API if we haven't already
					} else if (this.model.mediaSource.name == 'SoundCloud') {
						if(!soundCloudInitialized){
							SC.initialize({client_id: $('#soundcloud_id').attr('href')});
							soundCloudInitialized = true;
						}
						var mediaObjectHTML = this.mediaObjectView.createObject();
						if (mediaObjectHTML != null) this.mediaContainer.html(mediaObjectHTML);
						$('body').trigger('mediaElementReady', [$(this)]);
						this.layoutMediaObject();

					// otherwise, create the media object now
					} else {
			  			var mediaObjectHTML = this.mediaObjectView.createObject();
						if (mediaObjectHTML != null) this.mediaContainer.html(mediaObjectHTML);
						$('body').trigger('mediaElementReady', [$(this)]);
						this.layoutMediaObject();
					}

				}
			},this));
		}

		/**
		 * Populates the header element with content.
		 */
		jQuery.MediaElementView.prototype.populateHeader = function() {

			if (!this.model.isChromeless) {

				// Menu header (for "maximized" mediaelements only)
				if (this.model.options.header == 'nav_bar') {

					// tabs
		    		var tabs = '<ul class="nav_bar_options">';
		    		tabs += '<span class="downArrow"><li id="max_file_button" class="sel" title="Display the media alone">Media</li></span>';
		    		tabs += '<span class="noArrow"><li id="max_desc_button" title="Display the media\'s title and description">Description</li></span>';
		    		tabs += '<span class="noArrow"><li id="max_anno_button" title="View annotations">Annotations</li></span>';
		    		tabs += '<span class="noArrow"><li id="max_meta_button" title="Display the media\'s metadata fields">Metadata</li></span>';
		    		tabs += '<span class="noArrow"><li id="max_perm_button" title="Load the media\'s permanent page">Permalink</li></span>';
		    		tabs += '<span class="noArrow"><li id="max_popout_button" title="Launch the file in a new browser window">Popout</li></span>';
		    		tabs += '</ul>';

		    		this.header.addClass('mediaElementHeaderWithNavBar');
		    		this.header.append(tabs);

		    		// Media button: maximize the media
					this.header.find('#max_file_button').on('click', function() {
						$(this).parent().parent().find('span').removeClass('downArrow');
						$(this).parent().parent().find('span').addClass('noArrow');
						$(this).parent().parent().find('li').removeClass('sel');
						$(this).parent().removeClass('noArrow');
						$(this).parent().addClass('downArrow');
						$(this).addClass('sel');
						if (me.annotationsVisible) {
							me.annotationsVisible = false;
							me.updateSidebarDisplay();
						}
					});

					// Description button: open the title|description panel
					this.header.find('#max_desc_button').on('click', function() {
						$(this).parent().parent().find('span').removeClass('downArrow');
						$(this).parent().parent().find('span').addClass('noArrow');
						$(this).parent().parent().find('li').removeClass('sel');
						$(this).parent().removeClass('noArrow');
						$(this).parent().addClass('downArrow');
						$(this).addClass('sel');
						if (!me.annotationsVisible) {
							me.annotationsVisible = true;
							me.updateSidebarDisplay();
						}
						var sidebar = $(this).parents('.mediaelement:first').children('.mediaElementAnnotationSidebar');
						$(sidebar).find('.mediaElementSidebarDesc').show();
						$(sidebar).find('.mediaElementSidebarDesc').removeAttr('padding');
						$(sidebar).find('.mediaElementSidebarMeta').hide();
						$(sidebar).find('.mediaElementSidebarMeta').removeAttr('padding');
						$(sidebar).find('.annotationChip').hide();
					});

					// Annotation button: open the annotation panel
					this.header.find('#max_anno_button').on('click', function() {
						$(this).parent().parent().find('span').removeClass('downArrow');
						$(this).parent().parent().find('span').addClass('noArrow');
						$(this).parent().parent().find('li').removeClass('sel');
						$(this).parent().removeClass('noArrow');
						$(this).parent().addClass('downArrow');
						$(this).addClass('sel');
						if (!me.annotationsVisible) {
							me.annotationsVisible = true;
							me.updateSidebarDisplay();
						}
						var sidebar = $(this).parents('.mediaelement:first').children('.mediaElementAnnotationSidebar');
						$(sidebar).find('.mediaElementSidebarDesc').hide();
						$(sidebar).find('.mediaElementSidebarDesc').removeAttr('padding');
						$(sidebar).find('.mediaElementSidebarMeta').hide();
						$(sidebar).find('.mediaElementSidebarMeta').removeAttr('padding');
						$(sidebar).find('.annotationChip').show();
					});

					// Metadata button: open the meta panel
					this.header.find('#max_meta_button').on('click', function() {
						$(this).parent().parent().find('span').removeClass('downArrow');
						$(this).parent().parent().find('span').addClass('noArrow');
						$(this).parent().parent().find('li').removeClass('sel');
						$(this).parent().removeClass('noArrow');
						$(this).parent().addClass('downArrow');
						$(this).addClass('sel');
						if (!me.annotationsVisible) {
							me.annotationsVisible = true;
							me.updateSidebarDisplay();
						}
						var sidebar = $(this).parents('.mediaelement:first').children('.mediaElementAnnotationSidebar');
						$(sidebar).find('.mediaElementSidebarDesc').hide();
						$(sidebar).find('.mediaElementSidebarDesc').removeAttr('padding');
						$(sidebar).find('.mediaElementSidebarMeta').show();
						$(sidebar).find('.mediaElementSidebarMeta').removeAttr('padding');
						$(sidebar).find('.annotationChip').hide();
					});

					// Permalink button: take user to file page
					this.header.find('#max_perm_button').data('meta',this.model.meta).on('click', function() {
						window.location.href = $(this).data('meta');
					});

					// Source button: open the file in a new browser window
					this.header.find('#max_popout_button').data('path',this.model.path).on('click', function() {
						window.open($(this).data('path'), 'popout', 'width='+(parseInt($(window).width())-100)+',height='+(parseInt($(window).height())-100));
					});

					// Close button: close the maximize panel
					var close_link = $('<a alt="Close" href="javascript:;">&nbsp;</a>');
					var close_span = $('<span class="close_link"></span>');
					close_span.append(close_link);
					this.header.append(close_span);
					close_link.on('click', function() {
						$(this).parents('.maximize').remove();
						$('.vert_slots').find('.slot').find('object, embed').css('visibility','visible');
					});
					$slot.find('.mediaElementAlignRight').remove();

					// makes the description tab the default on open
					this.header.find('#max_desc_button').trigger('click');

		    	// Simple header
		    	} else {

					this.header.append('<p class="mediaElementAlignLeft">'+this.model.node.getDisplayTitle()+'<span style="font-size:10px"></span></p>');

					if (this.model.node.current.publisher != null) {
						this.header.find('span').append(' / '+this.model.node.current.publisher);
					}
					if (this.model.node.current.contributor != null) {
						this.header.find('span').append(' / '+this.model.node.current.contributor);
					}
					if (this.model.node.current.source != null) {
						this.header.find('span').append(' / '+this.model.node.current.source);
					}

		    		// toggle annotation display
					if (this.model.containerLayout == "horizontal") {
						var cntrllr = this.controller;
						this.annotationLink = $('<a href="javascript:;">Annotations</a>');
						this.annotationLink.data('cntrllr', cntrllr);
						this.annotationLink.on('click', function() {
							$(this).data('cntrllr').toggleAnnotations();
						});
						var temp = $('<p class="mediaElementAlignRight annotationToggle"></p>');
						this.annotationLink = temp.append(this.annotationLink);
						this.annotationLink.appendTo(this.header);
					}

		    	}
			}
		}

		/**
		 * Populates the media container element with content.
		 */
		jQuery.MediaElementView.prototype.populateContainer = function() {

			switch (this.model.containerLayout) {

				case "horizontal":
				if ((this.mediaContainer.closest('.slot').length > 0) || (this.model.options.header == 'nav_bar')) {
					// only set the height of the container if we're in a slot manager
					if (model.options.width == null) this.mediaContainer.height(this.containerDim.y);
				}
				break;

				case "vertical":
				this.mediaContainer.css('max-height', this.containerDim.y);
 				break;

			}

			var playerIsNative = false;
			if ( this.model.mediaSource.browserSupport[scalarapi.scalarBrowser] != null ) {
				if ( this.model.mediaSource.browserSupport[scalarapi.scalarBrowser].player == 'native' ) {
					playerIsNative = true;
				}
			}

			if ((this.model.mediaSource.contentType == 'image') && playerIsNative && (this.mediaObjectView.annotations != null)) {
				this.mediaObjectView.setupAnnotations(this.mediaObjectView.annotations);
			}

		}

		/**
		 * Populates the sidebar element with content.
		 */
		jQuery.MediaElementView.prototype.populateSidebar = function() {

			if (this.model.containerLayout == "horizontal") {
				this.annotationSidebar.append('<div style="display:none;" class="annotationChip dark">No annotations to display.</div>');
				this.annotationSidebar.height(this.containerDim.y);
			}

			if (this.model.options.header == 'nav_bar') {

				// Title-description panel
				var title = this.model.node.getDisplayTitle();
				if (!title || !title.length) title = '(No title)';
				var desc = this.model.node.current.description;
				if (!desc || !desc.length) desc = '(No description)';
				var $desc = $('<div class="mediaElementSidebarDesc"><div class="desc_title">'+title+'</div>'+desc+'</div>');
				this.annotationSidebar.append($desc);

				// Meta
				var $meta = $('<div class="mediaElementSidebarMeta"><table cellspacing="0" cellpadding="0"></table></div>');
				var $table = $meta.find('table:first');
				for (var j in this.model.node.current.properties) {  // Load each meta field/value(s)
					var field = j.substr( (j.lastIndexOf('/')+1) );
					if (field.lastIndexOf('#')!=-1) field = field.substr( (field.lastIndexOf('#')+1) );
					field = ucwords(field).replace('_', ' ');
					if (field == 'PrimaryTopic') field = 'Source file';
					var values = [];
					for (var k = 0; k < this.model.node.current.properties[j].length; k++) {
						var value = this.model.node.current.properties[j][k].value;
						if (field.toLowerCase()=='url'&&value.indexOf('://')==-1) value = $('link#parent').attr('href')+value;
						var chop_at = 40;  // Magic number
						var print_value = value;
						if (print_value.indexOf(' ')==-1 && print_value.length>chop_at) print_value = wordwrap(print_value, chop_at, ' ', true); // Until I can figure out how to wordwrap in Safari/CSS
						if (value.indexOf('://')!=-1) print_value = '<a href="'+value+'" target="_blank">'+print_value+'</a>';
						values.push(print_value);
					}
					$table.append('<tr><td title="'+j+'"><b>'+field+'</b></td></tr>');
					$table.append('<tr><td class="value"><ul><li>'+values.join('</li><li>')+'</li></ul></td></tr>');
				}
				$table.append('<tr><td><a href="'+this.model.node.url+'.rdf" class="rdf_link""">View as RDF</a></td></tr>');
				this.annotationSidebar.append($meta);

				// Float sidebar to left
				this.annotationSidebar.addClass('annotationSidebarWithNavBar');
				this.mediaContainer.addClass('mediaContainerWithNavBar');

			}

			this.updateSidebarDisplay();

		}

		/**
		 * Populates the footer element with content.
		 */
		jQuery.MediaElementView.prototype.populateFooter = function() {

			// no footer if menu is showing
			if ((this.model.options.header == 'nav_bar') || ('undefined'!=typeof(this.model.options.show_footer) && !this.model.options.show_footer)) {
				this.footer.hide();
				this.footer.remove();

			// standard footer
			} else if (!this.model.isChromeless) {

				// show number of annotations if we're in vertical layout and not in the annotation editor
				if (this.model.containerLayout == "vertical") {
					if (-1==document.location.href.indexOf('annotation_editor')) {
						var annoQuantity = $('<p class="mediaElementAlignLeft">&nbsp;</p>').appendTo(this.footer);
						annoQuantity.css('width', '50%');
					}
				}

				// if we're not in the annotation editor, then
				if (-1==document.location.href.indexOf('annotation_editor')) {

					// the View Page/View PDF button is initially hidden, this gives it the right text
					// in case we do end up showing it
					var extension = scalarapi.getFileExtension(this.model.path);
					var viewString = 'View Page';
					if (extension.toLowerCase() == 'pdf') {
						viewString = 'View PDF';
					}

					var maximizeButton = $('<p class="mediaElementAlignRight"><a id="viewPageLink" class="generic_button">'+viewString+'</a> <a id="maximizeLink" class="generic_button" href="javascript:;">Details</a></p>').appendTo(this.footer);
					maximizeButton.addClass('mediaElementAlignRightDetails');
					maximizeButton.siblings('.mediaElementAlignLeft').addClass('mediaElementAlignLeftDetails');

					// opens original media file (for HTML pages and PDFs only)
					maximizeButton.find('a#viewPageLink').data('me', this).on('click', function() {
						var $this = $(this);
						var base_dir = scalarapi.model.urlPrefix;
						var path = $this.data('me').model.path;
						var link = path;
						if ($this.data('me').model.node.current.sourceLocation != null) link = $this.data('me').model.node.current.sourceLocation;
						document.location.href = base_dir+'external?link='+encodeURIComponent(link)+'&prev='+encodeURIComponent(document.location.href);
					});

					// maximize link (now called 'Details' in the interface)
					maximizeButton.find('a#maximizeLink').data('link', this.link).data('me', this).on('click', function() {
						if (!$.isFunction($.fn.scalarmaximize)) return alert('Could not find maximize script.');

						// pause all playing mediaelement instances
						var view;
						$('a').each(function() {
							if ($(this).data('clone')) {
								var clone = $(this).data('clone');
								view = clone.data('mediaelement').view;
							}
							if (view) {
								if (((view.model.mediaSource.contentType == 'video') || (view.model.mediaSource.contentType == 'audio')) && (view.isPlaying())) view.pause();
							}
							view = null;
							if ($(this).data('mediaelement')) {
								view = $(this).data('mediaelement').view;
							}
							if (view) {
								if (((view.model.mediaSource.contentType == 'video') || (view.model.mediaSource.contentType == 'audio')) && (view.isPlaying())) view.pause();
							}
						});
						var $link = $($(this).data('link'));
						$link.scalarmaximize();
					});
				}

				// dynamic blue annotation highlight
	   			this.annotationDisplay = $('<div class="annotationDisplay"><p>This is the display</p></div>').appendTo(this.footer);
	    		this.annotationDisplay.hide();
			}

		}

		/**
		 * Parses the media type to determine what kind of player to create.
		 */
		jQuery.MediaElementView.prototype.parseMediaType = function() {

			if ( this.model.mediaSource.browserSupport[scalarapi.scalarBrowser] == null ) {
				this.mediaObjectView = new $.UnsupportedObjectView(this.model, this);

			} else {

				var player;
				if ( this.model.mediaSource.browserSupport[scalarapi.scalarBrowser] != null ) {
					player = this.model.mediaSource.browserSupport[scalarapi.scalarBrowser].player;
				}

        var isCulturallySensitive = false;

				if (this.model.node.current.auxProperties['dcterms:accessRights'] != null) {
          if (this.model.node.current.auxProperties['dcterms:accessRights'].indexOf('culturally-sensitive') != -1) {
            isCulturallySensitive = true;
            this.mediaObjectView = new $.CulturallySensitiveObjectView(this.model, this);
          }
        }

				if (!isCulturallySensitive) {

					switch (this.model.mediaSource.contentType) {

						case '3D':
						if (player == 'Threejs') {
							this.mediaObjectView = new $.ThreejsObjectView(this.model, this);
            } else if (this.model.mediaSource.name == 'Unity WebGL') {
              this.mediaObjectView = new $.UnityWebGLObjectView(this.model, this);
						}
						break;

						case 'image':
						if (player == 'QuickTime') {
							this.mediaObjectView = new $.QuickTimeObjectView(this.model, this);
						} else {
							this.mediaObjectView = new $.ImageObjectView(this.model, this);
						}
						break;

						case 'tiledImage':
							this.mediaObjectView = new $.DeepZoomImageObjectView(this.model, this);
						break;
						case 'manifest':
							this.mediaObjectView = new $.MiradorObjectView(this.model, this);
						break;
						case 'audio':
						if (this.model.mediaSource.name == 'SoundCloud') {
							this.mediaObjectView = new $.SoundCloudAudioObjectView(this.model, this);
						} else if (player == 'QuickTime') {
							this.mediaObjectView = new $.QuickTimeObjectView(this.model, this);
						} else if (player == 'native') {
							this.mediaObjectView = new $.HTML5AudioObjectView(this.model, this);
						}
						break;
						case 'video':
						switch (player) {

							case 'QuickTime':
								if (this.model.mediaSource.name == 'QuickTimeStreaming') {
									this.mediaObjectView = new $.StreamingQuickTimeObjectView(this.model, this);
								} else {
									this.mediaObjectView = new $.QuickTimeObjectView(this.model, this);
								}
							break;

							case 'HLS':
								if (this.model.node.current.auxProperties['dcterms:type'] == 'Sound') {
									this.mediaObjectView = new $.HLSAudioObjectView(this.model, this);
								} else {
									this.mediaObjectView = new $.HLSVideoObjectView(this.model, this);
								}
							break;

							case 'native':
								if ($('.book-title').children('[data-semantic-annotation-tool]').length) {
									this.mediaObjectView = new $.SemanticAnnotationToolObjectView(this.model, this);
								} else {
									if (this.model.node.current.auxProperties['dcterms:type'] == 'Sound') {
										this.mediaObjectView = new $.HTML5AudioObjectView(this.model, this);
									} else {
										this.mediaObjectView = new $.HTML5VideoObjectView(this.model, this);
									}
								}
							break;

							case 'proprietary':
							switch (this.model.mediaSource.name) {

								case 'Vimeo':
								this.mediaObjectView = new $.VimeoVideoObjectView(this.model, this);
								break;

								case 'YouTube':
								this.mediaObjectView = new $.YouTubeVideoObjectView(this.model, this);
								break;

							}
							break;

							default:
							this.mediaObjectView = new $.UnsupportedObjectView(this.model, this);
							break;

						}
						break;

						case 'map':
						switch (this.model.mediaSource.name) {

							case 'HyperCities':
							if ((this.model.options.header == 'nav_bar') || (this.model.meta == scalarapi.stripAllExtensions(window.location.href)) || this.model.options.height) {
								this.mediaObjectView = new $.HyperCitiesObjectView(this.model, this);
							} else {
								// replace HyperCities with maximize instructions if slot is too small
								this.model.mediaSource = scalarapi.mediaSources.GIF;
								this.mediaObjectView = new $.ImageObjectView(this.model, this);
								this.model.path = this.model.mediaelement_dir +'hypercities_card.gif';
							}
							break;

							case 'KML':
							this.mediaObjectView = new $.GoogleMapsObjectView(this.model, this);
							break;

							default:
							this.mediaObjectView = new $.UnsupportedObjectView(this.model, this);
							break;

						}
						break;

						case 'document':
						switch (this.model.mediaSource.name) {

							case 'HTML':
							this.mediaObjectView = new $.HTMLObjectView(this.model, this);
							break;

							case 'PDF':
							this.mediaObjectView = new $.PDFObjectView(this.model, this);
							break;

							case 'PlainText':
							var queryVars = scalarapi.getQueryVars( this.model.path );
							if ( queryVars.lang != null ) {
								this.mediaObjectView = new $.SourceCodeObjectView(this.model, this);
							} else {
								this.mediaObjectView = new $.TextObjectView(this.model, this);
							}
							break;

							case 'SourceCode':
							this.mediaObjectView = new $.SourceCodeObjectView(this.model, this);
							break;

							case 'Prezi':
							this.mediaObjectView = new $.PreziObjectView(this.model, this);
							break;

						}
						break;

						default:
						this.mediaObjectView = new $.UnsupportedObjectView(this.model, this);
						break;
					}
				}
			}
		}

		/**
		 * Lays out the media object.
		 */
		jQuery.MediaElementView.prototype.layoutMediaObject = function() {
			this.calculateMediaSize();
			this.mediaObjectView.resize(this.resizedDim.x, this.resizedDim.y);

			// magic number stuff to get layouts to look right
			if ((this.model.containerLayout == "horizontal") && (this.model.options.header != 'nav_bar')) {
				var fudgeAmount = 0;
				var hMargin;
				if (!this.annotationsVisible) {
					switch (this.model.mediaSource.name) {

						case "YouTube":
						fudgeAmount = -2;
						break;

					}
					this.model.element.width( this.resizedDim.x + fudgeAmount  + (this.gutterSize * 2) );
				} else {
					switch (this.model.mediaSource.name) {

						case "YouTube":
						fudgeAmount = 2;
						break;

						case "MPEG-3":
						case "WAV":
						case "OGA":
						case "AIFF":
						fudgeAmount = 3;
						break;

						default:
						fudgeAmount = 2;
						break;

					}
					this.model.element.width(Math.max(this.resizedDim.x + fudgeAmount + parseInt(this.annotationSidebar.width()-1) + (this.gutterSize * 2), this.minContainerDim.x));
				}

				// update horizontal margins around media element
				if (!this.model.isChromeless) {
					hMargin = (this.initialContainerWidth - parseFloat(this.model.element.width())) * .5;
					this.model.element.css('margin-left', hMargin);
				}
			} else {
				if (this.model.isChromeless) {
					this.model.element.width(this.resizedDim.x);
				}
			}

			//console.log('element width: '+this.model.filename+' '+this.model.element.width());

		}

		/**
		 * Calculates the maximum allowed size of the media container.
		 */
		jQuery.MediaElementView.prototype.calculateContainerSize = function() {
			var native_size = this.model.options.size == 'native';
			var full_size = this.model.options.size == 'full';
			switch (this.model.containerLayout) {

				case "horizontal":
				if ((native_size === true) || (full_size === true) || ( this.initialContainerWidth == 0 )) {
					this.containerDim.x = parseInt(this.model.options.width);
				} else {
					this.containerDim.x = this.initialContainerWidth;
				}
				if (!this.model.isChromeless) {
					this.containerDim.x--;
				}
				if (this.annotationsVisible) {
					this.containerDim.x -= (parseInt(this.annotationSidebar.width()) + (this.gutterSize * 2));
				}
				if ((this.controllerOnly && (this.mediaContainer.closest('.slot').length == 0)) && (this.model.options.header != 'nav_bar'))  {
 					this.containerDim.y = this.controllerHeight + (this.gutterSize * 2);
 				} else if (!this.model.isChromeless) {
					this.containerDim.y = parseInt(this.model.options.height) - parseInt(this.header.height()) + 1;
				} else {
					this.containerDim.y = parseInt(this.model.options.height);
				}
				if (this.footer.attr('visible')) this.containerDim.y -= parseInt(this.footer.height());
				this.minContainerDim.y = this.containerDim.y;
				this.minContainerDim.x = Math.round(this.containerDim.y * .5);
				if (this.containerDim.x < this.minContainerDim.x) this.containerDim.x = this.containerDim.y * 1.33;
				break;

				case "vertical":
				this.containerDim.x = parseInt(this.model.options.width)
 				if (!this.model.isChromeless) this.containerDim.x -= 2;
 				if (this.controllerOnly) {
 					this.containerDim.y = Math.max(this.minContainerDim.y, this.controllerHeight + (this.gutterSize * 2));
 				} else if (this.model.isChromeless) {
 					if ( this.model.mediaSource.contentType != 'image' ) {
 						this.containerDim.y = window.innerHeight - 350 - parseInt(this.header.height()) - parseInt(this.footer.height());
					} else {
 						this.containerDim.y = 1040 - parseInt(this.header.height()) - parseInt(this.footer.height());
 					}
 				} else {
 					this.containerDim.y = 375 - parseInt(this.header.height()) - parseInt(this.footer.height());
 				}
 				this.minContainerDim.x = this.containerDim.x;
 				this.minContainerDim.y = Math.round(this.containerDim.x * .33);
				break;

			}

			if (this.model.mediaSource.contentType != 'image' && !full_size && !native_size) {
				this.containerDim.y = Math.min( this.containerDim.y, window.innerHeight - 250 );
			} else if ( scalarapi.getFileExtension( window.location.href ) == "annotation_editor" ) {
				this.containerDim.y = Math.min( this.containerDim.y, window.innerHeight - 350 );
			}

			if (this.model.mediaSource.name == 'HyperCities') this.containerDim.x -= 4;

			//console.log( 'container: ' + this.model.containerLayout+' '+this.initialContainerWidth+' '+this.containerDim.x+' '+this.containerDim.y+' '+this.footer.height()+' '+this.annotationSidebar.width());

		}

		/**
		 * Calculates the optimum display size for the media.
		 */
		jQuery.MediaElementView.prototype.calculateMediaSize = function() {
			// if this is liquid media, always make it the maximum size
			if (this.mediaObjectView.isLiquid) {
				this.intrinsicDim = this.containerDim;
			}
			if (this.intrinsicDim.x == 0) {

				// intrinsic dim unknown; assume 640x480
				if (this.intrinsicDim.y == 0) {
					this.intrinsicDim.x = 640;
					this.intrinsicDim.y = 480;

				// only y dimension known; make 1.33:1
				} else {
					this.intrinsicDim.x = this.intrinsicDim.y * 1.33;
					this.intrinsicDim.y = this.intrinsicDim.y;
				}
			} else {

				// only x dimension known; make 1.33:1
				if (this.intrinsicDim.y == 0) {
					this.intrinsicDim.x = this.intrinsicDim.x;
					this.intrinsicDim.y = this.intrinsicDim.x / 1.33;

				// both dimensions known; use as is
				} else {
					this.intrinsicDim.x = this.intrinsicDim.x;
					this.intrinsicDim.y = this.intrinsicDim.y;
				}
			}

			var mediaAR = this.intrinsicDim.x / this.intrinsicDim.y;
			var containerAR = this.containerDim.x / this.containerDim.y;

			//console.log( 'media: ' + this.intrinsicDim.x+' '+this.intrinsicDim.y+' '+mediaAR+' '+containerAR);

			var native_size = this.model.options.size == 'native';
			var tempDims = {
				x: this.containerDim.x,
				y: this.containerDim.y
			};

			// Set Maximum height for media types designated in typeLimits object;
			var typeLimits = this.model.options.typeLimits;
			var contentType = this.model.mediaSource.contentType;
			var maxHeight;
			if (typeof typeLimits == 'object') {
				$.each(typeLimits, function(type, max) {
					if (contentType == type) {
						maxHeight = max;
					} else if (type == 'default') {
						if(typeof maxHeight == 'undefined') {
							maxHeight = max;
						}
					}
				});
				if (typeof maxHeight != 'undefined') {
					if (mediaAR > containerAR) {
						// Must limit width in order to get the right height limit
						tempDims.x = Math.min(maxHeight * mediaAR,tempDims.x);
					} else {

						tempDims.y = Math.min(maxHeight, tempDims.y);
					}
				}
			}

			if (mediaAR > containerAR) {
				if(native_size && this.intrinsicDim.x < tempDims.x) {
					tempDims.x = this.intrinsicDim.x;
					this.native_full = false;
				}
				if (this.model.isChromeless) {
					this.resizedDim.x = tempDims.x;
				} else {
					this.resizedDim.x = tempDims.x - (this.gutterSize * 2);
				}
				this.resizedDim.y = this.resizedDim.x / mediaAR + this.controllerOffset;
			} else {
				if(native_size && this.intrinsicDim.y < tempDims.y) {
					tempDims.y = this.intrinsicDim.y;
				}
				if (this.model.isChromeless) {
					this.resizedDim.y = tempDims.y;
				} else {
					this.resizedDim.y = tempDims.y - (this.gutterSize * 2);
				}
				if(this.mediaObjectView.isLiquid) {
					this.resizedDim.x = tempDims.x;
				} else {
					this.resizedDim.x = (this.resizedDim.y - this.controllerOffset) * mediaAR;
				}
			}

			//console.log( 'final container: ' + this.containerDim.x+' '+this.containerDim.y+' '+this.resizedDim.x+' '+this.resizedDim.y);

			this.mediaScale = this.resizedDim.x / this.intrinsicDim.x;

			this.updateMargins();

		}

		/**
		 * Calculates and updates the media object's margins
		 */
		jQuery.MediaElementView.prototype.updateMargins = function() {

			switch (this.model.containerLayout) {

				case "horizontal":
				if (this.model.options.header == 'nav_bar') {
					this.mediaMargins.horz = (this.containerDim.x - this.resizedDim.x) * .5 + this.gutterSize;
				} else if (this.resizedDim.x < this.minContainerDim.x) {
					this.mediaMargins.horz = (this.minContainerDim.x - this.resizedDim.x) * .5 + this.gutterSize;
				} else {
					this.mediaMargins.horz = this.gutterSize;
				}
				if ((this.controllerOnly && (this.mediaContainer.closest('.slot').length == 0)) && (this.model.options.header != 'nav_bar'))  {
					this.mediaMargins.vert = Math.max(0, (this.containerDim.y - this.controllerHeight) * .5);
				} else {
					this.mediaMargins.vert = Math.max(0, (this.containerDim.y - this.resizedDim.y) * .5);
				}
				break;

				case "vertical":
				this.mediaMargins.horz = (this.containerDim.x - this.resizedDim.x) * .5;
				if (this.controllerOnly) {
					this.mediaMargins.vert = (Math.max(this.minContainerDim.y, this.controllerHeight + (this.gutterSize * 2)) - this.controllerHeight) * .5;
				} else if (this.resizedDim.y < this.minContainerDim.y) {
					this.mediaMargins.vert = (this.minContainerDim.y - this.resizedDim.y) * .5;
				} else {
					this.mediaMargins.vert = this.gutterSize;
				}
				break;

			}

			this.mediaMargins.horz = Math.round(this.mediaMargins.horz);

			var additive = 0;
			if (this.model.options.header == 'nav_bar') {
				additive = Math.max(0, this.gutterSize + Math.round(this.containerDim.x - (this.resizedDim.x+this.mediaMargins.horz+this.mediaMargins.horz))) - 3;
			} else {
				this.mediaMargins.horz--;
			}

			//console.log(this.model.path + ' margins '+this.mediaMargins.horz+' '+this.mediaMargins.vert);

			if ( !this.model.isChromeless ) {
				if ( this.model.mediaSource.name == "KML" ) { // exception for Google Maps, since padding just makes the map larger
					this.mediaContainer.find('.mediaObject').css('margin-left', Math.floor(this.mediaMargins.horz));
				} else {
					this.mediaContainer.find('.mediaObject').css('padding-left', Math.floor(this.mediaMargins.horz));
					this.mediaContainer.find('.mediaObject').css('padding-right', Math.floor(this.mediaMargins.horz + additive));
				}
			}
			if ( !this.model.isChromeless || ( this.model.options.vcenter === true )) {
				if ( this.model.mediaSource.name == "KML" ) { // exception for Google Maps, since padding just makes the map larger
					this.mediaContainer.find('.mediaObject').css('margin-top', Math.floor(this.mediaMargins.vert));
				} else {
					this.mediaContainer.find('.mediaObject').css('padding-top', Math.floor(this.mediaMargins.vert));
					this.mediaContainer.find('.mediaObject').css('padding-bottom', Math.floor(this.mediaMargins.vert));
				}
			}

	   		if (!this.annotationsVisible) {
	   			if (this.annotationDisplay) this.annotationDisplay.width( this.resizedDim.x + ( this.mediaMargins.horz * 2 ));
	   		} else {
	   			if (this.annotationDisplay) this.annotationDisplay.width(this.resizedDim.x + ( this.mediaMargins.horz * 2 ) + additive + 1 + this.annotationSidebar.width());
	   		}

		}

		/**
		 * Toggles the annotation viewer open and closed.
		 */
		jQuery.MediaElementView.prototype.toggleAnnotations = function() {
			this.annotationsVisible = !this.annotationsVisible;
			this.updateSidebarDisplay();
		}

		/**
		 * Makes adjustments to show/hide the sidebar.
		 */
		jQuery.MediaElementView.prototype.updateSidebarDisplay = function() {

			this.calculateContainerSize();
			this.layoutMediaObject();

			var player;
			if ( this.model.mediaSource.browserSupport[scalarapi.scalarBrowser] != null ) {
				player = this.model.mediaSource.browserSupport[scalarapi.scalarBrowser].player;
			}

			if (this.annotationsVisible) {
				if (this.model.options.header != 'nav_bar') {
					$(this.annotationLink).find('a').text('Hide Annotations');
				} else {
					// if we're in the maximize view and this is an image with annotations, then the image annotations need to be reset
					if ((this.model.mediaSource.contentType == 'image') && (player == 'native') && (this.mediaObjectView.annotations != null)) {
						this.mediaObjectView.setupAnnotations(this.mediaObjectView.annotations);
					}
				}
				if (this.model.containerLayout == "horizontal") {
					this.annotationSidebar.css('display','block');
					this.mediaContainer.css('float', 'right');
					if (this.mediaContainer.closest('.slot').length == 0) {
						if (this.controllerOnly || (this.model.options.header != 'nav_bar')) {
							this.containerDim.y = parseInt(this.model.options.height) - parseInt(this.header.height()) + 1;
						}
						if (model.options.width == null) this.mediaContainer.height(this.containerDim.y);
					}
				}
			} else {
				if (this.model.options.header != 'nav_bar') {
					$(this.annotationLink).find('a').text('Annotations');
				} else {
					// if we're in the maximize view and this is an image with annotations, then the image annotations need to be reset
					if ((this.model.mediaSource.contentType == 'image') && (player == 'native') && (this.mediaObjectView.annotations != null)) {
						this.mediaObjectView.setupAnnotations(this.mediaObjectView.annotations);
					}
				}
				if (this.model.containerLayout == "horizontal") {
					this.annotationSidebar.css('display','none');
					if (this.mediaContainer.closest('.slot').length == 0) {
						if (this.controllerOnly && (this.model.options.header != 'nav_bar')) {
		 					this.containerDim.y = Math.max(this.minContainerDim.y, this.controllerHeight + (this.gutterSize * 2));
							this.mediaContainer.removeAttr('height');
							this.mediaContainer.css('height', '');
						}
					}
				}
			}

			// update horizontal margins around media element
			if (!this.model.isChromeless) {
				var hMargin = Math.max(0, (this.initialContainerWidth - parseFloat(this.model.element.width())) * .5);
				this.model.element.css('margin-left', hMargin);
			}

			this.doInstantUpdate();

		}

		/**
		 * Removes the loading message.
		 */
		jQuery.MediaElementView.prototype.removeLoadingMessage = function() {
      if (this.mediaContainer.parent().parent().css('background-image') != 'none') {
        this.mediaContainer.parent().parent().css('background-image', 'none');
  			$('body').trigger('mediaElementMediaLoaded', [$(this.model.link)]);
      }
		}

		/**
		 * Begins playback of time-based media.
		 */
		jQuery.MediaElementView.prototype.play = function() {
			if ((this.model.mediaSource.contentType == 'video') || (this.model.mediaSource.contentType == 'audio') || (this.model.mediaSource.contentType == 'document')) {
				this.mediaObjectView.play();
 				this.overrideAutoSeek = false;
			}
		}

		/**
		 * Starts the timer.
		 *
		 * @param {Object} event				Object representing the play event.
		 * @param {Boolean} fireOnlyOnce		If true, the timer will fire only once.
		 */
		this.startTimer = function(event, fireOnlyOnce) {
			if (this.intervalId == null) {
				if (fireOnlyOnce) {
					setTimeout(function () {
						handleTimer();
						me.playingSeekAnnotation = false;
					}, 0);
					clearInterval(this.intervalId);
					this.intervalId = null;
				} else {
					this.intervalId = setInterval(handleTimer, 100);
				}
			}
		}

		/**
		 * Handles per-frame timer activity.
		 */
		function handleTimer() {

			var currentPosition = me.mediaObjectView.getCurrentTime();

			// if we've reached the end of the annotation we were directed to seek to, then
			// pause playback
			if (me.playingSeekAnnotation && (me.model.mediaSource.contentType != 'document') && (currentPosition > me.model.seekAnnotation.properties.end)) {
				me.playingSeekAnnotation = false;
				me.pause();
			}

			if (me.annotations) {

				var annotation;
				var scrollTop = null;
				var liveCount = 0;
				var annoTitle;
				var action = null;
				var chip;
				var startPosition;
				var endPosition;
				var newCurrentAnnotation;
				var i;
				var n = me.annotations.length;

				// loop through all the annotations
				for (i=0; i<n; i++) {
					annotation = me.annotations[i];
					startPosition = annotation.properties.start;
					endPosition = annotation.properties.end;

					//console.log( currentPosition + ' ' + startPosition + ' ' + endPosition );

					// if the annotation sidebar is showing,
					if (me.annotationSidebar.css('display') == 'block') {
						chip = me.annotationSidebar.find('div.annotationChip').eq(i);
						// if this annotation is active,
						if ((currentPosition >= (startPosition - .1)) && (currentPosition <= endPosition)) {
							liveCount++;

							// generate a display title for the annotation
							if (me.model.mediaSource.contentType == 'document') {
								annoTitle = 'Line '+currentPosition+'&nbsp;&nbsp;<strong>'+annotation.body.getDisplayTitle()+'</strong>';
							} else {
								annoTitle = scalarapi.decimalSecondsToHMMSS(me.getCurrentTime())+'&nbsp;&nbsp;<strong>'+annotation.body.getDisplayTitle()+'</strong>';
							}

							newCurrentAnnotation = annotation;

							// if we just arrived at this annotation, then set up highlighting
							if (!chip.hasClass('selectedAnnotation')) {
								action = 'fadeIn';
								chip.addClass('selectedAnnotation');
								if (me.annotationsVisible) {
									if (scrollTop == null) scrollTop = chip.position().top + me.annotationSidebar.scrollTop() - 30;
								}
							}

							if (annotation == me.model.seekAnnotation) {
								me.playingSeekAnnotation = true;
							}

						// if this annotation is inactive, turn off any highlighting
						} else {
							if (chip.hasClass('selectedAnnotation')) {
								if (action == null) action = 'fadeOut';
								chip.removeClass('selectedAnnotation');
							}
						}

					// if the annotation sidebar is hidden,
					} else {

						// if this annotation is active, set up highlighting
						if ((currentPosition >= (startPosition - .1)) && (currentPosition <= endPosition)) {
							liveCount++;

							// generate a display title for the annotation
							if (me.model.mediaSource.contentType == 'document') {
								annoTitle = 'Line '+currentPosition+'&nbsp;&nbsp;<strong>'+annotation.body.getDisplayTitle()+'</strong>';
							} else {
								annoTitle = scalarapi.decimalSecondsToHMMSS(me.getCurrentTime())+'&nbsp;&nbsp;<strong>'+annotation.body.getDisplayTitle()+'</strong>';
							}

							newCurrentAnnotation = annotation;
							action = 'fadeIn';
							if (annotation == me.model.seekAnnotation) {
								me.playingSeekAnnotation = true;
							}

						// otherwise, turn off highlighting
						} else {
							if (action == null) action = 'fadeOut';
						}
					}
				}

				//console.log( "liveCount: " + liveCount );

				if (me.annotationDisplay) {

					// annotation highlight bar behavior
					switch (action) {

						case 'fadeIn':
						me.annotationDisplay.fadeIn();
						break;

						case 'fadeOut':
						if ((liveCount == 0) && (me.annotationDisplay.find('.annoSeekMessage').length == 0)) {
							me.annotationDisplay.fadeOut();
							if (me.model.mediaSource.contentType == 'document') {
								$('body').trigger('hide_annotation', [this.currentAnnotation, me]); // Added by Craig for Live Annotations
							}
						}
						break;

					}

					if (liveCount > 0) {
						if (!me.annotationTimerRunning) {
							me.annotationDisplay.html('<p>'+annoTitle+'</p>');
						}
						// don't show live annotations if we're in the annotation editor
						if ((document.location.href.indexOf('.annotation_editor')==-1) && ('nav_bar' != me.model.options.header)) {
							if ((me.model.mediaSource.name == 'Vimeo') || (me.model.mediaSource.name == 'SoundCloud')) {
								// this prevents media generated from linked annotations from displaying
								// their live annotation when cueing up on page load
								if ((me.mediaObjectView.initialPauseDone) && (me.intervalId != null)) {
									$('body').trigger('show_annotation', [newCurrentAnnotation, me]); // show live annotation
								}
							} else {
								$('body').trigger('show_annotation', [newCurrentAnnotation, me]); // show live annotation
							}
						}
					}

					if ((scrollTop != null) && (me.annotationsVisible)) me.annotationSidebar.animate({scrollTop:scrollTop}, 500);

				} else if (me.model.isChromeless) {
					if (liveCount > 0) {
						$('body').trigger('show_annotation', [newCurrentAnnotation, me]); // show live annotation
						if (this.currentAnnotation != null) {
							if (newCurrentAnnotation.body.url != this.currentAnnotation.body.url) {
								$('body').trigger('hide_annotation', [this.currentAnnotation, me]);
							}
						}
					} else {
						$('body').trigger('hide_annotation', [this.currentAnnotation, me]);
					}
				}
			}

			if (liveCount == 0) {
				this.currentAnnotation = null;
			} else {
				this.currentAnnotation = newCurrentAnnotation;
			}

		}

		/**
		 * Ends the timer.
		 */
		jQuery.MediaElementView.prototype.endTimer = function() {
			if (this.intervalId != null) {
				clearInterval(this.intervalId);
				this.intervalId = null;
			}
		}

		/**
		 * Pauses playback of time-based media.
		 */
		jQuery.MediaElementView.prototype.pause = function() {
			if ((this.model.mediaSource.contentType == 'audio') || (this.model.mediaSource.contentType == 'video') || (this.model.mediaSource.contentType == 'document')) {
				this.mediaObjectView.pause();
			}
		}

		/**
		 * Seeks to a given time position within a piece of time-based media.
		 *
		 * @param {Object} annotation			The annotation to seek to.
		 */
		this.seek = function(annotation) {

 			switch (this.model.mediaSource.contentType) {

 				case 'audio':
 				case 'video':
 				case 'document':
 				this.model.seekAnnotation = annotation;
 				this.playingSeekAnnotation = true;
 				if (this.annotationDisplay) {
	 				this.annotationDisplay.html('<p class="annoSeekMessage">Seeking to '+annotation.startString+'&hellip;</p>');
	 				this.annotationDisplay.fadeIn();
 				}
 				if (!this.annotationTimerRunning) {

 					var delay = 3000;

 					// if the user clicked on an annotation chip, then they're expecting the clip to play asap,
 					// so schedule our first check sooner than normal
					if (this.cachedPlayCommand) {
						delay = 1000;
					}
					this.annotationTimer = setTimeout(checkSeekSuccessful, delay);
					this.annotationTimerRunning = true;
 				}
 				this.overrideAutoSeek = true;
 				this.mediaObjectView.seek(annotation.properties.start, annotation.properties.end);
 				this.lastSeekTime = annotation.properties.start;
				handleTimer();
 				break;

 				case '3D':
 				this.mediaObjectView.seek(annotation.properties);
 				if (me.model.isChromeless || ('nav_bar' != me.model.options.header)) {
 					$('body').trigger('show_annotation', [annotation, me]);
 				}
 				break;

 				case 'image':
 				this.showSpatialAnnotation(annotation);
 				break;

 			}

		}

		/**
		 * Shows the specified spatial annotation.
		 *
		 * @param {Object} annotation 		The spatial annotation to be shown.
		 */
		this.showSpatialAnnotation = function(annotation) {
			if(typeof imagesWithAnnotations[me.model.filename + '-' + this.mediaObjectView.model.id + '-' + annotation.id] != 'undefined'){
				anno.highlightAnnotation( imagesWithAnnotations[me.model.filename + '-' + this.mediaObjectView.model.id + '-' + annotation.id] );
			}else{
				anno.highlightAnnotation( annotation.data );
			}

			if (me.model.isChromeless || ('nav_bar' != me.model.options.header)) {
				$('body').trigger('show_annotation', [annotation, me]);
			}
		}

		/**
		 * Checks to see if the last attempted seek has succeeded; if not, tries to seek there again.
		 * @return		Returns true if the seek was successful.
		 */
		 function checkSeekSuccessful() {

		 	//console.log('check to see if seek successful: '+me.lastSeekTime+' '+me.mediaObjectView.getCurrentTime());

		 	var result = false;

			if ( me.annotationDisplay || me.model.isChromeless ) {

				// we're not yet in range; seek must have failed
				if ((me.lastSeekTime - me.mediaObjectView.getCurrentTime()) > 5) {
					me.mediaObjectView.seek(me.lastSeekTime);
					me.annotationTimer = setTimeout(checkSeekSuccessful, 3000);
					me.seekAttemptCount++;

					//console.log('not yet in range, making attempt #'+me.seekAttemptCount);

				// we are in range; stop seeking and hide the 'attempting' message if visible
				} else {
					if ( !me.model.isChromeless ) {
						if ((me.annotationDisplay.text().indexOf('Seeking') != -1) && !me.cachedPlayCommand && !me.mediaObjectView.isPlaying() ) {
							me.annotationDisplay.fadeOut();
						}
					}
					me.annotationTimerRunning = false;
					//console.log( "seek successful" );
					// if we know the user intends for the clip to start playing, do so
					if ( me.cachedPlayCommand || me.model.options.autoplay ) {
						me.play();
					}
					result = true;
				}
			}

			return result;
		}

		/**
		 * Returns true if time-based media is currently playing.
		 * @return	Returns true if the media is playing.
		 */
		jQuery.MediaElementView.prototype.isPlaying = function() {
			return this.mediaObjectView.isPlaying();
		}

		/**
		 * For time-based media, returns the current playback time.
		 * @return	Returns the current playback time for temporal media in seconds.
		 */
		this.getCurrentTime = function() {
			if ((this.model.mediaSource.contentType == 'audio') || (this.model.mediaSource.contentType == 'video') || (this.model.mediaSource.contentType == 'document')) {
				return this.mediaObjectView.getCurrentTime();
			} else {
				return null;
			}
		}

    this.getPosition3D = function() {
      if (this.model.mediaSource.contentType == '3D') {
				return this.mediaObjectView.getPosition3D();
			} else {
				return null;
			}
    }

    this.handleAnnotationsUpdated = function() {
      if (this.model.mediaSource.contentType == '3D') {
				return this.mediaObjectView.handleAnnotationsUpdated();
			} else {
				return null;
			}
    }

		jQuery.MediaElementView.prototype.updateAnnotations = function( annotations ) {
			this.annotations = annotations;
		}

		/**
		 * Parses annotation data and adds it to the view.
		 */
		jQuery.MediaElementView.prototype.parseAnnotations = function() {

			this.annotations = [];
			var annotation;
			var annoType;
			var data;
			var index;
			var coordinate;

			this.annotations = this.model.node.getRelations('annotation', 'incoming');

			var annotationWhiteList = $(this.link).data('annotations');
			if($(this.link).is('[data-annotations]') || annotationWhiteList){
				if(!annotationWhiteList){
					annotationWhiteList = [];
				} else if (typeof annotationWhiteList === "string") {
					annotationWhiteList = annotationWhiteList.split(",");
				} else if (typeof annotationWhiteList === "number") {
          annotationWhiteList = [annotationWhiteList.toString()];
        }
				var temp_annotations = [];
				for(var i = 0; i < this.annotations.length; i++){
					if(annotationWhiteList.indexOf(this.annotations[i].body.slug)!=-1){
						temp_annotations.push(this.annotations[i]);
					}
				}
				this.annotations = temp_annotations;
			}


			/*if ( this.annotationSidebar ) {
				if (this.model.options.header != 'nav_bar') {
					this.annotationSidebar.empty();
				}
			}*/

			// if this instance was passed an initial seek value, then keep track
			// of the annotation it was directed to seek to
			var i;
			var n = this.annotations.length;
			var annotation;
			for (i=0; i<n; i++) {
				annotation = this.annotations[i];
				if (annotation.body.url == this.model.seek) {
					this.model.initialSeekAnnotation = this.model.seekAnnotation = annotation;
				}
			}

			if ((this.model.mediaSource.contentType == 'document') && !(this.model.mediaSource.name == 'SourceCode' || scalarapi.getQueryVars( this.model.path ).lang != null) && this.mediaObjectView.hasFrameLoaded) {
				this.mediaObjectView.highlightAnnotatedLines();
			}

			// sort annotations based on index data
			this.annotations.sort(function (a, b) {
				if (a.index < b.index) {
					return -1;
				} else if (a.index == b.index) {
					return 0;
				} else {
					return 1;
				}
			});

			var htmlString = '';
			var startTime;
			var endTime;
			var title;
			switch (this.model.containerLayout) {

				// build HTML for annotations in horizontal layout
				case "horizontal":
				if (this.annotations.length > 0) {
					if (this.header != null) {
						this.header.find('p.mediaElementAlignLeft').css('width', '79%'); // make room for the annotation link
					}
					if (this.annotationSidebar) {
						this.annotationSidebar.find('div.annotationChip:first').remove();
					}
				}
				var annotationChip;
				var extents;
				var stripeType;

				var i;
				var n = this.annotations.length;
				for (i=0; i<n; i++) {
					var local_me = me;
					var annotation = this.annotations[i];
					((i % 2) == 0) ? stripeType = 'light' : stripeType = 'dark';
					annotationChip =  $('<div class="annotationChip '+stripeType+'"></div>');
					switch (this.model.mediaSource.contentType) {

						case 'audio':
						case 'video':
						extents = $('<p class="annotationExtents"></p>');
						var link;
						link = $('<a href="javascript:;">'+annotation.startString+annotation.separator+annotation.endString+'</a>').appendTo(extents);

						// Seek on the view
						annotationChip.data('annotation', annotation);
						annotationChip.data('me', this.controller.view);
						annotationChip.on('click',  function() {
							var $me = $(this).data('me');
							// don't cache the play command for YouTube videos since they play automatically on seeking anyway
							if ( local_me.model.mediaSource.name != "YouTube" ) {
								$me.cachedPlayCommand = true;
							}
							$me.seek($(this).data('annotation'));
              				setTimeout(function() {
								$me.play();
              				},250);
						});

						annotationChip.append('<p class="annotationTitle"><strong>'+annotation.body.getDisplayTitle()+'</strong></p>');
						annotationChip.append(extents);


						break;

						case 'image':
						annotationChip.append('<p class="annotationTitle"><strong>'+annotation.body.getDisplayTitle()+'</strong></p>');
						annotationChip.append('<p class="annotationExtents"><a href="javascript:;">'+annotation.startString+annotation.separator+annotation.endString+'</a></p>');
						annotationChip.data('annotation', annotation);
						annotationChip.data('me', this.controller.view);
						annotationChip.on('click',  function() {
							$(this).data('me').cachedPlayCommand = true;
							$(this).data('me').seek($(this).data('annotation'));
							// don't show live annotations if we're in the annotation editor or the maximize view
							if (document.location.href.indexOf('.annotation_editor') && ($(this).data('me').model.options.header != 'nav_bar')) {
								$('body').trigger('show_annotation', [$(this).data('annotation'), $(this).data('me')]);
							}
						});
						break;

						case 'document':
						extents = $('<p class="annotationExtents"></p>');
						var link = $('<a href="javascript:;">'+annotation.startString+annotation.separator+annotation.endString+'</a>').appendTo(extents);

						// Seek on the view
						annotationChip.data('annotation', annotation);
						annotationChip.data('me', this.controller.view);
						annotationChip.on('click',  function(e) {
							$(this).data('me').model.seekAnnotation = null;
							$(this).data('me').seek($(this).data('annotation'));
							$(this).data('me').play();
						});

						annotationChip.append(extents);
						annotationChip.append('<p class="annotationTitle"><strong>'+annotation.body.getDisplayTitle()+'</strong></p>');
						break;

					}

					var annoText = $('<span class="annotationDescription"></span>');

					// if the annotation has a description, then show it
					if (annotation.body.current.description != null) {
						annoText.append('<i>'+annotation.body.current.description+'</i>');
					}

					// if the annotation has content, then show it
					if (annotation.body.current.content && annotation.body.current.content.length > 0) {
						if (annotation.body.current.description != null) annoText.append('<br />');
						var the_content = annotation.body.current.content;
						var num_words = 35; // Magic number
						if ('function' == typeof(window['create_excerpt'])) the_content = create_excerpt(the_content,num_words);
						annoText.append(the_content);
					}

					// Permalink
					annoText.append('<br /><a href="'+annotation.body.url+'" style="white-space:nowrap;">Permalink &raquo;</a>');

					annotationChip.append(annoText);

					if (this.annotationSidebar) {
						this.annotationSidebar.append(annotationChip);
					}
				}
				break;

				case "vertical":
				if (this.annotations.length > 0) {
					var annoText;
					if (this.annotations.length == 1) {
						annoText = this.annotations.length+' annotation';
					} else {
						annoText = this.annotations.length+' annotations';
					}
					if (this.footer) {
						this.footer.find('p.mediaElementAlignLeft').text(annoText);
					}
				}
				break;

			}

			var playerIsNative = false;
			if ( this.model.mediaSource.browserSupport[scalarapi.scalarBrowser] != null ) {
				if ( this.model.mediaSource.browserSupport[scalarapi.scalarBrowser].player == 'native' ) {
					playerIsNative = true;
				}
			}

			// show image annotations if there are any
			if ((this.model.mediaSource.contentType == 'image') && playerIsNative && (this.annotations.length > 0)) {
				this.mediaObjectView.setupAnnotations(this.annotations);
			}

			// if we were passed an annotation to seek to, wait a while before attempting to seek
			// (if YouTube, then don't try to seek if we're not on Mobile Safari, since we'll set player
			// params to seek instead)
			if (this.model.seekAnnotation != null) {
 				if (this.annotationDisplay && (this.model.mediaSource.contentType != 'image')) {
	 				this.annotationDisplay.html('<p class="annoSeekMessage">Seeking to '+this.model.seekAnnotation.startString+'&hellip;</p>');
	 				this.annotationDisplay.fadeIn();
 				}
  				if ( ( this.model.mediaSource.contentType != 'image' ) && ( this.model.mediaSource.contentType != 'document' ) ) {
 					setTimeout( $.proxy(function(me){this.doAutoSeek(this);},this), 6000 );
				} else if(!this.model.mediaSource.contentType == 'document' || !(this.model.mediaSource.name == 'SourceCode' || scalarapi.getQueryVars( this.model.path ).lang != null)){
 					setTimeout( $.proxy(function(me){this.doAutoSeek(this);},this), 3000 );
				}
			}

			if ('nav_bar' == this.model.options.header) {
				if (this.annotationSidebar) {
					var $chips = this.annotationSidebar.find('.annotationChip').hide();
				}
			}

		}

		/**
		 * Seeks to the annotation that was passed into the mediaelement instance.
		 */
		this.doAutoSeek = function(me) {
			me.seek(this.model.seekAnnotation);
      this.sendMessage(this.annotationHasMessage(this.model.seekAnnotation));
			// YouTube videos will play immediately on seeking unless we do this
			if ( this.model.mediaSource.name == 'YouTube' ) {
				me.pause();
			}
		}

    this.sendMessage = function(message) {
      if (this.mediaObjectView.sendMessage) {
        this.mediaObjectView.sendMessage(message);
      }
    }

    this.annotationHasMessage = function(annotation) {
      let result = false;
      if (annotation.body.current.properties['http://purl.org/dc/terms/abstract']) {
        result = annotation.body.current.properties['http://purl.org/dc/terms/abstract'][0].value;
      }
      return result;
    }

		this.doInstantUpdate = function() {
			me.startTimer(null, true);
		}

	}

	/**
	 * View for the image player.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.ImageObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.hasLoaded = false;					// has the image loaded?
		this.annotations = null;				// annotations for the image
		this.annotatedImage = null;				// annotated image object

		/**
		 * Creates the image media object.
		 */
 		jQuery.ImageObjectView.prototype.createObject = function() {

			this.wrapper = $('<div class="mediaObject"></div>');
			this.image = new Image();
			if (this.model.node.current.description != undefined) {
				this.image.alt = this.model.node.current.description.replace(/([^"\\]*(?:\\.[^"\\]*)*)"/g, '$1\\"');
			} else {
				this.image.alt = '';
			}
			$(this.image).appendTo(this.wrapper);
			$(this.image).css('display', 'none');
			$(this.wrapper).appendTo(this.parentView.mediaContainer);

			var url = this.model.path;
			var queryVars = scalarapi.getQueryVars( document.location.href );
			if ( queryVars.t != null ) {
				url += '?t=' + new Date().getTime();
			}

			// special case some URL elements
			if (-1!=url.indexOf('http://cubantheater.org')) url = url.replace('http://cubantheater.org','http://ctda.library.miami.edu');

			$(this.image).attr({
				'src': url,
				'data-original': url + '-' + this.model.id // needed to support annotorious if the same image appears on the page more than once
			});

			$(this.image).on('load', function() {
				if ('undefined' != typeof(me.model.node.current.properties["http://ns.google.com/photos/1.0/panorama/stitchingsoftware"])) {  // Test for 360 image
					me.parentView.mediaContainer.empty();
					me.parentView.mediaObjectView = new $.I360ObjectView(model, parentView);
					me.parentView.mediaObjectView.annotations = me.annotations;
					me.parentView.mediaObjectView.createObject();
					return;
				}
				me.doImageSetup(this);
			});

    	}

    	jQuery.ImageObjectView.prototype.doImageSetup = function(image) {
 			this.hasLoaded = true;
			this.parentView.intrinsicDim.x = image.width;
			this.parentView.intrinsicDim.y = image.height;
			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

			// Make visible
			$(image).hide().fadeIn();

			if (this.annotations != null) {
				this.setupAnnotations(this.annotations);
			}
    	}

		/**
		 * Sets up the image's annotations
		 *
		 * @param {Array} annotations		The annotations to be added to the image.
		 */
 		jQuery.ImageObjectView.prototype.setupAnnotations = function(annotations) {

  			if (!this.hasLoaded) {
 				this.annotations = annotations;

 			} else {

	 			var i, annotation, x, y, width, height,
	 				notes = [],
	 				n = annotations.length;

	 			// first time setup
	 			if ( anno.getAnnotations( this.image.src + '-' + this.model.id ).length == 0 ) {
	 				// if the image is in a carousel, temporarily show it so we can attach annotations to ti
	 				var isAlreadyActive = $(this.image).closest('.item').hasClass('active');
	 				if (!isAlreadyActive) {
	 					$(this.image).closest('.item').addClass('active');
	 				}
					anno.makeAnnotatable( this.image );
					anno.hideSelectionWidget( this.image.src + '-' + this.model.id );
					anno.setProperties( { hi_stroke: "#3acad9" } );
					// if the image is in a carousel, return it to its original state
					if (!isAlreadyActive) {
						$(this.image).closest('.item').removeClass('active');
					}

				// reload
	 			} else {
	 				anno.removeAll( this.image.src );
	 			}

				var editable = ( document.location.href.indexOf( '.annotation_editor' ) != -1 );

	 			for (i=0; i<n; i++) {

	 				annotation = annotations[i];

					// parse dimensions of the annotation

					if (annotation.properties.x.charAt(annotation.properties.x.length - 1) == '%') {
						x = (parseFloat(annotation.properties.x.substr(0, annotation.properties.x.length - 1)) * .01) * this.parentView.mediaScale;
						x *= this.parentView.intrinsicDim.x;
					} else {
						x = parseFloat(annotation.properties.x) * this.parentView.mediaScale;
					}

					if (annotation.properties.y.charAt(annotation.properties.y.length - 1) == '%') {
						y = (parseFloat(annotation.properties.y.substr(0, annotation.properties.y.length - 1)) * .01) * this.parentView.mediaScale;
						y *= this.parentView.intrinsicDim.y;
					} else {
						y = parseFloat(annotation.properties.y) * this.parentView.mediaScale;
					}

					if (annotation.properties.width.charAt(annotation.properties.width.length - 1) == '%') {
						width = (parseFloat(annotation.properties.width.substr(0, annotation.properties.width.length - 1)) * .01) * this.parentView.mediaScale;
						width *= this.parentView.intrinsicDim.x;
					} else {
						width = parseFloat(annotation.properties.width) * this.parentView.mediaScale;
					}

					if (annotation.properties.height.charAt(annotation.properties.height.length - 1) == '%') {
						height = (parseFloat(annotation.properties.height.substr(0, annotation.properties.height.length - 1)) * .01) * this.parentView.mediaScale;
						height *= this.parentView.intrinsicDim.y;
					} else {
						height = parseFloat(annotation.properties.height) * this.parentView.mediaScale;
					}

					var annotationIsMediaType = false;
					if(typeof annotation.body != undefined){
						annotationIsMediaType = typeof annotation.body.scalarTypes.media !== 'undefined';
					};

					$el = $(this.model.element[0]);

					var annodata = {
						src: this.image.src + '-' + this.model.id,
						text: '<div class="image-annotation-wrapper"><a data-src="'+this.image.src + '-' + this.model.id+'" href="' + annotation.body.url + '"><b>' + annotation.body.getDisplayTitle() + "</b></a> " + (( annotation.body.current.content != null ) ? annotation.body.current.content+"</div>" : "</div>" ),
						editable: editable,
						shapes: [{
							type: "rect",
							units: "pixel",
							geometry: { x: x, y: y, width: width, height: height }
						}],
						isMedia : annotationIsMediaType,
						element : this.model.element[0]
					};

					$el.attr('id',this.model.filename + '-' + this.model.id);

					var currentData = {};
					if($el.data('annotations') != undefined){
						var currentData = $el.data('annotations');
					}

					annotation.data = annodata;
					currentData[annotation.id] = annodata;

					imagesWithAnnotations[this.model.filename + '-' + this.model.id + '-' + annotation.id] = annodata;

					$el.data('annotations',currentData);

					anno.addAnnotation( annotation.data );

	 			}

	 			$(".annotorious-popup").on('click', function(e) {
					e.stopPropagation();
					return true;
				}).css('z-index',999);

	 			$(this.wrapper).find( ".annotorious-popup-text" ).addClass( "caption_font" );

 			}

 		}

		// These functions are basically irrelevant for images
		jQuery.ImageObjectView.prototype.play = function() { }
		jQuery.ImageObjectView.prototype.pause = function() { }
		jQuery.ImageObjectView.prototype.seek = function(time) { }
		jQuery.ImageObjectView.prototype.getCurrentTime = function() { return null; }
		jQuery.ImageObjectView.prototype.isPlaying = function() { return true; } // we depend on images returning true here to handle annotation cueing

		/**
		 * Resizes the image to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the image.
		 * @param {Number} height		The new height of the image.
		 */
		jQuery.ImageObjectView.prototype.resize = function(width, height) {
			if ((this.model.containerLayout == 'horizontal') && (this.model.options.width != null)) {
				/*if ((width < this.model.options.width) && (width > (1040 - 144))) {
					var scaleFactor = (1040 - 144) / width;
					width *= scaleFactor;
					height *= scaleFactor;
				}*/

			}
			$(this.image).parent().width(width+'px');
			$(this.image).parent().height(height+'px');
			if (this.hasLoaded) {
				$(this.image).closest( '.mediaObject' ).width( '' );
				$(this.image).closest( '.mediaObject' ).height( '' );
				$(this.image).width(width+'px');
				$(this.image).height(height+'px');
			}
		}


	} // !image

	/**
	 * View for 360 images, using Google's vrview.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.I360ObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.hasLoaded = false;					// has the image loaded?
		this.annotations = null;				// vrview hotspots
		this.annotatedImage = null;				// hotspotted image object

		/**
		 * Creates the 360 media object.
		 */
 		jQuery.I360ObjectView.prototype.createObject = function() {

 			this.hasLoaded = true;
			//this.parentView.intrinsicDim.x = 6000;
			//this.parentView.intrinsicDim.y = 3000;
			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

 			if ('undefined' == typeof(vrviews)) vrviews = 0;  // Global
 			var my_vrview = parseInt(vrviews);
 			vrviews++;
			this.wrapper = $('<div class="mediaObject" id="vrview_'+my_vrview+'" style="width:100%;height:100%;"></div>');
			$(this.wrapper).appendTo(this.parentView.mediaContainer);

			var url = this.model.path;
			var path = $('link#approot').attr('href')+'views/widgets/vrview/build/';
			var obj = {
				image: url,
				script_path: path
			};
		    $.getScript( path+'vrview.js' , function() {
		    	var vrView = new VRView.Player('#vrview_'+my_vrview, obj);
		    	$('#vrview_'+my_vrview).find('iframe').css('width','100%').css('height','100%');
		    	vrView.on('ready', function(){
					if (me.annotations != null) {
						me.setupAnnotations(vrView, me.annotations);
					}
		    	});
		    });

    	}

		/**
		 * Sets up the image's annotations
		 *
		 * @param {Array} annotations		The annotations to be added to the image.
		 */
 		jQuery.I360ObjectView.prototype.setupAnnotations = function(vrView, annotations) {

	 		for (i=0; i<annotations.length; i++) {

	 			annotation = annotations[i];
	 			console.log(annotation);
	 			var x;
	 			var y;
	 			var width;
	 			var height;

				if (annotation.properties.x.charAt(annotation.properties.x.length - 1) == '%') {
					x = (parseFloat(annotation.properties.x.substr(0, annotation.properties.x.length - 1)) * .01) * this.parentView.mediaScale;
					x *= this.parentView.intrinsicDim.x;
				} else {
					x = parseFloat(annotation.properties.x) * this.parentView.mediaScale;
				}

				if (annotation.properties.y.charAt(annotation.properties.y.length - 1) == '%') {
					y = (parseFloat(annotation.properties.y.substr(0, annotation.properties.y.length - 1)) * .01) * this.parentView.mediaScale;
					y *= this.parentView.intrinsicDim.y;
				} else {
					y = parseFloat(annotation.properties.y) * this.parentView.mediaScale;
				}
				if (annotation.properties.width.charAt(annotation.properties.width.length - 1) == '%') {
					width = (parseFloat(annotation.properties.width.substr(0, annotation.properties.width.length - 1)) * .01) * this.parentView.mediaScale;
					width *= this.parentView.intrinsicDim.x;
				} else {
					width = parseFloat(annotation.properties.width) * this.parentView.mediaScale;
				}

				if (annotation.properties.height.charAt(annotation.properties.height.length - 1) == '%') {
					height = (parseFloat(annotation.properties.height.substr(0, annotation.properties.height.length - 1)) * .01) * this.parentView.mediaScale;
					height *= this.parentView.intrinsicDim.y;
				} else {
					height = parseFloat(annotation.properties.height) * this.parentView.mediaScale;
				}

	 			vrView.addHotspot('dining-room', {
	 				pitch: -60, // In degrees. Up is positive.
	 				yaw: 90, // In degrees. To the right is positive.
	 				radius: 0.5, // Radius of the circular target in meters.
	 				distance: 10 // Distance of target from camera in meters.
	 			});

	 		}

 		}

		/**
		 * Resizes the vrview wrapper (in this case, ".mediaContainer" since vrview loads asyncronously) to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the area.
		 * @param {Number} height		The new height of the area.
		 */
		jQuery.I360ObjectView.prototype.resize = function(width, height) {
			if (width > 500) height = width * 0.75;  // Artificially restrict the height
			if (height > 400) height = 400;  // Artificially cap the height
			$(me.parentView.mediaContainer).width(width+'px');
			$(me.parentView.mediaContainer).height(height+'px');
		}

		jQuery.I360ObjectView.prototype.play = function() { }
		jQuery.I360ObjectView.prototype.pause = function() { }
		jQuery.I360ObjectView.prototype.seek = function(time) { }
		jQuery.I360ObjectView.prototype.getCurrentTime = function() { return null; }
		jQuery.I360ObjectView.prototype.isPlaying = function() { return true; }

	}  // !360

	/**
	 * View for the QuickTime player.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.QuickTimeObjectView = function(model, parentView) {

		var me = this;

		this.model = model;					// instance of the model
		this.parentView = parentView;		// primary view for the media element

		/**
		 * Creates the video media object.
		 */
		jQuery.QuickTimeObjectView.prototype.createObject = function() {

			if ('undefined'==typeof(QT_GenerateOBJECTText_XHTML)) return;

			var showController = 'True';
			if (this.model.mediaSource.contentType == 'image') {
				showController = 'False';
			}

		    var movie = QT_GenerateOBJECTText_XHTML(
		    	this.model.path, '100%', '100%', '',
		    	"obj#id", this.model.filename+'_object'+this.model.id,
		    	"emb#id", this.model.filename+'_embed'+this.model.id,
		    	'postdomevents', 'True',
		    	"emb#NAME", this.model.filename+'_object'+this.model.id,
		    	'EnableJavaScript', 'True',
		    	'AUTOPLAY', this.model.options.autoplay,
		    	'CONTROLLER', showController,
		    	'SCALE', 'Aspect'
		    );
		    var $theHTML = $('<div class="mediaObject">'+movie+'</div>');
			this.parentView.mediaContainer.html($theHTML);

			if (this.model.mediaSource.contentType == 'audio') {
				this.parentView.controllerOffset = 23;
			} else {
				this.parentView.controllerOffset = 15;
			}

			this.metadataFunc = function() {

				if (!me.hasReceivedMetadata) {

					me.hasReceivedMetadata = true;

					var video = document.getElementById(me.model.filename+'_embed'+me.model.id);
					var dimensions = video.GetRectangle();
					var temp = dimensions.split(',');
					var h = Number(temp[3]);
					var w = Number(temp[2]);

					me.parentView.intrinsicDim.x = Number(temp[2]);
					me.parentView.intrinsicDim.y = Number(temp[3]);

					me.parentView.layoutMediaObject();
					me.parentView.removeLoadingMessage();

				}

			}

			var video = $theHTML.children()[0];
			if (document.addEventListener) {
				video.addEventListener('qt_play', me.parentView.startTimer, false);
				video.addEventListener('qt_pause', me.parentView.endTimer, false);
				video.addEventListener('qt_ended', me.parentView.endTimer, false);
				video.addEventListener('qt_loadedmetadata', this.metadataFunc, false);
			} else {
				video.attachEvent('onqt_play', me.parentView.startTimer);
				video.attachEvent('onqt_pause', me.parentView.endTimer);
				video.attachEvent('onqt_ended', me.parentView.endTimer);
				video.attachEvent('onqt_loadedmetadata', this.metadataFunc);
			}
			return;
		}

		/**
		 * Starts playback of the QuickTime movie.
		 */
		jQuery.QuickTimeObjectView.prototype.play = function() {
			var video = document.getElementById(this.model.filename+'_embed'+this.model.id);
			if (video && this.hasReceivedMetadata) {
				if ((this.model.seekAnnotation != null) && (!this.parentView.overrideAutoSeek)) {
					video.SetTime(this.model.seekAnnotation.properties.start * video.GetTimeScale());
				}
				if (video.GetRate() == 0) {
					video.Play();
				}
			}
		}

		/**
		 * Pauses playback of the QuickTime movie.
		 */
		jQuery.QuickTimeObjectView.prototype.pause = function() {
			var video = document.getElementById(this.model.filename+'_embed'+this.model.id);
			if (video && this.hasReceivedMetadata) video.Stop();
		}

		/**
		 * Seeks to the specified location in the QuickTime movie.
		 *
		 * @param {Number} time			Seek location in seconds.
		 */
		jQuery.QuickTimeObjectView.prototype.seek = function(time) {
			var video = document.getElementById(this.model.filename+'_embed'+this.model.id);
			if (video && this.hasReceivedMetadata) video.SetTime(time * video.GetTimeScale());
		}

		/**
		 * Returns the current playback position of the QuickTime movie.
		 * @return	The current playback position in seconds.
		 */
		jQuery.QuickTimeObjectView.prototype.getCurrentTime = function() {
			var video = document.getElementById(this.model.filename+'_embed'+this.model.id);
			if (video && this.hasReceivedMetadata) {
				return (video.GetTime() / video.GetTimeScale());
			} else {
				return 0;
			}
		}

		/**
		 * Resizes the QuickTime movie to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the video.
		 * @param {Number} height		The new height of the video.
		 */
		jQuery.QuickTimeObjectView.prototype.resize = function(width, height) {
			var video = document.getElementById(this.model.filename+'_embed'+this.model.id);
			var parent = $(video).parent().parent();
			parent.width(Math.round(width));
			parent.height(Math.round(height));
		}

		/**
		 * Returns true if the QuickTime video is currently playing.
		 * @return	Returns true if the video is playing.
		 */
		jQuery.QuickTimeObjectView.prototype.isPlaying = function() {
			result = false;
			var video = document.getElementById(this.model.filename+'_embed'+this.model.id);
			if (video && this.hasReceivedMetadata) {
				return (video.GetRate() != 0);
			}
			return result;
		}

	}

	/**
	 * View for the streaming QuickTime player.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.StreamingQuickTimeObjectView = function(model, parentView) {

		var me = this;

		this.model = model;					// instance of the model
		this.parentView = parentView;		// primary view for the media element

		/**
		 * Creates the video media object.
		 */
		jQuery.StreamingQuickTimeObjectView.prototype.createObject = function() {

			if ('undefined'==typeof(QT_GenerateOBJECTText_XHTML)) return;

			var segments = this.model.base_dir.split('/');
			segments.pop();
			segments.pop();
			appDir = segments.join('/');

		    var movie = QT_GenerateOBJECTText_XHTML(
		    	this.model.path, '100%', '100%', '',
		    	"obj#id", this.model.filename+'_object'+this.model.id,
		    	"emb#id", this.model.filename+'_embed'+this.model.id,
		    	'postdomevents', 'True',
		    	"emb#NAME", this.model.filename+'_object'+this.model.id,
		    	'EnableJavaScript', 'True',
		    	'SCALE', 'Aspect',
		    	'AUTOPLAY', this.model.options.autoplay,
		    	'TYPE', 'video/quicktime',
		    	'CACHE', 'False'
		    );
		    var $theHTML = $('<div class="mediaObject">'+movie+'</div>');
			this.parentView.mediaContainer.html($theHTML);

			this.metadataFunc = function() {
				if (!me.hasReceivedMetadata) {
					me.hasReceivedMetadata = true;
					me.resizeMovie();
				}
			}

			var video = $theHTML.children()[0];
			if (document.addEventListener) {
				video.addEventListener('qt_play', me.parentView.startTimer, false);
				video.addEventListener('qt_pause', me.parentView.endTimer, false);
				video.addEventListener('qt_ended', me.parentView.endTimer, false);
				video.addEventListener('qt_loadedmetadata', this.metadataFunc, false);
			} else {
				video.attachEvent('onqt_play', me.parentView.startTimer);
				video.attachEvent('onqt_pause', me.parentView.endTimer);
				video.attachEvent('onqt_ended', me.parentView.endTimer);
				video.attachEvent('onqt_loadedmetadata', this.metadataFunc);
			}
			return;
		}

		/**
		 * Lays out the player to accommodate the movie's native dimensions.
		 */
		jQuery.StreamingQuickTimeObjectView.prototype.resizeMovie = function() {

			var video = document.getElementById(me.model.filename+'_embed'+me.model.id);
			w = video.videoWidth;
			h = video.videoHeight;

			me.parentView.intrinsicDim.x = w + 6;
			me.parentView.intrinsicDim.y = h;

			me.parentView.layoutMediaObject();
			me.parentView.removeLoadingMessage();

		}

		/**
		 * Starts playback of the QuickTime movie.
		 */
		jQuery.StreamingQuickTimeObjectView.prototype.play = function() {
			var video = document.getElementById(this.model.filename+'_embed'+this.model.id);
			if (video && this.hasReceivedMetadata) {
				if ((this.model.seekAnnotation != null) && (!this.parentView.overrideAutoSeek)) {
					video.SetTime(this.model.seekAnnotation.properties.start * video.GetTimeScale());
				}
				if (video.GetRate() == 0) {
					video.Play();
				}
			}
		}

		/**
		 * Pauses playback of the QuickTime movie.
		 */
		jQuery.StreamingQuickTimeObjectView.prototype.pause = function() {
			var video = document.getElementById(this.model.filename+'_embed'+this.model.id);
			if (video && this.hasReceivedMetadata) video.Stop();
		}

		/**
		 * Seeks to the specified location in the QuickTime movie.
		 *
		 * @param {Number} time			Seek location in seconds.
		 */
		jQuery.StreamingQuickTimeObjectView.prototype.seek = function(time) {
			var video = document.getElementById(this.model.filename+'_embed'+this.model.id);
			if (video && this.hasReceivedMetadata) video.SetTime(time * video.GetTimeScale());
		}

		/**
		 * Returns the current playback position of the QuickTime movie.
		 * @return	The current playback position in seconds.
		 */
		jQuery.StreamingQuickTimeObjectView.prototype.getCurrentTime = function() {
			var video = document.getElementById(this.model.filename+'_embed'+this.model.id);
			if (video && this.hasReceivedMetadata) {
				return (video.GetTime() / video.GetTimeScale());
			} else {
				return 0;
			}
		}

		/**
		 * Resizes the QuickTime movie to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the video.
		 * @param {Number} height		The new height of the video.
		 */
		jQuery.StreamingQuickTimeObjectView.prototype.resize = function(width, height) {
			width = Math.round(width);
			height = Math.round(height);
			var video = document.getElementById(this.model.filename+'_embed'+this.model.id);
			if (video) video.SetRectangle('0.0,0.0,'+width+'.0,'+height+'.0');
			var parent = $(video).parent().parent();
			parent.width(Math.round(width));
			parent.height(Math.round(height));
		}

		/**
		 * Returns true if the QuickTime video is currently playing.
		 * @return	Returns true if the video is playing.
		 */
		jQuery.StreamingQuickTimeObjectView.prototype.isPlaying = function() {
			result = false;
			var video = document.getElementById(this.model.filename+'_embed'+this.model.id);
			if (video && this.hasReceivedMetadata) {
				return (video.GetRate() != 0);
			}
			return result;
		}

	}

	/**
	 * View for the HTML5 video player.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.HTML5VideoObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element

		/**
		 * Creates the video media object.
		 */
		jQuery.HTML5VideoObjectView.prototype.createObject = function() {
			
			var mimeType;
			switch (this.model.mediaSource.name) {

				case "QuickTime":
				mimeType = "video/quicktime"
				break;

				case "MPEG-4":
				case "M4V":
				mimeType = "video/mp4";
				break;

				case "OGG":
				mimeType = "video/ogg";
				break;

				case "3GPP":
				mimeType = "video/3gpp";
				break;

				case "CriticalCommons-LegacyVideo":
				var temp = this.model.path.split('//');
				if (temp.length == 3) {
					var temp2 = temp[2].split('-');
					temp2.pop();
					var chunk = temp2.join('-');
					chunk = chunk.replace(/%20/g, '-');
					temp = chunk.split('/');
					var slug = temp[temp.length - 1];
					var url = 'http://videos.criticalcommons.org/transcoded/http/ccserver.usc.edu/8080/cc/Members/' + chunk + '.mp4/mp4-high/' + slug.toLowerCase() + '-mp4.mp4';
					this.model.path = url;
				}
				mimeType = this.updateCriticalCommonsURLForBrowser();
				break;

				case "CriticalCommons-Video":
				mimeType = this.updateCriticalCommonsURLForBrowser();
				break;

				case "WebM":
				mimeType = "video/webm";
				break;

				case "HLS":
				mimeType = "application/x-mpegURL";
				var hls = true;
				break;
			}

			obj = $('<div class="mediaObject"><video id="'+this.model.filename+'_'+this.model.id+'" controls="controls"><source src="'+this.model.path+'" type="'+mimeType+'"/>Your browser does not support the video tag.</video></div>').appendTo(this.parentView.mediaContainer);
			if ( this.model.options.autoplay && ( this.model.seek == null ) ) {
				obj.find( 'video' ).attr( 'autoplay', 'true' );
			}

			// apply the poster image only if the thumbnail loads successfully
			var thumbnailURL;
			if (this.model.node.thumbnail) {
				thumbnailURL = this.model.node.getAbsoluteThumbnailURL();

			// legacy thumbnails are sometimes stored with the version
			} else if (this.model.node.current.thumbnail) {
				thumbnailURL = this.model.node.current.thumbnail;
			}

			if (thumbnailURL != undefined) {

				// finding the right thumbnail Critical Commons thumbnail image
				if ((this.model.mediaSource.name == 'CriticalCommons-LegacyVideo') || (this.model.mediaSource.name == 'CriticalCommons-Video')) {
					thumbnailURL = thumbnailURL.replace('thumbnailImage_thumb', 'thumbnailImage');
					thumbnailURL = thumbnailURL.replace('thumbnailImage_small', 'thumbnailImage');
				}

				this.image = new Image();

				// setup actions to be taken on image load
				$(this.image).on('load', function() {
					var $this = $(this);
					me.video.attr('poster', $this.attr('src'));
				}).attr('src', thumbnailURL);
			}

			this.video = obj.find('video#'+this.model.filename+'_'+this.model.id);

			this.parentView.controllerOffset = 22;

			var metadataFunc = function() {

				// Until there's a way to find out from the MP4 if it's an equirectangular video...
				if ('undefined' != typeof(me.model.node.current.properties["http://ns.google.com/photos/1.0/panorama/stitchingsoftware"])) {
					me.parentView.mediaContainer.empty();
					me.parentView.mediaObjectView = new $.V360ObjectView(model, parentView);
					me.parentView.mediaObjectView.createObject();
					return;
				}

        if (me.parentView.intrinsicDim.x != me.video[0].videoWidth || me.parentView.intrinsicDim.y != me.video[0].videoHeight) {
          me.parentView.intrinsicDim.x = me.video[0].videoWidth;
  				me.parentView.intrinsicDim.y = me.video[0].videoHeight;
  				me.parentView.controllerOffset = 0;
        }		console.log('metadatafunc');
				if (hls) {
					me.video[0].removeEventListener('progress', metadataFunc, false);
				}
				me.parentView.layoutMediaObject();
				me.parentView.removeLoadingMessage();

			}

			this.parentView.layoutMediaObject();

			if (document.addEventListener) {
				// When streaming HLS in Safari's native player, the data must be loaded before the video's dimensions can be gathered. Mobile Safari requires this be progress.
				if (hls) {
					this.video[0].addEventListener('progress', metadataFunc, false);
				} else {
					this.video[0].addEventListener('loadedmetadata', metadataFunc, false);
				}
				this.video[0].addEventListener('play', me.parentView.startTimer, false);
				this.video[0].addEventListener('pause', me.parentView.endTimer, false);
				this.video[0].addEventListener('ended', me.parentView.endTimer, false);
			} else {
				if (hls) {
					this.video[0].attachEvent('onprogress', metadataFunc);
				} else {
					this.video[0].attachEvent('onloadedmetadata', metadataFunc);
				}
				this.video[0].attachEvent('play', me.parentView.startTimer);
				this.video[0].attachEvent('pause', me.parentView.endTimer);
				this.video[0].attachEvent('ended', me.parentView.endTimer);
			}

			return;
		}


		jQuery.HTML5VideoObjectView.prototype.updateCriticalCommonsURLForBrowser = function() {
			var ext, format, mimeType;
			if ( this.model.mediaSource.browserSupport[scalarapi.scalarBrowser] != null ) {
				format = this.model.mediaSource.browserSupport[scalarapi.scalarBrowser].format;
			}
			if (format == 'MPEG-4') {
				ext = 'mp4';
				mimeType = "video/mp4";
			} else {
				ext = 'webm';
				mimeType = "video/webm";
				this.model.path = this.model.path.replace('mp4-high','webm-high');
				this.model.path = this.model.path.replace('mp4-low','webm-low');
			}
			var path_segments = this.model.path.split('.');
			if (path_segments.length > 1) {
				path_segments[path_segments.length-1] = ext;
				this.model.path = path_segments.join('.');
			}
			return mimeType;
		}

		/**
		 * Starts playback of the video.
		 */
		jQuery.HTML5VideoObjectView.prototype.play = function() {
			if ((this.model.seekAnnotation != null) && (!this.parentView.overrideAutoSeek)) {
				this.video[0].currentTime = this.model.seekAnnotation.properties.start;
			}
			if (this.video[0].paused) {
				this.video[0].play();
			}
		}

		/**
		 * Pauses playback of the video.
		 */
		jQuery.HTML5VideoObjectView.prototype.pause = function() {
			if (this.video[0]) {
				this.video[0].pause();
			}
		}

		/**
		 * Seeks to the specified location in the video.
		 *
		 * @param {Number} time			Seek location in seconds.
		 */
		jQuery.HTML5VideoObjectView.prototype.seek = function(time) {
			if (this.video[0]) {
				this.video[0].currentTime = time;
			}
		}

		/**
		 * Returns the current playback position of the video.
		 * @return	The current playback position in seconds.
		 */
		jQuery.HTML5VideoObjectView.prototype.getCurrentTime = function() {
			if (this.video[0]) {
				return this.video[0].currentTime;
			}
		}

		/**
		 * Resizes the video to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the video.
		 * @param {Number} height		The new height of the video.
		 */
		jQuery.HTML5VideoObjectView.prototype.resize = function(width, height) {
			if (this.video) {
				this.video[0].width = width;
				this.video[0].height = height;
			}
		}

		/**
		 * Returns true if the video is currently playing.
		 * @return	Returns true if the video is playing.
		 */
		jQuery.HTML5VideoObjectView.prototype.isPlaying = function() {
			if (this.video[0]) {
				return !this.video[0].paused;
			}
		}

	}

	/**
	 * View for the Semantic Annotation Tool video player.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.SemanticAnnotationToolObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element

		/**
		 * Creates the video media object.
		 */
		jQuery.SemanticAnnotationToolObjectView.prototype.createObject = function() {

			var mimeType;
			switch (this.model.mediaSource.name) {

				case "QuickTime":
				mimeType = "video/quicktime"
				break;

				case "MPEG-4":
				case "M4V":
				mimeType = "video/mp4";
				break;

				case "OGG":
				mimeType = "video/ogg";
				break;

				case "3GPP":
				mimeType = "video/3gpp";
				break;

				case "CriticalCommons-LegacyVideo":
				var temp = this.model.path.split('//');
				if (temp.length == 3) {
					var temp2 = temp[2].split('-');
					temp2.pop();
					var chunk = temp2.join('-');
					chunk = chunk.replace(/%20/g, '-');
					temp = chunk.split('/');
					var slug = temp[temp.length - 1];
					var url = 'http://videos.criticalcommons.org/transcoded/http/ccserver.usc.edu/8080/cc/Members/' + chunk + '.mp4/mp4-high/' + slug.toLowerCase() + '-mp4.mp4';
					this.model.path = url;
				}
				mimeType = this.updateCriticalCommonsURLForBrowser();
				break;

				case "CriticalCommons-Video":
				mimeType = this.updateCriticalCommonsURLForBrowser();
				break;

				case "WebM":
				mimeType = "video/webm";
				break;

			}

			var obj = $('<div class="mediaObject"><video id="'+this.model.filename+'_'+this.model.id+'"><source src="'+this.model.path+'" type="'+mimeType+'"/>Your browser does not support the video tag.</video></div>').appendTo(this.parentView.mediaContainer);
			if ( this.model.options.autoplay && ( this.model.seek == null ) ) {
				obj.find( 'video' ).attr( 'autoplay', 'true' );
			}

			this.video = obj.find('video#'+this.model.filename+'_'+this.model.id);

			this.parentView.controllerOffset = 22;

			var metadataFunc = function() {

				me.parentView.intrinsicDim.x = me.video[0].videoWidth;
				me.parentView.intrinsicDim.y = me.video[0].videoHeight;
				me.parentView.controllerOffset = 0;

				me.parentView.layoutMediaObject();
				me.parentView.removeLoadingMessage();

				me.setupTool();

			}

			if (document.addEventListener) {
				this.video[0].addEventListener('loadedmetadata', metadataFunc, false);
			} else {
				this.video[0].attachEvent('onloadedmetadata', metadataFunc);
			}

			return;
		}

		jQuery.SemanticAnnotationToolObjectView.prototype.setupTool = function() {

			var sat_values = $('.book-title').children('[data-semantic-annotation-tool]').attr('data-semantic-annotation-tool');
			var sat_arr = sat_values.split(',');
			var sat_address = (sat_arr[0].length) ? sat_arr[0] : 'https://onomy.org/published/95/json';
			var sat_language = ('undefined' != typeof(sat_arr[1])) ? sat_arr[1] : 'en';
			var parent = $('link#parent').attr('href');
			var $video = this.video.first();
			// CSS files are loaded in cantaloupe/content.php

			var go = function(status) {
				var isLoggedIn = parseInt(status.is_logged_in);
				var kioskMode = (isLoggedIn) ? false : true;
				var username = (isLoggedIn) ? status.fullname : '';
				var email = (isLoggedIn) ? status.email : '';
				var waldorf = $video.annotate({
					serverURL: parent,
					tagsURL: sat_address,
					onomyLanguage: sat_language,
					kioskMode: kioskMode,
					cmsUsername: username,
					cmsEmail: email,
					displayIndex: false,
					callback: function(event) {
						console.log('Waldorf callback');
					}
				});
			}

			// TODO: sometimes $video is undefined, for some reason
			console.log($video);
			
			$.getJSON(parent + 'login_status', function(status) {
				go(status);
			});

		}

		jQuery.SemanticAnnotationToolObjectView.prototype.updateCriticalCommonsURLForBrowser = function() {
			var ext, format, mimeType;
			if ( this.model.mediaSource.browserSupport[scalarapi.scalarBrowser] != null ) {
				format = this.model.mediaSource.browserSupport[scalarapi.scalarBrowser].format;
			}
			if (format == 'MPEG-4') {
				ext = 'mp4';
				mimeType = "video/mp4";
			} else {
				ext = 'webm';
				mimeType = "video/webm";
				this.model.path = this.model.path.replace('mp4-high','webm-high');
				this.model.path = this.model.path.replace('mp4-low','webm-low');
			}
			var path_segments = this.model.path.split('.');
			if (path_segments.length > 1) {
				path_segments[path_segments.length-1] = ext;
				this.model.path = path_segments.join('.');
			}
			return mimeType;
		}

		/**
		 * Starts playback of the video.
		 */
		jQuery.SemanticAnnotationToolObjectView.prototype.play = function() {
			if ((this.model.seekAnnotation != null) && (!this.parentView.overrideAutoSeek)) {
				this.video[0].currentTime = this.model.seekAnnotation.properties.start;
			}
			if (this.video[0].paused) {
				this.video[0].play();
			}
		}

		/**
		 * Pauses playback of the video.
		 */
		jQuery.SemanticAnnotationToolObjectView.prototype.pause = function() {
			if (this.video[0]) {
				this.video[0].pause();
			}
		}

		/**
		 * Seeks to the specified location in the video.
		 *
		 * @param {Number} time			Seek location in seconds.
		 */
		jQuery.SemanticAnnotationToolObjectView.prototype.seek = function(time, end) {
			if (this.video[0]) {
				this.video[0].currentTime = time;
				if ('undefined' != typeof(end)) {
					$(this.video[0]).trigger('annotationEndTime', [end]);  // For Waldorf... assume we're seeking to the beginning of an Annotation
				}
			}
		}

		/**
		 * Returns the current playback position of the video.
		 * @return	The current playback position in seconds.
		 */
		jQuery.SemanticAnnotationToolObjectView.prototype.getCurrentTime = function() {
			if (this.video[0]) {
				return this.video[0].currentTime;
			}
		}

		/**
		 * Resizes the video to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the video.
		 * @param {Number} height		The new height of the video.
		 */
		jQuery.SemanticAnnotationToolObjectView.prototype.resize = function(width, height) {
			if (this.video) {
				this.video[0].width = width;
				this.video[0].height = height;
			}
		}

		/**
		 * Returns true if the video is currently playing.
		 * @return	Returns true if the video is playing.
		 */
		jQuery.SemanticAnnotationToolObjectView.prototype.isPlaying = function() {
			if (this.video[0]) {
				return !this.video[0].paused;
			}
		}

	}

	/**
	 * View for the hls.js Audio player to support HTTP Live Streaming.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	 jQuery.HLSAudioObjectView = function(model, parentView) {

		var me = this;

		this.model = model;				// instance of the model
		this.parentView = parentView;			// primary view for the media element

		/**
		 * Creates the hls.js audio media object.
		 */
		 jQuery.HLSAudioObjectView.prototype.createObject = function() {

			var HLSObjectId = 'hls_'+this.model.filename+'_'+this.model.id;

			obj = $('<div class="mediaObject"><audio id="'+HLSObjectId+'" style="width:100%;" controls type="application/x-mpegURL">Your browser does not support the audio tag.</audio></div>').appendTo(this.parentView.mediaContainer);
			if ( this.model.options.autoplay && ( this.model.seek == null ) ) {
				obj.find( 'audio' ).attr( 'autoplay', 'true' );
			}

			this.audio = obj.find('audio#'+HLSObjectId);

			this.parentView.controllerOnly = true;
			this.parentView.controllerHeight = 25;

			this.parentView.intrinsicDim.y = 45;

			// this prevents the top of the player from getting cut off in Firefox
			if ( scalarapi.scalarBrowser == "Mozilla" ) {
				obj.find( 'audio' ).height( this.parentView.intrinsicDim.y );
			}

			this.parentView.layoutMediaObject();

			this.hls = new Hls({autoStartLoad:false,maxBufferSize:30 * 1000 * 1000,});
			this.hls.loadSource(this.model.path);
			this.hls.attachMedia(this.audio[0]);

			this.parentView.removeLoadingMessage();

			if (document.addEventListener) {
				this.audio[0].addEventListener('play', () => { me.parentView.startTimer; this.hls.startLoad(startPosition=-1); }, false);
				this.audio[0].addEventListener('pause', me.parentView.endTimer, false);
				this.audio[0].addEventListener('ended', me.parentView.endTimer, false);
				this.audio[0].addEventListener('ended', me.parentView.endTimer, false);
			} else {
				this.audio[0].attachEvent('play', me.parentView.startTimer);
				this.audio[0].attachEvent('pause', me.parentView.endTimer);
				this.audio[0].attachEvent('ended', me.parentView.endTimer);
			}

			return;
		 }

		 /**
		 * Starts playback of the audio.
		 */
		jQuery.HLSAudioObjectView.prototype.play = function() {
			if ((this.model.seekAnnotation != null) && (!this.parentView.overrideAutoSeek)) {
				this.audio[0].currentTime = this.model.seekAnnotation.properties.start;
			}
			if (this.audio[0].paused) {
				this.audio[0].play();
			}
		}

		/**
		 * Pauses playback of the audio.
		 */
		jQuery.HLSAudioObjectView.prototype.pause = function() {
			this.audio[0].pause();
		}

		/**
		 * Seeks to the specified location in the audio.
		 *
		 * @param {Number} time			Seek location in seconds.
		 */
		jQuery.HLSAudioObjectView.prototype.seek = function(time) {
			this.audio[0].currentTime = time;
		}

		/**
		 * Returns the current playback position of the audio.
		 * @return	The current playback position in seconds.
		 */
		jQuery.HLSAudioObjectView.prototype.getCurrentTime = function() {
			return this.audio[0].currentTime;
		}

		/**
		 * Resizes the audio to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the media.
		 * @param {Number} height		The new height of the media.
		 */
		jQuery.HLSAudioObjectView.prototype.resize = function(width) {
			$(this.model.element).find('.mediaObject').width(width);
		}

		/**
		 * Returns true if the audio is currently playing.
		 * @return	Returns true if the audio is playing.
		 */
		jQuery.HLSAudioObjectView.prototype.isPlaying = function() {
			return !this.audio[0].paused;
		}
	}

	/**
	 * View for the hls.js Video player to support HTTP Live Streaming.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.HLSVideoObjectView = function(model, parentView) {

		var me = this;

		this.model = model;				// instance of the model
		this.parentView = parentView;			// primary view for the media element

		/**
		 * Creates the hls.js video media object.
		 */
		jQuery.HLSVideoObjectView.prototype.createObject = function() {

			var HLSObjectId = 'hls_'+this.model.filename+'_'+this.model.id;

			obj = $('<div class="mediaObject"><video id="'+HLSObjectId+'" controls type="application/x-mpegURL">Your browser does not support the video tag.</video></div>').appendTo(this.parentView.mediaContainer);
			if ( this.model.options.autoplay && ( this.model.seek == null ) ) {
				obj.find( 'video' ).attr( 'autoplay', 'true' );
			}

			this.video = obj.find('video#'+HLSObjectId);

			var thumbnailURL;
			if (this.model.node.thumbnail) {
				thumbnailURL = this.model.node.getAbsoluteThumbnailURL();
			} else if (this.model.node.current.thumbnail) {
				thumbnailURL = this.model.node.current.thumbnail;
			}

			if (thumbnailURL != undefined) {
				this.image = new Image();
				$(this.image).on('load', function() {
					var $this = $(this);
					me.video.attr('poster', $this.attr('src'));
				}).attr('src', thumbnailURL);
			}

			this.parentView.controllerOffset = 22;

			var metadataFunc = function() {
				me.parentView.controllerOffset = 0;

				me.parentView.layoutMediaObject();
				me.parentView.removeLoadingMessage();
			}

			this.parentView.layoutMediaObject();

			this.hls = new Hls({autoStartLoad:false,maxBufferSize:30 * 1000 * 1000,});
			this.hls.loadSource(this.model.path);
			this.hls.attachMedia(this.video[0]);
			this.hls.on(Hls.Events.MANIFEST_PARSED, function(event, data) {
				me.parentView.intrinsicDim.x = data.levels[data.levels.length -1].width;
				me.parentView.intrinsicDim.y = data.levels[data.levels.length -1].height;
				metadataFunc();
			});

			this.video[0].addEventListener('play', () => { me.parentView.startTimer; this.hls.startLoad(startPosition=-1); }, false);
			this.video[0].addEventListener('pause', me.parentView.endTimer, false);
			this.video[0].addEventListener('ended', me.parentView.endTimer, false);

			return;
		}

		jQuery.HLSVideoObjectView.prototype.play = function() {
			if ((this.model.seekAnnotation != null) && (!this.parentView.overrideAutoSeek)) {
				this.video[0].currentTime = this.model.seekAnnotation.properties.start;
			}
			if (this.video[0].paused) {
				this.video[0].play();
			}
		}

		jQuery.HLSVideoObjectView.prototype.pause = function() {
			if (this.video) {
				this.video[0].pause();
			}
		}

		/**
		 * @param {Number} time
		 */
		 jQuery.HLSVideoObjectView.prototype.seek = function(time) {
			if (this.video[0]) {
				this.video[0].currentTime = time;
			}
		}

		/**
		 * @return
		 */
 		jQuery.HLSVideoObjectView.prototype.getCurrentTime = function() {
			if (this.video[0]) {
				return this.video[0].currentTime;
			}
		}

		/**
		 * @param {Number} width
		 * @param {Number} height
		 */
		jQuery.HLSVideoObjectView.prototype.resize = function(width, height) {
			if (this.video) {
				this.video[0].width = width;
				this.video[0].height = height;
			}
		}

		/**
		 * @return
		 */
		jQuery.HLSVideoObjectView.prototype.isPlaying = function() {
			if (this.video) {
				return !this.video[0].paused;
			}
		}
	}

	/**
	 * View for 360 videos, using Google's vrview.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.V360ObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.hasLoaded = false;					// has the image loaded?
		this.annotations = null;				// vrview hotspots
		this.annotatedImage = null;				// hotspotted image object

		/**
		 * Creates the 360 media object.
		 */
 		jQuery.V360ObjectView.prototype.createObject = function() {
 			this.hasLoaded = true;
			//this.parentView.intrinsicDim.x = 6000;
			//this.parentView.intrinsicDim.y = 3000;
			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

 			if ('undefined' == typeof(vrviews)) vrviews = 0;  // Global
 			var my_vrview = parseInt(vrviews);
 			vrviews++;
			this.wrapper = $('<div class="mediaObject" id="vrview_'+my_vrview+'" style="width:100%;height:100%;"></div>');
			$(this.wrapper).appendTo(this.parentView.mediaContainer);

			var url = this.model.path;
			var path = $('link#approot').attr('href')+'views/widgets/vrview/build/';
			var obj = {
				video: url,
				script_path: path
			};
		    $.getScript( path+'vrview.js' , function() {
		    	var vrview_selector = '#vrview_'+my_vrview;
		    	var vrView = new VRView.Player(vrview_selector, obj);
		    	var $play = $('<div class="vroptions"><small class="helper_msg"></small><div class="pull-left"><button type="button" class="btn btn-xs btn-success toggleplay"><span class="glyphicon glyphicon-play"></span>Play</button><span class="time">00:00</span></div><!--<div class="pull-right"><button type="button" class="btn btn-xs btn-default togglemute">Mute</button></div>--></div>');
		    	$(vrview_selector).find('iframe').css('width','100%').css('height', '90%').after($play);
			    // Center text
			    var helper_msg = 'Click and drag video to move 360 perspective.';
			    var width = parseInt($play.width());
			    if (width < 300) helper_msg = '';
			    $play.find('.helper_msg').text(helper_msg);
			    // Play/pause
				var $play_button = $play.find('.toggleplay');
				$play_button.on('click', function() {
					var $this = $(this);
					if ('play' == $this.text().toLowerCase()) {  // Don't trust vrView.isPlaying
						vrView.play();
						$this.removeClass('btn-success').addClass('btn-danger').html('<span class="glyphicon glyphicon-pause"></span>Pause').blur();
					} else {
						vrView.pause();
						$this.removeClass('btn-danger').addClass('btn-success').html('<span class="glyphicon glyphicon-play"></span>Play').blur();
					}
				});
				// Time
				var $time = $play.find('.time');
				vrView.on('timeupdate', function(e) {
				    var current = me.formatTime(e.currentTime);
				    var duration = me.formatTime(e.duration);
				    $time.text(current);
				});
				vrView.on('ready', function(e) {
					vrView.pause();
				});
		    });

    	}

 		jQuery.V360ObjectView.prototype.formatTime = function(time) {
 			  time = !time || typeof time !== 'number' || time < 0 ? 0 : time;
 			  var minutes = Math.floor(time / 60) % 60;
 			  var seconds = Math.floor(time % 60);
 			  minutes = minutes <= 0 ? 0 : minutes;
 			  seconds = seconds <= 0 ? 0 : seconds;
 			  var result = (minutes < 10 ? '0' + minutes : minutes) + ':';
 			  result += seconds < 10 ? '0' + seconds : seconds;
 			  return result;
 		};

		/**
		 * Resizes the vrview wrapper (in this case, ".mediaContainer" since vrview loads asyncronously) to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the area.
		 * @param {Number} height		The new height of the area.
		 */
		jQuery.V360ObjectView.prototype.resize = function(width, height) {
			if (width > 500) height = width * 0.75;  // Artificially restrict the height
			if (height > 400) height = 400;  // Artificially cap the height
			$(me.parentView.mediaContainer).width(width+'px');
			$(me.parentView.mediaContainer).height(height+'px');
		}

		jQuery.V360ObjectView.prototype.play = function() { }
		jQuery.V360ObjectView.prototype.pause = function() { }
		jQuery.V360ObjectView.prototype.seek = function(time) { }
		jQuery.V360ObjectView.prototype.getCurrentTime = function() { return null; }
		jQuery.V360ObjectView.prototype.isPlaying = function() { return true; }

	}  // !360

	/**
	 * View for the HTML5 audio player.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.HTML5AudioObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element

		/**
		 * Creates the media object.
		 */
		jQuery.HTML5AudioObjectView.prototype.createObject = function() {

			var mimeType;
			if (this.model.mediaSource.name == 'HLS') {
				mimeType = 'application/x-mpegURL';
			} else {
				mimeType = 'audio/'+this.model.extension;
			}

			obj = $('<div class="mediaObject"><audio style="width:100%;" src="'+this.model.path+'" controls="controls" type="'+mimeType+'">Your browser does not support the audio tag.</audio></div>').appendTo(this.parentView.mediaContainer);
			if ( this.model.options.autoplay && ( this.model.seek == null ) ) {
				obj.find( 'audio' ).attr( 'autoplay', 'true' );
			}
			this.audio = obj.find('audio');

			this.parentView.controllerOnly = true;
			this.parentView.controllerHeight = 25;

			this.parentView.intrinsicDim.y = 45;

			// this prevents the top of the player from getting cut off in Firefox
			if ( scalarapi.scalarBrowser == "Mozilla" ) {
				obj.find( 'audio' ).height( this.parentView.intrinsicDim.y );
			}

			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

			if (document.addEventListener) {
				this.audio[0].addEventListener('play', me.parentView.startTimer, false);
				this.audio[0].addEventListener('pause', me.parentView.endTimer, false);
				this.audio[0].addEventListener('ended', me.parentView.endTimer, false);
				this.audio[0].addEventListener('ended', me.parentView.endTimer, false);
			} else {
				this.audio[0].attachEvent('play', me.parentView.startTimer);
				this.audio[0].attachEvent('pause', me.parentView.endTimer);
				this.audio[0].attachEvent('ended', me.parentView.endTimer);
			}

			return;
		}

		/**
		 * Starts playback of the audio.
		 */
		jQuery.HTML5AudioObjectView.prototype.play = function() {
			if ((this.model.seekAnnotation != null) && (!this.parentView.overrideAutoSeek)) {
				this.audio[0].currentTime = this.model.seekAnnotation.properties.start;
			}
			if (this.audio[0].paused) {
				this.audio[0].play();
			}
		}

		/**
		 * Pauses playback of the audio.
		 */
		jQuery.HTML5AudioObjectView.prototype.pause = function() {
			this.audio[0].pause();
		}

		/**
		 * Seeks to the specified location in the audio.
		 *
		 * @param {Number} time			Seek location in seconds.
		 */
		jQuery.HTML5AudioObjectView.prototype.seek = function(time) {
			this.audio[0].currentTime = time;
		}

		/**
		 * Returns the current playback position of the audio.
		 * @return	The current playback position in seconds.
		 */
		jQuery.HTML5AudioObjectView.prototype.getCurrentTime = function() {
			return this.audio[0].currentTime;
		}

		/**
		 * Resizes the audio to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the media.
		 * @param {Number} height		The new height of the media.
		 */
		jQuery.HTML5AudioObjectView.prototype.resize = function(width, height) {
			$(this.model.element).find('.mediaObject').width(width);
			//$(this.model.element).find('.mediaObject').height(height);
		}

		/**
		 * Returns true if the audio is currently playing.
		 * @return	Returns true if the audio is playing.
		 */
		jQuery.HTML5AudioObjectView.prototype.isPlaying = function() {
			return !this.audio[0].paused;
		}

	}

	/**
	 * View for the video player for YouTube videos imported natively.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.YouTubeVideoObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element

		/**
		 * Creates the video media object.
		 */
		jQuery.YouTubeVideoObjectView.prototype.createObject = function() {

			// TODO: the 'origin' param will have to become dynamic for Scalar to be able to live on different servers

			obj = $('<div class="mediaObject"><div id="youtube'+this.model.filename+'_'+this.model.id+'"></div></div>').appendTo(this.parentView.mediaContainer);
			var queryVars = scalarapi.getQueryVars( this.model.path );

			// default player vars
			playerVars = {
				modestbranding:1,
				enablejsapi:1,
				origin:'scalar.usc.edu',
				rel:0,
				autoplay: this.model.options.autoplay ? 1 : 0
			}

			// overwrite defaults with any params in the youtube url
			for ( var prop in queryVars ) {
				if ( isNaN( parseFloat( queryVars[ prop ] ) ) ) {
					playerVars[ prop ] = queryVars[ prop ];
				} else {
					// the "t" param needs to get remapped to "start"
					if ( prop == "t" ) {
						playerVars[ "start" ] = parseFloat( queryVars[ prop ] );
					} else {
						playerVars[ prop ] = parseFloat( queryVars[ prop ] );
					}
				}
			}

			var params = {
				videoId: YouTubeGetID( this.model.path ),
				playerVars: playerVars,
				events: {
					'onStateChange': 'onYouTubeStateChange' + this.model.id
				}
			}

			if ( this.model.initialSeekAnnotation != null ) {
				params.playerVars.start = Math.round( this.model.initialSeekAnnotation.properties.start );
			}

			var myId = this.model.id;

			// the event doesn't pass back reliable data about which instance it refers so, so we create
			// separate event handlers for each instance, named according to the mediaelement id
			window[ 'onYouTubeStateChange' + this.model.id ] = function( event ) {

				var theMediaelement;
				var idString;

				// loop through every link and find the media element data whose id matches this instance
				$('a').each(function() {
					if ($(this).data('clone')) {
						var clone = $(this).data('clone');
						idString = clone.data('mediaelement').model.id;
						if (idString == myId) {
							theMediaelement = clone.data('mediaelement');
						}
					}
					if (theMediaelement == undefined) {
						if ($(this).data('mediaelement')) {
							idString = $(this).data('mediaelement').model.id;
							if (idString == myId) {
								theMediaelement = $(this).data('mediaelement');
							}
						}
					}
				});

				// handle video state changes
				switch (event.data) {

					case YT.PlayerState.PLAYING:
					theMediaelement.view.startTimer();
					break;

					case YT.PlayerState.ENDED:
					case YT.PlayerState.PAUSED:
					theMediaelement.view.endTimer();
					break;

				}
			}

			/*if ((this.model.seekAnnotation != null) && (scalarapi.scalarBrowser != 'MobileSafari')) {
				params.playerVars.start = Math.round( this.model.seekAnnotation.properties.start );
				params.playerVars.end = Math.round( this.model.seekAnnotation.properties.end );
			}*/

			this.video = new YT.Player('youtube'+this.model.filename+'_'+this.model.id, params);

			this.parentView.removeLoadingMessage();

			return;
		}

		/**
		 * Starts playback of the YouTube video.
		 */
		jQuery.YouTubeVideoObjectView.prototype.play = function() {
			if (this.video) {
				if ((this.model.seekAnnotation != null) && (!this.parentView.overrideAutoSeek)) {
					this.video.seekTo(this.model.seekAnnotation.properties.start, false);
				}
				if (this.video.getPlayerState() != 1) {
					this.video.playVideo();
				}
			}
		}

		/**
		 * Pauses playback of the YouTube video.
		 */
		jQuery.YouTubeVideoObjectView.prototype.pause = function() {
			if (this.video) this.video.pauseVideo();
		}

		/**
		 * Seeks to the specified location in the YouTube video.
		 *
		 * @param {Number} time			Seek location in seconds.
		 */
		jQuery.YouTubeVideoObjectView.prototype.seek = function(time) {
			if (this.video) {
				if (this.video.seekTo) {
					//var wasPlaying = this.isPlaying();
					this.video.seekTo(time, true);
					//console.log( 'was playing' + wasPlaying );
					//if ( (scalarapi.scalarBrowser != 'MobileSafari') && !wasPlaying ) this.pause(); // because the seek command tries to start playing automagically
				}
			}
		}

		/**
		 * Returns the current playback position of the YouTube video.
		 * @return	The current playback position in seconds.
		 */
		jQuery.YouTubeVideoObjectView.prototype.getCurrentTime = function() {
			if (this.video) {
				if (this.video.getCurrentTime) {
					return this.video.getCurrentTime();
				}
			}
			return 0;
		}

		/**
		 * Resizes the YouTube video to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the video.
		 * @param {Number} height		The new height of the video.
		 */
		jQuery.YouTubeVideoObjectView.prototype.resize = function(width, height) {
			element = document.getElementById('youtube'+this.model.filename+'_'+this.model.id);
			if (this.video) {
				this.video.setSize(width - 2, height);
			}
		}

		/**
		 * Returns true if the video is currently playing.
		 * @return	Returns true if the video is playing.
		 */
		jQuery.YouTubeVideoObjectView.prototype.isPlaying = function() {
			var result = false;
			if (this.video) {
				if (this.video.getPlayerState) {
					result = (this.video.getPlayerState() == 1);
				}
			}
			return result;
		}

	}

	/**
	 * View for the Vimeo video player.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.VimeoVideoObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.isVideoPlaying = false;			// is the video currently playing?
		this.currentTime = 0;					// current position of the video
		this.initialPauseDone = false;			// Vimeo videos need to be played briefly to enable seeking functionality; has it subsequently been paused?
		this.percentLoaded = 0;					// amount of the video that has loaded

		/**
		 * Creates the video media object.
		 */
		jQuery.VimeoVideoObjectView.prototype.createObject = function() {

			var options = {
				id: this.model.filename,
				autoplay: this.model.options.autoplay,
				title: false,
				portrait: false,
				byline: false
			};
			this.id = 'vimeo'+this.model.filename+'_'+this.model.id;
			var obj = $('<div id="'+this.id+'" class="mediaObject"></div>').appendTo(this.parentView.mediaContainer);
			this.player = new Vimeo.Player('vimeo'+this.model.filename+'_'+this.model.id, options);
			this.player.on('timeupdate', function(data) {
				if ((me.model.seekAnnotation != null) && !me.initialPauseDone && !me.parentView.cachedPlayCommand) {
					me.player.pause();
				}
				me.currentTime = data.seconds;
				me.initialPauseDone = true;
				me.isVideoPlaying = false; // need to set this manually because the pause event isn't firing here
				me.currentTime = data.seconds;
			});
			this.player.on('progress', function(data) {
				if (data.lengthComputable) {
					me.percentLoaded = data.loaded / parseFloat(data.total);
				}
			});
			this.player.on('play', function() { me.parentView.startTimer(); me.isVideoPlaying = true; });
			this.player.on('pause', function() { me.parentView.endTimer(); me.isVideoPlaying = false; });
			this.player.on('ended', function() { me.parentView.endTimer(); me.isVideoPlaying = false; });

			this.parentView.layoutMediaObject();

			Promise.all([this.player.getVideoWidth(), this.player.getVideoHeight()]).then(function(dimensions) {
			    me.parentView.intrinsicDim.x = dimensions[0];
			    me.parentView.intrinsicDim.y = dimensions[1];
				me.parentView.controllerOffset = 0;
				me.parentView.layoutMediaObject();
				me.parentView.removeLoadingMessage();
			});

			return;
		}

		/**
		 * Starts playback of the Vimeo video.
		 */
		jQuery.VimeoVideoObjectView.prototype.play = function() {
			if ((this.model.seekAnnotation != null) && (!this.parentView.overrideAutoSeek)) {
				this.player.setCurrentTime(this.model.seekAnnotation.properties.start);
			}
			this.player.play();
			this.isVideoPlaying = true;
		}

		/**
		 * Pauses playback of the Vimeo video.
		 */
		jQuery.VimeoVideoObjectView.prototype.pause = function() {
			this.player.pause();
			this.isVideoPlaying = false;
		}

		/**
		 * Seeks to the specified location in the Vimeo video.
		 *
		 * @param {Number} time			Seek location in seconds.
		 */
		jQuery.VimeoVideoObjectView.prototype.seek = function(time) {
			this.player.setCurrentTime(time);
		}

		/**
		 * Returns the current playback position of the Vimeo video.
		 * @return	The current playback position in seconds.
		 */
		jQuery.VimeoVideoObjectView.prototype.getCurrentTime = function() {
			return this.currentTime;
		}

		/**
		 * Resizes the Vimeo video to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the video.
		 * @param {Number} height		The new height of the video.
		 */
		jQuery.VimeoVideoObjectView.prototype.resize = function(width, height) {
			video = $('#'+this.id+',#'+this.id+'>iframe');
			if (video) {
				$(video).width(width);
				$(video).height(height);
			}
		}

		/**
		 * Returns true if the video is currently playing.
		 * @return	Returns true if the video is playing.
		 */
		jQuery.VimeoVideoObjectView.prototype.isPlaying = function(value, player_id) {
			return this.isVideoPlaying;
		}

	}

	/**
	 * View for the HyperCities map player.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.HyperCitiesObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.isLiquid = true;					// media expands to fill available space

		/**
		 * Creates the image media object.
		 */
 		jQuery.HyperCitiesObjectView.prototype.createObject = function() {

 			obj = $('<div class="mediaObject"><iframe id="hypercities'+this.model.filename+'_'+this.model.id+'" src="'+this.model.path+'" frameborder="0"></iframe></div>').appendTo(this.parentView.mediaContainer);

 			this.map = obj.find('iframe');

			this.parentView.intrinsicDim.x = this.parentView.containerDim.x;
			this.parentView.intrinsicDim.y = this.parentView.containerDim.y;

			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

 			return null;

    	}

		// These functions are basically irrelevant for Hypercities
		jQuery.HyperCitiesObjectView.prototype.play = function() { }
		jQuery.HyperCitiesObjectView.prototype.pause = function() { }
		jQuery.HyperCitiesObjectView.prototype.seek = function(time) { }
		jQuery.HyperCitiesObjectView.prototype.getCurrentTime = function() { return null; }
		jQuery.HyperCitiesObjectView.prototype.isPlaying = function() { return false; }

		/**
		 * Resizes the image to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the media.
		 * @param {Number} height		The new height of the media.
		 */
		jQuery.HyperCitiesObjectView.prototype.resize = function(width, height) {
			if (this.map) {
				this.map.width(width+'px');
				this.map.height(height+'px');
			}
		}

	}

	/**
	 * View for text.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.TextObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.hasFrameLoaded = false;			// has the iframe loaded?
		this.isLiquid = true;					// media should expand to fill available space
		this.currentLine = 0;					// user's position in the text
		this.textIsPlaying = false;				// text is 'played' so that we can seek and show live annotations for it
		this.justPlayedSeekAnnotation = false;	// did we just play a text annotation?

		/**
		 * Creates the text media object.
		 */
		jQuery.TextObjectView.prototype.createObject = function() {

			var approot = $('link#approot').attr('href');
			var path = this.model.path;

			this.frameId = 'text'+this.model.filename+'_'+this.model.id;

			var obj = $('<div class="mediaObject" style="overflow: hidden"><div><iframe style="width: 100%; height: 100%;" id="'+this.frameId+'" src="'+path+'" frameborder="0"></iframe></div></div>').appendTo(this.parentView.mediaContainer);

			// these styles enable momentum scrolling of iframes for mobile devices;
			// if added for desktop browsers they cause double scrollbars
			if (( scalarapi.scalarBrowser == 'MobileSafari' ) || ( scalarapi.scalarBrowser == 'Android' )) {
				obj.find( 'div' ).css( {
					"-webkit-overflow-scrolling": "touch",
					"overflow-y": "scroll"
				})
			}

			this.frame = obj.find('#'+this.frameId)[0];

			$(this.frame).on("load", function () {
				me.codeToList();
			   	me.hasFrameLoaded = true;
			   	me.highlightAnnotatedLines();
				me.pause();
				if ((me.model.seekAnnotation != null) && !me.justPlayedSeekAnnotation) {
					me.parentView.doAutoSeek(me.parentView);
				}
			});

			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

			return;
		}

		/**
		 * Styles the source code for presentation.
		 */
		jQuery.TextObjectView.prototype.codeToList = function() {

			var extension = scalarapi.getFileExtension(me.model.path);

			if (extension != 'txt') {

				var code = $('<code>'+$('#'+this.frameId)[0].contentWindow.document.body.innerHTML+'</code>');

				code.find('pre').prepend('\n');
				code.find('pre').css('white-space', 'pre');
				code.find('pre').css('word-wrap', 'normal');

				//Convert code elements to ordered lists
				code.html("<ol class='code'>" + code.html().replace(/\n/g, "<li>").trim() + "</ol>");

			} else {

				var code = $($('#'+this.frameId)[0].contentWindow.document.body.innerHTML);

				code.prepend('\n');

				//Convert code elements to ordered lists
				code.html("<ol class='plain'>" + code.html().replace(/\n/g, "<li>").trim() + "</ol>");

  			//Added styling to make text media feel a bit more like code media (sizing, padding, etc.)
  			$('#'+this.frameId).contents().find('body ol').css({
  					'color': 'black',
  					'text-shadow': '0',
  					'font-size': '13px',
  					'padding':'13px 0px'
  			}).find('li').css('padding','0 13px 0 49.4px');
			}

			code.find('li').each(function() {
				$(this).attr('title', 'Line '+($(this).index()+1));
			});

			$('#'+this.frameId)[0].contentWindow.document.body.innerHTML = code.html();

			var approot = $('link#approot').attr('href');
			var cssLink = document.createElement("link")
			cssLink.href = approot+'views/widgets/mediaelement/mediaelement_code.css';
			cssLink.rel = "stylesheet";
			cssLink.type = "text/css";

			var doc = $('#'+this.frameId)[0].contentWindow.document;
			doc.body.appendChild(cssLink);

			// Used http://www.nealgrosskopf.com/tech/thread.php?pid=33 to help out here

		}

		/**
		 * Highlights all of the annotated lines in the text.
		 */
		jQuery.TextObjectView.prototype.highlightAnnotatedLines = function() {

			var i;
			var n = this.parentView.annotations.length;
			var textAnnotations = [];
			var annotation;
			for (i=0; i<n; i++) {
				annotation = this.parentView.annotations[i];
				if (this.model.mediaSource.contentType == 'document') {
					textAnnotations.push(annotation);
				}
			}
			if (textAnnotations.length > 0) this.highlightLinesForAnnotations( textAnnotations, 'highlightLight' );

		}

		/**
		 * Highlights the lines of the text associated with the specified annotations.
		 */
		jQuery.TextObjectView.prototype.highlightLinesForAnnotations = function( textAnnotations, style ) {

			if ( style == null ) {
				style = 'highlightLight';
			}
			var li = $('#'+this.frameId).contents().find('li');
			li.removeClass( style );

			var i;
			var n = textAnnotations.length;
			var annotation;
			for (i=0; i<n; i++) {
				annotation = textAnnotations[i];
				li.each(function(index, value) {
					if (((index+1) >= annotation.properties.start) && ((index+1) <= annotation.properties.end)) {
						$(value).addClass(style);
						$(value).data('annotation', annotation);
						$(value).on('click', function() {
							var anno = $(this).data('annotation');
							me.currentLine = index + 1;
							me.textIsPlaying = true;
							me.parentView.doInstantUpdate();
							me.highlightLinesForAnnotations( [ anno ], 'highlightDark' );
						});
					}
				});
			}

		}

		/**
		 * Returns the top-most visible annotation.
		 * @return		The annotation object.
		 */
		jQuery.TextObjectView.prototype.getVisibleAnnotation = function() {
			var theWindow = $('#'+this.frameId)[0].contentWindow;
		    var docViewTop = $(theWindow).scrollTop();
		    var docViewBottom = docViewTop + $(theWindow).height();

			var li = $('#'+this.frameId).contents().find('li');
			var result = null;

			var topLineNum = -1;

			var i;
			var n = li.length;
			for (i=0; i<n; i++) {
				var elem = li[i];
			    var elemTop = $(elem).offset().top;
			    var elemBottom = elemTop + $(elem).height();
				if ((elemTop >= docViewTop) && (elemBottom <= docViewBottom)) {
					result = $(elem).data('annotation');
					if (topLineNum == -1) {
						this.currentLine = i + 1;
					}
					if (result) {
						break;
					}
				}
			}

		    return result;
		}

		/**
		 * Scrolls to the given line.
		 *
		 * @param line {Number}		The line number to scroll to.
		 */
		jQuery.TextObjectView.prototype.scrollToLine = function(line) {
			if (this.hasFrameLoaded) {
				var li = $($('#'+this.frameId)[0].contentWindow.document.body).find('li');
				if (li) {
					$('#'+this.frameId).contents().find('html,body').stop().animate({scrollTop: $(li[Math.min(Math.max(0, line-2),li.length-1)]).offset().top},'slow');
				}
			}
		}

		/**
		 * Starts playback of the media.
		 */
		jQuery.TextObjectView.prototype.play = function() {
			if (this.model.seekAnnotation != null) {
				if (!this.justPlayedSeekAnnotation) {
					this.seek(this.model.seekAnnotation.properties.start);
					this.justPlayedSeekAnnotation = true;
				}
			}
			this.textIsPlaying = true;
			this.parentView.doInstantUpdate();
		}

		/**
		 * Pauses playback of the media.
		 */
		jQuery.TextObjectView.prototype.pause = function() {
			this.textIsPlaying = false;
			this.parentView.doInstantUpdate();
		}

		/**
		 * Seeks to the specified location in the media.
		 *
		 * @param {Number} line			Destination line number.
		 */
		jQuery.TextObjectView.prototype.seek = function( line ) {
			this.currentLine = line;
			this.scrollToLine(line);
			var seekAnnotations = [];
			var i, annotation,
				n = this.parentView.annotations.length;
			for ( i = 0; i < n; i++ ) {
				annotation = this.parentView.annotations[ i ];
				if ( ( this.currentLine >= annotation.properties.start ) && ( this.currentLine <= annotation.properties.end ) ) {
					seekAnnotations.push( annotation );
				}
			}
			this.highlightLinesForAnnotations( seekAnnotations, 'highlightDark' );
		}

		/**
		 * Returns the current line in the text.
		 * @return	The current line number.
		 */
		jQuery.TextObjectView.prototype.getCurrentTime = function() {
			return this.currentLine;
		}

		/**
		 * Resizes the media to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the media.
		 * @param {Number} height		The new height of the media.
		 */
		jQuery.TextObjectView.prototype.resize = function(width, height) {
			$('#'+this.frameId).parent().width(width);
			$('#'+this.frameId).parent().height(height);
		}

		/**
		 * Returns true if the media is currently playing.
		 * @return	Returns true if the media is playing.
		 */
		jQuery.TextObjectView.prototype.isPlaying = function(value, player_id) {
			return this.textIsPlaying;
		}

	}

	/**
	 * View for source code.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.SourceCodeObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.hasLoaded = false;					// has the iframe loaded?
		this.isLiquid = true;					// media should expand to fill available space
		this.currentLine = 0;					// user's position in the text
		this.textIsPlaying = false;				// text is 'played' so that we can seek and show live annotations for it
		this.justPlayedSeekAnnotation = false;	// did we just play a text annotation?

		/**
		 * Creates the source code media object.
		 */
		jQuery.SourceCodeObjectView.prototype.createObject = function() {

			var approot = $('link#approot').attr('href');
			var path = this.model.path;

			this.frameId = 'text'+this.model.filename+'_'+this.model.id;

			var queryVars = scalarapi.getQueryVars( path );
			var lang = scalarapi.getFileExtension(me.model.path);
			if ( queryVars.lang != null ) {
				lang = queryVars.lang;
			}

			this.object = $( '<div class="mediaObject"></div>' ).appendTo( this.parentView.mediaContainer );
			var temp = $( '<pre id="' + me.frameId + '" data-src="' + path + '" class="line-numbers" style="width: 100%; height: 100%;"><code></code></pre>' );
			if ( lang != null ) {
				temp.addClass( 'language-' + lang );
			}
			this.object.append( temp );

			this.object.on('click',  function( e ) {

				var i, n, htop, hbottom, highlight,
		            posY = e.pageY - $(this).offset().top,
		            highlights = me.object.find( '.line-highlight' );

		        n = highlights.length;
		        if ( n > 0 ) {
		        	posY -= parseInt( highlights.eq( 0 ).css( 'margin-top' ) );
		        }
	            for ( i = 0; i < n; i++ ) {
	            	highlight = highlights.eq( i );
	            	htop = highlight.position().top + parseInt( highlight.css( 'margin-top' ) );
	            	hbottom = htop + highlight.height();
	            	if (( posY >= htop ) && ( posY <= hbottom )) {
	            		var annotation = me.textAnnotations[ i ];
						me.currentLine = annotation.properties.start;
						highlight.addClass( 'current' );
						me.textIsPlaying = true;
						me.parentView.doInstantUpdate();
						me.highlightSelectedAnnotations( [ annotation ] );
	            	}
	            }

			} )

			me.parentView.intrinsicDim.x = me.parentView.containerDim.x;
			me.parentView.intrinsicDim.y = me.parentView.containerDim.y;

			me.parentView.layoutMediaObject();
			me.parentView.removeLoadingMessage();

			var $pre = this.object.find('pre');
			var $code = $pre.find('code');

			var xhr = new XMLHttpRequest();

			xhr.open('GET', $pre.data('src'), true);

			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {

					if (xhr.status < 400 && xhr.responseText) {
						$code.get(0).textContent = xhr.responseText;
					}
					else if (xhr.status >= 400) {
						$code.get(0).textContent = '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText;
					}
					else {
						$code.get(0).textContent = '✖ Error: File does not exist or is empty';
					}

					me.hasLoaded = true;
		           	me.highlightAnnotatedLines();
			        me.pause();
			        if ((me.model.seekAnnotation != null) && !me.justPlayedSeekAnnotation) {
			            me.parentView.doAutoSeek(me.parentView);
			        }
			        if(typeof pendingScripts=='undefined'){
			        	pendingScripts = 0;
			        }
			        if(--pendingScripts <= 0){
			        	//Do one highlightAll pass after each of the script embeds are loaded - this is because Prism plugins don't seem to run if you just run Prism per element
			        	Prism.highlightAll();
			        }
				}
			};

			xhr.send(null);

			return;
		}

		/**
		 * Highlights all of the annotated lines in the text.
		 */
		jQuery.SourceCodeObjectView.prototype.highlightAnnotatedLines = function() {

			var i, annotation
				n = this.parentView.annotations.length,
				this.textAnnotations = [];
			for ( i=0; i<n; i++ ) {
				annotation = this.parentView.annotations[ i ];
				if ( this.model.mediaSource.contentType == 'document' ) {
					this.textAnnotations.push( annotation );
				}
			}
			if (this.textAnnotations.length > 0) this.highlightLinesForAnnotations( this.textAnnotations );

		}

		/**
		 * Highlights the specified annotation in a darker color.
		 */
		jQuery.SourceCodeObjectView.prototype.highlightSelectedAnnotations = function( annotations ) {
			var i, annotation, index,
				n = this.parentView.annotations.length,
				highlights = this.object.find( '.line-highlight' );
			highlights.removeClass( 'current' );
			for ( i=0; i<n; i++ ) {
				annotation = annotations[ i ];
				index = this.textAnnotations.indexOf( annotation );
				if ( index != -1 ) {
					highlights.eq( index ).addClass( 'current' );
				}
			}
		}

		/**
		 * Highlights the lines of the text associated with the specified annotations.
		 */
		jQuery.SourceCodeObjectView.prototype.highlightLinesForAnnotations = function( textAnnotations ) {

			var i, annotation, j, row,
				n = textAnnotations.length,
				highlightStr = '';

			for ( i=0; i<n; i++ ) {
				annotation = textAnnotations[ i ];
				if ( annotation.properties.start == annotation.properties.end ) {
					highlightStr += annotation.properties.start;
				} else {
					highlightStr += annotation.properties.start + '-' + annotation.properties.end;
				}
				if ( i < ( n - 1 ) ) {
					highlightStr += ',';
				}
			}

			var e = this.object.find( 'pre' );
			e.attr( 'data-line', highlightStr );

		}

		/**
		 * Scrolls to the given line.
		 *
		 * @param line {Number}		The line number to scroll to.
		 */
		jQuery.SourceCodeObjectView.prototype.scrollToLine = function(line) {
			if ( this.hasLoaded ) {
				var rows = $( '#'+this.frameId ).find( '.line-numbers-rows > span' );
				if ( rows.length > 0 ) {
					$( '#'+this.frameId ).stop().animate( { scrollTop: $( rows[ Math.min( Math.max( 0, line - 1 ), rows.length - 1 ) ] ).position().top },'slow');
				}
			}
		}

		/**
		 * Starts playback of the media.
		 */
		jQuery.SourceCodeObjectView.prototype.play = function() {
			if (this.model.seekAnnotation != null) {
				if (!this.justPlayedSeekAnnotation) {
					this.seek(this.model.seekAnnotation.properties.start);
					this.justPlayedSeekAnnotation = true;
				}
			}
			this.textIsPlaying = true;
			this.parentView.doInstantUpdate();
		}

		/**
		 * Pauses playback of the media.
		 */
		jQuery.SourceCodeObjectView.prototype.pause = function() {
			this.textIsPlaying = false;
			this.parentView.doInstantUpdate();
		}

		/**
		 * Seeks to the specified location in the media.
		 *
		 * @param {Number} line			Destination line number.
		 */
		jQuery.SourceCodeObjectView.prototype.seek = function( line ) {
			this.currentLine = line;
			this.scrollToLine(line);
			var seekAnnotations = [];
			var i, annotation,
				n = this.parentView.annotations.length;
			for ( i = 0; i < n; i++ ) {
				annotation = this.parentView.annotations[ i ];
				if ( ( this.currentLine >= annotation.properties.start ) && ( this.currentLine <= annotation.properties.end ) ) {
					seekAnnotations.push( annotation );
				}
			}
			this.highlightSelectedAnnotations( seekAnnotations );
		}

		/**
		 * Returns the current line in the text.
		 * @return	The current line number.
		 */
		jQuery.SourceCodeObjectView.prototype.getCurrentTime = function() {
			return this.currentLine;
		}

		/**
		 * Resizes the media to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the media.
		 * @param {Number} height		The new height of the media.
		 */
		jQuery.SourceCodeObjectView.prototype.resize = function(width, height) {
			$('#'+this.frameId).parent().width(width);
			$('#'+this.frameId).parent().height(height);
		}

		/**
		 * Returns true if the media is currently playing.
		 * @return	Returns true if the media is playing.
		 */
		jQuery.SourceCodeObjectView.prototype.isPlaying = function(value, player_id) {
			return this.textIsPlaying;
		}

	}

	/**
	 * View for rendered HTML content.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.HTMLObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.hasFrameLoaded = false;			// has the iframe loaded yet?
		this.isLiquid = true;					// media will expand to fill available space

		/**
		 * Creates the video media object.
		 */
		jQuery.HTMLObjectView.prototype.createObject = function() {

			var approot = $('link#approot').attr('href');

			this.frameId = 'html'+this.model.filename+'_'+this.model.id;

			var obj = $('<div class="mediaObject" style="overflow: hidden"><div><iframe style="width: 100%; height: 100%;" id="'+this.frameId+'" src="'+this.model.path+'" frameborder="0"></iframe></div></div>').appendTo(this.parentView.mediaContainer);

			// these styles enable momentum scrolling of iframes for mobile devices;
			// if added for desktop browsers they cause double scrollbars
			if (( scalarapi.scalarBrowser == 'MobileSafari' ) || ( scalarapi.scalarBrowser == 'Android' )) {
				obj.find( 'div' ).css( {
					"-webkit-overflow-scrolling": "touch",
					"overflow-y": "scroll"
				})
			}

			this.frame = obj.find('#'+this.frameId)[0];

			$(this.frame).on("load", function () {
			   	me.hasFrameLoaded = true;
			});

			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

			$(this.parentView.mediaContainer).parent().find('#viewPageLink').show();

			return;
		}

		// These functions are basically irrelevant for HTML pages
		jQuery.HTMLObjectView.prototype.play = function() { }
		jQuery.HTMLObjectView.prototype.pause = function() { }
		jQuery.HTMLObjectView.prototype.seek = function(time) { }
		jQuery.HTMLObjectView.prototype.getCurrentTime = function() { }
		jQuery.HTMLObjectView.prototype.isPlaying = function(value, player_id) { return null; }

		/**
		 * Resizes the media to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the media.
		 * @param {Number} height		The new height of the media.
		 */
		jQuery.HTMLObjectView.prototype.resize = function(width, height) {
			$('#'+this.frameId).parent().width(width);
			$('#'+this.frameId).parent().height(height);
		}

	}

	/**
	 * View for PDF documents.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.PDFObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.isLiquid = true;					// media will expand to fill available space

		/**
		 * Creates the video media object.
		 */
		jQuery.PDFObjectView.prototype.createObject = function() {

			var approot = $('link#approot').attr('href');

			this.frameId = 'pdf'+this.model.filename+'_'+this.model.id;

      var obj = $('<div class="mediaObject"><iframe style="width: 100%; height: 100%;" id="'+this.frameId+'" src="'+this.model.path+'"></iframe></div>').appendTo(this.parentView.mediaContainer);
			this.frame = obj.find('#'+this.frameId)[0];

			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

			$(this.parentView.mediaContainer).parent().find('#viewPageLink').show();

			return;
		}

		// These functions are basically irrelevant for PDFs
		jQuery.PDFObjectView.prototype.play = function() { }
		jQuery.PDFObjectView.prototype.pause = function() { }
		jQuery.PDFObjectView.prototype.seek = function(time) { }
		jQuery.PDFObjectView.prototype.getCurrentTime = function() { }
		jQuery.PDFObjectView.prototype.isPlaying = function(value, player_id) { return null; }

		/**
		 * Resizes the media to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the media.
		 * @param {Number} height		The new height of the media.
		 */
		jQuery.PDFObjectView.prototype.resize = function(width, height) {
			$('#'+this.frameId).parent().width(width);
			$('#'+this.frameId).parent().height(height);
		}

	}

	/**
	 * View for Prezi content.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.PreziObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.isLiquid = true;					// media will expand to fill available space

		/**
		 * Creates the media object.
		 */
		jQuery.PreziObjectView.prototype.createObject = function() {

			var approot = $('link#approot').attr('href');

			this.frameId = 'prezi'+this.model.filename+'_'+this.model.id;

			var obj = $('<div class="mediaObject"><iframe id="'+this.frameId+'" src="'+this.model.path+'?bgcolor=ffffff&amp;lock_to_path=0&amp;autoplay=no&amp;autohide_ctrls=0" width="100%" height="100%" frameBorder="0"></iframe></div>').appendTo(this.parentView.mediaContainer);
			this.frame = obj.find('#'+this.frameId)[0];

			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

			return;
		}

		// These functions are basically irrelevant for Prezis
		jQuery.PreziObjectView.prototype.play = function() { }
		jQuery.PreziObjectView.prototype.pause = function() { }
		jQuery.PreziObjectView.prototype.seek = function(time) { }
		jQuery.PreziObjectView.prototype.getCurrentTime = function() { }
		jQuery.PreziObjectView.prototype.isPlaying = function(value, player_id) { return null; }

		/**
		 * Resizes the media to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the media.
		 * @param {Number} height		The new height of the media.
		 */
		jQuery.PreziObjectView.prototype.resize = function(width, height) {
			$('#'+this.frameId).parent().width(width);
			$('#'+this.frameId).parent().height(height);
		}

	}

	/**
	 * View for unsupported media content.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.UnsupportedObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element

		/**
		 * Creates the video media object.
		 */
		jQuery.UnsupportedObjectView.prototype.createObject = function() {

			$('<div class="mediaelement_warning">This type of media is unsupported, either by your current browser or by Scalar.</div>').appendTo(this.parentView.mediaContainer);

			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

			return;
		}

		// Irrelevant functions for unsupported media
		jQuery.UnsupportedObjectView.prototype.play = function() { }
		jQuery.UnsupportedObjectView.prototype.pause = function() { }
		jQuery.UnsupportedObjectView.prototype.seek = function(time) { }
		jQuery.UnsupportedObjectView.prototype.getCurrentTime = function() { }
		jQuery.UnsupportedObjectView.prototype.isPlaying = function(value, player_id) { return null; }

		/**
		 * Resizes the media to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the media.
		 * @param {Number} height		The new height of the media.
		 */
		jQuery.UnsupportedObjectView.prototype.resize = function(width, height) {
			$(this.parentView.mediaContainer).find('.mediaelement_warning').width(width);
			$(this.parentView.mediaContainer).find('.mediaelement_warning').height(height);
		}


	}

	/**
	 * View for the SoundCloud audio player.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.SoundCloudAudioObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.isAudioPlaying = false;			// is audio currently playing?
		this.currentTime = 0;					// current position in the audio file
		this.isLiquid = true;					// media will expand to fill available space
		this.initialPauseDone = false;			// media must be played briefly for some functions to be available; has it subsequently been paused?
		this.widget = null;						// SoundClound widget
		this.cachedSeekTime = null;				// internal storage of last seek request
		this.wasPlayingBeforeSeek = false;		// was the audio playing before we tried to seek?

		/**
		 * Creates the media object.
		 */
		jQuery.SoundCloudAudioObjectView.prototype.createObject = function() {
			me.mediaObject = $('<div class="mediaObject"><div id="soundcloud'+me.model.filename+'_'+me.model.id+'"></div></div>').appendTo(this.parentView.mediaContainer);
			SC.oEmbed(this.model.path, {auto_play: true, download: true,show_comments:false,liking:false,buying:false,hide_related:true}).then(function(oembed){
        if ( oembed != null ) {
					oembed.height = me.parentView.resizedDim.y;
					me.parentView.controllerHeight = oembed.height;
					$(oembed.html).css('height',oembed.height).appendTo(me.mediaObject.children()[0]);
					me.widget = SC.Widget($(me.mediaObject).find('iframe')[0]);
					// All Sound Cloud Event listeners are extremely unreliable when triggered programatically.
					// This motivates the code below as any attempt to exercise fine tuned control over the order
					// of events is unadvisable
					me.widget.bind(SC.Widget.Events.READY, function() {
						me.widget.isPaused(function() {
							if(!me.initialPauseDone) {
								if ( !me.model.options.autoplay ) {
									me.widget.pause();
								}
								me.initialPauseDone = true;
							}
						});
					});
					me.widget.bind(SC.Widget.Events.PLAY, function() {
						if(me.initialPauseDone) {
		 					me.parentView.startTimer();
							me.isAudioPlaying = true;
						}
					});
					me.widget.bind(SC.Widget.Events.PAUSE, function() {
						if(me.initialPauseDone) {
							me.parentView.endTimer();
							me.isAudioPlaying = false;
						}
					});
					me.widget.bind(SC.Widget.Events.FINISH, function() {
						me.parentView.endTimer();
						me.isAudioPlaying = false;
					});
					me.widget.bind(SC.Widget.Events.PLAY_PROGRESS, function(e) {
						me.currentTime = e.currentPosition / 1000.0;
					});
					me.parentView.removeLoadingMessage();
				}
			});

			this.parentView.controllerOnly = true;
			this.parentView.controllerHeight = 166;

			this.parentView.intrinsicDim.x = this.parentView.containerDim.x;
			this.parentView.intrinsicDim.y = this.parentView.containerDim.y;

			this.parentView.calculateContainerSize();
			this.parentView.layoutMediaObject();

			return;
		}

		/**
		 * Starts playback of the media.
		 */
		jQuery.SoundCloudAudioObjectView.prototype.play = function() {
			me.widget.setVolume(100);
			if ((this.model.seekAnnotation != null) && (!this.parentView.overrideAutoSeek)) {
				if (!this.isAudioPlaying) {
					this.widget.play();
				}
				this.wasPlayingBeforeSeek = true;
				this.cachedSeekTime = this.model.seekAnnotation.properties.start * 1000;
			} else {
				if (!this.isAudioPlaying) {
					this.widget.play();
				}
			}
		}

		/**
		 * Pauses playback of the media.
		 */
		jQuery.SoundCloudAudioObjectView.prototype.pause = function() {
			this.widget.pause();
		}

		/**
		 * Seeks to the specified location in the media.
		 *
		 * @param {Number} time			Seek location in seconds.
		 */
		jQuery.SoundCloudAudioObjectView.prototype.seek = function(time) {
				this.widget.seekTo(time * 1000);
				this.currentTime = time;
		}

		/**
		 * Returns the current playback position of the media.
		 * @return	The current playback position in seconds.
		 */
		jQuery.SoundCloudAudioObjectView.prototype.getCurrentTime = function() {
			return this.currentTime;
		}

		/**
		 * Resizes the media to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the media.
		 * @param {Number} height		The new height of the media.
		 */
		jQuery.SoundCloudAudioObjectView.prototype.resize = function(width, height) {
			var theElement = $('#soundcloud'+this.model.filename+'_'+this.model.id);
			if (theElement) {
				$(theElement).width(width);
				$(theElement).height(height);
			}
		}

		/**
		 * Returns true if the video is currently playing.
		 * @return	Returns true if the media is playing.
		 */
		jQuery.SoundCloudAudioObjectView.prototype.isPlaying = function() {
			return this.isAudioPlaying;
		}

	}

	/**
	 * View for Google Maps content.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.GoogleMapsObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.isLiquid = true;					// media will expand to fill available space

		/**
		 * Creates the video media object.
		 */
		jQuery.GoogleMapsObjectView.prototype.createObject = function() {

			var approot = $('link#approot').attr('href');

			this.mediaObject = $('<div class="mediaObject" id="googlemaps'+me.model.id+'"></div>').appendTo(this.parentView.mediaContainer);

			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

			var mapOptions = {
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}
			var map = new google.maps.Map(document.getElementById('googlemaps'+me.model.id), mapOptions);
			var kmlLayer = new google.maps.KmlLayer(this.model.path);
			kmlLayer.setMap(map);

			return;
		}

		// These functions are basically irrelevant for HTML pages
		jQuery.GoogleMapsObjectView.prototype.play = function() { }
		jQuery.GoogleMapsObjectView.prototype.pause = function() { }
		jQuery.GoogleMapsObjectView.prototype.seek = function(time) { }
		jQuery.GoogleMapsObjectView.prototype.getCurrentTime = function() { }
		jQuery.GoogleMapsObjectView.prototype.isPlaying = function(value, player_id) { return null; }

		/**
		 * Resizes the media to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the media.
		 * @param {Number} height		The new height of the media.
		 */
		jQuery.GoogleMapsObjectView.prototype.resize = function(width, height) {
			$('#googlemaps'+me.model.id).width(Math.round(width));
			$('#googlemaps'+me.model.id).height(Math.round(height));
		}

	}

	/**
	 * View for Deep Zoom Image content.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.DeepZoomImageObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.isLiquid = true;					// media will expand to fill available space

		/**
		 * Creates the video media object.
		 */
		jQuery.DeepZoomImageObjectView.prototype.createObject = function() {

			var approot = $('link#approot').attr('href');
			var path = this.model.path;

			this.mediaObject = $( '<div class="mediaObject" style="background-color:black;" id="openseadragon' + this.model.id + '"></div>' ).appendTo( this.parentView.mediaContainer );

			this.viewer = OpenSeadragon( {
				id: "openseadragon" + this.model.id,
				prefixUrl: approot + "views/widgets/mediaelement/openseadragon/images/",
				showNavigator: true,
        navigationControlAnchor: OpenSeadragon.ControlAnchor.BOTTOM_RIGHT,
				tileSources: path
			} );

			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

			return;
		}

		// These functions are basically irrelevant for this type of media
		jQuery.DeepZoomImageObjectView.prototype.play = function() { }
		jQuery.DeepZoomImageObjectView.prototype.pause = function() { }
		jQuery.DeepZoomImageObjectView.prototype.seek = function(time) { }
		jQuery.DeepZoomImageObjectView.prototype.getCurrentTime = function() { }
		jQuery.DeepZoomImageObjectView.prototype.isPlaying = function(value, player_id) { return null; }

		/**
		 * Resizes the media to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the media.
		 * @param {Number} height		The new height of the media.
		 */
		jQuery.DeepZoomImageObjectView.prototype.resize = function(width, height) {
			$('#openseadragon'+me.model.id).width(Math.round(width));
			$('#openseadragon'+me.model.id).height(Math.round(height));
		}

	}

        /**
	 * View for IIIF manifest (Mirador) content.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.MiradorObjectView = function(model, parentView) {

		var me = this;
		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.isLiquid = true;					// media will expand to fill available space

		/**
		 * Creates the video media object.
		 */
		jQuery.MiradorObjectView.prototype.createObject = function() {

			this.mediaObject = $( `<div class="mediaObject" id="mirador-${me.model.id}"></div>`).appendTo( this.parentView.mediaContainer );

            var miradorInstance = Mirador.viewer({
                id: `mirador-${me.model.id}`,
                windows: [{ manifestId: this.model.node.current.sourceFile }]
            });

			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();
			// make sure mirador doesn't overflow its bounds
			$('.mirador-viewer', this.mediaObject).css('max-height', $(this.parentView.mediaContainer).css('max-height'));

			return;
		}

		// These functions are basically irrelevant for this type of media
		jQuery.MiradorObjectView.prototype.play = function() { }
		jQuery.MiradorObjectView.prototype.pause = function() { }
		jQuery.MiradorObjectView.prototype.seek = function(time) { }
		jQuery.MiradorObjectView.prototype.getCurrentTime = function() { }
		jQuery.MiradorObjectView.prototype.isPlaying = function(value, player_id) { return null; }

		/**
		 * Resizes the media to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the media.
		 * @param {Number} height		The new height of the media.
		 */
		jQuery.MiradorObjectView.prototype.resize = function(width, height) {
			$(`#mirador-${me.model.id}`).width(Math.round(width));
			$(`#mirador-${me.model.id}`).height(Math.round(height));
		}

	}

	/**
	 * View for Threejs content.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.ThreejsObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.isLiquid = true;					// media will expand to fill available space

		/**
		 * Creates the media object.
		 */
		jQuery.ThreejsObjectView.prototype.createObject = function() {

			this.mediaObject = $( '<div class="mediaObject" id="threejs'+me.model.id+'"></div>' ).appendTo( this.parentView.mediaContainer );

			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

			var params = {};
			if (this.model.node.current.auxProperties["dcterms:spatial"] != null) {
				params = JSON.parse(unescape(this.model.node.current.auxProperties["dcterms:spatial"][0]));
			}

			this.camera = new THREE.PerspectiveCamera(60, this.mediaObject.width() / this.mediaObject.height(), 1, 1000);
			this.camera.position.z = 10;

			/*if (params.camera != null) {
				if (params.camera.fov != null) this.camera.setFocalLength(params.camera.fov);
				if (params.camera.position != null) {
					this.camera.position.fromArray(params.camera.position);
				}
				if (params.camera.rotation != null) {
					this.camera.rotation.fromArray(this.degreesArrayToRadians(params.camera.rotation));
				}
			}*/

			this.controls = new THREE.TrackballControls(this.camera, this.mediaObject[0]);
			this.controls.addEventListener('change', function() {
				me.renderer.render(me.scene, me.camera);
			});

			this.scene = new THREE.Scene();

			var loader = new THREE.STLLoader();
			loader.load(this.model.path, function(geometry) {
				var material = new THREE.MeshLambertMaterial({color:0xffffff, shading: THREE.FlatShading});
				var mesh = new THREE.Mesh(geometry, material);
				me.scene.add(mesh);
				if (params.model != null) {
					if (params.model.position != null) {
						mesh.position.fromArray(params.model.position);
					}
					if (params.model.rotation != null) {
						mesh.rotation.fromArray(me.degreesArrayToRadians(params.model.rotation));
					}
					if (params.model.scale != null) {
						mesh.scale.fromArray(params.model.scale);
					}
				}
				me.renderer.render(me.scene, me.camera);
			});

			var light = new THREE.DirectionalLight(0xffffff);
			light.position.set(1, 1, 1);
			this.scene.add(light);

			light = new THREE.DirectionalLight(0x2069a8);
			light.position.set(-1, -1, -1);
			this.scene.add(light);

			light = new THREE.AmbientLight(0x222222);
			this.scene.add(light);

			this.renderer = new THREE.WebGLRenderer({antialias: false});
			this.renderer.setClearColor(0x444444, 1);
			this.renderer.setSize(this.mediaObject.width(), this.mediaObject.height());

			this.mediaObject.append(this.renderer.domElement);

			this.animate = function animate() {
				requestAnimationFrame(me.animate);
				me.controls.update();
			}

			this.renderer.render(this.scene, this.camera);
			this.animate();

			return;
		}

		// These functions are basically irrelevant for this type of media
		jQuery.ThreejsObjectView.prototype.play = function() { }
		jQuery.ThreejsObjectView.prototype.pause = function() { }
		jQuery.ThreejsObjectView.prototype.seek = function(time) { }
		jQuery.ThreejsObjectView.prototype.getCurrentTime = function() { }
		jQuery.ThreejsObjectView.prototype.isPlaying = function(value, player_id) { return null; }

		/**
		 * Resizes the media to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the media.
		 * @param {Number} height		The new height of the media.
		 */
		jQuery.ThreejsObjectView.prototype.resize = function(width, height) {
			$('#threejs'+me.model.id).width(Math.round(width));
			$('#threejs'+me.model.id).height(Math.round(height));
		}

		jQuery.ThreejsObjectView.prototype.degreesArrayToRadians = function(degArray) {
			return [this.degreesToRadians(degArray[0]),this.degreesToRadians(degArray[1]),this.degreesToRadians(degArray[2])]
		}

		jQuery.ThreejsObjectView.prototype.degreesToRadians = function(degrees) {
			return (degrees / 360.0) * (Math.PI * 2);
		}

	}

	/**
	 * View for culturally sensitive content.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.CulturallySensitiveObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.isLiquid = true;					// media will expand to fill available space

		/**
		 * Creates the media object.
		 */
		jQuery.CulturallySensitiveObjectView.prototype.createObject = function() {

			this.mediaObject = $( '<div class="mediaObject culturally-sensitive" id="culturallysensitive'+me.model.id+'">'+
				'<img src="' + this.model.mediaelement_dir + 'culturallysensitive_icon.png" height="105"/>'+
				'<div><span class="warning"><strong>Protected: Respecting Cultural Protocols</strong><br/></span><span class="explanation">Information about this item can be shared publicly, but the media itself cannot be made publicly available, in accordance with cultural values, beliefs, or protocols that define its access and use. Learn more about appropriate ways of interacting with Indigenous cultural heritage materials and the labels used in this publication <a href="#">here</a>.</div>'+
			'</span></div>' ).appendTo( this.parentView.mediaContainer );

			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

			return;
		}

		// These functions are basically irrelevant for this type of media
		jQuery.CulturallySensitiveObjectView.prototype.play = function() { }
		jQuery.CulturallySensitiveObjectView.prototype.pause = function() { }
		jQuery.CulturallySensitiveObjectView.prototype.seek = function(time) { }
		jQuery.CulturallySensitiveObjectView.prototype.getCurrentTime = function() { }
		jQuery.CulturallySensitiveObjectView.prototype.isPlaying = function(value, player_id) { return null; }

		/**
		 * Resizes the media to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the media.
		 * @param {Number} height		The new height of the media.
		 */
		jQuery.CulturallySensitiveObjectView.prototype.resize = function(width, height) {
			$('#culturallysensitive'+me.model.id).width(Math.round(width));
			$('#culturallysensitive'+me.model.id).height(Math.round(height));
			console.log(width+' '+height);
			var theElement = document.getElementById('culturallysensitive'+this.model.id);
			if (theElement) {
				if (width < 320) {
					$(theElement).addClass('small');
				} else {
					$(theElement).removeClass('small');
				}
			}
		}

	}

  /**
	 * View for rendered HTML content.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.UnityWebGLObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.hasFrameLoaded = false;			// has the iframe loaded yet?
		this.isLiquid = true;					// media will expand to fill available space

		/**
		 * Creates the video media object.
		 */
		jQuery.UnityWebGLObjectView.prototype.createObject = function() {

			var approot = $('link#approot').attr('href');
			this.frameId = 'html'+this.model.filename+'_'+this.model.id;
			var obj = $('<div class="mediaObject" style="overflow: hidden"><div><iframe style="width: 100%; height: 100%;" id="'+this.frameId+'" src="'+this.model.path+'" frameborder="0"></iframe></div></div>').appendTo(this.parentView.mediaContainer);
			this.frame = obj.find('#'+this.frameId)[0];

			$(this.frame).bind("load", function () {
			   	me.hasFrameLoaded = true;
          me.receiver = this.contentWindow;
			});

			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

			$(this.parentView.mediaContainer).parent().find('#viewPageLink').show();

			return;
		}

		// These functions are basically irrelevant for this type of media
		jQuery.UnityWebGLObjectView.prototype.play = function() { }
		jQuery.UnityWebGLObjectView.prototype.pause = function() { }
		jQuery.UnityWebGLObjectView.prototype.getCurrentTime = function() { }
		jQuery.UnityWebGLObjectView.prototype.getPosition3D = function() {
      this.receiver.postMessage({
        "objectName": "ScalarCamera",
        "methodName": "GetTransform",
        "message": null
      });
    }
		jQuery.UnityWebGLObjectView.prototype.isPlaying = function(value, player_id) { return null; }

    jQuery.UnityWebGLObjectView.prototype.seek = function(point_3d) {
      this.receiver.postMessage({
        "objectName": "ScalarCamera",
        "methodName": "SetTransform",
        "message": point_3d
      });
    }

    jQuery.UnityWebGLObjectView.prototype.sendMessage = function(message) {
      this.receiver.postMessage({
        "objectName": "ScalarCamera",
        "methodName": "HandleMessage",
        "message": message
      });
    }

    jQuery.UnityWebGLObjectView.prototype.handleAnnotationsUpdated = function(slugs) {
      console.log('handleAnnotationsUpdated');
      this.receiver.postMessage({
        "objectName": "ScalarCamera",
        "methodName": "HandleAnnotationsUpdated",
        "message": slugs
      });
    }

		/**
		 * Resizes the media to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the media.
		 * @param {Number} height		The new height of the media.
		 */
		jQuery.UnityWebGLObjectView.prototype.resize = function(width, height) {
			$('#'+this.frameId).parent().width(width);
			$('#'+this.frameId).parent().height(height);
		}

	}

}) (jQuery);
