(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports={
    "client_id": "scalar",
    "client_ver": "2.5.12",
    "id": "siva@dartmouth.edu",
    "api_key": "do3D40s9aDkgk4RfaaFoeignbmd",
    "waldorf_auth_token": "18ca72be826d0043de9ce47c4d81f04f01bf395a"
}
},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnnotationManager = void 0;

var _annotation = require("./annotation.js");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var AnnotationManager = /*#__PURE__*/function () {
  function AnnotationManager() {
    _classCallCheck(this, AnnotationManager);

    this.annotations = [];
  }

  _createClass(AnnotationManager, [{
    key: "PopulateFromJSON",
    value: function PopulateFromJSON(json) {
      if (json.length == 0) {
        console.warn("JSON contains no annotations.");
      }

      this.annotations = [];

      var _iterator = _createForOfIteratorHelper(json),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var object = _step.value;
          this.RegisterAnnotation(object);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "RegisterAnnotation",
    value: function RegisterAnnotation(jsonObject) {
      //console.log("Registering new annotation with ID " + jsonObject.id);
      var anno = new _annotation.Annotation(jsonObject);
      this.annotations.push(anno);
    }
  }, {
    key: "RemoveAnnotation",
    value: function RemoveAnnotation(id) {
      //console.log("Removing: " + id);
      this.annotations = this.annotations.filter(function (obj) {
        return obj.id !== id;
      });
    }
    /**
     * Update the given annotation in the stored array
     */

  }, {
    key: "UpdateAnnotation",
    value: function UpdateAnnotation(annotation, oldID) {
      //console.log("Updating annotation ID " + oldID + " to " + annotation.metadata.id);
      this.RemoveAnnotation(oldID);
      this.RegisterAnnotation(annotation);
    }
  }, {
    key: "AnnotationsAtTime",
    value: function AnnotationsAtTime(time) {
      // TODO: Reenable with some kind of force parameter
      // // If the last time requested is asked for again, just give back the cached result
      // if(timeMS == this.lastTimeRequested){
      //     //console.log("Using cache");
      //     return this.cached;
      // }
      // this.lastTimeRequested = timeMS;
      // Filter all loaded annotations that fit within the range query.
      var filtered = this.annotations.filter(function (item) {
        return item.beginTime <= time && time <= item.endTime;
      });
      this.cached = filtered;
      return filtered;
    }
  }]);

  return AnnotationManager;
}();

exports.AnnotationManager = AnnotationManager;

},{"./annotation.js":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Annotation = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/// A wrapper for W3C Open Annotation JSON objects.
var Annotation = /*#__PURE__*/function () {
  function Annotation() {
    var json = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _classCallCheck(this, Annotation);

    this["@context"] = "http://www.w3.org/ns/anno.jsonld"; // this["@context"] = ["http://www.w3.org/ns/anno.jsonld",
    //                 "http://iiif.io/api/presentation/3/context.json"];

    this["request"] = {
      "client_id": "scalar",
      "client_ver": "2.5.12",
      "items": {
        "native": false,
        "id": "__CHECK_CONFIG_FILE__ID__",
        "api_key": "__CHECK_CONFIG_FILE__API_KEY__",
        "action": "TOBEFILLED",
        "format": "json"
      }
    }; //TODO: ver2
    // this["service"] = {
    //     "client_id": "scalar",
    //     "client_ver": "2.5.12",
    //     "items": {
    //         "native": false,
    //         "id": "__CHECK_CONFIG_FILE__ID__",
    //         "api_key": "__CHECK_CONFIG_FILE__API_KEY__",
    //         "action": "TOBEFILLED",
    //         "format": "json"
    //     }
    // };
    //this["type"] = "Manifest"; //TODO: ver2

    this["type"] = "Annotation"; //TODO: ver1

    this["motivation"] = "highlighting";
    this["body"] = [];
    this["target"] = {}; //this["items"] = []; //TODO: ver2
    //delete this.beginTime;
    //delete this.endTime;
    //delete this.tags;

    this.readConfig();

    if (json) {
      // Merge the json into this class.
      Object.assign(this, json); // Compute read only easy access properties

      this.recalculate();
    }
  }

  _createClass(Annotation, [{
    key: "readConfig",
    value: function readConfig() {
      var config = require("../annotator-config.json"); //ver1


      this["request"]["client_id"] = config.client_id;
      this["request"]["client_ver"] = config.client_ver;
      this["request"]["items"]["id"] = config.id;
      this["request"]["items"]["api_key"] = config.api_key; //TODO: Ver2
      // this["service"]["client_id"] = config.client_id;
      // this["service"]["client_ver"] = config.client_ver;
      // this["service"]["items"]["id"] = config.id;
      // this["service"]["items"]["api_key"] = config.api_key;
    } /// Compute read only easy access properties

  }, {
    key: "recalculate",
    value: function recalculate() {
      var timeSlice = this.target.selector.filter(function (item) {
        return item.type === "FragmentSelector";
      })[0].value;
      timeSlice = timeSlice.replace("t=", ""); /// Start time in seconds

      this.beginTime = parseFloat(timeSlice.split(",")[0]); /// End time in seconds

      this.endTime = parseFloat(timeSlice.split(",")[1]); /// Extract tags from annotation

      this.tags = this.body.filter(function (item) {
        return item.purpose === "tagging";
      }).map(function (item) {
        return item.value;
      });
    }
  }, {
    key: "getPoly",
    value: function getPoly() {
      var pointsSelector = this.target.selector.filter(function (item) {
        return item.type === "SvgSelector";
      });
      if (pointsSelector.length == 0) return null; // Parse the points array from the annotation

      var pointsSvg = pointsSelector[0].value;
      var regExString = new RegExp("(?:points=')(.*?)(?:')", "ig"); //set ig flag for global search and case insensitive

      var pointsRE = regExString.exec(pointsSvg)[1];
      var pointsData = pointsRE.trim().split(" ").map(function (item) {
        return item.split(",");
      });
      return pointsData;
    }
  }, {
    key: "getSVGPolyPoints",
    value: function getSVGPolyPoints() {
      var pointsSelector = this.target.selector.filter(function (item) {
        return item.type === "SvgSelector";
      });
      if (pointsSelector.length == 0) return null; // Parse the points array from the annotation

      var pointsSvg = pointsSelector[0].value;
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(pointsSvg, "text/xml");
      return [xmlDoc.getElementsByTagName("animate")[0].getAttribute("from"), xmlDoc.getElementsByTagName("animate")[0].getAttribute("to")];
    }
  }]);

  return Annotation;
}();

exports.Annotation = Annotation;

},{"../annotator-config.json":1}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VideoAnnotator = void 0;

var _serverInterface = require("./server-interface.js");

var _annotationManager = require("./annotation-manager.js");

var _tickBar = require("./components/tick-bar.js");

var _polygonOverlay = require("./components/polygon-overlay.js");

var _preferenceManager = require("../utils/preference-manager.js");

var _annotationGui = require("./components/annotation-gui.js");

var _infoContainer = require("./components/info-container.js");

var _indexContainer = require("./components/index-container.js");

var _sessionManager = require("./session-manager.js");

var _messageOverlay = require("./components/message-overlay.js");

var _annotation2 = require("./annotation.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var sha1 = require('sha1');

var VideoAnnotator = /*#__PURE__*/function () {
  function VideoAnnotator(args) {
    var _this = this;

    _classCallCheck(this, VideoAnnotator);

    console.log("[VideoAnnotator] Creating VideoAnnotator..."); //Parse arguments
    //This is actually required

    if (typeof args.player === 'undefined') {
      console.log('Called for a new VideoAnnotator without passing a player!');
      return false;
    }

    this.player = args.player; //These config options are required for saving annotations to a server

    this.serverURL = typeof args.serverURL === 'undefined' ? '' : args.serverURL;
    this.tagsURL = typeof args.tagsURL === 'undefined' ? '' : args.tagsURL;
    this.apiKey = typeof args.apiKey === 'undefined' ? '' : args.apiKey; //If apiKey is set and cmsUsername and cmsEmail are passed, we'll auto login later

    this.cmsUsername = typeof args.cmsUsername === 'undefined' ? '' : args.cmsUsername;
    this.cmsEmail = typeof args.cmsEmail === 'undefined' ? '' : args.cmsEmail; //This config option is required for using a static annotation file

    this.localURL = typeof args.localURL === 'undefined' ? '' : args.localURL; //Optional params
    //Removes the editing interface

    this.kioskMode = typeof args.kioskMode === 'undefined' ? '' : args.kioskMode; //Shows the 'open manifest' button if kioskMode is off

    this.showManifest = typeof args.showManifest === 'undefined' ? false : args.showManifest; //Allows passing in a function that overrides the default annotation renderer

    this.renderer = typeof args.renderer === 'undefined' ? false : args.renderer; //Allows passing in a function that overrides the default annotation renderer

    this.unrenderer = typeof args.unrenderer === 'undefined' ? false : args.unrenderer; //Determines whether or not the annotation container is cleared every time it updates

    this.clearContainer = typeof args.clearContainer === 'undefined' ? true : args.clearContainer; //Determines whether or not to create a navigable index of annotations

    this.displayIndex = typeof args.displayIndex === 'undefined' ? false : args.displayIndex; //Determine the language of the annotation

    this.onomyLanguage = typeof args.onomyLanguage === 'undefined' ? '' : args.onomyLanguage; //localURL implies kiosk mode

    if (this.localURL != '') this.kioskMode = true;
    this.Wrap();
    this.PopulateControls(); //may need to move this below the this.server block later?

    this.messageOverlay = new _messageOverlay.MessageOverlay(this);
    this.annotationManager = new _annotationManager.AnnotationManager();
    this.sessionManager = new _sessionManager.SessionManager(this); //localURL takes precendence - if it is anything but '' then do not load from server

    if (this.localURL == '') {
      this.server = new _serverInterface.ServerInterface(this);
      this.server.SetBaseURL(this.serverURL); // Load annotations from server based on the player's video URL

      this.server.FetchAnnotations('location', this.player.videoElement.currentSrc).done(function (json) {
        //json.shift()  // Assume first node is a content node
        for (var j = json.length - 1; j >= 0; j--) {
          if (json[j].type != "Annotation") {
            json.splice(j, 1);
          } else {
            for (var k = 0; k < json[j].target.selector.length; k++) {
              if ('FragmentSelector' != json[j].target.selector[k].type) continue;
              json[j].target.selector[k].value = json[j].target.selector[k].value.replace('#t=npt:', 't=');
            }
          }
        }

        _this.annotationManager.PopulateFromJSON(json);

        _this.AnnotationsLoaded();
      }); //auto-login if not in kiosk mode, and we have the cms variables and API key

      if (!this.kioskMode) {
        if (this.apiKey && this.cmsEmail && this.cmsUsername) {
          this.server.LogOut();
          this.server.LogIn(this.cmsUsername, sha1(this.cmsEmail)).done(function () {
            console.log("[Main] CMS login success");
          }).fail(function () {
            console.log("[Main] CMS login failed");
          });
        }
      }
    } else {
      console.log('Loading local cache file: ' + this.localURL);
      $.ajax({
        url: this.localURL,
        type: "GET",
        dataType: "json",
        async: true
      }).done(function (data) {
        console.log("Fetched ".concat(data.length, " annotations from local cache."));
        var json = data;

        for (var j = json.length - 1; j >= 0; j--) {
          if (json[j].type != "Annotation") {
            json.splice(j, 1);
          } else {
            for (var k = 0; k < json[j].target.selector.length; k++) {
              if ('FragmentSelector' != json[j].target.selector[k].type) continue;
              json[j].target.selector[k].value = json[j].target.selector[k].value.replace('#t=npt:', 't=');
            }
          }
        }

        _this.annotationManager.PopulateFromJSON(data);

        _this.AnnotationsLoaded();
      }).fail(function (response) {
        console.log(response);
        console.error("Error fetching annotations from local cache\"\n".concat(response.responseJSON.detail, "."));

        _this.annotator.messageOverlay.ShowError("Could not retrieve annotations!<br>(".concat(response.responseJSON.detail, ")"));
      });
    }

    this.player.$container.on("OnTimeUpdate", function (event, time) {
      _this.OnTimeUpdate(time);
    });
    this.$container.on("OnPolyClicked", function (event, annotation) {
      // Edit a poly when clicked, but only if the editor isn't already open
      if (!_this.gui.open) {
        _this.$addAnnotationButton.button("disable");

        _this.gui.BeginEditing(annotation);
      }
    });
    this.$container.on("OnPolygonClicked", function (event, annotation) {
      console.log("OnPolygonClicked event captured");
    });
    this.$container.on("OnAnimationClicked", function (event, annotation) {
      console.log("OnAnimationClicked event captured");
    });
    this.gui.$container.on("OnGUIClosed", function (event) {
      _this.$addAnnotationButton.button("enable");
    });
    this.url = this.player.videoElement.currentSrc;
    console.log("[VideoAnnotator] Annotator created for video.");
  }

  _createClass(VideoAnnotator, [{
    key: "readConfig",
    value: function readConfig() {
      var config = require("../annotator-config.json");

      this.apiKey = config.api_key;
    }
    /**
     * Creates the divs that surround the video player.
     */

  }, {
    key: "Wrap",
    value: function Wrap() {
      // Wrap the video player with this container. Can't use .wrap due to duplication issues    
      var videoContainer = $(this.player.$container).parent();
      var waldorfContainer = $("<div class='waldorf-container'></div>");
      waldorfContainer.insertBefore($(this.player.$container));
      waldorfContainer.append(this.player.$container);
      this.$container = videoContainer.parent(); // Set the container to the width of the video player

      this.$container.width(this.player.$container.width()); // Allow the video player container to grow
      //this.player.$container.width("100%");
      //this.player.$container.height("100%");
      // Copy the video styles to the container
      // console.log(this.player.originalStyles);

      this.$container.css(this.player.originalStyles);
    }
  }, {
    key: "PopulateControls",
    value: function PopulateControls() {
      var _this2 = this;

      // Create the tick bar
      this.tickBar = new _tickBar.TickBar(this); // Create the polygon overlay

      this.polyOverlay = new _polygonOverlay.PolygonOverlay(this);

      if (!this.kioskMode && this.showManifest) {
        this.$debugControls = $("<div class='waldorf-debug-controls'></div>").appendTo(this.$container);
        var $showAllAnnotationsButton = this.$debugControls.append('<button>Open Annotation Manifest in New Window</button>');
        $showAllAnnotationsButton.click(function () {
          var url = _this2.player.videoElement.currentSrc;

          _this2.server.FetchAnnotations("location", url).done(function (json) {
            var win = window.open();

            if (win === null) {
              console.error("Couldn't show annotation manifest; please allow pop-ups.");

              _this2.messageOverlay.ShowError("Couldn't show annotation manifest; please allow pop-ups.");
            } else {
              win.document.open();
              win.document.write("<title>Annotation Manifest for ".concat(url, "</title>"));
              win.document.write("<pre>");
              win.document.write(JSON.stringify(json, null, 2).escapeHTML());
              win.document.write("</pre>");
              win.document.close();
            }
          });
        });
      } // Wrap all the buttons with the list tag
      //this.$debugControls.wrapInner("<ul></ul>");
      // Wrap each button with the list element tag
      //this.$debugControls.find("button").wrap("<li></li>");
      // Create the info container


      this.infoContainer = new _infoContainer.InfoContainer(this);
      if (this.displayIndex) this.indexContainer = new _indexContainer.IndexContainer(this); // Inject the annotation edit button into the toolbar

      if (!this.kioskMode) {
        this.$addAnnotationButton = $("<button>Add New Annotation</button>").button({
          icon: "fa fa-plus",
          showLabel: false
        }).click(function () {
          _this2.$addAnnotationButton.button("disable");

          _this2.gui.BeginEditing();
        });
        this.player.controlBar.RegisterElement(this.$addAnnotationButton, 3, 'flex-end'); // Inject the annotation upload button into the toolbar

        this.$uploadAnnotationButton = $("<button type='file'>Import Annotation From File</button>").button({
          icon: "fa fa-upload",
          showLabel: false
        }).click(function () {
          _this2.LoadFromFile();
        });
        this.player.controlBar.RegisterElement(this.$uploadAnnotationButton, 2, 'flex-end');
      }

      this.gui = new _annotationGui.AnnotationGUI(this);
    }
  }, {
    key: "AnnotationsLoaded",
    value: function AnnotationsLoaded() {
      //Send annotation loaded event
      this.$container.trigger("OnAnnotationsLoaded", this.annotationManager);
    }
  }, {
    key: "OnTimeUpdate",
    value: function OnTimeUpdate(time) {
      this.annotationsNow = this.annotationManager.AnnotationsAtTime(time);

      if (this.annotationsNow.equals(this.lastAnnotationSet)) {
        this.SetAnnotationTimePosition(time);
        return;
      }

      this.lastAnnotationSet = this.annotationsNow;
      this.UpdateViews();
    }
  }, {
    key: "SetAnnotationTimePosition",
    value: function SetAnnotationTimePosition(time) {
      //console.log("time: " + time);
      //Check safari and multiple geometric annotation
      if (this.IsSafari() && this.annotationsNow.length > 1) {
        var msg = "Multiple geometric annotations are detected.<br>";
        msg += "Safari doesn't support multiple geometric annotations.<br>";
        msg += "Chrome or Firefox are recommended.";
        this.messageOverlay.ShowMessage(msg, 2.0);
        return; //no animation for safari browser with multiple geometric annotation
      }

      for (var i = 0; i < this.annotationsNow.length; i++) {
        var annotation_id = this.annotationsNow[i].id;

        if (this.polyOverlay.svgElementsHash[annotation_id]) {
          this.polyOverlay.svgElementsHash[annotation_id].animate.beginElement();
          var time_diff = time - this.annotationsNow[i].beginTime;
          var current_time = this.polyOverlay.svgElementsHash[annotation_id].svgElement.getCurrentTime(); //console.log("\t i:" + i + " (" + annotation_id + "), svg current_time:" + current_time + ", animate time_diff: " + time_diff);

          this.polyOverlay.svgElementsHash[annotation_id].svgElement.setCurrentTime(current_time + time_diff);
          this.polyOverlay.svgElementsHash[annotation_id].animate.endElement();
        }
      }
    }
  }, {
    key: "UpdateViews",
    value: function UpdateViews() {
      //console.log("annotator.js:267 UpdateViews");
      this.annotationsNow = this.annotationManager.AnnotationsAtTime(this.player.videoElement.currentTime); // Update the info container

      this.infoContainer.Rebuild(this.annotationsNow, this.clearContainer);
      this.$container.trigger("OnNewAnnotationSet", [this.annotationsNow]);
      this.SetAnnotationTimePosition(this.player.videoElement.currentTime);
    }
  }, {
    key: "GetAnnotations",
    value: function GetAnnotations() {
      var ordered = this.annotationManager.annotations.slice();

      var orderByStart = function orderByStart(a, b) {
        var aTime = a.beginTime;
        var bTime = b.beginTime;
        return aTime < bTime ? -1 : aTime > bTime ? 1 : 0;
      };

      ordered.sort(orderByStart);
      return ordered;
    }
  }, {
    key: "RegisterNewAnnotation",
    value: function RegisterNewAnnotation(annotation) {
      //console.log(annotation);
      this.annotationManager.RegisterAnnotation(annotation); // Throw event for listening objects (e.g. tick-bar)

      this.$container.trigger("OnAnnotationRegistered", [annotation]); // Update dependent views

      this.UpdateViews();
    }
  }, {
    key: "UpdateAnnotation",
    value: function UpdateAnnotation(annotation, oldID) {
      this.annotationManager.UpdateAnnotation(annotation, oldID); // Throw event for listening objects (e.g. tick-bar)

      this.$container.trigger("OnAnnotationRemoved", [oldID]);
      this.$container.trigger("OnAnnotationRegistered", [annotation]); // Update dependent views

      this.UpdateViews();
    }
  }, {
    key: "DeregisterAnnotation",
    value: function DeregisterAnnotation(annotation) {
      this.annotationManager.RemoveAnnotation(annotation.id); //this.annotationsNow = this.annotationManager.AnnotationsAtTime(this.player.videoElement.currentTime);
      // Throw event for listening objects (e.g. tick-bar)

      this.$container.trigger("OnAnnotationRemoved", [annotation.id]); // Update dependent views

      this.UpdateViews();
    }
  }, {
    key: "LoadFromFile",
    value: function LoadFromFile() {
      var _this3 = this;

      // Create the dialog
      var $container = $("<div class='waldorf-session-modal' title='Import Annotation'></div>"); // Outermost HTML

      var $headText = $("<p class='validateTips'>Annotations must be W3C OA compliant in JSON format.</p>").appendTo($container);
      var $errorText = $("<p class='validateTips modal-error-text'></p>").appendTo($container);
      $errorText.hide();
      var $form = $("<form></form>").appendTo($container);
      var $importField;
      $("<label for='importFile'>Select File</label>").appendTo($form);
      $importField = $("<input type='file' name='importFile' class='file ui-widget-content ui-corner-all'>").appendTo($form);
      $form.wrapInner("<fieldset />");

      var error = function error(message) {
        console.error(message);
        $errorText.html(message);
        $errorText.show();
      };

      var self = this;
      $importField.on('change', function () {
        var files = $importField.get(0).files;
        var fr = new FileReader();

        fr.onload = function (localFile) {
          // If the JSON is malformed, show an error and stop here.
          try {
            JSON.parse(localFile.target.result);
          } catch (e) {
            error("JSON file is malformed!");
            return;
          }

          var localJson = JSON.parse(localFile.target.result);

          if (typeof localJson.target != "undefined") {
            var annotation = new _annotation2.Annotation(localJson);

            if (_this3.ValidateAnnotation(annotation)) {
              // Open the GUI and populate it with this annotation's data.
              _this3.gui.BeginEditing(annotation, true);

              _this3.gui.CommitAnnotationToServer(function () {
                return;
              });
            } else {
              error("JSON is invalid!");
            }
          } else {
            for (var i = 0; i < localJson.length; i++) {
              var _annotation = new _annotation2.Annotation(localJson[i]);

              if (_this3.ValidateAnnotation(_annotation)) {
                // Open the GUI and populate it with this annotation's data.
                _this3.gui.BeginEditing(_annotation, true);

                _this3.gui.CommitAnnotationToServer(function (annotation) {
                  _this3.RegisterNewAnnotation(annotation);

                  _this3.gui.Close();
                });
              } else {
                error("JSON is invalid!");
              }
            }
          }

          $dialog.dialog("close");
        };

        fr.readAsText(files[0]);
      });
      var $dialog = $container.dialog({
        autoOpen: true,
        draggable: false,
        modal: true,
        buttons: {
          Cancel: function Cancel() {
            $dialog.dialog("close");
          }
        },
        close: function close() {
          $dialog.find("form")[0].reset();
          $dialog.find("input").removeClass("ui-state-error"); //this.OnModalClose();
        }
      });
    }
  }, {
    key: "ValidateAnnotation",
    value: function ValidateAnnotation(annotation) {
      // TODO: Validate annotation here. Return false if any
      // required properties are not present.
      return true;
    } // checking whether the browser is safari or not

  }, {
    key: "IsSafari",
    value: function IsSafari() {
      //ref: https://stackoverflow.com/questions/49872111/detect-safari-and-stop-script
      var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      return isSafari;
    }
  }]);

  return VideoAnnotator;
}();

exports.VideoAnnotator = VideoAnnotator;

},{"../annotator-config.json":1,"../utils/preference-manager.js":18,"./annotation-manager.js":2,"./annotation.js":3,"./components/annotation-gui.js":5,"./components/index-container.js":6,"./components/info-container.js":7,"./components/message-overlay.js":8,"./components/polygon-overlay.js":10,"./components/tick-bar.js":11,"./server-interface.js":12,"./session-manager.js":13,"sha1":34}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnnotationGUI = void 0;

var _time = require("../../utils/time.js");

var _polygonEditor = require("./polygon-editor.js");

var _annotation = require("../annotation.js");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var AnnotationGUI = /*#__PURE__*/function () {
  function AnnotationGUI(annotator) {
    var _this = this;

    _classCallCheck(this, AnnotationGUI);

    this.annotator = annotator;
    this.Create();
    this.open = false; //Hide the container

    this.isVisible = false;
    this.$container.makeVisible(false);
    this.polyEditor = new _polygonEditor.PolygonEditor(this.annotator);
    
    this.annotator.$container.on("OnPolygonEditingEnded", function () {
      _this.SetVisible(true);

      _this.polyEditor.ShowJustPolygon();
    });
  }

  _createClass(AnnotationGUI, [{
    key: "Create",
    value: function Create() {
      var _this2 = this;

      /*
       * //new UI
       * 
       */
      this.$container = $("<div id='create-dialog' class='ui-widget-content center'>").appendTo(this.annotator.player.$container);
      this.$container.draggable();
      this.$title = $("<div class='dialog-title'>Create Annotation</div>").appendTo(this.$container); // Make cancel button

      var $exitButton = $("<button>Exit Annotation Editing</button>").button({
        icons: {
          primary: 'fa fa-remove'
        },
        showLabel: false
      });
      $exitButton.css("float", "right");
      $exitButton.attr('title', "Exit annotation editing");
      $exitButton.addClass("waldorf-cancel-button");
      $exitButton.click(function () {
        _this2.polyEditor.ResetPolygons();

        _this2.Close();
      });
      this.RegisterElement($exitButton, this.$title, -1);
      this.$tabs = $("<div id='tabs'></div>").appendTo(this.$container);
      var $tabUI = $("<ul></ul>");
      var $startUI = $("<li><a href='#start_tab'>Start </a></li>");
      var $bodyUI = $("<li><a href='#body_tab'>Body </a></li>");
      var $stopUI = $("<li><a href='#stop_tab'>Stop </a></li>");
      this.RegisterElement($tabUI, this.$tabs, -1);
      this.RegisterElement($startUI, $tabUI, -1);
      this.RegisterElement($bodyUI, $tabUI, -1);
      this.RegisterElement($stopUI, $tabUI, -1);
      var $startTab = $("<div id='start_tab' class='ui-field-contain'>" + "<label for='start_time'>Start Time</label><br>" + "</div>");
      this.RegisterElement($startTab, this.$tabs, -1); // Make "Start time" label and field

      this.$timeStartField = $('<input type="text" name="time-start" id="time-start" value="">').appendTo($startTab);
      this.$timeStartField.width(72);
      this.$timeStartField.css("font-family", "Courier, monospace");
      this.$timeStartField.css("margin-right", "2px");
      this.$timeStartField.addClass("ui-widget ui-widget-content ui-corner-all");
      this.$timeStartField.attr('title', "Start time (hh:mm:ss.ss)");
      this.$timeStartField.on('keypress', function (event) {
        if (event.keyCode == 46 || event.keyCode >= 48 && event.keyCode <= 58) {
          //0-9, period, and colon
          return true;
        }

        return false;
      }); //add start marker button

      this.$startTimeMarker = $("<button style='padding:0; line-height:1.4'>Set End</button>").button({
        icon: "fa fa-map-marker",
        showLabel: false
      }).click(function () {
        _this2.$timeStartField[0].value = (0, _time.GetFormattedTime)(_this2.annotator.player.videoElement.currentTime);
      });
      this.RegisterElement(this.$startTimeMarker, $startTab, -2); //start point polygon is added

      this.$startPolygonSet = $("<button style='padding:0; line-height:1.4'>Start Polygon Set</button>").button({
        icon: "fa fa-check-square-o",
        showLabel: false
      }); //this.$startPolygonSet.css("visibility", "inherit");

      this.$startPolygonSet.css("visibility", "hidden");
      this.$startPolygonSet.addClass("waldorf-confirm-button"); //this.RegisterElement(this.$startPolygonSet, $startTab, -2); 

      var $bodyTab = $("<div id='body_tab'></div>");
      this.RegisterElement($bodyTab, this.$tabs, -1); // Add tags input field

      this.$tagsField = $('<select class="form-control" multiple="multiple"></select>');
      this.$tagsField.width("100%");
      this.$tagsField.css("margin-top", "-8px");
      this.RegisterElement(this.$tagsField, $bodyTab, -1);
      this.$tagsField.select2({
        tags: true,
        placeholder: "Tags",
        ajax: this.GetTagsQuery(),
        selectOnBlur: true,
        // Allow manually entered text in drop down.
        createTag: function createTag(params) {
          return {
            id: params.term,
            text: params.term,
            newOption: true
          };
        }
      }); // Add custom class for bringing the dropdown to the front (fullscreen fix)

      this.$tagsField.data('select2').$dropdown.addClass("select2-dropdown-annotator"); // Make notes text field

      this.$textField = $('<textarea type="text" name="anno-text" id="anno-text" value="" placeholder="Notes">');
      this.$textField.css("margin-top", "2px");
      this.$textField.width("98.5%");
      this.$textField.addClass("ui-widget ui-widget-content ui-corner-all");
      this.$textField.attr('title', 'Annotation text');
      this.$textField.css("flex-grow", 2);
      this.RegisterElement(this.$textField, $bodyTab, -1);
      var $stopTab = $("<div id='stop_tab'>" + "<label for='stop_time'>Stop Time</label><br>" + "</div>");
      this.RegisterElement($stopTab, this.$tabs, -1); // Make "Start time" label and field

      this.$timeEndField = $('<input type="text" name="time-start" id="time-start" value="">').appendTo($stopTab);
      this.$timeEndField.width(72);
      this.$timeEndField.css("font-family", "Courier, monospace");
      this.$timeEndField.css("margin-right", "2px");
      this.$timeEndField.addClass("ui-widget ui-widget-content ui-corner-all");
      this.$timeEndField.attr('title', "Start time (hh:mm:ss.ss)");
      this.$timeEndField.on('keypress', function (event) {
        if (event.keyCode == 46 || event.keyCode >= 48 && event.keyCode <= 58) {
          //0-9, period, and colon
          return true;
        }

        return false;
      }); //add start marker button

      this.$endTimeMarker = $("<button style='padding:0; line-height:1.4'>Set End</button>").button({
        icon: "fa fa-map-marker",
        showLabel: false
      }).click(function () {
        _this2.$timeEndField[0].value = (0, _time.GetFormattedTime)(_this2.annotator.player.videoElement.currentTime);
      });
      this.RegisterElement(this.$endTimeMarker, $stopTab, -2); //stop point polygon is added

      this.$endPolygonSet = $("<button style='padding:0; line-height:1.4'>End Polygon Set</button>").button({
        icon: "fa fa-check-square-o",
        showLabel: false
      }); //this.$endPolygonSet.css("visibility", "inherit");

      this.$endPolygonSet.css("visibility", "hidden"); //this.$endPolygonSet.addClass("waldorf-confirm-button");
      //Add some error checking...

      this.$timeEndField.blur(function () {
        var e = $(_this2.$timeEndField).val();
        var s = $(_this2.$timeStartField).val();

        if ((0, _time.GetSecondsFromHMS)(s + 1) > (0, _time.GetSecondsFromHMS)(e)) {
          $(_this2.$timeEndField).val((0, _time.GetFormattedTime)((0, _time.GetSecondsFromHMS)(s) + .01));
        }
      });
      this.$timeStartField.blur(function () {
        var e = $(_this2.$timeEndField).val();
        var s = $(_this2.$timeStartField).val();

        if ((0, _time.GetSecondsFromHMS)(s + 1) > (0, _time.GetSecondsFromHMS)(e)) {
          $(_this2.$timeEndField).val((0, _time.GetFormattedTime)((0, _time.GetSecondsFromHMS)(s) + .01));
        }
      });
      this.RegisterElement(this.$endPolygonSet, $stopTab, -2);
      var $buttonPanel = $("<div class='button_panel'></div>").appendTo(this.$container);
      var $startTargetLabel = $("<label>Start Target</label><br>");
      $startTargetLabel.css("color", "white");
      this.RegisterElement($startTargetLabel, $buttonPanel, -1); //Make "Edit polygon" button

      var $editPolyButton = $("<button>Edit Polygon</button>").button({
        icon: "fa fa-pencil",
        showLabel: false
      }).click(function () {
        _this2.SetVisible(false);

        console.log("annotation-gui:353 Create");

        _this2.polyEditor.BeginEditing();
      });
      $editPolyButton.attr('title', "Edit polygon test2");
      this.RegisterElement($editPolyButton, $buttonPanel, -1); // Make delete button

      this.$deleteButton = $("<button>Delete Annotation</button>").button({
        icon: "fa fa-bomb",
        showLabel: false
      });
      this.$deleteButton.css("margin-right", "15px");
      this.$deleteButton.attr('title', "Delete annotation");
      this.$deleteButton.click(function () {
        _this2.annotator.server.DeleteAnnotation(_this2.originalAnnotation).done(function (response) {
          _this2.annotator.DeregisterAnnotation(_this2.originalAnnotation);

          _this2.Close();
        });
      });
      this.RegisterElement(this.$deleteButton, $buttonPanel, -1); // Make cancel button

      var $cancelButton = $("<br><br><button>Cancel</button>").button({
        showLabel: true
      }).click(function () {
        _this2.polyEditor.ResetPolygons();

        _this2.Close();
      });
      $cancelButton.css("float", "right");
      $cancelButton.attr('title', "Exit annotation editing"); //$cancel_button.addClass("waldorf-cancel-button");

      this.RegisterElement($cancelButton, $buttonPanel, -1); // Make save button

      var $saveButton = $("<button>Save</button>").button({
        showLabel: true
      }).click(function () {
        _this2.CommitAnnotationToServer(function (annotation, oldID) {
          if (_this2.editMode) {
            _this2.annotator.UpdateAnnotation(annotation, oldID);
          } else {
            _this2.annotator.RegisterNewAnnotation(annotation);
          }

          _this2.polyEditor.ResetPolygons();

          _this2.Close();
        });
      });
      $saveButton.css("float", "left");
      this.RegisterElement($saveButton, $buttonPanel, -1); //https://stackoverflow.com/questions/13837304/jquery-ui-non-ajax-tab-loading-whole-website-into-itself

      $('base').remove();
      this.$tabs.tabs().addClass('ui-tabs-vertical'); //let $script_section = $
      //this.$container.hide();
    }
  }, {
    key: "RegisterElement",
    value: function RegisterElement($element, $container, order) {
      var justification = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'flex-start';
      $element.css('order', order);
      $element.css('align-self', justification); // Sets grow [shrink] [basis]
      //$element.css('flex', '0 0 auto');

      $container.append($element);
    }
  }, {
    key: "SetVisible",
    value: function SetVisible(isVisible) {
      var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      console.log('[SetVisible 2] ' + isVisible + " " + duration);
      if (isVisible) {
        this.$container.fadeTo(duration, 1.0);
        this.$container.makeVisible(true);
      } else {
        this.$container.stop(true, true);
        this.$container.fadeTo(duration, 0.0);
        this.$container.makeVisible(false);
      }

      this.isVisible = isVisible;
    }
  }, {
    key: "ToggleOpen",
    value: function ToggleOpen() {
      if (this.open) {
        this.Close();
      } else {
        this.Open();
      }
    }
  }, {
    key: "Open",
    value: function Open() {
      this.SetVisible(true);
      this.open = true;
      this.polyEditor.Done(); // Disable autofading when the gui is visible

      this.annotator.player.SetAutoFade(false);
    }
  }, {
    key: "Close",
    value: function Close() {
      this.SetVisible(false);
      this.open = false;
      this.polyEditor.Done(); // Re-enable autofading when the gui is hidden

      this.annotator.player.SetAutoFade(true);
      this.$container.trigger("OnGUIClosed");
    }
  }, {
    key: "ToggleVisible",
    value: function ToggleVisible() {
      this.SetVisible(!this.isVisible, 0);
    }
  }, {
    key: "BeginEditing",
    value: function BeginEditing() {
      var annotation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var forceNew = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      // Open the GUI if it isn't already
      this.Open();
      console.log("annotation-gui: BeginEditing 447");
      console.log(this.polyEditor.$polygons); //console.log(annotation);
      // Populate data from the passed in annotation

      if (annotation || forceNew) {
        // Populate the fields from the annotation
        this.editMode = true; // Flip edit mode back to false if forceNew. We want to
        // populate from the entire passed in annotation, but treat
        // it as new.

        if (forceNew) this.editMode = false;
        this.originalAnnotation = annotation;
        console.log("Populated from an existing annotation");
        console.log(annotation);
        this.$timeStartField.val((0, _time.GetFormattedTime)(annotation.beginTime));
        this.$timeEndField.val((0, _time.GetFormattedTime)(annotation.endTime));
        this.$textField.val(annotation.body.filter(function (item) {
          return item.purpose == "describing";
        })[0].value); // Reset the tags field

        this.$tagsField.val("").trigger("change");
        this.$tagsField.find("option").remove();

        var _iterator = _createForOfIteratorHelper(annotation.tags),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var tag = _step.value;
            this.$tagsField.append("<option value='" + tag + "' selected>" + tag + "</option>");
            this.$tagsField.trigger("change");
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        this.polyEditor.InitPoly(annotation.getPoly());
        this.polyEditor.ShowJustPolygon();
      } // Insert template data if no annotation is given
      else {
          // Populate fields if no annotation is given
          this.editMode = false;
          this.originalAnnotation = null;
          console.log("Populated with template data");
          this.$timeStartField.val((0, _time.GetFormattedTime)(this.annotator.player.videoElement.currentTime));
          this.$timeEndField.val((0, _time.GetFormattedTime)(this.annotator.player.videoElement.duration));
          this.$textField.val(""); // Reset the tags field

          this.$tagsField.val("").trigger("change");
          this.$tagsField.find("option").remove();
          this.polyEditor.InitPoly();
        } // Modify GUI based on edit mode


      if (this.editMode) {
        this.$title.text("Edit Annotation");
        this.$deleteButton.button("enable");
      } else {
        this.$title.text("Create Annotation");
        this.$deleteButton.button("disable");
      }
    }
  }, {
    key: "CommitAnnotationToServer",
    value: function CommitAnnotationToServer(callback) {
      if (this.editMode) {
        console.log("Sending edited annotation to server...");
        this.annotator.server.EditAnnotation(callback);
      } else {
        console.log("Sending new annotation to server...");
        this.annotator.server.PostAnnotation(callback);
      }
    } // Build an Open Annotation object from the data.

  }, {
    key: "GetAnnotationObject",
    value: function GetAnnotationObject() {
      var annotation = new _annotation.Annotation(this.originalAnnotation); //console.log("this.originalAnnotation: " + JSON.stringify(this.originalAnnotation)); //prints null

      annotation["body"] = this.BuildAnnotationBodyV1();
      annotation["target"] = this.BuildAnnotationTarget(); //annotation["items"] = this.BuildAnnotationItems();
      // Recompute read-only access properties after all other properties have been set

      annotation.recalculate(); // Clone the object so we don't modify anything by changing this object

      var clone = JSON.parse(JSON.stringify(annotation));
      return clone;
    }
  }, {
    key: "BuildAnnotationItems",
    value: function BuildAnnotationItems() {
      var buildTime = new Date().toISOString(); //"2020-08-16T12:00:00Z"

      var items = [{
        "id": "",
        //TODO: "art:url" from annotation json file
        "type": "Canvas",
        "height": 480,
        //TODO:
        "width": 640,
        //TODO:
        "duration": 143,
        //TODO:
        "content": [{
          "id": "",
          //TODO: media file reference id - check the incoming annotation collection for id
          "type": "Video",
          "height": 480,
          //TODO:
          "width": 640,
          //TODO:
          "duration": 143,
          //TODO:
          "label": {
            "en": "Inception Corgi Flop" //TODO: "dcterms:title" from the annotation json file

          },
          "description": {
            "en": ""
          }
        }],
        "items": [{
          "id": "",
          "type": "AnnotationPage",
          "generator": "http://github.com/anvc/scalar",
          "generated": buildTime,
          "items": [{
            "id": "",
            //Annotation id - after successful data saving
            "type": "Annotation",
            "generator": "http://github.com/novomancy/waldorf-scalar",
            //TODO: config value
            "motivation": "highlighting",
            "creator": this.BuildCreatorTemplate(),
            //TODO: 
            "created": buildTime,
            "rights": "https://creativecommons.org/licenses/by/4.0/"
          }],
          "body": this.BuildAnnotationBodyV2(),
          //TODO: 
          "target": this.BuildAnnotationTarget()
        }]
      }];
      return items;
    } //TODO:

  }, {
    key: "BuildCreatorTemplate",
    value: function BuildCreatorTemplate() {
      return {
        "type": "Person",
        "nickname": "John Bell",
        "email_sha1": "REMOVED"
      };
    } //TODO: build with tags entries from onomy

  }, {
    key: "BuildAnnotationBodyV2",
    value: function BuildAnnotationBodyV2() {
      return this.BuildAnnotationBodyV1();
    }
  }, {
    key: "BuildAnnotationBodyV1",
    value: function BuildAnnotationBodyV1() {
      var body = []; // Build text descriptor

      var bodyText = {
        "type": "TextualBody",
        "value": this.$textField.val(),
        "format": "text/plain",
        "language": "en",
        "purpose": "describing"
      };
      body.push(bodyText); // Build tag descriptors

      var tags = this.$tagsField.select2("data").map(function (item) {
        return item.text;
      });

      var _iterator2 = _createForOfIteratorHelper(tags),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var tagStr = _step2.value;
          var bodyTag = {
            "type": "TextualBody",
            "purpose": "tagging",
            "value": tagStr
          };
          body.push(bodyTag);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return body;
    }
  }, {
    key: "BuildAnnotationTarget",
    value: function BuildAnnotationTarget() {
      var target = {
        "id": this.annotator.url,
        // URL of the video
        "type": "Video"
      };
      var selectors = [];
      var safeEndTime = (0, _time.GetSecondsFromHMS)(this.$timeStartField.val());

      if ((0, _time.GetSecondsFromHMS)(this.$timeEndField.val()) > (0, _time.GetSecondsFromHMS)(this.$timeStartField.val())) {
        safeEndTime = (0, _time.GetSecondsFromHMS)(this.$timeEndField.val());
      }

      var startTime = (0, _time.GetSecondsFromHMS)(this.$timeStartField.val()); //Build SvgSelector

      if (this.polyEditor.$polygons.length > 0) {
        var pointsStr = this.polyEditor.$polygons[0].map(function (item) {
          return "".concat(item[0], ",").concat(item[1]);
        }).join(" ");
        var animeStr = this.polyEditor.$polygons[1].map(function (item) {
          return "".concat(item[0], ",").concat(item[1]);
        }).join(" ");
        var value = "<svg viewBox='0 0 100 100' preserveAspectRatio='none'>";
        value += "<polygon points='" + pointsStr + "' />";
        value += "<animate attributeName='points' from='" + pointsStr + "' to='" + animeStr + "'";
        value += " start='" + startTime + "' end='" + safeEndTime + "' />";
        value += "</svg>";
        var polygonSelector = {
          "type": "SvgSelector",
          "conformsTo": "http://www.w3.org/TR/media-frags/",
          //added for v2
          "value": "".concat(value) // http://stackoverflow.com/a/24898728

        };
        selectors.push(polygonSelector);
      } // Build time selector


      var timeSelector = {
        "type": "FragmentSelector",
        "conformsTo": "http://www.w3.org/TR/media-frags/",
        // See media fragment specification
        "value": "t=".concat(startTime, ",").concat(safeEndTime) // Time interval in seconds

      };
      selectors.push(timeSelector); // Finalize target section

      target["selector"] = selectors;
      return target;
    }
  }, {
    key: "GetTagsQuery",
    value: function GetTagsQuery() {
      console.log("this.annotator.onomyLanguage: " + this.annotator.onomyLanguage);
      return {
        url: this.annotator.tagsURL,
        dataType: 'json',
        delay: 250,
        cache: true,
        onomyLanguage: this.annotator.onomyLanguage,
        processResults: function processResults(data) {
          // Parse the labels into the format expected by Select2
          // multilingual tags
          var multilingual_tags = []; //let m_comments = {};
          //let comments = {};

          var m_index = 1;
          var tags = [];
          var index = 1; //let root_comment = data["rdfs:comment"];

          var _iterator3 = _createForOfIteratorHelper(data["terms"]),
              _step3;

          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var term = _step3.value;

              //if onomyLanguage is defined collect multilingual tags
              //let terms_id = term["rdfs:about"];
              if (this.ajaxOptions.onomyLanguage != '' && term['labels'] != undefined) {
                var _iterator4 = _createForOfIteratorHelper(term["labels"]),
                    _step4;

                try {
                  for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                    var label = _step4.value;
                    var xml_lang = label["xml:lang"];
                    var m_label = label["rdfs:label"];

                    if (xml_lang == this.ajaxOptions.onomyLanguage && m_label && m_label.trim != "") {
                      multilingual_tags.push({
                        id: m_index,
                        text: m_label
                      });
                    }
                  } // if (term['comments'] != undefined) {
                  //     for (let label of term['comments']) {
                  //         let xml_lang = label["xml:lang"];
                  //         let m_comment = label["rdfs:comments"]; //TODO: change to comment after fixing Onomy
                  //         if (xml_lang == this.ajaxOptions.onomyLanguage && m_comment && m_comment.trim != "") {
                  //             m_comments[m_index] = m_comment;
                  //         } 
                  //     }
                  // }
                  // // push the root value if it is blank
                  // if (m_comments[m_index].comment == undefined || m_comments[m_index].comment.trim == "") {
                  //     m_comments[m_index] = root_comment
                  // }

                } catch (err) {
                  _iterator4.e(err);
                } finally {
                  _iterator4.f();
                }

                m_index++;
              }

              tags.push({
                id: index,
                text: term["rdfs:label"]
              }); // let node_comment = term["rdfs:comment"];
              // if (node_comment.trim == "") {
              //     node_comment = root_comment;
              // }
              // comments[index] = node_comment;

              index++;
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }

          var return_tags = multilingual_tags;

          if (return_tags.length == 0) {
            return_tags = tags;
          }

          console.log("return_tags");
          console.log(return_tags);
          return {
            //results: tags - use tags when the language is not defined
            results: return_tags
          };
        }
      };
    }
  }]);

  return AnnotationGUI;
}();

exports.AnnotationGUI = AnnotationGUI;

},{"../../utils/time.js":21,"../annotation.js":3,"./polygon-editor.js":9}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IndexContainer = void 0;

var _time = require("../../utils/time.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var sha1 = require('sha1');

var IndexContainer = /*#__PURE__*/function () {
  function IndexContainer(annotator) {
    var _this = this;

    _classCallCheck(this, IndexContainer);

    console.log("[Index Container] Creating annotation index");
    this.annotator = annotator;
    var container = $(".waldorf-index");

    if (container.length > 0) {
      this.$container = container.first();
    } else {
      this.$container = $("<div class='waldorf-index' aria-live='polite' role='navigation'></div>").appendTo(this.annotator.$container);
    }

    this.annotationList = $("<ul class='waldorf-annotation-list' role='menubar'></ul>").appendTo(this.$container); // Attach event handlers

    this.annotator.$container.on("OnAnnotationsLoaded", function (event, annotationManager) {
      return _this.Rebuild();
    });
    this.annotator.$container.on("OnAnnotationRegistered", function (event, annotation) {
      return _this.Rebuild();
    });
    this.annotator.$container.on("OnAnnotationRemoved", function (event, id) {
      return _this.Rebuild();
    });
  }

  _createClass(IndexContainer, [{
    key: "Rebuild",
    value: function Rebuild() {
      this.annotationList.empty(); // if(this.annotator.unrenderer) this.annotator.unrenderer(this.annotator);
      // let plural = annotations.length == 1 ? "" : "s";
      // let totalAnnotations = this.annotator.annotationManager.annotations.length;
      // this.$container.html(`<p>Showing ${annotations.length} annotation${plural} (${totalAnnotations} total).</p>`);
      // Add each annotation to the readout

      var ordered = this.annotator.GetAnnotations();

      for (var i = 0; i < ordered.length; i++) {
        this.annotationList.append(this.MakeContainer(this.annotator, ordered[i], i));
      }
    }
  }, {
    key: "MakeContainer",
    value: function MakeContainer(annotator, annotation) {
      //TODO: ARIA and general screen reader compatibility
      var $panel = $("<li role='presentation' data-creator=" + annotation.creator.email + " data-tags='" + annotation.tags.join(", ").replace("'", "%27") + "'></li>"); //let text = JSON.stringify(annotation.AsOpenAnnotation(), null, 2);

      var headerText = (0, _time.GetFormattedTime)(annotation.beginTime) + " - " + (0, _time.GetFormattedTime)(annotation.endTime); // Add clickable header that brings up the edit interface.

      var $header = $("<a href='' title='Go to Annotation' role='menuitem'>" + headerText + "</a><br>");
      $header.click(function (event) {
        event.preventDefault();
        annotator.player.videoElement.currentTime = annotation.beginTime; // if(annotator.player.videoElement.annotationTimeout) clearTimeout(annotator.player.videoElement.annotationTimeout);
        // annotator.player.videoElement.annotationTimeout = setTimeout(function(){
        //     annotator.player.videoElement.pause()}, (annotation.endTime-annotation.beginTime) * 1000
        // );
        //annotator.player.videoElement.src=annotator.url + "#t=" + annotation.beginTime +","+annotation.endTime;
        //annotator.player.videoElement.play();

        annotator.player.Play();
        annotator.player.endTime = annotation.endTime;

        if (annotation.beginTime + 1 > annotation.endTime) {
          annotator.player.Pause();
        }
      });
      $panel.append($header);
      var $content = $("<p></p>");
      $content.append("<b>Text: </b> " + annotation.body.filter(function (item) {
        return item.purpose === "describing";
      })[0].value);
      $content.append("<br>");
      $content.append("<b>Tags: </b> " + annotation.tags.join(", "));
      $content.append("<br>");
      $panel.append($content);
      $panel.appendTo(annotator.$annotationList); // console.log($panel);

      return $panel;
    }
  }]);

  return IndexContainer;
}();

exports.IndexContainer = IndexContainer;

},{"../../utils/time.js":21,"sha1":34}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InfoContainer = void 0;

var _time = require("../../utils/time.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var sha1 = require('sha1');

var InfoContainer = /*#__PURE__*/function () {
  function InfoContainer(annotator) {
    _classCallCheck(this, InfoContainer);

    this.annotator = annotator;
    var container = $(".waldorf-info");

    if (container.length > 0) {
      this.$container = container.first();
    } else {
      this.$container = $("<div class='waldorf-info' aria-live='polite' aria-atomic='true'></div>").appendTo(this.annotator.$container);
    }
  }

  _createClass(InfoContainer, [{
    key: "Rebuild",
    value: function Rebuild(annotations, clearContainer) {
      if (clearContainer) this.$container.empty();
      if (this.annotator.unrenderer) this.annotator.unrenderer(this.annotator); // let plural = annotations.length == 1 ? "" : "s";
      // let totalAnnotations = this.annotator.annotationManager.annotations.length;
      // this.$container.html(`<p>Showing ${annotations.length} annotation${plural} (${totalAnnotations} total).</p>`);
      // Add each annotation to the readout

      var renderer = this.annotator.renderer === false ? this.MakeContainer : this.annotator.renderer;

      for (var i = 0; i < annotations.length; i++) {
        this.$container.append(renderer(this.annotator, annotations[i], i));
      }
    }
  }, {
    key: "MakeContainer",
    value: function MakeContainer(annotator, annotation, index) {
      var $panel = $("<p></p>").appendTo($("<div></div>").appendTo(annotator.$container)); //let text = JSON.stringify(annotation.AsOpenAnnotation(), null, 2);
      // Add clickable header that brings up the edit interface.

      var $header = $("<b>Annotation ".concat(index + 1, ":</b><br>"));

      if (annotator.kioskMode == false) {
        $header = $("<a href='' title='Edit Annotation'><b>Annotation ".concat(index + 1, ":</b><br></a>"));
        $header.click(function (event) {
          event.preventDefault();
          annotator.gui.BeginEditing(annotation);
        });
      }

      $panel.append($header);
      var $content = $("<p></p>");
      $content.append("<b>Text: </b> " + annotation.body.filter(function (item) {
        return item.purpose === "describing";
      })[0].value);
      $content.append("<br>");
      $content.append("<b>Tags: </b> " + annotation.tags.join(", "));
      $content.append("<br>");
      $content.append("<b>Time: </b> " + (0, _time.GetFormattedTime)(annotation.beginTime) + " - " + (0, _time.GetFormattedTime)(annotation.endTime));
      $content.append("<br>");
      $content.append("<b>Submitted by:</b><br />" + (annotation.creator != null ? annotation.creator.nickname + ' (' + annotation.creator.email + ')' : "unspecified")); //$paragraph.append("<strong>Annotation " + (index + 1) + ":</strong><br><pre>" + text.escapeHTML() + "</pre>");

      $panel.append($content);
      return $panel;
    }
  }]);

  return InfoContainer;
}();

exports.InfoContainer = InfoContainer;

},{"../../utils/time.js":21,"sha1":34}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MessageOverlay = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var MessageOverlay = /*#__PURE__*/function () {
  function MessageOverlay(annotator) {
    _classCallCheck(this, MessageOverlay);

    this.annotator = annotator;
    this.$container = $("<div class='waldorf-message-overlay'></div>");
    this.$container.appendTo(this.annotator.player.$container);
    this.$text = $("<p role='alert' aria-live='assertive' aria-atomic='true'></p>").appendTo(this.$container);
    this.$container.fadeOut(0);
  }

  _createClass(MessageOverlay, [{
    key: "ShowError",
    value: function ShowError(message) {
      var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3.0;
      this.$container.addClass("waldorf-message-overlay-error");

      this._ShowText(message, duration);
    }
  }, {
    key: "ShowMessage",
    value: function ShowMessage(message) {
      var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5.0;
      this.$container.removeClass("waldorf-message-overlay-error");

      this._ShowText(message, duration);
    }
  }, {
    key: "_ShowText",
    value: function _ShowText(message) {
      var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5.0;
      this.$text.html(message); //this.$container.stop(true, true);

      this.$container.finish();
      this.$container.fadeIn(0).delay(duration * 1000).fadeOut(400);
    }
  }]);

  return MessageOverlay;
}();

exports.MessageOverlay = MessageOverlay;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PolygonEditor = void 0;

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Manages the creating or editing of a single polygon on the video.
 * Consists of a toolbar, an overlay, and the polygon inside the overlay.
 *
 * Click to place or remove a draggable point. Points should be
 * put down in clockwise order.
 */
var PolygonEditor = /*#__PURE__*/function () {
  function PolygonEditor(annotator) {
    var _this = this;

    _classCallCheck(this, PolygonEditor);

    this.annotator = annotator;
    this.baseZ = 2147483649;
    this.$breadcrumbs = [];
    this.$polygons = [];
    this.$tempBreadCrumbs = []; // Create the video overlay

    this.$clickSurface = $("<div class='waldorf-edit-overlay waldorf-vp-click-surface'></div>").appendTo(this.annotator.player.$container); //this.$clickSurface.css("z-index", this.baseZ);

    this.$clickSurface.click(function (event) {
      _this.OnSurfaceClick(event);
    }); // Create the poly object for start position polygon

    this.$startPoly = ""; // Create the poly object

    this.$poly = $("<div class='waldorf-edit-poly'></div>").appendTo(this.annotator.player.$container);
    this.$poly.css("z-index", this.baseZ + 1);
    this.ResizeOverlay();
    this.annotator.player.$container.on("OnFullscreenChange", function (event, setFullscreen) {
      return _this.ResizeOverlay();
    }); // Create the toolbar up top

    this.$bar = $("<div class='waldorf-vp-post'></div>").appendTo(this.annotator.player.$container);
    this.$postToolbar = $("<div class='flex-toolbar'></div>").appendTo(this.$bar); // Invisible expanding divider
    //-3//this.$postToolbar.append($("<div><p style='color:white'>Edit Polygon</p></div>").css("flex-grow", 1).css("order", 0));
    // Make "Collect Polygon state" button

    this.$capPolyButton = $("<button>Capture Polygon</button>").button({
      icon: "fa fa-camera-retro",
      showLabel: false
    }).click(function () {
      //console.log("Capturing the polygon");
      //this.SetVisible(false);
      //this.GetPoints();
      // Build polygon selector
      // let points = this.GetPoints();
      // if(points.length > 0) {
      //     let pointsStr = points.map(item => { return `${item[0]},${item[1]}` }).join(" ");
      //     let polygonSelector = {
      //         "type": "SvgSelector",
      //         "value": `<svg:svg viewBox='0 0 100 100' preserveAspectRatio='none'><polygon points='${pointsStr}' /></svg:svg>` // http://stackoverflow.com/a/24898728
      //     }
      //     tmpSelectors.push(polygonSelector);
      // }
      // console.log("tmpSelectors");
      // console.log(tmpSelectors);
      _this.annotator.AddPolygonSet(_this.annotator.annotation.getPoly());
    });
    this.$capPolyButton.css("margin-right", "15px");
    this.$capPolyButton.attr('title', "Capture polygon"); //-3//this.RegisterElement(this.$capPolyButton, this.$postToolbar, 1, 'flex-end');
    // Create undo button

    this.$undoButton = $("<button>Remove Last Point</button>").button({
      icon: "fa fa-undo",
      showLabel: false
    });
    this.$undoButton.css("margin-right", "15px");
    this.$undoButton.attr('title', "Remove last point");
    this.$undoButton.click(function () {
      _this.RemoveLastBreadcrumb();
    }); //-3//this.RegisterElement(this.$undoButton, this.$postToolbar, 1, 'flex-end');
    // Create the confirm button

    this.$confirmButton = $("<button>Finish polygon</button>").button({
      icon: "fa fa-check",
      showLabel: false
    });
    this.$confirmButton.attr('title', "Finish polygon");
    this.$confirmButton.addClass("waldorf-confirm-button");
    this.$confirmButton.click(function () {
      _this.originalJSON = _this.GetJSON();

      _this.Done();

      _this.annotator.$container.trigger("OnPolygonEditingEnded");
    }); //-3//this.RegisterElement(this.$confirmButton, this.$postToolbar, 3, 'flex-end');
    // Create the cancel button

    this.$cancelButton = $("<button>Cancel polygon editing</button>").button({
      icon: "fa fa-remove",
      showLabel: false
    });
    this.$cancelButton.addClass("waldorf-cancel-button");
    this.$cancelButton.attr('title', "Cancel polygon editing");
    this.$cancelButton.click(function () {
      //Restore the original state
      _this.Restore();

      _this.Done();

      _this.annotator.$container.trigger("OnPolygonEditingEnded");
    }); //-3//this.RegisterElement(this.$cancelButton, this.$postToolbar, 2, 'flex-end');

    $(window).resize(function () {
      return _this.ResizeOverlay();
    });
    /* 
    * new UI
    */

    this.$editDialog = $("<div id='edit-dialog' class='waldorf-edit-overlay waldorf-vp-click-surface'></div>").appendTo(this.annotator.player.$container);
    this.$editDialog.draggable();
    this.$editDialog.css('z-index', this.baseZ + 100);
    this.$editDialog.click(function (event) {
      _this.OnSurfaceClick(event);
    });
    this.$space = $("<div>&nbsp;</div><hr>");
    this.RegisterElement(this.$space, this.$editDialog, 1, 'flex-end'); // Create undo button

    this.$undoButton1 = $("<button>Remove Last Point</button>").button({
      icon: "fa fa-undo",
      showLabel: false
    });
    this.$undoButton1.css("margin", "0px 5px 4px 5px");
    this.$undoButton1.attr('title', "Remove last point");
    this.$undoButton1.css('z-index', this.baseZ + 105);
    this.$undoButton1.click(function () {
      _this.RemoveLastBreadcrumb();
    });
    this.RegisterElement(this.$undoButton1, this.$editDialog, 1, 'flex-end'); // Make "Collect Polygon state" button

    this.$capPolyButton1 = $("<button>Capture Polygon</button>").button({
      icon: "fa fa-camera-retro",
      showLabel: false
    }).click(function () {
      // console.log("Capturing the polygon");
      // //this.SetVisible(false);
      // //this.GetPoints();
      // let tmpSelectors = [];
      // // Build polygon selector
      // let points = this.GetPoints();
      // if(points.length > 0) {
      //     let pointsStr = points.map(item => { return `${item[0]},${item[1]}` }).join(" ");
      //     let polygonSelector = {
      //         "type": "SvgSelector",
      //         "value": `<svg:svg viewBox='0 0 100 100' preserveAspectRatio='none'><polygon points='${pointsStr}' /></svg:svg>` // http://stackoverflow.com/a/24898728
      //     }
      //     tmpSelectors.push(polygonSelector);
      // }
      // console.log("tmpSelectors");
      // console.log(tmpSelectors);
      _this.AddPolygonSet(); //this.annotator.AddPolygonSet(this.annotator.annotation.getPoly());

    });
    this.$capPolyButton1.css("margin", "0px 5px 4px 5px");
    this.$capPolyButton1.attr('title', "Capture Polygon");
    this.$capPolyButton1.css('z-index', this.baseZ + 105);
    this.RegisterElement(this.$capPolyButton1, this.$editDialog, 1, 'flex-end'); // Create the cancel button

    this.$cancelButton1 = $("<button>Cancel polygon editing</button>").button({
      icon: "fa fa-remove",
      showLabel: false
    });
    this.$cancelButton1.css("margin", "0px 5px 4px 5px");
    this.$cancelButton1.addClass("waldorf-cancel-button");
    this.$cancelButton1.attr('title', "Cancel Polygon Editing");
    this.$cancelButton1.click(function () {
      //Restore the original state
      _this.Restore();

      _this.Done();

      _this.annotator.$container.trigger("OnPolygonEditingEnded");
    });
    this.RegisterElement(this.$cancelButton1, this.$editDialog, 2, 'flex-end');
    $(window).resize(function () {
      return _this.ResizeOverlay();
    });
    this.Done();
  }

  _createClass(PolygonEditor, [{
    key: "OnSurfaceClick",
    value: function OnSurfaceClick(event) {
      if ($(event.currentTarget).attr("id") == "edit-dialog") {
        return;
      } // Add a breadcrumb on click


      var target = $(event.currentTarget);
      var x = event.pageX - target.offset().left;
      var y = event.pageY - target.offset().top;
      var xPercent = x / target.width() * 100;
      var yPercent = y / target.height() * 100;
      this.AddBreadcrumb(xPercent, yPercent); //this.newPolyPoints.push([xPercent.toFixed(3), yPercent.toFixed(3)]);

      this.UpdatePolyClipping();
    }
    /**
     * Creates a new breadcrumb at the given (x, y) point on the
     * clickSurface, where x and y are percentages from 0 to 100.
     */

  }, {
    key: "AddBreadcrumb",
    value: function AddBreadcrumb(xPercent, yPercent) {
      var _this2 = this;

      var $breadcrumb = $("<div class='breadcrumb'></div>");
      $breadcrumb.appendTo(this.$clickSurface);
      $breadcrumb.css("position", "absolute"); // Percentage representations of breadcrumb width and height

      var offPercentX = $breadcrumb.outerWidth() / this.$clickSurface.width() * 100;
      var offPercentY = $breadcrumb.outerHeight() / this.$clickSurface.height() * 100; // Percentage representations of breadcrumb width and height

      $breadcrumb.css("left", (xPercent - offPercentX / 2).toString() + "%");
      $breadcrumb.css("top", (yPercent - offPercentY / 2).toString() + "%"); //$breadcrumb.css("z-index", this.baseZ - 50);

      $breadcrumb.draggable({
        //containment: "parent",
        drag: function drag() {
          // Recalculate percentages (mangled by jQuery UI draggable code)
          // See http://stackoverflow.com/a/23673462
          var l = 100 * parseFloat($breadcrumb.css("left")) / parseFloat($breadcrumb.parent().css("width")) + "%";
          var t = 100 * parseFloat($breadcrumb.css("top")) / parseFloat($breadcrumb.parent().css("height")) + "%";
          $breadcrumb.css("left", l);
          $breadcrumb.css("top", t);

          _this2.UpdatePolyClipping();
        }
      });
      $breadcrumb.click(function (event) {
        // Remove the breadcrumb on click
        event.stopPropagation();
        $breadcrumb.remove();

        _this2.$breadcrumbs.splice(_this2.$breadcrumbs.indexOf($breadcrumb), 1);

        _this2.UpdatePolyClipping();

        _this2.UpdateBreadcrumbColoring();
      });
      this.$breadcrumbs.push($breadcrumb); //this.UpdatePolyClipping();

      this.UpdateBreadcrumbColoring();
    }
    /**
     * Removes the last-placed breadcrumb from the list
     * and updates the view.
     */

  }, {
    key: "RemoveLastBreadcrumb",
    value: function RemoveLastBreadcrumb() {
      var $removed = this.$breadcrumbs.pop();
      $removed.remove();
      this.UpdatePolyClipping();
      this.UpdateBreadcrumbColoring();
    }
    /**
     * Gets the center of the breadcrumb as an (x, y) pair
     * representing the percentage distance from the top and left
     * of the click surface (0% - 100%).
     */

  }, {
    key: "GetCenterPercentage",
    value: function GetCenterPercentage($breadcrumb) {
      var topPercent = $breadcrumb.position().top / $breadcrumb.parent().height() * 100;
      var leftPercent = $breadcrumb.position().left / $breadcrumb.parent().width() * 100; // Percentage values for the dimensions of the breadcrumb relative to the click surface

      var offPercentX = $breadcrumb.outerWidth() / $breadcrumb.parent().width() * 100;
      var offPercentY = $breadcrumb.outerHeight() / $breadcrumb.parent().height() * 100;
      return {
        x: leftPercent + offPercentX / 2.0,
        y: topPercent + offPercentY / 2.0
      };
    }
  }, {
    key: "Reset",
    value: function Reset() {
      // Remove all breadcrumbs
      var _iterator = _createForOfIteratorHelper(this.$breadcrumbs),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var $breadcrumb = _step.value;
          $breadcrumb.remove();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.$breadcrumbs = []; // Remove the poly if it already exists
      // if(this.$poly != null){
      //     this.$poly.remove();
      // }
    }
  }, {
    key: "ResetPolygons",
    value: function ResetPolygons() {
      if (this.$startPoly) {
        this.$startPoly.clipPath([], {
          svgDefId: 'annotatorPolyEditorSvgStart'
        });
      }

      this.$polygons = [];
    }
  }, {
    key: "Restore",
    value: function Restore() {
      this.InitPoly(this.originalJSON);
    }
  }, {
    key: "InitPoly",
    value: function InitPoly() {
      var points = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      this.Reset(); // If JSON was specified, generate breadcrumbs from it.

      if (points != null) {
        // Put down the breadcrumbs
        var _iterator2 = _createForOfIteratorHelper(points),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var point = _step2.value;
            this.AddBreadcrumb(point[0], point[1]);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }

      this.UpdatePolyClipping();
      this.originalJSON = points;
    }
  }, {
    key: "AddStartPolygon",
    value: function AddStartPolygon() {
      var _this3 = this;

      if (this.$polygons.length > 0) {
        var startPolygon = this.$polygons[0]; //.map(item => { return `${item[0]},${item[1]}` }).join(" ");;
        // Create the poly object

        this.$startPoly = $("<div class='waldorf-start-poly'></div>").appendTo(this.$clickSurface);
        this.$startPoly.css("z-index", this.baseZ + 1000);

        if (startPolygon.length < 3) {
          this.$startPoly.clipPath([], {
            svgDefId: 'annotatorPolyEditorSvgStart'
          });
          return;
        }

        this.$startPoly.clipPath(startPolygon, {
          isPercentage: true,
          svgDefId: 'annotatorStartPolySvg'
        });
        startPolygon.map(function (point) {
          _this3.AddBreadcrumb(point[0], point[1]);
        });
      }
    }
  }, {
    key: "UpdatePolyClipping",
    value: function UpdatePolyClipping() {
      var _this4 = this;

      if (this.$breadcrumbs.length < 3) {
        this.$poly.clipPath([], {
          svgDefId: 'annotatorPolyEditorSvg'
        });
        return;
      }

      var points = this.$breadcrumbs.map(function ($crumb) {
        var pos = _this4.GetCenterPercentage($crumb);

        return [pos.x, pos.y];
      });
      this.$poly.clipPath(points, {
        isPercentage: true,
        svgDefId: 'annotatorPolyEditorSvg'
      });
    }
  }, {
    key: "UpdateBreadcrumbColoring",
    value: function UpdateBreadcrumbColoring() {
      for (var i = 0; i < this.$breadcrumbs.length; i++) {
        var $crumb = this.$breadcrumbs[i]; // Recolor each breadcrumb

        var color = "#000000";

        if (i == this.$breadcrumbs.length - 1) {
          color = "#FF0000";
        } else if (i == 0) {
          color = "#00FF00";
        }

        this.$breadcrumbs[i].css("border-color", color);
      }
    }
    /**
     * Gets an array of percentages representing the x and y percentages of each
     * point in the polygon.
     */

  }, {
    key: "GetJSON",
    value: function GetJSON() {
      // Extract the coordinates from the crumbs and put them in the array
      var points = [];

      var _iterator3 = _createForOfIteratorHelper(this.$breadcrumbs),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var crumb = _step3.value;
          var point = this.GetCenterPercentage(crumb);
          points.push([point.x.toString(), point.y.toString()]);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      return JSON.stringify(points);
    }
    /**
     * Gets an array of percentages representing the x and y percentages of each
     * point in the polygon.
     */

  }, {
    key: "GetPoints",
    value: function GetPoints() {
      var points = [];

      var _iterator4 = _createForOfIteratorHelper(this.$breadcrumbs),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var crumb = _step4.value;
          var point = this.GetCenterPercentage(crumb);
          points.push([point.x, point.y]);
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      return points;
    }
  }, {
    key: "BeginEditing",
    value: function BeginEditing() {
      this.$clickSurface.makeVisible(true);
      this.$editDialog.makeVisible(true);
      this.$poly.makeVisible(true); //-3//this.$bar.makeVisible(true);

      this.AddStartPolygon();
      this.UpdatePolyClipping();
    }
  }, {
    key: "Done",
    value: function Done() {
      this.$clickSurface.makeVisible(false);
      this.$editDialog.makeVisible(false);
      this.$poly.makeVisible(false); //-3//this.$bar.makeVisible(false);
    }
  }, {
    key: "ResizeOverlay",
    value: function ResizeOverlay() {
      // Resize video overlay to fit actual video dimensions
      var videoDims = this.annotator.player.GetVideoDimensions();
      this.$clickSurface.css('width', videoDims.width);
      this.$clickSurface.css('height', videoDims.height);
      var heightDiff = (this.annotator.player.$video.height() - videoDims.height) / 2;
      this.$clickSurface.css('top', heightDiff);
      var widthDiff = (this.annotator.player.$video.width() - videoDims.width) / 2;
      this.$clickSurface.css('left', widthDiff);
      this.$poly.width(videoDims.width);
      this.$poly.height(videoDims.height);
      this.$poly.css("top", heightDiff);
      this.$poly.css("left", widthDiff);
    }
  }, {
    key: "RegisterElement",
    value: function RegisterElement($element, $container, order) {
      var justification = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'flex-start';
      $element.css('order', order);
      $element.css('align-self', justification); // Sets grow [shrink] [basis]
      //$element.css('flex', '0 0 auto');

      $container.append($element);
    }
  }, {
    key: "ShowJustPolygon",
    value: function ShowJustPolygon() {
      this.$poly.makeVisible(true);
    }
  }, {
    key: "AddPolygonSet",
    value: function AddPolygonSet() {
      this.$polygons.push(this.GetPoints());
      this.$tempBreadCrumbs.push([this.$breadcrumbs]);
    }
  }]);

  return PolygonEditor;
}();

exports.PolygonEditor = PolygonEditor;

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PolygonOverlay = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PolygonOverlay = /*#__PURE__*/function () {
  function PolygonOverlay(annotator) {
    var _this = this;

    _classCallCheck(this, PolygonOverlay);

    this.annotator = annotator;
    this.polyElements = [];
    this.svgElements = [];
    this.animateElements = [];
    this.baseZ = 2147483649;
    this.lastAnnotations = [];
    this.svgElementsHash = {}; // Create the video overlay

    this.$videoOverlay = $("<div class='waldorf-video-overlay'></div>").appendTo(this.annotator.player.$container);
    this.ResizeOverlay();
    this.annotator.player.$container.on("OnFullscreenChange", function (event, setFullscreen) {
      return _this.ResizeOverlay();
    });
    this.annotator.$container.on("OnNewAnnotationSet", function (event, annotations) {
      return _this.Update(annotations);
    });
    this.videoDims = this.annotator.player.GetVideoDimensions();
    $(window).resize(function () {
      return _this.ResizeOverlay();
    });
  }

  _createClass(PolygonOverlay, [{
    key: "Update",
    value: function Update(annotations) {
      this.Clear(); // let prevSet = new Set(this.lastAnnotations);
      // let newSet = new Set(annotations);
      // // in newSet and not in prevSet
      // let toAdd = new Set(
      //     [...newSet].filter(x => !prevSet.has(x)));
      // // in prevAnnotations and not in annotations
      // let toDestroy = new Set(
      //     [...prevSet].filter(x => !newSet.has(x)));
      // console.log(Array.from(toAdd));
      // console.log(Array.from(toDestroy));
      //Sort polygon order by size (ascending)
      // polygons.sort(function(a, b) {
      //     return this.GetArea(a) > this.GetArea(b);
      // })

      for (var i = 0; i < annotations.length; i++) {
        var annotationPolyPoints = annotations[i].getPoly();

        if (annotationPolyPoints == null) {
          // Ignore this annotation if it has no polygon
          continue;
        }

        var svgPolyPoints = annotations[i].getSVGPolyPoints();
        var duration = annotations[i].endTime - annotations[i].beginTime; // Create the poly object

        var $svg = void 0;

        if (this.svgElements.length == 0) {
          $svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          $svg.setAttribute('width', '100%');
          $svg.setAttribute('height', '100%');
          $svg.setAttribute('viewBox', '0 0 100 100');
          $svg.setAttribute('preserveAspectRatio', 'none'); //$svg.addEventListener("click", this.ClickEvent);

          this.$videoOverlay.append($svg);
          this.svgElements.push($svg);
        } else {
          $svg = this.svgElements[0];
        }

        var $polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        $polygon.setAttribute('points', svgPolyPoints[0]);
        $polygon.setAttribute('fill', 'rgba(0, 118, 255, 0.55)');
        $svg.appendChild($polygon);
        var $animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        $animate.setAttribute('attributeName', 'points');
        $animate.setAttribute('fill', 'freeze');
        $animate.setAttribute('from', svgPolyPoints[0]);
        $animate.setAttribute('to', svgPolyPoints[1]);
        $animate.setAttribute('begin', 'indefinite');
        $animate.setAttribute('dur', duration + "s");
        $polygon.appendChild($animate);
        var $svgHash = {
          svgElement: $svg,
          polygon: $polygon,
          animate: $animate,
          beginTime: annotations[i].beginTime
        };
        this.svgElementsHash[annotations[i].id] = $svgHash; // Create the poly object
        // let $poly = $("<div class='waldorf-overlay-poly'></div>").appendTo(this.$videoOverlay);
        // $poly.clipPath(annotationPolyPoints, {
        //     isPercentage: true,
        //     svgDefId: 'annotatorPolySvg'
        // });
        // $poly.click(() => {
        //     this.annotator.$container.trigger("OnPolyClicked", annotations[i]);
        // });
        // this.AddTooltip($poly, annotations[i]);
        // this.polyElements.push($poly);

        this.polyElements.push($polygon);
        this.animateElements.push($animate);
      } //this.lastAnnotations = annotations;

    }
  }, {
    key: "ClickEvent",
    value: function ClickEvent(event) {
      console.log("animate is clicked");
    }
  }, {
    key: "AddTooltip",
    value: function AddTooltip($poly, annotation) {
      $.fn.qtip.zindex = this.baseZ + 1;
      $poly.qtip({
        content: {
          title: annotation.id,
          text: annotation.body.filter(function (item) {
            return item.purpose === "describing";
          })[0].value
        },
        position: {
          my: 'bottom right',
          at: 'top left',
          target: 'mouse',
          // Follow the mouse
          adjust: {
            mouse: true,
            method: "shift shift" // horizontal, vertical

          },
          viewport: this.annotator.player.$container
        },
        hide: {
          delay: 0 // No hide delay by default

        },
        style: {
          classes: 'qtip-dark qtip-rounded annotator-qtip'
        }
      });
    }
  }, {
    key: "Clear",
    value: function Clear() {
      // Clear all  animate element from the DOM
      for (var ai = 0; ai < this.animateElements.length; ai++) {
        //this.polyElements[i].data("qtip").destroy(true);
        this.animateElements[ai].remove();
      } // Clear all polygons 


      for (var pi = 0; pi < this.polyElements.length; pi++) {
        this.polyElements[pi].remove();
      } // Clear all  svg elements from the DOM


      for (var si = 0; si < this.svgElements.length; si++) {
        this.svgElements[si].remove();
      } // Mark the array as empty


      this.animateElements = [];
      this.polyElements = [];
      this.svgElements = [];
      this.svgElementsHash = {};
    }
  }, {
    key: "ResizeOverlay",
    value: function ResizeOverlay() {
      // Resize video overlay to fit actual video dimensions
      var videoDims = this.annotator.player.GetVideoDimensions();
      this.$videoOverlay.css('width', videoDims.width);
      this.$videoOverlay.css('height', videoDims.height);
      var heightDiff = (this.annotator.player.$video.height() - videoDims.height) / 2;
      this.$videoOverlay.css('top', heightDiff);
      var widthDiff = (this.annotator.player.$video.width() - videoDims.width) / 2;
      this.$videoOverlay.css('left', widthDiff);
    }
  }, {
    key: "getPlayerSize",
    value: function getPlayerSize() {
      return this.annotator.player.GetVideoDimensions();
    }
  }]);

  return PolygonOverlay;
}();

exports.PolygonOverlay = PolygonOverlay;

},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TickBar = void 0;

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TickBar = /*#__PURE__*/function () {
  function TickBar(annotator) {
    var _this = this;

    _classCallCheck(this, TickBar);

    this.annotator = annotator;
    this.ticks = []; // Create the element

    this.$tickBar = $("<div class='waldorf-tickbar'></div>");
    this.annotator.player.controlBar.$container.append(this.$tickBar); // Attach event handlers

    this.annotator.$container.on("OnAnnotationsLoaded", function (event, annotationManager) {
      return _this.LoadAnnotations(annotationManager);
    });
    this.annotator.$container.on("OnAnnotationRegistered", function (event, annotation) {
      return _this.LoadAnnotation(annotation);
    });
    this.annotator.$container.on("OnAnnotationRemoved", function (event, id) {
      return _this.RemoveAnnotation(id);
    });
  }

  _createClass(TickBar, [{
    key: "LoadAnnotations",
    value: function LoadAnnotations(annotationManager) {
      this.Clear();

      var _iterator = _createForOfIteratorHelper(annotationManager.annotations),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var annotation = _step.value;
          this.LoadAnnotation(annotation);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "LoadAnnotation",
    value: function LoadAnnotation(annotation) {
      var $tick = $("<div class='waldorf-tickbar-tick'></div>").appendTo(this.$tickBar); // Add the ID of the annotation to its corresponding tick so we can reference it later

      $tick.data("annotation-id", annotation.id);
      var beginTime = annotation.beginTime;
      var beginPercent = beginTime / this.annotator.player.videoElement.duration;
      $tick.css('left', (beginPercent * 100).toString() + "%");
      var endTime = annotation.endTime;
      var endPercent = endTime / this.annotator.player.videoElement.duration;
      $tick.css('width', ((endPercent - beginPercent) * 100).toString() + "%");
      this.ticks.push($tick);
    }
  }, {
    key: "RemoveAnnotation",
    value: function RemoveAnnotation(id) {
      //console.log("Removing tick " + id);
      // Remove the object from the document, and the array
      var newTicks = [];

      var _iterator2 = _createForOfIteratorHelper(this.ticks),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var $tick = _step2.value;

          if ($tick.data("annotation-id") == id) {
            console.log("Removed tick ".concat(id));
            $tick.remove();
          } else {
            newTicks.push($tick);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      this.ticks = newTicks;
    }
  }, {
    key: "Clear",
    value: function Clear() {
      var _iterator3 = _createForOfIteratorHelper(this.ticks),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var $tick = _step3.value;
          $tick.remove();
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      this.ticks = [];
    }
  }]);

  return TickBar;
}();

exports.TickBar = TickBar;

},{}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ServerInterface = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var sha1 = require('sha1');

var ServerInterface = /*#__PURE__*/function () {
  function ServerInterface(annotator) {
    _classCallCheck(this, ServerInterface);

    this.annotator = annotator; //localStorage.removeItem('waldorf_auth_token');
  }

  _createClass(ServerInterface, [{
    key: "SetBaseURL",
    value: function SetBaseURL(url) {
      this.baseURL = url;
    }
  }, {
    key: "make_base_auth",
    value: function make_base_auth(user, password) {
      var tok = user + ':' + password;
      var hash = btoa(tok);
      return 'Basic ' + hash;
    }
  }, {
    key: "make_write_auth",
    value: function make_write_auth(text) {
      if (this.annotator.apiKey) {
        return 'ApiKey ' + text;
      } else {
        return 'Token ' + text;
      }
    }
  }, {
    key: "LoggedIn",
    value: function LoggedIn() {
      if (this.annotator.apiKey) {
        // Return true if an email has been entered
        var user_email = localStorage.getItem('waldorf_user_email');
        return user_email !== null;
      } else {
        // Return true if a token has been registered
        var auth_token = localStorage.getItem('waldorf_auth_token');
        return auth_token !== null;
      }
    }
  }, {
    key: "LogIn",
    value: function LogIn(username, password) {
      var _this = this;

      // If API key is used, just store the email address
      if (this.annotator.apiKey) {
        console.log("[Server Interface] Successfully logged in.");
        localStorage.setItem('waldorf_user_email', password);
        localStorage.setItem('waldorf_user_name', username);
        this.annotator.messageOverlay.ShowMessage("Logged in as " + username);
        return $.Deferred().resolve();
      }

      return $.ajax({
        url: this.baseURL + "/api/login",
        type: "POST",
        async: true,
        context: this,
        beforeSend: function beforeSend(xhr) {
          xhr.setRequestHeader('Authorization', this.make_base_auth(username, password));
        }
      }).done(function (data) {
        console.log("[Server Interface] Successfully logged in.");
        localStorage.setItem('waldorf_auth_token', data.auth_token);
      }).fail(function (response) {
        console.error("[Server Interface] Could not log in.");

        _this.annotator.messageOverlay.ShowError("Could not log in!");
      });
    }
  }, {
    key: "LogOut",
    value: function LogOut() {
      // If API key is used, just remove the email from local storage.
      if (this.annotator.apiKey) {
        console.log("[Server Interface] Successfully logged out.");
        localStorage.removeItem('waldorf_user_email');
        localStorage.removeItem('waldorf_user_name');
        return $.Deferred().resolve();
      }

      return $.ajax({
        url: this.baseURL + "/api/logout",
        type: "DELETE",
        async: true,
        context: this,
        beforeSend: function beforeSend(xhr) {
          var auth_token = localStorage.getItem('waldorf_auth_token') || "";
          console.log("[Server Interface] token: ".concat(auth_token));
          xhr.setRequestHeader('Authorization', this.make_write_auth(auth_token));
        }
      }).done(function (data) {
        console.log("[Server Interface] Successfully logged out.");
        localStorage.removeItem('waldorf_auth_token');
      }).fail(function (response) {
        console.error("[Server Interface] Could not log out.");
        localStorage.removeItem('waldorf_auth_token');
      });
    }
  }, {
    key: "FetchAnnotations",
    value: function FetchAnnotations(searchKey, searchParam) {
      //This is replaced by this.baseURL, which is defined in config
      //var book_url = 'http://scalar.usc.edu/dev/semantic-annotation-tool/';  // This will be defined in the Book's JS
      //https://scalar.usc.edu/dev/semantic-annotation-tool/rdf/file/media/Inception%20Corgi%20Flop.mp4?format=oac&prov=1&rec=2
      var ajax_url = this.baseURL + 'rdf/file/' + searchParam.replace(this.baseURL, '') + '?format=oac&prov=1&rec=2'; //var ajax_url = this.baseURL + 'rdf/file/' + searchParam.replace(this.baseURL,'') + '?format=iiif&prov=1&rec=2';
      //console.log("ajax_url: " + ajax_url);

      return $.ajax({
        url: ajax_url,
        type: "GET",
        jsonp: "callback",
        dataType: "jsonp",
        async: true
      }).done(function (data) {
        console.log('[Server Interface] Fetched ' + data.length + ' annotations for ' + searchKey + ': "' + searchParam + '".');
      }).fail(function (response) {
        var returned_response = response.responseJSON.error.code[0].value + " : " + response.responseJSON.error.message[0].value;
        console.error('[Server Interface] Error fetching annotations for ' + searchKey + ': "' + searchParam + '"\n ' + returned_response);

        _this2.annotator.messageOverlay.ShowError('Could not retrieve annotations!<br>(' + returned_response + ')');
      });
    }
  }, {
    key: "PostAnnotation",
    value: function PostAnnotation(callback) {
      var _this3 = this;

      console.log("Posting annotation...");
      var annotation = this.annotator.gui.GetAnnotationObject(); // console.log(annotation);

      console.log("annotation: " + JSON.stringify(annotation));
      var key;

      if (this.annotator.apiKey) {
        key = this.annotator.apiKey;
        var email_storage = localStorage.getItem('waldorf_user_email');
        var name_storage = localStorage.getItem('waldorf_user_name');

        if (email_storage === null) {
          console.error("[Server Interface] You are not logged in!");
          this.annotator.messageOverlay.ShowError("You are not logged in!");
          return false;
        }

        if (name_storage == null) name_storage = email_storage;
      } else {
        key = localStorage.getItem('waldorf_auth_token');

        if (key === null) {
          console.error("[Server Interface] You are not logged in!");
          this.annotator.messageOverlay.ShowError("You are not logged in!");
          return false;
        }
      }

      if (this.annotator.apiKey) {
        if (annotation["creator"] == null) annotation["creator"] = {};
        annotation["creator"]["email"] = localStorage.getItem('waldorf_user_email');
        annotation["creator"]["nickname"] = localStorage.getItem('waldorf_user_name');
      } //setaction in annotation payload


      annotation["request"]["items"]["action"] = "add"; //TODO: ver2

      console.log("PostAnnotation payload: " + JSON.stringify(annotation));
      $.ajax({
        //url: this.baseURL + "/api/addAnnotation",
        url: this.baseURL + "api/add",
        type: "POST",
        dataType: 'json',
        // Necessary for Rails to see this data type correctly
        contentType: 'application/json',
        // Necessary for Rails to see this data type correctly
        data: JSON.stringify(annotation),
        // Stringify necessary for Rails to see this data type correctly
        async: true,
        context: this,
        beforeSend: function beforeSend(xhr) {
          xhr.setRequestHeader('Authorization', this.make_write_auth(key));
        },
        success: function success(data) {
          console.log("Successfully posted new annotation.");

          _this3.annotator.messageOverlay.ShowMessage("Successfully created new annotation.");

          annotation.id = data.id; // Append the ID given by the response

          if (callback) callback(annotation);
        },
        error: function error(response) {
          var returned_response = response.responseJSON.error.code[0].value + " : " + response.responseJSON.error.message[0].value;
          console.error("Could not post new annotation! Message:\n ".concat(returned_response));

          _this3.annotator.messageOverlay.ShowError("Could not post new annotation!<br>(".concat(returned_response, ")"));
        }
      });
    }
  }, {
    key: "EditAnnotation",
    value: function EditAnnotation(callback) {
      var _this4 = this;

      var annotation = this.annotator.gui.GetAnnotationObject();
      var key;

      if (this.annotator.apiKey) {
        key = this.annotator.apiKey;
        var email_storage = localStorage.getItem('waldorf_user_email');
        var name_storage = localStorage.getItem('waldorf_user_name');

        if (email_storage === null) {
          console.error("[Server Interface] You are not logged in!");
          this.annotator.messageOverlay.ShowError("You are not logged in!");
          return false;
        }

        if (name_storage == null) name_storage = email_storage;
      } else {
        key = localStorage.getItem('waldorf_auth_token');

        if (key === null) {
          console.error("[Server Interface] You are not logged in!");
          this.annotator.messageOverlay.ShowError("You are not logged in!");
          return false;
        }
      }

      if (this.annotator.apiKey) {
        if (annotation["creator"] == null) annotation["creator"] = {};
        annotation["creator"]["email"] = localStorage.getItem('waldorf_user_email');
        annotation["creator"]["nickname"] = localStorage.getItem('waldorf_user_name');
      }

      var oldID = annotation.id;
      console.log("Modifying annotation " + oldID);
      $.ajax({
        url: this.baseURL + "api/edit/",
        type: "POST",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(annotation),
        async: true,
        context: this,
        beforeSend: function beforeSend(xhr) {
          xhr.setRequestHeader('Authorization', this.make_write_auth(key));
        },
        success: function success(data) {
          //console.log(annotation);
          annotation.id = data.id; // Append the ID given by the response
          //console.log("Successfully edited the annotation. (ID is now " + data.id + ")");

          _this4.annotator.messageOverlay.ShowMessage("Successfully edited the anotation.");

          if (callback) callback(annotation, oldID);
        },
        error: function error(response) {
          //console.error(`Could not edit the annotation! Message:\n ${response.responseJSON.detail}`);
          //this.annotator.messageOverlay.ShowError(`Could not edit the annotation!<br>(${response.responseJSON.detail})`);
          var returned_response = "undefined error while editing the annotation";

          if (response.responseJSON) {
            returned_response = response.responseJSON.error.code[0].value + " : " + response.responseJSON.error.message[0].value;
          }

          console.error("Could not edit the annotation! Message:\n ".concat(returned_response));

          _this4.annotator.messageOverlay.ShowError("Could not edit the annotation!<br>(".concat(returned_response, ")"));
        }
      });
    }
  }, {
    key: "DeleteAnnotation",
    value: function DeleteAnnotation(annotation) {
      var _this5 = this;

      var key;

      if (this.annotator.apiKey) {
        key = this.annotator.apiKey;
        var email_storage = localStorage.getItem('waldorf_user_email');
        var name_storage = localStorage.getItem('waldorf_user_name');

        if (email_storage === null) {
          console.error("[Server Interface] You are not logged in!");
          this.annotator.messageOverlay.ShowError("You are not logged in!");
          return false;
        }

        if (name_storage == null) name_storage = email_storage;
      } else {
        key = localStorage.getItem('waldorf_auth_token');

        if (key === null) {
          console.error("[Server Interface] You are not logged in!");
          this.annotator.messageOverlay.ShowError("You are not logged in!");
          return false;
        }
      }

      if (this.annotator.apiKey) {
        if (annotation["creator"] == null) annotation["creator"] = {};
        annotation["creator"]["email"] = localStorage.getItem('waldorf_user_email');
        annotation["creator"]["nickname"] = localStorage.getItem('waldorf_user_name');
      }

      var del_url = this.baseURL + "api/delete";
      var del_data = {
        "scalar:urn": "urn:scalar:version:" + annotation.id,
        "native": "false",
        "action": "DELETE",
        "api_key": annotation.request.items.api_key,
        "id": annotation.request.items.id
      };
      return $.post(del_url, del_data, function (response) {
        {
          console.log("Delete error response");
          console.log(response);
          console.log(response.responseText);
        }
      }).done(function (response) {
        console.log("Successfully deleted the annotation.");

        _this5.annotator.messageOverlay.ShowMessage("Successfully deleted the annotation.");
      }).fail(function (response) {
        var returned_response = "undefined failure while deleting the annotation";

        if (response.responseJSON) {
          response.responseJSON.error.code[0].value + " : " + response.responseJSON.error.message[0].value;
        }

        console.error("Could not delete the annotation. Message:\n ".concat(returned_response));

        _this5.annotator.messageOverlay.ShowError("Could not delete the annotation!<br>(".concat(returned_response, ")"));
      });
    }
  }]);

  return ServerInterface;
}();

exports.ServerInterface = ServerInterface;

},{"sha1":34}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SessionManager = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var sha1 = require('sha1');
/**
 * Manages the user session for communicating with the backend.
 */


var SessionManager = /*#__PURE__*/function () {
  function SessionManager(annotator) {
    var _this = this;

    _classCallCheck(this, SessionManager);

    console.log("[Session Manager] Creating SessionManager...");
    this.annotator = annotator;
    this.modalOpen = false; // Inject the button for logging in/out into the toolbar

    if (!annotator.kioskMode && annotator.cmsEmail == '') {
      this.$userButton = $("<button>Session</button>").button({
        icon: "fa fa-user",
        showLabel: false
      }).click(function () {
        _this.PresentModal();
      });
      this.annotator.player.controlBar.RegisterElement(this.$userButton, 1, 'flex-end');
    } //this.$dialog.dialog("open");


    console.log("[Session Manager] SessionManager created.");
  }

  _createClass(SessionManager, [{
    key: "ShowLoginModal",
    value: function ShowLoginModal() {
      var _this2 = this;

      // Create the dialog
      var $container = $("<div class='waldorf-session-modal' title='Log In'></div>"); // Outermost HTML

      var $headText = $("<p class='validateTips'>All fields are required.</p>").appendTo($container);
      var $form = $("<form></form>").appendTo($container);
      var $nicknameField;
      var $usernameField;
      var $passwordField;

      if (this.annotator.apiKey) {
        $("<label for='username'>Name</label>").appendTo($form);
        $nicknameField = $("<input type='text' name='username' value='' class='text ui-widget-content ui-corner-all'>").appendTo($form);
        $("<label for='username'>Email Address</label>").appendTo($form);
        $usernameField = $("<input type='text' name='email' value='' class='text ui-widget-content ui-corner-all'>").appendTo($form);
      } else {
        $("<label for='username'>Username</label>").appendTo($form);
        $usernameField = $("<input type='text' name='username' value='' class='text ui-widget-content ui-corner-all'>").appendTo($form);
        $("<label for='password'>Password</label>").appendTo($form);
        $passwordField = $("<input type='password' name='password' value='' class='text ui-widget-content ui-corner-all'>").appendTo($form);
      }

      $form.wrapInner("<fieldset />");

      var login = function login() {
        if (_this2.annotator.apiKey) {
          var nickName = $nicknameField.val();
          var userName = sha1($usernameField.val());

          _this2.annotator.server.LogIn(nickName, userName).done(function () {
            console.log("API key login success");
            $dialog.dialog("close");
          }).fail(function () {
            $headText.html("<p>Invalid email address.</p>");
            $headText.css("color", "red");
          });
        } else {
          var userPass = sha1($passwordField.val());

          _this2.annotator.server.LogIn($usernameField.val(), userPass).done(function () {
            $dialog.dialog("close");
          }).fail(function () {
            $headText.html("<p>Invalid username or password.</p>");
            $headText.css("color", "red");
          });
        }
      };

      var $dialog = $container.dialog({
        autoOpen: true,
        draggable: false,
        modal: true,
        buttons: {
          "Log In": login,
          Cancel: function Cancel() {
            $dialog.dialog("close");
          }
        },
        close: function close() {
          $dialog.find("form")[0].reset();
          $dialog.find("input").removeClass("ui-state-error");

          _this2.OnModalClose();
        }
      });
    }
  }, {
    key: "ShowLogoutModal",
    value: function ShowLogoutModal() {
      var _this3 = this;

      var $container = $("<div title='Log Out'></div>");
      var $headText = $container.html("<p class='validateTips'>Are you sure you want to log out?</p>");
      var $dialog = $container.dialog({
        autoOpen: true,
        draggable: false,
        modal: true,
        buttons: {
          "Log Out": function LogOut() {
            _this3.annotator.server.LogOut().done(function () {
              $dialog.dialog("close");
            });
          },
          Cancel: function Cancel() {
            $dialog.dialog("close");
          }
        },
        close: function close() {
          _this3.OnModalClose();
        }
      });
    }
  }, {
    key: "PresentModal",
    value: function PresentModal() {
      // Early out if the modal is already open
      if (this.modalOpen) return; // Turn off fullscreen if it's on

      this.annotator.player.SetFullscreen(false);

      if (this.annotator.server.LoggedIn()) {
        this.ShowLogoutModal();
      } else {
        this.ShowLoginModal();
      }

      this.OnModalOpen();
    }
  }, {
    key: "OnModalOpen",
    value: function OnModalOpen() {
      this.$userButton.button("disable");
      this.modalOpen = true;
    }
  }, {
    key: "OnModalClose",
    value: function OnModalClose() {
      this.$userButton.button("enable");
      this.modalOpen = false;
    }
  }]);

  return SessionManager;
}();

exports.SessionManager = SessionManager;

},{"sha1":34}],14:[function(require,module,exports){
module.exports={
    "configFile": "annotator-config.json"
}
},{}],15:[function(require,module,exports){
"use strict";

require("./vendor.js");

require("./utils/array-extensions.js");

require("./utils/jquery-extensions.js");

require("./utils/string-extensions.js");

var _preferenceManager = require("./utils/preference-manager.js");

var _requirements = require("./utils/requirements.js");

var _videoPlayer = require("./video-player/video-player.js");

/*
Entry point for the whole project. Any jQuery extensions should
be registered here.
*/
// Import npm module dependencies
$.fn.annotate = function (args) {
  // let serverURL = args.serverURL || '';
  // let tagsURL = args.tagsURL || '';
  // let apiKey = args.apiKey || '';
  // let kioskMode = args.kioskMode || false;
  // let localURL = args.localURL || '';
  // let renderer = function(...) || false;
  // Error out early if "this" is not a video
  if ($(this).prop('tagName').toLowerCase() != "video") {
    console.error("Cannot wrap a non-video element!");
    return;
  }

  if (!(0, _requirements.VerifyRequirements)()) {
    return;
  } // preferences.GetJSON((data) => {
  //     //console.log(data);
  // });


  new _videoPlayer.AnnotatorVideoPlayer($(this), args);
};

},{"./utils/array-extensions.js":16,"./utils/jquery-extensions.js":17,"./utils/preference-manager.js":18,"./utils/requirements.js":19,"./utils/string-extensions.js":20,"./vendor.js":22,"./video-player/video-player.js":25}],16:[function(require,module,exports){
"use strict";

// From http://stackoverflow.com/a/14853974/7138792
// Warn if overriding existing method
if (Array.prototype.equals) console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, \
    there's a framework conflict or you've got double inclusions in your code."); // attach the .equals method to Array's prototype to call it on any array

Array.prototype.equals = function (array) {
  // if the other array is a falsy value, return
  if (!array) return false; // compare lengths - can save a lot of time 

  if (this.length != array.length) return false;

  for (var i = 0, l = this.length; i < l; i++) {
    // Check if we have nested arrays
    if (this[i] instanceof Array && array[i] instanceof Array) {
      // recurse into the nested arrays
      if (!this[i].equals(array[i])) return false;
    } else if (this[i] != array[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }

  return true;
}; // Hide method from for-in loops


Object.defineProperty(Array.prototype, "equals", {
  enumerable: false
});

},{}],17:[function(require,module,exports){
"use strict";

/**
 * Sets the visibility of the element while disabling interaction.
 * Doesn't mess with jQuery's positioning calculations like show()
 * and hide().
 */
$.fn.makeVisible = function (show) {
  if (show) {
    $(this).css({
      "visibility": "visible",
      "pointer-events": ""
    });
  } else {
    $(this).css({
      "visibility": "hidden",
      "pointer-events": "none"
    });
  }
};
/*
Copyright 2014 Mike Dunn
http://upshots.org/
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

https://github.com/moagrius/copycss

*/


$.fn.getStyles = function (only, except) {
  // the map to return with requested styles and values as KVP
  var product = {}; // the style object from the DOM element we need to iterate through

  var style; // recycle the name of the style attribute

  var name; // if it's a limited list, no need to run through the entire style object

  if (only && only instanceof Array) {
    for (var i = 0, l = only.length; i < l; i++) {
      // since we have the name already, just return via built-in .css method
      name = only[i];
      product[name] = this.css(name);
    }
  } else {
    // prevent from empty selector
    if (this.length) {
      // otherwise, we need to get everything
      var dom = this.get(0); // standards

      if (window.getComputedStyle) {
        // convenience methods to turn css case ('background-image') to camel ('backgroundImage')
        var pattern = /\-([a-z])/g;

        var uc = function uc(a, b) {
          return b.toUpperCase();
        };

        var camelize = function camelize(string) {
          return string.replace(pattern, uc);
        }; // make sure we're getting a good reference


        if (style = window.getComputedStyle(dom, null)) {
          var camel, value; // opera doesn't give back style.length - use truthy since a 0 length may as well be skipped anyways

          if (style.length) {
            for (var i = 0, l = style.length; i < l; i++) {
              name = style[i];
              camel = camelize(name);
              value = style.getPropertyValue(name);
              product[camel] = value;
            }
          } else {
            // opera
            for (name in style) {
              camel = camelize(name);
              value = style.getPropertyValue(name) || style[name];
              product[camel] = value;
            }
          }
        }
      } // IE - first try currentStyle, then normal style object - don't bother with runtimeStyle
      else if (style = dom.currentStyle) {
          for (name in style) {
            product[name] = style[name];
          }
        } else if (style = dom.style) {
          for (name in style) {
            if (typeof style[name] != 'function') {
              product[name] = style[name];
            }
          }
        }
    }
  } // remove any styles specified...
  // be careful on blacklist - sometimes vendor-specific values aren't obvious but will be visible...  e.g., excepting 'color' will still let '-webkit-text-fill-color' through, which will in fact color the text


  if (except && except instanceof Array) {
    for (var i = 0, l = except.length; i < l; i++) {
      name = except[i];
      delete product[name];
    }
  } // one way out so we can process blacklist in one spot


  return product;
}; // sugar - source is the selector, dom element or jQuery instance to copy from - only and except are optional


$.fn.copyCSS = function (source, only, except) {
  var styles = source.getStyles(only, except);
  this.css(styles);
  return this;
};

},{}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.preferences = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Bring in build config options
var metaconfig = require("../config.json");

var PreferenceManager = /*#__PURE__*/function () {
  function PreferenceManager() {
    _classCallCheck(this, PreferenceManager);
  }

  _createClass(PreferenceManager, [{
    key: "GetJSON",
    value: function GetJSON(callback) {
      var _this = this;

      //let loc = window.location.pathname;
      //let dir = loc.substring(0, loc.lastIndexOf('/'));
      var dir = "./dist/"; //console.log(dir + metaconfig.configFile);

      if (this.cachedJSON != null) {
        callback(this.cached);
      } else {
        $.ajax({
          dataType: "json",
          url: dir + metaconfig.configFile,
          success: function success(data) {
            _this.cachedJSON = data;
            callback(_this.cachedJSON);
          }
        });
      }
    }
  }]);

  return PreferenceManager;
}();

var preferences = new PreferenceManager();
exports.preferences = preferences;

},{"../config.json":14}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VerifyRequirements = VerifyRequirements;

/**
 * Returns false if running on an unsupported platform or missing jQuery, otherwise true.
 * 
 */
function VerifyRequirements() {
  // Stop running if we're on an unsupported platform (mobile for now)
  // if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  //     console.error("Platform is unsupported!");
  //     //let unsupportedDiv = document.createElement("div");
  //     //unsupportedDiv.appendChild(document.createTextNode("Your platform is unsupported!"));
  //     //document.body.appendChild(unsupportedDiv);
  //     return false;
  // }
  // Check if we don't have jQuery loaded
  if (!window.jQuery) {
    console.error("JQuery must be present!"); //let unsupportedDiv = document.createElement("div");
    //unsupportedDiv.appendChild(document.createTextNode("Your platform is unsupported!"));
    //document.body.appendChild(unsupportedDiv);

    return false;
  }

  return true;
}

},{}],20:[function(require,module,exports){
"use strict";

/**
 * Escapes the string so it can embed directly in an HTML document.
 */
// http://stackoverflow.com/a/12034334
Object.defineProperty(String.prototype, 'escapeHTML', {
  value: function value() {
    var entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };
    return String(this).replace(/[&<>"'`=\/]/g, function (s) {
      return entityMap[s];
    });
  }
});

},{}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetFormattedTime = GetFormattedTime;
exports.GetSecondsFromHMS = GetSecondsFromHMS;

// http://stackoverflow.com/a/34841026
function GetFormattedTime(timeInSeconds) {
  if (isNaN(timeInSeconds)) return 0;
  var time = timeInSeconds | 0; //Truncate to integer

  var hours = Math.floor(time / 3600) % 24;
  var minutes = Math.floor(time / 60) % 60;
  var seconds = time % 60;
  var formatted = [hours, minutes, seconds].map(function (v) {
    return v < 10 ? "0" + v : v;
  }).filter(function (v, i) {
    return v !== "00" || i > 0;
  }).join(":");

  if (formatted.charAt(0) == "0") {
    formatted = formatted.substr(1);
  }

  var ms = (timeInSeconds % 1).toFixed(2);
  formatted += ms.toString().substr(1);
  return formatted;
} // From http://stackoverflow.com/a/9640417/7138792


function GetSecondsFromHMS(hms) {
  var parts = hms.split('.');
  var ms = "0";
  if (parts.length > 1) ms = '.' + parts[1];
  var p = parts[0].split(':'),
      s = 0,
      m = 1;

  while (p.length > 0) {
    s += m * parseInt(p.pop(), 10);
    m *= 60;
  }

  s += parseFloat(ms);
  return s;
}

},{}],22:[function(require,module,exports){
"use strict";

require("qtip2");

require("clip-path-polygon");

},{"clip-path-polygon":29,"qtip2":32}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SeekbarTooltip = void 0;

var _time = require("../utils/time.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SeekbarTooltip = /*#__PURE__*/function () {
  function SeekbarTooltip($parent, player) {
    var _this = this;

    _classCallCheck(this, SeekbarTooltip);

    this.$parent = $parent;
    this.player = player;
    this.$tooltip = $("<div class='waldorf-seekbar-tooltip'></div>").appendTo($parent);
    this.text = "Test";
    this.$content = $("<p>" + this.text + "</p>").appendTo(this.$tooltip);
    this.hoverOffset = -10;
    this.padding = 5;
    this.Hide();
    this.$parent.mousemove(function (event) {
      _this.Show(); //Add and update tooltip on mouse movement to show where the mouse is hovering.


      var mouseX = event.pageX - player.$container.offset().left;

      var percent = mouseX / _this.$parent.width();

      var timeAtCursor = percent * player.videoElement.duration;

      _this.Move(mouseX, 0);

      _this.SetContent((0, _time.GetFormattedTime)(timeAtCursor));
    });
    this.$parent.mouseout(function () {
      _this.Hide();
    });
  }

  _createClass(SeekbarTooltip, [{
    key: "Move",
    value: function Move(x, y) {
      // Get initial positions
      var left = x - this.GetWidth() / 2;
      var top = y - this.GetHeight() + this.hoverOffset; // Offset if necessary (keep on-screen)

      if (left - this.padding < 0) {
        left = this.padding;
      }

      if (left + this.padding + this.GetWidth() > this.$parent.width()) {
        left = this.$parent.width() - this.GetWidth() - this.padding;
      } // Apply positions


      this.$tooltip.css({
        top: top,
        left: left
      });
    }
  }, {
    key: "GetWidth",
    value: function GetWidth() {
      return this.$tooltip.width();
    }
  }, {
    key: "GetHeight",
    value: function GetHeight() {
      return this.$tooltip.height();
    }
  }, {
    key: "Show",
    value: function Show() {
      this.$tooltip.makeVisible(true);
    }
  }, {
    key: "Hide",
    value: function Hide() {
      this.$tooltip.makeVisible(false);
    }
  }, {
    key: "SetContent",
    value: function SetContent(text) {
      //console.log(text);
      this.$content.text(text);
    }
  }]);

  return SeekbarTooltip;
}();

exports.SeekbarTooltip = SeekbarTooltip;

},{"../utils/time.js":21}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VideoPlayerBar = void 0;

var _time = require("../utils/time.js");

var _seekbarTooltip = require("./seekbar-tooltip.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var VideoPlayerBar = /*#__PURE__*/function () {
  function VideoPlayerBar(player) {
    var _this = this;

    _classCallCheck(this, VideoPlayerBar);

    this.player = player;
    this.$container = $("<div class='waldorf-player-toolbar flex-toolbar'></div>").appendTo(player.$container);
    this.PopulateElements();
    this.scrubbingTimeSlider = false;
    this.videoPlayingBeforeTimeScrub = false; // Hook up to events from video player

    this.player.$container.on("OnVisibilityChange", function (event, isVisible, duration) {
      return _this.SetVisible(isVisible, duration);
    });
    this.player.$container.on("OnPlayStateChange", function (event, playing) {
      return _this.OnPlayStateChange(playing);
    });
    this.player.$container.on("OnTimeUpdate", function (event, time) {
      return _this.OnTimeUpdate(time);
    });
    this.player.$container.on("OnMuteStateChange", function (event, muted) {
      return _this.OnMuteStateChange(muted);
    });
    this.player.$container.on("OnVolumeChange", function (event, volume) {
      return _this.OnVolumeChange(volume);
    });
  }

  _createClass(VideoPlayerBar, [{
    key: "PopulateElements",
    value: function PopulateElements() {
      var _this2 = this;

      this.$seekBar = $("<div id='seek-bar'><div id='seek-handle' class='ui-slider-handle'></div></div>");
      var $seekSlider = this.$seekBar.slider({
        min: 0.0,
        max: 1.0,
        step: 0.001
      });
      $seekSlider.on("slide", function () {
        return _this2.UpdateVideoTime();
      });
      $seekSlider.on("slidestart", function () {
        return _this2.TimeDragStarted();
      });
      $seekSlider.on("slidestop", function () {
        _this2.TimeDragFinished();

        _this2.UpdateVideoTime();
      });
      this.$container.append(this.$seekBar);
      this.seekbarTooltip = new _seekbarTooltip.SeekbarTooltip(this.$seekBar, this.player);
      this.$seekProgress = $("<div id='seek-fill'></div>");
      this.$container.append(this.$seekProgress); //Jump Back button

      this.$jumpBackButton = $("<button>Jump Back</button>").button({
        icon: "fa fa-fast-backward",
        showLabel: false
      }).click(function () {
        return _this2.player.JumpBackward();
      });
      this.RegisterElement(this.$jumpBackButton, -8); //Nudge Back button

      this.$nudgeBackButton = $("<button>Nudge Back</button>").button({
        icon: "fa fa-step-backward",
        showLabel: false
      }).click(function () {
        return _this2.player.StepBackward();
      });
      this.RegisterElement(this.$nudgeBackButton, -7); // Play button

      this.$playButton = $("<button>Play</button>").button({
        icon: "fa fa-play",
        showLabel: false
      }).click(function () {
        return _this2.player.TogglePlayState();
      });
      this.RegisterElement(this.$playButton, -6); //Nudge button

      this.$nudgeButton = $("<button>Nudge</button>").button({
        icon: "fa fa-step-forward",
        showLabel: false
      }).click(function () {
        return _this2.player.StepForward();
      });
      this.RegisterElement(this.$nudgeButton, -5); //Jump button

      this.$jumpButton = $("<button>Nudge</button>").button({
        icon: "fa fa-fast-forward",
        showLabel: false
      }).click(function () {
        return _this2.player.JumpForward();
      });
      this.RegisterElement(this.$jumpButton, -4); // Time text

      var zero = (0, _time.GetFormattedTime)(0.000);
      this.$timeText = $("<p>${zero}/${zero}</p>");
      this.RegisterElement(this.$timeText, -3); // Mute button

      this.$muteButton = $("<button>Mute</button>").button({
        icon: "fa fa-volume-up",
        showLabel: false
      }).click(function () {
        return _this2.player.ToggleMuteState();
      });
      this.RegisterElement(this.$muteButton, -2); // Volume bar

      this.$volumeBar = $("<div id='volume-bar'><div id='volume-handle' class='ui-slider-handle'></div></div>");
      this.$volumeBar.slider({
        range: "min",
        max: 1.0,
        value: 1.0,
        step: 0.05
      }).on("slide", function (event, ui) {
        return _this2.player.SetVolume(ui.value);
      });
      this.RegisterElement(this.$volumeBar, -1); // Fullscreen button

      this.$fullScreenButton = $("<button>Fullscreen</button>").button({
        icon: "fa fa-arrows-alt",
        showLabel: false
      }).click(function () {
        return _this2.player.ToggleFullscreen();
      });
      this.RegisterElement(this.$fullScreenButton, 999, 'flex-end'); // Create empty element between left floating and right floating toolbar items to space them out properly

      this.$container.append($("<div></div>").css("flex-grow", 1).css("order", 0)); //Initialize controls

      this.OnTimeUpdate();
      this.$volumeBar.slider("value", this.player.videoElement.volume);
    }
  }, {
    key: "RegisterElement",
    value: function RegisterElement($element, order) {
      var justification = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'flex-start';
      $element.css('order', order);
      $element.css('align-self', justification); // Sets grow [shrink] [basis]
      //$element.css('flex', '0 0 auto');

      this.$container.append($element);
    }
  }, {
    key: "SetVisible",
    value: function SetVisible(isVisible, duration) {
      var _this3 = this;

      //console.log('[SetVisible] ' + isVisible + " " + duration);
      this.$container.stop(true, true);

      if (isVisible) {
        this.$container.fadeTo(duration, 1.0, function () {
          _this3.$container.makeVisible(true);
        });
      } else {
        this.$container.fadeTo(duration, 0.0, function () {
          _this3.$container.makeVisible(false);
        });
      }
    }
  }, {
    key: "UpdateVideoTime",
    value: function UpdateVideoTime() {
      // Calculate the new time
      var time = this.player.videoElement.duration * this.$seekBar.slider("value");
      this.player.endTime = false;
      this.player.videoElement.currentTime = time;
    }
  }, {
    key: "TimeDragStarted",
    value: function TimeDragStarted() {
      this.videoPlayingBeforeTimeScrub = !this.player.videoElement.paused;
      this.player.videoElement.pause();
    }
  }, {
    key: "TimeDragFinished",
    value: function TimeDragFinished() {
      // Start playing the video again if it was playing before the scrub started
      if (this.videoPlayingBeforeTimeScrub) {
        this.player.videoElement.play();
      }
    } ///
    /// ----- Event Listeners -----
    /// The following update the visual state of the bar
    /// upon changes to the video player. These are hooked
    /// up in the constructor.
    ///

  }, {
    key: "OnPlayStateChange",
    value: function OnPlayStateChange(playing) {
      this.$playButton.button("option", {
        icon: playing ? "fa fa-pause" : "fa fa-play"
      });
    }
  }, {
    key: "OnTimeUpdate",
    value: function OnTimeUpdate(time) {
      //console.log("video-player-bar.js:185 OnTimeUpdate is called");
      var duration = this.player.videoElement.duration; // Update the time text

      this.$timeText.text((0, _time.GetFormattedTime)(time) + "/" + (0, _time.GetFormattedTime)(duration));
      var progress = time / duration;
      this.$seekProgress.width((progress * 100).toString() + "%");
    }
  }, {
    key: "OnVolumeChange",
    value: function OnVolumeChange(volume) {
      this.$volumeBar.slider("value", volume);
    }
  }, {
    key: "OnMuteStateChange",
    value: function OnMuteStateChange(muted) {
      this.$muteButton.button("option", {
        icon: muted ? "fa fa-volume-up" : "fa fa-volume-off"
      });
    }
  }]);

  return VideoPlayerBar;
}();

exports.VideoPlayerBar = VideoPlayerBar;

},{"../utils/time.js":21,"./seekbar-tooltip.js":23}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnnotatorVideoPlayer = void 0;

var _videoPlayerBar = require("./video-player-bar.js");

var _annotator = require("../annotator/annotator.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

//import * as screenfull from "screenfull";
//import 'jquery-ui/dist/jquery-ui.js';
var screenfull = require('screenfull');

var AnnotatorVideoPlayer = /*#__PURE__*/function () {
  function AnnotatorVideoPlayer($video, annotatorArgs) {
    var _this = this;

    _classCallCheck(this, AnnotatorVideoPlayer);

    console.log("[AnnotatorVideoPlayer] Creating AnnotatorVideoPlayer for video...");
    this.$video = $video;
    this.videoElement = this.$video.get(0); // Store the original styling of the video element before we alter it

    this.originalStyles = this.$video.getStyles(null, ["height", "WebkitTextFillColor", "color"]); //["width", "top", "left", "margin", "padding"]

    this.Wrap();
    this.PopulateControls();
    this.SetVisible(true); // Hook up events

    this.HookUpEvents(); // Play / pause the video when clicked.

    this.$video.on("click", function () {
      return _this.TogglePlayState();
    });
    this.allowAutoFade = true; /// Inactivity timer for the mouse.

    this.mouseTimer = null; /// Set to true if the time slider is currently being dragged by the user.

    this.draggingTimeSlider = false; /// Seconds before the UI fades due to mouse inactivity.

    this.idleSecondsBeforeFade = 3;
    this.fadeDuration = 300;
    this.endTime = false;
    this.$container.mousemove(function () {
      return _this.OnMouseMove();
    });
    this.SetAutoFade(true); // If screenfull is enabled, create the event to handle it.

    if (screenfull !== 'undefined') {
      screenfull.onchange(function () {
        _this.OnFullscreenChange();

        _this.$container.trigger("OnFullscreenChange");
      });
    }

    this.videoElement.ontimeupdate = function () {
      _this.OnTimeUpdate(_this.videoElement.currentTime);
    };

    this.$container.on("OnVideoReady", function () {
      if (annotatorArgs.annotator == null) {
        console.log("[AnnotatorVideoPlayer] Player sent OnVideoReady, attempting to wrap with annotator..."); // Add annotator once video has loaded

        console.log("[AnnotatorVideoPlayer] Wrapping video with annotator...");
        annotatorArgs.player = _this;
        annotatorArgs.annotator = new _annotator.VideoAnnotator(annotatorArgs);
        if (typeof annotatorArgs.callback == "function") annotatorArgs.callback(annotatorArgs.annotator);
      }
    });

    this.videoElement.onloadedmetadata = function () {
      _this.$container.trigger("OnVideoReady");
    };

    if (this.videoElement.duration != null) {
      // If the metadata is already prepared, throw the event since
      // onloadedmetadata won't be fired
      this.$container.trigger("OnVideoReady");
    }

    console.log("[AnnotatorVideoPlayer] AnnotatorVideoPlayer created for video.");
  }

  _createClass(AnnotatorVideoPlayer, [{
    key: "Wrap",
    value: function Wrap() {
      // Remove the default controls from the video
      this.videoElement.removeAttribute("controls"); // Wrap the video element with the container

      this.$container = this.$video.wrap("<div class='waldorf-video-player'></div>").parent(); // Resize container to fit the dimensions of the video

      this.$container.width(this.$video.width());
      this.$container.height(this.$video.height());
    }
  }, {
    key: "PopulateControls",
    value: function PopulateControls() {
      this.controlBar = new _videoPlayerBar.VideoPlayerBar(this);
    }
  }, {
    key: "SetVisible",
    value: function SetVisible(isVisible) {
      var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      this.$container.trigger("OnVisibilityChange", [isVisible, duration]);
    }
  }, {
    key: "HookUpEvents",
    value: function HookUpEvents() {}
  }, {
    key: "TogglePlayState",
    value: function TogglePlayState() {
      if (this.videoElement.paused) {
        this.Play();
      } else {
        this.Pause();
      }
    }
  }, {
    key: "StepForward",
    value: function StepForward() {
      var newTime = this.videoElement.currentTime + 0.1;
      this.videoElement.currentTime = newTime > this.videoElement.duration ? this.videoElement.duration : newTime;
    }
  }, {
    key: "JumpForward",
    value: function JumpForward() {
      var newTime = this.videoElement.currentTime + 1;
      this.videoElement.currentTime = newTime > this.videoElement.duration ? this.videoElement.duration : newTime;
    }
  }, {
    key: "StepBackward",
    value: function StepBackward() {
      var newTime = this.videoElement.currentTime - 0.1;
      this.videoElement.currentTime = newTime < 0 ? 0 : newTime;
    }
  }, {
    key: "JumpBackward",
    value: function JumpBackward() {
      var newTime = this.videoElement.currentTime - 1;
      this.videoElement.currentTime = newTime < 0 ? 0 : newTime;
    }
  }, {
    key: "Play",
    value: function Play() {
      this.videoElement.play();
      if (this.endTime) this.endTime = false;
      this.SetAutoFade(true);
      this.$container.trigger("OnPlayStateChange", !this.videoElement.paused);
    }
  }, {
    key: "Pause",
    value: function Pause() {
      if (this.endTime) this.endTime = false;
      this.videoElement.pause();
      this.SetAutoFade(false);
      this.$container.trigger("OnPlayStateChange", !this.videoElement.paused);
    }
  }, {
    key: "ToggleMuteState",
    value: function ToggleMuteState() {
      var muted = this.videoElement.muted;
      this.videoElement.muted = !muted;
      this.$container.trigger("OnMuteStateChange", muted);
    }
  }, {
    key: "SetVolume",
    value: function SetVolume(volume) {
      this.videoElement.volume = volume;
      this.$container.trigger("OnVolumeChange", volume);
    }
  }, {
    key: "ToggleFullscreen",
    value: function ToggleFullscreen() {
      if (screenfull === 'undefined' || !screenfull.enabled) {
        return;
      }

      screenfull.toggle(this.$container[0]);
    }
  }, {
    key: "OnFullscreenChange",
    value: function OnFullscreenChange() {
      if (screenfull.isFullscreen) {
        this.$container.addClass("waldorf-fullscreen");
      } else {
        this.$container.removeClass("waldorf-fullscreen");
      }
    }
  }, {
    key: "SetFullscreen",
    value: function SetFullscreen(fullscreen) {
      if (screenfull === 'undefined' || !screenfull.enabled) {
        return;
      }

      if (fullscreen) {
        screenfull.request(this.$container[0]);
      } else {
        screenfull.exit();
      }
    }
    /**
     * Called when the mouse moves in the video container.
     */

  }, {
    key: "OnMouseMove",
    value: function OnMouseMove() {
      // Reset the timer
      clearTimeout(this.mouseTimer);
      this.mouseTimer = 0; // Restart fading if allowed to

      if (this.allowAutoFade) {
        this.RestartFading();
      }
    }
  }, {
    key: "OnTimeUpdate",
    value: function OnTimeUpdate(time) {
      if (this.endTime && this.endTime <= this.videoElement.currentTime) {
        this.Pause();
        this.endTime = false;
      }

      this.$container.trigger("OnTimeUpdate", time);
    }
  }, {
    key: "RestartFading",
    value: function RestartFading() {
      var _this2 = this;

      // Restore visibility
      this.SetVisible(true, this.fadeDuration); // Start the timer over again

      this.mouseTimer = setTimeout(function () {
        _this2.SetVisible(false, _this2.fadeDuration);
      }, this.idleSecondsBeforeFade * 1000);
    }
  }, {
    key: "SetAutoFade",
    value: function SetAutoFade(allow) {
      this.allowAutoFade = allow; // Reset the mouse timer

      clearTimeout(this.mouseTimer);
      this.mouseTimer = 0; // Make elements visible

      this.SetVisible(true); // Restart the fading behavior if desired

      if (allow) {
        this.RestartFading();
      }
    } // IsPlaying(){
    //     // http://stackoverflow.com/a/31133401
    //     return !!(this.videoElement.currentTime > 0 && !this.videoElement.paused && 
    //               !this.videoElement.ended && this.videoElement.readyState > 2);
    // }
    // From https://gist.github.com/Nateowami/7a947e93f09c45a1097e783dc00560e1

  }, {
    key: "GetVideoDimensions",
    value: function GetVideoDimensions() {
      var video = this.videoElement; // Ratio of the video's intrisic dimensions

      var videoRatio = video.videoWidth / video.videoHeight; // The width and height of the video element

      var width = video.offsetWidth;
      var height = video.offsetHeight; // The ratio of the element's width to its height

      var elementRatio = width / height; // If the video element is short and wide

      if (elementRatio > videoRatio) width = height * videoRatio; // It must be tall and thin, or exactly equal to the original ratio
      else height = width / videoRatio;
      return {
        width: width,
        height: height
      };
    }
  }]);

  return AnnotatorVideoPlayer;
}();

exports.AnnotatorVideoPlayer = AnnotatorVideoPlayer;

},{"../annotator/annotator.js":4,"./video-player-bar.js":24,"screenfull":33}],26:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],27:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this,require("buffer").Buffer)

},{"base64-js":26,"buffer":27,"ieee754":31}],28:[function(require,module,exports){
var charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
    }
  },

  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      for (var bytes = [], i = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      for (var str = [], i = 0; i < bytes.length; i++)
        str.push(String.fromCharCode(bytes[i]));
      return str.join('');
    }
  }
};

module.exports = charenc;

},{}],29:[function(require,module,exports){
/*!
 * jQuery clip-path-polygon Plugin v0.1.14 (2019-11-16)
 * jQuery plugin that makes easy to use clip-path on whatever tag under different browsers
 * https://github.com/andrusieczko/clip-path-polygon
 * 
 * Copyright 2019 Karol Andrusieczko
 * Released under MIT license
 */

var globalVariable = window || root;
var jQuery = jQuery || globalVariable.jQuery || require("jquery");

(function($) {
  var id = 0;

  var ClipPath = function(jQuery, $el, points, options) {
    this.$ = jQuery;
    this.$el = $el;
    this.points = points;
    this.svgDefId = 'clipPathPolygonGenId' + id++;

    this.processOptions(options);
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = ClipPath;
    }
    exports.ClipPath = ClipPath;
  } else {
    globalVariable.ClipPath = ClipPath;
  }

  ClipPath.prototype = {

    $: null,
    $el: null,
    points: null,

    isForWebkit: true,
    isForSvg: true,
    svgDefId: null,
    isPercentage: false,

    create: function() {
      this._createClipPath(this.points);
    },

    _createClipPath: function(points) {
      this._createSvgDefs();
      if (this.isForSvg) {
        this._createSvgBasedClipPath(points);
      }
      if (this.isForWebkit) {
        this._createWebkitClipPath(points);
      }
    },

    _createWebkitClipPath: function(points) {
      var clipPath = "polygon(" + this._translatePoints(points, true, this.isPercentage) + ")";
      this.$el.css('-webkit-clip-path', clipPath);
    },

    _createSvgBasedClipPath: function(points) {
      this.$('#' + this.svgDefId + '').find('polygon').attr('points', this._translatePoints(points, false, this.isPercentage));
      this.$el.css('clip-path', 'url(#' + this.svgDefId + ')');
    },


    _translatePoints: function(points, withUnit, isPercentage) {
      var result = [];
      for (var i in points) {
        var x = this._handlePxs(points[i][0], withUnit, isPercentage);
        var y = this._handlePxs(points[i][1], withUnit, isPercentage);
        result.push(x + ' ' + y);
      }
      return result.join(', ');
    },

    _handlePxs: function(number, withUnit, isPercentage) {
      if (number === 0) {
        return number;
      }
      if (!withUnit) {
        if (isPercentage) {
          return number / 100;
        }
        return number;
      }

      return number + (isPercentage ? "%" : "px");
    },

    _createSvgElement: function(elementName) {
      return this.$(document.createElementNS('http://www.w3.org/2000/svg', elementName));
    },

    _createSvgDefs: function() {
      if (this.$('#' + this.svgDefId + '').length === 0) {
        var $svg = this._createSvgElement('svg').attr('width', 0).attr('height', 0).css({
          'position': 'absolute',
          'visibility': 'hidden',
          'width': 0,
          'height': 0
        });
        var $defs = this._createSvgElement('defs');
        $svg.append($defs);
        var $clippath = this._createSvgElement('clipPath').attr('id', this.svgDefId);
        if (this.isPercentage) {
          $clippath.get(0).setAttribute('clipPathUnits', 'objectBoundingBox');
        }
        $defs.append($clippath);
        var $polygon = this._createSvgElement('polygon');
        $clippath.append($polygon);
        this.$('body').append($svg);
      }
    },

    processOptions: function(options) {
      this.isForWebkit = (options && typeof(options.isForWebkit) !== "undefined") ? options.isForWebkit : this.isForWebkit;
      this.isForSvg = (options && typeof(options.isForSvg) !== "undefined") ? options.isForSvg : this.isForSvg;
      this.isPercentage = (options && options.isPercentage || this.isPercentage);
      this.svgDefId = (options && options.svgDefId) || this.svgDefId;
    }
  };
  
  $.fn.clipPath = function(points, options) {
    return this.each(function() {
      var $el = $(this);
      var clipPath = new ClipPath($, $el, points, options);
      clipPath.create();
    });
  };

}).call(this, jQuery);

},{"jquery":undefined}],30:[function(require,module,exports){
(function() {
  var base64map
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  crypt = {
    // Bit-wise rotation left
    rotl: function(n, b) {
      return (n << b) | (n >>> (32 - b));
    },

    // Bit-wise rotation right
    rotr: function(n, b) {
      return (n << (32 - b)) | (n >>> b);
    },

    // Swap big-endian to little-endian and vice versa
    endian: function(n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      }

      // Else, assume array and swap all items
      for (var i = 0; i < n.length; i++)
        n[i] = crypt.endian(n[i]);
      return n;
    },

    // Generate an array of any length of random bytes
    randomBytes: function(n) {
      for (var bytes = []; n > 0; n--)
        bytes.push(Math.floor(Math.random() * 256));
      return bytes;
    },

    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function(bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
      return words;
    },

    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function(words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8)
        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex: function(bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }
      return hex.join('');
    },

    // Convert a hex string to a byte array
    hexToBytes: function(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    },

    // Convert a byte array to a base-64 string
    bytesToBase64: function(bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        for (var j = 0; j < 4; j++)
          if (i * 8 + j * 6 <= bytes.length * 8)
            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
          else
            base64.push('=');
      }
      return base64.join('');
    },

    // Convert a base-64 string to a byte array
    base64ToBytes: function(base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
          imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push(((base64map.indexOf(base64.charAt(i - 1))
            & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
            | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
      }
      return bytes;
    }
  };

  module.exports = crypt;
})();

},{}],31:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],32:[function(require,module,exports){
/*
 * qTip2 - Pretty powerful tooltips - v3.0.3
 * http://qtip2.com
 *
 * Copyright (c) 2016 
 * Released under the MIT licenses
 * http://jquery.org/license
 *
 * Date: Wed May 11 2016 10:31 GMT+0100+0100
 * Plugins: tips modal viewport svg imagemap ie6
 * Styles: core basic css3
 */
/*global window: false, jQuery: false, console: false, define: false */

/* Cache window, document, undefined */
(function( window, document, undefined ) {

// Uses AMD or browser globals to create a jQuery plugin.
(function( factory ) {
	"use strict";
	if(typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	}
	else if(jQuery && !jQuery.fn.qtip) {
		factory(jQuery);
	}
}
(function($) {
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
;// Munge the primitives - Paul Irish tip
var TRUE = true,
FALSE = false,
NULL = null,

// Common variables
X = 'x', Y = 'y',
WIDTH = 'width',
HEIGHT = 'height',

// Positioning sides
TOP = 'top',
LEFT = 'left',
BOTTOM = 'bottom',
RIGHT = 'right',
CENTER = 'center',

// Position adjustment types
FLIP = 'flip',
FLIPINVERT = 'flipinvert',
SHIFT = 'shift',

// Shortcut vars
QTIP, PROTOTYPE, CORNER, CHECKS,
PLUGINS = {},
NAMESPACE = 'qtip',
ATTR_HAS = 'data-hasqtip',
ATTR_ID = 'data-qtip-id',
WIDGET = ['ui-widget', 'ui-tooltip'],
SELECTOR = '.'+NAMESPACE,
INACTIVE_EVENTS = 'click dblclick mousedown mouseup mousemove mouseleave mouseenter'.split(' '),

CLASS_FIXED = NAMESPACE+'-fixed',
CLASS_DEFAULT = NAMESPACE + '-default',
CLASS_FOCUS = NAMESPACE + '-focus',
CLASS_HOVER = NAMESPACE + '-hover',
CLASS_DISABLED = NAMESPACE+'-disabled',

replaceSuffix = '_replacedByqTip',
oldtitle = 'oldtitle',
trackingBound,

// Browser detection
BROWSER = {
	/*
	 * IE version detection
	 *
	 * Adapted from: http://ajaxian.com/archives/attack-of-the-ie-conditional-comment
	 * Credit to James Padolsey for the original implemntation!
	 */
	ie: (function() {
		/* eslint-disable no-empty */
		var v, i;
		for (
			v = 4, i = document.createElement('div');
			(i.innerHTML = '<!--[if gt IE ' + v + ']><i></i><![endif]-->') && i.getElementsByTagName('i')[0];
			v+=1
		) {}
		return v > 4 ? v : NaN;
		/* eslint-enable no-empty */
	})(),

	/*
	 * iOS version detection
	 */
	iOS: parseFloat(
		('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
		.replace('undefined', '3_2').replace('_', '.').replace('_', '')
	) || FALSE
};
;function QTip(target, options, id, attr) {
	// Elements and ID
	this.id = id;
	this.target = target;
	this.tooltip = NULL;
	this.elements = { target: target };

	// Internal constructs
	this._id = NAMESPACE + '-' + id;
	this.timers = { img: {} };
	this.options = options;
	this.plugins = {};

	// Cache object
	this.cache = {
		event: {},
		target: $(),
		disabled: FALSE,
		attr: attr,
		onTooltip: FALSE,
		lastClass: ''
	};

	// Set the initial flags
	this.rendered = this.destroyed = this.disabled = this.waiting =
		this.hiddenDuringWait = this.positioning = this.triggering = FALSE;
}
PROTOTYPE = QTip.prototype;

PROTOTYPE._when = function(deferreds) {
	return $.when.apply($, deferreds);
};

PROTOTYPE.render = function(show) {
	if(this.rendered || this.destroyed) { return this; } // If tooltip has already been rendered, exit

	var self = this,
		options = this.options,
		cache = this.cache,
		elements = this.elements,
		text = options.content.text,
		title = options.content.title,
		button = options.content.button,
		posOptions = options.position,
		deferreds = [];

	// Add ARIA attributes to target
	$.attr(this.target[0], 'aria-describedby', this._id);

	// Create public position object that tracks current position corners
	cache.posClass = this._createPosClass(
		(this.position = { my: posOptions.my, at: posOptions.at }).my
	);

	// Create tooltip element
	this.tooltip = elements.tooltip = $('<div/>', {
		'id': this._id,
		'class': [ NAMESPACE, CLASS_DEFAULT, options.style.classes, cache.posClass ].join(' '),
		'width': options.style.width || '',
		'height': options.style.height || '',
		'tracking': posOptions.target === 'mouse' && posOptions.adjust.mouse,

		/* ARIA specific attributes */
		'role': 'alert',
		'aria-live': 'polite',
		'aria-atomic': FALSE,
		'aria-describedby': this._id + '-content',
		'aria-hidden': TRUE
	})
	.toggleClass(CLASS_DISABLED, this.disabled)
	.attr(ATTR_ID, this.id)
	.data(NAMESPACE, this)
	.appendTo(posOptions.container)
	.append(
		// Create content element
		elements.content = $('<div />', {
			'class': NAMESPACE + '-content',
			'id': this._id + '-content',
			'aria-atomic': TRUE
		})
	);

	// Set rendered flag and prevent redundant reposition calls for now
	this.rendered = -1;
	this.positioning = TRUE;

	// Create title...
	if(title) {
		this._createTitle();

		// Update title only if its not a callback (called in toggle if so)
		if(!$.isFunction(title)) {
			deferreds.push( this._updateTitle(title, FALSE) );
		}
	}

	// Create button
	if(button) { this._createButton(); }

	// Set proper rendered flag and update content if not a callback function (called in toggle)
	if(!$.isFunction(text)) {
		deferreds.push( this._updateContent(text, FALSE) );
	}
	this.rendered = TRUE;

	// Setup widget classes
	this._setWidget();

	// Initialize 'render' plugins
	$.each(PLUGINS, function(name) {
		var instance;
		if(this.initialize === 'render' && (instance = this(self))) {
			self.plugins[name] = instance;
		}
	});

	// Unassign initial events and assign proper events
	this._unassignEvents();
	this._assignEvents();

	// When deferreds have completed
	this._when(deferreds).then(function() {
		// tooltiprender event
		self._trigger('render');

		// Reset flags
		self.positioning = FALSE;

		// Show tooltip if not hidden during wait period
		if(!self.hiddenDuringWait && (options.show.ready || show)) {
			self.toggle(TRUE, cache.event, FALSE);
		}
		self.hiddenDuringWait = FALSE;
	});

	// Expose API
	QTIP.api[this.id] = this;

	return this;
};

PROTOTYPE.destroy = function(immediate) {
	// Set flag the signify destroy is taking place to plugins
	// and ensure it only gets destroyed once!
	if(this.destroyed) { return this.target; }

	function process() {
		if(this.destroyed) { return; }
		this.destroyed = TRUE;

		var target = this.target,
			title = target.attr(oldtitle),
			timer;

		// Destroy tooltip if rendered
		if(this.rendered) {
			this.tooltip.stop(1,0).find('*').remove().end().remove();
		}

		// Destroy all plugins
		$.each(this.plugins, function() {
			this.destroy && this.destroy();
		});

		// Clear timers
		for (timer in this.timers) {
			if (this.timers.hasOwnProperty(timer)) {
				clearTimeout(this.timers[timer]);
			}
		}

		// Remove api object and ARIA attributes
		target.removeData(NAMESPACE)
			.removeAttr(ATTR_ID)
			.removeAttr(ATTR_HAS)
			.removeAttr('aria-describedby');

		// Reset old title attribute if removed
		if(this.options.suppress && title) {
			target.attr('title', title).removeAttr(oldtitle);
		}

		// Remove qTip events associated with this API
		this._unassignEvents();

		// Remove ID from used id objects, and delete object references
		// for better garbage collection and leak protection
		this.options = this.elements = this.cache = this.timers =
			this.plugins = this.mouse = NULL;

		// Delete epoxsed API object
		delete QTIP.api[this.id];
	}

	// If an immediate destroy is needed
	if((immediate !== TRUE || this.triggering === 'hide') && this.rendered) {
		this.tooltip.one('tooltiphidden', $.proxy(process, this));
		!this.triggering && this.hide();
	}

	// If we're not in the process of hiding... process
	else { process.call(this); }

	return this.target;
};
;function invalidOpt(a) {
	return a === NULL || $.type(a) !== 'object';
}

function invalidContent(c) {
	return !($.isFunction(c) || 
            c && c.attr || 
            c.length || 
            $.type(c) === 'object' && (c.jquery || c.then));
}

// Option object sanitizer
function sanitizeOptions(opts) {
	var content, text, ajax, once;

	if(invalidOpt(opts)) { return FALSE; }

	if(invalidOpt(opts.metadata)) {
		opts.metadata = { type: opts.metadata };
	}

	if('content' in opts) {
		content = opts.content;

		if(invalidOpt(content) || content.jquery || content.done) {
			text = invalidContent(content) ? FALSE : content;
			content = opts.content = {
				text: text
			};
		}
		else { text = content.text; }

		// DEPRECATED - Old content.ajax plugin functionality
		// Converts it into the proper Deferred syntax
		if('ajax' in content) {
			ajax = content.ajax;
			once = ajax && ajax.once !== FALSE;
			delete content.ajax;

			content.text = function(event, api) {
				var loading = text || $(this).attr(api.options.content.attr) || 'Loading...',

				deferred = $.ajax(
					$.extend({}, ajax, { context: api })
				)
				.then(ajax.success, NULL, ajax.error)
				.then(function(newContent) {
					if(newContent && once) { api.set('content.text', newContent); }
					return newContent;
				},
				function(xhr, status, error) {
					if(api.destroyed || xhr.status === 0) { return; }
					api.set('content.text', status + ': ' + error);
				});

				return !once ? (api.set('content.text', loading), deferred) : loading;
			};
		}

		if('title' in content) {
			if($.isPlainObject(content.title)) {
				content.button = content.title.button;
				content.title = content.title.text;
			}

			if(invalidContent(content.title || FALSE)) {
				content.title = FALSE;
			}
		}
	}

	if('position' in opts && invalidOpt(opts.position)) {
		opts.position = { my: opts.position, at: opts.position };
	}

	if('show' in opts && invalidOpt(opts.show)) {
		opts.show = opts.show.jquery ? { target: opts.show } :
			opts.show === TRUE ? { ready: TRUE } : { event: opts.show };
	}

	if('hide' in opts && invalidOpt(opts.hide)) {
		opts.hide = opts.hide.jquery ? { target: opts.hide } : { event: opts.hide };
	}

	if('style' in opts && invalidOpt(opts.style)) {
		opts.style = { classes: opts.style };
	}

	// Sanitize plugin options
	$.each(PLUGINS, function() {
		this.sanitize && this.sanitize(opts);
	});

	return opts;
}

// Setup builtin .set() option checks
CHECKS = PROTOTYPE.checks = {
	builtin: {
		// Core checks
		'^id$': function(obj, o, v, prev) {
			var id = v === TRUE ? QTIP.nextid : v,
				newId = NAMESPACE + '-' + id;

			if(id !== FALSE && id.length > 0 && !$('#'+newId).length) {
				this._id = newId;

				if(this.rendered) {
					this.tooltip[0].id = this._id;
					this.elements.content[0].id = this._id + '-content';
					this.elements.title[0].id = this._id + '-title';
				}
			}
			else { obj[o] = prev; }
		},
		'^prerender': function(obj, o, v) {
			v && !this.rendered && this.render(this.options.show.ready);
		},

		// Content checks
		'^content.text$': function(obj, o, v) {
			this._updateContent(v);
		},
		'^content.attr$': function(obj, o, v, prev) {
			if(this.options.content.text === this.target.attr(prev)) {
				this._updateContent( this.target.attr(v) );
			}
		},
		'^content.title$': function(obj, o, v) {
			// Remove title if content is null
			if(!v) { return this._removeTitle(); }

			// If title isn't already created, create it now and update
			v && !this.elements.title && this._createTitle();
			this._updateTitle(v);
		},
		'^content.button$': function(obj, o, v) {
			this._updateButton(v);
		},
		'^content.title.(text|button)$': function(obj, o, v) {
			this.set('content.'+o, v); // Backwards title.text/button compat
		},

		// Position checks
		'^position.(my|at)$': function(obj, o, v){
			if('string' === typeof v) {
				this.position[o] = obj[o] = new CORNER(v, o === 'at');
			}
		},
		'^position.container$': function(obj, o, v){
			this.rendered && this.tooltip.appendTo(v);
		},

		// Show checks
		'^show.ready$': function(obj, o, v) {
			v && (!this.rendered && this.render(TRUE) || this.toggle(TRUE));
		},

		// Style checks
		'^style.classes$': function(obj, o, v, p) {
			this.rendered && this.tooltip.removeClass(p).addClass(v);
		},
		'^style.(width|height)': function(obj, o, v) {
			this.rendered && this.tooltip.css(o, v);
		},
		'^style.widget|content.title': function() {
			this.rendered && this._setWidget();
		},
		'^style.def': function(obj, o, v) {
			this.rendered && this.tooltip.toggleClass(CLASS_DEFAULT, !!v);
		},

		// Events check
		'^events.(render|show|move|hide|focus|blur)$': function(obj, o, v) {
			this.rendered && this.tooltip[($.isFunction(v) ? '' : 'un') + 'bind']('tooltip'+o, v);
		},

		// Properties which require event reassignment
		'^(show|hide|position).(event|target|fixed|inactive|leave|distance|viewport|adjust)': function() {
			if(!this.rendered) { return; }

			// Set tracking flag
			var posOptions = this.options.position;
			this.tooltip.attr('tracking', posOptions.target === 'mouse' && posOptions.adjust.mouse);

			// Reassign events
			this._unassignEvents();
			this._assignEvents();
		}
	}
};

// Dot notation converter
function convertNotation(options, notation) {
	var i = 0, obj, option = options,

	// Split notation into array
	levels = notation.split('.');

	// Loop through
	while(option = option[ levels[i++] ]) {
		if(i < levels.length) { obj = option; }
	}

	return [obj || options, levels.pop()];
}

PROTOTYPE.get = function(notation) {
	if(this.destroyed) { return this; }

	var o = convertNotation(this.options, notation.toLowerCase()),
		result = o[0][ o[1] ];

	return result.precedance ? result.string() : result;
};

function setCallback(notation, args) {
	var category, rule, match;

	for(category in this.checks) {
		if (!this.checks.hasOwnProperty(category)) { continue; }

		for(rule in this.checks[category]) {
			if (!this.checks[category].hasOwnProperty(rule)) { continue; }

			if(match = (new RegExp(rule, 'i')).exec(notation)) {
				args.push(match);

				if(category === 'builtin' || this.plugins[category]) {
					this.checks[category][rule].apply(
						this.plugins[category] || this, args
					);
				}
			}
		}
	}
}

var rmove = /^position\.(my|at|adjust|target|container|viewport)|style|content|show\.ready/i,
	rrender = /^prerender|show\.ready/i;

PROTOTYPE.set = function(option, value) {
	if(this.destroyed) { return this; }

	var rendered = this.rendered,
		reposition = FALSE,
		options = this.options,
		name;

	// Convert singular option/value pair into object form
	if('string' === typeof option) {
		name = option; option = {}; option[name] = value;
	}
	else { option = $.extend({}, option); }

	// Set all of the defined options to their new values
	$.each(option, function(notation, val) {
		if(rendered && rrender.test(notation)) {
			delete option[notation]; return;
		}

		// Set new obj value
		var obj = convertNotation(options, notation.toLowerCase()), previous;
		previous = obj[0][ obj[1] ];
		obj[0][ obj[1] ] = val && val.nodeType ? $(val) : val;

		// Also check if we need to reposition
		reposition = rmove.test(notation) || reposition;

		// Set the new params for the callback
		option[notation] = [obj[0], obj[1], val, previous];
	});

	// Re-sanitize options
	sanitizeOptions(options);

	/*
	 * Execute any valid callbacks for the set options
	 * Also set positioning flag so we don't get loads of redundant repositioning calls.
	 */
	this.positioning = TRUE;
	$.each(option, $.proxy(setCallback, this));
	this.positioning = FALSE;

	// Update position if needed
	if(this.rendered && this.tooltip[0].offsetWidth > 0 && reposition) {
		this.reposition( options.position.target === 'mouse' ? NULL : this.cache.event );
	}

	return this;
};
;PROTOTYPE._update = function(content, element) {
	var self = this,
		cache = this.cache;

	// Make sure tooltip is rendered and content is defined. If not return
	if(!this.rendered || !content) { return FALSE; }

	// Use function to parse content
	if($.isFunction(content)) {
		content = content.call(this.elements.target, cache.event, this) || '';
	}

	// Handle deferred content
	if($.isFunction(content.then)) {
		cache.waiting = TRUE;
		return content.then(function(c) {
			cache.waiting = FALSE;
			return self._update(c, element);
		}, NULL, function(e) {
			return self._update(e, element);
		});
	}

	// If content is null... return false
	if(content === FALSE || !content && content !== '') { return FALSE; }

	// Append new content if its a DOM array and show it if hidden
	if(content.jquery && content.length > 0) {
		element.empty().append(
			content.css({ display: 'block', visibility: 'visible' })
		);
	}

	// Content is a regular string, insert the new content
	else { element.html(content); }

	// Wait for content to be loaded, and reposition
	return this._waitForContent(element).then(function(images) {
		if(self.rendered && self.tooltip[0].offsetWidth > 0) {
			self.reposition(cache.event, !images.length);
		}
	});
};

PROTOTYPE._waitForContent = function(element) {
	var cache = this.cache;

	// Set flag
	cache.waiting = TRUE;

	// If imagesLoaded is included, ensure images have loaded and return promise
	return ( $.fn.imagesLoaded ? element.imagesLoaded() : new $.Deferred().resolve([]) )
		.done(function() { cache.waiting = FALSE; })
		.promise();
};

PROTOTYPE._updateContent = function(content, reposition) {
	this._update(content, this.elements.content, reposition);
};

PROTOTYPE._updateTitle = function(content, reposition) {
	if(this._update(content, this.elements.title, reposition) === FALSE) {
		this._removeTitle(FALSE);
	}
};

PROTOTYPE._createTitle = function()
{
	var elements = this.elements,
		id = this._id+'-title';

	// Destroy previous title element, if present
	if(elements.titlebar) { this._removeTitle(); }

	// Create title bar and title elements
	elements.titlebar = $('<div />', {
		'class': NAMESPACE + '-titlebar ' + (this.options.style.widget ? createWidgetClass('header') : '')
	})
	.append(
		elements.title = $('<div />', {
			'id': id,
			'class': NAMESPACE + '-title',
			'aria-atomic': TRUE
		})
	)
	.insertBefore(elements.content)

	// Button-specific events
	.delegate('.qtip-close', 'mousedown keydown mouseup keyup mouseout', function(event) {
		$(this).toggleClass('ui-state-active ui-state-focus', event.type.substr(-4) === 'down');
	})
	.delegate('.qtip-close', 'mouseover mouseout', function(event){
		$(this).toggleClass('ui-state-hover', event.type === 'mouseover');
	});

	// Create button if enabled
	if(this.options.content.button) { this._createButton(); }
};

PROTOTYPE._removeTitle = function(reposition)
{
	var elements = this.elements;

	if(elements.title) {
		elements.titlebar.remove();
		elements.titlebar = elements.title = elements.button = NULL;

		// Reposition if enabled
		if(reposition !== FALSE) { this.reposition(); }
	}
};
;PROTOTYPE._createPosClass = function(my) {
	return NAMESPACE + '-pos-' + (my || this.options.position.my).abbrev();
};

PROTOTYPE.reposition = function(event, effect) {
	if(!this.rendered || this.positioning || this.destroyed) { return this; }

	// Set positioning flag
	this.positioning = TRUE;

	var cache = this.cache,
		tooltip = this.tooltip,
		posOptions = this.options.position,
		target = posOptions.target,
		my = posOptions.my,
		at = posOptions.at,
		viewport = posOptions.viewport,
		container = posOptions.container,
		adjust = posOptions.adjust,
		method = adjust.method.split(' '),
		tooltipWidth = tooltip.outerWidth(FALSE),
		tooltipHeight = tooltip.outerHeight(FALSE),
		targetWidth = 0,
		targetHeight = 0,
		type = tooltip.css('position'),
		position = { left: 0, top: 0 },
		visible = tooltip[0].offsetWidth > 0,
		isScroll = event && event.type === 'scroll',
		win = $(window),
		doc = container[0].ownerDocument,
		mouse = this.mouse,
		pluginCalculations, offset, adjusted, newClass;

	// Check if absolute position was passed
	if($.isArray(target) && target.length === 2) {
		// Force left top and set position
		at = { x: LEFT, y: TOP };
		position = { left: target[0], top: target[1] };
	}

	// Check if mouse was the target
	else if(target === 'mouse') {
		// Force left top to allow flipping
		at = { x: LEFT, y: TOP };

		// Use the mouse origin that caused the show event, if distance hiding is enabled
		if((!adjust.mouse || this.options.hide.distance) && cache.origin && cache.origin.pageX) {
			event =  cache.origin;
		}

		// Use cached event for resize/scroll events
		else if(!event || event && (event.type === 'resize' || event.type === 'scroll')) {
			event = cache.event;
		}

		// Otherwise, use the cached mouse coordinates if available
		else if(mouse && mouse.pageX) {
			event = mouse;
		}

		// Calculate body and container offset and take them into account below
		if(type !== 'static') { position = container.offset(); }
		if(doc.body.offsetWidth !== (window.innerWidth || doc.documentElement.clientWidth)) {
			offset = $(document.body).offset();
		}

		// Use event coordinates for position
		position = {
			left: event.pageX - position.left + (offset && offset.left || 0),
			top: event.pageY - position.top + (offset && offset.top || 0)
		};

		// Scroll events are a pain, some browsers
		if(adjust.mouse && isScroll && mouse) {
			position.left -= (mouse.scrollX || 0) - win.scrollLeft();
			position.top -= (mouse.scrollY || 0) - win.scrollTop();
		}
	}

	// Target wasn't mouse or absolute...
	else {
		// Check if event targetting is being used
		if(target === 'event') {
			if(event && event.target && event.type !== 'scroll' && event.type !== 'resize') {
				cache.target = $(event.target);
			}
			else if(!event.target) {
				cache.target = this.elements.target;
			}
		}
		else if(target !== 'event'){
			cache.target = $(target.jquery ? target : this.elements.target);
		}
		target = cache.target;

		// Parse the target into a jQuery object and make sure there's an element present
		target = $(target).eq(0);
		if(target.length === 0) { return this; }

		// Check if window or document is the target
		else if(target[0] === document || target[0] === window) {
			targetWidth = BROWSER.iOS ? window.innerWidth : target.width();
			targetHeight = BROWSER.iOS ? window.innerHeight : target.height();

			if(target[0] === window) {
				position = {
					top: (viewport || target).scrollTop(),
					left: (viewport || target).scrollLeft()
				};
			}
		}

		// Check if the target is an <AREA> element
		else if(PLUGINS.imagemap && target.is('area')) {
			pluginCalculations = PLUGINS.imagemap(this, target, at, PLUGINS.viewport ? method : FALSE);
		}

		// Check if the target is an SVG element
		else if(PLUGINS.svg && target && target[0].ownerSVGElement) {
			pluginCalculations = PLUGINS.svg(this, target, at, PLUGINS.viewport ? method : FALSE);
		}

		// Otherwise use regular jQuery methods
		else {
			targetWidth = target.outerWidth(FALSE);
			targetHeight = target.outerHeight(FALSE);
			position = target.offset();
		}

		// Parse returned plugin values into proper variables
		if(pluginCalculations) {
			targetWidth = pluginCalculations.width;
			targetHeight = pluginCalculations.height;
			offset = pluginCalculations.offset;
			position = pluginCalculations.position;
		}

		// Adjust position to take into account offset parents
		position = this.reposition.offset(target, position, container);

		// Adjust for position.fixed tooltips (and also iOS scroll bug in v3.2-4.0 & v4.3-4.3.2)
		if(BROWSER.iOS > 3.1 && BROWSER.iOS < 4.1 ||
			BROWSER.iOS >= 4.3 && BROWSER.iOS < 4.33 ||
			!BROWSER.iOS && type === 'fixed'
		){
			position.left -= win.scrollLeft();
			position.top -= win.scrollTop();
		}

		// Adjust position relative to target
		if(!pluginCalculations || pluginCalculations && pluginCalculations.adjustable !== FALSE) {
			position.left += at.x === RIGHT ? targetWidth : at.x === CENTER ? targetWidth / 2 : 0;
			position.top += at.y === BOTTOM ? targetHeight : at.y === CENTER ? targetHeight / 2 : 0;
		}
	}

	// Adjust position relative to tooltip
	position.left += adjust.x + (my.x === RIGHT ? -tooltipWidth : my.x === CENTER ? -tooltipWidth / 2 : 0);
	position.top += adjust.y + (my.y === BOTTOM ? -tooltipHeight : my.y === CENTER ? -tooltipHeight / 2 : 0);

	// Use viewport adjustment plugin if enabled
	if(PLUGINS.viewport) {
		adjusted = position.adjusted = PLUGINS.viewport(
			this, position, posOptions, targetWidth, targetHeight, tooltipWidth, tooltipHeight
		);

		// Apply offsets supplied by positioning plugin (if used)
		if(offset && adjusted.left) { position.left += offset.left; }
		if(offset && adjusted.top) {  position.top += offset.top; }

		// Apply any new 'my' position
		if(adjusted.my) { this.position.my = adjusted.my; }
	}

	// Viewport adjustment is disabled, set values to zero
	else { position.adjusted = { left: 0, top: 0 }; }

	// Set tooltip position class if it's changed
	if(cache.posClass !== (newClass = this._createPosClass(this.position.my))) {
		cache.posClass = newClass;
		tooltip.removeClass(cache.posClass).addClass(newClass);
	}

	// tooltipmove event
	if(!this._trigger('move', [position, viewport.elem || viewport], event)) { return this; }
	delete position.adjusted;

	// If effect is disabled, target it mouse, no animation is defined or positioning gives NaN out, set CSS directly
	if(effect === FALSE || !visible || isNaN(position.left) || isNaN(position.top) || target === 'mouse' || !$.isFunction(posOptions.effect)) {
		tooltip.css(position);
	}

	// Use custom function if provided
	else if($.isFunction(posOptions.effect)) {
		posOptions.effect.call(tooltip, this, $.extend({}, position));
		tooltip.queue(function(next) {
			// Reset attributes to avoid cross-browser rendering bugs
			$(this).css({ opacity: '', height: '' });
			if(BROWSER.ie) { this.style.removeAttribute('filter'); }

			next();
		});
	}

	// Set positioning flag
	this.positioning = FALSE;

	return this;
};

// Custom (more correct for qTip!) offset calculator
PROTOTYPE.reposition.offset = function(elem, pos, container) {
	if(!container[0]) { return pos; }

	var ownerDocument = $(elem[0].ownerDocument),
		quirks = !!BROWSER.ie && document.compatMode !== 'CSS1Compat',
		parent = container[0],
		scrolled, position, parentOffset, overflow;

	function scroll(e, i) {
		pos.left += i * e.scrollLeft();
		pos.top += i * e.scrollTop();
	}

	// Compensate for non-static containers offset
	do {
		if((position = $.css(parent, 'position')) !== 'static') {
			if(position === 'fixed') {
				parentOffset = parent.getBoundingClientRect();
				scroll(ownerDocument, -1);
			}
			else {
				parentOffset = $(parent).position();
				parentOffset.left += parseFloat($.css(parent, 'borderLeftWidth')) || 0;
				parentOffset.top += parseFloat($.css(parent, 'borderTopWidth')) || 0;
			}

			pos.left -= parentOffset.left + (parseFloat($.css(parent, 'marginLeft')) || 0);
			pos.top -= parentOffset.top + (parseFloat($.css(parent, 'marginTop')) || 0);

			// If this is the first parent element with an overflow of "scroll" or "auto", store it
			if(!scrolled && (overflow = $.css(parent, 'overflow')) !== 'hidden' && overflow !== 'visible') { scrolled = $(parent); }
		}
	}
	while(parent = parent.offsetParent);

	// Compensate for containers scroll if it also has an offsetParent (or in IE quirks mode)
	if(scrolled && (scrolled[0] !== ownerDocument[0] || quirks)) {
		scroll(scrolled, 1);
	}

	return pos;
};

// Corner class
var C = (CORNER = PROTOTYPE.reposition.Corner = function(corner, forceY) {
	corner = ('' + corner).replace(/([A-Z])/, ' $1').replace(/middle/gi, CENTER).toLowerCase();
	this.x = (corner.match(/left|right/i) || corner.match(/center/) || ['inherit'])[0].toLowerCase();
	this.y = (corner.match(/top|bottom|center/i) || ['inherit'])[0].toLowerCase();
	this.forceY = !!forceY;

	var f = corner.charAt(0);
	this.precedance = f === 't' || f === 'b' ? Y : X;
}).prototype;

C.invert = function(z, center) {
	this[z] = this[z] === LEFT ? RIGHT : this[z] === RIGHT ? LEFT : center || this[z];
};

C.string = function(join) {
	var x = this.x, y = this.y;

	var result = x !== y ?
		x === 'center' || y !== 'center' && (this.precedance === Y || this.forceY) ? 
			[y,x] : 
			[x,y] :
		[x];

	return join !== false ? result.join(' ') : result;
};

C.abbrev = function() {
	var result = this.string(false);
	return result[0].charAt(0) + (result[1] && result[1].charAt(0) || '');
};

C.clone = function() {
	return new CORNER( this.string(), this.forceY );
};

;
PROTOTYPE.toggle = function(state, event) {
	var cache = this.cache,
		options = this.options,
		tooltip = this.tooltip;

	// Try to prevent flickering when tooltip overlaps show element
	if(event) {
		if((/over|enter/).test(event.type) && cache.event && (/out|leave/).test(cache.event.type) &&
			options.show.target.add(event.target).length === options.show.target.length &&
			tooltip.has(event.relatedTarget).length) {
			return this;
		}

		// Cache event
		cache.event = $.event.fix(event);
	}

	// If we're currently waiting and we've just hidden... stop it
	this.waiting && !state && (this.hiddenDuringWait = TRUE);

	// Render the tooltip if showing and it isn't already
	if(!this.rendered) { return state ? this.render(1) : this; }
	else if(this.destroyed || this.disabled) { return this; }

	var type = state ? 'show' : 'hide',
		opts = this.options[type],
		posOptions = this.options.position,
		contentOptions = this.options.content,
		width = this.tooltip.css('width'),
		visible = this.tooltip.is(':visible'),
		animate = state || opts.target.length === 1,
		sameTarget = !event || opts.target.length < 2 || cache.target[0] === event.target,
		identicalState, allow, after;

	// Detect state if valid one isn't provided
	if((typeof state).search('boolean|number')) { state = !visible; }

	// Check if the tooltip is in an identical state to the new would-be state
	identicalState = !tooltip.is(':animated') && visible === state && sameTarget;

	// Fire tooltip(show/hide) event and check if destroyed
	allow = !identicalState ? !!this._trigger(type, [90]) : NULL;

	// Check to make sure the tooltip wasn't destroyed in the callback
	if(this.destroyed) { return this; }

	// If the user didn't stop the method prematurely and we're showing the tooltip, focus it
	if(allow !== FALSE && state) { this.focus(event); }

	// If the state hasn't changed or the user stopped it, return early
	if(!allow || identicalState) { return this; }

	// Set ARIA hidden attribute
	$.attr(tooltip[0], 'aria-hidden', !!!state);

	// Execute state specific properties
	if(state) {
		// Store show origin coordinates
		this.mouse && (cache.origin = $.event.fix(this.mouse));

		// Update tooltip content & title if it's a dynamic function
		if($.isFunction(contentOptions.text)) { this._updateContent(contentOptions.text, FALSE); }
		if($.isFunction(contentOptions.title)) { this._updateTitle(contentOptions.title, FALSE); }

		// Cache mousemove events for positioning purposes (if not already tracking)
		if(!trackingBound && posOptions.target === 'mouse' && posOptions.adjust.mouse) {
			$(document).bind('mousemove.'+NAMESPACE, this._storeMouse);
			trackingBound = TRUE;
		}

		// Update the tooltip position (set width first to prevent viewport/max-width issues)
		if(!width) { tooltip.css('width', tooltip.outerWidth(FALSE)); }
		this.reposition(event, arguments[2]);
		if(!width) { tooltip.css('width', ''); }

		// Hide other tooltips if tooltip is solo
		if(!!opts.solo) {
			(typeof opts.solo === 'string' ? $(opts.solo) : $(SELECTOR, opts.solo))
				.not(tooltip).not(opts.target).qtip('hide', new $.Event('tooltipsolo'));
		}
	}
	else {
		// Clear show timer if we're hiding
		clearTimeout(this.timers.show);

		// Remove cached origin on hide
		delete cache.origin;

		// Remove mouse tracking event if not needed (all tracking qTips are hidden)
		if(trackingBound && !$(SELECTOR+'[tracking="true"]:visible', opts.solo).not(tooltip).length) {
			$(document).unbind('mousemove.'+NAMESPACE);
			trackingBound = FALSE;
		}

		// Blur the tooltip
		this.blur(event);
	}

	// Define post-animation, state specific properties
	after = $.proxy(function() {
		if(state) {
			// Prevent antialias from disappearing in IE by removing filter
			if(BROWSER.ie) { tooltip[0].style.removeAttribute('filter'); }

			// Remove overflow setting to prevent tip bugs
			tooltip.css('overflow', '');

			// Autofocus elements if enabled
			if('string' === typeof opts.autofocus) {
				$(this.options.show.autofocus, tooltip).focus();
			}

			// If set, hide tooltip when inactive for delay period
			this.options.show.target.trigger('qtip-'+this.id+'-inactive');
		}
		else {
			// Reset CSS states
			tooltip.css({
				display: '',
				visibility: '',
				opacity: '',
				left: '',
				top: ''
			});
		}

		// tooltipvisible/tooltiphidden events
		this._trigger(state ? 'visible' : 'hidden');
	}, this);

	// If no effect type is supplied, use a simple toggle
	if(opts.effect === FALSE || animate === FALSE) {
		tooltip[ type ]();
		after();
	}

	// Use custom function if provided
	else if($.isFunction(opts.effect)) {
		tooltip.stop(1, 1);
		opts.effect.call(tooltip, this);
		tooltip.queue('fx', function(n) {
			after(); n();
		});
	}

	// Use basic fade function by default
	else { tooltip.fadeTo(90, state ? 1 : 0, after); }

	// If inactive hide method is set, active it
	if(state) { opts.target.trigger('qtip-'+this.id+'-inactive'); }

	return this;
};

PROTOTYPE.show = function(event) { return this.toggle(TRUE, event); };

PROTOTYPE.hide = function(event) { return this.toggle(FALSE, event); };
;PROTOTYPE.focus = function(event) {
	if(!this.rendered || this.destroyed) { return this; }

	var qtips = $(SELECTOR),
		tooltip = this.tooltip,
		curIndex = parseInt(tooltip[0].style.zIndex, 10),
		newIndex = QTIP.zindex + qtips.length;

	// Only update the z-index if it has changed and tooltip is not already focused
	if(!tooltip.hasClass(CLASS_FOCUS)) {
		// tooltipfocus event
		if(this._trigger('focus', [newIndex], event)) {
			// Only update z-index's if they've changed
			if(curIndex !== newIndex) {
				// Reduce our z-index's and keep them properly ordered
				qtips.each(function() {
					if(this.style.zIndex > curIndex) {
						this.style.zIndex = this.style.zIndex - 1;
					}
				});

				// Fire blur event for focused tooltip
				qtips.filter('.' + CLASS_FOCUS).qtip('blur', event);
			}

			// Set the new z-index
			tooltip.addClass(CLASS_FOCUS)[0].style.zIndex = newIndex;
		}
	}

	return this;
};

PROTOTYPE.blur = function(event) {
	if(!this.rendered || this.destroyed) { return this; }

	// Set focused status to FALSE
	this.tooltip.removeClass(CLASS_FOCUS);

	// tooltipblur event
	this._trigger('blur', [ this.tooltip.css('zIndex') ], event);

	return this;
};
;PROTOTYPE.disable = function(state) {
	if(this.destroyed) { return this; }

	// If 'toggle' is passed, toggle the current state
	if(state === 'toggle') {
		state = !(this.rendered ? this.tooltip.hasClass(CLASS_DISABLED) : this.disabled);
	}

	// Disable if no state passed
	else if('boolean' !== typeof state) {
		state = TRUE;
	}

	if(this.rendered) {
		this.tooltip.toggleClass(CLASS_DISABLED, state)
			.attr('aria-disabled', state);
	}

	this.disabled = !!state;

	return this;
};

PROTOTYPE.enable = function() { return this.disable(FALSE); };
;PROTOTYPE._createButton = function()
{
	var self = this,
		elements = this.elements,
		tooltip = elements.tooltip,
		button = this.options.content.button,
		isString = typeof button === 'string',
		close = isString ? button : 'Close tooltip';

	if(elements.button) { elements.button.remove(); }

	// Use custom button if one was supplied by user, else use default
	if(button.jquery) {
		elements.button = button;
	}
	else {
		elements.button = $('<a />', {
			'class': 'qtip-close ' + (this.options.style.widget ? '' : NAMESPACE+'-icon'),
			'title': close,
			'aria-label': close
		})
		.prepend(
			$('<span />', {
				'class': 'ui-icon ui-icon-close',
				'html': '&times;'
			})
		);
	}

	// Create button and setup attributes
	elements.button.appendTo(elements.titlebar || tooltip)
		.attr('role', 'button')
		.click(function(event) {
			if(!tooltip.hasClass(CLASS_DISABLED)) { self.hide(event); }
			return FALSE;
		});
};

PROTOTYPE._updateButton = function(button)
{
	// Make sure tooltip is rendered and if not, return
	if(!this.rendered) { return FALSE; }

	var elem = this.elements.button;
	if(button) { this._createButton(); }
	else { elem.remove(); }
};
;// Widget class creator
function createWidgetClass(cls) {
	return WIDGET.concat('').join(cls ? '-'+cls+' ' : ' ');
}

// Widget class setter method
PROTOTYPE._setWidget = function()
{
	var on = this.options.style.widget,
		elements = this.elements,
		tooltip = elements.tooltip,
		disabled = tooltip.hasClass(CLASS_DISABLED);

	tooltip.removeClass(CLASS_DISABLED);
	CLASS_DISABLED = on ? 'ui-state-disabled' : 'qtip-disabled';
	tooltip.toggleClass(CLASS_DISABLED, disabled);

	tooltip.toggleClass('ui-helper-reset '+createWidgetClass(), on).toggleClass(CLASS_DEFAULT, this.options.style.def && !on);

	if(elements.content) {
		elements.content.toggleClass( createWidgetClass('content'), on);
	}
	if(elements.titlebar) {
		elements.titlebar.toggleClass( createWidgetClass('header'), on);
	}
	if(elements.button) {
		elements.button.toggleClass(NAMESPACE+'-icon', !on);
	}
};
;function delay(callback, duration) {
	// If tooltip has displayed, start hide timer
	if(duration > 0) {
		return setTimeout(
			$.proxy(callback, this), duration
		);
	}
	else{ callback.call(this); }
}

function showMethod(event) {
	if(this.tooltip.hasClass(CLASS_DISABLED)) { return; }

	// Clear hide timers
	clearTimeout(this.timers.show);
	clearTimeout(this.timers.hide);

	// Start show timer
	this.timers.show = delay.call(this,
		function() { this.toggle(TRUE, event); },
		this.options.show.delay
	);
}

function hideMethod(event) {
	if(this.tooltip.hasClass(CLASS_DISABLED) || this.destroyed) { return; }

	// Check if new target was actually the tooltip element
	var relatedTarget = $(event.relatedTarget),
		ontoTooltip = relatedTarget.closest(SELECTOR)[0] === this.tooltip[0],
		ontoTarget = relatedTarget[0] === this.options.show.target[0];

	// Clear timers and stop animation queue
	clearTimeout(this.timers.show);
	clearTimeout(this.timers.hide);

	// Prevent hiding if tooltip is fixed and event target is the tooltip.
	// Or if mouse positioning is enabled and cursor momentarily overlaps
	if(this !== relatedTarget[0] &&
		(this.options.position.target === 'mouse' && ontoTooltip) ||
		this.options.hide.fixed && (
			(/mouse(out|leave|move)/).test(event.type) && (ontoTooltip || ontoTarget))
		)
	{
		/* eslint-disable no-empty */
		try {
			event.preventDefault();
			event.stopImmediatePropagation();
		} catch(e) {}
		/* eslint-enable no-empty */

		return;
	}

	// If tooltip has displayed, start hide timer
	this.timers.hide = delay.call(this,
		function() { this.toggle(FALSE, event); },
		this.options.hide.delay,
		this
	);
}

function inactiveMethod(event) {
	if(this.tooltip.hasClass(CLASS_DISABLED) || !this.options.hide.inactive) { return; }

	// Clear timer
	clearTimeout(this.timers.inactive);

	this.timers.inactive = delay.call(this,
		function(){ this.hide(event); },
		this.options.hide.inactive
	);
}

function repositionMethod(event) {
	if(this.rendered && this.tooltip[0].offsetWidth > 0) { this.reposition(event); }
}

// Store mouse coordinates
PROTOTYPE._storeMouse = function(event) {
	(this.mouse = $.event.fix(event)).type = 'mousemove';
	return this;
};

// Bind events
PROTOTYPE._bind = function(targets, events, method, suffix, context) {
	if(!targets || !method || !events.length) { return; }
	var ns = '.' + this._id + (suffix ? '-'+suffix : '');
	$(targets).bind(
		(events.split ? events : events.join(ns + ' ')) + ns,
		$.proxy(method, context || this)
	);
	return this;
};
PROTOTYPE._unbind = function(targets, suffix) {
	targets && $(targets).unbind('.' + this._id + (suffix ? '-'+suffix : ''));
	return this;
};

// Global delegation helper
function delegate(selector, events, method) {
	$(document.body).delegate(selector,
		(events.split ? events : events.join('.'+NAMESPACE + ' ')) + '.'+NAMESPACE,
		function() {
			var api = QTIP.api[ $.attr(this, ATTR_ID) ];
			api && !api.disabled && method.apply(api, arguments);
		}
	);
}
// Event trigger
PROTOTYPE._trigger = function(type, args, event) {
	var callback = new $.Event('tooltip'+type);
	callback.originalEvent = event && $.extend({}, event) || this.cache.event || NULL;

	this.triggering = type;
	this.tooltip.trigger(callback, [this].concat(args || []));
	this.triggering = FALSE;

	return !callback.isDefaultPrevented();
};

PROTOTYPE._bindEvents = function(showEvents, hideEvents, showTargets, hideTargets, showCallback, hideCallback) {
	// Get tasrgets that lye within both
	var similarTargets = showTargets.filter( hideTargets ).add( hideTargets.filter(showTargets) ),
		toggleEvents = [];

	// If hide and show targets are the same...
	if(similarTargets.length) {

		// Filter identical show/hide events
		$.each(hideEvents, function(i, type) {
			var showIndex = $.inArray(type, showEvents);

			// Both events are identical, remove from both hide and show events
			// and append to toggleEvents
			showIndex > -1 && toggleEvents.push( showEvents.splice( showIndex, 1 )[0] );
		});

		// Toggle events are special case of identical show/hide events, which happen in sequence
		if(toggleEvents.length) {
			// Bind toggle events to the similar targets
			this._bind(similarTargets, toggleEvents, function(event) {
				var state = this.rendered ? this.tooltip[0].offsetWidth > 0 : false;
				(state ? hideCallback : showCallback).call(this, event);
			});

			// Remove the similar targets from the regular show/hide bindings
			showTargets = showTargets.not(similarTargets);
			hideTargets = hideTargets.not(similarTargets);
		}
	}

	// Apply show/hide/toggle events
	this._bind(showTargets, showEvents, showCallback);
	this._bind(hideTargets, hideEvents, hideCallback);
};

PROTOTYPE._assignInitialEvents = function(event) {
	var options = this.options,
		showTarget = options.show.target,
		hideTarget = options.hide.target,
		showEvents = options.show.event ? $.trim('' + options.show.event).split(' ') : [],
		hideEvents = options.hide.event ? $.trim('' + options.hide.event).split(' ') : [];

	// Catch remove/removeqtip events on target element to destroy redundant tooltips
	this._bind(this.elements.target, ['remove', 'removeqtip'], function() {
		this.destroy(true);
	}, 'destroy');

	/*
	 * Make sure hoverIntent functions properly by using mouseleave as a hide event if
	 * mouseenter/mouseout is used for show.event, even if it isn't in the users options.
	 */
	if(/mouse(over|enter)/i.test(options.show.event) && !/mouse(out|leave)/i.test(options.hide.event)) {
		hideEvents.push('mouseleave');
	}

	/*
	 * Also make sure initial mouse targetting works correctly by caching mousemove coords
	 * on show targets before the tooltip has rendered. Also set onTarget when triggered to
	 * keep mouse tracking working.
	 */
	this._bind(showTarget, 'mousemove', function(moveEvent) {
		this._storeMouse(moveEvent);
		this.cache.onTarget = TRUE;
	});

	// Define hoverIntent function
	function hoverIntent(hoverEvent) {
		// Only continue if tooltip isn't disabled
		if(this.disabled || this.destroyed) { return FALSE; }

		// Cache the event data
		this.cache.event = hoverEvent && $.event.fix(hoverEvent);
		this.cache.target = hoverEvent && $(hoverEvent.target);

		// Start the event sequence
		clearTimeout(this.timers.show);
		this.timers.show = delay.call(this,
			function() { this.render(typeof hoverEvent === 'object' || options.show.ready); },
			options.prerender ? 0 : options.show.delay
		);
	}

	// Filter and bind events
	this._bindEvents(showEvents, hideEvents, showTarget, hideTarget, hoverIntent, function() {
		if(!this.timers) { return FALSE; }
		clearTimeout(this.timers.show);
	});

	// Prerendering is enabled, create tooltip now
	if(options.show.ready || options.prerender) { hoverIntent.call(this, event); }
};

// Event assignment method
PROTOTYPE._assignEvents = function() {
	var self = this,
		options = this.options,
		posOptions = options.position,

		tooltip = this.tooltip,
		showTarget = options.show.target,
		hideTarget = options.hide.target,
		containerTarget = posOptions.container,
		viewportTarget = posOptions.viewport,
		documentTarget = $(document),
		windowTarget = $(window),

		showEvents = options.show.event ? $.trim('' + options.show.event).split(' ') : [],
		hideEvents = options.hide.event ? $.trim('' + options.hide.event).split(' ') : [];


	// Assign passed event callbacks
	$.each(options.events, function(name, callback) {
		self._bind(tooltip, name === 'toggle' ? ['tooltipshow','tooltiphide'] : ['tooltip'+name], callback, null, tooltip);
	});

	// Hide tooltips when leaving current window/frame (but not select/option elements)
	if(/mouse(out|leave)/i.test(options.hide.event) && options.hide.leave === 'window') {
		this._bind(documentTarget, ['mouseout', 'blur'], function(event) {
			if(!/select|option/.test(event.target.nodeName) && !event.relatedTarget) {
				this.hide(event);
			}
		});
	}

	// Enable hide.fixed by adding appropriate class
	if(options.hide.fixed) {
		hideTarget = hideTarget.add( tooltip.addClass(CLASS_FIXED) );
	}

	/*
	 * Make sure hoverIntent functions properly by using mouseleave to clear show timer if
	 * mouseenter/mouseout is used for show.event, even if it isn't in the users options.
	 */
	else if(/mouse(over|enter)/i.test(options.show.event)) {
		this._bind(hideTarget, 'mouseleave', function() {
			clearTimeout(this.timers.show);
		});
	}

	// Hide tooltip on document mousedown if unfocus events are enabled
	if(('' + options.hide.event).indexOf('unfocus') > -1) {
		this._bind(containerTarget.closest('html'), ['mousedown', 'touchstart'], function(event) {
			var elem = $(event.target),
				enabled = this.rendered && !this.tooltip.hasClass(CLASS_DISABLED) && this.tooltip[0].offsetWidth > 0,
				isAncestor = elem.parents(SELECTOR).filter(this.tooltip[0]).length > 0;

			if(elem[0] !== this.target[0] && elem[0] !== this.tooltip[0] && !isAncestor &&
				!this.target.has(elem[0]).length && enabled
			) {
				this.hide(event);
			}
		});
	}

	// Check if the tooltip hides when inactive
	if('number' === typeof options.hide.inactive) {
		// Bind inactive method to show target(s) as a custom event
		this._bind(showTarget, 'qtip-'+this.id+'-inactive', inactiveMethod, 'inactive');

		// Define events which reset the 'inactive' event handler
		this._bind(hideTarget.add(tooltip), QTIP.inactiveEvents, inactiveMethod);
	}

	// Filter and bind events
	this._bindEvents(showEvents, hideEvents, showTarget, hideTarget, showMethod, hideMethod);

	// Mouse movement bindings
	this._bind(showTarget.add(tooltip), 'mousemove', function(event) {
		// Check if the tooltip hides when mouse is moved a certain distance
		if('number' === typeof options.hide.distance) {
			var origin = this.cache.origin || {},
				limit = this.options.hide.distance,
				abs = Math.abs;

			// Check if the movement has gone beyond the limit, and hide it if so
			if(abs(event.pageX - origin.pageX) >= limit || abs(event.pageY - origin.pageY) >= limit) {
				this.hide(event);
			}
		}

		// Cache mousemove coords on show targets
		this._storeMouse(event);
	});

	// Mouse positioning events
	if(posOptions.target === 'mouse') {
		// If mouse adjustment is on...
		if(posOptions.adjust.mouse) {
			// Apply a mouseleave event so we don't get problems with overlapping
			if(options.hide.event) {
				// Track if we're on the target or not
				this._bind(showTarget, ['mouseenter', 'mouseleave'], function(event) {
					if(!this.cache) {return FALSE; }
					this.cache.onTarget = event.type === 'mouseenter';
				});
			}

			// Update tooltip position on mousemove
			this._bind(documentTarget, 'mousemove', function(event) {
				// Update the tooltip position only if the tooltip is visible and adjustment is enabled
				if(this.rendered && this.cache.onTarget && !this.tooltip.hasClass(CLASS_DISABLED) && this.tooltip[0].offsetWidth > 0) {
					this.reposition(event);
				}
			});
		}
	}

	// Adjust positions of the tooltip on window resize if enabled
	if(posOptions.adjust.resize || viewportTarget.length) {
		this._bind( $.event.special.resize ? viewportTarget : windowTarget, 'resize', repositionMethod );
	}

	// Adjust tooltip position on scroll of the window or viewport element if present
	if(posOptions.adjust.scroll) {
		this._bind( windowTarget.add(posOptions.container), 'scroll', repositionMethod );
	}
};

// Un-assignment method
PROTOTYPE._unassignEvents = function() {
	var options = this.options,
		showTargets = options.show.target,
		hideTargets = options.hide.target,
		targets = $.grep([
			this.elements.target[0],
			this.rendered && this.tooltip[0],
			options.position.container[0],
			options.position.viewport[0],
			options.position.container.closest('html')[0], // unfocus
			window,
			document
		], function(i) {
			return typeof i === 'object';
		});

	// Add show and hide targets if they're valid
	if(showTargets && showTargets.toArray) {
		targets = targets.concat(showTargets.toArray());
	}
	if(hideTargets && hideTargets.toArray) {
		targets = targets.concat(hideTargets.toArray());
	}

	// Unbind the events
	this._unbind(targets)
		._unbind(targets, 'destroy')
		._unbind(targets, 'inactive');
};

// Apply common event handlers using delegate (avoids excessive .bind calls!)
$(function() {
	delegate(SELECTOR, ['mouseenter', 'mouseleave'], function(event) {
		var state = event.type === 'mouseenter',
			tooltip = $(event.currentTarget),
			target = $(event.relatedTarget || event.target),
			options = this.options;

		// On mouseenter...
		if(state) {
			// Focus the tooltip on mouseenter (z-index stacking)
			this.focus(event);

			// Clear hide timer on tooltip hover to prevent it from closing
			tooltip.hasClass(CLASS_FIXED) && !tooltip.hasClass(CLASS_DISABLED) && clearTimeout(this.timers.hide);
		}

		// On mouseleave...
		else {
			// When mouse tracking is enabled, hide when we leave the tooltip and not onto the show target (if a hide event is set)
			if(options.position.target === 'mouse' && options.position.adjust.mouse &&
				options.hide.event && options.show.target && !target.closest(options.show.target[0]).length) {
				this.hide(event);
			}
		}

		// Add hover class
		tooltip.toggleClass(CLASS_HOVER, state);
	});

	// Define events which reset the 'inactive' event handler
	delegate('['+ATTR_ID+']', INACTIVE_EVENTS, inactiveMethod);
});
;// Initialization method
function init(elem, id, opts) {
	var obj, posOptions, attr, config, title,

	// Setup element references
	docBody = $(document.body),

	// Use document body instead of document element if needed
	newTarget = elem[0] === document ? docBody : elem,

	// Grab metadata from element if plugin is present
	metadata = elem.metadata ? elem.metadata(opts.metadata) : NULL,

	// If metadata type if HTML5, grab 'name' from the object instead, or use the regular data object otherwise
	metadata5 = opts.metadata.type === 'html5' && metadata ? metadata[opts.metadata.name] : NULL,

	// Grab data from metadata.name (or data-qtipopts as fallback) using .data() method,
	html5 = elem.data(opts.metadata.name || 'qtipopts');

	// If we don't get an object returned attempt to parse it manualyl without parseJSON
	/* eslint-disable no-empty */
	try { html5 = typeof html5 === 'string' ? $.parseJSON(html5) : html5; }
	catch(e) {}
	/* eslint-enable no-empty */

	// Merge in and sanitize metadata
	config = $.extend(TRUE, {}, QTIP.defaults, opts,
		typeof html5 === 'object' ? sanitizeOptions(html5) : NULL,
		sanitizeOptions(metadata5 || metadata));

	// Re-grab our positioning options now we've merged our metadata and set id to passed value
	posOptions = config.position;
	config.id = id;

	// Setup missing content if none is detected
	if('boolean' === typeof config.content.text) {
		attr = elem.attr(config.content.attr);

		// Grab from supplied attribute if available
		if(config.content.attr !== FALSE && attr) { config.content.text = attr; }

		// No valid content was found, abort render
		else { return FALSE; }
	}

	// Setup target options
	if(!posOptions.container.length) { posOptions.container = docBody; }
	if(posOptions.target === FALSE) { posOptions.target = newTarget; }
	if(config.show.target === FALSE) { config.show.target = newTarget; }
	if(config.show.solo === TRUE) { config.show.solo = posOptions.container.closest('body'); }
	if(config.hide.target === FALSE) { config.hide.target = newTarget; }
	if(config.position.viewport === TRUE) { config.position.viewport = posOptions.container; }

	// Ensure we only use a single container
	posOptions.container = posOptions.container.eq(0);

	// Convert position corner values into x and y strings
	posOptions.at = new CORNER(posOptions.at, TRUE);
	posOptions.my = new CORNER(posOptions.my);

	// Destroy previous tooltip if overwrite is enabled, or skip element if not
	if(elem.data(NAMESPACE)) {
		if(config.overwrite) {
			elem.qtip('destroy', true);
		}
		else if(config.overwrite === FALSE) {
			return FALSE;
		}
	}

	// Add has-qtip attribute
	elem.attr(ATTR_HAS, id);

	// Remove title attribute and store it if present
	if(config.suppress && (title = elem.attr('title'))) {
		// Final attr call fixes event delegatiom and IE default tooltip showing problem
		elem.removeAttr('title').attr(oldtitle, title).attr('title', '');
	}

	// Initialize the tooltip and add API reference
	obj = new QTip(elem, config, id, !!attr);
	elem.data(NAMESPACE, obj);

	return obj;
}

// jQuery $.fn extension method
QTIP = $.fn.qtip = function(options, notation, newValue)
{
	var command = ('' + options).toLowerCase(), // Parse command
		returned = NULL,
		args = $.makeArray(arguments).slice(1),
		event = args[args.length - 1],
		opts = this[0] ? $.data(this[0], NAMESPACE) : NULL;

	// Check for API request
	if(!arguments.length && opts || command === 'api') {
		return opts;
	}

	// Execute API command if present
	else if('string' === typeof options) {
		this.each(function() {
			var api = $.data(this, NAMESPACE);
			if(!api) { return TRUE; }

			// Cache the event if possible
			if(event && event.timeStamp) { api.cache.event = event; }

			// Check for specific API commands
			if(notation && (command === 'option' || command === 'options')) {
				if(newValue !== undefined || $.isPlainObject(notation)) {
					api.set(notation, newValue);
				}
				else {
					returned = api.get(notation);
					return FALSE;
				}
			}

			// Execute API command
			else if(api[command]) {
				api[command].apply(api, args);
			}
		});

		return returned !== NULL ? returned : this;
	}

	// No API commands. validate provided options and setup qTips
	else if('object' === typeof options || !arguments.length) {
		// Sanitize options first
		opts = sanitizeOptions($.extend(TRUE, {}, options));

		return this.each(function(i) {
			var api, id;

			// Find next available ID, or use custom ID if provided
			id = $.isArray(opts.id) ? opts.id[i] : opts.id;
			id = !id || id === FALSE || id.length < 1 || QTIP.api[id] ? QTIP.nextid++ : id;

			// Initialize the qTip and re-grab newly sanitized options
			api = init($(this), id, opts);
			if(api === FALSE) { return TRUE; }
			else { QTIP.api[id] = api; }

			// Initialize plugins
			$.each(PLUGINS, function() {
				if(this.initialize === 'initialize') { this(api); }
			});

			// Assign initial pre-render events
			api._assignInitialEvents(event);
		});
	}
};

// Expose class
$.qtip = QTip;

// Populated in render method
QTIP.api = {};
;$.each({
	/* Allow other plugins to successfully retrieve the title of an element with a qTip applied */
	attr: function(attr, val) {
		if(this.length) {
			var self = this[0],
				title = 'title',
				api = $.data(self, 'qtip');

			if(attr === title && api && api.options && 'object' === typeof api && 'object' === typeof api.options && api.options.suppress) {
				if(arguments.length < 2) {
					return $.attr(self, oldtitle);
				}

				// If qTip is rendered and title was originally used as content, update it
				if(api && api.options.content.attr === title && api.cache.attr) {
					api.set('content.text', val);
				}

				// Use the regular attr method to set, then cache the result
				return this.attr(oldtitle, val);
			}
		}

		return $.fn['attr'+replaceSuffix].apply(this, arguments);
	},

	/* Allow clone to correctly retrieve cached title attributes */
	clone: function(keepData) {
		// Clone our element using the real clone method
		var elems = $.fn['clone'+replaceSuffix].apply(this, arguments);

		// Grab all elements with an oldtitle set, and change it to regular title attribute, if keepData is false
		if(!keepData) {
			elems.filter('['+oldtitle+']').attr('title', function() {
				return $.attr(this, oldtitle);
			})
			.removeAttr(oldtitle);
		}

		return elems;
	}
}, function(name, func) {
	if(!func || $.fn[name+replaceSuffix]) { return TRUE; }

	var old = $.fn[name+replaceSuffix] = $.fn[name];
	$.fn[name] = function() {
		return func.apply(this, arguments) || old.apply(this, arguments);
	};
});

/* Fire off 'removeqtip' handler in $.cleanData if jQuery UI not present (it already does similar).
 * This snippet is taken directly from jQuery UI source code found here:
 *     http://code.jquery.com/ui/jquery-ui-git.js
 */
if(!$.ui) {
	$['cleanData'+replaceSuffix] = $.cleanData;
	$.cleanData = function( elems ) {
		for(var i = 0, elem; (elem = $( elems[i] )).length; i++) {
			if(elem.attr(ATTR_HAS)) {
				/* eslint-disable no-empty */
				try { elem.triggerHandler('removeqtip'); }
				catch( e ) {}
				/* eslint-enable no-empty */
			}
		}
		$['cleanData'+replaceSuffix].apply(this, arguments);
	};
}
;// qTip version
QTIP.version = '3.0.3';

// Base ID for all qTips
QTIP.nextid = 0;

// Inactive events array
QTIP.inactiveEvents = INACTIVE_EVENTS;

// Base z-index for all qTips
QTIP.zindex = 15000;

// Define configuration defaults
QTIP.defaults = {
	prerender: FALSE,
	id: FALSE,
	overwrite: TRUE,
	suppress: TRUE,
	content: {
		text: TRUE,
		attr: 'title',
		title: FALSE,
		button: FALSE
	},
	position: {
		my: 'top left',
		at: 'bottom right',
		target: FALSE,
		container: FALSE,
		viewport: FALSE,
		adjust: {
			x: 0, y: 0,
			mouse: TRUE,
			scroll: TRUE,
			resize: TRUE,
			method: 'flipinvert flipinvert'
		},
		effect: function(api, pos) {
			$(this).animate(pos, {
				duration: 200,
				queue: FALSE
			});
		}
	},
	show: {
		target: FALSE,
		event: 'mouseenter',
		effect: TRUE,
		delay: 90,
		solo: FALSE,
		ready: FALSE,
		autofocus: FALSE
	},
	hide: {
		target: FALSE,
		event: 'mouseleave',
		effect: TRUE,
		delay: 0,
		fixed: FALSE,
		inactive: FALSE,
		leave: 'window',
		distance: FALSE
	},
	style: {
		classes: '',
		widget: FALSE,
		width: FALSE,
		height: FALSE,
		def: TRUE
	},
	events: {
		render: NULL,
		move: NULL,
		show: NULL,
		hide: NULL,
		toggle: NULL,
		visible: NULL,
		hidden: NULL,
		focus: NULL,
		blur: NULL
	}
};
;var TIP,
createVML,
SCALE,
PIXEL_RATIO,
BACKING_STORE_RATIO,

// Common CSS strings
MARGIN = 'margin',
BORDER = 'border',
COLOR = 'color',
BG_COLOR = 'background-color',
TRANSPARENT = 'transparent',
IMPORTANT = ' !important',

// Check if the browser supports <canvas/> elements
HASCANVAS = !!document.createElement('canvas').getContext,

// Invalid colour values used in parseColours()
INVALID = /rgba?\(0, 0, 0(, 0)?\)|transparent|#123456/i;

// Camel-case method, taken from jQuery source
// http://code.jquery.com/jquery-1.8.0.js
function camel(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/*
 * Modified from Modernizr's testPropsAll()
 * http://modernizr.com/downloads/modernizr-latest.js
 */
var cssProps = {}, cssPrefixes = ['Webkit', 'O', 'Moz', 'ms'];
function vendorCss(elem, prop) {
	var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
		props = (prop + ' ' + cssPrefixes.join(ucProp + ' ') + ucProp).split(' '),
		cur, val, i = 0;

	// If the property has already been mapped...
	if(cssProps[prop]) { return elem.css(cssProps[prop]); }

	while(cur = props[i++]) {
		if((val = elem.css(cur)) !== undefined) {
			cssProps[prop] = cur;
			return val;
		}
	}
}

// Parse a given elements CSS property into an int
function intCss(elem, prop) {
	return Math.ceil(parseFloat(vendorCss(elem, prop)));
}


// VML creation (for IE only)
if(!HASCANVAS) {
	createVML = function(tag, props, style) {
		return '<qtipvml:'+tag+' xmlns="urn:schemas-microsoft.com:vml" class="qtip-vml" '+(props||'')+
			' style="behavior: url(#default#VML); '+(style||'')+ '" />';
	};
}

// Canvas only definitions
else {
	PIXEL_RATIO = window.devicePixelRatio || 1;
	BACKING_STORE_RATIO = (function() {
		var context = document.createElement('canvas').getContext('2d');
		return context.backingStorePixelRatio || context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio ||
				context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || 1;
	})();
	SCALE = PIXEL_RATIO / BACKING_STORE_RATIO;
}


function Tip(qtip, options) {
	this._ns = 'tip';
	this.options = options;
	this.offset = options.offset;
	this.size = [ options.width, options.height ];

	// Initialize
	this.qtip = qtip;
	this.init(qtip);
}

$.extend(Tip.prototype, {
	init: function(qtip) {
		var context, tip;

		// Create tip element and prepend to the tooltip
		tip = this.element = qtip.elements.tip = $('<div />', { 'class': NAMESPACE+'-tip' }).prependTo(qtip.tooltip);

		// Create tip drawing element(s)
		if(HASCANVAS) {
			// save() as soon as we create the canvas element so FF2 doesn't bork on our first restore()!
			context = $('<canvas />').appendTo(this.element)[0].getContext('2d');

			// Setup constant parameters
			context.lineJoin = 'miter';
			context.miterLimit = 100000;
			context.save();
		}
		else {
			context = createVML('shape', 'coordorigin="0,0"', 'position:absolute;');
			this.element.html(context + context);

			// Prevent mousing down on the tip since it causes problems with .live() handling in IE due to VML
			qtip._bind( $('*', tip).add(tip), ['click', 'mousedown'], function(event) { event.stopPropagation(); }, this._ns);
		}

		// Bind update events
		qtip._bind(qtip.tooltip, 'tooltipmove', this.reposition, this._ns, this);

		// Create it
		this.create();
	},

	_swapDimensions: function() {
		this.size[0] = this.options.height;
		this.size[1] = this.options.width;
	},
	_resetDimensions: function() {
		this.size[0] = this.options.width;
		this.size[1] = this.options.height;
	},

	_useTitle: function(corner) {
		var titlebar = this.qtip.elements.titlebar;
		return titlebar && (
			corner.y === TOP || corner.y === CENTER && this.element.position().top + this.size[1] / 2 + this.options.offset < titlebar.outerHeight(TRUE)
		);
	},

	_parseCorner: function(corner) {
		var my = this.qtip.options.position.my;

		// Detect corner and mimic properties
		if(corner === FALSE || my === FALSE) {
			corner = FALSE;
		}
		else if(corner === TRUE) {
			corner = new CORNER( my.string() );
		}
		else if(!corner.string) {
			corner = new CORNER(corner);
			corner.fixed = TRUE;
		}

		return corner;
	},

	_parseWidth: function(corner, side, use) {
		var elements = this.qtip.elements,
			prop = BORDER + camel(side) + 'Width';

		return (use ? intCss(use, prop) : 
			intCss(elements.content, prop) ||
			intCss(this._useTitle(corner) && elements.titlebar || elements.content, prop) ||
			intCss(elements.tooltip, prop)
		) || 0;
	},

	_parseRadius: function(corner) {
		var elements = this.qtip.elements,
			prop = BORDER + camel(corner.y) + camel(corner.x) + 'Radius';

		return BROWSER.ie < 9 ? 0 :
			intCss(this._useTitle(corner) && elements.titlebar || elements.content, prop) ||
			intCss(elements.tooltip, prop) || 0;
	},

	_invalidColour: function(elem, prop, compare) {
		var val = elem.css(prop);
		return !val || compare && val === elem.css(compare) || INVALID.test(val) ? FALSE : val;
	},

	_parseColours: function(corner) {
		var elements = this.qtip.elements,
			tip = this.element.css('cssText', ''),
			borderSide = BORDER + camel(corner[ corner.precedance ]) + camel(COLOR),
			colorElem = this._useTitle(corner) && elements.titlebar || elements.content,
			css = this._invalidColour, color = [];

		// Attempt to detect the background colour from various elements, left-to-right precedance
		color[0] = css(tip, BG_COLOR) || css(colorElem, BG_COLOR) || css(elements.content, BG_COLOR) ||
			css(elements.tooltip, BG_COLOR) || tip.css(BG_COLOR);

		// Attempt to detect the correct border side colour from various elements, left-to-right precedance
		color[1] = css(tip, borderSide, COLOR) || css(colorElem, borderSide, COLOR) ||
			css(elements.content, borderSide, COLOR) || css(elements.tooltip, borderSide, COLOR) || elements.tooltip.css(borderSide);

		// Reset background and border colours
		$('*', tip).add(tip).css('cssText', BG_COLOR+':'+TRANSPARENT+IMPORTANT+';'+BORDER+':0'+IMPORTANT+';');

		return color;
	},

	_calculateSize: function(corner) {
		var y = corner.precedance === Y,
			width = this.options.width,
			height = this.options.height,
			isCenter = corner.abbrev() === 'c',
			base = (y ? width: height) * (isCenter ? 0.5 : 1),
			pow = Math.pow,
			round = Math.round,
			bigHyp, ratio, result,

		smallHyp = Math.sqrt( pow(base, 2) + pow(height, 2) ),
		hyp = [
			this.border / base * smallHyp,
			this.border / height * smallHyp
		];

		hyp[2] = Math.sqrt( pow(hyp[0], 2) - pow(this.border, 2) );
		hyp[3] = Math.sqrt( pow(hyp[1], 2) - pow(this.border, 2) );

		bigHyp = smallHyp + hyp[2] + hyp[3] + (isCenter ? 0 : hyp[0]);
		ratio = bigHyp / smallHyp;

		result = [ round(ratio * width), round(ratio * height) ];
		return y ? result : result.reverse();
	},

	// Tip coordinates calculator
	_calculateTip: function(corner, size, scale) {
		scale = scale || 1;
		size = size || this.size;

		var width = size[0] * scale,
			height = size[1] * scale,
			width2 = Math.ceil(width / 2), height2 = Math.ceil(height / 2),

		// Define tip coordinates in terms of height and width values
		tips = {
			br:	[0,0,		width,height,	width,0],
			bl:	[0,0,		width,0,		0,height],
			tr:	[0,height,	width,0,		width,height],
			tl:	[0,0,		0,height,		width,height],
			tc:	[0,height,	width2,0,		width,height],
			bc:	[0,0,		width,0,		width2,height],
			rc:	[0,0,		width,height2,	0,height],
			lc:	[width,0,	width,height,	0,height2]
		};

		// Set common side shapes
		tips.lt = tips.br; tips.rt = tips.bl;
		tips.lb = tips.tr; tips.rb = tips.tl;

		return tips[ corner.abbrev() ];
	},

	// Tip coordinates drawer (canvas)
	_drawCoords: function(context, coords) {
		context.beginPath();
		context.moveTo(coords[0], coords[1]);
		context.lineTo(coords[2], coords[3]);
		context.lineTo(coords[4], coords[5]);
		context.closePath();
	},

	create: function() {
		// Determine tip corner
		var c = this.corner = (HASCANVAS || BROWSER.ie) && this._parseCorner(this.options.corner);

		// If we have a tip corner...
		this.enabled = !!this.corner && this.corner.abbrev() !== 'c';
		if(this.enabled) {
			// Cache it
			this.qtip.cache.corner = c.clone();

			// Create it
			this.update();
		}

		// Toggle tip element
		this.element.toggle(this.enabled);

		return this.corner;
	},

	update: function(corner, position) {
		if(!this.enabled) { return this; }

		var elements = this.qtip.elements,
			tip = this.element,
			inner = tip.children(),
			options = this.options,
			curSize = this.size,
			mimic = options.mimic,
			round = Math.round,
			color, precedance, context,
			coords, bigCoords, translate, newSize, border;

		// Re-determine tip if not already set
		if(!corner) { corner = this.qtip.cache.corner || this.corner; }

		// Use corner property if we detect an invalid mimic value
		if(mimic === FALSE) { mimic = corner; }

		// Otherwise inherit mimic properties from the corner object as necessary
		else {
			mimic = new CORNER(mimic);
			mimic.precedance = corner.precedance;

			if(mimic.x === 'inherit') { mimic.x = corner.x; }
			else if(mimic.y === 'inherit') { mimic.y = corner.y; }
			else if(mimic.x === mimic.y) {
				mimic[ corner.precedance ] = corner[ corner.precedance ];
			}
		}
		precedance = mimic.precedance;

		// Ensure the tip width.height are relative to the tip position
		if(corner.precedance === X) { this._swapDimensions(); }
		else { this._resetDimensions(); }

		// Update our colours
		color = this.color = this._parseColours(corner);

		// Detect border width, taking into account colours
		if(color[1] !== TRANSPARENT) {
			// Grab border width
			border = this.border = this._parseWidth(corner, corner[corner.precedance]);

			// If border width isn't zero, use border color as fill if it's not invalid (1.0 style tips)
			if(options.border && border < 1 && !INVALID.test(color[1])) { color[0] = color[1]; }

			// Set border width (use detected border width if options.border is true)
			this.border = border = options.border !== TRUE ? options.border : border;
		}

		// Border colour was invalid, set border to zero
		else { this.border = border = 0; }

		// Determine tip size
		newSize = this.size = this._calculateSize(corner);
		tip.css({
			width: newSize[0],
			height: newSize[1],
			lineHeight: newSize[1]+'px'
		});

		// Calculate tip translation
		if(corner.precedance === Y) {
			translate = [
				round(mimic.x === LEFT ? border : mimic.x === RIGHT ? newSize[0] - curSize[0] - border : (newSize[0] - curSize[0]) / 2),
				round(mimic.y === TOP ? newSize[1] - curSize[1] : 0)
			];
		}
		else {
			translate = [
				round(mimic.x === LEFT ? newSize[0] - curSize[0] : 0),
				round(mimic.y === TOP ? border : mimic.y === BOTTOM ? newSize[1] - curSize[1] - border : (newSize[1] - curSize[1]) / 2)
			];
		}

		// Canvas drawing implementation
		if(HASCANVAS) {
			// Grab canvas context and clear/save it
			context = inner[0].getContext('2d');
			context.restore(); context.save();
			context.clearRect(0,0,6000,6000);

			// Calculate coordinates
			coords = this._calculateTip(mimic, curSize, SCALE);
			bigCoords = this._calculateTip(mimic, this.size, SCALE);

			// Set the canvas size using calculated size
			inner.attr(WIDTH, newSize[0] * SCALE).attr(HEIGHT, newSize[1] * SCALE);
			inner.css(WIDTH, newSize[0]).css(HEIGHT, newSize[1]);

			// Draw the outer-stroke tip
			this._drawCoords(context, bigCoords);
			context.fillStyle = color[1];
			context.fill();

			// Draw the actual tip
			context.translate(translate[0] * SCALE, translate[1] * SCALE);
			this._drawCoords(context, coords);
			context.fillStyle = color[0];
			context.fill();
		}

		// VML (IE Proprietary implementation)
		else {
			// Calculate coordinates
			coords = this._calculateTip(mimic);

			// Setup coordinates string
			coords = 'm' + coords[0] + ',' + coords[1] + ' l' + coords[2] +
				',' + coords[3] + ' ' + coords[4] + ',' + coords[5] + ' xe';

			// Setup VML-specific offset for pixel-perfection
			translate[2] = border && /^(r|b)/i.test(corner.string()) ?
				BROWSER.ie === 8 ? 2 : 1 : 0;

			// Set initial CSS
			inner.css({
				coordsize: newSize[0]+border + ' ' + newSize[1]+border,
				antialias: ''+(mimic.string().indexOf(CENTER) > -1),
				left: translate[0] - translate[2] * Number(precedance === X),
				top: translate[1] - translate[2] * Number(precedance === Y),
				width: newSize[0] + border,
				height: newSize[1] + border
			})
			.each(function(i) {
				var $this = $(this);

				// Set shape specific attributes
				$this[ $this.prop ? 'prop' : 'attr' ]({
					coordsize: newSize[0]+border + ' ' + newSize[1]+border,
					path: coords,
					fillcolor: color[0],
					filled: !!i,
					stroked: !i
				})
				.toggle(!!(border || i));

				// Check if border is enabled and add stroke element
				!i && $this.html( createVML(
					'stroke', 'weight="'+border*2+'px" color="'+color[1]+'" miterlimit="1000" joinstyle="miter"'
				) );
			});
		}

		// Opera bug #357 - Incorrect tip position
		// https://github.com/Craga89/qTip2/issues/367
		window.opera && setTimeout(function() {
			elements.tip.css({
				display: 'inline-block',
				visibility: 'visible'
			});
		}, 1);

		// Position if needed
		if(position !== FALSE) { this.calculate(corner, newSize); }
	},

	calculate: function(corner, size) {
		if(!this.enabled) { return FALSE; }

		var self = this,
			elements = this.qtip.elements,
			tip = this.element,
			userOffset = this.options.offset,
			position = {},
			precedance, corners;

		// Inherit corner if not provided
		corner = corner || this.corner;
		precedance = corner.precedance;

		// Determine which tip dimension to use for adjustment
		size = size || this._calculateSize(corner);

		// Setup corners and offset array
		corners = [ corner.x, corner.y ];
		if(precedance === X) { corners.reverse(); }

		// Calculate tip position
		$.each(corners, function(i, side) {
			var b, bc, br;

			if(side === CENTER) {
				b = precedance === Y ? LEFT : TOP;
				position[ b ] = '50%';
				position[MARGIN+'-' + b] = -Math.round(size[ precedance === Y ? 0 : 1 ] / 2) + userOffset;
			}
			else {
				b = self._parseWidth(corner, side, elements.tooltip);
				bc = self._parseWidth(corner, side, elements.content);
				br = self._parseRadius(corner);

				position[ side ] = Math.max(-self.border, i ? bc : userOffset + (br > b ? br : -b));
			}
		});

		// Adjust for tip size
		position[ corner[precedance] ] -= size[ precedance === X ? 0 : 1 ];

		// Set and return new position
		tip.css({ margin: '', top: '', bottom: '', left: '', right: '' }).css(position);
		return position;
	},

	reposition: function(event, api, pos) {
		if(!this.enabled) { return; }

		var cache = api.cache,
			newCorner = this.corner.clone(),
			adjust = pos.adjusted,
			method = api.options.position.adjust.method.split(' '),
			horizontal = method[0],
			vertical = method[1] || method[0],
			shift = { left: FALSE, top: FALSE, x: 0, y: 0 },
			offset, css = {}, props;

		function shiftflip(direction, precedance, popposite, side, opposite) {
			// Horizontal - Shift or flip method
			if(direction === SHIFT && newCorner.precedance === precedance && adjust[side] && newCorner[popposite] !== CENTER) {
				newCorner.precedance = newCorner.precedance === X ? Y : X;
			}
			else if(direction !== SHIFT && adjust[side]){
				newCorner[precedance] = newCorner[precedance] === CENTER ?
					adjust[side] > 0 ? side : opposite :
					newCorner[precedance] === side ? opposite : side;
			}
		}

		function shiftonly(xy, side, opposite) {
			if(newCorner[xy] === CENTER) {
				css[MARGIN+'-'+side] = shift[xy] = offset[MARGIN+'-'+side] - adjust[side];
			}
			else {
				props = offset[opposite] !== undefined ?
					[ adjust[side], -offset[side] ] : [ -adjust[side], offset[side] ];

				if( (shift[xy] = Math.max(props[0], props[1])) > props[0] ) {
					pos[side] -= adjust[side];
					shift[side] = FALSE;
				}

				css[ offset[opposite] !== undefined ? opposite : side ] = shift[xy];
			}
		}

		// If our tip position isn't fixed e.g. doesn't adjust with viewport...
		if(this.corner.fixed !== TRUE) {
			// Perform shift/flip adjustments
			shiftflip(horizontal, X, Y, LEFT, RIGHT);
			shiftflip(vertical, Y, X, TOP, BOTTOM);

			// Update and redraw the tip if needed (check cached details of last drawn tip)
			if(newCorner.string() !== cache.corner.string() || cache.cornerTop !== adjust.top || cache.cornerLeft !== adjust.left) {
				this.update(newCorner, FALSE);
			}
		}

		// Setup tip offset properties
		offset = this.calculate(newCorner);

		// Readjust offset object to make it left/top
		if(offset.right !== undefined) { offset.left = -offset.right; }
		if(offset.bottom !== undefined) { offset.top = -offset.bottom; }
		offset.user = this.offset;

		// Perform shift adjustments
		shift.left = horizontal === SHIFT && !!adjust.left;
		if(shift.left) {
			shiftonly(X, LEFT, RIGHT);
		}
		shift.top = vertical === SHIFT && !!adjust.top;
		if(shift.top) {
			shiftonly(Y, TOP, BOTTOM);
		}

		/*
		* If the tip is adjusted in both dimensions, or in a
		* direction that would cause it to be anywhere but the
		* outer border, hide it!
		*/
		this.element.css(css).toggle(
			!(shift.x && shift.y || newCorner.x === CENTER && shift.y || newCorner.y === CENTER && shift.x)
		);

		// Adjust position to accomodate tip dimensions
		pos.left -= offset.left.charAt ? offset.user :
			horizontal !== SHIFT || shift.top || !shift.left && !shift.top ? offset.left + this.border : 0;
		pos.top -= offset.top.charAt ? offset.user :
			vertical !== SHIFT || shift.left || !shift.left && !shift.top ? offset.top + this.border : 0;

		// Cache details
		cache.cornerLeft = adjust.left; cache.cornerTop = adjust.top;
		cache.corner = newCorner.clone();
	},

	destroy: function() {
		// Unbind events
		this.qtip._unbind(this.qtip.tooltip, this._ns);

		// Remove the tip element(s)
		if(this.qtip.elements.tip) {
			this.qtip.elements.tip.find('*')
				.remove().end().remove();
		}
	}
});

TIP = PLUGINS.tip = function(api) {
	return new Tip(api, api.options.style.tip);
};

// Initialize tip on render
TIP.initialize = 'render';

// Setup plugin sanitization options
TIP.sanitize = function(options) {
	if(options.style && 'tip' in options.style) {
		var opts = options.style.tip;
		if(typeof opts !== 'object') { opts = options.style.tip = { corner: opts }; }
		if(!(/string|boolean/i).test(typeof opts.corner)) { opts.corner = TRUE; }
	}
};

// Add new option checks for the plugin
CHECKS.tip = {
	'^position.my|style.tip.(corner|mimic|border)$': function() {
		// Make sure a tip can be drawn
		this.create();

		// Reposition the tooltip
		this.qtip.reposition();
	},
	'^style.tip.(height|width)$': function(obj) {
		// Re-set dimensions and redraw the tip
		this.size = [ obj.width, obj.height ];
		this.update();

		// Reposition the tooltip
		this.qtip.reposition();
	},
	'^content.title|style.(classes|widget)$': function() {
		this.update();
	}
};

// Extend original qTip defaults
$.extend(TRUE, QTIP.defaults, {
	style: {
		tip: {
			corner: TRUE,
			mimic: FALSE,
			width: 6,
			height: 6,
			border: TRUE,
			offset: 0
		}
	}
});
;var MODAL, OVERLAY,
	MODALCLASS = 'qtip-modal',
	MODALSELECTOR = '.'+MODALCLASS;

OVERLAY = function()
{
	var self = this,
		focusableElems = {},
		current,
		prevState,
		elem;

	// Modified code from jQuery UI 1.10.0 source
	// http://code.jquery.com/ui/1.10.0/jquery-ui.js
	function focusable(element) {
		// Use the defined focusable checker when possible
		if($.expr[':'].focusable) { return $.expr[':'].focusable; }

		var isTabIndexNotNaN = !isNaN($.attr(element, 'tabindex')),
			nodeName = element.nodeName && element.nodeName.toLowerCase(),
			map, mapName, img;

		if('area' === nodeName) {
			map = element.parentNode;
			mapName = map.name;
			if(!element.href || !mapName || map.nodeName.toLowerCase() !== 'map') {
				return false;
			}
			img = $('img[usemap=#' + mapName + ']')[0];
			return !!img && img.is(':visible');
		}

		return /input|select|textarea|button|object/.test( nodeName ) ?
			!element.disabled :
			'a' === nodeName ?
				element.href || isTabIndexNotNaN :
				isTabIndexNotNaN
		;
	}

	// Focus inputs using cached focusable elements (see update())
	function focusInputs(blurElems) {
		// Blurring body element in IE causes window.open windows to unfocus!
		if(focusableElems.length < 1 && blurElems.length) { blurElems.not('body').blur(); }

		// Focus the inputs
		else { focusableElems.first().focus(); }
	}

	// Steal focus from elements outside tooltip
	function stealFocus(event) {
		if(!elem.is(':visible')) { return; }

		var target = $(event.target),
			tooltip = current.tooltip,
			container = target.closest(SELECTOR),
			targetOnTop;

		// Determine if input container target is above this
		targetOnTop = container.length < 1 ? FALSE :
			parseInt(container[0].style.zIndex, 10) > parseInt(tooltip[0].style.zIndex, 10);

		// If we're showing a modal, but focus has landed on an input below
		// this modal, divert focus to the first visible input in this modal
		// or if we can't find one... the tooltip itself
		if(!targetOnTop && target.closest(SELECTOR)[0] !== tooltip[0]) {
			focusInputs(target);
		}
	}

	$.extend(self, {
		init: function() {
			// Create document overlay
			elem = self.elem = $('<div />', {
				id: 'qtip-overlay',
				html: '<div></div>',
				mousedown: function() { return FALSE; }
			})
			.hide();

			// Make sure we can't focus anything outside the tooltip
			$(document.body).bind('focusin'+MODALSELECTOR, stealFocus);

			// Apply keyboard "Escape key" close handler
			$(document).bind('keydown'+MODALSELECTOR, function(event) {
				if(current && current.options.show.modal.escape && event.keyCode === 27) {
					current.hide(event);
				}
			});

			// Apply click handler for blur option
			elem.bind('click'+MODALSELECTOR, function(event) {
				if(current && current.options.show.modal.blur) {
					current.hide(event);
				}
			});

			return self;
		},

		update: function(api) {
			// Update current API reference
			current = api;

			// Update focusable elements if enabled
			if(api.options.show.modal.stealfocus !== FALSE) {
				focusableElems = api.tooltip.find('*').filter(function() {
					return focusable(this);
				});
			}
			else { focusableElems = []; }
		},

		toggle: function(api, state, duration) {
			var tooltip = api.tooltip,
				options = api.options.show.modal,
				effect = options.effect,
				type = state ? 'show': 'hide',
				visible = elem.is(':visible'),
				visibleModals = $(MODALSELECTOR).filter(':visible:not(:animated)').not(tooltip);

			// Set active tooltip API reference
			self.update(api);

			// If the modal can steal the focus...
			// Blur the current item and focus anything in the modal we an
			if(state && options.stealfocus !== FALSE) {
				focusInputs( $(':focus') );
			}

			// Toggle backdrop cursor style on show
			elem.toggleClass('blurs', options.blur);

			// Append to body on show
			if(state) {
				elem.appendTo(document.body);
			}

			// Prevent modal from conflicting with show.solo, and don't hide backdrop is other modals are visible
			if(elem.is(':animated') && visible === state && prevState !== FALSE || !state && visibleModals.length) {
				return self;
			}

			// Stop all animations
			elem.stop(TRUE, FALSE);

			// Use custom function if provided
			if($.isFunction(effect)) {
				effect.call(elem, state);
			}

			// If no effect type is supplied, use a simple toggle
			else if(effect === FALSE) {
				elem[ type ]();
			}

			// Use basic fade function
			else {
				elem.fadeTo( parseInt(duration, 10) || 90, state ? 1 : 0, function() {
					if(!state) { elem.hide(); }
				});
			}

			// Reset position and detach from body on hide
			if(!state) {
				elem.queue(function(next) {
					elem.css({ left: '', top: '' });
					if(!$(MODALSELECTOR).length) { elem.detach(); }
					next();
				});
			}

			// Cache the state
			prevState = state;

			// If the tooltip is destroyed, set reference to null
			if(current.destroyed) { current = NULL; }

			return self;
		}
	});

	self.init();
};
OVERLAY = new OVERLAY();

function Modal(api, options) {
	this.options = options;
	this._ns = '-modal';

	this.qtip = api;
	this.init(api);
}

$.extend(Modal.prototype, {
	init: function(qtip) {
		var tooltip = qtip.tooltip;

		// If modal is disabled... return
		if(!this.options.on) { return this; }

		// Set overlay reference
		qtip.elements.overlay = OVERLAY.elem;

		// Add unique attribute so we can grab modal tooltips easily via a SELECTOR, and set z-index
		tooltip.addClass(MODALCLASS).css('z-index', QTIP.modal_zindex + $(MODALSELECTOR).length);

		// Apply our show/hide/focus modal events
		qtip._bind(tooltip, ['tooltipshow', 'tooltiphide'], function(event, api, duration) {
			var oEvent = event.originalEvent;

			// Make sure mouseout doesn't trigger a hide when showing the modal and mousing onto backdrop
			if(event.target === tooltip[0]) {
				if(oEvent && event.type === 'tooltiphide' && /mouse(leave|enter)/.test(oEvent.type) && $(oEvent.relatedTarget).closest(OVERLAY.elem[0]).length) {
					/* eslint-disable no-empty */
					try { event.preventDefault(); }
					catch(e) {}
					/* eslint-enable no-empty */
				}
				else if(!oEvent || oEvent && oEvent.type !== 'tooltipsolo') {
					this.toggle(event, event.type === 'tooltipshow', duration);
				}
			}
		}, this._ns, this);

		// Adjust modal z-index on tooltip focus
		qtip._bind(tooltip, 'tooltipfocus', function(event, api) {
			// If focus was cancelled before it reached us, don't do anything
			if(event.isDefaultPrevented() || event.target !== tooltip[0]) { return; }

			var qtips = $(MODALSELECTOR),

			// Keep the modal's lower than other, regular qtips
			newIndex = QTIP.modal_zindex + qtips.length,
			curIndex = parseInt(tooltip[0].style.zIndex, 10);

			// Set overlay z-index
			OVERLAY.elem[0].style.zIndex = newIndex - 1;

			// Reduce modal z-index's and keep them properly ordered
			qtips.each(function() {
				if(this.style.zIndex > curIndex) {
					this.style.zIndex -= 1;
				}
			});

			// Fire blur event for focused tooltip
			qtips.filter('.' + CLASS_FOCUS).qtip('blur', event.originalEvent);

			// Set the new z-index
			tooltip.addClass(CLASS_FOCUS)[0].style.zIndex = newIndex;

			// Set current
			OVERLAY.update(api);

			// Prevent default handling
			/* eslint-disable no-empty */
			try { event.preventDefault(); }
			catch(e) {}
			/* eslint-enable no-empty */
		}, this._ns, this);

		// Focus any other visible modals when this one hides
		qtip._bind(tooltip, 'tooltiphide', function(event) {
			if(event.target === tooltip[0]) {
				$(MODALSELECTOR).filter(':visible').not(tooltip).last().qtip('focus', event);
			}
		}, this._ns, this);
	},

	toggle: function(event, state, duration) {
		// Make sure default event hasn't been prevented
		if(event && event.isDefaultPrevented()) { return this; }

		// Toggle it
		OVERLAY.toggle(this.qtip, !!state, duration);
	},

	destroy: function() {
		// Remove modal class
		this.qtip.tooltip.removeClass(MODALCLASS);

		// Remove bound events
		this.qtip._unbind(this.qtip.tooltip, this._ns);

		// Delete element reference
		OVERLAY.toggle(this.qtip, FALSE);
		delete this.qtip.elements.overlay;
	}
});


MODAL = PLUGINS.modal = function(api) {
	return new Modal(api, api.options.show.modal);
};

// Setup sanitiztion rules
MODAL.sanitize = function(opts) {
	if(opts.show) {
		if(typeof opts.show.modal !== 'object') { opts.show.modal = { on: !!opts.show.modal }; }
		else if(typeof opts.show.modal.on === 'undefined') { opts.show.modal.on = TRUE; }
	}
};

// Base z-index for all modal tooltips (use qTip core z-index as a base)
/* eslint-disable camelcase */
QTIP.modal_zindex = QTIP.zindex - 200;
/* eslint-enable camelcase */

// Plugin needs to be initialized on render
MODAL.initialize = 'render';

// Setup option set checks
CHECKS.modal = {
	'^show.modal.(on|blur)$': function() {
		// Initialise
		this.destroy();
		this.init();

		// Show the modal if not visible already and tooltip is visible
		this.qtip.elems.overlay.toggle(
			this.qtip.tooltip[0].offsetWidth > 0
		);
	}
};

// Extend original api defaults
$.extend(TRUE, QTIP.defaults, {
	show: {
		modal: {
			on: FALSE,
			effect: TRUE,
			blur: TRUE,
			stealfocus: TRUE,
			escape: TRUE
		}
	}
});
;PLUGINS.viewport = function(api, position, posOptions, targetWidth, targetHeight, elemWidth, elemHeight)
{
	var target = posOptions.target,
		tooltip = api.elements.tooltip,
		my = posOptions.my,
		at = posOptions.at,
		adjust = posOptions.adjust,
		method = adjust.method.split(' '),
		methodX = method[0],
		methodY = method[1] || method[0],
		viewport = posOptions.viewport,
		container = posOptions.container,
		adjusted = { left: 0, top: 0 },
		fixed, newMy, containerOffset, containerStatic,
		viewportWidth, viewportHeight, viewportScroll, viewportOffset;

	// If viewport is not a jQuery element, or it's the window/document, or no adjustment method is used... return
	if(!viewport.jquery || target[0] === window || target[0] === document.body || adjust.method === 'none') {
		return adjusted;
	}

	// Cach container details
	containerOffset = container.offset() || adjusted;
	containerStatic = container.css('position') === 'static';

	// Cache our viewport details
	fixed = tooltip.css('position') === 'fixed';
	viewportWidth = viewport[0] === window ? viewport.width() : viewport.outerWidth(FALSE);
	viewportHeight = viewport[0] === window ? viewport.height() : viewport.outerHeight(FALSE);
	viewportScroll = { left: fixed ? 0 : viewport.scrollLeft(), top: fixed ? 0 : viewport.scrollTop() };
	viewportOffset = viewport.offset() || adjusted;

	// Generic calculation method
	function calculate(side, otherSide, type, adjustment, side1, side2, lengthName, targetLength, elemLength) {
		var initialPos = position[side1],
			mySide = my[side],
			atSide = at[side],
			isShift = type === SHIFT,
			myLength = mySide === side1 ? elemLength : mySide === side2 ? -elemLength : -elemLength / 2,
			atLength = atSide === side1 ? targetLength : atSide === side2 ? -targetLength : -targetLength / 2,
			sideOffset = viewportScroll[side1] + viewportOffset[side1] - (containerStatic ? 0 : containerOffset[side1]),
			overflow1 = sideOffset - initialPos,
			overflow2 = initialPos + elemLength - (lengthName === WIDTH ? viewportWidth : viewportHeight) - sideOffset,
			offset = myLength - (my.precedance === side || mySide === my[otherSide] ? atLength : 0) - (atSide === CENTER ? targetLength / 2 : 0);

		// shift
		if(isShift) {
			offset = (mySide === side1 ? 1 : -1) * myLength;

			// Adjust position but keep it within viewport dimensions
			position[side1] += overflow1 > 0 ? overflow1 : overflow2 > 0 ? -overflow2 : 0;
			position[side1] = Math.max(
				-containerOffset[side1] + viewportOffset[side1],
				initialPos - offset,
				Math.min(
					Math.max(
						-containerOffset[side1] + viewportOffset[side1] + (lengthName === WIDTH ? viewportWidth : viewportHeight),
						initialPos + offset
					),
					position[side1],

					// Make sure we don't adjust complete off the element when using 'center'
					mySide === 'center' ? initialPos - myLength : 1E9
				)
			);

		}

		// flip/flipinvert
		else {
			// Update adjustment amount depending on if using flipinvert or flip
			adjustment *= type === FLIPINVERT ? 2 : 0;

			// Check for overflow on the left/top
			if(overflow1 > 0 && (mySide !== side1 || overflow2 > 0)) {
				position[side1] -= offset + adjustment;
				newMy.invert(side, side1);
			}

			// Check for overflow on the bottom/right
			else if(overflow2 > 0 && (mySide !== side2 || overflow1 > 0)  ) {
				position[side1] -= (mySide === CENTER ? -offset : offset) + adjustment;
				newMy.invert(side, side2);
			}

			// Make sure we haven't made things worse with the adjustment and reset if so
			if(position[side1] < viewportScroll[side1] && -position[side1] > overflow2) {
				position[side1] = initialPos; newMy = my.clone();
			}
		}

		return position[side1] - initialPos;
	}

	// Set newMy if using flip or flipinvert methods
	if(methodX !== 'shift' || methodY !== 'shift') { newMy = my.clone(); }

	// Adjust position based onviewport and adjustment options
	adjusted = {
		left: methodX !== 'none' ? calculate( X, Y, methodX, adjust.x, LEFT, RIGHT, WIDTH, targetWidth, elemWidth ) : 0,
		top: methodY !== 'none' ? calculate( Y, X, methodY, adjust.y, TOP, BOTTOM, HEIGHT, targetHeight, elemHeight ) : 0,
		my: newMy
	};

	return adjusted;
};
;PLUGINS.polys = {
	// POLY area coordinate calculator
	//	Special thanks to Ed Cradock for helping out with this.
	//	Uses a binary search algorithm to find suitable coordinates.
	polygon: function(baseCoords, corner) {
		var result = {
			width: 0, height: 0,
			position: {
				top: 1e10, right: 0,
				bottom: 0, left: 1e10
			},
			adjustable: FALSE
		},
		i = 0, next,
		coords = [],
		compareX = 1, compareY = 1,
		realX = 0, realY = 0,
		newWidth, newHeight;

		// First pass, sanitize coords and determine outer edges
		i = baseCoords.length; 
		while(i--) {
			next = [ parseInt(baseCoords[--i], 10), parseInt(baseCoords[i+1], 10) ];

			if(next[0] > result.position.right){ result.position.right = next[0]; }
			if(next[0] < result.position.left){ result.position.left = next[0]; }
			if(next[1] > result.position.bottom){ result.position.bottom = next[1]; }
			if(next[1] < result.position.top){ result.position.top = next[1]; }

			coords.push(next);
		}

		// Calculate height and width from outer edges
		newWidth = result.width = Math.abs(result.position.right - result.position.left);
		newHeight = result.height = Math.abs(result.position.bottom - result.position.top);

		// If it's the center corner...
		if(corner.abbrev() === 'c') {
			result.position = {
				left: result.position.left + result.width / 2,
				top: result.position.top + result.height / 2
			};
		}
		else {
			// Second pass, use a binary search algorithm to locate most suitable coordinate
			while(newWidth > 0 && newHeight > 0 && compareX > 0 && compareY > 0)
			{
				newWidth = Math.floor(newWidth / 2);
				newHeight = Math.floor(newHeight / 2);

				if(corner.x === LEFT){ compareX = newWidth; }
				else if(corner.x === RIGHT){ compareX = result.width - newWidth; }
				else{ compareX += Math.floor(newWidth / 2); }

				if(corner.y === TOP){ compareY = newHeight; }
				else if(corner.y === BOTTOM){ compareY = result.height - newHeight; }
				else{ compareY += Math.floor(newHeight / 2); }

				i = coords.length;
				while(i--)
				{
					if(coords.length < 2){ break; }

					realX = coords[i][0] - result.position.left;
					realY = coords[i][1] - result.position.top;

					if(
						corner.x === LEFT && realX >= compareX ||
						corner.x === RIGHT && realX <= compareX ||
						corner.x === CENTER && (realX < compareX || realX > result.width - compareX) ||
						corner.y === TOP && realY >= compareY ||
						corner.y === BOTTOM && realY <= compareY ||
						corner.y === CENTER && (realY < compareY || realY > result.height - compareY)) {
						coords.splice(i, 1);
					}
				}
			}
			result.position = { left: coords[0][0], top: coords[0][1] };
		}

		return result;
	},

	rect: function(ax, ay, bx, by) {
		return {
			width: Math.abs(bx - ax),
			height: Math.abs(by - ay),
			position: {
				left: Math.min(ax, bx),
				top: Math.min(ay, by)
			}
		};
	},

	_angles: {
		tc: 3 / 2, tr: 7 / 4, tl: 5 / 4,
		bc: 1 / 2, br: 1 / 4, bl: 3 / 4,
		rc: 2, lc: 1, c: 0
	},
	ellipse: function(cx, cy, rx, ry, corner) {
		var c = PLUGINS.polys._angles[ corner.abbrev() ],
			rxc = c === 0 ? 0 : rx * Math.cos( c * Math.PI ),
			rys = ry * Math.sin( c * Math.PI );

		return {
			width: rx * 2 - Math.abs(rxc),
			height: ry * 2 - Math.abs(rys),
			position: {
				left: cx + rxc,
				top: cy + rys
			},
			adjustable: FALSE
		};
	},
	circle: function(cx, cy, r, corner) {
		return PLUGINS.polys.ellipse(cx, cy, r, r, corner);
	}
};
;PLUGINS.svg = function(api, svg, corner)
{
	var elem = svg[0],
		root = $(elem.ownerSVGElement),
		ownerDocument = elem.ownerDocument,
		strokeWidth2 = (parseInt(svg.css('stroke-width'), 10) || 0) / 2,
		frameOffset, mtx, transformed,
		len, next, i, points,
		result, position;

	// Ascend the parentNode chain until we find an element with getBBox()
	while(!elem.getBBox) { elem = elem.parentNode; }
	if(!elem.getBBox || !elem.parentNode) { return FALSE; }

	// Determine which shape calculation to use
	switch(elem.nodeName) {
		case 'ellipse':
		case 'circle':
			result = PLUGINS.polys.ellipse(
				elem.cx.baseVal.value,
				elem.cy.baseVal.value,
				(elem.rx || elem.r).baseVal.value + strokeWidth2,
				(elem.ry || elem.r).baseVal.value + strokeWidth2,
				corner
			);
		break;

		case 'line':
		case 'polygon':
		case 'polyline':
			// Determine points object (line has none, so mimic using array)
			points = elem.points || [
				{ x: elem.x1.baseVal.value, y: elem.y1.baseVal.value },
				{ x: elem.x2.baseVal.value, y: elem.y2.baseVal.value }
			];

			for(result = [], i = -1, len = points.numberOfItems || points.length; ++i < len;) {
				next = points.getItem ? points.getItem(i) : points[i];
				result.push.apply(result, [next.x, next.y]);
			}

			result = PLUGINS.polys.polygon(result, corner);
		break;

		// Unknown shape or rectangle? Use bounding box
		default:
			result = elem.getBBox();
			result = {
				width: result.width,
				height: result.height,
				position: {
					left: result.x,
					top: result.y
				}
			};
		break;
	}

	// Shortcut assignments
	position = result.position;
	root = root[0];

	// Convert position into a pixel value
	if(root.createSVGPoint) {
		mtx = elem.getScreenCTM();
		points = root.createSVGPoint();

		points.x = position.left;
		points.y = position.top;
		transformed = points.matrixTransform( mtx );
		position.left = transformed.x;
		position.top = transformed.y;
	}

	// Check the element is not in a child document, and if so, adjust for frame elements offset
	if(ownerDocument !== document && api.position.target !== 'mouse') {
		frameOffset = $((ownerDocument.defaultView || ownerDocument.parentWindow).frameElement).offset();
		if(frameOffset) {
			position.left += frameOffset.left;
			position.top += frameOffset.top;
		}
	}

	// Adjust by scroll offset of owner document
	ownerDocument = $(ownerDocument);
	position.left += ownerDocument.scrollLeft();
	position.top += ownerDocument.scrollTop();

	return result;
};
;PLUGINS.imagemap = function(api, area, corner)
{
	if(!area.jquery) { area = $(area); }

	var shape = (area.attr('shape') || 'rect').toLowerCase().replace('poly', 'polygon'),
		image = $('img[usemap="#'+area.parent('map').attr('name')+'"]'),
		coordsString = $.trim(area.attr('coords')),
		coordsArray = coordsString.replace(/,$/, '').split(','),
		imageOffset, coords, i, result, len;

	// If we can't find the image using the map...
	if(!image.length) { return FALSE; }

	// Pass coordinates string if polygon
	if(shape === 'polygon') {
		result = PLUGINS.polys.polygon(coordsArray, corner);
	}

	// Otherwise parse the coordinates and pass them as arguments
	else if(PLUGINS.polys[shape]) {
		for(i = -1, len = coordsArray.length, coords = []; ++i < len;) {
			coords.push( parseInt(coordsArray[i], 10) );
		}

		result = PLUGINS.polys[shape].apply(
			this, coords.concat(corner)
		);
	}

	// If no shapre calculation method was found, return false
	else { return FALSE; }

	// Make sure we account for padding and borders on the image
	imageOffset = image.offset();
	imageOffset.left += Math.ceil((image.outerWidth(FALSE) - image.width()) / 2);
	imageOffset.top += Math.ceil((image.outerHeight(FALSE) - image.height()) / 2);

	// Add image position to offset coordinates
	result.position.left += imageOffset.left;
	result.position.top += imageOffset.top;

	return result;
};
;var IE6,

/*
 * BGIFrame adaption (http://plugins.jquery.com/project/bgiframe)
 * Special thanks to Brandon Aaron
 */
BGIFRAME = '<iframe class="qtip-bgiframe" frameborder="0" tabindex="-1" src="javascript:\'\';" ' +
	' style="display:block; position:absolute; z-index:-1; filter:alpha(opacity=0); ' +
		'-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";"></iframe>';

function Ie6(api) {
	this._ns = 'ie6';

	this.qtip = api;
	this.init(api);
}

$.extend(Ie6.prototype, {
	_scroll : function() {
		var overlay = this.qtip.elements.overlay;
		overlay && (overlay[0].style.top = $(window).scrollTop() + 'px');
	},

	init: function(qtip) {
		var tooltip = qtip.tooltip;

		// Create the BGIFrame element if needed
		if($('select, object').length < 1) {
			this.bgiframe = qtip.elements.bgiframe = $(BGIFRAME).appendTo(tooltip);

			// Update BGIFrame on tooltip move
			qtip._bind(tooltip, 'tooltipmove', this.adjustBGIFrame, this._ns, this);
		}

		// redraw() container for width/height calculations
		this.redrawContainer = $('<div/>', { id: NAMESPACE+'-rcontainer' })
			.appendTo(document.body);

		// Fixup modal plugin if present too
		if( qtip.elements.overlay && qtip.elements.overlay.addClass('qtipmodal-ie6fix') ) {
			qtip._bind(window, ['scroll', 'resize'], this._scroll, this._ns, this);
			qtip._bind(tooltip, ['tooltipshow'], this._scroll, this._ns, this);
		}

		// Set dimensions
		this.redraw();
	},

	adjustBGIFrame: function() {
		var tooltip = this.qtip.tooltip,
			dimensions = {
				height: tooltip.outerHeight(FALSE),
				width: tooltip.outerWidth(FALSE)
			},
			plugin = this.qtip.plugins.tip,
			tip = this.qtip.elements.tip,
			tipAdjust, offset;

		// Adjust border offset
		offset = parseInt(tooltip.css('borderLeftWidth'), 10) || 0;
		offset = { left: -offset, top: -offset };

		// Adjust for tips plugin
		if(plugin && tip) {
			tipAdjust = plugin.corner.precedance === 'x' ? [WIDTH, LEFT] : [HEIGHT, TOP];
			offset[ tipAdjust[1] ] -= tip[ tipAdjust[0] ]();
		}

		// Update bgiframe
		this.bgiframe.css(offset).css(dimensions);
	},

	// Max/min width simulator function
	redraw: function() {
		if(this.qtip.rendered < 1 || this.drawing) { return this; }

		var tooltip = this.qtip.tooltip,
			style = this.qtip.options.style,
			container = this.qtip.options.position.container,
			perc, width, max, min;

		// Set drawing flag
		this.qtip.drawing = 1;

		// If tooltip has a set height/width, just set it... like a boss!
		if(style.height) { tooltip.css(HEIGHT, style.height); }
		if(style.width) { tooltip.css(WIDTH, style.width); }

		// Simulate max/min width if not set width present...
		else {
			// Reset width and add fluid class
			tooltip.css(WIDTH, '').appendTo(this.redrawContainer);

			// Grab our tooltip width (add 1 if odd so we don't get wrapping problems.. huzzah!)
			width = tooltip.width();
			if(width % 2 < 1) { width += 1; }

			// Grab our max/min properties
			max = tooltip.css('maxWidth') || '';
			min = tooltip.css('minWidth') || '';

			// Parse into proper pixel values
			perc = (max + min).indexOf('%') > -1 ? container.width() / 100 : 0;
			max = (max.indexOf('%') > -1 ? perc : 1 * parseInt(max, 10)) || width;
			min = (min.indexOf('%') > -1 ? perc : 1 * parseInt(min, 10)) || 0;

			// Determine new dimension size based on max/min/current values
			width = max + min ? Math.min(Math.max(width, min), max) : width;

			// Set the newly calculated width and remvoe fluid class
			tooltip.css(WIDTH, Math.round(width)).appendTo(container);
		}

		// Set drawing flag
		this.drawing = 0;

		return this;
	},

	destroy: function() {
		// Remove iframe
		this.bgiframe && this.bgiframe.remove();

		// Remove bound events
		this.qtip._unbind([window, this.qtip.tooltip], this._ns);
	}
});

IE6 = PLUGINS.ie6 = function(api) {
	// Proceed only if the browser is IE6
	return BROWSER.ie === 6 ? new Ie6(api) : FALSE;
};

IE6.initialize = 'render';

CHECKS.ie6 = {
	'^content|style$': function() {
		this.redraw();
	}
};
;}));
}( window, document ));

},{}],33:[function(require,module,exports){
/*!
* screenfull
* v5.0.2 - 2020-02-13
* (c) Sindre Sorhus; MIT License
*/
(function () {
	'use strict';

	var document = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : {};
	var isCommonjs = typeof module !== 'undefined' && module.exports;

	var fn = (function () {
		var val;

		var fnMap = [
			[
				'requestFullscreen',
				'exitFullscreen',
				'fullscreenElement',
				'fullscreenEnabled',
				'fullscreenchange',
				'fullscreenerror'
			],
			// New WebKit
			[
				'webkitRequestFullscreen',
				'webkitExitFullscreen',
				'webkitFullscreenElement',
				'webkitFullscreenEnabled',
				'webkitfullscreenchange',
				'webkitfullscreenerror'

			],
			// Old WebKit
			[
				'webkitRequestFullScreen',
				'webkitCancelFullScreen',
				'webkitCurrentFullScreenElement',
				'webkitCancelFullScreen',
				'webkitfullscreenchange',
				'webkitfullscreenerror'

			],
			[
				'mozRequestFullScreen',
				'mozCancelFullScreen',
				'mozFullScreenElement',
				'mozFullScreenEnabled',
				'mozfullscreenchange',
				'mozfullscreenerror'
			],
			[
				'msRequestFullscreen',
				'msExitFullscreen',
				'msFullscreenElement',
				'msFullscreenEnabled',
				'MSFullscreenChange',
				'MSFullscreenError'
			]
		];

		var i = 0;
		var l = fnMap.length;
		var ret = {};

		for (; i < l; i++) {
			val = fnMap[i];
			if (val && val[1] in document) {
				for (i = 0; i < val.length; i++) {
					ret[fnMap[0][i]] = val[i];
				}
				return ret;
			}
		}

		return false;
	})();

	var eventNameMap = {
		change: fn.fullscreenchange,
		error: fn.fullscreenerror
	};

	var screenfull = {
		request: function (element) {
			return new Promise(function (resolve, reject) {
				var onFullScreenEntered = function () {
					this.off('change', onFullScreenEntered);
					resolve();
				}.bind(this);

				this.on('change', onFullScreenEntered);

				element = element || document.documentElement;

				var returnPromise = element[fn.requestFullscreen]();

				if (returnPromise instanceof Promise) {
					returnPromise.then(onFullScreenEntered).catch(reject);
				}
			}.bind(this));
		},
		exit: function () {
			return new Promise(function (resolve, reject) {
				if (!this.isFullscreen) {
					resolve();
					return;
				}

				var onFullScreenExit = function () {
					this.off('change', onFullScreenExit);
					resolve();
				}.bind(this);

				this.on('change', onFullScreenExit);

				var returnPromise = document[fn.exitFullscreen]();

				if (returnPromise instanceof Promise) {
					returnPromise.then(onFullScreenExit).catch(reject);
				}
			}.bind(this));
		},
		toggle: function (element) {
			return this.isFullscreen ? this.exit() : this.request(element);
		},
		onchange: function (callback) {
			this.on('change', callback);
		},
		onerror: function (callback) {
			this.on('error', callback);
		},
		on: function (event, callback) {
			var eventName = eventNameMap[event];
			if (eventName) {
				document.addEventListener(eventName, callback, false);
			}
		},
		off: function (event, callback) {
			var eventName = eventNameMap[event];
			if (eventName) {
				document.removeEventListener(eventName, callback, false);
			}
		},
		raw: fn
	};

	if (!fn) {
		if (isCommonjs) {
			module.exports = {isEnabled: false};
		} else {
			window.screenfull = {isEnabled: false};
		}

		return;
	}

	Object.defineProperties(screenfull, {
		isFullscreen: {
			get: function () {
				return Boolean(document[fn.fullscreenElement]);
			}
		},
		element: {
			enumerable: true,
			get: function () {
				return document[fn.fullscreenElement];
			}
		},
		isEnabled: {
			enumerable: true,
			get: function () {
				// Coerce to boolean in case of old WebKit
				return Boolean(document[fn.fullscreenEnabled]);
			}
		}
	});

	if (isCommonjs) {
		module.exports = screenfull;
	} else {
		window.screenfull = screenfull;
	}
})();

},{}],34:[function(require,module,exports){
(function (Buffer){
(function() {
  var crypt = require('crypt'),
      utf8 = require('charenc').utf8,
      bin = require('charenc').bin,

  // The core
  sha1 = function (message) {
    // Convert to byte array
    if (message.constructor == String)
      message = utf8.stringToBytes(message);
    else if (typeof Buffer !== 'undefined' && typeof Buffer.isBuffer == 'function' && Buffer.isBuffer(message))
      message = Array.prototype.slice.call(message, 0);
    else if (!Array.isArray(message))
      message = message.toString();

    // otherwise assume byte array

    var m  = crypt.bytesToWords(message),
        l  = message.length * 8,
        w  = [],
        H0 =  1732584193,
        H1 = -271733879,
        H2 = -1732584194,
        H3 =  271733878,
        H4 = -1009589776;

    // Padding
    m[l >> 5] |= 0x80 << (24 - l % 32);
    m[((l + 64 >>> 9) << 4) + 15] = l;

    for (var i = 0; i < m.length; i += 16) {
      var a = H0,
          b = H1,
          c = H2,
          d = H3,
          e = H4;

      for (var j = 0; j < 80; j++) {

        if (j < 16)
          w[j] = m[i + j];
        else {
          var n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
          w[j] = (n << 1) | (n >>> 31);
        }

        var t = ((H0 << 5) | (H0 >>> 27)) + H4 + (w[j] >>> 0) + (
                j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 :
                j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 :
                j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 :
                         (H1 ^ H2 ^ H3) - 899497514);

        H4 = H3;
        H3 = H2;
        H2 = (H1 << 30) | (H1 >>> 2);
        H1 = H0;
        H0 = t;
      }

      H0 += a;
      H1 += b;
      H2 += c;
      H3 += d;
      H4 += e;
    }

    return [H0, H1, H2, H3, H4];
  },

  // Public API
  api = function (message, options) {
    var digestbytes = crypt.wordsToBytes(sha1(message));
    return options && options.asBytes ? digestbytes :
        options && options.asString ? bin.bytesToString(digestbytes) :
        crypt.bytesToHex(digestbytes);
  };

  api._blocksize = 16;
  api._digestsize = 20;

  module.exports = api;
})();

}).call(this,require("buffer").Buffer)

},{"buffer":27,"charenc":28,"crypt":30}]},{},[15])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtb2R1bGVzL2Fubm90YXRvci1jb25maWcuanNvbiIsIm1vZHVsZXMvYW5ub3RhdG9yL2Fubm90YXRpb24tbWFuYWdlci5qcyIsIm1vZHVsZXMvYW5ub3RhdG9yL2Fubm90YXRpb24uanMiLCJtb2R1bGVzL2Fubm90YXRvci9hbm5vdGF0b3IuanMiLCJtb2R1bGVzL2Fubm90YXRvci9jb21wb25lbnRzL2Fubm90YXRpb24tZ3VpLmpzIiwibW9kdWxlcy9hbm5vdGF0b3IvY29tcG9uZW50cy9pbmRleC1jb250YWluZXIuanMiLCJtb2R1bGVzL2Fubm90YXRvci9jb21wb25lbnRzL2luZm8tY29udGFpbmVyLmpzIiwibW9kdWxlcy9hbm5vdGF0b3IvY29tcG9uZW50cy9tZXNzYWdlLW92ZXJsYXkuanMiLCJtb2R1bGVzL2Fubm90YXRvci9jb21wb25lbnRzL3BvbHlnb24tZWRpdG9yLmpzIiwibW9kdWxlcy9hbm5vdGF0b3IvY29tcG9uZW50cy9wb2x5Z29uLW92ZXJsYXkuanMiLCJtb2R1bGVzL2Fubm90YXRvci9jb21wb25lbnRzL3RpY2stYmFyLmpzIiwibW9kdWxlcy9hbm5vdGF0b3Ivc2VydmVyLWludGVyZmFjZS5qcyIsIm1vZHVsZXMvYW5ub3RhdG9yL3Nlc3Npb24tbWFuYWdlci5qcyIsIm1vZHVsZXMvY29uZmlnLmpzb24iLCJtb2R1bGVzL21haW4uanMiLCJtb2R1bGVzL3V0aWxzL2FycmF5LWV4dGVuc2lvbnMuanMiLCJtb2R1bGVzL3V0aWxzL2pxdWVyeS1leHRlbnNpb25zLmpzIiwibW9kdWxlcy91dGlscy9wcmVmZXJlbmNlLW1hbmFnZXIuanMiLCJtb2R1bGVzL3V0aWxzL3JlcXVpcmVtZW50cy5qcyIsIm1vZHVsZXMvdXRpbHMvc3RyaW5nLWV4dGVuc2lvbnMuanMiLCJtb2R1bGVzL3V0aWxzL3RpbWUuanMiLCJtb2R1bGVzL3ZlbmRvci5qcyIsIm1vZHVsZXMvdmlkZW8tcGxheWVyL3NlZWtiYXItdG9vbHRpcC5qcyIsIm1vZHVsZXMvdmlkZW8tcGxheWVyL3ZpZGVvLXBsYXllci1iYXIuanMiLCJtb2R1bGVzL3ZpZGVvLXBsYXllci92aWRlby1wbGF5ZXIuanMiLCJub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaGFyZW5jL2NoYXJlbmMuanMiLCJub2RlX21vZHVsZXMvY2xpcC1wYXRoLXBvbHlnb24vanMvY2xpcC1wYXRoLXBvbHlnb24uanMiLCJub2RlX21vZHVsZXMvY3J5cHQvY3J5cHQuanMiLCJub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9xdGlwMi9kaXN0L2pxdWVyeS5xdGlwLmpzIiwibm9kZV9tb2R1bGVzL3NjcmVlbmZ1bGwvZGlzdC9zY3JlZW5mdWxsLmpzIiwibm9kZV9tb2R1bGVzL3NoYTEvc2hhMS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUNOQTs7Ozs7Ozs7Ozs7Ozs7SUFFTSxpQjtBQUNGLCtCQUFhO0FBQUE7O0FBQ1QsU0FBSyxXQUFMLEdBQW1CLEVBQW5CO0FBQ0g7Ozs7cUNBRWdCLEksRUFBSztBQUNsQixVQUFJLElBQUksQ0FBQyxNQUFMLElBQWUsQ0FBbkIsRUFBcUI7QUFDakIsUUFBQSxPQUFPLENBQUMsSUFBUixDQUFhLCtCQUFiO0FBQ0g7O0FBRUQsV0FBSyxXQUFMLEdBQW1CLEVBQW5COztBQUxrQixpREFNQSxJQU5BO0FBQUE7O0FBQUE7QUFNbEIsNERBQXVCO0FBQUEsY0FBZixNQUFlO0FBQ25CLGVBQUssa0JBQUwsQ0FBd0IsTUFBeEI7QUFDSDtBQVJpQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBVXJCOzs7dUNBRWtCLFUsRUFBVztBQUMxQjtBQUNBLFVBQUksSUFBSSxHQUFHLElBQUksc0JBQUosQ0FB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy81R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJtb2R1bGUuZXhwb3J0cz17XG4gICAgXCJjbGllbnRfaWRcIjogXCJzY2FsYXJcIixcbiAgICBcImNsaWVudF92ZXJcIjogXCIyLjUuMTJcIixcbiAgICBcImlkXCI6IFwic2l2YUBkYXJ0bW91dGguZWR1XCIsXG4gICAgXCJhcGlfa2V5XCI6IFwiZG8zRDQwczlhRGtnazRSZmFhRm9laWduYm1kXCIsXG4gICAgXCJ3YWxkb3JmX2F1dGhfdG9rZW5cIjogXCIxOGNhNzJiZTgyNmQwMDQzZGU5Y2U0N2M0ZDgxZjA0ZjAxYmYzOTVhXCJcbn0iLCJpbXBvcnQgeyBBbm5vdGF0aW9uIH0gZnJvbSBcIi4vYW5ub3RhdGlvbi5qc1wiO1xuXG5jbGFzcyBBbm5vdGF0aW9uTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy5hbm5vdGF0aW9ucyA9IFtdO1xuICAgIH1cblxuICAgIFBvcHVsYXRlRnJvbUpTT04oanNvbil7XG4gICAgICAgIGlmIChqc29uLmxlbmd0aCA9PSAwKXtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkpTT04gY29udGFpbnMgbm8gYW5ub3RhdGlvbnMuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hbm5vdGF0aW9ucyA9IFtdO1xuICAgICAgICBmb3IobGV0IG9iamVjdCBvZiBqc29uKXtcbiAgICAgICAgICAgIHRoaXMuUmVnaXN0ZXJBbm5vdGF0aW9uKG9iamVjdCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIFJlZ2lzdGVyQW5ub3RhdGlvbihqc29uT2JqZWN0KXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIlJlZ2lzdGVyaW5nIG5ldyBhbm5vdGF0aW9uIHdpdGggSUQgXCIgKyBqc29uT2JqZWN0LmlkKTtcbiAgICAgICAgbGV0IGFubm8gPSBuZXcgQW5ub3RhdGlvbihqc29uT2JqZWN0KTtcbiAgICAgICAgdGhpcy5hbm5vdGF0aW9ucy5wdXNoKGFubm8pO1xuICAgIH1cblxuICAgIFJlbW92ZUFubm90YXRpb24oaWQpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiUmVtb3Zpbmc6IFwiICsgaWQpO1xuICAgICAgICB0aGlzLmFubm90YXRpb25zID0gdGhpcy5hbm5vdGF0aW9ucy5maWx0ZXIoKG9iaikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG9iai5pZCAhPT0gaWQ7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSB0aGUgZ2l2ZW4gYW5ub3RhdGlvbiBpbiB0aGUgc3RvcmVkIGFycmF5XG4gICAgICovXG4gICAgVXBkYXRlQW5ub3RhdGlvbihhbm5vdGF0aW9uLCBvbGRJRCl7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJVcGRhdGluZyBhbm5vdGF0aW9uIElEIFwiICsgb2xkSUQgKyBcIiB0byBcIiArIGFubm90YXRpb24ubWV0YWRhdGEuaWQpO1xuICAgICAgICB0aGlzLlJlbW92ZUFubm90YXRpb24ob2xkSUQpO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyQW5ub3RhdGlvbihhbm5vdGF0aW9uKTtcbiAgICB9XG5cbiAgICBBbm5vdGF0aW9uc0F0VGltZSh0aW1lKXtcblxuICAgICAgICAvLyBUT0RPOiBSZWVuYWJsZSB3aXRoIHNvbWUga2luZCBvZiBmb3JjZSBwYXJhbWV0ZXJcblxuICAgICAgICAvLyAvLyBJZiB0aGUgbGFzdCB0aW1lIHJlcXVlc3RlZCBpcyBhc2tlZCBmb3IgYWdhaW4sIGp1c3QgZ2l2ZSBiYWNrIHRoZSBjYWNoZWQgcmVzdWx0XG4gICAgICAgIC8vIGlmKHRpbWVNUyA9PSB0aGlzLmxhc3RUaW1lUmVxdWVzdGVkKXtcbiAgICAgICAgLy8gICAgIC8vY29uc29sZS5sb2coXCJVc2luZyBjYWNoZVwiKTtcbiAgICAgICAgLy8gICAgIHJldHVybiB0aGlzLmNhY2hlZDtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyB0aGlzLmxhc3RUaW1lUmVxdWVzdGVkID0gdGltZU1TO1xuXG4gICAgICAgIC8vIEZpbHRlciBhbGwgbG9hZGVkIGFubm90YXRpb25zIHRoYXQgZml0IHdpdGhpbiB0aGUgcmFuZ2UgcXVlcnkuXG4gICAgICAgIGxldCBmaWx0ZXJlZCA9IHRoaXMuYW5ub3RhdGlvbnMuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uYmVnaW5UaW1lIDw9IHRpbWUgJiYgdGltZSA8PSBpdGVtLmVuZFRpbWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY2FjaGVkID0gZmlsdGVyZWQ7XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcmVkO1xuICAgIH1cblxufVxuXG5leHBvcnQgeyBBbm5vdGF0aW9uTWFuYWdlciB9OyIsIi8vLyBBIHdyYXBwZXIgZm9yIFczQyBPcGVuIEFubm90YXRpb24gSlNPTiBvYmplY3RzLlxuY2xhc3MgQW5ub3RhdGlvbiB7XG5cbiAgICBjb25zdHJ1Y3Rvcihqc29uID0gbnVsbCl7XG4gICAgICAgIHRoaXNbXCJAY29udGV4dFwiXSA9IFwiaHR0cDovL3d3dy53My5vcmcvbnMvYW5uby5qc29ubGRcIjtcbiAgICAgICAgLy8gdGhpc1tcIkBjb250ZXh0XCJdID0gW1wiaHR0cDovL3d3dy53My5vcmcvbnMvYW5uby5qc29ubGRcIixcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIFwiaHR0cDovL2lpaWYuaW8vYXBpL3ByZXNlbnRhdGlvbi8zL2NvbnRleHQuanNvblwiXTtcbiAgICAgICAgXG4gICAgICAgIHRoaXNbXCJyZXF1ZXN0XCJdID0ge1xuICAgICAgICAgICAgXCJjbGllbnRfaWRcIjogXCJzY2FsYXJcIixcbiAgICAgICAgICAgIFwiY2xpZW50X3ZlclwiOiBcIjIuNS4xMlwiLFxuICAgICAgICAgICAgXCJpdGVtc1wiOiB7XG4gICAgICAgICAgICAgICAgXCJuYXRpdmVcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIl9fQ0hFQ0tfQ09ORklHX0ZJTEVfX0lEX19cIixcbiAgICAgICAgICAgICAgICBcImFwaV9rZXlcIjogXCJfX0NIRUNLX0NPTkZJR19GSUxFX19BUElfS0VZX19cIixcbiAgICAgICAgICAgICAgICBcImFjdGlvblwiOiBcIlRPQkVGSUxMRURcIixcbiAgICAgICAgICAgICAgICBcImZvcm1hdFwiOiBcImpzb25cIlxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vVE9ETzogdmVyMlxuICAgICAgICAvLyB0aGlzW1wic2VydmljZVwiXSA9IHtcbiAgICAgICAgLy8gICAgIFwiY2xpZW50X2lkXCI6IFwic2NhbGFyXCIsXG4gICAgICAgIC8vICAgICBcImNsaWVudF92ZXJcIjogXCIyLjUuMTJcIixcbiAgICAgICAgLy8gICAgIFwiaXRlbXNcIjoge1xuICAgICAgICAvLyAgICAgICAgIFwibmF0aXZlXCI6IGZhbHNlLFxuICAgICAgICAvLyAgICAgICAgIFwiaWRcIjogXCJfX0NIRUNLX0NPTkZJR19GSUxFX19JRF9fXCIsXG4gICAgICAgIC8vICAgICAgICAgXCJhcGlfa2V5XCI6IFwiX19DSEVDS19DT05GSUdfRklMRV9fQVBJX0tFWV9fXCIsXG4gICAgICAgIC8vICAgICAgICAgXCJhY3Rpb25cIjogXCJUT0JFRklMTEVEXCIsXG4gICAgICAgIC8vICAgICAgICAgXCJmb3JtYXRcIjogXCJqc29uXCJcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfTtcbiAgICAgICAgLy90aGlzW1widHlwZVwiXSA9IFwiTWFuaWZlc3RcIjsgLy9UT0RPOiB2ZXIyXG4gICAgICAgIHRoaXNbXCJ0eXBlXCJdID0gXCJBbm5vdGF0aW9uXCI7IC8vVE9ETzogdmVyMVxuICAgICAgICB0aGlzW1wibW90aXZhdGlvblwiXSA9IFwiaGlnaGxpZ2h0aW5nXCI7XG5cbiAgICAgICAgdGhpc1tcImJvZHlcIl0gPSBbXTtcbiAgICAgICAgdGhpc1tcInRhcmdldFwiXSA9IHt9O1xuICAgICAgICAvL3RoaXNbXCJpdGVtc1wiXSA9IFtdOyAvL1RPRE86IHZlcjJcblxuICAgICAgICAvL2RlbGV0ZSB0aGlzLmJlZ2luVGltZTtcbiAgICAgICAgLy9kZWxldGUgdGhpcy5lbmRUaW1lO1xuICAgICAgICAvL2RlbGV0ZSB0aGlzLnRhZ3M7XG4gICAgICAgIHRoaXMucmVhZENvbmZpZygpO1xuXG4gICAgICAgIGlmKGpzb24pIHtcbiAgICAgICAgICAgIC8vIE1lcmdlIHRoZSBqc29uIGludG8gdGhpcyBjbGFzcy5cbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywganNvbik7XG5cbiAgICAgICAgICAgIC8vIENvbXB1dGUgcmVhZCBvbmx5IGVhc3kgYWNjZXNzIHByb3BlcnRpZXNcbiAgICAgICAgICAgIHRoaXMucmVjYWxjdWxhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgcmVhZENvbmZpZygpIHtcbiAgICAgICAgY29uc3QgY29uZmlnID0gcmVxdWlyZShcIi4uL2Fubm90YXRvci1jb25maWcuanNvblwiKTtcbiAgICAgICAgLy92ZXIxXG4gICAgICAgIHRoaXNbXCJyZXF1ZXN0XCJdW1wiY2xpZW50X2lkXCJdID0gY29uZmlnLmNsaWVudF9pZDtcbiAgICAgICAgdGhpc1tcInJlcXVlc3RcIl1bXCJjbGllbnRfdmVyXCJdID0gY29uZmlnLmNsaWVudF92ZXI7XG4gICAgICAgIHRoaXNbXCJyZXF1ZXN0XCJdW1wiaXRlbXNcIl1bXCJpZFwiXSA9IGNvbmZpZy5pZDtcbiAgICAgICAgdGhpc1tcInJlcXVlc3RcIl1bXCJpdGVtc1wiXVtcImFwaV9rZXlcIl0gPSBjb25maWcuYXBpX2tleTtcblxuICAgICAgICAvL1RPRE86IFZlcjJcbiAgICAgICAgLy8gdGhpc1tcInNlcnZpY2VcIl1bXCJjbGllbnRfaWRcIl0gPSBjb25maWcuY2xpZW50X2lkO1xuICAgICAgICAvLyB0aGlzW1wic2VydmljZVwiXVtcImNsaWVudF92ZXJcIl0gPSBjb25maWcuY2xpZW50X3ZlcjtcbiAgICAgICAgLy8gdGhpc1tcInNlcnZpY2VcIl1bXCJpdGVtc1wiXVtcImlkXCJdID0gY29uZmlnLmlkO1xuICAgICAgICAvLyB0aGlzW1wic2VydmljZVwiXVtcIml0ZW1zXCJdW1wiYXBpX2tleVwiXSA9IGNvbmZpZy5hcGlfa2V5O1xuICAgIH1cblxuICAgIC8vLyBDb21wdXRlIHJlYWQgb25seSBlYXN5IGFjY2VzcyBwcm9wZXJ0aWVzXG4gICAgcmVjYWxjdWxhdGUoKSB7XG4gICAgICAgIGxldCB0aW1lU2xpY2UgPSB0aGlzLnRhcmdldC5zZWxlY3Rvci5maWx0ZXIoaXRlbSA9PiBpdGVtLnR5cGUgPT09IFwiRnJhZ21lbnRTZWxlY3RvclwiKVswXS52YWx1ZTtcbiAgICAgICAgdGltZVNsaWNlID0gdGltZVNsaWNlLnJlcGxhY2UoXCJ0PVwiLCBcIlwiKTtcblxuICAgICAgICAvLy8gU3RhcnQgdGltZSBpbiBzZWNvbmRzXG4gICAgICAgIHRoaXMuYmVnaW5UaW1lID0gcGFyc2VGbG9hdCh0aW1lU2xpY2Uuc3BsaXQoXCIsXCIpWzBdKTtcblxuICAgICAgICAvLy8gRW5kIHRpbWUgaW4gc2Vjb25kc1xuICAgICAgICB0aGlzLmVuZFRpbWUgPSBwYXJzZUZsb2F0KHRpbWVTbGljZS5zcGxpdChcIixcIilbMV0pO1xuXG4gICAgICAgIC8vLyBFeHRyYWN0IHRhZ3MgZnJvbSBhbm5vdGF0aW9uXG4gICAgICAgIHRoaXMudGFncyA9IHRoaXMuYm9keS5maWx0ZXIoaXRlbSA9PiBpdGVtLnB1cnBvc2UgPT09IFwidGFnZ2luZ1wiKS5tYXAoaXRlbSA9PiBpdGVtLnZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXRQb2x5KCkge1xuICAgICAgICBsZXQgcG9pbnRzU2VsZWN0b3IgPSB0aGlzLnRhcmdldC5zZWxlY3Rvci5maWx0ZXIoaXRlbSA9PiBpdGVtLnR5cGUgPT09IFwiU3ZnU2VsZWN0b3JcIik7XG5cbiAgICAgICAgaWYocG9pbnRzU2VsZWN0b3IubGVuZ3RoID09IDApIHJldHVybiBudWxsO1xuXG4gICAgICAgIC8vIFBhcnNlIHRoZSBwb2ludHMgYXJyYXkgZnJvbSB0aGUgYW5ub3RhdGlvblxuICAgICAgICBsZXQgcG9pbnRzU3ZnID0gcG9pbnRzU2VsZWN0b3JbMF0udmFsdWU7XG4gICAgICAgIGxldCByZWdFeFN0cmluZyA9IG5ldyBSZWdFeHAoXCIoPzpwb2ludHM9JykoLio/KSg/OicpXCIsIFwiaWdcIik7IC8vc2V0IGlnIGZsYWcgZm9yIGdsb2JhbCBzZWFyY2ggYW5kIGNhc2UgaW5zZW5zaXRpdmVcbiAgICAgICAgXG4gICAgICAgIGxldCBwb2ludHNSRSA9IHJlZ0V4U3RyaW5nLmV4ZWMocG9pbnRzU3ZnKVsxXTtcbiAgICAgICAgbGV0IHBvaW50c0RhdGEgPSBwb2ludHNSRS50cmltKCkuc3BsaXQoXCIgXCIpLm1hcChpdGVtID0+IGl0ZW0uc3BsaXQoXCIsXCIpKTtcblxuICAgICAgICByZXR1cm4gcG9pbnRzRGF0YTtcbiAgICB9XG5cbiAgICBnZXRTVkdQb2x5UG9pbnRzKCkge1xuICAgICAgICBsZXQgcG9pbnRzU2VsZWN0b3IgPSB0aGlzLnRhcmdldC5zZWxlY3Rvci5maWx0ZXIoaXRlbSA9PiBpdGVtLnR5cGUgPT09IFwiU3ZnU2VsZWN0b3JcIik7XG5cbiAgICAgICAgaWYocG9pbnRzU2VsZWN0b3IubGVuZ3RoID09IDApIHJldHVybiBudWxsO1xuXG4gICAgICAgIC8vIFBhcnNlIHRoZSBwb2ludHMgYXJyYXkgZnJvbSB0aGUgYW5ub3RhdGlvblxuICAgICAgICBsZXQgcG9pbnRzU3ZnID0gcG9pbnRzU2VsZWN0b3JbMF0udmFsdWU7XG4gICAgICAgIGxldCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG4gICAgICAgIGxldCB4bWxEb2MgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHBvaW50c1N2ZywgXCJ0ZXh0L3htbFwiKTtcbiAgICAgICAgcmV0dXJuIFt4bWxEb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJhbmltYXRlXCIpWzBdLmdldEF0dHJpYnV0ZShcImZyb21cIiksIFxuICAgICAgICB4bWxEb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJhbmltYXRlXCIpWzBdLmdldEF0dHJpYnV0ZShcInRvXCIpXTtcbiAgICB9XG5cbn1cblxuXG5cbmV4cG9ydCB7IEFubm90YXRpb24gfTsiLCJpbXBvcnQgeyBTZXJ2ZXJJbnRlcmZhY2UgfSBmcm9tIFwiLi9zZXJ2ZXItaW50ZXJmYWNlLmpzXCI7XG5pbXBvcnQgeyBBbm5vdGF0aW9uTWFuYWdlciB9IGZyb20gXCIuL2Fubm90YXRpb24tbWFuYWdlci5qc1wiO1xuaW1wb3J0IHsgVGlja0JhciB9IGZyb20gXCIuL2NvbXBvbmVudHMvdGljay1iYXIuanNcIjtcbmltcG9ydCB7IFBvbHlnb25PdmVybGF5IH0gZnJvbSBcIi4vY29tcG9uZW50cy9wb2x5Z29uLW92ZXJsYXkuanNcIjtcbmltcG9ydCB7IHByZWZlcmVuY2VzIH0gZnJvbSBcIi4uL3V0aWxzL3ByZWZlcmVuY2UtbWFuYWdlci5qc1wiO1xuaW1wb3J0IHsgQW5ub3RhdGlvbkdVSSB9IGZyb20gXCIuL2NvbXBvbmVudHMvYW5ub3RhdGlvbi1ndWkuanNcIjtcbmltcG9ydCB7IEluZm9Db250YWluZXIgfSBmcm9tIFwiLi9jb21wb25lbnRzL2luZm8tY29udGFpbmVyLmpzXCI7XG5pbXBvcnQgeyBJbmRleENvbnRhaW5lciB9IGZyb20gXCIuL2NvbXBvbmVudHMvaW5kZXgtY29udGFpbmVyLmpzXCI7XG5pbXBvcnQgeyBTZXNzaW9uTWFuYWdlciB9IGZyb20gXCIuL3Nlc3Npb24tbWFuYWdlci5qc1wiO1xuaW1wb3J0IHsgTWVzc2FnZU92ZXJsYXkgfSBmcm9tIFwiLi9jb21wb25lbnRzL21lc3NhZ2Utb3ZlcmxheS5qc1wiO1xuaW1wb3J0IHsgQW5ub3RhdGlvbiB9IGZyb20gXCIuL2Fubm90YXRpb24uanNcIjtcbmxldCBzaGExID0gcmVxdWlyZSgnc2hhMScpO1xuXG5jbGFzcyBWaWRlb0Fubm90YXRvciB7XG4gICAgY29uc3RydWN0b3IoYXJncyl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiW1ZpZGVvQW5ub3RhdG9yXSBDcmVhdGluZyBWaWRlb0Fubm90YXRvci4uLlwiKTtcblxuICAgICAgICAvL1BhcnNlIGFyZ3VtZW50c1xuICAgICAgICAvL1RoaXMgaXMgYWN0dWFsbHkgcmVxdWlyZWRcbiAgICAgICAgaWYodHlwZW9mIGFyZ3MucGxheWVyID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQ2FsbGVkIGZvciBhIG5ldyBWaWRlb0Fubm90YXRvciB3aXRob3V0IHBhc3NpbmcgYSBwbGF5ZXIhJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wbGF5ZXIgPSAgYXJncy5wbGF5ZXI7XG4gICAgICAgIFxuXG4gICAgICAgIC8vVGhlc2UgY29uZmlnIG9wdGlvbnMgYXJlIHJlcXVpcmVkIGZvciBzYXZpbmcgYW5ub3RhdGlvbnMgdG8gYSBzZXJ2ZXJcbiAgICAgICAgdGhpcy5zZXJ2ZXJVUkwgPSB0eXBlb2YgYXJncy5zZXJ2ZXJVUkwgPT09ICd1bmRlZmluZWQnID8gJycgOiBhcmdzLnNlcnZlclVSTDtcbiAgICAgICAgdGhpcy50YWdzVVJMID0gdHlwZW9mIGFyZ3MudGFnc1VSTCA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6IGFyZ3MudGFnc1VSTDtcbiAgICAgICAgdGhpcy5hcGlLZXkgPSB0eXBlb2YgYXJncy5hcGlLZXkgPT09ICd1bmRlZmluZWQnID8gJycgOiBhcmdzLmFwaUtleTtcblxuICAgICAgICAvL0lmIGFwaUtleSBpcyBzZXQgYW5kIGNtc1VzZXJuYW1lIGFuZCBjbXNFbWFpbCBhcmUgcGFzc2VkLCB3ZSdsbCBhdXRvIGxvZ2luIGxhdGVyXG4gICAgICAgIHRoaXMuY21zVXNlcm5hbWUgPSB0eXBlb2YgYXJncy5jbXNVc2VybmFtZSA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6IGFyZ3MuY21zVXNlcm5hbWU7XG4gICAgICAgIHRoaXMuY21zRW1haWwgPSB0eXBlb2YgYXJncy5jbXNFbWFpbCA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6IGFyZ3MuY21zRW1haWw7XG5cbiAgICAgICAgLy9UaGlzIGNvbmZpZyBvcHRpb24gaXMgcmVxdWlyZWQgZm9yIHVzaW5nIGEgc3RhdGljIGFubm90YXRpb24gZmlsZVxuICAgICAgICB0aGlzLmxvY2FsVVJMID0gdHlwZW9mIGFyZ3MubG9jYWxVUkwgPT09ICd1bmRlZmluZWQnID8gJycgOiBhcmdzLmxvY2FsVVJMO1xuXG4gICAgICAgIC8vT3B0aW9uYWwgcGFyYW1zXG4gICAgICAgIC8vUmVtb3ZlcyB0aGUgZWRpdGluZyBpbnRlcmZhY2VcbiAgICAgICAgdGhpcy5raW9za01vZGUgPSB0eXBlb2YgYXJncy5raW9za01vZGUgPT09ICd1bmRlZmluZWQnID8gJycgOiBhcmdzLmtpb3NrTW9kZTtcbiAgICAgICAgLy9TaG93cyB0aGUgJ29wZW4gbWFuaWZlc3QnIGJ1dHRvbiBpZiBraW9za01vZGUgaXMgb2ZmXG4gICAgICAgIHRoaXMuc2hvd01hbmlmZXN0ID0gdHlwZW9mIGFyZ3Muc2hvd01hbmlmZXN0ID09PSAndW5kZWZpbmVkJyA/IGZhbHNlIDogYXJncy5zaG93TWFuaWZlc3Q7ICAgICAgICBcbiAgICAgICAgLy9BbGxvd3MgcGFzc2luZyBpbiBhIGZ1bmN0aW9uIHRoYXQgb3ZlcnJpZGVzIHRoZSBkZWZhdWx0IGFubm90YXRpb24gcmVuZGVyZXJcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IHR5cGVvZiBhcmdzLnJlbmRlcmVyID09PSAndW5kZWZpbmVkJyA/IGZhbHNlIDogYXJncy5yZW5kZXJlcjtcbiAgICAgICAgLy9BbGxvd3MgcGFzc2luZyBpbiBhIGZ1bmN0aW9uIHRoYXQgb3ZlcnJpZGVzIHRoZSBkZWZhdWx0IGFubm90YXRpb24gcmVuZGVyZXJcbiAgICAgICAgdGhpcy51bnJlbmRlcmVyID0gdHlwZW9mIGFyZ3MudW5yZW5kZXJlciA9PT0gJ3VuZGVmaW5lZCcgPyBmYWxzZSA6IGFyZ3MudW5yZW5kZXJlcjtcbiAgICAgICAgLy9EZXRlcm1pbmVzIHdoZXRoZXIgb3Igbm90IHRoZSBhbm5vdGF0aW9uIGNvbnRhaW5lciBpcyBjbGVhcmVkIGV2ZXJ5IHRpbWUgaXQgdXBkYXRlc1xuICAgICAgICB0aGlzLmNsZWFyQ29udGFpbmVyID0gdHlwZW9mIGFyZ3MuY2xlYXJDb250YWluZXIgPT09ICd1bmRlZmluZWQnID8gdHJ1ZSA6IGFyZ3MuY2xlYXJDb250YWluZXI7XG4gICAgICAgIC8vRGV0ZXJtaW5lcyB3aGV0aGVyIG9yIG5vdCB0byBjcmVhdGUgYSBuYXZpZ2FibGUgaW5kZXggb2YgYW5ub3RhdGlvbnNcbiAgICAgICAgdGhpcy5kaXNwbGF5SW5kZXggPSB0eXBlb2YgYXJncy5kaXNwbGF5SW5kZXggPT09ICd1bmRlZmluZWQnID8gZmFsc2UgOiBhcmdzLmRpc3BsYXlJbmRleDsgICBcbiAgICAgICAgXG4gICAgICAgIC8vRGV0ZXJtaW5lIHRoZSBsYW5ndWFnZSBvZiB0aGUgYW5ub3RhdGlvblxuICAgICAgICB0aGlzLm9ub215TGFuZ3VhZ2UgPSB0eXBlb2YgYXJncy5vbm9teUxhbmd1YWdlID09PSAndW5kZWZpbmVkJyA/ICcnIDogYXJncy5vbm9teUxhbmd1YWdlO1xuXG5cblxuICAgICAgICAvL2xvY2FsVVJMIGltcGxpZXMga2lvc2sgbW9kZVxuICAgICAgICBpZih0aGlzLmxvY2FsVVJMICE9ICcnKSB0aGlzLmtpb3NrTW9kZSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5XcmFwKCk7XG4gICAgICAgIHRoaXMuUG9wdWxhdGVDb250cm9scygpO1xuXG4gICAgICAgIC8vbWF5IG5lZWQgdG8gbW92ZSB0aGlzIGJlbG93IHRoZSB0aGlzLnNlcnZlciBibG9jayBsYXRlcj9cbiAgICAgICAgdGhpcy5tZXNzYWdlT3ZlcmxheSA9IG5ldyBNZXNzYWdlT3ZlcmxheSh0aGlzKTtcbiAgICAgICAgdGhpcy5hbm5vdGF0aW9uTWFuYWdlciA9IG5ldyBBbm5vdGF0aW9uTWFuYWdlcigpO1xuICAgICAgICB0aGlzLnNlc3Npb25NYW5hZ2VyID0gbmV3IFNlc3Npb25NYW5hZ2VyKHRoaXMpO1xuXG4gICAgICAgIC8vbG9jYWxVUkwgdGFrZXMgcHJlY2VuZGVuY2UgLSBpZiBpdCBpcyBhbnl0aGluZyBidXQgJycgdGhlbiBkbyBub3QgbG9hZCBmcm9tIHNlcnZlclxuICAgICAgICBpZih0aGlzLmxvY2FsVVJMID09ICcnKXtcbiAgICAgICAgICAgIHRoaXMuc2VydmVyID0gbmV3IFNlcnZlckludGVyZmFjZSh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuc2VydmVyLlNldEJhc2VVUkwodGhpcy5zZXJ2ZXJVUkwpO1xuXG4gICAgICAgICAgICAvLyBMb2FkIGFubm90YXRpb25zIGZyb20gc2VydmVyIGJhc2VkIG9uIHRoZSBwbGF5ZXIncyB2aWRlbyBVUkxcbiAgICAgICAgICAgIHRoaXMuc2VydmVyLkZldGNoQW5ub3RhdGlvbnMoJ2xvY2F0aW9uJywgdGhpcy5wbGF5ZXIudmlkZW9FbGVtZW50LmN1cnJlbnRTcmMpXG4gICAgICAgICAgICAuZG9uZSgoanNvbik9PntcbiAgICAgICAgICAgIFx0Ly9qc29uLnNoaWZ0KCkgIC8vIEFzc3VtZSBmaXJzdCBub2RlIGlzIGEgY29udGVudCBub2RlXG4gICAgICAgICAgICBcdGZvciAodmFyIGogPSBqc29uLmxlbmd0aC0xOyBqID49IDA7IGotLSkge1xuICAgICAgICAgICAgICAgICAgICBpZihqc29uW2pdLnR5cGUgIT0gXCJBbm5vdGF0aW9uXCIpe1xuICAgICAgICAgICAgICAgICAgICAgICAganNvbi5zcGxpY2UoaiwxKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFx0XHQgICAgZm9yICh2YXIgayA9IDA7IGsgPCBqc29uW2pdLnRhcmdldC5zZWxlY3Rvci5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgXHRcdFx0ICAgIGlmICgnRnJhZ21lbnRTZWxlY3RvcicgIT0ganNvbltqXS50YXJnZXQuc2VsZWN0b3Jba10udHlwZSkgY29udGludWU7XG4gICAgICAgICAgICBcdFx0XHQgICAganNvbltqXS50YXJnZXQuc2VsZWN0b3Jba10udmFsdWUgPSBqc29uW2pdLnRhcmdldC5zZWxlY3RvcltrXS52YWx1ZS5yZXBsYWNlKCcjdD1ucHQ6JywndD0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXHR9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmFubm90YXRpb25NYW5hZ2VyLlBvcHVsYXRlRnJvbUpTT04oanNvbik7XG4gICAgICAgICAgICAgICAgdGhpcy5Bbm5vdGF0aW9uc0xvYWRlZCgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vYXV0by1sb2dpbiBpZiBub3QgaW4ga2lvc2sgbW9kZSwgYW5kIHdlIGhhdmUgdGhlIGNtcyB2YXJpYWJsZXMgYW5kIEFQSSBrZXlcbiAgICAgICAgICAgIGlmKCF0aGlzLmtpb3NrTW9kZSl7XG4gICAgICAgICAgICAgICAgaWYodGhpcy5hcGlLZXkgJiYgdGhpcy5jbXNFbWFpbCAmJiB0aGlzLmNtc1VzZXJuYW1lKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXJ2ZXIuTG9nT3V0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VydmVyLkxvZ0luKHRoaXMuY21zVXNlcm5hbWUsIHNoYTEodGhpcy5jbXNFbWFpbCkpLmRvbmUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJbTWFpbl0gQ01TIGxvZ2luIHN1Y2Nlc3NcIik7XG4gICAgICAgICAgICAgICAgICAgIH0pLmZhaWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJbTWFpbl0gQ01TIGxvZ2luIGZhaWxlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnTG9hZGluZyBsb2NhbCBjYWNoZSBmaWxlOiAnICsgdGhpcy5sb2NhbFVSTCk7XG4gICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHVybDogdGhpcy5sb2NhbFVSTCxcbiAgICAgICAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgICAgICBhc3luYzogdHJ1ZVxuICAgICAgICAgICAgfSkuZG9uZSgoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBGZXRjaGVkICR7ZGF0YS5sZW5ndGh9IGFubm90YXRpb25zIGZyb20gbG9jYWwgY2FjaGUuYCk7XG4gICAgICAgICAgICAgICAgdmFyIGpzb24gPSBkYXRhO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSBqc29uLmxlbmd0aC0xOyBqID49IDA7IGotLSkge1xuICAgICAgICAgICAgICAgICAgICBpZihqc29uW2pdLnR5cGUgIT0gXCJBbm5vdGF0aW9uXCIpe1xuICAgICAgICAgICAgICAgICAgICAgICAganNvbi5zcGxpY2UoaiwxKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFx0XHQgICAgZm9yICh2YXIgayA9IDA7IGsgPCBqc29uW2pdLnRhcmdldC5zZWxlY3Rvci5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgXHRcdFx0ICAgIGlmICgnRnJhZ21lbnRTZWxlY3RvcicgIT0ganNvbltqXS50YXJnZXQuc2VsZWN0b3Jba10udHlwZSkgY29udGludWU7XG4gICAgICAgICAgICBcdFx0XHQgICAganNvbltqXS50YXJnZXQuc2VsZWN0b3Jba10udmFsdWUgPSBqc29uW2pdLnRhcmdldC5zZWxlY3RvcltrXS52YWx1ZS5yZXBsYWNlKCcjdD1ucHQ6JywndD0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXHR9XG4gICAgICAgICAgICAgICAgdGhpcy5hbm5vdGF0aW9uTWFuYWdlci5Qb3B1bGF0ZUZyb21KU09OKGRhdGEpO1xuICAgICAgICAgICAgICAgIHRoaXMuQW5ub3RhdGlvbnNMb2FkZWQoKTtcbiAgICAgICAgICAgIH0pLmZhaWwoKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGZldGNoaW5nIGFubm90YXRpb25zIGZyb20gbG9jYWwgY2FjaGVcIlxcbiR7cmVzcG9uc2UucmVzcG9uc2VKU09OLmRldGFpbH0uYCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IubWVzc2FnZU92ZXJsYXkuU2hvd0Vycm9yKGBDb3VsZCBub3QgcmV0cmlldmUgYW5ub3RhdGlvbnMhPGJyPigke3Jlc3BvbnNlLnJlc3BvbnNlSlNPTi5kZXRhaWx9KWApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBsYXllci4kY29udGFpbmVyLm9uKFwiT25UaW1lVXBkYXRlXCIsIChldmVudCwgdGltZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5PblRpbWVVcGRhdGUodGltZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci5vbihcIk9uUG9seUNsaWNrZWRcIiwgKGV2ZW50LCBhbm5vdGF0aW9uKSA9PiB7XG4gICAgICAgICAgICAvLyBFZGl0IGEgcG9seSB3aGVuIGNsaWNrZWQsIGJ1dCBvbmx5IGlmIHRoZSBlZGl0b3IgaXNuJ3QgYWxyZWFkeSBvcGVuXG4gICAgICAgICAgICBpZighdGhpcy5ndWkub3Blbil7XG4gICAgICAgICAgICAgICAgdGhpcy4kYWRkQW5ub3RhdGlvbkJ1dHRvbi5idXR0b24oXCJkaXNhYmxlXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3VpLkJlZ2luRWRpdGluZyhhbm5vdGF0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy4kY29udGFpbmVyLm9uKFwiT25Qb2x5Z29uQ2xpY2tlZFwiLCAoZXZlbnQsIGFubm90YXRpb24pID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiT25Qb2x5Z29uQ2xpY2tlZCBldmVudCBjYXB0dXJlZFwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy4kY29udGFpbmVyLm9uKFwiT25BbmltYXRpb25DbGlja2VkXCIsIChldmVudCwgYW5ub3RhdGlvbikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPbkFuaW1hdGlvbkNsaWNrZWQgZXZlbnQgY2FwdHVyZWRcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZ3VpLiRjb250YWluZXIub24oXCJPbkdVSUNsb3NlZFwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuJGFkZEFubm90YXRpb25CdXR0b24uYnV0dG9uKFwiZW5hYmxlXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnVybCA9IHRoaXMucGxheWVyLnZpZGVvRWxlbWVudC5jdXJyZW50U3JjO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiW1ZpZGVvQW5ub3RhdG9yXSBBbm5vdGF0b3IgY3JlYXRlZCBmb3IgdmlkZW8uXCIpO1xuICAgIH1cblxuXG4gICAgcmVhZENvbmZpZygpIHtcbiAgICAgICAgY29uc3QgY29uZmlnID0gcmVxdWlyZShcIi4uL2Fubm90YXRvci1jb25maWcuanNvblwiKTsgXG4gICAgICAgIHRoaXMuYXBpS2V5ID0gY29uZmlnLmFwaV9rZXk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIGRpdnMgdGhhdCBzdXJyb3VuZCB0aGUgdmlkZW8gcGxheWVyLlxuICAgICAqL1xuICAgIFdyYXAoKXtcbiAgICAgICAgLy8gV3JhcCB0aGUgdmlkZW8gcGxheWVyIHdpdGggdGhpcyBjb250YWluZXIuIENhbid0IHVzZSAud3JhcCBkdWUgdG8gZHVwbGljYXRpb24gaXNzdWVzICAgIFxuICAgICAgICB2YXIgdmlkZW9Db250YWluZXIgPSAkKHRoaXMucGxheWVyLiRjb250YWluZXIpLnBhcmVudCgpO1xuICAgICAgICB2YXIgd2FsZG9yZkNvbnRhaW5lciA9ICQoXCI8ZGl2IGNsYXNzPSd3YWxkb3JmLWNvbnRhaW5lcic+PC9kaXY+XCIpO1xuICAgICAgICB3YWxkb3JmQ29udGFpbmVyLmluc2VydEJlZm9yZSgkKHRoaXMucGxheWVyLiRjb250YWluZXIpKTtcbiAgICAgICAgd2FsZG9yZkNvbnRhaW5lci5hcHBlbmQodGhpcy5wbGF5ZXIuJGNvbnRhaW5lcik7XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lciA9IHZpZGVvQ29udGFpbmVyLnBhcmVudCgpO1xuXG4gICAgICAgIC8vIFNldCB0aGUgY29udGFpbmVyIHRvIHRoZSB3aWR0aCBvZiB0aGUgdmlkZW8gcGxheWVyXG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci53aWR0aCh0aGlzLnBsYXllci4kY29udGFpbmVyLndpZHRoKCkpO1xuXG4gICAgICAgIC8vIEFsbG93IHRoZSB2aWRlbyBwbGF5ZXIgY29udGFpbmVyIHRvIGdyb3dcbiAgICAgICAgLy90aGlzLnBsYXllci4kY29udGFpbmVyLndpZHRoKFwiMTAwJVwiKTtcbiAgICAgICAgLy90aGlzLnBsYXllci4kY29udGFpbmVyLmhlaWdodChcIjEwMCVcIik7XG5cbiAgICAgICAgLy8gQ29weSB0aGUgdmlkZW8gc3R5bGVzIHRvIHRoZSBjb250YWluZXJcbiAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5wbGF5ZXIub3JpZ2luYWxTdHlsZXMpO1xuICAgICAgICB0aGlzLiRjb250YWluZXIuY3NzKHRoaXMucGxheWVyLm9yaWdpbmFsU3R5bGVzKTtcbiAgICB9XG5cbiAgICBQb3B1bGF0ZUNvbnRyb2xzKCl7XG4gICAgICAgIC8vIENyZWF0ZSB0aGUgdGljayBiYXJcbiAgICAgICAgdGhpcy50aWNrQmFyID0gbmV3IFRpY2tCYXIodGhpcyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBwb2x5Z29uIG92ZXJsYXlcbiAgICAgICAgdGhpcy5wb2x5T3ZlcmxheSA9IG5ldyBQb2x5Z29uT3ZlcmxheSh0aGlzKTtcblxuICAgICAgICBpZighdGhpcy5raW9za01vZGUgJiYgdGhpcy5zaG93TWFuaWZlc3Qpe1xuICAgICAgICAgICAgdGhpcy4kZGVidWdDb250cm9scyA9ICQoXCI8ZGl2IGNsYXNzPSd3YWxkb3JmLWRlYnVnLWNvbnRyb2xzJz48L2Rpdj5cIikuYXBwZW5kVG8odGhpcy4kY29udGFpbmVyKTtcbiAgICAgICAgICAgIHZhciAkc2hvd0FsbEFubm90YXRpb25zQnV0dG9uID0gdGhpcy4kZGVidWdDb250cm9scy5hcHBlbmQoJzxidXR0b24+T3BlbiBBbm5vdGF0aW9uIE1hbmlmZXN0IGluIE5ldyBXaW5kb3c8L2J1dHRvbj4nKTtcbiAgICAgICAgICAgICRzaG93QWxsQW5ub3RhdGlvbnNCdXR0b24uY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB1cmwgPSB0aGlzLnBsYXllci52aWRlb0VsZW1lbnQuY3VycmVudFNyYztcbiAgICAgICAgICAgICAgICB0aGlzLnNlcnZlci5GZXRjaEFubm90YXRpb25zKFwibG9jYXRpb25cIiwgdXJsKS5kb25lKChqc29uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB3aW4gPSB3aW5kb3cub3BlbigpO1xuICAgICAgICAgICAgICAgICAgICBpZih3aW4gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJDb3VsZG4ndCBzaG93IGFubm90YXRpb24gbWFuaWZlc3Q7IHBsZWFzZSBhbGxvdyBwb3AtdXBzLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZU92ZXJsYXkuU2hvd0Vycm9yKFwiQ291bGRuJ3Qgc2hvdyBhbm5vdGF0aW9uIG1hbmlmZXN0OyBwbGVhc2UgYWxsb3cgcG9wLXVwcy5cIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW4uZG9jdW1lbnQub3BlbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luLmRvY3VtZW50LndyaXRlKGA8dGl0bGU+QW5ub3RhdGlvbiBNYW5pZmVzdCBmb3IgJHt1cmx9PC90aXRsZT5gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbi5kb2N1bWVudC53cml0ZShcIjxwcmU+XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luLmRvY3VtZW50LndyaXRlKEpTT04uc3RyaW5naWZ5KGpzb24sIG51bGwsIDIpLmVzY2FwZUhUTUwoKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbi5kb2N1bWVudC53cml0ZShcIjwvcHJlPlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbi5kb2N1bWVudC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdyYXAgYWxsIHRoZSBidXR0b25zIHdpdGggdGhlIGxpc3QgdGFnXG4gICAgICAgIC8vdGhpcy4kZGVidWdDb250cm9scy53cmFwSW5uZXIoXCI8dWw+PC91bD5cIik7XG4gICAgICAgIC8vIFdyYXAgZWFjaCBidXR0b24gd2l0aCB0aGUgbGlzdCBlbGVtZW50IHRhZ1xuICAgICAgICAvL3RoaXMuJGRlYnVnQ29udHJvbHMuZmluZChcImJ1dHRvblwiKS53cmFwKFwiPGxpPjwvbGk+XCIpO1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgaW5mbyBjb250YWluZXJcbiAgICAgICAgdGhpcy5pbmZvQ29udGFpbmVyID0gbmV3IEluZm9Db250YWluZXIodGhpcyk7XG5cbiAgICAgICAgaWYodGhpcy5kaXNwbGF5SW5kZXgpIHRoaXMuaW5kZXhDb250YWluZXIgPSBuZXcgSW5kZXhDb250YWluZXIodGhpcyk7XG5cbiAgICAgICAgLy8gSW5qZWN0IHRoZSBhbm5vdGF0aW9uIGVkaXQgYnV0dG9uIGludG8gdGhlIHRvb2xiYXJcbiAgICAgICAgaWYoIXRoaXMua2lvc2tNb2RlKXtcbiAgICAgICAgICAgIHRoaXMuJGFkZEFubm90YXRpb25CdXR0b24gPSAkKFwiPGJ1dHRvbj5BZGQgTmV3IEFubm90YXRpb248L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgICAgICBpY29uOiBcImZhIGZhLXBsdXNcIixcbiAgICAgICAgICAgICAgICBzaG93TGFiZWw6IGZhbHNlXG4gICAgICAgICAgICB9KS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy4kYWRkQW5ub3RhdGlvbkJ1dHRvbi5idXR0b24oXCJkaXNhYmxlXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3VpLkJlZ2luRWRpdGluZygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnBsYXllci5jb250cm9sQmFyLlJlZ2lzdGVyRWxlbWVudCh0aGlzLiRhZGRBbm5vdGF0aW9uQnV0dG9uLCAzLCAnZmxleC1lbmQnKTtcblxuICAgICAgICAgICAgLy8gSW5qZWN0IHRoZSBhbm5vdGF0aW9uIHVwbG9hZCBidXR0b24gaW50byB0aGUgdG9vbGJhclxuICAgICAgICAgICAgdGhpcy4kdXBsb2FkQW5ub3RhdGlvbkJ1dHRvbiA9ICQoXCI8YnV0dG9uIHR5cGU9J2ZpbGUnPkltcG9ydCBBbm5vdGF0aW9uIEZyb20gRmlsZTwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgICAgIGljb246IFwiZmEgZmEtdXBsb2FkXCIsXG4gICAgICAgICAgICAgICAgc2hvd0xhYmVsOiBmYWxzZVxuICAgICAgICAgICAgfSkuY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuTG9hZEZyb21GaWxlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmNvbnRyb2xCYXIuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJHVwbG9hZEFubm90YXRpb25CdXR0b24sIDIsICdmbGV4LWVuZCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3VpID0gbmV3IEFubm90YXRpb25HVUkodGhpcyk7XG5cbiAgICB9XG5cbiAgICBBbm5vdGF0aW9uc0xvYWRlZCgpe1xuICAgICAgICAvL1NlbmQgYW5ub3RhdGlvbiBsb2FkZWQgZXZlbnRcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLnRyaWdnZXIoXCJPbkFubm90YXRpb25zTG9hZGVkXCIsIHRoaXMuYW5ub3RhdGlvbk1hbmFnZXIpO1xuICAgIH1cblxuICAgIE9uVGltZVVwZGF0ZSh0aW1lKXtcbiAgICAgICAgdGhpcy5hbm5vdGF0aW9uc05vdyA9IHRoaXMuYW5ub3RhdGlvbk1hbmFnZXIuQW5ub3RhdGlvbnNBdFRpbWUodGltZSk7XG5cbiAgICAgICAgaWYodGhpcy5hbm5vdGF0aW9uc05vdy5lcXVhbHModGhpcy5sYXN0QW5ub3RhdGlvblNldCkpeyAgXG4gICAgICAgICAgICB0aGlzLlNldEFubm90YXRpb25UaW1lUG9zaXRpb24odGltZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gXG4gICAgICAgIHRoaXMubGFzdEFubm90YXRpb25TZXQgPSB0aGlzLmFubm90YXRpb25zTm93O1xuXG4gICAgICAgIHRoaXMuVXBkYXRlVmlld3MoKTtcbiAgICB9XG5cbiAgICBTZXRBbm5vdGF0aW9uVGltZVBvc2l0aW9uKHRpbWUpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwidGltZTogXCIgKyB0aW1lKTtcbiAgICAgICAgLy9DaGVjayBzYWZhcmkgYW5kIG11bHRpcGxlIGdlb21ldHJpYyBhbm5vdGF0aW9uXG4gICAgICAgIGlmICh0aGlzLklzU2FmYXJpKCkgJiYgdGhpcy5hbm5vdGF0aW9uc05vdy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBsZXQgbXNnID0gXCJNdWx0aXBsZSBnZW9tZXRyaWMgYW5ub3RhdGlvbnMgYXJlIGRldGVjdGVkLjxicj5cIjtcbiAgICAgICAgICAgIG1zZyArPSBcIlNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgbXVsdGlwbGUgZ2VvbWV0cmljIGFubm90YXRpb25zLjxicj5cIjtcbiAgICAgICAgICAgIG1zZyArPSBcIkNocm9tZSBvciBGaXJlZm94IGFyZSByZWNvbW1lbmRlZC5cIjtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZU92ZXJsYXkuU2hvd01lc3NhZ2UobXNnLCAyLjApO1xuICAgICAgICAgICAgcmV0dXJuOyAvL25vIGFuaW1hdGlvbiBmb3Igc2FmYXJpIGJyb3dzZXIgd2l0aCBtdWx0aXBsZSBnZW9tZXRyaWMgYW5ub3RhdGlvblxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmFubm90YXRpb25zTm93Lmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgbGV0IGFubm90YXRpb25faWQgPSB0aGlzLmFubm90YXRpb25zTm93W2ldLmlkO1xuICAgICAgICAgICAgaWYgKHRoaXMucG9seU92ZXJsYXkuc3ZnRWxlbWVudHNIYXNoW2Fubm90YXRpb25faWRdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb2x5T3ZlcmxheS5zdmdFbGVtZW50c0hhc2hbYW5ub3RhdGlvbl9pZF0uYW5pbWF0ZS5iZWdpbkVsZW1lbnQoKTtcbiAgICAgICAgICAgICAgICBsZXQgdGltZV9kaWZmID0gdGltZSAtIHRoaXMuYW5ub3RhdGlvbnNOb3dbaV0uYmVnaW5UaW1lO1xuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50X3RpbWUgPSB0aGlzLnBvbHlPdmVybGF5LnN2Z0VsZW1lbnRzSGFzaFthbm5vdGF0aW9uX2lkXS5zdmdFbGVtZW50LmdldEN1cnJlbnRUaW1lKCk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIlxcdCBpOlwiICsgaSArIFwiIChcIiArIGFubm90YXRpb25faWQgKyBcIiksIHN2ZyBjdXJyZW50X3RpbWU6XCIgKyBjdXJyZW50X3RpbWUgKyBcIiwgYW5pbWF0ZSB0aW1lX2RpZmY6IFwiICsgdGltZV9kaWZmKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBvbHlPdmVybGF5LnN2Z0VsZW1lbnRzSGFzaFthbm5vdGF0aW9uX2lkXS5zdmdFbGVtZW50LnNldEN1cnJlbnRUaW1lKGN1cnJlbnRfdGltZSArIHRpbWVfZGlmZik7XG4gICAgICAgICAgICAgICAgdGhpcy5wb2x5T3ZlcmxheS5zdmdFbGVtZW50c0hhc2hbYW5ub3RhdGlvbl9pZF0uYW5pbWF0ZS5lbmRFbGVtZW50KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuXG4gICAgVXBkYXRlVmlld3MoKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcImFubm90YXRvci5qczoyNjcgVXBkYXRlVmlld3NcIik7XG4gICAgICAgIHRoaXMuYW5ub3RhdGlvbnNOb3cgPSB0aGlzLmFubm90YXRpb25NYW5hZ2VyLkFubm90YXRpb25zQXRUaW1lKHRoaXMucGxheWVyLnZpZGVvRWxlbWVudC5jdXJyZW50VGltZSk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBpbmZvIGNvbnRhaW5lclxuICAgICAgICB0aGlzLmluZm9Db250YWluZXIuUmVidWlsZCh0aGlzLmFubm90YXRpb25zTm93LCB0aGlzLmNsZWFyQ29udGFpbmVyKTtcblxuICAgICAgICB0aGlzLiRjb250YWluZXIudHJpZ2dlcihcIk9uTmV3QW5ub3RhdGlvblNldFwiLCBbdGhpcy5hbm5vdGF0aW9uc05vd10pO1xuICAgICAgICB0aGlzLlNldEFubm90YXRpb25UaW1lUG9zaXRpb24odGhpcy5wbGF5ZXIudmlkZW9FbGVtZW50LmN1cnJlbnRUaW1lKTtcbiAgICB9XG5cbiAgICBHZXRBbm5vdGF0aW9ucygpe1xuICAgICAgICBsZXQgb3JkZXJlZCA9IHRoaXMuYW5ub3RhdGlvbk1hbmFnZXIuYW5ub3RhdGlvbnMuc2xpY2UoKTtcbiAgICAgICAgbGV0IG9yZGVyQnlTdGFydCA9IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICAgICAgbGV0IGFUaW1lID0gYS5iZWdpblRpbWU7XG4gICAgICAgICAgICBsZXQgYlRpbWUgPSBiLmJlZ2luVGltZTtcbiAgICAgICAgICAgIHJldHVybiAoKGFUaW1lIDwgYlRpbWUpID8gLTEgOiAoKGFUaW1lID4gYlRpbWUpID8gMSA6IDApKTtcbiAgICAgICAgfVxuICAgICAgICBvcmRlcmVkLnNvcnQob3JkZXJCeVN0YXJ0KTtcbiAgICAgICAgcmV0dXJuIG9yZGVyZWQ7XG4gICAgfVxuXG4gICAgUmVnaXN0ZXJOZXdBbm5vdGF0aW9uKGFubm90YXRpb24pe1xuICAgICAgICAvL2NvbnNvbGUubG9nKGFubm90YXRpb24pO1xuICAgICAgICB0aGlzLmFubm90YXRpb25NYW5hZ2VyLlJlZ2lzdGVyQW5ub3RhdGlvbihhbm5vdGF0aW9uKTtcblxuICAgICAgICAvLyBUaHJvdyBldmVudCBmb3IgbGlzdGVuaW5nIG9iamVjdHMgKGUuZy4gdGljay1iYXIpXG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci50cmlnZ2VyKFwiT25Bbm5vdGF0aW9uUmVnaXN0ZXJlZFwiLCBbYW5ub3RhdGlvbl0pO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBkZXBlbmRlbnQgdmlld3NcbiAgICAgICAgdGhpcy5VcGRhdGVWaWV3cygpO1xuICAgIH1cblxuICAgIFVwZGF0ZUFubm90YXRpb24oYW5ub3RhdGlvbiwgb2xkSUQpe1xuICAgICAgICB0aGlzLmFubm90YXRpb25NYW5hZ2VyLlVwZGF0ZUFubm90YXRpb24oYW5ub3RhdGlvbiwgb2xkSUQpO1xuXG4gICAgICAgIC8vIFRocm93IGV2ZW50IGZvciBsaXN0ZW5pbmcgb2JqZWN0cyAoZS5nLiB0aWNrLWJhcilcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLnRyaWdnZXIoXCJPbkFubm90YXRpb25SZW1vdmVkXCIsIFtvbGRJRF0pO1xuICAgICAgICB0aGlzLiRjb250YWluZXIudHJpZ2dlcihcIk9uQW5ub3RhdGlvblJlZ2lzdGVyZWRcIiwgW2Fubm90YXRpb25dKTtcblxuICAgICAgICAvLyBVcGRhdGUgZGVwZW5kZW50IHZpZXdzXG4gICAgICAgIHRoaXMuVXBkYXRlVmlld3MoKTtcbiAgICB9XG5cbiAgICBEZXJlZ2lzdGVyQW5ub3RhdGlvbihhbm5vdGF0aW9uKXtcbiAgICAgICAgdGhpcy5hbm5vdGF0aW9uTWFuYWdlci5SZW1vdmVBbm5vdGF0aW9uKGFubm90YXRpb24uaWQpO1xuICAgICAgICAvL3RoaXMuYW5ub3RhdGlvbnNOb3cgPSB0aGlzLmFubm90YXRpb25NYW5hZ2VyLkFubm90YXRpb25zQXRUaW1lKHRoaXMucGxheWVyLnZpZGVvRWxlbWVudC5jdXJyZW50VGltZSk7XG5cbiAgICAgICAgLy8gVGhyb3cgZXZlbnQgZm9yIGxpc3RlbmluZyBvYmplY3RzIChlLmcuIHRpY2stYmFyKVxuICAgICAgICB0aGlzLiRjb250YWluZXIudHJpZ2dlcihcIk9uQW5ub3RhdGlvblJlbW92ZWRcIiwgW2Fubm90YXRpb24uaWRdKTtcblxuICAgICAgICAvLyBVcGRhdGUgZGVwZW5kZW50IHZpZXdzXG4gICAgICAgIHRoaXMuVXBkYXRlVmlld3MoKTtcblxuICAgIH1cblxuICAgIExvYWRGcm9tRmlsZSgpIHtcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBkaWFsb2dcbiAgICAgICAgbGV0ICRjb250YWluZXIgPSAkKFwiPGRpdiBjbGFzcz0nd2FsZG9yZi1zZXNzaW9uLW1vZGFsJyB0aXRsZT0nSW1wb3J0IEFubm90YXRpb24nPjwvZGl2PlwiKTsgLy8gT3V0ZXJtb3N0IEhUTUxcbiAgICAgICAgbGV0ICRoZWFkVGV4dCA9ICQoXCI8cCBjbGFzcz0ndmFsaWRhdGVUaXBzJz5Bbm5vdGF0aW9ucyBtdXN0IGJlIFczQyBPQSBjb21wbGlhbnQgaW4gSlNPTiBmb3JtYXQuPC9wPlwiKS5hcHBlbmRUbygkY29udGFpbmVyKTtcbiAgICAgICAgbGV0ICRlcnJvclRleHQgPSAkKFwiPHAgY2xhc3M9J3ZhbGlkYXRlVGlwcyBtb2RhbC1lcnJvci10ZXh0Jz48L3A+XCIpLmFwcGVuZFRvKCRjb250YWluZXIpO1xuICAgICAgICAkZXJyb3JUZXh0LmhpZGUoKTtcbiAgICAgICAgbGV0ICRmb3JtID0gJChcIjxmb3JtPjwvZm9ybT5cIikuYXBwZW5kVG8oJGNvbnRhaW5lcik7XG5cbiAgICAgICAgbGV0ICRpbXBvcnRGaWVsZDtcblxuICAgICAgICAkKFwiPGxhYmVsIGZvcj0naW1wb3J0RmlsZSc+U2VsZWN0IEZpbGU8L2xhYmVsPlwiKS5hcHBlbmRUbygkZm9ybSk7XG4gICAgICAgICRpbXBvcnRGaWVsZCA9ICQoXCI8aW5wdXQgdHlwZT0nZmlsZScgbmFtZT0naW1wb3J0RmlsZScgY2xhc3M9J2ZpbGUgdWktd2lkZ2V0LWNvbnRlbnQgdWktY29ybmVyLWFsbCc+XCIpLmFwcGVuZFRvKCRmb3JtKTtcbiAgICAgICAgXG4gICAgICAgICRmb3JtLndyYXBJbm5lcihcIjxmaWVsZHNldCAvPlwiKTtcblxuICAgICAgICBsZXQgZXJyb3IgPSAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcbiAgICAgICAgICAgICRlcnJvclRleHQuaHRtbChtZXNzYWdlKTtcbiAgICAgICAgICAgICRlcnJvclRleHQuc2hvdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICAkaW1wb3J0RmllbGQub24oJ2NoYW5nZScsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBmaWxlcyA9ICRpbXBvcnRGaWVsZC5nZXQoMCkuZmlsZXM7XG4gICAgICAgICAgICBsZXQgZnIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG4gICAgICAgICAgICBmci5vbmxvYWQgPSAoKGxvY2FsRmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBKU09OIGlzIG1hbGZvcm1lZCwgc2hvdyBhbiBlcnJvciBhbmQgc3RvcCBoZXJlLlxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UobG9jYWxGaWxlLnRhcmdldC5yZXN1bHQpO1xuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoXCJKU09OIGZpbGUgaXMgbWFsZm9ybWVkIVwiKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBsb2NhbEpzb24gPSBKU09OLnBhcnNlKGxvY2FsRmlsZS50YXJnZXQucmVzdWx0KTtcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YobG9jYWxKc29uLnRhcmdldCkhPVwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgYW5ub3RhdGlvbiA9IG5ldyBBbm5vdGF0aW9uKGxvY2FsSnNvbik7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuVmFsaWRhdGVBbm5vdGF0aW9uKGFubm90YXRpb24pKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wZW4gdGhlIEdVSSBhbmQgcG9wdWxhdGUgaXQgd2l0aCB0aGlzIGFubm90YXRpb24ncyBkYXRhLlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ndWkuQmVnaW5FZGl0aW5nKGFubm90YXRpb24sIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ndWkuQ29tbWl0QW5ub3RhdGlvblRvU2VydmVyKGZ1bmN0aW9uKCl7cmV0dXJuO30pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IoXCJKU09OIGlzIGludmFsaWQhXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpPTA7IGk8bG9jYWxKc29uLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhbm5vdGF0aW9uID0gbmV3IEFubm90YXRpb24obG9jYWxKc29uW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuVmFsaWRhdGVBbm5vdGF0aW9uKGFubm90YXRpb24pKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPcGVuIHRoZSBHVUkgYW5kIHBvcHVsYXRlIGl0IHdpdGggdGhpcyBhbm5vdGF0aW9uJ3MgZGF0YS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmd1aS5CZWdpbkVkaXRpbmcoYW5ub3RhdGlvbiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ndWkuQ29tbWl0QW5ub3RhdGlvblRvU2VydmVyKChhbm5vdGF0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuUmVnaXN0ZXJOZXdBbm5vdGF0aW9uKGFubm90YXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmd1aS5DbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IoXCJKU09OIGlzIGludmFsaWQhXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICRkaWFsb2cuZGlhbG9nKFwiY2xvc2VcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZyLnJlYWRBc1RleHQoZmlsZXNbMF0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgJGRpYWxvZyA9ICRjb250YWluZXIuZGlhbG9nKHtcbiAgICAgICAgICAgIGF1dG9PcGVuOiB0cnVlLFxuICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIG1vZGFsOiB0cnVlLFxuICAgICAgICAgICAgYnV0dG9uczoge1xuICAgICAgICAgICAgICAgIENhbmNlbDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAkZGlhbG9nLmRpYWxvZyhcImNsb3NlXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjbG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICRkaWFsb2cuZmluZChcImZvcm1cIilbIDAgXS5yZXNldCgpO1xuICAgICAgICAgICAgICAgICRkaWFsb2cuZmluZChcImlucHV0XCIpLnJlbW92ZUNsYXNzKCBcInVpLXN0YXRlLWVycm9yXCIgKTtcbiAgICAgICAgICAgICAgICAvL3RoaXMuT25Nb2RhbENsb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIFZhbGlkYXRlQW5ub3RhdGlvbihhbm5vdGF0aW9uKSB7XG4gICAgICAgIC8vIFRPRE86IFZhbGlkYXRlIGFubm90YXRpb24gaGVyZS4gUmV0dXJuIGZhbHNlIGlmIGFueVxuICAgICAgICAvLyByZXF1aXJlZCBwcm9wZXJ0aWVzIGFyZSBub3QgcHJlc2VudC5cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBjaGVja2luZyB3aGV0aGVyIHRoZSBicm93c2VyIGlzIHNhZmFyaSBvciBub3RcbiAgICBJc1NhZmFyaSgpIHtcbiAgICAgICAgLy9yZWY6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzQ5ODcyMTExL2RldGVjdC1zYWZhcmktYW5kLXN0b3Atc2NyaXB0XG4gICAgICAgIGxldCBpc1NhZmFyaSA9IC9eKCg/IWNocm9tZXxhbmRyb2lkKS4pKnNhZmFyaS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICAgIHJldHVybiBpc1NhZmFyaTtcbiAgICB9XG5cblxufVxuXG5leHBvcnQgeyBWaWRlb0Fubm90YXRvciB9OyIsImltcG9ydCB7IEdldEZvcm1hdHRlZFRpbWUsIEdldFNlY29uZHNGcm9tSE1TIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3RpbWUuanNcIjtcbmltcG9ydCB7IFBvbHlnb25FZGl0b3IgfSBmcm9tIFwiLi9wb2x5Z29uLWVkaXRvci5qc1wiO1xuaW1wb3J0IHsgQW5ub3RhdGlvbiB9IGZyb20gXCIuLi9hbm5vdGF0aW9uLmpzXCI7XG5cbmNsYXNzIEFubm90YXRpb25HVUkge1xuXG4gICAgY29uc3RydWN0b3IoYW5ub3RhdG9yKXtcbiAgICAgICAgdGhpcy5hbm5vdGF0b3IgPSBhbm5vdGF0b3I7XG5cbiAgICAgICAgdGhpcy5DcmVhdGUoKTtcblxuICAgICAgICB0aGlzLm9wZW4gPSBmYWxzZTtcblxuICAgICAgICAvL0hpZGUgdGhlIGNvbnRhaW5lclxuICAgICAgICB0aGlzLmlzVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLiRjb250YWluZXIubWFrZVZpc2libGUoZmFsc2UpO1xuXG4gICAgICAgIHRoaXMucG9seUVkaXRvciA9IG5ldyBQb2x5Z29uRWRpdG9yKHRoaXMuYW5ub3RhdG9yKTtcblxuICAgICAgICB0aGlzLmFubm90YXRvci4kY29udGFpbmVyLm9uKFwiT25Qb2x5Z29uRWRpdGluZ0VuZGVkXCIsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuU2V0VmlzaWJsZSh0cnVlKTtcbiAgICAgICAgICAgIHRoaXMucG9seUVkaXRvci5TaG93SnVzdFBvbHlnb24oKTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICBDcmVhdGUoKXtcbiAgICAgICAgLypcbiAgICAgICAgICogLy9uZXcgVUlcbiAgICAgICAgICogXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLiRjb250YWluZXIgPSAkKFwiPGRpdiBpZD0nY3JlYXRlLWRpYWxvZycgY2xhc3M9J3VpLXdpZGdldC1jb250ZW50IGNlbnRlcic+XCIpLmFwcGVuZFRvKHRoaXMuYW5ub3RhdG9yLnBsYXllci4kY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLmRyYWdnYWJsZSgpO1xuICAgICAgICB0aGlzLiR0aXRsZSA9ICQoXCI8ZGl2IGNsYXNzPSdkaWFsb2ctdGl0bGUnPkNyZWF0ZSBBbm5vdGF0aW9uPC9kaXY+XCIpLmFwcGVuZFRvKHRoaXMuJGNvbnRhaW5lcik7XG5cbiAgICAgICAgLy8gTWFrZSBjYW5jZWwgYnV0dG9uXG4gICAgICAgIGxldCAkZXhpdEJ1dHRvbiA9ICQoXCI8YnV0dG9uPkV4aXQgQW5ub3RhdGlvbiBFZGl0aW5nPC9idXR0b24+XCIpLmJ1dHRvbih7XG4gICAgICAgICAgICBpY29uczoge3ByaW1hcnk6ICdmYSBmYS1yZW1vdmUnfSxcbiAgICAgICAgICAgIHNob3dMYWJlbDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgICRleGl0QnV0dG9uLmNzcyhcImZsb2F0XCIsIFwicmlnaHRcIik7XG4gICAgICAgICRleGl0QnV0dG9uLmF0dHIoJ3RpdGxlJywgXCJFeGl0IGFubm90YXRpb24gZWRpdGluZ1wiKTtcbiAgICAgICAgJGV4aXRCdXR0b24uYWRkQ2xhc3MoXCJ3YWxkb3JmLWNhbmNlbC1idXR0b25cIik7XG4gICAgICAgICRleGl0QnV0dG9uLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucG9seUVkaXRvci5SZXNldFBvbHlnb25zKCk7XG4gICAgICAgICAgICB0aGlzLkNsb3NlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyRWxlbWVudCgkZXhpdEJ1dHRvbiwgdGhpcy4kdGl0bGUsIC0xKTtcblxuICAgICAgICB0aGlzLiR0YWJzID0gJChcIjxkaXYgaWQ9J3RhYnMnPjwvZGl2PlwiKS5hcHBlbmRUbyh0aGlzLiRjb250YWluZXIpO1xuICAgIFxuICAgICAgICBcbiAgICAgICAgbGV0ICR0YWJVSSA9ICQoXCI8dWw+PC91bD5cIik7XG4gICAgICAgIGxldCAkc3RhcnRVSSA9ICQoXCI8bGk+PGEgaHJlZj0nI3N0YXJ0X3RhYic+U3RhcnQgPC9hPjwvbGk+XCIpO1xuICAgICAgICBsZXQgJGJvZHlVSSA9ICQoXCI8bGk+PGEgaHJlZj0nI2JvZHlfdGFiJz5Cb2R5IDwvYT48L2xpPlwiKTtcbiAgICAgICAgbGV0ICRzdG9wVUkgPSAkKFwiPGxpPjxhIGhyZWY9JyNzdG9wX3RhYic+U3RvcCA8L2E+PC9saT5cIik7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KCR0YWJVSSwgdGhpcy4kdGFicywgLTEpO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyRWxlbWVudCgkc3RhcnRVSSwgJHRhYlVJLCAtMSk7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KCRib2R5VUksICR0YWJVSSwgLTEpO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyRWxlbWVudCgkc3RvcFVJLCAkdGFiVUksIC0xKTtcblxuICAgICAgICBsZXQgJHN0YXJ0VGFiID0gJChcIjxkaXYgaWQ9J3N0YXJ0X3RhYicgY2xhc3M9J3VpLWZpZWxkLWNvbnRhaW4nPlwiICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8bGFiZWwgZm9yPSdzdGFydF90aW1lJz5TdGFydCBUaW1lPC9sYWJlbD48YnI+XCIgKyBcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiPC9kaXY+XCIpO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyRWxlbWVudCgkc3RhcnRUYWIsIHRoaXMuJHRhYnMsIC0xKTtcblxuICAgICAgICAvLyBNYWtlIFwiU3RhcnQgdGltZVwiIGxhYmVsIGFuZCBmaWVsZFxuICAgICAgICB0aGlzLiR0aW1lU3RhcnRGaWVsZCA9ICQoJzxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJ0aW1lLXN0YXJ0XCIgaWQ9XCJ0aW1lLXN0YXJ0XCIgdmFsdWU9XCJcIj4nKS5hcHBlbmRUbygkc3RhcnRUYWIpO1xuICAgICAgICB0aGlzLiR0aW1lU3RhcnRGaWVsZC53aWR0aCg3Mik7XG4gICAgICAgIHRoaXMuJHRpbWVTdGFydEZpZWxkLmNzcyhcImZvbnQtZmFtaWx5XCIsIFwiQ291cmllciwgbW9ub3NwYWNlXCIpO1xuICAgICAgICB0aGlzLiR0aW1lU3RhcnRGaWVsZC5jc3MoXCJtYXJnaW4tcmlnaHRcIiwgXCIycHhcIik7XG4gICAgICAgIHRoaXMuJHRpbWVTdGFydEZpZWxkLmFkZENsYXNzKFwidWktd2lkZ2V0IHVpLXdpZGdldC1jb250ZW50IHVpLWNvcm5lci1hbGxcIik7XG4gICAgICAgIHRoaXMuJHRpbWVTdGFydEZpZWxkLmF0dHIoJ3RpdGxlJywgXCJTdGFydCB0aW1lIChoaDptbTpzcy5zcylcIik7XG4gICAgICAgIHRoaXMuJHRpbWVTdGFydEZpZWxkLm9uKCdrZXlwcmVzcycsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09IDQ2IHx8IChldmVudC5rZXlDb2RlID49IDQ4ICYmIGV2ZW50LmtleUNvZGUgPD0gNTgpKXsgLy8wLTksIHBlcmlvZCwgYW5kIGNvbG9uXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vYWRkIHN0YXJ0IG1hcmtlciBidXR0b25cbiAgICAgICAgdGhpcy4kc3RhcnRUaW1lTWFya2VyID0gJChcIjxidXR0b24gc3R5bGU9J3BhZGRpbmc6MDsgbGluZS1oZWlnaHQ6MS40Jz5TZXQgRW5kPC9idXR0b24+XCIpLmJ1dHRvbih7XG4gICAgICAgICAgICBpY29uOiBcImZhIGZhLW1hcC1tYXJrZXJcIixcbiAgICAgICAgICAgIHNob3dMYWJlbDogZmFsc2VcbiAgICAgICAgfSkuY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy4kdGltZVN0YXJ0RmllbGRbMF0udmFsdWUgPSBHZXRGb3JtYXR0ZWRUaW1lKHRoaXMuYW5ub3RhdG9yLnBsYXllci52aWRlb0VsZW1lbnQuY3VycmVudFRpbWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kc3RhcnRUaW1lTWFya2VyLCAkc3RhcnRUYWIsIC0yKTsgICAgIFxuICAgICAgICBcbiAgICAgICAgLy9zdGFydCBwb2ludCBwb2x5Z29uIGlzIGFkZGVkXG4gICAgICAgIHRoaXMuJHN0YXJ0UG9seWdvblNldCA9ICQoXCI8YnV0dG9uIHN0eWxlPSdwYWRkaW5nOjA7IGxpbmUtaGVpZ2h0OjEuNCc+U3RhcnQgUG9seWdvbiBTZXQ8L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgIGljb246IFwiZmEgZmEtY2hlY2stc3F1YXJlLW9cIixcbiAgICAgICAgICAgIHNob3dMYWJlbDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIC8vdGhpcy4kc3RhcnRQb2x5Z29uU2V0LmNzcyhcInZpc2liaWxpdHlcIiwgXCJpbmhlcml0XCIpO1xuICAgICAgICB0aGlzLiRzdGFydFBvbHlnb25TZXQuY3NzKFwidmlzaWJpbGl0eVwiLCBcImhpZGRlblwiKTtcbiAgICAgICAgdGhpcy4kc3RhcnRQb2x5Z29uU2V0LmFkZENsYXNzKFwid2FsZG9yZi1jb25maXJtLWJ1dHRvblwiKTtcbiAgICAgICAgXG4gICAgICAgIC8vdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kc3RhcnRQb2x5Z29uU2V0LCAkc3RhcnRUYWIsIC0yKTsgXG5cbiAgICAgICAgbGV0ICRib2R5VGFiID0gJChcIjxkaXYgaWQ9J2JvZHlfdGFiJz48L2Rpdj5cIik7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KCRib2R5VGFiLCB0aGlzLiR0YWJzLCAtMSk7XG5cbiAgICAgICAgLy8gQWRkIHRhZ3MgaW5wdXQgZmllbGRcbiAgICAgICAgdGhpcy4kdGFnc0ZpZWxkID0gJCgnPHNlbGVjdCBjbGFzcz1cImZvcm0tY29udHJvbFwiIG11bHRpcGxlPVwibXVsdGlwbGVcIj48L3NlbGVjdD4nKTtcbiAgICAgICAgdGhpcy4kdGFnc0ZpZWxkLndpZHRoKFwiMTAwJVwiKTtcbiAgICAgICAgdGhpcy4kdGFnc0ZpZWxkLmNzcyhcIm1hcmdpbi10b3BcIiwgXCItOHB4XCIpO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyRWxlbWVudCh0aGlzLiR0YWdzRmllbGQsICRib2R5VGFiLCAtMSk7XG4gICAgICAgIHRoaXMuJHRhZ3NGaWVsZC5zZWxlY3QyKHtcbiAgICAgICAgICAgIHRhZ3M6IHRydWUsXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogXCJUYWdzXCIsXG4gICAgICAgICAgICBhamF4OiB0aGlzLkdldFRhZ3NRdWVyeSgpLFxuICAgICAgICAgICAgc2VsZWN0T25CbHVyOiB0cnVlLFxuICAgICAgICAgICAgLy8gQWxsb3cgbWFudWFsbHkgZW50ZXJlZCB0ZXh0IGluIGRyb3AgZG93bi5cbiAgICAgICAgICAgIGNyZWF0ZVRhZzogZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBwYXJhbXMudGVybSxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogcGFyYW1zLnRlcm0sXG4gICAgICAgICAgICAgICAgICAgIG5ld09wdGlvbjogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIEFkZCBjdXN0b20gY2xhc3MgZm9yIGJyaW5naW5nIHRoZSBkcm9wZG93biB0byB0aGUgZnJvbnQgKGZ1bGxzY3JlZW4gZml4KVxuICAgICAgICB0aGlzLiR0YWdzRmllbGQuZGF0YSgnc2VsZWN0MicpLiRkcm9wZG93bi5hZGRDbGFzcyhcInNlbGVjdDItZHJvcGRvd24tYW5ub3RhdG9yXCIpO1xuXG4gICAgICAgIC8vIE1ha2Ugbm90ZXMgdGV4dCBmaWVsZFxuICAgICAgICB0aGlzLiR0ZXh0RmllbGQgPSAkKCc8dGV4dGFyZWEgdHlwZT1cInRleHRcIiBuYW1lPVwiYW5uby10ZXh0XCIgaWQ9XCJhbm5vLXRleHRcIiB2YWx1ZT1cIlwiIHBsYWNlaG9sZGVyPVwiTm90ZXNcIj4nKTtcbiAgICAgICAgdGhpcy4kdGV4dEZpZWxkLmNzcyhcIm1hcmdpbi10b3BcIiwgXCIycHhcIik7XG4gICAgICAgIHRoaXMuJHRleHRGaWVsZC53aWR0aChcIjk4LjUlXCIpO1xuICAgICAgICB0aGlzLiR0ZXh0RmllbGQuYWRkQ2xhc3MoXCJ1aS13aWRnZXQgdWktd2lkZ2V0LWNvbnRlbnQgdWktY29ybmVyLWFsbFwiKTtcbiAgICAgICAgdGhpcy4kdGV4dEZpZWxkLmF0dHIoJ3RpdGxlJywgJ0Fubm90YXRpb24gdGV4dCcpO1xuICAgICAgICB0aGlzLiR0ZXh0RmllbGQuY3NzKFwiZmxleC1ncm93XCIsIDIpO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyRWxlbWVudCh0aGlzLiR0ZXh0RmllbGQsICRib2R5VGFiLCAtMSk7XG5cbiAgICAgICAgbGV0ICRzdG9wVGFiID0gJChcIjxkaXYgaWQ9J3N0b3BfdGFiJz5cIiArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPGxhYmVsIGZvcj0nc3RvcF90aW1lJz5TdG9wIFRpbWU8L2xhYmVsPjxicj5cIiArIFxuICAgICAgICAgICAgICAgICAgICAgICAgXCI8L2Rpdj5cIik7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KCRzdG9wVGFiLCB0aGlzLiR0YWJzLCAtMSk7XG5cbiAgICAgICAgLy8gTWFrZSBcIlN0YXJ0IHRpbWVcIiBsYWJlbCBhbmQgZmllbGRcbiAgICAgICAgdGhpcy4kdGltZUVuZEZpZWxkID0gJCgnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInRpbWUtc3RhcnRcIiBpZD1cInRpbWUtc3RhcnRcIiB2YWx1ZT1cIlwiPicpLmFwcGVuZFRvKCRzdG9wVGFiKTtcbiAgICAgICAgdGhpcy4kdGltZUVuZEZpZWxkLndpZHRoKDcyKTtcbiAgICAgICAgdGhpcy4kdGltZUVuZEZpZWxkLmNzcyhcImZvbnQtZmFtaWx5XCIsIFwiQ291cmllciwgbW9ub3NwYWNlXCIpO1xuICAgICAgICB0aGlzLiR0aW1lRW5kRmllbGQuY3NzKFwibWFyZ2luLXJpZ2h0XCIsIFwiMnB4XCIpO1xuICAgICAgICB0aGlzLiR0aW1lRW5kRmllbGQuYWRkQ2xhc3MoXCJ1aS13aWRnZXQgdWktd2lkZ2V0LWNvbnRlbnQgdWktY29ybmVyLWFsbFwiKTtcbiAgICAgICAgdGhpcy4kdGltZUVuZEZpZWxkLmF0dHIoJ3RpdGxlJywgXCJTdGFydCB0aW1lIChoaDptbTpzcy5zcylcIik7XG4gICAgICAgIHRoaXMuJHRpbWVFbmRGaWVsZC5vbigna2V5cHJlc3MnLCBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PSA0NiB8fCAoZXZlbnQua2V5Q29kZSA+PSA0OCAmJiBldmVudC5rZXlDb2RlIDw9IDU4KSl7IC8vMC05LCBwZXJpb2QsIGFuZCBjb2xvblxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL2FkZCBzdGFydCBtYXJrZXIgYnV0dG9uXG4gICAgICAgIHRoaXMuJGVuZFRpbWVNYXJrZXIgPSAkKFwiPGJ1dHRvbiBzdHlsZT0ncGFkZGluZzowOyBsaW5lLWhlaWdodDoxLjQnPlNldCBFbmQ8L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgIGljb246IFwiZmEgZmEtbWFwLW1hcmtlclwiLFxuICAgICAgICAgICAgc2hvd0xhYmVsOiBmYWxzZVxuICAgICAgICB9KS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLiR0aW1lRW5kRmllbGRbMF0udmFsdWUgPSBHZXRGb3JtYXR0ZWRUaW1lKHRoaXMuYW5ub3RhdG9yLnBsYXllci52aWRlb0VsZW1lbnQuY3VycmVudFRpbWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kZW5kVGltZU1hcmtlciwgJHN0b3BUYWIsIC0yKTtcblxuICAgICAgICAvL3N0b3AgcG9pbnQgcG9seWdvbiBpcyBhZGRlZFxuICAgICAgICB0aGlzLiRlbmRQb2x5Z29uU2V0ID0gJChcIjxidXR0b24gc3R5bGU9J3BhZGRpbmc6MDsgbGluZS1oZWlnaHQ6MS40Jz5FbmQgUG9seWdvbiBTZXQ8L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgIGljb246IFwiZmEgZmEtY2hlY2stc3F1YXJlLW9cIixcbiAgICAgICAgICAgIHNob3dMYWJlbDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIC8vdGhpcy4kZW5kUG9seWdvblNldC5jc3MoXCJ2aXNpYmlsaXR5XCIsIFwiaW5oZXJpdFwiKTtcbiAgICAgICAgdGhpcy4kZW5kUG9seWdvblNldC5jc3MoXCJ2aXNpYmlsaXR5XCIsIFwiaGlkZGVuXCIpO1xuICAgICAgICAvL3RoaXMuJGVuZFBvbHlnb25TZXQuYWRkQ2xhc3MoXCJ3YWxkb3JmLWNvbmZpcm0tYnV0dG9uXCIpO1xuICAgIFxuICAgICAgICAvL0FkZCBzb21lIGVycm9yIGNoZWNraW5nLi4uXG4gICAgICAgIHRoaXMuJHRpbWVFbmRGaWVsZC5ibHVyKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBlID0gJCh0aGlzLiR0aW1lRW5kRmllbGQpLnZhbCgpO1xuICAgICAgICAgICAgbGV0IHMgPSAkKHRoaXMuJHRpbWVTdGFydEZpZWxkKS52YWwoKTtcbiAgICAgICAgICAgIGlmKEdldFNlY29uZHNGcm9tSE1TKHMrMSkgPiBHZXRTZWNvbmRzRnJvbUhNUyhlKSl7XG4gICAgICAgICAgICAgICAgJCh0aGlzLiR0aW1lRW5kRmllbGQpLnZhbChHZXRGb3JtYXR0ZWRUaW1lKEdldFNlY29uZHNGcm9tSE1TKHMpKy4wMSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy4kdGltZVN0YXJ0RmllbGQuYmx1cigoKSA9PiB7XG4gICAgICAgICAgICBsZXQgZSA9ICQodGhpcy4kdGltZUVuZEZpZWxkKS52YWwoKTtcbiAgICAgICAgICAgIGxldCBzID0gJCh0aGlzLiR0aW1lU3RhcnRGaWVsZCkudmFsKCk7XG4gICAgICAgICAgICBpZihHZXRTZWNvbmRzRnJvbUhNUyhzKzEpID4gR2V0U2Vjb25kc0Zyb21ITVMoZSkpe1xuICAgICAgICAgICAgICAgICQodGhpcy4kdGltZUVuZEZpZWxkKS52YWwoR2V0Rm9ybWF0dGVkVGltZShHZXRTZWNvbmRzRnJvbUhNUyhzKSsuMDEpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kZW5kUG9seWdvblNldCwgJHN0b3BUYWIsIC0yKTsgXG5cbiAgICAgICAgbGV0ICRidXR0b25QYW5lbCA9ICQoXCI8ZGl2IGNsYXNzPSdidXR0b25fcGFuZWwnPjwvZGl2PlwiKS5hcHBlbmRUbyh0aGlzLiRjb250YWluZXIpO1xuXG4gICAgICAgIGxldCAkc3RhcnRUYXJnZXRMYWJlbCA9ICQoXCI8bGFiZWw+U3RhcnQgVGFyZ2V0PC9sYWJlbD48YnI+XCIpO1xuICAgICAgICAkc3RhcnRUYXJnZXRMYWJlbC5jc3MoXCJjb2xvclwiLCBcIndoaXRlXCIpO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyRWxlbWVudCgkc3RhcnRUYXJnZXRMYWJlbCwgJGJ1dHRvblBhbmVsLCAtMSk7XG5cbiAgICAgICAgLy9NYWtlIFwiRWRpdCBwb2x5Z29uXCIgYnV0dG9uXG4gICAgICAgIGxldCAkZWRpdFBvbHlCdXR0b24gPSAkKFwiPGJ1dHRvbj5FZGl0IFBvbHlnb248L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgICBpY29uOiBcImZhIGZhLXBlbmNpbFwiLFxuICAgICAgICAgICAgIHNob3dMYWJlbDogZmFsc2VcbiAgICAgICAgfSkuY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgIHRoaXMuU2V0VmlzaWJsZShmYWxzZSk7XG4gICAgICAgICAgICAgY29uc29sZS5sb2coXCJhbm5vdGF0aW9uLWd1aTozNTMgQ3JlYXRlXCIpO1xuICAgICAgICAgICAgIHRoaXMucG9seUVkaXRvci5CZWdpbkVkaXRpbmcoKTtcbiAgICAgICAgfSk7XG4gICAgICAgICRlZGl0UG9seUJ1dHRvbi5hdHRyKCd0aXRsZScsIFwiRWRpdCBwb2x5Z29uIHRlc3QyXCIpO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyRWxlbWVudCgkZWRpdFBvbHlCdXR0b24sICRidXR0b25QYW5lbCwgLTEpO1xuXG4gICAgICAgIC8vIE1ha2UgZGVsZXRlIGJ1dHRvblxuICAgICAgICB0aGlzLiRkZWxldGVCdXR0b24gPSAkKFwiPGJ1dHRvbj5EZWxldGUgQW5ub3RhdGlvbjwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgaWNvbjogXCJmYSBmYS1ib21iXCIsXG4gICAgICAgICAgICBzaG93TGFiZWw6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLiRkZWxldGVCdXR0b24uY3NzKFwibWFyZ2luLXJpZ2h0XCIsIFwiMTVweFwiKTtcbiAgICAgICAgdGhpcy4kZGVsZXRlQnV0dG9uLmF0dHIoJ3RpdGxlJywgXCJEZWxldGUgYW5ub3RhdGlvblwiKTtcbiAgICAgICAgdGhpcy4kZGVsZXRlQnV0dG9uLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYW5ub3RhdG9yLnNlcnZlci5EZWxldGVBbm5vdGF0aW9uKHRoaXMub3JpZ2luYWxBbm5vdGF0aW9uKS5kb25lKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYW5ub3RhdG9yLkRlcmVnaXN0ZXJBbm5vdGF0aW9uKHRoaXMub3JpZ2luYWxBbm5vdGF0aW9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLkNsb3NlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJGRlbGV0ZUJ1dHRvbiwgJGJ1dHRvblBhbmVsLCAtMSk7XG5cblxuICAgICAgICAvLyBNYWtlIGNhbmNlbCBidXR0b25cbiAgICAgICAgbGV0ICRjYW5jZWxCdXR0b24gPSAkKFwiPGJyPjxicj48YnV0dG9uPkNhbmNlbDwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgc2hvd0xhYmVsOiB0cnVlXG4gICAgICAgIH0pLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucG9seUVkaXRvci5SZXNldFBvbHlnb25zKCk7XG4gICAgICAgICAgICB0aGlzLkNsb3NlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkY2FuY2VsQnV0dG9uLmNzcyhcImZsb2F0XCIsIFwicmlnaHRcIik7XG4gICAgICAgICRjYW5jZWxCdXR0b24uYXR0cigndGl0bGUnLCBcIkV4aXQgYW5ub3RhdGlvbiBlZGl0aW5nXCIpO1xuICAgICAgICAvLyRjYW5jZWxfYnV0dG9uLmFkZENsYXNzKFwid2FsZG9yZi1jYW5jZWwtYnV0dG9uXCIpO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyRWxlbWVudCgkY2FuY2VsQnV0dG9uLCAkYnV0dG9uUGFuZWwsIC0xKTtcbiAgICAgICAgXG4gICAgICAgIC8vIE1ha2Ugc2F2ZSBidXR0b25cbiAgICAgICAgbGV0ICRzYXZlQnV0dG9uID0gJChcIjxidXR0b24+U2F2ZTwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgc2hvd0xhYmVsOiB0cnVlXG4gICAgICAgIH0pLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuQ29tbWl0QW5ub3RhdGlvblRvU2VydmVyKChhbm5vdGF0aW9uLCBvbGRJRCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHRoaXMuZWRpdE1vZGUpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFubm90YXRvci5VcGRhdGVBbm5vdGF0aW9uKGFubm90YXRpb24sIG9sZElEKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFubm90YXRvci5SZWdpc3Rlck5ld0Fubm90YXRpb24oYW5ub3RhdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMucG9seUVkaXRvci5SZXNldFBvbHlnb25zKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5DbG9zZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICAkc2F2ZUJ1dHRvbi5jc3MoXCJmbG9hdFwiLCBcImxlZnRcIik7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KCRzYXZlQnV0dG9uLCAkYnV0dG9uUGFuZWwsIC0xKTtcblxuICAgICAgICAvL2h0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEzODM3MzA0L2pxdWVyeS11aS1ub24tYWpheC10YWItbG9hZGluZy13aG9sZS13ZWJzaXRlLWludG8taXRzZWxmXG4gICAgICAgICQoJ2Jhc2UnKS5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy4kdGFicy50YWJzKCkuYWRkQ2xhc3MoJ3VpLXRhYnMtdmVydGljYWwnKTtcbiAgICAgICAgLy9sZXQgJHNjcmlwdF9zZWN0aW9uID0gJFxuICAgICAgICAvL3RoaXMuJGNvbnRhaW5lci5oaWRlKCk7XG4gICAgfVxuXG4gICAgUmVnaXN0ZXJFbGVtZW50KCRlbGVtZW50LCAkY29udGFpbmVyLCBvcmRlciwganVzdGlmaWNhdGlvbiA9ICdmbGV4LXN0YXJ0Jyl7XG4gICAgICAgICRlbGVtZW50LmNzcygnb3JkZXInLCBvcmRlcik7XG4gICAgICAgICRlbGVtZW50LmNzcygnYWxpZ24tc2VsZicsIGp1c3RpZmljYXRpb24pO1xuICAgICAgICAvLyBTZXRzIGdyb3cgW3Nocmlua10gW2Jhc2lzXVxuICAgICAgICAvLyRlbGVtZW50LmNzcygnZmxleCcsICcwIDAgYXV0bycpO1xuICAgICAgICAkY29udGFpbmVyLmFwcGVuZCgkZWxlbWVudCk7XG4gICAgfVxuXG4gICAgU2V0VmlzaWJsZShpc1Zpc2libGUsIGR1cmF0aW9uID0gMCl7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhpc1Zpc2libGUgKyBcIiBcIiArIGR1cmF0aW9uKTtcbiAgICAgICAgaWYoaXNWaXNpYmxlKXtcbiAgICAgICAgICAgIHRoaXMuJGNvbnRhaW5lci5mYWRlVG8oZHVyYXRpb24sIDEuMCk7XG4gICAgICAgICAgICB0aGlzLiRjb250YWluZXIubWFrZVZpc2libGUodHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRjb250YWluZXIuc3RvcCh0cnVlLCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuJGNvbnRhaW5lci5mYWRlVG8oZHVyYXRpb24sIDAuMCk7XG4gICAgICAgICAgICB0aGlzLiRjb250YWluZXIubWFrZVZpc2libGUoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNWaXNpYmxlID0gaXNWaXNpYmxlO1xuXG4gICAgfVxuXG4gICAgVG9nZ2xlT3Blbigpe1xuXG4gICAgICAgIGlmKHRoaXMub3Blbil7XG4gICAgICAgICAgICB0aGlzLkNsb3NlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLk9wZW4oKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgT3Blbigpe1xuICAgICAgICB0aGlzLlNldFZpc2libGUodHJ1ZSk7XG4gICAgICAgIHRoaXMub3BlbiA9IHRydWU7XG4gICAgICAgIHRoaXMucG9seUVkaXRvci5Eb25lKCk7XG4gICAgICAgIC8vIERpc2FibGUgYXV0b2ZhZGluZyB3aGVuIHRoZSBndWkgaXMgdmlzaWJsZVxuICAgICAgICB0aGlzLmFubm90YXRvci5wbGF5ZXIuU2V0QXV0b0ZhZGUoZmFsc2UpO1xuICAgIH1cblxuICAgIENsb3NlKCl7XG4gICAgICAgIHRoaXMuU2V0VmlzaWJsZShmYWxzZSk7XG4gICAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBvbHlFZGl0b3IuRG9uZSgpO1xuICAgICAgICAvLyBSZS1lbmFibGUgYXV0b2ZhZGluZyB3aGVuIHRoZSBndWkgaXMgaGlkZGVuXG4gICAgICAgIHRoaXMuYW5ub3RhdG9yLnBsYXllci5TZXRBdXRvRmFkZSh0cnVlKTtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLnRyaWdnZXIoXCJPbkdVSUNsb3NlZFwiKTtcbiAgICB9XG4gICAgXG4gICAgVG9nZ2xlVmlzaWJsZSgpe1xuICAgICAgICB0aGlzLlNldFZpc2libGUoIXRoaXMuaXNWaXNpYmxlLCAwKTtcbiAgICB9XG5cbiAgICBCZWdpbkVkaXRpbmcoYW5ub3RhdGlvbiA9IG51bGwsIGZvcmNlTmV3ID0gZmFsc2Upe1xuICAgICAgICAvLyBPcGVuIHRoZSBHVUkgaWYgaXQgaXNuJ3QgYWxyZWFkeVxuICAgICAgICB0aGlzLk9wZW4oKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJhbm5vdGF0aW9uLWd1aTogQmVnaW5FZGl0aW5nIDQ0N1wiKTtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5wb2x5RWRpdG9yLiRwb2x5Z29ucyk7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhhbm5vdGF0aW9uKTtcblxuICAgICAgICAvLyBQb3B1bGF0ZSBkYXRhIGZyb20gdGhlIHBhc3NlZCBpbiBhbm5vdGF0aW9uXG4gICAgICAgIGlmIChhbm5vdGF0aW9uIHx8IGZvcmNlTmV3KSB7XG4gICAgICAgICAgICAvLyBQb3B1bGF0ZSB0aGUgZmllbGRzIGZyb20gdGhlIGFubm90YXRpb25cbiAgICAgICAgICAgIHRoaXMuZWRpdE1vZGUgPSB0cnVlO1xuXG4gICAgICAgICAgICAvLyBGbGlwIGVkaXQgbW9kZSBiYWNrIHRvIGZhbHNlIGlmIGZvcmNlTmV3LiBXZSB3YW50IHRvXG4gICAgICAgICAgICAvLyBwb3B1bGF0ZSBmcm9tIHRoZSBlbnRpcmUgcGFzc2VkIGluIGFubm90YXRpb24sIGJ1dCB0cmVhdFxuICAgICAgICAgICAgLy8gaXQgYXMgbmV3LlxuICAgICAgICAgICAgaWYoZm9yY2VOZXcpIHRoaXMuZWRpdE1vZGUgPSBmYWxzZTtcblxuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbEFubm90YXRpb24gPSBhbm5vdGF0aW9uO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlBvcHVsYXRlZCBmcm9tIGFuIGV4aXN0aW5nIGFubm90YXRpb25cIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhhbm5vdGF0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuJHRpbWVTdGFydEZpZWxkLnZhbChHZXRGb3JtYXR0ZWRUaW1lKGFubm90YXRpb24uYmVnaW5UaW1lKSk7XG4gICAgICAgICAgICB0aGlzLiR0aW1lRW5kRmllbGQudmFsKEdldEZvcm1hdHRlZFRpbWUoYW5ub3RhdGlvbi5lbmRUaW1lKSk7XG4gICAgICAgICAgICB0aGlzLiR0ZXh0RmllbGQudmFsKGFubm90YXRpb24uYm9keS5maWx0ZXIoaXRlbSA9PiBpdGVtLnB1cnBvc2UgPT0gXCJkZXNjcmliaW5nXCIpWzBdLnZhbHVlKTtcbiAgICAgICAgICAgIC8vIFJlc2V0IHRoZSB0YWdzIGZpZWxkXG4gICAgICAgICAgICB0aGlzLiR0YWdzRmllbGQudmFsKFwiXCIpLnRyaWdnZXIoXCJjaGFuZ2VcIik7XG4gICAgICAgICAgICB0aGlzLiR0YWdzRmllbGQuZmluZChcIm9wdGlvblwiKS5yZW1vdmUoKTtcblxuICAgICAgICAgICAgZm9yKGxldCB0YWcgb2YgYW5ub3RhdGlvbi50YWdzKXtcbiAgICAgICAgICAgICAgICB0aGlzLiR0YWdzRmllbGQuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nXCIrdGFnK1wiJyBzZWxlY3RlZD5cIit0YWcrXCI8L29wdGlvbj5cIik7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGFnc0ZpZWxkLnRyaWdnZXIoXCJjaGFuZ2VcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucG9seUVkaXRvci5Jbml0UG9seShhbm5vdGF0aW9uLmdldFBvbHkoKSk7XG4gICAgICAgICAgICB0aGlzLnBvbHlFZGl0b3IuU2hvd0p1c3RQb2x5Z29uKCk7XG5cbiAgICAgICAgfVxuICAgICAgICAvLyBJbnNlcnQgdGVtcGxhdGUgZGF0YSBpZiBubyBhbm5vdGF0aW9uIGlzIGdpdmVuXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gUG9wdWxhdGUgZmllbGRzIGlmIG5vIGFubm90YXRpb24gaXMgZ2l2ZW5cbiAgICAgICAgICAgIHRoaXMuZWRpdE1vZGUgPSBmYWxzZTtcblxuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbEFubm90YXRpb24gPSBudWxsO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlBvcHVsYXRlZCB3aXRoIHRlbXBsYXRlIGRhdGFcIik7XG4gICAgICAgICAgICB0aGlzLiR0aW1lU3RhcnRGaWVsZC52YWwoR2V0Rm9ybWF0dGVkVGltZSh0aGlzLmFubm90YXRvci5wbGF5ZXIudmlkZW9FbGVtZW50LmN1cnJlbnRUaW1lKSk7XG4gICAgICAgICAgICB0aGlzLiR0aW1lRW5kRmllbGQudmFsKEdldEZvcm1hdHRlZFRpbWUodGhpcy5hbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC5kdXJhdGlvbikpO1xuICAgICAgICAgICAgdGhpcy4kdGV4dEZpZWxkLnZhbChcIlwiKTtcbiAgICAgICAgICAgIC8vIFJlc2V0IHRoZSB0YWdzIGZpZWxkXG4gICAgICAgICAgICB0aGlzLiR0YWdzRmllbGQudmFsKFwiXCIpLnRyaWdnZXIoXCJjaGFuZ2VcIik7XG4gICAgICAgICAgICB0aGlzLiR0YWdzRmllbGQuZmluZChcIm9wdGlvblwiKS5yZW1vdmUoKTtcblxuICAgICAgICAgICAgdGhpcy5wb2x5RWRpdG9yLkluaXRQb2x5KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNb2RpZnkgR1VJIGJhc2VkIG9uIGVkaXQgbW9kZVxuICAgICAgICBpZih0aGlzLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICB0aGlzLiR0aXRsZS50ZXh0KFwiRWRpdCBBbm5vdGF0aW9uXCIpO1xuICAgICAgICAgICAgdGhpcy4kZGVsZXRlQnV0dG9uLmJ1dHRvbihcImVuYWJsZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJHRpdGxlLnRleHQoXCJDcmVhdGUgQW5ub3RhdGlvblwiKTtcbiAgICAgICAgICAgIHRoaXMuJGRlbGV0ZUJ1dHRvbi5idXR0b24oXCJkaXNhYmxlXCIpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBDb21taXRBbm5vdGF0aW9uVG9TZXJ2ZXIoY2FsbGJhY2spe1xuICAgICAgICBpZih0aGlzLmVkaXRNb2RlKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU2VuZGluZyBlZGl0ZWQgYW5ub3RhdGlvbiB0byBzZXJ2ZXIuLi5cIik7XG4gICAgICAgICAgICB0aGlzLmFubm90YXRvci5zZXJ2ZXIuRWRpdEFubm90YXRpb24oY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNlbmRpbmcgbmV3IGFubm90YXRpb24gdG8gc2VydmVyLi4uXCIpO1xuICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3Iuc2VydmVyLlBvc3RBbm5vdGF0aW9uKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEJ1aWxkIGFuIE9wZW4gQW5ub3RhdGlvbiBvYmplY3QgZnJvbSB0aGUgZGF0YS5cbiAgICBHZXRBbm5vdGF0aW9uT2JqZWN0KCl7XG5cbiAgICAgICAgbGV0IGFubm90YXRpb24gPSBuZXcgQW5ub3RhdGlvbih0aGlzLm9yaWdpbmFsQW5ub3RhdGlvbik7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJ0aGlzLm9yaWdpbmFsQW5ub3RhdGlvbjogXCIgKyBKU09OLnN0cmluZ2lmeSh0aGlzLm9yaWdpbmFsQW5ub3RhdGlvbikpOyAvL3ByaW50cyBudWxsXG5cbiAgICAgICAgYW5ub3RhdGlvbltcImJvZHlcIl0gPSB0aGlzLkJ1aWxkQW5ub3RhdGlvbkJvZHlWMSgpO1xuICAgICAgICBhbm5vdGF0aW9uW1widGFyZ2V0XCJdID0gdGhpcy5CdWlsZEFubm90YXRpb25UYXJnZXQoKTtcbiAgICAgICAgLy9hbm5vdGF0aW9uW1wiaXRlbXNcIl0gPSB0aGlzLkJ1aWxkQW5ub3RhdGlvbkl0ZW1zKCk7XG5cbiAgICAgICAgLy8gUmVjb21wdXRlIHJlYWQtb25seSBhY2Nlc3MgcHJvcGVydGllcyBhZnRlciBhbGwgb3RoZXIgcHJvcGVydGllcyBoYXZlIGJlZW4gc2V0XG4gICAgICAgIGFubm90YXRpb24ucmVjYWxjdWxhdGUoKTtcblxuICAgICAgICAvLyBDbG9uZSB0aGUgb2JqZWN0IHNvIHdlIGRvbid0IG1vZGlmeSBhbnl0aGluZyBieSBjaGFuZ2luZyB0aGlzIG9iamVjdFxuICAgICAgICBsZXQgY2xvbmUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFubm90YXRpb24pKVxuICAgICAgICByZXR1cm4gY2xvbmU7XG4gICAgfVxuXG4gICAgQnVpbGRBbm5vdGF0aW9uSXRlbXMoKSB7XG5cbiAgICAgICAgbGV0IGJ1aWxkVGltZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTsgLy9cIjIwMjAtMDgtMTZUMTI6MDA6MDBaXCJcbiAgICAgICAgbGV0IGl0ZW1zID0gW3tcbiAgICAgICAgICAgIFwiaWRcIjogXCJcIiwgLy9UT0RPOiBcImFydDp1cmxcIiBmcm9tIGFubm90YXRpb24ganNvbiBmaWxlXG4gICAgICAgICAgICBcInR5cGVcIjogXCJDYW52YXNcIixcbiAgICAgICAgICAgIFwiaGVpZ2h0XCI6IDQ4MCwgLy9UT0RPOlxuICAgICAgICAgICAgXCJ3aWR0aFwiOiA2NDAsIC8vVE9ETzpcbiAgICAgICAgICAgIFwiZHVyYXRpb25cIjogMTQzLCAvL1RPRE86XG4gICAgICAgICAgICBcImNvbnRlbnRcIjogW3tcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiXCIsIC8vVE9ETzogbWVkaWEgZmlsZSByZWZlcmVuY2UgaWQgLSBjaGVjayB0aGUgaW5jb21pbmcgYW5ub3RhdGlvbiBjb2xsZWN0aW9uIGZvciBpZFxuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIlZpZGVvXCIsXG4gICAgICAgICAgICAgICAgXCJoZWlnaHRcIjogNDgwLCAvL1RPRE86XG4gICAgICAgICAgICAgICAgXCJ3aWR0aFwiOiA2NDAsIC8vVE9ETzpcbiAgICAgICAgICAgICAgICBcImR1cmF0aW9uXCI6IDE0MywgLy9UT0RPOlxuICAgICAgICAgICAgICAgIFwibGFiZWxcIjoge1xuICAgICAgICAgICAgICAgICAgICBcImVuXCI6IFwiSW5jZXB0aW9uIENvcmdpIEZsb3BcIiAvL1RPRE86IFwiZGN0ZXJtczp0aXRsZVwiIGZyb20gdGhlIGFubm90YXRpb24ganNvbiBmaWxlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcImRlc2NyaXB0aW9uXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJlblwiOiBcIlwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBcIml0ZW1zXCI6IFt7XG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIlwiLCAgXG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiQW5ub3RhdGlvblBhZ2VcIixcbiAgICAgICAgICAgICAgICBcImdlbmVyYXRvclwiOiBcImh0dHA6Ly9naXRodWIuY29tL2FudmMvc2NhbGFyXCIsXG4gICAgICAgICAgICAgICAgXCJnZW5lcmF0ZWRcIjogYnVpbGRUaW1lLCBcbiAgICAgICAgICAgICAgICBcIml0ZW1zXCI6IFt7XG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJcIiwgLy9Bbm5vdGF0aW9uIGlkIC0gYWZ0ZXIgc3VjY2Vzc2Z1bCBkYXRhIHNhdmluZ1xuICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJBbm5vdGF0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZ2VuZXJhdG9yXCI6IFwiaHR0cDovL2dpdGh1Yi5jb20vbm92b21hbmN5L3dhbGRvcmYtc2NhbGFyXCIsIC8vVE9ETzogY29uZmlnIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgIFwibW90aXZhdGlvblwiOiBcImhpZ2hsaWdodGluZ1wiLFxuICAgICAgICAgICAgICAgICAgICBcImNyZWF0b3JcIjogdGhpcy5CdWlsZENyZWF0b3JUZW1wbGF0ZSgpLCAvL1RPRE86IFxuICAgICAgICAgICAgICAgICAgICBcImNyZWF0ZWRcIjogYnVpbGRUaW1lLCAgXG4gICAgICAgICAgICAgICAgICAgIFwicmlnaHRzXCI6IFwiaHR0cHM6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzQuMC9cIixcbiAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICBcImJvZHlcIjogdGhpcy5CdWlsZEFubm90YXRpb25Cb2R5VjIoKSwgLy9UT0RPOiBcbiAgICAgICAgICAgICAgICBcInRhcmdldFwiOiB0aGlzLkJ1aWxkQW5ub3RhdGlvblRhcmdldCgpXG4gICAgICAgICAgICB9XVxuICAgIFxuICAgICAgICB9XTtcblxuXG4gICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgICAgICAgICAgICBcbiAgICB9XG5cbiAgICAvL1RPRE86XG4gICAgQnVpbGRDcmVhdG9yVGVtcGxhdGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcInR5cGVcIjogXCJQZXJzb25cIixcbiAgICAgICAgICAgIFwibmlja25hbWVcIjogXCJKb2huIEJlbGxcIixcbiAgICAgICAgICAgIFwiZW1haWxfc2hhMVwiOiBcIlJFTU9WRURcIlxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy9UT0RPOiBidWlsZCB3aXRoIHRhZ3MgZW50cmllcyBmcm9tIG9ub215XG4gICAgQnVpbGRBbm5vdGF0aW9uQm9keVYyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5CdWlsZEFubm90YXRpb25Cb2R5VjEoKTtcbiAgICB9XG5cbiAgICBCdWlsZEFubm90YXRpb25Cb2R5VjEoKSB7XG4gICAgICAgIGxldCBib2R5ID0gW107XG5cbiAgICAgICAgLy8gQnVpbGQgdGV4dCBkZXNjcmlwdG9yXG4gICAgICAgIGxldCBib2R5VGV4dCA9IHtcbiAgICAgICAgICAgIFwidHlwZVwiIDogXCJUZXh0dWFsQm9keVwiLFxuICAgICAgICAgICAgXCJ2YWx1ZVwiIDogdGhpcy4kdGV4dEZpZWxkLnZhbCgpLFxuICAgICAgICAgICAgXCJmb3JtYXRcIiA6IFwidGV4dC9wbGFpblwiLFxuICAgICAgICAgICAgXCJsYW5ndWFnZVwiIDogXCJlblwiLFxuICAgICAgICAgICAgXCJwdXJwb3NlXCI6IFwiZGVzY3JpYmluZ1wiXG4gICAgICAgIH07XG4gICAgICAgIGJvZHkucHVzaChib2R5VGV4dCk7XG5cbiAgICAgICAgLy8gQnVpbGQgdGFnIGRlc2NyaXB0b3JzXG4gICAgICAgIGxldCB0YWdzID0gdGhpcy4kdGFnc0ZpZWxkLnNlbGVjdDIoXCJkYXRhXCIpLm1hcCgoaXRlbSkgPT4geyByZXR1cm4gaXRlbS50ZXh0OyB9KTtcbiAgICAgICAgZm9yKGxldCB0YWdTdHIgb2YgdGFncyl7XG4gICAgICAgICAgICBsZXQgYm9keVRhZyA9IHtcbiAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJUZXh0dWFsQm9keVwiLFxuICAgICAgICAgICAgICAgIFwicHVycG9zZVwiOiBcInRhZ2dpbmdcIixcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IHRhZ1N0clxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm9keS5wdXNoKGJvZHlUYWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJvZHk7XG4gICAgfVxuXG4gICAgQnVpbGRBbm5vdGF0aW9uVGFyZ2V0KCkge1xuICAgICAgICBsZXQgdGFyZ2V0ID0ge1xuICAgICAgICAgICAgXCJpZFwiOiB0aGlzLmFubm90YXRvci51cmwsIC8vIFVSTCBvZiB0aGUgdmlkZW9cbiAgICAgICAgICAgIFwidHlwZVwiOiBcIlZpZGVvXCJcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzZWxlY3RvcnMgPSBbXTtcblxuICAgICAgICBsZXQgc2FmZUVuZFRpbWUgPSBHZXRTZWNvbmRzRnJvbUhNUyh0aGlzLiR0aW1lU3RhcnRGaWVsZC52YWwoKSk7XG4gICAgICAgIGlmKEdldFNlY29uZHNGcm9tSE1TKHRoaXMuJHRpbWVFbmRGaWVsZC52YWwoKSkgPiBHZXRTZWNvbmRzRnJvbUhNUyh0aGlzLiR0aW1lU3RhcnRGaWVsZC52YWwoKSkpe1xuICAgICAgICAgICAgc2FmZUVuZFRpbWUgPSBHZXRTZWNvbmRzRnJvbUhNUyh0aGlzLiR0aW1lRW5kRmllbGQudmFsKCkpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzdGFydFRpbWUgPSBHZXRTZWNvbmRzRnJvbUhNUyh0aGlzLiR0aW1lU3RhcnRGaWVsZC52YWwoKSk7XG5cbiAgICAgICAgLy9CdWlsZCBTdmdTZWxlY3RvclxuICAgICAgICBpZiAodGhpcy5wb2x5RWRpdG9yLiRwb2x5Z29ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsZXQgcG9pbnRzU3RyID0gdGhpcy5wb2x5RWRpdG9yLiRwb2x5Z29uc1swXS5tYXAoaXRlbSA9PiB7IHJldHVybiBgJHtpdGVtWzBdfSwke2l0ZW1bMV19YCB9KS5qb2luKFwiIFwiKTtcbiAgICAgICAgICAgIGxldCBhbmltZVN0ciA9IHRoaXMucG9seUVkaXRvci4kcG9seWdvbnNbMV0ubWFwKGl0ZW0gPT4geyByZXR1cm4gYCR7aXRlbVswXX0sJHtpdGVtWzFdfWAgfSkuam9pbihcIiBcIik7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBcIjxzdmcgdmlld0JveD0nMCAwIDEwMCAxMDAnIHByZXNlcnZlQXNwZWN0UmF0aW89J25vbmUnPlwiO1xuICAgICAgICAgICAgdmFsdWUgKz0gXCI8cG9seWdvbiBwb2ludHM9J1wiICsgcG9pbnRzU3RyICsgXCInIC8+XCI7XG4gICAgICAgICAgICB2YWx1ZSArPSBcIjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9J3BvaW50cycgZnJvbT0nXCIgKyBwb2ludHNTdHIgKyBcIicgdG89J1wiICsgYW5pbWVTdHIgKyBcIidcIjtcbiAgICAgICAgICAgIHZhbHVlICs9IFwiIHN0YXJ0PSdcIiArIHN0YXJ0VGltZSArIFwiJyBlbmQ9J1wiICsgc2FmZUVuZFRpbWUgKyBcIicgLz5cIjtcbiAgICAgICAgICAgIHZhbHVlICs9IFwiPC9zdmc+XCI7XG5cbiAgICAgICAgICAgIGxldCBwb2x5Z29uU2VsZWN0b3IgPSB7XG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiU3ZnU2VsZWN0b3JcIixcbiAgICAgICAgICAgICAgICBcImNvbmZvcm1zVG9cIjogXCJodHRwOi8vd3d3LnczLm9yZy9UUi9tZWRpYS1mcmFncy9cIiwgLy9hZGRlZCBmb3IgdjJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IGAke3ZhbHVlfWAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjQ4OTg3MjhcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGVjdG9ycy5wdXNoKHBvbHlnb25TZWxlY3Rvcik7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIEJ1aWxkIHRpbWUgc2VsZWN0b3JcbiAgICAgICAgbGV0IHRpbWVTZWxlY3RvciA9IHtcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIkZyYWdtZW50U2VsZWN0b3JcIixcbiAgICAgICAgICAgIFwiY29uZm9ybXNUb1wiOiBcImh0dHA6Ly93d3cudzMub3JnL1RSL21lZGlhLWZyYWdzL1wiLCAvLyBTZWUgbWVkaWEgZnJhZ21lbnQgc3BlY2lmaWNhdGlvblxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiBgdD0ke3N0YXJ0VGltZX0sJHtzYWZlRW5kVGltZX1gIC8vIFRpbWUgaW50ZXJ2YWwgaW4gc2Vjb25kc1xuICAgICAgICB9XG4gICAgICAgIHNlbGVjdG9ycy5wdXNoKHRpbWVTZWxlY3Rvcik7XG5cbiAgICAgICAgLy8gRmluYWxpemUgdGFyZ2V0IHNlY3Rpb25cbiAgICAgICAgdGFyZ2V0W1wic2VsZWN0b3JcIl0gPSBzZWxlY3RvcnM7XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgICBHZXRUYWdzUXVlcnkoKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJ0aGlzLmFubm90YXRvci5vbm9teUxhbmd1YWdlOiBcIiArIHRoaXMuYW5ub3RhdG9yLm9ub215TGFuZ3VhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdXJsOiB0aGlzLmFubm90YXRvci50YWdzVVJMLFxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgIGRlbGF5OiAyNTAsXG4gICAgICAgICAgICBjYWNoZTogdHJ1ZSxcbiAgICAgICAgICAgIG9ub215TGFuZ3VhZ2U6IHRoaXMuYW5ub3RhdG9yLm9ub215TGFuZ3VhZ2UsXG4gICAgICAgICAgICBwcm9jZXNzUmVzdWx0czogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBQYXJzZSB0aGUgbGFiZWxzIGludG8gdGhlIGZvcm1hdCBleHBlY3RlZCBieSBTZWxlY3QyXG4gICAgICAgICAgICAgICAgLy8gbXVsdGlsaW5ndWFsIHRhZ3NcbiAgICAgICAgICAgICAgICBsZXQgbXVsdGlsaW5ndWFsX3RhZ3MgPSBbXTtcbiAgICAgICAgICAgICAgICAvL2xldCBtX2NvbW1lbnRzID0ge307XG4gICAgICAgICAgICAgICAgLy9sZXQgY29tbWVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICBsZXQgbV9pbmRleCA9IDE7XG5cbiAgICAgICAgICAgICAgICBsZXQgdGFncyA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IDE7XG4gICAgICAgICAgICAgICAgLy9sZXQgcm9vdF9jb21tZW50ID0gZGF0YVtcInJkZnM6Y29tbWVudFwiXTtcbiAgICAgICAgICAgICAgICBmb3IobGV0IHRlcm0gb2YgZGF0YVtcInRlcm1zXCJdKXtcbiAgICAgICAgICAgICAgICAgICAgLy9pZiBvbm9teUxhbmd1YWdlIGlzIGRlZmluZWQgY29sbGVjdCBtdWx0aWxpbmd1YWwgdGFnc1xuICAgICAgICAgICAgICAgICAgICAvL2xldCB0ZXJtc19pZCA9IHRlcm1bXCJyZGZzOmFib3V0XCJdO1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmFqYXhPcHRpb25zLm9ub215TGFuZ3VhZ2UgIT0gJycgJiYgdGVybVsnbGFiZWxzJ10gIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGxhYmVsIG9mIHRlcm1bXCJsYWJlbHNcIl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgeG1sX2xhbmcgPSBsYWJlbFtcInhtbDpsYW5nXCJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtX2xhYmVsID0gbGFiZWxbXCJyZGZzOmxhYmVsXCJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh4bWxfbGFuZyA9PSB0aGlzLmFqYXhPcHRpb25zLm9ub215TGFuZ3VhZ2UgJiYgbV9sYWJlbCAmJiBtX2xhYmVsLnRyaW0gIT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdWx0aWxpbmd1YWxfdGFncy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBtX2luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogbV9sYWJlbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiAodGVybVsnY29tbWVudHMnXSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBmb3IgKGxldCBsYWJlbCBvZiB0ZXJtWydjb21tZW50cyddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIGxldCB4bWxfbGFuZyA9IGxhYmVsW1wieG1sOmxhbmdcIl07XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIGxldCBtX2NvbW1lbnQgPSBsYWJlbFtcInJkZnM6Y29tbWVudHNcIl07IC8vVE9ETzogY2hhbmdlIHRvIGNvbW1lbnQgYWZ0ZXIgZml4aW5nIE9ub215XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIGlmICh4bWxfbGFuZyA9PSB0aGlzLmFqYXhPcHRpb25zLm9ub215TGFuZ3VhZ2UgJiYgbV9jb21tZW50ICYmIG1fY29tbWVudC50cmltICE9IFwiXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIG1fY29tbWVudHNbbV9pbmRleF0gPSBtX2NvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIH0gXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAvLyBwdXNoIHRoZSByb290IHZhbHVlIGlmIGl0IGlzIGJsYW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiAobV9jb21tZW50c1ttX2luZGV4XS5jb21tZW50ID09IHVuZGVmaW5lZCB8fCBtX2NvbW1lbnRzW21faW5kZXhdLmNvbW1lbnQudHJpbSA9PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgbV9jb21tZW50c1ttX2luZGV4XSA9IHJvb3RfY29tbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgICAgICAgICAgbV9pbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0YWdzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGluZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogdGVybVtcInJkZnM6bGFiZWxcIl1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gbGV0IG5vZGVfY29tbWVudCA9IHRlcm1bXCJyZGZzOmNvbW1lbnRcIl07XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIChub2RlX2NvbW1lbnQudHJpbSA9PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBub2RlX2NvbW1lbnQgPSByb290X2NvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBjb21tZW50c1tpbmRleF0gPSBub2RlX2NvbW1lbnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgcmV0dXJuX3RhZ3MgPSBtdWx0aWxpbmd1YWxfdGFnc1xuICAgICAgICAgICAgICAgIGlmIChyZXR1cm5fdGFncy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm5fdGFncyA9IHRhZ3NcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZXR1cm5fdGFnc1wiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXR1cm5fdGFncyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgLy9yZXN1bHRzOiB0YWdzIC0gdXNlIHRhZ3Mgd2hlbiB0aGUgbGFuZ3VhZ2UgaXMgbm90IGRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogcmV0dXJuX3RhZ3NcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuXG5cblxuXG59XG5cbmV4cG9ydCB7IEFubm90YXRpb25HVUkgfTsiLCJpbXBvcnQgeyBHZXRGb3JtYXR0ZWRUaW1lIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3RpbWUuanNcIjtcbmxldCBzaGExID0gcmVxdWlyZSgnc2hhMScpO1xuXG5jbGFzcyBJbmRleENvbnRhaW5lciB7XG4gICAgY29uc3RydWN0b3IoYW5ub3RhdG9yKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJbSW5kZXggQ29udGFpbmVyXSBDcmVhdGluZyBhbm5vdGF0aW9uIGluZGV4XCIpO1xuICAgICAgICB0aGlzLmFubm90YXRvciA9IGFubm90YXRvcjtcbiAgICAgICAgbGV0IGNvbnRhaW5lciA9ICQoXCIud2FsZG9yZi1pbmRleFwiKTtcbiAgICAgICAgaWYoY29udGFpbmVyLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgdGhpcy4kY29udGFpbmVyID0gY29udGFpbmVyLmZpcnN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRjb250YWluZXIgPSAkKFwiPGRpdiBjbGFzcz0nd2FsZG9yZi1pbmRleCcgYXJpYS1saXZlPSdwb2xpdGUnIHJvbGU9J25hdmlnYXRpb24nPjwvZGl2PlwiKS5hcHBlbmRUbyh0aGlzLmFubm90YXRvci4kY29udGFpbmVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFubm90YXRpb25MaXN0ID0gJChcIjx1bCBjbGFzcz0nd2FsZG9yZi1hbm5vdGF0aW9uLWxpc3QnIHJvbGU9J21lbnViYXInPjwvdWw+XCIpLmFwcGVuZFRvKHRoaXMuJGNvbnRhaW5lcik7XG4gICAgICAgIC8vIEF0dGFjaCBldmVudCBoYW5kbGVyc1xuICAgICAgICB0aGlzLmFubm90YXRvci4kY29udGFpbmVyLm9uKFwiT25Bbm5vdGF0aW9uc0xvYWRlZFwiLCBcbiAgICAgICAgICAgIChldmVudCwgYW5ub3RhdGlvbk1hbmFnZXIpID0+IHRoaXMuUmVidWlsZCgpKTtcbiAgICAgICAgdGhpcy5hbm5vdGF0b3IuJGNvbnRhaW5lci5vbihcIk9uQW5ub3RhdGlvblJlZ2lzdGVyZWRcIixcbiAgICAgICAgICAgIChldmVudCwgYW5ub3RhdGlvbikgPT4gdGhpcy5SZWJ1aWxkKCkpO1xuICAgICAgICB0aGlzLmFubm90YXRvci4kY29udGFpbmVyLm9uKFwiT25Bbm5vdGF0aW9uUmVtb3ZlZFwiLFxuICAgICAgICAgICAgKGV2ZW50LCBpZCkgPT4gdGhpcy5SZWJ1aWxkKCkpOyAgICAgICAgICAgIFxuXG4gICAgfVxuXG4gICAgUmVidWlsZCgpe1xuICAgICAgICB0aGlzLmFubm90YXRpb25MaXN0LmVtcHR5KCk7XG4gICAgICAgIC8vIGlmKHRoaXMuYW5ub3RhdG9yLnVucmVuZGVyZXIpIHRoaXMuYW5ub3RhdG9yLnVucmVuZGVyZXIodGhpcy5hbm5vdGF0b3IpO1xuXG4gICAgICAgIC8vIGxldCBwbHVyYWwgPSBhbm5vdGF0aW9ucy5sZW5ndGggPT0gMSA/IFwiXCIgOiBcInNcIjtcbiAgICAgICAgLy8gbGV0IHRvdGFsQW5ub3RhdGlvbnMgPSB0aGlzLmFubm90YXRvci5hbm5vdGF0aW9uTWFuYWdlci5hbm5vdGF0aW9ucy5sZW5ndGg7XG4gICAgICAgIC8vIHRoaXMuJGNvbnRhaW5lci5odG1sKGA8cD5TaG93aW5nICR7YW5ub3RhdGlvbnMubGVuZ3RofSBhbm5vdGF0aW9uJHtwbHVyYWx9ICgke3RvdGFsQW5ub3RhdGlvbnN9IHRvdGFsKS48L3A+YCk7XG5cbiAgICAgICAgLy8gQWRkIGVhY2ggYW5ub3RhdGlvbiB0byB0aGUgcmVhZG91dFxuICAgICAgICBsZXQgb3JkZXJlZCA9IHRoaXMuYW5ub3RhdG9yLkdldEFubm90YXRpb25zKCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJlZC5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICB0aGlzLmFubm90YXRpb25MaXN0LmFwcGVuZCh0aGlzLk1ha2VDb250YWluZXIodGhpcy5hbm5vdGF0b3IsIG9yZGVyZWRbaV0sIGkpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIE1ha2VDb250YWluZXIoYW5ub3RhdG9yLCBhbm5vdGF0aW9uKXtcbiAgICAgICAgLy9UT0RPOiBBUklBIGFuZCBnZW5lcmFsIHNjcmVlbiByZWFkZXIgY29tcGF0aWJpbGl0eVxuICAgICAgICBsZXQgJHBhbmVsID0gJChcIjxsaSByb2xlPSdwcmVzZW50YXRpb24nIGRhdGEtY3JlYXRvcj1cIithbm5vdGF0aW9uLmNyZWF0b3IuZW1haWwrXCIgZGF0YS10YWdzPSdcIithbm5vdGF0aW9uLnRhZ3Muam9pbihcIiwgXCIpLnJlcGxhY2UoXCInXCIsIFwiJTI3XCIpK1wiJz48L2xpPlwiKTtcbiAgICAgICAgLy9sZXQgdGV4dCA9IEpTT04uc3RyaW5naWZ5KGFubm90YXRpb24uQXNPcGVuQW5ub3RhdGlvbigpLCBudWxsLCAyKTtcblxuICAgICAgICBsZXQgaGVhZGVyVGV4dCA9IEdldEZvcm1hdHRlZFRpbWUoYW5ub3RhdGlvbi5iZWdpblRpbWUpICsgXCIgLSBcIiArIEdldEZvcm1hdHRlZFRpbWUoYW5ub3RhdGlvbi5lbmRUaW1lKTtcbiBcbiAgICAgICAgLy8gQWRkIGNsaWNrYWJsZSBoZWFkZXIgdGhhdCBicmluZ3MgdXAgdGhlIGVkaXQgaW50ZXJmYWNlLlxuICAgICAgICBsZXQgJGhlYWRlciA9ICQoXCI8YSBocmVmPScnIHRpdGxlPSdHbyB0byBBbm5vdGF0aW9uJyByb2xlPSdtZW51aXRlbSc+XCIraGVhZGVyVGV4dCtcIjwvYT48YnI+XCIpO1xuICAgICAgICAkaGVhZGVyLmNsaWNrKCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBhbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC5jdXJyZW50VGltZSA9IGFubm90YXRpb24uYmVnaW5UaW1lO1xuICAgICAgICAgICAgLy8gaWYoYW5ub3RhdG9yLnBsYXllci52aWRlb0VsZW1lbnQuYW5ub3RhdGlvblRpbWVvdXQpIGNsZWFyVGltZW91dChhbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC5hbm5vdGF0aW9uVGltZW91dCk7XG4gICAgICAgICAgICAvLyBhbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC5hbm5vdGF0aW9uVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIC8vICAgICBhbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC5wYXVzZSgpfSwgKGFubm90YXRpb24uZW5kVGltZS1hbm5vdGF0aW9uLmJlZ2luVGltZSkgKiAxMDAwXG4gICAgICAgICAgICAvLyApO1xuICAgICAgICAgICAgLy9hbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC5zcmM9YW5ub3RhdG9yLnVybCArIFwiI3Q9XCIgKyBhbm5vdGF0aW9uLmJlZ2luVGltZSArXCIsXCIrYW5ub3RhdGlvbi5lbmRUaW1lO1xuICAgICAgICAgICAgLy9hbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC5wbGF5KCk7XG4gICAgICAgICAgICBhbm5vdGF0b3IucGxheWVyLlBsYXkoKTtcbiAgICAgICAgICAgIGFubm90YXRvci5wbGF5ZXIuZW5kVGltZSA9IGFubm90YXRpb24uZW5kVGltZTtcbiAgICAgICAgICAgIGlmKGFubm90YXRpb24uYmVnaW5UaW1lKzEgPiBhbm5vdGF0aW9uLmVuZFRpbWUpe1xuICAgICAgICAgICAgICAgIGFubm90YXRvci5wbGF5ZXIuUGF1c2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHBhbmVsLmFwcGVuZCgkaGVhZGVyKTtcbiAgICAgICAgbGV0ICRjb250ZW50ID0gJChcIjxwPjwvcD5cIik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICRjb250ZW50LmFwcGVuZChcIjxiPlRleHQ6IDwvYj4gXCIgKyBhbm5vdGF0aW9uLmJvZHkuZmlsdGVyKGl0ZW0gPT4gaXRlbS5wdXJwb3NlID09PSBcImRlc2NyaWJpbmdcIilbMF0udmFsdWUpO1xuICAgICAgICAkY29udGVudC5hcHBlbmQoXCI8YnI+XCIpO1xuICAgICAgICAkY29udGVudC5hcHBlbmQoXCI8Yj5UYWdzOiA8L2I+IFwiICsgYW5ub3RhdGlvbi50YWdzLmpvaW4oXCIsIFwiKSk7XG4gICAgICAgICRjb250ZW50LmFwcGVuZChcIjxicj5cIik7XG5cbiAgICAgICAgJHBhbmVsLmFwcGVuZCgkY29udGVudCk7XG4gICAgICAgICRwYW5lbC5hcHBlbmRUbyhhbm5vdGF0b3IuJGFubm90YXRpb25MaXN0KTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJHBhbmVsKTtcbiAgICAgICAgcmV0dXJuICRwYW5lbDtcbiAgICB9XG5cbn1cblxuZXhwb3J0IHsgSW5kZXhDb250YWluZXIgfTsiLCJpbXBvcnQgeyBHZXRGb3JtYXR0ZWRUaW1lIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3RpbWUuanNcIjtcbmxldCBzaGExID0gcmVxdWlyZSgnc2hhMScpO1xuXG5jbGFzcyBJbmZvQ29udGFpbmVyIHtcbiAgICBjb25zdHJ1Y3Rvcihhbm5vdGF0b3Ipe1xuICAgICAgICB0aGlzLmFubm90YXRvciA9IGFubm90YXRvcjtcbiAgICAgICAgbGV0IGNvbnRhaW5lciA9ICQoXCIud2FsZG9yZi1pbmZvXCIpO1xuICAgICAgICBpZihjb250YWluZXIubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICB0aGlzLiRjb250YWluZXIgPSBjb250YWluZXIuZmlyc3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJGNvbnRhaW5lciA9ICQoXCI8ZGl2IGNsYXNzPSd3YWxkb3JmLWluZm8nIGFyaWEtbGl2ZT0ncG9saXRlJyBhcmlhLWF0b21pYz0ndHJ1ZSc+PC9kaXY+XCIpLmFwcGVuZFRvKHRoaXMuYW5ub3RhdG9yLiRjb250YWluZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgUmVidWlsZChhbm5vdGF0aW9ucywgY2xlYXJDb250YWluZXIpe1xuICAgICAgICBpZihjbGVhckNvbnRhaW5lcikgdGhpcy4kY29udGFpbmVyLmVtcHR5KCk7XG4gICAgICAgIGlmKHRoaXMuYW5ub3RhdG9yLnVucmVuZGVyZXIpIHRoaXMuYW5ub3RhdG9yLnVucmVuZGVyZXIodGhpcy5hbm5vdGF0b3IpO1xuXG4gICAgICAgIC8vIGxldCBwbHVyYWwgPSBhbm5vdGF0aW9ucy5sZW5ndGggPT0gMSA/IFwiXCIgOiBcInNcIjtcbiAgICAgICAgLy8gbGV0IHRvdGFsQW5ub3RhdGlvbnMgPSB0aGlzLmFubm90YXRvci5hbm5vdGF0aW9uTWFuYWdlci5hbm5vdGF0aW9ucy5sZW5ndGg7XG4gICAgICAgIC8vIHRoaXMuJGNvbnRhaW5lci5odG1sKGA8cD5TaG93aW5nICR7YW5ub3RhdGlvbnMubGVuZ3RofSBhbm5vdGF0aW9uJHtwbHVyYWx9ICgke3RvdGFsQW5ub3RhdGlvbnN9IHRvdGFsKS48L3A+YCk7XG5cbiAgICAgICAgLy8gQWRkIGVhY2ggYW5ub3RhdGlvbiB0byB0aGUgcmVhZG91dFxuICAgICAgICBsZXQgcmVuZGVyZXIgPSB0aGlzLmFubm90YXRvci5yZW5kZXJlciA9PT0gZmFsc2UgPyB0aGlzLk1ha2VDb250YWluZXIgOiB0aGlzLmFubm90YXRvci5yZW5kZXJlcjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbm5vdGF0aW9ucy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKHJlbmRlcmVyKHRoaXMuYW5ub3RhdG9yLCBhbm5vdGF0aW9uc1tpXSwgaSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgTWFrZUNvbnRhaW5lcihhbm5vdGF0b3IsIGFubm90YXRpb24sIGluZGV4KXtcbiAgICAgICAgbGV0ICRwYW5lbCA9ICQoXCI8cD48L3A+XCIpLmFwcGVuZFRvKCQoXCI8ZGl2PjwvZGl2PlwiKS5hcHBlbmRUbyhhbm5vdGF0b3IuJGNvbnRhaW5lcikpO1xuICAgICAgICAvL2xldCB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkoYW5ub3RhdGlvbi5Bc09wZW5Bbm5vdGF0aW9uKCksIG51bGwsIDIpO1xuXG4gICAgICAgIC8vIEFkZCBjbGlja2FibGUgaGVhZGVyIHRoYXQgYnJpbmdzIHVwIHRoZSBlZGl0IGludGVyZmFjZS5cbiAgICAgICAgbGV0ICRoZWFkZXIgPSAkKGA8Yj5Bbm5vdGF0aW9uICR7aW5kZXggKyAxfTo8L2I+PGJyPmApO1xuICAgICAgICBpZihhbm5vdGF0b3Iua2lvc2tNb2RlPT1mYWxzZSl7XG4gICAgICAgICAgICAkaGVhZGVyID0gJChgPGEgaHJlZj0nJyB0aXRsZT0nRWRpdCBBbm5vdGF0aW9uJz48Yj5Bbm5vdGF0aW9uICR7aW5kZXggKyAxfTo8L2I+PGJyPjwvYT5gKTtcbiAgICAgICAgICAgICRoZWFkZXIuY2xpY2soIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgYW5ub3RhdG9yLmd1aS5CZWdpbkVkaXRpbmcoYW5ub3RhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgICRwYW5lbC5hcHBlbmQoJGhlYWRlcik7XG4gICAgICAgIGxldCAkY29udGVudCA9ICQoXCI8cD48L3A+XCIpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICRjb250ZW50LmFwcGVuZChcIjxiPlRleHQ6IDwvYj4gXCIgKyBhbm5vdGF0aW9uLmJvZHkuZmlsdGVyKGl0ZW0gPT4gaXRlbS5wdXJwb3NlID09PSBcImRlc2NyaWJpbmdcIilbMF0udmFsdWUpO1xuICAgICAgICAkY29udGVudC5hcHBlbmQoXCI8YnI+XCIpO1xuICAgICAgICAkY29udGVudC5hcHBlbmQoXCI8Yj5UYWdzOiA8L2I+IFwiICsgYW5ub3RhdGlvbi50YWdzLmpvaW4oXCIsIFwiKSk7XG4gICAgICAgICRjb250ZW50LmFwcGVuZChcIjxicj5cIik7XG4gICAgICAgICRjb250ZW50LmFwcGVuZChcIjxiPlRpbWU6IDwvYj4gXCIgXG4gICAgICAgICAgICAgICAgKyBHZXRGb3JtYXR0ZWRUaW1lKGFubm90YXRpb24uYmVnaW5UaW1lKSBcbiAgICAgICAgICAgICAgICArIFwiIC0gXCIgXG4gICAgICAgICAgICAgICAgKyBHZXRGb3JtYXR0ZWRUaW1lKGFubm90YXRpb24uZW5kVGltZSkpO1xuICAgICAgICAkY29udGVudC5hcHBlbmQoXCI8YnI+XCIpO1xuXG4gICAgICAgICRjb250ZW50LmFwcGVuZChcIjxiPlN1Ym1pdHRlZCBieTo8L2I+PGJyIC8+XCJcbiAgICAgICAgICAgICAgICArIChhbm5vdGF0aW9uLmNyZWF0b3IgIT0gbnVsbCA/IGFubm90YXRpb24uY3JlYXRvci5uaWNrbmFtZSArICcgKCcgKyBhbm5vdGF0aW9uLmNyZWF0b3IuZW1haWwgKyAnKScgOiBcInVuc3BlY2lmaWVkXCIpXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAvLyRwYXJhZ3JhcGguYXBwZW5kKFwiPHN0cm9uZz5Bbm5vdGF0aW9uIFwiICsgKGluZGV4ICsgMSkgKyBcIjo8L3N0cm9uZz48YnI+PHByZT5cIiArIHRleHQuZXNjYXBlSFRNTCgpICsgXCI8L3ByZT5cIik7XG5cbiAgICAgICAgJHBhbmVsLmFwcGVuZCgkY29udGVudCk7XG4gICAgICAgIHJldHVybiAkcGFuZWw7XG4gICAgfVxuXG59XG5cbmV4cG9ydCB7IEluZm9Db250YWluZXIgfTsiLCJcbmNsYXNzIE1lc3NhZ2VPdmVybGF5IHtcbiAgICBjb25zdHJ1Y3Rvcihhbm5vdGF0b3Ipe1xuICAgICAgICB0aGlzLmFubm90YXRvciA9IGFubm90YXRvcjtcblxuICAgICAgICB0aGlzLiRjb250YWluZXIgPSAkKFwiPGRpdiBjbGFzcz0nd2FsZG9yZi1tZXNzYWdlLW92ZXJsYXknPjwvZGl2PlwiKTtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZFRvKHRoaXMuYW5ub3RhdG9yLnBsYXllci4kY29udGFpbmVyKTtcblxuICAgICAgICB0aGlzLiR0ZXh0ID0gJChcIjxwIHJvbGU9J2FsZXJ0JyBhcmlhLWxpdmU9J2Fzc2VydGl2ZScgYXJpYS1hdG9taWM9J3RydWUnPjwvcD5cIikuYXBwZW5kVG8odGhpcy4kY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLmZhZGVPdXQoMCk7XG5cbiAgICB9XG5cbiAgICBTaG93RXJyb3IobWVzc2FnZSwgZHVyYXRpb24gPSAzLjApe1xuICAgICAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoXCJ3YWxkb3JmLW1lc3NhZ2Utb3ZlcmxheS1lcnJvclwiKTtcblxuICAgICAgICB0aGlzLl9TaG93VGV4dChtZXNzYWdlLCBkdXJhdGlvbik7XG4gICAgfVxuXG4gICAgU2hvd01lc3NhZ2UobWVzc2FnZSwgZHVyYXRpb24gPSA1LjApe1xuICAgICAgICB0aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoXCJ3YWxkb3JmLW1lc3NhZ2Utb3ZlcmxheS1lcnJvclwiKTtcblxuICAgICAgICB0aGlzLl9TaG93VGV4dChtZXNzYWdlLCBkdXJhdGlvbik7XG4gICAgfVxuXG4gICAgX1Nob3dUZXh0KG1lc3NhZ2UsIGR1cmF0aW9uID0gNS4wKXtcbiAgICAgICAgdGhpcy4kdGV4dC5odG1sKG1lc3NhZ2UpO1xuICAgICAgICAvL3RoaXMuJGNvbnRhaW5lci5zdG9wKHRydWUsIHRydWUpO1xuICAgICAgICB0aGlzLiRjb250YWluZXIuZmluaXNoKCk7XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci5cbiAgICAgICAgICAgIGZhZGVJbigwKS5cbiAgICAgICAgICAgIGRlbGF5KGR1cmF0aW9uICogMTAwMCkuXG4gICAgICAgICAgICBmYWRlT3V0KDQwMCk7XG4gICAgfVxuXG59XG5cbmV4cG9ydCB7IE1lc3NhZ2VPdmVybGF5IH07IiwiXG4vKipcbiAqIE1hbmFnZXMgdGhlIGNyZWF0aW5nIG9yIGVkaXRpbmcgb2YgYSBzaW5nbGUgcG9seWdvbiBvbiB0aGUgdmlkZW8uXG4gKiBDb25zaXN0cyBvZiBhIHRvb2xiYXIsIGFuIG92ZXJsYXksIGFuZCB0aGUgcG9seWdvbiBpbnNpZGUgdGhlIG92ZXJsYXkuXG4gKlxuICogQ2xpY2sgdG8gcGxhY2Ugb3IgcmVtb3ZlIGEgZHJhZ2dhYmxlIHBvaW50LiBQb2ludHMgc2hvdWxkIGJlXG4gKiBwdXQgZG93biBpbiBjbG9ja3dpc2Ugb3JkZXIuXG4gKi9cbmNsYXNzIFBvbHlnb25FZGl0b3Ige1xuICAgIGNvbnN0cnVjdG9yKGFubm90YXRvcil7XG4gICAgICAgIHRoaXMuYW5ub3RhdG9yID0gYW5ub3RhdG9yO1xuICAgICAgICB0aGlzLmJhc2VaID0gMjE0NzQ4MzY0OTtcbiAgICAgICAgdGhpcy4kYnJlYWRjcnVtYnMgPSBbXTtcbiAgICAgICAgdGhpcy4kcG9seWdvbnMgPSBbXTtcbiAgICAgICAgdGhpcy4kdGVtcEJyZWFkQ3J1bWJzID0gW107XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSB2aWRlbyBvdmVybGF5XG4gICAgICAgIHRoaXMuJGNsaWNrU3VyZmFjZSA9ICQoXCI8ZGl2IGNsYXNzPSd3YWxkb3JmLWVkaXQtb3ZlcmxheSB3YWxkb3JmLXZwLWNsaWNrLXN1cmZhY2UnPjwvZGl2PlwiKS5hcHBlbmRUbyh0aGlzLmFubm90YXRvci5wbGF5ZXIuJGNvbnRhaW5lcik7XG4gICAgICAgIC8vdGhpcy4kY2xpY2tTdXJmYWNlLmNzcyhcInotaW5kZXhcIiwgdGhpcy5iYXNlWik7XG4gICAgICAgIHRoaXMuJGNsaWNrU3VyZmFjZS5jbGljaygoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuT25TdXJmYWNlQ2xpY2soZXZlbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDcmVhdGUgdGhlIHBvbHkgb2JqZWN0IGZvciBzdGFydCBwb3NpdGlvbiBwb2x5Z29uXG4gICAgICAgIHRoaXMuJHN0YXJ0UG9seSA9IFwiXCI7XG4gICAgICAgIFxuICAgICAgICAvLyBDcmVhdGUgdGhlIHBvbHkgb2JqZWN0XG4gICAgICAgIHRoaXMuJHBvbHkgPSAkKFwiPGRpdiBjbGFzcz0nd2FsZG9yZi1lZGl0LXBvbHknPjwvZGl2PlwiKS5hcHBlbmRUbyh0aGlzLmFubm90YXRvci5wbGF5ZXIuJGNvbnRhaW5lcik7XG4gICAgICAgIHRoaXMuJHBvbHkuY3NzKFwiei1pbmRleFwiLCB0aGlzLmJhc2VaICsgMSk7XG5cbiAgICAgICAgdGhpcy5SZXNpemVPdmVybGF5KCk7XG4gICAgICAgIHRoaXMuYW5ub3RhdG9yLnBsYXllci4kY29udGFpbmVyLm9uKFwiT25GdWxsc2NyZWVuQ2hhbmdlXCIsIChldmVudCwgc2V0RnVsbHNjcmVlbikgPT4gdGhpcy5SZXNpemVPdmVybGF5KCkpO1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgdG9vbGJhciB1cCB0b3BcbiAgICAgICAgdGhpcy4kYmFyID0gJChcIjxkaXYgY2xhc3M9J3dhbGRvcmYtdnAtcG9zdCc+PC9kaXY+XCIpLmFwcGVuZFRvKHRoaXMuYW5ub3RhdG9yLnBsYXllci4kY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy4kcG9zdFRvb2xiYXIgPSAkKFwiPGRpdiBjbGFzcz0nZmxleC10b29sYmFyJz48L2Rpdj5cIikuYXBwZW5kVG8odGhpcy4kYmFyKTtcbiAgICAgICAgLy8gSW52aXNpYmxlIGV4cGFuZGluZyBkaXZpZGVyXG4gICAgICAgIC8vLTMvL3RoaXMuJHBvc3RUb29sYmFyLmFwcGVuZCgkKFwiPGRpdj48cCBzdHlsZT0nY29sb3I6d2hpdGUnPkVkaXQgUG9seWdvbjwvcD48L2Rpdj5cIikuY3NzKFwiZmxleC1ncm93XCIsIDEpLmNzcyhcIm9yZGVyXCIsIDApKTtcblxuXG4gICAgICAgIC8vIE1ha2UgXCJDb2xsZWN0IFBvbHlnb24gc3RhdGVcIiBidXR0b25cbiAgICAgICAgdGhpcy4kY2FwUG9seUJ1dHRvbiA9ICQoXCI8YnV0dG9uPkNhcHR1cmUgUG9seWdvbjwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgaWNvbjogXCJmYSBmYS1jYW1lcmEtcmV0cm9cIixcbiAgICAgICAgICAgIHNob3dMYWJlbDogZmFsc2VcbiAgICAgICAgfSkuY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIkNhcHR1cmluZyB0aGUgcG9seWdvblwiKTtcbiAgICAgICAgICAgIC8vdGhpcy5TZXRWaXNpYmxlKGZhbHNlKTtcbiAgICAgICAgICAgIC8vdGhpcy5HZXRQb2ludHMoKTtcblxuICAgICAgICAgICAgLy8gQnVpbGQgcG9seWdvbiBzZWxlY3RvclxuICAgICAgICAgICAgLy8gbGV0IHBvaW50cyA9IHRoaXMuR2V0UG9pbnRzKCk7XG4gICAgICAgICAgICAvLyBpZihwb2ludHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gICAgIGxldCBwb2ludHNTdHIgPSBwb2ludHMubWFwKGl0ZW0gPT4geyByZXR1cm4gYCR7aXRlbVswXX0sJHtpdGVtWzFdfWAgfSkuam9pbihcIiBcIik7XG4gICAgICAgICAgICAvLyAgICAgbGV0IHBvbHlnb25TZWxlY3RvciA9IHtcbiAgICAgICAgICAgIC8vICAgICAgICAgXCJ0eXBlXCI6IFwiU3ZnU2VsZWN0b3JcIixcbiAgICAgICAgICAgIC8vICAgICAgICAgXCJ2YWx1ZVwiOiBgPHN2Zzpzdmcgdmlld0JveD0nMCAwIDEwMCAxMDAnIHByZXNlcnZlQXNwZWN0UmF0aW89J25vbmUnPjxwb2x5Z29uIHBvaW50cz0nJHtwb2ludHNTdHJ9JyAvPjwvc3ZnOnN2Zz5gIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI0ODk4NzI4XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gICAgIHRtcFNlbGVjdG9ycy5wdXNoKHBvbHlnb25TZWxlY3Rvcik7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInRtcFNlbGVjdG9yc1wiKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRtcFNlbGVjdG9ycyk7XG4gICAgICAgICAgICB0aGlzLmFubm90YXRvci5BZGRQb2x5Z29uU2V0KHRoaXMuYW5ub3RhdG9yLmFubm90YXRpb24uZ2V0UG9seSgpKTtcblxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy4kY2FwUG9seUJ1dHRvbi5jc3MoXCJtYXJnaW4tcmlnaHRcIiwgXCIxNXB4XCIpO1xuICAgICAgICB0aGlzLiRjYXBQb2x5QnV0dG9uLmF0dHIoJ3RpdGxlJywgXCJDYXB0dXJlIHBvbHlnb25cIik7XG4gICAgICAgIC8vLTMvL3RoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJGNhcFBvbHlCdXR0b24sIHRoaXMuJHBvc3RUb29sYmFyLCAxLCAnZmxleC1lbmQnKTtcblxuICAgICAgICAvLyBDcmVhdGUgdW5kbyBidXR0b25cbiAgICAgICAgdGhpcy4kdW5kb0J1dHRvbiA9ICQoXCI8YnV0dG9uPlJlbW92ZSBMYXN0IFBvaW50PC9idXR0b24+XCIpLmJ1dHRvbih7XG4gICAgICAgICAgICBpY29uOiBcImZhIGZhLXVuZG9cIixcbiAgICAgICAgICAgIHNob3dMYWJlbDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuJHVuZG9CdXR0b24uY3NzKFwibWFyZ2luLXJpZ2h0XCIsIFwiMTVweFwiKTtcbiAgICAgICAgdGhpcy4kdW5kb0J1dHRvbi5hdHRyKCd0aXRsZScsIFwiUmVtb3ZlIGxhc3QgcG9pbnRcIik7XG4gICAgICAgIHRoaXMuJHVuZG9CdXR0b24uY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5SZW1vdmVMYXN0QnJlYWRjcnVtYigpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8tMy8vdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kdW5kb0J1dHRvbiwgdGhpcy4kcG9zdFRvb2xiYXIsIDEsICdmbGV4LWVuZCcpO1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgY29uZmlybSBidXR0b25cbiAgICAgICAgdGhpcy4kY29uZmlybUJ1dHRvbiA9ICQoXCI8YnV0dG9uPkZpbmlzaCBwb2x5Z29uPC9idXR0b24+XCIpLmJ1dHRvbih7XG4gICAgICAgICAgICBpY29uOiBcImZhIGZhLWNoZWNrXCIsXG4gICAgICAgICAgICBzaG93TGFiZWw6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLiRjb25maXJtQnV0dG9uLmF0dHIoJ3RpdGxlJywgXCJGaW5pc2ggcG9seWdvblwiKTtcbiAgICAgICAgdGhpcy4kY29uZmlybUJ1dHRvbi5hZGRDbGFzcyhcIndhbGRvcmYtY29uZmlybS1idXR0b25cIik7XG4gICAgICAgIHRoaXMuJGNvbmZpcm1CdXR0b24uY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbEpTT04gPSB0aGlzLkdldEpTT04oKTtcbiAgICAgICAgICAgIHRoaXMuRG9uZSgpO1xuICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IuJGNvbnRhaW5lci50cmlnZ2VyKFwiT25Qb2x5Z29uRWRpdGluZ0VuZGVkXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8tMy8vdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kY29uZmlybUJ1dHRvbiwgdGhpcy4kcG9zdFRvb2xiYXIsIDMsICdmbGV4LWVuZCcpO1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgY2FuY2VsIGJ1dHRvblxuICAgICAgICB0aGlzLiRjYW5jZWxCdXR0b24gPSAkKFwiPGJ1dHRvbj5DYW5jZWwgcG9seWdvbiBlZGl0aW5nPC9idXR0b24+XCIpLmJ1dHRvbih7XG4gICAgICAgICAgICBpY29uOiBcImZhIGZhLXJlbW92ZVwiLFxuICAgICAgICAgICAgc2hvd0xhYmVsOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy4kY2FuY2VsQnV0dG9uLmFkZENsYXNzKFwid2FsZG9yZi1jYW5jZWwtYnV0dG9uXCIpO1xuICAgICAgICB0aGlzLiRjYW5jZWxCdXR0b24uYXR0cigndGl0bGUnLCBcIkNhbmNlbCBwb2x5Z29uIGVkaXRpbmdcIik7XG4gICAgICAgIHRoaXMuJGNhbmNlbEJ1dHRvbi5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICAvL1Jlc3RvcmUgdGhlIG9yaWdpbmFsIHN0YXRlXG4gICAgICAgICAgICB0aGlzLlJlc3RvcmUoKTtcbiAgICAgICAgICAgIHRoaXMuRG9uZSgpO1xuICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IuJGNvbnRhaW5lci50cmlnZ2VyKFwiT25Qb2x5Z29uRWRpdGluZ0VuZGVkXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8tMy8vdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kY2FuY2VsQnV0dG9uLCB0aGlzLiRwb3N0VG9vbGJhciwgMiwgJ2ZsZXgtZW5kJyk7XG5cbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZSgoKSA9PiB0aGlzLlJlc2l6ZU92ZXJsYXkoKSk7XG5cblxuICAgICAgICAvKiBcbiAgICAgICAgKiBuZXcgVUlcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy4kZWRpdERpYWxvZyA9ICQoXCI8ZGl2IGlkPSdlZGl0LWRpYWxvZycgY2xhc3M9J3dhbGRvcmYtZWRpdC1vdmVybGF5IHdhbGRvcmYtdnAtY2xpY2stc3VyZmFjZSc+PC9kaXY+XCIpLmFwcGVuZFRvKHRoaXMuYW5ub3RhdG9yLnBsYXllci4kY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy4kZWRpdERpYWxvZy5kcmFnZ2FibGUoKTtcbiAgICAgICAgdGhpcy4kZWRpdERpYWxvZy5jc3MoJ3otaW5kZXgnLCB0aGlzLmJhc2VaICsgMTAwKTtcbiAgICAgICAgdGhpcy4kZWRpdERpYWxvZy5jbGljaygoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuT25TdXJmYWNlQ2xpY2soZXZlbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLiRzcGFjZSA9ICQoXCI8ZGl2PiZuYnNwOzwvZGl2Pjxocj5cIik7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJHNwYWNlLCB0aGlzLiRlZGl0RGlhbG9nLCAxLCAnZmxleC1lbmQnKTtcblxuICAgICAgICAvLyBDcmVhdGUgdW5kbyBidXR0b25cbiAgICAgICAgdGhpcy4kdW5kb0J1dHRvbjEgPSAkKFwiPGJ1dHRvbj5SZW1vdmUgTGFzdCBQb2ludDwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgaWNvbjogXCJmYSBmYS11bmRvXCIsXG4gICAgICAgICAgICBzaG93TGFiZWw6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLiR1bmRvQnV0dG9uMS5jc3MoXCJtYXJnaW5cIiwgXCIwcHggNXB4IDRweCA1cHhcIik7XG4gICAgICAgIHRoaXMuJHVuZG9CdXR0b24xLmF0dHIoJ3RpdGxlJywgXCJSZW1vdmUgbGFzdCBwb2ludFwiKTtcbiAgICAgICAgdGhpcy4kdW5kb0J1dHRvbjEuY3NzKCd6LWluZGV4JywgdGhpcy5iYXNlWiArIDEwNSk7XG4gICAgICAgIHRoaXMuJHVuZG9CdXR0b24xLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuUmVtb3ZlTGFzdEJyZWFkY3J1bWIoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJHVuZG9CdXR0b24xLCB0aGlzLiRlZGl0RGlhbG9nLCAxLCAnZmxleC1lbmQnKTtcblxuICAgICAgICAvLyBNYWtlIFwiQ29sbGVjdCBQb2x5Z29uIHN0YXRlXCIgYnV0dG9uXG4gICAgICAgIHRoaXMuJGNhcFBvbHlCdXR0b24xID0gJChcIjxidXR0b24+Q2FwdHVyZSBQb2x5Z29uPC9idXR0b24+XCIpLmJ1dHRvbih7XG4gICAgICAgICAgICBpY29uOiBcImZhIGZhLWNhbWVyYS1yZXRyb1wiLFxuICAgICAgICAgICAgc2hvd0xhYmVsOiBmYWxzZVxuICAgICAgICB9KS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkNhcHR1cmluZyB0aGUgcG9seWdvblwiKTtcbiAgICAgICAgICAgIC8vIC8vdGhpcy5TZXRWaXNpYmxlKGZhbHNlKTtcbiAgICAgICAgICAgIC8vIC8vdGhpcy5HZXRQb2ludHMoKTtcblxuICAgICAgICAgICAgLy8gbGV0IHRtcFNlbGVjdG9ycyA9IFtdO1xuXG4gICAgICAgICAgICAvLyAvLyBCdWlsZCBwb2x5Z29uIHNlbGVjdG9yXG4gICAgICAgICAgICAvLyBsZXQgcG9pbnRzID0gdGhpcy5HZXRQb2ludHMoKTtcbiAgICAgICAgICAgIC8vIGlmKHBvaW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyAgICAgbGV0IHBvaW50c1N0ciA9IHBvaW50cy5tYXAoaXRlbSA9PiB7IHJldHVybiBgJHtpdGVtWzBdfSwke2l0ZW1bMV19YCB9KS5qb2luKFwiIFwiKTtcbiAgICAgICAgICAgIC8vICAgICBsZXQgcG9seWdvblNlbGVjdG9yID0ge1xuICAgICAgICAgICAgLy8gICAgICAgICBcInR5cGVcIjogXCJTdmdTZWxlY3RvclwiLFxuICAgICAgICAgICAgLy8gICAgICAgICBcInZhbHVlXCI6IGA8c3ZnOnN2ZyB2aWV3Qm94PScwIDAgMTAwIDEwMCcgcHJlc2VydmVBc3BlY3RSYXRpbz0nbm9uZSc+PHBvbHlnb24gcG9pbnRzPScke3BvaW50c1N0cn0nIC8+PC9zdmc6c3ZnPmAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjQ4OTg3MjhcbiAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAvLyAgICAgdG1wU2VsZWN0b3JzLnB1c2gocG9seWdvblNlbGVjdG9yKTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwidG1wU2VsZWN0b3JzXCIpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codG1wU2VsZWN0b3JzKTtcbiAgICAgICAgICAgIHRoaXMuQWRkUG9seWdvblNldCgpO1xuICAgICAgICAgICAgLy90aGlzLmFubm90YXRvci5BZGRQb2x5Z29uU2V0KHRoaXMuYW5ub3RhdG9yLmFubm90YXRpb24uZ2V0UG9seSgpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuJGNhcFBvbHlCdXR0b24xLmNzcyhcIm1hcmdpblwiLCBcIjBweCA1cHggNHB4IDVweFwiKTtcbiAgICAgICAgdGhpcy4kY2FwUG9seUJ1dHRvbjEuYXR0cigndGl0bGUnLCBcIkNhcHR1cmUgUG9seWdvblwiKTtcbiAgICAgICAgdGhpcy4kY2FwUG9seUJ1dHRvbjEuY3NzKCd6LWluZGV4JywgdGhpcy5iYXNlWiArIDEwNSk7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJGNhcFBvbHlCdXR0b24xLCB0aGlzLiRlZGl0RGlhbG9nLCAxLCAnZmxleC1lbmQnKTtcblxuICAgICAgICAvLyBDcmVhdGUgdGhlIGNhbmNlbCBidXR0b25cbiAgICAgICAgdGhpcy4kY2FuY2VsQnV0dG9uMSA9ICQoXCI8YnV0dG9uPkNhbmNlbCBwb2x5Z29uIGVkaXRpbmc8L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgIGljb246IFwiZmEgZmEtcmVtb3ZlXCIsXG4gICAgICAgICAgICBzaG93TGFiZWw6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLiRjYW5jZWxCdXR0b24xLmNzcyhcIm1hcmdpblwiLCBcIjBweCA1cHggNHB4IDVweFwiKTtcbiAgICAgICAgdGhpcy4kY2FuY2VsQnV0dG9uMS5hZGRDbGFzcyhcIndhbGRvcmYtY2FuY2VsLWJ1dHRvblwiKTtcbiAgICAgICAgdGhpcy4kY2FuY2VsQnV0dG9uMS5hdHRyKCd0aXRsZScsIFwiQ2FuY2VsIFBvbHlnb24gRWRpdGluZ1wiKTtcbiAgICAgICAgdGhpcy4kY2FuY2VsQnV0dG9uMS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICAvL1Jlc3RvcmUgdGhlIG9yaWdpbmFsIHN0YXRlXG4gICAgICAgICAgICB0aGlzLlJlc3RvcmUoKTtcbiAgICAgICAgICAgIHRoaXMuRG9uZSgpO1xuICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IuJGNvbnRhaW5lci50cmlnZ2VyKFwiT25Qb2x5Z29uRWRpdGluZ0VuZGVkXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kY2FuY2VsQnV0dG9uMSwgdGhpcy4kZWRpdERpYWxvZywgMiwgJ2ZsZXgtZW5kJyk7XG5cbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZSgoKSA9PiB0aGlzLlJlc2l6ZU92ZXJsYXkoKSk7XG5cbiAgICAgICAgdGhpcy5Eb25lKCk7XG4gICAgfVxuXG4gICAgT25TdXJmYWNlQ2xpY2soZXZlbnQpe1xuICAgICAgICBpZiAoJChldmVudC5jdXJyZW50VGFyZ2V0KS5hdHRyKFwiaWRcIikgPT0gXCJlZGl0LWRpYWxvZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgYSBicmVhZGNydW1iIG9uIGNsaWNrXG4gICAgICAgIGxldCB0YXJnZXQgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICBsZXQgeCA9IGV2ZW50LnBhZ2VYIC0gdGFyZ2V0Lm9mZnNldCgpLmxlZnQ7XG4gICAgICAgIGxldCB5ID0gZXZlbnQucGFnZVkgLSB0YXJnZXQub2Zmc2V0KCkudG9wO1xuICAgICAgICBcbiAgICAgICAgbGV0IHhQZXJjZW50ID0gKHggLyB0YXJnZXQud2lkdGgoKSkgKiAxMDA7XG4gICAgICAgIGxldCB5UGVyY2VudCA9ICh5IC8gdGFyZ2V0LmhlaWdodCgpKSAqIDEwMDtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuQWRkQnJlYWRjcnVtYih4UGVyY2VudCwgeVBlcmNlbnQpO1xuICAgICAgICBcbiAgICAgICAgLy90aGlzLm5ld1BvbHlQb2ludHMucHVzaChbeFBlcmNlbnQudG9GaXhlZCgzKSwgeVBlcmNlbnQudG9GaXhlZCgzKV0pO1xuICAgICAgICB0aGlzLlVwZGF0ZVBvbHlDbGlwcGluZygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgYnJlYWRjcnVtYiBhdCB0aGUgZ2l2ZW4gKHgsIHkpIHBvaW50IG9uIHRoZVxuICAgICAqIGNsaWNrU3VyZmFjZSwgd2hlcmUgeCBhbmQgeSBhcmUgcGVyY2VudGFnZXMgZnJvbSAwIHRvIDEwMC5cbiAgICAgKi9cbiAgICBBZGRCcmVhZGNydW1iKHhQZXJjZW50LCB5UGVyY2VudCl7XG4gICAgICAgIGxldCAkYnJlYWRjcnVtYiA9ICQoXCI8ZGl2IGNsYXNzPSdicmVhZGNydW1iJz48L2Rpdj5cIik7XG4gICAgICAgICRicmVhZGNydW1iLmFwcGVuZFRvKHRoaXMuJGNsaWNrU3VyZmFjZSk7XG4gICAgICAgICRicmVhZGNydW1iLmNzcyhcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIik7XG5cbiAgICAgICAgLy8gUGVyY2VudGFnZSByZXByZXNlbnRhdGlvbnMgb2YgYnJlYWRjcnVtYiB3aWR0aCBhbmQgaGVpZ2h0XG4gICAgICAgIGxldCBvZmZQZXJjZW50WCA9ICgkYnJlYWRjcnVtYi5vdXRlcldpZHRoKCkgLyB0aGlzLiRjbGlja1N1cmZhY2Uud2lkdGgoKSkgKiAxMDA7XG4gICAgICAgIGxldCBvZmZQZXJjZW50WSA9ICgkYnJlYWRjcnVtYi5vdXRlckhlaWdodCgpIC8gdGhpcy4kY2xpY2tTdXJmYWNlLmhlaWdodCgpKSAqIDEwMDtcbiAgICAgICAgLy8gUGVyY2VudGFnZSByZXByZXNlbnRhdGlvbnMgb2YgYnJlYWRjcnVtYiB3aWR0aCBhbmQgaGVpZ2h0XG4gICAgICAgICRicmVhZGNydW1iLmNzcyhcImxlZnRcIiwgKHhQZXJjZW50IC0gKG9mZlBlcmNlbnRYIC8gMikpLnRvU3RyaW5nKCkgKyBcIiVcIik7XG4gICAgICAgICRicmVhZGNydW1iLmNzcyhcInRvcFwiLCAoeVBlcmNlbnQgLSAob2ZmUGVyY2VudFkgLyAyKSkudG9TdHJpbmcoKSArIFwiJVwiKTtcbiAgICAgICAgLy8kYnJlYWRjcnVtYi5jc3MoXCJ6LWluZGV4XCIsIHRoaXMuYmFzZVogLSA1MCk7XG5cbiAgICAgICAgXG4gICAgICAgICRicmVhZGNydW1iLmRyYWdnYWJsZSh7IFxuICAgICAgICAgICAgLy9jb250YWlubWVudDogXCJwYXJlbnRcIixcbiAgICAgICAgICAgIGRyYWc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBSZWNhbGN1bGF0ZSBwZXJjZW50YWdlcyAobWFuZ2xlZCBieSBqUXVlcnkgVUkgZHJhZ2dhYmxlIGNvZGUpXG4gICAgICAgICAgICAgICAgLy8gU2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIzNjczNDYyXG4gICAgICAgICAgICAgICAgdmFyIGwgPSAoIDEwMCAqIHBhcnNlRmxvYXQoJGJyZWFkY3J1bWIuY3NzKFwibGVmdFwiKSkgLyBwYXJzZUZsb2F0KCRicmVhZGNydW1iLnBhcmVudCgpLmNzcyhcIndpZHRoXCIpKSApKyBcIiVcIiA7XG4gICAgICAgICAgICAgICAgdmFyIHQgPSAoIDEwMCAqIHBhcnNlRmxvYXQoJGJyZWFkY3J1bWIuY3NzKFwidG9wXCIpKSAvIHBhcnNlRmxvYXQoJGJyZWFkY3J1bWIucGFyZW50KCkuY3NzKFwiaGVpZ2h0XCIpKSApKyBcIiVcIiA7XG4gICAgICAgICAgICAgICAgJGJyZWFkY3J1bWIuY3NzKFwibGVmdFwiICwgbCk7XG4gICAgICAgICAgICAgICAgJGJyZWFkY3J1bWIuY3NzKFwidG9wXCIgLCB0KTtcbiAgICAgICAgICAgICAgICB0aGlzLlVwZGF0ZVBvbHlDbGlwcGluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgJGJyZWFkY3J1bWIuY2xpY2soKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIGJyZWFkY3J1bWIgb24gY2xpY2tcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgJGJyZWFkY3J1bWIucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLiRicmVhZGNydW1icy5zcGxpY2UodGhpcy4kYnJlYWRjcnVtYnMuaW5kZXhPZigkYnJlYWRjcnVtYiksIDEpO1xuICAgICAgICAgICAgdGhpcy5VcGRhdGVQb2x5Q2xpcHBpbmcoKTtcbiAgICAgICAgICAgIHRoaXMuVXBkYXRlQnJlYWRjcnVtYkNvbG9yaW5nKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy4kYnJlYWRjcnVtYnMucHVzaCgkYnJlYWRjcnVtYik7XG5cbiAgICAgICAgLy90aGlzLlVwZGF0ZVBvbHlDbGlwcGluZygpO1xuICAgICAgICB0aGlzLlVwZGF0ZUJyZWFkY3J1bWJDb2xvcmluZygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIGxhc3QtcGxhY2VkIGJyZWFkY3J1bWIgZnJvbSB0aGUgbGlzdFxuICAgICAqIGFuZCB1cGRhdGVzIHRoZSB2aWV3LlxuICAgICAqL1xuICAgIFJlbW92ZUxhc3RCcmVhZGNydW1iKCl7XG4gICAgICAgIGxldCAkcmVtb3ZlZCA9IHRoaXMuJGJyZWFkY3J1bWJzLnBvcCgpO1xuICAgICAgICAkcmVtb3ZlZC5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5VcGRhdGVQb2x5Q2xpcHBpbmcoKTtcbiAgICAgICAgdGhpcy5VcGRhdGVCcmVhZGNydW1iQ29sb3JpbmcoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBjZW50ZXIgb2YgdGhlIGJyZWFkY3J1bWIgYXMgYW4gKHgsIHkpIHBhaXJcbiAgICAgKiByZXByZXNlbnRpbmcgdGhlIHBlcmNlbnRhZ2UgZGlzdGFuY2UgZnJvbSB0aGUgdG9wIGFuZCBsZWZ0XG4gICAgICogb2YgdGhlIGNsaWNrIHN1cmZhY2UgKDAlIC0gMTAwJSkuXG4gICAgICovXG4gICAgR2V0Q2VudGVyUGVyY2VudGFnZSgkYnJlYWRjcnVtYil7XG4gICAgICAgIGxldCB0b3BQZXJjZW50ID0gKCRicmVhZGNydW1iLnBvc2l0aW9uKCkudG9wIC8gJGJyZWFkY3J1bWIucGFyZW50KCkuaGVpZ2h0KCkpICogMTAwO1xuICAgICAgICBsZXQgbGVmdFBlcmNlbnQgPSAoJGJyZWFkY3J1bWIucG9zaXRpb24oKS5sZWZ0IC8gJGJyZWFkY3J1bWIucGFyZW50KCkud2lkdGgoKSkgKiAxMDA7XG5cbiAgICAgICAgLy8gUGVyY2VudGFnZSB2YWx1ZXMgZm9yIHRoZSBkaW1lbnNpb25zIG9mIHRoZSBicmVhZGNydW1iIHJlbGF0aXZlIHRvIHRoZSBjbGljayBzdXJmYWNlXG4gICAgICAgIGxldCBvZmZQZXJjZW50WCA9ICgkYnJlYWRjcnVtYi5vdXRlcldpZHRoKCkgLyAkYnJlYWRjcnVtYi5wYXJlbnQoKS53aWR0aCgpKSAqIDEwMDtcbiAgICAgICAgbGV0IG9mZlBlcmNlbnRZID0gKCRicmVhZGNydW1iLm91dGVySGVpZ2h0KCkgLyAkYnJlYWRjcnVtYi5wYXJlbnQoKS5oZWlnaHQoKSkgKiAxMDA7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IGxlZnRQZXJjZW50ICsgKG9mZlBlcmNlbnRYIC8gMi4wKSxcbiAgICAgICAgICAgIHk6IHRvcFBlcmNlbnQgKyAob2ZmUGVyY2VudFkgLyAyLjApXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBSZXNldCgpe1xuICAgICAgICBcbiAgICAgICAgLy8gUmVtb3ZlIGFsbCBicmVhZGNydW1ic1xuICAgICAgICBmb3IobGV0ICRicmVhZGNydW1iIG9mIHRoaXMuJGJyZWFkY3J1bWJzKXtcbiAgICAgICAgICAgICRicmVhZGNydW1iLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuJGJyZWFkY3J1bWJzID0gW107XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBwb2x5IGlmIGl0IGFscmVhZHkgZXhpc3RzXG4gICAgICAgIC8vIGlmKHRoaXMuJHBvbHkgIT0gbnVsbCl7XG4gICAgICAgIC8vICAgICB0aGlzLiRwb2x5LnJlbW92ZSgpO1xuICAgICAgICAvLyB9XG4gICAgfVxuXG4gICAgUmVzZXRQb2x5Z29ucygpIHtcbiAgICAgICAgaWYgKHRoaXMuJHN0YXJ0UG9seSkge1xuICAgICAgICAgICAgdGhpcy4kc3RhcnRQb2x5LmNsaXBQYXRoKFtdLCB7XG4gICAgICAgICAgICAgICAgc3ZnRGVmSWQ6ICdhbm5vdGF0b3JQb2x5RWRpdG9yU3ZnU3RhcnQnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRwb2x5Z29ucyA9IFtdO1xuICAgIH1cblxuICAgIFJlc3RvcmUoKXtcbiAgICAgICAgdGhpcy5Jbml0UG9seSh0aGlzLm9yaWdpbmFsSlNPTik7XG4gICAgfVxuXG4gICAgSW5pdFBvbHkocG9pbnRzID0gbnVsbCl7XG4gICAgICAgIHRoaXMuUmVzZXQoKTtcblxuICAgICAgICAvLyBJZiBKU09OIHdhcyBzcGVjaWZpZWQsIGdlbmVyYXRlIGJyZWFkY3J1bWJzIGZyb20gaXQuXG4gICAgICAgIGlmKHBvaW50cyAhPSBudWxsKXtcbiAgICAgICAgICAgIC8vIFB1dCBkb3duIHRoZSBicmVhZGNydW1ic1xuICAgICAgICAgICAgZm9yKGxldCBwb2ludCBvZiBwb2ludHMpe1xuICAgICAgICAgICAgICAgIHRoaXMuQWRkQnJlYWRjcnVtYihwb2ludFswXSwgcG9pbnRbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5VcGRhdGVQb2x5Q2xpcHBpbmcoKTtcblxuICAgICAgICB0aGlzLm9yaWdpbmFsSlNPTiA9IHBvaW50cztcbiAgICB9XG5cbiAgICBBZGRTdGFydFBvbHlnb24oKSB7XG4gICAgICAgIGlmICh0aGlzLiRwb2x5Z29ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsZXQgc3RhcnRQb2x5Z29uID0gdGhpcy4kcG9seWdvbnNbMF07IC8vLm1hcChpdGVtID0+IHsgcmV0dXJuIGAke2l0ZW1bMF19LCR7aXRlbVsxXX1gIH0pLmpvaW4oXCIgXCIpOztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBwb2x5IG9iamVjdFxuICAgICAgICAgICAgdGhpcy4kc3RhcnRQb2x5ID0gJChcIjxkaXYgY2xhc3M9J3dhbGRvcmYtc3RhcnQtcG9seSc+PC9kaXY+XCIpLmFwcGVuZFRvKHRoaXMuJGNsaWNrU3VyZmFjZSk7XG4gICAgICAgICAgICB0aGlzLiRzdGFydFBvbHkuY3NzKFwiei1pbmRleFwiLCB0aGlzLmJhc2VaICsgMTAwMCk7XG5cbiAgICAgICAgICAgIGlmKHN0YXJ0UG9seWdvbi5sZW5ndGggPCAzKXtcbiAgICAgICAgICAgICAgICB0aGlzLiRzdGFydFBvbHkuY2xpcFBhdGgoW10sIHtcbiAgICAgICAgICAgICAgICAgICAgc3ZnRGVmSWQ6ICdhbm5vdGF0b3JQb2x5RWRpdG9yU3ZnU3RhcnQnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLiRzdGFydFBvbHkuY2xpcFBhdGgoc3RhcnRQb2x5Z29uLCB7XG4gICAgICAgICAgICAgICAgaXNQZXJjZW50YWdlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHN2Z0RlZklkOiAnYW5ub3RhdG9yU3RhcnRQb2x5U3ZnJ1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHN0YXJ0UG9seWdvbi5tYXAoKHBvaW50KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5BZGRCcmVhZGNydW1iKHBvaW50WzBdLCBwb2ludFsxXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIFVwZGF0ZVBvbHlDbGlwcGluZygpe1xuICAgICAgICBcbiAgICAgICAgaWYodGhpcy4kYnJlYWRjcnVtYnMubGVuZ3RoIDwgMyl7XG4gICAgICAgICAgICB0aGlzLiRwb2x5LmNsaXBQYXRoKFtdLCB7XG4gICAgICAgICAgICAgICAgc3ZnRGVmSWQ6ICdhbm5vdGF0b3JQb2x5RWRpdG9yU3ZnJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcG9pbnRzID0gdGhpcy4kYnJlYWRjcnVtYnMubWFwKCgkY3J1bWIpID0+IHtcbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLkdldENlbnRlclBlcmNlbnRhZ2UoJGNydW1iKTtcbiAgICAgICAgICAgIHJldHVybiBbcG9zLngsIHBvcy55XTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy4kcG9seS5jbGlwUGF0aChwb2ludHMsIHtcbiAgICAgICAgICAgIGlzUGVyY2VudGFnZTogdHJ1ZSxcbiAgICAgICAgICAgIHN2Z0RlZklkOiAnYW5ub3RhdG9yUG9seUVkaXRvclN2ZydcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICBVcGRhdGVCcmVhZGNydW1iQ29sb3JpbmcoKXtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMuJGJyZWFkY3J1bWJzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCAkY3J1bWIgPSB0aGlzLiRicmVhZGNydW1ic1tpXTtcbiAgICAgICAgICAgIC8vIFJlY29sb3IgZWFjaCBicmVhZGNydW1iXG4gICAgICAgICAgICBsZXQgY29sb3IgPSBcIiMwMDAwMDBcIjtcblxuICAgICAgICAgICAgaWYgKGkgPT0gdGhpcy4kYnJlYWRjcnVtYnMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIGNvbG9yID0gXCIjRkYwMDAwXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpID09IDApe1xuICAgICAgICAgICAgICAgIGNvbG9yID0gXCIjMDBGRjAwXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLiRicmVhZGNydW1ic1tpXS5jc3MoXCJib3JkZXItY29sb3JcIiwgY29sb3IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBhbiBhcnJheSBvZiBwZXJjZW50YWdlcyByZXByZXNlbnRpbmcgdGhlIHggYW5kIHkgcGVyY2VudGFnZXMgb2YgZWFjaFxuICAgICAqIHBvaW50IGluIHRoZSBwb2x5Z29uLlxuICAgICAqL1xuICAgIEdldEpTT04oKXtcbiAgICAgICAgLy8gRXh0cmFjdCB0aGUgY29vcmRpbmF0ZXMgZnJvbSB0aGUgY3J1bWJzIGFuZCBwdXQgdGhlbSBpbiB0aGUgYXJyYXlcbiAgICAgICAgbGV0IHBvaW50cyA9IFtdO1xuICAgICAgICBmb3IobGV0IGNydW1iIG9mIHRoaXMuJGJyZWFkY3J1bWJzKXtcbiAgICAgICAgICAgIGxldCBwb2ludCA9IHRoaXMuR2V0Q2VudGVyUGVyY2VudGFnZShjcnVtYik7XG4gICAgICAgICAgICBwb2ludHMucHVzaChbcG9pbnQueC50b1N0cmluZygpLCBwb2ludC55LnRvU3RyaW5nKCldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwb2ludHMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgYW4gYXJyYXkgb2YgcGVyY2VudGFnZXMgcmVwcmVzZW50aW5nIHRoZSB4IGFuZCB5IHBlcmNlbnRhZ2VzIG9mIGVhY2hcbiAgICAgKiBwb2ludCBpbiB0aGUgcG9seWdvbi5cbiAgICAgKi9cbiAgICBHZXRQb2ludHMoKSB7XG4gICAgICAgIGxldCBwb2ludHMgPSBbXTtcbiAgICAgICAgZm9yKGxldCBjcnVtYiBvZiB0aGlzLiRicmVhZGNydW1icyl7XG4gICAgICAgICAgICBsZXQgcG9pbnQgPSB0aGlzLkdldENlbnRlclBlcmNlbnRhZ2UoY3J1bWIpO1xuICAgICAgICAgICAgcG9pbnRzLnB1c2goW3BvaW50LngsIHBvaW50LnldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9pbnRzO1xuICAgIH1cblxuICAgIEJlZ2luRWRpdGluZygpe1xuICAgICAgICB0aGlzLiRjbGlja1N1cmZhY2UubWFrZVZpc2libGUodHJ1ZSk7XG4gICAgICAgIHRoaXMuJGVkaXREaWFsb2cubWFrZVZpc2libGUodHJ1ZSk7XG4gICAgICAgIHRoaXMuJHBvbHkubWFrZVZpc2libGUodHJ1ZSk7XG4gICAgICAgIC8vLTMvL3RoaXMuJGJhci5tYWtlVmlzaWJsZSh0cnVlKTtcbiAgICAgICAgdGhpcy5BZGRTdGFydFBvbHlnb24oKTtcbiAgICAgICAgdGhpcy5VcGRhdGVQb2x5Q2xpcHBpbmcoKTtcbiAgICB9XG5cbiAgICBEb25lKCl7XG4gICAgICAgIHRoaXMuJGNsaWNrU3VyZmFjZS5tYWtlVmlzaWJsZShmYWxzZSk7XG4gICAgICAgIHRoaXMuJGVkaXREaWFsb2cubWFrZVZpc2libGUoZmFsc2UpO1xuICAgICAgICB0aGlzLiRwb2x5Lm1ha2VWaXNpYmxlKGZhbHNlKTtcbiAgICAgICAgLy8tMy8vdGhpcy4kYmFyLm1ha2VWaXNpYmxlKGZhbHNlKTtcbiAgICB9XG5cbiAgICBSZXNpemVPdmVybGF5KCl7XG4gICAgICAgIC8vIFJlc2l6ZSB2aWRlbyBvdmVybGF5IHRvIGZpdCBhY3R1YWwgdmlkZW8gZGltZW5zaW9uc1xuICAgICAgICBsZXQgdmlkZW9EaW1zID0gdGhpcy5hbm5vdGF0b3IucGxheWVyLkdldFZpZGVvRGltZW5zaW9ucygpO1xuICAgICAgICB0aGlzLiRjbGlja1N1cmZhY2UuY3NzKCd3aWR0aCcsIHZpZGVvRGltcy53aWR0aCk7XG4gICAgICAgIHRoaXMuJGNsaWNrU3VyZmFjZS5jc3MoJ2hlaWdodCcsIHZpZGVvRGltcy5oZWlnaHQpO1xuXG4gICAgICAgIGxldCBoZWlnaHREaWZmID0gKHRoaXMuYW5ub3RhdG9yLnBsYXllci4kdmlkZW8uaGVpZ2h0KCkgLSB2aWRlb0RpbXMuaGVpZ2h0KSAvIDI7XG4gICAgICAgIHRoaXMuJGNsaWNrU3VyZmFjZS5jc3MoJ3RvcCcsIGhlaWdodERpZmYpO1xuXG4gICAgICAgIGxldCB3aWR0aERpZmYgPSAodGhpcy5hbm5vdGF0b3IucGxheWVyLiR2aWRlby53aWR0aCgpIC0gdmlkZW9EaW1zLndpZHRoKSAvIDI7XG4gICAgICAgIHRoaXMuJGNsaWNrU3VyZmFjZS5jc3MoJ2xlZnQnLCB3aWR0aERpZmYpO1xuXG4gICAgICAgIHRoaXMuJHBvbHkud2lkdGgodmlkZW9EaW1zLndpZHRoKTtcbiAgICAgICAgdGhpcy4kcG9seS5oZWlnaHQodmlkZW9EaW1zLmhlaWdodCk7XG4gICAgICAgIHRoaXMuJHBvbHkuY3NzKFwidG9wXCIsIGhlaWdodERpZmYpO1xuICAgICAgICB0aGlzLiRwb2x5LmNzcyhcImxlZnRcIiwgd2lkdGhEaWZmKTtcbiAgICB9XG5cbiAgICBSZWdpc3RlckVsZW1lbnQoJGVsZW1lbnQsICRjb250YWluZXIsIG9yZGVyLCBqdXN0aWZpY2F0aW9uID0gJ2ZsZXgtc3RhcnQnKXtcbiAgICAgICAgJGVsZW1lbnQuY3NzKCdvcmRlcicsIG9yZGVyKTtcbiAgICAgICAgJGVsZW1lbnQuY3NzKCdhbGlnbi1zZWxmJywganVzdGlmaWNhdGlvbik7XG4gICAgICAgIC8vIFNldHMgZ3JvdyBbc2hyaW5rXSBbYmFzaXNdXG4gICAgICAgIC8vJGVsZW1lbnQuY3NzKCdmbGV4JywgJzAgMCBhdXRvJyk7XG4gICAgICAgICRjb250YWluZXIuYXBwZW5kKCRlbGVtZW50KTtcbiAgICB9XG5cbiAgICBTaG93SnVzdFBvbHlnb24oKXtcbiAgICAgICAgdGhpcy4kcG9seS5tYWtlVmlzaWJsZSh0cnVlKTtcbiAgICB9XG5cbiAgICBBZGRQb2x5Z29uU2V0KCkge1xuICAgICAgICB0aGlzLiRwb2x5Z29ucy5wdXNoKHRoaXMuR2V0UG9pbnRzKCkpO1xuICAgICAgICB0aGlzLiR0ZW1wQnJlYWRDcnVtYnMucHVzaChbdGhpcy4kYnJlYWRjcnVtYnNdKTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IHsgUG9seWdvbkVkaXRvciB9OyIsImNsYXNzIFBvbHlnb25PdmVybGF5IHtcbiAgICBjb25zdHJ1Y3Rvcihhbm5vdGF0b3Ipe1xuICAgICAgICB0aGlzLmFubm90YXRvciA9IGFubm90YXRvcjtcbiAgICAgICAgdGhpcy5wb2x5RWxlbWVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5zdmdFbGVtZW50cyA9IFtdO1xuICAgICAgICB0aGlzLmFuaW1hdGVFbGVtZW50cyA9IFtdO1xuICAgICAgICB0aGlzLmJhc2VaID0gMjE0NzQ4MzY0OTtcbiAgICAgICAgdGhpcy5sYXN0QW5ub3RhdGlvbnMgPSBbXTtcbiAgICAgICAgdGhpcy5zdmdFbGVtZW50c0hhc2ggPSB7fTtcblxuICAgICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSB2aWRlbyBvdmVybGF5XG4gICAgICAgIHRoaXMuJHZpZGVvT3ZlcmxheSA9ICQoXCI8ZGl2IGNsYXNzPSd3YWxkb3JmLXZpZGVvLW92ZXJsYXknPjwvZGl2PlwiKS5hcHBlbmRUbyh0aGlzLmFubm90YXRvci5wbGF5ZXIuJGNvbnRhaW5lcik7XG4gICAgICAgIHRoaXMuUmVzaXplT3ZlcmxheSgpO1xuICAgICAgICB0aGlzLmFubm90YXRvci5wbGF5ZXIuJGNvbnRhaW5lci5vbihcIk9uRnVsbHNjcmVlbkNoYW5nZVwiLCAoZXZlbnQsIHNldEZ1bGxzY3JlZW4pID0+IHRoaXMuUmVzaXplT3ZlcmxheSgpKTtcblxuICAgICAgICB0aGlzLmFubm90YXRvci4kY29udGFpbmVyLm9uKFwiT25OZXdBbm5vdGF0aW9uU2V0XCIsIChldmVudCwgYW5ub3RhdGlvbnMpID0+IHRoaXMuVXBkYXRlKGFubm90YXRpb25zKSk7XG4gICAgICAgIHRoaXMudmlkZW9EaW1zID0gdGhpcy5hbm5vdGF0b3IucGxheWVyLkdldFZpZGVvRGltZW5zaW9ucygpO1xuXG4gICAgICAgICQod2luZG93KS5yZXNpemUoKCkgPT4gdGhpcy5SZXNpemVPdmVybGF5KCkpO1xuICAgIH1cblxuICAgIFVwZGF0ZShhbm5vdGF0aW9ucyl7XG4gICAgICAgIHRoaXMuQ2xlYXIoKTtcblxuICAgICAgICAvLyBsZXQgcHJldlNldCA9IG5ldyBTZXQodGhpcy5sYXN0QW5ub3RhdGlvbnMpO1xuICAgICAgICAvLyBsZXQgbmV3U2V0ID0gbmV3IFNldChhbm5vdGF0aW9ucyk7XG5cbiAgICAgICAgLy8gLy8gaW4gbmV3U2V0IGFuZCBub3QgaW4gcHJldlNldFxuICAgICAgICAvLyBsZXQgdG9BZGQgPSBuZXcgU2V0KFxuICAgICAgICAvLyAgICAgWy4uLm5ld1NldF0uZmlsdGVyKHggPT4gIXByZXZTZXQuaGFzKHgpKSk7XG5cbiAgICAgICAgLy8gLy8gaW4gcHJldkFubm90YXRpb25zIGFuZCBub3QgaW4gYW5ub3RhdGlvbnNcbiAgICAgICAgLy8gbGV0IHRvRGVzdHJveSA9IG5ldyBTZXQoXG4gICAgICAgIC8vICAgICBbLi4ucHJldlNldF0uZmlsdGVyKHggPT4gIW5ld1NldC5oYXMoeCkpKTtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhBcnJheS5mcm9tKHRvQWRkKSk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKEFycmF5LmZyb20odG9EZXN0cm95KSk7XG4gICAgICAgIFxuICAgICAgICAvL1NvcnQgcG9seWdvbiBvcmRlciBieSBzaXplIChhc2NlbmRpbmcpXG4gICAgICAgIC8vIHBvbHlnb25zLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAvLyAgICAgcmV0dXJuIHRoaXMuR2V0QXJlYShhKSA+IHRoaXMuR2V0QXJlYShiKTtcbiAgICAgICAgLy8gfSlcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFubm90YXRpb25zLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgIGxldCBhbm5vdGF0aW9uUG9seVBvaW50cyA9IGFubm90YXRpb25zW2ldLmdldFBvbHkoKTtcbiAgICAgICAgICAgIGlmIChhbm5vdGF0aW9uUG9seVBvaW50cyA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gSWdub3JlIHRoaXMgYW5ub3RhdGlvbiBpZiBpdCBoYXMgbm8gcG9seWdvblxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgc3ZnUG9seVBvaW50cyA9IGFubm90YXRpb25zW2ldLmdldFNWR1BvbHlQb2ludHMoKTtcbiAgICAgICAgXG4gICAgICAgICAgICBsZXQgZHVyYXRpb24gPSBhbm5vdGF0aW9uc1tpXS5lbmRUaW1lIC0gYW5ub3RhdGlvbnNbaV0uYmVnaW5UaW1lO1xuXG4gICAgICAgICAgICAvLyBDcmVhdGUgdGhlIHBvbHkgb2JqZWN0XG4gICAgICAgICAgICBsZXQgJHN2ZztcbiAgICAgICAgICAgIGlmICh0aGlzLnN2Z0VsZW1lbnRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgJHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwic3ZnXCIpO1xuICAgICAgICAgICAgICAgICRzdmcuc2V0QXR0cmlidXRlKCd3aWR0aCcsICcxMDAlJyk7XG4gICAgICAgICAgICAgICAgJHN2Zy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsICcxMDAlJyk7XG4gICAgICAgICAgICAgICAgJHN2Zy5zZXRBdHRyaWJ1dGUoJ3ZpZXdCb3gnLCAnMCAwIDEwMCAxMDAnKTtcbiAgICAgICAgICAgICAgICAkc3ZnLnNldEF0dHJpYnV0ZSgncHJlc2VydmVBc3BlY3RSYXRpbycsICdub25lJyk7XG5cbiAgICAgICAgICAgICAgICAvLyRzdmcuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuQ2xpY2tFdmVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kdmlkZW9PdmVybGF5LmFwcGVuZCgkc3ZnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnN2Z0VsZW1lbnRzLnB1c2goJHN2Zyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzdmcgPSB0aGlzLnN2Z0VsZW1lbnRzWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG5cbiAgICAgICAgICAgIGxldCAkcG9seWdvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCAncG9seWdvbicpO1xuICAgICAgICAgICAgJHBvbHlnb24uc2V0QXR0cmlidXRlKCdwb2ludHMnLCBzdmdQb2x5UG9pbnRzWzBdKTtcbiAgICAgICAgICAgICRwb2x5Z29uLnNldEF0dHJpYnV0ZSgnZmlsbCcsICdyZ2JhKDAsIDExOCwgMjU1LCAwLjU1KScpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkc3ZnLmFwcGVuZENoaWxkKCRwb2x5Z29uKTtcblxuICAgICAgICAgICAgbGV0ICRhbmltYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdhbmltYXRlJyk7XG4gICAgICAgICAgICAkYW5pbWF0ZS5zZXRBdHRyaWJ1dGUoJ2F0dHJpYnV0ZU5hbWUnLCAncG9pbnRzJyk7XG4gICAgICAgICAgICAkYW5pbWF0ZS5zZXRBdHRyaWJ1dGUoJ2ZpbGwnLCAnZnJlZXplJyk7XG4gICAgICAgICAgICAkYW5pbWF0ZS5zZXRBdHRyaWJ1dGUoJ2Zyb20nLCBzdmdQb2x5UG9pbnRzWzBdKTtcbiAgICAgICAgICAgICRhbmltYXRlLnNldEF0dHJpYnV0ZSgndG8nLCBzdmdQb2x5UG9pbnRzWzFdKTtcbiAgICAgICAgICAgICRhbmltYXRlLnNldEF0dHJpYnV0ZSgnYmVnaW4nLCAnaW5kZWZpbml0ZScpO1xuICAgICAgICAgICAgJGFuaW1hdGUuc2V0QXR0cmlidXRlKCdkdXInLCBkdXJhdGlvbiArIFwic1wiKTtcbiAgICAgICAgICAgICRwb2x5Z29uLmFwcGVuZENoaWxkKCRhbmltYXRlKTtcblxuICAgICAgICAgICAgbGV0ICRzdmdIYXNoID0ge1xuICAgICAgICAgICAgICAgIHN2Z0VsZW1lbnQ6ICRzdmcsXG4gICAgICAgICAgICAgICAgcG9seWdvbjogJHBvbHlnb24sXG4gICAgICAgICAgICAgICAgYW5pbWF0ZTogJGFuaW1hdGUsXG4gICAgICAgICAgICAgICAgYmVnaW5UaW1lOiBhbm5vdGF0aW9uc1tpXS5iZWdpblRpbWVcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuc3ZnRWxlbWVudHNIYXNoW2Fubm90YXRpb25zW2ldLmlkXSA9ICRzdmdIYXNoO1xuXG4gICAgICAgICAgICAvLyBDcmVhdGUgdGhlIHBvbHkgb2JqZWN0XG4gICAgICAgICAgICAvLyBsZXQgJHBvbHkgPSAkKFwiPGRpdiBjbGFzcz0nd2FsZG9yZi1vdmVybGF5LXBvbHknPjwvZGl2PlwiKS5hcHBlbmRUbyh0aGlzLiR2aWRlb092ZXJsYXkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyAkcG9seS5jbGlwUGF0aChhbm5vdGF0aW9uUG9seVBvaW50cywge1xuICAgICAgICAgICAgLy8gICAgIGlzUGVyY2VudGFnZTogdHJ1ZSxcbiAgICAgICAgICAgIC8vICAgICBzdmdEZWZJZDogJ2Fubm90YXRvclBvbHlTdmcnXG4gICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIC8vICRwb2x5LmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIC8vICAgICB0aGlzLmFubm90YXRvci4kY29udGFpbmVyLnRyaWdnZXIoXCJPblBvbHlDbGlja2VkXCIsIGFubm90YXRpb25zW2ldKTtcbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgLy8gdGhpcy5BZGRUb29sdGlwKCRwb2x5LCBhbm5vdGF0aW9uc1tpXSk7XG4gICAgICAgICAgICAvLyB0aGlzLnBvbHlFbGVtZW50cy5wdXNoKCRwb2x5KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5wb2x5RWxlbWVudHMucHVzaCgkcG9seWdvbik7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGVFbGVtZW50cy5wdXNoKCRhbmltYXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vdGhpcy5sYXN0QW5ub3RhdGlvbnMgPSBhbm5vdGF0aW9ucztcbiAgICB9XG5cbiAgICBDbGlja0V2ZW50KGV2ZW50KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYW5pbWF0ZSBpcyBjbGlja2VkXCIpO1xuICAgIH1cblxuICAgIEFkZFRvb2x0aXAoJHBvbHksIGFubm90YXRpb24pe1xuICAgICAgICAkLmZuLnF0aXAuemluZGV4ID0gdGhpcy5iYXNlWisgMTtcbiAgICAgICAgJHBvbHkucXRpcCh7XG4gICAgICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IGFubm90YXRpb24uaWQsXG4gICAgICAgICAgICAgICAgdGV4dDogYW5ub3RhdGlvbi5ib2R5LmZpbHRlcihpdGVtID0+IGl0ZW0ucHVycG9zZSA9PT0gXCJkZXNjcmliaW5nXCIpWzBdLnZhbHVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICBteTogJ2JvdHRvbSByaWdodCcsXG4gICAgICAgICAgICAgICAgYXQ6ICd0b3AgbGVmdCcsXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiAnbW91c2UnLCAvLyBGb2xsb3cgdGhlIG1vdXNlXG4gICAgICAgICAgICAgICAgYWRqdXN0OiB7XG4gICAgICAgICAgICAgICAgICAgIG1vdXNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwic2hpZnQgc2hpZnRcIiAvLyBob3Jpem9udGFsLCB2ZXJ0aWNhbFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdmlld3BvcnQ6IHRoaXMuYW5ub3RhdG9yLnBsYXllci4kY29udGFpbmVyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGlkZToge1xuICAgICAgICAgICAgICAgIGRlbGF5OiAwIC8vIE5vIGhpZGUgZGVsYXkgYnkgZGVmYXVsdFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgY2xhc3NlczogJ3F0aXAtZGFyayBxdGlwLXJvdW5kZWQgYW5ub3RhdG9yLXF0aXAnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIENsZWFyKCl7XG4gICAgICAgIC8vIENsZWFyIGFsbCAgYW5pbWF0ZSBlbGVtZW50IGZyb20gdGhlIERPTVxuICAgICAgICBmb3IobGV0IGFpID0gMDsgYWkgPCB0aGlzLmFuaW1hdGVFbGVtZW50cy5sZW5ndGg7IGFpKyspe1xuICAgICAgICAgICAgLy90aGlzLnBvbHlFbGVtZW50c1tpXS5kYXRhKFwicXRpcFwiKS5kZXN0cm95KHRydWUpO1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlRWxlbWVudHNbYWldLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2xlYXIgYWxsIHBvbHlnb25zIFxuICAgICAgICBmb3IobGV0IHBpID0gMDsgcGkgPCB0aGlzLnBvbHlFbGVtZW50cy5sZW5ndGg7IHBpKyspIHtcbiAgICAgICAgICAgIHRoaXMucG9seUVsZW1lbnRzW3BpXS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQ2xlYXIgYWxsICBzdmcgZWxlbWVudHMgZnJvbSB0aGUgRE9NXG4gICAgICAgIGZvcihsZXQgc2kgPSAwOyBzaSA8IHRoaXMuc3ZnRWxlbWVudHMubGVuZ3RoOyBzaSsrKXtcbiAgICAgICAgICAgIHRoaXMuc3ZnRWxlbWVudHNbc2ldLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBNYXJrIHRoZSBhcnJheSBhcyBlbXB0eVxuICAgICAgICB0aGlzLmFuaW1hdGVFbGVtZW50cyA9IFtdO1xuICAgICAgICB0aGlzLnBvbHlFbGVtZW50cyA9IFtdO1xuICAgICAgICB0aGlzLnN2Z0VsZW1lbnRzID0gW107XG4gICAgICAgIHRoaXMuc3ZnRWxlbWVudHNIYXNoID0ge307XG5cbiAgICB9XG5cbiAgICBSZXNpemVPdmVybGF5KCl7XG4gICAgICAgIC8vIFJlc2l6ZSB2aWRlbyBvdmVybGF5IHRvIGZpdCBhY3R1YWwgdmlkZW8gZGltZW5zaW9uc1xuICAgICAgICBsZXQgdmlkZW9EaW1zID0gdGhpcy5hbm5vdGF0b3IucGxheWVyLkdldFZpZGVvRGltZW5zaW9ucygpO1xuICAgICAgICB0aGlzLiR2aWRlb092ZXJsYXkuY3NzKCd3aWR0aCcsIHZpZGVvRGltcy53aWR0aCk7XG4gICAgICAgIHRoaXMuJHZpZGVvT3ZlcmxheS5jc3MoJ2hlaWdodCcsIHZpZGVvRGltcy5oZWlnaHQpO1xuXG4gICAgICAgIGxldCBoZWlnaHREaWZmID0gKHRoaXMuYW5ub3RhdG9yLnBsYXllci4kdmlkZW8uaGVpZ2h0KCkgLSB2aWRlb0RpbXMuaGVpZ2h0KSAvIDI7XG4gICAgICAgIHRoaXMuJHZpZGVvT3ZlcmxheS5jc3MoJ3RvcCcsIGhlaWdodERpZmYpO1xuXG4gICAgICAgIGxldCB3aWR0aERpZmYgPSAodGhpcy5hbm5vdGF0b3IucGxheWVyLiR2aWRlby53aWR0aCgpIC0gdmlkZW9EaW1zLndpZHRoKSAvIDI7XG4gICAgICAgIHRoaXMuJHZpZGVvT3ZlcmxheS5jc3MoJ2xlZnQnLCB3aWR0aERpZmYpO1xuICAgIH1cblxuICAgIGdldFBsYXllclNpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFubm90YXRvci5wbGF5ZXIuR2V0VmlkZW9EaW1lbnNpb25zKCk7XG4gICAgfVxuXG59XG5cbmV4cG9ydCB7IFBvbHlnb25PdmVybGF5IH07IiwiXG5jbGFzcyBUaWNrQmFyIHtcbiAgICBjb25zdHJ1Y3Rvcihhbm5vdGF0b3Ipe1xuICAgICAgICB0aGlzLmFubm90YXRvciA9IGFubm90YXRvcjtcblxuICAgICAgICB0aGlzLnRpY2tzID0gW107XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBlbGVtZW50XG4gICAgICAgIHRoaXMuJHRpY2tCYXIgPSAkKFwiPGRpdiBjbGFzcz0nd2FsZG9yZi10aWNrYmFyJz48L2Rpdj5cIik7XG4gICAgICAgIHRoaXMuYW5ub3RhdG9yLnBsYXllci5jb250cm9sQmFyLiRjb250YWluZXIuYXBwZW5kKHRoaXMuJHRpY2tCYXIpO1xuXG4gICAgICAgIC8vIEF0dGFjaCBldmVudCBoYW5kbGVyc1xuICAgICAgICB0aGlzLmFubm90YXRvci4kY29udGFpbmVyLm9uKFwiT25Bbm5vdGF0aW9uc0xvYWRlZFwiLCBcbiAgICAgICAgICAgIChldmVudCwgYW5ub3RhdGlvbk1hbmFnZXIpID0+IHRoaXMuTG9hZEFubm90YXRpb25zKGFubm90YXRpb25NYW5hZ2VyKSk7XG5cbiAgICAgICAgdGhpcy5hbm5vdGF0b3IuJGNvbnRhaW5lci5vbihcIk9uQW5ub3RhdGlvblJlZ2lzdGVyZWRcIixcbiAgICAgICAgICAgIChldmVudCwgYW5ub3RhdGlvbikgPT4gdGhpcy5Mb2FkQW5ub3RhdGlvbihhbm5vdGF0aW9uKSk7XG5cbiAgICAgICAgdGhpcy5hbm5vdGF0b3IuJGNvbnRhaW5lci5vbihcIk9uQW5ub3RhdGlvblJlbW92ZWRcIixcbiAgICAgICAgICAgIChldmVudCwgaWQpID0+IHRoaXMuUmVtb3ZlQW5ub3RhdGlvbihpZCkpO1xuICAgICAgICAgICAgXG4gICAgfVxuXG4gICAgTG9hZEFubm90YXRpb25zKGFubm90YXRpb25NYW5hZ2VyKXtcbiAgICAgICAgdGhpcy5DbGVhcigpO1xuXG4gICAgICAgIGZvcihsZXQgYW5ub3RhdGlvbiBvZiBhbm5vdGF0aW9uTWFuYWdlci5hbm5vdGF0aW9ucyl7XG4gICAgICAgICAgICB0aGlzLkxvYWRBbm5vdGF0aW9uKGFubm90YXRpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgTG9hZEFubm90YXRpb24oYW5ub3RhdGlvbil7XG4gICAgICAgIGxldCAkdGljayA9ICQoXCI8ZGl2IGNsYXNzPSd3YWxkb3JmLXRpY2tiYXItdGljayc+PC9kaXY+XCIpLmFwcGVuZFRvKHRoaXMuJHRpY2tCYXIpO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgSUQgb2YgdGhlIGFubm90YXRpb24gdG8gaXRzIGNvcnJlc3BvbmRpbmcgdGljayBzbyB3ZSBjYW4gcmVmZXJlbmNlIGl0IGxhdGVyXG4gICAgICAgICR0aWNrLmRhdGEoXCJhbm5vdGF0aW9uLWlkXCIsIGFubm90YXRpb24uaWQpO1xuXG4gICAgICAgIGxldCBiZWdpblRpbWUgPSBhbm5vdGF0aW9uLmJlZ2luVGltZTtcbiAgICAgICAgbGV0IGJlZ2luUGVyY2VudCA9IGJlZ2luVGltZSAvIHRoaXMuYW5ub3RhdG9yLnBsYXllci52aWRlb0VsZW1lbnQuZHVyYXRpb247XG4gICAgICAgICR0aWNrLmNzcygnbGVmdCcsIChiZWdpblBlcmNlbnQgKiAxMDApLnRvU3RyaW5nKCkgKyBcIiVcIik7XG5cbiAgICAgICAgbGV0IGVuZFRpbWUgPSBhbm5vdGF0aW9uLmVuZFRpbWU7XG4gICAgICAgIGxldCBlbmRQZXJjZW50ID0gZW5kVGltZSAvIHRoaXMuYW5ub3RhdG9yLnBsYXllci52aWRlb0VsZW1lbnQuZHVyYXRpb247XG4gICAgICAgICR0aWNrLmNzcygnd2lkdGgnLCAoKGVuZFBlcmNlbnQgLSBiZWdpblBlcmNlbnQpICogMTAwKS50b1N0cmluZygpICsgXCIlXCIpO1xuXG4gICAgICAgIHRoaXMudGlja3MucHVzaCgkdGljayk7XG4gICAgfVxuXG4gICAgUmVtb3ZlQW5ub3RhdGlvbihpZCl7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJSZW1vdmluZyB0aWNrIFwiICsgaWQpO1xuICAgICAgICAvLyBSZW1vdmUgdGhlIG9iamVjdCBmcm9tIHRoZSBkb2N1bWVudCwgYW5kIHRoZSBhcnJheVxuICAgICAgICBsZXQgbmV3VGlja3MgPSBbXTtcbiAgICAgICAgZm9yKGxldCAkdGljayBvZiB0aGlzLnRpY2tzKXtcbiAgICAgICAgICAgIGlmKCR0aWNrLmRhdGEoXCJhbm5vdGF0aW9uLWlkXCIpID09IGlkKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUmVtb3ZlZCB0aWNrICR7aWR9YCk7XG4gICAgICAgICAgICAgICAgJHRpY2sucmVtb3ZlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1RpY2tzLnB1c2goJHRpY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudGlja3MgPSBuZXdUaWNrcztcbiAgICB9XG5cbiAgICBDbGVhcigpe1xuICAgICAgICBmb3IobGV0ICR0aWNrIG9mIHRoaXMudGlja3Mpe1xuICAgICAgICAgICAgJHRpY2sucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRpY2tzID0gW107XG4gICAgfVxuXG59XG5cblxuZXhwb3J0IHsgVGlja0JhciB9OyIsImxldCBzaGExID0gcmVxdWlyZSgnc2hhMScpO1xuXG5jbGFzcyBTZXJ2ZXJJbnRlcmZhY2Uge1xuICAgIGNvbnN0cnVjdG9yKGFubm90YXRvcil7XG4gICAgICAgIHRoaXMuYW5ub3RhdG9yID0gYW5ub3RhdG9yO1xuICAgICAgICAvL2xvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd3YWxkb3JmX2F1dGhfdG9rZW4nKTtcbiAgICB9XG5cbiAgICBTZXRCYXNlVVJMKHVybCl7XG4gICAgICAgIHRoaXMuYmFzZVVSTCA9IHVybDtcbiAgICB9XG5cbiAgICBtYWtlX2Jhc2VfYXV0aCh1c2VyLCBwYXNzd29yZCkge1xuICAgICAgICB2YXIgdG9rID0gdXNlciArICc6JyArIHBhc3N3b3JkO1xuICAgICAgICB2YXIgaGFzaCA9IGJ0b2EodG9rKTtcbiAgICAgICAgcmV0dXJuICdCYXNpYyAnICsgaGFzaDtcbiAgICB9XG5cbiAgICBtYWtlX3dyaXRlX2F1dGgodGV4dCl7XG4gICAgICAgIGlmKHRoaXMuYW5ub3RhdG9yLmFwaUtleSl7XG4gICAgICAgICAgICByZXR1cm4gJ0FwaUtleSAnICsgdGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAnVG9rZW4gJyArIHRleHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBMb2dnZWRJbigpe1xuICAgICAgICBpZih0aGlzLmFubm90YXRvci5hcGlLZXkpe1xuICAgICAgICAgICAgLy8gUmV0dXJuIHRydWUgaWYgYW4gZW1haWwgaGFzIGJlZW4gZW50ZXJlZFxuICAgICAgICAgICAgbGV0IHVzZXJfZW1haWwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd2FsZG9yZl91c2VyX2VtYWlsJyk7XG4gICAgICAgICAgICByZXR1cm4gdXNlcl9lbWFpbCAhPT0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFJldHVybiB0cnVlIGlmIGEgdG9rZW4gaGFzIGJlZW4gcmVnaXN0ZXJlZFxuICAgICAgICAgICAgbGV0IGF1dGhfdG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd2FsZG9yZl9hdXRoX3Rva2VuJyk7XG4gICAgICAgICAgICByZXR1cm4gYXV0aF90b2tlbiAhPT0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIExvZ0luKHVzZXJuYW1lLCBwYXNzd29yZCl7XG4gICAgICAgIC8vIElmIEFQSSBrZXkgaXMgdXNlZCwganVzdCBzdG9yZSB0aGUgZW1haWwgYWRkcmVzc1xuICAgICAgICBpZih0aGlzLmFubm90YXRvci5hcGlLZXkpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJbU2VydmVyIEludGVyZmFjZV0gU3VjY2Vzc2Z1bGx5IGxvZ2dlZCBpbi5cIik7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnd2FsZG9yZl91c2VyX2VtYWlsJywgcGFzc3dvcmQpO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3dhbGRvcmZfdXNlcl9uYW1lJywgdXNlcm5hbWUpO1xuICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IubWVzc2FnZU92ZXJsYXkuU2hvd01lc3NhZ2UoXCJMb2dnZWQgaW4gYXMgXCIrdXNlcm5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuICQuRGVmZXJyZWQoKS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogdGhpcy5iYXNlVVJMICsgXCIvYXBpL2xvZ2luXCIsXG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgIGFzeW5jOiB0cnVlLFxuICAgICAgICAgICAgY29udGV4dDogdGhpcyxcbiAgICAgICAgICAgIGJlZm9yZVNlbmQ6IGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsIHRoaXMubWFrZV9iYXNlX2F1dGgodXNlcm5hbWUsIHBhc3N3b3JkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmRvbmUoKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW1NlcnZlciBJbnRlcmZhY2VdIFN1Y2Nlc3NmdWxseSBsb2dnZWQgaW4uXCIpO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3dhbGRvcmZfYXV0aF90b2tlbicsIGRhdGEuYXV0aF90b2tlbik7XG4gICAgICAgIH0pLmZhaWwoKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiW1NlcnZlciBJbnRlcmZhY2VdIENvdWxkIG5vdCBsb2cgaW4uXCIpO1xuICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IubWVzc2FnZU92ZXJsYXkuU2hvd0Vycm9yKFwiQ291bGQgbm90IGxvZyBpbiFcIik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIExvZ091dCgpe1xuICAgICAgICAvLyBJZiBBUEkga2V5IGlzIHVzZWQsIGp1c3QgcmVtb3ZlIHRoZSBlbWFpbCBmcm9tIGxvY2FsIHN0b3JhZ2UuXG4gICAgICAgIGlmKHRoaXMuYW5ub3RhdG9yLmFwaUtleSl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltTZXJ2ZXIgSW50ZXJmYWNlXSBTdWNjZXNzZnVsbHkgbG9nZ2VkIG91dC5cIik7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnd2FsZG9yZl91c2VyX2VtYWlsJyk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnd2FsZG9yZl91c2VyX25hbWUnKTtcbiAgICAgICAgICAgIHJldHVybiAkLkRlZmVycmVkKCkucmVzb2x2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6IHRoaXMuYmFzZVVSTCArIFwiL2FwaS9sb2dvdXRcIixcbiAgICAgICAgICAgIHR5cGU6IFwiREVMRVRFXCIsXG4gICAgICAgICAgICBhc3luYzogdHJ1ZSxcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMsXG4gICAgICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgICAgICAgbGV0IGF1dGhfdG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd2FsZG9yZl9hdXRoX3Rva2VuJykgfHwgXCJcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1NlcnZlciBJbnRlcmZhY2VdIHRva2VuOiAke2F1dGhfdG9rZW59YCk7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0F1dGhvcml6YXRpb24nLCB0aGlzLm1ha2Vfd3JpdGVfYXV0aChhdXRoX3Rva2VuKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmRvbmUoKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW1NlcnZlciBJbnRlcmZhY2VdIFN1Y2Nlc3NmdWxseSBsb2dnZWQgb3V0LlwiKTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd3YWxkb3JmX2F1dGhfdG9rZW4nKTtcbiAgICAgICAgfSkuZmFpbCgocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJbU2VydmVyIEludGVyZmFjZV0gQ291bGQgbm90IGxvZyBvdXQuXCIpO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3dhbGRvcmZfYXV0aF90b2tlbicpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBGZXRjaEFubm90YXRpb25zKHNlYXJjaEtleSwgc2VhcmNoUGFyYW0pIHtcbiAgICAgICAgLy9UaGlzIGlzIHJlcGxhY2VkIGJ5IHRoaXMuYmFzZVVSTCwgd2hpY2ggaXMgZGVmaW5lZCBpbiBjb25maWdcbiAgICAgICAgLy92YXIgYm9va191cmwgPSAnaHR0cDovL3NjYWxhci51c2MuZWR1L2Rldi9zZW1hbnRpYy1hbm5vdGF0aW9uLXRvb2wvJzsgIC8vIFRoaXMgd2lsbCBiZSBkZWZpbmVkIGluIHRoZSBCb29rJ3MgSlNcbiAgICAgICAgLy9odHRwczovL3NjYWxhci51c2MuZWR1L2Rldi9zZW1hbnRpYy1hbm5vdGF0aW9uLXRvb2wvcmRmL2ZpbGUvbWVkaWEvSW5jZXB0aW9uJTIwQ29yZ2klMjBGbG9wLm1wND9mb3JtYXQ9b2FjJnByb3Y9MSZyZWM9MlxuICAgICAgICB2YXIgYWpheF91cmwgPSB0aGlzLmJhc2VVUkwgKyAncmRmL2ZpbGUvJyArIHNlYXJjaFBhcmFtLnJlcGxhY2UodGhpcy5iYXNlVVJMLCAnJykgKyAnP2Zvcm1hdD1vYWMmcHJvdj0xJnJlYz0yJztcbiAgICAgICAgLy92YXIgYWpheF91cmwgPSB0aGlzLmJhc2VVUkwgKyAncmRmL2ZpbGUvJyArIHNlYXJjaFBhcmFtLnJlcGxhY2UodGhpcy5iYXNlVVJMLCcnKSArICc/Zm9ybWF0PWlpaWYmcHJvdj0xJnJlYz0yJztcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcImFqYXhfdXJsOiBcIiArIGFqYXhfdXJsKTtcbiAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6IGFqYXhfdXJsLFxuICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgICAgIGpzb25wOiBcImNhbGxiYWNrXCIsXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJqc29ucFwiLFxuICAgICAgICAgICAgYXN5bmM6IHRydWVcbiAgICAgICAgfSkuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tTZXJ2ZXIgSW50ZXJmYWNlXSBGZXRjaGVkICcgKyBkYXRhLmxlbmd0aCArICcgYW5ub3RhdGlvbnMgZm9yICcgKyBzZWFyY2hLZXkgKyAnOiBcIicgKyBzZWFyY2hQYXJhbSArICdcIi4nKTtcbiAgICAgICAgfSkuZmFpbChmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciByZXR1cm5lZF9yZXNwb25zZSA9IHJlc3BvbnNlLnJlc3BvbnNlSlNPTi5lcnJvci5jb2RlWzBdLnZhbHVlICsgXCIgOiBcIiArIHJlc3BvbnNlLnJlc3BvbnNlSlNPTi5lcnJvci5tZXNzYWdlWzBdLnZhbHVlIDtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTZXJ2ZXIgSW50ZXJmYWNlXSBFcnJvciBmZXRjaGluZyBhbm5vdGF0aW9ucyBmb3IgJyArIHNlYXJjaEtleSArICc6IFwiJyArIHNlYXJjaFBhcmFtICsgJ1wiXFxuICcgKyByZXR1cm5lZF9yZXNwb25zZSk7XG4gICAgICAgICAgICBfdGhpczIuYW5ub3RhdG9yLm1lc3NhZ2VPdmVybGF5LlNob3dFcnJvcignQ291bGQgbm90IHJldHJpZXZlIGFubm90YXRpb25zITxicj4oJyArIHJldHVybmVkX3Jlc3BvbnNlICsgJyknKTtcblxuICAgICAgICB9KTsgIFxuICAgIH1cblxuICAgIFBvc3RBbm5vdGF0aW9uKGNhbGxiYWNrKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJQb3N0aW5nIGFubm90YXRpb24uLi5cIik7XG4gICAgICAgIGxldCBhbm5vdGF0aW9uID0gdGhpcy5hbm5vdGF0b3IuZ3VpLkdldEFubm90YXRpb25PYmplY3QoKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYW5ub3RhdGlvbik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYW5ub3RhdGlvbjogXCIgKyBKU09OLnN0cmluZ2lmeShhbm5vdGF0aW9uKSk7XG5cbiAgICAgICAgbGV0IGtleTtcbiAgICAgICAgaWYgKHRoaXMuYW5ub3RhdG9yLmFwaUtleSl7XG4gICAgICAgICAgICBrZXkgPSB0aGlzLmFubm90YXRvci5hcGlLZXk7XG4gICAgICAgICAgICBsZXQgZW1haWxfc3RvcmFnZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd3YWxkb3JmX3VzZXJfZW1haWwnKTtcbiAgICAgICAgICAgIGxldCBuYW1lX3N0b3JhZ2UgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd2FsZG9yZl91c2VyX25hbWUnKTtcbiAgICAgICAgICAgIGlmIChlbWFpbF9zdG9yYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIltTZXJ2ZXIgSW50ZXJmYWNlXSBZb3UgYXJlIG5vdCBsb2dnZWQgaW4hXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuYW5ub3RhdG9yLm1lc3NhZ2VPdmVybGF5LlNob3dFcnJvcihcIllvdSBhcmUgbm90IGxvZ2dlZCBpbiFcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYobmFtZV9zdG9yYWdlID09IG51bGwpIG5hbWVfc3RvcmFnZSA9IGVtYWlsX3N0b3JhZ2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrZXkgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd2FsZG9yZl9hdXRoX3Rva2VuJyk7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIltTZXJ2ZXIgSW50ZXJmYWNlXSBZb3UgYXJlIG5vdCBsb2dnZWQgaW4hXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuYW5ub3RhdG9yLm1lc3NhZ2VPdmVybGF5LlNob3dFcnJvcihcIllvdSBhcmUgbm90IGxvZ2dlZCBpbiFcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5hbm5vdGF0b3IuYXBpS2V5KXtcbiAgICAgICAgICAgIGlmKGFubm90YXRpb25bXCJjcmVhdG9yXCJdID09IG51bGwpIGFubm90YXRpb25bXCJjcmVhdG9yXCJdID0ge307XG4gICAgICAgICAgICBhbm5vdGF0aW9uW1wiY3JlYXRvclwiXVtcImVtYWlsXCJdID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dhbGRvcmZfdXNlcl9lbWFpbCcpO1xuICAgICAgICAgICAgYW5ub3RhdGlvbltcImNyZWF0b3JcIl1bXCJuaWNrbmFtZVwiXSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd3YWxkb3JmX3VzZXJfbmFtZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9zZXRhY3Rpb24gaW4gYW5ub3RhdGlvbiBwYXlsb2FkXG4gICAgICAgIGFubm90YXRpb25bXCJyZXF1ZXN0XCJdW1wiaXRlbXNcIl1bXCJhY3Rpb25cIl0gPSBcImFkZFwiOyAvL1RPRE86IHZlcjJcblxuICAgICAgICBjb25zb2xlLmxvZyhcIlBvc3RBbm5vdGF0aW9uIHBheWxvYWQ6IFwiICsgSlNPTi5zdHJpbmdpZnkoYW5ub3RhdGlvbikpO1xuICAgICAgICBcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIC8vdXJsOiB0aGlzLmJhc2VVUkwgKyBcIi9hcGkvYWRkQW5ub3RhdGlvblwiLFxuICAgICAgICAgICAgdXJsOiB0aGlzLmJhc2VVUkwgKyBcImFwaS9hZGRcIixcbiAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJywgLy8gTmVjZXNzYXJ5IGZvciBSYWlscyB0byBzZWUgdGhpcyBkYXRhIHR5cGUgY29ycmVjdGx5XG4gICAgICAgICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLCAgLy8gTmVjZXNzYXJ5IGZvciBSYWlscyB0byBzZWUgdGhpcyBkYXRhIHR5cGUgY29ycmVjdGx5XG4gICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShhbm5vdGF0aW9uKSwgIC8vIFN0cmluZ2lmeSBuZWNlc3NhcnkgZm9yIFJhaWxzIHRvIHNlZSB0aGlzIGRhdGEgdHlwZSBjb3JyZWN0bHlcbiAgICAgICAgICAgIGFzeW5jOiB0cnVlLFxuICAgICAgICAgICAgY29udGV4dDogdGhpcyxcbiAgICAgICAgICAgIGJlZm9yZVNlbmQ6IGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsIHRoaXMubWFrZV93cml0ZV9hdXRoKGtleSkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJTdWNjZXNzZnVsbHkgcG9zdGVkIG5ldyBhbm5vdGF0aW9uLlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFubm90YXRvci5tZXNzYWdlT3ZlcmxheS5TaG93TWVzc2FnZShcIlN1Y2Nlc3NmdWxseSBjcmVhdGVkIG5ldyBhbm5vdGF0aW9uLlwiKTtcbiAgICAgICAgICAgICAgICBhbm5vdGF0aW9uLmlkID0gZGF0YS5pZDsgLy8gQXBwZW5kIHRoZSBJRCBnaXZlbiBieSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZihjYWxsYmFjaykgY2FsbGJhY2soYW5ub3RhdGlvbik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3I6IChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciByZXR1cm5lZF9yZXNwb25zZSA9IHJlc3BvbnNlLnJlc3BvbnNlSlNPTi5lcnJvci5jb2RlWzBdLnZhbHVlICsgXCIgOiBcIiArIHJlc3BvbnNlLnJlc3BvbnNlSlNPTi5lcnJvci5tZXNzYWdlWzBdLnZhbHVlIDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDb3VsZCBub3QgcG9zdCBuZXcgYW5ub3RhdGlvbiEgTWVzc2FnZTpcXG4gJHtyZXR1cm5lZF9yZXNwb25zZX1gKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFubm90YXRvci5tZXNzYWdlT3ZlcmxheS5TaG93RXJyb3IoYENvdWxkIG5vdCBwb3N0IG5ldyBhbm5vdGF0aW9uITxicj4oJHtyZXR1cm5lZF9yZXNwb25zZX0pYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgRWRpdEFubm90YXRpb24oY2FsbGJhY2spe1xuICAgICAgICBsZXQgYW5ub3RhdGlvbiA9IHRoaXMuYW5ub3RhdG9yLmd1aS5HZXRBbm5vdGF0aW9uT2JqZWN0KCk7XG4gICAgICAgIFxuICAgICAgICBsZXQga2V5O1xuICAgICAgICBpZiAodGhpcy5hbm5vdGF0b3IuYXBpS2V5KXtcbiAgICAgICAgICAgIGtleSA9IHRoaXMuYW5ub3RhdG9yLmFwaUtleTtcbiAgICAgICAgICAgIGxldCBlbWFpbF9zdG9yYWdlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dhbGRvcmZfdXNlcl9lbWFpbCcpO1xuICAgICAgICAgICAgbGV0IG5hbWVfc3RvcmFnZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd3YWxkb3JmX3VzZXJfbmFtZScpO1xuICAgICAgICAgICAgaWYgKGVtYWlsX3N0b3JhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiW1NlcnZlciBJbnRlcmZhY2VdIFlvdSBhcmUgbm90IGxvZ2dlZCBpbiFcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IubWVzc2FnZU92ZXJsYXkuU2hvd0Vycm9yKFwiWW91IGFyZSBub3QgbG9nZ2VkIGluIVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihuYW1lX3N0b3JhZ2UgPT0gbnVsbCkgbmFtZV9zdG9yYWdlID0gZW1haWxfc3RvcmFnZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGtleSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd3YWxkb3JmX2F1dGhfdG9rZW4nKTtcbiAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiW1NlcnZlciBJbnRlcmZhY2VdIFlvdSBhcmUgbm90IGxvZ2dlZCBpbiFcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IubWVzc2FnZU92ZXJsYXkuU2hvd0Vycm9yKFwiWW91IGFyZSBub3QgbG9nZ2VkIGluIVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLmFubm90YXRvci5hcGlLZXkpe1xuICAgICAgICAgICAgaWYoYW5ub3RhdGlvbltcImNyZWF0b3JcIl0gPT0gbnVsbCkgYW5ub3RhdGlvbltcImNyZWF0b3JcIl0gPSB7fTtcbiAgICAgICAgICAgIGFubm90YXRpb25bXCJjcmVhdG9yXCJdW1wiZW1haWxcIl0gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd2FsZG9yZl91c2VyX2VtYWlsJyk7XG4gICAgICAgICAgICBhbm5vdGF0aW9uW1wiY3JlYXRvclwiXVtcIm5pY2tuYW1lXCJdID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dhbGRvcmZfdXNlcl9uYW1lJyk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb2xkSUQgPSBhbm5vdGF0aW9uLmlkO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiTW9kaWZ5aW5nIGFubm90YXRpb24gXCIgKyBvbGRJRCk7XG4gICAgICAgIFxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiB0aGlzLmJhc2VVUkwgKyBcImFwaS9lZGl0L1wiLFxuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGFubm90YXRpb24pLFxuICAgICAgICAgICAgYXN5bmM6IHRydWUsXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLFxuICAgICAgICAgICAgYmVmb3JlU2VuZDogZnVuY3Rpb24gKHhocikge1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBdXRob3JpemF0aW9uJywgdGhpcy5tYWtlX3dyaXRlX2F1dGgoa2V5KSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGFubm90YXRpb24pO1xuICAgICAgICAgICAgICAgIGFubm90YXRpb24uaWQgPSBkYXRhLmlkOyAvLyBBcHBlbmQgdGhlIElEIGdpdmVuIGJ5IHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJTdWNjZXNzZnVsbHkgZWRpdGVkIHRoZSBhbm5vdGF0aW9uLiAoSUQgaXMgbm93IFwiICsgZGF0YS5pZCArIFwiKVwiKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuYW5ub3RhdG9yLm1lc3NhZ2VPdmVybGF5LlNob3dNZXNzYWdlKFwiU3VjY2Vzc2Z1bGx5IGVkaXRlZCB0aGUgYW5vdGF0aW9uLlwiKTtcbiAgICAgICAgICAgICAgICBpZihjYWxsYmFjaykgY2FsbGJhY2soYW5ub3RhdGlvbiwgb2xkSUQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUuZXJyb3IoYENvdWxkIG5vdCBlZGl0IHRoZSBhbm5vdGF0aW9uISBNZXNzYWdlOlxcbiAke3Jlc3BvbnNlLnJlc3BvbnNlSlNPTi5kZXRhaWx9YCk7XG4gICAgICAgICAgICAgICAgLy90aGlzLmFubm90YXRvci5tZXNzYWdlT3ZlcmxheS5TaG93RXJyb3IoYENvdWxkIG5vdCBlZGl0IHRoZSBhbm5vdGF0aW9uITxicj4oJHtyZXNwb25zZS5yZXNwb25zZUpTT04uZGV0YWlsfSlgKTtcbiAgICAgICAgICAgICAgICB2YXIgcmV0dXJuZWRfcmVzcG9uc2UgPSBcInVuZGVmaW5lZCBlcnJvciB3aGlsZSBlZGl0aW5nIHRoZSBhbm5vdGF0aW9uXCI7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnJlc3BvbnNlSlNPTikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm5lZF9yZXNwb25zZSA9IHJlc3BvbnNlLnJlc3BvbnNlSlNPTi5lcnJvci5jb2RlWzBdLnZhbHVlICsgXCIgOiBcIiArIHJlc3BvbnNlLnJlc3BvbnNlSlNPTi5lcnJvci5tZXNzYWdlWzBdLnZhbHVlIDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQ291bGQgbm90IGVkaXQgdGhlIGFubm90YXRpb24hIE1lc3NhZ2U6XFxuICR7cmV0dXJuZWRfcmVzcG9uc2V9YCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IubWVzc2FnZU92ZXJsYXkuU2hvd0Vycm9yKGBDb3VsZCBub3QgZWRpdCB0aGUgYW5ub3RhdGlvbiE8YnI+KCR7cmV0dXJuZWRfcmVzcG9uc2V9KWApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIERlbGV0ZUFubm90YXRpb24oYW5ub3RhdGlvbil7XG5cbiAgICAgICAgbGV0IGtleTtcbiAgICAgICAgaWYgKHRoaXMuYW5ub3RhdG9yLmFwaUtleSl7XG4gICAgICAgICAgICBrZXkgPSB0aGlzLmFubm90YXRvci5hcGlLZXk7XG4gICAgICAgICAgICBsZXQgZW1haWxfc3RvcmFnZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd3YWxkb3JmX3VzZXJfZW1haWwnKTtcbiAgICAgICAgICAgIGxldCBuYW1lX3N0b3JhZ2UgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd2FsZG9yZl91c2VyX25hbWUnKTtcbiAgICAgICAgICAgIGlmIChlbWFpbF9zdG9yYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIltTZXJ2ZXIgSW50ZXJmYWNlXSBZb3UgYXJlIG5vdCBsb2dnZWQgaW4hXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuYW5ub3RhdG9yLm1lc3NhZ2VPdmVybGF5LlNob3dFcnJvcihcIllvdSBhcmUgbm90IGxvZ2dlZCBpbiFcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYobmFtZV9zdG9yYWdlID09IG51bGwpIG5hbWVfc3RvcmFnZSA9IGVtYWlsX3N0b3JhZ2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrZXkgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd2FsZG9yZl9hdXRoX3Rva2VuJyk7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIltTZXJ2ZXIgSW50ZXJmYWNlXSBZb3UgYXJlIG5vdCBsb2dnZWQgaW4hXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuYW5ub3RhdG9yLm1lc3NhZ2VPdmVybGF5LlNob3dFcnJvcihcIllvdSBhcmUgbm90IGxvZ2dlZCBpbiFcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5hbm5vdGF0b3IuYXBpS2V5KXtcbiAgICAgICAgICAgIGlmKGFubm90YXRpb25bXCJjcmVhdG9yXCJdID09IG51bGwpIGFubm90YXRpb25bXCJjcmVhdG9yXCJdID0ge307XG4gICAgICAgICAgICBhbm5vdGF0aW9uW1wiY3JlYXRvclwiXVtcImVtYWlsXCJdID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dhbGRvcmZfdXNlcl9lbWFpbCcpO1xuICAgICAgICAgICAgYW5ub3RhdGlvbltcImNyZWF0b3JcIl1bXCJuaWNrbmFtZVwiXSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd3YWxkb3JmX3VzZXJfbmFtZScpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGVsX3VybCA9IHRoaXMuYmFzZVVSTCArIFwiYXBpL2RlbGV0ZVwiO1xuICAgICAgICBsZXQgZGVsX2RhdGEgPSB7XG4gICAgICAgICAgICAgICAgXCJzY2FsYXI6dXJuXCI6IFwidXJuOnNjYWxhcjp2ZXJzaW9uOlwiICsgYW5ub3RhdGlvbi5pZCxcbiAgICAgICAgICAgICAgICBcIm5hdGl2ZVwiOiBcImZhbHNlXCIsXG4gICAgICAgICAgICAgICAgXCJhY3Rpb25cIjogXCJERUxFVEVcIixcbiAgICAgICAgICAgICAgICBcImFwaV9rZXlcIjogYW5ub3RhdGlvbi5yZXF1ZXN0Lml0ZW1zLmFwaV9rZXksXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBhbm5vdGF0aW9uLnJlcXVlc3QuaXRlbXMuaWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIFxuXG4gICAgICAgIHJldHVybiAkLnBvc3QoZGVsX3VybCwgZGVsX2RhdGEsIGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRlbGV0ZSBlcnJvciByZXNwb25zZVwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgIH0gIFxuICAgICAgICB9KS5kb25lKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTdWNjZXNzZnVsbHkgZGVsZXRlZCB0aGUgYW5ub3RhdGlvbi5cIik7XG4gICAgICAgICAgICB0aGlzLmFubm90YXRvci5tZXNzYWdlT3ZlcmxheS5TaG93TWVzc2FnZShcIlN1Y2Nlc3NmdWxseSBkZWxldGVkIHRoZSBhbm5vdGF0aW9uLlwiKTtcbiAgICAgICAgfSkuZmFpbCgocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIHZhciByZXR1cm5lZF9yZXNwb25zZSA9IFwidW5kZWZpbmVkIGZhaWx1cmUgd2hpbGUgZGVsZXRpbmcgdGhlIGFubm90YXRpb25cIjtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5yZXNwb25zZUpTT04pIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZS5yZXNwb25zZUpTT04uZXJyb3IuY29kZVswXS52YWx1ZSArIFwiIDogXCIgKyByZXNwb25zZS5yZXNwb25zZUpTT04uZXJyb3IubWVzc2FnZVswXS52YWx1ZSA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDb3VsZCBub3QgZGVsZXRlIHRoZSBhbm5vdGF0aW9uLiBNZXNzYWdlOlxcbiAke3JldHVybmVkX3Jlc3BvbnNlfWApO1xuICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IubWVzc2FnZU92ZXJsYXkuU2hvd0Vycm9yKGBDb3VsZCBub3QgZGVsZXRlIHRoZSBhbm5vdGF0aW9uITxicj4oJHtyZXR1cm5lZF9yZXNwb25zZX0pYCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxufVxuXG5cbmV4cG9ydCB7IFNlcnZlckludGVyZmFjZSB9OyIsImxldCBzaGExID0gcmVxdWlyZSgnc2hhMScpO1xuXG4vKipcbiAqIE1hbmFnZXMgdGhlIHVzZXIgc2Vzc2lvbiBmb3IgY29tbXVuaWNhdGluZyB3aXRoIHRoZSBiYWNrZW5kLlxuICovXG5jbGFzcyBTZXNzaW9uTWFuYWdlciB7XG5cbiAgICBjb25zdHJ1Y3Rvcihhbm5vdGF0b3Ipe1xuICAgICAgICBjb25zb2xlLmxvZyhcIltTZXNzaW9uIE1hbmFnZXJdIENyZWF0aW5nIFNlc3Npb25NYW5hZ2VyLi4uXCIpO1xuICAgICAgICB0aGlzLmFubm90YXRvciA9IGFubm90YXRvcjtcbiAgICAgICAgdGhpcy5tb2RhbE9wZW4gPSBmYWxzZTtcblxuICAgICAgICAvLyBJbmplY3QgdGhlIGJ1dHRvbiBmb3IgbG9nZ2luZyBpbi9vdXQgaW50byB0aGUgdG9vbGJhclxuICAgICAgICBpZighYW5ub3RhdG9yLmtpb3NrTW9kZSAmJiBhbm5vdGF0b3IuY21zRW1haWwgPT0gJycpe1xuICAgICAgICAgICAgdGhpcy4kdXNlckJ1dHRvbiA9ICQoXCI8YnV0dG9uPlNlc3Npb248L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgICAgICBpY29uOiBcImZhIGZhLXVzZXJcIixcbiAgICAgICAgICAgICAgICBzaG93TGFiZWw6IGZhbHNlXG4gICAgICAgICAgICB9KS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5QcmVzZW50TW9kYWwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IucGxheWVyLmNvbnRyb2xCYXIuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJHVzZXJCdXR0b24sIDEsICdmbGV4LWVuZCcpO1xuICAgICAgICB9XG4gICAgICAgIC8vdGhpcy4kZGlhbG9nLmRpYWxvZyhcIm9wZW5cIik7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJbU2Vzc2lvbiBNYW5hZ2VyXSBTZXNzaW9uTWFuYWdlciBjcmVhdGVkLlwiKTtcblxuICAgIH1cblxuICAgIFNob3dMb2dpbk1vZGFsKCl7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBkaWFsb2dcbiAgICAgICAgbGV0ICRjb250YWluZXIgPSAkKFwiPGRpdiBjbGFzcz0nd2FsZG9yZi1zZXNzaW9uLW1vZGFsJyB0aXRsZT0nTG9nIEluJz48L2Rpdj5cIik7IC8vIE91dGVybW9zdCBIVE1MXG4gICAgICAgIGxldCAkaGVhZFRleHQgPSAkKFwiPHAgY2xhc3M9J3ZhbGlkYXRlVGlwcyc+QWxsIGZpZWxkcyBhcmUgcmVxdWlyZWQuPC9wPlwiKS5hcHBlbmRUbygkY29udGFpbmVyKTtcbiAgICAgICAgbGV0ICRmb3JtID0gJChcIjxmb3JtPjwvZm9ybT5cIikuYXBwZW5kVG8oJGNvbnRhaW5lcik7XG5cbiAgICAgICAgbGV0ICRuaWNrbmFtZUZpZWxkO1xuICAgICAgICBsZXQgJHVzZXJuYW1lRmllbGQ7XG4gICAgICAgIGxldCAkcGFzc3dvcmRGaWVsZDtcblxuICAgICAgICBpZiAodGhpcy5hbm5vdGF0b3IuYXBpS2V5KXtcbiAgICAgICAgICAgICQoXCI8bGFiZWwgZm9yPSd1c2VybmFtZSc+TmFtZTwvbGFiZWw+XCIpLmFwcGVuZFRvKCRmb3JtKTtcbiAgICAgICAgICAgICRuaWNrbmFtZUZpZWxkID0gJChcIjxpbnB1dCB0eXBlPSd0ZXh0JyBuYW1lPSd1c2VybmFtZScgdmFsdWU9JycgY2xhc3M9J3RleHQgdWktd2lkZ2V0LWNvbnRlbnQgdWktY29ybmVyLWFsbCc+XCIpLmFwcGVuZFRvKCRmb3JtKTtcbiAgICAgICAgICAgICQoXCI8bGFiZWwgZm9yPSd1c2VybmFtZSc+RW1haWwgQWRkcmVzczwvbGFiZWw+XCIpLmFwcGVuZFRvKCRmb3JtKTtcbiAgICAgICAgICAgICR1c2VybmFtZUZpZWxkID0gJChcIjxpbnB1dCB0eXBlPSd0ZXh0JyBuYW1lPSdlbWFpbCcgdmFsdWU9JycgY2xhc3M9J3RleHQgdWktd2lkZ2V0LWNvbnRlbnQgdWktY29ybmVyLWFsbCc+XCIpLmFwcGVuZFRvKCRmb3JtKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICQoXCI8bGFiZWwgZm9yPSd1c2VybmFtZSc+VXNlcm5hbWU8L2xhYmVsPlwiKS5hcHBlbmRUbygkZm9ybSk7XG4gICAgICAgICAgICAkdXNlcm5hbWVGaWVsZCA9ICQoXCI8aW5wdXQgdHlwZT0ndGV4dCcgbmFtZT0ndXNlcm5hbWUnIHZhbHVlPScnIGNsYXNzPSd0ZXh0IHVpLXdpZGdldC1jb250ZW50IHVpLWNvcm5lci1hbGwnPlwiKS5hcHBlbmRUbygkZm9ybSk7XG4gICAgICAgICAgICAkKFwiPGxhYmVsIGZvcj0ncGFzc3dvcmQnPlBhc3N3b3JkPC9sYWJlbD5cIikuYXBwZW5kVG8oJGZvcm0pO1xuICAgICAgICAgICAgJHBhc3N3b3JkRmllbGQgPSAkKFwiPGlucHV0IHR5cGU9J3Bhc3N3b3JkJyBuYW1lPSdwYXNzd29yZCcgdmFsdWU9JycgY2xhc3M9J3RleHQgdWktd2lkZ2V0LWNvbnRlbnQgdWktY29ybmVyLWFsbCc+XCIpLmFwcGVuZFRvKCRmb3JtKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJGZvcm0ud3JhcElubmVyKFwiPGZpZWxkc2V0IC8+XCIpO1xuXG4gICAgICAgIGxldCBsb2dpbiA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmKHRoaXMuYW5ub3RhdG9yLmFwaUtleSl7XG4gICAgICAgICAgICAgICAgbGV0IG5pY2tOYW1lID0gJG5pY2tuYW1lRmllbGQudmFsKCk7XG4gICAgICAgICAgICAgICAgbGV0IHVzZXJOYW1lID0gc2hhMSgkdXNlcm5hbWVGaWVsZC52YWwoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3Iuc2VydmVyLkxvZ0luKG5pY2tOYW1lLCB1c2VyTmFtZSkuZG9uZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQVBJIGtleSBsb2dpbiBzdWNjZXNzXCIpO1xuICAgICAgICAgICAgICAgICAgICAkZGlhbG9nLmRpYWxvZyhcImNsb3NlXCIpO1xuICAgICAgICAgICAgICAgIH0pLmZhaWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAkaGVhZFRleHQuaHRtbChcIjxwPkludmFsaWQgZW1haWwgYWRkcmVzcy48L3A+XCIpO1xuICAgICAgICAgICAgICAgICAgICAkaGVhZFRleHQuY3NzKFwiY29sb3JcIiwgXCJyZWRcIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgdXNlclBhc3MgPSBzaGExKCRwYXNzd29yZEZpZWxkLnZhbCgpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFubm90YXRvci5zZXJ2ZXIuTG9nSW4oJHVzZXJuYW1lRmllbGQudmFsKCksIHVzZXJQYXNzKS5kb25lKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgJGRpYWxvZy5kaWFsb2coXCJjbG9zZVwiKTtcbiAgICAgICAgICAgICAgICB9KS5mYWlsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgJGhlYWRUZXh0Lmh0bWwoXCI8cD5JbnZhbGlkIHVzZXJuYW1lIG9yIHBhc3N3b3JkLjwvcD5cIik7XG4gICAgICAgICAgICAgICAgICAgICRoZWFkVGV4dC5jc3MoXCJjb2xvclwiLCBcInJlZFwiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgbGV0ICRkaWFsb2cgPSAkY29udGFpbmVyLmRpYWxvZyh7XG4gICAgICAgICAgICBhdXRvT3BlbjogdHJ1ZSxcbiAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBtb2RhbDogdHJ1ZSxcbiAgICAgICAgICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgICAgICAgICBcIkxvZyBJblwiOiBsb2dpbixcbiAgICAgICAgICAgICAgICBDYW5jZWw6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgJGRpYWxvZy5kaWFsb2coXCJjbG9zZVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2xvc2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAkZGlhbG9nLmZpbmQoXCJmb3JtXCIpWyAwIF0ucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAkZGlhbG9nLmZpbmQoXCJpbnB1dFwiKS5yZW1vdmVDbGFzcyggXCJ1aS1zdGF0ZS1lcnJvclwiICk7XG4gICAgICAgICAgICAgICAgdGhpcy5Pbk1vZGFsQ2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgU2hvd0xvZ291dE1vZGFsKCl7XG4gICAgICAgIGxldCAkY29udGFpbmVyID0gJChcIjxkaXYgdGl0bGU9J0xvZyBPdXQnPjwvZGl2PlwiKTtcbiAgICAgICAgbGV0ICRoZWFkVGV4dCA9ICRjb250YWluZXIuaHRtbChcIjxwIGNsYXNzPSd2YWxpZGF0ZVRpcHMnPkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBsb2cgb3V0PzwvcD5cIik7XG4gICAgICAgIGxldCAkZGlhbG9nID0gJGNvbnRhaW5lci5kaWFsb2coe1xuICAgICAgICAgICAgYXV0b09wZW46IHRydWUsXG4gICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgbW9kYWw6IHRydWUsXG4gICAgICAgICAgICBidXR0b25zOiB7XG4gICAgICAgICAgICAgICAgXCJMb2cgT3V0XCI6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3Iuc2VydmVyLkxvZ091dCgpLmRvbmUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGRpYWxvZy5kaWFsb2coXCJjbG9zZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBDYW5jZWw6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgJGRpYWxvZy5kaWFsb2coXCJjbG9zZVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2xvc2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLk9uTW9kYWxDbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBQcmVzZW50TW9kYWwoKXtcbiAgICAgICAgLy8gRWFybHkgb3V0IGlmIHRoZSBtb2RhbCBpcyBhbHJlYWR5IG9wZW5cbiAgICAgICAgaWYodGhpcy5tb2RhbE9wZW4pIHJldHVybjtcblxuICAgICAgICAvLyBUdXJuIG9mZiBmdWxsc2NyZWVuIGlmIGl0J3Mgb25cbiAgICAgICAgdGhpcy5hbm5vdGF0b3IucGxheWVyLlNldEZ1bGxzY3JlZW4oZmFsc2UpO1xuXG4gICAgICAgIGlmKHRoaXMuYW5ub3RhdG9yLnNlcnZlci5Mb2dnZWRJbigpKXtcbiAgICAgICAgICAgIHRoaXMuU2hvd0xvZ291dE1vZGFsKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLlNob3dMb2dpbk1vZGFsKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLk9uTW9kYWxPcGVuKCk7XG4gICAgfVxuXG4gICAgT25Nb2RhbE9wZW4oKXtcbiAgICAgICAgdGhpcy4kdXNlckJ1dHRvbi5idXR0b24oXCJkaXNhYmxlXCIpO1xuICAgICAgICB0aGlzLm1vZGFsT3BlbiA9IHRydWU7XG4gICAgfVxuXG4gICAgT25Nb2RhbENsb3NlKCl7XG4gICAgICAgIHRoaXMuJHVzZXJCdXR0b24uYnV0dG9uKFwiZW5hYmxlXCIpO1xuICAgICAgICB0aGlzLm1vZGFsT3BlbiA9IGZhbHNlO1xuICAgIH1cblxufVxuXG5leHBvcnQgeyBTZXNzaW9uTWFuYWdlciB9OyIsIm1vZHVsZS5leHBvcnRzPXtcbiAgICBcImNvbmZpZ0ZpbGVcIjogXCJhbm5vdGF0b3ItY29uZmlnLmpzb25cIlxufSIsIi8qXG5FbnRyeSBwb2ludCBmb3IgdGhlIHdob2xlIHByb2plY3QuIEFueSBqUXVlcnkgZXh0ZW5zaW9ucyBzaG91bGRcbmJlIHJlZ2lzdGVyZWQgaGVyZS5cbiovXG5cbi8vIEltcG9ydCBucG0gbW9kdWxlIGRlcGVuZGVuY2llc1xuaW1wb3J0IFwiLi92ZW5kb3IuanNcIjtcblxuaW1wb3J0IFwiLi91dGlscy9hcnJheS1leHRlbnNpb25zLmpzXCI7XG5pbXBvcnQgXCIuL3V0aWxzL2pxdWVyeS1leHRlbnNpb25zLmpzXCI7XG5pbXBvcnQgXCIuL3V0aWxzL3N0cmluZy1leHRlbnNpb25zLmpzXCI7XG5cbmltcG9ydCB7IHByZWZlcmVuY2VzIH0gZnJvbSBcIi4vdXRpbHMvcHJlZmVyZW5jZS1tYW5hZ2VyLmpzXCI7XG5pbXBvcnQgeyBWZXJpZnlSZXF1aXJlbWVudHMgfSBmcm9tIFwiLi91dGlscy9yZXF1aXJlbWVudHMuanNcIjtcbmltcG9ydCB7IEFubm90YXRvclZpZGVvUGxheWVyIH0gZnJvbSBcIi4vdmlkZW8tcGxheWVyL3ZpZGVvLXBsYXllci5qc1wiO1xuXG5cbiQuZm4uYW5ub3RhdGUgPSBmdW5jdGlvbihhcmdzKXsgXG5cbiAgICAvLyBsZXQgc2VydmVyVVJMID0gYXJncy5zZXJ2ZXJVUkwgfHwgJyc7XG4gICAgLy8gbGV0IHRhZ3NVUkwgPSBhcmdzLnRhZ3NVUkwgfHwgJyc7XG4gICAgLy8gbGV0IGFwaUtleSA9IGFyZ3MuYXBpS2V5IHx8ICcnO1xuICAgIC8vIGxldCBraW9za01vZGUgPSBhcmdzLmtpb3NrTW9kZSB8fCBmYWxzZTtcbiAgICAvLyBsZXQgbG9jYWxVUkwgPSBhcmdzLmxvY2FsVVJMIHx8ICcnO1xuICAgIC8vIGxldCByZW5kZXJlciA9IGZ1bmN0aW9uKC4uLikgfHwgZmFsc2U7XG5cbiAgICAvLyBFcnJvciBvdXQgZWFybHkgaWYgXCJ0aGlzXCIgaXMgbm90IGEgdmlkZW9cbiAgICBpZigkKHRoaXMpLnByb3AoJ3RhZ05hbWUnKS50b0xvd2VyQ2FzZSgpICE9IFwidmlkZW9cIil7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJDYW5ub3Qgd3JhcCBhIG5vbi12aWRlbyBlbGVtZW50IVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKCFWZXJpZnlSZXF1aXJlbWVudHMoKSl7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBwcmVmZXJlbmNlcy5HZXRKU09OKChkYXRhKSA9PiB7XG4gICAgLy8gICAgIC8vY29uc29sZS5sb2coZGF0YSk7XG4gICAgLy8gfSk7XG4gICAgXG4gICAgbmV3IEFubm90YXRvclZpZGVvUGxheWVyKCQodGhpcyksIGFyZ3MpO1xuXG59OyIsIi8vIEZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTQ4NTM5NzQvNzEzODc5MlxuXG4vLyBXYXJuIGlmIG92ZXJyaWRpbmcgZXhpc3RpbmcgbWV0aG9kXG5pZihBcnJheS5wcm90b3R5cGUuZXF1YWxzKVxuICAgIGNvbnNvbGUud2FybihcIk92ZXJyaWRpbmcgZXhpc3RpbmcgQXJyYXkucHJvdG90eXBlLmVxdWFscy4gUG9zc2libGUgY2F1c2VzOiBOZXcgQVBJIGRlZmluZXMgdGhlIG1ldGhvZCwgXFxcbiAgICB0aGVyZSdzIGEgZnJhbWV3b3JrIGNvbmZsaWN0IG9yIHlvdSd2ZSBnb3QgZG91YmxlIGluY2x1c2lvbnMgaW4geW91ciBjb2RlLlwiKTtcbiAgICBcbi8vIGF0dGFjaCB0aGUgLmVxdWFscyBtZXRob2QgdG8gQXJyYXkncyBwcm90b3R5cGUgdG8gY2FsbCBpdCBvbiBhbnkgYXJyYXlcbkFycmF5LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICAvLyBpZiB0aGUgb3RoZXIgYXJyYXkgaXMgYSBmYWxzeSB2YWx1ZSwgcmV0dXJuXG4gICAgaWYgKCFhcnJheSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gY29tcGFyZSBsZW5ndGhzIC0gY2FuIHNhdmUgYSBsb3Qgb2YgdGltZSBcbiAgICBpZiAodGhpcy5sZW5ndGggIT0gYXJyYXkubGVuZ3RoKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbD10aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAvLyBDaGVjayBpZiB3ZSBoYXZlIG5lc3RlZCBhcnJheXNcbiAgICAgICAgaWYgKHRoaXNbaV0gaW5zdGFuY2VvZiBBcnJheSAmJiBhcnJheVtpXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAvLyByZWN1cnNlIGludG8gdGhlIG5lc3RlZCBhcnJheXNcbiAgICAgICAgICAgIGlmICghdGhpc1tpXS5lcXVhbHMoYXJyYXlbaV0pKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTsgICAgICAgXG4gICAgICAgIH0gICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmICh0aGlzW2ldICE9IGFycmF5W2ldKSB7IFxuICAgICAgICAgICAgLy8gV2FybmluZyAtIHR3byBkaWZmZXJlbnQgb2JqZWN0IGluc3RhbmNlcyB3aWxsIG5ldmVyIGJlIGVxdWFsOiB7eDoyMH0gIT0ge3g6MjB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7ICAgXG4gICAgICAgIH0gICAgICAgICAgIFxuICAgIH0gICAgICAgXG4gICAgcmV0dXJuIHRydWU7XG59XG4vLyBIaWRlIG1ldGhvZCBmcm9tIGZvci1pbiBsb29wc1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KEFycmF5LnByb3RvdHlwZSwgXCJlcXVhbHNcIiwge2VudW1lcmFibGU6IGZhbHNlfSk7IiwiLyoqXG4gKiBTZXRzIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBlbGVtZW50IHdoaWxlIGRpc2FibGluZyBpbnRlcmFjdGlvbi5cbiAqIERvZXNuJ3QgbWVzcyB3aXRoIGpRdWVyeSdzIHBvc2l0aW9uaW5nIGNhbGN1bGF0aW9ucyBsaWtlIHNob3coKVxuICogYW5kIGhpZGUoKS5cbiAqL1xuJC5mbi5tYWtlVmlzaWJsZSA9IGZ1bmN0aW9uKHNob3cpIHtcbiAgICBpZihzaG93KXtcbiAgICAgICAgJCh0aGlzKS5jc3Moe1xuICAgICAgICAgICAgXCJ2aXNpYmlsaXR5XCI6IFwidmlzaWJsZVwiLFxuICAgICAgICAgICAgXCJwb2ludGVyLWV2ZW50c1wiOiBcIlwiXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgICQodGhpcykuY3NzKHtcbiAgICAgICAgICAgIFwidmlzaWJpbGl0eVwiOiBcImhpZGRlblwiLFxuICAgICAgICAgICAgXCJwb2ludGVyLWV2ZW50c1wiOiBcIm5vbmVcIlxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG59XG5cbi8qXG5Db3B5cmlnaHQgMjAxNCBNaWtlIER1bm5cbmh0dHA6Ly91cHNob3RzLm9yZy9cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xuYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG5cIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbndpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbmRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xucGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXG50aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG5NRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxuTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRVxuTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTlxuT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXG5XSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuaHR0cHM6Ly9naXRodWIuY29tL21vYWdyaXVzL2NvcHljc3NcblxuKi9cblx0XG4kLmZuLmdldFN0eWxlcyA9IGZ1bmN0aW9uKG9ubHksIGV4Y2VwdCkge1xuICAgIFxuICAgIC8vIHRoZSBtYXAgdG8gcmV0dXJuIHdpdGggcmVxdWVzdGVkIHN0eWxlcyBhbmQgdmFsdWVzIGFzIEtWUFxuICAgIHZhciBwcm9kdWN0ID0ge307XG4gICAgXG4gICAgLy8gdGhlIHN0eWxlIG9iamVjdCBmcm9tIHRoZSBET00gZWxlbWVudCB3ZSBuZWVkIHRvIGl0ZXJhdGUgdGhyb3VnaFxuICAgIHZhciBzdHlsZTtcbiAgICBcbiAgICAvLyByZWN5Y2xlIHRoZSBuYW1lIG9mIHRoZSBzdHlsZSBhdHRyaWJ1dGVcbiAgICB2YXIgbmFtZTtcbiAgICBcbiAgICAvLyBpZiBpdCdzIGEgbGltaXRlZCBsaXN0LCBubyBuZWVkIHRvIHJ1biB0aHJvdWdoIHRoZSBlbnRpcmUgc3R5bGUgb2JqZWN0XG4gICAgaWYgKG9ubHkgJiYgb25seSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9ubHkubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAvLyBzaW5jZSB3ZSBoYXZlIHRoZSBuYW1lIGFscmVhZHksIGp1c3QgcmV0dXJuIHZpYSBidWlsdC1pbiAuY3NzIG1ldGhvZFxuICAgICAgICAgICAgbmFtZSA9IG9ubHlbaV07XG4gICAgICAgICAgICBwcm9kdWN0W25hbWVdID0gdGhpcy5jc3MobmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfSBlbHNlIHtcbiAgICBcbiAgICAgICAgLy8gcHJldmVudCBmcm9tIGVtcHR5IHNlbGVjdG9yXG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIHdlIG5lZWQgdG8gZ2V0IGV2ZXJ5dGhpbmdcbiAgICAgICAgICAgIHZhciBkb20gPSB0aGlzLmdldCgwKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gc3RhbmRhcmRzXG4gICAgICAgICAgICBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBjb252ZW5pZW5jZSBtZXRob2RzIHRvIHR1cm4gY3NzIGNhc2UgKCdiYWNrZ3JvdW5kLWltYWdlJykgdG8gY2FtZWwgKCdiYWNrZ3JvdW5kSW1hZ2UnKVxuICAgICAgICAgICAgICAgIHZhciBwYXR0ZXJuID0gL1xcLShbYS16XSkvZztcbiAgICAgICAgICAgICAgICB2YXIgdWMgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGIudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgICAgICB9O1x0XHRcdFxuICAgICAgICAgICAgICAgIHZhciBjYW1lbGl6ZSA9IGZ1bmN0aW9uKHN0cmluZyl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShwYXR0ZXJuLCB1Yyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBtYWtlIHN1cmUgd2UncmUgZ2V0dGluZyBhIGdvb2QgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgaWYgKHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZG9tLCBudWxsKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2FtZWwsIHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAvLyBvcGVyYSBkb2Vzbid0IGdpdmUgYmFjayBzdHlsZS5sZW5ndGggLSB1c2UgdHJ1dGh5IHNpbmNlIGEgMCBsZW5ndGggbWF5IGFzIHdlbGwgYmUgc2tpcHBlZCBhbnl3YXlzXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHlsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gc3R5bGUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHN0eWxlW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbWVsID0gY2FtZWxpemUobmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKG5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2R1Y3RbY2FtZWxdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBvcGVyYVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChuYW1lIGluIHN0eWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FtZWwgPSBjYW1lbGl6ZShuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHN0eWxlLmdldFByb3BlcnR5VmFsdWUobmFtZSkgfHwgc3R5bGVbbmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZHVjdFtjYW1lbF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElFIC0gZmlyc3QgdHJ5IGN1cnJlbnRTdHlsZSwgdGhlbiBub3JtYWwgc3R5bGUgb2JqZWN0IC0gZG9uJ3QgYm90aGVyIHdpdGggcnVudGltZVN0eWxlXG4gICAgICAgICAgICBlbHNlIGlmIChzdHlsZSA9IGRvbS5jdXJyZW50U3R5bGUpIHtcbiAgICAgICAgICAgICAgICBmb3IgKG5hbWUgaW4gc3R5bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvZHVjdFtuYW1lXSA9IHN0eWxlW25hbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHN0eWxlID0gZG9tLnN0eWxlKSB7XG4gICAgICAgICAgICAgICAgZm9yIChuYW1lIGluIHN0eWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3R5bGVbbmFtZV0gIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvZHVjdFtuYW1lXSA9IHN0eWxlW25hbWVdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIHJlbW92ZSBhbnkgc3R5bGVzIHNwZWNpZmllZC4uLlxuICAgIC8vIGJlIGNhcmVmdWwgb24gYmxhY2tsaXN0IC0gc29tZXRpbWVzIHZlbmRvci1zcGVjaWZpYyB2YWx1ZXMgYXJlbid0IG9idmlvdXMgYnV0IHdpbGwgYmUgdmlzaWJsZS4uLiAgZS5nLiwgZXhjZXB0aW5nICdjb2xvcicgd2lsbCBzdGlsbCBsZXQgJy13ZWJraXQtdGV4dC1maWxsLWNvbG9yJyB0aHJvdWdoLCB3aGljaCB3aWxsIGluIGZhY3QgY29sb3IgdGhlIHRleHRcbiAgICBpZiAoZXhjZXB0ICYmIGV4Y2VwdCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gZXhjZXB0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgbmFtZSA9IGV4Y2VwdFtpXTtcbiAgICAgICAgICAgIGRlbGV0ZSBwcm9kdWN0W25hbWVdO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIG9uZSB3YXkgb3V0IHNvIHdlIGNhbiBwcm9jZXNzIGJsYWNrbGlzdCBpbiBvbmUgc3BvdFxuICAgIHJldHVybiBwcm9kdWN0O1xuXG59O1xuXG4vLyBzdWdhciAtIHNvdXJjZSBpcyB0aGUgc2VsZWN0b3IsIGRvbSBlbGVtZW50IG9yIGpRdWVyeSBpbnN0YW5jZSB0byBjb3B5IGZyb20gLSBvbmx5IGFuZCBleGNlcHQgYXJlIG9wdGlvbmFsXG4kLmZuLmNvcHlDU1MgPSBmdW5jdGlvbihzb3VyY2UsIG9ubHksIGV4Y2VwdCkge1xuICAgIHZhciBzdHlsZXMgPSBzb3VyY2UuZ2V0U3R5bGVzKG9ubHksIGV4Y2VwdCk7XG4gICAgdGhpcy5jc3Moc3R5bGVzKTtcbiAgICBcbiAgICByZXR1cm4gdGhpcztcbn07IiwiLy8gQnJpbmcgaW4gYnVpbGQgY29uZmlnIG9wdGlvbnNcbmxldCBtZXRhY29uZmlnID0gcmVxdWlyZShcIi4uL2NvbmZpZy5qc29uXCIpO1xuXG5jbGFzcyBQcmVmZXJlbmNlTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICB9XG5cbiAgICBHZXRKU09OKGNhbGxiYWNrKXtcblxuICAgICAgICAvL2xldCBsb2MgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgICAgIC8vbGV0IGRpciA9IGxvYy5zdWJzdHJpbmcoMCwgbG9jLmxhc3RJbmRleE9mKCcvJykpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGRpciA9IFwiLi9kaXN0L1wiO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGRpciArIG1ldGFjb25maWcuY29uZmlnRmlsZSk7XG5cbiAgICAgICAgaWYodGhpcy5jYWNoZWRKU09OICE9IG51bGwpe1xuICAgICAgICAgICAgY2FsbGJhY2sodGhpcy5jYWNoZWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgICAgICB1cmw6IGRpciArIG1ldGFjb25maWcuY29uZmlnRmlsZSxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSk9PntcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWNoZWRKU09OID0gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sodGhpcy5jYWNoZWRKU09OKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG59XG5cbmV4cG9ydCBsZXQgcHJlZmVyZW5jZXMgPSBuZXcgUHJlZmVyZW5jZU1hbmFnZXIoKTsiLCIvKipcbiAqIFJldHVybnMgZmFsc2UgaWYgcnVubmluZyBvbiBhbiB1bnN1cHBvcnRlZCBwbGF0Zm9ybSBvciBtaXNzaW5nIGpRdWVyeSwgb3RoZXJ3aXNlIHRydWUuXG4gKiBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFZlcmlmeVJlcXVpcmVtZW50cygpIHtcbiAgICBcbiAgICAvLyBTdG9wIHJ1bm5pbmcgaWYgd2UncmUgb24gYW4gdW5zdXBwb3J0ZWQgcGxhdGZvcm0gKG1vYmlsZSBmb3Igbm93KVxuICAgIC8vIGlmKCAvQW5kcm9pZHx3ZWJPU3xpUGhvbmV8aVBhZHxpUG9kfEJsYWNrQmVycnl8SUVNb2JpbGV8T3BlcmEgTWluaS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgKSB7XG4gICAgLy8gICAgIGNvbnNvbGUuZXJyb3IoXCJQbGF0Zm9ybSBpcyB1bnN1cHBvcnRlZCFcIik7XG4gICAgLy8gICAgIC8vbGV0IHVuc3VwcG9ydGVkRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAvLyAgICAgLy91bnN1cHBvcnRlZERpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIllvdXIgcGxhdGZvcm0gaXMgdW5zdXBwb3J0ZWQhXCIpKTtcbiAgICAvLyAgICAgLy9kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHVuc3VwcG9ydGVkRGl2KTtcbiAgICAvLyAgICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vIH1cblxuICAgIC8vIENoZWNrIGlmIHdlIGRvbid0IGhhdmUgalF1ZXJ5IGxvYWRlZFxuICAgIGlmKCF3aW5kb3cualF1ZXJ5KXtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkpRdWVyeSBtdXN0IGJlIHByZXNlbnQhXCIpO1xuICAgICAgICAvL2xldCB1bnN1cHBvcnRlZERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIC8vdW5zdXBwb3J0ZWREaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJZb3VyIHBsYXRmb3JtIGlzIHVuc3VwcG9ydGVkIVwiKSk7XG4gICAgICAgIC8vZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh1bnN1cHBvcnRlZERpdik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgICBcbn0iLCJcbi8qKlxuICogRXNjYXBlcyB0aGUgc3RyaW5nIHNvIGl0IGNhbiBlbWJlZCBkaXJlY3RseSBpbiBhbiBIVE1MIGRvY3VtZW50LlxuICovXG4vLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMjAzNDMzNFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0cmluZy5wcm90b3R5cGUsICdlc2NhcGVIVE1MJywge1xuICAgIHZhbHVlKCkge1xuICAgICAgICB2YXIgZW50aXR5TWFwID0ge1xuICAgICAgICAgICAgJyYnOiAnJmFtcDsnLCAnPCc6ICcmbHQ7JywgJz4nOiAnJmd0OycsICdcIic6ICcmcXVvdDsnLFxuICAgICAgICAgICAgXCInXCI6ICcmIzM5OycsICcvJzogJyYjeDJGOycsICdgJzogJyYjeDYwOycsICc9JzogJyYjeDNEOydcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFN0cmluZyh0aGlzKS5yZXBsYWNlKC9bJjw+XCInYD1cXC9dL2csIGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICByZXR1cm4gZW50aXR5TWFwW3NdO1xuICAgICAgICB9KTtcbiAgICB9XG59KTsiLCIvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zNDg0MTAyNlxuZnVuY3Rpb24gR2V0Rm9ybWF0dGVkVGltZSh0aW1lSW5TZWNvbmRzKXtcbiAgICBpZihpc05hTih0aW1lSW5TZWNvbmRzKSkgcmV0dXJuIDA7XG4gICAgbGV0IHRpbWUgPSB0aW1lSW5TZWNvbmRzIHwgMDsgLy9UcnVuY2F0ZSB0byBpbnRlZ2VyXG4gICAgbGV0IGhvdXJzICAgPSBNYXRoLmZsb29yKHRpbWUgLyAzNjAwKSAlIDI0XG4gICAgbGV0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKHRpbWUgLyA2MCkgJSA2MFxuICAgIGxldCBzZWNvbmRzID0gdGltZSAlIDYwXG4gICAgbGV0IGZvcm1hdHRlZCA9IFtob3VycyxtaW51dGVzLHNlY29uZHNdXG4gICAgICAgIC5tYXAodiA9PiB2IDwgMTAgPyBcIjBcIiArIHYgOiB2KVxuICAgICAgICAuZmlsdGVyKCh2LGkpID0+IHYgIT09IFwiMDBcIiB8fCBpID4gMClcbiAgICAgICAgLmpvaW4oXCI6XCIpXG5cbiAgICBpZiAoZm9ybWF0dGVkLmNoYXJBdCgwKSA9PSBcIjBcIikge1xuICAgICAgICBmb3JtYXR0ZWQgPSBmb3JtYXR0ZWQuc3Vic3RyKDEpO1xuICAgIH1cblxuICAgIGxldCBtcyA9ICh0aW1lSW5TZWNvbmRzICUgMSkudG9GaXhlZCgyKTtcbiAgICBmb3JtYXR0ZWQgKz0gbXMudG9TdHJpbmcoKS5zdWJzdHIoMSk7XG5cbiAgICByZXR1cm4gZm9ybWF0dGVkO1xufVxuXG4vLyBGcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzk2NDA0MTcvNzEzODc5MlxuZnVuY3Rpb24gR2V0U2Vjb25kc0Zyb21ITVMoaG1zKXtcbiAgICBsZXQgcGFydHMgPSBobXMuc3BsaXQoJy4nKTtcbiAgICBsZXQgbXMgPSBcIjBcIjtcbiAgICBpZihwYXJ0cy5sZW5ndGggPiAxKSBtcyA9ICcuJytwYXJ0c1sxXTtcblxuICAgIGxldCBwID0gcGFydHNbMF0uc3BsaXQoJzonKSxcbiAgICAgICAgcyA9IDAsIG0gPSAxO1xuXG4gICAgd2hpbGUgKHAubGVuZ3RoID4gMCkge1xuICAgICAgICBzICs9IG0gKiBwYXJzZUludChwLnBvcCgpLCAxMCk7XG4gICAgICAgIG0gKj0gNjA7XG4gICAgfVxuXG4gICAgcyArPSBwYXJzZUZsb2F0KG1zKTtcbiAgICByZXR1cm4gcztcbn1cblxuZXhwb3J0IHsgR2V0Rm9ybWF0dGVkVGltZSwgR2V0U2Vjb25kc0Zyb21ITVMgfTsiLCIvKipcbiAqIFVzZSB0aGlzIGZpbGUgdG8gaW1wb3J0IHdoYXQgeW91IG5lZWQgZnJvbSB0aGUgYnVuZGxlZCBucG0gbW9kdWxlcy5cbiAqL1xuXG4vLyBNdXN0IGltcG9ydCBmcm9tIG5vZGVfbW9kdWxlcyBmb2xkZXIgb3IgaXQgd29uJ3Qgc2VlIHRoZSBzaGltbWVkIGpxdWVyeSBpbnN0YW5jZVxuLy8gUmVtb3ZlZCBmcm9tIGhlcmUgYmVjYXVzZSB0aGV5IHdlcmVuJ3QgYmVpbmcgbG9hZGVkIGluIHRoZSByaWdodCBvcmRlciAtIEpQQlxuLy8gaW1wb3J0ICcuLi9ub2RlX21vZHVsZXMvc2VsZWN0Mi9kaXN0L2pzL3NlbGVjdDIuanMnO1xuLy8gaW1wb3J0IFwiLi4vbm9kZV9tb2R1bGVzL3NlbGVjdDIvZGlzdC9jc3Mvc2VsZWN0Mi5jc3NcIjtcblxuaW1wb3J0IFwicXRpcDJcIjtcbi8vcmVxdWlyZShcIi4uL25vZGVfbW9kdWxlcy9xdGlwMi9kaXN0L2pxdWVyeS5xdGlwLm1pbi5qc1wiKTtcbi8vaW1wb3J0IFwiLi4vbm9kZV9tb2R1bGVzL3F0aXAyL2Rpc3QvanF1ZXJ5LnF0aXAubWluLmNzc1wiO1xuXG5pbXBvcnQgXCJjbGlwLXBhdGgtcG9seWdvblwiO1xuXG4vL2xldCBzY3JlZW5mdWxsID0gcmVxdWlyZSgnc2NyZWVuZnVsbCcpO1xuLy9pbXBvcnQgc2NyZWVuZnVsbCBmcm9tIFwic2NyZWVuZnVsbFwiO1xuXG4vLyBDRE4gcmVzb3VyY2VzXG4vLyBGb250LUF3ZXNvbWVcbi8vJChcImhlYWRcIikuYXBwZW5kKCQoXCI8c2NyaXB0IHNyYz0naHR0cHM6Ly91c2UuZm9udGF3ZXNvbWUuY29tL2E3MDNlMmU1YmYuanMnPjwvc2NyaXB0PlwiKSk7IiwiaW1wb3J0IHsgR2V0Rm9ybWF0dGVkVGltZSB9IGZyb20gXCIuLi91dGlscy90aW1lLmpzXCI7XG5cbmNsYXNzIFNlZWtiYXJUb29sdGlwIHtcbiAgICBjb25zdHJ1Y3RvcigkcGFyZW50LCBwbGF5ZXIpe1xuICAgICAgICB0aGlzLiRwYXJlbnQgPSAkcGFyZW50O1xuICAgICAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcblxuICAgICAgICB0aGlzLiR0b29sdGlwID0gJChcIjxkaXYgY2xhc3M9J3dhbGRvcmYtc2Vla2Jhci10b29sdGlwJz48L2Rpdj5cIikuYXBwZW5kVG8oJHBhcmVudCk7XG4gICAgICAgIHRoaXMudGV4dCA9IFwiVGVzdFwiO1xuICAgICAgICB0aGlzLiRjb250ZW50ID0gJChcIjxwPlwiICsgdGhpcy50ZXh0ICsgXCI8L3A+XCIpLmFwcGVuZFRvKHRoaXMuJHRvb2x0aXApO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5ob3Zlck9mZnNldCA9IC0xMDtcbiAgICAgICAgdGhpcy5wYWRkaW5nID0gNTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuSGlkZSgpO1xuXG4gICAgICAgIHRoaXMuJHBhcmVudC5tb3VzZW1vdmUoKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLlNob3coKTtcblxuICAgICAgICAgICAgLy9BZGQgYW5kIHVwZGF0ZSB0b29sdGlwIG9uIG1vdXNlIG1vdmVtZW50IHRvIHNob3cgd2hlcmUgdGhlIG1vdXNlIGlzIGhvdmVyaW5nLlxuICAgICAgICAgICAgbGV0IG1vdXNlWCA9IGV2ZW50LnBhZ2VYIC0gcGxheWVyLiRjb250YWluZXIub2Zmc2V0KCkubGVmdDtcbiAgICAgICAgICAgIGxldCBwZXJjZW50ID0gbW91c2VYIC8gdGhpcy4kcGFyZW50LndpZHRoKCk7XG4gICAgICAgICAgICBsZXQgdGltZUF0Q3Vyc29yID0gcGVyY2VudCAqIHBsYXllci52aWRlb0VsZW1lbnQuZHVyYXRpb247XG4gICAgICAgICAgICB0aGlzLk1vdmUobW91c2VYLCAwKTtcbiAgICAgICAgICAgIHRoaXMuU2V0Q29udGVudChHZXRGb3JtYXR0ZWRUaW1lKHRpbWVBdEN1cnNvcikpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuJHBhcmVudC5tb3VzZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLkhpZGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICBNb3ZlKHgsIHkpIHtcblxuICAgICAgICAvLyBHZXQgaW5pdGlhbCBwb3NpdGlvbnNcbiAgICAgICAgbGV0IGxlZnQgPSB4IC0gKHRoaXMuR2V0V2lkdGgoKSAvIDIpO1xuICAgICAgICBsZXQgdG9wID0geSAtICh0aGlzLkdldEhlaWdodCgpKSArIHRoaXMuaG92ZXJPZmZzZXQ7XG4gICAgICAgIFxuICAgICAgICAvLyBPZmZzZXQgaWYgbmVjZXNzYXJ5IChrZWVwIG9uLXNjcmVlbilcbiAgICAgICAgaWYgKGxlZnQgLSB0aGlzLnBhZGRpbmcgPCAwKSB7XG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5wYWRkaW5nO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoIChsZWZ0ICsgdGhpcy5wYWRkaW5nICsgdGhpcy5HZXRXaWR0aCgpKSA+IHRoaXMuJHBhcmVudC53aWR0aCgpICkge1xuICAgICAgICAgICAgbGVmdCA9IHRoaXMuJHBhcmVudC53aWR0aCgpIC0gdGhpcy5HZXRXaWR0aCgpIC0gdGhpcy5wYWRkaW5nO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBBcHBseSBwb3NpdGlvbnNcbiAgICAgICAgdGhpcy4kdG9vbHRpcC5jc3Moe1xuICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICBsZWZ0OiBsZWZ0XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIEdldFdpZHRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kdG9vbHRpcC53aWR0aCgpO1xuICAgIH1cblxuICAgIEdldEhlaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJHRvb2x0aXAuaGVpZ2h0KCk7XG4gICAgfVxuXG4gICAgU2hvdygpIHtcbiAgICAgICAgdGhpcy4kdG9vbHRpcC5tYWtlVmlzaWJsZSh0cnVlKTtcbiAgICB9XG5cbiAgICBIaWRlKCkge1xuICAgICAgICB0aGlzLiR0b29sdGlwLm1ha2VWaXNpYmxlKGZhbHNlKTtcbiAgICB9XG5cbiAgICBTZXRDb250ZW50KHRleHQpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0ZXh0KTtcbiAgICAgICAgdGhpcy4kY29udGVudC50ZXh0KHRleHQpO1xuICAgIH1cblxuXG5cbn1cblxuZXhwb3J0IHsgU2Vla2JhclRvb2x0aXAgfTsiLCJpbXBvcnQgeyBHZXRGb3JtYXR0ZWRUaW1lIH0gZnJvbSBcIi4uL3V0aWxzL3RpbWUuanNcIjtcbmltcG9ydCB7IFNlZWtiYXJUb29sdGlwIH0gZnJvbSBcIi4vc2Vla2Jhci10b29sdGlwLmpzXCI7XG5cbmNsYXNzIFZpZGVvUGxheWVyQmFyIHtcblxuICAgIGNvbnN0cnVjdG9yKHBsYXllcil7XG4gICAgICAgIHRoaXMucGxheWVyID0gcGxheWVyOyBcbiAgICAgICAgdGhpcy4kY29udGFpbmVyID0gJChcIjxkaXYgY2xhc3M9J3dhbGRvcmYtcGxheWVyLXRvb2xiYXIgZmxleC10b29sYmFyJz48L2Rpdj5cIikuYXBwZW5kVG8ocGxheWVyLiRjb250YWluZXIpO1xuXG4gICAgICAgIHRoaXMuUG9wdWxhdGVFbGVtZW50cygpO1xuXG4gICAgICAgIHRoaXMuc2NydWJiaW5nVGltZVNsaWRlciA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZpZGVvUGxheWluZ0JlZm9yZVRpbWVTY3J1YiA9IGZhbHNlO1xuXG4gICAgICAgIC8vIEhvb2sgdXAgdG8gZXZlbnRzIGZyb20gdmlkZW8gcGxheWVyXG4gICAgICAgIHRoaXMucGxheWVyLiRjb250YWluZXIub24oXCJPblZpc2liaWxpdHlDaGFuZ2VcIiwgXG4gICAgICAgICAgICAoZXZlbnQsIGlzVmlzaWJsZSwgZHVyYXRpb24pID0+IHRoaXMuU2V0VmlzaWJsZShpc1Zpc2libGUsIGR1cmF0aW9uKVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMucGxheWVyLiRjb250YWluZXIub24oXCJPblBsYXlTdGF0ZUNoYW5nZVwiLCBcbiAgICAgICAgICAgIChldmVudCwgcGxheWluZykgPT4gdGhpcy5PblBsYXlTdGF0ZUNoYW5nZShwbGF5aW5nKVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMucGxheWVyLiRjb250YWluZXIub24oXCJPblRpbWVVcGRhdGVcIiwgXG4gICAgICAgICAgICAoZXZlbnQsIHRpbWUpID0+IHRoaXMuT25UaW1lVXBkYXRlKHRpbWUpXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5wbGF5ZXIuJGNvbnRhaW5lci5vbihcIk9uTXV0ZVN0YXRlQ2hhbmdlXCIsIFxuICAgICAgICAgICAgKGV2ZW50LCBtdXRlZCkgPT4gdGhpcy5Pbk11dGVTdGF0ZUNoYW5nZShtdXRlZClcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLnBsYXllci4kY29udGFpbmVyLm9uKFwiT25Wb2x1bWVDaGFuZ2VcIiwgXG4gICAgICAgICAgICAoZXZlbnQsIHZvbHVtZSkgPT4gdGhpcy5PblZvbHVtZUNoYW5nZSh2b2x1bWUpXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgIH1cblxuICAgIFBvcHVsYXRlRWxlbWVudHMoKXtcblxuICAgICAgICB0aGlzLiRzZWVrQmFyID0gJChcIjxkaXYgaWQ9J3NlZWstYmFyJz48ZGl2IGlkPSdzZWVrLWhhbmRsZScgY2xhc3M9J3VpLXNsaWRlci1oYW5kbGUnPjwvZGl2PjwvZGl2PlwiKTtcbiAgICAgICAgbGV0ICRzZWVrU2xpZGVyID0gdGhpcy4kc2Vla0Jhci5zbGlkZXIoe1xuICAgICAgICAgICAgbWluOiAwLjAsXG4gICAgICAgICAgICBtYXg6IDEuMCxcbiAgICAgICAgICAgIHN0ZXA6IDAuMDAxXG4gICAgICAgIH0pO1xuICAgICAgICAkc2Vla1NsaWRlci5vbihcInNsaWRlXCIsICgpID0+IHRoaXMuVXBkYXRlVmlkZW9UaW1lKCkpO1xuICAgICAgICAkc2Vla1NsaWRlci5vbihcInNsaWRlc3RhcnRcIiwgKCkgPT4gdGhpcy5UaW1lRHJhZ1N0YXJ0ZWQoKSk7XG4gICAgICAgICRzZWVrU2xpZGVyLm9uKFwic2xpZGVzdG9wXCIsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuVGltZURyYWdGaW5pc2hlZCgpO1xuICAgICAgICAgICAgdGhpcy5VcGRhdGVWaWRlb1RpbWUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmQodGhpcy4kc2Vla0Jhcik7XG4gICAgICAgIHRoaXMuc2Vla2JhclRvb2x0aXAgPSBuZXcgU2Vla2JhclRvb2x0aXAodGhpcy4kc2Vla0JhciwgdGhpcy5wbGF5ZXIpO1xuXG4gICAgICAgIHRoaXMuJHNlZWtQcm9ncmVzcyA9ICQoXCI8ZGl2IGlkPSdzZWVrLWZpbGwnPjwvZGl2PlwiKTtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZCh0aGlzLiRzZWVrUHJvZ3Jlc3MpO1xuXG4gICAgICAgIC8vSnVtcCBCYWNrIGJ1dHRvblxuICAgICAgICB0aGlzLiRqdW1wQmFja0J1dHRvbiA9ICQoXCI8YnV0dG9uPkp1bXAgQmFjazwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgaWNvbjogXCJmYSBmYS1mYXN0LWJhY2t3YXJkXCIsXG4gICAgICAgICAgICBzaG93TGFiZWw6IGZhbHNlXG4gICAgICAgIH0pLmNsaWNrKCgpID0+IHRoaXMucGxheWVyLkp1bXBCYWNrd2FyZCgpKTtcbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kanVtcEJhY2tCdXR0b24sIC04KTsgICBcbiAgICAgICAgXG4gICAgICAgIC8vTnVkZ2UgQmFjayBidXR0b25cbiAgICAgICAgdGhpcy4kbnVkZ2VCYWNrQnV0dG9uID0gJChcIjxidXR0b24+TnVkZ2UgQmFjazwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgaWNvbjogXCJmYSBmYS1zdGVwLWJhY2t3YXJkXCIsXG4gICAgICAgICAgICBzaG93TGFiZWw6IGZhbHNlXG4gICAgICAgIH0pLmNsaWNrKCgpID0+IHRoaXMucGxheWVyLlN0ZXBCYWNrd2FyZCgpKTtcbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kbnVkZ2VCYWNrQnV0dG9uLCAtNyk7XG5cbiAgICAgICAgLy8gUGxheSBidXR0b25cbiAgICAgICAgdGhpcy4kcGxheUJ1dHRvbiA9ICQoXCI8YnV0dG9uPlBsYXk8L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgIGljb246IFwiZmEgZmEtcGxheVwiLFxuICAgICAgICAgICAgc2hvd0xhYmVsOiBmYWxzZVxuICAgICAgICB9KS5jbGljaygoKSA9PiB0aGlzLnBsYXllci5Ub2dnbGVQbGF5U3RhdGUoKSk7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJHBsYXlCdXR0b24sIC02KTtcblxuICAgICAgICAvL051ZGdlIGJ1dHRvblxuICAgICAgICB0aGlzLiRudWRnZUJ1dHRvbiA9ICQoXCI8YnV0dG9uPk51ZGdlPC9idXR0b24+XCIpLmJ1dHRvbih7XG4gICAgICAgICAgICBpY29uOiBcImZhIGZhLXN0ZXAtZm9yd2FyZFwiLFxuICAgICAgICAgICAgc2hvd0xhYmVsOiBmYWxzZVxuICAgICAgICB9KS5jbGljaygoKSA9PiB0aGlzLnBsYXllci5TdGVwRm9yd2FyZCgpKTtcbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kbnVkZ2VCdXR0b24sIC01KTsgICBcbiAgICAgICAgXG4gICAgICAgIC8vSnVtcCBidXR0b25cbiAgICAgICAgdGhpcy4kanVtcEJ1dHRvbiA9ICQoXCI8YnV0dG9uPk51ZGdlPC9idXR0b24+XCIpLmJ1dHRvbih7XG4gICAgICAgICAgICBpY29uOiBcImZhIGZhLWZhc3QtZm9yd2FyZFwiLFxuICAgICAgICAgICAgc2hvd0xhYmVsOiBmYWxzZVxuICAgICAgICB9KS5jbGljaygoKSA9PiB0aGlzLnBsYXllci5KdW1wRm9yd2FyZCgpKTtcbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kanVtcEJ1dHRvbiwgLTQpOyAgICAgICAgICBcblxuICAgICAgICAvLyBUaW1lIHRleHRcbiAgICAgICAgbGV0IHplcm8gPSBHZXRGb3JtYXR0ZWRUaW1lKDAuMDAwKTtcbiAgICAgICAgdGhpcy4kdGltZVRleHQgPSAkKFwiPHA+JHt6ZXJvfS8ke3plcm99PC9wPlwiKTtcbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kdGltZVRleHQsIC0zKTtcblxuICAgICAgICAvLyBNdXRlIGJ1dHRvblxuICAgICAgICB0aGlzLiRtdXRlQnV0dG9uID0gJChcIjxidXR0b24+TXV0ZTwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgaWNvbjogXCJmYSBmYS12b2x1bWUtdXBcIixcbiAgICAgICAgICAgIHNob3dMYWJlbDogZmFsc2UsXG4gICAgICAgIH0pLmNsaWNrKCgpID0+IHRoaXMucGxheWVyLlRvZ2dsZU11dGVTdGF0ZSgpKTtcbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kbXV0ZUJ1dHRvbiwgLTIpO1xuXG4gICAgICAgIC8vIFZvbHVtZSBiYXJcbiAgICAgICAgdGhpcy4kdm9sdW1lQmFyID0gJChcIjxkaXYgaWQ9J3ZvbHVtZS1iYXInPjxkaXYgaWQ9J3ZvbHVtZS1oYW5kbGUnIGNsYXNzPSd1aS1zbGlkZXItaGFuZGxlJz48L2Rpdj48L2Rpdj5cIik7XG4gICAgICAgIHRoaXMuJHZvbHVtZUJhci5zbGlkZXIoe1xuICAgICAgICAgICAgcmFuZ2U6IFwibWluXCIsXG4gICAgICAgICAgICBtYXg6IDEuMCxcbiAgICAgICAgICAgIHZhbHVlOiAxLjAsXG4gICAgICAgICAgICBzdGVwOiAwLjA1XG4gICAgICAgIH0pLm9uKFwic2xpZGVcIiwgKGV2ZW50LCB1aSkgPT4gdGhpcy5wbGF5ZXIuU2V0Vm9sdW1lKHVpLnZhbHVlKSk7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJHZvbHVtZUJhciwgLTEpO1xuXG4gICAgICAgIC8vIEZ1bGxzY3JlZW4gYnV0dG9uXG4gICAgICAgIHRoaXMuJGZ1bGxTY3JlZW5CdXR0b24gPSAkKFwiPGJ1dHRvbj5GdWxsc2NyZWVuPC9idXR0b24+XCIpLmJ1dHRvbih7XG4gICAgICAgICAgICBpY29uOiBcImZhIGZhLWFycm93cy1hbHRcIixcbiAgICAgICAgICAgIHNob3dMYWJlbDogZmFsc2VcbiAgICAgICAgfSkuY2xpY2soKCkgPT4gdGhpcy5wbGF5ZXIuVG9nZ2xlRnVsbHNjcmVlbigpKTtcbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kZnVsbFNjcmVlbkJ1dHRvbiwgOTk5LCAnZmxleC1lbmQnKTtcbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSBlbXB0eSBlbGVtZW50IGJldHdlZW4gbGVmdCBmbG9hdGluZyBhbmQgcmlnaHQgZmxvYXRpbmcgdG9vbGJhciBpdGVtcyB0byBzcGFjZSB0aGVtIG91dCBwcm9wZXJseVxuICAgICAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKCQoXCI8ZGl2PjwvZGl2PlwiKS5jc3MoXCJmbGV4LWdyb3dcIiwgMSkuY3NzKFwib3JkZXJcIiwgMCkpO1xuXG4gICAgICAgIC8vSW5pdGlhbGl6ZSBjb250cm9sc1xuICAgICAgICB0aGlzLk9uVGltZVVwZGF0ZSgpO1xuICAgICAgICB0aGlzLiR2b2x1bWVCYXIuc2xpZGVyKFwidmFsdWVcIiwgdGhpcy5wbGF5ZXIudmlkZW9FbGVtZW50LnZvbHVtZSk7XG4gICAgfVxuXG4gICAgUmVnaXN0ZXJFbGVtZW50KCRlbGVtZW50LCBvcmRlciwganVzdGlmaWNhdGlvbiA9ICdmbGV4LXN0YXJ0Jyl7XG4gICAgICAgICRlbGVtZW50LmNzcygnb3JkZXInLCBvcmRlcik7XG4gICAgICAgICRlbGVtZW50LmNzcygnYWxpZ24tc2VsZicsIGp1c3RpZmljYXRpb24pO1xuICAgICAgICAvLyBTZXRzIGdyb3cgW3Nocmlua10gW2Jhc2lzXVxuICAgICAgICAvLyRlbGVtZW50LmNzcygnZmxleCcsICcwIDAgYXV0bycpO1xuICAgICAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKCRlbGVtZW50KTtcbiAgICB9XG5cbiAgICBTZXRWaXNpYmxlKGlzVmlzaWJsZSwgZHVyYXRpb24pe1xuICAgICAgICAvL2NvbnNvbGUubG9nKGlzVmlzaWJsZSArIFwiIFwiICsgZHVyYXRpb24pO1xuICAgICAgICB0aGlzLiRjb250YWluZXIuc3RvcCh0cnVlLCB0cnVlKTtcbiAgICAgICAgaWYoaXNWaXNpYmxlKXtcbiAgICAgICAgICAgIHRoaXMuJGNvbnRhaW5lci5mYWRlVG8oZHVyYXRpb24sIDEuMCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuJGNvbnRhaW5lci5tYWtlVmlzaWJsZSh0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kY29udGFpbmVyLmZhZGVUbyhkdXJhdGlvbiwgMC4wLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy4kY29udGFpbmVyLm1ha2VWaXNpYmxlKGZhbHNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgVXBkYXRlVmlkZW9UaW1lKCl7XG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgbmV3IHRpbWVcbiAgICAgICAgbGV0IHRpbWUgPSB0aGlzLnBsYXllci52aWRlb0VsZW1lbnQuZHVyYXRpb24gKiB0aGlzLiRzZWVrQmFyLnNsaWRlcihcInZhbHVlXCIpO1xuICAgICAgICB0aGlzLnBsYXllci5lbmRUaW1lID0gZmFsc2U7XG4gICAgICAgIHRoaXMucGxheWVyLnZpZGVvRWxlbWVudC5jdXJyZW50VGltZSA9IHRpbWU7XG4gICAgfVxuXG4gICAgVGltZURyYWdTdGFydGVkKCl7XG4gICAgICAgIHRoaXMudmlkZW9QbGF5aW5nQmVmb3JlVGltZVNjcnViID0gIXRoaXMucGxheWVyLnZpZGVvRWxlbWVudC5wYXVzZWQ7XG4gICAgICAgIHRoaXMucGxheWVyLnZpZGVvRWxlbWVudC5wYXVzZSgpO1xuICAgIH1cblxuICAgIFRpbWVEcmFnRmluaXNoZWQoKXtcbiAgICAgICAgLy8gU3RhcnQgcGxheWluZyB0aGUgdmlkZW8gYWdhaW4gaWYgaXQgd2FzIHBsYXlpbmcgYmVmb3JlIHRoZSBzY3J1YiBzdGFydGVkXG4gICAgICAgIGlmICh0aGlzLnZpZGVvUGxheWluZ0JlZm9yZVRpbWVTY3J1Yil7XG4gICAgICAgICAgICB0aGlzLnBsYXllci52aWRlb0VsZW1lbnQucGxheSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8vXG4gICAgLy8vIC0tLS0tIEV2ZW50IExpc3RlbmVycyAtLS0tLVxuICAgIC8vLyBUaGUgZm9sbG93aW5nIHVwZGF0ZSB0aGUgdmlzdWFsIHN0YXRlIG9mIHRoZSBiYXJcbiAgICAvLy8gdXBvbiBjaGFuZ2VzIHRvIHRoZSB2aWRlbyBwbGF5ZXIuIFRoZXNlIGFyZSBob29rZWRcbiAgICAvLy8gdXAgaW4gdGhlIGNvbnN0cnVjdG9yLlxuICAgIC8vL1xuXG4gICAgT25QbGF5U3RhdGVDaGFuZ2UocGxheWluZyl7XG4gICAgICAgIHRoaXMuJHBsYXlCdXR0b24uYnV0dG9uKFwib3B0aW9uXCIsIHtcbiAgICAgICAgICAgIGljb246IHBsYXlpbmcgPyBcImZhIGZhLXBhdXNlXCIgOiBcImZhIGZhLXBsYXlcIlxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBPblRpbWVVcGRhdGUodGltZSl7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJ2aWRlby1wbGF5ZXItYmFyLmpzOjE4NSBPblRpbWVVcGRhdGUgaXMgY2FsbGVkXCIpO1xuICAgICAgICBsZXQgZHVyYXRpb24gPSB0aGlzLnBsYXllci52aWRlb0VsZW1lbnQuZHVyYXRpb247XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSB0aW1lIHRleHRcbiAgICAgICAgdGhpcy4kdGltZVRleHQudGV4dChHZXRGb3JtYXR0ZWRUaW1lKHRpbWUpICsgXCIvXCIgKyBHZXRGb3JtYXR0ZWRUaW1lKGR1cmF0aW9uKSk7XG5cbiAgICAgICAgbGV0IHByb2dyZXNzID0gdGltZSAvIGR1cmF0aW9uO1xuICAgICAgICB0aGlzLiRzZWVrUHJvZ3Jlc3Mud2lkdGgoKHByb2dyZXNzICogMTAwKS50b1N0cmluZygpICsgXCIlXCIpO1xuICAgIH1cblxuICAgIE9uVm9sdW1lQ2hhbmdlKHZvbHVtZSl7XG4gICAgICAgIHRoaXMuJHZvbHVtZUJhci5zbGlkZXIoXCJ2YWx1ZVwiLCB2b2x1bWUpO1xuICAgIH1cblxuICAgIE9uTXV0ZVN0YXRlQ2hhbmdlKG11dGVkKXtcbiAgICAgICAgdGhpcy4kbXV0ZUJ1dHRvbi5idXR0b24oXCJvcHRpb25cIiwge1xuICAgICAgICAgICAgaWNvbjogbXV0ZWQgPyBcImZhIGZhLXZvbHVtZS11cFwiIDogXCJmYSBmYS12b2x1bWUtb2ZmXCJcbiAgICAgICAgfSk7XG4gICAgfVxuXG59XG5cbmV4cG9ydCB7IFZpZGVvUGxheWVyQmFyIH0iLCJpbXBvcnQgeyBWaWRlb1BsYXllckJhciB9IGZyb20gXCIuL3ZpZGVvLXBsYXllci1iYXIuanNcIjtcbmltcG9ydCB7IFZpZGVvQW5ub3RhdG9yIH0gZnJvbSBcIi4uL2Fubm90YXRvci9hbm5vdGF0b3IuanNcIjtcbi8vaW1wb3J0ICogYXMgc2NyZWVuZnVsbCBmcm9tIFwic2NyZWVuZnVsbFwiO1xuXG4vL2ltcG9ydCAnanF1ZXJ5LXVpL2Rpc3QvanF1ZXJ5LXVpLmpzJztcbmxldCBzY3JlZW5mdWxsID0gcmVxdWlyZSgnc2NyZWVuZnVsbCcpO1xuXG5jbGFzcyBBbm5vdGF0b3JWaWRlb1BsYXllciB7XG4gICAgY29uc3RydWN0b3IoJHZpZGVvLCBhbm5vdGF0b3JBcmdzKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJbQW5ub3RhdG9yVmlkZW9QbGF5ZXJdIENyZWF0aW5nIEFubm90YXRvclZpZGVvUGxheWVyIGZvciB2aWRlby4uLlwiKTtcbiAgICAgICAgdGhpcy4kdmlkZW8gPSAkdmlkZW87XG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50ID0gdGhpcy4kdmlkZW8uZ2V0KDApO1xuXG4gICAgICAgIC8vIFN0b3JlIHRoZSBvcmlnaW5hbCBzdHlsaW5nIG9mIHRoZSB2aWRlbyBlbGVtZW50IGJlZm9yZSB3ZSBhbHRlciBpdFxuICAgICAgICB0aGlzLm9yaWdpbmFsU3R5bGVzID0gdGhpcy4kdmlkZW8uZ2V0U3R5bGVzKG51bGwsIFtcImhlaWdodFwiLCBcIldlYmtpdFRleHRGaWxsQ29sb3JcIiwgXCJjb2xvclwiXSk7IC8vW1wid2lkdGhcIiwgXCJ0b3BcIiwgXCJsZWZ0XCIsIFwibWFyZ2luXCIsIFwicGFkZGluZ1wiXVxuXG4gICAgICAgIHRoaXMuV3JhcCgpO1xuICAgICAgICB0aGlzLlBvcHVsYXRlQ29udHJvbHMoKTtcbiAgICAgICAgdGhpcy5TZXRWaXNpYmxlKHRydWUpO1xuXG4gICAgICAgIC8vIEhvb2sgdXAgZXZlbnRzXG4gICAgICAgIHRoaXMuSG9va1VwRXZlbnRzKCk7XG5cbiAgICAgICAgLy8gUGxheSAvIHBhdXNlIHRoZSB2aWRlbyB3aGVuIGNsaWNrZWQuXG4gICAgICAgIHRoaXMuJHZpZGVvLm9uKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5Ub2dnbGVQbGF5U3RhdGUoKSk7XG5cbiAgICAgICAgdGhpcy5hbGxvd0F1dG9GYWRlID0gdHJ1ZTtcbiAgICAgICAgLy8vIEluYWN0aXZpdHkgdGltZXIgZm9yIHRoZSBtb3VzZS5cbiAgICAgICAgdGhpcy5tb3VzZVRpbWVyID0gbnVsbDtcbiAgICAgICAgLy8vIFNldCB0byB0cnVlIGlmIHRoZSB0aW1lIHNsaWRlciBpcyBjdXJyZW50bHkgYmVpbmcgZHJhZ2dlZCBieSB0aGUgdXNlci5cbiAgICAgICAgdGhpcy5kcmFnZ2luZ1RpbWVTbGlkZXIgPSBmYWxzZTtcbiAgICAgICAgLy8vIFNlY29uZHMgYmVmb3JlIHRoZSBVSSBmYWRlcyBkdWUgdG8gbW91c2UgaW5hY3Rpdml0eS5cbiAgICAgICAgdGhpcy5pZGxlU2Vjb25kc0JlZm9yZUZhZGUgPSAzO1xuICAgICAgICB0aGlzLmZhZGVEdXJhdGlvbiA9IDMwMDtcbiAgICAgICAgdGhpcy5lbmRUaW1lID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy4kY29udGFpbmVyLm1vdXNlbW92ZSgoKSA9PiB0aGlzLk9uTW91c2VNb3ZlKCkpO1xuICAgICAgICB0aGlzLlNldEF1dG9GYWRlKHRydWUpO1xuXG4gICAgICAgIC8vIElmIHNjcmVlbmZ1bGwgaXMgZW5hYmxlZCwgY3JlYXRlIHRoZSBldmVudCB0byBoYW5kbGUgaXQuXG4gICAgICAgIGlmKHNjcmVlbmZ1bGwgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIHNjcmVlbmZ1bGwub25jaGFuZ2UoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuT25GdWxsc2NyZWVuQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kY29udGFpbmVyLnRyaWdnZXIoXCJPbkZ1bGxzY3JlZW5DaGFuZ2VcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50Lm9udGltZXVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuT25UaW1lVXBkYXRlKHRoaXMudmlkZW9FbGVtZW50LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLiRjb250YWluZXIub24oXCJPblZpZGVvUmVhZHlcIiwgKCkgPT4ge1xuICAgICAgICAgICAgaWYoYW5ub3RhdG9yQXJncy5hbm5vdGF0b3I9PW51bGwpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW0Fubm90YXRvclZpZGVvUGxheWVyXSBQbGF5ZXIgc2VudCBPblZpZGVvUmVhZHksIGF0dGVtcHRpbmcgdG8gd3JhcCB3aXRoIGFubm90YXRvci4uLlwiKTtcbiAgICAgICAgICAgICAgICAvLyBBZGQgYW5ub3RhdG9yIG9uY2UgdmlkZW8gaGFzIGxvYWRlZFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW0Fubm90YXRvclZpZGVvUGxheWVyXSBXcmFwcGluZyB2aWRlbyB3aXRoIGFubm90YXRvci4uLlwiKTtcbiAgICAgICAgICAgICAgICBhbm5vdGF0b3JBcmdzLnBsYXllciA9IHRoaXM7XG4gICAgICAgICAgICAgICAgYW5ub3RhdG9yQXJncy5hbm5vdGF0b3IgPSBuZXcgVmlkZW9Bbm5vdGF0b3IoYW5ub3RhdG9yQXJncyk7XG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIGFubm90YXRvckFyZ3MuY2FsbGJhY2sgPT0gXCJmdW5jdGlvblwiKSBhbm5vdGF0b3JBcmdzLmNhbGxiYWNrKGFubm90YXRvckFyZ3MuYW5ub3RhdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQub25sb2FkZWRtZXRhZGF0YSA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuJGNvbnRhaW5lci50cmlnZ2VyKFwiT25WaWRlb1JlYWR5XCIpO1xuICAgICAgICB9O1xuICAgICAgICBpZih0aGlzLnZpZGVvRWxlbWVudC5kdXJhdGlvbiAhPSBudWxsKXtcbiAgICAgICAgICAgIC8vIElmIHRoZSBtZXRhZGF0YSBpcyBhbHJlYWR5IHByZXBhcmVkLCB0aHJvdyB0aGUgZXZlbnQgc2luY2VcbiAgICAgICAgICAgIC8vIG9ubG9hZGVkbWV0YWRhdGEgd29uJ3QgYmUgZmlyZWRcbiAgICAgICAgICAgIHRoaXMuJGNvbnRhaW5lci50cmlnZ2VyKFwiT25WaWRlb1JlYWR5XCIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIltBbm5vdGF0b3JWaWRlb1BsYXllcl0gQW5ub3RhdG9yVmlkZW9QbGF5ZXIgY3JlYXRlZCBmb3IgdmlkZW8uXCIpO1xuICAgICAgICBcbiAgICB9XG5cbiAgICBXcmFwKCl7XG4gICAgICAgIC8vIFJlbW92ZSB0aGUgZGVmYXVsdCBjb250cm9scyBmcm9tIHRoZSB2aWRlb1xuICAgICAgICB0aGlzLnZpZGVvRWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoXCJjb250cm9sc1wiKTtcblxuICAgICAgICAvLyBXcmFwIHRoZSB2aWRlbyBlbGVtZW50IHdpdGggdGhlIGNvbnRhaW5lclxuICAgICAgICB0aGlzLiRjb250YWluZXIgPSB0aGlzLiR2aWRlby53cmFwKFwiPGRpdiBjbGFzcz0nd2FsZG9yZi12aWRlby1wbGF5ZXInPjwvZGl2PlwiKS5wYXJlbnQoKTtcbiAgICAgICAgLy8gUmVzaXplIGNvbnRhaW5lciB0byBmaXQgdGhlIGRpbWVuc2lvbnMgb2YgdGhlIHZpZGVvXG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci53aWR0aCh0aGlzLiR2aWRlby53aWR0aCgpKTtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLmhlaWdodCh0aGlzLiR2aWRlby5oZWlnaHQoKSk7XG4gICAgfVxuXG4gICAgUG9wdWxhdGVDb250cm9scygpe1xuICAgICAgICB0aGlzLmNvbnRyb2xCYXIgPSBuZXcgVmlkZW9QbGF5ZXJCYXIodGhpcyk7XG4gICAgfVxuXG4gICAgU2V0VmlzaWJsZShpc1Zpc2libGUsIGR1cmF0aW9uID0gMCl7XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci50cmlnZ2VyKFwiT25WaXNpYmlsaXR5Q2hhbmdlXCIsIFtpc1Zpc2libGUsIGR1cmF0aW9uXSk7XG4gICAgfVxuXG4gICAgSG9va1VwRXZlbnRzKCl7XG4gICAgICAgIFxuICAgIH1cblxuICAgIFRvZ2dsZVBsYXlTdGF0ZSgpe1xuICAgICAgICBpZih0aGlzLnZpZGVvRWxlbWVudC5wYXVzZWQpe1xuICAgICAgICAgICAgdGhpcy5QbGF5KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLlBhdXNlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBTdGVwRm9yd2FyZCgpe1xuICAgICAgICB2YXIgbmV3VGltZSA9IHRoaXMudmlkZW9FbGVtZW50LmN1cnJlbnRUaW1lICsgMC4xO1xuICAgICAgICB0aGlzLnZpZGVvRWxlbWVudC5jdXJyZW50VGltZSA9IG5ld1RpbWUgPiB0aGlzLnZpZGVvRWxlbWVudC5kdXJhdGlvbiA/IHRoaXMudmlkZW9FbGVtZW50LmR1cmF0aW9uIDogbmV3VGltZTtcbiAgICB9XG5cbiAgICBKdW1wRm9yd2FyZCgpe1xuICAgICAgICB2YXIgbmV3VGltZSA9IHRoaXMudmlkZW9FbGVtZW50LmN1cnJlbnRUaW1lICsgMTtcbiAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQuY3VycmVudFRpbWUgPSBuZXdUaW1lID4gdGhpcy52aWRlb0VsZW1lbnQuZHVyYXRpb24gPyB0aGlzLnZpZGVvRWxlbWVudC5kdXJhdGlvbiA6IG5ld1RpbWU7XG4gICAgfSAgXG4gICAgXG4gICAgU3RlcEJhY2t3YXJkKCl7XG4gICAgICAgIHZhciBuZXdUaW1lID0gdGhpcy52aWRlb0VsZW1lbnQuY3VycmVudFRpbWUgLSAwLjE7XG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50LmN1cnJlbnRUaW1lID0gbmV3VGltZSA8IDAgPyAwIDogbmV3VGltZTtcbiAgICB9XG5cbiAgICBKdW1wQmFja3dhcmQoKXtcbiAgICAgICAgdmFyIG5ld1RpbWUgPSB0aGlzLnZpZGVvRWxlbWVudC5jdXJyZW50VGltZSAtIDE7XG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50LmN1cnJlbnRUaW1lID0gbmV3VGltZSA8IDAgPyAwIDogbmV3VGltZTtcbiAgICB9ICAgICBcblxuICAgIFBsYXkoKXtcbiAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQucGxheSgpO1xuICAgICAgICBpZih0aGlzLmVuZFRpbWUpIHRoaXMuZW5kVGltZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLlNldEF1dG9GYWRlKHRydWUpO1xuICAgICAgICB0aGlzLiRjb250YWluZXIudHJpZ2dlcihcIk9uUGxheVN0YXRlQ2hhbmdlXCIsICF0aGlzLnZpZGVvRWxlbWVudC5wYXVzZWQpO1xuICAgIH1cblxuICAgIFBhdXNlKCl7XG4gICAgICAgIGlmKHRoaXMuZW5kVGltZSkgdGhpcy5lbmRUaW1lID0gZmFsc2U7XG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50LnBhdXNlKCk7XG4gICAgICAgIHRoaXMuU2V0QXV0b0ZhZGUoZmFsc2UpO1xuICAgICAgICB0aGlzLiRjb250YWluZXIudHJpZ2dlcihcIk9uUGxheVN0YXRlQ2hhbmdlXCIsICF0aGlzLnZpZGVvRWxlbWVudC5wYXVzZWQpO1xuICAgIH1cblxuICAgIFRvZ2dsZU11dGVTdGF0ZSgpe1xuICAgICAgICBsZXQgbXV0ZWQgPSB0aGlzLnZpZGVvRWxlbWVudC5tdXRlZDtcbiAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQubXV0ZWQgPSAhbXV0ZWQ7XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci50cmlnZ2VyKFwiT25NdXRlU3RhdGVDaGFuZ2VcIiwgbXV0ZWQpO1xuICAgIH1cblxuICAgIFNldFZvbHVtZSh2b2x1bWUpe1xuICAgICAgICB0aGlzLnZpZGVvRWxlbWVudC52b2x1bWUgPSB2b2x1bWU7XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci50cmlnZ2VyKFwiT25Wb2x1bWVDaGFuZ2VcIiwgdm9sdW1lKTtcbiAgICB9XG5cbiAgICBUb2dnbGVGdWxsc2NyZWVuKCl7XG4gICAgICAgIGlmIChzY3JlZW5mdWxsID09PSAndW5kZWZpbmVkJyB8fCAhc2NyZWVuZnVsbC5lbmFibGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2NyZWVuZnVsbC50b2dnbGUodGhpcy4kY29udGFpbmVyWzBdKTtcbiAgICB9XG5cbiAgICBPbkZ1bGxzY3JlZW5DaGFuZ2UoKXtcbiAgICAgICAgaWYoc2NyZWVuZnVsbC5pc0Z1bGxzY3JlZW4pe1xuICAgICAgICAgICAgdGhpcy4kY29udGFpbmVyLmFkZENsYXNzKFwid2FsZG9yZi1mdWxsc2NyZWVuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICB0aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoXCJ3YWxkb3JmLWZ1bGxzY3JlZW5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBTZXRGdWxsc2NyZWVuKGZ1bGxzY3JlZW4pe1xuICAgICAgICBpZiAoc2NyZWVuZnVsbCA9PT0gJ3VuZGVmaW5lZCcgfHwgIXNjcmVlbmZ1bGwuZW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZnVsbHNjcmVlbil7XG4gICAgICAgICAgICBzY3JlZW5mdWxsLnJlcXVlc3QodGhpcy4kY29udGFpbmVyWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNjcmVlbmZ1bGwuZXhpdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gdGhlIG1vdXNlIG1vdmVzIGluIHRoZSB2aWRlbyBjb250YWluZXIuXG4gICAgICovXG4gICAgT25Nb3VzZU1vdmUoKXtcbiAgICAgICAgLy8gUmVzZXQgdGhlIHRpbWVyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLm1vdXNlVGltZXIpO1xuICAgICAgICB0aGlzLm1vdXNlVGltZXIgPSAwO1xuXG4gICAgICAgIC8vIFJlc3RhcnQgZmFkaW5nIGlmIGFsbG93ZWQgdG9cbiAgICAgICAgaWYodGhpcy5hbGxvd0F1dG9GYWRlKXtcbiAgICAgICAgICAgICB0aGlzLlJlc3RhcnRGYWRpbmcoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIE9uVGltZVVwZGF0ZSh0aW1lKXtcbiAgICAgICAgaWYodGhpcy5lbmRUaW1lICYmIHRoaXMuZW5kVGltZSA8PSB0aGlzLnZpZGVvRWxlbWVudC5jdXJyZW50VGltZSl7XG4gICAgICAgICAgICB0aGlzLlBhdXNlKCk7ICAgXG4gICAgICAgICAgICB0aGlzLmVuZFRpbWUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRjb250YWluZXIudHJpZ2dlcihcIk9uVGltZVVwZGF0ZVwiLCB0aW1lKTtcbiAgICB9XG5cbiAgICBSZXN0YXJ0RmFkaW5nKCl7XG4gICAgICAgIC8vIFJlc3RvcmUgdmlzaWJpbGl0eVxuICAgICAgICB0aGlzLlNldFZpc2libGUodHJ1ZSwgdGhpcy5mYWRlRHVyYXRpb24pO1xuXG4gICAgICAgIC8vIFN0YXJ0IHRoZSB0aW1lciBvdmVyIGFnYWluXG4gICAgICAgIHRoaXMubW91c2VUaW1lciA9IHNldFRpbWVvdXQoKCk9PntcbiAgICAgICAgICAgIHRoaXMuU2V0VmlzaWJsZShmYWxzZSwgdGhpcy5mYWRlRHVyYXRpb24pO1xuICAgICAgICB9LCB0aGlzLmlkbGVTZWNvbmRzQmVmb3JlRmFkZSAqIDEwMDApO1xuICAgIH1cblxuICAgIFNldEF1dG9GYWRlKGFsbG93KSB7XG4gICAgICAgIHRoaXMuYWxsb3dBdXRvRmFkZSA9IGFsbG93O1xuICAgICAgICBcbiAgICAgICAgLy8gUmVzZXQgdGhlIG1vdXNlIHRpbWVyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLm1vdXNlVGltZXIpO1xuICAgICAgICB0aGlzLm1vdXNlVGltZXIgPSAwO1xuXG4gICAgICAgIC8vIE1ha2UgZWxlbWVudHMgdmlzaWJsZVxuICAgICAgICB0aGlzLlNldFZpc2libGUodHJ1ZSk7XG5cbiAgICAgICAgLy8gUmVzdGFydCB0aGUgZmFkaW5nIGJlaGF2aW9yIGlmIGRlc2lyZWRcbiAgICAgICAgaWYoYWxsb3cpe1xuICAgICAgICAgICAgdGhpcy5SZXN0YXJ0RmFkaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuXG4gICAgLy8gSXNQbGF5aW5nKCl7XG4gICAgLy8gICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzMxMTMzNDAxXG4gICAgLy8gICAgIHJldHVybiAhISh0aGlzLnZpZGVvRWxlbWVudC5jdXJyZW50VGltZSA+IDAgJiYgIXRoaXMudmlkZW9FbGVtZW50LnBhdXNlZCAmJiBcbiAgICAvLyAgICAgICAgICAgICAgICF0aGlzLnZpZGVvRWxlbWVudC5lbmRlZCAmJiB0aGlzLnZpZGVvRWxlbWVudC5yZWFkeVN0YXRlID4gMik7XG4gICAgLy8gfVxuXG4gICAgLy8gRnJvbSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9OYXRlb3dhbWkvN2E5NDdlOTNmMDljNDVhMTA5N2U3ODNkYzAwNTYwZTFcbiAgICBHZXRWaWRlb0RpbWVuc2lvbnMoKSB7XG4gICAgICAgIGxldCB2aWRlbyA9IHRoaXMudmlkZW9FbGVtZW50O1xuICAgICAgICAvLyBSYXRpbyBvZiB0aGUgdmlkZW8ncyBpbnRyaXNpYyBkaW1lbnNpb25zXG4gICAgICAgIGxldCB2aWRlb1JhdGlvID0gdmlkZW8udmlkZW9XaWR0aCAvIHZpZGVvLnZpZGVvSGVpZ2h0O1xuICAgICAgICAvLyBUaGUgd2lkdGggYW5kIGhlaWdodCBvZiB0aGUgdmlkZW8gZWxlbWVudFxuICAgICAgICBsZXQgd2lkdGggPSB2aWRlby5vZmZzZXRXaWR0aDtcbiAgICAgICAgbGV0IGhlaWdodCA9IHZpZGVvLm9mZnNldEhlaWdodDtcbiAgICAgICAgLy8gVGhlIHJhdGlvIG9mIHRoZSBlbGVtZW50J3Mgd2lkdGggdG8gaXRzIGhlaWdodFxuICAgICAgICBsZXQgZWxlbWVudFJhdGlvID0gd2lkdGggLyBoZWlnaHQ7XG4gICAgICAgIC8vIElmIHRoZSB2aWRlbyBlbGVtZW50IGlzIHNob3J0IGFuZCB3aWRlXG4gICAgICAgIGlmKGVsZW1lbnRSYXRpbyA+IHZpZGVvUmF0aW8pIHdpZHRoID0gaGVpZ2h0ICogdmlkZW9SYXRpbztcbiAgICAgICAgLy8gSXQgbXVzdCBiZSB0YWxsIGFuZCB0aGluLCBvciBleGFjdGx5IGVxdWFsIHRvIHRoZSBvcmlnaW5hbCByYXRpb1xuICAgICAgICBlbHNlIGhlaWdodCA9IHdpZHRoIC8gdmlkZW9SYXRpbztcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgfTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IHsgQW5ub3RhdG9yVmlkZW9QbGF5ZXIgfTsiLCIndXNlIHN0cmljdCdcblxuZXhwb3J0cy5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuZXhwb3J0cy50b0J5dGVBcnJheSA9IHRvQnl0ZUFycmF5XG5leHBvcnRzLmZyb21CeXRlQXJyYXkgPSBmcm9tQnl0ZUFycmF5XG5cbnZhciBsb29rdXAgPSBbXVxudmFyIHJldkxvb2t1cCA9IFtdXG52YXIgQXJyID0gdHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnID8gVWludDhBcnJheSA6IEFycmF5XG5cbnZhciBjb2RlID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nXG5mb3IgKHZhciBpID0gMCwgbGVuID0gY29kZS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICBsb29rdXBbaV0gPSBjb2RlW2ldXG4gIHJldkxvb2t1cFtjb2RlLmNoYXJDb2RlQXQoaSldID0gaVxufVxuXG4vLyBTdXBwb3J0IGRlY29kaW5nIFVSTC1zYWZlIGJhc2U2NCBzdHJpbmdzLCBhcyBOb2RlLmpzIGRvZXMuXG4vLyBTZWU6IGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Jhc2U2NCNVUkxfYXBwbGljYXRpb25zXG5yZXZMb29rdXBbJy0nLmNoYXJDb2RlQXQoMCldID0gNjJcbnJldkxvb2t1cFsnXycuY2hhckNvZGVBdCgwKV0gPSA2M1xuXG5mdW5jdGlvbiBnZXRMZW5zIChiNjQpIHtcbiAgdmFyIGxlbiA9IGI2NC5sZW5ndGhcblxuICBpZiAobGVuICUgNCA+IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuICB9XG5cbiAgLy8gVHJpbSBvZmYgZXh0cmEgYnl0ZXMgYWZ0ZXIgcGxhY2Vob2xkZXIgYnl0ZXMgYXJlIGZvdW5kXG4gIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2JlYXRnYW1taXQvYmFzZTY0LWpzL2lzc3Vlcy80MlxuICB2YXIgdmFsaWRMZW4gPSBiNjQuaW5kZXhPZignPScpXG4gIGlmICh2YWxpZExlbiA9PT0gLTEpIHZhbGlkTGVuID0gbGVuXG5cbiAgdmFyIHBsYWNlSG9sZGVyc0xlbiA9IHZhbGlkTGVuID09PSBsZW5cbiAgICA/IDBcbiAgICA6IDQgLSAodmFsaWRMZW4gJSA0KVxuXG4gIHJldHVybiBbdmFsaWRMZW4sIHBsYWNlSG9sZGVyc0xlbl1cbn1cblxuLy8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChiNjQpIHtcbiAgdmFyIGxlbnMgPSBnZXRMZW5zKGI2NClcbiAgdmFyIHZhbGlkTGVuID0gbGVuc1swXVxuICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gbGVuc1sxXVxuICByZXR1cm4gKCh2YWxpZExlbiArIHBsYWNlSG9sZGVyc0xlbikgKiAzIC8gNCkgLSBwbGFjZUhvbGRlcnNMZW5cbn1cblxuZnVuY3Rpb24gX2J5dGVMZW5ndGggKGI2NCwgdmFsaWRMZW4sIHBsYWNlSG9sZGVyc0xlbikge1xuICByZXR1cm4gKCh2YWxpZExlbiArIHBsYWNlSG9sZGVyc0xlbikgKiAzIC8gNCkgLSBwbGFjZUhvbGRlcnNMZW5cbn1cblxuZnVuY3Rpb24gdG9CeXRlQXJyYXkgKGI2NCkge1xuICB2YXIgdG1wXG4gIHZhciBsZW5zID0gZ2V0TGVucyhiNjQpXG4gIHZhciB2YWxpZExlbiA9IGxlbnNbMF1cbiAgdmFyIHBsYWNlSG9sZGVyc0xlbiA9IGxlbnNbMV1cblxuICB2YXIgYXJyID0gbmV3IEFycihfYnl0ZUxlbmd0aChiNjQsIHZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW4pKVxuXG4gIHZhciBjdXJCeXRlID0gMFxuXG4gIC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcbiAgdmFyIGxlbiA9IHBsYWNlSG9sZGVyc0xlbiA+IDBcbiAgICA/IHZhbGlkTGVuIC0gNFxuICAgIDogdmFsaWRMZW5cblxuICB2YXIgaVxuICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpICs9IDQpIHtcbiAgICB0bXAgPVxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMTgpIHxcbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA8PCAxMikgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMildIDw8IDYpIHxcbiAgICAgIHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMyldXG4gICAgYXJyW2N1ckJ5dGUrK10gPSAodG1wID4+IDE2KSAmIDB4RkZcbiAgICBhcnJbY3VyQnl0ZSsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICBpZiAocGxhY2VIb2xkZXJzTGVuID09PSAyKSB7XG4gICAgdG1wID1cbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDIpIHxcbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA+PiA0KVxuICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgaWYgKHBsYWNlSG9sZGVyc0xlbiA9PT0gMSkge1xuICAgIHRtcCA9XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxMCkgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDQpIHxcbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA+PiAyKVxuICAgIGFycltjdXJCeXRlKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBhcnJcbn1cblxuZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcbiAgcmV0dXJuIGxvb2t1cFtudW0gPj4gMTggJiAweDNGXSArXG4gICAgbG9va3VwW251bSA+PiAxMiAmIDB4M0ZdICtcbiAgICBsb29rdXBbbnVtID4+IDYgJiAweDNGXSArXG4gICAgbG9va3VwW251bSAmIDB4M0ZdXG59XG5cbmZ1bmN0aW9uIGVuY29kZUNodW5rICh1aW50OCwgc3RhcnQsIGVuZCkge1xuICB2YXIgdG1wXG4gIHZhciBvdXRwdXQgPSBbXVxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkgKz0gMykge1xuICAgIHRtcCA9XG4gICAgICAoKHVpbnQ4W2ldIDw8IDE2KSAmIDB4RkYwMDAwKSArXG4gICAgICAoKHVpbnQ4W2kgKyAxXSA8PCA4KSAmIDB4RkYwMCkgK1xuICAgICAgKHVpbnQ4W2kgKyAyXSAmIDB4RkYpXG4gICAgb3V0cHV0LnB1c2godHJpcGxldFRvQmFzZTY0KHRtcCkpXG4gIH1cbiAgcmV0dXJuIG91dHB1dC5qb2luKCcnKVxufVxuXG5mdW5jdGlvbiBmcm9tQnl0ZUFycmF5ICh1aW50OCkge1xuICB2YXIgdG1wXG4gIHZhciBsZW4gPSB1aW50OC5sZW5ndGhcbiAgdmFyIGV4dHJhQnl0ZXMgPSBsZW4gJSAzIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG4gIHZhciBwYXJ0cyA9IFtdXG4gIHZhciBtYXhDaHVua0xlbmd0aCA9IDE2MzgzIC8vIG11c3QgYmUgbXVsdGlwbGUgb2YgM1xuXG4gIC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcbiAgZm9yICh2YXIgaSA9IDAsIGxlbjIgPSBsZW4gLSBleHRyYUJ5dGVzOyBpIDwgbGVuMjsgaSArPSBtYXhDaHVua0xlbmd0aCkge1xuICAgIHBhcnRzLnB1c2goZW5jb2RlQ2h1bmsoXG4gICAgICB1aW50OCwgaSwgKGkgKyBtYXhDaHVua0xlbmd0aCkgPiBsZW4yID8gbGVuMiA6IChpICsgbWF4Q2h1bmtMZW5ndGgpXG4gICAgKSlcbiAgfVxuXG4gIC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcbiAgaWYgKGV4dHJhQnl0ZXMgPT09IDEpIHtcbiAgICB0bXAgPSB1aW50OFtsZW4gLSAxXVxuICAgIHBhcnRzLnB1c2goXG4gICAgICBsb29rdXBbdG1wID4+IDJdICtcbiAgICAgIGxvb2t1cFsodG1wIDw8IDQpICYgMHgzRl0gK1xuICAgICAgJz09J1xuICAgIClcbiAgfSBlbHNlIGlmIChleHRyYUJ5dGVzID09PSAyKSB7XG4gICAgdG1wID0gKHVpbnQ4W2xlbiAtIDJdIDw8IDgpICsgdWludDhbbGVuIC0gMV1cbiAgICBwYXJ0cy5wdXNoKFxuICAgICAgbG9va3VwW3RtcCA+PiAxMF0gK1xuICAgICAgbG9va3VwWyh0bXAgPj4gNCkgJiAweDNGXSArXG4gICAgICBsb29rdXBbKHRtcCA8PCAyKSAmIDB4M0ZdICtcbiAgICAgICc9J1xuICAgIClcbiAgfVxuXG4gIHJldHVybiBwYXJ0cy5qb2luKCcnKVxufVxuIiwiLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8aHR0cHM6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXG4ndXNlIHN0cmljdCdcblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gU2xvd0J1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5cbnZhciBLX01BWF9MRU5HVEggPSAweDdmZmZmZmZmXG5leHBvcnRzLmtNYXhMZW5ndGggPSBLX01BWF9MRU5HVEhcblxuLyoqXG4gKiBJZiBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgUHJpbnQgd2FybmluZyBhbmQgcmVjb21tZW5kIHVzaW5nIGBidWZmZXJgIHY0Lnggd2hpY2ggaGFzIGFuIE9iamVjdFxuICogICAgICAgICAgICAgICBpbXBsZW1lbnRhdGlvbiAobW9zdCBjb21wYXRpYmxlLCBldmVuIElFNilcbiAqXG4gKiBCcm93c2VycyB0aGF0IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssXG4gKiBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gKlxuICogV2UgcmVwb3J0IHRoYXQgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0eXBlZCBhcnJheXMgaWYgdGhlIGFyZSBub3Qgc3ViY2xhc3NhYmxlXG4gKiB1c2luZyBfX3Byb3RvX18uIEZpcmVmb3ggNC0yOSBsYWNrcyBzdXBwb3J0IGZvciBhZGRpbmcgbmV3IHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgXG4gKiAoU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzgpLiBJRSAxMCBsYWNrcyBzdXBwb3J0XG4gKiBmb3IgX19wcm90b19fIGFuZCBoYXMgYSBidWdneSB0eXBlZCBhcnJheSBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSB0eXBlZEFycmF5U3VwcG9ydCgpXG5cbmlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgY29uc29sZS5lcnJvcihcbiAgICAnVGhpcyBicm93c2VyIGxhY2tzIHR5cGVkIGFycmF5IChVaW50OEFycmF5KSBzdXBwb3J0IHdoaWNoIGlzIHJlcXVpcmVkIGJ5ICcgK1xuICAgICdgYnVmZmVyYCB2NS54LiBVc2UgYGJ1ZmZlcmAgdjQueCBpZiB5b3UgcmVxdWlyZSBvbGQgYnJvd3NlciBzdXBwb3J0LidcbiAgKVxufVxuXG5mdW5jdGlvbiB0eXBlZEFycmF5U3VwcG9ydCAoKSB7XG4gIC8vIENhbiB0eXBlZCBhcnJheSBpbnN0YW5jZXMgY2FuIGJlIGF1Z21lbnRlZD9cbiAgdHJ5IHtcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoMSlcbiAgICBhcnIuX19wcm90b19fID0geyBfX3Byb3RvX186IFVpbnQ4QXJyYXkucHJvdG90eXBlLCBmb286IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH0gfVxuICAgIHJldHVybiBhcnIuZm9vKCkgPT09IDQyXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQnVmZmVyLnByb3RvdHlwZSwgJ3BhcmVudCcsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGhpcykpIHJldHVybiB1bmRlZmluZWRcbiAgICByZXR1cm4gdGhpcy5idWZmZXJcbiAgfVxufSlcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEJ1ZmZlci5wcm90b3R5cGUsICdvZmZzZXQnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKHRoaXMpKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgcmV0dXJuIHRoaXMuYnl0ZU9mZnNldFxuICB9XG59KVxuXG5mdW5jdGlvbiBjcmVhdGVCdWZmZXIgKGxlbmd0aCkge1xuICBpZiAobGVuZ3RoID4gS19NQVhfTEVOR1RIKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RoZSB2YWx1ZSBcIicgKyBsZW5ndGggKyAnXCIgaXMgaW52YWxpZCBmb3Igb3B0aW9uIFwic2l6ZVwiJylcbiAgfVxuICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZVxuICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkobGVuZ3RoKVxuICBidWYuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICByZXR1cm4gYnVmXG59XG5cbi8qKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBoYXZlIHRoZWlyXG4gKiBwcm90b3R5cGUgY2hhbmdlZCB0byBgQnVmZmVyLnByb3RvdHlwZWAuIEZ1cnRoZXJtb3JlLCBgQnVmZmVyYCBpcyBhIHN1YmNsYXNzIG9mXG4gKiBgVWludDhBcnJheWAsIHNvIHRoZSByZXR1cm5lZCBpbnN0YW5jZXMgd2lsbCBoYXZlIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBtZXRob2RzXG4gKiBhbmQgdGhlIGBVaW50OEFycmF5YCBtZXRob2RzLiBTcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdFxuICogcmV0dXJucyBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBUaGUgYFVpbnQ4QXJyYXlgIHByb3RvdHlwZSByZW1haW5zIHVubW9kaWZpZWQuXG4gKi9cblxuZnVuY3Rpb24gQnVmZmVyIChhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICAvLyBDb21tb24gY2FzZS5cbiAgaWYgKHR5cGVvZiBhcmcgPT09ICdudW1iZXInKSB7XG4gICAgaWYgKHR5cGVvZiBlbmNvZGluZ09yT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgJ1RoZSBcInN0cmluZ1wiIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBzdHJpbmcuIFJlY2VpdmVkIHR5cGUgbnVtYmVyJ1xuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gYWxsb2NVbnNhZmUoYXJnKVxuICB9XG4gIHJldHVybiBmcm9tKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG4vLyBGaXggc3ViYXJyYXkoKSBpbiBFUzIwMTYuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvcHVsbC85N1xuaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC5zcGVjaWVzICE9IG51bGwgJiZcbiAgICBCdWZmZXJbU3ltYm9sLnNwZWNpZXNdID09PSBCdWZmZXIpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEJ1ZmZlciwgU3ltYm9sLnNwZWNpZXMsIHtcbiAgICB2YWx1ZTogbnVsbCxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgd3JpdGFibGU6IGZhbHNlXG4gIH0pXG59XG5cbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTIgLy8gbm90IHVzZWQgYnkgdGhpcyBpbXBsZW1lbnRhdGlvblxuXG5mdW5jdGlvbiBmcm9tICh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZyb21TdHJpbmcodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQpXG4gIH1cblxuICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHZhbHVlKSkge1xuICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKHZhbHVlKVxuICB9XG5cbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIGZpcnN0IGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgc3RyaW5nLCBCdWZmZXIsIEFycmF5QnVmZmVyLCBBcnJheSwgJyArXG4gICAgICAnb3IgQXJyYXktbGlrZSBPYmplY3QuIFJlY2VpdmVkIHR5cGUgJyArICh0eXBlb2YgdmFsdWUpXG4gICAgKVxuICB9XG5cbiAgaWYgKGlzSW5zdGFuY2UodmFsdWUsIEFycmF5QnVmZmVyKSB8fFxuICAgICAgKHZhbHVlICYmIGlzSW5zdGFuY2UodmFsdWUuYnVmZmVyLCBBcnJheUJ1ZmZlcikpKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheUJ1ZmZlcih2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBcInZhbHVlXCIgYXJndW1lbnQgbXVzdCBub3QgYmUgb2YgdHlwZSBudW1iZXIuIFJlY2VpdmVkIHR5cGUgbnVtYmVyJ1xuICAgIClcbiAgfVxuXG4gIHZhciB2YWx1ZU9mID0gdmFsdWUudmFsdWVPZiAmJiB2YWx1ZS52YWx1ZU9mKClcbiAgaWYgKHZhbHVlT2YgIT0gbnVsbCAmJiB2YWx1ZU9mICE9PSB2YWx1ZSkge1xuICAgIHJldHVybiBCdWZmZXIuZnJvbSh2YWx1ZU9mLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICB2YXIgYiA9IGZyb21PYmplY3QodmFsdWUpXG4gIGlmIChiKSByZXR1cm4gYlxuXG4gIGlmICh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9QcmltaXRpdmUgIT0gbnVsbCAmJlxuICAgICAgdHlwZW9mIHZhbHVlW1N5bWJvbC50b1ByaW1pdGl2ZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gQnVmZmVyLmZyb20oXG4gICAgICB2YWx1ZVtTeW1ib2wudG9QcmltaXRpdmVdKCdzdHJpbmcnKSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoXG4gICAgKVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAnVGhlIGZpcnN0IGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgc3RyaW5nLCBCdWZmZXIsIEFycmF5QnVmZmVyLCBBcnJheSwgJyArXG4gICAgJ29yIEFycmF5LWxpa2UgT2JqZWN0LiBSZWNlaXZlZCB0eXBlICcgKyAodHlwZW9mIHZhbHVlKVxuICApXG59XG5cbi8qKlxuICogRnVuY3Rpb25hbGx5IGVxdWl2YWxlbnQgdG8gQnVmZmVyKGFyZywgZW5jb2RpbmcpIGJ1dCB0aHJvd3MgYSBUeXBlRXJyb3JcbiAqIGlmIHZhbHVlIGlzIGEgbnVtYmVyLlxuICogQnVmZmVyLmZyb20oc3RyWywgZW5jb2RpbmddKVxuICogQnVmZmVyLmZyb20oYXJyYXkpXG4gKiBCdWZmZXIuZnJvbShidWZmZXIpXG4gKiBCdWZmZXIuZnJvbShhcnJheUJ1ZmZlclssIGJ5dGVPZmZzZXRbLCBsZW5ndGhdXSlcbiAqKi9cbkJ1ZmZlci5mcm9tID0gZnVuY3Rpb24gKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGZyb20odmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuLy8gTm90ZTogQ2hhbmdlIHByb3RvdHlwZSAqYWZ0ZXIqIEJ1ZmZlci5mcm9tIGlzIGRlZmluZWQgdG8gd29ya2Fyb3VuZCBDaHJvbWUgYnVnOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvcHVsbC8xNDhcbkJ1ZmZlci5wcm90b3R5cGUuX19wcm90b19fID0gVWludDhBcnJheS5wcm90b3R5cGVcbkJ1ZmZlci5fX3Byb3RvX18gPSBVaW50OEFycmF5XG5cbmZ1bmN0aW9uIGFzc2VydFNpemUgKHNpemUpIHtcbiAgaWYgKHR5cGVvZiBzaXplICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wic2l6ZVwiIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBudW1iZXInKVxuICB9IGVsc2UgaWYgKHNpemUgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RoZSB2YWx1ZSBcIicgKyBzaXplICsgJ1wiIGlzIGludmFsaWQgZm9yIG9wdGlvbiBcInNpemVcIicpXG4gIH1cbn1cblxuZnVuY3Rpb24gYWxsb2MgKHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIGFzc2VydFNpemUoc2l6ZSlcbiAgaWYgKHNpemUgPD0gMCkge1xuICAgIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSlcbiAgfVxuICBpZiAoZmlsbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gT25seSBwYXkgYXR0ZW50aW9uIHRvIGVuY29kaW5nIGlmIGl0J3MgYSBzdHJpbmcuIFRoaXNcbiAgICAvLyBwcmV2ZW50cyBhY2NpZGVudGFsbHkgc2VuZGluZyBpbiBhIG51bWJlciB0aGF0IHdvdWxkXG4gICAgLy8gYmUgaW50ZXJwcmV0dGVkIGFzIGEgc3RhcnQgb2Zmc2V0LlxuICAgIHJldHVybiB0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnXG4gICAgICA/IGNyZWF0ZUJ1ZmZlcihzaXplKS5maWxsKGZpbGwsIGVuY29kaW5nKVxuICAgICAgOiBjcmVhdGVCdWZmZXIoc2l6ZSkuZmlsbChmaWxsKVxuICB9XG4gIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSlcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiBhbGxvYyhzaXplWywgZmlsbFssIGVuY29kaW5nXV0pXG4gKiovXG5CdWZmZXIuYWxsb2MgPSBmdW5jdGlvbiAoc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGFsbG9jKHNpemUsIGZpbGwsIGVuY29kaW5nKVxufVxuXG5mdW5jdGlvbiBhbGxvY1Vuc2FmZSAoc2l6ZSkge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSA8IDAgPyAwIDogY2hlY2tlZChzaXplKSB8IDApXG59XG5cbi8qKlxuICogRXF1aXZhbGVudCB0byBCdWZmZXIobnVtKSwgYnkgZGVmYXVsdCBjcmVhdGVzIGEgbm9uLXplcm8tZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqICovXG5CdWZmZXIuYWxsb2NVbnNhZmUgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUoc2l6ZSlcbn1cbi8qKlxuICogRXF1aXZhbGVudCB0byBTbG93QnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKi9cbkJ1ZmZlci5hbGxvY1Vuc2FmZVNsb3cgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUoc2l6ZSlcbn1cblxuZnVuY3Rpb24gZnJvbVN0cmluZyAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAodHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJyB8fCBlbmNvZGluZyA9PT0gJycpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICB9XG5cbiAgaWYgKCFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gIH1cblxuICB2YXIgbGVuZ3RoID0gYnl0ZUxlbmd0aChzdHJpbmcsIGVuY29kaW5nKSB8IDBcbiAgdmFyIGJ1ZiA9IGNyZWF0ZUJ1ZmZlcihsZW5ndGgpXG5cbiAgdmFyIGFjdHVhbCA9IGJ1Zi53cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuXG4gIGlmIChhY3R1YWwgIT09IGxlbmd0aCkge1xuICAgIC8vIFdyaXRpbmcgYSBoZXggc3RyaW5nLCBmb3IgZXhhbXBsZSwgdGhhdCBjb250YWlucyBpbnZhbGlkIGNoYXJhY3RlcnMgd2lsbFxuICAgIC8vIGNhdXNlIGV2ZXJ5dGhpbmcgYWZ0ZXIgdGhlIGZpcnN0IGludmFsaWQgY2hhcmFjdGVyIHRvIGJlIGlnbm9yZWQuIChlLmcuXG4gICAgLy8gJ2FieHhjZCcgd2lsbCBiZSB0cmVhdGVkIGFzICdhYicpXG4gICAgYnVmID0gYnVmLnNsaWNlKDAsIGFjdHVhbClcbiAgfVxuXG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5TGlrZSAoYXJyYXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aCA8IDAgPyAwIDogY2hlY2tlZChhcnJheS5sZW5ndGgpIHwgMFxuICB2YXIgYnVmID0gY3JlYXRlQnVmZmVyKGxlbmd0aClcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIGJ1ZltpXSA9IGFycmF5W2ldICYgMjU1XG4gIH1cbiAgcmV0dXJuIGJ1ZlxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXlCdWZmZXIgKGFycmF5LCBieXRlT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKGJ5dGVPZmZzZXQgPCAwIHx8IGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1wib2Zmc2V0XCIgaXMgb3V0c2lkZSBvZiBidWZmZXIgYm91bmRzJylcbiAgfVxuXG4gIGlmIChhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCArIChsZW5ndGggfHwgMCkpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJsZW5ndGhcIiBpcyBvdXRzaWRlIG9mIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgdmFyIGJ1ZlxuICBpZiAoYnl0ZU9mZnNldCA9PT0gdW5kZWZpbmVkICYmIGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXkpXG4gIH0gZWxzZSBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBidWYgPSBuZXcgVWludDhBcnJheShhcnJheSwgYnl0ZU9mZnNldClcbiAgfSBlbHNlIHtcbiAgICBidWYgPSBuZXcgVWludDhBcnJheShhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgYnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgcmV0dXJuIGJ1ZlxufVxuXG5mdW5jdGlvbiBmcm9tT2JqZWN0IChvYmopIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihvYmopKSB7XG4gICAgdmFyIGxlbiA9IGNoZWNrZWQob2JqLmxlbmd0aCkgfCAwXG4gICAgdmFyIGJ1ZiA9IGNyZWF0ZUJ1ZmZlcihsZW4pXG5cbiAgICBpZiAoYnVmLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGJ1ZlxuICAgIH1cblxuICAgIG9iai5jb3B5KGJ1ZiwgMCwgMCwgbGVuKVxuICAgIHJldHVybiBidWZcbiAgfVxuXG4gIGlmIChvYmoubGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAodHlwZW9mIG9iai5sZW5ndGggIT09ICdudW1iZXInIHx8IG51bWJlcklzTmFOKG9iai5sZW5ndGgpKSB7XG4gICAgICByZXR1cm4gY3JlYXRlQnVmZmVyKDApXG4gICAgfVxuICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKG9iailcbiAgfVxuXG4gIGlmIChvYmoudHlwZSA9PT0gJ0J1ZmZlcicgJiYgQXJyYXkuaXNBcnJheShvYmouZGF0YSkpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5TGlrZShvYmouZGF0YSlcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja2VkIChsZW5ndGgpIHtcbiAgLy8gTm90ZTogY2Fubm90IHVzZSBgbGVuZ3RoIDwgS19NQVhfTEVOR1RIYCBoZXJlIGJlY2F1c2UgdGhhdCBmYWlscyB3aGVuXG4gIC8vIGxlbmd0aCBpcyBOYU4gKHdoaWNoIGlzIG90aGVyd2lzZSBjb2VyY2VkIHRvIHplcm8uKVxuICBpZiAobGVuZ3RoID49IEtfTUFYX0xFTkdUSCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIGFsbG9jYXRlIEJ1ZmZlciBsYXJnZXIgdGhhbiBtYXhpbXVtICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdzaXplOiAweCcgKyBLX01BWF9MRU5HVEgudG9TdHJpbmcoMTYpICsgJyBieXRlcycpXG4gIH1cbiAgcmV0dXJuIGxlbmd0aCB8IDBcbn1cblxuZnVuY3Rpb24gU2xvd0J1ZmZlciAobGVuZ3RoKSB7XG4gIGlmICgrbGVuZ3RoICE9IGxlbmd0aCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGVxZXFlcVxuICAgIGxlbmd0aCA9IDBcbiAgfVxuICByZXR1cm4gQnVmZmVyLmFsbG9jKCtsZW5ndGgpXG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIGlzQnVmZmVyIChiKSB7XG4gIHJldHVybiBiICE9IG51bGwgJiYgYi5faXNCdWZmZXIgPT09IHRydWUgJiZcbiAgICBiICE9PSBCdWZmZXIucHJvdG90eXBlIC8vIHNvIEJ1ZmZlci5pc0J1ZmZlcihCdWZmZXIucHJvdG90eXBlKSB3aWxsIGJlIGZhbHNlXG59XG5cbkJ1ZmZlci5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAoYSwgYikge1xuICBpZiAoaXNJbnN0YW5jZShhLCBVaW50OEFycmF5KSkgYSA9IEJ1ZmZlci5mcm9tKGEsIGEub2Zmc2V0LCBhLmJ5dGVMZW5ndGgpXG4gIGlmIChpc0luc3RhbmNlKGIsIFVpbnQ4QXJyYXkpKSBiID0gQnVmZmVyLmZyb20oYiwgYi5vZmZzZXQsIGIuYnl0ZUxlbmd0aClcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYSkgfHwgIUJ1ZmZlci5pc0J1ZmZlcihiKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIFwiYnVmMVwiLCBcImJ1ZjJcIiBhcmd1bWVudHMgbXVzdCBiZSBvbmUgb2YgdHlwZSBCdWZmZXIgb3IgVWludDhBcnJheSdcbiAgICApXG4gIH1cblxuICBpZiAoYSA9PT0gYikgcmV0dXJuIDBcblxuICB2YXIgeCA9IGEubGVuZ3RoXG4gIHZhciB5ID0gYi5sZW5ndGhcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gTWF0aC5taW4oeCwgeSk7IGkgPCBsZW47ICsraSkge1xuICAgIGlmIChhW2ldICE9PSBiW2ldKSB7XG4gICAgICB4ID0gYVtpXVxuICAgICAgeSA9IGJbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIGlzRW5jb2RpbmcgKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gY29uY2F0IChsaXN0LCBsZW5ndGgpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3QpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgfVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBCdWZmZXIuYWxsb2MoMClcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGxlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgbGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZmZlciA9IEJ1ZmZlci5hbGxvY1Vuc2FmZShsZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGJ1ZiA9IGxpc3RbaV1cbiAgICBpZiAoaXNJbnN0YW5jZShidWYsIFVpbnQ4QXJyYXkpKSB7XG4gICAgICBidWYgPSBCdWZmZXIuZnJvbShidWYpXG4gICAgfVxuICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gICAgfVxuICAgIGJ1Zi5jb3B5KGJ1ZmZlciwgcG9zKVxuICAgIHBvcyArPSBidWYubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZmZlclxufVxuXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChzdHJpbmcsIGVuY29kaW5nKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIoc3RyaW5nKSkge1xuICAgIHJldHVybiBzdHJpbmcubGVuZ3RoXG4gIH1cbiAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhzdHJpbmcpIHx8IGlzSW5zdGFuY2Uoc3RyaW5nLCBBcnJheUJ1ZmZlcikpIHtcbiAgICByZXR1cm4gc3RyaW5nLmJ5dGVMZW5ndGhcbiAgfVxuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBcInN0cmluZ1wiIGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgc3RyaW5nLCBCdWZmZXIsIG9yIEFycmF5QnVmZmVyLiAnICtcbiAgICAgICdSZWNlaXZlZCB0eXBlICcgKyB0eXBlb2Ygc3RyaW5nXG4gICAgKVxuICB9XG5cbiAgdmFyIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgdmFyIG11c3RNYXRjaCA9IChhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gPT09IHRydWUpXG4gIGlmICghbXVzdE1hdGNoICYmIGxlbiA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBVc2UgYSBmb3IgbG9vcCB0byBhdm9pZCByZWN1cnNpb25cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGVuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gbGVuICogMlxuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGxlbiA+Pj4gMVxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkge1xuICAgICAgICAgIHJldHVybiBtdXN0TWF0Y2ggPyAtMSA6IHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoIC8vIGFzc3VtZSB1dGY4XG4gICAgICAgIH1cbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuXG5mdW5jdGlvbiBzbG93VG9TdHJpbmcgKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG5cbiAgLy8gTm8gbmVlZCB0byB2ZXJpZnkgdGhhdCBcInRoaXMubGVuZ3RoIDw9IE1BWF9VSU5UMzJcIiBzaW5jZSBpdCdzIGEgcmVhZC1vbmx5XG4gIC8vIHByb3BlcnR5IG9mIGEgdHlwZWQgYXJyYXkuXG5cbiAgLy8gVGhpcyBiZWhhdmVzIG5laXRoZXIgbGlrZSBTdHJpbmcgbm9yIFVpbnQ4QXJyYXkgaW4gdGhhdCB3ZSBzZXQgc3RhcnQvZW5kXG4gIC8vIHRvIHRoZWlyIHVwcGVyL2xvd2VyIGJvdW5kcyBpZiB0aGUgdmFsdWUgcGFzc2VkIGlzIG91dCBvZiByYW5nZS5cbiAgLy8gdW5kZWZpbmVkIGlzIGhhbmRsZWQgc3BlY2lhbGx5IGFzIHBlciBFQ01BLTI2MiA2dGggRWRpdGlvbixcbiAgLy8gU2VjdGlvbiAxMy4zLjMuNyBSdW50aW1lIFNlbWFudGljczogS2V5ZWRCaW5kaW5nSW5pdGlhbGl6YXRpb24uXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkIHx8IHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIC8vIFJldHVybiBlYXJseSBpZiBzdGFydCA+IHRoaXMubGVuZ3RoLiBEb25lIGhlcmUgdG8gcHJldmVudCBwb3RlbnRpYWwgdWludDMyXG4gIC8vIGNvZXJjaW9uIGZhaWwgYmVsb3cuXG4gIGlmIChzdGFydCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoZW5kID09PSB1bmRlZmluZWQgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKGVuZCA8PSAwKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICAvLyBGb3JjZSBjb2Vyc2lvbiB0byB1aW50MzIuIFRoaXMgd2lsbCBhbHNvIGNvZXJjZSBmYWxzZXkvTmFOIHZhbHVlcyB0byAwLlxuICBlbmQgPj4+PSAwXG4gIHN0YXJ0ID4+Pj0gMFxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxhdGluMVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdXRmMTZsZVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9IChlbmNvZGluZyArICcnKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG4vLyBUaGlzIHByb3BlcnR5IGlzIHVzZWQgYnkgYEJ1ZmZlci5pc0J1ZmZlcmAgKGFuZCB0aGUgYGlzLWJ1ZmZlcmAgbnBtIHBhY2thZ2UpXG4vLyB0byBkZXRlY3QgYSBCdWZmZXIgaW5zdGFuY2UuIEl0J3Mgbm90IHBvc3NpYmxlIHRvIHVzZSBgaW5zdGFuY2VvZiBCdWZmZXJgXG4vLyByZWxpYWJseSBpbiBhIGJyb3dzZXJpZnkgY29udGV4dCBiZWNhdXNlIHRoZXJlIGNvdWxkIGJlIG11bHRpcGxlIGRpZmZlcmVudFxuLy8gY29waWVzIG9mIHRoZSAnYnVmZmVyJyBwYWNrYWdlIGluIHVzZS4gVGhpcyBtZXRob2Qgd29ya3MgZXZlbiBmb3IgQnVmZmVyXG4vLyBpbnN0YW5jZXMgdGhhdCB3ZXJlIGNyZWF0ZWQgZnJvbSBhbm90aGVyIGNvcHkgb2YgdGhlIGBidWZmZXJgIHBhY2thZ2UuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL2lzc3Vlcy8xNTRcbkJ1ZmZlci5wcm90b3R5cGUuX2lzQnVmZmVyID0gdHJ1ZVxuXG5mdW5jdGlvbiBzd2FwIChiLCBuLCBtKSB7XG4gIHZhciBpID0gYltuXVxuICBiW25dID0gYlttXVxuICBiW21dID0gaVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXAxNiA9IGZ1bmN0aW9uIHN3YXAxNiAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgMiAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMTYtYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDEpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMzIgPSBmdW5jdGlvbiBzd2FwMzIgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDQgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDMyLWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDQpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAzKVxuICAgIHN3YXAodGhpcywgaSArIDEsIGkgKyAyKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDY0ID0gZnVuY3Rpb24gc3dhcDY0ICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA4ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA2NC1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSA4KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgNylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgNilcbiAgICBzd2FwKHRoaXMsIGkgKyAyLCBpICsgNSlcbiAgICBzd2FwKHRoaXMsIGkgKyAzLCBpICsgNClcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKCkge1xuICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIDAsIGxlbmd0aClcbiAgcmV0dXJuIHNsb3dUb1N0cmluZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9Mb2NhbGVTdHJpbmcgPSBCdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nXG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiB0cnVlXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0ICgpIHtcbiAgdmFyIHN0ciA9ICcnXG4gIHZhciBtYXggPSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTXG4gIHN0ciA9IHRoaXMudG9TdHJpbmcoJ2hleCcsIDAsIG1heCkucmVwbGFjZSgvKC57Mn0pL2csICckMSAnKS50cmltKClcbiAgaWYgKHRoaXMubGVuZ3RoID4gbWF4KSBzdHIgKz0gJyAuLi4gJ1xuICByZXR1cm4gJzxCdWZmZXIgJyArIHN0ciArICc+J1xufVxuXG5CdWZmZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlICh0YXJnZXQsIHN0YXJ0LCBlbmQsIHRoaXNTdGFydCwgdGhpc0VuZCkge1xuICBpZiAoaXNJbnN0YW5jZSh0YXJnZXQsIFVpbnQ4QXJyYXkpKSB7XG4gICAgdGFyZ2V0ID0gQnVmZmVyLmZyb20odGFyZ2V0LCB0YXJnZXQub2Zmc2V0LCB0YXJnZXQuYnl0ZUxlbmd0aClcbiAgfVxuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0YXJnZXQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJ0YXJnZXRcIiBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIEJ1ZmZlciBvciBVaW50OEFycmF5LiAnICtcbiAgICAgICdSZWNlaXZlZCB0eXBlICcgKyAodHlwZW9mIHRhcmdldClcbiAgICApXG4gIH1cblxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuZCA9IHRhcmdldCA/IHRhcmdldC5sZW5ndGggOiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc1N0YXJ0ID0gMFxuICB9XG4gIGlmICh0aGlzRW5kID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzRW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChzdGFydCA8IDAgfHwgZW5kID4gdGFyZ2V0Lmxlbmd0aCB8fCB0aGlzU3RhcnQgPCAwIHx8IHRoaXNFbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdvdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kICYmIHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kKSB7XG4gICAgcmV0dXJuIC0xXG4gIH1cbiAgaWYgKHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAxXG4gIH1cblxuICBzdGFydCA+Pj49IDBcbiAgZW5kID4+Pj0gMFxuICB0aGlzU3RhcnQgPj4+PSAwXG4gIHRoaXNFbmQgPj4+PSAwXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCkgcmV0dXJuIDBcblxuICB2YXIgeCA9IHRoaXNFbmQgLSB0aGlzU3RhcnRcbiAgdmFyIHkgPSBlbmQgLSBzdGFydFxuICB2YXIgbGVuID0gTWF0aC5taW4oeCwgeSlcblxuICB2YXIgdGhpc0NvcHkgPSB0aGlzLnNsaWNlKHRoaXNTdGFydCwgdGhpc0VuZClcbiAgdmFyIHRhcmdldENvcHkgPSB0YXJnZXQuc2xpY2Uoc3RhcnQsIGVuZClcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKHRoaXNDb3B5W2ldICE9PSB0YXJnZXRDb3B5W2ldKSB7XG4gICAgICB4ID0gdGhpc0NvcHlbaV1cbiAgICAgIHkgPSB0YXJnZXRDb3B5W2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuLy8gRmluZHMgZWl0aGVyIHRoZSBmaXJzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPj0gYGJ5dGVPZmZzZXRgLFxuLy8gT1IgdGhlIGxhc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0IDw9IGBieXRlT2Zmc2V0YC5cbi8vXG4vLyBBcmd1bWVudHM6XG4vLyAtIGJ1ZmZlciAtIGEgQnVmZmVyIHRvIHNlYXJjaFxuLy8gLSB2YWwgLSBhIHN0cmluZywgQnVmZmVyLCBvciBudW1iZXJcbi8vIC0gYnl0ZU9mZnNldCAtIGFuIGluZGV4IGludG8gYGJ1ZmZlcmA7IHdpbGwgYmUgY2xhbXBlZCB0byBhbiBpbnQzMlxuLy8gLSBlbmNvZGluZyAtIGFuIG9wdGlvbmFsIGVuY29kaW5nLCByZWxldmFudCBpcyB2YWwgaXMgYSBzdHJpbmdcbi8vIC0gZGlyIC0gdHJ1ZSBmb3IgaW5kZXhPZiwgZmFsc2UgZm9yIGxhc3RJbmRleE9mXG5mdW5jdGlvbiBiaWRpcmVjdGlvbmFsSW5kZXhPZiAoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpIHtcbiAgLy8gRW1wdHkgYnVmZmVyIG1lYW5zIG5vIG1hdGNoXG4gIGlmIChidWZmZXIubGVuZ3RoID09PSAwKSByZXR1cm4gLTFcblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldFxuICBpZiAodHlwZW9mIGJ5dGVPZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBieXRlT2Zmc2V0XG4gICAgYnl0ZU9mZnNldCA9IDBcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0ID4gMHg3ZmZmZmZmZikge1xuICAgIGJ5dGVPZmZzZXQgPSAweDdmZmZmZmZmXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA8IC0weDgwMDAwMDAwKSB7XG4gICAgYnl0ZU9mZnNldCA9IC0weDgwMDAwMDAwXG4gIH1cbiAgYnl0ZU9mZnNldCA9ICtieXRlT2Zmc2V0IC8vIENvZXJjZSB0byBOdW1iZXIuXG4gIGlmIChudW1iZXJJc05hTihieXRlT2Zmc2V0KSkge1xuICAgIC8vIGJ5dGVPZmZzZXQ6IGl0IGl0J3MgdW5kZWZpbmVkLCBudWxsLCBOYU4sIFwiZm9vXCIsIGV0Yywgc2VhcmNoIHdob2xlIGJ1ZmZlclxuICAgIGJ5dGVPZmZzZXQgPSBkaXIgPyAwIDogKGJ1ZmZlci5sZW5ndGggLSAxKVxuICB9XG5cbiAgLy8gTm9ybWFsaXplIGJ5dGVPZmZzZXQ6IG5lZ2F0aXZlIG9mZnNldHMgc3RhcnQgZnJvbSB0aGUgZW5kIG9mIHRoZSBidWZmZXJcbiAgaWYgKGJ5dGVPZmZzZXQgPCAwKSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCArIGJ5dGVPZmZzZXRcbiAgaWYgKGJ5dGVPZmZzZXQgPj0gYnVmZmVyLmxlbmd0aCkge1xuICAgIGlmIChkaXIpIHJldHVybiAtMVxuICAgIGVsc2UgYnl0ZU9mZnNldCA9IGJ1ZmZlci5sZW5ndGggLSAxXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA8IDApIHtcbiAgICBpZiAoZGlyKSBieXRlT2Zmc2V0ID0gMFxuICAgIGVsc2UgcmV0dXJuIC0xXG4gIH1cblxuICAvLyBOb3JtYWxpemUgdmFsXG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIHZhbCA9IEJ1ZmZlci5mcm9tKHZhbCwgZW5jb2RpbmcpXG4gIH1cblxuICAvLyBGaW5hbGx5LCBzZWFyY2ggZWl0aGVyIGluZGV4T2YgKGlmIGRpciBpcyB0cnVlKSBvciBsYXN0SW5kZXhPZlxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHZhbCkpIHtcbiAgICAvLyBTcGVjaWFsIGNhc2U6IGxvb2tpbmcgZm9yIGVtcHR5IHN0cmluZy9idWZmZXIgYWx3YXlzIGZhaWxzXG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgdmFsID0gdmFsICYgMHhGRiAvLyBTZWFyY2ggZm9yIGEgYnl0ZSB2YWx1ZSBbMC0yNTVdXG4gICAgaWYgKHR5cGVvZiBVaW50OEFycmF5LnByb3RvdHlwZS5pbmRleE9mID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAoZGlyKSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUubGFzdEluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsIFsgdmFsIF0sIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2YWwgbXVzdCBiZSBzdHJpbmcsIG51bWJlciBvciBCdWZmZXInKVxufVxuXG5mdW5jdGlvbiBhcnJheUluZGV4T2YgKGFyciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIHZhciBpbmRleFNpemUgPSAxXG4gIHZhciBhcnJMZW5ndGggPSBhcnIubGVuZ3RoXG4gIHZhciB2YWxMZW5ndGggPSB2YWwubGVuZ3RoXG5cbiAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgIGlmIChlbmNvZGluZyA9PT0gJ3VjczInIHx8IGVuY29kaW5nID09PSAndWNzLTInIHx8XG4gICAgICAgIGVuY29kaW5nID09PSAndXRmMTZsZScgfHwgZW5jb2RpbmcgPT09ICd1dGYtMTZsZScpIHtcbiAgICAgIGlmIChhcnIubGVuZ3RoIDwgMiB8fCB2YWwubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH1cbiAgICAgIGluZGV4U2l6ZSA9IDJcbiAgICAgIGFyckxlbmd0aCAvPSAyXG4gICAgICB2YWxMZW5ndGggLz0gMlxuICAgICAgYnl0ZU9mZnNldCAvPSAyXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZCAoYnVmLCBpKSB7XG4gICAgaWYgKGluZGV4U2l6ZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIGJ1ZltpXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYnVmLnJlYWRVSW50MTZCRShpICogaW5kZXhTaXplKVxuICAgIH1cbiAgfVxuXG4gIHZhciBpXG4gIGlmIChkaXIpIHtcbiAgICB2YXIgZm91bmRJbmRleCA9IC0xXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA8IGFyckxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocmVhZChhcnIsIGkpID09PSByZWFkKHZhbCwgZm91bmRJbmRleCA9PT0gLTEgPyAwIDogaSAtIGZvdW5kSW5kZXgpKSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ID09PSAtMSkgZm91bmRJbmRleCA9IGlcbiAgICAgICAgaWYgKGkgLSBmb3VuZEluZGV4ICsgMSA9PT0gdmFsTGVuZ3RoKSByZXR1cm4gZm91bmRJbmRleCAqIGluZGV4U2l6ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggIT09IC0xKSBpIC09IGkgLSBmb3VuZEluZGV4XG4gICAgICAgIGZvdW5kSW5kZXggPSAtMVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoYnl0ZU9mZnNldCArIHZhbExlbmd0aCA+IGFyckxlbmd0aCkgYnl0ZU9mZnNldCA9IGFyckxlbmd0aCAtIHZhbExlbmd0aFxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgZm91bmQgPSB0cnVlXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHZhbExlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmIChyZWFkKGFyciwgaSArIGopICE9PSByZWFkKHZhbCwgaikpIHtcbiAgICAgICAgICBmb3VuZCA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZvdW5kKSByZXR1cm4gaVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluY2x1ZGVzID0gZnVuY3Rpb24gaW5jbHVkZXMgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIHRoaXMuaW5kZXhPZih2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSAhPT0gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gaW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgdHJ1ZSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uIGxhc3RJbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgcGFyc2VkID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGlmIChudW1iZXJJc05hTihwYXJzZWQpKSByZXR1cm4gaVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IHBhcnNlZFxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIHV0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGFzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gbGF0aW4xV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGJhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiB1Y3MyV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcpXG4gIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgb2Zmc2V0WywgbGVuZ3RoXVssIGVuY29kaW5nXSlcbiAgfSBlbHNlIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gICAgaWYgKGlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGxlbmd0aCA9IGxlbmd0aCA+Pj4gMFxuICAgICAgaWYgKGVuY29kaW5nID09PSB1bmRlZmluZWQpIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgfSBlbHNlIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ0J1ZmZlci53cml0ZShzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXRbLCBsZW5ndGhdKSBpcyBubyBsb25nZXIgc3VwcG9ydGVkJ1xuICAgIClcbiAgfVxuXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgfHwgbGVuZ3RoID4gcmVtYWluaW5nKSBsZW5ndGggPSByZW1haW5pbmdcblxuICBpZiAoKHN0cmluZy5sZW5ndGggPiAwICYmIChsZW5ndGggPCAwIHx8IG9mZnNldCA8IDApKSB8fCBvZmZzZXQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIHdyaXRlIG91dHNpZGUgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxhdGluMVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIC8vIFdhcm5pbmc6IG1heExlbmd0aCBub3QgdGFrZW4gaW50byBhY2NvdW50IGluIGJhc2U2NFdyaXRlXG4gICAgICAgIHJldHVybiBiYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdWNzMldyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuZnVuY3Rpb24gYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIHV0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcbiAgdmFyIHJlcyA9IFtdXG5cbiAgdmFyIGkgPSBzdGFydFxuICB3aGlsZSAoaSA8IGVuZCkge1xuICAgIHZhciBmaXJzdEJ5dGUgPSBidWZbaV1cbiAgICB2YXIgY29kZVBvaW50ID0gbnVsbFxuICAgIHZhciBieXRlc1BlclNlcXVlbmNlID0gKGZpcnN0Qnl0ZSA+IDB4RUYpID8gNFxuICAgICAgOiAoZmlyc3RCeXRlID4gMHhERikgPyAzXG4gICAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4QkYpID8gMlxuICAgICAgICAgIDogMVxuXG4gICAgaWYgKGkgKyBieXRlc1BlclNlcXVlbmNlIDw9IGVuZCkge1xuICAgICAgdmFyIHNlY29uZEJ5dGUsIHRoaXJkQnl0ZSwgZm91cnRoQnl0ZSwgdGVtcENvZGVQb2ludFxuXG4gICAgICBzd2l0Y2ggKGJ5dGVzUGVyU2VxdWVuY2UpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGlmIChmaXJzdEJ5dGUgPCAweDgwKSB7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPSBmaXJzdEJ5dGVcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHgxRikgPDwgMHg2IHwgKHNlY29uZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4QyB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKHRoaXJkQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0ZGICYmICh0ZW1wQ29kZVBvaW50IDwgMHhEODAwIHx8IHRlbXBDb2RlUG9pbnQgPiAweERGRkYpKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGZvdXJ0aEJ5dGUgPSBidWZbaSArIDNdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwICYmIChmb3VydGhCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweDEyIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweEMgfCAodGhpcmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKGZvdXJ0aEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweEZGRkYgJiYgdGVtcENvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvZGVQb2ludCA9PT0gbnVsbCkge1xuICAgICAgLy8gd2UgZGlkIG5vdCBnZW5lcmF0ZSBhIHZhbGlkIGNvZGVQb2ludCBzbyBpbnNlcnQgYVxuICAgICAgLy8gcmVwbGFjZW1lbnQgY2hhciAoVStGRkZEKSBhbmQgYWR2YW5jZSBvbmx5IDEgYnl0ZVxuICAgICAgY29kZVBvaW50ID0gMHhGRkZEXG4gICAgICBieXRlc1BlclNlcXVlbmNlID0gMVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50ID4gMHhGRkZGKSB7XG4gICAgICAvLyBlbmNvZGUgdG8gdXRmMTYgKHN1cnJvZ2F0ZSBwYWlyIGRhbmNlKVxuICAgICAgY29kZVBvaW50IC09IDB4MTAwMDBcbiAgICAgIHJlcy5wdXNoKGNvZGVQb2ludCA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMClcbiAgICAgIGNvZGVQb2ludCA9IDB4REMwMCB8IGNvZGVQb2ludCAmIDB4M0ZGXG4gICAgfVxuXG4gICAgcmVzLnB1c2goY29kZVBvaW50KVxuICAgIGkgKz0gYnl0ZXNQZXJTZXF1ZW5jZVxuICB9XG5cbiAgcmV0dXJuIGRlY29kZUNvZGVQb2ludHNBcnJheShyZXMpXG59XG5cbi8vIEJhc2VkIG9uIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyNzQ3MjcyLzY4MDc0MiwgdGhlIGJyb3dzZXIgd2l0aFxuLy8gdGhlIGxvd2VzdCBsaW1pdCBpcyBDaHJvbWUsIHdpdGggMHgxMDAwMCBhcmdzLlxuLy8gV2UgZ28gMSBtYWduaXR1ZGUgbGVzcywgZm9yIHNhZmV0eVxudmFyIE1BWF9BUkdVTUVOVFNfTEVOR1RIID0gMHgxMDAwXG5cbmZ1bmN0aW9uIGRlY29kZUNvZGVQb2ludHNBcnJheSAoY29kZVBvaW50cykge1xuICB2YXIgbGVuID0gY29kZVBvaW50cy5sZW5ndGhcbiAgaWYgKGxlbiA8PSBNQVhfQVJHVU1FTlRTX0xFTkdUSCkge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFN0cmluZywgY29kZVBvaW50cykgLy8gYXZvaWQgZXh0cmEgc2xpY2UoKVxuICB9XG5cbiAgLy8gRGVjb2RlIGluIGNodW5rcyB0byBhdm9pZCBcImNhbGwgc3RhY2sgc2l6ZSBleGNlZWRlZFwiLlxuICB2YXIgcmVzID0gJydcbiAgdmFyIGkgPSAwXG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoXG4gICAgICBTdHJpbmcsXG4gICAgICBjb2RlUG9pbnRzLnNsaWNlKGksIGkgKz0gTUFYX0FSR1VNRU5UU19MRU5HVEgpXG4gICAgKVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0gJiAweDdGKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gbGF0aW4xU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIChieXRlc1tpICsgMV0gKiAyNTYpKVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIHNsaWNlIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IH5+c3RhcnRcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW4gOiB+fmVuZFxuXG4gIGlmIChzdGFydCA8IDApIHtcbiAgICBzdGFydCArPSBsZW5cbiAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgfSBlbHNlIGlmIChzdGFydCA+IGxlbikge1xuICAgIHN0YXJ0ID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgMCkge1xuICAgIGVuZCArPSBsZW5cbiAgICBpZiAoZW5kIDwgMCkgZW5kID0gMFxuICB9IGVsc2UgaWYgKGVuZCA+IGxlbikge1xuICAgIGVuZCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIHZhciBuZXdCdWYgPSB0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpXG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIG5ld0J1Zi5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIHJldHVybiBuZXdCdWZcbn1cblxuLypcbiAqIE5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgYnVmZmVyIGlzbid0IHRyeWluZyB0byB3cml0ZSBvdXQgb2YgYm91bmRzLlxuICovXG5mdW5jdGlvbiBjaGVja09mZnNldCAob2Zmc2V0LCBleHQsIGxlbmd0aCkge1xuICBpZiAoKG9mZnNldCAlIDEpICE9PSAwIHx8IG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdvZmZzZXQgaXMgbm90IHVpbnQnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gbGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVHJ5aW5nIHRvIGFjY2VzcyBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRMRSA9IGZ1bmN0aW9uIHJlYWRVSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50QkUgPSBmdW5jdGlvbiByZWFkVUludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcbiAgfVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF1cbiAgdmFyIG11bCA9IDFcbiAgd2hpbGUgKGJ5dGVMZW5ndGggPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIHJlYWRVSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCA4KSB8IHRoaXNbb2Zmc2V0ICsgMV1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiByZWFkVUludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICgodGhpc1tvZmZzZXRdKSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikpICtcbiAgICAgICh0aGlzW29mZnNldCArIDNdICogMHgxMDAwMDAwKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSAqIDB4MTAwMDAwMCkgK1xuICAgICgodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICB0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRMRSA9IGZ1bmN0aW9uIHJlYWRJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50QkUgPSBmdW5jdGlvbiByZWFkSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoXG4gIHZhciBtdWwgPSAxXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0taV1cbiAgd2hpbGUgKGkgPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1pXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiByZWFkSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgaWYgKCEodGhpc1tvZmZzZXRdICYgMHg4MCkpIHJldHVybiAodGhpc1tvZmZzZXRdKVxuICByZXR1cm4gKCgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gcmVhZEludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIDFdIHwgKHRoaXNbb2Zmc2V0XSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiByZWFkSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDNdIDw8IDI0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gcmVhZEludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdExFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiByZWFkRmxvYXRCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiByZWFkRG91YmxlTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiByZWFkRG91YmxlQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgNTIsIDgpXG59XG5cbmZ1bmN0aW9uIGNoZWNrSW50IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJidWZmZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyIGluc3RhbmNlJylcbiAgaWYgKHZhbHVlID4gbWF4IHx8IHZhbHVlIDwgbWluKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJ2YWx1ZVwiIGFyZ3VtZW50IGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludEJFID0gZnVuY3Rpb24gd3JpdGVVSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIG1heEJ5dGVzID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG1heEJ5dGVzLCAwKVxuICB9XG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoIC0gMVxuICB2YXIgbXVsID0gMVxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVVSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4ZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIGxpbWl0ID0gTWF0aC5wb3coMiwgKDggKiBieXRlTGVuZ3RoKSAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gMFxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgLSAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50QkUgPSBmdW5jdGlvbiB3cml0ZUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBsaW1pdCA9IE1hdGgucG93KDIsICg4ICogYnl0ZUxlbmd0aCkgLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgaWYgKHZhbHVlIDwgMCAmJiBzdWIgPT09IDAgJiYgdGhpc1tvZmZzZXQgKyBpICsgMV0gIT09IDApIHtcbiAgICAgIHN1YiA9IDFcbiAgICB9XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiB3cml0ZUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweDdmLCAtMHg4MClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDFcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5mdW5jdGlvbiBjaGVja0lFRUU3NTQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG4gIGlmIChvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgNCwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gd3JpdGVGbG9hdExFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDgsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG4gIHJldHVybiBvZmZzZXQgKyA4XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gY29weSAodGFyZ2V0LCB0YXJnZXRTdGFydCwgc3RhcnQsIGVuZCkge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0YXJnZXQpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdhcmd1bWVudCBzaG91bGQgYmUgYSBCdWZmZXInKVxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0U3RhcnQgPj0gdGFyZ2V0Lmxlbmd0aCkgdGFyZ2V0U3RhcnQgPSB0YXJnZXQubGVuZ3RoXG4gIGlmICghdGFyZ2V0U3RhcnQpIHRhcmdldFN0YXJ0ID0gMFxuICBpZiAoZW5kID4gMCAmJiBlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVybiAwXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgaWYgKHRhcmdldFN0YXJ0IDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgfVxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHRoaXMubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbiAgaWYgKGVuZCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0IDwgZW5kIC0gc3RhcnQpIHtcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgKyBzdGFydFxuICB9XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCAmJiB0eXBlb2YgVWludDhBcnJheS5wcm90b3R5cGUuY29weVdpdGhpbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIFVzZSBidWlsdC1pbiB3aGVuIGF2YWlsYWJsZSwgbWlzc2luZyBmcm9tIElFMTFcbiAgICB0aGlzLmNvcHlXaXRoaW4odGFyZ2V0U3RhcnQsIHN0YXJ0LCBlbmQpXG4gIH0gZWxzZSBpZiAodGhpcyA9PT0gdGFyZ2V0ICYmIHN0YXJ0IDwgdGFyZ2V0U3RhcnQgJiYgdGFyZ2V0U3RhcnQgPCBlbmQpIHtcbiAgICAvLyBkZXNjZW5kaW5nIGNvcHkgZnJvbSBlbmRcbiAgICBmb3IgKHZhciBpID0gbGVuIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIFVpbnQ4QXJyYXkucHJvdG90eXBlLnNldC5jYWxsKFxuICAgICAgdGFyZ2V0LFxuICAgICAgdGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSxcbiAgICAgIHRhcmdldFN0YXJ0XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIGxlblxufVxuXG4vLyBVc2FnZTpcbi8vICAgIGJ1ZmZlci5maWxsKG51bWJlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoYnVmZmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChzdHJpbmdbLCBvZmZzZXRbLCBlbmRdXVssIGVuY29kaW5nXSlcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uIGZpbGwgKHZhbCwgc3RhcnQsIGVuZCwgZW5jb2RpbmcpIHtcbiAgLy8gSGFuZGxlIHN0cmluZyBjYXNlczpcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gc3RhcnRcbiAgICAgIHN0YXJ0ID0gMFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbmQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IGVuZFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9XG4gICAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZW5jb2RpbmcgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnICYmICFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICB9XG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDEpIHtcbiAgICAgIHZhciBjb2RlID0gdmFsLmNoYXJDb2RlQXQoMClcbiAgICAgIGlmICgoZW5jb2RpbmcgPT09ICd1dGY4JyAmJiBjb2RlIDwgMTI4KSB8fFxuICAgICAgICAgIGVuY29kaW5nID09PSAnbGF0aW4xJykge1xuICAgICAgICAvLyBGYXN0IHBhdGg6IElmIGB2YWxgIGZpdHMgaW50byBhIHNpbmdsZSBieXRlLCB1c2UgdGhhdCBudW1lcmljIHZhbHVlLlxuICAgICAgICB2YWwgPSBjb2RlXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgdmFsID0gdmFsICYgMjU1XG4gIH1cblxuICAvLyBJbnZhbGlkIHJhbmdlcyBhcmUgbm90IHNldCB0byBhIGRlZmF1bHQsIHNvIGNhbiByYW5nZSBjaGVjayBlYXJseS5cbiAgaWYgKHN0YXJ0IDwgMCB8fCB0aGlzLmxlbmd0aCA8IHN0YXJ0IHx8IHRoaXMubGVuZ3RoIDwgZW5kKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ091dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHN0YXJ0ID0gc3RhcnQgPj4+IDBcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyB0aGlzLmxlbmd0aCA6IGVuZCA+Pj4gMFxuXG4gIGlmICghdmFsKSB2YWwgPSAwXG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgICAgdGhpc1tpXSA9IHZhbFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgYnl0ZXMgPSBCdWZmZXIuaXNCdWZmZXIodmFsKVxuICAgICAgPyB2YWxcbiAgICAgIDogQnVmZmVyLmZyb20odmFsLCBlbmNvZGluZylcbiAgICB2YXIgbGVuID0gYnl0ZXMubGVuZ3RoXG4gICAgaWYgKGxlbiA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIHZhbHVlIFwiJyArIHZhbCArXG4gICAgICAgICdcIiBpcyBpbnZhbGlkIGZvciBhcmd1bWVudCBcInZhbHVlXCInKVxuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgZW5kIC0gc3RhcnQ7ICsraSkge1xuICAgICAgdGhpc1tpICsgc3RhcnRdID0gYnl0ZXNbaSAlIGxlbl1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbnZhciBJTlZBTElEX0JBU0U2NF9SRSA9IC9bXisvMC05QS1aYS16LV9dL2dcblxuZnVuY3Rpb24gYmFzZTY0Y2xlYW4gKHN0cikge1xuICAvLyBOb2RlIHRha2VzIGVxdWFsIHNpZ25zIGFzIGVuZCBvZiB0aGUgQmFzZTY0IGVuY29kaW5nXG4gIHN0ciA9IHN0ci5zcGxpdCgnPScpWzBdXG4gIC8vIE5vZGUgc3RyaXBzIG91dCBpbnZhbGlkIGNoYXJhY3RlcnMgbGlrZSBcXG4gYW5kIFxcdCBmcm9tIHRoZSBzdHJpbmcsIGJhc2U2NC1qcyBkb2VzIG5vdFxuICBzdHIgPSBzdHIudHJpbSgpLnJlcGxhY2UoSU5WQUxJRF9CQVNFNjRfUkUsICcnKVxuICAvLyBOb2RlIGNvbnZlcnRzIHN0cmluZ3Mgd2l0aCBsZW5ndGggPCAyIHRvICcnXG4gIGlmIChzdHIubGVuZ3RoIDwgMikgcmV0dXJuICcnXG4gIC8vIE5vZGUgYWxsb3dzIGZvciBub24tcGFkZGVkIGJhc2U2NCBzdHJpbmdzIChtaXNzaW5nIHRyYWlsaW5nID09PSksIGJhc2U2NC1qcyBkb2VzIG5vdFxuICB3aGlsZSAoc3RyLmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICBzdHIgPSBzdHIgKyAnPSdcbiAgfVxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cmluZywgdW5pdHMpIHtcbiAgdW5pdHMgPSB1bml0cyB8fCBJbmZpbml0eVxuICB2YXIgY29kZVBvaW50XG4gIHZhciBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG4gIHZhciBsZWFkU3Vycm9nYXRlID0gbnVsbFxuICB2YXIgYnl0ZXMgPSBbXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBjb2RlUG9pbnQgPSBzdHJpbmcuY2hhckNvZGVBdChpKVxuXG4gICAgLy8gaXMgc3Vycm9nYXRlIGNvbXBvbmVudFxuICAgIGlmIChjb2RlUG9pbnQgPiAweEQ3RkYgJiYgY29kZVBvaW50IDwgMHhFMDAwKSB7XG4gICAgICAvLyBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCFsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAgIC8vIG5vIGxlYWQgeWV0XG4gICAgICAgIGlmIChjb2RlUG9pbnQgPiAweERCRkYpIHtcbiAgICAgICAgICAvLyB1bmV4cGVjdGVkIHRyYWlsXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfSBlbHNlIGlmIChpICsgMSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICAgLy8gdW5wYWlyZWQgbGVhZFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyB2YWxpZCBsZWFkXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyAyIGxlYWRzIGluIGEgcm93XG4gICAgICBpZiAoY29kZVBvaW50IDwgMHhEQzAwKSB7XG4gICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIHZhbGlkIHN1cnJvZ2F0ZSBwYWlyXG4gICAgICBjb2RlUG9pbnQgPSAobGVhZFN1cnJvZ2F0ZSAtIDB4RDgwMCA8PCAxMCB8IGNvZGVQb2ludCAtIDB4REMwMCkgKyAweDEwMDAwXG4gICAgfSBlbHNlIGlmIChsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAvLyB2YWxpZCBibXAgY2hhciwgYnV0IGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICB9XG5cbiAgICBsZWFkU3Vycm9nYXRlID0gbnVsbFxuXG4gICAgLy8gZW5jb2RlIHV0ZjhcbiAgICBpZiAoY29kZVBvaW50IDwgMHg4MCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAxKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKGNvZGVQb2ludClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4ODAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgfCAweEMwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAzKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDIHwgMHhFMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gNCkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4MTIgfCAweEYwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvZGUgcG9pbnQnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBieXRlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyLCB1bml0cykge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuXG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoYmFzZTY0Y2xlYW4oc3RyKSlcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuLy8gQXJyYXlCdWZmZXIgb3IgVWludDhBcnJheSBvYmplY3RzIGZyb20gb3RoZXIgY29udGV4dHMgKGkuZS4gaWZyYW1lcykgZG8gbm90IHBhc3Ncbi8vIHRoZSBgaW5zdGFuY2VvZmAgY2hlY2sgYnV0IHRoZXkgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgb2YgdGhhdCB0eXBlLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9pc3N1ZXMvMTY2XG5mdW5jdGlvbiBpc0luc3RhbmNlIChvYmosIHR5cGUpIHtcbiAgcmV0dXJuIG9iaiBpbnN0YW5jZW9mIHR5cGUgfHxcbiAgICAob2JqICE9IG51bGwgJiYgb2JqLmNvbnN0cnVjdG9yICE9IG51bGwgJiYgb2JqLmNvbnN0cnVjdG9yLm5hbWUgIT0gbnVsbCAmJlxuICAgICAgb2JqLmNvbnN0cnVjdG9yLm5hbWUgPT09IHR5cGUubmFtZSlcbn1cbmZ1bmN0aW9uIG51bWJlcklzTmFOIChvYmopIHtcbiAgLy8gRm9yIElFMTEgc3VwcG9ydFxuICByZXR1cm4gb2JqICE9PSBvYmogLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbn1cbiIsInZhciBjaGFyZW5jID0ge1xuICAvLyBVVEYtOCBlbmNvZGluZ1xuICB1dGY4OiB7XG4gICAgLy8gQ29udmVydCBhIHN0cmluZyB0byBhIGJ5dGUgYXJyYXlcbiAgICBzdHJpbmdUb0J5dGVzOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgIHJldHVybiBjaGFyZW5jLmJpbi5zdHJpbmdUb0J5dGVzKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChzdHIpKSk7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBieXRlIGFycmF5IHRvIGEgc3RyaW5nXG4gICAgYnl0ZXNUb1N0cmluZzogZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoZXNjYXBlKGNoYXJlbmMuYmluLmJ5dGVzVG9TdHJpbmcoYnl0ZXMpKSk7XG4gICAgfVxuICB9LFxuXG4gIC8vIEJpbmFyeSBlbmNvZGluZ1xuICBiaW46IHtcbiAgICAvLyBDb252ZXJ0IGEgc3RyaW5nIHRvIGEgYnl0ZSBhcnJheVxuICAgIHN0cmluZ1RvQnl0ZXM6IGZ1bmN0aW9uKHN0cikge1xuICAgICAgZm9yICh2YXIgYnl0ZXMgPSBbXSwgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspXG4gICAgICAgIGJ5dGVzLnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKTtcbiAgICAgIHJldHVybiBieXRlcztcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGJ5dGUgYXJyYXkgdG8gYSBzdHJpbmdcbiAgICBieXRlc1RvU3RyaW5nOiBmdW5jdGlvbihieXRlcykge1xuICAgICAgZm9yICh2YXIgc3RyID0gW10sIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspXG4gICAgICAgIHN0ci5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pKTtcbiAgICAgIHJldHVybiBzdHIuam9pbignJyk7XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNoYXJlbmM7XG4iLCIvKiFcbiAqIGpRdWVyeSBjbGlwLXBhdGgtcG9seWdvbiBQbHVnaW4gdjAuMS4xNCAoMjAxOS0xMS0xNilcbiAqIGpRdWVyeSBwbHVnaW4gdGhhdCBtYWtlcyBlYXN5IHRvIHVzZSBjbGlwLXBhdGggb24gd2hhdGV2ZXIgdGFnIHVuZGVyIGRpZmZlcmVudCBicm93c2Vyc1xuICogaHR0cHM6Ly9naXRodWIuY29tL2FuZHJ1c2llY3prby9jbGlwLXBhdGgtcG9seWdvblxuICogXG4gKiBDb3B5cmlnaHQgMjAxOSBLYXJvbCBBbmRydXNpZWN6a29cbiAqIFJlbGVhc2VkIHVuZGVyIE1JVCBsaWNlbnNlXG4gKi9cblxudmFyIGdsb2JhbFZhcmlhYmxlID0gd2luZG93IHx8IHJvb3Q7XG52YXIgalF1ZXJ5ID0galF1ZXJ5IHx8IGdsb2JhbFZhcmlhYmxlLmpRdWVyeSB8fCByZXF1aXJlKFwianF1ZXJ5XCIpO1xuXG4oZnVuY3Rpb24oJCkge1xuICB2YXIgaWQgPSAwO1xuXG4gIHZhciBDbGlwUGF0aCA9IGZ1bmN0aW9uKGpRdWVyeSwgJGVsLCBwb2ludHMsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiQgPSBqUXVlcnk7XG4gICAgdGhpcy4kZWwgPSAkZWw7XG4gICAgdGhpcy5wb2ludHMgPSBwb2ludHM7XG4gICAgdGhpcy5zdmdEZWZJZCA9ICdjbGlwUGF0aFBvbHlnb25HZW5JZCcgKyBpZCsrO1xuXG4gICAgdGhpcy5wcm9jZXNzT3B0aW9ucyhvcHRpb25zKTtcbiAgfTtcblxuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBDbGlwUGF0aDtcbiAgICB9XG4gICAgZXhwb3J0cy5DbGlwUGF0aCA9IENsaXBQYXRoO1xuICB9IGVsc2Uge1xuICAgIGdsb2JhbFZhcmlhYmxlLkNsaXBQYXRoID0gQ2xpcFBhdGg7XG4gIH1cblxuICBDbGlwUGF0aC5wcm90b3R5cGUgPSB7XG5cbiAgICAkOiBudWxsLFxuICAgICRlbDogbnVsbCxcbiAgICBwb2ludHM6IG51bGwsXG5cbiAgICBpc0ZvcldlYmtpdDogdHJ1ZSxcbiAgICBpc0ZvclN2ZzogdHJ1ZSxcbiAgICBzdmdEZWZJZDogbnVsbCxcbiAgICBpc1BlcmNlbnRhZ2U6IGZhbHNlLFxuXG4gICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2NyZWF0ZUNsaXBQYXRoKHRoaXMucG9pbnRzKTtcbiAgICB9LFxuXG4gICAgX2NyZWF0ZUNsaXBQYXRoOiBmdW5jdGlvbihwb2ludHMpIHtcbiAgICAgIHRoaXMuX2NyZWF0ZVN2Z0RlZnMoKTtcbiAgICAgIGlmICh0aGlzLmlzRm9yU3ZnKSB7XG4gICAgICAgIHRoaXMuX2NyZWF0ZVN2Z0Jhc2VkQ2xpcFBhdGgocG9pbnRzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmlzRm9yV2Via2l0KSB7XG4gICAgICAgIHRoaXMuX2NyZWF0ZVdlYmtpdENsaXBQYXRoKHBvaW50cyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIF9jcmVhdGVXZWJraXRDbGlwUGF0aDogZnVuY3Rpb24ocG9pbnRzKSB7XG4gICAgICB2YXIgY2xpcFBhdGggPSBcInBvbHlnb24oXCIgKyB0aGlzLl90cmFuc2xhdGVQb2ludHMocG9pbnRzLCB0cnVlLCB0aGlzLmlzUGVyY2VudGFnZSkgKyBcIilcIjtcbiAgICAgIHRoaXMuJGVsLmNzcygnLXdlYmtpdC1jbGlwLXBhdGgnLCBjbGlwUGF0aCk7XG4gICAgfSxcblxuICAgIF9jcmVhdGVTdmdCYXNlZENsaXBQYXRoOiBmdW5jdGlvbihwb2ludHMpIHtcbiAgICAgIHRoaXMuJCgnIycgKyB0aGlzLnN2Z0RlZklkICsgJycpLmZpbmQoJ3BvbHlnb24nKS5hdHRyKCdwb2ludHMnLCB0aGlzLl90cmFuc2xhdGVQb2ludHMocG9pbnRzLCBmYWxzZSwgdGhpcy5pc1BlcmNlbnRhZ2UpKTtcbiAgICAgIHRoaXMuJGVsLmNzcygnY2xpcC1wYXRoJywgJ3VybCgjJyArIHRoaXMuc3ZnRGVmSWQgKyAnKScpO1xuICAgIH0sXG5cblxuICAgIF90cmFuc2xhdGVQb2ludHM6IGZ1bmN0aW9uKHBvaW50cywgd2l0aFVuaXQsIGlzUGVyY2VudGFnZSkge1xuICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgZm9yICh2YXIgaSBpbiBwb2ludHMpIHtcbiAgICAgICAgdmFyIHggPSB0aGlzLl9oYW5kbGVQeHMocG9pbnRzW2ldWzBdLCB3aXRoVW5pdCwgaXNQZXJjZW50YWdlKTtcbiAgICAgICAgdmFyIHkgPSB0aGlzLl9oYW5kbGVQeHMocG9pbnRzW2ldWzFdLCB3aXRoVW5pdCwgaXNQZXJjZW50YWdlKTtcbiAgICAgICAgcmVzdWx0LnB1c2goeCArICcgJyArIHkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdC5qb2luKCcsICcpO1xuICAgIH0sXG5cbiAgICBfaGFuZGxlUHhzOiBmdW5jdGlvbihudW1iZXIsIHdpdGhVbml0LCBpc1BlcmNlbnRhZ2UpIHtcbiAgICAgIGlmIChudW1iZXIgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG51bWJlcjtcbiAgICAgIH1cbiAgICAgIGlmICghd2l0aFVuaXQpIHtcbiAgICAgICAgaWYgKGlzUGVyY2VudGFnZSkge1xuICAgICAgICAgIHJldHVybiBudW1iZXIgLyAxMDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bWJlcjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bWJlciArIChpc1BlcmNlbnRhZ2UgPyBcIiVcIiA6IFwicHhcIik7XG4gICAgfSxcblxuICAgIF9jcmVhdGVTdmdFbGVtZW50OiBmdW5jdGlvbihlbGVtZW50TmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMuJChkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgZWxlbWVudE5hbWUpKTtcbiAgICB9LFxuXG4gICAgX2NyZWF0ZVN2Z0RlZnM6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuJCgnIycgKyB0aGlzLnN2Z0RlZklkICsgJycpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB2YXIgJHN2ZyA9IHRoaXMuX2NyZWF0ZVN2Z0VsZW1lbnQoJ3N2ZycpLmF0dHIoJ3dpZHRoJywgMCkuYXR0cignaGVpZ2h0JywgMCkuY3NzKHtcbiAgICAgICAgICAncG9zaXRpb24nOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICd2aXNpYmlsaXR5JzogJ2hpZGRlbicsXG4gICAgICAgICAgJ3dpZHRoJzogMCxcbiAgICAgICAgICAnaGVpZ2h0JzogMFxuICAgICAgICB9KTtcbiAgICAgICAgdmFyICRkZWZzID0gdGhpcy5fY3JlYXRlU3ZnRWxlbWVudCgnZGVmcycpO1xuICAgICAgICAkc3ZnLmFwcGVuZCgkZGVmcyk7XG4gICAgICAgIHZhciAkY2xpcHBhdGggPSB0aGlzLl9jcmVhdGVTdmdFbGVtZW50KCdjbGlwUGF0aCcpLmF0dHIoJ2lkJywgdGhpcy5zdmdEZWZJZCk7XG4gICAgICAgIGlmICh0aGlzLmlzUGVyY2VudGFnZSkge1xuICAgICAgICAgICRjbGlwcGF0aC5nZXQoMCkuc2V0QXR0cmlidXRlKCdjbGlwUGF0aFVuaXRzJywgJ29iamVjdEJvdW5kaW5nQm94Jyk7XG4gICAgICAgIH1cbiAgICAgICAgJGRlZnMuYXBwZW5kKCRjbGlwcGF0aCk7XG4gICAgICAgIHZhciAkcG9seWdvbiA9IHRoaXMuX2NyZWF0ZVN2Z0VsZW1lbnQoJ3BvbHlnb24nKTtcbiAgICAgICAgJGNsaXBwYXRoLmFwcGVuZCgkcG9seWdvbik7XG4gICAgICAgIHRoaXMuJCgnYm9keScpLmFwcGVuZCgkc3ZnKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcHJvY2Vzc09wdGlvbnM6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMuaXNGb3JXZWJraXQgPSAob3B0aW9ucyAmJiB0eXBlb2Yob3B0aW9ucy5pc0ZvcldlYmtpdCkgIT09IFwidW5kZWZpbmVkXCIpID8gb3B0aW9ucy5pc0ZvcldlYmtpdCA6IHRoaXMuaXNGb3JXZWJraXQ7XG4gICAgICB0aGlzLmlzRm9yU3ZnID0gKG9wdGlvbnMgJiYgdHlwZW9mKG9wdGlvbnMuaXNGb3JTdmcpICE9PSBcInVuZGVmaW5lZFwiKSA/IG9wdGlvbnMuaXNGb3JTdmcgOiB0aGlzLmlzRm9yU3ZnO1xuICAgICAgdGhpcy5pc1BlcmNlbnRhZ2UgPSAob3B0aW9ucyAmJiBvcHRpb25zLmlzUGVyY2VudGFnZSB8fCB0aGlzLmlzUGVyY2VudGFnZSk7XG4gICAgICB0aGlzLnN2Z0RlZklkID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5zdmdEZWZJZCkgfHwgdGhpcy5zdmdEZWZJZDtcbiAgICB9XG4gIH07XG4gIFxuICAkLmZuLmNsaXBQYXRoID0gZnVuY3Rpb24ocG9pbnRzLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkZWwgPSAkKHRoaXMpO1xuICAgICAgdmFyIGNsaXBQYXRoID0gbmV3IENsaXBQYXRoKCQsICRlbCwgcG9pbnRzLCBvcHRpb25zKTtcbiAgICAgIGNsaXBQYXRoLmNyZWF0ZSgpO1xuICAgIH0pO1xuICB9O1xuXG59KS5jYWxsKHRoaXMsIGpRdWVyeSk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBiYXNlNjRtYXBcbiAgICAgID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nLFxuXG4gIGNyeXB0ID0ge1xuICAgIC8vIEJpdC13aXNlIHJvdGF0aW9uIGxlZnRcbiAgICByb3RsOiBmdW5jdGlvbihuLCBiKSB7XG4gICAgICByZXR1cm4gKG4gPDwgYikgfCAobiA+Pj4gKDMyIC0gYikpO1xuICAgIH0sXG5cbiAgICAvLyBCaXQtd2lzZSByb3RhdGlvbiByaWdodFxuICAgIHJvdHI6IGZ1bmN0aW9uKG4sIGIpIHtcbiAgICAgIHJldHVybiAobiA8PCAoMzIgLSBiKSkgfCAobiA+Pj4gYik7XG4gICAgfSxcblxuICAgIC8vIFN3YXAgYmlnLWVuZGlhbiB0byBsaXR0bGUtZW5kaWFuIGFuZCB2aWNlIHZlcnNhXG4gICAgZW5kaWFuOiBmdW5jdGlvbihuKSB7XG4gICAgICAvLyBJZiBudW1iZXIgZ2l2ZW4sIHN3YXAgZW5kaWFuXG4gICAgICBpZiAobi5jb25zdHJ1Y3RvciA9PSBOdW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIGNyeXB0LnJvdGwobiwgOCkgJiAweDAwRkYwMEZGIHwgY3J5cHQucm90bChuLCAyNCkgJiAweEZGMDBGRjAwO1xuICAgICAgfVxuXG4gICAgICAvLyBFbHNlLCBhc3N1bWUgYXJyYXkgYW5kIHN3YXAgYWxsIGl0ZW1zXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG4ubGVuZ3RoOyBpKyspXG4gICAgICAgIG5baV0gPSBjcnlwdC5lbmRpYW4obltpXSk7XG4gICAgICByZXR1cm4gbjtcbiAgICB9LFxuXG4gICAgLy8gR2VuZXJhdGUgYW4gYXJyYXkgb2YgYW55IGxlbmd0aCBvZiByYW5kb20gYnl0ZXNcbiAgICByYW5kb21CeXRlczogZnVuY3Rpb24obikge1xuICAgICAgZm9yICh2YXIgYnl0ZXMgPSBbXTsgbiA+IDA7IG4tLSlcbiAgICAgICAgYnl0ZXMucHVzaChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTYpKTtcbiAgICAgIHJldHVybiBieXRlcztcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGJ5dGUgYXJyYXkgdG8gYmlnLWVuZGlhbiAzMi1iaXQgd29yZHNcbiAgICBieXRlc1RvV29yZHM6IGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBmb3IgKHZhciB3b3JkcyA9IFtdLCBpID0gMCwgYiA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKywgYiArPSA4KVxuICAgICAgICB3b3Jkc1tiID4+PiA1XSB8PSBieXRlc1tpXSA8PCAoMjQgLSBiICUgMzIpO1xuICAgICAgcmV0dXJuIHdvcmRzO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGJpZy1lbmRpYW4gMzItYml0IHdvcmRzIHRvIGEgYnl0ZSBhcnJheVxuICAgIHdvcmRzVG9CeXRlczogZnVuY3Rpb24od29yZHMpIHtcbiAgICAgIGZvciAodmFyIGJ5dGVzID0gW10sIGIgPSAwOyBiIDwgd29yZHMubGVuZ3RoICogMzI7IGIgKz0gOClcbiAgICAgICAgYnl0ZXMucHVzaCgod29yZHNbYiA+Pj4gNV0gPj4+ICgyNCAtIGIgJSAzMikpICYgMHhGRik7XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBieXRlIGFycmF5IHRvIGEgaGV4IHN0cmluZ1xuICAgIGJ5dGVzVG9IZXg6IGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBmb3IgKHZhciBoZXggPSBbXSwgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBoZXgucHVzaCgoYnl0ZXNbaV0gPj4+IDQpLnRvU3RyaW5nKDE2KSk7XG4gICAgICAgIGhleC5wdXNoKChieXRlc1tpXSAmIDB4RikudG9TdHJpbmcoMTYpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBoZXguam9pbignJyk7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBoZXggc3RyaW5nIHRvIGEgYnl0ZSBhcnJheVxuICAgIGhleFRvQnl0ZXM6IGZ1bmN0aW9uKGhleCkge1xuICAgICAgZm9yICh2YXIgYnl0ZXMgPSBbXSwgYyA9IDA7IGMgPCBoZXgubGVuZ3RoOyBjICs9IDIpXG4gICAgICAgIGJ5dGVzLnB1c2gocGFyc2VJbnQoaGV4LnN1YnN0cihjLCAyKSwgMTYpKTtcbiAgICAgIHJldHVybiBieXRlcztcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGJ5dGUgYXJyYXkgdG8gYSBiYXNlLTY0IHN0cmluZ1xuICAgIGJ5dGVzVG9CYXNlNjQ6IGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBmb3IgKHZhciBiYXNlNjQgPSBbXSwgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICB2YXIgdHJpcGxldCA9IChieXRlc1tpXSA8PCAxNikgfCAoYnl0ZXNbaSArIDFdIDw8IDgpIHwgYnl0ZXNbaSArIDJdO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDQ7IGorKylcbiAgICAgICAgICBpZiAoaSAqIDggKyBqICogNiA8PSBieXRlcy5sZW5ndGggKiA4KVxuICAgICAgICAgICAgYmFzZTY0LnB1c2goYmFzZTY0bWFwLmNoYXJBdCgodHJpcGxldCA+Pj4gNiAqICgzIC0gaikpICYgMHgzRikpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJhc2U2NC5wdXNoKCc9Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZTY0LmpvaW4oJycpO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYmFzZS02NCBzdHJpbmcgdG8gYSBieXRlIGFycmF5XG4gICAgYmFzZTY0VG9CeXRlczogZnVuY3Rpb24oYmFzZTY0KSB7XG4gICAgICAvLyBSZW1vdmUgbm9uLWJhc2UtNjQgY2hhcmFjdGVyc1xuICAgICAgYmFzZTY0ID0gYmFzZTY0LnJlcGxhY2UoL1teQS1aMC05K1xcL10vaWcsICcnKTtcblxuICAgICAgZm9yICh2YXIgYnl0ZXMgPSBbXSwgaSA9IDAsIGltb2Q0ID0gMDsgaSA8IGJhc2U2NC5sZW5ndGg7XG4gICAgICAgICAgaW1vZDQgPSArK2kgJSA0KSB7XG4gICAgICAgIGlmIChpbW9kNCA9PSAwKSBjb250aW51ZTtcbiAgICAgICAgYnl0ZXMucHVzaCgoKGJhc2U2NG1hcC5pbmRleE9mKGJhc2U2NC5jaGFyQXQoaSAtIDEpKVxuICAgICAgICAgICAgJiAoTWF0aC5wb3coMiwgLTIgKiBpbW9kNCArIDgpIC0gMSkpIDw8IChpbW9kNCAqIDIpKVxuICAgICAgICAgICAgfCAoYmFzZTY0bWFwLmluZGV4T2YoYmFzZTY0LmNoYXJBdChpKSkgPj4+ICg2IC0gaW1vZDQgKiAyKSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH1cbiAgfTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IGNyeXB0O1xufSkoKTtcbiIsImV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtXG4gIHZhciBlTGVuID0gKG5CeXRlcyAqIDgpIC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gKGUgKiAyNTYpICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gKG0gKiAyNTYpICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgY1xuICB2YXIgZUxlbiA9IChuQnl0ZXMgKiA4KSAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAoKHZhbHVlICogYykgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cbiIsIi8qXG4gKiBxVGlwMiAtIFByZXR0eSBwb3dlcmZ1bCB0b29sdGlwcyAtIHYzLjAuM1xuICogaHR0cDovL3F0aXAyLmNvbVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNiBcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZXNcbiAqIGh0dHA6Ly9qcXVlcnkub3JnL2xpY2Vuc2VcbiAqXG4gKiBEYXRlOiBXZWQgTWF5IDExIDIwMTYgMTA6MzEgR01UKzAxMDArMDEwMFxuICogUGx1Z2luczogdGlwcyBtb2RhbCB2aWV3cG9ydCBzdmcgaW1hZ2VtYXAgaWU2XG4gKiBTdHlsZXM6IGNvcmUgYmFzaWMgY3NzM1xuICovXG4vKmdsb2JhbCB3aW5kb3c6IGZhbHNlLCBqUXVlcnk6IGZhbHNlLCBjb25zb2xlOiBmYWxzZSwgZGVmaW5lOiBmYWxzZSAqL1xuXG4vKiBDYWNoZSB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQgKi9cbihmdW5jdGlvbiggd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkICkge1xuXG4vLyBVc2VzIEFNRCBvciBicm93c2VyIGdsb2JhbHMgdG8gY3JlYXRlIGEgalF1ZXJ5IHBsdWdpbi5cbihmdW5jdGlvbiggZmFjdG9yeSApIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcblx0fVxuXHRlbHNlIGlmKGpRdWVyeSAmJiAhalF1ZXJ5LmZuLnF0aXApIHtcblx0XHRmYWN0b3J5KGpRdWVyeSk7XG5cdH1cbn1cbihmdW5jdGlvbigkKSB7XG5cdFwidXNlIHN0cmljdFwiOyAvLyBFbmFibGUgRUNNQVNjcmlwdCBcInN0cmljdFwiIG9wZXJhdGlvbiBmb3IgdGhpcyBmdW5jdGlvbi4gU2VlIG1vcmU6IGh0dHA6Ly9lam9obi5vcmcvYmxvZy9lY21hc2NyaXB0LTUtc3RyaWN0LW1vZGUtanNvbi1hbmQtbW9yZS9cbjsvLyBNdW5nZSB0aGUgcHJpbWl0aXZlcyAtIFBhdWwgSXJpc2ggdGlwXG52YXIgVFJVRSA9IHRydWUsXG5GQUxTRSA9IGZhbHNlLFxuTlVMTCA9IG51bGwsXG5cbi8vIENvbW1vbiB2YXJpYWJsZXNcblggPSAneCcsIFkgPSAneScsXG5XSURUSCA9ICd3aWR0aCcsXG5IRUlHSFQgPSAnaGVpZ2h0JyxcblxuLy8gUG9zaXRpb25pbmcgc2lkZXNcblRPUCA9ICd0b3AnLFxuTEVGVCA9ICdsZWZ0JyxcbkJPVFRPTSA9ICdib3R0b20nLFxuUklHSFQgPSAncmlnaHQnLFxuQ0VOVEVSID0gJ2NlbnRlcicsXG5cbi8vIFBvc2l0aW9uIGFkanVzdG1lbnQgdHlwZXNcbkZMSVAgPSAnZmxpcCcsXG5GTElQSU5WRVJUID0gJ2ZsaXBpbnZlcnQnLFxuU0hJRlQgPSAnc2hpZnQnLFxuXG4vLyBTaG9ydGN1dCB2YXJzXG5RVElQLCBQUk9UT1RZUEUsIENPUk5FUiwgQ0hFQ0tTLFxuUExVR0lOUyA9IHt9LFxuTkFNRVNQQUNFID0gJ3F0aXAnLFxuQVRUUl9IQVMgPSAnZGF0YS1oYXNxdGlwJyxcbkFUVFJfSUQgPSAnZGF0YS1xdGlwLWlkJyxcbldJREdFVCA9IFsndWktd2lkZ2V0JywgJ3VpLXRvb2x0aXAnXSxcblNFTEVDVE9SID0gJy4nK05BTUVTUEFDRSxcbklOQUNUSVZFX0VWRU5UUyA9ICdjbGljayBkYmxjbGljayBtb3VzZWRvd24gbW91c2V1cCBtb3VzZW1vdmUgbW91c2VsZWF2ZSBtb3VzZWVudGVyJy5zcGxpdCgnICcpLFxuXG5DTEFTU19GSVhFRCA9IE5BTUVTUEFDRSsnLWZpeGVkJyxcbkNMQVNTX0RFRkFVTFQgPSBOQU1FU1BBQ0UgKyAnLWRlZmF1bHQnLFxuQ0xBU1NfRk9DVVMgPSBOQU1FU1BBQ0UgKyAnLWZvY3VzJyxcbkNMQVNTX0hPVkVSID0gTkFNRVNQQUNFICsgJy1ob3ZlcicsXG5DTEFTU19ESVNBQkxFRCA9IE5BTUVTUEFDRSsnLWRpc2FibGVkJyxcblxucmVwbGFjZVN1ZmZpeCA9ICdfcmVwbGFjZWRCeXFUaXAnLFxub2xkdGl0bGUgPSAnb2xkdGl0bGUnLFxudHJhY2tpbmdCb3VuZCxcblxuLy8gQnJvd3NlciBkZXRlY3Rpb25cbkJST1dTRVIgPSB7XG5cdC8qXG5cdCAqIElFIHZlcnNpb24gZGV0ZWN0aW9uXG5cdCAqXG5cdCAqIEFkYXB0ZWQgZnJvbTogaHR0cDovL2FqYXhpYW4uY29tL2FyY2hpdmVzL2F0dGFjay1vZi10aGUtaWUtY29uZGl0aW9uYWwtY29tbWVudFxuXHQgKiBDcmVkaXQgdG8gSmFtZXMgUGFkb2xzZXkgZm9yIHRoZSBvcmlnaW5hbCBpbXBsZW1udGF0aW9uIVxuXHQgKi9cblx0aWU6IChmdW5jdGlvbigpIHtcblx0XHQvKiBlc2xpbnQtZGlzYWJsZSBuby1lbXB0eSAqL1xuXHRcdHZhciB2LCBpO1xuXHRcdGZvciAoXG5cdFx0XHR2ID0gNCwgaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0KGkuaW5uZXJIVE1MID0gJzwhLS1baWYgZ3QgSUUgJyArIHYgKyAnXT48aT48L2k+PCFbZW5kaWZdLS0+JykgJiYgaS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaScpWzBdO1xuXHRcdFx0dis9MVxuXHRcdCkge31cblx0XHRyZXR1cm4gdiA+IDQgPyB2IDogTmFOO1xuXHRcdC8qIGVzbGludC1lbmFibGUgbm8tZW1wdHkgKi9cblx0fSkoKSxcblxuXHQvKlxuXHQgKiBpT1MgdmVyc2lvbiBkZXRlY3Rpb25cblx0ICovXG5cdGlPUzogcGFyc2VGbG9hdChcblx0XHQoJycgKyAoL0NQVS4qT1MgKFswLTlfXXsxLDV9KXwoQ1BVIGxpa2UpLipBcHBsZVdlYktpdC4qTW9iaWxlL2kuZXhlYyhuYXZpZ2F0b3IudXNlckFnZW50KSB8fCBbMCwnJ10pWzFdKVxuXHRcdC5yZXBsYWNlKCd1bmRlZmluZWQnLCAnM18yJykucmVwbGFjZSgnXycsICcuJykucmVwbGFjZSgnXycsICcnKVxuXHQpIHx8IEZBTFNFXG59O1xuO2Z1bmN0aW9uIFFUaXAodGFyZ2V0LCBvcHRpb25zLCBpZCwgYXR0cikge1xuXHQvLyBFbGVtZW50cyBhbmQgSURcblx0dGhpcy5pZCA9IGlkO1xuXHR0aGlzLnRhcmdldCA9IHRhcmdldDtcblx0dGhpcy50b29sdGlwID0gTlVMTDtcblx0dGhpcy5lbGVtZW50cyA9IHsgdGFyZ2V0OiB0YXJnZXQgfTtcblxuXHQvLyBJbnRlcm5hbCBjb25zdHJ1Y3RzXG5cdHRoaXMuX2lkID0gTkFNRVNQQUNFICsgJy0nICsgaWQ7XG5cdHRoaXMudGltZXJzID0geyBpbWc6IHt9IH07XG5cdHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cdHRoaXMucGx1Z2lucyA9IHt9O1xuXG5cdC8vIENhY2hlIG9iamVjdFxuXHR0aGlzLmNhY2hlID0ge1xuXHRcdGV2ZW50OiB7fSxcblx0XHR0YXJnZXQ6ICQoKSxcblx0XHRkaXNhYmxlZDogRkFMU0UsXG5cdFx0YXR0cjogYXR0cixcblx0XHRvblRvb2x0aXA6IEZBTFNFLFxuXHRcdGxhc3RDbGFzczogJydcblx0fTtcblxuXHQvLyBTZXQgdGhlIGluaXRpYWwgZmxhZ3Ncblx0dGhpcy5yZW5kZXJlZCA9IHRoaXMuZGVzdHJveWVkID0gdGhpcy5kaXNhYmxlZCA9IHRoaXMud2FpdGluZyA9XG5cdFx0dGhpcy5oaWRkZW5EdXJpbmdXYWl0ID0gdGhpcy5wb3NpdGlvbmluZyA9IHRoaXMudHJpZ2dlcmluZyA9IEZBTFNFO1xufVxuUFJPVE9UWVBFID0gUVRpcC5wcm90b3R5cGU7XG5cblBST1RPVFlQRS5fd2hlbiA9IGZ1bmN0aW9uKGRlZmVycmVkcykge1xuXHRyZXR1cm4gJC53aGVuLmFwcGx5KCQsIGRlZmVycmVkcyk7XG59O1xuXG5QUk9UT1RZUEUucmVuZGVyID0gZnVuY3Rpb24oc2hvdykge1xuXHRpZih0aGlzLnJlbmRlcmVkIHx8IHRoaXMuZGVzdHJveWVkKSB7IHJldHVybiB0aGlzOyB9IC8vIElmIHRvb2x0aXAgaGFzIGFscmVhZHkgYmVlbiByZW5kZXJlZCwgZXhpdFxuXG5cdHZhciBzZWxmID0gdGhpcyxcblx0XHRvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuXHRcdGNhY2hlID0gdGhpcy5jYWNoZSxcblx0XHRlbGVtZW50cyA9IHRoaXMuZWxlbWVudHMsXG5cdFx0dGV4dCA9IG9wdGlvbnMuY29udGVudC50ZXh0LFxuXHRcdHRpdGxlID0gb3B0aW9ucy5jb250ZW50LnRpdGxlLFxuXHRcdGJ1dHRvbiA9IG9wdGlvbnMuY29udGVudC5idXR0b24sXG5cdFx0cG9zT3B0aW9ucyA9IG9wdGlvbnMucG9zaXRpb24sXG5cdFx0ZGVmZXJyZWRzID0gW107XG5cblx0Ly8gQWRkIEFSSUEgYXR0cmlidXRlcyB0byB0YXJnZXRcblx0JC5hdHRyKHRoaXMudGFyZ2V0WzBdLCAnYXJpYS1kZXNjcmliZWRieScsIHRoaXMuX2lkKTtcblxuXHQvLyBDcmVhdGUgcHVibGljIHBvc2l0aW9uIG9iamVjdCB0aGF0IHRyYWNrcyBjdXJyZW50IHBvc2l0aW9uIGNvcm5lcnNcblx0Y2FjaGUucG9zQ2xhc3MgPSB0aGlzLl9jcmVhdGVQb3NDbGFzcyhcblx0XHQodGhpcy5wb3NpdGlvbiA9IHsgbXk6IHBvc09wdGlvbnMubXksIGF0OiBwb3NPcHRpb25zLmF0IH0pLm15XG5cdCk7XG5cblx0Ly8gQ3JlYXRlIHRvb2x0aXAgZWxlbWVudFxuXHR0aGlzLnRvb2x0aXAgPSBlbGVtZW50cy50b29sdGlwID0gJCgnPGRpdi8+Jywge1xuXHRcdCdpZCc6IHRoaXMuX2lkLFxuXHRcdCdjbGFzcyc6IFsgTkFNRVNQQUNFLCBDTEFTU19ERUZBVUxULCBvcHRpb25zLnN0eWxlLmNsYXNzZXMsIGNhY2hlLnBvc0NsYXNzIF0uam9pbignICcpLFxuXHRcdCd3aWR0aCc6IG9wdGlvbnMuc3R5bGUud2lkdGggfHwgJycsXG5cdFx0J2hlaWdodCc6IG9wdGlvbnMuc3R5bGUuaGVpZ2h0IHx8ICcnLFxuXHRcdCd0cmFja2luZyc6IHBvc09wdGlvbnMudGFyZ2V0ID09PSAnbW91c2UnICYmIHBvc09wdGlvbnMuYWRqdXN0Lm1vdXNlLFxuXG5cdFx0LyogQVJJQSBzcGVjaWZpYyBhdHRyaWJ1dGVzICovXG5cdFx0J3JvbGUnOiAnYWxlcnQnLFxuXHRcdCdhcmlhLWxpdmUnOiAncG9saXRlJyxcblx0XHQnYXJpYS1hdG9taWMnOiBGQUxTRSxcblx0XHQnYXJpYS1kZXNjcmliZWRieSc6IHRoaXMuX2lkICsgJy1jb250ZW50Jyxcblx0XHQnYXJpYS1oaWRkZW4nOiBUUlVFXG5cdH0pXG5cdC50b2dnbGVDbGFzcyhDTEFTU19ESVNBQkxFRCwgdGhpcy5kaXNhYmxlZClcblx0LmF0dHIoQVRUUl9JRCwgdGhpcy5pZClcblx0LmRhdGEoTkFNRVNQQUNFLCB0aGlzKVxuXHQuYXBwZW5kVG8ocG9zT3B0aW9ucy5jb250YWluZXIpXG5cdC5hcHBlbmQoXG5cdFx0Ly8gQ3JlYXRlIGNvbnRlbnQgZWxlbWVudFxuXHRcdGVsZW1lbnRzLmNvbnRlbnQgPSAkKCc8ZGl2IC8+Jywge1xuXHRcdFx0J2NsYXNzJzogTkFNRVNQQUNFICsgJy1jb250ZW50Jyxcblx0XHRcdCdpZCc6IHRoaXMuX2lkICsgJy1jb250ZW50Jyxcblx0XHRcdCdhcmlhLWF0b21pYyc6IFRSVUVcblx0XHR9KVxuXHQpO1xuXG5cdC8vIFNldCByZW5kZXJlZCBmbGFnIGFuZCBwcmV2ZW50IHJlZHVuZGFudCByZXBvc2l0aW9uIGNhbGxzIGZvciBub3dcblx0dGhpcy5yZW5kZXJlZCA9IC0xO1xuXHR0aGlzLnBvc2l0aW9uaW5nID0gVFJVRTtcblxuXHQvLyBDcmVhdGUgdGl0bGUuLi5cblx0aWYodGl0bGUpIHtcblx0XHR0aGlzLl9jcmVhdGVUaXRsZSgpO1xuXG5cdFx0Ly8gVXBkYXRlIHRpdGxlIG9ubHkgaWYgaXRzIG5vdCBhIGNhbGxiYWNrIChjYWxsZWQgaW4gdG9nZ2xlIGlmIHNvKVxuXHRcdGlmKCEkLmlzRnVuY3Rpb24odGl0bGUpKSB7XG5cdFx0XHRkZWZlcnJlZHMucHVzaCggdGhpcy5fdXBkYXRlVGl0bGUodGl0bGUsIEZBTFNFKSApO1xuXHRcdH1cblx0fVxuXG5cdC8vIENyZWF0ZSBidXR0b25cblx0aWYoYnV0dG9uKSB7IHRoaXMuX2NyZWF0ZUJ1dHRvbigpOyB9XG5cblx0Ly8gU2V0IHByb3BlciByZW5kZXJlZCBmbGFnIGFuZCB1cGRhdGUgY29udGVudCBpZiBub3QgYSBjYWxsYmFjayBmdW5jdGlvbiAoY2FsbGVkIGluIHRvZ2dsZSlcblx0aWYoISQuaXNGdW5jdGlvbih0ZXh0KSkge1xuXHRcdGRlZmVycmVkcy5wdXNoKCB0aGlzLl91cGRhdGVDb250ZW50KHRleHQsIEZBTFNFKSApO1xuXHR9XG5cdHRoaXMucmVuZGVyZWQgPSBUUlVFO1xuXG5cdC8vIFNldHVwIHdpZGdldCBjbGFzc2VzXG5cdHRoaXMuX3NldFdpZGdldCgpO1xuXG5cdC8vIEluaXRpYWxpemUgJ3JlbmRlcicgcGx1Z2luc1xuXHQkLmVhY2goUExVR0lOUywgZnVuY3Rpb24obmFtZSkge1xuXHRcdHZhciBpbnN0YW5jZTtcblx0XHRpZih0aGlzLmluaXRpYWxpemUgPT09ICdyZW5kZXInICYmIChpbnN0YW5jZSA9IHRoaXMoc2VsZikpKSB7XG5cdFx0XHRzZWxmLnBsdWdpbnNbbmFtZV0gPSBpbnN0YW5jZTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIFVuYXNzaWduIGluaXRpYWwgZXZlbnRzIGFuZCBhc3NpZ24gcHJvcGVyIGV2ZW50c1xuXHR0aGlzLl91bmFzc2lnbkV2ZW50cygpO1xuXHR0aGlzLl9hc3NpZ25FdmVudHMoKTtcblxuXHQvLyBXaGVuIGRlZmVycmVkcyBoYXZlIGNvbXBsZXRlZFxuXHR0aGlzLl93aGVuKGRlZmVycmVkcykudGhlbihmdW5jdGlvbigpIHtcblx0XHQvLyB0b29sdGlwcmVuZGVyIGV2ZW50XG5cdFx0c2VsZi5fdHJpZ2dlcigncmVuZGVyJyk7XG5cblx0XHQvLyBSZXNldCBmbGFnc1xuXHRcdHNlbGYucG9zaXRpb25pbmcgPSBGQUxTRTtcblxuXHRcdC8vIFNob3cgdG9vbHRpcCBpZiBub3QgaGlkZGVuIGR1cmluZyB3YWl0IHBlcmlvZFxuXHRcdGlmKCFzZWxmLmhpZGRlbkR1cmluZ1dhaXQgJiYgKG9wdGlvbnMuc2hvdy5yZWFkeSB8fCBzaG93KSkge1xuXHRcdFx0c2VsZi50b2dnbGUoVFJVRSwgY2FjaGUuZXZlbnQsIEZBTFNFKTtcblx0XHR9XG5cdFx0c2VsZi5oaWRkZW5EdXJpbmdXYWl0ID0gRkFMU0U7XG5cdH0pO1xuXG5cdC8vIEV4cG9zZSBBUElcblx0UVRJUC5hcGlbdGhpcy5pZF0gPSB0aGlzO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuUFJPVE9UWVBFLmRlc3Ryb3kgPSBmdW5jdGlvbihpbW1lZGlhdGUpIHtcblx0Ly8gU2V0IGZsYWcgdGhlIHNpZ25pZnkgZGVzdHJveSBpcyB0YWtpbmcgcGxhY2UgdG8gcGx1Z2luc1xuXHQvLyBhbmQgZW5zdXJlIGl0IG9ubHkgZ2V0cyBkZXN0cm95ZWQgb25jZSFcblx0aWYodGhpcy5kZXN0cm95ZWQpIHsgcmV0dXJuIHRoaXMudGFyZ2V0OyB9XG5cblx0ZnVuY3Rpb24gcHJvY2VzcygpIHtcblx0XHRpZih0aGlzLmRlc3Ryb3llZCkgeyByZXR1cm47IH1cblx0XHR0aGlzLmRlc3Ryb3llZCA9IFRSVUU7XG5cblx0XHR2YXIgdGFyZ2V0ID0gdGhpcy50YXJnZXQsXG5cdFx0XHR0aXRsZSA9IHRhcmdldC5hdHRyKG9sZHRpdGxlKSxcblx0XHRcdHRpbWVyO1xuXG5cdFx0Ly8gRGVzdHJveSB0b29sdGlwIGlmIHJlbmRlcmVkXG5cdFx0aWYodGhpcy5yZW5kZXJlZCkge1xuXHRcdFx0dGhpcy50b29sdGlwLnN0b3AoMSwwKS5maW5kKCcqJykucmVtb3ZlKCkuZW5kKCkucmVtb3ZlKCk7XG5cdFx0fVxuXG5cdFx0Ly8gRGVzdHJveSBhbGwgcGx1Z2luc1xuXHRcdCQuZWFjaCh0aGlzLnBsdWdpbnMsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5kZXN0cm95ICYmIHRoaXMuZGVzdHJveSgpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQ2xlYXIgdGltZXJzXG5cdFx0Zm9yICh0aW1lciBpbiB0aGlzLnRpbWVycykge1xuXHRcdFx0aWYgKHRoaXMudGltZXJzLmhhc093blByb3BlcnR5KHRpbWVyKSkge1xuXHRcdFx0XHRjbGVhclRpbWVvdXQodGhpcy50aW1lcnNbdGltZXJdKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBSZW1vdmUgYXBpIG9iamVjdCBhbmQgQVJJQSBhdHRyaWJ1dGVzXG5cdFx0dGFyZ2V0LnJlbW92ZURhdGEoTkFNRVNQQUNFKVxuXHRcdFx0LnJlbW92ZUF0dHIoQVRUUl9JRClcblx0XHRcdC5yZW1vdmVBdHRyKEFUVFJfSEFTKVxuXHRcdFx0LnJlbW92ZUF0dHIoJ2FyaWEtZGVzY3JpYmVkYnknKTtcblxuXHRcdC8vIFJlc2V0IG9sZCB0aXRsZSBhdHRyaWJ1dGUgaWYgcmVtb3ZlZFxuXHRcdGlmKHRoaXMub3B0aW9ucy5zdXBwcmVzcyAmJiB0aXRsZSkge1xuXHRcdFx0dGFyZ2V0LmF0dHIoJ3RpdGxlJywgdGl0bGUpLnJlbW92ZUF0dHIob2xkdGl0bGUpO1xuXHRcdH1cblxuXHRcdC8vIFJlbW92ZSBxVGlwIGV2ZW50cyBhc3NvY2lhdGVkIHdpdGggdGhpcyBBUElcblx0XHR0aGlzLl91bmFzc2lnbkV2ZW50cygpO1xuXG5cdFx0Ly8gUmVtb3ZlIElEIGZyb20gdXNlZCBpZCBvYmplY3RzLCBhbmQgZGVsZXRlIG9iamVjdCByZWZlcmVuY2VzXG5cdFx0Ly8gZm9yIGJldHRlciBnYXJiYWdlIGNvbGxlY3Rpb24gYW5kIGxlYWsgcHJvdGVjdGlvblxuXHRcdHRoaXMub3B0aW9ucyA9IHRoaXMuZWxlbWVudHMgPSB0aGlzLmNhY2hlID0gdGhpcy50aW1lcnMgPVxuXHRcdFx0dGhpcy5wbHVnaW5zID0gdGhpcy5tb3VzZSA9IE5VTEw7XG5cblx0XHQvLyBEZWxldGUgZXBveHNlZCBBUEkgb2JqZWN0XG5cdFx0ZGVsZXRlIFFUSVAuYXBpW3RoaXMuaWRdO1xuXHR9XG5cblx0Ly8gSWYgYW4gaW1tZWRpYXRlIGRlc3Ryb3kgaXMgbmVlZGVkXG5cdGlmKChpbW1lZGlhdGUgIT09IFRSVUUgfHwgdGhpcy50cmlnZ2VyaW5nID09PSAnaGlkZScpICYmIHRoaXMucmVuZGVyZWQpIHtcblx0XHR0aGlzLnRvb2x0aXAub25lKCd0b29sdGlwaGlkZGVuJywgJC5wcm94eShwcm9jZXNzLCB0aGlzKSk7XG5cdFx0IXRoaXMudHJpZ2dlcmluZyAmJiB0aGlzLmhpZGUoKTtcblx0fVxuXG5cdC8vIElmIHdlJ3JlIG5vdCBpbiB0aGUgcHJvY2VzcyBvZiBoaWRpbmcuLi4gcHJvY2Vzc1xuXHRlbHNlIHsgcHJvY2Vzcy5jYWxsKHRoaXMpOyB9XG5cblx0cmV0dXJuIHRoaXMudGFyZ2V0O1xufTtcbjtmdW5jdGlvbiBpbnZhbGlkT3B0KGEpIHtcblx0cmV0dXJuIGEgPT09IE5VTEwgfHwgJC50eXBlKGEpICE9PSAnb2JqZWN0Jztcbn1cblxuZnVuY3Rpb24gaW52YWxpZENvbnRlbnQoYykge1xuXHRyZXR1cm4gISgkLmlzRnVuY3Rpb24oYykgfHwgXG4gICAgICAgICAgICBjICYmIGMuYXR0ciB8fCBcbiAgICAgICAgICAgIGMubGVuZ3RoIHx8IFxuICAgICAgICAgICAgJC50eXBlKGMpID09PSAnb2JqZWN0JyAmJiAoYy5qcXVlcnkgfHwgYy50aGVuKSk7XG59XG5cbi8vIE9wdGlvbiBvYmplY3Qgc2FuaXRpemVyXG5mdW5jdGlvbiBzYW5pdGl6ZU9wdGlvbnMob3B0cykge1xuXHR2YXIgY29udGVudCwgdGV4dCwgYWpheCwgb25jZTtcblxuXHRpZihpbnZhbGlkT3B0KG9wdHMpKSB7IHJldHVybiBGQUxTRTsgfVxuXG5cdGlmKGludmFsaWRPcHQob3B0cy5tZXRhZGF0YSkpIHtcblx0XHRvcHRzLm1ldGFkYXRhID0geyB0eXBlOiBvcHRzLm1ldGFkYXRhIH07XG5cdH1cblxuXHRpZignY29udGVudCcgaW4gb3B0cykge1xuXHRcdGNvbnRlbnQgPSBvcHRzLmNvbnRlbnQ7XG5cblx0XHRpZihpbnZhbGlkT3B0KGNvbnRlbnQpIHx8IGNvbnRlbnQuanF1ZXJ5IHx8IGNvbnRlbnQuZG9uZSkge1xuXHRcdFx0dGV4dCA9IGludmFsaWRDb250ZW50KGNvbnRlbnQpID8gRkFMU0UgOiBjb250ZW50O1xuXHRcdFx0Y29udGVudCA9IG9wdHMuY29udGVudCA9IHtcblx0XHRcdFx0dGV4dDogdGV4dFxuXHRcdFx0fTtcblx0XHR9XG5cdFx0ZWxzZSB7IHRleHQgPSBjb250ZW50LnRleHQ7IH1cblxuXHRcdC8vIERFUFJFQ0FURUQgLSBPbGQgY29udGVudC5hamF4IHBsdWdpbiBmdW5jdGlvbmFsaXR5XG5cdFx0Ly8gQ29udmVydHMgaXQgaW50byB0aGUgcHJvcGVyIERlZmVycmVkIHN5bnRheFxuXHRcdGlmKCdhamF4JyBpbiBjb250ZW50KSB7XG5cdFx0XHRhamF4ID0gY29udGVudC5hamF4O1xuXHRcdFx0b25jZSA9IGFqYXggJiYgYWpheC5vbmNlICE9PSBGQUxTRTtcblx0XHRcdGRlbGV0ZSBjb250ZW50LmFqYXg7XG5cblx0XHRcdGNvbnRlbnQudGV4dCA9IGZ1bmN0aW9uKGV2ZW50LCBhcGkpIHtcblx0XHRcdFx0dmFyIGxvYWRpbmcgPSB0ZXh0IHx8ICQodGhpcykuYXR0cihhcGkub3B0aW9ucy5jb250ZW50LmF0dHIpIHx8ICdMb2FkaW5nLi4uJyxcblxuXHRcdFx0XHRkZWZlcnJlZCA9ICQuYWpheChcblx0XHRcdFx0XHQkLmV4dGVuZCh7fSwgYWpheCwgeyBjb250ZXh0OiBhcGkgfSlcblx0XHRcdFx0KVxuXHRcdFx0XHQudGhlbihhamF4LnN1Y2Nlc3MsIE5VTEwsIGFqYXguZXJyb3IpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uKG5ld0NvbnRlbnQpIHtcblx0XHRcdFx0XHRpZihuZXdDb250ZW50ICYmIG9uY2UpIHsgYXBpLnNldCgnY29udGVudC50ZXh0JywgbmV3Q29udGVudCk7IH1cblx0XHRcdFx0XHRyZXR1cm4gbmV3Q29udGVudDtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZnVuY3Rpb24oeGhyLCBzdGF0dXMsIGVycm9yKSB7XG5cdFx0XHRcdFx0aWYoYXBpLmRlc3Ryb3llZCB8fCB4aHIuc3RhdHVzID09PSAwKSB7IHJldHVybjsgfVxuXHRcdFx0XHRcdGFwaS5zZXQoJ2NvbnRlbnQudGV4dCcsIHN0YXR1cyArICc6ICcgKyBlcnJvcik7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHJldHVybiAhb25jZSA/IChhcGkuc2V0KCdjb250ZW50LnRleHQnLCBsb2FkaW5nKSwgZGVmZXJyZWQpIDogbG9hZGluZztcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0aWYoJ3RpdGxlJyBpbiBjb250ZW50KSB7XG5cdFx0XHRpZigkLmlzUGxhaW5PYmplY3QoY29udGVudC50aXRsZSkpIHtcblx0XHRcdFx0Y29udGVudC5idXR0b24gPSBjb250ZW50LnRpdGxlLmJ1dHRvbjtcblx0XHRcdFx0Y29udGVudC50aXRsZSA9IGNvbnRlbnQudGl0bGUudGV4dDtcblx0XHRcdH1cblxuXHRcdFx0aWYoaW52YWxpZENvbnRlbnQoY29udGVudC50aXRsZSB8fCBGQUxTRSkpIHtcblx0XHRcdFx0Y29udGVudC50aXRsZSA9IEZBTFNFO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGlmKCdwb3NpdGlvbicgaW4gb3B0cyAmJiBpbnZhbGlkT3B0KG9wdHMucG9zaXRpb24pKSB7XG5cdFx0b3B0cy5wb3NpdGlvbiA9IHsgbXk6IG9wdHMucG9zaXRpb24sIGF0OiBvcHRzLnBvc2l0aW9uIH07XG5cdH1cblxuXHRpZignc2hvdycgaW4gb3B0cyAmJiBpbnZhbGlkT3B0KG9wdHMuc2hvdykpIHtcblx0XHRvcHRzLnNob3cgPSBvcHRzLnNob3cuanF1ZXJ5ID8geyB0YXJnZXQ6IG9wdHMuc2hvdyB9IDpcblx0XHRcdG9wdHMuc2hvdyA9PT0gVFJVRSA/IHsgcmVhZHk6IFRSVUUgfSA6IHsgZXZlbnQ6IG9wdHMuc2hvdyB9O1xuXHR9XG5cblx0aWYoJ2hpZGUnIGluIG9wdHMgJiYgaW52YWxpZE9wdChvcHRzLmhpZGUpKSB7XG5cdFx0b3B0cy5oaWRlID0gb3B0cy5oaWRlLmpxdWVyeSA/IHsgdGFyZ2V0OiBvcHRzLmhpZGUgfSA6IHsgZXZlbnQ6IG9wdHMuaGlkZSB9O1xuXHR9XG5cblx0aWYoJ3N0eWxlJyBpbiBvcHRzICYmIGludmFsaWRPcHQob3B0cy5zdHlsZSkpIHtcblx0XHRvcHRzLnN0eWxlID0geyBjbGFzc2VzOiBvcHRzLnN0eWxlIH07XG5cdH1cblxuXHQvLyBTYW5pdGl6ZSBwbHVnaW4gb3B0aW9uc1xuXHQkLmVhY2goUExVR0lOUywgZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zYW5pdGl6ZSAmJiB0aGlzLnNhbml0aXplKG9wdHMpO1xuXHR9KTtcblxuXHRyZXR1cm4gb3B0cztcbn1cblxuLy8gU2V0dXAgYnVpbHRpbiAuc2V0KCkgb3B0aW9uIGNoZWNrc1xuQ0hFQ0tTID0gUFJPVE9UWVBFLmNoZWNrcyA9IHtcblx0YnVpbHRpbjoge1xuXHRcdC8vIENvcmUgY2hlY2tzXG5cdFx0J15pZCQnOiBmdW5jdGlvbihvYmosIG8sIHYsIHByZXYpIHtcblx0XHRcdHZhciBpZCA9IHYgPT09IFRSVUUgPyBRVElQLm5leHRpZCA6IHYsXG5cdFx0XHRcdG5ld0lkID0gTkFNRVNQQUNFICsgJy0nICsgaWQ7XG5cblx0XHRcdGlmKGlkICE9PSBGQUxTRSAmJiBpZC5sZW5ndGggPiAwICYmICEkKCcjJytuZXdJZCkubGVuZ3RoKSB7XG5cdFx0XHRcdHRoaXMuX2lkID0gbmV3SWQ7XG5cblx0XHRcdFx0aWYodGhpcy5yZW5kZXJlZCkge1xuXHRcdFx0XHRcdHRoaXMudG9vbHRpcFswXS5pZCA9IHRoaXMuX2lkO1xuXHRcdFx0XHRcdHRoaXMuZWxlbWVudHMuY29udGVudFswXS5pZCA9IHRoaXMuX2lkICsgJy1jb250ZW50Jztcblx0XHRcdFx0XHR0aGlzLmVsZW1lbnRzLnRpdGxlWzBdLmlkID0gdGhpcy5faWQgKyAnLXRpdGxlJztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7IG9ialtvXSA9IHByZXY7IH1cblx0XHR9LFxuXHRcdCdecHJlcmVuZGVyJzogZnVuY3Rpb24ob2JqLCBvLCB2KSB7XG5cdFx0XHR2ICYmICF0aGlzLnJlbmRlcmVkICYmIHRoaXMucmVuZGVyKHRoaXMub3B0aW9ucy5zaG93LnJlYWR5KTtcblx0XHR9LFxuXG5cdFx0Ly8gQ29udGVudCBjaGVja3Ncblx0XHQnXmNvbnRlbnQudGV4dCQnOiBmdW5jdGlvbihvYmosIG8sIHYpIHtcblx0XHRcdHRoaXMuX3VwZGF0ZUNvbnRlbnQodik7XG5cdFx0fSxcblx0XHQnXmNvbnRlbnQuYXR0ciQnOiBmdW5jdGlvbihvYmosIG8sIHYsIHByZXYpIHtcblx0XHRcdGlmKHRoaXMub3B0aW9ucy5jb250ZW50LnRleHQgPT09IHRoaXMudGFyZ2V0LmF0dHIocHJldikpIHtcblx0XHRcdFx0dGhpcy5fdXBkYXRlQ29udGVudCggdGhpcy50YXJnZXQuYXR0cih2KSApO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0J15jb250ZW50LnRpdGxlJCc6IGZ1bmN0aW9uKG9iaiwgbywgdikge1xuXHRcdFx0Ly8gUmVtb3ZlIHRpdGxlIGlmIGNvbnRlbnQgaXMgbnVsbFxuXHRcdFx0aWYoIXYpIHsgcmV0dXJuIHRoaXMuX3JlbW92ZVRpdGxlKCk7IH1cblxuXHRcdFx0Ly8gSWYgdGl0bGUgaXNuJ3QgYWxyZWFkeSBjcmVhdGVkLCBjcmVhdGUgaXQgbm93IGFuZCB1cGRhdGVcblx0XHRcdHYgJiYgIXRoaXMuZWxlbWVudHMudGl0bGUgJiYgdGhpcy5fY3JlYXRlVGl0bGUoKTtcblx0XHRcdHRoaXMuX3VwZGF0ZVRpdGxlKHYpO1xuXHRcdH0sXG5cdFx0J15jb250ZW50LmJ1dHRvbiQnOiBmdW5jdGlvbihvYmosIG8sIHYpIHtcblx0XHRcdHRoaXMuX3VwZGF0ZUJ1dHRvbih2KTtcblx0XHR9LFxuXHRcdCdeY29udGVudC50aXRsZS4odGV4dHxidXR0b24pJCc6IGZ1bmN0aW9uKG9iaiwgbywgdikge1xuXHRcdFx0dGhpcy5zZXQoJ2NvbnRlbnQuJytvLCB2KTsgLy8gQmFja3dhcmRzIHRpdGxlLnRleHQvYnV0dG9uIGNvbXBhdFxuXHRcdH0sXG5cblx0XHQvLyBQb3NpdGlvbiBjaGVja3Ncblx0XHQnXnBvc2l0aW9uLihteXxhdCkkJzogZnVuY3Rpb24ob2JqLCBvLCB2KXtcblx0XHRcdGlmKCdzdHJpbmcnID09PSB0eXBlb2Ygdikge1xuXHRcdFx0XHR0aGlzLnBvc2l0aW9uW29dID0gb2JqW29dID0gbmV3IENPUk5FUih2LCBvID09PSAnYXQnKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdCdecG9zaXRpb24uY29udGFpbmVyJCc6IGZ1bmN0aW9uKG9iaiwgbywgdil7XG5cdFx0XHR0aGlzLnJlbmRlcmVkICYmIHRoaXMudG9vbHRpcC5hcHBlbmRUbyh2KTtcblx0XHR9LFxuXG5cdFx0Ly8gU2hvdyBjaGVja3Ncblx0XHQnXnNob3cucmVhZHkkJzogZnVuY3Rpb24ob2JqLCBvLCB2KSB7XG5cdFx0XHR2ICYmICghdGhpcy5yZW5kZXJlZCAmJiB0aGlzLnJlbmRlcihUUlVFKSB8fCB0aGlzLnRvZ2dsZShUUlVFKSk7XG5cdFx0fSxcblxuXHRcdC8vIFN0eWxlIGNoZWNrc1xuXHRcdCdec3R5bGUuY2xhc3NlcyQnOiBmdW5jdGlvbihvYmosIG8sIHYsIHApIHtcblx0XHRcdHRoaXMucmVuZGVyZWQgJiYgdGhpcy50b29sdGlwLnJlbW92ZUNsYXNzKHApLmFkZENsYXNzKHYpO1xuXHRcdH0sXG5cdFx0J15zdHlsZS4od2lkdGh8aGVpZ2h0KSc6IGZ1bmN0aW9uKG9iaiwgbywgdikge1xuXHRcdFx0dGhpcy5yZW5kZXJlZCAmJiB0aGlzLnRvb2x0aXAuY3NzKG8sIHYpO1xuXHRcdH0sXG5cdFx0J15zdHlsZS53aWRnZXR8Y29udGVudC50aXRsZSc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5yZW5kZXJlZCAmJiB0aGlzLl9zZXRXaWRnZXQoKTtcblx0XHR9LFxuXHRcdCdec3R5bGUuZGVmJzogZnVuY3Rpb24ob2JqLCBvLCB2KSB7XG5cdFx0XHR0aGlzLnJlbmRlcmVkICYmIHRoaXMudG9vbHRpcC50b2dnbGVDbGFzcyhDTEFTU19ERUZBVUxULCAhIXYpO1xuXHRcdH0sXG5cblx0XHQvLyBFdmVudHMgY2hlY2tcblx0XHQnXmV2ZW50cy4ocmVuZGVyfHNob3d8bW92ZXxoaWRlfGZvY3VzfGJsdXIpJCc6IGZ1bmN0aW9uKG9iaiwgbywgdikge1xuXHRcdFx0dGhpcy5yZW5kZXJlZCAmJiB0aGlzLnRvb2x0aXBbKCQuaXNGdW5jdGlvbih2KSA/ICcnIDogJ3VuJykgKyAnYmluZCddKCd0b29sdGlwJytvLCB2KTtcblx0XHR9LFxuXG5cdFx0Ly8gUHJvcGVydGllcyB3aGljaCByZXF1aXJlIGV2ZW50IHJlYXNzaWdubWVudFxuXHRcdCdeKHNob3d8aGlkZXxwb3NpdGlvbikuKGV2ZW50fHRhcmdldHxmaXhlZHxpbmFjdGl2ZXxsZWF2ZXxkaXN0YW5jZXx2aWV3cG9ydHxhZGp1c3QpJzogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZighdGhpcy5yZW5kZXJlZCkgeyByZXR1cm47IH1cblxuXHRcdFx0Ly8gU2V0IHRyYWNraW5nIGZsYWdcblx0XHRcdHZhciBwb3NPcHRpb25zID0gdGhpcy5vcHRpb25zLnBvc2l0aW9uO1xuXHRcdFx0dGhpcy50b29sdGlwLmF0dHIoJ3RyYWNraW5nJywgcG9zT3B0aW9ucy50YXJnZXQgPT09ICdtb3VzZScgJiYgcG9zT3B0aW9ucy5hZGp1c3QubW91c2UpO1xuXG5cdFx0XHQvLyBSZWFzc2lnbiBldmVudHNcblx0XHRcdHRoaXMuX3VuYXNzaWduRXZlbnRzKCk7XG5cdFx0XHR0aGlzLl9hc3NpZ25FdmVudHMoKTtcblx0XHR9XG5cdH1cbn07XG5cbi8vIERvdCBub3RhdGlvbiBjb252ZXJ0ZXJcbmZ1bmN0aW9uIGNvbnZlcnROb3RhdGlvbihvcHRpb25zLCBub3RhdGlvbikge1xuXHR2YXIgaSA9IDAsIG9iaiwgb3B0aW9uID0gb3B0aW9ucyxcblxuXHQvLyBTcGxpdCBub3RhdGlvbiBpbnRvIGFycmF5XG5cdGxldmVscyA9IG5vdGF0aW9uLnNwbGl0KCcuJyk7XG5cblx0Ly8gTG9vcCB0aHJvdWdoXG5cdHdoaWxlKG9wdGlvbiA9IG9wdGlvblsgbGV2ZWxzW2krK10gXSkge1xuXHRcdGlmKGkgPCBsZXZlbHMubGVuZ3RoKSB7IG9iaiA9IG9wdGlvbjsgfVxuXHR9XG5cblx0cmV0dXJuIFtvYmogfHwgb3B0aW9ucywgbGV2ZWxzLnBvcCgpXTtcbn1cblxuUFJPVE9UWVBFLmdldCA9IGZ1bmN0aW9uKG5vdGF0aW9uKSB7XG5cdGlmKHRoaXMuZGVzdHJveWVkKSB7IHJldHVybiB0aGlzOyB9XG5cblx0dmFyIG8gPSBjb252ZXJ0Tm90YXRpb24odGhpcy5vcHRpb25zLCBub3RhdGlvbi50b0xvd2VyQ2FzZSgpKSxcblx0XHRyZXN1bHQgPSBvWzBdWyBvWzFdIF07XG5cblx0cmV0dXJuIHJlc3VsdC5wcmVjZWRhbmNlID8gcmVzdWx0LnN0cmluZygpIDogcmVzdWx0O1xufTtcblxuZnVuY3Rpb24gc2V0Q2FsbGJhY2sobm90YXRpb24sIGFyZ3MpIHtcblx0dmFyIGNhdGVnb3J5LCBydWxlLCBtYXRjaDtcblxuXHRmb3IoY2F0ZWdvcnkgaW4gdGhpcy5jaGVja3MpIHtcblx0XHRpZiAoIXRoaXMuY2hlY2tzLmhhc093blByb3BlcnR5KGNhdGVnb3J5KSkgeyBjb250aW51ZTsgfVxuXG5cdFx0Zm9yKHJ1bGUgaW4gdGhpcy5jaGVja3NbY2F0ZWdvcnldKSB7XG5cdFx0XHRpZiAoIXRoaXMuY2hlY2tzW2NhdGVnb3J5XS5oYXNPd25Qcm9wZXJ0eShydWxlKSkgeyBjb250aW51ZTsgfVxuXG5cdFx0XHRpZihtYXRjaCA9IChuZXcgUmVnRXhwKHJ1bGUsICdpJykpLmV4ZWMobm90YXRpb24pKSB7XG5cdFx0XHRcdGFyZ3MucHVzaChtYXRjaCk7XG5cblx0XHRcdFx0aWYoY2F0ZWdvcnkgPT09ICdidWlsdGluJyB8fCB0aGlzLnBsdWdpbnNbY2F0ZWdvcnldKSB7XG5cdFx0XHRcdFx0dGhpcy5jaGVja3NbY2F0ZWdvcnldW3J1bGVdLmFwcGx5KFxuXHRcdFx0XHRcdFx0dGhpcy5wbHVnaW5zW2NhdGVnb3J5XSB8fCB0aGlzLCBhcmdzXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG52YXIgcm1vdmUgPSAvXnBvc2l0aW9uXFwuKG15fGF0fGFkanVzdHx0YXJnZXR8Y29udGFpbmVyfHZpZXdwb3J0KXxzdHlsZXxjb250ZW50fHNob3dcXC5yZWFkeS9pLFxuXHRycmVuZGVyID0gL15wcmVyZW5kZXJ8c2hvd1xcLnJlYWR5L2k7XG5cblBST1RPVFlQRS5zZXQgPSBmdW5jdGlvbihvcHRpb24sIHZhbHVlKSB7XG5cdGlmKHRoaXMuZGVzdHJveWVkKSB7IHJldHVybiB0aGlzOyB9XG5cblx0dmFyIHJlbmRlcmVkID0gdGhpcy5yZW5kZXJlZCxcblx0XHRyZXBvc2l0aW9uID0gRkFMU0UsXG5cdFx0b3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcblx0XHRuYW1lO1xuXG5cdC8vIENvbnZlcnQgc2luZ3VsYXIgb3B0aW9uL3ZhbHVlIHBhaXIgaW50byBvYmplY3QgZm9ybVxuXHRpZignc3RyaW5nJyA9PT0gdHlwZW9mIG9wdGlvbikge1xuXHRcdG5hbWUgPSBvcHRpb247IG9wdGlvbiA9IHt9OyBvcHRpb25bbmFtZV0gPSB2YWx1ZTtcblx0fVxuXHRlbHNlIHsgb3B0aW9uID0gJC5leHRlbmQoe30sIG9wdGlvbik7IH1cblxuXHQvLyBTZXQgYWxsIG9mIHRoZSBkZWZpbmVkIG9wdGlvbnMgdG8gdGhlaXIgbmV3IHZhbHVlc1xuXHQkLmVhY2gob3B0aW9uLCBmdW5jdGlvbihub3RhdGlvbiwgdmFsKSB7XG5cdFx0aWYocmVuZGVyZWQgJiYgcnJlbmRlci50ZXN0KG5vdGF0aW9uKSkge1xuXHRcdFx0ZGVsZXRlIG9wdGlvbltub3RhdGlvbl07IHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBTZXQgbmV3IG9iaiB2YWx1ZVxuXHRcdHZhciBvYmogPSBjb252ZXJ0Tm90YXRpb24ob3B0aW9ucywgbm90YXRpb24udG9Mb3dlckNhc2UoKSksIHByZXZpb3VzO1xuXHRcdHByZXZpb3VzID0gb2JqWzBdWyBvYmpbMV0gXTtcblx0XHRvYmpbMF1bIG9ialsxXSBdID0gdmFsICYmIHZhbC5ub2RlVHlwZSA/ICQodmFsKSA6IHZhbDtcblxuXHRcdC8vIEFsc28gY2hlY2sgaWYgd2UgbmVlZCB0byByZXBvc2l0aW9uXG5cdFx0cmVwb3NpdGlvbiA9IHJtb3ZlLnRlc3Qobm90YXRpb24pIHx8IHJlcG9zaXRpb247XG5cblx0XHQvLyBTZXQgdGhlIG5ldyBwYXJhbXMgZm9yIHRoZSBjYWxsYmFja1xuXHRcdG9wdGlvbltub3RhdGlvbl0gPSBbb2JqWzBdLCBvYmpbMV0sIHZhbCwgcHJldmlvdXNdO1xuXHR9KTtcblxuXHQvLyBSZS1zYW5pdGl6ZSBvcHRpb25zXG5cdHNhbml0aXplT3B0aW9ucyhvcHRpb25zKTtcblxuXHQvKlxuXHQgKiBFeGVjdXRlIGFueSB2YWxpZCBjYWxsYmFja3MgZm9yIHRoZSBzZXQgb3B0aW9uc1xuXHQgKiBBbHNvIHNldCBwb3NpdGlvbmluZyBmbGFnIHNvIHdlIGRvbid0IGdldCBsb2FkcyBvZiByZWR1bmRhbnQgcmVwb3NpdGlvbmluZyBjYWxscy5cblx0ICovXG5cdHRoaXMucG9zaXRpb25pbmcgPSBUUlVFO1xuXHQkLmVhY2gob3B0aW9uLCAkLnByb3h5KHNldENhbGxiYWNrLCB0aGlzKSk7XG5cdHRoaXMucG9zaXRpb25pbmcgPSBGQUxTRTtcblxuXHQvLyBVcGRhdGUgcG9zaXRpb24gaWYgbmVlZGVkXG5cdGlmKHRoaXMucmVuZGVyZWQgJiYgdGhpcy50b29sdGlwWzBdLm9mZnNldFdpZHRoID4gMCAmJiByZXBvc2l0aW9uKSB7XG5cdFx0dGhpcy5yZXBvc2l0aW9uKCBvcHRpb25zLnBvc2l0aW9uLnRhcmdldCA9PT0gJ21vdXNlJyA/IE5VTEwgOiB0aGlzLmNhY2hlLmV2ZW50ICk7XG5cdH1cblxuXHRyZXR1cm4gdGhpcztcbn07XG47UFJPVE9UWVBFLl91cGRhdGUgPSBmdW5jdGlvbihjb250ZW50LCBlbGVtZW50KSB7XG5cdHZhciBzZWxmID0gdGhpcyxcblx0XHRjYWNoZSA9IHRoaXMuY2FjaGU7XG5cblx0Ly8gTWFrZSBzdXJlIHRvb2x0aXAgaXMgcmVuZGVyZWQgYW5kIGNvbnRlbnQgaXMgZGVmaW5lZC4gSWYgbm90IHJldHVyblxuXHRpZighdGhpcy5yZW5kZXJlZCB8fCAhY29udGVudCkgeyByZXR1cm4gRkFMU0U7IH1cblxuXHQvLyBVc2UgZnVuY3Rpb24gdG8gcGFyc2UgY29udGVudFxuXHRpZigkLmlzRnVuY3Rpb24oY29udGVudCkpIHtcblx0XHRjb250ZW50ID0gY29udGVudC5jYWxsKHRoaXMuZWxlbWVudHMudGFyZ2V0LCBjYWNoZS5ldmVudCwgdGhpcykgfHwgJyc7XG5cdH1cblxuXHQvLyBIYW5kbGUgZGVmZXJyZWQgY29udGVudFxuXHRpZigkLmlzRnVuY3Rpb24oY29udGVudC50aGVuKSkge1xuXHRcdGNhY2hlLndhaXRpbmcgPSBUUlVFO1xuXHRcdHJldHVybiBjb250ZW50LnRoZW4oZnVuY3Rpb24oYykge1xuXHRcdFx0Y2FjaGUud2FpdGluZyA9IEZBTFNFO1xuXHRcdFx0cmV0dXJuIHNlbGYuX3VwZGF0ZShjLCBlbGVtZW50KTtcblx0XHR9LCBOVUxMLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRyZXR1cm4gc2VsZi5fdXBkYXRlKGUsIGVsZW1lbnQpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gSWYgY29udGVudCBpcyBudWxsLi4uIHJldHVybiBmYWxzZVxuXHRpZihjb250ZW50ID09PSBGQUxTRSB8fCAhY29udGVudCAmJiBjb250ZW50ICE9PSAnJykgeyByZXR1cm4gRkFMU0U7IH1cblxuXHQvLyBBcHBlbmQgbmV3IGNvbnRlbnQgaWYgaXRzIGEgRE9NIGFycmF5IGFuZCBzaG93IGl0IGlmIGhpZGRlblxuXHRpZihjb250ZW50LmpxdWVyeSAmJiBjb250ZW50Lmxlbmd0aCA+IDApIHtcblx0XHRlbGVtZW50LmVtcHR5KCkuYXBwZW5kKFxuXHRcdFx0Y29udGVudC5jc3MoeyBkaXNwbGF5OiAnYmxvY2snLCB2aXNpYmlsaXR5OiAndmlzaWJsZScgfSlcblx0XHQpO1xuXHR9XG5cblx0Ly8gQ29udGVudCBpcyBhIHJlZ3VsYXIgc3RyaW5nLCBpbnNlcnQgdGhlIG5ldyBjb250ZW50XG5cdGVsc2UgeyBlbGVtZW50Lmh0bWwoY29udGVudCk7IH1cblxuXHQvLyBXYWl0IGZvciBjb250ZW50IHRvIGJlIGxvYWRlZCwgYW5kIHJlcG9zaXRpb25cblx0cmV0dXJuIHRoaXMuX3dhaXRGb3JDb250ZW50KGVsZW1lbnQpLnRoZW4oZnVuY3Rpb24oaW1hZ2VzKSB7XG5cdFx0aWYoc2VsZi5yZW5kZXJlZCAmJiBzZWxmLnRvb2x0aXBbMF0ub2Zmc2V0V2lkdGggPiAwKSB7XG5cdFx0XHRzZWxmLnJlcG9zaXRpb24oY2FjaGUuZXZlbnQsICFpbWFnZXMubGVuZ3RoKTtcblx0XHR9XG5cdH0pO1xufTtcblxuUFJPVE9UWVBFLl93YWl0Rm9yQ29udGVudCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcblx0dmFyIGNhY2hlID0gdGhpcy5jYWNoZTtcblxuXHQvLyBTZXQgZmxhZ1xuXHRjYWNoZS53YWl0aW5nID0gVFJVRTtcblxuXHQvLyBJZiBpbWFnZXNMb2FkZWQgaXMgaW5jbHVkZWQsIGVuc3VyZSBpbWFnZXMgaGF2ZSBsb2FkZWQgYW5kIHJldHVybiBwcm9taXNlXG5cdHJldHVybiAoICQuZm4uaW1hZ2VzTG9hZGVkID8gZWxlbWVudC5pbWFnZXNMb2FkZWQoKSA6IG5ldyAkLkRlZmVycmVkKCkucmVzb2x2ZShbXSkgKVxuXHRcdC5kb25lKGZ1bmN0aW9uKCkgeyBjYWNoZS53YWl0aW5nID0gRkFMU0U7IH0pXG5cdFx0LnByb21pc2UoKTtcbn07XG5cblBST1RPVFlQRS5fdXBkYXRlQ29udGVudCA9IGZ1bmN0aW9uKGNvbnRlbnQsIHJlcG9zaXRpb24pIHtcblx0dGhpcy5fdXBkYXRlKGNvbnRlbnQsIHRoaXMuZWxlbWVudHMuY29udGVudCwgcmVwb3NpdGlvbik7XG59O1xuXG5QUk9UT1RZUEUuX3VwZGF0ZVRpdGxlID0gZnVuY3Rpb24oY29udGVudCwgcmVwb3NpdGlvbikge1xuXHRpZih0aGlzLl91cGRhdGUoY29udGVudCwgdGhpcy5lbGVtZW50cy50aXRsZSwgcmVwb3NpdGlvbikgPT09IEZBTFNFKSB7XG5cdFx0dGhpcy5fcmVtb3ZlVGl0bGUoRkFMU0UpO1xuXHR9XG59O1xuXG5QUk9UT1RZUEUuX2NyZWF0ZVRpdGxlID0gZnVuY3Rpb24oKVxue1xuXHR2YXIgZWxlbWVudHMgPSB0aGlzLmVsZW1lbnRzLFxuXHRcdGlkID0gdGhpcy5faWQrJy10aXRsZSc7XG5cblx0Ly8gRGVzdHJveSBwcmV2aW91cyB0aXRsZSBlbGVtZW50LCBpZiBwcmVzZW50XG5cdGlmKGVsZW1lbnRzLnRpdGxlYmFyKSB7IHRoaXMuX3JlbW92ZVRpdGxlKCk7IH1cblxuXHQvLyBDcmVhdGUgdGl0bGUgYmFyIGFuZCB0aXRsZSBlbGVtZW50c1xuXHRlbGVtZW50cy50aXRsZWJhciA9ICQoJzxkaXYgLz4nLCB7XG5cdFx0J2NsYXNzJzogTkFNRVNQQUNFICsgJy10aXRsZWJhciAnICsgKHRoaXMub3B0aW9ucy5zdHlsZS53aWRnZXQgPyBjcmVhdGVXaWRnZXRDbGFzcygnaGVhZGVyJykgOiAnJylcblx0fSlcblx0LmFwcGVuZChcblx0XHRlbGVtZW50cy50aXRsZSA9ICQoJzxkaXYgLz4nLCB7XG5cdFx0XHQnaWQnOiBpZCxcblx0XHRcdCdjbGFzcyc6IE5BTUVTUEFDRSArICctdGl0bGUnLFxuXHRcdFx0J2FyaWEtYXRvbWljJzogVFJVRVxuXHRcdH0pXG5cdClcblx0Lmluc2VydEJlZm9yZShlbGVtZW50cy5jb250ZW50KVxuXG5cdC8vIEJ1dHRvbi1zcGVjaWZpYyBldmVudHNcblx0LmRlbGVnYXRlKCcucXRpcC1jbG9zZScsICdtb3VzZWRvd24ga2V5ZG93biBtb3VzZXVwIGtleXVwIG1vdXNlb3V0JywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHQkKHRoaXMpLnRvZ2dsZUNsYXNzKCd1aS1zdGF0ZS1hY3RpdmUgdWktc3RhdGUtZm9jdXMnLCBldmVudC50eXBlLnN1YnN0cigtNCkgPT09ICdkb3duJyk7XG5cdH0pXG5cdC5kZWxlZ2F0ZSgnLnF0aXAtY2xvc2UnLCAnbW91c2VvdmVyIG1vdXNlb3V0JywgZnVuY3Rpb24oZXZlbnQpe1xuXHRcdCQodGhpcykudG9nZ2xlQ2xhc3MoJ3VpLXN0YXRlLWhvdmVyJywgZXZlbnQudHlwZSA9PT0gJ21vdXNlb3ZlcicpO1xuXHR9KTtcblxuXHQvLyBDcmVhdGUgYnV0dG9uIGlmIGVuYWJsZWRcblx0aWYodGhpcy5vcHRpb25zLmNvbnRlbnQuYnV0dG9uKSB7IHRoaXMuX2NyZWF0ZUJ1dHRvbigpOyB9XG59O1xuXG5QUk9UT1RZUEUuX3JlbW92ZVRpdGxlID0gZnVuY3Rpb24ocmVwb3NpdGlvbilcbntcblx0dmFyIGVsZW1lbnRzID0gdGhpcy5lbGVtZW50cztcblxuXHRpZihlbGVtZW50cy50aXRsZSkge1xuXHRcdGVsZW1lbnRzLnRpdGxlYmFyLnJlbW92ZSgpO1xuXHRcdGVsZW1lbnRzLnRpdGxlYmFyID0gZWxlbWVudHMudGl0bGUgPSBlbGVtZW50cy5idXR0b24gPSBOVUxMO1xuXG5cdFx0Ly8gUmVwb3NpdGlvbiBpZiBlbmFibGVkXG5cdFx0aWYocmVwb3NpdGlvbiAhPT0gRkFMU0UpIHsgdGhpcy5yZXBvc2l0aW9uKCk7IH1cblx0fVxufTtcbjtQUk9UT1RZUEUuX2NyZWF0ZVBvc0NsYXNzID0gZnVuY3Rpb24obXkpIHtcblx0cmV0dXJuIE5BTUVTUEFDRSArICctcG9zLScgKyAobXkgfHwgdGhpcy5vcHRpb25zLnBvc2l0aW9uLm15KS5hYmJyZXYoKTtcbn07XG5cblBST1RPVFlQRS5yZXBvc2l0aW9uID0gZnVuY3Rpb24oZXZlbnQsIGVmZmVjdCkge1xuXHRpZighdGhpcy5yZW5kZXJlZCB8fCB0aGlzLnBvc2l0aW9uaW5nIHx8IHRoaXMuZGVzdHJveWVkKSB7IHJldHVybiB0aGlzOyB9XG5cblx0Ly8gU2V0IHBvc2l0aW9uaW5nIGZsYWdcblx0dGhpcy5wb3NpdGlvbmluZyA9IFRSVUU7XG5cblx0dmFyIGNhY2hlID0gdGhpcy5jYWNoZSxcblx0XHR0b29sdGlwID0gdGhpcy50b29sdGlwLFxuXHRcdHBvc09wdGlvbnMgPSB0aGlzLm9wdGlvbnMucG9zaXRpb24sXG5cdFx0dGFyZ2V0ID0gcG9zT3B0aW9ucy50YXJnZXQsXG5cdFx0bXkgPSBwb3NPcHRpb25zLm15LFxuXHRcdGF0ID0gcG9zT3B0aW9ucy5hdCxcblx0XHR2aWV3cG9ydCA9IHBvc09wdGlvbnMudmlld3BvcnQsXG5cdFx0Y29udGFpbmVyID0gcG9zT3B0aW9ucy5jb250YWluZXIsXG5cdFx0YWRqdXN0ID0gcG9zT3B0aW9ucy5hZGp1c3QsXG5cdFx0bWV0aG9kID0gYWRqdXN0Lm1ldGhvZC5zcGxpdCgnICcpLFxuXHRcdHRvb2x0aXBXaWR0aCA9IHRvb2x0aXAub3V0ZXJXaWR0aChGQUxTRSksXG5cdFx0dG9vbHRpcEhlaWdodCA9IHRvb2x0aXAub3V0ZXJIZWlnaHQoRkFMU0UpLFxuXHRcdHRhcmdldFdpZHRoID0gMCxcblx0XHR0YXJnZXRIZWlnaHQgPSAwLFxuXHRcdHR5cGUgPSB0b29sdGlwLmNzcygncG9zaXRpb24nKSxcblx0XHRwb3NpdGlvbiA9IHsgbGVmdDogMCwgdG9wOiAwIH0sXG5cdFx0dmlzaWJsZSA9IHRvb2x0aXBbMF0ub2Zmc2V0V2lkdGggPiAwLFxuXHRcdGlzU2Nyb2xsID0gZXZlbnQgJiYgZXZlbnQudHlwZSA9PT0gJ3Njcm9sbCcsXG5cdFx0d2luID0gJCh3aW5kb3cpLFxuXHRcdGRvYyA9IGNvbnRhaW5lclswXS5vd25lckRvY3VtZW50LFxuXHRcdG1vdXNlID0gdGhpcy5tb3VzZSxcblx0XHRwbHVnaW5DYWxjdWxhdGlvbnMsIG9mZnNldCwgYWRqdXN0ZWQsIG5ld0NsYXNzO1xuXG5cdC8vIENoZWNrIGlmIGFic29sdXRlIHBvc2l0aW9uIHdhcyBwYXNzZWRcblx0aWYoJC5pc0FycmF5KHRhcmdldCkgJiYgdGFyZ2V0Lmxlbmd0aCA9PT0gMikge1xuXHRcdC8vIEZvcmNlIGxlZnQgdG9wIGFuZCBzZXQgcG9zaXRpb25cblx0XHRhdCA9IHsgeDogTEVGVCwgeTogVE9QIH07XG5cdFx0cG9zaXRpb24gPSB7IGxlZnQ6IHRhcmdldFswXSwgdG9wOiB0YXJnZXRbMV0gfTtcblx0fVxuXG5cdC8vIENoZWNrIGlmIG1vdXNlIHdhcyB0aGUgdGFyZ2V0XG5cdGVsc2UgaWYodGFyZ2V0ID09PSAnbW91c2UnKSB7XG5cdFx0Ly8gRm9yY2UgbGVmdCB0b3AgdG8gYWxsb3cgZmxpcHBpbmdcblx0XHRhdCA9IHsgeDogTEVGVCwgeTogVE9QIH07XG5cblx0XHQvLyBVc2UgdGhlIG1vdXNlIG9yaWdpbiB0aGF0IGNhdXNlZCB0aGUgc2hvdyBldmVudCwgaWYgZGlzdGFuY2UgaGlkaW5nIGlzIGVuYWJsZWRcblx0XHRpZigoIWFkanVzdC5tb3VzZSB8fCB0aGlzLm9wdGlvbnMuaGlkZS5kaXN0YW5jZSkgJiYgY2FjaGUub3JpZ2luICYmIGNhY2hlLm9yaWdpbi5wYWdlWCkge1xuXHRcdFx0ZXZlbnQgPSAgY2FjaGUub3JpZ2luO1xuXHRcdH1cblxuXHRcdC8vIFVzZSBjYWNoZWQgZXZlbnQgZm9yIHJlc2l6ZS9zY3JvbGwgZXZlbnRzXG5cdFx0ZWxzZSBpZighZXZlbnQgfHwgZXZlbnQgJiYgKGV2ZW50LnR5cGUgPT09ICdyZXNpemUnIHx8IGV2ZW50LnR5cGUgPT09ICdzY3JvbGwnKSkge1xuXHRcdFx0ZXZlbnQgPSBjYWNoZS5ldmVudDtcblx0XHR9XG5cblx0XHQvLyBPdGhlcndpc2UsIHVzZSB0aGUgY2FjaGVkIG1vdXNlIGNvb3JkaW5hdGVzIGlmIGF2YWlsYWJsZVxuXHRcdGVsc2UgaWYobW91c2UgJiYgbW91c2UucGFnZVgpIHtcblx0XHRcdGV2ZW50ID0gbW91c2U7XG5cdFx0fVxuXG5cdFx0Ly8gQ2FsY3VsYXRlIGJvZHkgYW5kIGNvbnRhaW5lciBvZmZzZXQgYW5kIHRha2UgdGhlbSBpbnRvIGFjY291bnQgYmVsb3dcblx0XHRpZih0eXBlICE9PSAnc3RhdGljJykgeyBwb3NpdGlvbiA9IGNvbnRhaW5lci5vZmZzZXQoKTsgfVxuXHRcdGlmKGRvYy5ib2R5Lm9mZnNldFdpZHRoICE9PSAod2luZG93LmlubmVyV2lkdGggfHwgZG9jLmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCkpIHtcblx0XHRcdG9mZnNldCA9ICQoZG9jdW1lbnQuYm9keSkub2Zmc2V0KCk7XG5cdFx0fVxuXG5cdFx0Ly8gVXNlIGV2ZW50IGNvb3JkaW5hdGVzIGZvciBwb3NpdGlvblxuXHRcdHBvc2l0aW9uID0ge1xuXHRcdFx0bGVmdDogZXZlbnQucGFnZVggLSBwb3NpdGlvbi5sZWZ0ICsgKG9mZnNldCAmJiBvZmZzZXQubGVmdCB8fCAwKSxcblx0XHRcdHRvcDogZXZlbnQucGFnZVkgLSBwb3NpdGlvbi50b3AgKyAob2Zmc2V0ICYmIG9mZnNldC50b3AgfHwgMClcblx0XHR9O1xuXG5cdFx0Ly8gU2Nyb2xsIGV2ZW50cyBhcmUgYSBwYWluLCBzb21lIGJyb3dzZXJzXG5cdFx0aWYoYWRqdXN0Lm1vdXNlICYmIGlzU2Nyb2xsICYmIG1vdXNlKSB7XG5cdFx0XHRwb3NpdGlvbi5sZWZ0IC09IChtb3VzZS5zY3JvbGxYIHx8IDApIC0gd2luLnNjcm9sbExlZnQoKTtcblx0XHRcdHBvc2l0aW9uLnRvcCAtPSAobW91c2Uuc2Nyb2xsWSB8fCAwKSAtIHdpbi5zY3JvbGxUb3AoKTtcblx0XHR9XG5cdH1cblxuXHQvLyBUYXJnZXQgd2Fzbid0IG1vdXNlIG9yIGFic29sdXRlLi4uXG5cdGVsc2Uge1xuXHRcdC8vIENoZWNrIGlmIGV2ZW50IHRhcmdldHRpbmcgaXMgYmVpbmcgdXNlZFxuXHRcdGlmKHRhcmdldCA9PT0gJ2V2ZW50Jykge1xuXHRcdFx0aWYoZXZlbnQgJiYgZXZlbnQudGFyZ2V0ICYmIGV2ZW50LnR5cGUgIT09ICdzY3JvbGwnICYmIGV2ZW50LnR5cGUgIT09ICdyZXNpemUnKSB7XG5cdFx0XHRcdGNhY2hlLnRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYoIWV2ZW50LnRhcmdldCkge1xuXHRcdFx0XHRjYWNoZS50YXJnZXQgPSB0aGlzLmVsZW1lbnRzLnRhcmdldDtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBpZih0YXJnZXQgIT09ICdldmVudCcpe1xuXHRcdFx0Y2FjaGUudGFyZ2V0ID0gJCh0YXJnZXQuanF1ZXJ5ID8gdGFyZ2V0IDogdGhpcy5lbGVtZW50cy50YXJnZXQpO1xuXHRcdH1cblx0XHR0YXJnZXQgPSBjYWNoZS50YXJnZXQ7XG5cblx0XHQvLyBQYXJzZSB0aGUgdGFyZ2V0IGludG8gYSBqUXVlcnkgb2JqZWN0IGFuZCBtYWtlIHN1cmUgdGhlcmUncyBhbiBlbGVtZW50IHByZXNlbnRcblx0XHR0YXJnZXQgPSAkKHRhcmdldCkuZXEoMCk7XG5cdFx0aWYodGFyZ2V0Lmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gdGhpczsgfVxuXG5cdFx0Ly8gQ2hlY2sgaWYgd2luZG93IG9yIGRvY3VtZW50IGlzIHRoZSB0YXJnZXRcblx0XHRlbHNlIGlmKHRhcmdldFswXSA9PT0gZG9jdW1lbnQgfHwgdGFyZ2V0WzBdID09PSB3aW5kb3cpIHtcblx0XHRcdHRhcmdldFdpZHRoID0gQlJPV1NFUi5pT1MgPyB3aW5kb3cuaW5uZXJXaWR0aCA6IHRhcmdldC53aWR0aCgpO1xuXHRcdFx0dGFyZ2V0SGVpZ2h0ID0gQlJPV1NFUi5pT1MgPyB3aW5kb3cuaW5uZXJIZWlnaHQgOiB0YXJnZXQuaGVpZ2h0KCk7XG5cblx0XHRcdGlmKHRhcmdldFswXSA9PT0gd2luZG93KSB7XG5cdFx0XHRcdHBvc2l0aW9uID0ge1xuXHRcdFx0XHRcdHRvcDogKHZpZXdwb3J0IHx8IHRhcmdldCkuc2Nyb2xsVG9wKCksXG5cdFx0XHRcdFx0bGVmdDogKHZpZXdwb3J0IHx8IHRhcmdldCkuc2Nyb2xsTGVmdCgpXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gQ2hlY2sgaWYgdGhlIHRhcmdldCBpcyBhbiA8QVJFQT4gZWxlbWVudFxuXHRcdGVsc2UgaWYoUExVR0lOUy5pbWFnZW1hcCAmJiB0YXJnZXQuaXMoJ2FyZWEnKSkge1xuXHRcdFx0cGx1Z2luQ2FsY3VsYXRpb25zID0gUExVR0lOUy5pbWFnZW1hcCh0aGlzLCB0YXJnZXQsIGF0LCBQTFVHSU5TLnZpZXdwb3J0ID8gbWV0aG9kIDogRkFMU0UpO1xuXHRcdH1cblxuXHRcdC8vIENoZWNrIGlmIHRoZSB0YXJnZXQgaXMgYW4gU1ZHIGVsZW1lbnRcblx0XHRlbHNlIGlmKFBMVUdJTlMuc3ZnICYmIHRhcmdldCAmJiB0YXJnZXRbMF0ub3duZXJTVkdFbGVtZW50KSB7XG5cdFx0XHRwbHVnaW5DYWxjdWxhdGlvbnMgPSBQTFVHSU5TLnN2Zyh0aGlzLCB0YXJnZXQsIGF0LCBQTFVHSU5TLnZpZXdwb3J0ID8gbWV0aG9kIDogRkFMU0UpO1xuXHRcdH1cblxuXHRcdC8vIE90aGVyd2lzZSB1c2UgcmVndWxhciBqUXVlcnkgbWV0aG9kc1xuXHRcdGVsc2Uge1xuXHRcdFx0dGFyZ2V0V2lkdGggPSB0YXJnZXQub3V0ZXJXaWR0aChGQUxTRSk7XG5cdFx0XHR0YXJnZXRIZWlnaHQgPSB0YXJnZXQub3V0ZXJIZWlnaHQoRkFMU0UpO1xuXHRcdFx0cG9zaXRpb24gPSB0YXJnZXQub2Zmc2V0KCk7XG5cdFx0fVxuXG5cdFx0Ly8gUGFyc2UgcmV0dXJuZWQgcGx1Z2luIHZhbHVlcyBpbnRvIHByb3BlciB2YXJpYWJsZXNcblx0XHRpZihwbHVnaW5DYWxjdWxhdGlvbnMpIHtcblx0XHRcdHRhcmdldFdpZHRoID0gcGx1Z2luQ2FsY3VsYXRpb25zLndpZHRoO1xuXHRcdFx0dGFyZ2V0SGVpZ2h0ID0gcGx1Z2luQ2FsY3VsYXRpb25zLmhlaWdodDtcblx0XHRcdG9mZnNldCA9IHBsdWdpbkNhbGN1bGF0aW9ucy5vZmZzZXQ7XG5cdFx0XHRwb3NpdGlvbiA9IHBsdWdpbkNhbGN1bGF0aW9ucy5wb3NpdGlvbjtcblx0XHR9XG5cblx0XHQvLyBBZGp1c3QgcG9zaXRpb24gdG8gdGFrZSBpbnRvIGFjY291bnQgb2Zmc2V0IHBhcmVudHNcblx0XHRwb3NpdGlvbiA9IHRoaXMucmVwb3NpdGlvbi5vZmZzZXQodGFyZ2V0LCBwb3NpdGlvbiwgY29udGFpbmVyKTtcblxuXHRcdC8vIEFkanVzdCBmb3IgcG9zaXRpb24uZml4ZWQgdG9vbHRpcHMgKGFuZCBhbHNvIGlPUyBzY3JvbGwgYnVnIGluIHYzLjItNC4wICYgdjQuMy00LjMuMilcblx0XHRpZihCUk9XU0VSLmlPUyA+IDMuMSAmJiBCUk9XU0VSLmlPUyA8IDQuMSB8fFxuXHRcdFx0QlJPV1NFUi5pT1MgPj0gNC4zICYmIEJST1dTRVIuaU9TIDwgNC4zMyB8fFxuXHRcdFx0IUJST1dTRVIuaU9TICYmIHR5cGUgPT09ICdmaXhlZCdcblx0XHQpe1xuXHRcdFx0cG9zaXRpb24ubGVmdCAtPSB3aW4uc2Nyb2xsTGVmdCgpO1xuXHRcdFx0cG9zaXRpb24udG9wIC09IHdpbi5zY3JvbGxUb3AoKTtcblx0XHR9XG5cblx0XHQvLyBBZGp1c3QgcG9zaXRpb24gcmVsYXRpdmUgdG8gdGFyZ2V0XG5cdFx0aWYoIXBsdWdpbkNhbGN1bGF0aW9ucyB8fCBwbHVnaW5DYWxjdWxhdGlvbnMgJiYgcGx1Z2luQ2FsY3VsYXRpb25zLmFkanVzdGFibGUgIT09IEZBTFNFKSB7XG5cdFx0XHRwb3NpdGlvbi5sZWZ0ICs9IGF0LnggPT09IFJJR0hUID8gdGFyZ2V0V2lkdGggOiBhdC54ID09PSBDRU5URVIgPyB0YXJnZXRXaWR0aCAvIDIgOiAwO1xuXHRcdFx0cG9zaXRpb24udG9wICs9IGF0LnkgPT09IEJPVFRPTSA/IHRhcmdldEhlaWdodCA6IGF0LnkgPT09IENFTlRFUiA/IHRhcmdldEhlaWdodCAvIDIgOiAwO1xuXHRcdH1cblx0fVxuXG5cdC8vIEFkanVzdCBwb3NpdGlvbiByZWxhdGl2ZSB0byB0b29sdGlwXG5cdHBvc2l0aW9uLmxlZnQgKz0gYWRqdXN0LnggKyAobXkueCA9PT0gUklHSFQgPyAtdG9vbHRpcFdpZHRoIDogbXkueCA9PT0gQ0VOVEVSID8gLXRvb2x0aXBXaWR0aCAvIDIgOiAwKTtcblx0cG9zaXRpb24udG9wICs9IGFkanVzdC55ICsgKG15LnkgPT09IEJPVFRPTSA/IC10b29sdGlwSGVpZ2h0IDogbXkueSA9PT0gQ0VOVEVSID8gLXRvb2x0aXBIZWlnaHQgLyAyIDogMCk7XG5cblx0Ly8gVXNlIHZpZXdwb3J0IGFkanVzdG1lbnQgcGx1Z2luIGlmIGVuYWJsZWRcblx0aWYoUExVR0lOUy52aWV3cG9ydCkge1xuXHRcdGFkanVzdGVkID0gcG9zaXRpb24uYWRqdXN0ZWQgPSBQTFVHSU5TLnZpZXdwb3J0KFxuXHRcdFx0dGhpcywgcG9zaXRpb24sIHBvc09wdGlvbnMsIHRhcmdldFdpZHRoLCB0YXJnZXRIZWlnaHQsIHRvb2x0aXBXaWR0aCwgdG9vbHRpcEhlaWdodFxuXHRcdCk7XG5cblx0XHQvLyBBcHBseSBvZmZzZXRzIHN1cHBsaWVkIGJ5IHBvc2l0aW9uaW5nIHBsdWdpbiAoaWYgdXNlZClcblx0XHRpZihvZmZzZXQgJiYgYWRqdXN0ZWQubGVmdCkgeyBwb3NpdGlvbi5sZWZ0ICs9IG9mZnNldC5sZWZ0OyB9XG5cdFx0aWYob2Zmc2V0ICYmIGFkanVzdGVkLnRvcCkgeyAgcG9zaXRpb24udG9wICs9IG9mZnNldC50b3A7IH1cblxuXHRcdC8vIEFwcGx5IGFueSBuZXcgJ215JyBwb3NpdGlvblxuXHRcdGlmKGFkanVzdGVkLm15KSB7IHRoaXMucG9zaXRpb24ubXkgPSBhZGp1c3RlZC5teTsgfVxuXHR9XG5cblx0Ly8gVmlld3BvcnQgYWRqdXN0bWVudCBpcyBkaXNhYmxlZCwgc2V0IHZhbHVlcyB0byB6ZXJvXG5cdGVsc2UgeyBwb3NpdGlvbi5hZGp1c3RlZCA9IHsgbGVmdDogMCwgdG9wOiAwIH07IH1cblxuXHQvLyBTZXQgdG9vbHRpcCBwb3NpdGlvbiBjbGFzcyBpZiBpdCdzIGNoYW5nZWRcblx0aWYoY2FjaGUucG9zQ2xhc3MgIT09IChuZXdDbGFzcyA9IHRoaXMuX2NyZWF0ZVBvc0NsYXNzKHRoaXMucG9zaXRpb24ubXkpKSkge1xuXHRcdGNhY2hlLnBvc0NsYXNzID0gbmV3Q2xhc3M7XG5cdFx0dG9vbHRpcC5yZW1vdmVDbGFzcyhjYWNoZS5wb3NDbGFzcykuYWRkQ2xhc3MobmV3Q2xhc3MpO1xuXHR9XG5cblx0Ly8gdG9vbHRpcG1vdmUgZXZlbnRcblx0aWYoIXRoaXMuX3RyaWdnZXIoJ21vdmUnLCBbcG9zaXRpb24sIHZpZXdwb3J0LmVsZW0gfHwgdmlld3BvcnRdLCBldmVudCkpIHsgcmV0dXJuIHRoaXM7IH1cblx0ZGVsZXRlIHBvc2l0aW9uLmFkanVzdGVkO1xuXG5cdC8vIElmIGVmZmVjdCBpcyBkaXNhYmxlZCwgdGFyZ2V0IGl0IG1vdXNlLCBubyBhbmltYXRpb24gaXMgZGVmaW5lZCBvciBwb3NpdGlvbmluZyBnaXZlcyBOYU4gb3V0LCBzZXQgQ1NTIGRpcmVjdGx5XG5cdGlmKGVmZmVjdCA9PT0gRkFMU0UgfHwgIXZpc2libGUgfHwgaXNOYU4ocG9zaXRpb24ubGVmdCkgfHwgaXNOYU4ocG9zaXRpb24udG9wKSB8fCB0YXJnZXQgPT09ICdtb3VzZScgfHwgISQuaXNGdW5jdGlvbihwb3NPcHRpb25zLmVmZmVjdCkpIHtcblx0XHR0b29sdGlwLmNzcyhwb3NpdGlvbik7XG5cdH1cblxuXHQvLyBVc2UgY3VzdG9tIGZ1bmN0aW9uIGlmIHByb3ZpZGVkXG5cdGVsc2UgaWYoJC5pc0Z1bmN0aW9uKHBvc09wdGlvbnMuZWZmZWN0KSkge1xuXHRcdHBvc09wdGlvbnMuZWZmZWN0LmNhbGwodG9vbHRpcCwgdGhpcywgJC5leHRlbmQoe30sIHBvc2l0aW9uKSk7XG5cdFx0dG9vbHRpcC5xdWV1ZShmdW5jdGlvbihuZXh0KSB7XG5cdFx0XHQvLyBSZXNldCBhdHRyaWJ1dGVzIHRvIGF2b2lkIGNyb3NzLWJyb3dzZXIgcmVuZGVyaW5nIGJ1Z3Ncblx0XHRcdCQodGhpcykuY3NzKHsgb3BhY2l0eTogJycsIGhlaWdodDogJycgfSk7XG5cdFx0XHRpZihCUk9XU0VSLmllKSB7IHRoaXMuc3R5bGUucmVtb3ZlQXR0cmlidXRlKCdmaWx0ZXInKTsgfVxuXG5cdFx0XHRuZXh0KCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBTZXQgcG9zaXRpb25pbmcgZmxhZ1xuXHR0aGlzLnBvc2l0aW9uaW5nID0gRkFMU0U7XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vLyBDdXN0b20gKG1vcmUgY29ycmVjdCBmb3IgcVRpcCEpIG9mZnNldCBjYWxjdWxhdG9yXG5QUk9UT1RZUEUucmVwb3NpdGlvbi5vZmZzZXQgPSBmdW5jdGlvbihlbGVtLCBwb3MsIGNvbnRhaW5lcikge1xuXHRpZighY29udGFpbmVyWzBdKSB7IHJldHVybiBwb3M7IH1cblxuXHR2YXIgb3duZXJEb2N1bWVudCA9ICQoZWxlbVswXS5vd25lckRvY3VtZW50KSxcblx0XHRxdWlya3MgPSAhIUJST1dTRVIuaWUgJiYgZG9jdW1lbnQuY29tcGF0TW9kZSAhPT0gJ0NTUzFDb21wYXQnLFxuXHRcdHBhcmVudCA9IGNvbnRhaW5lclswXSxcblx0XHRzY3JvbGxlZCwgcG9zaXRpb24sIHBhcmVudE9mZnNldCwgb3ZlcmZsb3c7XG5cblx0ZnVuY3Rpb24gc2Nyb2xsKGUsIGkpIHtcblx0XHRwb3MubGVmdCArPSBpICogZS5zY3JvbGxMZWZ0KCk7XG5cdFx0cG9zLnRvcCArPSBpICogZS5zY3JvbGxUb3AoKTtcblx0fVxuXG5cdC8vIENvbXBlbnNhdGUgZm9yIG5vbi1zdGF0aWMgY29udGFpbmVycyBvZmZzZXRcblx0ZG8ge1xuXHRcdGlmKChwb3NpdGlvbiA9ICQuY3NzKHBhcmVudCwgJ3Bvc2l0aW9uJykpICE9PSAnc3RhdGljJykge1xuXHRcdFx0aWYocG9zaXRpb24gPT09ICdmaXhlZCcpIHtcblx0XHRcdFx0cGFyZW50T2Zmc2V0ID0gcGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHRzY3JvbGwob3duZXJEb2N1bWVudCwgLTEpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHBhcmVudE9mZnNldCA9ICQocGFyZW50KS5wb3NpdGlvbigpO1xuXHRcdFx0XHRwYXJlbnRPZmZzZXQubGVmdCArPSBwYXJzZUZsb2F0KCQuY3NzKHBhcmVudCwgJ2JvcmRlckxlZnRXaWR0aCcpKSB8fCAwO1xuXHRcdFx0XHRwYXJlbnRPZmZzZXQudG9wICs9IHBhcnNlRmxvYXQoJC5jc3MocGFyZW50LCAnYm9yZGVyVG9wV2lkdGgnKSkgfHwgMDtcblx0XHRcdH1cblxuXHRcdFx0cG9zLmxlZnQgLT0gcGFyZW50T2Zmc2V0LmxlZnQgKyAocGFyc2VGbG9hdCgkLmNzcyhwYXJlbnQsICdtYXJnaW5MZWZ0JykpIHx8IDApO1xuXHRcdFx0cG9zLnRvcCAtPSBwYXJlbnRPZmZzZXQudG9wICsgKHBhcnNlRmxvYXQoJC5jc3MocGFyZW50LCAnbWFyZ2luVG9wJykpIHx8IDApO1xuXG5cdFx0XHQvLyBJZiB0aGlzIGlzIHRoZSBmaXJzdCBwYXJlbnQgZWxlbWVudCB3aXRoIGFuIG92ZXJmbG93IG9mIFwic2Nyb2xsXCIgb3IgXCJhdXRvXCIsIHN0b3JlIGl0XG5cdFx0XHRpZighc2Nyb2xsZWQgJiYgKG92ZXJmbG93ID0gJC5jc3MocGFyZW50LCAnb3ZlcmZsb3cnKSkgIT09ICdoaWRkZW4nICYmIG92ZXJmbG93ICE9PSAndmlzaWJsZScpIHsgc2Nyb2xsZWQgPSAkKHBhcmVudCk7IH1cblx0XHR9XG5cdH1cblx0d2hpbGUocGFyZW50ID0gcGFyZW50Lm9mZnNldFBhcmVudCk7XG5cblx0Ly8gQ29tcGVuc2F0ZSBmb3IgY29udGFpbmVycyBzY3JvbGwgaWYgaXQgYWxzbyBoYXMgYW4gb2Zmc2V0UGFyZW50IChvciBpbiBJRSBxdWlya3MgbW9kZSlcblx0aWYoc2Nyb2xsZWQgJiYgKHNjcm9sbGVkWzBdICE9PSBvd25lckRvY3VtZW50WzBdIHx8IHF1aXJrcykpIHtcblx0XHRzY3JvbGwoc2Nyb2xsZWQsIDEpO1xuXHR9XG5cblx0cmV0dXJuIHBvcztcbn07XG5cbi8vIENvcm5lciBjbGFzc1xudmFyIEMgPSAoQ09STkVSID0gUFJPVE9UWVBFLnJlcG9zaXRpb24uQ29ybmVyID0gZnVuY3Rpb24oY29ybmVyLCBmb3JjZVkpIHtcblx0Y29ybmVyID0gKCcnICsgY29ybmVyKS5yZXBsYWNlKC8oW0EtWl0pLywgJyAkMScpLnJlcGxhY2UoL21pZGRsZS9naSwgQ0VOVEVSKS50b0xvd2VyQ2FzZSgpO1xuXHR0aGlzLnggPSAoY29ybmVyLm1hdGNoKC9sZWZ0fHJpZ2h0L2kpIHx8IGNvcm5lci5tYXRjaCgvY2VudGVyLykgfHwgWydpbmhlcml0J10pWzBdLnRvTG93ZXJDYXNlKCk7XG5cdHRoaXMueSA9IChjb3JuZXIubWF0Y2goL3RvcHxib3R0b218Y2VudGVyL2kpIHx8IFsnaW5oZXJpdCddKVswXS50b0xvd2VyQ2FzZSgpO1xuXHR0aGlzLmZvcmNlWSA9ICEhZm9yY2VZO1xuXG5cdHZhciBmID0gY29ybmVyLmNoYXJBdCgwKTtcblx0dGhpcy5wcmVjZWRhbmNlID0gZiA9PT0gJ3QnIHx8IGYgPT09ICdiJyA/IFkgOiBYO1xufSkucHJvdG90eXBlO1xuXG5DLmludmVydCA9IGZ1bmN0aW9uKHosIGNlbnRlcikge1xuXHR0aGlzW3pdID0gdGhpc1t6XSA9PT0gTEVGVCA/IFJJR0hUIDogdGhpc1t6XSA9PT0gUklHSFQgPyBMRUZUIDogY2VudGVyIHx8IHRoaXNbel07XG59O1xuXG5DLnN0cmluZyA9IGZ1bmN0aW9uKGpvaW4pIHtcblx0dmFyIHggPSB0aGlzLngsIHkgPSB0aGlzLnk7XG5cblx0dmFyIHJlc3VsdCA9IHggIT09IHkgP1xuXHRcdHggPT09ICdjZW50ZXInIHx8IHkgIT09ICdjZW50ZXInICYmICh0aGlzLnByZWNlZGFuY2UgPT09IFkgfHwgdGhpcy5mb3JjZVkpID8gXG5cdFx0XHRbeSx4XSA6IFxuXHRcdFx0W3gseV0gOlxuXHRcdFt4XTtcblxuXHRyZXR1cm4gam9pbiAhPT0gZmFsc2UgPyByZXN1bHQuam9pbignICcpIDogcmVzdWx0O1xufTtcblxuQy5hYmJyZXYgPSBmdW5jdGlvbigpIHtcblx0dmFyIHJlc3VsdCA9IHRoaXMuc3RyaW5nKGZhbHNlKTtcblx0cmV0dXJuIHJlc3VsdFswXS5jaGFyQXQoMCkgKyAocmVzdWx0WzFdICYmIHJlc3VsdFsxXS5jaGFyQXQoMCkgfHwgJycpO1xufTtcblxuQy5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gbmV3IENPUk5FUiggdGhpcy5zdHJpbmcoKSwgdGhpcy5mb3JjZVkgKTtcbn07XG5cbjtcblBST1RPVFlQRS50b2dnbGUgPSBmdW5jdGlvbihzdGF0ZSwgZXZlbnQpIHtcblx0dmFyIGNhY2hlID0gdGhpcy5jYWNoZSxcblx0XHRvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuXHRcdHRvb2x0aXAgPSB0aGlzLnRvb2x0aXA7XG5cblx0Ly8gVHJ5IHRvIHByZXZlbnQgZmxpY2tlcmluZyB3aGVuIHRvb2x0aXAgb3ZlcmxhcHMgc2hvdyBlbGVtZW50XG5cdGlmKGV2ZW50KSB7XG5cdFx0aWYoKC9vdmVyfGVudGVyLykudGVzdChldmVudC50eXBlKSAmJiBjYWNoZS5ldmVudCAmJiAoL291dHxsZWF2ZS8pLnRlc3QoY2FjaGUuZXZlbnQudHlwZSkgJiZcblx0XHRcdG9wdGlvbnMuc2hvdy50YXJnZXQuYWRkKGV2ZW50LnRhcmdldCkubGVuZ3RoID09PSBvcHRpb25zLnNob3cudGFyZ2V0Lmxlbmd0aCAmJlxuXHRcdFx0dG9vbHRpcC5oYXMoZXZlbnQucmVsYXRlZFRhcmdldCkubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvLyBDYWNoZSBldmVudFxuXHRcdGNhY2hlLmV2ZW50ID0gJC5ldmVudC5maXgoZXZlbnQpO1xuXHR9XG5cblx0Ly8gSWYgd2UncmUgY3VycmVudGx5IHdhaXRpbmcgYW5kIHdlJ3ZlIGp1c3QgaGlkZGVuLi4uIHN0b3AgaXRcblx0dGhpcy53YWl0aW5nICYmICFzdGF0ZSAmJiAodGhpcy5oaWRkZW5EdXJpbmdXYWl0ID0gVFJVRSk7XG5cblx0Ly8gUmVuZGVyIHRoZSB0b29sdGlwIGlmIHNob3dpbmcgYW5kIGl0IGlzbid0IGFscmVhZHlcblx0aWYoIXRoaXMucmVuZGVyZWQpIHsgcmV0dXJuIHN0YXRlID8gdGhpcy5yZW5kZXIoMSkgOiB0aGlzOyB9XG5cdGVsc2UgaWYodGhpcy5kZXN0cm95ZWQgfHwgdGhpcy5kaXNhYmxlZCkgeyByZXR1cm4gdGhpczsgfVxuXG5cdHZhciB0eXBlID0gc3RhdGUgPyAnc2hvdycgOiAnaGlkZScsXG5cdFx0b3B0cyA9IHRoaXMub3B0aW9uc1t0eXBlXSxcblx0XHRwb3NPcHRpb25zID0gdGhpcy5vcHRpb25zLnBvc2l0aW9uLFxuXHRcdGNvbnRlbnRPcHRpb25zID0gdGhpcy5vcHRpb25zLmNvbnRlbnQsXG5cdFx0d2lkdGggPSB0aGlzLnRvb2x0aXAuY3NzKCd3aWR0aCcpLFxuXHRcdHZpc2libGUgPSB0aGlzLnRvb2x0aXAuaXMoJzp2aXNpYmxlJyksXG5cdFx0YW5pbWF0ZSA9IHN0YXRlIHx8IG9wdHMudGFyZ2V0Lmxlbmd0aCA9PT0gMSxcblx0XHRzYW1lVGFyZ2V0ID0gIWV2ZW50IHx8IG9wdHMudGFyZ2V0Lmxlbmd0aCA8IDIgfHwgY2FjaGUudGFyZ2V0WzBdID09PSBldmVudC50YXJnZXQsXG5cdFx0aWRlbnRpY2FsU3RhdGUsIGFsbG93LCBhZnRlcjtcblxuXHQvLyBEZXRlY3Qgc3RhdGUgaWYgdmFsaWQgb25lIGlzbid0IHByb3ZpZGVkXG5cdGlmKCh0eXBlb2Ygc3RhdGUpLnNlYXJjaCgnYm9vbGVhbnxudW1iZXInKSkgeyBzdGF0ZSA9ICF2aXNpYmxlOyB9XG5cblx0Ly8gQ2hlY2sgaWYgdGhlIHRvb2x0aXAgaXMgaW4gYW4gaWRlbnRpY2FsIHN0YXRlIHRvIHRoZSBuZXcgd291bGQtYmUgc3RhdGVcblx0aWRlbnRpY2FsU3RhdGUgPSAhdG9vbHRpcC5pcygnOmFuaW1hdGVkJykgJiYgdmlzaWJsZSA9PT0gc3RhdGUgJiYgc2FtZVRhcmdldDtcblxuXHQvLyBGaXJlIHRvb2x0aXAoc2hvdy9oaWRlKSBldmVudCBhbmQgY2hlY2sgaWYgZGVzdHJveWVkXG5cdGFsbG93ID0gIWlkZW50aWNhbFN0YXRlID8gISF0aGlzLl90cmlnZ2VyKHR5cGUsIFs5MF0pIDogTlVMTDtcblxuXHQvLyBDaGVjayB0byBtYWtlIHN1cmUgdGhlIHRvb2x0aXAgd2Fzbid0IGRlc3Ryb3llZCBpbiB0aGUgY2FsbGJhY2tcblx0aWYodGhpcy5kZXN0cm95ZWQpIHsgcmV0dXJuIHRoaXM7IH1cblxuXHQvLyBJZiB0aGUgdXNlciBkaWRuJ3Qgc3RvcCB0aGUgbWV0aG9kIHByZW1hdHVyZWx5IGFuZCB3ZSdyZSBzaG93aW5nIHRoZSB0b29sdGlwLCBmb2N1cyBpdFxuXHRpZihhbGxvdyAhPT0gRkFMU0UgJiYgc3RhdGUpIHsgdGhpcy5mb2N1cyhldmVudCk7IH1cblxuXHQvLyBJZiB0aGUgc3RhdGUgaGFzbid0IGNoYW5nZWQgb3IgdGhlIHVzZXIgc3RvcHBlZCBpdCwgcmV0dXJuIGVhcmx5XG5cdGlmKCFhbGxvdyB8fCBpZGVudGljYWxTdGF0ZSkgeyByZXR1cm4gdGhpczsgfVxuXG5cdC8vIFNldCBBUklBIGhpZGRlbiBhdHRyaWJ1dGVcblx0JC5hdHRyKHRvb2x0aXBbMF0sICdhcmlhLWhpZGRlbicsICEhIXN0YXRlKTtcblxuXHQvLyBFeGVjdXRlIHN0YXRlIHNwZWNpZmljIHByb3BlcnRpZXNcblx0aWYoc3RhdGUpIHtcblx0XHQvLyBTdG9yZSBzaG93IG9yaWdpbiBjb29yZGluYXRlc1xuXHRcdHRoaXMubW91c2UgJiYgKGNhY2hlLm9yaWdpbiA9ICQuZXZlbnQuZml4KHRoaXMubW91c2UpKTtcblxuXHRcdC8vIFVwZGF0ZSB0b29sdGlwIGNvbnRlbnQgJiB0aXRsZSBpZiBpdCdzIGEgZHluYW1pYyBmdW5jdGlvblxuXHRcdGlmKCQuaXNGdW5jdGlvbihjb250ZW50T3B0aW9ucy50ZXh0KSkgeyB0aGlzLl91cGRhdGVDb250ZW50KGNvbnRlbnRPcHRpb25zLnRleHQsIEZBTFNFKTsgfVxuXHRcdGlmKCQuaXNGdW5jdGlvbihjb250ZW50T3B0aW9ucy50aXRsZSkpIHsgdGhpcy5fdXBkYXRlVGl0bGUoY29udGVudE9wdGlvbnMudGl0bGUsIEZBTFNFKTsgfVxuXG5cdFx0Ly8gQ2FjaGUgbW91c2Vtb3ZlIGV2ZW50cyBmb3IgcG9zaXRpb25pbmcgcHVycG9zZXMgKGlmIG5vdCBhbHJlYWR5IHRyYWNraW5nKVxuXHRcdGlmKCF0cmFja2luZ0JvdW5kICYmIHBvc09wdGlvbnMudGFyZ2V0ID09PSAnbW91c2UnICYmIHBvc09wdGlvbnMuYWRqdXN0Lm1vdXNlKSB7XG5cdFx0XHQkKGRvY3VtZW50KS5iaW5kKCdtb3VzZW1vdmUuJytOQU1FU1BBQ0UsIHRoaXMuX3N0b3JlTW91c2UpO1xuXHRcdFx0dHJhY2tpbmdCb3VuZCA9IFRSVUU7XG5cdFx0fVxuXG5cdFx0Ly8gVXBkYXRlIHRoZSB0b29sdGlwIHBvc2l0aW9uIChzZXQgd2lkdGggZmlyc3QgdG8gcHJldmVudCB2aWV3cG9ydC9tYXgtd2lkdGggaXNzdWVzKVxuXHRcdGlmKCF3aWR0aCkgeyB0b29sdGlwLmNzcygnd2lkdGgnLCB0b29sdGlwLm91dGVyV2lkdGgoRkFMU0UpKTsgfVxuXHRcdHRoaXMucmVwb3NpdGlvbihldmVudCwgYXJndW1lbnRzWzJdKTtcblx0XHRpZighd2lkdGgpIHsgdG9vbHRpcC5jc3MoJ3dpZHRoJywgJycpOyB9XG5cblx0XHQvLyBIaWRlIG90aGVyIHRvb2x0aXBzIGlmIHRvb2x0aXAgaXMgc29sb1xuXHRcdGlmKCEhb3B0cy5zb2xvKSB7XG5cdFx0XHQodHlwZW9mIG9wdHMuc29sbyA9PT0gJ3N0cmluZycgPyAkKG9wdHMuc29sbykgOiAkKFNFTEVDVE9SLCBvcHRzLnNvbG8pKVxuXHRcdFx0XHQubm90KHRvb2x0aXApLm5vdChvcHRzLnRhcmdldCkucXRpcCgnaGlkZScsIG5ldyAkLkV2ZW50KCd0b29sdGlwc29sbycpKTtcblx0XHR9XG5cdH1cblx0ZWxzZSB7XG5cdFx0Ly8gQ2xlYXIgc2hvdyB0aW1lciBpZiB3ZSdyZSBoaWRpbmdcblx0XHRjbGVhclRpbWVvdXQodGhpcy50aW1lcnMuc2hvdyk7XG5cblx0XHQvLyBSZW1vdmUgY2FjaGVkIG9yaWdpbiBvbiBoaWRlXG5cdFx0ZGVsZXRlIGNhY2hlLm9yaWdpbjtcblxuXHRcdC8vIFJlbW92ZSBtb3VzZSB0cmFja2luZyBldmVudCBpZiBub3QgbmVlZGVkIChhbGwgdHJhY2tpbmcgcVRpcHMgYXJlIGhpZGRlbilcblx0XHRpZih0cmFja2luZ0JvdW5kICYmICEkKFNFTEVDVE9SKydbdHJhY2tpbmc9XCJ0cnVlXCJdOnZpc2libGUnLCBvcHRzLnNvbG8pLm5vdCh0b29sdGlwKS5sZW5ndGgpIHtcblx0XHRcdCQoZG9jdW1lbnQpLnVuYmluZCgnbW91c2Vtb3ZlLicrTkFNRVNQQUNFKTtcblx0XHRcdHRyYWNraW5nQm91bmQgPSBGQUxTRTtcblx0XHR9XG5cblx0XHQvLyBCbHVyIHRoZSB0b29sdGlwXG5cdFx0dGhpcy5ibHVyKGV2ZW50KTtcblx0fVxuXG5cdC8vIERlZmluZSBwb3N0LWFuaW1hdGlvbiwgc3RhdGUgc3BlY2lmaWMgcHJvcGVydGllc1xuXHRhZnRlciA9ICQucHJveHkoZnVuY3Rpb24oKSB7XG5cdFx0aWYoc3RhdGUpIHtcblx0XHRcdC8vIFByZXZlbnQgYW50aWFsaWFzIGZyb20gZGlzYXBwZWFyaW5nIGluIElFIGJ5IHJlbW92aW5nIGZpbHRlclxuXHRcdFx0aWYoQlJPV1NFUi5pZSkgeyB0b29sdGlwWzBdLnN0eWxlLnJlbW92ZUF0dHJpYnV0ZSgnZmlsdGVyJyk7IH1cblxuXHRcdFx0Ly8gUmVtb3ZlIG92ZXJmbG93IHNldHRpbmcgdG8gcHJldmVudCB0aXAgYnVnc1xuXHRcdFx0dG9vbHRpcC5jc3MoJ292ZXJmbG93JywgJycpO1xuXG5cdFx0XHQvLyBBdXRvZm9jdXMgZWxlbWVudHMgaWYgZW5hYmxlZFxuXHRcdFx0aWYoJ3N0cmluZycgPT09IHR5cGVvZiBvcHRzLmF1dG9mb2N1cykge1xuXHRcdFx0XHQkKHRoaXMub3B0aW9ucy5zaG93LmF1dG9mb2N1cywgdG9vbHRpcCkuZm9jdXMoKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgc2V0LCBoaWRlIHRvb2x0aXAgd2hlbiBpbmFjdGl2ZSBmb3IgZGVsYXkgcGVyaW9kXG5cdFx0XHR0aGlzLm9wdGlvbnMuc2hvdy50YXJnZXQudHJpZ2dlcigncXRpcC0nK3RoaXMuaWQrJy1pbmFjdGl2ZScpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdC8vIFJlc2V0IENTUyBzdGF0ZXNcblx0XHRcdHRvb2x0aXAuY3NzKHtcblx0XHRcdFx0ZGlzcGxheTogJycsXG5cdFx0XHRcdHZpc2liaWxpdHk6ICcnLFxuXHRcdFx0XHRvcGFjaXR5OiAnJyxcblx0XHRcdFx0bGVmdDogJycsXG5cdFx0XHRcdHRvcDogJydcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8vIHRvb2x0aXB2aXNpYmxlL3Rvb2x0aXBoaWRkZW4gZXZlbnRzXG5cdFx0dGhpcy5fdHJpZ2dlcihzdGF0ZSA/ICd2aXNpYmxlJyA6ICdoaWRkZW4nKTtcblx0fSwgdGhpcyk7XG5cblx0Ly8gSWYgbm8gZWZmZWN0IHR5cGUgaXMgc3VwcGxpZWQsIHVzZSBhIHNpbXBsZSB0b2dnbGVcblx0aWYob3B0cy5lZmZlY3QgPT09IEZBTFNFIHx8IGFuaW1hdGUgPT09IEZBTFNFKSB7XG5cdFx0dG9vbHRpcFsgdHlwZSBdKCk7XG5cdFx0YWZ0ZXIoKTtcblx0fVxuXG5cdC8vIFVzZSBjdXN0b20gZnVuY3Rpb24gaWYgcHJvdmlkZWRcblx0ZWxzZSBpZigkLmlzRnVuY3Rpb24ob3B0cy5lZmZlY3QpKSB7XG5cdFx0dG9vbHRpcC5zdG9wKDEsIDEpO1xuXHRcdG9wdHMuZWZmZWN0LmNhbGwodG9vbHRpcCwgdGhpcyk7XG5cdFx0dG9vbHRpcC5xdWV1ZSgnZngnLCBmdW5jdGlvbihuKSB7XG5cdFx0XHRhZnRlcigpOyBuKCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBVc2UgYmFzaWMgZmFkZSBmdW5jdGlvbiBieSBkZWZhdWx0XG5cdGVsc2UgeyB0b29sdGlwLmZhZGVUbyg5MCwgc3RhdGUgPyAxIDogMCwgYWZ0ZXIpOyB9XG5cblx0Ly8gSWYgaW5hY3RpdmUgaGlkZSBtZXRob2QgaXMgc2V0LCBhY3RpdmUgaXRcblx0aWYoc3RhdGUpIHsgb3B0cy50YXJnZXQudHJpZ2dlcigncXRpcC0nK3RoaXMuaWQrJy1pbmFjdGl2ZScpOyB9XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5QUk9UT1RZUEUuc2hvdyA9IGZ1bmN0aW9uKGV2ZW50KSB7IHJldHVybiB0aGlzLnRvZ2dsZShUUlVFLCBldmVudCk7IH07XG5cblBST1RPVFlQRS5oaWRlID0gZnVuY3Rpb24oZXZlbnQpIHsgcmV0dXJuIHRoaXMudG9nZ2xlKEZBTFNFLCBldmVudCk7IH07XG47UFJPVE9UWVBFLmZvY3VzID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0aWYoIXRoaXMucmVuZGVyZWQgfHwgdGhpcy5kZXN0cm95ZWQpIHsgcmV0dXJuIHRoaXM7IH1cblxuXHR2YXIgcXRpcHMgPSAkKFNFTEVDVE9SKSxcblx0XHR0b29sdGlwID0gdGhpcy50b29sdGlwLFxuXHRcdGN1ckluZGV4ID0gcGFyc2VJbnQodG9vbHRpcFswXS5zdHlsZS56SW5kZXgsIDEwKSxcblx0XHRuZXdJbmRleCA9IFFUSVAuemluZGV4ICsgcXRpcHMubGVuZ3RoO1xuXG5cdC8vIE9ubHkgdXBkYXRlIHRoZSB6LWluZGV4IGlmIGl0IGhhcyBjaGFuZ2VkIGFuZCB0b29sdGlwIGlzIG5vdCBhbHJlYWR5IGZvY3VzZWRcblx0aWYoIXRvb2x0aXAuaGFzQ2xhc3MoQ0xBU1NfRk9DVVMpKSB7XG5cdFx0Ly8gdG9vbHRpcGZvY3VzIGV2ZW50XG5cdFx0aWYodGhpcy5fdHJpZ2dlcignZm9jdXMnLCBbbmV3SW5kZXhdLCBldmVudCkpIHtcblx0XHRcdC8vIE9ubHkgdXBkYXRlIHotaW5kZXgncyBpZiB0aGV5J3ZlIGNoYW5nZWRcblx0XHRcdGlmKGN1ckluZGV4ICE9PSBuZXdJbmRleCkge1xuXHRcdFx0XHQvLyBSZWR1Y2Ugb3VyIHotaW5kZXgncyBhbmQga2VlcCB0aGVtIHByb3Blcmx5IG9yZGVyZWRcblx0XHRcdFx0cXRpcHMuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZih0aGlzLnN0eWxlLnpJbmRleCA+IGN1ckluZGV4KSB7XG5cdFx0XHRcdFx0XHR0aGlzLnN0eWxlLnpJbmRleCA9IHRoaXMuc3R5bGUuekluZGV4IC0gMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vIEZpcmUgYmx1ciBldmVudCBmb3IgZm9jdXNlZCB0b29sdGlwXG5cdFx0XHRcdHF0aXBzLmZpbHRlcignLicgKyBDTEFTU19GT0NVUykucXRpcCgnYmx1cicsIGV2ZW50KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gU2V0IHRoZSBuZXcgei1pbmRleFxuXHRcdFx0dG9vbHRpcC5hZGRDbGFzcyhDTEFTU19GT0NVUylbMF0uc3R5bGUuekluZGV4ID0gbmV3SW5kZXg7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5QUk9UT1RZUEUuYmx1ciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdGlmKCF0aGlzLnJlbmRlcmVkIHx8IHRoaXMuZGVzdHJveWVkKSB7IHJldHVybiB0aGlzOyB9XG5cblx0Ly8gU2V0IGZvY3VzZWQgc3RhdHVzIHRvIEZBTFNFXG5cdHRoaXMudG9vbHRpcC5yZW1vdmVDbGFzcyhDTEFTU19GT0NVUyk7XG5cblx0Ly8gdG9vbHRpcGJsdXIgZXZlbnRcblx0dGhpcy5fdHJpZ2dlcignYmx1cicsIFsgdGhpcy50b29sdGlwLmNzcygnekluZGV4JykgXSwgZXZlbnQpO1xuXG5cdHJldHVybiB0aGlzO1xufTtcbjtQUk9UT1RZUEUuZGlzYWJsZSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG5cdGlmKHRoaXMuZGVzdHJveWVkKSB7IHJldHVybiB0aGlzOyB9XG5cblx0Ly8gSWYgJ3RvZ2dsZScgaXMgcGFzc2VkLCB0b2dnbGUgdGhlIGN1cnJlbnQgc3RhdGVcblx0aWYoc3RhdGUgPT09ICd0b2dnbGUnKSB7XG5cdFx0c3RhdGUgPSAhKHRoaXMucmVuZGVyZWQgPyB0aGlzLnRvb2x0aXAuaGFzQ2xhc3MoQ0xBU1NfRElTQUJMRUQpIDogdGhpcy5kaXNhYmxlZCk7XG5cdH1cblxuXHQvLyBEaXNhYmxlIGlmIG5vIHN0YXRlIHBhc3NlZFxuXHRlbHNlIGlmKCdib29sZWFuJyAhPT0gdHlwZW9mIHN0YXRlKSB7XG5cdFx0c3RhdGUgPSBUUlVFO1xuXHR9XG5cblx0aWYodGhpcy5yZW5kZXJlZCkge1xuXHRcdHRoaXMudG9vbHRpcC50b2dnbGVDbGFzcyhDTEFTU19ESVNBQkxFRCwgc3RhdGUpXG5cdFx0XHQuYXR0cignYXJpYS1kaXNhYmxlZCcsIHN0YXRlKTtcblx0fVxuXG5cdHRoaXMuZGlzYWJsZWQgPSAhIXN0YXRlO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuUFJPVE9UWVBFLmVuYWJsZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5kaXNhYmxlKEZBTFNFKTsgfTtcbjtQUk9UT1RZUEUuX2NyZWF0ZUJ1dHRvbiA9IGZ1bmN0aW9uKClcbntcblx0dmFyIHNlbGYgPSB0aGlzLFxuXHRcdGVsZW1lbnRzID0gdGhpcy5lbGVtZW50cyxcblx0XHR0b29sdGlwID0gZWxlbWVudHMudG9vbHRpcCxcblx0XHRidXR0b24gPSB0aGlzLm9wdGlvbnMuY29udGVudC5idXR0b24sXG5cdFx0aXNTdHJpbmcgPSB0eXBlb2YgYnV0dG9uID09PSAnc3RyaW5nJyxcblx0XHRjbG9zZSA9IGlzU3RyaW5nID8gYnV0dG9uIDogJ0Nsb3NlIHRvb2x0aXAnO1xuXG5cdGlmKGVsZW1lbnRzLmJ1dHRvbikgeyBlbGVtZW50cy5idXR0b24ucmVtb3ZlKCk7IH1cblxuXHQvLyBVc2UgY3VzdG9tIGJ1dHRvbiBpZiBvbmUgd2FzIHN1cHBsaWVkIGJ5IHVzZXIsIGVsc2UgdXNlIGRlZmF1bHRcblx0aWYoYnV0dG9uLmpxdWVyeSkge1xuXHRcdGVsZW1lbnRzLmJ1dHRvbiA9IGJ1dHRvbjtcblx0fVxuXHRlbHNlIHtcblx0XHRlbGVtZW50cy5idXR0b24gPSAkKCc8YSAvPicsIHtcblx0XHRcdCdjbGFzcyc6ICdxdGlwLWNsb3NlICcgKyAodGhpcy5vcHRpb25zLnN0eWxlLndpZGdldCA/ICcnIDogTkFNRVNQQUNFKyctaWNvbicpLFxuXHRcdFx0J3RpdGxlJzogY2xvc2UsXG5cdFx0XHQnYXJpYS1sYWJlbCc6IGNsb3NlXG5cdFx0fSlcblx0XHQucHJlcGVuZChcblx0XHRcdCQoJzxzcGFuIC8+Jywge1xuXHRcdFx0XHQnY2xhc3MnOiAndWktaWNvbiB1aS1pY29uLWNsb3NlJyxcblx0XHRcdFx0J2h0bWwnOiAnJnRpbWVzOydcblx0XHRcdH0pXG5cdFx0KTtcblx0fVxuXG5cdC8vIENyZWF0ZSBidXR0b24gYW5kIHNldHVwIGF0dHJpYnV0ZXNcblx0ZWxlbWVudHMuYnV0dG9uLmFwcGVuZFRvKGVsZW1lbnRzLnRpdGxlYmFyIHx8IHRvb2x0aXApXG5cdFx0LmF0dHIoJ3JvbGUnLCAnYnV0dG9uJylcblx0XHQuY2xpY2soZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGlmKCF0b29sdGlwLmhhc0NsYXNzKENMQVNTX0RJU0FCTEVEKSkgeyBzZWxmLmhpZGUoZXZlbnQpOyB9XG5cdFx0XHRyZXR1cm4gRkFMU0U7XG5cdFx0fSk7XG59O1xuXG5QUk9UT1RZUEUuX3VwZGF0ZUJ1dHRvbiA9IGZ1bmN0aW9uKGJ1dHRvbilcbntcblx0Ly8gTWFrZSBzdXJlIHRvb2x0aXAgaXMgcmVuZGVyZWQgYW5kIGlmIG5vdCwgcmV0dXJuXG5cdGlmKCF0aGlzLnJlbmRlcmVkKSB7IHJldHVybiBGQUxTRTsgfVxuXG5cdHZhciBlbGVtID0gdGhpcy5lbGVtZW50cy5idXR0b247XG5cdGlmKGJ1dHRvbikgeyB0aGlzLl9jcmVhdGVCdXR0b24oKTsgfVxuXHRlbHNlIHsgZWxlbS5yZW1vdmUoKTsgfVxufTtcbjsvLyBXaWRnZXQgY2xhc3MgY3JlYXRvclxuZnVuY3Rpb24gY3JlYXRlV2lkZ2V0Q2xhc3MoY2xzKSB7XG5cdHJldHVybiBXSURHRVQuY29uY2F0KCcnKS5qb2luKGNscyA/ICctJytjbHMrJyAnIDogJyAnKTtcbn1cblxuLy8gV2lkZ2V0IGNsYXNzIHNldHRlciBtZXRob2RcblBST1RPVFlQRS5fc2V0V2lkZ2V0ID0gZnVuY3Rpb24oKVxue1xuXHR2YXIgb24gPSB0aGlzLm9wdGlvbnMuc3R5bGUud2lkZ2V0LFxuXHRcdGVsZW1lbnRzID0gdGhpcy5lbGVtZW50cyxcblx0XHR0b29sdGlwID0gZWxlbWVudHMudG9vbHRpcCxcblx0XHRkaXNhYmxlZCA9IHRvb2x0aXAuaGFzQ2xhc3MoQ0xBU1NfRElTQUJMRUQpO1xuXG5cdHRvb2x0aXAucmVtb3ZlQ2xhc3MoQ0xBU1NfRElTQUJMRUQpO1xuXHRDTEFTU19ESVNBQkxFRCA9IG9uID8gJ3VpLXN0YXRlLWRpc2FibGVkJyA6ICdxdGlwLWRpc2FibGVkJztcblx0dG9vbHRpcC50b2dnbGVDbGFzcyhDTEFTU19ESVNBQkxFRCwgZGlzYWJsZWQpO1xuXG5cdHRvb2x0aXAudG9nZ2xlQ2xhc3MoJ3VpLWhlbHBlci1yZXNldCAnK2NyZWF0ZVdpZGdldENsYXNzKCksIG9uKS50b2dnbGVDbGFzcyhDTEFTU19ERUZBVUxULCB0aGlzLm9wdGlvbnMuc3R5bGUuZGVmICYmICFvbik7XG5cblx0aWYoZWxlbWVudHMuY29udGVudCkge1xuXHRcdGVsZW1lbnRzLmNvbnRlbnQudG9nZ2xlQ2xhc3MoIGNyZWF0ZVdpZGdldENsYXNzKCdjb250ZW50JyksIG9uKTtcblx0fVxuXHRpZihlbGVtZW50cy50aXRsZWJhcikge1xuXHRcdGVsZW1lbnRzLnRpdGxlYmFyLnRvZ2dsZUNsYXNzKCBjcmVhdGVXaWRnZXRDbGFzcygnaGVhZGVyJyksIG9uKTtcblx0fVxuXHRpZihlbGVtZW50cy5idXR0b24pIHtcblx0XHRlbGVtZW50cy5idXR0b24udG9nZ2xlQ2xhc3MoTkFNRVNQQUNFKyctaWNvbicsICFvbik7XG5cdH1cbn07XG47ZnVuY3Rpb24gZGVsYXkoY2FsbGJhY2ssIGR1cmF0aW9uKSB7XG5cdC8vIElmIHRvb2x0aXAgaGFzIGRpc3BsYXllZCwgc3RhcnQgaGlkZSB0aW1lclxuXHRpZihkdXJhdGlvbiA+IDApIHtcblx0XHRyZXR1cm4gc2V0VGltZW91dChcblx0XHRcdCQucHJveHkoY2FsbGJhY2ssIHRoaXMpLCBkdXJhdGlvblxuXHRcdCk7XG5cdH1cblx0ZWxzZXsgY2FsbGJhY2suY2FsbCh0aGlzKTsgfVxufVxuXG5mdW5jdGlvbiBzaG93TWV0aG9kKGV2ZW50KSB7XG5cdGlmKHRoaXMudG9vbHRpcC5oYXNDbGFzcyhDTEFTU19ESVNBQkxFRCkpIHsgcmV0dXJuOyB9XG5cblx0Ly8gQ2xlYXIgaGlkZSB0aW1lcnNcblx0Y2xlYXJUaW1lb3V0KHRoaXMudGltZXJzLnNob3cpO1xuXHRjbGVhclRpbWVvdXQodGhpcy50aW1lcnMuaGlkZSk7XG5cblx0Ly8gU3RhcnQgc2hvdyB0aW1lclxuXHR0aGlzLnRpbWVycy5zaG93ID0gZGVsYXkuY2FsbCh0aGlzLFxuXHRcdGZ1bmN0aW9uKCkgeyB0aGlzLnRvZ2dsZShUUlVFLCBldmVudCk7IH0sXG5cdFx0dGhpcy5vcHRpb25zLnNob3cuZGVsYXlcblx0KTtcbn1cblxuZnVuY3Rpb24gaGlkZU1ldGhvZChldmVudCkge1xuXHRpZih0aGlzLnRvb2x0aXAuaGFzQ2xhc3MoQ0xBU1NfRElTQUJMRUQpIHx8IHRoaXMuZGVzdHJveWVkKSB7IHJldHVybjsgfVxuXG5cdC8vIENoZWNrIGlmIG5ldyB0YXJnZXQgd2FzIGFjdHVhbGx5IHRoZSB0b29sdGlwIGVsZW1lbnRcblx0dmFyIHJlbGF0ZWRUYXJnZXQgPSAkKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLFxuXHRcdG9udG9Ub29sdGlwID0gcmVsYXRlZFRhcmdldC5jbG9zZXN0KFNFTEVDVE9SKVswXSA9PT0gdGhpcy50b29sdGlwWzBdLFxuXHRcdG9udG9UYXJnZXQgPSByZWxhdGVkVGFyZ2V0WzBdID09PSB0aGlzLm9wdGlvbnMuc2hvdy50YXJnZXRbMF07XG5cblx0Ly8gQ2xlYXIgdGltZXJzIGFuZCBzdG9wIGFuaW1hdGlvbiBxdWV1ZVxuXHRjbGVhclRpbWVvdXQodGhpcy50aW1lcnMuc2hvdyk7XG5cdGNsZWFyVGltZW91dCh0aGlzLnRpbWVycy5oaWRlKTtcblxuXHQvLyBQcmV2ZW50IGhpZGluZyBpZiB0b29sdGlwIGlzIGZpeGVkIGFuZCBldmVudCB0YXJnZXQgaXMgdGhlIHRvb2x0aXAuXG5cdC8vIE9yIGlmIG1vdXNlIHBvc2l0aW9uaW5nIGlzIGVuYWJsZWQgYW5kIGN1cnNvciBtb21lbnRhcmlseSBvdmVybGFwc1xuXHRpZih0aGlzICE9PSByZWxhdGVkVGFyZ2V0WzBdICYmXG5cdFx0KHRoaXMub3B0aW9ucy5wb3NpdGlvbi50YXJnZXQgPT09ICdtb3VzZScgJiYgb250b1Rvb2x0aXApIHx8XG5cdFx0dGhpcy5vcHRpb25zLmhpZGUuZml4ZWQgJiYgKFxuXHRcdFx0KC9tb3VzZShvdXR8bGVhdmV8bW92ZSkvKS50ZXN0KGV2ZW50LnR5cGUpICYmIChvbnRvVG9vbHRpcCB8fCBvbnRvVGFyZ2V0KSlcblx0XHQpXG5cdHtcblx0XHQvKiBlc2xpbnQtZGlzYWJsZSBuby1lbXB0eSAqL1xuXHRcdHRyeSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0ZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG5cdFx0fSBjYXRjaChlKSB7fVxuXHRcdC8qIGVzbGludC1lbmFibGUgbm8tZW1wdHkgKi9cblxuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIElmIHRvb2x0aXAgaGFzIGRpc3BsYXllZCwgc3RhcnQgaGlkZSB0aW1lclxuXHR0aGlzLnRpbWVycy5oaWRlID0gZGVsYXkuY2FsbCh0aGlzLFxuXHRcdGZ1bmN0aW9uKCkgeyB0aGlzLnRvZ2dsZShGQUxTRSwgZXZlbnQpOyB9LFxuXHRcdHRoaXMub3B0aW9ucy5oaWRlLmRlbGF5LFxuXHRcdHRoaXNcblx0KTtcbn1cblxuZnVuY3Rpb24gaW5hY3RpdmVNZXRob2QoZXZlbnQpIHtcblx0aWYodGhpcy50b29sdGlwLmhhc0NsYXNzKENMQVNTX0RJU0FCTEVEKSB8fCAhdGhpcy5vcHRpb25zLmhpZGUuaW5hY3RpdmUpIHsgcmV0dXJuOyB9XG5cblx0Ly8gQ2xlYXIgdGltZXJcblx0Y2xlYXJUaW1lb3V0KHRoaXMudGltZXJzLmluYWN0aXZlKTtcblxuXHR0aGlzLnRpbWVycy5pbmFjdGl2ZSA9IGRlbGF5LmNhbGwodGhpcyxcblx0XHRmdW5jdGlvbigpeyB0aGlzLmhpZGUoZXZlbnQpOyB9LFxuXHRcdHRoaXMub3B0aW9ucy5oaWRlLmluYWN0aXZlXG5cdCk7XG59XG5cbmZ1bmN0aW9uIHJlcG9zaXRpb25NZXRob2QoZXZlbnQpIHtcblx0aWYodGhpcy5yZW5kZXJlZCAmJiB0aGlzLnRvb2x0aXBbMF0ub2Zmc2V0V2lkdGggPiAwKSB7IHRoaXMucmVwb3NpdGlvbihldmVudCk7IH1cbn1cblxuLy8gU3RvcmUgbW91c2UgY29vcmRpbmF0ZXNcblBST1RPVFlQRS5fc3RvcmVNb3VzZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdCh0aGlzLm1vdXNlID0gJC5ldmVudC5maXgoZXZlbnQpKS50eXBlID0gJ21vdXNlbW92ZSc7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLy8gQmluZCBldmVudHNcblBST1RPVFlQRS5fYmluZCA9IGZ1bmN0aW9uKHRhcmdldHMsIGV2ZW50cywgbWV0aG9kLCBzdWZmaXgsIGNvbnRleHQpIHtcblx0aWYoIXRhcmdldHMgfHwgIW1ldGhvZCB8fCAhZXZlbnRzLmxlbmd0aCkgeyByZXR1cm47IH1cblx0dmFyIG5zID0gJy4nICsgdGhpcy5faWQgKyAoc3VmZml4ID8gJy0nK3N1ZmZpeCA6ICcnKTtcblx0JCh0YXJnZXRzKS5iaW5kKFxuXHRcdChldmVudHMuc3BsaXQgPyBldmVudHMgOiBldmVudHMuam9pbihucyArICcgJykpICsgbnMsXG5cdFx0JC5wcm94eShtZXRob2QsIGNvbnRleHQgfHwgdGhpcylcblx0KTtcblx0cmV0dXJuIHRoaXM7XG59O1xuUFJPVE9UWVBFLl91bmJpbmQgPSBmdW5jdGlvbih0YXJnZXRzLCBzdWZmaXgpIHtcblx0dGFyZ2V0cyAmJiAkKHRhcmdldHMpLnVuYmluZCgnLicgKyB0aGlzLl9pZCArIChzdWZmaXggPyAnLScrc3VmZml4IDogJycpKTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vLyBHbG9iYWwgZGVsZWdhdGlvbiBoZWxwZXJcbmZ1bmN0aW9uIGRlbGVnYXRlKHNlbGVjdG9yLCBldmVudHMsIG1ldGhvZCkge1xuXHQkKGRvY3VtZW50LmJvZHkpLmRlbGVnYXRlKHNlbGVjdG9yLFxuXHRcdChldmVudHMuc3BsaXQgPyBldmVudHMgOiBldmVudHMuam9pbignLicrTkFNRVNQQUNFICsgJyAnKSkgKyAnLicrTkFNRVNQQUNFLFxuXHRcdGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGFwaSA9IFFUSVAuYXBpWyAkLmF0dHIodGhpcywgQVRUUl9JRCkgXTtcblx0XHRcdGFwaSAmJiAhYXBpLmRpc2FibGVkICYmIG1ldGhvZC5hcHBseShhcGksIGFyZ3VtZW50cyk7XG5cdFx0fVxuXHQpO1xufVxuLy8gRXZlbnQgdHJpZ2dlclxuUFJPVE9UWVBFLl90cmlnZ2VyID0gZnVuY3Rpb24odHlwZSwgYXJncywgZXZlbnQpIHtcblx0dmFyIGNhbGxiYWNrID0gbmV3ICQuRXZlbnQoJ3Rvb2x0aXAnK3R5cGUpO1xuXHRjYWxsYmFjay5vcmlnaW5hbEV2ZW50ID0gZXZlbnQgJiYgJC5leHRlbmQoe30sIGV2ZW50KSB8fCB0aGlzLmNhY2hlLmV2ZW50IHx8IE5VTEw7XG5cblx0dGhpcy50cmlnZ2VyaW5nID0gdHlwZTtcblx0dGhpcy50b29sdGlwLnRyaWdnZXIoY2FsbGJhY2ssIFt0aGlzXS5jb25jYXQoYXJncyB8fCBbXSkpO1xuXHR0aGlzLnRyaWdnZXJpbmcgPSBGQUxTRTtcblxuXHRyZXR1cm4gIWNhbGxiYWNrLmlzRGVmYXVsdFByZXZlbnRlZCgpO1xufTtcblxuUFJPVE9UWVBFLl9iaW5kRXZlbnRzID0gZnVuY3Rpb24oc2hvd0V2ZW50cywgaGlkZUV2ZW50cywgc2hvd1RhcmdldHMsIGhpZGVUYXJnZXRzLCBzaG93Q2FsbGJhY2ssIGhpZGVDYWxsYmFjaykge1xuXHQvLyBHZXQgdGFzcmdldHMgdGhhdCBseWUgd2l0aGluIGJvdGhcblx0dmFyIHNpbWlsYXJUYXJnZXRzID0gc2hvd1RhcmdldHMuZmlsdGVyKCBoaWRlVGFyZ2V0cyApLmFkZCggaGlkZVRhcmdldHMuZmlsdGVyKHNob3dUYXJnZXRzKSApLFxuXHRcdHRvZ2dsZUV2ZW50cyA9IFtdO1xuXG5cdC8vIElmIGhpZGUgYW5kIHNob3cgdGFyZ2V0cyBhcmUgdGhlIHNhbWUuLi5cblx0aWYoc2ltaWxhclRhcmdldHMubGVuZ3RoKSB7XG5cblx0XHQvLyBGaWx0ZXIgaWRlbnRpY2FsIHNob3cvaGlkZSBldmVudHNcblx0XHQkLmVhY2goaGlkZUV2ZW50cywgZnVuY3Rpb24oaSwgdHlwZSkge1xuXHRcdFx0dmFyIHNob3dJbmRleCA9ICQuaW5BcnJheSh0eXBlLCBzaG93RXZlbnRzKTtcblxuXHRcdFx0Ly8gQm90aCBldmVudHMgYXJlIGlkZW50aWNhbCwgcmVtb3ZlIGZyb20gYm90aCBoaWRlIGFuZCBzaG93IGV2ZW50c1xuXHRcdFx0Ly8gYW5kIGFwcGVuZCB0byB0b2dnbGVFdmVudHNcblx0XHRcdHNob3dJbmRleCA+IC0xICYmIHRvZ2dsZUV2ZW50cy5wdXNoKCBzaG93RXZlbnRzLnNwbGljZSggc2hvd0luZGV4LCAxIClbMF0gKTtcblx0XHR9KTtcblxuXHRcdC8vIFRvZ2dsZSBldmVudHMgYXJlIHNwZWNpYWwgY2FzZSBvZiBpZGVudGljYWwgc2hvdy9oaWRlIGV2ZW50cywgd2hpY2ggaGFwcGVuIGluIHNlcXVlbmNlXG5cdFx0aWYodG9nZ2xlRXZlbnRzLmxlbmd0aCkge1xuXHRcdFx0Ly8gQmluZCB0b2dnbGUgZXZlbnRzIHRvIHRoZSBzaW1pbGFyIHRhcmdldHNcblx0XHRcdHRoaXMuX2JpbmQoc2ltaWxhclRhcmdldHMsIHRvZ2dsZUV2ZW50cywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0dmFyIHN0YXRlID0gdGhpcy5yZW5kZXJlZCA/IHRoaXMudG9vbHRpcFswXS5vZmZzZXRXaWR0aCA+IDAgOiBmYWxzZTtcblx0XHRcdFx0KHN0YXRlID8gaGlkZUNhbGxiYWNrIDogc2hvd0NhbGxiYWNrKS5jYWxsKHRoaXMsIGV2ZW50KTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBSZW1vdmUgdGhlIHNpbWlsYXIgdGFyZ2V0cyBmcm9tIHRoZSByZWd1bGFyIHNob3cvaGlkZSBiaW5kaW5nc1xuXHRcdFx0c2hvd1RhcmdldHMgPSBzaG93VGFyZ2V0cy5ub3Qoc2ltaWxhclRhcmdldHMpO1xuXHRcdFx0aGlkZVRhcmdldHMgPSBoaWRlVGFyZ2V0cy5ub3Qoc2ltaWxhclRhcmdldHMpO1xuXHRcdH1cblx0fVxuXG5cdC8vIEFwcGx5IHNob3cvaGlkZS90b2dnbGUgZXZlbnRzXG5cdHRoaXMuX2JpbmQoc2hvd1RhcmdldHMsIHNob3dFdmVudHMsIHNob3dDYWxsYmFjayk7XG5cdHRoaXMuX2JpbmQoaGlkZVRhcmdldHMsIGhpZGVFdmVudHMsIGhpZGVDYWxsYmFjayk7XG59O1xuXG5QUk9UT1RZUEUuX2Fzc2lnbkluaXRpYWxFdmVudHMgPSBmdW5jdGlvbihldmVudCkge1xuXHR2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcblx0XHRzaG93VGFyZ2V0ID0gb3B0aW9ucy5zaG93LnRhcmdldCxcblx0XHRoaWRlVGFyZ2V0ID0gb3B0aW9ucy5oaWRlLnRhcmdldCxcblx0XHRzaG93RXZlbnRzID0gb3B0aW9ucy5zaG93LmV2ZW50ID8gJC50cmltKCcnICsgb3B0aW9ucy5zaG93LmV2ZW50KS5zcGxpdCgnICcpIDogW10sXG5cdFx0aGlkZUV2ZW50cyA9IG9wdGlvbnMuaGlkZS5ldmVudCA/ICQudHJpbSgnJyArIG9wdGlvbnMuaGlkZS5ldmVudCkuc3BsaXQoJyAnKSA6IFtdO1xuXG5cdC8vIENhdGNoIHJlbW92ZS9yZW1vdmVxdGlwIGV2ZW50cyBvbiB0YXJnZXQgZWxlbWVudCB0byBkZXN0cm95IHJlZHVuZGFudCB0b29sdGlwc1xuXHR0aGlzLl9iaW5kKHRoaXMuZWxlbWVudHMudGFyZ2V0LCBbJ3JlbW92ZScsICdyZW1vdmVxdGlwJ10sIGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZGVzdHJveSh0cnVlKTtcblx0fSwgJ2Rlc3Ryb3knKTtcblxuXHQvKlxuXHQgKiBNYWtlIHN1cmUgaG92ZXJJbnRlbnQgZnVuY3Rpb25zIHByb3Blcmx5IGJ5IHVzaW5nIG1vdXNlbGVhdmUgYXMgYSBoaWRlIGV2ZW50IGlmXG5cdCAqIG1vdXNlZW50ZXIvbW91c2VvdXQgaXMgdXNlZCBmb3Igc2hvdy5ldmVudCwgZXZlbiBpZiBpdCBpc24ndCBpbiB0aGUgdXNlcnMgb3B0aW9ucy5cblx0ICovXG5cdGlmKC9tb3VzZShvdmVyfGVudGVyKS9pLnRlc3Qob3B0aW9ucy5zaG93LmV2ZW50KSAmJiAhL21vdXNlKG91dHxsZWF2ZSkvaS50ZXN0KG9wdGlvbnMuaGlkZS5ldmVudCkpIHtcblx0XHRoaWRlRXZlbnRzLnB1c2goJ21vdXNlbGVhdmUnKTtcblx0fVxuXG5cdC8qXG5cdCAqIEFsc28gbWFrZSBzdXJlIGluaXRpYWwgbW91c2UgdGFyZ2V0dGluZyB3b3JrcyBjb3JyZWN0bHkgYnkgY2FjaGluZyBtb3VzZW1vdmUgY29vcmRzXG5cdCAqIG9uIHNob3cgdGFyZ2V0cyBiZWZvcmUgdGhlIHRvb2x0aXAgaGFzIHJlbmRlcmVkLiBBbHNvIHNldCBvblRhcmdldCB3aGVuIHRyaWdnZXJlZCB0b1xuXHQgKiBrZWVwIG1vdXNlIHRyYWNraW5nIHdvcmtpbmcuXG5cdCAqL1xuXHR0aGlzLl9iaW5kKHNob3dUYXJnZXQsICdtb3VzZW1vdmUnLCBmdW5jdGlvbihtb3ZlRXZlbnQpIHtcblx0XHR0aGlzLl9zdG9yZU1vdXNlKG1vdmVFdmVudCk7XG5cdFx0dGhpcy5jYWNoZS5vblRhcmdldCA9IFRSVUU7XG5cdH0pO1xuXG5cdC8vIERlZmluZSBob3ZlckludGVudCBmdW5jdGlvblxuXHRmdW5jdGlvbiBob3ZlckludGVudChob3ZlckV2ZW50KSB7XG5cdFx0Ly8gT25seSBjb250aW51ZSBpZiB0b29sdGlwIGlzbid0IGRpc2FibGVkXG5cdFx0aWYodGhpcy5kaXNhYmxlZCB8fCB0aGlzLmRlc3Ryb3llZCkgeyByZXR1cm4gRkFMU0U7IH1cblxuXHRcdC8vIENhY2hlIHRoZSBldmVudCBkYXRhXG5cdFx0dGhpcy5jYWNoZS5ldmVudCA9IGhvdmVyRXZlbnQgJiYgJC5ldmVudC5maXgoaG92ZXJFdmVudCk7XG5cdFx0dGhpcy5jYWNoZS50YXJnZXQgPSBob3ZlckV2ZW50ICYmICQoaG92ZXJFdmVudC50YXJnZXQpO1xuXG5cdFx0Ly8gU3RhcnQgdGhlIGV2ZW50IHNlcXVlbmNlXG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMudGltZXJzLnNob3cpO1xuXHRcdHRoaXMudGltZXJzLnNob3cgPSBkZWxheS5jYWxsKHRoaXMsXG5cdFx0XHRmdW5jdGlvbigpIHsgdGhpcy5yZW5kZXIodHlwZW9mIGhvdmVyRXZlbnQgPT09ICdvYmplY3QnIHx8IG9wdGlvbnMuc2hvdy5yZWFkeSk7IH0sXG5cdFx0XHRvcHRpb25zLnByZXJlbmRlciA/IDAgOiBvcHRpb25zLnNob3cuZGVsYXlcblx0XHQpO1xuXHR9XG5cblx0Ly8gRmlsdGVyIGFuZCBiaW5kIGV2ZW50c1xuXHR0aGlzLl9iaW5kRXZlbnRzKHNob3dFdmVudHMsIGhpZGVFdmVudHMsIHNob3dUYXJnZXQsIGhpZGVUYXJnZXQsIGhvdmVySW50ZW50LCBmdW5jdGlvbigpIHtcblx0XHRpZighdGhpcy50aW1lcnMpIHsgcmV0dXJuIEZBTFNFOyB9XG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMudGltZXJzLnNob3cpO1xuXHR9KTtcblxuXHQvLyBQcmVyZW5kZXJpbmcgaXMgZW5hYmxlZCwgY3JlYXRlIHRvb2x0aXAgbm93XG5cdGlmKG9wdGlvbnMuc2hvdy5yZWFkeSB8fCBvcHRpb25zLnByZXJlbmRlcikgeyBob3ZlckludGVudC5jYWxsKHRoaXMsIGV2ZW50KTsgfVxufTtcblxuLy8gRXZlbnQgYXNzaWdubWVudCBtZXRob2RcblBST1RPVFlQRS5fYXNzaWduRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cdHZhciBzZWxmID0gdGhpcyxcblx0XHRvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuXHRcdHBvc09wdGlvbnMgPSBvcHRpb25zLnBvc2l0aW9uLFxuXG5cdFx0dG9vbHRpcCA9IHRoaXMudG9vbHRpcCxcblx0XHRzaG93VGFyZ2V0ID0gb3B0aW9ucy5zaG93LnRhcmdldCxcblx0XHRoaWRlVGFyZ2V0ID0gb3B0aW9ucy5oaWRlLnRhcmdldCxcblx0XHRjb250YWluZXJUYXJnZXQgPSBwb3NPcHRpb25zLmNvbnRhaW5lcixcblx0XHR2aWV3cG9ydFRhcmdldCA9IHBvc09wdGlvbnMudmlld3BvcnQsXG5cdFx0ZG9jdW1lbnRUYXJnZXQgPSAkKGRvY3VtZW50KSxcblx0XHR3aW5kb3dUYXJnZXQgPSAkKHdpbmRvdyksXG5cblx0XHRzaG93RXZlbnRzID0gb3B0aW9ucy5zaG93LmV2ZW50ID8gJC50cmltKCcnICsgb3B0aW9ucy5zaG93LmV2ZW50KS5zcGxpdCgnICcpIDogW10sXG5cdFx0aGlkZUV2ZW50cyA9IG9wdGlvbnMuaGlkZS5ldmVudCA/ICQudHJpbSgnJyArIG9wdGlvbnMuaGlkZS5ldmVudCkuc3BsaXQoJyAnKSA6IFtdO1xuXG5cblx0Ly8gQXNzaWduIHBhc3NlZCBldmVudCBjYWxsYmFja3Ncblx0JC5lYWNoKG9wdGlvbnMuZXZlbnRzLCBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaykge1xuXHRcdHNlbGYuX2JpbmQodG9vbHRpcCwgbmFtZSA9PT0gJ3RvZ2dsZScgPyBbJ3Rvb2x0aXBzaG93JywndG9vbHRpcGhpZGUnXSA6IFsndG9vbHRpcCcrbmFtZV0sIGNhbGxiYWNrLCBudWxsLCB0b29sdGlwKTtcblx0fSk7XG5cblx0Ly8gSGlkZSB0b29sdGlwcyB3aGVuIGxlYXZpbmcgY3VycmVudCB3aW5kb3cvZnJhbWUgKGJ1dCBub3Qgc2VsZWN0L29wdGlvbiBlbGVtZW50cylcblx0aWYoL21vdXNlKG91dHxsZWF2ZSkvaS50ZXN0KG9wdGlvbnMuaGlkZS5ldmVudCkgJiYgb3B0aW9ucy5oaWRlLmxlYXZlID09PSAnd2luZG93Jykge1xuXHRcdHRoaXMuX2JpbmQoZG9jdW1lbnRUYXJnZXQsIFsnbW91c2VvdXQnLCAnYmx1ciddLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0aWYoIS9zZWxlY3R8b3B0aW9uLy50ZXN0KGV2ZW50LnRhcmdldC5ub2RlTmFtZSkgJiYgIWV2ZW50LnJlbGF0ZWRUYXJnZXQpIHtcblx0XHRcdFx0dGhpcy5oaWRlKGV2ZW50KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8vIEVuYWJsZSBoaWRlLmZpeGVkIGJ5IGFkZGluZyBhcHByb3ByaWF0ZSBjbGFzc1xuXHRpZihvcHRpb25zLmhpZGUuZml4ZWQpIHtcblx0XHRoaWRlVGFyZ2V0ID0gaGlkZVRhcmdldC5hZGQoIHRvb2x0aXAuYWRkQ2xhc3MoQ0xBU1NfRklYRUQpICk7XG5cdH1cblxuXHQvKlxuXHQgKiBNYWtlIHN1cmUgaG92ZXJJbnRlbnQgZnVuY3Rpb25zIHByb3Blcmx5IGJ5IHVzaW5nIG1vdXNlbGVhdmUgdG8gY2xlYXIgc2hvdyB0aW1lciBpZlxuXHQgKiBtb3VzZWVudGVyL21vdXNlb3V0IGlzIHVzZWQgZm9yIHNob3cuZXZlbnQsIGV2ZW4gaWYgaXQgaXNuJ3QgaW4gdGhlIHVzZXJzIG9wdGlvbnMuXG5cdCAqL1xuXHRlbHNlIGlmKC9tb3VzZShvdmVyfGVudGVyKS9pLnRlc3Qob3B0aW9ucy5zaG93LmV2ZW50KSkge1xuXHRcdHRoaXMuX2JpbmQoaGlkZVRhcmdldCwgJ21vdXNlbGVhdmUnLCBmdW5jdGlvbigpIHtcblx0XHRcdGNsZWFyVGltZW91dCh0aGlzLnRpbWVycy5zaG93KTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIEhpZGUgdG9vbHRpcCBvbiBkb2N1bWVudCBtb3VzZWRvd24gaWYgdW5mb2N1cyBldmVudHMgYXJlIGVuYWJsZWRcblx0aWYoKCcnICsgb3B0aW9ucy5oaWRlLmV2ZW50KS5pbmRleE9mKCd1bmZvY3VzJykgPiAtMSkge1xuXHRcdHRoaXMuX2JpbmQoY29udGFpbmVyVGFyZ2V0LmNsb3Nlc3QoJ2h0bWwnKSwgWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0dmFyIGVsZW0gPSAkKGV2ZW50LnRhcmdldCksXG5cdFx0XHRcdGVuYWJsZWQgPSB0aGlzLnJlbmRlcmVkICYmICF0aGlzLnRvb2x0aXAuaGFzQ2xhc3MoQ0xBU1NfRElTQUJMRUQpICYmIHRoaXMudG9vbHRpcFswXS5vZmZzZXRXaWR0aCA+IDAsXG5cdFx0XHRcdGlzQW5jZXN0b3IgPSBlbGVtLnBhcmVudHMoU0VMRUNUT1IpLmZpbHRlcih0aGlzLnRvb2x0aXBbMF0pLmxlbmd0aCA+IDA7XG5cblx0XHRcdGlmKGVsZW1bMF0gIT09IHRoaXMudGFyZ2V0WzBdICYmIGVsZW1bMF0gIT09IHRoaXMudG9vbHRpcFswXSAmJiAhaXNBbmNlc3RvciAmJlxuXHRcdFx0XHQhdGhpcy50YXJnZXQuaGFzKGVsZW1bMF0pLmxlbmd0aCAmJiBlbmFibGVkXG5cdFx0XHQpIHtcblx0XHRcdFx0dGhpcy5oaWRlKGV2ZW50KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8vIENoZWNrIGlmIHRoZSB0b29sdGlwIGhpZGVzIHdoZW4gaW5hY3RpdmVcblx0aWYoJ251bWJlcicgPT09IHR5cGVvZiBvcHRpb25zLmhpZGUuaW5hY3RpdmUpIHtcblx0XHQvLyBCaW5kIGluYWN0aXZlIG1ldGhvZCB0byBzaG93IHRhcmdldChzKSBhcyBhIGN1c3RvbSBldmVudFxuXHRcdHRoaXMuX2JpbmQoc2hvd1RhcmdldCwgJ3F0aXAtJyt0aGlzLmlkKyctaW5hY3RpdmUnLCBpbmFjdGl2ZU1ldGhvZCwgJ2luYWN0aXZlJyk7XG5cblx0XHQvLyBEZWZpbmUgZXZlbnRzIHdoaWNoIHJlc2V0IHRoZSAnaW5hY3RpdmUnIGV2ZW50IGhhbmRsZXJcblx0XHR0aGlzLl9iaW5kKGhpZGVUYXJnZXQuYWRkKHRvb2x0aXApLCBRVElQLmluYWN0aXZlRXZlbnRzLCBpbmFjdGl2ZU1ldGhvZCk7XG5cdH1cblxuXHQvLyBGaWx0ZXIgYW5kIGJpbmQgZXZlbnRzXG5cdHRoaXMuX2JpbmRFdmVudHMoc2hvd0V2ZW50cywgaGlkZUV2ZW50cywgc2hvd1RhcmdldCwgaGlkZVRhcmdldCwgc2hvd01ldGhvZCwgaGlkZU1ldGhvZCk7XG5cblx0Ly8gTW91c2UgbW92ZW1lbnQgYmluZGluZ3Ncblx0dGhpcy5fYmluZChzaG93VGFyZ2V0LmFkZCh0b29sdGlwKSwgJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0Ly8gQ2hlY2sgaWYgdGhlIHRvb2x0aXAgaGlkZXMgd2hlbiBtb3VzZSBpcyBtb3ZlZCBhIGNlcnRhaW4gZGlzdGFuY2Vcblx0XHRpZignbnVtYmVyJyA9PT0gdHlwZW9mIG9wdGlvbnMuaGlkZS5kaXN0YW5jZSkge1xuXHRcdFx0dmFyIG9yaWdpbiA9IHRoaXMuY2FjaGUub3JpZ2luIHx8IHt9LFxuXHRcdFx0XHRsaW1pdCA9IHRoaXMub3B0aW9ucy5oaWRlLmRpc3RhbmNlLFxuXHRcdFx0XHRhYnMgPSBNYXRoLmFicztcblxuXHRcdFx0Ly8gQ2hlY2sgaWYgdGhlIG1vdmVtZW50IGhhcyBnb25lIGJleW9uZCB0aGUgbGltaXQsIGFuZCBoaWRlIGl0IGlmIHNvXG5cdFx0XHRpZihhYnMoZXZlbnQucGFnZVggLSBvcmlnaW4ucGFnZVgpID49IGxpbWl0IHx8IGFicyhldmVudC5wYWdlWSAtIG9yaWdpbi5wYWdlWSkgPj0gbGltaXQpIHtcblx0XHRcdFx0dGhpcy5oaWRlKGV2ZW50KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBDYWNoZSBtb3VzZW1vdmUgY29vcmRzIG9uIHNob3cgdGFyZ2V0c1xuXHRcdHRoaXMuX3N0b3JlTW91c2UoZXZlbnQpO1xuXHR9KTtcblxuXHQvLyBNb3VzZSBwb3NpdGlvbmluZyBldmVudHNcblx0aWYocG9zT3B0aW9ucy50YXJnZXQgPT09ICdtb3VzZScpIHtcblx0XHQvLyBJZiBtb3VzZSBhZGp1c3RtZW50IGlzIG9uLi4uXG5cdFx0aWYocG9zT3B0aW9ucy5hZGp1c3QubW91c2UpIHtcblx0XHRcdC8vIEFwcGx5IGEgbW91c2VsZWF2ZSBldmVudCBzbyB3ZSBkb24ndCBnZXQgcHJvYmxlbXMgd2l0aCBvdmVybGFwcGluZ1xuXHRcdFx0aWYob3B0aW9ucy5oaWRlLmV2ZW50KSB7XG5cdFx0XHRcdC8vIFRyYWNrIGlmIHdlJ3JlIG9uIHRoZSB0YXJnZXQgb3Igbm90XG5cdFx0XHRcdHRoaXMuX2JpbmQoc2hvd1RhcmdldCwgWydtb3VzZWVudGVyJywgJ21vdXNlbGVhdmUnXSwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0XHRpZighdGhpcy5jYWNoZSkge3JldHVybiBGQUxTRTsgfVxuXHRcdFx0XHRcdHRoaXMuY2FjaGUub25UYXJnZXQgPSBldmVudC50eXBlID09PSAnbW91c2VlbnRlcic7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBVcGRhdGUgdG9vbHRpcCBwb3NpdGlvbiBvbiBtb3VzZW1vdmVcblx0XHRcdHRoaXMuX2JpbmQoZG9jdW1lbnRUYXJnZXQsICdtb3VzZW1vdmUnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHQvLyBVcGRhdGUgdGhlIHRvb2x0aXAgcG9zaXRpb24gb25seSBpZiB0aGUgdG9vbHRpcCBpcyB2aXNpYmxlIGFuZCBhZGp1c3RtZW50IGlzIGVuYWJsZWRcblx0XHRcdFx0aWYodGhpcy5yZW5kZXJlZCAmJiB0aGlzLmNhY2hlLm9uVGFyZ2V0ICYmICF0aGlzLnRvb2x0aXAuaGFzQ2xhc3MoQ0xBU1NfRElTQUJMRUQpICYmIHRoaXMudG9vbHRpcFswXS5vZmZzZXRXaWR0aCA+IDApIHtcblx0XHRcdFx0XHR0aGlzLnJlcG9zaXRpb24oZXZlbnQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHQvLyBBZGp1c3QgcG9zaXRpb25zIG9mIHRoZSB0b29sdGlwIG9uIHdpbmRvdyByZXNpemUgaWYgZW5hYmxlZFxuXHRpZihwb3NPcHRpb25zLmFkanVzdC5yZXNpemUgfHwgdmlld3BvcnRUYXJnZXQubGVuZ3RoKSB7XG5cdFx0dGhpcy5fYmluZCggJC5ldmVudC5zcGVjaWFsLnJlc2l6ZSA/IHZpZXdwb3J0VGFyZ2V0IDogd2luZG93VGFyZ2V0LCAncmVzaXplJywgcmVwb3NpdGlvbk1ldGhvZCApO1xuXHR9XG5cblx0Ly8gQWRqdXN0IHRvb2x0aXAgcG9zaXRpb24gb24gc2Nyb2xsIG9mIHRoZSB3aW5kb3cgb3Igdmlld3BvcnQgZWxlbWVudCBpZiBwcmVzZW50XG5cdGlmKHBvc09wdGlvbnMuYWRqdXN0LnNjcm9sbCkge1xuXHRcdHRoaXMuX2JpbmQoIHdpbmRvd1RhcmdldC5hZGQocG9zT3B0aW9ucy5jb250YWluZXIpLCAnc2Nyb2xsJywgcmVwb3NpdGlvbk1ldGhvZCApO1xuXHR9XG59O1xuXG4vLyBVbi1hc3NpZ25tZW50IG1ldGhvZFxuUFJPVE9UWVBFLl91bmFzc2lnbkV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcblx0XHRzaG93VGFyZ2V0cyA9IG9wdGlvbnMuc2hvdy50YXJnZXQsXG5cdFx0aGlkZVRhcmdldHMgPSBvcHRpb25zLmhpZGUudGFyZ2V0LFxuXHRcdHRhcmdldHMgPSAkLmdyZXAoW1xuXHRcdFx0dGhpcy5lbGVtZW50cy50YXJnZXRbMF0sXG5cdFx0XHR0aGlzLnJlbmRlcmVkICYmIHRoaXMudG9vbHRpcFswXSxcblx0XHRcdG9wdGlvbnMucG9zaXRpb24uY29udGFpbmVyWzBdLFxuXHRcdFx0b3B0aW9ucy5wb3NpdGlvbi52aWV3cG9ydFswXSxcblx0XHRcdG9wdGlvbnMucG9zaXRpb24uY29udGFpbmVyLmNsb3Nlc3QoJ2h0bWwnKVswXSwgLy8gdW5mb2N1c1xuXHRcdFx0d2luZG93LFxuXHRcdFx0ZG9jdW1lbnRcblx0XHRdLCBmdW5jdGlvbihpKSB7XG5cdFx0XHRyZXR1cm4gdHlwZW9mIGkgPT09ICdvYmplY3QnO1xuXHRcdH0pO1xuXG5cdC8vIEFkZCBzaG93IGFuZCBoaWRlIHRhcmdldHMgaWYgdGhleSdyZSB2YWxpZFxuXHRpZihzaG93VGFyZ2V0cyAmJiBzaG93VGFyZ2V0cy50b0FycmF5KSB7XG5cdFx0dGFyZ2V0cyA9IHRhcmdldHMuY29uY2F0KHNob3dUYXJnZXRzLnRvQXJyYXkoKSk7XG5cdH1cblx0aWYoaGlkZVRhcmdldHMgJiYgaGlkZVRhcmdldHMudG9BcnJheSkge1xuXHRcdHRhcmdldHMgPSB0YXJnZXRzLmNvbmNhdChoaWRlVGFyZ2V0cy50b0FycmF5KCkpO1xuXHR9XG5cblx0Ly8gVW5iaW5kIHRoZSBldmVudHNcblx0dGhpcy5fdW5iaW5kKHRhcmdldHMpXG5cdFx0Ll91bmJpbmQodGFyZ2V0cywgJ2Rlc3Ryb3knKVxuXHRcdC5fdW5iaW5kKHRhcmdldHMsICdpbmFjdGl2ZScpO1xufTtcblxuLy8gQXBwbHkgY29tbW9uIGV2ZW50IGhhbmRsZXJzIHVzaW5nIGRlbGVnYXRlIChhdm9pZHMgZXhjZXNzaXZlIC5iaW5kIGNhbGxzISlcbiQoZnVuY3Rpb24oKSB7XG5cdGRlbGVnYXRlKFNFTEVDVE9SLCBbJ21vdXNlZW50ZXInLCAnbW91c2VsZWF2ZSddLCBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciBzdGF0ZSA9IGV2ZW50LnR5cGUgPT09ICdtb3VzZWVudGVyJyxcblx0XHRcdHRvb2x0aXAgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLFxuXHRcdFx0dGFyZ2V0ID0gJChldmVudC5yZWxhdGVkVGFyZ2V0IHx8IGV2ZW50LnRhcmdldCksXG5cdFx0XHRvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG5cdFx0Ly8gT24gbW91c2VlbnRlci4uLlxuXHRcdGlmKHN0YXRlKSB7XG5cdFx0XHQvLyBGb2N1cyB0aGUgdG9vbHRpcCBvbiBtb3VzZWVudGVyICh6LWluZGV4IHN0YWNraW5nKVxuXHRcdFx0dGhpcy5mb2N1cyhldmVudCk7XG5cblx0XHRcdC8vIENsZWFyIGhpZGUgdGltZXIgb24gdG9vbHRpcCBob3ZlciB0byBwcmV2ZW50IGl0IGZyb20gY2xvc2luZ1xuXHRcdFx0dG9vbHRpcC5oYXNDbGFzcyhDTEFTU19GSVhFRCkgJiYgIXRvb2x0aXAuaGFzQ2xhc3MoQ0xBU1NfRElTQUJMRUQpICYmIGNsZWFyVGltZW91dCh0aGlzLnRpbWVycy5oaWRlKTtcblx0XHR9XG5cblx0XHQvLyBPbiBtb3VzZWxlYXZlLi4uXG5cdFx0ZWxzZSB7XG5cdFx0XHQvLyBXaGVuIG1vdXNlIHRyYWNraW5nIGlzIGVuYWJsZWQsIGhpZGUgd2hlbiB3ZSBsZWF2ZSB0aGUgdG9vbHRpcCBhbmQgbm90IG9udG8gdGhlIHNob3cgdGFyZ2V0IChpZiBhIGhpZGUgZXZlbnQgaXMgc2V0KVxuXHRcdFx0aWYob3B0aW9ucy5wb3NpdGlvbi50YXJnZXQgPT09ICdtb3VzZScgJiYgb3B0aW9ucy5wb3NpdGlvbi5hZGp1c3QubW91c2UgJiZcblx0XHRcdFx0b3B0aW9ucy5oaWRlLmV2ZW50ICYmIG9wdGlvbnMuc2hvdy50YXJnZXQgJiYgIXRhcmdldC5jbG9zZXN0KG9wdGlvbnMuc2hvdy50YXJnZXRbMF0pLmxlbmd0aCkge1xuXHRcdFx0XHR0aGlzLmhpZGUoZXZlbnQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEFkZCBob3ZlciBjbGFzc1xuXHRcdHRvb2x0aXAudG9nZ2xlQ2xhc3MoQ0xBU1NfSE9WRVIsIHN0YXRlKTtcblx0fSk7XG5cblx0Ly8gRGVmaW5lIGV2ZW50cyB3aGljaCByZXNldCB0aGUgJ2luYWN0aXZlJyBldmVudCBoYW5kbGVyXG5cdGRlbGVnYXRlKCdbJytBVFRSX0lEKyddJywgSU5BQ1RJVkVfRVZFTlRTLCBpbmFjdGl2ZU1ldGhvZCk7XG59KTtcbjsvLyBJbml0aWFsaXphdGlvbiBtZXRob2RcbmZ1bmN0aW9uIGluaXQoZWxlbSwgaWQsIG9wdHMpIHtcblx0dmFyIG9iaiwgcG9zT3B0aW9ucywgYXR0ciwgY29uZmlnLCB0aXRsZSxcblxuXHQvLyBTZXR1cCBlbGVtZW50IHJlZmVyZW5jZXNcblx0ZG9jQm9keSA9ICQoZG9jdW1lbnQuYm9keSksXG5cblx0Ly8gVXNlIGRvY3VtZW50IGJvZHkgaW5zdGVhZCBvZiBkb2N1bWVudCBlbGVtZW50IGlmIG5lZWRlZFxuXHRuZXdUYXJnZXQgPSBlbGVtWzBdID09PSBkb2N1bWVudCA/IGRvY0JvZHkgOiBlbGVtLFxuXG5cdC8vIEdyYWIgbWV0YWRhdGEgZnJvbSBlbGVtZW50IGlmIHBsdWdpbiBpcyBwcmVzZW50XG5cdG1ldGFkYXRhID0gZWxlbS5tZXRhZGF0YSA/IGVsZW0ubWV0YWRhdGEob3B0cy5tZXRhZGF0YSkgOiBOVUxMLFxuXG5cdC8vIElmIG1ldGFkYXRhIHR5cGUgaWYgSFRNTDUsIGdyYWIgJ25hbWUnIGZyb20gdGhlIG9iamVjdCBpbnN0ZWFkLCBvciB1c2UgdGhlIHJlZ3VsYXIgZGF0YSBvYmplY3Qgb3RoZXJ3aXNlXG5cdG1ldGFkYXRhNSA9IG9wdHMubWV0YWRhdGEudHlwZSA9PT0gJ2h0bWw1JyAmJiBtZXRhZGF0YSA/IG1ldGFkYXRhW29wdHMubWV0YWRhdGEubmFtZV0gOiBOVUxMLFxuXG5cdC8vIEdyYWIgZGF0YSBmcm9tIG1ldGFkYXRhLm5hbWUgKG9yIGRhdGEtcXRpcG9wdHMgYXMgZmFsbGJhY2spIHVzaW5nIC5kYXRhKCkgbWV0aG9kLFxuXHRodG1sNSA9IGVsZW0uZGF0YShvcHRzLm1ldGFkYXRhLm5hbWUgfHwgJ3F0aXBvcHRzJyk7XG5cblx0Ly8gSWYgd2UgZG9uJ3QgZ2V0IGFuIG9iamVjdCByZXR1cm5lZCBhdHRlbXB0IHRvIHBhcnNlIGl0IG1hbnVhbHlsIHdpdGhvdXQgcGFyc2VKU09OXG5cdC8qIGVzbGludC1kaXNhYmxlIG5vLWVtcHR5ICovXG5cdHRyeSB7IGh0bWw1ID0gdHlwZW9mIGh0bWw1ID09PSAnc3RyaW5nJyA/ICQucGFyc2VKU09OKGh0bWw1KSA6IGh0bWw1OyB9XG5cdGNhdGNoKGUpIHt9XG5cdC8qIGVzbGludC1lbmFibGUgbm8tZW1wdHkgKi9cblxuXHQvLyBNZXJnZSBpbiBhbmQgc2FuaXRpemUgbWV0YWRhdGFcblx0Y29uZmlnID0gJC5leHRlbmQoVFJVRSwge30sIFFUSVAuZGVmYXVsdHMsIG9wdHMsXG5cdFx0dHlwZW9mIGh0bWw1ID09PSAnb2JqZWN0JyA/IHNhbml0aXplT3B0aW9ucyhodG1sNSkgOiBOVUxMLFxuXHRcdHNhbml0aXplT3B0aW9ucyhtZXRhZGF0YTUgfHwgbWV0YWRhdGEpKTtcblxuXHQvLyBSZS1ncmFiIG91ciBwb3NpdGlvbmluZyBvcHRpb25zIG5vdyB3ZSd2ZSBtZXJnZWQgb3VyIG1ldGFkYXRhIGFuZCBzZXQgaWQgdG8gcGFzc2VkIHZhbHVlXG5cdHBvc09wdGlvbnMgPSBjb25maWcucG9zaXRpb247XG5cdGNvbmZpZy5pZCA9IGlkO1xuXG5cdC8vIFNldHVwIG1pc3NpbmcgY29udGVudCBpZiBub25lIGlzIGRldGVjdGVkXG5cdGlmKCdib29sZWFuJyA9PT0gdHlwZW9mIGNvbmZpZy5jb250ZW50LnRleHQpIHtcblx0XHRhdHRyID0gZWxlbS5hdHRyKGNvbmZpZy5jb250ZW50LmF0dHIpO1xuXG5cdFx0Ly8gR3JhYiBmcm9tIHN1cHBsaWVkIGF0dHJpYnV0ZSBpZiBhdmFpbGFibGVcblx0XHRpZihjb25maWcuY29udGVudC5hdHRyICE9PSBGQUxTRSAmJiBhdHRyKSB7IGNvbmZpZy5jb250ZW50LnRleHQgPSBhdHRyOyB9XG5cblx0XHQvLyBObyB2YWxpZCBjb250ZW50IHdhcyBmb3VuZCwgYWJvcnQgcmVuZGVyXG5cdFx0ZWxzZSB7IHJldHVybiBGQUxTRTsgfVxuXHR9XG5cblx0Ly8gU2V0dXAgdGFyZ2V0IG9wdGlvbnNcblx0aWYoIXBvc09wdGlvbnMuY29udGFpbmVyLmxlbmd0aCkgeyBwb3NPcHRpb25zLmNvbnRhaW5lciA9IGRvY0JvZHk7IH1cblx0aWYocG9zT3B0aW9ucy50YXJnZXQgPT09IEZBTFNFKSB7IHBvc09wdGlvbnMudGFyZ2V0ID0gbmV3VGFyZ2V0OyB9XG5cdGlmKGNvbmZpZy5zaG93LnRhcmdldCA9PT0gRkFMU0UpIHsgY29uZmlnLnNob3cudGFyZ2V0ID0gbmV3VGFyZ2V0OyB9XG5cdGlmKGNvbmZpZy5zaG93LnNvbG8gPT09IFRSVUUpIHsgY29uZmlnLnNob3cuc29sbyA9IHBvc09wdGlvbnMuY29udGFpbmVyLmNsb3Nlc3QoJ2JvZHknKTsgfVxuXHRpZihjb25maWcuaGlkZS50YXJnZXQgPT09IEZBTFNFKSB7IGNvbmZpZy5oaWRlLnRhcmdldCA9IG5ld1RhcmdldDsgfVxuXHRpZihjb25maWcucG9zaXRpb24udmlld3BvcnQgPT09IFRSVUUpIHsgY29uZmlnLnBvc2l0aW9uLnZpZXdwb3J0ID0gcG9zT3B0aW9ucy5jb250YWluZXI7IH1cblxuXHQvLyBFbnN1cmUgd2Ugb25seSB1c2UgYSBzaW5nbGUgY29udGFpbmVyXG5cdHBvc09wdGlvbnMuY29udGFpbmVyID0gcG9zT3B0aW9ucy5jb250YWluZXIuZXEoMCk7XG5cblx0Ly8gQ29udmVydCBwb3NpdGlvbiBjb3JuZXIgdmFsdWVzIGludG8geCBhbmQgeSBzdHJpbmdzXG5cdHBvc09wdGlvbnMuYXQgPSBuZXcgQ09STkVSKHBvc09wdGlvbnMuYXQsIFRSVUUpO1xuXHRwb3NPcHRpb25zLm15ID0gbmV3IENPUk5FUihwb3NPcHRpb25zLm15KTtcblxuXHQvLyBEZXN0cm95IHByZXZpb3VzIHRvb2x0aXAgaWYgb3ZlcndyaXRlIGlzIGVuYWJsZWQsIG9yIHNraXAgZWxlbWVudCBpZiBub3Rcblx0aWYoZWxlbS5kYXRhKE5BTUVTUEFDRSkpIHtcblx0XHRpZihjb25maWcub3ZlcndyaXRlKSB7XG5cdFx0XHRlbGVtLnF0aXAoJ2Rlc3Ryb3knLCB0cnVlKTtcblx0XHR9XG5cdFx0ZWxzZSBpZihjb25maWcub3ZlcndyaXRlID09PSBGQUxTRSkge1xuXHRcdFx0cmV0dXJuIEZBTFNFO1xuXHRcdH1cblx0fVxuXG5cdC8vIEFkZCBoYXMtcXRpcCBhdHRyaWJ1dGVcblx0ZWxlbS5hdHRyKEFUVFJfSEFTLCBpZCk7XG5cblx0Ly8gUmVtb3ZlIHRpdGxlIGF0dHJpYnV0ZSBhbmQgc3RvcmUgaXQgaWYgcHJlc2VudFxuXHRpZihjb25maWcuc3VwcHJlc3MgJiYgKHRpdGxlID0gZWxlbS5hdHRyKCd0aXRsZScpKSkge1xuXHRcdC8vIEZpbmFsIGF0dHIgY2FsbCBmaXhlcyBldmVudCBkZWxlZ2F0aW9tIGFuZCBJRSBkZWZhdWx0IHRvb2x0aXAgc2hvd2luZyBwcm9ibGVtXG5cdFx0ZWxlbS5yZW1vdmVBdHRyKCd0aXRsZScpLmF0dHIob2xkdGl0bGUsIHRpdGxlKS5hdHRyKCd0aXRsZScsICcnKTtcblx0fVxuXG5cdC8vIEluaXRpYWxpemUgdGhlIHRvb2x0aXAgYW5kIGFkZCBBUEkgcmVmZXJlbmNlXG5cdG9iaiA9IG5ldyBRVGlwKGVsZW0sIGNvbmZpZywgaWQsICEhYXR0cik7XG5cdGVsZW0uZGF0YShOQU1FU1BBQ0UsIG9iaik7XG5cblx0cmV0dXJuIG9iajtcbn1cblxuLy8galF1ZXJ5ICQuZm4gZXh0ZW5zaW9uIG1ldGhvZFxuUVRJUCA9ICQuZm4ucXRpcCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG5vdGF0aW9uLCBuZXdWYWx1ZSlcbntcblx0dmFyIGNvbW1hbmQgPSAoJycgKyBvcHRpb25zKS50b0xvd2VyQ2FzZSgpLCAvLyBQYXJzZSBjb21tYW5kXG5cdFx0cmV0dXJuZWQgPSBOVUxMLFxuXHRcdGFyZ3MgPSAkLm1ha2VBcnJheShhcmd1bWVudHMpLnNsaWNlKDEpLFxuXHRcdGV2ZW50ID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdLFxuXHRcdG9wdHMgPSB0aGlzWzBdID8gJC5kYXRhKHRoaXNbMF0sIE5BTUVTUEFDRSkgOiBOVUxMO1xuXG5cdC8vIENoZWNrIGZvciBBUEkgcmVxdWVzdFxuXHRpZighYXJndW1lbnRzLmxlbmd0aCAmJiBvcHRzIHx8IGNvbW1hbmQgPT09ICdhcGknKSB7XG5cdFx0cmV0dXJuIG9wdHM7XG5cdH1cblxuXHQvLyBFeGVjdXRlIEFQSSBjb21tYW5kIGlmIHByZXNlbnRcblx0ZWxzZSBpZignc3RyaW5nJyA9PT0gdHlwZW9mIG9wdGlvbnMpIHtcblx0XHR0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgYXBpID0gJC5kYXRhKHRoaXMsIE5BTUVTUEFDRSk7XG5cdFx0XHRpZighYXBpKSB7IHJldHVybiBUUlVFOyB9XG5cblx0XHRcdC8vIENhY2hlIHRoZSBldmVudCBpZiBwb3NzaWJsZVxuXHRcdFx0aWYoZXZlbnQgJiYgZXZlbnQudGltZVN0YW1wKSB7IGFwaS5jYWNoZS5ldmVudCA9IGV2ZW50OyB9XG5cblx0XHRcdC8vIENoZWNrIGZvciBzcGVjaWZpYyBBUEkgY29tbWFuZHNcblx0XHRcdGlmKG5vdGF0aW9uICYmIChjb21tYW5kID09PSAnb3B0aW9uJyB8fCBjb21tYW5kID09PSAnb3B0aW9ucycpKSB7XG5cdFx0XHRcdGlmKG5ld1ZhbHVlICE9PSB1bmRlZmluZWQgfHwgJC5pc1BsYWluT2JqZWN0KG5vdGF0aW9uKSkge1xuXHRcdFx0XHRcdGFwaS5zZXQobm90YXRpb24sIG5ld1ZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm5lZCA9IGFwaS5nZXQobm90YXRpb24pO1xuXHRcdFx0XHRcdHJldHVybiBGQUxTRTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBFeGVjdXRlIEFQSSBjb21tYW5kXG5cdFx0XHRlbHNlIGlmKGFwaVtjb21tYW5kXSkge1xuXHRcdFx0XHRhcGlbY29tbWFuZF0uYXBwbHkoYXBpLCBhcmdzKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiByZXR1cm5lZCAhPT0gTlVMTCA/IHJldHVybmVkIDogdGhpcztcblx0fVxuXG5cdC8vIE5vIEFQSSBjb21tYW5kcy4gdmFsaWRhdGUgcHJvdmlkZWQgb3B0aW9ucyBhbmQgc2V0dXAgcVRpcHNcblx0ZWxzZSBpZignb2JqZWN0JyA9PT0gdHlwZW9mIG9wdGlvbnMgfHwgIWFyZ3VtZW50cy5sZW5ndGgpIHtcblx0XHQvLyBTYW5pdGl6ZSBvcHRpb25zIGZpcnN0XG5cdFx0b3B0cyA9IHNhbml0aXplT3B0aW9ucygkLmV4dGVuZChUUlVFLCB7fSwgb3B0aW9ucykpO1xuXG5cdFx0cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbihpKSB7XG5cdFx0XHR2YXIgYXBpLCBpZDtcblxuXHRcdFx0Ly8gRmluZCBuZXh0IGF2YWlsYWJsZSBJRCwgb3IgdXNlIGN1c3RvbSBJRCBpZiBwcm92aWRlZFxuXHRcdFx0aWQgPSAkLmlzQXJyYXkob3B0cy5pZCkgPyBvcHRzLmlkW2ldIDogb3B0cy5pZDtcblx0XHRcdGlkID0gIWlkIHx8IGlkID09PSBGQUxTRSB8fCBpZC5sZW5ndGggPCAxIHx8IFFUSVAuYXBpW2lkXSA/IFFUSVAubmV4dGlkKysgOiBpZDtcblxuXHRcdFx0Ly8gSW5pdGlhbGl6ZSB0aGUgcVRpcCBhbmQgcmUtZ3JhYiBuZXdseSBzYW5pdGl6ZWQgb3B0aW9uc1xuXHRcdFx0YXBpID0gaW5pdCgkKHRoaXMpLCBpZCwgb3B0cyk7XG5cdFx0XHRpZihhcGkgPT09IEZBTFNFKSB7IHJldHVybiBUUlVFOyB9XG5cdFx0XHRlbHNlIHsgUVRJUC5hcGlbaWRdID0gYXBpOyB9XG5cblx0XHRcdC8vIEluaXRpYWxpemUgcGx1Z2luc1xuXHRcdFx0JC5lYWNoKFBMVUdJTlMsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZih0aGlzLmluaXRpYWxpemUgPT09ICdpbml0aWFsaXplJykgeyB0aGlzKGFwaSk7IH1cblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBBc3NpZ24gaW5pdGlhbCBwcmUtcmVuZGVyIGV2ZW50c1xuXHRcdFx0YXBpLl9hc3NpZ25Jbml0aWFsRXZlbnRzKGV2ZW50KTtcblx0XHR9KTtcblx0fVxufTtcblxuLy8gRXhwb3NlIGNsYXNzXG4kLnF0aXAgPSBRVGlwO1xuXG4vLyBQb3B1bGF0ZWQgaW4gcmVuZGVyIG1ldGhvZFxuUVRJUC5hcGkgPSB7fTtcbjskLmVhY2goe1xuXHQvKiBBbGxvdyBvdGhlciBwbHVnaW5zIHRvIHN1Y2Nlc3NmdWxseSByZXRyaWV2ZSB0aGUgdGl0bGUgb2YgYW4gZWxlbWVudCB3aXRoIGEgcVRpcCBhcHBsaWVkICovXG5cdGF0dHI6IGZ1bmN0aW9uKGF0dHIsIHZhbCkge1xuXHRcdGlmKHRoaXMubGVuZ3RoKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXNbMF0sXG5cdFx0XHRcdHRpdGxlID0gJ3RpdGxlJyxcblx0XHRcdFx0YXBpID0gJC5kYXRhKHNlbGYsICdxdGlwJyk7XG5cblx0XHRcdGlmKGF0dHIgPT09IHRpdGxlICYmIGFwaSAmJiBhcGkub3B0aW9ucyAmJiAnb2JqZWN0JyA9PT0gdHlwZW9mIGFwaSAmJiAnb2JqZWN0JyA9PT0gdHlwZW9mIGFwaS5vcHRpb25zICYmIGFwaS5vcHRpb25zLnN1cHByZXNzKSB7XG5cdFx0XHRcdGlmKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG5cdFx0XHRcdFx0cmV0dXJuICQuYXR0cihzZWxmLCBvbGR0aXRsZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBJZiBxVGlwIGlzIHJlbmRlcmVkIGFuZCB0aXRsZSB3YXMgb3JpZ2luYWxseSB1c2VkIGFzIGNvbnRlbnQsIHVwZGF0ZSBpdFxuXHRcdFx0XHRpZihhcGkgJiYgYXBpLm9wdGlvbnMuY29udGVudC5hdHRyID09PSB0aXRsZSAmJiBhcGkuY2FjaGUuYXR0cikge1xuXHRcdFx0XHRcdGFwaS5zZXQoJ2NvbnRlbnQudGV4dCcsIHZhbCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBVc2UgdGhlIHJlZ3VsYXIgYXR0ciBtZXRob2QgdG8gc2V0LCB0aGVuIGNhY2hlIHRoZSByZXN1bHRcblx0XHRcdFx0cmV0dXJuIHRoaXMuYXR0cihvbGR0aXRsZSwgdmFsKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gJC5mblsnYXR0cicrcmVwbGFjZVN1ZmZpeF0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0fSxcblxuXHQvKiBBbGxvdyBjbG9uZSB0byBjb3JyZWN0bHkgcmV0cmlldmUgY2FjaGVkIHRpdGxlIGF0dHJpYnV0ZXMgKi9cblx0Y2xvbmU6IGZ1bmN0aW9uKGtlZXBEYXRhKSB7XG5cdFx0Ly8gQ2xvbmUgb3VyIGVsZW1lbnQgdXNpbmcgdGhlIHJlYWwgY2xvbmUgbWV0aG9kXG5cdFx0dmFyIGVsZW1zID0gJC5mblsnY2xvbmUnK3JlcGxhY2VTdWZmaXhdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cblx0XHQvLyBHcmFiIGFsbCBlbGVtZW50cyB3aXRoIGFuIG9sZHRpdGxlIHNldCwgYW5kIGNoYW5nZSBpdCB0byByZWd1bGFyIHRpdGxlIGF0dHJpYnV0ZSwgaWYga2VlcERhdGEgaXMgZmFsc2Vcblx0XHRpZigha2VlcERhdGEpIHtcblx0XHRcdGVsZW1zLmZpbHRlcignWycrb2xkdGl0bGUrJ10nKS5hdHRyKCd0aXRsZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gJC5hdHRyKHRoaXMsIG9sZHRpdGxlKTtcblx0XHRcdH0pXG5cdFx0XHQucmVtb3ZlQXR0cihvbGR0aXRsZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGVsZW1zO1xuXHR9XG59LCBmdW5jdGlvbihuYW1lLCBmdW5jKSB7XG5cdGlmKCFmdW5jIHx8ICQuZm5bbmFtZStyZXBsYWNlU3VmZml4XSkgeyByZXR1cm4gVFJVRTsgfVxuXG5cdHZhciBvbGQgPSAkLmZuW25hbWUrcmVwbGFjZVN1ZmZpeF0gPSAkLmZuW25hbWVdO1xuXHQkLmZuW25hbWVdID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCBvbGQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0fTtcbn0pO1xuXG4vKiBGaXJlIG9mZiAncmVtb3ZlcXRpcCcgaGFuZGxlciBpbiAkLmNsZWFuRGF0YSBpZiBqUXVlcnkgVUkgbm90IHByZXNlbnQgKGl0IGFscmVhZHkgZG9lcyBzaW1pbGFyKS5cbiAqIFRoaXMgc25pcHBldCBpcyB0YWtlbiBkaXJlY3RseSBmcm9tIGpRdWVyeSBVSSBzb3VyY2UgY29kZSBmb3VuZCBoZXJlOlxuICogICAgIGh0dHA6Ly9jb2RlLmpxdWVyeS5jb20vdWkvanF1ZXJ5LXVpLWdpdC5qc1xuICovXG5pZighJC51aSkge1xuXHQkWydjbGVhbkRhdGEnK3JlcGxhY2VTdWZmaXhdID0gJC5jbGVhbkRhdGE7XG5cdCQuY2xlYW5EYXRhID0gZnVuY3Rpb24oIGVsZW1zICkge1xuXHRcdGZvcih2YXIgaSA9IDAsIGVsZW07IChlbGVtID0gJCggZWxlbXNbaV0gKSkubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmKGVsZW0uYXR0cihBVFRSX0hBUykpIHtcblx0XHRcdFx0LyogZXNsaW50LWRpc2FibGUgbm8tZW1wdHkgKi9cblx0XHRcdFx0dHJ5IHsgZWxlbS50cmlnZ2VySGFuZGxlcigncmVtb3ZlcXRpcCcpOyB9XG5cdFx0XHRcdGNhdGNoKCBlICkge31cblx0XHRcdFx0LyogZXNsaW50LWVuYWJsZSBuby1lbXB0eSAqL1xuXHRcdFx0fVxuXHRcdH1cblx0XHQkWydjbGVhbkRhdGEnK3JlcGxhY2VTdWZmaXhdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdH07XG59XG47Ly8gcVRpcCB2ZXJzaW9uXG5RVElQLnZlcnNpb24gPSAnMy4wLjMnO1xuXG4vLyBCYXNlIElEIGZvciBhbGwgcVRpcHNcblFUSVAubmV4dGlkID0gMDtcblxuLy8gSW5hY3RpdmUgZXZlbnRzIGFycmF5XG5RVElQLmluYWN0aXZlRXZlbnRzID0gSU5BQ1RJVkVfRVZFTlRTO1xuXG4vLyBCYXNlIHotaW5kZXggZm9yIGFsbCBxVGlwc1xuUVRJUC56aW5kZXggPSAxNTAwMDtcblxuLy8gRGVmaW5lIGNvbmZpZ3VyYXRpb24gZGVmYXVsdHNcblFUSVAuZGVmYXVsdHMgPSB7XG5cdHByZXJlbmRlcjogRkFMU0UsXG5cdGlkOiBGQUxTRSxcblx0b3ZlcndyaXRlOiBUUlVFLFxuXHRzdXBwcmVzczogVFJVRSxcblx0Y29udGVudDoge1xuXHRcdHRleHQ6IFRSVUUsXG5cdFx0YXR0cjogJ3RpdGxlJyxcblx0XHR0aXRsZTogRkFMU0UsXG5cdFx0YnV0dG9uOiBGQUxTRVxuXHR9LFxuXHRwb3NpdGlvbjoge1xuXHRcdG15OiAndG9wIGxlZnQnLFxuXHRcdGF0OiAnYm90dG9tIHJpZ2h0Jyxcblx0XHR0YXJnZXQ6IEZBTFNFLFxuXHRcdGNvbnRhaW5lcjogRkFMU0UsXG5cdFx0dmlld3BvcnQ6IEZBTFNFLFxuXHRcdGFkanVzdDoge1xuXHRcdFx0eDogMCwgeTogMCxcblx0XHRcdG1vdXNlOiBUUlVFLFxuXHRcdFx0c2Nyb2xsOiBUUlVFLFxuXHRcdFx0cmVzaXplOiBUUlVFLFxuXHRcdFx0bWV0aG9kOiAnZmxpcGludmVydCBmbGlwaW52ZXJ0J1xuXHRcdH0sXG5cdFx0ZWZmZWN0OiBmdW5jdGlvbihhcGksIHBvcykge1xuXHRcdFx0JCh0aGlzKS5hbmltYXRlKHBvcywge1xuXHRcdFx0XHRkdXJhdGlvbjogMjAwLFxuXHRcdFx0XHRxdWV1ZTogRkFMU0Vcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblx0c2hvdzoge1xuXHRcdHRhcmdldDogRkFMU0UsXG5cdFx0ZXZlbnQ6ICdtb3VzZWVudGVyJyxcblx0XHRlZmZlY3Q6IFRSVUUsXG5cdFx0ZGVsYXk6IDkwLFxuXHRcdHNvbG86IEZBTFNFLFxuXHRcdHJlYWR5OiBGQUxTRSxcblx0XHRhdXRvZm9jdXM6IEZBTFNFXG5cdH0sXG5cdGhpZGU6IHtcblx0XHR0YXJnZXQ6IEZBTFNFLFxuXHRcdGV2ZW50OiAnbW91c2VsZWF2ZScsXG5cdFx0ZWZmZWN0OiBUUlVFLFxuXHRcdGRlbGF5OiAwLFxuXHRcdGZpeGVkOiBGQUxTRSxcblx0XHRpbmFjdGl2ZTogRkFMU0UsXG5cdFx0bGVhdmU6ICd3aW5kb3cnLFxuXHRcdGRpc3RhbmNlOiBGQUxTRVxuXHR9LFxuXHRzdHlsZToge1xuXHRcdGNsYXNzZXM6ICcnLFxuXHRcdHdpZGdldDogRkFMU0UsXG5cdFx0d2lkdGg6IEZBTFNFLFxuXHRcdGhlaWdodDogRkFMU0UsXG5cdFx0ZGVmOiBUUlVFXG5cdH0sXG5cdGV2ZW50czoge1xuXHRcdHJlbmRlcjogTlVMTCxcblx0XHRtb3ZlOiBOVUxMLFxuXHRcdHNob3c6IE5VTEwsXG5cdFx0aGlkZTogTlVMTCxcblx0XHR0b2dnbGU6IE5VTEwsXG5cdFx0dmlzaWJsZTogTlVMTCxcblx0XHRoaWRkZW46IE5VTEwsXG5cdFx0Zm9jdXM6IE5VTEwsXG5cdFx0Ymx1cjogTlVMTFxuXHR9XG59O1xuO3ZhciBUSVAsXG5jcmVhdGVWTUwsXG5TQ0FMRSxcblBJWEVMX1JBVElPLFxuQkFDS0lOR19TVE9SRV9SQVRJTyxcblxuLy8gQ29tbW9uIENTUyBzdHJpbmdzXG5NQVJHSU4gPSAnbWFyZ2luJyxcbkJPUkRFUiA9ICdib3JkZXInLFxuQ09MT1IgPSAnY29sb3InLFxuQkdfQ09MT1IgPSAnYmFja2dyb3VuZC1jb2xvcicsXG5UUkFOU1BBUkVOVCA9ICd0cmFuc3BhcmVudCcsXG5JTVBPUlRBTlQgPSAnICFpbXBvcnRhbnQnLFxuXG4vLyBDaGVjayBpZiB0aGUgYnJvd3NlciBzdXBwb3J0cyA8Y2FudmFzLz4gZWxlbWVudHNcbkhBU0NBTlZBUyA9ICEhZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykuZ2V0Q29udGV4dCxcblxuLy8gSW52YWxpZCBjb2xvdXIgdmFsdWVzIHVzZWQgaW4gcGFyc2VDb2xvdXJzKClcbklOVkFMSUQgPSAvcmdiYT9cXCgwLCAwLCAwKCwgMCk/XFwpfHRyYW5zcGFyZW50fCMxMjM0NTYvaTtcblxuLy8gQ2FtZWwtY2FzZSBtZXRob2QsIHRha2VuIGZyb20galF1ZXJ5IHNvdXJjZVxuLy8gaHR0cDovL2NvZGUuanF1ZXJ5LmNvbS9qcXVlcnktMS44LjAuanNcbmZ1bmN0aW9uIGNhbWVsKHMpIHsgcmV0dXJuIHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnNsaWNlKDEpOyB9XG5cbi8qXG4gKiBNb2RpZmllZCBmcm9tIE1vZGVybml6cidzIHRlc3RQcm9wc0FsbCgpXG4gKiBodHRwOi8vbW9kZXJuaXpyLmNvbS9kb3dubG9hZHMvbW9kZXJuaXpyLWxhdGVzdC5qc1xuICovXG52YXIgY3NzUHJvcHMgPSB7fSwgY3NzUHJlZml4ZXMgPSBbJ1dlYmtpdCcsICdPJywgJ01veicsICdtcyddO1xuZnVuY3Rpb24gdmVuZG9yQ3NzKGVsZW0sIHByb3ApIHtcblx0dmFyIHVjUHJvcCA9IHByb3AuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLnNsaWNlKDEpLFxuXHRcdHByb3BzID0gKHByb3AgKyAnICcgKyBjc3NQcmVmaXhlcy5qb2luKHVjUHJvcCArICcgJykgKyB1Y1Byb3ApLnNwbGl0KCcgJyksXG5cdFx0Y3VyLCB2YWwsIGkgPSAwO1xuXG5cdC8vIElmIHRoZSBwcm9wZXJ0eSBoYXMgYWxyZWFkeSBiZWVuIG1hcHBlZC4uLlxuXHRpZihjc3NQcm9wc1twcm9wXSkgeyByZXR1cm4gZWxlbS5jc3MoY3NzUHJvcHNbcHJvcF0pOyB9XG5cblx0d2hpbGUoY3VyID0gcHJvcHNbaSsrXSkge1xuXHRcdGlmKCh2YWwgPSBlbGVtLmNzcyhjdXIpKSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjc3NQcm9wc1twcm9wXSA9IGN1cjtcblx0XHRcdHJldHVybiB2YWw7XG5cdFx0fVxuXHR9XG59XG5cbi8vIFBhcnNlIGEgZ2l2ZW4gZWxlbWVudHMgQ1NTIHByb3BlcnR5IGludG8gYW4gaW50XG5mdW5jdGlvbiBpbnRDc3MoZWxlbSwgcHJvcCkge1xuXHRyZXR1cm4gTWF0aC5jZWlsKHBhcnNlRmxvYXQodmVuZG9yQ3NzKGVsZW0sIHByb3ApKSk7XG59XG5cblxuLy8gVk1MIGNyZWF0aW9uIChmb3IgSUUgb25seSlcbmlmKCFIQVNDQU5WQVMpIHtcblx0Y3JlYXRlVk1MID0gZnVuY3Rpb24odGFnLCBwcm9wcywgc3R5bGUpIHtcblx0XHRyZXR1cm4gJzxxdGlwdm1sOicrdGFnKycgeG1sbnM9XCJ1cm46c2NoZW1hcy1taWNyb3NvZnQuY29tOnZtbFwiIGNsYXNzPVwicXRpcC12bWxcIiAnKyhwcm9wc3x8JycpK1xuXHRcdFx0JyBzdHlsZT1cImJlaGF2aW9yOiB1cmwoI2RlZmF1bHQjVk1MKTsgJysoc3R5bGV8fCcnKSsgJ1wiIC8+Jztcblx0fTtcbn1cblxuLy8gQ2FudmFzIG9ubHkgZGVmaW5pdGlvbnNcbmVsc2Uge1xuXHRQSVhFTF9SQVRJTyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG5cdEJBQ0tJTkdfU1RPUkVfUkFUSU8gPSAoZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGNvbnRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKS5nZXRDb250ZXh0KCcyZCcpO1xuXHRcdHJldHVybiBjb250ZXh0LmJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgY29udGV4dC53ZWJraXRCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IGNvbnRleHQubW96QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuXHRcdFx0XHRjb250ZXh0Lm1zQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCBjb250ZXh0Lm9CYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IDE7XG5cdH0pKCk7XG5cdFNDQUxFID0gUElYRUxfUkFUSU8gLyBCQUNLSU5HX1NUT1JFX1JBVElPO1xufVxuXG5cbmZ1bmN0aW9uIFRpcChxdGlwLCBvcHRpb25zKSB7XG5cdHRoaXMuX25zID0gJ3RpcCc7XG5cdHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cdHRoaXMub2Zmc2V0ID0gb3B0aW9ucy5vZmZzZXQ7XG5cdHRoaXMuc2l6ZSA9IFsgb3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQgXTtcblxuXHQvLyBJbml0aWFsaXplXG5cdHRoaXMucXRpcCA9IHF0aXA7XG5cdHRoaXMuaW5pdChxdGlwKTtcbn1cblxuJC5leHRlbmQoVGlwLnByb3RvdHlwZSwge1xuXHRpbml0OiBmdW5jdGlvbihxdGlwKSB7XG5cdFx0dmFyIGNvbnRleHQsIHRpcDtcblxuXHRcdC8vIENyZWF0ZSB0aXAgZWxlbWVudCBhbmQgcHJlcGVuZCB0byB0aGUgdG9vbHRpcFxuXHRcdHRpcCA9IHRoaXMuZWxlbWVudCA9IHF0aXAuZWxlbWVudHMudGlwID0gJCgnPGRpdiAvPicsIHsgJ2NsYXNzJzogTkFNRVNQQUNFKyctdGlwJyB9KS5wcmVwZW5kVG8ocXRpcC50b29sdGlwKTtcblxuXHRcdC8vIENyZWF0ZSB0aXAgZHJhd2luZyBlbGVtZW50KHMpXG5cdFx0aWYoSEFTQ0FOVkFTKSB7XG5cdFx0XHQvLyBzYXZlKCkgYXMgc29vbiBhcyB3ZSBjcmVhdGUgdGhlIGNhbnZhcyBlbGVtZW50IHNvIEZGMiBkb2Vzbid0IGJvcmsgb24gb3VyIGZpcnN0IHJlc3RvcmUoKSFcblx0XHRcdGNvbnRleHQgPSAkKCc8Y2FudmFzIC8+JykuYXBwZW5kVG8odGhpcy5lbGVtZW50KVswXS5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdFx0XHQvLyBTZXR1cCBjb25zdGFudCBwYXJhbWV0ZXJzXG5cdFx0XHRjb250ZXh0LmxpbmVKb2luID0gJ21pdGVyJztcblx0XHRcdGNvbnRleHQubWl0ZXJMaW1pdCA9IDEwMDAwMDtcblx0XHRcdGNvbnRleHQuc2F2ZSgpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGNvbnRleHQgPSBjcmVhdGVWTUwoJ3NoYXBlJywgJ2Nvb3Jkb3JpZ2luPVwiMCwwXCInLCAncG9zaXRpb246YWJzb2x1dGU7Jyk7XG5cdFx0XHR0aGlzLmVsZW1lbnQuaHRtbChjb250ZXh0ICsgY29udGV4dCk7XG5cblx0XHRcdC8vIFByZXZlbnQgbW91c2luZyBkb3duIG9uIHRoZSB0aXAgc2luY2UgaXQgY2F1c2VzIHByb2JsZW1zIHdpdGggLmxpdmUoKSBoYW5kbGluZyBpbiBJRSBkdWUgdG8gVk1MXG5cdFx0XHRxdGlwLl9iaW5kKCAkKCcqJywgdGlwKS5hZGQodGlwKSwgWydjbGljaycsICdtb3VzZWRvd24nXSwgZnVuY3Rpb24oZXZlbnQpIHsgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IH0sIHRoaXMuX25zKTtcblx0XHR9XG5cblx0XHQvLyBCaW5kIHVwZGF0ZSBldmVudHNcblx0XHRxdGlwLl9iaW5kKHF0aXAudG9vbHRpcCwgJ3Rvb2x0aXBtb3ZlJywgdGhpcy5yZXBvc2l0aW9uLCB0aGlzLl9ucywgdGhpcyk7XG5cblx0XHQvLyBDcmVhdGUgaXRcblx0XHR0aGlzLmNyZWF0ZSgpO1xuXHR9LFxuXG5cdF9zd2FwRGltZW5zaW9uczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zaXplWzBdID0gdGhpcy5vcHRpb25zLmhlaWdodDtcblx0XHR0aGlzLnNpemVbMV0gPSB0aGlzLm9wdGlvbnMud2lkdGg7XG5cdH0sXG5cdF9yZXNldERpbWVuc2lvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2l6ZVswXSA9IHRoaXMub3B0aW9ucy53aWR0aDtcblx0XHR0aGlzLnNpemVbMV0gPSB0aGlzLm9wdGlvbnMuaGVpZ2h0O1xuXHR9LFxuXG5cdF91c2VUaXRsZTogZnVuY3Rpb24oY29ybmVyKSB7XG5cdFx0dmFyIHRpdGxlYmFyID0gdGhpcy5xdGlwLmVsZW1lbnRzLnRpdGxlYmFyO1xuXHRcdHJldHVybiB0aXRsZWJhciAmJiAoXG5cdFx0XHRjb3JuZXIueSA9PT0gVE9QIHx8IGNvcm5lci55ID09PSBDRU5URVIgJiYgdGhpcy5lbGVtZW50LnBvc2l0aW9uKCkudG9wICsgdGhpcy5zaXplWzFdIC8gMiArIHRoaXMub3B0aW9ucy5vZmZzZXQgPCB0aXRsZWJhci5vdXRlckhlaWdodChUUlVFKVxuXHRcdCk7XG5cdH0sXG5cblx0X3BhcnNlQ29ybmVyOiBmdW5jdGlvbihjb3JuZXIpIHtcblx0XHR2YXIgbXkgPSB0aGlzLnF0aXAub3B0aW9ucy5wb3NpdGlvbi5teTtcblxuXHRcdC8vIERldGVjdCBjb3JuZXIgYW5kIG1pbWljIHByb3BlcnRpZXNcblx0XHRpZihjb3JuZXIgPT09IEZBTFNFIHx8IG15ID09PSBGQUxTRSkge1xuXHRcdFx0Y29ybmVyID0gRkFMU0U7XG5cdFx0fVxuXHRcdGVsc2UgaWYoY29ybmVyID09PSBUUlVFKSB7XG5cdFx0XHRjb3JuZXIgPSBuZXcgQ09STkVSKCBteS5zdHJpbmcoKSApO1xuXHRcdH1cblx0XHRlbHNlIGlmKCFjb3JuZXIuc3RyaW5nKSB7XG5cdFx0XHRjb3JuZXIgPSBuZXcgQ09STkVSKGNvcm5lcik7XG5cdFx0XHRjb3JuZXIuZml4ZWQgPSBUUlVFO1xuXHRcdH1cblxuXHRcdHJldHVybiBjb3JuZXI7XG5cdH0sXG5cblx0X3BhcnNlV2lkdGg6IGZ1bmN0aW9uKGNvcm5lciwgc2lkZSwgdXNlKSB7XG5cdFx0dmFyIGVsZW1lbnRzID0gdGhpcy5xdGlwLmVsZW1lbnRzLFxuXHRcdFx0cHJvcCA9IEJPUkRFUiArIGNhbWVsKHNpZGUpICsgJ1dpZHRoJztcblxuXHRcdHJldHVybiAodXNlID8gaW50Q3NzKHVzZSwgcHJvcCkgOiBcblx0XHRcdGludENzcyhlbGVtZW50cy5jb250ZW50LCBwcm9wKSB8fFxuXHRcdFx0aW50Q3NzKHRoaXMuX3VzZVRpdGxlKGNvcm5lcikgJiYgZWxlbWVudHMudGl0bGViYXIgfHwgZWxlbWVudHMuY29udGVudCwgcHJvcCkgfHxcblx0XHRcdGludENzcyhlbGVtZW50cy50b29sdGlwLCBwcm9wKVxuXHRcdCkgfHwgMDtcblx0fSxcblxuXHRfcGFyc2VSYWRpdXM6IGZ1bmN0aW9uKGNvcm5lcikge1xuXHRcdHZhciBlbGVtZW50cyA9IHRoaXMucXRpcC5lbGVtZW50cyxcblx0XHRcdHByb3AgPSBCT1JERVIgKyBjYW1lbChjb3JuZXIueSkgKyBjYW1lbChjb3JuZXIueCkgKyAnUmFkaXVzJztcblxuXHRcdHJldHVybiBCUk9XU0VSLmllIDwgOSA/IDAgOlxuXHRcdFx0aW50Q3NzKHRoaXMuX3VzZVRpdGxlKGNvcm5lcikgJiYgZWxlbWVudHMudGl0bGViYXIgfHwgZWxlbWVudHMuY29udGVudCwgcHJvcCkgfHxcblx0XHRcdGludENzcyhlbGVtZW50cy50b29sdGlwLCBwcm9wKSB8fCAwO1xuXHR9LFxuXG5cdF9pbnZhbGlkQ29sb3VyOiBmdW5jdGlvbihlbGVtLCBwcm9wLCBjb21wYXJlKSB7XG5cdFx0dmFyIHZhbCA9IGVsZW0uY3NzKHByb3ApO1xuXHRcdHJldHVybiAhdmFsIHx8IGNvbXBhcmUgJiYgdmFsID09PSBlbGVtLmNzcyhjb21wYXJlKSB8fCBJTlZBTElELnRlc3QodmFsKSA/IEZBTFNFIDogdmFsO1xuXHR9LFxuXG5cdF9wYXJzZUNvbG91cnM6IGZ1bmN0aW9uKGNvcm5lcikge1xuXHRcdHZhciBlbGVtZW50cyA9IHRoaXMucXRpcC5lbGVtZW50cyxcblx0XHRcdHRpcCA9IHRoaXMuZWxlbWVudC5jc3MoJ2Nzc1RleHQnLCAnJyksXG5cdFx0XHRib3JkZXJTaWRlID0gQk9SREVSICsgY2FtZWwoY29ybmVyWyBjb3JuZXIucHJlY2VkYW5jZSBdKSArIGNhbWVsKENPTE9SKSxcblx0XHRcdGNvbG9yRWxlbSA9IHRoaXMuX3VzZVRpdGxlKGNvcm5lcikgJiYgZWxlbWVudHMudGl0bGViYXIgfHwgZWxlbWVudHMuY29udGVudCxcblx0XHRcdGNzcyA9IHRoaXMuX2ludmFsaWRDb2xvdXIsIGNvbG9yID0gW107XG5cblx0XHQvLyBBdHRlbXB0IHRvIGRldGVjdCB0aGUgYmFja2dyb3VuZCBjb2xvdXIgZnJvbSB2YXJpb3VzIGVsZW1lbnRzLCBsZWZ0LXRvLXJpZ2h0IHByZWNlZGFuY2Vcblx0XHRjb2xvclswXSA9IGNzcyh0aXAsIEJHX0NPTE9SKSB8fCBjc3MoY29sb3JFbGVtLCBCR19DT0xPUikgfHwgY3NzKGVsZW1lbnRzLmNvbnRlbnQsIEJHX0NPTE9SKSB8fFxuXHRcdFx0Y3NzKGVsZW1lbnRzLnRvb2x0aXAsIEJHX0NPTE9SKSB8fCB0aXAuY3NzKEJHX0NPTE9SKTtcblxuXHRcdC8vIEF0dGVtcHQgdG8gZGV0ZWN0IHRoZSBjb3JyZWN0IGJvcmRlciBzaWRlIGNvbG91ciBmcm9tIHZhcmlvdXMgZWxlbWVudHMsIGxlZnQtdG8tcmlnaHQgcHJlY2VkYW5jZVxuXHRcdGNvbG9yWzFdID0gY3NzKHRpcCwgYm9yZGVyU2lkZSwgQ09MT1IpIHx8IGNzcyhjb2xvckVsZW0sIGJvcmRlclNpZGUsIENPTE9SKSB8fFxuXHRcdFx0Y3NzKGVsZW1lbnRzLmNvbnRlbnQsIGJvcmRlclNpZGUsIENPTE9SKSB8fCBjc3MoZWxlbWVudHMudG9vbHRpcCwgYm9yZGVyU2lkZSwgQ09MT1IpIHx8IGVsZW1lbnRzLnRvb2x0aXAuY3NzKGJvcmRlclNpZGUpO1xuXG5cdFx0Ly8gUmVzZXQgYmFja2dyb3VuZCBhbmQgYm9yZGVyIGNvbG91cnNcblx0XHQkKCcqJywgdGlwKS5hZGQodGlwKS5jc3MoJ2Nzc1RleHQnLCBCR19DT0xPUisnOicrVFJBTlNQQVJFTlQrSU1QT1JUQU5UKyc7JytCT1JERVIrJzowJytJTVBPUlRBTlQrJzsnKTtcblxuXHRcdHJldHVybiBjb2xvcjtcblx0fSxcblxuXHRfY2FsY3VsYXRlU2l6ZTogZnVuY3Rpb24oY29ybmVyKSB7XG5cdFx0dmFyIHkgPSBjb3JuZXIucHJlY2VkYW5jZSA9PT0gWSxcblx0XHRcdHdpZHRoID0gdGhpcy5vcHRpb25zLndpZHRoLFxuXHRcdFx0aGVpZ2h0ID0gdGhpcy5vcHRpb25zLmhlaWdodCxcblx0XHRcdGlzQ2VudGVyID0gY29ybmVyLmFiYnJldigpID09PSAnYycsXG5cdFx0XHRiYXNlID0gKHkgPyB3aWR0aDogaGVpZ2h0KSAqIChpc0NlbnRlciA/IDAuNSA6IDEpLFxuXHRcdFx0cG93ID0gTWF0aC5wb3csXG5cdFx0XHRyb3VuZCA9IE1hdGgucm91bmQsXG5cdFx0XHRiaWdIeXAsIHJhdGlvLCByZXN1bHQsXG5cblx0XHRzbWFsbEh5cCA9IE1hdGguc3FydCggcG93KGJhc2UsIDIpICsgcG93KGhlaWdodCwgMikgKSxcblx0XHRoeXAgPSBbXG5cdFx0XHR0aGlzLmJvcmRlciAvIGJhc2UgKiBzbWFsbEh5cCxcblx0XHRcdHRoaXMuYm9yZGVyIC8gaGVpZ2h0ICogc21hbGxIeXBcblx0XHRdO1xuXG5cdFx0aHlwWzJdID0gTWF0aC5zcXJ0KCBwb3coaHlwWzBdLCAyKSAtIHBvdyh0aGlzLmJvcmRlciwgMikgKTtcblx0XHRoeXBbM10gPSBNYXRoLnNxcnQoIHBvdyhoeXBbMV0sIDIpIC0gcG93KHRoaXMuYm9yZGVyLCAyKSApO1xuXG5cdFx0YmlnSHlwID0gc21hbGxIeXAgKyBoeXBbMl0gKyBoeXBbM10gKyAoaXNDZW50ZXIgPyAwIDogaHlwWzBdKTtcblx0XHRyYXRpbyA9IGJpZ0h5cCAvIHNtYWxsSHlwO1xuXG5cdFx0cmVzdWx0ID0gWyByb3VuZChyYXRpbyAqIHdpZHRoKSwgcm91bmQocmF0aW8gKiBoZWlnaHQpIF07XG5cdFx0cmV0dXJuIHkgPyByZXN1bHQgOiByZXN1bHQucmV2ZXJzZSgpO1xuXHR9LFxuXG5cdC8vIFRpcCBjb29yZGluYXRlcyBjYWxjdWxhdG9yXG5cdF9jYWxjdWxhdGVUaXA6IGZ1bmN0aW9uKGNvcm5lciwgc2l6ZSwgc2NhbGUpIHtcblx0XHRzY2FsZSA9IHNjYWxlIHx8IDE7XG5cdFx0c2l6ZSA9IHNpemUgfHwgdGhpcy5zaXplO1xuXG5cdFx0dmFyIHdpZHRoID0gc2l6ZVswXSAqIHNjYWxlLFxuXHRcdFx0aGVpZ2h0ID0gc2l6ZVsxXSAqIHNjYWxlLFxuXHRcdFx0d2lkdGgyID0gTWF0aC5jZWlsKHdpZHRoIC8gMiksIGhlaWdodDIgPSBNYXRoLmNlaWwoaGVpZ2h0IC8gMiksXG5cblx0XHQvLyBEZWZpbmUgdGlwIGNvb3JkaW5hdGVzIGluIHRlcm1zIG9mIGhlaWdodCBhbmQgd2lkdGggdmFsdWVzXG5cdFx0dGlwcyA9IHtcblx0XHRcdGJyOlx0WzAsMCxcdFx0d2lkdGgsaGVpZ2h0LFx0d2lkdGgsMF0sXG5cdFx0XHRibDpcdFswLDAsXHRcdHdpZHRoLDAsXHRcdDAsaGVpZ2h0XSxcblx0XHRcdHRyOlx0WzAsaGVpZ2h0LFx0d2lkdGgsMCxcdFx0d2lkdGgsaGVpZ2h0XSxcblx0XHRcdHRsOlx0WzAsMCxcdFx0MCxoZWlnaHQsXHRcdHdpZHRoLGhlaWdodF0sXG5cdFx0XHR0YzpcdFswLGhlaWdodCxcdHdpZHRoMiwwLFx0XHR3aWR0aCxoZWlnaHRdLFxuXHRcdFx0YmM6XHRbMCwwLFx0XHR3aWR0aCwwLFx0XHR3aWR0aDIsaGVpZ2h0XSxcblx0XHRcdHJjOlx0WzAsMCxcdFx0d2lkdGgsaGVpZ2h0MixcdDAsaGVpZ2h0XSxcblx0XHRcdGxjOlx0W3dpZHRoLDAsXHR3aWR0aCxoZWlnaHQsXHQwLGhlaWdodDJdXG5cdFx0fTtcblxuXHRcdC8vIFNldCBjb21tb24gc2lkZSBzaGFwZXNcblx0XHR0aXBzLmx0ID0gdGlwcy5icjsgdGlwcy5ydCA9IHRpcHMuYmw7XG5cdFx0dGlwcy5sYiA9IHRpcHMudHI7IHRpcHMucmIgPSB0aXBzLnRsO1xuXG5cdFx0cmV0dXJuIHRpcHNbIGNvcm5lci5hYmJyZXYoKSBdO1xuXHR9LFxuXG5cdC8vIFRpcCBjb29yZGluYXRlcyBkcmF3ZXIgKGNhbnZhcylcblx0X2RyYXdDb29yZHM6IGZ1bmN0aW9uKGNvbnRleHQsIGNvb3Jkcykge1xuXHRcdGNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0Y29udGV4dC5tb3ZlVG8oY29vcmRzWzBdLCBjb29yZHNbMV0pO1xuXHRcdGNvbnRleHQubGluZVRvKGNvb3Jkc1syXSwgY29vcmRzWzNdKTtcblx0XHRjb250ZXh0LmxpbmVUbyhjb29yZHNbNF0sIGNvb3Jkc1s1XSk7XG5cdFx0Y29udGV4dC5jbG9zZVBhdGgoKTtcblx0fSxcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIERldGVybWluZSB0aXAgY29ybmVyXG5cdFx0dmFyIGMgPSB0aGlzLmNvcm5lciA9IChIQVNDQU5WQVMgfHwgQlJPV1NFUi5pZSkgJiYgdGhpcy5fcGFyc2VDb3JuZXIodGhpcy5vcHRpb25zLmNvcm5lcik7XG5cblx0XHQvLyBJZiB3ZSBoYXZlIGEgdGlwIGNvcm5lci4uLlxuXHRcdHRoaXMuZW5hYmxlZCA9ICEhdGhpcy5jb3JuZXIgJiYgdGhpcy5jb3JuZXIuYWJicmV2KCkgIT09ICdjJztcblx0XHRpZih0aGlzLmVuYWJsZWQpIHtcblx0XHRcdC8vIENhY2hlIGl0XG5cdFx0XHR0aGlzLnF0aXAuY2FjaGUuY29ybmVyID0gYy5jbG9uZSgpO1xuXG5cdFx0XHQvLyBDcmVhdGUgaXRcblx0XHRcdHRoaXMudXBkYXRlKCk7XG5cdFx0fVxuXG5cdFx0Ly8gVG9nZ2xlIHRpcCBlbGVtZW50XG5cdFx0dGhpcy5lbGVtZW50LnRvZ2dsZSh0aGlzLmVuYWJsZWQpO1xuXG5cdFx0cmV0dXJuIHRoaXMuY29ybmVyO1xuXHR9LFxuXG5cdHVwZGF0ZTogZnVuY3Rpb24oY29ybmVyLCBwb3NpdGlvbikge1xuXHRcdGlmKCF0aGlzLmVuYWJsZWQpIHsgcmV0dXJuIHRoaXM7IH1cblxuXHRcdHZhciBlbGVtZW50cyA9IHRoaXMucXRpcC5lbGVtZW50cyxcblx0XHRcdHRpcCA9IHRoaXMuZWxlbWVudCxcblx0XHRcdGlubmVyID0gdGlwLmNoaWxkcmVuKCksXG5cdFx0XHRvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuXHRcdFx0Y3VyU2l6ZSA9IHRoaXMuc2l6ZSxcblx0XHRcdG1pbWljID0gb3B0aW9ucy5taW1pYyxcblx0XHRcdHJvdW5kID0gTWF0aC5yb3VuZCxcblx0XHRcdGNvbG9yLCBwcmVjZWRhbmNlLCBjb250ZXh0LFxuXHRcdFx0Y29vcmRzLCBiaWdDb29yZHMsIHRyYW5zbGF0ZSwgbmV3U2l6ZSwgYm9yZGVyO1xuXG5cdFx0Ly8gUmUtZGV0ZXJtaW5lIHRpcCBpZiBub3QgYWxyZWFkeSBzZXRcblx0XHRpZighY29ybmVyKSB7IGNvcm5lciA9IHRoaXMucXRpcC5jYWNoZS5jb3JuZXIgfHwgdGhpcy5jb3JuZXI7IH1cblxuXHRcdC8vIFVzZSBjb3JuZXIgcHJvcGVydHkgaWYgd2UgZGV0ZWN0IGFuIGludmFsaWQgbWltaWMgdmFsdWVcblx0XHRpZihtaW1pYyA9PT0gRkFMU0UpIHsgbWltaWMgPSBjb3JuZXI7IH1cblxuXHRcdC8vIE90aGVyd2lzZSBpbmhlcml0IG1pbWljIHByb3BlcnRpZXMgZnJvbSB0aGUgY29ybmVyIG9iamVjdCBhcyBuZWNlc3Nhcnlcblx0XHRlbHNlIHtcblx0XHRcdG1pbWljID0gbmV3IENPUk5FUihtaW1pYyk7XG5cdFx0XHRtaW1pYy5wcmVjZWRhbmNlID0gY29ybmVyLnByZWNlZGFuY2U7XG5cblx0XHRcdGlmKG1pbWljLnggPT09ICdpbmhlcml0JykgeyBtaW1pYy54ID0gY29ybmVyLng7IH1cblx0XHRcdGVsc2UgaWYobWltaWMueSA9PT0gJ2luaGVyaXQnKSB7IG1pbWljLnkgPSBjb3JuZXIueTsgfVxuXHRcdFx0ZWxzZSBpZihtaW1pYy54ID09PSBtaW1pYy55KSB7XG5cdFx0XHRcdG1pbWljWyBjb3JuZXIucHJlY2VkYW5jZSBdID0gY29ybmVyWyBjb3JuZXIucHJlY2VkYW5jZSBdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRwcmVjZWRhbmNlID0gbWltaWMucHJlY2VkYW5jZTtcblxuXHRcdC8vIEVuc3VyZSB0aGUgdGlwIHdpZHRoLmhlaWdodCBhcmUgcmVsYXRpdmUgdG8gdGhlIHRpcCBwb3NpdGlvblxuXHRcdGlmKGNvcm5lci5wcmVjZWRhbmNlID09PSBYKSB7IHRoaXMuX3N3YXBEaW1lbnNpb25zKCk7IH1cblx0XHRlbHNlIHsgdGhpcy5fcmVzZXREaW1lbnNpb25zKCk7IH1cblxuXHRcdC8vIFVwZGF0ZSBvdXIgY29sb3Vyc1xuXHRcdGNvbG9yID0gdGhpcy5jb2xvciA9IHRoaXMuX3BhcnNlQ29sb3Vycyhjb3JuZXIpO1xuXG5cdFx0Ly8gRGV0ZWN0IGJvcmRlciB3aWR0aCwgdGFraW5nIGludG8gYWNjb3VudCBjb2xvdXJzXG5cdFx0aWYoY29sb3JbMV0gIT09IFRSQU5TUEFSRU5UKSB7XG5cdFx0XHQvLyBHcmFiIGJvcmRlciB3aWR0aFxuXHRcdFx0Ym9yZGVyID0gdGhpcy5ib3JkZXIgPSB0aGlzLl9wYXJzZVdpZHRoKGNvcm5lciwgY29ybmVyW2Nvcm5lci5wcmVjZWRhbmNlXSk7XG5cblx0XHRcdC8vIElmIGJvcmRlciB3aWR0aCBpc24ndCB6ZXJvLCB1c2UgYm9yZGVyIGNvbG9yIGFzIGZpbGwgaWYgaXQncyBub3QgaW52YWxpZCAoMS4wIHN0eWxlIHRpcHMpXG5cdFx0XHRpZihvcHRpb25zLmJvcmRlciAmJiBib3JkZXIgPCAxICYmICFJTlZBTElELnRlc3QoY29sb3JbMV0pKSB7IGNvbG9yWzBdID0gY29sb3JbMV07IH1cblxuXHRcdFx0Ly8gU2V0IGJvcmRlciB3aWR0aCAodXNlIGRldGVjdGVkIGJvcmRlciB3aWR0aCBpZiBvcHRpb25zLmJvcmRlciBpcyB0cnVlKVxuXHRcdFx0dGhpcy5ib3JkZXIgPSBib3JkZXIgPSBvcHRpb25zLmJvcmRlciAhPT0gVFJVRSA/IG9wdGlvbnMuYm9yZGVyIDogYm9yZGVyO1xuXHRcdH1cblxuXHRcdC8vIEJvcmRlciBjb2xvdXIgd2FzIGludmFsaWQsIHNldCBib3JkZXIgdG8gemVyb1xuXHRcdGVsc2UgeyB0aGlzLmJvcmRlciA9IGJvcmRlciA9IDA7IH1cblxuXHRcdC8vIERldGVybWluZSB0aXAgc2l6ZVxuXHRcdG5ld1NpemUgPSB0aGlzLnNpemUgPSB0aGlzLl9jYWxjdWxhdGVTaXplKGNvcm5lcik7XG5cdFx0dGlwLmNzcyh7XG5cdFx0XHR3aWR0aDogbmV3U2l6ZVswXSxcblx0XHRcdGhlaWdodDogbmV3U2l6ZVsxXSxcblx0XHRcdGxpbmVIZWlnaHQ6IG5ld1NpemVbMV0rJ3B4J1xuXHRcdH0pO1xuXG5cdFx0Ly8gQ2FsY3VsYXRlIHRpcCB0cmFuc2xhdGlvblxuXHRcdGlmKGNvcm5lci5wcmVjZWRhbmNlID09PSBZKSB7XG5cdFx0XHR0cmFuc2xhdGUgPSBbXG5cdFx0XHRcdHJvdW5kKG1pbWljLnggPT09IExFRlQgPyBib3JkZXIgOiBtaW1pYy54ID09PSBSSUdIVCA/IG5ld1NpemVbMF0gLSBjdXJTaXplWzBdIC0gYm9yZGVyIDogKG5ld1NpemVbMF0gLSBjdXJTaXplWzBdKSAvIDIpLFxuXHRcdFx0XHRyb3VuZChtaW1pYy55ID09PSBUT1AgPyBuZXdTaXplWzFdIC0gY3VyU2l6ZVsxXSA6IDApXG5cdFx0XHRdO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRyYW5zbGF0ZSA9IFtcblx0XHRcdFx0cm91bmQobWltaWMueCA9PT0gTEVGVCA/IG5ld1NpemVbMF0gLSBjdXJTaXplWzBdIDogMCksXG5cdFx0XHRcdHJvdW5kKG1pbWljLnkgPT09IFRPUCA/IGJvcmRlciA6IG1pbWljLnkgPT09IEJPVFRPTSA/IG5ld1NpemVbMV0gLSBjdXJTaXplWzFdIC0gYm9yZGVyIDogKG5ld1NpemVbMV0gLSBjdXJTaXplWzFdKSAvIDIpXG5cdFx0XHRdO1xuXHRcdH1cblxuXHRcdC8vIENhbnZhcyBkcmF3aW5nIGltcGxlbWVudGF0aW9uXG5cdFx0aWYoSEFTQ0FOVkFTKSB7XG5cdFx0XHQvLyBHcmFiIGNhbnZhcyBjb250ZXh0IGFuZCBjbGVhci9zYXZlIGl0XG5cdFx0XHRjb250ZXh0ID0gaW5uZXJbMF0uZ2V0Q29udGV4dCgnMmQnKTtcblx0XHRcdGNvbnRleHQucmVzdG9yZSgpOyBjb250ZXh0LnNhdmUoKTtcblx0XHRcdGNvbnRleHQuY2xlYXJSZWN0KDAsMCw2MDAwLDYwMDApO1xuXG5cdFx0XHQvLyBDYWxjdWxhdGUgY29vcmRpbmF0ZXNcblx0XHRcdGNvb3JkcyA9IHRoaXMuX2NhbGN1bGF0ZVRpcChtaW1pYywgY3VyU2l6ZSwgU0NBTEUpO1xuXHRcdFx0YmlnQ29vcmRzID0gdGhpcy5fY2FsY3VsYXRlVGlwKG1pbWljLCB0aGlzLnNpemUsIFNDQUxFKTtcblxuXHRcdFx0Ly8gU2V0IHRoZSBjYW52YXMgc2l6ZSB1c2luZyBjYWxjdWxhdGVkIHNpemVcblx0XHRcdGlubmVyLmF0dHIoV0lEVEgsIG5ld1NpemVbMF0gKiBTQ0FMRSkuYXR0cihIRUlHSFQsIG5ld1NpemVbMV0gKiBTQ0FMRSk7XG5cdFx0XHRpbm5lci5jc3MoV0lEVEgsIG5ld1NpemVbMF0pLmNzcyhIRUlHSFQsIG5ld1NpemVbMV0pO1xuXG5cdFx0XHQvLyBEcmF3IHRoZSBvdXRlci1zdHJva2UgdGlwXG5cdFx0XHR0aGlzLl9kcmF3Q29vcmRzKGNvbnRleHQsIGJpZ0Nvb3Jkcyk7XG5cdFx0XHRjb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yWzFdO1xuXHRcdFx0Y29udGV4dC5maWxsKCk7XG5cblx0XHRcdC8vIERyYXcgdGhlIGFjdHVhbCB0aXBcblx0XHRcdGNvbnRleHQudHJhbnNsYXRlKHRyYW5zbGF0ZVswXSAqIFNDQUxFLCB0cmFuc2xhdGVbMV0gKiBTQ0FMRSk7XG5cdFx0XHR0aGlzLl9kcmF3Q29vcmRzKGNvbnRleHQsIGNvb3Jkcyk7XG5cdFx0XHRjb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yWzBdO1xuXHRcdFx0Y29udGV4dC5maWxsKCk7XG5cdFx0fVxuXG5cdFx0Ly8gVk1MIChJRSBQcm9wcmlldGFyeSBpbXBsZW1lbnRhdGlvbilcblx0XHRlbHNlIHtcblx0XHRcdC8vIENhbGN1bGF0ZSBjb29yZGluYXRlc1xuXHRcdFx0Y29vcmRzID0gdGhpcy5fY2FsY3VsYXRlVGlwKG1pbWljKTtcblxuXHRcdFx0Ly8gU2V0dXAgY29vcmRpbmF0ZXMgc3RyaW5nXG5cdFx0XHRjb29yZHMgPSAnbScgKyBjb29yZHNbMF0gKyAnLCcgKyBjb29yZHNbMV0gKyAnIGwnICsgY29vcmRzWzJdICtcblx0XHRcdFx0JywnICsgY29vcmRzWzNdICsgJyAnICsgY29vcmRzWzRdICsgJywnICsgY29vcmRzWzVdICsgJyB4ZSc7XG5cblx0XHRcdC8vIFNldHVwIFZNTC1zcGVjaWZpYyBvZmZzZXQgZm9yIHBpeGVsLXBlcmZlY3Rpb25cblx0XHRcdHRyYW5zbGF0ZVsyXSA9IGJvcmRlciAmJiAvXihyfGIpL2kudGVzdChjb3JuZXIuc3RyaW5nKCkpID9cblx0XHRcdFx0QlJPV1NFUi5pZSA9PT0gOCA/IDIgOiAxIDogMDtcblxuXHRcdFx0Ly8gU2V0IGluaXRpYWwgQ1NTXG5cdFx0XHRpbm5lci5jc3Moe1xuXHRcdFx0XHRjb29yZHNpemU6IG5ld1NpemVbMF0rYm9yZGVyICsgJyAnICsgbmV3U2l6ZVsxXStib3JkZXIsXG5cdFx0XHRcdGFudGlhbGlhczogJycrKG1pbWljLnN0cmluZygpLmluZGV4T2YoQ0VOVEVSKSA+IC0xKSxcblx0XHRcdFx0bGVmdDogdHJhbnNsYXRlWzBdIC0gdHJhbnNsYXRlWzJdICogTnVtYmVyKHByZWNlZGFuY2UgPT09IFgpLFxuXHRcdFx0XHR0b3A6IHRyYW5zbGF0ZVsxXSAtIHRyYW5zbGF0ZVsyXSAqIE51bWJlcihwcmVjZWRhbmNlID09PSBZKSxcblx0XHRcdFx0d2lkdGg6IG5ld1NpemVbMF0gKyBib3JkZXIsXG5cdFx0XHRcdGhlaWdodDogbmV3U2l6ZVsxXSArIGJvcmRlclxuXHRcdFx0fSlcblx0XHRcdC5lYWNoKGZ1bmN0aW9uKGkpIHtcblx0XHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKTtcblxuXHRcdFx0XHQvLyBTZXQgc2hhcGUgc3BlY2lmaWMgYXR0cmlidXRlc1xuXHRcdFx0XHQkdGhpc1sgJHRoaXMucHJvcCA/ICdwcm9wJyA6ICdhdHRyJyBdKHtcblx0XHRcdFx0XHRjb29yZHNpemU6IG5ld1NpemVbMF0rYm9yZGVyICsgJyAnICsgbmV3U2l6ZVsxXStib3JkZXIsXG5cdFx0XHRcdFx0cGF0aDogY29vcmRzLFxuXHRcdFx0XHRcdGZpbGxjb2xvcjogY29sb3JbMF0sXG5cdFx0XHRcdFx0ZmlsbGVkOiAhIWksXG5cdFx0XHRcdFx0c3Ryb2tlZDogIWlcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRvZ2dsZSghIShib3JkZXIgfHwgaSkpO1xuXG5cdFx0XHRcdC8vIENoZWNrIGlmIGJvcmRlciBpcyBlbmFibGVkIGFuZCBhZGQgc3Ryb2tlIGVsZW1lbnRcblx0XHRcdFx0IWkgJiYgJHRoaXMuaHRtbCggY3JlYXRlVk1MKFxuXHRcdFx0XHRcdCdzdHJva2UnLCAnd2VpZ2h0PVwiJytib3JkZXIqMisncHhcIiBjb2xvcj1cIicrY29sb3JbMV0rJ1wiIG1pdGVybGltaXQ9XCIxMDAwXCIgam9pbnN0eWxlPVwibWl0ZXJcIidcblx0XHRcdFx0KSApO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0Ly8gT3BlcmEgYnVnICMzNTcgLSBJbmNvcnJlY3QgdGlwIHBvc2l0aW9uXG5cdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL0NyYWdhODkvcVRpcDIvaXNzdWVzLzM2N1xuXHRcdHdpbmRvdy5vcGVyYSAmJiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0ZWxlbWVudHMudGlwLmNzcyh7XG5cdFx0XHRcdGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuXHRcdFx0XHR2aXNpYmlsaXR5OiAndmlzaWJsZSdcblx0XHRcdH0pO1xuXHRcdH0sIDEpO1xuXG5cdFx0Ly8gUG9zaXRpb24gaWYgbmVlZGVkXG5cdFx0aWYocG9zaXRpb24gIT09IEZBTFNFKSB7IHRoaXMuY2FsY3VsYXRlKGNvcm5lciwgbmV3U2l6ZSk7IH1cblx0fSxcblxuXHRjYWxjdWxhdGU6IGZ1bmN0aW9uKGNvcm5lciwgc2l6ZSkge1xuXHRcdGlmKCF0aGlzLmVuYWJsZWQpIHsgcmV0dXJuIEZBTFNFOyB9XG5cblx0XHR2YXIgc2VsZiA9IHRoaXMsXG5cdFx0XHRlbGVtZW50cyA9IHRoaXMucXRpcC5lbGVtZW50cyxcblx0XHRcdHRpcCA9IHRoaXMuZWxlbWVudCxcblx0XHRcdHVzZXJPZmZzZXQgPSB0aGlzLm9wdGlvbnMub2Zmc2V0LFxuXHRcdFx0cG9zaXRpb24gPSB7fSxcblx0XHRcdHByZWNlZGFuY2UsIGNvcm5lcnM7XG5cblx0XHQvLyBJbmhlcml0IGNvcm5lciBpZiBub3QgcHJvdmlkZWRcblx0XHRjb3JuZXIgPSBjb3JuZXIgfHwgdGhpcy5jb3JuZXI7XG5cdFx0cHJlY2VkYW5jZSA9IGNvcm5lci5wcmVjZWRhbmNlO1xuXG5cdFx0Ly8gRGV0ZXJtaW5lIHdoaWNoIHRpcCBkaW1lbnNpb24gdG8gdXNlIGZvciBhZGp1c3RtZW50XG5cdFx0c2l6ZSA9IHNpemUgfHwgdGhpcy5fY2FsY3VsYXRlU2l6ZShjb3JuZXIpO1xuXG5cdFx0Ly8gU2V0dXAgY29ybmVycyBhbmQgb2Zmc2V0IGFycmF5XG5cdFx0Y29ybmVycyA9IFsgY29ybmVyLngsIGNvcm5lci55IF07XG5cdFx0aWYocHJlY2VkYW5jZSA9PT0gWCkgeyBjb3JuZXJzLnJldmVyc2UoKTsgfVxuXG5cdFx0Ly8gQ2FsY3VsYXRlIHRpcCBwb3NpdGlvblxuXHRcdCQuZWFjaChjb3JuZXJzLCBmdW5jdGlvbihpLCBzaWRlKSB7XG5cdFx0XHR2YXIgYiwgYmMsIGJyO1xuXG5cdFx0XHRpZihzaWRlID09PSBDRU5URVIpIHtcblx0XHRcdFx0YiA9IHByZWNlZGFuY2UgPT09IFkgPyBMRUZUIDogVE9QO1xuXHRcdFx0XHRwb3NpdGlvblsgYiBdID0gJzUwJSc7XG5cdFx0XHRcdHBvc2l0aW9uW01BUkdJTisnLScgKyBiXSA9IC1NYXRoLnJvdW5kKHNpemVbIHByZWNlZGFuY2UgPT09IFkgPyAwIDogMSBdIC8gMikgKyB1c2VyT2Zmc2V0O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGIgPSBzZWxmLl9wYXJzZVdpZHRoKGNvcm5lciwgc2lkZSwgZWxlbWVudHMudG9vbHRpcCk7XG5cdFx0XHRcdGJjID0gc2VsZi5fcGFyc2VXaWR0aChjb3JuZXIsIHNpZGUsIGVsZW1lbnRzLmNvbnRlbnQpO1xuXHRcdFx0XHRiciA9IHNlbGYuX3BhcnNlUmFkaXVzKGNvcm5lcik7XG5cblx0XHRcdFx0cG9zaXRpb25bIHNpZGUgXSA9IE1hdGgubWF4KC1zZWxmLmJvcmRlciwgaSA/IGJjIDogdXNlck9mZnNldCArIChiciA+IGIgPyBiciA6IC1iKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyBBZGp1c3QgZm9yIHRpcCBzaXplXG5cdFx0cG9zaXRpb25bIGNvcm5lcltwcmVjZWRhbmNlXSBdIC09IHNpemVbIHByZWNlZGFuY2UgPT09IFggPyAwIDogMSBdO1xuXG5cdFx0Ly8gU2V0IGFuZCByZXR1cm4gbmV3IHBvc2l0aW9uXG5cdFx0dGlwLmNzcyh7IG1hcmdpbjogJycsIHRvcDogJycsIGJvdHRvbTogJycsIGxlZnQ6ICcnLCByaWdodDogJycgfSkuY3NzKHBvc2l0aW9uKTtcblx0XHRyZXR1cm4gcG9zaXRpb247XG5cdH0sXG5cblx0cmVwb3NpdGlvbjogZnVuY3Rpb24oZXZlbnQsIGFwaSwgcG9zKSB7XG5cdFx0aWYoIXRoaXMuZW5hYmxlZCkgeyByZXR1cm47IH1cblxuXHRcdHZhciBjYWNoZSA9IGFwaS5jYWNoZSxcblx0XHRcdG5ld0Nvcm5lciA9IHRoaXMuY29ybmVyLmNsb25lKCksXG5cdFx0XHRhZGp1c3QgPSBwb3MuYWRqdXN0ZWQsXG5cdFx0XHRtZXRob2QgPSBhcGkub3B0aW9ucy5wb3NpdGlvbi5hZGp1c3QubWV0aG9kLnNwbGl0KCcgJyksXG5cdFx0XHRob3Jpem9udGFsID0gbWV0aG9kWzBdLFxuXHRcdFx0dmVydGljYWwgPSBtZXRob2RbMV0gfHwgbWV0aG9kWzBdLFxuXHRcdFx0c2hpZnQgPSB7IGxlZnQ6IEZBTFNFLCB0b3A6IEZBTFNFLCB4OiAwLCB5OiAwIH0sXG5cdFx0XHRvZmZzZXQsIGNzcyA9IHt9LCBwcm9wcztcblxuXHRcdGZ1bmN0aW9uIHNoaWZ0ZmxpcChkaXJlY3Rpb24sIHByZWNlZGFuY2UsIHBvcHBvc2l0ZSwgc2lkZSwgb3Bwb3NpdGUpIHtcblx0XHRcdC8vIEhvcml6b250YWwgLSBTaGlmdCBvciBmbGlwIG1ldGhvZFxuXHRcdFx0aWYoZGlyZWN0aW9uID09PSBTSElGVCAmJiBuZXdDb3JuZXIucHJlY2VkYW5jZSA9PT0gcHJlY2VkYW5jZSAmJiBhZGp1c3Rbc2lkZV0gJiYgbmV3Q29ybmVyW3BvcHBvc2l0ZV0gIT09IENFTlRFUikge1xuXHRcdFx0XHRuZXdDb3JuZXIucHJlY2VkYW5jZSA9IG5ld0Nvcm5lci5wcmVjZWRhbmNlID09PSBYID8gWSA6IFg7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmKGRpcmVjdGlvbiAhPT0gU0hJRlQgJiYgYWRqdXN0W3NpZGVdKXtcblx0XHRcdFx0bmV3Q29ybmVyW3ByZWNlZGFuY2VdID0gbmV3Q29ybmVyW3ByZWNlZGFuY2VdID09PSBDRU5URVIgP1xuXHRcdFx0XHRcdGFkanVzdFtzaWRlXSA+IDAgPyBzaWRlIDogb3Bwb3NpdGUgOlxuXHRcdFx0XHRcdG5ld0Nvcm5lcltwcmVjZWRhbmNlXSA9PT0gc2lkZSA/IG9wcG9zaXRlIDogc2lkZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBzaGlmdG9ubHkoeHksIHNpZGUsIG9wcG9zaXRlKSB7XG5cdFx0XHRpZihuZXdDb3JuZXJbeHldID09PSBDRU5URVIpIHtcblx0XHRcdFx0Y3NzW01BUkdJTisnLScrc2lkZV0gPSBzaGlmdFt4eV0gPSBvZmZzZXRbTUFSR0lOKyctJytzaWRlXSAtIGFkanVzdFtzaWRlXTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRwcm9wcyA9IG9mZnNldFtvcHBvc2l0ZV0gIT09IHVuZGVmaW5lZCA/XG5cdFx0XHRcdFx0WyBhZGp1c3Rbc2lkZV0sIC1vZmZzZXRbc2lkZV0gXSA6IFsgLWFkanVzdFtzaWRlXSwgb2Zmc2V0W3NpZGVdIF07XG5cblx0XHRcdFx0aWYoIChzaGlmdFt4eV0gPSBNYXRoLm1heChwcm9wc1swXSwgcHJvcHNbMV0pKSA+IHByb3BzWzBdICkge1xuXHRcdFx0XHRcdHBvc1tzaWRlXSAtPSBhZGp1c3Rbc2lkZV07XG5cdFx0XHRcdFx0c2hpZnRbc2lkZV0gPSBGQUxTRTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNzc1sgb2Zmc2V0W29wcG9zaXRlXSAhPT0gdW5kZWZpbmVkID8gb3Bwb3NpdGUgOiBzaWRlIF0gPSBzaGlmdFt4eV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gSWYgb3VyIHRpcCBwb3NpdGlvbiBpc24ndCBmaXhlZCBlLmcuIGRvZXNuJ3QgYWRqdXN0IHdpdGggdmlld3BvcnQuLi5cblx0XHRpZih0aGlzLmNvcm5lci5maXhlZCAhPT0gVFJVRSkge1xuXHRcdFx0Ly8gUGVyZm9ybSBzaGlmdC9mbGlwIGFkanVzdG1lbnRzXG5cdFx0XHRzaGlmdGZsaXAoaG9yaXpvbnRhbCwgWCwgWSwgTEVGVCwgUklHSFQpO1xuXHRcdFx0c2hpZnRmbGlwKHZlcnRpY2FsLCBZLCBYLCBUT1AsIEJPVFRPTSk7XG5cblx0XHRcdC8vIFVwZGF0ZSBhbmQgcmVkcmF3IHRoZSB0aXAgaWYgbmVlZGVkIChjaGVjayBjYWNoZWQgZGV0YWlscyBvZiBsYXN0IGRyYXduIHRpcClcblx0XHRcdGlmKG5ld0Nvcm5lci5zdHJpbmcoKSAhPT0gY2FjaGUuY29ybmVyLnN0cmluZygpIHx8IGNhY2hlLmNvcm5lclRvcCAhPT0gYWRqdXN0LnRvcCB8fCBjYWNoZS5jb3JuZXJMZWZ0ICE9PSBhZGp1c3QubGVmdCkge1xuXHRcdFx0XHR0aGlzLnVwZGF0ZShuZXdDb3JuZXIsIEZBTFNFKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBTZXR1cCB0aXAgb2Zmc2V0IHByb3BlcnRpZXNcblx0XHRvZmZzZXQgPSB0aGlzLmNhbGN1bGF0ZShuZXdDb3JuZXIpO1xuXG5cdFx0Ly8gUmVhZGp1c3Qgb2Zmc2V0IG9iamVjdCB0byBtYWtlIGl0IGxlZnQvdG9wXG5cdFx0aWYob2Zmc2V0LnJpZ2h0ICE9PSB1bmRlZmluZWQpIHsgb2Zmc2V0LmxlZnQgPSAtb2Zmc2V0LnJpZ2h0OyB9XG5cdFx0aWYob2Zmc2V0LmJvdHRvbSAhPT0gdW5kZWZpbmVkKSB7IG9mZnNldC50b3AgPSAtb2Zmc2V0LmJvdHRvbTsgfVxuXHRcdG9mZnNldC51c2VyID0gdGhpcy5vZmZzZXQ7XG5cblx0XHQvLyBQZXJmb3JtIHNoaWZ0IGFkanVzdG1lbnRzXG5cdFx0c2hpZnQubGVmdCA9IGhvcml6b250YWwgPT09IFNISUZUICYmICEhYWRqdXN0LmxlZnQ7XG5cdFx0aWYoc2hpZnQubGVmdCkge1xuXHRcdFx0c2hpZnRvbmx5KFgsIExFRlQsIFJJR0hUKTtcblx0XHR9XG5cdFx0c2hpZnQudG9wID0gdmVydGljYWwgPT09IFNISUZUICYmICEhYWRqdXN0LnRvcDtcblx0XHRpZihzaGlmdC50b3ApIHtcblx0XHRcdHNoaWZ0b25seShZLCBUT1AsIEJPVFRPTSk7XG5cdFx0fVxuXG5cdFx0Lypcblx0XHQqIElmIHRoZSB0aXAgaXMgYWRqdXN0ZWQgaW4gYm90aCBkaW1lbnNpb25zLCBvciBpbiBhXG5cdFx0KiBkaXJlY3Rpb24gdGhhdCB3b3VsZCBjYXVzZSBpdCB0byBiZSBhbnl3aGVyZSBidXQgdGhlXG5cdFx0KiBvdXRlciBib3JkZXIsIGhpZGUgaXQhXG5cdFx0Ki9cblx0XHR0aGlzLmVsZW1lbnQuY3NzKGNzcykudG9nZ2xlKFxuXHRcdFx0IShzaGlmdC54ICYmIHNoaWZ0LnkgfHwgbmV3Q29ybmVyLnggPT09IENFTlRFUiAmJiBzaGlmdC55IHx8IG5ld0Nvcm5lci55ID09PSBDRU5URVIgJiYgc2hpZnQueClcblx0XHQpO1xuXG5cdFx0Ly8gQWRqdXN0IHBvc2l0aW9uIHRvIGFjY29tb2RhdGUgdGlwIGRpbWVuc2lvbnNcblx0XHRwb3MubGVmdCAtPSBvZmZzZXQubGVmdC5jaGFyQXQgPyBvZmZzZXQudXNlciA6XG5cdFx0XHRob3Jpem9udGFsICE9PSBTSElGVCB8fCBzaGlmdC50b3AgfHwgIXNoaWZ0LmxlZnQgJiYgIXNoaWZ0LnRvcCA/IG9mZnNldC5sZWZ0ICsgdGhpcy5ib3JkZXIgOiAwO1xuXHRcdHBvcy50b3AgLT0gb2Zmc2V0LnRvcC5jaGFyQXQgPyBvZmZzZXQudXNlciA6XG5cdFx0XHR2ZXJ0aWNhbCAhPT0gU0hJRlQgfHwgc2hpZnQubGVmdCB8fCAhc2hpZnQubGVmdCAmJiAhc2hpZnQudG9wID8gb2Zmc2V0LnRvcCArIHRoaXMuYm9yZGVyIDogMDtcblxuXHRcdC8vIENhY2hlIGRldGFpbHNcblx0XHRjYWNoZS5jb3JuZXJMZWZ0ID0gYWRqdXN0LmxlZnQ7IGNhY2hlLmNvcm5lclRvcCA9IGFkanVzdC50b3A7XG5cdFx0Y2FjaGUuY29ybmVyID0gbmV3Q29ybmVyLmNsb25lKCk7XG5cdH0sXG5cblx0ZGVzdHJveTogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gVW5iaW5kIGV2ZW50c1xuXHRcdHRoaXMucXRpcC5fdW5iaW5kKHRoaXMucXRpcC50b29sdGlwLCB0aGlzLl9ucyk7XG5cblx0XHQvLyBSZW1vdmUgdGhlIHRpcCBlbGVtZW50KHMpXG5cdFx0aWYodGhpcy5xdGlwLmVsZW1lbnRzLnRpcCkge1xuXHRcdFx0dGhpcy5xdGlwLmVsZW1lbnRzLnRpcC5maW5kKCcqJylcblx0XHRcdFx0LnJlbW92ZSgpLmVuZCgpLnJlbW92ZSgpO1xuXHRcdH1cblx0fVxufSk7XG5cblRJUCA9IFBMVUdJTlMudGlwID0gZnVuY3Rpb24oYXBpKSB7XG5cdHJldHVybiBuZXcgVGlwKGFwaSwgYXBpLm9wdGlvbnMuc3R5bGUudGlwKTtcbn07XG5cbi8vIEluaXRpYWxpemUgdGlwIG9uIHJlbmRlclxuVElQLmluaXRpYWxpemUgPSAncmVuZGVyJztcblxuLy8gU2V0dXAgcGx1Z2luIHNhbml0aXphdGlvbiBvcHRpb25zXG5USVAuc2FuaXRpemUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cdGlmKG9wdGlvbnMuc3R5bGUgJiYgJ3RpcCcgaW4gb3B0aW9ucy5zdHlsZSkge1xuXHRcdHZhciBvcHRzID0gb3B0aW9ucy5zdHlsZS50aXA7XG5cdFx0aWYodHlwZW9mIG9wdHMgIT09ICdvYmplY3QnKSB7IG9wdHMgPSBvcHRpb25zLnN0eWxlLnRpcCA9IHsgY29ybmVyOiBvcHRzIH07IH1cblx0XHRpZighKC9zdHJpbmd8Ym9vbGVhbi9pKS50ZXN0KHR5cGVvZiBvcHRzLmNvcm5lcikpIHsgb3B0cy5jb3JuZXIgPSBUUlVFOyB9XG5cdH1cbn07XG5cbi8vIEFkZCBuZXcgb3B0aW9uIGNoZWNrcyBmb3IgdGhlIHBsdWdpblxuQ0hFQ0tTLnRpcCA9IHtcblx0J15wb3NpdGlvbi5teXxzdHlsZS50aXAuKGNvcm5lcnxtaW1pY3xib3JkZXIpJCc6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIE1ha2Ugc3VyZSBhIHRpcCBjYW4gYmUgZHJhd25cblx0XHR0aGlzLmNyZWF0ZSgpO1xuXG5cdFx0Ly8gUmVwb3NpdGlvbiB0aGUgdG9vbHRpcFxuXHRcdHRoaXMucXRpcC5yZXBvc2l0aW9uKCk7XG5cdH0sXG5cdCdec3R5bGUudGlwLihoZWlnaHR8d2lkdGgpJCc6IGZ1bmN0aW9uKG9iaikge1xuXHRcdC8vIFJlLXNldCBkaW1lbnNpb25zIGFuZCByZWRyYXcgdGhlIHRpcFxuXHRcdHRoaXMuc2l6ZSA9IFsgb2JqLndpZHRoLCBvYmouaGVpZ2h0IF07XG5cdFx0dGhpcy51cGRhdGUoKTtcblxuXHRcdC8vIFJlcG9zaXRpb24gdGhlIHRvb2x0aXBcblx0XHR0aGlzLnF0aXAucmVwb3NpdGlvbigpO1xuXHR9LFxuXHQnXmNvbnRlbnQudGl0bGV8c3R5bGUuKGNsYXNzZXN8d2lkZ2V0KSQnOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnVwZGF0ZSgpO1xuXHR9XG59O1xuXG4vLyBFeHRlbmQgb3JpZ2luYWwgcVRpcCBkZWZhdWx0c1xuJC5leHRlbmQoVFJVRSwgUVRJUC5kZWZhdWx0cywge1xuXHRzdHlsZToge1xuXHRcdHRpcDoge1xuXHRcdFx0Y29ybmVyOiBUUlVFLFxuXHRcdFx0bWltaWM6IEZBTFNFLFxuXHRcdFx0d2lkdGg6IDYsXG5cdFx0XHRoZWlnaHQ6IDYsXG5cdFx0XHRib3JkZXI6IFRSVUUsXG5cdFx0XHRvZmZzZXQ6IDBcblx0XHR9XG5cdH1cbn0pO1xuO3ZhciBNT0RBTCwgT1ZFUkxBWSxcblx0TU9EQUxDTEFTUyA9ICdxdGlwLW1vZGFsJyxcblx0TU9EQUxTRUxFQ1RPUiA9ICcuJytNT0RBTENMQVNTO1xuXG5PVkVSTEFZID0gZnVuY3Rpb24oKVxue1xuXHR2YXIgc2VsZiA9IHRoaXMsXG5cdFx0Zm9jdXNhYmxlRWxlbXMgPSB7fSxcblx0XHRjdXJyZW50LFxuXHRcdHByZXZTdGF0ZSxcblx0XHRlbGVtO1xuXG5cdC8vIE1vZGlmaWVkIGNvZGUgZnJvbSBqUXVlcnkgVUkgMS4xMC4wIHNvdXJjZVxuXHQvLyBodHRwOi8vY29kZS5qcXVlcnkuY29tL3VpLzEuMTAuMC9qcXVlcnktdWkuanNcblx0ZnVuY3Rpb24gZm9jdXNhYmxlKGVsZW1lbnQpIHtcblx0XHQvLyBVc2UgdGhlIGRlZmluZWQgZm9jdXNhYmxlIGNoZWNrZXIgd2hlbiBwb3NzaWJsZVxuXHRcdGlmKCQuZXhwclsnOiddLmZvY3VzYWJsZSkgeyByZXR1cm4gJC5leHByWyc6J10uZm9jdXNhYmxlOyB9XG5cblx0XHR2YXIgaXNUYWJJbmRleE5vdE5hTiA9ICFpc05hTigkLmF0dHIoZWxlbWVudCwgJ3RhYmluZGV4JykpLFxuXHRcdFx0bm9kZU5hbWUgPSBlbGVtZW50Lm5vZGVOYW1lICYmIGVsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSxcblx0XHRcdG1hcCwgbWFwTmFtZSwgaW1nO1xuXG5cdFx0aWYoJ2FyZWEnID09PSBub2RlTmFtZSkge1xuXHRcdFx0bWFwID0gZWxlbWVudC5wYXJlbnROb2RlO1xuXHRcdFx0bWFwTmFtZSA9IG1hcC5uYW1lO1xuXHRcdFx0aWYoIWVsZW1lbnQuaHJlZiB8fCAhbWFwTmFtZSB8fCBtYXAubm9kZU5hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ21hcCcpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0aW1nID0gJCgnaW1nW3VzZW1hcD0jJyArIG1hcE5hbWUgKyAnXScpWzBdO1xuXHRcdFx0cmV0dXJuICEhaW1nICYmIGltZy5pcygnOnZpc2libGUnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gL2lucHV0fHNlbGVjdHx0ZXh0YXJlYXxidXR0b258b2JqZWN0Ly50ZXN0KCBub2RlTmFtZSApID9cblx0XHRcdCFlbGVtZW50LmRpc2FibGVkIDpcblx0XHRcdCdhJyA9PT0gbm9kZU5hbWUgP1xuXHRcdFx0XHRlbGVtZW50LmhyZWYgfHwgaXNUYWJJbmRleE5vdE5hTiA6XG5cdFx0XHRcdGlzVGFiSW5kZXhOb3ROYU5cblx0XHQ7XG5cdH1cblxuXHQvLyBGb2N1cyBpbnB1dHMgdXNpbmcgY2FjaGVkIGZvY3VzYWJsZSBlbGVtZW50cyAoc2VlIHVwZGF0ZSgpKVxuXHRmdW5jdGlvbiBmb2N1c0lucHV0cyhibHVyRWxlbXMpIHtcblx0XHQvLyBCbHVycmluZyBib2R5IGVsZW1lbnQgaW4gSUUgY2F1c2VzIHdpbmRvdy5vcGVuIHdpbmRvd3MgdG8gdW5mb2N1cyFcblx0XHRpZihmb2N1c2FibGVFbGVtcy5sZW5ndGggPCAxICYmIGJsdXJFbGVtcy5sZW5ndGgpIHsgYmx1ckVsZW1zLm5vdCgnYm9keScpLmJsdXIoKTsgfVxuXG5cdFx0Ly8gRm9jdXMgdGhlIGlucHV0c1xuXHRcdGVsc2UgeyBmb2N1c2FibGVFbGVtcy5maXJzdCgpLmZvY3VzKCk7IH1cblx0fVxuXG5cdC8vIFN0ZWFsIGZvY3VzIGZyb20gZWxlbWVudHMgb3V0c2lkZSB0b29sdGlwXG5cdGZ1bmN0aW9uIHN0ZWFsRm9jdXMoZXZlbnQpIHtcblx0XHRpZighZWxlbS5pcygnOnZpc2libGUnKSkgeyByZXR1cm47IH1cblxuXHRcdHZhciB0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCksXG5cdFx0XHR0b29sdGlwID0gY3VycmVudC50b29sdGlwLFxuXHRcdFx0Y29udGFpbmVyID0gdGFyZ2V0LmNsb3Nlc3QoU0VMRUNUT1IpLFxuXHRcdFx0dGFyZ2V0T25Ub3A7XG5cblx0XHQvLyBEZXRlcm1pbmUgaWYgaW5wdXQgY29udGFpbmVyIHRhcmdldCBpcyBhYm92ZSB0aGlzXG5cdFx0dGFyZ2V0T25Ub3AgPSBjb250YWluZXIubGVuZ3RoIDwgMSA/IEZBTFNFIDpcblx0XHRcdHBhcnNlSW50KGNvbnRhaW5lclswXS5zdHlsZS56SW5kZXgsIDEwKSA+IHBhcnNlSW50KHRvb2x0aXBbMF0uc3R5bGUuekluZGV4LCAxMCk7XG5cblx0XHQvLyBJZiB3ZSdyZSBzaG93aW5nIGEgbW9kYWwsIGJ1dCBmb2N1cyBoYXMgbGFuZGVkIG9uIGFuIGlucHV0IGJlbG93XG5cdFx0Ly8gdGhpcyBtb2RhbCwgZGl2ZXJ0IGZvY3VzIHRvIHRoZSBmaXJzdCB2aXNpYmxlIGlucHV0IGluIHRoaXMgbW9kYWxcblx0XHQvLyBvciBpZiB3ZSBjYW4ndCBmaW5kIG9uZS4uLiB0aGUgdG9vbHRpcCBpdHNlbGZcblx0XHRpZighdGFyZ2V0T25Ub3AgJiYgdGFyZ2V0LmNsb3Nlc3QoU0VMRUNUT1IpWzBdICE9PSB0b29sdGlwWzBdKSB7XG5cdFx0XHRmb2N1c0lucHV0cyh0YXJnZXQpO1xuXHRcdH1cblx0fVxuXG5cdCQuZXh0ZW5kKHNlbGYsIHtcblx0XHRpbml0OiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIENyZWF0ZSBkb2N1bWVudCBvdmVybGF5XG5cdFx0XHRlbGVtID0gc2VsZi5lbGVtID0gJCgnPGRpdiAvPicsIHtcblx0XHRcdFx0aWQ6ICdxdGlwLW92ZXJsYXknLFxuXHRcdFx0XHRodG1sOiAnPGRpdj48L2Rpdj4nLFxuXHRcdFx0XHRtb3VzZWRvd246IGZ1bmN0aW9uKCkgeyByZXR1cm4gRkFMU0U7IH1cblx0XHRcdH0pXG5cdFx0XHQuaGlkZSgpO1xuXG5cdFx0XHQvLyBNYWtlIHN1cmUgd2UgY2FuJ3QgZm9jdXMgYW55dGhpbmcgb3V0c2lkZSB0aGUgdG9vbHRpcFxuXHRcdFx0JChkb2N1bWVudC5ib2R5KS5iaW5kKCdmb2N1c2luJytNT0RBTFNFTEVDVE9SLCBzdGVhbEZvY3VzKTtcblxuXHRcdFx0Ly8gQXBwbHkga2V5Ym9hcmQgXCJFc2NhcGUga2V5XCIgY2xvc2UgaGFuZGxlclxuXHRcdFx0JChkb2N1bWVudCkuYmluZCgna2V5ZG93bicrTU9EQUxTRUxFQ1RPUiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0aWYoY3VycmVudCAmJiBjdXJyZW50Lm9wdGlvbnMuc2hvdy5tb2RhbC5lc2NhcGUgJiYgZXZlbnQua2V5Q29kZSA9PT0gMjcpIHtcblx0XHRcdFx0XHRjdXJyZW50LmhpZGUoZXZlbnQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gQXBwbHkgY2xpY2sgaGFuZGxlciBmb3IgYmx1ciBvcHRpb25cblx0XHRcdGVsZW0uYmluZCgnY2xpY2snK01PREFMU0VMRUNUT1IsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdGlmKGN1cnJlbnQgJiYgY3VycmVudC5vcHRpb25zLnNob3cubW9kYWwuYmx1cikge1xuXHRcdFx0XHRcdGN1cnJlbnQuaGlkZShldmVudCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gc2VsZjtcblx0XHR9LFxuXG5cdFx0dXBkYXRlOiBmdW5jdGlvbihhcGkpIHtcblx0XHRcdC8vIFVwZGF0ZSBjdXJyZW50IEFQSSByZWZlcmVuY2Vcblx0XHRcdGN1cnJlbnQgPSBhcGk7XG5cblx0XHRcdC8vIFVwZGF0ZSBmb2N1c2FibGUgZWxlbWVudHMgaWYgZW5hYmxlZFxuXHRcdFx0aWYoYXBpLm9wdGlvbnMuc2hvdy5tb2RhbC5zdGVhbGZvY3VzICE9PSBGQUxTRSkge1xuXHRcdFx0XHRmb2N1c2FibGVFbGVtcyA9IGFwaS50b29sdGlwLmZpbmQoJyonKS5maWx0ZXIoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZvY3VzYWJsZSh0aGlzKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHsgZm9jdXNhYmxlRWxlbXMgPSBbXTsgfVxuXHRcdH0sXG5cblx0XHR0b2dnbGU6IGZ1bmN0aW9uKGFwaSwgc3RhdGUsIGR1cmF0aW9uKSB7XG5cdFx0XHR2YXIgdG9vbHRpcCA9IGFwaS50b29sdGlwLFxuXHRcdFx0XHRvcHRpb25zID0gYXBpLm9wdGlvbnMuc2hvdy5tb2RhbCxcblx0XHRcdFx0ZWZmZWN0ID0gb3B0aW9ucy5lZmZlY3QsXG5cdFx0XHRcdHR5cGUgPSBzdGF0ZSA/ICdzaG93JzogJ2hpZGUnLFxuXHRcdFx0XHR2aXNpYmxlID0gZWxlbS5pcygnOnZpc2libGUnKSxcblx0XHRcdFx0dmlzaWJsZU1vZGFscyA9ICQoTU9EQUxTRUxFQ1RPUikuZmlsdGVyKCc6dmlzaWJsZTpub3QoOmFuaW1hdGVkKScpLm5vdCh0b29sdGlwKTtcblxuXHRcdFx0Ly8gU2V0IGFjdGl2ZSB0b29sdGlwIEFQSSByZWZlcmVuY2Vcblx0XHRcdHNlbGYudXBkYXRlKGFwaSk7XG5cblx0XHRcdC8vIElmIHRoZSBtb2RhbCBjYW4gc3RlYWwgdGhlIGZvY3VzLi4uXG5cdFx0XHQvLyBCbHVyIHRoZSBjdXJyZW50IGl0ZW0gYW5kIGZvY3VzIGFueXRoaW5nIGluIHRoZSBtb2RhbCB3ZSBhblxuXHRcdFx0aWYoc3RhdGUgJiYgb3B0aW9ucy5zdGVhbGZvY3VzICE9PSBGQUxTRSkge1xuXHRcdFx0XHRmb2N1c0lucHV0cyggJCgnOmZvY3VzJykgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVG9nZ2xlIGJhY2tkcm9wIGN1cnNvciBzdHlsZSBvbiBzaG93XG5cdFx0XHRlbGVtLnRvZ2dsZUNsYXNzKCdibHVycycsIG9wdGlvbnMuYmx1cik7XG5cblx0XHRcdC8vIEFwcGVuZCB0byBib2R5IG9uIHNob3dcblx0XHRcdGlmKHN0YXRlKSB7XG5cdFx0XHRcdGVsZW0uYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFByZXZlbnQgbW9kYWwgZnJvbSBjb25mbGljdGluZyB3aXRoIHNob3cuc29sbywgYW5kIGRvbid0IGhpZGUgYmFja2Ryb3AgaXMgb3RoZXIgbW9kYWxzIGFyZSB2aXNpYmxlXG5cdFx0XHRpZihlbGVtLmlzKCc6YW5pbWF0ZWQnKSAmJiB2aXNpYmxlID09PSBzdGF0ZSAmJiBwcmV2U3RhdGUgIT09IEZBTFNFIHx8ICFzdGF0ZSAmJiB2aXNpYmxlTW9kYWxzLmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm4gc2VsZjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gU3RvcCBhbGwgYW5pbWF0aW9uc1xuXHRcdFx0ZWxlbS5zdG9wKFRSVUUsIEZBTFNFKTtcblxuXHRcdFx0Ly8gVXNlIGN1c3RvbSBmdW5jdGlvbiBpZiBwcm92aWRlZFxuXHRcdFx0aWYoJC5pc0Z1bmN0aW9uKGVmZmVjdCkpIHtcblx0XHRcdFx0ZWZmZWN0LmNhbGwoZWxlbSwgc3RhdGUpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBJZiBubyBlZmZlY3QgdHlwZSBpcyBzdXBwbGllZCwgdXNlIGEgc2ltcGxlIHRvZ2dsZVxuXHRcdFx0ZWxzZSBpZihlZmZlY3QgPT09IEZBTFNFKSB7XG5cdFx0XHRcdGVsZW1bIHR5cGUgXSgpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBVc2UgYmFzaWMgZmFkZSBmdW5jdGlvblxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGVsZW0uZmFkZVRvKCBwYXJzZUludChkdXJhdGlvbiwgMTApIHx8IDkwLCBzdGF0ZSA/IDEgOiAwLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZighc3RhdGUpIHsgZWxlbS5oaWRlKCk7IH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFJlc2V0IHBvc2l0aW9uIGFuZCBkZXRhY2ggZnJvbSBib2R5IG9uIGhpZGVcblx0XHRcdGlmKCFzdGF0ZSkge1xuXHRcdFx0XHRlbGVtLnF1ZXVlKGZ1bmN0aW9uKG5leHQpIHtcblx0XHRcdFx0XHRlbGVtLmNzcyh7IGxlZnQ6ICcnLCB0b3A6ICcnIH0pO1xuXHRcdFx0XHRcdGlmKCEkKE1PREFMU0VMRUNUT1IpLmxlbmd0aCkgeyBlbGVtLmRldGFjaCgpOyB9XG5cdFx0XHRcdFx0bmV4dCgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQ2FjaGUgdGhlIHN0YXRlXG5cdFx0XHRwcmV2U3RhdGUgPSBzdGF0ZTtcblxuXHRcdFx0Ly8gSWYgdGhlIHRvb2x0aXAgaXMgZGVzdHJveWVkLCBzZXQgcmVmZXJlbmNlIHRvIG51bGxcblx0XHRcdGlmKGN1cnJlbnQuZGVzdHJveWVkKSB7IGN1cnJlbnQgPSBOVUxMOyB9XG5cblx0XHRcdHJldHVybiBzZWxmO1xuXHRcdH1cblx0fSk7XG5cblx0c2VsZi5pbml0KCk7XG59O1xuT1ZFUkxBWSA9IG5ldyBPVkVSTEFZKCk7XG5cbmZ1bmN0aW9uIE1vZGFsKGFwaSwgb3B0aW9ucykge1xuXHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXHR0aGlzLl9ucyA9ICctbW9kYWwnO1xuXG5cdHRoaXMucXRpcCA9IGFwaTtcblx0dGhpcy5pbml0KGFwaSk7XG59XG5cbiQuZXh0ZW5kKE1vZGFsLnByb3RvdHlwZSwge1xuXHRpbml0OiBmdW5jdGlvbihxdGlwKSB7XG5cdFx0dmFyIHRvb2x0aXAgPSBxdGlwLnRvb2x0aXA7XG5cblx0XHQvLyBJZiBtb2RhbCBpcyBkaXNhYmxlZC4uLiByZXR1cm5cblx0XHRpZighdGhpcy5vcHRpb25zLm9uKSB7IHJldHVybiB0aGlzOyB9XG5cblx0XHQvLyBTZXQgb3ZlcmxheSByZWZlcmVuY2Vcblx0XHRxdGlwLmVsZW1lbnRzLm92ZXJsYXkgPSBPVkVSTEFZLmVsZW07XG5cblx0XHQvLyBBZGQgdW5pcXVlIGF0dHJpYnV0ZSBzbyB3ZSBjYW4gZ3JhYiBtb2RhbCB0b29sdGlwcyBlYXNpbHkgdmlhIGEgU0VMRUNUT1IsIGFuZCBzZXQgei1pbmRleFxuXHRcdHRvb2x0aXAuYWRkQ2xhc3MoTU9EQUxDTEFTUykuY3NzKCd6LWluZGV4JywgUVRJUC5tb2RhbF96aW5kZXggKyAkKE1PREFMU0VMRUNUT1IpLmxlbmd0aCk7XG5cblx0XHQvLyBBcHBseSBvdXIgc2hvdy9oaWRlL2ZvY3VzIG1vZGFsIGV2ZW50c1xuXHRcdHF0aXAuX2JpbmQodG9vbHRpcCwgWyd0b29sdGlwc2hvdycsICd0b29sdGlwaGlkZSddLCBmdW5jdGlvbihldmVudCwgYXBpLCBkdXJhdGlvbikge1xuXHRcdFx0dmFyIG9FdmVudCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQ7XG5cblx0XHRcdC8vIE1ha2Ugc3VyZSBtb3VzZW91dCBkb2Vzbid0IHRyaWdnZXIgYSBoaWRlIHdoZW4gc2hvd2luZyB0aGUgbW9kYWwgYW5kIG1vdXNpbmcgb250byBiYWNrZHJvcFxuXHRcdFx0aWYoZXZlbnQudGFyZ2V0ID09PSB0b29sdGlwWzBdKSB7XG5cdFx0XHRcdGlmKG9FdmVudCAmJiBldmVudC50eXBlID09PSAndG9vbHRpcGhpZGUnICYmIC9tb3VzZShsZWF2ZXxlbnRlcikvLnRlc3Qob0V2ZW50LnR5cGUpICYmICQob0V2ZW50LnJlbGF0ZWRUYXJnZXQpLmNsb3Nlc3QoT1ZFUkxBWS5lbGVtWzBdKS5sZW5ndGgpIHtcblx0XHRcdFx0XHQvKiBlc2xpbnQtZGlzYWJsZSBuby1lbXB0eSAqL1xuXHRcdFx0XHRcdHRyeSB7IGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IH1cblx0XHRcdFx0XHRjYXRjaChlKSB7fVxuXHRcdFx0XHRcdC8qIGVzbGludC1lbmFibGUgbm8tZW1wdHkgKi9cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmKCFvRXZlbnQgfHwgb0V2ZW50ICYmIG9FdmVudC50eXBlICE9PSAndG9vbHRpcHNvbG8nKSB7XG5cdFx0XHRcdFx0dGhpcy50b2dnbGUoZXZlbnQsIGV2ZW50LnR5cGUgPT09ICd0b29sdGlwc2hvdycsIGR1cmF0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sIHRoaXMuX25zLCB0aGlzKTtcblxuXHRcdC8vIEFkanVzdCBtb2RhbCB6LWluZGV4IG9uIHRvb2x0aXAgZm9jdXNcblx0XHRxdGlwLl9iaW5kKHRvb2x0aXAsICd0b29sdGlwZm9jdXMnLCBmdW5jdGlvbihldmVudCwgYXBpKSB7XG5cdFx0XHQvLyBJZiBmb2N1cyB3YXMgY2FuY2VsbGVkIGJlZm9yZSBpdCByZWFjaGVkIHVzLCBkb24ndCBkbyBhbnl0aGluZ1xuXHRcdFx0aWYoZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkgfHwgZXZlbnQudGFyZ2V0ICE9PSB0b29sdGlwWzBdKSB7IHJldHVybjsgfVxuXG5cdFx0XHR2YXIgcXRpcHMgPSAkKE1PREFMU0VMRUNUT1IpLFxuXG5cdFx0XHQvLyBLZWVwIHRoZSBtb2RhbCdzIGxvd2VyIHRoYW4gb3RoZXIsIHJlZ3VsYXIgcXRpcHNcblx0XHRcdG5ld0luZGV4ID0gUVRJUC5tb2RhbF96aW5kZXggKyBxdGlwcy5sZW5ndGgsXG5cdFx0XHRjdXJJbmRleCA9IHBhcnNlSW50KHRvb2x0aXBbMF0uc3R5bGUuekluZGV4LCAxMCk7XG5cblx0XHRcdC8vIFNldCBvdmVybGF5IHotaW5kZXhcblx0XHRcdE9WRVJMQVkuZWxlbVswXS5zdHlsZS56SW5kZXggPSBuZXdJbmRleCAtIDE7XG5cblx0XHRcdC8vIFJlZHVjZSBtb2RhbCB6LWluZGV4J3MgYW5kIGtlZXAgdGhlbSBwcm9wZXJseSBvcmRlcmVkXG5cdFx0XHRxdGlwcy5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZih0aGlzLnN0eWxlLnpJbmRleCA+IGN1ckluZGV4KSB7XG5cdFx0XHRcdFx0dGhpcy5zdHlsZS56SW5kZXggLT0gMTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIEZpcmUgYmx1ciBldmVudCBmb3IgZm9jdXNlZCB0b29sdGlwXG5cdFx0XHRxdGlwcy5maWx0ZXIoJy4nICsgQ0xBU1NfRk9DVVMpLnF0aXAoJ2JsdXInLCBldmVudC5vcmlnaW5hbEV2ZW50KTtcblxuXHRcdFx0Ly8gU2V0IHRoZSBuZXcgei1pbmRleFxuXHRcdFx0dG9vbHRpcC5hZGRDbGFzcyhDTEFTU19GT0NVUylbMF0uc3R5bGUuekluZGV4ID0gbmV3SW5kZXg7XG5cblx0XHRcdC8vIFNldCBjdXJyZW50XG5cdFx0XHRPVkVSTEFZLnVwZGF0ZShhcGkpO1xuXG5cdFx0XHQvLyBQcmV2ZW50IGRlZmF1bHQgaGFuZGxpbmdcblx0XHRcdC8qIGVzbGludC1kaXNhYmxlIG5vLWVtcHR5ICovXG5cdFx0XHR0cnkgeyBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyB9XG5cdFx0XHRjYXRjaChlKSB7fVxuXHRcdFx0LyogZXNsaW50LWVuYWJsZSBuby1lbXB0eSAqL1xuXHRcdH0sIHRoaXMuX25zLCB0aGlzKTtcblxuXHRcdC8vIEZvY3VzIGFueSBvdGhlciB2aXNpYmxlIG1vZGFscyB3aGVuIHRoaXMgb25lIGhpZGVzXG5cdFx0cXRpcC5fYmluZCh0b29sdGlwLCAndG9vbHRpcGhpZGUnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0aWYoZXZlbnQudGFyZ2V0ID09PSB0b29sdGlwWzBdKSB7XG5cdFx0XHRcdCQoTU9EQUxTRUxFQ1RPUikuZmlsdGVyKCc6dmlzaWJsZScpLm5vdCh0b29sdGlwKS5sYXN0KCkucXRpcCgnZm9jdXMnLCBldmVudCk7XG5cdFx0XHR9XG5cdFx0fSwgdGhpcy5fbnMsIHRoaXMpO1xuXHR9LFxuXG5cdHRvZ2dsZTogZnVuY3Rpb24oZXZlbnQsIHN0YXRlLCBkdXJhdGlvbikge1xuXHRcdC8vIE1ha2Ugc3VyZSBkZWZhdWx0IGV2ZW50IGhhc24ndCBiZWVuIHByZXZlbnRlZFxuXHRcdGlmKGV2ZW50ICYmIGV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSB7IHJldHVybiB0aGlzOyB9XG5cblx0XHQvLyBUb2dnbGUgaXRcblx0XHRPVkVSTEFZLnRvZ2dsZSh0aGlzLnF0aXAsICEhc3RhdGUsIGR1cmF0aW9uKTtcblx0fSxcblxuXHRkZXN0cm95OiBmdW5jdGlvbigpIHtcblx0XHQvLyBSZW1vdmUgbW9kYWwgY2xhc3Ncblx0XHR0aGlzLnF0aXAudG9vbHRpcC5yZW1vdmVDbGFzcyhNT0RBTENMQVNTKTtcblxuXHRcdC8vIFJlbW92ZSBib3VuZCBldmVudHNcblx0XHR0aGlzLnF0aXAuX3VuYmluZCh0aGlzLnF0aXAudG9vbHRpcCwgdGhpcy5fbnMpO1xuXG5cdFx0Ly8gRGVsZXRlIGVsZW1lbnQgcmVmZXJlbmNlXG5cdFx0T1ZFUkxBWS50b2dnbGUodGhpcy5xdGlwLCBGQUxTRSk7XG5cdFx0ZGVsZXRlIHRoaXMucXRpcC5lbGVtZW50cy5vdmVybGF5O1xuXHR9XG59KTtcblxuXG5NT0RBTCA9IFBMVUdJTlMubW9kYWwgPSBmdW5jdGlvbihhcGkpIHtcblx0cmV0dXJuIG5ldyBNb2RhbChhcGksIGFwaS5vcHRpb25zLnNob3cubW9kYWwpO1xufTtcblxuLy8gU2V0dXAgc2FuaXRpenRpb24gcnVsZXNcbk1PREFMLnNhbml0aXplID0gZnVuY3Rpb24ob3B0cykge1xuXHRpZihvcHRzLnNob3cpIHtcblx0XHRpZih0eXBlb2Ygb3B0cy5zaG93Lm1vZGFsICE9PSAnb2JqZWN0JykgeyBvcHRzLnNob3cubW9kYWwgPSB7IG9uOiAhIW9wdHMuc2hvdy5tb2RhbCB9OyB9XG5cdFx0ZWxzZSBpZih0eXBlb2Ygb3B0cy5zaG93Lm1vZGFsLm9uID09PSAndW5kZWZpbmVkJykgeyBvcHRzLnNob3cubW9kYWwub24gPSBUUlVFOyB9XG5cdH1cbn07XG5cbi8vIEJhc2Ugei1pbmRleCBmb3IgYWxsIG1vZGFsIHRvb2x0aXBzICh1c2UgcVRpcCBjb3JlIHotaW5kZXggYXMgYSBiYXNlKVxuLyogZXNsaW50LWRpc2FibGUgY2FtZWxjYXNlICovXG5RVElQLm1vZGFsX3ppbmRleCA9IFFUSVAuemluZGV4IC0gMjAwO1xuLyogZXNsaW50LWVuYWJsZSBjYW1lbGNhc2UgKi9cblxuLy8gUGx1Z2luIG5lZWRzIHRvIGJlIGluaXRpYWxpemVkIG9uIHJlbmRlclxuTU9EQUwuaW5pdGlhbGl6ZSA9ICdyZW5kZXInO1xuXG4vLyBTZXR1cCBvcHRpb24gc2V0IGNoZWNrc1xuQ0hFQ0tTLm1vZGFsID0ge1xuXHQnXnNob3cubW9kYWwuKG9ufGJsdXIpJCc6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIEluaXRpYWxpc2Vcblx0XHR0aGlzLmRlc3Ryb3koKTtcblx0XHR0aGlzLmluaXQoKTtcblxuXHRcdC8vIFNob3cgdGhlIG1vZGFsIGlmIG5vdCB2aXNpYmxlIGFscmVhZHkgYW5kIHRvb2x0aXAgaXMgdmlzaWJsZVxuXHRcdHRoaXMucXRpcC5lbGVtcy5vdmVybGF5LnRvZ2dsZShcblx0XHRcdHRoaXMucXRpcC50b29sdGlwWzBdLm9mZnNldFdpZHRoID4gMFxuXHRcdCk7XG5cdH1cbn07XG5cbi8vIEV4dGVuZCBvcmlnaW5hbCBhcGkgZGVmYXVsdHNcbiQuZXh0ZW5kKFRSVUUsIFFUSVAuZGVmYXVsdHMsIHtcblx0c2hvdzoge1xuXHRcdG1vZGFsOiB7XG5cdFx0XHRvbjogRkFMU0UsXG5cdFx0XHRlZmZlY3Q6IFRSVUUsXG5cdFx0XHRibHVyOiBUUlVFLFxuXHRcdFx0c3RlYWxmb2N1czogVFJVRSxcblx0XHRcdGVzY2FwZTogVFJVRVxuXHRcdH1cblx0fVxufSk7XG47UExVR0lOUy52aWV3cG9ydCA9IGZ1bmN0aW9uKGFwaSwgcG9zaXRpb24sIHBvc09wdGlvbnMsIHRhcmdldFdpZHRoLCB0YXJnZXRIZWlnaHQsIGVsZW1XaWR0aCwgZWxlbUhlaWdodClcbntcblx0dmFyIHRhcmdldCA9IHBvc09wdGlvbnMudGFyZ2V0LFxuXHRcdHRvb2x0aXAgPSBhcGkuZWxlbWVudHMudG9vbHRpcCxcblx0XHRteSA9IHBvc09wdGlvbnMubXksXG5cdFx0YXQgPSBwb3NPcHRpb25zLmF0LFxuXHRcdGFkanVzdCA9IHBvc09wdGlvbnMuYWRqdXN0LFxuXHRcdG1ldGhvZCA9IGFkanVzdC5tZXRob2Quc3BsaXQoJyAnKSxcblx0XHRtZXRob2RYID0gbWV0aG9kWzBdLFxuXHRcdG1ldGhvZFkgPSBtZXRob2RbMV0gfHwgbWV0aG9kWzBdLFxuXHRcdHZpZXdwb3J0ID0gcG9zT3B0aW9ucy52aWV3cG9ydCxcblx0XHRjb250YWluZXIgPSBwb3NPcHRpb25zLmNvbnRhaW5lcixcblx0XHRhZGp1c3RlZCA9IHsgbGVmdDogMCwgdG9wOiAwIH0sXG5cdFx0Zml4ZWQsIG5ld015LCBjb250YWluZXJPZmZzZXQsIGNvbnRhaW5lclN0YXRpYyxcblx0XHR2aWV3cG9ydFdpZHRoLCB2aWV3cG9ydEhlaWdodCwgdmlld3BvcnRTY3JvbGwsIHZpZXdwb3J0T2Zmc2V0O1xuXG5cdC8vIElmIHZpZXdwb3J0IGlzIG5vdCBhIGpRdWVyeSBlbGVtZW50LCBvciBpdCdzIHRoZSB3aW5kb3cvZG9jdW1lbnQsIG9yIG5vIGFkanVzdG1lbnQgbWV0aG9kIGlzIHVzZWQuLi4gcmV0dXJuXG5cdGlmKCF2aWV3cG9ydC5qcXVlcnkgfHwgdGFyZ2V0WzBdID09PSB3aW5kb3cgfHwgdGFyZ2V0WzBdID09PSBkb2N1bWVudC5ib2R5IHx8IGFkanVzdC5tZXRob2QgPT09ICdub25lJykge1xuXHRcdHJldHVybiBhZGp1c3RlZDtcblx0fVxuXG5cdC8vIENhY2ggY29udGFpbmVyIGRldGFpbHNcblx0Y29udGFpbmVyT2Zmc2V0ID0gY29udGFpbmVyLm9mZnNldCgpIHx8IGFkanVzdGVkO1xuXHRjb250YWluZXJTdGF0aWMgPSBjb250YWluZXIuY3NzKCdwb3NpdGlvbicpID09PSAnc3RhdGljJztcblxuXHQvLyBDYWNoZSBvdXIgdmlld3BvcnQgZGV0YWlsc1xuXHRmaXhlZCA9IHRvb2x0aXAuY3NzKCdwb3NpdGlvbicpID09PSAnZml4ZWQnO1xuXHR2aWV3cG9ydFdpZHRoID0gdmlld3BvcnRbMF0gPT09IHdpbmRvdyA/IHZpZXdwb3J0LndpZHRoKCkgOiB2aWV3cG9ydC5vdXRlcldpZHRoKEZBTFNFKTtcblx0dmlld3BvcnRIZWlnaHQgPSB2aWV3cG9ydFswXSA9PT0gd2luZG93ID8gdmlld3BvcnQuaGVpZ2h0KCkgOiB2aWV3cG9ydC5vdXRlckhlaWdodChGQUxTRSk7XG5cdHZpZXdwb3J0U2Nyb2xsID0geyBsZWZ0OiBmaXhlZCA/IDAgOiB2aWV3cG9ydC5zY3JvbGxMZWZ0KCksIHRvcDogZml4ZWQgPyAwIDogdmlld3BvcnQuc2Nyb2xsVG9wKCkgfTtcblx0dmlld3BvcnRPZmZzZXQgPSB2aWV3cG9ydC5vZmZzZXQoKSB8fCBhZGp1c3RlZDtcblxuXHQvLyBHZW5lcmljIGNhbGN1bGF0aW9uIG1ldGhvZFxuXHRmdW5jdGlvbiBjYWxjdWxhdGUoc2lkZSwgb3RoZXJTaWRlLCB0eXBlLCBhZGp1c3RtZW50LCBzaWRlMSwgc2lkZTIsIGxlbmd0aE5hbWUsIHRhcmdldExlbmd0aCwgZWxlbUxlbmd0aCkge1xuXHRcdHZhciBpbml0aWFsUG9zID0gcG9zaXRpb25bc2lkZTFdLFxuXHRcdFx0bXlTaWRlID0gbXlbc2lkZV0sXG5cdFx0XHRhdFNpZGUgPSBhdFtzaWRlXSxcblx0XHRcdGlzU2hpZnQgPSB0eXBlID09PSBTSElGVCxcblx0XHRcdG15TGVuZ3RoID0gbXlTaWRlID09PSBzaWRlMSA/IGVsZW1MZW5ndGggOiBteVNpZGUgPT09IHNpZGUyID8gLWVsZW1MZW5ndGggOiAtZWxlbUxlbmd0aCAvIDIsXG5cdFx0XHRhdExlbmd0aCA9IGF0U2lkZSA9PT0gc2lkZTEgPyB0YXJnZXRMZW5ndGggOiBhdFNpZGUgPT09IHNpZGUyID8gLXRhcmdldExlbmd0aCA6IC10YXJnZXRMZW5ndGggLyAyLFxuXHRcdFx0c2lkZU9mZnNldCA9IHZpZXdwb3J0U2Nyb2xsW3NpZGUxXSArIHZpZXdwb3J0T2Zmc2V0W3NpZGUxXSAtIChjb250YWluZXJTdGF0aWMgPyAwIDogY29udGFpbmVyT2Zmc2V0W3NpZGUxXSksXG5cdFx0XHRvdmVyZmxvdzEgPSBzaWRlT2Zmc2V0IC0gaW5pdGlhbFBvcyxcblx0XHRcdG92ZXJmbG93MiA9IGluaXRpYWxQb3MgKyBlbGVtTGVuZ3RoIC0gKGxlbmd0aE5hbWUgPT09IFdJRFRIID8gdmlld3BvcnRXaWR0aCA6IHZpZXdwb3J0SGVpZ2h0KSAtIHNpZGVPZmZzZXQsXG5cdFx0XHRvZmZzZXQgPSBteUxlbmd0aCAtIChteS5wcmVjZWRhbmNlID09PSBzaWRlIHx8IG15U2lkZSA9PT0gbXlbb3RoZXJTaWRlXSA/IGF0TGVuZ3RoIDogMCkgLSAoYXRTaWRlID09PSBDRU5URVIgPyB0YXJnZXRMZW5ndGggLyAyIDogMCk7XG5cblx0XHQvLyBzaGlmdFxuXHRcdGlmKGlzU2hpZnQpIHtcblx0XHRcdG9mZnNldCA9IChteVNpZGUgPT09IHNpZGUxID8gMSA6IC0xKSAqIG15TGVuZ3RoO1xuXG5cdFx0XHQvLyBBZGp1c3QgcG9zaXRpb24gYnV0IGtlZXAgaXQgd2l0aGluIHZpZXdwb3J0IGRpbWVuc2lvbnNcblx0XHRcdHBvc2l0aW9uW3NpZGUxXSArPSBvdmVyZmxvdzEgPiAwID8gb3ZlcmZsb3cxIDogb3ZlcmZsb3cyID4gMCA/IC1vdmVyZmxvdzIgOiAwO1xuXHRcdFx0cG9zaXRpb25bc2lkZTFdID0gTWF0aC5tYXgoXG5cdFx0XHRcdC1jb250YWluZXJPZmZzZXRbc2lkZTFdICsgdmlld3BvcnRPZmZzZXRbc2lkZTFdLFxuXHRcdFx0XHRpbml0aWFsUG9zIC0gb2Zmc2V0LFxuXHRcdFx0XHRNYXRoLm1pbihcblx0XHRcdFx0XHRNYXRoLm1heChcblx0XHRcdFx0XHRcdC1jb250YWluZXJPZmZzZXRbc2lkZTFdICsgdmlld3BvcnRPZmZzZXRbc2lkZTFdICsgKGxlbmd0aE5hbWUgPT09IFdJRFRIID8gdmlld3BvcnRXaWR0aCA6IHZpZXdwb3J0SGVpZ2h0KSxcblx0XHRcdFx0XHRcdGluaXRpYWxQb3MgKyBvZmZzZXRcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdHBvc2l0aW9uW3NpZGUxXSxcblxuXHRcdFx0XHRcdC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCBhZGp1c3QgY29tcGxldGUgb2ZmIHRoZSBlbGVtZW50IHdoZW4gdXNpbmcgJ2NlbnRlcidcblx0XHRcdFx0XHRteVNpZGUgPT09ICdjZW50ZXInID8gaW5pdGlhbFBvcyAtIG15TGVuZ3RoIDogMUU5XG5cdFx0XHRcdClcblx0XHRcdCk7XG5cblx0XHR9XG5cblx0XHQvLyBmbGlwL2ZsaXBpbnZlcnRcblx0XHRlbHNlIHtcblx0XHRcdC8vIFVwZGF0ZSBhZGp1c3RtZW50IGFtb3VudCBkZXBlbmRpbmcgb24gaWYgdXNpbmcgZmxpcGludmVydCBvciBmbGlwXG5cdFx0XHRhZGp1c3RtZW50ICo9IHR5cGUgPT09IEZMSVBJTlZFUlQgPyAyIDogMDtcblxuXHRcdFx0Ly8gQ2hlY2sgZm9yIG92ZXJmbG93IG9uIHRoZSBsZWZ0L3RvcFxuXHRcdFx0aWYob3ZlcmZsb3cxID4gMCAmJiAobXlTaWRlICE9PSBzaWRlMSB8fCBvdmVyZmxvdzIgPiAwKSkge1xuXHRcdFx0XHRwb3NpdGlvbltzaWRlMV0gLT0gb2Zmc2V0ICsgYWRqdXN0bWVudDtcblx0XHRcdFx0bmV3TXkuaW52ZXJ0KHNpZGUsIHNpZGUxKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQ2hlY2sgZm9yIG92ZXJmbG93IG9uIHRoZSBib3R0b20vcmlnaHRcblx0XHRcdGVsc2UgaWYob3ZlcmZsb3cyID4gMCAmJiAobXlTaWRlICE9PSBzaWRlMiB8fCBvdmVyZmxvdzEgPiAwKSAgKSB7XG5cdFx0XHRcdHBvc2l0aW9uW3NpZGUxXSAtPSAobXlTaWRlID09PSBDRU5URVIgPyAtb2Zmc2V0IDogb2Zmc2V0KSArIGFkanVzdG1lbnQ7XG5cdFx0XHRcdG5ld015LmludmVydChzaWRlLCBzaWRlMik7XG5cdFx0XHR9XG5cblx0XHRcdC8vIE1ha2Ugc3VyZSB3ZSBoYXZlbid0IG1hZGUgdGhpbmdzIHdvcnNlIHdpdGggdGhlIGFkanVzdG1lbnQgYW5kIHJlc2V0IGlmIHNvXG5cdFx0XHRpZihwb3NpdGlvbltzaWRlMV0gPCB2aWV3cG9ydFNjcm9sbFtzaWRlMV0gJiYgLXBvc2l0aW9uW3NpZGUxXSA+IG92ZXJmbG93Mikge1xuXHRcdFx0XHRwb3NpdGlvbltzaWRlMV0gPSBpbml0aWFsUG9zOyBuZXdNeSA9IG15LmNsb25lKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBvc2l0aW9uW3NpZGUxXSAtIGluaXRpYWxQb3M7XG5cdH1cblxuXHQvLyBTZXQgbmV3TXkgaWYgdXNpbmcgZmxpcCBvciBmbGlwaW52ZXJ0IG1ldGhvZHNcblx0aWYobWV0aG9kWCAhPT0gJ3NoaWZ0JyB8fCBtZXRob2RZICE9PSAnc2hpZnQnKSB7IG5ld015ID0gbXkuY2xvbmUoKTsgfVxuXG5cdC8vIEFkanVzdCBwb3NpdGlvbiBiYXNlZCBvbnZpZXdwb3J0IGFuZCBhZGp1c3RtZW50IG9wdGlvbnNcblx0YWRqdXN0ZWQgPSB7XG5cdFx0bGVmdDogbWV0aG9kWCAhPT0gJ25vbmUnID8gY2FsY3VsYXRlKCBYLCBZLCBtZXRob2RYLCBhZGp1c3QueCwgTEVGVCwgUklHSFQsIFdJRFRILCB0YXJnZXRXaWR0aCwgZWxlbVdpZHRoICkgOiAwLFxuXHRcdHRvcDogbWV0aG9kWSAhPT0gJ25vbmUnID8gY2FsY3VsYXRlKCBZLCBYLCBtZXRob2RZLCBhZGp1c3QueSwgVE9QLCBCT1RUT00sIEhFSUdIVCwgdGFyZ2V0SGVpZ2h0LCBlbGVtSGVpZ2h0ICkgOiAwLFxuXHRcdG15OiBuZXdNeVxuXHR9O1xuXG5cdHJldHVybiBhZGp1c3RlZDtcbn07XG47UExVR0lOUy5wb2x5cyA9IHtcblx0Ly8gUE9MWSBhcmVhIGNvb3JkaW5hdGUgY2FsY3VsYXRvclxuXHQvL1x0U3BlY2lhbCB0aGFua3MgdG8gRWQgQ3JhZG9jayBmb3IgaGVscGluZyBvdXQgd2l0aCB0aGlzLlxuXHQvL1x0VXNlcyBhIGJpbmFyeSBzZWFyY2ggYWxnb3JpdGhtIHRvIGZpbmQgc3VpdGFibGUgY29vcmRpbmF0ZXMuXG5cdHBvbHlnb246IGZ1bmN0aW9uKGJhc2VDb29yZHMsIGNvcm5lcikge1xuXHRcdHZhciByZXN1bHQgPSB7XG5cdFx0XHR3aWR0aDogMCwgaGVpZ2h0OiAwLFxuXHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0dG9wOiAxZTEwLCByaWdodDogMCxcblx0XHRcdFx0Ym90dG9tOiAwLCBsZWZ0OiAxZTEwXG5cdFx0XHR9LFxuXHRcdFx0YWRqdXN0YWJsZTogRkFMU0Vcblx0XHR9LFxuXHRcdGkgPSAwLCBuZXh0LFxuXHRcdGNvb3JkcyA9IFtdLFxuXHRcdGNvbXBhcmVYID0gMSwgY29tcGFyZVkgPSAxLFxuXHRcdHJlYWxYID0gMCwgcmVhbFkgPSAwLFxuXHRcdG5ld1dpZHRoLCBuZXdIZWlnaHQ7XG5cblx0XHQvLyBGaXJzdCBwYXNzLCBzYW5pdGl6ZSBjb29yZHMgYW5kIGRldGVybWluZSBvdXRlciBlZGdlc1xuXHRcdGkgPSBiYXNlQ29vcmRzLmxlbmd0aDsgXG5cdFx0d2hpbGUoaS0tKSB7XG5cdFx0XHRuZXh0ID0gWyBwYXJzZUludChiYXNlQ29vcmRzWy0taV0sIDEwKSwgcGFyc2VJbnQoYmFzZUNvb3Jkc1tpKzFdLCAxMCkgXTtcblxuXHRcdFx0aWYobmV4dFswXSA+IHJlc3VsdC5wb3NpdGlvbi5yaWdodCl7IHJlc3VsdC5wb3NpdGlvbi5yaWdodCA9IG5leHRbMF07IH1cblx0XHRcdGlmKG5leHRbMF0gPCByZXN1bHQucG9zaXRpb24ubGVmdCl7IHJlc3VsdC5wb3NpdGlvbi5sZWZ0ID0gbmV4dFswXTsgfVxuXHRcdFx0aWYobmV4dFsxXSA+IHJlc3VsdC5wb3NpdGlvbi5ib3R0b20peyByZXN1bHQucG9zaXRpb24uYm90dG9tID0gbmV4dFsxXTsgfVxuXHRcdFx0aWYobmV4dFsxXSA8IHJlc3VsdC5wb3NpdGlvbi50b3ApeyByZXN1bHQucG9zaXRpb24udG9wID0gbmV4dFsxXTsgfVxuXG5cdFx0XHRjb29yZHMucHVzaChuZXh0KTtcblx0XHR9XG5cblx0XHQvLyBDYWxjdWxhdGUgaGVpZ2h0IGFuZCB3aWR0aCBmcm9tIG91dGVyIGVkZ2VzXG5cdFx0bmV3V2lkdGggPSByZXN1bHQud2lkdGggPSBNYXRoLmFicyhyZXN1bHQucG9zaXRpb24ucmlnaHQgLSByZXN1bHQucG9zaXRpb24ubGVmdCk7XG5cdFx0bmV3SGVpZ2h0ID0gcmVzdWx0LmhlaWdodCA9IE1hdGguYWJzKHJlc3VsdC5wb3NpdGlvbi5ib3R0b20gLSByZXN1bHQucG9zaXRpb24udG9wKTtcblxuXHRcdC8vIElmIGl0J3MgdGhlIGNlbnRlciBjb3JuZXIuLi5cblx0XHRpZihjb3JuZXIuYWJicmV2KCkgPT09ICdjJykge1xuXHRcdFx0cmVzdWx0LnBvc2l0aW9uID0ge1xuXHRcdFx0XHRsZWZ0OiByZXN1bHQucG9zaXRpb24ubGVmdCArIHJlc3VsdC53aWR0aCAvIDIsXG5cdFx0XHRcdHRvcDogcmVzdWx0LnBvc2l0aW9uLnRvcCArIHJlc3VsdC5oZWlnaHQgLyAyXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdC8vIFNlY29uZCBwYXNzLCB1c2UgYSBiaW5hcnkgc2VhcmNoIGFsZ29yaXRobSB0byBsb2NhdGUgbW9zdCBzdWl0YWJsZSBjb29yZGluYXRlXG5cdFx0XHR3aGlsZShuZXdXaWR0aCA+IDAgJiYgbmV3SGVpZ2h0ID4gMCAmJiBjb21wYXJlWCA+IDAgJiYgY29tcGFyZVkgPiAwKVxuXHRcdFx0e1xuXHRcdFx0XHRuZXdXaWR0aCA9IE1hdGguZmxvb3IobmV3V2lkdGggLyAyKTtcblx0XHRcdFx0bmV3SGVpZ2h0ID0gTWF0aC5mbG9vcihuZXdIZWlnaHQgLyAyKTtcblxuXHRcdFx0XHRpZihjb3JuZXIueCA9PT0gTEVGVCl7IGNvbXBhcmVYID0gbmV3V2lkdGg7IH1cblx0XHRcdFx0ZWxzZSBpZihjb3JuZXIueCA9PT0gUklHSFQpeyBjb21wYXJlWCA9IHJlc3VsdC53aWR0aCAtIG5ld1dpZHRoOyB9XG5cdFx0XHRcdGVsc2V7IGNvbXBhcmVYICs9IE1hdGguZmxvb3IobmV3V2lkdGggLyAyKTsgfVxuXG5cdFx0XHRcdGlmKGNvcm5lci55ID09PSBUT1ApeyBjb21wYXJlWSA9IG5ld0hlaWdodDsgfVxuXHRcdFx0XHRlbHNlIGlmKGNvcm5lci55ID09PSBCT1RUT00peyBjb21wYXJlWSA9IHJlc3VsdC5oZWlnaHQgLSBuZXdIZWlnaHQ7IH1cblx0XHRcdFx0ZWxzZXsgY29tcGFyZVkgKz0gTWF0aC5mbG9vcihuZXdIZWlnaHQgLyAyKTsgfVxuXG5cdFx0XHRcdGkgPSBjb29yZHMubGVuZ3RoO1xuXHRcdFx0XHR3aGlsZShpLS0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZihjb29yZHMubGVuZ3RoIDwgMil7IGJyZWFrOyB9XG5cblx0XHRcdFx0XHRyZWFsWCA9IGNvb3Jkc1tpXVswXSAtIHJlc3VsdC5wb3NpdGlvbi5sZWZ0O1xuXHRcdFx0XHRcdHJlYWxZID0gY29vcmRzW2ldWzFdIC0gcmVzdWx0LnBvc2l0aW9uLnRvcDtcblxuXHRcdFx0XHRcdGlmKFxuXHRcdFx0XHRcdFx0Y29ybmVyLnggPT09IExFRlQgJiYgcmVhbFggPj0gY29tcGFyZVggfHxcblx0XHRcdFx0XHRcdGNvcm5lci54ID09PSBSSUdIVCAmJiByZWFsWCA8PSBjb21wYXJlWCB8fFxuXHRcdFx0XHRcdFx0Y29ybmVyLnggPT09IENFTlRFUiAmJiAocmVhbFggPCBjb21wYXJlWCB8fCByZWFsWCA+IHJlc3VsdC53aWR0aCAtIGNvbXBhcmVYKSB8fFxuXHRcdFx0XHRcdFx0Y29ybmVyLnkgPT09IFRPUCAmJiByZWFsWSA+PSBjb21wYXJlWSB8fFxuXHRcdFx0XHRcdFx0Y29ybmVyLnkgPT09IEJPVFRPTSAmJiByZWFsWSA8PSBjb21wYXJlWSB8fFxuXHRcdFx0XHRcdFx0Y29ybmVyLnkgPT09IENFTlRFUiAmJiAocmVhbFkgPCBjb21wYXJlWSB8fCByZWFsWSA+IHJlc3VsdC5oZWlnaHQgLSBjb21wYXJlWSkpIHtcblx0XHRcdFx0XHRcdGNvb3Jkcy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXN1bHQucG9zaXRpb24gPSB7IGxlZnQ6IGNvb3Jkc1swXVswXSwgdG9wOiBjb29yZHNbMF1bMV0gfTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdHJlY3Q6IGZ1bmN0aW9uKGF4LCBheSwgYngsIGJ5KSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHdpZHRoOiBNYXRoLmFicyhieCAtIGF4KSxcblx0XHRcdGhlaWdodDogTWF0aC5hYnMoYnkgLSBheSksXG5cdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRsZWZ0OiBNYXRoLm1pbihheCwgYngpLFxuXHRcdFx0XHR0b3A6IE1hdGgubWluKGF5LCBieSlcblx0XHRcdH1cblx0XHR9O1xuXHR9LFxuXG5cdF9hbmdsZXM6IHtcblx0XHR0YzogMyAvIDIsIHRyOiA3IC8gNCwgdGw6IDUgLyA0LFxuXHRcdGJjOiAxIC8gMiwgYnI6IDEgLyA0LCBibDogMyAvIDQsXG5cdFx0cmM6IDIsIGxjOiAxLCBjOiAwXG5cdH0sXG5cdGVsbGlwc2U6IGZ1bmN0aW9uKGN4LCBjeSwgcngsIHJ5LCBjb3JuZXIpIHtcblx0XHR2YXIgYyA9IFBMVUdJTlMucG9seXMuX2FuZ2xlc1sgY29ybmVyLmFiYnJldigpIF0sXG5cdFx0XHRyeGMgPSBjID09PSAwID8gMCA6IHJ4ICogTWF0aC5jb3MoIGMgKiBNYXRoLlBJICksXG5cdFx0XHRyeXMgPSByeSAqIE1hdGguc2luKCBjICogTWF0aC5QSSApO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHdpZHRoOiByeCAqIDIgLSBNYXRoLmFicyhyeGMpLFxuXHRcdFx0aGVpZ2h0OiByeSAqIDIgLSBNYXRoLmFicyhyeXMpLFxuXHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0bGVmdDogY3ggKyByeGMsXG5cdFx0XHRcdHRvcDogY3kgKyByeXNcblx0XHRcdH0sXG5cdFx0XHRhZGp1c3RhYmxlOiBGQUxTRVxuXHRcdH07XG5cdH0sXG5cdGNpcmNsZTogZnVuY3Rpb24oY3gsIGN5LCByLCBjb3JuZXIpIHtcblx0XHRyZXR1cm4gUExVR0lOUy5wb2x5cy5lbGxpcHNlKGN4LCBjeSwgciwgciwgY29ybmVyKTtcblx0fVxufTtcbjtQTFVHSU5TLnN2ZyA9IGZ1bmN0aW9uKGFwaSwgc3ZnLCBjb3JuZXIpXG57XG5cdHZhciBlbGVtID0gc3ZnWzBdLFxuXHRcdHJvb3QgPSAkKGVsZW0ub3duZXJTVkdFbGVtZW50KSxcblx0XHRvd25lckRvY3VtZW50ID0gZWxlbS5vd25lckRvY3VtZW50LFxuXHRcdHN0cm9rZVdpZHRoMiA9IChwYXJzZUludChzdmcuY3NzKCdzdHJva2Utd2lkdGgnKSwgMTApIHx8IDApIC8gMixcblx0XHRmcmFtZU9mZnNldCwgbXR4LCB0cmFuc2Zvcm1lZCxcblx0XHRsZW4sIG5leHQsIGksIHBvaW50cyxcblx0XHRyZXN1bHQsIHBvc2l0aW9uO1xuXG5cdC8vIEFzY2VuZCB0aGUgcGFyZW50Tm9kZSBjaGFpbiB1bnRpbCB3ZSBmaW5kIGFuIGVsZW1lbnQgd2l0aCBnZXRCQm94KClcblx0d2hpbGUoIWVsZW0uZ2V0QkJveCkgeyBlbGVtID0gZWxlbS5wYXJlbnROb2RlOyB9XG5cdGlmKCFlbGVtLmdldEJCb3ggfHwgIWVsZW0ucGFyZW50Tm9kZSkgeyByZXR1cm4gRkFMU0U7IH1cblxuXHQvLyBEZXRlcm1pbmUgd2hpY2ggc2hhcGUgY2FsY3VsYXRpb24gdG8gdXNlXG5cdHN3aXRjaChlbGVtLm5vZGVOYW1lKSB7XG5cdFx0Y2FzZSAnZWxsaXBzZSc6XG5cdFx0Y2FzZSAnY2lyY2xlJzpcblx0XHRcdHJlc3VsdCA9IFBMVUdJTlMucG9seXMuZWxsaXBzZShcblx0XHRcdFx0ZWxlbS5jeC5iYXNlVmFsLnZhbHVlLFxuXHRcdFx0XHRlbGVtLmN5LmJhc2VWYWwudmFsdWUsXG5cdFx0XHRcdChlbGVtLnJ4IHx8IGVsZW0ucikuYmFzZVZhbC52YWx1ZSArIHN0cm9rZVdpZHRoMixcblx0XHRcdFx0KGVsZW0ucnkgfHwgZWxlbS5yKS5iYXNlVmFsLnZhbHVlICsgc3Ryb2tlV2lkdGgyLFxuXHRcdFx0XHRjb3JuZXJcblx0XHRcdCk7XG5cdFx0YnJlYWs7XG5cblx0XHRjYXNlICdsaW5lJzpcblx0XHRjYXNlICdwb2x5Z29uJzpcblx0XHRjYXNlICdwb2x5bGluZSc6XG5cdFx0XHQvLyBEZXRlcm1pbmUgcG9pbnRzIG9iamVjdCAobGluZSBoYXMgbm9uZSwgc28gbWltaWMgdXNpbmcgYXJyYXkpXG5cdFx0XHRwb2ludHMgPSBlbGVtLnBvaW50cyB8fCBbXG5cdFx0XHRcdHsgeDogZWxlbS54MS5iYXNlVmFsLnZhbHVlLCB5OiBlbGVtLnkxLmJhc2VWYWwudmFsdWUgfSxcblx0XHRcdFx0eyB4OiBlbGVtLngyLmJhc2VWYWwudmFsdWUsIHk6IGVsZW0ueTIuYmFzZVZhbC52YWx1ZSB9XG5cdFx0XHRdO1xuXG5cdFx0XHRmb3IocmVzdWx0ID0gW10sIGkgPSAtMSwgbGVuID0gcG9pbnRzLm51bWJlck9mSXRlbXMgfHwgcG9pbnRzLmxlbmd0aDsgKytpIDwgbGVuOykge1xuXHRcdFx0XHRuZXh0ID0gcG9pbnRzLmdldEl0ZW0gPyBwb2ludHMuZ2V0SXRlbShpKSA6IHBvaW50c1tpXTtcblx0XHRcdFx0cmVzdWx0LnB1c2guYXBwbHkocmVzdWx0LCBbbmV4dC54LCBuZXh0LnldKTtcblx0XHRcdH1cblxuXHRcdFx0cmVzdWx0ID0gUExVR0lOUy5wb2x5cy5wb2x5Z29uKHJlc3VsdCwgY29ybmVyKTtcblx0XHRicmVhaztcblxuXHRcdC8vIFVua25vd24gc2hhcGUgb3IgcmVjdGFuZ2xlPyBVc2UgYm91bmRpbmcgYm94XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJlc3VsdCA9IGVsZW0uZ2V0QkJveCgpO1xuXHRcdFx0cmVzdWx0ID0ge1xuXHRcdFx0XHR3aWR0aDogcmVzdWx0LndpZHRoLFxuXHRcdFx0XHRoZWlnaHQ6IHJlc3VsdC5oZWlnaHQsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0bGVmdDogcmVzdWx0LngsXG5cdFx0XHRcdFx0dG9wOiByZXN1bHQueVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdGJyZWFrO1xuXHR9XG5cblx0Ly8gU2hvcnRjdXQgYXNzaWdubWVudHNcblx0cG9zaXRpb24gPSByZXN1bHQucG9zaXRpb247XG5cdHJvb3QgPSByb290WzBdO1xuXG5cdC8vIENvbnZlcnQgcG9zaXRpb24gaW50byBhIHBpeGVsIHZhbHVlXG5cdGlmKHJvb3QuY3JlYXRlU1ZHUG9pbnQpIHtcblx0XHRtdHggPSBlbGVtLmdldFNjcmVlbkNUTSgpO1xuXHRcdHBvaW50cyA9IHJvb3QuY3JlYXRlU1ZHUG9pbnQoKTtcblxuXHRcdHBvaW50cy54ID0gcG9zaXRpb24ubGVmdDtcblx0XHRwb2ludHMueSA9IHBvc2l0aW9uLnRvcDtcblx0XHR0cmFuc2Zvcm1lZCA9IHBvaW50cy5tYXRyaXhUcmFuc2Zvcm0oIG10eCApO1xuXHRcdHBvc2l0aW9uLmxlZnQgPSB0cmFuc2Zvcm1lZC54O1xuXHRcdHBvc2l0aW9uLnRvcCA9IHRyYW5zZm9ybWVkLnk7XG5cdH1cblxuXHQvLyBDaGVjayB0aGUgZWxlbWVudCBpcyBub3QgaW4gYSBjaGlsZCBkb2N1bWVudCwgYW5kIGlmIHNvLCBhZGp1c3QgZm9yIGZyYW1lIGVsZW1lbnRzIG9mZnNldFxuXHRpZihvd25lckRvY3VtZW50ICE9PSBkb2N1bWVudCAmJiBhcGkucG9zaXRpb24udGFyZ2V0ICE9PSAnbW91c2UnKSB7XG5cdFx0ZnJhbWVPZmZzZXQgPSAkKChvd25lckRvY3VtZW50LmRlZmF1bHRWaWV3IHx8IG93bmVyRG9jdW1lbnQucGFyZW50V2luZG93KS5mcmFtZUVsZW1lbnQpLm9mZnNldCgpO1xuXHRcdGlmKGZyYW1lT2Zmc2V0KSB7XG5cdFx0XHRwb3NpdGlvbi5sZWZ0ICs9IGZyYW1lT2Zmc2V0LmxlZnQ7XG5cdFx0XHRwb3NpdGlvbi50b3AgKz0gZnJhbWVPZmZzZXQudG9wO1xuXHRcdH1cblx0fVxuXG5cdC8vIEFkanVzdCBieSBzY3JvbGwgb2Zmc2V0IG9mIG93bmVyIGRvY3VtZW50XG5cdG93bmVyRG9jdW1lbnQgPSAkKG93bmVyRG9jdW1lbnQpO1xuXHRwb3NpdGlvbi5sZWZ0ICs9IG93bmVyRG9jdW1lbnQuc2Nyb2xsTGVmdCgpO1xuXHRwb3NpdGlvbi50b3AgKz0gb3duZXJEb2N1bWVudC5zY3JvbGxUb3AoKTtcblxuXHRyZXR1cm4gcmVzdWx0O1xufTtcbjtQTFVHSU5TLmltYWdlbWFwID0gZnVuY3Rpb24oYXBpLCBhcmVhLCBjb3JuZXIpXG57XG5cdGlmKCFhcmVhLmpxdWVyeSkgeyBhcmVhID0gJChhcmVhKTsgfVxuXG5cdHZhciBzaGFwZSA9IChhcmVhLmF0dHIoJ3NoYXBlJykgfHwgJ3JlY3QnKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoJ3BvbHknLCAncG9seWdvbicpLFxuXHRcdGltYWdlID0gJCgnaW1nW3VzZW1hcD1cIiMnK2FyZWEucGFyZW50KCdtYXAnKS5hdHRyKCduYW1lJykrJ1wiXScpLFxuXHRcdGNvb3Jkc1N0cmluZyA9ICQudHJpbShhcmVhLmF0dHIoJ2Nvb3JkcycpKSxcblx0XHRjb29yZHNBcnJheSA9IGNvb3Jkc1N0cmluZy5yZXBsYWNlKC8sJC8sICcnKS5zcGxpdCgnLCcpLFxuXHRcdGltYWdlT2Zmc2V0LCBjb29yZHMsIGksIHJlc3VsdCwgbGVuO1xuXG5cdC8vIElmIHdlIGNhbid0IGZpbmQgdGhlIGltYWdlIHVzaW5nIHRoZSBtYXAuLi5cblx0aWYoIWltYWdlLmxlbmd0aCkgeyByZXR1cm4gRkFMU0U7IH1cblxuXHQvLyBQYXNzIGNvb3JkaW5hdGVzIHN0cmluZyBpZiBwb2x5Z29uXG5cdGlmKHNoYXBlID09PSAncG9seWdvbicpIHtcblx0XHRyZXN1bHQgPSBQTFVHSU5TLnBvbHlzLnBvbHlnb24oY29vcmRzQXJyYXksIGNvcm5lcik7XG5cdH1cblxuXHQvLyBPdGhlcndpc2UgcGFyc2UgdGhlIGNvb3JkaW5hdGVzIGFuZCBwYXNzIHRoZW0gYXMgYXJndW1lbnRzXG5cdGVsc2UgaWYoUExVR0lOUy5wb2x5c1tzaGFwZV0pIHtcblx0XHRmb3IoaSA9IC0xLCBsZW4gPSBjb29yZHNBcnJheS5sZW5ndGgsIGNvb3JkcyA9IFtdOyArK2kgPCBsZW47KSB7XG5cdFx0XHRjb29yZHMucHVzaCggcGFyc2VJbnQoY29vcmRzQXJyYXlbaV0sIDEwKSApO1xuXHRcdH1cblxuXHRcdHJlc3VsdCA9IFBMVUdJTlMucG9seXNbc2hhcGVdLmFwcGx5KFxuXHRcdFx0dGhpcywgY29vcmRzLmNvbmNhdChjb3JuZXIpXG5cdFx0KTtcblx0fVxuXG5cdC8vIElmIG5vIHNoYXByZSBjYWxjdWxhdGlvbiBtZXRob2Qgd2FzIGZvdW5kLCByZXR1cm4gZmFsc2Vcblx0ZWxzZSB7IHJldHVybiBGQUxTRTsgfVxuXG5cdC8vIE1ha2Ugc3VyZSB3ZSBhY2NvdW50IGZvciBwYWRkaW5nIGFuZCBib3JkZXJzIG9uIHRoZSBpbWFnZVxuXHRpbWFnZU9mZnNldCA9IGltYWdlLm9mZnNldCgpO1xuXHRpbWFnZU9mZnNldC5sZWZ0ICs9IE1hdGguY2VpbCgoaW1hZ2Uub3V0ZXJXaWR0aChGQUxTRSkgLSBpbWFnZS53aWR0aCgpKSAvIDIpO1xuXHRpbWFnZU9mZnNldC50b3AgKz0gTWF0aC5jZWlsKChpbWFnZS5vdXRlckhlaWdodChGQUxTRSkgLSBpbWFnZS5oZWlnaHQoKSkgLyAyKTtcblxuXHQvLyBBZGQgaW1hZ2UgcG9zaXRpb24gdG8gb2Zmc2V0IGNvb3JkaW5hdGVzXG5cdHJlc3VsdC5wb3NpdGlvbi5sZWZ0ICs9IGltYWdlT2Zmc2V0LmxlZnQ7XG5cdHJlc3VsdC5wb3NpdGlvbi50b3AgKz0gaW1hZ2VPZmZzZXQudG9wO1xuXG5cdHJldHVybiByZXN1bHQ7XG59O1xuO3ZhciBJRTYsXG5cbi8qXG4gKiBCR0lGcmFtZSBhZGFwdGlvbiAoaHR0cDovL3BsdWdpbnMuanF1ZXJ5LmNvbS9wcm9qZWN0L2JnaWZyYW1lKVxuICogU3BlY2lhbCB0aGFua3MgdG8gQnJhbmRvbiBBYXJvblxuICovXG5CR0lGUkFNRSA9ICc8aWZyYW1lIGNsYXNzPVwicXRpcC1iZ2lmcmFtZVwiIGZyYW1lYm9yZGVyPVwiMFwiIHRhYmluZGV4PVwiLTFcIiBzcmM9XCJqYXZhc2NyaXB0OlxcJ1xcJztcIiAnICtcblx0JyBzdHlsZT1cImRpc3BsYXk6YmxvY2s7IHBvc2l0aW9uOmFic29sdXRlOyB6LWluZGV4Oi0xOyBmaWx0ZXI6YWxwaGEob3BhY2l0eT0wKTsgJyArXG5cdFx0Jy1tcy1maWx0ZXI6XCJwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuQWxwaGEoT3BhY2l0eT0wKVwiO1wiPjwvaWZyYW1lPic7XG5cbmZ1bmN0aW9uIEllNihhcGkpIHtcblx0dGhpcy5fbnMgPSAnaWU2JztcblxuXHR0aGlzLnF0aXAgPSBhcGk7XG5cdHRoaXMuaW5pdChhcGkpO1xufVxuXG4kLmV4dGVuZChJZTYucHJvdG90eXBlLCB7XG5cdF9zY3JvbGwgOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgb3ZlcmxheSA9IHRoaXMucXRpcC5lbGVtZW50cy5vdmVybGF5O1xuXHRcdG92ZXJsYXkgJiYgKG92ZXJsYXlbMF0uc3R5bGUudG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpICsgJ3B4Jyk7XG5cdH0sXG5cblx0aW5pdDogZnVuY3Rpb24ocXRpcCkge1xuXHRcdHZhciB0b29sdGlwID0gcXRpcC50b29sdGlwO1xuXG5cdFx0Ly8gQ3JlYXRlIHRoZSBCR0lGcmFtZSBlbGVtZW50IGlmIG5lZWRlZFxuXHRcdGlmKCQoJ3NlbGVjdCwgb2JqZWN0JykubGVuZ3RoIDwgMSkge1xuXHRcdFx0dGhpcy5iZ2lmcmFtZSA9IHF0aXAuZWxlbWVudHMuYmdpZnJhbWUgPSAkKEJHSUZSQU1FKS5hcHBlbmRUbyh0b29sdGlwKTtcblxuXHRcdFx0Ly8gVXBkYXRlIEJHSUZyYW1lIG9uIHRvb2x0aXAgbW92ZVxuXHRcdFx0cXRpcC5fYmluZCh0b29sdGlwLCAndG9vbHRpcG1vdmUnLCB0aGlzLmFkanVzdEJHSUZyYW1lLCB0aGlzLl9ucywgdGhpcyk7XG5cdFx0fVxuXG5cdFx0Ly8gcmVkcmF3KCkgY29udGFpbmVyIGZvciB3aWR0aC9oZWlnaHQgY2FsY3VsYXRpb25zXG5cdFx0dGhpcy5yZWRyYXdDb250YWluZXIgPSAkKCc8ZGl2Lz4nLCB7IGlkOiBOQU1FU1BBQ0UrJy1yY29udGFpbmVyJyB9KVxuXHRcdFx0LmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xuXG5cdFx0Ly8gRml4dXAgbW9kYWwgcGx1Z2luIGlmIHByZXNlbnQgdG9vXG5cdFx0aWYoIHF0aXAuZWxlbWVudHMub3ZlcmxheSAmJiBxdGlwLmVsZW1lbnRzLm92ZXJsYXkuYWRkQ2xhc3MoJ3F0aXBtb2RhbC1pZTZmaXgnKSApIHtcblx0XHRcdHF0aXAuX2JpbmQod2luZG93LCBbJ3Njcm9sbCcsICdyZXNpemUnXSwgdGhpcy5fc2Nyb2xsLCB0aGlzLl9ucywgdGhpcyk7XG5cdFx0XHRxdGlwLl9iaW5kKHRvb2x0aXAsIFsndG9vbHRpcHNob3cnXSwgdGhpcy5fc2Nyb2xsLCB0aGlzLl9ucywgdGhpcyk7XG5cdFx0fVxuXG5cdFx0Ly8gU2V0IGRpbWVuc2lvbnNcblx0XHR0aGlzLnJlZHJhdygpO1xuXHR9LFxuXG5cdGFkanVzdEJHSUZyYW1lOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdG9vbHRpcCA9IHRoaXMucXRpcC50b29sdGlwLFxuXHRcdFx0ZGltZW5zaW9ucyA9IHtcblx0XHRcdFx0aGVpZ2h0OiB0b29sdGlwLm91dGVySGVpZ2h0KEZBTFNFKSxcblx0XHRcdFx0d2lkdGg6IHRvb2x0aXAub3V0ZXJXaWR0aChGQUxTRSlcblx0XHRcdH0sXG5cdFx0XHRwbHVnaW4gPSB0aGlzLnF0aXAucGx1Z2lucy50aXAsXG5cdFx0XHR0aXAgPSB0aGlzLnF0aXAuZWxlbWVudHMudGlwLFxuXHRcdFx0dGlwQWRqdXN0LCBvZmZzZXQ7XG5cblx0XHQvLyBBZGp1c3QgYm9yZGVyIG9mZnNldFxuXHRcdG9mZnNldCA9IHBhcnNlSW50KHRvb2x0aXAuY3NzKCdib3JkZXJMZWZ0V2lkdGgnKSwgMTApIHx8IDA7XG5cdFx0b2Zmc2V0ID0geyBsZWZ0OiAtb2Zmc2V0LCB0b3A6IC1vZmZzZXQgfTtcblxuXHRcdC8vIEFkanVzdCBmb3IgdGlwcyBwbHVnaW5cblx0XHRpZihwbHVnaW4gJiYgdGlwKSB7XG5cdFx0XHR0aXBBZGp1c3QgPSBwbHVnaW4uY29ybmVyLnByZWNlZGFuY2UgPT09ICd4JyA/IFtXSURUSCwgTEVGVF0gOiBbSEVJR0hULCBUT1BdO1xuXHRcdFx0b2Zmc2V0WyB0aXBBZGp1c3RbMV0gXSAtPSB0aXBbIHRpcEFkanVzdFswXSBdKCk7XG5cdFx0fVxuXG5cdFx0Ly8gVXBkYXRlIGJnaWZyYW1lXG5cdFx0dGhpcy5iZ2lmcmFtZS5jc3Mob2Zmc2V0KS5jc3MoZGltZW5zaW9ucyk7XG5cdH0sXG5cblx0Ly8gTWF4L21pbiB3aWR0aCBzaW11bGF0b3IgZnVuY3Rpb25cblx0cmVkcmF3OiBmdW5jdGlvbigpIHtcblx0XHRpZih0aGlzLnF0aXAucmVuZGVyZWQgPCAxIHx8IHRoaXMuZHJhd2luZykgeyByZXR1cm4gdGhpczsgfVxuXG5cdFx0dmFyIHRvb2x0aXAgPSB0aGlzLnF0aXAudG9vbHRpcCxcblx0XHRcdHN0eWxlID0gdGhpcy5xdGlwLm9wdGlvbnMuc3R5bGUsXG5cdFx0XHRjb250YWluZXIgPSB0aGlzLnF0aXAub3B0aW9ucy5wb3NpdGlvbi5jb250YWluZXIsXG5cdFx0XHRwZXJjLCB3aWR0aCwgbWF4LCBtaW47XG5cblx0XHQvLyBTZXQgZHJhd2luZyBmbGFnXG5cdFx0dGhpcy5xdGlwLmRyYXdpbmcgPSAxO1xuXG5cdFx0Ly8gSWYgdG9vbHRpcCBoYXMgYSBzZXQgaGVpZ2h0L3dpZHRoLCBqdXN0IHNldCBpdC4uLiBsaWtlIGEgYm9zcyFcblx0XHRpZihzdHlsZS5oZWlnaHQpIHsgdG9vbHRpcC5jc3MoSEVJR0hULCBzdHlsZS5oZWlnaHQpOyB9XG5cdFx0aWYoc3R5bGUud2lkdGgpIHsgdG9vbHRpcC5jc3MoV0lEVEgsIHN0eWxlLndpZHRoKTsgfVxuXG5cdFx0Ly8gU2ltdWxhdGUgbWF4L21pbiB3aWR0aCBpZiBub3Qgc2V0IHdpZHRoIHByZXNlbnQuLi5cblx0XHRlbHNlIHtcblx0XHRcdC8vIFJlc2V0IHdpZHRoIGFuZCBhZGQgZmx1aWQgY2xhc3Ncblx0XHRcdHRvb2x0aXAuY3NzKFdJRFRILCAnJykuYXBwZW5kVG8odGhpcy5yZWRyYXdDb250YWluZXIpO1xuXG5cdFx0XHQvLyBHcmFiIG91ciB0b29sdGlwIHdpZHRoIChhZGQgMSBpZiBvZGQgc28gd2UgZG9uJ3QgZ2V0IHdyYXBwaW5nIHByb2JsZW1zLi4gaHV6emFoISlcblx0XHRcdHdpZHRoID0gdG9vbHRpcC53aWR0aCgpO1xuXHRcdFx0aWYod2lkdGggJSAyIDwgMSkgeyB3aWR0aCArPSAxOyB9XG5cblx0XHRcdC8vIEdyYWIgb3VyIG1heC9taW4gcHJvcGVydGllc1xuXHRcdFx0bWF4ID0gdG9vbHRpcC5jc3MoJ21heFdpZHRoJykgfHwgJyc7XG5cdFx0XHRtaW4gPSB0b29sdGlwLmNzcygnbWluV2lkdGgnKSB8fCAnJztcblxuXHRcdFx0Ly8gUGFyc2UgaW50byBwcm9wZXIgcGl4ZWwgdmFsdWVzXG5cdFx0XHRwZXJjID0gKG1heCArIG1pbikuaW5kZXhPZignJScpID4gLTEgPyBjb250YWluZXIud2lkdGgoKSAvIDEwMCA6IDA7XG5cdFx0XHRtYXggPSAobWF4LmluZGV4T2YoJyUnKSA+IC0xID8gcGVyYyA6IDEgKiBwYXJzZUludChtYXgsIDEwKSkgfHwgd2lkdGg7XG5cdFx0XHRtaW4gPSAobWluLmluZGV4T2YoJyUnKSA+IC0xID8gcGVyYyA6IDEgKiBwYXJzZUludChtaW4sIDEwKSkgfHwgMDtcblxuXHRcdFx0Ly8gRGV0ZXJtaW5lIG5ldyBkaW1lbnNpb24gc2l6ZSBiYXNlZCBvbiBtYXgvbWluL2N1cnJlbnQgdmFsdWVzXG5cdFx0XHR3aWR0aCA9IG1heCArIG1pbiA/IE1hdGgubWluKE1hdGgubWF4KHdpZHRoLCBtaW4pLCBtYXgpIDogd2lkdGg7XG5cblx0XHRcdC8vIFNldCB0aGUgbmV3bHkgY2FsY3VsYXRlZCB3aWR0aCBhbmQgcmVtdm9lIGZsdWlkIGNsYXNzXG5cdFx0XHR0b29sdGlwLmNzcyhXSURUSCwgTWF0aC5yb3VuZCh3aWR0aCkpLmFwcGVuZFRvKGNvbnRhaW5lcik7XG5cdFx0fVxuXG5cdFx0Ly8gU2V0IGRyYXdpbmcgZmxhZ1xuXHRcdHRoaXMuZHJhd2luZyA9IDA7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRkZXN0cm95OiBmdW5jdGlvbigpIHtcblx0XHQvLyBSZW1vdmUgaWZyYW1lXG5cdFx0dGhpcy5iZ2lmcmFtZSAmJiB0aGlzLmJnaWZyYW1lLnJlbW92ZSgpO1xuXG5cdFx0Ly8gUmVtb3ZlIGJvdW5kIGV2ZW50c1xuXHRcdHRoaXMucXRpcC5fdW5iaW5kKFt3aW5kb3csIHRoaXMucXRpcC50b29sdGlwXSwgdGhpcy5fbnMpO1xuXHR9XG59KTtcblxuSUU2ID0gUExVR0lOUy5pZTYgPSBmdW5jdGlvbihhcGkpIHtcblx0Ly8gUHJvY2VlZCBvbmx5IGlmIHRoZSBicm93c2VyIGlzIElFNlxuXHRyZXR1cm4gQlJPV1NFUi5pZSA9PT0gNiA/IG5ldyBJZTYoYXBpKSA6IEZBTFNFO1xufTtcblxuSUU2LmluaXRpYWxpemUgPSAncmVuZGVyJztcblxuQ0hFQ0tTLmllNiA9IHtcblx0J15jb250ZW50fHN0eWxlJCc6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMucmVkcmF3KCk7XG5cdH1cbn07XG47fSkpO1xufSggd2luZG93LCBkb2N1bWVudCApKTtcbiIsIi8qIVxuKiBzY3JlZW5mdWxsXG4qIHY1LjAuMiAtIDIwMjAtMDItMTNcbiogKGMpIFNpbmRyZSBTb3JodXM7IE1JVCBMaWNlbnNlXG4qL1xuKGZ1bmN0aW9uICgpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBkb2N1bWVudCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB3aW5kb3cuZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmRvY3VtZW50IDoge307XG5cdHZhciBpc0NvbW1vbmpzID0gdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHM7XG5cblx0dmFyIGZuID0gKGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgdmFsO1xuXG5cdFx0dmFyIGZuTWFwID0gW1xuXHRcdFx0W1xuXHRcdFx0XHQncmVxdWVzdEZ1bGxzY3JlZW4nLFxuXHRcdFx0XHQnZXhpdEZ1bGxzY3JlZW4nLFxuXHRcdFx0XHQnZnVsbHNjcmVlbkVsZW1lbnQnLFxuXHRcdFx0XHQnZnVsbHNjcmVlbkVuYWJsZWQnLFxuXHRcdFx0XHQnZnVsbHNjcmVlbmNoYW5nZScsXG5cdFx0XHRcdCdmdWxsc2NyZWVuZXJyb3InXG5cdFx0XHRdLFxuXHRcdFx0Ly8gTmV3IFdlYktpdFxuXHRcdFx0W1xuXHRcdFx0XHQnd2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4nLFxuXHRcdFx0XHQnd2Via2l0RXhpdEZ1bGxzY3JlZW4nLFxuXHRcdFx0XHQnd2Via2l0RnVsbHNjcmVlbkVsZW1lbnQnLFxuXHRcdFx0XHQnd2Via2l0RnVsbHNjcmVlbkVuYWJsZWQnLFxuXHRcdFx0XHQnd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsXG5cdFx0XHRcdCd3ZWJraXRmdWxsc2NyZWVuZXJyb3InXG5cblx0XHRcdF0sXG5cdFx0XHQvLyBPbGQgV2ViS2l0XG5cdFx0XHRbXG5cdFx0XHRcdCd3ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbicsXG5cdFx0XHRcdCd3ZWJraXRDYW5jZWxGdWxsU2NyZWVuJyxcblx0XHRcdFx0J3dlYmtpdEN1cnJlbnRGdWxsU2NyZWVuRWxlbWVudCcsXG5cdFx0XHRcdCd3ZWJraXRDYW5jZWxGdWxsU2NyZWVuJyxcblx0XHRcdFx0J3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UnLFxuXHRcdFx0XHQnd2Via2l0ZnVsbHNjcmVlbmVycm9yJ1xuXG5cdFx0XHRdLFxuXHRcdFx0W1xuXHRcdFx0XHQnbW96UmVxdWVzdEZ1bGxTY3JlZW4nLFxuXHRcdFx0XHQnbW96Q2FuY2VsRnVsbFNjcmVlbicsXG5cdFx0XHRcdCdtb3pGdWxsU2NyZWVuRWxlbWVudCcsXG5cdFx0XHRcdCdtb3pGdWxsU2NyZWVuRW5hYmxlZCcsXG5cdFx0XHRcdCdtb3pmdWxsc2NyZWVuY2hhbmdlJyxcblx0XHRcdFx0J21vemZ1bGxzY3JlZW5lcnJvcidcblx0XHRcdF0sXG5cdFx0XHRbXG5cdFx0XHRcdCdtc1JlcXVlc3RGdWxsc2NyZWVuJyxcblx0XHRcdFx0J21zRXhpdEZ1bGxzY3JlZW4nLFxuXHRcdFx0XHQnbXNGdWxsc2NyZWVuRWxlbWVudCcsXG5cdFx0XHRcdCdtc0Z1bGxzY3JlZW5FbmFibGVkJyxcblx0XHRcdFx0J01TRnVsbHNjcmVlbkNoYW5nZScsXG5cdFx0XHRcdCdNU0Z1bGxzY3JlZW5FcnJvcidcblx0XHRcdF1cblx0XHRdO1xuXG5cdFx0dmFyIGkgPSAwO1xuXHRcdHZhciBsID0gZm5NYXAubGVuZ3RoO1xuXHRcdHZhciByZXQgPSB7fTtcblxuXHRcdGZvciAoOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHR2YWwgPSBmbk1hcFtpXTtcblx0XHRcdGlmICh2YWwgJiYgdmFsWzFdIGluIGRvY3VtZW50KSB7XG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRyZXRbZm5NYXBbMF1baV1dID0gdmFsW2ldO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiByZXQ7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KSgpO1xuXG5cdHZhciBldmVudE5hbWVNYXAgPSB7XG5cdFx0Y2hhbmdlOiBmbi5mdWxsc2NyZWVuY2hhbmdlLFxuXHRcdGVycm9yOiBmbi5mdWxsc2NyZWVuZXJyb3Jcblx0fTtcblxuXHR2YXIgc2NyZWVuZnVsbCA9IHtcblx0XHRyZXF1ZXN0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0XHRcdFx0dmFyIG9uRnVsbFNjcmVlbkVudGVyZWQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0dGhpcy5vZmYoJ2NoYW5nZScsIG9uRnVsbFNjcmVlbkVudGVyZWQpO1xuXHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0fS5iaW5kKHRoaXMpO1xuXG5cdFx0XHRcdHRoaXMub24oJ2NoYW5nZScsIG9uRnVsbFNjcmVlbkVudGVyZWQpO1xuXG5cdFx0XHRcdGVsZW1lbnQgPSBlbGVtZW50IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxuXHRcdFx0XHR2YXIgcmV0dXJuUHJvbWlzZSA9IGVsZW1lbnRbZm4ucmVxdWVzdEZ1bGxzY3JlZW5dKCk7XG5cblx0XHRcdFx0aWYgKHJldHVyblByb21pc2UgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG5cdFx0XHRcdFx0cmV0dXJuUHJvbWlzZS50aGVuKG9uRnVsbFNjcmVlbkVudGVyZWQpLmNhdGNoKHJlamVjdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0fSxcblx0XHRleGl0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFx0XHRpZiAoIXRoaXMuaXNGdWxsc2NyZWVuKSB7XG5cdFx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHZhciBvbkZ1bGxTY3JlZW5FeGl0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHRoaXMub2ZmKCdjaGFuZ2UnLCBvbkZ1bGxTY3JlZW5FeGl0KTtcblx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdH0uYmluZCh0aGlzKTtcblxuXHRcdFx0XHR0aGlzLm9uKCdjaGFuZ2UnLCBvbkZ1bGxTY3JlZW5FeGl0KTtcblxuXHRcdFx0XHR2YXIgcmV0dXJuUHJvbWlzZSA9IGRvY3VtZW50W2ZuLmV4aXRGdWxsc2NyZWVuXSgpO1xuXG5cdFx0XHRcdGlmIChyZXR1cm5Qcm9taXNlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuXHRcdFx0XHRcdHJldHVyblByb21pc2UudGhlbihvbkZ1bGxTY3JlZW5FeGl0KS5jYXRjaChyZWplY3QpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LmJpbmQodGhpcykpO1xuXHRcdH0sXG5cdFx0dG9nZ2xlOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuaXNGdWxsc2NyZWVuID8gdGhpcy5leGl0KCkgOiB0aGlzLnJlcXVlc3QoZWxlbWVudCk7XG5cdFx0fSxcblx0XHRvbmNoYW5nZTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG5cdFx0XHR0aGlzLm9uKCdjaGFuZ2UnLCBjYWxsYmFjayk7XG5cdFx0fSxcblx0XHRvbmVycm9yOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcblx0XHRcdHRoaXMub24oJ2Vycm9yJywgY2FsbGJhY2spO1xuXHRcdH0sXG5cdFx0b246IGZ1bmN0aW9uIChldmVudCwgY2FsbGJhY2spIHtcblx0XHRcdHZhciBldmVudE5hbWUgPSBldmVudE5hbWVNYXBbZXZlbnRdO1xuXHRcdFx0aWYgKGV2ZW50TmFtZSkge1xuXHRcdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2ssIGZhbHNlKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdG9mZjogZnVuY3Rpb24gKGV2ZW50LCBjYWxsYmFjaykge1xuXHRcdFx0dmFyIGV2ZW50TmFtZSA9IGV2ZW50TmFtZU1hcFtldmVudF07XG5cdFx0XHRpZiAoZXZlbnROYW1lKSB7XG5cdFx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjaywgZmFsc2UpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cmF3OiBmblxuXHR9O1xuXG5cdGlmICghZm4pIHtcblx0XHRpZiAoaXNDb21tb25qcykge1xuXHRcdFx0bW9kdWxlLmV4cG9ydHMgPSB7aXNFbmFibGVkOiBmYWxzZX07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHdpbmRvdy5zY3JlZW5mdWxsID0ge2lzRW5hYmxlZDogZmFsc2V9O1xuXHRcdH1cblxuXHRcdHJldHVybjtcblx0fVxuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHNjcmVlbmZ1bGwsIHtcblx0XHRpc0Z1bGxzY3JlZW46IHtcblx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gQm9vbGVhbihkb2N1bWVudFtmbi5mdWxsc2NyZWVuRWxlbWVudF0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0ZWxlbWVudDoge1xuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gZG9jdW1lbnRbZm4uZnVsbHNjcmVlbkVsZW1lbnRdO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0aXNFbmFibGVkOiB7XG5cdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8vIENvZXJjZSB0byBib29sZWFuIGluIGNhc2Ugb2Ygb2xkIFdlYktpdFxuXHRcdFx0XHRyZXR1cm4gQm9vbGVhbihkb2N1bWVudFtmbi5mdWxsc2NyZWVuRW5hYmxlZF0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0aWYgKGlzQ29tbW9uanMpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IHNjcmVlbmZ1bGw7XG5cdH0gZWxzZSB7XG5cdFx0d2luZG93LnNjcmVlbmZ1bGwgPSBzY3JlZW5mdWxsO1xuXHR9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgY3J5cHQgPSByZXF1aXJlKCdjcnlwdCcpLFxuICAgICAgdXRmOCA9IHJlcXVpcmUoJ2NoYXJlbmMnKS51dGY4LFxuICAgICAgYmluID0gcmVxdWlyZSgnY2hhcmVuYycpLmJpbixcblxuICAvLyBUaGUgY29yZVxuICBzaGExID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgICAvLyBDb252ZXJ0IHRvIGJ5dGUgYXJyYXlcbiAgICBpZiAobWVzc2FnZS5jb25zdHJ1Y3RvciA9PSBTdHJpbmcpXG4gICAgICBtZXNzYWdlID0gdXRmOC5zdHJpbmdUb0J5dGVzKG1lc3NhZ2UpO1xuICAgIGVsc2UgaWYgKHR5cGVvZiBCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBCdWZmZXIuaXNCdWZmZXIgPT0gJ2Z1bmN0aW9uJyAmJiBCdWZmZXIuaXNCdWZmZXIobWVzc2FnZSkpXG4gICAgICBtZXNzYWdlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobWVzc2FnZSwgMCk7XG4gICAgZWxzZSBpZiAoIUFycmF5LmlzQXJyYXkobWVzc2FnZSkpXG4gICAgICBtZXNzYWdlID0gbWVzc2FnZS50b1N0cmluZygpO1xuXG4gICAgLy8gb3RoZXJ3aXNlIGFzc3VtZSBieXRlIGFycmF5XG5cbiAgICB2YXIgbSAgPSBjcnlwdC5ieXRlc1RvV29yZHMobWVzc2FnZSksXG4gICAgICAgIGwgID0gbWVzc2FnZS5sZW5ndGggKiA4LFxuICAgICAgICB3ICA9IFtdLFxuICAgICAgICBIMCA9ICAxNzMyNTg0MTkzLFxuICAgICAgICBIMSA9IC0yNzE3MzM4NzksXG4gICAgICAgIEgyID0gLTE3MzI1ODQxOTQsXG4gICAgICAgIEgzID0gIDI3MTczMzg3OCxcbiAgICAgICAgSDQgPSAtMTAwOTU4OTc3NjtcblxuICAgIC8vIFBhZGRpbmdcbiAgICBtW2wgPj4gNV0gfD0gMHg4MCA8PCAoMjQgLSBsICUgMzIpO1xuICAgIG1bKChsICsgNjQgPj4+IDkpIDw8IDQpICsgMTVdID0gbDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbS5sZW5ndGg7IGkgKz0gMTYpIHtcbiAgICAgIHZhciBhID0gSDAsXG4gICAgICAgICAgYiA9IEgxLFxuICAgICAgICAgIGMgPSBIMixcbiAgICAgICAgICBkID0gSDMsXG4gICAgICAgICAgZSA9IEg0O1xuXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDgwOyBqKyspIHtcblxuICAgICAgICBpZiAoaiA8IDE2KVxuICAgICAgICAgIHdbal0gPSBtW2kgKyBqXTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdmFyIG4gPSB3W2ogLSAzXSBeIHdbaiAtIDhdIF4gd1tqIC0gMTRdIF4gd1tqIC0gMTZdO1xuICAgICAgICAgIHdbal0gPSAobiA8PCAxKSB8IChuID4+PiAzMSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdCA9ICgoSDAgPDwgNSkgfCAoSDAgPj4+IDI3KSkgKyBINCArICh3W2pdID4+PiAwKSArIChcbiAgICAgICAgICAgICAgICBqIDwgMjAgPyAoSDEgJiBIMiB8IH5IMSAmIEgzKSArIDE1MTg1MDAyNDkgOlxuICAgICAgICAgICAgICAgIGogPCA0MCA/IChIMSBeIEgyIF4gSDMpICsgMTg1OTc3NTM5MyA6XG4gICAgICAgICAgICAgICAgaiA8IDYwID8gKEgxICYgSDIgfCBIMSAmIEgzIHwgSDIgJiBIMykgLSAxODk0MDA3NTg4IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAoSDEgXiBIMiBeIEgzKSAtIDg5OTQ5NzUxNCk7XG5cbiAgICAgICAgSDQgPSBIMztcbiAgICAgICAgSDMgPSBIMjtcbiAgICAgICAgSDIgPSAoSDEgPDwgMzApIHwgKEgxID4+PiAyKTtcbiAgICAgICAgSDEgPSBIMDtcbiAgICAgICAgSDAgPSB0O1xuICAgICAgfVxuXG4gICAgICBIMCArPSBhO1xuICAgICAgSDEgKz0gYjtcbiAgICAgIEgyICs9IGM7XG4gICAgICBIMyArPSBkO1xuICAgICAgSDQgKz0gZTtcbiAgICB9XG5cbiAgICByZXR1cm4gW0gwLCBIMSwgSDIsIEgzLCBINF07XG4gIH0sXG5cbiAgLy8gUHVibGljIEFQSVxuICBhcGkgPSBmdW5jdGlvbiAobWVzc2FnZSwgb3B0aW9ucykge1xuICAgIHZhciBkaWdlc3RieXRlcyA9IGNyeXB0LndvcmRzVG9CeXRlcyhzaGExKG1lc3NhZ2UpKTtcbiAgICByZXR1cm4gb3B0aW9ucyAmJiBvcHRpb25zLmFzQnl0ZXMgPyBkaWdlc3RieXRlcyA6XG4gICAgICAgIG9wdGlvbnMgJiYgb3B0aW9ucy5hc1N0cmluZyA/IGJpbi5ieXRlc1RvU3RyaW5nKGRpZ2VzdGJ5dGVzKSA6XG4gICAgICAgIGNyeXB0LmJ5dGVzVG9IZXgoZGlnZXN0Ynl0ZXMpO1xuICB9O1xuXG4gIGFwaS5fYmxvY2tzaXplID0gMTY7XG4gIGFwaS5fZGlnZXN0c2l6ZSA9IDIwO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gYXBpO1xufSkoKTtcbiJdfQ==
