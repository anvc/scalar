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
 * @projectDescription		The AnnoBuilder plug-in enables users to annotate media files in Scalar.
 *							Scalar is a project of The Alliance for Networking Visual Culture (http://scalar.usc.edu).
 * @author					Erik Loyer
 * @version					2.0
 */

jQuery.fn.annobuilder = function(options) {
	return this.each(function() {
		var element = $(this);
		$.annobuilder.model.init(element, options);
		if ($.annobuilder.model.mediaElement.model.node != null) {
			$.annobuilder.controller.init();
		} else {
			$('body').on('mediaElementMetadataHandled', $.annobuilder.controller.init);
		}
	});
};

/**
 * jQuery.fn.sortElements
 * --------------
 * @param Function comparator:
 *   Exactly the same behaviour as [1,2,3].sort(comparator)
 *
 * @param Function getSortable
 *   A function that should return the element that is
 *   to be sorted. The comparator will run on the
 *   current collection, but you may want the actual
 *   resulting sort to occur on a parent or another
 *   associated element.
 *
 *   E.g. $('td').sortElements(comparator, function(){
 *      return this.parentNode;
 *   })
 *
 *   The <td>'s parent (<tr>) will be sorted instead
 *   of the <td> itself.
 *
 * http://james.padolsey.com/javascript/sorting-elements-with-jquery/
 */
jQuery.fn.sortElements = (function(){

    var sort = [].sort;

    return function(comparator, getSortable) {

        getSortable = getSortable || function(){return this;};

        var placements = this.map(function(){

            var sortElement = getSortable.call(this),
                parentNode = sortElement.parentNode,

                // Since the element itself will change position, we have
                // to have some way of storing its original position in
                // the DOM. The easiest way is to have a 'flag' node:
                nextSibling = parentNode.insertBefore(
                    document.createTextNode(''),
                    sortElement.nextSibling
                );

            return function() {

                if (parentNode === this) {
                    throw new Error(
                        "You can't sort elements if any one is a descendant of another."
                    );
                }

                // Insert before flag:
                parentNode.insertBefore(this, nextSibling);
                // Remove flag:
                parentNode.removeChild(nextSibling);

            };

        });

        return sort.call(this, comparator).each(function(i){
            placements[i].call(getSortable.call(this));
        });

    };

})();

/**
 * Model object for the annobuilder.
 * @constructor
 */
jQuery.AnnoBuilderModel = function() {

	this.element = null;					// the html element the builder should appear in
	this.mediaElement = null;				// the media element containing the media being annotated
	this.base_dir = null;					// url of the current book
	this.path = null;						// path to the media file
	this.node = null;						// node representing the media file
	this.annotations = [];					// array of annotations
	this.selectedAnnotation = null;			// currently selected annotation
	this.lastSelectedURL = null;			// uri of the last selected annotation

	/**
	 * Initializes the model.
	 *
	 * @param {Object} element		The element the builder should appear in.
	 * @param {Object} options		Configuration options.
	 */
	jQuery.AnnoBuilderModel.prototype.init = function(element, options) {
		this.element = element;
		this.mediaElement = options.link.data('mediaelement');
	}

	/**
	 * Sets up the model (runs after media element is fully ready).
	 */
	jQuery.AnnoBuilderModel.prototype.setup = function() {

		this.node = this.mediaElement.model.node;
		this.base_dir = this.mediaElement.model.base_dir;
		this.path = this.mediaElement.model.path;
		this.meta = this.mediaElement.model.meta;
		this.filename = this.mediaElement.model.filename;
		this.extension = this.mediaElement.model.extension;

	}

	/**
	 * Returns the annotation which matches the specified uri.
	 *
	 * @param {String} uri		The uri to match.
	 * @return					The matching annotation.
	 */
	jQuery.AnnoBuilderModel.prototype.getAnnotationFromURL = function(url) {

		var result;
		var annotation;
		var i;
		var n = this.annotations.length;
		for (i=0; i<n; i++) {
			annotation = this.annotations[i];
			if ((annotation.body.url == url) && (annotation.type == scalarapi.model.relationTypes.annotation)) {
				result = annotation;
				break;
			}
		}

		return result;
	}

}

/**
 * Controller object for the annobuilder.
 * @constructor
 */
jQuery.AnnoBuilderController = function() {

	var me = this;

	/**
	 * Initializes the controller.
	 */
	jQuery.AnnoBuilderController.prototype.init = function() {
		if ( $.annobuilder.model.node == null ) {
			$.annobuilder.model.setup();
      $('body').on('mediaElementMediaLoaded', function(event, link) {
        if ($.annobuilder.model.mediaElement == link.data('mediaelement')) {
          $.annobuilder.controller.setup();
        }
      });
		}
	}

	/**
	 * Sets up the controller.
	 */
	jQuery.AnnoBuilderController.prototype.setup = function() {
		$.annobuilder.controller.loadAnnotations();
		$.annobuilder.view.setup();
	}

	/**
	 * Loads annotations for the media file.
	 */
	jQuery.AnnoBuilderController.prototype.loadAnnotations = function() {
		scalarapi.model.removeNodes();
		if (scalarapi.loadCurrentPage(true, this.handleAnnotations, null, 2, false, 'annotation,tag') == 'loaded') this.handleAnnotations();
		if ( $.annobuilder.model.node.current.mediaSource.contentType == 'image' ) {
 			anno.removeAll( $.annobuilder.model.mediaElement.view.mediaObjectView.image.src + '-0' );
		}
  }

	/**
	 * Handles loaded annotation data.
	 *
	 * @param {Object} json		JSON data comprising the media metadata.
	 */
	jQuery.AnnoBuilderController.prototype.handleAnnotations = function(json) {

		$.annobuilder.model.node = scalarapi.model.nodesByURL[scalarapi.model.urlPrefix+$.annobuilder.model.meta.substr(scalarapi.model.urlPrefix.length)];
		$.annobuilder.model.annotations = $.annobuilder.model.node.getRelations('annotation', 'incoming');

		if ($.annobuilder.view.builder != null) {
			$.annobuilder.view.builder.buildList();
			$.annobuilder.view.builder.sortAnnotations();

			if ( $.annobuilder.model.node.current.mediaSource.contentType == 'document' ) {
				$.annobuilder.model.mediaElement.view.updateAnnotations( $.annobuilder.model.annotations );
				$.annobuilder.model.mediaElement.view.mediaObjectView.highlightAnnotatedLines();
			}

			// if a new annotation was just created, find it and select it
			if ($.annobuilder.view.builder.newAnnotationURL) {
				var annotation = $.annobuilder.model.getAnnotationFromURL($.annobuilder.view.builder.newAnnotationURL);
				if (annotation) {
					$.annobuilder.controller.selectAnnotation(annotation);
				}
			}

      switch ($.annobuilder.model.node.current.mediaSource.contentType) {

        case 'image':
        // seeking on an image annotation clears the anno display, so don't do it
        break;

        case '3D':
				case '3D-GIS':
        if (annotation) {
          if (annotation.body.url != $.annobuilder.view.builder.newAnnotationURL) {
            $.annobuilder.model.mediaElement.seek( $.annobuilder.model.selectedAnnotation );
          }
        }
        break;

        default:
        $.annobuilder.model.mediaElement.seek( $.annobuilder.model.selectedAnnotation );
        break;
      }

      $.annobuilder.view.builder.newAnnotationURL = null;

			// seeking on an image annotation clears the anno display, so don't do it
			if ( $.annobuilder.model.node.current.mediaSource.contentType != 'image' ) {

			}

		}

		if ( $.annobuilder.model.node.current.mediaSource.contentType == 'image' ) {
			if ($.annobuilder.model.mediaElement.view.mediaObjectView.image.complete) {
				anno.makeAnnotatable( $.annobuilder.model.mediaElement.view.mediaObjectView.image );
				anno.setProperties( { hi_stroke: "#3acad9" } );
			} else {
				$( $.annobuilder.model.mediaElement.view.mediaObjectView.image ).load( function() {
					anno.makeAnnotatable( $.annobuilder.model.mediaElement.view.mediaObjectView.image );
					anno.setProperties( { hi_stroke: "#3acad9" } );
				});
			}
		}

	}

	/**
	 * Adds the specified annotation to the model.
	 *
	 * @param {Object} annotation	The annotation to be added.
	 */
	jQuery.AnnoBuilderController.prototype.addAnnotation = function(annotation) {
		$.annobuilder.model.annotations.push(annotation);
	}

	/**
	 * Selects the specified annotation.
	 *
	 * @param {Object} annotation		The annotation to be selected.
	 */
	jQuery.AnnoBuilderController.prototype.selectAnnotation = function(annotation) {

		// select the specified annotation
		if (annotation != null) {
			$.annobuilder.model.lastSelectedURL = annotation.body.url;
			$.annobuilder.model.selectedAnnotation = annotation;
			$.annobuilder.view.builder.update();

		// otherwise, select the top-most annotation (if there is one)
		} else {
			if ($.annobuilder.model.annotations.length > 0) {
				setTimeout(function() {
					$.annobuilder.controller.selectAnnotation($.annobuilder.view.builder.annotationList.find('.annotationChip').eq(0).data('annotation'));
				}, 1000);
			}
		}

	}

}

/**
 * View object for the annobuilder.
 * @constructor
 */
jQuery.AnnoBuilderView = function() {

	this.builder = null;			// View for the actual builder interface

	/**
	 * Intializes the master view.
	 */
	jQuery.AnnoBuilderView.prototype.setup = function(json) {

		// create the interface view that we need
		switch ($.annobuilder.model.node.current.mediaSource.contentType) {

			case "audio":
			case "video":
			case "image":
      case "3D":
			case "3D-GIS":
			this.builder = new $.AnnoBuilderInterfaceView();
			break;

			case "document":
			if (($.annobuilder.model.node.current.mediaSource.name == 'PlainText') || ($.annobuilder.model.node.current.mediaSource.name == 'SourceCode')) {
				this.builder = new $.AnnoBuilderInterfaceView();
			} else {
				/*if ($.annobuilder.model.node.current.mediaSource.name == 'PlainText') {
					this.container = $('<div class="annobuilderWarning">To create a new annotation for this text file, click the "New" button below and follow the annotation instructions in the "Relationships" section.</div>');
				} else {*/
					this.container = $('<div class="annobuilderWarning">This type of media cannot be annotated in Scalar.</div>');
				//}
				$($.annobuilder.model.element).html(this.container);
			}
			break;

			default:
			this.container = $('<div class="annobuilderWarning">This type of media cannot be annotated in Scalar.</div>');
			$($.annobuilder.model.element).html(this.container);
			break;

		}

		if (this.builder) this.builder.setup();

	}

	/**
	 * Shortens the specified string to the given character length, adding a [continued]
	 * if any shortening actually occurs.
	 *
	 * @param {String} string		The string to be shortened.
	 * @param {Number} maxChars		Desired character length of the string (not including '[continued]')
	 * @return						The modified string.
	 */
	jQuery.AnnoBuilderView.prototype.shorten = function(string, maxChars) {

		var result;
		if (string == null) {
			string = '';
			result = '';
		} else {
			result = string.substr(0, 70);
		}
		if (string.length > 70) {
			result += '... [continued]';
		}

		return result;
	}

	/**
	 * Converts null strings into empty strings.
	 *
	 * @param {String} string		The null string to be converted to empty.
	 * @return						The converted string (if null) or the original string (if not).
	 */
	jQuery.AnnoBuilderView.prototype.nullToEmpty = function(string) {
		return (string == null) ? '' : string;
	}

}

/**
 * View for annotation editor interface.
 * @constructor
 */
jQuery.AnnoBuilderInterfaceView = function() {

	var me = this;

	this.container = null;						// table container
	this.annotationList = null;					// list of annotations
	this.footerControls = null;					// footer controls
	this.saveRequestCount = 0;					// number of save requests sent
	this.saveResultCount = 0;					// number of save request results received
	this.saveErrorOccurred = false;				// did an error occur during the last save?
	this.propertiesBeingEdited = [];			// array of properties currently being edited
	this.dirtyAnnotations = [];					// array of dirty annotations
	this.newAnnotationURL = null;				// url of the annotation just added
	this.annotatedImage = null;					// storage for the annotated image (if needed)

	/**
	 * Intializes the builder view.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.setup = function() {

		this.container = $('<div class="annotationListContainer"></div>');
		$($.annobuilder.model.element).append(this.container);

		var leftColumn = $('<div class="left_column"></div>').appendTo(this.container);
		this.annotationList = $('<div class="annotationList"></div>').appendTo(leftColumn);

		var buttonBar = $('<div class="button_bar"><a class="bar_button" role="button" href="javascript:;"><img src="'+widgets_uri+'/annobuilder/plus_btn.png" alt="Add" width="13" height="13" /></a><a class="bar_button" role="button" href="javascript:;"><img src="'+widgets_uri+'/annobuilder/minus_btn.png" alt="Trash" width="13" height="13" /></a></div>').appendTo(leftColumn);
		buttonBar.find('a').eq(1).on('click', this.handleDelete);
		buttonBar.find('a').eq(0).on('click', this.handleAdd);

		this.annotationFormMessage = $('<div class="annotationFormMessage">Create a new annotation using the plus button, or select an existing annotation from the list to the left.</div>').appendTo(this.container);

		this.annotationForm = $('<div class="annotationForm"><table class="form_fields form-inline"><tbody></tbody></table></div>').appendTo(this.container);
		this.annotationForm.find('tbody').append('<tr><td class="field">Title</td><td class="value"><input id="annotationTitle" class="form-control" type="text" size="45" onchange="$.annobuilder.view.builder.handleEditTitle()" onkeyup="$.annobuilder.view.builder.handleEditTitle()"/></td></tr>');

		switch ($.annobuilder.model.node.current.mediaSource.contentType) {

			case 'audio':
			case 'video':
			this.annotationForm.find('tbody').append('<tr><td class="field"></td><td class="value">Start: <span id="startTime">00:00:00</span> &nbsp;<a id="setStartTimeBtn" class="btn btn-success btn-sm generic_button border_radius" role="button" style="margin-right:20px;">Set</a> End: <span id="endTime">00:00:00</span> &nbsp;<a id="setEndTimeBtn" class="btn btn-success btn-sm generic_button border_radius" role="button">Set</a></td></tr>');
			break;

			case 'image':
			this.annotationFormMessage.text("Click and drag on the image to create a new annotation, or select an existing annotation from the list to the left.");
			// cantaloupe-only instructions
			var instructions = '';
			if ( $( 'article' ).length ) {
				instructions = 'For quick adjustments, click a numeric field and use mouse wheel.';
			}
			this.annotationForm.find('tbody').append('<tr><td class="field">X</td><td class="value">' +
				'<div class="form-group">' +
					'<input id="x" class="form-control" type="text" size="6" onchange="$.annobuilder.view.builder.handleEditDimensions()" onkeyup="$.annobuilder.view.builder.handleEditDimensions()"> ' +
					'<select name="xDimType" class="form-control" onchange="$.annobuilder.view.builder.handleEditDimensions()" selectedIndex="1">' +
						'<option value="percent">%</option>' +
						'<option value="pixels">px</option>' +
					'</select>' +
				'</div></td></tr>' +
			'<tr><td class="field">Y</td><td class="value">' +
				'<div class="form-group">' +
					'<input id="y" class="form-control" type="text" size="6" onchange="$.annobuilder.view.builder.handleEditDimensions()" onkeyup="$.annobuilder.view.builder.handleEditDimensions()"> ' +
					'<select name="yDimType" class="form-control" onchange="$.annobuilder.view.builder.handleEditDimensions()" selectedIndex="1">' +
						'<option value="percent">%</option>' +
						'<option value="pixels">px</option>' +
					'</select>' +
				'</div></td></tr>');
			this.annotationForm.find('tbody').append('<tr><td class="field">Width</td><td class="value">' +
				'<div class="form-group">' +
					'<input id="width" class="form-control" type="text" size="6" onchange="$.annobuilder.view.builder.handleEditDimensions()" onkeyup="$.annobuilder.view.builder.handleEditDimensions()"> ' +
					'<select name="widthDimType" class="form-control" onchange="$.annobuilder.view.builder.handleEditDimensions()" selectedIndex="1">' +
						'<option value="percent">%</option>' +
						'<option value="pixels">px</option>' +
					'</select>' +
				'</div></td></tr>' +
			'<tr><td class="field">Height</td><td class="value">' +
				'<div class="form-group">' +
					'<input id="height" class="form-control" type="text" size="6" onchange="$.annobuilder.view.builder.handleEditDimensions()" onkeyup="$.annobuilder.view.builder.handleEditDimensions()"> ' +
					'<select name="heightDimType" class="form-control" onchange="$.annobuilder.view.builder.handleEditDimensions()" selectedIndex="1">' +
						'<option value="percent">%</option>' +
						'<option value="pixels">px</option>' +
					'</select>' +
				'</div><br><span style="font-size: small; line-height: 90%;">' + instructions + '</span></td></tr>');
			// if cantaloupe
			if ( $( 'article' ).length ) {
				$( "#x" ).TouchSpin({ min: 0, max: 1000000000, step: 1, decimals: 2, forcestepdivisibility: 'none' });
				$( "#x" ).parent().append( $( 'select[name="xDimType"]' ) );
				$( "#y" ).TouchSpin({ min: 0, max: 1000000000, step: 1, decimals: 2, forcestepdivisibility: 'none' });
				$( "#y" ).parent().append( $( 'select[name="yDimType"]' ) );
				$( "#width" ).TouchSpin({ min: 0, max: 1000000000, step: 1, decimals: 2, forcestepdivisibility: 'none' });
				$( "#width" ).parent().append( $( 'select[name="widthDimType"]' ) );
				$( "#height" ).TouchSpin({ min: 0, max: 1000000000, step: 1, decimals: 2, forcestepdivisibility: 'none' });
				$( "#height" ).parent().append( $( 'select[name="heightDimType"]' ) );
			}
			break;

			case 'document':
			this.annotationForm.find('tbody').append('<tr><td class="field"></td><td class="value">Starting line: <input id="startLine" class="form-control" type="text" size="6" onchange="$.annobuilder.view.builder.handleEditLineExtents()" onkeyup="$.annobuilder.view.builder.handleEditLineExtents()">&nbsp;&nbsp; Ending line: <input id="endLine" class="form-control" type="text" size="6" onchange="$.annobuilder.view.builder.handleEditLineExtents()" onkeyup="$.annobuilder.view.builder.handleEditLineExtents()"></td></tr>');
			break;

			case '3D-GIS':
				// cantaloupe-only instructions
				var instructions = '';
				if ( $( 'article' ).length ) {
					instructions = 'For quick adjustments, click a numeric field and use mouse wheel.';
				}
				this.annotationForm.find('tbody').append('<tr><td class="field">Latitude</td><td class="value">' +
					'<div class="form-group">' +
						'<input id="latitude" class="form-control" type="text" size="3" onchange="$.annobuilder.view.builder.handleEditPositionGIS()" onkeyup="$.annobuilder.view.builder.handleEditPositionGIS()"> ' +
					'</div></td></tr>' +
				'<tr><td class="field">Longitude</td><td class="value">' +
					'<div class="form-group">' +
						'<input id="longitude" class="form-control" type="text" size="3" onchange="$.annobuilder.view.builder.handleEditPositionGIS()" onkeyup="$.annobuilder.view.builder.handleEditPositionGIS()"> ' +
					'</div></td></tr>' +
				'<tr><td class="field">Altitude</td><td class="value">' +
					'<div class="form-group">' +
						'<input id="altitude" class="form-control" type="text" size="3" onchange="$.annobuilder.view.builder.handleEditPositionGIS()" onkeyup="$.annobuilder.view.builder.handleEditPositionGIS()"> ' +
					'</div></td></tr>' +
				'<tr><td class="field">Heading</td><td class="value">' +
					'<div class="form-group">' +
						'<input id="heading" class="form-control" type="text" size="6" onchange="$.annobuilder.view.builder.handleEditPositionGIS()" onkeyup="$.annobuilder.view.builder.handleEditPositionGIS()"> ' +
					'</div></td></tr>' +
				'<tr><td class="field">Tilt</td><td class="value">' +
					'<div class="form-group">' +
						'<input id="tilt" class="form-control" type="text" size="6" onchange="$.annobuilder.view.builder.handleEditPositionGIS()" onkeyup="$.annobuilder.view.builder.handleEditPositionGIS()"> ' +
					'</div></td></tr>' +
				'<tr><td class="field">Field of View</td><td class="value">' +
					'<div class="form-group">' +
						'<input id="fieldOfView" class="form-control" type="text" size="6" onchange="$.annobuilder.view.builder.handleEditPositionGIS()" onkeyup="$.annobuilder.view.builder.handleEditPositionGIS()"> ' +
					'</div></td></tr>' +
				'<tr><td class="field"></td><td class="value">' +
					'<div><a id="setPositionGISBtn" class="btn btn-success btn-sm generic_button border_radius" role="button" style="margin-right:20px;">Set all values from current view</a></div></td></tr>' +
					'</div><br><span style="font-size: small; line-height: 90%;">' + instructions + '</span></td></tr>');
				// if cantaloupe
				if ( $( 'article' ).length ) {
					$( "#latitude" ).TouchSpin({ min: -1000000000, max: 1000000000, step: 1, decimals: 2, boostat:5, mousewheel:true, forcestepdivisibility: 'none' });
					$( "#longitude" ).TouchSpin({ min: -1000000000, max: 1000000000, step: 1, decimals: 2, boostat:5, mousewheel:true, forcestepdivisibility: 'none' });
					$( "#altitude" ).TouchSpin({ min: -1000000000, max: 1000000000, step: 1, decimals: 2, boostat:5, mousewheel:true, forcestepdivisibility: 'none' });
					$( "#heading" ).TouchSpin({ min: -1000000000, max: 1000000000, step: 1, decimals: 2, boostat:5, mousewheel:true, forcestepdivisibility: 'none' });
					$( "#tilt" ).TouchSpin({ min: -1000000000, max: 1000000000, step: 1, decimals: 2, boostat:5, mousewheel:true, forcestepdivisibility: 'none' });
					$( "#fieldOfView" ).TouchSpin({ min: 0, max: 1000000000, step: 1, decimals: 2, boostat:5, mousewheel:true, forcestepdivisibility: 'none' });
				}
				break;

			case '3D':
				console.log($.annobuilder.model.node.current.mediaSource.contentType);
			// cantaloupe-only instructions
			var instructions = '';
			if ( $( 'article' ).length ) {
				instructions = 'For quick adjustments, click a numeric field and use mouse wheel.';
			}
			this.annotationForm.find('tbody').append('<tr><td class="field">Target</td><td class="value">' +
				'<div class="form-group">' +
					'<input id="targetX" class="form-control" type="text" size="3" onchange="$.annobuilder.view.builder.handleEditPosition3D()" onkeyup="$.annobuilder.view.builder.handleEditPosition3D()"> ' +
				'</div>&nbsp;' +
				'<div class="form-group">' +
					'<input id="targetY" class="form-control" type="text" size="3" onchange="$.annobuilder.view.builder.handleEditPosition3D()" onkeyup="$.annobuilder.view.builder.handleEditPosition3D()"> ' +
				'</div>&nbsp;' +
				'<div class="form-group">' +
					'<input id="targetZ" class="form-control" type="text" size="3" onchange="$.annobuilder.view.builder.handleEditPosition3D()" onkeyup="$.annobuilder.view.builder.handleEditPosition3D()"> ' +
				'</div></td></tr>' +
			'<tr><td class="field">Camera</td><td class="value">' +
				'<div class="form-group">' +
					'<input id="cameraX" class="form-control" type="text" size="3" onchange="$.annobuilder.view.builder.handleEditPosition3D()" onkeyup="$.annobuilder.view.builder.handleEditPosition3D()"> ' +
				'</div>&nbsp;' +
				'<div class="form-group">' +
					'<input id="cameraY" class="form-control" type="text" size="3" onchange="$.annobuilder.view.builder.handleEditPosition3D()" onkeyup="$.annobuilder.view.builder.handleEditPosition3D()"> ' +
				'</div>&nbsp;' +
				'<div class="form-group">' +
					'<input id="cameraZ" class="form-control" type="text" size="3" onchange="$.annobuilder.view.builder.handleEditPosition3D()" onkeyup="$.annobuilder.view.builder.handleEditPosition3D()"> ' +
				'</div></td></tr>' +
			'<tr><td class="field">Roll</td><td class="value">' +
				'<div class="form-group">' +
					'<input id="roll" class="form-control" type="text" size="6" onchange="$.annobuilder.view.builder.handleEditPosition3D()" onkeyup="$.annobuilder.view.builder.handleEditPosition3D()"> ' +
				'</div></td></tr>' +
			'<tr><td class="field">Field of View</td><td class="value">' +
				'<div class="form-group">' +
					'<input id="fieldOfView" class="form-control" type="text" size="6" onchange="$.annobuilder.view.builder.handleEditPosition3D()" onkeyup="$.annobuilder.view.builder.handleEditPosition3D()"> ' +
				'</div></td></tr>' +
			'<tr><td class="field"></td><td class="value">' +
				'<div><a id="setPosition3DBtn" class="btn btn-success btn-sm generic_button border_radius" role="button" style="margin-right:20px;">Set all values from current view</a></div></td></tr>' +
				'</div><br><span style="font-size: small; line-height: 90%;">' + instructions + '</span></td></tr>');
			// if cantaloupe
			if ( $( 'article' ).length ) {
				$( "#targetX" ).TouchSpin({ min: -1000000000, max: 1000000000, step: 1, decimals: 2, boostat:5, mousewheel:true, forcestepdivisibility: 'none' });
				$( "#targetY" ).TouchSpin({ min: -1000000000, max: 1000000000, step: 1, decimals: 2, boostat:5, mousewheel:true, forcestepdivisibility: 'none' });
				$( "#targetZ" ).TouchSpin({ min: -1000000000, max: 1000000000, step: 1, decimals: 2, boostat:5, mousewheel:true, forcestepdivisibility: 'none' });
				$( "#cameraX" ).TouchSpin({ min: -1000000000, max: 1000000000, step: 1, decimals: 2, boostat:5, mousewheel:true, forcestepdivisibility: 'none' });
				$( "#cameraY" ).TouchSpin({ min: -1000000000, max: 1000000000, step: 1, decimals: 2, boostat:5, mousewheel:true, forcestepdivisibility: 'none' });
				$( "#cameraZ" ).TouchSpin({ min: -1000000000, max: 1000000000, step: 1, decimals: 2, boostat:5, mousewheel:true, forcestepdivisibility: 'none' });
				$( "#roll" ).TouchSpin({ min: -1000000000, max: 1000000000, step: 1, decimals: 2, boostat:5, mousewheel:true, forcestepdivisibility: 'none' });
				$( "#fieldOfView" ).TouchSpin({ min: 0, max: 1000000000, step: 1, decimals: 2, boostat:5, mousewheel:true, forcestepdivisibility: 'none' });
			}
			break;

		}

		this.annotationForm.find('tbody').append('<tr><td class="field">Content</td><td class="value"><div class="help_button"><a role="button">?</a><em>The full content of the annotation.</em></div><textarea id="annotationContent" class="form-control" type="text" cols="40" rows="6" onchange="$.annobuilder.view.builder.handleEditContent()" onkeyup="$.annobuilder.view.builder.handleEditContent()"/></td></tr>');
		this.annotationForm.find('tbody').append('<tr><td class="field">Description</td><td class="value"><input id="annotationDescription" class="form-control" type="text" size="43" onchange="$.annobuilder.view.builder.handleEditDescription()" onkeyup="$.annobuilder.view.builder.handleEditDescription()"/><div class="help_button"><a role="button">?</a><em>Optional descripiton of the annotation.</em></div></td></tr>');
	    this.annotationForm.find('tbody').append('<tr><td class="field">Tags</td><td class="value" style="vertical-align:middle;"><div class="help_button"><a role="button">?</a><em>You can select one or more content items to tag this annotation.</em></div><span class="tagged_by_msg" style="display:none;">This annotation is tagged by:</span><ul style="display:none;" id="taggedBy"></ul><div class="form_fields_sub_element"><a class="btn btn-default btn-sm" id="tagButton" role="button">Add tags</a></div></td></tr>');

		$('#setStartTimeBtn').on('click', this.handleSetStartTime);
		$('#setEndTimeBtn').on('click', this.handleSetEndTime);
    $('#setPosition3DBtn').on('click', this.handleSetPosition3D);
    $('#setPositionGISBtn').on('click', this.handleSetPositionGIS);

		$('#tagButton').on('click', function() {
			$('<div></div>').content_selector({
				/* type:'tag', */
				changeable:true,
				multiple:true,
				onthefly:true,
				msg:'Choose one or more items to tag the annotation<br />"tags" contains pages that already have tag behavior, "terms" contains imported taxonomy terms',
				callback:$.annobuilder.view.builder.handleAddTags
			});
		});

		this.footerControls = $('<div class="annotationFooterControls"></div>').appendTo($.annobuilder.model.element);

		var footerRight = $('<span class="annotationFooterRight"></span>').appendTo(this.footerControls);
		if ($.annobuilder.model.node.current.mediaSource.contentType == 'video') {
			var footerLeft = $('<p class="smaller" style="margin-top:7px;">Note: Time-based annotations may not work on mobile devices.</p>').appendTo(this.footerControls);
		}

		footerRight.append('<div id="spinner_wrapper"></div>');

		var saveLink = $('<span id="saveLink"><strong>You have unsaved changes.</strong> <a class="btn btn-primary generic_button large default" role="button" href="javascript:;">Save</a></span>').appendTo(footerRight);
		saveLink.on('click', this.handleSave);
		saveLink.css('display', 'none');
		var doneMessage = $('<span id="doneMessage">Your changes were saved.</span>').appendTo(footerRight);
		doneMessage.css('display', 'none');

		var doneButton = $('<a class="btn btn-default generic_button large" role="button" href="javascript:;">Done</a>').appendTo(footerRight);
		doneButton.on('click', function() {
			var temp = document.location.href.split('.');
			temp.pop();
			var selfUrl = temp.join('.');
			if ($.annobuilder.view.builder.dirtyAnnotations.length > 0) {
				if (confirm('Are you sure you want to leave the editor? Your unsaved changes will be lost.')) {
					window.location = selfUrl;
				}
			} else {
				window.location = selfUrl;
			}
		});

		$(".help_button").on('click', function() {
			if ($(this).find('em').css('display') == 'none') {
				$(this).find("em").stop(true, true).animate({opacity: "show", left: "20"}, "slow");
			} else {
				$(this).find("em").animate({opacity: "hide", left: "30"}, "fast");
			}
		});

		if ( $.annobuilder.model.node.current.mediaSource.contentType == 'image' ) {
			anno.addHandler( "onAnnotationCreated", $.annobuilder.view.builder.handleAnnotoriousAnnotationCreated );
			anno.addHandler( "onAnnotationUpdated", $.annobuilder.view.builder.handleAnnotoriousAnnotationUpdated );
			anno.addHandler( "onAnnotationRemoved", $.annobuilder.view.builder.handleDelete );
		}

    if ( $.annobuilder.model.node.current.mediaSource.name == 'Unity WebGL' ) {
      window.addEventListener('message', $.annobuilder.view.builder.handleReturnPosition3D);
    }

		$.annobuilder.view.builder.update();

	}

	/**
	 * Builds the list of annotations.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.buildList = function() {

		var me = this;

		// preserve any unsaved edits
		var editTracking = {};
		$('.annotationList > .annotationChip').each(function() {
			var edits = $(this).data('edits');
			var annotation = $(this).data('annotation');
			if (edits) {
				editTracking[annotation.body.url] = {annotation:annotation, edits:edits};
			}
		});

		this.annotationList.empty();

		var row;
		var value;
		var editor;
		var annotation;
		var annotationChip;
		var control;
		var edits;
		var i;
		var n = $.annobuilder.model.annotations.length;
		for (i=0; i<n; i++) {

			annotation = $.annobuilder.model.annotations[i];

			// zebra striping
			((i % 2) == 0) ? stripeType = 'light' : stripeType = 'dark';
			annotationChip =  $('<div class="annotationChip '+stripeType+'"></div>');

			extents = $('<p class="annotationExtents"></p>');
			var link;
			link = $('<a href="javascript:;">'+annotation.startString+annotation.separator+annotation.endString+'</a>').appendTo(extents);

			annotationChip.data('annotation', annotation);

			// handle click on annotation in list
			annotationChip.on('click',  function() {
				var annotation = $(this).data('annotation');
				var edits = $(this).data('edits');
				switch ($.annobuilder.model.node.current.mediaSource.contentType) {

					case 'video':
					case 'audio':
					case 'document':
					if (edits) {
						$.annobuilder.model.mediaElement.seek(edits.start);
					} else {
						$.annobuilder.model.mediaElement.seek(annotation.properties.start);
					}
					break;

          case '3D':
					case '3D-GIS':
          if (edits) {
            $.annobuilder.model.mediaElement.seek(edits);
          } else {
            $.annobuilder.model.mediaElement.seek(annotation.properties);
          }
          break;

				}
				// if this annotation is not the currently selected one, then store the current edits
				if (annotation != $.annobuilder.model.selectedAnnotation) {
					$.annobuilder.view.builder.storeEdits();
				}
				$.annobuilder.controller.selectAnnotation(annotation);
			});

			// restore unsaved edits
			switch ($.annobuilder.model.node.current.mediaSource.contentType) {

				case 'video':
				case 'audio':
				if (editTracking[annotation.body.url]) {
					edits =  editTracking[annotation.body.url].edits;
					annotationChip.data('edits', edits);
					annotationChip.append('<p class="annotationTitle"><a href="javascript:;">'+scalarapi.decimalSecondsToHMMSS(edits.start)+'</a>&nbsp; <strong>'+edits.title+'</strong></p>');
				} else {
					annotationChip.append('<p class="annotationTitle"><a href="javascript:;">'+annotation.startString+'</a>&nbsp; <strong>'+annotation.body.current.title+'</strong></p>');
				}
				break;

				case 'image':
				if (editTracking[annotation.body.url]) {
					edits =  editTracking[annotation.body.url].edits;
					annotationChip.data('edits', edits);
					annotationChip.append('<p class="annotationTitle"><a href="javascript:;">X:'+edits.x+' Y:'+edits.y+'</a>&nbsp; <strong>'+edits.title+'</strong></p>');
				} else {
					annotationChip.append('<p class="annotationTitle"><a href="javascript:;">'+annotation.startString+'</a>&nbsp; <strong>'+annotation.body.current.title+'</strong></p>');
				}
				break;

				case 'document':
				if (editTracking[annotation.body.url]) {
					edits =  editTracking[annotation.body.url].edits;
					annotationChip.data('edits', edits);
					annotationChip.append('<p class="annotationTitle"><a href="javascript:;">Line '+edits.start+'</a>&nbsp; <strong>'+edits.title+'</strong></p>');
				} else {
					annotationChip.append('<p class="annotationTitle"><a href="javascript:;">'+annotation.startString+'</a>&nbsp; <strong>'+annotation.body.current.title+'</strong></p>');
				}
				break;

        case '3D':
				if (editTracking[annotation.body.url]) {
					edits =  editTracking[annotation.body.url].edits;
					annotationChip.data('edits', edits);
					annotationChip.append('<p class="annotationTitle"><a href="javascript:;">X:'+Math.round(edits.targetX)+' Y:'+Math.round(edits.targetY)+' Z:'+Math.round(edits.targetZ)+'</a>&nbsp; <strong>'+edits.title+'</strong></p>');
				} else {
					annotationChip.append('<p class="annotationTitle"><a href="javascript:;">'+annotation.startString+'</a>&nbsp; <strong>'+annotation.body.current.title+'</strong></p>');
				}
        break;

        case '3D-GIS':
				if (editTracking[annotation.body.url]) {
					edits =  editTracking[annotation.body.url].edits;
					annotationChip.data('edits', edits);
					annotationChip.append('<p class="annotationTitle"><a href="javascript:;">Lat:'+Math.round(edits.latitude)+' Lon:'+Math.round(edits.longitude)+' Alt:'+Math.round(edits.altitude)+'</a>&nbsp; <strong>'+edits.title+'</strong></p>');
				} else {
					annotationChip.append('<p class="annotationTitle"><a href="javascript:;">'+annotation.startString+'</a>&nbsp; <strong>'+annotation.body.current.title+'</strong></p>');
				}
        break;

			}

			if (this.annotationSidebar) {
				this.annotationSidebar.append(annotationChip);
			}
			this.annotationList.append(annotationChip);

		}

		// spacer so the last item doesn't get hidden by the button bar
		this.annotationList.append('<div style="height:25px"></div>');

		// try to preserve the last selection
		var annotation = $.annobuilder.model.getAnnotationFromURL($.annobuilder.model.lastSelectedURL);
		if (annotation) {
			$.annobuilder.controller.selectAnnotation(annotation);
		}

	}

	/**
	 * Parses string data for a spatial annotation and returns an object representing each
	 * element's value and type.
	 *
	 * @param xStr			String representing the x coordinate.
	 * @param yStr			String representing the y coordinate.
	 * @param widthStr		String representing the width.
	 * @param heightStr		String representing the height.
	 * @return				Object encapsulating the dimensions.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.parseDimensions = function(xStr, yStr, widthStr, heightStr) {

		var dimensions = {};

		if (xStr.charAt(xStr.length - 1) == '%') {
			dimensions.x = parseFloat(xStr.substr(0, xStr.length - 1));
			dimensions.xType = 'percent';
		} else {
			dimensions.x = parseFloat(xStr);
			dimensions.xType = 'pixels';
		}

		if (yStr.charAt(yStr.length - 1) == '%') {
			dimensions.y = parseFloat(yStr.substr(0, yStr.length - 1));
			dimensions.yType = 'percent';
		} else {
			dimensions.y = parseFloat(yStr);
			dimensions.yType = 'pixels';
		}

		if (widthStr.charAt(widthStr.length - 1) == '%') {
			dimensions.width = parseFloat(widthStr.substr(0, widthStr.length - 1));
			dimensions.widthType = 'percent';
		} else {
			dimensions.width = parseFloat(widthStr);
			dimensions.widthType = 'pixels';
		}

		if (heightStr.charAt(heightStr.length - 1) == '%') {
			dimensions.height = parseFloat(heightStr.substr(0, heightStr.length - 1));
			dimensions.heightType = 'percent';
		} else {
			dimensions.height = parseFloat(heightStr);
			dimensions.heightType = 'pixels';
		}

		return dimensions;
	}

 jQuery.AnnoBuilderInterfaceView.prototype.parsePosition3D = function(targetXStr, targetYStr, targetZStr, cameraXStr, cameraYStr, cameraZStr, rollStr, fieldOfViewStr) {
    var dimensions = {};
    if (!targetXStr) targetXStr = '0';
    if (!targetYStr) targetYStr = '0';
    if (!targetZStr) targetZStr = '0';
    if (!cameraXStr) cameraXStr = '0';
    if (!cameraYStr) cameraYStr = '0';
    if (!cameraZStr) cameraZStr = '0';
    if (!rollStr) rollStr = '0';
    if (!fieldOfViewStr) fieldOfViewStr = '60';
    dimensions.targetX = parseFloat(targetXStr);
    dimensions.targetY = parseFloat(targetYStr);
    dimensions.targetZ = parseFloat(targetZStr);
    dimensions.cameraX = parseFloat(cameraXStr);
    dimensions.cameraY = parseFloat(cameraYStr);
    dimensions.cameraZ = parseFloat(cameraZStr);
    dimensions.roll = parseFloat(rollStr);
    dimensions.fieldOfView = parseFloat(fieldOfViewStr);
    return dimensions;
 }

 jQuery.AnnoBuilderInterfaceView.prototype.parsePositionGIS = function(latitudeStr, longitudeStr, altitudeStr, headingStr, tiltStr, fieldOfViewStr) {
    var dimensions = {};
    if (!latitudeStr) latitudeStr = '0';
    if (!longitudeStr) longitudeStr = '0';
    if (!altitudeStr) altitudeStr = '0';
    if (!headingStr) headingStr = '0';
    if (!tiltStr) tiltStr = '0';
    if (!fieldOfViewStr) fieldOfViewStr = '60';
    dimensions.latitude = parseFloat(latitudeStr);
    dimensions.longitude = parseFloat(longitudeStr);
    dimensions.altitude = parseFloat(altitudeStr);
    dimensions.heading = parseFloat(headingStr);
    dimensions.tilt = parseFloat(tiltStr);
    dimensions.fieldOfView = parseFloat(fieldOfViewStr);
    return dimensions;
 }

	/**
	 * Unparses form data for a spatial annotation and returns an object containing
	 * the string representations of its dimensions.
	 *
	 * @param edits {Object}			Edited dimensions to be unparsed (if omitted, will operate on current form contents)
	 * @return							Object with string encapsulation of dimensions.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.unparseDimensions = function(edits) {

		var dimensions = {};

		if (edits) {
			dimensions.x = edits.x;
			dimensions.y = edits.y;
			dimensions.width = edits.width;
			dimensions.height = edits.height;
		} else {
			dimensions.x = $('#x').val().toString();
			if (dimensions.x == '') dimensions.x = '0';
			if ($('select[name=xDimType]')[0].selectedIndex == 0) dimensions.x += '%';
			dimensions.y = $('#y').val().toString();
			if (dimensions.y == '') dimensions.y = '0';
			if ($('select[name=yDimType]')[0].selectedIndex == 0) dimensions.y += '%';
			dimensions.width = $('#width').val().toString();
			if (dimensions.width == '') dimensions.width = '0';
			if ($('select[name=widthDimType]')[0].selectedIndex == 0) dimensions.width += '%';
			dimensions.height = $('#height').val().toString();
			if (dimensions.height == '') dimensions.height = '0';
			if ($('select[name=heightDimType]')[0].selectedIndex == 0) dimensions.height += '%';
		}

		dimensions.string = dimensions.x+','+dimensions.y+','+dimensions.width+','+dimensions.height;

		return dimensions;
	}

	/**
	 * Unparses form data for a 3D annotation and returns an object containing
	 * the string representations of its position.
	 *
	 * @param edits {Object}			Edited position to be unparsed (if omitted, will operate on current form contents)
	 * @return							Object with string encapsulation of position.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.unparsePosition3D = function(edits) {

		var position3D = {};

		if (edits) {
			position3D.targetX = edits.targetX;
			position3D.targetY = edits.targetY;
			position3D.targetZ = edits.targetZ;
			position3D.cameraX = edits.cameraX;
			position3D.cameraY = edits.cameraY;
			position3D.cameraZ = edits.cameraZ;
			position3D.roll = edits.roll;
			position3D.fieldOfView = edits.fieldOfView;
		} else {
			position3D.targetX = $('#targetX').val().toString();
			if (position3D.targetX == '') position3D.targetX = '0';
			position3D.targetY = $('#targetY').val().toString();
			if (position3D.targetY == '') position3D.targetY = '0';
			position3D.targetZ = $('#targetZ').val().toString();
			if (position3D.targetZ == '') position3D.targetZ = '0';
			position3D.cameraX = $('#cameraX').val().toString();
			if (position3D.cameraX == '') position3D.cameraX = '0';
			position3D.cameraY = $('#cameraY').val().toString();
			if (position3D.cameraY == '') position3D.cameraY = '0';
			position3D.cameraZ = $('#cameraZ').val().toString();
			if (position3D.cameraZ == '') position3D.cameraZ = '0';
			position3D.roll = $('#roll').val().toString();
			if (position3D.roll == '') position3D.roll = '0';
			position3D.fieldOfView = $('#fieldOfView').val().toString();
			if (position3D.fieldOfView == '') position3D.fieldOfView = '0';
		}

		position3D.string = position3D.targetX+','+position3D.targetY+','+position3D.targetZ+','+position3D.cameraX+','+position3D.cameraY+','+position3D.cameraZ+','+position3D.roll+','+position3D.fieldOfView;

		return position3D;
	}

	/**
	 * Unparses form data for a 3D GIS annotation and returns an object containing
	 * the string representations of its position.
	 *
	 * @param edits {Object}			Edited position to be unparsed (if omitted, will operate on current form contents)
	 * @return							Object with string encapsulation of position.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.unparsePositionGIS = function(edits) {

		var positionGIS = {};

		if (edits) {
			positionGIS.latitude = edits.latitude;
			positionGIS.longitude = edits.longitude;
			positionGIS.altitude = edits.altitude;
			positionGIS.heading = edits.heading;
			positionGIS.tilt = edits.tilt;
			positionGIS.fieldOfView = edits.fieldOfView;
		} else {
			positionGIS.latitude = $('#latitude').val().toString();
			if (positionGIS.latitude == '') positionGIS.latitude = '0';
			positionGIS.longitude = $('#longitude').val().toString();
			if (positionGIS.longitude == '') positionGIS.longitude = '0';
			positionGIS.altitude = $('#altitude').val().toString();
			if (positionGIS.altitude == '') positionGIS.altitude = '0';
			positionGIS.heading = $('#heading').val().toString();
			if (positionGIS.heading == '') positionGIS.heading = '0';
			positionGIS.tilt = $('#tilt').val().toString();
			if (positionGIS.tilt == '') positionGIS.tilt = '0';
			positionGIS.fieldOfView = $('#fieldOfView').val().toString();
			if (positionGIS.fieldOfView == '') positionGIS.fieldOfView = '0';
		}

		positionGIS.string = positionGIS.latitude+','+positionGIS.longitude+','+positionGIS.altitude+','+positionGIS.heading+','+positionGIS.tilt+','+positionGIS.fieldOfView;

		return positionGIS;
	}


	/**
	 * Updates the list of annotations.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.update = function( updateForm = true, allowSeek = true ) {

		var me = this;

		// highlight selected annotation
		var annotation = $.annobuilder.model.selectedAnnotation;
		if (annotation != null) {
			var index = $.annobuilder.view.builder.indexForAnnotation(annotation);
			var row = this.annotationList.find('.annotationChip').eq(index);
			row.addClass('selectedAnnotationRow');

			// update form with contents of selected annotation
			var annotation;
			var isListDirty = false;
			var row;
			$('.annotationList > .annotationChip').each(function() {
				row = $(this);
				annotation = row.data('annotation');
				if ($.annobuilder.view.builder.dirtyAnnotations.indexOf(annotation.id) != -1) isListDirty = true;
				row.removeClass('selectedAnnotationRow');
				if (annotation == $.annobuilder.model.selectedAnnotation) {
					row.addClass('selectedAnnotationRow');
					var edits = row.data('edits');

					// sometimes we don't want the form contents updated (like if the user is editing the form)
					if ( updateForm ) {
						switch ($.annobuilder.model.node.current.mediaSource.contentType) {

							case 'video':
							case 'audio':
							if (edits) {
								$('#annotationTitle').val(edits.title);
								$('#startTime').text(scalarapi.decimalSecondsToHMMSS(edits.start, true));
								$('#startTime').data('value', edits.start);
								$('#endTime').text(scalarapi.decimalSecondsToHMMSS(edits.end, true));
								$('#endTime').data('value', edits.end);
								$('#annotationDescription').val(edits.description);
								$('#annotationContent').val(edits.content);
							} else {
								$('#annotationTitle').val(annotation.body.current.title);
								$('#startTime').text(scalarapi.decimalSecondsToHMMSS(annotation.properties.start, true));
								$('#startTime').data('value', annotation.properties.start);
								$('#endTime').text(scalarapi.decimalSecondsToHMMSS(annotation.properties.end, true));
								$('#endTime').data('value', annotation.properties.end);
								$('#annotationDescription').val(annotation.body.current.description);
								$('#annotationContent').val(annotation.body.current.content);
							}
							break;

							case 'image':
							var dimensions;
							if (edits) {
								$('#annotationTitle').val(edits.title);
								$('#annotationDescription').val(edits.description);
								$('#annotationContent').val(edits.content);
								dimensions = $.annobuilder.view.builder.parseDimensions(edits.x, edits.y, edits.width, edits.height);
								me.showSpatialAnnotation(edits.title, edits);
							} else {
								$('#annotationTitle').val(annotation.body.current.title);
								$('#annotationDescription').val(annotation.body.current.description);
								$('#annotationContent').val(annotation.body.current.content);
								dimensions = $.annobuilder.view.builder.parseDimensions(annotation.properties.x, annotation.properties.y, annotation.properties.width, annotation.properties.height);
								me.showSpatialAnnotation(annotation.body.getDisplayTitle(), annotation.properties);
							}
							$('#x').val(dimensions.x == 0 ? '' : dimensions.x);
							if (dimensions.xType == 'pixels') {
								$('select[name=xDimType]')[0].selectedIndex = 1;
							} else {
								$('select[name=xDimType]')[0].selectedIndex = 0;
							}
							$('#y').val(dimensions.y == 0 ? '' : dimensions.y);
							if (dimensions.yType == 'pixels') {
								$('select[name=yDimType]')[0].selectedIndex = 1;
							} else {
								$('select[name=yDimType]')[0].selectedIndex = 0;
							}
							$('#width').val(dimensions.width == 0 ? '' : dimensions.width);
							if (dimensions.widthType == 'pixels') {
								$('select[name=widthDimType]')[0].selectedIndex = 1;
							} else {
								$('select[name=widthDimType]')[0].selectedIndex = 0;
							}
							$('#height').val(dimensions.height == 0 ? '' : dimensions.height);
							if (dimensions.heightType == 'pixels') {
								$('select[name=heightDimType]')[0].selectedIndex = 1;
							} else {
								$('select[name=heightDimType]')[0].selectedIndex = 0;
							}
							break;

							case 'document':
							if (edits) {
								$('#annotationTitle').val(edits.title);
								$('#startLine').val(edits.start);
								$('#endLine').val(edits.end);
								$('#annotationDescription').val(edits.description);
								$('#annotationContent').val(edits.content);
							} else {
								$('#annotationTitle').val(annotation.body.current.title);
								$('#startLine').val(annotation.properties.start);
								$('#endLine').val(annotation.properties.end);
								$('#annotationDescription').val(annotation.body.current.description);
								$('#annotationContent').val(annotation.body.current.content);
							}
							break;

							case '3D':
							var dimensions;
							if (edits) {
								$('#annotationTitle').val(edits.title);
								$('#annotationDescription').val(edits.description);
								$('#annotationContent').val(edits.content);
								dimensions = $.annobuilder.view.builder.parsePosition3D(edits.targetX, edits.targetY, edits.targetZ, edits.cameraX, edits.cameraY, edits.cameraZ, edits.roll, edits.fieldOfView);
							} else {
								$('#annotationTitle').val(annotation.body.current.title);
								$('#annotationDescription').val(annotation.body.current.description);
								$('#annotationContent').val(annotation.body.current.content);
								dimensions = $.annobuilder.view.builder.parsePosition3D(annotation.properties.targetX, annotation.properties.targetY, annotation.properties.targetZ, annotation.properties.cameraX, annotation.properties.cameraY, annotation.properties.cameraZ, annotation.properties.roll, annotation.properties.fieldOfView);
							}
							$('#targetX').val(dimensions.targetX);
							$('#targetY').val(dimensions.targetY);
							$('#targetZ').val(dimensions.targetZ);
							$('#cameraX').val(dimensions.cameraX);
							$('#cameraY').val(dimensions.cameraY);
							$('#cameraZ').val(dimensions.cameraZ);
							$('#roll').val(dimensions.roll);
							$('#fieldOfView').val(dimensions.fieldOfView);
							break;

							case '3D-GIS':
							var dimensions;
							if (edits) {
								$('#annotationTitle').val(edits.title);
								$('#annotationDescription').val(edits.description);
								$('#annotationContent').val(edits.content);
								dimensions = $.annobuilder.view.builder.parsePositionGIS(edits.latitude, edits.longitude, edits.altitude, edits.heading, edits.tilt, edits.fieldOfView);
							} else {
								$('#annotationTitle').val(annotation.body.current.title);
								$('#annotationDescription').val(annotation.body.current.description);
								$('#annotationContent').val(annotation.body.current.content);
								dimensions = $.annobuilder.view.builder.parsePositionGIS(annotation.properties.latitude, annotation.properties.longitude, annotation.properties.altitude, annotation.properties.heading, annotation.properties.tilt, annotation.properties.fieldOfView);
							}
							$('#latitude').val(dimensions.latitude);
							$('#longitude').val(dimensions.longitude);
							$('#altitude').val(dimensions.altitude);
							$('#heading').val(dimensions.heading);
							$('#tilt').val(dimensions.tilt);
							$('#fieldOfView').val(dimensions.fieldOfView);
							break;

						}

						var taxNodes = annotation.body.incomingRelations;
						$('#taggedBy').empty();
						$('.tagged_by_msg, #taggedBy').hide();
						// Add the annotation's existing tags
						if ('undefined'!=typeof(edits) && 'undefined'!=typeof(edits.taxonomy)) {
							$('#taggedBy').html(edits.taxonomy);
							$('.tagged_by_msg, #taggedBy').show();
							$('#taggedBy .remove a').on('click', me.handleRemoveTags);
						} else if(taxNodes.length !=0) {
							var hasTaxNodes = false;
							for (var j in taxNodes) {
								var slug = taxNodes[j].body.slug;
								if(taxNodes[j].type.id == "tag") {  // slug.match(/^term\/.*$/) != null
									hasTaxNodes = true;
									var urn = taxNodes[j].body.current.urn;
									var title = taxNodes[j].body.current.title;
									$('#taggedBy').append('<li><input type="hidden" data-urn="'+urn+'" name="tagged_by" value="'+slug+'" /><span class="tag_title">'+title+'</span>&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span></li>');
								}
							}
							if (hasTaxNodes) {
								$('.tagged_by_msg, #taggedBy').show();
								$('#taggedBy .remove a').on('click', me.handleRemoveTags);
							}
						}
					}

					if ( $.annobuilder.model.node.current.mediaSource.contentType == 'image' ) {
						if (edits) {
							me.showSpatialAnnotation(edits.title, edits);
						} else {
							me.showSpatialAnnotation(annotation.body.getDisplayTitle(), annotation.properties);
						}
					} else if ( $.annobuilder.model.node.current.mediaSource.contentType == '3D' ) {
            if (me.newAnnotationURL != annotation.body.url && allowSeek) {
              if (edits) {
  							me.showPosition3DAnnotation(edits.title, edits);
  						} else {
  							me.showPosition3DAnnotation(annotation.body.getDisplayTitle(), annotation.properties);
                if (annotation.body.current.properties['http://purl.org/dc/terms/abstract']) {
                  me.sendMessage(annotation.body.current.properties['http://purl.org/dc/terms/abstract'][0].value);
                }
  						}
            }
					} else if ( $.annobuilder.model.node.current.mediaSource.contentType == '3D-GIS' ) {
            if (me.newAnnotationURL != annotation.body.url && allowSeek) {
              if (edits) {
  							me.showPosition3DAnnotation(edits.title, edits);
  						} else {
  							me.showPosition3DAnnotation(annotation.body.getDisplayTitle(), annotation.properties);
  						}
            }
          }
				}
			});
			$('.annotationForm').css('display', 'block');
			this.annotationFormMessage.css('display', 'none');

			// show appropriate messaging depending on whether there are unsaved changes
			if (isListDirty) {
				this.footerControls.find('#saveLink').css('display', 'inline');
				this.footerControls.find('#doneMessage').css('display', 'none');
			} else {
				this.footerControls.find('#saveLink').css('display', 'none');
			}

		} else {
			$('.annotationForm').css('display', 'none');
			this.annotationFormMessage.css('display', 'block');
		}

	}

	/**
	 * Displays a spatial annotation with the specified name and dimension data.
	 *
	 * @param name {String}			The name to be displayed with the annotation.
	 * @param data {Object}			The dimensions of the annotation.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.showSpatialAnnotation = function(name, data) {

		if ($.annobuilder.model.mediaElement.view.mediaObjectView.hasLoaded) {

			var x, y, width, height, annoData,
				notes = [],
				dimensions = this.parseDimensions(data.x, data.y, data.width, data.height),
				mediaScale = $.annobuilder.model.mediaElement.view.mediaScale,
				intrinsicDim = $.annobuilder.model.mediaElement.view.intrinsicDim,
				image = $.annobuilder.model.mediaElement.view.mediaObjectView.image;

 			anno.removeAll( image.src + '-0' );

			if (dimensions.xType == 'percent') {
				x = (dimensions.x * .01) * mediaScale;
				x *= intrinsicDim.x;
			} else {
				x = dimensions.x * mediaScale;
			}

			if (dimensions.yType == 'percent') {
				y = (dimensions.y * .01) * mediaScale;
				y *= intrinsicDim.y;
			} else {
				y = dimensions.y * mediaScale;
			}

			if (dimensions.widthType == 'percent') {
				width = (dimensions.width * .01) * mediaScale;
				width *= intrinsicDim.x;
			} else {
				width = dimensions.width * mediaScale;
			}

			if (dimensions.heightType == 'percent') {
				height = (dimensions.height * .01) * mediaScale;
				height *= intrinsicDim.y;
			} else {
				height = dimensions.height * mediaScale;
			}

			annoData = {
				src: image.src + '-0',
				text: name,
				editable: true,
				shapes: [{
					type: "rect",
					units: "pixel",
					geometry: { x: x, y: y, width: width, height: height }
				}]
			}

			anno.addAnnotation( annoData );
			anno.highlightAnnotation( annoData );

		}

	}

	/**
	 * Displays a line annotation.
	 *
	 * @param data {Object}			The dimensions of the annotation.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.showLineAnnotation = function( data ) {

		if ($.annobuilder.model.mediaElement.view.mediaObjectView.hasLoaded) {

			$.annobuilder.model.mediaElement.view.mediaObjectView.highlightLinesForAnnotations( $.annobuilder.model.annotations );

		}

	}

	/**
	 * Displays a 3d position annotation with the specified name and position data.
	 *
	 * @param name {String}			The name to be displayed with the annotation.
	 * @param data {Object}			The position data of the annotation.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.showPosition3DAnnotation = function(name, data) {
		if ($.annobuilder.model.mediaElement.view.mediaObjectView.hasFrameLoaded) {
      $.annobuilder.model.mediaElement.seek(data);
		}
	}

  /**
	 * Sends a message to the media.
	 *
	 * @param message {String}			The message to be sent.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.sendMessage = function(message) {
		if ($.annobuilder.model.mediaElement.view.mediaObjectView.hasFrameLoaded) {
      $.annobuilder.model.mediaElement.sendMessage(message);
		}
	}

	/**
	 * Scrolls to the given annotation.
	 *
	 * @param {Object} annotation		The annotation to scroll to.
	 * @param {Boolean} instant 		Should the scroll be instantaneous?
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.scrollToAnnotation = function(annotation, instant) {

		var index = $.annobuilder.view.builder.indexForAnnotation(annotation);
		var scrollTo = this.annotationList.find('.annotationChip').eq(index);
		if (!instant) {
			this.container.animate({
				scrollTop: scrollTo.offset().top - this.container.offset().top + this.container.scrollTop()
			});
		} else {
			this.container.scrollTop(
				scrollTo.offset().top - this.container.offset().top + this.container.scrollTop()
			);
		}

	}

	/**
	 * Empties the form.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.clearForm = function() {

		$('#annotationTitle').val('');

		switch ($.annobuilder.model.node.current.mediaSource.contentType) {

			case 'video':
			case 'audio':
			$('#startTime').text(scalarapi.decimalSecondsToHMMSS(0));
			$('#startTime').data('value', 0);
			$('#endTime').text(scalarapi.decimalSecondsToHMMSS(0));
			$('#endTime').data('value', 0);
			break;

			case 'image':
			$('#x').val(0);
			$('#y').val(0);
			$('#width').val(0);
			$('#height').val(0);
			$('input:radio[name=xDimType]')[0].checked = true;
			$('input:radio[name=yDimType]')[0].checked = true;
			$('input:radio[name=widthDimType]')[0].checked = true;
			$('input:radio[name=heightDimType]')[0].checked = true;
			break;

			case 'document':
			$('#startLine').val(1);
			$('#endLine').val(1);
			break;

			case '3D':
			$('#targetX').val(0);
			$('#targetY').val(0);
			$('#targetZ').val(0);
			$('#cameraX').val(0);
			$('#cameraY').val(0);
			$('#cameraZ').val(0);
			$('#roll').val(0);
			$('#fieldOfView').val(0);
			break;

			case '3D-GIS':
			$('#latitude').val(0);
			$('#longitude').val(0);
			$('#altitude').val(0);
			$('#heading').val(0);
			$('#tilt').val(0);
			$('#fieldOfView').val(0);
			break;

		}

		$('#annotationDescription').val('');
		$('#annotationContent').val('');
	}

	jQuery.AnnoBuilderInterfaceView.prototype.handleSetStartTime = function(event) {
		var annotation = $.annobuilder.model.selectedAnnotation;
		if (annotation != null) {
			var seconds = $.annobuilder.model.mediaElement.getCurrentTime();
			me.setStartTime(seconds);
			me.makeSelectedAnnotationDirty();
			me.sortAnnotations();
			me.update();
		}
	}

	jQuery.AnnoBuilderInterfaceView.prototype.handleSetEndTime = function(event) {
		var annotation = $.annobuilder.model.selectedAnnotation;
		if (annotation != null) {
			var seconds = $.annobuilder.model.mediaElement.getCurrentTime();
			me.setEndTime(seconds);
			me.makeSelectedAnnotationDirty();
			me.sortAnnotations();
			me.update();
		}
	}

	jQuery.AnnoBuilderInterfaceView.prototype.handleSetPosition3D = function(event) {
		var annotation = $.annobuilder.model.selectedAnnotation;
		if (annotation != null) {
			var position3D = $.annobuilder.model.mediaElement.getPosition3D();
			console.log(position3D);
		}
	}

	jQuery.AnnoBuilderInterfaceView.prototype.handleSetPositionGIS = function(event) {
		let positionGIS = $.annobuilder.model.mediaElement.getPosition3D();
		me.setPositionGIS(positionGIS);
		me.makeSelectedAnnotationDirty();
		me.sortAnnotations();
		me.update();
	}

	/**
	 * Adds the selected annotation to the list of "dirty" annotations.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.makeSelectedAnnotationDirty = function(allowSeek = true) {
		var annotation = $.annobuilder.model.selectedAnnotation;
		if (annotation != null) {
			if ($.annobuilder.view.builder.dirtyAnnotations.indexOf(annotation.id) == -1) {
				$.annobuilder.view.builder.dirtyAnnotations.push(annotation.id);
			}
			this.footerControls.find('#saveLink').css('display', 'inline');
			this.footerControls.find('#doneMessage').css('display', 'none');
		}
		$.annobuilder.view.builder.storeEdits(allowSeek);
	}

	/**
	 * Returns the current sort index of the given annotation.
	 *
	 * @param {Object} annotation			The annotation to look for.
	 * @return								The sort index of the annotation.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.indexForAnnotation = function(annotation) {
		var index;
		$('.annotationList > .annotationChip').each(function() {
			if ($(this).data('annotation') == annotation) {
				index = $(this).index();
			}
		});
		return index;
	}

	/**
	 * Handles changes to the title of the selected annotation.
	 *
	 * @param {Object} event		An object representing the event.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.handleEditTitle = function(event) {
		var annotation = $.annobuilder.model.selectedAnnotation;
		if (annotation != null) {
			var index = $.annobuilder.view.builder.indexForAnnotation(annotation);
			var row = me.annotationList.find('.annotationChip').eq(index);
			row.find('strong').text($('#annotationTitle').val());
			me.scrollToAnnotation(annotation, true);
			me.makeSelectedAnnotationDirty(false);
		}
	}

	/**
	 * Handles changes to the description of an annotation.
	 *
	 * @param {Object} event		An object representing the event.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.handleEditDescription = function(event) {
		var annotation = $.annobuilder.model.selectedAnnotation;
		if (annotation != null) {
			me.makeSelectedAnnotationDirty(false);
		}
	}

	/**
	 * Handles changes to the content of an annotation.
	 *
	 * @param {Object} event		An object representing the event.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.handleEditContent = function(event) {
		var annotation = $.annobuilder.model.selectedAnnotation;
		if (annotation != null) {
			me.makeSelectedAnnotationDirty(false);
		}
	}

	/**
	 * Handles additions to the list of nodes tagging an annotation.
	 *
	 * @param {Object} nodes	A list of nodes (in rdf-json format) to add as tags to the annotation
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.handleAddTags = function(nodes) {
		if(nodes && nodes.length != 0) {
			for (var j = 0; j < nodes.length; j++) {
				var urn = nodes[j].version["http://scalar.usc.edu/2012/01/scalar-ns#urn"][0].value;
				var slug = nodes[j].slug;
				var title = nodes[j].version["http://purl.org/dc/terms/title"][0].value;
				$('#taggedBy').append('<li><input type="hidden" data-urn="'+urn+'" name="tagged_by" value="'+slug+'" /><span class="tag_title">'+title+'</span>&nbsp; <span class="remove">(<a href="javascript:;">remove</a>)</span></li>');
			}
			$('.tagged_by_msg, #taggedBy').show();
			me.makeSelectedAnnotationDirty(false);
			$('#taggedBy .remove a').on('click', me.handleRemoveTags);
		}
	}

	/**
	 * Handles removal of tagging nodes from list.
	 *
	 * @param {Object} event		An object representing the event.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.handleRemoveTags = function(event) {
		$(this).closest('li').remove();
		me.makeSelectedAnnotationDirty();
	}

	/**
	 * Handles changes to the dimensions of a spatial annotation.
	 *
	 * @param {Object} event		An object representing the event.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.handleEditDimensions = function(event) {
		var annotation = $.annobuilder.model.selectedAnnotation;
		if (annotation != null) {
			me.makeSelectedAnnotationDirty();
			me.sortAnnotations();
			var index = me.indexForAnnotation(annotation);
			var row = me.annotationList.find('.annotationChip').eq(index);
			var dimensions = me.unparseDimensions();
			var startString = 'x:' + Math.round( parseFloat( dimensions.x ));
			if ( dimensions.x.indexOf( '%' ) != -1 ) {
				startString += '%';
			}
			startString += ' y:' + Math.round( parseFloat( dimensions.y ));
			if ( dimensions.y.indexOf( '%' ) != -1 ) {
				startString += '%';
			}
			row.find('a').text( startString );
		}
	}

  /**
   * Handles changes to the dimensions of a 3D annotation.
   *
   * @param {Object} event		An object representing the event.
   */
  jQuery.AnnoBuilderInterfaceView.prototype.handleEditPosition3D = function(event) {
   var annotation = $.annobuilder.model.selectedAnnotation;
   if (annotation != null) {
     me.makeSelectedAnnotationDirty();
     me.sortAnnotations();
     var index = me.indexForAnnotation(annotation);
     var row = me.annotationList.find('.annotationChip').eq(index);
     var dimensions = me.unparsePosition3D();
     var startString = 'x:' + Math.round( parseFloat( dimensions.targetX ));
     startString += ' y:' + Math.round( parseFloat( dimensions.targetY ));
     startString += ' z:' + Math.round( parseFloat( dimensions.targetZ ));
     row.find('a').text( startString );
   }
  }

  /**
   * Handles changes to the dimensions of a 3D GIS annotation.
   *
   * @param {Object} event		An object representing the event.
   */
  jQuery.AnnoBuilderInterfaceView.prototype.handleEditPositionGIS = function(event) {
   var annotation = $.annobuilder.model.selectedAnnotation;
   if (annotation != null) {
     me.makeSelectedAnnotationDirty();
     me.sortAnnotations();
     var index = me.indexForAnnotation(annotation);
     var row = me.annotationList.find('.annotationChip').eq(index);
     var dimensions = me.unparsePositionGIS();
     var startString = 'lat:' + Math.round( parseFloat( dimensions.latitude ));
     startString += ' lon:' + Math.round( parseFloat( dimensions.longitude ));
     startString += ' alt:' + Math.round( parseFloat( dimensions.altitude ));
     row.find('a').text( startString );
   }
  }

	/**
	 * Handles changes to the extents of a textual annotation.
	 *
	 * @param {Object} event		An object representing the event.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.handleEditLineExtents = function(event) {
		var annotation = $.annobuilder.model.selectedAnnotation;
		if (annotation != null) {
			me.makeSelectedAnnotationDirty();
			me.update( false );
		}
	}

	jQuery.AnnoBuilderInterfaceView.prototype.setStartTime = function(seconds) {
		if (seconds != null) {
			var secondsString = scalarapi.decimalSecondsToHMMSS(seconds, true);
			$('#startTime').text(secondsString);
			$('#startTime').data('value', seconds);
			var index = $.annobuilder.view.builder.indexForAnnotation($.annobuilder.model.selectedAnnotation);
			var row = me.annotationList.find('.annotationChip').eq(index);
			row.find('a').text( scalarapi.decimalSecondsToHMMSS( seconds, false ) );
			if (seconds > $('#endTime').data('value')) this.setEndTime(seconds);
		}
	}

	jQuery.AnnoBuilderInterfaceView.prototype.setEndTime = function(seconds) {
		if (seconds != null) {
			var secondsString = scalarapi.decimalSecondsToHMMSS(seconds, true);
			$('#endTime').text(secondsString);
			$('#endTime').data('value', seconds);
			if (seconds < $('#startTime').data('value')) this.setStartTime(seconds);
		}
	}

	jQuery.AnnoBuilderInterfaceView.prototype.setPosition3D = function(position3D) {
		if (position3D != null) {
      $('#targetX').val(position3D.targetX);
      $('#targetY').val(position3D.targetY);
      $('#targetZ').val(position3D.targetZ);
      $('#cameraX').val(position3D.cameraX);
      $('#cameraY').val(position3D.cameraY);
      $('#cameraZ').val(position3D.cameraZ);
      $('#roll').val(position3D.roll);
      $('#fieldOfView').val(position3D.fieldOfView);
		}
	}

	jQuery.AnnoBuilderInterfaceView.prototype.setPositionGIS = function(positionGIS) {
		if (positionGIS != null) {
      $('#latitude').val(positionGIS.latitude);
      $('#longitude').val(positionGIS.longitude);
      $('#altitude').val(positionGIS.altitude);
      $('#heading').val(positionGIS.heading);
      $('#tilt').val(positionGIS.tilt);
      $('#fieldOfView').val(positionGIS.fieldOfView);
		}
	}

	jQuery.AnnoBuilderInterfaceView.prototype.setTitle = function(title) {
		if (title != null) {
			this.title = title;
			this.setStatus('dirty');
		}
	}

	/**
	 * Sets the description to the specified value.
	 *
	 * @param {Number} description		The description to store.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.setDescription = function(description) {
		if (description != null) {
			this.description = description;
			this.descriptionPreview = this.description.substr(0, 70);
			if (this.description.length > 70) {
				this.descriptionPreview += '... [continued]';
			}
			this.setStatus('dirty');
		}
	}

	/**
	 * Sets the content to the specified value.
	 *
	 * @param {Number} content		The content to store.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.setContent = function(content) {
		if (content != null) {
			this.content = content;
			this.contentPreview = this.content.substr(0, 70);
			if (this.content.length > 70) {
				this.contentPreview += '... [continued]';
			}
			this.setStatus('dirty');
		}
	}

	/**
	 * Sorts the annotation data by the specified criteria.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.sortAnnotations = function() {

		$('.annotationList > .annotationChip').sortElements(function(a, b) {

			switch ($.annobuilder.model.node.current.mediaSource.contentType) {

				case 'video':
				case 'audio':
				case 'document':
				var startA;
				var startB;
				var edits;
				edits = $(a).data('edits');
				if (edits) {
					startA = edits.start;
				} else {
					startA = $(a).data('annotation').properties.start;
				}
				edits = $(b).data('edits');
				if (edits) {
					startB = edits.start;
				} else {
					startB = $(b).data('annotation').properties.start;
				}
				return startA > startB ? 1 : -1;
				break;

				case 'image':
				var indexA;
				var indexB;
				edits = $(a).data('edits');
				if (edits) {
					indexA = ( parseFloat(edits.y) * 10000 ) + parseFloat(edits.x);
				} else {
					indexA = ( parseFloat($(a).data('annotation').properties.y) * 10000 ) + parseFloat($(a).data('annotation').properties.x);
				}
				edits = $(b).data('edits');
				if (edits) {
					indexB = ( parseFloat(edits.y) * 10000 ) + parseFloat(edits.x);
				} else {
					indexB = ( parseFloat($(b).data('annotation').properties.y) * 10000 ) + parseFloat($(b).data('annotation').properties.x);
				}
				return indexA > indexB ? 1 : -1;
				break;

				case '3D':
				var indexA;
				var indexB;
				edits = $(a).data('edits');
				if (edits) {
					indexA = ( parseFloat(edits.targetZ) * 100000000 ) + ( parseFloat(edits.targetY) * 10000 ) + parseFloat(edits.targetX);
				} else {
					indexA = ( parseFloat($(a).data('annotation').properties.targetZ) * 100000000 ) + ( parseFloat($(a).data('annotation').properties.targetY) * 10000 ) + parseFloat($(a).data('annotation').properties.targetX);
				}
				edits = $(b).data('edits');
				if (edits) {
					indexB = ( parseFloat(edits.targetZ) * 100000000 ) + ( parseFloat(edits.targetY) * 10000 ) + parseFloat(edits.targetX);
				} else {
					indexB = ( parseFloat($(a).data('annotation').properties.targetZ) * 100000000 ) + ( parseFloat($(a).data('annotation').properties.targetY) * 10000 ) + parseFloat($(a).data('annotation').properties.targetX);
				}
				return indexA > indexB ? 1 : -1;
				break;

				case '3D-GIS':
				var indexA;
				var indexB;
				edits = $(a).data('edits');
				if (edits) {
					indexA = ( parseFloat(edits.latitude) * 100000000 ) + ( parseFloat(edits.longitude) * 10000 ) + parseFloat(edits.altitude);
				} else {
					indexA = ( parseFloat($(a).data('annotation').properties.latitude) * 100000000 ) + ( parseFloat($(a).data('annotation').properties.longitude) * 10000 ) + parseFloat($(a).data('annotation').properties.altitude);
				}
				edits = $(b).data('edits');
				if (edits) {
					indexB = ( parseFloat(edits.latitude) * 100000000 ) + ( parseFloat(edits.longitude) * 10000 ) + parseFloat(edits.altitude);
				} else {
					indexB = ( parseFloat($(a).data('annotation').properties.latitude) * 100000000 ) + ( parseFloat($(a).data('annotation').properties.longitude) * 10000 ) + parseFloat($(a).data('annotation').properties.altitude);
				}
				return indexA > indexB ? 1 : -1;
				break;

			}
		});

		$('.annotationList > .annotationChip').each(function() {
			var stripeType;
			$(this).removeClass('light');
			$(this).removeClass('dark');
			(($(this).index() % 2) == 0) ? stripeType = 'light' : stripeType = 'dark';
			$(this).addClass(stripeType);
		});

	}

	/**
	 * Saves the current annotation's edits to its annotationChip.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.storeEdits = function(allowSeek = true) {
		var annotation = $.annobuilder.model.selectedAnnotation;
		if (annotation != null) {
			var index = $.annobuilder.view.builder.indexForAnnotation(annotation);
			var row = this.annotationList.find('.annotationChip').eq(index);
			var edits;
			switch ($.annobuilder.model.node.current.mediaSource.contentType) {

				case 'video':
				case 'audio':
				edits = {
					title: $('#annotationTitle').val(),
					start: $('#startTime').data('value'),
					end: $('#endTime').data('value'),
					description: $('#annotationDescription').val(),
					content: $('#annotationContent').val(),
					taxonomy: $('#taggedBy').html()
				}
				break;

				case 'image':
				var dimensions = $.annobuilder.view.builder.unparseDimensions();
				edits = {
					title: $('#annotationTitle').val(),
					x: dimensions.x,
					y: dimensions.y,
					width: dimensions.width,
					height: dimensions.height,
					description: $('#annotationDescription').val(),
					content: $('#annotationContent').val(),
					taxonomy: $('#taggedBy').html()
				}
				break;

				case 'document':
				edits = {
					title: $('#annotationTitle').val(),
					start: $('#startLine').val(),
					end: $('#endLine').val(),
					description: $('#annotationDescription').val(),
					content: $('#annotationContent').val(),
					taxonomy: $('#taggedBy').html()
				}
				break;

				case '3D':
				var dimensions = $.annobuilder.view.builder.unparsePosition3D();
				edits = {
					title: $('#annotationTitle').val(),
					targetX: dimensions.targetX,
					targetY: dimensions.targetY,
					targetZ: dimensions.targetZ,
					cameraX: dimensions.cameraX,
					cameraY: dimensions.cameraY,
					cameraZ: dimensions.cameraZ,
					roll: dimensions.roll,
					fieldOfView: dimensions.fieldOfView,
					description: $('#annotationDescription').val(),
					content: $('#annotationContent').val(),
					taxonomy: $('#taggedBy').html()
				}
				break;

				case '3D-GIS':
				var dimensions = $.annobuilder.view.builder.unparsePositionGIS();
				edits = {
					title: $('#annotationTitle').val(),
					targetX: dimensions.latitude,
					targetY: dimensions.longitude,
					targetZ: dimensions.altitude,
					cameraX: dimensions.heading,
					cameraY: dimensions.tilt,
					fieldOfView: dimensions.fieldOfView,
					description: $('#annotationDescription').val(),
					content: $('#annotationContent').val(),
					taxonomy: $('#taggedBy').html()
				}
				break;

			}
			row.data('edits', edits);
		}
		me.update( false, allowSeek );
	}

	/**
	 * Shows the spinner animation.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.showSpinner = function(event) {

		if (window['Spinner']) {
			var opts = {
			  lines: 13, // The number of lines to draw
			  length: 4, // The length of each line
			  width: 2, // The line thickness
			  radius: 5, // The radius of the inner circle
			  rotate: 0, // The rotation offset
			  color: '#000', // #rgb or #rrggbb
			  speed: 1, // Rounds per second
			  trail: 60, // Afterglow percentage
			  shadow: false, // Whether to render a shadow
			  hwaccel: false, // Whether to use hardware acceleration
			  className: 'spinner', // The CSS class to assign to the spinner
			  zIndex: 2e9, // The z-index (defaults to 2000000000)
			  top: 'auto', // Top position relative to parent in px
			  right: 'auto' // Left position relative to parent in px
			};
			var target = document.getElementById('spinner_wrapper');
			var spinner = new Spinner(opts).spin(target);
		}

	}

	/**
	 * Hides the spinner animation.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.hideSpinner = function(event) {
		if (window['Spinner']) {
			$('.spinner').remove();
		}
	}

	/**
	 * Handles clicks on the control to delete an annotation.
	 *
	 * @param {Object} event		An object representing the event.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.handleDelete = function(event) {

		if ($.annobuilder.model.selectedAnnotation) {

			var result = confirm('Are you sure you wish to move this annotation to the trash?');

			if (result) {

				var annotation = $.annobuilder.model.selectedAnnotation;

				var baseProperties =  {
					'native': $('input[name="native"]').val(),
					id: $('input[name="id"]').val(),
					api_key: $('input[name="api_key"]').val(),
				};

				var pageData = {
					action: 'UPDATE',
					'scalar:urn': annotation.body.current.urn,
					uriSegment: scalarapi.basepath(annotation.body.url),
					'dcterms:title': annotation.body.current.title,
					'dcterms:description': annotation.body.current.description,
					'sioc:content': annotation.body.current.content,
					'rdf:type': annotation.body.baseType,
					'scalar:is_live': 0
				};

				var relationData = {};

				me.showSpinner();

				scalarapi.modifyPageAndRelations(baseProperties, pageData, relationData, function(result) {
					me.hideSpinner();
					if (result) {
						$.annobuilder.model.selectedAnnotation = null;
						$.annobuilder.controller.loadAnnotations();
						$.annobuilder.view.builder.update();
					} else {
						alert('An error occurred while moving the annotation to the trash. Please try again.');
					}
				});
			}
		} else {
			alert('No annotation was selected.');
		}
	}

	/**
	 * Handles clicks on the control to add an annotation.
	 *
	 * @param {Object} event		An object representing the event.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.handleAdd = function(event) {

		var data;
		switch ($.annobuilder.model.node.current.mediaSource.contentType) {

			case 'video':
			case 'audio':
			var seconds = $.annobuilder.model.mediaElement.getCurrentTime();
			data = {
				action: 'ADD',
				'native': $('input[name="native"]').val(),
				id: $('input[name="id"]').val(),
				api_key: $('input[name="api_key"]').val(),
				'dcterms:title': 'Annotation',
				'dcterms:description': '',
				'sioc:content': '',
				'rdf:type': 'http://scalar.usc.edu/2012/01/scalar-ns#Composite',
				'scalar:child_urn': $('input[name="scalar:child_urn"]').val(),  /* WARNING: This is actually coming from the comment form, since the annotation form has been replaced ~cd */
				'scalar:child_type': 'http://scalar.usc.edu/2012/01/scalar-ns#Media',
				'scalar:child_rel': 'annotated',
				'scalar:start_seconds': seconds,
				'scalar:end_seconds': seconds + 0.5,
				'scalar:start_line_num': '',
				'scalar:end_line_num': '',
				'scalar:points': '',
        'scalar:position_3d': '',
        'scalar:position_gis': ''
			};
			break;

			case 'image':
			data = {
				action: 'ADD',
				'native': $('input[name="native"]').val(),
				id: $('input[name="id"]').val(),
				api_key: $('input[name="api_key"]').val(),
				'dcterms:title': 'Annotation',
				'dcterms:description': '',
				'sioc:content': '',
				'rdf:type': 'http://scalar.usc.edu/2012/01/scalar-ns#Composite',
				'scalar:child_urn': $('input[name="scalar:child_urn"]').val(),  /* WARNING: This is actually coming from the comment form, since the annotation form has been replaced ~cd */
				'scalar:child_type': 'http://scalar.usc.edu/2012/01/scalar-ns#Media',
				'scalar:child_rel': 'annotated',
				'scalar:start_seconds': '',
				'scalar:end_seconds': '',
				'scalar:start_line_num': '',
				'scalar:end_line_num': '',
				'scalar:points': '0%,0%,0%,0%',
        'scalar:position_3d': '',
        'scalar:position_gis': ''
			};
			break;

			case '3D':
			data = {
				action: 'ADD',
				'native': $('input[name="native"]').val(),
				id: $('input[name="id"]').val(),
				api_key: $('input[name="api_key"]').val(),
				'dcterms:title': 'Annotation',
				'dcterms:description': '',
				'sioc:content': '',
				'rdf:type': 'http://scalar.usc.edu/2012/01/scalar-ns#Composite',
				'scalar:child_urn': $('input[name="scalar:child_urn"]').val(),  /* WARNING: This is actually coming from the comment form, since the annotation form has been replaced ~cd */
				'scalar:child_type': 'http://scalar.usc.edu/2012/01/scalar-ns#Media',
				'scalar:child_rel': 'annotated',
				'scalar:start_seconds': '',
				'scalar:end_seconds': '',
				'scalar:start_line_num': '',
				'scalar:end_line_num': '',
				'scalar:points': '',
        'scalar:position_3d': '0,0,0,1,1,1,0,60',
        'scalar:position_gis': ''
			};
			break;

			case '3D-GIS':
			data = {
				action: 'ADD',
				'native': $('input[name="native"]').val(),
				id: $('input[name="id"]').val(),
				api_key: $('input[name="api_key"]').val(),
				'dcterms:title': 'Annotation',
				'dcterms:description': '',
				'sioc:content': '',
				'rdf:type': 'http://scalar.usc.edu/2012/01/scalar-ns#Composite',
				'scalar:child_urn': $('input[name="scalar:child_urn"]').val(),  /* WARNING: This is actually coming from the comment form, since the annotation form has been replaced ~cd */
				'scalar:child_type': 'http://scalar.usc.edu/2012/01/scalar-ns#Media',
				'scalar:child_rel': 'annotated',
				'scalar:start_seconds': '',
				'scalar:end_seconds': '',
				'scalar:start_line_num': '',
				'scalar:end_line_num': '',
				'scalar:points': '',
        'scalar:position_3d': '',
        'scalar:position_gis': '0,0,0,0,0,60'
			};
			break;

			case 'document':
			var line = $.annobuilder.model.mediaElement.getCurrentTime();
			data = {
				action: 'ADD',
				'native': $('input[name="native"]').val(),
				id: $('input[name="id"]').val(),
				api_key: $('input[name="api_key"]').val(),
				'dcterms:title': 'Annotation',
				'dcterms:description': '',
				'sioc:content': '',
				'rdf:type': 'http://scalar.usc.edu/2012/01/scalar-ns#Composite',
				'scalar:child_urn': $('input[name="scalar:child_urn"]').val(),  /* WARNING: This is actually coming from the comment form, since the annotation form has been replaced ~cd */
				'scalar:child_type': 'http://scalar.usc.edu/2012/01/scalar-ns#Media',
				'scalar:child_rel': 'annotated',
				'scalar:start_seconds': '',
				'scalar:end_seconds': '',
				'scalar:start_line_num': '1',
				'scalar:end_line_num': '1',
				'scalar:points': '',
        'scalar:position_3d': '',
        'scalar:position_gis': ''
			};
			break;

		}

		var success = function(json) {
			me.hideSpinner();
			$.annobuilder.controller.loadAnnotations();
			for (var property in json) { // this should only iterate once
				me.newAnnotationURL = scalarapi.stripEditionAndVersion(property);
			}
		}

		var error = function() {
			me.hideSpinner();
			alert('An error occurred while creating a new annotation. Please check that you have permissions to edit this book, and try again.');
		}

		me.showSpinner();

		scalarapi.savePage(data, success, error);
	}

	/**
	 * Handles clicks on the control to save annotation changes.
	 *
	 * @param {Object} event		An object representing the event.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.handleSave = function(event) {

		me.storeEdits();

		var i;
		var n = $.annobuilder.model.annotations.length;
		var annotation;
		var index;
		var dataArr = [];
		var pageData;
		var relationArr = [];
		var relationData;
		var baseProperties;
		var row;
		var edits;
		for (i=0; i<n; i++) {
			annotation = $.annobuilder.model.annotations[i];
			index = me.indexForAnnotation(annotation);
			row = me.annotationList.find('.annotationChip').eq(index);
			edits = row.data('edits');
			if (edits) {
				if (annotation.body.url != '') {

					baseProperties =  {
						'native': $('input[name="native"]').val(),
						id: $('input[name="id"]').val(),
						api_key: $('input[name="api_key"]').val(),
					};
					pageData = {
						action: 'UPDATE',
						'scalar:urn': annotation.body.current.urn,
						uriSegment: scalarapi.basepath(annotation.body.url),
						'dcterms:title': edits.title,
						'dcterms:description': edits.description,
						'sioc:content': edits.content,
						'rdf:type': annotation.body.baseType
					};
					relationData = {};
					switch ($.annobuilder.model.node.current.mediaSource.contentType) {

						case 'video':
						case 'audio':
						relationData[annotation.id] = {
							action: 'RELATE',
							'scalar:urn': annotation.body.current.urn,
							'scalar:child_urn': $('input[name="scalar:child_urn"]').val(),
							'scalar:child_rel': 'annotated',
							'scalar:start_seconds': edits.start,
							'scalar:end_seconds': edits.end,
							'scalar:start_line_num': '',
							'scalar:end_line_num': '',
							'scalar:points': '',
							'scalar:position_3d': '',
							'scalar:position_gis': ''
						};
						break;

						case 'image':
						var dimensions = me.unparseDimensions(edits);
						relationData[annotation.id] = {
							action: 'RELATE',
							'scalar:urn': annotation.body.current.urn,
							'scalar:child_urn': $('input[name="scalar:child_urn"]').val(),
							'scalar:child_rel': 'annotated',
							'scalar:start_seconds': '',
							'scalar:end_seconds': '',
							'scalar:start_line_num': '',
							'scalar:end_line_num': '',
							'scalar:points': dimensions.string,
							'scalar:position_3d': '',
							'scalar:position_gis': ''
						};
						break;

						case '3D':
						var position3D = me.unparsePosition3D(edits);
						relationData[annotation.id] = {
							action: 'RELATE',
							'scalar:urn': annotation.body.current.urn,
							'scalar:child_urn': $('input[name="scalar:child_urn"]').val(),
							'scalar:child_rel': 'annotated',
							'scalar:start_seconds': '',
							'scalar:end_seconds': '',
							'scalar:start_line_num': '',
							'scalar:end_line_num': '',
							'scalar:points': '',
							'scalar:position_3d': position3D.string,
							'scalar:position_gis': ''
						};
						break;

						case '3D-GIS':
						var positionGIS = me.unparsePositionGIS(edits);
						relationData[annotation.id] = {
							action: 'RELATE',
							'scalar:urn': annotation.body.current.urn,
							'scalar:child_urn': $('input[name="scalar:child_urn"]').val(),
							'scalar:child_rel': 'annotated',
							'scalar:start_seconds': '',
							'scalar:end_seconds': '',
							'scalar:start_line_num': '',
							'scalar:end_line_num': '',
							'scalar:points': '',
							'scalar:position_3d': '',
							'scalar:position_gis': positionGIS.string
						};
						break;

						case 'document':
						edits.end = Math.max( edits.start, edits.end );
						relationData[annotation.id] = {
							action: 'RELATE',
							'scalar:urn': annotation.body.current.urn,
							'scalar:child_urn': $('input[name="scalar:child_urn"]').val(),
							'scalar:child_rel': 'annotated',
							'scalar:start_seconds': '',
							'scalar:end_seconds': '',
							'scalar:start_line_num': edits.start,
							'scalar:end_line_num': edits.end,
							'scalar:points': '',
							'scalar:position_3d': '',
							'scalar:position_gis': ''
						};
						break;

					}

					// Validate tags on each annotation
					// This interacts directly with scalarapi.model .. 30 September 2015 Craig Dietrich
					var urns = [];
					var tags = [];
					if ('undefined'!=typeof(edits.taxonomy)) {  // List of tags we want, set in the UI
						$(edits.taxonomy).find('input').each(function() {
							var $this = $(this);
							var urn = $this.data('urn');
							urns.push(urn);
							tags.push({slug:$this.val(),urn:urn,title:$this.next().html()});
						});
					}
					// Remove tags from Scalar API that shouldn't be there
					var indexes_to_remove = [];
					for (var j in scalarapi.model.nodesByURL[annotation.body.url].incomingRelations) {
						if ('tag'!=scalarapi.model.nodesByURL[annotation.body.url].incomingRelations[j].type.id) continue;
						var urn = scalarapi.model.nodesByURL[annotation.body.url].incomingRelations[j].body.current.urn;
						if (-1==urns.indexOf(urn)) indexes_to_remove.push(j);
					}
					indexes_to_remove.sort(function(a, b){return a-b});
					for (var j = (indexes_to_remove.length-1); j >= 0; j--) {
						var index = indexes_to_remove[j];
						scalarapi.model.nodesByURL[annotation.body.url].incomingRelations.splice(index, 1);
					}
					// Add tags to Scalar API that should be there
					urns = [];
					for (var j in scalarapi.model.nodesByURL[annotation.body.url].incomingRelations) {
						if ('tag'!=scalarapi.model.nodesByURL[annotation.body.url].incomingRelations[j].type.id) continue;
						var urn = scalarapi.model.nodesByURL[annotation.body.url].incomingRelations[j].body.current.urn;
						urns.push(urn);
					}
					for (var j in tags) {
						if (-1!=urns.indexOf(tags[j].urn)) continue;
						scalarapi.model.nodesByURL[annotation.body.url].incomingRelations.push({
							id: '_'+tags[j].slug+annotation.body.url,
							body:{ slug:tags[j].slug, current:{ urn:tags[j].urn, title:tags[j].title } },
							type:{ id:'tag' }
						});
					}
					// Combine into object for scalarapi
					// scalarapi's modifyManyPages calls the API again and overwrites the node changes above, so relations are cloned here to overwrite that overwrite
					dataArr.push({
						baseProperties:baseProperties,
						pageData:pageData,
						relationData:relationData,
						outgoingRelations:scalarapi.model.nodesByURL[annotation.body.url].outgoingRelations.slice(), // clone
						incomingRelations:scalarapi.model.nodesByURL[annotation.body.url].incomingRelations.slice() // clone
					});

				} // if url
			} // if edits
		}  // for

		me.showSpinner();

		scalarapi.modifyManyPages(dataArr, function( ok ) {
			$.annobuilder.view.builder.endSave( ok );
		});

	}


	/**
	 * Completes the save action.
	 */
	jQuery.AnnoBuilderInterfaceView.prototype.endSave = function( ok ) {

		if ( !ok ) {
			alert('An error occurred while saving. Please check that you have permissions to edit this book, and try saving again.');
			this.leavingEditor = false;
		} else {
			$.annobuilder.controller.loadAnnotations();
			this.footerControls.find('#saveLink').css('display', 'none');
			this.footerControls.find('#doneMessage').css('display', 'inline');
			this.annotationList.find('.annotationChip').data('edits', null);
			this.dirtyAnnotations = [];
      if ($.annobuilder.model.node.current.mediaSource.contentType == '3D') {
        $.annobuilder.model.mediaElement.handleAnnotationsUpdated();
      }
		}

		me.hideSpinner();

	}

	jQuery.AnnoBuilderInterfaceView.prototype.handleAnnotoriousAnnotationCreated = function( annotation ) {

		var geometry = annotation.shapes[ 0 ].geometry;
		var geometryString = ( Math.round( geometry.x * 10000 ) / 100.0 ) + "%," + ( Math.round( geometry.y * 10000 ) / 100.0 ) + "%," + ( Math.round( geometry.width * 10000 ) / 100.0 ) + "%," + ( Math.round( geometry.height * 10000 ) / 100.0 ) + "%";
		var data = {
			action: 'ADD',
			'native': $('input[name="native"]').val(),
			id: $('input[name="id"]').val(),
			api_key: $('input[name="api_key"]').val(),
			'dcterms:title': annotation.text,
			'dcterms:description': '',
			'sioc:content': '',
			'rdf:type': 'http://scalar.usc.edu/2012/01/scalar-ns#Composite',
			'scalar:child_urn': $('input[name="scalar:child_urn"]').val(),  /* In Honeydew this is comming from the comment form because there isn't an annotation form in its HTML */
			'scalar:child_type': 'http://scalar.usc.edu/2012/01/scalar-ns#Media',
			'scalar:child_rel': 'annotated',
			'scalar:start_seconds': '',
			'scalar:end_seconds': '',
			'scalar:start_line_num': '',
			'scalar:end_line_num': '',
			'scalar:points': geometryString,
			'scalar:position_3d': '',
			'scalar:position_gis': ''
		};

		var success = function(json) {
			me.hideSpinner();
			$.annobuilder.controller.loadAnnotations();
			for (var property in json) { // this should only iterate once
				me.newAnnotationURL = scalarapi.stripEditionAndVersion(property);
			}
		}

		var error = function() {
			me.hideSpinner();
			alert('An error occurred while creating a new annotation. Please check that you have permissions to edit this book, and try again.');
		}

		me.showSpinner();

		scalarapi.savePage(data, success, error);

	}

	jQuery.AnnoBuilderInterfaceView.prototype.handleAnnotoriousAnnotationUpdated = function( annotation ) {
		$('#annotationTitle').val( annotation.text );
		$.annobuilder.view.builder.handleEditTitle();
		$.annobuilder.view.builder.handleSave();
	}

	jQuery.AnnoBuilderInterfaceView.prototype.handleReturnPosition3D = function( message ) {
    if (message.isTrusted && window.location.href.indexOf(message.origin) != -1) {
      let position3D = JSON.parse(message.data);
      me.setPosition3D(position3D);
      me.makeSelectedAnnotationDirty();
      me.sortAnnotations();
      me.update();
    }
	}

}

jQuery.annobuilder = {
	model : new $.AnnoBuilderModel(),
	view : new $.AnnoBuilderView(),
	controller : new $.AnnoBuilderController()
}
