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
 * @version					1.0
 */

var mediaElementUniqueID = 0;
var jPlayerUniqueID = 1;
var youTubeMediaElementViews = [];
var soundCloudInitialized = false;

// Removes whitespace from the ends of a string. Source: http://www.somacon.com/p355.php
String.prototype.trim = function() {
	return this.replace(/^s+|s+$/g,"");
}

/**
 * Called by the Flash video player. Starts the timer on the appropriate media element instance
 * when Flash video playback begins.
 *
 * @param data {Object}		Incoming data from Flash.
 */
function handleFlashVideoPlay(data) {

	var flashData = data;

	// look for a link referencing the mediaelement instance we want
	$('a').each(function() {

		// look for maximized mediaelements (they get 'cloned' so as not to conflict with their non-maximized versions)
		if ($(this).data('clone')) {
			var clone = $(this).data('clone');
			if (clone.data('mediaelement').model.id == flashData.id) {
				clone.data('mediaelement').view.startTimer();
			}

		// look for conventional mediaelements
		} else if ($(this).data('mediaelement')) {
			if ($(this).data('mediaelement').model.id == flashData.id) {
				$(this).data('mediaelement').view.startTimer();
			}
		}
	});
}

/**
 * Called by the Flash video player. Stops the timer on the appropriate media element instance
 * when Flash video playback stops.
 *
 * @param data {Object}		Incoming data from Flash.
 */
function handleFlashVideoStop(data) {

	var flashData = data;

	// look for a link referencing the mediaelement instance we want
	$('a').each(function() {

		// look for maximized mediaelements (they get 'cloned' so as not to conflict with their non-maximized versions)
		if ($(this).data('clone')) {
			var clone = $(this).data('clone');
			if (clone.data('mediaelement').model.id == flashData.id) {
				clone.data('mediaelement').view.startTimer();
			}

		// look for conventional mediaelements
		} else if ($(this).data('mediaelement')) {
			if ($(this).data('mediaelement').model.id == flashData.id) {
				$(this).data('mediaelement').view.endTimer();
			}
		}
	});
}

/**
 * Called by the Flash video player. Resizes the video to the proper dimensions.
 */
function handleFlashVideoMetadata(data) {

	var flashData = data;

	// look for a link referencing the mediaelement instance we want
	$('a').each(function() {

		// look for maximized mediaelements (they get 'cloned' so as not to conflict with their non-maximized versions)
		if ($(this).data('clone')) {
			var clone = $(this).data('clone');
			if (clone.data('mediaelement').model.id == flashData.id) {
				clone.data('mediaelement').view.mediaObjectView.handleMetadata(flashData);
			}

		// look for conventional mediaelements
		} else if ($(this).data('mediaelement')) {
			if ($(this).data('mediaelement').model.id == flashData.id) {
				$(this).data('mediaelement').view.mediaObjectView.handleMetadata(flashData);
			}
		}
	});
}

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
		this.model.jPlayerId = jPlayerUniqueID++;										// unique ids for jPlayers (they have their own counting scheme)

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
			// images always return isPlaying = true, so when an annotation link is clicked it will
			// always try to "pause" the image; here we intercept those calls and show the image annotation instead
			if (this.model.mediaSource.contentType == 'image') {
				var annotationNode = scalarapi.model.nodesByURL[this.model.options.seek];
				if (annotationNode != undefined) {
					var annotations = annotationNode.getRelations('annotation', 'outgoing', 'index');
					var i;
					var n = annotations.length;
					for (i=0; i<n; i++) {
						if (this.model.node == annotations[i].target) {
							this.view.seek(annotations[i]);
							break;
						}
					}
				}
			}
			this.view.pause();
		}

		/**
		 * Seeks to a given time position within a piece of time-based media.
		 *
		 * @param {Object} data			Data representing the seek point.
		 */
		this.seek = function(data) {
			// if the data has a url property, then we assume it's an annotation node that could represent
			// either a temporal or a spatial annotation
			if ( data != null ) {
				if (data.properties) {
					this.view.seek(data);
				// otherwise, we assume its a number or string representing the start time of a temporal annotation
				} else {
					this.view.mediaObjectView.seek(data);
				}
			}
		}

		/**
		 * For time-based media, returns the current playback time.
		 * @return	Returns the current playback time for temporal media in seconds.
		 */
		this.getCurrentTime = function() {
			return this.view.getCurrentTime();
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

			// Scalar url for the media
			this.meta = this.link.data('meta');
			this.meta = (this.meta.indexOf('://')==-1) ? scalarapi.model.urlPrefix + this.meta : this.meta;

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
			if ( this.model.options.getRelated ) {
				// get all relationships
				if (scalarapi.loadPage(this.model.meta.substr(scalarapi.model.urlPrefix.length), true, this.handleMetadata, null, 1, true) == 'loaded') this.handleMetadata();
			} else {
				// get annotations only
				if (scalarapi.loadPage(this.model.meta.substr(scalarapi.model.urlPrefix.length), true, this.handleMetadata, null, 1, false, 'annotation') == 'loaded') this.handleMetadata();
			}
		}

		/**
		 * Handles metadata load.
		 *
		 * @param {Object} json		JSON data comprising the media metadata.
		 */
		jQuery.MediaElementController.prototype.handleMetadata = function(json) {

			me.model.node = scalarapi.model.nodesByURL[me.model.meta];

			if ( me.model.node != null ) {
				me.model.mediaSource = me.model.node.current.mediaSource;
				me.view.beginSetup();

				// don't parse annotations if this is an image and we're in the annotation editor (in that case, the annotation editor
				// will take care of displaying the annotations)
				if ((me.model.mediaSource.contentType != 'image') || (document.location.href.indexOf('.annotation_editor') == -1)) {
					me.view.parseAnnotations();
				}

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

			this.parseMediaType();

			this.header = $('<div class="mediaElementHeader"></div>').appendTo(this.model.element);
  			this.annotationSidebar = $('<div class="mediaElementAnnotationSidebar"></div>').appendTo(this.model.element);
  			this.mediaContainer = $('<div class="mediaContainer"></div>').appendTo(this.model.element);
  			if (this.model.mediaSource.name == "image") this.spatialAnnotation = $('<div class="spatialAnnotation"><div></div></div>').appendTo(this.mediaContainer);
  			this.footer = $('<div class="mediaElementFooter"></div>').appendTo(this.model.element);

 			this.initialContainerWidth = parseInt(this.mediaContainer.width());

			this.populateHeader();
   			this.populateFooter();

  			this.calculateContainerSize();

  			this.populateSidebar();
			this.populateContainer();

			if ('undefined'!=typeof(this.mediaObjectView)) {

				// Native YouTube player requires that we download API code first
				if (this.model.mediaSource.name == "YouTube") {

					// check to see if another mediaelement instance has already downloaded the API
					this.foundYouTubeAPI = false;
					$('script').each(
						function() {
							if (this.src.indexOf('www.youtube.com') != -1) {
								me.foundYouTubeAPI = true;
							}
						}
					);

					// if not, then do so, delay creation of the media object, and create function which
					// will create all the YouTube instances once the API is ready
					if (!this.foundYouTubeAPI) {
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

				// intialize the SoundCloud API if we haven't already
				} else if (this.model.mediaSource.name == 'SoundCloud') {

					if (!soundCloudInitialized) {
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
					this.header.find('#max_file_button').click(function() {
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
					this.header.find('#max_desc_button').click(function() {
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
					this.header.find('#max_anno_button').click(function() {
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
					this.header.find('#max_meta_button').click(function() {
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
					this.header.find('#max_perm_button').data('meta',this.model.meta).click(function() {
						window.location.href = $(this).data('meta');
					});

					// Source button: open the file in a new browser window
					this.header.find('#max_popout_button').data('path',this.model.path).click(function() {
						window.open($(this).data('path'), 'popout', 'width='+(parseInt($(window).width())-100)+',height='+(parseInt($(window).height())-100));
					});

					// Close button: close the maximize panel
					var close_link = $('<a alt="Close" href="javascript:;">&nbsp;</a>');
					var close_span = $('<span class="close_link"></span>');
					close_span.append(close_link);
					this.header.append(close_span);
					close_link.click(function() {
						$(this).parents('.maximize').remove();
						$('.vert_slots').find('.slot').find('object, embed').css('visibility','visible');
					});
					$slot.find('.mediaElementAlignRight').remove();

					// makes the description tab the default on open
					this.header.find('#max_desc_button').click();

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
						this.annotationLink.click(function() {
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
				if (this.model.options.header != 'nav_bar') {
					this.mediaContainer.css('max-width', this.containerDim.x);
				}
				break;

				case "vertical":
				this.mediaContainer.css('max-height', this.containerDim.y);
 				break;

			}

			if ((this.model.mediaSource.contentType == 'image') && (this.model.mediaSource.browserSupport[scalarapi.scalarBrowser].player == 'native') && (this.mediaObjectView.annotations != null)) {
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
					maximizeButton.find('a#viewPageLink').data('me', this).click(function() {
						var $this = $(this);
						var base_dir = scalarapi.model.urlPrefix;
						var path = $this.data('me').model.path;
						var link = path;
						if ($this.data('me').model.node.current.sourceLocation != null) link = $this.data('me').model.node.current.sourceLocation;
						document.location.href = base_dir+'external?link='+encodeURIComponent(link)+'&prev='+encodeURIComponent(document.location.href);
					});

					// maximize link (now called 'Details' in the interface)
					maximizeButton.find('a#maximizeLink').data('link', this.link).data('me', this).click(function() {
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

				switch (this.model.mediaSource.contentType) {

					case 'image':
					if (this.model.mediaSource.browserSupport[scalarapi.scalarBrowser].player == 'QuickTime') {
						this.mediaObjectView = new $.QuickTimeObjectView(this.model, this);
					} else {
						this.mediaObjectView = new $.ImageObjectView(this.model, this);
					}
					break;

					case 'tiledImage':
					this.mediaObjectView = new $.DeepZoomImageObjectView(this.model, this);
					break;

					case 'audio':
					if (this.model.mediaSource.name == 'SoundCloud') {
						this.mediaObjectView = new $.SoundCloudAudioObjectView(this.model, this);
					} else if (this.model.mediaSource.browserSupport[scalarapi.scalarBrowser].player == 'QuickTime') {
						this.mediaObjectView = new $.QuickTimeObjectView(this.model, this);
					} else if (this.model.mediaSource.browserSupport[scalarapi.scalarBrowser].player == 'native') {
						this.mediaObjectView = new $.HTML5AudioObjectView(this.model, this);
					} else if (this.model.mediaSource.browserSupport[scalarapi.scalarBrowser].player == 'jPlayer') {
						this.mediaObjectView = new $.JPlayerAudioObjectView(this.model, this);
					}
					break;

					case 'video':
					switch (this.model.mediaSource.browserSupport[scalarapi.scalarBrowser].player) {

						case 'QuickTime':
						if (this.model.mediaSource.name == 'QuickTimeStreaming') {
							this.mediaObjectView = new $.StreamingQuickTimeObjectView(this.model, this);
						} else {
							this.mediaObjectView = new $.QuickTimeObjectView(this.model, this);
						}
						break;

						case 'Flash':
						this.mediaObjectView = new $.FlowplayerVideoObjectView(this.model, this);
						break;

						case 'native':
						this.mediaObjectView = new $.HTML5VideoObjectView(this.model, this);
						break;

						case 'proprietary':
						switch (this.model.mediaSource.name) {

							case 'HIDVL':
							this.mediaObjectView = new $.HemisphericInstituteVideoObjectView(this.model, this);
							break;

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
					switch (this.model.mediaSource.contentType) {

						case 'audio':
						if (this.model.mediaSource.name != 'SoundCloud') {
							fudgeAmount = 1;
						}
						break;

					}
					switch (this.model.mediaSource.name) {

						case "YouTube":
						fudgeAmount = -2;
						break;

					}
					if(this.native_full === false) {
						this.model.element.width(Math.max(this.resizedDim.x + fudgeAmount));
					} else {
						this.model.element.width(Math.max(this.resizedDim.x + fudgeAmount + (this.gutterSize * 2), this.minContainerDim.x));
					}
				} else {
					switch (this.model.mediaSource.name) {

						case "Vimeo":
						fudgeAmount = 6;
						break;

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
			var deferTypeSizing = this.model.options.deferTypeSizing === true;
			switch (this.model.containerLayout) {

				case "horizontal":
				if (native_size === true) {
					this.containerDim.x = parseInt(this.model.options.width);
				} else {
					this.containerDim.x = this.initialContainerWidth;
				}
				if (!this.model.isChromeless) {
					this.containerDim.x--;
					this.mediaContainer.css('float', 'right'); // needed to prevent vertical offsets for wide media
				}
				if (this.annotationsVisible) {
					this.containerDim.x -= (parseInt(this.annotationSidebar.width()) + (this.gutterSize * 2));
				}
				if ((this.controllerOnly && (this.mediaContainer.closest('.slot').length == 0)) && (this.model.options.header != 'nav_bar'))  {
 					this.containerDim.y = this.controllerHeight + (this.gutterSize * 2);
 				} else {
					this.containerDim.y = parseInt(this.model.options.height) - parseInt(this.header.height()) + 1;
				}
				if (this.footer.attr('visible')) this.containerDim.y -= parseInt(this.footer.height());
				this.minContainerDim.y = this.containerDim.y;
				this.minContainerDim.x = Math.round(this.containerDim.y * .5);
				if (this.containerDim.x < this.minContainerDim.x) this.containerDim.x = this.containerDim.y * 1.33;
				break;

				case "vertical":
				this.containerDim.x = parseInt(this.model.options.width)
 				if (!this.model.isChromeless) this.containerDim.x -=2;
 				if (this.controllerOnly) {
 					this.containerDim.y = Math.max(this.minContainerDim.y, this.controllerHeight + (this.gutterSize * 2));
 				} else if (this.model.isChromeless) {
 					if (!deferTypeSizing && this.model.mediaSource.contentType != 'image' ) {
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

			if (!deferTypeSizing && this.model.mediaSource.contentType != 'image') {
				this.containerDim.y = Math.min( this.containerDim.y, window.innerHeight - 250 );
			}

	   		if (!this.annotationsVisible) {
	   			if (this.annotationDisplay) this.annotationDisplay.width(this.containerDim.x);
	   		} else {
	   			if (this.annotationDisplay) this.annotationDisplay.width(this.containerDim.x + this.annotationSidebar.width());
	   		}

			if (this.model.mediaSource.name == 'HyperCities')  this.containerDim.x -= 4;

			//console.log(this.model.containerLayout+' '+this.initialContainerWidth+' '+this.containerDim.x+' '+this.containerDim.y+' '+this.footer.height()+' '+this.annotationSidebar.width());

		}

		/**
		 * Calculates the optimum display size for the media.
		 */
		jQuery.MediaElementView.prototype.calculateMediaSize = function() {

			// if this is liquid media, always make it the maximum size
			if (this.mediaObjectView.isLiquid) {
				this.intrinsicDim.x = this.containerDim.x;
				if ( this.intrinsicDim.x < 650 ) {	
					// don't let the height of liquid items exceed 75% of the width (this prevents pillarboxing in full width cantaloupe sizes)
					this.intrinsicDim.y = Math.min( this.containerDim.y, this.containerDim.x * .75 );
				} else {
					// let large items expand to full size
					this.intrinsicDim.y = this.containerDim.y;
				}
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

			//console.log(this.intrinsicDim.x+' '+this.intrinsicDim.y+' '+mediaAR+' '+containerAR);
	
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

				if(typeof maxHeight != 'undefined') {
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

			// console.log(this.containerDim.x+' '+this.containerDim.y+' '+this.resizedDim.x+' '+this.resizedDim.y);

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

			//console.log('margins '+this.mediaMargins.horz+' '+this.mediaMargins.vert);

			if (!this.model.isChromeless) {
				this.mediaContainer.find('.mediaObject').css('padding-left', Math.floor(this.mediaMargins.horz));
				this.mediaContainer.find('.mediaObject').css('padding-right', Math.floor(this.mediaMargins.horz + additive));
				this.mediaContainer.find('.mediaObject').css('padding-top', Math.floor(this.mediaMargins.vert));
				this.mediaContainer.find('.mediaObject').css('padding-bottom', Math.floor(this.mediaMargins.vert));
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

			if (this.annotationsVisible) {
				if (this.model.options.header != 'nav_bar') {
					$(this.annotationLink).find('a').text('Hide Annotations');
				} else {
					// if we're in the maximize view and this is an image with annotations, then the image annotations need to be reset
					if ((this.model.mediaSource.contentType == 'image') && (this.model.mediaSource.browserSupport[scalarapi.scalarBrowser].player == 'native') && (this.mediaObjectView.annotations != null)) {
						this.mediaObjectView.setupAnnotations(this.mediaObjectView.annotations);
					}
				}
				if (this.model.containerLayout == "horizontal") {
					this.annotationSidebar.css('display','block');
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
					if ((this.model.mediaSource.contentType == 'image') && (this.model.mediaSource.browserSupport[scalarapi.scalarBrowser].player == 'native') && (this.mediaObjectView.annotations != null)) {
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
			this.mediaContainer.css('background-image', 'url()');
			$('body').trigger('mediaElementMediaLoaded', [$(this.model.link)]);
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
						if (document.location.href.indexOf('.annotation_editor')==-1) {
							if ((me.model.mediaSource.name == 'Vimeo') ||(me.model.mediaSource.name == 'SoundCloud')) {
								// this prevents Vimeo videos generated from linked annotations from displaying
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
						if ((me.model.mediaSource.name == 'Vimeo') ||(me.model.mediaSource.name == 'SoundCloud')) {
							// this prevents Vimeo videos generated from linked annotations from displaying
							// their live annotation when cueing up on page load
							if ((me.mediaObjectView.initialPauseDone) && (me.intervalId != null)) {
								$('body').trigger('show_annotation', [newCurrentAnnotation, me]); // show live annotation
							}
						} else {
							$('body').trigger('show_annotation', [newCurrentAnnotation, me]); // show live annotation
						}
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
 				this.mediaObjectView.seek(annotation.properties.start);
 				this.lastSeekTime = annotation.properties.start;
 				handleTimer();
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

            this.mediaContainer.find('.image-annotate-view').show();

			var temp = annotation.body.urn.split(':');
			var urn = temp[temp.length - 1];

			$($('.image-annotate-area')).hide();
			$($('#'+this.model.id+'_'+urn)).show();

			$($('.image-annotate-note')).hide();
			$($('#'+this.model.id+'_'+urn+'_note')).show();

			if (document.location.href.indexOf('.annotation_editor')==-1) {
				$('body').trigger('show_annotation', [annotation, this]);
			}

		}

		/**
		 * Checks to see if the last attempted seek has succeeded; if not, tries to seek there again.
		 * @return		Returns true if the seek was successful.
		 */
		 function checkSeekSuccessful() {

		 	//console.log('check to see if seek successful: '+me.lastSeekTime);

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
						if (me.annotationDisplay.text().indexOf('Seeking') != -1) {
							me.annotationDisplay.fadeOut();
						}
					}
					me.annotationTimerRunning = false;
					//console.log('seek successful');
					// if we know the user intends for the clip to start playing, do so
					if ( me.cachedPlayCommand || me.model.options.autoplay ) {
						me.play();
					} else {

						// SoundCloud must be playing in order to seek, so pause if we've arrived
						if (me.model.mediaSource.name == 'SoundCloud') {
							me.mediaObjectView.pause();
							me.mediaObjectView.initialPauseDone = true;
						}

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

			if ((this.model.mediaSource.contentType == 'document') && this.mediaObjectView.hasFrameLoaded) {
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
					this.header.find('p.mediaElementAlignLeft').css('width', '79%'); // make room for the annotation link
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
						annotationChip.click( function() {
							$(this).data('me').cachedPlayCommand = true;
							$(this).data('me').seek($(this).data('annotation'));
							$(this).data('me').play();
						});

						annotationChip.append('<p class="annotationTitle"><strong>'+annotation.body.getDisplayTitle()+'</strong></p>');
						annotationChip.append(extents);


						break;

						case 'image':
						annotationChip.append('<p class="annotationTitle"><strong>'+annotation.body.getDisplayTitle()+'</strong></p>');
						annotationChip.append('<p class="annotationExtents"><a href="javascript:;">'+annotation.startString+annotation.separator+annotation.endString+'</a></p>');
						annotationChip.data('annotation', annotation);
						annotationChip.data('me', this.controller.view);
						annotationChip.click( function() {
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
						annotationChip.click( function(e) {
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

			// show image annotations if there are any
			if ((this.model.mediaSource.contentType == 'image') && (this.model.mediaSource.browserSupport[scalarapi.scalarBrowser].player == 'native') && (this.annotations.length > 0)) {
				this.mediaObjectView.setupAnnotations(this.annotations);
			}

			// if we were passed an annotation to seek to, wait a while before attempting to seek
			// (if YouTube, then don't try to seek if we're not on Mobile Safari, since we'll set player
			// params to seek instead)
			if ((this.model.seekAnnotation != null) /*&& (this.model.mediaSource.contentType != 'image')*/ && ((this.model.mediaSource.name != 'YouTube') || ((this.model.mediaSource.name == 'YouTube') && (scalarapi.scalarBrowser == 'MobileSafari')))) {
 				if (this.annotationDisplay && (this.model.mediaSource.contentType != 'image')) {
	 				this.annotationDisplay.html('<p class="annoSeekMessage">Seeking to '+this.model.seekAnnotation.startString+'&hellip;</p>');
	 				this.annotationDisplay.fadeIn();
 				}
  				if ( ( this.model.mediaSource.contentType != 'image' ) && ( this.model.mediaSource.contentType != 'document' ) ) {
 					setTimeout( this.doAutoSeek, 6000 );
				} else {
 					setTimeout( this.doAutoSeek, 3000 );
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
		this.doAutoSeek = function() {
			me.seek(me.model.seekAnnotation);
			setTimeout(me.doInstantUpdate, 500);
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

			// setup actions to be taken on image load
			$(this.image).load(function() {

				var $this = $(this);

				me.hasLoaded = true;

				me.parentView.intrinsicDim.x = this.width;
				me.parentView.intrinsicDim.y = this.height;

				me.parentView.layoutMediaObject();
				me.parentView.removeLoadingMessage();

				// Make visible
				if ($.browser.msie) {
					$this.css('display','inline');
				} else {
					$this.fadeIn();
				}

				if (me.annotations != null) {
					me.setupAnnotations(me.annotations);
				}

			}).attr('src', url);

    	}

		/**
		 * Sets up the image's annotations (uses a modified verison of the jQuery Image Annotation Plugin: https://github.com/flipbit/jquery-image-annotate)
		 *
		 * @param {Array} annotations		The annotations to be added to the image.
		 */
 		jQuery.ImageObjectView.prototype.setupAnnotations = function(annotations) {

  			if (!this.hasLoaded) {
 				this.annotations = annotations;

 			} else {

	 			var i;
	 			var n = annotations.length;
	 			var annotation;
				var x;
				var y;
				var width;
				var height;
				var notes = [];
				var temp;
				var urn;

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

					temp = annotation.body.urn.split(':');
					urn = temp[temp.length - 1];

					notes.push({
						'top': y,
						'left': x,
						'width': width,
						'height': height,
						'text': annotation.body.getDisplayTitle(),
						'annotation': annotation,
						'id': this.model.id+'_'+urn,
						'editable': false
					});

	 			}

 				// if annotations are already attached, then remove and then reload them
 				if (this.annotatedImage != null) {
	 				this.annotatedImage.clear();
	 				this.annotatedImage.updateSize();
	 				this.annotatedImage.reload(notes);

	 			// otherwise, load for the first time
				} else {

					var editable = (document.location.href.indexOf('.annotation_editor') != -1)

		 			this.annotatedImage = $(this.image).annotateImage({
		 				editable: editable,
		 				useAjax: false,
		 				notes: notes
		 			});

		 			$('body').bind('image_annotation_clicked', function(e, note) {
		 				$('body').trigger('show_annotation', [note.annotation, me.parentView]);
		 			})

				}


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
				if ((width < this.model.options.width) && (width > (1040 - 144))) {
					var scaleFactor = (1040 - 144) / width;
					width *= scaleFactor;
					height *= scaleFactor;
				}

			}
			$(this.image).parent().width(width+'px');
			$(this.image).parent().height(height+'px');
			if (this.hasLoaded) {
				$(this.image).width(width+'px');
				$(this.image).height(height+'px');
			}
		}


	}

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
		 * @param {Number} width		The new width of the Flash video.
		 * @param {Number} height		The new height of the Flash video.
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
		 * @param {Number} width		The new width of the Flash video.
		 * @param {Number} height		The new height of the Flash video.
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

				case "CriticalCommons-LegacyVideo":
				var path_segments = this.model.path.split('.');
				if (path_segments.length > 1) {
					path_segments[path_segments.length-1] = 'mp4';
					this.model.path = path_segments.join('.');
				}
				mimeType = "video/mp4";
				break;

				case "CriticalCommons-Video":
				var ext;
				if (this.model.mediaSource.browserSupport[scalarapi.scalarBrowser].format == 'MPEG-4') {
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
				break;

				case "WebM":
				mimeType = "video/webm";
				break;

			}

			obj = $('<div class="mediaObject"><video id="'+this.model.filename+'_'+this.model.id+'" controls="controls"><source src="'+this.model.path+'" type="'+mimeType+'"/>Your browser does not support the video tag.</video></div>').appendTo(this.parentView.mediaContainer);
			if ( this.model.options.autoplay && ( this.model.seek == null ) ) {
				obj.find( 'video' ).attr( 'autoplay', 'true' );
			}

			// apply the poster image only if the thumbnail loads successfully
			var thumbnailURL;
			if (this.model.node.thumbnail) {
				thumbnailURL = this.model.node.thumbnail;

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
				$(this.image).load(function() {
					var $this = $(this);
					me.video.attr('poster', $this.attr('src'));
				}).attr('src', thumbnailURL);
			}

			this.video = obj.find('video#'+this.model.filename+'_'+this.model.id);

			this.parentView.controllerOffset = 22;

			var metadataFunc = function() {

				me.parentView.intrinsicDim.x = me.video[0].videoWidth;
				me.parentView.intrinsicDim.y = me.video[0].videoHeight;
				me.parentView.controllerOffset = 0;

				me.parentView.layoutMediaObject();
				me.parentView.removeLoadingMessage();

			}

			this.parentView.layoutMediaObject();

			if (document.addEventListener) {
				this.video[0].addEventListener('loadedmetadata', metadataFunc, false);
				this.video[0].addEventListener('play', me.parentView.startTimer, false);
				this.video[0].addEventListener('pause', me.parentView.endTimer, false);
				this.video[0].addEventListener('ended', me.parentView.endTimer, false);
				this.video[0].addEventListener('ended', me.parentView.endTimer, false);
			} else {
				this.video[0].attachEvent('onloadedmetadata', metadataFunc);
				this.video[0].attachEvent('play', me.parentView.startTimer);
				this.video[0].attachEvent('pause', me.parentView.endTimer);
				this.video[0].attachEvent('ended', me.parentView.endTimer);
			}

			return;
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
		 * @param {Number} width		The new width of the Flash video.
		 * @param {Number} height		The new height of the Flash video.
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

			obj = $('<div class="mediaObject"><audio style="width:100%" src="'+this.model.path+'" controls="controls" type="audio/'+this.model.extension+'">Your browser does not support the audio tag.</audio></div>').appendTo(this.parentView.mediaContainer);
			if ( this.model.options.autoplay && ( this.model.seek == null ) ) {
				obj.find( 'audio' ).attr( 'autoplay', 'true' );
			}
			this.audio = obj.find('audio');

			this.parentView.controllerOnly = true;
			this.parentView.controllerHeight = 25;

			this.parentView.intrinsicDim.y = 45;

			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

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
		 * @param {Number} width		The new width of the Flash video.
		 * @param {Number} height		The new height of the Flash video.
		 */
		jQuery.HTML5AudioObjectView.prototype.resize = function(width, height) {
			$(this.model.element).find('.mediaObject').width(width);
			$(this.model.element).find('.mediaObject').height(height);
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

			var params = {
				videoId: YouTubeGetID( this.model.path ),
				playerVars: {
					modestbranding:1,
					enablejsapi:1,
					origin:'scalar.usc.edu',
					rel:0,
					autoplay: this.model.options.autoplay ? 1 : 0
				},
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

			this.parentView.controllerOffset = 30;
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
		 * @param {Number} width		The new width of the Flash video.
		 * @param {Number} height		The new height of the Flash video.
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
		this.duration = 0;						// length of the video

		/**
		 * Creates the video media object.
		 */
		jQuery.VimeoVideoObjectView.prototype.createObject = function() {

			var url = 'http://player.vimeo.com/video/'+this.model.filename+'?api=1&player_id=vimeo'+this.model.filename+'_'+this.model.id
			if ( this.model.options.autoplay ) {
				url += '&autoplay=1';
			}
			obj = $('<div class="mediaObject"><iframe id="vimeo'+this.model.filename+'_'+this.model.id+'" src="'+url+'" frameborder="0"></iframe></div>').appendTo(this.parentView.mediaContainer);

			var ready = function(player_id) {
				me.froogaloop = $froogaloop(player_id);
				$froogaloop(player_id).addEvent('playProgress', function(data) {
					if ((me.model.seekAnnotation != null) && !me.initialPauseDone && !me.parentView.cachedPlayCommand) {
						me.froogaloop.api('pause');
					}
					me.currentTime = data.seconds;
					me.initialPauseDone = true;
					me.isVideoPlaying = false; // need to set this manually because the pause event isn't firing here
				});
				$froogaloop(player_id).addEvent('loadProgress', function(data) {
					me.percentLoaded = data.percent;
					me.duration = data.duration;
				});
				$froogaloop(player_id).addEvent('play', function() { me.parentView.startTimer(); me.isVideoPlaying = true; });
				$froogaloop(player_id).addEvent('pause', function() { me.parentView.endTimer(); me.isVideoPlaying = false; });
				$froogaloop(player_id).addEvent('finish', function() { me.parentView.endTimer(); me.isVideoPlaying = false; });
			}

			var video = document.getElementById('vimeo'+this.model.filename+'_'+this.model.id);
			$froogaloop(video).addEvent('ready', ready);
			this.parentView.removeLoadingMessage();

			return;
		}

		/**
		 * Starts playback of the Vimeo video.
		 */
		jQuery.VimeoVideoObjectView.prototype.play = function() {
			if ((this.model.seekAnnotation != null) && (!this.parentView.overrideAutoSeek)) {
				this.froogaloop.api('seekTo', this.model.seekAnnotation.properties.start);
			}
			this.froogaloop.api('play');
			this.isVideoPlaying = true;
		}

		/**
		 * Pauses playback of the Vimeo video.
		 */
		jQuery.VimeoVideoObjectView.prototype.pause = function() {
			this.froogaloop.api('pause');
			this.isVideoPlaying = false;
		}

		/**
		 * Seeks to the specified location in the Vimeo video.
		 *
		 * @param {Number} time			Seek location in seconds.
		 */
		jQuery.VimeoVideoObjectView.prototype.seek = function(time) {
			this.froogaloop.api('seekTo', time);
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
			video = document.getElementById('vimeo'+this.model.filename+'_'+this.model.id);
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
	 * View for the Flowplayer video player.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.FlowplayerVideoObjectView = function(model, parentView) {

		var me = this;
		var video;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.playStopped = false;				// keep track of initial pause

		// this is a kludge to deal with the fact that flowplayer doesn't correctly report getTime() until
		// the third time playing back
		this.justPlayedSeekAnnotation = false;

		/**
		 * Creates the video media object.
		 */
		jQuery.FlowplayerVideoObjectView.prototype.createObject = function() {

			switch (this.model.mediaSource.name) {

				case "CriticalCommons-Video":
				var path_segments = this.model.path.split('.');
				if (path_segments.length > 1) {
					path_segments[path_segments.length-1] = 'mp4';
					this.model.path = path_segments.join('.');
				}
				mimeType = "video/mp4";
				break;

			}

 			var theElement = $('<div class="mediaObject" id="'+this.model.filename+'_mediaObject'+this.model.id+'"/>"').appendTo(this.parentView.mediaContainer);

 			var thePlayer = $f(this.model.filename+'_mediaObject'+this.model.id, this.model.mediaelement_dir+"flowplayer.swf", {

 				key: $('#flowplayer_key').attr('href'),

			    clip: {
			        url: this.model.path,
			        accelerated: false,
			        scaling: 'fit',
			        autoPlay: true,
			        autoBuffering: true
			    },

			    canvas:  {
					backgroundGradient: 'none',
					backgroundColor: '#000000'
				},

			    onStart: function() {
			    	if (!me.playStopped && !me.model.options.autoplay) {
			    		this.pause();
			    		me.playStopped = true;
			    	}
			    },

			    onBufferFull: function() { me.parentView.startTimer(); },

			    onPause: function() { me.parentView.endTimer(); },

			    onFinish: function() { me.parentView.endTimer(); },

			    // streaming plugins are configured under the plugins node
			    plugins: {

			        controls: {
			            backgroundColor: '#333333',
			            timeColor: '#ffffff',
			            buttonColor: '#a1a1a1',
			            buttonOverColor: '#ffffff',
			            durationColor: '#a1a1a1',
			            tooltips: {
			                buttons: 'true',
			                fullscreen: 'Start video to enable Fullscreen'
			            }
			        }

			    },

			    onError: function(errorCode, errorMessage) {
			        $f().getPlugin('play').css({ opacity: 0 });
			    }

			});

			this.parentView.removeLoadingMessage();

			return;
		}

		/**
		 * Starts playback of the video.
		 */
		jQuery.FlowplayerVideoObjectView.prototype.play = function() {
			video = $f(this.model.filename+'_mediaObject'+this.model.id);
			if (video) {
				if ((this.model.seekAnnotation != null) && (!this.parentView.overrideAutoSeek)) {
					video.getClip(0).update({start:this.model.seekAnnotation.properties.start});
					video.seek(this.model.seekAnnotation.properties.start);
					this.justPlayedSeekAnnotation = true;
				} else {
					this.justPlayedSeekAnnotation = false;
				}
				if (!video.isPlaying()) {
					video.play();
				}
			}
		}

		/**
		 * Pauses playback of the video.
		 */
		jQuery.FlowplayerVideoObjectView.prototype.pause = function() {
			video = $f(this.model.filename+'_mediaObject'+this.model.id);
			if (video) video.pause();
		}

		/**
		 * Seeks to the specified location in the video.
		 *
		 * @param {Number} time			Seek location in seconds.
		 */
		jQuery.FlowplayerVideoObjectView.prototype.seek = function(time) {
			video = $f(this.model.filename+'_mediaObject'+this.model.id);
			if (video) {
				video.seek(time);
			}
		}

		/**
		 * Returns the current playback position of the video.
		 * @return	The current playback position in seconds.
		 */
		jQuery.FlowplayerVideoObjectView.prototype.getCurrentTime = function() {
			video = $f(this.model.filename+'_mediaObject'+this.model.id);
			if (video) {
				var currentTime = video.getTime();
				if (this.justPlayedSeekAnnotation && (currentTime < this.model.seekAnnotation.properties.start)) {
					return currentTime + video.getClip(0).start;
				} else {
					return currentTime;
				}
			} else {
				return 0;
			}
		}

		/**
		 * Resizes the video to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the video.
		 * @param {Number} height		The new height of the video.
		 */
		jQuery.FlowplayerVideoObjectView.prototype.resize = function(width, height) {
			var theElement = document.getElementById(this.model.filename+'_mediaObject'+this.model.id);
			if (theElement) {
				$(theElement).width(width);
				$(theElement).height(height);
			}
		}

		/**
		 * Returns true if the video is currently playing.
		 * @return	Returns true if the video is playing.
		 */
		jQuery.FlowplayerVideoObjectView.prototype.isPlaying = function() {
			var result = false;
			video = $f(this.model.filename+'_mediaObject'+this.model.id);
			if (video) {
				result = (video.isPlaying());
			}
			return result;
		}

	}

	/**
	 * View for the Hemispheric Institute video player.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.HemisphericInstituteVideoObjectView = function(model, parentView) {

		var me = this;
		var video;

		this.model = model;  									// instance of the model
		this.parentView = parentView;   						// primary view for the media element
		this.bsn = this.model.filename.replace('html','');		// id of the video

		// this is a kludge to deal with the fact that flowplayer doesn't correctly report getTime() until
		// the third time playing back
		this.justPlayedSeekAnnotation = false;

		/**
		 * Creates the video media object.
		 */
		jQuery.HemisphericInstituteVideoObjectView.prototype.createObject = function() {
 			var theElement = $('<div class="mediaObject" id="'+this.bsn+'_mediaObject'+this.model.id+'"/>"').appendTo(this.parentView.mediaContainer);
 			var thePlayer = $f(this.bsn+'_mediaObject'+this.model.id, this.model.mediaelement_dir+"flowplayer.swf", {

 				key: $('#flowplayer_key').attr('href'),

			    clip: {
			        urlResolvers: 'bwcheck',
			        provider: 'rtmp',
			        scaling: 'uniform',
			        autoPlay: this.model.options.autoplay,
			        start: 0,
			        bitrates: [
			            { url: 'mp4:'+this.bsn+'_300k_s.mp4', width: 448, height: 336, bitrate: 300, isDefault: true },
			            { url: 'mp4:'+this.bsn+'_800k_s.mp4', width: 640, height: 480, bitrate: 800 }
			        ]
			    },

			    onBufferFull: function() { me.parentView.startTimer(); },

			    onPause: function() { me.parentView.endTimer(); },

			    onFinish: function() { me.parentView.endTimer(); },

			    // streaming plugins are configured under the plugins node
			    plugins: {
			        // bandwidth check plugin
			        bwcheck: {
			            url: this.model.mediaelement_dir+'flowplayer.bwcheck.swf',
			            serverType: 'fms',
			            // we use dynamic switching
			            dynamic: true,
			            // use this connection for bandwidth detection
			            netConnectionUrl: 'rtmp://fms.library.nyu.edu/hidvl_r'
			        },

			        controls: {
			            backgroundColor: '#333333',
			            timeColor: '#ffffff',
			            buttonColor: '#a1a1a1',
			            buttonOverColor: '#ffffff',
			            durationColor: '#a1a1a1',
			            tooltips: {
			                buttons: 'true',
			                fullscreen: 'Start video to enable Fullscreen'
			            }
			        },

			        content: {
			            url: this.model.mediaelement_dir+'flowplayer.content.swf',
			            opacity: 0
			        },

			        // here is our rtpm plugin configuration, configured for rtmp
			        rtmp: {
			            url: this.model.mediaelement_dir+'flowplayer.rtmp.swf',
			            // netConnectionUrl defines where the streams are found
			            netConnectionUrl: 'rtmp://fms.library.nyu.edu/hidvl_r'
			        }
			    },

			    onError: function(errorCode, errorMessage) {
			        // remove play button
			        $f().getPlugin('play').css({ opacity: 0 });
			        // show error message
			        var contentPlugin = $f().getPlugin('content');
			        contentPlugin.setHtml("<h1>There are problems loading this clip.</h1>");
			        contentPlugin.css({ opacity: 1.0 });
			    }

			});

			this.parentView.removeLoadingMessage();

			return;
		}

		/**
		 * Starts playback of the video.
		 */
		jQuery.HemisphericInstituteVideoObjectView.prototype.play = function() {
			video = $f(this.bsn+'_mediaObject'+this.model.id);
			if (video) {
				if ((this.model.seekAnnotation != null) && (!this.parentView.overrideAutoSeek)) {
					video.getClip(0).update({start:this.model.seekAnnotation.properties.start});
					video.seek(this.model.seekAnnotation.properties.start);
					this.justPlayedSeekAnnotation = true;
				} else {
					this.justPlayedSeekAnnotation = false;
				}
				if (!video.isPlaying()) {
					video.play();
				}
			}
		}

		/**
		 * Pauses playback of the video.
		 */
		jQuery.HemisphericInstituteVideoObjectView.prototype.pause = function() {
			video = $f(this.bsn+'_mediaObject'+this.model.id);
			if (video) video.pause();
		}

		/**
		 * Seeks to the specified location in the video.
		 *
		 * @param {Number} time			Seek location in seconds.
		 */
		jQuery.HemisphericInstituteVideoObjectView.prototype.seek = function(time) {
			video = $f(this.bsn+'_mediaObject'+this.model.id);
			if (video) {
				video.seek(time);
			}
		}

		/**
		 * Returns the current playback position of the video.
		 * @return	The current playback position in seconds.
		 */
		jQuery.HemisphericInstituteVideoObjectView.prototype.getCurrentTime = function() {
			video = $f(this.bsn+'_mediaObject'+this.model.id);
			if (video) {
				var currentTime = video.getTime();
				if (this.justPlayedSeekAnnotation && (currentTime < this.model.seekAnnotation.properties.start)) {
					return currentTime + video.getClip(0).start;
				} else {
					return currentTime;
				}
			} else {
				return 0;
			}
		}

		/**
		 * Resizes the video to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the video.
		 * @param {Number} height		The new height of the video.
		 */
		jQuery.HemisphericInstituteVideoObjectView.prototype.resize = function(width, height) {
			var theElement = document.getElementById(this.bsn+'_mediaObject'+this.model.id);
			if (theElement) {
				$(theElement).width(width);
				$(theElement).height(height);
			}
		}

		/**
		 * Returns true if the video is currently playing.
		 * @return	Returns true if the video is playing.
		 */
		jQuery.HemisphericInstituteVideoObjectView.prototype.isPlaying = function() {
			var result = false;
			video = $f(this.bsn+'_mediaObject'+this.model.id);
			if (video) {
				result = (video.isPlaying());
			}
			return result;
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
	 * View for the jPlayer audio player.
	 * @constructor
	 *
	 * @param {Object} model		Instance of the model.
	 * @param {Object} parentView	Primary view for the media element.
	 */
	jQuery.JPlayerAudioObjectView = function(model, parentView) {

		var me = this;

		this.model = model;  					// instance of the model
		this.parentView = parentView;   		// primary view for the media element
		this.isAudioPlaying = false;
		this.currentTime = 0;
		this.isLiquid = true;

		/**
		 * Creates the media object.
		 */
		jQuery.JPlayerAudioObjectView.prototype.createObject = function() {

			var obj = $('<div class="mediaObject"><div id="jplayer'+this.model.filename+'_'+this.model.id+'"></div><div class="jp-audio"><div class="jp-type-single"><div id="jp_interface_'+this.model.id+'" class="jp-interface"><ul class="jp-controls"><li><a href="#" class="jp-play" tabindex="1">play</a></li><li><a href="#" class="jp-pause" tabindex="1">pause</a></li><li><a href="#" class="jp-mute" tabindex="1">mute</a></li><li><a href="#" class="jp-unmute" tabindex="1">unmute</a></li></ul><div class="jp-progress"><div class="jp-seek-bar"><div class="jp-play-bar"></div></div></div><div class="jp-volume-bar"><div class="jp-volume-bar-value"></div></div><div class="jp-current-time"></div><div class="jp-duration"></div></div></div></div></div>').appendTo(this.parentView.mediaContainer);

			var approot = $('link#approot').attr('href').substr(6);  // has a trailing slash
			var url_to_swf = 'http:/'+approot+'views/widgets/mediaelement/';

			var options;
			switch (this.model.mediaSource.name) {

				case "MPEG-3":
				options = {mp3: me.model.path};
				break;

				case "WAV":
				options = {wav: me.model.path};
				break;

				case "OGG-Audio":
				options = {oga: me.model.path};
				break;

			}

			var readyFunc = function() {
				$(this).jPlayer('setMedia', options);
			};

			this.audio = $('#jplayer'+this.model.filename+'_'+this.model.id).jPlayer({ready:readyFunc, backgroundColor:null, swfPath: url_to_swf, supplied:this.model.extension, cssSelectorAncestor:'#jp_interface_'+this.model.id});

			$('#jplayer'+this.model.filename+'_'+this.model.id).bind($.jPlayer.event.pause, function(e) { me.isAudioPlaying = !e.jPlayer.status.paused; me.currentTime = e.jPlayer.status.currentTime; me.parentView.endTimer(); });
			$('#jplayer'+this.model.filename+'_'+this.model.id).bind($.jPlayer.event.play, function(e) { me.isAudioPlaying = !e.jPlayer.status.paused; me.currentTime = e.jPlayer.status.currentTime; me.parentView.startTimer(); $(this).jPlayer("pauseOthers"); });
			$('#jplayer'+this.model.filename+'_'+this.model.id).bind($.jPlayer.event.timeupdate, function(e) { me.currentTime = e.jPlayer.status.currentTime; });

			this.parentView.controllerOnly = true;
			this.parentView.controllerHeight = 80;

			this.parentView.intrinsicDim.x = this.parentView.containerDim.x;
			this.parentView.intrinsicDim.y = this.parentView.containerDim.y;

			this.parentView.calculateContainerSize();
			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

			return;
		}

		/**
		 * Starts playback of the media.
		 */
		jQuery.JPlayerAudioObjectView.prototype.play = function() {
			if ((this.model.seekAnnotation != null) && (!this.parentView.overrideAutoSeek)) {
				if (!this.isAudioPlaying) {
					this.audio.jPlayer('play', this.model.seekAnnotation.properties.start);
				}
			} else {
				if (!this.isAudioPlaying) {
					this.audio.jPlayer('play');
				}
			}
		}

		/**
		 * Pauses playback of the media.
		 */
		jQuery.JPlayerAudioObjectView.prototype.pause = function() {
			this.audio.jPlayer('pause');
		}

		/**
		 * Seeks to the specified location in the media.
		 *
		 * @param {Number} time			Seek location in seconds.
		 */
		jQuery.JPlayerAudioObjectView.prototype.seek = function(time) {
			if (!this.isAudioPlaying) {
				this.audio.jPlayer('pause', time);
			} else {
				this.audio.jPlayer('play', time);
			}
		}

		/**
		 * Returns the current playback position of the media.
		 * @return	The current playback position in seconds.
		 */
		jQuery.JPlayerAudioObjectView.prototype.getCurrentTime = function() {
			return this.currentTime;
		}

		/**
		 * Resizes the media to the specified dimensions.
		 *
		 * @param {Number} width		The new width of the media.
		 * @param {Number} height		The new height of the media.
		 */
		jQuery.JPlayerAudioObjectView.prototype.resize = function(width, height) {
			$(this.model.element).find('.jp-audio').width(width - 1);
			$(this.model.element).find('.jp-progress').width(width - 160);
		}

		/**
		 * Returns true if the video is currently playing.
		 * @return	Returns true if the media is playing.
		 */
		jQuery.JPlayerAudioObjectView.prototype.isPlaying = function() {
			return this.isAudioPlaying;
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
			var path = approot+'helpers/proxy.php?url='+this.model.path;

			this.frameId = 'text'+this.model.filename+'_'+this.model.id;

			var obj = $('<div class="mediaObject"><iframe style="width: 100%; height: 100%;" id="'+this.frameId+'" src="'+path+'" frameborder="0"></iframe></div>').appendTo(this.parentView.mediaContainer);
			this.frame = obj.find('#'+this.frameId)[0];

			$(this.frame).bind("load", function () {
				me.codeToList();
			   	me.hasFrameLoaded = true;
			   	me.highlightAnnotatedLines();
				me.pause();
				if ((me.model.seekAnnotation != null) && !me.justPlayedSeekAnnotation) {
					me.parentView.doAutoSeek();
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
						$(value).click(function() {
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
			var path = approot+'helpers/proxy.php?url='+this.model.path;

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
			var approot = $('link#approot').attr('href');
			var cssLink = document.createElement("link")
			cssLink.href = approot+'views/widgets/mediaelement/prism.css';
			cssLink.rel = "stylesheet";
			cssLink.type = "text/css";

			this.object.click( function( e ) {

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

			var doc = document;
			doc.body.appendChild(cssLink);
			$.getScript( approot+'views/widgets/mediaelement/prism.js', function( script, textStatus ) {
				me.hasLoaded = true;
			   	me.highlightAnnotatedLines();
				me.pause();
				if ((me.model.seekAnnotation != null) && !me.justPlayedSeekAnnotation) {
					me.parentView.doAutoSeek();
				}
			} ).fail( function( jqxhr, settings, exception ) {
				console.log( 'error loading prism.js: ' + exception );
			} );

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
			Prism.highlightElement( e );

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

			var obj = $('<div class="mediaObject"><iframe style="width: 100%; height: 100%;" id="'+this.frameId+'" src="'+this.model.path+'" frameborder="0"></iframe></div>').appendTo(this.parentView.mediaContainer);
			this.frame = obj.find('#'+this.frameId)[0];

			$(this.frame).bind("load", function () {
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

			var obj = $('<div class="mediaObject"><object style="width: 100%; height: 100%;" id="'+this.frameId+'" data="'+this.model.path+'"><p class="download_link"><a href="'+this.model.path+'">Download PDF</a></p></object></div>').appendTo(this.parentView.mediaContainer);
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
		this.isLiquid = false;					// media will expand to fill available space
		this.initialPauseDone = true;			// media must be played briefly for some functions to be available; has it subsequently been paused?
		this.widget = null;						// SoundClound widget
		this.cachedSeekTime = null;				// internal storage of last seek request
		this.wasPlayingBeforeSeek = false;		// was the audio playing before we tried to seek?

		/**
		 * Creates the media object.
		 */
		jQuery.SoundCloudAudioObjectView.prototype.createObject = function() {

			this.mediaObject = $('<div class="mediaObject"><div id="soundcloud'+me.model.filename+'_'+me.model.id+'"></div></div>').appendTo(this.parentView.mediaContainer);
			SC.oEmbed(this.model.path, {auto_play: me.model.options.autoplay, download: true}, function(oembed){
				oembed.height = me.parentView.intrinsicDim.y;
				me.parentView.controllerHeight = oembed.height;

				$(oembed.html).css('height',oembed.height).appendTo(me.mediaObject.children()[0]);

				me.widget = SC.Widget($(me.mediaObject).find('iframe')[0]);
				me.widget.bind(SC.Widget.Events.PLAY, function() {
					if (!me.initialPauseDone) {
						if ( me.model.seekAnnotation == null ) {
							if ( !me.model.options.autoplay ) {
								me.widget.pause();
								me.initialPauseDone = true;
							}
						} else {
							me.widget.setVolume(0);
						}
					} else {
						me.parentView.startTimer();
					}
					if (me.cachedSeekTime != null) {
						me.widget.seekTo(me.cachedSeekTime);
						if (!me.wasPlayingBeforeSeek) me.widget.pause();
						me.cachedSeekTime = null;
					}
					me.isAudioPlaying = true;
				});
				me.widget.bind(SC.Widget.Events.PAUSE, function() {
					me.parentView.endTimer();
					me.isAudioPlaying = false;
				});
				me.widget.bind(SC.Widget.Events.FINISH, function() {
					me.parentView.endTimer();
					me.isAudioPlaying = false;
				});
				me.widget.bind(SC.Widget.Events.PLAY_PROGRESS, function(e) {
					me.currentTime = e.currentPosition / 1000.0;
				});
				me.parentView.calculateContainerSize();
				me.parentView.layoutMediaObject();
				me.parentView.removeLoadingMessage();
			});

			this.parentView.controllerOnly = true;

			this.parentView.intrinsicDim.x = this.parentView.containerDim.x;
			this.parentView.intrinsicDim.y = 0;

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
			if (!this.isAudioPlaying) {
				this.cachedSeekTime = time * 1000;
				this.wasPlayingBeforeSeek = this.isAudioPlaying;
				this.widget.play();
			} else {
				this.widget.seekTo(time * 1000);
			}
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
			var path = approot + 'helpers/proxy.php?url=' + this.model.path;

			this.mediaObject = $( '<div class="mediaObject" style="background-color:black;" id="openseadragon' + this.model.id + '"></div>' ).appendTo( this.parentView.mediaContainer );

			this.viewer = OpenSeadragon( {
				id: "openseadragon" + this.model.id,
				prefixUrl: approot + "views/widgets/mediaelement/openseadragon/images/",
				showNavigator: true,
				tileSources: path
			} );

			this.parentView.layoutMediaObject();
			this.parentView.removeLoadingMessage();

			return;
		}

		// These functions are basically irrelevant for HTML pages
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

}) (jQuery);