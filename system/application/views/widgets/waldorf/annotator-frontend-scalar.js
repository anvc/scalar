(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports={
    "client_id": "scalar",
    "client_ver": "2.6",
    "native": true,
    "id": "",
    "api_key": ""
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
    this.onomyVocabulary = [];
  }

  _createClass(AnnotationManager, [{
    key: "PopulateFromJSON",
    value: function PopulateFromJSON(json) {
      if (json.length == 0) {
        console.warn("JSON contains no annotations.");
      }

      if ('undefined' == typeof json.items) {
        // Version 1
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
      } else {
        // Version 2
        var _iterator2 = _createForOfIteratorHelper(json.items[0].items),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var _object = _step2.value;
            this.RegisterAnnotation(_object, JSON.parse(JSON.stringify(json.items[0])));
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    }
  }, {
    key: "RegisterAnnotation",
    value: function RegisterAnnotation(jsonObject, canvasObject) {
      //console.log("Registering new annotation with ID " + jsonObject.id);
      var anno = new _annotation.Annotation(jsonObject, canvasObject);
      this.annotations.push(anno);
    }
  }, {
    key: "RemoveAnnotation",
    value: function RemoveAnnotation(id) {
      this.annotations = this.annotations.filter(function (obj) {
        if ('undefined' == typeof obj.items) {
          // Version 1
          return id !== obj.id;
        } else {
          // Version 2
          return id !== obj.items[0].items[0].items[0].id;
        }
      });
    }
    /**
     * Update the given annotation in the stored array
     */

  }, {
    key: "UpdateAnnotation",
    value: function UpdateAnnotation(annotation, oldID) {
      //console.log("Updating annotation ID " + oldID + " to " + annotation.metadata.id);
      this.RemoveAnnotation(oldID); //this.RegisterAnnotation(annotation);

      this.PopulateFromJSON(annotation);
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
  }, {
    key: "GetOnomyVocabulary",
    value: function GetOnomyVocabulary() {
      return this.onomyVocabulary;
    }
  }, {
    key: "UpdateOnomyVocabulary",
    value: function UpdateOnomyVocabulary(vocabulary) {
      this.onomyVocabulary = vocabulary;
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

/// A wrapper for JSON objects.
var Annotation = /*#__PURE__*/function () {
  function Annotation() {
    var json = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var canvas = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, Annotation);

    var version = "v2";

    if (json) {
      if ('undefined' == typeof json.items) {
        version = "v1";
      } else {
        version = "v2";
      }
    } // ver1


    if (version == "v1") {
      this["@context"] = "http://www.w3.org/ns/anno.jsonld";
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
      };
      this["type"] = "Annotation";
      this["motivation"] = "highlighting";
      this["body"] = [];
      this["target"] = {};
      this["annotation_version"] = "v1";
      this.readConfig(version);

      if (json) {
        Object.assign(this, json);
      }
    } else {
      // ver2 docs/webannotation_spec/sample_2.0.json
      this["@context"] = ["http://www.w3.org/ns/anno.jsonld", "http://iiif.io/api/presentation/3/context.json"];
      this["service"] = [{
        "client_id": "scalar",
        "client_ver": "2.5.12",
        "items": {
          "native": false,
          "id": "__CHECK_CONFIG_FILE__ID__",
          "api_key": "__CHECK_CONFIG_FILE__API_KEY__",
          "action": "TOBEFILLED",
          "format": "json"
        }
      }];
      this["type"] = "Manifest";
      this["items"] = [];

      if (canvas) {
        this["items"].push(canvas); // The "Canvas"

        this["items"][0].items = [json]; // The "AnnotationPage" + "Annotation"
      }

      this["annotation_version"] = "v2";
      this.readConfig(version);
    }

    if (json) {
      // Compute read only easy access properties
      this.recalculate();
    }
  }

  _createClass(Annotation, [{
    key: "readConfig",
    value: function readConfig(version) {
      var config = require("../annotator-config.json");

      if (version == "v1") {
        // ver1
        this["request"]["client_id"] = config.client_id;
        this["request"]["client_ver"] = config.client_ver;
        this["request"]["items"]["native"] = config["native"];
        this["request"]["items"]["id"] = config.id;
        this["request"]["items"]["api_key"] = config.api_key;
      } else {
        // ver2
        this["service"][0]["client_id"] = config.client_id;
        this["service"][0]["client_ver"] = config.client_ver;
        this["service"][0]["items"]["native"] = config["native"];
        this["service"][0]["items"]["id"] = config.id;
        this["service"][0]["items"]["api_key"] = config.api_key;
      }
    } /// Compute read only easy access properties

  }, {
    key: "recalculate",
    value: function recalculate() {
      console.log(this);

      if ('undefined' == typeof this.items) {
        // Version 1
        var timeSlice = this.target.selector.filter(function (item) {
          return item.type === "FragmentSelector";
        })[0].value;
      } else {
        // Version 2
        var timeSlice = this.items[0].items[0].items[0].target.selector.value;
      }

      timeSlice = timeSlice.replace('#t=npt:', 't=');
      timeSlice = timeSlice.replace("t=", ""); /// Start time in seconds

      this.beginTime = parseFloat(timeSlice.split(",")[0]); /// End time in seconds

      this.endTime = parseFloat(timeSlice.split(",")[1]);
      console.log('beginTime: ' + this.beginTime + ' endTime: ' + this.endTime); /// Extract tags from annotation

      if ('undefined' == typeof this.items) {
        // Version 1
        this.tags = this.body.filter(function (item) {
          return item.purpose === "tagging";
        }).map(function (item) {
          return item.value;
        });
      } else {
        // Version 2
        this.tags = [];

        for (var j = 0; j < this.items[0].items[0].items[0].body.length; j++) {
          if (this.items[0].items[0].items[0].body[j].purpose != 'tagging') continue;

          if ('undefined' != typeof this.items[0].items[0].items[0].body[j].value) {
            // Basic tag
            this.tags.push(this.items[0].items[0].items[0].body[j].value);
          } else if ('undefined' != typeof this.items[0].items[0].items[0].body[j].source) {
            // Onomy tag
            this.tags.push(this.items[0].items[0].items[0].body[j].source.label['en']); // TODO: english hard-coded here
          }
        }
      }

      console.log('Tags: ' + this.tags); // Start and end poly points

      this.polyStart = null;
      this.polyEnd = null;
      var pointsSelector = [];

      if ('undefined' == typeof this.items) {
        // Version 1
        pointsSelector = this.target.selector.filter(function (item) {
          return item.type === "SvgSelector";
        });
      } else {
        // Version 2
        pointsSelector = 'undefined' != typeof this.items[0].items[0].items[0].target.selector.refinedBy ? [this.items[0].items[0].items[0].target.selector.refinedBy] : [];
      }

      if (pointsSelector.length > 0) {
        var pointsSvg = pointsSelector[0].value;
        var regExString = new RegExp("(?:points=')(.*?)(?:')", "ig");
        var pointsRE = regExString.exec(pointsSvg)[1];
        var pointsData = pointsRE.trim().split(" ").map(function (item) {
          return item.split(",");
        });
        this.polyStart = pointsData;
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(pointsSvg, "text/xml");

        if (xmlDoc.getElementsByTagName("animate").length) {
          // If there is no animation element, create an "animation" from the static points
          pointsRE = xmlDoc.getElementsByTagName("animate")[0].getAttribute("to");
          pointsData = pointsRE.trim().split(" ").map(function (item) {
            return item.split(",");
          });
          this.polyEnd = pointsData;
        }
      }

      console.log('polyStart: ');
      console.log(this.polyStart);
      console.log('polyEnd: ');
      console.log(this.polyEnd);
    }
  }, {
    key: "getPoly",
    value: function getPoly() {
      var pointsSelector = [];

      if ('undefined' == typeof this.items) {
        // Version 1
        pointsSelector = this.target.selector.filter(function (item) {
          return item.type === "SvgSelector";
        });
      } else {
        // Version 2
        pointsSelector = 'undefined' != typeof this.items[0].items[0].items[0].target.selector.refinedBy ? [this.items[0].items[0].items[0].target.selector.refinedBy] : [];
      }

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
      var pointsSelector = [];

      if ('undefined' == typeof this.items) {
        // Version 1
        pointsSelector = this.target.selector.filter(function (item) {
          return item.type === "SvgSelector";
        });
      } else {
        // Version 2
        pointsSelector = 'undefined' != typeof this.items[0].items[0].items[0].target.selector.refinedBy ? [this.items[0].items[0].items[0].target.selector.refinedBy] : [];
      }

      if (pointsSelector.length == 0) return null; // Parse the points array from the annotation

      var pointsSvg = pointsSelector[0].value;
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(pointsSvg, "text/xml");

      if (!xmlDoc.getElementsByTagName("animate").length) {
        // If there is no animation element, create an "animation" from the static points
        var points = this.getPoly();
        return [points, points];
      } else {
        return [xmlDoc.getElementsByTagName("animate")[0].getAttribute("from"), xmlDoc.getElementsByTagName("animate")[0].getAttribute("to")];
      }
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

    this.player = args.player; // Bring in the argument from the constructor
    //These config options are required for saving annotations to a server

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

    this.onomyLanguage = typeof args.onomyLanguage === 'undefined' ? '' : args.onomyLanguage;
    this.onomyVocabulary = []; //localURL implies kiosk mode

    if (this.localURL != '') this.kioskMode = true; //additional data from annotations collected from scalar to be added in API 2.0 

    this.contentLabel = "";
    this.artURL = "";
    this.annotationPageURL = "";
    this.Wrap();
    this.PopulateControls(); //may need to move this below the this.server block later?

    this.messageOverlay = new _messageOverlay.MessageOverlay(this);
    this.annotationManager = new _annotationManager.AnnotationManager();
    this.sessionManager = new _sessionManager.SessionManager(this); //load onomy vocabulary

    $.ajax(this.gui.GetTagsQuery()).done(function (vocabulary) {
      //console.log("OnomyVocabulary is loaded");
      var parsedVocabulary = _this.gui.OnomyVocabularProcess(vocabulary, _this.onomyLanguage);

      _this.annotationManager.UpdateOnomyVocabulary(parsedVocabulary);

      _this.onomyVocabulary = parsedVocabulary;
    }); //localURL takes precendence - if it is anything but '' then do not load from server

    if (this.localURL == '') {
      this.server = new _serverInterface.ServerInterface(this);
      this.server.SetBaseURL(this.serverURL); // Load annotations from server based on the player's video URL

      this.server.FetchAnnotations('location', this.player.videoElement.currentSrc).done(function (json) {
        if ('undefined' == typeof json.items) {
          // Version 1
          //json.shift()  // Assume first node is a content node
          for (var j = json.length - 1; j >= 0; j--) {
            if (json[j].type != "Annotation") {
              var annotation_info = json[j];
              _this.contentLabel = annotation_info["dcterms:title"];
              _this.artURL = annotation_info["art:url"];
              console.log(annotation_info["dcterms:title"]);
              json.splice(j, 1);
            } else {
              for (var k = 0; k < json[j].target.selector.length; k++) {
                if ('FragmentSelector' != json[j].target.selector[k].type) continue;
                json[j].target.selector[k].value = json[j].target.selector[k].value.replace('#t=npt:', 't=');
              }
            }
          }
        } else {
          // Version 2
          _this.contentLabel = json.label.en[0];
          _this.artURL = json.items[0].content.id;
          _this.annotationPageURL = json.items[0].items[0].items[0].id;
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

        if ('undefined' == typeof json.items) {
          // Version 1
          //json.shift()  // Assume first node is a content node
          for (var j = json.length - 1; j >= 0; j--) {
            if (json[j].type != "Annotation") {
              var annotation_info = json[j];
              _this.contentLabel = annotation_info["dcterms:title"];
              _this.artURL = annotation_info["art:url"];
              console.log(annotation_info["dcterms:title"]);
              json.splice(j, 1);
            } else {
              for (var k = 0; k < json[j].target.selector.length; k++) {
                if ('FragmentSelector' != json[j].target.selector[k].type) continue;
                json[j].target.selector[k].value = json[j].target.selector[k].value.replace('#t=npt:', 't=');
              }
            }
          }
        } else {
          // Version 2
          _this.contentLabel = json.label.en[0];
          _this.artURL = json.items[0].content.id;
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
      //this.annotationManager.RegisterAnnotation(annotation);
      this.annotationManager.PopulateFromJSON(annotation); // Throw event for listening objects (e.g. tick-bar)

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
      var id = '';

      if ('undefined' == typeof annotation.items) {
        // Ver 1
        id = annotation.id;
      } else {
        // Ver 2
        id = annotation.items[0].items[0].items[0].id;
      }

      this.annotationManager.RemoveAnnotation(id); //this.annotationsNow = this.annotationManager.AnnotationsAtTime(this.player.videoElement.currentTime);
      // Throw event for listening objects (e.g. tick-bar)

      this.$container.trigger("OnAnnotationRemoved", [id]); // Update dependent views

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
      console.log("annotation-gui.js:109 -> this.annotator.annotationManager.onomyVocabulary");
      console.log(this.annotator.annotationManager);
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
        _this2.SetVisible(false); //console.log("annotation-gui:353 Create");


        _this2.polyEditor.BeginEditing();
      });
      $editPolyButton.attr('title', "Edit polygon");
      this.RegisterElement($editPolyButton, $buttonPanel, -1); // Make delete button

      this.$deleteButton = $("<button>Delete Annotation</button>").button({
        icon: "fa fa-bomb",
        showLabel: false
      });
      this.$deleteButton.css("margin-right", "15px");
      this.$deleteButton.attr('title', "Delete annotation");
      this.$deleteButton.click(function () {
        _this2.annotator.server.DeleteAnnotation(_this2.originalAnnotation, function () {
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

      //console.log(isVisible + " " + duration);
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
      this.Open(); // Populate data from the passed in annotation

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

        if ('undefined' == typeof annotation.items) {
          // Version 1
          this.$textField.val(annotation.body.filter(function (item) {
            return item.purpose == "describing";
          })[0].value); // Version 1 doesn't have a this.id context
        } else {
          // Version 2
          this.$textField.val(annotation.items[0].items[0].items[0].body.filter(function (item) {
            return item.purpose == "describing";
          })[0].value);
          this.id = annotation.items[0].items[0].items[0].id;
        } // Reset the tags field


        this.$tagsField.val("").trigger("change");
        this.$tagsField.find("option").remove();

        var _iterator = _createForOfIteratorHelper(annotation.tags),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var tag = _step.value;
            this.$tagsField.append("<option value='" + tag + "' selected>" + tag + "</option>");
            this.$tagsField.trigger("change");
          } // this.polyEditor.InitPoly(annotation.getPoly());
          // this.polyEditor.ShowJustPolygon();
          // Propagate the polygon editor's polygons array with polygons from the annotation

        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        this.polyEditor.$polygons = [];

        if (annotation.polyStart != null) {
          this.polyEditor.$polygons.push(annotation.polyStart);

          if (annotation.polyEnd != null) {
            this.polyEditor.$polygons.push(annotation.polyEnd);
          }
        }
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
    } // Build an object from the data.

  }, {
    key: "GetAnnotationObject",
    value: function GetAnnotationObject() {
      var annotation = new _annotation.Annotation();

      if ('undefined' == typeof annotation.items) {
        // Version 1
        annotation["body"] = this.BuildAnnotationBodyV1();
        annotation["target"] = this.BuildAnnotationTarget(true);
      } else {
        // Version 2
        annotation["label"] = {
          "en": [this.annotator.contentLabel]
        };
        annotation["items"] = this.BuildAnnotationItems();
      } // Recompute read-only access properties after all other properties have been set


      annotation.recalculate(); // Clone the object so we don't modify anything by changing this object

      var clone = JSON.parse(JSON.stringify(annotation));
      return clone;
    }
  }, {
    key: "BuildAnnotationItems",
    value: function BuildAnnotationItems() {
      var buildTime = new Date().toISOString(); //"2020-08-16T12:00:00Z"

      var videoDuration = this.annotator.player.videoElement.duration;
      var videoWidth = this.annotator.player.videoElement.videoWidth;
      var videoHeight = this.annotator.player.videoElement.videoHeight; // let videoDimension = this.annotator.player.GetVideoDimensions()
      // videoWidth = videoDimension.width;
      // videoHeight = videoDimension.height;

      var items = [{
        "id": this.annotator.url,
        //TODO: scalar specific url - should be supplied to plugin 
        "type": "Canvas",
        "height": videoHeight,
        "width": videoWidth,
        "duration": videoDuration,
        "content": {
          "id": this.annotator.url,
          "type": "Video",
          "height": videoHeight,
          "width": videoWidth,
          "duration": videoDuration,
          "label": {
            "en": this.annotator.contentLabel //"dcterms:title" from the annotation json file from scalar

          },
          "description": {
            "en": ""
          }
        },
        "items": [{
          "id": this.annotator.url,
          "type": "AnnotationPage",
          "generator": "http://github.com/anvc/scalar",
          "generated": buildTime,
          "items": [{
            "id": this.id,
            // URL to the annotation-page
            "type": "Annotation",
            "generator": "http://github.com/novomancy/waldorf-scalar",
            "motivation": "highlighting",
            "creator": this.BuildCreatorTemplate(),
            "created": buildTime,
            "rights": "https://creativecommons.org/licenses/by/4.0/",
            "body": this.BuildAnnotationBodyV2(),
            "target": this.BuildAnnotationTarget(false)
          }]
        }]
      }];
      return items;
    }
  }, {
    key: "BuildCreatorTemplate",
    value: function BuildCreatorTemplate() {
      return {
        "type": "Person",
        "nickname": localStorage.getItem('waldorf_user_name'),
        "email_sha1": localStorage.getItem('waldorf_user_email')
      };
    } //Build with tags entries from onomy

  }, {
    key: "BuildAnnotationBodyV2",
    value: function BuildAnnotationBodyV2() {
      var body = []; // Build text descriptor

      var bodyText = {
        "type": "TextualBody",
        "value": this.$textField.val(),
        "format": "text/plain",
        "language": "en",
        "purpose": "describing"
      };
      body.push(bodyText); // Build tag descriptors
      //let tags = this.$tagsField.select2("data").map((item) => { return item.text; });

      var selected_tags = this.$tagsField.select2("data").map(function (item) {
        return {
          id: item.id,
          text: item.text
        };
      });
      var onomy_map = this.annotator.annotationManager.onomyVocabulary.results.reduce(function (acc, curr) {
        acc[curr['id']] = curr;
        return acc;
      }, {});

      var _iterator2 = _createForOfIteratorHelper(selected_tags),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var tag = _step2.value;
          var onomy_ref = onomy_map[tag.id];
          var bodyTag = {};

          if (onomy_ref) {
            bodyTag = {
              "type": "SpecificResource",
              "purpose": "tagging",
              "source": {
                "id": onomy_ref.terms_id,
                "format": "application/json",
                "label": {
                  "en": onomy_ref.text
                },
                "description": {
                  "en": onomy_ref.comment
                }
              }
            };
          } else {
            bodyTag = {
              "type": "TextualBody",
              "purpose": "tagging",
              "value": tag.text
            };
          }

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

      var _iterator3 = _createForOfIteratorHelper(tags),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var tagStr = _step3.value;
          var bodyTag = {
            "type": "TextualBody",
            "purpose": "tagging",
            "value": tagStr
          };
          body.push(bodyTag);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      return body;
    } //used both v1 and v2

  }, {
    key: "BuildAnnotationTarget",
    value: function BuildAnnotationTarget(selectorsInArray) {
      if ('undefined' == typeof selectorsInArray) selectorsInArray = false;
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

      var startTime = (0, _time.GetSecondsFromHMS)(this.$timeStartField.val()); // Build time selector

      var timeSelector = {
        "type": "FragmentSelector",
        "conformsTo": "http://www.w3.org/TR/media-frags/",
        // See media fragment specification
        "value": "t=".concat(startTime, ",").concat(safeEndTime) // Time interval in seconds

      }; //Build SvgSelector

      if (this.polyEditor.$polygons.length > 0) {
        var pointsStr = this.polyEditor.$polygons[0].map(function (item) {
          return "".concat(item[0], ",").concat(item[1]);
        }).join(" ");
        console.log('$polygons[0]: ' + pointsStr);
        var value = "<svg viewBox='0 0 100 100' preserveAspectRatio='none'>";
        value += "<polygon points='" + pointsStr + "' />";

        if ('undefined' != typeof this.polyEditor.$polygons[1]) {
          var animeStr = this.polyEditor.$polygons[1].map(function (item) {
            return "".concat(item[0], ",").concat(item[1]);
          }).join(" ");
          console.log('$polygons[1]: ' + animeStr);
          value += "<animate attributeName='points' from='" + pointsStr + "' to='" + animeStr + "'";
          value += " start='" + startTime + "' end='" + safeEndTime + "' />";
        }

        value += "</svg>";
        var polygonSelector = {
          "type": "SvgSelector",
          "conformsTo": "http://www.w3.org/TR/SVG/",
          //added for v2
          "value": "".concat(value) // http://stackoverflow.com/a/24898728

        };

        if (selectorsInArray) {
          selectors.push(polygonSelector);
        } else {
          timeSelector["refinedBy"] = polygonSelector;
        }
      }

      if (selectorsInArray) {
        selectors.push(timeSelector);
        target["selector"] = selectors;
      } else {
        target["selector"] = timeSelector;
      }

      return target;
    }
  }, {
    key: "GetTagsQuery",
    value: function GetTagsQuery() {
      if (this.annotator.annotationManager != undefined && this.annotator.annotationManager.onomyVocabulary.length > 0) {
        return this.annotator.annotationManager.onomyVocabulary;
      }

      return {
        url: this.annotator.tagsURL,
        dataType: 'json',
        delay: 250,
        cache: true,
        onomyLanguage: this.annotator.onomyLanguage,
        annotationManager: this.annotator.annotationManager,
        parseFunction: this.OnomyVocabularProcess,
        processResults: function processResults(data) {
          return this.ajaxOptions.parseFunction(data, this.ajaxOptions.onomyLanguage);
        }
      };
    }
  }, {
    key: "OnomyVocabularProcess",
    value: function OnomyVocabularProcess(data, onomyLanguage) {
      // Parse the labels into the format expected by Select2
      // multilingual tags
      var multilingual_tags = [];
      var m_comments = {};
      var comments = {};
      var m_index = 1;
      var tags = [];
      var index = 1;

      var _iterator4 = _createForOfIteratorHelper(data["terms"]),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var term = _step4.value;
          //if onomyLanguage is defined collect multilingual tags
          var terms_id = term["rdfs:about"];
          var terms_comment = term["rdfs:comment"];

          if (onomyLanguage != '' && term['labels'] != undefined) {
            var t_label = "";
            var t_comment = ""; //get labels

            var _iterator5 = _createForOfIteratorHelper(term["labels"]),
                _step5;

            try {
              for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                var label = _step5.value;
                var xml_lang = label["xml:lang"];
                var m_label = label["rdfs:label"];

                if (xml_lang == onomyLanguage && m_label && m_label.trim != "") {
                  t_label = m_label;
                }
              } //get comments

            } catch (err) {
              _iterator5.e(err);
            } finally {
              _iterator5.f();
            }

            var _iterator6 = _createForOfIteratorHelper(term['comments']),
                _step6;

            try {
              for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                var _label = _step6.value;
                var _xml_lang = _label["xml:lang"];
                var m_comment = _label["rdfs:comments"]; //TODO: change to comment after fixing Onomy

                if (_xml_lang == onomyLanguage && m_comment) {
                  t_comment = m_comment;
                }
              } // use the term comment value if comment is blank

            } catch (err) {
              _iterator6.e(err);
            } finally {
              _iterator6.f();
            }

            if (t_comment == undefined || t_comment.trim == "") {
              t_comment = terms_comment;
            }

            multilingual_tags.push({
              id: m_index,
              text: t_label,
              terms_id: terms_id,
              comment: t_comment
            });
            m_index++;
          }

          tags.push({
            id: index,
            text: term["rdfs:label"],
            terms_id: term["rdfs:about"],
            comment: term["rdfs:comment"]
          });
          index++;
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      var return_tags = multilingual_tags;

      if (return_tags.length == 0) {
        return_tags = tags;
      } //console.log("return_tags");
      //console.log(return_tags);


      return {
        results: return_tags
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

      if ('undefined' == typeof annotation.items) {
        // Version 1
        var annotation_body = annotation.body.filter(function (item) {
          return item.purpose === "describing";
        })[0];
        var annotation_creator = annotation.creator != null ? annotation.creator : {};
      } else {
        // Version 2
        var annotation_body = annotation.items[0].items[0].items[0].body.filter(function (item) {
          return item.purpose === "describing";
        })[0];
        var annotation_creator = annotation.items[0].items[0].items[0].creator;
      }

      $content.append("<b>Text: </b> " + annotation_body.value);
      $content.append("<br>");
      $content.append("<b>Tags: </b> " + annotation.tags.join(", "));
      $content.append("<br>");
      $content.append("<b>Time: </b> " + (0, _time.GetFormattedTime)(annotation.beginTime) + " - " + (0, _time.GetFormattedTime)(annotation.endTime));
      $content.append("<br>");
      $content.append("<b>Submitter:</b> " + ('undefined' != typeof annotation_creator.nickname && annotation_creator.nickname.length ? annotation_creator.nickname : "<i>Not available</i>")); //$paragraph.append("<strong>Annotation " + (index + 1) + ":</strong><br><pre>" + text.escapeHTML() + "</pre>");

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

    this.$cancelButton = $("<button>Stop polygon editing</button>").button({
      icon: "fa fa-remove",
      showLabel: false
    });
    this.$cancelButton.addClass("waldorf-cancel-button");
    this.$cancelButton.attr('title', "Stop polygon editing");
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

    this.$cancelButton1 = $("<button>Stop polygon editing</button>").button({
      icon: "fa fa-remove",
      showLabel: false
    });
    this.$cancelButton1.css("margin", "0px 5px 4px 5px");
    this.$cancelButton1.addClass("waldorf-cancel-button");
    this.$cancelButton1.attr('title', "Stop Polygon Editing");
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
      //this.AddStartPolygon();

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
      if (this.$polygons.length > 1) {
        this.$polygons = [];
        this.$tempBreadCrumbs = [];
      }

      if (!this.$polygons.length) {
        this.$polygons[0] = this.GetPoints();
        this.$tempBreadCrumbs[0] = [this.$breadcrumbs];
        var msg = "Successfully captured first polygon.";
      } else {
        this.$polygons[1] = this.GetPoints();
        this.$tempBreadCrumbs[1] = [this.$breadcrumbs];
        var msg = "Successfully captured second polygon.";
      }

      this.annotator.messageOverlay.ShowMessage(msg);
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

      if ('undefined' == typeof annotation.items) {
        // Ver 1
        $tick.data("annotation-id", annotation.id);
      } else {
        // Ver 2
        $tick.data("annotation-id", annotation.items[0].items[0].items[0].id);
      }

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
          console.log('Tick: ' + $tick.data("annotation-id"));

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
      // var ajax_url = this.baseURL + 'rdf/file/' + searchParam.replace(this.baseURL, '') + '?format=oac&prov=1&rec=2';
      var ajax_url = this.baseURL + 'rdf/file/' + searchParam.replace(this.baseURL, '') + '?format=iiif&prov=1&rec=2'; //console.log("ajax_url: " + ajax_url);

      return $.ajax({
        url: ajax_url,
        type: "GET",
        jsonp: "callback",
        dataType: "jsonp",
        async: true
      }).done(function (data) {
        console.log('[Server Interface] Fetched ' + ('undefined' == typeof data.items ? data.length - 1 : data.items[0].items.length) + ' annotations for ' + searchKey + ': "' + searchParam + '".');
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
      var annotation = this.annotator.gui.GetAnnotationObject();
      console.log(annotation);
      var key;

      if (this.annotator.apiKey) {
        key = this.annotator.apiKey;
        var email_storage = localStorage.getItem('waldorf_user_email');
        var name_storage = localStorage.getItem('waldorf_user_name');
        if (name_storage == null) name_storage = email_storage;
      } else {
        key = localStorage.getItem('waldorf_auth_token');
      }

      if (this.annotator.apiKey) {
        if (annotation["creator"] == null) annotation["creator"] = {};
        annotation["creator"]["email"] = localStorage.getItem('waldorf_user_email');
        annotation["creator"]["nickname"] = localStorage.getItem('waldorf_user_name');
      }

      if (annotation["annotation_version"] == "v1") {
        annotation["request"]["items"]["action"] = "add";
        delete annotation["items"];
      } else {
        annotation["service"][0]["items"]["action"] = "add";
        delete annotation["target"];
        delete annotation["body"];
      }

      delete annotation["annotation_version"];
      annotation["id"] = this.baseURL + "api/add";
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
          var returned_response = "undefined error while editing the annotation";

          if (response.responseJSON) {
            returned_response = response.responseJSON.error.code[0].value + " : " + response.responseJSON.error.message[0].value;
          }

          console.error("Could not edit the annotation! Message:\n ".concat(returned_response));

          _this3.annotator.messageOverlay.ShowError("Could not edit the annotation!<br>(".concat(returned_response, ")"));
        }
      });
    }
  }, {
    key: "EditAnnotation",
    value: function EditAnnotation(callback) {
      var _this4 = this;

      console.log("Editing annotation...");
      var annotation = this.annotator.gui.GetAnnotationObject();
      console.log(annotation);
      var key;

      if (this.annotator.apiKey) {
        key = this.annotator.apiKey;
        var email_storage = localStorage.getItem('waldorf_user_email');
        var name_storage = localStorage.getItem('waldorf_user_name');
        if (name_storage == null) name_storage = email_storage;
      } else {
        key = localStorage.getItem('waldorf_auth_token');
      }

      if (this.annotator.apiKey) {
        if (annotation["creator"] == null) annotation["creator"] = {};
        annotation["creator"]["email"] = localStorage.getItem('waldorf_user_email');
        annotation["creator"]["nickname"] = localStorage.getItem('waldorf_user_name');
      }

      if (annotation["annotation_version"] == "v1") {
        annotation["request"]["items"]["action"] = "update";
        delete annotation["items"];
      } else {
        annotation["service"][0]["items"]["action"] = "update";
        delete annotation["target"];
        delete annotation["body"];
      }

      delete annotation["annotation_version"];
      var oldID = '';

      if ('undefined' == typeof annotation.items) {
        // Version 1
        oldID = annotation.id;
      } else {
        // Version 2
        oldID = annotation.items[0].items[0].items[0].id;
      }

      console.log("Modifying annotation: " + oldID);
      $.ajax({
        url: this.baseURL + "api/update",
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
    value: function DeleteAnnotation(annotation, callback) {
      var _this5 = this;

      if (!confirm('Are you sure you wish to delete this annotation?')) {
        return;
      }

      var key;

      if (this.annotator.apiKey) {
        key = this.annotator.apiKey;
        var email_storage = localStorage.getItem('waldorf_user_email');
        var name_storage = localStorage.getItem('waldorf_user_name');
        if (name_storage == null) name_storage = email_storage;
      } else {
        key = localStorage.getItem('waldorf_auth_token');
      }

      if (this.annotator.apiKey) {
        if (annotation["creator"] == null) annotation["creator"] = {};
        annotation["creator"]["email"] = localStorage.getItem('waldorf_user_email');
        annotation["creator"]["nickname"] = localStorage.getItem('waldorf_user_name');
      }

      if (annotation["annotation_version"] == "v1") {
        annotation["request"]["items"]["action"] = "update";
        delete annotation["items"];
      } else {
        annotation["service"][0]["items"]["action"] = "update";
        delete annotation["target"];
        delete annotation["body"];
      }

      delete annotation["annotation_version"];
      var oldID = '';

      if ('undefined' == typeof annotation.items) {
        // Version 1
        oldID = annotation.id;
      } else {
        // Version 2
        oldID = annotation.items[0].items[0].items[0].id;
      }

      console.log("Deleting annotation: " + oldID);

      if ('undefined' == typeof annotation.items) {
        // Version 1
        var del_data = {
          "scalar:urn": "urn:scalar:version:" + annotation.id,
          "native": annotation.request.items["native"],
          "action": "DELETE",
          "api_key": annotation.request.items.api_key,
          "id": annotation.request.items.id
        };
        return $.post(this.baseURL + "api/delete", del_data, function (response) {
          {
            console.log("Delete error response");
            console.log(response);
            console.log(response.responseText);
          }
        }).done(function (response) {
          console.log("Successfully deleted the annotation.");

          _this5.annotator.messageOverlay.ShowMessage("Successfully deleted the annotation.");

          if (callback) callback(annotation, oldID);
        }).fail(function (response) {
          var returned_response = "undefined failure while deleting the annotation";

          if (response.responseJSON) {
            response.responseJSON.error.code[0].value + " : " + response.responseJSON.error.message[0].value;
          }

          console.error("Could not delete the annotation. Message:\n ".concat(returned_response));

          _this5.annotator.messageOverlay.ShowError("Could not delete the annotation!<br>(".concat(returned_response, ")"));
        });
      } else {
        // Version 2
        annotation["service"][0]["items"]["action"] = "delete";
        delete annotation["target"];
        delete annotation["body"];
        delete annotation["annotation_version"];
        $.ajax({
          url: this.baseURL + "api/delete",
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
            _this5.annotator.messageOverlay.ShowMessage("Successfully deleted the anotation.");

            if (callback) callback(annotation, oldID);
          },
          error: function error(response) {
            var returned_response = "undefined error while deleting the annotation";

            if (response.responseJSON) {
              returned_response = response.responseJSON.error.code[0].value + " : " + response.responseJSON.error.message[0].value;
            }

            console.error("Could not delete the annotation! Message:\n ".concat(returned_response));

            _this5.annotator.messageOverlay.ShowError("Could not delete the annotation!<br>(".concat(returned_response, ")"));
          }
        });
      }
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

      //console.log(isVisible + " " + duration);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtb2R1bGVzL2Fubm90YXRvci1jb25maWcuanNvbiIsIm1vZHVsZXMvYW5ub3RhdG9yL2Fubm90YXRpb24tbWFuYWdlci5qcyIsIm1vZHVsZXMvYW5ub3RhdG9yL2Fubm90YXRpb24uanMiLCJtb2R1bGVzL2Fubm90YXRvci9hbm5vdGF0b3IuanMiLCJtb2R1bGVzL2Fubm90YXRvci9jb21wb25lbnRzL2Fubm90YXRpb24tZ3VpLmpzIiwibW9kdWxlcy9hbm5vdGF0b3IvY29tcG9uZW50cy9pbmRleC1jb250YWluZXIuanMiLCJtb2R1bGVzL2Fubm90YXRvci9jb21wb25lbnRzL2luZm8tY29udGFpbmVyLmpzIiwibW9kdWxlcy9hbm5vdGF0b3IvY29tcG9uZW50cy9tZXNzYWdlLW92ZXJsYXkuanMiLCJtb2R1bGVzL2Fubm90YXRvci9jb21wb25lbnRzL3BvbHlnb24tZWRpdG9yLmpzIiwibW9kdWxlcy9hbm5vdGF0b3IvY29tcG9uZW50cy9wb2x5Z29uLW92ZXJsYXkuanMiLCJtb2R1bGVzL2Fubm90YXRvci9jb21wb25lbnRzL3RpY2stYmFyLmpzIiwibW9kdWxlcy9hbm5vdGF0b3Ivc2VydmVyLWludGVyZmFjZS5qcyIsIm1vZHVsZXMvYW5ub3RhdG9yL3Nlc3Npb24tbWFuYWdlci5qcyIsIm1vZHVsZXMvY29uZmlnLmpzb24iLCJtb2R1bGVzL21haW4uanMiLCJtb2R1bGVzL3V0aWxzL2FycmF5LWV4dGVuc2lvbnMuanMiLCJtb2R1bGVzL3V0aWxzL2pxdWVyeS1leHRlbnNpb25zLmpzIiwibW9kdWxlcy91dGlscy9wcmVmZXJlbmNlLW1hbmFnZXIuanMiLCJtb2R1bGVzL3V0aWxzL3JlcXVpcmVtZW50cy5qcyIsIm1vZHVsZXMvdXRpbHMvc3RyaW5nLWV4dGVuc2lvbnMuanMiLCJtb2R1bGVzL3V0aWxzL3RpbWUuanMiLCJtb2R1bGVzL3ZlbmRvci5qcyIsIm1vZHVsZXMvdmlkZW8tcGxheWVyL3NlZWtiYXItdG9vbHRpcC5qcyIsIm1vZHVsZXMvdmlkZW8tcGxheWVyL3ZpZGVvLXBsYXllci1iYXIuanMiLCJtb2R1bGVzL3ZpZGVvLXBsYXllci92aWRlby1wbGF5ZXIuanMiLCJub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaGFyZW5jL2NoYXJlbmMuanMiLCJub2RlX21vZHVsZXMvY2xpcC1wYXRoLXBvbHlnb24vanMvY2xpcC1wYXRoLXBvbHlnb24uanMiLCJub2RlX21vZHVsZXMvY3J5cHQvY3J5cHQuanMiLCJub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9xdGlwMi9kaXN0L2pxdWVyeS5xdGlwLmpzIiwibm9kZV9tb2R1bGVzL3NjcmVlbmZ1bGwvZGlzdC9zY3JlZW5mdWxsLmpzIiwibm9kZV9tb2R1bGVzL3NoYTEvc2hhMS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUNOQTs7Ozs7Ozs7Ozs7Ozs7SUFFTSxpQjtBQUNGLCtCQUFhO0FBQUE7O0FBQ1QsU0FBSyxXQUFMLEdBQW1CLEVBQW5CO0FBQ0EsU0FBSyxlQUFMLEdBQXVCLEVBQXZCO0FBQ0g7Ozs7cUNBRWdCLEksRUFBSztBQUVsQixVQUFJLElBQUksQ0FBQyxNQUFMLElBQWUsQ0FBbkIsRUFBcUI7QUFDakIsUUFBQSxPQUFPLENBQUMsSUFBUixDQUFhLCtCQUFiO0FBQ0g7O0FBRUQsVUFBSSxlQUFlLE9BQU8sSUFBSSxDQUFDLEtBQS9CLEVBQXVDO0FBQUc7QUFBSCxtREFDakIsSUFEaUI7QUFBQTs7QUFBQTtBQUNuQyw4REFBdUI7QUFBQSxnQkFBZixNQUFlO0FBQ25CLGlCQUFLLGtCQUFMLENBQXdCLE1BQXhCO0FBQ0g7QUFIa0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUl0QyxPQUpELE1BSU87QUFBRztBQUFILG9EQUNnQixJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsRUFBYyxLQUQ5QjtBQUFBOztBQUFBO0FBQ0gsaUVBQXdDO0FBQUEsZ0JBQS9CLE9BQStCO0FBQ3BDLGlCQUFLLGtCQUFMLENBQXdCLE9BQXhCLEVBQWdDLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsQ0FBZixDQUFYLENBQWhDO0FBQ0g7QUFIRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSU47QUFFSjs7O3VDQUVrQixVLEVBQVksWSxFQUFhO0FBQ3hDO0FBQ0EsVUFBSSxJQUFJLEdBQUcsSUFBSSxzQkFBSixDQUFlLFVBQWYsRUFBMkIsWUFBM0IsQ0FBWDtBQUNBLFdBQUssV0FBTCxDQUFpQixJQUFqQixDQUFzQixJQUF0QjtBQUNIOzs7cUNBRWdCLEUsRUFBRztBQUNoQixXQUFLLFdBQUwsR0FBbUIsS0FBSyxXQUFMLENBQWlCLE1BQWpCLENBQXdCLFVBQUMsR0FBRCxFQUFTO0FBQ2hELFlBQUksZUFBZSxPQUFPLEdBQUcsQ0FBQyxLQUE5QixFQUFzQztBQUFFO0FBQ3BDLGlCQUFPLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBbEI7QUFDSCxTQUZELE1BRU87QUFBRTtBQUNMLGlCQUFPLEVBQUUsS0FBSyxHQUFHLENBQUMsS0FBSixDQUFVLENBQVYsRUFBYSxLQUFiLENBQW1CLENBQW5CLEVBQXNCLEtBQXRCLENBQTRCLENBQTVCLEVBQStCLEVBQTdDO0FBQ0g7QUFDSixPQU5rQixDQUFuQjtBQU9IO0FBRUQ7Ozs7OztxQ0FHaUIsVSxFQUFZLEssRUFBTTtBQUMvQjtBQUNBLFdBQUssZ0JBQUwsQ0FBc0IsS0FBdEIsRUFGK0IsQ0FHL0I7O0FBQ0EsV0FBSyxnQkFBTCxDQUFzQixVQUF0QjtBQUNIOzs7c0NBRWlCLEksRUFBSztBQUVuQjtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0EsVUFBSSxRQUFRLEdBQUcsS0FBSyxXQUFMLENBQWlCLE1BQWpCLENBQXdCLFVBQVMsSUFBVCxFQUFjO0FBQ2pELGVBQU8sSUFBSSxDQUFDLFNBQUwsSUFBa0IsSUFBbEIsSUFBMEIsSUFBSSxJQUFJLElBQUksQ0FBQyxPQUE5QztBQUNILE9BRmMsQ0FBZjtBQUlBLFdBQUssTUFBTCxHQUFjLFFBQWQ7QUFFQSxhQUFPLFFBQVA7QUFDSDs7O3lDQUVvQjtBQUNqQixhQUFPLEtBQUssZUFBWjtBQUNIOzs7MENBRXFCLFUsRUFBWTtBQUM5QixXQUFLLGVBQUwsR0FBdUIsVUFBdkI7QUFDSDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQy9FTDtJQUNNLFU7QUFFRix3QkFBd0M7QUFBQSxRQUE1QixJQUE0Qix1RUFBckIsSUFBcUI7QUFBQSxRQUFmLE1BQWUsdUVBQU4sSUFBTTs7QUFBQTs7QUFFcEMsUUFBSSxPQUFPLEdBQUcsSUFBZDs7QUFFQSxRQUFJLElBQUosRUFBVTtBQUNOLFVBQUksZUFBZSxPQUFPLElBQUksQ0FBQyxLQUEvQixFQUF1QztBQUNuQyxRQUFBLE9BQU8sR0FBRyxJQUFWO0FBQ0gsT0FGRCxNQUVPO0FBQ0gsUUFBQSxPQUFPLEdBQUcsSUFBVjtBQUNIO0FBQ0osS0FWbUMsQ0FZcEM7OztBQUNBLFFBQUksT0FBTyxJQUFJLElBQWYsRUFBcUI7QUFDakIsV0FBSyxVQUFMLElBQW1CLGtDQUFuQjtBQUVBLFdBQUssU0FBTCxJQUFrQjtBQUNkLHFCQUFhLFFBREM7QUFFZCxzQkFBYyxRQUZBO0FBR2QsaUJBQVM7QUFDTCxvQkFBVSxLQURMO0FBRUwsZ0JBQU0sMkJBRkQ7QUFHTCxxQkFBVyxnQ0FITjtBQUlMLG9CQUFVLFlBSkw7QUFLTCxvQkFBVTtBQUxMO0FBSEssT0FBbEI7QUFXQSxXQUFLLE1BQUwsSUFBZSxZQUFmO0FBQ0EsV0FBSyxZQUFMLElBQXFCLGNBQXJCO0FBQ0EsV0FBSyxNQUFMLElBQWUsRUFBZjtBQUNBLFdBQUssUUFBTCxJQUFpQixFQUFqQjtBQUNBLFdBQUssb0JBQUwsSUFBNkIsSUFBN0I7QUFFQSxXQUFLLFVBQUwsQ0FBZ0IsT0FBaEI7O0FBRUEsVUFBSSxJQUFKLEVBQVU7QUFDTixRQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBZCxFQUFvQixJQUFwQjtBQUNIO0FBQ0osS0F6QkQsTUF5Qk87QUFDSDtBQUNBLFdBQUssVUFBTCxJQUFtQixDQUFDLGtDQUFELEVBQ0gsZ0RBREcsQ0FBbkI7QUFFQSxXQUFLLFNBQUwsSUFBa0IsQ0FBQztBQUNmLHFCQUFhLFFBREU7QUFFZixzQkFBYyxRQUZDO0FBR2YsaUJBQVM7QUFDTCxvQkFBVSxLQURMO0FBRUwsZ0JBQU0sMkJBRkQ7QUFHTCxxQkFBVyxnQ0FITjtBQUlMLG9CQUFVLFlBSkw7QUFLTCxvQkFBVTtBQUxMO0FBSE0sT0FBRCxDQUFsQjtBQVdBLFdBQUssTUFBTCxJQUFlLFVBQWY7QUFDQSxXQUFLLE9BQUwsSUFBZ0IsRUFBaEI7O0FBQ0EsVUFBSSxNQUFKLEVBQVk7QUFDUixhQUFLLE9BQUwsRUFBYyxJQUFkLENBQW9CLE1BQXBCLEVBRFEsQ0FDdUI7O0FBQy9CLGFBQUssT0FBTCxFQUFjLENBQWQsRUFBaUIsS0FBakIsR0FBeUIsQ0FBRSxJQUFGLENBQXpCLENBRlEsQ0FFNEI7QUFDdkM7O0FBQ0QsV0FBSyxvQkFBTCxJQUE2QixJQUE3QjtBQUVBLFdBQUssVUFBTCxDQUFnQixPQUFoQjtBQUVIOztBQUVELFFBQUcsSUFBSCxFQUFTO0FBQ0w7QUFDQSxXQUFLLFdBQUw7QUFDSDtBQUVKOzs7OytCQUVVLE8sRUFBUztBQUNoQixVQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsMEJBQUQsQ0FBdEI7O0FBQ0EsVUFBSSxPQUFPLElBQUksSUFBZixFQUFxQjtBQUNqQjtBQUNBLGFBQUssU0FBTCxFQUFnQixXQUFoQixJQUErQixNQUFNLENBQUMsU0FBdEM7QUFDQSxhQUFLLFNBQUwsRUFBZ0IsWUFBaEIsSUFBZ0MsTUFBTSxDQUFDLFVBQXZDO0FBQ0EsYUFBSyxTQUFMLEVBQWdCLE9BQWhCLEVBQXlCLFFBQXpCLElBQXFDLE1BQU0sVUFBM0M7QUFDQSxhQUFLLFNBQUwsRUFBZ0IsT0FBaEIsRUFBeUIsSUFBekIsSUFBaUMsTUFBTSxDQUFDLEVBQXhDO0FBQ0EsYUFBSyxTQUFMLEVBQWdCLE9BQWhCLEVBQXlCLFNBQXpCLElBQXNDLE1BQU0sQ0FBQyxPQUE3QztBQUNILE9BUEQsTUFPTztBQUNIO0FBQ0EsYUFBSyxTQUFMLEVBQWdCLENBQWhCLEVBQW1CLFdBQW5CLElBQWtDLE1BQU0sQ0FBQyxTQUF6QztBQUNBLGFBQUssU0FBTCxFQUFnQixDQUFoQixFQUFtQixZQUFuQixJQUFtQyxNQUFNLENBQUMsVUFBMUM7QUFDQSxhQUFLLFNBQUwsRUFBZ0IsQ0FBaEIsRUFBbUIsT0FBbkIsRUFBNEIsUUFBNUIsSUFBd0MsTUFBTSxVQUE5QztBQUNBLGFBQUssU0FBTCxFQUFnQixDQUFoQixFQUFtQixPQUFuQixFQUE0QixJQUE1QixJQUFvQyxNQUFNLENBQUMsRUFBM0M7QUFDQSxhQUFLLFNBQUwsRUFBZ0IsQ0FBaEIsRUFBbUIsT0FBbkIsRUFBNEIsU0FBNUIsSUFBeUMsTUFBTSxDQUFDLE9BQWhEO0FBQ0g7QUFDSixLLENBRUQ7Ozs7a0NBQ2M7QUFFVixNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWjs7QUFFQSxVQUFJLGVBQWUsT0FBTyxLQUFLLEtBQS9CLEVBQXVDO0FBQUU7QUFDckMsWUFBSSxTQUFTLEdBQUcsS0FBSyxNQUFMLENBQVksUUFBWixDQUFxQixNQUFyQixDQUE0QixVQUFVLElBQVYsRUFBZ0I7QUFDeEQsaUJBQU8sSUFBSSxDQUFDLElBQUwsS0FBYyxrQkFBckI7QUFDRCxTQUZhLEVBRVgsQ0FGVyxFQUVSLEtBRlI7QUFHSCxPQUpELE1BSU87QUFBRTtBQUNMLFlBQUksU0FBUyxHQUFHLEtBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxLQUFkLENBQW9CLENBQXBCLEVBQXVCLEtBQXZCLENBQTZCLENBQTdCLEVBQWdDLE1BQWhDLENBQXVDLFFBQXZDLENBQWdELEtBQWhFO0FBQ0g7O0FBQ0QsTUFBQSxTQUFTLEdBQUcsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsU0FBbEIsRUFBNEIsSUFBNUIsQ0FBWjtBQUNBLE1BQUEsU0FBUyxHQUFHLFNBQVMsQ0FBQyxPQUFWLENBQWtCLElBQWxCLEVBQXdCLEVBQXhCLENBQVosQ0FaVSxDQWNWOztBQUNBLFdBQUssU0FBTCxHQUFpQixVQUFVLENBQUMsU0FBUyxDQUFDLEtBQVYsQ0FBZ0IsR0FBaEIsRUFBcUIsQ0FBckIsQ0FBRCxDQUEzQixDQWZVLENBZ0JWOztBQUNBLFdBQUssT0FBTCxHQUFlLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBVixDQUFnQixHQUFoQixFQUFxQixDQUFyQixDQUFELENBQXpCO0FBQ0EsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGdCQUFnQixLQUFLLFNBQXJCLEdBQWlDLFlBQWpDLEdBQWdELEtBQUssT0FBakUsRUFsQlUsQ0FvQlY7O0FBQ0EsVUFBSSxlQUFlLE9BQU8sS0FBSyxLQUEvQixFQUF1QztBQUFFO0FBQ3JDLGFBQUssSUFBTCxHQUFZLEtBQUssSUFBTCxDQUFVLE1BQVYsQ0FBaUIsVUFBQSxJQUFJO0FBQUEsaUJBQUksSUFBSSxDQUFDLE9BQUwsS0FBaUIsU0FBckI7QUFBQSxTQUFyQixFQUFxRCxHQUFyRCxDQUF5RCxVQUFBLElBQUk7QUFBQSxpQkFBSSxJQUFJLENBQUMsS0FBVDtBQUFBLFNBQTdELENBQVo7QUFDSCxPQUZELE1BRU87QUFBRTtBQUNMLGFBQUssSUFBTCxHQUFZLEVBQVo7O0FBQ0EsYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxLQUFLLEtBQUwsQ0FBVyxDQUFYLEVBQWMsS0FBZCxDQUFvQixDQUFwQixFQUF1QixLQUF2QixDQUE2QixDQUE3QixFQUFnQyxJQUFoQyxDQUFxQyxNQUF6RCxFQUFpRSxDQUFDLEVBQWxFLEVBQXNFO0FBQ2xFLGNBQUksS0FBSyxLQUFMLENBQVcsQ0FBWCxFQUFjLEtBQWQsQ0FBb0IsQ0FBcEIsRUFBdUIsS0FBdkIsQ0FBNkIsQ0FBN0IsRUFBZ0MsSUFBaEMsQ0FBcUMsQ0FBckMsRUFBd0MsT0FBeEMsSUFBbUQsU0FBdkQsRUFBa0U7O0FBQ2xFLGNBQUksZUFBZSxPQUFPLEtBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxLQUFkLENBQW9CLENBQXBCLEVBQXVCLEtBQXZCLENBQTZCLENBQTdCLEVBQWdDLElBQWhDLENBQXFDLENBQXJDLEVBQXdDLEtBQWxFLEVBQTBFO0FBQUc7QUFDekUsaUJBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxLQUFLLEtBQUwsQ0FBVyxDQUFYLEVBQWMsS0FBZCxDQUFvQixDQUFwQixFQUF1QixLQUF2QixDQUE2QixDQUE3QixFQUFnQyxJQUFoQyxDQUFxQyxDQUFyQyxFQUF3QyxLQUF2RDtBQUNILFdBRkQsTUFFTyxJQUFJLGVBQWUsT0FBTyxLQUFLLEtBQUwsQ0FBVyxDQUFYLEVBQWMsS0FBZCxDQUFvQixDQUFwQixFQUF1QixLQUF2QixDQUE2QixDQUE3QixFQUFnQyxJQUFoQyxDQUFxQyxDQUFyQyxFQUF3QyxNQUFsRSxFQUEyRTtBQUFHO0FBQ2pGLGlCQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsS0FBSyxLQUFMLENBQVcsQ0FBWCxFQUFjLEtBQWQsQ0FBb0IsQ0FBcEIsRUFBdUIsS0FBdkIsQ0FBNkIsQ0FBN0IsRUFBZ0MsSUFBaEMsQ0FBcUMsQ0FBckMsRUFBd0MsTUFBeEMsQ0FBK0MsS0FBL0MsQ0FBcUQsSUFBckQsQ0FBZixFQUQ4RSxDQUNEO0FBQ2hGO0FBQ0o7QUFDSjs7QUFDRCxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksV0FBVyxLQUFLLElBQTVCLEVBbENVLENBb0NWOztBQUNBLFdBQUssU0FBTCxHQUFpQixJQUFqQjtBQUNBLFdBQUssT0FBTCxHQUFlLElBQWY7QUFFQSxVQUFJLGNBQWMsR0FBRyxFQUFyQjs7QUFDQSxVQUFJLGVBQWUsT0FBTyxLQUFLLEtBQS9CLEVBQXVDO0FBQUU7QUFDckMsUUFBQSxjQUFjLEdBQUcsS0FBSyxNQUFMLENBQVksUUFBWixDQUFxQixNQUFyQixDQUE0QixVQUFBLElBQUk7QUFBQSxpQkFBSSxJQUFJLENBQUMsSUFBTCxLQUFjLGFBQWxCO0FBQUEsU0FBaEMsQ0FBakI7QUFDSCxPQUZELE1BRU87QUFBRTtBQUNMLFFBQUEsY0FBYyxHQUFJLGVBQWUsT0FBTyxLQUFLLEtBQUwsQ0FBVyxDQUFYLEVBQWMsS0FBZCxDQUFvQixDQUFwQixFQUF1QixLQUF2QixDQUE2QixDQUE3QixFQUFnQyxNQUFoQyxDQUF1QyxRQUF2QyxDQUFnRCxTQUF2RSxHQUFxRixDQUFDLEtBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxLQUFkLENBQW9CLENBQXBCLEVBQXVCLEtBQXZCLENBQTZCLENBQTdCLEVBQWdDLE1BQWhDLENBQXVDLFFBQXZDLENBQWdELFNBQWpELENBQXJGLEdBQW1KLEVBQXBLO0FBQ0g7O0FBQ0QsVUFBSSxjQUFjLENBQUMsTUFBZixHQUF3QixDQUE1QixFQUErQjtBQUMzQixZQUFJLFNBQVMsR0FBRyxjQUFjLENBQUMsQ0FBRCxDQUFkLENBQWtCLEtBQWxDO0FBQ0EsWUFBSSxXQUFXLEdBQUcsSUFBSSxNQUFKLENBQVcsd0JBQVgsRUFBcUMsSUFBckMsQ0FBbEI7QUFDQSxZQUFJLFFBQVEsR0FBRyxXQUFXLENBQUMsSUFBWixDQUFpQixTQUFqQixFQUE0QixDQUE1QixDQUFmO0FBQ0EsWUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLElBQVQsR0FBZ0IsS0FBaEIsQ0FBc0IsR0FBdEIsRUFBMkIsR0FBM0IsQ0FBK0IsVUFBQSxJQUFJO0FBQUEsaUJBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYLENBQUo7QUFBQSxTQUFuQyxDQUFqQjtBQUNBLGFBQUssU0FBTCxHQUFpQixVQUFqQjtBQUVBLFlBQUksTUFBTSxHQUFHLElBQUksU0FBSixFQUFiO0FBQ0EsWUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLGVBQVAsQ0FBdUIsU0FBdkIsRUFBa0MsVUFBbEMsQ0FBYjs7QUFDQSxZQUFJLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixTQUE1QixFQUF1QyxNQUEzQyxFQUFtRDtBQUFHO0FBQ2xELFVBQUEsUUFBUSxHQUFHLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixTQUE1QixFQUF1QyxDQUF2QyxFQUEwQyxZQUExQyxDQUF1RCxJQUF2RCxDQUFYO0FBQ0EsVUFBQSxVQUFVLEdBQUcsUUFBUSxDQUFDLElBQVQsR0FBZ0IsS0FBaEIsQ0FBc0IsR0FBdEIsRUFBMkIsR0FBM0IsQ0FBK0IsVUFBQSxJQUFJO0FBQUEsbUJBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYLENBQUo7QUFBQSxXQUFuQyxDQUFiO0FBQ0EsZUFBSyxPQUFMLEdBQWUsVUFBZjtBQUNIO0FBQ0o7O0FBQ0QsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGFBQVo7QUFDQSxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBSyxTQUFqQjtBQUNBLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxXQUFaO0FBQ0EsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEtBQUssT0FBakI7QUFFSDs7OzhCQUVTO0FBQ04sVUFBSSxjQUFjLEdBQUcsRUFBckI7O0FBQ0EsVUFBSSxlQUFlLE9BQU8sS0FBSyxLQUEvQixFQUF1QztBQUFFO0FBQ3JDLFFBQUEsY0FBYyxHQUFHLEtBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsTUFBckIsQ0FBNEIsVUFBQSxJQUFJO0FBQUEsaUJBQUksSUFBSSxDQUFDLElBQUwsS0FBYyxhQUFsQjtBQUFBLFNBQWhDLENBQWpCO0FBQ0gsT0FGRCxNQUVPO0FBQUU7QUFDTCxRQUFBLGNBQWMsR0FBSSxlQUFlLE9BQU8sS0FBSyxLQUFMLENBQVcsQ0FBWCxFQUFjLEtBQWQsQ0FBb0IsQ0FBcEIsRUFBdUIsS0FBdkIsQ0FBNkIsQ0FBN0IsRUFBZ0MsTUFBaEMsQ0FBdUMsUUFBdkMsQ0FBZ0QsU0FBdkUsR0FBcUYsQ0FBQyxLQUFLLEtBQUwsQ0FBVyxDQUFYLEVBQWMsS0FBZCxDQUFvQixDQUFwQixFQUF1QixLQUF2QixDQUE2QixDQUE3QixFQUFnQyxNQUFoQyxDQUF1QyxRQUF2QyxDQUFnRCxTQUFqRCxDQUFyRixHQUFtSixFQUFwSztBQUNIOztBQUVELFVBQUksY0FBYyxDQUFDLE1BQWYsSUFBeUIsQ0FBN0IsRUFBZ0MsT0FBTyxJQUFQLENBUjFCLENBVU47O0FBQ0EsVUFBSSxTQUFTLEdBQUcsY0FBYyxDQUFDLENBQUQsQ0FBZCxDQUFrQixLQUFsQztBQUNBLFVBQUksV0FBVyxHQUFHLElBQUksTUFBSixDQUFXLHdCQUFYLEVBQXFDLElBQXJDLENBQWxCLENBWk0sQ0FZd0Q7O0FBRTlELFVBQUksUUFBUSxHQUFHLFdBQVcsQ0FBQyxJQUFaLENBQWlCLFNBQWpCLEVBQTRCLENBQTVCLENBQWY7QUFDQSxVQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsSUFBVCxHQUFnQixLQUFoQixDQUFzQixHQUF0QixFQUEyQixHQUEzQixDQUErQixVQUFBLElBQUk7QUFBQSxlQUFJLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBWCxDQUFKO0FBQUEsT0FBbkMsQ0FBakI7QUFFQSxhQUFPLFVBQVA7QUFDSDs7O3VDQUVrQjtBQUNmLFVBQUksY0FBYyxHQUFHLEVBQXJCOztBQUNBLFVBQUksZUFBZSxPQUFPLEtBQUssS0FBL0IsRUFBdUM7QUFBRTtBQUNyQyxRQUFBLGNBQWMsR0FBRyxLQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLE1BQXJCLENBQTRCLFVBQUEsSUFBSTtBQUFBLGlCQUFJLElBQUksQ0FBQyxJQUFMLEtBQWMsYUFBbEI7QUFBQSxTQUFoQyxDQUFqQjtBQUNILE9BRkQsTUFFTztBQUFFO0FBQ0wsUUFBQSxjQUFjLEdBQUksZUFBZSxPQUFPLEtBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxLQUFkLENBQW9CLENBQXBCLEVBQXVCLEtBQXZCLENBQTZCLENBQTdCLEVBQWdDLE1BQWhDLENBQXVDLFFBQXZDLENBQWdELFNBQXZFLEdBQXFGLENBQUMsS0FBSyxLQUFMLENBQVcsQ0FBWCxFQUFjLEtBQWQsQ0FBb0IsQ0FBcEIsRUFBdUIsS0FBdkIsQ0FBNkIsQ0FBN0IsRUFBZ0MsTUFBaEMsQ0FBdUMsUUFBdkMsQ0FBZ0QsU0FBakQsQ0FBckYsR0FBbUosRUFBcEs7QUFDSDs7QUFFRCxVQUFHLGNBQWMsQ0FBQyxNQUFmLElBQXlCLENBQTVCLEVBQStCLE9BQU8sSUFBUCxDQVJoQixDQVVmOztBQUNBLFVBQUksU0FBUyxHQUFHLGNBQWMsQ0FBQyxDQUFELENBQWQsQ0FBa0IsS0FBbEM7QUFDQSxVQUFJLE1BQU0sR0FBRyxJQUFJLFNBQUosRUFBYjtBQUNBLFVBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxlQUFQLENBQXVCLFNBQXZCLEVBQWtDLFVBQWxDLENBQWI7O0FBRUEsVUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixTQUE1QixFQUF1QyxNQUE1QyxFQUFvRDtBQUFHO0FBQ25ELFlBQUksTUFBTSxHQUFHLEtBQUssT0FBTCxFQUFiO0FBQ0EsZUFBTyxDQUFDLE1BQUQsRUFBUyxNQUFULENBQVA7QUFDSCxPQUhELE1BR087QUFDSCxlQUFPLENBQUMsTUFBTSxDQUFDLG9CQUFQLENBQTRCLFNBQTVCLEVBQXVDLENBQXZDLEVBQTBDLFlBQTFDLENBQXVELE1BQXZELENBQUQsRUFBaUUsTUFBTSxDQUFDLG9CQUFQLENBQTRCLFNBQTVCLEVBQXVDLENBQXZDLEVBQTBDLFlBQTFDLENBQXVELElBQXZELENBQWpFLENBQVA7QUFDSDtBQUNKOzs7Ozs7Ozs7Ozs7Ozs7O0FDNU1MOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQUNBLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFELENBQWxCOztJQUVNLGM7QUFDRiwwQkFBWSxJQUFaLEVBQWlCO0FBQUE7O0FBQUE7O0FBQ2IsSUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLDZDQUFaLEVBRGEsQ0FHYjtBQUNBOztBQUNBLFFBQUcsT0FBTyxJQUFJLENBQUMsTUFBWixLQUF1QixXQUExQixFQUFzQztBQUNsQyxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksMkRBQVo7QUFDQSxhQUFPLEtBQVA7QUFDSDs7QUFDRCxTQUFLLE1BQUwsR0FBYyxJQUFJLENBQUMsTUFBbkIsQ0FUYSxDQVNlO0FBRzVCOztBQUNBLFNBQUssU0FBTCxHQUFpQixPQUFPLElBQUksQ0FBQyxTQUFaLEtBQTBCLFdBQTFCLEdBQXdDLEVBQXhDLEdBQTZDLElBQUksQ0FBQyxTQUFuRTtBQUNBLFNBQUssT0FBTCxHQUFlLE9BQU8sSUFBSSxDQUFDLE9BQVosS0FBd0IsV0FBeEIsR0FBc0MsRUFBdEMsR0FBMkMsSUFBSSxDQUFDLE9BQS9EO0FBQ0EsU0FBSyxNQUFMLEdBQWMsT0FBTyxJQUFJLENBQUMsTUFBWixLQUF1QixXQUF2QixHQUFxQyxFQUFyQyxHQUEwQyxJQUFJLENBQUMsTUFBN0QsQ0FmYSxDQWlCYjs7QUFDQSxTQUFLLFdBQUwsR0FBbUIsT0FBTyxJQUFJLENBQUMsV0FBWixLQUE0QixXQUE1QixHQUEwQyxFQUExQyxHQUErQyxJQUFJLENBQUMsV0FBdkU7QUFDQSxTQUFLLFFBQUwsR0FBZ0IsT0FBTyxJQUFJLENBQUMsUUFBWixLQUF5QixXQUF6QixHQUF1QyxFQUF2QyxHQUE0QyxJQUFJLENBQUMsUUFBakUsQ0FuQmEsQ0FxQmI7O0FBQ0EsU0FBSyxRQUFMLEdBQWdCLE9BQU8sSUFBSSxDQUFDLFFBQVosS0FBeUIsV0FBekIsR0FBdUMsRUFBdkMsR0FBNEMsSUFBSSxDQUFDLFFBQWpFLENBdEJhLENBd0JiO0FBQ0E7O0FBQ0EsU0FBSyxTQUFMLEdBQWlCLE9BQU8sSUFBSSxDQUFDLFNBQVosS0FBMEIsV0FBMUIsR0FBd0MsRUFBeEMsR0FBNkMsSUFBSSxDQUFDLFNBQW5FLENBMUJhLENBMkJiOztBQUNBLFNBQUssWUFBTCxHQUFvQixPQUFPLElBQUksQ0FBQyxZQUFaLEtBQTZCLFdBQTdCLEdBQTJDLEtBQTNDLEdBQW1ELElBQUksQ0FBQyxZQUE1RSxDQTVCYSxDQTZCYjs7QUFDQSxTQUFLLFFBQUwsR0FBZ0IsT0FBTyxJQUFJLENBQUMsUUFBWixLQUF5QixXQUF6QixHQUF1QyxLQUF2QyxHQUErQyxJQUFJLENBQUMsUUFBcEUsQ0E5QmEsQ0ErQmI7O0FBQ0EsU0FBSyxVQUFMLEdBQWtCLE9BQU8sSUFBSSxDQUFDLFVBQVosS0FBMkIsV0FBM0IsR0FBeUMsS0FBekMsR0FBaUQsSUFBSSxDQUFDLFVBQXhFLENBaENhLENBaUNiOztBQUNBLFNBQUssY0FBTCxHQUFzQixPQUFPLElBQUksQ0FBQyxjQUFaLEtBQStCLFdBQS9CLEdBQTZDLElBQTdDLEdBQW9ELElBQUksQ0FBQyxjQUEvRSxDQWxDYSxDQW1DYjs7QUFDQSxTQUFLLFlBQUwsR0FBb0IsT0FBTyxJQUFJLENBQUMsWUFBWixLQUE2QixXQUE3QixHQUEyQyxLQUEzQyxHQUFtRCxJQUFJLENBQUMsWUFBNUUsQ0FwQ2EsQ0FzQ2I7O0FBQ0EsU0FBSyxhQUFMLEdBQXFCLE9BQU8sSUFBSSxDQUFDLGFBQVosS0FBOEIsV0FBOUIsR0FBNEMsRUFBNUMsR0FBaUQsSUFBSSxDQUFDLGFBQTNFO0FBRUEsU0FBSyxlQUFMLEdBQXVCLEVBQXZCLENBekNhLENBMENiOztBQUNBLFFBQUcsS0FBSyxRQUFMLElBQWlCLEVBQXBCLEVBQXdCLEtBQUssU0FBTCxHQUFpQixJQUFqQixDQTNDWCxDQTZDYjs7QUFDQSxTQUFLLFlBQUwsR0FBb0IsRUFBcEI7QUFDQSxTQUFLLE1BQUwsR0FBYyxFQUFkO0FBQ0EsU0FBSyxpQkFBTCxHQUF5QixFQUF6QjtBQUVBLFNBQUssSUFBTDtBQUNBLFNBQUssZ0JBQUwsR0FuRGEsQ0FxRGI7O0FBQ0EsU0FBSyxjQUFMLEdBQXNCLElBQUksOEJBQUosQ0FBbUIsSUFBbkIsQ0FBdEI7QUFDQSxTQUFLLGlCQUFMLEdBQXlCLElBQUksb0NBQUosRUFBekI7QUFDQSxTQUFLLGNBQUwsR0FBc0IsSUFBSSw4QkFBSixDQUFtQixJQUFuQixDQUF0QixDQXhEYSxDQTBEYjs7QUFDQSxJQUFBLENBQUMsQ0FBQyxJQUFGLENBQU8sS0FBSyxHQUFMLENBQVMsWUFBVCxFQUFQLEVBQWdDLElBQWhDLENBQXFDLFVBQUMsVUFBRCxFQUFjO0FBQy9DO0FBQ0EsVUFBSSxnQkFBZ0IsR0FBRyxLQUFJLENBQUMsR0FBTCxDQUFTLHFCQUFULENBQStCLFVBQS9CLEVBQTJDLEtBQUksQ0FBQyxhQUFoRCxDQUF2Qjs7QUFDQSxNQUFBLEtBQUksQ0FBQyxpQkFBTCxDQUF1QixxQkFBdkIsQ0FBNkMsZ0JBQTdDOztBQUNBLE1BQUEsS0FBSSxDQUFDLGVBQUwsR0FBdUIsZ0JBQXZCO0FBQ0gsS0FMRCxFQTNEYSxDQWtFYjs7QUFDQSxRQUFHLEtBQUssUUFBTCxJQUFpQixFQUFwQixFQUF1QjtBQUNuQixXQUFLLE1BQUwsR0FBYyxJQUFJLGdDQUFKLENBQW9CLElBQXBCLENBQWQ7QUFDQSxXQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLEtBQUssU0FBNUIsRUFGbUIsQ0FJbkI7O0FBQ0EsV0FBSyxNQUFMLENBQVksZ0JBQVosQ0FBNkIsVUFBN0IsRUFBeUMsS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixVQUFsRSxFQUNDLElBREQsQ0FDTSxVQUFDLElBQUQsRUFBUTtBQUNWLFlBQUksZUFBZSxPQUFPLElBQUksQ0FBQyxLQUEvQixFQUF1QztBQUFHO0FBQ3RDO0FBQ0EsZUFBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTCxHQUFZLENBQXpCLEVBQTRCLENBQUMsSUFBSSxDQUFqQyxFQUFvQyxDQUFDLEVBQXJDLEVBQXlDO0FBQ3JDLGdCQUFHLElBQUksQ0FBQyxDQUFELENBQUosQ0FBUSxJQUFSLElBQWdCLFlBQW5CLEVBQWdDO0FBQzVCLGtCQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsQ0FBRCxDQUExQjtBQUNBLGNBQUEsS0FBSSxDQUFDLFlBQUwsR0FBb0IsZUFBZSxDQUFDLGVBQUQsQ0FBbkM7QUFDQSxjQUFBLEtBQUksQ0FBQyxNQUFMLEdBQWMsZUFBZSxDQUFDLFNBQUQsQ0FBN0I7QUFDQSxjQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksZUFBZSxDQUFDLGVBQUQsQ0FBM0I7QUFDQSxjQUFBLElBQUksQ0FBQyxNQUFMLENBQVksQ0FBWixFQUFjLENBQWQ7QUFDSCxhQU5ELE1BTU87QUFDSCxtQkFBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBRCxDQUFKLENBQVEsTUFBUixDQUFlLFFBQWYsQ0FBd0IsTUFBNUMsRUFBb0QsQ0FBQyxFQUFyRCxFQUF5RDtBQUNyRCxvQkFBSSxzQkFBc0IsSUFBSSxDQUFDLENBQUQsQ0FBSixDQUFRLE1BQVIsQ0FBZSxRQUFmLENBQXdCLENBQXhCLEVBQTJCLElBQXJELEVBQTJEO0FBQzNELGdCQUFBLElBQUksQ0FBQyxDQUFELENBQUosQ0FBUSxNQUFSLENBQWUsUUFBZixDQUF3QixDQUF4QixFQUEyQixLQUEzQixHQUFtQyxJQUFJLENBQUMsQ0FBRCxDQUFKLENBQVEsTUFBUixDQUFlLFFBQWYsQ0FBd0IsQ0FBeEIsRUFBMkIsS0FBM0IsQ0FBaUMsT0FBakMsQ0FBeUMsU0FBekMsRUFBbUQsSUFBbkQsQ0FBbkM7QUFDSDtBQUNKO0FBQ0o7QUFDSixTQWhCRCxNQWdCTztBQUFHO0FBQ04sVUFBQSxLQUFJLENBQUMsWUFBTCxHQUFvQixJQUFJLENBQUMsS0FBTCxDQUFXLEVBQVgsQ0FBYyxDQUFkLENBQXBCO0FBQ0EsVUFBQSxLQUFJLENBQUMsTUFBTCxHQUFjLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxFQUFjLE9BQWQsQ0FBc0IsRUFBcEM7QUFDQSxVQUFBLEtBQUksQ0FBQyxpQkFBTCxHQUF5QixJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsRUFBYyxLQUFkLENBQW9CLENBQXBCLEVBQXVCLEtBQXZCLENBQTZCLENBQTdCLEVBQWdDLEVBQXpEO0FBQ0g7O0FBRUQsUUFBQSxLQUFJLENBQUMsaUJBQUwsQ0FBdUIsZ0JBQXZCLENBQXdDLElBQXhDOztBQUNBLFFBQUEsS0FBSSxDQUFDLGlCQUFMO0FBQ0gsT0ExQkQsRUFMbUIsQ0FpQ25COztBQUNBLFVBQUcsQ0FBQyxLQUFLLFNBQVQsRUFBbUI7QUFDZixZQUFHLEtBQUssTUFBTCxJQUFlLEtBQUssUUFBcEIsSUFBZ0MsS0FBSyxXQUF4QyxFQUFvRDtBQUNoRCxlQUFLLE1BQUwsQ0FBWSxNQUFaO0FBQ0EsZUFBSyxNQUFMLENBQVksS0FBWixDQUFrQixLQUFLLFdBQXZCLEVBQW9DLElBQUksQ0FBQyxLQUFLLFFBQU4sQ0FBeEMsRUFBeUQsSUFBekQsQ0FBOEQsWUFBTTtBQUNoRSxZQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksMEJBQVo7QUFDSCxXQUZELEVBRUcsSUFGSCxDQUVRLFlBQU07QUFDVixZQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVkseUJBQVo7QUFDSCxXQUpEO0FBS0g7QUFDSjtBQUVKLEtBN0NELE1BNkNPO0FBQ0gsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLCtCQUErQixLQUFLLFFBQWhEO0FBQ0EsTUFBQSxDQUFDLENBQUMsSUFBRixDQUFPO0FBQ0gsUUFBQSxHQUFHLEVBQUUsS0FBSyxRQURQO0FBRUgsUUFBQSxJQUFJLEVBQUUsS0FGSDtBQUdILFFBQUEsUUFBUSxFQUFFLE1BSFA7QUFJSCxRQUFBLEtBQUssRUFBRTtBQUpKLE9BQVAsRUFLRyxJQUxILENBS1EsVUFBQyxJQUFELEVBQVU7QUFDZCxRQUFBLE9BQU8sQ0FBQyxHQUFSLG1CQUF1QixJQUFJLENBQUMsTUFBNUI7QUFDQSxZQUFJLElBQUksR0FBRyxJQUFYOztBQUNBLFlBQUksZUFBZSxPQUFPLElBQUksQ0FBQyxLQUEvQixFQUF1QztBQUFHO0FBQ3RDO0FBQ0EsZUFBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTCxHQUFZLENBQXpCLEVBQTRCLENBQUMsSUFBSSxDQUFqQyxFQUFvQyxDQUFDLEVBQXJDLEVBQXlDO0FBQ3JDLGdCQUFHLElBQUksQ0FBQyxDQUFELENBQUosQ0FBUSxJQUFSLElBQWdCLFlBQW5CLEVBQWdDO0FBQzVCLGtCQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsQ0FBRCxDQUExQjtBQUNBLGNBQUEsS0FBSSxDQUFDLFlBQUwsR0FBb0IsZUFBZSxDQUFDLGVBQUQsQ0FBbkM7QUFDQSxjQUFBLEtBQUksQ0FBQyxNQUFMLEdBQWMsZUFBZSxDQUFDLFNBQUQsQ0FBN0I7QUFDQSxjQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksZUFBZSxDQUFDLGVBQUQsQ0FBM0I7QUFDQSxjQUFBLElBQUksQ0FBQyxNQUFMLENBQVksQ0FBWixFQUFjLENBQWQ7QUFDSCxhQU5ELE1BTU87QUFDSCxtQkFBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBRCxDQUFKLENBQVEsTUFBUixDQUFlLFFBQWYsQ0FBd0IsTUFBNUMsRUFBb0QsQ0FBQyxFQUFyRCxFQUF5RDtBQUNyRCxvQkFBSSxzQkFBc0IsSUFBSSxDQUFDLENBQUQsQ0FBSixDQUFRLE1BQVIsQ0FBZSxRQUFmLENBQXdCLENBQXhCLEVBQTJCLElBQXJELEVBQTJEO0FBQzNELGdCQUFBLElBQUksQ0FBQyxDQUFELENBQUosQ0FBUSxNQUFSLENBQWUsUUFBZixDQUF3QixDQUF4QixFQUEyQixLQUEzQixHQUFtQyxJQUFJLENBQUMsQ0FBRCxDQUFKLENBQVEsTUFBUixDQUFlLFFBQWYsQ0FBd0IsQ0FBeEIsRUFBMkIsS0FBM0IsQ0FBaUMsT0FBakMsQ0FBeUMsU0FBekMsRUFBbUQsSUFBbkQsQ0FBbkM7QUFDSDtBQUNKO0FBQ0o7QUFDSixTQWhCRCxNQWdCTztBQUFHO0FBQ04sVUFBQSxLQUFJLENBQUMsWUFBTCxHQUFvQixJQUFJLENBQUMsS0FBTCxDQUFXLEVBQVgsQ0FBYyxDQUFkLENBQXBCO0FBQ0EsVUFBQSxLQUFJLENBQUMsTUFBTCxHQUFjLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxFQUFjLE9BQWQsQ0FBc0IsRUFBcEM7QUFDSDs7QUFDRCxRQUFBLEtBQUksQ0FBQyxpQkFBTCxDQUF1QixnQkFBdkIsQ0FBd0MsSUFBeEM7O0FBQ0EsUUFBQSxLQUFJLENBQUMsaUJBQUw7QUFDSCxPQTlCRCxFQThCRyxJQTlCSCxDQThCUSxVQUFDLFFBQUQsRUFBYztBQUNsQixRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksUUFBWjtBQUNBLFFBQUEsT0FBTyxDQUFDLEtBQVIsMERBQStELFFBQVEsQ0FBQyxZQUFULENBQXNCLE1BQXJGOztBQUNBLFFBQUEsS0FBSSxDQUFDLFNBQUwsQ0FBZSxjQUFmLENBQThCLFNBQTlCLCtDQUErRSxRQUFRLENBQUMsWUFBVCxDQUFzQixNQUFyRztBQUNILE9BbENEO0FBbUNIOztBQUVELFNBQUssTUFBTCxDQUFZLFVBQVosQ0FBdUIsRUFBdkIsQ0FBMEIsY0FBMUIsRUFBMEMsVUFBQyxLQUFELEVBQVEsSUFBUixFQUFpQjtBQUN2RCxNQUFBLEtBQUksQ0FBQyxZQUFMLENBQWtCLElBQWxCO0FBQ0gsS0FGRDtBQUlBLFNBQUssVUFBTCxDQUFnQixFQUFoQixDQUFtQixlQUFuQixFQUFvQyxVQUFDLEtBQUQsRUFBUSxVQUFSLEVBQXVCO0FBQ3ZEO0FBQ0EsVUFBRyxDQUFDLEtBQUksQ0FBQyxHQUFMLENBQVMsSUFBYixFQUFrQjtBQUNkLFFBQUEsS0FBSSxDQUFDLG9CQUFMLENBQTBCLE1BQTFCLENBQWlDLFNBQWpDOztBQUNBLFFBQUEsS0FBSSxDQUFDLEdBQUwsQ0FBUyxZQUFULENBQXNCLFVBQXRCO0FBQ0g7QUFDSixLQU5EO0FBUUEsU0FBSyxVQUFMLENBQWdCLEVBQWhCLENBQW1CLGtCQUFuQixFQUF1QyxVQUFDLEtBQUQsRUFBUSxVQUFSLEVBQXVCO0FBQzFELE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxpQ0FBWjtBQUNILEtBRkQ7QUFJQSxTQUFLLFVBQUwsQ0FBZ0IsRUFBaEIsQ0FBbUIsb0JBQW5CLEVBQXlDLFVBQUMsS0FBRCxFQUFRLFVBQVIsRUFBdUI7QUFDNUQsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLG1DQUFaO0FBQ0gsS0FGRDtBQUlBLFNBQUssR0FBTCxDQUFTLFVBQVQsQ0FBb0IsRUFBcEIsQ0FBdUIsYUFBdkIsRUFBc0MsVUFBQyxLQUFELEVBQVc7QUFDN0MsTUFBQSxLQUFJLENBQUMsb0JBQUwsQ0FBMEIsTUFBMUIsQ0FBaUMsUUFBakM7QUFDSCxLQUZEO0FBSUEsU0FBSyxHQUFMLEdBQVcsS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixVQUFwQztBQUVBLElBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSwrQ0FBWjtBQUNIOzs7O2lDQUdZO0FBQ1QsVUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLDBCQUFELENBQXRCOztBQUNBLFdBQUssTUFBTCxHQUFjLE1BQU0sQ0FBQyxPQUFyQjtBQUNIO0FBQ0Q7Ozs7OzsyQkFHTTtBQUNGO0FBQ0EsVUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDLEtBQUssTUFBTCxDQUFZLFVBQWIsQ0FBRCxDQUEwQixNQUExQixFQUFyQjtBQUNBLFVBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLHVDQUFELENBQXhCO0FBQ0EsTUFBQSxnQkFBZ0IsQ0FBQyxZQUFqQixDQUE4QixDQUFDLENBQUMsS0FBSyxNQUFMLENBQVksVUFBYixDQUEvQjtBQUNBLE1BQUEsZ0JBQWdCLENBQUMsTUFBakIsQ0FBd0IsS0FBSyxNQUFMLENBQVksVUFBcEM7QUFDQSxXQUFLLFVBQUwsR0FBa0IsY0FBYyxDQUFDLE1BQWYsRUFBbEIsQ0FORSxDQVFGOztBQUNBLFdBQUssVUFBTCxDQUFnQixLQUFoQixDQUFzQixLQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLEtBQXZCLEVBQXRCLEVBVEUsQ0FXRjtBQUNBO0FBQ0E7QUFFQTtBQUNBOztBQUNBLFdBQUssVUFBTCxDQUFnQixHQUFoQixDQUFvQixLQUFLLE1BQUwsQ0FBWSxjQUFoQztBQUNIOzs7dUNBRWlCO0FBQUE7O0FBQ2Q7QUFDQSxXQUFLLE9BQUwsR0FBZSxJQUFJLGdCQUFKLENBQVksSUFBWixDQUFmLENBRmMsQ0FJZDs7QUFDQSxXQUFLLFdBQUwsR0FBbUIsSUFBSSw4QkFBSixDQUFtQixJQUFuQixDQUFuQjs7QUFFQSxVQUFHLENBQUMsS0FBSyxTQUFOLElBQW1CLEtBQUssWUFBM0IsRUFBd0M7QUFDcEMsYUFBSyxjQUFMLEdBQXNCLENBQUMsQ0FBQyw0Q0FBRCxDQUFELENBQWdELFFBQWhELENBQXlELEtBQUssVUFBOUQsQ0FBdEI7QUFDQSxZQUFJLHlCQUF5QixHQUFHLEtBQUssY0FBTCxDQUFvQixNQUFwQixDQUEyQix5REFBM0IsQ0FBaEM7QUFDQSxRQUFBLHlCQUF5QixDQUFDLEtBQTFCLENBQWdDLFlBQU07QUFDbEMsY0FBSSxHQUFHLEdBQUcsTUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaLENBQXlCLFVBQW5DOztBQUNBLFVBQUEsTUFBSSxDQUFDLE1BQUwsQ0FBWSxnQkFBWixDQUE2QixVQUE3QixFQUF5QyxHQUF6QyxFQUE4QyxJQUE5QyxDQUFtRCxVQUFDLElBQUQsRUFBVTtBQUN6RCxnQkFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQVAsRUFBVjs7QUFDQSxnQkFBRyxHQUFHLEtBQUssSUFBWCxFQUFpQjtBQUNiLGNBQUEsT0FBTyxDQUFDLEtBQVIsQ0FBYywwREFBZDs7QUFDQSxjQUFBLE1BQUksQ0FBQyxjQUFMLENBQW9CLFNBQXBCLENBQThCLDBEQUE5QjtBQUNILGFBSEQsTUFJSztBQUNELGNBQUEsR0FBRyxDQUFDLFFBQUosQ0FBYSxJQUFiO0FBQ0EsY0FBQSxHQUFHLENBQUMsUUFBSixDQUFhLEtBQWIsMENBQXFELEdBQXJEO0FBQ0EsY0FBQSxHQUFHLENBQUMsUUFBSixDQUFhLEtBQWIsQ0FBbUIsT0FBbkI7QUFDQSxjQUFBLEdBQUcsQ0FBQyxRQUFKLENBQWEsS0FBYixDQUFtQixJQUFJLENBQUMsU0FBTCxDQUFlLElBQWYsRUFBcUIsSUFBckIsRUFBMkIsQ0FBM0IsRUFBOEIsVUFBOUIsRUFBbkI7QUFFQSxjQUFBLEdBQUcsQ0FBQyxRQUFKLENBQWEsS0FBYixDQUFtQixRQUFuQjtBQUNBLGNBQUEsR0FBRyxDQUFDLFFBQUosQ0FBYSxLQUFiO0FBQ0g7QUFDSixXQWZEO0FBaUJILFNBbkJEO0FBb0JILE9BOUJhLENBZ0NkO0FBQ0E7QUFDQTtBQUNBO0FBRUE7OztBQUNBLFdBQUssYUFBTCxHQUFxQixJQUFJLDRCQUFKLENBQWtCLElBQWxCLENBQXJCO0FBRUEsVUFBRyxLQUFLLFlBQVIsRUFBc0IsS0FBSyxjQUFMLEdBQXNCLElBQUksOEJBQUosQ0FBbUIsSUFBbkIsQ0FBdEIsQ0F4Q1IsQ0EwQ2Q7O0FBQ0EsVUFBRyxDQUFDLEtBQUssU0FBVCxFQUFtQjtBQUNmLGFBQUssb0JBQUwsR0FBNEIsQ0FBQyxDQUFDLHFDQUFELENBQUQsQ0FBeUMsTUFBekMsQ0FBZ0Q7QUFDeEUsVUFBQSxJQUFJLEVBQUUsWUFEa0U7QUFFeEUsVUFBQSxTQUFTLEVBQUU7QUFGNkQsU0FBaEQsRUFHekIsS0FIeUIsQ0FHbkIsWUFBTTtBQUNYLFVBQUEsTUFBSSxDQUFDLG9CQUFMLENBQTBCLE1BQTFCLENBQWlDLFNBQWpDOztBQUNBLFVBQUEsTUFBSSxDQUFDLEdBQUwsQ0FBUyxZQUFUO0FBQ0gsU0FOMkIsQ0FBNUI7QUFPQSxhQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLGVBQXZCLENBQXVDLEtBQUssb0JBQTVDLEVBQWtFLENBQWxFLEVBQXFFLFVBQXJFLEVBUmUsQ0FVZjs7QUFDQSxhQUFLLHVCQUFMLEdBQStCLENBQUMsQ0FBQywwREFBRCxDQUFELENBQThELE1BQTlELENBQXFFO0FBQ2hHLFVBQUEsSUFBSSxFQUFFLGNBRDBGO0FBRWhHLFVBQUEsU0FBUyxFQUFFO0FBRnFGLFNBQXJFLEVBRzVCLEtBSDRCLENBR3RCLFlBQU07QUFDWCxVQUFBLE1BQUksQ0FBQyxZQUFMO0FBQ0gsU0FMOEIsQ0FBL0I7QUFNQSxhQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLGVBQXZCLENBQXVDLEtBQUssdUJBQTVDLEVBQXFFLENBQXJFLEVBQXdFLFVBQXhFO0FBQ0g7O0FBQ0QsV0FBSyxHQUFMLEdBQVcsSUFBSSw0QkFBSixDQUFrQixJQUFsQixDQUFYO0FBRUg7Ozt3Q0FFa0I7QUFDZjtBQUNBLFdBQUssVUFBTCxDQUFnQixPQUFoQixDQUF3QixxQkFBeEIsRUFBK0MsS0FBSyxpQkFBcEQ7QUFDSDs7O2lDQUVZLEksRUFBSztBQUNkLFdBQUssY0FBTCxHQUFzQixLQUFLLGlCQUFMLENBQXVCLGlCQUF2QixDQUF5QyxJQUF6QyxDQUF0Qjs7QUFFQSxVQUFHLEtBQUssY0FBTCxDQUFvQixNQUFwQixDQUEyQixLQUFLLGlCQUFoQyxDQUFILEVBQXNEO0FBQ2xELGFBQUsseUJBQUwsQ0FBK0IsSUFBL0I7QUFDQTtBQUNIOztBQUNELFdBQUssaUJBQUwsR0FBeUIsS0FBSyxjQUE5QjtBQUVBLFdBQUssV0FBTDtBQUNIOzs7OENBRXlCLEksRUFBSztBQUMzQjtBQUNBO0FBQ0EsVUFBSSxLQUFLLFFBQUwsTUFBbUIsS0FBSyxjQUFMLENBQW9CLE1BQXBCLEdBQTZCLENBQXBELEVBQXVEO0FBQ25ELFlBQUksR0FBRyxHQUFHLGtEQUFWO0FBQ0EsUUFBQSxHQUFHLElBQUksNERBQVA7QUFDQSxRQUFBLEdBQUcsSUFBSSxvQ0FBUDtBQUNBLGFBQUssY0FBTCxDQUFvQixXQUFwQixDQUFnQyxHQUFoQyxFQUFxQyxHQUFyQztBQUNBLGVBTG1ELENBSzNDO0FBQ1g7O0FBRUQsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxLQUFLLGNBQUwsQ0FBb0IsTUFBeEMsRUFBZ0QsQ0FBQyxFQUFqRCxFQUFzRDtBQUNsRCxZQUFJLGFBQWEsR0FBRyxLQUFLLGNBQUwsQ0FBb0IsQ0FBcEIsRUFBdUIsRUFBM0M7O0FBQ0EsWUFBSSxLQUFLLFdBQUwsQ0FBaUIsZUFBakIsQ0FBaUMsYUFBakMsQ0FBSixFQUFxRDtBQUNqRCxlQUFLLFdBQUwsQ0FBaUIsZUFBakIsQ0FBaUMsYUFBakMsRUFBZ0QsT0FBaEQsQ0FBd0QsWUFBeEQ7QUFDQSxjQUFJLFNBQVMsR0FBRyxJQUFJLEdBQUcsS0FBSyxjQUFMLENBQW9CLENBQXBCLEVBQXVCLFNBQTlDO0FBQ0EsY0FBSSxZQUFZLEdBQUcsS0FBSyxXQUFMLENBQWlCLGVBQWpCLENBQWlDLGFBQWpDLEVBQWdELFVBQWhELENBQTJELGNBQTNELEVBQW5CLENBSGlELENBSWpEOztBQUNBLGVBQUssV0FBTCxDQUFpQixlQUFqQixDQUFpQyxhQUFqQyxFQUFnRCxVQUFoRCxDQUEyRCxjQUEzRCxDQUEwRSxZQUFZLEdBQUcsU0FBekY7QUFDQSxlQUFLLFdBQUwsQ0FBaUIsZUFBakIsQ0FBaUMsYUFBakMsRUFBZ0QsT0FBaEQsQ0FBd0QsVUFBeEQ7QUFDSDtBQUNKO0FBRUo7OztrQ0FFWTtBQUNUO0FBQ0EsV0FBSyxjQUFMLEdBQXNCLEtBQUssaUJBQUwsQ0FBdUIsaUJBQXZCLENBQXlDLEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsV0FBbEUsQ0FBdEIsQ0FGUyxDQUlUOztBQUNBLFdBQUssYUFBTCxDQUFtQixPQUFuQixDQUEyQixLQUFLLGNBQWhDLEVBQWdELEtBQUssY0FBckQ7QUFFQSxXQUFLLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FBd0Isb0JBQXhCLEVBQThDLENBQUMsS0FBSyxjQUFOLENBQTlDO0FBQ0EsV0FBSyx5QkFBTCxDQUErQixLQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLFdBQXhEO0FBQ0g7OztxQ0FFZTtBQUNaLFVBQUksT0FBTyxHQUFHLEtBQUssaUJBQUwsQ0FBdUIsV0FBdkIsQ0FBbUMsS0FBbkMsRUFBZDs7QUFDQSxVQUFJLFlBQVksR0FBRyxTQUFmLFlBQWUsQ0FBUyxDQUFULEVBQVksQ0FBWixFQUFjO0FBQzdCLFlBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxTQUFkO0FBQ0EsWUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLFNBQWQ7QUFDQSxlQUFTLEtBQUssR0FBRyxLQUFULEdBQWtCLENBQUMsQ0FBbkIsR0FBeUIsS0FBSyxHQUFHLEtBQVQsR0FBa0IsQ0FBbEIsR0FBc0IsQ0FBdEQ7QUFDSCxPQUpEOztBQUtBLE1BQUEsT0FBTyxDQUFDLElBQVIsQ0FBYSxZQUFiO0FBQ0EsYUFBTyxPQUFQO0FBQ0g7OzswQ0FFcUIsVSxFQUFXO0FBQzdCO0FBQ0E7QUFDQSxXQUFLLGlCQUFMLENBQXVCLGdCQUF2QixDQUF3QyxVQUF4QyxFQUg2QixDQUs3Qjs7QUFDQSxXQUFLLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FBd0Isd0JBQXhCLEVBQWtELENBQUMsVUFBRCxDQUFsRCxFQU42QixDQVE3Qjs7QUFDQSxXQUFLLFdBQUw7QUFDSDs7O3FDQUVnQixVLEVBQVksSyxFQUFNO0FBQy9CLFdBQUssaUJBQUwsQ0FBdUIsZ0JBQXZCLENBQXdDLFVBQXhDLEVBQW9ELEtBQXBELEVBRCtCLENBRy9COztBQUNBLFdBQUssVUFBTCxDQUFnQixPQUFoQixDQUF3QixxQkFBeEIsRUFBK0MsQ0FBQyxLQUFELENBQS9DO0FBQ0EsV0FBSyxVQUFMLENBQWdCLE9BQWhCLENBQXdCLHdCQUF4QixFQUFrRCxDQUFDLFVBQUQsQ0FBbEQsRUFMK0IsQ0FPL0I7O0FBQ0EsV0FBSyxXQUFMO0FBQ0g7Ozt5Q0FFb0IsVSxFQUFXO0FBQzVCLFVBQUksRUFBRSxHQUFHLEVBQVQ7O0FBQ0EsVUFBSSxlQUFlLE9BQU8sVUFBVSxDQUFDLEtBQXJDLEVBQTZDO0FBQUU7QUFDM0MsUUFBQSxFQUFFLEdBQUcsVUFBVSxDQUFDLEVBQWhCO0FBQ0gsT0FGRCxNQUVPO0FBQUU7QUFDTCxRQUFBLEVBQUUsR0FBRyxVQUFVLENBQUMsS0FBWCxDQUFpQixDQUFqQixFQUFvQixLQUFwQixDQUEwQixDQUExQixFQUE2QixLQUE3QixDQUFtQyxDQUFuQyxFQUFzQyxFQUEzQztBQUNIOztBQUVELFdBQUssaUJBQUwsQ0FBdUIsZ0JBQXZCLENBQXdDLEVBQXhDLEVBUjRCLENBUzVCO0FBRUE7O0FBQ0EsV0FBSyxVQUFMLENBQWdCLE9BQWhCLENBQXdCLHFCQUF4QixFQUErQyxDQUFDLEVBQUQsQ0FBL0MsRUFaNEIsQ0FjNUI7O0FBQ0EsV0FBSyxXQUFMO0FBRUg7OzttQ0FFYztBQUFBOztBQUNYO0FBQ0EsVUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLHFFQUFELENBQWxCLENBRlcsQ0FFZ0Y7O0FBQzNGLFVBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxrRkFBRCxDQUFELENBQXNGLFFBQXRGLENBQStGLFVBQS9GLENBQWhCO0FBQ0EsVUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLCtDQUFELENBQUQsQ0FBbUQsUUFBbkQsQ0FBNEQsVUFBNUQsQ0FBakI7QUFDQSxNQUFBLFVBQVUsQ0FBQyxJQUFYO0FBQ0EsVUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLGVBQUQsQ0FBRCxDQUFtQixRQUFuQixDQUE0QixVQUE1QixDQUFaO0FBRUEsVUFBSSxZQUFKO0FBRUEsTUFBQSxDQUFDLENBQUMsNkNBQUQsQ0FBRCxDQUFpRCxRQUFqRCxDQUEwRCxLQUExRDtBQUNBLE1BQUEsWUFBWSxHQUFHLENBQUMsQ0FBQyxvRkFBRCxDQUFELENBQXdGLFFBQXhGLENBQWlHLEtBQWpHLENBQWY7QUFFQSxNQUFBLEtBQUssQ0FBQyxTQUFOLENBQWdCLGNBQWhCOztBQUVBLFVBQUksS0FBSyxHQUFHLFNBQVIsS0FBUSxDQUFDLE9BQUQsRUFBYTtBQUNyQixRQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsT0FBZDtBQUNBLFFBQUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsT0FBaEI7QUFDQSxRQUFBLFVBQVUsQ0FBQyxJQUFYO0FBQ0gsT0FKRDs7QUFNQSxVQUFJLElBQUksR0FBRyxJQUFYO0FBQ0EsTUFBQSxZQUFZLENBQUMsRUFBYixDQUFnQixRQUFoQixFQUEwQixZQUFNO0FBQzVCLFlBQUksS0FBSyxHQUFHLFlBQVksQ0FBQyxHQUFiLENBQWlCLENBQWpCLEVBQW9CLEtBQWhDO0FBQ0EsWUFBSSxFQUFFLEdBQUcsSUFBSSxVQUFKLEVBQVQ7O0FBRUEsUUFBQSxFQUFFLENBQUMsTUFBSCxHQUFhLFVBQUMsU0FBRCxFQUFlO0FBQ3hCO0FBQ0EsY0FBSTtBQUNBLFlBQUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxTQUFTLENBQUMsTUFBVixDQUFpQixNQUE1QjtBQUNILFdBRkQsQ0FHQSxPQUFPLENBQVAsRUFBVTtBQUNOLFlBQUEsS0FBSyxDQUFDLHlCQUFELENBQUw7QUFDQTtBQUNIOztBQUVELGNBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFMLENBQVcsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsTUFBNUIsQ0FBaEI7O0FBQ0EsY0FBRyxPQUFPLFNBQVMsQ0FBQyxNQUFqQixJQUEwQixXQUE3QixFQUF5QztBQUNyQyxnQkFBSSxVQUFVLEdBQUcsSUFBSSx1QkFBSixDQUFlLFNBQWYsQ0FBakI7O0FBQ0EsZ0JBQUcsTUFBSSxDQUFDLGtCQUFMLENBQXdCLFVBQXhCLENBQUgsRUFBdUM7QUFDbkM7QUFDQSxjQUFBLE1BQUksQ0FBQyxHQUFMLENBQVMsWUFBVCxDQUFzQixVQUF0QixFQUFrQyxJQUFsQzs7QUFDQSxjQUFBLE1BQUksQ0FBQyxHQUFMLENBQVMsd0JBQVQsQ0FBa0MsWUFBVTtBQUFDO0FBQVEsZUFBckQ7QUFDSCxhQUpELE1BS0s7QUFDRCxjQUFBLEtBQUssQ0FBQyxrQkFBRCxDQUFMO0FBQ0g7QUFDSixXQVZELE1BVU87QUFDSCxpQkFBSSxJQUFJLENBQUMsR0FBQyxDQUFWLEVBQWEsQ0FBQyxHQUFDLFNBQVMsQ0FBQyxNQUF6QixFQUFpQyxDQUFDLEVBQWxDLEVBQXFDO0FBQ2pDLGtCQUFJLFdBQVUsR0FBRyxJQUFJLHVCQUFKLENBQWUsU0FBUyxDQUFDLENBQUQsQ0FBeEIsQ0FBakI7O0FBQ0Esa0JBQUcsTUFBSSxDQUFDLGtCQUFMLENBQXdCLFdBQXhCLENBQUgsRUFBdUM7QUFDbkM7QUFDQSxnQkFBQSxNQUFJLENBQUMsR0FBTCxDQUFTLFlBQVQsQ0FBc0IsV0FBdEIsRUFBa0MsSUFBbEM7O0FBQ0EsZ0JBQUEsTUFBSSxDQUFDLEdBQUwsQ0FBUyx3QkFBVCxDQUFrQyxVQUFDLFVBQUQsRUFBZ0I7QUFDOUMsa0JBQUEsTUFBSSxDQUFDLHFCQUFMLENBQTJCLFVBQTNCOztBQUNBLGtCQUFBLE1BQUksQ0FBQyxHQUFMLENBQVMsS0FBVDtBQUNILGlCQUhEO0FBSUgsZUFQRCxNQVFLO0FBQ0QsZ0JBQUEsS0FBSyxDQUFDLGtCQUFELENBQUw7QUFDSDtBQUNKO0FBQ0o7O0FBQ0QsVUFBQSxPQUFPLENBQUMsTUFBUixDQUFlLE9BQWY7QUFDSCxTQXRDRDs7QUF1Q0EsUUFBQSxFQUFFLENBQUMsVUFBSCxDQUFjLEtBQUssQ0FBQyxDQUFELENBQW5CO0FBQ0gsT0E1Q0Q7QUE4Q0EsVUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLE1BQVgsQ0FBa0I7QUFDNUIsUUFBQSxRQUFRLEVBQUUsSUFEa0I7QUFFNUIsUUFBQSxTQUFTLEVBQUUsS0FGaUI7QUFHNUIsUUFBQSxLQUFLLEVBQUUsSUFIcUI7QUFJNUIsUUFBQSxPQUFPLEVBQUU7QUFDTCxVQUFBLE1BQU0sRUFBRSxrQkFBTTtBQUNWLFlBQUEsT0FBTyxDQUFDLE1BQVIsQ0FBZSxPQUFmO0FBQ0g7QUFISSxTQUptQjtBQVM1QixRQUFBLEtBQUssRUFBRSxpQkFBTTtBQUNULFVBQUEsT0FBTyxDQUFDLElBQVIsQ0FBYSxNQUFiLEVBQXNCLENBQXRCLEVBQTBCLEtBQTFCO0FBQ0EsVUFBQSxPQUFPLENBQUMsSUFBUixDQUFhLE9BQWIsRUFBc0IsV0FBdEIsQ0FBbUMsZ0JBQW5DLEVBRlMsQ0FHVDtBQUNIO0FBYjJCLE9BQWxCLENBQWQ7QUFlSDs7O3VDQUVrQixVLEVBQVk7QUFDM0I7QUFDQTtBQUVBLGFBQU8sSUFBUDtBQUNILEssQ0FFRDs7OzsrQkFDVztBQUNQO0FBQ0EsVUFBSSxRQUFRLEdBQUcsaUNBQWlDLElBQWpDLENBQXNDLFNBQVMsQ0FBQyxTQUFoRCxDQUFmO0FBQ0EsYUFBTyxRQUFQO0FBQ0g7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzZUw7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0lBRU0sYTtBQUVGLHlCQUFZLFNBQVosRUFBc0I7QUFBQTs7QUFBQTs7QUFDbEIsU0FBSyxTQUFMLEdBQWlCLFNBQWpCO0FBRUEsU0FBSyxNQUFMO0FBRUEsU0FBSyxJQUFMLEdBQVksS0FBWixDQUxrQixDQU9sQjs7QUFDQSxTQUFLLFNBQUwsR0FBaUIsS0FBakI7QUFDQSxTQUFLLFVBQUwsQ0FBZ0IsV0FBaEIsQ0FBNEIsS0FBNUI7QUFFQSxTQUFLLFVBQUwsR0FBa0IsSUFBSSw0QkFBSixDQUFrQixLQUFLLFNBQXZCLENBQWxCO0FBRUEsU0FBSyxTQUFMLENBQWUsVUFBZixDQUEwQixFQUExQixDQUE2Qix1QkFBN0IsRUFBc0QsWUFBTTtBQUN4RCxNQUFBLEtBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCOztBQUNBLE1BQUEsS0FBSSxDQUFDLFVBQUwsQ0FBZ0IsZUFBaEI7QUFDSCxLQUhEO0FBS0g7Ozs7NkJBRU87QUFBQTs7QUFDSjs7OztBQUlBLFdBQUssVUFBTCxHQUFrQixDQUFDLENBQUMsMkRBQUQsQ0FBRCxDQUErRCxRQUEvRCxDQUF3RSxLQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLFVBQTlGLENBQWxCO0FBQ0EsV0FBSyxVQUFMLENBQWdCLFNBQWhCO0FBQ0EsV0FBSyxNQUFMLEdBQWMsQ0FBQyxDQUFDLG1EQUFELENBQUQsQ0FBdUQsUUFBdkQsQ0FBZ0UsS0FBSyxVQUFyRSxDQUFkLENBUEksQ0FTSjs7QUFDQSxVQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsMENBQUQsQ0FBRCxDQUE4QyxNQUE5QyxDQUFxRDtBQUNuRSxRQUFBLEtBQUssRUFBRTtBQUFDLFVBQUEsT0FBTyxFQUFFO0FBQVYsU0FENEQ7QUFFbkUsUUFBQSxTQUFTLEVBQUU7QUFGd0QsT0FBckQsQ0FBbEI7QUFJQSxNQUFBLFdBQVcsQ0FBQyxHQUFaLENBQWdCLE9BQWhCLEVBQXlCLE9BQXpCO0FBQ0EsTUFBQSxXQUFXLENBQUMsSUFBWixDQUFpQixPQUFqQixFQUEwQix5QkFBMUI7QUFDQSxNQUFBLFdBQVcsQ0FBQyxRQUFaLENBQXFCLHVCQUFyQjtBQUNBLE1BQUEsV0FBVyxDQUFDLEtBQVosQ0FBa0IsWUFBTTtBQUNwQixRQUFBLE1BQUksQ0FBQyxVQUFMLENBQWdCLGFBQWhCOztBQUNBLFFBQUEsTUFBSSxDQUFDLEtBQUw7QUFDSCxPQUhEO0FBSUEsV0FBSyxlQUFMLENBQXFCLFdBQXJCLEVBQWtDLEtBQUssTUFBdkMsRUFBK0MsQ0FBQyxDQUFoRDtBQUVBLFdBQUssS0FBTCxHQUFhLENBQUMsQ0FBQyx1QkFBRCxDQUFELENBQTJCLFFBQTNCLENBQW9DLEtBQUssVUFBekMsQ0FBYjtBQUdBLFVBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxXQUFELENBQWQ7QUFDQSxVQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsMENBQUQsQ0FBaEI7QUFDQSxVQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsd0NBQUQsQ0FBZjtBQUNBLFVBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyx3Q0FBRCxDQUFmO0FBQ0EsV0FBSyxlQUFMLENBQXFCLE1BQXJCLEVBQTZCLEtBQUssS0FBbEMsRUFBeUMsQ0FBQyxDQUExQztBQUNBLFdBQUssZUFBTCxDQUFxQixRQUFyQixFQUErQixNQUEvQixFQUF1QyxDQUFDLENBQXhDO0FBQ0EsV0FBSyxlQUFMLENBQXFCLE9BQXJCLEVBQThCLE1BQTlCLEVBQXNDLENBQUMsQ0FBdkM7QUFDQSxXQUFLLGVBQUwsQ0FBcUIsT0FBckIsRUFBOEIsTUFBOUIsRUFBc0MsQ0FBQyxDQUF2QztBQUVBLFVBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxrREFDRSxnREFERixHQUVGLFFBRkMsQ0FBakI7QUFHQSxXQUFLLGVBQUwsQ0FBcUIsU0FBckIsRUFBZ0MsS0FBSyxLQUFyQyxFQUE0QyxDQUFDLENBQTdDLEVBdENJLENBd0NKOztBQUNBLFdBQUssZUFBTCxHQUF1QixDQUFDLENBQUMsZ0VBQUQsQ0FBRCxDQUFvRSxRQUFwRSxDQUE2RSxTQUE3RSxDQUF2QjtBQUNBLFdBQUssZUFBTCxDQUFxQixLQUFyQixDQUEyQixFQUEzQjtBQUNBLFdBQUssZUFBTCxDQUFxQixHQUFyQixDQUF5QixhQUF6QixFQUF3QyxvQkFBeEM7QUFDQSxXQUFLLGVBQUwsQ0FBcUIsR0FBckIsQ0FBeUIsY0FBekIsRUFBeUMsS0FBekM7QUFDQSxXQUFLLGVBQUwsQ0FBcUIsUUFBckIsQ0FBOEIsMkNBQTlCO0FBQ0EsV0FBSyxlQUFMLENBQXFCLElBQXJCLENBQTBCLE9BQTFCLEVBQW1DLDBCQUFuQztBQUNBLFdBQUssZUFBTCxDQUFxQixFQUFyQixDQUF3QixVQUF4QixFQUFvQyxVQUFTLEtBQVQsRUFBZTtBQUMvQyxZQUFJLEtBQUssQ0FBQyxPQUFOLElBQWlCLEVBQWpCLElBQXdCLEtBQUssQ0FBQyxPQUFOLElBQWlCLEVBQWpCLElBQXVCLEtBQUssQ0FBQyxPQUFOLElBQWlCLEVBQXBFLEVBQXdFO0FBQUU7QUFDdEUsaUJBQU8sSUFBUDtBQUNIOztBQUNELGVBQU8sS0FBUDtBQUNILE9BTEQsRUEvQ0ksQ0FzREo7O0FBQ0EsV0FBSyxnQkFBTCxHQUF3QixDQUFDLENBQUMsNkRBQUQsQ0FBRCxDQUFpRSxNQUFqRSxDQUF3RTtBQUM1RixRQUFBLElBQUksRUFBRSxrQkFEc0Y7QUFFNUYsUUFBQSxTQUFTLEVBQUU7QUFGaUYsT0FBeEUsRUFHckIsS0FIcUIsQ0FHZixZQUFNO0FBQ1gsUUFBQSxNQUFJLENBQUMsZUFBTCxDQUFxQixDQUFyQixFQUF3QixLQUF4QixHQUFnQyw0QkFBaUIsTUFBSSxDQUFDLFNBQUwsQ0FBZSxNQUFmLENBQXNCLFlBQXRCLENBQW1DLFdBQXBELENBQWhDO0FBQ0gsT0FMdUIsQ0FBeEI7QUFNQSxXQUFLLGVBQUwsQ0FBcUIsS0FBSyxnQkFBMUIsRUFBNEMsU0FBNUMsRUFBdUQsQ0FBQyxDQUF4RCxFQTdESSxDQStESjs7QUFDQSxXQUFLLGdCQUFMLEdBQXdCLENBQUMsQ0FBQyx1RUFBRCxDQUFELENBQTJFLE1BQTNFLENBQWtGO0FBQ3RHLFFBQUEsSUFBSSxFQUFFLHNCQURnRztBQUV0RyxRQUFBLFNBQVMsRUFBRTtBQUYyRixPQUFsRixDQUF4QixDQWhFSSxDQW9FSjs7QUFDQSxXQUFLLGdCQUFMLENBQXNCLEdBQXRCLENBQTBCLFlBQTFCLEVBQXdDLFFBQXhDO0FBQ0EsV0FBSyxnQkFBTCxDQUFzQixRQUF0QixDQUErQix3QkFBL0IsRUF0RUksQ0F3RUo7O0FBRUEsVUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLDJCQUFELENBQWhCO0FBQ0EsV0FBSyxlQUFMLENBQXFCLFFBQXJCLEVBQStCLEtBQUssS0FBcEMsRUFBMkMsQ0FBQyxDQUE1QyxFQTNFSSxDQTZFSjs7QUFDQSxXQUFLLFVBQUwsR0FBa0IsQ0FBQyxDQUFDLDREQUFELENBQW5CO0FBQ0EsV0FBSyxVQUFMLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCO0FBQ0EsV0FBSyxVQUFMLENBQWdCLEdBQWhCLENBQW9CLFlBQXBCLEVBQWtDLE1BQWxDO0FBQ0EsV0FBSyxlQUFMLENBQXFCLEtBQUssVUFBMUIsRUFBc0MsUUFBdEMsRUFBZ0QsQ0FBQyxDQUFqRDtBQUNBLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSwyRUFBWjtBQUNBLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxLQUFLLFNBQUwsQ0FBZSxpQkFBM0I7QUFDQSxXQUFLLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FBd0I7QUFDcEIsUUFBQSxJQUFJLEVBQUUsSUFEYztBQUVwQixRQUFBLFdBQVcsRUFBRSxNQUZPO0FBR3BCLFFBQUEsSUFBSSxFQUFFLEtBQUssWUFBTCxFQUhjO0FBSXBCLFFBQUEsWUFBWSxFQUFFLElBSk07QUFLcEI7QUFDQSxRQUFBLFNBQVMsRUFBRSxtQkFBVSxNQUFWLEVBQWtCO0FBQ3pCLGlCQUFPO0FBQ0gsWUFBQSxFQUFFLEVBQUUsTUFBTSxDQUFDLElBRFI7QUFFSCxZQUFBLElBQUksRUFBRSxNQUFNLENBQUMsSUFGVjtBQUdILFlBQUEsU0FBUyxFQUFFO0FBSFIsV0FBUDtBQUtIO0FBWm1CLE9BQXhCLEVBcEZJLENBa0dKOztBQUNBLFdBQUssVUFBTCxDQUFnQixJQUFoQixDQUFxQixTQUFyQixFQUFnQyxTQUFoQyxDQUEwQyxRQUExQyxDQUFtRCw0QkFBbkQsRUFuR0ksQ0FxR0o7O0FBQ0EsV0FBSyxVQUFMLEdBQWtCLENBQUMsQ0FBQyxxRkFBRCxDQUFuQjtBQUNBLFdBQUssVUFBTCxDQUFnQixHQUFoQixDQUFvQixZQUFwQixFQUFrQyxLQUFsQztBQUNBLFdBQUssVUFBTCxDQUFnQixLQUFoQixDQUFzQixPQUF0QjtBQUNBLFdBQUssVUFBTCxDQUFnQixRQUFoQixDQUF5QiwyQ0FBekI7QUFDQSxXQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsT0FBckIsRUFBOEIsaUJBQTlCO0FBQ0EsV0FBSyxVQUFMLENBQWdCLEdBQWhCLENBQW9CLFdBQXBCLEVBQWlDLENBQWpDO0FBQ0EsV0FBSyxlQUFMLENBQXFCLEtBQUssVUFBMUIsRUFBc0MsUUFBdEMsRUFBZ0QsQ0FBQyxDQUFqRDtBQUVBLFVBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyx3QkFDRyw4Q0FESCxHQUVELFFBRkEsQ0FBaEI7QUFHQSxXQUFLLGVBQUwsQ0FBcUIsUUFBckIsRUFBK0IsS0FBSyxLQUFwQyxFQUEyQyxDQUFDLENBQTVDLEVBakhJLENBbUhKOztBQUNBLFdBQUssYUFBTCxHQUFxQixDQUFDLENBQUMsZ0VBQUQsQ0FBRCxDQUFvRSxRQUFwRSxDQUE2RSxRQUE3RSxDQUFyQjtBQUNBLFdBQUssYUFBTCxDQUFtQixLQUFuQixDQUF5QixFQUF6QjtBQUNBLFdBQUssYUFBTCxDQUFtQixHQUFuQixDQUF1QixhQUF2QixFQUFzQyxvQkFBdEM7QUFDQSxXQUFLLGFBQUwsQ0FBbUIsR0FBbkIsQ0FBdUIsY0FBdkIsRUFBdUMsS0FBdkM7QUFDQSxXQUFLLGFBQUwsQ0FBbUIsUUFBbkIsQ0FBNEIsMkNBQTVCO0FBQ0EsV0FBSyxhQUFMLENBQW1CLElBQW5CLENBQXdCLE9BQXhCLEVBQWlDLDBCQUFqQztBQUNBLFdBQUssYUFBTCxDQUFtQixFQUFuQixDQUFzQixVQUF0QixFQUFrQyxVQUFTLEtBQVQsRUFBZTtBQUM3QyxZQUFJLEtBQUssQ0FBQyxPQUFOLElBQWlCLEVBQWpCLElBQXdCLEtBQUssQ0FBQyxPQUFOLElBQWlCLEVBQWpCLElBQXVCLEtBQUssQ0FBQyxPQUFOLElBQWlCLEVBQXBFLEVBQXdFO0FBQUU7QUFDdEUsaUJBQU8sSUFBUDtBQUNIOztBQUNELGVBQU8sS0FBUDtBQUNILE9BTEQsRUExSEksQ0FpSUo7O0FBQ0EsV0FBSyxjQUFMLEdBQXNCLENBQUMsQ0FBQyw2REFBRCxDQUFELENBQWlFLE1BQWpFLENBQXdFO0FBQzFGLFFBQUEsSUFBSSxFQUFFLGtCQURvRjtBQUUxRixRQUFBLFNBQVMsRUFBRTtBQUYrRSxPQUF4RSxFQUduQixLQUhtQixDQUdiLFlBQU07QUFDWCxRQUFBLE1BQUksQ0FBQyxhQUFMLENBQW1CLENBQW5CLEVBQXNCLEtBQXRCLEdBQThCLDRCQUFpQixNQUFJLENBQUMsU0FBTCxDQUFlLE1BQWYsQ0FBc0IsWUFBdEIsQ0FBbUMsV0FBcEQsQ0FBOUI7QUFDSCxPQUxxQixDQUF0QjtBQU1BLFdBQUssZUFBTCxDQUFxQixLQUFLLGNBQTFCLEVBQTBDLFFBQTFDLEVBQW9ELENBQUMsQ0FBckQsRUF4SUksQ0EwSUo7O0FBQ0EsV0FBSyxjQUFMLEdBQXNCLENBQUMsQ0FBQyxxRUFBRCxDQUFELENBQXlFLE1BQXpFLENBQWdGO0FBQ2xHLFFBQUEsSUFBSSxFQUFFLHNCQUQ0RjtBQUVsRyxRQUFBLFNBQVMsRUFBRTtBQUZ1RixPQUFoRixDQUF0QixDQTNJSSxDQStJSjs7QUFDQSxXQUFLLGNBQUwsQ0FBb0IsR0FBcEIsQ0FBd0IsWUFBeEIsRUFBc0MsUUFBdEMsRUFoSkksQ0FpSko7QUFFQTs7QUFDQSxXQUFLLGFBQUwsQ0FBbUIsSUFBbkIsQ0FBd0IsWUFBTTtBQUMxQixZQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBSSxDQUFDLGFBQU4sQ0FBRCxDQUFzQixHQUF0QixFQUFSO0FBQ0EsWUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQUksQ0FBQyxlQUFOLENBQUQsQ0FBd0IsR0FBeEIsRUFBUjs7QUFDQSxZQUFHLDZCQUFrQixDQUFDLEdBQUMsQ0FBcEIsSUFBeUIsNkJBQWtCLENBQWxCLENBQTVCLEVBQWlEO0FBQzdDLFVBQUEsQ0FBQyxDQUFDLE1BQUksQ0FBQyxhQUFOLENBQUQsQ0FBc0IsR0FBdEIsQ0FBMEIsNEJBQWlCLDZCQUFrQixDQUFsQixJQUFxQixHQUF0QyxDQUExQjtBQUNIO0FBQ0osT0FORDtBQU9BLFdBQUssZUFBTCxDQUFxQixJQUFyQixDQUEwQixZQUFNO0FBQzVCLFlBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFJLENBQUMsYUFBTixDQUFELENBQXNCLEdBQXRCLEVBQVI7QUFDQSxZQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBSSxDQUFDLGVBQU4sQ0FBRCxDQUF3QixHQUF4QixFQUFSOztBQUNBLFlBQUcsNkJBQWtCLENBQUMsR0FBQyxDQUFwQixJQUF5Qiw2QkFBa0IsQ0FBbEIsQ0FBNUIsRUFBaUQ7QUFDN0MsVUFBQSxDQUFDLENBQUMsTUFBSSxDQUFDLGFBQU4sQ0FBRCxDQUFzQixHQUF0QixDQUEwQiw0QkFBaUIsNkJBQWtCLENBQWxCLElBQXFCLEdBQXRDLENBQTFCO0FBQ0g7QUFDSixPQU5EO0FBUUEsV0FBSyxlQUFMLENBQXFCLEtBQUssY0FBMUIsRUFBMEMsUUFBMUMsRUFBb0QsQ0FBQyxDQUFyRDtBQUVBLFVBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxrQ0FBRCxDQUFELENBQXNDLFFBQXRDLENBQStDLEtBQUssVUFBcEQsQ0FBbkI7QUFFQSxVQUFJLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxpQ0FBRCxDQUF6QjtBQUNBLE1BQUEsaUJBQWlCLENBQUMsR0FBbEIsQ0FBc0IsT0FBdEIsRUFBK0IsT0FBL0I7QUFDQSxXQUFLLGVBQUwsQ0FBcUIsaUJBQXJCLEVBQXdDLFlBQXhDLEVBQXNELENBQUMsQ0FBdkQsRUF6S0ksQ0EyS0o7O0FBQ0EsVUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDLCtCQUFELENBQUQsQ0FBbUMsTUFBbkMsQ0FBMEM7QUFDM0QsUUFBQSxJQUFJLEVBQUUsY0FEcUQ7QUFFM0QsUUFBQSxTQUFTLEVBQUU7QUFGZ0QsT0FBMUMsRUFHbkIsS0FIbUIsQ0FHYixZQUFNO0FBQ1YsUUFBQSxNQUFJLENBQUMsVUFBTCxDQUFnQixLQUFoQixFQURVLENBRVY7OztBQUNBLFFBQUEsTUFBSSxDQUFDLFVBQUwsQ0FBZ0IsWUFBaEI7QUFDSixPQVBxQixDQUF0QjtBQVFBLE1BQUEsZUFBZSxDQUFDLElBQWhCLENBQXFCLE9BQXJCLEVBQThCLGNBQTlCO0FBQ0EsV0FBSyxlQUFMLENBQXFCLGVBQXJCLEVBQXNDLFlBQXRDLEVBQW9ELENBQUMsQ0FBckQsRUFyTEksQ0F1TEo7O0FBQ0EsV0FBSyxhQUFMLEdBQXFCLENBQUMsQ0FBQyxvQ0FBRCxDQUFELENBQXdDLE1BQXhDLENBQStDO0FBQ2hFLFFBQUEsSUFBSSxFQUFFLFlBRDBEO0FBRWhFLFFBQUEsU0FBUyxFQUFFO0FBRnFELE9BQS9DLENBQXJCO0FBSUEsV0FBSyxhQUFMLENBQW1CLEdBQW5CLENBQXVCLGNBQXZCLEVBQXVDLE1BQXZDO0FBQ0EsV0FBSyxhQUFMLENBQW1CLElBQW5CLENBQXdCLE9BQXhCLEVBQWlDLG1CQUFqQztBQUNBLFdBQUssYUFBTCxDQUFtQixLQUFuQixDQUF5QixZQUFNO0FBQzNCLFFBQUEsTUFBSSxDQUFDLFNBQUwsQ0FBZSxNQUFmLENBQXNCLGdCQUF0QixDQUF1QyxNQUFJLENBQUMsa0JBQTVDLEVBQWdFLFlBQU07QUFDbEUsVUFBQSxNQUFJLENBQUMsU0FBTCxDQUFlLG9CQUFmLENBQW9DLE1BQUksQ0FBQyxrQkFBekM7O0FBQ0EsVUFBQSxNQUFJLENBQUMsS0FBTDtBQUNILFNBSEQ7QUFJSCxPQUxEO0FBTUEsV0FBSyxlQUFMLENBQXFCLEtBQUssYUFBMUIsRUFBeUMsWUFBekMsRUFBdUQsQ0FBQyxDQUF4RCxFQXBNSSxDQXVNSjs7QUFDQSxVQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsaUNBQUQsQ0FBRCxDQUFxQyxNQUFyQyxDQUE0QztBQUM1RCxRQUFBLFNBQVMsRUFBRTtBQURpRCxPQUE1QyxFQUVqQixLQUZpQixDQUVYLFlBQU07QUFDWCxRQUFBLE1BQUksQ0FBQyxVQUFMLENBQWdCLGFBQWhCOztBQUNBLFFBQUEsTUFBSSxDQUFDLEtBQUw7QUFDSCxPQUxtQixDQUFwQjtBQU1BLE1BQUEsYUFBYSxDQUFDLEdBQWQsQ0FBa0IsT0FBbEIsRUFBMkIsT0FBM0I7QUFDQSxNQUFBLGFBQWEsQ0FBQyxJQUFkLENBQW1CLE9BQW5CLEVBQTRCLHlCQUE1QixFQS9NSSxDQWdOSjs7QUFDQSxXQUFLLGVBQUwsQ0FBcUIsYUFBckIsRUFBb0MsWUFBcEMsRUFBa0QsQ0FBQyxDQUFuRCxFQWpOSSxDQW1OSjs7QUFDQSxVQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsdUJBQUQsQ0FBRCxDQUEyQixNQUEzQixDQUFrQztBQUNoRCxRQUFBLFNBQVMsRUFBRTtBQURxQyxPQUFsQyxFQUVmLEtBRmUsQ0FFVCxZQUFNO0FBQ1gsUUFBQSxNQUFJLENBQUMsd0JBQUwsQ0FBOEIsVUFBQyxVQUFELEVBQWEsS0FBYixFQUF1QjtBQUNqRCxjQUFHLE1BQUksQ0FBQyxRQUFSLEVBQWlCO0FBQ2IsWUFBQSxNQUFJLENBQUMsU0FBTCxDQUFlLGdCQUFmLENBQWdDLFVBQWhDLEVBQTRDLEtBQTVDO0FBQ0gsV0FGRCxNQUVPO0FBQ0gsWUFBQSxNQUFJLENBQUMsU0FBTCxDQUFlLHFCQUFmLENBQXFDLFVBQXJDO0FBQ0g7O0FBQ0QsVUFBQSxNQUFJLENBQUMsVUFBTCxDQUFnQixhQUFoQjs7QUFDQSxVQUFBLE1BQUksQ0FBQyxLQUFMO0FBQ0gsU0FSRDtBQVNILE9BWmlCLENBQWxCO0FBYUEsTUFBQSxXQUFXLENBQUMsR0FBWixDQUFnQixPQUFoQixFQUF5QixNQUF6QjtBQUNBLFdBQUssZUFBTCxDQUFxQixXQUFyQixFQUFrQyxZQUFsQyxFQUFnRCxDQUFDLENBQWpELEVBbE9JLENBb09KOztBQUNBLE1BQUEsQ0FBQyxDQUFDLE1BQUQsQ0FBRCxDQUFVLE1BQVY7QUFDQSxXQUFLLEtBQUwsQ0FBVyxJQUFYLEdBQWtCLFFBQWxCLENBQTJCLGtCQUEzQixFQXRPSSxDQXVPSjtBQUNBO0FBQ0g7OztvQ0FFZSxRLEVBQVUsVSxFQUFZLEssRUFBb0M7QUFBQSxVQUE3QixhQUE2Qix1RUFBYixZQUFhO0FBQ3RFLE1BQUEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxPQUFiLEVBQXNCLEtBQXRCO0FBQ0EsTUFBQSxRQUFRLENBQUMsR0FBVCxDQUFhLFlBQWIsRUFBMkIsYUFBM0IsRUFGc0UsQ0FHdEU7QUFDQTs7QUFDQSxNQUFBLFVBQVUsQ0FBQyxNQUFYLENBQWtCLFFBQWxCO0FBQ0g7OzsrQkFFVSxTLEVBQXdCO0FBQUEsVUFBYixRQUFhLHVFQUFGLENBQUU7O0FBRS9CO0FBQ0EsVUFBRyxTQUFILEVBQWE7QUFDVCxhQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBdUIsUUFBdkIsRUFBaUMsR0FBakM7QUFDQSxhQUFLLFVBQUwsQ0FBZ0IsV0FBaEIsQ0FBNEIsSUFBNUI7QUFDSCxPQUhELE1BR087QUFDSCxhQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsSUFBckIsRUFBMkIsSUFBM0I7QUFDQSxhQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBdUIsUUFBdkIsRUFBaUMsR0FBakM7QUFDQSxhQUFLLFVBQUwsQ0FBZ0IsV0FBaEIsQ0FBNEIsS0FBNUI7QUFDSDs7QUFDRCxXQUFLLFNBQUwsR0FBaUIsU0FBakI7QUFFSDs7O2lDQUVXO0FBRVIsVUFBRyxLQUFLLElBQVIsRUFBYTtBQUNULGFBQUssS0FBTDtBQUNILE9BRkQsTUFFTztBQUNILGFBQUssSUFBTDtBQUNIO0FBRUo7OzsyQkFFSztBQUNGLFdBQUssVUFBTCxDQUFnQixJQUFoQjtBQUNBLFdBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxXQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsR0FIRSxDQUlGOztBQUNBLFdBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsV0FBdEIsQ0FBa0MsS0FBbEM7QUFDSDs7OzRCQUVNO0FBQ0gsV0FBSyxVQUFMLENBQWdCLEtBQWhCO0FBQ0EsV0FBSyxJQUFMLEdBQVksS0FBWjtBQUNBLFdBQUssVUFBTCxDQUFnQixJQUFoQixHQUhHLENBSUg7O0FBQ0EsV0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixXQUF0QixDQUFrQyxJQUFsQztBQUNBLFdBQUssVUFBTCxDQUFnQixPQUFoQixDQUF3QixhQUF4QjtBQUNIOzs7b0NBRWM7QUFDWCxXQUFLLFVBQUwsQ0FBZ0IsQ0FBQyxLQUFLLFNBQXRCLEVBQWlDLENBQWpDO0FBQ0g7OzttQ0FFZ0Q7QUFBQSxVQUFwQyxVQUFvQyx1RUFBdkIsSUFBdUI7QUFBQSxVQUFqQixRQUFpQix1RUFBTixLQUFNO0FBQzdDO0FBQ0EsV0FBSyxJQUFMLEdBRjZDLENBSTdDOztBQUNBLFVBQUksVUFBVSxJQUFJLFFBQWxCLEVBQTRCO0FBQ3hCO0FBQ0EsYUFBSyxRQUFMLEdBQWdCLElBQWhCLENBRndCLENBSXhCO0FBQ0E7QUFDQTs7QUFDQSxZQUFHLFFBQUgsRUFBYSxLQUFLLFFBQUwsR0FBZ0IsS0FBaEI7QUFFYixhQUFLLGtCQUFMLEdBQTBCLFVBQTFCO0FBRUEsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLHVDQUFaO0FBQ0EsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFVBQVo7QUFDQSxhQUFLLGVBQUwsQ0FBcUIsR0FBckIsQ0FBeUIsNEJBQWlCLFVBQVUsQ0FBQyxTQUE1QixDQUF6QjtBQUNBLGFBQUssYUFBTCxDQUFtQixHQUFuQixDQUF1Qiw0QkFBaUIsVUFBVSxDQUFDLE9BQTVCLENBQXZCOztBQUNBLFlBQUksZUFBZSxPQUFPLFVBQVUsQ0FBQyxLQUFyQyxFQUE2QztBQUFFO0FBQzNDLGVBQUssVUFBTCxDQUFnQixHQUFoQixDQUFvQixVQUFVLENBQUMsSUFBWCxDQUFnQixNQUFoQixDQUF1QixVQUFBLElBQUk7QUFBQSxtQkFBSSxJQUFJLENBQUMsT0FBTCxJQUFnQixZQUFwQjtBQUFBLFdBQTNCLEVBQTZELENBQTdELEVBQWdFLEtBQXBGLEVBRHlDLENBRXpDO0FBQ0gsU0FIRCxNQUdPO0FBQUU7QUFDTCxlQUFLLFVBQUwsQ0FBZ0IsR0FBaEIsQ0FBb0IsVUFBVSxDQUFDLEtBQVgsQ0FBaUIsQ0FBakIsRUFBb0IsS0FBcEIsQ0FBMEIsQ0FBMUIsRUFBNkIsS0FBN0IsQ0FBbUMsQ0FBbkMsRUFBc0MsSUFBdEMsQ0FBMkMsTUFBM0MsQ0FBa0QsVUFBQSxJQUFJO0FBQUEsbUJBQUksSUFBSSxDQUFDLE9BQUwsSUFBZ0IsWUFBcEI7QUFBQSxXQUF0RCxFQUF3RixDQUF4RixFQUEyRixLQUEvRztBQUNBLGVBQUssRUFBTCxHQUFVLFVBQVUsQ0FBQyxLQUFYLENBQWlCLENBQWpCLEVBQW9CLEtBQXBCLENBQTBCLENBQTFCLEVBQTZCLEtBQTdCLENBQW1DLENBQW5DLEVBQXNDLEVBQWhEO0FBQ0gsU0FyQnVCLENBc0J4Qjs7O0FBQ0EsYUFBSyxVQUFMLENBQWdCLEdBQWhCLENBQW9CLEVBQXBCLEVBQXdCLE9BQXhCLENBQWdDLFFBQWhDO0FBQ0EsYUFBSyxVQUFMLENBQWdCLElBQWhCLENBQXFCLFFBQXJCLEVBQStCLE1BQS9COztBQXhCd0IsbURBMEJULFVBQVUsQ0FBQyxJQTFCRjtBQUFBOztBQUFBO0FBMEJ4Qiw4REFBK0I7QUFBQSxnQkFBdkIsR0FBdUI7QUFDM0IsaUJBQUssVUFBTCxDQUFnQixNQUFoQixDQUF1QixvQkFBa0IsR0FBbEIsR0FBc0IsYUFBdEIsR0FBb0MsR0FBcEMsR0FBd0MsV0FBL0Q7QUFDQSxpQkFBSyxVQUFMLENBQWdCLE9BQWhCLENBQXdCLFFBQXhCO0FBQ0gsV0E3QnVCLENBK0J4QjtBQUNBO0FBRUE7O0FBbEN3QjtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQW1DeEIsYUFBSyxVQUFMLENBQWdCLFNBQWhCLEdBQTRCLEVBQTVCOztBQUNBLFlBQUksVUFBVSxDQUFDLFNBQVgsSUFBd0IsSUFBNUIsRUFBa0M7QUFDOUIsZUFBSyxVQUFMLENBQWdCLFNBQWhCLENBQTBCLElBQTFCLENBQStCLFVBQVUsQ0FBQyxTQUExQzs7QUFDQSxjQUFJLFVBQVUsQ0FBQyxPQUFYLElBQXNCLElBQTFCLEVBQWdDO0FBQzVCLGlCQUFLLFVBQUwsQ0FBZ0IsU0FBaEIsQ0FBMEIsSUFBMUIsQ0FBK0IsVUFBVSxDQUFDLE9BQTFDO0FBQ0g7QUFDSjtBQUVKLE9BM0NELENBNENBO0FBNUNBLFdBNkNLO0FBQ0Q7QUFDQSxlQUFLLFFBQUwsR0FBZ0IsS0FBaEI7QUFFQSxlQUFLLGtCQUFMLEdBQTBCLElBQTFCO0FBRUEsVUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLDhCQUFaO0FBQ0EsZUFBSyxlQUFMLENBQXFCLEdBQXJCLENBQXlCLDRCQUFpQixLQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLFlBQXRCLENBQW1DLFdBQXBELENBQXpCO0FBQ0EsZUFBSyxhQUFMLENBQW1CLEdBQW5CLENBQXVCLDRCQUFpQixLQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLFlBQXRCLENBQW1DLFFBQXBELENBQXZCO0FBQ0EsZUFBSyxVQUFMLENBQWdCLEdBQWhCLENBQW9CLEVBQXBCLEVBVEMsQ0FVRDs7QUFDQSxlQUFLLFVBQUwsQ0FBZ0IsR0FBaEIsQ0FBb0IsRUFBcEIsRUFBd0IsT0FBeEIsQ0FBZ0MsUUFBaEM7QUFDQSxlQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsUUFBckIsRUFBK0IsTUFBL0I7QUFFQSxlQUFLLFVBQUwsQ0FBZ0IsUUFBaEI7QUFDSCxTQWpFNEMsQ0FtRTdDOzs7QUFDQSxVQUFHLEtBQUssUUFBUixFQUFrQjtBQUNkLGFBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsaUJBQWpCO0FBQ0EsYUFBSyxhQUFMLENBQW1CLE1BQW5CLENBQTBCLFFBQTFCO0FBQ0gsT0FIRCxNQUlLO0FBQ0QsYUFBSyxNQUFMLENBQVksSUFBWixDQUFpQixtQkFBakI7QUFDQSxhQUFLLGFBQUwsQ0FBbUIsTUFBbkIsQ0FBMEIsU0FBMUI7QUFDSDtBQUVKOzs7NkNBRXdCLFEsRUFBUztBQUM5QixVQUFHLEtBQUssUUFBUixFQUFpQjtBQUNiLFFBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSx3Q0FBWjtBQUNBLGFBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsY0FBdEIsQ0FBcUMsUUFBckM7QUFDSCxPQUhELE1BSUk7QUFDQSxRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVkscUNBQVo7QUFDQSxhQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLGNBQXRCLENBQXFDLFFBQXJDO0FBQ0g7QUFDSixLLENBRUQ7Ozs7MENBQ3NCO0FBRWxCLFVBQUksVUFBVSxHQUFHLElBQUksc0JBQUosRUFBakI7O0FBRUEsVUFBSSxlQUFlLE9BQU8sVUFBVSxDQUFDLEtBQXJDLEVBQTZDO0FBQUU7QUFDM0MsUUFBQSxVQUFVLENBQUMsTUFBRCxDQUFWLEdBQXFCLEtBQUsscUJBQUwsRUFBckI7QUFDQSxRQUFBLFVBQVUsQ0FBQyxRQUFELENBQVYsR0FBdUIsS0FBSyxxQkFBTCxDQUEyQixJQUEzQixDQUF2QjtBQUNILE9BSEQsTUFHTztBQUFFO0FBQ0wsUUFBQSxVQUFVLENBQUMsT0FBRCxDQUFWLEdBQXNCO0FBQ2xCLGdCQUFNLENBQUMsS0FBSyxTQUFMLENBQWUsWUFBaEI7QUFEWSxTQUF0QjtBQUdBLFFBQUEsVUFBVSxDQUFDLE9BQUQsQ0FBVixHQUFzQixLQUFLLG9CQUFMLEVBQXRCO0FBQ0gsT0FaaUIsQ0FjbEI7OztBQUNBLE1BQUEsVUFBVSxDQUFDLFdBQVgsR0Fma0IsQ0FpQmxCOztBQUNBLFVBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLFNBQUwsQ0FBZSxVQUFmLENBQVgsQ0FBWjtBQUNBLGFBQU8sS0FBUDtBQUNIOzs7MkNBRXNCO0FBQ25CLFVBQUksU0FBUyxHQUFHLElBQUksSUFBSixHQUFXLFdBQVgsRUFBaEIsQ0FEbUIsQ0FDdUI7O0FBQzFDLFVBQUksYUFBYSxHQUFHLEtBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsWUFBdEIsQ0FBbUMsUUFBdkQ7QUFDQSxVQUFJLFVBQVUsR0FBRyxLQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLFlBQXRCLENBQW1DLFVBQXBEO0FBQ0EsVUFBSSxXQUFXLEdBQUcsS0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixZQUF0QixDQUFtQyxXQUFyRCxDQUptQixDQU1uQjtBQUNBO0FBQ0E7O0FBRUEsVUFBSSxLQUFLLEdBQUcsQ0FBQztBQUNULGNBQU0sS0FBSyxTQUFMLENBQWUsR0FEWjtBQUNpQjtBQUMxQixnQkFBUSxRQUZDO0FBR1Qsa0JBQVUsV0FIRDtBQUlULGlCQUFTLFVBSkE7QUFLVCxvQkFBWSxhQUxIO0FBTVQsbUJBQVc7QUFDUCxnQkFBTSxLQUFLLFNBQUwsQ0FBZSxHQURkO0FBRVAsa0JBQVEsT0FGRDtBQUdQLG9CQUFVLFdBSEg7QUFJUCxtQkFBUyxVQUpGO0FBS1Asc0JBQVksYUFMTDtBQU1QLG1CQUFTO0FBQ0wsa0JBQU0sS0FBSyxTQUFMLENBQWUsWUFEaEIsQ0FDNkI7O0FBRDdCLFdBTkY7QUFTUCx5QkFBZTtBQUNYLGtCQUFNO0FBREs7QUFUUixTQU5GO0FBbUJULGlCQUFTLENBQUM7QUFDTixnQkFBTSxLQUFLLFNBQUwsQ0FBZSxHQURmO0FBRU4sa0JBQVEsZ0JBRkY7QUFHTix1QkFBYSwrQkFIUDtBQUlOLHVCQUFhLFNBSlA7QUFLTixtQkFBUyxDQUFDO0FBQ04sa0JBQU0sS0FBSyxFQURMO0FBQ1M7QUFDZixvQkFBUSxZQUZGO0FBR04seUJBQWEsNENBSFA7QUFJTiwwQkFBYyxjQUpSO0FBS04sdUJBQVcsS0FBSyxvQkFBTCxFQUxMO0FBTU4sdUJBQVcsU0FOTDtBQU9OLHNCQUFVLDhDQVBKO0FBUU4sb0JBQVEsS0FBSyxxQkFBTCxFQVJGO0FBU04sc0JBQVUsS0FBSyxxQkFBTCxDQUEyQixLQUEzQjtBQVRKLFdBQUQ7QUFMSCxTQUFEO0FBbkJBLE9BQUQsQ0FBWjtBQXlDQSxhQUFPLEtBQVA7QUFFSDs7OzJDQUVzQjtBQUNuQixhQUFPO0FBQ0gsZ0JBQVEsUUFETDtBQUVILG9CQUFZLFlBQVksQ0FBQyxPQUFiLENBQXFCLG1CQUFyQixDQUZUO0FBR0gsc0JBQWMsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsb0JBQXJCO0FBSFgsT0FBUDtBQUtILEssQ0FFRDs7Ozs0Q0FDd0I7QUFDcEIsVUFBSSxJQUFJLEdBQUcsRUFBWCxDQURvQixDQUdwQjs7QUFDQSxVQUFJLFFBQVEsR0FBRztBQUNYLGdCQUFTLGFBREU7QUFFWCxpQkFBVSxLQUFLLFVBQUwsQ0FBZ0IsR0FBaEIsRUFGQztBQUdYLGtCQUFXLFlBSEE7QUFJWCxvQkFBYSxJQUpGO0FBS1gsbUJBQVc7QUFMQSxPQUFmO0FBT0EsTUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQVYsRUFYb0IsQ0FhcEI7QUFDQTs7QUFDQSxVQUFJLGFBQWEsR0FBRyxLQUFLLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FBd0IsTUFBeEIsRUFBZ0MsR0FBaEMsQ0FBb0MsVUFBQyxJQUFELEVBQVU7QUFBRSxlQUFPO0FBQUMsVUFBQSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQVY7QUFBYyxVQUFBLElBQUksRUFBRSxJQUFJLENBQUM7QUFBekIsU0FBUDtBQUFzQyxPQUF0RixDQUFwQjtBQUNBLFVBQUksU0FBUyxHQUFHLEtBQUssU0FBTCxDQUFlLGlCQUFmLENBQWlDLGVBQWpDLENBQWlELE9BQWpELENBQXlELE1BQXpELENBQWdFLFVBQVMsR0FBVCxFQUFjLElBQWQsRUFBb0I7QUFBQyxRQUFBLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBRCxDQUFMLENBQUgsR0FBa0IsSUFBbEI7QUFBd0IsZUFBTyxHQUFQO0FBQVksT0FBekgsRUFBMkgsRUFBM0gsQ0FBaEI7O0FBaEJvQixrREFrQkwsYUFsQks7QUFBQTs7QUFBQTtBQWtCcEIsK0RBQTZCO0FBQUEsY0FBckIsR0FBcUI7QUFDekIsY0FBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFMLENBQXpCO0FBQ0EsY0FBSSxPQUFPLEdBQUcsRUFBZDs7QUFDQSxjQUFJLFNBQUosRUFBZTtBQUNYLFlBQUEsT0FBTyxHQUFHO0FBQ04sc0JBQVEsa0JBREY7QUFFTix5QkFBVyxTQUZMO0FBR04sd0JBQVU7QUFDUixzQkFBTSxTQUFTLENBQUMsUUFEUjtBQUVSLDBCQUFVLGtCQUZGO0FBR1IseUJBQVM7QUFDUCx3QkFBTSxTQUFTLENBQUM7QUFEVCxpQkFIRDtBQU1SLCtCQUFlO0FBQ2Isd0JBQU0sU0FBUyxDQUFDO0FBREg7QUFOUDtBQUhKLGFBQVY7QUFjSCxXQWZELE1BZU87QUFDSCxZQUFBLE9BQU8sR0FBRztBQUNOLHNCQUFRLGFBREY7QUFFTix5QkFBVyxTQUZMO0FBR04sdUJBQVMsR0FBRyxDQUFDO0FBSFAsYUFBVjtBQUtIOztBQUNELFVBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWO0FBQ0g7QUE1Q21CO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBOENwQixhQUFPLElBQVA7QUFDSDs7OzRDQUV1QjtBQUNwQixVQUFJLElBQUksR0FBRyxFQUFYLENBRG9CLENBR3BCOztBQUNBLFVBQUksUUFBUSxHQUFHO0FBQ1gsZ0JBQVMsYUFERTtBQUVYLGlCQUFVLEtBQUssVUFBTCxDQUFnQixHQUFoQixFQUZDO0FBR1gsa0JBQVcsWUFIQTtBQUlYLG9CQUFhLElBSkY7QUFLWCxtQkFBVztBQUxBLE9BQWY7QUFPQSxNQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixFQVhvQixDQWFwQjs7QUFDQSxVQUFJLElBQUksR0FBRyxLQUFLLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FBd0IsTUFBeEIsRUFBZ0MsR0FBaEMsQ0FBb0MsVUFBQyxJQUFELEVBQVU7QUFBRSxlQUFPLElBQUksQ0FBQyxJQUFaO0FBQW1CLE9BQW5FLENBQVg7O0FBZG9CLGtEQWVGLElBZkU7QUFBQTs7QUFBQTtBQWVwQiwrREFBdUI7QUFBQSxjQUFmLE1BQWU7QUFDbkIsY0FBSSxPQUFPLEdBQUc7QUFDVixvQkFBUSxhQURFO0FBRVYsdUJBQVcsU0FGRDtBQUdWLHFCQUFTO0FBSEMsV0FBZDtBQUtBLFVBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWO0FBQ0g7QUF0Qm1CO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBd0JwQixhQUFPLElBQVA7QUFDSCxLLENBRUQ7Ozs7MENBQ3NCLGdCLEVBQWtCO0FBRXBDLFVBQUksZUFBZSxPQUFPLGdCQUExQixFQUE2QyxnQkFBZ0IsR0FBRyxLQUFuQjtBQUU3QyxVQUFJLE1BQU0sR0FBRztBQUNULGNBQU0sS0FBSyxTQUFMLENBQWUsR0FEWjtBQUNpQjtBQUMxQixnQkFBUTtBQUZDLE9BQWI7QUFLQSxVQUFJLFNBQVMsR0FBRyxFQUFoQjtBQUVBLFVBQUksV0FBVyxHQUFHLDZCQUFrQixLQUFLLGVBQUwsQ0FBcUIsR0FBckIsRUFBbEIsQ0FBbEI7O0FBQ0EsVUFBRyw2QkFBa0IsS0FBSyxhQUFMLENBQW1CLEdBQW5CLEVBQWxCLElBQThDLDZCQUFrQixLQUFLLGVBQUwsQ0FBcUIsR0FBckIsRUFBbEIsQ0FBakQsRUFBK0Y7QUFDM0YsUUFBQSxXQUFXLEdBQUcsNkJBQWtCLEtBQUssYUFBTCxDQUFtQixHQUFuQixFQUFsQixDQUFkO0FBQ0g7O0FBQ0QsVUFBSSxTQUFTLEdBQUcsNkJBQWtCLEtBQUssZUFBTCxDQUFxQixHQUFyQixFQUFsQixDQUFoQixDQWZvQyxDQWlCcEM7O0FBQ0EsVUFBSSxZQUFZLEdBQUc7QUFDZixnQkFBUSxrQkFETztBQUVmLHNCQUFjLG1DQUZDO0FBRW9DO0FBQ25ELDZCQUFjLFNBQWQsY0FBMkIsV0FBM0IsQ0FIZSxDQUcwQjs7QUFIMUIsT0FBbkIsQ0FsQm9DLENBd0JwQzs7QUFDQSxVQUFJLEtBQUssVUFBTCxDQUFnQixTQUFoQixDQUEwQixNQUExQixHQUFtQyxDQUF2QyxFQUEwQztBQUV0QyxZQUFJLFNBQVMsR0FBRyxLQUFLLFVBQUwsQ0FBZ0IsU0FBaEIsQ0FBMEIsQ0FBMUIsRUFBNkIsR0FBN0IsQ0FBaUMsVUFBQSxJQUFJLEVBQUk7QUFBRSwyQkFBVSxJQUFJLENBQUMsQ0FBRCxDQUFkLGNBQXFCLElBQUksQ0FBQyxDQUFELENBQXpCO0FBQWdDLFNBQTNFLEVBQTZFLElBQTdFLENBQWtGLEdBQWxGLENBQWhCO0FBQ0EsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLG1CQUFtQixTQUEvQjtBQUNBLFlBQUksS0FBSyxHQUFHLHdEQUFaO0FBQ0EsUUFBQSxLQUFLLElBQUksc0JBQXNCLFNBQXRCLEdBQWtDLE1BQTNDOztBQUVBLFlBQUksZUFBZSxPQUFPLEtBQUssVUFBTCxDQUFnQixTQUFoQixDQUEwQixDQUExQixDQUExQixFQUF5RDtBQUNyRCxjQUFJLFFBQVEsR0FBRyxLQUFLLFVBQUwsQ0FBZ0IsU0FBaEIsQ0FBMEIsQ0FBMUIsRUFBNkIsR0FBN0IsQ0FBaUMsVUFBQSxJQUFJLEVBQUk7QUFBRSw2QkFBVSxJQUFJLENBQUMsQ0FBRCxDQUFkLGNBQXFCLElBQUksQ0FBQyxDQUFELENBQXpCO0FBQWdDLFdBQTNFLEVBQTZFLElBQTdFLENBQWtGLEdBQWxGLENBQWY7QUFDQSxVQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksbUJBQW1CLFFBQS9CO0FBQ0EsVUFBQSxLQUFLLElBQUksMkNBQTJDLFNBQTNDLEdBQXVELFFBQXZELEdBQWtFLFFBQWxFLEdBQTZFLEdBQXRGO0FBQ0EsVUFBQSxLQUFLLElBQUksYUFBYSxTQUFiLEdBQXlCLFNBQXpCLEdBQXFDLFdBQXJDLEdBQW1ELE1BQTVEO0FBQ0g7O0FBRUQsUUFBQSxLQUFLLElBQUksUUFBVDtBQUVBLFlBQUksZUFBZSxHQUFHO0FBQ2xCLGtCQUFRLGFBRFU7QUFFbEIsd0JBQWMsMkJBRkk7QUFFeUI7QUFDM0MsNkJBQVksS0FBWixDQUhrQixDQUdFOztBQUhGLFNBQXRCOztBQUtBLFlBQUksZ0JBQUosRUFBc0I7QUFDbEIsVUFBQSxTQUFTLENBQUMsSUFBVixDQUFlLGVBQWY7QUFDSCxTQUZELE1BRU87QUFDSCxVQUFBLFlBQVksQ0FBQyxXQUFELENBQVosR0FBNEIsZUFBNUI7QUFDSDtBQUNKOztBQUVELFVBQUksZ0JBQUosRUFBc0I7QUFDbEIsUUFBQSxTQUFTLENBQUMsSUFBVixDQUFlLFlBQWY7QUFDQSxRQUFBLE1BQU0sQ0FBQyxVQUFELENBQU4sR0FBcUIsU0FBckI7QUFDSCxPQUhELE1BR087QUFDSCxRQUFBLE1BQU0sQ0FBQyxVQUFELENBQU4sR0FBcUIsWUFBckI7QUFDSDs7QUFFRCxhQUFPLE1BQVA7QUFDSDs7O21DQUVjO0FBQ1gsVUFBSSxLQUFLLFNBQUwsQ0FBZSxpQkFBZixJQUFvQyxTQUFwQyxJQUFpRCxLQUFLLFNBQUwsQ0FBZSxpQkFBZixDQUFpQyxlQUFqQyxDQUFpRCxNQUFqRCxHQUEwRCxDQUEvRyxFQUFrSDtBQUM5RyxlQUFPLEtBQUssU0FBTCxDQUFlLGlCQUFmLENBQWlDLGVBQXhDO0FBQ0g7O0FBRUQsYUFBTztBQUNILFFBQUEsR0FBRyxFQUFFLEtBQUssU0FBTCxDQUFlLE9BRGpCO0FBRUgsUUFBQSxRQUFRLEVBQUUsTUFGUDtBQUdILFFBQUEsS0FBSyxFQUFFLEdBSEo7QUFJSCxRQUFBLEtBQUssRUFBRSxJQUpKO0FBS0gsUUFBQSxhQUFhLEVBQUUsS0FBSyxTQUFMLENBQWUsYUFMM0I7QUFNSCxRQUFBLGlCQUFpQixFQUFFLEtBQUssU0FBTCxDQUFlLGlCQU4vQjtBQU9ILFFBQUEsYUFBYSxFQUFFLEtBQUsscUJBUGpCO0FBUUgsUUFBQSxjQUFjLEVBQUUsd0JBQVUsSUFBVixFQUFnQjtBQUM1QixpQkFBTyxLQUFLLFdBQUwsQ0FBaUIsYUFBakIsQ0FBK0IsSUFBL0IsRUFBcUMsS0FBSyxXQUFMLENBQWlCLGFBQXRELENBQVA7QUFDSDtBQVZFLE9BQVA7QUFZSDs7OzBDQUVxQixJLEVBQU0sYSxFQUFlO0FBQ3ZDO0FBQ0E7QUFDQSxVQUFJLGlCQUFpQixHQUFHLEVBQXhCO0FBQ0EsVUFBSSxVQUFVLEdBQUcsRUFBakI7QUFDQSxVQUFJLFFBQVEsR0FBRyxFQUFmO0FBQ0EsVUFBSSxPQUFPLEdBQUcsQ0FBZDtBQUVBLFVBQUksSUFBSSxHQUFHLEVBQVg7QUFDQSxVQUFJLEtBQUssR0FBRyxDQUFaOztBQVR1QyxrREFXdkIsSUFBSSxDQUFDLE9BQUQsQ0FYbUI7QUFBQTs7QUFBQTtBQVd2QywrREFBOEI7QUFBQSxjQUF0QixJQUFzQjtBQUMxQjtBQUNBLGNBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFELENBQW5CO0FBQ0EsY0FBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQUQsQ0FBeEI7O0FBQ0EsY0FBSSxhQUFhLElBQUksRUFBakIsSUFBdUIsSUFBSSxDQUFDLFFBQUQsQ0FBSixJQUFrQixTQUE3QyxFQUF3RDtBQUNwRCxnQkFBSSxPQUFPLEdBQUcsRUFBZDtBQUNBLGdCQUFJLFNBQVMsR0FBRyxFQUFoQixDQUZvRCxDQUlwRDs7QUFKb0Qsd0RBS25DLElBQUksQ0FBQyxRQUFELENBTCtCO0FBQUE7O0FBQUE7QUFLcEQscUVBQWlDO0FBQUEsb0JBQXpCLEtBQXlCO0FBQzdCLG9CQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsVUFBRCxDQUFwQjtBQUNBLG9CQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsWUFBRCxDQUFuQjs7QUFDQSxvQkFBSSxRQUFRLElBQUksYUFBWixJQUE2QixPQUE3QixJQUF3QyxPQUFPLENBQUMsSUFBUixJQUFnQixFQUE1RCxFQUFnRTtBQUM1RCxrQkFBQSxPQUFPLEdBQUcsT0FBVjtBQUNIO0FBQ0osZUFYbUQsQ0FZcEQ7O0FBWm9EO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUEsd0RBYWxDLElBQUksQ0FBQyxVQUFELENBYjhCO0FBQUE7O0FBQUE7QUFhcEQscUVBQW9DO0FBQUEsb0JBQTNCLE1BQTJCO0FBQ2hDLG9CQUFJLFNBQVEsR0FBRyxNQUFLLENBQUMsVUFBRCxDQUFwQjtBQUNBLG9CQUFJLFNBQVMsR0FBRyxNQUFLLENBQUMsZUFBRCxDQUFyQixDQUZnQyxDQUVROztBQUN4QyxvQkFBSSxTQUFRLElBQUksYUFBWixJQUE2QixTQUFqQyxFQUE0QztBQUN4QyxrQkFBQSxTQUFTLEdBQUcsU0FBWjtBQUNIO0FBQ0osZUFuQm1ELENBcUJwRDs7QUFyQm9EO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBc0JwRCxnQkFBSSxTQUFTLElBQUksU0FBYixJQUEwQixTQUFTLENBQUMsSUFBVixJQUFrQixFQUFoRCxFQUFvRDtBQUNoRCxjQUFBLFNBQVMsR0FBRyxhQUFaO0FBQ0g7O0FBQ0QsWUFBQSxpQkFBaUIsQ0FBQyxJQUFsQixDQUF1QjtBQUNuQixjQUFBLEVBQUUsRUFBRSxPQURlO0FBRW5CLGNBQUEsSUFBSSxFQUFFLE9BRmE7QUFHbkIsY0FBQSxRQUFRLEVBQUUsUUFIUztBQUluQixjQUFBLE9BQU8sRUFBRTtBQUpVLGFBQXZCO0FBTUEsWUFBQSxPQUFPO0FBQ1Y7O0FBRUQsVUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVO0FBQ04sWUFBQSxFQUFFLEVBQUUsS0FERTtBQUVOLFlBQUEsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFELENBRko7QUFHTixZQUFBLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBRCxDQUhSO0FBSU4sWUFBQSxPQUFPLEVBQUUsSUFBSSxDQUFDLGNBQUQ7QUFKUCxXQUFWO0FBT0EsVUFBQSxLQUFLO0FBQ1I7QUF6RHNDO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBMkR2QyxVQUFJLFdBQVcsR0FBRyxpQkFBbEI7O0FBQ0EsVUFBSSxXQUFXLENBQUMsTUFBWixJQUFzQixDQUExQixFQUE2QjtBQUN6QixRQUFBLFdBQVcsR0FBRyxJQUFkO0FBQ0gsT0E5RHNDLENBK0R2QztBQUNBOzs7QUFDQSxhQUFPO0FBQ0gsUUFBQSxPQUFPLEVBQUU7QUFETixPQUFQO0FBR0g7Ozs7Ozs7Ozs7Ozs7Ozs7QUMvc0JMOzs7Ozs7OztBQUNBLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFELENBQWxCOztJQUVNLGM7QUFDRiwwQkFBWSxTQUFaLEVBQXNCO0FBQUE7O0FBQUE7O0FBQ2xCLElBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSw2Q0FBWjtBQUNBLFNBQUssU0FBTCxHQUFpQixTQUFqQjtBQUNBLFFBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxnQkFBRCxDQUFqQjs7QUFDQSxRQUFHLFNBQVMsQ0FBQyxNQUFWLEdBQW1CLENBQXRCLEVBQXdCO0FBQ3BCLFdBQUssVUFBTCxHQUFrQixTQUFTLENBQUMsS0FBVixFQUFsQjtBQUNILEtBRkQsTUFFTztBQUNILFdBQUssVUFBTCxHQUFrQixDQUFDLENBQUMsd0VBQUQsQ0FBRCxDQUE0RSxRQUE1RSxDQUFxRixLQUFLLFNBQUwsQ0FBZSxVQUFwRyxDQUFsQjtBQUNIOztBQUNELFNBQUssY0FBTCxHQUFzQixDQUFDLENBQUMsMERBQUQsQ0FBRCxDQUE4RCxRQUE5RCxDQUF1RSxLQUFLLFVBQTVFLENBQXRCLENBVGtCLENBVWxCOztBQUNBLFNBQUssU0FBTCxDQUFlLFVBQWYsQ0FBMEIsRUFBMUIsQ0FBNkIscUJBQTdCLEVBQ0ksVUFBQyxLQUFELEVBQVEsaUJBQVI7QUFBQSxhQUE4QixLQUFJLENBQUMsT0FBTCxFQUE5QjtBQUFBLEtBREo7QUFFQSxTQUFLLFNBQUwsQ0FBZSxVQUFmLENBQTBCLEVBQTFCLENBQTZCLHdCQUE3QixFQUNJLFVBQUMsS0FBRCxFQUFRLFVBQVI7QUFBQSxhQUF1QixLQUFJLENBQUMsT0FBTCxFQUF2QjtBQUFBLEtBREo7QUFFQSxTQUFLLFNBQUwsQ0FBZSxVQUFmLENBQTBCLEVBQTFCLENBQTZCLHFCQUE3QixFQUNJLFVBQUMsS0FBRCxFQUFRLEVBQVI7QUFBQSxhQUFlLEtBQUksQ0FBQyxPQUFMLEVBQWY7QUFBQSxLQURKO0FBR0g7Ozs7OEJBRVE7QUFDTCxXQUFLLGNBQUwsQ0FBb0IsS0FBcEIsR0FESyxDQUVMO0FBRUE7QUFDQTtBQUNBO0FBRUE7O0FBQ0EsVUFBSSxPQUFPLEdBQUcsS0FBSyxTQUFMLENBQWUsY0FBZixFQUFkOztBQUNBLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQTVCLEVBQW9DLENBQUMsRUFBckMsRUFBd0M7QUFDcEMsYUFBSyxjQUFMLENBQW9CLE1BQXBCLENBQTJCLEtBQUssYUFBTCxDQUFtQixLQUFLLFNBQXhCLEVBQW1DLE9BQU8sQ0FBQyxDQUFELENBQTFDLEVBQStDLENBQS9DLENBQTNCO0FBQ0g7QUFDSjs7O2tDQUVhLFMsRUFBVyxVLEVBQVc7QUFDaEM7QUFDQSxVQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsMENBQXdDLFVBQVUsQ0FBQyxPQUFYLENBQW1CLEtBQTNELEdBQWlFLGNBQWpFLEdBQWdGLFVBQVUsQ0FBQyxJQUFYLENBQWdCLElBQWhCLENBQXFCLElBQXJCLEVBQTJCLE9BQTNCLENBQW1DLEdBQW5DLEVBQXdDLEtBQXhDLENBQWhGLEdBQStILFNBQWhJLENBQWQsQ0FGZ0MsQ0FHaEM7O0FBRUEsVUFBSSxVQUFVLEdBQUcsNEJBQWlCLFVBQVUsQ0FBQyxTQUE1QixJQUF5QyxLQUF6QyxHQUFpRCw0QkFBaUIsVUFBVSxDQUFDLE9BQTVCLENBQWxFLENBTGdDLENBT2hDOztBQUNBLFVBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyx5REFBdUQsVUFBdkQsR0FBa0UsVUFBbkUsQ0FBZjtBQUNBLE1BQUEsT0FBTyxDQUFDLEtBQVIsQ0FBZSxVQUFDLEtBQUQsRUFBVztBQUN0QixRQUFBLEtBQUssQ0FBQyxjQUFOO0FBQ0EsUUFBQSxTQUFTLENBQUMsTUFBVixDQUFpQixZQUFqQixDQUE4QixXQUE5QixHQUE0QyxVQUFVLENBQUMsU0FBdkQsQ0FGc0IsQ0FHdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLFFBQUEsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsSUFBakI7QUFDQSxRQUFBLFNBQVMsQ0FBQyxNQUFWLENBQWlCLE9BQWpCLEdBQTJCLFVBQVUsQ0FBQyxPQUF0Qzs7QUFDQSxZQUFHLFVBQVUsQ0FBQyxTQUFYLEdBQXFCLENBQXJCLEdBQXlCLFVBQVUsQ0FBQyxPQUF2QyxFQUErQztBQUMzQyxVQUFBLFNBQVMsQ0FBQyxNQUFWLENBQWlCLEtBQWpCO0FBQ0g7QUFDSixPQWREO0FBZ0JBLE1BQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxPQUFkO0FBQ0EsVUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLFNBQUQsQ0FBaEI7QUFFQSxNQUFBLFFBQVEsQ0FBQyxNQUFULENBQWdCLG1CQUFtQixVQUFVLENBQUMsSUFBWCxDQUFnQixNQUFoQixDQUF1QixVQUFBLElBQUk7QUFBQSxlQUFJLElBQUksQ0FBQyxPQUFMLEtBQWlCLFlBQXJCO0FBQUEsT0FBM0IsRUFBOEQsQ0FBOUQsRUFBaUUsS0FBcEc7QUFDQSxNQUFBLFFBQVEsQ0FBQyxNQUFULENBQWdCLE1BQWhCO0FBQ0EsTUFBQSxRQUFRLENBQUMsTUFBVCxDQUFnQixtQkFBbUIsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBbkM7QUFDQSxNQUFBLFFBQVEsQ0FBQyxNQUFULENBQWdCLE1BQWhCO0FBRUEsTUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLFFBQWQ7QUFDQSxNQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLFNBQVMsQ0FBQyxlQUExQixFQWxDZ0MsQ0FtQ2hDOztBQUNBLGFBQU8sTUFBUDtBQUNIOzs7Ozs7Ozs7Ozs7Ozs7O0FDNUVMOzs7Ozs7OztBQUNBLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFELENBQWxCOztJQUVNLGE7QUFDRix5QkFBWSxTQUFaLEVBQXNCO0FBQUE7O0FBQ2xCLFNBQUssU0FBTCxHQUFpQixTQUFqQjtBQUNBLFFBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxlQUFELENBQWpCOztBQUNBLFFBQUcsU0FBUyxDQUFDLE1BQVYsR0FBbUIsQ0FBdEIsRUFBd0I7QUFDcEIsV0FBSyxVQUFMLEdBQWtCLFNBQVMsQ0FBQyxLQUFWLEVBQWxCO0FBQ0gsS0FGRCxNQUVPO0FBQ0gsV0FBSyxVQUFMLEdBQWtCLENBQUMsQ0FBQyx3RUFBRCxDQUFELENBQTRFLFFBQTVFLENBQXFGLEtBQUssU0FBTCxDQUFlLFVBQXBHLENBQWxCO0FBQ0g7QUFDSjs7Ozs0QkFFTyxXLEVBQWEsYyxFQUFlO0FBQ2hDLFVBQUcsY0FBSCxFQUFtQixLQUFLLFVBQUwsQ0FBZ0IsS0FBaEI7QUFDbkIsVUFBRyxLQUFLLFNBQUwsQ0FBZSxVQUFsQixFQUE4QixLQUFLLFNBQUwsQ0FBZSxVQUFmLENBQTBCLEtBQUssU0FBL0IsRUFGRSxDQUloQztBQUNBO0FBQ0E7QUFFQTs7QUFDQSxVQUFJLFFBQVEsR0FBRyxLQUFLLFNBQUwsQ0FBZSxRQUFmLEtBQTRCLEtBQTVCLEdBQW9DLEtBQUssYUFBekMsR0FBeUQsS0FBSyxTQUFMLENBQWUsUUFBdkY7O0FBQ0EsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBaEMsRUFBd0MsQ0FBQyxFQUF6QyxFQUE0QztBQUN4QyxhQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBdUIsUUFBUSxDQUFDLEtBQUssU0FBTixFQUFpQixXQUFXLENBQUMsQ0FBRCxDQUE1QixFQUFpQyxDQUFqQyxDQUEvQjtBQUNIO0FBQ0o7OztrQ0FFYSxTLEVBQVcsVSxFQUFZLEssRUFBTTtBQUN2QyxVQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBRCxDQUFELENBQWEsUUFBYixDQUFzQixDQUFDLENBQUMsYUFBRCxDQUFELENBQWlCLFFBQWpCLENBQTBCLFNBQVMsQ0FBQyxVQUFwQyxDQUF0QixDQUFiLENBRHVDLENBRXZDO0FBRUE7O0FBQ0EsVUFBSSxPQUFPLEdBQUcsQ0FBQyx5QkFBa0IsS0FBSyxHQUFHLENBQTFCLGVBQWY7O0FBQ0EsVUFBRyxTQUFTLENBQUMsU0FBVixJQUFxQixLQUF4QixFQUE4QjtBQUMxQixRQUFBLE9BQU8sR0FBRyxDQUFDLDREQUFxRCxLQUFLLEdBQUcsQ0FBN0QsbUJBQVg7QUFDQSxRQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWUsVUFBQyxLQUFELEVBQVc7QUFDdEIsVUFBQSxLQUFLLENBQUMsY0FBTjtBQUNBLFVBQUEsU0FBUyxDQUFDLEdBQVYsQ0FBYyxZQUFkLENBQTJCLFVBQTNCO0FBQ0gsU0FIRDtBQUlIOztBQUVELE1BQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxPQUFkO0FBQ0EsVUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLFNBQUQsQ0FBaEI7O0FBRUEsVUFBSSxlQUFlLE9BQU8sVUFBVSxDQUFDLEtBQXJDLEVBQTZDO0FBQUU7QUFDM0MsWUFBSSxlQUFlLEdBQUcsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsTUFBaEIsQ0FBdUIsVUFBQSxJQUFJO0FBQUEsaUJBQUksSUFBSSxDQUFDLE9BQUwsS0FBaUIsWUFBckI7QUFBQSxTQUEzQixFQUE4RCxDQUE5RCxDQUF0QjtBQUNBLFlBQUksa0JBQWtCLEdBQUksVUFBVSxDQUFDLE9BQVgsSUFBc0IsSUFBdkIsR0FBK0IsVUFBVSxDQUFDLE9BQTFDLEdBQW9ELEVBQTdFO0FBQ0gsT0FIRCxNQUdPO0FBQUU7QUFDTCxZQUFJLGVBQWUsR0FBRyxVQUFVLENBQUMsS0FBWCxDQUFpQixDQUFqQixFQUFvQixLQUFwQixDQUEwQixDQUExQixFQUE2QixLQUE3QixDQUFtQyxDQUFuQyxFQUFzQyxJQUF0QyxDQUEyQyxNQUEzQyxDQUFrRCxVQUFBLElBQUk7QUFBQSxpQkFBSSxJQUFJLENBQUMsT0FBTCxLQUFpQixZQUFyQjtBQUFBLFNBQXRELEVBQXlGLENBQXpGLENBQXRCO0FBQ0EsWUFBSSxrQkFBa0IsR0FBRyxVQUFVLENBQUMsS0FBWCxDQUFpQixDQUFqQixFQUFvQixLQUFwQixDQUEwQixDQUExQixFQUE2QixLQUE3QixDQUFtQyxDQUFuQyxFQUFzQyxPQUEvRDtBQUNIOztBQUVELE1BQUEsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsbUJBQW1CLGVBQWUsQ0FBQyxLQUFuRDtBQUNBLE1BQUEsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsTUFBaEI7QUFDQSxNQUFBLFFBQVEsQ0FBQyxNQUFULENBQWdCLG1CQUFtQixVQUFVLENBQUMsSUFBWCxDQUFnQixJQUFoQixDQUFxQixJQUFyQixDQUFuQztBQUNBLE1BQUEsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsTUFBaEI7QUFDQSxNQUFBLFFBQVEsQ0FBQyxNQUFULENBQWdCLG1CQUNOLDRCQUFpQixVQUFVLENBQUMsU0FBNUIsQ0FETSxHQUVOLEtBRk0sR0FHTiw0QkFBaUIsVUFBVSxDQUFDLE9BQTVCLENBSFY7QUFJQSxNQUFBLFFBQVEsQ0FBQyxNQUFULENBQWdCLE1BQWhCO0FBRUEsTUFBQSxRQUFRLENBQUMsTUFBVCxDQUFnQix3QkFDSixlQUFlLE9BQU8sa0JBQWtCLENBQUMsUUFBekMsSUFBc0Qsa0JBQWtCLENBQUMsUUFBbkIsQ0FBNEIsTUFBbkYsR0FBNkYsa0JBQWtCLENBQUMsUUFBaEgsR0FBMkgsc0JBRHRILENBQWhCLEVBbkN1QyxDQXVDdkM7O0FBRUEsTUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLFFBQWQ7QUFDQSxhQUFPLE1BQVA7QUFDSDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQ3ZFQyxjO0FBQ0YsMEJBQVksU0FBWixFQUFzQjtBQUFBOztBQUNsQixTQUFLLFNBQUwsR0FBaUIsU0FBakI7QUFFQSxTQUFLLFVBQUwsR0FBa0IsQ0FBQyxDQUFDLDZDQUFELENBQW5CO0FBQ0EsU0FBSyxVQUFMLENBQWdCLFFBQWhCLENBQXlCLEtBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsVUFBL0M7QUFFQSxTQUFLLEtBQUwsR0FBYSxDQUFDLENBQUMsK0RBQUQsQ0FBRCxDQUFtRSxRQUFuRSxDQUE0RSxLQUFLLFVBQWpGLENBQWI7QUFDQSxTQUFLLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FBd0IsQ0FBeEI7QUFFSDs7Ozs4QkFFUyxPLEVBQXdCO0FBQUEsVUFBZixRQUFlLHVFQUFKLEdBQUk7QUFDOUIsV0FBSyxVQUFMLENBQWdCLFFBQWhCLENBQXlCLCtCQUF6Qjs7QUFFQSxXQUFLLFNBQUwsQ0FBZSxPQUFmLEVBQXdCLFFBQXhCO0FBQ0g7OztnQ0FFVyxPLEVBQXdCO0FBQUEsVUFBZixRQUFlLHVFQUFKLEdBQUk7QUFDaEMsV0FBSyxVQUFMLENBQWdCLFdBQWhCLENBQTRCLCtCQUE1Qjs7QUFFQSxXQUFLLFNBQUwsQ0FBZSxPQUFmLEVBQXdCLFFBQXhCO0FBQ0g7Ozs4QkFFUyxPLEVBQXdCO0FBQUEsVUFBZixRQUFlLHVFQUFKLEdBQUk7QUFDOUIsV0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixPQUFoQixFQUQ4QixDQUU5Qjs7QUFDQSxXQUFLLFVBQUwsQ0FBZ0IsTUFBaEI7QUFDQSxXQUFLLFVBQUwsQ0FDSSxNQURKLENBQ1csQ0FEWCxFQUVJLEtBRkosQ0FFVSxRQUFRLEdBQUcsSUFGckIsRUFHSSxPQUhKLENBR1ksR0FIWjtBQUlIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDaENMOzs7Ozs7O0lBT00sYTtBQUNGLHlCQUFZLFNBQVosRUFBc0I7QUFBQTs7QUFBQTs7QUFDbEIsU0FBSyxTQUFMLEdBQWlCLFNBQWpCO0FBQ0EsU0FBSyxLQUFMLEdBQWEsVUFBYjtBQUNBLFNBQUssWUFBTCxHQUFvQixFQUFwQjtBQUNBLFNBQUssU0FBTCxHQUFpQixFQUFqQjtBQUNBLFNBQUssZ0JBQUwsR0FBd0IsRUFBeEIsQ0FMa0IsQ0FPbEI7O0FBQ0EsU0FBSyxhQUFMLEdBQXFCLENBQUMsQ0FBQyxtRUFBRCxDQUFELENBQXVFLFFBQXZFLENBQWdGLEtBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsVUFBdEcsQ0FBckIsQ0FSa0IsQ0FTbEI7O0FBQ0EsU0FBSyxhQUFMLENBQW1CLEtBQW5CLENBQXlCLFVBQUMsS0FBRCxFQUFXO0FBQ2hDLE1BQUEsS0FBSSxDQUFDLGNBQUwsQ0FBb0IsS0FBcEI7QUFDSCxLQUZELEVBVmtCLENBY2xCOztBQUNBLFNBQUssVUFBTCxHQUFrQixFQUFsQixDQWZrQixDQWlCbEI7O0FBQ0EsU0FBSyxLQUFMLEdBQWEsQ0FBQyxDQUFDLHVDQUFELENBQUQsQ0FBMkMsUUFBM0MsQ0FBb0QsS0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixVQUExRSxDQUFiO0FBQ0EsU0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLFNBQWYsRUFBMEIsS0FBSyxLQUFMLEdBQWEsQ0FBdkM7QUFFQSxTQUFLLGFBQUw7QUFDQSxTQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLFVBQXRCLENBQWlDLEVBQWpDLENBQW9DLG9CQUFwQyxFQUEwRCxVQUFDLEtBQUQsRUFBUSxhQUFSO0FBQUEsYUFBMEIsS0FBSSxDQUFDLGFBQUwsRUFBMUI7QUFBQSxLQUExRCxFQXRCa0IsQ0F3QmxCOztBQUNBLFNBQUssSUFBTCxHQUFZLENBQUMsQ0FBQyxxQ0FBRCxDQUFELENBQXlDLFFBQXpDLENBQWtELEtBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsVUFBeEUsQ0FBWjtBQUNBLFNBQUssWUFBTCxHQUFvQixDQUFDLENBQUMsa0NBQUQsQ0FBRCxDQUFzQyxRQUF0QyxDQUErQyxLQUFLLElBQXBELENBQXBCLENBMUJrQixDQTJCbEI7QUFDQTtBQUdBOztBQUNBLFNBQUssY0FBTCxHQUFzQixDQUFDLENBQUMsa0NBQUQsQ0FBRCxDQUFzQyxNQUF0QyxDQUE2QztBQUMvRCxNQUFBLElBQUksRUFBRSxvQkFEeUQ7QUFFL0QsTUFBQSxTQUFTLEVBQUU7QUFGb0QsS0FBN0MsRUFHbkIsS0FIbUIsQ0FHYixZQUFNO0FBQ1g7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUEsS0FBSSxDQUFDLFNBQUwsQ0FBZSxhQUFmLENBQTZCLEtBQUksQ0FBQyxTQUFMLENBQWUsVUFBZixDQUEwQixPQUExQixFQUE3QjtBQUVILEtBckJxQixDQUF0QjtBQXNCQSxTQUFLLGNBQUwsQ0FBb0IsR0FBcEIsQ0FBd0IsY0FBeEIsRUFBd0MsTUFBeEM7QUFDQSxTQUFLLGNBQUwsQ0FBb0IsSUFBcEIsQ0FBeUIsT0FBekIsRUFBa0MsaUJBQWxDLEVBdkRrQixDQXdEbEI7QUFFQTs7QUFDQSxTQUFLLFdBQUwsR0FBbUIsQ0FBQyxDQUFDLG9DQUFELENBQUQsQ0FBd0MsTUFBeEMsQ0FBK0M7QUFDOUQsTUFBQSxJQUFJLEVBQUUsWUFEd0Q7QUFFOUQsTUFBQSxTQUFTLEVBQUU7QUFGbUQsS0FBL0MsQ0FBbkI7QUFJQSxTQUFLLFdBQUwsQ0FBaUIsR0FBakIsQ0FBcUIsY0FBckIsRUFBcUMsTUFBckM7QUFDQSxTQUFLLFdBQUwsQ0FBaUIsSUFBakIsQ0FBc0IsT0FBdEIsRUFBK0IsbUJBQS9CO0FBQ0EsU0FBSyxXQUFMLENBQWlCLEtBQWpCLENBQXVCLFlBQU07QUFDekIsTUFBQSxLQUFJLENBQUMsb0JBQUw7QUFDSCxLQUZELEVBakVrQixDQW9FbEI7QUFFQTs7QUFDQSxTQUFLLGNBQUwsR0FBc0IsQ0FBQyxDQUFDLGlDQUFELENBQUQsQ0FBcUMsTUFBckMsQ0FBNEM7QUFDOUQsTUFBQSxJQUFJLEVBQUUsYUFEd0Q7QUFFOUQsTUFBQSxTQUFTLEVBQUU7QUFGbUQsS0FBNUMsQ0FBdEI7QUFJQSxTQUFLLGNBQUwsQ0FBb0IsSUFBcEIsQ0FBeUIsT0FBekIsRUFBa0MsZ0JBQWxDO0FBQ0EsU0FBSyxjQUFMLENBQW9CLFFBQXBCLENBQTZCLHdCQUE3QjtBQUNBLFNBQUssY0FBTCxDQUFvQixLQUFwQixDQUEwQixZQUFNO0FBQzVCLE1BQUEsS0FBSSxDQUFDLFlBQUwsR0FBb0IsS0FBSSxDQUFDLE9BQUwsRUFBcEI7O0FBQ0EsTUFBQSxLQUFJLENBQUMsSUFBTDs7QUFDQSxNQUFBLEtBQUksQ0FBQyxTQUFMLENBQWUsVUFBZixDQUEwQixPQUExQixDQUFrQyx1QkFBbEM7QUFDSCxLQUpELEVBN0VrQixDQWtGbEI7QUFFQTs7QUFDQSxTQUFLLGFBQUwsR0FBcUIsQ0FBQyxDQUFDLHVDQUFELENBQUQsQ0FBMkMsTUFBM0MsQ0FBa0Q7QUFDbkUsTUFBQSxJQUFJLEVBQUUsY0FENkQ7QUFFbkUsTUFBQSxTQUFTLEVBQUU7QUFGd0QsS0FBbEQsQ0FBckI7QUFJQSxTQUFLLGFBQUwsQ0FBbUIsUUFBbkIsQ0FBNEIsdUJBQTVCO0FBQ0EsU0FBSyxhQUFMLENBQW1CLElBQW5CLENBQXdCLE9BQXhCLEVBQWlDLHNCQUFqQztBQUNBLFNBQUssYUFBTCxDQUFtQixLQUFuQixDQUF5QixZQUFNO0FBQzNCO0FBQ0EsTUFBQSxLQUFJLENBQUMsT0FBTDs7QUFDQSxNQUFBLEtBQUksQ0FBQyxJQUFMOztBQUNBLE1BQUEsS0FBSSxDQUFDLFNBQUwsQ0FBZSxVQUFmLENBQTBCLE9BQTFCLENBQWtDLHVCQUFsQztBQUNILEtBTEQsRUEzRmtCLENBaUdsQjs7QUFFQSxJQUFBLENBQUMsQ0FBQyxNQUFELENBQUQsQ0FBVSxNQUFWLENBQWlCO0FBQUEsYUFBTSxLQUFJLENBQUMsYUFBTCxFQUFOO0FBQUEsS0FBakI7QUFHQTs7OztBQUdBLFNBQUssV0FBTCxHQUFtQixDQUFDLENBQUMsb0ZBQUQsQ0FBRCxDQUF3RixRQUF4RixDQUFpRyxLQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLFVBQXZILENBQW5CO0FBQ0EsU0FBSyxXQUFMLENBQWlCLFNBQWpCO0FBQ0EsU0FBSyxXQUFMLENBQWlCLEdBQWpCLENBQXFCLFNBQXJCLEVBQWdDLEtBQUssS0FBTCxHQUFhLEdBQTdDO0FBQ0EsU0FBSyxXQUFMLENBQWlCLEtBQWpCLENBQXVCLFVBQUMsS0FBRCxFQUFXO0FBQzlCLE1BQUEsS0FBSSxDQUFDLGNBQUwsQ0FBb0IsS0FBcEI7QUFDSCxLQUZEO0FBSUEsU0FBSyxNQUFMLEdBQWMsQ0FBQyxDQUFDLHVCQUFELENBQWY7QUFDQSxTQUFLLGVBQUwsQ0FBcUIsS0FBSyxNQUExQixFQUFrQyxLQUFLLFdBQXZDLEVBQW9ELENBQXBELEVBQXVELFVBQXZELEVBakhrQixDQW1IbEI7O0FBQ0EsU0FBSyxZQUFMLEdBQW9CLENBQUMsQ0FBQyxvQ0FBRCxDQUFELENBQXdDLE1BQXhDLENBQStDO0FBQy9ELE1BQUEsSUFBSSxFQUFFLFlBRHlEO0FBRS9ELE1BQUEsU0FBUyxFQUFFO0FBRm9ELEtBQS9DLENBQXBCO0FBSUEsU0FBSyxZQUFMLENBQWtCLEdBQWxCLENBQXNCLFFBQXRCLEVBQWdDLGlCQUFoQztBQUNBLFNBQUssWUFBTCxDQUFrQixJQUFsQixDQUF1QixPQUF2QixFQUFnQyxtQkFBaEM7QUFDQSxTQUFLLFlBQUwsQ0FBa0IsR0FBbEIsQ0FBc0IsU0FBdEIsRUFBaUMsS0FBSyxLQUFMLEdBQWEsR0FBOUM7QUFDQSxTQUFLLFlBQUwsQ0FBa0IsS0FBbEIsQ0FBd0IsWUFBTTtBQUMxQixNQUFBLEtBQUksQ0FBQyxvQkFBTDtBQUNILEtBRkQ7QUFHQSxTQUFLLGVBQUwsQ0FBcUIsS0FBSyxZQUExQixFQUF3QyxLQUFLLFdBQTdDLEVBQTBELENBQTFELEVBQTZELFVBQTdELEVBOUhrQixDQWdJbEI7O0FBQ0EsU0FBSyxlQUFMLEdBQXVCLENBQUMsQ0FBQyxrQ0FBRCxDQUFELENBQXNDLE1BQXRDLENBQTZDO0FBQ2hFLE1BQUEsSUFBSSxFQUFFLG9CQUQwRDtBQUVoRSxNQUFBLFNBQVMsRUFBRTtBQUZxRCxLQUE3QyxFQUdwQixLQUhvQixDQUdkLFlBQU07QUFDWDtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFBLEtBQUksQ0FBQyxhQUFMLEdBbEJXLENBbUJYOztBQUNILEtBdkJzQixDQUF2QjtBQXdCQSxTQUFLLGVBQUwsQ0FBcUIsR0FBckIsQ0FBeUIsUUFBekIsRUFBbUMsaUJBQW5DO0FBQ0EsU0FBSyxlQUFMLENBQXFCLElBQXJCLENBQTBCLE9BQTFCLEVBQW1DLGlCQUFuQztBQUNBLFNBQUssZUFBTCxDQUFxQixHQUFyQixDQUF5QixTQUF6QixFQUFvQyxLQUFLLEtBQUwsR0FBYSxHQUFqRDtBQUNBLFNBQUssZUFBTCxDQUFxQixLQUFLLGVBQTFCLEVBQTJDLEtBQUssV0FBaEQsRUFBNkQsQ0FBN0QsRUFBZ0UsVUFBaEUsRUE1SmtCLENBOEpsQjs7QUFDQSxTQUFLLGNBQUwsR0FBc0IsQ0FBQyxDQUFDLHVDQUFELENBQUQsQ0FBMkMsTUFBM0MsQ0FBa0Q7QUFDcEUsTUFBQSxJQUFJLEVBQUUsY0FEOEQ7QUFFcEUsTUFBQSxTQUFTLEVBQUU7QUFGeUQsS0FBbEQsQ0FBdEI7QUFJQSxTQUFLLGNBQUwsQ0FBb0IsR0FBcEIsQ0FBd0IsUUFBeEIsRUFBa0MsaUJBQWxDO0FBQ0EsU0FBSyxjQUFMLENBQW9CLFFBQXBCLENBQTZCLHVCQUE3QjtBQUNBLFNBQUssY0FBTCxDQUFvQixJQUFwQixDQUF5QixPQUF6QixFQUFrQyxzQkFBbEM7QUFDQSxTQUFLLGNBQUwsQ0FBb0IsS0FBcEIsQ0FBMEIsWUFBTTtBQUM1QjtBQUNBLE1BQUEsS0FBSSxDQUFDLE9BQUw7O0FBQ0EsTUFBQSxLQUFJLENBQUMsSUFBTDs7QUFDQSxNQUFBLEtBQUksQ0FBQyxTQUFMLENBQWUsVUFBZixDQUEwQixPQUExQixDQUFrQyx1QkFBbEM7QUFDSCxLQUxEO0FBTUEsU0FBSyxlQUFMLENBQXFCLEtBQUssY0FBMUIsRUFBMEMsS0FBSyxXQUEvQyxFQUE0RCxDQUE1RCxFQUErRCxVQUEvRDtBQUVBLElBQUEsQ0FBQyxDQUFDLE1BQUQsQ0FBRCxDQUFVLE1BQVYsQ0FBaUI7QUFBQSxhQUFNLEtBQUksQ0FBQyxhQUFMLEVBQU47QUFBQSxLQUFqQjtBQUVBLFNBQUssSUFBTDtBQUNIOzs7O21DQUVjLEssRUFBTTtBQUNqQixVQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBUCxDQUFELENBQXVCLElBQXZCLENBQTRCLElBQTVCLEtBQXFDLGFBQXpDLEVBQXdEO0FBQ3BEO0FBQ0gsT0FIZ0IsQ0FLakI7OztBQUNBLFVBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBUCxDQUFkO0FBQ0EsVUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQU4sR0FBYyxNQUFNLENBQUMsTUFBUCxHQUFnQixJQUF0QztBQUNBLFVBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFOLEdBQWMsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsR0FBdEM7QUFFQSxVQUFJLFFBQVEsR0FBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQVAsRUFBTCxHQUF1QixHQUF0QztBQUNBLFVBQUksUUFBUSxHQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBUCxFQUFMLEdBQXdCLEdBQXZDO0FBRUEsV0FBSyxhQUFMLENBQW1CLFFBQW5CLEVBQTZCLFFBQTdCLEVBYmlCLENBZWpCOztBQUNBLFdBQUssa0JBQUw7QUFDSDtBQUVEOzs7Ozs7O2tDQUljLFEsRUFBVSxRLEVBQVM7QUFBQTs7QUFDN0IsVUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLGdDQUFELENBQW5CO0FBQ0EsTUFBQSxXQUFXLENBQUMsUUFBWixDQUFxQixLQUFLLGFBQTFCO0FBQ0EsTUFBQSxXQUFXLENBQUMsR0FBWixDQUFnQixVQUFoQixFQUE0QixVQUE1QixFQUg2QixDQUs3Qjs7QUFDQSxVQUFJLFdBQVcsR0FBSSxXQUFXLENBQUMsVUFBWixLQUEyQixLQUFLLGFBQUwsQ0FBbUIsS0FBbkIsRUFBNUIsR0FBMEQsR0FBNUU7QUFDQSxVQUFJLFdBQVcsR0FBSSxXQUFXLENBQUMsV0FBWixLQUE0QixLQUFLLGFBQUwsQ0FBbUIsTUFBbkIsRUFBN0IsR0FBNEQsR0FBOUUsQ0FQNkIsQ0FRN0I7O0FBQ0EsTUFBQSxXQUFXLENBQUMsR0FBWixDQUFnQixNQUFoQixFQUF3QixDQUFDLFFBQVEsR0FBSSxXQUFXLEdBQUcsQ0FBM0IsRUFBK0IsUUFBL0IsS0FBNEMsR0FBcEU7QUFDQSxNQUFBLFdBQVcsQ0FBQyxHQUFaLENBQWdCLEtBQWhCLEVBQXVCLENBQUMsUUFBUSxHQUFJLFdBQVcsR0FBRyxDQUEzQixFQUErQixRQUEvQixLQUE0QyxHQUFuRSxFQVY2QixDQVc3Qjs7QUFHQSxNQUFBLFdBQVcsQ0FBQyxTQUFaLENBQXNCO0FBQ2xCO0FBQ0EsUUFBQSxJQUFJLEVBQUUsZ0JBQU07QUFDUjtBQUNBO0FBQ0EsY0FBSSxDQUFDLEdBQUssTUFBTSxVQUFVLENBQUMsV0FBVyxDQUFDLEdBQVosQ0FBZ0IsTUFBaEIsQ0FBRCxDQUFoQixHQUE0QyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQVosR0FBcUIsR0FBckIsQ0FBeUIsT0FBekIsQ0FBRCxDQUF4RCxHQUErRixHQUF2RztBQUNBLGNBQUksQ0FBQyxHQUFLLE1BQU0sVUFBVSxDQUFDLFdBQVcsQ0FBQyxHQUFaLENBQWdCLEtBQWhCLENBQUQsQ0FBaEIsR0FBMkMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFaLEdBQXFCLEdBQXJCLENBQXlCLFFBQXpCLENBQUQsQ0FBdkQsR0FBK0YsR0FBdkc7QUFDQSxVQUFBLFdBQVcsQ0FBQyxHQUFaLENBQWdCLE1BQWhCLEVBQXlCLENBQXpCO0FBQ0EsVUFBQSxXQUFXLENBQUMsR0FBWixDQUFnQixLQUFoQixFQUF3QixDQUF4Qjs7QUFDQSxVQUFBLE1BQUksQ0FBQyxrQkFBTDtBQUNIO0FBVmlCLE9BQXRCO0FBWUEsTUFBQSxXQUFXLENBQUMsS0FBWixDQUFrQixVQUFDLEtBQUQsRUFBVztBQUN6QjtBQUNBLFFBQUEsS0FBSyxDQUFDLGVBQU47QUFDQSxRQUFBLFdBQVcsQ0FBQyxNQUFaOztBQUNBLFFBQUEsTUFBSSxDQUFDLFlBQUwsQ0FBa0IsTUFBbEIsQ0FBeUIsTUFBSSxDQUFDLFlBQUwsQ0FBa0IsT0FBbEIsQ0FBMEIsV0FBMUIsQ0FBekIsRUFBaUUsQ0FBakU7O0FBQ0EsUUFBQSxNQUFJLENBQUMsa0JBQUw7O0FBQ0EsUUFBQSxNQUFJLENBQUMsd0JBQUw7QUFDSCxPQVBEO0FBU0EsV0FBSyxZQUFMLENBQWtCLElBQWxCLENBQXVCLFdBQXZCLEVBbkM2QixDQXFDN0I7O0FBQ0EsV0FBSyx3QkFBTDtBQUNIO0FBRUQ7Ozs7Ozs7MkNBSXNCO0FBQ2xCLFVBQUksUUFBUSxHQUFHLEtBQUssWUFBTCxDQUFrQixHQUFsQixFQUFmO0FBQ0EsTUFBQSxRQUFRLENBQUMsTUFBVDtBQUNBLFdBQUssa0JBQUw7QUFDQSxXQUFLLHdCQUFMO0FBQ0g7QUFFRDs7Ozs7Ozs7d0NBS29CLFcsRUFBWTtBQUM1QixVQUFJLFVBQVUsR0FBSSxXQUFXLENBQUMsUUFBWixHQUF1QixHQUF2QixHQUE2QixXQUFXLENBQUMsTUFBWixHQUFxQixNQUFyQixFQUE5QixHQUErRCxHQUFoRjtBQUNBLFVBQUksV0FBVyxHQUFJLFdBQVcsQ0FBQyxRQUFaLEdBQXVCLElBQXZCLEdBQThCLFdBQVcsQ0FBQyxNQUFaLEdBQXFCLEtBQXJCLEVBQS9CLEdBQStELEdBQWpGLENBRjRCLENBSTVCOztBQUNBLFVBQUksV0FBVyxHQUFJLFdBQVcsQ0FBQyxVQUFaLEtBQTJCLFdBQVcsQ0FBQyxNQUFaLEdBQXFCLEtBQXJCLEVBQTVCLEdBQTRELEdBQTlFO0FBQ0EsVUFBSSxXQUFXLEdBQUksV0FBVyxDQUFDLFdBQVosS0FBNEIsV0FBVyxDQUFDLE1BQVosR0FBcUIsTUFBckIsRUFBN0IsR0FBOEQsR0FBaEY7QUFFQSxhQUFPO0FBQ0gsUUFBQSxDQUFDLEVBQUUsV0FBVyxHQUFJLFdBQVcsR0FBRyxHQUQ3QjtBQUVILFFBQUEsQ0FBQyxFQUFFLFVBQVUsR0FBSSxXQUFXLEdBQUc7QUFGNUIsT0FBUDtBQUlIOzs7NEJBRU07QUFFSDtBQUZHLGlEQUdvQixLQUFLLFlBSHpCO0FBQUE7O0FBQUE7QUFHSCw0REFBeUM7QUFBQSxjQUFqQyxXQUFpQztBQUNyQyxVQUFBLFdBQVcsQ0FBQyxNQUFaO0FBQ0g7QUFMRTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1ILFdBQUssWUFBTCxHQUFvQixFQUFwQixDQU5HLENBUUg7QUFDQTtBQUNBO0FBQ0E7QUFDSDs7O29DQUVlO0FBQ1osVUFBSSxLQUFLLFVBQVQsRUFBcUI7QUFDakIsYUFBSyxVQUFMLENBQWdCLFFBQWhCLENBQXlCLEVBQXpCLEVBQTZCO0FBQ3pCLFVBQUEsUUFBUSxFQUFFO0FBRGUsU0FBN0I7QUFHSDs7QUFDRCxXQUFLLFNBQUwsR0FBaUIsRUFBakI7QUFDSDs7OzhCQUVRO0FBQ0wsV0FBSyxRQUFMLENBQWMsS0FBSyxZQUFuQjtBQUNIOzs7K0JBRXNCO0FBQUEsVUFBZCxNQUFjLHVFQUFMLElBQUs7QUFDbkIsV0FBSyxLQUFMLEdBRG1CLENBR25COztBQUNBLFVBQUcsTUFBTSxJQUFJLElBQWIsRUFBa0I7QUFDZDtBQURjLG9EQUVHLE1BRkg7QUFBQTs7QUFBQTtBQUVkLGlFQUF3QjtBQUFBLGdCQUFoQixLQUFnQjtBQUNwQixpQkFBSyxhQUFMLENBQW1CLEtBQUssQ0FBQyxDQUFELENBQXhCLEVBQTZCLEtBQUssQ0FBQyxDQUFELENBQWxDO0FBQ0g7QUFKYTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBS2pCOztBQUVELFdBQUssa0JBQUw7QUFFQSxXQUFLLFlBQUwsR0FBb0IsTUFBcEI7QUFDSDs7O3NDQUVpQjtBQUFBOztBQUNkLFVBQUksS0FBSyxTQUFMLENBQWUsTUFBZixHQUF3QixDQUE1QixFQUErQjtBQUMzQixZQUFJLFlBQVksR0FBRyxLQUFLLFNBQUwsQ0FBZSxDQUFmLENBQW5CLENBRDJCLENBQ1c7QUFFdEM7O0FBQ0EsYUFBSyxVQUFMLEdBQWtCLENBQUMsQ0FBQyx3Q0FBRCxDQUFELENBQTRDLFFBQTVDLENBQXFELEtBQUssYUFBMUQsQ0FBbEI7QUFDQSxhQUFLLFVBQUwsQ0FBZ0IsR0FBaEIsQ0FBb0IsU0FBcEIsRUFBK0IsS0FBSyxLQUFMLEdBQWEsSUFBNUM7O0FBRUEsWUFBRyxZQUFZLENBQUMsTUFBYixHQUFzQixDQUF6QixFQUEyQjtBQUN2QixlQUFLLFVBQUwsQ0FBZ0IsUUFBaEIsQ0FBeUIsRUFBekIsRUFBNkI7QUFDekIsWUFBQSxRQUFRLEVBQUU7QUFEZSxXQUE3QjtBQUdBO0FBQ0g7O0FBRUQsYUFBSyxVQUFMLENBQWdCLFFBQWhCLENBQXlCLFlBQXpCLEVBQXVDO0FBQ25DLFVBQUEsWUFBWSxFQUFFLElBRHFCO0FBRW5DLFVBQUEsUUFBUSxFQUFFO0FBRnlCLFNBQXZDO0FBS0EsUUFBQSxZQUFZLENBQUMsR0FBYixDQUFpQixVQUFDLEtBQUQsRUFBVztBQUN4QixVQUFBLE1BQUksQ0FBQyxhQUFMLENBQW1CLEtBQUssQ0FBQyxDQUFELENBQXhCLEVBQTZCLEtBQUssQ0FBQyxDQUFELENBQWxDO0FBQ0gsU0FGRDtBQUdIO0FBQ0o7Ozt5Q0FFbUI7QUFBQTs7QUFFaEIsVUFBRyxLQUFLLFlBQUwsQ0FBa0IsTUFBbEIsR0FBMkIsQ0FBOUIsRUFBZ0M7QUFDNUIsYUFBSyxLQUFMLENBQVcsUUFBWCxDQUFvQixFQUFwQixFQUF3QjtBQUNwQixVQUFBLFFBQVEsRUFBRTtBQURVLFNBQXhCO0FBR0E7QUFDSDs7QUFFRCxVQUFJLE1BQU0sR0FBRyxLQUFLLFlBQUwsQ0FBa0IsR0FBbEIsQ0FBc0IsVUFBQyxNQUFELEVBQVk7QUFDM0MsWUFBSSxHQUFHLEdBQUcsTUFBSSxDQUFDLG1CQUFMLENBQXlCLE1BQXpCLENBQVY7O0FBQ0EsZUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFMLEVBQVEsR0FBRyxDQUFDLENBQVosQ0FBUDtBQUNILE9BSFksQ0FBYjtBQUtBLFdBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsTUFBcEIsRUFBNEI7QUFDeEIsUUFBQSxZQUFZLEVBQUUsSUFEVTtBQUV4QixRQUFBLFFBQVEsRUFBRTtBQUZjLE9BQTVCO0FBS0g7OzsrQ0FFeUI7QUFDdEIsV0FBSSxJQUFJLENBQUMsR0FBRyxDQUFaLEVBQWUsQ0FBQyxHQUFHLEtBQUssWUFBTCxDQUFrQixNQUFyQyxFQUE2QyxDQUFDLEVBQTlDLEVBQWlEO0FBQzdDLFlBQUksTUFBTSxHQUFHLEtBQUssWUFBTCxDQUFrQixDQUFsQixDQUFiLENBRDZDLENBRTdDOztBQUNBLFlBQUksS0FBSyxHQUFHLFNBQVo7O0FBRUEsWUFBSSxDQUFDLElBQUksS0FBSyxZQUFMLENBQWtCLE1BQWxCLEdBQTJCLENBQXBDLEVBQXVDO0FBQ25DLFVBQUEsS0FBSyxHQUFHLFNBQVI7QUFDSCxTQUZELE1BR0ssSUFBSSxDQUFDLElBQUksQ0FBVCxFQUFXO0FBQ1osVUFBQSxLQUFLLEdBQUcsU0FBUjtBQUNIOztBQUNELGFBQUssWUFBTCxDQUFrQixDQUFsQixFQUFxQixHQUFyQixDQUF5QixjQUF6QixFQUF5QyxLQUF6QztBQUNIO0FBQ0o7QUFFRDs7Ozs7Ozs4QkFJUztBQUNMO0FBQ0EsVUFBSSxNQUFNLEdBQUcsRUFBYjs7QUFGSyxrREFHWSxLQUFLLFlBSGpCO0FBQUE7O0FBQUE7QUFHTCwrREFBbUM7QUFBQSxjQUEzQixLQUEyQjtBQUMvQixjQUFJLEtBQUssR0FBRyxLQUFLLG1CQUFMLENBQXlCLEtBQXpCLENBQVo7QUFDQSxVQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBQyxLQUFLLENBQUMsQ0FBTixDQUFRLFFBQVIsRUFBRCxFQUFxQixLQUFLLENBQUMsQ0FBTixDQUFRLFFBQVIsRUFBckIsQ0FBWjtBQUNIO0FBTkk7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFRTCxhQUFPLElBQUksQ0FBQyxTQUFMLENBQWUsTUFBZixDQUFQO0FBQ0g7QUFFRDs7Ozs7OztnQ0FJWTtBQUNSLFVBQUksTUFBTSxHQUFHLEVBQWI7O0FBRFEsa0RBRVMsS0FBSyxZQUZkO0FBQUE7O0FBQUE7QUFFUiwrREFBbUM7QUFBQSxjQUEzQixLQUEyQjtBQUMvQixjQUFJLEtBQUssR0FBRyxLQUFLLG1CQUFMLENBQXlCLEtBQXpCLENBQVo7QUFDQSxVQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBQyxLQUFLLENBQUMsQ0FBUCxFQUFVLEtBQUssQ0FBQyxDQUFoQixDQUFaO0FBQ0g7QUFMTztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1SLGFBQU8sTUFBUDtBQUNIOzs7bUNBRWE7QUFDVixXQUFLLGFBQUwsQ0FBbUIsV0FBbkIsQ0FBK0IsSUFBL0I7QUFDQSxXQUFLLFdBQUwsQ0FBaUIsV0FBakIsQ0FBNkIsSUFBN0I7QUFDQSxXQUFLLEtBQUwsQ0FBVyxXQUFYLENBQXVCLElBQXZCLEVBSFUsQ0FJVjtBQUNBOztBQUNBLFdBQUssa0JBQUw7QUFDSDs7OzJCQUVLO0FBQ0YsV0FBSyxhQUFMLENBQW1CLFdBQW5CLENBQStCLEtBQS9CO0FBQ0EsV0FBSyxXQUFMLENBQWlCLFdBQWpCLENBQTZCLEtBQTdCO0FBQ0EsV0FBSyxLQUFMLENBQVcsV0FBWCxDQUF1QixLQUF2QixFQUhFLENBSUY7QUFDSDs7O29DQUVjO0FBQ1g7QUFDQSxVQUFJLFNBQVMsR0FBRyxLQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLGtCQUF0QixFQUFoQjtBQUNBLFdBQUssYUFBTCxDQUFtQixHQUFuQixDQUF1QixPQUF2QixFQUFnQyxTQUFTLENBQUMsS0FBMUM7QUFDQSxXQUFLLGFBQUwsQ0FBbUIsR0FBbkIsQ0FBdUIsUUFBdkIsRUFBaUMsU0FBUyxDQUFDLE1BQTNDO0FBRUEsVUFBSSxVQUFVLEdBQUcsQ0FBQyxLQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLE1BQXRCLENBQTZCLE1BQTdCLEtBQXdDLFNBQVMsQ0FBQyxNQUFuRCxJQUE2RCxDQUE5RTtBQUNBLFdBQUssYUFBTCxDQUFtQixHQUFuQixDQUF1QixLQUF2QixFQUE4QixVQUE5QjtBQUVBLFVBQUksU0FBUyxHQUFHLENBQUMsS0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixNQUF0QixDQUE2QixLQUE3QixLQUF1QyxTQUFTLENBQUMsS0FBbEQsSUFBMkQsQ0FBM0U7QUFDQSxXQUFLLGFBQUwsQ0FBbUIsR0FBbkIsQ0FBdUIsTUFBdkIsRUFBK0IsU0FBL0I7QUFFQSxXQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCLFNBQVMsQ0FBQyxLQUEzQjtBQUNBLFdBQUssS0FBTCxDQUFXLE1BQVgsQ0FBa0IsU0FBUyxDQUFDLE1BQTVCO0FBQ0EsV0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLEtBQWYsRUFBc0IsVUFBdEI7QUFDQSxXQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsTUFBZixFQUF1QixTQUF2QjtBQUNIOzs7b0NBRWUsUSxFQUFVLFUsRUFBWSxLLEVBQW9DO0FBQUEsVUFBN0IsYUFBNkIsdUVBQWIsWUFBYTtBQUN0RSxNQUFBLFFBQVEsQ0FBQyxHQUFULENBQWEsT0FBYixFQUFzQixLQUF0QjtBQUNBLE1BQUEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxZQUFiLEVBQTJCLGFBQTNCLEVBRnNFLENBR3RFO0FBQ0E7O0FBQ0EsTUFBQSxVQUFVLENBQUMsTUFBWCxDQUFrQixRQUFsQjtBQUNIOzs7c0NBRWdCO0FBQ2IsV0FBSyxLQUFMLENBQVcsV0FBWCxDQUF1QixJQUF2QjtBQUNIOzs7b0NBRWU7QUFFWixVQUFJLEtBQUssU0FBTCxDQUFlLE1BQWYsR0FBd0IsQ0FBNUIsRUFBK0I7QUFDM0IsYUFBSyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsYUFBSyxnQkFBTCxHQUF3QixFQUF4QjtBQUNIOztBQUVELFVBQUksQ0FBQyxLQUFLLFNBQUwsQ0FBZSxNQUFwQixFQUE0QjtBQUN4QixhQUFLLFNBQUwsQ0FBZSxDQUFmLElBQW9CLEtBQUssU0FBTCxFQUFwQjtBQUNBLGFBQUssZ0JBQUwsQ0FBc0IsQ0FBdEIsSUFBMkIsQ0FBQyxLQUFLLFlBQU4sQ0FBM0I7QUFDQSxZQUFJLEdBQUcsR0FBRyxzQ0FBVjtBQUNILE9BSkQsTUFJTztBQUNILGFBQUssU0FBTCxDQUFlLENBQWYsSUFBb0IsS0FBSyxTQUFMLEVBQXBCO0FBQ0EsYUFBSyxnQkFBTCxDQUFzQixDQUF0QixJQUEyQixDQUFDLEtBQUssWUFBTixDQUEzQjtBQUNBLFlBQUksR0FBRyxHQUFHLHVDQUFWO0FBQ0g7O0FBQ0QsV0FBSyxTQUFMLENBQWUsY0FBZixDQUE4QixXQUE5QixDQUEwQyxHQUExQztBQUVIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDaGVDLGM7QUFDRiwwQkFBWSxTQUFaLEVBQXNCO0FBQUE7O0FBQUE7O0FBQ2xCLFNBQUssU0FBTCxHQUFpQixTQUFqQjtBQUNBLFNBQUssWUFBTCxHQUFvQixFQUFwQjtBQUNBLFNBQUssV0FBTCxHQUFtQixFQUFuQjtBQUNBLFNBQUssZUFBTCxHQUF1QixFQUF2QjtBQUNBLFNBQUssS0FBTCxHQUFhLFVBQWI7QUFDQSxTQUFLLGVBQUwsR0FBdUIsRUFBdkI7QUFDQSxTQUFLLGVBQUwsR0FBdUIsRUFBdkIsQ0FQa0IsQ0FVbEI7O0FBQ0EsU0FBSyxhQUFMLEdBQXFCLENBQUMsQ0FBQywyQ0FBRCxDQUFELENBQStDLFFBQS9DLENBQXdELEtBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsVUFBOUUsQ0FBckI7QUFDQSxTQUFLLGFBQUw7QUFDQSxTQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLFVBQXRCLENBQWlDLEVBQWpDLENBQW9DLG9CQUFwQyxFQUEwRCxVQUFDLEtBQUQsRUFBUSxhQUFSO0FBQUEsYUFBMEIsS0FBSSxDQUFDLGFBQUwsRUFBMUI7QUFBQSxLQUExRDtBQUVBLFNBQUssU0FBTCxDQUFlLFVBQWYsQ0FBMEIsRUFBMUIsQ0FBNkIsb0JBQTdCLEVBQW1ELFVBQUMsS0FBRCxFQUFRLFdBQVI7QUFBQSxhQUF3QixLQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosQ0FBeEI7QUFBQSxLQUFuRDtBQUNBLFNBQUssU0FBTCxHQUFpQixLQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLGtCQUF0QixFQUFqQjtBQUVBLElBQUEsQ0FBQyxDQUFDLE1BQUQsQ0FBRCxDQUFVLE1BQVYsQ0FBaUI7QUFBQSxhQUFNLEtBQUksQ0FBQyxhQUFMLEVBQU47QUFBQSxLQUFqQjtBQUNIOzs7OzJCQUVNLFcsRUFBWTtBQUNmLFdBQUssS0FBTCxHQURlLENBR2Y7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxXQUFLLElBQUksQ0FBQyxHQUFHLENBQWIsRUFBZ0IsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFoQyxFQUF3QyxDQUFDLEVBQXpDLEVBQTZDO0FBRXpDLFlBQUksb0JBQW9CLEdBQUcsV0FBVyxDQUFDLENBQUQsQ0FBWCxDQUFlLE9BQWYsRUFBM0I7O0FBQ0EsWUFBSSxvQkFBb0IsSUFBSSxJQUE1QixFQUFrQztBQUM5QjtBQUNBO0FBQ0g7O0FBRUQsWUFBSSxhQUFhLEdBQUcsV0FBVyxDQUFDLENBQUQsQ0FBWCxDQUFlLGdCQUFmLEVBQXBCO0FBRUEsWUFBSSxRQUFRLEdBQUcsV0FBVyxDQUFDLENBQUQsQ0FBWCxDQUFlLE9BQWYsR0FBeUIsV0FBVyxDQUFDLENBQUQsQ0FBWCxDQUFlLFNBQXZELENBVnlDLENBWXpDOztBQUNBLFlBQUksSUFBSSxTQUFSOztBQUNBLFlBQUksS0FBSyxXQUFMLENBQWlCLE1BQWpCLElBQTJCLENBQS9CLEVBQWtDO0FBQzlCLFVBQUEsSUFBSSxHQUFHLFFBQVEsQ0FBQyxlQUFULENBQXlCLDRCQUF6QixFQUF1RCxLQUF2RCxDQUFQO0FBQ0EsVUFBQSxJQUFJLENBQUMsWUFBTCxDQUFrQixPQUFsQixFQUEyQixNQUEzQjtBQUNBLFVBQUEsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsUUFBbEIsRUFBNEIsTUFBNUI7QUFDQSxVQUFBLElBQUksQ0FBQyxZQUFMLENBQWtCLFNBQWxCLEVBQTZCLGFBQTdCO0FBQ0EsVUFBQSxJQUFJLENBQUMsWUFBTCxDQUFrQixxQkFBbEIsRUFBeUMsTUFBekMsRUFMOEIsQ0FPOUI7O0FBQ0EsZUFBSyxhQUFMLENBQW1CLE1BQW5CLENBQTBCLElBQTFCO0FBQ0EsZUFBSyxXQUFMLENBQWlCLElBQWpCLENBQXNCLElBQXRCO0FBQ0gsU0FWRCxNQVVPO0FBQ0gsVUFBQSxJQUFJLEdBQUcsS0FBSyxXQUFMLENBQWlCLENBQWpCLENBQVA7QUFDSDs7QUFHRCxZQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsZUFBVCxDQUF5Qiw0QkFBekIsRUFBdUQsU0FBdkQsQ0FBZjtBQUNBLFFBQUEsUUFBUSxDQUFDLFlBQVQsQ0FBc0IsUUFBdEIsRUFBZ0MsYUFBYSxDQUFDLENBQUQsQ0FBN0M7QUFDQSxRQUFBLFFBQVEsQ0FBQyxZQUFULENBQXNCLE1BQXRCLEVBQThCLHlCQUE5QjtBQUVBLFFBQUEsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsUUFBakI7QUFFQSxZQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsZUFBVCxDQUF5Qiw0QkFBekIsRUFBdUQsU0FBdkQsQ0FBZjtBQUNBLFFBQUEsUUFBUSxDQUFDLFlBQVQsQ0FBc0IsZUFBdEIsRUFBdUMsUUFBdkM7QUFDQSxRQUFBLFFBQVEsQ0FBQyxZQUFULENBQXNCLE1BQXRCLEVBQThCLFFBQTlCO0FBQ0EsUUFBQSxRQUFRLENBQUMsWUFBVCxDQUFzQixNQUF0QixFQUE4QixhQUFhLENBQUMsQ0FBRCxDQUEzQztBQUNBLFFBQUEsUUFBUSxDQUFDLFlBQVQsQ0FBc0IsSUFBdEIsRUFBNEIsYUFBYSxDQUFDLENBQUQsQ0FBekM7QUFDQSxRQUFBLFFBQVEsQ0FBQyxZQUFULENBQXNCLE9BQXRCLEVBQStCLFlBQS9CO0FBQ0EsUUFBQSxRQUFRLENBQUMsWUFBVCxDQUFzQixLQUF0QixFQUE2QixRQUFRLEdBQUcsR0FBeEM7QUFDQSxRQUFBLFFBQVEsQ0FBQyxXQUFULENBQXFCLFFBQXJCO0FBRUEsWUFBSSxRQUFRLEdBQUc7QUFDWCxVQUFBLFVBQVUsRUFBRSxJQUREO0FBRVgsVUFBQSxPQUFPLEVBQUUsUUFGRTtBQUdYLFVBQUEsT0FBTyxFQUFFLFFBSEU7QUFJWCxVQUFBLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBRCxDQUFYLENBQWU7QUFKZixTQUFmO0FBT0EsYUFBSyxlQUFMLENBQXFCLFdBQVcsQ0FBQyxDQUFELENBQVgsQ0FBZSxFQUFwQyxJQUEwQyxRQUExQyxDQW5EeUMsQ0FxRHpDO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsYUFBSyxZQUFMLENBQWtCLElBQWxCLENBQXVCLFFBQXZCO0FBQ0EsYUFBSyxlQUFMLENBQXFCLElBQXJCLENBQTBCLFFBQTFCO0FBQ0gsT0ExRmMsQ0E0RmY7O0FBQ0g7OzsrQkFFVSxLLEVBQU87QUFDZCxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksb0JBQVo7QUFDSDs7OytCQUVVLEssRUFBTyxVLEVBQVc7QUFDekIsTUFBQSxDQUFDLENBQUMsRUFBRixDQUFLLElBQUwsQ0FBVSxNQUFWLEdBQW1CLEtBQUssS0FBTCxHQUFZLENBQS9CO0FBQ0EsTUFBQSxLQUFLLENBQUMsSUFBTixDQUFXO0FBQ1AsUUFBQSxPQUFPLEVBQUU7QUFDTCxVQUFBLEtBQUssRUFBRSxVQUFVLENBQUMsRUFEYjtBQUVMLFVBQUEsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFYLENBQWdCLE1BQWhCLENBQXVCLFVBQUEsSUFBSTtBQUFBLG1CQUFJLElBQUksQ0FBQyxPQUFMLEtBQWlCLFlBQXJCO0FBQUEsV0FBM0IsRUFBOEQsQ0FBOUQsRUFBaUU7QUFGbEUsU0FERjtBQUtQLFFBQUEsUUFBUSxFQUFFO0FBQ04sVUFBQSxFQUFFLEVBQUUsY0FERTtBQUVOLFVBQUEsRUFBRSxFQUFFLFVBRkU7QUFHTixVQUFBLE1BQU0sRUFBRSxPQUhGO0FBR1c7QUFDakIsVUFBQSxNQUFNLEVBQUU7QUFDSixZQUFBLEtBQUssRUFBRSxJQURIO0FBRUosWUFBQSxNQUFNLEVBQUUsYUFGSixDQUVrQjs7QUFGbEIsV0FKRjtBQVFOLFVBQUEsUUFBUSxFQUFFLEtBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0I7QUFSMUIsU0FMSDtBQWVQLFFBQUEsSUFBSSxFQUFFO0FBQ0YsVUFBQSxLQUFLLEVBQUUsQ0FETCxDQUNPOztBQURQLFNBZkM7QUFrQlAsUUFBQSxLQUFLLEVBQUU7QUFDSCxVQUFBLE9BQU8sRUFBRTtBQUROO0FBbEJBLE9BQVg7QUFzQkg7Ozs0QkFFTTtBQUNIO0FBQ0EsV0FBSSxJQUFJLEVBQUUsR0FBRyxDQUFiLEVBQWdCLEVBQUUsR0FBRyxLQUFLLGVBQUwsQ0FBcUIsTUFBMUMsRUFBa0QsRUFBRSxFQUFwRCxFQUF1RDtBQUNuRDtBQUNBLGFBQUssZUFBTCxDQUFxQixFQUFyQixFQUF5QixNQUF6QjtBQUNILE9BTEUsQ0FPSDs7O0FBQ0EsV0FBSSxJQUFJLEVBQUUsR0FBRyxDQUFiLEVBQWdCLEVBQUUsR0FBRyxLQUFLLFlBQUwsQ0FBa0IsTUFBdkMsRUFBK0MsRUFBRSxFQUFqRCxFQUFxRDtBQUNqRCxhQUFLLFlBQUwsQ0FBa0IsRUFBbEIsRUFBc0IsTUFBdEI7QUFDSCxPQVZFLENBWUg7OztBQUNBLFdBQUksSUFBSSxFQUFFLEdBQUcsQ0FBYixFQUFnQixFQUFFLEdBQUcsS0FBSyxXQUFMLENBQWlCLE1BQXRDLEVBQThDLEVBQUUsRUFBaEQsRUFBbUQ7QUFDL0MsYUFBSyxXQUFMLENBQWlCLEVBQWpCLEVBQXFCLE1BQXJCO0FBQ0gsT0FmRSxDQWlCSDs7O0FBQ0EsV0FBSyxlQUFMLEdBQXVCLEVBQXZCO0FBQ0EsV0FBSyxZQUFMLEdBQW9CLEVBQXBCO0FBQ0EsV0FBSyxXQUFMLEdBQW1CLEVBQW5CO0FBQ0EsV0FBSyxlQUFMLEdBQXVCLEVBQXZCO0FBRUg7OztvQ0FFYztBQUNYO0FBQ0EsVUFBSSxTQUFTLEdBQUcsS0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixrQkFBdEIsRUFBaEI7QUFDQSxXQUFLLGFBQUwsQ0FBbUIsR0FBbkIsQ0FBdUIsT0FBdkIsRUFBZ0MsU0FBUyxDQUFDLEtBQTFDO0FBQ0EsV0FBSyxhQUFMLENBQW1CLEdBQW5CLENBQXVCLFFBQXZCLEVBQWlDLFNBQVMsQ0FBQyxNQUEzQztBQUVBLFVBQUksVUFBVSxHQUFHLENBQUMsS0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixNQUF0QixDQUE2QixNQUE3QixLQUF3QyxTQUFTLENBQUMsTUFBbkQsSUFBNkQsQ0FBOUU7QUFDQSxXQUFLLGFBQUwsQ0FBbUIsR0FBbkIsQ0FBdUIsS0FBdkIsRUFBOEIsVUFBOUI7QUFFQSxVQUFJLFNBQVMsR0FBRyxDQUFDLEtBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsTUFBdEIsQ0FBNkIsS0FBN0IsS0FBdUMsU0FBUyxDQUFDLEtBQWxELElBQTJELENBQTNFO0FBQ0EsV0FBSyxhQUFMLENBQW1CLEdBQW5CLENBQXVCLE1BQXZCLEVBQStCLFNBQS9CO0FBQ0g7OztvQ0FFZTtBQUNaLGFBQU8sS0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixrQkFBdEIsRUFBUDtBQUNIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDMUxDLE87QUFDRixtQkFBWSxTQUFaLEVBQXNCO0FBQUE7O0FBQUE7O0FBQ2xCLFNBQUssU0FBTCxHQUFpQixTQUFqQjtBQUVBLFNBQUssS0FBTCxHQUFhLEVBQWIsQ0FIa0IsQ0FLbEI7O0FBQ0EsU0FBSyxRQUFMLEdBQWdCLENBQUMsQ0FBQyxxQ0FBRCxDQUFqQjtBQUNBLFNBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsVUFBdEIsQ0FBaUMsVUFBakMsQ0FBNEMsTUFBNUMsQ0FBbUQsS0FBSyxRQUF4RCxFQVBrQixDQVNsQjs7QUFDQSxTQUFLLFNBQUwsQ0FBZSxVQUFmLENBQTBCLEVBQTFCLENBQTZCLHFCQUE3QixFQUNJLFVBQUMsS0FBRCxFQUFRLGlCQUFSO0FBQUEsYUFBOEIsS0FBSSxDQUFDLGVBQUwsQ0FBcUIsaUJBQXJCLENBQTlCO0FBQUEsS0FESjtBQUdBLFNBQUssU0FBTCxDQUFlLFVBQWYsQ0FBMEIsRUFBMUIsQ0FBNkIsd0JBQTdCLEVBQ0ksVUFBQyxLQUFELEVBQVEsVUFBUjtBQUFBLGFBQXVCLEtBQUksQ0FBQyxjQUFMLENBQW9CLFVBQXBCLENBQXZCO0FBQUEsS0FESjtBQUdBLFNBQUssU0FBTCxDQUFlLFVBQWYsQ0FBMEIsRUFBMUIsQ0FBNkIscUJBQTdCLEVBQ0ksVUFBQyxLQUFELEVBQVEsRUFBUjtBQUFBLGFBQWUsS0FBSSxDQUFDLGdCQUFMLENBQXNCLEVBQXRCLENBQWY7QUFBQSxLQURKO0FBR0g7Ozs7b0NBRWUsaUIsRUFBa0I7QUFDOUIsV0FBSyxLQUFMOztBQUQ4QixpREFHUixpQkFBaUIsQ0FBQyxXQUhWO0FBQUE7O0FBQUE7QUFHOUIsNERBQW9EO0FBQUEsY0FBNUMsVUFBNEM7QUFDaEQsZUFBSyxjQUFMLENBQW9CLFVBQXBCO0FBQ0g7QUFMNkI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU1qQzs7O21DQUVjLFUsRUFBVztBQUN0QixVQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsMENBQUQsQ0FBRCxDQUE4QyxRQUE5QyxDQUF1RCxLQUFLLFFBQTVELENBQVosQ0FEc0IsQ0FHdEI7O0FBQ0EsVUFBSSxlQUFlLE9BQU8sVUFBVSxDQUFDLEtBQXJDLEVBQTZDO0FBQUU7QUFDM0MsUUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLGVBQVgsRUFBNEIsVUFBVSxDQUFDLEVBQXZDO0FBQ0gsT0FGRCxNQUVPO0FBQUU7QUFDTCxRQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsZUFBWCxFQUE0QixVQUFVLENBQUMsS0FBWCxDQUFpQixDQUFqQixFQUFvQixLQUFwQixDQUEwQixDQUExQixFQUE2QixLQUE3QixDQUFtQyxDQUFuQyxFQUFzQyxFQUFsRTtBQUNIOztBQUVELFVBQUksU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUEzQjtBQUNBLFVBQUksWUFBWSxHQUFHLFNBQVMsR0FBRyxLQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLFlBQXRCLENBQW1DLFFBQWxFO0FBQ0EsTUFBQSxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsRUFBa0IsQ0FBQyxZQUFZLEdBQUcsR0FBaEIsRUFBcUIsUUFBckIsS0FBa0MsR0FBcEQ7QUFFQSxVQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsT0FBekI7QUFDQSxVQUFJLFVBQVUsR0FBRyxPQUFPLEdBQUcsS0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixZQUF0QixDQUFtQyxRQUE5RDtBQUNBLE1BQUEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxPQUFWLEVBQW1CLENBQUMsQ0FBQyxVQUFVLEdBQUcsWUFBZCxJQUE4QixHQUEvQixFQUFvQyxRQUFwQyxLQUFpRCxHQUFwRTtBQUVBLFdBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEI7QUFDSDs7O3FDQUVnQixFLEVBQUc7QUFDaEI7QUFDQTtBQUNBLFVBQUksUUFBUSxHQUFHLEVBQWY7O0FBSGdCLGtEQUlDLEtBQUssS0FKTjtBQUFBOztBQUFBO0FBSWhCLCtEQUE0QjtBQUFBLGNBQXBCLEtBQW9CO0FBQ3hCLFVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxXQUFXLEtBQUssQ0FBQyxJQUFOLENBQVcsZUFBWCxDQUF2Qjs7QUFDQSxjQUFHLEtBQUssQ0FBQyxJQUFOLENBQVcsZUFBWCxLQUErQixFQUFsQyxFQUFxQztBQUNqQyxZQUFBLE9BQU8sQ0FBQyxHQUFSLHdCQUE0QixFQUE1QjtBQUNBLFlBQUEsS0FBSyxDQUFDLE1BQU47QUFDSCxXQUhELE1BR087QUFDSCxZQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsS0FBZDtBQUNIO0FBQ0o7QUFaZTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWFoQixXQUFLLEtBQUwsR0FBYSxRQUFiO0FBQ0g7Ozs0QkFFTTtBQUFBLGtEQUNjLEtBQUssS0FEbkI7QUFBQTs7QUFBQTtBQUNILCtEQUE0QjtBQUFBLGNBQXBCLEtBQW9CO0FBQ3hCLFVBQUEsS0FBSyxDQUFDLE1BQU47QUFDSDtBQUhFO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBS0gsV0FBSyxLQUFMLEdBQWEsRUFBYjtBQUNIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMUVMLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFELENBQWxCOztJQUVNLGU7QUFDRiwyQkFBWSxTQUFaLEVBQXNCO0FBQUE7O0FBQ2xCLFNBQUssU0FBTCxHQUFpQixTQUFqQixDQURrQixDQUVsQjtBQUNIOzs7OytCQUVVLEcsRUFBSTtBQUNYLFdBQUssT0FBTCxHQUFlLEdBQWY7QUFDSDs7O21DQUVjLEksRUFBTSxRLEVBQVU7QUFDM0IsVUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQVAsR0FBYSxRQUF2QjtBQUNBLFVBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFELENBQWY7QUFDQSxhQUFPLFdBQVcsSUFBbEI7QUFDSDs7O29DQUVlLEksRUFBSztBQUNqQixVQUFHLEtBQUssU0FBTCxDQUFlLE1BQWxCLEVBQXlCO0FBQ3JCLGVBQU8sWUFBWSxJQUFuQjtBQUNILE9BRkQsTUFFTztBQUNILGVBQU8sV0FBVyxJQUFsQjtBQUNIO0FBQ0o7OzsrQkFFUztBQUNOLFVBQUcsS0FBSyxTQUFMLENBQWUsTUFBbEIsRUFBeUI7QUFDckI7QUFDQSxZQUFJLFVBQVUsR0FBRyxZQUFZLENBQUMsT0FBYixDQUFxQixvQkFBckIsQ0FBakI7QUFDQSxlQUFPLFVBQVUsS0FBSyxJQUF0QjtBQUNILE9BSkQsTUFLSztBQUNEO0FBQ0EsWUFBSSxVQUFVLEdBQUcsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsb0JBQXJCLENBQWpCO0FBQ0EsZUFBTyxVQUFVLEtBQUssSUFBdEI7QUFDSDtBQUNKOzs7MEJBRUssUSxFQUFVLFEsRUFBUztBQUFBOztBQUNyQjtBQUNBLFVBQUcsS0FBSyxTQUFMLENBQWUsTUFBbEIsRUFBeUI7QUFDckIsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLDRDQUFaO0FBQ0EsUUFBQSxZQUFZLENBQUMsT0FBYixDQUFxQixvQkFBckIsRUFBMkMsUUFBM0M7QUFDQSxRQUFBLFlBQVksQ0FBQyxPQUFiLENBQXFCLG1CQUFyQixFQUEwQyxRQUExQztBQUNBLGFBQUssU0FBTCxDQUFlLGNBQWYsQ0FBOEIsV0FBOUIsQ0FBMEMsa0JBQWdCLFFBQTFEO0FBQ0EsZUFBTyxDQUFDLENBQUMsUUFBRixHQUFhLE9BQWIsRUFBUDtBQUNIOztBQUVELGFBQU8sQ0FBQyxDQUFDLElBQUYsQ0FBTztBQUNWLFFBQUEsR0FBRyxFQUFFLEtBQUssT0FBTCxHQUFlLFlBRFY7QUFFVixRQUFBLElBQUksRUFBRSxNQUZJO0FBR1YsUUFBQSxLQUFLLEVBQUUsSUFIRztBQUlWLFFBQUEsT0FBTyxFQUFFLElBSkM7QUFLVixRQUFBLFVBQVUsRUFBRSxvQkFBVSxHQUFWLEVBQWU7QUFDdkIsVUFBQSxHQUFHLENBQUMsZ0JBQUosQ0FBcUIsZUFBckIsRUFBc0MsS0FBSyxjQUFMLENBQW9CLFFBQXBCLEVBQThCLFFBQTlCLENBQXRDO0FBQ0g7QUFQUyxPQUFQLEVBUUosSUFSSSxDQVFDLFVBQUMsSUFBRCxFQUFVO0FBQ2QsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLDRDQUFaO0FBQ0EsUUFBQSxZQUFZLENBQUMsT0FBYixDQUFxQixvQkFBckIsRUFBMkMsSUFBSSxDQUFDLFVBQWhEO0FBQ0gsT0FYTSxFQVdKLElBWEksQ0FXQyxVQUFDLFFBQUQsRUFBYztBQUNsQixRQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsc0NBQWQ7O0FBQ0EsUUFBQSxLQUFJLENBQUMsU0FBTCxDQUFlLGNBQWYsQ0FBOEIsU0FBOUIsQ0FBd0MsbUJBQXhDO0FBQ0gsT0FkTSxDQUFQO0FBZUg7Ozs2QkFFTztBQUNKO0FBQ0EsVUFBRyxLQUFLLFNBQUwsQ0FBZSxNQUFsQixFQUF5QjtBQUNyQixRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksNkNBQVo7QUFDQSxRQUFBLFlBQVksQ0FBQyxVQUFiLENBQXdCLG9CQUF4QjtBQUNBLFFBQUEsWUFBWSxDQUFDLFVBQWIsQ0FBd0IsbUJBQXhCO0FBQ0EsZUFBTyxDQUFDLENBQUMsUUFBRixHQUFhLE9BQWIsRUFBUDtBQUNIOztBQUVELGFBQU8sQ0FBQyxDQUFDLElBQUYsQ0FBTztBQUNWLFFBQUEsR0FBRyxFQUFFLEtBQUssT0FBTCxHQUFlLGFBRFY7QUFFVixRQUFBLElBQUksRUFBRSxRQUZJO0FBR1YsUUFBQSxLQUFLLEVBQUUsSUFIRztBQUlWLFFBQUEsT0FBTyxFQUFFLElBSkM7QUFLVixRQUFBLFVBQVUsRUFBRSxvQkFBVSxHQUFWLEVBQWU7QUFDdkIsY0FBSSxVQUFVLEdBQUcsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsb0JBQXJCLEtBQThDLEVBQS9EO0FBQ0EsVUFBQSxPQUFPLENBQUMsR0FBUixxQ0FBeUMsVUFBekM7QUFDQSxVQUFBLEdBQUcsQ0FBQyxnQkFBSixDQUFxQixlQUFyQixFQUFzQyxLQUFLLGVBQUwsQ0FBcUIsVUFBckIsQ0FBdEM7QUFDSDtBQVRTLE9BQVAsRUFVSixJQVZJLENBVUMsVUFBQyxJQUFELEVBQVU7QUFDZCxRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksNkNBQVo7QUFDQSxRQUFBLFlBQVksQ0FBQyxVQUFiLENBQXdCLG9CQUF4QjtBQUNILE9BYk0sRUFhSixJQWJJLENBYUMsVUFBQyxRQUFELEVBQWM7QUFDbEIsUUFBQSxPQUFPLENBQUMsS0FBUixDQUFjLHVDQUFkO0FBQ0EsUUFBQSxZQUFZLENBQUMsVUFBYixDQUF3QixvQkFBeEI7QUFDSCxPQWhCTSxDQUFQO0FBaUJIOzs7cUNBRWdCLFMsRUFBVyxXLEVBQWE7QUFDckM7QUFDQTtBQUNBO0FBQ0Q7QUFDQyxVQUFJLFFBQVEsR0FBRyxLQUFLLE9BQUwsR0FBZSxXQUFmLEdBQTZCLFdBQVcsQ0FBQyxPQUFaLENBQW9CLEtBQUssT0FBekIsRUFBaUMsRUFBakMsQ0FBN0IsR0FBb0UsMkJBQW5GLENBTHFDLENBTXJDOztBQUNBLGFBQU8sQ0FBQyxDQUFDLElBQUYsQ0FBTztBQUNWLFFBQUEsR0FBRyxFQUFFLFFBREs7QUFFVixRQUFBLElBQUksRUFBRSxLQUZJO0FBR1YsUUFBQSxLQUFLLEVBQUUsVUFIRztBQUlWLFFBQUEsUUFBUSxFQUFFLE9BSkE7QUFLVixRQUFBLEtBQUssRUFBRTtBQUxHLE9BQVAsRUFNSixJQU5JLENBTUMsVUFBVSxJQUFWLEVBQWdCO0FBQ3BCLFFBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxpQ0FBa0MsZUFBYSxPQUFPLElBQUksQ0FBQyxLQUExQixHQUFrQyxJQUFJLENBQUMsTUFBTCxHQUFZLENBQTlDLEdBQWdELElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxFQUFjLEtBQWQsQ0FBb0IsTUFBckcsSUFBK0csbUJBQS9HLEdBQXFJLFNBQXJJLEdBQWlKLEtBQWpKLEdBQXlKLFdBQXpKLEdBQXVLLElBQW5MO0FBQ0gsT0FSTSxFQVFKLElBUkksQ0FRQyxVQUFVLFFBQVYsRUFBb0I7QUFDeEIsWUFBSSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsWUFBVCxDQUFzQixLQUF0QixDQUE0QixJQUE1QixDQUFpQyxDQUFqQyxFQUFvQyxLQUFwQyxHQUE0QyxLQUE1QyxHQUFvRCxRQUFRLENBQUMsWUFBVCxDQUFzQixLQUF0QixDQUE0QixPQUE1QixDQUFvQyxDQUFwQyxFQUF1QyxLQUFuSDtBQUNBLFFBQUEsT0FBTyxDQUFDLEtBQVIsQ0FBYyx1REFBdUQsU0FBdkQsR0FBbUUsS0FBbkUsR0FBMkUsV0FBM0UsR0FBeUYsTUFBekYsR0FBa0csaUJBQWhIOztBQUNBLFFBQUEsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsY0FBakIsQ0FBZ0MsU0FBaEMsQ0FBMEMseUNBQXlDLGlCQUF6QyxHQUE2RCxHQUF2RztBQUVILE9BYk0sQ0FBUDtBQWNIOzs7bUNBRWMsUSxFQUFTO0FBQUE7O0FBQ3BCLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSx1QkFBWjtBQUNBLFVBQUksVUFBVSxHQUFHLEtBQUssU0FBTCxDQUFlLEdBQWYsQ0FBbUIsbUJBQW5CLEVBQWpCO0FBQ0EsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFVBQVo7QUFFQSxVQUFJLEdBQUo7O0FBQ0EsVUFBSSxLQUFLLFNBQUwsQ0FBZSxNQUFuQixFQUEwQjtBQUN0QixRQUFBLEdBQUcsR0FBRyxLQUFLLFNBQUwsQ0FBZSxNQUFyQjtBQUNBLFlBQUksYUFBYSxHQUFHLFlBQVksQ0FBQyxPQUFiLENBQXFCLG9CQUFyQixDQUFwQjtBQUNBLFlBQUksWUFBWSxHQUFHLFlBQVksQ0FBQyxPQUFiLENBQXFCLG1CQUFyQixDQUFuQjtBQUNBLFlBQUcsWUFBWSxJQUFJLElBQW5CLEVBQXlCLFlBQVksR0FBRyxhQUFmO0FBQzVCLE9BTEQsTUFLTztBQUNILFFBQUEsR0FBRyxHQUFHLFlBQVksQ0FBQyxPQUFiLENBQXFCLG9CQUFyQixDQUFOO0FBQ0g7O0FBRUQsVUFBRyxLQUFLLFNBQUwsQ0FBZSxNQUFsQixFQUF5QjtBQUNyQixZQUFHLFVBQVUsQ0FBQyxTQUFELENBQVYsSUFBeUIsSUFBNUIsRUFBa0MsVUFBVSxDQUFDLFNBQUQsQ0FBVixHQUF3QixFQUF4QjtBQUNsQyxRQUFBLFVBQVUsQ0FBQyxTQUFELENBQVYsQ0FBc0IsT0FBdEIsSUFBaUMsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsb0JBQXJCLENBQWpDO0FBQ0EsUUFBQSxVQUFVLENBQUMsU0FBRCxDQUFWLENBQXNCLFVBQXRCLElBQW9DLFlBQVksQ0FBQyxPQUFiLENBQXFCLG1CQUFyQixDQUFwQztBQUNIOztBQUVELFVBQUksVUFBVSxDQUFDLG9CQUFELENBQVYsSUFBb0MsSUFBeEMsRUFBOEM7QUFDMUMsUUFBQSxVQUFVLENBQUMsU0FBRCxDQUFWLENBQXNCLE9BQXRCLEVBQStCLFFBQS9CLElBQTJDLEtBQTNDO0FBQ0EsZUFBTyxVQUFVLENBQUMsT0FBRCxDQUFqQjtBQUNILE9BSEQsTUFHTztBQUNILFFBQUEsVUFBVSxDQUFDLFNBQUQsQ0FBVixDQUFzQixDQUF0QixFQUF5QixPQUF6QixFQUFrQyxRQUFsQyxJQUE4QyxLQUE5QztBQUNBLGVBQU8sVUFBVSxDQUFDLFFBQUQsQ0FBakI7QUFDQSxlQUFPLFVBQVUsQ0FBQyxNQUFELENBQWpCO0FBQ0g7O0FBQ0QsYUFBTyxVQUFVLENBQUMsb0JBQUQsQ0FBakI7QUFFQSxNQUFBLFVBQVUsQ0FBQyxJQUFELENBQVYsR0FBbUIsS0FBSyxPQUFMLEdBQWUsU0FBbEM7QUFFQSxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksNkJBQTZCLElBQUksQ0FBQyxTQUFMLENBQWUsVUFBZixDQUF6QztBQUVBLE1BQUEsQ0FBQyxDQUFDLElBQUYsQ0FBTztBQUNIO0FBQ0EsUUFBQSxHQUFHLEVBQUUsS0FBSyxPQUFMLEdBQWUsU0FGakI7QUFHSCxRQUFBLElBQUksRUFBRSxNQUhIO0FBSUgsUUFBQSxRQUFRLEVBQUUsTUFKUDtBQUllO0FBQ2xCLFFBQUEsV0FBVyxFQUFFLGtCQUxWO0FBSytCO0FBQ2xDLFFBQUEsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFMLENBQWUsVUFBZixDQU5IO0FBTWdDO0FBQ25DLFFBQUEsS0FBSyxFQUFFLElBUEo7QUFRSCxRQUFBLE9BQU8sRUFBRSxJQVJOO0FBU0gsUUFBQSxVQUFVLEVBQUUsb0JBQVUsR0FBVixFQUFlO0FBQ3ZCLFVBQUEsR0FBRyxDQUFDLGdCQUFKLENBQXFCLGVBQXJCLEVBQXNDLEtBQUssZUFBTCxDQUFxQixHQUFyQixDQUF0QztBQUNILFNBWEU7QUFZSCxRQUFBLE9BQU8sRUFBRSxpQkFBQyxJQUFELEVBQVU7QUFDZixVQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVkscUNBQVo7O0FBQ0EsVUFBQSxNQUFJLENBQUMsU0FBTCxDQUFlLGNBQWYsQ0FBOEIsV0FBOUIsQ0FBMEMsc0NBQTFDOztBQUNBLFVBQUEsVUFBVSxDQUFDLEVBQVgsR0FBZ0IsSUFBSSxDQUFDLEVBQXJCLENBSGUsQ0FHVTs7QUFDekIsY0FBRyxRQUFILEVBQWEsUUFBUSxDQUFDLFVBQUQsQ0FBUjtBQUNoQixTQWpCRTtBQWtCSCxRQUFBLEtBQUssRUFBRSxlQUFDLFFBQUQsRUFBYztBQUNqQixjQUFJLGlCQUFpQixHQUFHLDhDQUF4Qjs7QUFDQSxjQUFJLFFBQVEsQ0FBQyxZQUFiLEVBQTJCO0FBQ3ZCLFlBQUEsaUJBQWlCLEdBQUcsUUFBUSxDQUFDLFlBQVQsQ0FBc0IsS0FBdEIsQ0FBNEIsSUFBNUIsQ0FBaUMsQ0FBakMsRUFBb0MsS0FBcEMsR0FBNEMsS0FBNUMsR0FBb0QsUUFBUSxDQUFDLFlBQVQsQ0FBc0IsS0FBdEIsQ0FBNEIsT0FBNUIsQ0FBb0MsQ0FBcEMsRUFBdUMsS0FBL0c7QUFDSDs7QUFDRCxVQUFBLE9BQU8sQ0FBQyxLQUFSLHFEQUEyRCxpQkFBM0Q7O0FBQ0EsVUFBQSxNQUFJLENBQUMsU0FBTCxDQUFlLGNBQWYsQ0FBOEIsU0FBOUIsOENBQThFLGlCQUE5RTtBQUNIO0FBekJFLE9BQVA7QUEyQkg7OzttQ0FFYyxRLEVBQVM7QUFBQTs7QUFDcEIsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLHVCQUFaO0FBQ0EsVUFBSSxVQUFVLEdBQUcsS0FBSyxTQUFMLENBQWUsR0FBZixDQUFtQixtQkFBbkIsRUFBakI7QUFDQSxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBWjtBQUVBLFVBQUksR0FBSjs7QUFDQSxVQUFJLEtBQUssU0FBTCxDQUFlLE1BQW5CLEVBQTBCO0FBQ3RCLFFBQUEsR0FBRyxHQUFHLEtBQUssU0FBTCxDQUFlLE1BQXJCO0FBQ0EsWUFBSSxhQUFhLEdBQUcsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsb0JBQXJCLENBQXBCO0FBQ0EsWUFBSSxZQUFZLEdBQUcsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsbUJBQXJCLENBQW5CO0FBQ0EsWUFBRyxZQUFZLElBQUksSUFBbkIsRUFBeUIsWUFBWSxHQUFHLGFBQWY7QUFDNUIsT0FMRCxNQUtPO0FBQ0gsUUFBQSxHQUFHLEdBQUcsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsb0JBQXJCLENBQU47QUFDSDs7QUFFRCxVQUFHLEtBQUssU0FBTCxDQUFlLE1BQWxCLEVBQXlCO0FBQ3JCLFlBQUcsVUFBVSxDQUFDLFNBQUQsQ0FBVixJQUF5QixJQUE1QixFQUFrQyxVQUFVLENBQUMsU0FBRCxDQUFWLEdBQXdCLEVBQXhCO0FBQ2xDLFFBQUEsVUFBVSxDQUFDLFNBQUQsQ0FBVixDQUFzQixPQUF0QixJQUFpQyxZQUFZLENBQUMsT0FBYixDQUFxQixvQkFBckIsQ0FBakM7QUFDQSxRQUFBLFVBQVUsQ0FBQyxTQUFELENBQVYsQ0FBc0IsVUFBdEIsSUFBb0MsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsbUJBQXJCLENBQXBDO0FBQ0g7O0FBRUQsVUFBSSxVQUFVLENBQUMsb0JBQUQsQ0FBVixJQUFvQyxJQUF4QyxFQUE4QztBQUMxQyxRQUFBLFVBQVUsQ0FBQyxTQUFELENBQVYsQ0FBc0IsT0FBdEIsRUFBK0IsUUFBL0IsSUFBMkMsUUFBM0M7QUFDQSxlQUFPLFVBQVUsQ0FBQyxPQUFELENBQWpCO0FBQ0gsT0FIRCxNQUdPO0FBQ0gsUUFBQSxVQUFVLENBQUMsU0FBRCxDQUFWLENBQXNCLENBQXRCLEVBQXlCLE9BQXpCLEVBQWtDLFFBQWxDLElBQThDLFFBQTlDO0FBQ0EsZUFBTyxVQUFVLENBQUMsUUFBRCxDQUFqQjtBQUNBLGVBQU8sVUFBVSxDQUFDLE1BQUQsQ0FBakI7QUFDSDs7QUFDRCxhQUFPLFVBQVUsQ0FBQyxvQkFBRCxDQUFqQjtBQUVBLFVBQUksS0FBSyxHQUFHLEVBQVo7O0FBQ0EsVUFBSSxlQUFlLE9BQU8sVUFBVSxDQUFDLEtBQXJDLEVBQTZDO0FBQUU7QUFDM0MsUUFBQSxLQUFLLEdBQUcsVUFBVSxDQUFDLEVBQW5CO0FBQ0gsT0FGRCxNQUVPO0FBQUU7QUFDTCxRQUFBLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBWCxDQUFpQixDQUFqQixFQUFvQixLQUFwQixDQUEwQixDQUExQixFQUE2QixLQUE3QixDQUFtQyxDQUFuQyxFQUFzQyxFQUE5QztBQUNIOztBQUVELE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSwyQkFBMkIsS0FBdkM7QUFFQSxNQUFBLENBQUMsQ0FBQyxJQUFGLENBQU87QUFDSCxRQUFBLEdBQUcsRUFBRSxLQUFLLE9BQUwsR0FBZSxZQURqQjtBQUVILFFBQUEsSUFBSSxFQUFFLE1BRkg7QUFHSCxRQUFBLFFBQVEsRUFBRSxNQUhQO0FBSUgsUUFBQSxXQUFXLEVBQUUsa0JBSlY7QUFLSCxRQUFBLElBQUksRUFBRSxJQUFJLENBQUMsU0FBTCxDQUFlLFVBQWYsQ0FMSDtBQU1ILFFBQUEsS0FBSyxFQUFFLElBTko7QUFPSCxRQUFBLE9BQU8sRUFBRSxJQVBOO0FBUUgsUUFBQSxVQUFVLEVBQUUsb0JBQVUsR0FBVixFQUFlO0FBQ3ZCLFVBQUEsR0FBRyxDQUFDLGdCQUFKLENBQXFCLGVBQXJCLEVBQXNDLEtBQUssZUFBTCxDQUFxQixHQUFyQixDQUF0QztBQUNILFNBVkU7QUFXSCxRQUFBLE9BQU8sRUFBRSxpQkFBQyxJQUFELEVBQVU7QUFDZjtBQUNBLFVBQUEsVUFBVSxDQUFDLEVBQVgsR0FBZ0IsSUFBSSxDQUFDLEVBQXJCLENBRmUsQ0FFVTtBQUN6Qjs7QUFFQSxVQUFBLE1BQUksQ0FBQyxTQUFMLENBQWUsY0FBZixDQUE4QixXQUE5QixDQUEwQyxvQ0FBMUM7O0FBQ0EsY0FBRyxRQUFILEVBQWEsUUFBUSxDQUFDLFVBQUQsRUFBYSxLQUFiLENBQVI7QUFDaEIsU0FsQkU7QUFtQkgsUUFBQSxLQUFLLEVBQUUsZUFBQyxRQUFELEVBQWM7QUFDakI7QUFDQTtBQUNBLGNBQUksaUJBQWlCLEdBQUcsOENBQXhCOztBQUNBLGNBQUksUUFBUSxDQUFDLFlBQWIsRUFBMkI7QUFDdkIsWUFBQSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsWUFBVCxDQUFzQixLQUF0QixDQUE0QixJQUE1QixDQUFpQyxDQUFqQyxFQUFvQyxLQUFwQyxHQUE0QyxLQUE1QyxHQUFvRCxRQUFRLENBQUMsWUFBVCxDQUFzQixLQUF0QixDQUE0QixPQUE1QixDQUFvQyxDQUFwQyxFQUF1QyxLQUEvRztBQUNIOztBQUNELFVBQUEsT0FBTyxDQUFDLEtBQVIscURBQTJELGlCQUEzRDs7QUFDQSxVQUFBLE1BQUksQ0FBQyxTQUFMLENBQWUsY0FBZixDQUE4QixTQUE5Qiw4Q0FBOEUsaUJBQTlFO0FBQ0g7QUE1QkUsT0FBUDtBQStCSDs7O3FDQUVnQixVLEVBQVksUSxFQUFTO0FBQUE7O0FBQ2xDLFVBQUksQ0FBQyxPQUFPLENBQUMsa0RBQUQsQ0FBWixFQUFrRTtBQUM5RDtBQUNIOztBQUVELFVBQUksR0FBSjs7QUFDQSxVQUFJLEtBQUssU0FBTCxDQUFlLE1BQW5CLEVBQTBCO0FBQ3RCLFFBQUEsR0FBRyxHQUFHLEtBQUssU0FBTCxDQUFlLE1BQXJCO0FBQ0EsWUFBSSxhQUFhLEdBQUcsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsb0JBQXJCLENBQXBCO0FBQ0EsWUFBSSxZQUFZLEdBQUcsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsbUJBQXJCLENBQW5CO0FBQ0EsWUFBRyxZQUFZLElBQUksSUFBbkIsRUFBeUIsWUFBWSxHQUFHLGFBQWY7QUFDNUIsT0FMRCxNQUtPO0FBQ0gsUUFBQSxHQUFHLEdBQUcsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsb0JBQXJCLENBQU47QUFDSDs7QUFFRCxVQUFHLEtBQUssU0FBTCxDQUFlLE1BQWxCLEVBQXlCO0FBQ3JCLFlBQUcsVUFBVSxDQUFDLFNBQUQsQ0FBVixJQUF5QixJQUE1QixFQUFrQyxVQUFVLENBQUMsU0FBRCxDQUFWLEdBQXdCLEVBQXhCO0FBQ2xDLFFBQUEsVUFBVSxDQUFDLFNBQUQsQ0FBVixDQUFzQixPQUF0QixJQUFpQyxZQUFZLENBQUMsT0FBYixDQUFxQixvQkFBckIsQ0FBakM7QUFDQSxRQUFBLFVBQVUsQ0FBQyxTQUFELENBQVYsQ0FBc0IsVUFBdEIsSUFBb0MsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsbUJBQXJCLENBQXBDO0FBQ0g7O0FBRUQsVUFBSSxVQUFVLENBQUMsb0JBQUQsQ0FBVixJQUFvQyxJQUF4QyxFQUE4QztBQUMxQyxRQUFBLFVBQVUsQ0FBQyxTQUFELENBQVYsQ0FBc0IsT0FBdEIsRUFBK0IsUUFBL0IsSUFBMkMsUUFBM0M7QUFDQSxlQUFPLFVBQVUsQ0FBQyxPQUFELENBQWpCO0FBQ0gsT0FIRCxNQUdPO0FBQ0gsUUFBQSxVQUFVLENBQUMsU0FBRCxDQUFWLENBQXNCLENBQXRCLEVBQXlCLE9BQXpCLEVBQWtDLFFBQWxDLElBQThDLFFBQTlDO0FBQ0EsZUFBTyxVQUFVLENBQUMsUUFBRCxDQUFqQjtBQUNBLGVBQU8sVUFBVSxDQUFDLE1BQUQsQ0FBakI7QUFDSDs7QUFDRCxhQUFPLFVBQVUsQ0FBQyxvQkFBRCxDQUFqQjtBQUVBLFVBQUksS0FBSyxHQUFHLEVBQVo7O0FBQ0EsVUFBSSxlQUFlLE9BQU8sVUFBVSxDQUFDLEtBQXJDLEVBQTZDO0FBQUU7QUFDM0MsUUFBQSxLQUFLLEdBQUcsVUFBVSxDQUFDLEVBQW5CO0FBQ0gsT0FGRCxNQUVPO0FBQUU7QUFDTCxRQUFBLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBWCxDQUFpQixDQUFqQixFQUFvQixLQUFwQixDQUEwQixDQUExQixFQUE2QixLQUE3QixDQUFtQyxDQUFuQyxFQUFzQyxFQUE5QztBQUNIOztBQUVELE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSwwQkFBMEIsS0FBdEM7O0FBRUEsVUFBSSxlQUFlLE9BQU8sVUFBVSxDQUFDLEtBQXJDLEVBQTZDO0FBQUU7QUFDM0MsWUFBSSxRQUFRLEdBQUc7QUFDWCx3QkFBYyx3QkFBd0IsVUFBVSxDQUFDLEVBRHRDO0FBRVgsb0JBQVUsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsS0FBbkIsVUFGQztBQUdYLG9CQUFVLFFBSEM7QUFJWCxxQkFBVyxVQUFVLENBQUMsT0FBWCxDQUFtQixLQUFuQixDQUF5QixPQUp6QjtBQUtYLGdCQUFNLFVBQVUsQ0FBQyxPQUFYLENBQW1CLEtBQW5CLENBQXlCO0FBTHBCLFNBQWY7QUFPQSxlQUFPLENBQUMsQ0FBQyxJQUFGLENBQU8sS0FBSyxPQUFMLEdBQWUsWUFBdEIsRUFBb0MsUUFBcEMsRUFBOEMsVUFBUyxRQUFULEVBQWtCO0FBQ25FO0FBQ0ksWUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLHVCQUFaO0FBQ0EsWUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFFBQVo7QUFDQSxZQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksUUFBUSxDQUFDLFlBQXJCO0FBQ0g7QUFDSixTQU5NLEVBTUosSUFOSSxDQU1DLFVBQUMsUUFBRCxFQUFjO0FBQ2xCLFVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxzQ0FBWjs7QUFDQSxVQUFBLE1BQUksQ0FBQyxTQUFMLENBQWUsY0FBZixDQUE4QixXQUE5QixDQUEwQyxzQ0FBMUM7O0FBQ0EsY0FBRyxRQUFILEVBQWEsUUFBUSxDQUFDLFVBQUQsRUFBYSxLQUFiLENBQVI7QUFDaEIsU0FWTSxFQVVKLElBVkksQ0FVQyxVQUFDLFFBQUQsRUFBYztBQUNsQixjQUFJLGlCQUFpQixHQUFHLGlEQUF4Qjs7QUFDQSxjQUFJLFFBQVEsQ0FBQyxZQUFiLEVBQTJCO0FBQ3ZCLFlBQUEsUUFBUSxDQUFDLFlBQVQsQ0FBc0IsS0FBdEIsQ0FBNEIsSUFBNUIsQ0FBaUMsQ0FBakMsRUFBb0MsS0FBcEMsR0FBNEMsS0FBNUMsR0FBb0QsUUFBUSxDQUFDLFlBQVQsQ0FBc0IsS0FBdEIsQ0FBNEIsT0FBNUIsQ0FBb0MsQ0FBcEMsRUFBdUMsS0FBM0Y7QUFDSDs7QUFDRCxVQUFBLE9BQU8sQ0FBQyxLQUFSLHVEQUE2RCxpQkFBN0Q7O0FBQ0EsVUFBQSxNQUFJLENBQUMsU0FBTCxDQUFlLGNBQWYsQ0FBOEIsU0FBOUIsZ0RBQWdGLGlCQUFoRjtBQUNILFNBakJNLENBQVA7QUFrQkgsT0ExQkQsTUEwQk87QUFBRTtBQUNMLFFBQUEsVUFBVSxDQUFDLFNBQUQsQ0FBVixDQUFzQixDQUF0QixFQUF5QixPQUF6QixFQUFrQyxRQUFsQyxJQUE4QyxRQUE5QztBQUNBLGVBQU8sVUFBVSxDQUFDLFFBQUQsQ0FBakI7QUFDQSxlQUFPLFVBQVUsQ0FBQyxNQUFELENBQWpCO0FBQ0EsZUFBTyxVQUFVLENBQUMsb0JBQUQsQ0FBakI7QUFDQSxRQUFBLENBQUMsQ0FBQyxJQUFGLENBQU87QUFDSCxVQUFBLEdBQUcsRUFBRSxLQUFLLE9BQUwsR0FBZSxZQURqQjtBQUVILFVBQUEsSUFBSSxFQUFFLE1BRkg7QUFHSCxVQUFBLFFBQVEsRUFBRSxNQUhQO0FBSUgsVUFBQSxXQUFXLEVBQUUsa0JBSlY7QUFLSCxVQUFBLElBQUksRUFBRSxJQUFJLENBQUMsU0FBTCxDQUFlLFVBQWYsQ0FMSDtBQU1ILFVBQUEsS0FBSyxFQUFFLElBTko7QUFPSCxVQUFBLE9BQU8sRUFBRSxJQVBOO0FBUUgsVUFBQSxVQUFVLEVBQUUsb0JBQVUsR0FBVixFQUFlO0FBQ3ZCLFlBQUEsR0FBRyxDQUFDLGdCQUFKLENBQXFCLGVBQXJCLEVBQXNDLEtBQUssZUFBTCxDQUFxQixHQUFyQixDQUF0QztBQUNILFdBVkU7QUFXSCxVQUFBLE9BQU8sRUFBRSxpQkFBQyxJQUFELEVBQVU7QUFDZixZQUFBLE1BQUksQ0FBQyxTQUFMLENBQWUsY0FBZixDQUE4QixXQUE5QixDQUEwQyxxQ0FBMUM7O0FBQ0EsZ0JBQUcsUUFBSCxFQUFhLFFBQVEsQ0FBQyxVQUFELEVBQWEsS0FBYixDQUFSO0FBQ2hCLFdBZEU7QUFlSCxVQUFBLEtBQUssRUFBRSxlQUFDLFFBQUQsRUFBYztBQUNqQixnQkFBSSxpQkFBaUIsR0FBRywrQ0FBeEI7O0FBQ0EsZ0JBQUksUUFBUSxDQUFDLFlBQWIsRUFBMkI7QUFDdkIsY0FBQSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsWUFBVCxDQUFzQixLQUF0QixDQUE0QixJQUE1QixDQUFpQyxDQUFqQyxFQUFvQyxLQUFwQyxHQUE0QyxLQUE1QyxHQUFvRCxRQUFRLENBQUMsWUFBVCxDQUFzQixLQUF0QixDQUE0QixPQUE1QixDQUFvQyxDQUFwQyxFQUF1QyxLQUEvRztBQUNIOztBQUNELFlBQUEsT0FBTyxDQUFDLEtBQVIsdURBQTZELGlCQUE3RDs7QUFDQSxZQUFBLE1BQUksQ0FBQyxTQUFMLENBQWUsY0FBZixDQUE4QixTQUE5QixnREFBZ0YsaUJBQWhGO0FBQ0g7QUF0QkUsU0FBUDtBQXlCSDtBQUVKOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDaFdMLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFELENBQWxCO0FBRUE7Ozs7O0lBR00sYztBQUVGLDBCQUFZLFNBQVosRUFBc0I7QUFBQTs7QUFBQTs7QUFDbEIsSUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLDhDQUFaO0FBQ0EsU0FBSyxTQUFMLEdBQWlCLFNBQWpCO0FBQ0EsU0FBSyxTQUFMLEdBQWlCLEtBQWpCLENBSGtCLENBS2xCOztBQUNBLFFBQUcsQ0FBQyxTQUFTLENBQUMsU0FBWCxJQUF3QixTQUFTLENBQUMsUUFBVixJQUFzQixFQUFqRCxFQUFvRDtBQUNoRCxXQUFLLFdBQUwsR0FBbUIsQ0FBQyxDQUFDLDBCQUFELENBQUQsQ0FBOEIsTUFBOUIsQ0FBcUM7QUFDcEQsUUFBQSxJQUFJLEVBQUUsWUFEOEM7QUFFcEQsUUFBQSxTQUFTLEVBQUU7QUFGeUMsT0FBckMsRUFHaEIsS0FIZ0IsQ0FHVixZQUFNO0FBQ1gsUUFBQSxLQUFJLENBQUMsWUFBTDtBQUNILE9BTGtCLENBQW5CO0FBTUEsV0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixVQUF0QixDQUFpQyxlQUFqQyxDQUFpRCxLQUFLLFdBQXRELEVBQW1FLENBQW5FLEVBQXNFLFVBQXRFO0FBQ0gsS0FkaUIsQ0FlbEI7OztBQUVBLElBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSwyQ0FBWjtBQUVIOzs7O3FDQUVlO0FBQUE7O0FBRVo7QUFDQSxVQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsMERBQUQsQ0FBbEIsQ0FIWSxDQUdvRTs7QUFDaEYsVUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLHNEQUFELENBQUQsQ0FBMEQsUUFBMUQsQ0FBbUUsVUFBbkUsQ0FBaEI7QUFDQSxVQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsZUFBRCxDQUFELENBQW1CLFFBQW5CLENBQTRCLFVBQTVCLENBQVo7QUFFQSxVQUFJLGNBQUo7QUFDQSxVQUFJLGNBQUo7QUFDQSxVQUFJLGNBQUo7O0FBRUEsVUFBSSxLQUFLLFNBQUwsQ0FBZSxNQUFuQixFQUEwQjtBQUN0QixRQUFBLENBQUMsQ0FBQyxvQ0FBRCxDQUFELENBQXdDLFFBQXhDLENBQWlELEtBQWpEO0FBQ0EsUUFBQSxjQUFjLEdBQUcsQ0FBQyxDQUFDLDJGQUFELENBQUQsQ0FBK0YsUUFBL0YsQ0FBd0csS0FBeEcsQ0FBakI7QUFDQSxRQUFBLENBQUMsQ0FBQyw2Q0FBRCxDQUFELENBQWlELFFBQWpELENBQTBELEtBQTFEO0FBQ0EsUUFBQSxjQUFjLEdBQUcsQ0FBQyxDQUFDLHdGQUFELENBQUQsQ0FBNEYsUUFBNUYsQ0FBcUcsS0FBckcsQ0FBakI7QUFDSCxPQUxELE1BTUs7QUFDRCxRQUFBLENBQUMsQ0FBQyx3Q0FBRCxDQUFELENBQTRDLFFBQTVDLENBQXFELEtBQXJEO0FBQ0EsUUFBQSxjQUFjLEdBQUcsQ0FBQyxDQUFDLDJGQUFELENBQUQsQ0FBK0YsUUFBL0YsQ0FBd0csS0FBeEcsQ0FBakI7QUFDQSxRQUFBLENBQUMsQ0FBQyx3Q0FBRCxDQUFELENBQTRDLFFBQTVDLENBQXFELEtBQXJEO0FBQ0EsUUFBQSxjQUFjLEdBQUcsQ0FBQyxDQUFDLCtGQUFELENBQUQsQ0FBbUcsUUFBbkcsQ0FBNEcsS0FBNUcsQ0FBakI7QUFDSDs7QUFFRCxNQUFBLEtBQUssQ0FBQyxTQUFOLENBQWdCLGNBQWhCOztBQUVBLFVBQUksS0FBSyxHQUFHLFNBQVIsS0FBUSxHQUFNO0FBQ2QsWUFBRyxNQUFJLENBQUMsU0FBTCxDQUFlLE1BQWxCLEVBQXlCO0FBQ3JCLGNBQUksUUFBUSxHQUFHLGNBQWMsQ0FBQyxHQUFmLEVBQWY7QUFDQSxjQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQWYsRUFBRCxDQUFuQjs7QUFDQSxVQUFBLE1BQUksQ0FBQyxTQUFMLENBQWUsTUFBZixDQUFzQixLQUF0QixDQUE0QixRQUE1QixFQUFzQyxRQUF0QyxFQUFnRCxJQUFoRCxDQUFxRCxZQUFNO0FBQ3ZELFlBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSx1QkFBWjtBQUNBLFlBQUEsT0FBTyxDQUFDLE1BQVIsQ0FBZSxPQUFmO0FBQ0gsV0FIRCxFQUdHLElBSEgsQ0FHUSxZQUFNO0FBQ1YsWUFBQSxTQUFTLENBQUMsSUFBVixDQUFlLCtCQUFmO0FBQ0EsWUFBQSxTQUFTLENBQUMsR0FBVixDQUFjLE9BQWQsRUFBdUIsS0FBdkI7QUFDSCxXQU5EO0FBT0gsU0FWRCxNQVdLO0FBQ0QsY0FBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFmLEVBQUQsQ0FBbkI7O0FBQ0EsVUFBQSxNQUFJLENBQUMsU0FBTCxDQUFlLE1BQWYsQ0FBc0IsS0FBdEIsQ0FBNEIsY0FBYyxDQUFDLEdBQWYsRUFBNUIsRUFBa0QsUUFBbEQsRUFBNEQsSUFBNUQsQ0FBaUUsWUFBTTtBQUNuRSxZQUFBLE9BQU8sQ0FBQyxNQUFSLENBQWUsT0FBZjtBQUNILFdBRkQsRUFFRyxJQUZILENBRVEsWUFBTTtBQUNWLFlBQUEsU0FBUyxDQUFDLElBQVYsQ0FBZSxzQ0FBZjtBQUNBLFlBQUEsU0FBUyxDQUFDLEdBQVYsQ0FBYyxPQUFkLEVBQXVCLEtBQXZCO0FBQ0gsV0FMRDtBQU1IO0FBRUosT0F0QkQ7O0FBd0JBLFVBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxNQUFYLENBQWtCO0FBQzVCLFFBQUEsUUFBUSxFQUFFLElBRGtCO0FBRTVCLFFBQUEsU0FBUyxFQUFFLEtBRmlCO0FBRzVCLFFBQUEsS0FBSyxFQUFFLElBSHFCO0FBSTVCLFFBQUEsT0FBTyxFQUFFO0FBQ0wsb0JBQVUsS0FETDtBQUVMLFVBQUEsTUFBTSxFQUFFLGtCQUFNO0FBQ1YsWUFBQSxPQUFPLENBQUMsTUFBUixDQUFlLE9BQWY7QUFDSDtBQUpJLFNBSm1CO0FBVTVCLFFBQUEsS0FBSyxFQUFFLGlCQUFNO0FBQ1QsVUFBQSxPQUFPLENBQUMsSUFBUixDQUFhLE1BQWIsRUFBc0IsQ0FBdEIsRUFBMEIsS0FBMUI7QUFDQSxVQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWEsT0FBYixFQUFzQixXQUF0QixDQUFtQyxnQkFBbkM7O0FBQ0EsVUFBQSxNQUFJLENBQUMsWUFBTDtBQUNIO0FBZDJCLE9BQWxCLENBQWQ7QUFnQkg7OztzQ0FFZ0I7QUFBQTs7QUFDYixVQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsNkJBQUQsQ0FBbEI7QUFDQSxVQUFJLFNBQVMsR0FBRyxVQUFVLENBQUMsSUFBWCxDQUFnQiwrREFBaEIsQ0FBaEI7QUFDQSxVQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsTUFBWCxDQUFrQjtBQUM1QixRQUFBLFFBQVEsRUFBRSxJQURrQjtBQUU1QixRQUFBLFNBQVMsRUFBRSxLQUZpQjtBQUc1QixRQUFBLEtBQUssRUFBRSxJQUhxQjtBQUk1QixRQUFBLE9BQU8sRUFBRTtBQUNMLHFCQUFXLGtCQUFNO0FBQ2IsWUFBQSxNQUFJLENBQUMsU0FBTCxDQUFlLE1BQWYsQ0FBc0IsTUFBdEIsR0FBK0IsSUFBL0IsQ0FBb0MsWUFBTTtBQUN0QyxjQUFBLE9BQU8sQ0FBQyxNQUFSLENBQWUsT0FBZjtBQUNILGFBRkQ7QUFHSCxXQUxJO0FBTUwsVUFBQSxNQUFNLEVBQUUsa0JBQU07QUFDVixZQUFBLE9BQU8sQ0FBQyxNQUFSLENBQWUsT0FBZjtBQUNIO0FBUkksU0FKbUI7QUFjNUIsUUFBQSxLQUFLLEVBQUUsaUJBQU07QUFDVCxVQUFBLE1BQUksQ0FBQyxZQUFMO0FBQ0g7QUFoQjJCLE9BQWxCLENBQWQ7QUFrQkg7OzttQ0FFYTtBQUNWO0FBQ0EsVUFBRyxLQUFLLFNBQVIsRUFBbUIsT0FGVCxDQUlWOztBQUNBLFdBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsYUFBdEIsQ0FBb0MsS0FBcEM7O0FBRUEsVUFBRyxLQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLFFBQXRCLEVBQUgsRUFBb0M7QUFDaEMsYUFBSyxlQUFMO0FBQ0gsT0FGRCxNQUVPO0FBQ0gsYUFBSyxjQUFMO0FBQ0g7O0FBRUQsV0FBSyxXQUFMO0FBQ0g7OztrQ0FFWTtBQUNULFdBQUssV0FBTCxDQUFpQixNQUFqQixDQUF3QixTQUF4QjtBQUNBLFdBQUssU0FBTCxHQUFpQixJQUFqQjtBQUNIOzs7bUNBRWE7QUFDVixXQUFLLFdBQUwsQ0FBaUIsTUFBakIsQ0FBd0IsUUFBeEI7QUFDQSxXQUFLLFNBQUwsR0FBaUIsS0FBakI7QUFDSDs7Ozs7Ozs7O0FDL0lMO0FBQ0E7QUFDQTs7OztBQ0lBOztBQUVBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQWRBOzs7O0FBS0E7QUFZQSxDQUFDLENBQUMsRUFBRixDQUFLLFFBQUwsR0FBZ0IsVUFBUyxJQUFULEVBQWM7QUFFMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQSxNQUFHLENBQUMsQ0FBQyxJQUFELENBQUQsQ0FBUSxJQUFSLENBQWEsU0FBYixFQUF3QixXQUF4QixNQUF5QyxPQUE1QyxFQUFvRDtBQUNoRCxJQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsa0NBQWQ7QUFDQTtBQUNIOztBQUVELE1BQUcsQ0FBQyx1Q0FBSixFQUF5QjtBQUNyQjtBQUNILEdBakJ5QixDQW1CMUI7QUFDQTtBQUNBOzs7QUFFQSxNQUFJLGlDQUFKLENBQXlCLENBQUMsQ0FBQyxJQUFELENBQTFCLEVBQWtDLElBQWxDO0FBRUgsQ0F6QkQ7Ozs7O0FDakJBO0FBRUE7QUFDQSxJQUFHLEtBQUssQ0FBQyxTQUFOLENBQWdCLE1BQW5CLEVBQ0ksT0FBTyxDQUFDLElBQVIsQ0FBYTsrRUFBYixFLENBR0o7O0FBQ0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsTUFBaEIsR0FBeUIsVUFBVSxLQUFWLEVBQWlCO0FBQ3RDO0FBQ0EsTUFBSSxDQUFDLEtBQUwsRUFDSSxPQUFPLEtBQVAsQ0FIa0MsQ0FLdEM7O0FBQ0EsTUFBSSxLQUFLLE1BQUwsSUFBZSxLQUFLLENBQUMsTUFBekIsRUFDSSxPQUFPLEtBQVA7O0FBRUosT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFSLEVBQVcsQ0FBQyxHQUFDLEtBQUssTUFBdkIsRUFBK0IsQ0FBQyxHQUFHLENBQW5DLEVBQXNDLENBQUMsRUFBdkMsRUFBMkM7QUFDdkM7QUFDQSxRQUFJLEtBQUssQ0FBTCxhQUFtQixLQUFuQixJQUE0QixLQUFLLENBQUMsQ0FBRCxDQUFMLFlBQW9CLEtBQXBELEVBQTJEO0FBQ3ZEO0FBQ0EsVUFBSSxDQUFDLEtBQUssQ0FBTCxFQUFRLE1BQVIsQ0FBZSxLQUFLLENBQUMsQ0FBRCxDQUFwQixDQUFMLEVBQ0ksT0FBTyxLQUFQO0FBQ1AsS0FKRCxNQUtLLElBQUksS0FBSyxDQUFMLEtBQVcsS0FBSyxDQUFDLENBQUQsQ0FBcEIsRUFBeUI7QUFDMUI7QUFDQSxhQUFPLEtBQVA7QUFDSDtBQUNKOztBQUNELFNBQU8sSUFBUDtBQUNILENBdEJELEMsQ0F1QkE7OztBQUNBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLEtBQUssQ0FBQyxTQUE1QixFQUF1QyxRQUF2QyxFQUFpRDtBQUFDLEVBQUEsVUFBVSxFQUFFO0FBQWIsQ0FBakQ7Ozs7O0FDaENBOzs7OztBQUtBLENBQUMsQ0FBQyxFQUFGLENBQUssV0FBTCxHQUFtQixVQUFTLElBQVQsRUFBZTtBQUM5QixNQUFHLElBQUgsRUFBUTtBQUNKLElBQUEsQ0FBQyxDQUFDLElBQUQsQ0FBRCxDQUFRLEdBQVIsQ0FBWTtBQUNSLG9CQUFjLFNBRE47QUFFUix3QkFBa0I7QUFGVixLQUFaO0FBSUgsR0FMRCxNQUtPO0FBQ0gsSUFBQSxDQUFDLENBQUMsSUFBRCxDQUFELENBQVEsR0FBUixDQUFZO0FBQ1Isb0JBQWMsUUFETjtBQUVSLHdCQUFrQjtBQUZWLEtBQVo7QUFJSDtBQUVKLENBYkQ7QUFlQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXdCQSxDQUFDLENBQUMsRUFBRixDQUFLLFNBQUwsR0FBaUIsVUFBUyxJQUFULEVBQWUsTUFBZixFQUF1QjtBQUVwQztBQUNBLE1BQUksT0FBTyxHQUFHLEVBQWQsQ0FIb0MsQ0FLcEM7O0FBQ0EsTUFBSSxLQUFKLENBTm9DLENBUXBDOztBQUNBLE1BQUksSUFBSixDQVRvQyxDQVdwQzs7QUFDQSxNQUFJLElBQUksSUFBSSxJQUFJLFlBQVksS0FBNUIsRUFBbUM7QUFFL0IsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFSLEVBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUF6QixFQUFpQyxDQUFDLEdBQUcsQ0FBckMsRUFBd0MsQ0FBQyxFQUF6QyxFQUE2QztBQUN6QztBQUNBLE1BQUEsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFELENBQVg7QUFDQSxNQUFBLE9BQU8sQ0FBQyxJQUFELENBQVAsR0FBZ0IsS0FBSyxHQUFMLENBQVMsSUFBVCxDQUFoQjtBQUNIO0FBRUosR0FSRCxNQVFPO0FBRUg7QUFDQSxRQUFJLEtBQUssTUFBVCxFQUFpQjtBQUViO0FBQ0EsVUFBSSxHQUFHLEdBQUcsS0FBSyxHQUFMLENBQVMsQ0FBVCxDQUFWLENBSGEsQ0FLYjs7QUFDQSxVQUFJLE1BQU0sQ0FBQyxnQkFBWCxFQUE2QjtBQUV6QjtBQUNBLFlBQUksT0FBTyxHQUFHLFlBQWQ7O0FBQ0EsWUFBSSxFQUFFLEdBQUcsU0FBTCxFQUFLLENBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0I7QUFDakIsaUJBQU8sQ0FBQyxDQUFDLFdBQUYsRUFBUDtBQUNQLFNBRkQ7O0FBR0EsWUFBSSxRQUFRLEdBQUcsU0FBWCxRQUFXLENBQVMsTUFBVCxFQUFnQjtBQUMzQixpQkFBTyxNQUFNLENBQUMsT0FBUCxDQUFlLE9BQWYsRUFBd0IsRUFBeEIsQ0FBUDtBQUNILFNBRkQsQ0FQeUIsQ0FXekI7OztBQUNBLFlBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixHQUF4QixFQUE2QixJQUE3QixDQUFaLEVBQWdEO0FBQzVDLGNBQUksS0FBSixFQUFXLEtBQVgsQ0FENEMsQ0FFNUM7O0FBQ0EsY0FBSSxLQUFLLENBQUMsTUFBVixFQUFrQjtBQUNkLGlCQUFLLElBQUksQ0FBQyxHQUFHLENBQVIsRUFBVyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQTFCLEVBQWtDLENBQUMsR0FBRyxDQUF0QyxFQUF5QyxDQUFDLEVBQTFDLEVBQThDO0FBQzFDLGNBQUEsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFELENBQVo7QUFDQSxjQUFBLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBRCxDQUFoQjtBQUNBLGNBQUEsS0FBSyxHQUFHLEtBQUssQ0FBQyxnQkFBTixDQUF1QixJQUF2QixDQUFSO0FBQ0EsY0FBQSxPQUFPLENBQUMsS0FBRCxDQUFQLEdBQWlCLEtBQWpCO0FBQ0g7QUFDSixXQVBELE1BT087QUFDSDtBQUNBLGlCQUFLLElBQUwsSUFBYSxLQUFiLEVBQW9CO0FBQ2hCLGNBQUEsS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFELENBQWhCO0FBQ0EsY0FBQSxLQUFLLEdBQUcsS0FBSyxDQUFDLGdCQUFOLENBQXVCLElBQXZCLEtBQWdDLEtBQUssQ0FBQyxJQUFELENBQTdDO0FBQ0EsY0FBQSxPQUFPLENBQUMsS0FBRCxDQUFQLEdBQWlCLEtBQWpCO0FBQ0g7QUFDSjtBQUNKO0FBQ0osT0EvQkQsQ0FnQ0E7QUFoQ0EsV0FpQ0ssSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLFlBQWhCLEVBQThCO0FBQy9CLGVBQUssSUFBTCxJQUFhLEtBQWIsRUFBb0I7QUFDaEIsWUFBQSxPQUFPLENBQUMsSUFBRCxDQUFQLEdBQWdCLEtBQUssQ0FBQyxJQUFELENBQXJCO0FBQ0g7QUFDSixTQUpJLE1BS0EsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQWhCLEVBQXVCO0FBQ3hCLGVBQUssSUFBTCxJQUFhLEtBQWIsRUFBb0I7QUFDaEIsZ0JBQUksT0FBTyxLQUFLLENBQUMsSUFBRCxDQUFaLElBQXNCLFVBQTFCLEVBQXNDO0FBQ2xDLGNBQUEsT0FBTyxDQUFDLElBQUQsQ0FBUCxHQUFnQixLQUFLLENBQUMsSUFBRCxDQUFyQjtBQUNIO0FBQ0o7QUFDSjtBQUNKO0FBQ0osR0EzRW1DLENBNkVwQztBQUNBOzs7QUFDQSxNQUFJLE1BQU0sSUFBSSxNQUFNLFlBQVksS0FBaEMsRUFBdUM7QUFDbkMsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFSLEVBQVcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUEzQixFQUFtQyxDQUFDLEdBQUcsQ0FBdkMsRUFBMEMsQ0FBQyxFQUEzQyxFQUErQztBQUMzQyxNQUFBLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBRCxDQUFiO0FBQ0EsYUFBTyxPQUFPLENBQUMsSUFBRCxDQUFkO0FBQ0g7QUFDSixHQXBGbUMsQ0FzRnBDOzs7QUFDQSxTQUFPLE9BQVA7QUFFSCxDQXpGRCxDLENBMkZBOzs7QUFDQSxDQUFDLENBQUMsRUFBRixDQUFLLE9BQUwsR0FBZSxVQUFTLE1BQVQsRUFBaUIsSUFBakIsRUFBdUIsTUFBdkIsRUFBK0I7QUFDMUMsTUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsSUFBakIsRUFBdUIsTUFBdkIsQ0FBYjtBQUNBLE9BQUssR0FBTCxDQUFTLE1BQVQ7QUFFQSxTQUFPLElBQVA7QUFDSCxDQUxEOzs7Ozs7Ozs7Ozs7Ozs7O0FDeElBO0FBQ0EsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLGdCQUFELENBQXhCOztJQUVNLGlCO0FBQ0YsK0JBQWM7QUFBQTtBQUViOzs7OzRCQUVPLFEsRUFBUztBQUFBOztBQUViO0FBQ0E7QUFFQSxVQUFJLEdBQUcsR0FBRyxTQUFWLENBTGEsQ0FNYjs7QUFFQSxVQUFHLEtBQUssVUFBTCxJQUFtQixJQUF0QixFQUEyQjtBQUN2QixRQUFBLFFBQVEsQ0FBQyxLQUFLLE1BQU4sQ0FBUjtBQUNILE9BRkQsTUFHSTtBQUNBLFFBQUEsQ0FBQyxDQUFDLElBQUYsQ0FBTztBQUNILFVBQUEsUUFBUSxFQUFFLE1BRFA7QUFFSCxVQUFBLEdBQUcsRUFBRSxHQUFHLEdBQUcsVUFBVSxDQUFDLFVBRm5CO0FBR0gsVUFBQSxPQUFPLEVBQUUsaUJBQUMsSUFBRCxFQUFRO0FBQ2IsWUFBQSxLQUFJLENBQUMsVUFBTCxHQUFrQixJQUFsQjtBQUNBLFlBQUEsUUFBUSxDQUFDLEtBQUksQ0FBQyxVQUFOLENBQVI7QUFDSDtBQU5FLFNBQVA7QUFRSDtBQUVKOzs7Ozs7QUFJRSxJQUFJLFdBQVcsR0FBRyxJQUFJLGlCQUFKLEVBQWxCOzs7Ozs7Ozs7OztBQ2xDUDs7OztBQUlPLFNBQVMsa0JBQVQsR0FBOEI7QUFFakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0EsTUFBRyxDQUFDLE1BQU0sQ0FBQyxNQUFYLEVBQWtCO0FBQ2QsSUFBQSxPQUFPLENBQUMsS0FBUixDQUFjLHlCQUFkLEVBRGMsQ0FFZDtBQUNBO0FBQ0E7O0FBQ0EsV0FBTyxLQUFQO0FBQ0g7O0FBRUQsU0FBTyxJQUFQO0FBRUg7Ozs7O0FDekJEOzs7QUFHQTtBQUNBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLE1BQU0sQ0FBQyxTQUE3QixFQUF3QyxZQUF4QyxFQUFzRDtBQUNsRCxFQUFBLEtBRGtELG1CQUMxQztBQUNKLFFBQUksU0FBUyxHQUFHO0FBQ1osV0FBSyxPQURPO0FBQ0UsV0FBSyxNQURQO0FBQ2UsV0FBSyxNQURwQjtBQUM0QixXQUFLLFFBRGpDO0FBRVosV0FBSyxPQUZPO0FBRUUsV0FBSyxRQUZQO0FBRWlCLFdBQUssUUFGdEI7QUFFZ0MsV0FBSztBQUZyQyxLQUFoQjtBQUlBLFdBQU8sTUFBTSxDQUFDLElBQUQsQ0FBTixDQUFhLE9BQWIsQ0FBcUIsY0FBckIsRUFBcUMsVUFBVSxDQUFWLEVBQWE7QUFDckQsYUFBTyxTQUFTLENBQUMsQ0FBRCxDQUFoQjtBQUNILEtBRk0sQ0FBUDtBQUdIO0FBVGlELENBQXREOzs7Ozs7Ozs7OztBQ0xBO0FBQ0EsU0FBUyxnQkFBVCxDQUEwQixhQUExQixFQUF3QztBQUNwQyxNQUFHLEtBQUssQ0FBQyxhQUFELENBQVIsRUFBeUIsT0FBTyxDQUFQO0FBQ3pCLE1BQUksSUFBSSxHQUFHLGFBQWEsR0FBRyxDQUEzQixDQUZvQyxDQUVOOztBQUM5QixNQUFJLEtBQUssR0FBSyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksR0FBRyxJQUFsQixJQUEwQixFQUF4QztBQUNBLE1BQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxHQUFHLEVBQWxCLElBQXdCLEVBQXRDO0FBQ0EsTUFBSSxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQXJCO0FBQ0EsTUFBSSxTQUFTLEdBQUcsQ0FBQyxLQUFELEVBQU8sT0FBUCxFQUFlLE9BQWYsRUFDWCxHQURXLENBQ1AsVUFBQSxDQUFDO0FBQUEsV0FBSSxDQUFDLEdBQUcsRUFBSixHQUFTLE1BQU0sQ0FBZixHQUFtQixDQUF2QjtBQUFBLEdBRE0sRUFFWCxNQUZXLENBRUosVUFBQyxDQUFELEVBQUcsQ0FBSDtBQUFBLFdBQVMsQ0FBQyxLQUFLLElBQU4sSUFBYyxDQUFDLEdBQUcsQ0FBM0I7QUFBQSxHQUZJLEVBR1gsSUFIVyxDQUdOLEdBSE0sQ0FBaEI7O0FBS0EsTUFBSSxTQUFTLENBQUMsTUFBVixDQUFpQixDQUFqQixLQUF1QixHQUEzQixFQUFnQztBQUM1QixJQUFBLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBVixDQUFpQixDQUFqQixDQUFaO0FBQ0g7O0FBRUQsTUFBSSxFQUFFLEdBQUcsQ0FBQyxhQUFhLEdBQUcsQ0FBakIsRUFBb0IsT0FBcEIsQ0FBNEIsQ0FBNUIsQ0FBVDtBQUNBLEVBQUEsU0FBUyxJQUFJLEVBQUUsQ0FBQyxRQUFILEdBQWMsTUFBZCxDQUFxQixDQUFyQixDQUFiO0FBRUEsU0FBTyxTQUFQO0FBQ0gsQyxDQUVEOzs7QUFDQSxTQUFTLGlCQUFULENBQTJCLEdBQTNCLEVBQStCO0FBQzNCLE1BQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFKLENBQVUsR0FBVixDQUFaO0FBQ0EsTUFBSSxFQUFFLEdBQUcsR0FBVDtBQUNBLE1BQUcsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFsQixFQUFxQixFQUFFLEdBQUcsTUFBSSxLQUFLLENBQUMsQ0FBRCxDQUFkO0FBRXJCLE1BQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFELENBQUwsQ0FBUyxLQUFULENBQWUsR0FBZixDQUFSO0FBQUEsTUFDSSxDQUFDLEdBQUcsQ0FEUjtBQUFBLE1BQ1csQ0FBQyxHQUFHLENBRGY7O0FBR0EsU0FBTyxDQUFDLENBQUMsTUFBRixHQUFXLENBQWxCLEVBQXFCO0FBQ2pCLElBQUEsQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUYsRUFBRCxFQUFVLEVBQVYsQ0FBakI7QUFDQSxJQUFBLENBQUMsSUFBSSxFQUFMO0FBQ0g7O0FBRUQsRUFBQSxDQUFDLElBQUksVUFBVSxDQUFDLEVBQUQsQ0FBZjtBQUNBLFNBQU8sQ0FBUDtBQUNIOzs7OztBQzdCRDs7QUFJQTs7Ozs7Ozs7OztBQ2JBOzs7Ozs7OztJQUVNLGM7QUFDRiwwQkFBWSxPQUFaLEVBQXFCLE1BQXJCLEVBQTRCO0FBQUE7O0FBQUE7O0FBQ3hCLFNBQUssT0FBTCxHQUFlLE9BQWY7QUFDQSxTQUFLLE1BQUwsR0FBYyxNQUFkO0FBRUEsU0FBSyxRQUFMLEdBQWdCLENBQUMsQ0FBQyw2Q0FBRCxDQUFELENBQWlELFFBQWpELENBQTBELE9BQTFELENBQWhCO0FBQ0EsU0FBSyxJQUFMLEdBQVksTUFBWjtBQUNBLFNBQUssUUFBTCxHQUFnQixDQUFDLENBQUMsUUFBUSxLQUFLLElBQWIsR0FBb0IsTUFBckIsQ0FBRCxDQUE4QixRQUE5QixDQUF1QyxLQUFLLFFBQTVDLENBQWhCO0FBRUEsU0FBSyxXQUFMLEdBQW1CLENBQUMsRUFBcEI7QUFDQSxTQUFLLE9BQUwsR0FBZSxDQUFmO0FBRUEsU0FBSyxJQUFMO0FBRUEsU0FBSyxPQUFMLENBQWEsU0FBYixDQUF1QixVQUFDLEtBQUQsRUFBVztBQUM5QixNQUFBLEtBQUksQ0FBQyxJQUFMLEdBRDhCLENBRzlCOzs7QUFDQSxVQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBTixHQUFjLE1BQU0sQ0FBQyxVQUFQLENBQWtCLE1BQWxCLEdBQTJCLElBQXREOztBQUNBLFVBQUksT0FBTyxHQUFHLE1BQU0sR0FBRyxLQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsRUFBdkI7O0FBQ0EsVUFBSSxZQUFZLEdBQUcsT0FBTyxHQUFHLE1BQU0sQ0FBQyxZQUFQLENBQW9CLFFBQWpEOztBQUNBLE1BQUEsS0FBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLEVBQWtCLENBQWxCOztBQUNBLE1BQUEsS0FBSSxDQUFDLFVBQUwsQ0FBZ0IsNEJBQWlCLFlBQWpCLENBQWhCO0FBRUgsS0FWRDtBQVlBLFNBQUssT0FBTCxDQUFhLFFBQWIsQ0FBc0IsWUFBTTtBQUN4QixNQUFBLEtBQUksQ0FBQyxJQUFMO0FBQ0gsS0FGRDtBQUlIOzs7O3lCQUVJLEMsRUFBRyxDLEVBQUc7QUFFUDtBQUNBLFVBQUksSUFBSSxHQUFHLENBQUMsR0FBSSxLQUFLLFFBQUwsS0FBa0IsQ0FBbEM7QUFDQSxVQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUksS0FBSyxTQUFMLEVBQUwsR0FBeUIsS0FBSyxXQUF4QyxDQUpPLENBTVA7O0FBQ0EsVUFBSSxJQUFJLEdBQUcsS0FBSyxPQUFaLEdBQXNCLENBQTFCLEVBQTZCO0FBQ3pCLFFBQUEsSUFBSSxHQUFHLEtBQUssT0FBWjtBQUNIOztBQUVELFVBQU0sSUFBSSxHQUFHLEtBQUssT0FBWixHQUFzQixLQUFLLFFBQUwsRUFBdkIsR0FBMEMsS0FBSyxPQUFMLENBQWEsS0FBYixFQUEvQyxFQUFzRTtBQUNsRSxRQUFBLElBQUksR0FBRyxLQUFLLE9BQUwsQ0FBYSxLQUFiLEtBQXVCLEtBQUssUUFBTCxFQUF2QixHQUF5QyxLQUFLLE9BQXJEO0FBQ0gsT0FiTSxDQWVQOzs7QUFDQSxXQUFLLFFBQUwsQ0FBYyxHQUFkLENBQWtCO0FBQ2QsUUFBQSxHQUFHLEVBQUUsR0FEUztBQUVkLFFBQUEsSUFBSSxFQUFFO0FBRlEsT0FBbEI7QUFJSDs7OytCQUVVO0FBQ1AsYUFBTyxLQUFLLFFBQUwsQ0FBYyxLQUFkLEVBQVA7QUFDSDs7O2dDQUVXO0FBQ1IsYUFBTyxLQUFLLFFBQUwsQ0FBYyxNQUFkLEVBQVA7QUFDSDs7OzJCQUVNO0FBQ0gsV0FBSyxRQUFMLENBQWMsV0FBZCxDQUEwQixJQUExQjtBQUNIOzs7MkJBRU07QUFDSCxXQUFLLFFBQUwsQ0FBYyxXQUFkLENBQTBCLEtBQTFCO0FBQ0g7OzsrQkFFVSxJLEVBQU07QUFDYjtBQUNBLFdBQUssUUFBTCxDQUFjLElBQWQsQ0FBbUIsSUFBbkI7QUFDSDs7Ozs7Ozs7Ozs7Ozs7OztBQzNFTDs7QUFDQTs7Ozs7Ozs7SUFFTSxjO0FBRUYsMEJBQVksTUFBWixFQUFtQjtBQUFBOztBQUFBOztBQUNmLFNBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxTQUFLLFVBQUwsR0FBa0IsQ0FBQyxDQUFDLHlEQUFELENBQUQsQ0FBNkQsUUFBN0QsQ0FBc0UsTUFBTSxDQUFDLFVBQTdFLENBQWxCO0FBRUEsU0FBSyxnQkFBTDtBQUVBLFNBQUssbUJBQUwsR0FBMkIsS0FBM0I7QUFDQSxTQUFLLDJCQUFMLEdBQW1DLEtBQW5DLENBUGUsQ0FTZjs7QUFDQSxTQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLEVBQXZCLENBQTBCLG9CQUExQixFQUNJLFVBQUMsS0FBRCxFQUFRLFNBQVIsRUFBbUIsUUFBbkI7QUFBQSxhQUFnQyxLQUFJLENBQUMsVUFBTCxDQUFnQixTQUFoQixFQUEyQixRQUEzQixDQUFoQztBQUFBLEtBREo7QUFJQSxTQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLEVBQXZCLENBQTBCLG1CQUExQixFQUNJLFVBQUMsS0FBRCxFQUFRLE9BQVI7QUFBQSxhQUFvQixLQUFJLENBQUMsaUJBQUwsQ0FBdUIsT0FBdkIsQ0FBcEI7QUFBQSxLQURKO0FBSUEsU0FBSyxNQUFMLENBQVksVUFBWixDQUF1QixFQUF2QixDQUEwQixjQUExQixFQUNJLFVBQUMsS0FBRCxFQUFRLElBQVI7QUFBQSxhQUFpQixLQUFJLENBQUMsWUFBTCxDQUFrQixJQUFsQixDQUFqQjtBQUFBLEtBREo7QUFJQSxTQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLEVBQXZCLENBQTBCLG1CQUExQixFQUNJLFVBQUMsS0FBRCxFQUFRLEtBQVI7QUFBQSxhQUFrQixLQUFJLENBQUMsaUJBQUwsQ0FBdUIsS0FBdkIsQ0FBbEI7QUFBQSxLQURKO0FBSUEsU0FBSyxNQUFMLENBQVksVUFBWixDQUF1QixFQUF2QixDQUEwQixnQkFBMUIsRUFDSSxVQUFDLEtBQUQsRUFBUSxNQUFSO0FBQUEsYUFBbUIsS0FBSSxDQUFDLGNBQUwsQ0FBb0IsTUFBcEIsQ0FBbkI7QUFBQSxLQURKO0FBSUg7Ozs7dUNBRWlCO0FBQUE7O0FBRWQsV0FBSyxRQUFMLEdBQWdCLENBQUMsQ0FBQyxnRkFBRCxDQUFqQjtBQUNBLFVBQUksV0FBVyxHQUFHLEtBQUssUUFBTCxDQUFjLE1BQWQsQ0FBcUI7QUFDbkMsUUFBQSxHQUFHLEVBQUUsR0FEOEI7QUFFbkMsUUFBQSxHQUFHLEVBQUUsR0FGOEI7QUFHbkMsUUFBQSxJQUFJLEVBQUU7QUFINkIsT0FBckIsQ0FBbEI7QUFLQSxNQUFBLFdBQVcsQ0FBQyxFQUFaLENBQWUsT0FBZixFQUF3QjtBQUFBLGVBQU0sTUFBSSxDQUFDLGVBQUwsRUFBTjtBQUFBLE9BQXhCO0FBQ0EsTUFBQSxXQUFXLENBQUMsRUFBWixDQUFlLFlBQWYsRUFBNkI7QUFBQSxlQUFNLE1BQUksQ0FBQyxlQUFMLEVBQU47QUFBQSxPQUE3QjtBQUNBLE1BQUEsV0FBVyxDQUFDLEVBQVosQ0FBZSxXQUFmLEVBQTRCLFlBQU07QUFDOUIsUUFBQSxNQUFJLENBQUMsZ0JBQUw7O0FBQ0EsUUFBQSxNQUFJLENBQUMsZUFBTDtBQUNILE9BSEQ7QUFJQSxXQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBdUIsS0FBSyxRQUE1QjtBQUNBLFdBQUssY0FBTCxHQUFzQixJQUFJLDhCQUFKLENBQW1CLEtBQUssUUFBeEIsRUFBa0MsS0FBSyxNQUF2QyxDQUF0QjtBQUVBLFdBQUssYUFBTCxHQUFxQixDQUFDLENBQUMsNEJBQUQsQ0FBdEI7QUFDQSxXQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBdUIsS0FBSyxhQUE1QixFQWxCYyxDQW9CZDs7QUFDQSxXQUFLLGVBQUwsR0FBdUIsQ0FBQyxDQUFDLDRCQUFELENBQUQsQ0FBZ0MsTUFBaEMsQ0FBdUM7QUFDMUQsUUFBQSxJQUFJLEVBQUUscUJBRG9EO0FBRTFELFFBQUEsU0FBUyxFQUFFO0FBRitDLE9BQXZDLEVBR3BCLEtBSG9CLENBR2Q7QUFBQSxlQUFNLE1BQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUFOO0FBQUEsT0FIYyxDQUF2QjtBQUlBLFdBQUssZUFBTCxDQUFxQixLQUFLLGVBQTFCLEVBQTJDLENBQUMsQ0FBNUMsRUF6QmMsQ0EyQmQ7O0FBQ0EsV0FBSyxnQkFBTCxHQUF3QixDQUFDLENBQUMsNkJBQUQsQ0FBRCxDQUFpQyxNQUFqQyxDQUF3QztBQUM1RCxRQUFBLElBQUksRUFBRSxxQkFEc0Q7QUFFNUQsUUFBQSxTQUFTLEVBQUU7QUFGaUQsT0FBeEMsRUFHckIsS0FIcUIsQ0FHZjtBQUFBLGVBQU0sTUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaLEVBQU47QUFBQSxPQUhlLENBQXhCO0FBSUEsV0FBSyxlQUFMLENBQXFCLEtBQUssZ0JBQTFCLEVBQTRDLENBQUMsQ0FBN0MsRUFoQ2MsQ0FrQ2Q7O0FBQ0EsV0FBSyxXQUFMLEdBQW1CLENBQUMsQ0FBQyx1QkFBRCxDQUFELENBQTJCLE1BQTNCLENBQWtDO0FBQ2pELFFBQUEsSUFBSSxFQUFFLFlBRDJDO0FBRWpELFFBQUEsU0FBUyxFQUFFO0FBRnNDLE9BQWxDLEVBR2hCLEtBSGdCLENBR1Y7QUFBQSxlQUFNLE1BQUksQ0FBQyxNQUFMLENBQVksZUFBWixFQUFOO0FBQUEsT0FIVSxDQUFuQjtBQUlBLFdBQUssZUFBTCxDQUFxQixLQUFLLFdBQTFCLEVBQXVDLENBQUMsQ0FBeEMsRUF2Q2MsQ0F5Q2Q7O0FBQ0EsV0FBSyxZQUFMLEdBQW9CLENBQUMsQ0FBQyx3QkFBRCxDQUFELENBQTRCLE1BQTVCLENBQW1DO0FBQ25ELFFBQUEsSUFBSSxFQUFFLG9CQUQ2QztBQUVuRCxRQUFBLFNBQVMsRUFBRTtBQUZ3QyxPQUFuQyxFQUdqQixLQUhpQixDQUdYO0FBQUEsZUFBTSxNQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBTjtBQUFBLE9BSFcsQ0FBcEI7QUFJQSxXQUFLLGVBQUwsQ0FBcUIsS0FBSyxZQUExQixFQUF3QyxDQUFDLENBQXpDLEVBOUNjLENBZ0RkOztBQUNBLFdBQUssV0FBTCxHQUFtQixDQUFDLENBQUMsd0JBQUQsQ0FBRCxDQUE0QixNQUE1QixDQUFtQztBQUNsRCxRQUFBLElBQUksRUFBRSxvQkFENEM7QUFFbEQsUUFBQSxTQUFTLEVBQUU7QUFGdUMsT0FBbkMsRUFHaEIsS0FIZ0IsQ0FHVjtBQUFBLGVBQU0sTUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaLEVBQU47QUFBQSxPQUhVLENBQW5CO0FBSUEsV0FBSyxlQUFMLENBQXFCLEtBQUssV0FBMUIsRUFBdUMsQ0FBQyxDQUF4QyxFQXJEYyxDQXVEZDs7QUFDQSxVQUFJLElBQUksR0FBRyw0QkFBaUIsS0FBakIsQ0FBWDtBQUNBLFdBQUssU0FBTCxHQUFpQixDQUFDLENBQUMsd0JBQUQsQ0FBbEI7QUFDQSxXQUFLLGVBQUwsQ0FBcUIsS0FBSyxTQUExQixFQUFxQyxDQUFDLENBQXRDLEVBMURjLENBNERkOztBQUNBLFdBQUssV0FBTCxHQUFtQixDQUFDLENBQUMsdUJBQUQsQ0FBRCxDQUEyQixNQUEzQixDQUFrQztBQUNqRCxRQUFBLElBQUksRUFBRSxpQkFEMkM7QUFFakQsUUFBQSxTQUFTLEVBQUU7QUFGc0MsT0FBbEMsRUFHaEIsS0FIZ0IsQ0FHVjtBQUFBLGVBQU0sTUFBSSxDQUFDLE1BQUwsQ0FBWSxlQUFaLEVBQU47QUFBQSxPQUhVLENBQW5CO0FBSUEsV0FBSyxlQUFMLENBQXFCLEtBQUssV0FBMUIsRUFBdUMsQ0FBQyxDQUF4QyxFQWpFYyxDQW1FZDs7QUFDQSxXQUFLLFVBQUwsR0FBa0IsQ0FBQyxDQUFDLG9GQUFELENBQW5CO0FBQ0EsV0FBSyxVQUFMLENBQWdCLE1BQWhCLENBQXVCO0FBQ25CLFFBQUEsS0FBSyxFQUFFLEtBRFk7QUFFbkIsUUFBQSxHQUFHLEVBQUUsR0FGYztBQUduQixRQUFBLEtBQUssRUFBRSxHQUhZO0FBSW5CLFFBQUEsSUFBSSxFQUFFO0FBSmEsT0FBdkIsRUFLRyxFQUxILENBS00sT0FMTixFQUtlLFVBQUMsS0FBRCxFQUFRLEVBQVI7QUFBQSxlQUFlLE1BQUksQ0FBQyxNQUFMLENBQVksU0FBWixDQUFzQixFQUFFLENBQUMsS0FBekIsQ0FBZjtBQUFBLE9BTGY7QUFNQSxXQUFLLGVBQUwsQ0FBcUIsS0FBSyxVQUExQixFQUFzQyxDQUFDLENBQXZDLEVBM0VjLENBNkVkOztBQUNBLFdBQUssaUJBQUwsR0FBeUIsQ0FBQyxDQUFDLDZCQUFELENBQUQsQ0FBaUMsTUFBakMsQ0FBd0M7QUFDN0QsUUFBQSxJQUFJLEVBQUUsa0JBRHVEO0FBRTdELFFBQUEsU0FBUyxFQUFFO0FBRmtELE9BQXhDLEVBR3RCLEtBSHNCLENBR2hCO0FBQUEsZUFBTSxNQUFJLENBQUMsTUFBTCxDQUFZLGdCQUFaLEVBQU47QUFBQSxPQUhnQixDQUF6QjtBQUlBLFdBQUssZUFBTCxDQUFxQixLQUFLLGlCQUExQixFQUE2QyxHQUE3QyxFQUFrRCxVQUFsRCxFQWxGYyxDQW9GZDs7QUFDQSxXQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBdUIsQ0FBQyxDQUFDLGFBQUQsQ0FBRCxDQUFpQixHQUFqQixDQUFxQixXQUFyQixFQUFrQyxDQUFsQyxFQUFxQyxHQUFyQyxDQUF5QyxPQUF6QyxFQUFrRCxDQUFsRCxDQUF2QixFQXJGYyxDQXVGZDs7QUFDQSxXQUFLLFlBQUw7QUFDQSxXQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBdUIsT0FBdkIsRUFBZ0MsS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixNQUF6RDtBQUNIOzs7b0NBRWUsUSxFQUFVLEssRUFBb0M7QUFBQSxVQUE3QixhQUE2Qix1RUFBYixZQUFhO0FBQzFELE1BQUEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxPQUFiLEVBQXNCLEtBQXRCO0FBQ0EsTUFBQSxRQUFRLENBQUMsR0FBVCxDQUFhLFlBQWIsRUFBMkIsYUFBM0IsRUFGMEQsQ0FHMUQ7QUFDQTs7QUFDQSxXQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBdUIsUUFBdkI7QUFDSDs7OytCQUVVLFMsRUFBVyxRLEVBQVM7QUFBQTs7QUFDM0I7QUFDQSxXQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsSUFBckIsRUFBMkIsSUFBM0I7O0FBQ0EsVUFBRyxTQUFILEVBQWE7QUFDVCxhQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBdUIsUUFBdkIsRUFBaUMsR0FBakMsRUFBc0MsWUFBTTtBQUN4QyxVQUFBLE1BQUksQ0FBQyxVQUFMLENBQWdCLFdBQWhCLENBQTRCLElBQTVCO0FBQ0gsU0FGRDtBQUdILE9BSkQsTUFJTztBQUNILGFBQUssVUFBTCxDQUFnQixNQUFoQixDQUF1QixRQUF2QixFQUFpQyxHQUFqQyxFQUFzQyxZQUFNO0FBQ3hDLFVBQUEsTUFBSSxDQUFDLFVBQUwsQ0FBZ0IsV0FBaEIsQ0FBNEIsS0FBNUI7QUFDSCxTQUZEO0FBR0g7QUFDSjs7O3NDQUVnQjtBQUNiO0FBQ0EsVUFBSSxJQUFJLEdBQUcsS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixRQUF6QixHQUFvQyxLQUFLLFFBQUwsQ0FBYyxNQUFkLENBQXFCLE9BQXJCLENBQS9DO0FBQ0EsV0FBSyxNQUFMLENBQVksT0FBWixHQUFzQixLQUF0QjtBQUNBLFdBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsV0FBekIsR0FBdUMsSUFBdkM7QUFDSDs7O3NDQUVnQjtBQUNiLFdBQUssMkJBQUwsR0FBbUMsQ0FBQyxLQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLE1BQTdEO0FBQ0EsV0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixLQUF6QjtBQUNIOzs7dUNBRWlCO0FBQ2Q7QUFDQSxVQUFJLEtBQUssMkJBQVQsRUFBcUM7QUFDakMsYUFBSyxNQUFMLENBQVksWUFBWixDQUF5QixJQUF6QjtBQUNIO0FBQ0osSyxDQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztzQ0FFa0IsTyxFQUFRO0FBQ3RCLFdBQUssV0FBTCxDQUFpQixNQUFqQixDQUF3QixRQUF4QixFQUFrQztBQUM5QixRQUFBLElBQUksRUFBRSxPQUFPLEdBQUcsYUFBSCxHQUFtQjtBQURGLE9BQWxDO0FBR0g7OztpQ0FFWSxJLEVBQUs7QUFDZDtBQUNBLFVBQUksUUFBUSxHQUFHLEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsUUFBeEMsQ0FGYyxDQUlkOztBQUNBLFdBQUssU0FBTCxDQUFlLElBQWYsQ0FBb0IsNEJBQWlCLElBQWpCLElBQXlCLEdBQXpCLEdBQStCLDRCQUFpQixRQUFqQixDQUFuRDtBQUVBLFVBQUksUUFBUSxHQUFHLElBQUksR0FBRyxRQUF0QjtBQUNBLFdBQUssYUFBTCxDQUFtQixLQUFuQixDQUF5QixDQUFDLFFBQVEsR0FBRyxHQUFaLEVBQWlCLFFBQWpCLEtBQThCLEdBQXZEO0FBQ0g7OzttQ0FFYyxNLEVBQU87QUFDbEIsV0FBSyxVQUFMLENBQWdCLE1BQWhCLENBQXVCLE9BQXZCLEVBQWdDLE1BQWhDO0FBQ0g7OztzQ0FFaUIsSyxFQUFNO0FBQ3BCLFdBQUssV0FBTCxDQUFpQixNQUFqQixDQUF3QixRQUF4QixFQUFrQztBQUM5QixRQUFBLElBQUksRUFBRSxLQUFLLEdBQUcsaUJBQUgsR0FBdUI7QUFESixPQUFsQztBQUdIOzs7Ozs7Ozs7Ozs7Ozs7O0FDMU1MOztBQUNBOzs7Ozs7OztBQUNBO0FBRUE7QUFDQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsWUFBRCxDQUF4Qjs7SUFFTSxvQjtBQUNGLGdDQUFZLE1BQVosRUFBb0IsYUFBcEIsRUFBa0M7QUFBQTs7QUFBQTs7QUFDOUIsSUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLG1FQUFaO0FBQ0EsU0FBSyxNQUFMLEdBQWMsTUFBZDtBQUNBLFNBQUssWUFBTCxHQUFvQixLQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWdCLENBQWhCLENBQXBCLENBSDhCLENBSzlCOztBQUNBLFNBQUssY0FBTCxHQUFzQixLQUFLLE1BQUwsQ0FBWSxTQUFaLENBQXNCLElBQXRCLEVBQTRCLENBQUMsUUFBRCxFQUFXLHFCQUFYLEVBQWtDLE9BQWxDLENBQTVCLENBQXRCLENBTjhCLENBTWlFOztBQUUvRixTQUFLLElBQUw7QUFDQSxTQUFLLGdCQUFMO0FBQ0EsU0FBSyxVQUFMLENBQWdCLElBQWhCLEVBVjhCLENBWTlCOztBQUNBLFNBQUssWUFBTCxHQWI4QixDQWU5Qjs7QUFDQSxTQUFLLE1BQUwsQ0FBWSxFQUFaLENBQWUsT0FBZixFQUF3QjtBQUFBLGFBQU0sS0FBSSxDQUFDLGVBQUwsRUFBTjtBQUFBLEtBQXhCO0FBRUEsU0FBSyxhQUFMLEdBQXFCLElBQXJCLENBbEI4QixDQW1COUI7O0FBQ0EsU0FBSyxVQUFMLEdBQWtCLElBQWxCLENBcEI4QixDQXFCOUI7O0FBQ0EsU0FBSyxrQkFBTCxHQUEwQixLQUExQixDQXRCOEIsQ0F1QjlCOztBQUNBLFNBQUsscUJBQUwsR0FBNkIsQ0FBN0I7QUFDQSxTQUFLLFlBQUwsR0FBb0IsR0FBcEI7QUFDQSxTQUFLLE9BQUwsR0FBZSxLQUFmO0FBRUEsU0FBSyxVQUFMLENBQWdCLFNBQWhCLENBQTBCO0FBQUEsYUFBTSxLQUFJLENBQUMsV0FBTCxFQUFOO0FBQUEsS0FBMUI7QUFDQSxTQUFLLFdBQUwsQ0FBaUIsSUFBakIsRUE3QjhCLENBK0I5Qjs7QUFDQSxRQUFHLFVBQVUsS0FBSyxXQUFsQixFQUE4QjtBQUMxQixNQUFBLFVBQVUsQ0FBQyxRQUFYLENBQW9CLFlBQU07QUFDdEIsUUFBQSxLQUFJLENBQUMsa0JBQUw7O0FBQ0EsUUFBQSxLQUFJLENBQUMsVUFBTCxDQUFnQixPQUFoQixDQUF3QixvQkFBeEI7QUFDSCxPQUhEO0FBSUg7O0FBRUQsU0FBSyxZQUFMLENBQWtCLFlBQWxCLEdBQWlDLFlBQU07QUFDbkMsTUFBQSxLQUFJLENBQUMsWUFBTCxDQUFrQixLQUFJLENBQUMsWUFBTCxDQUFrQixXQUFwQztBQUNILEtBRkQ7O0FBSUEsU0FBSyxVQUFMLENBQWdCLEVBQWhCLENBQW1CLGNBQW5CLEVBQW1DLFlBQU07QUFDckMsVUFBRyxhQUFhLENBQUMsU0FBZCxJQUF5QixJQUE1QixFQUFpQztBQUM3QixRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksdUZBQVosRUFENkIsQ0FFN0I7O0FBQ0EsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLHlEQUFaO0FBQ0EsUUFBQSxhQUFhLENBQUMsTUFBZCxHQUF1QixLQUF2QjtBQUNBLFFBQUEsYUFBYSxDQUFDLFNBQWQsR0FBMEIsSUFBSSx5QkFBSixDQUFtQixhQUFuQixDQUExQjtBQUNBLFlBQUcsT0FBTyxhQUFhLENBQUMsUUFBckIsSUFBaUMsVUFBcEMsRUFBZ0QsYUFBYSxDQUFDLFFBQWQsQ0FBdUIsYUFBYSxDQUFDLFNBQXJDO0FBQ25EO0FBQ0osS0FURDs7QUFXQSxTQUFLLFlBQUwsQ0FBa0IsZ0JBQWxCLEdBQXFDLFlBQU07QUFDdkMsTUFBQSxLQUFJLENBQUMsVUFBTCxDQUFnQixPQUFoQixDQUF3QixjQUF4QjtBQUNILEtBRkQ7O0FBR0EsUUFBRyxLQUFLLFlBQUwsQ0FBa0IsUUFBbEIsSUFBOEIsSUFBakMsRUFBc0M7QUFDbEM7QUFDQTtBQUNBLFdBQUssVUFBTCxDQUFnQixPQUFoQixDQUF3QixjQUF4QjtBQUNIOztBQUVELElBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxnRUFBWjtBQUVIOzs7OzJCQUVLO0FBQ0Y7QUFDQSxXQUFLLFlBQUwsQ0FBa0IsZUFBbEIsQ0FBa0MsVUFBbEMsRUFGRSxDQUlGOztBQUNBLFdBQUssVUFBTCxHQUFrQixLQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLDBDQUFqQixFQUE2RCxNQUE3RCxFQUFsQixDQUxFLENBTUY7O0FBQ0EsV0FBSyxVQUFMLENBQWdCLEtBQWhCLENBQXNCLEtBQUssTUFBTCxDQUFZLEtBQVosRUFBdEI7QUFDQSxXQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBdUIsS0FBSyxNQUFMLENBQVksTUFBWixFQUF2QjtBQUNIOzs7dUNBRWlCO0FBQ2QsV0FBSyxVQUFMLEdBQWtCLElBQUksOEJBQUosQ0FBbUIsSUFBbkIsQ0FBbEI7QUFDSDs7OytCQUVVLFMsRUFBd0I7QUFBQSxVQUFiLFFBQWEsdUVBQUYsQ0FBRTtBQUMvQixXQUFLLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FBd0Isb0JBQXhCLEVBQThDLENBQUMsU0FBRCxFQUFZLFFBQVosQ0FBOUM7QUFDSDs7O21DQUVhLENBRWI7OztzQ0FFZ0I7QUFDYixVQUFHLEtBQUssWUFBTCxDQUFrQixNQUFyQixFQUE0QjtBQUN4QixhQUFLLElBQUw7QUFDSCxPQUZELE1BRU87QUFDSCxhQUFLLEtBQUw7QUFDSDtBQUNKOzs7a0NBRVk7QUFDVCxVQUFJLE9BQU8sR0FBRyxLQUFLLFlBQUwsQ0FBa0IsV0FBbEIsR0FBZ0MsR0FBOUM7QUFDQSxXQUFLLFlBQUwsQ0FBa0IsV0FBbEIsR0FBZ0MsT0FBTyxHQUFHLEtBQUssWUFBTCxDQUFrQixRQUE1QixHQUF1QyxLQUFLLFlBQUwsQ0FBa0IsUUFBekQsR0FBb0UsT0FBcEc7QUFDSDs7O2tDQUVZO0FBQ1QsVUFBSSxPQUFPLEdBQUcsS0FBSyxZQUFMLENBQWtCLFdBQWxCLEdBQWdDLENBQTlDO0FBQ0EsV0FBSyxZQUFMLENBQWtCLFdBQWxCLEdBQWdDLE9BQU8sR0FBRyxLQUFLLFlBQUwsQ0FBa0IsUUFBNUIsR0FBdUMsS0FBSyxZQUFMLENBQWtCLFFBQXpELEdBQW9FLE9BQXBHO0FBQ0g7OzttQ0FFYTtBQUNWLFVBQUksT0FBTyxHQUFHLEtBQUssWUFBTCxDQUFrQixXQUFsQixHQUFnQyxHQUE5QztBQUNBLFdBQUssWUFBTCxDQUFrQixXQUFsQixHQUFnQyxPQUFPLEdBQUcsQ0FBVixHQUFjLENBQWQsR0FBa0IsT0FBbEQ7QUFDSDs7O21DQUVhO0FBQ1YsVUFBSSxPQUFPLEdBQUcsS0FBSyxZQUFMLENBQWtCLFdBQWxCLEdBQWdDLENBQTlDO0FBQ0EsV0FBSyxZQUFMLENBQWtCLFdBQWxCLEdBQWdDLE9BQU8sR0FBRyxDQUFWLEdBQWMsQ0FBZCxHQUFrQixPQUFsRDtBQUNIOzs7MkJBRUs7QUFDRixXQUFLLFlBQUwsQ0FBa0IsSUFBbEI7QUFDQSxVQUFHLEtBQUssT0FBUixFQUFpQixLQUFLLE9BQUwsR0FBZSxLQUFmO0FBQ2pCLFdBQUssV0FBTCxDQUFpQixJQUFqQjtBQUNBLFdBQUssVUFBTCxDQUFnQixPQUFoQixDQUF3QixtQkFBeEIsRUFBNkMsQ0FBQyxLQUFLLFlBQUwsQ0FBa0IsTUFBaEU7QUFDSDs7OzRCQUVNO0FBQ0gsVUFBRyxLQUFLLE9BQVIsRUFBaUIsS0FBSyxPQUFMLEdBQWUsS0FBZjtBQUNqQixXQUFLLFlBQUwsQ0FBa0IsS0FBbEI7QUFDQSxXQUFLLFdBQUwsQ0FBaUIsS0FBakI7QUFDQSxXQUFLLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FBd0IsbUJBQXhCLEVBQTZDLENBQUMsS0FBSyxZQUFMLENBQWtCLE1BQWhFO0FBQ0g7OztzQ0FFZ0I7QUFDYixVQUFJLEtBQUssR0FBRyxLQUFLLFlBQUwsQ0FBa0IsS0FBOUI7QUFDQSxXQUFLLFlBQUwsQ0FBa0IsS0FBbEIsR0FBMEIsQ0FBQyxLQUEzQjtBQUNBLFdBQUssVUFBTCxDQUFnQixPQUFoQixDQUF3QixtQkFBeEIsRUFBNkMsS0FBN0M7QUFDSDs7OzhCQUVTLE0sRUFBTztBQUNiLFdBQUssWUFBTCxDQUFrQixNQUFsQixHQUEyQixNQUEzQjtBQUNBLFdBQUssVUFBTCxDQUFnQixPQUFoQixDQUF3QixnQkFBeEIsRUFBMEMsTUFBMUM7QUFDSDs7O3VDQUVpQjtBQUNkLFVBQUksVUFBVSxLQUFLLFdBQWYsSUFBOEIsQ0FBQyxVQUFVLENBQUMsT0FBOUMsRUFBdUQ7QUFDbkQ7QUFDSDs7QUFDRCxNQUFBLFVBQVUsQ0FBQyxNQUFYLENBQWtCLEtBQUssVUFBTCxDQUFnQixDQUFoQixDQUFsQjtBQUNIOzs7eUNBRW1CO0FBQ2hCLFVBQUcsVUFBVSxDQUFDLFlBQWQsRUFBMkI7QUFDdkIsYUFBSyxVQUFMLENBQWdCLFFBQWhCLENBQXlCLG9CQUF6QjtBQUNILE9BRkQsTUFHSTtBQUNBLGFBQUssVUFBTCxDQUFnQixXQUFoQixDQUE0QixvQkFBNUI7QUFDSDtBQUNKOzs7a0NBRWEsVSxFQUFXO0FBQ3JCLFVBQUksVUFBVSxLQUFLLFdBQWYsSUFBOEIsQ0FBQyxVQUFVLENBQUMsT0FBOUMsRUFBdUQ7QUFDbkQ7QUFDSDs7QUFFRCxVQUFHLFVBQUgsRUFBYztBQUNWLFFBQUEsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsS0FBSyxVQUFMLENBQWdCLENBQWhCLENBQW5CO0FBQ0gsT0FGRCxNQUVPO0FBQ0gsUUFBQSxVQUFVLENBQUMsSUFBWDtBQUNIO0FBQ0o7QUFFRDs7Ozs7O2tDQUdhO0FBQ1Q7QUFDQSxNQUFBLFlBQVksQ0FBQyxLQUFLLFVBQU4sQ0FBWjtBQUNBLFdBQUssVUFBTCxHQUFrQixDQUFsQixDQUhTLENBS1Q7O0FBQ0EsVUFBRyxLQUFLLGFBQVIsRUFBc0I7QUFDakIsYUFBSyxhQUFMO0FBQ0o7QUFDSjs7O2lDQUVZLEksRUFBSztBQUNkLFVBQUcsS0FBSyxPQUFMLElBQWdCLEtBQUssT0FBTCxJQUFnQixLQUFLLFlBQUwsQ0FBa0IsV0FBckQsRUFBaUU7QUFDN0QsYUFBSyxLQUFMO0FBQ0EsYUFBSyxPQUFMLEdBQWUsS0FBZjtBQUNIOztBQUNELFdBQUssVUFBTCxDQUFnQixPQUFoQixDQUF3QixjQUF4QixFQUF3QyxJQUF4QztBQUNIOzs7b0NBRWM7QUFBQTs7QUFDWDtBQUNBLFdBQUssVUFBTCxDQUFnQixJQUFoQixFQUFzQixLQUFLLFlBQTNCLEVBRlcsQ0FJWDs7QUFDQSxXQUFLLFVBQUwsR0FBa0IsVUFBVSxDQUFDLFlBQUk7QUFDN0IsUUFBQSxNQUFJLENBQUMsVUFBTCxDQUFnQixLQUFoQixFQUF1QixNQUFJLENBQUMsWUFBNUI7QUFDSCxPQUYyQixFQUV6QixLQUFLLHFCQUFMLEdBQTZCLElBRkosQ0FBNUI7QUFHSDs7O2dDQUVXLEssRUFBTztBQUNmLFdBQUssYUFBTCxHQUFxQixLQUFyQixDQURlLENBR2Y7O0FBQ0EsTUFBQSxZQUFZLENBQUMsS0FBSyxVQUFOLENBQVo7QUFDQSxXQUFLLFVBQUwsR0FBa0IsQ0FBbEIsQ0FMZSxDQU9mOztBQUNBLFdBQUssVUFBTCxDQUFnQixJQUFoQixFQVJlLENBVWY7O0FBQ0EsVUFBRyxLQUFILEVBQVM7QUFDTCxhQUFLLGFBQUw7QUFDSDtBQUVKLEssQ0FFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7Ozs7eUNBQ3FCO0FBQ2pCLFVBQUksS0FBSyxHQUFHLEtBQUssWUFBakIsQ0FEaUIsQ0FFakI7O0FBQ0EsVUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQU4sR0FBbUIsS0FBSyxDQUFDLFdBQTFDLENBSGlCLENBSWpCOztBQUNBLFVBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFsQjtBQUNBLFVBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxZQUFuQixDQU5pQixDQU9qQjs7QUFDQSxVQUFJLFlBQVksR0FBRyxLQUFLLEdBQUcsTUFBM0IsQ0FSaUIsQ0FTakI7O0FBQ0EsVUFBRyxZQUFZLEdBQUcsVUFBbEIsRUFBOEIsS0FBSyxHQUFHLE1BQU0sR0FBRyxVQUFqQixDQUE5QixDQUNBO0FBREEsV0FFSyxNQUFNLEdBQUcsS0FBSyxHQUFHLFVBQWpCO0FBRUwsYUFBTztBQUNILFFBQUEsS0FBSyxFQUFFLEtBREo7QUFFSCxRQUFBLE1BQU0sRUFBRTtBQUZMLE9BQVA7QUFJSDs7Ozs7Ozs7O0FDN1BMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy81R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJtb2R1bGUuZXhwb3J0cz17XG4gICAgXCJjbGllbnRfaWRcIjogXCJzY2FsYXJcIixcbiAgICBcImNsaWVudF92ZXJcIjogXCIyLjZcIixcbiAgICBcIm5hdGl2ZVwiOiB0cnVlLFxuICAgIFwiaWRcIjogXCJcIixcbiAgICBcImFwaV9rZXlcIjogXCJcIlxufSIsImltcG9ydCB7IEFubm90YXRpb24gfSBmcm9tIFwiLi9hbm5vdGF0aW9uLmpzXCI7XG5cbmNsYXNzIEFubm90YXRpb25NYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLmFubm90YXRpb25zID0gW107XG4gICAgICAgIHRoaXMub25vbXlWb2NhYnVsYXJ5ID0gW107XG4gICAgfVxuXG4gICAgUG9wdWxhdGVGcm9tSlNPTihqc29uKXtcbiAgICBcbiAgICAgICAgaWYgKGpzb24ubGVuZ3RoID09IDApe1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiSlNPTiBjb250YWlucyBubyBhbm5vdGF0aW9ucy5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mKGpzb24uaXRlbXMpKSB7ICAvLyBWZXJzaW9uIDFcbiAgICAgICAgICAgIGZvcihsZXQgb2JqZWN0IG9mIGpzb24pe1xuICAgICAgICAgICAgICAgIHRoaXMuUmVnaXN0ZXJBbm5vdGF0aW9uKG9iamVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7ICAvLyBWZXJzaW9uIDJcbiAgICAgICAgICAgIGZvciAobGV0IG9iamVjdCBvZiBqc29uLml0ZW1zWzBdLml0ZW1zKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5SZWdpc3RlckFubm90YXRpb24ob2JqZWN0LCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGpzb24uaXRlbXNbMF0pKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIFJlZ2lzdGVyQW5ub3RhdGlvbihqc29uT2JqZWN0LCBjYW52YXNPYmplY3Qpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiUmVnaXN0ZXJpbmcgbmV3IGFubm90YXRpb24gd2l0aCBJRCBcIiArIGpzb25PYmplY3QuaWQpO1xuICAgICAgICBsZXQgYW5ubyA9IG5ldyBBbm5vdGF0aW9uKGpzb25PYmplY3QsIGNhbnZhc09iamVjdCk7XG4gICAgICAgIHRoaXMuYW5ub3RhdGlvbnMucHVzaChhbm5vKTtcbiAgICB9XG5cbiAgICBSZW1vdmVBbm5vdGF0aW9uKGlkKXtcbiAgICAgICAgdGhpcy5hbm5vdGF0aW9ucyA9IHRoaXMuYW5ub3RhdGlvbnMuZmlsdGVyKChvYmopID0+IHtcbiAgICAgICAgICAgIGlmICgndW5kZWZpbmVkJyA9PSB0eXBlb2Yob2JqLml0ZW1zKSkgeyAvLyBWZXJzaW9uIDFcbiAgICAgICAgICAgICAgICByZXR1cm4gaWQgIT09IG9iai5pZDtcbiAgICAgICAgICAgIH0gZWxzZSB7IC8vIFZlcnNpb24gMlxuICAgICAgICAgICAgICAgIHJldHVybiBpZCAhPT0gb2JqLml0ZW1zWzBdLml0ZW1zWzBdLml0ZW1zWzBdLmlkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgdGhlIGdpdmVuIGFubm90YXRpb24gaW4gdGhlIHN0b3JlZCBhcnJheVxuICAgICAqL1xuICAgIFVwZGF0ZUFubm90YXRpb24oYW5ub3RhdGlvbiwgb2xkSUQpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiVXBkYXRpbmcgYW5ub3RhdGlvbiBJRCBcIiArIG9sZElEICsgXCIgdG8gXCIgKyBhbm5vdGF0aW9uLm1ldGFkYXRhLmlkKTtcbiAgICAgICAgdGhpcy5SZW1vdmVBbm5vdGF0aW9uKG9sZElEKTtcbiAgICAgICAgLy90aGlzLlJlZ2lzdGVyQW5ub3RhdGlvbihhbm5vdGF0aW9uKTtcbiAgICAgICAgdGhpcy5Qb3B1bGF0ZUZyb21KU09OKGFubm90YXRpb24pO1xuICAgIH1cblxuICAgIEFubm90YXRpb25zQXRUaW1lKHRpbWUpe1xuXG4gICAgICAgIC8vIFRPRE86IFJlZW5hYmxlIHdpdGggc29tZSBraW5kIG9mIGZvcmNlIHBhcmFtZXRlclxuXG4gICAgICAgIC8vIC8vIElmIHRoZSBsYXN0IHRpbWUgcmVxdWVzdGVkIGlzIGFza2VkIGZvciBhZ2FpbiwganVzdCBnaXZlIGJhY2sgdGhlIGNhY2hlZCByZXN1bHRcbiAgICAgICAgLy8gaWYodGltZU1TID09IHRoaXMubGFzdFRpbWVSZXF1ZXN0ZWQpe1xuICAgICAgICAvLyAgICAgLy9jb25zb2xlLmxvZyhcIlVzaW5nIGNhY2hlXCIpO1xuICAgICAgICAvLyAgICAgcmV0dXJuIHRoaXMuY2FjaGVkO1xuICAgICAgICAvLyB9XG4gICAgICAgIC8vIHRoaXMubGFzdFRpbWVSZXF1ZXN0ZWQgPSB0aW1lTVM7XG5cbiAgICAgICAgLy8gRmlsdGVyIGFsbCBsb2FkZWQgYW5ub3RhdGlvbnMgdGhhdCBmaXQgd2l0aGluIHRoZSByYW5nZSBxdWVyeS5cbiAgICAgICAgbGV0IGZpbHRlcmVkID0gdGhpcy5hbm5vdGF0aW9ucy5maWx0ZXIoZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS5iZWdpblRpbWUgPD0gdGltZSAmJiB0aW1lIDw9IGl0ZW0uZW5kVGltZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jYWNoZWQgPSBmaWx0ZXJlZDtcblxuICAgICAgICByZXR1cm4gZmlsdGVyZWQ7XG4gICAgfVxuXG4gICAgR2V0T25vbXlWb2NhYnVsYXJ5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vbm9teVZvY2FidWxhcnk7XG4gICAgfVxuXG4gICAgVXBkYXRlT25vbXlWb2NhYnVsYXJ5KHZvY2FidWxhcnkpIHtcbiAgICAgICAgdGhpcy5vbm9teVZvY2FidWxhcnkgPSB2b2NhYnVsYXJ5O1xuICAgIH1cblxufVxuXG5leHBvcnQgeyBBbm5vdGF0aW9uTWFuYWdlciB9OyIsIi8vLyBBIHdyYXBwZXIgZm9yIEpTT04gb2JqZWN0cy5cbmNsYXNzIEFubm90YXRpb24ge1xuXG4gICAgY29uc3RydWN0b3IoanNvbiA9IG51bGwsIGNhbnZhcyA9IG51bGwpIHtcblxuICAgICAgICBsZXQgdmVyc2lvbiA9IFwidjJcIjtcblxuICAgICAgICBpZiAoanNvbikge1xuICAgICAgICAgICAgaWYgKCd1bmRlZmluZWQnID09IHR5cGVvZihqc29uLml0ZW1zKSkge1xuICAgICAgICAgICAgICAgIHZlcnNpb24gPSBcInYxXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZlcnNpb24gPSBcInYyXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyB2ZXIxXG4gICAgICAgIGlmICh2ZXJzaW9uID09IFwidjFcIikge1xuICAgICAgICAgICAgdGhpc1tcIkBjb250ZXh0XCJdID0gXCJodHRwOi8vd3d3LnczLm9yZy9ucy9hbm5vLmpzb25sZFwiO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzW1wicmVxdWVzdFwiXSA9IHtcbiAgICAgICAgICAgICAgICBcImNsaWVudF9pZFwiOiBcInNjYWxhclwiLFxuICAgICAgICAgICAgICAgIFwiY2xpZW50X3ZlclwiOiBcIjIuNS4xMlwiLFxuICAgICAgICAgICAgICAgIFwiaXRlbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIm5hdGl2ZVwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIl9fQ0hFQ0tfQ09ORklHX0ZJTEVfX0lEX19cIixcbiAgICAgICAgICAgICAgICAgICAgXCJhcGlfa2V5XCI6IFwiX19DSEVDS19DT05GSUdfRklMRV9fQVBJX0tFWV9fXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYWN0aW9uXCI6IFwiVE9CRUZJTExFRFwiLFxuICAgICAgICAgICAgICAgICAgICBcImZvcm1hdFwiOiBcImpzb25cIlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzW1widHlwZVwiXSA9IFwiQW5ub3RhdGlvblwiOyAgXG4gICAgICAgICAgICB0aGlzW1wibW90aXZhdGlvblwiXSA9IFwiaGlnaGxpZ2h0aW5nXCI7XG4gICAgICAgICAgICB0aGlzW1wiYm9keVwiXSA9IFtdO1xuICAgICAgICAgICAgdGhpc1tcInRhcmdldFwiXSA9IHt9O1xuICAgICAgICAgICAgdGhpc1tcImFubm90YXRpb25fdmVyc2lvblwiXSA9IFwidjFcIjtcblxuICAgICAgICAgICAgdGhpcy5yZWFkQ29uZmlnKHZlcnNpb24pO1xuXG4gICAgICAgICAgICBpZiAoanNvbikge1xuICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywganNvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB2ZXIyIGRvY3Mvd2ViYW5ub3RhdGlvbl9zcGVjL3NhbXBsZV8yLjAuanNvblxuICAgICAgICAgICAgdGhpc1tcIkBjb250ZXh0XCJdID0gW1wiaHR0cDovL3d3dy53My5vcmcvbnMvYW5uby5qc29ubGRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImh0dHA6Ly9paWlmLmlvL2FwaS9wcmVzZW50YXRpb24vMy9jb250ZXh0Lmpzb25cIl07XG4gICAgICAgICAgICB0aGlzW1wic2VydmljZVwiXSA9IFt7XG4gICAgICAgICAgICAgICAgXCJjbGllbnRfaWRcIjogXCJzY2FsYXJcIixcbiAgICAgICAgICAgICAgICBcImNsaWVudF92ZXJcIjogXCIyLjUuMTJcIixcbiAgICAgICAgICAgICAgICBcIml0ZW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJuYXRpdmVcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJfX0NIRUNLX0NPTkZJR19GSUxFX19JRF9fXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYXBpX2tleVwiOiBcIl9fQ0hFQ0tfQ09ORklHX0ZJTEVfX0FQSV9LRVlfX1wiLFxuICAgICAgICAgICAgICAgICAgICBcImFjdGlvblwiOiBcIlRPQkVGSUxMRURcIixcbiAgICAgICAgICAgICAgICAgICAgXCJmb3JtYXRcIjogXCJqc29uXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XTtcbiAgICAgICAgICAgIHRoaXNbXCJ0eXBlXCJdID0gXCJNYW5pZmVzdFwiO1xuICAgICAgICAgICAgdGhpc1tcIml0ZW1zXCJdID0gW107XG4gICAgICAgICAgICBpZiAoY2FudmFzKSB7XG4gICAgICAgICAgICAgICAgdGhpc1tcIml0ZW1zXCJdLnB1c2goIGNhbnZhcyApOyAgLy8gVGhlIFwiQ2FudmFzXCJcbiAgICAgICAgICAgICAgICB0aGlzW1wiaXRlbXNcIl1bMF0uaXRlbXMgPSBbIGpzb24gXTsgIC8vIFRoZSBcIkFubm90YXRpb25QYWdlXCIgKyBcIkFubm90YXRpb25cIlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpc1tcImFubm90YXRpb25fdmVyc2lvblwiXSA9IFwidjJcIjtcblxuICAgICAgICAgICAgdGhpcy5yZWFkQ29uZmlnKHZlcnNpb24pO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZihqc29uKSB7XG4gICAgICAgICAgICAvLyBDb21wdXRlIHJlYWQgb25seSBlYXN5IGFjY2VzcyBwcm9wZXJ0aWVzXG4gICAgICAgICAgICB0aGlzLnJlY2FsY3VsYXRlKCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIHJlYWRDb25maWcodmVyc2lvbikge1xuICAgICAgICBjb25zdCBjb25maWcgPSByZXF1aXJlKFwiLi4vYW5ub3RhdG9yLWNvbmZpZy5qc29uXCIpO1xuICAgICAgICBpZiAodmVyc2lvbiA9PSBcInYxXCIpIHtcbiAgICAgICAgICAgIC8vIHZlcjFcbiAgICAgICAgICAgIHRoaXNbXCJyZXF1ZXN0XCJdW1wiY2xpZW50X2lkXCJdID0gY29uZmlnLmNsaWVudF9pZDtcbiAgICAgICAgICAgIHRoaXNbXCJyZXF1ZXN0XCJdW1wiY2xpZW50X3ZlclwiXSA9IGNvbmZpZy5jbGllbnRfdmVyO1xuICAgICAgICAgICAgdGhpc1tcInJlcXVlc3RcIl1bXCJpdGVtc1wiXVtcIm5hdGl2ZVwiXSA9IGNvbmZpZy5uYXRpdmU7XG4gICAgICAgICAgICB0aGlzW1wicmVxdWVzdFwiXVtcIml0ZW1zXCJdW1wiaWRcIl0gPSBjb25maWcuaWQ7XG4gICAgICAgICAgICB0aGlzW1wicmVxdWVzdFwiXVtcIml0ZW1zXCJdW1wiYXBpX2tleVwiXSA9IGNvbmZpZy5hcGlfa2V5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gdmVyMlxuICAgICAgICAgICAgdGhpc1tcInNlcnZpY2VcIl1bMF1bXCJjbGllbnRfaWRcIl0gPSBjb25maWcuY2xpZW50X2lkO1xuICAgICAgICAgICAgdGhpc1tcInNlcnZpY2VcIl1bMF1bXCJjbGllbnRfdmVyXCJdID0gY29uZmlnLmNsaWVudF92ZXI7XG4gICAgICAgICAgICB0aGlzW1wic2VydmljZVwiXVswXVtcIml0ZW1zXCJdW1wibmF0aXZlXCJdID0gY29uZmlnLm5hdGl2ZTtcbiAgICAgICAgICAgIHRoaXNbXCJzZXJ2aWNlXCJdWzBdW1wiaXRlbXNcIl1bXCJpZFwiXSA9IGNvbmZpZy5pZDtcbiAgICAgICAgICAgIHRoaXNbXCJzZXJ2aWNlXCJdWzBdW1wiaXRlbXNcIl1bXCJhcGlfa2V5XCJdID0gY29uZmlnLmFwaV9rZXk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLy8gQ29tcHV0ZSByZWFkIG9ubHkgZWFzeSBhY2Nlc3MgcHJvcGVydGllc1xuICAgIHJlY2FsY3VsYXRlKCkge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuXG4gICAgICAgIGlmICgndW5kZWZpbmVkJyA9PSB0eXBlb2YodGhpcy5pdGVtcykpIHsgLy8gVmVyc2lvbiAxXG4gICAgICAgICAgICB2YXIgdGltZVNsaWNlID0gdGhpcy50YXJnZXQuc2VsZWN0b3IuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0udHlwZSA9PT0gXCJGcmFnbWVudFNlbGVjdG9yXCI7XG4gICAgICAgICAgICAgIH0pWzBdLnZhbHVlO1xuICAgICAgICB9IGVsc2UgeyAvLyBWZXJzaW9uIDJcbiAgICAgICAgICAgIHZhciB0aW1lU2xpY2UgPSB0aGlzLml0ZW1zWzBdLml0ZW1zWzBdLml0ZW1zWzBdLnRhcmdldC5zZWxlY3Rvci52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aW1lU2xpY2UgPSB0aW1lU2xpY2UucmVwbGFjZSgnI3Q9bnB0OicsJ3Q9Jyk7XG4gICAgICAgIHRpbWVTbGljZSA9IHRpbWVTbGljZS5yZXBsYWNlKFwidD1cIiwgXCJcIik7XG5cbiAgICAgICAgLy8vIFN0YXJ0IHRpbWUgaW4gc2Vjb25kc1xuICAgICAgICB0aGlzLmJlZ2luVGltZSA9IHBhcnNlRmxvYXQodGltZVNsaWNlLnNwbGl0KFwiLFwiKVswXSk7XG4gICAgICAgIC8vLyBFbmQgdGltZSBpbiBzZWNvbmRzXG4gICAgICAgIHRoaXMuZW5kVGltZSA9IHBhcnNlRmxvYXQodGltZVNsaWNlLnNwbGl0KFwiLFwiKVsxXSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdiZWdpblRpbWU6ICcgKyB0aGlzLmJlZ2luVGltZSArICcgZW5kVGltZTogJyArIHRoaXMuZW5kVGltZSk7XG5cbiAgICAgICAgLy8vIEV4dHJhY3QgdGFncyBmcm9tIGFubm90YXRpb25cbiAgICAgICAgaWYgKCd1bmRlZmluZWQnID09IHR5cGVvZih0aGlzLml0ZW1zKSkgeyAvLyBWZXJzaW9uIDFcbiAgICAgICAgICAgIHRoaXMudGFncyA9IHRoaXMuYm9keS5maWx0ZXIoaXRlbSA9PiBpdGVtLnB1cnBvc2UgPT09IFwidGFnZ2luZ1wiKS5tYXAoaXRlbSA9PiBpdGVtLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHsgLy8gVmVyc2lvbiAyXG4gICAgICAgICAgICB0aGlzLnRhZ3MgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5pdGVtc1swXS5pdGVtc1swXS5pdGVtc1swXS5ib2R5Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXRlbXNbMF0uaXRlbXNbMF0uaXRlbXNbMF0uYm9keVtqXS5wdXJwb3NlICE9ICd0YWdnaW5nJykgY29udGludWU7XG4gICAgICAgICAgICAgICAgaWYgKCd1bmRlZmluZWQnICE9IHR5cGVvZih0aGlzLml0ZW1zWzBdLml0ZW1zWzBdLml0ZW1zWzBdLmJvZHlbal0udmFsdWUpKSB7ICAvLyBCYXNpYyB0YWdcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWdzLnB1c2godGhpcy5pdGVtc1swXS5pdGVtc1swXS5pdGVtc1swXS5ib2R5W2pdLnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCd1bmRlZmluZWQnICE9IHR5cGVvZih0aGlzLml0ZW1zWzBdLml0ZW1zWzBdLml0ZW1zWzBdLmJvZHlbal0uc291cmNlKSkgeyAgLy8gT25vbXkgdGFnXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFncy5wdXNoKHRoaXMuaXRlbXNbMF0uaXRlbXNbMF0uaXRlbXNbMF0uYm9keVtqXS5zb3VyY2UubGFiZWxbJ2VuJ10pOyAgLy8gVE9ETzogZW5nbGlzaCBoYXJkLWNvZGVkIGhlcmVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coJ1RhZ3M6ICcgKyB0aGlzLnRhZ3MpO1xuXG4gICAgICAgIC8vIFN0YXJ0IGFuZCBlbmQgcG9seSBwb2ludHNcbiAgICAgICAgdGhpcy5wb2x5U3RhcnQgPSBudWxsO1xuICAgICAgICB0aGlzLnBvbHlFbmQgPSBudWxsO1xuXG4gICAgICAgIHZhciBwb2ludHNTZWxlY3RvciA9IFtdO1xuICAgICAgICBpZiAoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mKHRoaXMuaXRlbXMpKSB7IC8vIFZlcnNpb24gMVxuICAgICAgICAgICAgcG9pbnRzU2VsZWN0b3IgPSB0aGlzLnRhcmdldC5zZWxlY3Rvci5maWx0ZXIoaXRlbSA9PiBpdGVtLnR5cGUgPT09IFwiU3ZnU2VsZWN0b3JcIik7XG4gICAgICAgIH0gZWxzZSB7IC8vIFZlcnNpb24gMlxuICAgICAgICAgICAgcG9pbnRzU2VsZWN0b3IgPSAoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mKHRoaXMuaXRlbXNbMF0uaXRlbXNbMF0uaXRlbXNbMF0udGFyZ2V0LnNlbGVjdG9yLnJlZmluZWRCeSkpID8gW3RoaXMuaXRlbXNbMF0uaXRlbXNbMF0uaXRlbXNbMF0udGFyZ2V0LnNlbGVjdG9yLnJlZmluZWRCeV0gOiBbXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocG9pbnRzU2VsZWN0b3IubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGV0IHBvaW50c1N2ZyA9IHBvaW50c1NlbGVjdG9yWzBdLnZhbHVlO1xuICAgICAgICAgICAgbGV0IHJlZ0V4U3RyaW5nID0gbmV3IFJlZ0V4cChcIig/OnBvaW50cz0nKSguKj8pKD86JylcIiwgXCJpZ1wiKTtcbiAgICAgICAgICAgIHZhciBwb2ludHNSRSA9IHJlZ0V4U3RyaW5nLmV4ZWMocG9pbnRzU3ZnKVsxXTtcbiAgICAgICAgICAgIHZhciBwb2ludHNEYXRhID0gcG9pbnRzUkUudHJpbSgpLnNwbGl0KFwiIFwiKS5tYXAoaXRlbSA9PiBpdGVtLnNwbGl0KFwiLFwiKSk7XG4gICAgICAgICAgICB0aGlzLnBvbHlTdGFydCA9IHBvaW50c0RhdGE7XG5cbiAgICAgICAgICAgIGxldCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG4gICAgICAgICAgICBsZXQgeG1sRG9jID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyhwb2ludHNTdmcsIFwidGV4dC94bWxcIik7XG4gICAgICAgICAgICBpZiAoeG1sRG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYW5pbWF0ZVwiKS5sZW5ndGgpIHsgIC8vIElmIHRoZXJlIGlzIG5vIGFuaW1hdGlvbiBlbGVtZW50LCBjcmVhdGUgYW4gXCJhbmltYXRpb25cIiBmcm9tIHRoZSBzdGF0aWMgcG9pbnRzXG4gICAgICAgICAgICAgICAgcG9pbnRzUkUgPSB4bWxEb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJhbmltYXRlXCIpWzBdLmdldEF0dHJpYnV0ZShcInRvXCIpO1xuICAgICAgICAgICAgICAgIHBvaW50c0RhdGEgPSBwb2ludHNSRS50cmltKCkuc3BsaXQoXCIgXCIpLm1hcChpdGVtID0+IGl0ZW0uc3BsaXQoXCIsXCIpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBvbHlFbmQgPSBwb2ludHNEYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKCdwb2x5U3RhcnQ6ICcpO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnBvbHlTdGFydCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdwb2x5RW5kOiAnKTtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5wb2x5RW5kKTtcblxuICAgIH1cblxuICAgIGdldFBvbHkoKSB7XG4gICAgICAgIHZhciBwb2ludHNTZWxlY3RvciA9IFtdO1xuICAgICAgICBpZiAoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mKHRoaXMuaXRlbXMpKSB7IC8vIFZlcnNpb24gMVxuICAgICAgICAgICAgcG9pbnRzU2VsZWN0b3IgPSB0aGlzLnRhcmdldC5zZWxlY3Rvci5maWx0ZXIoaXRlbSA9PiBpdGVtLnR5cGUgPT09IFwiU3ZnU2VsZWN0b3JcIik7XG4gICAgICAgIH0gZWxzZSB7IC8vIFZlcnNpb24gMlxuICAgICAgICAgICAgcG9pbnRzU2VsZWN0b3IgPSAoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mKHRoaXMuaXRlbXNbMF0uaXRlbXNbMF0uaXRlbXNbMF0udGFyZ2V0LnNlbGVjdG9yLnJlZmluZWRCeSkpID8gW3RoaXMuaXRlbXNbMF0uaXRlbXNbMF0uaXRlbXNbMF0udGFyZ2V0LnNlbGVjdG9yLnJlZmluZWRCeV0gOiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb2ludHNTZWxlY3Rvci5sZW5ndGggPT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgLy8gUGFyc2UgdGhlIHBvaW50cyBhcnJheSBmcm9tIHRoZSBhbm5vdGF0aW9uXG4gICAgICAgIGxldCBwb2ludHNTdmcgPSBwb2ludHNTZWxlY3RvclswXS52YWx1ZTtcbiAgICAgICAgbGV0IHJlZ0V4U3RyaW5nID0gbmV3IFJlZ0V4cChcIig/OnBvaW50cz0nKSguKj8pKD86JylcIiwgXCJpZ1wiKTsgLy9zZXQgaWcgZmxhZyBmb3IgZ2xvYmFsIHNlYXJjaCBhbmQgY2FzZSBpbnNlbnNpdGl2ZVxuICAgICAgICBcbiAgICAgICAgbGV0IHBvaW50c1JFID0gcmVnRXhTdHJpbmcuZXhlYyhwb2ludHNTdmcpWzFdO1xuICAgICAgICBsZXQgcG9pbnRzRGF0YSA9IHBvaW50c1JFLnRyaW0oKS5zcGxpdChcIiBcIikubWFwKGl0ZW0gPT4gaXRlbS5zcGxpdChcIixcIikpO1xuXG4gICAgICAgIHJldHVybiBwb2ludHNEYXRhO1xuICAgIH1cblxuICAgIGdldFNWR1BvbHlQb2ludHMoKSB7XG4gICAgICAgIHZhciBwb2ludHNTZWxlY3RvciA9IFtdO1xuICAgICAgICBpZiAoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mKHRoaXMuaXRlbXMpKSB7IC8vIFZlcnNpb24gMVxuICAgICAgICAgICAgcG9pbnRzU2VsZWN0b3IgPSB0aGlzLnRhcmdldC5zZWxlY3Rvci5maWx0ZXIoaXRlbSA9PiBpdGVtLnR5cGUgPT09IFwiU3ZnU2VsZWN0b3JcIik7XG4gICAgICAgIH0gZWxzZSB7IC8vIFZlcnNpb24gMlxuICAgICAgICAgICAgcG9pbnRzU2VsZWN0b3IgPSAoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mKHRoaXMuaXRlbXNbMF0uaXRlbXNbMF0uaXRlbXNbMF0udGFyZ2V0LnNlbGVjdG9yLnJlZmluZWRCeSkpID8gW3RoaXMuaXRlbXNbMF0uaXRlbXNbMF0uaXRlbXNbMF0udGFyZ2V0LnNlbGVjdG9yLnJlZmluZWRCeV0gOiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHBvaW50c1NlbGVjdG9yLmxlbmd0aCA9PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAvLyBQYXJzZSB0aGUgcG9pbnRzIGFycmF5IGZyb20gdGhlIGFubm90YXRpb25cbiAgICAgICAgbGV0IHBvaW50c1N2ZyA9IHBvaW50c1NlbGVjdG9yWzBdLnZhbHVlO1xuICAgICAgICBsZXQgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICAgICAgICBsZXQgeG1sRG9jID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyhwb2ludHNTdmcsIFwidGV4dC94bWxcIik7XG5cbiAgICAgICAgaWYgKCF4bWxEb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJhbmltYXRlXCIpLmxlbmd0aCkgeyAgLy8gSWYgdGhlcmUgaXMgbm8gYW5pbWF0aW9uIGVsZW1lbnQsIGNyZWF0ZSBhbiBcImFuaW1hdGlvblwiIGZyb20gdGhlIHN0YXRpYyBwb2ludHNcbiAgICAgICAgICAgIHZhciBwb2ludHMgPSB0aGlzLmdldFBvbHkoKTtcbiAgICAgICAgICAgIHJldHVybiBbcG9pbnRzLCBwb2ludHNdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFt4bWxEb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJhbmltYXRlXCIpWzBdLmdldEF0dHJpYnV0ZShcImZyb21cIiksIHhtbERvYy5nZXRFbGVtZW50c0J5VGFnTmFtZShcImFuaW1hdGVcIilbMF0uZ2V0QXR0cmlidXRlKFwidG9cIildO1xuICAgICAgICB9XG4gICAgfVxuXG59XG5cblxuXG5leHBvcnQgeyBBbm5vdGF0aW9uIH07IiwiaW1wb3J0IHsgU2VydmVySW50ZXJmYWNlIH0gZnJvbSBcIi4vc2VydmVyLWludGVyZmFjZS5qc1wiO1xuaW1wb3J0IHsgQW5ub3RhdGlvbk1hbmFnZXIgfSBmcm9tIFwiLi9hbm5vdGF0aW9uLW1hbmFnZXIuanNcIjtcbmltcG9ydCB7IFRpY2tCYXIgfSBmcm9tIFwiLi9jb21wb25lbnRzL3RpY2stYmFyLmpzXCI7XG5pbXBvcnQgeyBQb2x5Z29uT3ZlcmxheSB9IGZyb20gXCIuL2NvbXBvbmVudHMvcG9seWdvbi1vdmVybGF5LmpzXCI7XG5pbXBvcnQgeyBwcmVmZXJlbmNlcyB9IGZyb20gXCIuLi91dGlscy9wcmVmZXJlbmNlLW1hbmFnZXIuanNcIjtcbmltcG9ydCB7IEFubm90YXRpb25HVUkgfSBmcm9tIFwiLi9jb21wb25lbnRzL2Fubm90YXRpb24tZ3VpLmpzXCI7XG5pbXBvcnQgeyBJbmZvQ29udGFpbmVyIH0gZnJvbSBcIi4vY29tcG9uZW50cy9pbmZvLWNvbnRhaW5lci5qc1wiO1xuaW1wb3J0IHsgSW5kZXhDb250YWluZXIgfSBmcm9tIFwiLi9jb21wb25lbnRzL2luZGV4LWNvbnRhaW5lci5qc1wiO1xuaW1wb3J0IHsgU2Vzc2lvbk1hbmFnZXIgfSBmcm9tIFwiLi9zZXNzaW9uLW1hbmFnZXIuanNcIjtcbmltcG9ydCB7IE1lc3NhZ2VPdmVybGF5IH0gZnJvbSBcIi4vY29tcG9uZW50cy9tZXNzYWdlLW92ZXJsYXkuanNcIjtcbmltcG9ydCB7IEFubm90YXRpb24gfSBmcm9tIFwiLi9hbm5vdGF0aW9uLmpzXCI7XG5sZXQgc2hhMSA9IHJlcXVpcmUoJ3NoYTEnKTtcblxuY2xhc3MgVmlkZW9Bbm5vdGF0b3Ige1xuICAgIGNvbnN0cnVjdG9yKGFyZ3Mpe1xuICAgICAgICBjb25zb2xlLmxvZyhcIltWaWRlb0Fubm90YXRvcl0gQ3JlYXRpbmcgVmlkZW9Bbm5vdGF0b3IuLi5cIik7XG5cbiAgICAgICAgLy9QYXJzZSBhcmd1bWVudHNcbiAgICAgICAgLy9UaGlzIGlzIGFjdHVhbGx5IHJlcXVpcmVkXG4gICAgICAgIGlmKHR5cGVvZiBhcmdzLnBsYXllciA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0NhbGxlZCBmb3IgYSBuZXcgVmlkZW9Bbm5vdGF0b3Igd2l0aG91dCBwYXNzaW5nIGEgcGxheWVyIScpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGxheWVyID0gYXJncy5wbGF5ZXI7ICAvLyBCcmluZyBpbiB0aGUgYXJndW1lbnQgZnJvbSB0aGUgY29uc3RydWN0b3JcbiAgICAgICAgXG5cbiAgICAgICAgLy9UaGVzZSBjb25maWcgb3B0aW9ucyBhcmUgcmVxdWlyZWQgZm9yIHNhdmluZyBhbm5vdGF0aW9ucyB0byBhIHNlcnZlclxuICAgICAgICB0aGlzLnNlcnZlclVSTCA9IHR5cGVvZiBhcmdzLnNlcnZlclVSTCA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6IGFyZ3Muc2VydmVyVVJMO1xuICAgICAgICB0aGlzLnRhZ3NVUkwgPSB0eXBlb2YgYXJncy50YWdzVVJMID09PSAndW5kZWZpbmVkJyA/ICcnIDogYXJncy50YWdzVVJMO1xuICAgICAgICB0aGlzLmFwaUtleSA9IHR5cGVvZiBhcmdzLmFwaUtleSA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6IGFyZ3MuYXBpS2V5O1xuXG4gICAgICAgIC8vSWYgYXBpS2V5IGlzIHNldCBhbmQgY21zVXNlcm5hbWUgYW5kIGNtc0VtYWlsIGFyZSBwYXNzZWQsIHdlJ2xsIGF1dG8gbG9naW4gbGF0ZXJcbiAgICAgICAgdGhpcy5jbXNVc2VybmFtZSA9IHR5cGVvZiBhcmdzLmNtc1VzZXJuYW1lID09PSAndW5kZWZpbmVkJyA/ICcnIDogYXJncy5jbXNVc2VybmFtZTtcbiAgICAgICAgdGhpcy5jbXNFbWFpbCA9IHR5cGVvZiBhcmdzLmNtc0VtYWlsID09PSAndW5kZWZpbmVkJyA/ICcnIDogYXJncy5jbXNFbWFpbDtcblxuICAgICAgICAvL1RoaXMgY29uZmlnIG9wdGlvbiBpcyByZXF1aXJlZCBmb3IgdXNpbmcgYSBzdGF0aWMgYW5ub3RhdGlvbiBmaWxlXG4gICAgICAgIHRoaXMubG9jYWxVUkwgPSB0eXBlb2YgYXJncy5sb2NhbFVSTCA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6IGFyZ3MubG9jYWxVUkw7XG5cbiAgICAgICAgLy9PcHRpb25hbCBwYXJhbXNcbiAgICAgICAgLy9SZW1vdmVzIHRoZSBlZGl0aW5nIGludGVyZmFjZVxuICAgICAgICB0aGlzLmtpb3NrTW9kZSA9IHR5cGVvZiBhcmdzLmtpb3NrTW9kZSA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6IGFyZ3Mua2lvc2tNb2RlO1xuICAgICAgICAvL1Nob3dzIHRoZSAnb3BlbiBtYW5pZmVzdCcgYnV0dG9uIGlmIGtpb3NrTW9kZSBpcyBvZmZcbiAgICAgICAgdGhpcy5zaG93TWFuaWZlc3QgPSB0eXBlb2YgYXJncy5zaG93TWFuaWZlc3QgPT09ICd1bmRlZmluZWQnID8gZmFsc2UgOiBhcmdzLnNob3dNYW5pZmVzdDsgICAgICAgIFxuICAgICAgICAvL0FsbG93cyBwYXNzaW5nIGluIGEgZnVuY3Rpb24gdGhhdCBvdmVycmlkZXMgdGhlIGRlZmF1bHQgYW5ub3RhdGlvbiByZW5kZXJlclxuICAgICAgICB0aGlzLnJlbmRlcmVyID0gdHlwZW9mIGFyZ3MucmVuZGVyZXIgPT09ICd1bmRlZmluZWQnID8gZmFsc2UgOiBhcmdzLnJlbmRlcmVyO1xuICAgICAgICAvL0FsbG93cyBwYXNzaW5nIGluIGEgZnVuY3Rpb24gdGhhdCBvdmVycmlkZXMgdGhlIGRlZmF1bHQgYW5ub3RhdGlvbiByZW5kZXJlclxuICAgICAgICB0aGlzLnVucmVuZGVyZXIgPSB0eXBlb2YgYXJncy51bnJlbmRlcmVyID09PSAndW5kZWZpbmVkJyA/IGZhbHNlIDogYXJncy51bnJlbmRlcmVyO1xuICAgICAgICAvL0RldGVybWluZXMgd2hldGhlciBvciBub3QgdGhlIGFubm90YXRpb24gY29udGFpbmVyIGlzIGNsZWFyZWQgZXZlcnkgdGltZSBpdCB1cGRhdGVzXG4gICAgICAgIHRoaXMuY2xlYXJDb250YWluZXIgPSB0eXBlb2YgYXJncy5jbGVhckNvbnRhaW5lciA9PT0gJ3VuZGVmaW5lZCcgPyB0cnVlIDogYXJncy5jbGVhckNvbnRhaW5lcjtcbiAgICAgICAgLy9EZXRlcm1pbmVzIHdoZXRoZXIgb3Igbm90IHRvIGNyZWF0ZSBhIG5hdmlnYWJsZSBpbmRleCBvZiBhbm5vdGF0aW9uc1xuICAgICAgICB0aGlzLmRpc3BsYXlJbmRleCA9IHR5cGVvZiBhcmdzLmRpc3BsYXlJbmRleCA9PT0gJ3VuZGVmaW5lZCcgPyBmYWxzZSA6IGFyZ3MuZGlzcGxheUluZGV4OyAgIFxuICAgICAgICBcbiAgICAgICAgLy9EZXRlcm1pbmUgdGhlIGxhbmd1YWdlIG9mIHRoZSBhbm5vdGF0aW9uXG4gICAgICAgIHRoaXMub25vbXlMYW5ndWFnZSA9IHR5cGVvZiBhcmdzLm9ub215TGFuZ3VhZ2UgPT09ICd1bmRlZmluZWQnID8gJycgOiBhcmdzLm9ub215TGFuZ3VhZ2U7XG5cbiAgICAgICAgdGhpcy5vbm9teVZvY2FidWxhcnkgPSBbXTtcbiAgICAgICAgLy9sb2NhbFVSTCBpbXBsaWVzIGtpb3NrIG1vZGVcbiAgICAgICAgaWYodGhpcy5sb2NhbFVSTCAhPSAnJykgdGhpcy5raW9za01vZGUgPSB0cnVlO1xuXG4gICAgICAgIC8vYWRkaXRpb25hbCBkYXRhIGZyb20gYW5ub3RhdGlvbnMgY29sbGVjdGVkIGZyb20gc2NhbGFyIHRvIGJlIGFkZGVkIGluIEFQSSAyLjAgXG4gICAgICAgIHRoaXMuY29udGVudExhYmVsID0gXCJcIjtcbiAgICAgICAgdGhpcy5hcnRVUkwgPSBcIlwiO1xuICAgICAgICB0aGlzLmFubm90YXRpb25QYWdlVVJMID0gXCJcIjtcblxuICAgICAgICB0aGlzLldyYXAoKTtcbiAgICAgICAgdGhpcy5Qb3B1bGF0ZUNvbnRyb2xzKCk7XG5cbiAgICAgICAgLy9tYXkgbmVlZCB0byBtb3ZlIHRoaXMgYmVsb3cgdGhlIHRoaXMuc2VydmVyIGJsb2NrIGxhdGVyP1xuICAgICAgICB0aGlzLm1lc3NhZ2VPdmVybGF5ID0gbmV3IE1lc3NhZ2VPdmVybGF5KHRoaXMpO1xuICAgICAgICB0aGlzLmFubm90YXRpb25NYW5hZ2VyID0gbmV3IEFubm90YXRpb25NYW5hZ2VyKCk7XG4gICAgICAgIHRoaXMuc2Vzc2lvbk1hbmFnZXIgPSBuZXcgU2Vzc2lvbk1hbmFnZXIodGhpcyk7XG5cbiAgICAgICAgLy9sb2FkIG9ub215IHZvY2FidWxhcnlcbiAgICAgICAgJC5hamF4KHRoaXMuZ3VpLkdldFRhZ3NRdWVyeSgpKS5kb25lKCh2b2NhYnVsYXJ5KT0+e1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIk9ub215Vm9jYWJ1bGFyeSBpcyBsb2FkZWRcIik7XG4gICAgICAgICAgICBsZXQgcGFyc2VkVm9jYWJ1bGFyeSA9IHRoaXMuZ3VpLk9ub215Vm9jYWJ1bGFyUHJvY2Vzcyh2b2NhYnVsYXJ5LCB0aGlzLm9ub215TGFuZ3VhZ2UpO1xuICAgICAgICAgICAgdGhpcy5hbm5vdGF0aW9uTWFuYWdlci5VcGRhdGVPbm9teVZvY2FidWxhcnkocGFyc2VkVm9jYWJ1bGFyeSk7XG4gICAgICAgICAgICB0aGlzLm9ub215Vm9jYWJ1bGFyeSA9IHBhcnNlZFZvY2FidWxhcnk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vbG9jYWxVUkwgdGFrZXMgcHJlY2VuZGVuY2UgLSBpZiBpdCBpcyBhbnl0aGluZyBidXQgJycgdGhlbiBkbyBub3QgbG9hZCBmcm9tIHNlcnZlclxuICAgICAgICBpZih0aGlzLmxvY2FsVVJMID09ICcnKXtcbiAgICAgICAgICAgIHRoaXMuc2VydmVyID0gbmV3IFNlcnZlckludGVyZmFjZSh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuc2VydmVyLlNldEJhc2VVUkwodGhpcy5zZXJ2ZXJVUkwpO1xuXG4gICAgICAgICAgICAvLyBMb2FkIGFubm90YXRpb25zIGZyb20gc2VydmVyIGJhc2VkIG9uIHRoZSBwbGF5ZXIncyB2aWRlbyBVUkxcbiAgICAgICAgICAgIHRoaXMuc2VydmVyLkZldGNoQW5ub3RhdGlvbnMoJ2xvY2F0aW9uJywgdGhpcy5wbGF5ZXIudmlkZW9FbGVtZW50LmN1cnJlbnRTcmMpXG4gICAgICAgICAgICAuZG9uZSgoanNvbik9PntcbiAgICAgICAgICAgICAgICBpZiAoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mKGpzb24uaXRlbXMpKSB7ICAvLyBWZXJzaW9uIDFcbiAgICAgICAgICAgICAgICAgICAgLy9qc29uLnNoaWZ0KCkgIC8vIEFzc3VtZSBmaXJzdCBub2RlIGlzIGEgY29udGVudCBub2RlXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSBqc29uLmxlbmd0aC0xOyBqID49IDA7IGotLSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoanNvbltqXS50eXBlICE9IFwiQW5ub3RhdGlvblwiKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYW5ub3RhdGlvbl9pbmZvID0ganNvbltqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRMYWJlbCA9IGFubm90YXRpb25faW5mb1tcImRjdGVybXM6dGl0bGVcIl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hcnRVUkwgPSBhbm5vdGF0aW9uX2luZm9bXCJhcnQ6dXJsXCJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGFubm90YXRpb25faW5mb1tcImRjdGVybXM6dGl0bGVcIl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uc3BsaWNlKGosMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwganNvbltqXS50YXJnZXQuc2VsZWN0b3IubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCdGcmFnbWVudFNlbGVjdG9yJyAhPSBqc29uW2pdLnRhcmdldC5zZWxlY3RvcltrXS50eXBlKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAganNvbltqXS50YXJnZXQuc2VsZWN0b3Jba10udmFsdWUgPSBqc29uW2pdLnRhcmdldC5zZWxlY3RvcltrXS52YWx1ZS5yZXBsYWNlKCcjdD1ucHQ6JywndD0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAgLy8gVmVyc2lvbiAyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudExhYmVsID0ganNvbi5sYWJlbC5lblswXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcnRVUkwgPSBqc29uLml0ZW1zWzBdLmNvbnRlbnQuaWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYW5ub3RhdGlvblBhZ2VVUkwgPSBqc29uLml0ZW1zWzBdLml0ZW1zWzBdLml0ZW1zWzBdLmlkO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuYW5ub3RhdGlvbk1hbmFnZXIuUG9wdWxhdGVGcm9tSlNPTihqc29uKTtcbiAgICAgICAgICAgICAgICB0aGlzLkFubm90YXRpb25zTG9hZGVkKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy9hdXRvLWxvZ2luIGlmIG5vdCBpbiBraW9zayBtb2RlLCBhbmQgd2UgaGF2ZSB0aGUgY21zIHZhcmlhYmxlcyBhbmQgQVBJIGtleVxuICAgICAgICAgICAgaWYoIXRoaXMua2lvc2tNb2RlKXtcbiAgICAgICAgICAgICAgICBpZih0aGlzLmFwaUtleSAmJiB0aGlzLmNtc0VtYWlsICYmIHRoaXMuY21zVXNlcm5hbWUpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlcnZlci5Mb2dPdXQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXJ2ZXIuTG9nSW4odGhpcy5jbXNVc2VybmFtZSwgc2hhMSh0aGlzLmNtc0VtYWlsKSkuZG9uZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIltNYWluXSBDTVMgbG9naW4gc3VjY2Vzc1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfSkuZmFpbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIltNYWluXSBDTVMgbG9naW4gZmFpbGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdMb2FkaW5nIGxvY2FsIGNhY2hlIGZpbGU6ICcgKyB0aGlzLmxvY2FsVVJMKTtcbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdXJsOiB0aGlzLmxvY2FsVVJMLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgICAgIGFzeW5jOiB0cnVlXG4gICAgICAgICAgICB9KS5kb25lKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEZldGNoZWQgJHtkYXRhLmxlbmd0aH0gYW5ub3RhdGlvbnMgZnJvbSBsb2NhbCBjYWNoZS5gKTtcbiAgICAgICAgICAgICAgICB2YXIganNvbiA9IGRhdGE7XG4gICAgICAgICAgICAgICAgaWYgKCd1bmRlZmluZWQnID09IHR5cGVvZihqc29uLml0ZW1zKSkgeyAgLy8gVmVyc2lvbiAxXG4gICAgICAgICAgICAgICAgICAgIC8vanNvbi5zaGlmdCgpICAvLyBBc3N1bWUgZmlyc3Qgbm9kZSBpcyBhIGNvbnRlbnQgbm9kZVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0ganNvbi5sZW5ndGgtMTsgaiA+PSAwOyBqLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGpzb25bal0udHlwZSAhPSBcIkFubm90YXRpb25cIil7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFubm90YXRpb25faW5mbyA9IGpzb25bal07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TGFiZWwgPSBhbm5vdGF0aW9uX2luZm9bXCJkY3Rlcm1zOnRpdGxlXCJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXJ0VVJMID0gYW5ub3RhdGlvbl9pbmZvW1wiYXJ0OnVybFwiXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhbm5vdGF0aW9uX2luZm9bXCJkY3Rlcm1zOnRpdGxlXCJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uLnNwbGljZShqLDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGpzb25bal0udGFyZ2V0LnNlbGVjdG9yLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgnRnJhZ21lbnRTZWxlY3RvcicgIT0ganNvbltqXS50YXJnZXQuc2VsZWN0b3Jba10udHlwZSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb25bal0udGFyZ2V0LnNlbGVjdG9yW2tdLnZhbHVlID0ganNvbltqXS50YXJnZXQuc2VsZWN0b3Jba10udmFsdWUucmVwbGFjZSgnI3Q9bnB0OicsJ3Q9Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgIC8vIFZlcnNpb24gMlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRMYWJlbCA9IGpzb24ubGFiZWwuZW5bMF07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXJ0VVJMID0ganNvbi5pdGVtc1swXS5jb250ZW50LmlkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmFubm90YXRpb25NYW5hZ2VyLlBvcHVsYXRlRnJvbUpTT04oZGF0YSk7XG4gICAgICAgICAgICAgICAgdGhpcy5Bbm5vdGF0aW9uc0xvYWRlZCgpO1xuICAgICAgICAgICAgfSkuZmFpbCgocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgZmV0Y2hpbmcgYW5ub3RhdGlvbnMgZnJvbSBsb2NhbCBjYWNoZVwiXFxuJHtyZXNwb25zZS5yZXNwb25zZUpTT04uZGV0YWlsfS5gKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFubm90YXRvci5tZXNzYWdlT3ZlcmxheS5TaG93RXJyb3IoYENvdWxkIG5vdCByZXRyaWV2ZSBhbm5vdGF0aW9ucyE8YnI+KCR7cmVzcG9uc2UucmVzcG9uc2VKU09OLmRldGFpbH0pYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucGxheWVyLiRjb250YWluZXIub24oXCJPblRpbWVVcGRhdGVcIiwgKGV2ZW50LCB0aW1lKSA9PiB7XG4gICAgICAgICAgICB0aGlzLk9uVGltZVVwZGF0ZSh0aW1lKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy4kY29udGFpbmVyLm9uKFwiT25Qb2x5Q2xpY2tlZFwiLCAoZXZlbnQsIGFubm90YXRpb24pID0+IHtcbiAgICAgICAgICAgIC8vIEVkaXQgYSBwb2x5IHdoZW4gY2xpY2tlZCwgYnV0IG9ubHkgaWYgdGhlIGVkaXRvciBpc24ndCBhbHJlYWR5IG9wZW5cbiAgICAgICAgICAgIGlmKCF0aGlzLmd1aS5vcGVuKXtcbiAgICAgICAgICAgICAgICB0aGlzLiRhZGRBbm5vdGF0aW9uQnV0dG9uLmJ1dHRvbihcImRpc2FibGVcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5ndWkuQmVnaW5FZGl0aW5nKGFubm90YXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLiRjb250YWluZXIub24oXCJPblBvbHlnb25DbGlja2VkXCIsIChldmVudCwgYW5ub3RhdGlvbikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPblBvbHlnb25DbGlja2VkIGV2ZW50IGNhcHR1cmVkXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLiRjb250YWluZXIub24oXCJPbkFuaW1hdGlvbkNsaWNrZWRcIiwgKGV2ZW50LCBhbm5vdGF0aW9uKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIk9uQW5pbWF0aW9uQ2xpY2tlZCBldmVudCBjYXB0dXJlZFwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5ndWkuJGNvbnRhaW5lci5vbihcIk9uR1VJQ2xvc2VkXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy4kYWRkQW5ub3RhdGlvbkJ1dHRvbi5idXR0b24oXCJlbmFibGVcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudXJsID0gdGhpcy5wbGF5ZXIudmlkZW9FbGVtZW50LmN1cnJlbnRTcmM7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJbVmlkZW9Bbm5vdGF0b3JdIEFubm90YXRvciBjcmVhdGVkIGZvciB2aWRlby5cIik7XG4gICAgfVxuXG5cbiAgICByZWFkQ29uZmlnKCkge1xuICAgICAgICBjb25zdCBjb25maWcgPSByZXF1aXJlKFwiLi4vYW5ub3RhdG9yLWNvbmZpZy5qc29uXCIpOyBcbiAgICAgICAgdGhpcy5hcGlLZXkgPSBjb25maWcuYXBpX2tleTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aGUgZGl2cyB0aGF0IHN1cnJvdW5kIHRoZSB2aWRlbyBwbGF5ZXIuXG4gICAgICovXG4gICAgV3JhcCgpe1xuICAgICAgICAvLyBXcmFwIHRoZSB2aWRlbyBwbGF5ZXIgd2l0aCB0aGlzIGNvbnRhaW5lci4gQ2FuJ3QgdXNlIC53cmFwIGR1ZSB0byBkdXBsaWNhdGlvbiBpc3N1ZXMgICAgXG4gICAgICAgIHZhciB2aWRlb0NvbnRhaW5lciA9ICQodGhpcy5wbGF5ZXIuJGNvbnRhaW5lcikucGFyZW50KCk7XG4gICAgICAgIHZhciB3YWxkb3JmQ29udGFpbmVyID0gJChcIjxkaXYgY2xhc3M9J3dhbGRvcmYtY29udGFpbmVyJz48L2Rpdj5cIik7XG4gICAgICAgIHdhbGRvcmZDb250YWluZXIuaW5zZXJ0QmVmb3JlKCQodGhpcy5wbGF5ZXIuJGNvbnRhaW5lcikpO1xuICAgICAgICB3YWxkb3JmQ29udGFpbmVyLmFwcGVuZCh0aGlzLnBsYXllci4kY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyID0gdmlkZW9Db250YWluZXIucGFyZW50KCk7XG5cbiAgICAgICAgLy8gU2V0IHRoZSBjb250YWluZXIgdG8gdGhlIHdpZHRoIG9mIHRoZSB2aWRlbyBwbGF5ZXJcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLndpZHRoKHRoaXMucGxheWVyLiRjb250YWluZXIud2lkdGgoKSk7XG5cbiAgICAgICAgLy8gQWxsb3cgdGhlIHZpZGVvIHBsYXllciBjb250YWluZXIgdG8gZ3Jvd1xuICAgICAgICAvL3RoaXMucGxheWVyLiRjb250YWluZXIud2lkdGgoXCIxMDAlXCIpO1xuICAgICAgICAvL3RoaXMucGxheWVyLiRjb250YWluZXIuaGVpZ2h0KFwiMTAwJVwiKTtcblxuICAgICAgICAvLyBDb3B5IHRoZSB2aWRlbyBzdHlsZXMgdG8gdGhlIGNvbnRhaW5lclxuICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLnBsYXllci5vcmlnaW5hbFN0eWxlcyk7XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci5jc3ModGhpcy5wbGF5ZXIub3JpZ2luYWxTdHlsZXMpO1xuICAgIH1cblxuICAgIFBvcHVsYXRlQ29udHJvbHMoKXtcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSB0aWNrIGJhclxuICAgICAgICB0aGlzLnRpY2tCYXIgPSBuZXcgVGlja0Jhcih0aGlzKTtcblxuICAgICAgICAvLyBDcmVhdGUgdGhlIHBvbHlnb24gb3ZlcmxheVxuICAgICAgICB0aGlzLnBvbHlPdmVybGF5ID0gbmV3IFBvbHlnb25PdmVybGF5KHRoaXMpO1xuXG4gICAgICAgIGlmKCF0aGlzLmtpb3NrTW9kZSAmJiB0aGlzLnNob3dNYW5pZmVzdCl7XG4gICAgICAgICAgICB0aGlzLiRkZWJ1Z0NvbnRyb2xzID0gJChcIjxkaXYgY2xhc3M9J3dhbGRvcmYtZGVidWctY29udHJvbHMnPjwvZGl2PlwiKS5hcHBlbmRUbyh0aGlzLiRjb250YWluZXIpO1xuICAgICAgICAgICAgdmFyICRzaG93QWxsQW5ub3RhdGlvbnNCdXR0b24gPSB0aGlzLiRkZWJ1Z0NvbnRyb2xzLmFwcGVuZCgnPGJ1dHRvbj5PcGVuIEFubm90YXRpb24gTWFuaWZlc3QgaW4gTmV3IFdpbmRvdzwvYnV0dG9uPicpO1xuICAgICAgICAgICAgJHNob3dBbGxBbm5vdGF0aW9uc0J1dHRvbi5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHVybCA9IHRoaXMucGxheWVyLnZpZGVvRWxlbWVudC5jdXJyZW50U3JjO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VydmVyLkZldGNoQW5ub3RhdGlvbnMoXCJsb2NhdGlvblwiLCB1cmwpLmRvbmUoKGpzb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdpbiA9IHdpbmRvdy5vcGVuKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmKHdpbiA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkNvdWxkbid0IHNob3cgYW5ub3RhdGlvbiBtYW5pZmVzdDsgcGxlYXNlIGFsbG93IHBvcC11cHMuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlT3ZlcmxheS5TaG93RXJyb3IoXCJDb3VsZG4ndCBzaG93IGFubm90YXRpb24gbWFuaWZlc3Q7IHBsZWFzZSBhbGxvdyBwb3AtdXBzLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbi5kb2N1bWVudC5vcGVuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW4uZG9jdW1lbnQud3JpdGUoYDx0aXRsZT5Bbm5vdGF0aW9uIE1hbmlmZXN0IGZvciAke3VybH08L3RpdGxlPmApO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luLmRvY3VtZW50LndyaXRlKFwiPHByZT5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW4uZG9jdW1lbnQud3JpdGUoSlNPTi5zdHJpbmdpZnkoanNvbiwgbnVsbCwgMikuZXNjYXBlSFRNTCgpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgd2luLmRvY3VtZW50LndyaXRlKFwiPC9wcmU+XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luLmRvY3VtZW50LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV3JhcCBhbGwgdGhlIGJ1dHRvbnMgd2l0aCB0aGUgbGlzdCB0YWdcbiAgICAgICAgLy90aGlzLiRkZWJ1Z0NvbnRyb2xzLndyYXBJbm5lcihcIjx1bD48L3VsPlwiKTtcbiAgICAgICAgLy8gV3JhcCBlYWNoIGJ1dHRvbiB3aXRoIHRoZSBsaXN0IGVsZW1lbnQgdGFnXG4gICAgICAgIC8vdGhpcy4kZGVidWdDb250cm9scy5maW5kKFwiYnV0dG9uXCIpLndyYXAoXCI8bGk+PC9saT5cIik7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBpbmZvIGNvbnRhaW5lclxuICAgICAgICB0aGlzLmluZm9Db250YWluZXIgPSBuZXcgSW5mb0NvbnRhaW5lcih0aGlzKTtcblxuICAgICAgICBpZih0aGlzLmRpc3BsYXlJbmRleCkgdGhpcy5pbmRleENvbnRhaW5lciA9IG5ldyBJbmRleENvbnRhaW5lcih0aGlzKTtcblxuICAgICAgICAvLyBJbmplY3QgdGhlIGFubm90YXRpb24gZWRpdCBidXR0b24gaW50byB0aGUgdG9vbGJhclxuICAgICAgICBpZighdGhpcy5raW9za01vZGUpe1xuICAgICAgICAgICAgdGhpcy4kYWRkQW5ub3RhdGlvbkJ1dHRvbiA9ICQoXCI8YnV0dG9uPkFkZCBOZXcgQW5ub3RhdGlvbjwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgICAgIGljb246IFwiZmEgZmEtcGx1c1wiLFxuICAgICAgICAgICAgICAgIHNob3dMYWJlbDogZmFsc2VcbiAgICAgICAgICAgIH0pLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiRhZGRBbm5vdGF0aW9uQnV0dG9uLmJ1dHRvbihcImRpc2FibGVcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5ndWkuQmVnaW5FZGl0aW5nKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmNvbnRyb2xCYXIuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJGFkZEFubm90YXRpb25CdXR0b24sIDMsICdmbGV4LWVuZCcpO1xuXG4gICAgICAgICAgICAvLyBJbmplY3QgdGhlIGFubm90YXRpb24gdXBsb2FkIGJ1dHRvbiBpbnRvIHRoZSB0b29sYmFyXG4gICAgICAgICAgICB0aGlzLiR1cGxvYWRBbm5vdGF0aW9uQnV0dG9uID0gJChcIjxidXR0b24gdHlwZT0nZmlsZSc+SW1wb3J0IEFubm90YXRpb24gRnJvbSBGaWxlPC9idXR0b24+XCIpLmJ1dHRvbih7XG4gICAgICAgICAgICAgICAgaWNvbjogXCJmYSBmYS11cGxvYWRcIixcbiAgICAgICAgICAgICAgICBzaG93TGFiZWw6IGZhbHNlXG4gICAgICAgICAgICB9KS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5Mb2FkRnJvbUZpbGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuY29udHJvbEJhci5SZWdpc3RlckVsZW1lbnQodGhpcy4kdXBsb2FkQW5ub3RhdGlvbkJ1dHRvbiwgMiwgJ2ZsZXgtZW5kJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ndWkgPSBuZXcgQW5ub3RhdGlvbkdVSSh0aGlzKTtcblxuICAgIH1cblxuICAgIEFubm90YXRpb25zTG9hZGVkKCl7XG4gICAgICAgIC8vU2VuZCBhbm5vdGF0aW9uIGxvYWRlZCBldmVudFxuICAgICAgICB0aGlzLiRjb250YWluZXIudHJpZ2dlcihcIk9uQW5ub3RhdGlvbnNMb2FkZWRcIiwgdGhpcy5hbm5vdGF0aW9uTWFuYWdlcik7XG4gICAgfVxuXG4gICAgT25UaW1lVXBkYXRlKHRpbWUpe1xuICAgICAgICB0aGlzLmFubm90YXRpb25zTm93ID0gdGhpcy5hbm5vdGF0aW9uTWFuYWdlci5Bbm5vdGF0aW9uc0F0VGltZSh0aW1lKTtcblxuICAgICAgICBpZih0aGlzLmFubm90YXRpb25zTm93LmVxdWFscyh0aGlzLmxhc3RBbm5vdGF0aW9uU2V0KSl7ICBcbiAgICAgICAgICAgIHRoaXMuU2V0QW5ub3RhdGlvblRpbWVQb3NpdGlvbih0aW1lKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBcbiAgICAgICAgdGhpcy5sYXN0QW5ub3RhdGlvblNldCA9IHRoaXMuYW5ub3RhdGlvbnNOb3c7XG5cbiAgICAgICAgdGhpcy5VcGRhdGVWaWV3cygpO1xuICAgIH1cblxuICAgIFNldEFubm90YXRpb25UaW1lUG9zaXRpb24odGltZSl7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJ0aW1lOiBcIiArIHRpbWUpO1xuICAgICAgICAvL0NoZWNrIHNhZmFyaSBhbmQgbXVsdGlwbGUgZ2VvbWV0cmljIGFubm90YXRpb25cbiAgICAgICAgaWYgKHRoaXMuSXNTYWZhcmkoKSAmJiB0aGlzLmFubm90YXRpb25zTm93Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGxldCBtc2cgPSBcIk11bHRpcGxlIGdlb21ldHJpYyBhbm5vdGF0aW9ucyBhcmUgZGV0ZWN0ZWQuPGJyPlwiO1xuICAgICAgICAgICAgbXNnICs9IFwiU2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCBtdWx0aXBsZSBnZW9tZXRyaWMgYW5ub3RhdGlvbnMuPGJyPlwiO1xuICAgICAgICAgICAgbXNnICs9IFwiQ2hyb21lIG9yIEZpcmVmb3ggYXJlIHJlY29tbWVuZGVkLlwiO1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlT3ZlcmxheS5TaG93TWVzc2FnZShtc2csIDIuMCk7XG4gICAgICAgICAgICByZXR1cm47IC8vbm8gYW5pbWF0aW9uIGZvciBzYWZhcmkgYnJvd3NlciB3aXRoIG11bHRpcGxlIGdlb21ldHJpYyBhbm5vdGF0aW9uXG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYW5ub3RhdGlvbnNOb3cubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICBsZXQgYW5ub3RhdGlvbl9pZCA9IHRoaXMuYW5ub3RhdGlvbnNOb3dbaV0uaWQ7XG4gICAgICAgICAgICBpZiAodGhpcy5wb2x5T3ZlcmxheS5zdmdFbGVtZW50c0hhc2hbYW5ub3RhdGlvbl9pZF0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvbHlPdmVybGF5LnN2Z0VsZW1lbnRzSGFzaFthbm5vdGF0aW9uX2lkXS5hbmltYXRlLmJlZ2luRWxlbWVudCgpO1xuICAgICAgICAgICAgICAgIGxldCB0aW1lX2RpZmYgPSB0aW1lIC0gdGhpcy5hbm5vdGF0aW9uc05vd1tpXS5iZWdpblRpbWU7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRfdGltZSA9IHRoaXMucG9seU92ZXJsYXkuc3ZnRWxlbWVudHNIYXNoW2Fubm90YXRpb25faWRdLnN2Z0VsZW1lbnQuZ2V0Q3VycmVudFRpbWUoKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiXFx0IGk6XCIgKyBpICsgXCIgKFwiICsgYW5ub3RhdGlvbl9pZCArIFwiKSwgc3ZnIGN1cnJlbnRfdGltZTpcIiArIGN1cnJlbnRfdGltZSArIFwiLCBhbmltYXRlIHRpbWVfZGlmZjogXCIgKyB0aW1lX2RpZmYpO1xuICAgICAgICAgICAgICAgIHRoaXMucG9seU92ZXJsYXkuc3ZnRWxlbWVudHNIYXNoW2Fubm90YXRpb25faWRdLnN2Z0VsZW1lbnQuc2V0Q3VycmVudFRpbWUoY3VycmVudF90aW1lICsgdGltZV9kaWZmKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBvbHlPdmVybGF5LnN2Z0VsZW1lbnRzSGFzaFthbm5vdGF0aW9uX2lkXS5hbmltYXRlLmVuZEVsZW1lbnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG5cbiAgICBVcGRhdGVWaWV3cygpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiYW5ub3RhdG9yLmpzOjI2NyBVcGRhdGVWaWV3c1wiKTtcbiAgICAgICAgdGhpcy5hbm5vdGF0aW9uc05vdyA9IHRoaXMuYW5ub3RhdGlvbk1hbmFnZXIuQW5ub3RhdGlvbnNBdFRpbWUodGhpcy5wbGF5ZXIudmlkZW9FbGVtZW50LmN1cnJlbnRUaW1lKTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIGluZm8gY29udGFpbmVyXG4gICAgICAgIHRoaXMuaW5mb0NvbnRhaW5lci5SZWJ1aWxkKHRoaXMuYW5ub3RhdGlvbnNOb3csIHRoaXMuY2xlYXJDb250YWluZXIpO1xuXG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci50cmlnZ2VyKFwiT25OZXdBbm5vdGF0aW9uU2V0XCIsIFt0aGlzLmFubm90YXRpb25zTm93XSk7XG4gICAgICAgIHRoaXMuU2V0QW5ub3RhdGlvblRpbWVQb3NpdGlvbih0aGlzLnBsYXllci52aWRlb0VsZW1lbnQuY3VycmVudFRpbWUpO1xuICAgIH1cblxuICAgIEdldEFubm90YXRpb25zKCl7XG4gICAgICAgIGxldCBvcmRlcmVkID0gdGhpcy5hbm5vdGF0aW9uTWFuYWdlci5hbm5vdGF0aW9ucy5zbGljZSgpO1xuICAgICAgICBsZXQgb3JkZXJCeVN0YXJ0ID0gZnVuY3Rpb24oYSwgYil7XG4gICAgICAgICAgICBsZXQgYVRpbWUgPSBhLmJlZ2luVGltZTtcbiAgICAgICAgICAgIGxldCBiVGltZSA9IGIuYmVnaW5UaW1lO1xuICAgICAgICAgICAgcmV0dXJuICgoYVRpbWUgPCBiVGltZSkgPyAtMSA6ICgoYVRpbWUgPiBiVGltZSkgPyAxIDogMCkpO1xuICAgICAgICB9XG4gICAgICAgIG9yZGVyZWQuc29ydChvcmRlckJ5U3RhcnQpO1xuICAgICAgICByZXR1cm4gb3JkZXJlZDtcbiAgICB9XG5cbiAgICBSZWdpc3Rlck5ld0Fubm90YXRpb24oYW5ub3RhdGlvbil7XG4gICAgICAgIC8vY29uc29sZS5sb2coYW5ub3RhdGlvbik7XG4gICAgICAgIC8vdGhpcy5hbm5vdGF0aW9uTWFuYWdlci5SZWdpc3RlckFubm90YXRpb24oYW5ub3RhdGlvbik7XG4gICAgICAgIHRoaXMuYW5ub3RhdGlvbk1hbmFnZXIuUG9wdWxhdGVGcm9tSlNPTihhbm5vdGF0aW9uKTtcblxuICAgICAgICAvLyBUaHJvdyBldmVudCBmb3IgbGlzdGVuaW5nIG9iamVjdHMgKGUuZy4gdGljay1iYXIpXG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci50cmlnZ2VyKFwiT25Bbm5vdGF0aW9uUmVnaXN0ZXJlZFwiLCBbYW5ub3RhdGlvbl0pO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBkZXBlbmRlbnQgdmlld3NcbiAgICAgICAgdGhpcy5VcGRhdGVWaWV3cygpO1xuICAgIH1cblxuICAgIFVwZGF0ZUFubm90YXRpb24oYW5ub3RhdGlvbiwgb2xkSUQpe1xuICAgICAgICB0aGlzLmFubm90YXRpb25NYW5hZ2VyLlVwZGF0ZUFubm90YXRpb24oYW5ub3RhdGlvbiwgb2xkSUQpO1xuXG4gICAgICAgIC8vIFRocm93IGV2ZW50IGZvciBsaXN0ZW5pbmcgb2JqZWN0cyAoZS5nLiB0aWNrLWJhcilcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLnRyaWdnZXIoXCJPbkFubm90YXRpb25SZW1vdmVkXCIsIFtvbGRJRF0pO1xuICAgICAgICB0aGlzLiRjb250YWluZXIudHJpZ2dlcihcIk9uQW5ub3RhdGlvblJlZ2lzdGVyZWRcIiwgW2Fubm90YXRpb25dKTtcblxuICAgICAgICAvLyBVcGRhdGUgZGVwZW5kZW50IHZpZXdzXG4gICAgICAgIHRoaXMuVXBkYXRlVmlld3MoKTtcbiAgICB9XG5cbiAgICBEZXJlZ2lzdGVyQW5ub3RhdGlvbihhbm5vdGF0aW9uKXtcbiAgICAgICAgdmFyIGlkID0gJyc7XG4gICAgICAgIGlmICgndW5kZWZpbmVkJyA9PSB0eXBlb2YoYW5ub3RhdGlvbi5pdGVtcykpIHsgLy8gVmVyIDFcbiAgICAgICAgICAgIGlkID0gYW5ub3RhdGlvbi5pZDtcbiAgICAgICAgfSBlbHNlIHsgLy8gVmVyIDJcbiAgICAgICAgICAgIGlkID0gYW5ub3RhdGlvbi5pdGVtc1swXS5pdGVtc1swXS5pdGVtc1swXS5pZDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5hbm5vdGF0aW9uTWFuYWdlci5SZW1vdmVBbm5vdGF0aW9uKGlkKTtcbiAgICAgICAgLy90aGlzLmFubm90YXRpb25zTm93ID0gdGhpcy5hbm5vdGF0aW9uTWFuYWdlci5Bbm5vdGF0aW9uc0F0VGltZSh0aGlzLnBsYXllci52aWRlb0VsZW1lbnQuY3VycmVudFRpbWUpO1xuXG4gICAgICAgIC8vIFRocm93IGV2ZW50IGZvciBsaXN0ZW5pbmcgb2JqZWN0cyAoZS5nLiB0aWNrLWJhcilcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLnRyaWdnZXIoXCJPbkFubm90YXRpb25SZW1vdmVkXCIsIFtpZF0pO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBkZXBlbmRlbnQgdmlld3NcbiAgICAgICAgdGhpcy5VcGRhdGVWaWV3cygpO1xuXG4gICAgfVxuXG4gICAgTG9hZEZyb21GaWxlKCkge1xuICAgICAgICAvLyBDcmVhdGUgdGhlIGRpYWxvZ1xuICAgICAgICBsZXQgJGNvbnRhaW5lciA9ICQoXCI8ZGl2IGNsYXNzPSd3YWxkb3JmLXNlc3Npb24tbW9kYWwnIHRpdGxlPSdJbXBvcnQgQW5ub3RhdGlvbic+PC9kaXY+XCIpOyAvLyBPdXRlcm1vc3QgSFRNTFxuICAgICAgICBsZXQgJGhlYWRUZXh0ID0gJChcIjxwIGNsYXNzPSd2YWxpZGF0ZVRpcHMnPkFubm90YXRpb25zIG11c3QgYmUgVzNDIE9BIGNvbXBsaWFudCBpbiBKU09OIGZvcm1hdC48L3A+XCIpLmFwcGVuZFRvKCRjb250YWluZXIpO1xuICAgICAgICBsZXQgJGVycm9yVGV4dCA9ICQoXCI8cCBjbGFzcz0ndmFsaWRhdGVUaXBzIG1vZGFsLWVycm9yLXRleHQnPjwvcD5cIikuYXBwZW5kVG8oJGNvbnRhaW5lcik7XG4gICAgICAgICRlcnJvclRleHQuaGlkZSgpO1xuICAgICAgICBsZXQgJGZvcm0gPSAkKFwiPGZvcm0+PC9mb3JtPlwiKS5hcHBlbmRUbygkY29udGFpbmVyKTtcblxuICAgICAgICBsZXQgJGltcG9ydEZpZWxkO1xuXG4gICAgICAgICQoXCI8bGFiZWwgZm9yPSdpbXBvcnRGaWxlJz5TZWxlY3QgRmlsZTwvbGFiZWw+XCIpLmFwcGVuZFRvKCRmb3JtKTtcbiAgICAgICAgJGltcG9ydEZpZWxkID0gJChcIjxpbnB1dCB0eXBlPSdmaWxlJyBuYW1lPSdpbXBvcnRGaWxlJyBjbGFzcz0nZmlsZSB1aS13aWRnZXQtY29udGVudCB1aS1jb3JuZXItYWxsJz5cIikuYXBwZW5kVG8oJGZvcm0pO1xuICAgICAgICBcbiAgICAgICAgJGZvcm0ud3JhcElubmVyKFwiPGZpZWxkc2V0IC8+XCIpO1xuXG4gICAgICAgIGxldCBlcnJvciA9IChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuICAgICAgICAgICAgJGVycm9yVGV4dC5odG1sKG1lc3NhZ2UpO1xuICAgICAgICAgICAgJGVycm9yVGV4dC5zaG93KCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgICRpbXBvcnRGaWVsZC5vbignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGZpbGVzID0gJGltcG9ydEZpZWxkLmdldCgwKS5maWxlcztcbiAgICAgICAgICAgIGxldCBmciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cbiAgICAgICAgICAgIGZyLm9ubG9hZCA9ICgobG9jYWxGaWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIEpTT04gaXMgbWFsZm9ybWVkLCBzaG93IGFuIGVycm9yIGFuZCBzdG9wIGhlcmUuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShsb2NhbEZpbGUudGFyZ2V0LnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcihcIkpTT04gZmlsZSBpcyBtYWxmb3JtZWQhXCIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGxvY2FsSnNvbiA9IEpTT04ucGFyc2UobG9jYWxGaWxlLnRhcmdldC5yZXN1bHQpO1xuICAgICAgICAgICAgICAgIGlmKHR5cGVvZihsb2NhbEpzb24udGFyZ2V0KSE9XCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICAgICAgICAgIGxldCBhbm5vdGF0aW9uID0gbmV3IEFubm90YXRpb24obG9jYWxKc29uKTtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5WYWxpZGF0ZUFubm90YXRpb24oYW5ub3RhdGlvbikpe1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3BlbiB0aGUgR1VJIGFuZCBwb3B1bGF0ZSBpdCB3aXRoIHRoaXMgYW5ub3RhdGlvbidzIGRhdGEuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmd1aS5CZWdpbkVkaXRpbmcoYW5ub3RhdGlvbiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmd1aS5Db21taXRBbm5vdGF0aW9uVG9TZXJ2ZXIoZnVuY3Rpb24oKXtyZXR1cm47fSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihcIkpTT04gaXMgaW52YWxpZCFcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGk9MDsgaTxsb2NhbEpzb24ubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFubm90YXRpb24gPSBuZXcgQW5ub3RhdGlvbihsb2NhbEpzb25baV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5WYWxpZGF0ZUFubm90YXRpb24oYW5ub3RhdGlvbikpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wZW4gdGhlIEdVSSBhbmQgcG9wdWxhdGUgaXQgd2l0aCB0aGlzIGFubm90YXRpb24ncyBkYXRhLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3VpLkJlZ2luRWRpdGluZyhhbm5vdGF0aW9uLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmd1aS5Db21taXRBbm5vdGF0aW9uVG9TZXJ2ZXIoKGFubm90YXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5SZWdpc3Rlck5ld0Fubm90YXRpb24oYW5ub3RhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3VpLkNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihcIkpTT04gaXMgaW52YWxpZCFcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJGRpYWxvZy5kaWFsb2coXCJjbG9zZVwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZnIucmVhZEFzVGV4dChmaWxlc1swXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCAkZGlhbG9nID0gJGNvbnRhaW5lci5kaWFsb2coe1xuICAgICAgICAgICAgYXV0b09wZW46IHRydWUsXG4gICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgbW9kYWw6IHRydWUsXG4gICAgICAgICAgICBidXR0b25zOiB7XG4gICAgICAgICAgICAgICAgQ2FuY2VsOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRkaWFsb2cuZGlhbG9nKFwiY2xvc2VcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNsb3NlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgJGRpYWxvZy5maW5kKFwiZm9ybVwiKVsgMCBdLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgJGRpYWxvZy5maW5kKFwiaW5wdXRcIikucmVtb3ZlQ2xhc3MoIFwidWktc3RhdGUtZXJyb3JcIiApO1xuICAgICAgICAgICAgICAgIC8vdGhpcy5Pbk1vZGFsQ2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgVmFsaWRhdGVBbm5vdGF0aW9uKGFubm90YXRpb24pIHtcbiAgICAgICAgLy8gVE9ETzogVmFsaWRhdGUgYW5ub3RhdGlvbiBoZXJlLiBSZXR1cm4gZmFsc2UgaWYgYW55XG4gICAgICAgIC8vIHJlcXVpcmVkIHByb3BlcnRpZXMgYXJlIG5vdCBwcmVzZW50LlxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIGNoZWNraW5nIHdoZXRoZXIgdGhlIGJyb3dzZXIgaXMgc2FmYXJpIG9yIG5vdFxuICAgIElzU2FmYXJpKCkge1xuICAgICAgICAvL3JlZjogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNDk4NzIxMTEvZGV0ZWN0LXNhZmFyaS1hbmQtc3RvcC1zY3JpcHRcbiAgICAgICAgbGV0IGlzU2FmYXJpID0gL14oKD8hY2hyb21lfGFuZHJvaWQpLikqc2FmYXJpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgICAgcmV0dXJuIGlzU2FmYXJpO1xuICAgIH1cblxuXG59XG5cbmV4cG9ydCB7IFZpZGVvQW5ub3RhdG9yIH07IiwiaW1wb3J0IHsgR2V0Rm9ybWF0dGVkVGltZSwgR2V0U2Vjb25kc0Zyb21ITVMgfSBmcm9tIFwiLi4vLi4vdXRpbHMvdGltZS5qc1wiO1xuaW1wb3J0IHsgUG9seWdvbkVkaXRvciB9IGZyb20gXCIuL3BvbHlnb24tZWRpdG9yLmpzXCI7XG5pbXBvcnQgeyBBbm5vdGF0aW9uIH0gZnJvbSBcIi4uL2Fubm90YXRpb24uanNcIjtcblxuY2xhc3MgQW5ub3RhdGlvbkdVSSB7XG5cbiAgICBjb25zdHJ1Y3Rvcihhbm5vdGF0b3Ipe1xuICAgICAgICB0aGlzLmFubm90YXRvciA9IGFubm90YXRvcjtcblxuICAgICAgICB0aGlzLkNyZWF0ZSgpO1xuXG4gICAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuXG4gICAgICAgIC8vSGlkZSB0aGUgY29udGFpbmVyXG4gICAgICAgIHRoaXMuaXNWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci5tYWtlVmlzaWJsZShmYWxzZSk7XG5cbiAgICAgICAgdGhpcy5wb2x5RWRpdG9yID0gbmV3IFBvbHlnb25FZGl0b3IodGhpcy5hbm5vdGF0b3IpO1xuXG4gICAgICAgIHRoaXMuYW5ub3RhdG9yLiRjb250YWluZXIub24oXCJPblBvbHlnb25FZGl0aW5nRW5kZWRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5TZXRWaXNpYmxlKHRydWUpO1xuICAgICAgICAgICAgdGhpcy5wb2x5RWRpdG9yLlNob3dKdXN0UG9seWdvbigpO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIENyZWF0ZSgpe1xuICAgICAgICAvKlxuICAgICAgICAgKiAvL25ldyBVSVxuICAgICAgICAgKiBcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuJGNvbnRhaW5lciA9ICQoXCI8ZGl2IGlkPSdjcmVhdGUtZGlhbG9nJyBjbGFzcz0ndWktd2lkZ2V0LWNvbnRlbnQgY2VudGVyJz5cIikuYXBwZW5kVG8odGhpcy5hbm5vdGF0b3IucGxheWVyLiRjb250YWluZXIpO1xuICAgICAgICB0aGlzLiRjb250YWluZXIuZHJhZ2dhYmxlKCk7XG4gICAgICAgIHRoaXMuJHRpdGxlID0gJChcIjxkaXYgY2xhc3M9J2RpYWxvZy10aXRsZSc+Q3JlYXRlIEFubm90YXRpb248L2Rpdj5cIikuYXBwZW5kVG8odGhpcy4kY29udGFpbmVyKTtcblxuICAgICAgICAvLyBNYWtlIGNhbmNlbCBidXR0b25cbiAgICAgICAgbGV0ICRleGl0QnV0dG9uID0gJChcIjxidXR0b24+RXhpdCBBbm5vdGF0aW9uIEVkaXRpbmc8L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgIGljb25zOiB7cHJpbWFyeTogJ2ZhIGZhLXJlbW92ZSd9LFxuICAgICAgICAgICAgc2hvd0xhYmVsOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgJGV4aXRCdXR0b24uY3NzKFwiZmxvYXRcIiwgXCJyaWdodFwiKTtcbiAgICAgICAgJGV4aXRCdXR0b24uYXR0cigndGl0bGUnLCBcIkV4aXQgYW5ub3RhdGlvbiBlZGl0aW5nXCIpO1xuICAgICAgICAkZXhpdEJ1dHRvbi5hZGRDbGFzcyhcIndhbGRvcmYtY2FuY2VsLWJ1dHRvblwiKTtcbiAgICAgICAgJGV4aXRCdXR0b24uY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wb2x5RWRpdG9yLlJlc2V0UG9seWdvbnMoKTtcbiAgICAgICAgICAgIHRoaXMuQ2xvc2UoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KCRleGl0QnV0dG9uLCB0aGlzLiR0aXRsZSwgLTEpO1xuXG4gICAgICAgIHRoaXMuJHRhYnMgPSAkKFwiPGRpdiBpZD0ndGFicyc+PC9kaXY+XCIpLmFwcGVuZFRvKHRoaXMuJGNvbnRhaW5lcik7XG4gICAgXG4gICAgICAgIFxuICAgICAgICBsZXQgJHRhYlVJID0gJChcIjx1bD48L3VsPlwiKTtcbiAgICAgICAgbGV0ICRzdGFydFVJID0gJChcIjxsaT48YSBocmVmPScjc3RhcnRfdGFiJz5TdGFydCA8L2E+PC9saT5cIik7XG4gICAgICAgIGxldCAkYm9keVVJID0gJChcIjxsaT48YSBocmVmPScjYm9keV90YWInPkJvZHkgPC9hPjwvbGk+XCIpO1xuICAgICAgICBsZXQgJHN0b3BVSSA9ICQoXCI8bGk+PGEgaHJlZj0nI3N0b3BfdGFiJz5TdG9wIDwvYT48L2xpPlwiKTtcbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQoJHRhYlVJLCB0aGlzLiR0YWJzLCAtMSk7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KCRzdGFydFVJLCAkdGFiVUksIC0xKTtcbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQoJGJvZHlVSSwgJHRhYlVJLCAtMSk7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KCRzdG9wVUksICR0YWJVSSwgLTEpO1xuXG4gICAgICAgIGxldCAkc3RhcnRUYWIgPSAkKFwiPGRpdiBpZD0nc3RhcnRfdGFiJyBjbGFzcz0ndWktZmllbGQtY29udGFpbic+XCIgKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjxsYWJlbCBmb3I9J3N0YXJ0X3RpbWUnPlN0YXJ0IFRpbWU8L2xhYmVsPjxicj5cIiArIFxuICAgICAgICAgICAgICAgICAgICAgICAgXCI8L2Rpdj5cIik7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KCRzdGFydFRhYiwgdGhpcy4kdGFicywgLTEpO1xuXG4gICAgICAgIC8vIE1ha2UgXCJTdGFydCB0aW1lXCIgbGFiZWwgYW5kIGZpZWxkXG4gICAgICAgIHRoaXMuJHRpbWVTdGFydEZpZWxkID0gJCgnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInRpbWUtc3RhcnRcIiBpZD1cInRpbWUtc3RhcnRcIiB2YWx1ZT1cIlwiPicpLmFwcGVuZFRvKCRzdGFydFRhYik7XG4gICAgICAgIHRoaXMuJHRpbWVTdGFydEZpZWxkLndpZHRoKDcyKTtcbiAgICAgICAgdGhpcy4kdGltZVN0YXJ0RmllbGQuY3NzKFwiZm9udC1mYW1pbHlcIiwgXCJDb3VyaWVyLCBtb25vc3BhY2VcIik7XG4gICAgICAgIHRoaXMuJHRpbWVTdGFydEZpZWxkLmNzcyhcIm1hcmdpbi1yaWdodFwiLCBcIjJweFwiKTtcbiAgICAgICAgdGhpcy4kdGltZVN0YXJ0RmllbGQuYWRkQ2xhc3MoXCJ1aS13aWRnZXQgdWktd2lkZ2V0LWNvbnRlbnQgdWktY29ybmVyLWFsbFwiKTtcbiAgICAgICAgdGhpcy4kdGltZVN0YXJ0RmllbGQuYXR0cigndGl0bGUnLCBcIlN0YXJ0IHRpbWUgKGhoOm1tOnNzLnNzKVwiKTtcbiAgICAgICAgdGhpcy4kdGltZVN0YXJ0RmllbGQub24oJ2tleXByZXNzJywgZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT0gNDYgfHwgKGV2ZW50LmtleUNvZGUgPj0gNDggJiYgZXZlbnQua2V5Q29kZSA8PSA1OCkpeyAvLzAtOSwgcGVyaW9kLCBhbmQgY29sb25cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9hZGQgc3RhcnQgbWFya2VyIGJ1dHRvblxuICAgICAgICB0aGlzLiRzdGFydFRpbWVNYXJrZXIgPSAkKFwiPGJ1dHRvbiBzdHlsZT0ncGFkZGluZzowOyBsaW5lLWhlaWdodDoxLjQnPlNldCBFbmQ8L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgIGljb246IFwiZmEgZmEtbWFwLW1hcmtlclwiLFxuICAgICAgICAgICAgc2hvd0xhYmVsOiBmYWxzZVxuICAgICAgICB9KS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLiR0aW1lU3RhcnRGaWVsZFswXS52YWx1ZSA9IEdldEZvcm1hdHRlZFRpbWUodGhpcy5hbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC5jdXJyZW50VGltZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyRWxlbWVudCh0aGlzLiRzdGFydFRpbWVNYXJrZXIsICRzdGFydFRhYiwgLTIpOyAgICAgXG4gICAgICAgIFxuICAgICAgICAvL3N0YXJ0IHBvaW50IHBvbHlnb24gaXMgYWRkZWRcbiAgICAgICAgdGhpcy4kc3RhcnRQb2x5Z29uU2V0ID0gJChcIjxidXR0b24gc3R5bGU9J3BhZGRpbmc6MDsgbGluZS1oZWlnaHQ6MS40Jz5TdGFydCBQb2x5Z29uIFNldDwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgaWNvbjogXCJmYSBmYS1jaGVjay1zcXVhcmUtb1wiLFxuICAgICAgICAgICAgc2hvd0xhYmVsOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgLy90aGlzLiRzdGFydFBvbHlnb25TZXQuY3NzKFwidmlzaWJpbGl0eVwiLCBcImluaGVyaXRcIik7XG4gICAgICAgIHRoaXMuJHN0YXJ0UG9seWdvblNldC5jc3MoXCJ2aXNpYmlsaXR5XCIsIFwiaGlkZGVuXCIpO1xuICAgICAgICB0aGlzLiRzdGFydFBvbHlnb25TZXQuYWRkQ2xhc3MoXCJ3YWxkb3JmLWNvbmZpcm0tYnV0dG9uXCIpO1xuICAgICAgICBcbiAgICAgICAgLy90aGlzLlJlZ2lzdGVyRWxlbWVudCh0aGlzLiRzdGFydFBvbHlnb25TZXQsICRzdGFydFRhYiwgLTIpOyBcblxuICAgICAgICBsZXQgJGJvZHlUYWIgPSAkKFwiPGRpdiBpZD0nYm9keV90YWInPjwvZGl2PlwiKTtcbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQoJGJvZHlUYWIsIHRoaXMuJHRhYnMsIC0xKTtcblxuICAgICAgICAvLyBBZGQgdGFncyBpbnB1dCBmaWVsZFxuICAgICAgICB0aGlzLiR0YWdzRmllbGQgPSAkKCc8c2VsZWN0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgbXVsdGlwbGU9XCJtdWx0aXBsZVwiPjwvc2VsZWN0PicpO1xuICAgICAgICB0aGlzLiR0YWdzRmllbGQud2lkdGgoXCIxMDAlXCIpO1xuICAgICAgICB0aGlzLiR0YWdzRmllbGQuY3NzKFwibWFyZ2luLXRvcFwiLCBcIi04cHhcIik7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJHRhZ3NGaWVsZCwgJGJvZHlUYWIsIC0xKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJhbm5vdGF0aW9uLWd1aS5qczoxMDkgLT4gdGhpcy5hbm5vdGF0b3IuYW5ub3RhdGlvbk1hbmFnZXIub25vbXlWb2NhYnVsYXJ5XCIpO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmFubm90YXRvci5hbm5vdGF0aW9uTWFuYWdlcik7XG4gICAgICAgIHRoaXMuJHRhZ3NGaWVsZC5zZWxlY3QyKHtcbiAgICAgICAgICAgIHRhZ3M6IHRydWUsXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogXCJUYWdzXCIsXG4gICAgICAgICAgICBhamF4OiB0aGlzLkdldFRhZ3NRdWVyeSgpLFxuICAgICAgICAgICAgc2VsZWN0T25CbHVyOiB0cnVlLFxuICAgICAgICAgICAgLy8gQWxsb3cgbWFudWFsbHkgZW50ZXJlZCB0ZXh0IGluIGRyb3AgZG93bi5cbiAgICAgICAgICAgIGNyZWF0ZVRhZzogZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBwYXJhbXMudGVybSxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogcGFyYW1zLnRlcm0sXG4gICAgICAgICAgICAgICAgICAgIG5ld09wdGlvbjogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIEFkZCBjdXN0b20gY2xhc3MgZm9yIGJyaW5naW5nIHRoZSBkcm9wZG93biB0byB0aGUgZnJvbnQgKGZ1bGxzY3JlZW4gZml4KVxuICAgICAgICB0aGlzLiR0YWdzRmllbGQuZGF0YSgnc2VsZWN0MicpLiRkcm9wZG93bi5hZGRDbGFzcyhcInNlbGVjdDItZHJvcGRvd24tYW5ub3RhdG9yXCIpO1xuXG4gICAgICAgIC8vIE1ha2Ugbm90ZXMgdGV4dCBmaWVsZFxuICAgICAgICB0aGlzLiR0ZXh0RmllbGQgPSAkKCc8dGV4dGFyZWEgdHlwZT1cInRleHRcIiBuYW1lPVwiYW5uby10ZXh0XCIgaWQ9XCJhbm5vLXRleHRcIiB2YWx1ZT1cIlwiIHBsYWNlaG9sZGVyPVwiTm90ZXNcIj4nKTtcbiAgICAgICAgdGhpcy4kdGV4dEZpZWxkLmNzcyhcIm1hcmdpbi10b3BcIiwgXCIycHhcIik7XG4gICAgICAgIHRoaXMuJHRleHRGaWVsZC53aWR0aChcIjk4LjUlXCIpO1xuICAgICAgICB0aGlzLiR0ZXh0RmllbGQuYWRkQ2xhc3MoXCJ1aS13aWRnZXQgdWktd2lkZ2V0LWNvbnRlbnQgdWktY29ybmVyLWFsbFwiKTtcbiAgICAgICAgdGhpcy4kdGV4dEZpZWxkLmF0dHIoJ3RpdGxlJywgJ0Fubm90YXRpb24gdGV4dCcpO1xuICAgICAgICB0aGlzLiR0ZXh0RmllbGQuY3NzKFwiZmxleC1ncm93XCIsIDIpO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyRWxlbWVudCh0aGlzLiR0ZXh0RmllbGQsICRib2R5VGFiLCAtMSk7XG5cbiAgICAgICAgbGV0ICRzdG9wVGFiID0gJChcIjxkaXYgaWQ9J3N0b3BfdGFiJz5cIiArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPGxhYmVsIGZvcj0nc3RvcF90aW1lJz5TdG9wIFRpbWU8L2xhYmVsPjxicj5cIiArIFxuICAgICAgICAgICAgICAgICAgICAgICAgXCI8L2Rpdj5cIik7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KCRzdG9wVGFiLCB0aGlzLiR0YWJzLCAtMSk7XG5cbiAgICAgICAgLy8gTWFrZSBcIlN0YXJ0IHRpbWVcIiBsYWJlbCBhbmQgZmllbGRcbiAgICAgICAgdGhpcy4kdGltZUVuZEZpZWxkID0gJCgnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInRpbWUtc3RhcnRcIiBpZD1cInRpbWUtc3RhcnRcIiB2YWx1ZT1cIlwiPicpLmFwcGVuZFRvKCRzdG9wVGFiKTtcbiAgICAgICAgdGhpcy4kdGltZUVuZEZpZWxkLndpZHRoKDcyKTtcbiAgICAgICAgdGhpcy4kdGltZUVuZEZpZWxkLmNzcyhcImZvbnQtZmFtaWx5XCIsIFwiQ291cmllciwgbW9ub3NwYWNlXCIpO1xuICAgICAgICB0aGlzLiR0aW1lRW5kRmllbGQuY3NzKFwibWFyZ2luLXJpZ2h0XCIsIFwiMnB4XCIpO1xuICAgICAgICB0aGlzLiR0aW1lRW5kRmllbGQuYWRkQ2xhc3MoXCJ1aS13aWRnZXQgdWktd2lkZ2V0LWNvbnRlbnQgdWktY29ybmVyLWFsbFwiKTtcbiAgICAgICAgdGhpcy4kdGltZUVuZEZpZWxkLmF0dHIoJ3RpdGxlJywgXCJTdGFydCB0aW1lIChoaDptbTpzcy5zcylcIik7XG4gICAgICAgIHRoaXMuJHRpbWVFbmRGaWVsZC5vbigna2V5cHJlc3MnLCBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PSA0NiB8fCAoZXZlbnQua2V5Q29kZSA+PSA0OCAmJiBldmVudC5rZXlDb2RlIDw9IDU4KSl7IC8vMC05LCBwZXJpb2QsIGFuZCBjb2xvblxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL2FkZCBzdGFydCBtYXJrZXIgYnV0dG9uXG4gICAgICAgIHRoaXMuJGVuZFRpbWVNYXJrZXIgPSAkKFwiPGJ1dHRvbiBzdHlsZT0ncGFkZGluZzowOyBsaW5lLWhlaWdodDoxLjQnPlNldCBFbmQ8L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgIGljb246IFwiZmEgZmEtbWFwLW1hcmtlclwiLFxuICAgICAgICAgICAgc2hvd0xhYmVsOiBmYWxzZVxuICAgICAgICB9KS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLiR0aW1lRW5kRmllbGRbMF0udmFsdWUgPSBHZXRGb3JtYXR0ZWRUaW1lKHRoaXMuYW5ub3RhdG9yLnBsYXllci52aWRlb0VsZW1lbnQuY3VycmVudFRpbWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kZW5kVGltZU1hcmtlciwgJHN0b3BUYWIsIC0yKTtcblxuICAgICAgICAvL3N0b3AgcG9pbnQgcG9seWdvbiBpcyBhZGRlZFxuICAgICAgICB0aGlzLiRlbmRQb2x5Z29uU2V0ID0gJChcIjxidXR0b24gc3R5bGU9J3BhZGRpbmc6MDsgbGluZS1oZWlnaHQ6MS40Jz5FbmQgUG9seWdvbiBTZXQ8L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgIGljb246IFwiZmEgZmEtY2hlY2stc3F1YXJlLW9cIixcbiAgICAgICAgICAgIHNob3dMYWJlbDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIC8vdGhpcy4kZW5kUG9seWdvblNldC5jc3MoXCJ2aXNpYmlsaXR5XCIsIFwiaW5oZXJpdFwiKTtcbiAgICAgICAgdGhpcy4kZW5kUG9seWdvblNldC5jc3MoXCJ2aXNpYmlsaXR5XCIsIFwiaGlkZGVuXCIpO1xuICAgICAgICAvL3RoaXMuJGVuZFBvbHlnb25TZXQuYWRkQ2xhc3MoXCJ3YWxkb3JmLWNvbmZpcm0tYnV0dG9uXCIpO1xuICAgIFxuICAgICAgICAvL0FkZCBzb21lIGVycm9yIGNoZWNraW5nLi4uXG4gICAgICAgIHRoaXMuJHRpbWVFbmRGaWVsZC5ibHVyKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBlID0gJCh0aGlzLiR0aW1lRW5kRmllbGQpLnZhbCgpO1xuICAgICAgICAgICAgbGV0IHMgPSAkKHRoaXMuJHRpbWVTdGFydEZpZWxkKS52YWwoKTtcbiAgICAgICAgICAgIGlmKEdldFNlY29uZHNGcm9tSE1TKHMrMSkgPiBHZXRTZWNvbmRzRnJvbUhNUyhlKSl7XG4gICAgICAgICAgICAgICAgJCh0aGlzLiR0aW1lRW5kRmllbGQpLnZhbChHZXRGb3JtYXR0ZWRUaW1lKEdldFNlY29uZHNGcm9tSE1TKHMpKy4wMSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy4kdGltZVN0YXJ0RmllbGQuYmx1cigoKSA9PiB7XG4gICAgICAgICAgICBsZXQgZSA9ICQodGhpcy4kdGltZUVuZEZpZWxkKS52YWwoKTtcbiAgICAgICAgICAgIGxldCBzID0gJCh0aGlzLiR0aW1lU3RhcnRGaWVsZCkudmFsKCk7XG4gICAgICAgICAgICBpZihHZXRTZWNvbmRzRnJvbUhNUyhzKzEpID4gR2V0U2Vjb25kc0Zyb21ITVMoZSkpe1xuICAgICAgICAgICAgICAgICQodGhpcy4kdGltZUVuZEZpZWxkKS52YWwoR2V0Rm9ybWF0dGVkVGltZShHZXRTZWNvbmRzRnJvbUhNUyhzKSsuMDEpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kZW5kUG9seWdvblNldCwgJHN0b3BUYWIsIC0yKTsgXG5cbiAgICAgICAgbGV0ICRidXR0b25QYW5lbCA9ICQoXCI8ZGl2IGNsYXNzPSdidXR0b25fcGFuZWwnPjwvZGl2PlwiKS5hcHBlbmRUbyh0aGlzLiRjb250YWluZXIpO1xuXG4gICAgICAgIGxldCAkc3RhcnRUYXJnZXRMYWJlbCA9ICQoXCI8bGFiZWw+U3RhcnQgVGFyZ2V0PC9sYWJlbD48YnI+XCIpO1xuICAgICAgICAkc3RhcnRUYXJnZXRMYWJlbC5jc3MoXCJjb2xvclwiLCBcIndoaXRlXCIpO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyRWxlbWVudCgkc3RhcnRUYXJnZXRMYWJlbCwgJGJ1dHRvblBhbmVsLCAtMSk7XG5cbiAgICAgICAgLy9NYWtlIFwiRWRpdCBwb2x5Z29uXCIgYnV0dG9uXG4gICAgICAgIGxldCAkZWRpdFBvbHlCdXR0b24gPSAkKFwiPGJ1dHRvbj5FZGl0IFBvbHlnb248L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgICBpY29uOiBcImZhIGZhLXBlbmNpbFwiLFxuICAgICAgICAgICAgIHNob3dMYWJlbDogZmFsc2VcbiAgICAgICAgfSkuY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgIHRoaXMuU2V0VmlzaWJsZShmYWxzZSk7XG4gICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcImFubm90YXRpb24tZ3VpOjM1MyBDcmVhdGVcIik7XG4gICAgICAgICAgICAgdGhpcy5wb2x5RWRpdG9yLkJlZ2luRWRpdGluZygpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGVkaXRQb2x5QnV0dG9uLmF0dHIoJ3RpdGxlJywgXCJFZGl0IHBvbHlnb25cIik7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KCRlZGl0UG9seUJ1dHRvbiwgJGJ1dHRvblBhbmVsLCAtMSk7XG5cbiAgICAgICAgLy8gTWFrZSBkZWxldGUgYnV0dG9uXG4gICAgICAgIHRoaXMuJGRlbGV0ZUJ1dHRvbiA9ICQoXCI8YnV0dG9uPkRlbGV0ZSBBbm5vdGF0aW9uPC9idXR0b24+XCIpLmJ1dHRvbih7XG4gICAgICAgICAgICBpY29uOiBcImZhIGZhLWJvbWJcIixcbiAgICAgICAgICAgIHNob3dMYWJlbDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuJGRlbGV0ZUJ1dHRvbi5jc3MoXCJtYXJnaW4tcmlnaHRcIiwgXCIxNXB4XCIpO1xuICAgICAgICB0aGlzLiRkZWxldGVCdXR0b24uYXR0cigndGl0bGUnLCBcIkRlbGV0ZSBhbm5vdGF0aW9uXCIpO1xuICAgICAgICB0aGlzLiRkZWxldGVCdXR0b24uY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3Iuc2VydmVyLkRlbGV0ZUFubm90YXRpb24odGhpcy5vcmlnaW5hbEFubm90YXRpb24sICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmFubm90YXRvci5EZXJlZ2lzdGVyQW5ub3RhdGlvbih0aGlzLm9yaWdpbmFsQW5ub3RhdGlvbik7XG4gICAgICAgICAgICAgICAgdGhpcy5DbG9zZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyRWxlbWVudCh0aGlzLiRkZWxldGVCdXR0b24sICRidXR0b25QYW5lbCwgLTEpO1xuXG5cbiAgICAgICAgLy8gTWFrZSBjYW5jZWwgYnV0dG9uXG4gICAgICAgIGxldCAkY2FuY2VsQnV0dG9uID0gJChcIjxicj48YnI+PGJ1dHRvbj5DYW5jZWw8L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgIHNob3dMYWJlbDogdHJ1ZVxuICAgICAgICB9KS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBvbHlFZGl0b3IuUmVzZXRQb2x5Z29ucygpO1xuICAgICAgICAgICAgdGhpcy5DbG9zZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGNhbmNlbEJ1dHRvbi5jc3MoXCJmbG9hdFwiLCBcInJpZ2h0XCIpO1xuICAgICAgICAkY2FuY2VsQnV0dG9uLmF0dHIoJ3RpdGxlJywgXCJFeGl0IGFubm90YXRpb24gZWRpdGluZ1wiKTtcbiAgICAgICAgLy8kY2FuY2VsX2J1dHRvbi5hZGRDbGFzcyhcIndhbGRvcmYtY2FuY2VsLWJ1dHRvblwiKTtcbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQoJGNhbmNlbEJ1dHRvbiwgJGJ1dHRvblBhbmVsLCAtMSk7XG4gICAgICAgIFxuICAgICAgICAvLyBNYWtlIHNhdmUgYnV0dG9uXG4gICAgICAgIGxldCAkc2F2ZUJ1dHRvbiA9ICQoXCI8YnV0dG9uPlNhdmU8L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgIHNob3dMYWJlbDogdHJ1ZVxuICAgICAgICB9KS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLkNvbW1pdEFubm90YXRpb25Ub1NlcnZlcigoYW5ub3RhdGlvbiwgb2xkSUQpID0+IHtcbiAgICAgICAgICAgICAgICBpZih0aGlzLmVkaXRNb2RlKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IuVXBkYXRlQW5ub3RhdGlvbihhbm5vdGF0aW9uLCBvbGRJRCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IuUmVnaXN0ZXJOZXdBbm5vdGF0aW9uKGFubm90YXRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnBvbHlFZGl0b3IuUmVzZXRQb2x5Z29ucygpO1xuICAgICAgICAgICAgICAgIHRoaXMuQ2xvc2UoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgJHNhdmVCdXR0b24uY3NzKFwiZmxvYXRcIiwgXCJsZWZ0XCIpO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyRWxlbWVudCgkc2F2ZUJ1dHRvbiwgJGJ1dHRvblBhbmVsLCAtMSk7XG5cbiAgICAgICAgLy9odHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMzgzNzMwNC9qcXVlcnktdWktbm9uLWFqYXgtdGFiLWxvYWRpbmctd2hvbGUtd2Vic2l0ZS1pbnRvLWl0c2VsZlxuICAgICAgICAkKCdiYXNlJykucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMuJHRhYnMudGFicygpLmFkZENsYXNzKCd1aS10YWJzLXZlcnRpY2FsJyk7XG4gICAgICAgIC8vbGV0ICRzY3JpcHRfc2VjdGlvbiA9ICRcbiAgICAgICAgLy90aGlzLiRjb250YWluZXIuaGlkZSgpO1xuICAgIH1cblxuICAgIFJlZ2lzdGVyRWxlbWVudCgkZWxlbWVudCwgJGNvbnRhaW5lciwgb3JkZXIsIGp1c3RpZmljYXRpb24gPSAnZmxleC1zdGFydCcpe1xuICAgICAgICAkZWxlbWVudC5jc3MoJ29yZGVyJywgb3JkZXIpO1xuICAgICAgICAkZWxlbWVudC5jc3MoJ2FsaWduLXNlbGYnLCBqdXN0aWZpY2F0aW9uKTtcbiAgICAgICAgLy8gU2V0cyBncm93IFtzaHJpbmtdIFtiYXNpc11cbiAgICAgICAgLy8kZWxlbWVudC5jc3MoJ2ZsZXgnLCAnMCAwIGF1dG8nKTtcbiAgICAgICAgJGNvbnRhaW5lci5hcHBlbmQoJGVsZW1lbnQpO1xuICAgIH1cblxuICAgIFNldFZpc2libGUoaXNWaXNpYmxlLCBkdXJhdGlvbiA9IDApe1xuXG4gICAgICAgIC8vY29uc29sZS5sb2coaXNWaXNpYmxlICsgXCIgXCIgKyBkdXJhdGlvbik7XG4gICAgICAgIGlmKGlzVmlzaWJsZSl7XG4gICAgICAgICAgICB0aGlzLiRjb250YWluZXIuZmFkZVRvKGR1cmF0aW9uLCAxLjApO1xuICAgICAgICAgICAgdGhpcy4kY29udGFpbmVyLm1ha2VWaXNpYmxlKHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kY29udGFpbmVyLnN0b3AodHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLiRjb250YWluZXIuZmFkZVRvKGR1cmF0aW9uLCAwLjApO1xuICAgICAgICAgICAgdGhpcy4kY29udGFpbmVyLm1ha2VWaXNpYmxlKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzVmlzaWJsZSA9IGlzVmlzaWJsZTtcblxuICAgIH1cblxuICAgIFRvZ2dsZU9wZW4oKXtcblxuICAgICAgICBpZih0aGlzLm9wZW4pe1xuICAgICAgICAgICAgdGhpcy5DbG9zZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5PcGVuKCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIE9wZW4oKXtcbiAgICAgICAgdGhpcy5TZXRWaXNpYmxlKHRydWUpO1xuICAgICAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgICAgICB0aGlzLnBvbHlFZGl0b3IuRG9uZSgpO1xuICAgICAgICAvLyBEaXNhYmxlIGF1dG9mYWRpbmcgd2hlbiB0aGUgZ3VpIGlzIHZpc2libGVcbiAgICAgICAgdGhpcy5hbm5vdGF0b3IucGxheWVyLlNldEF1dG9GYWRlKGZhbHNlKTtcbiAgICB9XG5cbiAgICBDbG9zZSgpe1xuICAgICAgICB0aGlzLlNldFZpc2libGUoZmFsc2UpO1xuICAgICAgICB0aGlzLm9wZW4gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wb2x5RWRpdG9yLkRvbmUoKTtcbiAgICAgICAgLy8gUmUtZW5hYmxlIGF1dG9mYWRpbmcgd2hlbiB0aGUgZ3VpIGlzIGhpZGRlblxuICAgICAgICB0aGlzLmFubm90YXRvci5wbGF5ZXIuU2V0QXV0b0ZhZGUodHJ1ZSk7XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci50cmlnZ2VyKFwiT25HVUlDbG9zZWRcIik7XG4gICAgfVxuICAgIFxuICAgIFRvZ2dsZVZpc2libGUoKXtcbiAgICAgICAgdGhpcy5TZXRWaXNpYmxlKCF0aGlzLmlzVmlzaWJsZSwgMCk7XG4gICAgfVxuXG4gICAgQmVnaW5FZGl0aW5nKGFubm90YXRpb24gPSBudWxsLCBmb3JjZU5ldyA9IGZhbHNlKXtcbiAgICAgICAgLy8gT3BlbiB0aGUgR1VJIGlmIGl0IGlzbid0IGFscmVhZHlcbiAgICAgICAgdGhpcy5PcGVuKCk7XG4gICAgICAgIFxuICAgICAgICAvLyBQb3B1bGF0ZSBkYXRhIGZyb20gdGhlIHBhc3NlZCBpbiBhbm5vdGF0aW9uXG4gICAgICAgIGlmIChhbm5vdGF0aW9uIHx8IGZvcmNlTmV3KSB7XG4gICAgICAgICAgICAvLyBQb3B1bGF0ZSB0aGUgZmllbGRzIGZyb20gdGhlIGFubm90YXRpb25cbiAgICAgICAgICAgIHRoaXMuZWRpdE1vZGUgPSB0cnVlO1xuXG4gICAgICAgICAgICAvLyBGbGlwIGVkaXQgbW9kZSBiYWNrIHRvIGZhbHNlIGlmIGZvcmNlTmV3LiBXZSB3YW50IHRvXG4gICAgICAgICAgICAvLyBwb3B1bGF0ZSBmcm9tIHRoZSBlbnRpcmUgcGFzc2VkIGluIGFubm90YXRpb24sIGJ1dCB0cmVhdFxuICAgICAgICAgICAgLy8gaXQgYXMgbmV3LlxuICAgICAgICAgICAgaWYoZm9yY2VOZXcpIHRoaXMuZWRpdE1vZGUgPSBmYWxzZTtcblxuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbEFubm90YXRpb24gPSBhbm5vdGF0aW9uO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlBvcHVsYXRlZCBmcm9tIGFuIGV4aXN0aW5nIGFubm90YXRpb25cIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhhbm5vdGF0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuJHRpbWVTdGFydEZpZWxkLnZhbChHZXRGb3JtYXR0ZWRUaW1lKGFubm90YXRpb24uYmVnaW5UaW1lKSk7XG4gICAgICAgICAgICB0aGlzLiR0aW1lRW5kRmllbGQudmFsKEdldEZvcm1hdHRlZFRpbWUoYW5ub3RhdGlvbi5lbmRUaW1lKSk7XG4gICAgICAgICAgICBpZiAoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mKGFubm90YXRpb24uaXRlbXMpKSB7IC8vIFZlcnNpb24gMVxuICAgICAgICAgICAgICAgIHRoaXMuJHRleHRGaWVsZC52YWwoYW5ub3RhdGlvbi5ib2R5LmZpbHRlcihpdGVtID0+IGl0ZW0ucHVycG9zZSA9PSBcImRlc2NyaWJpbmdcIilbMF0udmFsdWUpO1xuICAgICAgICAgICAgICAgIC8vIFZlcnNpb24gMSBkb2Vzbid0IGhhdmUgYSB0aGlzLmlkIGNvbnRleHRcbiAgICAgICAgICAgIH0gZWxzZSB7IC8vIFZlcnNpb24gMlxuICAgICAgICAgICAgICAgIHRoaXMuJHRleHRGaWVsZC52YWwoYW5ub3RhdGlvbi5pdGVtc1swXS5pdGVtc1swXS5pdGVtc1swXS5ib2R5LmZpbHRlcihpdGVtID0+IGl0ZW0ucHVycG9zZSA9PSBcImRlc2NyaWJpbmdcIilbMF0udmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuaWQgPSBhbm5vdGF0aW9uLml0ZW1zWzBdLml0ZW1zWzBdLml0ZW1zWzBdLmlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUmVzZXQgdGhlIHRhZ3MgZmllbGRcbiAgICAgICAgICAgIHRoaXMuJHRhZ3NGaWVsZC52YWwoXCJcIikudHJpZ2dlcihcImNoYW5nZVwiKTtcbiAgICAgICAgICAgIHRoaXMuJHRhZ3NGaWVsZC5maW5kKFwib3B0aW9uXCIpLnJlbW92ZSgpO1xuXG4gICAgICAgICAgICBmb3IobGV0IHRhZyBvZiBhbm5vdGF0aW9uLnRhZ3Mpe1xuICAgICAgICAgICAgICAgIHRoaXMuJHRhZ3NGaWVsZC5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPSdcIit0YWcrXCInIHNlbGVjdGVkPlwiK3RhZytcIjwvb3B0aW9uPlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLiR0YWdzRmllbGQudHJpZ2dlcihcImNoYW5nZVwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdGhpcy5wb2x5RWRpdG9yLkluaXRQb2x5KGFubm90YXRpb24uZ2V0UG9seSgpKTtcbiAgICAgICAgICAgIC8vIHRoaXMucG9seUVkaXRvci5TaG93SnVzdFBvbHlnb24oKTtcblxuICAgICAgICAgICAgLy8gUHJvcGFnYXRlIHRoZSBwb2x5Z29uIGVkaXRvcidzIHBvbHlnb25zIGFycmF5IHdpdGggcG9seWdvbnMgZnJvbSB0aGUgYW5ub3RhdGlvblxuICAgICAgICAgICAgdGhpcy5wb2x5RWRpdG9yLiRwb2x5Z29ucyA9IFtdO1xuICAgICAgICAgICAgaWYgKGFubm90YXRpb24ucG9seVN0YXJ0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvbHlFZGl0b3IuJHBvbHlnb25zLnB1c2goYW5ub3RhdGlvbi5wb2x5U3RhcnQpO1xuICAgICAgICAgICAgICAgIGlmIChhbm5vdGF0aW9uLnBvbHlFbmQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvbHlFZGl0b3IuJHBvbHlnb25zLnB1c2goYW5ub3RhdGlvbi5wb2x5RW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICAvLyBJbnNlcnQgdGVtcGxhdGUgZGF0YSBpZiBubyBhbm5vdGF0aW9uIGlzIGdpdmVuXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gUG9wdWxhdGUgZmllbGRzIGlmIG5vIGFubm90YXRpb24gaXMgZ2l2ZW5cbiAgICAgICAgICAgIHRoaXMuZWRpdE1vZGUgPSBmYWxzZTtcblxuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbEFubm90YXRpb24gPSBudWxsO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlBvcHVsYXRlZCB3aXRoIHRlbXBsYXRlIGRhdGFcIik7XG4gICAgICAgICAgICB0aGlzLiR0aW1lU3RhcnRGaWVsZC52YWwoR2V0Rm9ybWF0dGVkVGltZSh0aGlzLmFubm90YXRvci5wbGF5ZXIudmlkZW9FbGVtZW50LmN1cnJlbnRUaW1lKSk7XG4gICAgICAgICAgICB0aGlzLiR0aW1lRW5kRmllbGQudmFsKEdldEZvcm1hdHRlZFRpbWUodGhpcy5hbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC5kdXJhdGlvbikpO1xuICAgICAgICAgICAgdGhpcy4kdGV4dEZpZWxkLnZhbChcIlwiKTtcbiAgICAgICAgICAgIC8vIFJlc2V0IHRoZSB0YWdzIGZpZWxkXG4gICAgICAgICAgICB0aGlzLiR0YWdzRmllbGQudmFsKFwiXCIpLnRyaWdnZXIoXCJjaGFuZ2VcIik7XG4gICAgICAgICAgICB0aGlzLiR0YWdzRmllbGQuZmluZChcIm9wdGlvblwiKS5yZW1vdmUoKTtcblxuICAgICAgICAgICAgdGhpcy5wb2x5RWRpdG9yLkluaXRQb2x5KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNb2RpZnkgR1VJIGJhc2VkIG9uIGVkaXQgbW9kZVxuICAgICAgICBpZih0aGlzLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICB0aGlzLiR0aXRsZS50ZXh0KFwiRWRpdCBBbm5vdGF0aW9uXCIpO1xuICAgICAgICAgICAgdGhpcy4kZGVsZXRlQnV0dG9uLmJ1dHRvbihcImVuYWJsZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJHRpdGxlLnRleHQoXCJDcmVhdGUgQW5ub3RhdGlvblwiKTtcbiAgICAgICAgICAgIHRoaXMuJGRlbGV0ZUJ1dHRvbi5idXR0b24oXCJkaXNhYmxlXCIpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBDb21taXRBbm5vdGF0aW9uVG9TZXJ2ZXIoY2FsbGJhY2spe1xuICAgICAgICBpZih0aGlzLmVkaXRNb2RlKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU2VuZGluZyBlZGl0ZWQgYW5ub3RhdGlvbiB0byBzZXJ2ZXIuLi5cIik7XG4gICAgICAgICAgICB0aGlzLmFubm90YXRvci5zZXJ2ZXIuRWRpdEFubm90YXRpb24oY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNlbmRpbmcgbmV3IGFubm90YXRpb24gdG8gc2VydmVyLi4uXCIpO1xuICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3Iuc2VydmVyLlBvc3RBbm5vdGF0aW9uKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEJ1aWxkIGFuIG9iamVjdCBmcm9tIHRoZSBkYXRhLlxuICAgIEdldEFubm90YXRpb25PYmplY3QoKSB7XG5cbiAgICAgICAgbGV0IGFubm90YXRpb24gPSBuZXcgQW5ub3RhdGlvbigpO1xuICAgICAgIFxuICAgICAgICBpZiAoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mKGFubm90YXRpb24uaXRlbXMpKSB7IC8vIFZlcnNpb24gMVxuICAgICAgICAgICAgYW5ub3RhdGlvbltcImJvZHlcIl0gPSB0aGlzLkJ1aWxkQW5ub3RhdGlvbkJvZHlWMSgpO1xuICAgICAgICAgICAgYW5ub3RhdGlvbltcInRhcmdldFwiXSA9IHRoaXMuQnVpbGRBbm5vdGF0aW9uVGFyZ2V0KHRydWUpO1xuICAgICAgICB9IGVsc2UgeyAvLyBWZXJzaW9uIDJcbiAgICAgICAgICAgIGFubm90YXRpb25bXCJsYWJlbFwiXSA9IHtcbiAgICAgICAgICAgICAgICBcImVuXCI6IFt0aGlzLmFubm90YXRvci5jb250ZW50TGFiZWxdXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYW5ub3RhdGlvbltcIml0ZW1zXCJdID0gdGhpcy5CdWlsZEFubm90YXRpb25JdGVtcygpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIFJlY29tcHV0ZSByZWFkLW9ubHkgYWNjZXNzIHByb3BlcnRpZXMgYWZ0ZXIgYWxsIG90aGVyIHByb3BlcnRpZXMgaGF2ZSBiZWVuIHNldFxuICAgICAgICBhbm5vdGF0aW9uLnJlY2FsY3VsYXRlKCk7XG5cbiAgICAgICAgLy8gQ2xvbmUgdGhlIG9iamVjdCBzbyB3ZSBkb24ndCBtb2RpZnkgYW55dGhpbmcgYnkgY2hhbmdpbmcgdGhpcyBvYmplY3RcbiAgICAgICAgbGV0IGNsb25lID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShhbm5vdGF0aW9uKSlcbiAgICAgICAgcmV0dXJuIGNsb25lO1xuICAgIH1cblxuICAgIEJ1aWxkQW5ub3RhdGlvbkl0ZW1zKCkge1xuICAgICAgICBsZXQgYnVpbGRUaW1lID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpOyAvL1wiMjAyMC0wOC0xNlQxMjowMDowMFpcIlxuICAgICAgICBsZXQgdmlkZW9EdXJhdGlvbiA9IHRoaXMuYW5ub3RhdG9yLnBsYXllci52aWRlb0VsZW1lbnQuZHVyYXRpb247XG4gICAgICAgIGxldCB2aWRlb1dpZHRoID0gdGhpcy5hbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC52aWRlb1dpZHRoO1xuICAgICAgICBsZXQgdmlkZW9IZWlnaHQgPSB0aGlzLmFubm90YXRvci5wbGF5ZXIudmlkZW9FbGVtZW50LnZpZGVvSGVpZ2h0O1xuXG4gICAgICAgIC8vIGxldCB2aWRlb0RpbWVuc2lvbiA9IHRoaXMuYW5ub3RhdG9yLnBsYXllci5HZXRWaWRlb0RpbWVuc2lvbnMoKVxuICAgICAgICAvLyB2aWRlb1dpZHRoID0gdmlkZW9EaW1lbnNpb24ud2lkdGg7XG4gICAgICAgIC8vIHZpZGVvSGVpZ2h0ID0gdmlkZW9EaW1lbnNpb24uaGVpZ2h0O1xuXG4gICAgICAgIGxldCBpdGVtcyA9IFt7XG4gICAgICAgICAgICBcImlkXCI6IHRoaXMuYW5ub3RhdG9yLnVybCwgLy9UT0RPOiBzY2FsYXIgc3BlY2lmaWMgdXJsIC0gc2hvdWxkIGJlIHN1cHBsaWVkIHRvIHBsdWdpbiBcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIkNhbnZhc1wiLFxuICAgICAgICAgICAgXCJoZWlnaHRcIjogdmlkZW9IZWlnaHQsXG4gICAgICAgICAgICBcIndpZHRoXCI6IHZpZGVvV2lkdGgsXG4gICAgICAgICAgICBcImR1cmF0aW9uXCI6IHZpZGVvRHVyYXRpb24sIFxuICAgICAgICAgICAgXCJjb250ZW50XCI6IHtcbiAgICAgICAgICAgICAgICBcImlkXCI6IHRoaXMuYW5ub3RhdG9yLnVybCwgXG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiVmlkZW9cIixcbiAgICAgICAgICAgICAgICBcImhlaWdodFwiOiB2aWRlb0hlaWdodCxcbiAgICAgICAgICAgICAgICBcIndpZHRoXCI6IHZpZGVvV2lkdGgsXG4gICAgICAgICAgICAgICAgXCJkdXJhdGlvblwiOiB2aWRlb0R1cmF0aW9uLFxuICAgICAgICAgICAgICAgIFwibGFiZWxcIjoge1xuICAgICAgICAgICAgICAgICAgICBcImVuXCI6IHRoaXMuYW5ub3RhdG9yLmNvbnRlbnRMYWJlbCAvL1wiZGN0ZXJtczp0aXRsZVwiIGZyb20gdGhlIGFubm90YXRpb24ganNvbiBmaWxlIGZyb20gc2NhbGFyXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcImRlc2NyaXB0aW9uXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJlblwiOiBcIlwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiaXRlbXNcIjogW3tcbiAgICAgICAgICAgICAgICBcImlkXCI6IHRoaXMuYW5ub3RhdG9yLnVybCwgIFxuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIkFubm90YXRpb25QYWdlXCIsXG4gICAgICAgICAgICAgICAgXCJnZW5lcmF0b3JcIjogXCJodHRwOi8vZ2l0aHViLmNvbS9hbnZjL3NjYWxhclwiLFxuICAgICAgICAgICAgICAgIFwiZ2VuZXJhdGVkXCI6IGJ1aWxkVGltZSwgXG4gICAgICAgICAgICAgICAgXCJpdGVtc1wiOiBbe1xuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IHRoaXMuaWQsIC8vIFVSTCB0byB0aGUgYW5ub3RhdGlvbi1wYWdlXG4gICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIkFubm90YXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJnZW5lcmF0b3JcIjogXCJodHRwOi8vZ2l0aHViLmNvbS9ub3ZvbWFuY3kvd2FsZG9yZi1zY2FsYXJcIiwgXG4gICAgICAgICAgICAgICAgICAgIFwibW90aXZhdGlvblwiOiBcImhpZ2hsaWdodGluZ1wiLFxuICAgICAgICAgICAgICAgICAgICBcImNyZWF0b3JcIjogdGhpcy5CdWlsZENyZWF0b3JUZW1wbGF0ZSgpLCAgXG4gICAgICAgICAgICAgICAgICAgIFwiY3JlYXRlZFwiOiBidWlsZFRpbWUsICBcbiAgICAgICAgICAgICAgICAgICAgXCJyaWdodHNcIjogXCJodHRwczovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvNC4wL1wiLFxuICAgICAgICAgICAgICAgICAgICBcImJvZHlcIjogdGhpcy5CdWlsZEFubm90YXRpb25Cb2R5VjIoKSxcbiAgICAgICAgICAgICAgICAgICAgXCJ0YXJnZXRcIjogdGhpcy5CdWlsZEFubm90YXRpb25UYXJnZXQoZmFsc2UpXG4gICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XVxuICAgIFxuICAgICAgICB9XTtcblxuXG4gICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgICAgICAgICAgICBcbiAgICB9XG5cbiAgICBCdWlsZENyZWF0b3JUZW1wbGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIlBlcnNvblwiLFxuICAgICAgICAgICAgXCJuaWNrbmFtZVwiOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd2FsZG9yZl91c2VyX25hbWUnKSxcbiAgICAgICAgICAgIFwiZW1haWxfc2hhMVwiOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd2FsZG9yZl91c2VyX2VtYWlsJylcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vQnVpbGQgd2l0aCB0YWdzIGVudHJpZXMgZnJvbSBvbm9teVxuICAgIEJ1aWxkQW5ub3RhdGlvbkJvZHlWMigpIHtcbiAgICAgICAgbGV0IGJvZHkgPSBbXTtcblxuICAgICAgICAvLyBCdWlsZCB0ZXh0IGRlc2NyaXB0b3JcbiAgICAgICAgbGV0IGJvZHlUZXh0ID0ge1xuICAgICAgICAgICAgXCJ0eXBlXCIgOiBcIlRleHR1YWxCb2R5XCIsXG4gICAgICAgICAgICBcInZhbHVlXCIgOiB0aGlzLiR0ZXh0RmllbGQudmFsKCksXG4gICAgICAgICAgICBcImZvcm1hdFwiIDogXCJ0ZXh0L3BsYWluXCIsXG4gICAgICAgICAgICBcImxhbmd1YWdlXCIgOiBcImVuXCIsXG4gICAgICAgICAgICBcInB1cnBvc2VcIjogXCJkZXNjcmliaW5nXCJcbiAgICAgICAgfTtcbiAgICAgICAgYm9keS5wdXNoKGJvZHlUZXh0KTtcblxuICAgICAgICAvLyBCdWlsZCB0YWcgZGVzY3JpcHRvcnNcbiAgICAgICAgLy9sZXQgdGFncyA9IHRoaXMuJHRhZ3NGaWVsZC5zZWxlY3QyKFwiZGF0YVwiKS5tYXAoKGl0ZW0pID0+IHsgcmV0dXJuIGl0ZW0udGV4dDsgfSk7XG4gICAgICAgIGxldCBzZWxlY3RlZF90YWdzID0gdGhpcy4kdGFnc0ZpZWxkLnNlbGVjdDIoXCJkYXRhXCIpLm1hcCgoaXRlbSkgPT4geyByZXR1cm4ge2lkOiBpdGVtLmlkLCB0ZXh0OiBpdGVtLnRleHR9fSk7XG4gICAgICAgIGxldCBvbm9teV9tYXAgPSB0aGlzLmFubm90YXRvci5hbm5vdGF0aW9uTWFuYWdlci5vbm9teVZvY2FidWxhcnkucmVzdWx0cy5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBjdXJyKSB7YWNjW2N1cnJbJ2lkJ11dID0gY3VycjsgcmV0dXJuIGFjYzt9LCB7fSk7XG5cbiAgICAgICAgZm9yKGxldCB0YWcgb2Ygc2VsZWN0ZWRfdGFncyl7XG4gICAgICAgICAgICBsZXQgb25vbXlfcmVmID0gb25vbXlfbWFwW3RhZy5pZF07XG4gICAgICAgICAgICBsZXQgYm9keVRhZyA9IHt9XG4gICAgICAgICAgICBpZiAob25vbXlfcmVmKSB7XG4gICAgICAgICAgICAgICAgYm9keVRhZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiU3BlY2lmaWNSZXNvdXJjZVwiLFxuICAgICAgICAgICAgICAgICAgICBcInB1cnBvc2VcIjogXCJ0YWdnaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgIFwic291cmNlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICBcImlkXCI6IG9ub215X3JlZi50ZXJtc19pZCxcbiAgICAgICAgICAgICAgICAgICAgICBcImZvcm1hdFwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZW5cIjogb25vbXlfcmVmLnRleHRcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY3JpcHRpb25cIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJlblwiOiBvbm9teV9yZWYuY29tbWVudFxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBib2R5VGFnID0ge1xuICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJUZXh0dWFsQm9keVwiLFxuICAgICAgICAgICAgICAgICAgICBcInB1cnBvc2VcIjogXCJ0YWdnaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogdGFnLnRleHRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib2R5LnB1c2goYm9keVRhZyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYm9keTtcbiAgICB9XG5cbiAgICBCdWlsZEFubm90YXRpb25Cb2R5VjEoKSB7XG4gICAgICAgIGxldCBib2R5ID0gW107XG5cbiAgICAgICAgLy8gQnVpbGQgdGV4dCBkZXNjcmlwdG9yXG4gICAgICAgIGxldCBib2R5VGV4dCA9IHtcbiAgICAgICAgICAgIFwidHlwZVwiIDogXCJUZXh0dWFsQm9keVwiLFxuICAgICAgICAgICAgXCJ2YWx1ZVwiIDogdGhpcy4kdGV4dEZpZWxkLnZhbCgpLFxuICAgICAgICAgICAgXCJmb3JtYXRcIiA6IFwidGV4dC9wbGFpblwiLFxuICAgICAgICAgICAgXCJsYW5ndWFnZVwiIDogXCJlblwiLFxuICAgICAgICAgICAgXCJwdXJwb3NlXCI6IFwiZGVzY3JpYmluZ1wiXG4gICAgICAgIH07XG4gICAgICAgIGJvZHkucHVzaChib2R5VGV4dCk7XG5cbiAgICAgICAgLy8gQnVpbGQgdGFnIGRlc2NyaXB0b3JzXG4gICAgICAgIGxldCB0YWdzID0gdGhpcy4kdGFnc0ZpZWxkLnNlbGVjdDIoXCJkYXRhXCIpLm1hcCgoaXRlbSkgPT4geyByZXR1cm4gaXRlbS50ZXh0OyB9KTtcbiAgICAgICAgZm9yKGxldCB0YWdTdHIgb2YgdGFncyl7XG4gICAgICAgICAgICBsZXQgYm9keVRhZyA9IHtcbiAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJUZXh0dWFsQm9keVwiLFxuICAgICAgICAgICAgICAgIFwicHVycG9zZVwiOiBcInRhZ2dpbmdcIixcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IHRhZ1N0clxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm9keS5wdXNoKGJvZHlUYWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJvZHk7XG4gICAgfVxuXG4gICAgLy91c2VkIGJvdGggdjEgYW5kIHYyXG4gICAgQnVpbGRBbm5vdGF0aW9uVGFyZ2V0KHNlbGVjdG9yc0luQXJyYXkpIHtcblxuICAgICAgICBpZiAoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mKHNlbGVjdG9yc0luQXJyYXkpKSBzZWxlY3RvcnNJbkFycmF5ID0gZmFsc2U7XG5cbiAgICAgICAgbGV0IHRhcmdldCA9IHtcbiAgICAgICAgICAgIFwiaWRcIjogdGhpcy5hbm5vdGF0b3IudXJsLCAvLyBVUkwgb2YgdGhlIHZpZGVvXG4gICAgICAgICAgICBcInR5cGVcIjogXCJWaWRlb1wiXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2VsZWN0b3JzID0gW107XG5cbiAgICAgICAgbGV0IHNhZmVFbmRUaW1lID0gR2V0U2Vjb25kc0Zyb21ITVModGhpcy4kdGltZVN0YXJ0RmllbGQudmFsKCkpO1xuICAgICAgICBpZihHZXRTZWNvbmRzRnJvbUhNUyh0aGlzLiR0aW1lRW5kRmllbGQudmFsKCkpID4gR2V0U2Vjb25kc0Zyb21ITVModGhpcy4kdGltZVN0YXJ0RmllbGQudmFsKCkpKXtcbiAgICAgICAgICAgIHNhZmVFbmRUaW1lID0gR2V0U2Vjb25kc0Zyb21ITVModGhpcy4kdGltZUVuZEZpZWxkLnZhbCgpKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgc3RhcnRUaW1lID0gR2V0U2Vjb25kc0Zyb21ITVModGhpcy4kdGltZVN0YXJ0RmllbGQudmFsKCkpO1xuXG4gICAgICAgIC8vIEJ1aWxkIHRpbWUgc2VsZWN0b3JcbiAgICAgICAgbGV0IHRpbWVTZWxlY3RvciA9IHtcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIkZyYWdtZW50U2VsZWN0b3JcIixcbiAgICAgICAgICAgIFwiY29uZm9ybXNUb1wiOiBcImh0dHA6Ly93d3cudzMub3JnL1RSL21lZGlhLWZyYWdzL1wiLCAvLyBTZWUgbWVkaWEgZnJhZ21lbnQgc3BlY2lmaWNhdGlvblxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiBgdD0ke3N0YXJ0VGltZX0sJHtzYWZlRW5kVGltZX1gIC8vIFRpbWUgaW50ZXJ2YWwgaW4gc2Vjb25kc1xuICAgICAgICB9XG5cbiAgICAgICAgLy9CdWlsZCBTdmdTZWxlY3RvclxuICAgICAgICBpZiAodGhpcy5wb2x5RWRpdG9yLiRwb2x5Z29ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBwb2ludHNTdHIgPSB0aGlzLnBvbHlFZGl0b3IuJHBvbHlnb25zWzBdLm1hcChpdGVtID0+IHsgcmV0dXJuIGAke2l0ZW1bMF19LCR7aXRlbVsxXX1gIH0pLmpvaW4oXCIgXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJyRwb2x5Z29uc1swXTogJyArIHBvaW50c1N0cik7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBcIjxzdmcgdmlld0JveD0nMCAwIDEwMCAxMDAnIHByZXNlcnZlQXNwZWN0UmF0aW89J25vbmUnPlwiO1xuICAgICAgICAgICAgdmFsdWUgKz0gXCI8cG9seWdvbiBwb2ludHM9J1wiICsgcG9pbnRzU3RyICsgXCInIC8+XCI7XG5cbiAgICAgICAgICAgIGlmICgndW5kZWZpbmVkJyAhPSB0eXBlb2YodGhpcy5wb2x5RWRpdG9yLiRwb2x5Z29uc1sxXSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgYW5pbWVTdHIgPSB0aGlzLnBvbHlFZGl0b3IuJHBvbHlnb25zWzFdLm1hcChpdGVtID0+IHsgcmV0dXJuIGAke2l0ZW1bMF19LCR7aXRlbVsxXX1gIH0pLmpvaW4oXCIgXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCckcG9seWdvbnNbMV06ICcgKyBhbmltZVN0cik7XG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gXCI8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSdwb2ludHMnIGZyb209J1wiICsgcG9pbnRzU3RyICsgXCInIHRvPSdcIiArIGFuaW1lU3RyICsgXCInXCI7XG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gXCIgc3RhcnQ9J1wiICsgc3RhcnRUaW1lICsgXCInIGVuZD0nXCIgKyBzYWZlRW5kVGltZSArIFwiJyAvPlwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YWx1ZSArPSBcIjwvc3ZnPlwiO1xuXG4gICAgICAgICAgICBsZXQgcG9seWdvblNlbGVjdG9yID0ge1xuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIlN2Z1NlbGVjdG9yXCIsXG4gICAgICAgICAgICAgICAgXCJjb25mb3Jtc1RvXCI6IFwiaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHL1wiLCAvL2FkZGVkIGZvciB2MlxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogYCR7dmFsdWV9YCAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNDg5ODcyOFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNlbGVjdG9yc0luQXJyYXkpIHtcbiAgICAgICAgICAgICAgICBzZWxlY3RvcnMucHVzaChwb2x5Z29uU2VsZWN0b3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aW1lU2VsZWN0b3JbXCJyZWZpbmVkQnlcIl0gPSBwb2x5Z29uU2VsZWN0b3I7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZWN0b3JzSW5BcnJheSkge1xuICAgICAgICAgICAgc2VsZWN0b3JzLnB1c2godGltZVNlbGVjdG9yKTsgICBcbiAgICAgICAgICAgIHRhcmdldFtcInNlbGVjdG9yXCJdID0gc2VsZWN0b3JzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0W1wic2VsZWN0b3JcIl0gPSB0aW1lU2VsZWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cblxuICAgIEdldFRhZ3NRdWVyeSgpIHtcbiAgICAgICAgaWYgKHRoaXMuYW5ub3RhdG9yLmFubm90YXRpb25NYW5hZ2VyICE9IHVuZGVmaW5lZCAmJiB0aGlzLmFubm90YXRvci5hbm5vdGF0aW9uTWFuYWdlci5vbm9teVZvY2FidWxhcnkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYW5ub3RhdG9yLmFubm90YXRpb25NYW5hZ2VyLm9ub215Vm9jYWJ1bGFyeTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB1cmw6IHRoaXMuYW5ub3RhdG9yLnRhZ3NVUkwsXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgZGVsYXk6IDI1MCxcbiAgICAgICAgICAgIGNhY2hlOiB0cnVlLFxuICAgICAgICAgICAgb25vbXlMYW5ndWFnZTogdGhpcy5hbm5vdGF0b3Iub25vbXlMYW5ndWFnZSxcbiAgICAgICAgICAgIGFubm90YXRpb25NYW5hZ2VyOiB0aGlzLmFubm90YXRvci5hbm5vdGF0aW9uTWFuYWdlcixcbiAgICAgICAgICAgIHBhcnNlRnVuY3Rpb246IHRoaXMuT25vbXlWb2NhYnVsYXJQcm9jZXNzLFxuICAgICAgICAgICAgcHJvY2Vzc1Jlc3VsdHM6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWpheE9wdGlvbnMucGFyc2VGdW5jdGlvbihkYXRhLCB0aGlzLmFqYXhPcHRpb25zLm9ub215TGFuZ3VhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIE9ub215Vm9jYWJ1bGFyUHJvY2VzcyhkYXRhLCBvbm9teUxhbmd1YWdlKSB7ICBcbiAgICAgICAgLy8gUGFyc2UgdGhlIGxhYmVscyBpbnRvIHRoZSBmb3JtYXQgZXhwZWN0ZWQgYnkgU2VsZWN0MlxuICAgICAgICAvLyBtdWx0aWxpbmd1YWwgdGFnc1xuICAgICAgICBsZXQgbXVsdGlsaW5ndWFsX3RhZ3MgPSBbXTtcbiAgICAgICAgbGV0IG1fY29tbWVudHMgPSB7fTtcbiAgICAgICAgbGV0IGNvbW1lbnRzID0ge307XG4gICAgICAgIGxldCBtX2luZGV4ID0gMTtcblxuICAgICAgICBsZXQgdGFncyA9IFtdO1xuICAgICAgICBsZXQgaW5kZXggPSAxO1xuICAgICAgICBcbiAgICAgICAgZm9yKGxldCB0ZXJtIG9mIGRhdGFbXCJ0ZXJtc1wiXSl7XG4gICAgICAgICAgICAvL2lmIG9ub215TGFuZ3VhZ2UgaXMgZGVmaW5lZCBjb2xsZWN0IG11bHRpbGluZ3VhbCB0YWdzXG4gICAgICAgICAgICBsZXQgdGVybXNfaWQgPSB0ZXJtW1wicmRmczphYm91dFwiXTtcbiAgICAgICAgICAgIGxldCB0ZXJtc19jb21tZW50ID0gdGVybVtcInJkZnM6Y29tbWVudFwiXTtcbiAgICAgICAgICAgIGlmIChvbm9teUxhbmd1YWdlICE9ICcnICYmIHRlcm1bJ2xhYmVscyddICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxldCB0X2xhYmVsID0gXCJcIjtcbiAgICAgICAgICAgICAgICBsZXQgdF9jb21tZW50ID0gXCJcIjtcblxuICAgICAgICAgICAgICAgIC8vZ2V0IGxhYmVsc1xuICAgICAgICAgICAgICAgIGZvcihsZXQgbGFiZWwgb2YgdGVybVtcImxhYmVsc1wiXSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgeG1sX2xhbmcgPSBsYWJlbFtcInhtbDpsYW5nXCJdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbV9sYWJlbCA9IGxhYmVsW1wicmRmczpsYWJlbFwiXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhtbF9sYW5nID09IG9ub215TGFuZ3VhZ2UgJiYgbV9sYWJlbCAmJiBtX2xhYmVsLnRyaW0gIT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdF9sYWJlbCA9IG1fbGFiZWw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9nZXQgY29tbWVudHNcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBsYWJlbCBvZiB0ZXJtWydjb21tZW50cyddKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB4bWxfbGFuZyA9IGxhYmVsW1wieG1sOmxhbmdcIl07XG4gICAgICAgICAgICAgICAgICAgIGxldCBtX2NvbW1lbnQgPSBsYWJlbFtcInJkZnM6Y29tbWVudHNcIl07IC8vVE9ETzogY2hhbmdlIHRvIGNvbW1lbnQgYWZ0ZXIgZml4aW5nIE9ub215XG4gICAgICAgICAgICAgICAgICAgIGlmICh4bWxfbGFuZyA9PSBvbm9teUxhbmd1YWdlICYmIG1fY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdF9jb21tZW50ID0gbV9jb21tZW50O1xuICAgICAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgdGVybSBjb21tZW50IHZhbHVlIGlmIGNvbW1lbnQgaXMgYmxhbmtcbiAgICAgICAgICAgICAgICBpZiAodF9jb21tZW50ID09IHVuZGVmaW5lZCB8fCB0X2NvbW1lbnQudHJpbSA9PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRfY29tbWVudCA9IHRlcm1zX2NvbW1lbnRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbXVsdGlsaW5ndWFsX3RhZ3MucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBtX2luZGV4LFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiB0X2xhYmVsLFxuICAgICAgICAgICAgICAgICAgICB0ZXJtc19pZDogdGVybXNfaWQsXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQ6IHRfY29tbWVudFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIG1faW5kZXgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0YWdzLnB1c2goe1xuICAgICAgICAgICAgICAgIGlkOiBpbmRleCxcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXJtW1wicmRmczpsYWJlbFwiXSxcbiAgICAgICAgICAgICAgICB0ZXJtc19pZDogdGVybVtcInJkZnM6YWJvdXRcIl0sXG4gICAgICAgICAgICAgICAgY29tbWVudDogdGVybVtcInJkZnM6Y29tbWVudFwiXVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmV0dXJuX3RhZ3MgPSBtdWx0aWxpbmd1YWxfdGFnc1xuICAgICAgICBpZiAocmV0dXJuX3RhZ3MubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHJldHVybl90YWdzID0gdGFnc1xuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJyZXR1cm5fdGFnc1wiKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhyZXR1cm5fdGFncyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN1bHRzOiByZXR1cm5fdGFncyxcbiAgICAgICAgfTtcbiAgICB9XG5cblxuXG59XG5cbmV4cG9ydCB7IEFubm90YXRpb25HVUkgfTsiLCJpbXBvcnQgeyBHZXRGb3JtYXR0ZWRUaW1lIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3RpbWUuanNcIjtcbmxldCBzaGExID0gcmVxdWlyZSgnc2hhMScpO1xuXG5jbGFzcyBJbmRleENvbnRhaW5lciB7XG4gICAgY29uc3RydWN0b3IoYW5ub3RhdG9yKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJbSW5kZXggQ29udGFpbmVyXSBDcmVhdGluZyBhbm5vdGF0aW9uIGluZGV4XCIpO1xuICAgICAgICB0aGlzLmFubm90YXRvciA9IGFubm90YXRvcjtcbiAgICAgICAgbGV0IGNvbnRhaW5lciA9ICQoXCIud2FsZG9yZi1pbmRleFwiKTtcbiAgICAgICAgaWYoY29udGFpbmVyLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgdGhpcy4kY29udGFpbmVyID0gY29udGFpbmVyLmZpcnN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRjb250YWluZXIgPSAkKFwiPGRpdiBjbGFzcz0nd2FsZG9yZi1pbmRleCcgYXJpYS1saXZlPSdwb2xpdGUnIHJvbGU9J25hdmlnYXRpb24nPjwvZGl2PlwiKS5hcHBlbmRUbyh0aGlzLmFubm90YXRvci4kY29udGFpbmVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFubm90YXRpb25MaXN0ID0gJChcIjx1bCBjbGFzcz0nd2FsZG9yZi1hbm5vdGF0aW9uLWxpc3QnIHJvbGU9J21lbnViYXInPjwvdWw+XCIpLmFwcGVuZFRvKHRoaXMuJGNvbnRhaW5lcik7XG4gICAgICAgIC8vIEF0dGFjaCBldmVudCBoYW5kbGVyc1xuICAgICAgICB0aGlzLmFubm90YXRvci4kY29udGFpbmVyLm9uKFwiT25Bbm5vdGF0aW9uc0xvYWRlZFwiLCBcbiAgICAgICAgICAgIChldmVudCwgYW5ub3RhdGlvbk1hbmFnZXIpID0+IHRoaXMuUmVidWlsZCgpKTtcbiAgICAgICAgdGhpcy5hbm5vdGF0b3IuJGNvbnRhaW5lci5vbihcIk9uQW5ub3RhdGlvblJlZ2lzdGVyZWRcIixcbiAgICAgICAgICAgIChldmVudCwgYW5ub3RhdGlvbikgPT4gdGhpcy5SZWJ1aWxkKCkpO1xuICAgICAgICB0aGlzLmFubm90YXRvci4kY29udGFpbmVyLm9uKFwiT25Bbm5vdGF0aW9uUmVtb3ZlZFwiLFxuICAgICAgICAgICAgKGV2ZW50LCBpZCkgPT4gdGhpcy5SZWJ1aWxkKCkpOyAgICAgICAgICAgIFxuXG4gICAgfVxuXG4gICAgUmVidWlsZCgpe1xuICAgICAgICB0aGlzLmFubm90YXRpb25MaXN0LmVtcHR5KCk7XG4gICAgICAgIC8vIGlmKHRoaXMuYW5ub3RhdG9yLnVucmVuZGVyZXIpIHRoaXMuYW5ub3RhdG9yLnVucmVuZGVyZXIodGhpcy5hbm5vdGF0b3IpO1xuXG4gICAgICAgIC8vIGxldCBwbHVyYWwgPSBhbm5vdGF0aW9ucy5sZW5ndGggPT0gMSA/IFwiXCIgOiBcInNcIjtcbiAgICAgICAgLy8gbGV0IHRvdGFsQW5ub3RhdGlvbnMgPSB0aGlzLmFubm90YXRvci5hbm5vdGF0aW9uTWFuYWdlci5hbm5vdGF0aW9ucy5sZW5ndGg7XG4gICAgICAgIC8vIHRoaXMuJGNvbnRhaW5lci5odG1sKGA8cD5TaG93aW5nICR7YW5ub3RhdGlvbnMubGVuZ3RofSBhbm5vdGF0aW9uJHtwbHVyYWx9ICgke3RvdGFsQW5ub3RhdGlvbnN9IHRvdGFsKS48L3A+YCk7XG5cbiAgICAgICAgLy8gQWRkIGVhY2ggYW5ub3RhdGlvbiB0byB0aGUgcmVhZG91dFxuICAgICAgICBsZXQgb3JkZXJlZCA9IHRoaXMuYW5ub3RhdG9yLkdldEFubm90YXRpb25zKCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJlZC5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICB0aGlzLmFubm90YXRpb25MaXN0LmFwcGVuZCh0aGlzLk1ha2VDb250YWluZXIodGhpcy5hbm5vdGF0b3IsIG9yZGVyZWRbaV0sIGkpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIE1ha2VDb250YWluZXIoYW5ub3RhdG9yLCBhbm5vdGF0aW9uKXtcbiAgICAgICAgLy9UT0RPOiBBUklBIGFuZCBnZW5lcmFsIHNjcmVlbiByZWFkZXIgY29tcGF0aWJpbGl0eVxuICAgICAgICBsZXQgJHBhbmVsID0gJChcIjxsaSByb2xlPSdwcmVzZW50YXRpb24nIGRhdGEtY3JlYXRvcj1cIithbm5vdGF0aW9uLmNyZWF0b3IuZW1haWwrXCIgZGF0YS10YWdzPSdcIithbm5vdGF0aW9uLnRhZ3Muam9pbihcIiwgXCIpLnJlcGxhY2UoXCInXCIsIFwiJTI3XCIpK1wiJz48L2xpPlwiKTtcbiAgICAgICAgLy9sZXQgdGV4dCA9IEpTT04uc3RyaW5naWZ5KGFubm90YXRpb24uQXNPcGVuQW5ub3RhdGlvbigpLCBudWxsLCAyKTtcblxuICAgICAgICBsZXQgaGVhZGVyVGV4dCA9IEdldEZvcm1hdHRlZFRpbWUoYW5ub3RhdGlvbi5iZWdpblRpbWUpICsgXCIgLSBcIiArIEdldEZvcm1hdHRlZFRpbWUoYW5ub3RhdGlvbi5lbmRUaW1lKTtcbiBcbiAgICAgICAgLy8gQWRkIGNsaWNrYWJsZSBoZWFkZXIgdGhhdCBicmluZ3MgdXAgdGhlIGVkaXQgaW50ZXJmYWNlLlxuICAgICAgICBsZXQgJGhlYWRlciA9ICQoXCI8YSBocmVmPScnIHRpdGxlPSdHbyB0byBBbm5vdGF0aW9uJyByb2xlPSdtZW51aXRlbSc+XCIraGVhZGVyVGV4dCtcIjwvYT48YnI+XCIpO1xuICAgICAgICAkaGVhZGVyLmNsaWNrKCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBhbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC5jdXJyZW50VGltZSA9IGFubm90YXRpb24uYmVnaW5UaW1lO1xuICAgICAgICAgICAgLy8gaWYoYW5ub3RhdG9yLnBsYXllci52aWRlb0VsZW1lbnQuYW5ub3RhdGlvblRpbWVvdXQpIGNsZWFyVGltZW91dChhbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC5hbm5vdGF0aW9uVGltZW91dCk7XG4gICAgICAgICAgICAvLyBhbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC5hbm5vdGF0aW9uVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIC8vICAgICBhbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC5wYXVzZSgpfSwgKGFubm90YXRpb24uZW5kVGltZS1hbm5vdGF0aW9uLmJlZ2luVGltZSkgKiAxMDAwXG4gICAgICAgICAgICAvLyApO1xuICAgICAgICAgICAgLy9hbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC5zcmM9YW5ub3RhdG9yLnVybCArIFwiI3Q9XCIgKyBhbm5vdGF0aW9uLmJlZ2luVGltZSArXCIsXCIrYW5ub3RhdGlvbi5lbmRUaW1lO1xuICAgICAgICAgICAgLy9hbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC5wbGF5KCk7XG4gICAgICAgICAgICBhbm5vdGF0b3IucGxheWVyLlBsYXkoKTtcbiAgICAgICAgICAgIGFubm90YXRvci5wbGF5ZXIuZW5kVGltZSA9IGFubm90YXRpb24uZW5kVGltZTtcbiAgICAgICAgICAgIGlmKGFubm90YXRpb24uYmVnaW5UaW1lKzEgPiBhbm5vdGF0aW9uLmVuZFRpbWUpe1xuICAgICAgICAgICAgICAgIGFubm90YXRvci5wbGF5ZXIuUGF1c2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHBhbmVsLmFwcGVuZCgkaGVhZGVyKTtcbiAgICAgICAgbGV0ICRjb250ZW50ID0gJChcIjxwPjwvcD5cIik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICRjb250ZW50LmFwcGVuZChcIjxiPlRleHQ6IDwvYj4gXCIgKyBhbm5vdGF0aW9uLmJvZHkuZmlsdGVyKGl0ZW0gPT4gaXRlbS5wdXJwb3NlID09PSBcImRlc2NyaWJpbmdcIilbMF0udmFsdWUpO1xuICAgICAgICAkY29udGVudC5hcHBlbmQoXCI8YnI+XCIpO1xuICAgICAgICAkY29udGVudC5hcHBlbmQoXCI8Yj5UYWdzOiA8L2I+IFwiICsgYW5ub3RhdGlvbi50YWdzLmpvaW4oXCIsIFwiKSk7XG4gICAgICAgICRjb250ZW50LmFwcGVuZChcIjxicj5cIik7XG5cbiAgICAgICAgJHBhbmVsLmFwcGVuZCgkY29udGVudCk7XG4gICAgICAgICRwYW5lbC5hcHBlbmRUbyhhbm5vdGF0b3IuJGFubm90YXRpb25MaXN0KTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJHBhbmVsKTtcbiAgICAgICAgcmV0dXJuICRwYW5lbDtcbiAgICB9XG5cbn1cblxuZXhwb3J0IHsgSW5kZXhDb250YWluZXIgfTsiLCJpbXBvcnQgeyBHZXRGb3JtYXR0ZWRUaW1lIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3RpbWUuanNcIjtcbmxldCBzaGExID0gcmVxdWlyZSgnc2hhMScpO1xuXG5jbGFzcyBJbmZvQ29udGFpbmVyIHtcbiAgICBjb25zdHJ1Y3Rvcihhbm5vdGF0b3Ipe1xuICAgICAgICB0aGlzLmFubm90YXRvciA9IGFubm90YXRvcjtcbiAgICAgICAgbGV0IGNvbnRhaW5lciA9ICQoXCIud2FsZG9yZi1pbmZvXCIpO1xuICAgICAgICBpZihjb250YWluZXIubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICB0aGlzLiRjb250YWluZXIgPSBjb250YWluZXIuZmlyc3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJGNvbnRhaW5lciA9ICQoXCI8ZGl2IGNsYXNzPSd3YWxkb3JmLWluZm8nIGFyaWEtbGl2ZT0ncG9saXRlJyBhcmlhLWF0b21pYz0ndHJ1ZSc+PC9kaXY+XCIpLmFwcGVuZFRvKHRoaXMuYW5ub3RhdG9yLiRjb250YWluZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgUmVidWlsZChhbm5vdGF0aW9ucywgY2xlYXJDb250YWluZXIpe1xuICAgICAgICBpZihjbGVhckNvbnRhaW5lcikgdGhpcy4kY29udGFpbmVyLmVtcHR5KCk7XG4gICAgICAgIGlmKHRoaXMuYW5ub3RhdG9yLnVucmVuZGVyZXIpIHRoaXMuYW5ub3RhdG9yLnVucmVuZGVyZXIodGhpcy5hbm5vdGF0b3IpO1xuXG4gICAgICAgIC8vIGxldCBwbHVyYWwgPSBhbm5vdGF0aW9ucy5sZW5ndGggPT0gMSA/IFwiXCIgOiBcInNcIjtcbiAgICAgICAgLy8gbGV0IHRvdGFsQW5ub3RhdGlvbnMgPSB0aGlzLmFubm90YXRvci5hbm5vdGF0aW9uTWFuYWdlci5hbm5vdGF0aW9ucy5sZW5ndGg7XG4gICAgICAgIC8vIHRoaXMuJGNvbnRhaW5lci5odG1sKGA8cD5TaG93aW5nICR7YW5ub3RhdGlvbnMubGVuZ3RofSBhbm5vdGF0aW9uJHtwbHVyYWx9ICgke3RvdGFsQW5ub3RhdGlvbnN9IHRvdGFsKS48L3A+YCk7XG5cbiAgICAgICAgLy8gQWRkIGVhY2ggYW5ub3RhdGlvbiB0byB0aGUgcmVhZG91dFxuICAgICAgICBsZXQgcmVuZGVyZXIgPSB0aGlzLmFubm90YXRvci5yZW5kZXJlciA9PT0gZmFsc2UgPyB0aGlzLk1ha2VDb250YWluZXIgOiB0aGlzLmFubm90YXRvci5yZW5kZXJlcjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbm5vdGF0aW9ucy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKHJlbmRlcmVyKHRoaXMuYW5ub3RhdG9yLCBhbm5vdGF0aW9uc1tpXSwgaSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgTWFrZUNvbnRhaW5lcihhbm5vdGF0b3IsIGFubm90YXRpb24sIGluZGV4KXtcbiAgICAgICAgbGV0ICRwYW5lbCA9ICQoXCI8cD48L3A+XCIpLmFwcGVuZFRvKCQoXCI8ZGl2PjwvZGl2PlwiKS5hcHBlbmRUbyhhbm5vdGF0b3IuJGNvbnRhaW5lcikpO1xuICAgICAgICAvL2xldCB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkoYW5ub3RhdGlvbi5Bc09wZW5Bbm5vdGF0aW9uKCksIG51bGwsIDIpO1xuXG4gICAgICAgIC8vIEFkZCBjbGlja2FibGUgaGVhZGVyIHRoYXQgYnJpbmdzIHVwIHRoZSBlZGl0IGludGVyZmFjZS5cbiAgICAgICAgbGV0ICRoZWFkZXIgPSAkKGA8Yj5Bbm5vdGF0aW9uICR7aW5kZXggKyAxfTo8L2I+PGJyPmApO1xuICAgICAgICBpZihhbm5vdGF0b3Iua2lvc2tNb2RlPT1mYWxzZSl7XG4gICAgICAgICAgICAkaGVhZGVyID0gJChgPGEgaHJlZj0nJyB0aXRsZT0nRWRpdCBBbm5vdGF0aW9uJz48Yj5Bbm5vdGF0aW9uICR7aW5kZXggKyAxfTo8L2I+PGJyPjwvYT5gKTtcbiAgICAgICAgICAgICRoZWFkZXIuY2xpY2soIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgYW5ub3RhdG9yLmd1aS5CZWdpbkVkaXRpbmcoYW5ub3RhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgICRwYW5lbC5hcHBlbmQoJGhlYWRlcik7XG4gICAgICAgIGxldCAkY29udGVudCA9ICQoXCI8cD48L3A+XCIpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCd1bmRlZmluZWQnID09IHR5cGVvZihhbm5vdGF0aW9uLml0ZW1zKSkgeyAvLyBWZXJzaW9uIDFcbiAgICAgICAgICAgIHZhciBhbm5vdGF0aW9uX2JvZHkgPSBhbm5vdGF0aW9uLmJvZHkuZmlsdGVyKGl0ZW0gPT4gaXRlbS5wdXJwb3NlID09PSBcImRlc2NyaWJpbmdcIilbMF07XG4gICAgICAgICAgICB2YXIgYW5ub3RhdGlvbl9jcmVhdG9yID0gKGFubm90YXRpb24uY3JlYXRvciAhPSBudWxsKSA/IGFubm90YXRpb24uY3JlYXRvciA6IHt9O1xuICAgICAgICB9IGVsc2UgeyAvLyBWZXJzaW9uIDJcbiAgICAgICAgICAgIHZhciBhbm5vdGF0aW9uX2JvZHkgPSBhbm5vdGF0aW9uLml0ZW1zWzBdLml0ZW1zWzBdLml0ZW1zWzBdLmJvZHkuZmlsdGVyKGl0ZW0gPT4gaXRlbS5wdXJwb3NlID09PSBcImRlc2NyaWJpbmdcIilbMF07XG4gICAgICAgICAgICB2YXIgYW5ub3RhdGlvbl9jcmVhdG9yID0gYW5ub3RhdGlvbi5pdGVtc1swXS5pdGVtc1swXS5pdGVtc1swXS5jcmVhdG9yO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAkY29udGVudC5hcHBlbmQoXCI8Yj5UZXh0OiA8L2I+IFwiICsgYW5ub3RhdGlvbl9ib2R5LnZhbHVlKTtcbiAgICAgICAgJGNvbnRlbnQuYXBwZW5kKFwiPGJyPlwiKTtcbiAgICAgICAgJGNvbnRlbnQuYXBwZW5kKFwiPGI+VGFnczogPC9iPiBcIiArIGFubm90YXRpb24udGFncy5qb2luKFwiLCBcIikpO1xuICAgICAgICAkY29udGVudC5hcHBlbmQoXCI8YnI+XCIpO1xuICAgICAgICAkY29udGVudC5hcHBlbmQoXCI8Yj5UaW1lOiA8L2I+IFwiIFxuICAgICAgICAgICAgICAgICsgR2V0Rm9ybWF0dGVkVGltZShhbm5vdGF0aW9uLmJlZ2luVGltZSkgXG4gICAgICAgICAgICAgICAgKyBcIiAtIFwiIFxuICAgICAgICAgICAgICAgICsgR2V0Rm9ybWF0dGVkVGltZShhbm5vdGF0aW9uLmVuZFRpbWUpKTtcbiAgICAgICAgJGNvbnRlbnQuYXBwZW5kKFwiPGJyPlwiKTtcblxuICAgICAgICAkY29udGVudC5hcHBlbmQoXCI8Yj5TdWJtaXR0ZXI6PC9iPiBcIlxuICAgICAgICAgICAgICAgICsgKCgndW5kZWZpbmVkJyAhPSB0eXBlb2YoYW5ub3RhdGlvbl9jcmVhdG9yLm5pY2tuYW1lKSAmJiBhbm5vdGF0aW9uX2NyZWF0b3Iubmlja25hbWUubGVuZ3RoKSA/IGFubm90YXRpb25fY3JlYXRvci5uaWNrbmFtZSA6IFwiPGk+Tm90IGF2YWlsYWJsZTwvaT5cIilcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgIC8vJHBhcmFncmFwaC5hcHBlbmQoXCI8c3Ryb25nPkFubm90YXRpb24gXCIgKyAoaW5kZXggKyAxKSArIFwiOjwvc3Ryb25nPjxicj48cHJlPlwiICsgdGV4dC5lc2NhcGVIVE1MKCkgKyBcIjwvcHJlPlwiKTtcblxuICAgICAgICAkcGFuZWwuYXBwZW5kKCRjb250ZW50KTtcbiAgICAgICAgcmV0dXJuICRwYW5lbDtcbiAgICB9XG5cbn1cblxuZXhwb3J0IHsgSW5mb0NvbnRhaW5lciB9OyIsIlxuY2xhc3MgTWVzc2FnZU92ZXJsYXkge1xuICAgIGNvbnN0cnVjdG9yKGFubm90YXRvcil7XG4gICAgICAgIHRoaXMuYW5ub3RhdG9yID0gYW5ub3RhdG9yO1xuXG4gICAgICAgIHRoaXMuJGNvbnRhaW5lciA9ICQoXCI8ZGl2IGNsYXNzPSd3YWxkb3JmLW1lc3NhZ2Utb3ZlcmxheSc+PC9kaXY+XCIpO1xuICAgICAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kVG8odGhpcy5hbm5vdGF0b3IucGxheWVyLiRjb250YWluZXIpO1xuXG4gICAgICAgIHRoaXMuJHRleHQgPSAkKFwiPHAgcm9sZT0nYWxlcnQnIGFyaWEtbGl2ZT0nYXNzZXJ0aXZlJyBhcmlhLWF0b21pYz0ndHJ1ZSc+PC9wPlwiKS5hcHBlbmRUbyh0aGlzLiRjb250YWluZXIpO1xuICAgICAgICB0aGlzLiRjb250YWluZXIuZmFkZU91dCgwKTtcblxuICAgIH1cblxuICAgIFNob3dFcnJvcihtZXNzYWdlLCBkdXJhdGlvbiA9IDMuMCl7XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcyhcIndhbGRvcmYtbWVzc2FnZS1vdmVybGF5LWVycm9yXCIpO1xuXG4gICAgICAgIHRoaXMuX1Nob3dUZXh0KG1lc3NhZ2UsIGR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICBTaG93TWVzc2FnZShtZXNzYWdlLCBkdXJhdGlvbiA9IDUuMCl7XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci5yZW1vdmVDbGFzcyhcIndhbGRvcmYtbWVzc2FnZS1vdmVybGF5LWVycm9yXCIpO1xuXG4gICAgICAgIHRoaXMuX1Nob3dUZXh0KG1lc3NhZ2UsIGR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICBfU2hvd1RleHQobWVzc2FnZSwgZHVyYXRpb24gPSA1LjApe1xuICAgICAgICB0aGlzLiR0ZXh0Lmh0bWwobWVzc2FnZSk7XG4gICAgICAgIC8vdGhpcy4kY29udGFpbmVyLnN0b3AodHJ1ZSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci5maW5pc2goKTtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLlxuICAgICAgICAgICAgZmFkZUluKDApLlxuICAgICAgICAgICAgZGVsYXkoZHVyYXRpb24gKiAxMDAwKS5cbiAgICAgICAgICAgIGZhZGVPdXQoNDAwKTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IHsgTWVzc2FnZU92ZXJsYXkgfTsiLCJcbi8qKlxuICogTWFuYWdlcyB0aGUgY3JlYXRpbmcgb3IgZWRpdGluZyBvZiBhIHNpbmdsZSBwb2x5Z29uIG9uIHRoZSB2aWRlby5cbiAqIENvbnNpc3RzIG9mIGEgdG9vbGJhciwgYW4gb3ZlcmxheSwgYW5kIHRoZSBwb2x5Z29uIGluc2lkZSB0aGUgb3ZlcmxheS5cbiAqXG4gKiBDbGljayB0byBwbGFjZSBvciByZW1vdmUgYSBkcmFnZ2FibGUgcG9pbnQuIFBvaW50cyBzaG91bGQgYmVcbiAqIHB1dCBkb3duIGluIGNsb2Nrd2lzZSBvcmRlci5cbiAqL1xuY2xhc3MgUG9seWdvbkVkaXRvciB7XG4gICAgY29uc3RydWN0b3IoYW5ub3RhdG9yKXtcbiAgICAgICAgdGhpcy5hbm5vdGF0b3IgPSBhbm5vdGF0b3I7XG4gICAgICAgIHRoaXMuYmFzZVogPSAyMTQ3NDgzNjQ5O1xuICAgICAgICB0aGlzLiRicmVhZGNydW1icyA9IFtdO1xuICAgICAgICB0aGlzLiRwb2x5Z29ucyA9IFtdO1xuICAgICAgICB0aGlzLiR0ZW1wQnJlYWRDcnVtYnMgPSBbXTtcblxuICAgICAgICAvLyBDcmVhdGUgdGhlIHZpZGVvIG92ZXJsYXlcbiAgICAgICAgdGhpcy4kY2xpY2tTdXJmYWNlID0gJChcIjxkaXYgY2xhc3M9J3dhbGRvcmYtZWRpdC1vdmVybGF5IHdhbGRvcmYtdnAtY2xpY2stc3VyZmFjZSc+PC9kaXY+XCIpLmFwcGVuZFRvKHRoaXMuYW5ub3RhdG9yLnBsYXllci4kY29udGFpbmVyKTtcbiAgICAgICAgLy90aGlzLiRjbGlja1N1cmZhY2UuY3NzKFwiei1pbmRleFwiLCB0aGlzLmJhc2VaKTtcbiAgICAgICAgdGhpcy4kY2xpY2tTdXJmYWNlLmNsaWNrKChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5PblN1cmZhY2VDbGljayhldmVudCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgcG9seSBvYmplY3QgZm9yIHN0YXJ0IHBvc2l0aW9uIHBvbHlnb25cbiAgICAgICAgdGhpcy4kc3RhcnRQb2x5ID0gXCJcIjtcbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgcG9seSBvYmplY3RcbiAgICAgICAgdGhpcy4kcG9seSA9ICQoXCI8ZGl2IGNsYXNzPSd3YWxkb3JmLWVkaXQtcG9seSc+PC9kaXY+XCIpLmFwcGVuZFRvKHRoaXMuYW5ub3RhdG9yLnBsYXllci4kY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy4kcG9seS5jc3MoXCJ6LWluZGV4XCIsIHRoaXMuYmFzZVogKyAxKTtcblxuICAgICAgICB0aGlzLlJlc2l6ZU92ZXJsYXkoKTtcbiAgICAgICAgdGhpcy5hbm5vdGF0b3IucGxheWVyLiRjb250YWluZXIub24oXCJPbkZ1bGxzY3JlZW5DaGFuZ2VcIiwgKGV2ZW50LCBzZXRGdWxsc2NyZWVuKSA9PiB0aGlzLlJlc2l6ZU92ZXJsYXkoKSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSB0b29sYmFyIHVwIHRvcFxuICAgICAgICB0aGlzLiRiYXIgPSAkKFwiPGRpdiBjbGFzcz0nd2FsZG9yZi12cC1wb3N0Jz48L2Rpdj5cIikuYXBwZW5kVG8odGhpcy5hbm5vdGF0b3IucGxheWVyLiRjb250YWluZXIpO1xuICAgICAgICB0aGlzLiRwb3N0VG9vbGJhciA9ICQoXCI8ZGl2IGNsYXNzPSdmbGV4LXRvb2xiYXInPjwvZGl2PlwiKS5hcHBlbmRUbyh0aGlzLiRiYXIpO1xuICAgICAgICAvLyBJbnZpc2libGUgZXhwYW5kaW5nIGRpdmlkZXJcbiAgICAgICAgLy8tMy8vdGhpcy4kcG9zdFRvb2xiYXIuYXBwZW5kKCQoXCI8ZGl2PjxwIHN0eWxlPSdjb2xvcjp3aGl0ZSc+RWRpdCBQb2x5Z29uPC9wPjwvZGl2PlwiKS5jc3MoXCJmbGV4LWdyb3dcIiwgMSkuY3NzKFwib3JkZXJcIiwgMCkpO1xuXG5cbiAgICAgICAgLy8gTWFrZSBcIkNvbGxlY3QgUG9seWdvbiBzdGF0ZVwiIGJ1dHRvblxuICAgICAgICB0aGlzLiRjYXBQb2x5QnV0dG9uID0gJChcIjxidXR0b24+Q2FwdHVyZSBQb2x5Z29uPC9idXR0b24+XCIpLmJ1dHRvbih7XG4gICAgICAgICAgICBpY29uOiBcImZhIGZhLWNhbWVyYS1yZXRyb1wiLFxuICAgICAgICAgICAgc2hvd0xhYmVsOiBmYWxzZVxuICAgICAgICB9KS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICAvL3RoaXMuU2V0VmlzaWJsZShmYWxzZSk7XG4gICAgICAgICAgICAvL3RoaXMuR2V0UG9pbnRzKCk7XG5cbiAgICAgICAgICAgIC8vIEJ1aWxkIHBvbHlnb24gc2VsZWN0b3JcbiAgICAgICAgICAgIC8vIGxldCBwb2ludHMgPSB0aGlzLkdldFBvaW50cygpO1xuICAgICAgICAgICAgLy8gaWYocG9pbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vICAgICBsZXQgcG9pbnRzU3RyID0gcG9pbnRzLm1hcChpdGVtID0+IHsgcmV0dXJuIGAke2l0ZW1bMF19LCR7aXRlbVsxXX1gIH0pLmpvaW4oXCIgXCIpO1xuICAgICAgICAgICAgLy8gICAgIGxldCBwb2x5Z29uU2VsZWN0b3IgPSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIFwidHlwZVwiOiBcIlN2Z1NlbGVjdG9yXCIsXG4gICAgICAgICAgICAvLyAgICAgICAgIFwidmFsdWVcIjogYDxzdmc6c3ZnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSdub25lJz48cG9seWdvbiBwb2ludHM9JyR7cG9pbnRzU3RyfScgLz48L3N2Zzpzdmc+YCAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNDg5ODcyOFxuICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgIC8vICAgICB0bXBTZWxlY3RvcnMucHVzaChwb2x5Z29uU2VsZWN0b3IpO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJ0bXBTZWxlY3RvcnNcIik7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0bXBTZWxlY3RvcnMpO1xuICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IuQWRkUG9seWdvblNldCh0aGlzLmFubm90YXRvci5hbm5vdGF0aW9uLmdldFBvbHkoKSk7XG5cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuJGNhcFBvbHlCdXR0b24uY3NzKFwibWFyZ2luLXJpZ2h0XCIsIFwiMTVweFwiKTtcbiAgICAgICAgdGhpcy4kY2FwUG9seUJ1dHRvbi5hdHRyKCd0aXRsZScsIFwiQ2FwdHVyZSBwb2x5Z29uXCIpO1xuICAgICAgICAvLy0zLy90aGlzLlJlZ2lzdGVyRWxlbWVudCh0aGlzLiRjYXBQb2x5QnV0dG9uLCB0aGlzLiRwb3N0VG9vbGJhciwgMSwgJ2ZsZXgtZW5kJyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHVuZG8gYnV0dG9uXG4gICAgICAgIHRoaXMuJHVuZG9CdXR0b24gPSAkKFwiPGJ1dHRvbj5SZW1vdmUgTGFzdCBQb2ludDwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgaWNvbjogXCJmYSBmYS11bmRvXCIsXG4gICAgICAgICAgICBzaG93TGFiZWw6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLiR1bmRvQnV0dG9uLmNzcyhcIm1hcmdpbi1yaWdodFwiLCBcIjE1cHhcIik7XG4gICAgICAgIHRoaXMuJHVuZG9CdXR0b24uYXR0cigndGl0bGUnLCBcIlJlbW92ZSBsYXN0IHBvaW50XCIpO1xuICAgICAgICB0aGlzLiR1bmRvQnV0dG9uLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuUmVtb3ZlTGFzdEJyZWFkY3J1bWIoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vLTMvL3RoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJHVuZG9CdXR0b24sIHRoaXMuJHBvc3RUb29sYmFyLCAxLCAnZmxleC1lbmQnKTtcblxuICAgICAgICAvLyBDcmVhdGUgdGhlIGNvbmZpcm0gYnV0dG9uXG4gICAgICAgIHRoaXMuJGNvbmZpcm1CdXR0b24gPSAkKFwiPGJ1dHRvbj5GaW5pc2ggcG9seWdvbjwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgaWNvbjogXCJmYSBmYS1jaGVja1wiLFxuICAgICAgICAgICAgc2hvd0xhYmVsOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy4kY29uZmlybUJ1dHRvbi5hdHRyKCd0aXRsZScsIFwiRmluaXNoIHBvbHlnb25cIik7XG4gICAgICAgIHRoaXMuJGNvbmZpcm1CdXR0b24uYWRkQ2xhc3MoXCJ3YWxkb3JmLWNvbmZpcm0tYnV0dG9uXCIpO1xuICAgICAgICB0aGlzLiRjb25maXJtQnV0dG9uLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWxKU09OID0gdGhpcy5HZXRKU09OKCk7XG4gICAgICAgICAgICB0aGlzLkRvbmUoKTtcbiAgICAgICAgICAgIHRoaXMuYW5ub3RhdG9yLiRjb250YWluZXIudHJpZ2dlcihcIk9uUG9seWdvbkVkaXRpbmdFbmRlZFwiKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vLTMvL3RoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJGNvbmZpcm1CdXR0b24sIHRoaXMuJHBvc3RUb29sYmFyLCAzLCAnZmxleC1lbmQnKTtcblxuICAgICAgICAvLyBDcmVhdGUgdGhlIGNhbmNlbCBidXR0b25cbiAgICAgICAgdGhpcy4kY2FuY2VsQnV0dG9uID0gJChcIjxidXR0b24+U3RvcCBwb2x5Z29uIGVkaXRpbmc8L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgIGljb246IFwiZmEgZmEtcmVtb3ZlXCIsXG4gICAgICAgICAgICBzaG93TGFiZWw6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLiRjYW5jZWxCdXR0b24uYWRkQ2xhc3MoXCJ3YWxkb3JmLWNhbmNlbC1idXR0b25cIik7XG4gICAgICAgIHRoaXMuJGNhbmNlbEJ1dHRvbi5hdHRyKCd0aXRsZScsIFwiU3RvcCBwb2x5Z29uIGVkaXRpbmdcIik7XG4gICAgICAgIHRoaXMuJGNhbmNlbEJ1dHRvbi5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICAvL1Jlc3RvcmUgdGhlIG9yaWdpbmFsIHN0YXRlXG4gICAgICAgICAgICB0aGlzLlJlc3RvcmUoKTtcbiAgICAgICAgICAgIHRoaXMuRG9uZSgpO1xuICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IuJGNvbnRhaW5lci50cmlnZ2VyKFwiT25Qb2x5Z29uRWRpdGluZ0VuZGVkXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8tMy8vdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kY2FuY2VsQnV0dG9uLCB0aGlzLiRwb3N0VG9vbGJhciwgMiwgJ2ZsZXgtZW5kJyk7XG5cbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZSgoKSA9PiB0aGlzLlJlc2l6ZU92ZXJsYXkoKSk7XG5cblxuICAgICAgICAvKiBcbiAgICAgICAgKiBuZXcgVUlcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy4kZWRpdERpYWxvZyA9ICQoXCI8ZGl2IGlkPSdlZGl0LWRpYWxvZycgY2xhc3M9J3dhbGRvcmYtZWRpdC1vdmVybGF5IHdhbGRvcmYtdnAtY2xpY2stc3VyZmFjZSc+PC9kaXY+XCIpLmFwcGVuZFRvKHRoaXMuYW5ub3RhdG9yLnBsYXllci4kY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy4kZWRpdERpYWxvZy5kcmFnZ2FibGUoKTtcbiAgICAgICAgdGhpcy4kZWRpdERpYWxvZy5jc3MoJ3otaW5kZXgnLCB0aGlzLmJhc2VaICsgMTAwKTtcbiAgICAgICAgdGhpcy4kZWRpdERpYWxvZy5jbGljaygoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuT25TdXJmYWNlQ2xpY2soZXZlbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLiRzcGFjZSA9ICQoXCI8ZGl2PiZuYnNwOzwvZGl2Pjxocj5cIik7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJHNwYWNlLCB0aGlzLiRlZGl0RGlhbG9nLCAxLCAnZmxleC1lbmQnKTtcblxuICAgICAgICAvLyBDcmVhdGUgdW5kbyBidXR0b25cbiAgICAgICAgdGhpcy4kdW5kb0J1dHRvbjEgPSAkKFwiPGJ1dHRvbj5SZW1vdmUgTGFzdCBQb2ludDwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgaWNvbjogXCJmYSBmYS11bmRvXCIsXG4gICAgICAgICAgICBzaG93TGFiZWw6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLiR1bmRvQnV0dG9uMS5jc3MoXCJtYXJnaW5cIiwgXCIwcHggNXB4IDRweCA1cHhcIik7XG4gICAgICAgIHRoaXMuJHVuZG9CdXR0b24xLmF0dHIoJ3RpdGxlJywgXCJSZW1vdmUgbGFzdCBwb2ludFwiKTtcbiAgICAgICAgdGhpcy4kdW5kb0J1dHRvbjEuY3NzKCd6LWluZGV4JywgdGhpcy5iYXNlWiArIDEwNSk7XG4gICAgICAgIHRoaXMuJHVuZG9CdXR0b24xLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuUmVtb3ZlTGFzdEJyZWFkY3J1bWIoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJHVuZG9CdXR0b24xLCB0aGlzLiRlZGl0RGlhbG9nLCAxLCAnZmxleC1lbmQnKTtcblxuICAgICAgICAvLyBNYWtlIFwiQ29sbGVjdCBQb2x5Z29uIHN0YXRlXCIgYnV0dG9uXG4gICAgICAgIHRoaXMuJGNhcFBvbHlCdXR0b24xID0gJChcIjxidXR0b24+Q2FwdHVyZSBQb2x5Z29uPC9idXR0b24+XCIpLmJ1dHRvbih7XG4gICAgICAgICAgICBpY29uOiBcImZhIGZhLWNhbWVyYS1yZXRyb1wiLFxuICAgICAgICAgICAgc2hvd0xhYmVsOiBmYWxzZVxuICAgICAgICB9KS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICAvLyAvL3RoaXMuU2V0VmlzaWJsZShmYWxzZSk7XG4gICAgICAgICAgICAvLyAvL3RoaXMuR2V0UG9pbnRzKCk7XG5cbiAgICAgICAgICAgIC8vIGxldCB0bXBTZWxlY3RvcnMgPSBbXTtcblxuICAgICAgICAgICAgLy8gLy8gQnVpbGQgcG9seWdvbiBzZWxlY3RvclxuICAgICAgICAgICAgLy8gbGV0IHBvaW50cyA9IHRoaXMuR2V0UG9pbnRzKCk7XG4gICAgICAgICAgICAvLyBpZihwb2ludHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gICAgIGxldCBwb2ludHNTdHIgPSBwb2ludHMubWFwKGl0ZW0gPT4geyByZXR1cm4gYCR7aXRlbVswXX0sJHtpdGVtWzFdfWAgfSkuam9pbihcIiBcIik7XG4gICAgICAgICAgICAvLyAgICAgbGV0IHBvbHlnb25TZWxlY3RvciA9IHtcbiAgICAgICAgICAgIC8vICAgICAgICAgXCJ0eXBlXCI6IFwiU3ZnU2VsZWN0b3JcIixcbiAgICAgICAgICAgIC8vICAgICAgICAgXCJ2YWx1ZVwiOiBgPHN2Zzpzdmcgdmlld0JveD0nMCAwIDEwMCAxMDAnIHByZXNlcnZlQXNwZWN0UmF0aW89J25vbmUnPjxwb2x5Z29uIHBvaW50cz0nJHtwb2ludHNTdHJ9JyAvPjwvc3ZnOnN2Zz5gIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI0ODk4NzI4XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gICAgIHRtcFNlbGVjdG9ycy5wdXNoKHBvbHlnb25TZWxlY3Rvcik7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInRtcFNlbGVjdG9yc1wiKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRtcFNlbGVjdG9ycyk7XG4gICAgICAgICAgICB0aGlzLkFkZFBvbHlnb25TZXQoKTtcbiAgICAgICAgICAgIC8vdGhpcy5hbm5vdGF0b3IuQWRkUG9seWdvblNldCh0aGlzLmFubm90YXRvci5hbm5vdGF0aW9uLmdldFBvbHkoKSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLiRjYXBQb2x5QnV0dG9uMS5jc3MoXCJtYXJnaW5cIiwgXCIwcHggNXB4IDRweCA1cHhcIik7XG4gICAgICAgIHRoaXMuJGNhcFBvbHlCdXR0b24xLmF0dHIoJ3RpdGxlJywgXCJDYXB0dXJlIFBvbHlnb25cIik7XG4gICAgICAgIHRoaXMuJGNhcFBvbHlCdXR0b24xLmNzcygnei1pbmRleCcsIHRoaXMuYmFzZVogKyAxMDUpO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyRWxlbWVudCh0aGlzLiRjYXBQb2x5QnV0dG9uMSwgdGhpcy4kZWRpdERpYWxvZywgMSwgJ2ZsZXgtZW5kJyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBjYW5jZWwgYnV0dG9uXG4gICAgICAgIHRoaXMuJGNhbmNlbEJ1dHRvbjEgPSAkKFwiPGJ1dHRvbj5TdG9wIHBvbHlnb24gZWRpdGluZzwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgaWNvbjogXCJmYSBmYS1yZW1vdmVcIixcbiAgICAgICAgICAgIHNob3dMYWJlbDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuJGNhbmNlbEJ1dHRvbjEuY3NzKFwibWFyZ2luXCIsIFwiMHB4IDVweCA0cHggNXB4XCIpO1xuICAgICAgICB0aGlzLiRjYW5jZWxCdXR0b24xLmFkZENsYXNzKFwid2FsZG9yZi1jYW5jZWwtYnV0dG9uXCIpO1xuICAgICAgICB0aGlzLiRjYW5jZWxCdXR0b24xLmF0dHIoJ3RpdGxlJywgXCJTdG9wIFBvbHlnb24gRWRpdGluZ1wiKTtcbiAgICAgICAgdGhpcy4kY2FuY2VsQnV0dG9uMS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICAvL1Jlc3RvcmUgdGhlIG9yaWdpbmFsIHN0YXRlXG4gICAgICAgICAgICB0aGlzLlJlc3RvcmUoKTtcbiAgICAgICAgICAgIHRoaXMuRG9uZSgpO1xuICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IuJGNvbnRhaW5lci50cmlnZ2VyKFwiT25Qb2x5Z29uRWRpdGluZ0VuZGVkXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5SZWdpc3RlckVsZW1lbnQodGhpcy4kY2FuY2VsQnV0dG9uMSwgdGhpcy4kZWRpdERpYWxvZywgMiwgJ2ZsZXgtZW5kJyk7XG5cbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZSgoKSA9PiB0aGlzLlJlc2l6ZU92ZXJsYXkoKSk7XG5cbiAgICAgICAgdGhpcy5Eb25lKCk7XG4gICAgfVxuXG4gICAgT25TdXJmYWNlQ2xpY2soZXZlbnQpe1xuICAgICAgICBpZiAoJChldmVudC5jdXJyZW50VGFyZ2V0KS5hdHRyKFwiaWRcIikgPT0gXCJlZGl0LWRpYWxvZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgYSBicmVhZGNydW1iIG9uIGNsaWNrXG4gICAgICAgIGxldCB0YXJnZXQgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICBsZXQgeCA9IGV2ZW50LnBhZ2VYIC0gdGFyZ2V0Lm9mZnNldCgpLmxlZnQ7XG4gICAgICAgIGxldCB5ID0gZXZlbnQucGFnZVkgLSB0YXJnZXQub2Zmc2V0KCkudG9wO1xuICAgICAgICBcbiAgICAgICAgbGV0IHhQZXJjZW50ID0gKHggLyB0YXJnZXQud2lkdGgoKSkgKiAxMDA7XG4gICAgICAgIGxldCB5UGVyY2VudCA9ICh5IC8gdGFyZ2V0LmhlaWdodCgpKSAqIDEwMDtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuQWRkQnJlYWRjcnVtYih4UGVyY2VudCwgeVBlcmNlbnQpO1xuICAgICAgICBcbiAgICAgICAgLy90aGlzLm5ld1BvbHlQb2ludHMucHVzaChbeFBlcmNlbnQudG9GaXhlZCgzKSwgeVBlcmNlbnQudG9GaXhlZCgzKV0pO1xuICAgICAgICB0aGlzLlVwZGF0ZVBvbHlDbGlwcGluZygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgYnJlYWRjcnVtYiBhdCB0aGUgZ2l2ZW4gKHgsIHkpIHBvaW50IG9uIHRoZVxuICAgICAqIGNsaWNrU3VyZmFjZSwgd2hlcmUgeCBhbmQgeSBhcmUgcGVyY2VudGFnZXMgZnJvbSAwIHRvIDEwMC5cbiAgICAgKi9cbiAgICBBZGRCcmVhZGNydW1iKHhQZXJjZW50LCB5UGVyY2VudCl7XG4gICAgICAgIGxldCAkYnJlYWRjcnVtYiA9ICQoXCI8ZGl2IGNsYXNzPSdicmVhZGNydW1iJz48L2Rpdj5cIik7XG4gICAgICAgICRicmVhZGNydW1iLmFwcGVuZFRvKHRoaXMuJGNsaWNrU3VyZmFjZSk7XG4gICAgICAgICRicmVhZGNydW1iLmNzcyhcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIik7XG5cbiAgICAgICAgLy8gUGVyY2VudGFnZSByZXByZXNlbnRhdGlvbnMgb2YgYnJlYWRjcnVtYiB3aWR0aCBhbmQgaGVpZ2h0XG4gICAgICAgIGxldCBvZmZQZXJjZW50WCA9ICgkYnJlYWRjcnVtYi5vdXRlcldpZHRoKCkgLyB0aGlzLiRjbGlja1N1cmZhY2Uud2lkdGgoKSkgKiAxMDA7XG4gICAgICAgIGxldCBvZmZQZXJjZW50WSA9ICgkYnJlYWRjcnVtYi5vdXRlckhlaWdodCgpIC8gdGhpcy4kY2xpY2tTdXJmYWNlLmhlaWdodCgpKSAqIDEwMDtcbiAgICAgICAgLy8gUGVyY2VudGFnZSByZXByZXNlbnRhdGlvbnMgb2YgYnJlYWRjcnVtYiB3aWR0aCBhbmQgaGVpZ2h0XG4gICAgICAgICRicmVhZGNydW1iLmNzcyhcImxlZnRcIiwgKHhQZXJjZW50IC0gKG9mZlBlcmNlbnRYIC8gMikpLnRvU3RyaW5nKCkgKyBcIiVcIik7XG4gICAgICAgICRicmVhZGNydW1iLmNzcyhcInRvcFwiLCAoeVBlcmNlbnQgLSAob2ZmUGVyY2VudFkgLyAyKSkudG9TdHJpbmcoKSArIFwiJVwiKTtcbiAgICAgICAgLy8kYnJlYWRjcnVtYi5jc3MoXCJ6LWluZGV4XCIsIHRoaXMuYmFzZVogLSA1MCk7XG5cbiAgICAgICAgXG4gICAgICAgICRicmVhZGNydW1iLmRyYWdnYWJsZSh7IFxuICAgICAgICAgICAgLy9jb250YWlubWVudDogXCJwYXJlbnRcIixcbiAgICAgICAgICAgIGRyYWc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBSZWNhbGN1bGF0ZSBwZXJjZW50YWdlcyAobWFuZ2xlZCBieSBqUXVlcnkgVUkgZHJhZ2dhYmxlIGNvZGUpXG4gICAgICAgICAgICAgICAgLy8gU2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIzNjczNDYyXG4gICAgICAgICAgICAgICAgdmFyIGwgPSAoIDEwMCAqIHBhcnNlRmxvYXQoJGJyZWFkY3J1bWIuY3NzKFwibGVmdFwiKSkgLyBwYXJzZUZsb2F0KCRicmVhZGNydW1iLnBhcmVudCgpLmNzcyhcIndpZHRoXCIpKSApKyBcIiVcIiA7XG4gICAgICAgICAgICAgICAgdmFyIHQgPSAoIDEwMCAqIHBhcnNlRmxvYXQoJGJyZWFkY3J1bWIuY3NzKFwidG9wXCIpKSAvIHBhcnNlRmxvYXQoJGJyZWFkY3J1bWIucGFyZW50KCkuY3NzKFwiaGVpZ2h0XCIpKSApKyBcIiVcIiA7XG4gICAgICAgICAgICAgICAgJGJyZWFkY3J1bWIuY3NzKFwibGVmdFwiICwgbCk7XG4gICAgICAgICAgICAgICAgJGJyZWFkY3J1bWIuY3NzKFwidG9wXCIgLCB0KTtcbiAgICAgICAgICAgICAgICB0aGlzLlVwZGF0ZVBvbHlDbGlwcGluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgJGJyZWFkY3J1bWIuY2xpY2soKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIGJyZWFkY3J1bWIgb24gY2xpY2tcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgJGJyZWFkY3J1bWIucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLiRicmVhZGNydW1icy5zcGxpY2UodGhpcy4kYnJlYWRjcnVtYnMuaW5kZXhPZigkYnJlYWRjcnVtYiksIDEpO1xuICAgICAgICAgICAgdGhpcy5VcGRhdGVQb2x5Q2xpcHBpbmcoKTtcbiAgICAgICAgICAgIHRoaXMuVXBkYXRlQnJlYWRjcnVtYkNvbG9yaW5nKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy4kYnJlYWRjcnVtYnMucHVzaCgkYnJlYWRjcnVtYik7XG5cbiAgICAgICAgLy90aGlzLlVwZGF0ZVBvbHlDbGlwcGluZygpO1xuICAgICAgICB0aGlzLlVwZGF0ZUJyZWFkY3J1bWJDb2xvcmluZygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIGxhc3QtcGxhY2VkIGJyZWFkY3J1bWIgZnJvbSB0aGUgbGlzdFxuICAgICAqIGFuZCB1cGRhdGVzIHRoZSB2aWV3LlxuICAgICAqL1xuICAgIFJlbW92ZUxhc3RCcmVhZGNydW1iKCl7XG4gICAgICAgIGxldCAkcmVtb3ZlZCA9IHRoaXMuJGJyZWFkY3J1bWJzLnBvcCgpO1xuICAgICAgICAkcmVtb3ZlZC5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5VcGRhdGVQb2x5Q2xpcHBpbmcoKTtcbiAgICAgICAgdGhpcy5VcGRhdGVCcmVhZGNydW1iQ29sb3JpbmcoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBjZW50ZXIgb2YgdGhlIGJyZWFkY3J1bWIgYXMgYW4gKHgsIHkpIHBhaXJcbiAgICAgKiByZXByZXNlbnRpbmcgdGhlIHBlcmNlbnRhZ2UgZGlzdGFuY2UgZnJvbSB0aGUgdG9wIGFuZCBsZWZ0XG4gICAgICogb2YgdGhlIGNsaWNrIHN1cmZhY2UgKDAlIC0gMTAwJSkuXG4gICAgICovXG4gICAgR2V0Q2VudGVyUGVyY2VudGFnZSgkYnJlYWRjcnVtYil7XG4gICAgICAgIGxldCB0b3BQZXJjZW50ID0gKCRicmVhZGNydW1iLnBvc2l0aW9uKCkudG9wIC8gJGJyZWFkY3J1bWIucGFyZW50KCkuaGVpZ2h0KCkpICogMTAwO1xuICAgICAgICBsZXQgbGVmdFBlcmNlbnQgPSAoJGJyZWFkY3J1bWIucG9zaXRpb24oKS5sZWZ0IC8gJGJyZWFkY3J1bWIucGFyZW50KCkud2lkdGgoKSkgKiAxMDA7XG5cbiAgICAgICAgLy8gUGVyY2VudGFnZSB2YWx1ZXMgZm9yIHRoZSBkaW1lbnNpb25zIG9mIHRoZSBicmVhZGNydW1iIHJlbGF0aXZlIHRvIHRoZSBjbGljayBzdXJmYWNlXG4gICAgICAgIGxldCBvZmZQZXJjZW50WCA9ICgkYnJlYWRjcnVtYi5vdXRlcldpZHRoKCkgLyAkYnJlYWRjcnVtYi5wYXJlbnQoKS53aWR0aCgpKSAqIDEwMDtcbiAgICAgICAgbGV0IG9mZlBlcmNlbnRZID0gKCRicmVhZGNydW1iLm91dGVySGVpZ2h0KCkgLyAkYnJlYWRjcnVtYi5wYXJlbnQoKS5oZWlnaHQoKSkgKiAxMDA7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IGxlZnRQZXJjZW50ICsgKG9mZlBlcmNlbnRYIC8gMi4wKSxcbiAgICAgICAgICAgIHk6IHRvcFBlcmNlbnQgKyAob2ZmUGVyY2VudFkgLyAyLjApXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBSZXNldCgpe1xuICAgICAgICBcbiAgICAgICAgLy8gUmVtb3ZlIGFsbCBicmVhZGNydW1ic1xuICAgICAgICBmb3IobGV0ICRicmVhZGNydW1iIG9mIHRoaXMuJGJyZWFkY3J1bWJzKXtcbiAgICAgICAgICAgICRicmVhZGNydW1iLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuJGJyZWFkY3J1bWJzID0gW107XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBwb2x5IGlmIGl0IGFscmVhZHkgZXhpc3RzXG4gICAgICAgIC8vIGlmKHRoaXMuJHBvbHkgIT0gbnVsbCl7XG4gICAgICAgIC8vICAgICB0aGlzLiRwb2x5LnJlbW92ZSgpO1xuICAgICAgICAvLyB9XG4gICAgfVxuXG4gICAgUmVzZXRQb2x5Z29ucygpIHtcbiAgICAgICAgaWYgKHRoaXMuJHN0YXJ0UG9seSkge1xuICAgICAgICAgICAgdGhpcy4kc3RhcnRQb2x5LmNsaXBQYXRoKFtdLCB7XG4gICAgICAgICAgICAgICAgc3ZnRGVmSWQ6ICdhbm5vdGF0b3JQb2x5RWRpdG9yU3ZnU3RhcnQnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRwb2x5Z29ucyA9IFtdO1xuICAgIH1cblxuICAgIFJlc3RvcmUoKXtcbiAgICAgICAgdGhpcy5Jbml0UG9seSh0aGlzLm9yaWdpbmFsSlNPTik7XG4gICAgfVxuXG4gICAgSW5pdFBvbHkocG9pbnRzID0gbnVsbCl7XG4gICAgICAgIHRoaXMuUmVzZXQoKTtcblxuICAgICAgICAvLyBJZiBKU09OIHdhcyBzcGVjaWZpZWQsIGdlbmVyYXRlIGJyZWFkY3J1bWJzIGZyb20gaXQuXG4gICAgICAgIGlmKHBvaW50cyAhPSBudWxsKXtcbiAgICAgICAgICAgIC8vIFB1dCBkb3duIHRoZSBicmVhZGNydW1ic1xuICAgICAgICAgICAgZm9yKGxldCBwb2ludCBvZiBwb2ludHMpe1xuICAgICAgICAgICAgICAgIHRoaXMuQWRkQnJlYWRjcnVtYihwb2ludFswXSwgcG9pbnRbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5VcGRhdGVQb2x5Q2xpcHBpbmcoKTtcblxuICAgICAgICB0aGlzLm9yaWdpbmFsSlNPTiA9IHBvaW50cztcbiAgICB9XG5cbiAgICBBZGRTdGFydFBvbHlnb24oKSB7XG4gICAgICAgIGlmICh0aGlzLiRwb2x5Z29ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsZXQgc3RhcnRQb2x5Z29uID0gdGhpcy4kcG9seWdvbnNbMF07IC8vLm1hcChpdGVtID0+IHsgcmV0dXJuIGAke2l0ZW1bMF19LCR7aXRlbVsxXX1gIH0pLmpvaW4oXCIgXCIpOztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBwb2x5IG9iamVjdFxuICAgICAgICAgICAgdGhpcy4kc3RhcnRQb2x5ID0gJChcIjxkaXYgY2xhc3M9J3dhbGRvcmYtc3RhcnQtcG9seSc+PC9kaXY+XCIpLmFwcGVuZFRvKHRoaXMuJGNsaWNrU3VyZmFjZSk7XG4gICAgICAgICAgICB0aGlzLiRzdGFydFBvbHkuY3NzKFwiei1pbmRleFwiLCB0aGlzLmJhc2VaICsgMTAwMCk7XG5cbiAgICAgICAgICAgIGlmKHN0YXJ0UG9seWdvbi5sZW5ndGggPCAzKXtcbiAgICAgICAgICAgICAgICB0aGlzLiRzdGFydFBvbHkuY2xpcFBhdGgoW10sIHtcbiAgICAgICAgICAgICAgICAgICAgc3ZnRGVmSWQ6ICdhbm5vdGF0b3JQb2x5RWRpdG9yU3ZnU3RhcnQnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLiRzdGFydFBvbHkuY2xpcFBhdGgoc3RhcnRQb2x5Z29uLCB7XG4gICAgICAgICAgICAgICAgaXNQZXJjZW50YWdlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHN2Z0RlZklkOiAnYW5ub3RhdG9yU3RhcnRQb2x5U3ZnJ1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHN0YXJ0UG9seWdvbi5tYXAoKHBvaW50KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5BZGRCcmVhZGNydW1iKHBvaW50WzBdLCBwb2ludFsxXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIFVwZGF0ZVBvbHlDbGlwcGluZygpe1xuICAgICAgICBcbiAgICAgICAgaWYodGhpcy4kYnJlYWRjcnVtYnMubGVuZ3RoIDwgMyl7XG4gICAgICAgICAgICB0aGlzLiRwb2x5LmNsaXBQYXRoKFtdLCB7XG4gICAgICAgICAgICAgICAgc3ZnRGVmSWQ6ICdhbm5vdGF0b3JQb2x5RWRpdG9yU3ZnJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcG9pbnRzID0gdGhpcy4kYnJlYWRjcnVtYnMubWFwKCgkY3J1bWIpID0+IHtcbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLkdldENlbnRlclBlcmNlbnRhZ2UoJGNydW1iKTtcbiAgICAgICAgICAgIHJldHVybiBbcG9zLngsIHBvcy55XTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy4kcG9seS5jbGlwUGF0aChwb2ludHMsIHtcbiAgICAgICAgICAgIGlzUGVyY2VudGFnZTogdHJ1ZSxcbiAgICAgICAgICAgIHN2Z0RlZklkOiAnYW5ub3RhdG9yUG9seUVkaXRvclN2ZydcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICBVcGRhdGVCcmVhZGNydW1iQ29sb3JpbmcoKXtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMuJGJyZWFkY3J1bWJzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCAkY3J1bWIgPSB0aGlzLiRicmVhZGNydW1ic1tpXTtcbiAgICAgICAgICAgIC8vIFJlY29sb3IgZWFjaCBicmVhZGNydW1iXG4gICAgICAgICAgICBsZXQgY29sb3IgPSBcIiMwMDAwMDBcIjtcblxuICAgICAgICAgICAgaWYgKGkgPT0gdGhpcy4kYnJlYWRjcnVtYnMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIGNvbG9yID0gXCIjRkYwMDAwXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpID09IDApe1xuICAgICAgICAgICAgICAgIGNvbG9yID0gXCIjMDBGRjAwXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLiRicmVhZGNydW1ic1tpXS5jc3MoXCJib3JkZXItY29sb3JcIiwgY29sb3IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBhbiBhcnJheSBvZiBwZXJjZW50YWdlcyByZXByZXNlbnRpbmcgdGhlIHggYW5kIHkgcGVyY2VudGFnZXMgb2YgZWFjaFxuICAgICAqIHBvaW50IGluIHRoZSBwb2x5Z29uLlxuICAgICAqL1xuICAgIEdldEpTT04oKXtcbiAgICAgICAgLy8gRXh0cmFjdCB0aGUgY29vcmRpbmF0ZXMgZnJvbSB0aGUgY3J1bWJzIGFuZCBwdXQgdGhlbSBpbiB0aGUgYXJyYXlcbiAgICAgICAgbGV0IHBvaW50cyA9IFtdO1xuICAgICAgICBmb3IobGV0IGNydW1iIG9mIHRoaXMuJGJyZWFkY3J1bWJzKXtcbiAgICAgICAgICAgIGxldCBwb2ludCA9IHRoaXMuR2V0Q2VudGVyUGVyY2VudGFnZShjcnVtYik7XG4gICAgICAgICAgICBwb2ludHMucHVzaChbcG9pbnQueC50b1N0cmluZygpLCBwb2ludC55LnRvU3RyaW5nKCldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwb2ludHMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgYW4gYXJyYXkgb2YgcGVyY2VudGFnZXMgcmVwcmVzZW50aW5nIHRoZSB4IGFuZCB5IHBlcmNlbnRhZ2VzIG9mIGVhY2hcbiAgICAgKiBwb2ludCBpbiB0aGUgcG9seWdvbi5cbiAgICAgKi9cbiAgICBHZXRQb2ludHMoKSB7XG4gICAgICAgIGxldCBwb2ludHMgPSBbXTtcbiAgICAgICAgZm9yKGxldCBjcnVtYiBvZiB0aGlzLiRicmVhZGNydW1icyl7XG4gICAgICAgICAgICBsZXQgcG9pbnQgPSB0aGlzLkdldENlbnRlclBlcmNlbnRhZ2UoY3J1bWIpO1xuICAgICAgICAgICAgcG9pbnRzLnB1c2goW3BvaW50LngsIHBvaW50LnldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9pbnRzO1xuICAgIH1cblxuICAgIEJlZ2luRWRpdGluZygpe1xuICAgICAgICB0aGlzLiRjbGlja1N1cmZhY2UubWFrZVZpc2libGUodHJ1ZSk7XG4gICAgICAgIHRoaXMuJGVkaXREaWFsb2cubWFrZVZpc2libGUodHJ1ZSk7XG4gICAgICAgIHRoaXMuJHBvbHkubWFrZVZpc2libGUodHJ1ZSk7XG4gICAgICAgIC8vLTMvL3RoaXMuJGJhci5tYWtlVmlzaWJsZSh0cnVlKTtcbiAgICAgICAgLy90aGlzLkFkZFN0YXJ0UG9seWdvbigpO1xuICAgICAgICB0aGlzLlVwZGF0ZVBvbHlDbGlwcGluZygpO1xuICAgIH1cblxuICAgIERvbmUoKXtcbiAgICAgICAgdGhpcy4kY2xpY2tTdXJmYWNlLm1ha2VWaXNpYmxlKGZhbHNlKTtcbiAgICAgICAgdGhpcy4kZWRpdERpYWxvZy5tYWtlVmlzaWJsZShmYWxzZSk7XG4gICAgICAgIHRoaXMuJHBvbHkubWFrZVZpc2libGUoZmFsc2UpO1xuICAgICAgICAvLy0zLy90aGlzLiRiYXIubWFrZVZpc2libGUoZmFsc2UpO1xuICAgIH1cblxuICAgIFJlc2l6ZU92ZXJsYXkoKXtcbiAgICAgICAgLy8gUmVzaXplIHZpZGVvIG92ZXJsYXkgdG8gZml0IGFjdHVhbCB2aWRlbyBkaW1lbnNpb25zXG4gICAgICAgIGxldCB2aWRlb0RpbXMgPSB0aGlzLmFubm90YXRvci5wbGF5ZXIuR2V0VmlkZW9EaW1lbnNpb25zKCk7XG4gICAgICAgIHRoaXMuJGNsaWNrU3VyZmFjZS5jc3MoJ3dpZHRoJywgdmlkZW9EaW1zLndpZHRoKTtcbiAgICAgICAgdGhpcy4kY2xpY2tTdXJmYWNlLmNzcygnaGVpZ2h0JywgdmlkZW9EaW1zLmhlaWdodCk7XG5cbiAgICAgICAgbGV0IGhlaWdodERpZmYgPSAodGhpcy5hbm5vdGF0b3IucGxheWVyLiR2aWRlby5oZWlnaHQoKSAtIHZpZGVvRGltcy5oZWlnaHQpIC8gMjtcbiAgICAgICAgdGhpcy4kY2xpY2tTdXJmYWNlLmNzcygndG9wJywgaGVpZ2h0RGlmZik7XG5cbiAgICAgICAgbGV0IHdpZHRoRGlmZiA9ICh0aGlzLmFubm90YXRvci5wbGF5ZXIuJHZpZGVvLndpZHRoKCkgLSB2aWRlb0RpbXMud2lkdGgpIC8gMjtcbiAgICAgICAgdGhpcy4kY2xpY2tTdXJmYWNlLmNzcygnbGVmdCcsIHdpZHRoRGlmZik7XG5cbiAgICAgICAgdGhpcy4kcG9seS53aWR0aCh2aWRlb0RpbXMud2lkdGgpO1xuICAgICAgICB0aGlzLiRwb2x5LmhlaWdodCh2aWRlb0RpbXMuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy4kcG9seS5jc3MoXCJ0b3BcIiwgaGVpZ2h0RGlmZik7XG4gICAgICAgIHRoaXMuJHBvbHkuY3NzKFwibGVmdFwiLCB3aWR0aERpZmYpO1xuICAgIH1cblxuICAgIFJlZ2lzdGVyRWxlbWVudCgkZWxlbWVudCwgJGNvbnRhaW5lciwgb3JkZXIsIGp1c3RpZmljYXRpb24gPSAnZmxleC1zdGFydCcpe1xuICAgICAgICAkZWxlbWVudC5jc3MoJ29yZGVyJywgb3JkZXIpO1xuICAgICAgICAkZWxlbWVudC5jc3MoJ2FsaWduLXNlbGYnLCBqdXN0aWZpY2F0aW9uKTtcbiAgICAgICAgLy8gU2V0cyBncm93IFtzaHJpbmtdIFtiYXNpc11cbiAgICAgICAgLy8kZWxlbWVudC5jc3MoJ2ZsZXgnLCAnMCAwIGF1dG8nKTtcbiAgICAgICAgJGNvbnRhaW5lci5hcHBlbmQoJGVsZW1lbnQpO1xuICAgIH1cblxuICAgIFNob3dKdXN0UG9seWdvbigpe1xuICAgICAgICB0aGlzLiRwb2x5Lm1ha2VWaXNpYmxlKHRydWUpO1xuICAgIH1cblxuICAgIEFkZFBvbHlnb25TZXQoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuJHBvbHlnb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHRoaXMuJHBvbHlnb25zID0gW107XG4gICAgICAgICAgICB0aGlzLiR0ZW1wQnJlYWRDcnVtYnMgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy4kcG9seWdvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLiRwb2x5Z29uc1swXSA9IHRoaXMuR2V0UG9pbnRzKCk7XG4gICAgICAgICAgICB0aGlzLiR0ZW1wQnJlYWRDcnVtYnNbMF0gPSBbdGhpcy4kYnJlYWRjcnVtYnNdO1xuICAgICAgICAgICAgdmFyIG1zZyA9IFwiU3VjY2Vzc2Z1bGx5IGNhcHR1cmVkIGZpcnN0IHBvbHlnb24uXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRwb2x5Z29uc1sxXSA9IHRoaXMuR2V0UG9pbnRzKCk7XG4gICAgICAgICAgICB0aGlzLiR0ZW1wQnJlYWRDcnVtYnNbMV0gPSBbdGhpcy4kYnJlYWRjcnVtYnNdO1xuICAgICAgICAgICAgdmFyIG1zZyA9IFwiU3VjY2Vzc2Z1bGx5IGNhcHR1cmVkIHNlY29uZCBwb2x5Z29uLlwiO1xuICAgICAgICB9IFxuICAgICAgICB0aGlzLmFubm90YXRvci5tZXNzYWdlT3ZlcmxheS5TaG93TWVzc2FnZShtc2cpO1xuXG4gICAgfVxuXG59XG5cbmV4cG9ydCB7IFBvbHlnb25FZGl0b3IgfTsiLCJjbGFzcyBQb2x5Z29uT3ZlcmxheSB7XG4gICAgY29uc3RydWN0b3IoYW5ub3RhdG9yKXtcbiAgICAgICAgdGhpcy5hbm5vdGF0b3IgPSBhbm5vdGF0b3I7XG4gICAgICAgIHRoaXMucG9seUVsZW1lbnRzID0gW107XG4gICAgICAgIHRoaXMuc3ZnRWxlbWVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5hbmltYXRlRWxlbWVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5iYXNlWiA9IDIxNDc0ODM2NDk7XG4gICAgICAgIHRoaXMubGFzdEFubm90YXRpb25zID0gW107XG4gICAgICAgIHRoaXMuc3ZnRWxlbWVudHNIYXNoID0ge307XG5cbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgdmlkZW8gb3ZlcmxheVxuICAgICAgICB0aGlzLiR2aWRlb092ZXJsYXkgPSAkKFwiPGRpdiBjbGFzcz0nd2FsZG9yZi12aWRlby1vdmVybGF5Jz48L2Rpdj5cIikuYXBwZW5kVG8odGhpcy5hbm5vdGF0b3IucGxheWVyLiRjb250YWluZXIpO1xuICAgICAgICB0aGlzLlJlc2l6ZU92ZXJsYXkoKTtcbiAgICAgICAgdGhpcy5hbm5vdGF0b3IucGxheWVyLiRjb250YWluZXIub24oXCJPbkZ1bGxzY3JlZW5DaGFuZ2VcIiwgKGV2ZW50LCBzZXRGdWxsc2NyZWVuKSA9PiB0aGlzLlJlc2l6ZU92ZXJsYXkoKSk7XG5cbiAgICAgICAgdGhpcy5hbm5vdGF0b3IuJGNvbnRhaW5lci5vbihcIk9uTmV3QW5ub3RhdGlvblNldFwiLCAoZXZlbnQsIGFubm90YXRpb25zKSA9PiB0aGlzLlVwZGF0ZShhbm5vdGF0aW9ucykpO1xuICAgICAgICB0aGlzLnZpZGVvRGltcyA9IHRoaXMuYW5ub3RhdG9yLnBsYXllci5HZXRWaWRlb0RpbWVuc2lvbnMoKTtcblxuICAgICAgICAkKHdpbmRvdykucmVzaXplKCgpID0+IHRoaXMuUmVzaXplT3ZlcmxheSgpKTtcbiAgICB9XG5cbiAgICBVcGRhdGUoYW5ub3RhdGlvbnMpe1xuICAgICAgICB0aGlzLkNsZWFyKCk7XG5cbiAgICAgICAgLy8gbGV0IHByZXZTZXQgPSBuZXcgU2V0KHRoaXMubGFzdEFubm90YXRpb25zKTtcbiAgICAgICAgLy8gbGV0IG5ld1NldCA9IG5ldyBTZXQoYW5ub3RhdGlvbnMpO1xuXG4gICAgICAgIC8vIC8vIGluIG5ld1NldCBhbmQgbm90IGluIHByZXZTZXRcbiAgICAgICAgLy8gbGV0IHRvQWRkID0gbmV3IFNldChcbiAgICAgICAgLy8gICAgIFsuLi5uZXdTZXRdLmZpbHRlcih4ID0+ICFwcmV2U2V0Lmhhcyh4KSkpO1xuXG4gICAgICAgIC8vIC8vIGluIHByZXZBbm5vdGF0aW9ucyBhbmQgbm90IGluIGFubm90YXRpb25zXG4gICAgICAgIC8vIGxldCB0b0Rlc3Ryb3kgPSBuZXcgU2V0KFxuICAgICAgICAvLyAgICAgWy4uLnByZXZTZXRdLmZpbHRlcih4ID0+ICFuZXdTZXQuaGFzKHgpKSk7XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coQXJyYXkuZnJvbSh0b0FkZCkpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhBcnJheS5mcm9tKHRvRGVzdHJveSkpO1xuICAgICAgICBcbiAgICAgICAgLy9Tb3J0IHBvbHlnb24gb3JkZXIgYnkgc2l6ZSAoYXNjZW5kaW5nKVxuICAgICAgICAvLyBwb2x5Z29ucy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgLy8gICAgIHJldHVybiB0aGlzLkdldEFyZWEoYSkgPiB0aGlzLkdldEFyZWEoYik7XG4gICAgICAgIC8vIH0pXG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbm5vdGF0aW9ucy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICBsZXQgYW5ub3RhdGlvblBvbHlQb2ludHMgPSBhbm5vdGF0aW9uc1tpXS5nZXRQb2x5KCk7XG4gICAgICAgICAgICBpZiAoYW5ub3RhdGlvblBvbHlQb2ludHMgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIElnbm9yZSB0aGlzIGFubm90YXRpb24gaWYgaXQgaGFzIG5vIHBvbHlnb25cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHN2Z1BvbHlQb2ludHMgPSBhbm5vdGF0aW9uc1tpXS5nZXRTVkdQb2x5UG9pbnRzKCk7XG4gICAgICAgIFxuICAgICAgICAgICAgbGV0IGR1cmF0aW9uID0gYW5ub3RhdGlvbnNbaV0uZW5kVGltZSAtIGFubm90YXRpb25zW2ldLmJlZ2luVGltZTtcblxuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBwb2x5IG9iamVjdFxuICAgICAgICAgICAgbGV0ICRzdmc7XG4gICAgICAgICAgICBpZiAodGhpcy5zdmdFbGVtZW50cy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgICRzdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInN2Z1wiKTtcbiAgICAgICAgICAgICAgICAkc3ZnLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCAnMTAwJScpO1xuICAgICAgICAgICAgICAgICRzdmcuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCAnMTAwJScpO1xuICAgICAgICAgICAgICAgICRzdmcuc2V0QXR0cmlidXRlKCd2aWV3Qm94JywgJzAgMCAxMDAgMTAwJyk7XG4gICAgICAgICAgICAgICAgJHN2Zy5zZXRBdHRyaWJ1dGUoJ3ByZXNlcnZlQXNwZWN0UmF0aW8nLCAnbm9uZScpO1xuXG4gICAgICAgICAgICAgICAgLy8kc3ZnLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLkNsaWNrRXZlbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMuJHZpZGVvT3ZlcmxheS5hcHBlbmQoJHN2Zyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zdmdFbGVtZW50cy5wdXNoKCRzdmcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc3ZnID0gdGhpcy5zdmdFbGVtZW50c1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuXG4gICAgICAgICAgICBsZXQgJHBvbHlnb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgJ3BvbHlnb24nKTtcbiAgICAgICAgICAgICRwb2x5Z29uLnNldEF0dHJpYnV0ZSgncG9pbnRzJywgc3ZnUG9seVBvaW50c1swXSk7XG4gICAgICAgICAgICAkcG9seWdvbi5zZXRBdHRyaWJ1dGUoJ2ZpbGwnLCAncmdiYSgwLCAxMTgsIDI1NSwgMC41NSknKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJHN2Zy5hcHBlbmRDaGlsZCgkcG9seWdvbik7XG5cbiAgICAgICAgICAgIGxldCAkYW5pbWF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCAnYW5pbWF0ZScpO1xuICAgICAgICAgICAgJGFuaW1hdGUuc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGVOYW1lJywgJ3BvaW50cycpO1xuICAgICAgICAgICAgJGFuaW1hdGUuc2V0QXR0cmlidXRlKCdmaWxsJywgJ2ZyZWV6ZScpO1xuICAgICAgICAgICAgJGFuaW1hdGUuc2V0QXR0cmlidXRlKCdmcm9tJywgc3ZnUG9seVBvaW50c1swXSk7XG4gICAgICAgICAgICAkYW5pbWF0ZS5zZXRBdHRyaWJ1dGUoJ3RvJywgc3ZnUG9seVBvaW50c1sxXSk7XG4gICAgICAgICAgICAkYW5pbWF0ZS5zZXRBdHRyaWJ1dGUoJ2JlZ2luJywgJ2luZGVmaW5pdGUnKTtcbiAgICAgICAgICAgICRhbmltYXRlLnNldEF0dHJpYnV0ZSgnZHVyJywgZHVyYXRpb24gKyBcInNcIik7XG4gICAgICAgICAgICAkcG9seWdvbi5hcHBlbmRDaGlsZCgkYW5pbWF0ZSk7XG5cbiAgICAgICAgICAgIGxldCAkc3ZnSGFzaCA9IHtcbiAgICAgICAgICAgICAgICBzdmdFbGVtZW50OiAkc3ZnLFxuICAgICAgICAgICAgICAgIHBvbHlnb246ICRwb2x5Z29uLFxuICAgICAgICAgICAgICAgIGFuaW1hdGU6ICRhbmltYXRlLFxuICAgICAgICAgICAgICAgIGJlZ2luVGltZTogYW5ub3RhdGlvbnNbaV0uYmVnaW5UaW1lXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLnN2Z0VsZW1lbnRzSGFzaFthbm5vdGF0aW9uc1tpXS5pZF0gPSAkc3ZnSGFzaDtcblxuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBwb2x5IG9iamVjdFxuICAgICAgICAgICAgLy8gbGV0ICRwb2x5ID0gJChcIjxkaXYgY2xhc3M9J3dhbGRvcmYtb3ZlcmxheS1wb2x5Jz48L2Rpdj5cIikuYXBwZW5kVG8odGhpcy4kdmlkZW9PdmVybGF5KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gJHBvbHkuY2xpcFBhdGgoYW5ub3RhdGlvblBvbHlQb2ludHMsIHtcbiAgICAgICAgICAgIC8vICAgICBpc1BlcmNlbnRhZ2U6IHRydWUsXG4gICAgICAgICAgICAvLyAgICAgc3ZnRGVmSWQ6ICdhbm5vdGF0b3JQb2x5U3ZnJ1xuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICAvLyAkcG9seS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICAvLyAgICAgdGhpcy5hbm5vdGF0b3IuJGNvbnRhaW5lci50cmlnZ2VyKFwiT25Qb2x5Q2xpY2tlZFwiLCBhbm5vdGF0aW9uc1tpXSk7XG4gICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIC8vIHRoaXMuQWRkVG9vbHRpcCgkcG9seSwgYW5ub3RhdGlvbnNbaV0pO1xuICAgICAgICAgICAgLy8gdGhpcy5wb2x5RWxlbWVudHMucHVzaCgkcG9seSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucG9seUVsZW1lbnRzLnB1c2goJHBvbHlnb24pO1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlRWxlbWVudHMucHVzaCgkYW5pbWF0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL3RoaXMubGFzdEFubm90YXRpb25zID0gYW5ub3RhdGlvbnM7XG4gICAgfVxuXG4gICAgQ2xpY2tFdmVudChldmVudCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImFuaW1hdGUgaXMgY2xpY2tlZFwiKTtcbiAgICB9XG5cbiAgICBBZGRUb29sdGlwKCRwb2x5LCBhbm5vdGF0aW9uKXtcbiAgICAgICAgJC5mbi5xdGlwLnppbmRleCA9IHRoaXMuYmFzZVorIDE7XG4gICAgICAgICRwb2x5LnF0aXAoe1xuICAgICAgICAgICAgY29udGVudDoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBhbm5vdGF0aW9uLmlkLFxuICAgICAgICAgICAgICAgIHRleHQ6IGFubm90YXRpb24uYm9keS5maWx0ZXIoaXRlbSA9PiBpdGVtLnB1cnBvc2UgPT09IFwiZGVzY3JpYmluZ1wiKVswXS52YWx1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgbXk6ICdib3R0b20gcmlnaHQnLFxuICAgICAgICAgICAgICAgIGF0OiAndG9wIGxlZnQnLFxuICAgICAgICAgICAgICAgIHRhcmdldDogJ21vdXNlJywgLy8gRm9sbG93IHRoZSBtb3VzZVxuICAgICAgICAgICAgICAgIGFkanVzdDoge1xuICAgICAgICAgICAgICAgICAgICBtb3VzZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcInNoaWZ0IHNoaWZ0XCIgLy8gaG9yaXpvbnRhbCwgdmVydGljYWxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHZpZXdwb3J0OiB0aGlzLmFubm90YXRvci5wbGF5ZXIuJGNvbnRhaW5lclxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhpZGU6IHtcbiAgICAgICAgICAgICAgICBkZWxheTogMCAvLyBObyBoaWRlIGRlbGF5IGJ5IGRlZmF1bHRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgIGNsYXNzZXM6ICdxdGlwLWRhcmsgcXRpcC1yb3VuZGVkIGFubm90YXRvci1xdGlwJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBDbGVhcigpe1xuICAgICAgICAvLyBDbGVhciBhbGwgIGFuaW1hdGUgZWxlbWVudCBmcm9tIHRoZSBET01cbiAgICAgICAgZm9yKGxldCBhaSA9IDA7IGFpIDwgdGhpcy5hbmltYXRlRWxlbWVudHMubGVuZ3RoOyBhaSsrKXtcbiAgICAgICAgICAgIC8vdGhpcy5wb2x5RWxlbWVudHNbaV0uZGF0YShcInF0aXBcIikuZGVzdHJveSh0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZUVsZW1lbnRzW2FpXS5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENsZWFyIGFsbCBwb2x5Z29ucyBcbiAgICAgICAgZm9yKGxldCBwaSA9IDA7IHBpIDwgdGhpcy5wb2x5RWxlbWVudHMubGVuZ3RoOyBwaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnBvbHlFbGVtZW50c1twaV0ucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIENsZWFyIGFsbCAgc3ZnIGVsZW1lbnRzIGZyb20gdGhlIERPTVxuICAgICAgICBmb3IobGV0IHNpID0gMDsgc2kgPCB0aGlzLnN2Z0VsZW1lbnRzLmxlbmd0aDsgc2krKyl7XG4gICAgICAgICAgICB0aGlzLnN2Z0VsZW1lbnRzW3NpXS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gTWFyayB0aGUgYXJyYXkgYXMgZW1wdHlcbiAgICAgICAgdGhpcy5hbmltYXRlRWxlbWVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5wb2x5RWxlbWVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5zdmdFbGVtZW50cyA9IFtdO1xuICAgICAgICB0aGlzLnN2Z0VsZW1lbnRzSGFzaCA9IHt9O1xuXG4gICAgfVxuXG4gICAgUmVzaXplT3ZlcmxheSgpe1xuICAgICAgICAvLyBSZXNpemUgdmlkZW8gb3ZlcmxheSB0byBmaXQgYWN0dWFsIHZpZGVvIGRpbWVuc2lvbnNcbiAgICAgICAgbGV0IHZpZGVvRGltcyA9IHRoaXMuYW5ub3RhdG9yLnBsYXllci5HZXRWaWRlb0RpbWVuc2lvbnMoKTtcbiAgICAgICAgdGhpcy4kdmlkZW9PdmVybGF5LmNzcygnd2lkdGgnLCB2aWRlb0RpbXMud2lkdGgpO1xuICAgICAgICB0aGlzLiR2aWRlb092ZXJsYXkuY3NzKCdoZWlnaHQnLCB2aWRlb0RpbXMuaGVpZ2h0KTtcblxuICAgICAgICBsZXQgaGVpZ2h0RGlmZiA9ICh0aGlzLmFubm90YXRvci5wbGF5ZXIuJHZpZGVvLmhlaWdodCgpIC0gdmlkZW9EaW1zLmhlaWdodCkgLyAyO1xuICAgICAgICB0aGlzLiR2aWRlb092ZXJsYXkuY3NzKCd0b3AnLCBoZWlnaHREaWZmKTtcblxuICAgICAgICBsZXQgd2lkdGhEaWZmID0gKHRoaXMuYW5ub3RhdG9yLnBsYXllci4kdmlkZW8ud2lkdGgoKSAtIHZpZGVvRGltcy53aWR0aCkgLyAyO1xuICAgICAgICB0aGlzLiR2aWRlb092ZXJsYXkuY3NzKCdsZWZ0Jywgd2lkdGhEaWZmKTtcbiAgICB9XG5cbiAgICBnZXRQbGF5ZXJTaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hbm5vdGF0b3IucGxheWVyLkdldFZpZGVvRGltZW5zaW9ucygpO1xuICAgIH1cblxufVxuXG5leHBvcnQgeyBQb2x5Z29uT3ZlcmxheSB9OyIsIlxuY2xhc3MgVGlja0JhciB7XG4gICAgY29uc3RydWN0b3IoYW5ub3RhdG9yKXtcbiAgICAgICAgdGhpcy5hbm5vdGF0b3IgPSBhbm5vdGF0b3I7XG5cbiAgICAgICAgdGhpcy50aWNrcyA9IFtdO1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZWxlbWVudFxuICAgICAgICB0aGlzLiR0aWNrQmFyID0gJChcIjxkaXYgY2xhc3M9J3dhbGRvcmYtdGlja2Jhcic+PC9kaXY+XCIpO1xuICAgICAgICB0aGlzLmFubm90YXRvci5wbGF5ZXIuY29udHJvbEJhci4kY29udGFpbmVyLmFwcGVuZCh0aGlzLiR0aWNrQmFyKTtcblxuICAgICAgICAvLyBBdHRhY2ggZXZlbnQgaGFuZGxlcnNcbiAgICAgICAgdGhpcy5hbm5vdGF0b3IuJGNvbnRhaW5lci5vbihcIk9uQW5ub3RhdGlvbnNMb2FkZWRcIiwgXG4gICAgICAgICAgICAoZXZlbnQsIGFubm90YXRpb25NYW5hZ2VyKSA9PiB0aGlzLkxvYWRBbm5vdGF0aW9ucyhhbm5vdGF0aW9uTWFuYWdlcikpO1xuXG4gICAgICAgIHRoaXMuYW5ub3RhdG9yLiRjb250YWluZXIub24oXCJPbkFubm90YXRpb25SZWdpc3RlcmVkXCIsXG4gICAgICAgICAgICAoZXZlbnQsIGFubm90YXRpb24pID0+IHRoaXMuTG9hZEFubm90YXRpb24oYW5ub3RhdGlvbikpO1xuXG4gICAgICAgIHRoaXMuYW5ub3RhdG9yLiRjb250YWluZXIub24oXCJPbkFubm90YXRpb25SZW1vdmVkXCIsXG4gICAgICAgICAgICAoZXZlbnQsIGlkKSA9PiB0aGlzLlJlbW92ZUFubm90YXRpb24oaWQpKTtcbiAgICAgICAgICAgIFxuICAgIH1cblxuICAgIExvYWRBbm5vdGF0aW9ucyhhbm5vdGF0aW9uTWFuYWdlcil7XG4gICAgICAgIHRoaXMuQ2xlYXIoKTtcblxuICAgICAgICBmb3IobGV0IGFubm90YXRpb24gb2YgYW5ub3RhdGlvbk1hbmFnZXIuYW5ub3RhdGlvbnMpe1xuICAgICAgICAgICAgdGhpcy5Mb2FkQW5ub3RhdGlvbihhbm5vdGF0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIExvYWRBbm5vdGF0aW9uKGFubm90YXRpb24pe1xuICAgICAgICBsZXQgJHRpY2sgPSAkKFwiPGRpdiBjbGFzcz0nd2FsZG9yZi10aWNrYmFyLXRpY2snPjwvZGl2PlwiKS5hcHBlbmRUbyh0aGlzLiR0aWNrQmFyKTtcblxuICAgICAgICAvLyBBZGQgdGhlIElEIG9mIHRoZSBhbm5vdGF0aW9uIHRvIGl0cyBjb3JyZXNwb25kaW5nIHRpY2sgc28gd2UgY2FuIHJlZmVyZW5jZSBpdCBsYXRlclxuICAgICAgICBpZiAoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mKGFubm90YXRpb24uaXRlbXMpKSB7IC8vIFZlciAxXG4gICAgICAgICAgICAkdGljay5kYXRhKFwiYW5ub3RhdGlvbi1pZFwiLCBhbm5vdGF0aW9uLmlkKTtcbiAgICAgICAgfSBlbHNlIHsgLy8gVmVyIDJcbiAgICAgICAgICAgICR0aWNrLmRhdGEoXCJhbm5vdGF0aW9uLWlkXCIsIGFubm90YXRpb24uaXRlbXNbMF0uaXRlbXNbMF0uaXRlbXNbMF0uaWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGJlZ2luVGltZSA9IGFubm90YXRpb24uYmVnaW5UaW1lO1xuICAgICAgICBsZXQgYmVnaW5QZXJjZW50ID0gYmVnaW5UaW1lIC8gdGhpcy5hbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC5kdXJhdGlvbjtcbiAgICAgICAgJHRpY2suY3NzKCdsZWZ0JywgKGJlZ2luUGVyY2VudCAqIDEwMCkudG9TdHJpbmcoKSArIFwiJVwiKTtcblxuICAgICAgICBsZXQgZW5kVGltZSA9IGFubm90YXRpb24uZW5kVGltZTtcbiAgICAgICAgbGV0IGVuZFBlcmNlbnQgPSBlbmRUaW1lIC8gdGhpcy5hbm5vdGF0b3IucGxheWVyLnZpZGVvRWxlbWVudC5kdXJhdGlvbjtcbiAgICAgICAgJHRpY2suY3NzKCd3aWR0aCcsICgoZW5kUGVyY2VudCAtIGJlZ2luUGVyY2VudCkgKiAxMDApLnRvU3RyaW5nKCkgKyBcIiVcIik7XG5cbiAgICAgICAgdGhpcy50aWNrcy5wdXNoKCR0aWNrKTtcbiAgICB9XG5cbiAgICBSZW1vdmVBbm5vdGF0aW9uKGlkKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIlJlbW92aW5nIHRpY2sgXCIgKyBpZCk7XG4gICAgICAgIC8vIFJlbW92ZSB0aGUgb2JqZWN0IGZyb20gdGhlIGRvY3VtZW50LCBhbmQgdGhlIGFycmF5XG4gICAgICAgIGxldCBuZXdUaWNrcyA9IFtdO1xuICAgICAgICBmb3IobGV0ICR0aWNrIG9mIHRoaXMudGlja3Mpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1RpY2s6ICcgKyAkdGljay5kYXRhKFwiYW5ub3RhdGlvbi1pZFwiKSk7XG4gICAgICAgICAgICBpZigkdGljay5kYXRhKFwiYW5ub3RhdGlvbi1pZFwiKSA9PSBpZCl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFJlbW92ZWQgdGljayAke2lkfWApO1xuICAgICAgICAgICAgICAgICR0aWNrLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdUaWNrcy5wdXNoKCR0aWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRpY2tzID0gbmV3VGlja3M7XG4gICAgfVxuXG4gICAgQ2xlYXIoKXtcbiAgICAgICAgZm9yKGxldCAkdGljayBvZiB0aGlzLnRpY2tzKXtcbiAgICAgICAgICAgICR0aWNrLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50aWNrcyA9IFtdO1xuICAgIH1cblxufVxuXG5cbmV4cG9ydCB7IFRpY2tCYXIgfTsiLCJsZXQgc2hhMSA9IHJlcXVpcmUoJ3NoYTEnKTtcblxuY2xhc3MgU2VydmVySW50ZXJmYWNlIHtcbiAgICBjb25zdHJ1Y3Rvcihhbm5vdGF0b3Ipe1xuICAgICAgICB0aGlzLmFubm90YXRvciA9IGFubm90YXRvcjtcbiAgICAgICAgLy9sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnd2FsZG9yZl9hdXRoX3Rva2VuJyk7XG4gICAgfVxuXG4gICAgU2V0QmFzZVVSTCh1cmwpe1xuICAgICAgICB0aGlzLmJhc2VVUkwgPSB1cmw7XG4gICAgfVxuXG4gICAgbWFrZV9iYXNlX2F1dGgodXNlciwgcGFzc3dvcmQpIHtcbiAgICAgICAgdmFyIHRvayA9IHVzZXIgKyAnOicgKyBwYXNzd29yZDtcbiAgICAgICAgdmFyIGhhc2ggPSBidG9hKHRvayk7XG4gICAgICAgIHJldHVybiAnQmFzaWMgJyArIGhhc2g7XG4gICAgfVxuXG4gICAgbWFrZV93cml0ZV9hdXRoKHRleHQpe1xuICAgICAgICBpZih0aGlzLmFubm90YXRvci5hcGlLZXkpe1xuICAgICAgICAgICAgcmV0dXJuICdBcGlLZXkgJyArIHRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJ1Rva2VuICcgKyB0ZXh0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgTG9nZ2VkSW4oKXtcbiAgICAgICAgaWYodGhpcy5hbm5vdGF0b3IuYXBpS2V5KXtcbiAgICAgICAgICAgIC8vIFJldHVybiB0cnVlIGlmIGFuIGVtYWlsIGhhcyBiZWVuIGVudGVyZWRcbiAgICAgICAgICAgIGxldCB1c2VyX2VtYWlsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dhbGRvcmZfdXNlcl9lbWFpbCcpO1xuICAgICAgICAgICAgcmV0dXJuIHVzZXJfZW1haWwgIT09IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBSZXR1cm4gdHJ1ZSBpZiBhIHRva2VuIGhhcyBiZWVuIHJlZ2lzdGVyZWRcbiAgICAgICAgICAgIGxldCBhdXRoX3Rva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dhbGRvcmZfYXV0aF90b2tlbicpO1xuICAgICAgICAgICAgcmV0dXJuIGF1dGhfdG9rZW4gIT09IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBMb2dJbih1c2VybmFtZSwgcGFzc3dvcmQpe1xuICAgICAgICAvLyBJZiBBUEkga2V5IGlzIHVzZWQsIGp1c3Qgc3RvcmUgdGhlIGVtYWlsIGFkZHJlc3NcbiAgICAgICAgaWYodGhpcy5hbm5vdGF0b3IuYXBpS2V5KXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW1NlcnZlciBJbnRlcmZhY2VdIFN1Y2Nlc3NmdWxseSBsb2dnZWQgaW4uXCIpO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3dhbGRvcmZfdXNlcl9lbWFpbCcsIHBhc3N3b3JkKTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd3YWxkb3JmX3VzZXJfbmFtZScsIHVzZXJuYW1lKTtcbiAgICAgICAgICAgIHRoaXMuYW5ub3RhdG9yLm1lc3NhZ2VPdmVybGF5LlNob3dNZXNzYWdlKFwiTG9nZ2VkIGluIGFzIFwiK3VzZXJuYW1lKTtcbiAgICAgICAgICAgIHJldHVybiAkLkRlZmVycmVkKCkucmVzb2x2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6IHRoaXMuYmFzZVVSTCArIFwiL2FwaS9sb2dpblwiLFxuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICBhc3luYzogdHJ1ZSxcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMsXG4gICAgICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0F1dGhvcml6YXRpb24nLCB0aGlzLm1ha2VfYmFzZV9hdXRoKHVzZXJuYW1lLCBwYXNzd29yZCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5kb25lKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltTZXJ2ZXIgSW50ZXJmYWNlXSBTdWNjZXNzZnVsbHkgbG9nZ2VkIGluLlwiKTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd3YWxkb3JmX2F1dGhfdG9rZW4nLCBkYXRhLmF1dGhfdG9rZW4pO1xuICAgICAgICB9KS5mYWlsKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIltTZXJ2ZXIgSW50ZXJmYWNlXSBDb3VsZCBub3QgbG9nIGluLlwiKTtcbiAgICAgICAgICAgIHRoaXMuYW5ub3RhdG9yLm1lc3NhZ2VPdmVybGF5LlNob3dFcnJvcihcIkNvdWxkIG5vdCBsb2cgaW4hXCIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBMb2dPdXQoKXtcbiAgICAgICAgLy8gSWYgQVBJIGtleSBpcyB1c2VkLCBqdXN0IHJlbW92ZSB0aGUgZW1haWwgZnJvbSBsb2NhbCBzdG9yYWdlLlxuICAgICAgICBpZih0aGlzLmFubm90YXRvci5hcGlLZXkpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJbU2VydmVyIEludGVyZmFjZV0gU3VjY2Vzc2Z1bGx5IGxvZ2dlZCBvdXQuXCIpO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3dhbGRvcmZfdXNlcl9lbWFpbCcpO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3dhbGRvcmZfdXNlcl9uYW1lJyk7XG4gICAgICAgICAgICByZXR1cm4gJC5EZWZlcnJlZCgpLnJlc29sdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiB0aGlzLmJhc2VVUkwgKyBcIi9hcGkvbG9nb3V0XCIsXG4gICAgICAgICAgICB0eXBlOiBcIkRFTEVURVwiLFxuICAgICAgICAgICAgYXN5bmM6IHRydWUsXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLFxuICAgICAgICAgICAgYmVmb3JlU2VuZDogZnVuY3Rpb24gKHhocikge1xuICAgICAgICAgICAgICAgIGxldCBhdXRoX3Rva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dhbGRvcmZfYXV0aF90b2tlbicpIHx8IFwiXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtTZXJ2ZXIgSW50ZXJmYWNlXSB0b2tlbjogJHthdXRoX3Rva2VufWApO1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBdXRob3JpemF0aW9uJywgdGhpcy5tYWtlX3dyaXRlX2F1dGgoYXV0aF90b2tlbikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5kb25lKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltTZXJ2ZXIgSW50ZXJmYWNlXSBTdWNjZXNzZnVsbHkgbG9nZ2VkIG91dC5cIik7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnd2FsZG9yZl9hdXRoX3Rva2VuJyk7XG4gICAgICAgIH0pLmZhaWwoKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiW1NlcnZlciBJbnRlcmZhY2VdIENvdWxkIG5vdCBsb2cgb3V0LlwiKTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd3YWxkb3JmX2F1dGhfdG9rZW4nKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgRmV0Y2hBbm5vdGF0aW9ucyhzZWFyY2hLZXksIHNlYXJjaFBhcmFtKSB7XG4gICAgICAgIC8vVGhpcyBpcyByZXBsYWNlZCBieSB0aGlzLmJhc2VVUkwsIHdoaWNoIGlzIGRlZmluZWQgaW4gY29uZmlnXG4gICAgICAgIC8vdmFyIGJvb2tfdXJsID0gJ2h0dHA6Ly9zY2FsYXIudXNjLmVkdS9kZXYvc2VtYW50aWMtYW5ub3RhdGlvbi10b29sLyc7ICAvLyBUaGlzIHdpbGwgYmUgZGVmaW5lZCBpbiB0aGUgQm9vaydzIEpTXG4gICAgICAgIC8vaHR0cHM6Ly9zY2FsYXIudXNjLmVkdS9kZXYvc2VtYW50aWMtYW5ub3RhdGlvbi10b29sL3JkZi9maWxlL21lZGlhL0luY2VwdGlvbiUyMENvcmdpJTIwRmxvcC5tcDQ/Zm9ybWF0PW9hYyZwcm92PTEmcmVjPTJcbiAgICAgICAvLyB2YXIgYWpheF91cmwgPSB0aGlzLmJhc2VVUkwgKyAncmRmL2ZpbGUvJyArIHNlYXJjaFBhcmFtLnJlcGxhY2UodGhpcy5iYXNlVVJMLCAnJykgKyAnP2Zvcm1hdD1vYWMmcHJvdj0xJnJlYz0yJztcbiAgICAgICAgdmFyIGFqYXhfdXJsID0gdGhpcy5iYXNlVVJMICsgJ3JkZi9maWxlLycgKyBzZWFyY2hQYXJhbS5yZXBsYWNlKHRoaXMuYmFzZVVSTCwnJykgKyAnP2Zvcm1hdD1paWlmJnByb3Y9MSZyZWM9Mic7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJhamF4X3VybDogXCIgKyBhamF4X3VybCk7XG4gICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiBhamF4X3VybCxcbiAgICAgICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICAgICAgICBqc29ucDogXCJjYWxsYmFja1wiLFxuICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvbnBcIixcbiAgICAgICAgICAgIGFzeW5jOiB0cnVlXG4gICAgICAgIH0pLmRvbmUoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU2VydmVyIEludGVyZmFjZV0gRmV0Y2hlZCAnICsgKCgndW5kZWZpbmVkJz09dHlwZW9mKGRhdGEuaXRlbXMpKT9kYXRhLmxlbmd0aC0xOmRhdGEuaXRlbXNbMF0uaXRlbXMubGVuZ3RoKSArICcgYW5ub3RhdGlvbnMgZm9yICcgKyBzZWFyY2hLZXkgKyAnOiBcIicgKyBzZWFyY2hQYXJhbSArICdcIi4nKTtcbiAgICAgICAgfSkuZmFpbChmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciByZXR1cm5lZF9yZXNwb25zZSA9IHJlc3BvbnNlLnJlc3BvbnNlSlNPTi5lcnJvci5jb2RlWzBdLnZhbHVlICsgXCIgOiBcIiArIHJlc3BvbnNlLnJlc3BvbnNlSlNPTi5lcnJvci5tZXNzYWdlWzBdLnZhbHVlIDtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTZXJ2ZXIgSW50ZXJmYWNlXSBFcnJvciBmZXRjaGluZyBhbm5vdGF0aW9ucyBmb3IgJyArIHNlYXJjaEtleSArICc6IFwiJyArIHNlYXJjaFBhcmFtICsgJ1wiXFxuICcgKyByZXR1cm5lZF9yZXNwb25zZSk7XG4gICAgICAgICAgICBfdGhpczIuYW5ub3RhdG9yLm1lc3NhZ2VPdmVybGF5LlNob3dFcnJvcignQ291bGQgbm90IHJldHJpZXZlIGFubm90YXRpb25zITxicj4oJyArIHJldHVybmVkX3Jlc3BvbnNlICsgJyknKTtcblxuICAgICAgICB9KTsgIFxuICAgIH1cblxuICAgIFBvc3RBbm5vdGF0aW9uKGNhbGxiYWNrKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJQb3N0aW5nIGFubm90YXRpb24uLi5cIik7XG4gICAgICAgIGxldCBhbm5vdGF0aW9uID0gdGhpcy5hbm5vdGF0b3IuZ3VpLkdldEFubm90YXRpb25PYmplY3QoKTtcbiAgICAgICAgY29uc29sZS5sb2coYW5ub3RhdGlvbik7XG5cbiAgICAgICAgbGV0IGtleTtcbiAgICAgICAgaWYgKHRoaXMuYW5ub3RhdG9yLmFwaUtleSl7XG4gICAgICAgICAgICBrZXkgPSB0aGlzLmFubm90YXRvci5hcGlLZXk7XG4gICAgICAgICAgICBsZXQgZW1haWxfc3RvcmFnZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd3YWxkb3JmX3VzZXJfZW1haWwnKTtcbiAgICAgICAgICAgIGxldCBuYW1lX3N0b3JhZ2UgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd2FsZG9yZl91c2VyX25hbWUnKTtcbiAgICAgICAgICAgIGlmKG5hbWVfc3RvcmFnZSA9PSBudWxsKSBuYW1lX3N0b3JhZ2UgPSBlbWFpbF9zdG9yYWdlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2V5ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dhbGRvcmZfYXV0aF90b2tlbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5hbm5vdGF0b3IuYXBpS2V5KXtcbiAgICAgICAgICAgIGlmKGFubm90YXRpb25bXCJjcmVhdG9yXCJdID09IG51bGwpIGFubm90YXRpb25bXCJjcmVhdG9yXCJdID0ge307XG4gICAgICAgICAgICBhbm5vdGF0aW9uW1wiY3JlYXRvclwiXVtcImVtYWlsXCJdID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dhbGRvcmZfdXNlcl9lbWFpbCcpO1xuICAgICAgICAgICAgYW5ub3RhdGlvbltcImNyZWF0b3JcIl1bXCJuaWNrbmFtZVwiXSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd3YWxkb3JmX3VzZXJfbmFtZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFubm90YXRpb25bXCJhbm5vdGF0aW9uX3ZlcnNpb25cIl0gPT0gXCJ2MVwiKSB7XG4gICAgICAgICAgICBhbm5vdGF0aW9uW1wicmVxdWVzdFwiXVtcIml0ZW1zXCJdW1wiYWN0aW9uXCJdID0gXCJhZGRcIjtcbiAgICAgICAgICAgIGRlbGV0ZSBhbm5vdGF0aW9uW1wiaXRlbXNcIl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbm5vdGF0aW9uW1wic2VydmljZVwiXVswXVtcIml0ZW1zXCJdW1wiYWN0aW9uXCJdID0gXCJhZGRcIjtcbiAgICAgICAgICAgIGRlbGV0ZSBhbm5vdGF0aW9uW1widGFyZ2V0XCJdO1xuICAgICAgICAgICAgZGVsZXRlIGFubm90YXRpb25bXCJib2R5XCJdO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSBhbm5vdGF0aW9uW1wiYW5ub3RhdGlvbl92ZXJzaW9uXCJdO1xuXG4gICAgICAgIGFubm90YXRpb25bXCJpZFwiXSA9IHRoaXMuYmFzZVVSTCArIFwiYXBpL2FkZFwiO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiUG9zdEFubm90YXRpb24gcGF5bG9hZDogXCIgKyBKU09OLnN0cmluZ2lmeShhbm5vdGF0aW9uKSk7XG4gICAgICAgIFxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgLy91cmw6IHRoaXMuYmFzZVVSTCArIFwiL2FwaS9hZGRBbm5vdGF0aW9uXCIsXG4gICAgICAgICAgICB1cmw6IHRoaXMuYmFzZVVSTCArIFwiYXBpL2FkZFwiLFxuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLCAvLyBOZWNlc3NhcnkgZm9yIFJhaWxzIHRvIHNlZSB0aGlzIGRhdGEgdHlwZSBjb3JyZWN0bHlcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsICAvLyBOZWNlc3NhcnkgZm9yIFJhaWxzIHRvIHNlZSB0aGlzIGRhdGEgdHlwZSBjb3JyZWN0bHlcbiAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGFubm90YXRpb24pLCAgLy8gU3RyaW5naWZ5IG5lY2Vzc2FyeSBmb3IgUmFpbHMgdG8gc2VlIHRoaXMgZGF0YSB0eXBlIGNvcnJlY3RseVxuICAgICAgICAgICAgYXN5bmM6IHRydWUsXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLFxuICAgICAgICAgICAgYmVmb3JlU2VuZDogZnVuY3Rpb24gKHhocikge1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBdXRob3JpemF0aW9uJywgdGhpcy5tYWtlX3dyaXRlX2F1dGgoa2V5KSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlN1Y2Nlc3NmdWxseSBwb3N0ZWQgbmV3IGFubm90YXRpb24uXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuYW5ub3RhdG9yLm1lc3NhZ2VPdmVybGF5LlNob3dNZXNzYWdlKFwiU3VjY2Vzc2Z1bGx5IGNyZWF0ZWQgbmV3IGFubm90YXRpb24uXCIpO1xuICAgICAgICAgICAgICAgIGFubm90YXRpb24uaWQgPSBkYXRhLmlkOyAvLyBBcHBlbmQgdGhlIElEIGdpdmVuIGJ5IHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmKGNhbGxiYWNrKSBjYWxsYmFjayhhbm5vdGF0aW9uKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIHJldHVybmVkX3Jlc3BvbnNlID0gXCJ1bmRlZmluZWQgZXJyb3Igd2hpbGUgZWRpdGluZyB0aGUgYW5ub3RhdGlvblwiO1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5yZXNwb25zZUpTT04pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuZWRfcmVzcG9uc2UgPSByZXNwb25zZS5yZXNwb25zZUpTT04uZXJyb3IuY29kZVswXS52YWx1ZSArIFwiIDogXCIgKyByZXNwb25zZS5yZXNwb25zZUpTT04uZXJyb3IubWVzc2FnZVswXS52YWx1ZSA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYENvdWxkIG5vdCBlZGl0IHRoZSBhbm5vdGF0aW9uISBNZXNzYWdlOlxcbiAke3JldHVybmVkX3Jlc3BvbnNlfWApO1xuICAgICAgICAgICAgICAgIHRoaXMuYW5ub3RhdG9yLm1lc3NhZ2VPdmVybGF5LlNob3dFcnJvcihgQ291bGQgbm90IGVkaXQgdGhlIGFubm90YXRpb24hPGJyPigke3JldHVybmVkX3Jlc3BvbnNlfSlgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgRWRpdEFubm90YXRpb24oY2FsbGJhY2spe1xuICAgICAgICBjb25zb2xlLmxvZyhcIkVkaXRpbmcgYW5ub3RhdGlvbi4uLlwiKTtcbiAgICAgICAgbGV0IGFubm90YXRpb24gPSB0aGlzLmFubm90YXRvci5ndWkuR2V0QW5ub3RhdGlvbk9iamVjdCgpO1xuICAgICAgICBjb25zb2xlLmxvZyhhbm5vdGF0aW9uKTtcblxuICAgICAgICBsZXQga2V5O1xuICAgICAgICBpZiAodGhpcy5hbm5vdGF0b3IuYXBpS2V5KXtcbiAgICAgICAgICAgIGtleSA9IHRoaXMuYW5ub3RhdG9yLmFwaUtleTtcbiAgICAgICAgICAgIGxldCBlbWFpbF9zdG9yYWdlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dhbGRvcmZfdXNlcl9lbWFpbCcpO1xuICAgICAgICAgICAgbGV0IG5hbWVfc3RvcmFnZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd3YWxkb3JmX3VzZXJfbmFtZScpO1xuICAgICAgICAgICAgaWYobmFtZV9zdG9yYWdlID09IG51bGwpIG5hbWVfc3RvcmFnZSA9IGVtYWlsX3N0b3JhZ2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrZXkgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd2FsZG9yZl9hdXRoX3Rva2VuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLmFubm90YXRvci5hcGlLZXkpe1xuICAgICAgICAgICAgaWYoYW5ub3RhdGlvbltcImNyZWF0b3JcIl0gPT0gbnVsbCkgYW5ub3RhdGlvbltcImNyZWF0b3JcIl0gPSB7fTtcbiAgICAgICAgICAgIGFubm90YXRpb25bXCJjcmVhdG9yXCJdW1wiZW1haWxcIl0gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd2FsZG9yZl91c2VyX2VtYWlsJyk7XG4gICAgICAgICAgICBhbm5vdGF0aW9uW1wiY3JlYXRvclwiXVtcIm5pY2tuYW1lXCJdID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dhbGRvcmZfdXNlcl9uYW1lJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYW5ub3RhdGlvbltcImFubm90YXRpb25fdmVyc2lvblwiXSA9PSBcInYxXCIpIHtcbiAgICAgICAgICAgIGFubm90YXRpb25bXCJyZXF1ZXN0XCJdW1wiaXRlbXNcIl1bXCJhY3Rpb25cIl0gPSBcInVwZGF0ZVwiO1xuICAgICAgICAgICAgZGVsZXRlIGFubm90YXRpb25bXCJpdGVtc1wiXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFubm90YXRpb25bXCJzZXJ2aWNlXCJdWzBdW1wiaXRlbXNcIl1bXCJhY3Rpb25cIl0gPSBcInVwZGF0ZVwiO1xuICAgICAgICAgICAgZGVsZXRlIGFubm90YXRpb25bXCJ0YXJnZXRcIl07XG4gICAgICAgICAgICBkZWxldGUgYW5ub3RhdGlvbltcImJvZHlcIl07XG4gICAgICAgIH1cbiAgICAgICAgZGVsZXRlIGFubm90YXRpb25bXCJhbm5vdGF0aW9uX3ZlcnNpb25cIl07XG5cbiAgICAgICAgdmFyIG9sZElEID0gJyc7XG4gICAgICAgIGlmICgndW5kZWZpbmVkJyA9PSB0eXBlb2YoYW5ub3RhdGlvbi5pdGVtcykpIHsgLy8gVmVyc2lvbiAxXG4gICAgICAgICAgICBvbGRJRCA9IGFubm90YXRpb24uaWQ7XG4gICAgICAgIH0gZWxzZSB7IC8vIFZlcnNpb24gMlxuICAgICAgICAgICAgb2xkSUQgPSBhbm5vdGF0aW9uLml0ZW1zWzBdLml0ZW1zWzBdLml0ZW1zWzBdLmlkO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJNb2RpZnlpbmcgYW5ub3RhdGlvbjogXCIgKyBvbGRJRCk7XG4gICAgICAgIFxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiB0aGlzLmJhc2VVUkwgKyBcImFwaS91cGRhdGVcIixcbiAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShhbm5vdGF0aW9uKSxcbiAgICAgICAgICAgIGFzeW5jOiB0cnVlLFxuICAgICAgICAgICAgY29udGV4dDogdGhpcyxcbiAgICAgICAgICAgIGJlZm9yZVNlbmQ6IGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsIHRoaXMubWFrZV93cml0ZV9hdXRoKGtleSkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhhbm5vdGF0aW9uKTtcbiAgICAgICAgICAgICAgICBhbm5vdGF0aW9uLmlkID0gZGF0YS5pZDsgLy8gQXBwZW5kIHRoZSBJRCBnaXZlbiBieSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiU3VjY2Vzc2Z1bGx5IGVkaXRlZCB0aGUgYW5ub3RhdGlvbi4gKElEIGlzIG5vdyBcIiArIGRhdGEuaWQgKyBcIilcIik7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmFubm90YXRvci5tZXNzYWdlT3ZlcmxheS5TaG93TWVzc2FnZShcIlN1Y2Nlc3NmdWxseSBlZGl0ZWQgdGhlIGFub3RhdGlvbi5cIik7XG4gICAgICAgICAgICAgICAgaWYoY2FsbGJhY2spIGNhbGxiYWNrKGFubm90YXRpb24sIG9sZElEKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmVycm9yKGBDb3VsZCBub3QgZWRpdCB0aGUgYW5ub3RhdGlvbiEgTWVzc2FnZTpcXG4gJHtyZXNwb25zZS5yZXNwb25zZUpTT04uZGV0YWlsfWApO1xuICAgICAgICAgICAgICAgIC8vdGhpcy5hbm5vdGF0b3IubWVzc2FnZU92ZXJsYXkuU2hvd0Vycm9yKGBDb3VsZCBub3QgZWRpdCB0aGUgYW5ub3RhdGlvbiE8YnI+KCR7cmVzcG9uc2UucmVzcG9uc2VKU09OLmRldGFpbH0pYCk7XG4gICAgICAgICAgICAgICAgdmFyIHJldHVybmVkX3Jlc3BvbnNlID0gXCJ1bmRlZmluZWQgZXJyb3Igd2hpbGUgZWRpdGluZyB0aGUgYW5ub3RhdGlvblwiO1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5yZXNwb25zZUpTT04pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuZWRfcmVzcG9uc2UgPSByZXNwb25zZS5yZXNwb25zZUpTT04uZXJyb3IuY29kZVswXS52YWx1ZSArIFwiIDogXCIgKyByZXNwb25zZS5yZXNwb25zZUpTT04uZXJyb3IubWVzc2FnZVswXS52YWx1ZSA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYENvdWxkIG5vdCBlZGl0IHRoZSBhbm5vdGF0aW9uISBNZXNzYWdlOlxcbiAke3JldHVybmVkX3Jlc3BvbnNlfWApO1xuICAgICAgICAgICAgICAgIHRoaXMuYW5ub3RhdG9yLm1lc3NhZ2VPdmVybGF5LlNob3dFcnJvcihgQ291bGQgbm90IGVkaXQgdGhlIGFubm90YXRpb24hPGJyPigke3JldHVybmVkX3Jlc3BvbnNlfSlgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBEZWxldGVBbm5vdGF0aW9uKGFubm90YXRpb24sIGNhbGxiYWNrKXtcbiAgICAgICAgaWYgKCFjb25maXJtKCdBcmUgeW91IHN1cmUgeW91IHdpc2ggdG8gZGVsZXRlIHRoaXMgYW5ub3RhdGlvbj8nKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGtleTtcbiAgICAgICAgaWYgKHRoaXMuYW5ub3RhdG9yLmFwaUtleSl7XG4gICAgICAgICAgICBrZXkgPSB0aGlzLmFubm90YXRvci5hcGlLZXk7XG4gICAgICAgICAgICBsZXQgZW1haWxfc3RvcmFnZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd3YWxkb3JmX3VzZXJfZW1haWwnKTtcbiAgICAgICAgICAgIGxldCBuYW1lX3N0b3JhZ2UgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd2FsZG9yZl91c2VyX25hbWUnKTtcbiAgICAgICAgICAgIGlmKG5hbWVfc3RvcmFnZSA9PSBudWxsKSBuYW1lX3N0b3JhZ2UgPSBlbWFpbF9zdG9yYWdlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2V5ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dhbGRvcmZfYXV0aF90b2tlbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5hbm5vdGF0b3IuYXBpS2V5KXtcbiAgICAgICAgICAgIGlmKGFubm90YXRpb25bXCJjcmVhdG9yXCJdID09IG51bGwpIGFubm90YXRpb25bXCJjcmVhdG9yXCJdID0ge307XG4gICAgICAgICAgICBhbm5vdGF0aW9uW1wiY3JlYXRvclwiXVtcImVtYWlsXCJdID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dhbGRvcmZfdXNlcl9lbWFpbCcpO1xuICAgICAgICAgICAgYW5ub3RhdGlvbltcImNyZWF0b3JcIl1bXCJuaWNrbmFtZVwiXSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd3YWxkb3JmX3VzZXJfbmFtZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFubm90YXRpb25bXCJhbm5vdGF0aW9uX3ZlcnNpb25cIl0gPT0gXCJ2MVwiKSB7XG4gICAgICAgICAgICBhbm5vdGF0aW9uW1wicmVxdWVzdFwiXVtcIml0ZW1zXCJdW1wiYWN0aW9uXCJdID0gXCJ1cGRhdGVcIjtcbiAgICAgICAgICAgIGRlbGV0ZSBhbm5vdGF0aW9uW1wiaXRlbXNcIl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbm5vdGF0aW9uW1wic2VydmljZVwiXVswXVtcIml0ZW1zXCJdW1wiYWN0aW9uXCJdID0gXCJ1cGRhdGVcIjtcbiAgICAgICAgICAgIGRlbGV0ZSBhbm5vdGF0aW9uW1widGFyZ2V0XCJdO1xuICAgICAgICAgICAgZGVsZXRlIGFubm90YXRpb25bXCJib2R5XCJdO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSBhbm5vdGF0aW9uW1wiYW5ub3RhdGlvbl92ZXJzaW9uXCJdO1xuXG4gICAgICAgIHZhciBvbGRJRCA9ICcnO1xuICAgICAgICBpZiAoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mKGFubm90YXRpb24uaXRlbXMpKSB7IC8vIFZlcnNpb24gMVxuICAgICAgICAgICAgb2xkSUQgPSBhbm5vdGF0aW9uLmlkO1xuICAgICAgICB9IGVsc2UgeyAvLyBWZXJzaW9uIDJcbiAgICAgICAgICAgIG9sZElEID0gYW5ub3RhdGlvbi5pdGVtc1swXS5pdGVtc1swXS5pdGVtc1swXS5pZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiRGVsZXRpbmcgYW5ub3RhdGlvbjogXCIgKyBvbGRJRClcblxuICAgICAgICBpZiAoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mKGFubm90YXRpb24uaXRlbXMpKSB7IC8vIFZlcnNpb24gMVxuICAgICAgICAgICAgdmFyIGRlbF9kYXRhID0ge1xuICAgICAgICAgICAgICAgIFwic2NhbGFyOnVyblwiOiBcInVybjpzY2FsYXI6dmVyc2lvbjpcIiArIGFubm90YXRpb24uaWQsXG4gICAgICAgICAgICAgICAgXCJuYXRpdmVcIjogYW5ub3RhdGlvbi5yZXF1ZXN0Lml0ZW1zLm5hdGl2ZSxcbiAgICAgICAgICAgICAgICBcImFjdGlvblwiOiBcIkRFTEVURVwiLFxuICAgICAgICAgICAgICAgIFwiYXBpX2tleVwiOiBhbm5vdGF0aW9uLnJlcXVlc3QuaXRlbXMuYXBpX2tleSxcbiAgICAgICAgICAgICAgICBcImlkXCI6IGFubm90YXRpb24ucmVxdWVzdC5pdGVtcy5pZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiAkLnBvc3QodGhpcy5iYXNlVVJMICsgXCJhcGkvZGVsZXRlXCIsIGRlbF9kYXRhLCBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRlbGV0ZSBlcnJvciByZXNwb25zZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZS5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgIH0gIFxuICAgICAgICAgICAgfSkuZG9uZSgocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlN1Y2Nlc3NmdWxseSBkZWxldGVkIHRoZSBhbm5vdGF0aW9uLlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFubm90YXRvci5tZXNzYWdlT3ZlcmxheS5TaG93TWVzc2FnZShcIlN1Y2Nlc3NmdWxseSBkZWxldGVkIHRoZSBhbm5vdGF0aW9uLlwiKTtcbiAgICAgICAgICAgICAgICBpZihjYWxsYmFjaykgY2FsbGJhY2soYW5ub3RhdGlvbiwgb2xkSUQpO1xuICAgICAgICAgICAgfSkuZmFpbCgocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgcmV0dXJuZWRfcmVzcG9uc2UgPSBcInVuZGVmaW5lZCBmYWlsdXJlIHdoaWxlIGRlbGV0aW5nIHRoZSBhbm5vdGF0aW9uXCI7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnJlc3BvbnNlSlNPTikge1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5yZXNwb25zZUpTT04uZXJyb3IuY29kZVswXS52YWx1ZSArIFwiIDogXCIgKyByZXNwb25zZS5yZXNwb25zZUpTT04uZXJyb3IubWVzc2FnZVswXS52YWx1ZSA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYENvdWxkIG5vdCBkZWxldGUgdGhlIGFubm90YXRpb24uIE1lc3NhZ2U6XFxuICR7cmV0dXJuZWRfcmVzcG9uc2V9YCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IubWVzc2FnZU92ZXJsYXkuU2hvd0Vycm9yKGBDb3VsZCBub3QgZGVsZXRlIHRoZSBhbm5vdGF0aW9uITxicj4oJHtyZXR1cm5lZF9yZXNwb25zZX0pYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHsgLy8gVmVyc2lvbiAyXG4gICAgICAgICAgICBhbm5vdGF0aW9uW1wic2VydmljZVwiXVswXVtcIml0ZW1zXCJdW1wiYWN0aW9uXCJdID0gXCJkZWxldGVcIjtcbiAgICAgICAgICAgIGRlbGV0ZSBhbm5vdGF0aW9uW1widGFyZ2V0XCJdO1xuICAgICAgICAgICAgZGVsZXRlIGFubm90YXRpb25bXCJib2R5XCJdO1xuICAgICAgICAgICAgZGVsZXRlIGFubm90YXRpb25bXCJhbm5vdGF0aW9uX3ZlcnNpb25cIl07XG4gICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHVybDogdGhpcy5iYXNlVVJMICsgXCJhcGkvZGVsZXRlXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGFubm90YXRpb24pLFxuICAgICAgICAgICAgICAgIGFzeW5jOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMsXG4gICAgICAgICAgICAgICAgYmVmb3JlU2VuZDogZnVuY3Rpb24gKHhocikge1xuICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsIHRoaXMubWFrZV93cml0ZV9hdXRoKGtleSkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IubWVzc2FnZU92ZXJsYXkuU2hvd01lc3NhZ2UoXCJTdWNjZXNzZnVsbHkgZGVsZXRlZCB0aGUgYW5vdGF0aW9uLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYoY2FsbGJhY2spIGNhbGxiYWNrKGFubm90YXRpb24sIG9sZElEKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVycm9yOiAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJldHVybmVkX3Jlc3BvbnNlID0gXCJ1bmRlZmluZWQgZXJyb3Igd2hpbGUgZGVsZXRpbmcgdGhlIGFubm90YXRpb25cIjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnJlc3BvbnNlSlNPTikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuZWRfcmVzcG9uc2UgPSByZXNwb25zZS5yZXNwb25zZUpTT04uZXJyb3IuY29kZVswXS52YWx1ZSArIFwiIDogXCIgKyByZXNwb25zZS5yZXNwb25zZUpTT04uZXJyb3IubWVzc2FnZVswXS52YWx1ZSA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQ291bGQgbm90IGRlbGV0ZSB0aGUgYW5ub3RhdGlvbiEgTWVzc2FnZTpcXG4gJHtyZXR1cm5lZF9yZXNwb25zZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3IubWVzc2FnZU92ZXJsYXkuU2hvd0Vycm9yKGBDb3VsZCBub3QgZGVsZXRlIHRoZSBhbm5vdGF0aW9uITxicj4oJHtyZXR1cm5lZF9yZXNwb25zZX0pYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gXG5cbiAgICB9XG5cbn1cblxuXG5leHBvcnQgeyBTZXJ2ZXJJbnRlcmZhY2UgfTsiLCJsZXQgc2hhMSA9IHJlcXVpcmUoJ3NoYTEnKTtcblxuLyoqXG4gKiBNYW5hZ2VzIHRoZSB1c2VyIHNlc3Npb24gZm9yIGNvbW11bmljYXRpbmcgd2l0aCB0aGUgYmFja2VuZC5cbiAqL1xuY2xhc3MgU2Vzc2lvbk1hbmFnZXIge1xuXG4gICAgY29uc3RydWN0b3IoYW5ub3RhdG9yKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJbU2Vzc2lvbiBNYW5hZ2VyXSBDcmVhdGluZyBTZXNzaW9uTWFuYWdlci4uLlwiKTtcbiAgICAgICAgdGhpcy5hbm5vdGF0b3IgPSBhbm5vdGF0b3I7XG4gICAgICAgIHRoaXMubW9kYWxPcGVuID0gZmFsc2U7XG5cbiAgICAgICAgLy8gSW5qZWN0IHRoZSBidXR0b24gZm9yIGxvZ2dpbmcgaW4vb3V0IGludG8gdGhlIHRvb2xiYXJcbiAgICAgICAgaWYoIWFubm90YXRvci5raW9za01vZGUgJiYgYW5ub3RhdG9yLmNtc0VtYWlsID09ICcnKXtcbiAgICAgICAgICAgIHRoaXMuJHVzZXJCdXR0b24gPSAkKFwiPGJ1dHRvbj5TZXNzaW9uPC9idXR0b24+XCIpLmJ1dHRvbih7XG4gICAgICAgICAgICAgICAgaWNvbjogXCJmYSBmYS11c2VyXCIsXG4gICAgICAgICAgICAgICAgc2hvd0xhYmVsOiBmYWxzZVxuICAgICAgICAgICAgfSkuY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuUHJlc2VudE1vZGFsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuYW5ub3RhdG9yLnBsYXllci5jb250cm9sQmFyLlJlZ2lzdGVyRWxlbWVudCh0aGlzLiR1c2VyQnV0dG9uLCAxLCAnZmxleC1lbmQnKTtcbiAgICAgICAgfVxuICAgICAgICAvL3RoaXMuJGRpYWxvZy5kaWFsb2coXCJvcGVuXCIpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiW1Nlc3Npb24gTWFuYWdlcl0gU2Vzc2lvbk1hbmFnZXIgY3JlYXRlZC5cIik7XG5cbiAgICB9XG5cbiAgICBTaG93TG9naW5Nb2RhbCgpe1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZGlhbG9nXG4gICAgICAgIGxldCAkY29udGFpbmVyID0gJChcIjxkaXYgY2xhc3M9J3dhbGRvcmYtc2Vzc2lvbi1tb2RhbCcgdGl0bGU9J0xvZyBJbic+PC9kaXY+XCIpOyAvLyBPdXRlcm1vc3QgSFRNTFxuICAgICAgICBsZXQgJGhlYWRUZXh0ID0gJChcIjxwIGNsYXNzPSd2YWxpZGF0ZVRpcHMnPkFsbCBmaWVsZHMgYXJlIHJlcXVpcmVkLjwvcD5cIikuYXBwZW5kVG8oJGNvbnRhaW5lcik7XG4gICAgICAgIGxldCAkZm9ybSA9ICQoXCI8Zm9ybT48L2Zvcm0+XCIpLmFwcGVuZFRvKCRjb250YWluZXIpO1xuXG4gICAgICAgIGxldCAkbmlja25hbWVGaWVsZDtcbiAgICAgICAgbGV0ICR1c2VybmFtZUZpZWxkO1xuICAgICAgICBsZXQgJHBhc3N3b3JkRmllbGQ7XG5cbiAgICAgICAgaWYgKHRoaXMuYW5ub3RhdG9yLmFwaUtleSl7XG4gICAgICAgICAgICAkKFwiPGxhYmVsIGZvcj0ndXNlcm5hbWUnPk5hbWU8L2xhYmVsPlwiKS5hcHBlbmRUbygkZm9ybSk7XG4gICAgICAgICAgICAkbmlja25hbWVGaWVsZCA9ICQoXCI8aW5wdXQgdHlwZT0ndGV4dCcgbmFtZT0ndXNlcm5hbWUnIHZhbHVlPScnIGNsYXNzPSd0ZXh0IHVpLXdpZGdldC1jb250ZW50IHVpLWNvcm5lci1hbGwnPlwiKS5hcHBlbmRUbygkZm9ybSk7XG4gICAgICAgICAgICAkKFwiPGxhYmVsIGZvcj0ndXNlcm5hbWUnPkVtYWlsIEFkZHJlc3M8L2xhYmVsPlwiKS5hcHBlbmRUbygkZm9ybSk7XG4gICAgICAgICAgICAkdXNlcm5hbWVGaWVsZCA9ICQoXCI8aW5wdXQgdHlwZT0ndGV4dCcgbmFtZT0nZW1haWwnIHZhbHVlPScnIGNsYXNzPSd0ZXh0IHVpLXdpZGdldC1jb250ZW50IHVpLWNvcm5lci1hbGwnPlwiKS5hcHBlbmRUbygkZm9ybSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAkKFwiPGxhYmVsIGZvcj0ndXNlcm5hbWUnPlVzZXJuYW1lPC9sYWJlbD5cIikuYXBwZW5kVG8oJGZvcm0pO1xuICAgICAgICAgICAgJHVzZXJuYW1lRmllbGQgPSAkKFwiPGlucHV0IHR5cGU9J3RleHQnIG5hbWU9J3VzZXJuYW1lJyB2YWx1ZT0nJyBjbGFzcz0ndGV4dCB1aS13aWRnZXQtY29udGVudCB1aS1jb3JuZXItYWxsJz5cIikuYXBwZW5kVG8oJGZvcm0pO1xuICAgICAgICAgICAgJChcIjxsYWJlbCBmb3I9J3Bhc3N3b3JkJz5QYXNzd29yZDwvbGFiZWw+XCIpLmFwcGVuZFRvKCRmb3JtKTtcbiAgICAgICAgICAgICRwYXNzd29yZEZpZWxkID0gJChcIjxpbnB1dCB0eXBlPSdwYXNzd29yZCcgbmFtZT0ncGFzc3dvcmQnIHZhbHVlPScnIGNsYXNzPSd0ZXh0IHVpLXdpZGdldC1jb250ZW50IHVpLWNvcm5lci1hbGwnPlwiKS5hcHBlbmRUbygkZm9ybSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICRmb3JtLndyYXBJbm5lcihcIjxmaWVsZHNldCAvPlwiKTtcblxuICAgICAgICBsZXQgbG9naW4gPSAoKSA9PiB7XG4gICAgICAgICAgICBpZih0aGlzLmFubm90YXRvci5hcGlLZXkpe1xuICAgICAgICAgICAgICAgIGxldCBuaWNrTmFtZSA9ICRuaWNrbmFtZUZpZWxkLnZhbCgpO1xuICAgICAgICAgICAgICAgIGxldCB1c2VyTmFtZSA9IHNoYTEoJHVzZXJuYW1lRmllbGQudmFsKCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuYW5ub3RhdG9yLnNlcnZlci5Mb2dJbihuaWNrTmFtZSwgdXNlck5hbWUpLmRvbmUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkFQSSBrZXkgbG9naW4gc3VjY2Vzc1wiKTtcbiAgICAgICAgICAgICAgICAgICAgJGRpYWxvZy5kaWFsb2coXCJjbG9zZVwiKTtcbiAgICAgICAgICAgICAgICB9KS5mYWlsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgJGhlYWRUZXh0Lmh0bWwoXCI8cD5JbnZhbGlkIGVtYWlsIGFkZHJlc3MuPC9wPlwiKTtcbiAgICAgICAgICAgICAgICAgICAgJGhlYWRUZXh0LmNzcyhcImNvbG9yXCIsIFwicmVkXCIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IHVzZXJQYXNzID0gc2hhMSgkcGFzc3dvcmRGaWVsZC52YWwoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hbm5vdGF0b3Iuc2VydmVyLkxvZ0luKCR1c2VybmFtZUZpZWxkLnZhbCgpLCB1c2VyUGFzcykuZG9uZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRkaWFsb2cuZGlhbG9nKFwiY2xvc2VcIik7XG4gICAgICAgICAgICAgICAgfSkuZmFpbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRoZWFkVGV4dC5odG1sKFwiPHA+SW52YWxpZCB1c2VybmFtZSBvciBwYXNzd29yZC48L3A+XCIpO1xuICAgICAgICAgICAgICAgICAgICAkaGVhZFRleHQuY3NzKFwiY29sb3JcIiwgXCJyZWRcIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCAkZGlhbG9nID0gJGNvbnRhaW5lci5kaWFsb2coe1xuICAgICAgICAgICAgYXV0b09wZW46IHRydWUsXG4gICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgbW9kYWw6IHRydWUsXG4gICAgICAgICAgICBidXR0b25zOiB7XG4gICAgICAgICAgICAgICAgXCJMb2cgSW5cIjogbG9naW4sXG4gICAgICAgICAgICAgICAgQ2FuY2VsOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRkaWFsb2cuZGlhbG9nKFwiY2xvc2VcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNsb3NlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgJGRpYWxvZy5maW5kKFwiZm9ybVwiKVsgMCBdLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgJGRpYWxvZy5maW5kKFwiaW5wdXRcIikucmVtb3ZlQ2xhc3MoIFwidWktc3RhdGUtZXJyb3JcIiApO1xuICAgICAgICAgICAgICAgIHRoaXMuT25Nb2RhbENsb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIFNob3dMb2dvdXRNb2RhbCgpe1xuICAgICAgICBsZXQgJGNvbnRhaW5lciA9ICQoXCI8ZGl2IHRpdGxlPSdMb2cgT3V0Jz48L2Rpdj5cIik7XG4gICAgICAgIGxldCAkaGVhZFRleHQgPSAkY29udGFpbmVyLmh0bWwoXCI8cCBjbGFzcz0ndmFsaWRhdGVUaXBzJz5BcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gbG9nIG91dD88L3A+XCIpO1xuICAgICAgICBsZXQgJGRpYWxvZyA9ICRjb250YWluZXIuZGlhbG9nKHtcbiAgICAgICAgICAgIGF1dG9PcGVuOiB0cnVlLFxuICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIG1vZGFsOiB0cnVlLFxuICAgICAgICAgICAgYnV0dG9uczoge1xuICAgICAgICAgICAgICAgIFwiTG9nIE91dFwiOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYW5ub3RhdG9yLnNlcnZlci5Mb2dPdXQoKS5kb25lKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRkaWFsb2cuZGlhbG9nKFwiY2xvc2VcIik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgQ2FuY2VsOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRkaWFsb2cuZGlhbG9nKFwiY2xvc2VcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNsb3NlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5Pbk1vZGFsQ2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgUHJlc2VudE1vZGFsKCl7XG4gICAgICAgIC8vIEVhcmx5IG91dCBpZiB0aGUgbW9kYWwgaXMgYWxyZWFkeSBvcGVuXG4gICAgICAgIGlmKHRoaXMubW9kYWxPcGVuKSByZXR1cm47XG5cbiAgICAgICAgLy8gVHVybiBvZmYgZnVsbHNjcmVlbiBpZiBpdCdzIG9uXG4gICAgICAgIHRoaXMuYW5ub3RhdG9yLnBsYXllci5TZXRGdWxsc2NyZWVuKGZhbHNlKTtcblxuICAgICAgICBpZih0aGlzLmFubm90YXRvci5zZXJ2ZXIuTG9nZ2VkSW4oKSl7XG4gICAgICAgICAgICB0aGlzLlNob3dMb2dvdXRNb2RhbCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5TaG93TG9naW5Nb2RhbCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5Pbk1vZGFsT3BlbigpO1xuICAgIH1cblxuICAgIE9uTW9kYWxPcGVuKCl7XG4gICAgICAgIHRoaXMuJHVzZXJCdXR0b24uYnV0dG9uKFwiZGlzYWJsZVwiKTtcbiAgICAgICAgdGhpcy5tb2RhbE9wZW4gPSB0cnVlO1xuICAgIH1cblxuICAgIE9uTW9kYWxDbG9zZSgpe1xuICAgICAgICB0aGlzLiR1c2VyQnV0dG9uLmJ1dHRvbihcImVuYWJsZVwiKTtcbiAgICAgICAgdGhpcy5tb2RhbE9wZW4gPSBmYWxzZTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IHsgU2Vzc2lvbk1hbmFnZXIgfTsiLCJtb2R1bGUuZXhwb3J0cz17XG4gICAgXCJjb25maWdGaWxlXCI6IFwiYW5ub3RhdG9yLWNvbmZpZy5qc29uXCJcbn0iLCIvKlxuRW50cnkgcG9pbnQgZm9yIHRoZSB3aG9sZSBwcm9qZWN0LiBBbnkgalF1ZXJ5IGV4dGVuc2lvbnMgc2hvdWxkXG5iZSByZWdpc3RlcmVkIGhlcmUuXG4qL1xuXG4vLyBJbXBvcnQgbnBtIG1vZHVsZSBkZXBlbmRlbmNpZXNcbmltcG9ydCBcIi4vdmVuZG9yLmpzXCI7XG5cbmltcG9ydCBcIi4vdXRpbHMvYXJyYXktZXh0ZW5zaW9ucy5qc1wiO1xuaW1wb3J0IFwiLi91dGlscy9qcXVlcnktZXh0ZW5zaW9ucy5qc1wiO1xuaW1wb3J0IFwiLi91dGlscy9zdHJpbmctZXh0ZW5zaW9ucy5qc1wiO1xuXG5pbXBvcnQgeyBwcmVmZXJlbmNlcyB9IGZyb20gXCIuL3V0aWxzL3ByZWZlcmVuY2UtbWFuYWdlci5qc1wiO1xuaW1wb3J0IHsgVmVyaWZ5UmVxdWlyZW1lbnRzIH0gZnJvbSBcIi4vdXRpbHMvcmVxdWlyZW1lbnRzLmpzXCI7XG5pbXBvcnQgeyBBbm5vdGF0b3JWaWRlb1BsYXllciB9IGZyb20gXCIuL3ZpZGVvLXBsYXllci92aWRlby1wbGF5ZXIuanNcIjtcblxuXG4kLmZuLmFubm90YXRlID0gZnVuY3Rpb24oYXJncyl7IFxuXG4gICAgLy8gbGV0IHNlcnZlclVSTCA9IGFyZ3Muc2VydmVyVVJMIHx8ICcnO1xuICAgIC8vIGxldCB0YWdzVVJMID0gYXJncy50YWdzVVJMIHx8ICcnO1xuICAgIC8vIGxldCBhcGlLZXkgPSBhcmdzLmFwaUtleSB8fCAnJztcbiAgICAvLyBsZXQga2lvc2tNb2RlID0gYXJncy5raW9za01vZGUgfHwgZmFsc2U7XG4gICAgLy8gbGV0IGxvY2FsVVJMID0gYXJncy5sb2NhbFVSTCB8fCAnJztcbiAgICAvLyBsZXQgcmVuZGVyZXIgPSBmdW5jdGlvbiguLi4pIHx8IGZhbHNlO1xuXG4gICAgLy8gRXJyb3Igb3V0IGVhcmx5IGlmIFwidGhpc1wiIGlzIG5vdCBhIHZpZGVvXG4gICAgaWYoJCh0aGlzKS5wcm9wKCd0YWdOYW1lJykudG9Mb3dlckNhc2UoKSAhPSBcInZpZGVvXCIpe1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiQ2Fubm90IHdyYXAgYSBub24tdmlkZW8gZWxlbWVudCFcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZighVmVyaWZ5UmVxdWlyZW1lbnRzKCkpe1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gcHJlZmVyZW5jZXMuR2V0SlNPTigoZGF0YSkgPT4ge1xuICAgIC8vICAgICAvL2NvbnNvbGUubG9nKGRhdGEpO1xuICAgIC8vIH0pO1xuICAgIFxuICAgIG5ldyBBbm5vdGF0b3JWaWRlb1BsYXllcigkKHRoaXMpLCBhcmdzKTtcblxufTsiLCIvLyBGcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE0ODUzOTc0LzcxMzg3OTJcblxuLy8gV2FybiBpZiBvdmVycmlkaW5nIGV4aXN0aW5nIG1ldGhvZFxuaWYoQXJyYXkucHJvdG90eXBlLmVxdWFscylcbiAgICBjb25zb2xlLndhcm4oXCJPdmVycmlkaW5nIGV4aXN0aW5nIEFycmF5LnByb3RvdHlwZS5lcXVhbHMuIFBvc3NpYmxlIGNhdXNlczogTmV3IEFQSSBkZWZpbmVzIHRoZSBtZXRob2QsIFxcXG4gICAgdGhlcmUncyBhIGZyYW1ld29yayBjb25mbGljdCBvciB5b3UndmUgZ290IGRvdWJsZSBpbmNsdXNpb25zIGluIHlvdXIgY29kZS5cIik7XG4gICAgXG4vLyBhdHRhY2ggdGhlIC5lcXVhbHMgbWV0aG9kIHRvIEFycmF5J3MgcHJvdG90eXBlIHRvIGNhbGwgaXQgb24gYW55IGFycmF5XG5BcnJheS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgLy8gaWYgdGhlIG90aGVyIGFycmF5IGlzIGEgZmFsc3kgdmFsdWUsIHJldHVyblxuICAgIGlmICghYXJyYXkpXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGNvbXBhcmUgbGVuZ3RocyAtIGNhbiBzYXZlIGEgbG90IG9mIHRpbWUgXG4gICAgaWYgKHRoaXMubGVuZ3RoICE9IGFycmF5Lmxlbmd0aClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGw9dGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgd2UgaGF2ZSBuZXN0ZWQgYXJyYXlzXG4gICAgICAgIGlmICh0aGlzW2ldIGluc3RhbmNlb2YgQXJyYXkgJiYgYXJyYXlbaV0gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgLy8gcmVjdXJzZSBpbnRvIHRoZSBuZXN0ZWQgYXJyYXlzXG4gICAgICAgICAgICBpZiAoIXRoaXNbaV0uZXF1YWxzKGFycmF5W2ldKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7ICAgICAgIFxuICAgICAgICB9ICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiAodGhpc1tpXSAhPSBhcnJheVtpXSkgeyBcbiAgICAgICAgICAgIC8vIFdhcm5pbmcgLSB0d28gZGlmZmVyZW50IG9iamVjdCBpbnN0YW5jZXMgd2lsbCBuZXZlciBiZSBlcXVhbDoge3g6MjB9ICE9IHt4OjIwfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAgIFxuICAgICAgICB9ICAgICAgICAgICBcbiAgICB9ICAgICAgIFxuICAgIHJldHVybiB0cnVlO1xufVxuLy8gSGlkZSBtZXRob2QgZnJvbSBmb3ItaW4gbG9vcHNcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsIFwiZXF1YWxzXCIsIHtlbnVtZXJhYmxlOiBmYWxzZX0pOyIsIi8qKlxuICogU2V0cyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgZWxlbWVudCB3aGlsZSBkaXNhYmxpbmcgaW50ZXJhY3Rpb24uXG4gKiBEb2Vzbid0IG1lc3Mgd2l0aCBqUXVlcnkncyBwb3NpdGlvbmluZyBjYWxjdWxhdGlvbnMgbGlrZSBzaG93KClcbiAqIGFuZCBoaWRlKCkuXG4gKi9cbiQuZm4ubWFrZVZpc2libGUgPSBmdW5jdGlvbihzaG93KSB7XG4gICAgaWYoc2hvdyl7XG4gICAgICAgICQodGhpcykuY3NzKHtcbiAgICAgICAgICAgIFwidmlzaWJpbGl0eVwiOiBcInZpc2libGVcIixcbiAgICAgICAgICAgIFwicG9pbnRlci1ldmVudHNcIjogXCJcIlxuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAkKHRoaXMpLmNzcyh7XG4gICAgICAgICAgICBcInZpc2liaWxpdHlcIjogXCJoaWRkZW5cIixcbiAgICAgICAgICAgIFwicG9pbnRlci1ldmVudHNcIjogXCJub25lXCJcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxufVxuXG4vKlxuQ29weXJpZ2h0IDIwMTQgTWlrZSBEdW5uXG5odHRwOi8vdXBzaG90cy5vcmcvXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcbmEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG53aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG5kaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cbnBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xudGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbmluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbk5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkVcbkxJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT05cbk9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmh0dHBzOi8vZ2l0aHViLmNvbS9tb2Fncml1cy9jb3B5Y3NzXG5cbiovXG5cdFxuJC5mbi5nZXRTdHlsZXMgPSBmdW5jdGlvbihvbmx5LCBleGNlcHQpIHtcbiAgICBcbiAgICAvLyB0aGUgbWFwIHRvIHJldHVybiB3aXRoIHJlcXVlc3RlZCBzdHlsZXMgYW5kIHZhbHVlcyBhcyBLVlBcbiAgICB2YXIgcHJvZHVjdCA9IHt9O1xuICAgIFxuICAgIC8vIHRoZSBzdHlsZSBvYmplY3QgZnJvbSB0aGUgRE9NIGVsZW1lbnQgd2UgbmVlZCB0byBpdGVyYXRlIHRocm91Z2hcbiAgICB2YXIgc3R5bGU7XG4gICAgXG4gICAgLy8gcmVjeWNsZSB0aGUgbmFtZSBvZiB0aGUgc3R5bGUgYXR0cmlidXRlXG4gICAgdmFyIG5hbWU7XG4gICAgXG4gICAgLy8gaWYgaXQncyBhIGxpbWl0ZWQgbGlzdCwgbm8gbmVlZCB0byBydW4gdGhyb3VnaCB0aGUgZW50aXJlIHN0eWxlIG9iamVjdFxuICAgIGlmIChvbmx5ICYmIG9ubHkgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvbmx5Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgLy8gc2luY2Ugd2UgaGF2ZSB0aGUgbmFtZSBhbHJlYWR5LCBqdXN0IHJldHVybiB2aWEgYnVpbHQtaW4gLmNzcyBtZXRob2RcbiAgICAgICAgICAgIG5hbWUgPSBvbmx5W2ldO1xuICAgICAgICAgICAgcHJvZHVjdFtuYW1lXSA9IHRoaXMuY3NzKG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH0gZWxzZSB7XG4gICAgXG4gICAgICAgIC8vIHByZXZlbnQgZnJvbSBlbXB0eSBzZWxlY3RvclxuICAgICAgICBpZiAodGhpcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCB3ZSBuZWVkIHRvIGdldCBldmVyeXRoaW5nXG4gICAgICAgICAgICB2YXIgZG9tID0gdGhpcy5nZXQoMCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHN0YW5kYXJkc1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gY29udmVuaWVuY2UgbWV0aG9kcyB0byB0dXJuIGNzcyBjYXNlICgnYmFja2dyb3VuZC1pbWFnZScpIHRvIGNhbWVsICgnYmFja2dyb3VuZEltYWdlJylcbiAgICAgICAgICAgICAgICB2YXIgcGF0dGVybiA9IC9cXC0oW2Etel0pL2c7XG4gICAgICAgICAgICAgICAgdmFyIHVjID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBiLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgfTtcdFx0XHRcbiAgICAgICAgICAgICAgICB2YXIgY2FtZWxpemUgPSBmdW5jdGlvbihzdHJpbmcpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UocGF0dGVybiwgdWMpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHdlJ3JlIGdldHRpbmcgYSBnb29kIHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgIGlmIChzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRvbSwgbnVsbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNhbWVsLCB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gb3BlcmEgZG9lc24ndCBnaXZlIGJhY2sgc3R5bGUubGVuZ3RoIC0gdXNlIHRydXRoeSBzaW5jZSBhIDAgbGVuZ3RoIG1heSBhcyB3ZWxsIGJlIHNraXBwZWQgYW55d2F5c1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3R5bGUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHN0eWxlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBzdHlsZVtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW1lbCA9IGNhbWVsaXplKG5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9kdWN0W2NhbWVsXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3BlcmFcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobmFtZSBpbiBzdHlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbWVsID0gY2FtZWxpemUobmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKG5hbWUpIHx8IHN0eWxlW25hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2R1Y3RbY2FtZWxdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJRSAtIGZpcnN0IHRyeSBjdXJyZW50U3R5bGUsIHRoZW4gbm9ybWFsIHN0eWxlIG9iamVjdCAtIGRvbid0IGJvdGhlciB3aXRoIHJ1bnRpbWVTdHlsZVxuICAgICAgICAgICAgZWxzZSBpZiAoc3R5bGUgPSBkb20uY3VycmVudFN0eWxlKSB7XG4gICAgICAgICAgICAgICAgZm9yIChuYW1lIGluIHN0eWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2R1Y3RbbmFtZV0gPSBzdHlsZVtuYW1lXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzdHlsZSA9IGRvbS5zdHlsZSkge1xuICAgICAgICAgICAgICAgIGZvciAobmFtZSBpbiBzdHlsZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHN0eWxlW25hbWVdICE9ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2R1Y3RbbmFtZV0gPSBzdHlsZVtuYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyByZW1vdmUgYW55IHN0eWxlcyBzcGVjaWZpZWQuLi5cbiAgICAvLyBiZSBjYXJlZnVsIG9uIGJsYWNrbGlzdCAtIHNvbWV0aW1lcyB2ZW5kb3Itc3BlY2lmaWMgdmFsdWVzIGFyZW4ndCBvYnZpb3VzIGJ1dCB3aWxsIGJlIHZpc2libGUuLi4gIGUuZy4sIGV4Y2VwdGluZyAnY29sb3InIHdpbGwgc3RpbGwgbGV0ICctd2Via2l0LXRleHQtZmlsbC1jb2xvcicgdGhyb3VnaCwgd2hpY2ggd2lsbCBpbiBmYWN0IGNvbG9yIHRoZSB0ZXh0XG4gICAgaWYgKGV4Y2VwdCAmJiBleGNlcHQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGV4Y2VwdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIG5hbWUgPSBleGNlcHRbaV07XG4gICAgICAgICAgICBkZWxldGUgcHJvZHVjdFtuYW1lXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBvbmUgd2F5IG91dCBzbyB3ZSBjYW4gcHJvY2VzcyBibGFja2xpc3QgaW4gb25lIHNwb3RcbiAgICByZXR1cm4gcHJvZHVjdDtcblxufTtcblxuLy8gc3VnYXIgLSBzb3VyY2UgaXMgdGhlIHNlbGVjdG9yLCBkb20gZWxlbWVudCBvciBqUXVlcnkgaW5zdGFuY2UgdG8gY29weSBmcm9tIC0gb25seSBhbmQgZXhjZXB0IGFyZSBvcHRpb25hbFxuJC5mbi5jb3B5Q1NTID0gZnVuY3Rpb24oc291cmNlLCBvbmx5LCBleGNlcHQpIHtcbiAgICB2YXIgc3R5bGVzID0gc291cmNlLmdldFN0eWxlcyhvbmx5LCBleGNlcHQpO1xuICAgIHRoaXMuY3NzKHN0eWxlcyk7XG4gICAgXG4gICAgcmV0dXJuIHRoaXM7XG59OyIsIi8vIEJyaW5nIGluIGJ1aWxkIGNvbmZpZyBvcHRpb25zXG5sZXQgbWV0YWNvbmZpZyA9IHJlcXVpcmUoXCIuLi9jb25maWcuanNvblwiKTtcblxuY2xhc3MgUHJlZmVyZW5jZU1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgfVxuXG4gICAgR2V0SlNPTihjYWxsYmFjayl7XG5cbiAgICAgICAgLy9sZXQgbG9jID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuICAgICAgICAvL2xldCBkaXIgPSBsb2Muc3Vic3RyaW5nKDAsIGxvYy5sYXN0SW5kZXhPZignLycpKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBkaXIgPSBcIi4vZGlzdC9cIjtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhkaXIgKyBtZXRhY29uZmlnLmNvbmZpZ0ZpbGUpO1xuXG4gICAgICAgIGlmKHRoaXMuY2FjaGVkSlNPTiAhPSBudWxsKXtcbiAgICAgICAgICAgIGNhbGxiYWNrKHRoaXMuY2FjaGVkKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBkaXIgKyBtZXRhY29uZmlnLmNvbmZpZ0ZpbGUsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpPT57XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FjaGVkSlNPTiA9IGRhdGE7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHRoaXMuY2FjaGVkSlNPTik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH1cblxufVxuXG5leHBvcnQgbGV0IHByZWZlcmVuY2VzID0gbmV3IFByZWZlcmVuY2VNYW5hZ2VyKCk7IiwiLyoqXG4gKiBSZXR1cm5zIGZhbHNlIGlmIHJ1bm5pbmcgb24gYW4gdW5zdXBwb3J0ZWQgcGxhdGZvcm0gb3IgbWlzc2luZyBqUXVlcnksIG90aGVyd2lzZSB0cnVlLlxuICogXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBWZXJpZnlSZXF1aXJlbWVudHMoKSB7XG4gICAgXG4gICAgLy8gU3RvcCBydW5uaW5nIGlmIHdlJ3JlIG9uIGFuIHVuc3VwcG9ydGVkIHBsYXRmb3JtIChtb2JpbGUgZm9yIG5vdylcbiAgICAvLyBpZiggL0FuZHJvaWR8d2ViT1N8aVBob25lfGlQYWR8aVBvZHxCbGFja0JlcnJ5fElFTW9iaWxlfE9wZXJhIE1pbmkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICkge1xuICAgIC8vICAgICBjb25zb2xlLmVycm9yKFwiUGxhdGZvcm0gaXMgdW5zdXBwb3J0ZWQhXCIpO1xuICAgIC8vICAgICAvL2xldCB1bnN1cHBvcnRlZERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgLy8gICAgIC8vdW5zdXBwb3J0ZWREaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJZb3VyIHBsYXRmb3JtIGlzIHVuc3VwcG9ydGVkIVwiKSk7XG4gICAgLy8gICAgIC8vZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh1bnN1cHBvcnRlZERpdik7XG4gICAgLy8gICAgIHJldHVybiBmYWxzZTtcbiAgICAvLyB9XG5cbiAgICAvLyBDaGVjayBpZiB3ZSBkb24ndCBoYXZlIGpRdWVyeSBsb2FkZWRcbiAgICBpZighd2luZG93LmpRdWVyeSl7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJKUXVlcnkgbXVzdCBiZSBwcmVzZW50IVwiKTtcbiAgICAgICAgLy9sZXQgdW5zdXBwb3J0ZWREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAvL3Vuc3VwcG9ydGVkRGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiWW91ciBwbGF0Zm9ybSBpcyB1bnN1cHBvcnRlZCFcIikpO1xuICAgICAgICAvL2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodW5zdXBwb3J0ZWREaXYpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gICAgXG59IiwiXG4vKipcbiAqIEVzY2FwZXMgdGhlIHN0cmluZyBzbyBpdCBjYW4gZW1iZWQgZGlyZWN0bHkgaW4gYW4gSFRNTCBkb2N1bWVudC5cbiAqL1xuLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTIwMzQzMzRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdHJpbmcucHJvdG90eXBlLCAnZXNjYXBlSFRNTCcsIHtcbiAgICB2YWx1ZSgpIHtcbiAgICAgICAgdmFyIGVudGl0eU1hcCA9IHtcbiAgICAgICAgICAgICcmJzogJyZhbXA7JywgJzwnOiAnJmx0OycsICc+JzogJyZndDsnLCAnXCInOiAnJnF1b3Q7JyxcbiAgICAgICAgICAgIFwiJ1wiOiAnJiMzOTsnLCAnLyc6ICcmI3gyRjsnLCAnYCc6ICcmI3g2MDsnLCAnPSc6ICcmI3gzRDsnXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBTdHJpbmcodGhpcykucmVwbGFjZSgvWyY8PlwiJ2A9XFwvXS9nLCBmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgcmV0dXJuIGVudGl0eU1hcFtzXTtcbiAgICAgICAgfSk7XG4gICAgfVxufSk7IiwiLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzQ4NDEwMjZcbmZ1bmN0aW9uIEdldEZvcm1hdHRlZFRpbWUodGltZUluU2Vjb25kcyl7XG4gICAgaWYoaXNOYU4odGltZUluU2Vjb25kcykpIHJldHVybiAwO1xuICAgIGxldCB0aW1lID0gdGltZUluU2Vjb25kcyB8IDA7IC8vVHJ1bmNhdGUgdG8gaW50ZWdlclxuICAgIGxldCBob3VycyAgID0gTWF0aC5mbG9vcih0aW1lIC8gMzYwMCkgJSAyNFxuICAgIGxldCBtaW51dGVzID0gTWF0aC5mbG9vcih0aW1lIC8gNjApICUgNjBcbiAgICBsZXQgc2Vjb25kcyA9IHRpbWUgJSA2MFxuICAgIGxldCBmb3JtYXR0ZWQgPSBbaG91cnMsbWludXRlcyxzZWNvbmRzXVxuICAgICAgICAubWFwKHYgPT4gdiA8IDEwID8gXCIwXCIgKyB2IDogdilcbiAgICAgICAgLmZpbHRlcigodixpKSA9PiB2ICE9PSBcIjAwXCIgfHwgaSA+IDApXG4gICAgICAgIC5qb2luKFwiOlwiKVxuXG4gICAgaWYgKGZvcm1hdHRlZC5jaGFyQXQoMCkgPT0gXCIwXCIpIHtcbiAgICAgICAgZm9ybWF0dGVkID0gZm9ybWF0dGVkLnN1YnN0cigxKTtcbiAgICB9XG5cbiAgICBsZXQgbXMgPSAodGltZUluU2Vjb25kcyAlIDEpLnRvRml4ZWQoMik7XG4gICAgZm9ybWF0dGVkICs9IG1zLnRvU3RyaW5nKCkuc3Vic3RyKDEpO1xuXG4gICAgcmV0dXJuIGZvcm1hdHRlZDtcbn1cblxuLy8gRnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS85NjQwNDE3LzcxMzg3OTJcbmZ1bmN0aW9uIEdldFNlY29uZHNGcm9tSE1TKGhtcyl7XG4gICAgbGV0IHBhcnRzID0gaG1zLnNwbGl0KCcuJyk7XG4gICAgbGV0IG1zID0gXCIwXCI7XG4gICAgaWYocGFydHMubGVuZ3RoID4gMSkgbXMgPSAnLicrcGFydHNbMV07XG5cbiAgICBsZXQgcCA9IHBhcnRzWzBdLnNwbGl0KCc6JyksXG4gICAgICAgIHMgPSAwLCBtID0gMTtcblxuICAgIHdoaWxlIChwLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcyArPSBtICogcGFyc2VJbnQocC5wb3AoKSwgMTApO1xuICAgICAgICBtICo9IDYwO1xuICAgIH1cblxuICAgIHMgKz0gcGFyc2VGbG9hdChtcyk7XG4gICAgcmV0dXJuIHM7XG59XG5cbmV4cG9ydCB7IEdldEZvcm1hdHRlZFRpbWUsIEdldFNlY29uZHNGcm9tSE1TIH07IiwiLyoqXG4gKiBVc2UgdGhpcyBmaWxlIHRvIGltcG9ydCB3aGF0IHlvdSBuZWVkIGZyb20gdGhlIGJ1bmRsZWQgbnBtIG1vZHVsZXMuXG4gKi9cblxuLy8gTXVzdCBpbXBvcnQgZnJvbSBub2RlX21vZHVsZXMgZm9sZGVyIG9yIGl0IHdvbid0IHNlZSB0aGUgc2hpbW1lZCBqcXVlcnkgaW5zdGFuY2Vcbi8vIFJlbW92ZWQgZnJvbSBoZXJlIGJlY2F1c2UgdGhleSB3ZXJlbid0IGJlaW5nIGxvYWRlZCBpbiB0aGUgcmlnaHQgb3JkZXIgLSBKUEJcbi8vIGltcG9ydCAnLi4vbm9kZV9tb2R1bGVzL3NlbGVjdDIvZGlzdC9qcy9zZWxlY3QyLmpzJztcbi8vIGltcG9ydCBcIi4uL25vZGVfbW9kdWxlcy9zZWxlY3QyL2Rpc3QvY3NzL3NlbGVjdDIuY3NzXCI7XG5cbmltcG9ydCBcInF0aXAyXCI7XG4vL3JlcXVpcmUoXCIuLi9ub2RlX21vZHVsZXMvcXRpcDIvZGlzdC9qcXVlcnkucXRpcC5taW4uanNcIik7XG4vL2ltcG9ydCBcIi4uL25vZGVfbW9kdWxlcy9xdGlwMi9kaXN0L2pxdWVyeS5xdGlwLm1pbi5jc3NcIjtcblxuaW1wb3J0IFwiY2xpcC1wYXRoLXBvbHlnb25cIjtcblxuLy9sZXQgc2NyZWVuZnVsbCA9IHJlcXVpcmUoJ3NjcmVlbmZ1bGwnKTtcbi8vaW1wb3J0IHNjcmVlbmZ1bGwgZnJvbSBcInNjcmVlbmZ1bGxcIjtcblxuLy8gQ0ROIHJlc291cmNlc1xuLy8gRm9udC1Bd2Vzb21lXG4vLyQoXCJoZWFkXCIpLmFwcGVuZCgkKFwiPHNjcmlwdCBzcmM9J2h0dHBzOi8vdXNlLmZvbnRhd2Vzb21lLmNvbS9hNzAzZTJlNWJmLmpzJz48L3NjcmlwdD5cIikpOyIsImltcG9ydCB7IEdldEZvcm1hdHRlZFRpbWUgfSBmcm9tIFwiLi4vdXRpbHMvdGltZS5qc1wiO1xuXG5jbGFzcyBTZWVrYmFyVG9vbHRpcCB7XG4gICAgY29uc3RydWN0b3IoJHBhcmVudCwgcGxheWVyKXtcbiAgICAgICAgdGhpcy4kcGFyZW50ID0gJHBhcmVudDtcbiAgICAgICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG5cbiAgICAgICAgdGhpcy4kdG9vbHRpcCA9ICQoXCI8ZGl2IGNsYXNzPSd3YWxkb3JmLXNlZWtiYXItdG9vbHRpcCc+PC9kaXY+XCIpLmFwcGVuZFRvKCRwYXJlbnQpO1xuICAgICAgICB0aGlzLnRleHQgPSBcIlRlc3RcIjtcbiAgICAgICAgdGhpcy4kY29udGVudCA9ICQoXCI8cD5cIiArIHRoaXMudGV4dCArIFwiPC9wPlwiKS5hcHBlbmRUbyh0aGlzLiR0b29sdGlwKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaG92ZXJPZmZzZXQgPSAtMTA7XG4gICAgICAgIHRoaXMucGFkZGluZyA9IDU7XG4gICAgICAgIFxuICAgICAgICB0aGlzLkhpZGUoKTtcblxuICAgICAgICB0aGlzLiRwYXJlbnQubW91c2Vtb3ZlKChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5TaG93KCk7XG5cbiAgICAgICAgICAgIC8vQWRkIGFuZCB1cGRhdGUgdG9vbHRpcCBvbiBtb3VzZSBtb3ZlbWVudCB0byBzaG93IHdoZXJlIHRoZSBtb3VzZSBpcyBob3ZlcmluZy5cbiAgICAgICAgICAgIGxldCBtb3VzZVggPSBldmVudC5wYWdlWCAtIHBsYXllci4kY29udGFpbmVyLm9mZnNldCgpLmxlZnQ7XG4gICAgICAgICAgICBsZXQgcGVyY2VudCA9IG1vdXNlWCAvIHRoaXMuJHBhcmVudC53aWR0aCgpO1xuICAgICAgICAgICAgbGV0IHRpbWVBdEN1cnNvciA9IHBlcmNlbnQgKiBwbGF5ZXIudmlkZW9FbGVtZW50LmR1cmF0aW9uO1xuICAgICAgICAgICAgdGhpcy5Nb3ZlKG1vdXNlWCwgMCk7XG4gICAgICAgICAgICB0aGlzLlNldENvbnRlbnQoR2V0Rm9ybWF0dGVkVGltZSh0aW1lQXRDdXJzb3IpKTtcblxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLiRwYXJlbnQubW91c2VvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5IaWRlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgTW92ZSh4LCB5KSB7XG5cbiAgICAgICAgLy8gR2V0IGluaXRpYWwgcG9zaXRpb25zXG4gICAgICAgIGxldCBsZWZ0ID0geCAtICh0aGlzLkdldFdpZHRoKCkgLyAyKTtcbiAgICAgICAgbGV0IHRvcCA9IHkgLSAodGhpcy5HZXRIZWlnaHQoKSkgKyB0aGlzLmhvdmVyT2Zmc2V0O1xuICAgICAgICBcbiAgICAgICAgLy8gT2Zmc2V0IGlmIG5lY2Vzc2FyeSAoa2VlcCBvbi1zY3JlZW4pXG4gICAgICAgIGlmIChsZWZ0IC0gdGhpcy5wYWRkaW5nIDwgMCkge1xuICAgICAgICAgICAgbGVmdCA9IHRoaXMucGFkZGluZztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCAobGVmdCArIHRoaXMucGFkZGluZyArIHRoaXMuR2V0V2lkdGgoKSkgPiB0aGlzLiRwYXJlbnQud2lkdGgoKSApIHtcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLiRwYXJlbnQud2lkdGgoKSAtIHRoaXMuR2V0V2lkdGgoKSAtIHRoaXMucGFkZGluZztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQXBwbHkgcG9zaXRpb25zXG4gICAgICAgIHRoaXMuJHRvb2x0aXAuY3NzKHtcbiAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgbGVmdDogbGVmdFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBHZXRXaWR0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJHRvb2x0aXAud2lkdGgoKTtcbiAgICB9XG5cbiAgICBHZXRIZWlnaHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiR0b29sdGlwLmhlaWdodCgpO1xuICAgIH1cblxuICAgIFNob3coKSB7XG4gICAgICAgIHRoaXMuJHRvb2x0aXAubWFrZVZpc2libGUodHJ1ZSk7XG4gICAgfVxuXG4gICAgSGlkZSgpIHtcbiAgICAgICAgdGhpcy4kdG9vbHRpcC5tYWtlVmlzaWJsZShmYWxzZSk7XG4gICAgfVxuXG4gICAgU2V0Q29udGVudCh0ZXh0KSB7XG4gICAgICAgIC8vY29uc29sZS5sb2codGV4dCk7XG4gICAgICAgIHRoaXMuJGNvbnRlbnQudGV4dCh0ZXh0KTtcbiAgICB9XG5cblxuXG59XG5cbmV4cG9ydCB7IFNlZWtiYXJUb29sdGlwIH07IiwiaW1wb3J0IHsgR2V0Rm9ybWF0dGVkVGltZSB9IGZyb20gXCIuLi91dGlscy90aW1lLmpzXCI7XG5pbXBvcnQgeyBTZWVrYmFyVG9vbHRpcCB9IGZyb20gXCIuL3NlZWtiYXItdG9vbHRpcC5qc1wiO1xuXG5jbGFzcyBWaWRlb1BsYXllckJhciB7XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXIpe1xuICAgICAgICB0aGlzLnBsYXllciA9IHBsYXllcjsgXG4gICAgICAgIHRoaXMuJGNvbnRhaW5lciA9ICQoXCI8ZGl2IGNsYXNzPSd3YWxkb3JmLXBsYXllci10b29sYmFyIGZsZXgtdG9vbGJhcic+PC9kaXY+XCIpLmFwcGVuZFRvKHBsYXllci4kY29udGFpbmVyKTtcblxuICAgICAgICB0aGlzLlBvcHVsYXRlRWxlbWVudHMoKTtcblxuICAgICAgICB0aGlzLnNjcnViYmluZ1RpbWVTbGlkZXIgPSBmYWxzZTtcbiAgICAgICAgdGhpcy52aWRlb1BsYXlpbmdCZWZvcmVUaW1lU2NydWIgPSBmYWxzZTtcblxuICAgICAgICAvLyBIb29rIHVwIHRvIGV2ZW50cyBmcm9tIHZpZGVvIHBsYXllclxuICAgICAgICB0aGlzLnBsYXllci4kY29udGFpbmVyLm9uKFwiT25WaXNpYmlsaXR5Q2hhbmdlXCIsIFxuICAgICAgICAgICAgKGV2ZW50LCBpc1Zpc2libGUsIGR1cmF0aW9uKSA9PiB0aGlzLlNldFZpc2libGUoaXNWaXNpYmxlLCBkdXJhdGlvbilcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLnBsYXllci4kY29udGFpbmVyLm9uKFwiT25QbGF5U3RhdGVDaGFuZ2VcIiwgXG4gICAgICAgICAgICAoZXZlbnQsIHBsYXlpbmcpID0+IHRoaXMuT25QbGF5U3RhdGVDaGFuZ2UocGxheWluZylcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLnBsYXllci4kY29udGFpbmVyLm9uKFwiT25UaW1lVXBkYXRlXCIsIFxuICAgICAgICAgICAgKGV2ZW50LCB0aW1lKSA9PiB0aGlzLk9uVGltZVVwZGF0ZSh0aW1lKVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMucGxheWVyLiRjb250YWluZXIub24oXCJPbk11dGVTdGF0ZUNoYW5nZVwiLCBcbiAgICAgICAgICAgIChldmVudCwgbXV0ZWQpID0+IHRoaXMuT25NdXRlU3RhdGVDaGFuZ2UobXV0ZWQpXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5wbGF5ZXIuJGNvbnRhaW5lci5vbihcIk9uVm9sdW1lQ2hhbmdlXCIsIFxuICAgICAgICAgICAgKGV2ZW50LCB2b2x1bWUpID0+IHRoaXMuT25Wb2x1bWVDaGFuZ2Uodm9sdW1lKVxuICAgICAgICApO1xuICAgICAgICBcbiAgICB9XG5cbiAgICBQb3B1bGF0ZUVsZW1lbnRzKCl7XG5cbiAgICAgICAgdGhpcy4kc2Vla0JhciA9ICQoXCI8ZGl2IGlkPSdzZWVrLWJhcic+PGRpdiBpZD0nc2Vlay1oYW5kbGUnIGNsYXNzPSd1aS1zbGlkZXItaGFuZGxlJz48L2Rpdj48L2Rpdj5cIik7XG4gICAgICAgIGxldCAkc2Vla1NsaWRlciA9IHRoaXMuJHNlZWtCYXIuc2xpZGVyKHtcbiAgICAgICAgICAgIG1pbjogMC4wLFxuICAgICAgICAgICAgbWF4OiAxLjAsXG4gICAgICAgICAgICBzdGVwOiAwLjAwMVxuICAgICAgICB9KTtcbiAgICAgICAgJHNlZWtTbGlkZXIub24oXCJzbGlkZVwiLCAoKSA9PiB0aGlzLlVwZGF0ZVZpZGVvVGltZSgpKTtcbiAgICAgICAgJHNlZWtTbGlkZXIub24oXCJzbGlkZXN0YXJ0XCIsICgpID0+IHRoaXMuVGltZURyYWdTdGFydGVkKCkpO1xuICAgICAgICAkc2Vla1NsaWRlci5vbihcInNsaWRlc3RvcFwiLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLlRpbWVEcmFnRmluaXNoZWQoKTtcbiAgICAgICAgICAgIHRoaXMuVXBkYXRlVmlkZW9UaW1lKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKHRoaXMuJHNlZWtCYXIpO1xuICAgICAgICB0aGlzLnNlZWtiYXJUb29sdGlwID0gbmV3IFNlZWtiYXJUb29sdGlwKHRoaXMuJHNlZWtCYXIsIHRoaXMucGxheWVyKTtcblxuICAgICAgICB0aGlzLiRzZWVrUHJvZ3Jlc3MgPSAkKFwiPGRpdiBpZD0nc2Vlay1maWxsJz48L2Rpdj5cIik7XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmQodGhpcy4kc2Vla1Byb2dyZXNzKTtcblxuICAgICAgICAvL0p1bXAgQmFjayBidXR0b25cbiAgICAgICAgdGhpcy4kanVtcEJhY2tCdXR0b24gPSAkKFwiPGJ1dHRvbj5KdW1wIEJhY2s8L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgIGljb246IFwiZmEgZmEtZmFzdC1iYWNrd2FyZFwiLFxuICAgICAgICAgICAgc2hvd0xhYmVsOiBmYWxzZVxuICAgICAgICB9KS5jbGljaygoKSA9PiB0aGlzLnBsYXllci5KdW1wQmFja3dhcmQoKSk7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJGp1bXBCYWNrQnV0dG9uLCAtOCk7ICAgXG4gICAgICAgIFxuICAgICAgICAvL051ZGdlIEJhY2sgYnV0dG9uXG4gICAgICAgIHRoaXMuJG51ZGdlQmFja0J1dHRvbiA9ICQoXCI8YnV0dG9uPk51ZGdlIEJhY2s8L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgIGljb246IFwiZmEgZmEtc3RlcC1iYWNrd2FyZFwiLFxuICAgICAgICAgICAgc2hvd0xhYmVsOiBmYWxzZVxuICAgICAgICB9KS5jbGljaygoKSA9PiB0aGlzLnBsYXllci5TdGVwQmFja3dhcmQoKSk7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJG51ZGdlQmFja0J1dHRvbiwgLTcpO1xuXG4gICAgICAgIC8vIFBsYXkgYnV0dG9uXG4gICAgICAgIHRoaXMuJHBsYXlCdXR0b24gPSAkKFwiPGJ1dHRvbj5QbGF5PC9idXR0b24+XCIpLmJ1dHRvbih7XG4gICAgICAgICAgICBpY29uOiBcImZhIGZhLXBsYXlcIixcbiAgICAgICAgICAgIHNob3dMYWJlbDogZmFsc2VcbiAgICAgICAgfSkuY2xpY2soKCkgPT4gdGhpcy5wbGF5ZXIuVG9nZ2xlUGxheVN0YXRlKCkpO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyRWxlbWVudCh0aGlzLiRwbGF5QnV0dG9uLCAtNik7XG5cbiAgICAgICAgLy9OdWRnZSBidXR0b25cbiAgICAgICAgdGhpcy4kbnVkZ2VCdXR0b24gPSAkKFwiPGJ1dHRvbj5OdWRnZTwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgaWNvbjogXCJmYSBmYS1zdGVwLWZvcndhcmRcIixcbiAgICAgICAgICAgIHNob3dMYWJlbDogZmFsc2VcbiAgICAgICAgfSkuY2xpY2soKCkgPT4gdGhpcy5wbGF5ZXIuU3RlcEZvcndhcmQoKSk7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJG51ZGdlQnV0dG9uLCAtNSk7ICAgXG4gICAgICAgIFxuICAgICAgICAvL0p1bXAgYnV0dG9uXG4gICAgICAgIHRoaXMuJGp1bXBCdXR0b24gPSAkKFwiPGJ1dHRvbj5OdWRnZTwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgaWNvbjogXCJmYSBmYS1mYXN0LWZvcndhcmRcIixcbiAgICAgICAgICAgIHNob3dMYWJlbDogZmFsc2VcbiAgICAgICAgfSkuY2xpY2soKCkgPT4gdGhpcy5wbGF5ZXIuSnVtcEZvcndhcmQoKSk7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJGp1bXBCdXR0b24sIC00KTsgICAgICAgICAgXG5cbiAgICAgICAgLy8gVGltZSB0ZXh0XG4gICAgICAgIGxldCB6ZXJvID0gR2V0Rm9ybWF0dGVkVGltZSgwLjAwMCk7XG4gICAgICAgIHRoaXMuJHRpbWVUZXh0ID0gJChcIjxwPiR7emVyb30vJHt6ZXJvfTwvcD5cIik7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJHRpbWVUZXh0LCAtMyk7XG5cbiAgICAgICAgLy8gTXV0ZSBidXR0b25cbiAgICAgICAgdGhpcy4kbXV0ZUJ1dHRvbiA9ICQoXCI8YnV0dG9uPk11dGU8L2J1dHRvbj5cIikuYnV0dG9uKHtcbiAgICAgICAgICAgIGljb246IFwiZmEgZmEtdm9sdW1lLXVwXCIsXG4gICAgICAgICAgICBzaG93TGFiZWw6IGZhbHNlLFxuICAgICAgICB9KS5jbGljaygoKSA9PiB0aGlzLnBsYXllci5Ub2dnbGVNdXRlU3RhdGUoKSk7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJG11dGVCdXR0b24sIC0yKTtcblxuICAgICAgICAvLyBWb2x1bWUgYmFyXG4gICAgICAgIHRoaXMuJHZvbHVtZUJhciA9ICQoXCI8ZGl2IGlkPSd2b2x1bWUtYmFyJz48ZGl2IGlkPSd2b2x1bWUtaGFuZGxlJyBjbGFzcz0ndWktc2xpZGVyLWhhbmRsZSc+PC9kaXY+PC9kaXY+XCIpO1xuICAgICAgICB0aGlzLiR2b2x1bWVCYXIuc2xpZGVyKHtcbiAgICAgICAgICAgIHJhbmdlOiBcIm1pblwiLFxuICAgICAgICAgICAgbWF4OiAxLjAsXG4gICAgICAgICAgICB2YWx1ZTogMS4wLFxuICAgICAgICAgICAgc3RlcDogMC4wNVxuICAgICAgICB9KS5vbihcInNsaWRlXCIsIChldmVudCwgdWkpID0+IHRoaXMucGxheWVyLlNldFZvbHVtZSh1aS52YWx1ZSkpO1xuICAgICAgICB0aGlzLlJlZ2lzdGVyRWxlbWVudCh0aGlzLiR2b2x1bWVCYXIsIC0xKTtcblxuICAgICAgICAvLyBGdWxsc2NyZWVuIGJ1dHRvblxuICAgICAgICB0aGlzLiRmdWxsU2NyZWVuQnV0dG9uID0gJChcIjxidXR0b24+RnVsbHNjcmVlbjwvYnV0dG9uPlwiKS5idXR0b24oe1xuICAgICAgICAgICAgaWNvbjogXCJmYSBmYS1hcnJvd3MtYWx0XCIsXG4gICAgICAgICAgICBzaG93TGFiZWw6IGZhbHNlXG4gICAgICAgIH0pLmNsaWNrKCgpID0+IHRoaXMucGxheWVyLlRvZ2dsZUZ1bGxzY3JlZW4oKSk7XG4gICAgICAgIHRoaXMuUmVnaXN0ZXJFbGVtZW50KHRoaXMuJGZ1bGxTY3JlZW5CdXR0b24sIDk5OSwgJ2ZsZXgtZW5kJyk7XG4gICAgICAgIFxuICAgICAgICAvLyBDcmVhdGUgZW1wdHkgZWxlbWVudCBiZXR3ZWVuIGxlZnQgZmxvYXRpbmcgYW5kIHJpZ2h0IGZsb2F0aW5nIHRvb2xiYXIgaXRlbXMgdG8gc3BhY2UgdGhlbSBvdXQgcHJvcGVybHlcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZCgkKFwiPGRpdj48L2Rpdj5cIikuY3NzKFwiZmxleC1ncm93XCIsIDEpLmNzcyhcIm9yZGVyXCIsIDApKTtcblxuICAgICAgICAvL0luaXRpYWxpemUgY29udHJvbHNcbiAgICAgICAgdGhpcy5PblRpbWVVcGRhdGUoKTtcbiAgICAgICAgdGhpcy4kdm9sdW1lQmFyLnNsaWRlcihcInZhbHVlXCIsIHRoaXMucGxheWVyLnZpZGVvRWxlbWVudC52b2x1bWUpO1xuICAgIH1cblxuICAgIFJlZ2lzdGVyRWxlbWVudCgkZWxlbWVudCwgb3JkZXIsIGp1c3RpZmljYXRpb24gPSAnZmxleC1zdGFydCcpe1xuICAgICAgICAkZWxlbWVudC5jc3MoJ29yZGVyJywgb3JkZXIpO1xuICAgICAgICAkZWxlbWVudC5jc3MoJ2FsaWduLXNlbGYnLCBqdXN0aWZpY2F0aW9uKTtcbiAgICAgICAgLy8gU2V0cyBncm93IFtzaHJpbmtdIFtiYXNpc11cbiAgICAgICAgLy8kZWxlbWVudC5jc3MoJ2ZsZXgnLCAnMCAwIGF1dG8nKTtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZCgkZWxlbWVudCk7XG4gICAgfVxuXG4gICAgU2V0VmlzaWJsZShpc1Zpc2libGUsIGR1cmF0aW9uKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhpc1Zpc2libGUgKyBcIiBcIiArIGR1cmF0aW9uKTtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLnN0b3AodHJ1ZSwgdHJ1ZSk7XG4gICAgICAgIGlmKGlzVmlzaWJsZSl7XG4gICAgICAgICAgICB0aGlzLiRjb250YWluZXIuZmFkZVRvKGR1cmF0aW9uLCAxLjAsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiRjb250YWluZXIubWFrZVZpc2libGUodHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJGNvbnRhaW5lci5mYWRlVG8oZHVyYXRpb24sIDAuMCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuJGNvbnRhaW5lci5tYWtlVmlzaWJsZShmYWxzZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIFVwZGF0ZVZpZGVvVGltZSgpe1xuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIG5ldyB0aW1lXG4gICAgICAgIGxldCB0aW1lID0gdGhpcy5wbGF5ZXIudmlkZW9FbGVtZW50LmR1cmF0aW9uICogdGhpcy4kc2Vla0Jhci5zbGlkZXIoXCJ2YWx1ZVwiKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuZW5kVGltZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBsYXllci52aWRlb0VsZW1lbnQuY3VycmVudFRpbWUgPSB0aW1lO1xuICAgIH1cblxuICAgIFRpbWVEcmFnU3RhcnRlZCgpe1xuICAgICAgICB0aGlzLnZpZGVvUGxheWluZ0JlZm9yZVRpbWVTY3J1YiA9ICF0aGlzLnBsYXllci52aWRlb0VsZW1lbnQucGF1c2VkO1xuICAgICAgICB0aGlzLnBsYXllci52aWRlb0VsZW1lbnQucGF1c2UoKTtcbiAgICB9XG5cbiAgICBUaW1lRHJhZ0ZpbmlzaGVkKCl7XG4gICAgICAgIC8vIFN0YXJ0IHBsYXlpbmcgdGhlIHZpZGVvIGFnYWluIGlmIGl0IHdhcyBwbGF5aW5nIGJlZm9yZSB0aGUgc2NydWIgc3RhcnRlZFxuICAgICAgICBpZiAodGhpcy52aWRlb1BsYXlpbmdCZWZvcmVUaW1lU2NydWIpe1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIudmlkZW9FbGVtZW50LnBsYXkoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vL1xuICAgIC8vLyAtLS0tLSBFdmVudCBMaXN0ZW5lcnMgLS0tLS1cbiAgICAvLy8gVGhlIGZvbGxvd2luZyB1cGRhdGUgdGhlIHZpc3VhbCBzdGF0ZSBvZiB0aGUgYmFyXG4gICAgLy8vIHVwb24gY2hhbmdlcyB0byB0aGUgdmlkZW8gcGxheWVyLiBUaGVzZSBhcmUgaG9va2VkXG4gICAgLy8vIHVwIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICAvLy9cblxuICAgIE9uUGxheVN0YXRlQ2hhbmdlKHBsYXlpbmcpe1xuICAgICAgICB0aGlzLiRwbGF5QnV0dG9uLmJ1dHRvbihcIm9wdGlvblwiLCB7XG4gICAgICAgICAgICBpY29uOiBwbGF5aW5nID8gXCJmYSBmYS1wYXVzZVwiIDogXCJmYSBmYS1wbGF5XCJcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgT25UaW1lVXBkYXRlKHRpbWUpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwidmlkZW8tcGxheWVyLWJhci5qczoxODUgT25UaW1lVXBkYXRlIGlzIGNhbGxlZFwiKTtcbiAgICAgICAgbGV0IGR1cmF0aW9uID0gdGhpcy5wbGF5ZXIudmlkZW9FbGVtZW50LmR1cmF0aW9uO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgdGltZSB0ZXh0XG4gICAgICAgIHRoaXMuJHRpbWVUZXh0LnRleHQoR2V0Rm9ybWF0dGVkVGltZSh0aW1lKSArIFwiL1wiICsgR2V0Rm9ybWF0dGVkVGltZShkdXJhdGlvbikpO1xuXG4gICAgICAgIGxldCBwcm9ncmVzcyA9IHRpbWUgLyBkdXJhdGlvbjtcbiAgICAgICAgdGhpcy4kc2Vla1Byb2dyZXNzLndpZHRoKChwcm9ncmVzcyAqIDEwMCkudG9TdHJpbmcoKSArIFwiJVwiKTtcbiAgICB9XG5cbiAgICBPblZvbHVtZUNoYW5nZSh2b2x1bWUpe1xuICAgICAgICB0aGlzLiR2b2x1bWVCYXIuc2xpZGVyKFwidmFsdWVcIiwgdm9sdW1lKTtcbiAgICB9XG5cbiAgICBPbk11dGVTdGF0ZUNoYW5nZShtdXRlZCl7XG4gICAgICAgIHRoaXMuJG11dGVCdXR0b24uYnV0dG9uKFwib3B0aW9uXCIsIHtcbiAgICAgICAgICAgIGljb246IG11dGVkID8gXCJmYSBmYS12b2x1bWUtdXBcIiA6IFwiZmEgZmEtdm9sdW1lLW9mZlwiXG4gICAgICAgIH0pO1xuICAgIH1cblxufVxuXG5leHBvcnQgeyBWaWRlb1BsYXllckJhciB9IiwiaW1wb3J0IHsgVmlkZW9QbGF5ZXJCYXIgfSBmcm9tIFwiLi92aWRlby1wbGF5ZXItYmFyLmpzXCI7XG5pbXBvcnQgeyBWaWRlb0Fubm90YXRvciB9IGZyb20gXCIuLi9hbm5vdGF0b3IvYW5ub3RhdG9yLmpzXCI7XG4vL2ltcG9ydCAqIGFzIHNjcmVlbmZ1bGwgZnJvbSBcInNjcmVlbmZ1bGxcIjtcblxuLy9pbXBvcnQgJ2pxdWVyeS11aS9kaXN0L2pxdWVyeS11aS5qcyc7XG5sZXQgc2NyZWVuZnVsbCA9IHJlcXVpcmUoJ3NjcmVlbmZ1bGwnKTtcblxuY2xhc3MgQW5ub3RhdG9yVmlkZW9QbGF5ZXIge1xuICAgIGNvbnN0cnVjdG9yKCR2aWRlbywgYW5ub3RhdG9yQXJncyl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiW0Fubm90YXRvclZpZGVvUGxheWVyXSBDcmVhdGluZyBBbm5vdGF0b3JWaWRlb1BsYXllciBmb3IgdmlkZW8uLi5cIik7XG4gICAgICAgIHRoaXMuJHZpZGVvID0gJHZpZGVvO1xuICAgICAgICB0aGlzLnZpZGVvRWxlbWVudCA9IHRoaXMuJHZpZGVvLmdldCgwKTtcblxuICAgICAgICAvLyBTdG9yZSB0aGUgb3JpZ2luYWwgc3R5bGluZyBvZiB0aGUgdmlkZW8gZWxlbWVudCBiZWZvcmUgd2UgYWx0ZXIgaXRcbiAgICAgICAgdGhpcy5vcmlnaW5hbFN0eWxlcyA9IHRoaXMuJHZpZGVvLmdldFN0eWxlcyhudWxsLCBbXCJoZWlnaHRcIiwgXCJXZWJraXRUZXh0RmlsbENvbG9yXCIsIFwiY29sb3JcIl0pOyAvL1tcIndpZHRoXCIsIFwidG9wXCIsIFwibGVmdFwiLCBcIm1hcmdpblwiLCBcInBhZGRpbmdcIl1cblxuICAgICAgICB0aGlzLldyYXAoKTtcbiAgICAgICAgdGhpcy5Qb3B1bGF0ZUNvbnRyb2xzKCk7XG4gICAgICAgIHRoaXMuU2V0VmlzaWJsZSh0cnVlKTtcblxuICAgICAgICAvLyBIb29rIHVwIGV2ZW50c1xuICAgICAgICB0aGlzLkhvb2tVcEV2ZW50cygpO1xuXG4gICAgICAgIC8vIFBsYXkgLyBwYXVzZSB0aGUgdmlkZW8gd2hlbiBjbGlja2VkLlxuICAgICAgICB0aGlzLiR2aWRlby5vbihcImNsaWNrXCIsICgpID0+IHRoaXMuVG9nZ2xlUGxheVN0YXRlKCkpO1xuXG4gICAgICAgIHRoaXMuYWxsb3dBdXRvRmFkZSA9IHRydWU7XG4gICAgICAgIC8vLyBJbmFjdGl2aXR5IHRpbWVyIGZvciB0aGUgbW91c2UuXG4gICAgICAgIHRoaXMubW91c2VUaW1lciA9IG51bGw7XG4gICAgICAgIC8vLyBTZXQgdG8gdHJ1ZSBpZiB0aGUgdGltZSBzbGlkZXIgaXMgY3VycmVudGx5IGJlaW5nIGRyYWdnZWQgYnkgdGhlIHVzZXIuXG4gICAgICAgIHRoaXMuZHJhZ2dpbmdUaW1lU2xpZGVyID0gZmFsc2U7XG4gICAgICAgIC8vLyBTZWNvbmRzIGJlZm9yZSB0aGUgVUkgZmFkZXMgZHVlIHRvIG1vdXNlIGluYWN0aXZpdHkuXG4gICAgICAgIHRoaXMuaWRsZVNlY29uZHNCZWZvcmVGYWRlID0gMztcbiAgICAgICAgdGhpcy5mYWRlRHVyYXRpb24gPSAzMDA7XG4gICAgICAgIHRoaXMuZW5kVGltZSA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci5tb3VzZW1vdmUoKCkgPT4gdGhpcy5Pbk1vdXNlTW92ZSgpKTtcbiAgICAgICAgdGhpcy5TZXRBdXRvRmFkZSh0cnVlKTtcblxuICAgICAgICAvLyBJZiBzY3JlZW5mdWxsIGlzIGVuYWJsZWQsIGNyZWF0ZSB0aGUgZXZlbnQgdG8gaGFuZGxlIGl0LlxuICAgICAgICBpZihzY3JlZW5mdWxsICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICBzY3JlZW5mdWxsLm9uY2hhbmdlKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLk9uRnVsbHNjcmVlbkNoYW5nZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuJGNvbnRhaW5lci50cmlnZ2VyKFwiT25GdWxsc2NyZWVuQ2hhbmdlXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnZpZGVvRWxlbWVudC5vbnRpbWV1cGRhdGUgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLk9uVGltZVVwZGF0ZSh0aGlzLnZpZGVvRWxlbWVudC5jdXJyZW50VGltZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy4kY29udGFpbmVyLm9uKFwiT25WaWRlb1JlYWR5XCIsICgpID0+IHtcbiAgICAgICAgICAgIGlmKGFubm90YXRvckFyZ3MuYW5ub3RhdG9yPT1udWxsKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIltBbm5vdGF0b3JWaWRlb1BsYXllcl0gUGxheWVyIHNlbnQgT25WaWRlb1JlYWR5LCBhdHRlbXB0aW5nIHRvIHdyYXAgd2l0aCBhbm5vdGF0b3IuLi5cIik7XG4gICAgICAgICAgICAgICAgLy8gQWRkIGFubm90YXRvciBvbmNlIHZpZGVvIGhhcyBsb2FkZWRcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIltBbm5vdGF0b3JWaWRlb1BsYXllcl0gV3JhcHBpbmcgdmlkZW8gd2l0aCBhbm5vdGF0b3IuLi5cIik7XG4gICAgICAgICAgICAgICAgYW5ub3RhdG9yQXJncy5wbGF5ZXIgPSB0aGlzO1xuICAgICAgICAgICAgICAgIGFubm90YXRvckFyZ3MuYW5ub3RhdG9yID0gbmV3IFZpZGVvQW5ub3RhdG9yKGFubm90YXRvckFyZ3MpO1xuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBhbm5vdGF0b3JBcmdzLmNhbGxiYWNrID09IFwiZnVuY3Rpb25cIikgYW5ub3RhdG9yQXJncy5jYWxsYmFjayhhbm5vdGF0b3JBcmdzLmFubm90YXRvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50Lm9ubG9hZGVkbWV0YWRhdGEgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLiRjb250YWluZXIudHJpZ2dlcihcIk9uVmlkZW9SZWFkeVwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYodGhpcy52aWRlb0VsZW1lbnQuZHVyYXRpb24gIT0gbnVsbCl7XG4gICAgICAgICAgICAvLyBJZiB0aGUgbWV0YWRhdGEgaXMgYWxyZWFkeSBwcmVwYXJlZCwgdGhyb3cgdGhlIGV2ZW50IHNpbmNlXG4gICAgICAgICAgICAvLyBvbmxvYWRlZG1ldGFkYXRhIHdvbid0IGJlIGZpcmVkXG4gICAgICAgICAgICB0aGlzLiRjb250YWluZXIudHJpZ2dlcihcIk9uVmlkZW9SZWFkeVwiKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coXCJbQW5ub3RhdG9yVmlkZW9QbGF5ZXJdIEFubm90YXRvclZpZGVvUGxheWVyIGNyZWF0ZWQgZm9yIHZpZGVvLlwiKTtcbiAgICAgICAgXG4gICAgfVxuXG4gICAgV3JhcCgpe1xuICAgICAgICAvLyBSZW1vdmUgdGhlIGRlZmF1bHQgY29udHJvbHMgZnJvbSB0aGUgdmlkZW9cbiAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQucmVtb3ZlQXR0cmlidXRlKFwiY29udHJvbHNcIik7XG5cbiAgICAgICAgLy8gV3JhcCB0aGUgdmlkZW8gZWxlbWVudCB3aXRoIHRoZSBjb250YWluZXJcbiAgICAgICAgdGhpcy4kY29udGFpbmVyID0gdGhpcy4kdmlkZW8ud3JhcChcIjxkaXYgY2xhc3M9J3dhbGRvcmYtdmlkZW8tcGxheWVyJz48L2Rpdj5cIikucGFyZW50KCk7XG4gICAgICAgIC8vIFJlc2l6ZSBjb250YWluZXIgdG8gZml0IHRoZSBkaW1lbnNpb25zIG9mIHRoZSB2aWRlb1xuICAgICAgICB0aGlzLiRjb250YWluZXIud2lkdGgodGhpcy4kdmlkZW8ud2lkdGgoKSk7XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci5oZWlnaHQodGhpcy4kdmlkZW8uaGVpZ2h0KCkpO1xuICAgIH1cblxuICAgIFBvcHVsYXRlQ29udHJvbHMoKXtcbiAgICAgICAgdGhpcy5jb250cm9sQmFyID0gbmV3IFZpZGVvUGxheWVyQmFyKHRoaXMpO1xuICAgIH1cblxuICAgIFNldFZpc2libGUoaXNWaXNpYmxlLCBkdXJhdGlvbiA9IDApe1xuICAgICAgICB0aGlzLiRjb250YWluZXIudHJpZ2dlcihcIk9uVmlzaWJpbGl0eUNoYW5nZVwiLCBbaXNWaXNpYmxlLCBkdXJhdGlvbl0pO1xuICAgIH1cblxuICAgIEhvb2tVcEV2ZW50cygpe1xuICAgICAgICBcbiAgICB9XG5cbiAgICBUb2dnbGVQbGF5U3RhdGUoKXtcbiAgICAgICAgaWYodGhpcy52aWRlb0VsZW1lbnQucGF1c2VkKXtcbiAgICAgICAgICAgIHRoaXMuUGxheSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5QYXVzZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgU3RlcEZvcndhcmQoKXtcbiAgICAgICAgdmFyIG5ld1RpbWUgPSB0aGlzLnZpZGVvRWxlbWVudC5jdXJyZW50VGltZSArIDAuMTtcbiAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQuY3VycmVudFRpbWUgPSBuZXdUaW1lID4gdGhpcy52aWRlb0VsZW1lbnQuZHVyYXRpb24gPyB0aGlzLnZpZGVvRWxlbWVudC5kdXJhdGlvbiA6IG5ld1RpbWU7XG4gICAgfVxuXG4gICAgSnVtcEZvcndhcmQoKXtcbiAgICAgICAgdmFyIG5ld1RpbWUgPSB0aGlzLnZpZGVvRWxlbWVudC5jdXJyZW50VGltZSArIDE7XG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50LmN1cnJlbnRUaW1lID0gbmV3VGltZSA+IHRoaXMudmlkZW9FbGVtZW50LmR1cmF0aW9uID8gdGhpcy52aWRlb0VsZW1lbnQuZHVyYXRpb24gOiBuZXdUaW1lO1xuICAgIH0gIFxuICAgIFxuICAgIFN0ZXBCYWNrd2FyZCgpe1xuICAgICAgICB2YXIgbmV3VGltZSA9IHRoaXMudmlkZW9FbGVtZW50LmN1cnJlbnRUaW1lIC0gMC4xO1xuICAgICAgICB0aGlzLnZpZGVvRWxlbWVudC5jdXJyZW50VGltZSA9IG5ld1RpbWUgPCAwID8gMCA6IG5ld1RpbWU7XG4gICAgfVxuXG4gICAgSnVtcEJhY2t3YXJkKCl7XG4gICAgICAgIHZhciBuZXdUaW1lID0gdGhpcy52aWRlb0VsZW1lbnQuY3VycmVudFRpbWUgLSAxO1xuICAgICAgICB0aGlzLnZpZGVvRWxlbWVudC5jdXJyZW50VGltZSA9IG5ld1RpbWUgPCAwID8gMCA6IG5ld1RpbWU7XG4gICAgfSAgICAgXG5cbiAgICBQbGF5KCl7XG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50LnBsYXkoKTtcbiAgICAgICAgaWYodGhpcy5lbmRUaW1lKSB0aGlzLmVuZFRpbWUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5TZXRBdXRvRmFkZSh0cnVlKTtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLnRyaWdnZXIoXCJPblBsYXlTdGF0ZUNoYW5nZVwiLCAhdGhpcy52aWRlb0VsZW1lbnQucGF1c2VkKTtcbiAgICB9XG5cbiAgICBQYXVzZSgpe1xuICAgICAgICBpZih0aGlzLmVuZFRpbWUpIHRoaXMuZW5kVGltZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZpZGVvRWxlbWVudC5wYXVzZSgpO1xuICAgICAgICB0aGlzLlNldEF1dG9GYWRlKGZhbHNlKTtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLnRyaWdnZXIoXCJPblBsYXlTdGF0ZUNoYW5nZVwiLCAhdGhpcy52aWRlb0VsZW1lbnQucGF1c2VkKTtcbiAgICB9XG5cbiAgICBUb2dnbGVNdXRlU3RhdGUoKXtcbiAgICAgICAgbGV0IG11dGVkID0gdGhpcy52aWRlb0VsZW1lbnQubXV0ZWQ7XG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50Lm11dGVkID0gIW11dGVkO1xuICAgICAgICB0aGlzLiRjb250YWluZXIudHJpZ2dlcihcIk9uTXV0ZVN0YXRlQ2hhbmdlXCIsIG11dGVkKTtcbiAgICB9XG5cbiAgICBTZXRWb2x1bWUodm9sdW1lKXtcbiAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQudm9sdW1lID0gdm9sdW1lO1xuICAgICAgICB0aGlzLiRjb250YWluZXIudHJpZ2dlcihcIk9uVm9sdW1lQ2hhbmdlXCIsIHZvbHVtZSk7XG4gICAgfVxuXG4gICAgVG9nZ2xlRnVsbHNjcmVlbigpe1xuICAgICAgICBpZiAoc2NyZWVuZnVsbCA9PT0gJ3VuZGVmaW5lZCcgfHwgIXNjcmVlbmZ1bGwuZW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNjcmVlbmZ1bGwudG9nZ2xlKHRoaXMuJGNvbnRhaW5lclswXSk7XG4gICAgfVxuXG4gICAgT25GdWxsc2NyZWVuQ2hhbmdlKCl7XG4gICAgICAgIGlmKHNjcmVlbmZ1bGwuaXNGdWxsc2NyZWVuKXtcbiAgICAgICAgICAgIHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcyhcIndhbGRvcmYtZnVsbHNjcmVlblwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgdGhpcy4kY29udGFpbmVyLnJlbW92ZUNsYXNzKFwid2FsZG9yZi1mdWxsc2NyZWVuXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgU2V0RnVsbHNjcmVlbihmdWxsc2NyZWVuKXtcbiAgICAgICAgaWYgKHNjcmVlbmZ1bGwgPT09ICd1bmRlZmluZWQnIHx8ICFzY3JlZW5mdWxsLmVuYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGZ1bGxzY3JlZW4pe1xuICAgICAgICAgICAgc2NyZWVuZnVsbC5yZXF1ZXN0KHRoaXMuJGNvbnRhaW5lclswXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzY3JlZW5mdWxsLmV4aXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxlZCB3aGVuIHRoZSBtb3VzZSBtb3ZlcyBpbiB0aGUgdmlkZW8gY29udGFpbmVyLlxuICAgICAqL1xuICAgIE9uTW91c2VNb3ZlKCl7XG4gICAgICAgIC8vIFJlc2V0IHRoZSB0aW1lclxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5tb3VzZVRpbWVyKTtcbiAgICAgICAgdGhpcy5tb3VzZVRpbWVyID0gMDtcblxuICAgICAgICAvLyBSZXN0YXJ0IGZhZGluZyBpZiBhbGxvd2VkIHRvXG4gICAgICAgIGlmKHRoaXMuYWxsb3dBdXRvRmFkZSl7XG4gICAgICAgICAgICAgdGhpcy5SZXN0YXJ0RmFkaW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBPblRpbWVVcGRhdGUodGltZSl7XG4gICAgICAgIGlmKHRoaXMuZW5kVGltZSAmJiB0aGlzLmVuZFRpbWUgPD0gdGhpcy52aWRlb0VsZW1lbnQuY3VycmVudFRpbWUpe1xuICAgICAgICAgICAgdGhpcy5QYXVzZSgpOyAgIFxuICAgICAgICAgICAgdGhpcy5lbmRUaW1lID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4kY29udGFpbmVyLnRyaWdnZXIoXCJPblRpbWVVcGRhdGVcIiwgdGltZSk7XG4gICAgfVxuXG4gICAgUmVzdGFydEZhZGluZygpe1xuICAgICAgICAvLyBSZXN0b3JlIHZpc2liaWxpdHlcbiAgICAgICAgdGhpcy5TZXRWaXNpYmxlKHRydWUsIHRoaXMuZmFkZUR1cmF0aW9uKTtcblxuICAgICAgICAvLyBTdGFydCB0aGUgdGltZXIgb3ZlciBhZ2FpblxuICAgICAgICB0aGlzLm1vdXNlVGltZXIgPSBzZXRUaW1lb3V0KCgpPT57XG4gICAgICAgICAgICB0aGlzLlNldFZpc2libGUoZmFsc2UsIHRoaXMuZmFkZUR1cmF0aW9uKTtcbiAgICAgICAgfSwgdGhpcy5pZGxlU2Vjb25kc0JlZm9yZUZhZGUgKiAxMDAwKTtcbiAgICB9XG5cbiAgICBTZXRBdXRvRmFkZShhbGxvdykge1xuICAgICAgICB0aGlzLmFsbG93QXV0b0ZhZGUgPSBhbGxvdztcbiAgICAgICAgXG4gICAgICAgIC8vIFJlc2V0IHRoZSBtb3VzZSB0aW1lclxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5tb3VzZVRpbWVyKTtcbiAgICAgICAgdGhpcy5tb3VzZVRpbWVyID0gMDtcblxuICAgICAgICAvLyBNYWtlIGVsZW1lbnRzIHZpc2libGVcbiAgICAgICAgdGhpcy5TZXRWaXNpYmxlKHRydWUpO1xuXG4gICAgICAgIC8vIFJlc3RhcnQgdGhlIGZhZGluZyBiZWhhdmlvciBpZiBkZXNpcmVkXG4gICAgICAgIGlmKGFsbG93KXtcbiAgICAgICAgICAgIHRoaXMuUmVzdGFydEZhZGluZygpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cblxuICAgIC8vIElzUGxheWluZygpe1xuICAgIC8vICAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zMTEzMzQwMVxuICAgIC8vICAgICByZXR1cm4gISEodGhpcy52aWRlb0VsZW1lbnQuY3VycmVudFRpbWUgPiAwICYmICF0aGlzLnZpZGVvRWxlbWVudC5wYXVzZWQgJiYgXG4gICAgLy8gICAgICAgICAgICAgICAhdGhpcy52aWRlb0VsZW1lbnQuZW5kZWQgJiYgdGhpcy52aWRlb0VsZW1lbnQucmVhZHlTdGF0ZSA+IDIpO1xuICAgIC8vIH1cblxuICAgIC8vIEZyb20gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vTmF0ZW93YW1pLzdhOTQ3ZTkzZjA5YzQ1YTEwOTdlNzgzZGMwMDU2MGUxXG4gICAgR2V0VmlkZW9EaW1lbnNpb25zKCkge1xuICAgICAgICBsZXQgdmlkZW8gPSB0aGlzLnZpZGVvRWxlbWVudDtcbiAgICAgICAgLy8gUmF0aW8gb2YgdGhlIHZpZGVvJ3MgaW50cmlzaWMgZGltZW5zaW9uc1xuICAgICAgICBsZXQgdmlkZW9SYXRpbyA9IHZpZGVvLnZpZGVvV2lkdGggLyB2aWRlby52aWRlb0hlaWdodDtcbiAgICAgICAgLy8gVGhlIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIHZpZGVvIGVsZW1lbnRcbiAgICAgICAgbGV0IHdpZHRoID0gdmlkZW8ub2Zmc2V0V2lkdGg7XG4gICAgICAgIGxldCBoZWlnaHQgPSB2aWRlby5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIC8vIFRoZSByYXRpbyBvZiB0aGUgZWxlbWVudCdzIHdpZHRoIHRvIGl0cyBoZWlnaHRcbiAgICAgICAgbGV0IGVsZW1lbnRSYXRpbyA9IHdpZHRoIC8gaGVpZ2h0O1xuICAgICAgICAvLyBJZiB0aGUgdmlkZW8gZWxlbWVudCBpcyBzaG9ydCBhbmQgd2lkZVxuICAgICAgICBpZihlbGVtZW50UmF0aW8gPiB2aWRlb1JhdGlvKSB3aWR0aCA9IGhlaWdodCAqIHZpZGVvUmF0aW87XG4gICAgICAgIC8vIEl0IG11c3QgYmUgdGFsbCBhbmQgdGhpbiwgb3IgZXhhY3RseSBlcXVhbCB0byB0aGUgb3JpZ2luYWwgcmF0aW9cbiAgICAgICAgZWxzZSBoZWlnaHQgPSB3aWR0aCAvIHZpZGVvUmF0aW87XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgICAgIH07XG4gICAgfVxuXG59XG5cbmV4cG9ydCB7IEFubm90YXRvclZpZGVvUGxheWVyIH07IiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydHMuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcbmV4cG9ydHMudG9CeXRlQXJyYXkgPSB0b0J5dGVBcnJheVxuZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gZnJvbUJ5dGVBcnJheVxuXG52YXIgbG9va3VwID0gW11cbnZhciByZXZMb29rdXAgPSBbXVxudmFyIEFyciA9IHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJyA/IFVpbnQ4QXJyYXkgOiBBcnJheVxuXG52YXIgY29kZSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJ1xuZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgbG9va3VwW2ldID0gY29kZVtpXVxuICByZXZMb29rdXBbY29kZS5jaGFyQ29kZUF0KGkpXSA9IGlcbn1cblxuLy8gU3VwcG9ydCBkZWNvZGluZyBVUkwtc2FmZSBiYXNlNjQgc3RyaW5ncywgYXMgTm9kZS5qcyBkb2VzLlxuLy8gU2VlOiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CYXNlNjQjVVJMX2FwcGxpY2F0aW9uc1xucmV2TG9va3VwWyctJy5jaGFyQ29kZUF0KDApXSA9IDYyXG5yZXZMb29rdXBbJ18nLmNoYXJDb2RlQXQoMCldID0gNjNcblxuZnVuY3Rpb24gZ2V0TGVucyAoYjY0KSB7XG4gIHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cbiAgaWYgKGxlbiAlIDQgPiAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0JylcbiAgfVxuXG4gIC8vIFRyaW0gb2ZmIGV4dHJhIGJ5dGVzIGFmdGVyIHBsYWNlaG9sZGVyIGJ5dGVzIGFyZSBmb3VuZFxuICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9iZWF0Z2FtbWl0L2Jhc2U2NC1qcy9pc3N1ZXMvNDJcbiAgdmFyIHZhbGlkTGVuID0gYjY0LmluZGV4T2YoJz0nKVxuICBpZiAodmFsaWRMZW4gPT09IC0xKSB2YWxpZExlbiA9IGxlblxuXG4gIHZhciBwbGFjZUhvbGRlcnNMZW4gPSB2YWxpZExlbiA9PT0gbGVuXG4gICAgPyAwXG4gICAgOiA0IC0gKHZhbGlkTGVuICUgNClcblxuICByZXR1cm4gW3ZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW5dXG59XG5cbi8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoYjY0KSB7XG4gIHZhciBsZW5zID0gZ2V0TGVucyhiNjQpXG4gIHZhciB2YWxpZExlbiA9IGxlbnNbMF1cbiAgdmFyIHBsYWNlSG9sZGVyc0xlbiA9IGxlbnNbMV1cbiAgcmV0dXJuICgodmFsaWRMZW4gKyBwbGFjZUhvbGRlcnNMZW4pICogMyAvIDQpIC0gcGxhY2VIb2xkZXJzTGVuXG59XG5cbmZ1bmN0aW9uIF9ieXRlTGVuZ3RoIChiNjQsIHZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW4pIHtcbiAgcmV0dXJuICgodmFsaWRMZW4gKyBwbGFjZUhvbGRlcnNMZW4pICogMyAvIDQpIC0gcGxhY2VIb2xkZXJzTGVuXG59XG5cbmZ1bmN0aW9uIHRvQnl0ZUFycmF5IChiNjQpIHtcbiAgdmFyIHRtcFxuICB2YXIgbGVucyA9IGdldExlbnMoYjY0KVxuICB2YXIgdmFsaWRMZW4gPSBsZW5zWzBdXG4gIHZhciBwbGFjZUhvbGRlcnNMZW4gPSBsZW5zWzFdXG5cbiAgdmFyIGFyciA9IG5ldyBBcnIoX2J5dGVMZW5ndGgoYjY0LCB2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuKSlcblxuICB2YXIgY3VyQnl0ZSA9IDBcblxuICAvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG4gIHZhciBsZW4gPSBwbGFjZUhvbGRlcnNMZW4gPiAwXG4gICAgPyB2YWxpZExlbiAtIDRcbiAgICA6IHZhbGlkTGVuXG5cbiAgdmFyIGlcbiAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSArPSA0KSB7XG4gICAgdG1wID1cbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDE4KSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgMTIpIHxcbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA8PCA2KSB8XG4gICAgICByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDMpXVxuICAgIGFycltjdXJCeXRlKytdID0gKHRtcCA+PiAxNikgJiAweEZGXG4gICAgYXJyW2N1ckJ5dGUrK10gPSAodG1wID4+IDgpICYgMHhGRlxuICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgaWYgKHBsYWNlSG9sZGVyc0xlbiA9PT0gMikge1xuICAgIHRtcCA9XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAyKSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPj4gNClcbiAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIGlmIChwbGFjZUhvbGRlcnNMZW4gPT09IDEpIHtcbiAgICB0bXAgPVxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMTApIHxcbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA8PCA0KSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPj4gMilcbiAgICBhcnJbY3VyQnl0ZSsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICByZXR1cm4gYXJyXG59XG5cbmZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG4gIHJldHVybiBsb29rdXBbbnVtID4+IDE4ICYgMHgzRl0gK1xuICAgIGxvb2t1cFtudW0gPj4gMTIgJiAweDNGXSArXG4gICAgbG9va3VwW251bSA+PiA2ICYgMHgzRl0gK1xuICAgIGxvb2t1cFtudW0gJiAweDNGXVxufVxuXG5mdW5jdGlvbiBlbmNvZGVDaHVuayAodWludDgsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHRtcFxuICB2YXIgb3V0cHV0ID0gW11cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpICs9IDMpIHtcbiAgICB0bXAgPVxuICAgICAgKCh1aW50OFtpXSA8PCAxNikgJiAweEZGMDAwMCkgK1xuICAgICAgKCh1aW50OFtpICsgMV0gPDwgOCkgJiAweEZGMDApICtcbiAgICAgICh1aW50OFtpICsgMl0gJiAweEZGKVxuICAgIG91dHB1dC5wdXNoKHRyaXBsZXRUb0Jhc2U2NCh0bXApKVxuICB9XG4gIHJldHVybiBvdXRwdXQuam9pbignJylcbn1cblxuZnVuY3Rpb24gZnJvbUJ5dGVBcnJheSAodWludDgpIHtcbiAgdmFyIHRtcFxuICB2YXIgbGVuID0gdWludDgubGVuZ3RoXG4gIHZhciBleHRyYUJ5dGVzID0gbGVuICUgMyAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuICB2YXIgcGFydHMgPSBbXVxuICB2YXIgbWF4Q2h1bmtMZW5ndGggPSAxNjM4MyAvLyBtdXN0IGJlIG11bHRpcGxlIG9mIDNcblxuICAvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG4gIGZvciAodmFyIGkgPSAwLCBsZW4yID0gbGVuIC0gZXh0cmFCeXRlczsgaSA8IGxlbjI7IGkgKz0gbWF4Q2h1bmtMZW5ndGgpIHtcbiAgICBwYXJ0cy5wdXNoKGVuY29kZUNodW5rKFxuICAgICAgdWludDgsIGksIChpICsgbWF4Q2h1bmtMZW5ndGgpID4gbGVuMiA/IGxlbjIgOiAoaSArIG1heENodW5rTGVuZ3RoKVxuICAgICkpXG4gIH1cblxuICAvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG4gIGlmIChleHRyYUJ5dGVzID09PSAxKSB7XG4gICAgdG1wID0gdWludDhbbGVuIC0gMV1cbiAgICBwYXJ0cy5wdXNoKFxuICAgICAgbG9va3VwW3RtcCA+PiAyXSArXG4gICAgICBsb29rdXBbKHRtcCA8PCA0KSAmIDB4M0ZdICtcbiAgICAgICc9PSdcbiAgICApXG4gIH0gZWxzZSBpZiAoZXh0cmFCeXRlcyA9PT0gMikge1xuICAgIHRtcCA9ICh1aW50OFtsZW4gLSAyXSA8PCA4KSArIHVpbnQ4W2xlbiAtIDFdXG4gICAgcGFydHMucHVzaChcbiAgICAgIGxvb2t1cFt0bXAgPj4gMTBdICtcbiAgICAgIGxvb2t1cFsodG1wID4+IDQpICYgMHgzRl0gK1xuICAgICAgbG9va3VwWyh0bXAgPDwgMikgJiAweDNGXSArXG4gICAgICAnPSdcbiAgICApXG4gIH1cblxuICByZXR1cm4gcGFydHMuam9pbignJylcbn1cbiIsIi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGh0dHBzOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IFNsb3dCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuXG52YXIgS19NQVhfTEVOR1RIID0gMHg3ZmZmZmZmZlxuZXhwb3J0cy5rTWF4TGVuZ3RoID0gS19NQVhfTEVOR1RIXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFByaW50IHdhcm5pbmcgYW5kIHJlY29tbWVuZCB1c2luZyBgYnVmZmVyYCB2NC54IHdoaWNoIGhhcyBhbiBPYmplY3RcbiAqICAgICAgICAgICAgICAgaW1wbGVtZW50YXRpb24gKG1vc3QgY29tcGF0aWJsZSwgZXZlbiBJRTYpXG4gKlxuICogQnJvd3NlcnMgdGhhdCBzdXBwb3J0IHR5cGVkIGFycmF5cyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLCBDaHJvbWUgNyssIFNhZmFyaSA1LjErLFxuICogT3BlcmEgMTEuNissIGlPUyA0LjIrLlxuICpcbiAqIFdlIHJlcG9ydCB0aGF0IHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGlmIHRoZSBhcmUgbm90IHN1YmNsYXNzYWJsZVxuICogdXNpbmcgX19wcm90b19fLiBGaXJlZm94IDQtMjkgbGFja3Mgc3VwcG9ydCBmb3IgYWRkaW5nIG5ldyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YFxuICogKFNlZTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4KS4gSUUgMTAgbGFja3Mgc3VwcG9ydFxuICogZm9yIF9fcHJvdG9fXyBhbmQgaGFzIGEgYnVnZ3kgdHlwZWQgYXJyYXkgaW1wbGVtZW50YXRpb24uXG4gKi9cbkJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUID0gdHlwZWRBcnJheVN1cHBvcnQoKVxuXG5pZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmIHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBjb25zb2xlLmVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gIGNvbnNvbGUuZXJyb3IoXG4gICAgJ1RoaXMgYnJvd3NlciBsYWNrcyB0eXBlZCBhcnJheSAoVWludDhBcnJheSkgc3VwcG9ydCB3aGljaCBpcyByZXF1aXJlZCBieSAnICtcbiAgICAnYGJ1ZmZlcmAgdjUueC4gVXNlIGBidWZmZXJgIHY0LnggaWYgeW91IHJlcXVpcmUgb2xkIGJyb3dzZXIgc3VwcG9ydC4nXG4gIClcbn1cblxuZnVuY3Rpb24gdHlwZWRBcnJheVN1cHBvcnQgKCkge1xuICAvLyBDYW4gdHlwZWQgYXJyYXkgaW5zdGFuY2VzIGNhbiBiZSBhdWdtZW50ZWQ/XG4gIHRyeSB7XG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KDEpXG4gICAgYXJyLl9fcHJvdG9fXyA9IHsgX19wcm90b19fOiBVaW50OEFycmF5LnByb3RvdHlwZSwgZm9vOiBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9IH1cbiAgICByZXR1cm4gYXJyLmZvbygpID09PSA0MlxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEJ1ZmZlci5wcm90b3R5cGUsICdwYXJlbnQnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKHRoaXMpKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyXG4gIH1cbn0pXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIucHJvdG90eXBlLCAnb2Zmc2V0Jywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0aGlzKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHJldHVybiB0aGlzLmJ5dGVPZmZzZXRcbiAgfVxufSlcblxuZnVuY3Rpb24gY3JlYXRlQnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKGxlbmd0aCA+IEtfTUFYX0xFTkdUSCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgXCInICsgbGVuZ3RoICsgJ1wiIGlzIGludmFsaWQgZm9yIG9wdGlvbiBcInNpemVcIicpXG4gIH1cbiAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGxlbmd0aClcbiAgYnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgcmV0dXJuIGJ1ZlxufVxuXG4vKipcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgaGF2ZSB0aGVpclxuICogcHJvdG90eXBlIGNoYW5nZWQgdG8gYEJ1ZmZlci5wcm90b3R5cGVgLiBGdXJ0aGVybW9yZSwgYEJ1ZmZlcmAgaXMgYSBzdWJjbGFzcyBvZlxuICogYFVpbnQ4QXJyYXlgLCBzbyB0aGUgcmV0dXJuZWQgaW5zdGFuY2VzIHdpbGwgaGF2ZSBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgbWV0aG9kc1xuICogYW5kIHRoZSBgVWludDhBcnJheWAgbWV0aG9kcy4gU3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXRcbiAqIHJldHVybnMgYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogVGhlIGBVaW50OEFycmF5YCBwcm90b3R5cGUgcmVtYWlucyB1bm1vZGlmaWVkLlxuICovXG5cbmZ1bmN0aW9uIEJ1ZmZlciAoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgLy8gQ29tbW9uIGNhc2UuXG4gIGlmICh0eXBlb2YgYXJnID09PSAnbnVtYmVyJykge1xuICAgIGlmICh0eXBlb2YgZW5jb2RpbmdPck9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICdUaGUgXCJzdHJpbmdcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgc3RyaW5nLiBSZWNlaXZlZCB0eXBlIG51bWJlcidcbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIGFsbG9jVW5zYWZlKGFyZylcbiAgfVxuICByZXR1cm4gZnJvbShhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuLy8gRml4IHN1YmFycmF5KCkgaW4gRVMyMDE2LiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL3B1bGwvOTdcbmlmICh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wuc3BlY2llcyAhPSBudWxsICYmXG4gICAgQnVmZmVyW1N5bWJvbC5zcGVjaWVzXSA9PT0gQnVmZmVyKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIsIFN5bWJvbC5zcGVjaWVzLCB7XG4gICAgdmFsdWU6IG51bGwsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIHdyaXRhYmxlOiBmYWxzZVxuICB9KVxufVxuXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyIC8vIG5vdCB1c2VkIGJ5IHRoaXMgaW1wbGVtZW50YXRpb25cblxuZnVuY3Rpb24gZnJvbSAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmcm9tU3RyaW5nKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0KVxuICB9XG5cbiAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5TGlrZSh2YWx1ZSlcbiAgfVxuXG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksICcgK1xuICAgICAgJ29yIEFycmF5LWxpa2UgT2JqZWN0LiBSZWNlaXZlZCB0eXBlICcgKyAodHlwZW9mIHZhbHVlKVxuICAgIClcbiAgfVxuXG4gIGlmIChpc0luc3RhbmNlKHZhbHVlLCBBcnJheUJ1ZmZlcikgfHxcbiAgICAgICh2YWx1ZSAmJiBpc0luc3RhbmNlKHZhbHVlLmJ1ZmZlciwgQXJyYXlCdWZmZXIpKSkge1xuICAgIHJldHVybiBmcm9tQXJyYXlCdWZmZXIodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJ2YWx1ZVwiIGFyZ3VtZW50IG11c3Qgbm90IGJlIG9mIHR5cGUgbnVtYmVyLiBSZWNlaXZlZCB0eXBlIG51bWJlcidcbiAgICApXG4gIH1cblxuICB2YXIgdmFsdWVPZiA9IHZhbHVlLnZhbHVlT2YgJiYgdmFsdWUudmFsdWVPZigpXG4gIGlmICh2YWx1ZU9mICE9IG51bGwgJiYgdmFsdWVPZiAhPT0gdmFsdWUpIHtcbiAgICByZXR1cm4gQnVmZmVyLmZyb20odmFsdWVPZiwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgdmFyIGIgPSBmcm9tT2JqZWN0KHZhbHVlKVxuICBpZiAoYikgcmV0dXJuIGJcblxuICBpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvUHJpbWl0aXZlICE9IG51bGwgJiZcbiAgICAgIHR5cGVvZiB2YWx1ZVtTeW1ib2wudG9QcmltaXRpdmVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5mcm9tKFxuICAgICAgdmFsdWVbU3ltYm9sLnRvUHJpbWl0aXZlXSgnc3RyaW5nJyksIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aFxuICAgIClcbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgJ1RoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksICcgK1xuICAgICdvciBBcnJheS1saWtlIE9iamVjdC4gUmVjZWl2ZWQgdHlwZSAnICsgKHR5cGVvZiB2YWx1ZSlcbiAgKVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uYWxseSBlcXVpdmFsZW50IHRvIEJ1ZmZlcihhcmcsIGVuY29kaW5nKSBidXQgdGhyb3dzIGEgVHlwZUVycm9yXG4gKiBpZiB2YWx1ZSBpcyBhIG51bWJlci5cbiAqIEJ1ZmZlci5mcm9tKHN0clssIGVuY29kaW5nXSlcbiAqIEJ1ZmZlci5mcm9tKGFycmF5KVxuICogQnVmZmVyLmZyb20oYnVmZmVyKVxuICogQnVmZmVyLmZyb20oYXJyYXlCdWZmZXJbLCBieXRlT2Zmc2V0WywgbGVuZ3RoXV0pXG4gKiovXG5CdWZmZXIuZnJvbSA9IGZ1bmN0aW9uICh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBmcm9tKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cbi8vIE5vdGU6IENoYW5nZSBwcm90b3R5cGUgKmFmdGVyKiBCdWZmZXIuZnJvbSBpcyBkZWZpbmVkIHRvIHdvcmthcm91bmQgQ2hyb21lIGJ1Zzpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL3B1bGwvMTQ4XG5CdWZmZXIucHJvdG90eXBlLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXkucHJvdG90eXBlXG5CdWZmZXIuX19wcm90b19fID0gVWludDhBcnJheVxuXG5mdW5jdGlvbiBhc3NlcnRTaXplIChzaXplKSB7XG4gIGlmICh0eXBlb2Ygc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInNpemVcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgbnVtYmVyJylcbiAgfSBlbHNlIGlmIChzaXplIDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgXCInICsgc2l6ZSArICdcIiBpcyBpbnZhbGlkIGZvciBvcHRpb24gXCJzaXplXCInKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFsbG9jIChzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIGlmIChzaXplIDw9IDApIHtcbiAgICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG4gIH1cbiAgaWYgKGZpbGwgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9ubHkgcGF5IGF0dGVudGlvbiB0byBlbmNvZGluZyBpZiBpdCdzIGEgc3RyaW5nLiBUaGlzXG4gICAgLy8gcHJldmVudHMgYWNjaWRlbnRhbGx5IHNlbmRpbmcgaW4gYSBudW1iZXIgdGhhdCB3b3VsZFxuICAgIC8vIGJlIGludGVycHJldHRlZCBhcyBhIHN0YXJ0IG9mZnNldC5cbiAgICByZXR1cm4gdHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJ1xuICAgICAgPyBjcmVhdGVCdWZmZXIoc2l6ZSkuZmlsbChmaWxsLCBlbmNvZGluZylcbiAgICAgIDogY3JlYXRlQnVmZmVyKHNpemUpLmZpbGwoZmlsbClcbiAgfVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBmaWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogYWxsb2Moc2l6ZVssIGZpbGxbLCBlbmNvZGluZ11dKVxuICoqL1xuQnVmZmVyLmFsbG9jID0gZnVuY3Rpb24gKHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIHJldHVybiBhbGxvYyhzaXplLCBmaWxsLCBlbmNvZGluZylcbn1cblxuZnVuY3Rpb24gYWxsb2NVbnNhZmUgKHNpemUpIHtcbiAgYXNzZXJ0U2l6ZShzaXplKVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUgPCAwID8gMCA6IGNoZWNrZWQoc2l6ZSkgfCAwKVxufVxuXG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gQnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKHNpemUpXG59XG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gU2xvd0J1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICovXG5CdWZmZXIuYWxsb2NVbnNhZmVTbG93ID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKHNpemUpXG59XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycgfHwgZW5jb2RpbmcgPT09ICcnKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgfVxuXG4gIGlmICghQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICB9XG5cbiAgdmFyIGxlbmd0aCA9IGJ5dGVMZW5ndGgoc3RyaW5nLCBlbmNvZGluZykgfCAwXG4gIHZhciBidWYgPSBjcmVhdGVCdWZmZXIobGVuZ3RoKVxuXG4gIHZhciBhY3R1YWwgPSBidWYud3JpdGUoc3RyaW5nLCBlbmNvZGluZylcblxuICBpZiAoYWN0dWFsICE9PSBsZW5ndGgpIHtcbiAgICAvLyBXcml0aW5nIGEgaGV4IHN0cmluZywgZm9yIGV4YW1wbGUsIHRoYXQgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzIHdpbGxcbiAgICAvLyBjYXVzZSBldmVyeXRoaW5nIGFmdGVyIHRoZSBmaXJzdCBpbnZhbGlkIGNoYXJhY3RlciB0byBiZSBpZ25vcmVkLiAoZS5nLlxuICAgIC8vICdhYnh4Y2QnIHdpbGwgYmUgdHJlYXRlZCBhcyAnYWInKVxuICAgIGJ1ZiA9IGJ1Zi5zbGljZSgwLCBhY3R1YWwpXG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGggPCAwID8gMCA6IGNoZWNrZWQoYXJyYXkubGVuZ3RoKSB8IDBcbiAgdmFyIGJ1ZiA9IGNyZWF0ZUJ1ZmZlcihsZW5ndGgpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICBidWZbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5QnVmZmVyIChhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmIChieXRlT2Zmc2V0IDwgMCB8fCBhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcIm9mZnNldFwiIGlzIG91dHNpZGUgb2YgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBpZiAoYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQgKyAobGVuZ3RoIHx8IDApKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1wibGVuZ3RoXCIgaXMgb3V0c2lkZSBvZiBidWZmZXIgYm91bmRzJylcbiAgfVxuXG4gIHZhciBidWZcbiAgaWYgKGJ5dGVPZmZzZXQgPT09IHVuZGVmaW5lZCAmJiBsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5KVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQpXG4gIH0gZWxzZSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIGJ1Zi5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbU9iamVjdCAob2JqKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqKSkge1xuICAgIHZhciBsZW4gPSBjaGVja2VkKG9iai5sZW5ndGgpIHwgMFxuICAgIHZhciBidWYgPSBjcmVhdGVCdWZmZXIobGVuKVxuXG4gICAgaWYgKGJ1Zi5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBidWZcbiAgICB9XG5cbiAgICBvYmouY29weShidWYsIDAsIDAsIGxlbilcbiAgICByZXR1cm4gYnVmXG4gIH1cblxuICBpZiAob2JqLmxlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHR5cGVvZiBvYmoubGVuZ3RoICE9PSAnbnVtYmVyJyB8fCBudW1iZXJJc05hTihvYmoubGVuZ3RoKSkge1xuICAgICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcigwKVxuICAgIH1cbiAgICByZXR1cm4gZnJvbUFycmF5TGlrZShvYmopXG4gIH1cblxuICBpZiAob2JqLnR5cGUgPT09ICdCdWZmZXInICYmIEFycmF5LmlzQXJyYXkob2JqLmRhdGEpKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheUxpa2Uob2JqLmRhdGEpXG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tlZCAobGVuZ3RoKSB7XG4gIC8vIE5vdGU6IGNhbm5vdCB1c2UgYGxlbmd0aCA8IEtfTUFYX0xFTkdUSGAgaGVyZSBiZWNhdXNlIHRoYXQgZmFpbHMgd2hlblxuICAvLyBsZW5ndGggaXMgTmFOICh3aGljaCBpcyBvdGhlcndpc2UgY29lcmNlZCB0byB6ZXJvLilcbiAgaWYgKGxlbmd0aCA+PSBLX01BWF9MRU5HVEgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byBhbGxvY2F0ZSBCdWZmZXIgbGFyZ2VyIHRoYW4gbWF4aW11bSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnc2l6ZTogMHgnICsgS19NQVhfTEVOR1RILnRvU3RyaW5nKDE2KSArICcgYnl0ZXMnKVxuICB9XG4gIHJldHVybiBsZW5ndGggfCAwXG59XG5cbmZ1bmN0aW9uIFNsb3dCdWZmZXIgKGxlbmd0aCkge1xuICBpZiAoK2xlbmd0aCAhPSBsZW5ndGgpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBlcWVxZXFcbiAgICBsZW5ndGggPSAwXG4gIH1cbiAgcmV0dXJuIEJ1ZmZlci5hbGxvYygrbGVuZ3RoKVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiBpc0J1ZmZlciAoYikge1xuICByZXR1cm4gYiAhPSBudWxsICYmIGIuX2lzQnVmZmVyID09PSB0cnVlICYmXG4gICAgYiAhPT0gQnVmZmVyLnByb3RvdHlwZSAvLyBzbyBCdWZmZXIuaXNCdWZmZXIoQnVmZmVyLnByb3RvdHlwZSkgd2lsbCBiZSBmYWxzZVxufVxuXG5CdWZmZXIuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKGEsIGIpIHtcbiAgaWYgKGlzSW5zdGFuY2UoYSwgVWludDhBcnJheSkpIGEgPSBCdWZmZXIuZnJvbShhLCBhLm9mZnNldCwgYS5ieXRlTGVuZ3RoKVxuICBpZiAoaXNJbnN0YW5jZShiLCBVaW50OEFycmF5KSkgYiA9IEJ1ZmZlci5mcm9tKGIsIGIub2Zmc2V0LCBiLmJ5dGVMZW5ndGgpXG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGEpIHx8ICFCdWZmZXIuaXNCdWZmZXIoYikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBcImJ1ZjFcIiwgXCJidWYyXCIgYXJndW1lbnRzIG11c3QgYmUgb25lIG9mIHR5cGUgQnVmZmVyIG9yIFVpbnQ4QXJyYXknXG4gICAgKVxuICB9XG5cbiAgaWYgKGEgPT09IGIpIHJldHVybiAwXG5cbiAgdmFyIHggPSBhLmxlbmd0aFxuICB2YXIgeSA9IGIubGVuZ3RoXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IE1hdGgubWluKHgsIHkpOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkge1xuICAgICAgeCA9IGFbaV1cbiAgICAgIHkgPSBiW2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiBpc0VuY29kaW5nIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdsYXRpbjEnOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIGNvbmNhdCAobGlzdCwgbGVuZ3RoKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShsaXN0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gIH1cblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gQnVmZmVyLmFsbG9jKDApXG4gIH1cblxuICB2YXIgaVxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBsZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgIGxlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWZmZXIgPSBCdWZmZXIuYWxsb2NVbnNhZmUobGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBidWYgPSBsaXN0W2ldXG4gICAgaWYgKGlzSW5zdGFuY2UoYnVmLCBVaW50OEFycmF5KSkge1xuICAgICAgYnVmID0gQnVmZmVyLmZyb20oYnVmKVxuICAgIH1cbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICAgIH1cbiAgICBidWYuY29weShidWZmZXIsIHBvcylcbiAgICBwb3MgKz0gYnVmLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZmZXJcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN0cmluZykpIHtcbiAgICByZXR1cm4gc3RyaW5nLmxlbmd0aFxuICB9XG4gIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoc3RyaW5nKSB8fCBpc0luc3RhbmNlKHN0cmluZywgQXJyYXlCdWZmZXIpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5ieXRlTGVuZ3RoXG4gIH1cbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJzdHJpbmdcIiBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBvciBBcnJheUJ1ZmZlci4gJyArXG4gICAgICAnUmVjZWl2ZWQgdHlwZSAnICsgdHlwZW9mIHN0cmluZ1xuICAgIClcbiAgfVxuXG4gIHZhciBsZW4gPSBzdHJpbmcubGVuZ3RoXG4gIHZhciBtdXN0TWF0Y2ggPSAoYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdID09PSB0cnVlKVxuICBpZiAoIW11c3RNYXRjaCAmJiBsZW4gPT09IDApIHJldHVybiAwXG5cbiAgLy8gVXNlIGEgZm9yIGxvb3AgdG8gYXZvaWQgcmVjdXJzaW9uXG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxlblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIGxlbiAqIDJcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBsZW4gPj4+IDFcbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHtcbiAgICAgICAgICByZXR1cm4gbXVzdE1hdGNoID8gLTEgOiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aCAvLyBhc3N1bWUgdXRmOFxuICAgICAgICB9XG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcblxuZnVuY3Rpb24gc2xvd1RvU3RyaW5nIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuXG4gIC8vIE5vIG5lZWQgdG8gdmVyaWZ5IHRoYXQgXCJ0aGlzLmxlbmd0aCA8PSBNQVhfVUlOVDMyXCIgc2luY2UgaXQncyBhIHJlYWQtb25seVxuICAvLyBwcm9wZXJ0eSBvZiBhIHR5cGVkIGFycmF5LlxuXG4gIC8vIFRoaXMgYmVoYXZlcyBuZWl0aGVyIGxpa2UgU3RyaW5nIG5vciBVaW50OEFycmF5IGluIHRoYXQgd2Ugc2V0IHN0YXJ0L2VuZFxuICAvLyB0byB0aGVpciB1cHBlci9sb3dlciBib3VuZHMgaWYgdGhlIHZhbHVlIHBhc3NlZCBpcyBvdXQgb2YgcmFuZ2UuXG4gIC8vIHVuZGVmaW5lZCBpcyBoYW5kbGVkIHNwZWNpYWxseSBhcyBwZXIgRUNNQS0yNjIgNnRoIEVkaXRpb24sXG4gIC8vIFNlY3Rpb24gMTMuMy4zLjcgUnVudGltZSBTZW1hbnRpY3M6IEtleWVkQmluZGluZ0luaXRpYWxpemF0aW9uLlxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCB8fCBzdGFydCA8IDApIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICAvLyBSZXR1cm4gZWFybHkgaWYgc3RhcnQgPiB0aGlzLmxlbmd0aC4gRG9uZSBoZXJlIHRvIHByZXZlbnQgcG90ZW50aWFsIHVpbnQzMlxuICAvLyBjb2VyY2lvbiBmYWlsIGJlbG93LlxuICBpZiAoc3RhcnQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChlbmQgPD0gMCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgLy8gRm9yY2UgY29lcnNpb24gdG8gdWludDMyLiBUaGlzIHdpbGwgYWxzbyBjb2VyY2UgZmFsc2V5L05hTiB2YWx1ZXMgdG8gMC5cbiAgZW5kID4+Pj0gMFxuICBzdGFydCA+Pj49IDBcblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsYXRpbjFTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHV0ZjE2bGVTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoZW5jb2RpbmcgKyAnJykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuLy8gVGhpcyBwcm9wZXJ0eSBpcyB1c2VkIGJ5IGBCdWZmZXIuaXNCdWZmZXJgIChhbmQgdGhlIGBpcy1idWZmZXJgIG5wbSBwYWNrYWdlKVxuLy8gdG8gZGV0ZWN0IGEgQnVmZmVyIGluc3RhbmNlLiBJdCdzIG5vdCBwb3NzaWJsZSB0byB1c2UgYGluc3RhbmNlb2YgQnVmZmVyYFxuLy8gcmVsaWFibHkgaW4gYSBicm93c2VyaWZ5IGNvbnRleHQgYmVjYXVzZSB0aGVyZSBjb3VsZCBiZSBtdWx0aXBsZSBkaWZmZXJlbnRcbi8vIGNvcGllcyBvZiB0aGUgJ2J1ZmZlcicgcGFja2FnZSBpbiB1c2UuIFRoaXMgbWV0aG9kIHdvcmtzIGV2ZW4gZm9yIEJ1ZmZlclxuLy8gaW5zdGFuY2VzIHRoYXQgd2VyZSBjcmVhdGVkIGZyb20gYW5vdGhlciBjb3B5IG9mIHRoZSBgYnVmZmVyYCBwYWNrYWdlLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9pc3N1ZXMvMTU0XG5CdWZmZXIucHJvdG90eXBlLl9pc0J1ZmZlciA9IHRydWVcblxuZnVuY3Rpb24gc3dhcCAoYiwgbiwgbSkge1xuICB2YXIgaSA9IGJbbl1cbiAgYltuXSA9IGJbbV1cbiAgYlttXSA9IGlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMTYgPSBmdW5jdGlvbiBzd2FwMTYgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDIgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDE2LWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDIpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAxKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDMyID0gZnVuY3Rpb24gc3dhcDMyICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA0ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAzMi1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSA0KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgMylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgMilcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXA2NCA9IGZ1bmN0aW9uIHN3YXA2NCAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgOCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNjQtYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gOCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDcpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDYpXG4gICAgc3dhcCh0aGlzLCBpICsgMiwgaSArIDUpXG4gICAgc3dhcCh0aGlzLCBpICsgMywgaSArIDQpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nICgpIHtcbiAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW5ndGggPT09IDApIHJldHVybiAnJ1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCAwLCBsZW5ndGgpXG4gIHJldHVybiBzbG93VG9TdHJpbmcuYXBwbHkodGhpcywgYXJndW1lbnRzKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvTG9jYWxlU3RyaW5nID0gQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZ1xuXG5CdWZmZXIucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyAoYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIGlmICh0aGlzID09PSBiKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gQnVmZmVyLmNvbXBhcmUodGhpcywgYikgPT09IDBcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gaW5zcGVjdCAoKSB7XG4gIHZhciBzdHIgPSAnJ1xuICB2YXIgbWF4ID0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFU1xuICBzdHIgPSB0aGlzLnRvU3RyaW5nKCdoZXgnLCAwLCBtYXgpLnJlcGxhY2UoLyguezJ9KS9nLCAnJDEgJykudHJpbSgpXG4gIGlmICh0aGlzLmxlbmd0aCA+IG1heCkgc3RyICs9ICcgLi4uICdcbiAgcmV0dXJuICc8QnVmZmVyICcgKyBzdHIgKyAnPidcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAodGFyZ2V0LCBzdGFydCwgZW5kLCB0aGlzU3RhcnQsIHRoaXNFbmQpIHtcbiAgaWYgKGlzSW5zdGFuY2UodGFyZ2V0LCBVaW50OEFycmF5KSkge1xuICAgIHRhcmdldCA9IEJ1ZmZlci5mcm9tKHRhcmdldCwgdGFyZ2V0Lm9mZnNldCwgdGFyZ2V0LmJ5dGVMZW5ndGgpXG4gIH1cbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGFyZ2V0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIFwidGFyZ2V0XCIgYXJndW1lbnQgbXVzdCBiZSBvbmUgb2YgdHlwZSBCdWZmZXIgb3IgVWludDhBcnJheS4gJyArXG4gICAgICAnUmVjZWl2ZWQgdHlwZSAnICsgKHR5cGVvZiB0YXJnZXQpXG4gICAgKVxuICB9XG5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICBpZiAoZW5kID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmQgPSB0YXJnZXQgPyB0YXJnZXQubGVuZ3RoIDogMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNTdGFydCA9IDBcbiAgfVxuICBpZiAodGhpc0VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc0VuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoc3RhcnQgPCAwIHx8IGVuZCA+IHRhcmdldC5sZW5ndGggfHwgdGhpc1N0YXJ0IDwgMCB8fCB0aGlzRW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCAmJiBzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCkge1xuICAgIHJldHVybiAtMVxuICB9XG4gIGlmIChzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMVxuICB9XG5cbiAgc3RhcnQgPj4+PSAwXG4gIGVuZCA+Pj49IDBcbiAgdGhpc1N0YXJ0ID4+Pj0gMFxuICB0aGlzRW5kID4+Pj0gMFxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQpIHJldHVybiAwXG5cbiAgdmFyIHggPSB0aGlzRW5kIC0gdGhpc1N0YXJ0XG4gIHZhciB5ID0gZW5kIC0gc3RhcnRcbiAgdmFyIGxlbiA9IE1hdGgubWluKHgsIHkpXG5cbiAgdmFyIHRoaXNDb3B5ID0gdGhpcy5zbGljZSh0aGlzU3RhcnQsIHRoaXNFbmQpXG4gIHZhciB0YXJnZXRDb3B5ID0gdGFyZ2V0LnNsaWNlKHN0YXJ0LCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIGlmICh0aGlzQ29weVtpXSAhPT0gdGFyZ2V0Q29weVtpXSkge1xuICAgICAgeCA9IHRoaXNDb3B5W2ldXG4gICAgICB5ID0gdGFyZ2V0Q29weVtpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbi8vIEZpbmRzIGVpdGhlciB0aGUgZmlyc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0ID49IGBieXRlT2Zmc2V0YCxcbi8vIE9SIHRoZSBsYXN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA8PSBgYnl0ZU9mZnNldGAuXG4vL1xuLy8gQXJndW1lbnRzOlxuLy8gLSBidWZmZXIgLSBhIEJ1ZmZlciB0byBzZWFyY2hcbi8vIC0gdmFsIC0gYSBzdHJpbmcsIEJ1ZmZlciwgb3IgbnVtYmVyXG4vLyAtIGJ5dGVPZmZzZXQgLSBhbiBpbmRleCBpbnRvIGBidWZmZXJgOyB3aWxsIGJlIGNsYW1wZWQgdG8gYW4gaW50MzJcbi8vIC0gZW5jb2RpbmcgLSBhbiBvcHRpb25hbCBlbmNvZGluZywgcmVsZXZhbnQgaXMgdmFsIGlzIGEgc3RyaW5nXG4vLyAtIGRpciAtIHRydWUgZm9yIGluZGV4T2YsIGZhbHNlIGZvciBsYXN0SW5kZXhPZlxuZnVuY3Rpb24gYmlkaXJlY3Rpb25hbEluZGV4T2YgKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIC8vIEVtcHR5IGJ1ZmZlciBtZWFucyBubyBtYXRjaFxuICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMCkgcmV0dXJuIC0xXG5cbiAgLy8gTm9ybWFsaXplIGJ5dGVPZmZzZXRcbiAgaWYgKHR5cGVvZiBieXRlT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gYnl0ZU9mZnNldFxuICAgIGJ5dGVPZmZzZXQgPSAwXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA+IDB4N2ZmZmZmZmYpIHtcbiAgICBieXRlT2Zmc2V0ID0gMHg3ZmZmZmZmZlxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAtMHg4MDAwMDAwMCkge1xuICAgIGJ5dGVPZmZzZXQgPSAtMHg4MDAwMDAwMFxuICB9XG4gIGJ5dGVPZmZzZXQgPSArYnl0ZU9mZnNldCAvLyBDb2VyY2UgdG8gTnVtYmVyLlxuICBpZiAobnVtYmVySXNOYU4oYnl0ZU9mZnNldCkpIHtcbiAgICAvLyBieXRlT2Zmc2V0OiBpdCBpdCdzIHVuZGVmaW5lZCwgbnVsbCwgTmFOLCBcImZvb1wiLCBldGMsIHNlYXJjaCB3aG9sZSBidWZmZXJcbiAgICBieXRlT2Zmc2V0ID0gZGlyID8gMCA6IChidWZmZXIubGVuZ3RoIC0gMSlcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0OiBuZWdhdGl2ZSBvZmZzZXRzIHN0YXJ0IGZyb20gdGhlIGVuZCBvZiB0aGUgYnVmZmVyXG4gIGlmIChieXRlT2Zmc2V0IDwgMCkgYnl0ZU9mZnNldCA9IGJ1ZmZlci5sZW5ndGggKyBieXRlT2Zmc2V0XG4gIGlmIChieXRlT2Zmc2V0ID49IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICBpZiAoZGlyKSByZXR1cm4gLTFcbiAgICBlbHNlIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoIC0gMVxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAwKSB7XG4gICAgaWYgKGRpcikgYnl0ZU9mZnNldCA9IDBcbiAgICBlbHNlIHJldHVybiAtMVxuICB9XG5cbiAgLy8gTm9ybWFsaXplIHZhbFxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWwgPSBCdWZmZXIuZnJvbSh2YWwsIGVuY29kaW5nKVxuICB9XG5cbiAgLy8gRmluYWxseSwgc2VhcmNoIGVpdGhlciBpbmRleE9mIChpZiBkaXIgaXMgdHJ1ZSkgb3IgbGFzdEluZGV4T2ZcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcih2YWwpKSB7XG4gICAgLy8gU3BlY2lhbCBjYXNlOiBsb29raW5nIGZvciBlbXB0eSBzdHJpbmcvYnVmZmVyIGFsd2F5cyBmYWlsc1xuICAgIGlmICh2YWwubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gLTFcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDB4RkYgLy8gU2VhcmNoIGZvciBhIGJ5dGUgdmFsdWUgWzAtMjU1XVxuICAgIGlmICh0eXBlb2YgVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKGRpcikge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmxhc3RJbmRleE9mLmNhbGwoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCBbIHZhbCBdLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsIG11c3QgYmUgc3RyaW5nLCBudW1iZXIgb3IgQnVmZmVyJylcbn1cblxuZnVuY3Rpb24gYXJyYXlJbmRleE9mIChhcnIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICB2YXIgaW5kZXhTaXplID0gMVxuICB2YXIgYXJyTGVuZ3RoID0gYXJyLmxlbmd0aFxuICB2YXIgdmFsTGVuZ3RoID0gdmFsLmxlbmd0aFxuXG4gIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICBpZiAoZW5jb2RpbmcgPT09ICd1Y3MyJyB8fCBlbmNvZGluZyA9PT0gJ3Vjcy0yJyB8fFxuICAgICAgICBlbmNvZGluZyA9PT0gJ3V0ZjE2bGUnIHx8IGVuY29kaW5nID09PSAndXRmLTE2bGUnKSB7XG4gICAgICBpZiAoYXJyLmxlbmd0aCA8IDIgfHwgdmFsLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICB9XG4gICAgICBpbmRleFNpemUgPSAyXG4gICAgICBhcnJMZW5ndGggLz0gMlxuICAgICAgdmFsTGVuZ3RoIC89IDJcbiAgICAgIGJ5dGVPZmZzZXQgLz0gMlxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWQgKGJ1ZiwgaSkge1xuICAgIGlmIChpbmRleFNpemUgPT09IDEpIHtcbiAgICAgIHJldHVybiBidWZbaV1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGJ1Zi5yZWFkVUludDE2QkUoaSAqIGluZGV4U2l6ZSlcbiAgICB9XG4gIH1cblxuICB2YXIgaVxuICBpZiAoZGlyKSB7XG4gICAgdmFyIGZvdW5kSW5kZXggPSAtMVxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPCBhcnJMZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHJlYWQoYXJyLCBpKSA9PT0gcmVhZCh2YWwsIGZvdW5kSW5kZXggPT09IC0xID8gMCA6IGkgLSBmb3VuZEluZGV4KSkge1xuICAgICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIGZvdW5kSW5kZXggPSBpXG4gICAgICAgIGlmIChpIC0gZm91bmRJbmRleCArIDEgPT09IHZhbExlbmd0aCkgcmV0dXJuIGZvdW5kSW5kZXggKiBpbmRleFNpemVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ICE9PSAtMSkgaSAtPSBpIC0gZm91bmRJbmRleFxuICAgICAgICBmb3VuZEluZGV4ID0gLTFcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGJ5dGVPZmZzZXQgKyB2YWxMZW5ndGggPiBhcnJMZW5ndGgpIGJ5dGVPZmZzZXQgPSBhcnJMZW5ndGggLSB2YWxMZW5ndGhcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIGZvdW5kID0gdHJ1ZVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWxMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAocmVhZChhcnIsIGkgKyBqKSAhPT0gcmVhZCh2YWwsIGopKSB7XG4gICAgICAgICAgZm91bmQgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiB0aGlzLmluZGV4T2YodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykgIT09IC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIGluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIHRydWUpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUubGFzdEluZGV4T2YgPSBmdW5jdGlvbiBsYXN0SW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIGhleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgdmFyIHBhcnNlZCA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBpZiAobnVtYmVySXNOYU4ocGFyc2VkKSkgcmV0dXJuIGlcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBwYXJzZWRcbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiB1dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBhc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGxhdGluMVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGFzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBiYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gdWNzMldyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nKVxuICBpZiAob2Zmc2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygb2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIG9mZnNldFssIGxlbmd0aF1bLCBlbmNvZGluZ10pXG4gIH0gZWxzZSBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICAgIGlmIChpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBsZW5ndGggPSBsZW5ndGggPj4+IDBcbiAgICAgIGlmIChlbmNvZGluZyA9PT0gdW5kZWZpbmVkKSBlbmNvZGluZyA9ICd1dGY4J1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdCdWZmZXIud3JpdGUoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0WywgbGVuZ3RoXSkgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCdcbiAgICApXG4gIH1cblxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IGxlbmd0aCA+IHJlbWFpbmluZykgbGVuZ3RoID0gcmVtYWluaW5nXG5cbiAgaWYgKChzdHJpbmcubGVuZ3RoID4gMCAmJiAobGVuZ3RoIDwgMCB8fCBvZmZzZXQgPCAwKSkgfHwgb2Zmc2V0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byB3cml0ZSBvdXRzaWRlIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsYXRpbjFXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICAvLyBXYXJuaW5nOiBtYXhMZW5ndGggbm90IHRha2VuIGludG8gYWNjb3VudCBpbiBiYXNlNjRXcml0ZVxuICAgICAgICByZXR1cm4gYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHVjczJXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiB1dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG4gIHZhciByZXMgPSBbXVxuXG4gIHZhciBpID0gc3RhcnRcbiAgd2hpbGUgKGkgPCBlbmQpIHtcbiAgICB2YXIgZmlyc3RCeXRlID0gYnVmW2ldXG4gICAgdmFyIGNvZGVQb2ludCA9IG51bGxcbiAgICB2YXIgYnl0ZXNQZXJTZXF1ZW5jZSA9IChmaXJzdEJ5dGUgPiAweEVGKSA/IDRcbiAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4REYpID8gM1xuICAgICAgICA6IChmaXJzdEJ5dGUgPiAweEJGKSA/IDJcbiAgICAgICAgICA6IDFcblxuICAgIGlmIChpICsgYnl0ZXNQZXJTZXF1ZW5jZSA8PSBlbmQpIHtcbiAgICAgIHZhciBzZWNvbmRCeXRlLCB0aGlyZEJ5dGUsIGZvdXJ0aEJ5dGUsIHRlbXBDb2RlUG9pbnRcblxuICAgICAgc3dpdGNoIChieXRlc1BlclNlcXVlbmNlKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpZiAoZmlyc3RCeXRlIDwgMHg4MCkge1xuICAgICAgICAgICAgY29kZVBvaW50ID0gZmlyc3RCeXRlXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4MUYpIDw8IDB4NiB8IChzZWNvbmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3Rikge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweEMgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4NiB8ICh0aGlyZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGRiAmJiAodGVtcENvZGVQb2ludCA8IDB4RDgwMCB8fCB0ZW1wQ29kZVBvaW50ID4gMHhERkZGKSkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBmb3VydGhCeXRlID0gYnVmW2kgKyAzXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAoZm91cnRoQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHgxMiB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHhDIHwgKHRoaXJkQnl0ZSAmIDB4M0YpIDw8IDB4NiB8IChmb3VydGhCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHhGRkZGICYmIHRlbXBDb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb2RlUG9pbnQgPT09IG51bGwpIHtcbiAgICAgIC8vIHdlIGRpZCBub3QgZ2VuZXJhdGUgYSB2YWxpZCBjb2RlUG9pbnQgc28gaW5zZXJ0IGFcbiAgICAgIC8vIHJlcGxhY2VtZW50IGNoYXIgKFUrRkZGRCkgYW5kIGFkdmFuY2Ugb25seSAxIGJ5dGVcbiAgICAgIGNvZGVQb2ludCA9IDB4RkZGRFxuICAgICAgYnl0ZXNQZXJTZXF1ZW5jZSA9IDFcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA+IDB4RkZGRikge1xuICAgICAgLy8gZW5jb2RlIHRvIHV0ZjE2IChzdXJyb2dhdGUgcGFpciBkYW5jZSlcbiAgICAgIGNvZGVQb2ludCAtPSAweDEwMDAwXG4gICAgICByZXMucHVzaChjb2RlUG9pbnQgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApXG4gICAgICBjb2RlUG9pbnQgPSAweERDMDAgfCBjb2RlUG9pbnQgJiAweDNGRlxuICAgIH1cblxuICAgIHJlcy5wdXNoKGNvZGVQb2ludClcbiAgICBpICs9IGJ5dGVzUGVyU2VxdWVuY2VcbiAgfVxuXG4gIHJldHVybiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkocmVzKVxufVxuXG4vLyBCYXNlZCBvbiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMjc0NzI3Mi82ODA3NDIsIHRoZSBicm93c2VyIHdpdGhcbi8vIHRoZSBsb3dlc3QgbGltaXQgaXMgQ2hyb21lLCB3aXRoIDB4MTAwMDAgYXJncy5cbi8vIFdlIGdvIDEgbWFnbml0dWRlIGxlc3MsIGZvciBzYWZldHlcbnZhciBNQVhfQVJHVU1FTlRTX0xFTkdUSCA9IDB4MTAwMFxuXG5mdW5jdGlvbiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkgKGNvZGVQb2ludHMpIHtcbiAgdmFyIGxlbiA9IGNvZGVQb2ludHMubGVuZ3RoXG4gIGlmIChsZW4gPD0gTUFYX0FSR1VNRU5UU19MRU5HVEgpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShTdHJpbmcsIGNvZGVQb2ludHMpIC8vIGF2b2lkIGV4dHJhIHNsaWNlKClcbiAgfVxuXG4gIC8vIERlY29kZSBpbiBjaHVua3MgdG8gYXZvaWQgXCJjYWxsIHN0YWNrIHNpemUgZXhjZWVkZWRcIi5cbiAgdmFyIHJlcyA9ICcnXG4gIHZhciBpID0gMFxuICB3aGlsZSAoaSA8IGxlbikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFxuICAgICAgU3RyaW5nLFxuICAgICAgY29kZVBvaW50cy5zbGljZShpLCBpICs9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKVxuICAgIClcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldICYgMHg3RilcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGxhdGluMVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGhleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyAoYnl0ZXNbaSArIDFdICogMjU2KSlcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiBzbGljZSAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuXG4gICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIH0gZWxzZSBpZiAoc3RhcnQgPiBsZW4pIHtcbiAgICBzdGFydCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuXG4gICAgaWYgKGVuZCA8IDApIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICB2YXIgbmV3QnVmID0gdGhpcy5zdWJhcnJheShzdGFydCwgZW5kKVxuICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZVxuICBuZXdCdWYuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICByZXR1cm4gbmV3QnVmXG59XG5cbi8qXG4gKiBOZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGJ1ZmZlciBpc24ndCB0cnlpbmcgdG8gd3JpdGUgb3V0IG9mIGJvdW5kcy5cbiAqL1xuZnVuY3Rpb24gY2hlY2tPZmZzZXQgKG9mZnNldCwgZXh0LCBsZW5ndGgpIHtcbiAgaWYgKChvZmZzZXQgJSAxKSAhPT0gMCB8fCBvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb2Zmc2V0IGlzIG5vdCB1aW50JylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RyeWluZyB0byBhY2Nlc3MgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50TEUgPSBmdW5jdGlvbiByZWFkVUludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludEJFID0gZnVuY3Rpb24gcmVhZFVJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG4gIH1cblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdXG4gIHZhciBtdWwgPSAxXG4gIHdoaWxlIChieXRlTGVuZ3RoID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiByZWFkVUludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiByZWFkVUludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgOCkgfCB0aGlzW29mZnNldCArIDFdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAoKHRoaXNbb2Zmc2V0XSkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpKSArXG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSAqIDB4MTAwMDAwMClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiByZWFkVUludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAoKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50TEUgPSBmdW5jdGlvbiByZWFkSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludEJFID0gZnVuY3Rpb24gcmVhZEludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aFxuICB2YXIgbXVsID0gMVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWldXG4gIHdoaWxlIChpID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0taV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gcmVhZEludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIGlmICghKHRoaXNbb2Zmc2V0XSAmIDB4ODApKSByZXR1cm4gKHRoaXNbb2Zmc2V0XSlcbiAgcmV0dXJuICgoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTEpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiByZWFkSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAxXSB8ICh0aGlzW29mZnNldF0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gcmVhZEludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0pIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSA8PCAyNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDI0KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiByZWFkRmxvYXRMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gcmVhZEZsb2F0QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gcmVhZERvdWJsZUxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gcmVhZERvdWJsZUJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDUyLCA4KVxufVxuXG5mdW5jdGlvbiBjaGVja0ludCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiYnVmZmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlciBpbnN0YW5jZScpXG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1widmFsdWVcIiBhcmd1bWVudCBpcyBvdXQgb2YgYm91bmRzJylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludExFID0gZnVuY3Rpb24gd3JpdGVVSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIG1heEJ5dGVzID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG1heEJ5dGVzLCAwKVxuICB9XG5cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlVUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uIHdyaXRlVUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweGZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50TEUgPSBmdW5jdGlvbiB3cml0ZUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBsaW1pdCA9IE1hdGgucG93KDIsICg4ICogYnl0ZUxlbmd0aCkgLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICB2YXIgaSA9IDBcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHN1YiA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgaWYgKHZhbHVlIDwgMCAmJiBzdWIgPT09IDAgJiYgdGhpc1tvZmZzZXQgKyBpIC0gMV0gIT09IDApIHtcbiAgICAgIHN1YiA9IDFcbiAgICB9XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludEJFID0gZnVuY3Rpb24gd3JpdGVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCAoOCAqIGJ5dGVMZW5ndGgpIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoIC0gMVxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gMFxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSArIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHg3ZiwgLTB4ODApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuZnVuY3Rpb24gY2hlY2tJRUVFNzU0IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxuICBpZiAob2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDQsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gd3JpdGVGbG9hdEJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA4LCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxuICByZXR1cm4gb2Zmc2V0ICsgOFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uIGNvcHkgKHRhcmdldCwgdGFyZ2V0U3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGFyZ2V0KSkgdGhyb3cgbmV3IFR5cGVFcnJvcignYXJndW1lbnQgc2hvdWxkIGJlIGEgQnVmZmVyJylcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldFN0YXJ0ID49IHRhcmdldC5sZW5ndGgpIHRhcmdldFN0YXJ0ID0gdGFyZ2V0Lmxlbmd0aFxuICBpZiAoIXRhcmdldFN0YXJ0KSB0YXJnZXRTdGFydCA9IDBcbiAgaWYgKGVuZCA+IDAgJiYgZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm4gMFxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCB0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGlmICh0YXJnZXRTdGFydCA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcigndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIH1cbiAgaWYgKHN0YXJ0IDwgMCB8fCBzdGFydCA+PSB0aGlzLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG4gIGlmIChlbmQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCA8IGVuZCAtIHN0YXJ0KSB7XG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0ICsgc3RhcnRcbiAgfVxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQgJiYgdHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmNvcHlXaXRoaW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBVc2UgYnVpbHQtaW4gd2hlbiBhdmFpbGFibGUsIG1pc3NpbmcgZnJvbSBJRTExXG4gICAgdGhpcy5jb3B5V2l0aGluKHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKVxuICB9IGVsc2UgaWYgKHRoaXMgPT09IHRhcmdldCAmJiBzdGFydCA8IHRhcmdldFN0YXJ0ICYmIHRhcmdldFN0YXJ0IDwgZW5kKSB7XG4gICAgLy8gZGVzY2VuZGluZyBjb3B5IGZyb20gZW5kXG4gICAgZm9yICh2YXIgaSA9IGxlbiAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICB0YXJnZXRbaSArIHRhcmdldFN0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBVaW50OEFycmF5LnByb3RvdHlwZS5zZXQuY2FsbChcbiAgICAgIHRhcmdldCxcbiAgICAgIHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCksXG4gICAgICB0YXJnZXRTdGFydFxuICAgIClcbiAgfVxuXG4gIHJldHVybiBsZW5cbn1cblxuLy8gVXNhZ2U6XG4vLyAgICBidWZmZXIuZmlsbChudW1iZXJbLCBvZmZzZXRbLCBlbmRdXSlcbi8vICAgIGJ1ZmZlci5maWxsKGJ1ZmZlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoc3RyaW5nWywgb2Zmc2V0WywgZW5kXV1bLCBlbmNvZGluZ10pXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiBmaWxsICh2YWwsIHN0YXJ0LCBlbmQsIGVuY29kaW5nKSB7XG4gIC8vIEhhbmRsZSBzdHJpbmcgY2FzZXM6XG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIGlmICh0eXBlb2Ygc3RhcnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IHN0YXJ0XG4gICAgICBzdGFydCA9IDBcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZW5kID09PSAnc3RyaW5nJykge1xuICAgICAgZW5jb2RpbmcgPSBlbmRcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfVxuICAgIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2VuY29kaW5nIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJyAmJiAhQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgfVxuICAgIGlmICh2YWwubGVuZ3RoID09PSAxKSB7XG4gICAgICB2YXIgY29kZSA9IHZhbC5jaGFyQ29kZUF0KDApXG4gICAgICBpZiAoKGVuY29kaW5nID09PSAndXRmOCcgJiYgY29kZSA8IDEyOCkgfHxcbiAgICAgICAgICBlbmNvZGluZyA9PT0gJ2xhdGluMScpIHtcbiAgICAgICAgLy8gRmFzdCBwYXRoOiBJZiBgdmFsYCBmaXRzIGludG8gYSBzaW5nbGUgYnl0ZSwgdXNlIHRoYXQgbnVtZXJpYyB2YWx1ZS5cbiAgICAgICAgdmFsID0gY29kZVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDI1NVxuICB9XG5cbiAgLy8gSW52YWxpZCByYW5nZXMgYXJlIG5vdCBzZXQgdG8gYSBkZWZhdWx0LCBzbyBjYW4gcmFuZ2UgY2hlY2sgZWFybHkuXG4gIGlmIChzdGFydCA8IDAgfHwgdGhpcy5sZW5ndGggPCBzdGFydCB8fCB0aGlzLmxlbmd0aCA8IGVuZCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdPdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzdGFydCA9IHN0YXJ0ID4+PiAwXG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gdGhpcy5sZW5ndGggOiBlbmQgPj4+IDBcblxuICBpZiAoIXZhbCkgdmFsID0gMFxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICAgIHRoaXNbaV0gPSB2YWxcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIGJ5dGVzID0gQnVmZmVyLmlzQnVmZmVyKHZhbClcbiAgICAgID8gdmFsXG4gICAgICA6IEJ1ZmZlci5mcm9tKHZhbCwgZW5jb2RpbmcpXG4gICAgdmFyIGxlbiA9IGJ5dGVzLmxlbmd0aFxuICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSB2YWx1ZSBcIicgKyB2YWwgK1xuICAgICAgICAnXCIgaXMgaW52YWxpZCBmb3IgYXJndW1lbnQgXCJ2YWx1ZVwiJylcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IGVuZCAtIHN0YXJ0OyArK2kpIHtcbiAgICAgIHRoaXNbaSArIHN0YXJ0XSA9IGJ5dGVzW2kgJSBsZW5dXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG52YXIgSU5WQUxJRF9CQVNFNjRfUkUgPSAvW14rLzAtOUEtWmEtei1fXS9nXG5cbmZ1bmN0aW9uIGJhc2U2NGNsZWFuIChzdHIpIHtcbiAgLy8gTm9kZSB0YWtlcyBlcXVhbCBzaWducyBhcyBlbmQgb2YgdGhlIEJhc2U2NCBlbmNvZGluZ1xuICBzdHIgPSBzdHIuc3BsaXQoJz0nKVswXVxuICAvLyBOb2RlIHN0cmlwcyBvdXQgaW52YWxpZCBjaGFyYWN0ZXJzIGxpa2UgXFxuIGFuZCBcXHQgZnJvbSB0aGUgc3RyaW5nLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgc3RyID0gc3RyLnRyaW0oKS5yZXBsYWNlKElOVkFMSURfQkFTRTY0X1JFLCAnJylcbiAgLy8gTm9kZSBjb252ZXJ0cyBzdHJpbmdzIHdpdGggbGVuZ3RoIDwgMiB0byAnJ1xuICBpZiAoc3RyLmxlbmd0aCA8IDIpIHJldHVybiAnJ1xuICAvLyBOb2RlIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBiYXNlNjQgc3RyaW5ncyAobWlzc2luZyB0cmFpbGluZyA9PT0pLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgd2hpbGUgKHN0ci5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgc3RyID0gc3RyICsgJz0nXG4gIH1cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHJpbmcsIHVuaXRzKSB7XG4gIHVuaXRzID0gdW5pdHMgfHwgSW5maW5pdHlcbiAgdmFyIGNvZGVQb2ludFxuICB2YXIgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aFxuICB2YXIgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcbiAgdmFyIGJ5dGVzID0gW11cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgY29kZVBvaW50ID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcblxuICAgIC8vIGlzIHN1cnJvZ2F0ZSBjb21wb25lbnRcbiAgICBpZiAoY29kZVBvaW50ID4gMHhEN0ZGICYmIGNvZGVQb2ludCA8IDB4RTAwMCkge1xuICAgICAgLy8gbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICghbGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgICAvLyBubyBsZWFkIHlldFxuICAgICAgICBpZiAoY29kZVBvaW50ID4gMHhEQkZGKSB7XG4gICAgICAgICAgLy8gdW5leHBlY3RlZCB0cmFpbFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSBpZiAoaSArIDEgPT09IGxlbmd0aCkge1xuICAgICAgICAgIC8vIHVucGFpcmVkIGxlYWRcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmFsaWQgbGVhZFxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gMiBsZWFkcyBpbiBhIHJvd1xuICAgICAgaWYgKGNvZGVQb2ludCA8IDB4REMwMCkge1xuICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyB2YWxpZCBzdXJyb2dhdGUgcGFpclxuICAgICAgY29kZVBvaW50ID0gKGxlYWRTdXJyb2dhdGUgLSAweEQ4MDAgPDwgMTAgfCBjb2RlUG9pbnQgLSAweERDMDApICsgMHgxMDAwMFxuICAgIH0gZWxzZSBpZiAobGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgLy8gdmFsaWQgYm1wIGNoYXIsIGJ1dCBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgfVxuXG4gICAgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcblxuICAgIC8vIGVuY29kZSB1dGY4XG4gICAgaWYgKGNvZGVQb2ludCA8IDB4ODApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMSkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChjb2RlUG9pbnQpXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDgwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2IHwgMHhDMCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyB8IDB4RTAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDQpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDEyIHwgMHhGMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb2RlIHBvaW50JylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnl0ZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0ciwgdW5pdHMpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcblxuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KGJhc2U2NGNsZWFuKHN0cikpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKSBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbi8vIEFycmF5QnVmZmVyIG9yIFVpbnQ4QXJyYXkgb2JqZWN0cyBmcm9tIG90aGVyIGNvbnRleHRzIChpLmUuIGlmcmFtZXMpIGRvIG5vdCBwYXNzXG4vLyB0aGUgYGluc3RhbmNlb2ZgIGNoZWNrIGJ1dCB0aGV5IHNob3VsZCBiZSB0cmVhdGVkIGFzIG9mIHRoYXQgdHlwZS5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvaXNzdWVzLzE2NlxuZnVuY3Rpb24gaXNJbnN0YW5jZSAob2JqLCB0eXBlKSB7XG4gIHJldHVybiBvYmogaW5zdGFuY2VvZiB0eXBlIHx8XG4gICAgKG9iaiAhPSBudWxsICYmIG9iai5jb25zdHJ1Y3RvciAhPSBudWxsICYmIG9iai5jb25zdHJ1Y3Rvci5uYW1lICE9IG51bGwgJiZcbiAgICAgIG9iai5jb25zdHJ1Y3Rvci5uYW1lID09PSB0eXBlLm5hbWUpXG59XG5mdW5jdGlvbiBudW1iZXJJc05hTiAob2JqKSB7XG4gIC8vIEZvciBJRTExIHN1cHBvcnRcbiAgcmV0dXJuIG9iaiAhPT0gb2JqIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2VsZi1jb21wYXJlXG59XG4iLCJ2YXIgY2hhcmVuYyA9IHtcbiAgLy8gVVRGLTggZW5jb2RpbmdcbiAgdXRmODoge1xuICAgIC8vIENvbnZlcnQgYSBzdHJpbmcgdG8gYSBieXRlIGFycmF5XG4gICAgc3RyaW5nVG9CeXRlczogZnVuY3Rpb24oc3RyKSB7XG4gICAgICByZXR1cm4gY2hhcmVuYy5iaW4uc3RyaW5nVG9CeXRlcyh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoc3RyKSkpO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBhIHN0cmluZ1xuICAgIGJ5dGVzVG9TdHJpbmc6IGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGVzY2FwZShjaGFyZW5jLmJpbi5ieXRlc1RvU3RyaW5nKGJ5dGVzKSkpO1xuICAgIH1cbiAgfSxcblxuICAvLyBCaW5hcnkgZW5jb2RpbmdcbiAgYmluOiB7XG4gICAgLy8gQ29udmVydCBhIHN0cmluZyB0byBhIGJ5dGUgYXJyYXlcbiAgICBzdHJpbmdUb0J5dGVzOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgIGZvciAodmFyIGJ5dGVzID0gW10sIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKVxuICAgICAgICBieXRlcy5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRik7XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBieXRlIGFycmF5IHRvIGEgc3RyaW5nXG4gICAgYnl0ZXNUb1N0cmluZzogZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGZvciAodmFyIHN0ciA9IFtdLCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKVxuICAgICAgICBzdHIucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKSk7XG4gICAgICByZXR1cm4gc3RyLmpvaW4oJycpO1xuICAgIH1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjaGFyZW5jO1xuIiwiLyohXG4gKiBqUXVlcnkgY2xpcC1wYXRoLXBvbHlnb24gUGx1Z2luIHYwLjEuMTQgKDIwMTktMTEtMTYpXG4gKiBqUXVlcnkgcGx1Z2luIHRoYXQgbWFrZXMgZWFzeSB0byB1c2UgY2xpcC1wYXRoIG9uIHdoYXRldmVyIHRhZyB1bmRlciBkaWZmZXJlbnQgYnJvd3NlcnNcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmRydXNpZWN6a28vY2xpcC1wYXRoLXBvbHlnb25cbiAqIFxuICogQ29weXJpZ2h0IDIwMTkgS2Fyb2wgQW5kcnVzaWVjemtvXG4gKiBSZWxlYXNlZCB1bmRlciBNSVQgbGljZW5zZVxuICovXG5cbnZhciBnbG9iYWxWYXJpYWJsZSA9IHdpbmRvdyB8fCByb290O1xudmFyIGpRdWVyeSA9IGpRdWVyeSB8fCBnbG9iYWxWYXJpYWJsZS5qUXVlcnkgfHwgcmVxdWlyZShcImpxdWVyeVwiKTtcblxuKGZ1bmN0aW9uKCQpIHtcbiAgdmFyIGlkID0gMDtcblxuICB2YXIgQ2xpcFBhdGggPSBmdW5jdGlvbihqUXVlcnksICRlbCwgcG9pbnRzLCBvcHRpb25zKSB7XG4gICAgdGhpcy4kID0galF1ZXJ5O1xuICAgIHRoaXMuJGVsID0gJGVsO1xuICAgIHRoaXMucG9pbnRzID0gcG9pbnRzO1xuICAgIHRoaXMuc3ZnRGVmSWQgPSAnY2xpcFBhdGhQb2x5Z29uR2VuSWQnICsgaWQrKztcblxuICAgIHRoaXMucHJvY2Vzc09wdGlvbnMob3B0aW9ucyk7XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gQ2xpcFBhdGg7XG4gICAgfVxuICAgIGV4cG9ydHMuQ2xpcFBhdGggPSBDbGlwUGF0aDtcbiAgfSBlbHNlIHtcbiAgICBnbG9iYWxWYXJpYWJsZS5DbGlwUGF0aCA9IENsaXBQYXRoO1xuICB9XG5cbiAgQ2xpcFBhdGgucHJvdG90eXBlID0ge1xuXG4gICAgJDogbnVsbCxcbiAgICAkZWw6IG51bGwsXG4gICAgcG9pbnRzOiBudWxsLFxuXG4gICAgaXNGb3JXZWJraXQ6IHRydWUsXG4gICAgaXNGb3JTdmc6IHRydWUsXG4gICAgc3ZnRGVmSWQ6IG51bGwsXG4gICAgaXNQZXJjZW50YWdlOiBmYWxzZSxcblxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9jcmVhdGVDbGlwUGF0aCh0aGlzLnBvaW50cyk7XG4gICAgfSxcblxuICAgIF9jcmVhdGVDbGlwUGF0aDogZnVuY3Rpb24ocG9pbnRzKSB7XG4gICAgICB0aGlzLl9jcmVhdGVTdmdEZWZzKCk7XG4gICAgICBpZiAodGhpcy5pc0ZvclN2Zykge1xuICAgICAgICB0aGlzLl9jcmVhdGVTdmdCYXNlZENsaXBQYXRoKHBvaW50cyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5pc0ZvcldlYmtpdCkge1xuICAgICAgICB0aGlzLl9jcmVhdGVXZWJraXRDbGlwUGF0aChwb2ludHMpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfY3JlYXRlV2Via2l0Q2xpcFBhdGg6IGZ1bmN0aW9uKHBvaW50cykge1xuICAgICAgdmFyIGNsaXBQYXRoID0gXCJwb2x5Z29uKFwiICsgdGhpcy5fdHJhbnNsYXRlUG9pbnRzKHBvaW50cywgdHJ1ZSwgdGhpcy5pc1BlcmNlbnRhZ2UpICsgXCIpXCI7XG4gICAgICB0aGlzLiRlbC5jc3MoJy13ZWJraXQtY2xpcC1wYXRoJywgY2xpcFBhdGgpO1xuICAgIH0sXG5cbiAgICBfY3JlYXRlU3ZnQmFzZWRDbGlwUGF0aDogZnVuY3Rpb24ocG9pbnRzKSB7XG4gICAgICB0aGlzLiQoJyMnICsgdGhpcy5zdmdEZWZJZCArICcnKS5maW5kKCdwb2x5Z29uJykuYXR0cigncG9pbnRzJywgdGhpcy5fdHJhbnNsYXRlUG9pbnRzKHBvaW50cywgZmFsc2UsIHRoaXMuaXNQZXJjZW50YWdlKSk7XG4gICAgICB0aGlzLiRlbC5jc3MoJ2NsaXAtcGF0aCcsICd1cmwoIycgKyB0aGlzLnN2Z0RlZklkICsgJyknKTtcbiAgICB9LFxuXG5cbiAgICBfdHJhbnNsYXRlUG9pbnRzOiBmdW5jdGlvbihwb2ludHMsIHdpdGhVbml0LCBpc1BlcmNlbnRhZ2UpIHtcbiAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgaW4gcG9pbnRzKSB7XG4gICAgICAgIHZhciB4ID0gdGhpcy5faGFuZGxlUHhzKHBvaW50c1tpXVswXSwgd2l0aFVuaXQsIGlzUGVyY2VudGFnZSk7XG4gICAgICAgIHZhciB5ID0gdGhpcy5faGFuZGxlUHhzKHBvaW50c1tpXVsxXSwgd2l0aFVuaXQsIGlzUGVyY2VudGFnZSk7XG4gICAgICAgIHJlc3VsdC5wdXNoKHggKyAnICcgKyB5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQuam9pbignLCAnKTtcbiAgICB9LFxuXG4gICAgX2hhbmRsZVB4czogZnVuY3Rpb24obnVtYmVyLCB3aXRoVW5pdCwgaXNQZXJjZW50YWdlKSB7XG4gICAgICBpZiAobnVtYmVyID09PSAwKSB7XG4gICAgICAgIHJldHVybiBudW1iZXI7XG4gICAgICB9XG4gICAgICBpZiAoIXdpdGhVbml0KSB7XG4gICAgICAgIGlmIChpc1BlcmNlbnRhZ2UpIHtcbiAgICAgICAgICByZXR1cm4gbnVtYmVyIC8gMTAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudW1iZXI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudW1iZXIgKyAoaXNQZXJjZW50YWdlID8gXCIlXCIgOiBcInB4XCIpO1xuICAgIH0sXG5cbiAgICBfY3JlYXRlU3ZnRWxlbWVudDogZnVuY3Rpb24oZWxlbWVudE5hbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLiQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIGVsZW1lbnROYW1lKSk7XG4gICAgfSxcblxuICAgIF9jcmVhdGVTdmdEZWZzOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLiQoJyMnICsgdGhpcy5zdmdEZWZJZCArICcnKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdmFyICRzdmcgPSB0aGlzLl9jcmVhdGVTdmdFbGVtZW50KCdzdmcnKS5hdHRyKCd3aWR0aCcsIDApLmF0dHIoJ2hlaWdodCcsIDApLmNzcyh7XG4gICAgICAgICAgJ3Bvc2l0aW9uJzogJ2Fic29sdXRlJyxcbiAgICAgICAgICAndmlzaWJpbGl0eSc6ICdoaWRkZW4nLFxuICAgICAgICAgICd3aWR0aCc6IDAsXG4gICAgICAgICAgJ2hlaWdodCc6IDBcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciAkZGVmcyA9IHRoaXMuX2NyZWF0ZVN2Z0VsZW1lbnQoJ2RlZnMnKTtcbiAgICAgICAgJHN2Zy5hcHBlbmQoJGRlZnMpO1xuICAgICAgICB2YXIgJGNsaXBwYXRoID0gdGhpcy5fY3JlYXRlU3ZnRWxlbWVudCgnY2xpcFBhdGgnKS5hdHRyKCdpZCcsIHRoaXMuc3ZnRGVmSWQpO1xuICAgICAgICBpZiAodGhpcy5pc1BlcmNlbnRhZ2UpIHtcbiAgICAgICAgICAkY2xpcHBhdGguZ2V0KDApLnNldEF0dHJpYnV0ZSgnY2xpcFBhdGhVbml0cycsICdvYmplY3RCb3VuZGluZ0JveCcpO1xuICAgICAgICB9XG4gICAgICAgICRkZWZzLmFwcGVuZCgkY2xpcHBhdGgpO1xuICAgICAgICB2YXIgJHBvbHlnb24gPSB0aGlzLl9jcmVhdGVTdmdFbGVtZW50KCdwb2x5Z29uJyk7XG4gICAgICAgICRjbGlwcGF0aC5hcHBlbmQoJHBvbHlnb24pO1xuICAgICAgICB0aGlzLiQoJ2JvZHknKS5hcHBlbmQoJHN2Zyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHByb2Nlc3NPcHRpb25zOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB0aGlzLmlzRm9yV2Via2l0ID0gKG9wdGlvbnMgJiYgdHlwZW9mKG9wdGlvbnMuaXNGb3JXZWJraXQpICE9PSBcInVuZGVmaW5lZFwiKSA/IG9wdGlvbnMuaXNGb3JXZWJraXQgOiB0aGlzLmlzRm9yV2Via2l0O1xuICAgICAgdGhpcy5pc0ZvclN2ZyA9IChvcHRpb25zICYmIHR5cGVvZihvcHRpb25zLmlzRm9yU3ZnKSAhPT0gXCJ1bmRlZmluZWRcIikgPyBvcHRpb25zLmlzRm9yU3ZnIDogdGhpcy5pc0ZvclN2ZztcbiAgICAgIHRoaXMuaXNQZXJjZW50YWdlID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5pc1BlcmNlbnRhZ2UgfHwgdGhpcy5pc1BlcmNlbnRhZ2UpO1xuICAgICAgdGhpcy5zdmdEZWZJZCA9IChvcHRpb25zICYmIG9wdGlvbnMuc3ZnRGVmSWQpIHx8IHRoaXMuc3ZnRGVmSWQ7XG4gICAgfVxuICB9O1xuICBcbiAgJC5mbi5jbGlwUGF0aCA9IGZ1bmN0aW9uKHBvaW50cywgb3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJGVsID0gJCh0aGlzKTtcbiAgICAgIHZhciBjbGlwUGF0aCA9IG5ldyBDbGlwUGF0aCgkLCAkZWwsIHBvaW50cywgb3B0aW9ucyk7XG4gICAgICBjbGlwUGF0aC5jcmVhdGUoKTtcbiAgICB9KTtcbiAgfTtcblxufSkuY2FsbCh0aGlzLCBqUXVlcnkpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgYmFzZTY0bWFwXG4gICAgICA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJyxcblxuICBjcnlwdCA9IHtcbiAgICAvLyBCaXQtd2lzZSByb3RhdGlvbiBsZWZ0XG4gICAgcm90bDogZnVuY3Rpb24obiwgYikge1xuICAgICAgcmV0dXJuIChuIDw8IGIpIHwgKG4gPj4+ICgzMiAtIGIpKTtcbiAgICB9LFxuXG4gICAgLy8gQml0LXdpc2Ugcm90YXRpb24gcmlnaHRcbiAgICByb3RyOiBmdW5jdGlvbihuLCBiKSB7XG4gICAgICByZXR1cm4gKG4gPDwgKDMyIC0gYikpIHwgKG4gPj4+IGIpO1xuICAgIH0sXG5cbiAgICAvLyBTd2FwIGJpZy1lbmRpYW4gdG8gbGl0dGxlLWVuZGlhbiBhbmQgdmljZSB2ZXJzYVxuICAgIGVuZGlhbjogZnVuY3Rpb24obikge1xuICAgICAgLy8gSWYgbnVtYmVyIGdpdmVuLCBzd2FwIGVuZGlhblxuICAgICAgaWYgKG4uY29uc3RydWN0b3IgPT0gTnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBjcnlwdC5yb3RsKG4sIDgpICYgMHgwMEZGMDBGRiB8IGNyeXB0LnJvdGwobiwgMjQpICYgMHhGRjAwRkYwMDtcbiAgICAgIH1cblxuICAgICAgLy8gRWxzZSwgYXNzdW1lIGFycmF5IGFuZCBzd2FwIGFsbCBpdGVtc1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuLmxlbmd0aDsgaSsrKVxuICAgICAgICBuW2ldID0gY3J5cHQuZW5kaWFuKG5baV0pO1xuICAgICAgcmV0dXJuIG47XG4gICAgfSxcblxuICAgIC8vIEdlbmVyYXRlIGFuIGFycmF5IG9mIGFueSBsZW5ndGggb2YgcmFuZG9tIGJ5dGVzXG4gICAgcmFuZG9tQnl0ZXM6IGZ1bmN0aW9uKG4pIHtcbiAgICAgIGZvciAodmFyIGJ5dGVzID0gW107IG4gPiAwOyBuLS0pXG4gICAgICAgIGJ5dGVzLnB1c2goTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjU2KSk7XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBieXRlIGFycmF5IHRvIGJpZy1lbmRpYW4gMzItYml0IHdvcmRzXG4gICAgYnl0ZXNUb1dvcmRzOiBmdW5jdGlvbihieXRlcykge1xuICAgICAgZm9yICh2YXIgd29yZHMgPSBbXSwgaSA9IDAsIGIgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyssIGIgKz0gOClcbiAgICAgICAgd29yZHNbYiA+Pj4gNV0gfD0gYnl0ZXNbaV0gPDwgKDI0IC0gYiAlIDMyKTtcbiAgICAgIHJldHVybiB3b3JkcztcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBiaWctZW5kaWFuIDMyLWJpdCB3b3JkcyB0byBhIGJ5dGUgYXJyYXlcbiAgICB3b3Jkc1RvQnl0ZXM6IGZ1bmN0aW9uKHdvcmRzKSB7XG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdLCBiID0gMDsgYiA8IHdvcmRzLmxlbmd0aCAqIDMyOyBiICs9IDgpXG4gICAgICAgIGJ5dGVzLnB1c2goKHdvcmRzW2IgPj4+IDVdID4+PiAoMjQgLSBiICUgMzIpKSAmIDB4RkYpO1xuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBhIGhleCBzdHJpbmdcbiAgICBieXRlc1RvSGV4OiBmdW5jdGlvbihieXRlcykge1xuICAgICAgZm9yICh2YXIgaGV4ID0gW10sIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaGV4LnB1c2goKGJ5dGVzW2ldID4+PiA0KS50b1N0cmluZygxNikpO1xuICAgICAgICBoZXgucHVzaCgoYnl0ZXNbaV0gJiAweEYpLnRvU3RyaW5nKDE2KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGV4LmpvaW4oJycpO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgaGV4IHN0cmluZyB0byBhIGJ5dGUgYXJyYXlcbiAgICBoZXhUb0J5dGVzOiBmdW5jdGlvbihoZXgpIHtcbiAgICAgIGZvciAodmFyIGJ5dGVzID0gW10sIGMgPSAwOyBjIDwgaGV4Lmxlbmd0aDsgYyArPSAyKVxuICAgICAgICBieXRlcy5wdXNoKHBhcnNlSW50KGhleC5zdWJzdHIoYywgMiksIDE2KSk7XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBieXRlIGFycmF5IHRvIGEgYmFzZS02NCBzdHJpbmdcbiAgICBieXRlc1RvQmFzZTY0OiBmdW5jdGlvbihieXRlcykge1xuICAgICAgZm9yICh2YXIgYmFzZTY0ID0gW10sIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgdmFyIHRyaXBsZXQgPSAoYnl0ZXNbaV0gPDwgMTYpIHwgKGJ5dGVzW2kgKyAxXSA8PCA4KSB8IGJ5dGVzW2kgKyAyXTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCA0OyBqKyspXG4gICAgICAgICAgaWYgKGkgKiA4ICsgaiAqIDYgPD0gYnl0ZXMubGVuZ3RoICogOClcbiAgICAgICAgICAgIGJhc2U2NC5wdXNoKGJhc2U2NG1hcC5jaGFyQXQoKHRyaXBsZXQgPj4+IDYgKiAoMyAtIGopKSAmIDB4M0YpKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBiYXNlNjQucHVzaCgnPScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJhc2U2NC5qb2luKCcnKTtcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGJhc2UtNjQgc3RyaW5nIHRvIGEgYnl0ZSBhcnJheVxuICAgIGJhc2U2NFRvQnl0ZXM6IGZ1bmN0aW9uKGJhc2U2NCkge1xuICAgICAgLy8gUmVtb3ZlIG5vbi1iYXNlLTY0IGNoYXJhY3RlcnNcbiAgICAgIGJhc2U2NCA9IGJhc2U2NC5yZXBsYWNlKC9bXkEtWjAtOStcXC9dL2lnLCAnJyk7XG5cbiAgICAgIGZvciAodmFyIGJ5dGVzID0gW10sIGkgPSAwLCBpbW9kNCA9IDA7IGkgPCBiYXNlNjQubGVuZ3RoO1xuICAgICAgICAgIGltb2Q0ID0gKytpICUgNCkge1xuICAgICAgICBpZiAoaW1vZDQgPT0gMCkgY29udGludWU7XG4gICAgICAgIGJ5dGVzLnB1c2goKChiYXNlNjRtYXAuaW5kZXhPZihiYXNlNjQuY2hhckF0KGkgLSAxKSlcbiAgICAgICAgICAgICYgKE1hdGgucG93KDIsIC0yICogaW1vZDQgKyA4KSAtIDEpKSA8PCAoaW1vZDQgKiAyKSlcbiAgICAgICAgICAgIHwgKGJhc2U2NG1hcC5pbmRleE9mKGJhc2U2NC5jaGFyQXQoaSkpID4+PiAoNiAtIGltb2Q0ICogMikpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBieXRlcztcbiAgICB9XG4gIH07XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBjcnlwdDtcbn0pKCk7XG4iLCJleHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IChuQnl0ZXMgKiA4KSAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IChlICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IChtICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSAobkJ5dGVzICogOCkgLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKCh2YWx1ZSAqIGMpIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG4iLCIvKlxuICogcVRpcDIgLSBQcmV0dHkgcG93ZXJmdWwgdG9vbHRpcHMgLSB2My4wLjNcbiAqIGh0dHA6Ly9xdGlwMi5jb21cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTYgXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VzXG4gKiBodHRwOi8vanF1ZXJ5Lm9yZy9saWNlbnNlXG4gKlxuICogRGF0ZTogV2VkIE1heSAxMSAyMDE2IDEwOjMxIEdNVCswMTAwKzAxMDBcbiAqIFBsdWdpbnM6IHRpcHMgbW9kYWwgdmlld3BvcnQgc3ZnIGltYWdlbWFwIGllNlxuICogU3R5bGVzOiBjb3JlIGJhc2ljIGNzczNcbiAqL1xuLypnbG9iYWwgd2luZG93OiBmYWxzZSwgalF1ZXJ5OiBmYWxzZSwgY29uc29sZTogZmFsc2UsIGRlZmluZTogZmFsc2UgKi9cblxuLyogQ2FjaGUgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkICovXG4oZnVuY3Rpb24oIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCApIHtcblxuLy8gVXNlcyBBTUQgb3IgYnJvd3NlciBnbG9iYWxzIHRvIGNyZWF0ZSBhIGpRdWVyeSBwbHVnaW4uXG4oZnVuY3Rpb24oIGZhY3RvcnkgKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XG5cdH1cblx0ZWxzZSBpZihqUXVlcnkgJiYgIWpRdWVyeS5mbi5xdGlwKSB7XG5cdFx0ZmFjdG9yeShqUXVlcnkpO1xuXHR9XG59XG4oZnVuY3Rpb24oJCkge1xuXHRcInVzZSBzdHJpY3RcIjsgLy8gRW5hYmxlIEVDTUFTY3JpcHQgXCJzdHJpY3RcIiBvcGVyYXRpb24gZm9yIHRoaXMgZnVuY3Rpb24uIFNlZSBtb3JlOiBodHRwOi8vZWpvaG4ub3JnL2Jsb2cvZWNtYXNjcmlwdC01LXN0cmljdC1tb2RlLWpzb24tYW5kLW1vcmUvXG47Ly8gTXVuZ2UgdGhlIHByaW1pdGl2ZXMgLSBQYXVsIElyaXNoIHRpcFxudmFyIFRSVUUgPSB0cnVlLFxuRkFMU0UgPSBmYWxzZSxcbk5VTEwgPSBudWxsLFxuXG4vLyBDb21tb24gdmFyaWFibGVzXG5YID0gJ3gnLCBZID0gJ3knLFxuV0lEVEggPSAnd2lkdGgnLFxuSEVJR0hUID0gJ2hlaWdodCcsXG5cbi8vIFBvc2l0aW9uaW5nIHNpZGVzXG5UT1AgPSAndG9wJyxcbkxFRlQgPSAnbGVmdCcsXG5CT1RUT00gPSAnYm90dG9tJyxcblJJR0hUID0gJ3JpZ2h0JyxcbkNFTlRFUiA9ICdjZW50ZXInLFxuXG4vLyBQb3NpdGlvbiBhZGp1c3RtZW50IHR5cGVzXG5GTElQID0gJ2ZsaXAnLFxuRkxJUElOVkVSVCA9ICdmbGlwaW52ZXJ0JyxcblNISUZUID0gJ3NoaWZ0JyxcblxuLy8gU2hvcnRjdXQgdmFyc1xuUVRJUCwgUFJPVE9UWVBFLCBDT1JORVIsIENIRUNLUyxcblBMVUdJTlMgPSB7fSxcbk5BTUVTUEFDRSA9ICdxdGlwJyxcbkFUVFJfSEFTID0gJ2RhdGEtaGFzcXRpcCcsXG5BVFRSX0lEID0gJ2RhdGEtcXRpcC1pZCcsXG5XSURHRVQgPSBbJ3VpLXdpZGdldCcsICd1aS10b29sdGlwJ10sXG5TRUxFQ1RPUiA9ICcuJytOQU1FU1BBQ0UsXG5JTkFDVElWRV9FVkVOVFMgPSAnY2xpY2sgZGJsY2xpY2sgbW91c2Vkb3duIG1vdXNldXAgbW91c2Vtb3ZlIG1vdXNlbGVhdmUgbW91c2VlbnRlcicuc3BsaXQoJyAnKSxcblxuQ0xBU1NfRklYRUQgPSBOQU1FU1BBQ0UrJy1maXhlZCcsXG5DTEFTU19ERUZBVUxUID0gTkFNRVNQQUNFICsgJy1kZWZhdWx0JyxcbkNMQVNTX0ZPQ1VTID0gTkFNRVNQQUNFICsgJy1mb2N1cycsXG5DTEFTU19IT1ZFUiA9IE5BTUVTUEFDRSArICctaG92ZXInLFxuQ0xBU1NfRElTQUJMRUQgPSBOQU1FU1BBQ0UrJy1kaXNhYmxlZCcsXG5cbnJlcGxhY2VTdWZmaXggPSAnX3JlcGxhY2VkQnlxVGlwJyxcbm9sZHRpdGxlID0gJ29sZHRpdGxlJyxcbnRyYWNraW5nQm91bmQsXG5cbi8vIEJyb3dzZXIgZGV0ZWN0aW9uXG5CUk9XU0VSID0ge1xuXHQvKlxuXHQgKiBJRSB2ZXJzaW9uIGRldGVjdGlvblxuXHQgKlxuXHQgKiBBZGFwdGVkIGZyb206IGh0dHA6Ly9hamF4aWFuLmNvbS9hcmNoaXZlcy9hdHRhY2stb2YtdGhlLWllLWNvbmRpdGlvbmFsLWNvbW1lbnRcblx0ICogQ3JlZGl0IHRvIEphbWVzIFBhZG9sc2V5IGZvciB0aGUgb3JpZ2luYWwgaW1wbGVtbnRhdGlvbiFcblx0ICovXG5cdGllOiAoZnVuY3Rpb24oKSB7XG5cdFx0LyogZXNsaW50LWRpc2FibGUgbm8tZW1wdHkgKi9cblx0XHR2YXIgdiwgaTtcblx0XHRmb3IgKFxuXHRcdFx0diA9IDQsIGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdChpLmlubmVySFRNTCA9ICc8IS0tW2lmIGd0IElFICcgKyB2ICsgJ10+PGk+PC9pPjwhW2VuZGlmXS0tPicpICYmIGkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2knKVswXTtcblx0XHRcdHYrPTFcblx0XHQpIHt9XG5cdFx0cmV0dXJuIHYgPiA0ID8gdiA6IE5hTjtcblx0XHQvKiBlc2xpbnQtZW5hYmxlIG5vLWVtcHR5ICovXG5cdH0pKCksXG5cblx0Lypcblx0ICogaU9TIHZlcnNpb24gZGV0ZWN0aW9uXG5cdCAqL1xuXHRpT1M6IHBhcnNlRmxvYXQoXG5cdFx0KCcnICsgKC9DUFUuKk9TIChbMC05X117MSw1fSl8KENQVSBsaWtlKS4qQXBwbGVXZWJLaXQuKk1vYmlsZS9pLmV4ZWMobmF2aWdhdG9yLnVzZXJBZ2VudCkgfHwgWzAsJyddKVsxXSlcblx0XHQucmVwbGFjZSgndW5kZWZpbmVkJywgJzNfMicpLnJlcGxhY2UoJ18nLCAnLicpLnJlcGxhY2UoJ18nLCAnJylcblx0KSB8fCBGQUxTRVxufTtcbjtmdW5jdGlvbiBRVGlwKHRhcmdldCwgb3B0aW9ucywgaWQsIGF0dHIpIHtcblx0Ly8gRWxlbWVudHMgYW5kIElEXG5cdHRoaXMuaWQgPSBpZDtcblx0dGhpcy50YXJnZXQgPSB0YXJnZXQ7XG5cdHRoaXMudG9vbHRpcCA9IE5VTEw7XG5cdHRoaXMuZWxlbWVudHMgPSB7IHRhcmdldDogdGFyZ2V0IH07XG5cblx0Ly8gSW50ZXJuYWwgY29uc3RydWN0c1xuXHR0aGlzLl9pZCA9IE5BTUVTUEFDRSArICctJyArIGlkO1xuXHR0aGlzLnRpbWVycyA9IHsgaW1nOiB7fSB9O1xuXHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXHR0aGlzLnBsdWdpbnMgPSB7fTtcblxuXHQvLyBDYWNoZSBvYmplY3Rcblx0dGhpcy5jYWNoZSA9IHtcblx0XHRldmVudDoge30sXG5cdFx0dGFyZ2V0OiAkKCksXG5cdFx0ZGlzYWJsZWQ6IEZBTFNFLFxuXHRcdGF0dHI6IGF0dHIsXG5cdFx0b25Ub29sdGlwOiBGQUxTRSxcblx0XHRsYXN0Q2xhc3M6ICcnXG5cdH07XG5cblx0Ly8gU2V0IHRoZSBpbml0aWFsIGZsYWdzXG5cdHRoaXMucmVuZGVyZWQgPSB0aGlzLmRlc3Ryb3llZCA9IHRoaXMuZGlzYWJsZWQgPSB0aGlzLndhaXRpbmcgPVxuXHRcdHRoaXMuaGlkZGVuRHVyaW5nV2FpdCA9IHRoaXMucG9zaXRpb25pbmcgPSB0aGlzLnRyaWdnZXJpbmcgPSBGQUxTRTtcbn1cblBST1RPVFlQRSA9IFFUaXAucHJvdG90eXBlO1xuXG5QUk9UT1RZUEUuX3doZW4gPSBmdW5jdGlvbihkZWZlcnJlZHMpIHtcblx0cmV0dXJuICQud2hlbi5hcHBseSgkLCBkZWZlcnJlZHMpO1xufTtcblxuUFJPVE9UWVBFLnJlbmRlciA9IGZ1bmN0aW9uKHNob3cpIHtcblx0aWYodGhpcy5yZW5kZXJlZCB8fCB0aGlzLmRlc3Ryb3llZCkgeyByZXR1cm4gdGhpczsgfSAvLyBJZiB0b29sdGlwIGhhcyBhbHJlYWR5IGJlZW4gcmVuZGVyZWQsIGV4aXRcblxuXHR2YXIgc2VsZiA9IHRoaXMsXG5cdFx0b3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcblx0XHRjYWNoZSA9IHRoaXMuY2FjaGUsXG5cdFx0ZWxlbWVudHMgPSB0aGlzLmVsZW1lbnRzLFxuXHRcdHRleHQgPSBvcHRpb25zLmNvbnRlbnQudGV4dCxcblx0XHR0aXRsZSA9IG9wdGlvbnMuY29udGVudC50aXRsZSxcblx0XHRidXR0b24gPSBvcHRpb25zLmNvbnRlbnQuYnV0dG9uLFxuXHRcdHBvc09wdGlvbnMgPSBvcHRpb25zLnBvc2l0aW9uLFxuXHRcdGRlZmVycmVkcyA9IFtdO1xuXG5cdC8vIEFkZCBBUklBIGF0dHJpYnV0ZXMgdG8gdGFyZ2V0XG5cdCQuYXR0cih0aGlzLnRhcmdldFswXSwgJ2FyaWEtZGVzY3JpYmVkYnknLCB0aGlzLl9pZCk7XG5cblx0Ly8gQ3JlYXRlIHB1YmxpYyBwb3NpdGlvbiBvYmplY3QgdGhhdCB0cmFja3MgY3VycmVudCBwb3NpdGlvbiBjb3JuZXJzXG5cdGNhY2hlLnBvc0NsYXNzID0gdGhpcy5fY3JlYXRlUG9zQ2xhc3MoXG5cdFx0KHRoaXMucG9zaXRpb24gPSB7IG15OiBwb3NPcHRpb25zLm15LCBhdDogcG9zT3B0aW9ucy5hdCB9KS5teVxuXHQpO1xuXG5cdC8vIENyZWF0ZSB0b29sdGlwIGVsZW1lbnRcblx0dGhpcy50b29sdGlwID0gZWxlbWVudHMudG9vbHRpcCA9ICQoJzxkaXYvPicsIHtcblx0XHQnaWQnOiB0aGlzLl9pZCxcblx0XHQnY2xhc3MnOiBbIE5BTUVTUEFDRSwgQ0xBU1NfREVGQVVMVCwgb3B0aW9ucy5zdHlsZS5jbGFzc2VzLCBjYWNoZS5wb3NDbGFzcyBdLmpvaW4oJyAnKSxcblx0XHQnd2lkdGgnOiBvcHRpb25zLnN0eWxlLndpZHRoIHx8ICcnLFxuXHRcdCdoZWlnaHQnOiBvcHRpb25zLnN0eWxlLmhlaWdodCB8fCAnJyxcblx0XHQndHJhY2tpbmcnOiBwb3NPcHRpb25zLnRhcmdldCA9PT0gJ21vdXNlJyAmJiBwb3NPcHRpb25zLmFkanVzdC5tb3VzZSxcblxuXHRcdC8qIEFSSUEgc3BlY2lmaWMgYXR0cmlidXRlcyAqL1xuXHRcdCdyb2xlJzogJ2FsZXJ0Jyxcblx0XHQnYXJpYS1saXZlJzogJ3BvbGl0ZScsXG5cdFx0J2FyaWEtYXRvbWljJzogRkFMU0UsXG5cdFx0J2FyaWEtZGVzY3JpYmVkYnknOiB0aGlzLl9pZCArICctY29udGVudCcsXG5cdFx0J2FyaWEtaGlkZGVuJzogVFJVRVxuXHR9KVxuXHQudG9nZ2xlQ2xhc3MoQ0xBU1NfRElTQUJMRUQsIHRoaXMuZGlzYWJsZWQpXG5cdC5hdHRyKEFUVFJfSUQsIHRoaXMuaWQpXG5cdC5kYXRhKE5BTUVTUEFDRSwgdGhpcylcblx0LmFwcGVuZFRvKHBvc09wdGlvbnMuY29udGFpbmVyKVxuXHQuYXBwZW5kKFxuXHRcdC8vIENyZWF0ZSBjb250ZW50IGVsZW1lbnRcblx0XHRlbGVtZW50cy5jb250ZW50ID0gJCgnPGRpdiAvPicsIHtcblx0XHRcdCdjbGFzcyc6IE5BTUVTUEFDRSArICctY29udGVudCcsXG5cdFx0XHQnaWQnOiB0aGlzLl9pZCArICctY29udGVudCcsXG5cdFx0XHQnYXJpYS1hdG9taWMnOiBUUlVFXG5cdFx0fSlcblx0KTtcblxuXHQvLyBTZXQgcmVuZGVyZWQgZmxhZyBhbmQgcHJldmVudCByZWR1bmRhbnQgcmVwb3NpdGlvbiBjYWxscyBmb3Igbm93XG5cdHRoaXMucmVuZGVyZWQgPSAtMTtcblx0dGhpcy5wb3NpdGlvbmluZyA9IFRSVUU7XG5cblx0Ly8gQ3JlYXRlIHRpdGxlLi4uXG5cdGlmKHRpdGxlKSB7XG5cdFx0dGhpcy5fY3JlYXRlVGl0bGUoKTtcblxuXHRcdC8vIFVwZGF0ZSB0aXRsZSBvbmx5IGlmIGl0cyBub3QgYSBjYWxsYmFjayAoY2FsbGVkIGluIHRvZ2dsZSBpZiBzbylcblx0XHRpZighJC5pc0Z1bmN0aW9uKHRpdGxlKSkge1xuXHRcdFx0ZGVmZXJyZWRzLnB1c2goIHRoaXMuX3VwZGF0ZVRpdGxlKHRpdGxlLCBGQUxTRSkgKTtcblx0XHR9XG5cdH1cblxuXHQvLyBDcmVhdGUgYnV0dG9uXG5cdGlmKGJ1dHRvbikgeyB0aGlzLl9jcmVhdGVCdXR0b24oKTsgfVxuXG5cdC8vIFNldCBwcm9wZXIgcmVuZGVyZWQgZmxhZyBhbmQgdXBkYXRlIGNvbnRlbnQgaWYgbm90IGEgY2FsbGJhY2sgZnVuY3Rpb24gKGNhbGxlZCBpbiB0b2dnbGUpXG5cdGlmKCEkLmlzRnVuY3Rpb24odGV4dCkpIHtcblx0XHRkZWZlcnJlZHMucHVzaCggdGhpcy5fdXBkYXRlQ29udGVudCh0ZXh0LCBGQUxTRSkgKTtcblx0fVxuXHR0aGlzLnJlbmRlcmVkID0gVFJVRTtcblxuXHQvLyBTZXR1cCB3aWRnZXQgY2xhc3Nlc1xuXHR0aGlzLl9zZXRXaWRnZXQoKTtcblxuXHQvLyBJbml0aWFsaXplICdyZW5kZXInIHBsdWdpbnNcblx0JC5lYWNoKFBMVUdJTlMsIGZ1bmN0aW9uKG5hbWUpIHtcblx0XHR2YXIgaW5zdGFuY2U7XG5cdFx0aWYodGhpcy5pbml0aWFsaXplID09PSAncmVuZGVyJyAmJiAoaW5zdGFuY2UgPSB0aGlzKHNlbGYpKSkge1xuXHRcdFx0c2VsZi5wbHVnaW5zW25hbWVdID0gaW5zdGFuY2U7XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBVbmFzc2lnbiBpbml0aWFsIGV2ZW50cyBhbmQgYXNzaWduIHByb3BlciBldmVudHNcblx0dGhpcy5fdW5hc3NpZ25FdmVudHMoKTtcblx0dGhpcy5fYXNzaWduRXZlbnRzKCk7XG5cblx0Ly8gV2hlbiBkZWZlcnJlZHMgaGF2ZSBjb21wbGV0ZWRcblx0dGhpcy5fd2hlbihkZWZlcnJlZHMpLnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0Ly8gdG9vbHRpcHJlbmRlciBldmVudFxuXHRcdHNlbGYuX3RyaWdnZXIoJ3JlbmRlcicpO1xuXG5cdFx0Ly8gUmVzZXQgZmxhZ3Ncblx0XHRzZWxmLnBvc2l0aW9uaW5nID0gRkFMU0U7XG5cblx0XHQvLyBTaG93IHRvb2x0aXAgaWYgbm90IGhpZGRlbiBkdXJpbmcgd2FpdCBwZXJpb2Rcblx0XHRpZighc2VsZi5oaWRkZW5EdXJpbmdXYWl0ICYmIChvcHRpb25zLnNob3cucmVhZHkgfHwgc2hvdykpIHtcblx0XHRcdHNlbGYudG9nZ2xlKFRSVUUsIGNhY2hlLmV2ZW50LCBGQUxTRSk7XG5cdFx0fVxuXHRcdHNlbGYuaGlkZGVuRHVyaW5nV2FpdCA9IEZBTFNFO1xuXHR9KTtcblxuXHQvLyBFeHBvc2UgQVBJXG5cdFFUSVAuYXBpW3RoaXMuaWRdID0gdGhpcztcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cblBST1RPVFlQRS5kZXN0cm95ID0gZnVuY3Rpb24oaW1tZWRpYXRlKSB7XG5cdC8vIFNldCBmbGFnIHRoZSBzaWduaWZ5IGRlc3Ryb3kgaXMgdGFraW5nIHBsYWNlIHRvIHBsdWdpbnNcblx0Ly8gYW5kIGVuc3VyZSBpdCBvbmx5IGdldHMgZGVzdHJveWVkIG9uY2UhXG5cdGlmKHRoaXMuZGVzdHJveWVkKSB7IHJldHVybiB0aGlzLnRhcmdldDsgfVxuXG5cdGZ1bmN0aW9uIHByb2Nlc3MoKSB7XG5cdFx0aWYodGhpcy5kZXN0cm95ZWQpIHsgcmV0dXJuOyB9XG5cdFx0dGhpcy5kZXN0cm95ZWQgPSBUUlVFO1xuXG5cdFx0dmFyIHRhcmdldCA9IHRoaXMudGFyZ2V0LFxuXHRcdFx0dGl0bGUgPSB0YXJnZXQuYXR0cihvbGR0aXRsZSksXG5cdFx0XHR0aW1lcjtcblxuXHRcdC8vIERlc3Ryb3kgdG9vbHRpcCBpZiByZW5kZXJlZFxuXHRcdGlmKHRoaXMucmVuZGVyZWQpIHtcblx0XHRcdHRoaXMudG9vbHRpcC5zdG9wKDEsMCkuZmluZCgnKicpLnJlbW92ZSgpLmVuZCgpLnJlbW92ZSgpO1xuXHRcdH1cblxuXHRcdC8vIERlc3Ryb3kgYWxsIHBsdWdpbnNcblx0XHQkLmVhY2godGhpcy5wbHVnaW5zLCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuZGVzdHJveSAmJiB0aGlzLmRlc3Ryb3koKTtcblx0XHR9KTtcblxuXHRcdC8vIENsZWFyIHRpbWVyc1xuXHRcdGZvciAodGltZXIgaW4gdGhpcy50aW1lcnMpIHtcblx0XHRcdGlmICh0aGlzLnRpbWVycy5oYXNPd25Qcm9wZXJ0eSh0aW1lcikpIHtcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMudGltZXJzW3RpbWVyXSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZlIGFwaSBvYmplY3QgYW5kIEFSSUEgYXR0cmlidXRlc1xuXHRcdHRhcmdldC5yZW1vdmVEYXRhKE5BTUVTUEFDRSlcblx0XHRcdC5yZW1vdmVBdHRyKEFUVFJfSUQpXG5cdFx0XHQucmVtb3ZlQXR0cihBVFRSX0hBUylcblx0XHRcdC5yZW1vdmVBdHRyKCdhcmlhLWRlc2NyaWJlZGJ5Jyk7XG5cblx0XHQvLyBSZXNldCBvbGQgdGl0bGUgYXR0cmlidXRlIGlmIHJlbW92ZWRcblx0XHRpZih0aGlzLm9wdGlvbnMuc3VwcHJlc3MgJiYgdGl0bGUpIHtcblx0XHRcdHRhcmdldC5hdHRyKCd0aXRsZScsIHRpdGxlKS5yZW1vdmVBdHRyKG9sZHRpdGxlKTtcblx0XHR9XG5cblx0XHQvLyBSZW1vdmUgcVRpcCBldmVudHMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgQVBJXG5cdFx0dGhpcy5fdW5hc3NpZ25FdmVudHMoKTtcblxuXHRcdC8vIFJlbW92ZSBJRCBmcm9tIHVzZWQgaWQgb2JqZWN0cywgYW5kIGRlbGV0ZSBvYmplY3QgcmVmZXJlbmNlc1xuXHRcdC8vIGZvciBiZXR0ZXIgZ2FyYmFnZSBjb2xsZWN0aW9uIGFuZCBsZWFrIHByb3RlY3Rpb25cblx0XHR0aGlzLm9wdGlvbnMgPSB0aGlzLmVsZW1lbnRzID0gdGhpcy5jYWNoZSA9IHRoaXMudGltZXJzID1cblx0XHRcdHRoaXMucGx1Z2lucyA9IHRoaXMubW91c2UgPSBOVUxMO1xuXG5cdFx0Ly8gRGVsZXRlIGVwb3hzZWQgQVBJIG9iamVjdFxuXHRcdGRlbGV0ZSBRVElQLmFwaVt0aGlzLmlkXTtcblx0fVxuXG5cdC8vIElmIGFuIGltbWVkaWF0ZSBkZXN0cm95IGlzIG5lZWRlZFxuXHRpZigoaW1tZWRpYXRlICE9PSBUUlVFIHx8IHRoaXMudHJpZ2dlcmluZyA9PT0gJ2hpZGUnKSAmJiB0aGlzLnJlbmRlcmVkKSB7XG5cdFx0dGhpcy50b29sdGlwLm9uZSgndG9vbHRpcGhpZGRlbicsICQucHJveHkocHJvY2VzcywgdGhpcykpO1xuXHRcdCF0aGlzLnRyaWdnZXJpbmcgJiYgdGhpcy5oaWRlKCk7XG5cdH1cblxuXHQvLyBJZiB3ZSdyZSBub3QgaW4gdGhlIHByb2Nlc3Mgb2YgaGlkaW5nLi4uIHByb2Nlc3Ncblx0ZWxzZSB7IHByb2Nlc3MuY2FsbCh0aGlzKTsgfVxuXG5cdHJldHVybiB0aGlzLnRhcmdldDtcbn07XG47ZnVuY3Rpb24gaW52YWxpZE9wdChhKSB7XG5cdHJldHVybiBhID09PSBOVUxMIHx8ICQudHlwZShhKSAhPT0gJ29iamVjdCc7XG59XG5cbmZ1bmN0aW9uIGludmFsaWRDb250ZW50KGMpIHtcblx0cmV0dXJuICEoJC5pc0Z1bmN0aW9uKGMpIHx8IFxuICAgICAgICAgICAgYyAmJiBjLmF0dHIgfHwgXG4gICAgICAgICAgICBjLmxlbmd0aCB8fCBcbiAgICAgICAgICAgICQudHlwZShjKSA9PT0gJ29iamVjdCcgJiYgKGMuanF1ZXJ5IHx8IGMudGhlbikpO1xufVxuXG4vLyBPcHRpb24gb2JqZWN0IHNhbml0aXplclxuZnVuY3Rpb24gc2FuaXRpemVPcHRpb25zKG9wdHMpIHtcblx0dmFyIGNvbnRlbnQsIHRleHQsIGFqYXgsIG9uY2U7XG5cblx0aWYoaW52YWxpZE9wdChvcHRzKSkgeyByZXR1cm4gRkFMU0U7IH1cblxuXHRpZihpbnZhbGlkT3B0KG9wdHMubWV0YWRhdGEpKSB7XG5cdFx0b3B0cy5tZXRhZGF0YSA9IHsgdHlwZTogb3B0cy5tZXRhZGF0YSB9O1xuXHR9XG5cblx0aWYoJ2NvbnRlbnQnIGluIG9wdHMpIHtcblx0XHRjb250ZW50ID0gb3B0cy5jb250ZW50O1xuXG5cdFx0aWYoaW52YWxpZE9wdChjb250ZW50KSB8fCBjb250ZW50LmpxdWVyeSB8fCBjb250ZW50LmRvbmUpIHtcblx0XHRcdHRleHQgPSBpbnZhbGlkQ29udGVudChjb250ZW50KSA/IEZBTFNFIDogY29udGVudDtcblx0XHRcdGNvbnRlbnQgPSBvcHRzLmNvbnRlbnQgPSB7XG5cdFx0XHRcdHRleHQ6IHRleHRcblx0XHRcdH07XG5cdFx0fVxuXHRcdGVsc2UgeyB0ZXh0ID0gY29udGVudC50ZXh0OyB9XG5cblx0XHQvLyBERVBSRUNBVEVEIC0gT2xkIGNvbnRlbnQuYWpheCBwbHVnaW4gZnVuY3Rpb25hbGl0eVxuXHRcdC8vIENvbnZlcnRzIGl0IGludG8gdGhlIHByb3BlciBEZWZlcnJlZCBzeW50YXhcblx0XHRpZignYWpheCcgaW4gY29udGVudCkge1xuXHRcdFx0YWpheCA9IGNvbnRlbnQuYWpheDtcblx0XHRcdG9uY2UgPSBhamF4ICYmIGFqYXgub25jZSAhPT0gRkFMU0U7XG5cdFx0XHRkZWxldGUgY29udGVudC5hamF4O1xuXG5cdFx0XHRjb250ZW50LnRleHQgPSBmdW5jdGlvbihldmVudCwgYXBpKSB7XG5cdFx0XHRcdHZhciBsb2FkaW5nID0gdGV4dCB8fCAkKHRoaXMpLmF0dHIoYXBpLm9wdGlvbnMuY29udGVudC5hdHRyKSB8fCAnTG9hZGluZy4uLicsXG5cblx0XHRcdFx0ZGVmZXJyZWQgPSAkLmFqYXgoXG5cdFx0XHRcdFx0JC5leHRlbmQoe30sIGFqYXgsIHsgY29udGV4dDogYXBpIH0pXG5cdFx0XHRcdClcblx0XHRcdFx0LnRoZW4oYWpheC5zdWNjZXNzLCBOVUxMLCBhamF4LmVycm9yKVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbihuZXdDb250ZW50KSB7XG5cdFx0XHRcdFx0aWYobmV3Q29udGVudCAmJiBvbmNlKSB7IGFwaS5zZXQoJ2NvbnRlbnQudGV4dCcsIG5ld0NvbnRlbnQpOyB9XG5cdFx0XHRcdFx0cmV0dXJuIG5ld0NvbnRlbnQ7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnJvcikge1xuXHRcdFx0XHRcdGlmKGFwaS5kZXN0cm95ZWQgfHwgeGhyLnN0YXR1cyA9PT0gMCkgeyByZXR1cm47IH1cblx0XHRcdFx0XHRhcGkuc2V0KCdjb250ZW50LnRleHQnLCBzdGF0dXMgKyAnOiAnICsgZXJyb3IpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRyZXR1cm4gIW9uY2UgPyAoYXBpLnNldCgnY29udGVudC50ZXh0JywgbG9hZGluZyksIGRlZmVycmVkKSA6IGxvYWRpbmc7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmKCd0aXRsZScgaW4gY29udGVudCkge1xuXHRcdFx0aWYoJC5pc1BsYWluT2JqZWN0KGNvbnRlbnQudGl0bGUpKSB7XG5cdFx0XHRcdGNvbnRlbnQuYnV0dG9uID0gY29udGVudC50aXRsZS5idXR0b247XG5cdFx0XHRcdGNvbnRlbnQudGl0bGUgPSBjb250ZW50LnRpdGxlLnRleHQ7XG5cdFx0XHR9XG5cblx0XHRcdGlmKGludmFsaWRDb250ZW50KGNvbnRlbnQudGl0bGUgfHwgRkFMU0UpKSB7XG5cdFx0XHRcdGNvbnRlbnQudGl0bGUgPSBGQUxTRTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRpZigncG9zaXRpb24nIGluIG9wdHMgJiYgaW52YWxpZE9wdChvcHRzLnBvc2l0aW9uKSkge1xuXHRcdG9wdHMucG9zaXRpb24gPSB7IG15OiBvcHRzLnBvc2l0aW9uLCBhdDogb3B0cy5wb3NpdGlvbiB9O1xuXHR9XG5cblx0aWYoJ3Nob3cnIGluIG9wdHMgJiYgaW52YWxpZE9wdChvcHRzLnNob3cpKSB7XG5cdFx0b3B0cy5zaG93ID0gb3B0cy5zaG93LmpxdWVyeSA/IHsgdGFyZ2V0OiBvcHRzLnNob3cgfSA6XG5cdFx0XHRvcHRzLnNob3cgPT09IFRSVUUgPyB7IHJlYWR5OiBUUlVFIH0gOiB7IGV2ZW50OiBvcHRzLnNob3cgfTtcblx0fVxuXG5cdGlmKCdoaWRlJyBpbiBvcHRzICYmIGludmFsaWRPcHQob3B0cy5oaWRlKSkge1xuXHRcdG9wdHMuaGlkZSA9IG9wdHMuaGlkZS5qcXVlcnkgPyB7IHRhcmdldDogb3B0cy5oaWRlIH0gOiB7IGV2ZW50OiBvcHRzLmhpZGUgfTtcblx0fVxuXG5cdGlmKCdzdHlsZScgaW4gb3B0cyAmJiBpbnZhbGlkT3B0KG9wdHMuc3R5bGUpKSB7XG5cdFx0b3B0cy5zdHlsZSA9IHsgY2xhc3Nlczogb3B0cy5zdHlsZSB9O1xuXHR9XG5cblx0Ly8gU2FuaXRpemUgcGx1Z2luIG9wdGlvbnNcblx0JC5lYWNoKFBMVUdJTlMsIGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2FuaXRpemUgJiYgdGhpcy5zYW5pdGl6ZShvcHRzKTtcblx0fSk7XG5cblx0cmV0dXJuIG9wdHM7XG59XG5cbi8vIFNldHVwIGJ1aWx0aW4gLnNldCgpIG9wdGlvbiBjaGVja3NcbkNIRUNLUyA9IFBST1RPVFlQRS5jaGVja3MgPSB7XG5cdGJ1aWx0aW46IHtcblx0XHQvLyBDb3JlIGNoZWNrc1xuXHRcdCdeaWQkJzogZnVuY3Rpb24ob2JqLCBvLCB2LCBwcmV2KSB7XG5cdFx0XHR2YXIgaWQgPSB2ID09PSBUUlVFID8gUVRJUC5uZXh0aWQgOiB2LFxuXHRcdFx0XHRuZXdJZCA9IE5BTUVTUEFDRSArICctJyArIGlkO1xuXG5cdFx0XHRpZihpZCAhPT0gRkFMU0UgJiYgaWQubGVuZ3RoID4gMCAmJiAhJCgnIycrbmV3SWQpLmxlbmd0aCkge1xuXHRcdFx0XHR0aGlzLl9pZCA9IG5ld0lkO1xuXG5cdFx0XHRcdGlmKHRoaXMucmVuZGVyZWQpIHtcblx0XHRcdFx0XHR0aGlzLnRvb2x0aXBbMF0uaWQgPSB0aGlzLl9pZDtcblx0XHRcdFx0XHR0aGlzLmVsZW1lbnRzLmNvbnRlbnRbMF0uaWQgPSB0aGlzLl9pZCArICctY29udGVudCc7XG5cdFx0XHRcdFx0dGhpcy5lbGVtZW50cy50aXRsZVswXS5pZCA9IHRoaXMuX2lkICsgJy10aXRsZSc7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgeyBvYmpbb10gPSBwcmV2OyB9XG5cdFx0fSxcblx0XHQnXnByZXJlbmRlcic6IGZ1bmN0aW9uKG9iaiwgbywgdikge1xuXHRcdFx0diAmJiAhdGhpcy5yZW5kZXJlZCAmJiB0aGlzLnJlbmRlcih0aGlzLm9wdGlvbnMuc2hvdy5yZWFkeSk7XG5cdFx0fSxcblxuXHRcdC8vIENvbnRlbnQgY2hlY2tzXG5cdFx0J15jb250ZW50LnRleHQkJzogZnVuY3Rpb24ob2JqLCBvLCB2KSB7XG5cdFx0XHR0aGlzLl91cGRhdGVDb250ZW50KHYpO1xuXHRcdH0sXG5cdFx0J15jb250ZW50LmF0dHIkJzogZnVuY3Rpb24ob2JqLCBvLCB2LCBwcmV2KSB7XG5cdFx0XHRpZih0aGlzLm9wdGlvbnMuY29udGVudC50ZXh0ID09PSB0aGlzLnRhcmdldC5hdHRyKHByZXYpKSB7XG5cdFx0XHRcdHRoaXMuX3VwZGF0ZUNvbnRlbnQoIHRoaXMudGFyZ2V0LmF0dHIodikgKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdCdeY29udGVudC50aXRsZSQnOiBmdW5jdGlvbihvYmosIG8sIHYpIHtcblx0XHRcdC8vIFJlbW92ZSB0aXRsZSBpZiBjb250ZW50IGlzIG51bGxcblx0XHRcdGlmKCF2KSB7IHJldHVybiB0aGlzLl9yZW1vdmVUaXRsZSgpOyB9XG5cblx0XHRcdC8vIElmIHRpdGxlIGlzbid0IGFscmVhZHkgY3JlYXRlZCwgY3JlYXRlIGl0IG5vdyBhbmQgdXBkYXRlXG5cdFx0XHR2ICYmICF0aGlzLmVsZW1lbnRzLnRpdGxlICYmIHRoaXMuX2NyZWF0ZVRpdGxlKCk7XG5cdFx0XHR0aGlzLl91cGRhdGVUaXRsZSh2KTtcblx0XHR9LFxuXHRcdCdeY29udGVudC5idXR0b24kJzogZnVuY3Rpb24ob2JqLCBvLCB2KSB7XG5cdFx0XHR0aGlzLl91cGRhdGVCdXR0b24odik7XG5cdFx0fSxcblx0XHQnXmNvbnRlbnQudGl0bGUuKHRleHR8YnV0dG9uKSQnOiBmdW5jdGlvbihvYmosIG8sIHYpIHtcblx0XHRcdHRoaXMuc2V0KCdjb250ZW50Licrbywgdik7IC8vIEJhY2t3YXJkcyB0aXRsZS50ZXh0L2J1dHRvbiBjb21wYXRcblx0XHR9LFxuXG5cdFx0Ly8gUG9zaXRpb24gY2hlY2tzXG5cdFx0J15wb3NpdGlvbi4obXl8YXQpJCc6IGZ1bmN0aW9uKG9iaiwgbywgdil7XG5cdFx0XHRpZignc3RyaW5nJyA9PT0gdHlwZW9mIHYpIHtcblx0XHRcdFx0dGhpcy5wb3NpdGlvbltvXSA9IG9ialtvXSA9IG5ldyBDT1JORVIodiwgbyA9PT0gJ2F0Jyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHQnXnBvc2l0aW9uLmNvbnRhaW5lciQnOiBmdW5jdGlvbihvYmosIG8sIHYpe1xuXHRcdFx0dGhpcy5yZW5kZXJlZCAmJiB0aGlzLnRvb2x0aXAuYXBwZW5kVG8odik7XG5cdFx0fSxcblxuXHRcdC8vIFNob3cgY2hlY2tzXG5cdFx0J15zaG93LnJlYWR5JCc6IGZ1bmN0aW9uKG9iaiwgbywgdikge1xuXHRcdFx0diAmJiAoIXRoaXMucmVuZGVyZWQgJiYgdGhpcy5yZW5kZXIoVFJVRSkgfHwgdGhpcy50b2dnbGUoVFJVRSkpO1xuXHRcdH0sXG5cblx0XHQvLyBTdHlsZSBjaGVja3Ncblx0XHQnXnN0eWxlLmNsYXNzZXMkJzogZnVuY3Rpb24ob2JqLCBvLCB2LCBwKSB7XG5cdFx0XHR0aGlzLnJlbmRlcmVkICYmIHRoaXMudG9vbHRpcC5yZW1vdmVDbGFzcyhwKS5hZGRDbGFzcyh2KTtcblx0XHR9LFxuXHRcdCdec3R5bGUuKHdpZHRofGhlaWdodCknOiBmdW5jdGlvbihvYmosIG8sIHYpIHtcblx0XHRcdHRoaXMucmVuZGVyZWQgJiYgdGhpcy50b29sdGlwLmNzcyhvLCB2KTtcblx0XHR9LFxuXHRcdCdec3R5bGUud2lkZ2V0fGNvbnRlbnQudGl0bGUnOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMucmVuZGVyZWQgJiYgdGhpcy5fc2V0V2lkZ2V0KCk7XG5cdFx0fSxcblx0XHQnXnN0eWxlLmRlZic6IGZ1bmN0aW9uKG9iaiwgbywgdikge1xuXHRcdFx0dGhpcy5yZW5kZXJlZCAmJiB0aGlzLnRvb2x0aXAudG9nZ2xlQ2xhc3MoQ0xBU1NfREVGQVVMVCwgISF2KTtcblx0XHR9LFxuXG5cdFx0Ly8gRXZlbnRzIGNoZWNrXG5cdFx0J15ldmVudHMuKHJlbmRlcnxzaG93fG1vdmV8aGlkZXxmb2N1c3xibHVyKSQnOiBmdW5jdGlvbihvYmosIG8sIHYpIHtcblx0XHRcdHRoaXMucmVuZGVyZWQgJiYgdGhpcy50b29sdGlwWygkLmlzRnVuY3Rpb24odikgPyAnJyA6ICd1bicpICsgJ2JpbmQnXSgndG9vbHRpcCcrbywgdik7XG5cdFx0fSxcblxuXHRcdC8vIFByb3BlcnRpZXMgd2hpY2ggcmVxdWlyZSBldmVudCByZWFzc2lnbm1lbnRcblx0XHQnXihzaG93fGhpZGV8cG9zaXRpb24pLihldmVudHx0YXJnZXR8Zml4ZWR8aW5hY3RpdmV8bGVhdmV8ZGlzdGFuY2V8dmlld3BvcnR8YWRqdXN0KSc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYoIXRoaXMucmVuZGVyZWQpIHsgcmV0dXJuOyB9XG5cblx0XHRcdC8vIFNldCB0cmFja2luZyBmbGFnXG5cdFx0XHR2YXIgcG9zT3B0aW9ucyA9IHRoaXMub3B0aW9ucy5wb3NpdGlvbjtcblx0XHRcdHRoaXMudG9vbHRpcC5hdHRyKCd0cmFja2luZycsIHBvc09wdGlvbnMudGFyZ2V0ID09PSAnbW91c2UnICYmIHBvc09wdGlvbnMuYWRqdXN0Lm1vdXNlKTtcblxuXHRcdFx0Ly8gUmVhc3NpZ24gZXZlbnRzXG5cdFx0XHR0aGlzLl91bmFzc2lnbkV2ZW50cygpO1xuXHRcdFx0dGhpcy5fYXNzaWduRXZlbnRzKCk7XG5cdFx0fVxuXHR9XG59O1xuXG4vLyBEb3Qgbm90YXRpb24gY29udmVydGVyXG5mdW5jdGlvbiBjb252ZXJ0Tm90YXRpb24ob3B0aW9ucywgbm90YXRpb24pIHtcblx0dmFyIGkgPSAwLCBvYmosIG9wdGlvbiA9IG9wdGlvbnMsXG5cblx0Ly8gU3BsaXQgbm90YXRpb24gaW50byBhcnJheVxuXHRsZXZlbHMgPSBub3RhdGlvbi5zcGxpdCgnLicpO1xuXG5cdC8vIExvb3AgdGhyb3VnaFxuXHR3aGlsZShvcHRpb24gPSBvcHRpb25bIGxldmVsc1tpKytdIF0pIHtcblx0XHRpZihpIDwgbGV2ZWxzLmxlbmd0aCkgeyBvYmogPSBvcHRpb247IH1cblx0fVxuXG5cdHJldHVybiBbb2JqIHx8IG9wdGlvbnMsIGxldmVscy5wb3AoKV07XG59XG5cblBST1RPVFlQRS5nZXQgPSBmdW5jdGlvbihub3RhdGlvbikge1xuXHRpZih0aGlzLmRlc3Ryb3llZCkgeyByZXR1cm4gdGhpczsgfVxuXG5cdHZhciBvID0gY29udmVydE5vdGF0aW9uKHRoaXMub3B0aW9ucywgbm90YXRpb24udG9Mb3dlckNhc2UoKSksXG5cdFx0cmVzdWx0ID0gb1swXVsgb1sxXSBdO1xuXG5cdHJldHVybiByZXN1bHQucHJlY2VkYW5jZSA/IHJlc3VsdC5zdHJpbmcoKSA6IHJlc3VsdDtcbn07XG5cbmZ1bmN0aW9uIHNldENhbGxiYWNrKG5vdGF0aW9uLCBhcmdzKSB7XG5cdHZhciBjYXRlZ29yeSwgcnVsZSwgbWF0Y2g7XG5cblx0Zm9yKGNhdGVnb3J5IGluIHRoaXMuY2hlY2tzKSB7XG5cdFx0aWYgKCF0aGlzLmNoZWNrcy5oYXNPd25Qcm9wZXJ0eShjYXRlZ29yeSkpIHsgY29udGludWU7IH1cblxuXHRcdGZvcihydWxlIGluIHRoaXMuY2hlY2tzW2NhdGVnb3J5XSkge1xuXHRcdFx0aWYgKCF0aGlzLmNoZWNrc1tjYXRlZ29yeV0uaGFzT3duUHJvcGVydHkocnVsZSkpIHsgY29udGludWU7IH1cblxuXHRcdFx0aWYobWF0Y2ggPSAobmV3IFJlZ0V4cChydWxlLCAnaScpKS5leGVjKG5vdGF0aW9uKSkge1xuXHRcdFx0XHRhcmdzLnB1c2gobWF0Y2gpO1xuXG5cdFx0XHRcdGlmKGNhdGVnb3J5ID09PSAnYnVpbHRpbicgfHwgdGhpcy5wbHVnaW5zW2NhdGVnb3J5XSkge1xuXHRcdFx0XHRcdHRoaXMuY2hlY2tzW2NhdGVnb3J5XVtydWxlXS5hcHBseShcblx0XHRcdFx0XHRcdHRoaXMucGx1Z2luc1tjYXRlZ29yeV0gfHwgdGhpcywgYXJnc1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxudmFyIHJtb3ZlID0gL15wb3NpdGlvblxcLihteXxhdHxhZGp1c3R8dGFyZ2V0fGNvbnRhaW5lcnx2aWV3cG9ydCl8c3R5bGV8Y29udGVudHxzaG93XFwucmVhZHkvaSxcblx0cnJlbmRlciA9IC9ecHJlcmVuZGVyfHNob3dcXC5yZWFkeS9pO1xuXG5QUk9UT1RZUEUuc2V0ID0gZnVuY3Rpb24ob3B0aW9uLCB2YWx1ZSkge1xuXHRpZih0aGlzLmRlc3Ryb3llZCkgeyByZXR1cm4gdGhpczsgfVxuXG5cdHZhciByZW5kZXJlZCA9IHRoaXMucmVuZGVyZWQsXG5cdFx0cmVwb3NpdGlvbiA9IEZBTFNFLFxuXHRcdG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG5cdFx0bmFtZTtcblxuXHQvLyBDb252ZXJ0IHNpbmd1bGFyIG9wdGlvbi92YWx1ZSBwYWlyIGludG8gb2JqZWN0IGZvcm1cblx0aWYoJ3N0cmluZycgPT09IHR5cGVvZiBvcHRpb24pIHtcblx0XHRuYW1lID0gb3B0aW9uOyBvcHRpb24gPSB7fTsgb3B0aW9uW25hbWVdID0gdmFsdWU7XG5cdH1cblx0ZWxzZSB7IG9wdGlvbiA9ICQuZXh0ZW5kKHt9LCBvcHRpb24pOyB9XG5cblx0Ly8gU2V0IGFsbCBvZiB0aGUgZGVmaW5lZCBvcHRpb25zIHRvIHRoZWlyIG5ldyB2YWx1ZXNcblx0JC5lYWNoKG9wdGlvbiwgZnVuY3Rpb24obm90YXRpb24sIHZhbCkge1xuXHRcdGlmKHJlbmRlcmVkICYmIHJyZW5kZXIudGVzdChub3RhdGlvbikpIHtcblx0XHRcdGRlbGV0ZSBvcHRpb25bbm90YXRpb25dOyByZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gU2V0IG5ldyBvYmogdmFsdWVcblx0XHR2YXIgb2JqID0gY29udmVydE5vdGF0aW9uKG9wdGlvbnMsIG5vdGF0aW9uLnRvTG93ZXJDYXNlKCkpLCBwcmV2aW91cztcblx0XHRwcmV2aW91cyA9IG9ialswXVsgb2JqWzFdIF07XG5cdFx0b2JqWzBdWyBvYmpbMV0gXSA9IHZhbCAmJiB2YWwubm9kZVR5cGUgPyAkKHZhbCkgOiB2YWw7XG5cblx0XHQvLyBBbHNvIGNoZWNrIGlmIHdlIG5lZWQgdG8gcmVwb3NpdGlvblxuXHRcdHJlcG9zaXRpb24gPSBybW92ZS50ZXN0KG5vdGF0aW9uKSB8fCByZXBvc2l0aW9uO1xuXG5cdFx0Ly8gU2V0IHRoZSBuZXcgcGFyYW1zIGZvciB0aGUgY2FsbGJhY2tcblx0XHRvcHRpb25bbm90YXRpb25dID0gW29ialswXSwgb2JqWzFdLCB2YWwsIHByZXZpb3VzXTtcblx0fSk7XG5cblx0Ly8gUmUtc2FuaXRpemUgb3B0aW9uc1xuXHRzYW5pdGl6ZU9wdGlvbnMob3B0aW9ucyk7XG5cblx0Lypcblx0ICogRXhlY3V0ZSBhbnkgdmFsaWQgY2FsbGJhY2tzIGZvciB0aGUgc2V0IG9wdGlvbnNcblx0ICogQWxzbyBzZXQgcG9zaXRpb25pbmcgZmxhZyBzbyB3ZSBkb24ndCBnZXQgbG9hZHMgb2YgcmVkdW5kYW50IHJlcG9zaXRpb25pbmcgY2FsbHMuXG5cdCAqL1xuXHR0aGlzLnBvc2l0aW9uaW5nID0gVFJVRTtcblx0JC5lYWNoKG9wdGlvbiwgJC5wcm94eShzZXRDYWxsYmFjaywgdGhpcykpO1xuXHR0aGlzLnBvc2l0aW9uaW5nID0gRkFMU0U7XG5cblx0Ly8gVXBkYXRlIHBvc2l0aW9uIGlmIG5lZWRlZFxuXHRpZih0aGlzLnJlbmRlcmVkICYmIHRoaXMudG9vbHRpcFswXS5vZmZzZXRXaWR0aCA+IDAgJiYgcmVwb3NpdGlvbikge1xuXHRcdHRoaXMucmVwb3NpdGlvbiggb3B0aW9ucy5wb3NpdGlvbi50YXJnZXQgPT09ICdtb3VzZScgPyBOVUxMIDogdGhpcy5jYWNoZS5ldmVudCApO1xuXHR9XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuO1BST1RPVFlQRS5fdXBkYXRlID0gZnVuY3Rpb24oY29udGVudCwgZWxlbWVudCkge1xuXHR2YXIgc2VsZiA9IHRoaXMsXG5cdFx0Y2FjaGUgPSB0aGlzLmNhY2hlO1xuXG5cdC8vIE1ha2Ugc3VyZSB0b29sdGlwIGlzIHJlbmRlcmVkIGFuZCBjb250ZW50IGlzIGRlZmluZWQuIElmIG5vdCByZXR1cm5cblx0aWYoIXRoaXMucmVuZGVyZWQgfHwgIWNvbnRlbnQpIHsgcmV0dXJuIEZBTFNFOyB9XG5cblx0Ly8gVXNlIGZ1bmN0aW9uIHRvIHBhcnNlIGNvbnRlbnRcblx0aWYoJC5pc0Z1bmN0aW9uKGNvbnRlbnQpKSB7XG5cdFx0Y29udGVudCA9IGNvbnRlbnQuY2FsbCh0aGlzLmVsZW1lbnRzLnRhcmdldCwgY2FjaGUuZXZlbnQsIHRoaXMpIHx8ICcnO1xuXHR9XG5cblx0Ly8gSGFuZGxlIGRlZmVycmVkIGNvbnRlbnRcblx0aWYoJC5pc0Z1bmN0aW9uKGNvbnRlbnQudGhlbikpIHtcblx0XHRjYWNoZS53YWl0aW5nID0gVFJVRTtcblx0XHRyZXR1cm4gY29udGVudC50aGVuKGZ1bmN0aW9uKGMpIHtcblx0XHRcdGNhY2hlLndhaXRpbmcgPSBGQUxTRTtcblx0XHRcdHJldHVybiBzZWxmLl91cGRhdGUoYywgZWxlbWVudCk7XG5cdFx0fSwgTlVMTCwgZnVuY3Rpb24oZSkge1xuXHRcdFx0cmV0dXJuIHNlbGYuX3VwZGF0ZShlLCBlbGVtZW50KTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIElmIGNvbnRlbnQgaXMgbnVsbC4uLiByZXR1cm4gZmFsc2Vcblx0aWYoY29udGVudCA9PT0gRkFMU0UgfHwgIWNvbnRlbnQgJiYgY29udGVudCAhPT0gJycpIHsgcmV0dXJuIEZBTFNFOyB9XG5cblx0Ly8gQXBwZW5kIG5ldyBjb250ZW50IGlmIGl0cyBhIERPTSBhcnJheSBhbmQgc2hvdyBpdCBpZiBoaWRkZW5cblx0aWYoY29udGVudC5qcXVlcnkgJiYgY29udGVudC5sZW5ndGggPiAwKSB7XG5cdFx0ZWxlbWVudC5lbXB0eSgpLmFwcGVuZChcblx0XHRcdGNvbnRlbnQuY3NzKHsgZGlzcGxheTogJ2Jsb2NrJywgdmlzaWJpbGl0eTogJ3Zpc2libGUnIH0pXG5cdFx0KTtcblx0fVxuXG5cdC8vIENvbnRlbnQgaXMgYSByZWd1bGFyIHN0cmluZywgaW5zZXJ0IHRoZSBuZXcgY29udGVudFxuXHRlbHNlIHsgZWxlbWVudC5odG1sKGNvbnRlbnQpOyB9XG5cblx0Ly8gV2FpdCBmb3IgY29udGVudCB0byBiZSBsb2FkZWQsIGFuZCByZXBvc2l0aW9uXG5cdHJldHVybiB0aGlzLl93YWl0Rm9yQ29udGVudChlbGVtZW50KS50aGVuKGZ1bmN0aW9uKGltYWdlcykge1xuXHRcdGlmKHNlbGYucmVuZGVyZWQgJiYgc2VsZi50b29sdGlwWzBdLm9mZnNldFdpZHRoID4gMCkge1xuXHRcdFx0c2VsZi5yZXBvc2l0aW9uKGNhY2hlLmV2ZW50LCAhaW1hZ2VzLmxlbmd0aCk7XG5cdFx0fVxuXHR9KTtcbn07XG5cblBST1RPVFlQRS5fd2FpdEZvckNvbnRlbnQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG5cdHZhciBjYWNoZSA9IHRoaXMuY2FjaGU7XG5cblx0Ly8gU2V0IGZsYWdcblx0Y2FjaGUud2FpdGluZyA9IFRSVUU7XG5cblx0Ly8gSWYgaW1hZ2VzTG9hZGVkIGlzIGluY2x1ZGVkLCBlbnN1cmUgaW1hZ2VzIGhhdmUgbG9hZGVkIGFuZCByZXR1cm4gcHJvbWlzZVxuXHRyZXR1cm4gKCAkLmZuLmltYWdlc0xvYWRlZCA/IGVsZW1lbnQuaW1hZ2VzTG9hZGVkKCkgOiBuZXcgJC5EZWZlcnJlZCgpLnJlc29sdmUoW10pIClcblx0XHQuZG9uZShmdW5jdGlvbigpIHsgY2FjaGUud2FpdGluZyA9IEZBTFNFOyB9KVxuXHRcdC5wcm9taXNlKCk7XG59O1xuXG5QUk9UT1RZUEUuX3VwZGF0ZUNvbnRlbnQgPSBmdW5jdGlvbihjb250ZW50LCByZXBvc2l0aW9uKSB7XG5cdHRoaXMuX3VwZGF0ZShjb250ZW50LCB0aGlzLmVsZW1lbnRzLmNvbnRlbnQsIHJlcG9zaXRpb24pO1xufTtcblxuUFJPVE9UWVBFLl91cGRhdGVUaXRsZSA9IGZ1bmN0aW9uKGNvbnRlbnQsIHJlcG9zaXRpb24pIHtcblx0aWYodGhpcy5fdXBkYXRlKGNvbnRlbnQsIHRoaXMuZWxlbWVudHMudGl0bGUsIHJlcG9zaXRpb24pID09PSBGQUxTRSkge1xuXHRcdHRoaXMuX3JlbW92ZVRpdGxlKEZBTFNFKTtcblx0fVxufTtcblxuUFJPVE9UWVBFLl9jcmVhdGVUaXRsZSA9IGZ1bmN0aW9uKClcbntcblx0dmFyIGVsZW1lbnRzID0gdGhpcy5lbGVtZW50cyxcblx0XHRpZCA9IHRoaXMuX2lkKyctdGl0bGUnO1xuXG5cdC8vIERlc3Ryb3kgcHJldmlvdXMgdGl0bGUgZWxlbWVudCwgaWYgcHJlc2VudFxuXHRpZihlbGVtZW50cy50aXRsZWJhcikgeyB0aGlzLl9yZW1vdmVUaXRsZSgpOyB9XG5cblx0Ly8gQ3JlYXRlIHRpdGxlIGJhciBhbmQgdGl0bGUgZWxlbWVudHNcblx0ZWxlbWVudHMudGl0bGViYXIgPSAkKCc8ZGl2IC8+Jywge1xuXHRcdCdjbGFzcyc6IE5BTUVTUEFDRSArICctdGl0bGViYXIgJyArICh0aGlzLm9wdGlvbnMuc3R5bGUud2lkZ2V0ID8gY3JlYXRlV2lkZ2V0Q2xhc3MoJ2hlYWRlcicpIDogJycpXG5cdH0pXG5cdC5hcHBlbmQoXG5cdFx0ZWxlbWVudHMudGl0bGUgPSAkKCc8ZGl2IC8+Jywge1xuXHRcdFx0J2lkJzogaWQsXG5cdFx0XHQnY2xhc3MnOiBOQU1FU1BBQ0UgKyAnLXRpdGxlJyxcblx0XHRcdCdhcmlhLWF0b21pYyc6IFRSVUVcblx0XHR9KVxuXHQpXG5cdC5pbnNlcnRCZWZvcmUoZWxlbWVudHMuY29udGVudClcblxuXHQvLyBCdXR0b24tc3BlY2lmaWMgZXZlbnRzXG5cdC5kZWxlZ2F0ZSgnLnF0aXAtY2xvc2UnLCAnbW91c2Vkb3duIGtleWRvd24gbW91c2V1cCBrZXl1cCBtb3VzZW91dCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0JCh0aGlzKS50b2dnbGVDbGFzcygndWktc3RhdGUtYWN0aXZlIHVpLXN0YXRlLWZvY3VzJywgZXZlbnQudHlwZS5zdWJzdHIoLTQpID09PSAnZG93bicpO1xuXHR9KVxuXHQuZGVsZWdhdGUoJy5xdGlwLWNsb3NlJywgJ21vdXNlb3ZlciBtb3VzZW91dCcsIGZ1bmN0aW9uKGV2ZW50KXtcblx0XHQkKHRoaXMpLnRvZ2dsZUNsYXNzKCd1aS1zdGF0ZS1ob3ZlcicsIGV2ZW50LnR5cGUgPT09ICdtb3VzZW92ZXInKTtcblx0fSk7XG5cblx0Ly8gQ3JlYXRlIGJ1dHRvbiBpZiBlbmFibGVkXG5cdGlmKHRoaXMub3B0aW9ucy5jb250ZW50LmJ1dHRvbikgeyB0aGlzLl9jcmVhdGVCdXR0b24oKTsgfVxufTtcblxuUFJPVE9UWVBFLl9yZW1vdmVUaXRsZSA9IGZ1bmN0aW9uKHJlcG9zaXRpb24pXG57XG5cdHZhciBlbGVtZW50cyA9IHRoaXMuZWxlbWVudHM7XG5cblx0aWYoZWxlbWVudHMudGl0bGUpIHtcblx0XHRlbGVtZW50cy50aXRsZWJhci5yZW1vdmUoKTtcblx0XHRlbGVtZW50cy50aXRsZWJhciA9IGVsZW1lbnRzLnRpdGxlID0gZWxlbWVudHMuYnV0dG9uID0gTlVMTDtcblxuXHRcdC8vIFJlcG9zaXRpb24gaWYgZW5hYmxlZFxuXHRcdGlmKHJlcG9zaXRpb24gIT09IEZBTFNFKSB7IHRoaXMucmVwb3NpdGlvbigpOyB9XG5cdH1cbn07XG47UFJPVE9UWVBFLl9jcmVhdGVQb3NDbGFzcyA9IGZ1bmN0aW9uKG15KSB7XG5cdHJldHVybiBOQU1FU1BBQ0UgKyAnLXBvcy0nICsgKG15IHx8IHRoaXMub3B0aW9ucy5wb3NpdGlvbi5teSkuYWJicmV2KCk7XG59O1xuXG5QUk9UT1RZUEUucmVwb3NpdGlvbiA9IGZ1bmN0aW9uKGV2ZW50LCBlZmZlY3QpIHtcblx0aWYoIXRoaXMucmVuZGVyZWQgfHwgdGhpcy5wb3NpdGlvbmluZyB8fCB0aGlzLmRlc3Ryb3llZCkgeyByZXR1cm4gdGhpczsgfVxuXG5cdC8vIFNldCBwb3NpdGlvbmluZyBmbGFnXG5cdHRoaXMucG9zaXRpb25pbmcgPSBUUlVFO1xuXG5cdHZhciBjYWNoZSA9IHRoaXMuY2FjaGUsXG5cdFx0dG9vbHRpcCA9IHRoaXMudG9vbHRpcCxcblx0XHRwb3NPcHRpb25zID0gdGhpcy5vcHRpb25zLnBvc2l0aW9uLFxuXHRcdHRhcmdldCA9IHBvc09wdGlvbnMudGFyZ2V0LFxuXHRcdG15ID0gcG9zT3B0aW9ucy5teSxcblx0XHRhdCA9IHBvc09wdGlvbnMuYXQsXG5cdFx0dmlld3BvcnQgPSBwb3NPcHRpb25zLnZpZXdwb3J0LFxuXHRcdGNvbnRhaW5lciA9IHBvc09wdGlvbnMuY29udGFpbmVyLFxuXHRcdGFkanVzdCA9IHBvc09wdGlvbnMuYWRqdXN0LFxuXHRcdG1ldGhvZCA9IGFkanVzdC5tZXRob2Quc3BsaXQoJyAnKSxcblx0XHR0b29sdGlwV2lkdGggPSB0b29sdGlwLm91dGVyV2lkdGgoRkFMU0UpLFxuXHRcdHRvb2x0aXBIZWlnaHQgPSB0b29sdGlwLm91dGVySGVpZ2h0KEZBTFNFKSxcblx0XHR0YXJnZXRXaWR0aCA9IDAsXG5cdFx0dGFyZ2V0SGVpZ2h0ID0gMCxcblx0XHR0eXBlID0gdG9vbHRpcC5jc3MoJ3Bvc2l0aW9uJyksXG5cdFx0cG9zaXRpb24gPSB7IGxlZnQ6IDAsIHRvcDogMCB9LFxuXHRcdHZpc2libGUgPSB0b29sdGlwWzBdLm9mZnNldFdpZHRoID4gMCxcblx0XHRpc1Njcm9sbCA9IGV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICdzY3JvbGwnLFxuXHRcdHdpbiA9ICQod2luZG93KSxcblx0XHRkb2MgPSBjb250YWluZXJbMF0ub3duZXJEb2N1bWVudCxcblx0XHRtb3VzZSA9IHRoaXMubW91c2UsXG5cdFx0cGx1Z2luQ2FsY3VsYXRpb25zLCBvZmZzZXQsIGFkanVzdGVkLCBuZXdDbGFzcztcblxuXHQvLyBDaGVjayBpZiBhYnNvbHV0ZSBwb3NpdGlvbiB3YXMgcGFzc2VkXG5cdGlmKCQuaXNBcnJheSh0YXJnZXQpICYmIHRhcmdldC5sZW5ndGggPT09IDIpIHtcblx0XHQvLyBGb3JjZSBsZWZ0IHRvcCBhbmQgc2V0IHBvc2l0aW9uXG5cdFx0YXQgPSB7IHg6IExFRlQsIHk6IFRPUCB9O1xuXHRcdHBvc2l0aW9uID0geyBsZWZ0OiB0YXJnZXRbMF0sIHRvcDogdGFyZ2V0WzFdIH07XG5cdH1cblxuXHQvLyBDaGVjayBpZiBtb3VzZSB3YXMgdGhlIHRhcmdldFxuXHRlbHNlIGlmKHRhcmdldCA9PT0gJ21vdXNlJykge1xuXHRcdC8vIEZvcmNlIGxlZnQgdG9wIHRvIGFsbG93IGZsaXBwaW5nXG5cdFx0YXQgPSB7IHg6IExFRlQsIHk6IFRPUCB9O1xuXG5cdFx0Ly8gVXNlIHRoZSBtb3VzZSBvcmlnaW4gdGhhdCBjYXVzZWQgdGhlIHNob3cgZXZlbnQsIGlmIGRpc3RhbmNlIGhpZGluZyBpcyBlbmFibGVkXG5cdFx0aWYoKCFhZGp1c3QubW91c2UgfHwgdGhpcy5vcHRpb25zLmhpZGUuZGlzdGFuY2UpICYmIGNhY2hlLm9yaWdpbiAmJiBjYWNoZS5vcmlnaW4ucGFnZVgpIHtcblx0XHRcdGV2ZW50ID0gIGNhY2hlLm9yaWdpbjtcblx0XHR9XG5cblx0XHQvLyBVc2UgY2FjaGVkIGV2ZW50IGZvciByZXNpemUvc2Nyb2xsIGV2ZW50c1xuXHRcdGVsc2UgaWYoIWV2ZW50IHx8IGV2ZW50ICYmIChldmVudC50eXBlID09PSAncmVzaXplJyB8fCBldmVudC50eXBlID09PSAnc2Nyb2xsJykpIHtcblx0XHRcdGV2ZW50ID0gY2FjaGUuZXZlbnQ7XG5cdFx0fVxuXG5cdFx0Ly8gT3RoZXJ3aXNlLCB1c2UgdGhlIGNhY2hlZCBtb3VzZSBjb29yZGluYXRlcyBpZiBhdmFpbGFibGVcblx0XHRlbHNlIGlmKG1vdXNlICYmIG1vdXNlLnBhZ2VYKSB7XG5cdFx0XHRldmVudCA9IG1vdXNlO1xuXHRcdH1cblxuXHRcdC8vIENhbGN1bGF0ZSBib2R5IGFuZCBjb250YWluZXIgb2Zmc2V0IGFuZCB0YWtlIHRoZW0gaW50byBhY2NvdW50IGJlbG93XG5cdFx0aWYodHlwZSAhPT0gJ3N0YXRpYycpIHsgcG9zaXRpb24gPSBjb250YWluZXIub2Zmc2V0KCk7IH1cblx0XHRpZihkb2MuYm9keS5vZmZzZXRXaWR0aCAhPT0gKHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvYy5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpKSB7XG5cdFx0XHRvZmZzZXQgPSAkKGRvY3VtZW50LmJvZHkpLm9mZnNldCgpO1xuXHRcdH1cblxuXHRcdC8vIFVzZSBldmVudCBjb29yZGluYXRlcyBmb3IgcG9zaXRpb25cblx0XHRwb3NpdGlvbiA9IHtcblx0XHRcdGxlZnQ6IGV2ZW50LnBhZ2VYIC0gcG9zaXRpb24ubGVmdCArIChvZmZzZXQgJiYgb2Zmc2V0LmxlZnQgfHwgMCksXG5cdFx0XHR0b3A6IGV2ZW50LnBhZ2VZIC0gcG9zaXRpb24udG9wICsgKG9mZnNldCAmJiBvZmZzZXQudG9wIHx8IDApXG5cdFx0fTtcblxuXHRcdC8vIFNjcm9sbCBldmVudHMgYXJlIGEgcGFpbiwgc29tZSBicm93c2Vyc1xuXHRcdGlmKGFkanVzdC5tb3VzZSAmJiBpc1Njcm9sbCAmJiBtb3VzZSkge1xuXHRcdFx0cG9zaXRpb24ubGVmdCAtPSAobW91c2Uuc2Nyb2xsWCB8fCAwKSAtIHdpbi5zY3JvbGxMZWZ0KCk7XG5cdFx0XHRwb3NpdGlvbi50b3AgLT0gKG1vdXNlLnNjcm9sbFkgfHwgMCkgLSB3aW4uc2Nyb2xsVG9wKCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gVGFyZ2V0IHdhc24ndCBtb3VzZSBvciBhYnNvbHV0ZS4uLlxuXHRlbHNlIHtcblx0XHQvLyBDaGVjayBpZiBldmVudCB0YXJnZXR0aW5nIGlzIGJlaW5nIHVzZWRcblx0XHRpZih0YXJnZXQgPT09ICdldmVudCcpIHtcblx0XHRcdGlmKGV2ZW50ICYmIGV2ZW50LnRhcmdldCAmJiBldmVudC50eXBlICE9PSAnc2Nyb2xsJyAmJiBldmVudC50eXBlICE9PSAncmVzaXplJykge1xuXHRcdFx0XHRjYWNoZS50YXJnZXQgPSAkKGV2ZW50LnRhcmdldCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmKCFldmVudC50YXJnZXQpIHtcblx0XHRcdFx0Y2FjaGUudGFyZ2V0ID0gdGhpcy5lbGVtZW50cy50YXJnZXQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgaWYodGFyZ2V0ICE9PSAnZXZlbnQnKXtcblx0XHRcdGNhY2hlLnRhcmdldCA9ICQodGFyZ2V0LmpxdWVyeSA/IHRhcmdldCA6IHRoaXMuZWxlbWVudHMudGFyZ2V0KTtcblx0XHR9XG5cdFx0dGFyZ2V0ID0gY2FjaGUudGFyZ2V0O1xuXG5cdFx0Ly8gUGFyc2UgdGhlIHRhcmdldCBpbnRvIGEgalF1ZXJ5IG9iamVjdCBhbmQgbWFrZSBzdXJlIHRoZXJlJ3MgYW4gZWxlbWVudCBwcmVzZW50XG5cdFx0dGFyZ2V0ID0gJCh0YXJnZXQpLmVxKDApO1xuXHRcdGlmKHRhcmdldC5sZW5ndGggPT09IDApIHsgcmV0dXJuIHRoaXM7IH1cblxuXHRcdC8vIENoZWNrIGlmIHdpbmRvdyBvciBkb2N1bWVudCBpcyB0aGUgdGFyZ2V0XG5cdFx0ZWxzZSBpZih0YXJnZXRbMF0gPT09IGRvY3VtZW50IHx8IHRhcmdldFswXSA9PT0gd2luZG93KSB7XG5cdFx0XHR0YXJnZXRXaWR0aCA9IEJST1dTRVIuaU9TID8gd2luZG93LmlubmVyV2lkdGggOiB0YXJnZXQud2lkdGgoKTtcblx0XHRcdHRhcmdldEhlaWdodCA9IEJST1dTRVIuaU9TID8gd2luZG93LmlubmVySGVpZ2h0IDogdGFyZ2V0LmhlaWdodCgpO1xuXG5cdFx0XHRpZih0YXJnZXRbMF0gPT09IHdpbmRvdykge1xuXHRcdFx0XHRwb3NpdGlvbiA9IHtcblx0XHRcdFx0XHR0b3A6ICh2aWV3cG9ydCB8fCB0YXJnZXQpLnNjcm9sbFRvcCgpLFxuXHRcdFx0XHRcdGxlZnQ6ICh2aWV3cG9ydCB8fCB0YXJnZXQpLnNjcm9sbExlZnQoKVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIENoZWNrIGlmIHRoZSB0YXJnZXQgaXMgYW4gPEFSRUE+IGVsZW1lbnRcblx0XHRlbHNlIGlmKFBMVUdJTlMuaW1hZ2VtYXAgJiYgdGFyZ2V0LmlzKCdhcmVhJykpIHtcblx0XHRcdHBsdWdpbkNhbGN1bGF0aW9ucyA9IFBMVUdJTlMuaW1hZ2VtYXAodGhpcywgdGFyZ2V0LCBhdCwgUExVR0lOUy52aWV3cG9ydCA/IG1ldGhvZCA6IEZBTFNFKTtcblx0XHR9XG5cblx0XHQvLyBDaGVjayBpZiB0aGUgdGFyZ2V0IGlzIGFuIFNWRyBlbGVtZW50XG5cdFx0ZWxzZSBpZihQTFVHSU5TLnN2ZyAmJiB0YXJnZXQgJiYgdGFyZ2V0WzBdLm93bmVyU1ZHRWxlbWVudCkge1xuXHRcdFx0cGx1Z2luQ2FsY3VsYXRpb25zID0gUExVR0lOUy5zdmcodGhpcywgdGFyZ2V0LCBhdCwgUExVR0lOUy52aWV3cG9ydCA/IG1ldGhvZCA6IEZBTFNFKTtcblx0XHR9XG5cblx0XHQvLyBPdGhlcndpc2UgdXNlIHJlZ3VsYXIgalF1ZXJ5IG1ldGhvZHNcblx0XHRlbHNlIHtcblx0XHRcdHRhcmdldFdpZHRoID0gdGFyZ2V0Lm91dGVyV2lkdGgoRkFMU0UpO1xuXHRcdFx0dGFyZ2V0SGVpZ2h0ID0gdGFyZ2V0Lm91dGVySGVpZ2h0KEZBTFNFKTtcblx0XHRcdHBvc2l0aW9uID0gdGFyZ2V0Lm9mZnNldCgpO1xuXHRcdH1cblxuXHRcdC8vIFBhcnNlIHJldHVybmVkIHBsdWdpbiB2YWx1ZXMgaW50byBwcm9wZXIgdmFyaWFibGVzXG5cdFx0aWYocGx1Z2luQ2FsY3VsYXRpb25zKSB7XG5cdFx0XHR0YXJnZXRXaWR0aCA9IHBsdWdpbkNhbGN1bGF0aW9ucy53aWR0aDtcblx0XHRcdHRhcmdldEhlaWdodCA9IHBsdWdpbkNhbGN1bGF0aW9ucy5oZWlnaHQ7XG5cdFx0XHRvZmZzZXQgPSBwbHVnaW5DYWxjdWxhdGlvbnMub2Zmc2V0O1xuXHRcdFx0cG9zaXRpb24gPSBwbHVnaW5DYWxjdWxhdGlvbnMucG9zaXRpb247XG5cdFx0fVxuXG5cdFx0Ly8gQWRqdXN0IHBvc2l0aW9uIHRvIHRha2UgaW50byBhY2NvdW50IG9mZnNldCBwYXJlbnRzXG5cdFx0cG9zaXRpb24gPSB0aGlzLnJlcG9zaXRpb24ub2Zmc2V0KHRhcmdldCwgcG9zaXRpb24sIGNvbnRhaW5lcik7XG5cblx0XHQvLyBBZGp1c3QgZm9yIHBvc2l0aW9uLmZpeGVkIHRvb2x0aXBzIChhbmQgYWxzbyBpT1Mgc2Nyb2xsIGJ1ZyBpbiB2My4yLTQuMCAmIHY0LjMtNC4zLjIpXG5cdFx0aWYoQlJPV1NFUi5pT1MgPiAzLjEgJiYgQlJPV1NFUi5pT1MgPCA0LjEgfHxcblx0XHRcdEJST1dTRVIuaU9TID49IDQuMyAmJiBCUk9XU0VSLmlPUyA8IDQuMzMgfHxcblx0XHRcdCFCUk9XU0VSLmlPUyAmJiB0eXBlID09PSAnZml4ZWQnXG5cdFx0KXtcblx0XHRcdHBvc2l0aW9uLmxlZnQgLT0gd2luLnNjcm9sbExlZnQoKTtcblx0XHRcdHBvc2l0aW9uLnRvcCAtPSB3aW4uc2Nyb2xsVG9wKCk7XG5cdFx0fVxuXG5cdFx0Ly8gQWRqdXN0IHBvc2l0aW9uIHJlbGF0aXZlIHRvIHRhcmdldFxuXHRcdGlmKCFwbHVnaW5DYWxjdWxhdGlvbnMgfHwgcGx1Z2luQ2FsY3VsYXRpb25zICYmIHBsdWdpbkNhbGN1bGF0aW9ucy5hZGp1c3RhYmxlICE9PSBGQUxTRSkge1xuXHRcdFx0cG9zaXRpb24ubGVmdCArPSBhdC54ID09PSBSSUdIVCA/IHRhcmdldFdpZHRoIDogYXQueCA9PT0gQ0VOVEVSID8gdGFyZ2V0V2lkdGggLyAyIDogMDtcblx0XHRcdHBvc2l0aW9uLnRvcCArPSBhdC55ID09PSBCT1RUT00gPyB0YXJnZXRIZWlnaHQgOiBhdC55ID09PSBDRU5URVIgPyB0YXJnZXRIZWlnaHQgLyAyIDogMDtcblx0XHR9XG5cdH1cblxuXHQvLyBBZGp1c3QgcG9zaXRpb24gcmVsYXRpdmUgdG8gdG9vbHRpcFxuXHRwb3NpdGlvbi5sZWZ0ICs9IGFkanVzdC54ICsgKG15LnggPT09IFJJR0hUID8gLXRvb2x0aXBXaWR0aCA6IG15LnggPT09IENFTlRFUiA/IC10b29sdGlwV2lkdGggLyAyIDogMCk7XG5cdHBvc2l0aW9uLnRvcCArPSBhZGp1c3QueSArIChteS55ID09PSBCT1RUT00gPyAtdG9vbHRpcEhlaWdodCA6IG15LnkgPT09IENFTlRFUiA/IC10b29sdGlwSGVpZ2h0IC8gMiA6IDApO1xuXG5cdC8vIFVzZSB2aWV3cG9ydCBhZGp1c3RtZW50IHBsdWdpbiBpZiBlbmFibGVkXG5cdGlmKFBMVUdJTlMudmlld3BvcnQpIHtcblx0XHRhZGp1c3RlZCA9IHBvc2l0aW9uLmFkanVzdGVkID0gUExVR0lOUy52aWV3cG9ydChcblx0XHRcdHRoaXMsIHBvc2l0aW9uLCBwb3NPcHRpb25zLCB0YXJnZXRXaWR0aCwgdGFyZ2V0SGVpZ2h0LCB0b29sdGlwV2lkdGgsIHRvb2x0aXBIZWlnaHRcblx0XHQpO1xuXG5cdFx0Ly8gQXBwbHkgb2Zmc2V0cyBzdXBwbGllZCBieSBwb3NpdGlvbmluZyBwbHVnaW4gKGlmIHVzZWQpXG5cdFx0aWYob2Zmc2V0ICYmIGFkanVzdGVkLmxlZnQpIHsgcG9zaXRpb24ubGVmdCArPSBvZmZzZXQubGVmdDsgfVxuXHRcdGlmKG9mZnNldCAmJiBhZGp1c3RlZC50b3ApIHsgIHBvc2l0aW9uLnRvcCArPSBvZmZzZXQudG9wOyB9XG5cblx0XHQvLyBBcHBseSBhbnkgbmV3ICdteScgcG9zaXRpb25cblx0XHRpZihhZGp1c3RlZC5teSkgeyB0aGlzLnBvc2l0aW9uLm15ID0gYWRqdXN0ZWQubXk7IH1cblx0fVxuXG5cdC8vIFZpZXdwb3J0IGFkanVzdG1lbnQgaXMgZGlzYWJsZWQsIHNldCB2YWx1ZXMgdG8gemVyb1xuXHRlbHNlIHsgcG9zaXRpb24uYWRqdXN0ZWQgPSB7IGxlZnQ6IDAsIHRvcDogMCB9OyB9XG5cblx0Ly8gU2V0IHRvb2x0aXAgcG9zaXRpb24gY2xhc3MgaWYgaXQncyBjaGFuZ2VkXG5cdGlmKGNhY2hlLnBvc0NsYXNzICE9PSAobmV3Q2xhc3MgPSB0aGlzLl9jcmVhdGVQb3NDbGFzcyh0aGlzLnBvc2l0aW9uLm15KSkpIHtcblx0XHRjYWNoZS5wb3NDbGFzcyA9IG5ld0NsYXNzO1xuXHRcdHRvb2x0aXAucmVtb3ZlQ2xhc3MoY2FjaGUucG9zQ2xhc3MpLmFkZENsYXNzKG5ld0NsYXNzKTtcblx0fVxuXG5cdC8vIHRvb2x0aXBtb3ZlIGV2ZW50XG5cdGlmKCF0aGlzLl90cmlnZ2VyKCdtb3ZlJywgW3Bvc2l0aW9uLCB2aWV3cG9ydC5lbGVtIHx8IHZpZXdwb3J0XSwgZXZlbnQpKSB7IHJldHVybiB0aGlzOyB9XG5cdGRlbGV0ZSBwb3NpdGlvbi5hZGp1c3RlZDtcblxuXHQvLyBJZiBlZmZlY3QgaXMgZGlzYWJsZWQsIHRhcmdldCBpdCBtb3VzZSwgbm8gYW5pbWF0aW9uIGlzIGRlZmluZWQgb3IgcG9zaXRpb25pbmcgZ2l2ZXMgTmFOIG91dCwgc2V0IENTUyBkaXJlY3RseVxuXHRpZihlZmZlY3QgPT09IEZBTFNFIHx8ICF2aXNpYmxlIHx8IGlzTmFOKHBvc2l0aW9uLmxlZnQpIHx8IGlzTmFOKHBvc2l0aW9uLnRvcCkgfHwgdGFyZ2V0ID09PSAnbW91c2UnIHx8ICEkLmlzRnVuY3Rpb24ocG9zT3B0aW9ucy5lZmZlY3QpKSB7XG5cdFx0dG9vbHRpcC5jc3MocG9zaXRpb24pO1xuXHR9XG5cblx0Ly8gVXNlIGN1c3RvbSBmdW5jdGlvbiBpZiBwcm92aWRlZFxuXHRlbHNlIGlmKCQuaXNGdW5jdGlvbihwb3NPcHRpb25zLmVmZmVjdCkpIHtcblx0XHRwb3NPcHRpb25zLmVmZmVjdC5jYWxsKHRvb2x0aXAsIHRoaXMsICQuZXh0ZW5kKHt9LCBwb3NpdGlvbikpO1xuXHRcdHRvb2x0aXAucXVldWUoZnVuY3Rpb24obmV4dCkge1xuXHRcdFx0Ly8gUmVzZXQgYXR0cmlidXRlcyB0byBhdm9pZCBjcm9zcy1icm93c2VyIHJlbmRlcmluZyBidWdzXG5cdFx0XHQkKHRoaXMpLmNzcyh7IG9wYWNpdHk6ICcnLCBoZWlnaHQ6ICcnIH0pO1xuXHRcdFx0aWYoQlJPV1NFUi5pZSkgeyB0aGlzLnN0eWxlLnJlbW92ZUF0dHJpYnV0ZSgnZmlsdGVyJyk7IH1cblxuXHRcdFx0bmV4dCgpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gU2V0IHBvc2l0aW9uaW5nIGZsYWdcblx0dGhpcy5wb3NpdGlvbmluZyA9IEZBTFNFO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuLy8gQ3VzdG9tIChtb3JlIGNvcnJlY3QgZm9yIHFUaXAhKSBvZmZzZXQgY2FsY3VsYXRvclxuUFJPVE9UWVBFLnJlcG9zaXRpb24ub2Zmc2V0ID0gZnVuY3Rpb24oZWxlbSwgcG9zLCBjb250YWluZXIpIHtcblx0aWYoIWNvbnRhaW5lclswXSkgeyByZXR1cm4gcG9zOyB9XG5cblx0dmFyIG93bmVyRG9jdW1lbnQgPSAkKGVsZW1bMF0ub3duZXJEb2N1bWVudCksXG5cdFx0cXVpcmtzID0gISFCUk9XU0VSLmllICYmIGRvY3VtZW50LmNvbXBhdE1vZGUgIT09ICdDU1MxQ29tcGF0Jyxcblx0XHRwYXJlbnQgPSBjb250YWluZXJbMF0sXG5cdFx0c2Nyb2xsZWQsIHBvc2l0aW9uLCBwYXJlbnRPZmZzZXQsIG92ZXJmbG93O1xuXG5cdGZ1bmN0aW9uIHNjcm9sbChlLCBpKSB7XG5cdFx0cG9zLmxlZnQgKz0gaSAqIGUuc2Nyb2xsTGVmdCgpO1xuXHRcdHBvcy50b3AgKz0gaSAqIGUuc2Nyb2xsVG9wKCk7XG5cdH1cblxuXHQvLyBDb21wZW5zYXRlIGZvciBub24tc3RhdGljIGNvbnRhaW5lcnMgb2Zmc2V0XG5cdGRvIHtcblx0XHRpZigocG9zaXRpb24gPSAkLmNzcyhwYXJlbnQsICdwb3NpdGlvbicpKSAhPT0gJ3N0YXRpYycpIHtcblx0XHRcdGlmKHBvc2l0aW9uID09PSAnZml4ZWQnKSB7XG5cdFx0XHRcdHBhcmVudE9mZnNldCA9IHBhcmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdFx0c2Nyb2xsKG93bmVyRG9jdW1lbnQsIC0xKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRwYXJlbnRPZmZzZXQgPSAkKHBhcmVudCkucG9zaXRpb24oKTtcblx0XHRcdFx0cGFyZW50T2Zmc2V0LmxlZnQgKz0gcGFyc2VGbG9hdCgkLmNzcyhwYXJlbnQsICdib3JkZXJMZWZ0V2lkdGgnKSkgfHwgMDtcblx0XHRcdFx0cGFyZW50T2Zmc2V0LnRvcCArPSBwYXJzZUZsb2F0KCQuY3NzKHBhcmVudCwgJ2JvcmRlclRvcFdpZHRoJykpIHx8IDA7XG5cdFx0XHR9XG5cblx0XHRcdHBvcy5sZWZ0IC09IHBhcmVudE9mZnNldC5sZWZ0ICsgKHBhcnNlRmxvYXQoJC5jc3MocGFyZW50LCAnbWFyZ2luTGVmdCcpKSB8fCAwKTtcblx0XHRcdHBvcy50b3AgLT0gcGFyZW50T2Zmc2V0LnRvcCArIChwYXJzZUZsb2F0KCQuY3NzKHBhcmVudCwgJ21hcmdpblRvcCcpKSB8fCAwKTtcblxuXHRcdFx0Ly8gSWYgdGhpcyBpcyB0aGUgZmlyc3QgcGFyZW50IGVsZW1lbnQgd2l0aCBhbiBvdmVyZmxvdyBvZiBcInNjcm9sbFwiIG9yIFwiYXV0b1wiLCBzdG9yZSBpdFxuXHRcdFx0aWYoIXNjcm9sbGVkICYmIChvdmVyZmxvdyA9ICQuY3NzKHBhcmVudCwgJ292ZXJmbG93JykpICE9PSAnaGlkZGVuJyAmJiBvdmVyZmxvdyAhPT0gJ3Zpc2libGUnKSB7IHNjcm9sbGVkID0gJChwYXJlbnQpOyB9XG5cdFx0fVxuXHR9XG5cdHdoaWxlKHBhcmVudCA9IHBhcmVudC5vZmZzZXRQYXJlbnQpO1xuXG5cdC8vIENvbXBlbnNhdGUgZm9yIGNvbnRhaW5lcnMgc2Nyb2xsIGlmIGl0IGFsc28gaGFzIGFuIG9mZnNldFBhcmVudCAob3IgaW4gSUUgcXVpcmtzIG1vZGUpXG5cdGlmKHNjcm9sbGVkICYmIChzY3JvbGxlZFswXSAhPT0gb3duZXJEb2N1bWVudFswXSB8fCBxdWlya3MpKSB7XG5cdFx0c2Nyb2xsKHNjcm9sbGVkLCAxKTtcblx0fVxuXG5cdHJldHVybiBwb3M7XG59O1xuXG4vLyBDb3JuZXIgY2xhc3NcbnZhciBDID0gKENPUk5FUiA9IFBST1RPVFlQRS5yZXBvc2l0aW9uLkNvcm5lciA9IGZ1bmN0aW9uKGNvcm5lciwgZm9yY2VZKSB7XG5cdGNvcm5lciA9ICgnJyArIGNvcm5lcikucmVwbGFjZSgvKFtBLVpdKS8sICcgJDEnKS5yZXBsYWNlKC9taWRkbGUvZ2ksIENFTlRFUikudG9Mb3dlckNhc2UoKTtcblx0dGhpcy54ID0gKGNvcm5lci5tYXRjaCgvbGVmdHxyaWdodC9pKSB8fCBjb3JuZXIubWF0Y2goL2NlbnRlci8pIHx8IFsnaW5oZXJpdCddKVswXS50b0xvd2VyQ2FzZSgpO1xuXHR0aGlzLnkgPSAoY29ybmVyLm1hdGNoKC90b3B8Ym90dG9tfGNlbnRlci9pKSB8fCBbJ2luaGVyaXQnXSlbMF0udG9Mb3dlckNhc2UoKTtcblx0dGhpcy5mb3JjZVkgPSAhIWZvcmNlWTtcblxuXHR2YXIgZiA9IGNvcm5lci5jaGFyQXQoMCk7XG5cdHRoaXMucHJlY2VkYW5jZSA9IGYgPT09ICd0JyB8fCBmID09PSAnYicgPyBZIDogWDtcbn0pLnByb3RvdHlwZTtcblxuQy5pbnZlcnQgPSBmdW5jdGlvbih6LCBjZW50ZXIpIHtcblx0dGhpc1t6XSA9IHRoaXNbel0gPT09IExFRlQgPyBSSUdIVCA6IHRoaXNbel0gPT09IFJJR0hUID8gTEVGVCA6IGNlbnRlciB8fCB0aGlzW3pdO1xufTtcblxuQy5zdHJpbmcgPSBmdW5jdGlvbihqb2luKSB7XG5cdHZhciB4ID0gdGhpcy54LCB5ID0gdGhpcy55O1xuXG5cdHZhciByZXN1bHQgPSB4ICE9PSB5ID9cblx0XHR4ID09PSAnY2VudGVyJyB8fCB5ICE9PSAnY2VudGVyJyAmJiAodGhpcy5wcmVjZWRhbmNlID09PSBZIHx8IHRoaXMuZm9yY2VZKSA/IFxuXHRcdFx0W3kseF0gOiBcblx0XHRcdFt4LHldIDpcblx0XHRbeF07XG5cblx0cmV0dXJuIGpvaW4gIT09IGZhbHNlID8gcmVzdWx0LmpvaW4oJyAnKSA6IHJlc3VsdDtcbn07XG5cbkMuYWJicmV2ID0gZnVuY3Rpb24oKSB7XG5cdHZhciByZXN1bHQgPSB0aGlzLnN0cmluZyhmYWxzZSk7XG5cdHJldHVybiByZXN1bHRbMF0uY2hhckF0KDApICsgKHJlc3VsdFsxXSAmJiByZXN1bHRbMV0uY2hhckF0KDApIHx8ICcnKTtcbn07XG5cbkMuY2xvbmUgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIG5ldyBDT1JORVIoIHRoaXMuc3RyaW5nKCksIHRoaXMuZm9yY2VZICk7XG59O1xuXG47XG5QUk9UT1RZUEUudG9nZ2xlID0gZnVuY3Rpb24oc3RhdGUsIGV2ZW50KSB7XG5cdHZhciBjYWNoZSA9IHRoaXMuY2FjaGUsXG5cdFx0b3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcblx0XHR0b29sdGlwID0gdGhpcy50b29sdGlwO1xuXG5cdC8vIFRyeSB0byBwcmV2ZW50IGZsaWNrZXJpbmcgd2hlbiB0b29sdGlwIG92ZXJsYXBzIHNob3cgZWxlbWVudFxuXHRpZihldmVudCkge1xuXHRcdGlmKCgvb3ZlcnxlbnRlci8pLnRlc3QoZXZlbnQudHlwZSkgJiYgY2FjaGUuZXZlbnQgJiYgKC9vdXR8bGVhdmUvKS50ZXN0KGNhY2hlLmV2ZW50LnR5cGUpICYmXG5cdFx0XHRvcHRpb25zLnNob3cudGFyZ2V0LmFkZChldmVudC50YXJnZXQpLmxlbmd0aCA9PT0gb3B0aW9ucy5zaG93LnRhcmdldC5sZW5ndGggJiZcblx0XHRcdHRvb2x0aXAuaGFzKGV2ZW50LnJlbGF0ZWRUYXJnZXQpLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0Ly8gQ2FjaGUgZXZlbnRcblx0XHRjYWNoZS5ldmVudCA9ICQuZXZlbnQuZml4KGV2ZW50KTtcblx0fVxuXG5cdC8vIElmIHdlJ3JlIGN1cnJlbnRseSB3YWl0aW5nIGFuZCB3ZSd2ZSBqdXN0IGhpZGRlbi4uLiBzdG9wIGl0XG5cdHRoaXMud2FpdGluZyAmJiAhc3RhdGUgJiYgKHRoaXMuaGlkZGVuRHVyaW5nV2FpdCA9IFRSVUUpO1xuXG5cdC8vIFJlbmRlciB0aGUgdG9vbHRpcCBpZiBzaG93aW5nIGFuZCBpdCBpc24ndCBhbHJlYWR5XG5cdGlmKCF0aGlzLnJlbmRlcmVkKSB7IHJldHVybiBzdGF0ZSA/IHRoaXMucmVuZGVyKDEpIDogdGhpczsgfVxuXHRlbHNlIGlmKHRoaXMuZGVzdHJveWVkIHx8IHRoaXMuZGlzYWJsZWQpIHsgcmV0dXJuIHRoaXM7IH1cblxuXHR2YXIgdHlwZSA9IHN0YXRlID8gJ3Nob3cnIDogJ2hpZGUnLFxuXHRcdG9wdHMgPSB0aGlzLm9wdGlvbnNbdHlwZV0sXG5cdFx0cG9zT3B0aW9ucyA9IHRoaXMub3B0aW9ucy5wb3NpdGlvbixcblx0XHRjb250ZW50T3B0aW9ucyA9IHRoaXMub3B0aW9ucy5jb250ZW50LFxuXHRcdHdpZHRoID0gdGhpcy50b29sdGlwLmNzcygnd2lkdGgnKSxcblx0XHR2aXNpYmxlID0gdGhpcy50b29sdGlwLmlzKCc6dmlzaWJsZScpLFxuXHRcdGFuaW1hdGUgPSBzdGF0ZSB8fCBvcHRzLnRhcmdldC5sZW5ndGggPT09IDEsXG5cdFx0c2FtZVRhcmdldCA9ICFldmVudCB8fCBvcHRzLnRhcmdldC5sZW5ndGggPCAyIHx8IGNhY2hlLnRhcmdldFswXSA9PT0gZXZlbnQudGFyZ2V0LFxuXHRcdGlkZW50aWNhbFN0YXRlLCBhbGxvdywgYWZ0ZXI7XG5cblx0Ly8gRGV0ZWN0IHN0YXRlIGlmIHZhbGlkIG9uZSBpc24ndCBwcm92aWRlZFxuXHRpZigodHlwZW9mIHN0YXRlKS5zZWFyY2goJ2Jvb2xlYW58bnVtYmVyJykpIHsgc3RhdGUgPSAhdmlzaWJsZTsgfVxuXG5cdC8vIENoZWNrIGlmIHRoZSB0b29sdGlwIGlzIGluIGFuIGlkZW50aWNhbCBzdGF0ZSB0byB0aGUgbmV3IHdvdWxkLWJlIHN0YXRlXG5cdGlkZW50aWNhbFN0YXRlID0gIXRvb2x0aXAuaXMoJzphbmltYXRlZCcpICYmIHZpc2libGUgPT09IHN0YXRlICYmIHNhbWVUYXJnZXQ7XG5cblx0Ly8gRmlyZSB0b29sdGlwKHNob3cvaGlkZSkgZXZlbnQgYW5kIGNoZWNrIGlmIGRlc3Ryb3llZFxuXHRhbGxvdyA9ICFpZGVudGljYWxTdGF0ZSA/ICEhdGhpcy5fdHJpZ2dlcih0eXBlLCBbOTBdKSA6IE5VTEw7XG5cblx0Ly8gQ2hlY2sgdG8gbWFrZSBzdXJlIHRoZSB0b29sdGlwIHdhc24ndCBkZXN0cm95ZWQgaW4gdGhlIGNhbGxiYWNrXG5cdGlmKHRoaXMuZGVzdHJveWVkKSB7IHJldHVybiB0aGlzOyB9XG5cblx0Ly8gSWYgdGhlIHVzZXIgZGlkbid0IHN0b3AgdGhlIG1ldGhvZCBwcmVtYXR1cmVseSBhbmQgd2UncmUgc2hvd2luZyB0aGUgdG9vbHRpcCwgZm9jdXMgaXRcblx0aWYoYWxsb3cgIT09IEZBTFNFICYmIHN0YXRlKSB7IHRoaXMuZm9jdXMoZXZlbnQpOyB9XG5cblx0Ly8gSWYgdGhlIHN0YXRlIGhhc24ndCBjaGFuZ2VkIG9yIHRoZSB1c2VyIHN0b3BwZWQgaXQsIHJldHVybiBlYXJseVxuXHRpZighYWxsb3cgfHwgaWRlbnRpY2FsU3RhdGUpIHsgcmV0dXJuIHRoaXM7IH1cblxuXHQvLyBTZXQgQVJJQSBoaWRkZW4gYXR0cmlidXRlXG5cdCQuYXR0cih0b29sdGlwWzBdLCAnYXJpYS1oaWRkZW4nLCAhISFzdGF0ZSk7XG5cblx0Ly8gRXhlY3V0ZSBzdGF0ZSBzcGVjaWZpYyBwcm9wZXJ0aWVzXG5cdGlmKHN0YXRlKSB7XG5cdFx0Ly8gU3RvcmUgc2hvdyBvcmlnaW4gY29vcmRpbmF0ZXNcblx0XHR0aGlzLm1vdXNlICYmIChjYWNoZS5vcmlnaW4gPSAkLmV2ZW50LmZpeCh0aGlzLm1vdXNlKSk7XG5cblx0XHQvLyBVcGRhdGUgdG9vbHRpcCBjb250ZW50ICYgdGl0bGUgaWYgaXQncyBhIGR5bmFtaWMgZnVuY3Rpb25cblx0XHRpZigkLmlzRnVuY3Rpb24oY29udGVudE9wdGlvbnMudGV4dCkpIHsgdGhpcy5fdXBkYXRlQ29udGVudChjb250ZW50T3B0aW9ucy50ZXh0LCBGQUxTRSk7IH1cblx0XHRpZigkLmlzRnVuY3Rpb24oY29udGVudE9wdGlvbnMudGl0bGUpKSB7IHRoaXMuX3VwZGF0ZVRpdGxlKGNvbnRlbnRPcHRpb25zLnRpdGxlLCBGQUxTRSk7IH1cblxuXHRcdC8vIENhY2hlIG1vdXNlbW92ZSBldmVudHMgZm9yIHBvc2l0aW9uaW5nIHB1cnBvc2VzIChpZiBub3QgYWxyZWFkeSB0cmFja2luZylcblx0XHRpZighdHJhY2tpbmdCb3VuZCAmJiBwb3NPcHRpb25zLnRhcmdldCA9PT0gJ21vdXNlJyAmJiBwb3NPcHRpb25zLmFkanVzdC5tb3VzZSkge1xuXHRcdFx0JChkb2N1bWVudCkuYmluZCgnbW91c2Vtb3ZlLicrTkFNRVNQQUNFLCB0aGlzLl9zdG9yZU1vdXNlKTtcblx0XHRcdHRyYWNraW5nQm91bmQgPSBUUlVFO1xuXHRcdH1cblxuXHRcdC8vIFVwZGF0ZSB0aGUgdG9vbHRpcCBwb3NpdGlvbiAoc2V0IHdpZHRoIGZpcnN0IHRvIHByZXZlbnQgdmlld3BvcnQvbWF4LXdpZHRoIGlzc3Vlcylcblx0XHRpZighd2lkdGgpIHsgdG9vbHRpcC5jc3MoJ3dpZHRoJywgdG9vbHRpcC5vdXRlcldpZHRoKEZBTFNFKSk7IH1cblx0XHR0aGlzLnJlcG9zaXRpb24oZXZlbnQsIGFyZ3VtZW50c1syXSk7XG5cdFx0aWYoIXdpZHRoKSB7IHRvb2x0aXAuY3NzKCd3aWR0aCcsICcnKTsgfVxuXG5cdFx0Ly8gSGlkZSBvdGhlciB0b29sdGlwcyBpZiB0b29sdGlwIGlzIHNvbG9cblx0XHRpZighIW9wdHMuc29sbykge1xuXHRcdFx0KHR5cGVvZiBvcHRzLnNvbG8gPT09ICdzdHJpbmcnID8gJChvcHRzLnNvbG8pIDogJChTRUxFQ1RPUiwgb3B0cy5zb2xvKSlcblx0XHRcdFx0Lm5vdCh0b29sdGlwKS5ub3Qob3B0cy50YXJnZXQpLnF0aXAoJ2hpZGUnLCBuZXcgJC5FdmVudCgndG9vbHRpcHNvbG8nKSk7XG5cdFx0fVxuXHR9XG5cdGVsc2Uge1xuXHRcdC8vIENsZWFyIHNob3cgdGltZXIgaWYgd2UncmUgaGlkaW5nXG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMudGltZXJzLnNob3cpO1xuXG5cdFx0Ly8gUmVtb3ZlIGNhY2hlZCBvcmlnaW4gb24gaGlkZVxuXHRcdGRlbGV0ZSBjYWNoZS5vcmlnaW47XG5cblx0XHQvLyBSZW1vdmUgbW91c2UgdHJhY2tpbmcgZXZlbnQgaWYgbm90IG5lZWRlZCAoYWxsIHRyYWNraW5nIHFUaXBzIGFyZSBoaWRkZW4pXG5cdFx0aWYodHJhY2tpbmdCb3VuZCAmJiAhJChTRUxFQ1RPUisnW3RyYWNraW5nPVwidHJ1ZVwiXTp2aXNpYmxlJywgb3B0cy5zb2xvKS5ub3QodG9vbHRpcCkubGVuZ3RoKSB7XG5cdFx0XHQkKGRvY3VtZW50KS51bmJpbmQoJ21vdXNlbW92ZS4nK05BTUVTUEFDRSk7XG5cdFx0XHR0cmFja2luZ0JvdW5kID0gRkFMU0U7XG5cdFx0fVxuXG5cdFx0Ly8gQmx1ciB0aGUgdG9vbHRpcFxuXHRcdHRoaXMuYmx1cihldmVudCk7XG5cdH1cblxuXHQvLyBEZWZpbmUgcG9zdC1hbmltYXRpb24sIHN0YXRlIHNwZWNpZmljIHByb3BlcnRpZXNcblx0YWZ0ZXIgPSAkLnByb3h5KGZ1bmN0aW9uKCkge1xuXHRcdGlmKHN0YXRlKSB7XG5cdFx0XHQvLyBQcmV2ZW50IGFudGlhbGlhcyBmcm9tIGRpc2FwcGVhcmluZyBpbiBJRSBieSByZW1vdmluZyBmaWx0ZXJcblx0XHRcdGlmKEJST1dTRVIuaWUpIHsgdG9vbHRpcFswXS5zdHlsZS5yZW1vdmVBdHRyaWJ1dGUoJ2ZpbHRlcicpOyB9XG5cblx0XHRcdC8vIFJlbW92ZSBvdmVyZmxvdyBzZXR0aW5nIHRvIHByZXZlbnQgdGlwIGJ1Z3Ncblx0XHRcdHRvb2x0aXAuY3NzKCdvdmVyZmxvdycsICcnKTtcblxuXHRcdFx0Ly8gQXV0b2ZvY3VzIGVsZW1lbnRzIGlmIGVuYWJsZWRcblx0XHRcdGlmKCdzdHJpbmcnID09PSB0eXBlb2Ygb3B0cy5hdXRvZm9jdXMpIHtcblx0XHRcdFx0JCh0aGlzLm9wdGlvbnMuc2hvdy5hdXRvZm9jdXMsIHRvb2x0aXApLmZvY3VzKCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIHNldCwgaGlkZSB0b29sdGlwIHdoZW4gaW5hY3RpdmUgZm9yIGRlbGF5IHBlcmlvZFxuXHRcdFx0dGhpcy5vcHRpb25zLnNob3cudGFyZ2V0LnRyaWdnZXIoJ3F0aXAtJyt0aGlzLmlkKyctaW5hY3RpdmUnKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHQvLyBSZXNldCBDU1Mgc3RhdGVzXG5cdFx0XHR0b29sdGlwLmNzcyh7XG5cdFx0XHRcdGRpc3BsYXk6ICcnLFxuXHRcdFx0XHR2aXNpYmlsaXR5OiAnJyxcblx0XHRcdFx0b3BhY2l0eTogJycsXG5cdFx0XHRcdGxlZnQ6ICcnLFxuXHRcdFx0XHR0b3A6ICcnXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvLyB0b29sdGlwdmlzaWJsZS90b29sdGlwaGlkZGVuIGV2ZW50c1xuXHRcdHRoaXMuX3RyaWdnZXIoc3RhdGUgPyAndmlzaWJsZScgOiAnaGlkZGVuJyk7XG5cdH0sIHRoaXMpO1xuXG5cdC8vIElmIG5vIGVmZmVjdCB0eXBlIGlzIHN1cHBsaWVkLCB1c2UgYSBzaW1wbGUgdG9nZ2xlXG5cdGlmKG9wdHMuZWZmZWN0ID09PSBGQUxTRSB8fCBhbmltYXRlID09PSBGQUxTRSkge1xuXHRcdHRvb2x0aXBbIHR5cGUgXSgpO1xuXHRcdGFmdGVyKCk7XG5cdH1cblxuXHQvLyBVc2UgY3VzdG9tIGZ1bmN0aW9uIGlmIHByb3ZpZGVkXG5cdGVsc2UgaWYoJC5pc0Z1bmN0aW9uKG9wdHMuZWZmZWN0KSkge1xuXHRcdHRvb2x0aXAuc3RvcCgxLCAxKTtcblx0XHRvcHRzLmVmZmVjdC5jYWxsKHRvb2x0aXAsIHRoaXMpO1xuXHRcdHRvb2x0aXAucXVldWUoJ2Z4JywgZnVuY3Rpb24obikge1xuXHRcdFx0YWZ0ZXIoKTsgbigpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gVXNlIGJhc2ljIGZhZGUgZnVuY3Rpb24gYnkgZGVmYXVsdFxuXHRlbHNlIHsgdG9vbHRpcC5mYWRlVG8oOTAsIHN0YXRlID8gMSA6IDAsIGFmdGVyKTsgfVxuXG5cdC8vIElmIGluYWN0aXZlIGhpZGUgbWV0aG9kIGlzIHNldCwgYWN0aXZlIGl0XG5cdGlmKHN0YXRlKSB7IG9wdHMudGFyZ2V0LnRyaWdnZXIoJ3F0aXAtJyt0aGlzLmlkKyctaW5hY3RpdmUnKTsgfVxuXG5cdHJldHVybiB0aGlzO1xufTtcblxuUFJPVE9UWVBFLnNob3cgPSBmdW5jdGlvbihldmVudCkgeyByZXR1cm4gdGhpcy50b2dnbGUoVFJVRSwgZXZlbnQpOyB9O1xuXG5QUk9UT1RZUEUuaGlkZSA9IGZ1bmN0aW9uKGV2ZW50KSB7IHJldHVybiB0aGlzLnRvZ2dsZShGQUxTRSwgZXZlbnQpOyB9O1xuO1BST1RPVFlQRS5mb2N1cyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdGlmKCF0aGlzLnJlbmRlcmVkIHx8IHRoaXMuZGVzdHJveWVkKSB7IHJldHVybiB0aGlzOyB9XG5cblx0dmFyIHF0aXBzID0gJChTRUxFQ1RPUiksXG5cdFx0dG9vbHRpcCA9IHRoaXMudG9vbHRpcCxcblx0XHRjdXJJbmRleCA9IHBhcnNlSW50KHRvb2x0aXBbMF0uc3R5bGUuekluZGV4LCAxMCksXG5cdFx0bmV3SW5kZXggPSBRVElQLnppbmRleCArIHF0aXBzLmxlbmd0aDtcblxuXHQvLyBPbmx5IHVwZGF0ZSB0aGUgei1pbmRleCBpZiBpdCBoYXMgY2hhbmdlZCBhbmQgdG9vbHRpcCBpcyBub3QgYWxyZWFkeSBmb2N1c2VkXG5cdGlmKCF0b29sdGlwLmhhc0NsYXNzKENMQVNTX0ZPQ1VTKSkge1xuXHRcdC8vIHRvb2x0aXBmb2N1cyBldmVudFxuXHRcdGlmKHRoaXMuX3RyaWdnZXIoJ2ZvY3VzJywgW25ld0luZGV4XSwgZXZlbnQpKSB7XG5cdFx0XHQvLyBPbmx5IHVwZGF0ZSB6LWluZGV4J3MgaWYgdGhleSd2ZSBjaGFuZ2VkXG5cdFx0XHRpZihjdXJJbmRleCAhPT0gbmV3SW5kZXgpIHtcblx0XHRcdFx0Ly8gUmVkdWNlIG91ciB6LWluZGV4J3MgYW5kIGtlZXAgdGhlbSBwcm9wZXJseSBvcmRlcmVkXG5cdFx0XHRcdHF0aXBzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYodGhpcy5zdHlsZS56SW5kZXggPiBjdXJJbmRleCkge1xuXHRcdFx0XHRcdFx0dGhpcy5zdHlsZS56SW5kZXggPSB0aGlzLnN0eWxlLnpJbmRleCAtIDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvLyBGaXJlIGJsdXIgZXZlbnQgZm9yIGZvY3VzZWQgdG9vbHRpcFxuXHRcdFx0XHRxdGlwcy5maWx0ZXIoJy4nICsgQ0xBU1NfRk9DVVMpLnF0aXAoJ2JsdXInLCBldmVudCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNldCB0aGUgbmV3IHotaW5kZXhcblx0XHRcdHRvb2x0aXAuYWRkQ2xhc3MoQ0xBU1NfRk9DVVMpWzBdLnN0eWxlLnpJbmRleCA9IG5ld0luZGV4O1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0aGlzO1xufTtcblxuUFJPVE9UWVBFLmJsdXIgPSBmdW5jdGlvbihldmVudCkge1xuXHRpZighdGhpcy5yZW5kZXJlZCB8fCB0aGlzLmRlc3Ryb3llZCkgeyByZXR1cm4gdGhpczsgfVxuXG5cdC8vIFNldCBmb2N1c2VkIHN0YXR1cyB0byBGQUxTRVxuXHR0aGlzLnRvb2x0aXAucmVtb3ZlQ2xhc3MoQ0xBU1NfRk9DVVMpO1xuXG5cdC8vIHRvb2x0aXBibHVyIGV2ZW50XG5cdHRoaXMuX3RyaWdnZXIoJ2JsdXInLCBbIHRoaXMudG9vbHRpcC5jc3MoJ3pJbmRleCcpIF0sIGV2ZW50KTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG47UFJPVE9UWVBFLmRpc2FibGUgPSBmdW5jdGlvbihzdGF0ZSkge1xuXHRpZih0aGlzLmRlc3Ryb3llZCkgeyByZXR1cm4gdGhpczsgfVxuXG5cdC8vIElmICd0b2dnbGUnIGlzIHBhc3NlZCwgdG9nZ2xlIHRoZSBjdXJyZW50IHN0YXRlXG5cdGlmKHN0YXRlID09PSAndG9nZ2xlJykge1xuXHRcdHN0YXRlID0gISh0aGlzLnJlbmRlcmVkID8gdGhpcy50b29sdGlwLmhhc0NsYXNzKENMQVNTX0RJU0FCTEVEKSA6IHRoaXMuZGlzYWJsZWQpO1xuXHR9XG5cblx0Ly8gRGlzYWJsZSBpZiBubyBzdGF0ZSBwYXNzZWRcblx0ZWxzZSBpZignYm9vbGVhbicgIT09IHR5cGVvZiBzdGF0ZSkge1xuXHRcdHN0YXRlID0gVFJVRTtcblx0fVxuXG5cdGlmKHRoaXMucmVuZGVyZWQpIHtcblx0XHR0aGlzLnRvb2x0aXAudG9nZ2xlQ2xhc3MoQ0xBU1NfRElTQUJMRUQsIHN0YXRlKVxuXHRcdFx0LmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCBzdGF0ZSk7XG5cdH1cblxuXHR0aGlzLmRpc2FibGVkID0gISFzdGF0ZTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cblBST1RPVFlQRS5lbmFibGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZGlzYWJsZShGQUxTRSk7IH07XG47UFJPVE9UWVBFLl9jcmVhdGVCdXR0b24gPSBmdW5jdGlvbigpXG57XG5cdHZhciBzZWxmID0gdGhpcyxcblx0XHRlbGVtZW50cyA9IHRoaXMuZWxlbWVudHMsXG5cdFx0dG9vbHRpcCA9IGVsZW1lbnRzLnRvb2x0aXAsXG5cdFx0YnV0dG9uID0gdGhpcy5vcHRpb25zLmNvbnRlbnQuYnV0dG9uLFxuXHRcdGlzU3RyaW5nID0gdHlwZW9mIGJ1dHRvbiA9PT0gJ3N0cmluZycsXG5cdFx0Y2xvc2UgPSBpc1N0cmluZyA/IGJ1dHRvbiA6ICdDbG9zZSB0b29sdGlwJztcblxuXHRpZihlbGVtZW50cy5idXR0b24pIHsgZWxlbWVudHMuYnV0dG9uLnJlbW92ZSgpOyB9XG5cblx0Ly8gVXNlIGN1c3RvbSBidXR0b24gaWYgb25lIHdhcyBzdXBwbGllZCBieSB1c2VyLCBlbHNlIHVzZSBkZWZhdWx0XG5cdGlmKGJ1dHRvbi5qcXVlcnkpIHtcblx0XHRlbGVtZW50cy5idXR0b24gPSBidXR0b247XG5cdH1cblx0ZWxzZSB7XG5cdFx0ZWxlbWVudHMuYnV0dG9uID0gJCgnPGEgLz4nLCB7XG5cdFx0XHQnY2xhc3MnOiAncXRpcC1jbG9zZSAnICsgKHRoaXMub3B0aW9ucy5zdHlsZS53aWRnZXQgPyAnJyA6IE5BTUVTUEFDRSsnLWljb24nKSxcblx0XHRcdCd0aXRsZSc6IGNsb3NlLFxuXHRcdFx0J2FyaWEtbGFiZWwnOiBjbG9zZVxuXHRcdH0pXG5cdFx0LnByZXBlbmQoXG5cdFx0XHQkKCc8c3BhbiAvPicsIHtcblx0XHRcdFx0J2NsYXNzJzogJ3VpLWljb24gdWktaWNvbi1jbG9zZScsXG5cdFx0XHRcdCdodG1sJzogJyZ0aW1lczsnXG5cdFx0XHR9KVxuXHRcdCk7XG5cdH1cblxuXHQvLyBDcmVhdGUgYnV0dG9uIGFuZCBzZXR1cCBhdHRyaWJ1dGVzXG5cdGVsZW1lbnRzLmJ1dHRvbi5hcHBlbmRUbyhlbGVtZW50cy50aXRsZWJhciB8fCB0b29sdGlwKVxuXHRcdC5hdHRyKCdyb2xlJywgJ2J1dHRvbicpXG5cdFx0LmNsaWNrKGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRpZighdG9vbHRpcC5oYXNDbGFzcyhDTEFTU19ESVNBQkxFRCkpIHsgc2VsZi5oaWRlKGV2ZW50KTsgfVxuXHRcdFx0cmV0dXJuIEZBTFNFO1xuXHRcdH0pO1xufTtcblxuUFJPVE9UWVBFLl91cGRhdGVCdXR0b24gPSBmdW5jdGlvbihidXR0b24pXG57XG5cdC8vIE1ha2Ugc3VyZSB0b29sdGlwIGlzIHJlbmRlcmVkIGFuZCBpZiBub3QsIHJldHVyblxuXHRpZighdGhpcy5yZW5kZXJlZCkgeyByZXR1cm4gRkFMU0U7IH1cblxuXHR2YXIgZWxlbSA9IHRoaXMuZWxlbWVudHMuYnV0dG9uO1xuXHRpZihidXR0b24pIHsgdGhpcy5fY3JlYXRlQnV0dG9uKCk7IH1cblx0ZWxzZSB7IGVsZW0ucmVtb3ZlKCk7IH1cbn07XG47Ly8gV2lkZ2V0IGNsYXNzIGNyZWF0b3JcbmZ1bmN0aW9uIGNyZWF0ZVdpZGdldENsYXNzKGNscykge1xuXHRyZXR1cm4gV0lER0VULmNvbmNhdCgnJykuam9pbihjbHMgPyAnLScrY2xzKycgJyA6ICcgJyk7XG59XG5cbi8vIFdpZGdldCBjbGFzcyBzZXR0ZXIgbWV0aG9kXG5QUk9UT1RZUEUuX3NldFdpZGdldCA9IGZ1bmN0aW9uKClcbntcblx0dmFyIG9uID0gdGhpcy5vcHRpb25zLnN0eWxlLndpZGdldCxcblx0XHRlbGVtZW50cyA9IHRoaXMuZWxlbWVudHMsXG5cdFx0dG9vbHRpcCA9IGVsZW1lbnRzLnRvb2x0aXAsXG5cdFx0ZGlzYWJsZWQgPSB0b29sdGlwLmhhc0NsYXNzKENMQVNTX0RJU0FCTEVEKTtcblxuXHR0b29sdGlwLnJlbW92ZUNsYXNzKENMQVNTX0RJU0FCTEVEKTtcblx0Q0xBU1NfRElTQUJMRUQgPSBvbiA/ICd1aS1zdGF0ZS1kaXNhYmxlZCcgOiAncXRpcC1kaXNhYmxlZCc7XG5cdHRvb2x0aXAudG9nZ2xlQ2xhc3MoQ0xBU1NfRElTQUJMRUQsIGRpc2FibGVkKTtcblxuXHR0b29sdGlwLnRvZ2dsZUNsYXNzKCd1aS1oZWxwZXItcmVzZXQgJytjcmVhdGVXaWRnZXRDbGFzcygpLCBvbikudG9nZ2xlQ2xhc3MoQ0xBU1NfREVGQVVMVCwgdGhpcy5vcHRpb25zLnN0eWxlLmRlZiAmJiAhb24pO1xuXG5cdGlmKGVsZW1lbnRzLmNvbnRlbnQpIHtcblx0XHRlbGVtZW50cy5jb250ZW50LnRvZ2dsZUNsYXNzKCBjcmVhdGVXaWRnZXRDbGFzcygnY29udGVudCcpLCBvbik7XG5cdH1cblx0aWYoZWxlbWVudHMudGl0bGViYXIpIHtcblx0XHRlbGVtZW50cy50aXRsZWJhci50b2dnbGVDbGFzcyggY3JlYXRlV2lkZ2V0Q2xhc3MoJ2hlYWRlcicpLCBvbik7XG5cdH1cblx0aWYoZWxlbWVudHMuYnV0dG9uKSB7XG5cdFx0ZWxlbWVudHMuYnV0dG9uLnRvZ2dsZUNsYXNzKE5BTUVTUEFDRSsnLWljb24nLCAhb24pO1xuXHR9XG59O1xuO2Z1bmN0aW9uIGRlbGF5KGNhbGxiYWNrLCBkdXJhdGlvbikge1xuXHQvLyBJZiB0b29sdGlwIGhhcyBkaXNwbGF5ZWQsIHN0YXJ0IGhpZGUgdGltZXJcblx0aWYoZHVyYXRpb24gPiAwKSB7XG5cdFx0cmV0dXJuIHNldFRpbWVvdXQoXG5cdFx0XHQkLnByb3h5KGNhbGxiYWNrLCB0aGlzKSwgZHVyYXRpb25cblx0XHQpO1xuXHR9XG5cdGVsc2V7IGNhbGxiYWNrLmNhbGwodGhpcyk7IH1cbn1cblxuZnVuY3Rpb24gc2hvd01ldGhvZChldmVudCkge1xuXHRpZih0aGlzLnRvb2x0aXAuaGFzQ2xhc3MoQ0xBU1NfRElTQUJMRUQpKSB7IHJldHVybjsgfVxuXG5cdC8vIENsZWFyIGhpZGUgdGltZXJzXG5cdGNsZWFyVGltZW91dCh0aGlzLnRpbWVycy5zaG93KTtcblx0Y2xlYXJUaW1lb3V0KHRoaXMudGltZXJzLmhpZGUpO1xuXG5cdC8vIFN0YXJ0IHNob3cgdGltZXJcblx0dGhpcy50aW1lcnMuc2hvdyA9IGRlbGF5LmNhbGwodGhpcyxcblx0XHRmdW5jdGlvbigpIHsgdGhpcy50b2dnbGUoVFJVRSwgZXZlbnQpOyB9LFxuXHRcdHRoaXMub3B0aW9ucy5zaG93LmRlbGF5XG5cdCk7XG59XG5cbmZ1bmN0aW9uIGhpZGVNZXRob2QoZXZlbnQpIHtcblx0aWYodGhpcy50b29sdGlwLmhhc0NsYXNzKENMQVNTX0RJU0FCTEVEKSB8fCB0aGlzLmRlc3Ryb3llZCkgeyByZXR1cm47IH1cblxuXHQvLyBDaGVjayBpZiBuZXcgdGFyZ2V0IHdhcyBhY3R1YWxseSB0aGUgdG9vbHRpcCBlbGVtZW50XG5cdHZhciByZWxhdGVkVGFyZ2V0ID0gJChldmVudC5yZWxhdGVkVGFyZ2V0KSxcblx0XHRvbnRvVG9vbHRpcCA9IHJlbGF0ZWRUYXJnZXQuY2xvc2VzdChTRUxFQ1RPUilbMF0gPT09IHRoaXMudG9vbHRpcFswXSxcblx0XHRvbnRvVGFyZ2V0ID0gcmVsYXRlZFRhcmdldFswXSA9PT0gdGhpcy5vcHRpb25zLnNob3cudGFyZ2V0WzBdO1xuXG5cdC8vIENsZWFyIHRpbWVycyBhbmQgc3RvcCBhbmltYXRpb24gcXVldWVcblx0Y2xlYXJUaW1lb3V0KHRoaXMudGltZXJzLnNob3cpO1xuXHRjbGVhclRpbWVvdXQodGhpcy50aW1lcnMuaGlkZSk7XG5cblx0Ly8gUHJldmVudCBoaWRpbmcgaWYgdG9vbHRpcCBpcyBmaXhlZCBhbmQgZXZlbnQgdGFyZ2V0IGlzIHRoZSB0b29sdGlwLlxuXHQvLyBPciBpZiBtb3VzZSBwb3NpdGlvbmluZyBpcyBlbmFibGVkIGFuZCBjdXJzb3IgbW9tZW50YXJpbHkgb3ZlcmxhcHNcblx0aWYodGhpcyAhPT0gcmVsYXRlZFRhcmdldFswXSAmJlxuXHRcdCh0aGlzLm9wdGlvbnMucG9zaXRpb24udGFyZ2V0ID09PSAnbW91c2UnICYmIG9udG9Ub29sdGlwKSB8fFxuXHRcdHRoaXMub3B0aW9ucy5oaWRlLmZpeGVkICYmIChcblx0XHRcdCgvbW91c2Uob3V0fGxlYXZlfG1vdmUpLykudGVzdChldmVudC50eXBlKSAmJiAob250b1Rvb2x0aXAgfHwgb250b1RhcmdldCkpXG5cdFx0KVxuXHR7XG5cdFx0LyogZXNsaW50LWRpc2FibGUgbm8tZW1wdHkgKi9cblx0XHR0cnkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuXHRcdH0gY2F0Y2goZSkge31cblx0XHQvKiBlc2xpbnQtZW5hYmxlIG5vLWVtcHR5ICovXG5cblx0XHRyZXR1cm47XG5cdH1cblxuXHQvLyBJZiB0b29sdGlwIGhhcyBkaXNwbGF5ZWQsIHN0YXJ0IGhpZGUgdGltZXJcblx0dGhpcy50aW1lcnMuaGlkZSA9IGRlbGF5LmNhbGwodGhpcyxcblx0XHRmdW5jdGlvbigpIHsgdGhpcy50b2dnbGUoRkFMU0UsIGV2ZW50KTsgfSxcblx0XHR0aGlzLm9wdGlvbnMuaGlkZS5kZWxheSxcblx0XHR0aGlzXG5cdCk7XG59XG5cbmZ1bmN0aW9uIGluYWN0aXZlTWV0aG9kKGV2ZW50KSB7XG5cdGlmKHRoaXMudG9vbHRpcC5oYXNDbGFzcyhDTEFTU19ESVNBQkxFRCkgfHwgIXRoaXMub3B0aW9ucy5oaWRlLmluYWN0aXZlKSB7IHJldHVybjsgfVxuXG5cdC8vIENsZWFyIHRpbWVyXG5cdGNsZWFyVGltZW91dCh0aGlzLnRpbWVycy5pbmFjdGl2ZSk7XG5cblx0dGhpcy50aW1lcnMuaW5hY3RpdmUgPSBkZWxheS5jYWxsKHRoaXMsXG5cdFx0ZnVuY3Rpb24oKXsgdGhpcy5oaWRlKGV2ZW50KTsgfSxcblx0XHR0aGlzLm9wdGlvbnMuaGlkZS5pbmFjdGl2ZVxuXHQpO1xufVxuXG5mdW5jdGlvbiByZXBvc2l0aW9uTWV0aG9kKGV2ZW50KSB7XG5cdGlmKHRoaXMucmVuZGVyZWQgJiYgdGhpcy50b29sdGlwWzBdLm9mZnNldFdpZHRoID4gMCkgeyB0aGlzLnJlcG9zaXRpb24oZXZlbnQpOyB9XG59XG5cbi8vIFN0b3JlIG1vdXNlIGNvb3JkaW5hdGVzXG5QUk9UT1RZUEUuX3N0b3JlTW91c2UgPSBmdW5jdGlvbihldmVudCkge1xuXHQodGhpcy5tb3VzZSA9ICQuZXZlbnQuZml4KGV2ZW50KSkudHlwZSA9ICdtb3VzZW1vdmUnO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8vIEJpbmQgZXZlbnRzXG5QUk9UT1RZUEUuX2JpbmQgPSBmdW5jdGlvbih0YXJnZXRzLCBldmVudHMsIG1ldGhvZCwgc3VmZml4LCBjb250ZXh0KSB7XG5cdGlmKCF0YXJnZXRzIHx8ICFtZXRob2QgfHwgIWV2ZW50cy5sZW5ndGgpIHsgcmV0dXJuOyB9XG5cdHZhciBucyA9ICcuJyArIHRoaXMuX2lkICsgKHN1ZmZpeCA/ICctJytzdWZmaXggOiAnJyk7XG5cdCQodGFyZ2V0cykuYmluZChcblx0XHQoZXZlbnRzLnNwbGl0ID8gZXZlbnRzIDogZXZlbnRzLmpvaW4obnMgKyAnICcpKSArIG5zLFxuXHRcdCQucHJveHkobWV0aG9kLCBjb250ZXh0IHx8IHRoaXMpXG5cdCk7XG5cdHJldHVybiB0aGlzO1xufTtcblBST1RPVFlQRS5fdW5iaW5kID0gZnVuY3Rpb24odGFyZ2V0cywgc3VmZml4KSB7XG5cdHRhcmdldHMgJiYgJCh0YXJnZXRzKS51bmJpbmQoJy4nICsgdGhpcy5faWQgKyAoc3VmZml4ID8gJy0nK3N1ZmZpeCA6ICcnKSk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLy8gR2xvYmFsIGRlbGVnYXRpb24gaGVscGVyXG5mdW5jdGlvbiBkZWxlZ2F0ZShzZWxlY3RvciwgZXZlbnRzLCBtZXRob2QpIHtcblx0JChkb2N1bWVudC5ib2R5KS5kZWxlZ2F0ZShzZWxlY3Rvcixcblx0XHQoZXZlbnRzLnNwbGl0ID8gZXZlbnRzIDogZXZlbnRzLmpvaW4oJy4nK05BTUVTUEFDRSArICcgJykpICsgJy4nK05BTUVTUEFDRSxcblx0XHRmdW5jdGlvbigpIHtcblx0XHRcdHZhciBhcGkgPSBRVElQLmFwaVsgJC5hdHRyKHRoaXMsIEFUVFJfSUQpIF07XG5cdFx0XHRhcGkgJiYgIWFwaS5kaXNhYmxlZCAmJiBtZXRob2QuYXBwbHkoYXBpLCBhcmd1bWVudHMpO1xuXHRcdH1cblx0KTtcbn1cbi8vIEV2ZW50IHRyaWdnZXJcblBST1RPVFlQRS5fdHJpZ2dlciA9IGZ1bmN0aW9uKHR5cGUsIGFyZ3MsIGV2ZW50KSB7XG5cdHZhciBjYWxsYmFjayA9IG5ldyAkLkV2ZW50KCd0b29sdGlwJyt0eXBlKTtcblx0Y2FsbGJhY2sub3JpZ2luYWxFdmVudCA9IGV2ZW50ICYmICQuZXh0ZW5kKHt9LCBldmVudCkgfHwgdGhpcy5jYWNoZS5ldmVudCB8fCBOVUxMO1xuXG5cdHRoaXMudHJpZ2dlcmluZyA9IHR5cGU7XG5cdHRoaXMudG9vbHRpcC50cmlnZ2VyKGNhbGxiYWNrLCBbdGhpc10uY29uY2F0KGFyZ3MgfHwgW10pKTtcblx0dGhpcy50cmlnZ2VyaW5nID0gRkFMU0U7XG5cblx0cmV0dXJuICFjYWxsYmFjay5pc0RlZmF1bHRQcmV2ZW50ZWQoKTtcbn07XG5cblBST1RPVFlQRS5fYmluZEV2ZW50cyA9IGZ1bmN0aW9uKHNob3dFdmVudHMsIGhpZGVFdmVudHMsIHNob3dUYXJnZXRzLCBoaWRlVGFyZ2V0cywgc2hvd0NhbGxiYWNrLCBoaWRlQ2FsbGJhY2spIHtcblx0Ly8gR2V0IHRhc3JnZXRzIHRoYXQgbHllIHdpdGhpbiBib3RoXG5cdHZhciBzaW1pbGFyVGFyZ2V0cyA9IHNob3dUYXJnZXRzLmZpbHRlciggaGlkZVRhcmdldHMgKS5hZGQoIGhpZGVUYXJnZXRzLmZpbHRlcihzaG93VGFyZ2V0cykgKSxcblx0XHR0b2dnbGVFdmVudHMgPSBbXTtcblxuXHQvLyBJZiBoaWRlIGFuZCBzaG93IHRhcmdldHMgYXJlIHRoZSBzYW1lLi4uXG5cdGlmKHNpbWlsYXJUYXJnZXRzLmxlbmd0aCkge1xuXG5cdFx0Ly8gRmlsdGVyIGlkZW50aWNhbCBzaG93L2hpZGUgZXZlbnRzXG5cdFx0JC5lYWNoKGhpZGVFdmVudHMsIGZ1bmN0aW9uKGksIHR5cGUpIHtcblx0XHRcdHZhciBzaG93SW5kZXggPSAkLmluQXJyYXkodHlwZSwgc2hvd0V2ZW50cyk7XG5cblx0XHRcdC8vIEJvdGggZXZlbnRzIGFyZSBpZGVudGljYWwsIHJlbW92ZSBmcm9tIGJvdGggaGlkZSBhbmQgc2hvdyBldmVudHNcblx0XHRcdC8vIGFuZCBhcHBlbmQgdG8gdG9nZ2xlRXZlbnRzXG5cdFx0XHRzaG93SW5kZXggPiAtMSAmJiB0b2dnbGVFdmVudHMucHVzaCggc2hvd0V2ZW50cy5zcGxpY2UoIHNob3dJbmRleCwgMSApWzBdICk7XG5cdFx0fSk7XG5cblx0XHQvLyBUb2dnbGUgZXZlbnRzIGFyZSBzcGVjaWFsIGNhc2Ugb2YgaWRlbnRpY2FsIHNob3cvaGlkZSBldmVudHMsIHdoaWNoIGhhcHBlbiBpbiBzZXF1ZW5jZVxuXHRcdGlmKHRvZ2dsZUV2ZW50cy5sZW5ndGgpIHtcblx0XHRcdC8vIEJpbmQgdG9nZ2xlIGV2ZW50cyB0byB0aGUgc2ltaWxhciB0YXJnZXRzXG5cdFx0XHR0aGlzLl9iaW5kKHNpbWlsYXJUYXJnZXRzLCB0b2dnbGVFdmVudHMsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdHZhciBzdGF0ZSA9IHRoaXMucmVuZGVyZWQgPyB0aGlzLnRvb2x0aXBbMF0ub2Zmc2V0V2lkdGggPiAwIDogZmFsc2U7XG5cdFx0XHRcdChzdGF0ZSA/IGhpZGVDYWxsYmFjayA6IHNob3dDYWxsYmFjaykuY2FsbCh0aGlzLCBldmVudCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gUmVtb3ZlIHRoZSBzaW1pbGFyIHRhcmdldHMgZnJvbSB0aGUgcmVndWxhciBzaG93L2hpZGUgYmluZGluZ3Ncblx0XHRcdHNob3dUYXJnZXRzID0gc2hvd1RhcmdldHMubm90KHNpbWlsYXJUYXJnZXRzKTtcblx0XHRcdGhpZGVUYXJnZXRzID0gaGlkZVRhcmdldHMubm90KHNpbWlsYXJUYXJnZXRzKTtcblx0XHR9XG5cdH1cblxuXHQvLyBBcHBseSBzaG93L2hpZGUvdG9nZ2xlIGV2ZW50c1xuXHR0aGlzLl9iaW5kKHNob3dUYXJnZXRzLCBzaG93RXZlbnRzLCBzaG93Q2FsbGJhY2spO1xuXHR0aGlzLl9iaW5kKGhpZGVUYXJnZXRzLCBoaWRlRXZlbnRzLCBoaWRlQ2FsbGJhY2spO1xufTtcblxuUFJPVE9UWVBFLl9hc3NpZ25Jbml0aWFsRXZlbnRzID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0dmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG5cdFx0c2hvd1RhcmdldCA9IG9wdGlvbnMuc2hvdy50YXJnZXQsXG5cdFx0aGlkZVRhcmdldCA9IG9wdGlvbnMuaGlkZS50YXJnZXQsXG5cdFx0c2hvd0V2ZW50cyA9IG9wdGlvbnMuc2hvdy5ldmVudCA/ICQudHJpbSgnJyArIG9wdGlvbnMuc2hvdy5ldmVudCkuc3BsaXQoJyAnKSA6IFtdLFxuXHRcdGhpZGVFdmVudHMgPSBvcHRpb25zLmhpZGUuZXZlbnQgPyAkLnRyaW0oJycgKyBvcHRpb25zLmhpZGUuZXZlbnQpLnNwbGl0KCcgJykgOiBbXTtcblxuXHQvLyBDYXRjaCByZW1vdmUvcmVtb3ZlcXRpcCBldmVudHMgb24gdGFyZ2V0IGVsZW1lbnQgdG8gZGVzdHJveSByZWR1bmRhbnQgdG9vbHRpcHNcblx0dGhpcy5fYmluZCh0aGlzLmVsZW1lbnRzLnRhcmdldCwgWydyZW1vdmUnLCAncmVtb3ZlcXRpcCddLCBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmRlc3Ryb3kodHJ1ZSk7XG5cdH0sICdkZXN0cm95Jyk7XG5cblx0Lypcblx0ICogTWFrZSBzdXJlIGhvdmVySW50ZW50IGZ1bmN0aW9ucyBwcm9wZXJseSBieSB1c2luZyBtb3VzZWxlYXZlIGFzIGEgaGlkZSBldmVudCBpZlxuXHQgKiBtb3VzZWVudGVyL21vdXNlb3V0IGlzIHVzZWQgZm9yIHNob3cuZXZlbnQsIGV2ZW4gaWYgaXQgaXNuJ3QgaW4gdGhlIHVzZXJzIG9wdGlvbnMuXG5cdCAqL1xuXHRpZigvbW91c2Uob3ZlcnxlbnRlcikvaS50ZXN0KG9wdGlvbnMuc2hvdy5ldmVudCkgJiYgIS9tb3VzZShvdXR8bGVhdmUpL2kudGVzdChvcHRpb25zLmhpZGUuZXZlbnQpKSB7XG5cdFx0aGlkZUV2ZW50cy5wdXNoKCdtb3VzZWxlYXZlJyk7XG5cdH1cblxuXHQvKlxuXHQgKiBBbHNvIG1ha2Ugc3VyZSBpbml0aWFsIG1vdXNlIHRhcmdldHRpbmcgd29ya3MgY29ycmVjdGx5IGJ5IGNhY2hpbmcgbW91c2Vtb3ZlIGNvb3Jkc1xuXHQgKiBvbiBzaG93IHRhcmdldHMgYmVmb3JlIHRoZSB0b29sdGlwIGhhcyByZW5kZXJlZC4gQWxzbyBzZXQgb25UYXJnZXQgd2hlbiB0cmlnZ2VyZWQgdG9cblx0ICoga2VlcCBtb3VzZSB0cmFja2luZyB3b3JraW5nLlxuXHQgKi9cblx0dGhpcy5fYmluZChzaG93VGFyZ2V0LCAnbW91c2Vtb3ZlJywgZnVuY3Rpb24obW92ZUV2ZW50KSB7XG5cdFx0dGhpcy5fc3RvcmVNb3VzZShtb3ZlRXZlbnQpO1xuXHRcdHRoaXMuY2FjaGUub25UYXJnZXQgPSBUUlVFO1xuXHR9KTtcblxuXHQvLyBEZWZpbmUgaG92ZXJJbnRlbnQgZnVuY3Rpb25cblx0ZnVuY3Rpb24gaG92ZXJJbnRlbnQoaG92ZXJFdmVudCkge1xuXHRcdC8vIE9ubHkgY29udGludWUgaWYgdG9vbHRpcCBpc24ndCBkaXNhYmxlZFxuXHRcdGlmKHRoaXMuZGlzYWJsZWQgfHwgdGhpcy5kZXN0cm95ZWQpIHsgcmV0dXJuIEZBTFNFOyB9XG5cblx0XHQvLyBDYWNoZSB0aGUgZXZlbnQgZGF0YVxuXHRcdHRoaXMuY2FjaGUuZXZlbnQgPSBob3ZlckV2ZW50ICYmICQuZXZlbnQuZml4KGhvdmVyRXZlbnQpO1xuXHRcdHRoaXMuY2FjaGUudGFyZ2V0ID0gaG92ZXJFdmVudCAmJiAkKGhvdmVyRXZlbnQudGFyZ2V0KTtcblxuXHRcdC8vIFN0YXJ0IHRoZSBldmVudCBzZXF1ZW5jZVxuXHRcdGNsZWFyVGltZW91dCh0aGlzLnRpbWVycy5zaG93KTtcblx0XHR0aGlzLnRpbWVycy5zaG93ID0gZGVsYXkuY2FsbCh0aGlzLFxuXHRcdFx0ZnVuY3Rpb24oKSB7IHRoaXMucmVuZGVyKHR5cGVvZiBob3ZlckV2ZW50ID09PSAnb2JqZWN0JyB8fCBvcHRpb25zLnNob3cucmVhZHkpOyB9LFxuXHRcdFx0b3B0aW9ucy5wcmVyZW5kZXIgPyAwIDogb3B0aW9ucy5zaG93LmRlbGF5XG5cdFx0KTtcblx0fVxuXG5cdC8vIEZpbHRlciBhbmQgYmluZCBldmVudHNcblx0dGhpcy5fYmluZEV2ZW50cyhzaG93RXZlbnRzLCBoaWRlRXZlbnRzLCBzaG93VGFyZ2V0LCBoaWRlVGFyZ2V0LCBob3ZlckludGVudCwgZnVuY3Rpb24oKSB7XG5cdFx0aWYoIXRoaXMudGltZXJzKSB7IHJldHVybiBGQUxTRTsgfVxuXHRcdGNsZWFyVGltZW91dCh0aGlzLnRpbWVycy5zaG93KTtcblx0fSk7XG5cblx0Ly8gUHJlcmVuZGVyaW5nIGlzIGVuYWJsZWQsIGNyZWF0ZSB0b29sdGlwIG5vd1xuXHRpZihvcHRpb25zLnNob3cucmVhZHkgfHwgb3B0aW9ucy5wcmVyZW5kZXIpIHsgaG92ZXJJbnRlbnQuY2FsbCh0aGlzLCBldmVudCk7IH1cbn07XG5cbi8vIEV2ZW50IGFzc2lnbm1lbnQgbWV0aG9kXG5QUk9UT1RZUEUuX2Fzc2lnbkV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgc2VsZiA9IHRoaXMsXG5cdFx0b3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcblx0XHRwb3NPcHRpb25zID0gb3B0aW9ucy5wb3NpdGlvbixcblxuXHRcdHRvb2x0aXAgPSB0aGlzLnRvb2x0aXAsXG5cdFx0c2hvd1RhcmdldCA9IG9wdGlvbnMuc2hvdy50YXJnZXQsXG5cdFx0aGlkZVRhcmdldCA9IG9wdGlvbnMuaGlkZS50YXJnZXQsXG5cdFx0Y29udGFpbmVyVGFyZ2V0ID0gcG9zT3B0aW9ucy5jb250YWluZXIsXG5cdFx0dmlld3BvcnRUYXJnZXQgPSBwb3NPcHRpb25zLnZpZXdwb3J0LFxuXHRcdGRvY3VtZW50VGFyZ2V0ID0gJChkb2N1bWVudCksXG5cdFx0d2luZG93VGFyZ2V0ID0gJCh3aW5kb3cpLFxuXG5cdFx0c2hvd0V2ZW50cyA9IG9wdGlvbnMuc2hvdy5ldmVudCA/ICQudHJpbSgnJyArIG9wdGlvbnMuc2hvdy5ldmVudCkuc3BsaXQoJyAnKSA6IFtdLFxuXHRcdGhpZGVFdmVudHMgPSBvcHRpb25zLmhpZGUuZXZlbnQgPyAkLnRyaW0oJycgKyBvcHRpb25zLmhpZGUuZXZlbnQpLnNwbGl0KCcgJykgOiBbXTtcblxuXG5cdC8vIEFzc2lnbiBwYXNzZWQgZXZlbnQgY2FsbGJhY2tzXG5cdCQuZWFjaChvcHRpb25zLmV2ZW50cywgZnVuY3Rpb24obmFtZSwgY2FsbGJhY2spIHtcblx0XHRzZWxmLl9iaW5kKHRvb2x0aXAsIG5hbWUgPT09ICd0b2dnbGUnID8gWyd0b29sdGlwc2hvdycsJ3Rvb2x0aXBoaWRlJ10gOiBbJ3Rvb2x0aXAnK25hbWVdLCBjYWxsYmFjaywgbnVsbCwgdG9vbHRpcCk7XG5cdH0pO1xuXG5cdC8vIEhpZGUgdG9vbHRpcHMgd2hlbiBsZWF2aW5nIGN1cnJlbnQgd2luZG93L2ZyYW1lIChidXQgbm90IHNlbGVjdC9vcHRpb24gZWxlbWVudHMpXG5cdGlmKC9tb3VzZShvdXR8bGVhdmUpL2kudGVzdChvcHRpb25zLmhpZGUuZXZlbnQpICYmIG9wdGlvbnMuaGlkZS5sZWF2ZSA9PT0gJ3dpbmRvdycpIHtcblx0XHR0aGlzLl9iaW5kKGRvY3VtZW50VGFyZ2V0LCBbJ21vdXNlb3V0JywgJ2JsdXInXSwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGlmKCEvc2VsZWN0fG9wdGlvbi8udGVzdChldmVudC50YXJnZXQubm9kZU5hbWUpICYmICFldmVudC5yZWxhdGVkVGFyZ2V0KSB7XG5cdFx0XHRcdHRoaXMuaGlkZShldmVudCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBFbmFibGUgaGlkZS5maXhlZCBieSBhZGRpbmcgYXBwcm9wcmlhdGUgY2xhc3Ncblx0aWYob3B0aW9ucy5oaWRlLmZpeGVkKSB7XG5cdFx0aGlkZVRhcmdldCA9IGhpZGVUYXJnZXQuYWRkKCB0b29sdGlwLmFkZENsYXNzKENMQVNTX0ZJWEVEKSApO1xuXHR9XG5cblx0Lypcblx0ICogTWFrZSBzdXJlIGhvdmVySW50ZW50IGZ1bmN0aW9ucyBwcm9wZXJseSBieSB1c2luZyBtb3VzZWxlYXZlIHRvIGNsZWFyIHNob3cgdGltZXIgaWZcblx0ICogbW91c2VlbnRlci9tb3VzZW91dCBpcyB1c2VkIGZvciBzaG93LmV2ZW50LCBldmVuIGlmIGl0IGlzbid0IGluIHRoZSB1c2VycyBvcHRpb25zLlxuXHQgKi9cblx0ZWxzZSBpZigvbW91c2Uob3ZlcnxlbnRlcikvaS50ZXN0KG9wdGlvbnMuc2hvdy5ldmVudCkpIHtcblx0XHR0aGlzLl9iaW5kKGhpZGVUYXJnZXQsICdtb3VzZWxlYXZlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRjbGVhclRpbWVvdXQodGhpcy50aW1lcnMuc2hvdyk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBIaWRlIHRvb2x0aXAgb24gZG9jdW1lbnQgbW91c2Vkb3duIGlmIHVuZm9jdXMgZXZlbnRzIGFyZSBlbmFibGVkXG5cdGlmKCgnJyArIG9wdGlvbnMuaGlkZS5ldmVudCkuaW5kZXhPZigndW5mb2N1cycpID4gLTEpIHtcblx0XHR0aGlzLl9iaW5kKGNvbnRhaW5lclRhcmdldC5jbG9zZXN0KCdodG1sJyksIFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXSwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdHZhciBlbGVtID0gJChldmVudC50YXJnZXQpLFxuXHRcdFx0XHRlbmFibGVkID0gdGhpcy5yZW5kZXJlZCAmJiAhdGhpcy50b29sdGlwLmhhc0NsYXNzKENMQVNTX0RJU0FCTEVEKSAmJiB0aGlzLnRvb2x0aXBbMF0ub2Zmc2V0V2lkdGggPiAwLFxuXHRcdFx0XHRpc0FuY2VzdG9yID0gZWxlbS5wYXJlbnRzKFNFTEVDVE9SKS5maWx0ZXIodGhpcy50b29sdGlwWzBdKS5sZW5ndGggPiAwO1xuXG5cdFx0XHRpZihlbGVtWzBdICE9PSB0aGlzLnRhcmdldFswXSAmJiBlbGVtWzBdICE9PSB0aGlzLnRvb2x0aXBbMF0gJiYgIWlzQW5jZXN0b3IgJiZcblx0XHRcdFx0IXRoaXMudGFyZ2V0LmhhcyhlbGVtWzBdKS5sZW5ndGggJiYgZW5hYmxlZFxuXHRcdFx0KSB7XG5cdFx0XHRcdHRoaXMuaGlkZShldmVudCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBDaGVjayBpZiB0aGUgdG9vbHRpcCBoaWRlcyB3aGVuIGluYWN0aXZlXG5cdGlmKCdudW1iZXInID09PSB0eXBlb2Ygb3B0aW9ucy5oaWRlLmluYWN0aXZlKSB7XG5cdFx0Ly8gQmluZCBpbmFjdGl2ZSBtZXRob2QgdG8gc2hvdyB0YXJnZXQocykgYXMgYSBjdXN0b20gZXZlbnRcblx0XHR0aGlzLl9iaW5kKHNob3dUYXJnZXQsICdxdGlwLScrdGhpcy5pZCsnLWluYWN0aXZlJywgaW5hY3RpdmVNZXRob2QsICdpbmFjdGl2ZScpO1xuXG5cdFx0Ly8gRGVmaW5lIGV2ZW50cyB3aGljaCByZXNldCB0aGUgJ2luYWN0aXZlJyBldmVudCBoYW5kbGVyXG5cdFx0dGhpcy5fYmluZChoaWRlVGFyZ2V0LmFkZCh0b29sdGlwKSwgUVRJUC5pbmFjdGl2ZUV2ZW50cywgaW5hY3RpdmVNZXRob2QpO1xuXHR9XG5cblx0Ly8gRmlsdGVyIGFuZCBiaW5kIGV2ZW50c1xuXHR0aGlzLl9iaW5kRXZlbnRzKHNob3dFdmVudHMsIGhpZGVFdmVudHMsIHNob3dUYXJnZXQsIGhpZGVUYXJnZXQsIHNob3dNZXRob2QsIGhpZGVNZXRob2QpO1xuXG5cdC8vIE1vdXNlIG1vdmVtZW50IGJpbmRpbmdzXG5cdHRoaXMuX2JpbmQoc2hvd1RhcmdldC5hZGQodG9vbHRpcCksICdtb3VzZW1vdmUnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdC8vIENoZWNrIGlmIHRoZSB0b29sdGlwIGhpZGVzIHdoZW4gbW91c2UgaXMgbW92ZWQgYSBjZXJ0YWluIGRpc3RhbmNlXG5cdFx0aWYoJ251bWJlcicgPT09IHR5cGVvZiBvcHRpb25zLmhpZGUuZGlzdGFuY2UpIHtcblx0XHRcdHZhciBvcmlnaW4gPSB0aGlzLmNhY2hlLm9yaWdpbiB8fCB7fSxcblx0XHRcdFx0bGltaXQgPSB0aGlzLm9wdGlvbnMuaGlkZS5kaXN0YW5jZSxcblx0XHRcdFx0YWJzID0gTWF0aC5hYnM7XG5cblx0XHRcdC8vIENoZWNrIGlmIHRoZSBtb3ZlbWVudCBoYXMgZ29uZSBiZXlvbmQgdGhlIGxpbWl0LCBhbmQgaGlkZSBpdCBpZiBzb1xuXHRcdFx0aWYoYWJzKGV2ZW50LnBhZ2VYIC0gb3JpZ2luLnBhZ2VYKSA+PSBsaW1pdCB8fCBhYnMoZXZlbnQucGFnZVkgLSBvcmlnaW4ucGFnZVkpID49IGxpbWl0KSB7XG5cdFx0XHRcdHRoaXMuaGlkZShldmVudCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gQ2FjaGUgbW91c2Vtb3ZlIGNvb3JkcyBvbiBzaG93IHRhcmdldHNcblx0XHR0aGlzLl9zdG9yZU1vdXNlKGV2ZW50KTtcblx0fSk7XG5cblx0Ly8gTW91c2UgcG9zaXRpb25pbmcgZXZlbnRzXG5cdGlmKHBvc09wdGlvbnMudGFyZ2V0ID09PSAnbW91c2UnKSB7XG5cdFx0Ly8gSWYgbW91c2UgYWRqdXN0bWVudCBpcyBvbi4uLlxuXHRcdGlmKHBvc09wdGlvbnMuYWRqdXN0Lm1vdXNlKSB7XG5cdFx0XHQvLyBBcHBseSBhIG1vdXNlbGVhdmUgZXZlbnQgc28gd2UgZG9uJ3QgZ2V0IHByb2JsZW1zIHdpdGggb3ZlcmxhcHBpbmdcblx0XHRcdGlmKG9wdGlvbnMuaGlkZS5ldmVudCkge1xuXHRcdFx0XHQvLyBUcmFjayBpZiB3ZSdyZSBvbiB0aGUgdGFyZ2V0IG9yIG5vdFxuXHRcdFx0XHR0aGlzLl9iaW5kKHNob3dUYXJnZXQsIFsnbW91c2VlbnRlcicsICdtb3VzZWxlYXZlJ10sIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdFx0aWYoIXRoaXMuY2FjaGUpIHtyZXR1cm4gRkFMU0U7IH1cblx0XHRcdFx0XHR0aGlzLmNhY2hlLm9uVGFyZ2V0ID0gZXZlbnQudHlwZSA9PT0gJ21vdXNlZW50ZXInO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVXBkYXRlIHRvb2x0aXAgcG9zaXRpb24gb24gbW91c2Vtb3ZlXG5cdFx0XHR0aGlzLl9iaW5kKGRvY3VtZW50VGFyZ2V0LCAnbW91c2Vtb3ZlJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0Ly8gVXBkYXRlIHRoZSB0b29sdGlwIHBvc2l0aW9uIG9ubHkgaWYgdGhlIHRvb2x0aXAgaXMgdmlzaWJsZSBhbmQgYWRqdXN0bWVudCBpcyBlbmFibGVkXG5cdFx0XHRcdGlmKHRoaXMucmVuZGVyZWQgJiYgdGhpcy5jYWNoZS5vblRhcmdldCAmJiAhdGhpcy50b29sdGlwLmhhc0NsYXNzKENMQVNTX0RJU0FCTEVEKSAmJiB0aGlzLnRvb2x0aXBbMF0ub2Zmc2V0V2lkdGggPiAwKSB7XG5cdFx0XHRcdFx0dGhpcy5yZXBvc2l0aW9uKGV2ZW50KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQWRqdXN0IHBvc2l0aW9ucyBvZiB0aGUgdG9vbHRpcCBvbiB3aW5kb3cgcmVzaXplIGlmIGVuYWJsZWRcblx0aWYocG9zT3B0aW9ucy5hZGp1c3QucmVzaXplIHx8IHZpZXdwb3J0VGFyZ2V0Lmxlbmd0aCkge1xuXHRcdHRoaXMuX2JpbmQoICQuZXZlbnQuc3BlY2lhbC5yZXNpemUgPyB2aWV3cG9ydFRhcmdldCA6IHdpbmRvd1RhcmdldCwgJ3Jlc2l6ZScsIHJlcG9zaXRpb25NZXRob2QgKTtcblx0fVxuXG5cdC8vIEFkanVzdCB0b29sdGlwIHBvc2l0aW9uIG9uIHNjcm9sbCBvZiB0aGUgd2luZG93IG9yIHZpZXdwb3J0IGVsZW1lbnQgaWYgcHJlc2VudFxuXHRpZihwb3NPcHRpb25zLmFkanVzdC5zY3JvbGwpIHtcblx0XHR0aGlzLl9iaW5kKCB3aW5kb3dUYXJnZXQuYWRkKHBvc09wdGlvbnMuY29udGFpbmVyKSwgJ3Njcm9sbCcsIHJlcG9zaXRpb25NZXRob2QgKTtcblx0fVxufTtcblxuLy8gVW4tYXNzaWdubWVudCBtZXRob2RcblBST1RPVFlQRS5fdW5hc3NpZ25FdmVudHMgPSBmdW5jdGlvbigpIHtcblx0dmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG5cdFx0c2hvd1RhcmdldHMgPSBvcHRpb25zLnNob3cudGFyZ2V0LFxuXHRcdGhpZGVUYXJnZXRzID0gb3B0aW9ucy5oaWRlLnRhcmdldCxcblx0XHR0YXJnZXRzID0gJC5ncmVwKFtcblx0XHRcdHRoaXMuZWxlbWVudHMudGFyZ2V0WzBdLFxuXHRcdFx0dGhpcy5yZW5kZXJlZCAmJiB0aGlzLnRvb2x0aXBbMF0sXG5cdFx0XHRvcHRpb25zLnBvc2l0aW9uLmNvbnRhaW5lclswXSxcblx0XHRcdG9wdGlvbnMucG9zaXRpb24udmlld3BvcnRbMF0sXG5cdFx0XHRvcHRpb25zLnBvc2l0aW9uLmNvbnRhaW5lci5jbG9zZXN0KCdodG1sJylbMF0sIC8vIHVuZm9jdXNcblx0XHRcdHdpbmRvdyxcblx0XHRcdGRvY3VtZW50XG5cdFx0XSwgZnVuY3Rpb24oaSkge1xuXHRcdFx0cmV0dXJuIHR5cGVvZiBpID09PSAnb2JqZWN0Jztcblx0XHR9KTtcblxuXHQvLyBBZGQgc2hvdyBhbmQgaGlkZSB0YXJnZXRzIGlmIHRoZXkncmUgdmFsaWRcblx0aWYoc2hvd1RhcmdldHMgJiYgc2hvd1RhcmdldHMudG9BcnJheSkge1xuXHRcdHRhcmdldHMgPSB0YXJnZXRzLmNvbmNhdChzaG93VGFyZ2V0cy50b0FycmF5KCkpO1xuXHR9XG5cdGlmKGhpZGVUYXJnZXRzICYmIGhpZGVUYXJnZXRzLnRvQXJyYXkpIHtcblx0XHR0YXJnZXRzID0gdGFyZ2V0cy5jb25jYXQoaGlkZVRhcmdldHMudG9BcnJheSgpKTtcblx0fVxuXG5cdC8vIFVuYmluZCB0aGUgZXZlbnRzXG5cdHRoaXMuX3VuYmluZCh0YXJnZXRzKVxuXHRcdC5fdW5iaW5kKHRhcmdldHMsICdkZXN0cm95Jylcblx0XHQuX3VuYmluZCh0YXJnZXRzLCAnaW5hY3RpdmUnKTtcbn07XG5cbi8vIEFwcGx5IGNvbW1vbiBldmVudCBoYW5kbGVycyB1c2luZyBkZWxlZ2F0ZSAoYXZvaWRzIGV4Y2Vzc2l2ZSAuYmluZCBjYWxscyEpXG4kKGZ1bmN0aW9uKCkge1xuXHRkZWxlZ2F0ZShTRUxFQ1RPUiwgWydtb3VzZWVudGVyJywgJ21vdXNlbGVhdmUnXSwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgc3RhdGUgPSBldmVudC50eXBlID09PSAnbW91c2VlbnRlcicsXG5cdFx0XHR0b29sdGlwID0gJChldmVudC5jdXJyZW50VGFyZ2V0KSxcblx0XHRcdHRhcmdldCA9ICQoZXZlbnQucmVsYXRlZFRhcmdldCB8fCBldmVudC50YXJnZXQpLFxuXHRcdFx0b3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuXHRcdC8vIE9uIG1vdXNlZW50ZXIuLi5cblx0XHRpZihzdGF0ZSkge1xuXHRcdFx0Ly8gRm9jdXMgdGhlIHRvb2x0aXAgb24gbW91c2VlbnRlciAoei1pbmRleCBzdGFja2luZylcblx0XHRcdHRoaXMuZm9jdXMoZXZlbnQpO1xuXG5cdFx0XHQvLyBDbGVhciBoaWRlIHRpbWVyIG9uIHRvb2x0aXAgaG92ZXIgdG8gcHJldmVudCBpdCBmcm9tIGNsb3Npbmdcblx0XHRcdHRvb2x0aXAuaGFzQ2xhc3MoQ0xBU1NfRklYRUQpICYmICF0b29sdGlwLmhhc0NsYXNzKENMQVNTX0RJU0FCTEVEKSAmJiBjbGVhclRpbWVvdXQodGhpcy50aW1lcnMuaGlkZSk7XG5cdFx0fVxuXG5cdFx0Ly8gT24gbW91c2VsZWF2ZS4uLlxuXHRcdGVsc2Uge1xuXHRcdFx0Ly8gV2hlbiBtb3VzZSB0cmFja2luZyBpcyBlbmFibGVkLCBoaWRlIHdoZW4gd2UgbGVhdmUgdGhlIHRvb2x0aXAgYW5kIG5vdCBvbnRvIHRoZSBzaG93IHRhcmdldCAoaWYgYSBoaWRlIGV2ZW50IGlzIHNldClcblx0XHRcdGlmKG9wdGlvbnMucG9zaXRpb24udGFyZ2V0ID09PSAnbW91c2UnICYmIG9wdGlvbnMucG9zaXRpb24uYWRqdXN0Lm1vdXNlICYmXG5cdFx0XHRcdG9wdGlvbnMuaGlkZS5ldmVudCAmJiBvcHRpb25zLnNob3cudGFyZ2V0ICYmICF0YXJnZXQuY2xvc2VzdChvcHRpb25zLnNob3cudGFyZ2V0WzBdKS5sZW5ndGgpIHtcblx0XHRcdFx0dGhpcy5oaWRlKGV2ZW50KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBBZGQgaG92ZXIgY2xhc3Ncblx0XHR0b29sdGlwLnRvZ2dsZUNsYXNzKENMQVNTX0hPVkVSLCBzdGF0ZSk7XG5cdH0pO1xuXG5cdC8vIERlZmluZSBldmVudHMgd2hpY2ggcmVzZXQgdGhlICdpbmFjdGl2ZScgZXZlbnQgaGFuZGxlclxuXHRkZWxlZ2F0ZSgnWycrQVRUUl9JRCsnXScsIElOQUNUSVZFX0VWRU5UUywgaW5hY3RpdmVNZXRob2QpO1xufSk7XG47Ly8gSW5pdGlhbGl6YXRpb24gbWV0aG9kXG5mdW5jdGlvbiBpbml0KGVsZW0sIGlkLCBvcHRzKSB7XG5cdHZhciBvYmosIHBvc09wdGlvbnMsIGF0dHIsIGNvbmZpZywgdGl0bGUsXG5cblx0Ly8gU2V0dXAgZWxlbWVudCByZWZlcmVuY2VzXG5cdGRvY0JvZHkgPSAkKGRvY3VtZW50LmJvZHkpLFxuXG5cdC8vIFVzZSBkb2N1bWVudCBib2R5IGluc3RlYWQgb2YgZG9jdW1lbnQgZWxlbWVudCBpZiBuZWVkZWRcblx0bmV3VGFyZ2V0ID0gZWxlbVswXSA9PT0gZG9jdW1lbnQgPyBkb2NCb2R5IDogZWxlbSxcblxuXHQvLyBHcmFiIG1ldGFkYXRhIGZyb20gZWxlbWVudCBpZiBwbHVnaW4gaXMgcHJlc2VudFxuXHRtZXRhZGF0YSA9IGVsZW0ubWV0YWRhdGEgPyBlbGVtLm1ldGFkYXRhKG9wdHMubWV0YWRhdGEpIDogTlVMTCxcblxuXHQvLyBJZiBtZXRhZGF0YSB0eXBlIGlmIEhUTUw1LCBncmFiICduYW1lJyBmcm9tIHRoZSBvYmplY3QgaW5zdGVhZCwgb3IgdXNlIHRoZSByZWd1bGFyIGRhdGEgb2JqZWN0IG90aGVyd2lzZVxuXHRtZXRhZGF0YTUgPSBvcHRzLm1ldGFkYXRhLnR5cGUgPT09ICdodG1sNScgJiYgbWV0YWRhdGEgPyBtZXRhZGF0YVtvcHRzLm1ldGFkYXRhLm5hbWVdIDogTlVMTCxcblxuXHQvLyBHcmFiIGRhdGEgZnJvbSBtZXRhZGF0YS5uYW1lIChvciBkYXRhLXF0aXBvcHRzIGFzIGZhbGxiYWNrKSB1c2luZyAuZGF0YSgpIG1ldGhvZCxcblx0aHRtbDUgPSBlbGVtLmRhdGEob3B0cy5tZXRhZGF0YS5uYW1lIHx8ICdxdGlwb3B0cycpO1xuXG5cdC8vIElmIHdlIGRvbid0IGdldCBhbiBvYmplY3QgcmV0dXJuZWQgYXR0ZW1wdCB0byBwYXJzZSBpdCBtYW51YWx5bCB3aXRob3V0IHBhcnNlSlNPTlxuXHQvKiBlc2xpbnQtZGlzYWJsZSBuby1lbXB0eSAqL1xuXHR0cnkgeyBodG1sNSA9IHR5cGVvZiBodG1sNSA9PT0gJ3N0cmluZycgPyAkLnBhcnNlSlNPTihodG1sNSkgOiBodG1sNTsgfVxuXHRjYXRjaChlKSB7fVxuXHQvKiBlc2xpbnQtZW5hYmxlIG5vLWVtcHR5ICovXG5cblx0Ly8gTWVyZ2UgaW4gYW5kIHNhbml0aXplIG1ldGFkYXRhXG5cdGNvbmZpZyA9ICQuZXh0ZW5kKFRSVUUsIHt9LCBRVElQLmRlZmF1bHRzLCBvcHRzLFxuXHRcdHR5cGVvZiBodG1sNSA9PT0gJ29iamVjdCcgPyBzYW5pdGl6ZU9wdGlvbnMoaHRtbDUpIDogTlVMTCxcblx0XHRzYW5pdGl6ZU9wdGlvbnMobWV0YWRhdGE1IHx8IG1ldGFkYXRhKSk7XG5cblx0Ly8gUmUtZ3JhYiBvdXIgcG9zaXRpb25pbmcgb3B0aW9ucyBub3cgd2UndmUgbWVyZ2VkIG91ciBtZXRhZGF0YSBhbmQgc2V0IGlkIHRvIHBhc3NlZCB2YWx1ZVxuXHRwb3NPcHRpb25zID0gY29uZmlnLnBvc2l0aW9uO1xuXHRjb25maWcuaWQgPSBpZDtcblxuXHQvLyBTZXR1cCBtaXNzaW5nIGNvbnRlbnQgaWYgbm9uZSBpcyBkZXRlY3RlZFxuXHRpZignYm9vbGVhbicgPT09IHR5cGVvZiBjb25maWcuY29udGVudC50ZXh0KSB7XG5cdFx0YXR0ciA9IGVsZW0uYXR0cihjb25maWcuY29udGVudC5hdHRyKTtcblxuXHRcdC8vIEdyYWIgZnJvbSBzdXBwbGllZCBhdHRyaWJ1dGUgaWYgYXZhaWxhYmxlXG5cdFx0aWYoY29uZmlnLmNvbnRlbnQuYXR0ciAhPT0gRkFMU0UgJiYgYXR0cikgeyBjb25maWcuY29udGVudC50ZXh0ID0gYXR0cjsgfVxuXG5cdFx0Ly8gTm8gdmFsaWQgY29udGVudCB3YXMgZm91bmQsIGFib3J0IHJlbmRlclxuXHRcdGVsc2UgeyByZXR1cm4gRkFMU0U7IH1cblx0fVxuXG5cdC8vIFNldHVwIHRhcmdldCBvcHRpb25zXG5cdGlmKCFwb3NPcHRpb25zLmNvbnRhaW5lci5sZW5ndGgpIHsgcG9zT3B0aW9ucy5jb250YWluZXIgPSBkb2NCb2R5OyB9XG5cdGlmKHBvc09wdGlvbnMudGFyZ2V0ID09PSBGQUxTRSkgeyBwb3NPcHRpb25zLnRhcmdldCA9IG5ld1RhcmdldDsgfVxuXHRpZihjb25maWcuc2hvdy50YXJnZXQgPT09IEZBTFNFKSB7IGNvbmZpZy5zaG93LnRhcmdldCA9IG5ld1RhcmdldDsgfVxuXHRpZihjb25maWcuc2hvdy5zb2xvID09PSBUUlVFKSB7IGNvbmZpZy5zaG93LnNvbG8gPSBwb3NPcHRpb25zLmNvbnRhaW5lci5jbG9zZXN0KCdib2R5Jyk7IH1cblx0aWYoY29uZmlnLmhpZGUudGFyZ2V0ID09PSBGQUxTRSkgeyBjb25maWcuaGlkZS50YXJnZXQgPSBuZXdUYXJnZXQ7IH1cblx0aWYoY29uZmlnLnBvc2l0aW9uLnZpZXdwb3J0ID09PSBUUlVFKSB7IGNvbmZpZy5wb3NpdGlvbi52aWV3cG9ydCA9IHBvc09wdGlvbnMuY29udGFpbmVyOyB9XG5cblx0Ly8gRW5zdXJlIHdlIG9ubHkgdXNlIGEgc2luZ2xlIGNvbnRhaW5lclxuXHRwb3NPcHRpb25zLmNvbnRhaW5lciA9IHBvc09wdGlvbnMuY29udGFpbmVyLmVxKDApO1xuXG5cdC8vIENvbnZlcnQgcG9zaXRpb24gY29ybmVyIHZhbHVlcyBpbnRvIHggYW5kIHkgc3RyaW5nc1xuXHRwb3NPcHRpb25zLmF0ID0gbmV3IENPUk5FUihwb3NPcHRpb25zLmF0LCBUUlVFKTtcblx0cG9zT3B0aW9ucy5teSA9IG5ldyBDT1JORVIocG9zT3B0aW9ucy5teSk7XG5cblx0Ly8gRGVzdHJveSBwcmV2aW91cyB0b29sdGlwIGlmIG92ZXJ3cml0ZSBpcyBlbmFibGVkLCBvciBza2lwIGVsZW1lbnQgaWYgbm90XG5cdGlmKGVsZW0uZGF0YShOQU1FU1BBQ0UpKSB7XG5cdFx0aWYoY29uZmlnLm92ZXJ3cml0ZSkge1xuXHRcdFx0ZWxlbS5xdGlwKCdkZXN0cm95JywgdHJ1ZSk7XG5cdFx0fVxuXHRcdGVsc2UgaWYoY29uZmlnLm92ZXJ3cml0ZSA9PT0gRkFMU0UpIHtcblx0XHRcdHJldHVybiBGQUxTRTtcblx0XHR9XG5cdH1cblxuXHQvLyBBZGQgaGFzLXF0aXAgYXR0cmlidXRlXG5cdGVsZW0uYXR0cihBVFRSX0hBUywgaWQpO1xuXG5cdC8vIFJlbW92ZSB0aXRsZSBhdHRyaWJ1dGUgYW5kIHN0b3JlIGl0IGlmIHByZXNlbnRcblx0aWYoY29uZmlnLnN1cHByZXNzICYmICh0aXRsZSA9IGVsZW0uYXR0cigndGl0bGUnKSkpIHtcblx0XHQvLyBGaW5hbCBhdHRyIGNhbGwgZml4ZXMgZXZlbnQgZGVsZWdhdGlvbSBhbmQgSUUgZGVmYXVsdCB0b29sdGlwIHNob3dpbmcgcHJvYmxlbVxuXHRcdGVsZW0ucmVtb3ZlQXR0cigndGl0bGUnKS5hdHRyKG9sZHRpdGxlLCB0aXRsZSkuYXR0cigndGl0bGUnLCAnJyk7XG5cdH1cblxuXHQvLyBJbml0aWFsaXplIHRoZSB0b29sdGlwIGFuZCBhZGQgQVBJIHJlZmVyZW5jZVxuXHRvYmogPSBuZXcgUVRpcChlbGVtLCBjb25maWcsIGlkLCAhIWF0dHIpO1xuXHRlbGVtLmRhdGEoTkFNRVNQQUNFLCBvYmopO1xuXG5cdHJldHVybiBvYmo7XG59XG5cbi8vIGpRdWVyeSAkLmZuIGV4dGVuc2lvbiBtZXRob2RcblFUSVAgPSAkLmZuLnF0aXAgPSBmdW5jdGlvbihvcHRpb25zLCBub3RhdGlvbiwgbmV3VmFsdWUpXG57XG5cdHZhciBjb21tYW5kID0gKCcnICsgb3B0aW9ucykudG9Mb3dlckNhc2UoKSwgLy8gUGFyc2UgY29tbWFuZFxuXHRcdHJldHVybmVkID0gTlVMTCxcblx0XHRhcmdzID0gJC5tYWtlQXJyYXkoYXJndW1lbnRzKS5zbGljZSgxKSxcblx0XHRldmVudCA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXSxcblx0XHRvcHRzID0gdGhpc1swXSA/ICQuZGF0YSh0aGlzWzBdLCBOQU1FU1BBQ0UpIDogTlVMTDtcblxuXHQvLyBDaGVjayBmb3IgQVBJIHJlcXVlc3Rcblx0aWYoIWFyZ3VtZW50cy5sZW5ndGggJiYgb3B0cyB8fCBjb21tYW5kID09PSAnYXBpJykge1xuXHRcdHJldHVybiBvcHRzO1xuXHR9XG5cblx0Ly8gRXhlY3V0ZSBBUEkgY29tbWFuZCBpZiBwcmVzZW50XG5cdGVsc2UgaWYoJ3N0cmluZycgPT09IHR5cGVvZiBvcHRpb25zKSB7XG5cdFx0dGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGFwaSA9ICQuZGF0YSh0aGlzLCBOQU1FU1BBQ0UpO1xuXHRcdFx0aWYoIWFwaSkgeyByZXR1cm4gVFJVRTsgfVxuXG5cdFx0XHQvLyBDYWNoZSB0aGUgZXZlbnQgaWYgcG9zc2libGVcblx0XHRcdGlmKGV2ZW50ICYmIGV2ZW50LnRpbWVTdGFtcCkgeyBhcGkuY2FjaGUuZXZlbnQgPSBldmVudDsgfVxuXG5cdFx0XHQvLyBDaGVjayBmb3Igc3BlY2lmaWMgQVBJIGNvbW1hbmRzXG5cdFx0XHRpZihub3RhdGlvbiAmJiAoY29tbWFuZCA9PT0gJ29wdGlvbicgfHwgY29tbWFuZCA9PT0gJ29wdGlvbnMnKSkge1xuXHRcdFx0XHRpZihuZXdWYWx1ZSAhPT0gdW5kZWZpbmVkIHx8ICQuaXNQbGFpbk9iamVjdChub3RhdGlvbikpIHtcblx0XHRcdFx0XHRhcGkuc2V0KG5vdGF0aW9uLCBuZXdWYWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuZWQgPSBhcGkuZ2V0KG5vdGF0aW9uKTtcblx0XHRcdFx0XHRyZXR1cm4gRkFMU0U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gRXhlY3V0ZSBBUEkgY29tbWFuZFxuXHRcdFx0ZWxzZSBpZihhcGlbY29tbWFuZF0pIHtcblx0XHRcdFx0YXBpW2NvbW1hbmRdLmFwcGx5KGFwaSwgYXJncyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gcmV0dXJuZWQgIT09IE5VTEwgPyByZXR1cm5lZCA6IHRoaXM7XG5cdH1cblxuXHQvLyBObyBBUEkgY29tbWFuZHMuIHZhbGlkYXRlIHByb3ZpZGVkIG9wdGlvbnMgYW5kIHNldHVwIHFUaXBzXG5cdGVsc2UgaWYoJ29iamVjdCcgPT09IHR5cGVvZiBvcHRpb25zIHx8ICFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0Ly8gU2FuaXRpemUgb3B0aW9ucyBmaXJzdFxuXHRcdG9wdHMgPSBzYW5pdGl6ZU9wdGlvbnMoJC5leHRlbmQoVFJVRSwge30sIG9wdGlvbnMpKTtcblxuXHRcdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oaSkge1xuXHRcdFx0dmFyIGFwaSwgaWQ7XG5cblx0XHRcdC8vIEZpbmQgbmV4dCBhdmFpbGFibGUgSUQsIG9yIHVzZSBjdXN0b20gSUQgaWYgcHJvdmlkZWRcblx0XHRcdGlkID0gJC5pc0FycmF5KG9wdHMuaWQpID8gb3B0cy5pZFtpXSA6IG9wdHMuaWQ7XG5cdFx0XHRpZCA9ICFpZCB8fCBpZCA9PT0gRkFMU0UgfHwgaWQubGVuZ3RoIDwgMSB8fCBRVElQLmFwaVtpZF0gPyBRVElQLm5leHRpZCsrIDogaWQ7XG5cblx0XHRcdC8vIEluaXRpYWxpemUgdGhlIHFUaXAgYW5kIHJlLWdyYWIgbmV3bHkgc2FuaXRpemVkIG9wdGlvbnNcblx0XHRcdGFwaSA9IGluaXQoJCh0aGlzKSwgaWQsIG9wdHMpO1xuXHRcdFx0aWYoYXBpID09PSBGQUxTRSkgeyByZXR1cm4gVFJVRTsgfVxuXHRcdFx0ZWxzZSB7IFFUSVAuYXBpW2lkXSA9IGFwaTsgfVxuXG5cdFx0XHQvLyBJbml0aWFsaXplIHBsdWdpbnNcblx0XHRcdCQuZWFjaChQTFVHSU5TLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYodGhpcy5pbml0aWFsaXplID09PSAnaW5pdGlhbGl6ZScpIHsgdGhpcyhhcGkpOyB9XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gQXNzaWduIGluaXRpYWwgcHJlLXJlbmRlciBldmVudHNcblx0XHRcdGFwaS5fYXNzaWduSW5pdGlhbEV2ZW50cyhldmVudCk7XG5cdFx0fSk7XG5cdH1cbn07XG5cbi8vIEV4cG9zZSBjbGFzc1xuJC5xdGlwID0gUVRpcDtcblxuLy8gUG9wdWxhdGVkIGluIHJlbmRlciBtZXRob2RcblFUSVAuYXBpID0ge307XG47JC5lYWNoKHtcblx0LyogQWxsb3cgb3RoZXIgcGx1Z2lucyB0byBzdWNjZXNzZnVsbHkgcmV0cmlldmUgdGhlIHRpdGxlIG9mIGFuIGVsZW1lbnQgd2l0aCBhIHFUaXAgYXBwbGllZCAqL1xuXHRhdHRyOiBmdW5jdGlvbihhdHRyLCB2YWwpIHtcblx0XHRpZih0aGlzLmxlbmd0aCkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzWzBdLFxuXHRcdFx0XHR0aXRsZSA9ICd0aXRsZScsXG5cdFx0XHRcdGFwaSA9ICQuZGF0YShzZWxmLCAncXRpcCcpO1xuXG5cdFx0XHRpZihhdHRyID09PSB0aXRsZSAmJiBhcGkgJiYgYXBpLm9wdGlvbnMgJiYgJ29iamVjdCcgPT09IHR5cGVvZiBhcGkgJiYgJ29iamVjdCcgPT09IHR5cGVvZiBhcGkub3B0aW9ucyAmJiBhcGkub3B0aW9ucy5zdXBwcmVzcykge1xuXHRcdFx0XHRpZihhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuXHRcdFx0XHRcdHJldHVybiAkLmF0dHIoc2VsZiwgb2xkdGl0bGUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gSWYgcVRpcCBpcyByZW5kZXJlZCBhbmQgdGl0bGUgd2FzIG9yaWdpbmFsbHkgdXNlZCBhcyBjb250ZW50LCB1cGRhdGUgaXRcblx0XHRcdFx0aWYoYXBpICYmIGFwaS5vcHRpb25zLmNvbnRlbnQuYXR0ciA9PT0gdGl0bGUgJiYgYXBpLmNhY2hlLmF0dHIpIHtcblx0XHRcdFx0XHRhcGkuc2V0KCdjb250ZW50LnRleHQnLCB2YWwpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gVXNlIHRoZSByZWd1bGFyIGF0dHIgbWV0aG9kIHRvIHNldCwgdGhlbiBjYWNoZSB0aGUgcmVzdWx0XG5cdFx0XHRcdHJldHVybiB0aGlzLmF0dHIob2xkdGl0bGUsIHZhbCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuICQuZm5bJ2F0dHInK3JlcGxhY2VTdWZmaXhdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdH0sXG5cblx0LyogQWxsb3cgY2xvbmUgdG8gY29ycmVjdGx5IHJldHJpZXZlIGNhY2hlZCB0aXRsZSBhdHRyaWJ1dGVzICovXG5cdGNsb25lOiBmdW5jdGlvbihrZWVwRGF0YSkge1xuXHRcdC8vIENsb25lIG91ciBlbGVtZW50IHVzaW5nIHRoZSByZWFsIGNsb25lIG1ldGhvZFxuXHRcdHZhciBlbGVtcyA9ICQuZm5bJ2Nsb25lJytyZXBsYWNlU3VmZml4XS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG5cdFx0Ly8gR3JhYiBhbGwgZWxlbWVudHMgd2l0aCBhbiBvbGR0aXRsZSBzZXQsIGFuZCBjaGFuZ2UgaXQgdG8gcmVndWxhciB0aXRsZSBhdHRyaWJ1dGUsIGlmIGtlZXBEYXRhIGlzIGZhbHNlXG5cdFx0aWYoIWtlZXBEYXRhKSB7XG5cdFx0XHRlbGVtcy5maWx0ZXIoJ1snK29sZHRpdGxlKyddJykuYXR0cigndGl0bGUnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuICQuYXR0cih0aGlzLCBvbGR0aXRsZSk7XG5cdFx0XHR9KVxuXHRcdFx0LnJlbW92ZUF0dHIob2xkdGl0bGUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBlbGVtcztcblx0fVxufSwgZnVuY3Rpb24obmFtZSwgZnVuYykge1xuXHRpZighZnVuYyB8fCAkLmZuW25hbWUrcmVwbGFjZVN1ZmZpeF0pIHsgcmV0dXJuIFRSVUU7IH1cblxuXHR2YXIgb2xkID0gJC5mbltuYW1lK3JlcGxhY2VTdWZmaXhdID0gJC5mbltuYW1lXTtcblx0JC5mbltuYW1lXSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgb2xkLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdH07XG59KTtcblxuLyogRmlyZSBvZmYgJ3JlbW92ZXF0aXAnIGhhbmRsZXIgaW4gJC5jbGVhbkRhdGEgaWYgalF1ZXJ5IFVJIG5vdCBwcmVzZW50IChpdCBhbHJlYWR5IGRvZXMgc2ltaWxhcikuXG4gKiBUaGlzIHNuaXBwZXQgaXMgdGFrZW4gZGlyZWN0bHkgZnJvbSBqUXVlcnkgVUkgc291cmNlIGNvZGUgZm91bmQgaGVyZTpcbiAqICAgICBodHRwOi8vY29kZS5qcXVlcnkuY29tL3VpL2pxdWVyeS11aS1naXQuanNcbiAqL1xuaWYoISQudWkpIHtcblx0JFsnY2xlYW5EYXRhJytyZXBsYWNlU3VmZml4XSA9ICQuY2xlYW5EYXRhO1xuXHQkLmNsZWFuRGF0YSA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcblx0XHRmb3IodmFyIGkgPSAwLCBlbGVtOyAoZWxlbSA9ICQoIGVsZW1zW2ldICkpLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZihlbGVtLmF0dHIoQVRUUl9IQVMpKSB7XG5cdFx0XHRcdC8qIGVzbGludC1kaXNhYmxlIG5vLWVtcHR5ICovXG5cdFx0XHRcdHRyeSB7IGVsZW0udHJpZ2dlckhhbmRsZXIoJ3JlbW92ZXF0aXAnKTsgfVxuXHRcdFx0XHRjYXRjaCggZSApIHt9XG5cdFx0XHRcdC8qIGVzbGludC1lbmFibGUgbm8tZW1wdHkgKi9cblx0XHRcdH1cblx0XHR9XG5cdFx0JFsnY2xlYW5EYXRhJytyZXBsYWNlU3VmZml4XS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHR9O1xufVxuOy8vIHFUaXAgdmVyc2lvblxuUVRJUC52ZXJzaW9uID0gJzMuMC4zJztcblxuLy8gQmFzZSBJRCBmb3IgYWxsIHFUaXBzXG5RVElQLm5leHRpZCA9IDA7XG5cbi8vIEluYWN0aXZlIGV2ZW50cyBhcnJheVxuUVRJUC5pbmFjdGl2ZUV2ZW50cyA9IElOQUNUSVZFX0VWRU5UUztcblxuLy8gQmFzZSB6LWluZGV4IGZvciBhbGwgcVRpcHNcblFUSVAuemluZGV4ID0gMTUwMDA7XG5cbi8vIERlZmluZSBjb25maWd1cmF0aW9uIGRlZmF1bHRzXG5RVElQLmRlZmF1bHRzID0ge1xuXHRwcmVyZW5kZXI6IEZBTFNFLFxuXHRpZDogRkFMU0UsXG5cdG92ZXJ3cml0ZTogVFJVRSxcblx0c3VwcHJlc3M6IFRSVUUsXG5cdGNvbnRlbnQ6IHtcblx0XHR0ZXh0OiBUUlVFLFxuXHRcdGF0dHI6ICd0aXRsZScsXG5cdFx0dGl0bGU6IEZBTFNFLFxuXHRcdGJ1dHRvbjogRkFMU0Vcblx0fSxcblx0cG9zaXRpb246IHtcblx0XHRteTogJ3RvcCBsZWZ0Jyxcblx0XHRhdDogJ2JvdHRvbSByaWdodCcsXG5cdFx0dGFyZ2V0OiBGQUxTRSxcblx0XHRjb250YWluZXI6IEZBTFNFLFxuXHRcdHZpZXdwb3J0OiBGQUxTRSxcblx0XHRhZGp1c3Q6IHtcblx0XHRcdHg6IDAsIHk6IDAsXG5cdFx0XHRtb3VzZTogVFJVRSxcblx0XHRcdHNjcm9sbDogVFJVRSxcblx0XHRcdHJlc2l6ZTogVFJVRSxcblx0XHRcdG1ldGhvZDogJ2ZsaXBpbnZlcnQgZmxpcGludmVydCdcblx0XHR9LFxuXHRcdGVmZmVjdDogZnVuY3Rpb24oYXBpLCBwb3MpIHtcblx0XHRcdCQodGhpcykuYW5pbWF0ZShwb3MsIHtcblx0XHRcdFx0ZHVyYXRpb246IDIwMCxcblx0XHRcdFx0cXVldWU6IEZBTFNFXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cdHNob3c6IHtcblx0XHR0YXJnZXQ6IEZBTFNFLFxuXHRcdGV2ZW50OiAnbW91c2VlbnRlcicsXG5cdFx0ZWZmZWN0OiBUUlVFLFxuXHRcdGRlbGF5OiA5MCxcblx0XHRzb2xvOiBGQUxTRSxcblx0XHRyZWFkeTogRkFMU0UsXG5cdFx0YXV0b2ZvY3VzOiBGQUxTRVxuXHR9LFxuXHRoaWRlOiB7XG5cdFx0dGFyZ2V0OiBGQUxTRSxcblx0XHRldmVudDogJ21vdXNlbGVhdmUnLFxuXHRcdGVmZmVjdDogVFJVRSxcblx0XHRkZWxheTogMCxcblx0XHRmaXhlZDogRkFMU0UsXG5cdFx0aW5hY3RpdmU6IEZBTFNFLFxuXHRcdGxlYXZlOiAnd2luZG93Jyxcblx0XHRkaXN0YW5jZTogRkFMU0Vcblx0fSxcblx0c3R5bGU6IHtcblx0XHRjbGFzc2VzOiAnJyxcblx0XHR3aWRnZXQ6IEZBTFNFLFxuXHRcdHdpZHRoOiBGQUxTRSxcblx0XHRoZWlnaHQ6IEZBTFNFLFxuXHRcdGRlZjogVFJVRVxuXHR9LFxuXHRldmVudHM6IHtcblx0XHRyZW5kZXI6IE5VTEwsXG5cdFx0bW92ZTogTlVMTCxcblx0XHRzaG93OiBOVUxMLFxuXHRcdGhpZGU6IE5VTEwsXG5cdFx0dG9nZ2xlOiBOVUxMLFxuXHRcdHZpc2libGU6IE5VTEwsXG5cdFx0aGlkZGVuOiBOVUxMLFxuXHRcdGZvY3VzOiBOVUxMLFxuXHRcdGJsdXI6IE5VTExcblx0fVxufTtcbjt2YXIgVElQLFxuY3JlYXRlVk1MLFxuU0NBTEUsXG5QSVhFTF9SQVRJTyxcbkJBQ0tJTkdfU1RPUkVfUkFUSU8sXG5cbi8vIENvbW1vbiBDU1Mgc3RyaW5nc1xuTUFSR0lOID0gJ21hcmdpbicsXG5CT1JERVIgPSAnYm9yZGVyJyxcbkNPTE9SID0gJ2NvbG9yJyxcbkJHX0NPTE9SID0gJ2JhY2tncm91bmQtY29sb3InLFxuVFJBTlNQQVJFTlQgPSAndHJhbnNwYXJlbnQnLFxuSU1QT1JUQU5UID0gJyAhaW1wb3J0YW50JyxcblxuLy8gQ2hlY2sgaWYgdGhlIGJyb3dzZXIgc3VwcG9ydHMgPGNhbnZhcy8+IGVsZW1lbnRzXG5IQVNDQU5WQVMgPSAhIWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLmdldENvbnRleHQsXG5cbi8vIEludmFsaWQgY29sb3VyIHZhbHVlcyB1c2VkIGluIHBhcnNlQ29sb3VycygpXG5JTlZBTElEID0gL3JnYmE/XFwoMCwgMCwgMCgsIDApP1xcKXx0cmFuc3BhcmVudHwjMTIzNDU2L2k7XG5cbi8vIENhbWVsLWNhc2UgbWV0aG9kLCB0YWtlbiBmcm9tIGpRdWVyeSBzb3VyY2Vcbi8vIGh0dHA6Ly9jb2RlLmpxdWVyeS5jb20vanF1ZXJ5LTEuOC4wLmpzXG5mdW5jdGlvbiBjYW1lbChzKSB7IHJldHVybiBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zbGljZSgxKTsgfVxuXG4vKlxuICogTW9kaWZpZWQgZnJvbSBNb2Rlcm5penIncyB0ZXN0UHJvcHNBbGwoKVxuICogaHR0cDovL21vZGVybml6ci5jb20vZG93bmxvYWRzL21vZGVybml6ci1sYXRlc3QuanNcbiAqL1xudmFyIGNzc1Byb3BzID0ge30sIGNzc1ByZWZpeGVzID0gWydXZWJraXQnLCAnTycsICdNb3onLCAnbXMnXTtcbmZ1bmN0aW9uIHZlbmRvckNzcyhlbGVtLCBwcm9wKSB7XG5cdHZhciB1Y1Byb3AgPSBwcm9wLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zbGljZSgxKSxcblx0XHRwcm9wcyA9IChwcm9wICsgJyAnICsgY3NzUHJlZml4ZXMuam9pbih1Y1Byb3AgKyAnICcpICsgdWNQcm9wKS5zcGxpdCgnICcpLFxuXHRcdGN1ciwgdmFsLCBpID0gMDtcblxuXHQvLyBJZiB0aGUgcHJvcGVydHkgaGFzIGFscmVhZHkgYmVlbiBtYXBwZWQuLi5cblx0aWYoY3NzUHJvcHNbcHJvcF0pIHsgcmV0dXJuIGVsZW0uY3NzKGNzc1Byb3BzW3Byb3BdKTsgfVxuXG5cdHdoaWxlKGN1ciA9IHByb3BzW2krK10pIHtcblx0XHRpZigodmFsID0gZWxlbS5jc3MoY3VyKSkgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y3NzUHJvcHNbcHJvcF0gPSBjdXI7XG5cdFx0XHRyZXR1cm4gdmFsO1xuXHRcdH1cblx0fVxufVxuXG4vLyBQYXJzZSBhIGdpdmVuIGVsZW1lbnRzIENTUyBwcm9wZXJ0eSBpbnRvIGFuIGludFxuZnVuY3Rpb24gaW50Q3NzKGVsZW0sIHByb3ApIHtcblx0cmV0dXJuIE1hdGguY2VpbChwYXJzZUZsb2F0KHZlbmRvckNzcyhlbGVtLCBwcm9wKSkpO1xufVxuXG5cbi8vIFZNTCBjcmVhdGlvbiAoZm9yIElFIG9ubHkpXG5pZighSEFTQ0FOVkFTKSB7XG5cdGNyZWF0ZVZNTCA9IGZ1bmN0aW9uKHRhZywgcHJvcHMsIHN0eWxlKSB7XG5cdFx0cmV0dXJuICc8cXRpcHZtbDonK3RhZysnIHhtbG5zPVwidXJuOnNjaGVtYXMtbWljcm9zb2Z0LmNvbTp2bWxcIiBjbGFzcz1cInF0aXAtdm1sXCIgJysocHJvcHN8fCcnKStcblx0XHRcdCcgc3R5bGU9XCJiZWhhdmlvcjogdXJsKCNkZWZhdWx0I1ZNTCk7ICcrKHN0eWxlfHwnJykrICdcIiAvPic7XG5cdH07XG59XG5cbi8vIENhbnZhcyBvbmx5IGRlZmluaXRpb25zXG5lbHNlIHtcblx0UElYRUxfUkFUSU8gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxO1xuXHRCQUNLSU5HX1NUT1JFX1JBVElPID0gKGZ1bmN0aW9uKCkge1xuXHRcdHZhciBjb250ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykuZ2V0Q29udGV4dCgnMmQnKTtcblx0XHRyZXR1cm4gY29udGV4dC5iYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IGNvbnRleHQud2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCBjb250ZXh0Lm1vekJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcblx0XHRcdFx0Y29udGV4dC5tc0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgY29udGV4dC5vQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCAxO1xuXHR9KSgpO1xuXHRTQ0FMRSA9IFBJWEVMX1JBVElPIC8gQkFDS0lOR19TVE9SRV9SQVRJTztcbn1cblxuXG5mdW5jdGlvbiBUaXAocXRpcCwgb3B0aW9ucykge1xuXHR0aGlzLl9ucyA9ICd0aXAnO1xuXHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXHR0aGlzLm9mZnNldCA9IG9wdGlvbnMub2Zmc2V0O1xuXHR0aGlzLnNpemUgPSBbIG9wdGlvbnMud2lkdGgsIG9wdGlvbnMuaGVpZ2h0IF07XG5cblx0Ly8gSW5pdGlhbGl6ZVxuXHR0aGlzLnF0aXAgPSBxdGlwO1xuXHR0aGlzLmluaXQocXRpcCk7XG59XG5cbiQuZXh0ZW5kKFRpcC5wcm90b3R5cGUsIHtcblx0aW5pdDogZnVuY3Rpb24ocXRpcCkge1xuXHRcdHZhciBjb250ZXh0LCB0aXA7XG5cblx0XHQvLyBDcmVhdGUgdGlwIGVsZW1lbnQgYW5kIHByZXBlbmQgdG8gdGhlIHRvb2x0aXBcblx0XHR0aXAgPSB0aGlzLmVsZW1lbnQgPSBxdGlwLmVsZW1lbnRzLnRpcCA9ICQoJzxkaXYgLz4nLCB7ICdjbGFzcyc6IE5BTUVTUEFDRSsnLXRpcCcgfSkucHJlcGVuZFRvKHF0aXAudG9vbHRpcCk7XG5cblx0XHQvLyBDcmVhdGUgdGlwIGRyYXdpbmcgZWxlbWVudChzKVxuXHRcdGlmKEhBU0NBTlZBUykge1xuXHRcdFx0Ly8gc2F2ZSgpIGFzIHNvb24gYXMgd2UgY3JlYXRlIHRoZSBjYW52YXMgZWxlbWVudCBzbyBGRjIgZG9lc24ndCBib3JrIG9uIG91ciBmaXJzdCByZXN0b3JlKCkhXG5cdFx0XHRjb250ZXh0ID0gJCgnPGNhbnZhcyAvPicpLmFwcGVuZFRvKHRoaXMuZWxlbWVudClbMF0uZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRcdFx0Ly8gU2V0dXAgY29uc3RhbnQgcGFyYW1ldGVyc1xuXHRcdFx0Y29udGV4dC5saW5lSm9pbiA9ICdtaXRlcic7XG5cdFx0XHRjb250ZXh0Lm1pdGVyTGltaXQgPSAxMDAwMDA7XG5cdFx0XHRjb250ZXh0LnNhdmUoKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRjb250ZXh0ID0gY3JlYXRlVk1MKCdzaGFwZScsICdjb29yZG9yaWdpbj1cIjAsMFwiJywgJ3Bvc2l0aW9uOmFic29sdXRlOycpO1xuXHRcdFx0dGhpcy5lbGVtZW50Lmh0bWwoY29udGV4dCArIGNvbnRleHQpO1xuXG5cdFx0XHQvLyBQcmV2ZW50IG1vdXNpbmcgZG93biBvbiB0aGUgdGlwIHNpbmNlIGl0IGNhdXNlcyBwcm9ibGVtcyB3aXRoIC5saXZlKCkgaGFuZGxpbmcgaW4gSUUgZHVlIHRvIFZNTFxuXHRcdFx0cXRpcC5fYmluZCggJCgnKicsIHRpcCkuYWRkKHRpcCksIFsnY2xpY2snLCAnbW91c2Vkb3duJ10sIGZ1bmN0aW9uKGV2ZW50KSB7IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyB9LCB0aGlzLl9ucyk7XG5cdFx0fVxuXG5cdFx0Ly8gQmluZCB1cGRhdGUgZXZlbnRzXG5cdFx0cXRpcC5fYmluZChxdGlwLnRvb2x0aXAsICd0b29sdGlwbW92ZScsIHRoaXMucmVwb3NpdGlvbiwgdGhpcy5fbnMsIHRoaXMpO1xuXG5cdFx0Ly8gQ3JlYXRlIGl0XG5cdFx0dGhpcy5jcmVhdGUoKTtcblx0fSxcblxuXHRfc3dhcERpbWVuc2lvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2l6ZVswXSA9IHRoaXMub3B0aW9ucy5oZWlnaHQ7XG5cdFx0dGhpcy5zaXplWzFdID0gdGhpcy5vcHRpb25zLndpZHRoO1xuXHR9LFxuXHRfcmVzZXREaW1lbnNpb25zOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNpemVbMF0gPSB0aGlzLm9wdGlvbnMud2lkdGg7XG5cdFx0dGhpcy5zaXplWzFdID0gdGhpcy5vcHRpb25zLmhlaWdodDtcblx0fSxcblxuXHRfdXNlVGl0bGU6IGZ1bmN0aW9uKGNvcm5lcikge1xuXHRcdHZhciB0aXRsZWJhciA9IHRoaXMucXRpcC5lbGVtZW50cy50aXRsZWJhcjtcblx0XHRyZXR1cm4gdGl0bGViYXIgJiYgKFxuXHRcdFx0Y29ybmVyLnkgPT09IFRPUCB8fCBjb3JuZXIueSA9PT0gQ0VOVEVSICYmIHRoaXMuZWxlbWVudC5wb3NpdGlvbigpLnRvcCArIHRoaXMuc2l6ZVsxXSAvIDIgKyB0aGlzLm9wdGlvbnMub2Zmc2V0IDwgdGl0bGViYXIub3V0ZXJIZWlnaHQoVFJVRSlcblx0XHQpO1xuXHR9LFxuXG5cdF9wYXJzZUNvcm5lcjogZnVuY3Rpb24oY29ybmVyKSB7XG5cdFx0dmFyIG15ID0gdGhpcy5xdGlwLm9wdGlvbnMucG9zaXRpb24ubXk7XG5cblx0XHQvLyBEZXRlY3QgY29ybmVyIGFuZCBtaW1pYyBwcm9wZXJ0aWVzXG5cdFx0aWYoY29ybmVyID09PSBGQUxTRSB8fCBteSA9PT0gRkFMU0UpIHtcblx0XHRcdGNvcm5lciA9IEZBTFNFO1xuXHRcdH1cblx0XHRlbHNlIGlmKGNvcm5lciA9PT0gVFJVRSkge1xuXHRcdFx0Y29ybmVyID0gbmV3IENPUk5FUiggbXkuc3RyaW5nKCkgKTtcblx0XHR9XG5cdFx0ZWxzZSBpZighY29ybmVyLnN0cmluZykge1xuXHRcdFx0Y29ybmVyID0gbmV3IENPUk5FUihjb3JuZXIpO1xuXHRcdFx0Y29ybmVyLmZpeGVkID0gVFJVRTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY29ybmVyO1xuXHR9LFxuXG5cdF9wYXJzZVdpZHRoOiBmdW5jdGlvbihjb3JuZXIsIHNpZGUsIHVzZSkge1xuXHRcdHZhciBlbGVtZW50cyA9IHRoaXMucXRpcC5lbGVtZW50cyxcblx0XHRcdHByb3AgPSBCT1JERVIgKyBjYW1lbChzaWRlKSArICdXaWR0aCc7XG5cblx0XHRyZXR1cm4gKHVzZSA/IGludENzcyh1c2UsIHByb3ApIDogXG5cdFx0XHRpbnRDc3MoZWxlbWVudHMuY29udGVudCwgcHJvcCkgfHxcblx0XHRcdGludENzcyh0aGlzLl91c2VUaXRsZShjb3JuZXIpICYmIGVsZW1lbnRzLnRpdGxlYmFyIHx8IGVsZW1lbnRzLmNvbnRlbnQsIHByb3ApIHx8XG5cdFx0XHRpbnRDc3MoZWxlbWVudHMudG9vbHRpcCwgcHJvcClcblx0XHQpIHx8IDA7XG5cdH0sXG5cblx0X3BhcnNlUmFkaXVzOiBmdW5jdGlvbihjb3JuZXIpIHtcblx0XHR2YXIgZWxlbWVudHMgPSB0aGlzLnF0aXAuZWxlbWVudHMsXG5cdFx0XHRwcm9wID0gQk9SREVSICsgY2FtZWwoY29ybmVyLnkpICsgY2FtZWwoY29ybmVyLngpICsgJ1JhZGl1cyc7XG5cblx0XHRyZXR1cm4gQlJPV1NFUi5pZSA8IDkgPyAwIDpcblx0XHRcdGludENzcyh0aGlzLl91c2VUaXRsZShjb3JuZXIpICYmIGVsZW1lbnRzLnRpdGxlYmFyIHx8IGVsZW1lbnRzLmNvbnRlbnQsIHByb3ApIHx8XG5cdFx0XHRpbnRDc3MoZWxlbWVudHMudG9vbHRpcCwgcHJvcCkgfHwgMDtcblx0fSxcblxuXHRfaW52YWxpZENvbG91cjogZnVuY3Rpb24oZWxlbSwgcHJvcCwgY29tcGFyZSkge1xuXHRcdHZhciB2YWwgPSBlbGVtLmNzcyhwcm9wKTtcblx0XHRyZXR1cm4gIXZhbCB8fCBjb21wYXJlICYmIHZhbCA9PT0gZWxlbS5jc3MoY29tcGFyZSkgfHwgSU5WQUxJRC50ZXN0KHZhbCkgPyBGQUxTRSA6IHZhbDtcblx0fSxcblxuXHRfcGFyc2VDb2xvdXJzOiBmdW5jdGlvbihjb3JuZXIpIHtcblx0XHR2YXIgZWxlbWVudHMgPSB0aGlzLnF0aXAuZWxlbWVudHMsXG5cdFx0XHR0aXAgPSB0aGlzLmVsZW1lbnQuY3NzKCdjc3NUZXh0JywgJycpLFxuXHRcdFx0Ym9yZGVyU2lkZSA9IEJPUkRFUiArIGNhbWVsKGNvcm5lclsgY29ybmVyLnByZWNlZGFuY2UgXSkgKyBjYW1lbChDT0xPUiksXG5cdFx0XHRjb2xvckVsZW0gPSB0aGlzLl91c2VUaXRsZShjb3JuZXIpICYmIGVsZW1lbnRzLnRpdGxlYmFyIHx8IGVsZW1lbnRzLmNvbnRlbnQsXG5cdFx0XHRjc3MgPSB0aGlzLl9pbnZhbGlkQ29sb3VyLCBjb2xvciA9IFtdO1xuXG5cdFx0Ly8gQXR0ZW1wdCB0byBkZXRlY3QgdGhlIGJhY2tncm91bmQgY29sb3VyIGZyb20gdmFyaW91cyBlbGVtZW50cywgbGVmdC10by1yaWdodCBwcmVjZWRhbmNlXG5cdFx0Y29sb3JbMF0gPSBjc3ModGlwLCBCR19DT0xPUikgfHwgY3NzKGNvbG9yRWxlbSwgQkdfQ09MT1IpIHx8IGNzcyhlbGVtZW50cy5jb250ZW50LCBCR19DT0xPUikgfHxcblx0XHRcdGNzcyhlbGVtZW50cy50b29sdGlwLCBCR19DT0xPUikgfHwgdGlwLmNzcyhCR19DT0xPUik7XG5cblx0XHQvLyBBdHRlbXB0IHRvIGRldGVjdCB0aGUgY29ycmVjdCBib3JkZXIgc2lkZSBjb2xvdXIgZnJvbSB2YXJpb3VzIGVsZW1lbnRzLCBsZWZ0LXRvLXJpZ2h0IHByZWNlZGFuY2Vcblx0XHRjb2xvclsxXSA9IGNzcyh0aXAsIGJvcmRlclNpZGUsIENPTE9SKSB8fCBjc3MoY29sb3JFbGVtLCBib3JkZXJTaWRlLCBDT0xPUikgfHxcblx0XHRcdGNzcyhlbGVtZW50cy5jb250ZW50LCBib3JkZXJTaWRlLCBDT0xPUikgfHwgY3NzKGVsZW1lbnRzLnRvb2x0aXAsIGJvcmRlclNpZGUsIENPTE9SKSB8fCBlbGVtZW50cy50b29sdGlwLmNzcyhib3JkZXJTaWRlKTtcblxuXHRcdC8vIFJlc2V0IGJhY2tncm91bmQgYW5kIGJvcmRlciBjb2xvdXJzXG5cdFx0JCgnKicsIHRpcCkuYWRkKHRpcCkuY3NzKCdjc3NUZXh0JywgQkdfQ09MT1IrJzonK1RSQU5TUEFSRU5UK0lNUE9SVEFOVCsnOycrQk9SREVSKyc6MCcrSU1QT1JUQU5UKyc7Jyk7XG5cblx0XHRyZXR1cm4gY29sb3I7XG5cdH0sXG5cblx0X2NhbGN1bGF0ZVNpemU6IGZ1bmN0aW9uKGNvcm5lcikge1xuXHRcdHZhciB5ID0gY29ybmVyLnByZWNlZGFuY2UgPT09IFksXG5cdFx0XHR3aWR0aCA9IHRoaXMub3B0aW9ucy53aWR0aCxcblx0XHRcdGhlaWdodCA9IHRoaXMub3B0aW9ucy5oZWlnaHQsXG5cdFx0XHRpc0NlbnRlciA9IGNvcm5lci5hYmJyZXYoKSA9PT0gJ2MnLFxuXHRcdFx0YmFzZSA9ICh5ID8gd2lkdGg6IGhlaWdodCkgKiAoaXNDZW50ZXIgPyAwLjUgOiAxKSxcblx0XHRcdHBvdyA9IE1hdGgucG93LFxuXHRcdFx0cm91bmQgPSBNYXRoLnJvdW5kLFxuXHRcdFx0YmlnSHlwLCByYXRpbywgcmVzdWx0LFxuXG5cdFx0c21hbGxIeXAgPSBNYXRoLnNxcnQoIHBvdyhiYXNlLCAyKSArIHBvdyhoZWlnaHQsIDIpICksXG5cdFx0aHlwID0gW1xuXHRcdFx0dGhpcy5ib3JkZXIgLyBiYXNlICogc21hbGxIeXAsXG5cdFx0XHR0aGlzLmJvcmRlciAvIGhlaWdodCAqIHNtYWxsSHlwXG5cdFx0XTtcblxuXHRcdGh5cFsyXSA9IE1hdGguc3FydCggcG93KGh5cFswXSwgMikgLSBwb3codGhpcy5ib3JkZXIsIDIpICk7XG5cdFx0aHlwWzNdID0gTWF0aC5zcXJ0KCBwb3coaHlwWzFdLCAyKSAtIHBvdyh0aGlzLmJvcmRlciwgMikgKTtcblxuXHRcdGJpZ0h5cCA9IHNtYWxsSHlwICsgaHlwWzJdICsgaHlwWzNdICsgKGlzQ2VudGVyID8gMCA6IGh5cFswXSk7XG5cdFx0cmF0aW8gPSBiaWdIeXAgLyBzbWFsbEh5cDtcblxuXHRcdHJlc3VsdCA9IFsgcm91bmQocmF0aW8gKiB3aWR0aCksIHJvdW5kKHJhdGlvICogaGVpZ2h0KSBdO1xuXHRcdHJldHVybiB5ID8gcmVzdWx0IDogcmVzdWx0LnJldmVyc2UoKTtcblx0fSxcblxuXHQvLyBUaXAgY29vcmRpbmF0ZXMgY2FsY3VsYXRvclxuXHRfY2FsY3VsYXRlVGlwOiBmdW5jdGlvbihjb3JuZXIsIHNpemUsIHNjYWxlKSB7XG5cdFx0c2NhbGUgPSBzY2FsZSB8fCAxO1xuXHRcdHNpemUgPSBzaXplIHx8IHRoaXMuc2l6ZTtcblxuXHRcdHZhciB3aWR0aCA9IHNpemVbMF0gKiBzY2FsZSxcblx0XHRcdGhlaWdodCA9IHNpemVbMV0gKiBzY2FsZSxcblx0XHRcdHdpZHRoMiA9IE1hdGguY2VpbCh3aWR0aCAvIDIpLCBoZWlnaHQyID0gTWF0aC5jZWlsKGhlaWdodCAvIDIpLFxuXG5cdFx0Ly8gRGVmaW5lIHRpcCBjb29yZGluYXRlcyBpbiB0ZXJtcyBvZiBoZWlnaHQgYW5kIHdpZHRoIHZhbHVlc1xuXHRcdHRpcHMgPSB7XG5cdFx0XHRicjpcdFswLDAsXHRcdHdpZHRoLGhlaWdodCxcdHdpZHRoLDBdLFxuXHRcdFx0Ymw6XHRbMCwwLFx0XHR3aWR0aCwwLFx0XHQwLGhlaWdodF0sXG5cdFx0XHR0cjpcdFswLGhlaWdodCxcdHdpZHRoLDAsXHRcdHdpZHRoLGhlaWdodF0sXG5cdFx0XHR0bDpcdFswLDAsXHRcdDAsaGVpZ2h0LFx0XHR3aWR0aCxoZWlnaHRdLFxuXHRcdFx0dGM6XHRbMCxoZWlnaHQsXHR3aWR0aDIsMCxcdFx0d2lkdGgsaGVpZ2h0XSxcblx0XHRcdGJjOlx0WzAsMCxcdFx0d2lkdGgsMCxcdFx0d2lkdGgyLGhlaWdodF0sXG5cdFx0XHRyYzpcdFswLDAsXHRcdHdpZHRoLGhlaWdodDIsXHQwLGhlaWdodF0sXG5cdFx0XHRsYzpcdFt3aWR0aCwwLFx0d2lkdGgsaGVpZ2h0LFx0MCxoZWlnaHQyXVxuXHRcdH07XG5cblx0XHQvLyBTZXQgY29tbW9uIHNpZGUgc2hhcGVzXG5cdFx0dGlwcy5sdCA9IHRpcHMuYnI7IHRpcHMucnQgPSB0aXBzLmJsO1xuXHRcdHRpcHMubGIgPSB0aXBzLnRyOyB0aXBzLnJiID0gdGlwcy50bDtcblxuXHRcdHJldHVybiB0aXBzWyBjb3JuZXIuYWJicmV2KCkgXTtcblx0fSxcblxuXHQvLyBUaXAgY29vcmRpbmF0ZXMgZHJhd2VyIChjYW52YXMpXG5cdF9kcmF3Q29vcmRzOiBmdW5jdGlvbihjb250ZXh0LCBjb29yZHMpIHtcblx0XHRjb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdGNvbnRleHQubW92ZVRvKGNvb3Jkc1swXSwgY29vcmRzWzFdKTtcblx0XHRjb250ZXh0LmxpbmVUbyhjb29yZHNbMl0sIGNvb3Jkc1szXSk7XG5cdFx0Y29udGV4dC5saW5lVG8oY29vcmRzWzRdLCBjb29yZHNbNV0pO1xuXHRcdGNvbnRleHQuY2xvc2VQYXRoKCk7XG5cdH0sXG5cblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblx0XHQvLyBEZXRlcm1pbmUgdGlwIGNvcm5lclxuXHRcdHZhciBjID0gdGhpcy5jb3JuZXIgPSAoSEFTQ0FOVkFTIHx8IEJST1dTRVIuaWUpICYmIHRoaXMuX3BhcnNlQ29ybmVyKHRoaXMub3B0aW9ucy5jb3JuZXIpO1xuXG5cdFx0Ly8gSWYgd2UgaGF2ZSBhIHRpcCBjb3JuZXIuLi5cblx0XHR0aGlzLmVuYWJsZWQgPSAhIXRoaXMuY29ybmVyICYmIHRoaXMuY29ybmVyLmFiYnJldigpICE9PSAnYyc7XG5cdFx0aWYodGhpcy5lbmFibGVkKSB7XG5cdFx0XHQvLyBDYWNoZSBpdFxuXHRcdFx0dGhpcy5xdGlwLmNhY2hlLmNvcm5lciA9IGMuY2xvbmUoKTtcblxuXHRcdFx0Ly8gQ3JlYXRlIGl0XG5cdFx0XHR0aGlzLnVwZGF0ZSgpO1xuXHRcdH1cblxuXHRcdC8vIFRvZ2dsZSB0aXAgZWxlbWVudFxuXHRcdHRoaXMuZWxlbWVudC50b2dnbGUodGhpcy5lbmFibGVkKTtcblxuXHRcdHJldHVybiB0aGlzLmNvcm5lcjtcblx0fSxcblxuXHR1cGRhdGU6IGZ1bmN0aW9uKGNvcm5lciwgcG9zaXRpb24pIHtcblx0XHRpZighdGhpcy5lbmFibGVkKSB7IHJldHVybiB0aGlzOyB9XG5cblx0XHR2YXIgZWxlbWVudHMgPSB0aGlzLnF0aXAuZWxlbWVudHMsXG5cdFx0XHR0aXAgPSB0aGlzLmVsZW1lbnQsXG5cdFx0XHRpbm5lciA9IHRpcC5jaGlsZHJlbigpLFxuXHRcdFx0b3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcblx0XHRcdGN1clNpemUgPSB0aGlzLnNpemUsXG5cdFx0XHRtaW1pYyA9IG9wdGlvbnMubWltaWMsXG5cdFx0XHRyb3VuZCA9IE1hdGgucm91bmQsXG5cdFx0XHRjb2xvciwgcHJlY2VkYW5jZSwgY29udGV4dCxcblx0XHRcdGNvb3JkcywgYmlnQ29vcmRzLCB0cmFuc2xhdGUsIG5ld1NpemUsIGJvcmRlcjtcblxuXHRcdC8vIFJlLWRldGVybWluZSB0aXAgaWYgbm90IGFscmVhZHkgc2V0XG5cdFx0aWYoIWNvcm5lcikgeyBjb3JuZXIgPSB0aGlzLnF0aXAuY2FjaGUuY29ybmVyIHx8IHRoaXMuY29ybmVyOyB9XG5cblx0XHQvLyBVc2UgY29ybmVyIHByb3BlcnR5IGlmIHdlIGRldGVjdCBhbiBpbnZhbGlkIG1pbWljIHZhbHVlXG5cdFx0aWYobWltaWMgPT09IEZBTFNFKSB7IG1pbWljID0gY29ybmVyOyB9XG5cblx0XHQvLyBPdGhlcndpc2UgaW5oZXJpdCBtaW1pYyBwcm9wZXJ0aWVzIGZyb20gdGhlIGNvcm5lciBvYmplY3QgYXMgbmVjZXNzYXJ5XG5cdFx0ZWxzZSB7XG5cdFx0XHRtaW1pYyA9IG5ldyBDT1JORVIobWltaWMpO1xuXHRcdFx0bWltaWMucHJlY2VkYW5jZSA9IGNvcm5lci5wcmVjZWRhbmNlO1xuXG5cdFx0XHRpZihtaW1pYy54ID09PSAnaW5oZXJpdCcpIHsgbWltaWMueCA9IGNvcm5lci54OyB9XG5cdFx0XHRlbHNlIGlmKG1pbWljLnkgPT09ICdpbmhlcml0JykgeyBtaW1pYy55ID0gY29ybmVyLnk7IH1cblx0XHRcdGVsc2UgaWYobWltaWMueCA9PT0gbWltaWMueSkge1xuXHRcdFx0XHRtaW1pY1sgY29ybmVyLnByZWNlZGFuY2UgXSA9IGNvcm5lclsgY29ybmVyLnByZWNlZGFuY2UgXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cHJlY2VkYW5jZSA9IG1pbWljLnByZWNlZGFuY2U7XG5cblx0XHQvLyBFbnN1cmUgdGhlIHRpcCB3aWR0aC5oZWlnaHQgYXJlIHJlbGF0aXZlIHRvIHRoZSB0aXAgcG9zaXRpb25cblx0XHRpZihjb3JuZXIucHJlY2VkYW5jZSA9PT0gWCkgeyB0aGlzLl9zd2FwRGltZW5zaW9ucygpOyB9XG5cdFx0ZWxzZSB7IHRoaXMuX3Jlc2V0RGltZW5zaW9ucygpOyB9XG5cblx0XHQvLyBVcGRhdGUgb3VyIGNvbG91cnNcblx0XHRjb2xvciA9IHRoaXMuY29sb3IgPSB0aGlzLl9wYXJzZUNvbG91cnMoY29ybmVyKTtcblxuXHRcdC8vIERldGVjdCBib3JkZXIgd2lkdGgsIHRha2luZyBpbnRvIGFjY291bnQgY29sb3Vyc1xuXHRcdGlmKGNvbG9yWzFdICE9PSBUUkFOU1BBUkVOVCkge1xuXHRcdFx0Ly8gR3JhYiBib3JkZXIgd2lkdGhcblx0XHRcdGJvcmRlciA9IHRoaXMuYm9yZGVyID0gdGhpcy5fcGFyc2VXaWR0aChjb3JuZXIsIGNvcm5lcltjb3JuZXIucHJlY2VkYW5jZV0pO1xuXG5cdFx0XHQvLyBJZiBib3JkZXIgd2lkdGggaXNuJ3QgemVybywgdXNlIGJvcmRlciBjb2xvciBhcyBmaWxsIGlmIGl0J3Mgbm90IGludmFsaWQgKDEuMCBzdHlsZSB0aXBzKVxuXHRcdFx0aWYob3B0aW9ucy5ib3JkZXIgJiYgYm9yZGVyIDwgMSAmJiAhSU5WQUxJRC50ZXN0KGNvbG9yWzFdKSkgeyBjb2xvclswXSA9IGNvbG9yWzFdOyB9XG5cblx0XHRcdC8vIFNldCBib3JkZXIgd2lkdGggKHVzZSBkZXRlY3RlZCBib3JkZXIgd2lkdGggaWYgb3B0aW9ucy5ib3JkZXIgaXMgdHJ1ZSlcblx0XHRcdHRoaXMuYm9yZGVyID0gYm9yZGVyID0gb3B0aW9ucy5ib3JkZXIgIT09IFRSVUUgPyBvcHRpb25zLmJvcmRlciA6IGJvcmRlcjtcblx0XHR9XG5cblx0XHQvLyBCb3JkZXIgY29sb3VyIHdhcyBpbnZhbGlkLCBzZXQgYm9yZGVyIHRvIHplcm9cblx0XHRlbHNlIHsgdGhpcy5ib3JkZXIgPSBib3JkZXIgPSAwOyB9XG5cblx0XHQvLyBEZXRlcm1pbmUgdGlwIHNpemVcblx0XHRuZXdTaXplID0gdGhpcy5zaXplID0gdGhpcy5fY2FsY3VsYXRlU2l6ZShjb3JuZXIpO1xuXHRcdHRpcC5jc3Moe1xuXHRcdFx0d2lkdGg6IG5ld1NpemVbMF0sXG5cdFx0XHRoZWlnaHQ6IG5ld1NpemVbMV0sXG5cdFx0XHRsaW5lSGVpZ2h0OiBuZXdTaXplWzFdKydweCdcblx0XHR9KTtcblxuXHRcdC8vIENhbGN1bGF0ZSB0aXAgdHJhbnNsYXRpb25cblx0XHRpZihjb3JuZXIucHJlY2VkYW5jZSA9PT0gWSkge1xuXHRcdFx0dHJhbnNsYXRlID0gW1xuXHRcdFx0XHRyb3VuZChtaW1pYy54ID09PSBMRUZUID8gYm9yZGVyIDogbWltaWMueCA9PT0gUklHSFQgPyBuZXdTaXplWzBdIC0gY3VyU2l6ZVswXSAtIGJvcmRlciA6IChuZXdTaXplWzBdIC0gY3VyU2l6ZVswXSkgLyAyKSxcblx0XHRcdFx0cm91bmQobWltaWMueSA9PT0gVE9QID8gbmV3U2l6ZVsxXSAtIGN1clNpemVbMV0gOiAwKVxuXHRcdFx0XTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0cmFuc2xhdGUgPSBbXG5cdFx0XHRcdHJvdW5kKG1pbWljLnggPT09IExFRlQgPyBuZXdTaXplWzBdIC0gY3VyU2l6ZVswXSA6IDApLFxuXHRcdFx0XHRyb3VuZChtaW1pYy55ID09PSBUT1AgPyBib3JkZXIgOiBtaW1pYy55ID09PSBCT1RUT00gPyBuZXdTaXplWzFdIC0gY3VyU2l6ZVsxXSAtIGJvcmRlciA6IChuZXdTaXplWzFdIC0gY3VyU2l6ZVsxXSkgLyAyKVxuXHRcdFx0XTtcblx0XHR9XG5cblx0XHQvLyBDYW52YXMgZHJhd2luZyBpbXBsZW1lbnRhdGlvblxuXHRcdGlmKEhBU0NBTlZBUykge1xuXHRcdFx0Ly8gR3JhYiBjYW52YXMgY29udGV4dCBhbmQgY2xlYXIvc2F2ZSBpdFxuXHRcdFx0Y29udGV4dCA9IGlubmVyWzBdLmdldENvbnRleHQoJzJkJyk7XG5cdFx0XHRjb250ZXh0LnJlc3RvcmUoKTsgY29udGV4dC5zYXZlKCk7XG5cdFx0XHRjb250ZXh0LmNsZWFyUmVjdCgwLDAsNjAwMCw2MDAwKTtcblxuXHRcdFx0Ly8gQ2FsY3VsYXRlIGNvb3JkaW5hdGVzXG5cdFx0XHRjb29yZHMgPSB0aGlzLl9jYWxjdWxhdGVUaXAobWltaWMsIGN1clNpemUsIFNDQUxFKTtcblx0XHRcdGJpZ0Nvb3JkcyA9IHRoaXMuX2NhbGN1bGF0ZVRpcChtaW1pYywgdGhpcy5zaXplLCBTQ0FMRSk7XG5cblx0XHRcdC8vIFNldCB0aGUgY2FudmFzIHNpemUgdXNpbmcgY2FsY3VsYXRlZCBzaXplXG5cdFx0XHRpbm5lci5hdHRyKFdJRFRILCBuZXdTaXplWzBdICogU0NBTEUpLmF0dHIoSEVJR0hULCBuZXdTaXplWzFdICogU0NBTEUpO1xuXHRcdFx0aW5uZXIuY3NzKFdJRFRILCBuZXdTaXplWzBdKS5jc3MoSEVJR0hULCBuZXdTaXplWzFdKTtcblxuXHRcdFx0Ly8gRHJhdyB0aGUgb3V0ZXItc3Ryb2tlIHRpcFxuXHRcdFx0dGhpcy5fZHJhd0Nvb3Jkcyhjb250ZXh0LCBiaWdDb29yZHMpO1xuXHRcdFx0Y29udGV4dC5maWxsU3R5bGUgPSBjb2xvclsxXTtcblx0XHRcdGNvbnRleHQuZmlsbCgpO1xuXG5cdFx0XHQvLyBEcmF3IHRoZSBhY3R1YWwgdGlwXG5cdFx0XHRjb250ZXh0LnRyYW5zbGF0ZSh0cmFuc2xhdGVbMF0gKiBTQ0FMRSwgdHJhbnNsYXRlWzFdICogU0NBTEUpO1xuXHRcdFx0dGhpcy5fZHJhd0Nvb3Jkcyhjb250ZXh0LCBjb29yZHMpO1xuXHRcdFx0Y29udGV4dC5maWxsU3R5bGUgPSBjb2xvclswXTtcblx0XHRcdGNvbnRleHQuZmlsbCgpO1xuXHRcdH1cblxuXHRcdC8vIFZNTCAoSUUgUHJvcHJpZXRhcnkgaW1wbGVtZW50YXRpb24pXG5cdFx0ZWxzZSB7XG5cdFx0XHQvLyBDYWxjdWxhdGUgY29vcmRpbmF0ZXNcblx0XHRcdGNvb3JkcyA9IHRoaXMuX2NhbGN1bGF0ZVRpcChtaW1pYyk7XG5cblx0XHRcdC8vIFNldHVwIGNvb3JkaW5hdGVzIHN0cmluZ1xuXHRcdFx0Y29vcmRzID0gJ20nICsgY29vcmRzWzBdICsgJywnICsgY29vcmRzWzFdICsgJyBsJyArIGNvb3Jkc1syXSArXG5cdFx0XHRcdCcsJyArIGNvb3Jkc1szXSArICcgJyArIGNvb3Jkc1s0XSArICcsJyArIGNvb3Jkc1s1XSArICcgeGUnO1xuXG5cdFx0XHQvLyBTZXR1cCBWTUwtc3BlY2lmaWMgb2Zmc2V0IGZvciBwaXhlbC1wZXJmZWN0aW9uXG5cdFx0XHR0cmFuc2xhdGVbMl0gPSBib3JkZXIgJiYgL14ocnxiKS9pLnRlc3QoY29ybmVyLnN0cmluZygpKSA/XG5cdFx0XHRcdEJST1dTRVIuaWUgPT09IDggPyAyIDogMSA6IDA7XG5cblx0XHRcdC8vIFNldCBpbml0aWFsIENTU1xuXHRcdFx0aW5uZXIuY3NzKHtcblx0XHRcdFx0Y29vcmRzaXplOiBuZXdTaXplWzBdK2JvcmRlciArICcgJyArIG5ld1NpemVbMV0rYm9yZGVyLFxuXHRcdFx0XHRhbnRpYWxpYXM6ICcnKyhtaW1pYy5zdHJpbmcoKS5pbmRleE9mKENFTlRFUikgPiAtMSksXG5cdFx0XHRcdGxlZnQ6IHRyYW5zbGF0ZVswXSAtIHRyYW5zbGF0ZVsyXSAqIE51bWJlcihwcmVjZWRhbmNlID09PSBYKSxcblx0XHRcdFx0dG9wOiB0cmFuc2xhdGVbMV0gLSB0cmFuc2xhdGVbMl0gKiBOdW1iZXIocHJlY2VkYW5jZSA9PT0gWSksXG5cdFx0XHRcdHdpZHRoOiBuZXdTaXplWzBdICsgYm9yZGVyLFxuXHRcdFx0XHRoZWlnaHQ6IG5ld1NpemVbMV0gKyBib3JkZXJcblx0XHRcdH0pXG5cdFx0XHQuZWFjaChmdW5jdGlvbihpKSB7XG5cdFx0XHRcdHZhciAkdGhpcyA9ICQodGhpcyk7XG5cblx0XHRcdFx0Ly8gU2V0IHNoYXBlIHNwZWNpZmljIGF0dHJpYnV0ZXNcblx0XHRcdFx0JHRoaXNbICR0aGlzLnByb3AgPyAncHJvcCcgOiAnYXR0cicgXSh7XG5cdFx0XHRcdFx0Y29vcmRzaXplOiBuZXdTaXplWzBdK2JvcmRlciArICcgJyArIG5ld1NpemVbMV0rYm9yZGVyLFxuXHRcdFx0XHRcdHBhdGg6IGNvb3Jkcyxcblx0XHRcdFx0XHRmaWxsY29sb3I6IGNvbG9yWzBdLFxuXHRcdFx0XHRcdGZpbGxlZDogISFpLFxuXHRcdFx0XHRcdHN0cm9rZWQ6ICFpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50b2dnbGUoISEoYm9yZGVyIHx8IGkpKTtcblxuXHRcdFx0XHQvLyBDaGVjayBpZiBib3JkZXIgaXMgZW5hYmxlZCBhbmQgYWRkIHN0cm9rZSBlbGVtZW50XG5cdFx0XHRcdCFpICYmICR0aGlzLmh0bWwoIGNyZWF0ZVZNTChcblx0XHRcdFx0XHQnc3Ryb2tlJywgJ3dlaWdodD1cIicrYm9yZGVyKjIrJ3B4XCIgY29sb3I9XCInK2NvbG9yWzFdKydcIiBtaXRlcmxpbWl0PVwiMTAwMFwiIGpvaW5zdHlsZT1cIm1pdGVyXCInXG5cdFx0XHRcdCkgKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8vIE9wZXJhIGJ1ZyAjMzU3IC0gSW5jb3JyZWN0IHRpcCBwb3NpdGlvblxuXHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9DcmFnYTg5L3FUaXAyL2lzc3Vlcy8zNjdcblx0XHR3aW5kb3cub3BlcmEgJiYgc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdGVsZW1lbnRzLnRpcC5jc3Moe1xuXHRcdFx0XHRkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcblx0XHRcdFx0dmlzaWJpbGl0eTogJ3Zpc2libGUnXG5cdFx0XHR9KTtcblx0XHR9LCAxKTtcblxuXHRcdC8vIFBvc2l0aW9uIGlmIG5lZWRlZFxuXHRcdGlmKHBvc2l0aW9uICE9PSBGQUxTRSkgeyB0aGlzLmNhbGN1bGF0ZShjb3JuZXIsIG5ld1NpemUpOyB9XG5cdH0sXG5cblx0Y2FsY3VsYXRlOiBmdW5jdGlvbihjb3JuZXIsIHNpemUpIHtcblx0XHRpZighdGhpcy5lbmFibGVkKSB7IHJldHVybiBGQUxTRTsgfVxuXG5cdFx0dmFyIHNlbGYgPSB0aGlzLFxuXHRcdFx0ZWxlbWVudHMgPSB0aGlzLnF0aXAuZWxlbWVudHMsXG5cdFx0XHR0aXAgPSB0aGlzLmVsZW1lbnQsXG5cdFx0XHR1c2VyT2Zmc2V0ID0gdGhpcy5vcHRpb25zLm9mZnNldCxcblx0XHRcdHBvc2l0aW9uID0ge30sXG5cdFx0XHRwcmVjZWRhbmNlLCBjb3JuZXJzO1xuXG5cdFx0Ly8gSW5oZXJpdCBjb3JuZXIgaWYgbm90IHByb3ZpZGVkXG5cdFx0Y29ybmVyID0gY29ybmVyIHx8IHRoaXMuY29ybmVyO1xuXHRcdHByZWNlZGFuY2UgPSBjb3JuZXIucHJlY2VkYW5jZTtcblxuXHRcdC8vIERldGVybWluZSB3aGljaCB0aXAgZGltZW5zaW9uIHRvIHVzZSBmb3IgYWRqdXN0bWVudFxuXHRcdHNpemUgPSBzaXplIHx8IHRoaXMuX2NhbGN1bGF0ZVNpemUoY29ybmVyKTtcblxuXHRcdC8vIFNldHVwIGNvcm5lcnMgYW5kIG9mZnNldCBhcnJheVxuXHRcdGNvcm5lcnMgPSBbIGNvcm5lci54LCBjb3JuZXIueSBdO1xuXHRcdGlmKHByZWNlZGFuY2UgPT09IFgpIHsgY29ybmVycy5yZXZlcnNlKCk7IH1cblxuXHRcdC8vIENhbGN1bGF0ZSB0aXAgcG9zaXRpb25cblx0XHQkLmVhY2goY29ybmVycywgZnVuY3Rpb24oaSwgc2lkZSkge1xuXHRcdFx0dmFyIGIsIGJjLCBicjtcblxuXHRcdFx0aWYoc2lkZSA9PT0gQ0VOVEVSKSB7XG5cdFx0XHRcdGIgPSBwcmVjZWRhbmNlID09PSBZID8gTEVGVCA6IFRPUDtcblx0XHRcdFx0cG9zaXRpb25bIGIgXSA9ICc1MCUnO1xuXHRcdFx0XHRwb3NpdGlvbltNQVJHSU4rJy0nICsgYl0gPSAtTWF0aC5yb3VuZChzaXplWyBwcmVjZWRhbmNlID09PSBZID8gMCA6IDEgXSAvIDIpICsgdXNlck9mZnNldDtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRiID0gc2VsZi5fcGFyc2VXaWR0aChjb3JuZXIsIHNpZGUsIGVsZW1lbnRzLnRvb2x0aXApO1xuXHRcdFx0XHRiYyA9IHNlbGYuX3BhcnNlV2lkdGgoY29ybmVyLCBzaWRlLCBlbGVtZW50cy5jb250ZW50KTtcblx0XHRcdFx0YnIgPSBzZWxmLl9wYXJzZVJhZGl1cyhjb3JuZXIpO1xuXG5cdFx0XHRcdHBvc2l0aW9uWyBzaWRlIF0gPSBNYXRoLm1heCgtc2VsZi5ib3JkZXIsIGkgPyBiYyA6IHVzZXJPZmZzZXQgKyAoYnIgPiBiID8gYnIgOiAtYikpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gQWRqdXN0IGZvciB0aXAgc2l6ZVxuXHRcdHBvc2l0aW9uWyBjb3JuZXJbcHJlY2VkYW5jZV0gXSAtPSBzaXplWyBwcmVjZWRhbmNlID09PSBYID8gMCA6IDEgXTtcblxuXHRcdC8vIFNldCBhbmQgcmV0dXJuIG5ldyBwb3NpdGlvblxuXHRcdHRpcC5jc3MoeyBtYXJnaW46ICcnLCB0b3A6ICcnLCBib3R0b206ICcnLCBsZWZ0OiAnJywgcmlnaHQ6ICcnIH0pLmNzcyhwb3NpdGlvbik7XG5cdFx0cmV0dXJuIHBvc2l0aW9uO1xuXHR9LFxuXG5cdHJlcG9zaXRpb246IGZ1bmN0aW9uKGV2ZW50LCBhcGksIHBvcykge1xuXHRcdGlmKCF0aGlzLmVuYWJsZWQpIHsgcmV0dXJuOyB9XG5cblx0XHR2YXIgY2FjaGUgPSBhcGkuY2FjaGUsXG5cdFx0XHRuZXdDb3JuZXIgPSB0aGlzLmNvcm5lci5jbG9uZSgpLFxuXHRcdFx0YWRqdXN0ID0gcG9zLmFkanVzdGVkLFxuXHRcdFx0bWV0aG9kID0gYXBpLm9wdGlvbnMucG9zaXRpb24uYWRqdXN0Lm1ldGhvZC5zcGxpdCgnICcpLFxuXHRcdFx0aG9yaXpvbnRhbCA9IG1ldGhvZFswXSxcblx0XHRcdHZlcnRpY2FsID0gbWV0aG9kWzFdIHx8IG1ldGhvZFswXSxcblx0XHRcdHNoaWZ0ID0geyBsZWZ0OiBGQUxTRSwgdG9wOiBGQUxTRSwgeDogMCwgeTogMCB9LFxuXHRcdFx0b2Zmc2V0LCBjc3MgPSB7fSwgcHJvcHM7XG5cblx0XHRmdW5jdGlvbiBzaGlmdGZsaXAoZGlyZWN0aW9uLCBwcmVjZWRhbmNlLCBwb3Bwb3NpdGUsIHNpZGUsIG9wcG9zaXRlKSB7XG5cdFx0XHQvLyBIb3Jpem9udGFsIC0gU2hpZnQgb3IgZmxpcCBtZXRob2Rcblx0XHRcdGlmKGRpcmVjdGlvbiA9PT0gU0hJRlQgJiYgbmV3Q29ybmVyLnByZWNlZGFuY2UgPT09IHByZWNlZGFuY2UgJiYgYWRqdXN0W3NpZGVdICYmIG5ld0Nvcm5lcltwb3Bwb3NpdGVdICE9PSBDRU5URVIpIHtcblx0XHRcdFx0bmV3Q29ybmVyLnByZWNlZGFuY2UgPSBuZXdDb3JuZXIucHJlY2VkYW5jZSA9PT0gWCA/IFkgOiBYO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZihkaXJlY3Rpb24gIT09IFNISUZUICYmIGFkanVzdFtzaWRlXSl7XG5cdFx0XHRcdG5ld0Nvcm5lcltwcmVjZWRhbmNlXSA9IG5ld0Nvcm5lcltwcmVjZWRhbmNlXSA9PT0gQ0VOVEVSID9cblx0XHRcdFx0XHRhZGp1c3Rbc2lkZV0gPiAwID8gc2lkZSA6IG9wcG9zaXRlIDpcblx0XHRcdFx0XHRuZXdDb3JuZXJbcHJlY2VkYW5jZV0gPT09IHNpZGUgPyBvcHBvc2l0ZSA6IHNpZGU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gc2hpZnRvbmx5KHh5LCBzaWRlLCBvcHBvc2l0ZSkge1xuXHRcdFx0aWYobmV3Q29ybmVyW3h5XSA9PT0gQ0VOVEVSKSB7XG5cdFx0XHRcdGNzc1tNQVJHSU4rJy0nK3NpZGVdID0gc2hpZnRbeHldID0gb2Zmc2V0W01BUkdJTisnLScrc2lkZV0gLSBhZGp1c3Rbc2lkZV07XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0cHJvcHMgPSBvZmZzZXRbb3Bwb3NpdGVdICE9PSB1bmRlZmluZWQgP1xuXHRcdFx0XHRcdFsgYWRqdXN0W3NpZGVdLCAtb2Zmc2V0W3NpZGVdIF0gOiBbIC1hZGp1c3Rbc2lkZV0sIG9mZnNldFtzaWRlXSBdO1xuXG5cdFx0XHRcdGlmKCAoc2hpZnRbeHldID0gTWF0aC5tYXgocHJvcHNbMF0sIHByb3BzWzFdKSkgPiBwcm9wc1swXSApIHtcblx0XHRcdFx0XHRwb3Nbc2lkZV0gLT0gYWRqdXN0W3NpZGVdO1xuXHRcdFx0XHRcdHNoaWZ0W3NpZGVdID0gRkFMU0U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjc3NbIG9mZnNldFtvcHBvc2l0ZV0gIT09IHVuZGVmaW5lZCA/IG9wcG9zaXRlIDogc2lkZSBdID0gc2hpZnRbeHldO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIElmIG91ciB0aXAgcG9zaXRpb24gaXNuJ3QgZml4ZWQgZS5nLiBkb2Vzbid0IGFkanVzdCB3aXRoIHZpZXdwb3J0Li4uXG5cdFx0aWYodGhpcy5jb3JuZXIuZml4ZWQgIT09IFRSVUUpIHtcblx0XHRcdC8vIFBlcmZvcm0gc2hpZnQvZmxpcCBhZGp1c3RtZW50c1xuXHRcdFx0c2hpZnRmbGlwKGhvcml6b250YWwsIFgsIFksIExFRlQsIFJJR0hUKTtcblx0XHRcdHNoaWZ0ZmxpcCh2ZXJ0aWNhbCwgWSwgWCwgVE9QLCBCT1RUT00pO1xuXG5cdFx0XHQvLyBVcGRhdGUgYW5kIHJlZHJhdyB0aGUgdGlwIGlmIG5lZWRlZCAoY2hlY2sgY2FjaGVkIGRldGFpbHMgb2YgbGFzdCBkcmF3biB0aXApXG5cdFx0XHRpZihuZXdDb3JuZXIuc3RyaW5nKCkgIT09IGNhY2hlLmNvcm5lci5zdHJpbmcoKSB8fCBjYWNoZS5jb3JuZXJUb3AgIT09IGFkanVzdC50b3AgfHwgY2FjaGUuY29ybmVyTGVmdCAhPT0gYWRqdXN0LmxlZnQpIHtcblx0XHRcdFx0dGhpcy51cGRhdGUobmV3Q29ybmVyLCBGQUxTRSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gU2V0dXAgdGlwIG9mZnNldCBwcm9wZXJ0aWVzXG5cdFx0b2Zmc2V0ID0gdGhpcy5jYWxjdWxhdGUobmV3Q29ybmVyKTtcblxuXHRcdC8vIFJlYWRqdXN0IG9mZnNldCBvYmplY3QgdG8gbWFrZSBpdCBsZWZ0L3RvcFxuXHRcdGlmKG9mZnNldC5yaWdodCAhPT0gdW5kZWZpbmVkKSB7IG9mZnNldC5sZWZ0ID0gLW9mZnNldC5yaWdodDsgfVxuXHRcdGlmKG9mZnNldC5ib3R0b20gIT09IHVuZGVmaW5lZCkgeyBvZmZzZXQudG9wID0gLW9mZnNldC5ib3R0b207IH1cblx0XHRvZmZzZXQudXNlciA9IHRoaXMub2Zmc2V0O1xuXG5cdFx0Ly8gUGVyZm9ybSBzaGlmdCBhZGp1c3RtZW50c1xuXHRcdHNoaWZ0LmxlZnQgPSBob3Jpem9udGFsID09PSBTSElGVCAmJiAhIWFkanVzdC5sZWZ0O1xuXHRcdGlmKHNoaWZ0LmxlZnQpIHtcblx0XHRcdHNoaWZ0b25seShYLCBMRUZULCBSSUdIVCk7XG5cdFx0fVxuXHRcdHNoaWZ0LnRvcCA9IHZlcnRpY2FsID09PSBTSElGVCAmJiAhIWFkanVzdC50b3A7XG5cdFx0aWYoc2hpZnQudG9wKSB7XG5cdFx0XHRzaGlmdG9ubHkoWSwgVE9QLCBCT1RUT00pO1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0KiBJZiB0aGUgdGlwIGlzIGFkanVzdGVkIGluIGJvdGggZGltZW5zaW9ucywgb3IgaW4gYVxuXHRcdCogZGlyZWN0aW9uIHRoYXQgd291bGQgY2F1c2UgaXQgdG8gYmUgYW55d2hlcmUgYnV0IHRoZVxuXHRcdCogb3V0ZXIgYm9yZGVyLCBoaWRlIGl0IVxuXHRcdCovXG5cdFx0dGhpcy5lbGVtZW50LmNzcyhjc3MpLnRvZ2dsZShcblx0XHRcdCEoc2hpZnQueCAmJiBzaGlmdC55IHx8IG5ld0Nvcm5lci54ID09PSBDRU5URVIgJiYgc2hpZnQueSB8fCBuZXdDb3JuZXIueSA9PT0gQ0VOVEVSICYmIHNoaWZ0LngpXG5cdFx0KTtcblxuXHRcdC8vIEFkanVzdCBwb3NpdGlvbiB0byBhY2NvbW9kYXRlIHRpcCBkaW1lbnNpb25zXG5cdFx0cG9zLmxlZnQgLT0gb2Zmc2V0LmxlZnQuY2hhckF0ID8gb2Zmc2V0LnVzZXIgOlxuXHRcdFx0aG9yaXpvbnRhbCAhPT0gU0hJRlQgfHwgc2hpZnQudG9wIHx8ICFzaGlmdC5sZWZ0ICYmICFzaGlmdC50b3AgPyBvZmZzZXQubGVmdCArIHRoaXMuYm9yZGVyIDogMDtcblx0XHRwb3MudG9wIC09IG9mZnNldC50b3AuY2hhckF0ID8gb2Zmc2V0LnVzZXIgOlxuXHRcdFx0dmVydGljYWwgIT09IFNISUZUIHx8IHNoaWZ0LmxlZnQgfHwgIXNoaWZ0LmxlZnQgJiYgIXNoaWZ0LnRvcCA/IG9mZnNldC50b3AgKyB0aGlzLmJvcmRlciA6IDA7XG5cblx0XHQvLyBDYWNoZSBkZXRhaWxzXG5cdFx0Y2FjaGUuY29ybmVyTGVmdCA9IGFkanVzdC5sZWZ0OyBjYWNoZS5jb3JuZXJUb3AgPSBhZGp1c3QudG9wO1xuXHRcdGNhY2hlLmNvcm5lciA9IG5ld0Nvcm5lci5jbG9uZSgpO1xuXHR9LFxuXG5cdGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIFVuYmluZCBldmVudHNcblx0XHR0aGlzLnF0aXAuX3VuYmluZCh0aGlzLnF0aXAudG9vbHRpcCwgdGhpcy5fbnMpO1xuXG5cdFx0Ly8gUmVtb3ZlIHRoZSB0aXAgZWxlbWVudChzKVxuXHRcdGlmKHRoaXMucXRpcC5lbGVtZW50cy50aXApIHtcblx0XHRcdHRoaXMucXRpcC5lbGVtZW50cy50aXAuZmluZCgnKicpXG5cdFx0XHRcdC5yZW1vdmUoKS5lbmQoKS5yZW1vdmUoKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5USVAgPSBQTFVHSU5TLnRpcCA9IGZ1bmN0aW9uKGFwaSkge1xuXHRyZXR1cm4gbmV3IFRpcChhcGksIGFwaS5vcHRpb25zLnN0eWxlLnRpcCk7XG59O1xuXG4vLyBJbml0aWFsaXplIHRpcCBvbiByZW5kZXJcblRJUC5pbml0aWFsaXplID0gJ3JlbmRlcic7XG5cbi8vIFNldHVwIHBsdWdpbiBzYW5pdGl6YXRpb24gb3B0aW9uc1xuVElQLnNhbml0aXplID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXHRpZihvcHRpb25zLnN0eWxlICYmICd0aXAnIGluIG9wdGlvbnMuc3R5bGUpIHtcblx0XHR2YXIgb3B0cyA9IG9wdGlvbnMuc3R5bGUudGlwO1xuXHRcdGlmKHR5cGVvZiBvcHRzICE9PSAnb2JqZWN0JykgeyBvcHRzID0gb3B0aW9ucy5zdHlsZS50aXAgPSB7IGNvcm5lcjogb3B0cyB9OyB9XG5cdFx0aWYoISgvc3RyaW5nfGJvb2xlYW4vaSkudGVzdCh0eXBlb2Ygb3B0cy5jb3JuZXIpKSB7IG9wdHMuY29ybmVyID0gVFJVRTsgfVxuXHR9XG59O1xuXG4vLyBBZGQgbmV3IG9wdGlvbiBjaGVja3MgZm9yIHRoZSBwbHVnaW5cbkNIRUNLUy50aXAgPSB7XG5cdCdecG9zaXRpb24ubXl8c3R5bGUudGlwLihjb3JuZXJ8bWltaWN8Ym9yZGVyKSQnOiBmdW5jdGlvbigpIHtcblx0XHQvLyBNYWtlIHN1cmUgYSB0aXAgY2FuIGJlIGRyYXduXG5cdFx0dGhpcy5jcmVhdGUoKTtcblxuXHRcdC8vIFJlcG9zaXRpb24gdGhlIHRvb2x0aXBcblx0XHR0aGlzLnF0aXAucmVwb3NpdGlvbigpO1xuXHR9LFxuXHQnXnN0eWxlLnRpcC4oaGVpZ2h0fHdpZHRoKSQnOiBmdW5jdGlvbihvYmopIHtcblx0XHQvLyBSZS1zZXQgZGltZW5zaW9ucyBhbmQgcmVkcmF3IHRoZSB0aXBcblx0XHR0aGlzLnNpemUgPSBbIG9iai53aWR0aCwgb2JqLmhlaWdodCBdO1xuXHRcdHRoaXMudXBkYXRlKCk7XG5cblx0XHQvLyBSZXBvc2l0aW9uIHRoZSB0b29sdGlwXG5cdFx0dGhpcy5xdGlwLnJlcG9zaXRpb24oKTtcblx0fSxcblx0J15jb250ZW50LnRpdGxlfHN0eWxlLihjbGFzc2VzfHdpZGdldCkkJzogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy51cGRhdGUoKTtcblx0fVxufTtcblxuLy8gRXh0ZW5kIG9yaWdpbmFsIHFUaXAgZGVmYXVsdHNcbiQuZXh0ZW5kKFRSVUUsIFFUSVAuZGVmYXVsdHMsIHtcblx0c3R5bGU6IHtcblx0XHR0aXA6IHtcblx0XHRcdGNvcm5lcjogVFJVRSxcblx0XHRcdG1pbWljOiBGQUxTRSxcblx0XHRcdHdpZHRoOiA2LFxuXHRcdFx0aGVpZ2h0OiA2LFxuXHRcdFx0Ym9yZGVyOiBUUlVFLFxuXHRcdFx0b2Zmc2V0OiAwXG5cdFx0fVxuXHR9XG59KTtcbjt2YXIgTU9EQUwsIE9WRVJMQVksXG5cdE1PREFMQ0xBU1MgPSAncXRpcC1tb2RhbCcsXG5cdE1PREFMU0VMRUNUT1IgPSAnLicrTU9EQUxDTEFTUztcblxuT1ZFUkxBWSA9IGZ1bmN0aW9uKClcbntcblx0dmFyIHNlbGYgPSB0aGlzLFxuXHRcdGZvY3VzYWJsZUVsZW1zID0ge30sXG5cdFx0Y3VycmVudCxcblx0XHRwcmV2U3RhdGUsXG5cdFx0ZWxlbTtcblxuXHQvLyBNb2RpZmllZCBjb2RlIGZyb20galF1ZXJ5IFVJIDEuMTAuMCBzb3VyY2Vcblx0Ly8gaHR0cDovL2NvZGUuanF1ZXJ5LmNvbS91aS8xLjEwLjAvanF1ZXJ5LXVpLmpzXG5cdGZ1bmN0aW9uIGZvY3VzYWJsZShlbGVtZW50KSB7XG5cdFx0Ly8gVXNlIHRoZSBkZWZpbmVkIGZvY3VzYWJsZSBjaGVja2VyIHdoZW4gcG9zc2libGVcblx0XHRpZigkLmV4cHJbJzonXS5mb2N1c2FibGUpIHsgcmV0dXJuICQuZXhwclsnOiddLmZvY3VzYWJsZTsgfVxuXG5cdFx0dmFyIGlzVGFiSW5kZXhOb3ROYU4gPSAhaXNOYU4oJC5hdHRyKGVsZW1lbnQsICd0YWJpbmRleCcpKSxcblx0XHRcdG5vZGVOYW1lID0gZWxlbWVudC5ub2RlTmFtZSAmJiBlbGVtZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCksXG5cdFx0XHRtYXAsIG1hcE5hbWUsIGltZztcblxuXHRcdGlmKCdhcmVhJyA9PT0gbm9kZU5hbWUpIHtcblx0XHRcdG1hcCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcblx0XHRcdG1hcE5hbWUgPSBtYXAubmFtZTtcblx0XHRcdGlmKCFlbGVtZW50LmhyZWYgfHwgIW1hcE5hbWUgfHwgbWFwLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgIT09ICdtYXAnKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdGltZyA9ICQoJ2ltZ1t1c2VtYXA9IycgKyBtYXBOYW1lICsgJ10nKVswXTtcblx0XHRcdHJldHVybiAhIWltZyAmJiBpbWcuaXMoJzp2aXNpYmxlJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIC9pbnB1dHxzZWxlY3R8dGV4dGFyZWF8YnV0dG9ufG9iamVjdC8udGVzdCggbm9kZU5hbWUgKSA/XG5cdFx0XHQhZWxlbWVudC5kaXNhYmxlZCA6XG5cdFx0XHQnYScgPT09IG5vZGVOYW1lID9cblx0XHRcdFx0ZWxlbWVudC5ocmVmIHx8IGlzVGFiSW5kZXhOb3ROYU4gOlxuXHRcdFx0XHRpc1RhYkluZGV4Tm90TmFOXG5cdFx0O1xuXHR9XG5cblx0Ly8gRm9jdXMgaW5wdXRzIHVzaW5nIGNhY2hlZCBmb2N1c2FibGUgZWxlbWVudHMgKHNlZSB1cGRhdGUoKSlcblx0ZnVuY3Rpb24gZm9jdXNJbnB1dHMoYmx1ckVsZW1zKSB7XG5cdFx0Ly8gQmx1cnJpbmcgYm9keSBlbGVtZW50IGluIElFIGNhdXNlcyB3aW5kb3cub3BlbiB3aW5kb3dzIHRvIHVuZm9jdXMhXG5cdFx0aWYoZm9jdXNhYmxlRWxlbXMubGVuZ3RoIDwgMSAmJiBibHVyRWxlbXMubGVuZ3RoKSB7IGJsdXJFbGVtcy5ub3QoJ2JvZHknKS5ibHVyKCk7IH1cblxuXHRcdC8vIEZvY3VzIHRoZSBpbnB1dHNcblx0XHRlbHNlIHsgZm9jdXNhYmxlRWxlbXMuZmlyc3QoKS5mb2N1cygpOyB9XG5cdH1cblxuXHQvLyBTdGVhbCBmb2N1cyBmcm9tIGVsZW1lbnRzIG91dHNpZGUgdG9vbHRpcFxuXHRmdW5jdGlvbiBzdGVhbEZvY3VzKGV2ZW50KSB7XG5cdFx0aWYoIWVsZW0uaXMoJzp2aXNpYmxlJykpIHsgcmV0dXJuOyB9XG5cblx0XHR2YXIgdGFyZ2V0ID0gJChldmVudC50YXJnZXQpLFxuXHRcdFx0dG9vbHRpcCA9IGN1cnJlbnQudG9vbHRpcCxcblx0XHRcdGNvbnRhaW5lciA9IHRhcmdldC5jbG9zZXN0KFNFTEVDVE9SKSxcblx0XHRcdHRhcmdldE9uVG9wO1xuXG5cdFx0Ly8gRGV0ZXJtaW5lIGlmIGlucHV0IGNvbnRhaW5lciB0YXJnZXQgaXMgYWJvdmUgdGhpc1xuXHRcdHRhcmdldE9uVG9wID0gY29udGFpbmVyLmxlbmd0aCA8IDEgPyBGQUxTRSA6XG5cdFx0XHRwYXJzZUludChjb250YWluZXJbMF0uc3R5bGUuekluZGV4LCAxMCkgPiBwYXJzZUludCh0b29sdGlwWzBdLnN0eWxlLnpJbmRleCwgMTApO1xuXG5cdFx0Ly8gSWYgd2UncmUgc2hvd2luZyBhIG1vZGFsLCBidXQgZm9jdXMgaGFzIGxhbmRlZCBvbiBhbiBpbnB1dCBiZWxvd1xuXHRcdC8vIHRoaXMgbW9kYWwsIGRpdmVydCBmb2N1cyB0byB0aGUgZmlyc3QgdmlzaWJsZSBpbnB1dCBpbiB0aGlzIG1vZGFsXG5cdFx0Ly8gb3IgaWYgd2UgY2FuJ3QgZmluZCBvbmUuLi4gdGhlIHRvb2x0aXAgaXRzZWxmXG5cdFx0aWYoIXRhcmdldE9uVG9wICYmIHRhcmdldC5jbG9zZXN0KFNFTEVDVE9SKVswXSAhPT0gdG9vbHRpcFswXSkge1xuXHRcdFx0Zm9jdXNJbnB1dHModGFyZ2V0KTtcblx0XHR9XG5cdH1cblxuXHQkLmV4dGVuZChzZWxmLCB7XG5cdFx0aW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBDcmVhdGUgZG9jdW1lbnQgb3ZlcmxheVxuXHRcdFx0ZWxlbSA9IHNlbGYuZWxlbSA9ICQoJzxkaXYgLz4nLCB7XG5cdFx0XHRcdGlkOiAncXRpcC1vdmVybGF5Jyxcblx0XHRcdFx0aHRtbDogJzxkaXY+PC9kaXY+Jyxcblx0XHRcdFx0bW91c2Vkb3duOiBmdW5jdGlvbigpIHsgcmV0dXJuIEZBTFNFOyB9XG5cdFx0XHR9KVxuXHRcdFx0LmhpZGUoKTtcblxuXHRcdFx0Ly8gTWFrZSBzdXJlIHdlIGNhbid0IGZvY3VzIGFueXRoaW5nIG91dHNpZGUgdGhlIHRvb2x0aXBcblx0XHRcdCQoZG9jdW1lbnQuYm9keSkuYmluZCgnZm9jdXNpbicrTU9EQUxTRUxFQ1RPUiwgc3RlYWxGb2N1cyk7XG5cblx0XHRcdC8vIEFwcGx5IGtleWJvYXJkIFwiRXNjYXBlIGtleVwiIGNsb3NlIGhhbmRsZXJcblx0XHRcdCQoZG9jdW1lbnQpLmJpbmQoJ2tleWRvd24nK01PREFMU0VMRUNUT1IsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdGlmKGN1cnJlbnQgJiYgY3VycmVudC5vcHRpb25zLnNob3cubW9kYWwuZXNjYXBlICYmIGV2ZW50LmtleUNvZGUgPT09IDI3KSB7XG5cdFx0XHRcdFx0Y3VycmVudC5oaWRlKGV2ZW50KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIEFwcGx5IGNsaWNrIGhhbmRsZXIgZm9yIGJsdXIgb3B0aW9uXG5cdFx0XHRlbGVtLmJpbmQoJ2NsaWNrJytNT0RBTFNFTEVDVE9SLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRpZihjdXJyZW50ICYmIGN1cnJlbnQub3B0aW9ucy5zaG93Lm1vZGFsLmJsdXIpIHtcblx0XHRcdFx0XHRjdXJyZW50LmhpZGUoZXZlbnQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIHNlbGY7XG5cdFx0fSxcblxuXHRcdHVwZGF0ZTogZnVuY3Rpb24oYXBpKSB7XG5cdFx0XHQvLyBVcGRhdGUgY3VycmVudCBBUEkgcmVmZXJlbmNlXG5cdFx0XHRjdXJyZW50ID0gYXBpO1xuXG5cdFx0XHQvLyBVcGRhdGUgZm9jdXNhYmxlIGVsZW1lbnRzIGlmIGVuYWJsZWRcblx0XHRcdGlmKGFwaS5vcHRpb25zLnNob3cubW9kYWwuc3RlYWxmb2N1cyAhPT0gRkFMU0UpIHtcblx0XHRcdFx0Zm9jdXNhYmxlRWxlbXMgPSBhcGkudG9vbHRpcC5maW5kKCcqJykuZmlsdGVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHJldHVybiBmb2N1c2FibGUodGhpcyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7IGZvY3VzYWJsZUVsZW1zID0gW107IH1cblx0XHR9LFxuXG5cdFx0dG9nZ2xlOiBmdW5jdGlvbihhcGksIHN0YXRlLCBkdXJhdGlvbikge1xuXHRcdFx0dmFyIHRvb2x0aXAgPSBhcGkudG9vbHRpcCxcblx0XHRcdFx0b3B0aW9ucyA9IGFwaS5vcHRpb25zLnNob3cubW9kYWwsXG5cdFx0XHRcdGVmZmVjdCA9IG9wdGlvbnMuZWZmZWN0LFxuXHRcdFx0XHR0eXBlID0gc3RhdGUgPyAnc2hvdyc6ICdoaWRlJyxcblx0XHRcdFx0dmlzaWJsZSA9IGVsZW0uaXMoJzp2aXNpYmxlJyksXG5cdFx0XHRcdHZpc2libGVNb2RhbHMgPSAkKE1PREFMU0VMRUNUT1IpLmZpbHRlcignOnZpc2libGU6bm90KDphbmltYXRlZCknKS5ub3QodG9vbHRpcCk7XG5cblx0XHRcdC8vIFNldCBhY3RpdmUgdG9vbHRpcCBBUEkgcmVmZXJlbmNlXG5cdFx0XHRzZWxmLnVwZGF0ZShhcGkpO1xuXG5cdFx0XHQvLyBJZiB0aGUgbW9kYWwgY2FuIHN0ZWFsIHRoZSBmb2N1cy4uLlxuXHRcdFx0Ly8gQmx1ciB0aGUgY3VycmVudCBpdGVtIGFuZCBmb2N1cyBhbnl0aGluZyBpbiB0aGUgbW9kYWwgd2UgYW5cblx0XHRcdGlmKHN0YXRlICYmIG9wdGlvbnMuc3RlYWxmb2N1cyAhPT0gRkFMU0UpIHtcblx0XHRcdFx0Zm9jdXNJbnB1dHMoICQoJzpmb2N1cycpICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFRvZ2dsZSBiYWNrZHJvcCBjdXJzb3Igc3R5bGUgb24gc2hvd1xuXHRcdFx0ZWxlbS50b2dnbGVDbGFzcygnYmx1cnMnLCBvcHRpb25zLmJsdXIpO1xuXG5cdFx0XHQvLyBBcHBlbmQgdG8gYm9keSBvbiBzaG93XG5cdFx0XHRpZihzdGF0ZSkge1xuXHRcdFx0XHRlbGVtLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBQcmV2ZW50IG1vZGFsIGZyb20gY29uZmxpY3Rpbmcgd2l0aCBzaG93LnNvbG8sIGFuZCBkb24ndCBoaWRlIGJhY2tkcm9wIGlzIG90aGVyIG1vZGFscyBhcmUgdmlzaWJsZVxuXHRcdFx0aWYoZWxlbS5pcygnOmFuaW1hdGVkJykgJiYgdmlzaWJsZSA9PT0gc3RhdGUgJiYgcHJldlN0YXRlICE9PSBGQUxTRSB8fCAhc3RhdGUgJiYgdmlzaWJsZU1vZGFscy5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIHNlbGY7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFN0b3AgYWxsIGFuaW1hdGlvbnNcblx0XHRcdGVsZW0uc3RvcChUUlVFLCBGQUxTRSk7XG5cblx0XHRcdC8vIFVzZSBjdXN0b20gZnVuY3Rpb24gaWYgcHJvdmlkZWRcblx0XHRcdGlmKCQuaXNGdW5jdGlvbihlZmZlY3QpKSB7XG5cdFx0XHRcdGVmZmVjdC5jYWxsKGVsZW0sIHN0YXRlKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgbm8gZWZmZWN0IHR5cGUgaXMgc3VwcGxpZWQsIHVzZSBhIHNpbXBsZSB0b2dnbGVcblx0XHRcdGVsc2UgaWYoZWZmZWN0ID09PSBGQUxTRSkge1xuXHRcdFx0XHRlbGVtWyB0eXBlIF0oKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVXNlIGJhc2ljIGZhZGUgZnVuY3Rpb25cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRlbGVtLmZhZGVUbyggcGFyc2VJbnQoZHVyYXRpb24sIDEwKSB8fCA5MCwgc3RhdGUgPyAxIDogMCwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYoIXN0YXRlKSB7IGVsZW0uaGlkZSgpOyB9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBSZXNldCBwb3NpdGlvbiBhbmQgZGV0YWNoIGZyb20gYm9keSBvbiBoaWRlXG5cdFx0XHRpZighc3RhdGUpIHtcblx0XHRcdFx0ZWxlbS5xdWV1ZShmdW5jdGlvbihuZXh0KSB7XG5cdFx0XHRcdFx0ZWxlbS5jc3MoeyBsZWZ0OiAnJywgdG9wOiAnJyB9KTtcblx0XHRcdFx0XHRpZighJChNT0RBTFNFTEVDVE9SKS5sZW5ndGgpIHsgZWxlbS5kZXRhY2goKTsgfVxuXHRcdFx0XHRcdG5leHQoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENhY2hlIHRoZSBzdGF0ZVxuXHRcdFx0cHJldlN0YXRlID0gc3RhdGU7XG5cblx0XHRcdC8vIElmIHRoZSB0b29sdGlwIGlzIGRlc3Ryb3llZCwgc2V0IHJlZmVyZW5jZSB0byBudWxsXG5cdFx0XHRpZihjdXJyZW50LmRlc3Ryb3llZCkgeyBjdXJyZW50ID0gTlVMTDsgfVxuXG5cdFx0XHRyZXR1cm4gc2VsZjtcblx0XHR9XG5cdH0pO1xuXG5cdHNlbGYuaW5pdCgpO1xufTtcbk9WRVJMQVkgPSBuZXcgT1ZFUkxBWSgpO1xuXG5mdW5jdGlvbiBNb2RhbChhcGksIG9wdGlvbnMpIHtcblx0dGhpcy5vcHRpb25zID0gb3B0aW9ucztcblx0dGhpcy5fbnMgPSAnLW1vZGFsJztcblxuXHR0aGlzLnF0aXAgPSBhcGk7XG5cdHRoaXMuaW5pdChhcGkpO1xufVxuXG4kLmV4dGVuZChNb2RhbC5wcm90b3R5cGUsIHtcblx0aW5pdDogZnVuY3Rpb24ocXRpcCkge1xuXHRcdHZhciB0b29sdGlwID0gcXRpcC50b29sdGlwO1xuXG5cdFx0Ly8gSWYgbW9kYWwgaXMgZGlzYWJsZWQuLi4gcmV0dXJuXG5cdFx0aWYoIXRoaXMub3B0aW9ucy5vbikgeyByZXR1cm4gdGhpczsgfVxuXG5cdFx0Ly8gU2V0IG92ZXJsYXkgcmVmZXJlbmNlXG5cdFx0cXRpcC5lbGVtZW50cy5vdmVybGF5ID0gT1ZFUkxBWS5lbGVtO1xuXG5cdFx0Ly8gQWRkIHVuaXF1ZSBhdHRyaWJ1dGUgc28gd2UgY2FuIGdyYWIgbW9kYWwgdG9vbHRpcHMgZWFzaWx5IHZpYSBhIFNFTEVDVE9SLCBhbmQgc2V0IHotaW5kZXhcblx0XHR0b29sdGlwLmFkZENsYXNzKE1PREFMQ0xBU1MpLmNzcygnei1pbmRleCcsIFFUSVAubW9kYWxfemluZGV4ICsgJChNT0RBTFNFTEVDVE9SKS5sZW5ndGgpO1xuXG5cdFx0Ly8gQXBwbHkgb3VyIHNob3cvaGlkZS9mb2N1cyBtb2RhbCBldmVudHNcblx0XHRxdGlwLl9iaW5kKHRvb2x0aXAsIFsndG9vbHRpcHNob3cnLCAndG9vbHRpcGhpZGUnXSwgZnVuY3Rpb24oZXZlbnQsIGFwaSwgZHVyYXRpb24pIHtcblx0XHRcdHZhciBvRXZlbnQgPSBldmVudC5vcmlnaW5hbEV2ZW50O1xuXG5cdFx0XHQvLyBNYWtlIHN1cmUgbW91c2VvdXQgZG9lc24ndCB0cmlnZ2VyIGEgaGlkZSB3aGVuIHNob3dpbmcgdGhlIG1vZGFsIGFuZCBtb3VzaW5nIG9udG8gYmFja2Ryb3Bcblx0XHRcdGlmKGV2ZW50LnRhcmdldCA9PT0gdG9vbHRpcFswXSkge1xuXHRcdFx0XHRpZihvRXZlbnQgJiYgZXZlbnQudHlwZSA9PT0gJ3Rvb2x0aXBoaWRlJyAmJiAvbW91c2UobGVhdmV8ZW50ZXIpLy50ZXN0KG9FdmVudC50eXBlKSAmJiAkKG9FdmVudC5yZWxhdGVkVGFyZ2V0KS5jbG9zZXN0KE9WRVJMQVkuZWxlbVswXSkubGVuZ3RoKSB7XG5cdFx0XHRcdFx0LyogZXNsaW50LWRpc2FibGUgbm8tZW1wdHkgKi9cblx0XHRcdFx0XHR0cnkgeyBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyB9XG5cdFx0XHRcdFx0Y2F0Y2goZSkge31cblx0XHRcdFx0XHQvKiBlc2xpbnQtZW5hYmxlIG5vLWVtcHR5ICovXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZighb0V2ZW50IHx8IG9FdmVudCAmJiBvRXZlbnQudHlwZSAhPT0gJ3Rvb2x0aXBzb2xvJykge1xuXHRcdFx0XHRcdHRoaXMudG9nZ2xlKGV2ZW50LCBldmVudC50eXBlID09PSAndG9vbHRpcHNob3cnLCBkdXJhdGlvbik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LCB0aGlzLl9ucywgdGhpcyk7XG5cblx0XHQvLyBBZGp1c3QgbW9kYWwgei1pbmRleCBvbiB0b29sdGlwIGZvY3VzXG5cdFx0cXRpcC5fYmluZCh0b29sdGlwLCAndG9vbHRpcGZvY3VzJywgZnVuY3Rpb24oZXZlbnQsIGFwaSkge1xuXHRcdFx0Ly8gSWYgZm9jdXMgd2FzIGNhbmNlbGxlZCBiZWZvcmUgaXQgcmVhY2hlZCB1cywgZG9uJ3QgZG8gYW55dGhpbmdcblx0XHRcdGlmKGV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpIHx8IGV2ZW50LnRhcmdldCAhPT0gdG9vbHRpcFswXSkgeyByZXR1cm47IH1cblxuXHRcdFx0dmFyIHF0aXBzID0gJChNT0RBTFNFTEVDVE9SKSxcblxuXHRcdFx0Ly8gS2VlcCB0aGUgbW9kYWwncyBsb3dlciB0aGFuIG90aGVyLCByZWd1bGFyIHF0aXBzXG5cdFx0XHRuZXdJbmRleCA9IFFUSVAubW9kYWxfemluZGV4ICsgcXRpcHMubGVuZ3RoLFxuXHRcdFx0Y3VySW5kZXggPSBwYXJzZUludCh0b29sdGlwWzBdLnN0eWxlLnpJbmRleCwgMTApO1xuXG5cdFx0XHQvLyBTZXQgb3ZlcmxheSB6LWluZGV4XG5cdFx0XHRPVkVSTEFZLmVsZW1bMF0uc3R5bGUuekluZGV4ID0gbmV3SW5kZXggLSAxO1xuXG5cdFx0XHQvLyBSZWR1Y2UgbW9kYWwgei1pbmRleCdzIGFuZCBrZWVwIHRoZW0gcHJvcGVybHkgb3JkZXJlZFxuXHRcdFx0cXRpcHMuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYodGhpcy5zdHlsZS56SW5kZXggPiBjdXJJbmRleCkge1xuXHRcdFx0XHRcdHRoaXMuc3R5bGUuekluZGV4IC09IDE7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBGaXJlIGJsdXIgZXZlbnQgZm9yIGZvY3VzZWQgdG9vbHRpcFxuXHRcdFx0cXRpcHMuZmlsdGVyKCcuJyArIENMQVNTX0ZPQ1VTKS5xdGlwKCdibHVyJywgZXZlbnQub3JpZ2luYWxFdmVudCk7XG5cblx0XHRcdC8vIFNldCB0aGUgbmV3IHotaW5kZXhcblx0XHRcdHRvb2x0aXAuYWRkQ2xhc3MoQ0xBU1NfRk9DVVMpWzBdLnN0eWxlLnpJbmRleCA9IG5ld0luZGV4O1xuXG5cdFx0XHQvLyBTZXQgY3VycmVudFxuXHRcdFx0T1ZFUkxBWS51cGRhdGUoYXBpKTtcblxuXHRcdFx0Ly8gUHJldmVudCBkZWZhdWx0IGhhbmRsaW5nXG5cdFx0XHQvKiBlc2xpbnQtZGlzYWJsZSBuby1lbXB0eSAqL1xuXHRcdFx0dHJ5IHsgZXZlbnQucHJldmVudERlZmF1bHQoKTsgfVxuXHRcdFx0Y2F0Y2goZSkge31cblx0XHRcdC8qIGVzbGludC1lbmFibGUgbm8tZW1wdHkgKi9cblx0XHR9LCB0aGlzLl9ucywgdGhpcyk7XG5cblx0XHQvLyBGb2N1cyBhbnkgb3RoZXIgdmlzaWJsZSBtb2RhbHMgd2hlbiB0aGlzIG9uZSBoaWRlc1xuXHRcdHF0aXAuX2JpbmQodG9vbHRpcCwgJ3Rvb2x0aXBoaWRlJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGlmKGV2ZW50LnRhcmdldCA9PT0gdG9vbHRpcFswXSkge1xuXHRcdFx0XHQkKE1PREFMU0VMRUNUT1IpLmZpbHRlcignOnZpc2libGUnKS5ub3QodG9vbHRpcCkubGFzdCgpLnF0aXAoJ2ZvY3VzJywgZXZlbnQpO1xuXHRcdFx0fVxuXHRcdH0sIHRoaXMuX25zLCB0aGlzKTtcblx0fSxcblxuXHR0b2dnbGU6IGZ1bmN0aW9uKGV2ZW50LCBzdGF0ZSwgZHVyYXRpb24pIHtcblx0XHQvLyBNYWtlIHN1cmUgZGVmYXVsdCBldmVudCBoYXNuJ3QgYmVlbiBwcmV2ZW50ZWRcblx0XHRpZihldmVudCAmJiBldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgeyByZXR1cm4gdGhpczsgfVxuXG5cdFx0Ly8gVG9nZ2xlIGl0XG5cdFx0T1ZFUkxBWS50b2dnbGUodGhpcy5xdGlwLCAhIXN0YXRlLCBkdXJhdGlvbik7XG5cdH0sXG5cblx0ZGVzdHJveTogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gUmVtb3ZlIG1vZGFsIGNsYXNzXG5cdFx0dGhpcy5xdGlwLnRvb2x0aXAucmVtb3ZlQ2xhc3MoTU9EQUxDTEFTUyk7XG5cblx0XHQvLyBSZW1vdmUgYm91bmQgZXZlbnRzXG5cdFx0dGhpcy5xdGlwLl91bmJpbmQodGhpcy5xdGlwLnRvb2x0aXAsIHRoaXMuX25zKTtcblxuXHRcdC8vIERlbGV0ZSBlbGVtZW50IHJlZmVyZW5jZVxuXHRcdE9WRVJMQVkudG9nZ2xlKHRoaXMucXRpcCwgRkFMU0UpO1xuXHRcdGRlbGV0ZSB0aGlzLnF0aXAuZWxlbWVudHMub3ZlcmxheTtcblx0fVxufSk7XG5cblxuTU9EQUwgPSBQTFVHSU5TLm1vZGFsID0gZnVuY3Rpb24oYXBpKSB7XG5cdHJldHVybiBuZXcgTW9kYWwoYXBpLCBhcGkub3B0aW9ucy5zaG93Lm1vZGFsKTtcbn07XG5cbi8vIFNldHVwIHNhbml0aXp0aW9uIHJ1bGVzXG5NT0RBTC5zYW5pdGl6ZSA9IGZ1bmN0aW9uKG9wdHMpIHtcblx0aWYob3B0cy5zaG93KSB7XG5cdFx0aWYodHlwZW9mIG9wdHMuc2hvdy5tb2RhbCAhPT0gJ29iamVjdCcpIHsgb3B0cy5zaG93Lm1vZGFsID0geyBvbjogISFvcHRzLnNob3cubW9kYWwgfTsgfVxuXHRcdGVsc2UgaWYodHlwZW9mIG9wdHMuc2hvdy5tb2RhbC5vbiA9PT0gJ3VuZGVmaW5lZCcpIHsgb3B0cy5zaG93Lm1vZGFsLm9uID0gVFJVRTsgfVxuXHR9XG59O1xuXG4vLyBCYXNlIHotaW5kZXggZm9yIGFsbCBtb2RhbCB0b29sdGlwcyAodXNlIHFUaXAgY29yZSB6LWluZGV4IGFzIGEgYmFzZSlcbi8qIGVzbGludC1kaXNhYmxlIGNhbWVsY2FzZSAqL1xuUVRJUC5tb2RhbF96aW5kZXggPSBRVElQLnppbmRleCAtIDIwMDtcbi8qIGVzbGludC1lbmFibGUgY2FtZWxjYXNlICovXG5cbi8vIFBsdWdpbiBuZWVkcyB0byBiZSBpbml0aWFsaXplZCBvbiByZW5kZXJcbk1PREFMLmluaXRpYWxpemUgPSAncmVuZGVyJztcblxuLy8gU2V0dXAgb3B0aW9uIHNldCBjaGVja3NcbkNIRUNLUy5tb2RhbCA9IHtcblx0J15zaG93Lm1vZGFsLihvbnxibHVyKSQnOiBmdW5jdGlvbigpIHtcblx0XHQvLyBJbml0aWFsaXNlXG5cdFx0dGhpcy5kZXN0cm95KCk7XG5cdFx0dGhpcy5pbml0KCk7XG5cblx0XHQvLyBTaG93IHRoZSBtb2RhbCBpZiBub3QgdmlzaWJsZSBhbHJlYWR5IGFuZCB0b29sdGlwIGlzIHZpc2libGVcblx0XHR0aGlzLnF0aXAuZWxlbXMub3ZlcmxheS50b2dnbGUoXG5cdFx0XHR0aGlzLnF0aXAudG9vbHRpcFswXS5vZmZzZXRXaWR0aCA+IDBcblx0XHQpO1xuXHR9XG59O1xuXG4vLyBFeHRlbmQgb3JpZ2luYWwgYXBpIGRlZmF1bHRzXG4kLmV4dGVuZChUUlVFLCBRVElQLmRlZmF1bHRzLCB7XG5cdHNob3c6IHtcblx0XHRtb2RhbDoge1xuXHRcdFx0b246IEZBTFNFLFxuXHRcdFx0ZWZmZWN0OiBUUlVFLFxuXHRcdFx0Ymx1cjogVFJVRSxcblx0XHRcdHN0ZWFsZm9jdXM6IFRSVUUsXG5cdFx0XHRlc2NhcGU6IFRSVUVcblx0XHR9XG5cdH1cbn0pO1xuO1BMVUdJTlMudmlld3BvcnQgPSBmdW5jdGlvbihhcGksIHBvc2l0aW9uLCBwb3NPcHRpb25zLCB0YXJnZXRXaWR0aCwgdGFyZ2V0SGVpZ2h0LCBlbGVtV2lkdGgsIGVsZW1IZWlnaHQpXG57XG5cdHZhciB0YXJnZXQgPSBwb3NPcHRpb25zLnRhcmdldCxcblx0XHR0b29sdGlwID0gYXBpLmVsZW1lbnRzLnRvb2x0aXAsXG5cdFx0bXkgPSBwb3NPcHRpb25zLm15LFxuXHRcdGF0ID0gcG9zT3B0aW9ucy5hdCxcblx0XHRhZGp1c3QgPSBwb3NPcHRpb25zLmFkanVzdCxcblx0XHRtZXRob2QgPSBhZGp1c3QubWV0aG9kLnNwbGl0KCcgJyksXG5cdFx0bWV0aG9kWCA9IG1ldGhvZFswXSxcblx0XHRtZXRob2RZID0gbWV0aG9kWzFdIHx8IG1ldGhvZFswXSxcblx0XHR2aWV3cG9ydCA9IHBvc09wdGlvbnMudmlld3BvcnQsXG5cdFx0Y29udGFpbmVyID0gcG9zT3B0aW9ucy5jb250YWluZXIsXG5cdFx0YWRqdXN0ZWQgPSB7IGxlZnQ6IDAsIHRvcDogMCB9LFxuXHRcdGZpeGVkLCBuZXdNeSwgY29udGFpbmVyT2Zmc2V0LCBjb250YWluZXJTdGF0aWMsXG5cdFx0dmlld3BvcnRXaWR0aCwgdmlld3BvcnRIZWlnaHQsIHZpZXdwb3J0U2Nyb2xsLCB2aWV3cG9ydE9mZnNldDtcblxuXHQvLyBJZiB2aWV3cG9ydCBpcyBub3QgYSBqUXVlcnkgZWxlbWVudCwgb3IgaXQncyB0aGUgd2luZG93L2RvY3VtZW50LCBvciBubyBhZGp1c3RtZW50IG1ldGhvZCBpcyB1c2VkLi4uIHJldHVyblxuXHRpZighdmlld3BvcnQuanF1ZXJ5IHx8IHRhcmdldFswXSA9PT0gd2luZG93IHx8IHRhcmdldFswXSA9PT0gZG9jdW1lbnQuYm9keSB8fCBhZGp1c3QubWV0aG9kID09PSAnbm9uZScpIHtcblx0XHRyZXR1cm4gYWRqdXN0ZWQ7XG5cdH1cblxuXHQvLyBDYWNoIGNvbnRhaW5lciBkZXRhaWxzXG5cdGNvbnRhaW5lck9mZnNldCA9IGNvbnRhaW5lci5vZmZzZXQoKSB8fCBhZGp1c3RlZDtcblx0Y29udGFpbmVyU3RhdGljID0gY29udGFpbmVyLmNzcygncG9zaXRpb24nKSA9PT0gJ3N0YXRpYyc7XG5cblx0Ly8gQ2FjaGUgb3VyIHZpZXdwb3J0IGRldGFpbHNcblx0Zml4ZWQgPSB0b29sdGlwLmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJztcblx0dmlld3BvcnRXaWR0aCA9IHZpZXdwb3J0WzBdID09PSB3aW5kb3cgPyB2aWV3cG9ydC53aWR0aCgpIDogdmlld3BvcnQub3V0ZXJXaWR0aChGQUxTRSk7XG5cdHZpZXdwb3J0SGVpZ2h0ID0gdmlld3BvcnRbMF0gPT09IHdpbmRvdyA/IHZpZXdwb3J0LmhlaWdodCgpIDogdmlld3BvcnQub3V0ZXJIZWlnaHQoRkFMU0UpO1xuXHR2aWV3cG9ydFNjcm9sbCA9IHsgbGVmdDogZml4ZWQgPyAwIDogdmlld3BvcnQuc2Nyb2xsTGVmdCgpLCB0b3A6IGZpeGVkID8gMCA6IHZpZXdwb3J0LnNjcm9sbFRvcCgpIH07XG5cdHZpZXdwb3J0T2Zmc2V0ID0gdmlld3BvcnQub2Zmc2V0KCkgfHwgYWRqdXN0ZWQ7XG5cblx0Ly8gR2VuZXJpYyBjYWxjdWxhdGlvbiBtZXRob2Rcblx0ZnVuY3Rpb24gY2FsY3VsYXRlKHNpZGUsIG90aGVyU2lkZSwgdHlwZSwgYWRqdXN0bWVudCwgc2lkZTEsIHNpZGUyLCBsZW5ndGhOYW1lLCB0YXJnZXRMZW5ndGgsIGVsZW1MZW5ndGgpIHtcblx0XHR2YXIgaW5pdGlhbFBvcyA9IHBvc2l0aW9uW3NpZGUxXSxcblx0XHRcdG15U2lkZSA9IG15W3NpZGVdLFxuXHRcdFx0YXRTaWRlID0gYXRbc2lkZV0sXG5cdFx0XHRpc1NoaWZ0ID0gdHlwZSA9PT0gU0hJRlQsXG5cdFx0XHRteUxlbmd0aCA9IG15U2lkZSA9PT0gc2lkZTEgPyBlbGVtTGVuZ3RoIDogbXlTaWRlID09PSBzaWRlMiA/IC1lbGVtTGVuZ3RoIDogLWVsZW1MZW5ndGggLyAyLFxuXHRcdFx0YXRMZW5ndGggPSBhdFNpZGUgPT09IHNpZGUxID8gdGFyZ2V0TGVuZ3RoIDogYXRTaWRlID09PSBzaWRlMiA/IC10YXJnZXRMZW5ndGggOiAtdGFyZ2V0TGVuZ3RoIC8gMixcblx0XHRcdHNpZGVPZmZzZXQgPSB2aWV3cG9ydFNjcm9sbFtzaWRlMV0gKyB2aWV3cG9ydE9mZnNldFtzaWRlMV0gLSAoY29udGFpbmVyU3RhdGljID8gMCA6IGNvbnRhaW5lck9mZnNldFtzaWRlMV0pLFxuXHRcdFx0b3ZlcmZsb3cxID0gc2lkZU9mZnNldCAtIGluaXRpYWxQb3MsXG5cdFx0XHRvdmVyZmxvdzIgPSBpbml0aWFsUG9zICsgZWxlbUxlbmd0aCAtIChsZW5ndGhOYW1lID09PSBXSURUSCA/IHZpZXdwb3J0V2lkdGggOiB2aWV3cG9ydEhlaWdodCkgLSBzaWRlT2Zmc2V0LFxuXHRcdFx0b2Zmc2V0ID0gbXlMZW5ndGggLSAobXkucHJlY2VkYW5jZSA9PT0gc2lkZSB8fCBteVNpZGUgPT09IG15W290aGVyU2lkZV0gPyBhdExlbmd0aCA6IDApIC0gKGF0U2lkZSA9PT0gQ0VOVEVSID8gdGFyZ2V0TGVuZ3RoIC8gMiA6IDApO1xuXG5cdFx0Ly8gc2hpZnRcblx0XHRpZihpc1NoaWZ0KSB7XG5cdFx0XHRvZmZzZXQgPSAobXlTaWRlID09PSBzaWRlMSA/IDEgOiAtMSkgKiBteUxlbmd0aDtcblxuXHRcdFx0Ly8gQWRqdXN0IHBvc2l0aW9uIGJ1dCBrZWVwIGl0IHdpdGhpbiB2aWV3cG9ydCBkaW1lbnNpb25zXG5cdFx0XHRwb3NpdGlvbltzaWRlMV0gKz0gb3ZlcmZsb3cxID4gMCA/IG92ZXJmbG93MSA6IG92ZXJmbG93MiA+IDAgPyAtb3ZlcmZsb3cyIDogMDtcblx0XHRcdHBvc2l0aW9uW3NpZGUxXSA9IE1hdGgubWF4KFxuXHRcdFx0XHQtY29udGFpbmVyT2Zmc2V0W3NpZGUxXSArIHZpZXdwb3J0T2Zmc2V0W3NpZGUxXSxcblx0XHRcdFx0aW5pdGlhbFBvcyAtIG9mZnNldCxcblx0XHRcdFx0TWF0aC5taW4oXG5cdFx0XHRcdFx0TWF0aC5tYXgoXG5cdFx0XHRcdFx0XHQtY29udGFpbmVyT2Zmc2V0W3NpZGUxXSArIHZpZXdwb3J0T2Zmc2V0W3NpZGUxXSArIChsZW5ndGhOYW1lID09PSBXSURUSCA/IHZpZXdwb3J0V2lkdGggOiB2aWV3cG9ydEhlaWdodCksXG5cdFx0XHRcdFx0XHRpbml0aWFsUG9zICsgb2Zmc2V0XG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRwb3NpdGlvbltzaWRlMV0sXG5cblx0XHRcdFx0XHQvLyBNYWtlIHN1cmUgd2UgZG9uJ3QgYWRqdXN0IGNvbXBsZXRlIG9mZiB0aGUgZWxlbWVudCB3aGVuIHVzaW5nICdjZW50ZXInXG5cdFx0XHRcdFx0bXlTaWRlID09PSAnY2VudGVyJyA/IGluaXRpYWxQb3MgLSBteUxlbmd0aCA6IDFFOVxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXG5cdFx0fVxuXG5cdFx0Ly8gZmxpcC9mbGlwaW52ZXJ0XG5cdFx0ZWxzZSB7XG5cdFx0XHQvLyBVcGRhdGUgYWRqdXN0bWVudCBhbW91bnQgZGVwZW5kaW5nIG9uIGlmIHVzaW5nIGZsaXBpbnZlcnQgb3IgZmxpcFxuXHRcdFx0YWRqdXN0bWVudCAqPSB0eXBlID09PSBGTElQSU5WRVJUID8gMiA6IDA7XG5cblx0XHRcdC8vIENoZWNrIGZvciBvdmVyZmxvdyBvbiB0aGUgbGVmdC90b3Bcblx0XHRcdGlmKG92ZXJmbG93MSA+IDAgJiYgKG15U2lkZSAhPT0gc2lkZTEgfHwgb3ZlcmZsb3cyID4gMCkpIHtcblx0XHRcdFx0cG9zaXRpb25bc2lkZTFdIC09IG9mZnNldCArIGFkanVzdG1lbnQ7XG5cdFx0XHRcdG5ld015LmludmVydChzaWRlLCBzaWRlMSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENoZWNrIGZvciBvdmVyZmxvdyBvbiB0aGUgYm90dG9tL3JpZ2h0XG5cdFx0XHRlbHNlIGlmKG92ZXJmbG93MiA+IDAgJiYgKG15U2lkZSAhPT0gc2lkZTIgfHwgb3ZlcmZsb3cxID4gMCkgICkge1xuXHRcdFx0XHRwb3NpdGlvbltzaWRlMV0gLT0gKG15U2lkZSA9PT0gQ0VOVEVSID8gLW9mZnNldCA6IG9mZnNldCkgKyBhZGp1c3RtZW50O1xuXHRcdFx0XHRuZXdNeS5pbnZlcnQoc2lkZSwgc2lkZTIpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBNYWtlIHN1cmUgd2UgaGF2ZW4ndCBtYWRlIHRoaW5ncyB3b3JzZSB3aXRoIHRoZSBhZGp1c3RtZW50IGFuZCByZXNldCBpZiBzb1xuXHRcdFx0aWYocG9zaXRpb25bc2lkZTFdIDwgdmlld3BvcnRTY3JvbGxbc2lkZTFdICYmIC1wb3NpdGlvbltzaWRlMV0gPiBvdmVyZmxvdzIpIHtcblx0XHRcdFx0cG9zaXRpb25bc2lkZTFdID0gaW5pdGlhbFBvczsgbmV3TXkgPSBteS5jbG9uZSgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBwb3NpdGlvbltzaWRlMV0gLSBpbml0aWFsUG9zO1xuXHR9XG5cblx0Ly8gU2V0IG5ld015IGlmIHVzaW5nIGZsaXAgb3IgZmxpcGludmVydCBtZXRob2RzXG5cdGlmKG1ldGhvZFggIT09ICdzaGlmdCcgfHwgbWV0aG9kWSAhPT0gJ3NoaWZ0JykgeyBuZXdNeSA9IG15LmNsb25lKCk7IH1cblxuXHQvLyBBZGp1c3QgcG9zaXRpb24gYmFzZWQgb252aWV3cG9ydCBhbmQgYWRqdXN0bWVudCBvcHRpb25zXG5cdGFkanVzdGVkID0ge1xuXHRcdGxlZnQ6IG1ldGhvZFggIT09ICdub25lJyA/IGNhbGN1bGF0ZSggWCwgWSwgbWV0aG9kWCwgYWRqdXN0LngsIExFRlQsIFJJR0hULCBXSURUSCwgdGFyZ2V0V2lkdGgsIGVsZW1XaWR0aCApIDogMCxcblx0XHR0b3A6IG1ldGhvZFkgIT09ICdub25lJyA/IGNhbGN1bGF0ZSggWSwgWCwgbWV0aG9kWSwgYWRqdXN0LnksIFRPUCwgQk9UVE9NLCBIRUlHSFQsIHRhcmdldEhlaWdodCwgZWxlbUhlaWdodCApIDogMCxcblx0XHRteTogbmV3TXlcblx0fTtcblxuXHRyZXR1cm4gYWRqdXN0ZWQ7XG59O1xuO1BMVUdJTlMucG9seXMgPSB7XG5cdC8vIFBPTFkgYXJlYSBjb29yZGluYXRlIGNhbGN1bGF0b3Jcblx0Ly9cdFNwZWNpYWwgdGhhbmtzIHRvIEVkIENyYWRvY2sgZm9yIGhlbHBpbmcgb3V0IHdpdGggdGhpcy5cblx0Ly9cdFVzZXMgYSBiaW5hcnkgc2VhcmNoIGFsZ29yaXRobSB0byBmaW5kIHN1aXRhYmxlIGNvb3JkaW5hdGVzLlxuXHRwb2x5Z29uOiBmdW5jdGlvbihiYXNlQ29vcmRzLCBjb3JuZXIpIHtcblx0XHR2YXIgcmVzdWx0ID0ge1xuXHRcdFx0d2lkdGg6IDAsIGhlaWdodDogMCxcblx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdHRvcDogMWUxMCwgcmlnaHQ6IDAsXG5cdFx0XHRcdGJvdHRvbTogMCwgbGVmdDogMWUxMFxuXHRcdFx0fSxcblx0XHRcdGFkanVzdGFibGU6IEZBTFNFXG5cdFx0fSxcblx0XHRpID0gMCwgbmV4dCxcblx0XHRjb29yZHMgPSBbXSxcblx0XHRjb21wYXJlWCA9IDEsIGNvbXBhcmVZID0gMSxcblx0XHRyZWFsWCA9IDAsIHJlYWxZID0gMCxcblx0XHRuZXdXaWR0aCwgbmV3SGVpZ2h0O1xuXG5cdFx0Ly8gRmlyc3QgcGFzcywgc2FuaXRpemUgY29vcmRzIGFuZCBkZXRlcm1pbmUgb3V0ZXIgZWRnZXNcblx0XHRpID0gYmFzZUNvb3Jkcy5sZW5ndGg7IFxuXHRcdHdoaWxlKGktLSkge1xuXHRcdFx0bmV4dCA9IFsgcGFyc2VJbnQoYmFzZUNvb3Jkc1stLWldLCAxMCksIHBhcnNlSW50KGJhc2VDb29yZHNbaSsxXSwgMTApIF07XG5cblx0XHRcdGlmKG5leHRbMF0gPiByZXN1bHQucG9zaXRpb24ucmlnaHQpeyByZXN1bHQucG9zaXRpb24ucmlnaHQgPSBuZXh0WzBdOyB9XG5cdFx0XHRpZihuZXh0WzBdIDwgcmVzdWx0LnBvc2l0aW9uLmxlZnQpeyByZXN1bHQucG9zaXRpb24ubGVmdCA9IG5leHRbMF07IH1cblx0XHRcdGlmKG5leHRbMV0gPiByZXN1bHQucG9zaXRpb24uYm90dG9tKXsgcmVzdWx0LnBvc2l0aW9uLmJvdHRvbSA9IG5leHRbMV07IH1cblx0XHRcdGlmKG5leHRbMV0gPCByZXN1bHQucG9zaXRpb24udG9wKXsgcmVzdWx0LnBvc2l0aW9uLnRvcCA9IG5leHRbMV07IH1cblxuXHRcdFx0Y29vcmRzLnB1c2gobmV4dCk7XG5cdFx0fVxuXG5cdFx0Ly8gQ2FsY3VsYXRlIGhlaWdodCBhbmQgd2lkdGggZnJvbSBvdXRlciBlZGdlc1xuXHRcdG5ld1dpZHRoID0gcmVzdWx0LndpZHRoID0gTWF0aC5hYnMocmVzdWx0LnBvc2l0aW9uLnJpZ2h0IC0gcmVzdWx0LnBvc2l0aW9uLmxlZnQpO1xuXHRcdG5ld0hlaWdodCA9IHJlc3VsdC5oZWlnaHQgPSBNYXRoLmFicyhyZXN1bHQucG9zaXRpb24uYm90dG9tIC0gcmVzdWx0LnBvc2l0aW9uLnRvcCk7XG5cblx0XHQvLyBJZiBpdCdzIHRoZSBjZW50ZXIgY29ybmVyLi4uXG5cdFx0aWYoY29ybmVyLmFiYnJldigpID09PSAnYycpIHtcblx0XHRcdHJlc3VsdC5wb3NpdGlvbiA9IHtcblx0XHRcdFx0bGVmdDogcmVzdWx0LnBvc2l0aW9uLmxlZnQgKyByZXN1bHQud2lkdGggLyAyLFxuXHRcdFx0XHR0b3A6IHJlc3VsdC5wb3NpdGlvbi50b3AgKyByZXN1bHQuaGVpZ2h0IC8gMlxuXHRcdFx0fTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHQvLyBTZWNvbmQgcGFzcywgdXNlIGEgYmluYXJ5IHNlYXJjaCBhbGdvcml0aG0gdG8gbG9jYXRlIG1vc3Qgc3VpdGFibGUgY29vcmRpbmF0ZVxuXHRcdFx0d2hpbGUobmV3V2lkdGggPiAwICYmIG5ld0hlaWdodCA+IDAgJiYgY29tcGFyZVggPiAwICYmIGNvbXBhcmVZID4gMClcblx0XHRcdHtcblx0XHRcdFx0bmV3V2lkdGggPSBNYXRoLmZsb29yKG5ld1dpZHRoIC8gMik7XG5cdFx0XHRcdG5ld0hlaWdodCA9IE1hdGguZmxvb3IobmV3SGVpZ2h0IC8gMik7XG5cblx0XHRcdFx0aWYoY29ybmVyLnggPT09IExFRlQpeyBjb21wYXJlWCA9IG5ld1dpZHRoOyB9XG5cdFx0XHRcdGVsc2UgaWYoY29ybmVyLnggPT09IFJJR0hUKXsgY29tcGFyZVggPSByZXN1bHQud2lkdGggLSBuZXdXaWR0aDsgfVxuXHRcdFx0XHRlbHNleyBjb21wYXJlWCArPSBNYXRoLmZsb29yKG5ld1dpZHRoIC8gMik7IH1cblxuXHRcdFx0XHRpZihjb3JuZXIueSA9PT0gVE9QKXsgY29tcGFyZVkgPSBuZXdIZWlnaHQ7IH1cblx0XHRcdFx0ZWxzZSBpZihjb3JuZXIueSA9PT0gQk9UVE9NKXsgY29tcGFyZVkgPSByZXN1bHQuaGVpZ2h0IC0gbmV3SGVpZ2h0OyB9XG5cdFx0XHRcdGVsc2V7IGNvbXBhcmVZICs9IE1hdGguZmxvb3IobmV3SGVpZ2h0IC8gMik7IH1cblxuXHRcdFx0XHRpID0gY29vcmRzLmxlbmd0aDtcblx0XHRcdFx0d2hpbGUoaS0tKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYoY29vcmRzLmxlbmd0aCA8IDIpeyBicmVhazsgfVxuXG5cdFx0XHRcdFx0cmVhbFggPSBjb29yZHNbaV1bMF0gLSByZXN1bHQucG9zaXRpb24ubGVmdDtcblx0XHRcdFx0XHRyZWFsWSA9IGNvb3Jkc1tpXVsxXSAtIHJlc3VsdC5wb3NpdGlvbi50b3A7XG5cblx0XHRcdFx0XHRpZihcblx0XHRcdFx0XHRcdGNvcm5lci54ID09PSBMRUZUICYmIHJlYWxYID49IGNvbXBhcmVYIHx8XG5cdFx0XHRcdFx0XHRjb3JuZXIueCA9PT0gUklHSFQgJiYgcmVhbFggPD0gY29tcGFyZVggfHxcblx0XHRcdFx0XHRcdGNvcm5lci54ID09PSBDRU5URVIgJiYgKHJlYWxYIDwgY29tcGFyZVggfHwgcmVhbFggPiByZXN1bHQud2lkdGggLSBjb21wYXJlWCkgfHxcblx0XHRcdFx0XHRcdGNvcm5lci55ID09PSBUT1AgJiYgcmVhbFkgPj0gY29tcGFyZVkgfHxcblx0XHRcdFx0XHRcdGNvcm5lci55ID09PSBCT1RUT00gJiYgcmVhbFkgPD0gY29tcGFyZVkgfHxcblx0XHRcdFx0XHRcdGNvcm5lci55ID09PSBDRU5URVIgJiYgKHJlYWxZIDwgY29tcGFyZVkgfHwgcmVhbFkgPiByZXN1bHQuaGVpZ2h0IC0gY29tcGFyZVkpKSB7XG5cdFx0XHRcdFx0XHRjb29yZHMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmVzdWx0LnBvc2l0aW9uID0geyBsZWZ0OiBjb29yZHNbMF1bMF0sIHRvcDogY29vcmRzWzBdWzFdIH07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHRyZWN0OiBmdW5jdGlvbihheCwgYXksIGJ4LCBieSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHR3aWR0aDogTWF0aC5hYnMoYnggLSBheCksXG5cdFx0XHRoZWlnaHQ6IE1hdGguYWJzKGJ5IC0gYXkpLFxuXHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0bGVmdDogTWF0aC5taW4oYXgsIGJ4KSxcblx0XHRcdFx0dG9wOiBNYXRoLm1pbihheSwgYnkpXG5cdFx0XHR9XG5cdFx0fTtcblx0fSxcblxuXHRfYW5nbGVzOiB7XG5cdFx0dGM6IDMgLyAyLCB0cjogNyAvIDQsIHRsOiA1IC8gNCxcblx0XHRiYzogMSAvIDIsIGJyOiAxIC8gNCwgYmw6IDMgLyA0LFxuXHRcdHJjOiAyLCBsYzogMSwgYzogMFxuXHR9LFxuXHRlbGxpcHNlOiBmdW5jdGlvbihjeCwgY3ksIHJ4LCByeSwgY29ybmVyKSB7XG5cdFx0dmFyIGMgPSBQTFVHSU5TLnBvbHlzLl9hbmdsZXNbIGNvcm5lci5hYmJyZXYoKSBdLFxuXHRcdFx0cnhjID0gYyA9PT0gMCA/IDAgOiByeCAqIE1hdGguY29zKCBjICogTWF0aC5QSSApLFxuXHRcdFx0cnlzID0gcnkgKiBNYXRoLnNpbiggYyAqIE1hdGguUEkgKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR3aWR0aDogcnggKiAyIC0gTWF0aC5hYnMocnhjKSxcblx0XHRcdGhlaWdodDogcnkgKiAyIC0gTWF0aC5hYnMocnlzKSxcblx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdGxlZnQ6IGN4ICsgcnhjLFxuXHRcdFx0XHR0b3A6IGN5ICsgcnlzXG5cdFx0XHR9LFxuXHRcdFx0YWRqdXN0YWJsZTogRkFMU0Vcblx0XHR9O1xuXHR9LFxuXHRjaXJjbGU6IGZ1bmN0aW9uKGN4LCBjeSwgciwgY29ybmVyKSB7XG5cdFx0cmV0dXJuIFBMVUdJTlMucG9seXMuZWxsaXBzZShjeCwgY3ksIHIsIHIsIGNvcm5lcik7XG5cdH1cbn07XG47UExVR0lOUy5zdmcgPSBmdW5jdGlvbihhcGksIHN2ZywgY29ybmVyKVxue1xuXHR2YXIgZWxlbSA9IHN2Z1swXSxcblx0XHRyb290ID0gJChlbGVtLm93bmVyU1ZHRWxlbWVudCksXG5cdFx0b3duZXJEb2N1bWVudCA9IGVsZW0ub3duZXJEb2N1bWVudCxcblx0XHRzdHJva2VXaWR0aDIgPSAocGFyc2VJbnQoc3ZnLmNzcygnc3Ryb2tlLXdpZHRoJyksIDEwKSB8fCAwKSAvIDIsXG5cdFx0ZnJhbWVPZmZzZXQsIG10eCwgdHJhbnNmb3JtZWQsXG5cdFx0bGVuLCBuZXh0LCBpLCBwb2ludHMsXG5cdFx0cmVzdWx0LCBwb3NpdGlvbjtcblxuXHQvLyBBc2NlbmQgdGhlIHBhcmVudE5vZGUgY2hhaW4gdW50aWwgd2UgZmluZCBhbiBlbGVtZW50IHdpdGggZ2V0QkJveCgpXG5cdHdoaWxlKCFlbGVtLmdldEJCb3gpIHsgZWxlbSA9IGVsZW0ucGFyZW50Tm9kZTsgfVxuXHRpZighZWxlbS5nZXRCQm94IHx8ICFlbGVtLnBhcmVudE5vZGUpIHsgcmV0dXJuIEZBTFNFOyB9XG5cblx0Ly8gRGV0ZXJtaW5lIHdoaWNoIHNoYXBlIGNhbGN1bGF0aW9uIHRvIHVzZVxuXHRzd2l0Y2goZWxlbS5ub2RlTmFtZSkge1xuXHRcdGNhc2UgJ2VsbGlwc2UnOlxuXHRcdGNhc2UgJ2NpcmNsZSc6XG5cdFx0XHRyZXN1bHQgPSBQTFVHSU5TLnBvbHlzLmVsbGlwc2UoXG5cdFx0XHRcdGVsZW0uY3guYmFzZVZhbC52YWx1ZSxcblx0XHRcdFx0ZWxlbS5jeS5iYXNlVmFsLnZhbHVlLFxuXHRcdFx0XHQoZWxlbS5yeCB8fCBlbGVtLnIpLmJhc2VWYWwudmFsdWUgKyBzdHJva2VXaWR0aDIsXG5cdFx0XHRcdChlbGVtLnJ5IHx8IGVsZW0ucikuYmFzZVZhbC52YWx1ZSArIHN0cm9rZVdpZHRoMixcblx0XHRcdFx0Y29ybmVyXG5cdFx0XHQpO1xuXHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSAnbGluZSc6XG5cdFx0Y2FzZSAncG9seWdvbic6XG5cdFx0Y2FzZSAncG9seWxpbmUnOlxuXHRcdFx0Ly8gRGV0ZXJtaW5lIHBvaW50cyBvYmplY3QgKGxpbmUgaGFzIG5vbmUsIHNvIG1pbWljIHVzaW5nIGFycmF5KVxuXHRcdFx0cG9pbnRzID0gZWxlbS5wb2ludHMgfHwgW1xuXHRcdFx0XHR7IHg6IGVsZW0ueDEuYmFzZVZhbC52YWx1ZSwgeTogZWxlbS55MS5iYXNlVmFsLnZhbHVlIH0sXG5cdFx0XHRcdHsgeDogZWxlbS54Mi5iYXNlVmFsLnZhbHVlLCB5OiBlbGVtLnkyLmJhc2VWYWwudmFsdWUgfVxuXHRcdFx0XTtcblxuXHRcdFx0Zm9yKHJlc3VsdCA9IFtdLCBpID0gLTEsIGxlbiA9IHBvaW50cy5udW1iZXJPZkl0ZW1zIHx8IHBvaW50cy5sZW5ndGg7ICsraSA8IGxlbjspIHtcblx0XHRcdFx0bmV4dCA9IHBvaW50cy5nZXRJdGVtID8gcG9pbnRzLmdldEl0ZW0oaSkgOiBwb2ludHNbaV07XG5cdFx0XHRcdHJlc3VsdC5wdXNoLmFwcGx5KHJlc3VsdCwgW25leHQueCwgbmV4dC55XSk7XG5cdFx0XHR9XG5cblx0XHRcdHJlc3VsdCA9IFBMVUdJTlMucG9seXMucG9seWdvbihyZXN1bHQsIGNvcm5lcik7XG5cdFx0YnJlYWs7XG5cblx0XHQvLyBVbmtub3duIHNoYXBlIG9yIHJlY3RhbmdsZT8gVXNlIGJvdW5kaW5nIGJveFxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXN1bHQgPSBlbGVtLmdldEJCb3goKTtcblx0XHRcdHJlc3VsdCA9IHtcblx0XHRcdFx0d2lkdGg6IHJlc3VsdC53aWR0aCxcblx0XHRcdFx0aGVpZ2h0OiByZXN1bHQuaGVpZ2h0LFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdGxlZnQ6IHJlc3VsdC54LFxuXHRcdFx0XHRcdHRvcDogcmVzdWx0Lnlcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRicmVhaztcblx0fVxuXG5cdC8vIFNob3J0Y3V0IGFzc2lnbm1lbnRzXG5cdHBvc2l0aW9uID0gcmVzdWx0LnBvc2l0aW9uO1xuXHRyb290ID0gcm9vdFswXTtcblxuXHQvLyBDb252ZXJ0IHBvc2l0aW9uIGludG8gYSBwaXhlbCB2YWx1ZVxuXHRpZihyb290LmNyZWF0ZVNWR1BvaW50KSB7XG5cdFx0bXR4ID0gZWxlbS5nZXRTY3JlZW5DVE0oKTtcblx0XHRwb2ludHMgPSByb290LmNyZWF0ZVNWR1BvaW50KCk7XG5cblx0XHRwb2ludHMueCA9IHBvc2l0aW9uLmxlZnQ7XG5cdFx0cG9pbnRzLnkgPSBwb3NpdGlvbi50b3A7XG5cdFx0dHJhbnNmb3JtZWQgPSBwb2ludHMubWF0cml4VHJhbnNmb3JtKCBtdHggKTtcblx0XHRwb3NpdGlvbi5sZWZ0ID0gdHJhbnNmb3JtZWQueDtcblx0XHRwb3NpdGlvbi50b3AgPSB0cmFuc2Zvcm1lZC55O1xuXHR9XG5cblx0Ly8gQ2hlY2sgdGhlIGVsZW1lbnQgaXMgbm90IGluIGEgY2hpbGQgZG9jdW1lbnQsIGFuZCBpZiBzbywgYWRqdXN0IGZvciBmcmFtZSBlbGVtZW50cyBvZmZzZXRcblx0aWYob3duZXJEb2N1bWVudCAhPT0gZG9jdW1lbnQgJiYgYXBpLnBvc2l0aW9uLnRhcmdldCAhPT0gJ21vdXNlJykge1xuXHRcdGZyYW1lT2Zmc2V0ID0gJCgob3duZXJEb2N1bWVudC5kZWZhdWx0VmlldyB8fCBvd25lckRvY3VtZW50LnBhcmVudFdpbmRvdykuZnJhbWVFbGVtZW50KS5vZmZzZXQoKTtcblx0XHRpZihmcmFtZU9mZnNldCkge1xuXHRcdFx0cG9zaXRpb24ubGVmdCArPSBmcmFtZU9mZnNldC5sZWZ0O1xuXHRcdFx0cG9zaXRpb24udG9wICs9IGZyYW1lT2Zmc2V0LnRvcDtcblx0XHR9XG5cdH1cblxuXHQvLyBBZGp1c3QgYnkgc2Nyb2xsIG9mZnNldCBvZiBvd25lciBkb2N1bWVudFxuXHRvd25lckRvY3VtZW50ID0gJChvd25lckRvY3VtZW50KTtcblx0cG9zaXRpb24ubGVmdCArPSBvd25lckRvY3VtZW50LnNjcm9sbExlZnQoKTtcblx0cG9zaXRpb24udG9wICs9IG93bmVyRG9jdW1lbnQuc2Nyb2xsVG9wKCk7XG5cblx0cmV0dXJuIHJlc3VsdDtcbn07XG47UExVR0lOUy5pbWFnZW1hcCA9IGZ1bmN0aW9uKGFwaSwgYXJlYSwgY29ybmVyKVxue1xuXHRpZighYXJlYS5qcXVlcnkpIHsgYXJlYSA9ICQoYXJlYSk7IH1cblxuXHR2YXIgc2hhcGUgPSAoYXJlYS5hdHRyKCdzaGFwZScpIHx8ICdyZWN0JykudG9Mb3dlckNhc2UoKS5yZXBsYWNlKCdwb2x5JywgJ3BvbHlnb24nKSxcblx0XHRpbWFnZSA9ICQoJ2ltZ1t1c2VtYXA9XCIjJythcmVhLnBhcmVudCgnbWFwJykuYXR0cignbmFtZScpKydcIl0nKSxcblx0XHRjb29yZHNTdHJpbmcgPSAkLnRyaW0oYXJlYS5hdHRyKCdjb29yZHMnKSksXG5cdFx0Y29vcmRzQXJyYXkgPSBjb29yZHNTdHJpbmcucmVwbGFjZSgvLCQvLCAnJykuc3BsaXQoJywnKSxcblx0XHRpbWFnZU9mZnNldCwgY29vcmRzLCBpLCByZXN1bHQsIGxlbjtcblxuXHQvLyBJZiB3ZSBjYW4ndCBmaW5kIHRoZSBpbWFnZSB1c2luZyB0aGUgbWFwLi4uXG5cdGlmKCFpbWFnZS5sZW5ndGgpIHsgcmV0dXJuIEZBTFNFOyB9XG5cblx0Ly8gUGFzcyBjb29yZGluYXRlcyBzdHJpbmcgaWYgcG9seWdvblxuXHRpZihzaGFwZSA9PT0gJ3BvbHlnb24nKSB7XG5cdFx0cmVzdWx0ID0gUExVR0lOUy5wb2x5cy5wb2x5Z29uKGNvb3Jkc0FycmF5LCBjb3JuZXIpO1xuXHR9XG5cblx0Ly8gT3RoZXJ3aXNlIHBhcnNlIHRoZSBjb29yZGluYXRlcyBhbmQgcGFzcyB0aGVtIGFzIGFyZ3VtZW50c1xuXHRlbHNlIGlmKFBMVUdJTlMucG9seXNbc2hhcGVdKSB7XG5cdFx0Zm9yKGkgPSAtMSwgbGVuID0gY29vcmRzQXJyYXkubGVuZ3RoLCBjb29yZHMgPSBbXTsgKytpIDwgbGVuOykge1xuXHRcdFx0Y29vcmRzLnB1c2goIHBhcnNlSW50KGNvb3Jkc0FycmF5W2ldLCAxMCkgKTtcblx0XHR9XG5cblx0XHRyZXN1bHQgPSBQTFVHSU5TLnBvbHlzW3NoYXBlXS5hcHBseShcblx0XHRcdHRoaXMsIGNvb3Jkcy5jb25jYXQoY29ybmVyKVxuXHRcdCk7XG5cdH1cblxuXHQvLyBJZiBubyBzaGFwcmUgY2FsY3VsYXRpb24gbWV0aG9kIHdhcyBmb3VuZCwgcmV0dXJuIGZhbHNlXG5cdGVsc2UgeyByZXR1cm4gRkFMU0U7IH1cblxuXHQvLyBNYWtlIHN1cmUgd2UgYWNjb3VudCBmb3IgcGFkZGluZyBhbmQgYm9yZGVycyBvbiB0aGUgaW1hZ2Vcblx0aW1hZ2VPZmZzZXQgPSBpbWFnZS5vZmZzZXQoKTtcblx0aW1hZ2VPZmZzZXQubGVmdCArPSBNYXRoLmNlaWwoKGltYWdlLm91dGVyV2lkdGgoRkFMU0UpIC0gaW1hZ2Uud2lkdGgoKSkgLyAyKTtcblx0aW1hZ2VPZmZzZXQudG9wICs9IE1hdGguY2VpbCgoaW1hZ2Uub3V0ZXJIZWlnaHQoRkFMU0UpIC0gaW1hZ2UuaGVpZ2h0KCkpIC8gMik7XG5cblx0Ly8gQWRkIGltYWdlIHBvc2l0aW9uIHRvIG9mZnNldCBjb29yZGluYXRlc1xuXHRyZXN1bHQucG9zaXRpb24ubGVmdCArPSBpbWFnZU9mZnNldC5sZWZ0O1xuXHRyZXN1bHQucG9zaXRpb24udG9wICs9IGltYWdlT2Zmc2V0LnRvcDtcblxuXHRyZXR1cm4gcmVzdWx0O1xufTtcbjt2YXIgSUU2LFxuXG4vKlxuICogQkdJRnJhbWUgYWRhcHRpb24gKGh0dHA6Ly9wbHVnaW5zLmpxdWVyeS5jb20vcHJvamVjdC9iZ2lmcmFtZSlcbiAqIFNwZWNpYWwgdGhhbmtzIHRvIEJyYW5kb24gQWFyb25cbiAqL1xuQkdJRlJBTUUgPSAnPGlmcmFtZSBjbGFzcz1cInF0aXAtYmdpZnJhbWVcIiBmcmFtZWJvcmRlcj1cIjBcIiB0YWJpbmRleD1cIi0xXCIgc3JjPVwiamF2YXNjcmlwdDpcXCdcXCc7XCIgJyArXG5cdCcgc3R5bGU9XCJkaXNwbGF5OmJsb2NrOyBwb3NpdGlvbjphYnNvbHV0ZTsgei1pbmRleDotMTsgZmlsdGVyOmFscGhhKG9wYWNpdHk9MCk7ICcgK1xuXHRcdCctbXMtZmlsdGVyOlwicHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LkFscGhhKE9wYWNpdHk9MClcIjtcIj48L2lmcmFtZT4nO1xuXG5mdW5jdGlvbiBJZTYoYXBpKSB7XG5cdHRoaXMuX25zID0gJ2llNic7XG5cblx0dGhpcy5xdGlwID0gYXBpO1xuXHR0aGlzLmluaXQoYXBpKTtcbn1cblxuJC5leHRlbmQoSWU2LnByb3RvdHlwZSwge1xuXHRfc2Nyb2xsIDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG92ZXJsYXkgPSB0aGlzLnF0aXAuZWxlbWVudHMub3ZlcmxheTtcblx0XHRvdmVybGF5ICYmIChvdmVybGF5WzBdLnN0eWxlLnRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKSArICdweCcpO1xuXHR9LFxuXG5cdGluaXQ6IGZ1bmN0aW9uKHF0aXApIHtcblx0XHR2YXIgdG9vbHRpcCA9IHF0aXAudG9vbHRpcDtcblxuXHRcdC8vIENyZWF0ZSB0aGUgQkdJRnJhbWUgZWxlbWVudCBpZiBuZWVkZWRcblx0XHRpZigkKCdzZWxlY3QsIG9iamVjdCcpLmxlbmd0aCA8IDEpIHtcblx0XHRcdHRoaXMuYmdpZnJhbWUgPSBxdGlwLmVsZW1lbnRzLmJnaWZyYW1lID0gJChCR0lGUkFNRSkuYXBwZW5kVG8odG9vbHRpcCk7XG5cblx0XHRcdC8vIFVwZGF0ZSBCR0lGcmFtZSBvbiB0b29sdGlwIG1vdmVcblx0XHRcdHF0aXAuX2JpbmQodG9vbHRpcCwgJ3Rvb2x0aXBtb3ZlJywgdGhpcy5hZGp1c3RCR0lGcmFtZSwgdGhpcy5fbnMsIHRoaXMpO1xuXHRcdH1cblxuXHRcdC8vIHJlZHJhdygpIGNvbnRhaW5lciBmb3Igd2lkdGgvaGVpZ2h0IGNhbGN1bGF0aW9uc1xuXHRcdHRoaXMucmVkcmF3Q29udGFpbmVyID0gJCgnPGRpdi8+JywgeyBpZDogTkFNRVNQQUNFKyctcmNvbnRhaW5lcicgfSlcblx0XHRcdC5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KTtcblxuXHRcdC8vIEZpeHVwIG1vZGFsIHBsdWdpbiBpZiBwcmVzZW50IHRvb1xuXHRcdGlmKCBxdGlwLmVsZW1lbnRzLm92ZXJsYXkgJiYgcXRpcC5lbGVtZW50cy5vdmVybGF5LmFkZENsYXNzKCdxdGlwbW9kYWwtaWU2Zml4JykgKSB7XG5cdFx0XHRxdGlwLl9iaW5kKHdpbmRvdywgWydzY3JvbGwnLCAncmVzaXplJ10sIHRoaXMuX3Njcm9sbCwgdGhpcy5fbnMsIHRoaXMpO1xuXHRcdFx0cXRpcC5fYmluZCh0b29sdGlwLCBbJ3Rvb2x0aXBzaG93J10sIHRoaXMuX3Njcm9sbCwgdGhpcy5fbnMsIHRoaXMpO1xuXHRcdH1cblxuXHRcdC8vIFNldCBkaW1lbnNpb25zXG5cdFx0dGhpcy5yZWRyYXcoKTtcblx0fSxcblxuXHRhZGp1c3RCR0lGcmFtZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHRvb2x0aXAgPSB0aGlzLnF0aXAudG9vbHRpcCxcblx0XHRcdGRpbWVuc2lvbnMgPSB7XG5cdFx0XHRcdGhlaWdodDogdG9vbHRpcC5vdXRlckhlaWdodChGQUxTRSksXG5cdFx0XHRcdHdpZHRoOiB0b29sdGlwLm91dGVyV2lkdGgoRkFMU0UpXG5cdFx0XHR9LFxuXHRcdFx0cGx1Z2luID0gdGhpcy5xdGlwLnBsdWdpbnMudGlwLFxuXHRcdFx0dGlwID0gdGhpcy5xdGlwLmVsZW1lbnRzLnRpcCxcblx0XHRcdHRpcEFkanVzdCwgb2Zmc2V0O1xuXG5cdFx0Ly8gQWRqdXN0IGJvcmRlciBvZmZzZXRcblx0XHRvZmZzZXQgPSBwYXJzZUludCh0b29sdGlwLmNzcygnYm9yZGVyTGVmdFdpZHRoJyksIDEwKSB8fCAwO1xuXHRcdG9mZnNldCA9IHsgbGVmdDogLW9mZnNldCwgdG9wOiAtb2Zmc2V0IH07XG5cblx0XHQvLyBBZGp1c3QgZm9yIHRpcHMgcGx1Z2luXG5cdFx0aWYocGx1Z2luICYmIHRpcCkge1xuXHRcdFx0dGlwQWRqdXN0ID0gcGx1Z2luLmNvcm5lci5wcmVjZWRhbmNlID09PSAneCcgPyBbV0lEVEgsIExFRlRdIDogW0hFSUdIVCwgVE9QXTtcblx0XHRcdG9mZnNldFsgdGlwQWRqdXN0WzFdIF0gLT0gdGlwWyB0aXBBZGp1c3RbMF0gXSgpO1xuXHRcdH1cblxuXHRcdC8vIFVwZGF0ZSBiZ2lmcmFtZVxuXHRcdHRoaXMuYmdpZnJhbWUuY3NzKG9mZnNldCkuY3NzKGRpbWVuc2lvbnMpO1xuXHR9LFxuXG5cdC8vIE1heC9taW4gd2lkdGggc2ltdWxhdG9yIGZ1bmN0aW9uXG5cdHJlZHJhdzogZnVuY3Rpb24oKSB7XG5cdFx0aWYodGhpcy5xdGlwLnJlbmRlcmVkIDwgMSB8fCB0aGlzLmRyYXdpbmcpIHsgcmV0dXJuIHRoaXM7IH1cblxuXHRcdHZhciB0b29sdGlwID0gdGhpcy5xdGlwLnRvb2x0aXAsXG5cdFx0XHRzdHlsZSA9IHRoaXMucXRpcC5vcHRpb25zLnN0eWxlLFxuXHRcdFx0Y29udGFpbmVyID0gdGhpcy5xdGlwLm9wdGlvbnMucG9zaXRpb24uY29udGFpbmVyLFxuXHRcdFx0cGVyYywgd2lkdGgsIG1heCwgbWluO1xuXG5cdFx0Ly8gU2V0IGRyYXdpbmcgZmxhZ1xuXHRcdHRoaXMucXRpcC5kcmF3aW5nID0gMTtcblxuXHRcdC8vIElmIHRvb2x0aXAgaGFzIGEgc2V0IGhlaWdodC93aWR0aCwganVzdCBzZXQgaXQuLi4gbGlrZSBhIGJvc3MhXG5cdFx0aWYoc3R5bGUuaGVpZ2h0KSB7IHRvb2x0aXAuY3NzKEhFSUdIVCwgc3R5bGUuaGVpZ2h0KTsgfVxuXHRcdGlmKHN0eWxlLndpZHRoKSB7IHRvb2x0aXAuY3NzKFdJRFRILCBzdHlsZS53aWR0aCk7IH1cblxuXHRcdC8vIFNpbXVsYXRlIG1heC9taW4gd2lkdGggaWYgbm90IHNldCB3aWR0aCBwcmVzZW50Li4uXG5cdFx0ZWxzZSB7XG5cdFx0XHQvLyBSZXNldCB3aWR0aCBhbmQgYWRkIGZsdWlkIGNsYXNzXG5cdFx0XHR0b29sdGlwLmNzcyhXSURUSCwgJycpLmFwcGVuZFRvKHRoaXMucmVkcmF3Q29udGFpbmVyKTtcblxuXHRcdFx0Ly8gR3JhYiBvdXIgdG9vbHRpcCB3aWR0aCAoYWRkIDEgaWYgb2RkIHNvIHdlIGRvbid0IGdldCB3cmFwcGluZyBwcm9ibGVtcy4uIGh1enphaCEpXG5cdFx0XHR3aWR0aCA9IHRvb2x0aXAud2lkdGgoKTtcblx0XHRcdGlmKHdpZHRoICUgMiA8IDEpIHsgd2lkdGggKz0gMTsgfVxuXG5cdFx0XHQvLyBHcmFiIG91ciBtYXgvbWluIHByb3BlcnRpZXNcblx0XHRcdG1heCA9IHRvb2x0aXAuY3NzKCdtYXhXaWR0aCcpIHx8ICcnO1xuXHRcdFx0bWluID0gdG9vbHRpcC5jc3MoJ21pbldpZHRoJykgfHwgJyc7XG5cblx0XHRcdC8vIFBhcnNlIGludG8gcHJvcGVyIHBpeGVsIHZhbHVlc1xuXHRcdFx0cGVyYyA9IChtYXggKyBtaW4pLmluZGV4T2YoJyUnKSA+IC0xID8gY29udGFpbmVyLndpZHRoKCkgLyAxMDAgOiAwO1xuXHRcdFx0bWF4ID0gKG1heC5pbmRleE9mKCclJykgPiAtMSA/IHBlcmMgOiAxICogcGFyc2VJbnQobWF4LCAxMCkpIHx8IHdpZHRoO1xuXHRcdFx0bWluID0gKG1pbi5pbmRleE9mKCclJykgPiAtMSA/IHBlcmMgOiAxICogcGFyc2VJbnQobWluLCAxMCkpIHx8IDA7XG5cblx0XHRcdC8vIERldGVybWluZSBuZXcgZGltZW5zaW9uIHNpemUgYmFzZWQgb24gbWF4L21pbi9jdXJyZW50IHZhbHVlc1xuXHRcdFx0d2lkdGggPSBtYXggKyBtaW4gPyBNYXRoLm1pbihNYXRoLm1heCh3aWR0aCwgbWluKSwgbWF4KSA6IHdpZHRoO1xuXG5cdFx0XHQvLyBTZXQgdGhlIG5ld2x5IGNhbGN1bGF0ZWQgd2lkdGggYW5kIHJlbXZvZSBmbHVpZCBjbGFzc1xuXHRcdFx0dG9vbHRpcC5jc3MoV0lEVEgsIE1hdGgucm91bmQod2lkdGgpKS5hcHBlbmRUbyhjb250YWluZXIpO1xuXHRcdH1cblxuXHRcdC8vIFNldCBkcmF3aW5nIGZsYWdcblx0XHR0aGlzLmRyYXdpbmcgPSAwO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0ZGVzdHJveTogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gUmVtb3ZlIGlmcmFtZVxuXHRcdHRoaXMuYmdpZnJhbWUgJiYgdGhpcy5iZ2lmcmFtZS5yZW1vdmUoKTtcblxuXHRcdC8vIFJlbW92ZSBib3VuZCBldmVudHNcblx0XHR0aGlzLnF0aXAuX3VuYmluZChbd2luZG93LCB0aGlzLnF0aXAudG9vbHRpcF0sIHRoaXMuX25zKTtcblx0fVxufSk7XG5cbklFNiA9IFBMVUdJTlMuaWU2ID0gZnVuY3Rpb24oYXBpKSB7XG5cdC8vIFByb2NlZWQgb25seSBpZiB0aGUgYnJvd3NlciBpcyBJRTZcblx0cmV0dXJuIEJST1dTRVIuaWUgPT09IDYgPyBuZXcgSWU2KGFwaSkgOiBGQUxTRTtcbn07XG5cbklFNi5pbml0aWFsaXplID0gJ3JlbmRlcic7XG5cbkNIRUNLUy5pZTYgPSB7XG5cdCdeY29udGVudHxzdHlsZSQnOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnJlZHJhdygpO1xuXHR9XG59O1xuO30pKTtcbn0oIHdpbmRvdywgZG9jdW1lbnQgKSk7XG4iLCIvKiFcbiogc2NyZWVuZnVsbFxuKiB2NS4wLjIgLSAyMDIwLTAyLTEzXG4qIChjKSBTaW5kcmUgU29yaHVzOyBNSVQgTGljZW5zZVxuKi9cbihmdW5jdGlvbiAoKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgZG9jdW1lbnQgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93LmRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5kb2N1bWVudCA6IHt9O1xuXHR2YXIgaXNDb21tb25qcyA9IHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzO1xuXG5cdHZhciBmbiA9IChmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHZhbDtcblxuXHRcdHZhciBmbk1hcCA9IFtcblx0XHRcdFtcblx0XHRcdFx0J3JlcXVlc3RGdWxsc2NyZWVuJyxcblx0XHRcdFx0J2V4aXRGdWxsc2NyZWVuJyxcblx0XHRcdFx0J2Z1bGxzY3JlZW5FbGVtZW50Jyxcblx0XHRcdFx0J2Z1bGxzY3JlZW5FbmFibGVkJyxcblx0XHRcdFx0J2Z1bGxzY3JlZW5jaGFuZ2UnLFxuXHRcdFx0XHQnZnVsbHNjcmVlbmVycm9yJ1xuXHRcdFx0XSxcblx0XHRcdC8vIE5ldyBXZWJLaXRcblx0XHRcdFtcblx0XHRcdFx0J3dlYmtpdFJlcXVlc3RGdWxsc2NyZWVuJyxcblx0XHRcdFx0J3dlYmtpdEV4aXRGdWxsc2NyZWVuJyxcblx0XHRcdFx0J3dlYmtpdEZ1bGxzY3JlZW5FbGVtZW50Jyxcblx0XHRcdFx0J3dlYmtpdEZ1bGxzY3JlZW5FbmFibGVkJyxcblx0XHRcdFx0J3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UnLFxuXHRcdFx0XHQnd2Via2l0ZnVsbHNjcmVlbmVycm9yJ1xuXG5cdFx0XHRdLFxuXHRcdFx0Ly8gT2xkIFdlYktpdFxuXHRcdFx0W1xuXHRcdFx0XHQnd2Via2l0UmVxdWVzdEZ1bGxTY3JlZW4nLFxuXHRcdFx0XHQnd2Via2l0Q2FuY2VsRnVsbFNjcmVlbicsXG5cdFx0XHRcdCd3ZWJraXRDdXJyZW50RnVsbFNjcmVlbkVsZW1lbnQnLFxuXHRcdFx0XHQnd2Via2l0Q2FuY2VsRnVsbFNjcmVlbicsXG5cdFx0XHRcdCd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJyxcblx0XHRcdFx0J3dlYmtpdGZ1bGxzY3JlZW5lcnJvcidcblxuXHRcdFx0XSxcblx0XHRcdFtcblx0XHRcdFx0J21velJlcXVlc3RGdWxsU2NyZWVuJyxcblx0XHRcdFx0J21vekNhbmNlbEZ1bGxTY3JlZW4nLFxuXHRcdFx0XHQnbW96RnVsbFNjcmVlbkVsZW1lbnQnLFxuXHRcdFx0XHQnbW96RnVsbFNjcmVlbkVuYWJsZWQnLFxuXHRcdFx0XHQnbW96ZnVsbHNjcmVlbmNoYW5nZScsXG5cdFx0XHRcdCdtb3pmdWxsc2NyZWVuZXJyb3InXG5cdFx0XHRdLFxuXHRcdFx0W1xuXHRcdFx0XHQnbXNSZXF1ZXN0RnVsbHNjcmVlbicsXG5cdFx0XHRcdCdtc0V4aXRGdWxsc2NyZWVuJyxcblx0XHRcdFx0J21zRnVsbHNjcmVlbkVsZW1lbnQnLFxuXHRcdFx0XHQnbXNGdWxsc2NyZWVuRW5hYmxlZCcsXG5cdFx0XHRcdCdNU0Z1bGxzY3JlZW5DaGFuZ2UnLFxuXHRcdFx0XHQnTVNGdWxsc2NyZWVuRXJyb3InXG5cdFx0XHRdXG5cdFx0XTtcblxuXHRcdHZhciBpID0gMDtcblx0XHR2YXIgbCA9IGZuTWFwLmxlbmd0aDtcblx0XHR2YXIgcmV0ID0ge307XG5cblx0XHRmb3IgKDsgaSA8IGw7IGkrKykge1xuXHRcdFx0dmFsID0gZm5NYXBbaV07XG5cdFx0XHRpZiAodmFsICYmIHZhbFsxXSBpbiBkb2N1bWVudCkge1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgdmFsLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0cmV0W2ZuTWFwWzBdW2ldXSA9IHZhbFtpXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gcmV0O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSkoKTtcblxuXHR2YXIgZXZlbnROYW1lTWFwID0ge1xuXHRcdGNoYW5nZTogZm4uZnVsbHNjcmVlbmNoYW5nZSxcblx0XHRlcnJvcjogZm4uZnVsbHNjcmVlbmVycm9yXG5cdH07XG5cblx0dmFyIHNjcmVlbmZ1bGwgPSB7XG5cdFx0cmVxdWVzdDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0XHRcdHZhciBvbkZ1bGxTY3JlZW5FbnRlcmVkID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHRoaXMub2ZmKCdjaGFuZ2UnLCBvbkZ1bGxTY3JlZW5FbnRlcmVkKTtcblx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdH0uYmluZCh0aGlzKTtcblxuXHRcdFx0XHR0aGlzLm9uKCdjaGFuZ2UnLCBvbkZ1bGxTY3JlZW5FbnRlcmVkKTtcblxuXHRcdFx0XHRlbGVtZW50ID0gZWxlbWVudCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cblx0XHRcdFx0dmFyIHJldHVyblByb21pc2UgPSBlbGVtZW50W2ZuLnJlcXVlc3RGdWxsc2NyZWVuXSgpO1xuXG5cdFx0XHRcdGlmIChyZXR1cm5Qcm9taXNlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuXHRcdFx0XHRcdHJldHVyblByb21pc2UudGhlbihvbkZ1bGxTY3JlZW5FbnRlcmVkKS5jYXRjaChyZWplY3QpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LmJpbmQodGhpcykpO1xuXHRcdH0sXG5cdFx0ZXhpdDogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0XHRcdFx0aWYgKCF0aGlzLmlzRnVsbHNjcmVlbikge1xuXHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR2YXIgb25GdWxsU2NyZWVuRXhpdCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR0aGlzLm9mZignY2hhbmdlJywgb25GdWxsU2NyZWVuRXhpdCk7XG5cdFx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0XHR9LmJpbmQodGhpcyk7XG5cblx0XHRcdFx0dGhpcy5vbignY2hhbmdlJywgb25GdWxsU2NyZWVuRXhpdCk7XG5cblx0XHRcdFx0dmFyIHJldHVyblByb21pc2UgPSBkb2N1bWVudFtmbi5leGl0RnVsbHNjcmVlbl0oKTtcblxuXHRcdFx0XHRpZiAocmV0dXJuUHJvbWlzZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcblx0XHRcdFx0XHRyZXR1cm5Qcm9taXNlLnRoZW4ob25GdWxsU2NyZWVuRXhpdCkuY2F0Y2gocmVqZWN0KTtcblx0XHRcdFx0fVxuXHRcdFx0fS5iaW5kKHRoaXMpKTtcblx0XHR9LFxuXHRcdHRvZ2dsZTogZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdHJldHVybiB0aGlzLmlzRnVsbHNjcmVlbiA/IHRoaXMuZXhpdCgpIDogdGhpcy5yZXF1ZXN0KGVsZW1lbnQpO1xuXHRcdH0sXG5cdFx0b25jaGFuZ2U6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuXHRcdFx0dGhpcy5vbignY2hhbmdlJywgY2FsbGJhY2spO1xuXHRcdH0sXG5cdFx0b25lcnJvcjogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG5cdFx0XHR0aGlzLm9uKCdlcnJvcicsIGNhbGxiYWNrKTtcblx0XHR9LFxuXHRcdG9uOiBmdW5jdGlvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG5cdFx0XHR2YXIgZXZlbnROYW1lID0gZXZlbnROYW1lTWFwW2V2ZW50XTtcblx0XHRcdGlmIChldmVudE5hbWUpIHtcblx0XHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrLCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRvZmY6IGZ1bmN0aW9uIChldmVudCwgY2FsbGJhY2spIHtcblx0XHRcdHZhciBldmVudE5hbWUgPSBldmVudE5hbWVNYXBbZXZlbnRdO1xuXHRcdFx0aWYgKGV2ZW50TmFtZSkge1xuXHRcdFx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2ssIGZhbHNlKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHJhdzogZm5cblx0fTtcblxuXHRpZiAoIWZuKSB7XG5cdFx0aWYgKGlzQ29tbW9uanMpIHtcblx0XHRcdG1vZHVsZS5leHBvcnRzID0ge2lzRW5hYmxlZDogZmFsc2V9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR3aW5kb3cuc2NyZWVuZnVsbCA9IHtpc0VuYWJsZWQ6IGZhbHNlfTtcblx0XHR9XG5cblx0XHRyZXR1cm47XG5cdH1cblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyhzY3JlZW5mdWxsLCB7XG5cdFx0aXNGdWxsc2NyZWVuOiB7XG5cdFx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIEJvb2xlYW4oZG9jdW1lbnRbZm4uZnVsbHNjcmVlbkVsZW1lbnRdKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGVsZW1lbnQ6IHtcblx0XHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIGRvY3VtZW50W2ZuLmZ1bGxzY3JlZW5FbGVtZW50XTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGlzRW5hYmxlZDoge1xuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQvLyBDb2VyY2UgdG8gYm9vbGVhbiBpbiBjYXNlIG9mIG9sZCBXZWJLaXRcblx0XHRcdFx0cmV0dXJuIEJvb2xlYW4oZG9jdW1lbnRbZm4uZnVsbHNjcmVlbkVuYWJsZWRdKTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXG5cdGlmIChpc0NvbW1vbmpzKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBzY3JlZW5mdWxsO1xuXHR9IGVsc2Uge1xuXHRcdHdpbmRvdy5zY3JlZW5mdWxsID0gc2NyZWVuZnVsbDtcblx0fVxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIGNyeXB0ID0gcmVxdWlyZSgnY3J5cHQnKSxcbiAgICAgIHV0ZjggPSByZXF1aXJlKCdjaGFyZW5jJykudXRmOCxcbiAgICAgIGJpbiA9IHJlcXVpcmUoJ2NoYXJlbmMnKS5iaW4sXG5cbiAgLy8gVGhlIGNvcmVcbiAgc2hhMSA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgLy8gQ29udmVydCB0byBieXRlIGFycmF5XG4gICAgaWYgKG1lc3NhZ2UuY29uc3RydWN0b3IgPT0gU3RyaW5nKVxuICAgICAgbWVzc2FnZSA9IHV0Zjguc3RyaW5nVG9CeXRlcyhtZXNzYWdlKTtcbiAgICBlbHNlIGlmICh0eXBlb2YgQnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgQnVmZmVyLmlzQnVmZmVyID09ICdmdW5jdGlvbicgJiYgQnVmZmVyLmlzQnVmZmVyKG1lc3NhZ2UpKVxuICAgICAgbWVzc2FnZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG1lc3NhZ2UsIDApO1xuICAgIGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KG1lc3NhZ2UpKVxuICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UudG9TdHJpbmcoKTtcblxuICAgIC8vIG90aGVyd2lzZSBhc3N1bWUgYnl0ZSBhcnJheVxuXG4gICAgdmFyIG0gID0gY3J5cHQuYnl0ZXNUb1dvcmRzKG1lc3NhZ2UpLFxuICAgICAgICBsICA9IG1lc3NhZ2UubGVuZ3RoICogOCxcbiAgICAgICAgdyAgPSBbXSxcbiAgICAgICAgSDAgPSAgMTczMjU4NDE5MyxcbiAgICAgICAgSDEgPSAtMjcxNzMzODc5LFxuICAgICAgICBIMiA9IC0xNzMyNTg0MTk0LFxuICAgICAgICBIMyA9ICAyNzE3MzM4NzgsXG4gICAgICAgIEg0ID0gLTEwMDk1ODk3NzY7XG5cbiAgICAvLyBQYWRkaW5nXG4gICAgbVtsID4+IDVdIHw9IDB4ODAgPDwgKDI0IC0gbCAlIDMyKTtcbiAgICBtWygobCArIDY0ID4+PiA5KSA8PCA0KSArIDE1XSA9IGw7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG0ubGVuZ3RoOyBpICs9IDE2KSB7XG4gICAgICB2YXIgYSA9IEgwLFxuICAgICAgICAgIGIgPSBIMSxcbiAgICAgICAgICBjID0gSDIsXG4gICAgICAgICAgZCA9IEgzLFxuICAgICAgICAgIGUgPSBINDtcblxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCA4MDsgaisrKSB7XG5cbiAgICAgICAgaWYgKGogPCAxNilcbiAgICAgICAgICB3W2pdID0gbVtpICsgal07XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHZhciBuID0gd1tqIC0gM10gXiB3W2ogLSA4XSBeIHdbaiAtIDE0XSBeIHdbaiAtIDE2XTtcbiAgICAgICAgICB3W2pdID0gKG4gPDwgMSkgfCAobiA+Pj4gMzEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHQgPSAoKEgwIDw8IDUpIHwgKEgwID4+PiAyNykpICsgSDQgKyAod1tqXSA+Pj4gMCkgKyAoXG4gICAgICAgICAgICAgICAgaiA8IDIwID8gKEgxICYgSDIgfCB+SDEgJiBIMykgKyAxNTE4NTAwMjQ5IDpcbiAgICAgICAgICAgICAgICBqIDwgNDAgPyAoSDEgXiBIMiBeIEgzKSArIDE4NTk3NzUzOTMgOlxuICAgICAgICAgICAgICAgIGogPCA2MCA/IChIMSAmIEgyIHwgSDEgJiBIMyB8IEgyICYgSDMpIC0gMTg5NDAwNzU4OCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgKEgxIF4gSDIgXiBIMykgLSA4OTk0OTc1MTQpO1xuXG4gICAgICAgIEg0ID0gSDM7XG4gICAgICAgIEgzID0gSDI7XG4gICAgICAgIEgyID0gKEgxIDw8IDMwKSB8IChIMSA+Pj4gMik7XG4gICAgICAgIEgxID0gSDA7XG4gICAgICAgIEgwID0gdDtcbiAgICAgIH1cblxuICAgICAgSDAgKz0gYTtcbiAgICAgIEgxICs9IGI7XG4gICAgICBIMiArPSBjO1xuICAgICAgSDMgKz0gZDtcbiAgICAgIEg0ICs9IGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtIMCwgSDEsIEgyLCBIMywgSDRdO1xuICB9LFxuXG4gIC8vIFB1YmxpYyBBUElcbiAgYXBpID0gZnVuY3Rpb24gKG1lc3NhZ2UsIG9wdGlvbnMpIHtcbiAgICB2YXIgZGlnZXN0Ynl0ZXMgPSBjcnlwdC53b3Jkc1RvQnl0ZXMoc2hhMShtZXNzYWdlKSk7XG4gICAgcmV0dXJuIG9wdGlvbnMgJiYgb3B0aW9ucy5hc0J5dGVzID8gZGlnZXN0Ynl0ZXMgOlxuICAgICAgICBvcHRpb25zICYmIG9wdGlvbnMuYXNTdHJpbmcgPyBiaW4uYnl0ZXNUb1N0cmluZyhkaWdlc3RieXRlcykgOlxuICAgICAgICBjcnlwdC5ieXRlc1RvSGV4KGRpZ2VzdGJ5dGVzKTtcbiAgfTtcblxuICBhcGkuX2Jsb2Nrc2l6ZSA9IDE2O1xuICBhcGkuX2RpZ2VzdHNpemUgPSAyMDtcblxuICBtb2R1bGUuZXhwb3J0cyA9IGFwaTtcbn0pKCk7XG4iXX0=
