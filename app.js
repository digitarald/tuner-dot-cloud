/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _signal = __webpack_require__(6);
	
	var _signal2 = _interopRequireDefault(_signal);
	
	var _note = __webpack_require__(2);
	
	var _presets = __webpack_require__(5);
	
	var _presets2 = _interopRequireDefault(_presets);
	
	var _simple = __webpack_require__(7);
	
	var _simple2 = _interopRequireDefault(_simple);
	
	__webpack_require__(9);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	if (navigator.serviceWorker) {
	  navigator.serviceWorker.register('./offline-worker.js').then(function () {
	    console.log('Offlined! Continue to tune offline anytime …');
	  }).catch(function (err) {
	    console.error('Offlining failed', err);
	  });
	}
	
	const bufferSize = 4096;
	const fftSize = 2048;
	
	const renderer = new _simple2.default();
	const preset = _presets2.default.get('piano');
	const signal = new _signal2.default({
	  bufferSize: bufferSize,
	  fftSize: fftSize,
	  range: preset.pitchRange
	});
	signal.connect();
	
	signal.on('didSkip', function () {
	  renderer.set('detected', false);
	});
	signal.on('didDetect', function (_ref) {
	  let pitch = _ref.pitch;
	
	  const note = (0, _note.noteFromPitch)(pitch);
	  renderer.set('detected', true);
	  renderer.set('last', Date.now());
	  renderer.set('pitch', pitch);
	  renderer.set('note', note);
	  renderer.set('cents', note.centsOffFromPitch(pitch));
	});
	
	renderer.start();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * EventEmitter v4.2.11 - git.io/ee
	 * Unlicense - http://unlicense.org/
	 * Oliver Caldwell - http://oli.me.uk/
	 * @preserve
	 */
	
	;(function () {
	    'use strict';
	
	    /**
	     * Class for managing events.
	     * Can be extended to provide event functionality in other classes.
	     *
	     * @class EventEmitter Manages event registering and emitting.
	     */
	    function EventEmitter() {}
	
	    // Shortcuts to improve speed and size
	    var proto = EventEmitter.prototype;
	    var exports = this;
	    var originalGlobalValue = exports.EventEmitter;
	
	    /**
	     * Finds the index of the listener for the event in its storage array.
	     *
	     * @param {Function[]} listeners Array of listeners to search through.
	     * @param {Function} listener Method to look for.
	     * @return {Number} Index of the specified listener, -1 if not found
	     * @api private
	     */
	    function indexOfListener(listeners, listener) {
	        var i = listeners.length;
	        while (i--) {
	            if (listeners[i].listener === listener) {
	                return i;
	            }
	        }
	
	        return -1;
	    }
	
	    /**
	     * Alias a method while keeping the context correct, to allow for overwriting of target method.
	     *
	     * @param {String} name The name of the target method.
	     * @return {Function} The aliased method
	     * @api private
	     */
	    function alias(name) {
	        return function aliasClosure() {
	            return this[name].apply(this, arguments);
	        };
	    }
	
	    /**
	     * Returns the listener array for the specified event.
	     * Will initialise the event object and listener arrays if required.
	     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
	     * Each property in the object response is an array of listener functions.
	     *
	     * @param {String|RegExp} evt Name of the event to return the listeners from.
	     * @return {Function[]|Object} All listener functions for the event.
	     */
	    proto.getListeners = function getListeners(evt) {
	        var events = this._getEvents();
	        var response;
	        var key;
	
	        // Return a concatenated array of all matching events if
	        // the selector is a regular expression.
	        if (evt instanceof RegExp) {
	            response = {};
	            for (key in events) {
	                if (events.hasOwnProperty(key) && evt.test(key)) {
	                    response[key] = events[key];
	                }
	            }
	        }
	        else {
	            response = events[evt] || (events[evt] = []);
	        }
	
	        return response;
	    };
	
	    /**
	     * Takes a list of listener objects and flattens it into a list of listener functions.
	     *
	     * @param {Object[]} listeners Raw listener objects.
	     * @return {Function[]} Just the listener functions.
	     */
	    proto.flattenListeners = function flattenListeners(listeners) {
	        var flatListeners = [];
	        var i;
	
	        for (i = 0; i < listeners.length; i += 1) {
	            flatListeners.push(listeners[i].listener);
	        }
	
	        return flatListeners;
	    };
	
	    /**
	     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
	     *
	     * @param {String|RegExp} evt Name of the event to return the listeners from.
	     * @return {Object} All listener functions for an event in an object.
	     */
	    proto.getListenersAsObject = function getListenersAsObject(evt) {
	        var listeners = this.getListeners(evt);
	        var response;
	
	        if (listeners instanceof Array) {
	            response = {};
	            response[evt] = listeners;
	        }
	
	        return response || listeners;
	    };
	
	    /**
	     * Adds a listener function to the specified event.
	     * The listener will not be added if it is a duplicate.
	     * If the listener returns true then it will be removed after it is called.
	     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to attach the listener to.
	     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.addListener = function addListener(evt, listener) {
	        var listeners = this.getListenersAsObject(evt);
	        var listenerIsWrapped = typeof listener === 'object';
	        var key;
	
	        for (key in listeners) {
	            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
	                listeners[key].push(listenerIsWrapped ? listener : {
	                    listener: listener,
	                    once: false
	                });
	            }
	        }
	
	        return this;
	    };
	
	    /**
	     * Alias of addListener
	     */
	    proto.on = alias('addListener');
	
	    /**
	     * Semi-alias of addListener. It will add a listener that will be
	     * automatically removed after its first execution.
	     *
	     * @param {String|RegExp} evt Name of the event to attach the listener to.
	     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.addOnceListener = function addOnceListener(evt, listener) {
	        return this.addListener(evt, {
	            listener: listener,
	            once: true
	        });
	    };
	
	    /**
	     * Alias of addOnceListener.
	     */
	    proto.once = alias('addOnceListener');
	
	    /**
	     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
	     * You need to tell it what event names should be matched by a regex.
	     *
	     * @param {String} evt Name of the event to create.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.defineEvent = function defineEvent(evt) {
	        this.getListeners(evt);
	        return this;
	    };
	
	    /**
	     * Uses defineEvent to define multiple events.
	     *
	     * @param {String[]} evts An array of event names to define.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.defineEvents = function defineEvents(evts) {
	        for (var i = 0; i < evts.length; i += 1) {
	            this.defineEvent(evts[i]);
	        }
	        return this;
	    };
	
	    /**
	     * Removes a listener function from the specified event.
	     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to remove the listener from.
	     * @param {Function} listener Method to remove from the event.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.removeListener = function removeListener(evt, listener) {
	        var listeners = this.getListenersAsObject(evt);
	        var index;
	        var key;
	
	        for (key in listeners) {
	            if (listeners.hasOwnProperty(key)) {
	                index = indexOfListener(listeners[key], listener);
	
	                if (index !== -1) {
	                    listeners[key].splice(index, 1);
	                }
	            }
	        }
	
	        return this;
	    };
	
	    /**
	     * Alias of removeListener
	     */
	    proto.off = alias('removeListener');
	
	    /**
	     * Adds listeners in bulk using the manipulateListeners method.
	     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
	     * You can also pass it a regular expression to add the array of listeners to all events that match it.
	     * Yeah, this function does quite a bit. That's probably a bad thing.
	     *
	     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
	     * @param {Function[]} [listeners] An optional array of listener functions to add.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.addListeners = function addListeners(evt, listeners) {
	        // Pass through to manipulateListeners
	        return this.manipulateListeners(false, evt, listeners);
	    };
	
	    /**
	     * Removes listeners in bulk using the manipulateListeners method.
	     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	     * You can also pass it an event name and an array of listeners to be removed.
	     * You can also pass it a regular expression to remove the listeners from all events that match it.
	     *
	     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
	     * @param {Function[]} [listeners] An optional array of listener functions to remove.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.removeListeners = function removeListeners(evt, listeners) {
	        // Pass through to manipulateListeners
	        return this.manipulateListeners(true, evt, listeners);
	    };
	
	    /**
	     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
	     * The first argument will determine if the listeners are removed (true) or added (false).
	     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	     * You can also pass it an event name and an array of listeners to be added/removed.
	     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
	     *
	     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
	     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
	     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
	        var i;
	        var value;
	        var single = remove ? this.removeListener : this.addListener;
	        var multiple = remove ? this.removeListeners : this.addListeners;
	
	        // If evt is an object then pass each of its properties to this method
	        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
	            for (i in evt) {
	                if (evt.hasOwnProperty(i) && (value = evt[i])) {
	                    // Pass the single listener straight through to the singular method
	                    if (typeof value === 'function') {
	                        single.call(this, i, value);
	                    }
	                    else {
	                        // Otherwise pass back to the multiple function
	                        multiple.call(this, i, value);
	                    }
	                }
	            }
	        }
	        else {
	            // So evt must be a string
	            // And listeners must be an array of listeners
	            // Loop over it and pass each one to the multiple method
	            i = listeners.length;
	            while (i--) {
	                single.call(this, evt, listeners[i]);
	            }
	        }
	
	        return this;
	    };
	
	    /**
	     * Removes all listeners from a specified event.
	     * If you do not specify an event then all listeners will be removed.
	     * That means every event will be emptied.
	     * You can also pass a regex to remove all events that match it.
	     *
	     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.removeEvent = function removeEvent(evt) {
	        var type = typeof evt;
	        var events = this._getEvents();
	        var key;
	
	        // Remove different things depending on the state of evt
	        if (type === 'string') {
	            // Remove all listeners for the specified event
	            delete events[evt];
	        }
	        else if (evt instanceof RegExp) {
	            // Remove all events matching the regex.
	            for (key in events) {
	                if (events.hasOwnProperty(key) && evt.test(key)) {
	                    delete events[key];
	                }
	            }
	        }
	        else {
	            // Remove all listeners in all events
	            delete this._events;
	        }
	
	        return this;
	    };
	
	    /**
	     * Alias of removeEvent.
	     *
	     * Added to mirror the node API.
	     */
	    proto.removeAllListeners = alias('removeEvent');
	
	    /**
	     * Emits an event of your choice.
	     * When emitted, every listener attached to that event will be executed.
	     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
	     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
	     * So they will not arrive within the array on the other side, they will be separate.
	     * You can also pass a regular expression to emit to all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	     * @param {Array} [args] Optional array of arguments to be passed to each listener.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.emitEvent = function emitEvent(evt, args) {
	        var listenersMap = this.getListenersAsObject(evt);
	        var listeners;
	        var listener;
	        var i;
	        var key;
	        var response;
	
	        for (key in listenersMap) {
	            if (listenersMap.hasOwnProperty(key)) {
	                listeners = listenersMap[key].slice(0);
	                i = listeners.length;
	
	                while (i--) {
	                    // If the listener returns true then it shall be removed from the event
	                    // The function is executed either with a basic call or an apply if there is an args array
	                    listener = listeners[i];
	
	                    if (listener.once === true) {
	                        this.removeListener(evt, listener.listener);
	                    }
	
	                    response = listener.listener.apply(this, args || []);
	
	                    if (response === this._getOnceReturnValue()) {
	                        this.removeListener(evt, listener.listener);
	                    }
	                }
	            }
	        }
	
	        return this;
	    };
	
	    /**
	     * Alias of emitEvent
	     */
	    proto.trigger = alias('emitEvent');
	
	    /**
	     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
	     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	     * @param {...*} Optional additional arguments to be passed to each listener.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.emit = function emit(evt) {
	        var args = Array.prototype.slice.call(arguments, 1);
	        return this.emitEvent(evt, args);
	    };
	
	    /**
	     * Sets the current value to check against when executing listeners. If a
	     * listeners return value matches the one set here then it will be removed
	     * after execution. This value defaults to true.
	     *
	     * @param {*} value The new value to check for when executing listeners.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.setOnceReturnValue = function setOnceReturnValue(value) {
	        this._onceReturnValue = value;
	        return this;
	    };
	
	    /**
	     * Fetches the current value to check against when executing listeners. If
	     * the listeners return value matches this one then it should be removed
	     * automatically. It will return true by default.
	     *
	     * @return {*|Boolean} The current value to check for or the default, true.
	     * @api private
	     */
	    proto._getOnceReturnValue = function _getOnceReturnValue() {
	        if (this.hasOwnProperty('_onceReturnValue')) {
	            return this._onceReturnValue;
	        }
	        else {
	            return true;
	        }
	    };
	
	    /**
	     * Fetches the events object and creates one if required.
	     *
	     * @return {Object} The events storage object.
	     * @api private
	     */
	    proto._getEvents = function _getEvents() {
	        return this._events || (this._events = {});
	    };
	
	    /**
	     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
	     *
	     * @return {Function} Non conflicting EventEmitter class.
	     */
	    EventEmitter.noConflict = function noConflict() {
	        exports.EventEmitter = originalGlobalValue;
	        return EventEmitter;
	    };
	
	    // Expose the class either via AMD, CommonJS or the global object
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	            return EventEmitter;
	        }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    }
	    else if (typeof module === 'object' && module.exports){
	        module.exports = EventEmitter;
	    }
	    else {
	        exports.EventEmitter = EventEmitter;
	    }
	}.call(this));


/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	exports.centFromPitch = centFromPitch;
	exports.indexFromPitch = indexFromPitch;
	exports.noteFromPitch = noteFromPitch;
	exports.pitchFromIndex = pitchFromIndex;
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	let Note = function () {
	  function Note(note, octave) {
	    _classCallCheck(this, Note);
	
	    this.note = note;
	    this.octave = octave;
	    this.index = octave * 12 + note + 1;
	    this.pitch = pitchFromIndex(this.index);
	    const notation = notations[note];
	    this.notation = notation;
	    this.whole = notation.charAt(0);
	    this.accidental = notation.charAt(1) || '';
	    const previous = byIndex.get(this.index - 1);
	    if (previous) {
	      this.previous = previous;
	      previous.next = this;
	    }
	  }
	
	  Note.prototype.toString = function toString() {
	    return this.notation;
	  };
	
	  Note.prototype.centsOffFromPitch = function centsOffFromPitch(pitch) {
	    return 1200 * Math.log(pitch / this.pitch) / Math.log(2);
	  };
	
	  _createClass(Note, [{
	    key: 'base',
	    get: function () {
	      return byIndex.get(this.index % 12) || this;
	    }
	  }]);
	
	  return Note;
	}();
	
	;
	
	// http://en.wikipedia.org/wiki/Scientific_pitch_notation
	const notations = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
	
	function centFromPitch(pitch) {
	  return 12 * (Math.log(pitch / 440) / Math.log(2)) + 49;
	};
	
	function indexFromPitch(pitch) {
	  return Math.round(centFromPitch(pitch));
	};
	
	function noteFromPitch(pitch) {
	  return byIndex.get(indexFromPitch(pitch)) || null;
	};
	
	function pitchFromIndex(index) {
	  return 440 * Math.pow(2, (index - 49) / 12);
	};
	
	const byIndex = exports.byIndex = new Map();
	const byName = exports.byName = new Map();
	const list = exports.list = new Set();
	
	for (let octave = 0; octave <= 8; octave++) {
	  for (let t = 0; t < 12; t++) {
	    const note = new Note(t, octave);
	    byIndex.set(note.index, note);
	    byName.set(note.notation + note.octave, note);
	    list.add(note);
	  }
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.default = undefined;
	
	var _wolfy87Eventemitter = __webpack_require__(1);
	
	var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	let Canvas = function (_EventEmitter) {
	  _inherits(Canvas, _EventEmitter);
	
	  function Canvas() {
	    let fill = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	
	    _classCallCheck(this, Canvas);
	
	    var _this = _possibleConstructorReturn(this, _EventEmitter.call(this));
	
	    _this.fill = fill;
	    _this.element = document.createElement('canvas');
	    document.body.appendChild(_this.element);
	    _this.ctx = _this.element.getContext('2d');
	    window.addEventListener('resize', function () {
	      return _this.fit();
	    });
	    _this.fit();
	    return _this;
	  }
	
	  Canvas.prototype.clear = function clear() {
	    this.ctx.save();
	    if (this.fill) {
	      this.ctx.fillStyle = this.fill;
	      this.ctx.fillRect(0, 0, this.size[0], this.size[1]);
	    } else {
	      this.ctx.clearRect(0, 0, this.size[0], this.size[1]);
	    }
	    this.ctx.restore();
	  };
	
	  Canvas.prototype.fit = function fit() {
	    this.ctx.restore();
	    this.size = [window.innerWidth, window.innerHeight];
	    const element = this.element;
	    const size = this.size;
	
	    const ratio = window.devicePixelRatio || 1;
	    const scale = `scale(${ 1 / ratio })`;
	    element.style.transform = scale;
	    element.width = size[0] * ratio;
	    element.height = size[1] * ratio;
	    this.ctx.scale(ratio, ratio);
	    this.ctx.save();
	  };
	
	  return Canvas;
	}(_wolfy87Eventemitter2.default);

	exports.default = Canvas;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	exports.default = {
	  // http://en.wikipedia.org/wiki/Piano_key_frequencies
	  piano: ['A0', 'C8'],
	  // http://en.wikipedia.org/wiki/Voice_frequency
	  // http://en.wikipedia.org/wiki/Vocal_range#Vocal_range_and_voice_classification
	  voice: ['F2', 'C6'],
	  // http://ffden-2.phys.uaf.edu/211.web.stuff/billington/main.htm
	  guitar: ['D2', 'G4'],
	  bass: ['B0', 'G2'],
	  // http://ukuleleworld.com/tune/index.html
	  ukuleleSoprano: ['C4', 'A4']
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _note = __webpack_require__(2);
	
	var _presetsData = __webpack_require__(4);
	
	var _presetsData2 = _interopRequireDefault(_presetsData);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	let Preset = function Preset(name, range) {
	  _classCallCheck(this, Preset);
	
	  this.name = name;
	  this.notes = range;
	  const low = _note.byName.get(range[0]);
	  const high = _note.byName.get(range[1]);
	  this.pitchRange = [(low.previous || low).pitch, (high.next || high).pitch];
	};
	
	const presets = new Map();
	for (let name in _presetsData2.default) {
	  presets.set(name, new Preset(name, _presetsData2.default[name]));
	}
	exports.default = presets;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	__webpack_require__(10);
	
	var _wolfy87Eventemitter = __webpack_require__(1);
	
	var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);
	
	var _pitchfinderWorker = __webpack_require__(11);
	
	var _pitchfinderWorker2 = _interopRequireDefault(_pitchfinderWorker);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	// import Detector from './detector.js';
	
	
	const AudioContext = window.AudioContext || window.webkitAudioContext;
	
	let Signal = function (_EventEmitter) {
	  _inherits(Signal, _EventEmitter);
	
	  // indexRange = null;
	
	  function Signal() {
	    let options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	    _classCallCheck(this, Signal);
	
	    var _this = _possibleConstructorReturn(this, _EventEmitter.call(this));
	
	    _this.input = null;
	    _this.source = null;
	    _this.volume = 0.0;
	    _this.pitch = 0.0;
	    _this.bufferSize = 2048;
	    _this.threshold = 0.05;
	    _this.range = null;
	    _this.detecting = false;
	    _this.connected = false;
	
	    Object.assign(_this, options);
	    if (!_this.ctx) {
	      _this.ctx = new AudioContext();
	    }
	    _this.sampleRate = _this.ctx.sampleRate;
	    // if (this.range) {
	    //   this.indexRange = [
	    //     Math.floor(this.pitchToIndex(this.range[0])),
	    //     Math.ceil(this.pitchToIndex(this.range[1]))
	    //   ];
	    // } else {
	    //   this.range = null;
	    // }
	
	    _this.channelData = new Float32Array(_this.bufferSize);
	    _this.script = _this.ctx.createScriptProcessor(_this.bufferSize, 1, 1);
	    _this.script.onaudioprocess = function (evt) {
	      _this.detect(evt.inputBuffer);
	    };
	    _this.script.connect(_this.ctx.destination);
	
	    _this.worker = new _pitchfinderWorker2.default();
	    _this.worker.postMessage({
	      type: 'init',
	      bufferSize: _this.bufferSize,
	      sampleRate: _this.sampleRate
	    });
	    _this.worker.addEventListener('message', function (evt) {
	      _this.didDetect(evt.data);
	    });
	
	    document.addEventListener('visibilitychange', function () {
	      if (document.hidden) {
	        _this.disconnect();
	      }
	      _this.connect();
	    });
	    _this.connect();
	    return _this;
	  }
	
	  Signal.prototype.detect = function detect(inputBuffer) {
	    if (this.detecting) {
	      return;
	    }
	    this.detecting = true;
	    const source = inputBuffer.getChannelData(0);
	    for (let i = 0; i < this.bufferSize; i++) {
	      this.channelData[i] = source[i];
	    }
	    this.worker.postMessage({
	      type: 'detect',
	      channelData: this.channelData.buffer
	    }, [this.channelData.buffer]);
	  };
	
	  Signal.prototype.didDetect = function didDetect(_ref) {
	    let pitch = _ref.pitch;
	    let channelData = _ref.channelData;
	
	    this.detecting = false;
	    // Prevents "An ArrayBuffer is neutered and could not be cloned."
	    this.channelData = new Float32Array(channelData);
	    if (this.range[0] > pitch || this.range[1] < pitch) {
	      this.emit('didSkip');
	      return;
	    }
	    this.emit('didDetect', { pitch: pitch });
	  };
	
	  // analyze() {
	  //   this.analyser.getByteFrequencyData(this.frequencyData);
	  //   let sum = 0.0;
	  //   const [low, high] = this.range;
	  //   const l = high - low;
	  //   // get all the frequency amplitudes
	  //   for (let i = low; i < high; i++) {
	  //     sum += this.frequencyData[i];
	  //   }
	  //   this.volume = (sum / l) / 256;
	  //   this.emit('didAnalyse', this);
	  // }
	
	  Signal.prototype.connect = function connect() {
	    var _this2 = this;
	
	    if (this.connected) {
	      return;
	    }
	    this.connected = true;
	    console.log('getUserMedia');
	    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
	      const track = stream.getAudioTracks()[0];
	      _this2.input = track;
	      _this2.source = _this2.ctx.createMediaStreamSource(stream);
	      _this2.source.connect(_this2.script);
	      _this2.emit('source', _this2.source);
	    }).catch(function (err) {
	      _this2.connected = false;
	      window.alert(err.message);
	    });
	  };
	
	  Signal.prototype.disconnect = function disconnect() {
	    if (!this.connected || !this.input) {
	      return;
	    }
	    this.connected = false;
	    this.input.stop();
	    this.input = null;
	    this.source.disconnect();
	    this.source = null;
	    this.on('didDisconnect');
	  };
	
	  // pitchToIndex(pitch) {
	  //   const nyquist = this.sampleRate / 2;
	  //   return pitch / nyquist * this.fftSize;
	  // }
	
	
	  return Signal;
	}(_wolfy87Eventemitter2.default);
	
	exports.default = Signal;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.default = undefined;
	
	var _wolfy87Eventemitter = __webpack_require__(1);
	
	var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);
	
	var _canvas = __webpack_require__(3);
	
	var _canvas2 = _interopRequireDefault(_canvas);
	
	var _spring = __webpack_require__(8);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	let Simple = function (_EventEmitter) {
	  _inherits(Simple, _EventEmitter);
	
	  function Simple() {
	    var _temp, _this, _ret;
	
	    _classCallCheck(this, Simple);
	
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	
	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _EventEmitter.call.apply(_EventEmitter, [this].concat(args))), _this), _this.main = new _canvas2.default('rgb(30, 68, 136)'), _this.graph = new _canvas2.default(), _this.updateBound = _this.update.bind(_this), _this.centsSpring = new _spring.Spring(0), _this.volumeSpring = new _spring.Spring(0), _this.detectedSpring = new _spring.Spring(0), _this.last = 0, _this.cents = 0, _this.volume = 0, _this.pitch = 0, _this.note = null, _this.detected = false, _temp), _possibleConstructorReturn(_this, _ret);
	  }
	
	  Simple.prototype.set = function set(key, value) {
	    const previous = this[key];
	    this[key] = value;
	    this.emit(key, value, previous);
	  };
	
	  Simple.prototype.start = function start() {
	    this.update(window.performance.now());
	  };
	
	  Simple.prototype.update = function update(now) {
	    window.requestAnimationFrame(this.updateBound);
	    this.volumeSpring.setEndValue(this.volume);
	    this.centsSpring.setEndValue(this.cents);
	    this.detectedSpring.setEndValue(this.detected ? 1 : 0, this.detected);
	    (0, _spring.tickSpring)(now);
	
	    var _main = this.main;
	    const ctx = _main.ctx;
	    const size = _main.size;
	
	    const center = [size[0] / 2, size[1] / 2];
	    this.main.clear();
	
	    const cents = this.centsSpring.value / 50;
	    const alpha = this.detectedSpring.value * 0.7 + 0.3;
	    const barWidth = center[0] * 0.38;
	    const width = cents * barWidth;
	    ctx.save();
	    ctx.fillStyle = `rgba(111, 190, 74, ${ alpha })`;
	    ctx.fillRect(center[0] + center[0] * cents - width / 2, 0, width, size[1]);
	    ctx.restore();
	
	    const note = this.note;
	    const fontMd = Math.round(center[1] * 0.61);
	    const fontSm = Math.round(fontMd * 0.61);
	    ctx.save();
	    // ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
	    // ctx.fillRect(center[0] - fontMd / 4, center[1] - fontMd / 2, fontMd / 2, fontMd);
	    ctx.textAlign = 'right';
	    ctx.textBaseline = 'middle';
	    ctx.font = `${ fontMd }px sans-serif`;
	    ctx.fillStyle = `rgba(255, 255, 255, ${ alpha })`;
	    if (note) {
	      ctx.fillText(note.whole, center[0], center[1]);
	      ctx.textAlign = 'left';
	      ctx.font = `${ fontSm }px sans-serif`;
	      ctx.textBaseline = 'top';
	      ctx.fillText(note.octave, center[0] + fontSm * 0.38, center[1] - fontMd * 0.61);
	      ctx.textBaseline = 'bottom';
	      ctx.fillText(note.accidental, center[0] + fontSm * 0.38, center[1] + fontMd * 0.61);
	    }
	    ctx.restore();
	    this.emit('didUpdate');
	  };
	
	  return Simple;
	}(_wolfy87Eventemitter2.default);

	exports.default = Simple;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.Spring = undefined;
	exports.tickSpring = tickSpring;
	exports.createSprings = createSprings;
	exports.setSprings = setSprings;
	exports.forEachSpring = forEachSpring;
	
	var _wolfy87Eventemitter = __webpack_require__(1);
	
	var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	let Spring = exports.Spring = function (_EventEmitter) {
	  _inherits(Spring, _EventEmitter);
	
	  function Spring() {
	    let value = arguments.length <= 0 || arguments[0] === undefined ? 0.0 : arguments[0];
	    let options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	    _classCallCheck(this, Spring);
	
	    var _this = _possibleConstructorReturn(this, _EventEmitter.call(this));
	
	    _this.velocity = 0.0;
	    _this.tension = 50.0;
	    _this.damping = 0.85;
	    _this.active = true;
	    _this.ref = null;
	
	    _this.endValue = value;
	    _this.value = value;
	    Object.assign(_this, options);
	    activeLength++;
	    allSprings.push(_this);
	    return _this;
	  }
	
	  Spring.prototype.setEndValue = function setEndValue(value, reset) {
	    if (this.endValue === value && this.value === value) {
	      return;
	    }
	    this.endValue = value;
	    if (reset) {
	      this.velocity = 0;
	      this.value = value;
	    } else if (!this.active) {
	      this.active = true;
	      activeLength++;
	    }
	  };
	
	  return Spring;
	}(_wolfy87Eventemitter2.default);
	
	;
	
	const allSprings = [];
	let activeLength = 0;
	const fdt = 1 / 60;
	const epsilon = 0.01;
	let tail = 0.0;
	let past = 0.0;
	
	function tickSpring(now) {
	  now /= 1000;
	  if (past === 0) {
	    past = now;
	    return true;
	  }
	  tail += Math.min(now - past, 0.5);
	  past = now;
	  const iterations = Math.floor(tail / fdt);
	  tail -= iterations * fdt;
	  if (iterations === 0 || activeLength === 0) {
	    return false;
	  }
	  for (let i = 0, l = allSprings.length; i < l; i++) {
	    const spring = allSprings[i];
	    if (!spring.active) {
	      continue;
	    }
	    for (let j = 0; j < iterations; j++) {
	      const f = spring.tension * (spring.endValue - spring.value);
	      spring.value += (spring.velocity + f * 0.5 * fdt) * fdt;
	      spring.velocity = (spring.velocity + (f + spring.tension * (spring.endValue - spring.value)) * 0.5 * fdt) * spring.damping;
	      if (Math.abs(spring.value - spring.endValue) < epsilon && Math.abs(spring.velocity) < epsilon) {
	        spring.active = false;
	        activeLength--;
	        break;
	      }
	    }
	  }
	  return true;
	};
	
	function createSprings(values, options) {
	  const springs = [];
	  for (let i = 0, l = values.length; i < l; i++) {
	    springs.push(new Spring(values[i], options));
	  };
	  return springs;
	};
	
	function setSprings(springs, values) {
	  for (let i = 0, l = springs.length; i < l; i++) {
	    springs[i].setEndValue(values[i]);
	  };
	};
	
	function forEachSpring(springs, callback) {
	  for (let i = 0, l = springs.length; i < l; i++) {
	    callback(springs[i].value, springs[i].ref);
	  };
	};

/***/ },
/* 9 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 10 */
/***/ function(module, exports) {

	(function() {
	
		var promisifiedOldGUM = function(constraints, successCallback, errorCallback) {
	
			// First get ahold of getUserMedia, if present
			var getUserMedia = (navigator.getUserMedia ||
					navigator.webkitGetUserMedia ||
					navigator.mozGetUserMedia ||
					navigator.msGetUserMedia);
	
			// Some browsers just don't implement it - return a rejected promise with an error
			// to keep a consistent interface
			if(!getUserMedia) {
				return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
			}
	
			// Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
			return new Promise(function(successCallback, errorCallback) {
				getUserMedia.call(navigator, constraints, successCallback, errorCallback);
			});
			
		}
	
		// Older browsers might not implement mediaDevices at all, so we set an empty object first
		if(navigator.mediaDevices === undefined) {
			navigator.mediaDevices = {};
		}
	
		// Some browsers partially implement mediaDevices. We can't just assign an object
		// with getUserMedia as it would overwrite existing properties.
		// Here, we will just add the getUserMedia property if it's missing.
		if(navigator.mediaDevices.getUserMedia === undefined) {
			navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
		}
		
	})();


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function() {
		return new Worker(__webpack_require__.p + "b37f57aec3052ed1f07b.worker.js");
	};

/***/ }
/******/ ]);