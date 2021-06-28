(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (process){
/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */


var _Group = function () {
	this._tweens = {};
	this._tweensAddedDuringUpdate = {};
};

_Group.prototype = {
	getAll: function () {

		return Object.keys(this._tweens).map(function (tweenId) {
			return this._tweens[tweenId];
		}.bind(this));

	},

	removeAll: function () {

		this._tweens = {};

	},

	add: function (tween) {

		this._tweens[tween.getId()] = tween;
		this._tweensAddedDuringUpdate[tween.getId()] = tween;

	},

	remove: function (tween) {

		delete this._tweens[tween.getId()];
		delete this._tweensAddedDuringUpdate[tween.getId()];

	},

	update: function (time, preserve) {

		var tweenIds = Object.keys(this._tweens);

		if (tweenIds.length === 0) {
			return false;
		}

		time = time !== undefined ? time : TWEEN.now();

		// Tweens are updated in "batches". If you add a new tween during an update, then the
		// new tween will be updated in the next batch.
		// If you remove a tween during an update, it will normally still be updated. However,
		// if the removed tween was added during the current batch, then it will not be updated.
		while (tweenIds.length > 0) {
			this._tweensAddedDuringUpdate = {};

			for (var i = 0; i < tweenIds.length; i++) {

				if (this._tweens[tweenIds[i]].update(time) === false) {
					this._tweens[tweenIds[i]]._isPlaying = false;

					if (!preserve) {
						delete this._tweens[tweenIds[i]];
					}
				}
			}

			tweenIds = Object.keys(this._tweensAddedDuringUpdate);
		}

		return true;

	}
};

var TWEEN = new _Group();

TWEEN.Group = _Group;
TWEEN._nextId = 0;
TWEEN.nextId = function () {
	return TWEEN._nextId++;
};


// Include a performance.now polyfill.
// In node.js, use process.hrtime.
if (typeof (window) === 'undefined' && typeof (process) !== 'undefined') {
	TWEEN.now = function () {
		var time = process.hrtime();

		// Convert [seconds, nanoseconds] to milliseconds.
		return time[0] * 1000 + time[1] / 1000000;
	};
}
// In a browser, use window.performance.now if it is available.
else if (typeof (window) !== 'undefined' &&
         window.performance !== undefined &&
		 window.performance.now !== undefined) {
	// This must be bound, because directly assigning this function
	// leads to an invocation exception in Chrome.
	TWEEN.now = window.performance.now.bind(window.performance);
}
// Use Date.now if it is available.
else if (Date.now !== undefined) {
	TWEEN.now = Date.now;
}
// Otherwise, use 'new Date().getTime()'.
else {
	TWEEN.now = function () {
		return new Date().getTime();
	};
}


TWEEN.Tween = function (object, group) {
	this._object = object;
	this._valuesStart = {};
	this._valuesEnd = {};
	this._valuesStartRepeat = {};
	this._duration = 1000;
	this._repeat = 0;
	this._repeatDelayTime = undefined;
	this._yoyo = false;
	this._isPlaying = false;
	this._reversed = false;
	this._delayTime = 0;
	this._startTime = null;
	this._easingFunction = TWEEN.Easing.Linear.None;
	this._interpolationFunction = TWEEN.Interpolation.Linear;
	this._chainedTweens = [];
	this._onStartCallback = null;
	this._onStartCallbackFired = false;
	this._onUpdateCallback = null;
	this._onCompleteCallback = null;
	this._onStopCallback = null;
	this._group = group || TWEEN;
	this._id = TWEEN.nextId();

};

TWEEN.Tween.prototype = {
	getId: function getId() {
		return this._id;
	},

	isPlaying: function isPlaying() {
		return this._isPlaying;
	},

	to: function to(properties, duration) {

		this._valuesEnd = properties;

		if (duration !== undefined) {
			this._duration = duration;
		}

		return this;

	},

	start: function start(time) {

		this._group.add(this);

		this._isPlaying = true;

		this._onStartCallbackFired = false;

		this._startTime = time !== undefined ? time : TWEEN.now();
		this._startTime += this._delayTime;

		for (var property in this._valuesEnd) {

			// Check if an Array was provided as property value
			if (this._valuesEnd[property] instanceof Array) {

				if (this._valuesEnd[property].length === 0) {
					continue;
				}

				// Create a local copy of the Array with the start value at the front
				this._valuesEnd[property] = [this._object[property]].concat(this._valuesEnd[property]);

			}

			// If `to()` specifies a property that doesn't exist in the source object,
			// we should not set that property in the object
			if (this._object[property] === undefined) {
				continue;
			}

			// Save the starting value.
			this._valuesStart[property] = this._object[property];

			if ((this._valuesStart[property] instanceof Array) === false) {
				this._valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
			}

			this._valuesStartRepeat[property] = this._valuesStart[property] || 0;

		}

		return this;

	},

	stop: function stop() {

		if (!this._isPlaying) {
			return this;
		}

		this._group.remove(this);
		this._isPlaying = false;

		if (this._onStopCallback !== null) {
			this._onStopCallback.call(this._object, this._object);
		}

		this.stopChainedTweens();
		return this;

	},

	end: function end() {

		this.update(this._startTime + this._duration);
		return this;

	},

	stopChainedTweens: function stopChainedTweens() {

		for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
			this._chainedTweens[i].stop();
		}

	},

	delay: function delay(amount) {

		this._delayTime = amount;
		return this;

	},

	repeat: function repeat(times) {

		this._repeat = times;
		return this;

	},

	repeatDelay: function repeatDelay(amount) {

		this._repeatDelayTime = amount;
		return this;

	},

	yoyo: function yoyo(yoyo) {

		this._yoyo = yoyo;
		return this;

	},

	easing: function easing(easing) {

		this._easingFunction = easing;
		return this;

	},

	interpolation: function interpolation(interpolation) {

		this._interpolationFunction = interpolation;
		return this;

	},

	chain: function chain() {

		this._chainedTweens = arguments;
		return this;

	},

	onStart: function onStart(callback) {

		this._onStartCallback = callback;
		return this;

	},

	onUpdate: function onUpdate(callback) {

		this._onUpdateCallback = callback;
		return this;

	},

	onComplete: function onComplete(callback) {

		this._onCompleteCallback = callback;
		return this;

	},

	onStop: function onStop(callback) {

		this._onStopCallback = callback;
		return this;

	},

	update: function update(time) {

		var property;
		var elapsed;
		var value;

		if (time < this._startTime) {
			return true;
		}

		if (this._onStartCallbackFired === false) {

			if (this._onStartCallback !== null) {
				this._onStartCallback.call(this._object, this._object);
			}

			this._onStartCallbackFired = true;
		}

		elapsed = (time - this._startTime) / this._duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		value = this._easingFunction(elapsed);

		for (property in this._valuesEnd) {

			// Don't update properties that do not exist in the source object
			if (this._valuesStart[property] === undefined) {
				continue;
			}

			var start = this._valuesStart[property] || 0;
			var end = this._valuesEnd[property];

			if (end instanceof Array) {

				this._object[property] = this._interpolationFunction(end, value);

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if (typeof (end) === 'string') {

					if (end.charAt(0) === '+' || end.charAt(0) === '-') {
						end = start + parseFloat(end);
					} else {
						end = parseFloat(end);
					}
				}

				// Protect against non numeric properties.
				if (typeof (end) === 'number') {
					this._object[property] = start + (end - start) * value;
				}

			}

		}

		if (this._onUpdateCallback !== null) {
			this._onUpdateCallback.call(this._object, value);
		}

		if (elapsed === 1) {

			if (this._repeat > 0) {

				if (isFinite(this._repeat)) {
					this._repeat--;
				}

				// Reassign starting values, restart by making startTime = now
				for (property in this._valuesStartRepeat) {

					if (typeof (this._valuesEnd[property]) === 'string') {
						this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
					}

					if (this._yoyo) {
						var tmp = this._valuesStartRepeat[property];

						this._valuesStartRepeat[property] = this._valuesEnd[property];
						this._valuesEnd[property] = tmp;
					}

					this._valuesStart[property] = this._valuesStartRepeat[property];

				}

				if (this._yoyo) {
					this._reversed = !this._reversed;
				}

				if (this._repeatDelayTime !== undefined) {
					this._startTime = time + this._repeatDelayTime;
				} else {
					this._startTime = time + this._delayTime;
				}

				return true;

			} else {

				if (this._onCompleteCallback !== null) {

					this._onCompleteCallback.call(this._object, this._object);
				}

				for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
					// Make the chained tweens start exactly at the time they should,
					// even if the `update()` method was called way past the duration of the tween
					this._chainedTweens[i].start(this._startTime + this._duration);
				}

				return false;

			}

		}

		return true;

	}
};


TWEEN.Easing = {

	Linear: {

		None: function (k) {

			return k;

		}

	},

	Quadratic: {

		In: function (k) {

			return k * k;

		},

		Out: function (k) {

			return k * (2 - k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k;
			}

			return - 0.5 * (--k * (k - 2) - 1);

		}

	},

	Cubic: {

		In: function (k) {

			return k * k * k;

		},

		Out: function (k) {

			return --k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k + 2);

		}

	},

	Quartic: {

		In: function (k) {

			return k * k * k * k;

		},

		Out: function (k) {

			return 1 - (--k * k * k * k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k;
			}

			return - 0.5 * ((k -= 2) * k * k * k - 2);

		}

	},

	Quintic: {

		In: function (k) {

			return k * k * k * k * k;

		},

		Out: function (k) {

			return --k * k * k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k * k * k + 2);

		}

	},

	Sinusoidal: {

		In: function (k) {

			return 1 - Math.cos(k * Math.PI / 2);

		},

		Out: function (k) {

			return Math.sin(k * Math.PI / 2);

		},

		InOut: function (k) {

			return 0.5 * (1 - Math.cos(Math.PI * k));

		}

	},

	Exponential: {

		In: function (k) {

			return k === 0 ? 0 : Math.pow(1024, k - 1);

		},

		Out: function (k) {

			return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);

		},

		InOut: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if ((k *= 2) < 1) {
				return 0.5 * Math.pow(1024, k - 1);
			}

			return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);

		}

	},

	Circular: {

		In: function (k) {

			return 1 - Math.sqrt(1 - k * k);

		},

		Out: function (k) {

			return Math.sqrt(1 - (--k * k));

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return - 0.5 * (Math.sqrt(1 - k * k) - 1);
			}

			return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);

		},

		Out: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;

		},

		InOut: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			k *= 2;

			if (k < 1) {
				return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
			}

			return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;

		}

	},

	Back: {

		In: function (k) {

			var s = 1.70158;

			return k * k * ((s + 1) * k - s);

		},

		Out: function (k) {

			var s = 1.70158;

			return --k * k * ((s + 1) * k + s) + 1;

		},

		InOut: function (k) {

			var s = 1.70158 * 1.525;

			if ((k *= 2) < 1) {
				return 0.5 * (k * k * ((s + 1) * k - s));
			}

			return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

		}

	},

	Bounce: {

		In: function (k) {

			return 1 - TWEEN.Easing.Bounce.Out(1 - k);

		},

		Out: function (k) {

			if (k < (1 / 2.75)) {
				return 7.5625 * k * k;
			} else if (k < (2 / 2.75)) {
				return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
			} else if (k < (2.5 / 2.75)) {
				return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
			} else {
				return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
			}

		},

		InOut: function (k) {

			if (k < 0.5) {
				return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
			}

			return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.Linear;

		if (k < 0) {
			return fn(v[0], v[1], f);
		}

		if (k > 1) {
			return fn(v[m], v[m - 1], m - f);
		}

		return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

	},

	Bezier: function (v, k) {

		var b = 0;
		var n = v.length - 1;
		var pw = Math.pow;
		var bn = TWEEN.Interpolation.Utils.Bernstein;

		for (var i = 0; i <= n; i++) {
			b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
		}

		return b;

	},

	CatmullRom: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.CatmullRom;

		if (v[0] === v[m]) {

			if (k < 0) {
				i = Math.floor(f = m * (1 + k));
			}

			return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

		} else {

			if (k < 0) {
				return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
			}

			if (k > 1) {
				return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
			}

			return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

		}

	},

	Utils: {

		Linear: function (p0, p1, t) {

			return (p1 - p0) * t + p0;

		},

		Bernstein: function (n, i) {

			var fc = TWEEN.Interpolation.Utils.Factorial;

			return fc(n) / fc(i) / fc(n - i);

		},

		Factorial: (function () {

			var a = [1];

			return function (n) {

				var s = 1;

				if (a[n]) {
					return a[n];
				}

				for (var i = n; i > 1; i--) {
					s *= i;
				}

				a[n] = s;
				return s;

			};

		})(),

		CatmullRom: function (p0, p1, p2, p3, t) {

			var v0 = (p2 - p0) * 0.5;
			var v1 = (p3 - p1) * 0.5;
			var t2 = t * t;
			var t3 = t * t2;

			return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

		}

	}

};

// UMD (Universal Module Definition)
(function (root) {

	if (typeof define === 'function' && define.amd) {

		// AMD
		define([], function () {
			return TWEEN;
		});

	} else if (typeof module !== 'undefined' && typeof exports === 'object') {

		// Node.js
		module.exports = TWEEN;

	} else if (root !== undefined) {

		// Global variable
		root.TWEEN = TWEEN;

	}

})(this);

}).call(this,_dereq_('_process'))
},{"_process":4}],2:[function(_dereq_,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   3.3.1
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  return typeof x === 'function' || typeof x === 'object' && x !== null;
}

function isFunction(x) {
  return typeof x === 'function';
}

var _isArray = undefined;
if (!Array.isArray) {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
} else {
  _isArray = Array.isArray;
}

var isArray = _isArray;

var len = 0;
var vertxNext = undefined;
var customSchedulerFn = undefined;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  return function () {
    vertxNext(flush);
  };
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var r = _dereq_;
    var vertx = r('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = undefined;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof _dereq_ === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var _arguments = arguments;

  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;

  if (_state) {
    (function () {
      var callback = _arguments[_state - 1];
      asap(function () {
        return invokeCallback(_state, child, callback, parent._result);
      });
    })();
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  _resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(16);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var GET_THEN_ERROR = new ErrorObject();

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    GET_THEN_ERROR.error = error;
    return GET_THEN_ERROR;
  }
}

function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
  try {
    then.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        _resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      _reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      _reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    _reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return _resolve(promise, value);
    }, function (reason) {
      return _reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$) {
  if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$ === GET_THEN_ERROR) {
      _reject(promise, GET_THEN_ERROR.error);
    } else if (then$$ === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$)) {
      handleForeignThenable(promise, maybeThenable, then$$);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function _resolve(promise, value) {
  if (promise === value) {
    _reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function _reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;

  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = undefined,
      callback = undefined,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function ErrorObject() {
  this.error = null;
}

var TRY_CATCH_ERROR = new ErrorObject();

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = undefined,
      error = undefined,
      succeeded = undefined,
      failed = undefined;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      _reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
      _resolve(promise, value);
    } else if (failed) {
      _reject(promise, error);
    } else if (settled === FULFILLED) {
      fulfill(promise, value);
    } else if (settled === REJECTED) {
      _reject(promise, value);
    }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      _resolve(promise, value);
    }, function rejectPromise(reason) {
      _reject(promise, reason);
    });
  } catch (e) {
    _reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function Enumerator(Constructor, input) {
  this._instanceConstructor = Constructor;
  this.promise = new Constructor(noop);

  if (!this.promise[PROMISE_ID]) {
    makePromise(this.promise);
  }

  if (isArray(input)) {
    this._input = input;
    this.length = input.length;
    this._remaining = input.length;

    this._result = new Array(this.length);

    if (this.length === 0) {
      fulfill(this.promise, this._result);
    } else {
      this.length = this.length || 0;
      this._enumerate();
      if (this._remaining === 0) {
        fulfill(this.promise, this._result);
      }
    }
  } else {
    _reject(this.promise, validationError());
  }
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
};

Enumerator.prototype._enumerate = function () {
  var length = this.length;
  var _input = this._input;

  for (var i = 0; this._state === PENDING && i < length; i++) {
    this._eachEntry(_input[i], i);
  }
};

Enumerator.prototype._eachEntry = function (entry, i) {
  var c = this._instanceConstructor;
  var resolve$$ = c.resolve;

  if (resolve$$ === resolve) {
    var _then = getThen(entry);

    if (_then === then && entry._state !== PENDING) {
      this._settledAt(entry._state, i, entry._result);
    } else if (typeof _then !== 'function') {
      this._remaining--;
      this._result[i] = entry;
    } else if (c === Promise) {
      var promise = new c(noop);
      handleMaybeThenable(promise, entry, _then);
      this._willSettleAt(promise, i);
    } else {
      this._willSettleAt(new c(function (resolve$$) {
        return resolve$$(entry);
      }), i);
    }
  } else {
    this._willSettleAt(resolve$$(entry), i);
  }
};

Enumerator.prototype._settledAt = function (state, i, value) {
  var promise = this.promise;

  if (promise._state === PENDING) {
    this._remaining--;

    if (state === REJECTED) {
      _reject(promise, value);
    } else {
      this._result[i] = value;
    }
  }

  if (this._remaining === 0) {
    fulfill(promise, this._result);
  }
};

Enumerator.prototype._willSettleAt = function (promise, i) {
  var enumerator = this;

  subscribe(promise, undefined, function (value) {
    return enumerator._settledAt(FULFILLED, i, value);
  }, function (reason) {
    return enumerator._settledAt(REJECTED, i, reason);
  });
};

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  _reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {function} resolver
  Useful for tooling.
  @constructor
*/
function Promise(resolver) {
  this[PROMISE_ID] = nextId();
  this._result = this._state = undefined;
  this._subscribers = [];

  if (noop !== resolver) {
    typeof resolver !== 'function' && needsResolver();
    this instanceof Promise ? initializePromise(this, resolver) : needsNew();
  }
}

Promise.all = all;
Promise.race = race;
Promise.resolve = resolve;
Promise.reject = reject;
Promise._setScheduler = setScheduler;
Promise._setAsap = setAsap;
Promise._asap = asap;

Promise.prototype = {
  constructor: Promise,

  /**
    The primary way of interacting with a promise is through its `then` method,
    which registers callbacks to receive either a promise's eventual value or the
    reason why the promise cannot be fulfilled.
  
    ```js
    findUser().then(function(user){
      // user is available
    }, function(reason){
      // user is unavailable, and you are given the reason why
    });
    ```
  
    Chaining
    --------
  
    The return value of `then` is itself a promise.  This second, 'downstream'
    promise is resolved with the return value of the first promise's fulfillment
    or rejection handler, or rejected if the handler throws an exception.
  
    ```js
    findUser().then(function (user) {
      return user.name;
    }, function (reason) {
      return 'default name';
    }).then(function (userName) {
      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
      // will be `'default name'`
    });
  
    findUser().then(function (user) {
      throw new Error('Found user, but still unhappy');
    }, function (reason) {
      throw new Error('`findUser` rejected and we're unhappy');
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
    });
    ```
    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
  
    ```js
    findUser().then(function (user) {
      throw new PedagogicalException('Upstream error');
    }).then(function (value) {
      // never reached
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // The `PedgagocialException` is propagated all the way down to here
    });
    ```
  
    Assimilation
    ------------
  
    Sometimes the value you want to propagate to a downstream promise can only be
    retrieved asynchronously. This can be achieved by returning a promise in the
    fulfillment or rejection handler. The downstream promise will then be pending
    until the returned promise is settled. This is called *assimilation*.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // The user's comments are now available
    });
    ```
  
    If the assimliated promise rejects, then the downstream promise will also reject.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // If `findCommentsByAuthor` fulfills, we'll have the value here
    }, function (reason) {
      // If `findCommentsByAuthor` rejects, we'll have the reason here
    });
    ```
  
    Simple Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let result;
  
    try {
      result = findResult();
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
    findResult(function(result, err){
      if (err) {
        // failure
      } else {
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findResult().then(function(result){
      // success
    }, function(reason){
      // failure
    });
    ```
  
    Advanced Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let author, books;
  
    try {
      author = findAuthor();
      books  = findBooksByAuthor(author);
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
  
    function foundBooks(books) {
  
    }
  
    function failure(reason) {
  
    }
  
    findAuthor(function(author, err){
      if (err) {
        failure(err);
        // failure
      } else {
        try {
          findBoooksByAuthor(author, function(books, err) {
            if (err) {
              failure(err);
            } else {
              try {
                foundBooks(books);
              } catch(reason) {
                failure(reason);
              }
            }
          });
        } catch(error) {
          failure(err);
        }
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findAuthor().
      then(findBooksByAuthor).
      then(function(books){
        // found books
    }).catch(function(reason){
      // something went wrong
    });
    ```
  
    @method then
    @param {Function} onFulfilled
    @param {Function} onRejected
    Useful for tooling.
    @return {Promise}
  */
  then: then,

  /**
    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
    as the catch block of a try/catch statement.
  
    ```js
    function findAuthor(){
      throw new Error('couldn't find that author');
    }
  
    // synchronous
    try {
      findAuthor();
    } catch(reason) {
      // something went wrong
    }
  
    // async with promises
    findAuthor().catch(function(reason){
      // something went wrong
    });
    ```
  
    @method catch
    @param {Function} onRejection
    Useful for tooling.
    @return {Promise}
  */
  'catch': function _catch(onRejection) {
    return this.then(null, onRejection);
  }
};

function polyfill() {
    var local = undefined;

    if (typeof global !== 'undefined') {
        local = global;
    } else if (typeof self !== 'undefined') {
        local = self;
    } else {
        try {
            local = Function('return this')();
        } catch (e) {
            throw new Error('polyfill failed because global object is unavailable in this environment');
        }
    }

    var P = local.Promise;

    if (P) {
        var promiseToString = null;
        try {
            promiseToString = Object.prototype.toString.call(P.resolve());
        } catch (e) {
            // silently ignored
        }

        if (promiseToString === '[object Promise]' && !P.cast) {
            return;
        }
    }

    local.Promise = Promise;
}

polyfill();
// Strange compat..
Promise.polyfill = polyfill;
Promise.Promise = Promise;

return Promise;

})));

}).call(this,_dereq_('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":4}],3:[function(_dereq_,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} [once=false] Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Hold the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var events = this._events
    , names = []
    , name;

  if (!events) return names;

  for (name in events) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} [context=this] The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} [context=this] The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],4:[function(_dereq_,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(_dereq_,module,exports){
(function(){var g={};
(function(window){var k,aa=this;aa.Le=!0;function n(a,b){var c=a.split("."),d=aa;c[0]in d||!d.execScript||d.execScript("var "+c[0]);for(var e;c.length&&(e=c.shift());)c.length||void 0===b?d[e]?d=d[e]:d=d[e]={}:d[e]=b}function ba(a){var b=p;function c(){}c.prototype=b.prototype;a.Ze=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.Xe=function(a,c,f){return b.prototype[c].apply(a,Array.prototype.slice.call(arguments,2))}};/*

 Copyright 2016 Google Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function ca(a){this.c=Math.exp(Math.log(.5)/a);this.b=this.a=0}function da(a,b,c){var d=Math.pow(a.c,b);c=c*(1-d)+d*a.a;isNaN(c)||(a.a=c,a.b+=b)}function ea(a){return a.a/(1-Math.pow(a.c,a.b))};function fa(){this.b=new ca(2);this.c=new ca(5);this.a=0}fa.prototype.getBandwidthEstimate=function(a){return 128E3>this.a?a:Math.min(ea(this.b),ea(this.c))};function ga(){};function v(a,b,c,d){this.severity=a;this.category=b;this.code=c;this.data=Array.prototype.slice.call(arguments,3);this.handled=!1}n("shaka.util.Error",v);v.prototype.toString=function(){return"shaka.util.Error "+JSON.stringify(this,null,"  ")};v.Severity={RECOVERABLE:1,CRITICAL:2};v.Category={NETWORK:1,TEXT:2,MEDIA:3,MANIFEST:4,STREAMING:5,DRM:6,PLAYER:7,CAST:8,STORAGE:9};
v.Code={UNSUPPORTED_SCHEME:1E3,BAD_HTTP_STATUS:1001,HTTP_ERROR:1002,TIMEOUT:1003,MALFORMED_DATA_URI:1004,UNKNOWN_DATA_URI_ENCODING:1005,REQUEST_FILTER_ERROR:1006,RESPONSE_FILTER_ERROR:1007,INVALID_TEXT_HEADER:2E3,INVALID_TEXT_CUE:2001,UNABLE_TO_DETECT_ENCODING:2003,BAD_ENCODING:2004,INVALID_XML:2005,INVALID_MP4_TTML:2007,INVALID_MP4_VTT:2008,BUFFER_READ_OUT_OF_BOUNDS:3E3,JS_INTEGER_OVERFLOW:3001,EBML_OVERFLOW:3002,EBML_BAD_FLOATING_POINT_SIZE:3003,MP4_SIDX_WRONG_BOX_TYPE:3004,MP4_SIDX_INVALID_TIMESCALE:3005,
MP4_SIDX_TYPE_NOT_SUPPORTED:3006,WEBM_CUES_ELEMENT_MISSING:3007,WEBM_EBML_HEADER_ELEMENT_MISSING:3008,WEBM_SEGMENT_ELEMENT_MISSING:3009,WEBM_INFO_ELEMENT_MISSING:3010,WEBM_DURATION_ELEMENT_MISSING:3011,WEBM_CUE_TRACK_POSITIONS_ELEMENT_MISSING:3012,WEBM_CUE_TIME_ELEMENT_MISSING:3013,MEDIA_SOURCE_OPERATION_FAILED:3014,MEDIA_SOURCE_OPERATION_THREW:3015,VIDEO_ERROR:3016,QUOTA_EXCEEDED_ERROR:3017,UNABLE_TO_GUESS_MANIFEST_TYPE:4E3,DASH_INVALID_XML:4001,DASH_NO_SEGMENT_INFO:4002,DASH_EMPTY_ADAPTATION_SET:4003,
DASH_EMPTY_PERIOD:4004,DASH_WEBM_MISSING_INIT:4005,DASH_UNSUPPORTED_CONTAINER:4006,DASH_PSSH_BAD_ENCODING:4007,DASH_NO_COMMON_KEY_SYSTEM:4008,DASH_MULTIPLE_KEY_IDS_NOT_SUPPORTED:4009,DASH_CONFLICTING_KEY_IDS:4010,UNPLAYABLE_PERIOD:4011,RESTRICTIONS_CANNOT_BE_MET:4012,NO_PERIODS:4014,HLS_PLAYLIST_HEADER_MISSING:4015,INVALID_HLS_TAG:4016,HLS_INVALID_PLAYLIST_HIERARCHY:4017,DASH_DUPLICATE_REPRESENTATION_ID:4018,HLS_MULTIPLE_MEDIA_INIT_SECTIONS_FOUND:4020,HLS_COULD_NOT_GUESS_MIME_TYPE:4021,HLS_MASTER_PLAYLIST_NOT_PROVIDED:4022,
HLS_REQUIRED_ATTRIBUTE_MISSING:4023,HLS_REQUIRED_TAG_MISSING:4024,HLS_COULD_NOT_GUESS_CODECS:4025,HLS_KEYFORMATS_NOT_SUPPORTED:4026,DASH_UNSUPPORTED_XLINK_ACTUATE:4027,DASH_XLINK_DEPTH_LIMIT:4028,HLS_LIVE_CONTENT_NOT_SUPPORTED:4029,INVALID_STREAMS_CHOSEN:5005,NO_RECOGNIZED_KEY_SYSTEMS:6E3,REQUESTED_KEY_SYSTEM_CONFIG_UNAVAILABLE:6001,FAILED_TO_CREATE_CDM:6002,FAILED_TO_ATTACH_TO_VIDEO:6003,INVALID_SERVER_CERTIFICATE:6004,FAILED_TO_CREATE_SESSION:6005,FAILED_TO_GENERATE_LICENSE_REQUEST:6006,LICENSE_REQUEST_FAILED:6007,
LICENSE_RESPONSE_REJECTED:6008,ENCRYPTED_CONTENT_WITHOUT_DRM_INFO:6010,NO_LICENSE_SERVER_GIVEN:6012,OFFLINE_SESSION_REMOVED:6013,EXPIRED:6014,LOAD_INTERRUPTED:7E3,CAST_API_UNAVAILABLE:8E3,NO_CAST_RECEIVERS:8001,ALREADY_CASTING:8002,UNEXPECTED_CAST_ERROR:8003,CAST_CANCELED_BY_USER:8004,CAST_CONNECTION_TIMED_OUT:8005,CAST_RECEIVER_APP_UNAVAILABLE:8006,STORAGE_NOT_SUPPORTED:9E3,INDEXED_DB_ERROR:9001,OPERATION_ABORTED:9002,REQUESTED_ITEM_NOT_FOUND:9003,MALFORMED_OFFLINE_URI:9004,CANNOT_STORE_LIVE_OFFLINE:9005,
STORE_ALREADY_IN_PROGRESS:9006,NO_INIT_DATA_FOR_OFFLINE:9007,LOCAL_PLAYER_INSTANCE_REQUIRED:9008,CONTENT_UNSUPPORTED_BY_BROWSER:9009};var ha=/^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#(.*))?$/;function ia(a){var b;a instanceof ia?(ja(this,a.ca),this.Ba=a.Ba,this.ha=a.ha,ka(this,a.Ia),this.$=a.$,la(this,ma(a.a)),this.ua=a.ua):a&&(b=String(a).match(ha))?(ja(this,b[1]||"",!0),this.Ba=na(b[2]||""),this.ha=na(b[3]||"",!0),ka(this,b[4]),this.$=na(b[5]||"",!0),la(this,b[6]||"",!0),this.ua=na(b[7]||"")):this.a=new oa(null)}k=ia.prototype;k.ca="";k.Ba="";k.ha="";k.Ia=null;k.$="";k.ua="";
k.toString=function(){var a=[],b=this.ca;b&&a.push(pa(b,qa,!0),":");if(b=this.ha){a.push("//");var c=this.Ba;c&&a.push(pa(c,qa,!0),"@");a.push(encodeURIComponent(b).replace(/%25([0-9a-fA-F]{2})/g,"%$1"));b=this.Ia;null!=b&&a.push(":",String(b))}if(b=this.$)this.ha&&"/"!=b.charAt(0)&&a.push("/"),a.push(pa(b,"/"==b.charAt(0)?ra:sa,!0));(b=this.a.toString())&&a.push("?",b);(b=this.ua)&&a.push("#",pa(b,ta));return a.join("")};
k.resolve=function(a){var b=new ia(this);"data"===b.ca&&(b=new ia);var c=!!a.ca;c?ja(b,a.ca):c=!!a.Ba;c?b.Ba=a.Ba:c=!!a.ha;c?b.ha=a.ha:c=null!=a.Ia;var d=a.$;if(c)ka(b,a.Ia);else if(c=!!a.$){if("/"!=d.charAt(0))if(this.ha&&!this.$)d="/"+d;else{var e=b.$.lastIndexOf("/");-1!=e&&(d=b.$.substr(0,e+1)+d)}if(".."==d||"."==d)d="";else if(-1!=d.indexOf("./")||-1!=d.indexOf("/.")){for(var e=!d.lastIndexOf("/",0),d=d.split("/"),f=[],g=0;g<d.length;){var h=d[g++];"."==h?e&&g==d.length&&f.push(""):".."==h?((1<
f.length||1==f.length&&""!=f[0])&&f.pop(),e&&g==d.length&&f.push("")):(f.push(h),e=!0)}d=f.join("/")}}c?b.$=d:c=""!==a.a.toString();c?la(b,ma(a.a)):c=!!a.ua;c&&(b.ua=a.ua);return b};function ja(a,b,c){a.ca=c?na(b,!0):b;a.ca&&(a.ca=a.ca.replace(/:$/,""))}function ka(a,b){if(b){b=Number(b);if(isNaN(b)||0>b)throw Error("Bad port number "+b);a.Ia=b}else a.Ia=null}function la(a,b,c){b instanceof oa?a.a=b:(c||(b=pa(b,ua)),a.a=new oa(b))}
function na(a,b){return a?b?decodeURI(a):decodeURIComponent(a):""}function pa(a,b,c){return"string"==typeof a?(a=encodeURI(a).replace(b,va),c&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function va(a){a=a.charCodeAt(0);return"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var qa=/[#\/\?@]/g,sa=/[\#\?:]/g,ra=/[\#\?]/g,ua=/[\#\?@]/g,ta=/#/g;function oa(a){this.b=a||null}oa.prototype.a=null;oa.prototype.c=null;
oa.prototype.toString=function(){if(this.b)return this.b;if(!this.a)return"";var a=[],b;for(b in this.a)for(var c=encodeURIComponent(b),d=this.a[b],e=0;e<d.length;e++){var f=c;""!==d[e]&&(f+="="+encodeURIComponent(d[e]));a.push(f)}return this.b=a.join("&")};function ma(a){var b=new oa;b.b=a.b;if(a.a){var c={},d;for(d in a.a)c[d]=a.a[d].concat();b.a=c;b.c=a.c}return b};function y(){var a,b,c=new Promise(function(c,e){a=c;b=e});c.resolve=a;c.reject=b;return c};function wa(a,b){var c=xa();this.i=null==a.maxAttempts?c.maxAttempts:a.maxAttempts;this.f=null==a.baseDelay?c.baseDelay:a.baseDelay;this.h=null==a.fuzzFactor?c.fuzzFactor:a.fuzzFactor;this.g=null==a.backoffFactor?c.backoffFactor:a.backoffFactor;this.a=0;this.b=this.f;if(this.c=b||!1)this.a=1}function ya(a){if(a.a>=a.i)if(a.c)a.a=1,a.b=a.f;else return Promise.reject();var b=new y;a.a?(window.setTimeout(b.resolve,a.b*(1+(2*Math.random()-1)*a.h)),a.b*=a.g):b.resolve();a.a++;return b}
function xa(){return{maxAttempts:2,baseDelay:1E3,backoffFactor:2,fuzzFactor:.5,timeout:0}};function za(a,b,c,d,e){var f=e in d,g;for(g in b){var h=e+"."+g,l=f?d[e]:c[g];if(f||g in a)void 0===b[g]?void 0===l||f?delete a[g]:a[g]=l:l.constructor==Object&&b[g]&&b[g].constructor==Object?(a[g]||(a[g]=l),za(a[g],b[g],l,d,h)):typeof b[g]==typeof l&&null!=b[g]&&b[g].constructor==l.constructor&&(a[g]=b[g])}}function Aa(a){return JSON.parse(JSON.stringify(a))};function Ba(a,b){return a.reduce(function(a,b,e){return b["catch"](a.bind(null,e))}.bind(null,b),Promise.reject())}function z(a,b){return a.concat(b)}function Ca(){}function Da(a){return null!=a}function Ea(a,b,c){return c.indexOf(a)==b};function A(a){this.f=!1;this.a=[];this.b=[];this.c=[];this.g=a||null}n("shaka.net.NetworkingEngine",A);A.RequestType={MANIFEST:0,SEGMENT:1,LICENSE:2,APP:3};var Ga={};A.registerScheme=function(a,b){Ga[a]=b};A.unregisterScheme=function(a){delete Ga[a]};A.prototype.Ud=function(a){this.b.push(a)};A.prototype.registerRequestFilter=A.prototype.Ud;A.prototype.Ce=function(a){var b=this.b;a=b.indexOf(a);0<=a&&b.splice(a,1)};A.prototype.unregisterRequestFilter=A.prototype.Ce;
A.prototype.Oc=function(){this.b=[]};A.prototype.clearAllRequestFilters=A.prototype.Oc;A.prototype.Vd=function(a){this.c.push(a)};A.prototype.registerResponseFilter=A.prototype.Vd;A.prototype.De=function(a){var b=this.c;a=b.indexOf(a);0<=a&&b.splice(a,1)};A.prototype.unregisterResponseFilter=A.prototype.De;A.prototype.Pc=function(){this.c=[]};A.prototype.clearAllResponseFilters=A.prototype.Pc;
function Ha(a,b){return{uris:a,method:"GET",body:null,headers:{},allowCrossSiteCredentials:!1,retryParameters:b}}A.prototype.o=function(){this.f=!0;this.b=[];this.c=[];for(var a=[],b=0;b<this.a.length;++b)a.push(this.a[b]["catch"](Ca));return Promise.all(a)};A.prototype.destroy=A.prototype.o;
A.prototype.request=function(a,b){if(this.f)return Promise.reject();b.method=b.method||"GET";b.headers=b.headers||{};b.retryParameters=b.retryParameters?Aa(b.retryParameters):xa();b.uris=Aa(b.uris);var c=Date.now(),d=Promise.resolve();this.b.forEach(function(c){d=d.then(c.bind(null,a,b))});d=d["catch"](function(a){throw new v(2,1,1006,a);});d=d.then(function(){var d=Date.now()-c,f=new wa(b.retryParameters);return ya(f).then(function(){return Ia(this,a,b,f,0,d)}.bind(this))}.bind(this));this.a.push(d);
return d.then(function(b){0<=this.a.indexOf(d)&&this.a.splice(this.a.indexOf(d),1);this.g&&!b.fromCache&&1==a&&this.g(b.timeMs,b.data.byteLength);return b}.bind(this))["catch"](function(a){a&&(a.severity=2);0<=this.a.indexOf(d)&&this.a.splice(this.a.indexOf(d),1);return Promise.reject(a)}.bind(this))};A.prototype.request=A.prototype.request;
function Ia(a,b,c,d,e,f){if(a.f)return Promise.reject();var g=new ia(c.uris[e]),h=g.ca;h||(h=location.protocol,h=h.slice(0,-1),ja(g,h),c.uris[e]=g.toString());h=Ga[h];if(!h)return Promise.reject(new v(2,1,1E3,g));var l=Date.now();return h(c.uris[e],c,b).then(function(a){void 0==a.timeMs&&(a.timeMs=Date.now()-l);var c=Date.now(),d=Promise.resolve();this.c.forEach(function(c){d=d.then(function(){return Promise.resolve(c(b,a))}.bind(this))});d=d["catch"](function(a){var b=2;a instanceof v&&(b=a.severity);
throw new v(b,1,1007,a);});return d.then(function(){a.timeMs+=Date.now()-c;a.timeMs+=f;return a})}.bind(a))["catch"](function(a){if(a&&1==a.severity)return e=(e+1)%c.uris.length,ya(d).then(function(){return Ia(this,b,c,d,e,f)}.bind(this),function(){throw a;});throw a;}.bind(a))};function Ja(a,b){for(var c=[],d=0;d<a.length;++d){for(var e=!1,f=0;f<c.length&&!(e=b?b(a[d],c[f]):a[d]===c[f]);++f);e||c.push(a[d])}return c}function Ka(a,b,c){for(var d=0;d<a.length;++d)if(c(a[d],b))return d;return-1}function La(a,b){var c=a.indexOf(b);-1<c&&a.splice(c,1)};function Ma(){this.a={}}Ma.prototype.push=function(a,b){this.a.hasOwnProperty(a)?this.a[a].push(b):this.a[a]=[b]};Ma.prototype.get=function(a){return(a=this.a[a])?a.slice():null};Ma.prototype.remove=function(a,b){var c=this.a[a];if(c)for(var d=0;d<c.length;++d)c[d]==b&&(c.splice(d,1),--d)};function B(){this.a=new Ma}B.prototype.o=function(){Na(this);this.a=null;return Promise.resolve()};function C(a,b,c,d){a.a&&(b=new Oa(b,c,d),a.a.push(c,b))}function Pa(a,b,c,d){C(a,b,c,function(a){this.la(b,c);d(a)}.bind(a))}B.prototype.la=function(a,b){if(this.a)for(var c=this.a.get(b)||[],d=0;d<c.length;++d){var e=c[d];e.target==a&&(e.la(),this.a.remove(b,e))}};function Na(a){if(a.a){var b=a.a,c=[],d;for(d in b.a)c.push.apply(c,b.a[d]);for(b=0;b<c.length;++b)c[b].la();a.a.a={}}}
function Oa(a,b,c){this.target=a;this.type=b;this.a=c;this.target.addEventListener(b,c,!1)}Oa.prototype.la=function(){this.target.removeEventListener(this.type,this.a,!1);this.a=this.target=null};function D(a,b){if(!b.length)return a;var c=b.map(function(a){return new ia(a)});return a.map(function(a){return new ia(a)}).map(function(a){return c.map(a.resolve.bind(a))}).reduce(z,[]).map(function(a){return a.toString()})}function Qa(a,b){return{keySystem:a,licenseServerUri:"",distinctiveIdentifierRequired:!1,persistentStateRequired:!1,audioRobustness:"",videoRobustness:"",serverCertificate:null,initData:b||[],keyIds:[]}}var Ra=1/15;function Sa(a){return!a||!Object.keys(a).length}function Ta(a){return Object.keys(a).map(function(b){return a[b]})}function Ua(a,b){return Object.keys(a).reduce(function(c,d){c[d]=b(a[d],d);return c},{})}function Va(a,b){return Object.keys(a).every(function(c){return b(c,a[c])})}function Wa(a,b){Object.keys(a).forEach(function(c){b(c,a[c])})};function Xa(a,b){var c=a;b&&(c+='; codecs="'+b+'"');return c}var Ya={codecs:"codecs",frameRate:"framerate",bandwidth:"bitrate",width:"width",height:"height",channelsCount:"channels"};function E(a){if(!a)return"";a=new Uint8Array(a);239==a[0]&&187==a[1]&&191==a[2]&&(a=a.subarray(3));a=escape(Za(a));try{return decodeURIComponent(a)}catch(b){throw new v(2,2,2004);}}n("shaka.util.StringUtils.fromUTF8",E);
function $a(a,b,c){if(!a)return"";if(!c&&a.byteLength%2)throw new v(2,2,2004);if(a instanceof ArrayBuffer)var d=a;else c=new Uint8Array(a.byteLength),c.set(new Uint8Array(a)),d=c.buffer;a=Math.floor(a.byteLength/2);c=new Uint16Array(a);d=new DataView(d);for(var e=0;e<a;e++)c[e]=d.getUint16(2*e,b);return Za(c)}n("shaka.util.StringUtils.fromUTF16",$a);
function ab(a){var b=new Uint8Array(a);if(239==b[0]&&187==b[1]&&191==b[2])return E(b);if(254==b[0]&&255==b[1])return $a(b.subarray(2),!1);if(255==b[0]&&254==b[1])return $a(b.subarray(2),!0);var c=function(a,b){return a.byteLength<=b||32<=a[b]&&126>=a[b]}.bind(null,b);if(b[0]||b[2]){if(!b[1]&&!b[3])return $a(a,!0);if(c(0)&&c(1)&&c(2)&&c(3))return E(a)}else return $a(a,!1);throw new v(2,2,2003);}n("shaka.util.StringUtils.fromBytesAutoDetect",ab);
function bb(a){a=unescape(encodeURIComponent(a));for(var b=new Uint8Array(a.length),c=0;c<a.length;++c)b[c]=a.charCodeAt(c);return b.buffer}n("shaka.util.StringUtils.toUTF8",bb);function Za(a){for(var b="",c=0;c<a.length;c+=16E3)b+=String.fromCharCode.apply(null,a.subarray(c,c+16E3));return b};function cb(a){this.a=null;this.b=function(){this.a=null;a()}.bind(this)}cb.prototype.cancel=function(){null!=this.a&&(clearTimeout(this.a),this.a=null)};function db(a){a.cancel();a.a=setTimeout(a.b,500)};function eb(a,b){var c=void 0==b?!0:b,d=window.btoa(String.fromCharCode.apply(null,a)).replace(/\+/g,"-").replace(/\//g,"_");return c?d:d.replace(/=*$/,"")}n("shaka.util.Uint8ArrayUtils.toBase64",eb);function fb(a){a=window.atob(a.replace(/-/g,"+").replace(/_/g,"/"));for(var b=new Uint8Array(a.length),c=0;c<a.length;++c)b[c]=a.charCodeAt(c);return b}n("shaka.util.Uint8ArrayUtils.fromBase64",fb);
function gb(a){for(var b=new Uint8Array(a.length/2),c=0;c<a.length;c+=2)b[c/2]=window.parseInt(a.substr(c,2),16);return b}n("shaka.util.Uint8ArrayUtils.fromHex",gb);function hb(a){for(var b="",c=0;c<a.length;++c){var d=a[c].toString(16);1==d.length&&(d="0"+d);b+=d}return b}n("shaka.util.Uint8ArrayUtils.toHex",hb);function ib(a,b){if(!a&&!b)return!0;if(!a||!b||a.length!=b.length)return!1;for(var c=0;c<a.length;++c)if(a[c]!=b[c])return!1;return!0}n("shaka.util.Uint8ArrayUtils.equal",ib);
n("shaka.util.Uint8ArrayUtils.concat",function(a){for(var b=0,c=0;c<arguments.length;++c)b+=arguments[c].length;for(var b=new Uint8Array(b),d=0,c=0;c<arguments.length;++c)b.set(arguments[c],d),d+=arguments[c].length;return b});function jb(a,b,c,d){this.l=this.j=this.s=null;this.D=!1;this.b=null;this.f=new B;this.a=[];this.m=[];this.i=new y;this.ga=a;this.h=null;this.g=function(a){this.i.reject(a);b(a)}.bind(this);this.w={};this.sa=c;this.na=d;this.B=new cb(this.Td.bind(this));this.fa=this.c=!1;this.C=[];this.O=!1;this.I=setInterval(this.Sd.bind(this),1E3);this.i["catch"](function(){})}k=jb.prototype;
k.o=function(){this.c=!0;var a=this.a.map(function(a){return(a.da.close()||Promise.resolve())["catch"](Ca)});this.i.reject();this.f&&a.push(this.f.o());this.l&&a.push(this.l.setMediaKeys(null)["catch"](Ca));this.I&&(clearInterval(this.I),this.I=null);this.B&&this.B.cancel();this.f=this.l=this.j=this.s=this.b=this.B=null;this.a=[];this.m=[];this.na=this.g=this.h=this.ga=null;return Promise.all(a)};k.configure=function(a){this.h=a};
k.init=function(a,b){var c={},d=[];this.fa=b;this.m=a.offlineSessionIds;kb(this,a,b||0<a.offlineSessionIds.length,c,d);return d.length?lb(this,c,d):(this.D=!0,Promise.resolve())};
function mb(a,b){if(!a.j)return Pa(a.f,b,"encrypted",function(){this.g(new v(2,6,6010))}.bind(a)),Promise.resolve();a.l=b;Pa(a.f,a.l,"play",a.zd.bind(a));var c=a.l.setMediaKeys(a.j),c=c["catch"](function(a){return Promise.reject(new v(2,6,6003,a.message))}),d=null;a.b.serverCertificate&&a.b.serverCertificate.length&&(d=a.j.setServerCertificate(a.b.serverCertificate).then(function(){})["catch"](function(a){return Promise.reject(new v(2,6,6004,a.message))}));return Promise.all([c,d]).then(function(){if(this.c)return Promise.reject();
nb(this);this.b.initData.length||this.m.length||C(this.f,this.l,"encrypted",this.pd.bind(this))}.bind(a))["catch"](function(a){return this.c?Promise.resolve():Promise.reject(a)}.bind(a))}function ob(a,b){return Promise.all(b.map(function(a){return pb(this,a).then(function(a){if(a){for(var b=new y,c=0;c<this.a.length;c++)if(this.a[c].da==a){this.a[c].ma=b;break}return Promise.all([a.remove(),b])}}.bind(this))}.bind(a)))}
function nb(a){var b=a.b?a.b.initData:[];b.forEach(function(a){qb(this,a.initDataType,a.initData)}.bind(a));a.m.forEach(function(a){pb(this,a)}.bind(a));b.length||a.m.length||a.i.resolve();return a.i}k.keySystem=function(){return this.b?this.b.keySystem:""};function rb(a){return a.a.map(function(a){return a.da.sessionId})}k.jb=function(){var a=this.a.map(function(a){a=a.da.expiration;return isNaN(a)?Infinity:a});return Math.min.apply(Math,a)};
function kb(a,b,c,d,e){var f=sb(a);b.periods.forEach(function(a){a.variants.forEach(function(a){f&&(a.drmInfos=[f]);a.drmInfos.forEach(function(b){tb(this,b);window.cast&&window.cast.__platform__&&"com.microsoft.playready"==b.keySystem&&(b.keySystem="com.chromecast.playready");var f=d[b.keySystem];f||(f={audioCapabilities:[],videoCapabilities:[],distinctiveIdentifier:"optional",persistentState:c?"required":"optional",sessionTypes:[c?"persistent-license":"temporary"],label:b.keySystem,drmInfos:[]},
d[b.keySystem]=f,e.push(b.keySystem));f.drmInfos.push(b);b.distinctiveIdentifierRequired&&(f.distinctiveIdentifier="required");b.persistentStateRequired&&(f.persistentState="required");var g=[];a.video&&g.push(a.video);a.audio&&g.push(a.audio);g.forEach(function(a){("video"==a.type?f.videoCapabilities:f.audioCapabilities).push({robustness:("video"==a.type?b.videoRobustness:b.audioRobustness)||"",contentType:Xa(a.mimeType,a.codecs)})}.bind(this))}.bind(this))}.bind(this))}.bind(a))}
function lb(a,b,c){if(1==c.length&&""==c[0])return Promise.reject(new v(2,6,6E3));var d=new y,e=d;[!0,!1].forEach(function(a){c.forEach(function(c){var d=b[c];d.drmInfos.some(function(a){return!!a.licenseServerUri})==a&&(d.audioCapabilities.length||delete d.audioCapabilities,d.videoCapabilities.length||delete d.videoCapabilities,e=e["catch"](function(){return this.c?Promise.reject():navigator.requestMediaKeySystemAccess(c,[d])}.bind(this)))}.bind(this))}.bind(a));e=e["catch"](function(){return Promise.reject(new v(2,
6,6001))});e=e.then(function(a){if(this.c)return Promise.reject();var c=0<=navigator.userAgent.indexOf("Edge/"),d=a.getConfiguration();this.s=(d.audioCapabilities||[]).concat(d.videoCapabilities||[]).map(function(a){return a.contentType});c&&(this.s=null);c=b[a.keySystem];ub(this,a.keySystem,c,c.drmInfos);return this.b.licenseServerUri?a.createMediaKeys():Promise.reject(new v(2,6,6012))}.bind(a)).then(function(a){if(this.c)return Promise.reject();this.j=a;this.D=!0}.bind(a))["catch"](function(a){if(this.c)return Promise.resolve();
this.s=this.b=null;return a instanceof v?Promise.reject(a):Promise.reject(new v(2,6,6002,a.message))}.bind(a));d.reject();return e}
function tb(a,b){var c=b.keySystem;if(c){if(!b.licenseServerUri){var d=a.h.servers[c];d&&(b.licenseServerUri=d)}b.keyIds||(b.keyIds=[]);if(c=a.h.advanced[c])b.distinctiveIdentifierRequired||(b.distinctiveIdentifierRequired=c.distinctiveIdentifierRequired),b.persistentStateRequired||(b.persistentStateRequired=c.persistentStateRequired),b.videoRobustness||(b.videoRobustness=c.videoRobustness),b.audioRobustness||(b.audioRobustness=c.audioRobustness),b.serverCertificate||(b.serverCertificate=c.serverCertificate)}}
function sb(a){if(Sa(a.h.clearKeys))return null;var b=[],c=[],d;for(d in a.h.clearKeys){var e=a.h.clearKeys[d],f=gb(d),e=gb(e),f={kty:"oct",kid:eb(f,!1),k:eb(e,!1)};b.push(f);c.push(f.kid)}a=JSON.stringify({keys:b});c=JSON.stringify({kids:c});c=[{initData:new Uint8Array(bb(c)),initDataType:"keyids"}];return{keySystem:"org.w3.clearkey",licenseServerUri:"data:application/json;base64,"+window.btoa(a),distinctiveIdentifierRequired:!1,persistentStateRequired:!1,audioRobustness:"",videoRobustness:"",serverCertificate:null,
initData:c,keyIds:[]}}function ub(a,b,c,d){var e=[],f=[],g=[],h=[];vb(d,e,f,g,h);a.b={keySystem:b,licenseServerUri:e[0],distinctiveIdentifierRequired:"required"==c.distinctiveIdentifier,persistentStateRequired:"required"==c.persistentState,audioRobustness:c.audioCapabilities?c.audioCapabilities[0].robustness:"",videoRobustness:c.videoCapabilities?c.videoCapabilities[0].robustness:"",serverCertificate:f[0],initData:g,keyIds:h}}
function vb(a,b,c,d,e){function f(a,b){return a.keyId&&a.keyId==b.keyId?!0:a.initDataType==b.initDataType&&ib(a.initData,b.initData)}a.forEach(function(a){-1==b.indexOf(a.licenseServerUri)&&b.push(a.licenseServerUri);a.serverCertificate&&-1==Ka(c,a.serverCertificate,ib)&&c.push(a.serverCertificate);a.initData&&a.initData.forEach(function(a){-1==Ka(d,a,f)&&d.push(a)});if(a.keyIds)for(var g=0;g<a.keyIds.length;++g)-1==e.indexOf(a.keyIds[g])&&e.push(a.keyIds[g])})}
k.pd=function(a){for(var b=new Uint8Array(a.initData),c=0;c<this.a.length;++c)if(ib(b,this.a[c].initData))return;qb(this,a.initDataType,b)};
function pb(a,b){try{var c=a.j.createSession("persistent-license")}catch(f){var d=new v(2,6,6005,f.message);a.g(d);return Promise.reject(d)}C(a.f,c,"message",a.pc.bind(a));C(a.f,c,"keystatuseschange",a.jc.bind(a));var e={initData:null,da:c,loaded:!1,Eb:Infinity,ma:null};a.a.push(e);return c.load(b).then(function(a){if(!this.c){if(a)return e.loaded=!0,this.a.every(function(a){return a.loaded})&&this.i.resolve(),c;this.a.splice(this.a.indexOf(e),1);this.g(new v(2,6,6013))}}.bind(a),function(a){this.c||
(this.a.splice(this.a.indexOf(e),1),this.g(new v(2,6,6005,a.message)))}.bind(a))}
function qb(a,b,c){try{var d=a.fa?a.j.createSession("persistent-license"):a.j.createSession()}catch(e){a.g(new v(2,6,6005,e.message));return}C(a.f,d,"message",a.pc.bind(a));C(a.f,d,"keystatuseschange",a.jc.bind(a));a.a.push({initData:c,da:d,loaded:!1,Eb:Infinity,ma:null});d.generateRequest(b,c.buffer)["catch"](function(a){if(!this.c){for(var b=0;b<this.a.length;++b)if(this.a[b].da==d){this.a.splice(b,1);break}this.g(new v(2,6,6006,a.message))}}.bind(a))}
k.pc=function(a){this.h.delayLicenseRequestUntilPlayed&&this.l.paused&&!this.O?this.C.push(a):wb(this,a)};
function wb(a,b){for(var c=b.target,d,e=0;e<a.a.length;e++)if(a.a[e].da==c){d=a.a[e];break}e=Ha([a.b.licenseServerUri],a.h.retryParameters);e.body=b.message;e.method="POST";"com.microsoft.playready"!=a.b.keySystem&&"com.chromecast.playready"!=a.b.keySystem||xb(e);a.ga.request(2,e).then(function(a){return this.c?Promise.reject():c.update(a.data).then(function(){d&&(d.ma&&d.ma.resolve(),setTimeout(function(){d.loaded=!0;this.a.every(function(a){return a.loaded})&&this.i.resolve()}.bind(this),5E3))}.bind(this))}.bind(a),
function(a){if(this.c)return Promise.resolve();a=new v(2,6,6007,a);this.g(a);d&&d.ma&&d.ma.reject(a)}.bind(a))["catch"](function(a){if(this.c)return Promise.resolve();a=new v(2,6,6008,a.message);this.g(a);d&&d.ma&&d.ma.reject(a)}.bind(a))}
function xb(a){var b=$a(a.body,!0,!0);if(-1==b.indexOf("PlayReadyKeyMessage"))a.headers["Content-Type"]="text/xml; charset=utf-8";else{for(var b=(new DOMParser).parseFromString(b,"application/xml"),c=b.getElementsByTagName("HttpHeader"),d=0;d<c.length;++d)a.headers[c[d].querySelector("name").textContent]=c[d].querySelector("value").textContent;a.body=fb(b.querySelector("Challenge").textContent).buffer}}
k.jc=function(a){a=a.target;var b;for(b=0;b<this.a.length&&this.a[b].da!=a;++b);if(b!=this.a.length){var c=!1;a.keyStatuses.forEach(function(a,d){if("string"==typeof d){var e=d;d=a;a=e}if("com.microsoft.playready"==this.b.keySystem&&16==d.byteLength){var e=new DataView(d),f=e.getUint32(0,!0),l=e.getUint16(4,!0),m=e.getUint16(6,!0);e.setUint32(0,f,!1);e.setUint16(4,l,!1);e.setUint16(6,m,!1)}"com.microsoft.playready"==this.b.keySystem&&"status-pending"==a&&(a="usable");"status-pending"!=a&&(this.a[b].loaded=
!0,this.a.every(function(a){return a.loaded})&&this.i.resolve());"expired"==a&&(c=!0);e=hb(new Uint8Array(d));this.w[e]=a}.bind(this));var d=a.expiration-Date.now();(0>d||c&&1E3>d)&&!this.a[b].ma&&(this.a.splice(b,1),a.close());db(this.B)}};k.Td=function(){function a(a,c){return"expired"==c}!Sa(this.w)&&Va(this.w,a)&&this.g(new v(2,6,6014));this.sa(this.w)};
function yb(){var a=[],b=[{contentType:'video/mp4; codecs="avc1.42E01E"'},{contentType:'video/webm; codecs="vp8"'}],c=[{videoCapabilities:b,persistentState:"required",sessionTypes:["persistent-license"]},{videoCapabilities:b}],d={};"org.w3.clearkey com.widevine.alpha com.microsoft.playready com.apple.fps.2_0 com.apple.fps.1_0 com.apple.fps com.adobe.primetime".split(" ").forEach(function(b){var e=navigator.requestMediaKeySystemAccess(b,c).then(function(a){var c=a.getConfiguration().sessionTypes,c=
c?0<=c.indexOf("persistent-license"):!1;0<=navigator.userAgent.indexOf("Tizen 3")&&(c=!1);d[b]={persistentState:c};return a.createMediaKeys()})["catch"](function(){d[b]=null});a.push(e)});return Promise.all(a).then(function(){return d})}k.zd=function(){for(var a=0;a<this.C.length;a++)wb(this,this.C[a]);this.O=!0;this.C=[]};function zb(a,b){var c=a.keySystem();return!b.drmInfos.length||b.drmInfos.some(function(a){return a.keySystem==c})}
function Ab(a,b){if(!a.length)return b;if(!b.length)return a;for(var c=[],d=0;d<a.length;d++)for(var e=0;e<b.length;e++)if(a[d].keySystem==b[e].keySystem){var f=a[d],e=b[e],g=[],g=g.concat(f.initData||[]),g=g.concat(e.initData||[]),h=[],h=h.concat(f.keyIds),h=h.concat(e.keyIds);c.push({keySystem:f.keySystem,licenseServerUri:f.licenseServerUri||e.licenseServerUri,distinctiveIdentifierRequired:f.distinctiveIdentifierRequired||e.distinctiveIdentifierRequired,persistentStateRequired:f.persistentStateRequired||
e.persistentStateRequired,videoRobustness:f.videoRobustness||e.videoRobustness,audioRobustness:f.audioRobustness||e.audioRobustness,serverCertificate:f.serverCertificate||e.serverCertificate,initData:g,keyIds:h});break}return c}k.Sd=function(){this.a.forEach(function(a){var b=a.Eb,c=a.da.expiration;isNaN(c)&&(c=Infinity);c!=b&&(this.na(a.da.sessionId,c),a.Eb=c)}.bind(this))};function Bb(a){return!a||1==a.length&&1E-6>a.end(0)-a.start(0)?null:a.length?a.end(a.length-1):null}function Cb(a,b){return!a||!a.length||1==a.length&&1E-6>a.end(0)-a.start(0)?!1:b>=a.start(0)&&b<=a.end(a.length-1)}function Db(a,b){if(!a||!a.length||1==a.length&&1E-6>a.end(0)-a.start(0))return 0;for(var c=0,d=a.length-1;0<=d&&a.end(d)>b;--d)c+=a.end(d)-Math.max(a.start(d),b);return c};function Eb(a){this.f=null;this.c=a;this.h=0;this.g=Infinity;this.a=this.b=null}var Fb={};function Gb(a,b){Fb[a]=b.length?Hb.bind(null,b):b}n("shaka.text.TextEngine.registerParser",Gb);n("shaka.text.TextEngine.unregisterParser",function(a){delete Fb[a]});Eb.prototype.o=function(){this.c=this.f=null;return Promise.resolve()};Eb.prototype.ie=function(a){this.c=a};Eb.prototype.setDisplayer=Eb.prototype.ie;
function Ib(a,b,c,d){return Promise.resolve().then(function(){if(this.f&&this.c)if(null==c||null==d)this.f.parseInit(b);else{var a=this.f.parseMedia(b,{periodStart:this.h,segmentStart:c,segmentEnd:d}).filter(function(a){return a.startTime<this.g}.bind(this));this.c.append(a);null==this.b&&(this.b=c);this.a=Math.min(d,this.g)}}.bind(a))}
Eb.prototype.remove=function(a,b){return Promise.resolve().then(function(){!this.c||!this.c.remove(a,b)||null==this.b||b<=this.b||a>=this.a||(a<=this.b&&b>=this.a?this.b=this.a=null:a<=this.b&&b<this.a?this.b=b:a>this.b&&b>=this.a&&(this.a=a))}.bind(this))};function Hb(a){this.Ra=a}Hb.prototype.parseInit=function(a){this.Ra(a,0,null,null)};Hb.prototype.parseMedia=function(a,b){return this.Ra(a,b.periodStart,b.segmentStart,b.segmentEnd)};function Jb(a,b,c){this.g=a;this.f=b;this.j=c;this.c={};this.a=null;this.b={};this.h=new B;this.i=!1}
function Kb(){var a={};'video/mp4; codecs="avc1.42E01E",video/mp4; codecs="avc3.42E01E",video/mp4; codecs="hev1.1.6.L93.90",video/mp4; codecs="hvc1.1.6.L93.90",video/mp4; codecs="hev1.2.4.L153.B0"; eotf="smpte2084",video/mp4; codecs="hvc1.2.4.L153.B0"; eotf="smpte2084",video/mp4; codecs="vp9",video/mp4; codecs="vp09.00.10.08",audio/mp4; codecs="mp4a.40.2",audio/mp4; codecs="ac-3",audio/mp4; codecs="ec-3",audio/mp4; codecs="opus",audio/mp4; codecs="flac",video/webm; codecs="vp8",video/webm; codecs="vp9",video/webm; codecs="av1",audio/webm; codecs="vorbis",audio/webm; codecs="opus",video/mp2t; codecs="avc1.42E01E",video/mp2t; codecs="avc3.42E01E",video/mp2t; codecs="hvc1.1.6.L93.90",video/mp2t; codecs="mp4a.40.2",video/mp2t; codecs="ac-3",video/mp2t; codecs="ec-3",video/mp2t; codecs="mp4a.40.2",text/vtt,application/mp4; codecs="wvtt",application/ttml+xml,application/mp4; codecs="stpp"'.split(",").forEach(function(b){a[b]=!!Fb[b]||
MediaSource.isTypeSupported(b);var c=b.split(";")[0];a[c]=a[c]||a[b]});return a}k=Jb.prototype;k.o=function(){this.i=!0;var a=[],b;for(b in this.b){var c=this.b[b],d=c[0];this.b[b]=c.slice(0,1);d&&a.push(d.p["catch"](Ca));for(d=1;d<c.length;++d)c[d].p["catch"](Ca),c[d].p.reject()}this.a&&a.push(this.a.o());return Promise.all(a).then(function(){this.h.o();this.j=this.a=this.f=this.g=this.h=null;this.c={};this.b={}}.bind(this))};
k.init=function(a){for(var b in a){var c=a[b],c=Xa(c.mimeType,c.codecs);"text"==b?Lb(this,c):(c=this.f.addSourceBuffer(c),C(this.h,c,"error",this.we.bind(this,b)),C(this.h,c,"updateend",this.Ha.bind(this,b)),this.c[b]=c,this.b[b]=[])}};function Lb(a,b){a.a||(a.a=new Eb(a.j));a.a.f=new Fb[b]}function Mb(a,b){if("text"==b)var c=a.a.b;else c=Nb(a,b),c=!c||1==c.length&&1E-6>c.end(0)-c.start(0)?null:1==c.length&&0>c.start(0)?0:c.length?c.start(0):null;return c}
function Nb(a,b){try{return a.c[b].buffered}catch(c){return null}}function Ob(a,b,c,d,e){return"text"==b?Ib(a.a,c,d,e):Pb(a,b,a.ve.bind(a,b,c))}k.remove=function(a,b,c){return"text"==a?this.a.remove(b,c):Pb(this,a,this.vc.bind(this,a,b,c))};function Qb(a,b){return"text"==b?a.a.remove(0,Infinity):Pb(a,b,a.vc.bind(a,b,0,a.f.duration))}
function Rb(a,b,c,d){if("text"==b)return a.a.h=c,null!=d&&(a.a.g=d),Promise.resolve();null==d&&(d=Infinity);return Promise.all([Pb(a,b,a.Kc.bind(a,b)),Pb(a,b,a.ke.bind(a,b,c)),Pb(a,b,a.he.bind(a,b,d))])}k.endOfStream=function(a){return Sb(this,function(){a?this.f.endOfStream(a):this.f.endOfStream()}.bind(this))};k.ea=function(a){return Sb(this,function(){this.f.duration=a}.bind(this))};k.Y=function(){return this.f.duration};k.ve=function(a,b){this.c[a].appendBuffer(b)};
k.vc=function(a,b,c){c<=b?this.Ha(a):this.c[a].remove(b,c)};k.Kc=function(a){var b=this.c[a].appendWindowEnd;this.c[a].abort();this.c[a].appendWindowEnd=b;this.Ha(a)};k.Tc=function(a){this.g.currentTime-=.001;this.Ha(a)};k.ke=function(a,b){this.c[a].timestampOffset=b;this.Ha(a)};k.he=function(a,b){this.c[a].appendWindowEnd=b+.04;this.Ha(a)};k.we=function(a){this.b[a][0].p.reject(new v(2,3,3014,this.g.error?this.g.error.code:0))};k.Ha=function(a){var b=this.b[a][0];b&&(b.p.resolve(),Tb(this,a))};
function Pb(a,b,c){if(a.i)return Promise.reject();c={start:c,p:new y};a.b[b].push(c);if(1==a.b[b].length)try{c.start()}catch(d){"QuotaExceededError"==d.name?c.p.reject(new v(2,3,3017,b)):c.p.reject(new v(2,3,3015,d)),Tb(a,b)}return c.p}
function Sb(a,b){if(a.i)return Promise.reject();var c=[],d;for(d in a.c){var e=new y,f={start:function(a){a.resolve()}.bind(null,e),p:e};a.b[d].push(f);c.push(e);1==a.b[d].length&&f.start()}return Promise.all(c).then(function(){var a;try{b()}catch(l){var c=Promise.reject(new v(2,3,3015,l))}for(a in this.c)Tb(this,a);return c}.bind(a),function(){return Promise.reject()}.bind(a))}function Tb(a,b){a.b[b].shift();var c=a.b[b][0];if(c)try{c.start()}catch(d){c.p.reject(new v(2,3,3015,d)),Tb(a,b)}};function Ub(a,b,c){return c==b||a>=Vb&&c==b.split("-")[0]||a>=Wb&&c.split("-")[0]==b.split("-")[0]?!0:!1}var Vb=1,Wb=2;function Xb(a){a=a.toLowerCase().split("-");var b=Yb[a[0]];b&&(a[0]=b);return a.join("-")}
var Yb={aar:"aa",abk:"ab",afr:"af",aka:"ak",alb:"sq",amh:"am",ara:"ar",arg:"an",arm:"hy",asm:"as",ava:"av",ave:"ae",aym:"ay",aze:"az",bak:"ba",bam:"bm",baq:"eu",bel:"be",ben:"bn",bih:"bh",bis:"bi",bod:"bo",bos:"bs",bre:"br",bul:"bg",bur:"my",cat:"ca",ces:"cs",cha:"ch",che:"ce",chi:"zh",chu:"cu",chv:"cv",cor:"kw",cos:"co",cre:"cr",cym:"cy",cze:"cs",dan:"da",deu:"de",div:"dv",dut:"nl",dzo:"dz",ell:"el",eng:"en",epo:"eo",est:"et",eus:"eu",ewe:"ee",fao:"fo",fas:"fa",fij:"fj",fin:"fi",fra:"fr",fre:"fr",
fry:"fy",ful:"ff",geo:"ka",ger:"de",gla:"gd",gle:"ga",glg:"gl",glv:"gv",gre:"el",grn:"gn",guj:"gu",hat:"ht",hau:"ha",heb:"he",her:"hz",hin:"hi",hmo:"ho",hrv:"hr",hun:"hu",hye:"hy",ibo:"ig",ice:"is",ido:"io",iii:"ii",iku:"iu",ile:"ie",ina:"ia",ind:"id",ipk:"ik",isl:"is",ita:"it",jav:"jv",jpn:"ja",kal:"kl",kan:"kn",kas:"ks",kat:"ka",kau:"kr",kaz:"kk",khm:"km",kik:"ki",kin:"rw",kir:"ky",kom:"kv",kon:"kg",kor:"ko",kua:"kj",kur:"ku",lao:"lo",lat:"la",lav:"lv",lim:"li",lin:"ln",lit:"lt",ltz:"lb",lub:"lu",
lug:"lg",mac:"mk",mah:"mh",mal:"ml",mao:"mi",mar:"mr",may:"ms",mkd:"mk",mlg:"mg",mlt:"mt",mon:"mn",mri:"mi",msa:"ms",mya:"my",nau:"na",nav:"nv",nbl:"nr",nde:"nd",ndo:"ng",nep:"ne",nld:"nl",nno:"nn",nob:"nb",nor:"no",nya:"ny",oci:"oc",oji:"oj",ori:"or",orm:"om",oss:"os",pan:"pa",per:"fa",pli:"pi",pol:"pl",por:"pt",pus:"ps",que:"qu",roh:"rm",ron:"ro",rum:"ro",run:"rn",rus:"ru",sag:"sg",san:"sa",sin:"si",slk:"sk",slo:"sk",slv:"sl",sme:"se",smo:"sm",sna:"sn",snd:"sd",som:"so",sot:"st",spa:"es",sqi:"sq",
srd:"sc",srp:"sr",ssw:"ss",sun:"su",swa:"sw",swe:"sv",tah:"ty",tam:"ta",tat:"tt",tel:"te",tgk:"tg",tgl:"tl",tha:"th",tib:"bo",tir:"ti",ton:"to",tsn:"tn",tso:"ts",tuk:"tk",tur:"tr",twi:"tw",uig:"ug",ukr:"uk",urd:"ur",uzb:"uz",ven:"ve",vie:"vi",vol:"vo",wel:"cy",wln:"wa",wol:"wo",xho:"xh",yid:"yi",yor:"yo",zha:"za",zho:"zh",zul:"zu"};function Zb(a,b,c){var d=a.video;return d&&(d.width<b.minWidth||d.width>b.maxWidth||d.width>c.width||d.height<b.minHeight||d.height>b.maxHeight||d.height>c.height||d.width*d.height<b.minPixels||d.width*d.height>b.maxPixels)||a.bandwidth<b.minBandwidth||a.bandwidth>b.maxBandwidth?!1:!0}function $b(a,b,c){var d=!1;a.variants.forEach(function(a){var e=a.allowedByApplication;a.allowedByApplication=Zb(a,b,c);e!=a.allowedByApplication&&(d=!0)});return d}
function ac(a,b,c){var d=b.video,e=b.audio;for(b=0;b<c.variants.length;++b){var f=c.variants[b],g=a,h=e,l=d;(g&&g.D&&!zb(g,f)?0:bc(f.audio,g,h)&&bc(f.video,g,l))||(c.variants.splice(b,1),--b)}for(b=0;b<c.textStreams.length;++b)a=c.textStreams[b],Fb[Xa(a.mimeType,a.codecs)]||(c.textStreams.splice(b,1),--b)}
function bc(a,b,c){if(!a)return!0;var d=null;b&&b.D&&(d=b.s);b=Xa(a.mimeType,a.codecs);var e=a.mimeType,f;for(f in Ya){var g=a[f],h=Ya[f];g&&(e+="; "+h+'="'+g+'"')}return!Fb[Xa(a.mimeType,a.codecs)]&&!MediaSource.isTypeSupported(e)||d&&a.encrypted&&0>d.indexOf(b)||c&&(a.mimeType!=c.mimeType||a.codecs.split(".")[0]!=c.codecs.split(".")[0])?!1:!0}
function cc(a,b,c){var d=null;return dc(a.variants).map(function(a){var e;a.video&&a.audio?e=c==a.video.id&&b==a.audio.id:e=a.video&&c==a.video.id||a.audio&&b==a.audio.id;var g="";a.video&&(g+=a.video.codecs);a.audio&&(""!=g&&(g+=", "),g+=a.audio.codecs,d=a.audio.label);var h=a.audio?a.audio.codecs:null,l=a.video?a.video.codecs:null,m=null;a.video?m=a.video.mimeType:a.audio&&(m=a.audio.mimeType);var q=null;a.audio?q=a.audio.kind:a.video&&(q=a.video.kind);var w=Ja((a.audio?a.audio.roles:[]).concat(a.video?
a.video.roles:[]));return{id:a.id,active:e,type:"variant",bandwidth:a.bandwidth,language:a.language,label:d,kind:q||null,width:a.video?a.video.width:null,height:a.video?a.video.height:null,frameRate:a.video?a.video.frameRate:void 0,mimeType:m,codecs:g,audioCodec:h,videoCodec:l,primary:a.primary,roles:w,videoId:a.video?a.video.id:null,audioId:a.audio?a.audio.id:null,channelsCount:a.audio?a.audio.channelsCount:null,audioBandwidth:a.audio&&a.audio.bandwidth?a.audio.bandwidth:null,videoBandwidth:a.video&&
a.video.bandwidth?a.video.bandwidth:null}})}function ec(a,b){return a.textStreams.map(function(a){return{id:a.id,active:b==a.id,type:"text",language:a.language,label:a.label,kind:a.kind,mimeType:a.mimeType,codecs:a.codecs||null,audioCodec:null,videoCodec:null,primary:a.primary,roles:a.roles,channelsCount:null,audioBandwidth:null,videoBandwidth:null}})}function fc(a,b){for(var c=0;c<a.variants.length;c++)if(a.variants[c].id==b.id)return a.variants[c];return null}
function gc(a,b){for(var c=0;c<a.textStreams.length;c++)if(a.textStreams[c].id==b.id)return a.textStreams[c];return null}function dc(a){return a.filter(function(a){return a.allowedByApplication&&a.allowedByKeySystem})}
function hc(a,b,c,d){var e=dc(a.variants),f=e.filter(function(a){return a.primary});f.length||(f=e);var g=f.length?f[0].language:"",f=f.filter(function(a){return a.language==g});if(b){var h=Xb(b);[Wb,Vb,0].forEach(function(a){var b=!1;e.forEach(function(c){h=Xb(h);var e=Xb(c.language);Ub(a,h,e)&&(b?f.push(c):(f=[c],b=!0),d&&(d.audio=!0))})})}if(c&&(a=ic(f,c),a.length))return a;a=f.map(function(a){return(a.audio?a.audio.roles:[]).concat(a.video?a.video.roles:[])}).reduce(z,[]);return a.length?ic(f,
a[0]):f}function jc(a,b,c,d){var e=a.textStreams,f=e.filter(function(a){return a.primary});f.length||(f=e);var g=f.length?f[0].language:"",f=f.filter(function(a){return a.language==g});if(b){var h=Xb(b);[Wb,Vb,0].forEach(function(a){var b=!1;e.forEach(function(c){var e=Xb(c.language);Ub(a,h,e)&&(b?f.push(c):(f=[c],b=!0),d&&(d.text=!0))})})}if(c&&(a=kc(f,c),a.length))return a;a=f.map(function(a){return a.roles}).reduce(z,[]);return a.length?kc(f,a[0]):f}
function ic(a,b){return a.filter(function(a){return a.audio&&0<=a.audio.roles.indexOf(b)||a.video&&0<=a.video.roles.indexOf(b)})}function kc(a,b){return a.filter(function(a){return 0<=a.roles.indexOf(b)})}function lc(a,b,c){for(var d=0;d<c.length;d++)if(c[d].audio==a&&c[d].video==b)return c[d];return null}function mc(a,b,c){function d(a,b){return null==a?null==b:b.id==a}for(var e=0;e<c.length;e++)if(d(a,c[e].audio)&&d(b,c[e].video))return c[e];return null}
function nc(a,b){for(var c=a.periods.length-1;0<c;--c)if(b+Ra>=a.periods[c].startTime)return c;return 0}function oc(a,b){for(var c=0;c<a.periods.length;++c){var d=a.periods[c];if("text"==b.type)for(var e=0;e<d.textStreams.length;++e){if(d.textStreams[e]==b)return c}else for(e=0;e<d.variants.length;++e){var f=d.variants[e];if(f.audio==b||f.video==b||f.video&&f.video.trickModeVideo==b)return c}}return-1};function F(){this.h=null;this.c=!1;this.b=new fa;this.g=[];this.i=!1;this.a=this.f=null}n("shaka.abr.SimpleAbrManager",F);F.prototype.stop=function(){this.h=null;this.c=!1;this.g=[];this.f=null};F.prototype.stop=F.prototype.stop;F.prototype.init=function(a){this.h=a};F.prototype.init=F.prototype.init;
F.prototype.chooseVariant=function(){var a=pc(this.a.restrictions,this.g),b=this.b.getBandwidthEstimate(this.a.defaultBandwidthEstimate);if(this.g.length&&!a.length)throw new v(2,4,4012);for(var c=a[0]||null,d=0;d<a.length;++d){var e=a[d],f=(a[d+1]||{bandwidth:Infinity}).bandwidth/this.a.bandwidthUpgradeTarget;b>=e.bandwidth/this.a.bandwidthDowngradeTarget&&b<=f&&(c=e)}this.f=Date.now();return c};F.prototype.chooseVariant=F.prototype.chooseVariant;F.prototype.enable=function(){this.c=!0};
F.prototype.enable=F.prototype.enable;F.prototype.disable=function(){this.c=!1};F.prototype.disable=F.prototype.disable;F.prototype.segmentDownloaded=function(a,b){var c=this.b;if(!(16E3>b)){var d=8E3*b/a,e=a/1E3;c.a+=b;da(c.b,e,d);da(c.c,e,d)}if(null!=this.f&&this.c)a:{if(!this.i){if(!(128E3<=this.b.a))break a;this.i=!0}else if(Date.now()-this.f<1E3*this.a.switchInterval)break a;c=this.chooseVariant();this.b.getBandwidthEstimate(this.a.defaultBandwidthEstimate);this.h(c)}};
F.prototype.segmentDownloaded=F.prototype.segmentDownloaded;F.prototype.getBandwidthEstimate=function(){return this.b.getBandwidthEstimate(this.a.defaultBandwidthEstimate)};F.prototype.getBandwidthEstimate=F.prototype.getBandwidthEstimate;F.prototype.setVariants=function(a){this.g=a};F.prototype.setVariants=F.prototype.setVariants;F.prototype.configure=function(a){this.a=a};F.prototype.configure=F.prototype.configure;
function pc(a,b){return b.filter(function(b){return Zb(b,a,{width:Infinity,height:Infinity})}).sort(function(a,b){return a.bandwidth-b.bandwidth})};function G(a,b){var c=b||{},d;for(d in c)this[d]=c[d];this.defaultPrevented=this.cancelable=this.bubbles=!1;this.timeStamp=window.performance&&window.performance.now?window.performance.now():Date.now();this.type=a;this.isTrusted=!1;this.target=this.currentTarget=null;this.a=!1}G.prototype.preventDefault=function(){this.cancelable&&(this.defaultPrevented=!0)};G.prototype.stopImmediatePropagation=function(){this.a=!0};G.prototype.stopPropagation=function(){};var qc="ended play playing pause pausing ratechange seeked seeking timeupdate volumechange".split(" "),rc="buffered currentTime duration ended loop muted paused playbackRate seeking videoHeight videoWidth volume".split(" "),sc=["loop","playbackRate"],tc=["pause","play"],uc="adaptation buffering emsg error loading unloading texttrackvisibility timelineregionadded timelineregionenter timelineregionexit trackschanged".split(" "),vc="drmInfo getAudioLanguages getConfiguration getExpiration getManifestUri getPlaybackRate getTextLanguages getTextTracks getStats getVariantTracks isAudioOnly isBuffering isInProgress isLive isTextTrackVisible keySystem seekRange".split(" "),
wc=["getPlayheadTimeAsDate","getPresentationStartTimeAsDate"],xc=[["getConfiguration","configure"]],yc=[["isTextTrackVisible","setTextTrackVisibility"]],zc="addTextTrack cancelTrickPlay configure resetConfiguration retryStreaming selectAudioLanguage selectTextLanguage selectTextTrack selectVariantTrack setTextTrackVisibility trickPlay".split(" "),Ac=["load","unload"];
function Bc(a){return JSON.stringify(a,function(a,c){if("manager"!=a&&"function"!=typeof c){if(c instanceof Event||c instanceof G){var b={},e;for(e in c){var f=c[e];f&&"object"==typeof f||e in Event||(b[e]=f)}return b}if(c instanceof TimeRanges)for(b={__type__:"TimeRanges",length:c.length,start:[],end:[]},e=0;e<c.length;++e)b.start.push(c.start(e)),b.end.push(c.end(e));else b="number"==typeof c?isNaN(c)?"NaN":isFinite(c)?c:0>c?"-Infinity":"Infinity":c;return b}})}
function Cc(a){return JSON.parse(a,function(a,c){return"NaN"==c?NaN:"-Infinity"==c?-Infinity:"Infinity"==c?Infinity:c&&"object"==typeof c&&"TimeRanges"==c.__type__?Dc(c):c})}function Dc(a){return{length:a.length,start:function(b){return a.start[b]},end:function(b){return a.end[b]}}};function Ec(a,b,c,d,e,f){this.D=a;this.h=b;this.I=c;this.l=!1;this.B=d;this.C=e;this.s=f;this.c=this.i=!1;this.w="";this.a=this.j=null;this.b={video:{},player:{}};this.m=0;this.f={};this.g=null}var Fc=!1;k=Ec.prototype;k.o=function(){Gc(this);this.a&&(this.a.leave(function(){},function(){}),this.a=null);this.C=this.B=this.h=null;this.c=this.i=!1;this.g=this.f=this.b=this.j=null;return Promise.resolve()};k.Z=function(){return this.c};k.Kb=function(){return this.w};
k.init=function(){if(window.chrome&&chrome.cast&&chrome.cast.isAvailable){delete window.__onGCastApiAvailable;this.i=!0;this.h();var a=new chrome.cast.SessionRequest(this.D),a=new chrome.cast.ApiConfig(a,this.qd.bind(this),this.Bd.bind(this),"origin_scoped");chrome.cast.initialize(a,function(){},function(){});Fc&&setTimeout(this.h.bind(this),20)}else window.__onGCastApiAvailable=function(a){a&&this.init()}.bind(this)};k.Ob=function(a){this.j=a;this.c&&Hc(this,{type:"appData",appData:this.j})};
k.cast=function(a){if(!this.i)return Promise.reject(new v(1,8,8E3));if(!Fc)return Promise.reject(new v(1,8,8001));if(this.c)return Promise.reject(new v(1,8,8002));this.g=new y;chrome.cast.requestSession(this.Gb.bind(this,a),this.hc.bind(this));return this.g};k.ib=function(){this.c&&(Gc(this),this.a&&(this.a.stop(function(){},function(){}),this.a=null))};
k.get=function(a,b){if("video"==a){if(0<=tc.indexOf(b))return this.uc.bind(this,a,b)}else if("player"==a){if(0<=wc.indexOf(b)&&!this.get("player","isLive")())return function(){};if(0<=zc.indexOf(b))return this.uc.bind(this,a,b);if(0<=Ac.indexOf(b))return this.Xd.bind(this,a,b);if(0<=vc.indexOf(b))return this.qc.bind(this,a,b)}return this.qc(a,b)};k.set=function(a,b,c){this.b[a][b]=c;Hc(this,{type:"set",targetName:a,property:b,value:c})};
k.Gb=function(a,b){this.a=b;this.a.addUpdateListener(this.ic.bind(this));this.a.addMessageListener("urn:x-cast:com.google.shaka.v2",this.vd.bind(this));this.ic();Hc(this,{type:"init",initState:a,appData:this.j});this.g.resolve()};k.hc=function(a){var b=8003;switch(a.code){case "cancel":b=8004;break;case "timeout":b=8005;break;case "receiver_unavailable":b=8006}this.g.reject(new v(2,8,b,a))};k.qc=function(a,b){return this.b[a][b]};
k.uc=function(a,b){Hc(this,{type:"call",targetName:a,methodName:b,args:Array.prototype.slice.call(arguments,2)})};k.Xd=function(a,b){var c=Array.prototype.slice.call(arguments,2),d=new y,e=this.m.toString();this.m++;this.f[e]=d;Hc(this,{type:"asyncCall",targetName:a,methodName:b,args:c,id:e});return d};k.qd=function(a){var b=this.s();this.g=new y;this.l=!0;this.Gb(b,a)};k.Bd=function(a){Fc="available"==a;this.h()};
k.ic=function(){var a=this.a?"connected"==this.a.status:!1;if(this.c&&!a){this.C();for(var b in this.b)this.b[b]={};Gc(this)}this.w=(this.c=a)?this.a.receiver.friendlyName:"";this.h()};function Gc(a){for(var b in a.f){var c=a.f[b];delete a.f[b];c.reject(new v(1,7,7E3))}}
k.vd=function(a,b){var c=Cc(b);switch(c.type){case "event":var d=c.targetName,e=c.event;this.B(d,new G(e.type,e));break;case "update":e=c.update;for(d in e){var c=this.b[d]||{};for(f in e[d])c[f]=e[d][f]}this.l&&(this.I(),this.l=!1);break;case "asyncComplete":d=c.id;var f=c.error;c=this.f[d];delete this.f[d];if(c)if(f){d=new v(f.severity,f.category,f.code);for(e in f)d[e]=f[e];c.reject(d)}else c.resolve()}};
function Hc(a,b){var c=Bc(b);a.a.sendMessage("urn:x-cast:com.google.shaka.v2",c,function(){},ga)};function p(){this.ub=new Ma;this.Za=this}p.prototype.addEventListener=function(a,b){this.ub.push(a,b)};p.prototype.removeEventListener=function(a,b){this.ub.remove(a,b)};p.prototype.dispatchEvent=function(a){for(var b=this.ub.get(a.type)||[],c=0;c<b.length;++c){a.target=this.Za;a.currentTarget=this.Za;var d=b[c];try{d.handleEvent?d.handleEvent(a):d.call(this,a)}catch(e){}if(a.a)break}return a.defaultPrevented};function H(a,b,c){p.call(this);this.c=a;this.b=b;this.i=this.g=this.f=this.j=this.h=null;this.a=new Ec(c,this.qe.bind(this),this.re.bind(this),this.se.bind(this),this.te.bind(this),this.bc.bind(this));Ic(this)}ba(H);n("shaka.cast.CastProxy",H);H.prototype.o=function(a){a&&this.a&&this.a.ib();a=[this.i?this.i.o():null,this.b?this.b.o():null,this.a?this.a.o():null];this.a=this.i=this.j=this.h=this.b=this.c=null;return Promise.all(a)};H.prototype.destroy=H.prototype.o;H.prototype.gd=function(){return this.h};
H.prototype.getVideo=H.prototype.gd;H.prototype.Yc=function(){return this.j};H.prototype.getPlayer=H.prototype.Yc;H.prototype.Lc=function(){return this.a?this.a.i&&Fc:!1};H.prototype.canCast=H.prototype.Lc;H.prototype.Z=function(){return this.a?this.a.Z():!1};H.prototype.isCasting=H.prototype.Z;H.prototype.Kb=function(){return this.a?this.a.Kb():""};H.prototype.receiverName=H.prototype.Kb;H.prototype.cast=function(){var a=this.bc();return this.a.cast(a).then(function(){return this.b.qb()}.bind(this))};
H.prototype.cast=H.prototype.cast;H.prototype.Ob=function(a){this.a.Ob(a)};H.prototype.setAppData=H.prototype.Ob;H.prototype.ze=function(){var a=this.a;if(a.c){var b=a.s();chrome.cast.requestSession(a.Gb.bind(a,b),a.hc.bind(a))}};H.prototype.suggestDisconnect=H.prototype.ze;H.prototype.ib=function(){this.a.ib()};H.prototype.forceDisconnect=H.prototype.ib;
function Ic(a){a.a.init();a.i=new B;qc.forEach(function(a){C(this.i,this.c,a,this.He.bind(this))}.bind(a));uc.forEach(function(a){C(this.i,this.b,a,this.Rd.bind(this))}.bind(a));a.h={};for(var b in a.c)Object.defineProperty(a.h,b,{configurable:!1,enumerable:!0,get:a.Ge.bind(a,b),set:a.Ie.bind(a,b)});a.j={};for(b in a.b)Object.defineProperty(a.j,b,{configurable:!1,enumerable:!0,get:a.Qd.bind(a,b)});a.f=new p;a.f.Za=a.h;a.g=new p;a.g.Za=a.j}k=H.prototype;
k.bc=function(){var a={video:{},player:{},playerAfterLoad:{},manifest:this.b.fb,startTime:null};this.c.pause();sc.forEach(function(b){a.video[b]=this.c[b]}.bind(this));this.c.ended||(a.startTime=this.c.currentTime);xc.forEach(function(b){var c=b[1];b=this.b[b[0]]();a.player[c]=b}.bind(this));yc.forEach(function(b){var c=b[1];b=this.b[b[0]]();a.playerAfterLoad[c]=b}.bind(this));return a};k.qe=function(){this.dispatchEvent(new G("caststatuschanged"))};
k.re=function(){this.f.dispatchEvent(new G(this.h.paused?"pause":"play"))};
k.te=function(){xc.forEach(function(a){var b=a[1];a=this.a.get("player",a[0])();this.b[b](a)}.bind(this));var a=this.a.get("player","getManifestUri")(),b=this.a.get("video","ended"),c=Promise.resolve(),d=this.c.autoplay,e=null;b||(e=this.a.get("video","currentTime"));a&&(this.c.autoplay=!1,c=this.b.load(a,e),c["catch"](function(a){this.b.dispatchEvent(new G("error",{detail:a}))}.bind(this)));var f={};sc.forEach(function(a){f[a]=this.a.get("video",a)}.bind(this));c.then(function(){sc.forEach(function(a){this.c[a]=
f[a]}.bind(this));yc.forEach(function(a){var b=a[1];a=this.a.get("player",a[0])();this.b[b](a)}.bind(this));this.c.autoplay=d;a&&this.c.play()}.bind(this))};
k.Ge=function(a){if("addEventListener"==a)return this.f.addEventListener.bind(this.f);if("removeEventListener"==a)return this.f.removeEventListener.bind(this.f);if(this.a.Z()&&!Object.keys(this.a.b.video).length){var b=this.c[a];if("function"!=typeof b)return b}return this.a.Z()?this.a.get("video",a):(b=this.c[a],"function"==typeof b&&(b=b.bind(this.c)),b)};k.Ie=function(a,b){this.a.Z()?this.a.set("video",a,b):this.c[a]=b};k.He=function(a){this.a.Z()||this.f.dispatchEvent(new G(a.type,a))};
k.Qd=function(a){return"addEventListener"==a?this.g.addEventListener.bind(this.g):"removeEventListener"==a?this.g.removeEventListener.bind(this.g):"getMediaElement"==a?function(){return this.h}.bind(this):"getNetworkingEngine"==a?this.b.cc.bind(this.b):this.a.Z()&&!Object.keys(this.a.b.video).length&&0<=vc.indexOf(a)||!this.a.Z()?(a=this.b[a],a.bind(this.b)):this.a.get("player",a)};k.Rd=function(a){this.a.Z()||this.g.dispatchEvent(a)};
k.se=function(a,b){this.a.Z()&&("video"==a?this.f.dispatchEvent(b):"player"==a&&this.g.dispatchEvent(b))};function I(a,b,c,d){p.call(this);this.a=a;this.b=b;this.j={video:a,player:b};this.l=c||function(){};this.m=d||function(a){return a};this.i=!1;this.f=!0;this.h=this.g=this.c=null;Jc(this)}ba(I);n("shaka.cast.CastReceiver",I);I.prototype.isConnected=function(){return this.i};I.prototype.isConnected=I.prototype.isConnected;I.prototype.kd=function(){return this.f};I.prototype.isIdle=I.prototype.kd;
I.prototype.o=function(){var a=this.b?this.b.o():Promise.resolve();null!=this.h&&window.clearTimeout(this.h);this.l=this.j=this.b=this.a=null;this.i=!1;this.f=!0;this.h=this.g=this.c=null;return a.then(function(){cast.receiver.CastReceiverManager.getInstance().stop()})};I.prototype.destroy=I.prototype.o;
function Jc(a){var b=cast.receiver.CastReceiverManager.getInstance();b.onSenderConnected=a.oc.bind(a);b.onSenderDisconnected=a.oc.bind(a);b.onSystemVolumeChanged=a.Sc.bind(a);a.g=b.getCastMessageBus("urn:x-cast:com.google.cast.media");a.g.onMessage=a.rd.bind(a);a.c=b.getCastMessageBus("urn:x-cast:com.google.shaka.v2");a.c.onMessage=a.Ed.bind(a);b.start();qc.forEach(function(a){this.a.addEventListener(a,this.rc.bind(this,"video"))}.bind(a));uc.forEach(function(a){this.b.addEventListener(a,this.rc.bind(this,
"player"))}.bind(a));cast.__platform__&&cast.__platform__.canDisplayType('video/mp4; codecs="avc1.640028"; width=3840; height=2160')?a.b.Pb(3840,2160):a.b.Pb(1920,1080);a.b.addEventListener("loading",function(){this.f=!1;Kc(this)}.bind(a));a.a.addEventListener("playing",function(){this.f=!1;Kc(this)}.bind(a));a.a.addEventListener("pause",function(){Kc(this)}.bind(a));a.b.addEventListener("unloading",function(){this.f=!0;Kc(this)}.bind(a));a.a.addEventListener("ended",function(){window.setTimeout(function(){this.a&&
this.a.ended&&(this.f=!0,Kc(this))}.bind(this),5E3)}.bind(a))}k=I.prototype;k.oc=function(){this.i=!!cast.receiver.CastReceiverManager.getInstance().getSenders().length;Kc(this)};function Kc(a){Promise.resolve().then(function(){this.dispatchEvent(new G("caststatuschanged"));Pc(this,0)}.bind(a))}
function Qc(a,b,c){for(var d in b.player)a.b[d](b.player[d]);a.l(c);c=Promise.resolve();var e=a.a.autoplay;b.manifest&&(a.a.autoplay=!1,c=a.b.load(b.manifest,b.startTime),c["catch"](function(a){this.b.dispatchEvent(new G("error",{detail:a}))}.bind(a)));c.then(function(){var a;for(a in b.video){var c=b.video[a];this.a[a]=c}for(a in b.playerAfterLoad)c=b.playerAfterLoad[a],this.b[a](c);this.a.autoplay=e;b.manifest&&(this.a.play(),Pc(this,0))}.bind(a))}
k.rc=function(a,b){this.Hb();Rc(this,{type:"event",targetName:a,event:b},this.c)};
k.Hb=function(){null!=this.h&&window.clearTimeout(this.h);this.h=window.setTimeout(this.Hb.bind(this),500);var a={video:{},player:{}};rc.forEach(function(b){a.video[b]=this.a[b]}.bind(this));var b=vc;this.b.R()&&(b=b.concat(wc));b.forEach(function(b){a.player[b]=this.b[b]()}.bind(this));if(b=cast.receiver.CastReceiverManager.getInstance().getSystemVolume())a.video.volume=b.level,a.video.muted=b.muted;Rc(this,{type:"update",update:a},this.c)};
k.Sc=function(){var a=cast.receiver.CastReceiverManager.getInstance().getSystemVolume();a&&Rc(this,{type:"update",update:{video:{volume:a.level,muted:a.muted}}},this.c);Rc(this,{type:"event",targetName:"video",event:{type:"volumechange"}},this.c)};
k.Ed=function(a){var b=Cc(a.data);switch(b.type){case "init":Qc(this,b.initState,b.appData);this.Hb();break;case "appData":this.l(b.appData);break;case "set":var c=b.targetName,d=b.property,e=b.value;if("video"==c)if(b=cast.receiver.CastReceiverManager.getInstance(),"volume"==d){b.setSystemVolumeLevel(e);break}else if("muted"==d){b.setSystemVolumeMuted(e);break}this.j[c][d]=e;break;case "call":c=b.targetName;d=b.methodName;e=b.args;c=this.j[c];c[d].apply(c,e);break;case "asyncCall":c=b.targetName,
d=b.methodName,e=b.args,b=b.id,a=a.senderId,c=this.j[c],c[d].apply(c,e).then(this.zc.bind(this,a,b,null),this.zc.bind(this,a,b))}};
k.rd=function(a){var b=Cc(a.data);switch(b.type){case "PLAY":this.a.play();Pc(this,0);break;case "PAUSE":this.a.pause();Pc(this,0);break;case "SEEK":a=b.currentTime;var c=b.resumeState;null!=a&&(this.a.currentTime=Number(a));c&&"PLAYBACK_START"==c?(this.a.play(),Pc(this,0)):c&&"PLAYBACK_PAUSE"==c&&(this.a.pause(),Pc(this,0));break;case "STOP":this.b.qb().then(function(){Pc(this,0)}.bind(this));break;case "GET_STATUS":Pc(this,Number(b.requestId));break;case "VOLUME":c=b.volume;a=c.level;var c=c.muted,
d=this.a.volume,e=this.a.muted;null!=a&&(this.a.volume=Number(a));null!=c&&(this.a.muted=c);d==this.a.volume&&e==this.a.muted||Pc(this,0);break;case "LOAD":c=b.media.contentId;a=b.currentTime;var f=this.m(c);this.a.autoplay=!0;this.b.load(f,a).then(function(){Pc(this,0,{contentId:f,streamType:this.b.R()?"LIVE":"BUFFERED",contentType:""})}.bind(this))["catch"](function(a){var c="LOAD_FAILED";7==a.category&&7E3==a.code&&(c="LOAD_CANCELLED");Rc(this,{requestId:Number(b.requestId),type:c},this.g)}.bind(this));
break;default:Rc(this,{requestId:Number(b.requestId),type:"INVALID_REQUEST",reason:"INVALID_COMMAND"},this.g)}};k.zc=function(a,b,c){Rc(this,{type:"asyncComplete",id:b,error:c},this.c,a)};function Rc(a,b,c,d){a.i&&(a=Bc(b),d?c.getCastChannel(d).send(a):c.broadcast(a))}
function Pc(a,b,c){var d=Sc,d={mediaSessionId:0,playbackRate:a.a.playbackRate,playerState:a.f?d.IDLE:a.b.Na?d.Gc:a.a.paused?d.Hc:d.Ic,currentTime:a.a.currentTime,supportedMediaCommands:15,volume:{level:a.a.volume,muted:a.a.muted}};c&&(d.media=c);Rc(a,{requestId:b,type:"MEDIA_STATUS",status:[d]},a.g)}var Sc={IDLE:"IDLE",Ic:"PLAYING",Gc:"BUFFERING",Hc:"PAUSED"};function Tc(a,b){var c=J(a,b);return 1!=c.length?null:c[0]}function J(a,b){return Array.prototype.filter.call(a.childNodes,function(a){return a.tagName==b})}function Uc(a){var b=a.firstChild;return b&&b.nodeType==Node.TEXT_NODE?a.textContent.trim():null}function K(a,b,c,d){var e=null;a=a.getAttribute(b);null!=a&&(e=c(a));return null==e?void 0!=d?d:null:e}
function Vc(a){if(!a)return null;/^\d+\-\d+\-\d+T\d+:\d+:\d+(\.\d+)?$/.test(a)&&(a+="Z");a=Date.parse(a);return isNaN(a)?null:Math.floor(a/1E3)}function Wc(a){if(!a)return null;a=/^P(?:([0-9]*)Y)?(?:([0-9]*)M)?(?:([0-9]*)D)?(?:T(?:([0-9]*)H)?(?:([0-9]*)M)?(?:([0-9.]*)S)?)?$/.exec(a);if(!a)return null;a=31536E3*Number(a[1]||null)+2592E3*Number(a[2]||null)+86400*Number(a[3]||null)+3600*Number(a[4]||null)+60*Number(a[5]||null)+Number(a[6]||null);return isFinite(a)?a:null}
function Xc(a){var b=/([0-9]+)-([0-9]+)/.exec(a);if(!b)return null;a=Number(b[1]);if(!isFinite(a))return null;b=Number(b[2]);return isFinite(b)?{start:a,end:b}:null}function Yc(a){a=Number(a);return a%1?null:a}function Zc(a){a=Number(a);return!(a%1)&&0<a?a:null}function $c(a){a=Number(a);return!(a%1)&&0<=a?a:null}function ad(a){var b;a=(b=a.match(/^(\d+)\/(\d+)$/))?Number(b[1]/b[2]):Number(a);return isNaN(a)?null:a};var bd={"urn:uuid:1077efec-c0b2-4d02-ace3-3c1e52e2fb4b":"org.w3.clearkey","urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed":"com.widevine.alpha","urn:uuid:9a04f079-9840-4286-ab92-e65be0885f95":"com.microsoft.playready","urn:uuid:f239e769-efa3-4850-9c16-a903c6932efb":"com.adobe.primetime"};
function cd(a,b,c){a=dd(a);var d=null,e=[],f=[],g=a.map(function(a){return a.keyId}).filter(Da);if(g.length&&1<g.filter(Ea).length)throw new v(2,4,4010);c||(f=a.filter(function(a){return"urn:mpeg:dash:mp4protection:2011"==a.yc?(d=a.init||d,!1):!0}),f.length&&(e=ed(d,b,f),e.length||(e=[Qa("",d)])));!a.length||!c&&f.length||(e=Ta(bd).map(function(a){return Qa(a,d)}));var h=g[0]||null;h&&e.forEach(function(a){a.initData.forEach(function(a){a.keyId=h})});return{Yb:h,Ye:d,drmInfos:e,$b:!0}}
function fd(a,b,c,d){var e=cd(a,b,d);if(c.$b){a=1==c.drmInfos.length&&!c.drmInfos[0].keySystem;b=!e.drmInfos.length;if(!c.drmInfos.length||a&&!b)c.drmInfos=e.drmInfos;c.$b=!1}else if(0<e.drmInfos.length&&(c.drmInfos=c.drmInfos.filter(function(a){return e.drmInfos.some(function(b){return b.keySystem==a.keySystem})}),!c.drmInfos.length))throw new v(2,4,4008);return e.Yb||c.Yb}function ed(a,b,c){return c.map(function(c){var d=bd[c.yc];return d?[Qa(d,c.init||a)]:b(c.node)||[]}).reduce(z,[])}
function dd(a){return a.map(function(a){var b=a.getAttribute("schemeIdUri"),d=a.getAttribute("cenc:default_KID"),e=J(a,"cenc:pssh").map(Uc);if(!b)return null;b=b.toLowerCase();if(d&&(d=d.replace(/-/g,"").toLowerCase(),0<=d.indexOf(" ")))throw new v(2,4,4009);var f=[];try{f=e.map(function(a){return{initDataType:"cenc",initData:fb(a),keyId:null}})}catch(g){throw new v(2,4,4007);}return{node:a,yc:b,keyId:d,init:0<f.length?f:null}}).filter(Da)};function gd(a,b,c,d,e){null!=e&&(e=Math.round(e));var f={RepresentationID:b,Number:c,Bandwidth:d,Time:e};return a.replace(/\$(RepresentationID|Number|Bandwidth|Time)?(?:%0([0-9]+)d)?\$/g,function(a,b,c){if("$$"==a)return"$";var d=f[b];if(null==d)return a;"RepresentationID"==b&&c&&(c=void 0);a=d.toString();c=window.parseInt(c,10)||1;return Array(Math.max(0,c-a.length)+1).join("0")+a})}
function hd(a,b){var c=id(a,b,"timescale"),d=1;c&&(d=Zc(c)||1);c=id(a,b,"duration");(c=Zc(c||""))&&(c/=d);var e=id(a,b,"startNumber"),f=id(a,b,"presentationTimeOffset"),g=$c(e||"");if(null==e||null==g)g=1;var h=jd(a,b,"SegmentTimeline"),e=null;if(h){for(var e=d,l=Number(f),m=a.S.duration||Infinity,h=J(h,"S"),q=[],w=0,x=0;x<h.length;++x){var r=h[x],u=K(r,"t",$c),t=K(r,"d",$c),r=K(r,"r",Yc);null!=u&&(u-=l);if(!t)break;u=null!=u?u:w;r=r||0;if(0>r)if(x+1<h.length){r=K(h[x+1],"t",$c);if(null==r)break;
else if(u>=r)break;r=Math.ceil((r-u)/t)-1}else{if(Infinity==m)break;else if(u/e>=m)break;r=Math.ceil((m*e-u)/t)-1}0<q.length&&u!=w&&(q[q.length-1].end=u/e);for(var Fa=0;Fa<=r;++Fa)w=u+t,q.push({start:u/e,end:w/e,Ee:u}),u=w}e=q}return{timescale:d,P:c,za:g,presentationTimeOffset:Number(f)/d||0,Ub:Number(f),H:e}}function id(a,b,c){return[b(a.A),b(a.U),b(a.W)].filter(Da).map(function(a){return a.getAttribute(c)}).reduce(function(a,b){return a||b})}
function jd(a,b,c){return[b(a.A),b(a.U),b(a.W)].filter(Da).map(function(a){return Tc(a,c)}).reduce(function(a,b){return a||b})}function kd(a,b){var c=new DOMParser;try{var d=E(a);var e=c.parseFromString(d,"text/xml")}catch(g){}if(e&&e.documentElement.tagName==b)var f=e.documentElement;return f&&0<f.getElementsByTagName("parsererror").length?null:f}
function ld(a,b,c,d,e,f){for(var g=a.getAttribute("xlink:href"),h=a.getAttribute("xlink:actuate")||"onRequest",l=0;l<a.attributes.length;l++){var m=a.attributes[l].nodeName;-1!=m.indexOf("xlink:")&&(a.removeAttribute(m),--l)}if(5<=f)return Promise.reject(new v(2,4,4028));if("onLoad"!=h)return Promise.reject(new v(2,4,4027));var q=D([d],[g]);return e.request(0,Ha(q,b)).then(function(d){d=kd(d.data,a.tagName);if(!d)return Promise.reject(new v(2,4,4001,g));for(;a.childNodes.length;)a.removeChild(a.childNodes[0]);
for(;d.childNodes.length;){var h=d.childNodes[0];d.removeChild(h);a.appendChild(h)}for(h=0;h<d.attributes.length;h++){var l=d.attributes[h].nodeName,m=d.getAttribute(l);a.setAttribute(l,m)}return md(a,b,c,q[0],e,f+1)}.bind(a))}
function md(a,b,c,d,e,f){f=f||0;if(a.getAttribute("xlink:href")){var g=ld(a,b,c,d,e,f);c&&(g=g["catch"](function(){return md(a,b,c,d,e,f)}));return g}for(g=0;g<a.childNodes.length;g++){var h=a.childNodes[g];h instanceof Element&&"urn:mpeg:dash:resolve-to-zero:2013"==h.getAttribute("xlink:href")&&(a.removeChild(h),--g)}for(var l=[],g=0;g<a.childNodes.length;g++)h=a.childNodes[g],h.nodeType==Node.ELEMENT_NODE&&(h=md(h,b,c,d,e,f),l.push(h));return Promise.all(l).then(function(){return a})};function nd(a,b,c){this.a=a;this.V=b;this.K=c}n("shaka.media.InitSegmentReference",nd);function L(a,b,c,d,e,f){this.position=a;this.startTime=b;this.endTime=c;this.a=d;this.V=e;this.K=f}n("shaka.media.SegmentReference",L);function M(a,b){this.L=a;this.a=b==od;this.v=0}n("shaka.util.DataViewReader",M);var od=1;M.Endianness={Je:0,Qe:od};M.prototype.ba=function(){return this.v<this.L.byteLength};M.prototype.hasMoreData=M.prototype.ba;M.prototype.$c=function(){return this.v};M.prototype.getPosition=M.prototype.$c;M.prototype.Vc=function(){return this.L.byteLength};M.prototype.getLength=M.prototype.Vc;M.prototype.Jb=function(){try{var a=this.L.getUint8(this.v)}catch(b){pd()}this.v+=1;return a};M.prototype.readUint8=M.prototype.Jb;
M.prototype.tc=function(){try{var a=this.L.getUint16(this.v,this.a)}catch(b){pd()}this.v+=2;return a};M.prototype.readUint16=M.prototype.tc;M.prototype.F=function(){try{var a=this.L.getUint32(this.v,this.a)}catch(b){pd()}this.v+=4;return a};M.prototype.readUint32=M.prototype.F;M.prototype.sc=function(){try{var a=this.L.getInt32(this.v,this.a)}catch(b){pd()}this.v+=4;return a};M.prototype.readInt32=M.prototype.sc;
M.prototype.Ta=function(){try{if(this.a){var a=this.L.getUint32(this.v,!0);var b=this.L.getUint32(this.v+4,!0)}else b=this.L.getUint32(this.v,!1),a=this.L.getUint32(this.v+4,!1)}catch(c){pd()}if(2097151<b)throw new v(2,3,3001);this.v+=8;return b*Math.pow(2,32)+a};M.prototype.readUint64=M.prototype.Ta;M.prototype.Ja=function(a){this.v+a>this.L.byteLength&&pd();var b=this.L.buffer.slice(this.v,this.v+a);this.v+=a;return new Uint8Array(b)};M.prototype.readBytes=M.prototype.Ja;
M.prototype.J=function(a){this.v+a>this.L.byteLength&&pd();this.v+=a};M.prototype.skip=M.prototype.J;M.prototype.Ib=function(){for(var a=this.v;this.ba()&&this.L.getUint8(this.v);)this.v+=1;a=this.L.buffer.slice(a,this.v);this.v+=1;return E(a)};M.prototype.readTerminatedString=M.prototype.Ib;function pd(){throw new v(2,3,3E3);};function N(){this.b=[];this.a=[]}n("shaka.util.Mp4Parser",N);N.prototype.G=function(a,b){var c=qd(a);this.b[c]=0;this.a[c]=b;return this};N.prototype.box=N.prototype.G;N.prototype.aa=function(a,b){var c=qd(a);this.b[c]=1;this.a[c]=b;return this};N.prototype.fullBox=N.prototype.aa;N.prototype.parse=function(a){for(a=new M(new DataView(a),0);a.ba();)this.nb(0,a)};N.prototype.parse=N.prototype.parse;
N.prototype.nb=function(a,b){var c=b.v,d=b.F(),e=b.F();switch(d){case 0:d=b.L.byteLength-c;break;case 1:d=b.Ta()}var f=this.a[e];if(f){var g=null,h=null;1==this.b[e]&&(h=b.F(),g=h>>>24,h&=16777215);e=c+d-b.v;e=0<e?b.Ja(e).buffer:new ArrayBuffer(0);e=new M(new DataView(e),0);f({Ra:this,version:g,ac:h,u:e,size:d,start:c+a})}else b.J(c+d-b.v)};N.prototype.parseNext=N.prototype.nb;function O(a){for(;a.u.ba();)a.Ra.nb(a.start,a.u)}N.children=O;
function rd(a){for(var b=a.u.F();0<b;--b)a.Ra.nb(a.start,a.u)}N.sampleDescription=rd;function sd(a){return function(b){a(b.u.Ja(b.u.L.byteLength-b.u.v))}}N.allData=sd;function qd(a){for(var b=0,c=0;c<a.length;c++)b=b<<8|a.charCodeAt(c);return b};function td(a,b,c,d){var e,f=(new N).aa("sidx",function(a){e=ud(b,d,c,a)});a&&f.parse(a);if(e)return e;throw new v(2,3,3004);}
function ud(a,b,c,d){var e=[];d.u.J(4);var f=d.u.F();if(!f)throw new v(2,3,3005);if(d.version){var g=d.u.Ta();var h=d.u.Ta()}else g=d.u.F(),h=d.u.F();d.u.J(2);var l=d.u.tc();b=g-b;a=a+d.size+h;for(h=0;h<l;h++){var m=d.u.F();g=(m&2147483648)>>>31;var m=m&2147483647,q=d.u.F();d.u.J(4);if(1==g)throw new v(2,3,3006);e.push(new L(e.length,b/f,(b+q)/f,function(){return c},a,a+m-1));b+=q;a+=m}return e};function P(a){this.a=a}n("shaka.media.SegmentIndex",P);P.prototype.o=function(){this.a=null;return Promise.resolve()};P.prototype.destroy=P.prototype.o;P.prototype.find=function(a){for(var b=this.a.length-1;0<=b;--b){var c=this.a[b];if(a>=c.startTime&&a<c.endTime)return c.position}return this.a.length&&a<this.a[0].startTime?this.a[0].position:null};P.prototype.find=P.prototype.find;P.prototype.get=function(a){if(!this.a.length)return null;a-=this.a[0].position;return 0>a||a>=this.a.length?null:this.a[a]};
P.prototype.get=P.prototype.get;P.prototype.lb=function(a){for(var b,c,d,e=[],f=b=0;b<this.a.length&&f<a.length;)c=this.a[b],d=a[f],c.startTime<d.startTime?(e.push(c),b++):(c.startTime>d.startTime||(.1<Math.abs(c.endTime-d.endTime)?(d=new L(c.position,d.startTime,d.endTime,d.a,d.V,d.K),e.push(d)):e.push(c),b++),f++);for(;b<this.a.length;)e.push(this.a[b++]);if(e.length)for(b=e[e.length-1].position+1;f<a.length;)d=a[f++],d=new L(b++,d.startTime,d.endTime,d.a,d.V,d.K),e.push(d);else e=a;this.a=e};
P.prototype.merge=P.prototype.lb;P.prototype.wb=function(a){for(var b=0;b<this.a.length&&!(this.a[b].endTime>a);++b);this.a.splice(0,b)};P.prototype.evict=P.prototype.wb;function vd(a,b){if(a.a.length){var c=a.a[a.a.length-1];c.startTime>b||(a.a[a.a.length-1]=new L(c.position,c.startTime,b,c.a,c.V,c.K))}};function wd(a){this.b=a;this.a=new M(a,0);xd||(xd=[new Uint8Array([255]),new Uint8Array([127,255]),new Uint8Array([63,255,255]),new Uint8Array([31,255,255,255]),new Uint8Array([15,255,255,255,255]),new Uint8Array([7,255,255,255,255,255]),new Uint8Array([3,255,255,255,255,255,255]),new Uint8Array([1,255,255,255,255,255,255,255])])}var xd;wd.prototype.ba=function(){return this.a.ba()};
function yd(a){var b=zd(a);if(7<b.length)throw new v(2,3,3002);for(var c=0,d=0;d<b.length;d++)c=256*c+b[d];b=c;c=zd(a);a:{for(d=0;d<xd.length;d++)if(ib(c,xd[d])){d=!0;break a}d=!1}if(d)c=a.b.byteLength-a.a.v;else{if(8==c.length&&c[1]&224)throw new v(2,3,3001);for(var d=c[0]&(1<<8-c.length)-1,e=1;e<c.length;e++)d=256*d+c[e];c=d}c=a.a.v+c<=a.b.byteLength?c:a.b.byteLength-a.a.v;d=new DataView(a.b.buffer,a.b.byteOffset+a.a.v,c);a.a.J(c);return new Ad(b,d)}
function zd(a){var b=a.a.Jb(),c;for(c=1;8>=c&&!(b&1<<8-c);c++);if(8<c)throw new v(2,3,3002);var d=new Uint8Array(c);d[0]=b;for(b=1;b<c;b++)d[b]=a.a.Jb();return d}function Ad(a,b){this.id=a;this.a=b}function Bd(a){if(8<a.a.byteLength)throw new v(2,3,3002);if(8==a.a.byteLength&&a.a.getUint8(0)&224)throw new v(2,3,3001);for(var b=0,c=0;c<a.a.byteLength;c++)var d=a.a.getUint8(c),b=256*b+d;return b};function Cd(){}
Cd.prototype.parse=function(a,b,c,d){var e;b=new wd(new DataView(b));if(440786851!=yd(b).id)throw new v(2,3,3008);var f=yd(b);if(408125543!=f.id)throw new v(2,3,3009);b=f.a.byteOffset;f=new wd(f.a);for(e=null;f.ba();){var g=yd(f);if(357149030==g.id){e=g;break}}if(!e)throw new v(2,3,3010);f=new wd(e.a);e=1E6;for(g=null;f.ba();){var h=yd(f);if(2807729==h.id)e=Bd(h);else if(17545==h.id)if(g=h,4==g.a.byteLength)g=g.a.getFloat32(0);else if(8==g.a.byteLength)g=g.a.getFloat64(0);else throw new v(2,3,3003);
}if(null==g)throw new v(2,3,3011);f=e/1E9;e=g*f;a=yd(new wd(new DataView(a)));if(475249515!=a.id)throw new v(2,3,3007);return Dd(a,b,f,e,c,d)};function Dd(a,b,c,d,e,f){function g(){return e}var h=[];a=new wd(a.a);for(var l=-1,m=-1;a.ba();){var q=yd(a);if(187==q.id){var w=Ed(q);w&&(q=c*(w.Fe-f),w=b+w.Wd,0<=l&&h.push(new L(h.length,l,q,g,m,w-1)),l=q,m=w)}}0<=l&&h.push(new L(h.length,l,d,g,m,null));return h}
function Ed(a){var b=new wd(a.a);a=yd(b);if(179!=a.id)throw new v(2,3,3013);a=Bd(a);b=yd(b);if(183!=b.id)throw new v(2,3,3012);for(var b=new wd(b.a),c=0;b.ba();){var d=yd(b);if(241==d.id){c=Bd(d);break}}return{Fe:a,Wd:c}};function Fd(a,b){var c=jd(a,b,"Initialization");if(!c)return null;var d=a.A.X,e=c.getAttribute("sourceURL");e&&(d=D(a.A.X,[e]));var e=0,f=null;if(c=K(c,"range",Xc))e=c.start,f=c.end;return new nd(function(){return d},e,f)}
function Gd(a,b){var c=id(a,Hd,"presentationTimeOffset"),d=Fd(a,Hd);var e=Number(c);var f=a.A.contentType,g=a.A.mimeType.split("/")[1];if("text"!=f&&"mp4"!=g&&"webm"!=g)throw new v(2,4,4006);if("webm"==g&&!d)throw new v(2,4,4005);var f=jd(a,Hd,"RepresentationIndex"),h=id(a,Hd,"indexRange"),l=a.A.X,h=Xc(h||"");if(f){var m=f.getAttribute("sourceURL");m&&(l=D(a.A.X,[m]));h=K(f,"range",Xc,h)}if(!h)throw new v(2,4,4002);e=Id(a,b,d,l,h.start,h.end,g,e);return{createSegmentIndex:e.createSegmentIndex,findSegmentPosition:e.findSegmentPosition,
getSegmentReference:e.getSegmentReference,initSegmentReference:d,presentationTimeOffset:Number(c)||0}}
function Id(a,b,c,d,e,f,g,h){var l=a.presentationTimeline,m=!a.Ca||!a.S.yb,q=a.S.duration,w=b,x=null;return{createSegmentIndex:function(){var a=[w(d,e,f),"webm"==g?w(c.a(),c.V,c.K):null];w=null;return Promise.all(a).then(function(a){var b=a[0];a=a[1]||null;b="mp4"==g?td(b,e,d,h):(new Cd).parse(b,a,d,h);l.Ga(0,b);x=new P(b);m&&vd(x,q)})},findSegmentPosition:function(a){return x.find(a)},getSegmentReference:function(a){return x.get(a)}}}function Hd(a){return a.Ua};function Jd(a,b){var c=Fd(a,Kd);var d=Ld(a);var e=hd(a,Kd),f=e.za;f||(f=1);var g=0;e.P?g=e.P*(f-1):e.H&&0<e.H.length&&(g=e.H[0].start);d={P:e.P,startTime:g,za:f,presentationTimeOffset:e.presentationTimeOffset,H:e.H,Fa:d};if(!d.P&&!d.H&&1<d.Fa.length)throw new v(2,4,4002);if(!d.P&&!a.S.duration&&!d.H&&1==d.Fa.length)throw new v(2,4,4002);if(d.H&&!d.H.length)throw new v(2,4,4002);f=e=null;a.W.id&&a.A.id&&(f=a.W.id+","+a.A.id,e=b[f]);g=Md(a.S.duration,d.za,a.A.X,d);e?(e.lb(g),e.wb(a.presentationTimeline.ia()-
a.S.start)):(a.presentationTimeline.Ga(0,g),e=new P(g),f&&a.Ca&&(b[f]=e));a.Ca&&a.S.yb||vd(e,a.S.duration);return{createSegmentIndex:Promise.resolve.bind(Promise),findSegmentPosition:e.find.bind(e),getSegmentReference:e.get.bind(e),initSegmentReference:c,presentationTimeOffset:d.presentationTimeOffset}}function Kd(a){return a.pa}
function Md(a,b,c,d){var e=d.Fa.length;d.H&&d.H.length!=d.Fa.length&&(e=Math.min(d.H.length,d.Fa.length));for(var f=[],g=d.startTime,h=0;h<e;h++){var l=d.Fa[h],m=D(c,[l.md]);var q=null!=d.P?g+d.P:d.H?d.H[h].end:g+a;f.push(new L(h+b,g,q,function(a){return a}.bind(null,m),l.start,l.end));g=q}return f}
function Ld(a){return[a.A.pa,a.U.pa,a.W.pa].filter(Da).map(function(a){return J(a,"SegmentURL")}).reduce(function(a,c){return 0<a.length?a:c}).map(function(b){b.getAttribute("indexRange")&&!a.ec&&(a.ec=!0);var c=b.getAttribute("media");b=K(b,"mediaRange",Xc,{start:0,end:null});return{md:c,start:b.start,end:b.end}})};function Nd(a,b,c,d){var e=Od(a);var f=hd(a,Pd);var g=id(a,Pd,"media"),h=id(a,Pd,"index");f={P:f.P,timescale:f.timescale,za:f.za,presentationTimeOffset:f.presentationTimeOffset,Ub:f.Ub,H:f.H,Bb:g,Qa:h};g=0+(f.Qa?1:0);g+=f.H?1:0;g+=f.P?1:0;if(!g)throw new v(2,4,4002);1!=g&&(f.Qa&&(f.H=null),f.P=null);if(!f.Qa&&!f.Bb)throw new v(2,4,4002);if(f.Qa){c=a.A.mimeType.split("/")[1];if("mp4"!=c&&"webm"!=c)throw new v(2,4,4006);if("webm"==c&&!e)throw new v(2,4,4005);d=gd(f.Qa,a.A.id,null,a.bandwidth||null,
null);d=D(a.A.X,[d]);a=Id(a,b,e,d,0,null,c,f.presentationTimeOffset)}else f.P?(d||a.presentationTimeline.Cb(f.P),a=Qd(a,f)):(d=b=null,a.W.id&&a.A.id&&(d=a.W.id+","+a.A.id,b=c[d]),g=Rd(a,f),b?(b.lb(g),b.wb(a.presentationTimeline.ia()-a.S.start)):(a.presentationTimeline.Ga(0,g),b=new P(g),d&&a.Ca&&(c[d]=b)),a.Ca&&a.S.yb||vd(b,a.S.duration),a={createSegmentIndex:Promise.resolve.bind(Promise),findSegmentPosition:b.find.bind(b),getSegmentReference:b.get.bind(b)});return{createSegmentIndex:a.createSegmentIndex,
findSegmentPosition:a.findSegmentPosition,getSegmentReference:a.getSegmentReference,initSegmentReference:e,presentationTimeOffset:f.presentationTimeOffset}}function Pd(a){return a.Va}
function Qd(a,b){var c=a.S.duration,d=b.P,e=b.za,f=b.timescale,g=b.Bb,h=a.bandwidth||null,l=a.A.id,m=a.A.X;return{createSegmentIndex:Promise.resolve.bind(Promise),findSegmentPosition:function(a){return 0>a||c&&a>=c?null:Math.floor(a/d)},getSegmentReference:function(a){var b=a*d;return 0>b||c&&b>=c?null:new L(a,b,b+d,function(){var c=gd(g,l,a+e,h,b*f);return D(m,[c])},0,null)}}}
function Rd(a,b){for(var c=[],d=0;d<b.H.length;d++){var e=d+b.za;c.push(new L(e,b.H[d].start,b.H[d].end,function(a,b,c,d,e,q){a=gd(a,b,e,c,q);return D(d,[a]).map(function(a){return a.toString()})}.bind(null,b.Bb,a.A.id,a.bandwidth||null,a.A.X,e,b.H[d].Ee+b.Ub),0,null))}return c}function Od(a){var b=id(a,Pd,"initialization");if(!b)return null;var c=a.A.id,d=a.bandwidth||null,e=a.A.X;return new nd(function(){var a=gd(b,c,null,d,null);return D(e,[a])},0,null)};var Sd={},Td={};n("shaka.media.ManifestParser.registerParserByExtension",function(a,b){Td[a]=b});n("shaka.media.ManifestParser.registerParserByMime",function(a,b){Sd[a]=b});function Ud(){var a={},b;for(b in Sd)a[b]=!0;for(b in Td)a[b]=!0;["application/dash+xml","application/x-mpegurl","application/vnd.apple.mpegurl","application/vnd.ms-sstr+xml"].forEach(function(b){a[b]=!!Sd[b]});["mpd","m3u8","ism"].forEach(function(b){a[b]=!!Td[b]});return a}
function Vd(a,b,c,d){var e=d;e||(d=(new ia(a)).$.split("/").pop().split("."),1<d.length&&(d=d.pop().toLowerCase(),e=Td[d]));if(e)return Promise.resolve(e);c=Ha([a],c);c.method="HEAD";return b.request(0,c).then(function(b){(b=b.headers["content-type"])&&(b=b.toLowerCase());return(e=Sd[b])?e:Promise.reject(new v(2,4,4E3,a))},function(a){a.severity=2;return Promise.reject(a)})};function Q(a,b){this.c=a;this.j=b;this.f=this.a=Infinity;this.b=1;this.i=0;this.h=!0;this.g=0}n("shaka.media.PresentationTimeline",Q);Q.prototype.Y=function(){return this.a};Q.prototype.getDuration=Q.prototype.Y;Q.prototype.ea=function(a){this.a=a};Q.prototype.setDuration=Q.prototype.ea;Q.prototype.ad=function(){return this.c};Q.prototype.getPresentationStartTime=Q.prototype.ad;Q.prototype.Bc=function(a){this.i=a};Q.prototype.setClockOffset=Q.prototype.Bc;Q.prototype.ob=function(a){this.h=a};
Q.prototype.setStatic=Q.prototype.ob;Q.prototype.cd=function(){return this.f};Q.prototype.getSegmentAvailabilityDuration=Q.prototype.cd;Q.prototype.Dc=function(a){this.f=a};Q.prototype.setSegmentAvailabilityDuration=Q.prototype.Dc;Q.prototype.Cc=function(a){this.j=a};Q.prototype.setDelay=Q.prototype.Cc;Q.prototype.Ga=function(a,b){b.length&&(this.b=b.reduce(function(a,b){return Math.max(a,b.endTime-b.startTime)},this.b))};Q.prototype.notifySegments=Q.prototype.Ga;
Q.prototype.Cb=function(a){this.b=Math.max(this.b,a)};Q.prototype.notifyMaxSegmentDuration=Q.prototype.Cb;Q.prototype.R=function(){return Infinity==this.a&&!this.h};Q.prototype.isLive=Q.prototype.R;Q.prototype.wa=function(){return Infinity!=this.a&&!this.h};Q.prototype.isInProgress=Q.prototype.wa;Q.prototype.ia=function(){return this.Da(0)};Q.prototype.getSegmentAvailabilityStart=Q.prototype.ia;
Q.prototype.Da=function(a){if(Infinity==this.f)return this.g;var b=this.va();return Math.max(this.g,Math.min(b-this.f+a,b))};Q.prototype.getSafeAvailabilityStart=Q.prototype.Da;Q.prototype.Ac=function(a){this.g=a};Q.prototype.setAvailabilityStart=Q.prototype.Ac;Q.prototype.va=function(){return this.R()||this.wa()?Math.min(Math.max(0,(Date.now()+this.i)/1E3-this.b-this.c),this.a):this.a};Q.prototype.getSegmentAvailabilityEnd=Q.prototype.va;
Q.prototype.kb=function(){return Math.max(0,this.va()-(this.R()||this.wa()?this.j:0))};Q.prototype.getSeekRangeEnd=Q.prototype.kb;function Wd(){this.a=this.b=null;this.g=[];this.c=null;this.i=[];this.h=1;this.j={};this.l=0;this.f=null}n("shaka.dash.DashParser",Wd);k=Wd.prototype;k.configure=function(a){this.b=a};k.start=function(a,b){this.g=[a];this.a=b;return Xd(this).then(function(){this.a&&Yd(this,0);return this.c}.bind(this))};k.stop=function(){this.b=this.a=null;this.g=[];this.c=null;this.i=[];this.j={};null!=this.f&&(window.clearTimeout(this.f),this.f=null);return Promise.resolve()};k.update=function(){Xd(this)["catch"](function(a){if(this.a)this.a.onError(a)}.bind(this))};
k.onExpirationUpdated=function(){};function Xd(a){return a.a.networkingEngine.request(0,Ha(a.g,a.b.retryParameters)).then(function(a){if(this.a)return Zd(this,a.data,a.uri)}.bind(a))}function Zd(a,b,c){b=kd(b,"MPD");if(!b)throw new v(2,4,4001,c);return md(b,a.b.retryParameters,a.b.dash.xlinkFailGracefully,c,a.a.networkingEngine).then(function(a){return $d(this,a,c)}.bind(a))}
function $d(a,b,c){c=[c];var d=J(b,"Location").map(Uc).filter(Da);0<d.length&&(c=a.g=d);d=J(b,"BaseURL").map(Uc);c=D(c,d);var e=K(b,"minBufferTime",Wc);a.l=K(b,"minimumUpdatePeriod",Wc,-1);var f=K(b,"availabilityStartTime",Vc),d=K(b,"timeShiftBufferDepth",Wc),g=K(b,"suggestedPresentationDelay",Wc),h=K(b,"maxSegmentDuration",Wc),l=b.getAttribute("type")||"static";if(a.c)var m=a.c.presentationTimeline;else{var q=Math.max(10,1.5*e);m=new Q(f,null!=g?g:q)}var f=ae(a,{Ca:"static"!=l,presentationTimeline:m,
W:null,S:null,U:null,A:null,bandwidth:0,ec:!1},c,b),g=f.duration,w=f.periods;m.ob("static"==l);m.ea(g||Infinity);m.Dc(null!=d?d:Infinity);m.Cb(h||1);if(a.c)return Promise.resolve();b=J(b,"UTCTiming");return be(a,c,b,m.R()).then(function(a){this.a&&(m.Bc(a),this.c={presentationTimeline:m,periods:w,offlineSessionIds:[],minBufferTime:e||0})}.bind(a))}
function ae(a,b,c,d){var e=K(d,"mediaPresentationDuration",Wc),f=[],g=0;d=J(d,"Period");for(var h=0;h<d.length;h++){var l=d[h],g=K(l,"start",Wc,g),m=K(l,"duration",Wc),q=null;if(h!=d.length-1){var w=K(d[h+1],"start",Wc);null!=w&&(q=w-g)}else null!=e&&(q=e-g);null==q&&(q=m);l=ce(a,b,c,{start:g,duration:q,node:l,yb:null==q||h==d.length-1});f.push(l);m=b.W.id;-1==a.i.indexOf(m)&&(a.i.push(m),a.c&&(a.a.filterNewPeriod(l),a.c.periods.push(l)));if(null==q){g=null;break}g+=q}a.c||a.a.filterAllPeriods(f);
return null!=e?{periods:f,duration:e}:{periods:f,duration:g}}
function ce(a,b,c,d){b.W=de(d.node,null,c);b.S=d;b.W.id||(b.W.id="__shaka_period_"+d.start);J(d.node,"EventStream").forEach(a.Od.bind(a,d.start,d.duration));c=J(d.node,"AdaptationSet").map(a.Md.bind(a,b)).filter(Da);var e=c.map(function(a){return a.Yd}).reduce(z,[]),f=e.filter(Ea);if(b.Ca&&e.length!=f.length)throw new v(2,4,4018);var g=c.filter(function(a){return!a.Tb});c.filter(function(a){return a.Tb}).forEach(function(a){var b=a.streams[0],c=a.Tb;g.forEach(function(a){a.id==c&&a.streams.forEach(function(a){a.trickModeVideo=
b})})});e=ee(g,"video");f=ee(g,"audio");if(!e.length&&!f.length)throw new v(2,4,4004);f.length||(f=[null]);e.length||(e=[null]);b=[];for(c=0;c<f.length;c++)for(var h=0;h<e.length;h++)fe(a,f[c],e[h],b);a=ee(g,"text");e=[];for(c=0;c<a.length;c++)e.push.apply(e,a[c].streams);return{startTime:d.start,textStreams:e,variants:b}}function ee(a,b){return a.filter(function(a){return a.contentType==b})}
function fe(a,b,c,d){if(b||c)if(b&&c){var e=b.drmInfos;var f=c.drmInfos;if(e.length&&f.length?0<Ab(e,f).length:1)for(var g=Ab(b.drmInfos,c.drmInfos),e=0;e<b.streams.length;e++)for(var h=0;h<c.streams.length;h++)f=(c.streams[h].bandwidth||0)+(b.streams[e].bandwidth||0),f={id:a.h++,language:b.language,primary:b.Ab||c.Ab,audio:b.streams[e],video:c.streams[h],bandwidth:f,drmInfos:g,allowedByApplication:!0,allowedByKeySystem:!0},d.push(f)}else for(g=b||c,e=0;e<g.streams.length;e++)f=g.streams[e].bandwidth||
0,f={id:a.h++,language:g.language||"und",primary:g.Ab,audio:b?g.streams[e]:null,video:c?g.streams[e]:null,bandwidth:f,drmInfos:g.drmInfos,allowedByApplication:!0,allowedByKeySystem:!0},d.push(f)}
k.Md=function(a,b){a.U=de(b,a.W,null);var c=!1,d=J(b,"Role"),e=d.map(function(a){return a.getAttribute("value")}).filter(Da),f=void 0;"text"==a.U.contentType&&(f="subtitle");for(var g=0;g<d.length;g++){var h=d[g].getAttribute("schemeIdUri");if(null==h||"urn:mpeg:dash:role:2011"==h)switch(h=d[g].getAttribute("value"),h){case "main":c=!0;break;case "caption":case "subtitle":f=h}}var l=null,m=!1;J(b,"EssentialProperty").forEach(function(a){"http://dashif.org/guidelines/trickmode"==a.getAttribute("schemeIdUri")?
l=a.getAttribute("value"):m=!0});if(m)return null;var d=J(b,"ContentProtection"),q=cd(d,this.b.dash.customScheme,this.b.dash.ignoreDrmInfo),d=Xb(b.getAttribute("lang")||"und"),h=b.getAttribute("label"),g=J(b,"Representation"),e=g.map(this.Pd.bind(this,a,q,f,d,h,c,e)).filter(function(a){return!!a});if(!e.length)throw new v(2,4,4003);a.U.contentType&&"application"!=a.U.contentType||(a.U.contentType=ge(e[0].mimeType,e[0].codecs),e.forEach(function(b){b.type=a.U.contentType}));e.forEach(function(a){q.drmInfos.forEach(function(b){a.keyId&&
b.keyIds.push(a.keyId)})});f=g.map(function(a){return a.getAttribute("id")}).filter(Da);return{id:a.U.id||"__fake__"+this.h++,contentType:a.U.contentType,language:d,Ab:c,streams:e,drmInfos:q.drmInfos,Tb:l,Yd:f}};
k.Pd=function(a,b,c,d,e,f,g,h){a.A=de(h,a.U,null);if(!he(a.A))return null;a.bandwidth=K(h,"bandwidth",Zc)||0;var l=this.Zd.bind(this);if(a.A.Ua)l=Gd(a,l);else if(a.A.pa)l=Jd(a,this.j);else if(a.A.Va)l=Nd(a,l,this.j,!!this.c);else{var m=a.A.X,q=a.S.duration||0;l={createSegmentIndex:Promise.resolve.bind(Promise),findSegmentPosition:function(a){return 0<=a&&a<q?1:null},getSegmentReference:function(a){return 1!=a?null:new L(1,0,q,function(){return m},0,null)},initSegmentReference:null,presentationTimeOffset:0}}h=
J(h,"ContentProtection");h=fd(h,this.b.dash.customScheme,b,this.b.dash.ignoreDrmInfo);return{id:this.h++,createSegmentIndex:l.createSegmentIndex,findSegmentPosition:l.findSegmentPosition,getSegmentReference:l.getSegmentReference,initSegmentReference:l.initSegmentReference,presentationTimeOffset:l.presentationTimeOffset,mimeType:a.A.mimeType,codecs:a.A.codecs,frameRate:a.A.frameRate,bandwidth:a.bandwidth,width:a.A.width,height:a.A.height,kind:c,encrypted:0<b.drmInfos.length,keyId:h,language:d,label:e,
type:a.U.contentType,primary:f,trickModeVideo:null,containsEmsgBoxes:a.A.containsEmsgBoxes,roles:g,channelsCount:a.A.Db}};k.ue=function(){this.f=null;var a=Date.now();Xd(this).then(function(){this.a&&Yd(this,(Date.now()-a)/1E3)}.bind(this))["catch"](function(a){this.a&&(a.severity=1,this.a.onError(a),Yd(this,0))}.bind(this))};function Yd(a,b){0>a.l||(a.f=window.setTimeout(a.ue.bind(a),1E3*Math.max(Math.max(3,a.l)-b,0)))}
function de(a,b,c){b=b||{contentType:"",mimeType:"",codecs:"",containsEmsgBoxes:!1,frameRate:void 0,Db:null};c=c||b.X;var d=J(a,"BaseURL").map(Uc),e=a.getAttribute("contentType")||b.contentType,f=a.getAttribute("mimeType")||b.mimeType,g=a.getAttribute("codecs")||b.codecs,h=K(a,"frameRate",ad)||b.frameRate,l=!!J(a,"InbandEventStream").length,m=J(a,"AudioChannelConfiguration"),m=ie(m)||b.Db;e||(e=ge(f,g));return{X:D(c,d),Ua:Tc(a,"SegmentBase")||b.Ua,pa:Tc(a,"SegmentList")||b.pa,Va:Tc(a,"SegmentTemplate")||
b.Va,width:K(a,"width",$c)||b.width,height:K(a,"height",$c)||b.height,contentType:e,mimeType:f,codecs:g,frameRate:h,containsEmsgBoxes:l||b.containsEmsgBoxes,id:a.getAttribute("id"),Db:m}}
function ie(a){for(var b=0;b<a.length;++b){var c=a[b],d=c.getAttribute("schemeIdUri");if(d&&(c=c.getAttribute("value")))switch(d){case "urn:mpeg:dash:outputChannelPositionList:2012":return c.trim().split(/ +/).length;case "urn:mpeg:dash:23003:3:audio_channel_configuration:2011":case "urn:dts:dash:audio_channel_configuration:2012":d=parseInt(c,10);if(!d)continue;return d;case "tag:dolby.com,2014:dash:audio_channel_configuration:2011":case "urn:dolby:dash:audio_channel_configuration:2011":if(d=parseInt(c,
16)){for(a=0;d;)d&1&&++a,d>>=1;return a}}}return null}function he(a){var b=0+(a.Ua?1:0);b+=a.pa?1:0;b+=a.Va?1:0;if(!b)return"text"==a.contentType||"application"==a.contentType?!0:!1;1!=b&&(a.Ua&&(a.pa=null),a.Va=null);return!0}function je(a,b,c,d){b=D(b,[c]);b=Ha(b,a.b.retryParameters);b.method=d;return a.a.networkingEngine.request(0,b).then(function(a){if("HEAD"==d){if(!a.headers||!a.headers.date)return 0;a=a.headers.date}else a=E(a.data);a=Date.parse(a);return isNaN(a)?0:a-Date.now()})}
function be(a,b,c,d){c=c.map(function(a){return{scheme:a.getAttribute("schemeIdUri"),value:a.getAttribute("value")}});var e=a.b.dash.clockSyncUri;d&&!c.length&&e&&c.push({scheme:"urn:mpeg:dash:utc:http-head:2014",value:e});return Ba(c,function(a){var c=a.value;switch(a.scheme){case "urn:mpeg:dash:utc:http-head:2014":case "urn:mpeg:dash:utc:http-head:2012":return je(this,b,c,"HEAD");case "urn:mpeg:dash:utc:http-xsdate:2014":case "urn:mpeg:dash:utc:http-iso:2014":case "urn:mpeg:dash:utc:http-xsdate:2012":case "urn:mpeg:dash:utc:http-iso:2012":return je(this,
b,c,"GET");case "urn:mpeg:dash:utc:direct:2014":case "urn:mpeg:dash:utc:direct:2012":return a=Date.parse(c),isNaN(a)?0:a-Date.now();case "urn:mpeg:dash:utc:http-ntp:2014":case "urn:mpeg:dash:utc:ntp:2014":case "urn:mpeg:dash:utc:sntp:2014":return Promise.reject();default:return Promise.reject()}}.bind(a))["catch"](function(){return 0})}
k.Od=function(a,b,c){var d=c.getAttribute("schemeIdUri")||"",e=c.getAttribute("value")||"",f=K(c,"timescale",$c)||1;J(c,"Event").forEach(function(c){var g=K(c,"presentationTime",$c)||0,l=K(c,"duration",$c)||0,g=g/f+a,l=g+l/f;null!=b&&(g=Math.min(g,a+b),l=Math.min(l,a+b));c={schemeIdUri:d,value:e,startTime:g,endTime:l,id:c.getAttribute("id")||"",eventElement:c};this.a.onTimelineRegionAdded(c)}.bind(this))};
k.Zd=function(a,b,c){a=Ha(a,this.b.retryParameters);null!=b&&(a.headers.Range="bytes="+b+"-"+(null!=c?c:""));return this.a.networkingEngine.request(1,a).then(function(a){return a.data})};function ge(a,b){return Fb[Xa(a,b)]?"text":a.split("/")[0]}Td.mpd=Wd;Sd["application/dash+xml"]=Wd;function ke(a,b,c,d){this.uri=a;this.type=b;this.T=c;this.segments=d||null}function le(a,b,c,d){this.id=a;this.name=b;this.a=c;this.value=d||null}le.prototype.toString=function(){function a(a){return a.name+'="'+a.value+'"'}return this.value?"#"+this.name+":"+this.value:0<this.a.length?"#"+this.name+":"+this.a.map(a).join(","):"#"+this.name};function me(a,b){this.name=a;this.value=b}le.prototype.getAttribute=function(a){var b=this.a.filter(function(b){return b.name==a});return b.length?b[0]:null};
function ne(a,b,c){c=c||null;return(a=a.getAttribute(b))?a.value:c}function oe(a,b){this.T=b;this.uri=a};function pe(a,b){return a.filter(function(a){return a.name==b})}function qe(a,b){var c=pe(a,b);return c.length?c[0]:null}function re(a,b,c){return a.filter(function(a){var d=a.getAttribute("TYPE");a=a.getAttribute("GROUP-ID");return d.value==b&&a.value==c})};function se(a){this.b=a;this.a=0}function te(a,b){b.lastIndex=a.a;var c=(c=b.exec(a.b))?{position:c.index,length:c[0].length,ae:c}:null;if(a.a==a.b.length||!c||c.position!=a.a)return null;a.a+=c.length;return c.ae}function ue(a){return a.a==a.b.length?null:(a=te(a,/[^ \t\n]*/gm))?a[0]:null};function ve(){this.a=0}
function we(a,b,c){b=E(b);b=b.replace(/\r\n|\r(?=[^\n]|$)/gm,"\n").trim();var d=b.split(/\n+/m);if(!/^#EXTM3U($|[ \t\n])/m.test(d[0]))throw new v(2,4,4015);b=0;for(var e=[],f=1;f<d.length;)if(/^#(?!EXT)/m.test(d[f]))f+=1;else{var g=d[f];g=xe(a.a++,g);if(0<=ye.indexOf(g.name))b=1;else if(0<=ze.indexOf(g.name)){if(1!=b)throw new v(2,4,4017);d=d.splice(f,d.length-f);a=Ae(a,d,e);return new ke(c,b,e,a)}e.push(g);f+=1;"EXT-X-STREAM-INF"==g.name&&(g.a.push(new me("URI",d[f])),f+=1)}return new ke(c,b,e)}
function Ae(a,b,c){var d=[],e=[];b.forEach(function(a){/^(#EXT)/.test(a)?(a=xe(this.a++,a),0<=ye.indexOf(a.name)?c.push(a):e.push(a)):/^#(?!EXT)/m.test(a)||(d.push(new oe(a.trim(),e)),e=[])}.bind(a));return d}
function xe(a,b){var c=b.match(/^#(EXT[^:]*)(?::(.*))?$/);if(!c)throw new v(2,4,4016);var d=c[1],e=c[2],c=[];if(e&&0<=e.indexOf("="))for(var e=new se(e),f,g=/([^=]+)=(?:"([^"]*)"|([^",]*))(?:,|$)/g;f=te(e,g);)c.push(new me(f[1],f[2]||f[3]));else if(e)return new le(a,d,c,e);return new le(a,d,c)}var ye="EXT-X-TARGETDURATION EXT-X-MEDIA-SEQUENCE EXT-X-DISCONTINUITY-SEQUENCE EXT-X-PLAYLIST-TYPE EXT-X-MAP EXT-X-I-FRAMES-ONLY EXT-X-ENDLIST".split(" "),ze="EXTINF EXT-X-BYTERANGE EXT-X-DISCONTINUITY EXT-X-PROGRAM-DATE-TIME EXT-X-KEY EXT-X-DATERANGE".split(" ");function Be(a){return new Promise(function(b){var c=Be.parse(a);b({uri:a,data:c.data,headers:{"content-type":c.contentType}})})}n("shaka.net.DataUriPlugin",Be);
Be.parse=function(a){var b=a.split(":");if(2>b.length||"data"!=b[0])throw new v(2,1,1004,a);b=b.slice(1).join(":").split(",");if(2>b.length)throw new v(2,1,1004,a);var c=b[0],b=window.decodeURIComponent(b.slice(1).join(",")),c=c.split(";"),d=null;1<c.length&&(d=c[1]);if("base64"==d)a=fb(b).buffer;else{if(d)throw new v(2,1,1005,a);a=bb(b)}return{data:a,contentType:c[0]}};Ga.data=Be;function Ce(){this.h=this.b=null;this.D=1;this.g={};this.C={};this.j={};this.s={};this.a=null;this.m="";this.w=new ve;this.i=this.c=null;this.f=!1;this.B=null;this.l=0}n("shaka.hls.HlsParser",Ce);k=Ce.prototype;k.configure=function(a){this.h=a};k.start=function(a,b){this.b=b;this.m=a;return De(this,a).then(function(b){return Ee(this,b.data,a).then(function(){Fe(this,this.c);return this.B}.bind(this))}.bind(this))};k.stop=function(){this.h=this.b=null;this.g={};this.C={};this.B=null;return Promise.resolve()};
k.update=function(){if(this.f){for(var a=[],b=Object.keys(this.s),c=0;c<b.length;c++){var d=b[c];a.push(Ge(this,this.s[d],d))}return Promise.all(a)}};
function Ge(a,b,c){De(a,c).then(function(a){a=we(this.w,a.data,a.uri);if(1!=a.type)throw new v(2,4,4017);for(var c=qe(a.T,"EXT-X-MEDIA-SEQUENCE"),c=He(this,a,c?Number(c.value):0),d=b.zb,g=[],h=d.endTime,l=0;l<c.length;l++){var m=c[l];if(m.position>d.position){var q=m.endTime-m.startTime,w=h,x=h+q,h=h+q;g.push(new L(m.position,w,x,m.a,m.V,m.K))}}c=g;b.ce.lb(c);c.length&&(b.zb=c[c.length-1]);qe(a.T,"EXT-X-ENDLIST")&&(a=b.zb.endTime,Ie(this,!1),this.a.ea(a))}.bind(a))}k.onExpirationUpdated=function(){};
function Ee(a,b,c){b=we(a.w,b,c);if(0!=b.type)throw new v(2,4,4022);return Je(a,b).then(function(a){this.b.filterAllPeriods([a]);this.f&&this.a.Cc(3*this.l);this.B={presentationTimeline:this.a,periods:[a],offlineSessionIds:[],minBufferTime:0}}.bind(a))}
function Je(a,b){var c=b.T,d=pe(b.T,"EXT-X-MEDIA").filter(function(a){return"SUBTITLES"==R(a,"TYPE")}.bind(a)).map(function(a){return Ke(this,a,b)}.bind(a));return Promise.all(d).then(function(a){var d=pe(c,"EXT-X-STREAM-INF").map(function(a){return Me(this,a,b)}.bind(this));return Promise.all(d).then(function(b){b=b.reduce(z,[]);this.f||Ne(this,b);return{startTime:0,variants:b,textStreams:a}}.bind(this))}.bind(a))}
function Me(a,b,c){var d=ne(b,"CODECS","avc1.42E01E,mp4a.40.2").split(","),e=b.getAttribute("RESOLUTION"),f=null,g=null,h=ne(b,"FRAME-RATE"),l=Number(R(b,"BANDWIDTH"));if(e)var m=e.value.split("x"),f=m[0],g=m[1];var q=Oe(a,c);c=pe(c.T,"EXT-X-MEDIA");var w=ne(b,"AUDIO"),x=ne(b,"VIDEO");w?c=re(c,"AUDIO",w):x&&(c=re(c,"VIDEO",x));if(m=Pe("text",d)){var r=ne(b,"SUBTITLES");r&&(r=re(c,"SUBTITLES",r),r.length&&(a.g[r[0].id].stream.codecs=m));d.splice(d.indexOf(m),1)}c=c.map(function(a){return Re(this,a,
d,q)}.bind(a));var u=[],t=[];return Promise.all(c).then(function(a){w?u=a:x&&(t=a);if(u.length||t.length)if(u.length)if(R(b,"URI")==u[0].Mb){a="audio";var c=!0}else a="video";else a="audio";else c=!1,1==d.length?(a=Pe("video",d),a=e||h||a?"video":"audio"):(a="video",d=[d.join(",")]);return c?Promise.resolve():Se(this,b,d,a,q)}.bind(a)).then(function(a){a&&("audio"==a.stream.type?u=[a]:t=[a]);return Te(this,u,t,l,f,g,h)}.bind(a))}
function Te(a,b,c,d,e,f,g){c.forEach(function(a){if(a=a.stream)a.width=Number(e)||void 0,a.height=Number(f)||void 0,a.frameRate=Number(g)||void 0}.bind(a));b.length||(b=[null]);c.length||(c=[null]);for(var h=[],l=0;l<b.length;l++)for(var m=0;m<c.length;m++){var q=b[l]?b[l].stream:null,w=c[m]?c[m].stream:null,x=b[l]?b[l].drmInfos:null,r=c[m]?c[m].drmInfos:null;if(q&&w)if(x.length&&r.length?0<Ab(x,r).length:1)var u=Ab(x,r);else continue;else q?u=x:w&&(u=r);x=(c[l]?c[l].Mb:"")+" - "+(b[l]?b[l].Mb:"");
a.C[x]||(q=Ue(a,q,w,d,u),h.push(q),a.C[x]=q)}return h}function Ue(a,b,c,d,e){return{id:a.D++,language:b?b.language:"und",primary:!!b&&b.primary||!!c&&c.primary,audio:b,video:c,bandwidth:d,drmInfos:e,allowedByApplication:!0,allowedByKeySystem:!0}}function Ke(a,b,c){R(b,"TYPE");c=Oe(a,c);return Re(a,b,[],c).then(function(a){return a.stream})}
function Re(a,b,c,d){if(a.g[b.id])return Promise.resolve().then(function(){return this.g[b.id]}.bind(a));var e=R(b,"TYPE").toLowerCase();"subtitles"==e&&(e="text");var f=Xb(ne(b,"LANGUAGE","und")),g=ne(b,"NAME"),h=b.getAttribute("DEFAULT"),l=b.getAttribute("AUTOSELECT"),m=ne(b,"CHANNELS"),m="audio"==e?Ve(m):null,q=R(b,"URI"),q=D([a.m],[q])[0];return We(a,q,c,e,d,f,!!h||!!l,g,m).then(function(a){this.g[b.id]=a;return this.s[q]=a}.bind(a))}
function Ve(a){if(!a)return null;a=a.split("/")[0];return parseInt(a,10)}function Se(a,b,c,d,e){var f=R(b,"URI"),f=D([a.m],[f])[0];return We(a,f,c,d,e,"und",!1,null,null).then(function(a){return this.s[f]=a}.bind(a))}
function We(a,b,c,d,e,f,g,h,l){var m=b;b=D([a.m],[b])[0];return De(a,b).then(function(a){a=we(this.w,a.data,a.uri);if(1!=a.type)throw new v(2,4,4017);var b=qe(a.T,"EXT-X-MEDIA-SEQUENCE"),q=He(this,a,b?Number(b.value):0),r=new P(q);Xe(this,a);this.a||Ye(this,q[q.length-1].endTime);e=Oe(this,a)||e;var u=null;"text"!=d&&(u=Ze(a));this.a.Ga(0,q);if(!this.f){var b=q[q.length-1].endTime-q[0].startTime,t=this.a.Y();(Infinity==t||t<b)&&this.a.ea(b)}var Fa=$e(d,c),Lc=void 0;"text"==d&&(Lc="subtitle");var Mc=
[];a.segments.forEach(function(a){a=pe(a.T,"EXT-X-KEY");Mc.push.apply(Mc,a)});var Nc=!1,Oc=[],Qe=null;Mc.forEach(function(a){if("NONE"!=R(a,"METHOD")){Nc=!0;var b=R(a,"KEYFORMAT");if(a=(b=af[b])?b(a):null)a.keyIds.length&&(Qe=a.keyIds[0]),Oc.push(a)}});if(Nc&&!Oc.length)throw new v(2,4,4026);return bf(this,d,Fa,q[0].a()[0]).then(function(a){a={id:this.D++,createSegmentIndex:Promise.resolve.bind(Promise),findSegmentPosition:r.find.bind(r),getSegmentReference:r.get.bind(r),initSegmentReference:u,presentationTimeOffset:e||
0,mimeType:a,codecs:Fa,kind:Lc,encrypted:Nc,keyId:Qe,language:f,label:h||null,type:d,primary:g,trickModeVideo:null,containsEmsgBoxes:!1,frameRate:void 0,width:void 0,height:void 0,bandwidth:void 0,roles:[],channelsCount:l};this.j[a.id]=r;return{stream:a,ce:r,drmInfos:Oc,Mb:m,zb:q[q.length-1]}}.bind(this))}.bind(a))}
function Xe(a,b){var c=qe(b.T,"EXT-X-PLAYLIST-TYPE");if(qe(b.T,"EXT-X-ENDLIST")||c&&"VOD"==c.value)Ie(a,!1);else if(c)c=cf(b.T,"EXT-X-TARGETDURATION"),c=Number(c.value),a.c?a.c>c&&(a.c=c):(Ie(a,!0),a.c=c),a.l=Math.max(c,a.l);else throw new v(2,4,4029);}function Ye(a,b){var c=null,d=0;a.f&&(c=Date.now()/1E3-b,d=3*a.l);a.a=new Q(c,d);a.a.ob(!a.f)}
function Ze(a){var b=pe(a.T,"EXT-X-MAP");if(!b.length)return null;if(1<b.length)throw new v(2,4,4020);var b=b[0],c=R(b,"URI"),d=D([a.uri],[c])[0];a=0;c=null;if(b=ne(b,"BYTERANGE"))a=b.split("@"),b=Number(a[0]),a=Number(a[1]),c=a+b-1;return new nd(function(){return[d]},a,c)}
function He(a,b,c){var d=b.segments,e=[];d.forEach(function(a){var f=a.T,h=D([b.uri],[a.uri])[0],l=cf(f,"EXTINF").value.split(","),l=Number(l[0]),m;(a=d.indexOf(a))?m=e[a-1].endTime:m=0;var l=m+l,q=0,w=null;if(f=qe(f,"EXT-X-BYTERANGE"))f=f.value.split("@"),w=Number(f[0]),f[1]?q=Number(f[1]):q=e[a-1].K+1,w=q+w-1,a==d.length-1&&(w=null);e.push(new L(c+a,m,l,function(){return[h]},q,w))}.bind(a));return e}
function Ne(a,b){b.forEach(function(a){var b=this.a.Y(),c=a.video;a=a.audio;c&&this.j[c.id]&&vd(this.j[c.id],b);a&&this.j[a.id]&&vd(this.j[a.id],b)}.bind(a))}function Pe(a,b){for(var c=df[a],d=0;d<c.length;d++)for(var e=0;e<b.length;e++)if(c[d].test(b[e].trim()))return b[e].trim();return"text"==a?"":null}function $e(a,b){if(1==b.length)return b[0];var c=Pe(a,b);if(null!=c)return c;throw new v(2,4,4025,b);}
function bf(a,b,c,d){var e=d.split("."),f=e[e.length-1];if(e=ef[b][f])return Promise.resolve(e);if("text"==b)return c&&"vtt"!=c?Promise.resolve("application/mp4"):Promise.resolve("text/vtt");b=Ha([d],a.h.retryParameters);b.method="HEAD";return a.b.networkingEngine.request(1,b).then(function(a){a=a.headers["content-type"];if(!a)throw new v(2,4,4021,f);return a.split(";")[0]})}function Oe(a,b){var c=qe(b.T,"EXT-X-START");return c?Number(R(c,"TIME-OFFSET")):a.h.hls.defaultTimeOffset}
function R(a,b){var c=a.getAttribute(b);if(!c)throw new v(2,4,4023,b);return c.value}function cf(a,b){var c=qe(a,b);if(!c)throw new v(2,4,4024,b);return c}function De(a,b){return a.b.networkingEngine.request(0,Ha([b],a.h.retryParameters))}
var df={audio:[/^vorbis$/,/^opus$/,/^flac$/,/^mp4a/,/^[ae]c-3$/],video:[/^avc/,/^hev/,/^hvc/,/^vp0?[89]/,/^av1$/],text:[/^vtt$/,/^wvtt/,/^stpp/]},ef={audio:{mp4:"audio/mp4",m4s:"audio/mp4",m4i:"audio/mp4",m4a:"audio/mp4",ts:"video/mp2t"},video:{mp4:"video/mp4",m4s:"video/mp4",m4i:"video/mp4",m4v:"video/mp4",ts:"video/mp2t"},text:{mp4:"application/mp4",m4s:"application/mp4",m4i:"application/mp4",vtt:"text/vtt",ttml:"application/ttml+xml"}};
Ce.prototype.I=function(){this.b&&(this.i=null,this.update().then(function(){Fe(this,this.c)}.bind(this))["catch"](function(a){this.b&&(a.severity=1,this.b.onError(a),Fe(this,0))}.bind(this)))};function Fe(a,b){null!=a.c&&null!=b&&(a.i=window.setTimeout(a.I.bind(a),1E3*b))}function Ie(a,b){a.f=b;a.a&&a.a.ob(!b);b||null==a.i||(window.clearTimeout(a.i),a.i=null,a.c=null)}
var af={"urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed":function(a){if("SAMPLE-AES-CENC"!=R(a,"METHOD"))return null;var b=R(a,"URI"),b=Be.parse(b),b=new Uint8Array(b.data),b=Qa("com.widevine.alpha",[{initDataType:"cenc",initData:b}]);if(a=ne(a,"KEYID"))b.keyIds=[a.substr(2).toLowerCase()];return b}};Td.m3u8=Ce;Sd["application/x-mpegurl"]=Ce;Sd["application/vnd.apple.mpegurl"]=Ce;function ff(a,b,c,d,e,f){this.a=a;this.c=b;this.l=c;this.B=d;this.I=e;this.D=f;this.b=new B;this.h=!1;this.g=1;this.j=this.f=null;this.C=a.readyState;this.i=!1;this.w=this.O=-1;this.m=this.s=!1;0<a.readyState?this.kc():Pa(this.b,a,"loadedmetadata",this.kc.bind(this));b=this.mc.bind(this);C(this.b,a,"ratechange",this.Ad.bind(this));C(this.b,a,"waiting",b);this.j=setInterval(b,250)}k=ff.prototype;
k.o=function(){var a=this.b.o();this.b=null;null!=this.f&&(window.clearInterval(this.f),this.f=null);null!=this.j&&(window.clearInterval(this.j),this.j=null);this.D=this.I=this.l=this.c=this.a=null;return a};function gf(a,b){0<a.a.readyState?a.a.currentTime=hf(a,b):a.B=b}function jf(a){return 0<a.a.readyState?hf(a,a.a.currentTime):kf(a)}function kf(a){if(a.B)return hf(a,a.B);a=a.c.presentationTimeline;return Infinity>a.Y()?a.ia():a.kb()}k.xb=function(){return this.g};
function lf(a,b){null!=a.f&&(window.clearInterval(a.f),a.f=null);a.g=b;a.a.playbackRate=a.h||0>b?0:b;!a.h&&0>b&&(a.f=window.setInterval(function(){this.a.currentTime+=b/4}.bind(a),250))}k.Fb=function(){this.m=!0;this.mc()};k.Ad=function(){var a=this.h||0>this.g?0:this.g;this.a.playbackRate&&this.a.playbackRate!=a&&lf(this,this.a.playbackRate)};
k.kc=function(){var a=kf(this);.001>Math.abs(this.a.currentTime-a)?(C(this.b,this.a,"seeking",this.nc.bind(this)),C(this.b,this.a,"playing",this.lc.bind(this))):(Pa(this.b,this.a,"seeking",this.Cd.bind(this)),this.a.currentTime=a)};k.Cd=function(){C(this.b,this.a,"seeking",this.nc.bind(this));C(this.b,this.a,"playing",this.lc.bind(this))};
k.mc=function(){if(this.a.readyState){this.a.readyState!=this.C&&(this.i=!1,this.C=this.a.readyState);var a=this.l.smallGapLimit,b=this.a.currentTime,c=this.a.buffered;if(b<this.c.presentationTimeline.ia())c=mf(this,b),nf(this,b,c);else{a:{if(c&&c.length&&!(1==c.length&&1E-6>c.end(0)-c.start(0))){var d=.1;/(Edge\/|Trident\/|Tizen)/.test(navigator.userAgent)&&(d=.5);for(var e=0;e<c.length;e++)if(c.start(e)>b&&(!e||c.end(e-1)-b<=d)){d=e;break a}}d=null}if(null==d){if(3>this.a.readyState&&0<this.a.playbackRate)if(this.w!=
b)this.w=b,this.O=Date.now(),this.s=!1;else if(!this.s&&this.O<Date.now()-1E3)for(d=0;d<c.length;d++)if(b>=c.start(d)&&b<c.end(d)-.5){this.a.currentTime+=.1;this.w=this.a.currentTime;this.s=!0;break}}else if(d||this.m)if(e=c.start(d),!(e>=this.c.presentationTimeline.kb())){var f=e-b,a=f<=a,g=!1;a||this.i||(this.i=!0,f=new G("largegap",{currentTime:b,gapSize:f}),f.cancelable=!0,this.D(f),this.l.jumpLargeGaps&&!f.defaultPrevented&&(g=!0));if(a||g)d&&c.end(d-1),nf(this,b,e)}}}};
k.nc=function(){this.m=!1;var a=this.a.currentTime,b=mf(this,a);.001<Math.abs(b-a)?nf(this,a,b):(this.i=!1,this.I())};k.lc=function(){var a=this.a.currentTime,b=mf(this,a);.001<Math.abs(b-a)&&nf(this,a,b)};function mf(a,b){var c=Cb.bind(null,a.a.buffered),d=1*Math.max(a.c.minBufferTime||0,a.l.rebufferingGoal),e=a.c.presentationTimeline,f=e.va(),g=e.Da(d),h=e.Da(5),d=e.Da(d+5);return b>f?f:b<e.Da(0)?c(h)?h:d:b>=g||c(b)?b:d}
function nf(a,b,c){a.a.currentTime=c;var d=0,e=function(){!this.a||10<=d++||this.a.currentTime!=b||(this.a.currentTime=c,setTimeout(e,100))}.bind(a);setTimeout(e,100)}function hf(a,b){var c=a.c.presentationTimeline.ia();if(b<c)return c;c=a.c.presentationTimeline.va();return b>c?c:b};function of(a,b,c,d,e,f,g){this.a=a;this.B=b;this.g=c;this.w=d;this.l=e;this.h=f;this.C=g;this.c=[];this.j=new B;this.b=!1;this.i=-1;this.f=null;pf(this)}of.prototype.o=function(){var a=this.j?this.j.o():Promise.resolve();this.j=null;qf(this);this.C=this.h=this.l=this.w=this.g=this.B=this.a=null;this.c=[];return a};
of.prototype.s=function(a){if(!this.c.some(function(b){return b.info.schemeIdUri==a.schemeIdUri&&b.info.startTime==a.startTime&&b.info.endTime==a.endTime})){var b={info:a,status:1};this.c.push(b);var c=new G("timelineregionadded",{detail:rf(a)});this.h(c);this.m(!0,b)}};function rf(a){var b=Aa(a);b.eventElement=a.eventElement;return b}
of.prototype.m=function(a,b){var c=b.info.startTime>this.a.currentTime?1:b.info.endTime<this.a.currentTime?3:2,d=2==b.status,e=2==c;if(c!=b.status){if(!a||d||e)d||this.h(new G("timelineregionenter",{detail:rf(b.info)})),e||this.h(new G("timelineregionexit",{detail:rf(b.info)}));b.status=c}};function pf(a){qf(a);a.f=window.setTimeout(a.D.bind(a),250)}function qf(a){a.f&&(window.clearTimeout(a.f),a.f=null)}
of.prototype.D=function(){this.f=null;pf(this);var a=nc(this.g,this.a.currentTime);a!=this.i&&(-1!=this.i&&this.C(),this.i=a);var a=Db(this.a.buffered,this.a.currentTime),b=Bb(this.a.buffered),c=this.g.presentationTimeline,d=c.va(),e="ended"==this.B.readyState,b=c.R()&&b>=d||this.a.ended||e;this.b?(c=1*Math.max(this.g.minBufferTime||0,this.w.rebufferingGoal),(b||a>=c)&&0!=this.b&&(this.b=!1,this.l(!1))):!b&&.5>a&&1!=this.b&&(this.b=!0,this.l(!0));this.c.forEach(this.m.bind(this,!1))};function sf(a,b){this.a=b;this.b=a;this.h=null;this.i=1;this.m=Promise.resolve();this.g=[];this.j={};this.c={};this.s=!1;this.w=null;this.f=this.l=!1}k=sf.prototype;k.o=function(){for(var a in this.c)tf(this.c[a]);this.h=this.c=this.j=this.g=this.m=this.b=this.a=null;this.f=!0;return Promise.resolve()};
k.configure=function(a){this.h=a;this.w=new wa({maxAttempts:Math.max(a.retryParameters.maxAttempts,2),baseDelay:a.retryParameters.baseDelay,backoffFactor:a.retryParameters.backoffFactor,fuzzFactor:a.retryParameters.fuzzFactor,timeout:0},!0)};k.init=function(){var a=this.a.gc(this.b.periods[nc(this.b,jf(this.a.Sa))]);return a.variant||a.text?uf(this,a).then(function(){this.a&&this.a.sd&&this.a.sd()}.bind(this)):Promise.reject(new v(2,5,5005))};function S(a){return a.b.periods[nc(a.b,jf(a.a.Sa))]}
function vf(a){var b=a.c.video||a.c.audio;return b?a.b.periods[b.xa]:null}function wf(a){return Ua(a.c,function(a){return a.oa||a.stream})}function xf(a,b){var c=a.c.video;if(c){var d=c.stream;if(d)if(b){var e=d.trickModeVideo;if(e){var f=c.oa;f||(yf(a,e,!1),c.oa=d)}}else if(f=c.oa)c.oa=null,yf(a,f,!0)}}function zf(a,b,c){b.video&&yf(a,b.video,c);b.audio&&yf(a,b.audio,c)}
function yf(a,b,c){var d=a.c[b.type];if(!d&&"text"==b.type&&a.h.ignoreTextStreamFailures)uf(a,{text:b});else if(d){var e=oc(a.b,b);c&&e!=d.xa?Af(a):(d.oa&&(b.trickModeVideo?(d.oa=b,b=b.trickModeVideo):d.oa=null),(e=a.g[e])&&e.Ka&&(e=a.j[b.id])&&e.Ka&&d.stream!=b&&("text"==b.type&&Lb(a.a.M,Xa(b.mimeType,b.codecs)),d.stream=b,d.mb=!0,c&&(d.ta?d.sb=!0:d.ya?(d.ra=!0,d.sb=!0):(tf(d),Bf(a,d,!0)))))}}
function Cf(a){var b=jf(a.a.Sa);Object.keys(a.c).every(function(a){var c=this.a.M;"text"==a?(a=c.a,a=b>=a.b&&b<a.a):(a=Nb(c,a),a=Cb(a,b));return a}.bind(a))||Af(a)}function Af(a){for(var b in a.c){var c=a.c[b];c.ta||c.ra||(c.ya?c.ra=!0:null==Mb(a.a.M,b)?null==c.qa&&Df(a,c,0):(tf(c),Bf(a,c,!1)))}}
function uf(a,b,c){var d=nc(a.b,jf(a.a.Sa)),e={},f=[];b.variant&&b.variant.audio&&(e.audio=b.variant.audio,f.push(b.variant.audio));b.variant&&b.variant.video&&(e.video=b.variant.video,f.push(b.variant.video));b.text&&(e.text=b.text,f.push(b.text));a.a.M.init(e);Ef(a);return Ff(a,f).then(function(){if(!this.f)for(var a in e){var b=e[a];this.c[a]||(this.c[a]={stream:b,type:a,Ea:null,ja:null,oa:null,mb:!0,xa:d,endOfStream:!1,ya:!1,qa:null,ra:!1,sb:!1,ta:!1,Lb:!1,Pa:!1,wc:c||0},Df(this,this.c[a],0))}}.bind(a))}
function Gf(a,b){var c=a.g[b];if(c)return c.N;c={N:new y,Ka:!1};a.g[b]=c;var d=a.b.periods[b].variants.map(function(a){var b=[];a.audio&&b.push(a.audio);a.video&&b.push(a.video);a.video&&a.video.trickModeVideo&&b.push(a.video.trickModeVideo);return b}).reduce(z,[]).filter(Ea);d.push.apply(d,a.b.periods[b].textStreams);a.m=a.m.then(function(){if(!this.f)return Ff(this,d)}.bind(a)).then(function(){this.f||(this.g[b].N.resolve(),this.g[b].Ka=!0)}.bind(a))["catch"](function(a){this.f||(this.g[b].N.reject(),
delete this.g[b],this.a.onError(a))}.bind(a));return c.N}
function Ff(a,b){b.map(function(a){return a.id}).filter(Ea);for(var c=[],d=0;d<b.length;++d){var e=b[d];var f=a.j[e.id];f?c.push(f.N):(a.j[e.id]={N:new y,Ka:!1},c.push(e.createSegmentIndex()))}return Promise.all(c).then(function(){if(!this.f)for(var a=0;a<b.length;++a){var c=this.j[b[a].id];c.Ka||(c.N.resolve(),c.Ka=!0)}}.bind(a))["catch"](function(a){if(!this.f)return this.j[e.id].N.reject(),delete this.j[e.id],Promise.reject(a)}.bind(a))}
function Ef(a){var b=a.b.presentationTimeline.Y();Infinity>b?a.a.M.ea(b):a.a.M.ea(Math.pow(2,32))}k.xe=function(a){if(!this.f&&!a.ya&&null!=a.qa&&!a.ta)if(a.qa=null,a.ra)Bf(this,a,a.sb);else{try{var b=Hf(this,a);null!=b&&(Df(this,a,b),a.Pa=!1)}catch(c){If(this,c);return}b=Ta(this.c);Jf(this,a);b.every(function(a){return a.endOfStream})&&this.a.M.endOfStream().then(function(){this.b.presentationTimeline.ea(this.a.M.Y())}.bind(this))}};
function Hf(a,b){var c=jf(a.a.Sa),d=b.Ea&&b.ja?a.b.periods[oc(a.b,b.Ea)].startTime+b.ja.endTime:Math.max(c,b.wc),e=oc(a.b,b.stream),f=nc(a.b,d);var g=a.a.M;var h=b.type;"text"==h?(g=g.a,g=null==g.a||g.a<c?0:g.a-Math.max(c,g.b)):(g=Nb(g,h),g=Db(g,c));h=Math.max(a.i*Math.max(a.b.minBufferTime||0,a.h.rebufferingGoal),a.i*a.h.bufferingGoal);if(d>=a.b.presentationTimeline.Y())return b.endOfStream=!0,null;b.endOfStream=!1;b.xa=f;if(f!=e)return null;if(g>=h)return.5;d=a.a.M;f=b.type;d="text"==f?d.a.a:Bb(Nb(d,
f));b.ja&&b.stream==b.Ea?(f=b.ja.position+1,d=Kf(a,b,e,f)):(f=b.ja?b.stream.findSegmentPosition(Math.max(0,a.b.periods[oc(a.b,b.Ea)].startTime+b.ja.endTime-a.b.periods[e].startTime)):b.stream.findSegmentPosition(Math.max(0,(d||c)-a.b.periods[e].startTime)),null==f?d=null:(g=null,null==d&&(g=Kf(a,b,e,Math.max(0,f-1))),d=g||Kf(a,b,e,f)));if(!d)return 1;b.wc=0;Lf(a,b,c,e,d);return null}
function Kf(a,b,c,d){c=a.b.periods[c];b=b.stream.getSegmentReference(d);if(!b)return null;a=a.b.presentationTimeline;d=a.va();return c.startTime+b.endTime<a.ia()||c.startTime+b.startTime>d?null:b}
function Lf(a,b,c,d,e){var f=a.b.periods[d],g=b.stream,h=a.b.periods[d+1],l=null,l=h?h.startTime:a.b.presentationTimeline.Y();d=Mf(a,b,d,l);b.ya=!0;b.mb=!1;h=Nf(a,e);Promise.all([d,h]).then(function(a){if(!this.f&&!this.l)return Of(this,b,c,f,g,e,a[1])}.bind(a)).then(function(){this.f||this.l||(b.ya=!1,b.Lb=!1,b.ra||this.a.Fb(),Df(this,b,0),Pf(this,g))}.bind(a))["catch"](function(a){this.f||this.l||(b.ya=!1,"text"==b.type&&this.h.ignoreTextStreamFailures?delete this.c.text:3017==a.code?Qf(this,b,
a):(b.Pa=!0,a.severity=2,If(this,a)))}.bind(a))}function Qf(a,b,c){if(!Ta(a.c).some(function(a){return a!=b&&a.Lb})){var d=Math.round(100*a.i);if(20<d)a.i-=.2;else if(4<d)a.i-=.04;else{b.Pa=!0;a.l=!0;a.a.onError(c);return}b.Lb=!0}Df(a,b,4)}
function Mf(a,b,c,d){if(!b.mb)return Promise.resolve();c=Rb(a.a.M,b.type,a.b.periods[c].startTime-b.stream.presentationTimeOffset,d);if(!b.stream.initSegmentReference)return c;a=Nf(a,b.stream.initSegmentReference).then(function(a){if(!this.f)return Ob(this.a.M,b.type,a,null,null)}.bind(a))["catch"](function(a){b.mb=!0;return Promise.reject(a)});return Promise.all([c,a])}
function Of(a,b,c,d,e,f,g){e.containsEmsgBoxes&&(new N).aa("emsg",a.Nd.bind(a,d,f)).parse(g);return Rf(a,b,c).then(function(){if(!this.f)return Ob(this.a.M,b.type,g,f.startTime+d.startTime,f.endTime+d.startTime)}.bind(a)).then(function(){if(!this.f)return b.Ea=e,b.ja=f,Promise.resolve()}.bind(a))}
k.Nd=function(a,b,c){var d=c.u.Ib(),e=c.u.Ib(),f=c.u.F(),g=c.u.F(),h=c.u.F(),l=c.u.F();c=c.u.Ja(c.u.L.byteLength-c.u.v);a=a.startTime+b.startTime+g/f;if("urn:mpeg:dash:event:2012"==d)this.a.td();else this.a.onEvent(new G("emsg",{detail:{startTime:a,endTime:a+h/f,schemeIdUri:d,value:e,timescale:f,presentationTimeDelta:g,eventDuration:h,id:l,messageData:c}}))};
function Rf(a,b,c){var d=Mb(a.a.M,b.type);if(null==d)return Promise.resolve();c=c-d-a.h.bufferBehind;return 0>=c?Promise.resolve():a.a.M.remove(b.type,d,d+c).then(function(){}.bind(a))}function Pf(a,b){if(!a.s&&(a.s=Ta(a.c).every(function(a){return"text"==a.type?!0:!a.ra&&!a.ta&&a.ja}),a.s)){var c=oc(a.b,b);a.g[c]||Gf(a,c).then(function(){this.a.fc()}.bind(a))["catch"](Ca);for(c=0;c<a.b.periods.length;++c)Gf(a,c)["catch"](Ca);a.a.Fd&&a.a.Fd()}}
function Jf(a,b){if(b.xa!=oc(a.b,b.stream)){var c=b.xa,d=Ta(a.c);d.every(function(a){return a.xa==c})&&d.every(Sf)&&Gf(a,c).then(function(){if(!this.f&&d.every(function(a){var b=oc(this.b,a.stream);return Sf(a)&&a.xa==c&&b!=c}.bind(this))){var a=this.b.periods[c],b=this.a.gc(a),g={};b.variant&&b.variant.video&&(g.video=b.variant.video);b.variant&&b.variant.audio&&(g.audio=b.variant.audio);b.text&&(g.text=b.text);for(var h in this.c)if(!g[h]&&"text"!=h){this.a.onError(new v(2,5,5005));return}for(h in g)if(!this.c[h])if("text"==
h)uf(this,{text:g.text},a.startTime),delete g[h];else{this.a.onError(new v(2,5,5005));return}for(h in this.c)(a=g[h])?(yf(this,a,!1),Df(this,this.c[h],0)):delete this.c[h];this.a.fc()}}.bind(a))["catch"](Ca)}}function Sf(a){return!a.ya&&null==a.qa&&!a.ra&&!a.ta}function Nf(a,b){var c=Ha(b.a(),a.h.retryParameters);if(b.V||null!=b.K){var d="bytes="+b.V+"-";null!=b.K&&(d+=b.K);c.headers.Range=d}return a.a.nd.request(1,c).then(function(a){return a.data})}
function Bf(a,b,c){b.ra=!1;b.sb=!1;b.ta=!0;Qb(a.a.M,b.type).then(function(){if(!this.f&&c){var a=this.a.M,e=b.type;return"text"==e?Promise.resolve():Pb(a,e,a.Tc.bind(a,e))}}.bind(a)).then(function(){this.f||(b.Ea=null,b.ja=null,b.ta=!1,b.endOfStream=!1,Df(this,b,0))}.bind(a))}function Df(a,b,c){b.qa=window.setTimeout(a.xe.bind(a,b),1E3*c)}function tf(a){null!=a.qa&&(window.clearTimeout(a.qa),a.qa=null)}
function If(a,b){ya(a.w).then(function(){this.a.onError(b);b.handled||this.h.failureCallback(b)}.bind(a))};function Tf(a,b){return new Promise(function(c,d){var e=new XMLHttpRequest;e.open(b.method,a,!0);e.responseType="arraybuffer";e.timeout=b.retryParameters.timeout;e.withCredentials=b.allowCrossSiteCredentials;e.onload=function(b){b=b.target;var e=b.getAllResponseHeaders().split("\r\n").reduce(function(a,b){var c=b.split(": ");a[c[0].toLowerCase()]=c.slice(1).join(": ");return a},{});if(200<=b.status&&299>=b.status&&202!=b.status)b.responseURL&&(a=b.responseURL),c({uri:a,data:b.response,headers:e,fromCache:!!e["x-shaka-from-cache"]});
else{var f=null;try{f=ab(b.response)}catch(m){}d(new v(401==b.status||403==b.status?2:1,1,1001,a,b.status,f,e))}};e.onerror=function(){d(new v(1,1,1002,a))};e.ontimeout=function(){d(new v(1,1,1003,a))};for(var f in b.headers)e.setRequestHeader(f,b.headers[f]);e.send(b.body)})}n("shaka.net.HttpPlugin",Tf);Ga.http=Tf;Ga.https=Tf;function Uf(){this.a=null;this.b=[];this.c={}}k=Uf.prototype;k.init=function(a,b){return Vf(this,a,b).then(function(){var b=Object.keys(a);return Promise.all(b.map(function(a){return Wf(this,a).then(function(b){this.c[a]=b}.bind(this))}.bind(this)))}.bind(this))};k.o=function(){return Promise.all(this.b.map(function(a){try{a.transaction.abort()}catch(b){}return a.N["catch"](Ca)})).then(function(){this.a&&(this.a.close(),this.a=null)}.bind(this))};
k.get=function(a,b){var c;return Xf(this,a,"readonly",function(a){c=a.get(b)}).then(function(){return c.result})};k.forEach=function(a,b){return Xf(this,a,"readonly",function(a){a.openCursor().onsuccess=function(a){if(a=a.target.result)b(a.value),a["continue"]()}})};function Yf(a,b,c){return Xf(a,b,"readwrite",function(a){a.put(c)})}k.remove=function(a,b){return Xf(this,a,"readwrite",function(a){a["delete"](b)})};
function Zf(a,b,c){return Xf(a,"segment","readwrite",function(a){for(var d=0;d<b.length;d++)a["delete"](b[d]).onsuccess=c||function(){}})}function Wf(a,b){var c=0;return Xf(a,b,"readonly",function(a){a.openCursor(null,"prev").onsuccess=function(a){(a=a.target.result)&&(c=a.key+1)}}).then(function(){return c})}
function Xf(a,b,c,d){var e={transaction:a.a.transaction([b],c),N:new y};e.transaction.oncomplete=function(){this.b.splice(this.b.indexOf(e),1);e.N.resolve()}.bind(a);e.transaction.onabort=function(a){this.b.splice(this.b.indexOf(e),1);$f(e.transaction,e.N,a)}.bind(a);e.transaction.onerror=function(a){a.preventDefault()}.bind(a);b=e.transaction.objectStore(b);d(b);a.b.push(e);return e.N}
function Vf(a,b,c){var d=window.indexedDB.open("shaka_offline_db",1),e=!1,f=new y;d.onupgradeneeded=function(a){e=!0;a=a.target.result;for(var c in b)a.createObjectStore(c,{keyPath:b[c]})};d.onsuccess=function(a){c&&!e?(a.target.result.close(),setTimeout(function(){Vf(this,b,c-1).then(f.resolve,f.reject)}.bind(this),1E3)):(this.a=a.target.result,f.resolve())}.bind(a);d.onerror=$f.bind(null,d,f);return f}
function $f(a,b,c){a.error?b.reject(new v(2,9,9001,a.error)):b.reject(new v(2,9,9002));c.preventDefault()};var ag={manifest:"key",segment:"key"};function bg(a){var b=cg(a.periods[0],[],new Q(null,0)),c=cc(b,null,null),b=ec(b,null);c.push.apply(c,b);return{offlineUri:"offline:"+a.key,originalManifestUri:a.originalManifestUri,duration:a.duration,size:a.size,expiration:void 0==a.expiration?Infinity:a.expiration,tracks:c,appMetadata:a.appMetadata}}
function cg(a,b,c){var d=a.streams.filter(function(a){return"text"==a.contentType}),e=a.streams.filter(function(a){return"audio"==a.contentType}),f=a.streams.filter(function(a){return"video"==a.contentType});b=dg(e,f,b);d=d.map(eg);a.streams.forEach(function(a){a=fg(a);c.Ga(0,a)});return{startTime:a.startTime,variants:b,textStreams:d}}function fg(a){return a.segments.map(function(a,c){return new L(c,a.startTime,a.endTime,function(){return[a.uri]},0,null)})}
function dg(a,b,c){var d=[];if(!a.length&&!b.length)return d;a.length?b.length||(b=[null]):a=[null];for(var e=0,f=0;f<a.length;f++)for(var g=0;g<b.length;g++)if(gg(a[f],b[g])){var h=a[f];var l=b[g],m=c;h={id:e++,language:h?h.language:"",primary:!!h&&h.primary||!!l&&l.primary,audio:eg(h),video:eg(l),bandwidth:0,drmInfos:m,allowedByApplication:!0,allowedByKeySystem:!0};d.push(h)}return d}
function gg(a,b){if(!(a&&b&&a.variantIds&&b.variantIds))return!0;for(var c=0;c<a.variantIds.length;c++)if(b.variantIds.some(function(b){return b==a.variantIds[c]}))return!0;return!1}
function eg(a){if(!a)return null;var b=fg(a),b=new P(b);return{id:a.id,createSegmentIndex:Promise.resolve.bind(Promise),findSegmentPosition:b.find.bind(b),getSegmentReference:b.get.bind(b),initSegmentReference:a.initSegmentUri?new nd(function(){return[a.initSegmentUri]},0,null):null,presentationTimeOffset:a.presentationTimeOffset,mimeType:a.mimeType,codecs:a.codecs,width:a.width||void 0,height:a.height||void 0,frameRate:a.frameRate||void 0,kind:a.kind,encrypted:a.encrypted,keyId:a.keyId,language:a.language,
label:a.label||null,type:a.contentType,primary:a.primary,trickModeVideo:null,containsEmsgBoxes:!1,roles:[],channelsCount:null}}function hg(){return window.indexedDB?new Uf:null};function ig(a,b,c,d){this.b={};this.l=[];this.m=d;this.j=a;this.s=b;this.w=c;this.i=this.a=null;this.f=this.g=this.h=this.c=0}ig.prototype.o=function(){var a=this.j,b=this.l,c=this.i||Promise.resolve();b.length&&(c=c.then(function(){return Zf(a,b)}));this.b={};this.l=[];this.i=this.a=this.w=this.s=this.j=this.m=null;return c};function jg(a,b,c,d,e){a.b[b]=a.b[b]||[];a.b[b].push({uris:c.a(),V:c.V,K:c.K,Xb:d,Nb:e})}
function kg(a,b){a.c=0;a.h=0;a.g=0;a.f=0;Ta(a.b).forEach(function(a){a.forEach(function(a){null!=a.K?this.c+=a.K-a.V+1:this.g+=a.Xb}.bind(this))}.bind(a));a.a=b;a.a.size=a.c;var c=Ta(a.b).map(function(a){var b=0,c=function(){if(!this.m)return Promise.reject(new v(2,9,9002));if(b>=a.length)return Promise.resolve();var d=a[b++];return lg(this,d).then(c)}.bind(this);return c()}.bind(a));a.b={};a.i=Promise.all(c).then(function(){return Yf(this.j,"manifest",b)}.bind(a)).then(function(){this.l=[]}.bind(a));
return a.i}
function lg(a,b){var c=Ha(b.uris,a.w);if(b.V||null!=b.K)c.headers.Range="bytes="+b.V+"-"+(null==b.K?"":b.K);var d;return a.s.request(1,c).then(function(a){if(!this.a)return Promise.reject(new v(2,9,9002));d=a.data.byteLength;this.l.push(b.Nb.key);b.Nb.data=a.data;return Yf(this.j,"segment",b.Nb)}.bind(a)).then(function(){if(!this.a)return Promise.reject(new v(2,9,9002));null==b.K?(this.a.size+=d,this.f+=b.Xb):this.h+=d;var a=(this.h+this.f)/(this.c+this.g),c=bg(this.a);this.m.progressCallback(c,a)}.bind(a))}
;function mg(){this.a=-1}k=mg.prototype;k.configure=function(){};k.start=function(a){var b=/^offline:([0-9]+)$/.exec(a);if(!b)return Promise.reject(new v(2,1,9004,a));var c=Number(b[1]),d=hg();this.a=c;return d?d.init(ag).then(function(){return d.get("manifest",c)}).then(function(a){if(!a)throw new v(2,9,9003,c);return ng(a)}).then(function(a){return d.o().then(function(){return a})},function(a){return d.o().then(function(){throw a;})}):Promise.reject(new v(2,9,9E3))};k.stop=function(){return Promise.resolve()};
k.update=function(){};k.onExpirationUpdated=function(a,b){var c=hg();c.init(ag).then(function(){return c.get("manifest",this.a)}.bind(this)).then(function(d){if(d&&!(0>d.sessionIds.indexOf(a))&&(void 0==d.expiration||d.expiration>b))return d.expiration=b,Yf(c,"manifest",d)})["catch"](function(){}).then(function(){return c.o()})};
function ng(a){var b=new Q(null,0);b.ea(a.duration);var c=a.drmInfo?[a.drmInfo]:[];return{presentationTimeline:b,minBufferTime:10,offlineSessionIds:a.sessionIds,periods:a.periods.map(function(a){return cg(a,c,b)})}}Sd["application/x-offline-manifest"]=mg;function og(a){if(/^offline:([0-9]+)$/.exec(a)){var b={uri:a,data:new ArrayBuffer(0),headers:{"content-type":"application/x-offline-manifest"}};return Promise.resolve(b)}if(b=/^offline:[0-9]+\/[0-9]+\/([0-9]+)$/.exec(a)){var c=Number(b[1]),d=hg();return d?d.init(ag).then(function(){return d.get("segment",c)}).then(function(b){return d.o().then(function(){if(!b)throw new v(2,9,9003,c);return{uri:a,data:b.data,headers:{}}})}):Promise.reject(new v(2,9,9E3))}return Promise.reject(new v(2,1,9004,a))}
n("shaka.offline.OfflineScheme",og);Ga.offline=og;function T(a){this.a=null;for(var b=0;b<a.textTracks.length;++b){var c=a.textTracks[b];c.mode="disabled";"Shaka Player TextTrack"==c.label&&(this.a=c)}this.a||(this.a=a.addTextTrack("subtitles","Shaka Player TextTrack"));this.a.mode="hidden"}n("shaka.text.SimpleTextDisplayer",T);T.prototype.remove=function(a,b){if(!this.a)return!1;pg(this,function(c){return c.startTime>=b||c.endTime<=a?!1:!0});return!0};T.prototype.remove=T.prototype.remove;
T.prototype.append=function(a){for(var b=[],c=0;c<a.length;c++){var d=qg(a[c]);d&&b.push(d)}b.slice().sort(function(a,c){return a.startTime!=c.startTime?a.startTime-c.startTime:a.endTime!=c.endTime?a.endTime-c.startTime:b.indexOf(c)-b.indexOf(a)}).forEach(function(a){this.a.addCue(a)}.bind(this))};T.prototype.append=T.prototype.append;T.prototype.o=function(){this.a&&pg(this,function(){return!0});this.a=null;return Promise.resolve()};T.prototype.destroy=T.prototype.o;
T.prototype.isTextVisible=function(){return"showing"==this.a.mode};T.prototype.isTextVisible=T.prototype.isTextVisible;T.prototype.setTextVisibility=function(a){this.a.mode=a?"showing":"hidden"};T.prototype.setTextVisibility=T.prototype.setTextVisibility;
function qg(a){if(a.startTime>=a.endTime)return null;var b=new VTTCue(a.startTime,a.endTime,a.l);b.lineAlign=a.h;b.positionAlign=a.i;b.size=a.size;try{b.align=a.f}catch(c){}"center"==a.f&&"center"!=b.align&&(b.position="auto",b.align="middle");a.b==rg?b.vertical="lr":a.b==sg&&(b.vertical="rl");a.g==tg&&(b.snapToLines=!1);null!=a.c&&(b.line=a.c);null!=a.position&&(b.position=a.position);return b}
function pg(a,b){for(var c=a.a.cues,d=[],e=0;e<c.length;++e)b(c[e])&&d.push(c[e]);for(e=0;e<d.length;++e)a.a.removeCue(d[e])};function ug(){this.a=Promise.resolve();this.b=this.c=this.f=!1;this.i=new Promise(function(a){this.g=a}.bind(this))}ug.prototype.then=function(a){this.a=this.a.then(a).then(function(a){return this.b?(this.g(),Promise.reject(this.h)):Promise.resolve(a)}.bind(this));return this};function vg(a){a.f||(a.a=a.a.then(function(a){this.c=!0;return Promise.resolve(a)}.bind(a),function(a){this.c=!0;return this.b?(this.g(),Promise.reject(this.h)):Promise.reject(a)}.bind(a)));a.f=!0;return a.a}
ug.prototype.cancel=function(a){if(this.c)return Promise.resolve();this.b=!0;this.h=a;return this.i};function U(a,b){p.call(this);this.I=!1;this.f=a;this.gb=!1;this.w=null;this.m=new B;this.g=this.fb=this.b=this.l=this.a=this.B=this.h=this.cb=this.Ma=this.O=this.j=this.s=null;this.Jc=1E9;this.ab=[];this.Na=!1;this.ga=!0;this.sa=this.Oa=this.D=null;this.Vb=!1;this.fa=null;this.eb=[];this.C={};this.c=wg(this);this.bb={width:Infinity,height:Infinity};this.i=xg();this.$a=0;this.na=this.c.preferredAudioLanguage;this.Xa=this.c.preferredTextLanguage;this.tb=this.Ya="";this.Wb=!0;b&&b(this);this.s=new A(this.pe.bind(this));
this.cb=yg(this);C(this.m,this.f,"error",this.Hd.bind(this))}ba(U);n("shaka.Player",U);U.prototype.o=function(){this.I=!0;var a=Promise.resolve();this.D&&(a=this.D.cancel(new v(2,7,7E3)));return a.then(function(){var a=Promise.all([this.Oa,zg(this),this.m?this.m.o():null,this.s?this.s.o():null]);this.f=null;this.gb=!1;this.c=this.s=this.g=this.m=null;return a}.bind(this))};U.prototype.destroy=U.prototype.o;U.version="v2.2.1";var Ag={};U.registerSupportPlugin=function(a,b){Ag[a]=b};
U.isBrowserSupported=function(){return!!window.Promise&&!!window.Uint8Array&&!!Array.prototype.forEach&&!!window.MediaSource&&!!MediaSource.isTypeSupported&&!!window.MediaKeys&&!!window.navigator&&!!window.navigator.requestMediaKeySystemAccess&&!!window.MediaKeySystemAccess&&!!window.MediaKeySystemAccess.prototype.getConfiguration};U.probeSupport=function(){return yb().then(function(a){var b=Ud(),c=Kb();a={manifest:b,media:c,drm:a};for(var d in Ag)a[d]=Ag[d]();return a})};
U.prototype.load=function(a,b,c){var d=this.qb(),e=new ug;this.D=e;this.dispatchEvent(new G("loading"));var f=Date.now();return vg(e.then(function(){return d}).then(function(){this.i=xg();C(this.m,this.f,"playing",this.Wa.bind(this));C(this.m,this.f,"pause",this.Wa.bind(this));C(this.m,this.f,"ended",this.Wa.bind(this));this.g=new this.c.abrFactory;Bg(this);this.w=new this.c.textDisplayFactory;this.w.setTextVisibility(this.gb);return Vd(a,this.s,this.c.manifest.retryParameters,c)}.bind(this)).then(function(b){this.l=
new b;this.l.configure(this.c.manifest);b={networkingEngine:this.s,filterNewPeriod:this.hb.bind(this),filterAllPeriods:this.Qb.bind(this),onTimelineRegionAdded:this.Gd.bind(this),onEvent:this.pb.bind(this),onError:this.La.bind(this)};return 2<this.l.start.length?this.l.start(a,this.s,b.filterNewPeriod,b.onError,b.onEvent):this.l.start(a,b)}.bind(this)).then(function(b){b.periods.some(function(a){return a.variants.some(function(a){return a.video&&a.audio})})&&b.periods.forEach(function(a){a.variants=
a.variants.filter(function(a){return a.video&&a.audio})});if(0==b.periods.length)throw new v(2,4,4014);this.b=b;this.fb=a;this.j=new jb(this.s,this.La.bind(this),this.ne.bind(this),this.me.bind(this));this.j.configure(this.c.drm);return this.j.init(b,!1)}.bind(this)).then(function(){this.Qb(this.b.periods);this.$a=Date.now()/1E3;this.na=this.c.preferredAudioLanguage;this.Xa=this.c.preferredTextLanguage;var a=this.b.presentationTimeline.Y(),b=this.c.playRangeEnd,c=this.c.playRangeStart;0<c&&(this.R()||
this.b.presentationTimeline.Ac(c));b<a&&(this.R()||this.b.presentationTimeline.ea(b));return Promise.all([mb(this.j,this.f),this.cb])}.bind(this)).then(function(){this.g.chooseStreams?this.g.init(this.Ae.bind(this)):this.g.init(this.Fc.bind(this));this.h=new ff(this.f,this.b,this.c.streaming,b||this.c.playRangeStart||null,this.oe.bind(this),this.pb.bind(this));this.B=new of(this.f,this.O,this.b,this.c.streaming,this.Ec.bind(this),this.pb.bind(this),this.le.bind(this));this.Ma=new Jb(this.f,this.O,
this.w);this.a=new sf(this.b,{Sa:this.h,M:this.Ma,nd:this.s,gc:this.od.bind(this),fc:this.Mc.bind(this),onError:this.La.bind(this),onEvent:this.pb.bind(this),td:this.ud.bind(this),Fb:this.Dd.bind(this),filterNewPeriod:this.hb.bind(this),filterAllPeriods:this.Qb.bind(this)});this.a.configure(this.c.streaming);Cg(this);return this.a.init()}.bind(this)).then(function(){if(this.c.streaming.startAtSegmentBoundary){var a=Dg(this,jf(this.h));gf(this.h,a)}this.b.periods.forEach(this.hb.bind(this));Eg(this);
Fg(this);var a=S(this.a),b=hc(a,this.na,this.Ya);this.g.setVariants(b);a.variants.some(function(a){return a.primary});this.eb.forEach(this.B.s.bind(this.B));this.eb=[];Pa(this.m,this.f,"loadeddata",function(){this.i.loadLatency=(Date.now()-f)/1E3}.bind(this));this.D=null}.bind(this)))["catch"](function(a){this.D==e&&(this.D=null,this.dispatchEvent(new G("unloading")));return Promise.reject(a)}.bind(this))};U.prototype.load=U.prototype.load;
function Cg(a){function b(a){return(a.video?a.video.codecs.split(".")[0]:"")+"-"+(a.audio?a.audio.codecs.split(".")[0]:"")}var c={};a.b.periods.forEach(function(a){a.variants.forEach(function(a){var d=b(a);d in c||(c[d]=[]);c[d].push(a)})});var d=null,e=Infinity;Wa(c,function(a,b){var c=0,f=0;b.forEach(function(a){c+=a.bandwidth||0;++f});var g=c/f;g<e&&(d=a,e=g)});a.b.periods.forEach(function(a){a.variants=a.variants.filter(function(a){return b(a)==d?!0:!1})})}
function yg(a){a.O=new MediaSource;var b=new y;C(a.m,a.O,"sourceopen",b.resolve);a.f.src=window.URL.createObjectURL(a.O);return b}U.prototype.configure=function(a){if(a.abr&&a.abr.manager){var b=a.abr.manager;delete a.abr.manager;a.abrFactory=function(){return b}}a.streaming&&null!=a.streaming.infiniteRetriesForLiveStreams&&(this.Wb=!!a.streaming.infiniteRetriesForLiveStreams,delete a.streaming.infiniteRetriesForLiveStreams);za(this.c,a,wg(this),Gg(),"");Hg(this)};U.prototype.configure=U.prototype.configure;
function Hg(a){a.l&&a.l.configure(a.c.manifest);a.j&&a.j.configure(a.c.drm);if(a.a){a.a.configure(a.c.streaming);try{a.b.periods.forEach(a.hb.bind(a))}catch(b){a.La(b)}Ig(a,S(a.a))}a.g&&(Bg(a),a.c.abr.enabled&&!a.ga?a.g.enable():a.g.disable())}function Bg(a){a.g.configure?a.g.configure(a.c.abr):(a.g.setDefaultEstimate(a.c.abr.defaultBandwidthEstimate),a.g.setRestrictions(a.c.abr.restrictions))}U.prototype.getConfiguration=function(){var a=wg(this);za(a,this.c,wg(this),Gg(),"");return a};
U.prototype.getConfiguration=U.prototype.getConfiguration;U.prototype.$d=function(){this.c=wg(this);Hg(this)};U.prototype.resetConfiguration=U.prototype.$d;U.prototype.Xc=function(){return this.f};U.prototype.getMediaElement=U.prototype.Xc;U.prototype.cc=function(){return this.s};U.prototype.getNetworkingEngine=U.prototype.cc;U.prototype.Wc=function(){return this.fb};U.prototype.getManifestUri=U.prototype.Wc;U.prototype.R=function(){return this.b?this.b.presentationTimeline.R():!1};
U.prototype.isLive=U.prototype.R;U.prototype.wa=function(){return this.b?this.b.presentationTimeline.wa():!1};U.prototype.isInProgress=U.prototype.wa;U.prototype.hd=function(){if(!this.b||!this.b.periods.length)return!1;var a=this.b.periods[0].variants;return a.length?!a[0].video:!1};U.prototype.isAudioOnly=U.prototype.hd;U.prototype.be=function(){var a=0,b=0;this.b&&(b=this.b.presentationTimeline,a=b.ia(),b=b.kb());return{start:a,end:b}};U.prototype.seekRange=U.prototype.be;
U.prototype.keySystem=function(){return this.j?this.j.keySystem():""};U.prototype.keySystem=U.prototype.keySystem;U.prototype.drmInfo=function(){return this.j?this.j.b:null};U.prototype.drmInfo=U.prototype.drmInfo;U.prototype.jb=function(){return this.j?this.j.jb():Infinity};U.prototype.getExpiration=U.prototype.jb;U.prototype.jd=function(){return this.Na};U.prototype.isBuffering=U.prototype.jd;
U.prototype.qb=function(){if(this.I)return Promise.resolve();this.dispatchEvent(new G("unloading"));var a=Promise.resolve();this.D&&(a=this.D.cancel(new v(2,7,7E3)));return a.then(function(){this.Oa||(this.Oa=Jg(this).then(function(){this.Oa=null}.bind(this)));return this.Oa}.bind(this))};U.prototype.unload=U.prototype.qb;U.prototype.xb=function(){return this.h?this.h.xb():0};U.prototype.getPlaybackRate=U.prototype.xb;U.prototype.Be=function(a){this.h&&lf(this.h,a);this.a&&xf(this.a,1!=a)};
U.prototype.trickPlay=U.prototype.Be;U.prototype.Nc=function(){this.h&&lf(this.h,1);this.a&&xf(this.a,!1)};U.prototype.cancelTrickPlay=U.prototype.Nc;U.prototype.fd=function(){if(!this.b)return[];var a=nc(this.b,jf(this.h)),b=this.C[a]||{};return cc(this.b.periods[a],b.audio,b.video)};U.prototype.getVariantTracks=U.prototype.fd;U.prototype.ed=function(){if(!this.b)return[];var a=nc(this.b,jf(this.h));return ec(this.b.periods[a],(this.C[a]||{}).text).filter(function(a){return 0>this.ab.indexOf(a.id)}.bind(this))};
U.prototype.getTextTracks=U.prototype.ed;U.prototype.fe=function(a){this.a&&(a=gc(S(this.a),a))&&(Kg(this,a,!1),this.ga?this.fa=a:yf(this.a,a,!0))};U.prototype.selectTextTrack=U.prototype.fe;U.prototype.ge=function(a,b){if(this.a){var c=fc(S(this.a),a);c&&c.allowedByApplication&&c.allowedByKeySystem&&(Lg(this,c,!1),Mg(this,c,b))}};U.prototype.selectVariantTrack=U.prototype.ge;U.prototype.Uc=function(){return this.a?dc(S(this.a).variants).map(function(a){return a.language}).filter(Ea):[]};
U.prototype.getAudioLanguages=U.prototype.Uc;U.prototype.dd=function(){return this.a?S(this.a).textStreams.map(function(a){return a.language}).filter(Ea):[]};U.prototype.getTextLanguages=U.prototype.dd;U.prototype.de=function(a,b){if(this.a){var c=S(this.a);this.na=a;this.Ya=b||"";Ig(this,c)}};U.prototype.selectAudioLanguage=U.prototype.de;U.prototype.ee=function(a,b){if(this.a){var c=S(this.a);this.Xa=a;this.tb=b||"";Ig(this,c)}};U.prototype.selectTextLanguage=U.prototype.ee;
U.prototype.ld=function(){return this.w?this.w.isTextVisible():this.gb};U.prototype.isTextTrackVisible=U.prototype.ld;U.prototype.je=function(a){this.w?this.w.setTextVisibility(a):this.gb=a;Ng(this)};U.prototype.setTextTrackVisibility=U.prototype.je;U.prototype.Zc=function(){return this.b?new Date(1E3*this.b.presentationTimeline.c+1E3*this.f.currentTime):null};U.prototype.getPlayheadTimeAsDate=U.prototype.Zc;U.prototype.bd=function(){return this.b?new Date(1E3*this.b.presentationTimeline.c):null};
U.prototype.getPresentationStartTimeAsDate=U.prototype.bd;
U.prototype.getStats=function(){Og(this);this.Wa();var a=null,b=null,c=this.f,c=c&&c.getVideoPlaybackQuality?c.getVideoPlaybackQuality():{};this.h&&this.b&&(a=nc(this.b,jf(this.h)),b=this.C[a],b=mc(b.audio,b.video,this.b.periods[a].variants),a=b.video||{});a||(a={});b||(b={});return{width:a.width||0,height:a.height||0,streamBandwidth:b.bandwidth||0,decodedFrames:Number(c.totalVideoFrames),droppedFrames:Number(c.droppedVideoFrames),estimatedBandwidth:this.g?this.g.getBandwidthEstimate():NaN,loadLatency:this.i.loadLatency,
playTime:this.i.playTime,bufferingTime:this.i.bufferingTime,switchHistory:Aa(this.i.switchHistory),stateHistory:Aa(this.i.stateHistory)}};U.prototype.getStats=U.prototype.getStats;
U.prototype.addTextTrack=function(a,b,c,d,e,f){if(!this.a)return Promise.reject();for(var g=S(this.a),h,l=0;l<this.b.periods.length;l++)if(this.b.periods[l]==g){if(l==this.b.periods.length-1){if(h=this.b.presentationTimeline.Y()-g.startTime,Infinity==h)return Promise.reject()}else h=this.b.periods[l+1].startTime-g.startTime;break}var m={id:this.Jc++,createSegmentIndex:Promise.resolve.bind(Promise),findSegmentPosition:function(){return 1},getSegmentReference:function(b){return 1!=b?null:new L(1,0,
h,function(){return[a]},0,null)},initSegmentReference:null,presentationTimeOffset:0,mimeType:d,codecs:e||"",kind:c,encrypted:!1,keyId:null,language:b,label:f||null,type:"text",primary:!1,trickModeVideo:null,containsEmsgBoxes:!1,roles:[],channelsCount:null};this.ab.push(m.id);g.textStreams.push(m);return uf(this.a,{text:m}).then(function(){if(!this.I){var a=this.b.periods.indexOf(g),d=wf(this.a);d.text&&(this.C[a].text=d.text.id);this.ab.splice(this.ab.indexOf(m.id),1);Ig(this,g);Eg(this);return{id:m.id,
active:!1,type:"text",bandwidth:0,language:b,label:f||null,kind:c,width:null,height:null}}}.bind(this))};U.prototype.addTextTrack=U.prototype.addTextTrack;U.prototype.Pb=function(a,b){this.bb.width=a;this.bb.height=b};U.prototype.setMaxHardwareResolution=U.prototype.Pb;U.prototype.xc=function(){if(this.a){var a=this.a;if(a.f)a=!1;else if(a.l)a=!1;else{for(var b in a.c){var c=a.c[b];c.Pa&&(c.Pa=!1,Df(a,c,.1))}a=!0}}else a=!1;return a};U.prototype.retryStreaming=U.prototype.xc;
function Lg(a,b,c){b.video&&Pg(a,b.video);b.audio&&Pg(a,b.audio);var d=vf(a.a),e=wf(a.a);b!=lc(e.audio,e.video,d?d.variants:[])&&a.i.switchHistory.push({timestamp:Date.now()/1E3,id:b.id,type:"variant",fromAdaptation:c,bandwidth:b.bandwidth})}function Kg(a,b,c){Pg(a,b);a.i.switchHistory.push({timestamp:Date.now()/1E3,id:b.id,type:"text",fromAdaptation:c,bandwidth:null})}function Pg(a,b){var c=oc(a.b,b);a.C[c]||(a.C[c]={});a.C[c][b.type]=b.id}
function zg(a){a.m&&(a.m.la(a.O,"sourceopen"),a.m.la(a.f,"loadeddata"),a.m.la(a.f,"playing"),a.m.la(a.f,"pause"),a.m.la(a.f,"ended"));a.f&&(a.f.removeAttribute("src"),a.f.load());var b=Promise.all([a.g?a.g.stop():null,a.j?a.j.o():null,a.Ma?a.Ma.o():null,a.h?a.h.o():null,a.B?a.B.o():null,a.a?a.a.o():null,a.l?a.l.stop():null,a.w?a.w.o():null]);a.j=null;a.Ma=null;a.h=null;a.B=null;a.a=null;a.l=null;a.w=null;a.b=null;a.fb=null;a.cb=null;a.O=null;a.eb=[];a.C={};a.i=xg();return b}
function Jg(a){return a.l?zg(a).then(function(){this.I||(this.Ec(!1),this.cb=yg(this))}.bind(a)):Promise.resolve()}function Gg(){return{".drm.servers":"",".drm.clearKeys":"",".drm.advanced":{distinctiveIdentifierRequired:!1,persistentStateRequired:!1,videoRobustness:"",audioRobustness:"",serverCertificate:new Uint8Array(0)}}}
function wg(a){return{drm:{retryParameters:xa(),servers:{},clearKeys:{},advanced:{},delayLicenseRequestUntilPlayed:!1},manifest:{retryParameters:xa(),dash:{customScheme:function(a){if(a)return null},clockSyncUri:"",ignoreDrmInfo:!1,xlinkFailGracefully:!1},hls:{defaultTimeOffset:0}},streaming:{retryParameters:xa(),failureCallback:a.Qc.bind(a),rebufferingGoal:2,bufferingGoal:10,bufferBehind:30,ignoreTextStreamFailures:!1,startAtSegmentBoundary:!1,smallGapLimit:.5,jumpLargeGaps:!1},abrFactory:F,textDisplayFactory:function(a){return new T(a)}.bind(null,
a.f),abr:{enabled:!0,defaultBandwidthEstimate:5E5,switchInterval:8,bandwidthUpgradeTarget:.85,bandwidthDowngradeTarget:.95,restrictions:{minWidth:0,maxWidth:Infinity,minHeight:0,maxHeight:Infinity,minPixels:0,maxPixels:Infinity,minBandwidth:0,maxBandwidth:Infinity}},preferredAudioLanguage:"",preferredTextLanguage:"",restrictions:{minWidth:0,maxWidth:Infinity,minHeight:0,maxHeight:Infinity,minPixels:0,maxPixels:Infinity,minBandwidth:0,maxBandwidth:Infinity},playRangeStart:0,playRangeEnd:Infinity}}
k=U.prototype;k.Qc=function(a){var b=[1001,1002,1003];this.R()&&this.Wb&&0<=b.indexOf(a.code)&&(a.severity=1,this.xc())};function xg(){return{width:NaN,height:NaN,streamBandwidth:NaN,decodedFrames:NaN,droppedFrames:NaN,estimatedBandwidth:NaN,loadLatency:NaN,playTime:0,bufferingTime:0,switchHistory:[],stateHistory:[]}}
k.Qb=function(a){var b=this.a?wf(this.a):{};a.forEach(function(a){ac(this.j,b,a)}.bind(this));var c=0;a.forEach(function(a){0<dc(a.variants).length&&c++}.bind(this));if(!c)throw new v(2,4,9009);if(c<a.length)throw new v(2,4,4011);a.forEach(function(a){$b(a,this.c.restrictions,this.bb)&&this.a&&S(this.a)==a&&Eg(this);if(1>dc(a.variants).length)throw new v(2,4,4012);}.bind(this))};
k.hb=function(a){var b=this.a?wf(this.a):{};ac(this.j,b,a);b=0<dc(a.variants).length;$b(a,this.c.restrictions,this.bb)&&this.a&&S(this.a)==a&&Eg(this);a=1>dc(a.variants).length;if(!b)throw new v(2,4,4011);if(a)throw new v(2,4,4012);};function Mg(a,b,c){a.ga?(a.sa=b,a.Vb=c||!1):zf(a.a,b,c||!1)}function Og(a){if(a.b){var b=Date.now()/1E3;a.Na?a.i.bufferingTime+=b-a.$a:a.i.playTime+=b-a.$a;a.$a=b}}
function Dg(a,b){function c(a,b){if(!a)return null;var c=a.findSegmentPosition(b-e.startTime);return null==c?null:(c=a.getSegmentReference(c))?c.startTime+e.startTime:null}var d=wf(a.a),e=S(a.a),f=c(d.video,b),d=c(d.audio,b);return null!=f&&null!=d?Math.max(f,d):null!=f?f:null!=d?d:b}k.pe=function(a,b){this.g&&this.g.segmentDownloaded(a,b)};k.Ec=function(a){Og(this);this.Na=a;this.Wa();if(this.h){var b=this.h;a!=b.h&&(b.h=a,lf(b,b.g))}this.dispatchEvent(new G("buffering",{buffering:a}))};k.le=function(){Eg(this)};
k.Wa=function(){if(!this.I){var a=this.Na?"buffering":this.f.ended?"ended":this.f.paused?"paused":"playing";var b=Date.now()/1E3;if(this.i.stateHistory.length){var c=this.i.stateHistory[this.i.stateHistory.length-1];c.duration=b-c.timestamp;if(a==c.state)return}this.i.stateHistory.push({timestamp:b,state:a,duration:0})}};k.oe=function(){if(this.B){var a=this.B;a.c.forEach(a.m.bind(a,!0))}this.a&&Cf(this.a)};
function Qg(a,b){if(!b||!b.length)return a.La(new v(2,4,4012)),null;a.g.setVariants(b);if(a.g.chooseStreams){var c=a.g.chooseStreams(["video","audio"]);return lc(c.audio,c.video,b)}return a.g.chooseVariant()}function Ig(a,b){var c=hc(b,a.na,a.Ya),d=jc(b,a.Xa,a.tb);if(c=Qg(a,c))Lg(a,c,!0),Mg(a,c,!0);if(d=d[0])Kg(a,d,!0),a.ga?a.fa=d:yf(a.a,d,!0);Fg(a)}
k.od=function(a){this.ga=!0;this.g.disable();var b={audio:!1,text:!1},c=hc(a,this.na,this.Ya,b);a=jc(a,this.Xa,this.tb,b);c=Qg(this,c);a=a[0]||null;this.fa=this.sa=null;c&&Lg(this,c,!0);a&&(Kg(this,a,!0),!vf(this.a)&&c&&c.audio&&b.text&&a.language!=c.audio.language&&(this.w.setTextVisibility(!0),Ng(this)));return{variant:c,text:a}};k.Mc=function(){this.ga=!1;this.c.abr.enabled&&this.g.enable();this.sa&&(zf(this.a,this.sa,this.Vb),this.sa=null);this.fa&&(yf(this.a,this.fa,!0),this.fa=null)};
k.ud=function(){this.l&&this.l.update&&this.l.update()};k.Dd=function(){this.h&&this.h.Fb()};k.Fc=function(a,b){Lg(this,a,!0);this.a&&(zf(this.a,a,b||!1),Fg(this))};k.Ae=function(a,b){if(this.a){var c=vf(this.a);(c=lc(a.audio,a.video,c?c.variants:[]))&&this.Fc(c,b)}};function Fg(a){Promise.resolve().then(function(){this.I||this.dispatchEvent(new G("adaptation"))}.bind(a))}function Eg(a){Promise.resolve().then(function(){this.I||this.dispatchEvent(new G("trackschanged"))}.bind(a))}
function Ng(a){a.dispatchEvent(new G("texttrackvisibility"))}k.La=function(a){if(!this.I){var b=new G("error",{detail:a});this.dispatchEvent(b);b.defaultPrevented&&(a.handled=!0)}};k.Gd=function(a){this.B?this.B.s(a):this.eb.push(a)};k.pb=function(a){this.dispatchEvent(a)};k.Hd=function(){if(this.f.error){var a=this.f.error.code;if(1!=a){var b=this.f.error.msExtendedCode;b&&(0>b&&(b+=Math.pow(2,32)),b=b.toString(16));this.La(new v(2,3,3016,a,b,this.f.error.message))}}};
k.ne=function(a){var b=["output-restricted","internal-error"],c=S(this.a),d=!1,e=1==Object.keys(a).length&&"00"==Object.keys(a)[0];c.variants.forEach(function(c){var f=[];c.audio&&f.push(c.audio);c.video&&f.push(c.video);f.forEach(function(f){var g=c.allowedByKeySystem;f.keyId&&(f=a[e?"00":f.keyId],c.allowedByKeySystem=!!f&&0>b.indexOf(f));g!=c.allowedByKeySystem&&(d=!0)})});var f=wf(this.a);(f=lc(f.audio,f.video,c.variants))&&!f.allowedByKeySystem&&Ig(this,c);d&&Eg(this)};
k.me=function(a,b){if(this.l&&this.l.onExpirationUpdated)this.l.onExpirationUpdated(a,b);this.dispatchEvent(new G("expirationupdated"))};function V(a){if(!a||a.constructor!=U)throw new v(2,9,9008);this.a=hg();this.g=a;this.b=Rg(this);this.c=null;this.s=!1;this.j=null;this.h=-1;this.l=0;this.f=null;this.i=new ig(this.a,a.s,a.getConfiguration().streaming.retryParameters,this.b)}n("shaka.offline.Storage",V);function Sg(){return!!window.indexedDB}V.support=Sg;V.prototype.o=function(){var a=this.a,b=this.i?this.i.o()["catch"](function(){}).then(function(){if(a)return a.o()}):Promise.resolve();this.b=this.g=this.i=this.a=null;return b};
V.prototype.destroy=V.prototype.o;V.prototype.configure=function(a){za(this.b,a,Rg(this),{},"")};V.prototype.configure=V.prototype.configure;
V.prototype.ye=function(a,b,c){function d(a){f=a}if(this.s)return Promise.reject(new v(2,9,9006));this.s=!0;var e,f=null;return Tg(this).then(function(){W(this);return Ug(this,a,d,c)}.bind(this)).then(function(c){W(this);this.f=c.manifest;this.c=c.Rc;if(this.f.presentationTimeline.R()||this.f.presentationTimeline.wa())throw new v(2,9,9005,a);this.m(this.f.periods);this.h=this.a.c.manifest++;this.l=0;c=b||{};var d=this.f.periods.map(this.C.bind(this)),f=this.c.b,g=rb(this.c);if(f){if(!g.length)throw new v(2,
9,9007,a);f.initData=[]}e={key:this.h,originalManifestUri:a,duration:this.l,size:0,expiration:this.c.jb(),periods:d,sessionIds:this.b.usePersistentLicense?g:[],drmInfo:f,appMetadata:c};return kg(this.i,e)}.bind(this)).then(function(){W(this);if(f)throw f;return Vg(this)}.bind(this)).then(function(){return bg(e)}.bind(this))["catch"](function(a){return Vg(this)["catch"](Ca).then(function(){throw a;})}.bind(this))};V.prototype.store=V.prototype.ye;
V.prototype.remove=function(a){function b(a){6013!=a.code&&(e=a)}var c=a.offlineUri,d=/^offline:([0-9]+)$/.exec(c);if(!d)return Promise.reject(new v(2,9,9004,c));var e=null,f,g,h=Number(d[1]);return Tg(this).then(function(){W(this);return this.a.get("manifest",h)}.bind(this)).then(function(a){W(this);if(!a)throw new v(2,9,9003,c);f=a;a=ng(f);g=new jb(this.g.s,b,function(){},function(){});g.configure(this.g.getConfiguration().drm);return g.init(a,this.b.usePersistentLicense||!1)}.bind(this)).then(function(){return ob(g,
f.sessionIds)}.bind(this)).then(function(){return g.o()}.bind(this)).then(function(){W(this);if(e)throw e;var b=f.periods.map(function(a){return a.streams.map(function(a){var b=a.segments.map(function(a){a=/^offline:[0-9]+\/[0-9]+\/([0-9]+)$/.exec(a.uri);return Number(a[1])});a.initSegmentUri&&(a=/^offline:[0-9]+\/[0-9]+\/([0-9]+)$/.exec(a.initSegmentUri),b.push(Number(a[1])));return b}).reduce(z,[])}).reduce(z,[]),c=0,d=b.length,g=this.b.progressCallback;return Zf(this.a,b,function(){c++;g(a,c/d)})}.bind(this)).then(function(){W(this);
this.b.progressCallback(a,1);return this.a.remove("manifest",h)}.bind(this))};V.prototype.remove=V.prototype.remove;V.prototype.list=function(){var a=[];return Tg(this).then(function(){W(this);return this.a.forEach("manifest",function(b){a.push(bg(b))})}.bind(this)).then(function(){return a})};V.prototype.list=V.prototype.list;
function Ug(a,b,c,d){function e(){}var f=a.g.s,g=a.g.getConfiguration(),h,l,m;return Vd(b,f,g.manifest.retryParameters,d).then(function(a){W(this);m=new a;m.configure(g.manifest);return m.start(b,{networkingEngine:f,filterAllPeriods:this.m.bind(this),filterNewPeriod:this.w.bind(this),onTimelineRegionAdded:function(){},onEvent:function(){},onError:c})}.bind(a)).then(function(a){W(this);h=a;l=new jb(f,c,e,function(){});l.configure(g.drm);return l.init(h,this.b.usePersistentLicense||!1)}.bind(a)).then(function(){W(this);
return Wg(h)}.bind(a)).then(function(){W(this);return nb(l)}.bind(a)).then(function(){W(this);return m.stop()}.bind(a)).then(function(){W(this);return{manifest:h,Rc:l}}.bind(a))["catch"](function(a){if(m)return m.stop().then(function(){throw a;});throw a;})}
V.prototype.B=function(a){for(var b=[],c=Xb(this.g.getConfiguration().preferredAudioLanguage),d=[0,Vb,Wb],e=a.filter(function(a){return"variant"==a.type}),d=d.map(function(a){return e.filter(function(b){b=Xb(b.language);return Ub(a,c,b)})}),f,g=0;g<d.length;g++)if(d[g].length){f=d[g];break}f||(d=e.filter(function(a){return a.primary}),d.length&&(f=d));f||(f=e,e.map(function(a){return a.language}).filter(Ea));var h=f.filter(function(a){return a.height&&480>=a.height});h.length&&(h.sort(function(a,
b){return b.height-a.height}),f=h.filter(function(a){return a.height==h[0].height}));f.sort(function(a,b){return a.bandwidth-b.bandwidth});f.length&&b.push(f[Math.floor(f.length/2)]);b.push.apply(b,a.filter(function(a){return"text"==a.type}));return b};function Rg(a){return{trackSelectionCallback:a.B.bind(a),progressCallback:function(a,c){if(a||c)return null},usePersistentLicense:!0}}function Tg(a){return a.a?a.a.a?Promise.resolve():a.a.init(ag):Promise.reject(new v(2,9,9E3))}V.prototype.m=function(a){a.forEach(this.w.bind(this))};
V.prototype.w=function(a){var b={};if(this.j){var c=this.j.filter(function(a){return"variant"==a.type}),d=null;c.length&&(d=fc(a,c[0]));d&&(d.video&&(b.video=d.video),d.audio&&(b.audio=d.audio))}ac(this.c,b,a);$b(a,this.g.getConfiguration().restrictions,{width:Infinity,height:Infinity})};function Vg(a){var b=a.c?a.c.o():Promise.resolve();a.c=null;a.f=null;a.s=!1;a.j=null;a.h=-1;return b}
function Wg(a){var b=a.periods.map(function(a){return a.variants}).reduce(z,[]).map(function(a){var b=[];a.audio&&b.push(a.audio);a.video&&b.push(a.video);return b}).reduce(z,[]).filter(Ea);a=a.periods.map(function(a){return a.textStreams}).reduce(z,[]);b.push.apply(b,a);return Promise.all(b.map(function(a){return a.createSegmentIndex()}))}
V.prototype.C=function(a){var b,c,d=cc(a,null,null),e=ec(a,null),d=this.b.trackSelectionCallback(d.concat(e));this.j||(this.j=d,this.m(this.f.periods));for(e=d.length-1;0<e;--e){var f=!1;for(c=e-1;0<=c;--c)if(d[e].type==d[c].type&&d[e].kind==d[c].kind&&d[e].language==d[c].language){f=!0;break}if(f)break}f=[];for(e=0;e<d.length;e++)(b=fc(a,d[e]))?(b.audio&&((c=f.filter(function(a){return a.id==b.audio.id})[0])?c.variantIds.push(b.id):(c=b.video?b.bandwidth/2:b.bandwidth,f.push(Xg(this,a,b.audio,c,
b.id)))),b.video&&((c=f.filter(function(a){return a.id==b.video.id})[0])?c.variantIds.push(b.id):(c=b.audio?b.bandwidth/2:b.bandwidth,f.push(Xg(this,a,b.video,c,b.id))))):f.push(Xg(this,a,gc(a,d[e]),0));return{startTime:a.startTime,streams:f}};
function Xg(a,b,c,d,e){var f=[],g=a.f.presentationTimeline.ia();var h=g;for(var l=c.findSegmentPosition(g),m=null!=l?c.getSegmentReference(l):null;m;)h=a.a.c.segment++,jg(a.i,c.type,m,(m.endTime-m.startTime)*d/8,{key:h,data:null,manifestKey:a.h,streamNumber:c.id,segmentNumber:h}),f.push({startTime:m.startTime,endTime:m.endTime,uri:"offline:"+a.h+"/"+c.id+"/"+h}),h=m.endTime+b.startTime,m=c.getSegmentReference(++l);a.l=Math.max(a.l,h-g);b=null;c.initSegmentReference&&(h=a.a.c.segment++,b="offline:"+
a.h+"/"+c.id+"/"+h,jg(a.i,c.contentType,c.initSegmentReference,0,{key:h,data:null,manifestKey:a.h,streamNumber:c.id,segmentNumber:-1}));a=[];null!=e&&a.push(e);return{id:c.id,primary:c.primary,presentationTimeOffset:c.presentationTimeOffset||0,contentType:c.type,mimeType:c.mimeType,codecs:c.codecs,frameRate:c.frameRate,kind:c.kind,language:c.language,label:c.label,width:c.width||null,height:c.height||null,initSegmentUri:b,encrypted:c.encrypted,keyId:c.keyId,segments:f,variantIds:a}}
function W(a){if(!a.g)throw new v(2,9,9002);}Ag.offline=Sg;n("shaka.polyfill.installAll",function(){for(var a=0;a<Yg.length;++a)Yg[a]()});var Yg=[];function Zg(a){Yg.push(a)}n("shaka.polyfill.register",Zg);function $g(a){var b=a.type.replace(/^(webkit|moz|MS)/,"").toLowerCase();if("function"===typeof Event)var c=new Event(b,a);else c=document.createEvent("Event"),c.initEvent(b,a.bubbles,a.cancelable);a.target.dispatchEvent(c)}
Zg(function(){if(window.Document){var a=Element.prototype;a.requestFullscreen=a.requestFullscreen||a.mozRequestFullScreen||a.msRequestFullscreen||a.webkitRequestFullscreen;a=Document.prototype;a.exitFullscreen=a.exitFullscreen||a.mozCancelFullScreen||a.msExitFullscreen||a.webkitExitFullscreen;"fullscreenElement"in document||(Object.defineProperty(document,"fullscreenElement",{get:function(){return document.mozFullScreenElement||document.msFullscreenElement||document.webkitFullscreenElement}}),Object.defineProperty(document,
"fullscreenEnabled",{get:function(){return document.mozFullScreenEnabled||document.msFullscreenEnabled||document.webkitFullscreenEnabled}}));document.addEventListener("webkitfullscreenchange",$g);document.addEventListener("webkitfullscreenerror",$g);document.addEventListener("mozfullscreenchange",$g);document.addEventListener("mozfullscreenerror",$g);document.addEventListener("MSFullscreenChange",$g);document.addEventListener("MSFullscreenError",$g)}});Zg(function(){var a=navigator.userAgent;a&&0<=a.indexOf("CrKey")&&delete window.indexedDB});var ah;function bh(a,b,c){if("input"==a)switch(this.type){case "range":a="change"}ah.call(this,a,b,c)}Zg(function(){0>navigator.userAgent.indexOf("Trident/")||HTMLInputElement.prototype.addEventListener==bh||(ah=HTMLInputElement.prototype.addEventListener,HTMLInputElement.prototype.addEventListener=bh)});Zg(function(){if(4503599627370497!=Math.round(4503599627370497)){var a=Math.round;Math.round=function(b){var c=b;4503599627370496>=b&&(c=a(b));return c}}});function ch(a){this.f=[];this.b=[];this.a=[];(new N).aa("pssh",this.c.bind(this)).parse(a.buffer)}ch.prototype.c=function(a){if(!(1<a.version)){var b=hb(a.u.Ja(16)),c=[];if(0<a.version)for(var d=a.u.F(),e=0;e<d;++e){var f=hb(a.u.Ja(16));c.push(f)}d=a.u.F();a.u.J(d);this.b.push.apply(this.b,c);this.f.push(b);this.a.push({start:a.start,end:a.start+a.size-1})}};function dh(a,b){try{var c=new eh(a,b);return Promise.resolve(c)}catch(d){return Promise.reject(d)}}
function eh(a,b){this.keySystem=a;for(var c=!1,d=0;d<b.length;++d){var e=b[d];var f={audioCapabilities:[],videoCapabilities:[],persistentState:"optional",distinctiveIdentifier:"optional",initDataTypes:e.initDataTypes,sessionTypes:["temporary"],label:e.label},g=!1;if(e.audioCapabilities)for(var h=0;h<e.audioCapabilities.length;++h){var l=e.audioCapabilities[h];if(l.contentType){g=!0;var m=l.contentType.split(";")[0];MSMediaKeys.isTypeSupported(this.keySystem,m)&&(f.audioCapabilities.push(l),c=!0)}}if(e.videoCapabilities)for(h=
0;h<e.videoCapabilities.length;++h)l=e.videoCapabilities[h],l.contentType&&(g=!0,m=l.contentType.split(";")[0],MSMediaKeys.isTypeSupported(this.keySystem,m)&&(f.videoCapabilities.push(l),c=!0));g||(c=MSMediaKeys.isTypeSupported(this.keySystem,"video/mp4"));"required"==e.persistentState&&(c=!1);if(c){this.a=f;return}}e=Error("Unsupported keySystem");e.name="NotSupportedError";e.code=DOMException.NOT_SUPPORTED_ERR;throw e;}eh.prototype.createMediaKeys=function(){var a=new fh(this.keySystem);return Promise.resolve(a)};
eh.prototype.getConfiguration=function(){return this.a};function gh(a){var b=this.mediaKeys;b&&b!=a&&hh(b,null);delete this.mediaKeys;return(this.mediaKeys=a)?hh(a,this):Promise.resolve()}function fh(a){this.a=new MSMediaKeys(a);this.b=new B}fh.prototype.createSession=function(a){if("temporary"!=(a||"temporary"))throw new TypeError("Session type "+a+" is unsupported on this platform.");return new ih(this.a)};fh.prototype.setServerCertificate=function(){return Promise.resolve(!1)};
function hh(a,b){function c(){b.msSetMediaKeys(d.a);b.removeEventListener("loadedmetadata",c)}Na(a.b);if(!b)return Promise.resolve();C(a.b,b,"msneedkey",jh);var d=a;try{return 1<=b.readyState?b.msSetMediaKeys(a.a):b.addEventListener("loadedmetadata",c),Promise.resolve()}catch(e){return Promise.reject(e)}}function ih(a){p.call(this);this.c=null;this.g=a;this.b=this.a=null;this.f=new B;this.sessionId="";this.expiration=NaN;this.closed=new y;this.keyStatuses=new kh}ba(ih);k=ih.prototype;
k.generateRequest=function(a,b){this.a=new y;try{this.c=this.g.createSession("video/mp4",new Uint8Array(b),null),C(this.f,this.c,"mskeymessage",this.yd.bind(this)),C(this.f,this.c,"mskeyadded",this.wd.bind(this)),C(this.f,this.c,"mskeyerror",this.xd.bind(this)),lh(this,"status-pending")}catch(c){this.a.reject(c)}return this.a};k.load=function(){return Promise.reject(Error("MediaKeySession.load not yet supported"))};k.update=function(a){this.b=new y;try{this.c.update(new Uint8Array(a))}catch(b){this.b.reject(b)}return this.b};
k.close=function(){try{this.c.close(),this.closed.resolve(),Na(this.f)}catch(a){this.closed.reject(a)}return this.closed};k.remove=function(){return Promise.reject(Error("MediaKeySession.remove is only applicable for persistent licenses, which are not supported on this platform"))};
function jh(a){var b=document.createEvent("CustomEvent");b.initCustomEvent("encrypted",!1,!1,null);b.initDataType="cenc";var c=a.initData;if(c){var d=new ch(c);if(1>=d.a.length)a=c;else{var e=[];for(a=0;a<d.a.length;a++)e.push(c.subarray(d.a[a].start,d.a[a].end+1));c=Ja(e,mh);for(a=d=0;a<c.length;a++)d+=c[a].length;d=new Uint8Array(d);for(a=e=0;a<c.length;a++)d.set(c[a],e),e+=c[a].length;a=d}}else a=c;b.initData=a;this.dispatchEvent(b)}function mh(a,b){return ib(a,b)}
k.yd=function(a){this.a&&(this.a.resolve(),this.a=null);this.dispatchEvent(new G("message",{messageType:void 0==this.keyStatuses.a?"licenserequest":"licenserenewal",message:a.message.buffer}))};k.wd=function(){this.a?(lh(this,"usable"),this.a.resolve(),this.a=null):this.b&&(lh(this,"usable"),this.b.resolve(),this.b=null)};
k.xd=function(){var a=Error("EME PatchedMediaKeysMs key error");a.errorCode=this.c.error;if(this.a)this.a.reject(a),this.a=null;else if(this.b)this.b.reject(a),this.b=null;else switch(this.c.error.code){case MSMediaKeyError.MS_MEDIA_KEYERR_OUTPUT:case MSMediaKeyError.MS_MEDIA_KEYERR_HARDWARECHANGE:lh(this,"output-not-allowed");default:lh(this,"internal-error")}};function lh(a,b){var c=a.keyStatuses;c.size=void 0==b?0:1;c.a=b;a.dispatchEvent(new G("keystatuseschange"))}
function kh(){this.size=0;this.a=void 0}var nh;k=kh.prototype;k.forEach=function(a){this.a&&a(this.a,nh)};k.get=function(a){if(this.has(a))return this.a};k.has=function(a){var b=nh;return this.a&&ib(new Uint8Array(a),new Uint8Array(b))?!0:!1};k.entries=function(){};k.keys=function(){};k.values=function(){};function oh(){return Promise.reject(Error("The key system specified is not supported."))}function ph(a){return a?Promise.reject(Error("MediaKeys not supported.")):Promise.resolve()}function qh(){throw new TypeError("Illegal constructor.");}qh.prototype.createSession=function(){};qh.prototype.setServerCertificate=function(){};function rh(){throw new TypeError("Illegal constructor.");}rh.prototype.getConfiguration=function(){};rh.prototype.createMediaKeys=function(){};var sh="";function th(a){sh=a;uh=(new Uint8Array([0])).buffer;navigator.requestMediaKeySystemAccess=vh;delete HTMLMediaElement.prototype.mediaKeys;HTMLMediaElement.prototype.mediaKeys=null;HTMLMediaElement.prototype.setMediaKeys=wh;window.MediaKeys=xh;window.MediaKeySystemAccess=yh}function zh(a){var b=sh;return b?b+a.charAt(0).toUpperCase()+a.slice(1):a}function vh(a,b){try{var c=new yh(a,b);return Promise.resolve(c)}catch(d){return Promise.reject(d)}}
function wh(a){var b=this.mediaKeys;b&&b!=a&&Ah(b,null);delete this.mediaKeys;(this.mediaKeys=a)&&Ah(a,this);return Promise.resolve()}
function yh(a,b){this.a=this.keySystem=a;var c=!1;"org.w3.clearkey"==a&&(this.a="webkit-org.w3.clearkey",c=!1);var d=!1;var e=document.getElementsByTagName("video");var f=e.length?e[0]:document.createElement("video");for(var g=0;g<b.length;++g){e=b[g];var h={audioCapabilities:[],videoCapabilities:[],persistentState:"optional",distinctiveIdentifier:"optional",initDataTypes:e.initDataTypes,sessionTypes:["temporary"],label:e.label},l=!1;if(e.audioCapabilities)for(var m=0;m<e.audioCapabilities.length;++m){var q=
e.audioCapabilities[m];if(q.contentType){var l=!0,w=q.contentType.split(";")[0];f.canPlayType(w,this.a)&&(h.audioCapabilities.push(q),d=!0)}}if(e.videoCapabilities)for(m=0;m<e.videoCapabilities.length;++m)q=e.videoCapabilities[m],q.contentType&&(l=!0,f.canPlayType(q.contentType,this.a)&&(h.videoCapabilities.push(q),d=!0));l||(d=f.canPlayType("video/mp4",this.a)||f.canPlayType("video/webm",this.a));"required"==e.persistentState&&(c?(h.persistentState="required",h.sessionTypes=["persistent-license"]):
d=!1);if(d){this.b=h;return}}c="Unsupported keySystem";if("org.w3.clearkey"==a||"com.widevine.alpha"==a)c="None of the requested configurations were supported.";c=Error(c);c.name="NotSupportedError";c.code=DOMException.NOT_SUPPORTED_ERR;throw c;}yh.prototype.createMediaKeys=function(){var a=new xh(this.a);return Promise.resolve(a)};yh.prototype.getConfiguration=function(){return this.b};function xh(a){this.g=a;this.b=null;this.a=new B;this.c=[];this.f={}}
function Ah(a,b){a.b=b;Na(a.a);var c=sh;b&&(C(a.a,b,c+"needkey",a.Ld.bind(a)),C(a.a,b,c+"keymessage",a.Kd.bind(a)),C(a.a,b,c+"keyadded",a.Id.bind(a)),C(a.a,b,c+"keyerror",a.Jd.bind(a)))}k=xh.prototype;k.createSession=function(a){var b=a||"temporary";if("temporary"!=b&&"persistent-license"!=b)throw new TypeError("Session type "+a+" is unsupported on this platform.");a=this.b||document.createElement("video");a.src||(a.src="about:blank");b=new Bh(a,this.g,b);this.c.push(b);return b};
k.setServerCertificate=function(){return Promise.resolve(!1)};k.Ld=function(a){var b=document.createEvent("CustomEvent");b.initCustomEvent("encrypted",!1,!1,null);b.initDataType="webm";b.initData=a.initData;this.b.dispatchEvent(b)};k.Kd=function(a){var b=Ch(this,a.sessionId);b&&(a=new G("message",{messageType:void 0==b.keyStatuses.a?"licenserequest":"licenserenewal",message:a.message}),b.b&&(b.b.resolve(),b.b=null),b.dispatchEvent(a))};
k.Id=function(a){if(a=Ch(this,a.sessionId))Dh(a,"usable"),a.a&&a.a.resolve(),a.a=null};
k.Jd=function(a){var b=Ch(this,a.sessionId);if(b){var c=Error("EME v0.1b key error");c.errorCode=a.errorCode;c.errorCode.systemCode=a.systemCode;!a.sessionId&&b.b?(c.method="generateRequest",45==a.systemCode&&(c.message="Unsupported session type."),b.b.reject(c),b.b=null):a.sessionId&&b.a?(c.method="update",b.a.reject(c),b.a=null):(c=a.systemCode,a.errorCode.code==MediaKeyError.MEDIA_KEYERR_OUTPUT?Dh(b,"output-restricted"):1==c?Dh(b,"expired"):Dh(b,"internal-error"))}};
function Ch(a,b){var c=a.f[b];return c?c:(c=a.c.shift())?(c.sessionId=b,a.f[b]=c):null}function Bh(a,b,c){p.call(this);this.f=a;this.h=!1;this.a=this.b=null;this.c=b;this.g=c;this.sessionId="";this.expiration=NaN;this.closed=new y;this.keyStatuses=new Eh}ba(Bh);
function Fh(a,b,c){if(a.h)return Promise.reject(Error("The session is already initialized."));a.h=!0;try{if("persistent-license"==a.g)if(c)var d=new Uint8Array(bb("LOAD_SESSION|"+c));else{var e=bb("PERSISTENT|"),f=new Uint8Array(e.byteLength+b.byteLength);f.set(new Uint8Array(e),0);f.set(new Uint8Array(b),e.byteLength);d=f}else d=new Uint8Array(b)}catch(h){return Promise.reject(h)}a.b=new y;var g=zh("generateKeyRequest");try{a.f[g](a.c,d)}catch(h){if("InvalidStateError"!=h.name)return a.b=null,Promise.reject(h);
setTimeout(function(){try{this.f[g](this.c,d)}catch(l){this.b.reject(l),this.b=null}}.bind(a),10)}return a.b}k=Bh.prototype;
k.Rb=function(a,b){if(this.a)this.a.then(this.Rb.bind(this,a,b))["catch"](this.Rb.bind(this,a,b));else{this.a=a;if("webkit-org.w3.clearkey"==this.c){var c=E(b);var d=JSON.parse(c);"oct"!=d.keys[0].kty&&(this.a.reject(Error("Response is not a valid JSON Web Key Set.")),this.a=null);c=fb(d.keys[0].k);d=fb(d.keys[0].kid)}else c=new Uint8Array(b),d=null;var e=zh("addKey");try{this.f[e](this.c,c,d,this.sessionId)}catch(f){this.a.reject(f),this.a=null}}};
function Dh(a,b){var c=a.keyStatuses;c.size=void 0==b?0:1;c.a=b;a.dispatchEvent(new G("keystatuseschange"))}k.generateRequest=function(a,b){return Fh(this,b,null)};k.load=function(a){return"persistent-license"==this.g?Fh(this,null,a):Promise.reject(Error("Not a persistent session."))};k.update=function(a){var b=new y;this.Rb(b,a);return b};
k.close=function(){if("persistent-license"!=this.g){if(!this.sessionId)return this.closed.reject(Error("The session is not callable.")),this.closed;var a=zh("cancelKeyRequest");try{this.f[a](this.c,this.sessionId)}catch(b){}}this.closed.resolve();return this.closed};k.remove=function(){return"persistent-license"!=this.g?Promise.reject(Error("Not a persistent session.")):this.close()};function Eh(){this.size=0;this.a=void 0}var uh;k=Eh.prototype;k.forEach=function(a){this.a&&a(this.a,uh)};k.get=function(a){if(this.has(a))return this.a};
k.has=function(a){var b=uh;return this.a&&ib(new Uint8Array(a),new Uint8Array(b))?!0:!1};k.entries=function(){};k.keys=function(){};k.values=function(){};Zg(function(){!window.HTMLVideoElement||navigator.requestMediaKeySystemAccess&&MediaKeySystemAccess.prototype.getConfiguration||(HTMLMediaElement.prototype.webkitGenerateKeyRequest?th("webkit"):HTMLMediaElement.prototype.generateKeyRequest?th(""):window.MSMediaKeys?(nh=(new Uint8Array([0])).buffer,delete HTMLMediaElement.prototype.mediaKeys,HTMLMediaElement.prototype.mediaKeys=null,HTMLMediaElement.prototype.setMediaKeys=gh,window.MediaKeys=fh,window.MediaKeySystemAccess=eh,navigator.requestMediaKeySystemAccess=
dh):(navigator.requestMediaKeySystemAccess=oh,delete HTMLMediaElement.prototype.mediaKeys,HTMLMediaElement.prototype.mediaKeys=null,HTMLMediaElement.prototype.setMediaKeys=ph,window.MediaKeys=qh,window.MediaKeySystemAccess=rh))});function Gh(){var a=MediaSource.prototype.addSourceBuffer;MediaSource.prototype.addSourceBuffer=function(){var b=a.apply(this,arguments);b.abort=function(){};return b}}
function Hh(){var a=MediaSource.prototype.endOfStream;MediaSource.prototype.endOfStream=function(){for(var b,c=0,f=0;f<this.sourceBuffers.length;++f)b=this.sourceBuffers[f],b=b.buffered.end(b.buffered.length-1),c=Math.max(c,b);if(!isNaN(this.duration)&&c<this.duration)for(this.dc=!0,f=0;f<this.sourceBuffers.length;++f)b=this.sourceBuffers[f],b.Zb=!1;return a.apply(this,arguments)};var b=!1,c=MediaSource.prototype.addSourceBuffer;MediaSource.prototype.addSourceBuffer=function(){var a=c.apply(this,
arguments);a.mediaSource_=this;a.addEventListener("updateend",Ih,!1);b||(this.addEventListener("sourceclose",Jh,!1),b=!0);return a}}function Ih(a){var b=a.target,c=b.mediaSource_;if(c.dc){a.preventDefault();a.stopPropagation();a.stopImmediatePropagation();b.Zb=!0;for(a=0;a<c.sourceBuffers.length;++a)if(0==c.sourceBuffers[a].Zb)return;c.dc=!1}}
function Jh(a){a=a.target;for(var b=0;b<a.sourceBuffers.length;++b)a.sourceBuffers[b].removeEventListener("updateend",Ih,!1);a.removeEventListener("sourceclose",Jh,!1)}
function Kh(){var a=MediaSource.isTypeSupported,b=/^dv(?:he|av)\./;MediaSource.isTypeSupported=function(c){for(var d,e,f=c.split(/ *; */),g=f[0],h={},l=1;l<f.length;++l)d=f[l].split("="),e=d[0],d=d[1].replace(/"(.*)"/,"$1"),h[e]=d;d=h.codecs;if(!d)return a(c);var m=!1,q=!1;c=d.split(",").filter(function(a){if(b.test(a))return q=!0,!1;/^(hev|hvc)1\.2/.test(a)&&(m=!0);return!0});q&&(m=!1);h.codecs=c.join(",");m&&(h.eotf="smpte2084");for(e in h)d=h[e],g+="; "+e+'="'+d+'"';return cast.__platform__.canDisplayType(g)}}
Zg(function(){if(window.MediaSource)if(window.cast&&cast.__platform__&&cast.__platform__.canDisplayType)Kh();else if(navigator.vendor&&0<=navigator.vendor.indexOf("Apple")){var a=navigator.appVersion;0<=a.indexOf("Version/8")?window.MediaSource=null:0<=a.indexOf("Version/9")?Gh():0<=a.indexOf("Version/10")&&(Gh(),Hh())}});function X(a){this.c=[];this.b=[];this.Aa=Lh;if(a)try{a(this.ka.bind(this),this.a.bind(this))}catch(b){this.a(b)}}var Lh=0;function Mh(a){var b=new X;b.ka(void 0);return b.then(function(){return a})}function Nh(a){var b=new X;b.a(a);return b}function Oh(a){function b(a,b,c){a.Aa==Lh&&(e[b]=c,d++,d==e.length&&a.ka(e))}var c=new X;if(!a.length)return c.ka([]),c;for(var d=0,e=Array(a.length),f=c.a.bind(c),g=0;g<a.length;++g)a[g]&&a[g].then?a[g].then(b.bind(null,c,g),f):b(c,g,a[g]);return c}
function Ph(a){for(var b=new X,c=b.ka.bind(b),d=b.a.bind(b),e=0;e<a.length;++e)a[e]&&a[e].then?a[e].then(c,d):c(a[e]);return b}X.prototype.then=function(a,b){var c=new X;switch(this.Aa){case 1:Qh(this,c,a);break;case 2:Qh(this,c,b);break;case Lh:this.c.push({N:c,vb:a}),this.b.push({N:c,vb:b})}return c};X.prototype["catch"]=function(a){return this.then(void 0,a)};
X.prototype.ka=function(a){if(this.Aa==Lh){this.rb=a;this.Aa=1;for(a=0;a<this.c.length;++a)Qh(this,this.c[a].N,this.c[a].vb);this.c=[];this.b=[]}};X.prototype.a=function(a){if(this.Aa==Lh){this.rb=a;this.Aa=2;for(a=0;a<this.b.length;++a)Qh(this,this.b[a].N,this.b[a].vb);this.c=[];this.b=[]}};
function Qh(a,b,c){Rh.push(function(){if(c&&"function"==typeof c){try{var a=c(this.rb)}catch(f){b.a(f);return}try{var e=a&&a.then}catch(f){b.a(f);return}a instanceof X?a==b?b.a(new TypeError("Chaining cycle detected")):a.then(b.ka.bind(b),b.a.bind(b)):e?Sh(a,e,b):b.ka(a)}else 1==this.Aa?b.ka(this.rb):b.a(this.rb)}.bind(a));null==Th&&(Th=Uh(Vh))}
function Sh(a,b,c){try{var d=!1;b.call(a,function(a){if(!d){d=!0;try{var b=a&&a.then}catch(g){c.a(g);return}b?Sh(a,b,c):c.ka(a)}},c.a.bind(c))}catch(e){c.a(e)}}function Vh(){for(;Rh.length;){null!=Th&&(Wh(Th),Th=null);var a=Rh;Rh=[];for(var b=0;b<a.length;++b)a[b]()}}function Uh(){return 0}function Wh(){}var Th=null,Rh=[];
Zg(function(a){window.setImmediate?(Uh=function(a){return window.setImmediate(a)},Wh=function(a){return window.clearImmediate(a)}):(Uh=function(a){return window.setTimeout(a,0)},Wh=function(a){return window.clearTimeout(a)});if(!window.Promise||a)window.Promise=X,window.Promise.resolve=Mh,window.Promise.reject=Nh,window.Promise.all=Oh,window.Promise.race=Ph,window.Promise.prototype.then=X.prototype.then,window.Promise.prototype["catch"]=X.prototype["catch"]});Zg(function(){if(window.HTMLMediaElement){var a=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){var b=a.apply(this,arguments);b&&b["catch"](function(){});return b}}});function Xh(){return{droppedVideoFrames:this.webkitDroppedFrameCount,totalVideoFrames:this.webkitDecodedFrameCount,corruptedVideoFrames:0,creationTime:NaN,totalFrameDelay:0}}Zg(function(){if(window.HTMLVideoElement){var a=HTMLVideoElement.prototype;!a.getVideoPlaybackQuality&&"webkitDroppedFrameCount"in a&&(a.getVideoPlaybackQuality=Xh)}});function Yh(a,b,c){return new window.TextTrackCue(a,b,c)}function Zh(a,b,c){return new window.TextTrackCue(a+"-"+b+"-"+c,a,b,c)}Zg(function(){if(!window.VTTCue&&window.TextTrackCue){var a=TextTrackCue.length;if(3==a)window.VTTCue=Yh;else if(6==a)window.VTTCue=Zh;else{try{var b=!!Yh(1,2,"")}catch(c){b=!1}b&&(window.VTTCue=Yh)}}});function Y(a,b,c){this.startTime=a;this.endTime=b;this.l=c;this.position=null;this.i=$h;this.size=100;this.f=ai;this.b=bi;this.g=ci;this.c=null;this.I="";this.h=di;this.j=ei;this.B=this.m=this.s="";this.D=fi;this.C=gi;this.w="";this.a=[];this.O=!0;this.id=""}n("shaka.text.Cue",Y);var $h="auto";Y.positionAlign={LEFT:"line-left",RIGHT:"line-right",CENTER:"center",AUTO:$h};var ai="center",hi={LEFT:"left",RIGHT:"right",CENTER:ai,START:"start",END:"end"};Y.textAlign=hi;
var ei="before",ii={BEFORE:ei,CENTER:"center",AFTER:"after"};Y.displayAlign=ii;var bi=0,rg=2,sg=3;Y.writingDirection={Me:bi,Ne:1,Ve:rg,We:sg};var ci=0,tg=1;Y.lineInterpretation={Oe:ci,Te:tg};var di="center",ji={CENTER:di,START:"start",END:"end"};Y.lineAlign=ji;var fi=400;Y.fontWeight={Re:fi,Ke:700};var gi="normal",ki={NORMAL:gi,ITALIC:"italic",OBLIQUE:"oblique"};Y.fontStyle=ki;Y.textDecoration={Ue:"underline",Pe:"lineThrough",Se:"overline"};function li(){}li.prototype.parseInit=function(){};
li.prototype.parseMedia=function(a,b){var c=E(a),d=[],e=new DOMParser,f=null;try{f=e.parseFromString(c,"text/xml")}catch(Lc){throw new v(2,2,2005);}if(f){var g=f.getElementsByTagName("tt")[0];if(g){e=g.getAttribute("ttp:frameRate");f=g.getAttribute("ttp:subFrameRate");var h=g.getAttribute("ttp:frameRateMultiplier");var l=g.getAttribute("ttp:tickRate");c=g.getAttribute("xml:space")||"default"}else throw new v(2,2,2005);if("default"!=c&&"preserve"!=c)throw new v(2,2,2005);c="default"==c;e=new mi(e,
f,h,l);f=ni(g.getElementsByTagName("styling")[0]);h=ni(g.getElementsByTagName("layout")[0]);g=ni(g.getElementsByTagName("body")[0]);for(l=0;l<g.length;l++){var m=g[l];var q=b.periodStart;var w=e,x=f,r=h,u=c;if(m.hasAttribute("begin")||m.hasAttribute("end")||!/^\s*$/.test(m.textContent)){oi(m,u);var u=pi(m.getAttribute("begin"),w),t=pi(m.getAttribute("end"),w),w=pi(m.getAttribute("dur"),w),Fa=m.textContent;null==t&&null!=w&&(t=u+w);if(null==u||null==t)throw new v(2,2,2001);q=new Y(u+q,t+q,Fa);u=qi(m,
"region",r);r=q;if(t=Z(m,u,x,"tts:extent"))if(t=ri.exec(t))r.size=Number(t[1]);"rtl"==Z(m,u,x,"tts:direction")&&(r.b=1);t=Z(m,u,x,"tts:writingMode");"tb"==t||"tblr"==t?r.b=rg:"tbrl"==t?r.b=sg:"rltb"==t||"rl"==t?r.b=1:t&&(r.b=bi);if(t=Z(m,u,x,"tts:origin"))if(t=ri.exec(t))r.b==bi||1==r.b?(r.position=Number(t[1]),r.c=Number(t[2])):(r.position=Number(t[2]),r.c=Number(t[1])),r.g=tg;if(t=Z(m,u,x,"tts:textAlign"))r.i=si[t],r.h=ti[t],r.f=hi[t.toUpperCase()];if(t=Z(m,u,x,"tts:displayAlign"))r.j=ii[t.toUpperCase()];
if(t=Z(m,u,x,"tts:color"))r.s=t;if(t=Z(m,u,x,"tts:backgroundColor"))r.m=t;if(t=Z(m,u,x,"tts:fontFamily"))r.w=t;(t=Z(m,u,x,"tts:fontWeight"))&&"bold"==t&&(r.D=700);(t=Z(m,u,x,"tts:wrapOption"))&&"noWrap"==t&&(r.O=!1);(t=Z(m,u,x,"tts:lineHeight"))&&t.match(ui)&&(r.I=t);(t=Z(m,u,x,"tts:fontSize"))&&t.match(ui)&&(r.B=t);if(t=Z(m,u,x,"tts:fontStyle"))r.C=ki[t.toUpperCase()];(u=vi(u,x,"tts:textDecoration"))&&wi(r,u);(m=xi(m,x,"tts:textDecoration"))&&wi(r,m)}else q=null;q&&d.push(q)}}return d};
var yi=/^(\d{2,}):(\d{2}):(\d{2}):(\d{2})\.?(\d+)?$/,zi=/^(?:(\d{2,}):)?(\d{2}):(\d{2})$/,Ai=/^(?:(\d{2,}):)?(\d{2}):(\d{2}\.\d{2,})$/,Bi=/^(\d*\.?\d*)f$/,Ci=/^(\d*\.?\d*)t$/,Di=/^(?:(\d*\.?\d*)h)?(?:(\d*\.?\d*)m)?(?:(\d*\.?\d*)s)?(?:(\d*\.?\d*)ms)?$/,ri=/^(\d{1,2}|100)% (\d{1,2}|100)%$/,ui=/^(\d+px|\d+em)$/,ti={left:"start",center:"center",right:"end",start:"start",end:"end"},si={left:"line-left",center:"center",right:"line-right"};
function ni(a){var b=[];if(!a)return b;for(var c=a.childNodes,d=0;d<c.length;d++){var e="span"==c[d].nodeName&&"p"==a.nodeName;c[d].nodeType!=Node.ELEMENT_NODE||"br"==c[d].nodeName||e||(e=ni(c[d]),b=b.concat(e))}b.length||b.push(a);return b}function oi(a,b){for(var c=a.childNodes,d=0;d<c.length;d++)if("br"==c[d].nodeName&&0<d)c[d-1].textContent+="\n";else if(0<c[d].childNodes.length)oi(c[d],b);else if(b){var e=c[d].textContent.trim(),e=e.replace(/\s+/g," ");c[d].textContent=e}}
function wi(a,b){for(var c=b.split(" "),d=0;d<c.length;d++)switch(c[d]){case "underline":0>a.a.indexOf("underline")&&a.a.push("underline");break;case "noUnderline":0<=a.a.indexOf("underline")&&La(a.a,"underline");break;case "lineThrough":0>a.a.indexOf("lineThrough")&&a.a.push("lineThrough");break;case "noLineThrough":0<=a.a.indexOf("lineThrough")&&La(a.a,"lineThrough");break;case "overline":0>a.a.indexOf("overline")&&a.a.push("overline");break;case "noOverline":0<=a.a.indexOf("overline")&&La(a.a,
"overline")}}function Z(a,b,c,d){return(a=xi(a,c,d))?a:vi(b,c,d)}function vi(a,b,c){for(var d=ni(a),e=0;e<d.length;e++){var f=d[e].getAttribute(c);if(f)return f}return(a=qi(a,"style",b))?a.getAttribute(c):null}function xi(a,b,c){return(a=qi(a,"style",b))?a.getAttribute(c):null}
function qi(a,b,c){if(!a||1>c.length)return null;var d=null,e=a;for(a=null;e&&!(a=e.getAttribute(b))&&(e=e.parentNode,e instanceof Element););if(b=a)for(a=0;a<c.length;a++)if(c[a].getAttribute("xml:id")==b){d=c[a];break}return d}
function pi(a,b){var c=null;if(yi.test(a))var c=yi.exec(a),d=Number(c[1]),e=Number(c[2]),f=Number(c[3]),g=Number(c[4]),g=g+(Number(c[5])||0)/b.b,f=f+g/b.frameRate,c=f+60*e+3600*d;else zi.test(a)?c=Ei(zi,a):Ai.test(a)?c=Ei(Ai,a):Bi.test(a)?(c=Bi.exec(a),c=Number(c[1])/b.frameRate):Ci.test(a)?(c=Ci.exec(a),c=Number(c[1])/b.a):Di.test(a)&&(c=Ei(Di,a));return c}
function Ei(a,b){var c=a.exec(b);return c&&""!=c[0]?(Number(c[4])||0)/1E3+(Number(c[3])||0)+60*(Number(c[2])||0)+3600*(Number(c[1])||0):null}function mi(a,b,c,d){this.frameRate=Number(a)||30;this.b=Number(b)||1;this.a=Number(d);this.a||(this.a=a?this.frameRate*this.b:1);c&&(a=/^(\d+) (\d+)$/g.exec(c))&&(this.frameRate*=a[1]/a[2])}Gb("application/ttml+xml",li);function Fi(){this.a=new li}Fi.prototype.parseInit=function(a){var b=!1;(new N).G("moov",O).G("trak",O).G("mdia",O).G("minf",O).G("stbl",O).aa("stsd",rd).G("stpp",function(){b=!0}).parse(a);if(!b)throw new v(2,2,2007);};Fi.prototype.parseMedia=function(a,b){var c=!1,d=[];(new N).G("mdat",sd(function(a){c=!0;d=this.a.parseMedia(a.buffer,b)}.bind(this))).parse(a);if(!c)throw new v(2,2,2007);return d};Gb('application/mp4; codecs="stpp"',Fi);Gb('application/mp4; codecs="stpp.TTML.im1t"',Fi);function Gi(){}Gi.prototype.parseInit=function(){};
Gi.prototype.parseMedia=function(a,b){var c=E(a),c=c.replace(/\r\n|\r(?=[^\n]|$)/gm,"\n"),c=c.split(/\n{2,}/m);if(!/^WEBVTT($|[ \t\n])/m.test(c[0]))throw new v(2,2,2E3);var d=b.segmentStart;if(0<=c[0].indexOf("X-TIMESTAMP-MAP")){var e=c[0].match(/LOCAL:((?:(\d{1,}):)?(\d{2}):(\d{2})\.(\d{3}))/m),f=c[0].match(/MPEGTS:(\d+)/m);e&&f&&(d=Hi(new se(e[1])),d=b.periodStart+(Number(f[1])/9E4-d))}f=[];for(e=1;e<c.length;e++){var g=c[e].split("\n"),h=d;if(1==g.length&&!g[0]||/^NOTE($|[ \t])/.test(g[0]))var l=
null;else{l=null;0>g[0].indexOf("--\x3e")&&(l=g[0],g.splice(0,1));var m=new se(g[0]),q=Hi(m),w=te(m,/[ \t]+--\x3e[ \t]+/g),x=Hi(m);if(null==q||!w||null==x)throw new v(2,2,2001);g=new Y(q+h,x+h,g.slice(1).join("\n").trim());te(m,/[ \t]+/gm);for(h=ue(m);h;)Ii(g,h),te(m,/[ \t]+/gm),h=ue(m);null!=l&&(g.id=l);l=g}l&&f.push(l)}return f};
function Ii(a,b){var c;if(c=/^align:(start|middle|center|end|left|right)$/.exec(b))c=c[1],"middle"==c?a.f=ai:a.f=hi[c.toUpperCase()];else if(c=/^vertical:(lr|rl)$/.exec(b))a.b="lr"==c[1]?rg:sg;else if(c=/^size:([\d\.]+)%$/.exec(b))a.size=Number(c[1]);else if(c=/^position:([\d\.]+)%(?:,(line-left|line-right|center|start|end))?$/.exec(b))a.position=Number(c[1]),c[2]&&(c=c[2],a.i="line-left"==c||"start"==c?"line-left":"line-right"==c||"end"==c?"line-right":"center");else if(c=/^line:([\d\.]+)%(?:,(start|end|center))?$/.exec(b))a.g=
tg,a.c=Number(c[1]),c[2]&&(a.h=ji[c[2].toUpperCase()]);else if(c=/^line:(-?\d+)(?:,(start|end|center))?$/.exec(b))a.g=ci,a.c=Number(c[1]),c[2]&&(a.h=ji[c[2].toUpperCase()])}function Hi(a){a=te(a,/(?:(\d{1,}):)?(\d{2}):(\d{2})\.(\d{3})/g);if(!a)return null;var b=Number(a[2]),c=Number(a[3]);return 59<b||59<c?null:Number(a[4])/1E3+c+60*b+3600*(Number(a[1])||0)}Gb("text/vtt",Gi);Gb('text/vtt; codecs="vtt"',Gi);function Ji(){this.a=null}Ji.prototype.parseInit=function(a){var b=!1;(new N).G("moov",O).G("trak",O).G("mdia",O).aa("mdhd",function(a){0==a.version?(a.u.J(4),a.u.J(4),this.a=a.u.F(),a.u.J(4)):(a.u.J(8),a.u.J(8),this.a=a.u.F(),a.u.J(8));a.u.J(4)}.bind(this)).G("minf",O).G("stbl",O).aa("stsd",rd).G("wvtt",function(){b=!0}).parse(a);if(!this.a)throw new v(2,2,2008);if(!b)throw new v(2,2,2008);};
Ji.prototype.parseMedia=function(a,b){var c=0,d=[],e=[],f=[],g=!1,h=!1,l=!1,m=null;(new N).G("moof",O).G("traf",O).aa("tfdt",function(a){g=!0;c=a.version?a.u.Ta():a.u.F()}).aa("tfhd",function(a){var b=a.ac;a=a.u;a.J(4);b&1&&a.J(8);b&2&&a.J(4);m=b&8?a.F():null}).aa("trun",function(a){h=!0;var b=a.version,c=a.ac;a=a.u;var e=a.F();c&1&&a.J(4);c&4&&a.J(4);for(var f=[],g=0;g<e;g++){var l={duration:null,Sb:null};c&256&&(l.duration=a.F());c&512&&a.J(4);c&1024&&a.J(4);c&2048&&(l.Sb=b?a.sc():a.F());f.push(l)}d=
f}).G("vtte",function(){e.push(null)}).G("vttc",sd(function(a){e.push(a.buffer)})).G("mdat",function(a){l=!0;O(a)}).parse(a);if(!l&&!g&&!h)throw new v(2,2,2008);for(var q=c,w=0;w<d.length;w++){var x=d[w],r=e[w],u=x.duration||m;u&&(x=x.Sb?c+x.Sb:q,q=x+u,r&&f.push(Ki(r,b.periodStart+x/this.a,b.periodStart+q/this.a)))}return f.filter(Da)};
function Ki(a,b,c){var d,e,f;(new N).G("payl",sd(function(a){d=E(a)})).G("iden",sd(function(a){e=E(a)})).G("sttg",sd(function(a){f=E(a)})).parse(a);return d?Li(d,e,f,b,c):null}function Li(a,b,c,d,e){a=new Y(d,e,a);b&&(a.id=b);if(c)for(b=new se(c),c=ue(b);c;)Ii(a,c),te(b,/[ \t]+/gm),c=ue(b);return a}Gb('application/mp4; codecs="wvtt"',Ji);}.call(g,this));
if (typeof(module)!="undefined"&&module.exports)module.exports=g.shaka;
else if (typeof(define)!="undefined" && define.amd)define(function(){return g.shaka});
else this.shaka=g.shaka;
})();


},{}],6:[function(_dereq_,module,exports){
// stats.js - http://github.com/mrdoob/stats.js
var Stats=function(){var l=Date.now(),m=l,g=0,n=Infinity,o=0,h=0,p=Infinity,q=0,r=0,s=0,f=document.createElement("div");f.id="stats";f.addEventListener("mousedown",function(b){b.preventDefault();t(++s%2)},!1);f.style.cssText="width:80px;opacity:0.9;cursor:pointer";var a=document.createElement("div");a.id="fps";a.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#002";f.appendChild(a);var i=document.createElement("div");i.id="fpsText";i.style.cssText="color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
i.innerHTML="FPS";a.appendChild(i);var c=document.createElement("div");c.id="fpsGraph";c.style.cssText="position:relative;width:74px;height:30px;background-color:#0ff";for(a.appendChild(c);74>c.children.length;){var j=document.createElement("span");j.style.cssText="width:1px;height:30px;float:left;background-color:#113";c.appendChild(j)}var d=document.createElement("div");d.id="ms";d.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";f.appendChild(d);var k=document.createElement("div");
k.id="msText";k.style.cssText="color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";k.innerHTML="MS";d.appendChild(k);var e=document.createElement("div");e.id="msGraph";e.style.cssText="position:relative;width:74px;height:30px;background-color:#0f0";for(d.appendChild(e);74>e.children.length;)j=document.createElement("span"),j.style.cssText="width:1px;height:30px;float:left;background-color:#131",e.appendChild(j);var t=function(b){s=b;switch(s){case 0:a.style.display=
"block";d.style.display="none";break;case 1:a.style.display="none",d.style.display="block"}};return{REVISION:12,domElement:f,setMode:t,begin:function(){l=Date.now()},end:function(){var b=Date.now();g=b-l;n=Math.min(n,g);o=Math.max(o,g);k.textContent=g+" MS ("+n+"-"+o+")";var a=Math.min(30,30-30*(g/200));e.appendChild(e.firstChild).style.height=a+"px";r++;b>m+1E3&&(h=Math.round(1E3*r/(b-m)),p=Math.min(p,h),q=Math.max(q,h),i.textContent=h+" FPS ("+p+"-"+q+")",a=Math.min(30,30-30*(h/100)),c.appendChild(c.firstChild).style.height=
a+"px",m=b,r=0);return b},update:function(){l=this.end()}}};"object"===typeof module&&(module.exports=Stats);

},{}],7:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.WebVRManager = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Emitter = _dereq_('./emitter.js');
var Modes = _dereq_('./modes.js');
var Util = _dereq_('./util.js');

/**
 * Everything having to do with the WebVR button.
 * Emits a 'click' event when it's clicked.
 */
function ButtonManager(opt_root) {
  var root = opt_root || document.body;
  this.loadIcons_();

  // Make the fullscreen button.
  var fsButton = this.createButton();
  fsButton.src = this.ICONS.fullscreen;
  fsButton.title = 'Fullscreen mode';
  var s = fsButton.style;
  s.bottom = 0;
  s.right = 0;
  fsButton.addEventListener('click', this.createClickHandler_('fs'));
  root.appendChild(fsButton);
  this.fsButton = fsButton;

  // Make the VR button.
  var vrButton = this.createButton();
  vrButton.src = this.ICONS.cardboard;
  vrButton.title = 'Virtual reality mode';
  var s = vrButton.style;
  s.bottom = 0;
  s.right = '48px';
  vrButton.addEventListener('click', this.createClickHandler_('vr'));
  root.appendChild(vrButton);
  this.vrButton = vrButton;

  this.isVisible = true;

}
ButtonManager.prototype = new Emitter();

ButtonManager.prototype.createButton = function() {
  var button = document.createElement('img');
  button.className = 'webvr-button';
  var s = button.style;
  s.position = 'absolute';
  s.width = '24px'
  s.height = '24px';
  s.backgroundSize = 'cover';
  s.backgroundColor = 'transparent';
  s.border = 0;
  s.userSelect = 'none';
  s.webkitUserSelect = 'none';
  s.MozUserSelect = 'none';
  s.cursor = 'pointer';
  s.padding = '12px';
  s.zIndex = 1;
  s.display = 'none';
  s.boxSizing = 'content-box';

  // Prevent button from being selected and dragged.
  button.draggable = false;
  button.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });

  // Style it on hover.
  button.addEventListener('mouseenter', function(e) {
    s.filter = s.webkitFilter = 'drop-shadow(0 0 5px rgba(255,255,255,1))';
  });
  button.addEventListener('mouseleave', function(e) {
    s.filter = s.webkitFilter = '';
  });
  return button;
};

ButtonManager.prototype.setMode = function(mode, isVRCompatible) {
  isVRCompatible = isVRCompatible || WebVRConfig.FORCE_ENABLE_VR;
  if (!this.isVisible) {
    return;
  }
  switch (mode) {
    case Modes.NORMAL:
      this.fsButton.style.display = 'block';
      this.fsButton.src = this.ICONS.fullscreen;
      this.vrButton.style.display = (isVRCompatible ? 'block' : 'none');
      break;
    case Modes.MAGIC_WINDOW:
      this.fsButton.style.display = 'block';
      this.fsButton.src = this.ICONS.exitFullscreen;
      this.vrButton.style.display = 'none';
      break;
    case Modes.VR:
      this.fsButton.style.display = 'none';
      this.vrButton.style.display = 'none';
      break;
  }

  // Hack for Safari Mac/iOS to force relayout (svg-specific issue)
  // http://goo.gl/hjgR6r
  var oldValue = this.fsButton.style.display;
  this.fsButton.style.display = 'inline-block';
  this.fsButton.offsetHeight;
  this.fsButton.style.display = oldValue;
};

ButtonManager.prototype.setVisibility = function(isVisible) {
  this.isVisible = isVisible;
  this.fsButton.style.display = isVisible ? 'block' : 'none';
  this.vrButton.style.display = isVisible ? 'block' : 'none';
};

ButtonManager.prototype.createClickHandler_ = function(eventName) {
  return function(e) {
    e.stopPropagation();
    e.preventDefault();
    this.emit(eventName);
  }.bind(this);
};

ButtonManager.prototype.loadIcons_ = function() {
  // Preload some hard-coded SVG.
  this.ICONS = {};
  this.ICONS.cardboard = Util.base64('image/svg+xml', 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRkZGRiI+CiAgICA8cGF0aCBkPSJNMjAuNzQgNkgzLjIxQzIuNTUgNiAyIDYuNTcgMiA3LjI4djEwLjQ0YzAgLjcuNTUgMS4yOCAxLjIzIDEuMjhoNC43OWMuNTIgMCAuOTYtLjMzIDEuMTQtLjc5bDEuNC0zLjQ4Yy4yMy0uNTkuNzktMS4wMSAxLjQ0LTEuMDFzMS4yMS40MiAxLjQ1IDEuMDFsMS4zOSAzLjQ4Yy4xOS40Ni42My43OSAxLjExLjc5aDQuNzljLjcxIDAgMS4yNi0uNTcgMS4yNi0xLjI4VjcuMjhjMC0uNy0uNTUtMS4yOC0xLjI2LTEuMjh6TTcuNSAxNC42MmMtMS4xNyAwLTIuMTMtLjk1LTIuMTMtMi4xMiAwLTEuMTcuOTYtMi4xMyAyLjEzLTIuMTMgMS4xOCAwIDIuMTIuOTYgMi4xMiAyLjEzcy0uOTUgMi4xMi0yLjEyIDIuMTJ6bTkgMGMtMS4xNyAwLTIuMTMtLjk1LTIuMTMtMi4xMiAwLTEuMTcuOTYtMi4xMyAyLjEzLTIuMTNzMi4xMi45NiAyLjEyIDIuMTMtLjk1IDIuMTItMi4xMiAyLjEyeiIvPgogICAgPHBhdGggZmlsbD0ibm9uZSIgZD0iTTAgMGgyNHYyNEgwVjB6Ii8+Cjwvc3ZnPgo=');
  this.ICONS.fullscreen = Util.base64('image/svg+xml', 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRkZGRiI+CiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+CiAgICA8cGF0aCBkPSJNNyAxNEg1djVoNXYtMkg3di0zem0tMi00aDJWN2gzVjVINXY1em0xMiA3aC0zdjJoNXYtNWgtMnYzek0xNCA1djJoM3YzaDJWNWgtNXoiLz4KPC9zdmc+Cg==');
  this.ICONS.exitFullscreen = Util.base64('image/svg+xml', 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRkZGRiI+CiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+CiAgICA8cGF0aCBkPSJNNSAxNmgzdjNoMnYtNUg1djJ6bTMtOEg1djJoNVY1SDh2M3ptNiAxMWgydi0zaDN2LTJoLTV2NXptMi0xMVY1aC0ydjVoNVY4aC0zeiIvPgo8L3N2Zz4K');
  this.ICONS.settings = Util.base64('image/svg+xml', 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRkZGRiI+CiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+CiAgICA8cGF0aCBkPSJNMTkuNDMgMTIuOThjLjA0LS4zMi4wNy0uNjQuMDctLjk4cy0uMDMtLjY2LS4wNy0uOThsMi4xMS0xLjY1Yy4xOS0uMTUuMjQtLjQyLjEyLS42NGwtMi0zLjQ2Yy0uMTItLjIyLS4zOS0uMy0uNjEtLjIybC0yLjQ5IDFjLS41Mi0uNC0xLjA4LS43My0xLjY5LS45OGwtLjM4LTIuNjVDMTQuNDYgMi4xOCAxNC4yNSAyIDE0IDJoLTRjLS4yNSAwLS40Ni4xOC0uNDkuNDJsLS4zOCAyLjY1Yy0uNjEuMjUtMS4xNy41OS0xLjY5Ljk4bC0yLjQ5LTFjLS4yMy0uMDktLjQ5IDAtLjYxLjIybC0yIDMuNDZjLS4xMy4yMi0uMDcuNDkuMTIuNjRsMi4xMSAxLjY1Yy0uMDQuMzItLjA3LjY1LS4wNy45OHMuMDMuNjYuMDcuOThsLTIuMTEgMS42NWMtLjE5LjE1LS4yNC40Mi0uMTIuNjRsMiAzLjQ2Yy4xMi4yMi4zOS4zLjYxLjIybDIuNDktMWMuNTIuNCAxLjA4LjczIDEuNjkuOThsLjM4IDIuNjVjLjAzLjI0LjI0LjQyLjQ5LjQyaDRjLjI1IDAgLjQ2LS4xOC40OS0uNDJsLjM4LTIuNjVjLjYxLS4yNSAxLjE3LS41OSAxLjY5LS45OGwyLjQ5IDFjLjIzLjA5LjQ5IDAgLjYxLS4yMmwyLTMuNDZjLjEyLS4yMi4wNy0uNDktLjEyLS42NGwtMi4xMS0xLjY1ek0xMiAxNS41Yy0xLjkzIDAtMy41LTEuNTctMy41LTMuNXMxLjU3LTMuNSAzLjUtMy41IDMuNSAxLjU3IDMuNSAzLjUtMS41NyAzLjUtMy41IDMuNXoiLz4KPC9zdmc+Cg==');
};

module.exports = ButtonManager;

},{"./emitter.js":2,"./modes.js":3,"./util.js":4}],2:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function Emitter() {
  this.callbacks = {};
}

Emitter.prototype.emit = function(eventName) {
  var callbacks = this.callbacks[eventName];
  if (!callbacks) {
    //console.log('No valid callback specified.');
    return;
  }
  var args = [].slice.call(arguments);
  // Eliminate the first param (the callback).
  args.shift();
  for (var i = 0; i < callbacks.length; i++) {
    callbacks[i].apply(this, args);
  }
};

Emitter.prototype.on = function(eventName, callback) {
  if (eventName in this.callbacks) {
    this.callbacks[eventName].push(callback);
  } else {
    this.callbacks[eventName] = [callback];
  }
};

module.exports = Emitter;

},{}],3:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Modes = {
  UNKNOWN: 0,
  // Not fullscreen, just tracking.
  NORMAL: 1,
  // Magic window immersive mode.
  MAGIC_WINDOW: 2,
  // Full screen split screen VR mode.
  VR: 3,
};

module.exports = Modes;

},{}],4:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Util = {};

Util.base64 = function(mimeType, base64) {
  return 'data:' + mimeType + ';base64,' + base64;
};

Util.isMobile = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

Util.isFirefox = function() {
  return /firefox/i.test(navigator.userAgent);
};

Util.isIOS = function() {
  return /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
};

Util.isIFrame = function() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

Util.appendQueryParameter = function(url, key, value) {
  // Determine delimiter based on if the URL already GET parameters in it.
  var delimiter = (url.indexOf('?') < 0 ? '?' : '&');
  url += delimiter + key + '=' + value;
  return url;
};

// From http://goo.gl/4WX3tg
Util.getQueryParameter = function(name) {
  var name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

Util.isLandscapeMode = function() {
  return (window.orientation == 90 || window.orientation == -90);
};

Util.getScreenWidth = function() {
  return Math.max(window.screen.width, window.screen.height) *
      window.devicePixelRatio;
};

Util.getScreenHeight = function() {
  return Math.min(window.screen.width, window.screen.height) *
      window.devicePixelRatio;
};

module.exports = Util;

},{}],5:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var ButtonManager = _dereq_('./button-manager.js');
var Emitter = _dereq_('./emitter.js');
var Modes = _dereq_('./modes.js');
var Util = _dereq_('./util.js');

/**
 * Helper for getting in and out of VR mode.
 */
function WebVRManager(renderer, effect, params) {
  this.params = params || {};

  this.mode = Modes.UNKNOWN;

  // Set option to hide the button.
  this.hideButton = this.params.hideButton || false;
  // Whether or not the FOV should be distorted or un-distorted. By default, it
  // should be distorted, but in the case of vertex shader based distortion,
  // ensure that we use undistorted parameters.
  this.predistorted = !!this.params.predistorted;

  // Save the THREE.js renderer and effect for later.
  this.renderer = renderer;
  this.effect = effect;
  var polyfillWrapper = document.querySelector('.webvr-polyfill-fullscreen-wrapper');
  this.button = new ButtonManager(polyfillWrapper);

  this.isFullscreenDisabled = !!Util.getQueryParameter('no_fullscreen');
  this.startMode = Modes.NORMAL;
  var startModeParam = parseInt(Util.getQueryParameter('start_mode'));
  if (!isNaN(startModeParam)) {
    this.startMode = startModeParam;
  }

  if (this.hideButton) {
    this.button.setVisibility(false);
  }

  // Check if the browser is compatible with WebVR.
  this.getDeviceByType_(VRDisplay).then(function(hmd) {
    this.hmd = hmd;

    // Only enable VR mode if there's a VR device attached or we are running the
    // polyfill on mobile.
    if (!this.isVRCompatibleOverride) {
      this.isVRCompatible =  !hmd.isPolyfilled || Util.isMobile();
    }

    switch (this.startMode) {
      case Modes.MAGIC_WINDOW:
        this.setMode_(Modes.MAGIC_WINDOW);
        break;
      case Modes.VR:
        this.enterVRMode_();
        this.setMode_(Modes.VR);
        break;
      default:
        this.setMode_(Modes.NORMAL);
    }

    this.emit('initialized');
  }.bind(this));

  // Hook up button listeners.
  this.button.on('fs', this.onFSClick_.bind(this));
  this.button.on('vr', this.onVRClick_.bind(this));

  // Bind to fullscreen events.
  document.addEventListener('webkitfullscreenchange',
      this.onFullscreenChange_.bind(this));
  document.addEventListener('mozfullscreenchange',
      this.onFullscreenChange_.bind(this));
  document.addEventListener('msfullscreenchange',
      this.onFullscreenChange_.bind(this));

  // Bind to VR* specific events.
  window.addEventListener('vrdisplaypresentchange',
      this.onVRDisplayPresentChange_.bind(this));
  window.addEventListener('vrdisplaydeviceparamschange',
      this.onVRDisplayDeviceParamsChange_.bind(this));
}

WebVRManager.prototype = new Emitter();

// Expose these values externally.
WebVRManager.Modes = Modes;

WebVRManager.prototype.render = function(scene, camera, timestamp) {
  // Scene may be an array of two scenes, one for each eye.
  if (scene instanceof Array) {
    this.effect.render(scene[0], camera);
  } else {
    this.effect.render(scene, camera);
  }
};

WebVRManager.prototype.setVRCompatibleOverride = function(isVRCompatible) {
  this.isVRCompatible = isVRCompatible;
  this.isVRCompatibleOverride = true;

  // Don't actually change modes, just update the buttons.
  this.button.setMode(this.mode, this.isVRCompatible);
};

WebVRManager.prototype.setFullscreenCallback = function(callback) {
  this.fullscreenCallback = callback;
};

WebVRManager.prototype.setVRCallback = function(callback) {
  this.vrCallback = callback;
};

WebVRManager.prototype.setExitFullscreenCallback = function(callback) {
  this.exitFullscreenCallback = callback;
}

/**
 * Promise returns true if there is at least one HMD device available.
 */
WebVRManager.prototype.getDeviceByType_ = function(type) {
  return new Promise(function(resolve, reject) {
    navigator.getVRDisplays().then(function(displays) {
      // Promise succeeds, but check if there are any displays actually.
      for (var i = 0; i < displays.length; i++) {
        if (displays[i] instanceof type) {
          resolve(displays[i]);
          break;
        }
      }
      resolve(null);
    }, function() {
      // No displays are found.
      resolve(null);
    });
  });
};

/**
 * Helper for entering VR mode.
 */
WebVRManager.prototype.enterVRMode_ = function() {
  this.hmd.requestPresent([{
    source: this.renderer.domElement,
    predistorted: this.predistorted
  }]);
};

WebVRManager.prototype.setMode_ = function(mode) {
  var oldMode = this.mode;
  if (mode == this.mode) {
    console.warn('Not changing modes, already in %s', mode);
    return;
  }
  // console.log('Mode change: %s => %s', this.mode, mode);
  this.mode = mode;
  this.button.setMode(mode, this.isVRCompatible);

  // Emit an event indicating the mode changed.
  this.emit('modechange', mode, oldMode);
};

/**
 * Main button was clicked.
 */
WebVRManager.prototype.onFSClick_ = function() {
  switch (this.mode) {
    case Modes.NORMAL:
      // TODO: Remove this hack if/when iOS gets real fullscreen mode.
      // If this is an iframe on iOS, break out and open in no_fullscreen mode.
      if (Util.isIOS() && Util.isIFrame()) {
        if (this.fullscreenCallback) {
          this.fullscreenCallback();
        } else {
          var url = window.location.href;
          url = Util.appendQueryParameter(url, 'no_fullscreen', 'true');
          url = Util.appendQueryParameter(url, 'start_mode', Modes.MAGIC_WINDOW);
          top.location.href = url;
          return;
        }
      }
      this.setMode_(Modes.MAGIC_WINDOW);
      this.requestFullscreen_();
      break;
    case Modes.MAGIC_WINDOW:
      if (this.isFullscreenDisabled) {
        window.history.back();
        return;
      }
      if (this.exitFullscreenCallback) {
        this.exitFullscreenCallback();
      }
      this.setMode_(Modes.NORMAL);
      this.exitFullscreen_();
      break;
  }
};

/**
 * The VR button was clicked.
 */
WebVRManager.prototype.onVRClick_ = function() {
  // TODO: Remove this hack when iOS has fullscreen mode.
  // If this is an iframe on iOS, break out and open in no_fullscreen mode.
  if (this.mode == Modes.NORMAL && Util.isIOS() && Util.isIFrame()) {
    if (this.vrCallback) {
      this.vrCallback();
    } else {
      var url = window.location.href;
      url = Util.appendQueryParameter(url, 'no_fullscreen', 'true');
      url = Util.appendQueryParameter(url, 'start_mode', Modes.VR);
      top.location.href = url;
      return;
    }
  }
  this.enterVRMode_();
};

WebVRManager.prototype.requestFullscreen_ = function() {
  var canvas = document.body;
  //var canvas = this.renderer.domElement;
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.mozRequestFullScreen) {
    canvas.mozRequestFullScreen();
  } else if (canvas.webkitRequestFullscreen) {
    canvas.webkitRequestFullscreen();
  } else if (canvas.msRequestFullscreen) {
    canvas.msRequestFullscreen();
  }
};

WebVRManager.prototype.exitFullscreen_ = function() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
};

WebVRManager.prototype.onVRDisplayPresentChange_ = function(e) {
  console.log('onVRDisplayPresentChange_', e);
  if (this.hmd.isPresenting) {
    this.setMode_(Modes.VR);
  } else {
    this.setMode_(Modes.NORMAL);
  }
};

WebVRManager.prototype.onVRDisplayDeviceParamsChange_ = function(e) {
  console.log('onVRDisplayDeviceParamsChange_', e);
};

WebVRManager.prototype.onFullscreenChange_ = function(e) {
  // If we leave full-screen, go back to normal mode.
  if (document.webkitFullscreenElement === null ||
      document.mozFullScreenElement === null) {
    this.setMode_(Modes.NORMAL);
  }
};

module.exports = WebVRManager;

},{"./button-manager.js":1,"./emitter.js":2,"./modes.js":3,"./util.js":4}]},{},[5])(5)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(_dereq_,module,exports){
module.exports={
  "_args": [
    [
      {
        "raw": "webvr-polyfill@^0.9.26",
        "scope": null,
        "escapedName": "webvr-polyfill",
        "name": "webvr-polyfill",
        "rawSpec": "^0.9.26",
        "spec": ">=0.9.26 <0.10.0",
        "type": "range"
      },
      "C:\\Users\\Lucas\\Downloads\\vrview-master"
    ]
  ],
  "_from": "webvr-polyfill@>=0.9.26 <0.10.0",
  "_id": "webvr-polyfill@0.9.36",
  "_inCache": true,
  "_location": "/webvr-polyfill",
  "_nodeVersion": "4.8.4",
  "_npmOperationalInternal": {
    "host": "s3://npm-registry-packages",
    "tmp": "tmp/webvr-polyfill-0.9.36.tgz_1499892972378_0.10267087002284825"
  },
  "_npmUser": {
    "name": "jsantell",
    "email": "jsantell@gmail.com"
  },
  "_npmVersion": "2.15.11",
  "_phantomChildren": {},
  "_requested": {
    "raw": "webvr-polyfill@^0.9.26",
    "scope": null,
    "escapedName": "webvr-polyfill",
    "name": "webvr-polyfill",
    "rawSpec": "^0.9.26",
    "spec": ">=0.9.26 <0.10.0",
    "type": "range"
  },
  "_requiredBy": [
    "/",
    "/webvr-boilerplate"
  ],
  "_resolved": "https://registry.npmjs.org/webvr-polyfill/-/webvr-polyfill-0.9.36.tgz",
  "_shasum": "4b1e1556667e804beb0c8c2e67fdfcba3371e8c6",
  "_shrinkwrap": null,
  "_spec": "webvr-polyfill@^0.9.26",
  "_where": "C:\\Users\\Lucas\\Downloads\\vrview-master",
  "authors": [
    "Boris Smus <boris@smus.com>",
    "Brandon Jones <tojiro@gmail.com>",
    "Jordan Santell <jordan@jsantell.com>"
  ],
  "bugs": {
    "url": "https://github.com/googlevr/webvr-polyfill/issues"
  },
  "dependencies": {},
  "description": "Use WebVR today, on mobile or desktop, without requiring a special browser build.",
  "devDependencies": {
    "chai": "^3.5.0",
    "jsdom": "^9.12.0",
    "mocha": "^3.2.0",
    "semver": "^5.3.0",
    "webpack": "^2.6.1",
    "webpack-dev-server": "^2.4.5"
  },
  "directories": {},
  "dist": {
    "shasum": "4b1e1556667e804beb0c8c2e67fdfcba3371e8c6",
    "tarball": "https://registry.npmjs.org/webvr-polyfill/-/webvr-polyfill-0.9.36.tgz"
  },
  "gitHead": "5f8693a9053ee1dea425e96d14cd1f2bef7a284c",
  "homepage": "https://github.com/googlevr/webvr-polyfill",
  "keywords": [
    "vr",
    "webvr"
  ],
  "license": "Apache-2.0",
  "main": "src/node-entry",
  "maintainers": [
    {
      "name": "jsantell",
      "email": "jsantell@gmail.com"
    },
    {
      "name": "toji",
      "email": "tojiro@gmail.com"
    },
    {
      "name": "smus",
      "email": "boris@smus.com"
    }
  ],
  "name": "webvr-polyfill",
  "optionalDependencies": {},
  "readme": "ERROR: No README data found!",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/googlevr/webvr-polyfill.git"
  },
  "scripts": {
    "build": "webpack",
    "start": "npm run watch",
    "test": "mocha",
    "watch": "webpack-dev-server"
  },
  "version": "0.9.36"
}

},{}],9:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Util = _dereq_('./util.js');
var WakeLock = _dereq_('./wakelock.js');

// Start at a higher number to reduce chance of conflict.
var nextDisplayId = 1000;
var hasShowDeprecationWarning = false;

var defaultLeftBounds = [0, 0, 0.5, 1];
var defaultRightBounds = [0.5, 0, 0.5, 1];

/**
 * The base class for all VR frame data.
 */

function VRFrameData() {
  this.leftProjectionMatrix = new Float32Array(16);
  this.leftViewMatrix = new Float32Array(16);
  this.rightProjectionMatrix = new Float32Array(16);
  this.rightViewMatrix = new Float32Array(16);
  this.pose = null;
};

/**
 * The base class for all VR displays.
 */
function VRDisplay() {
  this.isPolyfilled = true;
  this.displayId = nextDisplayId++;
  this.displayName = 'webvr-polyfill displayName';

  this.depthNear = 0.01;
  this.depthFar = 10000.0;

  this.isConnected = true;
  this.isPresenting = false;
  this.capabilities = {
    hasPosition: false,
    hasOrientation: false,
    hasExternalDisplay: false,
    canPresent: false,
    maxLayers: 1
  };
  this.stageParameters = null;

  // "Private" members.
  this.waitingForPresent_ = false;
  this.layer_ = null;

  this.fullscreenElement_ = null;
  this.fullscreenWrapper_ = null;
  this.fullscreenElementCachedStyle_ = null;

  this.fullscreenEventTarget_ = null;
  this.fullscreenChangeHandler_ = null;
  this.fullscreenErrorHandler_ = null;

  this.wakelock_ = new WakeLock();
}

VRDisplay.prototype.getFrameData = function(frameData) {
  // TODO: Technically this should retain it's value for the duration of a frame
  // but I doubt that's practical to do in javascript.
  return Util.frameDataFromPose(frameData, this.getPose(), this);
};

VRDisplay.prototype.getPose = function() {
  // TODO: Technically this should retain it's value for the duration of a frame
  // but I doubt that's practical to do in javascript.
  return this.getImmediatePose();
};

VRDisplay.prototype.requestAnimationFrame = function(callback) {
  return window.requestAnimationFrame(callback);
};

VRDisplay.prototype.cancelAnimationFrame = function(id) {
  return window.cancelAnimationFrame(id);
};

VRDisplay.prototype.wrapForFullscreen = function(element) {
  // Don't wrap in iOS.
  if (Util.isIOS()) {
    return element;
  }
  if (!this.fullscreenWrapper_) {
    this.fullscreenWrapper_ = document.createElement('div');
    var cssProperties = [
      'height: ' + Math.min(screen.height, screen.width) + 'px !important',
      'top: 0 !important',
      'left: 0 !important',
      'right: 0 !important',
      'border: 0',
      'margin: 0',
      'padding: 0',
      'z-index: 999999 !important',
      'position: fixed',
    ];
    this.fullscreenWrapper_.setAttribute('style', cssProperties.join('; ') + ';');
    this.fullscreenWrapper_.classList.add('webvr-polyfill-fullscreen-wrapper');
  }

  if (this.fullscreenElement_ == element) {
    return this.fullscreenWrapper_;
  }

  // Remove any previously applied wrappers
  this.removeFullscreenWrapper();

  this.fullscreenElement_ = element;
  var parent = this.fullscreenElement_.parentElement;
  parent.insertBefore(this.fullscreenWrapper_, this.fullscreenElement_);
  parent.removeChild(this.fullscreenElement_);
  this.fullscreenWrapper_.insertBefore(this.fullscreenElement_, this.fullscreenWrapper_.firstChild);
  this.fullscreenElementCachedStyle_ = this.fullscreenElement_.getAttribute('style');

  var self = this;
  function applyFullscreenElementStyle() {
    if (!self.fullscreenElement_) {
      return;
    }

    var cssProperties = [
      'position: absolute',
      'top: 0',
      'left: 0',
      'width: ' + Math.max(screen.width, screen.height) + 'px',
      'height: ' + Math.min(screen.height, screen.width) + 'px',
      'border: 0',
      'margin: 0',
      'padding: 0',
    ];
    self.fullscreenElement_.setAttribute('style', cssProperties.join('; ') + ';');
  }

  applyFullscreenElementStyle();

  return this.fullscreenWrapper_;
};

VRDisplay.prototype.removeFullscreenWrapper = function() {
  if (!this.fullscreenElement_) {
    return;
  }

  var element = this.fullscreenElement_;
  if (this.fullscreenElementCachedStyle_) {
    element.setAttribute('style', this.fullscreenElementCachedStyle_);
  } else {
    element.removeAttribute('style');
  }
  this.fullscreenElement_ = null;
  this.fullscreenElementCachedStyle_ = null;

  var parent = this.fullscreenWrapper_.parentElement;
  this.fullscreenWrapper_.removeChild(element);
  parent.insertBefore(element, this.fullscreenWrapper_);
  parent.removeChild(this.fullscreenWrapper_);

  return element;
};

VRDisplay.prototype.requestPresent = function(layers) {
  var wasPresenting = this.isPresenting;
  var self = this;

  if (!(layers instanceof Array)) {
    if (!hasShowDeprecationWarning) {
      console.warn("Using a deprecated form of requestPresent. Should pass in an array of VRLayers.");
      hasShowDeprecationWarning = true;
    }
    layers = [layers];
  }

  return new Promise(function(resolve, reject) {
    if (!self.capabilities.canPresent) {
      reject(new Error('VRDisplay is not capable of presenting.'));
      return;
    }

    if (layers.length == 0 || layers.length > self.capabilities.maxLayers) {
      reject(new Error('Invalid number of layers.'));
      return;
    }

    var incomingLayer = layers[0];
    if (!incomingLayer.source) {
      /*
      todo: figure out the correct behavior if the source is not provided.
      see https://github.com/w3c/webvr/issues/58
      */
      resolve();
      return;
    }

    var leftBounds = incomingLayer.leftBounds || defaultLeftBounds;
    var rightBounds = incomingLayer.rightBounds || defaultRightBounds;
    if (wasPresenting) {
      // Already presenting, just changing configuration
      var layer = self.layer_;
      if (layer.source !== incomingLayer.source) {
        layer.source = incomingLayer.source;
      }

      for (var i = 0; i < 4; i++) {
        layer.leftBounds[i] = leftBounds[i];
        layer.rightBounds[i] = rightBounds[i];
      }

      resolve();
      return;
    }

    // Was not already presenting.
    self.layer_ = {
      predistorted: incomingLayer.predistorted,
      source: incomingLayer.source,
      leftBounds: leftBounds.slice(0),
      rightBounds: rightBounds.slice(0)
    };

    self.waitingForPresent_ = false;
    if (self.layer_ && self.layer_.source) {
      var fullscreenElement = self.wrapForFullscreen(self.layer_.source);

      var onFullscreenChange = function() {
        var actualFullscreenElement = Util.getFullscreenElement();

        self.isPresenting = (fullscreenElement === actualFullscreenElement);
        if (self.isPresenting) {
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape-primary').catch(function(error){
                    console.error('screen.orientation.lock() failed due to', error.message)
            });
          }
          self.waitingForPresent_ = false;
          self.beginPresent_();
          resolve();
        } else {
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }
          self.removeFullscreenWrapper();
          self.wakelock_.release();
          self.endPresent_();
          self.removeFullscreenListeners_();
        }
        self.fireVRDisplayPresentChange_();
      }
      var onFullscreenError = function() {
        if (!self.waitingForPresent_) {
          return;
        }

        self.removeFullscreenWrapper();
        self.removeFullscreenListeners_();

        self.wakelock_.release();
        self.waitingForPresent_ = false;
        self.isPresenting = false;

        reject(new Error('Unable to present.'));
      }

      self.addFullscreenListeners_(fullscreenElement,
          onFullscreenChange, onFullscreenError);

      if (Util.requestFullscreen(fullscreenElement)) {
        self.wakelock_.request();
        self.waitingForPresent_ = true;
      } else if (Util.isIOS() || Util.isWebViewAndroid()) {
        // *sigh* Just fake it.
        self.wakelock_.request();
        self.isPresenting = true;
        self.beginPresent_();
        self.fireVRDisplayPresentChange_();
        resolve();
      }
    }

    if (!self.waitingForPresent_ && !Util.isIOS()) {
      Util.exitFullscreen();
      reject(new Error('Unable to present.'));
    }
  });
};

VRDisplay.prototype.exitPresent = function() {
  var wasPresenting = this.isPresenting;
  var self = this;
  this.isPresenting = false;
  this.layer_ = null;
  this.wakelock_.release();

  return new Promise(function(resolve, reject) {
    if (wasPresenting) {
      if (!Util.exitFullscreen() && Util.isIOS()) {
        self.endPresent_();
        self.fireVRDisplayPresentChange_();
      }

      if (Util.isWebViewAndroid()) {
        self.removeFullscreenWrapper();
        self.removeFullscreenListeners_();
        self.endPresent_();
        self.fireVRDisplayPresentChange_();
      }

      resolve();
    } else {
      reject(new Error('Was not presenting to VRDisplay.'));
    }
  });
};

VRDisplay.prototype.getLayers = function() {
  if (this.layer_) {
    return [this.layer_];
  }
  return [];
};

VRDisplay.prototype.fireVRDisplayPresentChange_ = function() {
  // Important: unfortunately we cannot have full spec compliance here.
  // CustomEvent custom fields all go under e.detail (so the VRDisplay ends up
  // being e.detail.display, instead of e.display as per WebVR spec).
  var event = new CustomEvent('vrdisplaypresentchange', {detail: {display: this}});
  window.dispatchEvent(event);
};

VRDisplay.prototype.fireVRDisplayConnect_ = function() {
  // Important: unfortunately we cannot have full spec compliance here.
  // CustomEvent custom fields all go under e.detail (so the VRDisplay ends up
  // being e.detail.display, instead of e.display as per WebVR spec).
  var event = new CustomEvent('vrdisplayconnect', {detail: {display: this}});
  window.dispatchEvent(event);
};

VRDisplay.prototype.addFullscreenListeners_ = function(element, changeHandler, errorHandler) {
  this.removeFullscreenListeners_();

  this.fullscreenEventTarget_ = element;
  this.fullscreenChangeHandler_ = changeHandler;
  this.fullscreenErrorHandler_ = errorHandler;

  if (changeHandler) {
    if (document.fullscreenEnabled) {
      element.addEventListener('fullscreenchange', changeHandler, false);
    } else if (document.webkitFullscreenEnabled) {
      element.addEventListener('webkitfullscreenchange', changeHandler, false);
    } else if (document.mozFullScreenEnabled) {
      document.addEventListener('mozfullscreenchange', changeHandler, false);
    } else if (document.msFullscreenEnabled) {
      element.addEventListener('msfullscreenchange', changeHandler, false);
    }
  }

  if (errorHandler) {
    if (document.fullscreenEnabled) {
      element.addEventListener('fullscreenerror', errorHandler, false);
    } else if (document.webkitFullscreenEnabled) {
      element.addEventListener('webkitfullscreenerror', errorHandler, false);
    } else if (document.mozFullScreenEnabled) {
      document.addEventListener('mozfullscreenerror', errorHandler, false);
    } else if (document.msFullscreenEnabled) {
      element.addEventListener('msfullscreenerror', errorHandler, false);
    }
  }
};

VRDisplay.prototype.removeFullscreenListeners_ = function() {
  if (!this.fullscreenEventTarget_)
    return;

  var element = this.fullscreenEventTarget_;

  if (this.fullscreenChangeHandler_) {
    var changeHandler = this.fullscreenChangeHandler_;
    element.removeEventListener('fullscreenchange', changeHandler, false);
    element.removeEventListener('webkitfullscreenchange', changeHandler, false);
    document.removeEventListener('mozfullscreenchange', changeHandler, false);
    element.removeEventListener('msfullscreenchange', changeHandler, false);
  }

  if (this.fullscreenErrorHandler_) {
    var errorHandler = this.fullscreenErrorHandler_;
    element.removeEventListener('fullscreenerror', errorHandler, false);
    element.removeEventListener('webkitfullscreenerror', errorHandler, false);
    document.removeEventListener('mozfullscreenerror', errorHandler, false);
    element.removeEventListener('msfullscreenerror', errorHandler, false);
  }

  this.fullscreenEventTarget_ = null;
  this.fullscreenChangeHandler_ = null;
  this.fullscreenErrorHandler_ = null;
};

VRDisplay.prototype.beginPresent_ = function() {
  // Override to add custom behavior when presentation begins.
};

VRDisplay.prototype.endPresent_ = function() {
  // Override to add custom behavior when presentation ends.
};

VRDisplay.prototype.submitFrame = function(pose) {
  // Override to add custom behavior for frame submission.
};

VRDisplay.prototype.getEyeParameters = function(whichEye) {
  // Override to return accurate eye parameters if canPresent is true.
  return null;
};

/*
 * Deprecated classes
 */

/**
 * The base class for all VR devices. (Deprecated)
 */
function VRDevice() {
  this.isPolyfilled = true;
  this.hardwareUnitId = 'webvr-polyfill hardwareUnitId';
  this.deviceId = 'webvr-polyfill deviceId';
  this.deviceName = 'webvr-polyfill deviceName';
}

/**
 * The base class for all VR HMD devices. (Deprecated)
 */
function HMDVRDevice() {
}
HMDVRDevice.prototype = new VRDevice();

/**
 * The base class for all VR position sensor devices. (Deprecated)
 */
function PositionSensorVRDevice() {
}
PositionSensorVRDevice.prototype = new VRDevice();

module.exports.VRFrameData = VRFrameData;
module.exports.VRDisplay = VRDisplay;
module.exports.VRDevice = VRDevice;
module.exports.HMDVRDevice = HMDVRDevice;
module.exports.PositionSensorVRDevice = PositionSensorVRDevice;

},{"./util.js":29,"./wakelock.js":31}],10:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var CardboardUI = _dereq_('./cardboard-ui.js');
var Util = _dereq_('./util.js');
var WGLUPreserveGLState = _dereq_('./deps/wglu-preserve-state.js');

var distortionVS = [
  'attribute vec2 position;',
  'attribute vec3 texCoord;',

  'varying vec2 vTexCoord;',

  'uniform vec4 viewportOffsetScale[2];',

  'void main() {',
  '  vec4 viewport = viewportOffsetScale[int(texCoord.z)];',
  '  vTexCoord = (texCoord.xy * viewport.zw) + viewport.xy;',
  '  gl_Position = vec4( position, 1.0, 1.0 );',
  '}',
].join('\n');

var distortionFS = [
  'precision mediump float;',
  'uniform sampler2D diffuse;',

  'varying vec2 vTexCoord;',

  'void main() {',
  '  gl_FragColor = texture2D(diffuse, vTexCoord);',
  '}',
].join('\n');

/**
 * A mesh-based distorter.
 */
function CardboardDistorter(gl) {
  this.gl = gl;
  this.ctxAttribs = gl.getContextAttributes();

  this.meshWidth = 20;
  this.meshHeight = 20;

  this.bufferScale = window.WebVRConfig.BUFFER_SCALE;

  this.bufferWidth = gl.drawingBufferWidth;
  this.bufferHeight = gl.drawingBufferHeight;

  // Patching support
  this.realBindFramebuffer = gl.bindFramebuffer;
  this.realEnable = gl.enable;
  this.realDisable = gl.disable;
  this.realColorMask = gl.colorMask;
  this.realClearColor = gl.clearColor;
  this.realViewport = gl.viewport;

  if (!Util.isIOS()) {
    this.realCanvasWidth = Object.getOwnPropertyDescriptor(gl.canvas.__proto__, 'width');
    this.realCanvasHeight = Object.getOwnPropertyDescriptor(gl.canvas.__proto__, 'height');
  }

  this.isPatched = false;

  // State tracking
  this.lastBoundFramebuffer = null;
  this.cullFace = false;
  this.depthTest = false;
  this.blend = false;
  this.scissorTest = false;
  this.stencilTest = false;
  this.viewport = [0, 0, 0, 0];
  this.colorMask = [true, true, true, true];
  this.clearColor = [0, 0, 0, 0];

  this.attribs = {
    position: 0,
    texCoord: 1
  };
  this.program = Util.linkProgram(gl, distortionVS, distortionFS, this.attribs);
  this.uniforms = Util.getProgramUniforms(gl, this.program);

  this.viewportOffsetScale = new Float32Array(8);
  this.setTextureBounds();

  this.vertexBuffer = gl.createBuffer();
  this.indexBuffer = gl.createBuffer();
  this.indexCount = 0;

  this.renderTarget = gl.createTexture();
  this.framebuffer = gl.createFramebuffer();

  this.depthStencilBuffer = null;
  this.depthBuffer = null;
  this.stencilBuffer = null;

  if (this.ctxAttribs.depth && this.ctxAttribs.stencil) {
    this.depthStencilBuffer = gl.createRenderbuffer();
  } else if (this.ctxAttribs.depth) {
    this.depthBuffer = gl.createRenderbuffer();
  } else if (this.ctxAttribs.stencil) {
    this.stencilBuffer = gl.createRenderbuffer();
  }

  this.patch();

  this.onResize();

  if (!window.WebVRConfig.CARDBOARD_UI_DISABLED) {
    this.cardboardUI = new CardboardUI(gl);
  }
};

/**
 * Tears down all the resources created by the distorter and removes any
 * patches.
 */
CardboardDistorter.prototype.destroy = function() {
  var gl = this.gl;

  this.unpatch();

  gl.deleteProgram(this.program);
  gl.deleteBuffer(this.vertexBuffer);
  gl.deleteBuffer(this.indexBuffer);
  gl.deleteTexture(this.renderTarget);
  gl.deleteFramebuffer(this.framebuffer);
  if (this.depthStencilBuffer) {
    gl.deleteRenderbuffer(this.depthStencilBuffer);
  }
  if (this.depthBuffer) {
    gl.deleteRenderbuffer(this.depthBuffer);
  }
  if (this.stencilBuffer) {
    gl.deleteRenderbuffer(this.stencilBuffer);
  }

  if (this.cardboardUI) {
    this.cardboardUI.destroy();
  }
};


/**
 * Resizes the backbuffer to match the canvas width and height.
 */
CardboardDistorter.prototype.onResize = function() {
  var gl = this.gl;
  var self = this;

  var glState = [
    gl.RENDERBUFFER_BINDING,
    gl.TEXTURE_BINDING_2D, gl.TEXTURE0
  ];

  WGLUPreserveGLState(gl, glState, function(gl) {
    // Bind real backbuffer and clear it once. We don't need to clear it again
    // after that because we're overwriting the same area every frame.
    self.realBindFramebuffer.call(gl, gl.FRAMEBUFFER, null);

    // Put things in a good state
    if (self.scissorTest) { self.realDisable.call(gl, gl.SCISSOR_TEST); }
    self.realColorMask.call(gl, true, true, true, true);
    self.realViewport.call(gl, 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    self.realClearColor.call(gl, 0, 0, 0, 1);

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Now bind and resize the fake backbuffer
    self.realBindFramebuffer.call(gl, gl.FRAMEBUFFER, self.framebuffer);

    gl.bindTexture(gl.TEXTURE_2D, self.renderTarget);
    gl.texImage2D(gl.TEXTURE_2D, 0, self.ctxAttribs.alpha ? gl.RGBA : gl.RGB,
        self.bufferWidth, self.bufferHeight, 0,
        self.ctxAttribs.alpha ? gl.RGBA : gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, self.renderTarget, 0);

    if (self.ctxAttribs.depth && self.ctxAttribs.stencil) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, self.depthStencilBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL,
          self.bufferWidth, self.bufferHeight);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT,
          gl.RENDERBUFFER, self.depthStencilBuffer);
    } else if (self.ctxAttribs.depth) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, self.depthBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
          self.bufferWidth, self.bufferHeight);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
          gl.RENDERBUFFER, self.depthBuffer);
    } else if (self.ctxAttribs.stencil) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, self.stencilBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8,
          self.bufferWidth, self.bufferHeight);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT,
          gl.RENDERBUFFER, self.stencilBuffer);
    }

    if (!gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
      console.error('Framebuffer incomplete!');
    }

    self.realBindFramebuffer.call(gl, gl.FRAMEBUFFER, self.lastBoundFramebuffer);

    if (self.scissorTest) { self.realEnable.call(gl, gl.SCISSOR_TEST); }

    self.realColorMask.apply(gl, self.colorMask);
    self.realViewport.apply(gl, self.viewport);
    self.realClearColor.apply(gl, self.clearColor);
  });

  if (this.cardboardUI) {
    this.cardboardUI.onResize();
  }
};

CardboardDistorter.prototype.patch = function() {
  if (this.isPatched) {
    return;
  }

  var self = this;
  var canvas = this.gl.canvas;
  var gl = this.gl;

  if (!Util.isIOS()) {
    canvas.width = Util.getScreenWidth() * this.bufferScale;
    canvas.height = Util.getScreenHeight() * this.bufferScale;

    Object.defineProperty(canvas, 'width', {
      configurable: true,
      enumerable: true,
      get: function() {
        return self.bufferWidth;
      },
      set: function(value) {
        self.bufferWidth = value;
        self.realCanvasWidth.set.call(canvas, value);
        self.onResize();
      }
    });

    Object.defineProperty(canvas, 'height', {
      configurable: true,
      enumerable: true,
      get: function() {
        return self.bufferHeight;
      },
      set: function(value) {
        self.bufferHeight = value;
        self.realCanvasHeight.set.call(canvas, value);
        self.onResize();
      }
    });
  }

  this.lastBoundFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);

  if (this.lastBoundFramebuffer == null) {
    this.lastBoundFramebuffer = this.framebuffer;
    this.gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  }

  this.gl.bindFramebuffer = function(target, framebuffer) {
    self.lastBoundFramebuffer = framebuffer ? framebuffer : self.framebuffer;
    // Silently make calls to bind the default framebuffer bind ours instead.
    self.realBindFramebuffer.call(gl, target, self.lastBoundFramebuffer);
  };

  this.cullFace = gl.getParameter(gl.CULL_FACE);
  this.depthTest = gl.getParameter(gl.DEPTH_TEST);
  this.blend = gl.getParameter(gl.BLEND);
  this.scissorTest = gl.getParameter(gl.SCISSOR_TEST);
  this.stencilTest = gl.getParameter(gl.STENCIL_TEST);

  gl.enable = function(pname) {
    switch (pname) {
      case gl.CULL_FACE: self.cullFace = true; break;
      case gl.DEPTH_TEST: self.depthTest = true; break;
      case gl.BLEND: self.blend = true; break;
      case gl.SCISSOR_TEST: self.scissorTest = true; break;
      case gl.STENCIL_TEST: self.stencilTest = true; break;
    }
    self.realEnable.call(gl, pname);
  };

  gl.disable = function(pname) {
    switch (pname) {
      case gl.CULL_FACE: self.cullFace = false; break;
      case gl.DEPTH_TEST: self.depthTest = false; break;
      case gl.BLEND: self.blend = false; break;
      case gl.SCISSOR_TEST: self.scissorTest = false; break;
      case gl.STENCIL_TEST: self.stencilTest = false; break;
    }
    self.realDisable.call(gl, pname);
  };

  this.colorMask = gl.getParameter(gl.COLOR_WRITEMASK);
  gl.colorMask = function(r, g, b, a) {
    self.colorMask[0] = r;
    self.colorMask[1] = g;
    self.colorMask[2] = b;
    self.colorMask[3] = a;
    self.realColorMask.call(gl, r, g, b, a);
  };

  this.clearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);
  gl.clearColor = function(r, g, b, a) {
    self.clearColor[0] = r;
    self.clearColor[1] = g;
    self.clearColor[2] = b;
    self.clearColor[3] = a;
    self.realClearColor.call(gl, r, g, b, a);
  };

  this.viewport = gl.getParameter(gl.VIEWPORT);
  gl.viewport = function(x, y, w, h) {
    self.viewport[0] = x;
    self.viewport[1] = y;
    self.viewport[2] = w;
    self.viewport[3] = h;
    self.realViewport.call(gl, x, y, w, h);
  };

  this.isPatched = true;
  Util.safariCssSizeWorkaround(canvas);
};

CardboardDistorter.prototype.unpatch = function() {
  if (!this.isPatched) {
    return;
  }

  var gl = this.gl;
  var canvas = this.gl.canvas;

  if (!Util.isIOS()) {
    Object.defineProperty(canvas, 'width', this.realCanvasWidth);
    Object.defineProperty(canvas, 'height', this.realCanvasHeight);
  }
  canvas.width = this.bufferWidth;
  canvas.height = this.bufferHeight;

  gl.bindFramebuffer = this.realBindFramebuffer;
  gl.enable = this.realEnable;
  gl.disable = this.realDisable;
  gl.colorMask = this.realColorMask;
  gl.clearColor = this.realClearColor;
  gl.viewport = this.realViewport;

  // Check to see if our fake backbuffer is bound and bind the real backbuffer
  // if that's the case.
  if (this.lastBoundFramebuffer == this.framebuffer) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  this.isPatched = false;

  setTimeout(function() {
    Util.safariCssSizeWorkaround(canvas);
  }, 1);
};

CardboardDistorter.prototype.setTextureBounds = function(leftBounds, rightBounds) {
  if (!leftBounds) {
    leftBounds = [0, 0, 0.5, 1];
  }

  if (!rightBounds) {
    rightBounds = [0.5, 0, 0.5, 1];
  }

  // Left eye
  this.viewportOffsetScale[0] = leftBounds[0]; // X
  this.viewportOffsetScale[1] = leftBounds[1]; // Y
  this.viewportOffsetScale[2] = leftBounds[2]; // Width
  this.viewportOffsetScale[3] = leftBounds[3]; // Height

  // Right eye
  this.viewportOffsetScale[4] = rightBounds[0]; // X
  this.viewportOffsetScale[5] = rightBounds[1]; // Y
  this.viewportOffsetScale[6] = rightBounds[2]; // Width
  this.viewportOffsetScale[7] = rightBounds[3]; // Height
};

/**
 * Performs distortion pass on the injected backbuffer, rendering it to the real
 * backbuffer.
 */
CardboardDistorter.prototype.submitFrame = function() {
  var gl = this.gl;
  var self = this;

  var glState = [];

  if (!window.WebVRConfig.DIRTY_SUBMIT_FRAME_BINDINGS) {
    glState.push(
      gl.CURRENT_PROGRAM,
      gl.ARRAY_BUFFER_BINDING,
      gl.ELEMENT_ARRAY_BUFFER_BINDING,
      gl.TEXTURE_BINDING_2D, gl.TEXTURE0
    );
  }

  WGLUPreserveGLState(gl, glState, function(gl) {
    // Bind the real default framebuffer
    self.realBindFramebuffer.call(gl, gl.FRAMEBUFFER, null);

    // Make sure the GL state is in a good place
    if (self.cullFace) { self.realDisable.call(gl, gl.CULL_FACE); }
    if (self.depthTest) { self.realDisable.call(gl, gl.DEPTH_TEST); }
    if (self.blend) { self.realDisable.call(gl, gl.BLEND); }
    if (self.scissorTest) { self.realDisable.call(gl, gl.SCISSOR_TEST); }
    if (self.stencilTest) { self.realDisable.call(gl, gl.STENCIL_TEST); }
    self.realColorMask.call(gl, true, true, true, true);
    self.realViewport.call(gl, 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    // If the backbuffer has an alpha channel clear every frame so the page
    // doesn't show through.
    if (self.ctxAttribs.alpha || Util.isIOS()) {
      self.realClearColor.call(gl, 0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    // Bind distortion program and mesh
    gl.useProgram(self.program);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, self.indexBuffer);

    gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
    gl.enableVertexAttribArray(self.attribs.position);
    gl.enableVertexAttribArray(self.attribs.texCoord);
    gl.vertexAttribPointer(self.attribs.position, 2, gl.FLOAT, false, 20, 0);
    gl.vertexAttribPointer(self.attribs.texCoord, 3, gl.FLOAT, false, 20, 8);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(self.uniforms.diffuse, 0);
    gl.bindTexture(gl.TEXTURE_2D, self.renderTarget);

    gl.uniform4fv(self.uniforms.viewportOffsetScale, self.viewportOffsetScale);

    // Draws both eyes
    gl.drawElements(gl.TRIANGLES, self.indexCount, gl.UNSIGNED_SHORT, 0);

    if (self.cardboardUI) {
      self.cardboardUI.renderNoState();
    }

    // Bind the fake default framebuffer again
    self.realBindFramebuffer.call(self.gl, gl.FRAMEBUFFER, self.framebuffer);

    // If preserveDrawingBuffer == false clear the framebuffer
    if (!self.ctxAttribs.preserveDrawingBuffer) {
      self.realClearColor.call(gl, 0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    if (!window.WebVRConfig.DIRTY_SUBMIT_FRAME_BINDINGS) {
      self.realBindFramebuffer.call(gl, gl.FRAMEBUFFER, self.lastBoundFramebuffer);
    }

    // Restore state
    if (self.cullFace) { self.realEnable.call(gl, gl.CULL_FACE); }
    if (self.depthTest) { self.realEnable.call(gl, gl.DEPTH_TEST); }
    if (self.blend) { self.realEnable.call(gl, gl.BLEND); }
    if (self.scissorTest) { self.realEnable.call(gl, gl.SCISSOR_TEST); }
    if (self.stencilTest) { self.realEnable.call(gl, gl.STENCIL_TEST); }

    self.realColorMask.apply(gl, self.colorMask);
    self.realViewport.apply(gl, self.viewport);
    if (self.ctxAttribs.alpha || !self.ctxAttribs.preserveDrawingBuffer) {
      self.realClearColor.apply(gl, self.clearColor);
    }
  });

  // Workaround for the fact that Safari doesn't allow us to patch the canvas
  // width and height correctly. After each submit frame check to see what the
  // real backbuffer size has been set to and resize the fake backbuffer size
  // to match.
  if (Util.isIOS()) {
    var canvas = gl.canvas;
    if (canvas.width != self.bufferWidth || canvas.height != self.bufferHeight) {
      self.bufferWidth = canvas.width;
      self.bufferHeight = canvas.height;
      self.onResize();
    }
  }
};

/**
 * Call when the deviceInfo has changed. At this point we need
 * to re-calculate the distortion mesh.
 */
CardboardDistorter.prototype.updateDeviceInfo = function(deviceInfo) {
  var gl = this.gl;
  var self = this;

  var glState = [gl.ARRAY_BUFFER_BINDING, gl.ELEMENT_ARRAY_BUFFER_BINDING];
  WGLUPreserveGLState(gl, glState, function(gl) {
    var vertices = self.computeMeshVertices_(self.meshWidth, self.meshHeight, deviceInfo);
    gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Indices don't change based on device parameters, so only compute once.
    if (!self.indexCount) {
      var indices = self.computeMeshIndices_(self.meshWidth, self.meshHeight);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, self.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
      self.indexCount = indices.length;
    }
  });
};

/**
 * Build the distortion mesh vertices.
 * Based on code from the Unity cardboard plugin.
 */
CardboardDistorter.prototype.computeMeshVertices_ = function(width, height, deviceInfo) {
  var vertices = new Float32Array(2 * width * height * 5);

  var lensFrustum = deviceInfo.getLeftEyeVisibleTanAngles();
  var noLensFrustum = deviceInfo.getLeftEyeNoLensTanAngles();
  var viewport = deviceInfo.getLeftEyeVisibleScreenRect(noLensFrustum);
  var vidx = 0;
  var iidx = 0;
  for (var e = 0; e < 2; e++) {
    for (var j = 0; j < height; j++) {
      for (var i = 0; i < width; i++, vidx++) {
        var u = i / (width - 1);
        var v = j / (height - 1);

        // Grid points regularly spaced in StreoScreen, and barrel distorted in
        // the mesh.
        var s = u;
        var t = v;
        var x = Util.lerp(lensFrustum[0], lensFrustum[2], u);
        var y = Util.lerp(lensFrustum[3], lensFrustum[1], v);
        var d = Math.sqrt(x * x + y * y);
        var r = deviceInfo.distortion.distortInverse(d);
        var p = x * r / d;
        var q = y * r / d;
        u = (p - noLensFrustum[0]) / (noLensFrustum[2] - noLensFrustum[0]);
        v = (q - noLensFrustum[3]) / (noLensFrustum[1] - noLensFrustum[3]);

        // Convert u,v to mesh screen coordinates.
        var aspect = deviceInfo.device.widthMeters / deviceInfo.device.heightMeters;

        // FIXME: The original Unity plugin multiplied U by the aspect ratio
        // and didn't multiply either value by 2, but that seems to get it
        // really close to correct looking for me. I hate this kind of "Don't
        // know why it works" code though, and wold love a more logical
        // explanation of what needs to happen here.
        u = (viewport.x + u * viewport.width - 0.5) * 2.0; //* aspect;
        v = (viewport.y + v * viewport.height - 0.5) * 2.0;

        vertices[(vidx * 5) + 0] = u; // position.x
        vertices[(vidx * 5) + 1] = v; // position.y
        vertices[(vidx * 5) + 2] = s; // texCoord.x
        vertices[(vidx * 5) + 3] = t; // texCoord.y
        vertices[(vidx * 5) + 4] = e; // texCoord.z (viewport index)
      }
    }
    var w = lensFrustum[2] - lensFrustum[0];
    lensFrustum[0] = -(w + lensFrustum[0]);
    lensFrustum[2] = w - lensFrustum[2];
    w = noLensFrustum[2] - noLensFrustum[0];
    noLensFrustum[0] = -(w + noLensFrustum[0]);
    noLensFrustum[2] = w - noLensFrustum[2];
    viewport.x = 1 - (viewport.x + viewport.width);
  }
  return vertices;
}

/**
 * Build the distortion mesh indices.
 * Based on code from the Unity cardboard plugin.
 */
CardboardDistorter.prototype.computeMeshIndices_ = function(width, height) {
  var indices = new Uint16Array(2 * (width - 1) * (height - 1) * 6);
  var halfwidth = width / 2;
  var halfheight = height / 2;
  var vidx = 0;
  var iidx = 0;
  for (var e = 0; e < 2; e++) {
    for (var j = 0; j < height; j++) {
      for (var i = 0; i < width; i++, vidx++) {
        if (i == 0 || j == 0)
          continue;
        // Build a quad.  Lower right and upper left quadrants have quads with
        // the triangle diagonal flipped to get the vignette to interpolate
        // correctly.
        if ((i <= halfwidth) == (j <= halfheight)) {
          // Quad diagonal lower left to upper right.
          indices[iidx++] = vidx;
          indices[iidx++] = vidx - width - 1;
          indices[iidx++] = vidx - width;
          indices[iidx++] = vidx - width - 1;
          indices[iidx++] = vidx;
          indices[iidx++] = vidx - 1;
        } else {
          // Quad diagonal upper left to lower right.
          indices[iidx++] = vidx - 1;
          indices[iidx++] = vidx - width;
          indices[iidx++] = vidx;
          indices[iidx++] = vidx - width;
          indices[iidx++] = vidx - 1;
          indices[iidx++] = vidx - width - 1;
        }
      }
    }
  }
  return indices;
};

CardboardDistorter.prototype.getOwnPropertyDescriptor_ = function(proto, attrName) {
  var descriptor = Object.getOwnPropertyDescriptor(proto, attrName);
  // In some cases (ahem... Safari), the descriptor returns undefined get and
  // set fields. In this case, we need to create a synthetic property
  // descriptor. This works around some of the issues in
  // https://github.com/borismus/webvr-polyfill/issues/46
  if (descriptor.get === undefined || descriptor.set === undefined) {
    descriptor.configurable = true;
    descriptor.enumerable = true;
    descriptor.get = function() {
      return this.getAttribute(attrName);
    };
    descriptor.set = function(val) {
      this.setAttribute(attrName, val);
    };
  }
  return descriptor;
};

module.exports = CardboardDistorter;

},{"./cardboard-ui.js":11,"./deps/wglu-preserve-state.js":13,"./util.js":29}],11:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Util = _dereq_('./util.js');
var WGLUPreserveGLState = _dereq_('./deps/wglu-preserve-state.js');

var uiVS = [
  'attribute vec2 position;',

  'uniform mat4 projectionMat;',

  'void main() {',
  '  gl_Position = projectionMat * vec4( position, -1.0, 1.0 );',
  '}',
].join('\n');

var uiFS = [
  'precision mediump float;',

  'uniform vec4 color;',

  'void main() {',
  '  gl_FragColor = color;',
  '}',
].join('\n');

var DEG2RAD = Math.PI/180.0;

// The gear has 6 identical sections, each spanning 60 degrees.
var kAnglePerGearSection = 60;

// Half-angle of the span of the outer rim.
var kOuterRimEndAngle = 12;

// Angle between the middle of the outer rim and the start of the inner rim.
var kInnerRimBeginAngle = 20;

// Distance from center to outer rim, normalized so that the entire model
// fits in a [-1, 1] x [-1, 1] square.
var kOuterRadius = 1;

// Distance from center to depressed rim, in model units.
var kMiddleRadius = 0.75;

// Radius of the inner hollow circle, in model units.
var kInnerRadius = 0.3125;

// Center line thickness in DP.
var kCenterLineThicknessDp = 4;

// Button width in DP.
var kButtonWidthDp = 28;

// Factor to scale the touch area that responds to the touch.
var kTouchSlopFactor = 1.5;

var Angles = [
  0, kOuterRimEndAngle, kInnerRimBeginAngle,
  kAnglePerGearSection - kInnerRimBeginAngle,
  kAnglePerGearSection - kOuterRimEndAngle
];

/**
 * Renders the alignment line and "options" gear. It is assumed that the canvas
 * this is rendered into covers the entire screen (or close to it.)
 */
function CardboardUI(gl) {
  this.gl = gl;

  this.attribs = {
    position: 0
  };
  this.program = Util.linkProgram(gl, uiVS, uiFS, this.attribs);
  this.uniforms = Util.getProgramUniforms(gl, this.program);

  this.vertexBuffer = gl.createBuffer();
  this.gearOffset = 0;
  this.gearVertexCount = 0;
  this.arrowOffset = 0;
  this.arrowVertexCount = 0;

  this.projMat = new Float32Array(16);

  this.listener = null;

  this.onResize();
};

/**
 * Tears down all the resources created by the UI renderer.
 */
CardboardUI.prototype.destroy = function() {
  var gl = this.gl;

  if (this.listener) {
    gl.canvas.removeEventListener('click', this.listener, false);
  }

  gl.deleteProgram(this.program);
  gl.deleteBuffer(this.vertexBuffer);
};

/**
 * Adds a listener to clicks on the gear and back icons
 */
CardboardUI.prototype.listen = function(optionsCallback, backCallback) {
  var canvas = this.gl.canvas;
  this.listener = function(event) {
    var midline = canvas.clientWidth / 2;
    var buttonSize = kButtonWidthDp * kTouchSlopFactor;
    // Check to see if the user clicked on (or around) the gear icon
    if (event.clientX > midline - buttonSize &&
        event.clientX < midline + buttonSize &&
        event.clientY > canvas.clientHeight - buttonSize) {
      optionsCallback(event);
    }
    // Check to see if the user clicked on (or around) the back icon
    else if (event.clientX < buttonSize && event.clientY < buttonSize) {
      backCallback(event);
    }
  };
  canvas.addEventListener('click', this.listener, false);
};

/**
 * Builds the UI mesh.
 */
CardboardUI.prototype.onResize = function() {
  var gl = this.gl;
  var self = this;

  var glState = [
    gl.ARRAY_BUFFER_BINDING
  ];

  WGLUPreserveGLState(gl, glState, function(gl) {
    var vertices = [];

    var midline = gl.drawingBufferWidth / 2;

    // The gl buffer size will likely be smaller than the physical pixel count.
    // So we need to scale the dps down based on the actual buffer size vs physical pixel count.
    // This will properly size the ui elements no matter what the gl buffer resolution is
    var physicalPixels = Math.max(screen.width, screen.height) * window.devicePixelRatio;
    var scalingRatio = gl.drawingBufferWidth / physicalPixels;
    var dps = scalingRatio *  window.devicePixelRatio;

    var lineWidth = kCenterLineThicknessDp * dps / 2;
    var buttonSize = kButtonWidthDp * kTouchSlopFactor * dps;
    var buttonScale = kButtonWidthDp * dps / 2;
    var buttonBorder = ((kButtonWidthDp * kTouchSlopFactor) - kButtonWidthDp) * dps;

    // Build centerline
    vertices.push(midline - lineWidth, buttonSize);
    vertices.push(midline - lineWidth, gl.drawingBufferHeight);
    vertices.push(midline + lineWidth, buttonSize);
    vertices.push(midline + lineWidth, gl.drawingBufferHeight);

    // Build gear
    self.gearOffset = (vertices.length / 2);

    function addGearSegment(theta, r) {
      var angle = (90 - theta) * DEG2RAD;
      var x = Math.cos(angle);
      var y = Math.sin(angle);
      vertices.push(kInnerRadius * x * buttonScale + midline, kInnerRadius * y * buttonScale + buttonScale);
      vertices.push(r * x * buttonScale + midline, r * y * buttonScale + buttonScale);
    }

    for (var i = 0; i <= 6; i++) {
      var segmentTheta = i * kAnglePerGearSection;

      addGearSegment(segmentTheta, kOuterRadius);
      addGearSegment(segmentTheta + kOuterRimEndAngle, kOuterRadius);
      addGearSegment(segmentTheta + kInnerRimBeginAngle, kMiddleRadius);
      addGearSegment(segmentTheta + (kAnglePerGearSection - kInnerRimBeginAngle), kMiddleRadius);
      addGearSegment(segmentTheta + (kAnglePerGearSection - kOuterRimEndAngle), kOuterRadius);
    }

    self.gearVertexCount = (vertices.length / 2) - self.gearOffset;

    // Build back arrow
    self.arrowOffset = (vertices.length / 2);

    function addArrowVertex(x, y) {
      vertices.push(buttonBorder + x, gl.drawingBufferHeight - buttonBorder - y);
    }

    var angledLineWidth = lineWidth / Math.sin(45 * DEG2RAD);

    addArrowVertex(0, buttonScale);
    addArrowVertex(buttonScale, 0);
    addArrowVertex(buttonScale + angledLineWidth, angledLineWidth);
    addArrowVertex(angledLineWidth, buttonScale + angledLineWidth);

    addArrowVertex(angledLineWidth, buttonScale - angledLineWidth);
    addArrowVertex(0, buttonScale);
    addArrowVertex(buttonScale, buttonScale * 2);
    addArrowVertex(buttonScale + angledLineWidth, (buttonScale * 2) - angledLineWidth);

    addArrowVertex(angledLineWidth, buttonScale - angledLineWidth);
    addArrowVertex(0, buttonScale);

    addArrowVertex(angledLineWidth, buttonScale - lineWidth);
    addArrowVertex(kButtonWidthDp * dps, buttonScale - lineWidth);
    addArrowVertex(angledLineWidth, buttonScale + lineWidth);
    addArrowVertex(kButtonWidthDp * dps, buttonScale + lineWidth);

    self.arrowVertexCount = (vertices.length / 2) - self.arrowOffset;

    // Buffer data
    gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  });
};

/**
 * Performs distortion pass on the injected backbuffer, rendering it to the real
 * backbuffer.
 */
CardboardUI.prototype.render = function() {
  var gl = this.gl;
  var self = this;

  var glState = [
    gl.CULL_FACE,
    gl.DEPTH_TEST,
    gl.BLEND,
    gl.SCISSOR_TEST,
    gl.STENCIL_TEST,
    gl.COLOR_WRITEMASK,
    gl.VIEWPORT,

    gl.CURRENT_PROGRAM,
    gl.ARRAY_BUFFER_BINDING
  ];

  WGLUPreserveGLState(gl, glState, function(gl) {
    // Make sure the GL state is in a good place
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.disable(gl.SCISSOR_TEST);
    gl.disable(gl.STENCIL_TEST);
    gl.colorMask(true, true, true, true);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    self.renderNoState();
  });
};

CardboardUI.prototype.renderNoState = function() {
  var gl = this.gl;

  // Bind distortion program and mesh
  gl.useProgram(this.program);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.enableVertexAttribArray(this.attribs.position);
  gl.vertexAttribPointer(this.attribs.position, 2, gl.FLOAT, false, 8, 0);

  gl.uniform4f(this.uniforms.color, 1.0, 1.0, 1.0, 1.0);

  Util.orthoMatrix(this.projMat, 0, gl.drawingBufferWidth, 0, gl.drawingBufferHeight, 0.1, 1024.0);
  gl.uniformMatrix4fv(this.uniforms.projectionMat, false, this.projMat);

  // Draws UI element
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.drawArrays(gl.TRIANGLE_STRIP, this.gearOffset, this.gearVertexCount);
  gl.drawArrays(gl.TRIANGLE_STRIP, this.arrowOffset, this.arrowVertexCount);
};

module.exports = CardboardUI;

},{"./deps/wglu-preserve-state.js":13,"./util.js":29}],12:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var CardboardDistorter = _dereq_('./cardboard-distorter.js');
var CardboardUI = _dereq_('./cardboard-ui.js');
var DeviceInfo = _dereq_('./device-info.js');
var Dpdb = _dereq_('./dpdb/dpdb.js');
var FusionPoseSensor = _dereq_('./sensor-fusion/fusion-pose-sensor.js');
var RotateInstructions = _dereq_('./rotate-instructions.js');
var ViewerSelector = _dereq_('./viewer-selector.js');
var VRDisplay = _dereq_('./base.js').VRDisplay;
var Util = _dereq_('./util.js');

var Eye = {
  LEFT: 'left',
  RIGHT: 'right'
};

/**
 * VRDisplay based on mobile device parameters and DeviceMotion APIs.
 */
function CardboardVRDisplay() {
  this.displayName = 'Cardboard VRDisplay (webvr-polyfill)';

  this.capabilities.hasOrientation = true;
  this.capabilities.canPresent = true;

  // "Private" members.
  this.bufferScale_ = window.WebVRConfig.BUFFER_SCALE;
  this.poseSensor_ = new FusionPoseSensor();
  this.distorter_ = null;
  this.cardboardUI_ = null;

  this.dpdb_ = new Dpdb(true, this.onDeviceParamsUpdated_.bind(this));
  this.deviceInfo_ = new DeviceInfo(this.dpdb_.getDeviceParams());

  this.viewerSelector_ = new ViewerSelector();
  this.viewerSelector_.onChange(this.onViewerChanged_.bind(this));

  // Set the correct initial viewer.
  this.deviceInfo_.setViewer(this.viewerSelector_.getCurrentViewer());

  if (!window.WebVRConfig.ROTATE_INSTRUCTIONS_DISABLED) {
    this.rotateInstructions_ = new RotateInstructions();
  }

  if (Util.isIOS()) {
    // Listen for resize events to workaround this awful Safari bug.
    window.addEventListener('resize', this.onResize_.bind(this));
  }
}
CardboardVRDisplay.prototype = new VRDisplay();

CardboardVRDisplay.prototype.getImmediatePose = function() {
  return {
    position: this.poseSensor_.getPosition(),
    orientation: this.poseSensor_.getOrientation(),
    linearVelocity: null,
    linearAcceleration: null,
    angularVelocity: null,
    angularAcceleration: null
  };
};

CardboardVRDisplay.prototype.resetPose = function() {
  this.poseSensor_.resetPose();
};

CardboardVRDisplay.prototype.getEyeParameters = function(whichEye) {
  var offset = [this.deviceInfo_.viewer.interLensDistance * 0.5, 0.0, 0.0];
  var fieldOfView;

  // TODO: FoV can be a little expensive to compute. Cache when device params change.
  if (whichEye == Eye.LEFT) {
    offset[0] *= -1.0;
    fieldOfView = this.deviceInfo_.getFieldOfViewLeftEye();
  } else if (whichEye == Eye.RIGHT) {
    fieldOfView = this.deviceInfo_.getFieldOfViewRightEye();
  } else {
    console.error('Invalid eye provided: %s', whichEye);
    return null;
  }

  return {
    fieldOfView: fieldOfView,
    offset: offset,
    // TODO: Should be able to provide better values than these.
    renderWidth: this.deviceInfo_.device.width * 0.5 * this.bufferScale_,
    renderHeight: this.deviceInfo_.device.height * this.bufferScale_,
  };
};

CardboardVRDisplay.prototype.onDeviceParamsUpdated_ = function(newParams) {
  if (Util.isDebug()) {
    console.log('DPDB reported that device params were updated.');
  }
  this.deviceInfo_.updateDeviceParams(newParams);

  if (this.distorter_) {
    this.distorter_.updateDeviceInfo(this.deviceInfo_);
  }
};

CardboardVRDisplay.prototype.updateBounds_ = function () {
  if (this.layer_ && this.distorter_ && (this.layer_.leftBounds || this.layer_.rightBounds)) {
    this.distorter_.setTextureBounds(this.layer_.leftBounds, this.layer_.rightBounds);
  }
};

CardboardVRDisplay.prototype.beginPresent_ = function() {
  var gl = this.layer_.source.getContext('webgl');
  if (!gl)
    gl = this.layer_.source.getContext('experimental-webgl');
  if (!gl)
    gl = this.layer_.source.getContext('webgl2');

  if (!gl)
    return; // Can't do distortion without a WebGL context.

  // Provides a way to opt out of distortion
  if (this.layer_.predistorted) {
    if (!window.WebVRConfig.CARDBOARD_UI_DISABLED) {
      gl.canvas.width = Util.getScreenWidth() * this.bufferScale_;
      gl.canvas.height = Util.getScreenHeight() * this.bufferScale_;
      this.cardboardUI_ = new CardboardUI(gl);
    }
  } else {
    // Create a new distorter for the target context
    this.distorter_ = new CardboardDistorter(gl);
    this.distorter_.updateDeviceInfo(this.deviceInfo_);
    this.cardboardUI_ = this.distorter_.cardboardUI;
  }

  if (this.cardboardUI_) {
    this.cardboardUI_.listen(function(e) {
      // Options clicked.
      this.viewerSelector_.show(this.layer_.source.parentElement);
      e.stopPropagation();
      e.preventDefault();
    }.bind(this), function(e) {
      // Back clicked.
      this.exitPresent();
      e.stopPropagation();
      e.preventDefault();
    }.bind(this));
  }

  if (this.rotateInstructions_) {
    if (Util.isLandscapeMode() && Util.isMobile()) {
      // In landscape mode, temporarily show the "put into Cardboard"
      // interstitial. Otherwise, do the default thing.
      this.rotateInstructions_.showTemporarily(3000, this.layer_.source.parentElement);
    } else {
      this.rotateInstructions_.update();
    }
  }

  // Listen for orientation change events in order to show interstitial.
  this.orientationHandler = this.onOrientationChange_.bind(this);
  window.addEventListener('orientationchange', this.orientationHandler);

  // Listen for present display change events in order to update distorter dimensions
  this.vrdisplaypresentchangeHandler = this.updateBounds_.bind(this);
  window.addEventListener('vrdisplaypresentchange', this.vrdisplaypresentchangeHandler);

  // Fire this event initially, to give geometry-distortion clients the chance
  // to do something custom.
  this.fireVRDisplayDeviceParamsChange_();
};

CardboardVRDisplay.prototype.endPresent_ = function() {
  if (this.distorter_) {
    this.distorter_.destroy();
    this.distorter_ = null;
  }
  if (this.cardboardUI_) {
    this.cardboardUI_.destroy();
    this.cardboardUI_ = null;
  }

  if (this.rotateInstructions_) {
    this.rotateInstructions_.hide();
  }
  this.viewerSelector_.hide();

  window.removeEventListener('orientationchange', this.orientationHandler);
  window.removeEventListener('vrdisplaypresentchange', this.vrdisplaypresentchangeHandler);
};

CardboardVRDisplay.prototype.submitFrame = function(pose) {
  if (this.distorter_) {
    this.updateBounds_();
    this.distorter_.submitFrame();
  } else if (this.cardboardUI_ && this.layer_) {
    // Hack for predistorted: true.
    var canvas = this.layer_.source.getContext('webgl').canvas;
    if (canvas.width != this.lastWidth || canvas.height != this.lastHeight) {
      this.cardboardUI_.onResize();
    }
    this.lastWidth = canvas.width;
    this.lastHeight = canvas.height;

    // Render the Cardboard UI.
    this.cardboardUI_.render();
  }
};

CardboardVRDisplay.prototype.onOrientationChange_ = function(e) {
  // Hide the viewer selector.
  this.viewerSelector_.hide();

  // Update the rotate instructions.
  if (this.rotateInstructions_) {
    this.rotateInstructions_.update();
  }

  this.onResize_();
};

CardboardVRDisplay.prototype.onResize_ = function(e) {
  if (this.layer_) {
    var gl = this.layer_.source.getContext('webgl');
    // Size the CSS canvas.
    // Added padding on right and bottom because iPhone 5 will not
    // hide the URL bar unless content is bigger than the screen.
    // This will not be visible as long as the container element (e.g. body)
    // is set to 'overflow: hidden'.
    // Additionally, 'box-sizing: content-box' ensures renderWidth = width + padding.
    // This is required when 'box-sizing: border-box' is used elsewhere in the page.
    var cssProperties = [
      'position: absolute',
      'top: 0',
      'left: 0',
      'width: ' + Math.max(screen.width, screen.height) + 'px',
      'height: ' + Math.min(screen.height, screen.width) + 'px',
      'border: 0',
      'margin: 0',
      'padding: 0 10px 10px 0',
      'box-sizing: content-box',
    ];
    gl.canvas.setAttribute('style', cssProperties.join('; ') + ';');

    Util.safariCssSizeWorkaround(gl.canvas);
  }
};

CardboardVRDisplay.prototype.onViewerChanged_ = function(viewer) {
  this.deviceInfo_.setViewer(viewer);

  if (this.distorter_) {
    // Update the distortion appropriately.
    this.distorter_.updateDeviceInfo(this.deviceInfo_);
  }

  // Fire a new event containing viewer and device parameters for clients that
  // want to implement their own geometry-based distortion.
  this.fireVRDisplayDeviceParamsChange_();
};

CardboardVRDisplay.prototype.fireVRDisplayDeviceParamsChange_ = function() {
  var event = new CustomEvent('vrdisplaydeviceparamschange', {
    detail: {
      vrdisplay: this,
      deviceInfo: this.deviceInfo_,
    }
  });
  window.dispatchEvent(event);
};

module.exports = CardboardVRDisplay;

},{"./base.js":9,"./cardboard-distorter.js":10,"./cardboard-ui.js":11,"./device-info.js":14,"./dpdb/dpdb.js":18,"./rotate-instructions.js":23,"./sensor-fusion/fusion-pose-sensor.js":25,"./util.js":29,"./viewer-selector.js":30}],13:[function(_dereq_,module,exports){
/**
 * Copyright (c) 2016, Brandon Jones.
 * https://github.com/toji/webgl-utils/blob/master/src/wglu-preserve-state.js
 * LICENSE: https://github.com/toji/webgl-utils/blob/master/LICENSE.md
 */

function WGLUPreserveGLState(gl, bindings, callback) {
  if (!bindings) {
    callback(gl);
    return;
  }

  var boundValues = [];

  var activeTexture = null;
  for (var i = 0; i < bindings.length; ++i) {
    var binding = bindings[i];
    switch (binding) {
      case gl.TEXTURE_BINDING_2D:
      case gl.TEXTURE_BINDING_CUBE_MAP:
        var textureUnit = bindings[++i];
        if (textureUnit < gl.TEXTURE0 || textureUnit > gl.TEXTURE31) {
          console.error("TEXTURE_BINDING_2D or TEXTURE_BINDING_CUBE_MAP must be followed by a valid texture unit");
          boundValues.push(null, null);
          break;
        }
        if (!activeTexture) {
          activeTexture = gl.getParameter(gl.ACTIVE_TEXTURE);
        }
        gl.activeTexture(textureUnit);
        boundValues.push(gl.getParameter(binding), null);
        break;
      case gl.ACTIVE_TEXTURE:
        activeTexture = gl.getParameter(gl.ACTIVE_TEXTURE);
        boundValues.push(null);
        break;
      default:
        boundValues.push(gl.getParameter(binding));
        break;
    }
  }

  callback(gl);

  for (var i = 0; i < bindings.length; ++i) {
    var binding = bindings[i];
    var boundValue = boundValues[i];
    switch (binding) {
      case gl.ACTIVE_TEXTURE:
        break; // Ignore this binding, since we special-case it to happen last.
      case gl.ARRAY_BUFFER_BINDING:
        gl.bindBuffer(gl.ARRAY_BUFFER, boundValue);
        break;
      case gl.COLOR_CLEAR_VALUE:
        gl.clearColor(boundValue[0], boundValue[1], boundValue[2], boundValue[3]);
        break;
      case gl.COLOR_WRITEMASK:
        gl.colorMask(boundValue[0], boundValue[1], boundValue[2], boundValue[3]);
        break;
      case gl.CURRENT_PROGRAM:
        gl.useProgram(boundValue);
        break;
      case gl.ELEMENT_ARRAY_BUFFER_BINDING:
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boundValue);
        break;
      case gl.FRAMEBUFFER_BINDING:
        gl.bindFramebuffer(gl.FRAMEBUFFER, boundValue);
        break;
      case gl.RENDERBUFFER_BINDING:
        gl.bindRenderbuffer(gl.RENDERBUFFER, boundValue);
        break;
      case gl.TEXTURE_BINDING_2D:
        var textureUnit = bindings[++i];
        if (textureUnit < gl.TEXTURE0 || textureUnit > gl.TEXTURE31)
          break;
        gl.activeTexture(textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, boundValue);
        break;
      case gl.TEXTURE_BINDING_CUBE_MAP:
        var textureUnit = bindings[++i];
        if (textureUnit < gl.TEXTURE0 || textureUnit > gl.TEXTURE31)
          break;
        gl.activeTexture(textureUnit);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, boundValue);
        break;
      case gl.VIEWPORT:
        gl.viewport(boundValue[0], boundValue[1], boundValue[2], boundValue[3]);
        break;
      case gl.BLEND:
      case gl.CULL_FACE:
      case gl.DEPTH_TEST:
      case gl.SCISSOR_TEST:
      case gl.STENCIL_TEST:
        if (boundValue) {
          gl.enable(binding);
        } else {
          gl.disable(binding);
        }
        break;
      default:
        console.log("No GL restore behavior for 0x" + binding.toString(16));
        break;
    }

    if (activeTexture) {
      gl.activeTexture(activeTexture);
    }
  }
}

module.exports = WGLUPreserveGLState;

},{}],14:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Distortion = _dereq_('./distortion/distortion.js');
var MathUtil = _dereq_('./math-util.js');
var Util = _dereq_('./util.js');

function Device(params) {
  this.width = params.width || Util.getScreenWidth();
  this.height = params.height || Util.getScreenHeight();
  this.widthMeters = params.widthMeters;
  this.heightMeters = params.heightMeters;
  this.bevelMeters = params.bevelMeters;
}


// Fallback Android device (based on Nexus 5 measurements) for use when
// we can't recognize an Android device.
var DEFAULT_ANDROID = new Device({
  widthMeters: 0.110,
  heightMeters: 0.062,
  bevelMeters: 0.004
});

// Fallback iOS device (based on iPhone6) for use when
// we can't recognize an Android device.
var DEFAULT_IOS = new Device({
  widthMeters: 0.1038,
  heightMeters: 0.0584,
  bevelMeters: 0.004
});


var Viewers = {
  CardboardV1: new CardboardViewer({
    id: 'CardboardV1',
    label: 'Cardboard I/O 2014',
    fov: 40,
    interLensDistance: 0.060,
    baselineLensDistance: 0.035,
    screenLensDistance: 0.042,
    distortionCoefficients: [0.441, 0.156],
    inverseCoefficients: [-0.4410035, 0.42756155, -0.4804439, 0.5460139,
      -0.58821183, 0.5733938, -0.48303202, 0.33299083, -0.17573841,
      0.0651772, -0.01488963, 0.001559834]
  }),
  CardboardV2: new CardboardViewer({
    id: 'CardboardV2',
    label: 'Cardboard I/O 2015',
    fov: 60,
    interLensDistance: 0.064,
    baselineLensDistance: 0.035,
    screenLensDistance: 0.039,
    distortionCoefficients: [0.34, 0.55],
    inverseCoefficients: [-0.33836704, -0.18162185, 0.862655, -1.2462051,
      1.0560602, -0.58208317, 0.21609078, -0.05444823, 0.009177956,
      -9.904169E-4, 6.183535E-5, -1.6981803E-6]
  })
};


var DEFAULT_LEFT_CENTER = {x: 0.5, y: 0.5};
var DEFAULT_RIGHT_CENTER = {x: 0.5, y: 0.5};

/**
 * Manages information about the device and the viewer.
 *
 * deviceParams indicates the parameters of the device to use (generally
 * obtained from dpdb.getDeviceParams()). Can be null to mean no device
 * params were found.
 */
function DeviceInfo(deviceParams) {
  this.viewer = Viewers.CardboardV2;
  this.updateDeviceParams(deviceParams);
  this.distortion = new Distortion(this.viewer.distortionCoefficients);
}

DeviceInfo.prototype.updateDeviceParams = function(deviceParams) {
  this.device = this.determineDevice_(deviceParams) || this.device;
};

DeviceInfo.prototype.getDevice = function() {
  return this.device;
};

DeviceInfo.prototype.setViewer = function(viewer) {
  this.viewer = viewer;
  this.distortion = new Distortion(this.viewer.distortionCoefficients);
};

DeviceInfo.prototype.determineDevice_ = function(deviceParams) {
  if (!deviceParams) {
    // No parameters, so use a default.
    if (Util.isIOS()) {
      console.warn('Using fallback iOS device measurements.');
      return DEFAULT_IOS;
    } else {
      console.warn('Using fallback Android device measurements.');
      return DEFAULT_ANDROID;
    }
  }

  // Compute device screen dimensions based on deviceParams.
  var METERS_PER_INCH = 0.0254;
  var metersPerPixelX = METERS_PER_INCH / deviceParams.xdpi;
  var metersPerPixelY = METERS_PER_INCH / deviceParams.ydpi;
  var width = Util.getScreenWidth();
  var height = Util.getScreenHeight();
  return new Device({
    widthMeters: metersPerPixelX * width,
    heightMeters: metersPerPixelY * height,
    bevelMeters: deviceParams.bevelMm * 0.001,
  });
};

/**
 * Calculates field of view for the left eye.
 */
DeviceInfo.prototype.getDistortedFieldOfViewLeftEye = function() {
  var viewer = this.viewer;
  var device = this.device;
  var distortion = this.distortion;

  // Device.height and device.width for device in portrait mode, so transpose.
  var eyeToScreenDistance = viewer.screenLensDistance;

  var outerDist = (device.widthMeters - viewer.interLensDistance) / 2;
  var innerDist = viewer.interLensDistance / 2;
  var bottomDist = viewer.baselineLensDistance - device.bevelMeters;
  var topDist = device.heightMeters - bottomDist;

  var outerAngle = MathUtil.radToDeg * Math.atan(
      distortion.distort(outerDist / eyeToScreenDistance));
  var innerAngle = MathUtil.radToDeg * Math.atan(
      distortion.distort(innerDist / eyeToScreenDistance));
  var bottomAngle = MathUtil.radToDeg * Math.atan(
      distortion.distort(bottomDist / eyeToScreenDistance));
  var topAngle = MathUtil.radToDeg * Math.atan(
      distortion.distort(topDist / eyeToScreenDistance));

  return {
    leftDegrees: Math.min(outerAngle, viewer.fov),
    rightDegrees: Math.min(innerAngle, viewer.fov),
    downDegrees: Math.min(bottomAngle, viewer.fov),
    upDegrees: Math.min(topAngle, viewer.fov)
  };
};

/**
 * Calculates the tan-angles from the maximum FOV for the left eye for the
 * current device and screen parameters.
 */
DeviceInfo.prototype.getLeftEyeVisibleTanAngles = function() {
  var viewer = this.viewer;
  var device = this.device;
  var distortion = this.distortion;

  // Tan-angles from the max FOV.
  var fovLeft = Math.tan(-MathUtil.degToRad * viewer.fov);
  var fovTop = Math.tan(MathUtil.degToRad * viewer.fov);
  var fovRight = Math.tan(MathUtil.degToRad * viewer.fov);
  var fovBottom = Math.tan(-MathUtil.degToRad * viewer.fov);
  // Viewport size.
  var halfWidth = device.widthMeters / 4;
  var halfHeight = device.heightMeters / 2;
  // Viewport center, measured from left lens position.
  var verticalLensOffset = (viewer.baselineLensDistance - device.bevelMeters - halfHeight);
  var centerX = viewer.interLensDistance / 2 - halfWidth;
  var centerY = -verticalLensOffset;
  var centerZ = viewer.screenLensDistance;
  // Tan-angles of the viewport edges, as seen through the lens.
  var screenLeft = distortion.distort((centerX - halfWidth) / centerZ);
  var screenTop = distortion.distort((centerY + halfHeight) / centerZ);
  var screenRight = distortion.distort((centerX + halfWidth) / centerZ);
  var screenBottom = distortion.distort((centerY - halfHeight) / centerZ);
  // Compare the two sets of tan-angles and take the value closer to zero on each side.
  var result = new Float32Array(4);
  result[0] = Math.max(fovLeft, screenLeft);
  result[1] = Math.min(fovTop, screenTop);
  result[2] = Math.min(fovRight, screenRight);
  result[3] = Math.max(fovBottom, screenBottom);
  return result;
};

/**
 * Calculates the tan-angles from the maximum FOV for the left eye for the
 * current device and screen parameters, assuming no lenses.
 */
DeviceInfo.prototype.getLeftEyeNoLensTanAngles = function() {
  var viewer = this.viewer;
  var device = this.device;
  var distortion = this.distortion;

  var result = new Float32Array(4);
  // Tan-angles from the max FOV.
  var fovLeft = distortion.distortInverse(Math.tan(-MathUtil.degToRad * viewer.fov));
  var fovTop = distortion.distortInverse(Math.tan(MathUtil.degToRad * viewer.fov));
  var fovRight = distortion.distortInverse(Math.tan(MathUtil.degToRad * viewer.fov));
  var fovBottom = distortion.distortInverse(Math.tan(-MathUtil.degToRad * viewer.fov));
  // Viewport size.
  var halfWidth = device.widthMeters / 4;
  var halfHeight = device.heightMeters / 2;
  // Viewport center, measured from left lens position.
  var verticalLensOffset = (viewer.baselineLensDistance - device.bevelMeters - halfHeight);
  var centerX = viewer.interLensDistance / 2 - halfWidth;
  var centerY = -verticalLensOffset;
  var centerZ = viewer.screenLensDistance;
  // Tan-angles of the viewport edges, as seen through the lens.
  var screenLeft = (centerX - halfWidth) / centerZ;
  var screenTop = (centerY + halfHeight) / centerZ;
  var screenRight = (centerX + halfWidth) / centerZ;
  var screenBottom = (centerY - halfHeight) / centerZ;
  // Compare the two sets of tan-angles and take the value closer to zero on each side.
  result[0] = Math.max(fovLeft, screenLeft);
  result[1] = Math.min(fovTop, screenTop);
  result[2] = Math.min(fovRight, screenRight);
  result[3] = Math.max(fovBottom, screenBottom);
  return result;
};

/**
 * Calculates the screen rectangle visible from the left eye for the
 * current device and screen parameters.
 */
DeviceInfo.prototype.getLeftEyeVisibleScreenRect = function(undistortedFrustum) {
  var viewer = this.viewer;
  var device = this.device;

  var dist = viewer.screenLensDistance;
  var eyeX = (device.widthMeters - viewer.interLensDistance) / 2;
  var eyeY = viewer.baselineLensDistance - device.bevelMeters;
  var left = (undistortedFrustum[0] * dist + eyeX) / device.widthMeters;
  var top = (undistortedFrustum[1] * dist + eyeY) / device.heightMeters;
  var right = (undistortedFrustum[2] * dist + eyeX) / device.widthMeters;
  var bottom = (undistortedFrustum[3] * dist + eyeY) / device.heightMeters;
  return {
    x: left,
    y: bottom,
    width: right - left,
    height: top - bottom
  };
};

DeviceInfo.prototype.getFieldOfViewLeftEye = function(opt_isUndistorted) {
  return opt_isUndistorted ? this.getUndistortedFieldOfViewLeftEye() :
      this.getDistortedFieldOfViewLeftEye();
};

DeviceInfo.prototype.getFieldOfViewRightEye = function(opt_isUndistorted) {
  var fov = this.getFieldOfViewLeftEye(opt_isUndistorted);
  return {
    leftDegrees: fov.rightDegrees,
    rightDegrees: fov.leftDegrees,
    upDegrees: fov.upDegrees,
    downDegrees: fov.downDegrees
  };
};

/**
 * Calculates undistorted field of view for the left eye.
 */
DeviceInfo.prototype.getUndistortedFieldOfViewLeftEye = function() {
  var p = this.getUndistortedParams_();

  return {
    leftDegrees: MathUtil.radToDeg * Math.atan(p.outerDist),
    rightDegrees: MathUtil.radToDeg * Math.atan(p.innerDist),
    downDegrees: MathUtil.radToDeg * Math.atan(p.bottomDist),
    upDegrees: MathUtil.radToDeg * Math.atan(p.topDist)
  };
};

DeviceInfo.prototype.getUndistortedViewportLeftEye = function() {
  var p = this.getUndistortedParams_();
  var viewer = this.viewer;
  var device = this.device;

  // Distances stored in local variables are in tan-angle units unless otherwise
  // noted.
  var eyeToScreenDistance = viewer.screenLensDistance;
  var screenWidth = device.widthMeters / eyeToScreenDistance;
  var screenHeight = device.heightMeters / eyeToScreenDistance;
  var xPxPerTanAngle = device.width / screenWidth;
  var yPxPerTanAngle = device.height / screenHeight;

  var x = Math.round((p.eyePosX - p.outerDist) * xPxPerTanAngle);
  var y = Math.round((p.eyePosY - p.bottomDist) * yPxPerTanAngle);
  return {
    x: x,
    y: y,
    width: Math.round((p.eyePosX + p.innerDist) * xPxPerTanAngle) - x,
    height: Math.round((p.eyePosY + p.topDist) * yPxPerTanAngle) - y
  };
};

DeviceInfo.prototype.getUndistortedParams_ = function() {
  var viewer = this.viewer;
  var device = this.device;
  var distortion = this.distortion;

  // Most of these variables in tan-angle units.
  var eyeToScreenDistance = viewer.screenLensDistance;
  var halfLensDistance = viewer.interLensDistance / 2 / eyeToScreenDistance;
  var screenWidth = device.widthMeters / eyeToScreenDistance;
  var screenHeight = device.heightMeters / eyeToScreenDistance;

  var eyePosX = screenWidth / 2 - halfLensDistance;
  var eyePosY = (viewer.baselineLensDistance - device.bevelMeters) / eyeToScreenDistance;

  var maxFov = viewer.fov;
  var viewerMax = distortion.distortInverse(Math.tan(MathUtil.degToRad * maxFov));
  var outerDist = Math.min(eyePosX, viewerMax);
  var innerDist = Math.min(halfLensDistance, viewerMax);
  var bottomDist = Math.min(eyePosY, viewerMax);
  var topDist = Math.min(screenHeight - eyePosY, viewerMax);

  return {
    outerDist: outerDist,
    innerDist: innerDist,
    topDist: topDist,
    bottomDist: bottomDist,
    eyePosX: eyePosX,
    eyePosY: eyePosY
  };
};


function CardboardViewer(params) {
  // A machine readable ID.
  this.id = params.id;
  // A human readable label.
  this.label = params.label;

  // Field of view in degrees (per side).
  this.fov = params.fov;

  // Distance between lens centers in meters.
  this.interLensDistance = params.interLensDistance;
  // Distance between viewer baseline and lens center in meters.
  this.baselineLensDistance = params.baselineLensDistance;
  // Screen-to-lens distance in meters.
  this.screenLensDistance = params.screenLensDistance;

  // Distortion coefficients.
  this.distortionCoefficients = params.distortionCoefficients;
  // Inverse distortion coefficients.
  // TODO: Calculate these from distortionCoefficients in the future.
  this.inverseCoefficients = params.inverseCoefficients;
}

// Export viewer information.
DeviceInfo.Viewers = Viewers;
module.exports = DeviceInfo;

},{"./distortion/distortion.js":16,"./math-util.js":20,"./util.js":29}],15:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var VRDisplay = _dereq_('./base.js').VRDisplay;
var HMDVRDevice = _dereq_('./base.js').HMDVRDevice;
var PositionSensorVRDevice = _dereq_('./base.js').PositionSensorVRDevice;

/**
 * Wraps a VRDisplay and exposes it as a HMDVRDevice
 */
function VRDisplayHMDDevice(display) {
  this.display = display;

  this.hardwareUnitId = display.displayId;
  this.deviceId = 'webvr-polyfill:HMD:' + display.displayId;
  this.deviceName = display.displayName + ' (HMD)';
}
VRDisplayHMDDevice.prototype = new HMDVRDevice();

VRDisplayHMDDevice.prototype.getEyeParameters = function(whichEye) {
  var eyeParameters = this.display.getEyeParameters(whichEye);

  return {
    currentFieldOfView: eyeParameters.fieldOfView,
    maximumFieldOfView: eyeParameters.fieldOfView,
    minimumFieldOfView: eyeParameters.fieldOfView,
    recommendedFieldOfView: eyeParameters.fieldOfView,
    eyeTranslation: { x: eyeParameters.offset[0], y: eyeParameters.offset[1], z: eyeParameters.offset[2] },
    renderRect: {
      x: (whichEye == 'right') ? eyeParameters.renderWidth : 0,
      y: 0,
      width: eyeParameters.renderWidth,
      height: eyeParameters.renderHeight
    }
  };
};

VRDisplayHMDDevice.prototype.setFieldOfView =
    function(opt_fovLeft, opt_fovRight, opt_zNear, opt_zFar) {
  // Not supported. getEyeParameters reports that the min, max, and recommended
  // FoV is all the same, so no adjustment can be made.
};

// TODO: Need to hook requestFullscreen to see if a wrapped VRDisplay was passed
// in as an option. If so we should prevent the default fullscreen behavior and
// call VRDisplay.requestPresent instead.

/**
 * Wraps a VRDisplay and exposes it as a PositionSensorVRDevice
 */
function VRDisplayPositionSensorDevice(display) {
  this.display = display;

  this.hardwareUnitId = display.displayId;
  this.deviceId = 'webvr-polyfill:PositionSensor: ' + display.displayId;
  this.deviceName = display.displayName + ' (PositionSensor)';
}
VRDisplayPositionSensorDevice.prototype = new PositionSensorVRDevice();

VRDisplayPositionSensorDevice.prototype.getState = function() {
  var pose = this.display.getPose();
  return {
    position: pose.position ? { x: pose.position[0], y: pose.position[1], z: pose.position[2] } : null,
    orientation: pose.orientation ? { x: pose.orientation[0], y: pose.orientation[1], z: pose.orientation[2], w: pose.orientation[3] } : null,
    linearVelocity: null,
    linearAcceleration: null,
    angularVelocity: null,
    angularAcceleration: null
  };
};

VRDisplayPositionSensorDevice.prototype.resetState = function() {
  return this.positionDevice.resetPose();
};


module.exports.VRDisplayHMDDevice = VRDisplayHMDDevice;
module.exports.VRDisplayPositionSensorDevice = VRDisplayPositionSensorDevice;


},{"./base.js":9}],16:[function(_dereq_,module,exports){
/**
 * TODO(smus): Implement coefficient inversion.
 */
function Distortion(coefficients) {
  this.coefficients = coefficients;
}

/**
 * Calculates the inverse distortion for a radius.
 * </p><p>
 * Allows to compute the original undistorted radius from a distorted one.
 * See also getApproximateInverseDistortion() for a faster but potentially
 * less accurate method.
 *
 * @param {Number} radius Distorted radius from the lens center in tan-angle units.
 * @return {Number} The undistorted radius in tan-angle units.
 */
Distortion.prototype.distortInverse = function(radius) {
  // Secant method.
  var r0 = 0;
  var r1 = 1;
  var dr0 = radius - this.distort(r0);
  while (Math.abs(r1 - r0) > 0.0001 /** 0.1mm */) {
    var dr1 = radius - this.distort(r1);
    var r2 = r1 - dr1 * ((r1 - r0) / (dr1 - dr0));
    r0 = r1;
    r1 = r2;
    dr0 = dr1;
  }
  return r1;
};

/**
 * Distorts a radius by its distortion factor from the center of the lenses.
 *
 * @param {Number} radius Radius from the lens center in tan-angle units.
 * @return {Number} The distorted radius in tan-angle units.
 */
Distortion.prototype.distort = function(radius) {
  var r2 = radius * radius;
  var ret = 0;
  for (var i = 0; i < this.coefficients.length; i++) {
    ret = r2 * (ret + this.coefficients[i]);
  }
  return (ret + 1) * radius;
};

module.exports = Distortion;

},{}],17:[function(_dereq_,module,exports){
module.exports={
  "format": 1,
  "last_updated": "2017-06-01T22:33:42Z",
  "devices": [
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "asus/*/Nexus 7/*"
        },
        {
          "ua": "Nexus 7"
        }
      ],
      "dpi": [
        320.8,
        323
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "asus/*/ASUS_Z00AD/*"
        },
        {
          "ua": "ASUS_Z00AD"
        }
      ],
      "dpi": [
        403,
        404.6
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "Google/*/Pixel XL/*"
        },
        {
          "ua": "Pixel XL"
        }
      ],
      "dpi": [
        537.9,
        533
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "Google/*/Pixel/*"
        },
        {
          "ua": "Pixel"
        }
      ],
      "dpi": [
        432.6,
        436.7
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "HTC/*/HTC6435LVW/*"
        },
        {
          "ua": "HTC6435LVW"
        }
      ],
      "dpi": [
        449.7,
        443.3
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "HTC/*/HTC One XL/*"
        },
        {
          "ua": "HTC One XL"
        }
      ],
      "dpi": [
        315.3,
        314.6
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "htc/*/Nexus 9/*"
        },
        {
          "ua": "Nexus 9"
        }
      ],
      "dpi": 289,
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "HTC/*/HTC One M9/*"
        },
        {
          "ua": "HTC One M9"
        }
      ],
      "dpi": [
        442.5,
        443.3
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "HTC/*/HTC One_M8/*"
        },
        {
          "ua": "HTC One_M8"
        }
      ],
      "dpi": [
        449.7,
        447.4
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "HTC/*/HTC One/*"
        },
        {
          "ua": "HTC One"
        }
      ],
      "dpi": 472.8,
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "Huawei/*/Nexus 6P/*"
        },
        {
          "ua": "Nexus 6P"
        }
      ],
      "dpi": [
        515.1,
        518
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "LGE/*/Nexus 5X/*"
        },
        {
          "ua": "Nexus 5X"
        }
      ],
      "dpi": [
        422,
        419.9
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "LGE/*/LGMS345/*"
        },
        {
          "ua": "LGMS345"
        }
      ],
      "dpi": [
        221.7,
        219.1
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "LGE/*/LG-D800/*"
        },
        {
          "ua": "LG-D800"
        }
      ],
      "dpi": [
        422,
        424.1
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "LGE/*/LG-D850/*"
        },
        {
          "ua": "LG-D850"
        }
      ],
      "dpi": [
        537.9,
        541.9
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "LGE/*/VS985 4G/*"
        },
        {
          "ua": "VS985 4G"
        }
      ],
      "dpi": [
        537.9,
        535.6
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "LGE/*/Nexus 5/*"
        },
        {
          "ua": "Nexus 5 B"
        }
      ],
      "dpi": [
        442.4,
        444.8
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "LGE/*/Nexus 4/*"
        },
        {
          "ua": "Nexus 4"
        }
      ],
      "dpi": [
        319.8,
        318.4
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "LGE/*/LG-P769/*"
        },
        {
          "ua": "LG-P769"
        }
      ],
      "dpi": [
        240.6,
        247.5
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "LGE/*/LGMS323/*"
        },
        {
          "ua": "LGMS323"
        }
      ],
      "dpi": [
        206.6,
        204.6
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "LGE/*/LGLS996/*"
        },
        {
          "ua": "LGLS996"
        }
      ],
      "dpi": [
        403.4,
        401.5
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "Micromax/*/4560MMX/*"
        },
        {
          "ua": "4560MMX"
        }
      ],
      "dpi": [
        240,
        219.4
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "Micromax/*/A250/*"
        },
        {
          "ua": "Micromax A250"
        }
      ],
      "dpi": [
        480,
        446.4
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "Micromax/*/Micromax AQ4501/*"
        },
        {
          "ua": "Micromax AQ4501"
        }
      ],
      "dpi": 240,
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "motorola/*/DROID RAZR/*"
        },
        {
          "ua": "DROID RAZR"
        }
      ],
      "dpi": [
        368.1,
        256.7
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "motorola/*/XT830C/*"
        },
        {
          "ua": "XT830C"
        }
      ],
      "dpi": [
        254,
        255.9
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "motorola/*/XT1021/*"
        },
        {
          "ua": "XT1021"
        }
      ],
      "dpi": [
        254,
        256.7
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "motorola/*/XT1023/*"
        },
        {
          "ua": "XT1023"
        }
      ],
      "dpi": [
        254,
        256.7
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "motorola/*/XT1028/*"
        },
        {
          "ua": "XT1028"
        }
      ],
      "dpi": [
        326.6,
        327.6
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "motorola/*/XT1034/*"
        },
        {
          "ua": "XT1034"
        }
      ],
      "dpi": [
        326.6,
        328.4
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "motorola/*/XT1053/*"
        },
        {
          "ua": "XT1053"
        }
      ],
      "dpi": [
        315.3,
        316.1
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "motorola/*/XT1562/*"
        },
        {
          "ua": "XT1562"
        }
      ],
      "dpi": [
        403.4,
        402.7
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "motorola/*/Nexus 6/*"
        },
        {
          "ua": "Nexus 6 B"
        }
      ],
      "dpi": [
        494.3,
        489.7
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "motorola/*/XT1063/*"
        },
        {
          "ua": "XT1063"
        }
      ],
      "dpi": [
        295,
        296.6
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "motorola/*/XT1064/*"
        },
        {
          "ua": "XT1064"
        }
      ],
      "dpi": [
        295,
        295.6
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "motorola/*/XT1092/*"
        },
        {
          "ua": "XT1092"
        }
      ],
      "dpi": [
        422,
        424.1
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "motorola/*/XT1095/*"
        },
        {
          "ua": "XT1095"
        }
      ],
      "dpi": [
        422,
        423.4
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "motorola/*/G4/*"
        },
        {
          "ua": "Moto G (4)"
        }
      ],
      "dpi": 401,
      "bw": 4,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "OnePlus/*/A0001/*"
        },
        {
          "ua": "A0001"
        }
      ],
      "dpi": [
        403.4,
        401
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "OnePlus/*/ONE E1005/*"
        },
        {
          "ua": "ONE E1005"
        }
      ],
      "dpi": [
        442.4,
        441.4
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "OnePlus/*/ONE A2005/*"
        },
        {
          "ua": "ONE A2005"
        }
      ],
      "dpi": [
        391.9,
        405.4
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "OPPO/*/X909/*"
        },
        {
          "ua": "X909"
        }
      ],
      "dpi": [
        442.4,
        444.1
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/GT-I9082/*"
        },
        {
          "ua": "GT-I9082"
        }
      ],
      "dpi": [
        184.7,
        185.4
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-G360P/*"
        },
        {
          "ua": "SM-G360P"
        }
      ],
      "dpi": [
        196.7,
        205.4
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/Nexus S/*"
        },
        {
          "ua": "Nexus S"
        }
      ],
      "dpi": [
        234.5,
        229.8
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/GT-I9300/*"
        },
        {
          "ua": "GT-I9300"
        }
      ],
      "dpi": [
        304.8,
        303.9
      ],
      "bw": 5,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-T230NU/*"
        },
        {
          "ua": "SM-T230NU"
        }
      ],
      "dpi": 216,
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SGH-T399/*"
        },
        {
          "ua": "SGH-T399"
        }
      ],
      "dpi": [
        217.7,
        231.4
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SGH-M919/*"
        },
        {
          "ua": "SGH-M919"
        }
      ],
      "dpi": [
        440.8,
        437.7
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-N9005/*"
        },
        {
          "ua": "SM-N9005"
        }
      ],
      "dpi": [
        386.4,
        387
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SAMSUNG-SM-N900A/*"
        },
        {
          "ua": "SAMSUNG-SM-N900A"
        }
      ],
      "dpi": [
        386.4,
        387.7
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/GT-I9500/*"
        },
        {
          "ua": "GT-I9500"
        }
      ],
      "dpi": [
        442.5,
        443.3
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/GT-I9505/*"
        },
        {
          "ua": "GT-I9505"
        }
      ],
      "dpi": 439.4,
      "bw": 4,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-G900F/*"
        },
        {
          "ua": "SM-G900F"
        }
      ],
      "dpi": [
        415.6,
        431.6
      ],
      "bw": 5,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-G900M/*"
        },
        {
          "ua": "SM-G900M"
        }
      ],
      "dpi": [
        415.6,
        431.6
      ],
      "bw": 5,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-G800F/*"
        },
        {
          "ua": "SM-G800F"
        }
      ],
      "dpi": 326.8,
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-G906S/*"
        },
        {
          "ua": "SM-G906S"
        }
      ],
      "dpi": [
        562.7,
        572.4
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/GT-I9300/*"
        },
        {
          "ua": "GT-I9300"
        }
      ],
      "dpi": [
        306.7,
        304.8
      ],
      "bw": 5,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-T535/*"
        },
        {
          "ua": "SM-T535"
        }
      ],
      "dpi": [
        142.6,
        136.4
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-N920C/*"
        },
        {
          "ua": "SM-N920C"
        }
      ],
      "dpi": [
        515.1,
        518.4
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-N920W8/*"
        },
        {
          "ua": "SM-N920W8"
        }
      ],
      "dpi": [
        515.1,
        518.4
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/GT-I9300I/*"
        },
        {
          "ua": "GT-I9300I"
        }
      ],
      "dpi": [
        304.8,
        305.8
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/GT-I9195/*"
        },
        {
          "ua": "GT-I9195"
        }
      ],
      "dpi": [
        249.4,
        256.7
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SPH-L520/*"
        },
        {
          "ua": "SPH-L520"
        }
      ],
      "dpi": [
        249.4,
        255.9
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SAMSUNG-SGH-I717/*"
        },
        {
          "ua": "SAMSUNG-SGH-I717"
        }
      ],
      "dpi": 285.8,
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SPH-D710/*"
        },
        {
          "ua": "SPH-D710"
        }
      ],
      "dpi": [
        217.7,
        204.2
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/GT-N7100/*"
        },
        {
          "ua": "GT-N7100"
        }
      ],
      "dpi": 265.1,
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SCH-I605/*"
        },
        {
          "ua": "SCH-I605"
        }
      ],
      "dpi": 265.1,
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/Galaxy Nexus/*"
        },
        {
          "ua": "Galaxy Nexus"
        }
      ],
      "dpi": [
        315.3,
        314.2
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-N910H/*"
        },
        {
          "ua": "SM-N910H"
        }
      ],
      "dpi": [
        515.1,
        518
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-N910C/*"
        },
        {
          "ua": "SM-N910C"
        }
      ],
      "dpi": [
        515.2,
        520.2
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-G130M/*"
        },
        {
          "ua": "SM-G130M"
        }
      ],
      "dpi": [
        165.9,
        164.8
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-G928I/*"
        },
        {
          "ua": "SM-G928I"
        }
      ],
      "dpi": [
        515.1,
        518.4
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-G920F/*"
        },
        {
          "ua": "SM-G920F"
        }
      ],
      "dpi": 580.6,
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-G920P/*"
        },
        {
          "ua": "SM-G920P"
        }
      ],
      "dpi": [
        522.5,
        577
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-G925F/*"
        },
        {
          "ua": "SM-G925F"
        }
      ],
      "dpi": 580.6,
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-G925V/*"
        },
        {
          "ua": "SM-G925V"
        }
      ],
      "dpi": [
        522.5,
        576.6
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-G930F/*"
        },
        {
          "ua": "SM-G930F"
        }
      ],
      "dpi": 576.6,
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "samsung/*/SM-G935F/*"
        },
        {
          "ua": "SM-G935F"
        }
      ],
      "dpi": 533,
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "Sony/*/C6903/*"
        },
        {
          "ua": "C6903"
        }
      ],
      "dpi": [
        442.5,
        443.3
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "Sony/*/D6653/*"
        },
        {
          "ua": "D6653"
        }
      ],
      "dpi": [
        428.6,
        427.6
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "Sony/*/E6653/*"
        },
        {
          "ua": "E6653"
        }
      ],
      "dpi": [
        428.6,
        425.7
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "Sony/*/E6853/*"
        },
        {
          "ua": "E6853"
        }
      ],
      "dpi": [
        403.4,
        401.9
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "Sony/*/SGP321/*"
        },
        {
          "ua": "SGP321"
        }
      ],
      "dpi": [
        224.7,
        224.1
      ],
      "bw": 3,
      "ac": 500
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "TCT/*/ALCATEL ONE TOUCH Fierce/*"
        },
        {
          "ua": "ALCATEL ONE TOUCH Fierce"
        }
      ],
      "dpi": [
        240,
        247.5
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "THL/*/thl 5000/*"
        },
        {
          "ua": "thl 5000"
        }
      ],
      "dpi": [
        480,
        443.3
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "android",
      "rules": [
        {
          "mdmh": "ZTE/*/ZTE Blade L2/*"
        },
        {
          "ua": "ZTE Blade L2"
        }
      ],
      "dpi": 240,
      "bw": 3,
      "ac": 500
    },
    {
      "type": "ios",
      "rules": [
        {
          "res": [
            640,
            960
          ]
        }
      ],
      "dpi": [
        325.1,
        328.4
      ],
      "bw": 4,
      "ac": 1000
    },
    {
      "type": "ios",
      "rules": [
        {
          "res": [
            640,
            1136
          ]
        }
      ],
      "dpi": [
        317.1,
        320.2
      ],
      "bw": 3,
      "ac": 1000
    },
    {
      "type": "ios",
      "rules": [
        {
          "res": [
            750,
            1334
          ]
        }
      ],
      "dpi": 326.4,
      "bw": 4,
      "ac": 1000
    },
    {
      "type": "ios",
      "rules": [
        {
          "res": [
            1242,
            2208
          ]
        }
      ],
      "dpi": [
        453.6,
        458.4
      ],
      "bw": 4,
      "ac": 1000
    },
    {
      "type": "ios",
      "rules": [
        {
          "res": [
            1125,
            2001
          ]
        }
      ],
      "dpi": [
        410.9,
        415.4
      ],
      "bw": 4,
      "ac": 1000
    }
  ]
}
},{}],18:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Offline cache of the DPDB, to be used until we load the online one (and
// as a fallback in case we can't load the online one).
var DPDB_CACHE = _dereq_('./dpdb.json');
var Util = _dereq_('../util.js');

// Online DPDB URL.
var ONLINE_DPDB_URL =
  'https://dpdb.webvr.rocks/dpdb.json';

/**
 * Calculates device parameters based on the DPDB (Device Parameter Database).
 * Initially, uses the cached DPDB values.
 *
 * If fetchOnline == true, then this object tries to fetch the online version
 * of the DPDB and updates the device info if a better match is found.
 * Calls the onDeviceParamsUpdated callback when there is an update to the
 * device information.
 */
function Dpdb(fetchOnline, onDeviceParamsUpdated) {
  // Start with the offline DPDB cache while we are loading the real one.
  this.dpdb = DPDB_CACHE;

  // Calculate device params based on the offline version of the DPDB.
  this.recalculateDeviceParams_();

  // XHR to fetch online DPDB file, if requested.
  if (fetchOnline) {
    // Set the callback.
    this.onDeviceParamsUpdated = onDeviceParamsUpdated;

    var xhr = new XMLHttpRequest();
    var obj = this;
    xhr.open('GET', ONLINE_DPDB_URL, true);
    xhr.addEventListener('load', function() {
      obj.loading = false;
      if (xhr.status >= 200 && xhr.status <= 299) {
        // Success.
        obj.dpdb = JSON.parse(xhr.response);
        obj.recalculateDeviceParams_();
      } else {
        // Error loading the DPDB.
        console.error('Error loading online DPDB!');
      }
    });
    xhr.send();
  }
}

// Returns the current device parameters.
Dpdb.prototype.getDeviceParams = function() {
  return this.deviceParams;
};

// Recalculates this device's parameters based on the DPDB.
Dpdb.prototype.recalculateDeviceParams_ = function() {
  var newDeviceParams = this.calcDeviceParams_();
  if (newDeviceParams) {
    this.deviceParams = newDeviceParams;
    // Invoke callback, if it is set.
    if (this.onDeviceParamsUpdated) {
      this.onDeviceParamsUpdated(this.deviceParams);
    }
  } else {
    console.error('Failed to recalculate device parameters.');
  }
};

// Returns a DeviceParams object that represents the best guess as to this
// device's parameters. Can return null if the device does not match any
// known devices.
Dpdb.prototype.calcDeviceParams_ = function() {
  var db = this.dpdb; // shorthand
  if (!db) {
    console.error('DPDB not available.');
    return null;
  }
  if (db.format != 1) {
    console.error('DPDB has unexpected format version.');
    return null;
  }
  if (!db.devices || !db.devices.length) {
    console.error('DPDB does not have a devices section.');
    return null;
  }

  // Get the actual user agent and screen dimensions in pixels.
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  var width = Util.getScreenWidth();
  var height = Util.getScreenHeight();

  if (!db.devices) {
    console.error('DPDB has no devices section.');
    return null;
  }

  for (var i = 0; i < db.devices.length; i++) {
    var device = db.devices[i];
    if (!device.rules) {
      console.warn('Device[' + i + '] has no rules section.');
      continue;
    }

    if (device.type != 'ios' && device.type != 'android') {
      console.warn('Device[' + i + '] has invalid type.');
      continue;
    }

    // See if this device is of the appropriate type.
    if (Util.isIOS() != (device.type == 'ios')) continue;

    // See if this device matches any of the rules:
    var matched = false;
    for (var j = 0; j < device.rules.length; j++) {
      var rule = device.rules[j];
      if (this.matchRule_(rule, userAgent, width, height)) {
        matched = true;
        break;
      }
    }
    if (!matched) continue;

    // device.dpi might be an array of [ xdpi, ydpi] or just a scalar.
    var xdpi = device.dpi[0] || device.dpi;
    var ydpi = device.dpi[1] || device.dpi;

    return new DeviceParams({ xdpi: xdpi, ydpi: ydpi, bevelMm: device.bw });
  }

  console.warn('No DPDB device match.');
  return null;
};

Dpdb.prototype.matchRule_ = function(rule, ua, screenWidth, screenHeight) {
  // We can only match 'ua' and 'res' rules, not other types like 'mdmh'
  // (which are meant for native platforms).
  if (!rule.ua && !rule.res) return false;

  // If our user agent string doesn't contain the indicated user agent string,
  // the match fails.
  if (rule.ua && ua.indexOf(rule.ua) < 0) return false;

  // If the rule specifies screen dimensions that don't correspond to ours,
  // the match fails.
  if (rule.res) {
    if (!rule.res[0] || !rule.res[1]) return false;
    var resX = rule.res[0];
    var resY = rule.res[1];
    // Compare min and max so as to make the order not matter, i.e., it should
    // be true that 640x480 == 480x640.
    if (Math.min(screenWidth, screenHeight) != Math.min(resX, resY) ||
        (Math.max(screenWidth, screenHeight) != Math.max(resX, resY))) {
      return false;
    }
  }

  return true;
}

function DeviceParams(params) {
  this.xdpi = params.xdpi;
  this.ydpi = params.ydpi;
  this.bevelMm = params.bevelMm;
}

module.exports = Dpdb;

},{"../util.js":29,"./dpdb.json":17}],19:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Util = _dereq_('./util.js');
var WebVRPolyfill = _dereq_('./webvr-polyfill.js').WebVRPolyfill;

// Initialize a WebVRConfig just in case.
window.WebVRConfig = Util.extend({
  // Forces availability of VR mode, even for non-mobile devices.
  FORCE_ENABLE_VR: false,

  // Complementary filter coefficient. 0 for accelerometer, 1 for gyro.
  K_FILTER: 0.98,

  // How far into the future to predict during fast motion (in seconds).
  PREDICTION_TIME_S: 0.040,

  // Flag to enable touch panner. In case you have your own touch controls.
  TOUCH_PANNER_DISABLED: true,

  // Flag to disabled the UI in VR Mode.
  CARDBOARD_UI_DISABLED: false, // Default: false

  // Flag to disable the instructions to rotate your device.
  ROTATE_INSTRUCTIONS_DISABLED: false, // Default: false.

  // Enable yaw panning only, disabling roll and pitch. This can be useful
  // for panoramas with nothing interesting above or below.
  YAW_ONLY: false,

  // To disable keyboard and mouse controls, if you want to use your own
  // implementation.
  MOUSE_KEYBOARD_CONTROLS_DISABLED: false,

  // Prevent the polyfill from initializing immediately. Requires the app
  // to call InitializeWebVRPolyfill() before it can be used.
  DEFER_INITIALIZATION: false,

  // Enable the deprecated version of the API (navigator.getVRDevices).
  ENABLE_DEPRECATED_API: false,

  // Scales the recommended buffer size reported by WebVR, which can improve
  // performance.
  // UPDATE(2016-05-03): Setting this to 0.5 by default since 1.0 does not
  // perform well on many mobile devices.
  BUFFER_SCALE: 0.5,

  // Allow VRDisplay.submitFrame to change gl bindings, which is more
  // efficient if the application code will re-bind its resources on the
  // next frame anyway. This has been seen to cause rendering glitches with
  // THREE.js.
  // Dirty bindings include: gl.FRAMEBUFFER_BINDING, gl.CURRENT_PROGRAM,
  // gl.ARRAY_BUFFER_BINDING, gl.ELEMENT_ARRAY_BUFFER_BINDING,
  // and gl.TEXTURE_BINDING_2D for texture unit 0.
  DIRTY_SUBMIT_FRAME_BINDINGS: false,

  // When set to true, this will cause a polyfilled VRDisplay to always be
  // appended to the list returned by navigator.getVRDisplays(), even if that
  // list includes a native VRDisplay.
  ALWAYS_APPEND_POLYFILL_DISPLAY: false,

  // There are versions of Chrome (M58-M60?) where the native WebVR API exists,
  // and instead of returning 0 VR displays when none are detected,
  // `navigator.getVRDisplays()`'s promise never resolves. This results
  // in the polyfill hanging and not being able to provide fallback
  // displays, so set a timeout in milliseconds to stop waiting for a response
  // and just use polyfilled displays.
  // https://bugs.chromium.org/p/chromium/issues/detail?id=727969
  GET_VR_DISPLAYS_TIMEOUT: 1000,
}, window.WebVRConfig);

if (!window.WebVRConfig.DEFER_INITIALIZATION) {
  new WebVRPolyfill();
} else {
  window.InitializeWebVRPolyfill = function() {
    new WebVRPolyfill();
  }
}

window.WebVRPolyfill = WebVRPolyfill;

},{"./util.js":29,"./webvr-polyfill.js":32}],20:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var MathUtil = window.MathUtil || {};

MathUtil.degToRad = Math.PI / 180;
MathUtil.radToDeg = 180 / Math.PI;

// Some minimal math functionality borrowed from THREE.Math and stripped down
// for the purposes of this library.


MathUtil.Vector2 = function ( x, y ) {
  this.x = x || 0;
  this.y = y || 0;
};

MathUtil.Vector2.prototype = {
  constructor: MathUtil.Vector2,

  set: function ( x, y ) {
    this.x = x;
    this.y = y;

    return this;
  },

  copy: function ( v ) {
    this.x = v.x;
    this.y = v.y;

    return this;
  },

  subVectors: function ( a, b ) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;

    return this;
  },
};

MathUtil.Vector3 = function ( x, y, z ) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
};

MathUtil.Vector3.prototype = {
  constructor: MathUtil.Vector3,

  set: function ( x, y, z ) {
    this.x = x;
    this.y = y;
    this.z = z;

    return this;
  },

  copy: function ( v ) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;

    return this;
  },

  length: function () {
    return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );
  },

  normalize: function () {
    var scalar = this.length();

    if ( scalar !== 0 ) {
      var invScalar = 1 / scalar;

      this.multiplyScalar(invScalar);
    } else {
      this.x = 0;
      this.y = 0;
      this.z = 0;
    }

    return this;
  },

  multiplyScalar: function ( scalar ) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
  },

  applyQuaternion: function ( q ) {
    var x = this.x;
    var y = this.y;
    var z = this.z;

    var qx = q.x;
    var qy = q.y;
    var qz = q.z;
    var qw = q.w;

    // calculate quat * vector
    var ix =  qw * x + qy * z - qz * y;
    var iy =  qw * y + qz * x - qx * z;
    var iz =  qw * z + qx * y - qy * x;
    var iw = - qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
    this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
    this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

    return this;
  },

  dot: function ( v ) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },

  crossVectors: function ( a, b ) {
    var ax = a.x, ay = a.y, az = a.z;
    var bx = b.x, by = b.y, bz = b.z;

    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;

    return this;
  },
};

MathUtil.Quaternion = function ( x, y, z, w ) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
  this.w = ( w !== undefined ) ? w : 1;
};

MathUtil.Quaternion.prototype = {
  constructor: MathUtil.Quaternion,

  set: function ( x, y, z, w ) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;

    return this;
  },

  copy: function ( quaternion ) {
    this.x = quaternion.x;
    this.y = quaternion.y;
    this.z = quaternion.z;
    this.w = quaternion.w;

    return this;
  },

  setFromEulerXYZ: function( x, y, z ) {
    var c1 = Math.cos( x / 2 );
    var c2 = Math.cos( y / 2 );
    var c3 = Math.cos( z / 2 );
    var s1 = Math.sin( x / 2 );
    var s2 = Math.sin( y / 2 );
    var s3 = Math.sin( z / 2 );

    this.x = s1 * c2 * c3 + c1 * s2 * s3;
    this.y = c1 * s2 * c3 - s1 * c2 * s3;
    this.z = c1 * c2 * s3 + s1 * s2 * c3;
    this.w = c1 * c2 * c3 - s1 * s2 * s3;

    return this;
  },

  setFromEulerYXZ: function( x, y, z ) {
    var c1 = Math.cos( x / 2 );
    var c2 = Math.cos( y / 2 );
    var c3 = Math.cos( z / 2 );
    var s1 = Math.sin( x / 2 );
    var s2 = Math.sin( y / 2 );
    var s3 = Math.sin( z / 2 );

    this.x = s1 * c2 * c3 + c1 * s2 * s3;
    this.y = c1 * s2 * c3 - s1 * c2 * s3;
    this.z = c1 * c2 * s3 - s1 * s2 * c3;
    this.w = c1 * c2 * c3 + s1 * s2 * s3;

    return this;
  },

  setFromAxisAngle: function ( axis, angle ) {
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
    // assumes axis is normalized

    var halfAngle = angle / 2, s = Math.sin( halfAngle );

    this.x = axis.x * s;
    this.y = axis.y * s;
    this.z = axis.z * s;
    this.w = Math.cos( halfAngle );

    return this;
  },

  multiply: function ( q ) {
    return this.multiplyQuaternions( this, q );
  },

  multiplyQuaternions: function ( a, b ) {
    // from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

    var qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
    var qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

    this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

    return this;
  },

  inverse: function () {
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;

    this.normalize();

    return this;
  },

  normalize: function () {
    var l = Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w );

    if ( l === 0 ) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 1;
    } else {
      l = 1 / l;

      this.x = this.x * l;
      this.y = this.y * l;
      this.z = this.z * l;
      this.w = this.w * l;
    }

    return this;
  },

  slerp: function ( qb, t ) {
    if ( t === 0 ) return this;
    if ( t === 1 ) return this.copy( qb );

    var x = this.x, y = this.y, z = this.z, w = this.w;

    // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

    var cosHalfTheta = w * qb.w + x * qb.x + y * qb.y + z * qb.z;

    if ( cosHalfTheta < 0 ) {
      this.w = - qb.w;
      this.x = - qb.x;
      this.y = - qb.y;
      this.z = - qb.z;

      cosHalfTheta = - cosHalfTheta;
    } else {
      this.copy( qb );
    }

    if ( cosHalfTheta >= 1.0 ) {
      this.w = w;
      this.x = x;
      this.y = y;
      this.z = z;

      return this;
    }

    var halfTheta = Math.acos( cosHalfTheta );
    var sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

    if ( Math.abs( sinHalfTheta ) < 0.001 ) {
      this.w = 0.5 * ( w + this.w );
      this.x = 0.5 * ( x + this.x );
      this.y = 0.5 * ( y + this.y );
      this.z = 0.5 * ( z + this.z );

      return this;
    }

    var ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta,
    ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;

    this.w = ( w * ratioA + this.w * ratioB );
    this.x = ( x * ratioA + this.x * ratioB );
    this.y = ( y * ratioA + this.y * ratioB );
    this.z = ( z * ratioA + this.z * ratioB );

    return this;
  },

  setFromUnitVectors: function () {
    // http://lolengine.net/blog/2014/02/24/quaternion-from-two-vectors-final
    // assumes direction vectors vFrom and vTo are normalized

    var v1, r;
    var EPS = 0.000001;

    return function ( vFrom, vTo ) {
      if ( v1 === undefined ) v1 = new MathUtil.Vector3();

      r = vFrom.dot( vTo ) + 1;

      if ( r < EPS ) {
        r = 0;

        if ( Math.abs( vFrom.x ) > Math.abs( vFrom.z ) ) {
          v1.set( - vFrom.y, vFrom.x, 0 );
        } else {
          v1.set( 0, - vFrom.z, vFrom.y );
        }
      } else {
        v1.crossVectors( vFrom, vTo );
      }

      this.x = v1.x;
      this.y = v1.y;
      this.z = v1.z;
      this.w = r;

      this.normalize();

      return this;
    }
  }(),
};

module.exports = MathUtil;

},{}],21:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var VRDisplay = _dereq_('./base.js').VRDisplay;
var MathUtil = _dereq_('./math-util.js');
var Util = _dereq_('./util.js');

// How much to rotate per key stroke.
var KEY_SPEED = 0.15;
var KEY_ANIMATION_DURATION = 80;

// How much to rotate for mouse events.
var MOUSE_SPEED_X = 0.5;
var MOUSE_SPEED_Y = 0.3;

/**
 * VRDisplay based on mouse and keyboard input. Designed for desktops/laptops
 * where orientation events aren't supported. Cannot present.
 */
function MouseKeyboardVRDisplay() {
  this.displayName = 'Mouse and Keyboard VRDisplay (webvr-polyfill)';

  this.capabilities.hasOrientation = true;

  // Attach to mouse and keyboard events.
  window.addEventListener('keydown', this.onKeyDown_.bind(this));
  window.addEventListener('mousemove', this.onMouseMove_.bind(this));
  window.addEventListener('mousedown', this.onMouseDown_.bind(this));
  window.addEventListener('mouseup', this.onMouseUp_.bind(this));

  // "Private" members.
  this.phi_ = 0;
  this.theta_ = 0;

  // Variables for keyboard-based rotation animation.
  this.targetAngle_ = null;
  this.angleAnimation_ = null;

  // State variables for calculations.
  this.orientation_ = new MathUtil.Quaternion();

  // Variables for mouse-based rotation.
  this.rotateStart_ = new MathUtil.Vector2();
  this.rotateEnd_ = new MathUtil.Vector2();
  this.rotateDelta_ = new MathUtil.Vector2();
  this.isDragging_ = false;

  this.orientationOut_ = new Float32Array(4);
}
MouseKeyboardVRDisplay.prototype = new VRDisplay();

MouseKeyboardVRDisplay.prototype.getImmediatePose = function() {
  this.orientation_.setFromEulerYXZ(this.phi_, this.theta_, 0);

  this.orientationOut_[0] = this.orientation_.x;
  this.orientationOut_[1] = this.orientation_.y;
  this.orientationOut_[2] = this.orientation_.z;
  this.orientationOut_[3] = this.orientation_.w;

  return {
    position: null,
    orientation: this.orientationOut_,
    linearVelocity: null,
    linearAcceleration: null,
    angularVelocity: null,
    angularAcceleration: null
  };
};

MouseKeyboardVRDisplay.prototype.onKeyDown_ = function(e) {
  // Track WASD and arrow keys.
  if (e.keyCode == 38) { // Up key.
    this.animatePhi_(this.phi_ + KEY_SPEED);
  } else if (e.keyCode == 39) { // Right key.
    this.animateTheta_(this.theta_ - KEY_SPEED);
  } else if (e.keyCode == 40) { // Down key.
    this.animatePhi_(this.phi_ - KEY_SPEED);
  } else if (e.keyCode == 37) { // Left key.
    this.animateTheta_(this.theta_ + KEY_SPEED);
  }
};

MouseKeyboardVRDisplay.prototype.animateTheta_ = function(targetAngle) {
  this.animateKeyTransitions_('theta_', targetAngle);
};

MouseKeyboardVRDisplay.prototype.animatePhi_ = function(targetAngle) {
  // Prevent looking too far up or down.
  targetAngle = Util.clamp(targetAngle, -Math.PI/2, Math.PI/2);
  this.animateKeyTransitions_('phi_', targetAngle);
};

/**
 * Start an animation to transition an angle from one value to another.
 */
MouseKeyboardVRDisplay.prototype.animateKeyTransitions_ = function(angleName, targetAngle) {
  // If an animation is currently running, cancel it.
  if (this.angleAnimation_) {
    cancelAnimationFrame(this.angleAnimation_);
  }
  var startAngle = this[angleName];
  var startTime = new Date();
  // Set up an interval timer to perform the animation.
  this.angleAnimation_ = requestAnimationFrame(function animate() {
    // Once we're finished the animation, we're done.
    var elapsed = new Date() - startTime;
    if (elapsed >= KEY_ANIMATION_DURATION) {
      this[angleName] = targetAngle;
      cancelAnimationFrame(this.angleAnimation_);
      return;
    }
    // loop with requestAnimationFrame
    this.angleAnimation_ = requestAnimationFrame(animate.bind(this))
    // Linearly interpolate the angle some amount.
    var percent = elapsed / KEY_ANIMATION_DURATION;
    this[angleName] = startAngle + (targetAngle - startAngle) * percent;
  }.bind(this));
};

MouseKeyboardVRDisplay.prototype.onMouseDown_ = function(e) {
  this.rotateStart_.set(e.clientX, e.clientY);
  this.isDragging_ = true;
};

// Very similar to https://gist.github.com/mrflix/8351020
MouseKeyboardVRDisplay.prototype.onMouseMove_ = function(e) {
  if (!this.isDragging_ && !this.isPointerLocked_()) {
    return;
  }
  // Support pointer lock API.
  if (this.isPointerLocked_()) {
    var movementX = e.movementX || e.mozMovementX || 0;
    var movementY = e.movementY || e.mozMovementY || 0;
    this.rotateEnd_.set(this.rotateStart_.x - movementX, this.rotateStart_.y - movementY);
  } else {
    this.rotateEnd_.set(e.clientX, e.clientY);
  }
  // Calculate how much we moved in mouse space.
  this.rotateDelta_.subVectors(this.rotateEnd_, this.rotateStart_);
  this.rotateStart_.copy(this.rotateEnd_);

  // Keep track of the cumulative euler angles.
  this.phi_ += 2 * Math.PI * this.rotateDelta_.y / screen.height * MOUSE_SPEED_Y;
  this.theta_ += 2 * Math.PI * this.rotateDelta_.x / screen.width * MOUSE_SPEED_X;

  // Prevent looking too far up or down.
  this.phi_ = Util.clamp(this.phi_, -Math.PI/2, Math.PI/2);
};

MouseKeyboardVRDisplay.prototype.onMouseUp_ = function(e) {
  this.isDragging_ = false;
};

MouseKeyboardVRDisplay.prototype.isPointerLocked_ = function() {
  var el = document.pointerLockElement || document.mozPointerLockElement ||
      document.webkitPointerLockElement;
  return el !== undefined;
};

MouseKeyboardVRDisplay.prototype.resetPose = function() {
  this.phi_ = 0;
  this.theta_ = 0;
};

module.exports = MouseKeyboardVRDisplay;

},{"./base.js":9,"./math-util.js":20,"./util.js":29}],22:[function(_dereq_,module,exports){
(function (global){
// This is the entry point if requiring/importing via node, or
// a build tool that uses package.json entry (like browserify, webpack).
// If running in node with a window mock available, globalize its members
// if needed. Otherwise, just continue to `./main`
if (typeof global !== 'undefined' && global.window) {
  global.document = global.window.document;
  global.navigator = global.window.navigator;
}

_dereq_('./main');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./main":19}],23:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Util = _dereq_('./util.js');

function RotateInstructions() {
  this.loadIcon_();

  var overlay = document.createElement('div');
  var s = overlay.style;
  s.position = 'fixed';
  s.top = 0;
  s.right = 0;
  s.bottom = 0;
  s.left = 0;
  s.backgroundColor = 'gray';
  s.fontFamily = 'sans-serif';
  // Force this to be above the fullscreen canvas, which is at zIndex: 999999.
  s.zIndex = 1000000;

  var img = document.createElement('img');
  img.src = this.icon;
  var s = img.style;
  s.marginLeft = '25%';
  s.marginTop = '25%';
  s.width = '50%';
  overlay.appendChild(img);

  var text = document.createElement('div');
  var s = text.style;
  s.textAlign = 'center';
  s.fontSize = '16px';
  s.lineHeight = '24px';
  s.margin = '24px 25%';
  s.width = '50%';
  text.innerHTML = 'Place your phone into your Cardboard viewer.';
  overlay.appendChild(text);

  var snackbar = document.createElement('div');
  var s = snackbar.style;
  s.backgroundColor = '#CFD8DC';
  s.position = 'fixed';
  s.bottom = 0;
  s.width = '100%';
  s.height = '48px';
  s.padding = '14px 24px';
  s.boxSizing = 'border-box';
  s.color = '#656A6B';
  overlay.appendChild(snackbar);

  var snackbarText = document.createElement('div');
  snackbarText.style.float = 'left';
  snackbarText.innerHTML = 'No Cardboard viewer?';

  var snackbarButton = document.createElement('a');
  snackbarButton.href = 'https://www.google.com/get/cardboard/get-cardboard/';
  snackbarButton.innerHTML = 'get one';
  snackbarButton.target = '_blank';
  var s = snackbarButton.style;
  s.float = 'right';
  s.fontWeight = 600;
  s.textTransform = 'uppercase';
  s.borderLeft = '1px solid gray';
  s.paddingLeft = '24px';
  s.textDecoration = 'none';
  s.color = '#656A6B';

  snackbar.appendChild(snackbarText);
  snackbar.appendChild(snackbarButton);

  this.overlay = overlay;
  this.text = text;

  this.hide();
}

RotateInstructions.prototype.show = function(parent) {
  if (!parent && !this.overlay.parentElement) {
    document.body.appendChild(this.overlay);
  } else if (parent) {
    if (this.overlay.parentElement && this.overlay.parentElement != parent)
      this.overlay.parentElement.removeChild(this.overlay);

    parent.appendChild(this.overlay);
  }

  this.overlay.style.display = 'block';

  var img = this.overlay.querySelector('img');
  var s = img.style;

  if (Util.isLandscapeMode()) {
    s.width = '20%';
    s.marginLeft = '40%';
    s.marginTop = '3%';
  } else {
    s.width = '50%';
    s.marginLeft = '25%';
    s.marginTop = '25%';
  }
};

RotateInstructions.prototype.hide = function() {
  this.overlay.style.display = 'none';
};

RotateInstructions.prototype.showTemporarily = function(ms, parent) {
  this.show(parent);
  this.timer = setTimeout(this.hide.bind(this), ms);
};

RotateInstructions.prototype.disableShowTemporarily = function() {
  clearTimeout(this.timer);
};

RotateInstructions.prototype.update = function() {
  this.disableShowTemporarily();
  // In portrait VR mode, tell the user to rotate to landscape. Otherwise, hide
  // the instructions.
  if (!Util.isLandscapeMode() && Util.isMobile()) {
    this.show();
  } else {
    this.hide();
  }
};

RotateInstructions.prototype.loadIcon_ = function() {
  // Encoded asset_src/rotate-instructions.svg
  this.icon = Util.base64('image/svg+xml', 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjE5OHB4IiBoZWlnaHQ9IjI0MHB4IiB2aWV3Qm94PSIwIDAgMTk4IDI0MCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpza2V0Y2g9Imh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9ucyI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDMuMy4zICgxMjA4MSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+dHJhbnNpdGlvbjwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHNrZXRjaDp0eXBlPSJNU1BhZ2UiPgogICAgICAgIDxnIGlkPSJ0cmFuc2l0aW9uIiBza2V0Y2g6dHlwZT0iTVNBcnRib2FyZEdyb3VwIj4KICAgICAgICAgICAgPGcgaWQ9IkltcG9ydGVkLUxheWVycy1Db3B5LTQtKy1JbXBvcnRlZC1MYXllcnMtQ29weS0rLUltcG9ydGVkLUxheWVycy1Db3B5LTItQ29weSIgc2tldGNoOnR5cGU9Ik1TTGF5ZXJHcm91cCI+CiAgICAgICAgICAgICAgICA8ZyBpZD0iSW1wb3J0ZWQtTGF5ZXJzLUNvcHktNCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsIDEwNy4wMDAwMDApIiBza2V0Y2g6dHlwZT0iTVNTaGFwZUdyb3VwIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTQ5LjYyNSwyLjUyNyBDMTQ5LjYyNSwyLjUyNyAxNTUuODA1LDYuMDk2IDE1Ni4zNjIsNi40MTggTDE1Ni4zNjIsNy4zMDQgQzE1Ni4zNjIsNy40ODEgMTU2LjM3NSw3LjY2NCAxNTYuNCw3Ljg1MyBDMTU2LjQxLDcuOTM0IDE1Ni40Miw4LjAxNSAxNTYuNDI3LDguMDk1IEMxNTYuNTY3LDkuNTEgMTU3LjQwMSwxMS4wOTMgMTU4LjUzMiwxMi4wOTQgTDE2NC4yNTIsMTcuMTU2IEwxNjQuMzMzLDE3LjA2NiBDMTY0LjMzMywxNy4wNjYgMTY4LjcxNSwxNC41MzYgMTY5LjU2OCwxNC4wNDIgQzE3MS4wMjUsMTQuODgzIDE5NS41MzgsMjkuMDM1IDE5NS41MzgsMjkuMDM1IEwxOTUuNTM4LDgzLjAzNiBDMTk1LjUzOCw4My44MDcgMTk1LjE1Miw4NC4yNTMgMTk0LjU5LDg0LjI1MyBDMTk0LjM1Nyw4NC4yNTMgMTk0LjA5NSw4NC4xNzcgMTkzLjgxOCw4NC4wMTcgTDE2OS44NTEsNzAuMTc5IEwxNjkuODM3LDcwLjIwMyBMMTQyLjUxNSw4NS45NzggTDE0MS42NjUsODQuNjU1IEMxMzYuOTM0LDgzLjEyNiAxMzEuOTE3LDgxLjkxNSAxMjYuNzE0LDgxLjA0NSBDMTI2LjcwOSw4MS4wNiAxMjYuNzA3LDgxLjA2OSAxMjYuNzA3LDgxLjA2OSBMMTIxLjY0LDk4LjAzIEwxMTMuNzQ5LDEwMi41ODYgTDExMy43MTIsMTAyLjUyMyBMMTEzLjcxMiwxMzAuMTEzIEMxMTMuNzEyLDEzMC44ODUgMTEzLjMyNiwxMzEuMzMgMTEyLjc2NCwxMzEuMzMgQzExMi41MzIsMTMxLjMzIDExMi4yNjksMTMxLjI1NCAxMTEuOTkyLDEzMS4wOTQgTDY5LjUxOSwxMDYuNTcyIEM2OC41NjksMTA2LjAyMyA2Ny43OTksMTA0LjY5NSA2Ny43OTksMTAzLjYwNSBMNjcuNzk5LDEwMi41NyBMNjcuNzc4LDEwMi42MTcgQzY3LjI3LDEwMi4zOTMgNjYuNjQ4LDEwMi4yNDkgNjUuOTYyLDEwMi4yMTggQzY1Ljg3NSwxMDIuMjE0IDY1Ljc4OCwxMDIuMjEyIDY1LjcwMSwxMDIuMjEyIEM2NS42MDYsMTAyLjIxMiA2NS41MTEsMTAyLjIxNSA2NS40MTYsMTAyLjIxOSBDNjUuMTk1LDEwMi4yMjkgNjQuOTc0LDEwMi4yMzUgNjQuNzU0LDEwMi4yMzUgQzY0LjMzMSwxMDIuMjM1IDYzLjkxMSwxMDIuMjE2IDYzLjQ5OCwxMDIuMTc4IEM2MS44NDMsMTAyLjAyNSA2MC4yOTgsMTAxLjU3OCA1OS4wOTQsMTAwLjg4MiBMMTIuNTE4LDczLjk5MiBMMTIuNTIzLDc0LjAwNCBMMi4yNDUsNTUuMjU0IEMxLjI0NCw1My40MjcgMi4wMDQsNTEuMDM4IDMuOTQzLDQ5LjkxOCBMNTkuOTU0LDE3LjU3MyBDNjAuNjI2LDE3LjE4NSA2MS4zNSwxNy4wMDEgNjIuMDUzLDE3LjAwMSBDNjMuMzc5LDE3LjAwMSA2NC42MjUsMTcuNjYgNjUuMjgsMTguODU0IEw2NS4yODUsMTguODUxIEw2NS41MTIsMTkuMjY0IEw2NS41MDYsMTkuMjY4IEM2NS45MDksMjAuMDAzIDY2LjQwNSwyMC42OCA2Ni45ODMsMjEuMjg2IEw2Ny4yNiwyMS41NTYgQzY5LjE3NCwyMy40MDYgNzEuNzI4LDI0LjM1NyA3NC4zNzMsMjQuMzU3IEM3Ni4zMjIsMjQuMzU3IDc4LjMyMSwyMy44NCA4MC4xNDgsMjIuNzg1IEM4MC4xNjEsMjIuNzg1IDg3LjQ2NywxOC41NjYgODcuNDY3LDE4LjU2NiBDODguMTM5LDE4LjE3OCA4OC44NjMsMTcuOTk0IDg5LjU2NiwxNy45OTQgQzkwLjg5MiwxNy45OTQgOTIuMTM4LDE4LjY1MiA5Mi43OTIsMTkuODQ3IEw5Ni4wNDIsMjUuNzc1IEw5Ni4wNjQsMjUuNzU3IEwxMDIuODQ5LDI5LjY3NCBMMTAyLjc0NCwyOS40OTIgTDE0OS42MjUsMi41MjcgTTE0OS42MjUsMC44OTIgQzE0OS4zNDMsMC44OTIgMTQ5LjA2MiwwLjk2NSAxNDguODEsMS4xMSBMMTAyLjY0MSwyNy42NjYgTDk3LjIzMSwyNC41NDIgTDk0LjIyNiwxOS4wNjEgQzkzLjMxMywxNy4zOTQgOTEuNTI3LDE2LjM1OSA4OS41NjYsMTYuMzU4IEM4OC41NTUsMTYuMzU4IDg3LjU0NiwxNi42MzIgODYuNjQ5LDE3LjE1IEM4My44NzgsMTguNzUgNzkuNjg3LDIxLjE2OSA3OS4zNzQsMjEuMzQ1IEM3OS4zNTksMjEuMzUzIDc5LjM0NSwyMS4zNjEgNzkuMzMsMjEuMzY5IEM3Ny43OTgsMjIuMjU0IDc2LjA4NCwyMi43MjIgNzQuMzczLDIyLjcyMiBDNzIuMDgxLDIyLjcyMiA2OS45NTksMjEuODkgNjguMzk3LDIwLjM4IEw2OC4xNDUsMjAuMTM1IEM2Ny43MDYsMTkuNjcyIDY3LjMyMywxOS4xNTYgNjcuMDA2LDE4LjYwMSBDNjYuOTg4LDE4LjU1OSA2Ni45NjgsMTguNTE5IDY2Ljk0NiwxOC40NzkgTDY2LjcxOSwxOC4wNjUgQzY2LjY5LDE4LjAxMiA2Ni42NTgsMTcuOTYgNjYuNjI0LDE3LjkxMSBDNjUuNjg2LDE2LjMzNyA2My45NTEsMTUuMzY2IDYyLjA1MywxNS4zNjYgQzYxLjA0MiwxNS4zNjYgNjAuMDMzLDE1LjY0IDU5LjEzNiwxNi4xNTggTDMuMTI1LDQ4LjUwMiBDMC40MjYsNTAuMDYxIC0wLjYxMyw1My40NDIgMC44MTEsNTYuMDQgTDExLjA4OSw3NC43OSBDMTEuMjY2LDc1LjExMyAxMS41MzcsNzUuMzUzIDExLjg1LDc1LjQ5NCBMNTguMjc2LDEwMi4yOTggQzU5LjY3OSwxMDMuMTA4IDYxLjQzMywxMDMuNjMgNjMuMzQ4LDEwMy44MDYgQzYzLjgxMiwxMDMuODQ4IDY0LjI4NSwxMDMuODcgNjQuNzU0LDEwMy44NyBDNjUsMTAzLjg3IDY1LjI0OSwxMDMuODY0IDY1LjQ5NCwxMDMuODUyIEM2NS41NjMsMTAzLjg0OSA2NS42MzIsMTAzLjg0NyA2NS43MDEsMTAzLjg0NyBDNjUuNzY0LDEwMy44NDcgNjUuODI4LDEwMy44NDkgNjUuODksMTAzLjg1MiBDNjUuOTg2LDEwMy44NTYgNjYuMDgsMTAzLjg2MyA2Ni4xNzMsMTAzLjg3NCBDNjYuMjgyLDEwNS40NjcgNjcuMzMyLDEwNy4xOTcgNjguNzAyLDEwNy45ODggTDExMS4xNzQsMTMyLjUxIEMxMTEuNjk4LDEzMi44MTIgMTEyLjIzMiwxMzIuOTY1IDExMi43NjQsMTMyLjk2NSBDMTE0LjI2MSwxMzIuOTY1IDExNS4zNDcsMTMxLjc2NSAxMTUuMzQ3LDEzMC4xMTMgTDExNS4zNDcsMTAzLjU1MSBMMTIyLjQ1OCw5OS40NDYgQzEyMi44MTksOTkuMjM3IDEyMy4wODcsOTguODk4IDEyMy4yMDcsOTguNDk4IEwxMjcuODY1LDgyLjkwNSBDMTMyLjI3OSw4My43MDIgMTM2LjU1Nyw4NC43NTMgMTQwLjYwNyw4Ni4wMzMgTDE0MS4xNCw4Ni44NjIgQzE0MS40NTEsODcuMzQ2IDE0MS45NzcsODcuNjEzIDE0Mi41MTYsODcuNjEzIEMxNDIuNzk0LDg3LjYxMyAxNDMuMDc2LDg3LjU0MiAxNDMuMzMzLDg3LjM5MyBMMTY5Ljg2NSw3Mi4wNzYgTDE5Myw4NS40MzMgQzE5My41MjMsODUuNzM1IDE5NC4wNTgsODUuODg4IDE5NC41OSw4NS44ODggQzE5Ni4wODcsODUuODg4IDE5Ny4xNzMsODQuNjg5IDE5Ny4xNzMsODMuMDM2IEwxOTcuMTczLDI5LjAzNSBDMTk3LjE3MywyOC40NTEgMTk2Ljg2MSwyNy45MTEgMTk2LjM1NSwyNy42MTkgQzE5Ni4zNTUsMjcuNjE5IDE3MS44NDMsMTMuNDY3IDE3MC4zODUsMTIuNjI2IEMxNzAuMTMyLDEyLjQ4IDE2OS44NSwxMi40MDcgMTY5LjU2OCwxMi40MDcgQzE2OS4yODUsMTIuNDA3IDE2OS4wMDIsMTIuNDgxIDE2OC43NDksMTIuNjI3IEMxNjguMTQzLDEyLjk3OCAxNjUuNzU2LDE0LjM1NyAxNjQuNDI0LDE1LjEyNSBMMTU5LjYxNSwxMC44NyBDMTU4Ljc5NiwxMC4xNDUgMTU4LjE1NCw4LjkzNyAxNTguMDU0LDcuOTM0IEMxNTguMDQ1LDcuODM3IDE1OC4wMzQsNy43MzkgMTU4LjAyMSw3LjY0IEMxNTguMDA1LDcuNTIzIDE1Ny45OTgsNy40MSAxNTcuOTk4LDcuMzA0IEwxNTcuOTk4LDYuNDE4IEMxNTcuOTk4LDUuODM0IDE1Ny42ODYsNS4yOTUgMTU3LjE4MSw1LjAwMiBDMTU2LjYyNCw0LjY4IDE1MC40NDIsMS4xMTEgMTUwLjQ0MiwxLjExMSBDMTUwLjE4OSwwLjk2NSAxNDkuOTA3LDAuODkyIDE0OS42MjUsMC44OTIiIGlkPSJGaWxsLTEiIGZpbGw9IiM0NTVBNjQiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNOTYuMDI3LDI1LjYzNiBMMTQyLjYwMyw1Mi41MjcgQzE0My44MDcsNTMuMjIyIDE0NC41ODIsNTQuMTE0IDE0NC44NDUsNTUuMDY4IEwxNDQuODM1LDU1LjA3NSBMNjMuNDYxLDEwMi4wNTcgTDYzLjQ2LDEwMi4wNTcgQzYxLjgwNiwxMDEuOTA1IDYwLjI2MSwxMDEuNDU3IDU5LjA1NywxMDAuNzYyIEwxMi40ODEsNzMuODcxIEw5Ni4wMjcsMjUuNjM2IiBpZD0iRmlsbC0yIiBmaWxsPSIjRkFGQUZBIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTYzLjQ2MSwxMDIuMTc0IEM2My40NTMsMTAyLjE3NCA2My40NDYsMTAyLjE3NCA2My40MzksMTAyLjE3MiBDNjEuNzQ2LDEwMi4wMTYgNjAuMjExLDEwMS41NjMgNTguOTk4LDEwMC44NjMgTDEyLjQyMiw3My45NzMgQzEyLjM4Niw3My45NTIgMTIuMzY0LDczLjkxNCAxMi4zNjQsNzMuODcxIEMxMi4zNjQsNzMuODMgMTIuMzg2LDczLjc5MSAxMi40MjIsNzMuNzcgTDk1Ljk2OCwyNS41MzUgQzk2LjAwNCwyNS41MTQgOTYuMDQ5LDI1LjUxNCA5Ni4wODUsMjUuNTM1IEwxNDIuNjYxLDUyLjQyNiBDMTQzLjg4OCw1My4xMzQgMTQ0LjY4Miw1NC4wMzggMTQ0Ljk1Nyw1NS4wMzcgQzE0NC45Nyw1NS4wODMgMTQ0Ljk1Myw1NS4xMzMgMTQ0LjkxNSw1NS4xNjEgQzE0NC45MTEsNTUuMTY1IDE0NC44OTgsNTUuMTc0IDE0NC44OTQsNTUuMTc3IEw2My41MTksMTAyLjE1OCBDNjMuNTAxLDEwMi4xNjkgNjMuNDgxLDEwMi4xNzQgNjMuNDYxLDEwMi4xNzQgTDYzLjQ2MSwxMDIuMTc0IFogTTEyLjcxNCw3My44NzEgTDU5LjExNSwxMDAuNjYxIEM2MC4yOTMsMTAxLjM0MSA2MS43ODYsMTAxLjc4MiA2My40MzUsMTAxLjkzNyBMMTQ0LjcwNyw1NS4wMTUgQzE0NC40MjgsNTQuMTA4IDE0My42ODIsNTMuMjg1IDE0Mi41NDQsNTIuNjI4IEw5Ni4wMjcsMjUuNzcxIEwxMi43MTQsNzMuODcxIEwxMi43MTQsNzMuODcxIFoiIGlkPSJGaWxsLTMiIGZpbGw9IiM2MDdEOEIiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTQ4LjMyNyw1OC40NzEgQzE0OC4xNDUsNTguNDggMTQ3Ljk2Miw1OC40OCAxNDcuNzgxLDU4LjQ3MiBDMTQ1Ljg4Nyw1OC4zODkgMTQ0LjQ3OSw1Ny40MzQgMTQ0LjYzNiw1Ni4zNCBDMTQ0LjY4OSw1NS45NjcgMTQ0LjY2NCw1NS41OTcgMTQ0LjU2NCw1NS4yMzUgTDYzLjQ2MSwxMDIuMDU3IEM2NC4wODksMTAyLjExNSA2NC43MzMsMTAyLjEzIDY1LjM3OSwxMDIuMDk5IEM2NS41NjEsMTAyLjA5IDY1Ljc0MywxMDIuMDkgNjUuOTI1LDEwMi4wOTggQzY3LjgxOSwxMDIuMTgxIDY5LjIyNywxMDMuMTM2IDY5LjA3LDEwNC4yMyBMMTQ4LjMyNyw1OC40NzEiIGlkPSJGaWxsLTQiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNjkuMDcsMTA0LjM0NyBDNjkuMDQ4LDEwNC4zNDcgNjkuMDI1LDEwNC4zNCA2OS4wMDUsMTA0LjMyNyBDNjguOTY4LDEwNC4zMDEgNjguOTQ4LDEwNC4yNTcgNjguOTU1LDEwNC4yMTMgQzY5LDEwMy44OTYgNjguODk4LDEwMy41NzYgNjguNjU4LDEwMy4yODggQzY4LjE1MywxMDIuNjc4IDY3LjEwMywxMDIuMjY2IDY1LjkyLDEwMi4yMTQgQzY1Ljc0MiwxMDIuMjA2IDY1LjU2MywxMDIuMjA3IDY1LjM4NSwxMDIuMjE1IEM2NC43NDIsMTAyLjI0NiA2NC4wODcsMTAyLjIzMiA2My40NSwxMDIuMTc0IEM2My4zOTksMTAyLjE2OSA2My4zNTgsMTAyLjEzMiA2My4zNDcsMTAyLjA4MiBDNjMuMzM2LDEwMi4wMzMgNjMuMzU4LDEwMS45ODEgNjMuNDAyLDEwMS45NTYgTDE0NC41MDYsNTUuMTM0IEMxNDQuNTM3LDU1LjExNiAxNDQuNTc1LDU1LjExMyAxNDQuNjA5LDU1LjEyNyBDMTQ0LjY0Miw1NS4xNDEgMTQ0LjY2OCw1NS4xNyAxNDQuNjc3LDU1LjIwNCBDMTQ0Ljc4MSw1NS41ODUgMTQ0LjgwNiw1NS45NzIgMTQ0Ljc1MSw1Ni4zNTcgQzE0NC43MDYsNTYuNjczIDE0NC44MDgsNTYuOTk0IDE0NS4wNDcsNTcuMjgyIEMxNDUuNTUzLDU3Ljg5MiAxNDYuNjAyLDU4LjMwMyAxNDcuNzg2LDU4LjM1NSBDMTQ3Ljk2NCw1OC4zNjMgMTQ4LjE0Myw1OC4zNjMgMTQ4LjMyMSw1OC4zNTQgQzE0OC4zNzcsNTguMzUyIDE0OC40MjQsNTguMzg3IDE0OC40MzksNTguNDM4IEMxNDguNDU0LDU4LjQ5IDE0OC40MzIsNTguNTQ1IDE0OC4zODUsNTguNTcyIEw2OS4xMjksMTA0LjMzMSBDNjkuMTExLDEwNC4zNDIgNjkuMDksMTA0LjM0NyA2OS4wNywxMDQuMzQ3IEw2OS4wNywxMDQuMzQ3IFogTTY1LjY2NSwxMDEuOTc1IEM2NS43NTQsMTAxLjk3NSA2NS44NDIsMTAxLjk3NyA2NS45MywxMDEuOTgxIEM2Ny4xOTYsMTAyLjAzNyA2OC4yODMsMTAyLjQ2OSA2OC44MzgsMTAzLjEzOSBDNjkuMDY1LDEwMy40MTMgNjkuMTg4LDEwMy43MTQgNjkuMTk4LDEwNC4wMjEgTDE0Ny44ODMsNTguNTkyIEMxNDcuODQ3LDU4LjU5MiAxNDcuODExLDU4LjU5MSAxNDcuNzc2LDU4LjU4OSBDMTQ2LjUwOSw1OC41MzMgMTQ1LjQyMiw1OC4xIDE0NC44NjcsNTcuNDMxIEMxNDQuNTg1LDU3LjA5MSAxNDQuNDY1LDU2LjcwNyAxNDQuNTIsNTYuMzI0IEMxNDQuNTYzLDU2LjAyMSAxNDQuNTUyLDU1LjcxNiAxNDQuNDg4LDU1LjQxNCBMNjMuODQ2LDEwMS45NyBDNjQuMzUzLDEwMi4wMDIgNjQuODY3LDEwMi4wMDYgNjUuMzc0LDEwMS45ODIgQzY1LjQ3MSwxMDEuOTc3IDY1LjU2OCwxMDEuOTc1IDY1LjY2NSwxMDEuOTc1IEw2NS42NjUsMTAxLjk3NSBaIiBpZD0iRmlsbC01IiBmaWxsPSIjNjA3RDhCIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTIuMjA4LDU1LjEzNCBDMS4yMDcsNTMuMzA3IDEuOTY3LDUwLjkxNyAzLjkwNiw0OS43OTcgTDU5LjkxNywxNy40NTMgQzYxLjg1NiwxNi4zMzMgNjQuMjQxLDE2LjkwNyA2NS4yNDMsMTguNzM0IEw2NS40NzUsMTkuMTQ0IEM2NS44NzIsMTkuODgyIDY2LjM2OCwyMC41NiA2Ni45NDUsMjEuMTY1IEw2Ny4yMjMsMjEuNDM1IEM3MC41NDgsMjQuNjQ5IDc1LjgwNiwyNS4xNTEgODAuMTExLDIyLjY2NSBMODcuNDMsMTguNDQ1IEM4OS4zNywxNy4zMjYgOTEuNzU0LDE3Ljg5OSA5Mi43NTUsMTkuNzI3IEw5Ni4wMDUsMjUuNjU1IEwxMi40ODYsNzMuODg0IEwyLjIwOCw1NS4xMzQgWiIgaWQ9IkZpbGwtNiIgZmlsbD0iI0ZBRkFGQSI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMi40ODYsNzQuMDAxIEMxMi40NzYsNzQuMDAxIDEyLjQ2NSw3My45OTkgMTIuNDU1LDczLjk5NiBDMTIuNDI0LDczLjk4OCAxMi4zOTksNzMuOTY3IDEyLjM4NCw3My45NCBMMi4xMDYsNTUuMTkgQzEuMDc1LDUzLjMxIDEuODU3LDUwLjg0NSAzLjg0OCw0OS42OTYgTDU5Ljg1OCwxNy4zNTIgQzYwLjUyNSwxNi45NjcgNjEuMjcxLDE2Ljc2NCA2Mi4wMTYsMTYuNzY0IEM2My40MzEsMTYuNzY0IDY0LjY2NiwxNy40NjYgNjUuMzI3LDE4LjY0NiBDNjUuMzM3LDE4LjY1NCA2NS4zNDUsMTguNjYzIDY1LjM1MSwxOC42NzQgTDY1LjU3OCwxOS4wODggQzY1LjU4NCwxOS4xIDY1LjU4OSwxOS4xMTIgNjUuNTkxLDE5LjEyNiBDNjUuOTg1LDE5LjgzOCA2Ni40NjksMjAuNDk3IDY3LjAzLDIxLjA4NSBMNjcuMzA1LDIxLjM1MSBDNjkuMTUxLDIzLjEzNyA3MS42NDksMjQuMTIgNzQuMzM2LDI0LjEyIEM3Ni4zMTMsMjQuMTIgNzguMjksMjMuNTgyIDgwLjA1MywyMi41NjMgQzgwLjA2NCwyMi41NTcgODAuMDc2LDIyLjU1MyA4MC4wODgsMjIuNTUgTDg3LjM3MiwxOC4zNDQgQzg4LjAzOCwxNy45NTkgODguNzg0LDE3Ljc1NiA4OS41MjksMTcuNzU2IEM5MC45NTYsMTcuNzU2IDkyLjIwMSwxOC40NzIgOTIuODU4LDE5LjY3IEw5Ni4xMDcsMjUuNTk5IEM5Ni4xMzgsMjUuNjU0IDk2LjExOCwyNS43MjQgOTYuMDYzLDI1Ljc1NiBMMTIuNTQ1LDczLjk4NSBDMTIuNTI2LDczLjk5NiAxMi41MDYsNzQuMDAxIDEyLjQ4Niw3NC4wMDEgTDEyLjQ4Niw3NC4wMDEgWiBNNjIuMDE2LDE2Ljk5NyBDNjEuMzEyLDE2Ljk5NyA2MC42MDYsMTcuMTkgNTkuOTc1LDE3LjU1NCBMMy45NjUsNDkuODk5IEMyLjA4Myw1MC45ODUgMS4zNDEsNTMuMzA4IDIuMzEsNTUuMDc4IEwxMi41MzEsNzMuNzIzIEw5NS44NDgsMjUuNjExIEw5Mi42NTMsMTkuNzgyIEM5Mi4wMzgsMTguNjYgOTAuODcsMTcuOTkgODkuNTI5LDE3Ljk5IEM4OC44MjUsMTcuOTkgODguMTE5LDE4LjE4MiA4Ny40ODksMTguNTQ3IEw4MC4xNzIsMjIuNzcyIEM4MC4xNjEsMjIuNzc4IDgwLjE0OSwyMi43ODIgODAuMTM3LDIyLjc4NSBDNzguMzQ2LDIzLjgxMSA3Ni4zNDEsMjQuMzU0IDc0LjMzNiwyNC4zNTQgQzcxLjU4OCwyNC4zNTQgNjkuMDMzLDIzLjM0NyA2Ny4xNDIsMjEuNTE5IEw2Ni44NjQsMjEuMjQ5IEM2Ni4yNzcsMjAuNjM0IDY1Ljc3NCwxOS45NDcgNjUuMzY3LDE5LjIwMyBDNjUuMzYsMTkuMTkyIDY1LjM1NiwxOS4xNzkgNjUuMzU0LDE5LjE2NiBMNjUuMTYzLDE4LjgxOSBDNjUuMTU0LDE4LjgxMSA2NS4xNDYsMTguODAxIDY1LjE0LDE4Ljc5IEM2NC41MjUsMTcuNjY3IDYzLjM1NywxNi45OTcgNjIuMDE2LDE2Ljk5NyBMNjIuMDE2LDE2Ljk5NyBaIiBpZD0iRmlsbC03IiBmaWxsPSIjNjA3RDhCIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTQyLjQzNCw0OC44MDggTDQyLjQzNCw0OC44MDggQzM5LjkyNCw0OC44MDcgMzcuNzM3LDQ3LjU1IDM2LjU4Miw0NS40NDMgQzM0Ljc3MSw0Mi4xMzkgMzYuMTQ0LDM3LjgwOSAzOS42NDEsMzUuNzg5IEw1MS45MzIsMjguNjkxIEM1My4xMDMsMjguMDE1IDU0LjQxMywyNy42NTggNTUuNzIxLDI3LjY1OCBDNTguMjMxLDI3LjY1OCA2MC40MTgsMjguOTE2IDYxLjU3MywzMS4wMjMgQzYzLjM4NCwzNC4zMjcgNjIuMDEyLDM4LjY1NyA1OC41MTQsNDAuNjc3IEw0Ni4yMjMsNDcuNzc1IEM0NS4wNTMsNDguNDUgNDMuNzQyLDQ4LjgwOCA0Mi40MzQsNDguODA4IEw0Mi40MzQsNDguODA4IFogTTU1LjcyMSwyOC4xMjUgQzU0LjQ5NSwyOC4xMjUgNTMuMjY1LDI4LjQ2MSA1Mi4xNjYsMjkuMDk2IEwzOS44NzUsMzYuMTk0IEMzNi41OTYsMzguMDg3IDM1LjMwMiw0Mi4xMzYgMzYuOTkyLDQ1LjIxOCBDMzguMDYzLDQ3LjE3MyA0MC4wOTgsNDguMzQgNDIuNDM0LDQ4LjM0IEM0My42NjEsNDguMzQgNDQuODksNDguMDA1IDQ1Ljk5LDQ3LjM3IEw1OC4yODEsNDAuMjcyIEM2MS41NiwzOC4zNzkgNjIuODUzLDM0LjMzIDYxLjE2NCwzMS4yNDggQzYwLjA5MiwyOS4yOTMgNTguMDU4LDI4LjEyNSA1NS43MjEsMjguMTI1IEw1NS43MjEsMjguMTI1IFoiIGlkPSJGaWxsLTgiIGZpbGw9IiM2MDdEOEIiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTQ5LjU4OCwyLjQwNyBDMTQ5LjU4OCwyLjQwNyAxNTUuNzY4LDUuOTc1IDE1Ni4zMjUsNi4yOTcgTDE1Ni4zMjUsNy4xODQgQzE1Ni4zMjUsNy4zNiAxNTYuMzM4LDcuNTQ0IDE1Ni4zNjIsNy43MzMgQzE1Ni4zNzMsNy44MTQgMTU2LjM4Miw3Ljg5NCAxNTYuMzksNy45NzUgQzE1Ni41Myw5LjM5IDE1Ny4zNjMsMTAuOTczIDE1OC40OTUsMTEuOTc0IEwxNjUuODkxLDE4LjUxOSBDMTY2LjA2OCwxOC42NzUgMTY2LjI0OSwxOC44MTQgMTY2LjQzMiwxOC45MzQgQzE2OC4wMTEsMTkuOTc0IDE2OS4zODIsMTkuNCAxNjkuNDk0LDE3LjY1MiBDMTY5LjU0MywxNi44NjggMTY5LjU1MSwxNi4wNTcgMTY5LjUxNywxNS4yMjMgTDE2OS41MTQsMTUuMDYzIEwxNjkuNTE0LDEzLjkxMiBDMTcwLjc4LDE0LjY0MiAxOTUuNTAxLDI4LjkxNSAxOTUuNTAxLDI4LjkxNSBMMTk1LjUwMSw4Mi45MTUgQzE5NS41MDEsODQuMDA1IDE5NC43MzEsODQuNDQ1IDE5My43ODEsODMuODk3IEwxNTEuMzA4LDU5LjM3NCBDMTUwLjM1OCw1OC44MjYgMTQ5LjU4OCw1Ny40OTcgMTQ5LjU4OCw1Ni40MDggTDE0OS41ODgsMjIuMzc1IiBpZD0iRmlsbC05IiBmaWxsPSIjRkFGQUZBIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTE5NC41NTMsODQuMjUgQzE5NC4yOTYsODQuMjUgMTk0LjAxMyw4NC4xNjUgMTkzLjcyMiw4My45OTcgTDE1MS4yNSw1OS40NzYgQzE1MC4yNjksNTguOTA5IDE0OS40NzEsNTcuNTMzIDE0OS40NzEsNTYuNDA4IEwxNDkuNDcxLDIyLjM3NSBMMTQ5LjcwNSwyMi4zNzUgTDE0OS43MDUsNTYuNDA4IEMxNDkuNzA1LDU3LjQ1OSAxNTAuNDUsNTguNzQ0IDE1MS4zNjYsNTkuMjc0IEwxOTMuODM5LDgzLjc5NSBDMTk0LjI2Myw4NC4wNCAxOTQuNjU1LDg0LjA4MyAxOTQuOTQyLDgzLjkxNyBDMTk1LjIyNyw4My43NTMgMTk1LjM4NCw4My4zOTcgMTk1LjM4NCw4Mi45MTUgTDE5NS4zODQsMjguOTgyIEMxOTQuMTAyLDI4LjI0MiAxNzIuMTA0LDE1LjU0MiAxNjkuNjMxLDE0LjExNCBMMTY5LjYzNCwxNS4yMiBDMTY5LjY2OCwxNi4wNTIgMTY5LjY2LDE2Ljg3NCAxNjkuNjEsMTcuNjU5IEMxNjkuNTU2LDE4LjUwMyAxNjkuMjE0LDE5LjEyMyAxNjguNjQ3LDE5LjQwNSBDMTY4LjAyOCwxOS43MTQgMTY3LjE5NywxOS41NzggMTY2LjM2NywxOS4wMzIgQzE2Ni4xODEsMTguOTA5IDE2NS45OTUsMTguNzY2IDE2NS44MTQsMTguNjA2IEwxNTguNDE3LDEyLjA2MiBDMTU3LjI1OSwxMS4wMzYgMTU2LjQxOCw5LjQzNyAxNTYuMjc0LDcuOTg2IEMxNTYuMjY2LDcuOTA3IDE1Ni4yNTcsNy44MjcgMTU2LjI0Nyw3Ljc0OCBDMTU2LjIyMSw3LjU1NSAxNTYuMjA5LDcuMzY1IDE1Ni4yMDksNy4xODQgTDE1Ni4yMDksNi4zNjQgQzE1NS4zNzUsNS44ODMgMTQ5LjUyOSwyLjUwOCAxNDkuNTI5LDIuNTA4IEwxNDkuNjQ2LDIuMzA2IEMxNDkuNjQ2LDIuMzA2IDE1NS44MjcsNS44NzQgMTU2LjM4NCw2LjE5NiBMMTU2LjQ0Miw2LjIzIEwxNTYuNDQyLDcuMTg0IEMxNTYuNDQyLDcuMzU1IDE1Ni40NTQsNy41MzUgMTU2LjQ3OCw3LjcxNyBDMTU2LjQ4OSw3LjggMTU2LjQ5OSw3Ljg4MiAxNTYuNTA3LDcuOTYzIEMxNTYuNjQ1LDkuMzU4IDE1Ny40NTUsMTAuODk4IDE1OC41NzIsMTEuODg2IEwxNjUuOTY5LDE4LjQzMSBDMTY2LjE0MiwxOC41ODQgMTY2LjMxOSwxOC43MiAxNjYuNDk2LDE4LjgzNyBDMTY3LjI1NCwxOS4zMzYgMTY4LDE5LjQ2NyAxNjguNTQzLDE5LjE5NiBDMTY5LjAzMywxOC45NTMgMTY5LjMyOSwxOC40MDEgMTY5LjM3NywxNy42NDUgQzE2OS40MjcsMTYuODY3IDE2OS40MzQsMTYuMDU0IDE2OS40MDEsMTUuMjI4IEwxNjkuMzk3LDE1LjA2NSBMMTY5LjM5NywxMy43MSBMMTY5LjU3MiwxMy44MSBDMTcwLjgzOSwxNC41NDEgMTk1LjU1OSwyOC44MTQgMTk1LjU1OSwyOC44MTQgTDE5NS42MTgsMjguODQ3IEwxOTUuNjE4LDgyLjkxNSBDMTk1LjYxOCw4My40ODQgMTk1LjQyLDgzLjkxMSAxOTUuMDU5LDg0LjExOSBDMTk0LjkwOCw4NC4yMDYgMTk0LjczNyw4NC4yNSAxOTQuNTUzLDg0LjI1IiBpZD0iRmlsbC0xMCIgZmlsbD0iIzYwN0Q4QiI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNDUuNjg1LDU2LjE2MSBMMTY5LjgsNzAuMDgzIEwxNDMuODIyLDg1LjA4MSBMMTQyLjM2LDg0Ljc3NCBDMTM1LjgyNiw4Mi42MDQgMTI4LjczMiw4MS4wNDYgMTIxLjM0MSw4MC4xNTggQzExNi45NzYsNzkuNjM0IDExMi42NzgsODEuMjU0IDExMS43NDMsODMuNzc4IEMxMTEuNTA2LDg0LjQxNCAxMTEuNTAzLDg1LjA3MSAxMTEuNzMyLDg1LjcwNiBDMTEzLjI3LDg5Ljk3MyAxMTUuOTY4LDk0LjA2OSAxMTkuNzI3LDk3Ljg0MSBMMTIwLjI1OSw5OC42ODYgQzEyMC4yNiw5OC42ODUgOTQuMjgyLDExMy42ODMgOTQuMjgyLDExMy42ODMgTDcwLjE2Nyw5OS43NjEgTDE0NS42ODUsNTYuMTYxIiBpZD0iRmlsbC0xMSIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik05NC4yODIsMTEzLjgxOCBMOTQuMjIzLDExMy43ODUgTDY5LjkzMyw5OS43NjEgTDcwLjEwOCw5OS42NiBMMTQ1LjY4NSw1Ni4wMjYgTDE0NS43NDMsNTYuMDU5IEwxNzAuMDMzLDcwLjA4MyBMMTQzLjg0Miw4NS4yMDUgTDE0My43OTcsODUuMTk1IEMxNDMuNzcyLDg1LjE5IDE0Mi4zMzYsODQuODg4IDE0Mi4zMzYsODQuODg4IEMxMzUuNzg3LDgyLjcxNCAxMjguNzIzLDgxLjE2MyAxMjEuMzI3LDgwLjI3NCBDMTIwLjc4OCw4MC4yMDkgMTIwLjIzNiw4MC4xNzcgMTE5LjY4OSw4MC4xNzcgQzExNS45MzEsODAuMTc3IDExMi42MzUsODEuNzA4IDExMS44NTIsODMuODE5IEMxMTEuNjI0LDg0LjQzMiAxMTEuNjIxLDg1LjA1MyAxMTEuODQyLDg1LjY2NyBDMTEzLjM3Nyw4OS45MjUgMTE2LjA1OCw5My45OTMgMTE5LjgxLDk3Ljc1OCBMMTE5LjgyNiw5Ny43NzkgTDEyMC4zNTIsOTguNjE0IEMxMjAuMzU0LDk4LjYxNyAxMjAuMzU2LDk4LjYyIDEyMC4zNTgsOTguNjI0IEwxMjAuNDIyLDk4LjcyNiBMMTIwLjMxNyw5OC43ODcgQzEyMC4yNjQsOTguODE4IDk0LjU5OSwxMTMuNjM1IDk0LjM0LDExMy43ODUgTDk0LjI4MiwxMTMuODE4IEw5NC4yODIsMTEzLjgxOCBaIE03MC40MDEsOTkuNzYxIEw5NC4yODIsMTEzLjU0OSBMMTE5LjA4NCw5OS4yMjkgQzExOS42Myw5OC45MTQgMTE5LjkzLDk4Ljc0IDEyMC4xMDEsOTguNjU0IEwxMTkuNjM1LDk3LjkxNCBDMTE1Ljg2NCw5NC4xMjcgMTEzLjE2OCw5MC4wMzMgMTExLjYyMiw4NS43NDYgQzExMS4zODIsODUuMDc5IDExMS4zODYsODQuNDA0IDExMS42MzMsODMuNzM4IEMxMTIuNDQ4LDgxLjUzOSAxMTUuODM2LDc5Ljk0MyAxMTkuNjg5LDc5Ljk0MyBDMTIwLjI0Niw3OS45NDMgMTIwLjgwNiw3OS45NzYgMTIxLjM1NSw4MC4wNDIgQzEyOC43NjcsODAuOTMzIDEzNS44NDYsODIuNDg3IDE0Mi4zOTYsODQuNjYzIEMxNDMuMjMyLDg0LjgzOCAxNDMuNjExLDg0LjkxNyAxNDMuNzg2LDg0Ljk2NyBMMTY5LjU2Niw3MC4wODMgTDE0NS42ODUsNTYuMjk1IEw3MC40MDEsOTkuNzYxIEw3MC40MDEsOTkuNzYxIFoiIGlkPSJGaWxsLTEyIiBmaWxsPSIjNjA3RDhCIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTE2Ny4yMywxOC45NzkgTDE2Ny4yMyw2OS44NSBMMTM5LjkwOSw4NS42MjMgTDEzMy40NDgsNzEuNDU2IEMxMzIuNTM4LDY5LjQ2IDEzMC4wMiw2OS43MTggMTI3LjgyNCw3Mi4wMyBDMTI2Ljc2OSw3My4xNCAxMjUuOTMxLDc0LjU4NSAxMjUuNDk0LDc2LjA0OCBMMTE5LjAzNCw5Ny42NzYgTDkxLjcxMiwxMTMuNDUgTDkxLjcxMiw2Mi41NzkgTDE2Ny4yMywxOC45NzkiIGlkPSJGaWxsLTEzIiBmaWxsPSIjRkZGRkZGIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTkxLjcxMiwxMTMuNTY3IEM5MS42OTIsMTEzLjU2NyA5MS42NzIsMTEzLjU2MSA5MS42NTMsMTEzLjU1MSBDOTEuNjE4LDExMy41MyA5MS41OTUsMTEzLjQ5MiA5MS41OTUsMTEzLjQ1IEw5MS41OTUsNjIuNTc5IEM5MS41OTUsNjIuNTM3IDkxLjYxOCw2Mi40OTkgOTEuNjUzLDYyLjQ3OCBMMTY3LjE3MiwxOC44NzggQzE2Ny4yMDgsMTguODU3IDE2Ny4yNTIsMTguODU3IDE2Ny4yODgsMTguODc4IEMxNjcuMzI0LDE4Ljg5OSAxNjcuMzQ3LDE4LjkzNyAxNjcuMzQ3LDE4Ljk3OSBMMTY3LjM0Nyw2OS44NSBDMTY3LjM0Nyw2OS44OTEgMTY3LjMyNCw2OS45MyAxNjcuMjg4LDY5Ljk1IEwxMzkuOTY3LDg1LjcyNSBDMTM5LjkzOSw4NS43NDEgMTM5LjkwNSw4NS43NDUgMTM5Ljg3Myw4NS43MzUgQzEzOS44NDIsODUuNzI1IDEzOS44MTYsODUuNzAyIDEzOS44MDIsODUuNjcyIEwxMzMuMzQyLDcxLjUwNCBDMTMyLjk2Nyw3MC42ODIgMTMyLjI4LDcwLjIyOSAxMzEuNDA4LDcwLjIyOSBDMTMwLjMxOSw3MC4yMjkgMTI5LjA0NCw3MC45MTUgMTI3LjkwOCw3Mi4xMSBDMTI2Ljg3NCw3My4yIDEyNi4wMzQsNzQuNjQ3IDEyNS42MDYsNzYuMDgyIEwxMTkuMTQ2LDk3LjcwOSBDMTE5LjEzNyw5Ny43MzggMTE5LjExOCw5Ny43NjIgMTE5LjA5Miw5Ny43NzcgTDkxLjc3LDExMy41NTEgQzkxLjc1MiwxMTMuNTYxIDkxLjczMiwxMTMuNTY3IDkxLjcxMiwxMTMuNTY3IEw5MS43MTIsMTEzLjU2NyBaIE05MS44MjksNjIuNjQ3IEw5MS44MjksMTEzLjI0OCBMMTE4LjkzNSw5Ny41OTggTDEyNS4zODIsNzYuMDE1IEMxMjUuODI3LDc0LjUyNSAxMjYuNjY0LDczLjA4MSAxMjcuNzM5LDcxLjk1IEMxMjguOTE5LDcwLjcwOCAxMzAuMjU2LDY5Ljk5NiAxMzEuNDA4LDY5Ljk5NiBDMTMyLjM3Nyw2OS45OTYgMTMzLjEzOSw3MC40OTcgMTMzLjU1NCw3MS40MDcgTDEzOS45NjEsODUuNDU4IEwxNjcuMTEzLDY5Ljc4MiBMMTY3LjExMywxOS4xODEgTDkxLjgyOSw2Mi42NDcgTDkxLjgyOSw2Mi42NDcgWiIgaWQ9IkZpbGwtMTQiIGZpbGw9IiM2MDdEOEIiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTY4LjU0MywxOS4yMTMgTDE2OC41NDMsNzAuMDgzIEwxNDEuMjIxLDg1Ljg1NyBMMTM0Ljc2MSw3MS42ODkgQzEzMy44NTEsNjkuNjk0IDEzMS4zMzMsNjkuOTUxIDEyOS4xMzcsNzIuMjYzIEMxMjguMDgyLDczLjM3NCAxMjcuMjQ0LDc0LjgxOSAxMjYuODA3LDc2LjI4MiBMMTIwLjM0Niw5Ny45MDkgTDkzLjAyNSwxMTMuNjgzIEw5My4wMjUsNjIuODEzIEwxNjguNTQzLDE5LjIxMyIgaWQ9IkZpbGwtMTUiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNOTMuMDI1LDExMy44IEM5My4wMDUsMTEzLjggOTIuOTg0LDExMy43OTUgOTIuOTY2LDExMy43ODUgQzkyLjkzMSwxMTMuNzY0IDkyLjkwOCwxMTMuNzI1IDkyLjkwOCwxMTMuNjg0IEw5Mi45MDgsNjIuODEzIEM5Mi45MDgsNjIuNzcxIDkyLjkzMSw2Mi43MzMgOTIuOTY2LDYyLjcxMiBMMTY4LjQ4NCwxOS4xMTIgQzE2OC41MiwxOS4wOSAxNjguNTY1LDE5LjA5IDE2OC42MDEsMTkuMTEyIEMxNjguNjM3LDE5LjEzMiAxNjguNjYsMTkuMTcxIDE2OC42NiwxOS4yMTIgTDE2OC42Niw3MC4wODMgQzE2OC42Niw3MC4xMjUgMTY4LjYzNyw3MC4xNjQgMTY4LjYwMSw3MC4xODQgTDE0MS4yOCw4NS45NTggQzE0MS4yNTEsODUuOTc1IDE0MS4yMTcsODUuOTc5IDE0MS4xODYsODUuOTY4IEMxNDEuMTU0LDg1Ljk1OCAxNDEuMTI5LDg1LjkzNiAxNDEuMTE1LDg1LjkwNiBMMTM0LjY1NSw3MS43MzggQzEzNC4yOCw3MC45MTUgMTMzLjU5Myw3MC40NjMgMTMyLjcyLDcwLjQ2MyBDMTMxLjYzMiw3MC40NjMgMTMwLjM1Nyw3MS4xNDggMTI5LjIyMSw3Mi4zNDQgQzEyOC4xODYsNzMuNDMzIDEyNy4zNDcsNzQuODgxIDEyNi45MTksNzYuMzE1IEwxMjAuNDU4LDk3Ljk0MyBDMTIwLjQ1LDk3Ljk3MiAxMjAuNDMxLDk3Ljk5NiAxMjAuNDA1LDk4LjAxIEw5My4wODMsMTEzLjc4NSBDOTMuMDY1LDExMy43OTUgOTMuMDQ1LDExMy44IDkzLjAyNSwxMTMuOCBMOTMuMDI1LDExMy44IFogTTkzLjE0Miw2Mi44ODEgTDkzLjE0MiwxMTMuNDgxIEwxMjAuMjQ4LDk3LjgzMiBMMTI2LjY5NSw3Ni4yNDggQzEyNy4xNCw3NC43NTggMTI3Ljk3Nyw3My4zMTUgMTI5LjA1Miw3Mi4xODMgQzEzMC4yMzEsNzAuOTQyIDEzMS41NjgsNzAuMjI5IDEzMi43Miw3MC4yMjkgQzEzMy42ODksNzAuMjI5IDEzNC40NTIsNzAuNzMxIDEzNC44NjcsNzEuNjQxIEwxNDEuMjc0LDg1LjY5MiBMMTY4LjQyNiw3MC4wMTYgTDE2OC40MjYsMTkuNDE1IEw5My4xNDIsNjIuODgxIEw5My4xNDIsNjIuODgxIFoiIGlkPSJGaWxsLTE2IiBmaWxsPSIjNjA3RDhCIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTE2OS44LDcwLjA4MyBMMTQyLjQ3OCw4NS44NTcgTDEzNi4wMTgsNzEuNjg5IEMxMzUuMTA4LDY5LjY5NCAxMzIuNTksNjkuOTUxIDEzMC4zOTMsNzIuMjYzIEMxMjkuMzM5LDczLjM3NCAxMjguNSw3NC44MTkgMTI4LjA2NCw3Ni4yODIgTDEyMS42MDMsOTcuOTA5IEw5NC4yODIsMTEzLjY4MyBMOTQuMjgyLDYyLjgxMyBMMTY5LjgsMTkuMjEzIEwxNjkuOCw3MC4wODMgWiIgaWQ9IkZpbGwtMTciIGZpbGw9IiNGQUZBRkEiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNOTQuMjgyLDExMy45MTcgQzk0LjI0MSwxMTMuOTE3IDk0LjIwMSwxMTMuOTA3IDk0LjE2NSwxMTMuODg2IEM5NC4wOTMsMTEzLjg0NSA5NC4wNDgsMTEzLjc2NyA5NC4wNDgsMTEzLjY4NCBMOTQuMDQ4LDYyLjgxMyBDOTQuMDQ4LDYyLjczIDk0LjA5Myw2Mi42NTIgOTQuMTY1LDYyLjYxMSBMMTY5LjY4MywxOS4wMSBDMTY5Ljc1NSwxOC45NjkgMTY5Ljg0NCwxOC45NjkgMTY5LjkxNywxOS4wMSBDMTY5Ljk4OSwxOS4wNTIgMTcwLjAzMywxOS4xMjkgMTcwLjAzMywxOS4yMTIgTDE3MC4wMzMsNzAuMDgzIEMxNzAuMDMzLDcwLjE2NiAxNjkuOTg5LDcwLjI0NCAxNjkuOTE3LDcwLjI4NSBMMTQyLjU5NSw4Ni4wNiBDMTQyLjUzOCw4Ni4wOTIgMTQyLjQ2OSw4Ni4xIDE0Mi40MDcsODYuMDggQzE0Mi4zNDQsODYuMDYgMTQyLjI5Myw4Ni4wMTQgMTQyLjI2Niw4NS45NTQgTDEzNS44MDUsNzEuNzg2IEMxMzUuNDQ1LDcwLjk5NyAxMzQuODEzLDcwLjU4IDEzMy45NzcsNzAuNTggQzEzMi45MjEsNzAuNTggMTMxLjY3Niw3MS4yNTIgMTMwLjU2Miw3Mi40MjQgQzEyOS41NCw3My41MDEgMTI4LjcxMSw3NC45MzEgMTI4LjI4Nyw3Ni4zNDggTDEyMS44MjcsOTcuOTc2IEMxMjEuODEsOTguMDM0IDEyMS43NzEsOTguMDgyIDEyMS43Miw5OC4xMTIgTDk0LjM5OCwxMTMuODg2IEM5NC4zNjIsMTEzLjkwNyA5NC4zMjIsMTEzLjkxNyA5NC4yODIsMTEzLjkxNyBMOTQuMjgyLDExMy45MTcgWiBNOTQuNTE1LDYyLjk0OCBMOTQuNTE1LDExMy4yNzkgTDEyMS40MDYsOTcuNzU0IEwxMjcuODQsNzYuMjE1IEMxMjguMjksNzQuNzA4IDEyOS4xMzcsNzMuMjQ3IDEzMC4yMjQsNzIuMTAzIEMxMzEuNDI1LDcwLjgzOCAxMzIuNzkzLDcwLjExMiAxMzMuOTc3LDcwLjExMiBDMTM0Ljk5NSw3MC4xMTIgMTM1Ljc5NSw3MC42MzggMTM2LjIzLDcxLjU5MiBMMTQyLjU4NCw4NS41MjYgTDE2OS41NjYsNjkuOTQ4IEwxNjkuNTY2LDE5LjYxNyBMOTQuNTE1LDYyLjk0OCBMOTQuNTE1LDYyLjk0OCBaIiBpZD0iRmlsbC0xOCIgZmlsbD0iIzYwN0Q4QiI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMDkuODk0LDkyLjk0MyBMMTA5Ljg5NCw5Mi45NDMgQzEwOC4xMiw5Mi45NDMgMTA2LjY1Myw5Mi4yMTggMTA1LjY1LDkwLjgyMyBDMTA1LjU4Myw5MC43MzEgMTA1LjU5Myw5MC42MSAxMDUuNjczLDkwLjUyOSBDMTA1Ljc1Myw5MC40NDggMTA1Ljg4LDkwLjQ0IDEwNS45NzQsOTAuNTA2IEMxMDYuNzU0LDkxLjA1MyAxMDcuNjc5LDkxLjMzMyAxMDguNzI0LDkxLjMzMyBDMTEwLjA0Nyw5MS4zMzMgMTExLjQ3OCw5MC44OTQgMTEyLjk4LDkwLjAyNyBDMTE4LjI5MSw4Ni45NiAxMjIuNjExLDc5LjUwOSAxMjIuNjExLDczLjQxNiBDMTIyLjYxMSw3MS40ODkgMTIyLjE2OSw2OS44NTYgMTIxLjMzMyw2OC42OTIgQzEyMS4yNjYsNjguNiAxMjEuMjc2LDY4LjQ3MyAxMjEuMzU2LDY4LjM5MiBDMTIxLjQzNiw2OC4zMTEgMTIxLjU2Myw2OC4yOTkgMTIxLjY1Niw2OC4zNjUgQzEyMy4zMjcsNjkuNTM3IDEyNC4yNDcsNzEuNzQ2IDEyNC4yNDcsNzQuNTg0IEMxMjQuMjQ3LDgwLjgyNiAxMTkuODIxLDg4LjQ0NyAxMTQuMzgyLDkxLjU4NyBDMTEyLjgwOCw5Mi40OTUgMTExLjI5OCw5Mi45NDMgMTA5Ljg5NCw5Mi45NDMgTDEwOS44OTQsOTIuOTQzIFogTTEwNi45MjUsOTEuNDAxIEMxMDcuNzM4LDkyLjA1MiAxMDguNzQ1LDkyLjI3OCAxMDkuODkzLDkyLjI3OCBMMTA5Ljg5NCw5Mi4yNzggQzExMS4yMTUsOTIuMjc4IDExMi42NDcsOTEuOTUxIDExNC4xNDgsOTEuMDg0IEMxMTkuNDU5LDg4LjAxNyAxMjMuNzgsODAuNjIxIDEyMy43OCw3NC41MjggQzEyMy43OCw3Mi41NDkgMTIzLjMxNyw3MC45MjkgMTIyLjQ1NCw2OS43NjcgQzEyMi44NjUsNzAuODAyIDEyMy4wNzksNzIuMDQyIDEyMy4wNzksNzMuNDAyIEMxMjMuMDc5LDc5LjY0NSAxMTguNjUzLDg3LjI4NSAxMTMuMjE0LDkwLjQyNSBDMTExLjY0LDkxLjMzNCAxMTAuMTMsOTEuNzQyIDEwOC43MjQsOTEuNzQyIEMxMDguMDgzLDkxLjc0MiAxMDcuNDgxLDkxLjU5MyAxMDYuOTI1LDkxLjQwMSBMMTA2LjkyNSw5MS40MDEgWiIgaWQ9IkZpbGwtMTkiIGZpbGw9IiM2MDdEOEIiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTEzLjA5Nyw5MC4yMyBDMTE4LjQ4MSw4Ny4xMjIgMTIyLjg0NSw3OS41OTQgMTIyLjg0NSw3My40MTYgQzEyMi44NDUsNzEuMzY1IDEyMi4zNjIsNjkuNzI0IDEyMS41MjIsNjguNTU2IEMxMTkuNzM4LDY3LjMwNCAxMTcuMTQ4LDY3LjM2MiAxMTQuMjY1LDY5LjAyNiBDMTA4Ljg4MSw3Mi4xMzQgMTA0LjUxNyw3OS42NjIgMTA0LjUxNyw4NS44NCBDMTA0LjUxNyw4Ny44OTEgMTA1LDg5LjUzMiAxMDUuODQsOTAuNyBDMTA3LjYyNCw5MS45NTIgMTEwLjIxNCw5MS44OTQgMTEzLjA5Nyw5MC4yMyIgaWQ9IkZpbGwtMjAiIGZpbGw9IiNGQUZBRkEiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTA4LjcyNCw5MS42MTQgTDEwOC43MjQsOTEuNjE0IEMxMDcuNTgyLDkxLjYxNCAxMDYuNTY2LDkxLjQwMSAxMDUuNzA1LDkwLjc5NyBDMTA1LjY4NCw5MC43ODMgMTA1LjY2NSw5MC44MTEgMTA1LjY1LDkwLjc5IEMxMDQuNzU2LDg5LjU0NiAxMDQuMjgzLDg3Ljg0MiAxMDQuMjgzLDg1LjgxNyBDMTA0LjI4Myw3OS41NzUgMTA4LjcwOSw3MS45NTMgMTE0LjE0OCw2OC44MTIgQzExNS43MjIsNjcuOTA0IDExNy4yMzIsNjcuNDQ5IDExOC42MzgsNjcuNDQ5IEMxMTkuNzgsNjcuNDQ5IDEyMC43OTYsNjcuNzU4IDEyMS42NTYsNjguMzYyIEMxMjEuNjc4LDY4LjM3NyAxMjEuNjk3LDY4LjM5NyAxMjEuNzEyLDY4LjQxOCBDMTIyLjYwNiw2OS42NjIgMTIzLjA3OSw3MS4zOSAxMjMuMDc5LDczLjQxNSBDMTIzLjA3OSw3OS42NTggMTE4LjY1Myw4Ny4xOTggMTEzLjIxNCw5MC4zMzggQzExMS42NCw5MS4yNDcgMTEwLjEzLDkxLjYxNCAxMDguNzI0LDkxLjYxNCBMMTA4LjcyNCw5MS42MTQgWiBNMTA2LjAwNiw5MC41MDUgQzEwNi43OCw5MS4wMzcgMTA3LjY5NCw5MS4yODEgMTA4LjcyNCw5MS4yODEgQzExMC4wNDcsOTEuMjgxIDExMS40NzgsOTAuODY4IDExMi45OCw5MC4wMDEgQzExOC4yOTEsODYuOTM1IDEyMi42MTEsNzkuNDk2IDEyMi42MTEsNzMuNDAzIEMxMjIuNjExLDcxLjQ5NCAxMjIuMTc3LDY5Ljg4IDEyMS4zNTYsNjguNzE4IEMxMjAuNTgyLDY4LjE4NSAxMTkuNjY4LDY3LjkxOSAxMTguNjM4LDY3LjkxOSBDMTE3LjMxNSw2Ny45MTkgMTE1Ljg4Myw2OC4zNiAxMTQuMzgyLDY5LjIyNyBDMTA5LjA3MSw3Mi4yOTMgMTA0Ljc1MSw3OS43MzMgMTA0Ljc1MSw4NS44MjYgQzEwNC43NTEsODcuNzM1IDEwNS4xODUsODkuMzQzIDEwNi4wMDYsOTAuNTA1IEwxMDYuMDA2LDkwLjUwNSBaIiBpZD0iRmlsbC0yMSIgZmlsbD0iIzYwN0Q4QiI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNDkuMzE4LDcuMjYyIEwxMzkuMzM0LDE2LjE0IEwxNTUuMjI3LDI3LjE3MSBMMTYwLjgxNiwyMS4wNTkgTDE0OS4zMTgsNy4yNjIiIGlkPSJGaWxsLTIyIiBmaWxsPSIjRkFGQUZBIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTE2OS42NzYsMTMuODQgTDE1OS45MjgsMTkuNDY3IEMxNTYuMjg2LDIxLjU3IDE1MC40LDIxLjU4IDE0Ni43ODEsMTkuNDkxIEMxNDMuMTYxLDE3LjQwMiAxNDMuMTgsMTQuMDAzIDE0Ni44MjIsMTEuOSBMMTU2LjMxNyw2LjI5MiBMMTQ5LjU4OCwyLjQwNyBMNjcuNzUyLDQ5LjQ3OCBMMTEzLjY3NSw3NS45OTIgTDExNi43NTYsNzQuMjEzIEMxMTcuMzg3LDczLjg0OCAxMTcuNjI1LDczLjMxNSAxMTcuMzc0LDcyLjgyMyBDMTE1LjAxNyw2OC4xOTEgMTE0Ljc4MSw2My4yNzcgMTE2LjY5MSw1OC41NjEgQzEyMi4zMjksNDQuNjQxIDE0MS4yLDMzLjc0NiAxNjUuMzA5LDMwLjQ5MSBDMTczLjQ3OCwyOS4zODggMTgxLjk4OSwyOS41MjQgMTkwLjAxMywzMC44ODUgQzE5MC44NjUsMzEuMDMgMTkxLjc4OSwzMC44OTMgMTkyLjQyLDMwLjUyOCBMMTk1LjUwMSwyOC43NSBMMTY5LjY3NiwxMy44NCIgaWQ9IkZpbGwtMjMiIGZpbGw9IiNGQUZBRkEiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTEzLjY3NSw3Ni40NTkgQzExMy41OTQsNzYuNDU5IDExMy41MTQsNzYuNDM4IDExMy40NDIsNzYuMzk3IEw2Ny41MTgsNDkuODgyIEM2Ny4zNzQsNDkuNzk5IDY3LjI4NCw0OS42NDUgNjcuMjg1LDQ5LjQ3OCBDNjcuMjg1LDQ5LjMxMSA2Ny4zNzQsNDkuMTU3IDY3LjUxOSw0OS4wNzMgTDE0OS4zNTUsMi4wMDIgQzE0OS40OTksMS45MTkgMTQ5LjY3NywxLjkxOSAxNDkuODIxLDIuMDAyIEwxNTYuNTUsNS44ODcgQzE1Ni43NzQsNi4wMTcgMTU2Ljg1LDYuMzAyIDE1Ni43MjIsNi41MjYgQzE1Ni41OTIsNi43NDkgMTU2LjMwNyw2LjgyNiAxNTYuMDgzLDYuNjk2IEwxNDkuNTg3LDIuOTQ2IEw2OC42ODcsNDkuNDc5IEwxMTMuNjc1LDc1LjQ1MiBMMTE2LjUyMyw3My44MDggQzExNi43MTUsNzMuNjk3IDExNy4xNDMsNzMuMzk5IDExNi45NTgsNzMuMDM1IEMxMTQuNTQyLDY4LjI4NyAxMTQuMyw2My4yMjEgMTE2LjI1OCw1OC4zODUgQzExOS4wNjQsNTEuNDU4IDEyNS4xNDMsNDUuMTQzIDEzMy44NCw0MC4xMjIgQzE0Mi40OTcsMzUuMTI0IDE1My4zNTgsMzEuNjMzIDE2NS4yNDcsMzAuMDI4IEMxNzMuNDQ1LDI4LjkyMSAxODIuMDM3LDI5LjA1OCAxOTAuMDkxLDMwLjQyNSBDMTkwLjgzLDMwLjU1IDE5MS42NTIsMzAuNDMyIDE5Mi4xODYsMzAuMTI0IEwxOTQuNTY3LDI4Ljc1IEwxNjkuNDQyLDE0LjI0NCBDMTY5LjIxOSwxNC4xMTUgMTY5LjE0MiwxMy44MjkgMTY5LjI3MSwxMy42MDYgQzE2OS40LDEzLjM4MiAxNjkuNjg1LDEzLjMwNiAxNjkuOTA5LDEzLjQzNSBMMTk1LjczNCwyOC4zNDUgQzE5NS44NzksMjguNDI4IDE5NS45NjgsMjguNTgzIDE5NS45NjgsMjguNzUgQzE5NS45NjgsMjguOTE2IDE5NS44NzksMjkuMDcxIDE5NS43MzQsMjkuMTU0IEwxOTIuNjUzLDMwLjkzMyBDMTkxLjkzMiwzMS4zNSAxOTAuODksMzEuNTA4IDE4OS45MzUsMzEuMzQ2IEMxODEuOTcyLDI5Ljk5NSAxNzMuNDc4LDI5Ljg2IDE2NS4zNzIsMzAuOTU0IEMxNTMuNjAyLDMyLjU0MyAxNDIuODYsMzUuOTkzIDEzNC4zMDcsNDAuOTMxIEMxMjUuNzkzLDQ1Ljg0NyAxMTkuODUxLDUyLjAwNCAxMTcuMTI0LDU4LjczNiBDMTE1LjI3LDYzLjMxNCAxMTUuNTAxLDY4LjExMiAxMTcuNzksNzIuNjExIEMxMTguMTYsNzMuMzM2IDExNy44NDUsNzQuMTI0IDExNi45OSw3NC42MTcgTDExMy45MDksNzYuMzk3IEMxMTMuODM2LDc2LjQzOCAxMTMuNzU2LDc2LjQ1OSAxMTMuNjc1LDc2LjQ1OSIgaWQ9IkZpbGwtMjQiIGZpbGw9IiM0NTVBNjQiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTUzLjMxNiwyMS4yNzkgQzE1MC45MDMsMjEuMjc5IDE0OC40OTUsMjAuNzUxIDE0Ni42NjQsMTkuNjkzIEMxNDQuODQ2LDE4LjY0NCAxNDMuODQ0LDE3LjIzMiAxNDMuODQ0LDE1LjcxOCBDMTQzLjg0NCwxNC4xOTEgMTQ0Ljg2LDEyLjc2MyAxNDYuNzA1LDExLjY5OCBMMTU2LjE5OCw2LjA5MSBDMTU2LjMwOSw2LjAyNSAxNTYuNDUyLDYuMDYyIDE1Ni41MTgsNi4xNzMgQzE1Ni41ODMsNi4yODQgMTU2LjU0Nyw2LjQyNyAxNTYuNDM2LDYuNDkzIEwxNDYuOTQsMTIuMTAyIEMxNDUuMjQ0LDEzLjA4MSAxNDQuMzEyLDE0LjM2NSAxNDQuMzEyLDE1LjcxOCBDMTQ0LjMxMiwxNy4wNTggMTQ1LjIzLDE4LjMyNiAxNDYuODk3LDE5LjI4OSBDMTUwLjQ0NiwyMS4zMzggMTU2LjI0LDIxLjMyNyAxNTkuODExLDE5LjI2NSBMMTY5LjU1OSwxMy42MzcgQzE2OS42NywxMy41NzMgMTY5LjgxMywxMy42MTEgMTY5Ljg3OCwxMy43MjMgQzE2OS45NDMsMTMuODM0IDE2OS45MDQsMTMuOTc3IDE2OS43OTMsMTQuMDQyIEwxNjAuMDQ1LDE5LjY3IEMxNTguMTg3LDIwLjc0MiAxNTUuNzQ5LDIxLjI3OSAxNTMuMzE2LDIxLjI3OSIgaWQ9IkZpbGwtMjUiIGZpbGw9IiM2MDdEOEIiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTEzLjY3NSw3NS45OTIgTDY3Ljc2Miw0OS40ODQiIGlkPSJGaWxsLTI2IiBmaWxsPSIjNDU1QTY0Ij48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTExMy42NzUsNzYuMzQyIEMxMTMuNjE1LDc2LjM0MiAxMTMuNTU1LDc2LjMyNyAxMTMuNSw3Ni4yOTUgTDY3LjU4Nyw0OS43ODcgQzY3LjQxOSw0OS42OSA2Ny4zNjIsNDkuNDc2IDY3LjQ1OSw0OS4zMDkgQzY3LjU1Niw0OS4xNDEgNjcuNzcsNDkuMDgzIDY3LjkzNyw0OS4xOCBMMTEzLjg1LDc1LjY4OCBDMTE0LjAxOCw3NS43ODUgMTE0LjA3NSw3NiAxMTMuOTc4LDc2LjE2NyBDMTEzLjkxNCw3Ni4yNzkgMTEzLjc5Niw3Ni4zNDIgMTEzLjY3NSw3Ni4zNDIiIGlkPSJGaWxsLTI3IiBmaWxsPSIjNDU1QTY0Ij48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTY3Ljc2Miw0OS40ODQgTDY3Ljc2MiwxMDMuNDg1IEM2Ny43NjIsMTA0LjU3NSA2OC41MzIsMTA1LjkwMyA2OS40ODIsMTA2LjQ1MiBMMTExLjk1NSwxMzAuOTczIEMxMTIuOTA1LDEzMS41MjIgMTEzLjY3NSwxMzEuMDgzIDExMy42NzUsMTI5Ljk5MyBMMTEzLjY3NSw3NS45OTIiIGlkPSJGaWxsLTI4IiBmaWxsPSIjRkFGQUZBIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTExMi43MjcsMTMxLjU2MSBDMTEyLjQzLDEzMS41NjEgMTEyLjEwNywxMzEuNDY2IDExMS43OCwxMzEuMjc2IEw2OS4zMDcsMTA2Ljc1NSBDNjguMjQ0LDEwNi4xNDIgNjcuNDEyLDEwNC43MDUgNjcuNDEyLDEwMy40ODUgTDY3LjQxMiw0OS40ODQgQzY3LjQxMiw0OS4yOSA2Ny41NjksNDkuMTM0IDY3Ljc2Miw0OS4xMzQgQzY3Ljk1Niw0OS4xMzQgNjguMTEzLDQ5LjI5IDY4LjExMyw0OS40ODQgTDY4LjExMywxMDMuNDg1IEM2OC4xMTMsMTA0LjQ0NSA2OC44MiwxMDUuNjY1IDY5LjY1NywxMDYuMTQ4IEwxMTIuMTMsMTMwLjY3IEMxMTIuNDc0LDEzMC44NjggMTEyLjc5MSwxMzAuOTEzIDExMywxMzAuNzkyIEMxMTMuMjA2LDEzMC42NzMgMTEzLjMyNSwxMzAuMzgxIDExMy4zMjUsMTI5Ljk5MyBMMTEzLjMyNSw3NS45OTIgQzExMy4zMjUsNzUuNzk4IDExMy40ODIsNzUuNjQxIDExMy42NzUsNzUuNjQxIEMxMTMuODY5LDc1LjY0MSAxMTQuMDI1LDc1Ljc5OCAxMTQuMDI1LDc1Ljk5MiBMMTE0LjAyNSwxMjkuOTkzIEMxMTQuMDI1LDEzMC42NDggMTEzLjc4NiwxMzEuMTQ3IDExMy4zNSwxMzEuMzk5IEMxMTMuMTYyLDEzMS41MDcgMTEyLjk1MiwxMzEuNTYxIDExMi43MjcsMTMxLjU2MSIgaWQ9IkZpbGwtMjkiIGZpbGw9IiM0NTVBNjQiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTEyLjg2LDQwLjUxMiBDMTEyLjg2LDQwLjUxMiAxMTIuODYsNDAuNTEyIDExMi44NTksNDAuNTEyIEMxMTAuNTQxLDQwLjUxMiAxMDguMzYsMzkuOTkgMTA2LjcxNywzOS4wNDEgQzEwNS4wMTIsMzguMDU3IDEwNC4wNzQsMzYuNzI2IDEwNC4wNzQsMzUuMjkyIEMxMDQuMDc0LDMzLjg0NyAxMDUuMDI2LDMyLjUwMSAxMDYuNzU0LDMxLjUwNCBMMTE4Ljc5NSwyNC41NTEgQzEyMC40NjMsMjMuNTg5IDEyMi42NjksMjMuMDU4IDEyNS4wMDcsMjMuMDU4IEMxMjcuMzI1LDIzLjA1OCAxMjkuNTA2LDIzLjU4MSAxMzEuMTUsMjQuNTMgQzEzMi44NTQsMjUuNTE0IDEzMy43OTMsMjYuODQ1IDEzMy43OTMsMjguMjc4IEMxMzMuNzkzLDI5LjcyNCAxMzIuODQxLDMxLjA2OSAxMzEuMTEzLDMyLjA2NyBMMTE5LjA3MSwzOS4wMTkgQzExNy40MDMsMzkuOTgyIDExNS4xOTcsNDAuNTEyIDExMi44Niw0MC41MTIgTDExMi44Niw0MC41MTIgWiBNMTI1LjAwNywyMy43NTkgQzEyMi43OSwyMy43NTkgMTIwLjcwOSwyNC4yNTYgMTE5LjE0NiwyNS4xNTggTDEwNy4xMDQsMzIuMTEgQzEwNS42MDIsMzIuOTc4IDEwNC43NzQsMzQuMTA4IDEwNC43NzQsMzUuMjkyIEMxMDQuNzc0LDM2LjQ2NSAxMDUuNTg5LDM3LjU4MSAxMDcuMDY3LDM4LjQzNCBDMTA4LjYwNSwzOS4zMjMgMTEwLjY2MywzOS44MTIgMTEyLjg1OSwzOS44MTIgTDExMi44NiwzOS44MTIgQzExNS4wNzYsMzkuODEyIDExNy4xNTgsMzkuMzE1IDExOC43MjEsMzguNDEzIEwxMzAuNzYyLDMxLjQ2IEMxMzIuMjY0LDMwLjU5MyAxMzMuMDkyLDI5LjQ2MyAxMzMuMDkyLDI4LjI3OCBDMTMzLjA5MiwyNy4xMDYgMTMyLjI3OCwyNS45OSAxMzAuOCwyNS4xMzYgQzEyOS4yNjEsMjQuMjQ4IDEyNy4yMDQsMjMuNzU5IDEyNS4wMDcsMjMuNzU5IEwxMjUuMDA3LDIzLjc1OSBaIiBpZD0iRmlsbC0zMCIgZmlsbD0iIzYwN0Q4QiI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNjUuNjMsMTYuMjE5IEwxNTkuODk2LDE5LjUzIEMxNTYuNzI5LDIxLjM1OCAxNTEuNjEsMjEuMzY3IDE0OC40NjMsMTkuNTUgQzE0NS4zMTYsMTcuNzMzIDE0NS4zMzIsMTQuNzc4IDE0OC40OTksMTIuOTQ5IEwxNTQuMjMzLDkuNjM5IEwxNjUuNjMsMTYuMjE5IiBpZD0iRmlsbC0zMSIgZmlsbD0iI0ZBRkFGQSI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNTQuMjMzLDEwLjQ0OCBMMTY0LjIyOCwxNi4yMTkgTDE1OS41NDYsMTguOTIzIEMxNTguMTEyLDE5Ljc1IDE1Ni4xOTQsMjAuMjA2IDE1NC4xNDcsMjAuMjA2IEMxNTIuMTE4LDIwLjIwNiAxNTAuMjI0LDE5Ljc1NyAxNDguODE0LDE4Ljk0MyBDMTQ3LjUyNCwxOC4xOTkgMTQ2LjgxNCwxNy4yNDkgMTQ2LjgxNCwxNi4yNjkgQzE0Ni44MTQsMTUuMjc4IDE0Ny41MzcsMTQuMzE0IDE0OC44NSwxMy41NTYgTDE1NC4yMzMsMTAuNDQ4IE0xNTQuMjMzLDkuNjM5IEwxNDguNDk5LDEyLjk0OSBDMTQ1LjMzMiwxNC43NzggMTQ1LjMxNiwxNy43MzMgMTQ4LjQ2MywxOS41NSBDMTUwLjAzMSwyMC40NTUgMTUyLjA4NiwyMC45MDcgMTU0LjE0NywyMC45MDcgQzE1Ni4yMjQsMjAuOTA3IDE1OC4zMDYsMjAuNDQ3IDE1OS44OTYsMTkuNTMgTDE2NS42MywxNi4yMTkgTDE1NC4yMzMsOS42MzkiIGlkPSJGaWxsLTMyIiBmaWxsPSIjNjA3RDhCIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTE0NS40NDUsNzIuNjY3IEwxNDUuNDQ1LDcyLjY2NyBDMTQzLjY3Miw3Mi42NjcgMTQyLjIwNCw3MS44MTcgMTQxLjIwMiw3MC40MjIgQzE0MS4xMzUsNzAuMzMgMTQxLjE0NSw3MC4xNDcgMTQxLjIyNSw3MC4wNjYgQzE0MS4zMDUsNjkuOTg1IDE0MS40MzIsNjkuOTQ2IDE0MS41MjUsNzAuMDExIEMxNDIuMzA2LDcwLjU1OSAxNDMuMjMxLDcwLjgyMyAxNDQuMjc2LDcwLjgyMiBDMTQ1LjU5OCw3MC44MjIgMTQ3LjAzLDcwLjM3NiAxNDguNTMyLDY5LjUwOSBDMTUzLjg0Miw2Ni40NDMgMTU4LjE2Myw1OC45ODcgMTU4LjE2Myw1Mi44OTQgQzE1OC4xNjMsNTAuOTY3IDE1Ny43MjEsNDkuMzMyIDE1Ni44ODQsNDguMTY4IEMxNTYuODE4LDQ4LjA3NiAxNTYuODI4LDQ3Ljk0OCAxNTYuOTA4LDQ3Ljg2NyBDMTU2Ljk4OCw0Ny43ODYgMTU3LjExNCw0Ny43NzQgMTU3LjIwOCw0Ny44NCBDMTU4Ljg3OCw0OS4wMTIgMTU5Ljc5OCw1MS4yMiAxNTkuNzk4LDU0LjA1OSBDMTU5Ljc5OCw2MC4zMDEgMTU1LjM3Myw2OC4wNDYgMTQ5LjkzMyw3MS4xODYgQzE0OC4zNiw3Mi4wOTQgMTQ2Ljg1LDcyLjY2NyAxNDUuNDQ1LDcyLjY2NyBMMTQ1LjQ0NSw3Mi42NjcgWiBNMTQyLjQ3Niw3MSBDMTQzLjI5LDcxLjY1MSAxNDQuMjk2LDcyLjAwMiAxNDUuNDQ1LDcyLjAwMiBDMTQ2Ljc2Nyw3Mi4wMDIgMTQ4LjE5OCw3MS41NSAxNDkuNyw3MC42ODIgQzE1NS4wMSw2Ny42MTcgMTU5LjMzMSw2MC4xNTkgMTU5LjMzMSw1NC4wNjUgQzE1OS4zMzEsNTIuMDg1IDE1OC44NjgsNTAuNDM1IDE1OC4wMDYsNDkuMjcyIEMxNTguNDE3LDUwLjMwNyAxNTguNjMsNTEuNTMyIDE1OC42Myw1Mi44OTIgQzE1OC42Myw1OS4xMzQgMTU0LjIwNSw2Ni43NjcgMTQ4Ljc2NSw2OS45MDcgQzE0Ny4xOTIsNzAuODE2IDE0NS42ODEsNzEuMjgzIDE0NC4yNzYsNzEuMjgzIEMxNDMuNjM0LDcxLjI4MyAxNDMuMDMzLDcxLjE5MiAxNDIuNDc2LDcxIEwxNDIuNDc2LDcxIFoiIGlkPSJGaWxsLTMzIiBmaWxsPSIjNjA3RDhCIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTE0OC42NDgsNjkuNzA0IEMxNTQuMDMyLDY2LjU5NiAxNTguMzk2LDU5LjA2OCAxNTguMzk2LDUyLjg5MSBDMTU4LjM5Niw1MC44MzkgMTU3LjkxMyw0OS4xOTggMTU3LjA3NCw0OC4wMyBDMTU1LjI4OSw0Ni43NzggMTUyLjY5OSw0Ni44MzYgMTQ5LjgxNiw0OC41MDEgQzE0NC40MzMsNTEuNjA5IDE0MC4wNjgsNTkuMTM3IDE0MC4wNjgsNjUuMzE0IEMxNDAuMDY4LDY3LjM2NSAxNDAuNTUyLDY5LjAwNiAxNDEuMzkxLDcwLjE3NCBDMTQzLjE3Niw3MS40MjcgMTQ1Ljc2NSw3MS4zNjkgMTQ4LjY0OCw2OS43MDQiIGlkPSJGaWxsLTM0IiBmaWxsPSIjRkFGQUZBIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTE0NC4yNzYsNzEuMjc2IEwxNDQuMjc2LDcxLjI3NiBDMTQzLjEzMyw3MS4yNzYgMTQyLjExOCw3MC45NjkgMTQxLjI1Nyw3MC4zNjUgQzE0MS4yMzYsNzAuMzUxIDE0MS4yMTcsNzAuMzMyIDE0MS4yMDIsNzAuMzExIEMxNDAuMzA3LDY5LjA2NyAxMzkuODM1LDY3LjMzOSAxMzkuODM1LDY1LjMxNCBDMTM5LjgzNSw1OS4wNzMgMTQ0LjI2LDUxLjQzOSAxNDkuNyw0OC4yOTggQzE1MS4yNzMsNDcuMzkgMTUyLjc4NCw0Ni45MjkgMTU0LjE4OSw0Ni45MjkgQzE1NS4zMzIsNDYuOTI5IDE1Ni4zNDcsNDcuMjM2IDE1Ny4yMDgsNDcuODM5IEMxNTcuMjI5LDQ3Ljg1NCAxNTcuMjQ4LDQ3Ljg3MyAxNTcuMjYzLDQ3Ljg5NCBDMTU4LjE1Nyw0OS4xMzggMTU4LjYzLDUwLjg2NSAxNTguNjMsNTIuODkxIEMxNTguNjMsNTkuMTMyIDE1NC4yMDUsNjYuNzY2IDE0OC43NjUsNjkuOTA3IEMxNDcuMTkyLDcwLjgxNSAxNDUuNjgxLDcxLjI3NiAxNDQuMjc2LDcxLjI3NiBMMTQ0LjI3Niw3MS4yNzYgWiBNMTQxLjU1OCw3MC4xMDQgQzE0Mi4zMzEsNzAuNjM3IDE0My4yNDUsNzEuMDA1IDE0NC4yNzYsNzEuMDA1IEMxNDUuNTk4LDcxLjAwNSAxNDcuMDMsNzAuNDY3IDE0OC41MzIsNjkuNiBDMTUzLjg0Miw2Ni41MzQgMTU4LjE2Myw1OS4wMzMgMTU4LjE2Myw1Mi45MzkgQzE1OC4xNjMsNTEuMDMxIDE1Ny43MjksNDkuMzg1IDE1Ni45MDcsNDguMjIzIEMxNTYuMTMzLDQ3LjY5MSAxNTUuMjE5LDQ3LjQwOSAxNTQuMTg5LDQ3LjQwOSBDMTUyLjg2Nyw0Ny40MDkgMTUxLjQzNSw0Ny44NDIgMTQ5LjkzMyw0OC43MDkgQzE0NC42MjMsNTEuNzc1IDE0MC4zMDIsNTkuMjczIDE0MC4zMDIsNjUuMzY2IEMxNDAuMzAyLDY3LjI3NiAxNDAuNzM2LDY4Ljk0MiAxNDEuNTU4LDcwLjEwNCBMMTQxLjU1OCw3MC4xMDQgWiIgaWQ9IkZpbGwtMzUiIGZpbGw9IiM2MDdEOEIiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTUwLjcyLDY1LjM2MSBMMTUwLjM1Nyw2NS4wNjYgQzE1MS4xNDcsNjQuMDkyIDE1MS44NjksNjMuMDQgMTUyLjUwNSw2MS45MzggQzE1My4zMTMsNjAuNTM5IDE1My45NzgsNTkuMDY3IDE1NC40ODIsNTcuNTYzIEwxNTQuOTI1LDU3LjcxMiBDMTU0LjQxMiw1OS4yNDUgMTUzLjczMyw2MC43NDUgMTUyLjkxLDYyLjE3MiBDMTUyLjI2Miw2My4yOTUgMTUxLjUyNSw2NC4zNjggMTUwLjcyLDY1LjM2MSIgaWQ9IkZpbGwtMzYiIGZpbGw9IiM2MDdEOEIiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTE1LjkxNyw4NC41MTQgTDExNS41NTQsODQuMjIgQzExNi4zNDQsODMuMjQ1IDExNy4wNjYsODIuMTk0IDExNy43MDIsODEuMDkyIEMxMTguNTEsNzkuNjkyIDExOS4xNzUsNzguMjIgMTE5LjY3OCw3Ni43MTcgTDEyMC4xMjEsNzYuODY1IEMxMTkuNjA4LDc4LjM5OCAxMTguOTMsNzkuODk5IDExOC4xMDYsODEuMzI2IEMxMTcuNDU4LDgyLjQ0OCAxMTYuNzIyLDgzLjUyMSAxMTUuOTE3LDg0LjUxNCIgaWQ9IkZpbGwtMzciIGZpbGw9IiM2MDdEOEIiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTE0LDEzMC40NzYgTDExNCwxMzAuMDA4IEwxMTQsNzYuMDUyIEwxMTQsNzUuNTg0IEwxMTQsNzYuMDUyIEwxMTQsMTMwLjAwOCBMMTE0LDEzMC40NzYiIGlkPSJGaWxsLTM4IiBmaWxsPSIjNjA3RDhCIj48L3BhdGg+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8ZyBpZD0iSW1wb3J0ZWQtTGF5ZXJzLUNvcHkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDYyLjAwMDAwMCwgMC4wMDAwMDApIiBza2V0Y2g6dHlwZT0iTVNTaGFwZUdyb3VwIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTkuODIyLDM3LjQ3NCBDMTkuODM5LDM3LjMzOSAxOS43NDcsMzcuMTk0IDE5LjU1NSwzNy4wODIgQzE5LjIyOCwzNi44OTQgMTguNzI5LDM2Ljg3MiAxOC40NDYsMzcuMDM3IEwxMi40MzQsNDAuNTA4IEMxMi4zMDMsNDAuNTg0IDEyLjI0LDQwLjY4NiAxMi4yNDMsNDAuNzkzIEMxMi4yNDUsNDAuOTI1IDEyLjI0NSw0MS4yNTQgMTIuMjQ1LDQxLjM3MSBMMTIuMjQ1LDQxLjQxNCBMMTIuMjM4LDQxLjU0MiBDOC4xNDgsNDMuODg3IDUuNjQ3LDQ1LjMyMSA1LjY0Nyw0NS4zMjEgQzUuNjQ2LDQ1LjMyMSAzLjU3LDQ2LjM2NyAyLjg2LDUwLjUxMyBDMi44Niw1MC41MTMgMS45NDgsNTcuNDc0IDEuOTYyLDcwLjI1OCBDMS45NzcsODIuODI4IDIuNTY4LDg3LjMyOCAzLjEyOSw5MS42MDkgQzMuMzQ5LDkzLjI5MyA2LjEzLDkzLjczNCA2LjEzLDkzLjczNCBDNi40NjEsOTMuNzc0IDYuODI4LDkzLjcwNyA3LjIxLDkzLjQ4NiBMODIuNDgzLDQ5LjkzNSBDODQuMjkxLDQ4Ljg2NiA4NS4xNSw0Ni4yMTYgODUuNTM5LDQzLjY1MSBDODYuNzUyLDM1LjY2MSA4Ny4yMTQsMTAuNjczIDg1LjI2NCwzLjc3MyBDODUuMDY4LDMuMDggODQuNzU0LDIuNjkgODQuMzk2LDIuNDkxIEw4Mi4zMSwxLjcwMSBDODEuNTgzLDEuNzI5IDgwLjg5NCwyLjE2OCA4MC43NzYsMi4yMzYgQzgwLjYzNiwyLjMxNyA0MS44MDcsMjQuNTg1IDIwLjAzMiwzNy4wNzIgTDE5LjgyMiwzNy40NzQiIGlkPSJGaWxsLTEiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNODIuMzExLDEuNzAxIEw4NC4zOTYsMi40OTEgQzg0Ljc1NCwyLjY5IDg1LjA2OCwzLjA4IDg1LjI2NCwzLjc3MyBDODcuMjEzLDEwLjY3MyA4Ni43NTEsMzUuNjYgODUuNTM5LDQzLjY1MSBDODUuMTQ5LDQ2LjIxNiA4NC4yOSw0OC44NjYgODIuNDgzLDQ5LjkzNSBMNy4yMSw5My40ODYgQzYuODk3LDkzLjY2NyA2LjU5NSw5My43NDQgNi4zMTQsOTMuNzQ0IEw2LjEzMSw5My43MzMgQzYuMTMxLDkzLjczNCAzLjM0OSw5My4yOTMgMy4xMjgsOTEuNjA5IEMyLjU2OCw4Ny4zMjcgMS45NzcsODIuODI4IDEuOTYzLDcwLjI1OCBDMS45NDgsNTcuNDc0IDIuODYsNTAuNTEzIDIuODYsNTAuNTEzIEMzLjU3LDQ2LjM2NyA1LjY0Nyw0NS4zMjEgNS42NDcsNDUuMzIxIEM1LjY0Nyw0NS4zMjEgOC4xNDgsNDMuODg3IDEyLjIzOCw0MS41NDIgTDEyLjI0NSw0MS40MTQgTDEyLjI0NSw0MS4zNzEgQzEyLjI0NSw0MS4yNTQgMTIuMjQ1LDQwLjkyNSAxMi4yNDMsNDAuNzkzIEMxMi4yNCw0MC42ODYgMTIuMzAyLDQwLjU4MyAxMi40MzQsNDAuNTA4IEwxOC40NDYsMzcuMDM2IEMxOC41NzQsMzYuOTYyIDE4Ljc0NiwzNi45MjYgMTguOTI3LDM2LjkyNiBDMTkuMTQ1LDM2LjkyNiAxOS4zNzYsMzYuOTc5IDE5LjU1NCwzNy4wODIgQzE5Ljc0NywzNy4xOTQgMTkuODM5LDM3LjM0IDE5LjgyMiwzNy40NzQgTDIwLjAzMywzNy4wNzIgQzQxLjgwNiwyNC41ODUgODAuNjM2LDIuMzE4IDgwLjc3NywyLjIzNiBDODAuODk0LDIuMTY4IDgxLjU4MywxLjcyOSA4Mi4zMTEsMS43MDEgTTgyLjMxMSwwLjcwNCBMODIuMjcyLDAuNzA1IEM4MS42NTQsMC43MjggODAuOTg5LDAuOTQ5IDgwLjI5OCwxLjM2MSBMODAuMjc3LDEuMzczIEM4MC4xMjksMS40NTggNTkuNzY4LDEzLjEzNSAxOS43NTgsMzYuMDc5IEMxOS41LDM1Ljk4MSAxOS4yMTQsMzUuOTI5IDE4LjkyNywzNS45MjkgQzE4LjU2MiwzNS45MjkgMTguMjIzLDM2LjAxMyAxNy45NDcsMzYuMTczIEwxMS45MzUsMzkuNjQ0IEMxMS40OTMsMzkuODk5IDExLjIzNiw0MC4zMzQgMTEuMjQ2LDQwLjgxIEwxMS4yNDcsNDAuOTYgTDUuMTY3LDQ0LjQ0NyBDNC43OTQsNDQuNjQ2IDIuNjI1LDQ1Ljk3OCAxLjg3Nyw1MC4zNDUgTDEuODcxLDUwLjM4NCBDMS44NjIsNTAuNDU0IDAuOTUxLDU3LjU1NyAwLjk2NSw3MC4yNTkgQzAuOTc5LDgyLjg3OSAxLjU2OCw4Ny4zNzUgMi4xMzcsOTEuNzI0IEwyLjEzOSw5MS43MzkgQzIuNDQ3LDk0LjA5NCA1LjYxNCw5NC42NjIgNS45NzUsOTQuNzE5IEw2LjAwOSw5NC43MjMgQzYuMTEsOTQuNzM2IDYuMjEzLDk0Ljc0MiA2LjMxNCw5NC43NDIgQzYuNzksOTQuNzQyIDcuMjYsOTQuNjEgNy43MSw5NC4zNSBMODIuOTgzLDUwLjc5OCBDODQuNzk0LDQ5LjcyNyA4NS45ODIsNDcuMzc1IDg2LjUyNSw0My44MDEgQzg3LjcxMSwzNS45ODcgODguMjU5LDEwLjcwNSA4Ni4yMjQsMy41MDIgQzg1Ljk3MSwyLjYwOSA4NS41MiwxLjk3NSA4NC44ODEsMS42MiBMODQuNzQ5LDEuNTU4IEw4Mi42NjQsMC43NjkgQzgyLjU1MSwwLjcyNSA4Mi40MzEsMC43MDQgODIuMzExLDAuNzA0IiBpZD0iRmlsbC0yIiBmaWxsPSIjNDU1QTY0Ij48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTY2LjI2NywxMS41NjUgTDY3Ljc2MiwxMS45OTkgTDExLjQyMyw0NC4zMjUiIGlkPSJGaWxsLTMiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTIuMjAyLDkwLjU0NSBDMTIuMDI5LDkwLjU0NSAxMS44NjIsOTAuNDU1IDExLjc2OSw5MC4yOTUgQzExLjYzMiw5MC4wNTcgMTEuNzEzLDg5Ljc1MiAxMS45NTIsODkuNjE0IEwzMC4zODksNzguOTY5IEMzMC42MjgsNzguODMxIDMwLjkzMyw3OC45MTMgMzEuMDcxLDc5LjE1MiBDMzEuMjA4LDc5LjM5IDMxLjEyNyw3OS42OTYgMzAuODg4LDc5LjgzMyBMMTIuNDUxLDkwLjQ3OCBMMTIuMjAyLDkwLjU0NSIgaWQ9IkZpbGwtNCIgZmlsbD0iIzYwN0Q4QiI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMy43NjQsNDIuNjU0IEwxMy42NTYsNDIuNTkyIEwxMy43MDIsNDIuNDIxIEwxOC44MzcsMzkuNDU3IEwxOS4wMDcsMzkuNTAyIEwxOC45NjIsMzkuNjczIEwxMy44MjcsNDIuNjM3IEwxMy43NjQsNDIuNjU0IiBpZD0iRmlsbC01IiBmaWxsPSIjNjA3RDhCIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTguNTIsOTAuMzc1IEw4LjUyLDQ2LjQyMSBMOC41ODMsNDYuMzg1IEw3NS44NCw3LjU1NCBMNzUuODQsNTEuNTA4IEw3NS43NzgsNTEuNTQ0IEw4LjUyLDkwLjM3NSBMOC41Miw5MC4zNzUgWiBNOC43Nyw0Ni41NjQgTDguNzcsODkuOTQ0IEw3NS41OTEsNTEuMzY1IEw3NS41OTEsNy45ODUgTDguNzcsNDYuNTY0IEw4Ljc3LDQ2LjU2NCBaIiBpZD0iRmlsbC02IiBmaWxsPSIjNjA3RDhCIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTI0Ljk4Niw4My4xODIgQzI0Ljc1Niw4My4zMzEgMjQuMzc0LDgzLjU2NiAyNC4xMzcsODMuNzA1IEwxMi42MzIsOTAuNDA2IEMxMi4zOTUsOTAuNTQ1IDEyLjQyNiw5MC42NTggMTIuNyw5MC42NTggTDEzLjI2NSw5MC42NTggQzEzLjU0LDkwLjY1OCAxMy45NTgsOTAuNTQ1IDE0LjE5NSw5MC40MDYgTDI1LjcsODMuNzA1IEMyNS45MzcsODMuNTY2IDI2LjEyOCw4My40NTIgMjYuMTI1LDgzLjQ0OSBDMjYuMTIyLDgzLjQ0NyAyNi4xMTksODMuMjIgMjYuMTE5LDgyLjk0NiBDMjYuMTE5LDgyLjY3MiAyNS45MzEsODIuNTY5IDI1LjcwMSw4Mi43MTkgTDI0Ljk4Niw4My4xODIiIGlkPSJGaWxsLTciIGZpbGw9IiM2MDdEOEIiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTMuMjY2LDkwLjc4MiBMMTIuNyw5MC43ODIgQzEyLjUsOTAuNzgyIDEyLjM4NCw5MC43MjYgMTIuMzU0LDkwLjYxNiBDMTIuMzI0LDkwLjUwNiAxMi4zOTcsOTAuMzk5IDEyLjU2OSw5MC4yOTkgTDI0LjA3NCw4My41OTcgQzI0LjMxLDgzLjQ1OSAyNC42ODksODMuMjI2IDI0LjkxOCw4My4wNzggTDI1LjYzMyw4Mi42MTQgQzI1LjcyMyw4Mi41NTUgMjUuODEzLDgyLjUyNSAyNS44OTksODIuNTI1IEMyNi4wNzEsODIuNTI1IDI2LjI0NCw4Mi42NTUgMjYuMjQ0LDgyLjk0NiBDMjYuMjQ0LDgzLjE2IDI2LjI0NSw4My4zMDkgMjYuMjQ3LDgzLjM4MyBMMjYuMjUzLDgzLjM4NyBMMjYuMjQ5LDgzLjQ1NiBDMjYuMjQ2LDgzLjUzMSAyNi4yNDYsODMuNTMxIDI1Ljc2Myw4My44MTIgTDE0LjI1OCw5MC41MTQgQzE0LDkwLjY2NSAxMy41NjQsOTAuNzgyIDEzLjI2Niw5MC43ODIgTDEzLjI2Niw5MC43ODIgWiBNMTIuNjY2LDkwLjUzMiBMMTIuNyw5MC41MzMgTDEzLjI2Niw5MC41MzMgQzEzLjUxOCw5MC41MzMgMTMuOTE1LDkwLjQyNSAxNC4xMzIsOTAuMjk5IEwyNS42MzcsODMuNTk3IEMyNS44MDUsODMuNDk5IDI1LjkzMSw4My40MjQgMjUuOTk4LDgzLjM4MyBDMjUuOTk0LDgzLjI5OSAyNS45OTQsODMuMTY1IDI1Ljk5NCw4Mi45NDYgTDI1Ljg5OSw4Mi43NzUgTDI1Ljc2OCw4Mi44MjQgTDI1LjA1NCw4My4yODcgQzI0LjgyMiw4My40MzcgMjQuNDM4LDgzLjY3MyAyNC4yLDgzLjgxMiBMMTIuNjk1LDkwLjUxNCBMMTIuNjY2LDkwLjUzMiBMMTIuNjY2LDkwLjUzMiBaIiBpZD0iRmlsbC04IiBmaWxsPSIjNjA3RDhCIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTEzLjI2Niw4OS44NzEgTDEyLjcsODkuODcxIEMxMi41LDg5Ljg3MSAxMi4zODQsODkuODE1IDEyLjM1NCw4OS43MDUgQzEyLjMyNCw4OS41OTUgMTIuMzk3LDg5LjQ4OCAxMi41NjksODkuMzg4IEwyNC4wNzQsODIuNjg2IEMyNC4zMzIsODIuNTM1IDI0Ljc2OCw4Mi40MTggMjUuMDY3LDgyLjQxOCBMMjUuNjMyLDgyLjQxOCBDMjUuODMyLDgyLjQxOCAyNS45NDgsODIuNDc0IDI1Ljk3OCw4Mi41ODQgQzI2LjAwOCw4Mi42OTQgMjUuOTM1LDgyLjgwMSAyNS43NjMsODIuOTAxIEwxNC4yNTgsODkuNjAzIEMxNCw4OS43NTQgMTMuNTY0LDg5Ljg3MSAxMy4yNjYsODkuODcxIEwxMy4yNjYsODkuODcxIFogTTEyLjY2Niw4OS42MjEgTDEyLjcsODkuNjIyIEwxMy4yNjYsODkuNjIyIEMxMy41MTgsODkuNjIyIDEzLjkxNSw4OS41MTUgMTQuMTMyLDg5LjM4OCBMMjUuNjM3LDgyLjY4NiBMMjUuNjY3LDgyLjY2OCBMMjUuNjMyLDgyLjY2NyBMMjUuMDY3LDgyLjY2NyBDMjQuODE1LDgyLjY2NyAyNC40MTgsODIuNzc1IDI0LjIsODIuOTAxIEwxMi42OTUsODkuNjAzIEwxMi42NjYsODkuNjIxIEwxMi42NjYsODkuNjIxIFoiIGlkPSJGaWxsLTkiIGZpbGw9IiM2MDdEOEIiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTIuMzcsOTAuODAxIEwxMi4zNyw4OS41NTQgTDEyLjM3LDkwLjgwMSIgaWQ9IkZpbGwtMTAiIGZpbGw9IiM2MDdEOEIiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNi4xMyw5My45MDEgQzUuMzc5LDkzLjgwOCA0LjgxNiw5My4xNjQgNC42OTEsOTIuNTI1IEMzLjg2LDg4LjI4NyAzLjU0LDgzLjc0MyAzLjUyNiw3MS4xNzMgQzMuNTExLDU4LjM4OSA0LjQyMyw1MS40MjggNC40MjMsNTEuNDI4IEM1LjEzNCw0Ny4yODIgNy4yMSw0Ni4yMzYgNy4yMSw0Ni4yMzYgQzcuMjEsNDYuMjM2IDgxLjY2NywzLjI1IDgyLjA2OSwzLjAxNyBDODIuMjkyLDIuODg4IDg0LjU1NiwxLjQzMyA4NS4yNjQsMy45NCBDODcuMjE0LDEwLjg0IDg2Ljc1MiwzNS44MjcgODUuNTM5LDQzLjgxOCBDODUuMTUsNDYuMzgzIDg0LjI5MSw0OS4wMzMgODIuNDgzLDUwLjEwMSBMNy4yMSw5My42NTMgQzYuODI4LDkzLjg3NCA2LjQ2MSw5My45NDEgNi4xMyw5My45MDEgQzYuMTMsOTMuOTAxIDMuMzQ5LDkzLjQ2IDMuMTI5LDkxLjc3NiBDMi41NjgsODcuNDk1IDEuOTc3LDgyLjk5NSAxLjk2Miw3MC40MjUgQzEuOTQ4LDU3LjY0MSAyLjg2LDUwLjY4IDIuODYsNTAuNjggQzMuNTcsNDYuNTM0IDUuNjQ3LDQ1LjQ4OSA1LjY0Nyw0NS40ODkgQzUuNjQ2LDQ1LjQ4OSA4LjA2NSw0NC4wOTIgMTIuMjQ1LDQxLjY3OSBMMTMuMTE2LDQxLjU2IEwxOS43MTUsMzcuNzMgTDE5Ljc2MSwzNy4yNjkgTDYuMTMsOTMuOTAxIiBpZD0iRmlsbC0xMSIgZmlsbD0iI0ZBRkFGQSI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik02LjMxNyw5NC4xNjEgTDYuMTAyLDk0LjE0OCBMNi4xMDEsOTQuMTQ4IEw1Ljg1Nyw5NC4xMDEgQzUuMTM4LDkzLjk0NSAzLjA4NSw5My4zNjUgMi44ODEsOTEuODA5IEMyLjMxMyw4Ny40NjkgMS43MjcsODIuOTk2IDEuNzEzLDcwLjQyNSBDMS42OTksNTcuNzcxIDIuNjA0LDUwLjcxOCAyLjYxMyw1MC42NDggQzMuMzM4LDQ2LjQxNyA1LjQ0NSw0NS4zMSA1LjUzNSw0NS4yNjYgTDEyLjE2Myw0MS40MzkgTDEzLjAzMyw0MS4zMiBMMTkuNDc5LDM3LjU3OCBMMTkuNTEzLDM3LjI0NCBDMTkuNTI2LDM3LjEwNyAxOS42NDcsMzcuMDA4IDE5Ljc4NiwzNy4wMjEgQzE5LjkyMiwzNy4wMzQgMjAuMDIzLDM3LjE1NiAyMC4wMDksMzcuMjkzIEwxOS45NSwzNy44ODIgTDEzLjE5OCw0MS44MDEgTDEyLjMyOCw0MS45MTkgTDUuNzcyLDQ1LjcwNCBDNS43NDEsNDUuNzIgMy43ODIsNDYuNzcyIDMuMTA2LDUwLjcyMiBDMy4wOTksNTAuNzgyIDIuMTk4LDU3LjgwOCAyLjIxMiw3MC40MjQgQzIuMjI2LDgyLjk2MyAyLjgwOSw4Ny40MiAzLjM3Myw5MS43MjkgQzMuNDY0LDkyLjQyIDQuMDYyLDkyLjg4MyA0LjY4Miw5My4xODEgQzQuNTY2LDkyLjk4NCA0LjQ4Niw5Mi43NzYgNC40NDYsOTIuNTcyIEMzLjY2NSw4OC41ODggMy4yOTEsODQuMzcgMy4yNzYsNzEuMTczIEMzLjI2Miw1OC41MiA0LjE2Nyw1MS40NjYgNC4xNzYsNTEuMzk2IEM0LjkwMSw0Ny4xNjUgNy4wMDgsNDYuMDU5IDcuMDk4LDQ2LjAxNCBDNy4wOTQsNDYuMDE1IDgxLjU0MiwzLjAzNCA4MS45NDQsMi44MDIgTDgxLjk3MiwyLjc4NSBDODIuODc2LDIuMjQ3IDgzLjY5MiwyLjA5NyA4NC4zMzIsMi4zNTIgQzg0Ljg4NywyLjU3MyA4NS4yODEsMy4wODUgODUuNTA0LDMuODcyIEM4Ny41MTgsMTEgODYuOTY0LDM2LjA5MSA4NS43ODUsNDMuODU1IEM4NS4yNzgsNDcuMTk2IDg0LjIxLDQ5LjM3IDgyLjYxLDUwLjMxNyBMNy4zMzUsOTMuODY5IEM2Ljk5OSw5NC4wNjMgNi42NTgsOTQuMTYxIDYuMzE3LDk0LjE2MSBMNi4zMTcsOTQuMTYxIFogTTYuMTcsOTMuNjU0IEM2LjQ2Myw5My42OSA2Ljc3NCw5My42MTcgNy4wODUsOTMuNDM3IEw4Mi4zNTgsNDkuODg2IEM4NC4xODEsNDguODA4IDg0Ljk2LDQ1Ljk3MSA4NS4yOTIsNDMuNzggQzg2LjQ2NiwzNi4wNDkgODcuMDIzLDExLjA4NSA4NS4wMjQsNC4wMDggQzg0Ljg0NiwzLjM3NyA4NC41NTEsMi45NzYgODQuMTQ4LDIuODE2IEM4My42NjQsMi42MjMgODIuOTgyLDIuNzY0IDgyLjIyNywzLjIxMyBMODIuMTkzLDMuMjM0IEM4MS43OTEsMy40NjYgNy4zMzUsNDYuNDUyIDcuMzM1LDQ2LjQ1MiBDNy4zMDQsNDYuNDY5IDUuMzQ2LDQ3LjUyMSA0LjY2OSw1MS40NzEgQzQuNjYyLDUxLjUzIDMuNzYxLDU4LjU1NiAzLjc3NSw3MS4xNzMgQzMuNzksODQuMzI4IDQuMTYxLDg4LjUyNCA0LjkzNiw5Mi40NzYgQzUuMDI2LDkyLjkzNyA1LjQxMiw5My40NTkgNS45NzMsOTMuNjE1IEM2LjA4Nyw5My42NCA2LjE1OCw5My42NTIgNi4xNjksOTMuNjU0IEw2LjE3LDkzLjY1NCBMNi4xNyw5My42NTQgWiIgaWQ9IkZpbGwtMTIiIGZpbGw9IiM0NTVBNjQiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNy4zMTcsNjguOTgyIEM3LjgwNiw2OC43MDEgOC4yMDIsNjguOTI2IDguMjAyLDY5LjQ4NyBDOC4yMDIsNzAuMDQ3IDcuODA2LDcwLjczIDcuMzE3LDcxLjAxMiBDNi44MjksNzEuMjk0IDYuNDMzLDcxLjA2OSA2LjQzMyw3MC41MDggQzYuNDMzLDY5Ljk0OCA2LjgyOSw2OS4yNjUgNy4zMTcsNjguOTgyIiBpZD0iRmlsbC0xMyIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik02LjkyLDcxLjEzMyBDNi42MzEsNzEuMTMzIDYuNDMzLDcwLjkwNSA2LjQzMyw3MC41MDggQzYuNDMzLDY5Ljk0OCA2LjgyOSw2OS4yNjUgNy4zMTcsNjguOTgyIEM3LjQ2LDY4LjkgNy41OTUsNjguODYxIDcuNzE0LDY4Ljg2MSBDOC4wMDMsNjguODYxIDguMjAyLDY5LjA5IDguMjAyLDY5LjQ4NyBDOC4yMDIsNzAuMDQ3IDcuODA2LDcwLjczIDcuMzE3LDcxLjAxMiBDNy4xNzQsNzEuMDk0IDcuMDM5LDcxLjEzMyA2LjkyLDcxLjEzMyBNNy43MTQsNjguNjc0IEM3LjU1Nyw2OC42NzQgNy4zOTIsNjguNzIzIDcuMjI0LDY4LjgyMSBDNi42NzYsNjkuMTM4IDYuMjQ2LDY5Ljg3OSA2LjI0Niw3MC41MDggQzYuMjQ2LDcwLjk5NCA2LjUxNyw3MS4zMiA2LjkyLDcxLjMyIEM3LjA3OCw3MS4zMiA3LjI0Myw3MS4yNzEgNy40MTEsNzEuMTc0IEM3Ljk1OSw3MC44NTcgOC4zODksNzAuMTE3IDguMzg5LDY5LjQ4NyBDOC4zODksNjkuMDAxIDguMTE3LDY4LjY3NCA3LjcxNCw2OC42NzQiIGlkPSJGaWxsLTE0IiBmaWxsPSIjODA5N0EyIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTYuOTIsNzAuOTQ3IEM2LjY0OSw3MC45NDcgNi42MjEsNzAuNjQgNi42MjEsNzAuNTA4IEM2LjYyMSw3MC4wMTcgNi45ODIsNjkuMzkyIDcuNDExLDY5LjE0NSBDNy41MjEsNjkuMDgyIDcuNjI1LDY5LjA0OSA3LjcxNCw2OS4wNDkgQzcuOTg2LDY5LjA0OSA4LjAxNSw2OS4zNTUgOC4wMTUsNjkuNDg3IEM4LjAxNSw2OS45NzggNy42NTIsNzAuNjAzIDcuMjI0LDcwLjg1MSBDNy4xMTUsNzAuOTE0IDcuMDEsNzAuOTQ3IDYuOTIsNzAuOTQ3IE03LjcxNCw2OC44NjEgQzcuNTk1LDY4Ljg2MSA3LjQ2LDY4LjkgNy4zMTcsNjguOTgyIEM2LjgyOSw2OS4yNjUgNi40MzMsNjkuOTQ4IDYuNDMzLDcwLjUwOCBDNi40MzMsNzAuOTA1IDYuNjMxLDcxLjEzMyA2LjkyLDcxLjEzMyBDNy4wMzksNzEuMTMzIDcuMTc0LDcxLjA5NCA3LjMxNyw3MS4wMTIgQzcuODA2LDcwLjczIDguMjAyLDcwLjA0NyA4LjIwMiw2OS40ODcgQzguMjAyLDY5LjA5IDguMDAzLDY4Ljg2MSA3LjcxNCw2OC44NjEiIGlkPSJGaWxsLTE1IiBmaWxsPSIjODA5N0EyIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTcuNDQ0LDg1LjM1IEM3LjcwOCw4NS4xOTggNy45MjEsODUuMzE5IDcuOTIxLDg1LjYyMiBDNy45MjEsODUuOTI1IDcuNzA4LDg2LjI5MiA3LjQ0NCw4Ni40NDQgQzcuMTgxLDg2LjU5NyA2Ljk2Nyw4Ni40NzUgNi45NjcsODYuMTczIEM2Ljk2Nyw4NS44NzEgNy4xODEsODUuNTAyIDcuNDQ0LDg1LjM1IiBpZD0iRmlsbC0xNiIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik03LjIzLDg2LjUxIEM3LjA3NCw4Ni41MSA2Ljk2Nyw4Ni4zODcgNi45NjcsODYuMTczIEM2Ljk2Nyw4NS44NzEgNy4xODEsODUuNTAyIDcuNDQ0LDg1LjM1IEM3LjUyMSw4NS4zMDUgNy41OTQsODUuMjg0IDcuNjU4LDg1LjI4NCBDNy44MTQsODUuMjg0IDcuOTIxLDg1LjQwOCA3LjkyMSw4NS42MjIgQzcuOTIxLDg1LjkyNSA3LjcwOCw4Ni4yOTIgNy40NDQsODYuNDQ0IEM3LjM2Nyw4Ni40ODkgNy4yOTQsODYuNTEgNy4yMyw4Ni41MSBNNy42NTgsODUuMDk4IEM3LjU1OCw4NS4wOTggNy40NTUsODUuMTI3IDcuMzUxLDg1LjE4OCBDNy4wMzEsODUuMzczIDYuNzgxLDg1LjgwNiA2Ljc4MSw4Ni4xNzMgQzYuNzgxLDg2LjQ4MiA2Ljk2Niw4Ni42OTcgNy4yMyw4Ni42OTcgQzcuMzMsODYuNjk3IDcuNDMzLDg2LjY2NiA3LjUzOCw4Ni42MDcgQzcuODU4LDg2LjQyMiA4LjEwOCw4NS45ODkgOC4xMDgsODUuNjIyIEM4LjEwOCw4NS4zMTMgNy45MjMsODUuMDk4IDcuNjU4LDg1LjA5OCIgaWQ9IkZpbGwtMTciIGZpbGw9IiM4MDk3QTIiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNy4yMyw4Ni4zMjIgTDcuMTU0LDg2LjE3MyBDNy4xNTQsODUuOTM4IDcuMzMzLDg1LjYyOSA3LjUzOCw4NS41MTIgTDcuNjU4LDg1LjQ3MSBMNy43MzQsODUuNjIyIEM3LjczNCw4NS44NTYgNy41NTUsODYuMTY0IDcuMzUxLDg2LjI4MiBMNy4yMyw4Ni4zMjIgTTcuNjU4LDg1LjI4NCBDNy41OTQsODUuMjg0IDcuNTIxLDg1LjMwNSA3LjQ0NCw4NS4zNSBDNy4xODEsODUuNTAyIDYuOTY3LDg1Ljg3MSA2Ljk2Nyw4Ni4xNzMgQzYuOTY3LDg2LjM4NyA3LjA3NCw4Ni41MSA3LjIzLDg2LjUxIEM3LjI5NCw4Ni41MSA3LjM2Nyw4Ni40ODkgNy40NDQsODYuNDQ0IEM3LjcwOCw4Ni4yOTIgNy45MjEsODUuOTI1IDcuOTIxLDg1LjYyMiBDNy45MjEsODUuNDA4IDcuODE0LDg1LjI4NCA3LjY1OCw4NS4yODQiIGlkPSJGaWxsLTE4IiBmaWxsPSIjODA5N0EyIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTc3LjI3OCw3Ljc2OSBMNzcuMjc4LDUxLjQzNiBMMTAuMjA4LDkwLjE2IEwxMC4yMDgsNDYuNDkzIEw3Ny4yNzgsNy43NjkiIGlkPSJGaWxsLTE5IiBmaWxsPSIjNDU1QTY0Ij48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTEwLjA4Myw5MC4zNzUgTDEwLjA4Myw0Ni40MjEgTDEwLjE0Niw0Ni4zODUgTDc3LjQwMyw3LjU1NCBMNzcuNDAzLDUxLjUwOCBMNzcuMzQxLDUxLjU0NCBMMTAuMDgzLDkwLjM3NSBMMTAuMDgzLDkwLjM3NSBaIE0xMC4zMzMsNDYuNTY0IEwxMC4zMzMsODkuOTQ0IEw3Ny4xNTQsNTEuMzY1IEw3Ny4xNTQsNy45ODUgTDEwLjMzMyw0Ni41NjQgTDEwLjMzMyw0Ni41NjQgWiIgaWQ9IkZpbGwtMjAiIGZpbGw9IiM2MDdEOEIiPjwvcGF0aD4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMjUuNzM3LDg4LjY0NyBMMTE4LjA5OCw5MS45ODEgTDExOC4wOTgsODQgTDEwNi42MzksODguNzEzIEwxMDYuNjM5LDk2Ljk4MiBMOTksMTAwLjMxNSBMMTEyLjM2OSwxMDMuOTYxIEwxMjUuNzM3LDg4LjY0NyIgaWQ9IkltcG9ydGVkLUxheWVycy1Db3B5LTIiIGZpbGw9IiM0NTVBNjQiIHNrZXRjaDp0eXBlPSJNU1NoYXBlR3JvdXAiPjwvcGF0aD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+');
};

module.exports = RotateInstructions;

},{"./util.js":29}],24:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var SensorSample = _dereq_('./sensor-sample.js');
var MathUtil = _dereq_('../math-util.js');
var Util = _dereq_('../util.js');

/**
 * An implementation of a simple complementary filter, which fuses gyroscope and
 * accelerometer data from the 'devicemotion' event.
 *
 * Accelerometer data is very noisy, but stable over the long term.
 * Gyroscope data is smooth, but tends to drift over the long term.
 *
 * This fusion is relatively simple:
 * 1. Get orientation estimates from accelerometer by applying a low-pass filter
 *    on that data.
 * 2. Get orientation estimates from gyroscope by integrating over time.
 * 3. Combine the two estimates, weighing (1) in the long term, but (2) for the
 *    short term.
 */
function ComplementaryFilter(kFilter) {
  this.kFilter = kFilter;

  // Raw sensor measurements.
  this.currentAccelMeasurement = new SensorSample();
  this.currentGyroMeasurement = new SensorSample();
  this.previousGyroMeasurement = new SensorSample();

  // Set default look direction to be in the correct direction.
  if (Util.isIOS()) {
    this.filterQ = new MathUtil.Quaternion(-1, 0, 0, 1);
  } else {
    this.filterQ = new MathUtil.Quaternion(1, 0, 0, 1);
  }
  this.previousFilterQ = new MathUtil.Quaternion();
  this.previousFilterQ.copy(this.filterQ);

  // Orientation based on the accelerometer.
  this.accelQ = new MathUtil.Quaternion();
  // Whether or not the orientation has been initialized.
  this.isOrientationInitialized = false;
  // Running estimate of gravity based on the current orientation.
  this.estimatedGravity = new MathUtil.Vector3();
  // Measured gravity based on accelerometer.
  this.measuredGravity = new MathUtil.Vector3();

  // Debug only quaternion of gyro-based orientation.
  this.gyroIntegralQ = new MathUtil.Quaternion();
}

ComplementaryFilter.prototype.addAccelMeasurement = function(vector, timestampS) {
  this.currentAccelMeasurement.set(vector, timestampS);
};

ComplementaryFilter.prototype.addGyroMeasurement = function(vector, timestampS) {
  this.currentGyroMeasurement.set(vector, timestampS);

  var deltaT = timestampS - this.previousGyroMeasurement.timestampS;
  if (Util.isTimestampDeltaValid(deltaT)) {
    this.run_();
  }

  this.previousGyroMeasurement.copy(this.currentGyroMeasurement);
};

ComplementaryFilter.prototype.run_ = function() {

  if (!this.isOrientationInitialized) {
    this.accelQ = this.accelToQuaternion_(this.currentAccelMeasurement.sample);
    this.previousFilterQ.copy(this.accelQ);
    this.isOrientationInitialized = true;
    return;
  }

  var deltaT = this.currentGyroMeasurement.timestampS -
      this.previousGyroMeasurement.timestampS;

  // Convert gyro rotation vector to a quaternion delta.
  var gyroDeltaQ = this.gyroToQuaternionDelta_(this.currentGyroMeasurement.sample, deltaT);
  this.gyroIntegralQ.multiply(gyroDeltaQ);

  // filter_1 = K * (filter_0 + gyro * dT) + (1 - K) * accel.
  this.filterQ.copy(this.previousFilterQ);
  this.filterQ.multiply(gyroDeltaQ);

  // Calculate the delta between the current estimated gravity and the real
  // gravity vector from accelerometer.
  var invFilterQ = new MathUtil.Quaternion();
  invFilterQ.copy(this.filterQ);
  invFilterQ.inverse();

  this.estimatedGravity.set(0, 0, -1);
  this.estimatedGravity.applyQuaternion(invFilterQ);
  this.estimatedGravity.normalize();

  this.measuredGravity.copy(this.currentAccelMeasurement.sample);
  this.measuredGravity.normalize();

  // Compare estimated gravity with measured gravity, get the delta quaternion
  // between the two.
  var deltaQ = new MathUtil.Quaternion();
  deltaQ.setFromUnitVectors(this.estimatedGravity, this.measuredGravity);
  deltaQ.inverse();

  if (Util.isDebug()) {
    console.log('Delta: %d deg, G_est: (%s, %s, %s), G_meas: (%s, %s, %s)',
                MathUtil.radToDeg * Util.getQuaternionAngle(deltaQ),
                (this.estimatedGravity.x).toFixed(1),
                (this.estimatedGravity.y).toFixed(1),
                (this.estimatedGravity.z).toFixed(1),
                (this.measuredGravity.x).toFixed(1),
                (this.measuredGravity.y).toFixed(1),
                (this.measuredGravity.z).toFixed(1));
  }

  // Calculate the SLERP target: current orientation plus the measured-estimated
  // quaternion delta.
  var targetQ = new MathUtil.Quaternion();
  targetQ.copy(this.filterQ);
  targetQ.multiply(deltaQ);

  // SLERP factor: 0 is pure gyro, 1 is pure accel.
  this.filterQ.slerp(targetQ, 1 - this.kFilter);

  this.previousFilterQ.copy(this.filterQ);
};

ComplementaryFilter.prototype.getOrientation = function() {
  return this.filterQ;
};

ComplementaryFilter.prototype.accelToQuaternion_ = function(accel) {
  var normAccel = new MathUtil.Vector3();
  normAccel.copy(accel);
  normAccel.normalize();
  var quat = new MathUtil.Quaternion();
  quat.setFromUnitVectors(new MathUtil.Vector3(0, 0, -1), normAccel);
  quat.inverse();
  return quat;
};

ComplementaryFilter.prototype.gyroToQuaternionDelta_ = function(gyro, dt) {
  // Extract axis and angle from the gyroscope data.
  var quat = new MathUtil.Quaternion();
  var axis = new MathUtil.Vector3();
  axis.copy(gyro);
  axis.normalize();
  quat.setFromAxisAngle(axis, gyro.length() * dt);
  return quat;
};


module.exports = ComplementaryFilter;

},{"../math-util.js":20,"../util.js":29,"./sensor-sample.js":27}],25:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ComplementaryFilter = _dereq_('./complementary-filter.js');
var PosePredictor = _dereq_('./pose-predictor.js');
var TouchPanner = _dereq_('../touch-panner.js');
var MathUtil = _dereq_('../math-util.js');
var Util = _dereq_('../util.js');

/**
 * The pose sensor, implemented using DeviceMotion APIs.
 */
function FusionPoseSensor() {
  this.deviceId = 'webvr-polyfill:fused';
  this.deviceName = 'VR Position Device (webvr-polyfill:fused)';

  this.accelerometer = new MathUtil.Vector3();
  this.gyroscope = new MathUtil.Vector3();

  this.start();

  this.filter = new ComplementaryFilter(window.WebVRConfig.K_FILTER);
  this.posePredictor = new PosePredictor(window.WebVRConfig.PREDICTION_TIME_S);
  this.touchPanner = new TouchPanner();

  this.filterToWorldQ = new MathUtil.Quaternion();

  // Set the filter to world transform, depending on OS.
  if (Util.isIOS()) {
    this.filterToWorldQ.setFromAxisAngle(new MathUtil.Vector3(1, 0, 0), Math.PI / 2);
  } else {
    this.filterToWorldQ.setFromAxisAngle(new MathUtil.Vector3(1, 0, 0), -Math.PI / 2);
  }

  this.inverseWorldToScreenQ = new MathUtil.Quaternion();
  this.worldToScreenQ = new MathUtil.Quaternion();
  this.originalPoseAdjustQ = new MathUtil.Quaternion();
  this.originalPoseAdjustQ.setFromAxisAngle(new MathUtil.Vector3(0, 0, 1),
                                           -window.orientation * Math.PI / 180);

  this.setScreenTransform_();
  // Adjust this filter for being in landscape mode.
  if (Util.isLandscapeMode()) {
    this.filterToWorldQ.multiply(this.inverseWorldToScreenQ);
  }

  // Keep track of a reset transform for resetSensor.
  this.resetQ = new MathUtil.Quaternion();

  this.isFirefoxAndroid = Util.isFirefoxAndroid();
  this.isIOS = Util.isIOS();

  this.orientationOut_ = new Float32Array(4);
}

FusionPoseSensor.prototype.getPosition = function() {
  // This PoseSensor doesn't support position
  return null;
};

FusionPoseSensor.prototype.getOrientation = function() {
  // Convert from filter space to the the same system used by the
  // deviceorientation event.
  var orientation = this.filter.getOrientation();

  // Predict orientation.
  this.predictedQ = this.posePredictor.getPrediction(orientation, this.gyroscope, this.previousTimestampS);

  // Convert to THREE coordinate system: -Z forward, Y up, X right.
  var out = new MathUtil.Quaternion();
  out.copy(this.filterToWorldQ);
  out.multiply(this.resetQ);
  if (!window.WebVRConfig.TOUCH_PANNER_DISABLED) {
    out.multiply(this.touchPanner.getOrientation());
  }
  out.multiply(this.predictedQ);
  out.multiply(this.worldToScreenQ);

  // Handle the yaw-only case.
  if (window.WebVRConfig.YAW_ONLY) {
    // Make a quaternion that only turns around the Y-axis.
    out.x = 0;
    out.z = 0;
    out.normalize();
  }

  this.orientationOut_[0] = out.x;
  this.orientationOut_[1] = out.y;
  this.orientationOut_[2] = out.z;
  this.orientationOut_[3] = out.w;
  return this.orientationOut_;
};

FusionPoseSensor.prototype.resetPose = function() {
  // Reduce to inverted yaw-only.
  this.resetQ.copy(this.filter.getOrientation());
  this.resetQ.x = 0;
  this.resetQ.y = 0;
  this.resetQ.z *= -1;
  this.resetQ.normalize();

  // Take into account extra transformations in landscape mode.
  if (Util.isLandscapeMode()) {
    this.resetQ.multiply(this.inverseWorldToScreenQ);
  }

  // Take into account original pose.
  this.resetQ.multiply(this.originalPoseAdjustQ);

  if (!window.WebVRConfig.TOUCH_PANNER_DISABLED) {
    this.touchPanner.resetSensor();
  }
};

FusionPoseSensor.prototype.onDeviceMotion_ = function(deviceMotion) {
  this.updateDeviceMotion_(deviceMotion);
};

FusionPoseSensor.prototype.updateDeviceMotion_ = function(deviceMotion) {
  var accGravity = deviceMotion.accelerationIncludingGravity;
  var rotRate = deviceMotion.rotationRate;
  var timestampS = deviceMotion.timeStamp / 1000;

  var deltaS = timestampS - this.previousTimestampS;
  if (deltaS <= Util.MIN_TIMESTEP || deltaS > Util.MAX_TIMESTEP) {
    console.warn('Invalid timestamps detected. Time step between successive ' +
                 'gyroscope sensor samples is very small or not monotonic');
    this.previousTimestampS = timestampS;
    return;
  }
  this.accelerometer.set(-accGravity.x, -accGravity.y, -accGravity.z);
  this.gyroscope.set(rotRate.alpha, rotRate.beta, rotRate.gamma);

  // With iOS and Firefox Android, rotationRate is reported in degrees,
  // so we first convert to radians.
  if (this.isIOS || this.isFirefoxAndroid) {
    this.gyroscope.multiplyScalar(Math.PI / 180);
  }

  this.filter.addAccelMeasurement(this.accelerometer, timestampS);
  this.filter.addGyroMeasurement(this.gyroscope, timestampS);

  this.previousTimestampS = timestampS;
};

FusionPoseSensor.prototype.onOrientationChange_ = function(screenOrientation) {
  this.setScreenTransform_();
};

/**
 * This is only needed if we are in an cross origin iframe on iOS to work around
 * this issue: https://bugs.webkit.org/show_bug.cgi?id=152299.
 */
FusionPoseSensor.prototype.onMessage_ = function(event) {
  var message = event.data;

  // If there's no message type, ignore it.
  if (!message || !message.type) {
    return;
  }

  // Ignore all messages that aren't devicemotion.
  var type = message.type.toLowerCase();
  if (type !== 'devicemotion') {
    return;
  }

  // Update device motion.
  this.updateDeviceMotion_(message.deviceMotionEvent);
};

FusionPoseSensor.prototype.setScreenTransform_ = function() {
  this.worldToScreenQ.set(0, 0, 0, 1);
  switch (window.orientation) {
    case 0:
      break;
    case 90:
      this.worldToScreenQ.setFromAxisAngle(new MathUtil.Vector3(0, 0, 1), -Math.PI / 2);
      break;
    case -90:
      this.worldToScreenQ.setFromAxisAngle(new MathUtil.Vector3(0, 0, 1), Math.PI / 2);
      break;
    case 180:
      // TODO.
      break;
  }
  this.inverseWorldToScreenQ.copy(this.worldToScreenQ);
  this.inverseWorldToScreenQ.inverse();
};

FusionPoseSensor.prototype.start = function() {
  this.onDeviceMotionCallback_ = this.onDeviceMotion_.bind(this);
  this.onOrientationChangeCallback_ = this.onOrientationChange_.bind(this);
  this.onMessageCallback_ = this.onMessage_.bind(this);

  // Only listen for postMessages if we're in an iOS and embedded inside a cross
  // domain IFrame. In this case, the polyfill can still work if the containing
  // page sends synthetic devicemotion events. For an example of this, see
  // iframe-message-sender.js in VR View: https://goo.gl/XDtvFZ
  if (Util.isIOS() && Util.isInsideCrossDomainIFrame()) {
    window.addEventListener('message', this.onMessageCallback_);
  }
  window.addEventListener('orientationchange', this.onOrientationChangeCallback_);
  window.addEventListener('devicemotion', this.onDeviceMotionCallback_);
};

FusionPoseSensor.prototype.stop = function() {
  window.removeEventListener('devicemotion', this.onDeviceMotionCallback_);
  window.removeEventListener('orientationchange', this.onOrientationChangeCallback_);
  window.removeEventListener('message', this.onMessageCallback_);
};

module.exports = FusionPoseSensor;

},{"../math-util.js":20,"../touch-panner.js":28,"../util.js":29,"./complementary-filter.js":24,"./pose-predictor.js":26}],26:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var MathUtil = _dereq_('../math-util');
var Util = _dereq_('../util');

/**
 * Given an orientation and the gyroscope data, predicts the future orientation
 * of the head. This makes rendering appear faster.
 *
 * Also see: http://msl.cs.uiuc.edu/~lavalle/papers/LavYerKatAnt14.pdf
 *
 * @param {Number} predictionTimeS time from head movement to the appearance of
 * the corresponding image.
 */
function PosePredictor(predictionTimeS) {
  this.predictionTimeS = predictionTimeS;

  // The quaternion corresponding to the previous state.
  this.previousQ = new MathUtil.Quaternion();
  // Previous time a prediction occurred.
  this.previousTimestampS = null;

  // The delta quaternion that adjusts the current pose.
  this.deltaQ = new MathUtil.Quaternion();
  // The output quaternion.
  this.outQ = new MathUtil.Quaternion();
}

PosePredictor.prototype.getPrediction = function(currentQ, gyro, timestampS) {
  if (!this.previousTimestampS) {
    this.previousQ.copy(currentQ);
    this.previousTimestampS = timestampS;
    return currentQ;
  }

  // Calculate axis and angle based on gyroscope rotation rate data.
  var axis = new MathUtil.Vector3();
  axis.copy(gyro);
  axis.normalize();

  var angularSpeed = gyro.length();

  // If we're rotating slowly, don't do prediction.
  if (angularSpeed < MathUtil.degToRad * 20) {
    if (Util.isDebug()) {
      console.log('Moving slowly, at %s deg/s: no prediction',
                  (MathUtil.radToDeg * angularSpeed).toFixed(1));
    }
    this.outQ.copy(currentQ);
    this.previousQ.copy(currentQ);
    return this.outQ;
  }

  // Get the predicted angle based on the time delta and latency.
  var deltaT = timestampS - this.previousTimestampS;
  var predictAngle = angularSpeed * this.predictionTimeS;

  this.deltaQ.setFromAxisAngle(axis, predictAngle);
  this.outQ.copy(this.previousQ);
  this.outQ.multiply(this.deltaQ);

  this.previousQ.copy(currentQ);
  this.previousTimestampS = timestampS;

  return this.outQ;
};


module.exports = PosePredictor;

},{"../math-util":20,"../util":29}],27:[function(_dereq_,module,exports){
function SensorSample(sample, timestampS) {
  this.set(sample, timestampS);
};

SensorSample.prototype.set = function(sample, timestampS) {
  this.sample = sample;
  this.timestampS = timestampS;
};

SensorSample.prototype.copy = function(sensorSample) {
  this.set(sensorSample.sample, sensorSample.timestampS);
};

module.exports = SensorSample;

},{}],28:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var MathUtil = _dereq_('./math-util.js');
var Util = _dereq_('./util.js');

var ROTATE_SPEED = 0.5;
/**
 * Provides a quaternion responsible for pre-panning the scene before further
 * transformations due to device sensors.
 */
function TouchPanner() {
  window.addEventListener('touchstart', this.onTouchStart_.bind(this));
  window.addEventListener('touchmove', this.onTouchMove_.bind(this));
  window.addEventListener('touchend', this.onTouchEnd_.bind(this));

  this.isTouching = false;
  this.rotateStart = new MathUtil.Vector2();
  this.rotateEnd = new MathUtil.Vector2();
  this.rotateDelta = new MathUtil.Vector2();

  this.theta = 0;
  this.orientation = new MathUtil.Quaternion();
}

TouchPanner.prototype.getOrientation = function() {
  this.orientation.setFromEulerXYZ(0, 0, this.theta);
  return this.orientation;
};

TouchPanner.prototype.resetSensor = function() {
  this.theta = 0;
};

TouchPanner.prototype.onTouchStart_ = function(e) {
  // Only respond if there is exactly one touch.
  // Note that the Daydream controller passes in a `touchstart` event with
  // no `touches` property, so we must check for that case too.
  if (!e.touches || e.touches.length != 1) {
    return;
  }
  this.rotateStart.set(e.touches[0].pageX, e.touches[0].pageY);
  this.isTouching = true;
};

TouchPanner.prototype.onTouchMove_ = function(e) {
  if (!this.isTouching) {
    return;
  }
  this.rotateEnd.set(e.touches[0].pageX, e.touches[0].pageY);
  this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
  this.rotateStart.copy(this.rotateEnd);

  // On iOS, direction is inverted.
  if (Util.isIOS()) {
    this.rotateDelta.x *= -1;
  }

  var element = document.body;
  this.theta += 2 * Math.PI * this.rotateDelta.x / element.clientWidth * ROTATE_SPEED;
};

TouchPanner.prototype.onTouchEnd_ = function(e) {
  this.isTouching = false;
};

module.exports = TouchPanner;

},{"./math-util.js":20,"./util.js":29}],29:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Util = window.Util || {};

Util.MIN_TIMESTEP = 0.001;
Util.MAX_TIMESTEP = 1;

Util.base64 = function(mimeType, base64) {
  return 'data:' + mimeType + ';base64,' + base64;
};

Util.clamp = function(value, min, max) {
  return Math.min(Math.max(min, value), max);
};

Util.lerp = function(a, b, t) {
  return a + ((b - a) * t);
};

/**
 * Light polyfill for `Promise.race`. Returns
 * a promise that resolves when the first promise
 * provided resolves.
 *
 * @param {Array<Promise>} promises
 */
Util.race = function(promises) {
  if (Promise.race) {
    return Promise.race(promises);
  }

  return new Promise(function (resolve, reject) {
    for (var i = 0; i < promises.length; i++) {
      promises[i].then(resolve, reject);
    }
  });
};

Util.isIOS = (function() {
  var isIOS = /iPad|iPhone|iPod/.test(navigator.platform);
  return function() {
    return isIOS;
  };
})();

Util.isWebViewAndroid = (function() {
  var isWebViewAndroid = navigator.userAgent.indexOf('Version') !== -1 &&
      navigator.userAgent.indexOf('Android') !== -1 &&
      navigator.userAgent.indexOf('Chrome') !== -1;
  return function() {
    return isWebViewAndroid;
  };
})();

Util.isSafari = (function() {
  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  return function() {
    return isSafari;
  };
})();

Util.isFirefoxAndroid = (function() {
  var isFirefoxAndroid = navigator.userAgent.indexOf('Firefox') !== -1 &&
      navigator.userAgent.indexOf('Android') !== -1;
  return function() {
    return isFirefoxAndroid;
  };
})();

Util.isLandscapeMode = function() {
  return (window.orientation == 90 || window.orientation == -90);
};

// Helper method to validate the time steps of sensor timestamps.
Util.isTimestampDeltaValid = function(timestampDeltaS) {
  if (isNaN(timestampDeltaS)) {
    return false;
  }
  if (timestampDeltaS <= Util.MIN_TIMESTEP) {
    return false;
  }
  if (timestampDeltaS > Util.MAX_TIMESTEP) {
    return false;
  }
  return true;
};

Util.getScreenWidth = function() {
  return Math.max(window.screen.width, window.screen.height) *
      window.devicePixelRatio;
};

Util.getScreenHeight = function() {
  return Math.min(window.screen.width, window.screen.height) *
      window.devicePixelRatio;
};

Util.requestFullscreen = function(element) {
  if (Util.isWebViewAndroid()) {
      return false;
  }
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else {
    return false;
  }

  return true;
};

Util.exitFullscreen = function() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else {
    return false;
  }

  return true;
};

Util.getFullscreenElement = function() {
  return document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;
};

Util.linkProgram = function(gl, vertexSource, fragmentSource, attribLocationMap) {
  // No error checking for brevity.
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexSource);
  gl.compileShader(vertexShader);

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentSource);
  gl.compileShader(fragmentShader);

  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  for (var attribName in attribLocationMap)
    gl.bindAttribLocation(program, attribLocationMap[attribName], attribName);

  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
};

Util.getProgramUniforms = function(gl, program) {
  var uniforms = {};
  var uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  var uniformName = '';
  for (var i = 0; i < uniformCount; i++) {
    var uniformInfo = gl.getActiveUniform(program, i);
    uniformName = uniformInfo.name.replace('[0]', '');
    uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
  }
  return uniforms;
};

Util.orthoMatrix = function (out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right),
      bt = 1 / (bottom - top),
      nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
};

Util.copyArray = function (source, dest) {
  for (var i = 0, n = source.length; i < n; i++) {
    dest[i] = source[i];
  }
};

Util.isMobile = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

Util.extend = function(dest, src) {
  for (var key in src) {
    if (src.hasOwnProperty(key)) {
      dest[key] = src[key];
    }
  }

  return dest;
}

Util.safariCssSizeWorkaround = function(canvas) {
  // TODO(smus): Remove this workaround when Safari for iOS is fixed.
  // iOS only workaround (for https://bugs.webkit.org/show_bug.cgi?id=152556).
  //
  // "To the last I grapple with thee;
  //  from hell's heart I stab at thee;
  //  for hate's sake I spit my last breath at thee."
  // -- Moby Dick, by Herman Melville
  if (Util.isIOS()) {
    var width = canvas.style.width;
    var height = canvas.style.height;
    canvas.style.width = (parseInt(width) + 1) + 'px';
    canvas.style.height = (parseInt(height)) + 'px';
    setTimeout(function() {
      canvas.style.width = width;
      canvas.style.height = height;
    }, 100);
  }

  // Debug only.
  window.Util = Util;
  window.canvas = canvas;
};

Util.isDebug = function() {
  return Util.getQueryParameter('debug');
};

Util.getQueryParameter = function(name) {
  var name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

Util.frameDataFromPose = (function() {
  var piOver180 = Math.PI / 180.0;
  var rad45 = Math.PI * 0.25;

  // Borrowed from glMatrix.
  function mat4_perspectiveFromFieldOfView(out, fov, near, far) {
    var upTan = Math.tan(fov ? (fov.upDegrees * piOver180) : rad45),
    downTan = Math.tan(fov ? (fov.downDegrees * piOver180) : rad45),
    leftTan = Math.tan(fov ? (fov.leftDegrees * piOver180) : rad45),
    rightTan = Math.tan(fov ? (fov.rightDegrees * piOver180) : rad45),
    xScale = 2.0 / (leftTan + rightTan),
    yScale = 2.0 / (upTan + downTan);

    out[0] = xScale;
    out[1] = 0.0;
    out[2] = 0.0;
    out[3] = 0.0;
    out[4] = 0.0;
    out[5] = yScale;
    out[6] = 0.0;
    out[7] = 0.0;
    out[8] = -((leftTan - rightTan) * xScale * 0.5);
    out[9] = ((upTan - downTan) * yScale * 0.5);
    out[10] = far / (near - far);
    out[11] = -1.0;
    out[12] = 0.0;
    out[13] = 0.0;
    out[14] = (far * near) / (near - far);
    out[15] = 0.0;
    return out;
  }

  function mat4_fromRotationTranslation(out, q, v) {
    // Quaternion math
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;

    return out;
  };

  function mat4_translate(out, a, v) {
    var x = v[0], y = v[1], z = v[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
      a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
      a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
      a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

      out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
      out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
      out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

      out[12] = a00 * x + a10 * y + a20 * z + a[12];
      out[13] = a01 * x + a11 * y + a21 * z + a[13];
      out[14] = a02 * x + a12 * y + a22 * z + a[14];
      out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
  };

  function mat4_invert(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
      return null;
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
  };

  var defaultOrientation = new Float32Array([0, 0, 0, 1]);
  var defaultPosition = new Float32Array([0, 0, 0]);

  function updateEyeMatrices(projection, view, pose, parameters, vrDisplay) {
    mat4_perspectiveFromFieldOfView(projection, parameters ? parameters.fieldOfView : null, vrDisplay.depthNear, vrDisplay.depthFar);

    var orientation = pose.orientation || defaultOrientation;
    var position = pose.position || defaultPosition;

    mat4_fromRotationTranslation(view, orientation, position);
    if (parameters)
      mat4_translate(view, view, parameters.offset);
    mat4_invert(view, view);
  }

  return function(frameData, pose, vrDisplay) {
    if (!frameData || !pose)
      return false;

    frameData.pose = pose;
    frameData.timestamp = pose.timestamp;

    updateEyeMatrices(
        frameData.leftProjectionMatrix, frameData.leftViewMatrix,
        pose, vrDisplay.getEyeParameters("left"), vrDisplay);
    updateEyeMatrices(
        frameData.rightProjectionMatrix, frameData.rightViewMatrix,
        pose, vrDisplay.getEyeParameters("right"), vrDisplay);

    return true;
  };
})();

Util.isInsideCrossDomainIFrame = function() {
  var isFramed = (window.self !== window.top);
  var refDomain = Util.getDomainFromUrl(document.referrer);
  var thisDomain = Util.getDomainFromUrl(window.location.href);

  return isFramed && (refDomain !== thisDomain);
};

// From http://stackoverflow.com/a/23945027.
Util.getDomainFromUrl = function(url) {
  var domain;
  // Find & remove protocol (http, ftp, etc.) and get domain.
  if (url.indexOf("://") > -1) {
    domain = url.split('/')[2];
  }
  else {
    domain = url.split('/')[0];
  }

  //find & remove port number
  domain = domain.split(':')[0];

  return domain;
}

module.exports = Util;

},{}],30:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var DeviceInfo = _dereq_('./device-info.js');
var Util = _dereq_('./util.js');

var DEFAULT_VIEWER = 'CardboardV1';
var VIEWER_KEY = 'WEBVR_CARDBOARD_VIEWER';
var CLASS_NAME = 'webvr-polyfill-viewer-selector';

/**
 * Creates a viewer selector with the options specified. Supports being shown
 * and hidden. Generates events when viewer parameters change. Also supports
 * saving the currently selected index in localStorage.
 */
function ViewerSelector() {
  // Try to load the selected key from local storage.
  try {
    this.selectedKey = localStorage.getItem(VIEWER_KEY);
  } catch (error) {
    console.error('Failed to load viewer profile: %s', error);
  }

  //If none exists, or if localstorage is unavailable, use the default key.
  if (!this.selectedKey) {
    this.selectedKey = DEFAULT_VIEWER;
  }

  this.dialog = this.createDialog_(DeviceInfo.Viewers);
  this.root = null;
  this.onChangeCallbacks_ = [];
}

ViewerSelector.prototype.show = function(root) {
  this.root = root;

  root.appendChild(this.dialog);

  // Ensure the currently selected item is checked.
  var selected = this.dialog.querySelector('#' + this.selectedKey);
  selected.checked = true;

  // Show the UI.
  this.dialog.style.display = 'block';
};

ViewerSelector.prototype.hide = function() {
  if (this.root && this.root.contains(this.dialog)) {
    this.root.removeChild(this.dialog);
  }
  this.dialog.style.display = 'none';
};

ViewerSelector.prototype.getCurrentViewer = function() {
  return DeviceInfo.Viewers[this.selectedKey];
};

ViewerSelector.prototype.getSelectedKey_ = function() {
  var input = this.dialog.querySelector('input[name=field]:checked');
  if (input) {
    return input.id;
  }
  return null;
};

ViewerSelector.prototype.onChange = function(cb) {
  this.onChangeCallbacks_.push(cb);
};

ViewerSelector.prototype.fireOnChange_ = function(viewer) {
  for (var i = 0; i < this.onChangeCallbacks_.length; i++) {
    this.onChangeCallbacks_[i](viewer);
  }
};

ViewerSelector.prototype.onSave_ = function() {
  this.selectedKey = this.getSelectedKey_();
  if (!this.selectedKey || !DeviceInfo.Viewers[this.selectedKey]) {
    console.error('ViewerSelector.onSave_: this should never happen!');
    return;
  }

  this.fireOnChange_(DeviceInfo.Viewers[this.selectedKey]);

  // Attempt to save the viewer profile, but fails in private mode.
  try {
    localStorage.setItem(VIEWER_KEY, this.selectedKey);
  } catch(error) {
    console.error('Failed to save viewer profile: %s', error);
  }
  this.hide();
};

/**
 * Creates the dialog.
 */
ViewerSelector.prototype.createDialog_ = function(options) {
  var container = document.createElement('div');
  container.classList.add(CLASS_NAME);
  container.style.display = 'none';
  // Create an overlay that dims the background, and which goes away when you
  // tap it.
  var overlay = document.createElement('div');
  var s = overlay.style;
  s.position = 'fixed';
  s.left = 0;
  s.top = 0;
  s.width = '100%';
  s.height = '100%';
  s.background = 'rgba(0, 0, 0, 0.3)';
  overlay.addEventListener('click', this.hide.bind(this));

  var width = 280;
  var dialog = document.createElement('div');
  var s = dialog.style;
  s.boxSizing = 'border-box';
  s.position = 'fixed';
  s.top = '24px';
  s.left = '50%';
  s.marginLeft = (-width/2) + 'px';
  s.width = width + 'px';
  s.padding = '24px';
  s.overflow = 'hidden';
  s.background = '#fafafa';
  s.fontFamily = "'Roboto', sans-serif";
  s.boxShadow = '0px 5px 20px #666';

  dialog.appendChild(this.createH1_('Select your viewer'));
  for (var id in options) {
    dialog.appendChild(this.createChoice_(id, options[id].label));
  }
  dialog.appendChild(this.createButton_('Save', this.onSave_.bind(this)));

  container.appendChild(overlay);
  container.appendChild(dialog);

  return container;
};

ViewerSelector.prototype.createH1_ = function(name) {
  var h1 = document.createElement('h1');
  var s = h1.style;
  s.color = 'black';
  s.fontSize = '20px';
  s.fontWeight = 'bold';
  s.marginTop = 0;
  s.marginBottom = '24px';
  h1.innerHTML = name;
  return h1;
};

ViewerSelector.prototype.createChoice_ = function(id, name) {
  /*
  <div class="choice">
  <input id="v1" type="radio" name="field" value="v1">
  <label for="v1">Cardboard V1</label>
  </div>
  */
  var div = document.createElement('div');
  div.style.marginTop = '8px';
  div.style.color = 'black';

  var input = document.createElement('input');
  input.style.fontSize = '30px';
  input.setAttribute('id', id);
  input.setAttribute('type', 'radio');
  input.setAttribute('value', id);
  input.setAttribute('name', 'field');

  var label = document.createElement('label');
  label.style.marginLeft = '4px';
  label.setAttribute('for', id);
  label.innerHTML = name;

  div.appendChild(input);
  div.appendChild(label);

  return div;
};

ViewerSelector.prototype.createButton_ = function(label, onclick) {
  var button = document.createElement('button');
  button.innerHTML = label;
  var s = button.style;
  s.float = 'right';
  s.textTransform = 'uppercase';
  s.color = '#1094f7';
  s.fontSize = '14px';
  s.letterSpacing = 0;
  s.border = 0;
  s.background = 'none';
  s.marginTop = '16px';

  button.addEventListener('click', onclick);

  return button;
};

module.exports = ViewerSelector;

},{"./device-info.js":14,"./util.js":29}],31:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Util = _dereq_('./util.js');

/**
 * Android and iOS compatible wakelock implementation.
 *
 * Refactored thanks to dkovalev@.
 */
function AndroidWakeLock() {
  var video = document.createElement('video');
  video.setAttribute('loop', '');

  function addSourceToVideo(element, type, dataURI) {
    var source = document.createElement('source');
    source.src = dataURI;
    source.type = 'video/' + type;
    element.appendChild(source);
  }

  addSourceToVideo(video,'webm', Util.base64('video/webm', 'GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBAeBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA='));
  addSourceToVideo(video, 'mp4', Util.base64('video/mp4', 'AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAG21kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAAAAAB8JbCAfCWwgAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIVdHJhawAAAFx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAIAAAACAAAAAABsW1kaWEAAAAgbWRoZAAAAAB8JbCAfCWwgAAAA+gAAAAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAVxtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEcc3RibAAAALhzdHNkAAAAAAAAAAEAAACobXA0dgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAIAAgASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAFJlc2RzAAAAAANEAAEABDwgEQAAAAADDUAAAAAABS0AAAGwAQAAAbWJEwAAAQAAAAEgAMSNiB9FAEQBFGMAAAGyTGF2YzUyLjg3LjQGAQIAAAAYc3R0cwAAAAAAAAABAAAAAQAAAAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAAAEwAAAAEAAAAUc3RjbwAAAAAAAAABAAAALAAAAGB1ZHRhAAAAWG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAK2lsc3QAAAAjqXRvbwAAABtkYXRhAAAAAQAAAABMYXZmNTIuNzguMw=='));

  this.request = function() {
    if (video.paused) {
      video.play();
    }
  };

  this.release = function() {
    video.pause();
  };
}

function iOSWakeLock() {
  var timer = null;

  this.request = function() {
    if (!timer) {
      timer = setInterval(function() {
        window.location = window.location;
        setTimeout(window.stop, 0);
      }, 30000);
    }
  }

  this.release = function() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
}


function getWakeLock() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
    return iOSWakeLock;
  } else {
    return AndroidWakeLock;
  }
}

module.exports = getWakeLock();
},{"./util.js":29}],32:[function(_dereq_,module,exports){
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Util = _dereq_('./util.js');
var CardboardVRDisplay = _dereq_('./cardboard-vr-display.js');
var MouseKeyboardVRDisplay = _dereq_('./mouse-keyboard-vr-display.js');
// Uncomment to add positional tracking via webcam.
//var WebcamPositionSensorVRDevice = require('./webcam-position-sensor-vr-device.js');
var VRDisplay = _dereq_('./base.js').VRDisplay;
var VRFrameData = _dereq_('./base.js').VRFrameData;
var HMDVRDevice = _dereq_('./base.js').HMDVRDevice;
var PositionSensorVRDevice = _dereq_('./base.js').PositionSensorVRDevice;
var VRDisplayHMDDevice = _dereq_('./display-wrappers.js').VRDisplayHMDDevice;
var VRDisplayPositionSensorDevice = _dereq_('./display-wrappers.js').VRDisplayPositionSensorDevice;
var version = _dereq_('../package.json').version;

function WebVRPolyfill() {
  this.displays = [];
  this.devices = []; // For deprecated objects
  this.devicesPopulated = false;
  this.nativeWebVRAvailable = this.isWebVRAvailable();
  this.nativeLegacyWebVRAvailable = this.isDeprecatedWebVRAvailable();
  this.nativeGetVRDisplaysFunc = this.nativeWebVRAvailable ?
                                 navigator.getVRDisplays :
                                 null;

  if (!this.nativeLegacyWebVRAvailable) {
    this.enablePolyfill();
    if (window.WebVRConfig.ENABLE_DEPRECATED_API) {
      this.enableDeprecatedPolyfill();
    }
  }

  // Put a shim in place to update the API to 1.1 if needed.
  InstallWebVRSpecShim();
}

WebVRPolyfill.prototype.isWebVRAvailable = function() {
  return ('getVRDisplays' in navigator);
};

WebVRPolyfill.prototype.isDeprecatedWebVRAvailable = function() {
  return ('getVRDevices' in navigator) || ('mozGetVRDevices' in navigator);
};

WebVRPolyfill.prototype.connectDisplay = function(vrDisplay) {
  vrDisplay.fireVRDisplayConnect_();
  this.displays.push(vrDisplay);
};

WebVRPolyfill.prototype.populateDevices = function() {
  if (this.devicesPopulated) {
    return;
  }

  // Initialize our virtual VR devices.
  var vrDisplay = null;

  // Add a Cardboard VRDisplay on compatible mobile devices
  if (this.isCardboardCompatible()) {
    vrDisplay = new CardboardVRDisplay();

    this.connectDisplay(vrDisplay);

    // For backwards compatibility
    if (window.WebVRConfig.ENABLE_DEPRECATED_API) {
      this.devices.push(new VRDisplayHMDDevice(vrDisplay));
      this.devices.push(new VRDisplayPositionSensorDevice(vrDisplay));
    }
  }

  // Add a Mouse and Keyboard driven VRDisplay for desktops/laptops
  if (!this.isMobile() && !window.WebVRConfig.MOUSE_KEYBOARD_CONTROLS_DISABLED) {
    vrDisplay = new MouseKeyboardVRDisplay();
    this.connectDisplay(vrDisplay);

    // For backwards compatibility
    if (window.WebVRConfig.ENABLE_DEPRECATED_API) {
      this.devices.push(new VRDisplayHMDDevice(vrDisplay));
      this.devices.push(new VRDisplayPositionSensorDevice(vrDisplay));
    }
  }

  // Uncomment to add positional tracking via webcam.
  //if (!this.isMobile() && window.WebVRConfig.ENABLE_DEPRECATED_API) {
  //  positionDevice = new WebcamPositionSensorVRDevice();
  //  this.devices.push(positionDevice);
  //}

  this.devicesPopulated = true;
};

WebVRPolyfill.prototype.enablePolyfill = function() {
  // Provide navigator.getVRDisplays.
  navigator.getVRDisplays = this.getVRDisplays.bind(this);

  // Polyfill native VRDisplay.getFrameData
  if (this.nativeWebVRAvailable && window.VRFrameData) {
    var NativeVRFrameData = window.VRFrameData;
    var nativeFrameData = new window.VRFrameData();
    var nativeGetFrameData = window.VRDisplay.prototype.getFrameData;
    window.VRFrameData = VRFrameData;

    window.VRDisplay.prototype.getFrameData = function(frameData) {
      if (frameData instanceof NativeVRFrameData) {
        nativeGetFrameData.call(this, frameData);
        return;
      }

      /*
      Copy frame data from the native object into the polyfilled object.
      */

      nativeGetFrameData.call(this, nativeFrameData);
      frameData.pose = nativeFrameData.pose;
      Util.copyArray(nativeFrameData.leftProjectionMatrix, frameData.leftProjectionMatrix);
      Util.copyArray(nativeFrameData.rightProjectionMatrix, frameData.rightProjectionMatrix);
      Util.copyArray(nativeFrameData.leftViewMatrix, frameData.leftViewMatrix);
      Util.copyArray(nativeFrameData.rightViewMatrix, frameData.rightViewMatrix);
      //todo: copy
    };
  }

  // Provide the `VRDisplay` object.
  window.VRDisplay = VRDisplay;

  // Provide the `navigator.vrEnabled` property.
  if (navigator && !navigator.vrEnabled) {
    var self = this;
    Object.defineProperty(navigator, 'vrEnabled', {
      get: function () {
        return self.isCardboardCompatible() &&
            (self.isFullScreenAvailable() || Util.isIOS());
      }
    });
  }

  if (!('VRFrameData' in window)) {
    // Provide the VRFrameData object.
    window.VRFrameData = VRFrameData;
  }
};

WebVRPolyfill.prototype.enableDeprecatedPolyfill = function() {
  // Provide navigator.getVRDevices.
  navigator.getVRDevices = this.getVRDevices.bind(this);

  // Provide the CardboardHMDVRDevice and PositionSensorVRDevice objects.
  window.HMDVRDevice = HMDVRDevice;
  window.PositionSensorVRDevice = PositionSensorVRDevice;
};

WebVRPolyfill.prototype.getVRDisplays = function() {
  this.populateDevices();
  var polyfillDisplays = this.displays;

  if (!this.nativeWebVRAvailable) {
    return Promise.resolve(polyfillDisplays);
  }

  // Set up a race condition if this browser has a bug where
  // `navigator.getVRDisplays()` never resolves.
  var timeoutId;
  var vrDisplaysNative = this.nativeGetVRDisplaysFunc.call(navigator);
  var timeoutPromise = new Promise(function(resolve) {
    timeoutId = setTimeout(function() {
      console.warn('Native WebVR implementation detected, but `getVRDisplays()` failed to resolve. Falling back to polyfill.');
      resolve([]);
    }, window.WebVRConfig.GET_VR_DISPLAYS_TIMEOUT);
  });

  return Util.race([
    vrDisplaysNative,
    timeoutPromise
  ]).then(function(nativeDisplays) {
    clearTimeout(timeoutId);
    if (window.WebVRConfig.ALWAYS_APPEND_POLYFILL_DISPLAY) {
      return nativeDisplays.concat(polyfillDisplays);
    } else {
      return nativeDisplays.length > 0 ? nativeDisplays : polyfillDisplays;
    }
  });
};

WebVRPolyfill.prototype.getVRDevices = function() {
  console.warn('getVRDevices is deprecated. Please update your code to use getVRDisplays instead.');
  var self = this;
  return new Promise(function(resolve, reject) {
    try {
      if (!self.devicesPopulated) {
        if (self.nativeWebVRAvailable) {
          return navigator.getVRDisplays(function(displays) {
            for (var i = 0; i < displays.length; ++i) {
              self.devices.push(new VRDisplayHMDDevice(displays[i]));
              self.devices.push(new VRDisplayPositionSensorDevice(displays[i]));
            }
            self.devicesPopulated = true;
            resolve(self.devices);
          }, reject);
        }

        if (self.nativeLegacyWebVRAvailable) {
          return (navigator.getVRDDevices || navigator.mozGetVRDevices)(function(devices) {
            for (var i = 0; i < devices.length; ++i) {
              if (devices[i] instanceof HMDVRDevice) {
                self.devices.push(devices[i]);
              }
              if (devices[i] instanceof PositionSensorVRDevice) {
                self.devices.push(devices[i]);
              }
            }
            self.devicesPopulated = true;
            resolve(self.devices);
          }, reject);
        }
      }

      self.populateDevices();
      resolve(self.devices);
    } catch (e) {
      reject(e);
    }
  });
};

WebVRPolyfill.prototype.NativeVRFrameData = window.VRFrameData;

/**
 * Determine if a device is mobile.
 */
WebVRPolyfill.prototype.isMobile = function() {
  return /Android/i.test(navigator.userAgent) ||
      /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

WebVRPolyfill.prototype.isCardboardCompatible = function() {
  // For now, support all iOS and Android devices.
  // Also enable the WebVRConfig.FORCE_VR flag for debugging.
  return this.isMobile() || window.WebVRConfig.FORCE_ENABLE_VR;
};

WebVRPolyfill.prototype.isFullScreenAvailable = function() {
  return (document.fullscreenEnabled ||
          document.mozFullScreenEnabled ||
          document.webkitFullscreenEnabled ||
          false);
};

// Installs a shim that updates a WebVR 1.0 spec implementation to WebVR 1.1
function InstallWebVRSpecShim() {
  if ('VRDisplay' in window && !('VRFrameData' in window)) {
    // Provide the VRFrameData object.
    window.VRFrameData = VRFrameData;

    // A lot of Chrome builds don't have depthNear and depthFar, even
    // though they're in the WebVR 1.0 spec. Patch them in if they're not present.
    if(!('depthNear' in window.VRDisplay.prototype)) {
      window.VRDisplay.prototype.depthNear = 0.01;
    }

    if(!('depthFar' in window.VRDisplay.prototype)) {
      window.VRDisplay.prototype.depthFar = 10000.0;
    }

    window.VRDisplay.prototype.getFrameData = function(frameData) {
      return Util.frameDataFromPose(frameData, this.getPose(), this);
    }
  }
};

WebVRPolyfill.InstallWebVRSpecShim = InstallWebVRSpecShim;
WebVRPolyfill.version = version;

module.exports.WebVRPolyfill = WebVRPolyfill;

},{"../package.json":8,"./base.js":9,"./cardboard-vr-display.js":12,"./display-wrappers.js":15,"./mouse-keyboard-vr-display.js":21,"./util.js":29}],33:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var EventEmitter = _dereq_('eventemitter3');
var shaka = _dereq_('shaka-player');

var Types = _dereq_('../video-type');
var Util = _dereq_('../util');

var DEFAULT_BITS_PER_SECOND = 1000000;

/**
 * Supports regular video URLs (eg. mp4), as well as adaptive manifests like
 * DASH (.mpd) and soon HLS (.m3u8).
 *
 * Events:
 *   load(video): When the video is loaded.
 *   error(message): If an error occurs.
 *
 * To play/pause/seek/etc, please use the underlying video element.
 */
function AdaptivePlayer(params) {
  this.video = document.createElement('video');
  // Loop by default.
  if (params.loop === true) {
    this.video.setAttribute('loop', true);
  }

  if (params.volume !== undefined) {
    // XXX: .setAttribute('volume', params.volume) doesn't work for some reason.
    this.video.volume = params.volume;
  }

  // Not muted by default.
  if (params.muted === true) {
    this.video.muted = params.muted;
  }

  // For FF, make sure we enable preload.
  this.video.setAttribute('preload', 'auto');
  // Enable inline video playback in iOS 10+.
  this.video.setAttribute('playsinline', true);
  this.video.setAttribute('crossorigin', 'anonymous');
}
AdaptivePlayer.prototype = new EventEmitter();

AdaptivePlayer.prototype.load = function(url) {
  var self = this;
  // TODO(smus): Investigate whether or not differentiation is best done by
  // mimeType after all. Cursory research suggests that adaptive streaming
  // manifest mime types aren't properly supported.
  //
  // For now, make determination based on extension.
  var extension = Util.getExtension(url);
  switch (extension) {
    case 'm3u8': // HLS
      this.type = Types.HLS;
      if (Util.isSafari()) {
        this.loadVideo_(url).then(function() {
          self.emit('load', self.video, self.type);
        }).catch(this.onError_.bind(this));
      } else {
        self.onError_('HLS is only supported on Safari.');
      }
      break;
    case 'mpd': // MPEG-DASH
      this.type = Types.DASH;
      this.loadShakaVideo_(url).then(function() {
        console.log('The video has now been loaded!');
        self.emit('load', self.video, self.type);
      }).catch(this.onError_.bind(this));
      break;
    default: // A regular video, not an adaptive manifest.
      this.type = Types.VIDEO;
      this.loadVideo_(url).then(function() {
        self.emit('load', self.video, self.type);
      }).catch(this.onError_.bind(this));
      break;
  }
};

AdaptivePlayer.prototype.destroy = function() {
  this.video.pause();
  this.video.src = '';
  this.video = null;
};

/*** PRIVATE API ***/

AdaptivePlayer.prototype.onError_ = function(e) {
  console.error(e);
  this.emit('error', e);
};

AdaptivePlayer.prototype.loadVideo_ = function(url) {
  var self = this, video = self.video;
  return new Promise(function(resolve, reject) {
    video.src = url;
    video.addEventListener('canplaythrough', resolve);
    video.addEventListener('loadedmetadata', function() {
      self.emit('timeupdate', {
        currentTime: video.currentTime,
        duration: video.duration
      });
    });
    video.addEventListener('error', reject);
    video.load();
  });
};

AdaptivePlayer.prototype.initShaka_ = function() {
  this.player = new shaka.Player(this.video);

  this.player.configure({
    abr: { defaultBandwidthEstimate: DEFAULT_BITS_PER_SECOND }
  });

  // Listen for error events.
  this.player.addEventListener('error', this.onError_);
};

AdaptivePlayer.prototype.loadShakaVideo_ = function(url) {
  // Install built-in polyfills to patch browser incompatibilities.
  shaka.polyfill.installAll();

  if (!shaka.Player.isBrowserSupported()) {
    console.error('Shaka is not supported on this browser.');
    return;
  }

  this.initShaka_();
  return this.player.load(url);
};

module.exports = AdaptivePlayer;

},{"../util":45,"../video-type":46,"eventemitter3":3,"shaka-player":5}],34:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Eyes = {
  LEFT: 1,
  RIGHT: 2
};

module.exports = Eyes;

},{}],35:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var EventEmitter = _dereq_('eventemitter3');
var TWEEN = _dereq_('@tweenjs/tween.js');

var Util = _dereq_('../util');

// Constants for the focus/blur animation.
var NORMAL_SCALE = new THREE.Vector3(1, 1, 1);
var FOCUS_SCALE = new THREE.Vector3(1.2, 1.2, 1.2);
var FOCUS_DURATION = 200;

// Constants for the active/inactive animation.
var INACTIVE_COLOR = new THREE.Color(1, 1, 1);
var ACTIVE_COLOR = new THREE.Color(0.8, 0, 0);
var ACTIVE_DURATION = 100;

// Constants for opacity.
var MAX_INNER_OPACITY = 0.8;
var MAX_OUTER_OPACITY = 0.5;
var FADE_START_ANGLE_DEG = 35;
var FADE_END_ANGLE_DEG = 60;
/**
 * Responsible for rectangular hot spots that the user can interact with.
 *
 * Specific duties:
 *   Adding and removing hotspots.
 *   Rendering the hotspots (debug mode only).
 *   Notifying when hotspots are interacted with.
 *
 * Emits the following events:
 *   click (id): a hotspot is clicked.
 *   focus (id): a hotspot is focused.
 *   blur (id): a hotspot is no longer hovered over.
 */
function HotspotRenderer(worldRenderer) {
  this.worldRenderer = worldRenderer;
  this.scene = worldRenderer.scene;

  // Note: this event must be added to document.body and not to window for it to
  // work inside iOS iframes.
  var body = document.body;
  // Bind events for hotspot interaction.
  if (!Util.isMobile()) {
    // Only enable mouse events on desktop.
    body.addEventListener('mousedown', this.onMouseDown_.bind(this), false);
    body.addEventListener('mousemove', this.onMouseMove_.bind(this), false);
    body.addEventListener('mouseup', this.onMouseUp_.bind(this), false);
  }
  body.addEventListener('touchstart', this.onTouchStart_.bind(this), false);
  body.addEventListener('touchend', this.onTouchEnd_.bind(this), false);

  // Add a placeholder for hotspots.
  this.hotspotRoot = new THREE.Object3D();
  // Align the center with the center of the camera too.
  this.hotspotRoot.rotation.y = Math.PI / 2;
  this.scene.add(this.hotspotRoot);

  // All hotspot IDs.
  this.hotspots = {};

  // Currently selected hotspots.
  this.selectedHotspots = {};

  // Hotspots that the last touchstart / mousedown event happened for.
  this.downHotspots = {};

  // For raycasting. Initialize mouse to be off screen initially.
  this.pointer = new THREE.Vector2(1, 1);
  this.raycaster = new THREE.Raycaster();
}
HotspotRenderer.prototype = new EventEmitter();

/**
 * @param pitch {Number} The latitude of center, specified in degrees, between
 * -90 and 90, with 0 at the horizon.
 * @param yaw {Number} The longitude of center, specified in degrees, between
 * -180 and 180, with 0 at the image center.
 * @param radius {Number} The radius of the hotspot, specified in meters.
 * @param distance {Number} The distance of the hotspot from camera, specified
 * in meters.
 * @param hotspotId {String} The ID of the hotspot.
 */
HotspotRenderer.prototype.add = function(pitch, yaw, radius, distance, id) {
  // If a hotspot already exists with this ID, stop.
  if (this.hotspots[id]) {
    // TODO: Proper error reporting.
    console.error('Attempt to add hotspot with existing id %s.', id);
    return;
  }
  var hotspot = this.createHotspot_(radius, distance);
  hotspot.name = id;

  // Position the hotspot based on the pitch and yaw specified.
  var quat = new THREE.Quaternion();
  quat.setFromEuler(new THREE.Euler(THREE.Math.degToRad(pitch), THREE.Math.degToRad(yaw), 0));
  hotspot.position.applyQuaternion(quat);
  hotspot.lookAt(new THREE.Vector3());

  this.hotspotRoot.add(hotspot);
  this.hotspots[id] = hotspot;
}

/**
 * Removes a hotspot based on the ID.
 *
 * @param ID {String} Identifier of the hotspot to be removed.
 */
HotspotRenderer.prototype.remove = function(id) {
  // If there's no hotspot with this ID, fail.
  if (!this.hotspots[id]) {
    // TODO: Proper error reporting.
    console.error('Attempt to remove non-existing hotspot with id %s.', id);
    return;
  }
  // Remove the mesh from the scene.
  this.hotspotRoot.remove(this.hotspots[id]);

  // If this hotspot was selected, make sure it gets unselected.
  delete this.selectedHotspots[id];
  delete this.downHotspots[id];
  delete this.hotspots[id];
  this.emit('blur', id);
};

/**
 * Clears all hotspots from the pano. Often called when changing panos.
 */
HotspotRenderer.prototype.clearAll = function() {
  for (var id in this.hotspots) {
    this.remove(id);
  }
};

HotspotRenderer.prototype.getCount = function() {
  var count = 0;
  for (var id in this.hotspots) {
    count += 1;
  }
  return count;
};

HotspotRenderer.prototype.update = function(camera) {
  if (this.worldRenderer.isVRMode()) {
    this.pointer.set(0, 0);
  }
  // Update the picking ray with the camera and mouse position.
  this.raycaster.setFromCamera(this.pointer, camera);

  // Fade hotspots out if they are really far from center to avoid overly
  // distorted visuals.
  this.fadeOffCenterHotspots_(camera);

  var hotspots = this.hotspotRoot.children;

  // Go through all hotspots to see if they are currently selected.
  for (var i = 0; i < hotspots.length; i++) {
    var hotspot = hotspots[i];
    //hotspot.lookAt(camera.position);
    var id = hotspot.name;
    // Check if hotspot is intersected with the picking ray.
    var intersects = this.raycaster.intersectObjects(hotspot.children);
    var isIntersected = (intersects.length > 0);

    // If newly selected, emit a focus event.
    if (isIntersected && !this.selectedHotspots[id]) {
      this.emit('focus', id);
      this.focus_(id);
    }
    // If no longer selected, emit a blur event.
    if (!isIntersected && this.selectedHotspots[id]) {
      this.emit('blur', id);
      this.blur_(id);
    }
    // Update the set of selected hotspots.
    if (isIntersected) {
      this.selectedHotspots[id] = true;
    } else {
      delete this.selectedHotspots[id];
    }
  }
};

/**
 * Toggle whether or not hotspots are visible.
 */
HotspotRenderer.prototype.setVisibility = function(isVisible) {
  this.hotspotRoot.visible = isVisible;
};

HotspotRenderer.prototype.onTouchStart_ = function(e) {
  // In VR mode, don't touch the pointer position.
  if (!this.worldRenderer.isVRMode()) {
    this.updateTouch_(e);
  }

  // Force a camera update to see if any hotspots were selected.
  this.update(this.worldRenderer.camera);

  this.downHotspots = {};
  for (var id in this.selectedHotspots) {
    this.downHotspots[id] = true;
    this.down_(id);
  }
  return false;
};

HotspotRenderer.prototype.onTouchEnd_ = function(e) {
  // If no hotspots are pressed, emit an empty click event.
  if (Util.isEmptyObject(this.downHotspots)) {
    this.emit('click');
    return;
  }

  // Only emit a click if the finger was down on the same hotspot before.
  for (var id in this.downHotspots) {
    this.emit('click', id);
    this.up_(id);
    e.preventDefault();
  }
};

HotspotRenderer.prototype.updateTouch_ = function(e) {
  var size = this.getSize_();
  var touch = e.touches[0];
	this.pointer.x = (touch.clientX / size.width) * 2 - 1;
	this.pointer.y = - (touch.clientY / size.height) * 2 + 1;
};

HotspotRenderer.prototype.onMouseDown_ = function(e) {
  this.updateMouse_(e);

  this.downHotspots = {};
  for (var id in this.selectedHotspots) {
    this.downHotspots[id] = true;
    this.down_(id);
  }
};

HotspotRenderer.prototype.onMouseMove_ = function(e) {
  this.updateMouse_(e);
};

HotspotRenderer.prototype.onMouseUp_ = function(e) {
  this.updateMouse_(e);

  // If no hotspots are pressed, emit an empty click event.
  if (Util.isEmptyObject(this.downHotspots)) {
    this.emit('click');
    return;
  }

  // Only emit a click if the mouse was down on the same hotspot before.
  for (var id in this.selectedHotspots) {
    if (id in this.downHotspots) {
      this.emit('click', id);
      this.up_(id);
    }
  }
};

HotspotRenderer.prototype.updateMouse_ = function(e) {
  var size = this.getSize_();
	this.pointer.x = (e.clientX / size.width) * 2 - 1;
	this.pointer.y = - (e.clientY / size.height) * 2 + 1;
};

HotspotRenderer.prototype.getSize_ = function() {
  var canvas = this.worldRenderer.renderer.domElement;
  return this.worldRenderer.renderer.getSize();
};

HotspotRenderer.prototype.createHotspot_ = function(radius, distance) {
  var innerGeometry = new THREE.CircleGeometry(radius, 32);

  var innerMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, side: THREE.DoubleSide, transparent: true,
    opacity: MAX_INNER_OPACITY, depthTest: false
  });

  var inner = new THREE.Mesh(innerGeometry, innerMaterial);
  inner.name = 'inner';

  var outerMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, side: THREE.DoubleSide, transparent: true,
    opacity: MAX_OUTER_OPACITY, depthTest: false
  });
  var outerGeometry = new THREE.RingGeometry(radius * 0.85, radius, 32);
  var outer = new THREE.Mesh(outerGeometry, outerMaterial);
  outer.name = 'outer';

  // Position at the extreme end of the sphere.
  var hotspot = new THREE.Object3D();
  hotspot.position.z = -distance;
  hotspot.scale.copy(NORMAL_SCALE);

  hotspot.add(inner);
  hotspot.add(outer);

  return hotspot;
};

/**
 * Large aspect ratios tend to cause visually jarring distortions on the sides.
 * Here we fade hotspots out to avoid them.
 */
HotspotRenderer.prototype.fadeOffCenterHotspots_ = function(camera) {
  var lookAt = new THREE.Vector3(1, 0, 0);
  lookAt.applyQuaternion(camera.quaternion);
  // Take into account the camera parent too.
  lookAt.applyQuaternion(camera.parent.quaternion);

  // Go through each hotspot. Calculate how far off center it is.
  for (var id in this.hotspots) {
    var hotspot = this.hotspots[id];
    var angle = hotspot.position.angleTo(lookAt);
    var angleDeg = THREE.Math.radToDeg(angle);
    var isVisible = angleDeg < 45;
    var opacity;
    if (angleDeg < FADE_START_ANGLE_DEG) {
      opacity = 1;
    } else if (angleDeg > FADE_END_ANGLE_DEG) {
      opacity = 0;
    } else {
      // We are in the case START < angle < END. Linearly interpolate.
      var range = FADE_END_ANGLE_DEG - FADE_START_ANGLE_DEG;
      var value = FADE_END_ANGLE_DEG - angleDeg;
      opacity = value / range;
    }

    // Opacity a function of angle. If angle is large, opacity is zero. At some
    // point, ramp opacity down.
    this.setOpacity_(id, opacity);
  }
};

HotspotRenderer.prototype.focus_ = function(id) {
  var hotspot = this.hotspots[id];

  // Tween scale of hotspot.
  this.tween = new TWEEN.Tween(hotspot.scale).to(FOCUS_SCALE, FOCUS_DURATION)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
  
  if (this.worldRenderer.isVRMode()) {
    this.timeForHospotClick = setTimeout(() => {
      this.emit('click', id);
    }, 1200 )
  }
};

HotspotRenderer.prototype.blur_ = function(id) {
  var hotspot = this.hotspots[id];

  this.tween = new TWEEN.Tween(hotspot.scale).to(NORMAL_SCALE, FOCUS_DURATION)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
  
  if (this.timeForHospotClick) {
    clearTimeout( this.timeForHospotClick );
  }
};

HotspotRenderer.prototype.down_ = function(id) {
  // Become active.
  var hotspot = this.hotspots[id];
  var outer = hotspot.getObjectByName('inner');

  this.tween = new TWEEN.Tween(outer.material.color).to(ACTIVE_COLOR, ACTIVE_DURATION)
      .start();
};

HotspotRenderer.prototype.up_ = function(id) {
  // Become inactive.
  var hotspot = this.hotspots[id];
  var outer = hotspot.getObjectByName('inner');

  this.tween = new TWEEN.Tween(outer.material.color).to(INACTIVE_COLOR, ACTIVE_DURATION)
      .start();
};

HotspotRenderer.prototype.setOpacity_ = function(id, opacity) {
  var hotspot = this.hotspots[id];
  var outer = hotspot.getObjectByName('outer');
  var inner = hotspot.getObjectByName('inner');

  outer.material.opacity = opacity * MAX_OUTER_OPACITY;
  inner.material.opacity = opacity * MAX_INNER_OPACITY;
};

module.exports = HotspotRenderer;

},{"../util":45,"@tweenjs/tween.js":1,"eventemitter3":3}],36:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var EventEmitter = _dereq_('eventemitter3');
var Message = _dereq_('../message');
var Util = _dereq_('../util');


/**
 * Sits in an embedded iframe, receiving messages from a containing
 * iFrame. This facilitates an API which provides the following features:
 *
 *    Playing and pausing content.
 *    Adding hotspots.
 *    Sending messages back to the containing iframe when hotspot is clicked
 *    Sending analytics events to containing iframe.
 *
 * Note: this script used to also respond to synthetic devicemotion events, but
 * no longer does so. This is because as of iOS 9.2, Safari disallows listening
 * for devicemotion events within cross-device iframes. To work around this, the
 * webvr-polyfill responds to the postMessage event containing devicemotion
 * information (sent by the iframe-message-sender in the VR View API).
 */
function IFrameMessageReceiver() {
  window.addEventListener('message', this.onMessage_.bind(this), false);
}
IFrameMessageReceiver.prototype = new EventEmitter();

IFrameMessageReceiver.prototype.onMessage_ = function(event) {
  if (Util.isDebug()) {
    console.log('onMessage_', event);
  }

  var message = event.data;
  var type = message.type.toLowerCase();
  var data = message.data;

  switch (type) {
    case Message.SET_CONTENT:
    case Message.SET_VOLUME:
    case Message.MUTED:
    case Message.ADD_HOTSPOT:
    case Message.PLAY:
    case Message.PAUSE:
    case Message.SET_CURRENT_TIME:
    case Message.GET_POSITION:
    case Message.SET_FULLSCREEN:
      this.emit(type, data);
      break;
    default:
      if (Util.isDebug()) {
        console.warn('Got unknown message of type %s from %s', message.type, message.origin);
      }
  }
};

module.exports = IFrameMessageReceiver;

},{"../message":44,"../util":45,"eventemitter3":3}],37:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Shows a 2D loading indicator while various pieces of EmbedVR load.
 */
function LoadingIndicator() {
  this.el = this.build_();
  document.body.appendChild(this.el);
  this.show();
}

LoadingIndicator.prototype.build_ = function() {
  var overlay = document.createElement('div');
  var s = overlay.style;
  s.position = 'fixed';
  s.top = 0;
  s.left = 0;
  s.width = '100%';
  s.height = '100%';
  s.background = '#eee';
  var img = document.createElement('img');
  img.src = 'images/loading.gif';
  var s = img.style;
  s.position = 'absolute';
  s.top = '50%';
  s.left = '50%';
  s.transform = 'translate(-50%, -50%)';

  overlay.appendChild(img);
  return overlay;
};

LoadingIndicator.prototype.hide = function() {
  this.el.style.display = 'none';
};

LoadingIndicator.prototype.show = function() {
  this.el.style.display = 'block';
};

module.exports = LoadingIndicator;

},{}],38:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Initialize the loading indicator as quickly as possible to give the user
// immediate feedback.
var LoadingIndicator = _dereq_('./loading-indicator');
var loadIndicator = new LoadingIndicator();

var ES6Promise = _dereq_('es6-promise');
// Polyfill ES6 promises for IE.
ES6Promise.polyfill();

var IFrameMessageReceiver = _dereq_('./iframe-message-receiver');
var Message = _dereq_('../message');
var SceneInfo = _dereq_('./scene-info');
var Stats = _dereq_('../../node_modules/stats-js/build/stats.min');
var Util = _dereq_('../util');
var WebVRPolyfill = _dereq_('webvr-polyfill');
var WorldRenderer = _dereq_('./world-renderer');

var receiver = new IFrameMessageReceiver();
receiver.on(Message.PLAY, onPlayRequest);
receiver.on(Message.PAUSE, onPauseRequest);
receiver.on(Message.ADD_HOTSPOT, onAddHotspot);
receiver.on(Message.SET_CONTENT, onSetContent);
receiver.on(Message.SET_VOLUME, onSetVolume);
receiver.on(Message.MUTED, onMuted);
receiver.on(Message.SET_CURRENT_TIME, onUpdateCurrentTime);
receiver.on(Message.GET_POSITION, onGetPosition);
receiver.on(Message.SET_FULLSCREEN, onSetFullscreen);

window.addEventListener('load', onLoad);

var stats = new Stats();
var scene = SceneInfo.loadFromGetParams();

var worldRenderer = new WorldRenderer(scene);
worldRenderer.on('error', onRenderError);
worldRenderer.on('load', onRenderLoad);
worldRenderer.on('modechange', onModeChange);
worldRenderer.on('ended', onEnded);
worldRenderer.on('play', onPlay);
worldRenderer.hotspotRenderer.on('click', onHotspotClick);

window.worldRenderer = worldRenderer;

var isReadySent = false;
var volume = 0;

function onLoad() {
  if (!Util.isWebGLEnabled()) {
    showError('WebGL not supported.');
    return;
  }

  // Load the scene.
  worldRenderer.setScene(scene);

  if (scene.isDebug) {
    // Show stats.
    showStats();
  }

  if (scene.isYawOnly) {
    WebVRConfig = window.WebVRConfig || {};
    WebVRConfig.YAW_ONLY = true;
  }

  requestAnimationFrame(loop);
}


function onVideoTap() {
  worldRenderer.videoProxy.play();
  hidePlayButton();

  // Prevent multiple play() calls on the video element.
  document.body.removeEventListener('touchend', onVideoTap);
}

function onRenderLoad(event) {
  if (event.videoElement) {

    var scene = SceneInfo.loadFromGetParams();

    // On mobile, tell the user they need to tap to start. Otherwise, autoplay.
    if (Util.isMobile()) {
      // Tell user to tap to start.
      showPlayButton();
      document.body.addEventListener('touchend', onVideoTap);
    } else {
      event.videoElement.play();
    }

    // Attach to pause and play events, to notify the API.
    event.videoElement.addEventListener('pause', onPause);
    event.videoElement.addEventListener('play', onPlay);
    event.videoElement.addEventListener('timeupdate', onGetCurrentTime);
    event.videoElement.addEventListener('ended', onEnded);
  }
  // Hide loading indicator.
  loadIndicator.hide();

  // Autopan only on desktop, for photos only, and only if autopan is enabled.
  if (!Util.isMobile() && !worldRenderer.sceneInfo.video && !worldRenderer.sceneInfo.isAutopanOff) {
    worldRenderer.autopan();
  }

  // Notify the API that we are ready, but only do this once.
  if (!isReadySent) {
    if (event.videoElement) {
      Util.sendParentMessage({
        type: 'ready',
        data: {
          duration: event.videoElement.duration
        }
      });
    } else {
      Util.sendParentMessage({
        type: 'ready'
      });
    }

    isReadySent = true;
  }
}

function onPlayRequest() {
  if (!worldRenderer.videoProxy) {
    onApiError('Attempt to pause, but no video found.');
    return;
  }
  worldRenderer.videoProxy.play();
}

function onPauseRequest() {
  if (!worldRenderer.videoProxy) {
    onApiError('Attempt to pause, but no video found.');
    return;
  }
  worldRenderer.videoProxy.pause();
}

function onAddHotspot(e) {
  if (Util.isDebug()) {
    console.log('onAddHotspot', e);
  }
  // TODO: Implement some validation?

  var pitch = parseFloat(e.pitch);
  var yaw = parseFloat(e.yaw);
  var radius = parseFloat(e.radius);
  var distance = parseFloat(e.distance);
  var id = e.id;
  worldRenderer.hotspotRenderer.add(pitch, yaw, radius, distance, id);
}

function onSetContent(e) {
  if (Util.isDebug()) {
    console.log('onSetContent', e);
  }
  // Remove all of the hotspots.
  worldRenderer.hotspotRenderer.clearAll();
  // Fade to black.
  worldRenderer.sphereRenderer.setOpacity(0, 500).then(function() {
    // Then load the new scene.
    var scene = SceneInfo.loadFromAPIParams(e.contentInfo);
    worldRenderer.destroy();

    // Update the URL to reflect the new scene. This is important particularily
    // on iOS where we use a fake fullscreen mode.
    var url = scene.getCurrentUrl();
    //console.log('Updating url to be %s', url);
    window.history.pushState(null, 'VR View', url);

    // And set the new scene.
    return worldRenderer.setScene(scene);
  }).then(function() {
    // Then fade the scene back in.
    worldRenderer.sphereRenderer.setOpacity(1, 500);
  });
}

function onSetVolume(e) {
  // Only work for video. If there's no video, send back an error.
  if (!worldRenderer.videoProxy) {
    onApiError('Attempt to set volume, but no video found.');
    return;
  }

  worldRenderer.videoProxy.setVolume(e.volumeLevel);
  volume = e.volumeLevel;
  Util.sendParentMessage({
    type: 'volumechange',
    data: e.volumeLevel
  });
}

function onMuted(e) {
  // Only work for video. If there's no video, send back an error.
  if (!worldRenderer.videoProxy) {
    onApiError('Attempt to mute, but no video found.');
    return;
  }

  worldRenderer.videoProxy.mute(e.muteState);

  Util.sendParentMessage({
    type: 'muted',
    data: e.muteState
  });
}

function onUpdateCurrentTime(time) {
  if (!worldRenderer.videoProxy) {
    onApiError('Attempt to pause, but no video found.');
    return;
  }

  worldRenderer.videoProxy.setCurrentTime(time);
  onGetCurrentTime();
}

function onGetCurrentTime() {
  var time = worldRenderer.videoProxy.getCurrentTime();
  Util.sendParentMessage({
    type: 'timeupdate',
    data: time
  });
}

function onSetFullscreen() {
  if (!worldRenderer.videoProxy) {
    onApiError('Attempt to set fullscreen, but no video found.');
    return;
  }
  worldRenderer.manager.onFSClick_();
}

function onApiError(message) {
  console.error(message);
  Util.sendParentMessage({
    type: 'error',
    data: {message: message}
  });
}

function onModeChange(mode) {
  Util.sendParentMessage({
    type: 'modechange',
    data: {mode: mode}
  });
}

function onHotspotClick(id) {
  Util.sendParentMessage({
    type: 'click',
    data: {id: id}
  });
}

function onPlay() {
  Util.sendParentMessage({
    type: 'paused',
    data: false
  });
}

function onPause() {
  Util.sendParentMessage({
    type: 'paused',
    data: true
  });
}

function onEnded() {
    Util.sendParentMessage({
      type: 'ended',
      data: true
    });
}

function onSceneError(message) {
  showError('Loader: ' + message);
}

function onRenderError(message) {
  showError('Render: ' + message);
}

function showError(message, opt_title) {
  // Hide loading indicator.
  loadIndicator.hide();

  var error = document.querySelector('#error');
  error.classList.add('visible');
  error.querySelector('.message').innerHTML = message;

  var title = (opt_title !== undefined ? opt_title : 'Error');
  error.querySelector('.title').innerHTML = title;
}

function hideError() {
  var error = document.querySelector('#error');
  error.classList.remove('visible');
}

function showPlayButton() {
  var playButton = document.querySelector('#play-overlay');
  playButton.classList.add('visible');
}

function hidePlayButton() {
  var playButton = document.querySelector('#play-overlay');
  playButton.classList.remove('visible');
}

function showStats() {
  stats.setMode(0); // 0: fps, 1: ms

  // Align bottom-left.
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.bottom = '0px';
  document.body.appendChild(stats.domElement);
}

function loop(time) {
  // Use the VRDisplay RAF if it is present.
  if (worldRenderer.vrDisplay) {
    worldRenderer.vrDisplay.requestAnimationFrame(loop);
  } else {
    requestAnimationFrame(loop);
  }

  stats.begin();
  // Update the video if needed.
  if (worldRenderer.videoProxy) {
    worldRenderer.videoProxy.update(time);
  }
  worldRenderer.render(time);
  worldRenderer.submitFrame();
  stats.end();
}
function onGetPosition() {
    Util.sendParentMessage({
        type: 'getposition',
        data: {
            Yaw: worldRenderer.camera.rotation.y * 180 / Math.PI,
            Pitch: worldRenderer.camera.rotation.x * 180 / Math.PI
        }
    });
}

},{"../../node_modules/stats-js/build/stats.min":6,"../message":44,"../util":45,"./iframe-message-receiver":36,"./loading-indicator":37,"./scene-info":40,"./world-renderer":43,"es6-promise":2,"webvr-polyfill":22}],39:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function ReticleRenderer(camera) {
  this.camera = camera;

  this.reticle = this.createReticle_();
  // In front of the hotspot itself, which is at r=0.99.
  this.reticle.position.z = -0.97;
  camera.add(this.reticle);

  this.setVisibility(false);
}

ReticleRenderer.prototype.setVisibility = function(isVisible) {
  // TODO: Tween the transition.
  this.reticle.visible = isVisible;
};

ReticleRenderer.prototype.createReticle_ = function() {
  // Make a torus.
  var geometry = new THREE.TorusGeometry(0.02, 0.005, 10, 20);
  var material = new THREE.MeshBasicMaterial({color: 0x000000});
  var torus = new THREE.Mesh(geometry, material);

  return torus;
};

module.exports = ReticleRenderer;

},{}],40:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Util = _dereq_('../util');

var CAMEL_TO_UNDERSCORE = {
  video: 'video',
  image: 'image',
  preview: 'preview',
  loop: 'loop',
  volume: 'volume',
  muted: 'muted',
  isStereo: 'is_stereo',
  defaultYaw: 'default_yaw',
  isYawOnly: 'is_yaw_only',
  isDebug: 'is_debug',
  isVROff: 'is_vr_off',
  isAutopanOff: 'is_autopan_off',
  hideFullscreenButton: 'hide_fullscreen_button'
};

/**
 * Contains all information about a given scene.
 */
function SceneInfo(opt_params) {
  var params = opt_params || {};
  params.player = {
    loop: opt_params.loop,
    volume: opt_params.volume,
    muted: opt_params.muted
  };

  this.image = params.image;
  this.preview = params.preview;
  this.video = params.video;
  this.defaultYaw = THREE.Math.degToRad(params.defaultYaw || 0);

  this.isStereo = Util.parseBoolean(params.isStereo);
  this.isYawOnly = Util.parseBoolean(params.isYawOnly);
  this.isDebug = Util.parseBoolean(params.isDebug);
  this.isVROff = Util.parseBoolean(params.isVROff);
  this.isAutopanOff = Util.parseBoolean(params.isAutopanOff);
  this.loop = Util.parseBoolean(params.player.loop);
  this.volume = parseFloat(
      params.player.volume ? params.player.volume : '1');
  this.muted = Util.parseBoolean(params.player.muted);
  this.hideFullscreenButton = Util.parseBoolean(params.hideFullscreenButton);
}

SceneInfo.loadFromGetParams = function() {
  var params = {};
  for (var camelCase in CAMEL_TO_UNDERSCORE) {
    var underscore = CAMEL_TO_UNDERSCORE[camelCase];
    params[camelCase] = Util.getQueryParameter(underscore)
                        || ((window.WebVRConfig && window.WebVRConfig.PLAYER) ? window.WebVRConfig.PLAYER[underscore] : "");
  }
  var scene = new SceneInfo(params);
  if (!scene.isValid()) {
    console.warn('Invalid scene: %s', scene.errorMessage);
  }
  return scene;
};

SceneInfo.loadFromAPIParams = function(underscoreParams) {
  var params = {};
  for (var camelCase in CAMEL_TO_UNDERSCORE) {
    var underscore = CAMEL_TO_UNDERSCORE[camelCase];
    if (underscoreParams[underscore]) {
      params[camelCase] = underscoreParams[underscore];
    }
  }
  var scene = new SceneInfo(params);
  if (!scene.isValid()) {
    console.warn('Invalid scene: %s', scene.errorMessage);
  }
  return scene;
};

SceneInfo.prototype.isValid = function() {
  // Either it's an image or a video.
  if (!this.image && !this.video) {
    this.errorMessage = 'Either image or video URL must be specified.';
    return false;
  }
  if (this.image && this.video) {
    this.errorMessage = 'Both image and video URL can\'t be specified.';
    return false;
  }
  if (this.image && !this.isValidImage_(this.image)) {
    this.errorMessage = 'Invalid image URL: ' + this.image;
    return false;
  }
  this.errorMessage = null;
  return true;
};

/**
 * Generates a URL to reflect this scene.
 */
SceneInfo.prototype.getCurrentUrl = function() {
  var url = location.protocol + '//' + location.host + location.pathname + '?';
  for (var camelCase in CAMEL_TO_UNDERSCORE) {
    var underscore = CAMEL_TO_UNDERSCORE[camelCase];
    var value = this[camelCase];
    if (value !== undefined) {
      url += underscore + '=' + value + '&';
    }
  }
  // Chop off the trailing ampersand.
  return url.substring(0, url.length - 1);
};

SceneInfo.prototype.isValidImage_ = function(imageUrl) {
  return true;
};

module.exports = SceneInfo;

},{"../util":45}],41:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Eyes = _dereq_('./eyes');
var TWEEN = _dereq_('@tweenjs/tween.js');
var Util = _dereq_('../util');
var VideoType = _dereq_('../video-type');

function SphereRenderer(scene) {
  this.scene = scene;

  // Create a transparent mask.
  this.createOpacityMask_();
}

/**
 * Sets the photosphere based on the image in the source. Supports stereo and
 * mono photospheres.
 *
 * @return {Promise}
 */
SphereRenderer.prototype.setPhotosphere = function(src, opt_params) {
  return new Promise(function(resolve, reject) {
    this.resolve = resolve;
    this.reject = reject;

    var params = opt_params || {};

    this.isStereo = !!params.isStereo;
    this.src = src;

    // Load texture.
    var loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(src, this.onTextureLoaded_.bind(this), undefined,
                this.onTextureError_.bind(this));
  }.bind(this));
};

/**
 * @return {Promise} Yeah.
 */
SphereRenderer.prototype.set360Video = function (videoElement, videoType, opt_params) {
  return new Promise(function(resolve, reject) {
    this.resolve = resolve;
    this.reject = reject;

    var params = opt_params || {};

    this.isStereo = !!params.isStereo;

    // Load the video texture.
    var videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;

    if (Util.isSafari() && videoType === VideoType.HLS) {
      // fix black screen issue on safari
      videoTexture.format = THREE.RGBAFormat;
      videoTexture.flipY = false;
    } else {
      videoTexture.format = THREE.RGBFormat;
    }

    videoTexture.needsUpdate = true;

    this.onTextureLoaded_(videoTexture);
  }.bind(this));
};

/**
 * Set the opacity of the panorama.
 *
 * @param {Number} opacity How opaque we want the panorama to be. 0 means black,
 * 1 means full color.
 * @param {Number} duration Number of milliseconds the transition should take.
 *
 * @return {Promise} When the opacity change is complete.
 */
SphereRenderer.prototype.setOpacity = function(opacity, duration) {
  var scene = this.scene;
  // If we want the opacity
  var overlayOpacity = 1 - opacity;
  return new Promise(function(resolve, reject) {
    var mask = scene.getObjectByName('opacityMask');
    var tween = new TWEEN.Tween({opacity: mask.material.opacity})
        .to({opacity: overlayOpacity}, duration)
        .easing(TWEEN.Easing.Quadratic.InOut);
    tween.onUpdate(function(e) {
      mask.material.opacity = this.opacity;
    });
    tween.onComplete(resolve).start();
  });
};

SphereRenderer.prototype.onTextureLoaded_ = function(texture) {
  var sphereLeft;
  var sphereRight;
  if (this.isStereo) {
    sphereLeft = this.createPhotosphere_(texture, {offsetY: 0.5, scaleY: 0.5});
    sphereRight = this.createPhotosphere_(texture, {offsetY: 0, scaleY: 0.5});
  } else {
    sphereLeft = this.createPhotosphere_(texture);
    sphereRight = this.createPhotosphere_(texture);
  }

  // Display in left and right eye respectively.
  sphereLeft.layers.set(Eyes.LEFT);
  sphereLeft.eye = Eyes.LEFT;
  sphereLeft.name = 'eyeLeft';
  sphereRight.layers.set(Eyes.RIGHT);
  sphereRight.eye = Eyes.RIGHT;
  sphereRight.name = 'eyeRight';


    this.scene.getObjectByName('photo').children = [sphereLeft, sphereRight];

  this.resolve();
};

SphereRenderer.prototype.onTextureError_ = function(error) {
  this.reject('Unable to load texture from "' + this.src + '"');
};


SphereRenderer.prototype.createPhotosphere_ = function(texture, opt_params) {
  var p = opt_params || {};
  p.scaleX = p.scaleX || 1;
  p.scaleY = p.scaleY || 1;
  p.offsetX = p.offsetX || 0;
  p.offsetY = p.offsetY || 0;
  p.phiStart = p.phiStart || 0;
  p.phiLength = p.phiLength || Math.PI * 2;
  p.thetaStart = p.thetaStart || 0;
  p.thetaLength = p.thetaLength || Math.PI;

  var geometry = new THREE.SphereGeometry(1, 48, 48,
      p.phiStart, p.phiLength, p.thetaStart, p.thetaLength);
  geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
  var uvs = geometry.faceVertexUvs[0];
  for (var i = 0; i < uvs.length; i ++) {
    for (var j = 0; j < 3; j ++) {
      uvs[i][j].x *= p.scaleX;
      uvs[i][j].x += p.offsetX;
      uvs[i][j].y *= p.scaleY;
      uvs[i][j].y += p.offsetY;
    }
  }

  var material;
  if (texture.format === THREE.RGBAFormat && texture.flipY === false) {
    material = new THREE.ShaderMaterial({
      uniforms: {
        texture: { value: texture }
      },
      vertexShader: [
        "varying vec2 vUV;",
        "void main() {",
        "	vUV = vec2( uv.x, 1.0 - uv.y );",
        "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform sampler2D texture;",
        "varying vec2 vUV;",
        "void main() {",
        " gl_FragColor = texture2D( texture, vUV  )" + (Util.isIOS() ? ".bgra" : "") + ";",
        "}"
      ].join("\n")
    });
  } else {
    material = new THREE.MeshBasicMaterial({ map: texture });
  }
  var out = new THREE.Mesh(geometry, material);
  //out.visible = false;
  out.renderOrder = -1;
  return out;
};

SphereRenderer.prototype.createOpacityMask_ = function() {
  var geometry = new THREE.SphereGeometry(0.49, 48, 48);
  var material = new THREE.MeshBasicMaterial({
    color: 0x000000, side: THREE.DoubleSide, opacity: 0, transparent: true});
  var opacityMask = new THREE.Mesh(geometry, material);
  opacityMask.name = 'opacityMask';
  opacityMask.renderOrder = 1;

  this.scene.add(opacityMask);
  return opacityMask;
};

module.exports = SphereRenderer;

},{"../util":45,"../video-type":46,"./eyes":34,"@tweenjs/tween.js":1}],42:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Util = _dereq_('../util');

/**
 * A proxy class for working around the fact that as soon as a video is play()ed
 * on iOS, Safari auto-fullscreens the video.
 *
 * TODO(smus): The entire raison d'etre for this class is to work around this
 * issue. Once Safari implements some way to suppress this fullscreen player, we
 * can remove this code.
 */
function VideoProxy(videoElement) {
  this.videoElement = videoElement;
  // True if we're currently manually advancing the playhead (only on iOS).
  this.isFakePlayback = false;

  // When the video started playing.
  this.startTime = null;
}

VideoProxy.prototype.play = function() {
  if (Util.isIOS9OrLess()) {
    this.startTime = performance.now();
    this.isFakePlayback = true;

    // Make an audio element to playback just the audio part.
    this.audioElement = new Audio();
    this.audioElement.src = this.videoElement.src;
    this.audioElement.play();
  } else {
    this.videoElement.play().then(function(e) {
      console.log('Playing video.', e);
    });
  }
};

VideoProxy.prototype.pause = function() {
  if (Util.isIOS9OrLess() && this.isFakePlayback) {
    this.isFakePlayback = true;

    this.audioElement.pause();
  } else {
    this.videoElement.pause();
  }
};

VideoProxy.prototype.setVolume = function(volumeLevel) {
  if (this.videoElement) {
    // On iOS 10, the VideoElement.volume property is read-only. So we special
    // case muting and unmuting.
    if (Util.isIOS()) {
      this.videoElement.muted = (volumeLevel === 0);
    } else {
      this.videoElement.volume = volumeLevel;
    }
  }
  if (this.audioElement) {
    this.audioElement.volume = volumeLevel;
  }
};

/**
 * Set the attribute mute of the elements according with the muteState param.
 *
 * @param bool muteState
 */
VideoProxy.prototype.mute = function(muteState) {
  if (this.videoElement) {
    this.videoElement.muted = muteState;
  }
  if (this.audioElement) {
    this.audioElement.muted = muteState;
  }
};

VideoProxy.prototype.getCurrentTime = function() {
  return Util.isIOS9OrLess() ? this.audioElement.currentTime : this.videoElement.currentTime;
};

/**
 *
 * @param {Object} time
 */
VideoProxy.prototype.setCurrentTime = function(time) {
  if (this.videoElement) {
    this.videoElement.currentTime = time.currentTime;
  }
  if (this.audioElement) {
    this.audioElement.currentTime = time.currentTime;
  }
};

/**
 * Called on RAF to progress playback.
 */
VideoProxy.prototype.update = function() {
  // Fakes playback for iOS only.
  if (!this.isFakePlayback) {
    return;
  }
  var duration = this.videoElement.duration;
  var now = performance.now();
  var delta = now - this.startTime;
  var deltaS = delta / 1000;
  this.videoElement.currentTime = deltaS;

  // Loop through the video
  if (deltaS > duration) {
    this.startTime = now;
    this.videoElement.currentTime = 0;
    // Also restart the audio.
    this.audioElement.currentTime = 0;
  }
};

module.exports = VideoProxy;

},{"../util":45}],43:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var AdaptivePlayer = _dereq_('./adaptive-player');
var EventEmitter = _dereq_('eventemitter3');
var Eyes = _dereq_('./eyes');
var HotspotRenderer = _dereq_('./hotspot-renderer');
var ReticleRenderer = _dereq_('./reticle-renderer');
var SphereRenderer = _dereq_('./sphere-renderer');
var TWEEN = _dereq_('@tweenjs/tween.js');
var Util = _dereq_('../util');
var VideoProxy = _dereq_('./video-proxy');
var WebVRManager = _dereq_('webvr-boilerplate');

var AUTOPAN_DURATION = 3000;
var AUTOPAN_ANGLE = 0.4;

/**
 * The main WebGL rendering entry point. Manages the scene, camera, VR-related
 * rendering updates. Interacts with the WebVRManager.
 *
 * Coordinates the other renderers: SphereRenderer, HotspotRenderer,
 * ReticleRenderer.
 *
 * Also manages the AdaptivePlayer and VideoProxy.
 *
 * Emits the following events:
 *   load: when the scene is loaded.
 *   error: if there is an error loading the scene.
 *   modechange(Boolean isVR): if the mode (eg. VR, fullscreen, etc) changes.
 */
function WorldRenderer(params) {
  this.init_(params.hideFullscreenButton);

  this.sphereRenderer = new SphereRenderer(this.scene);
  this.hotspotRenderer = new HotspotRenderer(this);
  this.hotspotRenderer.on('focus', this.onHotspotFocus_.bind(this));
  this.hotspotRenderer.on('blur', this.onHotspotBlur_.bind(this));
  this.reticleRenderer = new ReticleRenderer(this.camera);

  // Get the VR Display as soon as we initialize.
  navigator.getVRDisplays().then(function(displays) {
    if (displays.length > 0) {
      this.vrDisplay = displays[0];
    }
  }.bind(this));

}
WorldRenderer.prototype = new EventEmitter();

WorldRenderer.prototype.render = function(time) {
  this.controls.update();
  TWEEN.update(time);
  this.effect.render(this.scene, this.camera);
  this.hotspotRenderer.update(this.camera);
};

/**
 * @return {Promise} When the scene is fully loaded.
 */
WorldRenderer.prototype.setScene = function(scene) {
  var self = this;
  var promise = new Promise(function(resolve, reject) {
    self.sceneResolve = resolve;
    self.sceneReject = reject;
  });

  if (!scene || !scene.isValid()) {
    this.didLoadFail_(scene.errorMessage);
    return;
  }

  var params = {
    isStereo: scene.isStereo,
    loop: scene.loop,
    volume: scene.volume,
    muted: scene.muted
  };

  this.setDefaultYaw_(scene.defaultYaw || 0);

  // Disable VR mode if explicitly disabled, or if we're loading a video on iOS
  // 9 or earlier.
  if (scene.isVROff || (scene.video && Util.isIOS9OrLess())) {
    this.manager.setVRCompatibleOverride(false);
  }

  // Set various callback overrides in iOS.
  if (Util.isIOS()) {
    this.manager.setFullscreenCallback(function() {
      Util.sendParentMessage({type: 'enter-fullscreen'});
    });
    this.manager.setExitFullscreenCallback(function() {
      Util.sendParentMessage({type: 'exit-fullscreen'});
    });
    this.manager.setVRCallback(function() {
      Util.sendParentMessage({type: 'enter-vr'});
    });
  }

  // If we're dealing with an image, and not a video.
  if (scene.image && !scene.video) {
    if (scene.preview) {
      // First load the preview.
      this.sphereRenderer.setPhotosphere(scene.preview, params).then(function() {
        // As soon as something is loaded, emit the load event to hide the
        // loading progress bar.
        self.didLoad_();
        // Then load the full resolution image.
        self.sphereRenderer.setPhotosphere(scene.image, params);
      }).catch(self.didLoadFail_.bind(self));
    } else {
      // No preview -- go straight to rendering the full image.
      this.sphereRenderer.setPhotosphere(scene.image, params).then(function() {
        self.didLoad_();
      }).catch(self.didLoadFail_.bind(self));
    }
  } else if (scene.video) {
    if (Util.isIE11()) {
      // On IE 11, if an 'image' param is provided, load it instead of showing
      // an error.
      //
      // TODO(smus): Once video textures are supported, remove this fallback.
      if (scene.image) {
        this.sphereRenderer.setPhotosphere(scene.image, params).then(function() {
          self.didLoad_();
        }).catch(self.didLoadFail_.bind(self));
      } else {
        this.didLoadFail_('Video is not supported on IE11.');
      }
    } else {
      this.player = new AdaptivePlayer(params);
      this.player.on('load', function(videoElement, videoType) {
        self.sphereRenderer.set360Video(videoElement, videoType, params).then(function() {
          self.didLoad_({videoElement: videoElement});
        }).catch(self.didLoadFail_.bind(self));
      });
      this.player.on('error', function(error) {
        self.didLoadFail_('Video load error: ' + error);
      });
      this.player.load(scene.video);

      this.videoProxy = new VideoProxy(this.player.video);
    }
  }

  this.sceneInfo = scene;
  if (Util.isDebug()) {
    console.log('Loaded scene', scene);
  }

  return promise;
};

WorldRenderer.prototype.isVRMode = function() {
  return !!this.vrDisplay && this.vrDisplay.isPresenting;
};

WorldRenderer.prototype.submitFrame = function() {
  if (this.isVRMode()) {
    this.vrDisplay.submitFrame();
  }
};

WorldRenderer.prototype.disposeEye_ = function(eye) {
  if (eye) {
    if (eye.material.map) {
      eye.material.map.dispose();
    }
    eye.material.dispose();
    eye.geometry.dispose();
  }
};

WorldRenderer.prototype.dispose = function() {
  var eyeLeft = this.scene.getObjectByName('eyeLeft');
  this.disposeEye_(eyeLeft);
  var eyeRight = this.scene.getObjectByName('eyeRight');
  this.disposeEye_(eyeRight);
};

WorldRenderer.prototype.destroy = function() {
  if (this.player) {
    this.player.removeAllListeners();
    this.player.destroy();
    this.player = null;
  }
  var photo = this.scene.getObjectByName('photo');
  var eyeLeft = this.scene.getObjectByName('eyeLeft');
  var eyeRight = this.scene.getObjectByName('eyeRight');

  if (eyeLeft) {
    this.disposeEye_(eyeLeft);
    photo.remove(eyeLeft);
    this.scene.remove(eyeLeft);
  }

  if (eyeRight) {
    this.disposeEye_(eyeRight);
    photo.remove(eyeRight);
    this.scene.remove(eyeRight);
  }
};

WorldRenderer.prototype.didLoad_ = function(opt_event) {
  var event = opt_event || {};
  this.emit('load', event);
  if (this.sceneResolve) {
    this.sceneResolve();
  }
};

WorldRenderer.prototype.didLoadFail_ = function(message) {
  this.emit('error', message);
  if (this.sceneReject) {
    this.sceneReject(message);
  }
};

/**
 * Sets the default yaw.
 * @param {Number} angleRad The yaw in radians.
 */
WorldRenderer.prototype.setDefaultYaw_ = function(angleRad) {
  // Rotate the camera parent to take into account the scene's rotation.
  // By default, it should be at the center of the image.
  var display = this.controls.getVRDisplay();
  // For desktop, we subtract the current display Y axis
  var theta = display.theta_ || 0;
  // For devices with orientation we make the current view center
  if (display.poseSensor_) {
    display.poseSensor_.resetPose();
  }
  this.camera.parent.rotation.y = (Math.PI / 2.0) + angleRad - theta;
};

/**
 * Do the initial camera tween to rotate the camera, giving an indication that
 * there is live content there (on desktop only).
 */
WorldRenderer.prototype.autopan = function(duration) {
  var targetY = this.camera.parent.rotation.y - AUTOPAN_ANGLE;
  var tween = new TWEEN.Tween(this.camera.parent.rotation)
      .to({y: targetY}, AUTOPAN_DURATION)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
};

WorldRenderer.prototype.init_ = function(hideFullscreenButton) {
  var container = document.querySelector('body');
  var aspect = window.innerWidth / window.innerHeight;
  var camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
  camera.layers.enable(1);

  var cameraDummy = new THREE.Object3D();
  cameraDummy.add(camera);

  // Antialiasing disabled to improve performance.
  var renderer = new THREE.WebGLRenderer({antialias: false});
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  container.appendChild(renderer.domElement);

  var controls = new THREE.VRControls(camera);
  var effect = new THREE.VREffect(renderer);

  // Disable eye separation.
  effect.scale = 0;
  effect.setSize(window.innerWidth, window.innerHeight);

  // Present submission of frames automatically. This is done manually in
  // submitFrame().
  effect.autoSubmitFrame = false;

  this.camera = camera;
  this.renderer = renderer;
  this.effect = effect;
  this.controls = controls;
  this.manager = new WebVRManager(renderer, effect, {predistorted: false, hideButton: hideFullscreenButton});

  this.scene = this.createScene_();
  this.scene.add(this.camera.parent);


  // Watch the resize event.
  window.addEventListener('resize', this.onResize_.bind(this));

  // Prevent context menu.
  window.addEventListener('contextmenu', this.onContextMenu_.bind(this));

  window.addEventListener('vrdisplaypresentchange',
                          this.onVRDisplayPresentChange_.bind(this));
};

WorldRenderer.prototype.onResize_ = function() {
  this.effect.setSize(window.innerWidth, window.innerHeight);
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();
};

WorldRenderer.prototype.onVRDisplayPresentChange_ = function(e) {
  if (Util.isDebug()) {
    console.log('onVRDisplayPresentChange_');
  }
  var isVR = this.isVRMode();

  // If the mode changed to VR and there is at least one hotspot, show reticle.
  var isReticleVisible = isVR && this.hotspotRenderer.getCount() > 0;
  this.reticleRenderer.setVisibility(isReticleVisible);

  // Resize the renderer for good measure.
  this.onResize_();

  // Analytics.
  if (window.analytics) {
    analytics.logModeChanged(isVR);
  }

  // When exiting VR mode from iOS, make sure we emit back an exit-fullscreen event.
  if (!isVR && Util.isIOS()) {
    Util.sendParentMessage({type: 'exit-fullscreen'});
  }

  // Emit a mode change event back to any listeners.
  this.emit('modechange', isVR);
};

WorldRenderer.prototype.createScene_ = function(opt_params) {
  var scene = new THREE.Scene();

  // Add a group for the photosphere.
  var photoGroup = new THREE.Object3D();
  photoGroup.name = 'photo';
  scene.add(photoGroup);

  return scene;
};

WorldRenderer.prototype.onHotspotFocus_ = function(id) {
  // Set the default cursor to be a pointer.
  this.setCursor_('pointer');
};

WorldRenderer.prototype.onHotspotBlur_ = function(id) {
  // Reset the default cursor to be the default one.
  this.setCursor_('');
};

WorldRenderer.prototype.setCursor_ = function(cursor) {
  this.renderer.domElement.style.cursor = cursor;
};

WorldRenderer.prototype.onContextMenu_ = function(e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
};

module.exports = WorldRenderer;

},{"../util":45,"./adaptive-player":33,"./eyes":34,"./hotspot-renderer":35,"./reticle-renderer":39,"./sphere-renderer":41,"./video-proxy":42,"@tweenjs/tween.js":1,"eventemitter3":3,"webvr-boilerplate":7}],44:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Messages from the API to the embed.
 */
var Message = {
  PLAY: 'play',
  PAUSE: 'pause',
  TIMEUPDATE: 'timeupdate',
  ADD_HOTSPOT: 'addhotspot',
  SET_CONTENT: 'setimage',
  SET_VOLUME: 'setvolume',
  MUTED: 'muted',
  SET_CURRENT_TIME: 'setcurrenttime',
  DEVICE_MOTION: 'devicemotion',
  GET_POSITION: 'getposition',
  SET_FULLSCREEN: 'setfullscreen',
};

module.exports = Message;

},{}],45:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Util = window.Util || {};

Util.isDataURI = function(src) {
  return src && src.indexOf('data:') == 0;
};

Util.generateUUID = function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};

Util.isMobile = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

Util.isIOS = function() {
  return /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
};

Util.isSafari = function() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

Util.cloneObject = function(obj) {
  var out = {};
  for (key in obj) {
    out[key] = obj[key];
  }
  return out;
};

Util.hashCode = function(s) {
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
};

Util.loadTrackSrc = function(context, src, callback, opt_progressCallback) {
  var request = new XMLHttpRequest();
  request.open('GET', src, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously.
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      callback(buffer);
    }, function(e) {
      console.error(e);
    });
  };
  if (opt_progressCallback) {
    request.onprogress = function(e) {
      var percent = e.loaded / e.total;
      opt_progressCallback(percent);
    };
  }
  request.send();
};

Util.isPow2 = function(n) {
  return (n & (n - 1)) == 0;
};

Util.capitalize = function(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

Util.isIFrame = function() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

// From http://goo.gl/4WX3tg
Util.getQueryParameter = function(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};


// From http://stackoverflow.com/questions/11871077/proper-way-to-detect-webgl-support.
Util.isWebGLEnabled = function() {
  var canvas = document.createElement('canvas');
  try { gl = canvas.getContext("webgl"); }
  catch (x) { gl = null; }

  if (gl == null) {
    try { gl = canvas.getContext("experimental-webgl"); experimental = true; }
    catch (x) { gl = null; }
  }
  return !!gl;
};

Util.clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

// From http://stackoverflow.com/questions/10140604/fastest-hypotenuse-in-javascript
Util.hypot = Math.hypot || function(x, y) {
  return Math.sqrt(x*x + y*y);
};

// From http://stackoverflow.com/a/17447718/693934
Util.isIE11 = function() {
  return navigator.userAgent.match(/Trident/);
};

Util.getRectCenter = function(rect) {
  return new THREE.Vector2(rect.x + rect.width/2, rect.y + rect.height/2);
};

Util.getScreenWidth = function() {
  return Math.max(window.screen.width, window.screen.height) *
      window.devicePixelRatio;
};

Util.getScreenHeight = function() {
  return Math.min(window.screen.width, window.screen.height) *
      window.devicePixelRatio;
};

Util.isIOS9OrLess = function() {
  if (!Util.isIOS()) {
    return false;
  }
  var re = /(iPhone|iPad|iPod) OS ([\d_]+)/;
  var iOSVersion = navigator.userAgent.match(re);
  if (!iOSVersion) {
    return false;
  }
  // Get the last group.
  var versionString = iOSVersion[iOSVersion.length - 1];
  var majorVersion = parseFloat(versionString);
  return majorVersion <= 9;
};

Util.getExtension = function(url) {
  return url.split('.').pop().split('?')[0];
};

Util.createGetParams = function(params) {
  var out = '?';
  for (var k in params) {
    var paramString = k + '=' + params[k] + '&';
    out += paramString;
  }
  // Remove the trailing ampersand.
  out.substring(0, params.length - 2);
  return out;
};

Util.sendParentMessage = function(message) {
  if (window.parent) {
    parent.postMessage(message, '*');
  }
};

Util.parseBoolean = function(value) {
  if (value == 'false' || value == 0) {
    return false;
  } else if (value == 'true' || value == 1) {
    return true;
  } else {
    return !!value;
  }
};

/**
 * @param base {String} An absolute directory root.
 * @param relative {String} A relative path.
 *
 * @returns {String} An absolute path corresponding to the rootPath.
 *
 * From http://stackoverflow.com/a/14780463/693934.
 */
Util.relativeToAbsolutePath = function(base, relative) {
  var stack = base.split('/');
  var parts = relative.split('/');
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] == '.') {
      continue;
    }
    if (parts[i] == '..') {
      stack.pop();
    } else {
      stack.push(parts[i]);
    }
  }
  return stack.join('/');
};

/**
 * @return {Boolean} True iff the specified path is an absolute path.
 */
Util.isPathAbsolute = function(path) {
  return ! /^(?:\/|[a-z]+:\/\/)/.test(path);
}

Util.isEmptyObject = function(obj) {
  return Object.getOwnPropertyNames(obj).length == 0;
};

Util.isDebug = function() {
  return Util.parseBoolean(Util.getQueryParameter('debug'));
};

Util.getCurrentScript = function() {
  // Note: in IE11, document.currentScript doesn't work, so we fall back to this
  // hack, taken from https://goo.gl/TpExuH.
  if (!document.currentScript) {
    console.warn('This browser does not support document.currentScript. Trying fallback.');
  }
  return document.currentScript || document.scripts[document.scripts.length - 1];
}


module.exports = Util;

},{}],46:[function(_dereq_,module,exports){
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Video Types
 */
var VideoTypes = {
  HLS: 1,
  DASH: 2,
  VIDEO: 3
};

module.exports = VideoTypes;
},{}]},{},[38]);
