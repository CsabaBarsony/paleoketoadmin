(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var cs = require('../helpers/cs');
var server = require('../server');

var QuestListPage = React.createClass({
	displayName: 'QuestListPage',

	getInitialState: function getInitialState() {
		return { loggedIn: bella.data.user.get().status === bella.constants.userStatus.LOGGED_IN };
	},
	componentDidMount: function componentDidMount() {
		var _this = this;

		bella.data.user.subscribe(function (user) {
			_this.setState({ loggedIn: user.status === bella.constants.userStatus.LOGGED_IN });
		});
	},
	render: function render() {
		return React.createElement(
			'div',
			{ className: 'bc-quest-list-page' },
			React.createElement(
				'h1',
				null,
				'Quests'
			),
			React.createElement(QuestList, { loggedIn: this.state.loggedIn })
		);
	}
});

var QuestList = React.createClass({
	displayName: 'QuestList',

	getInitialState: function getInitialState() {
		return { questList: {} };
	},
	componentDidMount: function componentDidMount() {
		var _this2 = this;

		server.wishList.get(function (result, wishList) {
			_this2.setState({ questList: wishList });
		});
	},
	render: function render() {
		var questList = _.map(this.state.questList, function (quest, key) {
			return React.createElement(Quest, {
				key: key,
				questId: quest.id,
				title: quest.title,
				description: quest.description });
		});

		var newWish = this.props.loggedIn ? React.createElement(
			'div',
			null,
			React.createElement(
				'a',
				{ href: '/quest.html' },
				'New Quest'
			)
		) : null;

		return React.createElement(
			'div',
			{ className: 'bc-quest-list' },
			newWish,
			questList
		);
	}
});

var Quest = React.createClass({
	displayName: 'Quest',

	render: function render() {
		var link = '/quest.html?quest_id=' + this.props.questId;

		return React.createElement(
			'div',
			{ className: 'bc-quest' },
			React.createElement(
				'div',
				null,
				React.createElement(
					'span',
					null,
					'title: '
				),
				React.createElement(
					'a',
					{ href: link },
					this.props.title
				)
			)
		);
	}
});

ReactDOM.render(React.createElement(QuestListPage, null), document.getElementById('main-section'));
},{"../helpers/cs":6,"../server":8}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
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

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
module.exports = require('./lib/schema-inspector');

},{"./lib/schema-inspector":4}],4:[function(require,module,exports){
/*
 * This module is intended to be executed both on client side and server side.
 * No error should be thrown. (soft error handling)
 */

(function () {
	var root = {};
	// Dependencies --------------------------------------------------------------
	root.async = (typeof require === 'function') ? require('async') : window.async;
	if (typeof root.async !== 'object') {
		throw new Error('Module async is required (https://github.com/caolan/async)');
	}
	var async = root.async;

	function _extend(origin, add) {
		if (!add || typeof add !== 'object') {
			return origin;
		}
		var keys = Object.keys(add);
		var i = keys.length;
		while (i--) {
			origin[keys[i]] = add[keys[i]];
		}
		return origin;
	}

	function _merge() {
		var ret = {};
		var args = Array.prototype.slice.call(arguments);
		var keys = null;
		var i = null;

		args.forEach(function (arg) {
			if (arg && arg.constructor === Object) {
				keys = Object.keys(arg);
				i = keys.length;
				while (i--) {
					ret[keys[i]] = arg[keys[i]];
				}
			}
		});
		return ret;
	}

	// Customisable class (Base class) -------------------------------------------
	// Use with operation "new" to extend Validation and Sanitization themselves,
	// not their prototype. In other words, constructor shall be call to extend
	// those functions, instead of being in their constructor, like this:
	//		_extend(Validation, new Customisable);

	function Customisable() {
		this.custom = {};

		this.extend = function (custom) {
			return _extend(this.custom, custom);
		};

		this.reset = function () {
			this.custom = {};
		};

		this.remove = function (fields) {
			if (!_typeIs.array(fields)) {
				fields = [fields];
			}
			fields.forEach(function (field) {
				delete this.custom[field];
			}, this);
		};
	}

	// Inspection class (Base class) ---------------------------------------------
	// Use to extend Validation and Sanitization prototypes. Inspection
	// constructor shall be called in derived class constructor.

	function Inspection(schema, custom) {
		var _stack = ['@'];

		this._schema = schema;
		this._custom = {};
		if (custom != null) {
			for (var key in custom) {
				if (custom.hasOwnProperty(key)){
					this._custom['$' + key] = custom[key];
				}
			}
		}

		this._getDepth = function () {
			return _stack.length;
		};

		this._dumpStack = function () {
			return _stack.map(function (i) {return i.replace(/^\[/g, '\033\034\035\036');})
			.join('.').replace(/\.\033\034\035\036/g, '[');
		};

		this._deeperObject = function (name) {
			_stack.push((/^[a-z$_][a-z0-9$_]*$/i).test(name) ? name : '["' + name + '"]');
			return this;
		};

		this._deeperArray = function (i) {
			_stack.push('[' + i + ']');
			return this;
		};

		this._back = function () {
			_stack.pop();
			return this;
		};
	}
	// Simple types --------------------------------------------------------------
	// If the property is not defined or is not in this list:
	var _typeIs = {
		"function": function (element) {
			return typeof element === 'function';
		},
		"string": function (element) {
			return typeof element === 'string';
		},
		"number": function (element) {
			return typeof element === 'number' && !isNaN(element);
		},
		"integer": function (element) {
			return typeof element === 'number' && element % 1 === 0;
		},
		"NaN": function (element) {
			return typeof element === 'number' && isNaN(element);
		},
		"boolean": function (element) {
			return typeof element === 'boolean';
		},
		"null": function (element) {
			return element === null;
		},
		"date": function (element) {
			return element != null && element instanceof Date;
		},
		"object": function (element) {
			return element != null && element.constructor === Object;
		},
		"array": function (element) {
			return element != null && element.constructor === Array;
		},
		"any": function (element) {
			return true;
		}
	};

	function _simpleType(type, candidate) {
		if (typeof type == 'function') {
			return candidate instanceof type;
		}
		type = type in _typeIs ? type : 'any';
		return _typeIs[type](candidate);
	}

	function _realType(candidate) {
		for (var i in _typeIs) {
			if (_simpleType(i, candidate)) {
				if (i !== 'any') { return i; }
				return 'an instance of ' + candidate.constructor.name;
			}
		}
	}

	function getIndexes(a, value) {
		var indexes = [];
		var i = a.indexOf(value);

		while (i !== -1) {
			indexes.push(i);
			i = a.indexOf(value, i + 1);
		}
		return indexes;
	}

	// Available formats ---------------------------------------------------------
	var _formats = {
		'void': /^$/,
		'url': /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)?(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
		'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z?|(-|\+)\d{2}:\d{2})$/,
		'date': /^\d{4}-\d{2}-\d{2}$/,
		'coolDateTime': /^\d{4}(-|\/)\d{2}(-|\/)\d{2}(T| )\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
		'time': /^\d{2}\:\d{2}\:\d{2}$/,
		'color': /^#([0-9a-f])+$/i,
		'email': /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
		'numeric': /^[0-9]+$/,
		'integer': /^\-?[0-9]+$/,
		'decimal': /^\-?[0-9]*\.?[0-9]+$/,
		'alpha': /^[a-z]+$/i,
		'alphaNumeric': /^[a-z0-9]+$/i,
		'alphaDash': /^[a-z0-9_-]+$/i,
		'javascript': /^[a-z_\$][a-z0-9_\$]*$/i,
		'upperString': /^[A-Z ]*$/,
		'lowerString': /^[a-z ]*$/
	};

// Validation ------------------------------------------------------------------
	var _validationAttribut = {
		optional: function (schema, candidate) {
			var opt = typeof schema.optional === 'boolean' ? schema.optional : (schema.optional === 'true'); // Default is false

			if (opt === true) {
				return;
			}
			if (typeof candidate === 'undefined') {
				this.report('is missing and not optional');
			}
		},
		type: function (schema, candidate) {
			// return because optional function already handle this case
			if (typeof candidate === 'undefined' || (typeof schema.type !== 'string' && !(schema.type instanceof Array) && typeof schema.type !== 'function')) {
				return;
			}
			var types = _typeIs.array(schema.type) ? schema.type : [schema.type];
			var typeIsValid = types.some(function (type) {
				return _simpleType(type, candidate);
			});
			if (!typeIsValid) {
				types = types.map(function (t) {return typeof t === 'function' ? 'and instance of ' + t.name : t; });
				this.report('must be ' + types.join(' or ') + ', but is ' + _realType(candidate));
			}
		},
		uniqueness: function (schema, candidate) {
			if (typeof schema.uniqueness === 'string') { schema.uniqueness = (schema.uniqueness === 'true'); }
			if (typeof schema.uniqueness !== 'boolean' || schema.uniqueness === false || (!_typeIs.array(candidate) && typeof candidate !== 'string')) {
				return;
			}
			var reported = [];
			for (var i = 0; i < candidate.length; i++) {
				if (reported.indexOf(candidate[i]) >= 0) {
					continue;
				}
				var indexes = getIndexes(candidate, candidate[i]);
				if (indexes.length > 1) {
					reported.push(candidate[i]);
					this.report('has value [' + candidate[i] + '] more than once at indexes [' + indexes.join(', ') + ']');
				}
			}
		},
		pattern: function (schema, candidate) {
			var self = this;
			var regexs = schema.pattern;
			if (typeof candidate !== 'string') {
				return;
			}
			var matches = false;
			if (!_typeIs.array(regexs)) {
				regexs = [regexs];
			}
			regexs.forEach(function (regex) {
				if (typeof regex === 'string' && regex in _formats) {
					regex = _formats[regex];
				}
				if (regex instanceof RegExp) {
					if (regex.test(candidate)) {
						matches = true;
					}
				}
			});
			if (!matches) {
				self.report('must match [' + regexs.join(' or ') + '], but is equal to "' + candidate + '"');
			}
		},
		validDate: function (schema, candidate) {
			if (String(schema.validDate) === 'true' && candidate instanceof Date && isNaN(candidate.getTime())) {
				this.report('must be a valid date');
			}
		},
		minLength: function (schema, candidate) {
			if (typeof candidate !== 'string' && !_typeIs.array(candidate)) {
				return;
			}
			var minLength = Number(schema.minLength);
			if (isNaN(minLength)) {
				return;
			}
			if (candidate.length < minLength) {
				this.report('must be longer than ' + minLength + ' elements, but it has ' + candidate.length);
			}
		},
		maxLength: function (schema, candidate) {
			if (typeof candidate !== 'string' && !_typeIs.array(candidate)) {
				return;
			}
			var maxLength = Number(schema.maxLength);
			if (isNaN(maxLength)) {
				return;
			}
			if (candidate.length > maxLength) {
				this.report('must be shorter than ' + maxLength + ' elements, but it has ' + candidate.length);
			}
		},
		exactLength: function (schema, candidate) {
			if (typeof candidate !== 'string' && !_typeIs.array(candidate)) {
				return;
			}
			var exactLength = Number(schema.exactLength);
			if (isNaN(exactLength)) {
				return;
			}
			if (candidate.length !== exactLength) {
				this.report('must have exactly ' + exactLength + ' elements, but it have ' + candidate.length);
			}
		},
		lt: function (schema, candidate) {
			var limit = Number(schema.lt);
			if (typeof candidate !== 'number' || isNaN(limit)) {
				return;
			}
			if (candidate >= limit) {
				this.report('must be less than ' + limit + ', but is equal to "' + candidate + '"');
			}
		},
		lte: function (schema, candidate) {
			var limit = Number(schema.lte);
			if (typeof candidate !== 'number' || isNaN(limit)) {
				return;
			}
			if (candidate > limit) {
				this.report('must be less than or equal to ' + limit + ', but is equal to "' + candidate + '"');
			}
		},
		gt: function (schema, candidate) {
			var limit = Number(schema.gt);
			if (typeof candidate !== 'number' || isNaN(limit)) {
				return;
			}
			if (candidate <= limit) {
				this.report('must be greater than ' + limit + ', but is equal to "' + candidate + '"');
			}
		},
		gte: function (schema, candidate) {
			var limit = Number(schema.gte);
			if (typeof candidate !== 'number' || isNaN(limit)) {
				return;
			}
			if (candidate < limit) {
				this.report('must be greater than or equal to ' + limit + ', but is equal to "' + candidate + '"');
			}
		},
		eq: function (schema, candidate) {
			if (typeof candidate !== 'number' && typeof candidate !== 'string' && typeof candidate !== 'boolean') {
				return;
			}
			var limit = schema.eq;
			if (typeof limit !== 'number' && typeof limit !== 'string' && typeof limit !== 'boolean' && !_typeIs.array(limit)) {
				return;
			}
			if (_typeIs.array(limit)) {
				for (var i = 0; i < limit.length; i++) {
					if (candidate === limit[i]) {
						return;
					}
				}
				this.report('must be equal to [' + limit.map(function (l) {
					return '"' + l + '"';
				}).join(' or ') + '], but is equal to "' + candidate + '"');
			}
			else {
				if (candidate !== limit) {
					this.report('must be equal to "' + limit + '", but is equal to "' + candidate + '"');
				}
			}
		},
		ne: function (schema, candidate) {
			if (typeof candidate !== 'number' && typeof candidate !== 'string') {
				return;
			}
			var limit = schema.ne;
			if (typeof limit !== 'number' && typeof limit !== 'string' && !_typeIs.array(limit)) {
				return;
			}
			if (_typeIs.array(limit)) {
				for (var i = 0; i < limit.length; i++) {
					if (candidate === limit[i]) {
						this.report('must not be equal to "' + limit[i] + '"');
						return;
					}
				}
			}
			else {
				if (candidate === limit) {
					this.report('must not be equal to "' + limit + '"');
				}
			}
		},
		someKeys: function (schema, candidat) {
			var _keys = schema.someKeys;
			if (!_typeIs.object(candidat)) {
				return;
			}
			var valid = _keys.some(function (action) {
				return (action in candidat);
			});
			if (!valid) {
				this.report('must have at least key ' + _keys.map(function (i) {
					return '"' + i + '"';
				}).join(' or '));
			}
		},
		strict: function (schema, candidate) {
			if (typeof schema.strict === 'string') { schema.strict = (schema.strict === 'true'); }
			if (schema.strict !== true || !_typeIs.object(candidate) || !_typeIs.object(schema.properties)) {
				return;
			}
			var self = this;
			if (typeof schema.properties['*'] === 'undefined') {
				var intruder = Object.keys(candidate).filter(function (key) {
					return (typeof schema.properties[key] === 'undefined');
				});
				if (intruder.length > 0) {
					var msg = 'should not contains ' + (intruder.length > 1 ? 'properties' : 'property') +
						' [' + intruder.map(function (i) { return '"' + i + '"'; }).join(', ') + ']';
					self.report(msg);
				}
			}
		},
		exec: function (schema, candidate, callback) {
			var self = this;

			if (typeof callback === 'function') {
				return this.asyncExec(schema, candidate, callback);
			}
			(_typeIs.array(schema.exec) ? schema.exec : [schema.exec]).forEach(function (exec) {
				if (typeof exec === 'function') {
					exec.call(self, schema, candidate);
				}
			});
		},
		properties: function (schema, candidate, callback) {
			if (typeof callback === 'function') {
				return this.asyncProperties(schema, candidate, callback);
			}
			if (!(schema.properties instanceof Object) || !(candidate instanceof Object)) {
				return;
			}
			var properties = schema.properties,
					i;
			if (properties['*'] != null) {
				for (i in candidate) {
					if (i in properties) {
						continue;
					}
					this._deeperObject(i);
					this._validate(properties['*'], candidate[i]);
					this._back();
				}
			}
			for (i in properties) {
				if (i === '*') {
					continue;
				}
				this._deeperObject(i);
				this._validate(properties[i], candidate[i]);
				this._back();
			}
		},
		items: function (schema, candidate, callback) {
			if (typeof callback === 'function') {
				return this.asyncItems(schema, candidate, callback);
			}
			if (!(schema.items instanceof Object) || !(candidate instanceof Object)) {
				return;
			}
			var items = schema.items;
			var i, l;
			// If provided schema is an array
			// then call validate for each case
			// else it is an Object
			// then call validate for each key
			if (_typeIs.array(items) && _typeIs.array(candidate)) {
				for (i = 0, l = items.length; i < l; i++) {
					this._deeperArray(i);
					this._validate(items[i], candidate[i]);
					this._back();
				}
			}
			else {
				for (var key in candidate) {
					if (candidate.hasOwnProperty(key)){
						this._deeperArray(key);
						this._validate(items, candidate[key]);
						this._back();
					}

				}
			}
		}
	};

	var _asyncValidationAttribut = {
		asyncExec: function (schema, candidate, callback) {
			var self = this;
			async.eachSeries(_typeIs.array(schema.exec) ? schema.exec : [schema.exec], function (exec, done) {
				if (typeof exec === 'function') {
					if (exec.length > 2) {
						return exec.call(self, schema, candidate, done);
					}
					exec.call(self, schema, candidate);
				}
				async.nextTick(done);
			}, callback);
		},
		asyncProperties: function (schema, candidate, callback) {
			if (!(schema.properties instanceof Object) || !_typeIs.object(candidate)) {
				return callback();
			}
			var self = this;
			var properties = schema.properties;
			async.series([
				function (next) {
					if (properties['*'] == null) {
						return next();
					}
					async.eachSeries(Object.keys(candidate), function (i, done) {
						if (i in properties) {
							return async.nextTick(done);
						}
						self._deeperObject(i);
						self._asyncValidate(properties['*'], candidate[i], function (err) {
							self._back();
							done(err);
						});
					}, next);
				},
				function (next) {
					async.eachSeries(Object.keys(properties), function (i, done) {
						if (i === '*') {
							return async.nextTick(done);
						}
						self._deeperObject(i);
						self._asyncValidate(properties[i], candidate[i], function (err) {
							self._back();
							done(err);
						});
					}, next);
				}
			], callback);
		},
		asyncItems: function (schema, candidate, callback) {
			if (!(schema.items instanceof Object) || !(candidate instanceof Object)) {
				return callback();
			}
			var self = this;
			var items = schema.items;
			var i, l;

			if (_typeIs.array(items) && _typeIs.array(candidate)) {
				async.timesSeries(items.length, function (i, done) {
					self._deeperArray(i);
					self._asyncValidate(items[i], candidate[i], function (err, res) {
						self._back();
						done(err, res);
					});
					self._back();
				}, callback);
			}
			else {
				async.eachSeries(Object.keys(candidate), function (key, done) {
					self._deeperArray(key);
					self._asyncValidate(items, candidate[key], function (err, res) {
						self._back();
						done(err, res);
					});
				}, callback);
			}
		}
	};

	// Validation Class ----------------------------------------------------------
	// inherits from Inspection class (actually we just call Inspection
	// constructor with the new context, because its prototype is empty
	function Validation(schema, custom) {
		Inspection.prototype.constructor.call(this, schema, _merge(Validation.custom, custom));
		var _error = [];

		this._basicFields = Object.keys(_validationAttribut);
		this._customFields = Object.keys(this._custom);
		this.origin = null;

		this.report = function (message, code) {
			var newErr = {
				code: code || this.userCode || null,
				message: this.userError || message || 'is invalid',
				property: this.userAlias ? (this.userAlias + ' (' + this._dumpStack() + ')') : this._dumpStack()
			};
			_error.push(newErr);
			return this;
		};

		this.result = function () {
			return {
				error: _error,
				valid: _error.length === 0,
				format: function () {
					if (this.valid === true) {
						return 'Candidate is valid';
					}
					return this.error.map(function (i) {
						return 'Property ' + i.property + ': ' + i.message;
					}).join('\n');
				}
			};
		};
	}

	_extend(Validation.prototype, _validationAttribut);
	_extend(Validation.prototype, _asyncValidationAttribut);
	_extend(Validation, new Customisable());

	Validation.prototype.validate = function (candidate, callback) {
		this.origin = candidate;
		if (typeof callback === 'function') {
			var self = this;
			return async.nextTick(function () {
				self._asyncValidate(self._schema, candidate, function (err) {
					self.origin = null;
					callback(err, self.result());
				});
			});
		}
		return this._validate(this._schema, candidate).result();
	};

	Validation.prototype._validate = function (schema, candidate, callback) {
		this.userCode = schema.code || null;
		this.userError = schema.error || null;
		this.userAlias = schema.alias || null;
		this._basicFields.forEach(function (i) {
			if ((i in schema || i === 'optional') && typeof this[i] === 'function') {
				this[i](schema, candidate);
			}
		}, this);
		this._customFields.forEach(function (i) {
			if (i in schema && typeof this._custom[i] === 'function') {
				this._custom[i].call(this, schema, candidate);
			}
		}, this);
		return this;
	};

	Validation.prototype._asyncValidate = function (schema, candidate, callback) {
		var self = this;
		this.userCode = schema.code || null;
		this.userError = schema.error || null;
		this.userAlias = schema.alias || null;

		async.series([
			function (next) {
				async.eachSeries(Object.keys(_validationAttribut), function (i, done) {
					async.nextTick(function () {
						if ((i in schema || i === 'optional') && typeof self[i] === 'function') {
							if (self[i].length > 2) {
								return self[i](schema, candidate, done);
							}
							self[i](schema, candidate);
						}
						done();
					});
				}, next);
			},
			function (next) {
				async.eachSeries(Object.keys(self._custom), function (i, done) {
					async.nextTick(function () {
						if (i in schema && typeof self._custom[i] === 'function') {
							if (self._custom[i].length > 2) {
								return self._custom[i].call(self, schema, candidate, done);
							}
							self._custom[i].call(self, schema, candidate);
						}
						done();
					});
				}, next);
			}
		], callback);
	};

// Sanitization ----------------------------------------------------------------
	// functions called by _sanitization.type method.
	var _forceType = {
		number: function (post, schema) {
			var n;
			if (typeof post === 'number') {
				return post;
			}
			else if (post === '') {
				if (typeof schema.def !== 'undefined')
					return schema.def;
				return null;
			}
			else if (typeof post === 'string') {
				n = parseFloat(post.replace(/,/g, '.').replace(/ /g, ''));
				if (typeof n === 'number') {
					return n;
				}
			}
			else if (post instanceof Date) {
				return +post;
			}
			return null;
		},
		integer: function (post, schema) {
			var n;
			if (typeof post === 'number' && post % 1 === 0) {
				return post;
			}
			else if (post === '') {
				if (typeof schema.def !== 'undefined')
					return schema.def;
				return null;
			}
			else if (typeof post === 'string') {
				n = parseInt(post.replace(/ /g, ''), 10);
				if (typeof n === 'number') {
					return n;
				}
			}
			else if (typeof post === 'number') {
				return parseInt(post, 10);
			}
			else if (typeof post === 'boolean') {
				if (post) { return 1; }
				return 0;
			}
			else if (post instanceof Date) {
				return +post;
			}
			return null;
		},
		string: function (post, schema) {
			if (typeof post === 'boolean' || typeof post === 'number' || post instanceof Date) {
				return post.toString();
			}
			else if (_typeIs.array(post)) {
				// If user authorize array and strings...
				if (schema.items || schema.properties)
					return post;
				return post.join(String(schema.joinWith || ','));
			}
			else if (post instanceof Object) {
				// If user authorize objects ans strings...
				if (schema.items || schema.properties)
					return post;
				return JSON.stringify(post);
			}
			else if (typeof post === 'string' && post.length) {
				return post;
			}
			return null;
		},
		date: function (post, schema) {
			if (post instanceof Date) {
				return post;
			}
			else {
				var d = new Date(post);
				if (!isNaN(d.getTime())) { // if valid date
					return d;
				}
			}
			return null;
		},
		boolean: function (post, schema) {
			if (typeof post === 'undefined') return null;
			if (typeof post === 'string' && post.toLowerCase() === 'false') return false;
			return !!post;
		},
		object: function (post, schema) {
			if (typeof post !== 'string' || _typeIs.object(post)) {
				return post;
			}
			try {
				return JSON.parse(post);
			}
			catch (e) {
				return null;
			}
		},
		array: function (post, schema) {
			if (_typeIs.array(post))
				return post;
			if (typeof post === 'undefined')
				return null;
			if (typeof post === 'string') {
				if (post.substring(0,1) === '[' && post.slice(-1) === ']') {
					try {
						return JSON.parse(post);
					}
					catch (e) {
						return null;
					}
				}
				return post.split(String(schema.splitWith || ','));

			}
			if (!_typeIs.array(post))
				return [ post ];
			return null;
		}
	};

	var _applyRules = {
		upper: function (post) {
			return post.toUpperCase();
		},
		lower: function (post) {
			return post.toLowerCase();
		},
		title: function (post) {
			// Fix by seb (replace \w\S* by \S* => exemple : coucou ça va)
			return post.replace(/\S*/g, function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		},
		capitalize: function (post) {
			return post.charAt(0).toUpperCase() + post.substr(1).toLowerCase();
		},
		ucfirst: function (post) {
			return post.charAt(0).toUpperCase() + post.substr(1);
		},
		trim: function (post) {
			return post.trim();
		}
	};

	// Every function return the future value of each property. Therefore you
	// have to return post even if you do not change its value
	var _sanitizationAttribut = {
		strict: function (schema, post) {
			if (typeof schema.strict === 'string') { schema.strict = (schema.strict === 'true'); }
			if (schema.strict !== true)
				return post;
			if (!_typeIs.object(schema.properties))
				return post;
			if (!_typeIs.object(post))
				return post;
			var that = this;
			Object.keys(post).forEach(function (key) {
				if (!(key in schema.properties)) {
					delete post[key];
				}
			});
			return post;
		},
		optional: function (schema, post) {
			var opt = typeof schema.optional === 'boolean' ? schema.optional : (schema.optional !== 'false'); // Default: true
			if (opt === true) {
				return post;
			}
			if (typeof post !== 'undefined') {
				return post;
			}
			this.report();
			if (schema.def === Date) {
				return new Date();
			}
			return schema.def;
		},
		type: function (schema, post) {
			// if (_typeIs['object'](post) || _typeIs.array(post)) {
			// 	return post;
			// }
			if (typeof schema.type !== 'string' || typeof _forceType[schema.type] !== 'function') {
				return post;
			}
			var n;
			var opt = typeof schema.optional === 'boolean' ? schema.optional : true;
			if (typeof _forceType[schema.type] === 'function') {
				n = _forceType[schema.type](post, schema);
				if ((n === null && !opt) || (!n && isNaN(n)) || (n === null && schema.type === 'string')) {
					n = schema.def;
				}
			}
			else if (!opt) {
				n = schema.def;
			}
			if ((n != null || (typeof schema.def !== 'undefined' && schema.def === n)) && n !== post) {
				this.report();
				return n;
			}
			return post;
		},
		rules: function (schema, post) {
			var rules = schema.rules;
			if (typeof post !== 'string' || (typeof rules !== 'string' && !_typeIs.array(rules))) {
				return post;
			}
			var modified = false;
			(_typeIs.array(rules) ? rules : [rules]).forEach(function (rule) {
				if (typeof _applyRules[rule] === 'function') {
					post = _applyRules[rule](post);
					modified = true;
				}
			});
			if (modified) {
				this.report();
			}
			return post;
		},
		min: function (schema, post) {
			var postTest = Number(post);
			if (isNaN(postTest)) {
				return post;
			}
			var min = Number(schema.min);
			if (isNaN(min)) {
				return post;
			}
			if (postTest < min) {
				this.report();
				return min;
			}
			return post;
		},
		max: function (schema, post) {
			var postTest = Number(post);
			if (isNaN(postTest)) {
				return post;
			}
			var max = Number(schema.max);
			if (isNaN(max)) {
				return post;
			}
			if (postTest > max) {
				this.report();
				return max;
			}
			return post;
		},
		minLength: function (schema, post) {
			var limit = Number(schema.minLength);
			if (typeof post !== 'string' || isNaN(limit) || limit < 0) {
				return post;
			}
			var str = '';
			var gap = limit - post.length;
			if (gap > 0) {
				for (var i = 0; i < gap; i++) {
					str += '-';
				}
				this.report();
				return post + str;
			}
			return post;
		},
		maxLength: function (schema, post) {
			var limit = Number(schema.maxLength);
			if (typeof post !== 'string' || isNaN(limit) || limit < 0) {
				return post;
			}
			if (post.length > limit) {
				this.report();
				return post.slice(0, limit);
			}
			return post;
		},
		properties: function (schema, post, callback) {
			if (typeof callback === 'function') {
				return this.asyncProperties(schema, post, callback);
			}
			if (!post || typeof post !== 'object') {
				return post;
			}
			var properties = schema.properties;
			var tmp;
			var i;
			if (typeof properties['*'] !== 'undefined') {
				for (i in post) {
					if (i in properties) {
						continue;
					}
					this._deeperObject(i);
					tmp = this._sanitize(schema.properties['*'], post[i]);
					if (typeof tmp !== 'undefined') {
						post[i]= tmp;
					}
					this._back();
				}
			}
			for (i in schema.properties) {
				if (i !== '*') {
					this._deeperObject(i);
					tmp = this._sanitize(schema.properties[i], post[i]);
					if (typeof tmp !== 'undefined') {
						post[i]= tmp;
					}
					this._back();
				}
			}
			return post;
		},
		items: function (schema, post, callback) {
			if (typeof callback === 'function') {
				return this.asyncItems(schema, post, callback);
			}
			if (!(schema.items instanceof Object) || !(post instanceof Object)) {
				return post;
			}
			var i;
			if (_typeIs.array(schema.items) && _typeIs.array(post)) {
				var minLength = schema.items.length < post.length ? schema.items.length : post.length;
				for (i = 0; i < minLength; i++) {
					this._deeperArray(i);
					post[i] = this._sanitize(schema.items[i], post[i]);
					this._back();
				}
			}
			else {
				for (i in post) {
					this._deeperArray(i);
					post[i] = this._sanitize(schema.items, post[i]);
					this._back();
				}
			}
			return post;
		},
		exec: function (schema, post, callback) {
			if (typeof callback === 'function') {
				return this.asyncExec(schema, post, callback);
			}
			var execs = _typeIs.array(schema.exec) ? schema.exec : [schema.exec];

			execs.forEach(function (exec) {
				if (typeof exec === 'function') {
					post = exec.call(this, schema, post);
				}
			}, this);
			return post;
		}
	};

	var _asyncSanitizationAttribut = {
		asyncExec: function (schema, post, callback) {
			var self = this;
			var execs = _typeIs.array(schema.exec) ? schema.exec : [schema.exec];

			async.eachSeries(execs, function (exec, done) {
				if (typeof exec === 'function') {
					if (exec.length > 2) {
						return exec.call(self, schema, post, function (err, res) {
							if (err) {
								return done(err);
							}
							post = res;
							done();
						});
					}
					post = exec.call(self, schema, post);
				}
				done();
			}, function (err) {
				callback(err, post);
			});
		},
		asyncProperties: function (schema, post, callback) {
			if (!post || typeof post !== 'object') {
				return callback(null, post);
			}
			var self = this;
			var properties = schema.properties;

			async.series([
				function (next) {
					if (properties['*'] == null) {
						return next();
					}
					var globing = properties['*'];
					async.eachSeries(Object.keys(post), function (i, next) {
						if (i in properties) {
							return next();
						}
						self._deeperObject(i);
						self._asyncSanitize(globing, post[i], function (err, res) {
							if (err) { /* Error can safely be ignored here */ }
							if (typeof res !== 'undefined') {
								post[i] = res;
							}
							self._back();
							next();
						});
					}, next);
				},
				function (next) {
					async.eachSeries(Object.keys(properties), function (i, next) {
						if (i === '*') {
							return next();
						}
						self._deeperObject(i);
						self._asyncSanitize(properties[i], post[i], function (err, res) {
							if (err) {
								return next(err);
							}
							if (typeof res !== 'undefined') {
								post[i] = res;
							}
							self._back();
							next();
						});
					}, next);
				}
			], function (err) {
				return callback(err, post);
			});
		},
		asyncItems: function (schema, post, callback) {
			if (!(schema.items instanceof Object) || !(post instanceof Object)) {
				return callback(null, post);
			}
			var self = this;
			var items = schema.items;
			if (_typeIs.array(items) && _typeIs.array(post)) {
				var minLength = items.length < post.length ? items.length : post.length;
				async.timesSeries(minLength, function (i, next) {
					self._deeperArray(i);
					self._asyncSanitize(items[i], post[i], function (err, res) {
						if (err) {
							return next(err);
						}
						post[i] = res;
						self._back();
						next();
					});
				}, function (err) {
					callback(err, post);
				});
			}
			else {
				async.eachSeries(Object.keys(post), function (key, next) {
					self._deeperArray(key);
					self._asyncSanitize(items, post[key], function (err, res) {
						if (err) {
							return next();
						}
						post[key] = res;
						self._back();
						next();
					});
				}, function (err) {
					callback(err, post);
				});
			}
			return post;
		}
	};

	// Sanitization Class --------------------------------------------------------
	// inherits from Inspection class (actually we just call Inspection
	// constructor with the new context, because its prototype is empty
	function Sanitization(schema, custom) {
		Inspection.prototype.constructor.call(this, schema, _merge(Sanitization.custom, custom));
		var _reporting = [];

		this._basicFields = Object.keys(_sanitizationAttribut);
		this._customFields = Object.keys(this._custom);
		this.origin = null;

		this.report = function (message) {
			var newNot = {
					message: message || 'was sanitized',
					property: this.userAlias ? (this.userAlias + ' (' + this._dumpStack() + ')') : this._dumpStack()
			};
			if (!_reporting.some(function (e) { return e.property === newNot.property; })) {
				_reporting.push(newNot);
			}
		};

		this.result = function (data) {
			return {
				data: data,
				reporting: _reporting,
				format: function () {
					return this.reporting.map(function (i) {
						return 'Property ' + i.property + ' ' + i.message;
					}).join('\n');
				}
			};
		};
	}

	_extend(Sanitization.prototype, _sanitizationAttribut);
	_extend(Sanitization.prototype, _asyncSanitizationAttribut);
	_extend(Sanitization, new Customisable());


	Sanitization.prototype.sanitize = function (post, callback) {
		this.origin = post;
		if (typeof callback === 'function') {
			var self = this;
			return this._asyncSanitize(this._schema, post, function (err, data) {
				self.origin = null;
				callback(err, self.result(data));
			});
		}
		var data = this._sanitize(this._schema, post);
		this.origin = null;
		return this.result(data);
	};

	Sanitization.prototype._sanitize = function (schema, post) {
		this.userAlias = schema.alias || null;
		this._basicFields.forEach(function (i) {
			if ((i in schema || i === 'optional') && typeof this[i] === 'function') {
				post = this[i](schema, post);
			}
		}, this);
		this._customFields.forEach(function (i) {
			if (i in schema && typeof this._custom[i] === 'function') {
				post = this._custom[i].call(this, schema, post);
			}
		}, this);
		return post;
	};

	Sanitization.prototype._asyncSanitize = function (schema, post, callback) {
		var self = this;
		this.userAlias = schema.alias || null;

		async.waterfall([
			function (next) {
				async.reduce(self._basicFields, post, function (value, i, next) {
					async.nextTick(function () {
						if ((i in schema || i === 'optional') && typeof self[i] === 'function') {
							if (self[i].length > 2) {
								return self[i](schema, value, next);
							}
							value = self[i](schema, value);
						}
						next(null, value);
					});
				}, next);
			},
			function (inter, next) {
				async.reduce(self._customFields, inter, function (value, i, next) {
					async.nextTick(function () {
						if (i in schema && typeof self._custom[i] === 'function') {
							if (self._custom[i].length > 2) {
								return self._custom[i].call(self, schema, value, next);
							}
							value = self._custom[i].call(self, schema, value);
						}
						next(null, value);
					});
				}, next);
			}
		], callback);
	};

	// ---------------------------------------------------------------------------

	var INT_MIN = -2147483648;
	var INT_MAX = 2147483647;

	var _rand = {
		int: function (min, max) {
			return min + (0 | Math.random() * (max - min + 1));
		},
		float: function (min, max) {
			return (Math.random() * (max - min) + min);
		},
		bool: function () {
			return (Math.random() > 0.5);
		},
		char: function (min, max) {
			return String.fromCharCode(this.int(min, max));
		},
		fromList: function (list) {
			return list[this.int(0, list.length - 1)];
		}
	};

	var _formatSample = {
		'date-time': function () {
			return new Date().toISOString();
		},
		'date': function () {
			return new Date().toISOString().replace(/T.*$/, '');
		},
		'time': function () {
			return new Date().toLocaleTimeString({}, { hour12: false });
		},
		'color': function (min, max) {
			var s = '#';
			if (min < 1) {
				min = 1;
			}
			for (var i = 0, l = _rand.int(min, max); i < l; i++) {
				s += _rand.fromList('0123456789abcdefABCDEF');
			}
			return s;
		},
		'numeric': function () {
			return '' + _rand.int(0, INT_MAX);
		},
		'integer': function () {
			if (_rand.bool() === true) {
				return '-' + this.numeric();
			}
			return this.numeric();
		},
		'decimal': function () {
			return this.integer() + '.' + this.numeric();
		},
		'alpha': function (min, max) {
			var s = '';
			if (min < 1) {
				min = 1;
			}
			for (var i = 0, l = _rand.int(min, max); i < l; i++) {
				s += _rand.fromList('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
			}
			return s;
		},
		'alphaNumeric': function (min, max) {
			var s = '';
			if (min < 1) {
				min = 1;
			}
			for (var i = 0, l = _rand.int(min, max); i < l; i++) {
				s += _rand.fromList('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
			}
			return s;
		},
		'alphaDash': function (min, max) {
			var s = '';
			if (min < 1) {
				min = 1;
			}
			for (var i = 0, l = _rand.int(min, max); i < l; i++) {
				s += _rand.fromList('_-abcdefghijklmnopqrstuvwxyz_-ABCDEFGHIJKLMNOPQRSTUVWXYZ_-0123456789_-');
			}
			return s;
		},
		'javascript': function (min, max) {
			var s = _rand.fromList('_$abcdefghijklmnopqrstuvwxyz_$ABCDEFGHIJKLMNOPQRSTUVWXYZ_$');
			for (var i = 0, l = _rand.int(min, max - 1); i < l; i++) {
				s += _rand.fromList('_$abcdefghijklmnopqrstuvwxyz_$ABCDEFGHIJKLMNOPQRSTUVWXYZ_$0123456789_$');
			}
			return s;
		}
	};

	function _getLimits(schema) {
		var min = INT_MIN;
		var max = INT_MAX;

		if (schema.gte != null) {
			min = schema.gte;
		}
		else if (schema.gt != null) {
			min = schema.gt + 1;
		}
		if (schema.lte != null) {
			max = schema.lte;
		}
		else if (schema.lt != null) {
			max = schema.lt - 1;
		}
		return { min: min, max: max };
	}

	var _typeGenerator = {
		string: function (schema) {
			if (schema.eq != null) {
				return schema.eq;
			}
			var s = '';
			var minLength = schema.minLength != null ? schema.minLength : 0;
			var maxLength = schema.maxLength != null ? schema.maxLength : 32;
			if (typeof schema.pattern === 'string' && typeof _formatSample[schema.pattern] === 'function') {
				return _formatSample[schema.pattern](minLength, maxLength);
			}

			var l = schema.exactLength != null ? schema.exactLength : _rand.int(minLength, maxLength);
			for (var i = 0; i < l; i++) {
				s += _rand.char(32, 126);
			}
			return s;
		},
		number: function (schema) {
			if (schema.eq != null) {
				return schema.eq;
			}
			var limit = _getLimits(schema);
			var n = _rand.float(limit.min, limit.max);
			if (schema.ne != null) {
				var ne = _typeIs.array(schema.ne) ? schema.ne : [schema.ne];
				while (ne.indexOf(n) !== -1) {
					n = _rand.float(limit.min, limit.max);
				}
			}
			return n;
		},
		integer: function (schema) {
			if (schema.eq != null) {
				return schema.eq;
			}
			var limit = _getLimits(schema);
			var n = _rand.int(limit.min, limit.max);
			if (schema.ne != null) {
				var ne = _typeIs.array(schema.ne) ? schema.ne : [schema.ne];
				while (ne.indexOf(n) !== -1) {
					n = _rand.int(limit.min, limit.max);
				}
			}
			return n;
		},
		boolean: function (schema) {
			if (schema.eq != null) {
				return schema.eq;
			}
			return _rand.bool();
		},
		"null": function (schema) {
			return null;
		},
		date: function (schema) {
			if (schema.eq != null) {
				return schema.eq;
			}
			return new Date();
		},
		object: function (schema) {
			var o = {};
			var prop = schema.properties || {};

			for (var key in prop) {
				if (prop.hasOwnProperty(key)){
					if (prop[key].optional === true && _rand.bool() === true) {
						continue;
					}
					if (key !== '*') {
						o[key] = this.generate(prop[key]);
					}
					else {
						var rk = '__random_key_';
						var randomKey = rk + 0;
						var n = _rand.int(1, 9);
						for (var i = 1; i <= n; i++) {
							if (!(randomKey in prop)) {
								o[randomKey] = this.generate(prop[key]);
							}
							randomKey = rk + i;
						}
					}
				}
			}
			return o;
		},
		array: function (schema) {
			var self = this;
			var items = schema.items || {};
			var minLength = schema.minLength != null ? schema.minLength : 0;
			var maxLength = schema.maxLength != null ? schema.maxLength : 16;
			var type;
			var candidate;
			var size;
			var i;

			if (_typeIs.array(items)) {
				size = items.length;
				if (schema.exactLength != null) {
					size = schema.exactLength;
				}
				else if (size < minLength) {
					size = minLength;
				}
				else if (size > maxLength) {
					size = maxLength;
				}
				candidate = new Array(size);
				type = null;
				for (i = 0; i < size; i++) {
					type = items[i].type || 'any';
					if (_typeIs.array(type)) {
						type = type[_rand.int(0, type.length - 1)];
					}
					candidate[i] = self[type](items[i]);
				}
			}
			else {
				size = schema.exactLength != null ? schema.exactLength : _rand.int(minLength, maxLength);
				candidate = new Array(size);
				type = items.type || 'any';
				if (_typeIs.array(type)) {
					type = type[_rand.int(0, type.length - 1)];
				}
				for (i = 0; i < size; i++) {
					candidate[i] = self[type](items);
				}
			}
			return candidate;
		},
		any: function (schema) {
			var fields = Object.keys(_typeGenerator);
			var i = fields[_rand.int(0, fields.length - 2)];
			return this[i](schema);
		}
	};

	// CandidateGenerator Class (Singleton) --------------------------------------
	function CandidateGenerator() {
		// Maybe extends Inspection class too ?
	}

	_extend(CandidateGenerator.prototype, _typeGenerator);

	var _instance = null;
	CandidateGenerator.instance = function () {
		if (!(_instance instanceof CandidateGenerator)) {
			_instance = new CandidateGenerator();
		}
		return _instance;
	};

	CandidateGenerator.prototype.generate = function (schema) {
		var type = schema.type || 'any';
		if (_typeIs.array(type)) {
			type = type[_rand.int(0, type.length - 1)];
		}
		return this[type](schema);
	};

// Exports ---------------------------------------------------------------------
	var SchemaInspector = {};

	// if server-side (node.js) else client-side
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = SchemaInspector;
	}
	else {
		window.SchemaInspector = SchemaInspector;
	}

	SchemaInspector.newSanitization = function (schema, custom) {
		return new Sanitization(schema, custom);
	};

	SchemaInspector.newValidation = function (schema, custom) {
		return new Validation(schema, custom);
	};

	SchemaInspector.Validation = Validation;
	SchemaInspector.Sanitization = Sanitization;

	SchemaInspector.sanitize = function (schema, post, custom, callback) {
		if (arguments.length === 3 && typeof custom === 'function') {
			callback = custom;
			custom = null;
		}
		return new Sanitization(schema, custom).sanitize(post, callback);
	};

	SchemaInspector.validate = function (schema, candidate, custom, callback) {
		if (arguments.length === 3 && typeof custom === 'function') {
			callback = custom;
			custom = null;
		}
		return new Validation(schema, custom).validate(candidate, callback);
	};

	SchemaInspector.generate = function (schema, n) {
		if (typeof n === 'number') {
			var r = new Array(n);
			for (var i = 0; i < n; i++) {
				r[i] = CandidateGenerator.instance().generate(schema);
			}
			return r;
		}
		return CandidateGenerator.instance().generate(schema);
	};
})();

},{"async":5}],5:[function(require,module,exports){
(function (process,global){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
(function () {

    var async = {};
    function noop() {}
    function identity(v) {
        return v;
    }
    function toBool(v) {
        return !!v;
    }
    function notId(v) {
        return !v;
    }

    // global on the server, window in the browser
    var previous_async;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global ||
            this;

    if (root != null) {
        previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        return function() {
            if (fn === null) throw new Error("Callback was already called.");
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function _once(fn) {
        return function() {
            if (fn === null) return;
            fn.apply(this, arguments);
            fn = null;
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    // Ported from underscore.js isObject
    var _isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _arrayEach(arr, iterator) {
        var index = -1,
            length = arr.length;

        while (++index < length) {
            iterator(arr[index], index, arr);
        }
    }

    function _map(arr, iterator) {
        var index = -1,
            length = arr.length,
            result = Array(length);

        while (++index < length) {
            result[index] = iterator(arr[index], index, arr);
        }
        return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    function _indexOf(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) return i;
        }
        return -1;
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
    function _restParam(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
            }
            // Currently unused but handle cases outside of the switch statement:
            // var args = Array(startIndex + 1);
            // for (index = 0; index < startIndex; index++) {
            //     args[index] = arguments[index];
            // }
            // args[startIndex] = rest;
            // return func.apply(this, args);
        };
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

    var _delay = _setImmediate ? function(fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    } : function(fn) {
        setTimeout(fn, 0);
    };

    if (typeof process === 'object' && typeof process.nextTick === 'function') {
        async.nextTick = process.nextTick;
    } else {
        async.nextTick = _delay;
    }
    async.setImmediate = _setImmediate ? _delay : async.nextTick;


    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];

        var iter = _keyIterator(object);
        var key, completed = 0;

        while ((key = iter()) != null) {
            completed += 1;
            iterator(object[key], key, only_once(done));
        }

        if (completed === 0) callback(null);

        function done(err) {
            completed--;
            if (err) {
                callback(err);
            }
            // Check key is null in case iterator isn't exhausted
            // and done resolved synchronously.
            else if (key === null && completed <= 0) {
                callback(null);
            }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.setImmediate(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(fn) {
        return function (obj, limit, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        arr = arr || [];
        var results = _isArrayLike(arr) ? [] : {};
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = doParallelLimit(_asyncMap);

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, identity).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    async.transform = function (arr, memo, iterator, callback) {
        if (arguments.length === 3) {
            callback = iterator;
            iterator = memo;
            memo = _isArray(arr) ? [] : {};
        }

        async.eachOf(arr, function(v, k, cb) {
            iterator(memo, v, k, cb);
        }, function(err) {
            callback(err, memo);
        });
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (v) {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectLimit =
    async.filterLimit = doParallelLimit(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        _filter(eachfn, arr, function(value, cb) {
            iterator(value, function(v) {
                cb(!v);
            });
        }, callback);
    }
    async.reject = doParallel(_reject);
    async.rejectLimit = doParallelLimit(_reject);
    async.rejectSeries = doSeries(_reject);

    function _createTester(eachfn, check, getResult) {
        return function(arr, limit, iterator, cb) {
            function done() {
                if (cb) cb(getResult(false, void 0));
            }
            function iteratee(x, _, callback) {
                if (!cb) return callback();
                iterator(x, function (v) {
                    if (cb && check(v)) {
                        cb(getResult(true, x));
                        cb = iterator = false;
                    }
                    callback();
                });
            }
            if (arguments.length > 3) {
                eachfn(arr, limit, iteratee, done);
            } else {
                cb = iterator;
                iterator = limit;
                eachfn(arr, iteratee, done);
            }
        };
    }

    async.any =
    async.some = _createTester(async.eachOf, toBool, identity);

    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

    async.all =
    async.every = _createTester(async.eachOf, notId, notId);

    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

    function _findGetResult(v, x) {
        return x;
    }
    async.detect = _createTester(async.eachOf, identity, _findGetResult);
    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, concurrency, callback) {
        if (typeof arguments[1] === 'function') {
            // concurrency is optional, shift the args.
            callback = concurrency;
            concurrency = null;
        }
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }
        if (!concurrency) {
            concurrency = remainingTasks;
        }

        var results = {};
        var runningTasks = 0;

        var hasError = false;

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            var idx = _indexOf(listeners, fn);
            if (idx >= 0) listeners.splice(idx, 1);
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            if (hasError) return;
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = _restParam(function(err, args) {
                runningTasks--;
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _forEachOf(results, function(val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[k] = args;
                    hasError = true;

                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            });
            var requires = task.slice(0, task.length - 1);
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has nonexistent dependency in ' + requires.join(', '));
                }
                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return runningTasks < concurrency && _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                runningTasks++;
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    runningTasks++;
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };



    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var attempts = [];

        var opts = {
            times: DEFAULT_TIMES,
            interval: DEFAULT_INTERVAL
        };

        function parseTimes(acc, t){
            if(typeof t === 'number'){
                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
            } else if(typeof t === 'object'){
                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
            } else {
                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
            }
        }

        var length = arguments.length;
        if (length < 1 || length > 3) {
            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
        } else if (length <= 2 && typeof times === 'function') {
            callback = task;
            task = times;
        }
        if (typeof times !== 'function') {
            parseTimes(opts, times);
        }
        opts.callback = callback;
        opts.task = task;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            function retryInterval(interval){
                return function(seriesCallback){
                    setTimeout(function(){
                        seriesCallback(null);
                    }, interval);
                };
            }

            while (opts.times) {

                var finalAttempt = !(opts.times-=1);
                attempts.push(retryAttempt(opts.task, finalAttempt));
                if(!finalAttempt && opts.interval > 0){
                    attempts.push(retryInterval(opts.interval));
                }
            }

            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || opts.callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return opts.callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
            var err = new Error('First argument to waterfall must be an array of functions');
            return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return _restParam(function (err, args) {
                if (err) {
                    callback.apply(null, [err].concat(args));
                }
                else {
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            });
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(_restParam(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            }));
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function(tasks, callback) {
        _parallel(async.eachOfSeries, tasks, callback);
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = _restParam(function (fn, args) {
        return _restParam(function (callArgs) {
            return fn.apply(
                null, args.concat(callArgs)
            );
        });
    });

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        callback = callback || noop;
        if (test()) {
            var next = _restParam(function(err, args) {
                if (err) {
                    callback(err);
                } else if (test.apply(this, args)) {
                    iterator(next);
                } else {
                    callback.apply(null, [null].concat(args));
                }
            });
            iterator(next);
        } else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        var calls = 0;
        return async.whilst(function() {
            return ++calls <= 1 || test.apply(this, arguments);
        }, iterator, callback);
    };

    async.until = function (test, iterator, callback) {
        return async.whilst(function() {
            return !test.apply(this, arguments);
        }, iterator, callback);
    };

    async.doUntil = function (iterator, test, callback) {
        return async.doWhilst(iterator, function() {
            return !test.apply(this, arguments);
        }, callback);
    };

    async.during = function (test, iterator, callback) {
        callback = callback || noop;

        var next = _restParam(function(err, args) {
            if (err) {
                callback(err);
            } else {
                args.push(check);
                test.apply(this, args);
            }
        });

        var check = function(err, truth) {
            if (err) {
                callback(err);
            } else if (truth) {
                iterator(next);
            } else {
                callback(null);
            }
        };

        test(check);
    };

    async.doDuring = function (iterator, test, callback) {
        var calls = 0;
        async.during(function(next) {
            if (calls++ < 1) {
                next(null, true);
            } else {
                test.apply(this, arguments);
            }
        }, iterator, callback);
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;

                var removed = false;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    _arrayEach(workersList, function (worker, index) {
                        if (worker === task && !removed) {
                            workersList.splice(index, 1);
                            removed = true;
                        }
                    });

                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var workersList = [];
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                while(!q.paused && workers < q.concurrency && q.tasks.length){

                    var tasks = q.payload ?
                        q.tasks.splice(0, q.payload) :
                        q.tasks.splice(0, q.tasks.length);

                    var data = _map(tasks, function (task) {
                        return task.data;
                    });

                    if (q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    workersList.push(tasks[0]);
                    var cb = only_once(_next(q, tasks));
                    worker(data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            workersList: function () {
                return workersList;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
            var beg = -1,
                end = sequence.length - 1;
            while (beg < end) {
                var mid = beg + ((end - beg + 1) >>> 1);
                if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                } else {
                    end = mid - 1;
                }
            }
            return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return _restParam(function (fn, args) {
            fn.apply(null, args.concat([_restParam(function (err, args) {
                if (typeof console === 'object') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            })]));
        });
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        var has = Object.prototype.hasOwnProperty;
        hasher = hasher || identity;
        var memoized = _restParam(function memoized(args) {
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (has.call(memo, key)) {   
                async.setImmediate(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (has.call(queues, key)) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([_restParam(function (args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i].apply(null, args);
                    }
                })]));
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return _restParam(function (args) {
            var that = this;

            var callback = args[args.length - 1];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                    cb(err, nextargs);
                })]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        });
    };

    async.compose = function (/* functions... */) {
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn) {
        return _restParam(function(fns, args) {
            var go = _restParam(function(args) {
                var that = this;
                var callback = args.pop();
                return eachfn(fns, function (fn, _, cb) {
                    fn.apply(that, args.concat([cb]));
                },
                callback);
            });
            if (args.length) {
                return go.apply(this, args);
            }
            else {
                return go;
            }
        });
    }

    async.applyEach = _applyEach(async.eachOf);
    async.applyEachSeries = _applyEach(async.eachOfSeries);


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return _restParam(function (args) {
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        });
    }

    async.ensureAsync = ensureAsync;

    async.constant = _restParam(function(values) {
        var args = [null].concat(values);
        return function (callback) {
            return callback.apply(this, args);
        };
    });

    async.wrapSync =
    async.asyncify = function asyncify(func) {
        return _restParam(function (args) {
            var callback = args.pop();
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (_isObject(result) && typeof result.then === "function") {
                result.then(function(value) {
                    callback(null, value);
                })["catch"](function(err) {
                    callback(err.message ? err : new Error(err));
                });
            } else {
                callback(null, result);
            }
        });
    };

    // Node.js
    if (typeof module === 'object' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9zY2hlbWEtaW5zcGVjdG9yL25vZGVfbW9kdWxlcy9hc3luYy9saWIvYXN5bmMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBhc3luY1xuICogaHR0cHM6Ly9naXRodWIuY29tL2Nhb2xhbi9hc3luY1xuICpcbiAqIENvcHlyaWdodCAyMDEwLTIwMTQgQ2FvbGFuIE1jTWFob25cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG4oZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGFzeW5jID0ge307XG4gICAgZnVuY3Rpb24gbm9vcCgpIHt9XG4gICAgZnVuY3Rpb24gaWRlbnRpdHkodikge1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG4gICAgZnVuY3Rpb24gdG9Cb29sKHYpIHtcbiAgICAgICAgcmV0dXJuICEhdjtcbiAgICB9XG4gICAgZnVuY3Rpb24gbm90SWQodikge1xuICAgICAgICByZXR1cm4gIXY7XG4gICAgfVxuXG4gICAgLy8gZ2xvYmFsIG9uIHRoZSBzZXJ2ZXIsIHdpbmRvdyBpbiB0aGUgYnJvd3NlclxuICAgIHZhciBwcmV2aW91c19hc3luYztcblxuICAgIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIChgc2VsZmApIGluIHRoZSBicm93c2VyLCBgZ2xvYmFsYFxuICAgIC8vIG9uIHRoZSBzZXJ2ZXIsIG9yIGB0aGlzYCBpbiBzb21lIHZpcnR1YWwgbWFjaGluZXMuIFdlIHVzZSBgc2VsZmBcbiAgICAvLyBpbnN0ZWFkIG9mIGB3aW5kb3dgIGZvciBgV2ViV29ya2VyYCBzdXBwb3J0LlxuICAgIHZhciByb290ID0gdHlwZW9mIHNlbGYgPT09ICdvYmplY3QnICYmIHNlbGYuc2VsZiA9PT0gc2VsZiAmJiBzZWxmIHx8XG4gICAgICAgICAgICB0eXBlb2YgZ2xvYmFsID09PSAnb2JqZWN0JyAmJiBnbG9iYWwuZ2xvYmFsID09PSBnbG9iYWwgJiYgZ2xvYmFsIHx8XG4gICAgICAgICAgICB0aGlzO1xuXG4gICAgaWYgKHJvb3QgIT0gbnVsbCkge1xuICAgICAgICBwcmV2aW91c19hc3luYyA9IHJvb3QuYXN5bmM7XG4gICAgfVxuXG4gICAgYXN5bmMubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcm9vdC5hc3luYyA9IHByZXZpb3VzX2FzeW5jO1xuICAgICAgICByZXR1cm4gYXN5bmM7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG9ubHlfb25jZShmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZm4gPT09IG51bGwpIHRocm93IG5ldyBFcnJvcihcIkNhbGxiYWNrIHdhcyBhbHJlYWR5IGNhbGxlZC5cIik7XG4gICAgICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgZm4gPSBudWxsO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9vbmNlKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChmbiA9PT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGZuID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLy8vIGNyb3NzLWJyb3dzZXIgY29tcGF0aWJsaXR5IGZ1bmN0aW9ucyAvLy8vXG5cbiAgICB2YXIgX3RvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuICAgIHZhciBfaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgICAgICByZXR1cm4gX3RvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9O1xuXG4gICAgLy8gUG9ydGVkIGZyb20gdW5kZXJzY29yZS5qcyBpc09iamVjdFxuICAgIHZhciBfaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2Ygb2JqO1xuICAgICAgICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9iajtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2lzQXJyYXlMaWtlKGFycikge1xuICAgICAgICByZXR1cm4gX2lzQXJyYXkoYXJyKSB8fCAoXG4gICAgICAgICAgICAvLyBoYXMgYSBwb3NpdGl2ZSBpbnRlZ2VyIGxlbmd0aCBwcm9wZXJ0eVxuICAgICAgICAgICAgdHlwZW9mIGFyci5sZW5ndGggPT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgIGFyci5sZW5ndGggPj0gMCAmJlxuICAgICAgICAgICAgYXJyLmxlbmd0aCAlIDEgPT09IDBcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYXJyYXlFYWNoKGFyciwgaXRlcmF0b3IpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBhcnIubGVuZ3RoO1xuXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICBpdGVyYXRvcihhcnJbaW5kZXhdLCBpbmRleCwgYXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9tYXAoYXJyLCBpdGVyYXRvcikge1xuICAgICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGFyci5sZW5ndGgsXG4gICAgICAgICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0b3IoYXJyW2luZGV4XSwgaW5kZXgsIGFycik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmFuZ2UoY291bnQpIHtcbiAgICAgICAgcmV0dXJuIF9tYXAoQXJyYXkoY291bnQpLCBmdW5jdGlvbiAodiwgaSkgeyByZXR1cm4gaTsgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JlZHVjZShhcnIsIGl0ZXJhdG9yLCBtZW1vKSB7XG4gICAgICAgIF9hcnJheUVhY2goYXJyLCBmdW5jdGlvbiAoeCwgaSwgYSkge1xuICAgICAgICAgICAgbWVtbyA9IGl0ZXJhdG9yKG1lbW8sIHgsIGksIGEpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZvckVhY2hPZihvYmplY3QsIGl0ZXJhdG9yKSB7XG4gICAgICAgIF9hcnJheUVhY2goX2tleXMob2JqZWN0KSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaXRlcmF0b3Iob2JqZWN0W2tleV0sIGtleSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9pbmRleE9mKGFyciwgaXRlbSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFycltpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIHZhciBfa2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgdmFyIGtleXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgICAgICBrZXlzLnB1c2goayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9rZXlJdGVyYXRvcihjb2xsKSB7XG4gICAgICAgIHZhciBpID0gLTE7XG4gICAgICAgIHZhciBsZW47XG4gICAgICAgIHZhciBrZXlzO1xuICAgICAgICBpZiAoX2lzQXJyYXlMaWtlKGNvbGwpKSB7XG4gICAgICAgICAgICBsZW4gPSBjb2xsLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICByZXR1cm4gaSA8IGxlbiA/IGkgOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGtleXMgPSBfa2V5cyhjb2xsKTtcbiAgICAgICAgICAgIGxlbiA9IGtleXMubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIHJldHVybiBpIDwgbGVuID8ga2V5c1tpXSA6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2ltaWxhciB0byBFUzYncyByZXN0IHBhcmFtIChodHRwOi8vYXJpeWEub2ZpbGFicy5jb20vMjAxMy8wMy9lczYtYW5kLXJlc3QtcGFyYW1ldGVyLmh0bWwpXG4gICAgLy8gVGhpcyBhY2N1bXVsYXRlcyB0aGUgYXJndW1lbnRzIHBhc3NlZCBpbnRvIGFuIGFycmF5LCBhZnRlciBhIGdpdmVuIGluZGV4LlxuICAgIC8vIEZyb20gdW5kZXJzY29yZS5qcyAoaHR0cHM6Ly9naXRodWIuY29tL2phc2hrZW5hcy91bmRlcnNjb3JlL3B1bGwvMjE0MCkuXG4gICAgZnVuY3Rpb24gX3Jlc3RQYXJhbShmdW5jLCBzdGFydEluZGV4KSB7XG4gICAgICAgIHN0YXJ0SW5kZXggPSBzdGFydEluZGV4ID09IG51bGwgPyBmdW5jLmxlbmd0aCAtIDEgOiArc3RhcnRJbmRleDtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KGFyZ3VtZW50cy5sZW5ndGggLSBzdGFydEluZGV4LCAwKTtcbiAgICAgICAgICAgIHZhciByZXN0ID0gQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgICAgICByZXN0W2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleCArIHN0YXJ0SW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3dpdGNoIChzdGFydEluZGV4KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gZnVuYy5jYWxsKHRoaXMsIHJlc3QpO1xuICAgICAgICAgICAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0sIHJlc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ3VycmVudGx5IHVudXNlZCBidXQgaGFuZGxlIGNhc2VzIG91dHNpZGUgb2YgdGhlIHN3aXRjaCBzdGF0ZW1lbnQ6XG4gICAgICAgICAgICAvLyB2YXIgYXJncyA9IEFycmF5KHN0YXJ0SW5kZXggKyAxKTtcbiAgICAgICAgICAgIC8vIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHN0YXJ0SW5kZXg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIC8vICAgICBhcmdzW2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleF07XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyBhcmdzW3N0YXJ0SW5kZXhdID0gcmVzdDtcbiAgICAgICAgICAgIC8vIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0b3IodmFsdWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLy8vIGV4cG9ydGVkIGFzeW5jIG1vZHVsZSBmdW5jdGlvbnMgLy8vL1xuXG4gICAgLy8vLyBuZXh0VGljayBpbXBsZW1lbnRhdGlvbiB3aXRoIGJyb3dzZXItY29tcGF0aWJsZSBmYWxsYmFjayAvLy8vXG5cbiAgICAvLyBjYXB0dXJlIHRoZSBnbG9iYWwgcmVmZXJlbmNlIHRvIGd1YXJkIGFnYWluc3QgZmFrZVRpbWVyIG1vY2tzXG4gICAgdmFyIF9zZXRJbW1lZGlhdGUgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSAnZnVuY3Rpb24nICYmIHNldEltbWVkaWF0ZTtcblxuICAgIHZhciBfZGVsYXkgPSBfc2V0SW1tZWRpYXRlID8gZnVuY3Rpb24oZm4pIHtcbiAgICAgICAgLy8gbm90IGEgZGlyZWN0IGFsaWFzIGZvciBJRTEwIGNvbXBhdGliaWxpdHlcbiAgICAgICAgX3NldEltbWVkaWF0ZShmbik7XG4gICAgfSA6IGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwcm9jZXNzLm5leHRUaWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGFzeW5jLm5leHRUaWNrID0gcHJvY2Vzcy5uZXh0VGljaztcbiAgICB9IGVsc2Uge1xuICAgICAgICBhc3luYy5uZXh0VGljayA9IF9kZWxheTtcbiAgICB9XG4gICAgYXN5bmMuc2V0SW1tZWRpYXRlID0gX3NldEltbWVkaWF0ZSA/IF9kZWxheSA6IGFzeW5jLm5leHRUaWNrO1xuXG5cbiAgICBhc3luYy5mb3JFYWNoID1cbiAgICBhc3luYy5lYWNoID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5lYWNoT2YoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoU2VyaWVzID1cbiAgICBhc3luYy5lYWNoU2VyaWVzID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5lYWNoT2ZTZXJpZXMoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cblxuICAgIGFzeW5jLmZvckVhY2hMaW1pdCA9XG4gICAgYXN5bmMuZWFjaExpbWl0ID0gZnVuY3Rpb24gKGFyciwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gX2VhY2hPZkxpbWl0KGxpbWl0KShhcnIsIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmZvckVhY2hPZiA9XG4gICAgYXN5bmMuZWFjaE9mID0gZnVuY3Rpb24gKG9iamVjdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIG9iamVjdCA9IG9iamVjdCB8fCBbXTtcblxuICAgICAgICB2YXIgaXRlciA9IF9rZXlJdGVyYXRvcihvYmplY3QpO1xuICAgICAgICB2YXIga2V5LCBjb21wbGV0ZWQgPSAwO1xuXG4gICAgICAgIHdoaWxlICgoa2V5ID0gaXRlcigpKSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb21wbGV0ZWQgKz0gMTtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG9iamVjdFtrZXldLCBrZXksIG9ubHlfb25jZShkb25lKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29tcGxldGVkID09PSAwKSBjYWxsYmFjayhudWxsKTtcblxuICAgICAgICBmdW5jdGlvbiBkb25lKGVycikge1xuICAgICAgICAgICAgY29tcGxldGVkLS07XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENoZWNrIGtleSBpcyBudWxsIGluIGNhc2UgaXRlcmF0b3IgaXNuJ3QgZXhoYXVzdGVkXG4gICAgICAgICAgICAvLyBhbmQgZG9uZSByZXNvbHZlZCBzeW5jaHJvbm91c2x5LlxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5ID09PSBudWxsICYmIGNvbXBsZXRlZCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaE9mU2VyaWVzID1cbiAgICBhc3luYy5lYWNoT2ZTZXJpZXMgPSBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgb2JqID0gb2JqIHx8IFtdO1xuICAgICAgICB2YXIgbmV4dEtleSA9IF9rZXlJdGVyYXRvcihvYmopO1xuICAgICAgICB2YXIga2V5ID0gbmV4dEtleSgpO1xuICAgICAgICBmdW5jdGlvbiBpdGVyYXRlKCkge1xuICAgICAgICAgICAgdmFyIHN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZXJhdG9yKG9ialtrZXldLCBrZXksIG9ubHlfb25jZShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gbmV4dEtleSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShpdGVyYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlcmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgc3luYyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGl0ZXJhdGUoKTtcbiAgICB9O1xuXG5cblxuICAgIGFzeW5jLmZvckVhY2hPZkxpbWl0ID1cbiAgICBhc3luYy5lYWNoT2ZMaW1pdCA9IGZ1bmN0aW9uIChvYmosIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgX2VhY2hPZkxpbWl0KGxpbWl0KShvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9lYWNoT2ZMaW1pdChsaW1pdCkge1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgICAgICBvYmogPSBvYmogfHwgW107XG4gICAgICAgICAgICB2YXIgbmV4dEtleSA9IF9rZXlJdGVyYXRvcihvYmopO1xuICAgICAgICAgICAgaWYgKGxpbWl0IDw9IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIHJ1bm5pbmcgPSAwO1xuICAgICAgICAgICAgdmFyIGVycm9yZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgKGZ1bmN0aW9uIHJlcGxlbmlzaCAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvbmUgJiYgcnVubmluZyA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAocnVubmluZyA8IGxpbWl0ICYmICFlcnJvcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bm5pbmcgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJ1bm5pbmcgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3Iob2JqW2tleV0sIGtleSwgb25seV9vbmNlKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bm5pbmcgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGVuaXNoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9O1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gZG9QYXJhbGxlbChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oYXN5bmMuZWFjaE9mLCBvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvUGFyYWxsZWxMaW1pdChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKF9lYWNoT2ZMaW1pdChsaW1pdCksIG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZG9TZXJpZXMoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKGFzeW5jLmVhY2hPZlNlcmllcywgb2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hc3luY01hcChlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIGFyciA9IGFyciB8fCBbXTtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBfaXNBcnJheUxpa2UoYXJyKSA/IFtdIDoge307XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih2YWx1ZSwgZnVuY3Rpb24gKGVyciwgdikge1xuICAgICAgICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gdjtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLm1hcCA9IGRvUGFyYWxsZWwoX2FzeW5jTWFwKTtcbiAgICBhc3luYy5tYXBTZXJpZXMgPSBkb1NlcmllcyhfYXN5bmNNYXApO1xuICAgIGFzeW5jLm1hcExpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9hc3luY01hcCk7XG5cbiAgICAvLyByZWR1Y2Ugb25seSBoYXMgYSBzZXJpZXMgdmVyc2lvbiwgYXMgZG9pbmcgcmVkdWNlIGluIHBhcmFsbGVsIHdvbid0XG4gICAgLy8gd29yayBpbiBtYW55IHNpdHVhdGlvbnMuXG4gICAgYXN5bmMuaW5qZWN0ID1cbiAgICBhc3luYy5mb2xkbCA9XG4gICAgYXN5bmMucmVkdWNlID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGFzeW5jLmVhY2hPZlNlcmllcyhhcnIsIGZ1bmN0aW9uICh4LCBpLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IobWVtbywgeCwgZnVuY3Rpb24gKGVyciwgdikge1xuICAgICAgICAgICAgICAgIG1lbW8gPSB2O1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCBtZW1vKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jLmZvbGRyID1cbiAgICBhc3luYy5yZWR1Y2VSaWdodCA9IGZ1bmN0aW9uIChhcnIsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmV2ZXJzZWQgPSBfbWFwKGFyciwgaWRlbnRpdHkpLnJldmVyc2UoKTtcbiAgICAgICAgYXN5bmMucmVkdWNlKHJldmVyc2VkLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy50cmFuc2Zvcm0gPSBmdW5jdGlvbiAoYXJyLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gaXRlcmF0b3I7XG4gICAgICAgICAgICBpdGVyYXRvciA9IG1lbW87XG4gICAgICAgICAgICBtZW1vID0gX2lzQXJyYXkoYXJyKSA/IFtdIDoge307XG4gICAgICAgIH1cblxuICAgICAgICBhc3luYy5lYWNoT2YoYXJyLCBmdW5jdGlvbih2LCBrLCBjYikge1xuICAgICAgICAgICAgaXRlcmF0b3IobWVtbywgdiwgaywgY2IpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgbWVtbyk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZmlsdGVyKGVhY2hmbiwgYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHgsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IoeCwgZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goe2luZGV4OiBpbmRleCwgdmFsdWU6IHh9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhfbWFwKHJlc3VsdHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcbiAgICAgICAgICAgIH0pLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4LnZhbHVlO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5zZWxlY3QgPVxuICAgIGFzeW5jLmZpbHRlciA9IGRvUGFyYWxsZWwoX2ZpbHRlcik7XG5cbiAgICBhc3luYy5zZWxlY3RMaW1pdCA9XG4gICAgYXN5bmMuZmlsdGVyTGltaXQgPSBkb1BhcmFsbGVsTGltaXQoX2ZpbHRlcik7XG5cbiAgICBhc3luYy5zZWxlY3RTZXJpZXMgPVxuICAgIGFzeW5jLmZpbHRlclNlcmllcyA9IGRvU2VyaWVzKF9maWx0ZXIpO1xuXG4gICAgZnVuY3Rpb24gX3JlamVjdChlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9maWx0ZXIoZWFjaGZuLCBhcnIsIGZ1bmN0aW9uKHZhbHVlLCBjYikge1xuICAgICAgICAgICAgaXRlcmF0b3IodmFsdWUsIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgICAgICBjYighdik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICBhc3luYy5yZWplY3QgPSBkb1BhcmFsbGVsKF9yZWplY3QpO1xuICAgIGFzeW5jLnJlamVjdExpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9yZWplY3QpO1xuICAgIGFzeW5jLnJlamVjdFNlcmllcyA9IGRvU2VyaWVzKF9yZWplY3QpO1xuXG4gICAgZnVuY3Rpb24gX2NyZWF0ZVRlc3RlcihlYWNoZm4sIGNoZWNrLCBnZXRSZXN1bHQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGFyciwgbGltaXQsIGl0ZXJhdG9yLCBjYikge1xuICAgICAgICAgICAgZnVuY3Rpb24gZG9uZSgpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2IpIGNiKGdldFJlc3VsdChmYWxzZSwgdm9pZCAwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBpdGVyYXRlZSh4LCBfLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGlmICghY2IpIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjYiAmJiBjaGVjayh2KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IoZ2V0UmVzdWx0KHRydWUsIHgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiID0gaXRlcmF0b3IgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICAgICAgZWFjaGZuKGFyciwgbGltaXQsIGl0ZXJhdGVlLCBkb25lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2IgPSBpdGVyYXRvcjtcbiAgICAgICAgICAgICAgICBpdGVyYXRvciA9IGxpbWl0O1xuICAgICAgICAgICAgICAgIGVhY2hmbihhcnIsIGl0ZXJhdGVlLCBkb25lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYy5hbnkgPVxuICAgIGFzeW5jLnNvbWUgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZiwgdG9Cb29sLCBpZGVudGl0eSk7XG5cbiAgICBhc3luYy5zb21lTGltaXQgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZkxpbWl0LCB0b0Jvb2wsIGlkZW50aXR5KTtcblxuICAgIGFzeW5jLmFsbCA9XG4gICAgYXN5bmMuZXZlcnkgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZiwgbm90SWQsIG5vdElkKTtcblxuICAgIGFzeW5jLmV2ZXJ5TGltaXQgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZkxpbWl0LCBub3RJZCwgbm90SWQpO1xuXG4gICAgZnVuY3Rpb24gX2ZpbmRHZXRSZXN1bHQodiwgeCkge1xuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gICAgYXN5bmMuZGV0ZWN0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIGlkZW50aXR5LCBfZmluZEdldFJlc3VsdCk7XG4gICAgYXN5bmMuZGV0ZWN0U2VyaWVzID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZTZXJpZXMsIGlkZW50aXR5LCBfZmluZEdldFJlc3VsdCk7XG4gICAgYXN5bmMuZGV0ZWN0TGltaXQgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZkxpbWl0LCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuXG4gICAgYXN5bmMuc29ydEJ5ID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGFzeW5jLm1hcChhcnIsIGZ1bmN0aW9uICh4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IoeCwgZnVuY3Rpb24gKGVyciwgY3JpdGVyaWEpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCB7dmFsdWU6IHgsIGNyaXRlcmlhOiBjcml0ZXJpYX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBfbWFwKHJlc3VsdHMuc29ydChjb21wYXJhdG9yKSwgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHgudmFsdWU7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIGNvbXBhcmF0b3IobGVmdCwgcmlnaHQpIHtcbiAgICAgICAgICAgIHZhciBhID0gbGVmdC5jcml0ZXJpYSwgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgICAgICAgcmV0dXJuIGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiAwO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmF1dG8gPSBmdW5jdGlvbiAodGFza3MsIGNvbmN1cnJlbmN5LCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgLy8gY29uY3VycmVuY3kgaXMgb3B0aW9uYWwsIHNoaWZ0IHRoZSBhcmdzLlxuICAgICAgICAgICAgY2FsbGJhY2sgPSBjb25jdXJyZW5jeTtcbiAgICAgICAgICAgIGNvbmN1cnJlbmN5ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICB2YXIga2V5cyA9IF9rZXlzKHRhc2tzKTtcbiAgICAgICAgdmFyIHJlbWFpbmluZ1Rhc2tzID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGlmICghcmVtYWluaW5nVGFza3MpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbmN1cnJlbmN5KSB7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IHJlbWFpbmluZ1Rhc2tzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3VsdHMgPSB7fTtcbiAgICAgICAgdmFyIHJ1bm5pbmdUYXNrcyA9IDA7XG5cbiAgICAgICAgdmFyIGhhc0Vycm9yID0gZmFsc2U7XG5cbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IFtdO1xuICAgICAgICBmdW5jdGlvbiBhZGRMaXN0ZW5lcihmbikge1xuICAgICAgICAgICAgbGlzdGVuZXJzLnVuc2hpZnQoZm4pO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGZuKSB7XG4gICAgICAgICAgICB2YXIgaWR4ID0gX2luZGV4T2YobGlzdGVuZXJzLCBmbik7XG4gICAgICAgICAgICBpZiAoaWR4ID49IDApIGxpc3RlbmVycy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiB0YXNrQ29tcGxldGUoKSB7XG4gICAgICAgICAgICByZW1haW5pbmdUYXNrcy0tO1xuICAgICAgICAgICAgX2FycmF5RWFjaChsaXN0ZW5lcnMuc2xpY2UoMCksIGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFkZExpc3RlbmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghcmVtYWluaW5nVGFza3MpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgX2FycmF5RWFjaChrZXlzLCBmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgaWYgKGhhc0Vycm9yKSByZXR1cm47XG4gICAgICAgICAgICB2YXIgdGFzayA9IF9pc0FycmF5KHRhc2tzW2tdKSA/IHRhc2tzW2tdOiBbdGFza3Nba11dO1xuICAgICAgICAgICAgdmFyIHRhc2tDYWxsYmFjayA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgcnVubmluZ1Rhc2tzLS07XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNhZmVSZXN1bHRzID0ge307XG4gICAgICAgICAgICAgICAgICAgIF9mb3JFYWNoT2YocmVzdWx0cywgZnVuY3Rpb24odmFsLCBya2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYWZlUmVzdWx0c1tya2V5XSA9IHZhbDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNhZmVSZXN1bHRzW2tdID0gYXJncztcbiAgICAgICAgICAgICAgICAgICAgaGFzRXJyb3IgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgc2FmZVJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZSh0YXNrQ29tcGxldGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHJlcXVpcmVzID0gdGFzay5zbGljZSgwLCB0YXNrLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgLy8gcHJldmVudCBkZWFkLWxvY2tzXG4gICAgICAgICAgICB2YXIgbGVuID0gcmVxdWlyZXMubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGRlcDtcbiAgICAgICAgICAgIHdoaWxlIChsZW4tLSkge1xuICAgICAgICAgICAgICAgIGlmICghKGRlcCA9IHRhc2tzW3JlcXVpcmVzW2xlbl1dKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hhcyBub25leGlzdGVudCBkZXBlbmRlbmN5IGluICcgKyByZXF1aXJlcy5qb2luKCcsICcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKF9pc0FycmF5KGRlcCkgJiYgX2luZGV4T2YoZGVwLCBrKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSGFzIGN5Y2xpYyBkZXBlbmRlbmNpZXMnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiByZWFkeSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcnVubmluZ1Rhc2tzIDwgY29uY3VycmVuY3kgJiYgX3JlZHVjZShyZXF1aXJlcywgZnVuY3Rpb24gKGEsIHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChhICYmIHJlc3VsdHMuaGFzT3duUHJvcGVydHkoeCkpO1xuICAgICAgICAgICAgICAgIH0sIHRydWUpICYmICFyZXN1bHRzLmhhc093blByb3BlcnR5KGspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlYWR5KCkpIHtcbiAgICAgICAgICAgICAgICBydW5uaW5nVGFza3MrKztcbiAgICAgICAgICAgICAgICB0YXNrW3Rhc2subGVuZ3RoIC0gMV0odGFza0NhbGxiYWNrLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFkZExpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGxpc3RlbmVyKCkge1xuICAgICAgICAgICAgICAgIGlmIChyZWFkeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bm5pbmdUYXNrcysrO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tbdGFzay5sZW5ndGggLSAxXSh0YXNrQ2FsbGJhY2ssIHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuXG5cbiAgICBhc3luYy5yZXRyeSA9IGZ1bmN0aW9uKHRpbWVzLCB0YXNrLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgREVGQVVMVF9USU1FUyA9IDU7XG4gICAgICAgIHZhciBERUZBVUxUX0lOVEVSVkFMID0gMDtcblxuICAgICAgICB2YXIgYXR0ZW1wdHMgPSBbXTtcblxuICAgICAgICB2YXIgb3B0cyA9IHtcbiAgICAgICAgICAgIHRpbWVzOiBERUZBVUxUX1RJTUVTLFxuICAgICAgICAgICAgaW50ZXJ2YWw6IERFRkFVTFRfSU5URVJWQUxcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiBwYXJzZVRpbWVzKGFjYywgdCl7XG4gICAgICAgICAgICBpZih0eXBlb2YgdCA9PT0gJ251bWJlcicpe1xuICAgICAgICAgICAgICAgIGFjYy50aW1lcyA9IHBhcnNlSW50KHQsIDEwKSB8fCBERUZBVUxUX1RJTUVTO1xuICAgICAgICAgICAgfSBlbHNlIGlmKHR5cGVvZiB0ID09PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgYWNjLnRpbWVzID0gcGFyc2VJbnQodC50aW1lcywgMTApIHx8IERFRkFVTFRfVElNRVM7XG4gICAgICAgICAgICAgICAgYWNjLmludGVydmFsID0gcGFyc2VJbnQodC5pbnRlcnZhbCwgMTApIHx8IERFRkFVTFRfSU5URVJWQUw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgYXJndW1lbnQgdHlwZSBmb3IgXFwndGltZXNcXCc6ICcgKyB0eXBlb2YgdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgaWYgKGxlbmd0aCA8IDEgfHwgbGVuZ3RoID4gMykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGFyZ3VtZW50cyAtIG11c3QgYmUgZWl0aGVyICh0YXNrKSwgKHRhc2ssIGNhbGxiYWNrKSwgKHRpbWVzLCB0YXNrKSBvciAodGltZXMsIHRhc2ssIGNhbGxiYWNrKScpO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aCA8PSAyICYmIHR5cGVvZiB0aW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSB0YXNrO1xuICAgICAgICAgICAgdGFzayA9IHRpbWVzO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGltZXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHBhcnNlVGltZXMob3B0cywgdGltZXMpO1xuICAgICAgICB9XG4gICAgICAgIG9wdHMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgb3B0cy50YXNrID0gdGFzaztcblxuICAgICAgICBmdW5jdGlvbiB3cmFwcGVkVGFzayh3cmFwcGVkQ2FsbGJhY2ssIHdyYXBwZWRSZXN1bHRzKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiByZXRyeUF0dGVtcHQodGFzaywgZmluYWxBdHRlbXB0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNlcmllc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2soZnVuY3Rpb24oZXJyLCByZXN1bHQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VyaWVzQ2FsbGJhY2soIWVyciB8fCBmaW5hbEF0dGVtcHQsIHtlcnI6IGVyciwgcmVzdWx0OiByZXN1bHR9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgd3JhcHBlZFJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJldHJ5SW50ZXJ2YWwoaW50ZXJ2YWwpe1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihzZXJpZXNDYWxsYmFjayl7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcmllc0NhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9LCBpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2hpbGUgKG9wdHMudGltZXMpIHtcblxuICAgICAgICAgICAgICAgIHZhciBmaW5hbEF0dGVtcHQgPSAhKG9wdHMudGltZXMtPTEpO1xuICAgICAgICAgICAgICAgIGF0dGVtcHRzLnB1c2gocmV0cnlBdHRlbXB0KG9wdHMudGFzaywgZmluYWxBdHRlbXB0KSk7XG4gICAgICAgICAgICAgICAgaWYoIWZpbmFsQXR0ZW1wdCAmJiBvcHRzLmludGVydmFsID4gMCl7XG4gICAgICAgICAgICAgICAgICAgIGF0dGVtcHRzLnB1c2gocmV0cnlJbnRlcnZhbChvcHRzLmludGVydmFsKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhc3luYy5zZXJpZXMoYXR0ZW1wdHMsIGZ1bmN0aW9uKGRvbmUsIGRhdGEpe1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhW2RhdGEubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgKHdyYXBwZWRDYWxsYmFjayB8fCBvcHRzLmNhbGxiYWNrKShkYXRhLmVyciwgZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBhIGNhbGxiYWNrIGlzIHBhc3NlZCwgcnVuIHRoaXMgYXMgYSBjb250cm9sbCBmbG93XG4gICAgICAgIHJldHVybiBvcHRzLmNhbGxiYWNrID8gd3JhcHBlZFRhc2soKSA6IHdyYXBwZWRUYXNrO1xuICAgIH07XG5cbiAgICBhc3luYy53YXRlcmZhbGwgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIGlmICghX2lzQXJyYXkodGFza3MpKSB7XG4gICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byB3YXRlcmZhbGwgbXVzdCBiZSBhbiBhcnJheSBvZiBmdW5jdGlvbnMnKTtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiB3cmFwSXRlcmF0b3IoaXRlcmF0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIFtlcnJdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaCh3cmFwSXRlcmF0b3IobmV4dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJncy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbnN1cmVBc3luYyhpdGVyYXRvcikuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgd3JhcEl0ZXJhdG9yKGFzeW5jLml0ZXJhdG9yKHRhc2tzKSkoKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX3BhcmFsbGVsKGVhY2hmbiwgdGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBfaXNBcnJheUxpa2UodGFza3MpID8gW10gOiB7fTtcblxuICAgICAgICBlYWNoZm4odGFza3MsIGZ1bmN0aW9uICh0YXNrLCBrZXksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB0YXNrKF9yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHRzW2tleV0gPSBhcmdzO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLnBhcmFsbGVsID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoYXN5bmMuZWFjaE9mLCB0YXNrcywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5wYXJhbGxlbExpbWl0ID0gZnVuY3Rpb24odGFza3MsIGxpbWl0LCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoX2VhY2hPZkxpbWl0KGxpbWl0KSwgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuc2VyaWVzID0gZnVuY3Rpb24odGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9wYXJhbGxlbChhc3luYy5lYWNoT2ZTZXJpZXMsIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLml0ZXJhdG9yID0gZnVuY3Rpb24gKHRhc2tzKSB7XG4gICAgICAgIGZ1bmN0aW9uIG1ha2VDYWxsYmFjayhpbmRleCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gZm4oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0YXNrc1tpbmRleF0uYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLm5leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZuLm5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChpbmRleCA8IHRhc2tzLmxlbmd0aCAtIDEpID8gbWFrZUNhbGxiYWNrKGluZGV4ICsgMSk6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGZuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYWtlQ2FsbGJhY2soMCk7XG4gICAgfTtcblxuICAgIGFzeW5jLmFwcGx5ID0gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZm4sIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGNhbGxBcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkoXG4gICAgICAgICAgICAgICAgbnVsbCwgYXJncy5jb25jYXQoY2FsbEFyZ3MpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIF9jb25jYXQoZWFjaGZuLCBhcnIsIGZuLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBpbmRleCwgY2IpIHtcbiAgICAgICAgICAgIGZuKHgsIGZ1bmN0aW9uIChlcnIsIHkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHkgfHwgW10pO1xuICAgICAgICAgICAgICAgIGNiKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMuY29uY2F0ID0gZG9QYXJhbGxlbChfY29uY2F0KTtcbiAgICBhc3luYy5jb25jYXRTZXJpZXMgPSBkb1NlcmllcyhfY29uY2F0KTtcblxuICAgIGFzeW5jLndoaWxzdCA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgICAgICBpZiAodGVzdCgpKSB7XG4gICAgICAgICAgICB2YXIgbmV4dCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGVzdC5hcHBseSh0aGlzLCBhcmdzKSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVyYXRvcihuZXh0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBbbnVsbF0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG5leHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuZG9XaGlsc3QgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxscyA9IDA7XG4gICAgICAgIHJldHVybiBhc3luYy53aGlsc3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gKytjYWxscyA8PSAxIHx8IHRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMudW50aWwgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy53aGlsc3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gIXRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZG9VbnRpbCA9IGZ1bmN0aW9uIChpdGVyYXRvciwgdGVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLmRvV2hpbHN0KGl0ZXJhdG9yLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmR1cmluZyA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuXG4gICAgICAgIHZhciBuZXh0ID0gX3Jlc3RQYXJhbShmdW5jdGlvbihlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2goY2hlY2spO1xuICAgICAgICAgICAgICAgIHRlc3QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBjaGVjayA9IGZ1bmN0aW9uKGVyciwgdHJ1dGgpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0cnV0aCkge1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yKG5leHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0ZXN0KGNoZWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZG9EdXJpbmcgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxscyA9IDA7XG4gICAgICAgIGFzeW5jLmR1cmluZyhmdW5jdGlvbihuZXh0KSB7XG4gICAgICAgICAgICBpZiAoY2FsbHMrKyA8IDEpIHtcbiAgICAgICAgICAgICAgICBuZXh0KG51bGwsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9xdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5LCBwYXlsb2FkKSB7XG4gICAgICAgIGlmIChjb25jdXJyZW5jeSA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihjb25jdXJyZW5jeSA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb25jdXJyZW5jeSBtdXN0IG5vdCBiZSB6ZXJvJyk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gX2luc2VydChxLCBkYXRhLCBwb3MsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRhc2sgY2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcS5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghX2lzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZGF0YS5sZW5ndGggPT09IDAgJiYgcS5pZGxlKCkpIHtcbiAgICAgICAgICAgICAgICAvLyBjYWxsIGRyYWluIGltbWVkaWF0ZWx5IGlmIHRoZXJlIGFyZSBubyB0YXNrc1xuICAgICAgICAgICAgICAgIHJldHVybiBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9hcnJheUVhY2goZGF0YSwgZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2sgfHwgbm9vcFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpZiAocG9zKSB7XG4gICAgICAgICAgICAgICAgICAgIHEudGFza3MudW5zaGlmdChpdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoID09PSBxLmNvbmN1cnJlbmN5KSB7XG4gICAgICAgICAgICAgICAgICAgIHEuc2F0dXJhdGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBfbmV4dChxLCB0YXNrcykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgd29ya2VycyAtPSAxO1xuXG4gICAgICAgICAgICAgICAgdmFyIHJlbW92ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICBfYXJyYXlFYWNoKHRhc2tzLCBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICBfYXJyYXlFYWNoKHdvcmtlcnNMaXN0LCBmdW5jdGlvbiAod29ya2VyLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtlciA9PT0gdGFzayAmJiAhcmVtb3ZlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcnNMaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHRhc2suY2FsbGJhY2suYXBwbHkodGFzaywgYXJncyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoICsgd29ya2VycyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHEucHJvY2VzcygpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB3b3JrZXJzID0gMDtcbiAgICAgICAgdmFyIHdvcmtlcnNMaXN0ID0gW107XG4gICAgICAgIHZhciBxID0ge1xuICAgICAgICAgICAgdGFza3M6IFtdLFxuICAgICAgICAgICAgY29uY3VycmVuY3k6IGNvbmN1cnJlbmN5LFxuICAgICAgICAgICAgcGF5bG9hZDogcGF5bG9hZCxcbiAgICAgICAgICAgIHNhdHVyYXRlZDogbm9vcCxcbiAgICAgICAgICAgIGVtcHR5OiBub29wLFxuICAgICAgICAgICAgZHJhaW46IG5vb3AsXG4gICAgICAgICAgICBzdGFydGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHBhdXNlZDogZmFsc2UsXG4gICAgICAgICAgICBwdXNoOiBmdW5jdGlvbiAoZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIGZhbHNlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAga2lsbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHEuZHJhaW4gPSBub29wO1xuICAgICAgICAgICAgICAgIHEudGFza3MgPSBbXTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1bnNoaWZ0OiBmdW5jdGlvbiAoZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIHRydWUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUoIXEucGF1c2VkICYmIHdvcmtlcnMgPCBxLmNvbmN1cnJlbmN5ICYmIHEudGFza3MubGVuZ3RoKXtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdGFza3MgPSBxLnBheWxvYWQgP1xuICAgICAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoMCwgcS5wYXlsb2FkKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnNwbGljZSgwLCBxLnRhc2tzLmxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBfbWFwKHRhc2tzLCBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxLmVtcHR5KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgd29ya2VycyArPSAxO1xuICAgICAgICAgICAgICAgICAgICB3b3JrZXJzTGlzdC5wdXNoKHRhc2tzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNiID0gb25seV9vbmNlKF9uZXh0KHEsIHRhc2tzKSk7XG4gICAgICAgICAgICAgICAgICAgIHdvcmtlcihkYXRhLCBjYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxlbmd0aDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBxLnRhc2tzLmxlbmd0aDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBydW5uaW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlcnM7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd29ya2Vyc0xpc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd29ya2Vyc0xpc3Q7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaWRsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHEudGFza3MubGVuZ3RoICsgd29ya2VycyA9PT0gMDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXVzZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHEucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXN1bWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAocS5wYXVzZWQgPT09IGZhbHNlKSB7IHJldHVybjsgfVxuICAgICAgICAgICAgICAgIHEucGF1c2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VtZUNvdW50ID0gTWF0aC5taW4ocS5jb25jdXJyZW5jeSwgcS50YXNrcy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIC8vIE5lZWQgdG8gY2FsbCBxLnByb2Nlc3Mgb25jZSBwZXIgY29uY3VycmVudFxuICAgICAgICAgICAgICAgIC8vIHdvcmtlciB0byBwcmVzZXJ2ZSBmdWxsIGNvbmN1cnJlbmN5IGFmdGVyIHBhdXNlXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgdyA9IDE7IHcgPD0gcmVzdW1lQ291bnQ7IHcrKykge1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBxO1xuICAgIH1cblxuICAgIGFzeW5jLnF1ZXVlID0gZnVuY3Rpb24gKHdvcmtlciwgY29uY3VycmVuY3kpIHtcbiAgICAgICAgdmFyIHEgPSBfcXVldWUoZnVuY3Rpb24gKGl0ZW1zLCBjYikge1xuICAgICAgICAgICAgd29ya2VyKGl0ZW1zWzBdLCBjYik7XG4gICAgICAgIH0sIGNvbmN1cnJlbmN5LCAxKTtcblxuICAgICAgICByZXR1cm4gcTtcbiAgICB9O1xuXG4gICAgYXN5bmMucHJpb3JpdHlRdWV1ZSA9IGZ1bmN0aW9uICh3b3JrZXIsIGNvbmN1cnJlbmN5KSB7XG5cbiAgICAgICAgZnVuY3Rpb24gX2NvbXBhcmVUYXNrcyhhLCBiKXtcbiAgICAgICAgICAgIHJldHVybiBhLnByaW9yaXR5IC0gYi5wcmlvcml0eTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIF9iaW5hcnlTZWFyY2goc2VxdWVuY2UsIGl0ZW0sIGNvbXBhcmUpIHtcbiAgICAgICAgICAgIHZhciBiZWcgPSAtMSxcbiAgICAgICAgICAgICAgICBlbmQgPSBzZXF1ZW5jZS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgd2hpbGUgKGJlZyA8IGVuZCkge1xuICAgICAgICAgICAgICAgIHZhciBtaWQgPSBiZWcgKyAoKGVuZCAtIGJlZyArIDEpID4+PiAxKTtcbiAgICAgICAgICAgICAgICBpZiAoY29tcGFyZShpdGVtLCBzZXF1ZW5jZVttaWRdKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGJlZyA9IG1pZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBtaWQgLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBiZWc7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBfaW5zZXJ0KHEsIGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0YXNrIGNhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHEuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIV9pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gY2FsbCBkcmFpbiBpbW1lZGlhdGVseSBpZiB0aGVyZSBhcmUgbm8gdGFza3NcbiAgICAgICAgICAgICAgICByZXR1cm4gYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfYXJyYXlFYWNoKGRhdGEsIGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFzayxcbiAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHk6IHByaW9yaXR5LFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nID8gY2FsbGJhY2sgOiBub29wXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHEudGFza3Muc3BsaWNlKF9iaW5hcnlTZWFyY2gocS50YXNrcywgaXRlbSwgX2NvbXBhcmVUYXNrcykgKyAxLCAwLCBpdGVtKTtcblxuICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gcS5jb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgICAgICAgICBxLnNhdHVyYXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RhcnQgd2l0aCBhIG5vcm1hbCBxdWV1ZVxuICAgICAgICB2YXIgcSA9IGFzeW5jLnF1ZXVlKHdvcmtlciwgY29uY3VycmVuY3kpO1xuXG4gICAgICAgIC8vIE92ZXJyaWRlIHB1c2ggdG8gYWNjZXB0IHNlY29uZCBwYXJhbWV0ZXIgcmVwcmVzZW50aW5nIHByaW9yaXR5XG4gICAgICAgIHEucHVzaCA9IGZ1bmN0aW9uIChkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBSZW1vdmUgdW5zaGlmdCBmdW5jdGlvblxuICAgICAgICBkZWxldGUgcS51bnNoaWZ0O1xuXG4gICAgICAgIHJldHVybiBxO1xuICAgIH07XG5cbiAgICBhc3luYy5jYXJnbyA9IGZ1bmN0aW9uICh3b3JrZXIsIHBheWxvYWQpIHtcbiAgICAgICAgcmV0dXJuIF9xdWV1ZSh3b3JrZXIsIDEsIHBheWxvYWQpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfY29uc29sZV9mbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChmbiwgYXJncykge1xuICAgICAgICAgICAgZm4uYXBwbHkobnVsbCwgYXJncy5jb25jYXQoW19yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY29uc29sZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnNvbGUuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoY29uc29sZVtuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2FycmF5RWFjaChhcmdzLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGVbbmFtZV0oeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXSkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMubG9nID0gX2NvbnNvbGVfZm4oJ2xvZycpO1xuICAgIGFzeW5jLmRpciA9IF9jb25zb2xlX2ZuKCdkaXInKTtcbiAgICAvKmFzeW5jLmluZm8gPSBfY29uc29sZV9mbignaW5mbycpO1xuICAgIGFzeW5jLndhcm4gPSBfY29uc29sZV9mbignd2FybicpO1xuICAgIGFzeW5jLmVycm9yID0gX2NvbnNvbGVfZm4oJ2Vycm9yJyk7Ki9cblxuICAgIGFzeW5jLm1lbW9pemUgPSBmdW5jdGlvbiAoZm4sIGhhc2hlcikge1xuICAgICAgICB2YXIgbWVtbyA9IHt9O1xuICAgICAgICB2YXIgcXVldWVzID0ge307XG4gICAgICAgIHZhciBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICAgICAgICBoYXNoZXIgPSBoYXNoZXIgfHwgaWRlbnRpdHk7XG4gICAgICAgIHZhciBtZW1vaXplZCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24gbWVtb2l6ZWQoYXJncykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIHZhciBrZXkgPSBoYXNoZXIuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICBpZiAoaGFzLmNhbGwobWVtbywga2V5KSkgeyAgIFxuICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIG1lbW9ba2V5XSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChoYXMuY2FsbChxdWV1ZXMsIGtleSkpIHtcbiAgICAgICAgICAgICAgICBxdWV1ZXNba2V5XS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1ZXVlc1trZXldID0gW2NhbGxiYWNrXTtcbiAgICAgICAgICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzLmNvbmNhdChbX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgICAgICAgICBtZW1vW2tleV0gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcSA9IHF1ZXVlc1trZXldO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgcXVldWVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gcS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHFbaV0uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG1lbW9pemVkLm1lbW8gPSBtZW1vO1xuICAgICAgICBtZW1vaXplZC51bm1lbW9pemVkID0gZm47XG4gICAgICAgIHJldHVybiBtZW1vaXplZDtcbiAgICB9O1xuXG4gICAgYXN5bmMudW5tZW1vaXplID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gKGZuLnVubWVtb2l6ZWQgfHwgZm4pLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF90aW1lcyhtYXBwZXIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjb3VudCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBtYXBwZXIoX3JhbmdlKGNvdW50KSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYy50aW1lcyA9IF90aW1lcyhhc3luYy5tYXApO1xuICAgIGFzeW5jLnRpbWVzU2VyaWVzID0gX3RpbWVzKGFzeW5jLm1hcFNlcmllcyk7XG4gICAgYXN5bmMudGltZXNMaW1pdCA9IGZ1bmN0aW9uIChjb3VudCwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMubWFwTGltaXQoX3JhbmdlKGNvdW50KSwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnNlcSA9IGZ1bmN0aW9uICgvKiBmdW5jdGlvbnMuLi4gKi8pIHtcbiAgICAgICAgdmFyIGZucyA9IGFyZ3VtZW50cztcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgYXJncy5wb3AoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgPSBub29wO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhc3luYy5yZWR1Y2UoZm5zLCBhcmdzLCBmdW5jdGlvbiAobmV3YXJncywgZm4sIGNiKSB7XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgbmV3YXJncy5jb25jYXQoW19yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgbmV4dGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgY2IoZXJyLCBuZXh0YXJncyk7XG4gICAgICAgICAgICAgICAgfSldKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGVyciwgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoYXQsIFtlcnJdLmNvbmNhdChyZXN1bHRzKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jLmNvbXBvc2UgPSBmdW5jdGlvbiAoLyogZnVuY3Rpb25zLi4uICovKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5zZXEuYXBwbHkobnVsbCwgQXJyYXkucHJvdG90eXBlLnJldmVyc2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICB9O1xuXG5cbiAgICBmdW5jdGlvbiBfYXBwbHlFYWNoKGVhY2hmbikge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbihmbnMsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBnbyA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBlYWNoZm4oZm5zLCBmdW5jdGlvbiAoZm4sIF8sIGNiKSB7XG4gICAgICAgICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIGFyZ3MuY29uY2F0KFtjYl0pKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdvLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdvO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5hcHBseUVhY2ggPSBfYXBwbHlFYWNoKGFzeW5jLmVhY2hPZik7XG4gICAgYXN5bmMuYXBwbHlFYWNoU2VyaWVzID0gX2FwcGx5RWFjaChhc3luYy5lYWNoT2ZTZXJpZXMpO1xuXG5cbiAgICBhc3luYy5mb3JldmVyID0gZnVuY3Rpb24gKGZuLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZG9uZSA9IG9ubHlfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIHRhc2sgPSBlbnN1cmVBc3luYyhmbik7XG4gICAgICAgIGZ1bmN0aW9uIG5leHQoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhc2sobmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dCgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBlbnN1cmVBc3luYyhmbikge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIGFyZ3MucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlubmVyQXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgaW5uZXJBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgaW5uZXJBcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgc3luYyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5lbnN1cmVBc3luYyA9IGVuc3VyZUFzeW5jO1xuXG4gICAgYXN5bmMuY29uc3RhbnQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICB2YXIgYXJncyA9IFtudWxsXS5jb25jYXQodmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXN5bmMud3JhcFN5bmMgPVxuICAgIGFzeW5jLmFzeW5jaWZ5ID0gZnVuY3Rpb24gYXN5bmNpZnkoZnVuYykge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYgcmVzdWx0IGlzIFByb21pc2Ugb2JqZWN0XG4gICAgICAgICAgICBpZiAoX2lzT2JqZWN0KHJlc3VsdCkgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyLm1lc3NhZ2UgPyBlcnIgOiBuZXcgRXJyb3IoZXJyKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBOb2RlLmpzXG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gYXN5bmM7XG4gICAgfVxuICAgIC8vIEFNRCAvIFJlcXVpcmVKU1xuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW10sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBhc3luYztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGluY2x1ZGVkIGRpcmVjdGx5IHZpYSA8c2NyaXB0PiB0YWdcbiAgICBlbHNlIHtcbiAgICAgICAgcm9vdC5hc3luYyA9IGFzeW5jO1xuICAgIH1cblxufSgpKTtcbiJdfQ==
},{"_process":2}],6:[function(require,module,exports){
'use strict';

var cs = {
	log: function log(text) {
		console.log(text);
	},
	get: function get(url, callback) {
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function () {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				if (xhr.status === 200) {
					var response = xhr.response ? JSON.parse(xhr.response) : null;
					callback(xhr.status, response);
				} else if (xhr.status < 500) {
					callback(xhr.status);
				} else {
					console.error('ajax get error');
				}
			}
		};
		xhr.open('GET', url);
		xhr.send();
	},
	post: function post(url, data, callback) {
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function () {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				if (xhr.status === 200) {
					var response = xhr.response ? JSON.parse(xhr.response) : null;
					callback(xhr.status, response);
				} else if (xhr.status < 500) {
					callback(xhr.status);
				} else {
					console.error('ajax post error');
				}
			}
		};
		xhr.open('POST', url);
		xhr.setRequestHeader('Content-type', 'application/json');
		xhr.send(JSON.stringify(data));
	},
	cookie: function cookie(name, cookies) {
		var c = this.cookies(cookies);
		return c[name];
	},
	cookies: function cookies(_cookies) {
		var nameValues = _cookies.split('; ');
		var result = {};
		nameValues.forEach(function (item) {
			var i = item.split('=');
			result[i[0]] = i[1];
		});
		return result;
	},
	getQueryValue: function getQueryValue(queryString, name) {
		var arr = queryString.match(new RegExp(name + '=([^&]+)'));

		if (arr) {
			return arr[1];
		} else {
			return null;
		}
	}
};

var tests = [{
	id: 1,
	test: function test() {
		var cookies = {
			csati: 'majom',
			one: 'two'
		};

		var result = true;

		var c = cs.cookies('csati=majom; one=two');

		if (c.csati !== cookies.csati) result = false;

		return result;
	}
}, {
	id: 2,
	test: function test() {
		return 'bar' === cs.cookie('foo', 'foo=bar; te=majom');
	}
}, {
	id: 3,
	test: function test() {
		return '123' === cs.getQueryValue('?csati=majom&user_id=123&valami=semmi', 'user_id');
	}
}];

if (false) {
	var result = true;
	tests.forEach(function (test) {
		if (!test.test()) {
			console.error(test.id + '. test failed');
			result = false;
		}
	});
	if (result) {
		console.log('All tests succeeded!');
	}
}

module.exports = cs;
},{}],7:[function(require,module,exports){
'use strict';

var food = {
	client: {
		type: 'object',
		properties: {
			id: { type: 'integer' },
			name: { type: 'string', minLength: 3 },
			description: { type: 'string', minLength: 3 },
			category: { type: 'string', minLength: 1 },
			paleo: { type: 'integer', eq: [1, 5, 10] },
			keto: { type: 'integer', eq: [1, 5, 10] },
			enabled: { type: 'boolean' }
		}
	}
};

var wish = {
	blank: function blank(user) {
		return {
			user: user,
			title: '',
			description: '',
			dirty: true
		};
	},
	client: {
		type: 'object',
		properties: {
			id: { type: ['string', 'null'], optional: true },
			title: { type: 'string' },
			description: { type: 'string' },
			user: {
				type: 'object',
				properties: {
					id: { tpye: 'string' },
					name: { type: 'string' }
				}
			},
			dirty: { type: 'boolean' }
		}
	},
	server: {
		type: 'object',
		properties: {
			id: { type: 'string' },
			title: { type: 'string' },
			description: { type: 'string' },
			user: {
				type: 'object',
				properties: {
					id: { tpye: 'string' },
					name: { type: 'string' }
				}
			}
		}
	},
	clientToServer: function clientToServer(obj) {
		var wish = {
			user: obj.user,
			description: obj.description,
			title: obj.title
		};
		if (obj.id) wish.id = obj.id;
		return wish;
	},
	serverToClient: function serverToClient(obj) {
		obj.dirty = false;
		return _.clone(obj);
	}
};

var wishList = {
	server: {
		type: 'array',
		items: {
			type: 'object',
			properties: wish.server.properties
		}
	}
};

var user = {
	blank: function blank() {
		return {
			id: null,
			name: '',
			status: bella.constants.userStatus.GUEST
		};
	},
	client: {
		type: 'object',
		properties: {
			id: { type: ['string', 'null'], optional: true },
			name: { type: 'string' },
			status: { type: 'string', eq: _.values(bella.constants.userStatus) }
		}
	},
	server: {
		type: 'object',
		properties: {
			id: { type: 'string' },
			name: { type: 'string' },
			status: { type: 'string', eq: _.values(bella.constants.userStatus) }
		}
	},
	clientToServer: function clientToServer(obj) {},
	serverToClient: function serverToClient(obj) {}
};

module.exports = {
	wish: wish,
	wishList: wishList,
	user: user,
	food: food
};
},{}],8:[function(require,module,exports){
'use strict';

var cs = require('./helpers/cs');
var inspector = require('schema-inspector');
var schemas = require('./schemas');

module.exports = {
	wish: {
		get: function get(id, callback) {
			cs.get('/wish?id=' + id, function (status, wish) {
				if (status === bella.constants.response.OK) {
					var validation = inspector.validate(schemas.wish.server, wish);
					if (!validation.valid) {
						console.error('wish validation error', validation.format());
					}
					callback({ success: true }, schemas.wish.serverToClient(wish));
				} else if (status === bella.constants.response.NOT_FOUND) {
					callback({ success: false, message: 'Wish not found' });
				}
			});
		},
		post: function post(wish, callback) {
			var validation = inspector.validate(schemas.wish.client, wish);
			if (validation.valid) {
				cs.post('/wish', schemas.wish.clientToServer(wish), function (status) {
					if (status === bella.constants.response.OK) callback({ success: true });
				});
			}
		}
	},
	wishList: {
		get: function get(callback) {
			cs.get('/wishList', function (status, wishList) {
				if (status === bella.constants.response.OK) {
					var validation = inspector.validate(schemas.wishList.server, wishList);
					console.log('vaildation', validation);
					if (!validation.valid) console.error('wishList server validation error');
					callback({ success: true }, wishList);
				} else {
					console.error('wishList ajax error');
				}
			});
		}
	},
	userStatus: {
		get: function get(callback) {
			cs.get('/userStatus', function (status, userStatus) {
				if (status === bella.constants.response.OK) {
					callback({ success: true }, userStatus);
				}
			});
		}
	},
	login: function login(loginData, callback) {
		cs.post('/login', loginData, function (status, user) {
			if (status === bella.constants.response.OK) {
				callback({ success: true }, user);
			} else if (status === bella.constants.response.NOT_FOUND) {
				callback({ success: false });
			}
		});
	},
	logout: function logout(callback) {
		cs.get('logout', function (status) {
			if (status === bella.constants.response.OK) {
				callback({ success: true });
			}
		});
	},
	food: {
		get: function get(categoryId, callback) {
			cs.get('/foods/' + categoryId, function (status, foods) {});
		},
		post: function post(food, callback) {
			var validation = inspector.validate(schemas.food.client, food);

			if (validation.valid) {
				cs.post('/food', food, function (status, food) {
					if (status === bella.constants.response.OK) {
						callback(true, null, food);
					} else {
						callback(false, [{ property: 'server', message: 'error' }]);
					}
				});
			} else {
				callback(validation.valid, validation.error);
			}
		}
	}
};
},{"./helpers/cs":6,"./schemas":7,"schema-inspector":3}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic3JjL3NjcmlwdHMvcXVlc3RfbGlzdF9wYWdlL3F1ZXN0X2xpc3RfcGFnZS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvc2NoZW1hLWluc3BlY3Rvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zY2hlbWEtaW5zcGVjdG9yL2xpYi9zY2hlbWEtaW5zcGVjdG9yLmpzIiwibm9kZV9tb2R1bGVzL3NjaGVtYS1pbnNwZWN0b3Ivbm9kZV9tb2R1bGVzL2FzeW5jL2xpYi9hc3luYy5qcyIsInNyYy9zY3JpcHRzL2hlbHBlcnMvY3MuanMiLCJzcmMvc2NyaXB0cy9zY2hlbWFzLmpzIiwic3JjL3NjcmlwdHMvc2VydmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdGlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcHZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jcycpO1xudmFyIHNlcnZlciA9IHJlcXVpcmUoJy4uL3NlcnZlcicpO1xuXG52YXIgUXVlc3RMaXN0UGFnZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdRdWVzdExpc3RQYWdlJyxcblxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcblx0XHRyZXR1cm4geyBsb2dnZWRJbjogYmVsbGEuZGF0YS51c2VyLmdldCgpLnN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnVzZXJTdGF0dXMuTE9HR0VEX0lOIH07XG5cdH0sXG5cdGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdFx0YmVsbGEuZGF0YS51c2VyLnN1YnNjcmliZShmdW5jdGlvbiAodXNlcikge1xuXHRcdFx0X3RoaXMuc2V0U3RhdGUoeyBsb2dnZWRJbjogdXNlci5zdGF0dXMgPT09IGJlbGxhLmNvbnN0YW50cy51c2VyU3RhdHVzLkxPR0dFRF9JTiB9KTtcblx0XHR9KTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHQnZGl2Jyxcblx0XHRcdHsgY2xhc3NOYW1lOiAnYmMtcXVlc3QtbGlzdC1wYWdlJyB9LFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0J2gxJyxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0J1F1ZXN0cydcblx0XHRcdCksXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFF1ZXN0TGlzdCwgeyBsb2dnZWRJbjogdGhpcy5zdGF0ZS5sb2dnZWRJbiB9KVxuXHRcdCk7XG5cdH1cbn0pO1xuXG52YXIgUXVlc3RMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ1F1ZXN0TGlzdCcsXG5cblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG5cdFx0cmV0dXJuIHsgcXVlc3RMaXN0OiB7fSB9O1xuXHR9LFxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dmFyIF90aGlzMiA9IHRoaXM7XG5cblx0XHRzZXJ2ZXIud2lzaExpc3QuZ2V0KGZ1bmN0aW9uIChyZXN1bHQsIHdpc2hMaXN0KSB7XG5cdFx0XHRfdGhpczIuc2V0U3RhdGUoeyBxdWVzdExpc3Q6IHdpc2hMaXN0IH0pO1xuXHRcdH0pO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHR2YXIgcXVlc3RMaXN0ID0gXy5tYXAodGhpcy5zdGF0ZS5xdWVzdExpc3QsIGZ1bmN0aW9uIChxdWVzdCwga2V5KSB7XG5cdFx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChRdWVzdCwge1xuXHRcdFx0XHRrZXk6IGtleSxcblx0XHRcdFx0cXVlc3RJZDogcXVlc3QuaWQsXG5cdFx0XHRcdHRpdGxlOiBxdWVzdC50aXRsZSxcblx0XHRcdFx0ZGVzY3JpcHRpb246IHF1ZXN0LmRlc2NyaXB0aW9uIH0pO1xuXHRcdH0pO1xuXG5cdFx0dmFyIG5ld1dpc2ggPSB0aGlzLnByb3BzLmxvZ2dlZEluID8gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0bnVsbCxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdhJyxcblx0XHRcdFx0eyBocmVmOiAnL3F1ZXN0Lmh0bWwnIH0sXG5cdFx0XHRcdCdOZXcgUXVlc3QnXG5cdFx0XHQpXG5cdFx0KSA6IG51bGw7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyBjbGFzc05hbWU6ICdiYy1xdWVzdC1saXN0JyB9LFxuXHRcdFx0bmV3V2lzaCxcblx0XHRcdHF1ZXN0TGlzdFxuXHRcdCk7XG5cdH1cbn0pO1xuXG52YXIgUXVlc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnUXVlc3QnLFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBsaW5rID0gJy9xdWVzdC5odG1sP3F1ZXN0X2lkPScgKyB0aGlzLnByb3BzLnF1ZXN0SWQ7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyBjbGFzc05hbWU6ICdiYy1xdWVzdCcgfSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCdzcGFuJyxcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdCd0aXRsZTogJ1xuXHRcdFx0XHQpLFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCdhJyxcblx0XHRcdFx0XHR7IGhyZWY6IGxpbmsgfSxcblx0XHRcdFx0XHR0aGlzLnByb3BzLnRpdGxlXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpO1xuXHR9XG59KTtcblxuUmVhY3RET00ucmVuZGVyKFJlYWN0LmNyZWF0ZUVsZW1lbnQoUXVlc3RMaXN0UGFnZSwgbnVsbCksIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluLXNlY3Rpb24nKSk7IiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuICAgIHZhciBjdXJyZW50UXVldWU7XG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHZhciBpID0gLTE7XG4gICAgICAgIHdoaWxlICgrK2kgPCBsZW4pIHtcbiAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtpXSgpO1xuICAgICAgICB9XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbn1cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgcXVldWUucHVzaChmdW4pO1xuICAgIGlmICghZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvc2NoZW1hLWluc3BlY3RvcicpO1xuIiwiLypcbiAqIFRoaXMgbW9kdWxlIGlzIGludGVuZGVkIHRvIGJlIGV4ZWN1dGVkIGJvdGggb24gY2xpZW50IHNpZGUgYW5kIHNlcnZlciBzaWRlLlxuICogTm8gZXJyb3Igc2hvdWxkIGJlIHRocm93bi4gKHNvZnQgZXJyb3IgaGFuZGxpbmcpXG4gKi9cblxuKGZ1bmN0aW9uICgpIHtcblx0dmFyIHJvb3QgPSB7fTtcblx0Ly8gRGVwZW5kZW5jaWVzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdHJvb3QuYXN5bmMgPSAodHlwZW9mIHJlcXVpcmUgPT09ICdmdW5jdGlvbicpID8gcmVxdWlyZSgnYXN5bmMnKSA6IHdpbmRvdy5hc3luYztcblx0aWYgKHR5cGVvZiByb290LmFzeW5jICE9PSAnb2JqZWN0Jykge1xuXHRcdHRocm93IG5ldyBFcnJvcignTW9kdWxlIGFzeW5jIGlzIHJlcXVpcmVkIChodHRwczovL2dpdGh1Yi5jb20vY2FvbGFuL2FzeW5jKScpO1xuXHR9XG5cdHZhciBhc3luYyA9IHJvb3QuYXN5bmM7XG5cblx0ZnVuY3Rpb24gX2V4dGVuZChvcmlnaW4sIGFkZCkge1xuXHRcdGlmICghYWRkIHx8IHR5cGVvZiBhZGQgIT09ICdvYmplY3QnKSB7XG5cdFx0XHRyZXR1cm4gb3JpZ2luO1xuXHRcdH1cblx0XHR2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZCk7XG5cdFx0dmFyIGkgPSBrZXlzLmxlbmd0aDtcblx0XHR3aGlsZSAoaS0tKSB7XG5cdFx0XHRvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG5cdFx0fVxuXHRcdHJldHVybiBvcmlnaW47XG5cdH1cblxuXHRmdW5jdGlvbiBfbWVyZ2UoKSB7XG5cdFx0dmFyIHJldCA9IHt9O1xuXHRcdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblx0XHR2YXIga2V5cyA9IG51bGw7XG5cdFx0dmFyIGkgPSBudWxsO1xuXG5cdFx0YXJncy5mb3JFYWNoKGZ1bmN0aW9uIChhcmcpIHtcblx0XHRcdGlmIChhcmcgJiYgYXJnLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcblx0XHRcdFx0a2V5cyA9IE9iamVjdC5rZXlzKGFyZyk7XG5cdFx0XHRcdGkgPSBrZXlzLmxlbmd0aDtcblx0XHRcdFx0d2hpbGUgKGktLSkge1xuXHRcdFx0XHRcdHJldFtrZXlzW2ldXSA9IGFyZ1trZXlzW2ldXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHQvLyBDdXN0b21pc2FibGUgY2xhc3MgKEJhc2UgY2xhc3MpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gVXNlIHdpdGggb3BlcmF0aW9uIFwibmV3XCIgdG8gZXh0ZW5kIFZhbGlkYXRpb24gYW5kIFNhbml0aXphdGlvbiB0aGVtc2VsdmVzLFxuXHQvLyBub3QgdGhlaXIgcHJvdG90eXBlLiBJbiBvdGhlciB3b3JkcywgY29uc3RydWN0b3Igc2hhbGwgYmUgY2FsbCB0byBleHRlbmRcblx0Ly8gdGhvc2UgZnVuY3Rpb25zLCBpbnN0ZWFkIG9mIGJlaW5nIGluIHRoZWlyIGNvbnN0cnVjdG9yLCBsaWtlIHRoaXM6XG5cdC8vXHRcdF9leHRlbmQoVmFsaWRhdGlvbiwgbmV3IEN1c3RvbWlzYWJsZSk7XG5cblx0ZnVuY3Rpb24gQ3VzdG9taXNhYmxlKCkge1xuXHRcdHRoaXMuY3VzdG9tID0ge307XG5cblx0XHR0aGlzLmV4dGVuZCA9IGZ1bmN0aW9uIChjdXN0b20pIHtcblx0XHRcdHJldHVybiBfZXh0ZW5kKHRoaXMuY3VzdG9tLCBjdXN0b20pO1xuXHRcdH07XG5cblx0XHR0aGlzLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0dGhpcy5jdXN0b20gPSB7fTtcblx0XHR9O1xuXG5cdFx0dGhpcy5yZW1vdmUgPSBmdW5jdGlvbiAoZmllbGRzKSB7XG5cdFx0XHRpZiAoIV90eXBlSXMuYXJyYXkoZmllbGRzKSkge1xuXHRcdFx0XHRmaWVsZHMgPSBbZmllbGRzXTtcblx0XHRcdH1cblx0XHRcdGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZCkge1xuXHRcdFx0XHRkZWxldGUgdGhpcy5jdXN0b21bZmllbGRdO1xuXHRcdFx0fSwgdGhpcyk7XG5cdFx0fTtcblx0fVxuXG5cdC8vIEluc3BlY3Rpb24gY2xhc3MgKEJhc2UgY2xhc3MpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBVc2UgdG8gZXh0ZW5kIFZhbGlkYXRpb24gYW5kIFNhbml0aXphdGlvbiBwcm90b3R5cGVzLiBJbnNwZWN0aW9uXG5cdC8vIGNvbnN0cnVjdG9yIHNoYWxsIGJlIGNhbGxlZCBpbiBkZXJpdmVkIGNsYXNzIGNvbnN0cnVjdG9yLlxuXG5cdGZ1bmN0aW9uIEluc3BlY3Rpb24oc2NoZW1hLCBjdXN0b20pIHtcblx0XHR2YXIgX3N0YWNrID0gWydAJ107XG5cblx0XHR0aGlzLl9zY2hlbWEgPSBzY2hlbWE7XG5cdFx0dGhpcy5fY3VzdG9tID0ge307XG5cdFx0aWYgKGN1c3RvbSAhPSBudWxsKSB7XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gY3VzdG9tKSB7XG5cdFx0XHRcdGlmIChjdXN0b20uaGFzT3duUHJvcGVydHkoa2V5KSl7XG5cdFx0XHRcdFx0dGhpcy5fY3VzdG9tWyckJyArIGtleV0gPSBjdXN0b21ba2V5XTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuX2dldERlcHRoID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIF9zdGFjay5sZW5ndGg7XG5cdFx0fTtcblxuXHRcdHRoaXMuX2R1bXBTdGFjayA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBfc3RhY2subWFwKGZ1bmN0aW9uIChpKSB7cmV0dXJuIGkucmVwbGFjZSgvXlxcWy9nLCAnXFwwMzNcXDAzNFxcMDM1XFwwMzYnKTt9KVxuXHRcdFx0LmpvaW4oJy4nKS5yZXBsYWNlKC9cXC5cXDAzM1xcMDM0XFwwMzVcXDAzNi9nLCAnWycpO1xuXHRcdH07XG5cblx0XHR0aGlzLl9kZWVwZXJPYmplY3QgPSBmdW5jdGlvbiAobmFtZSkge1xuXHRcdFx0X3N0YWNrLnB1c2goKC9eW2EteiRfXVthLXowLTkkX10qJC9pKS50ZXN0KG5hbWUpID8gbmFtZSA6ICdbXCInICsgbmFtZSArICdcIl0nKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH07XG5cblx0XHR0aGlzLl9kZWVwZXJBcnJheSA9IGZ1bmN0aW9uIChpKSB7XG5cdFx0XHRfc3RhY2sucHVzaCgnWycgKyBpICsgJ10nKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH07XG5cblx0XHR0aGlzLl9iYWNrID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0X3N0YWNrLnBvcCgpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fTtcblx0fVxuXHQvLyBTaW1wbGUgdHlwZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gSWYgdGhlIHByb3BlcnR5IGlzIG5vdCBkZWZpbmVkIG9yIGlzIG5vdCBpbiB0aGlzIGxpc3Q6XG5cdHZhciBfdHlwZUlzID0ge1xuXHRcdFwiZnVuY3Rpb25cIjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdHJldHVybiB0eXBlb2YgZWxlbWVudCA9PT0gJ2Z1bmN0aW9uJztcblx0XHR9LFxuXHRcdFwic3RyaW5nXCI6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gdHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnO1xuXHRcdH0sXG5cdFx0XCJudW1iZXJcIjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdHJldHVybiB0eXBlb2YgZWxlbWVudCA9PT0gJ251bWJlcicgJiYgIWlzTmFOKGVsZW1lbnQpO1xuXHRcdH0sXG5cdFx0XCJpbnRlZ2VyXCI6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gdHlwZW9mIGVsZW1lbnQgPT09ICdudW1iZXInICYmIGVsZW1lbnQgJSAxID09PSAwO1xuXHRcdH0sXG5cdFx0XCJOYU5cIjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdHJldHVybiB0eXBlb2YgZWxlbWVudCA9PT0gJ251bWJlcicgJiYgaXNOYU4oZWxlbWVudCk7XG5cdFx0fSxcblx0XHRcImJvb2xlYW5cIjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdHJldHVybiB0eXBlb2YgZWxlbWVudCA9PT0gJ2Jvb2xlYW4nO1xuXHRcdH0sXG5cdFx0XCJudWxsXCI6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gZWxlbWVudCA9PT0gbnVsbDtcblx0XHR9LFxuXHRcdFwiZGF0ZVwiOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIGVsZW1lbnQgIT0gbnVsbCAmJiBlbGVtZW50IGluc3RhbmNlb2YgRGF0ZTtcblx0XHR9LFxuXHRcdFwib2JqZWN0XCI6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gZWxlbWVudCAhPSBudWxsICYmIGVsZW1lbnQuY29uc3RydWN0b3IgPT09IE9iamVjdDtcblx0XHR9LFxuXHRcdFwiYXJyYXlcIjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdHJldHVybiBlbGVtZW50ICE9IG51bGwgJiYgZWxlbWVudC5jb25zdHJ1Y3RvciA9PT0gQXJyYXk7XG5cdFx0fSxcblx0XHRcImFueVwiOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9O1xuXG5cdGZ1bmN0aW9uIF9zaW1wbGVUeXBlKHR5cGUsIGNhbmRpZGF0ZSkge1xuXHRcdGlmICh0eXBlb2YgdHlwZSA9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRyZXR1cm4gY2FuZGlkYXRlIGluc3RhbmNlb2YgdHlwZTtcblx0XHR9XG5cdFx0dHlwZSA9IHR5cGUgaW4gX3R5cGVJcyA/IHR5cGUgOiAnYW55Jztcblx0XHRyZXR1cm4gX3R5cGVJc1t0eXBlXShjYW5kaWRhdGUpO1xuXHR9XG5cblx0ZnVuY3Rpb24gX3JlYWxUeXBlKGNhbmRpZGF0ZSkge1xuXHRcdGZvciAodmFyIGkgaW4gX3R5cGVJcykge1xuXHRcdFx0aWYgKF9zaW1wbGVUeXBlKGksIGNhbmRpZGF0ZSkpIHtcblx0XHRcdFx0aWYgKGkgIT09ICdhbnknKSB7IHJldHVybiBpOyB9XG5cdFx0XHRcdHJldHVybiAnYW4gaW5zdGFuY2Ugb2YgJyArIGNhbmRpZGF0ZS5jb25zdHJ1Y3Rvci5uYW1lO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGdldEluZGV4ZXMoYSwgdmFsdWUpIHtcblx0XHR2YXIgaW5kZXhlcyA9IFtdO1xuXHRcdHZhciBpID0gYS5pbmRleE9mKHZhbHVlKTtcblxuXHRcdHdoaWxlIChpICE9PSAtMSkge1xuXHRcdFx0aW5kZXhlcy5wdXNoKGkpO1xuXHRcdFx0aSA9IGEuaW5kZXhPZih2YWx1ZSwgaSArIDEpO1xuXHRcdH1cblx0XHRyZXR1cm4gaW5kZXhlcztcblx0fVxuXG5cdC8vIEF2YWlsYWJsZSBmb3JtYXRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHR2YXIgX2Zvcm1hdHMgPSB7XG5cdFx0J3ZvaWQnOiAvXiQvLFxuXHRcdCd1cmwnOiAvXihodHRwcz98ZnRwKTpcXC9cXC8oKCgoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OikqQCk/KCgoXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pXFwuKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSlcXC4oXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pKXwoKChbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuKT8oKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSlcXC4/KSg6XFxkKik/KShcXC8oKChbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApKyhcXC8oKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCkqKSopPyk/KFxcPygoKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCl8W1xcdUUwMDAtXFx1RjhGRl18XFwvfFxcPykqKT8oXFwjKCgoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKXxcXC98XFw/KSopPyQvaSxcblx0XHQnZGF0ZS10aW1lJzogL15cXGR7NH0tXFxkezJ9LVxcZHsyfVRcXGR7Mn06XFxkezJ9OlxcZHsyfShcXC5cXGR7M30pPyhaP3woLXxcXCspXFxkezJ9OlxcZHsyfSkkLyxcblx0XHQnZGF0ZSc6IC9eXFxkezR9LVxcZHsyfS1cXGR7Mn0kLyxcblx0XHQnY29vbERhdGVUaW1lJzogL15cXGR7NH0oLXxcXC8pXFxkezJ9KC18XFwvKVxcZHsyfShUfCApXFxkezJ9OlxcZHsyfTpcXGR7Mn0oXFwuXFxkezN9KT9aPyQvLFxuXHRcdCd0aW1lJzogL15cXGR7Mn1cXDpcXGR7Mn1cXDpcXGR7Mn0kLyxcblx0XHQnY29sb3InOiAvXiMoWzAtOWEtZl0pKyQvaSxcblx0XHQnZW1haWwnOiAvXigoKFthLXpdfFxcZHxbISNcXCQlJidcXCpcXCtcXC1cXC89XFw/XFxeX2B7XFx8fX5dfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSsoXFwuKFthLXpdfFxcZHxbISNcXCQlJidcXCpcXCtcXC1cXC89XFw/XFxeX2B7XFx8fX5dfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSspKil8KChcXHgyMikoKCgoXFx4MjB8XFx4MDkpKihcXHgwZFxceDBhKSk/KFxceDIwfFxceDA5KSspPygoW1xceDAxLVxceDA4XFx4MGJcXHgwY1xceDBlLVxceDFmXFx4N2ZdfFxceDIxfFtcXHgyMy1cXHg1Yl18W1xceDVkLVxceDdlXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KFxcXFwoW1xceDAxLVxceDA5XFx4MGJcXHgwY1xceDBkLVxceDdmXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKSkqKCgoXFx4MjB8XFx4MDkpKihcXHgwZFxceDBhKSk/KFxceDIwfFxceDA5KSspPyhcXHgyMikpKUAoKChbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuKSsoKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSlcXC4/JC9pLFxuXHRcdCdudW1lcmljJzogL15bMC05XSskLyxcblx0XHQnaW50ZWdlcic6IC9eXFwtP1swLTldKyQvLFxuXHRcdCdkZWNpbWFsJzogL15cXC0/WzAtOV0qXFwuP1swLTldKyQvLFxuXHRcdCdhbHBoYSc6IC9eW2Etel0rJC9pLFxuXHRcdCdhbHBoYU51bWVyaWMnOiAvXlthLXowLTldKyQvaSxcblx0XHQnYWxwaGFEYXNoJzogL15bYS16MC05Xy1dKyQvaSxcblx0XHQnamF2YXNjcmlwdCc6IC9eW2Etel9cXCRdW2EtejAtOV9cXCRdKiQvaSxcblx0XHQndXBwZXJTdHJpbmcnOiAvXltBLVogXSokLyxcblx0XHQnbG93ZXJTdHJpbmcnOiAvXlthLXogXSokL1xuXHR9O1xuXG4vLyBWYWxpZGF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHR2YXIgX3ZhbGlkYXRpb25BdHRyaWJ1dCA9IHtcblx0XHRvcHRpb25hbDogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlKSB7XG5cdFx0XHR2YXIgb3B0ID0gdHlwZW9mIHNjaGVtYS5vcHRpb25hbCA9PT0gJ2Jvb2xlYW4nID8gc2NoZW1hLm9wdGlvbmFsIDogKHNjaGVtYS5vcHRpb25hbCA9PT0gJ3RydWUnKTsgLy8gRGVmYXVsdCBpcyBmYWxzZVxuXG5cdFx0XHRpZiAob3B0ID09PSB0cnVlKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlb2YgY2FuZGlkYXRlID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHR0aGlzLnJlcG9ydCgnaXMgbWlzc2luZyBhbmQgbm90IG9wdGlvbmFsJyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR0eXBlOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUpIHtcblx0XHRcdC8vIHJldHVybiBiZWNhdXNlIG9wdGlvbmFsIGZ1bmN0aW9uIGFscmVhZHkgaGFuZGxlIHRoaXMgY2FzZVxuXHRcdFx0aWYgKHR5cGVvZiBjYW5kaWRhdGUgPT09ICd1bmRlZmluZWQnIHx8ICh0eXBlb2Ygc2NoZW1hLnR5cGUgIT09ICdzdHJpbmcnICYmICEoc2NoZW1hLnR5cGUgaW5zdGFuY2VvZiBBcnJheSkgJiYgdHlwZW9mIHNjaGVtYS50eXBlICE9PSAnZnVuY3Rpb24nKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgdHlwZXMgPSBfdHlwZUlzLmFycmF5KHNjaGVtYS50eXBlKSA/IHNjaGVtYS50eXBlIDogW3NjaGVtYS50eXBlXTtcblx0XHRcdHZhciB0eXBlSXNWYWxpZCA9IHR5cGVzLnNvbWUoZnVuY3Rpb24gKHR5cGUpIHtcblx0XHRcdFx0cmV0dXJuIF9zaW1wbGVUeXBlKHR5cGUsIGNhbmRpZGF0ZSk7XG5cdFx0XHR9KTtcblx0XHRcdGlmICghdHlwZUlzVmFsaWQpIHtcblx0XHRcdFx0dHlwZXMgPSB0eXBlcy5tYXAoZnVuY3Rpb24gKHQpIHtyZXR1cm4gdHlwZW9mIHQgPT09ICdmdW5jdGlvbicgPyAnYW5kIGluc3RhbmNlIG9mICcgKyB0Lm5hbWUgOiB0OyB9KTtcblx0XHRcdFx0dGhpcy5yZXBvcnQoJ211c3QgYmUgJyArIHR5cGVzLmpvaW4oJyBvciAnKSArICcsIGJ1dCBpcyAnICsgX3JlYWxUeXBlKGNhbmRpZGF0ZSkpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0dW5pcXVlbmVzczogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlKSB7XG5cdFx0XHRpZiAodHlwZW9mIHNjaGVtYS51bmlxdWVuZXNzID09PSAnc3RyaW5nJykgeyBzY2hlbWEudW5pcXVlbmVzcyA9IChzY2hlbWEudW5pcXVlbmVzcyA9PT0gJ3RydWUnKTsgfVxuXHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEudW5pcXVlbmVzcyAhPT0gJ2Jvb2xlYW4nIHx8IHNjaGVtYS51bmlxdWVuZXNzID09PSBmYWxzZSB8fCAoIV90eXBlSXMuYXJyYXkoY2FuZGlkYXRlKSAmJiB0eXBlb2YgY2FuZGlkYXRlICE9PSAnc3RyaW5nJykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHJlcG9ydGVkID0gW107XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNhbmRpZGF0ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAocmVwb3J0ZWQuaW5kZXhPZihjYW5kaWRhdGVbaV0pID49IDApIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgaW5kZXhlcyA9IGdldEluZGV4ZXMoY2FuZGlkYXRlLCBjYW5kaWRhdGVbaV0pO1xuXHRcdFx0XHRpZiAoaW5kZXhlcy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0cmVwb3J0ZWQucHVzaChjYW5kaWRhdGVbaV0pO1xuXHRcdFx0XHRcdHRoaXMucmVwb3J0KCdoYXMgdmFsdWUgWycgKyBjYW5kaWRhdGVbaV0gKyAnXSBtb3JlIHRoYW4gb25jZSBhdCBpbmRleGVzIFsnICsgaW5kZXhlcy5qb2luKCcsICcpICsgJ10nKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cGF0dGVybjogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHR2YXIgcmVnZXhzID0gc2NoZW1hLnBhdHRlcm47XG5cdFx0XHRpZiAodHlwZW9mIGNhbmRpZGF0ZSAhPT0gJ3N0cmluZycpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIG1hdGNoZXMgPSBmYWxzZTtcblx0XHRcdGlmICghX3R5cGVJcy5hcnJheShyZWdleHMpKSB7XG5cdFx0XHRcdHJlZ2V4cyA9IFtyZWdleHNdO1xuXHRcdFx0fVxuXHRcdFx0cmVnZXhzLmZvckVhY2goZnVuY3Rpb24gKHJlZ2V4KSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgcmVnZXggPT09ICdzdHJpbmcnICYmIHJlZ2V4IGluIF9mb3JtYXRzKSB7XG5cdFx0XHRcdFx0cmVnZXggPSBfZm9ybWF0c1tyZWdleF07XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHJlZ2V4IGluc3RhbmNlb2YgUmVnRXhwKSB7XG5cdFx0XHRcdFx0aWYgKHJlZ2V4LnRlc3QoY2FuZGlkYXRlKSkge1xuXHRcdFx0XHRcdFx0bWF0Y2hlcyA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGlmICghbWF0Y2hlcykge1xuXHRcdFx0XHRzZWxmLnJlcG9ydCgnbXVzdCBtYXRjaCBbJyArIHJlZ2V4cy5qb2luKCcgb3IgJykgKyAnXSwgYnV0IGlzIGVxdWFsIHRvIFwiJyArIGNhbmRpZGF0ZSArICdcIicpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0dmFsaWREYXRlOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUpIHtcblx0XHRcdGlmIChTdHJpbmcoc2NoZW1hLnZhbGlkRGF0ZSkgPT09ICd0cnVlJyAmJiBjYW5kaWRhdGUgaW5zdGFuY2VvZiBEYXRlICYmIGlzTmFOKGNhbmRpZGF0ZS5nZXRUaW1lKCkpKSB7XG5cdFx0XHRcdHRoaXMucmVwb3J0KCdtdXN0IGJlIGEgdmFsaWQgZGF0ZScpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0bWluTGVuZ3RoOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUpIHtcblx0XHRcdGlmICh0eXBlb2YgY2FuZGlkYXRlICE9PSAnc3RyaW5nJyAmJiAhX3R5cGVJcy5hcnJheShjYW5kaWRhdGUpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBtaW5MZW5ndGggPSBOdW1iZXIoc2NoZW1hLm1pbkxlbmd0aCk7XG5cdFx0XHRpZiAoaXNOYU4obWluTGVuZ3RoKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAoY2FuZGlkYXRlLmxlbmd0aCA8IG1pbkxlbmd0aCkge1xuXHRcdFx0XHR0aGlzLnJlcG9ydCgnbXVzdCBiZSBsb25nZXIgdGhhbiAnICsgbWluTGVuZ3RoICsgJyBlbGVtZW50cywgYnV0IGl0IGhhcyAnICsgY2FuZGlkYXRlLmxlbmd0aCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRtYXhMZW5ndGg6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSkge1xuXHRcdFx0aWYgKHR5cGVvZiBjYW5kaWRhdGUgIT09ICdzdHJpbmcnICYmICFfdHlwZUlzLmFycmF5KGNhbmRpZGF0ZSkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIG1heExlbmd0aCA9IE51bWJlcihzY2hlbWEubWF4TGVuZ3RoKTtcblx0XHRcdGlmIChpc05hTihtYXhMZW5ndGgpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmIChjYW5kaWRhdGUubGVuZ3RoID4gbWF4TGVuZ3RoKSB7XG5cdFx0XHRcdHRoaXMucmVwb3J0KCdtdXN0IGJlIHNob3J0ZXIgdGhhbiAnICsgbWF4TGVuZ3RoICsgJyBlbGVtZW50cywgYnV0IGl0IGhhcyAnICsgY2FuZGlkYXRlLmxlbmd0aCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRleGFjdExlbmd0aDogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNhbmRpZGF0ZSAhPT0gJ3N0cmluZycgJiYgIV90eXBlSXMuYXJyYXkoY2FuZGlkYXRlKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgZXhhY3RMZW5ndGggPSBOdW1iZXIoc2NoZW1hLmV4YWN0TGVuZ3RoKTtcblx0XHRcdGlmIChpc05hTihleGFjdExlbmd0aCkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNhbmRpZGF0ZS5sZW5ndGggIT09IGV4YWN0TGVuZ3RoKSB7XG5cdFx0XHRcdHRoaXMucmVwb3J0KCdtdXN0IGhhdmUgZXhhY3RseSAnICsgZXhhY3RMZW5ndGggKyAnIGVsZW1lbnRzLCBidXQgaXQgaGF2ZSAnICsgY2FuZGlkYXRlLmxlbmd0aCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRsdDogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlKSB7XG5cdFx0XHR2YXIgbGltaXQgPSBOdW1iZXIoc2NoZW1hLmx0KTtcblx0XHRcdGlmICh0eXBlb2YgY2FuZGlkYXRlICE9PSAnbnVtYmVyJyB8fCBpc05hTihsaW1pdCkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNhbmRpZGF0ZSA+PSBsaW1pdCkge1xuXHRcdFx0XHR0aGlzLnJlcG9ydCgnbXVzdCBiZSBsZXNzIHRoYW4gJyArIGxpbWl0ICsgJywgYnV0IGlzIGVxdWFsIHRvIFwiJyArIGNhbmRpZGF0ZSArICdcIicpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0bHRlOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUpIHtcblx0XHRcdHZhciBsaW1pdCA9IE51bWJlcihzY2hlbWEubHRlKTtcblx0XHRcdGlmICh0eXBlb2YgY2FuZGlkYXRlICE9PSAnbnVtYmVyJyB8fCBpc05hTihsaW1pdCkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNhbmRpZGF0ZSA+IGxpbWl0KSB7XG5cdFx0XHRcdHRoaXMucmVwb3J0KCdtdXN0IGJlIGxlc3MgdGhhbiBvciBlcXVhbCB0byAnICsgbGltaXQgKyAnLCBidXQgaXMgZXF1YWwgdG8gXCInICsgY2FuZGlkYXRlICsgJ1wiJyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRndDogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlKSB7XG5cdFx0XHR2YXIgbGltaXQgPSBOdW1iZXIoc2NoZW1hLmd0KTtcblx0XHRcdGlmICh0eXBlb2YgY2FuZGlkYXRlICE9PSAnbnVtYmVyJyB8fCBpc05hTihsaW1pdCkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNhbmRpZGF0ZSA8PSBsaW1pdCkge1xuXHRcdFx0XHR0aGlzLnJlcG9ydCgnbXVzdCBiZSBncmVhdGVyIHRoYW4gJyArIGxpbWl0ICsgJywgYnV0IGlzIGVxdWFsIHRvIFwiJyArIGNhbmRpZGF0ZSArICdcIicpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Z3RlOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUpIHtcblx0XHRcdHZhciBsaW1pdCA9IE51bWJlcihzY2hlbWEuZ3RlKTtcblx0XHRcdGlmICh0eXBlb2YgY2FuZGlkYXRlICE9PSAnbnVtYmVyJyB8fCBpc05hTihsaW1pdCkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNhbmRpZGF0ZSA8IGxpbWl0KSB7XG5cdFx0XHRcdHRoaXMucmVwb3J0KCdtdXN0IGJlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byAnICsgbGltaXQgKyAnLCBidXQgaXMgZXF1YWwgdG8gXCInICsgY2FuZGlkYXRlICsgJ1wiJyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRlcTogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNhbmRpZGF0ZSAhPT0gJ251bWJlcicgJiYgdHlwZW9mIGNhbmRpZGF0ZSAhPT0gJ3N0cmluZycgJiYgdHlwZW9mIGNhbmRpZGF0ZSAhPT0gJ2Jvb2xlYW4nKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBsaW1pdCA9IHNjaGVtYS5lcTtcblx0XHRcdGlmICh0eXBlb2YgbGltaXQgIT09ICdudW1iZXInICYmIHR5cGVvZiBsaW1pdCAhPT0gJ3N0cmluZycgJiYgdHlwZW9mIGxpbWl0ICE9PSAnYm9vbGVhbicgJiYgIV90eXBlSXMuYXJyYXkobGltaXQpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmIChfdHlwZUlzLmFycmF5KGxpbWl0KSkge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxpbWl0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aWYgKGNhbmRpZGF0ZSA9PT0gbGltaXRbaV0pIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5yZXBvcnQoJ211c3QgYmUgZXF1YWwgdG8gWycgKyBsaW1pdC5tYXAoZnVuY3Rpb24gKGwpIHtcblx0XHRcdFx0XHRyZXR1cm4gJ1wiJyArIGwgKyAnXCInO1xuXHRcdFx0XHR9KS5qb2luKCcgb3IgJykgKyAnXSwgYnV0IGlzIGVxdWFsIHRvIFwiJyArIGNhbmRpZGF0ZSArICdcIicpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmIChjYW5kaWRhdGUgIT09IGxpbWl0KSB7XG5cdFx0XHRcdFx0dGhpcy5yZXBvcnQoJ211c3QgYmUgZXF1YWwgdG8gXCInICsgbGltaXQgKyAnXCIsIGJ1dCBpcyBlcXVhbCB0byBcIicgKyBjYW5kaWRhdGUgKyAnXCInKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0bmU6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSkge1xuXHRcdFx0aWYgKHR5cGVvZiBjYW5kaWRhdGUgIT09ICdudW1iZXInICYmIHR5cGVvZiBjYW5kaWRhdGUgIT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBsaW1pdCA9IHNjaGVtYS5uZTtcblx0XHRcdGlmICh0eXBlb2YgbGltaXQgIT09ICdudW1iZXInICYmIHR5cGVvZiBsaW1pdCAhPT0gJ3N0cmluZycgJiYgIV90eXBlSXMuYXJyYXkobGltaXQpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmIChfdHlwZUlzLmFycmF5KGxpbWl0KSkge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxpbWl0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aWYgKGNhbmRpZGF0ZSA9PT0gbGltaXRbaV0pIHtcblx0XHRcdFx0XHRcdHRoaXMucmVwb3J0KCdtdXN0IG5vdCBiZSBlcXVhbCB0byBcIicgKyBsaW1pdFtpXSArICdcIicpO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmIChjYW5kaWRhdGUgPT09IGxpbWl0KSB7XG5cdFx0XHRcdFx0dGhpcy5yZXBvcnQoJ211c3Qgbm90IGJlIGVxdWFsIHRvIFwiJyArIGxpbWl0ICsgJ1wiJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdHNvbWVLZXlzOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdCkge1xuXHRcdFx0dmFyIF9rZXlzID0gc2NoZW1hLnNvbWVLZXlzO1xuXHRcdFx0aWYgKCFfdHlwZUlzLm9iamVjdChjYW5kaWRhdCkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHZhbGlkID0gX2tleXMuc29tZShmdW5jdGlvbiAoYWN0aW9uKSB7XG5cdFx0XHRcdHJldHVybiAoYWN0aW9uIGluIGNhbmRpZGF0KTtcblx0XHRcdH0pO1xuXHRcdFx0aWYgKCF2YWxpZCkge1xuXHRcdFx0XHR0aGlzLnJlcG9ydCgnbXVzdCBoYXZlIGF0IGxlYXN0IGtleSAnICsgX2tleXMubWFwKGZ1bmN0aW9uIChpKSB7XG5cdFx0XHRcdFx0cmV0dXJuICdcIicgKyBpICsgJ1wiJztcblx0XHRcdFx0fSkuam9pbignIG9yICcpKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHN0cmljdDogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlKSB7XG5cdFx0XHRpZiAodHlwZW9mIHNjaGVtYS5zdHJpY3QgPT09ICdzdHJpbmcnKSB7IHNjaGVtYS5zdHJpY3QgPSAoc2NoZW1hLnN0cmljdCA9PT0gJ3RydWUnKTsgfVxuXHRcdFx0aWYgKHNjaGVtYS5zdHJpY3QgIT09IHRydWUgfHwgIV90eXBlSXMub2JqZWN0KGNhbmRpZGF0ZSkgfHwgIV90eXBlSXMub2JqZWN0KHNjaGVtYS5wcm9wZXJ0aWVzKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHRpZiAodHlwZW9mIHNjaGVtYS5wcm9wZXJ0aWVzWycqJ10gPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHZhciBpbnRydWRlciA9IE9iamVjdC5rZXlzKGNhbmRpZGF0ZSkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHRyZXR1cm4gKHR5cGVvZiBzY2hlbWEucHJvcGVydGllc1trZXldID09PSAndW5kZWZpbmVkJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAoaW50cnVkZXIubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdHZhciBtc2cgPSAnc2hvdWxkIG5vdCBjb250YWlucyAnICsgKGludHJ1ZGVyLmxlbmd0aCA+IDEgPyAncHJvcGVydGllcycgOiAncHJvcGVydHknKSArXG5cdFx0XHRcdFx0XHQnIFsnICsgaW50cnVkZXIubWFwKGZ1bmN0aW9uIChpKSB7IHJldHVybiAnXCInICsgaSArICdcIic7IH0pLmpvaW4oJywgJykgKyAnXSc7XG5cdFx0XHRcdFx0c2VsZi5yZXBvcnQobXNnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0ZXhlYzogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlLCBjYWxsYmFjaykge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0XHRpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmFzeW5jRXhlYyhzY2hlbWEsIGNhbmRpZGF0ZSwgY2FsbGJhY2spO1xuXHRcdFx0fVxuXHRcdFx0KF90eXBlSXMuYXJyYXkoc2NoZW1hLmV4ZWMpID8gc2NoZW1hLmV4ZWMgOiBbc2NoZW1hLmV4ZWNdKS5mb3JFYWNoKGZ1bmN0aW9uIChleGVjKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZXhlYyA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdGV4ZWMuY2FsbChzZWxmLCBzY2hlbWEsIGNhbmRpZGF0ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0cHJvcGVydGllczogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlLCBjYWxsYmFjaykge1xuXHRcdFx0aWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5hc3luY1Byb3BlcnRpZXMoc2NoZW1hLCBjYW5kaWRhdGUsIGNhbGxiYWNrKTtcblx0XHRcdH1cblx0XHRcdGlmICghKHNjaGVtYS5wcm9wZXJ0aWVzIGluc3RhbmNlb2YgT2JqZWN0KSB8fCAhKGNhbmRpZGF0ZSBpbnN0YW5jZW9mIE9iamVjdCkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHByb3BlcnRpZXMgPSBzY2hlbWEucHJvcGVydGllcyxcblx0XHRcdFx0XHRpO1xuXHRcdFx0aWYgKHByb3BlcnRpZXNbJyonXSAhPSBudWxsKSB7XG5cdFx0XHRcdGZvciAoaSBpbiBjYW5kaWRhdGUpIHtcblx0XHRcdFx0XHRpZiAoaSBpbiBwcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5fZGVlcGVyT2JqZWN0KGkpO1xuXHRcdFx0XHRcdHRoaXMuX3ZhbGlkYXRlKHByb3BlcnRpZXNbJyonXSwgY2FuZGlkYXRlW2ldKTtcblx0XHRcdFx0XHR0aGlzLl9iYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZvciAoaSBpbiBwcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdGlmIChpID09PSAnKicpIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLl9kZWVwZXJPYmplY3QoaSk7XG5cdFx0XHRcdHRoaXMuX3ZhbGlkYXRlKHByb3BlcnRpZXNbaV0sIGNhbmRpZGF0ZVtpXSk7XG5cdFx0XHRcdHRoaXMuX2JhY2soKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGl0ZW1zOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUsIGNhbGxiYWNrKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmFzeW5jSXRlbXMoc2NoZW1hLCBjYW5kaWRhdGUsIGNhbGxiYWNrKTtcblx0XHRcdH1cblx0XHRcdGlmICghKHNjaGVtYS5pdGVtcyBpbnN0YW5jZW9mIE9iamVjdCkgfHwgIShjYW5kaWRhdGUgaW5zdGFuY2VvZiBPYmplY3QpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBpdGVtcyA9IHNjaGVtYS5pdGVtcztcblx0XHRcdHZhciBpLCBsO1xuXHRcdFx0Ly8gSWYgcHJvdmlkZWQgc2NoZW1hIGlzIGFuIGFycmF5XG5cdFx0XHQvLyB0aGVuIGNhbGwgdmFsaWRhdGUgZm9yIGVhY2ggY2FzZVxuXHRcdFx0Ly8gZWxzZSBpdCBpcyBhbiBPYmplY3Rcblx0XHRcdC8vIHRoZW4gY2FsbCB2YWxpZGF0ZSBmb3IgZWFjaCBrZXlcblx0XHRcdGlmIChfdHlwZUlzLmFycmF5KGl0ZW1zKSAmJiBfdHlwZUlzLmFycmF5KGNhbmRpZGF0ZSkpIHtcblx0XHRcdFx0Zm9yIChpID0gMCwgbCA9IGl0ZW1zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHRcdFx0XHRcdHRoaXMuX2RlZXBlckFycmF5KGkpO1xuXHRcdFx0XHRcdHRoaXMuX3ZhbGlkYXRlKGl0ZW1zW2ldLCBjYW5kaWRhdGVbaV0pO1xuXHRcdFx0XHRcdHRoaXMuX2JhY2soKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiBjYW5kaWRhdGUpIHtcblx0XHRcdFx0XHRpZiAoY2FuZGlkYXRlLmhhc093blByb3BlcnR5KGtleSkpe1xuXHRcdFx0XHRcdFx0dGhpcy5fZGVlcGVyQXJyYXkoa2V5KTtcblx0XHRcdFx0XHRcdHRoaXMuX3ZhbGlkYXRlKGl0ZW1zLCBjYW5kaWRhdGVba2V5XSk7XG5cdFx0XHRcdFx0XHR0aGlzLl9iYWNrKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0dmFyIF9hc3luY1ZhbGlkYXRpb25BdHRyaWJ1dCA9IHtcblx0XHRhc3luY0V4ZWM6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSwgY2FsbGJhY2spIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdGFzeW5jLmVhY2hTZXJpZXMoX3R5cGVJcy5hcnJheShzY2hlbWEuZXhlYykgPyBzY2hlbWEuZXhlYyA6IFtzY2hlbWEuZXhlY10sIGZ1bmN0aW9uIChleGVjLCBkb25lKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZXhlYyA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdGlmIChleGVjLmxlbmd0aCA+IDIpIHtcblx0XHRcdFx0XHRcdHJldHVybiBleGVjLmNhbGwoc2VsZiwgc2NoZW1hLCBjYW5kaWRhdGUsIGRvbmUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRleGVjLmNhbGwoc2VsZiwgc2NoZW1hLCBjYW5kaWRhdGUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFzeW5jLm5leHRUaWNrKGRvbmUpO1xuXHRcdFx0fSwgY2FsbGJhY2spO1xuXHRcdH0sXG5cdFx0YXN5bmNQcm9wZXJ0aWVzOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUsIGNhbGxiYWNrKSB7XG5cdFx0XHRpZiAoIShzY2hlbWEucHJvcGVydGllcyBpbnN0YW5jZW9mIE9iamVjdCkgfHwgIV90eXBlSXMub2JqZWN0KGNhbmRpZGF0ZSkpIHtcblx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKCk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHR2YXIgcHJvcGVydGllcyA9IHNjaGVtYS5wcm9wZXJ0aWVzO1xuXHRcdFx0YXN5bmMuc2VyaWVzKFtcblx0XHRcdFx0ZnVuY3Rpb24gKG5leHQpIHtcblx0XHRcdFx0XHRpZiAocHJvcGVydGllc1snKiddID09IG51bGwpIHtcblx0XHRcdFx0XHRcdHJldHVybiBuZXh0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGFzeW5jLmVhY2hTZXJpZXMoT2JqZWN0LmtleXMoY2FuZGlkYXRlKSwgZnVuY3Rpb24gKGksIGRvbmUpIHtcblx0XHRcdFx0XHRcdGlmIChpIGluIHByb3BlcnRpZXMpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGFzeW5jLm5leHRUaWNrKGRvbmUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0c2VsZi5fZGVlcGVyT2JqZWN0KGkpO1xuXHRcdFx0XHRcdFx0c2VsZi5fYXN5bmNWYWxpZGF0ZShwcm9wZXJ0aWVzWycqJ10sIGNhbmRpZGF0ZVtpXSwgZnVuY3Rpb24gKGVycikge1xuXHRcdFx0XHRcdFx0XHRzZWxmLl9iYWNrKCk7XG5cdFx0XHRcdFx0XHRcdGRvbmUoZXJyKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0sIG5leHQpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRmdW5jdGlvbiAobmV4dCkge1xuXHRcdFx0XHRcdGFzeW5jLmVhY2hTZXJpZXMoT2JqZWN0LmtleXMocHJvcGVydGllcyksIGZ1bmN0aW9uIChpLCBkb25lKSB7XG5cdFx0XHRcdFx0XHRpZiAoaSA9PT0gJyonKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBhc3luYy5uZXh0VGljayhkb25lKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHNlbGYuX2RlZXBlck9iamVjdChpKTtcblx0XHRcdFx0XHRcdHNlbGYuX2FzeW5jVmFsaWRhdGUocHJvcGVydGllc1tpXSwgY2FuZGlkYXRlW2ldLCBmdW5jdGlvbiAoZXJyKSB7XG5cdFx0XHRcdFx0XHRcdHNlbGYuX2JhY2soKTtcblx0XHRcdFx0XHRcdFx0ZG9uZShlcnIpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSwgbmV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdF0sIGNhbGxiYWNrKTtcblx0XHR9LFxuXHRcdGFzeW5jSXRlbXM6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSwgY2FsbGJhY2spIHtcblx0XHRcdGlmICghKHNjaGVtYS5pdGVtcyBpbnN0YW5jZW9mIE9iamVjdCkgfHwgIShjYW5kaWRhdGUgaW5zdGFuY2VvZiBPYmplY3QpKSB7XG5cdFx0XHRcdHJldHVybiBjYWxsYmFjaygpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0dmFyIGl0ZW1zID0gc2NoZW1hLml0ZW1zO1xuXHRcdFx0dmFyIGksIGw7XG5cblx0XHRcdGlmIChfdHlwZUlzLmFycmF5KGl0ZW1zKSAmJiBfdHlwZUlzLmFycmF5KGNhbmRpZGF0ZSkpIHtcblx0XHRcdFx0YXN5bmMudGltZXNTZXJpZXMoaXRlbXMubGVuZ3RoLCBmdW5jdGlvbiAoaSwgZG9uZSkge1xuXHRcdFx0XHRcdHNlbGYuX2RlZXBlckFycmF5KGkpO1xuXHRcdFx0XHRcdHNlbGYuX2FzeW5jVmFsaWRhdGUoaXRlbXNbaV0sIGNhbmRpZGF0ZVtpXSwgZnVuY3Rpb24gKGVyciwgcmVzKSB7XG5cdFx0XHRcdFx0XHRzZWxmLl9iYWNrKCk7XG5cdFx0XHRcdFx0XHRkb25lKGVyciwgcmVzKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRzZWxmLl9iYWNrKCk7XG5cdFx0XHRcdH0sIGNhbGxiYWNrKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRhc3luYy5lYWNoU2VyaWVzKE9iamVjdC5rZXlzKGNhbmRpZGF0ZSksIGZ1bmN0aW9uIChrZXksIGRvbmUpIHtcblx0XHRcdFx0XHRzZWxmLl9kZWVwZXJBcnJheShrZXkpO1xuXHRcdFx0XHRcdHNlbGYuX2FzeW5jVmFsaWRhdGUoaXRlbXMsIGNhbmRpZGF0ZVtrZXldLCBmdW5jdGlvbiAoZXJyLCByZXMpIHtcblx0XHRcdFx0XHRcdHNlbGYuX2JhY2soKTtcblx0XHRcdFx0XHRcdGRvbmUoZXJyLCByZXMpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9LCBjYWxsYmFjayk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdC8vIFZhbGlkYXRpb24gQ2xhc3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBpbmhlcml0cyBmcm9tIEluc3BlY3Rpb24gY2xhc3MgKGFjdHVhbGx5IHdlIGp1c3QgY2FsbCBJbnNwZWN0aW9uXG5cdC8vIGNvbnN0cnVjdG9yIHdpdGggdGhlIG5ldyBjb250ZXh0LCBiZWNhdXNlIGl0cyBwcm90b3R5cGUgaXMgZW1wdHlcblx0ZnVuY3Rpb24gVmFsaWRhdGlvbihzY2hlbWEsIGN1c3RvbSkge1xuXHRcdEluc3BlY3Rpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgc2NoZW1hLCBfbWVyZ2UoVmFsaWRhdGlvbi5jdXN0b20sIGN1c3RvbSkpO1xuXHRcdHZhciBfZXJyb3IgPSBbXTtcblxuXHRcdHRoaXMuX2Jhc2ljRmllbGRzID0gT2JqZWN0LmtleXMoX3ZhbGlkYXRpb25BdHRyaWJ1dCk7XG5cdFx0dGhpcy5fY3VzdG9tRmllbGRzID0gT2JqZWN0LmtleXModGhpcy5fY3VzdG9tKTtcblx0XHR0aGlzLm9yaWdpbiA9IG51bGw7XG5cblx0XHR0aGlzLnJlcG9ydCA9IGZ1bmN0aW9uIChtZXNzYWdlLCBjb2RlKSB7XG5cdFx0XHR2YXIgbmV3RXJyID0ge1xuXHRcdFx0XHRjb2RlOiBjb2RlIHx8IHRoaXMudXNlckNvZGUgfHwgbnVsbCxcblx0XHRcdFx0bWVzc2FnZTogdGhpcy51c2VyRXJyb3IgfHwgbWVzc2FnZSB8fCAnaXMgaW52YWxpZCcsXG5cdFx0XHRcdHByb3BlcnR5OiB0aGlzLnVzZXJBbGlhcyA/ICh0aGlzLnVzZXJBbGlhcyArICcgKCcgKyB0aGlzLl9kdW1wU3RhY2soKSArICcpJykgOiB0aGlzLl9kdW1wU3RhY2soKVxuXHRcdFx0fTtcblx0XHRcdF9lcnJvci5wdXNoKG5ld0Vycik7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9O1xuXG5cdFx0dGhpcy5yZXN1bHQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRlcnJvcjogX2Vycm9yLFxuXHRcdFx0XHR2YWxpZDogX2Vycm9yLmxlbmd0aCA9PT0gMCxcblx0XHRcdFx0Zm9ybWF0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0aWYgKHRoaXMudmFsaWQgPT09IHRydWUpIHtcblx0XHRcdFx0XHRcdHJldHVybiAnQ2FuZGlkYXRlIGlzIHZhbGlkJztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZXJyb3IubWFwKGZ1bmN0aW9uIChpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gJ1Byb3BlcnR5ICcgKyBpLnByb3BlcnR5ICsgJzogJyArIGkubWVzc2FnZTtcblx0XHRcdFx0XHR9KS5qb2luKCdcXG4nKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9O1xuXHR9XG5cblx0X2V4dGVuZChWYWxpZGF0aW9uLnByb3RvdHlwZSwgX3ZhbGlkYXRpb25BdHRyaWJ1dCk7XG5cdF9leHRlbmQoVmFsaWRhdGlvbi5wcm90b3R5cGUsIF9hc3luY1ZhbGlkYXRpb25BdHRyaWJ1dCk7XG5cdF9leHRlbmQoVmFsaWRhdGlvbiwgbmV3IEN1c3RvbWlzYWJsZSgpKTtcblxuXHRWYWxpZGF0aW9uLnByb3RvdHlwZS52YWxpZGF0ZSA9IGZ1bmN0aW9uIChjYW5kaWRhdGUsIGNhbGxiYWNrKSB7XG5cdFx0dGhpcy5vcmlnaW4gPSBjYW5kaWRhdGU7XG5cdFx0aWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0cmV0dXJuIGFzeW5jLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0c2VsZi5fYXN5bmNWYWxpZGF0ZShzZWxmLl9zY2hlbWEsIGNhbmRpZGF0ZSwgZnVuY3Rpb24gKGVycikge1xuXHRcdFx0XHRcdHNlbGYub3JpZ2luID0gbnVsbDtcblx0XHRcdFx0XHRjYWxsYmFjayhlcnIsIHNlbGYucmVzdWx0KCkpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fdmFsaWRhdGUodGhpcy5fc2NoZW1hLCBjYW5kaWRhdGUpLnJlc3VsdCgpO1xuXHR9O1xuXG5cdFZhbGlkYXRpb24ucHJvdG90eXBlLl92YWxpZGF0ZSA9IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSwgY2FsbGJhY2spIHtcblx0XHR0aGlzLnVzZXJDb2RlID0gc2NoZW1hLmNvZGUgfHwgbnVsbDtcblx0XHR0aGlzLnVzZXJFcnJvciA9IHNjaGVtYS5lcnJvciB8fCBudWxsO1xuXHRcdHRoaXMudXNlckFsaWFzID0gc2NoZW1hLmFsaWFzIHx8IG51bGw7XG5cdFx0dGhpcy5fYmFzaWNGaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAoaSkge1xuXHRcdFx0aWYgKChpIGluIHNjaGVtYSB8fCBpID09PSAnb3B0aW9uYWwnKSAmJiB0eXBlb2YgdGhpc1tpXSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHR0aGlzW2ldKHNjaGVtYSwgY2FuZGlkYXRlKTtcblx0XHRcdH1cblx0XHR9LCB0aGlzKTtcblx0XHR0aGlzLl9jdXN0b21GaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAoaSkge1xuXHRcdFx0aWYgKGkgaW4gc2NoZW1hICYmIHR5cGVvZiB0aGlzLl9jdXN0b21baV0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0dGhpcy5fY3VzdG9tW2ldLmNhbGwodGhpcywgc2NoZW1hLCBjYW5kaWRhdGUpO1xuXHRcdFx0fVxuXHRcdH0sIHRoaXMpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXG5cdFZhbGlkYXRpb24ucHJvdG90eXBlLl9hc3luY1ZhbGlkYXRlID0gZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlLCBjYWxsYmFjaykge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR0aGlzLnVzZXJDb2RlID0gc2NoZW1hLmNvZGUgfHwgbnVsbDtcblx0XHR0aGlzLnVzZXJFcnJvciA9IHNjaGVtYS5lcnJvciB8fCBudWxsO1xuXHRcdHRoaXMudXNlckFsaWFzID0gc2NoZW1hLmFsaWFzIHx8IG51bGw7XG5cblx0XHRhc3luYy5zZXJpZXMoW1xuXHRcdFx0ZnVuY3Rpb24gKG5leHQpIHtcblx0XHRcdFx0YXN5bmMuZWFjaFNlcmllcyhPYmplY3Qua2V5cyhfdmFsaWRhdGlvbkF0dHJpYnV0KSwgZnVuY3Rpb24gKGksIGRvbmUpIHtcblx0XHRcdFx0XHRhc3luYy5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRpZiAoKGkgaW4gc2NoZW1hIHx8IGkgPT09ICdvcHRpb25hbCcpICYmIHR5cGVvZiBzZWxmW2ldID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChzZWxmW2ldLmxlbmd0aCA+IDIpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc2VsZltpXShzY2hlbWEsIGNhbmRpZGF0ZSwgZG9uZSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0c2VsZltpXShzY2hlbWEsIGNhbmRpZGF0ZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRkb25lKCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0sIG5leHQpO1xuXHRcdFx0fSxcblx0XHRcdGZ1bmN0aW9uIChuZXh0KSB7XG5cdFx0XHRcdGFzeW5jLmVhY2hTZXJpZXMoT2JqZWN0LmtleXMoc2VsZi5fY3VzdG9tKSwgZnVuY3Rpb24gKGksIGRvbmUpIHtcblx0XHRcdFx0XHRhc3luYy5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRpZiAoaSBpbiBzY2hlbWEgJiYgdHlwZW9mIHNlbGYuX2N1c3RvbVtpXSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRpZiAoc2VsZi5fY3VzdG9tW2ldLmxlbmd0aCA+IDIpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc2VsZi5fY3VzdG9tW2ldLmNhbGwoc2VsZiwgc2NoZW1hLCBjYW5kaWRhdGUsIGRvbmUpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHNlbGYuX2N1c3RvbVtpXS5jYWxsKHNlbGYsIHNjaGVtYSwgY2FuZGlkYXRlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGRvbmUoKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSwgbmV4dCk7XG5cdFx0XHR9XG5cdFx0XSwgY2FsbGJhY2spO1xuXHR9O1xuXG4vLyBTYW5pdGl6YXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBmdW5jdGlvbnMgY2FsbGVkIGJ5IF9zYW5pdGl6YXRpb24udHlwZSBtZXRob2QuXG5cdHZhciBfZm9yY2VUeXBlID0ge1xuXHRcdG51bWJlcjogZnVuY3Rpb24gKHBvc3QsIHNjaGVtYSkge1xuXHRcdFx0dmFyIG47XG5cdFx0XHRpZiAodHlwZW9mIHBvc3QgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocG9zdCA9PT0gJycpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEuZGVmICE9PSAndW5kZWZpbmVkJylcblx0XHRcdFx0XHRyZXR1cm4gc2NoZW1hLmRlZjtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgcG9zdCA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0biA9IHBhcnNlRmxvYXQocG9zdC5yZXBsYWNlKC8sL2csICcuJykucmVwbGFjZSgvIC9nLCAnJykpO1xuXHRcdFx0XHRpZiAodHlwZW9mIG4gPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG47XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHBvc3QgaW5zdGFuY2VvZiBEYXRlKSB7XG5cdFx0XHRcdHJldHVybiArcG9zdDtcblx0XHRcdH1cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0sXG5cdFx0aW50ZWdlcjogZnVuY3Rpb24gKHBvc3QsIHNjaGVtYSkge1xuXHRcdFx0dmFyIG47XG5cdFx0XHRpZiAodHlwZW9mIHBvc3QgPT09ICdudW1iZXInICYmIHBvc3QgJSAxID09PSAwKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocG9zdCA9PT0gJycpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEuZGVmICE9PSAndW5kZWZpbmVkJylcblx0XHRcdFx0XHRyZXR1cm4gc2NoZW1hLmRlZjtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgcG9zdCA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0biA9IHBhcnNlSW50KHBvc3QucmVwbGFjZSgvIC9nLCAnJyksIDEwKTtcblx0XHRcdFx0aWYgKHR5cGVvZiBuID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRcdHJldHVybiBuO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgcG9zdCA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0cmV0dXJuIHBhcnNlSW50KHBvc3QsIDEwKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiBwb3N0ID09PSAnYm9vbGVhbicpIHtcblx0XHRcdFx0aWYgKHBvc3QpIHsgcmV0dXJuIDE7IH1cblx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChwb3N0IGluc3RhbmNlb2YgRGF0ZSkge1xuXHRcdFx0XHRyZXR1cm4gK3Bvc3Q7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9LFxuXHRcdHN0cmluZzogZnVuY3Rpb24gKHBvc3QsIHNjaGVtYSkge1xuXHRcdFx0aWYgKHR5cGVvZiBwb3N0ID09PSAnYm9vbGVhbicgfHwgdHlwZW9mIHBvc3QgPT09ICdudW1iZXInIHx8IHBvc3QgaW5zdGFuY2VvZiBEYXRlKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0LnRvU3RyaW5nKCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChfdHlwZUlzLmFycmF5KHBvc3QpKSB7XG5cdFx0XHRcdC8vIElmIHVzZXIgYXV0aG9yaXplIGFycmF5IGFuZCBzdHJpbmdzLi4uXG5cdFx0XHRcdGlmIChzY2hlbWEuaXRlbXMgfHwgc2NoZW1hLnByb3BlcnRpZXMpXG5cdFx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHRcdHJldHVybiBwb3N0LmpvaW4oU3RyaW5nKHNjaGVtYS5qb2luV2l0aCB8fCAnLCcpKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHBvc3QgaW5zdGFuY2VvZiBPYmplY3QpIHtcblx0XHRcdFx0Ly8gSWYgdXNlciBhdXRob3JpemUgb2JqZWN0cyBhbnMgc3RyaW5ncy4uLlxuXHRcdFx0XHRpZiAoc2NoZW1hLml0ZW1zIHx8IHNjaGVtYS5wcm9wZXJ0aWVzKVxuXHRcdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkocG9zdCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgcG9zdCA9PT0gJ3N0cmluZycgJiYgcG9zdC5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9LFxuXHRcdGRhdGU6IGZ1bmN0aW9uIChwb3N0LCBzY2hlbWEpIHtcblx0XHRcdGlmIChwb3N0IGluc3RhbmNlb2YgRGF0ZSkge1xuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR2YXIgZCA9IG5ldyBEYXRlKHBvc3QpO1xuXHRcdFx0XHRpZiAoIWlzTmFOKGQuZ2V0VGltZSgpKSkgeyAvLyBpZiB2YWxpZCBkYXRlXG5cdFx0XHRcdFx0cmV0dXJuIGQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0sXG5cdFx0Ym9vbGVhbjogZnVuY3Rpb24gKHBvc3QsIHNjaGVtYSkge1xuXHRcdFx0aWYgKHR5cGVvZiBwb3N0ID09PSAndW5kZWZpbmVkJykgcmV0dXJuIG51bGw7XG5cdFx0XHRpZiAodHlwZW9mIHBvc3QgPT09ICdzdHJpbmcnICYmIHBvc3QudG9Mb3dlckNhc2UoKSA9PT0gJ2ZhbHNlJykgcmV0dXJuIGZhbHNlO1xuXHRcdFx0cmV0dXJuICEhcG9zdDtcblx0XHR9LFxuXHRcdG9iamVjdDogZnVuY3Rpb24gKHBvc3QsIHNjaGVtYSkge1xuXHRcdFx0aWYgKHR5cGVvZiBwb3N0ICE9PSAnc3RyaW5nJyB8fCBfdHlwZUlzLm9iamVjdChwb3N0KSkge1xuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdH1cblx0XHRcdHRyeSB7XG5cdFx0XHRcdHJldHVybiBKU09OLnBhcnNlKHBvc3QpO1xuXHRcdFx0fVxuXHRcdFx0Y2F0Y2ggKGUpIHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRhcnJheTogZnVuY3Rpb24gKHBvc3QsIHNjaGVtYSkge1xuXHRcdFx0aWYgKF90eXBlSXMuYXJyYXkocG9zdCkpXG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0aWYgKHR5cGVvZiBwb3N0ID09PSAndW5kZWZpbmVkJylcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRpZiAodHlwZW9mIHBvc3QgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdGlmIChwb3N0LnN1YnN0cmluZygwLDEpID09PSAnWycgJiYgcG9zdC5zbGljZSgtMSkgPT09ICddJykge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gSlNPTi5wYXJzZShwb3N0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gcG9zdC5zcGxpdChTdHJpbmcoc2NoZW1hLnNwbGl0V2l0aCB8fCAnLCcpKTtcblxuXHRcdFx0fVxuXHRcdFx0aWYgKCFfdHlwZUlzLmFycmF5KHBvc3QpKVxuXHRcdFx0XHRyZXR1cm4gWyBwb3N0IF07XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH07XG5cblx0dmFyIF9hcHBseVJ1bGVzID0ge1xuXHRcdHVwcGVyOiBmdW5jdGlvbiAocG9zdCkge1xuXHRcdFx0cmV0dXJuIHBvc3QudG9VcHBlckNhc2UoKTtcblx0XHR9LFxuXHRcdGxvd2VyOiBmdW5jdGlvbiAocG9zdCkge1xuXHRcdFx0cmV0dXJuIHBvc3QudG9Mb3dlckNhc2UoKTtcblx0XHR9LFxuXHRcdHRpdGxlOiBmdW5jdGlvbiAocG9zdCkge1xuXHRcdFx0Ly8gRml4IGJ5IHNlYiAocmVwbGFjZSBcXHdcXFMqIGJ5IFxcUyogPT4gZXhlbXBsZSA6IGNvdWNvdSDDp2EgdmEpXG5cdFx0XHRyZXR1cm4gcG9zdC5yZXBsYWNlKC9cXFMqL2csIGZ1bmN0aW9uICh0eHQpIHtcblx0XHRcdFx0cmV0dXJuIHR4dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHR4dC5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0Y2FwaXRhbGl6ZTogZnVuY3Rpb24gKHBvc3QpIHtcblx0XHRcdHJldHVybiBwb3N0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcG9zdC5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKTtcblx0XHR9LFxuXHRcdHVjZmlyc3Q6IGZ1bmN0aW9uIChwb3N0KSB7XG5cdFx0XHRyZXR1cm4gcG9zdC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHBvc3Quc3Vic3RyKDEpO1xuXHRcdH0sXG5cdFx0dHJpbTogZnVuY3Rpb24gKHBvc3QpIHtcblx0XHRcdHJldHVybiBwb3N0LnRyaW0oKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gRXZlcnkgZnVuY3Rpb24gcmV0dXJuIHRoZSBmdXR1cmUgdmFsdWUgb2YgZWFjaCBwcm9wZXJ0eS4gVGhlcmVmb3JlIHlvdVxuXHQvLyBoYXZlIHRvIHJldHVybiBwb3N0IGV2ZW4gaWYgeW91IGRvIG5vdCBjaGFuZ2UgaXRzIHZhbHVlXG5cdHZhciBfc2FuaXRpemF0aW9uQXR0cmlidXQgPSB7XG5cdFx0c3RyaWN0OiBmdW5jdGlvbiAoc2NoZW1hLCBwb3N0KSB7XG5cdFx0XHRpZiAodHlwZW9mIHNjaGVtYS5zdHJpY3QgPT09ICdzdHJpbmcnKSB7IHNjaGVtYS5zdHJpY3QgPSAoc2NoZW1hLnN0cmljdCA9PT0gJ3RydWUnKTsgfVxuXHRcdFx0aWYgKHNjaGVtYS5zdHJpY3QgIT09IHRydWUpXG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0aWYgKCFfdHlwZUlzLm9iamVjdChzY2hlbWEucHJvcGVydGllcykpXG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0aWYgKCFfdHlwZUlzLm9iamVjdChwb3N0KSlcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0XHRPYmplY3Qua2V5cyhwb3N0KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0aWYgKCEoa2V5IGluIHNjaGVtYS5wcm9wZXJ0aWVzKSkge1xuXHRcdFx0XHRcdGRlbGV0ZSBwb3N0W2tleV07XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0fSxcblx0XHRvcHRpb25hbDogZnVuY3Rpb24gKHNjaGVtYSwgcG9zdCkge1xuXHRcdFx0dmFyIG9wdCA9IHR5cGVvZiBzY2hlbWEub3B0aW9uYWwgPT09ICdib29sZWFuJyA/IHNjaGVtYS5vcHRpb25hbCA6IChzY2hlbWEub3B0aW9uYWwgIT09ICdmYWxzZScpOyAvLyBEZWZhdWx0OiB0cnVlXG5cdFx0XHRpZiAob3B0ID09PSB0cnVlKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGVvZiBwb3N0ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdH1cblx0XHRcdHRoaXMucmVwb3J0KCk7XG5cdFx0XHRpZiAoc2NoZW1hLmRlZiA9PT0gRGF0ZSkge1xuXHRcdFx0XHRyZXR1cm4gbmV3IERhdGUoKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBzY2hlbWEuZGVmO1xuXHRcdH0sXG5cdFx0dHlwZTogZnVuY3Rpb24gKHNjaGVtYSwgcG9zdCkge1xuXHRcdFx0Ly8gaWYgKF90eXBlSXNbJ29iamVjdCddKHBvc3QpIHx8IF90eXBlSXMuYXJyYXkocG9zdCkpIHtcblx0XHRcdC8vIFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHQvLyB9XG5cdFx0XHRpZiAodHlwZW9mIHNjaGVtYS50eXBlICE9PSAnc3RyaW5nJyB8fCB0eXBlb2YgX2ZvcmNlVHlwZVtzY2hlbWEudHlwZV0gIT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR9XG5cdFx0XHR2YXIgbjtcblx0XHRcdHZhciBvcHQgPSB0eXBlb2Ygc2NoZW1hLm9wdGlvbmFsID09PSAnYm9vbGVhbicgPyBzY2hlbWEub3B0aW9uYWwgOiB0cnVlO1xuXHRcdFx0aWYgKHR5cGVvZiBfZm9yY2VUeXBlW3NjaGVtYS50eXBlXSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRuID0gX2ZvcmNlVHlwZVtzY2hlbWEudHlwZV0ocG9zdCwgc2NoZW1hKTtcblx0XHRcdFx0aWYgKChuID09PSBudWxsICYmICFvcHQpIHx8ICghbiAmJiBpc05hTihuKSkgfHwgKG4gPT09IG51bGwgJiYgc2NoZW1hLnR5cGUgPT09ICdzdHJpbmcnKSkge1xuXHRcdFx0XHRcdG4gPSBzY2hlbWEuZGVmO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICghb3B0KSB7XG5cdFx0XHRcdG4gPSBzY2hlbWEuZGVmO1xuXHRcdFx0fVxuXHRcdFx0aWYgKChuICE9IG51bGwgfHwgKHR5cGVvZiBzY2hlbWEuZGVmICE9PSAndW5kZWZpbmVkJyAmJiBzY2hlbWEuZGVmID09PSBuKSkgJiYgbiAhPT0gcG9zdCkge1xuXHRcdFx0XHR0aGlzLnJlcG9ydCgpO1xuXHRcdFx0XHRyZXR1cm4gbjtcblx0XHRcdH1cblx0XHRcdHJldHVybiBwb3N0O1xuXHRcdH0sXG5cdFx0cnVsZXM6IGZ1bmN0aW9uIChzY2hlbWEsIHBvc3QpIHtcblx0XHRcdHZhciBydWxlcyA9IHNjaGVtYS5ydWxlcztcblx0XHRcdGlmICh0eXBlb2YgcG9zdCAhPT0gJ3N0cmluZycgfHwgKHR5cGVvZiBydWxlcyAhPT0gJ3N0cmluZycgJiYgIV90eXBlSXMuYXJyYXkocnVsZXMpKSkge1xuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdH1cblx0XHRcdHZhciBtb2RpZmllZCA9IGZhbHNlO1xuXHRcdFx0KF90eXBlSXMuYXJyYXkocnVsZXMpID8gcnVsZXMgOiBbcnVsZXNdKS5mb3JFYWNoKGZ1bmN0aW9uIChydWxlKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgX2FwcGx5UnVsZXNbcnVsZV0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRwb3N0ID0gX2FwcGx5UnVsZXNbcnVsZV0ocG9zdCk7XG5cdFx0XHRcdFx0bW9kaWZpZWQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGlmIChtb2RpZmllZCkge1xuXHRcdFx0XHR0aGlzLnJlcG9ydCgpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0fSxcblx0XHRtaW46IGZ1bmN0aW9uIChzY2hlbWEsIHBvc3QpIHtcblx0XHRcdHZhciBwb3N0VGVzdCA9IE51bWJlcihwb3N0KTtcblx0XHRcdGlmIChpc05hTihwb3N0VGVzdCkpIHtcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR9XG5cdFx0XHR2YXIgbWluID0gTnVtYmVyKHNjaGVtYS5taW4pO1xuXHRcdFx0aWYgKGlzTmFOKG1pbikpIHtcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR9XG5cdFx0XHRpZiAocG9zdFRlc3QgPCBtaW4pIHtcblx0XHRcdFx0dGhpcy5yZXBvcnQoKTtcblx0XHRcdFx0cmV0dXJuIG1pbjtcblx0XHRcdH1cblx0XHRcdHJldHVybiBwb3N0O1xuXHRcdH0sXG5cdFx0bWF4OiBmdW5jdGlvbiAoc2NoZW1hLCBwb3N0KSB7XG5cdFx0XHR2YXIgcG9zdFRlc3QgPSBOdW1iZXIocG9zdCk7XG5cdFx0XHRpZiAoaXNOYU4ocG9zdFRlc3QpKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0fVxuXHRcdFx0dmFyIG1heCA9IE51bWJlcihzY2hlbWEubWF4KTtcblx0XHRcdGlmIChpc05hTihtYXgpKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBvc3RUZXN0ID4gbWF4KSB7XG5cdFx0XHRcdHRoaXMucmVwb3J0KCk7XG5cdFx0XHRcdHJldHVybiBtYXg7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcG9zdDtcblx0XHR9LFxuXHRcdG1pbkxlbmd0aDogZnVuY3Rpb24gKHNjaGVtYSwgcG9zdCkge1xuXHRcdFx0dmFyIGxpbWl0ID0gTnVtYmVyKHNjaGVtYS5taW5MZW5ndGgpO1xuXHRcdFx0aWYgKHR5cGVvZiBwb3N0ICE9PSAnc3RyaW5nJyB8fCBpc05hTihsaW1pdCkgfHwgbGltaXQgPCAwKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0fVxuXHRcdFx0dmFyIHN0ciA9ICcnO1xuXHRcdFx0dmFyIGdhcCA9IGxpbWl0IC0gcG9zdC5sZW5ndGg7XG5cdFx0XHRpZiAoZ2FwID4gMCkge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGdhcDsgaSsrKSB7XG5cdFx0XHRcdFx0c3RyICs9ICctJztcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnJlcG9ydCgpO1xuXHRcdFx0XHRyZXR1cm4gcG9zdCArIHN0cjtcblx0XHRcdH1cblx0XHRcdHJldHVybiBwb3N0O1xuXHRcdH0sXG5cdFx0bWF4TGVuZ3RoOiBmdW5jdGlvbiAoc2NoZW1hLCBwb3N0KSB7XG5cdFx0XHR2YXIgbGltaXQgPSBOdW1iZXIoc2NoZW1hLm1heExlbmd0aCk7XG5cdFx0XHRpZiAodHlwZW9mIHBvc3QgIT09ICdzdHJpbmcnIHx8IGlzTmFOKGxpbWl0KSB8fCBsaW1pdCA8IDApIHtcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR9XG5cdFx0XHRpZiAocG9zdC5sZW5ndGggPiBsaW1pdCkge1xuXHRcdFx0XHR0aGlzLnJlcG9ydCgpO1xuXHRcdFx0XHRyZXR1cm4gcG9zdC5zbGljZSgwLCBsaW1pdCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcG9zdDtcblx0XHR9LFxuXHRcdHByb3BlcnRpZXM6IGZ1bmN0aW9uIChzY2hlbWEsIHBvc3QsIGNhbGxiYWNrKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmFzeW5jUHJvcGVydGllcyhzY2hlbWEsIHBvc3QsIGNhbGxiYWNrKTtcblx0XHRcdH1cblx0XHRcdGlmICghcG9zdCB8fCB0eXBlb2YgcG9zdCAhPT0gJ29iamVjdCcpIHtcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR9XG5cdFx0XHR2YXIgcHJvcGVydGllcyA9IHNjaGVtYS5wcm9wZXJ0aWVzO1xuXHRcdFx0dmFyIHRtcDtcblx0XHRcdHZhciBpO1xuXHRcdFx0aWYgKHR5cGVvZiBwcm9wZXJ0aWVzWycqJ10gIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdGZvciAoaSBpbiBwb3N0KSB7XG5cdFx0XHRcdFx0aWYgKGkgaW4gcHJvcGVydGllcykge1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuX2RlZXBlck9iamVjdChpKTtcblx0XHRcdFx0XHR0bXAgPSB0aGlzLl9zYW5pdGl6ZShzY2hlbWEucHJvcGVydGllc1snKiddLCBwb3N0W2ldKTtcblx0XHRcdFx0XHRpZiAodHlwZW9mIHRtcCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdHBvc3RbaV09IHRtcDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5fYmFjaygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGkgaW4gc2NoZW1hLnByb3BlcnRpZXMpIHtcblx0XHRcdFx0aWYgKGkgIT09ICcqJykge1xuXHRcdFx0XHRcdHRoaXMuX2RlZXBlck9iamVjdChpKTtcblx0XHRcdFx0XHR0bXAgPSB0aGlzLl9zYW5pdGl6ZShzY2hlbWEucHJvcGVydGllc1tpXSwgcG9zdFtpXSk7XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiB0bXAgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHRwb3N0W2ldPSB0bXA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuX2JhY2soKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0fSxcblx0XHRpdGVtczogZnVuY3Rpb24gKHNjaGVtYSwgcG9zdCwgY2FsbGJhY2spIHtcblx0XHRcdGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuYXN5bmNJdGVtcyhzY2hlbWEsIHBvc3QsIGNhbGxiYWNrKTtcblx0XHRcdH1cblx0XHRcdGlmICghKHNjaGVtYS5pdGVtcyBpbnN0YW5jZW9mIE9iamVjdCkgfHwgIShwb3N0IGluc3RhbmNlb2YgT2JqZWN0KSkge1xuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdH1cblx0XHRcdHZhciBpO1xuXHRcdFx0aWYgKF90eXBlSXMuYXJyYXkoc2NoZW1hLml0ZW1zKSAmJiBfdHlwZUlzLmFycmF5KHBvc3QpKSB7XG5cdFx0XHRcdHZhciBtaW5MZW5ndGggPSBzY2hlbWEuaXRlbXMubGVuZ3RoIDwgcG9zdC5sZW5ndGggPyBzY2hlbWEuaXRlbXMubGVuZ3RoIDogcG9zdC5sZW5ndGg7XG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBtaW5MZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHRoaXMuX2RlZXBlckFycmF5KGkpO1xuXHRcdFx0XHRcdHBvc3RbaV0gPSB0aGlzLl9zYW5pdGl6ZShzY2hlbWEuaXRlbXNbaV0sIHBvc3RbaV0pO1xuXHRcdFx0XHRcdHRoaXMuX2JhY2soKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGZvciAoaSBpbiBwb3N0KSB7XG5cdFx0XHRcdFx0dGhpcy5fZGVlcGVyQXJyYXkoaSk7XG5cdFx0XHRcdFx0cG9zdFtpXSA9IHRoaXMuX3Nhbml0aXplKHNjaGVtYS5pdGVtcywgcG9zdFtpXSk7XG5cdFx0XHRcdFx0dGhpcy5fYmFjaygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcG9zdDtcblx0XHR9LFxuXHRcdGV4ZWM6IGZ1bmN0aW9uIChzY2hlbWEsIHBvc3QsIGNhbGxiYWNrKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmFzeW5jRXhlYyhzY2hlbWEsIHBvc3QsIGNhbGxiYWNrKTtcblx0XHRcdH1cblx0XHRcdHZhciBleGVjcyA9IF90eXBlSXMuYXJyYXkoc2NoZW1hLmV4ZWMpID8gc2NoZW1hLmV4ZWMgOiBbc2NoZW1hLmV4ZWNdO1xuXG5cdFx0XHRleGVjcy5mb3JFYWNoKGZ1bmN0aW9uIChleGVjKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZXhlYyA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdHBvc3QgPSBleGVjLmNhbGwodGhpcywgc2NoZW1hLCBwb3N0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgdGhpcyk7XG5cdFx0XHRyZXR1cm4gcG9zdDtcblx0XHR9XG5cdH07XG5cblx0dmFyIF9hc3luY1Nhbml0aXphdGlvbkF0dHJpYnV0ID0ge1xuXHRcdGFzeW5jRXhlYzogZnVuY3Rpb24gKHNjaGVtYSwgcG9zdCwgY2FsbGJhY2spIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdHZhciBleGVjcyA9IF90eXBlSXMuYXJyYXkoc2NoZW1hLmV4ZWMpID8gc2NoZW1hLmV4ZWMgOiBbc2NoZW1hLmV4ZWNdO1xuXG5cdFx0XHRhc3luYy5lYWNoU2VyaWVzKGV4ZWNzLCBmdW5jdGlvbiAoZXhlYywgZG9uZSkge1xuXHRcdFx0XHRpZiAodHlwZW9mIGV4ZWMgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRpZiAoZXhlYy5sZW5ndGggPiAyKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXhlYy5jYWxsKHNlbGYsIHNjaGVtYSwgcG9zdCwgZnVuY3Rpb24gKGVyciwgcmVzKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZG9uZShlcnIpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHBvc3QgPSByZXM7XG5cdFx0XHRcdFx0XHRcdGRvbmUoKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRwb3N0ID0gZXhlYy5jYWxsKHNlbGYsIHNjaGVtYSwgcG9zdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZG9uZSgpO1xuXHRcdFx0fSwgZnVuY3Rpb24gKGVycikge1xuXHRcdFx0XHRjYWxsYmFjayhlcnIsIHBvc3QpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRhc3luY1Byb3BlcnRpZXM6IGZ1bmN0aW9uIChzY2hlbWEsIHBvc3QsIGNhbGxiYWNrKSB7XG5cdFx0XHRpZiAoIXBvc3QgfHwgdHlwZW9mIHBvc3QgIT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdHJldHVybiBjYWxsYmFjayhudWxsLCBwb3N0KTtcblx0XHRcdH1cblx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdHZhciBwcm9wZXJ0aWVzID0gc2NoZW1hLnByb3BlcnRpZXM7XG5cblx0XHRcdGFzeW5jLnNlcmllcyhbXG5cdFx0XHRcdGZ1bmN0aW9uIChuZXh0KSB7XG5cdFx0XHRcdFx0aWYgKHByb3BlcnRpZXNbJyonXSA9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV4dCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR2YXIgZ2xvYmluZyA9IHByb3BlcnRpZXNbJyonXTtcblx0XHRcdFx0XHRhc3luYy5lYWNoU2VyaWVzKE9iamVjdC5rZXlzKHBvc3QpLCBmdW5jdGlvbiAoaSwgbmV4dCkge1xuXHRcdFx0XHRcdFx0aWYgKGkgaW4gcHJvcGVydGllcykge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV4dCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0c2VsZi5fZGVlcGVyT2JqZWN0KGkpO1xuXHRcdFx0XHRcdFx0c2VsZi5fYXN5bmNTYW5pdGl6ZShnbG9iaW5nLCBwb3N0W2ldLCBmdW5jdGlvbiAoZXJyLCByZXMpIHtcblx0XHRcdFx0XHRcdFx0aWYgKGVycikgeyAvKiBFcnJvciBjYW4gc2FmZWx5IGJlIGlnbm9yZWQgaGVyZSAqLyB9XG5cdFx0XHRcdFx0XHRcdGlmICh0eXBlb2YgcmVzICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0XHRcdHBvc3RbaV0gPSByZXM7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0c2VsZi5fYmFjaygpO1xuXHRcdFx0XHRcdFx0XHRuZXh0KCk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9LCBuZXh0KTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZnVuY3Rpb24gKG5leHQpIHtcblx0XHRcdFx0XHRhc3luYy5lYWNoU2VyaWVzKE9iamVjdC5rZXlzKHByb3BlcnRpZXMpLCBmdW5jdGlvbiAoaSwgbmV4dCkge1xuXHRcdFx0XHRcdFx0aWYgKGkgPT09ICcqJykge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV4dCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0c2VsZi5fZGVlcGVyT2JqZWN0KGkpO1xuXHRcdFx0XHRcdFx0c2VsZi5fYXN5bmNTYW5pdGl6ZShwcm9wZXJ0aWVzW2ldLCBwb3N0W2ldLCBmdW5jdGlvbiAoZXJyLCByZXMpIHtcblx0XHRcdFx0XHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBuZXh0KGVycik7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiByZXMgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHRcdFx0cG9zdFtpXSA9IHJlcztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRzZWxmLl9iYWNrKCk7XG5cdFx0XHRcdFx0XHRcdG5leHQoKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0sIG5leHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRdLCBmdW5jdGlvbiAoZXJyKSB7XG5cdFx0XHRcdHJldHVybiBjYWxsYmFjayhlcnIsIHBvc3QpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRhc3luY0l0ZW1zOiBmdW5jdGlvbiAoc2NoZW1hLCBwb3N0LCBjYWxsYmFjaykge1xuXHRcdFx0aWYgKCEoc2NoZW1hLml0ZW1zIGluc3RhbmNlb2YgT2JqZWN0KSB8fCAhKHBvc3QgaW5zdGFuY2VvZiBPYmplY3QpKSB7XG5cdFx0XHRcdHJldHVybiBjYWxsYmFjayhudWxsLCBwb3N0KTtcblx0XHRcdH1cblx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdHZhciBpdGVtcyA9IHNjaGVtYS5pdGVtcztcblx0XHRcdGlmIChfdHlwZUlzLmFycmF5KGl0ZW1zKSAmJiBfdHlwZUlzLmFycmF5KHBvc3QpKSB7XG5cdFx0XHRcdHZhciBtaW5MZW5ndGggPSBpdGVtcy5sZW5ndGggPCBwb3N0Lmxlbmd0aCA/IGl0ZW1zLmxlbmd0aCA6IHBvc3QubGVuZ3RoO1xuXHRcdFx0XHRhc3luYy50aW1lc1NlcmllcyhtaW5MZW5ndGgsIGZ1bmN0aW9uIChpLCBuZXh0KSB7XG5cdFx0XHRcdFx0c2VsZi5fZGVlcGVyQXJyYXkoaSk7XG5cdFx0XHRcdFx0c2VsZi5fYXN5bmNTYW5pdGl6ZShpdGVtc1tpXSwgcG9zdFtpXSwgZnVuY3Rpb24gKGVyciwgcmVzKSB7XG5cdFx0XHRcdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXh0KGVycik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRwb3N0W2ldID0gcmVzO1xuXHRcdFx0XHRcdFx0c2VsZi5fYmFjaygpO1xuXHRcdFx0XHRcdFx0bmV4dCgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9LCBmdW5jdGlvbiAoZXJyKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soZXJyLCBwb3N0KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0YXN5bmMuZWFjaFNlcmllcyhPYmplY3Qua2V5cyhwb3N0KSwgZnVuY3Rpb24gKGtleSwgbmV4dCkge1xuXHRcdFx0XHRcdHNlbGYuX2RlZXBlckFycmF5KGtleSk7XG5cdFx0XHRcdFx0c2VsZi5fYXN5bmNTYW5pdGl6ZShpdGVtcywgcG9zdFtrZXldLCBmdW5jdGlvbiAoZXJyLCByZXMpIHtcblx0XHRcdFx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5leHQoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHBvc3Rba2V5XSA9IHJlcztcblx0XHRcdFx0XHRcdHNlbGYuX2JhY2soKTtcblx0XHRcdFx0XHRcdG5leHQoKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSwgZnVuY3Rpb24gKGVycikge1xuXHRcdFx0XHRcdGNhbGxiYWNrKGVyciwgcG9zdCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIFNhbml0aXphdGlvbiBDbGFzcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBpbmhlcml0cyBmcm9tIEluc3BlY3Rpb24gY2xhc3MgKGFjdHVhbGx5IHdlIGp1c3QgY2FsbCBJbnNwZWN0aW9uXG5cdC8vIGNvbnN0cnVjdG9yIHdpdGggdGhlIG5ldyBjb250ZXh0LCBiZWNhdXNlIGl0cyBwcm90b3R5cGUgaXMgZW1wdHlcblx0ZnVuY3Rpb24gU2FuaXRpemF0aW9uKHNjaGVtYSwgY3VzdG9tKSB7XG5cdFx0SW5zcGVjdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBzY2hlbWEsIF9tZXJnZShTYW5pdGl6YXRpb24uY3VzdG9tLCBjdXN0b20pKTtcblx0XHR2YXIgX3JlcG9ydGluZyA9IFtdO1xuXG5cdFx0dGhpcy5fYmFzaWNGaWVsZHMgPSBPYmplY3Qua2V5cyhfc2FuaXRpemF0aW9uQXR0cmlidXQpO1xuXHRcdHRoaXMuX2N1c3RvbUZpZWxkcyA9IE9iamVjdC5rZXlzKHRoaXMuX2N1c3RvbSk7XG5cdFx0dGhpcy5vcmlnaW4gPSBudWxsO1xuXG5cdFx0dGhpcy5yZXBvcnQgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuXHRcdFx0dmFyIG5ld05vdCA9IHtcblx0XHRcdFx0XHRtZXNzYWdlOiBtZXNzYWdlIHx8ICd3YXMgc2FuaXRpemVkJyxcblx0XHRcdFx0XHRwcm9wZXJ0eTogdGhpcy51c2VyQWxpYXMgPyAodGhpcy51c2VyQWxpYXMgKyAnICgnICsgdGhpcy5fZHVtcFN0YWNrKCkgKyAnKScpIDogdGhpcy5fZHVtcFN0YWNrKClcblx0XHRcdH07XG5cdFx0XHRpZiAoIV9yZXBvcnRpbmcuc29tZShmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5wcm9wZXJ0eSA9PT0gbmV3Tm90LnByb3BlcnR5OyB9KSkge1xuXHRcdFx0XHRfcmVwb3J0aW5nLnB1c2gobmV3Tm90KTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0dGhpcy5yZXN1bHQgPSBmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdFx0cmVwb3J0aW5nOiBfcmVwb3J0aW5nLFxuXHRcdFx0XHRmb3JtYXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5yZXBvcnRpbmcubWFwKGZ1bmN0aW9uIChpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gJ1Byb3BlcnR5ICcgKyBpLnByb3BlcnR5ICsgJyAnICsgaS5tZXNzYWdlO1xuXHRcdFx0XHRcdH0pLmpvaW4oJ1xcbicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH07XG5cdH1cblxuXHRfZXh0ZW5kKFNhbml0aXphdGlvbi5wcm90b3R5cGUsIF9zYW5pdGl6YXRpb25BdHRyaWJ1dCk7XG5cdF9leHRlbmQoU2FuaXRpemF0aW9uLnByb3RvdHlwZSwgX2FzeW5jU2FuaXRpemF0aW9uQXR0cmlidXQpO1xuXHRfZXh0ZW5kKFNhbml0aXphdGlvbiwgbmV3IEN1c3RvbWlzYWJsZSgpKTtcblxuXG5cdFNhbml0aXphdGlvbi5wcm90b3R5cGUuc2FuaXRpemUgPSBmdW5jdGlvbiAocG9zdCwgY2FsbGJhY2spIHtcblx0XHR0aGlzLm9yaWdpbiA9IHBvc3Q7XG5cdFx0aWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0cmV0dXJuIHRoaXMuX2FzeW5jU2FuaXRpemUodGhpcy5fc2NoZW1hLCBwb3N0LCBmdW5jdGlvbiAoZXJyLCBkYXRhKSB7XG5cdFx0XHRcdHNlbGYub3JpZ2luID0gbnVsbDtcblx0XHRcdFx0Y2FsbGJhY2soZXJyLCBzZWxmLnJlc3VsdChkYXRhKSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0dmFyIGRhdGEgPSB0aGlzLl9zYW5pdGl6ZSh0aGlzLl9zY2hlbWEsIHBvc3QpO1xuXHRcdHRoaXMub3JpZ2luID0gbnVsbDtcblx0XHRyZXR1cm4gdGhpcy5yZXN1bHQoZGF0YSk7XG5cdH07XG5cblx0U2FuaXRpemF0aW9uLnByb3RvdHlwZS5fc2FuaXRpemUgPSBmdW5jdGlvbiAoc2NoZW1hLCBwb3N0KSB7XG5cdFx0dGhpcy51c2VyQWxpYXMgPSBzY2hlbWEuYWxpYXMgfHwgbnVsbDtcblx0XHR0aGlzLl9iYXNpY0ZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChpKSB7XG5cdFx0XHRpZiAoKGkgaW4gc2NoZW1hIHx8IGkgPT09ICdvcHRpb25hbCcpICYmIHR5cGVvZiB0aGlzW2ldID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHBvc3QgPSB0aGlzW2ldKHNjaGVtYSwgcG9zdCk7XG5cdFx0XHR9XG5cdFx0fSwgdGhpcyk7XG5cdFx0dGhpcy5fY3VzdG9tRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGkpIHtcblx0XHRcdGlmIChpIGluIHNjaGVtYSAmJiB0eXBlb2YgdGhpcy5fY3VzdG9tW2ldID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHBvc3QgPSB0aGlzLl9jdXN0b21baV0uY2FsbCh0aGlzLCBzY2hlbWEsIHBvc3QpO1xuXHRcdFx0fVxuXHRcdH0sIHRoaXMpO1xuXHRcdHJldHVybiBwb3N0O1xuXHR9O1xuXG5cdFNhbml0aXphdGlvbi5wcm90b3R5cGUuX2FzeW5jU2FuaXRpemUgPSBmdW5jdGlvbiAoc2NoZW1hLCBwb3N0LCBjYWxsYmFjaykge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR0aGlzLnVzZXJBbGlhcyA9IHNjaGVtYS5hbGlhcyB8fCBudWxsO1xuXG5cdFx0YXN5bmMud2F0ZXJmYWxsKFtcblx0XHRcdGZ1bmN0aW9uIChuZXh0KSB7XG5cdFx0XHRcdGFzeW5jLnJlZHVjZShzZWxmLl9iYXNpY0ZpZWxkcywgcG9zdCwgZnVuY3Rpb24gKHZhbHVlLCBpLCBuZXh0KSB7XG5cdFx0XHRcdFx0YXN5bmMubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0aWYgKChpIGluIHNjaGVtYSB8fCBpID09PSAnb3B0aW9uYWwnKSAmJiB0eXBlb2Ygc2VsZltpXSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRpZiAoc2VsZltpXS5sZW5ndGggPiAyKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHNlbGZbaV0oc2NoZW1hLCB2YWx1ZSwgbmV4dCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0dmFsdWUgPSBzZWxmW2ldKHNjaGVtYSwgdmFsdWUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0bmV4dChudWxsLCB2YWx1ZSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0sIG5leHQpO1xuXHRcdFx0fSxcblx0XHRcdGZ1bmN0aW9uIChpbnRlciwgbmV4dCkge1xuXHRcdFx0XHRhc3luYy5yZWR1Y2Uoc2VsZi5fY3VzdG9tRmllbGRzLCBpbnRlciwgZnVuY3Rpb24gKHZhbHVlLCBpLCBuZXh0KSB7XG5cdFx0XHRcdFx0YXN5bmMubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0aWYgKGkgaW4gc2NoZW1hICYmIHR5cGVvZiBzZWxmLl9jdXN0b21baV0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0aWYgKHNlbGYuX2N1c3RvbVtpXS5sZW5ndGggPiAyKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHNlbGYuX2N1c3RvbVtpXS5jYWxsKHNlbGYsIHNjaGVtYSwgdmFsdWUsIG5leHQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHZhbHVlID0gc2VsZi5fY3VzdG9tW2ldLmNhbGwoc2VsZiwgc2NoZW1hLCB2YWx1ZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRuZXh0KG51bGwsIHZhbHVlKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSwgbmV4dCk7XG5cdFx0XHR9XG5cdFx0XSwgY2FsbGJhY2spO1xuXHR9O1xuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdHZhciBJTlRfTUlOID0gLTIxNDc0ODM2NDg7XG5cdHZhciBJTlRfTUFYID0gMjE0NzQ4MzY0NztcblxuXHR2YXIgX3JhbmQgPSB7XG5cdFx0aW50OiBmdW5jdGlvbiAobWluLCBtYXgpIHtcblx0XHRcdHJldHVybiBtaW4gKyAoMCB8IE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpO1xuXHRcdH0sXG5cdFx0ZmxvYXQ6IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuXHRcdFx0cmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW4pO1xuXHRcdH0sXG5cdFx0Ym9vbDogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIChNYXRoLnJhbmRvbSgpID4gMC41KTtcblx0XHR9LFxuXHRcdGNoYXI6IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuXHRcdFx0cmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUodGhpcy5pbnQobWluLCBtYXgpKTtcblx0XHR9LFxuXHRcdGZyb21MaXN0OiBmdW5jdGlvbiAobGlzdCkge1xuXHRcdFx0cmV0dXJuIGxpc3RbdGhpcy5pbnQoMCwgbGlzdC5sZW5ndGggLSAxKV07XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBfZm9ybWF0U2FtcGxlID0ge1xuXHRcdCdkYXRlLXRpbWUnOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXHRcdH0sXG5cdFx0J2RhdGUnOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnJlcGxhY2UoL1QuKiQvLCAnJyk7XG5cdFx0fSxcblx0XHQndGltZSc6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZyh7fSwgeyBob3VyMTI6IGZhbHNlIH0pO1xuXHRcdH0sXG5cdFx0J2NvbG9yJzogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG5cdFx0XHR2YXIgcyA9ICcjJztcblx0XHRcdGlmIChtaW4gPCAxKSB7XG5cdFx0XHRcdG1pbiA9IDE7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBpID0gMCwgbCA9IF9yYW5kLmludChtaW4sIG1heCk7IGkgPCBsOyBpKyspIHtcblx0XHRcdFx0cyArPSBfcmFuZC5mcm9tTGlzdCgnMDEyMzQ1Njc4OWFiY2RlZkFCQ0RFRicpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHM7XG5cdFx0fSxcblx0XHQnbnVtZXJpYyc6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiAnJyArIF9yYW5kLmludCgwLCBJTlRfTUFYKTtcblx0XHR9LFxuXHRcdCdpbnRlZ2VyJzogZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKF9yYW5kLmJvb2woKSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRyZXR1cm4gJy0nICsgdGhpcy5udW1lcmljKCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcy5udW1lcmljKCk7XG5cdFx0fSxcblx0XHQnZGVjaW1hbCc6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiB0aGlzLmludGVnZXIoKSArICcuJyArIHRoaXMubnVtZXJpYygpO1xuXHRcdH0sXG5cdFx0J2FscGhhJzogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG5cdFx0XHR2YXIgcyA9ICcnO1xuXHRcdFx0aWYgKG1pbiA8IDEpIHtcblx0XHRcdFx0bWluID0gMTtcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIGkgPSAwLCBsID0gX3JhbmQuaW50KG1pbiwgbWF4KTsgaSA8IGw7IGkrKykge1xuXHRcdFx0XHRzICs9IF9yYW5kLmZyb21MaXN0KCdhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcztcblx0XHR9LFxuXHRcdCdhbHBoYU51bWVyaWMnOiBmdW5jdGlvbiAobWluLCBtYXgpIHtcblx0XHRcdHZhciBzID0gJyc7XG5cdFx0XHRpZiAobWluIDwgMSkge1xuXHRcdFx0XHRtaW4gPSAxO1xuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSBfcmFuZC5pbnQobWluLCBtYXgpOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHRcdHMgKz0gX3JhbmQuZnJvbUxpc3QoJ2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVowMTIzNDU2Nzg5Jyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcztcblx0XHR9LFxuXHRcdCdhbHBoYURhc2gnOiBmdW5jdGlvbiAobWluLCBtYXgpIHtcblx0XHRcdHZhciBzID0gJyc7XG5cdFx0XHRpZiAobWluIDwgMSkge1xuXHRcdFx0XHRtaW4gPSAxO1xuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSBfcmFuZC5pbnQobWluLCBtYXgpOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHRcdHMgKz0gX3JhbmQuZnJvbUxpc3QoJ18tYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpfLUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaXy0wMTIzNDU2Nzg5Xy0nKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBzO1xuXHRcdH0sXG5cdFx0J2phdmFzY3JpcHQnOiBmdW5jdGlvbiAobWluLCBtYXgpIHtcblx0XHRcdHZhciBzID0gX3JhbmQuZnJvbUxpc3QoJ18kYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpfJEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaXyQnKTtcblx0XHRcdGZvciAodmFyIGkgPSAwLCBsID0gX3JhbmQuaW50KG1pbiwgbWF4IC0gMSk7IGkgPCBsOyBpKyspIHtcblx0XHRcdFx0cyArPSBfcmFuZC5mcm9tTGlzdCgnXyRhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5el8kQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpfJDAxMjM0NTY3ODlfJCcpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHM7XG5cdFx0fVxuXHR9O1xuXG5cdGZ1bmN0aW9uIF9nZXRMaW1pdHMoc2NoZW1hKSB7XG5cdFx0dmFyIG1pbiA9IElOVF9NSU47XG5cdFx0dmFyIG1heCA9IElOVF9NQVg7XG5cblx0XHRpZiAoc2NoZW1hLmd0ZSAhPSBudWxsKSB7XG5cdFx0XHRtaW4gPSBzY2hlbWEuZ3RlO1xuXHRcdH1cblx0XHRlbHNlIGlmIChzY2hlbWEuZ3QgIT0gbnVsbCkge1xuXHRcdFx0bWluID0gc2NoZW1hLmd0ICsgMTtcblx0XHR9XG5cdFx0aWYgKHNjaGVtYS5sdGUgIT0gbnVsbCkge1xuXHRcdFx0bWF4ID0gc2NoZW1hLmx0ZTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoc2NoZW1hLmx0ICE9IG51bGwpIHtcblx0XHRcdG1heCA9IHNjaGVtYS5sdCAtIDE7XG5cdFx0fVxuXHRcdHJldHVybiB7IG1pbjogbWluLCBtYXg6IG1heCB9O1xuXHR9XG5cblx0dmFyIF90eXBlR2VuZXJhdG9yID0ge1xuXHRcdHN0cmluZzogZnVuY3Rpb24gKHNjaGVtYSkge1xuXHRcdFx0aWYgKHNjaGVtYS5lcSAhPSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiBzY2hlbWEuZXE7XG5cdFx0XHR9XG5cdFx0XHR2YXIgcyA9ICcnO1xuXHRcdFx0dmFyIG1pbkxlbmd0aCA9IHNjaGVtYS5taW5MZW5ndGggIT0gbnVsbCA/IHNjaGVtYS5taW5MZW5ndGggOiAwO1xuXHRcdFx0dmFyIG1heExlbmd0aCA9IHNjaGVtYS5tYXhMZW5ndGggIT0gbnVsbCA/IHNjaGVtYS5tYXhMZW5ndGggOiAzMjtcblx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hLnBhdHRlcm4gPT09ICdzdHJpbmcnICYmIHR5cGVvZiBfZm9ybWF0U2FtcGxlW3NjaGVtYS5wYXR0ZXJuXSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRyZXR1cm4gX2Zvcm1hdFNhbXBsZVtzY2hlbWEucGF0dGVybl0obWluTGVuZ3RoLCBtYXhMZW5ndGgpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgbCA9IHNjaGVtYS5leGFjdExlbmd0aCAhPSBudWxsID8gc2NoZW1hLmV4YWN0TGVuZ3RoIDogX3JhbmQuaW50KG1pbkxlbmd0aCwgbWF4TGVuZ3RoKTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHRcdHMgKz0gX3JhbmQuY2hhcigzMiwgMTI2KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBzO1xuXHRcdH0sXG5cdFx0bnVtYmVyOiBmdW5jdGlvbiAoc2NoZW1hKSB7XG5cdFx0XHRpZiAoc2NoZW1hLmVxICE9IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIHNjaGVtYS5lcTtcblx0XHRcdH1cblx0XHRcdHZhciBsaW1pdCA9IF9nZXRMaW1pdHMoc2NoZW1hKTtcblx0XHRcdHZhciBuID0gX3JhbmQuZmxvYXQobGltaXQubWluLCBsaW1pdC5tYXgpO1xuXHRcdFx0aWYgKHNjaGVtYS5uZSAhPSBudWxsKSB7XG5cdFx0XHRcdHZhciBuZSA9IF90eXBlSXMuYXJyYXkoc2NoZW1hLm5lKSA/IHNjaGVtYS5uZSA6IFtzY2hlbWEubmVdO1xuXHRcdFx0XHR3aGlsZSAobmUuaW5kZXhPZihuKSAhPT0gLTEpIHtcblx0XHRcdFx0XHRuID0gX3JhbmQuZmxvYXQobGltaXQubWluLCBsaW1pdC5tYXgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbjtcblx0XHR9LFxuXHRcdGludGVnZXI6IGZ1bmN0aW9uIChzY2hlbWEpIHtcblx0XHRcdGlmIChzY2hlbWEuZXEgIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gc2NoZW1hLmVxO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGxpbWl0ID0gX2dldExpbWl0cyhzY2hlbWEpO1xuXHRcdFx0dmFyIG4gPSBfcmFuZC5pbnQobGltaXQubWluLCBsaW1pdC5tYXgpO1xuXHRcdFx0aWYgKHNjaGVtYS5uZSAhPSBudWxsKSB7XG5cdFx0XHRcdHZhciBuZSA9IF90eXBlSXMuYXJyYXkoc2NoZW1hLm5lKSA/IHNjaGVtYS5uZSA6IFtzY2hlbWEubmVdO1xuXHRcdFx0XHR3aGlsZSAobmUuaW5kZXhPZihuKSAhPT0gLTEpIHtcblx0XHRcdFx0XHRuID0gX3JhbmQuaW50KGxpbWl0Lm1pbiwgbGltaXQubWF4KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG47XG5cdFx0fSxcblx0XHRib29sZWFuOiBmdW5jdGlvbiAoc2NoZW1hKSB7XG5cdFx0XHRpZiAoc2NoZW1hLmVxICE9IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIHNjaGVtYS5lcTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBfcmFuZC5ib29sKCk7XG5cdFx0fSxcblx0XHRcIm51bGxcIjogZnVuY3Rpb24gKHNjaGVtYSkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fSxcblx0XHRkYXRlOiBmdW5jdGlvbiAoc2NoZW1hKSB7XG5cdFx0XHRpZiAoc2NoZW1hLmVxICE9IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIHNjaGVtYS5lcTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuZXcgRGF0ZSgpO1xuXHRcdH0sXG5cdFx0b2JqZWN0OiBmdW5jdGlvbiAoc2NoZW1hKSB7XG5cdFx0XHR2YXIgbyA9IHt9O1xuXHRcdFx0dmFyIHByb3AgPSBzY2hlbWEucHJvcGVydGllcyB8fCB7fTtcblxuXHRcdFx0Zm9yICh2YXIga2V5IGluIHByb3ApIHtcblx0XHRcdFx0aWYgKHByb3AuaGFzT3duUHJvcGVydHkoa2V5KSl7XG5cdFx0XHRcdFx0aWYgKHByb3Bba2V5XS5vcHRpb25hbCA9PT0gdHJ1ZSAmJiBfcmFuZC5ib29sKCkgPT09IHRydWUpIHtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoa2V5ICE9PSAnKicpIHtcblx0XHRcdFx0XHRcdG9ba2V5XSA9IHRoaXMuZ2VuZXJhdGUocHJvcFtrZXldKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHR2YXIgcmsgPSAnX19yYW5kb21fa2V5Xyc7XG5cdFx0XHRcdFx0XHR2YXIgcmFuZG9tS2V5ID0gcmsgKyAwO1xuXHRcdFx0XHRcdFx0dmFyIG4gPSBfcmFuZC5pbnQoMSwgOSk7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMTsgaSA8PSBuOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0aWYgKCEocmFuZG9tS2V5IGluIHByb3ApKSB7XG5cdFx0XHRcdFx0XHRcdFx0b1tyYW5kb21LZXldID0gdGhpcy5nZW5lcmF0ZShwcm9wW2tleV0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJhbmRvbUtleSA9IHJrICsgaTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBvO1xuXHRcdH0sXG5cdFx0YXJyYXk6IGZ1bmN0aW9uIChzY2hlbWEpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdHZhciBpdGVtcyA9IHNjaGVtYS5pdGVtcyB8fCB7fTtcblx0XHRcdHZhciBtaW5MZW5ndGggPSBzY2hlbWEubWluTGVuZ3RoICE9IG51bGwgPyBzY2hlbWEubWluTGVuZ3RoIDogMDtcblx0XHRcdHZhciBtYXhMZW5ndGggPSBzY2hlbWEubWF4TGVuZ3RoICE9IG51bGwgPyBzY2hlbWEubWF4TGVuZ3RoIDogMTY7XG5cdFx0XHR2YXIgdHlwZTtcblx0XHRcdHZhciBjYW5kaWRhdGU7XG5cdFx0XHR2YXIgc2l6ZTtcblx0XHRcdHZhciBpO1xuXG5cdFx0XHRpZiAoX3R5cGVJcy5hcnJheShpdGVtcykpIHtcblx0XHRcdFx0c2l6ZSA9IGl0ZW1zLmxlbmd0aDtcblx0XHRcdFx0aWYgKHNjaGVtYS5leGFjdExlbmd0aCAhPSBudWxsKSB7XG5cdFx0XHRcdFx0c2l6ZSA9IHNjaGVtYS5leGFjdExlbmd0aDtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChzaXplIDwgbWluTGVuZ3RoKSB7XG5cdFx0XHRcdFx0c2l6ZSA9IG1pbkxlbmd0aDtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChzaXplID4gbWF4TGVuZ3RoKSB7XG5cdFx0XHRcdFx0c2l6ZSA9IG1heExlbmd0aDtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYW5kaWRhdGUgPSBuZXcgQXJyYXkoc2l6ZSk7XG5cdFx0XHRcdHR5cGUgPSBudWxsO1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG5cdFx0XHRcdFx0dHlwZSA9IGl0ZW1zW2ldLnR5cGUgfHwgJ2FueSc7XG5cdFx0XHRcdFx0aWYgKF90eXBlSXMuYXJyYXkodHlwZSkpIHtcblx0XHRcdFx0XHRcdHR5cGUgPSB0eXBlW19yYW5kLmludCgwLCB0eXBlLmxlbmd0aCAtIDEpXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FuZGlkYXRlW2ldID0gc2VsZlt0eXBlXShpdGVtc1tpXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRzaXplID0gc2NoZW1hLmV4YWN0TGVuZ3RoICE9IG51bGwgPyBzY2hlbWEuZXhhY3RMZW5ndGggOiBfcmFuZC5pbnQobWluTGVuZ3RoLCBtYXhMZW5ndGgpO1xuXHRcdFx0XHRjYW5kaWRhdGUgPSBuZXcgQXJyYXkoc2l6ZSk7XG5cdFx0XHRcdHR5cGUgPSBpdGVtcy50eXBlIHx8ICdhbnknO1xuXHRcdFx0XHRpZiAoX3R5cGVJcy5hcnJheSh0eXBlKSkge1xuXHRcdFx0XHRcdHR5cGUgPSB0eXBlW19yYW5kLmludCgwLCB0eXBlLmxlbmd0aCAtIDEpXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG5cdFx0XHRcdFx0Y2FuZGlkYXRlW2ldID0gc2VsZlt0eXBlXShpdGVtcyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBjYW5kaWRhdGU7XG5cdFx0fSxcblx0XHRhbnk6IGZ1bmN0aW9uIChzY2hlbWEpIHtcblx0XHRcdHZhciBmaWVsZHMgPSBPYmplY3Qua2V5cyhfdHlwZUdlbmVyYXRvcik7XG5cdFx0XHR2YXIgaSA9IGZpZWxkc1tfcmFuZC5pbnQoMCwgZmllbGRzLmxlbmd0aCAtIDIpXTtcblx0XHRcdHJldHVybiB0aGlzW2ldKHNjaGVtYSk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIENhbmRpZGF0ZUdlbmVyYXRvciBDbGFzcyAoU2luZ2xldG9uKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRmdW5jdGlvbiBDYW5kaWRhdGVHZW5lcmF0b3IoKSB7XG5cdFx0Ly8gTWF5YmUgZXh0ZW5kcyBJbnNwZWN0aW9uIGNsYXNzIHRvbyA/XG5cdH1cblxuXHRfZXh0ZW5kKENhbmRpZGF0ZUdlbmVyYXRvci5wcm90b3R5cGUsIF90eXBlR2VuZXJhdG9yKTtcblxuXHR2YXIgX2luc3RhbmNlID0gbnVsbDtcblx0Q2FuZGlkYXRlR2VuZXJhdG9yLmluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xuXHRcdGlmICghKF9pbnN0YW5jZSBpbnN0YW5jZW9mIENhbmRpZGF0ZUdlbmVyYXRvcikpIHtcblx0XHRcdF9pbnN0YW5jZSA9IG5ldyBDYW5kaWRhdGVHZW5lcmF0b3IoKTtcblx0XHR9XG5cdFx0cmV0dXJuIF9pbnN0YW5jZTtcblx0fTtcblxuXHRDYW5kaWRhdGVHZW5lcmF0b3IucHJvdG90eXBlLmdlbmVyYXRlID0gZnVuY3Rpb24gKHNjaGVtYSkge1xuXHRcdHZhciB0eXBlID0gc2NoZW1hLnR5cGUgfHwgJ2FueSc7XG5cdFx0aWYgKF90eXBlSXMuYXJyYXkodHlwZSkpIHtcblx0XHRcdHR5cGUgPSB0eXBlW19yYW5kLmludCgwLCB0eXBlLmxlbmd0aCAtIDEpXTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXNbdHlwZV0oc2NoZW1hKTtcblx0fTtcblxuLy8gRXhwb3J0cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0dmFyIFNjaGVtYUluc3BlY3RvciA9IHt9O1xuXG5cdC8vIGlmIHNlcnZlci1zaWRlIChub2RlLmpzKSBlbHNlIGNsaWVudC1zaWRlXG5cdGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gU2NoZW1hSW5zcGVjdG9yO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHdpbmRvdy5TY2hlbWFJbnNwZWN0b3IgPSBTY2hlbWFJbnNwZWN0b3I7XG5cdH1cblxuXHRTY2hlbWFJbnNwZWN0b3IubmV3U2FuaXRpemF0aW9uID0gZnVuY3Rpb24gKHNjaGVtYSwgY3VzdG9tKSB7XG5cdFx0cmV0dXJuIG5ldyBTYW5pdGl6YXRpb24oc2NoZW1hLCBjdXN0b20pO1xuXHR9O1xuXG5cdFNjaGVtYUluc3BlY3Rvci5uZXdWYWxpZGF0aW9uID0gZnVuY3Rpb24gKHNjaGVtYSwgY3VzdG9tKSB7XG5cdFx0cmV0dXJuIG5ldyBWYWxpZGF0aW9uKHNjaGVtYSwgY3VzdG9tKTtcblx0fTtcblxuXHRTY2hlbWFJbnNwZWN0b3IuVmFsaWRhdGlvbiA9IFZhbGlkYXRpb247XG5cdFNjaGVtYUluc3BlY3Rvci5TYW5pdGl6YXRpb24gPSBTYW5pdGl6YXRpb247XG5cblx0U2NoZW1hSW5zcGVjdG9yLnNhbml0aXplID0gZnVuY3Rpb24gKHNjaGVtYSwgcG9zdCwgY3VzdG9tLCBjYWxsYmFjaykge1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzICYmIHR5cGVvZiBjdXN0b20gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdGNhbGxiYWNrID0gY3VzdG9tO1xuXHRcdFx0Y3VzdG9tID0gbnVsbDtcblx0XHR9XG5cdFx0cmV0dXJuIG5ldyBTYW5pdGl6YXRpb24oc2NoZW1hLCBjdXN0b20pLnNhbml0aXplKHBvc3QsIGNhbGxiYWNrKTtcblx0fTtcblxuXHRTY2hlbWFJbnNwZWN0b3IudmFsaWRhdGUgPSBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUsIGN1c3RvbSwgY2FsbGJhY2spIHtcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMyAmJiB0eXBlb2YgY3VzdG9tID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRjYWxsYmFjayA9IGN1c3RvbTtcblx0XHRcdGN1c3RvbSA9IG51bGw7XG5cdFx0fVxuXHRcdHJldHVybiBuZXcgVmFsaWRhdGlvbihzY2hlbWEsIGN1c3RvbSkudmFsaWRhdGUoY2FuZGlkYXRlLCBjYWxsYmFjayk7XG5cdH07XG5cblx0U2NoZW1hSW5zcGVjdG9yLmdlbmVyYXRlID0gZnVuY3Rpb24gKHNjaGVtYSwgbikge1xuXHRcdGlmICh0eXBlb2YgbiA9PT0gJ251bWJlcicpIHtcblx0XHRcdHZhciByID0gbmV3IEFycmF5KG4pO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIHtcblx0XHRcdFx0cltpXSA9IENhbmRpZGF0ZUdlbmVyYXRvci5pbnN0YW5jZSgpLmdlbmVyYXRlKHNjaGVtYSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcjtcblx0XHR9XG5cdFx0cmV0dXJuIENhbmRpZGF0ZUdlbmVyYXRvci5pbnN0YW5jZSgpLmdlbmVyYXRlKHNjaGVtYSk7XG5cdH07XG59KSgpO1xuIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCl7XG4vKiFcbiAqIGFzeW5jXG4gKiBodHRwczovL2dpdGh1Yi5jb20vY2FvbGFuL2FzeW5jXG4gKlxuICogQ29weXJpZ2h0IDIwMTAtMjAxNCBDYW9sYW4gTWNNYWhvblxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbihmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgYXN5bmMgPSB7fTtcbiAgICBmdW5jdGlvbiBub29wKCkge31cbiAgICBmdW5jdGlvbiBpZGVudGl0eSh2KSB7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cbiAgICBmdW5jdGlvbiB0b0Jvb2wodikge1xuICAgICAgICByZXR1cm4gISF2O1xuICAgIH1cbiAgICBmdW5jdGlvbiBub3RJZCh2KSB7XG4gICAgICAgIHJldHVybiAhdjtcbiAgICB9XG5cbiAgICAvLyBnbG9iYWwgb24gdGhlIHNlcnZlciwgd2luZG93IGluIHRoZSBicm93c2VyXG4gICAgdmFyIHByZXZpb3VzX2FzeW5jO1xuXG4gICAgLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2AgKGBzZWxmYCkgaW4gdGhlIGJyb3dzZXIsIGBnbG9iYWxgXG4gICAgLy8gb24gdGhlIHNlcnZlciwgb3IgYHRoaXNgIGluIHNvbWUgdmlydHVhbCBtYWNoaW5lcy4gV2UgdXNlIGBzZWxmYFxuICAgIC8vIGluc3RlYWQgb2YgYHdpbmRvd2AgZm9yIGBXZWJXb3JrZXJgIHN1cHBvcnQuXG4gICAgdmFyIHJvb3QgPSB0eXBlb2Ygc2VsZiA9PT0gJ29iamVjdCcgJiYgc2VsZi5zZWxmID09PSBzZWxmICYmIHNlbGYgfHxcbiAgICAgICAgICAgIHR5cGVvZiBnbG9iYWwgPT09ICdvYmplY3QnICYmIGdsb2JhbC5nbG9iYWwgPT09IGdsb2JhbCAmJiBnbG9iYWwgfHxcbiAgICAgICAgICAgIHRoaXM7XG5cbiAgICBpZiAocm9vdCAhPSBudWxsKSB7XG4gICAgICAgIHByZXZpb3VzX2FzeW5jID0gcm9vdC5hc3luYztcbiAgICB9XG5cbiAgICBhc3luYy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByb290LmFzeW5jID0gcHJldmlvdXNfYXN5bmM7XG4gICAgICAgIHJldHVybiBhc3luYztcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gb25seV9vbmNlKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChmbiA9PT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbGJhY2sgd2FzIGFscmVhZHkgY2FsbGVkLlwiKTtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBmbiA9IG51bGw7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX29uY2UoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGZuID09PSBudWxsKSByZXR1cm47XG4gICAgICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgZm4gPSBudWxsO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vLy8gY3Jvc3MtYnJvd3NlciBjb21wYXRpYmxpdHkgZnVuY3Rpb25zIC8vLy9cblxuICAgIHZhciBfdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4gICAgdmFyIF9pc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHJldHVybiBfdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIH07XG5cbiAgICAvLyBQb3J0ZWQgZnJvbSB1bmRlcnNjb3JlLmpzIGlzT2JqZWN0XG4gICAgdmFyIF9pc09iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgICAgIHJldHVybiB0eXBlID09PSAnZnVuY3Rpb24nIHx8IHR5cGUgPT09ICdvYmplY3QnICYmICEhb2JqO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfaXNBcnJheUxpa2UoYXJyKSB7XG4gICAgICAgIHJldHVybiBfaXNBcnJheShhcnIpIHx8IChcbiAgICAgICAgICAgIC8vIGhhcyBhIHBvc2l0aXZlIGludGVnZXIgbGVuZ3RoIHByb3BlcnR5XG4gICAgICAgICAgICB0eXBlb2YgYXJyLmxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgYXJyLmxlbmd0aCA+PSAwICYmXG4gICAgICAgICAgICBhcnIubGVuZ3RoICUgMSA9PT0gMFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hcnJheUVhY2goYXJyLCBpdGVyYXRvcikge1xuICAgICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGFyci5sZW5ndGg7XG5cbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKGFycltpbmRleF0sIGluZGV4LCBhcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX21hcChhcnIsIGl0ZXJhdG9yKSB7XG4gICAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gYXJyLmxlbmd0aCxcbiAgICAgICAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRvcihhcnJbaW5kZXhdLCBpbmRleCwgYXJyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yYW5nZShjb3VudCkge1xuICAgICAgICByZXR1cm4gX21hcChBcnJheShjb3VudCksIGZ1bmN0aW9uICh2LCBpKSB7IHJldHVybiBpOyB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmVkdWNlKGFyciwgaXRlcmF0b3IsIG1lbW8pIHtcbiAgICAgICAgX2FycmF5RWFjaChhcnIsIGZ1bmN0aW9uICh4LCBpLCBhKSB7XG4gICAgICAgICAgICBtZW1vID0gaXRlcmF0b3IobWVtbywgeCwgaSwgYSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbWVtbztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZm9yRWFjaE9mKG9iamVjdCwgaXRlcmF0b3IpIHtcbiAgICAgICAgX2FycmF5RWFjaChfa2V5cyhvYmplY3QpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBpdGVyYXRvcihvYmplY3Rba2V5XSwga2V5KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2luZGV4T2YoYXJyLCBpdGVtKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYXJyW2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgdmFyIF9rZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIga2V5cyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrIGluIG9iaikge1xuICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgICAgIGtleXMucHVzaChrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ga2V5cztcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2tleUl0ZXJhdG9yKGNvbGwpIHtcbiAgICAgICAgdmFyIGkgPSAtMTtcbiAgICAgICAgdmFyIGxlbjtcbiAgICAgICAgdmFyIGtleXM7XG4gICAgICAgIGlmIChfaXNBcnJheUxpa2UoY29sbCkpIHtcbiAgICAgICAgICAgIGxlbiA9IGNvbGwubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIHJldHVybiBpIDwgbGVuID8gaSA6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2V5cyA9IF9rZXlzKGNvbGwpO1xuICAgICAgICAgICAgbGVuID0ga2V5cy5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgPCBsZW4gPyBrZXlzW2ldIDogbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTaW1pbGFyIHRvIEVTNidzIHJlc3QgcGFyYW0gKGh0dHA6Ly9hcml5YS5vZmlsYWJzLmNvbS8yMDEzLzAzL2VzNi1hbmQtcmVzdC1wYXJhbWV0ZXIuaHRtbClcbiAgICAvLyBUaGlzIGFjY3VtdWxhdGVzIHRoZSBhcmd1bWVudHMgcGFzc2VkIGludG8gYW4gYXJyYXksIGFmdGVyIGEgZ2l2ZW4gaW5kZXguXG4gICAgLy8gRnJvbSB1bmRlcnNjb3JlLmpzIChodHRwczovL2dpdGh1Yi5jb20vamFzaGtlbmFzL3VuZGVyc2NvcmUvcHVsbC8yMTQwKS5cbiAgICBmdW5jdGlvbiBfcmVzdFBhcmFtKGZ1bmMsIHN0YXJ0SW5kZXgpIHtcbiAgICAgICAgc3RhcnRJbmRleCA9IHN0YXJ0SW5kZXggPT0gbnVsbCA/IGZ1bmMubGVuZ3RoIC0gMSA6ICtzdGFydEluZGV4O1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbGVuZ3RoID0gTWF0aC5tYXgoYXJndW1lbnRzLmxlbmd0aCAtIHN0YXJ0SW5kZXgsIDApO1xuICAgICAgICAgICAgdmFyIHJlc3QgPSBBcnJheShsZW5ndGgpO1xuICAgICAgICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgICAgIHJlc3RbaW5kZXhdID0gYXJndW1lbnRzW2luZGV4ICsgc3RhcnRJbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzd2l0Y2ggKHN0YXJ0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IHJldHVybiBmdW5jLmNhbGwodGhpcywgcmVzdCk7XG4gICAgICAgICAgICAgICAgY2FzZSAxOiByZXR1cm4gZnVuYy5jYWxsKHRoaXMsIGFyZ3VtZW50c1swXSwgcmVzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDdXJyZW50bHkgdW51c2VkIGJ1dCBoYW5kbGUgY2FzZXMgb3V0c2lkZSBvZiB0aGUgc3dpdGNoIHN0YXRlbWVudDpcbiAgICAgICAgICAgIC8vIHZhciBhcmdzID0gQXJyYXkoc3RhcnRJbmRleCArIDEpO1xuICAgICAgICAgICAgLy8gZm9yIChpbmRleCA9IDA7IGluZGV4IDwgc3RhcnRJbmRleDsgaW5kZXgrKykge1xuICAgICAgICAgICAgLy8gICAgIGFyZ3NbaW5kZXhdID0gYXJndW1lbnRzW2luZGV4XTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIGFyZ3Nbc3RhcnRJbmRleF0gPSByZXN0O1xuICAgICAgICAgICAgLy8gcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3dpdGhvdXRJbmRleChpdGVyYXRvcikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRvcih2YWx1ZSwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vLy8gZXhwb3J0ZWQgYXN5bmMgbW9kdWxlIGZ1bmN0aW9ucyAvLy8vXG5cbiAgICAvLy8vIG5leHRUaWNrIGltcGxlbWVudGF0aW9uIHdpdGggYnJvd3Nlci1jb21wYXRpYmxlIGZhbGxiYWNrIC8vLy9cblxuICAgIC8vIGNhcHR1cmUgdGhlIGdsb2JhbCByZWZlcmVuY2UgdG8gZ3VhcmQgYWdhaW5zdCBmYWtlVGltZXIgbW9ja3NcbiAgICB2YXIgX3NldEltbWVkaWF0ZSA9IHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicgJiYgc2V0SW1tZWRpYXRlO1xuXG4gICAgdmFyIF9kZWxheSA9IF9zZXRJbW1lZGlhdGUgPyBmdW5jdGlvbihmbikge1xuICAgICAgICAvLyBub3QgYSBkaXJlY3QgYWxpYXMgZm9yIElFMTAgY29tcGF0aWJpbGl0eVxuICAgICAgICBfc2V0SW1tZWRpYXRlKGZuKTtcbiAgICB9IDogZnVuY3Rpb24oZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcblxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHByb2Nlc3MubmV4dFRpY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgYXN5bmMubmV4dFRpY2sgPSBwcm9jZXNzLm5leHRUaWNrO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGFzeW5jLm5leHRUaWNrID0gX2RlbGF5O1xuICAgIH1cbiAgICBhc3luYy5zZXRJbW1lZGlhdGUgPSBfc2V0SW1tZWRpYXRlID8gX2RlbGF5IDogYXN5bmMubmV4dFRpY2s7XG5cblxuICAgIGFzeW5jLmZvckVhY2ggPVxuICAgIGFzeW5jLmVhY2ggPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLmVhY2hPZihhcnIsIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmZvckVhY2hTZXJpZXMgPVxuICAgIGFzeW5jLmVhY2hTZXJpZXMgPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLmVhY2hPZlNlcmllcyhhcnIsIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpLCBjYWxsYmFjayk7XG4gICAgfTtcblxuXG4gICAgYXN5bmMuZm9yRWFjaExpbWl0ID1cbiAgICBhc3luYy5lYWNoTGltaXQgPSBmdW5jdGlvbiAoYXJyLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBfZWFjaE9mTGltaXQobGltaXQpKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaE9mID1cbiAgICBhc3luYy5lYWNoT2YgPSBmdW5jdGlvbiAob2JqZWN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgb2JqZWN0ID0gb2JqZWN0IHx8IFtdO1xuXG4gICAgICAgIHZhciBpdGVyID0gX2tleUl0ZXJhdG9yKG9iamVjdCk7XG4gICAgICAgIHZhciBrZXksIGNvbXBsZXRlZCA9IDA7XG5cbiAgICAgICAgd2hpbGUgKChrZXkgPSBpdGVyKCkpICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbXBsZXRlZCArPSAxO1xuICAgICAgICAgICAgaXRlcmF0b3Iob2JqZWN0W2tleV0sIGtleSwgb25seV9vbmNlKGRvbmUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb21wbGV0ZWQgPT09IDApIGNhbGxiYWNrKG51bGwpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGRvbmUoZXJyKSB7XG4gICAgICAgICAgICBjb21wbGV0ZWQtLTtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ2hlY2sga2V5IGlzIG51bGwgaW4gY2FzZSBpdGVyYXRvciBpc24ndCBleGhhdXN0ZWRcbiAgICAgICAgICAgIC8vIGFuZCBkb25lIHJlc29sdmVkIHN5bmNocm9ub3VzbHkuXG4gICAgICAgICAgICBlbHNlIGlmIChrZXkgPT09IG51bGwgJiYgY29tcGxldGVkIDw9IDApIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoT2ZTZXJpZXMgPVxuICAgIGFzeW5jLmVhY2hPZlNlcmllcyA9IGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBvYmogPSBvYmogfHwgW107XG4gICAgICAgIHZhciBuZXh0S2V5ID0gX2tleUl0ZXJhdG9yKG9iaik7XG4gICAgICAgIHZhciBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgIGZ1bmN0aW9uIGl0ZXJhdGUoKSB7XG4gICAgICAgICAgICB2YXIgc3luYyA9IHRydWU7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlcmF0b3Iob2JqW2tleV0sIGtleSwgb25seV9vbmNlKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKGl0ZXJhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVyYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBzeW5jID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaXRlcmF0ZSgpO1xuICAgIH07XG5cblxuXG4gICAgYXN5bmMuZm9yRWFjaE9mTGltaXQgPVxuICAgIGFzeW5jLmVhY2hPZkxpbWl0ID0gZnVuY3Rpb24gKG9iaiwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBfZWFjaE9mTGltaXQobGltaXQpKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2VhY2hPZkxpbWl0KGxpbWl0KSB7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgICAgIG9iaiA9IG9iaiB8fCBbXTtcbiAgICAgICAgICAgIHZhciBuZXh0S2V5ID0gX2tleUl0ZXJhdG9yKG9iaik7XG4gICAgICAgICAgICBpZiAobGltaXQgPD0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBkb25lID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgcnVubmluZyA9IDA7XG4gICAgICAgICAgICB2YXIgZXJyb3JlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAoZnVuY3Rpb24gcmVwbGVuaXNoICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoZG9uZSAmJiBydW5uaW5nIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdoaWxlIChydW5uaW5nIDwgbGltaXQgJiYgIWVycm9yZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVubmluZyA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcnVubmluZyArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpdGVyYXRvcihvYmpba2V5XSwga2V5LCBvbmx5X29uY2UoZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVubmluZyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBsZW5pc2goKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH07XG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBkb1BhcmFsbGVsKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBmbihhc3luYy5lYWNoT2YsIG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZG9QYXJhbGxlbExpbWl0KGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oX2VhY2hPZkxpbWl0KGxpbWl0KSwgb2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBkb1Nlcmllcyhmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oYXN5bmMuZWFjaE9mU2VyaWVzLCBvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FzeW5jTWFwKGVhY2hmbiwgYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgYXJyID0gYXJyIHx8IFtdO1xuICAgICAgICB2YXIgcmVzdWx0cyA9IF9pc0FycmF5TGlrZShhcnIpID8gW10gOiB7fTtcbiAgICAgICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHZhbHVlLCBmdW5jdGlvbiAoZXJyLCB2KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0c1tpbmRleF0gPSB2O1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMubWFwID0gZG9QYXJhbGxlbChfYXN5bmNNYXApO1xuICAgIGFzeW5jLm1hcFNlcmllcyA9IGRvU2VyaWVzKF9hc3luY01hcCk7XG4gICAgYXN5bmMubWFwTGltaXQgPSBkb1BhcmFsbGVsTGltaXQoX2FzeW5jTWFwKTtcblxuICAgIC8vIHJlZHVjZSBvbmx5IGhhcyBhIHNlcmllcyB2ZXJzaW9uLCBhcyBkb2luZyByZWR1Y2UgaW4gcGFyYWxsZWwgd29uJ3RcbiAgICAvLyB3b3JrIGluIG1hbnkgc2l0dWF0aW9ucy5cbiAgICBhc3luYy5pbmplY3QgPVxuICAgIGFzeW5jLmZvbGRsID1cbiAgICBhc3luYy5yZWR1Y2UgPSBmdW5jdGlvbiAoYXJyLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgYXN5bmMuZWFjaE9mU2VyaWVzKGFyciwgZnVuY3Rpb24gKHgsIGksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcihtZW1vLCB4LCBmdW5jdGlvbiAoZXJyLCB2KSB7XG4gICAgICAgICAgICAgICAgbWVtbyA9IHY7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIG1lbW8pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9sZHIgPVxuICAgIGFzeW5jLnJlZHVjZVJpZ2h0ID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXZlcnNlZCA9IF9tYXAoYXJyLCBpZGVudGl0eSkucmV2ZXJzZSgpO1xuICAgICAgICBhc3luYy5yZWR1Y2UocmV2ZXJzZWQsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnRyYW5zZm9ybSA9IGZ1bmN0aW9uIChhcnIsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBpdGVyYXRvcjtcbiAgICAgICAgICAgIGl0ZXJhdG9yID0gbWVtbztcbiAgICAgICAgICAgIG1lbW8gPSBfaXNBcnJheShhcnIpID8gW10gOiB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzeW5jLmVhY2hPZihhcnIsIGZ1bmN0aW9uKHYsIGssIGNiKSB7XG4gICAgICAgICAgICBpdGVyYXRvcihtZW1vLCB2LCBrLCBjYik7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCBtZW1vKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9maWx0ZXIoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAoeCwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7aW5kZXg6IGluZGV4LCB2YWx1ZTogeH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKF9tYXAocmVzdWx0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuICAgICAgICAgICAgfSksIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHgudmFsdWU7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLnNlbGVjdCA9XG4gICAgYXN5bmMuZmlsdGVyID0gZG9QYXJhbGxlbChfZmlsdGVyKTtcblxuICAgIGFzeW5jLnNlbGVjdExpbWl0ID1cbiAgICBhc3luYy5maWx0ZXJMaW1pdCA9IGRvUGFyYWxsZWxMaW1pdChfZmlsdGVyKTtcblxuICAgIGFzeW5jLnNlbGVjdFNlcmllcyA9XG4gICAgYXN5bmMuZmlsdGVyU2VyaWVzID0gZG9TZXJpZXMoX2ZpbHRlcik7XG5cbiAgICBmdW5jdGlvbiBfcmVqZWN0KGVhY2hmbiwgYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgX2ZpbHRlcihlYWNoZm4sIGFyciwgZnVuY3Rpb24odmFsdWUsIGNiKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih2YWx1ZSwgZnVuY3Rpb24odikge1xuICAgICAgICAgICAgICAgIGNiKCF2KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGFzeW5jLnJlamVjdCA9IGRvUGFyYWxsZWwoX3JlamVjdCk7XG4gICAgYXN5bmMucmVqZWN0TGltaXQgPSBkb1BhcmFsbGVsTGltaXQoX3JlamVjdCk7XG4gICAgYXN5bmMucmVqZWN0U2VyaWVzID0gZG9TZXJpZXMoX3JlamVjdCk7XG5cbiAgICBmdW5jdGlvbiBfY3JlYXRlVGVzdGVyKGVhY2hmbiwgY2hlY2ssIGdldFJlc3VsdCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXJyLCBsaW1pdCwgaXRlcmF0b3IsIGNiKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBkb25lKCkge1xuICAgICAgICAgICAgICAgIGlmIChjYikgY2IoZ2V0UmVzdWx0KGZhbHNlLCB2b2lkIDApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGl0ZXJhdGVlKHgsIF8sIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjYikgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IoeCwgZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNiICYmIGNoZWNrKHYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYihnZXRSZXN1bHQodHJ1ZSwgeCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IgPSBpdGVyYXRvciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDMpIHtcbiAgICAgICAgICAgICAgICBlYWNoZm4oYXJyLCBsaW1pdCwgaXRlcmF0ZWUsIGRvbmUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYiA9IGl0ZXJhdG9yO1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yID0gbGltaXQ7XG4gICAgICAgICAgICAgICAgZWFjaGZuKGFyciwgaXRlcmF0ZWUsIGRvbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFzeW5jLmFueSA9XG4gICAgYXN5bmMuc29tZSA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mLCB0b0Jvb2wsIGlkZW50aXR5KTtcblxuICAgIGFzeW5jLnNvbWVMaW1pdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mTGltaXQsIHRvQm9vbCwgaWRlbnRpdHkpO1xuXG4gICAgYXN5bmMuYWxsID1cbiAgICBhc3luYy5ldmVyeSA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mLCBub3RJZCwgbm90SWQpO1xuXG4gICAgYXN5bmMuZXZlcnlMaW1pdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mTGltaXQsIG5vdElkLCBub3RJZCk7XG5cbiAgICBmdW5jdGlvbiBfZmluZEdldFJlc3VsdCh2LCB4KSB7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgICBhc3luYy5kZXRlY3QgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZiwgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcbiAgICBhc3luYy5kZXRlY3RTZXJpZXMgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZlNlcmllcywgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcbiAgICBhc3luYy5kZXRlY3RMaW1pdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mTGltaXQsIGlkZW50aXR5LCBfZmluZEdldFJlc3VsdCk7XG5cbiAgICBhc3luYy5zb3J0QnkgPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgYXN5bmMubWFwKGFyciwgZnVuY3Rpb24gKHgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAoZXJyLCBjcml0ZXJpYSkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHt2YWx1ZTogeCwgY3JpdGVyaWE6IGNyaXRlcmlhfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIF9tYXAocmVzdWx0cy5zb3J0KGNvbXBhcmF0b3IpLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geC52YWx1ZTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gY29tcGFyYXRvcihsZWZ0LCByaWdodCkge1xuICAgICAgICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhLCBiID0gcmlnaHQuY3JpdGVyaWE7XG4gICAgICAgICAgICByZXR1cm4gYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IDA7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuYXV0byA9IGZ1bmN0aW9uICh0YXNrcywgY29uY3VycmVuY3ksIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAvLyBjb25jdXJyZW5jeSBpcyBvcHRpb25hbCwgc2hpZnQgdGhlIGFyZ3MuXG4gICAgICAgICAgICBjYWxsYmFjayA9IGNvbmN1cnJlbmN5O1xuICAgICAgICAgICAgY29uY3VycmVuY3kgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIHZhciBrZXlzID0gX2tleXModGFza3MpO1xuICAgICAgICB2YXIgcmVtYWluaW5nVGFza3MgPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgaWYgKCFyZW1haW5pbmdUYXNrcykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghY29uY3VycmVuY3kpIHtcbiAgICAgICAgICAgIGNvbmN1cnJlbmN5ID0gcmVtYWluaW5nVGFza3M7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0cyA9IHt9O1xuICAgICAgICB2YXIgcnVubmluZ1Rhc2tzID0gMDtcblxuICAgICAgICB2YXIgaGFzRXJyb3IgPSBmYWxzZTtcblxuICAgICAgICB2YXIgbGlzdGVuZXJzID0gW107XG4gICAgICAgIGZ1bmN0aW9uIGFkZExpc3RlbmVyKGZuKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMudW5zaGlmdChmbik7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZm4pIHtcbiAgICAgICAgICAgIHZhciBpZHggPSBfaW5kZXhPZihsaXN0ZW5lcnMsIGZuKTtcbiAgICAgICAgICAgIGlmIChpZHggPj0gMCkgbGlzdGVuZXJzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHRhc2tDb21wbGV0ZSgpIHtcbiAgICAgICAgICAgIHJlbWFpbmluZ1Rhc2tzLS07XG4gICAgICAgICAgICBfYXJyYXlFYWNoKGxpc3RlbmVycy5zbGljZSgwKSwgZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgYWRkTGlzdGVuZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCFyZW1haW5pbmdUYXNrcykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBfYXJyYXlFYWNoKGtleXMsIGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICBpZiAoaGFzRXJyb3IpIHJldHVybjtcbiAgICAgICAgICAgIHZhciB0YXNrID0gX2lzQXJyYXkodGFza3Nba10pID8gdGFza3Nba106IFt0YXNrc1trXV07XG4gICAgICAgICAgICB2YXIgdGFza0NhbGxiYWNrID0gX3Jlc3RQYXJhbShmdW5jdGlvbihlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBydW5uaW5nVGFza3MtLTtcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2FmZVJlc3VsdHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgX2ZvckVhY2hPZihyZXN1bHRzLCBmdW5jdGlvbih2YWwsIHJrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhZmVSZXN1bHRzW3JrZXldID0gdmFsO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc2FmZVJlc3VsdHNba10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICBoYXNFcnJvciA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyLCBzYWZlUmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzW2tdID0gYXJncztcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHRhc2tDb21wbGV0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgcmVxdWlyZXMgPSB0YXNrLnNsaWNlKDAsIHRhc2subGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAvLyBwcmV2ZW50IGRlYWQtbG9ja3NcbiAgICAgICAgICAgIHZhciBsZW4gPSByZXF1aXJlcy5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZGVwO1xuICAgICAgICAgICAgd2hpbGUgKGxlbi0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoZGVwID0gdGFza3NbcmVxdWlyZXNbbGVuXV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSGFzIG5vbmV4aXN0ZW50IGRlcGVuZGVuY3kgaW4gJyArIHJlcXVpcmVzLmpvaW4oJywgJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoX2lzQXJyYXkoZGVwKSAmJiBfaW5kZXhPZihkZXAsIGspID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIYXMgY3ljbGljIGRlcGVuZGVuY2llcycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlYWR5KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBydW5uaW5nVGFza3MgPCBjb25jdXJyZW5jeSAmJiBfcmVkdWNlKHJlcXVpcmVzLCBmdW5jdGlvbiAoYSwgeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGEgJiYgcmVzdWx0cy5oYXNPd25Qcm9wZXJ0eSh4KSk7XG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSkgJiYgIXJlc3VsdHMuaGFzT3duUHJvcGVydHkoayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVhZHkoKSkge1xuICAgICAgICAgICAgICAgIHJ1bm5pbmdUYXNrcysrO1xuICAgICAgICAgICAgICAgIHRhc2tbdGFzay5sZW5ndGggLSAxXSh0YXNrQ2FsbGJhY2ssIHJlc3VsdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYWRkTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gbGlzdGVuZXIoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlYWR5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVubmluZ1Rhc2tzKys7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUxpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICAgICAgdGFza1t0YXNrLmxlbmd0aCAtIDFdKHRhc2tDYWxsYmFjaywgcmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG5cblxuICAgIGFzeW5jLnJldHJ5ID0gZnVuY3Rpb24odGltZXMsIHRhc2ssIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBERUZBVUxUX1RJTUVTID0gNTtcbiAgICAgICAgdmFyIERFRkFVTFRfSU5URVJWQUwgPSAwO1xuXG4gICAgICAgIHZhciBhdHRlbXB0cyA9IFtdO1xuXG4gICAgICAgIHZhciBvcHRzID0ge1xuICAgICAgICAgICAgdGltZXM6IERFRkFVTFRfVElNRVMsXG4gICAgICAgICAgICBpbnRlcnZhbDogREVGQVVMVF9JTlRFUlZBTFxuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIHBhcnNlVGltZXMoYWNjLCB0KXtcbiAgICAgICAgICAgIGlmKHR5cGVvZiB0ID09PSAnbnVtYmVyJyl7XG4gICAgICAgICAgICAgICAgYWNjLnRpbWVzID0gcGFyc2VJbnQodCwgMTApIHx8IERFRkFVTFRfVElNRVM7XG4gICAgICAgICAgICB9IGVsc2UgaWYodHlwZW9mIHQgPT09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICBhY2MudGltZXMgPSBwYXJzZUludCh0LnRpbWVzLCAxMCkgfHwgREVGQVVMVF9USU1FUztcbiAgICAgICAgICAgICAgICBhY2MuaW50ZXJ2YWwgPSBwYXJzZUludCh0LmludGVydmFsLCAxMCkgfHwgREVGQVVMVF9JTlRFUlZBTDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBhcmd1bWVudCB0eXBlIGZvciBcXCd0aW1lc1xcJzogJyArIHR5cGVvZiB0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBpZiAobGVuZ3RoIDwgMSB8fCBsZW5ndGggPiAzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYXJndW1lbnRzIC0gbXVzdCBiZSBlaXRoZXIgKHRhc2spLCAodGFzaywgY2FsbGJhY2spLCAodGltZXMsIHRhc2spIG9yICh0aW1lcywgdGFzaywgY2FsbGJhY2spJyk7XG4gICAgICAgIH0gZWxzZSBpZiAobGVuZ3RoIDw9IDIgJiYgdHlwZW9mIHRpbWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IHRhc2s7XG4gICAgICAgICAgICB0YXNrID0gdGltZXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aW1lcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcGFyc2VUaW1lcyhvcHRzLCB0aW1lcyk7XG4gICAgICAgIH1cbiAgICAgICAgb3B0cy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICBvcHRzLnRhc2sgPSB0YXNrO1xuXG4gICAgICAgIGZ1bmN0aW9uIHdyYXBwZWRUYXNrKHdyYXBwZWRDYWxsYmFjaywgd3JhcHBlZFJlc3VsdHMpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJldHJ5QXR0ZW1wdCh0YXNrLCBmaW5hbEF0dGVtcHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2VyaWVzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgdGFzayhmdW5jdGlvbihlcnIsIHJlc3VsdCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJpZXNDYWxsYmFjayghZXJyIHx8IGZpbmFsQXR0ZW1wdCwge2VycjogZXJyLCByZXN1bHQ6IHJlc3VsdH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCB3cmFwcGVkUmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gcmV0cnlJbnRlcnZhbChpbnRlcnZhbCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNlcmllc0NhbGxiYWNrKXtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VyaWVzQ2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGludGVydmFsKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3aGlsZSAob3B0cy50aW1lcykge1xuXG4gICAgICAgICAgICAgICAgdmFyIGZpbmFsQXR0ZW1wdCA9ICEob3B0cy50aW1lcy09MSk7XG4gICAgICAgICAgICAgICAgYXR0ZW1wdHMucHVzaChyZXRyeUF0dGVtcHQob3B0cy50YXNrLCBmaW5hbEF0dGVtcHQpKTtcbiAgICAgICAgICAgICAgICBpZighZmluYWxBdHRlbXB0ICYmIG9wdHMuaW50ZXJ2YWwgPiAwKXtcbiAgICAgICAgICAgICAgICAgICAgYXR0ZW1wdHMucHVzaChyZXRyeUludGVydmFsKG9wdHMuaW50ZXJ2YWwpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFzeW5jLnNlcmllcyhhdHRlbXB0cywgZnVuY3Rpb24oZG9uZSwgZGF0YSl7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGFbZGF0YS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAod3JhcHBlZENhbGxiYWNrIHx8IG9wdHMuY2FsbGJhY2spKGRhdGEuZXJyLCBkYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIGEgY2FsbGJhY2sgaXMgcGFzc2VkLCBydW4gdGhpcyBhcyBhIGNvbnRyb2xsIGZsb3dcbiAgICAgICAgcmV0dXJuIG9wdHMuY2FsbGJhY2sgPyB3cmFwcGVkVGFzaygpIDogd3JhcHBlZFRhc2s7XG4gICAgfTtcblxuICAgIGFzeW5jLndhdGVyZmFsbCA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgaWYgKCFfaXNBcnJheSh0YXNrcykpIHtcbiAgICAgICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IHRvIHdhdGVyZmFsbCBtdXN0IGJlIGFuIGFycmF5IG9mIGZ1bmN0aW9ucycpO1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHdyYXBJdGVyYXRvcihpdGVyYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgW2Vycl0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXh0ID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJncy5wdXNoKHdyYXBJdGVyYXRvcihuZXh0KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVuc3VyZUFzeW5jKGl0ZXJhdG9yKS5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB3cmFwSXRlcmF0b3IoYXN5bmMuaXRlcmF0b3IodGFza3MpKSgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfcGFyYWxsZWwoZWFjaGZuLCB0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgICAgICB2YXIgcmVzdWx0cyA9IF9pc0FycmF5TGlrZSh0YXNrcykgPyBbXSA6IHt9O1xuXG4gICAgICAgIGVhY2hmbih0YXNrcywgZnVuY3Rpb24gKHRhc2ssIGtleSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHRhc2soX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdHNba2V5XSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMucGFyYWxsZWwgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9wYXJhbGxlbChhc3luYy5lYWNoT2YsIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnBhcmFsbGVsTGltaXQgPSBmdW5jdGlvbih0YXNrcywgbGltaXQsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9wYXJhbGxlbChfZWFjaE9mTGltaXQobGltaXQpLCB0YXNrcywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5zZXJpZXMgPSBmdW5jdGlvbih0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKGFzeW5jLmVhY2hPZlNlcmllcywgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuaXRlcmF0b3IgPSBmdW5jdGlvbiAodGFza3MpIHtcbiAgICAgICAgZnVuY3Rpb24gbWFrZUNhbGxiYWNrKGluZGV4KSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBmbigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tzW2luZGV4XS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZm4ubmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm4ubmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKGluZGV4IDwgdGFza3MubGVuZ3RoIC0gMSkgPyBtYWtlQ2FsbGJhY2soaW5kZXggKyAxKTogbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gZm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1ha2VDYWxsYmFjaygwKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuYXBwbHkgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uIChmbiwgYXJncykge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoY2FsbEFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBmbi5hcHBseShcbiAgICAgICAgICAgICAgICBudWxsLCBhcmdzLmNvbmNhdChjYWxsQXJncylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gX2NvbmNhdChlYWNoZm4sIGFyciwgZm4sIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHgsIGluZGV4LCBjYikge1xuICAgICAgICAgICAgZm4oeCwgZnVuY3Rpb24gKGVyciwgeSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoeSB8fCBbXSk7XG4gICAgICAgICAgICAgICAgY2IoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhc3luYy5jb25jYXQgPSBkb1BhcmFsbGVsKF9jb25jYXQpO1xuICAgIGFzeW5jLmNvbmNhdFNlcmllcyA9IGRvU2VyaWVzKF9jb25jYXQpO1xuXG4gICAgYXN5bmMud2hpbHN0ID0gZnVuY3Rpb24gKHRlc3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG4gICAgICAgIGlmICh0ZXN0KCkpIHtcbiAgICAgICAgICAgIHZhciBuZXh0ID0gX3Jlc3RQYXJhbShmdW5jdGlvbihlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0ZXN0LmFwcGx5KHRoaXMsIGFyZ3MpKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZXJhdG9yKG5leHQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIFtudWxsXS5jb25jYXQoYXJncykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXRlcmF0b3IobmV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5kb1doaWxzdCA9IGZ1bmN0aW9uIChpdGVyYXRvciwgdGVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGNhbGxzID0gMDtcbiAgICAgICAgcmV0dXJuIGFzeW5jLndoaWxzdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiArK2NhbGxzIDw9IDEgfHwgdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy51bnRpbCA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLndoaWxzdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5kb1VudGlsID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZG9XaGlsc3QoaXRlcmF0b3IsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICF0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZHVyaW5nID0gZnVuY3Rpb24gKHRlc3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG5cbiAgICAgICAgdmFyIG5leHQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGVyciwgYXJncykge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFyZ3MucHVzaChjaGVjayk7XG4gICAgICAgICAgICAgICAgdGVzdC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGNoZWNrID0gZnVuY3Rpb24oZXJyLCB0cnV0aCkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRydXRoKSB7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IobmV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRlc3QoY2hlY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5kb0R1cmluZyA9IGZ1bmN0aW9uIChpdGVyYXRvciwgdGVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGNhbGxzID0gMDtcbiAgICAgICAgYXN5bmMuZHVyaW5nKGZ1bmN0aW9uKG5leHQpIHtcbiAgICAgICAgICAgIGlmIChjYWxscysrIDwgMSkge1xuICAgICAgICAgICAgICAgIG5leHQobnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX3F1ZXVlKHdvcmtlciwgY29uY3VycmVuY3ksIHBheWxvYWQpIHtcbiAgICAgICAgaWYgKGNvbmN1cnJlbmN5ID09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbmN1cnJlbmN5ID0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKGNvbmN1cnJlbmN5ID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbmN1cnJlbmN5IG11c3Qgbm90IGJlIHplcm8nKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBfaW5zZXJ0KHEsIGRhdGEsIHBvcywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidGFzayBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKCFfaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBbZGF0YV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihkYXRhLmxlbmd0aCA9PT0gMCAmJiBxLmlkbGUoKSkge1xuICAgICAgICAgICAgICAgIC8vIGNhbGwgZHJhaW4gaW1tZWRpYXRlbHkgaWYgdGhlcmUgYXJlIG5vIHRhc2tzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX2FycmF5RWFjaChkYXRhLCBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhc2ssXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayB8fCBub29wXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGlmIChwb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcS50YXNrcy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHEudGFza3MucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggPT09IHEuY29uY3VycmVuY3kpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5zYXR1cmF0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShxLnByb2Nlc3MpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIF9uZXh0KHEsIHRhc2tzKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB3b3JrZXJzIC09IDE7XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVtb3ZlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgIF9hcnJheUVhY2godGFza3MsIGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgIF9hcnJheUVhY2god29ya2Vyc0xpc3QsIGZ1bmN0aW9uICh3b3JrZXIsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod29ya2VyID09PSB0YXNrICYmICFyZW1vdmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Vyc0xpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGFzay5jYWxsYmFjay5hcHBseSh0YXNrLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggKyB3b3JrZXJzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcS5wcm9jZXNzKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHdvcmtlcnMgPSAwO1xuICAgICAgICB2YXIgd29ya2Vyc0xpc3QgPSBbXTtcbiAgICAgICAgdmFyIHEgPSB7XG4gICAgICAgICAgICB0YXNrczogW10sXG4gICAgICAgICAgICBjb25jdXJyZW5jeTogY29uY3VycmVuY3ksXG4gICAgICAgICAgICBwYXlsb2FkOiBwYXlsb2FkLFxuICAgICAgICAgICAgc2F0dXJhdGVkOiBub29wLFxuICAgICAgICAgICAgZW1wdHk6IG5vb3AsXG4gICAgICAgICAgICBkcmFpbjogbm9vcCxcbiAgICAgICAgICAgIHN0YXJ0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcGF1c2VkOiBmYWxzZSxcbiAgICAgICAgICAgIHB1c2g6IGZ1bmN0aW9uIChkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgZmFsc2UsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBraWxsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcS5kcmFpbiA9IG5vb3A7XG4gICAgICAgICAgICAgICAgcS50YXNrcyA9IFtdO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHVuc2hpZnQ6IGZ1bmN0aW9uIChkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgdHJ1ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB3aGlsZSghcS5wYXVzZWQgJiYgd29ya2VycyA8IHEuY29uY3VycmVuY3kgJiYgcS50YXNrcy5sZW5ndGgpe1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB0YXNrcyA9IHEucGF5bG9hZCA/XG4gICAgICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnNwbGljZSgwLCBxLnBheWxvYWQpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHEudGFza3Muc3BsaWNlKDAsIHEudGFza3MubGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IF9tYXAodGFza3MsIGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5kYXRhO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHEuZW1wdHkoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB3b3JrZXJzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIHdvcmtlcnNMaXN0LnB1c2godGFza3NbMF0pO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2IgPSBvbmx5X29uY2UoX25leHQocSwgdGFza3MpKTtcbiAgICAgICAgICAgICAgICAgICAgd29ya2VyKGRhdGEsIGNiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGVuZ3RoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHEudGFza3MubGVuZ3RoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJ1bm5pbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd29ya2VycztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3b3JrZXJzTGlzdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3b3JrZXJzTGlzdDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpZGxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcS50YXNrcy5sZW5ndGggKyB3b3JrZXJzID09PSAwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcS5wYXVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3VtZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChxLnBhdXNlZCA9PT0gZmFsc2UpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgICAgICAgcS5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdW1lQ291bnQgPSBNYXRoLm1pbihxLmNvbmN1cnJlbmN5LCBxLnRhc2tzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgLy8gTmVlZCB0byBjYWxsIHEucHJvY2VzcyBvbmNlIHBlciBjb25jdXJyZW50XG4gICAgICAgICAgICAgICAgLy8gd29ya2VyIHRvIHByZXNlcnZlIGZ1bGwgY29uY3VycmVuY3kgYWZ0ZXIgcGF1c2VcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB3ID0gMTsgdyA8PSByZXN1bWVDb3VudDsgdysrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShxLnByb2Nlc3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfVxuXG4gICAgYXN5bmMucXVldWUgPSBmdW5jdGlvbiAod29ya2VyLCBjb25jdXJyZW5jeSkge1xuICAgICAgICB2YXIgcSA9IF9xdWV1ZShmdW5jdGlvbiAoaXRlbXMsIGNiKSB7XG4gICAgICAgICAgICB3b3JrZXIoaXRlbXNbMF0sIGNiKTtcbiAgICAgICAgfSwgY29uY3VycmVuY3ksIDEpO1xuXG4gICAgICAgIHJldHVybiBxO1xuICAgIH07XG5cbiAgICBhc3luYy5wcmlvcml0eVF1ZXVlID0gZnVuY3Rpb24gKHdvcmtlciwgY29uY3VycmVuY3kpIHtcblxuICAgICAgICBmdW5jdGlvbiBfY29tcGFyZVRhc2tzKGEsIGIpe1xuICAgICAgICAgICAgcmV0dXJuIGEucHJpb3JpdHkgLSBiLnByaW9yaXR5O1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gX2JpbmFyeVNlYXJjaChzZXF1ZW5jZSwgaXRlbSwgY29tcGFyZSkge1xuICAgICAgICAgICAgdmFyIGJlZyA9IC0xLFxuICAgICAgICAgICAgICAgIGVuZCA9IHNlcXVlbmNlLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICB3aGlsZSAoYmVnIDwgZW5kKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1pZCA9IGJlZyArICgoZW5kIC0gYmVnICsgMSkgPj4+IDEpO1xuICAgICAgICAgICAgICAgIGlmIChjb21wYXJlKGl0ZW0sIHNlcXVlbmNlW21pZF0pID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYmVnID0gbWlkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IG1pZCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJlZztcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIF9pbnNlcnQocSwgZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRhc2sgY2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcS5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghX2lzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBjYWxsIGRyYWluIGltbWVkaWF0ZWx5IGlmIHRoZXJlIGFyZSBubyB0YXNrc1xuICAgICAgICAgICAgICAgIHJldHVybiBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9hcnJheUVhY2goZGF0YSwgZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgICBwcmlvcml0eTogcHJpb3JpdHksXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgPyBjYWxsYmFjayA6IG5vb3BcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoX2JpbmFyeVNlYXJjaChxLnRhc2tzLCBpdGVtLCBfY29tcGFyZVRhc2tzKSArIDEsIDAsIGl0ZW0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoID09PSBxLmNvbmN1cnJlbmN5KSB7XG4gICAgICAgICAgICAgICAgICAgIHEuc2F0dXJhdGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShxLnByb2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdGFydCB3aXRoIGEgbm9ybWFsIHF1ZXVlXG4gICAgICAgIHZhciBxID0gYXN5bmMucXVldWUod29ya2VyLCBjb25jdXJyZW5jeSk7XG5cbiAgICAgICAgLy8gT3ZlcnJpZGUgcHVzaCB0byBhY2NlcHQgc2Vjb25kIHBhcmFtZXRlciByZXByZXNlbnRpbmcgcHJpb3JpdHlcbiAgICAgICAgcS5wdXNoID0gZnVuY3Rpb24gKGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJlbW92ZSB1bnNoaWZ0IGZ1bmN0aW9uXG4gICAgICAgIGRlbGV0ZSBxLnVuc2hpZnQ7XG5cbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfTtcblxuICAgIGFzeW5jLmNhcmdvID0gZnVuY3Rpb24gKHdvcmtlciwgcGF5bG9hZCkge1xuICAgICAgICByZXR1cm4gX3F1ZXVlKHdvcmtlciwgMSwgcGF5bG9hZCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9jb25zb2xlX2ZuKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGZuLCBhcmdzKSB7XG4gICAgICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzLmNvbmNhdChbX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjb25zb2xlW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYXJyYXlFYWNoKGFyZ3MsIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZVtuYW1lXSh4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSldKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhc3luYy5sb2cgPSBfY29uc29sZV9mbignbG9nJyk7XG4gICAgYXN5bmMuZGlyID0gX2NvbnNvbGVfZm4oJ2RpcicpO1xuICAgIC8qYXN5bmMuaW5mbyA9IF9jb25zb2xlX2ZuKCdpbmZvJyk7XG4gICAgYXN5bmMud2FybiA9IF9jb25zb2xlX2ZuKCd3YXJuJyk7XG4gICAgYXN5bmMuZXJyb3IgPSBfY29uc29sZV9mbignZXJyb3InKTsqL1xuXG4gICAgYXN5bmMubWVtb2l6ZSA9IGZ1bmN0aW9uIChmbiwgaGFzaGVyKSB7XG4gICAgICAgIHZhciBtZW1vID0ge307XG4gICAgICAgIHZhciBxdWV1ZXMgPSB7fTtcbiAgICAgICAgdmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gICAgICAgIGhhc2hlciA9IGhhc2hlciB8fCBpZGVudGl0eTtcbiAgICAgICAgdmFyIG1lbW9pemVkID0gX3Jlc3RQYXJhbShmdW5jdGlvbiBtZW1vaXplZChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgdmFyIGtleSA9IGhhc2hlci5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChoYXMuY2FsbChtZW1vLCBrZXkpKSB7ICAgXG4gICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgbWVtb1trZXldKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGhhcy5jYWxsKHF1ZXVlcywga2V5KSkge1xuICAgICAgICAgICAgICAgIHF1ZXVlc1trZXldLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcXVldWVzW2tleV0gPSBbY2FsbGJhY2tdO1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbW9ba2V5XSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxID0gcXVldWVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBxdWV1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBxLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcVtpXS5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbWVtb2l6ZWQubWVtbyA9IG1lbW87XG4gICAgICAgIG1lbW9pemVkLnVubWVtb2l6ZWQgPSBmbjtcbiAgICAgICAgcmV0dXJuIG1lbW9pemVkO1xuICAgIH07XG5cbiAgICBhc3luYy51bm1lbW9pemUgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAoZm4udW5tZW1vaXplZCB8fCBmbikuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX3RpbWVzKG1hcHBlcikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGNvdW50LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIG1hcHBlcihfcmFuZ2UoY291bnQpLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFzeW5jLnRpbWVzID0gX3RpbWVzKGFzeW5jLm1hcCk7XG4gICAgYXN5bmMudGltZXNTZXJpZXMgPSBfdGltZXMoYXN5bmMubWFwU2VyaWVzKTtcbiAgICBhc3luYy50aW1lc0xpbWl0ID0gZnVuY3Rpb24gKGNvdW50LCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5tYXBMaW1pdChfcmFuZ2UoY291bnQpLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuc2VxID0gZnVuY3Rpb24gKC8qIGZ1bmN0aW9ucy4uLiAqLykge1xuICAgICAgICB2YXIgZm5zID0gYXJndW1lbnRzO1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayA9IG5vb3A7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFzeW5jLnJlZHVjZShmbnMsIGFyZ3MsIGZ1bmN0aW9uIChuZXdhcmdzLCBmbiwgY2IpIHtcbiAgICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBuZXdhcmdzLmNvbmNhdChbX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBuZXh0YXJncykge1xuICAgICAgICAgICAgICAgICAgICBjYihlcnIsIG5leHRhcmdzKTtcbiAgICAgICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoZXJyLCByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhhdCwgW2Vycl0uY29uY2F0KHJlc3VsdHMpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMuY29tcG9zZSA9IGZ1bmN0aW9uICgvKiBmdW5jdGlvbnMuLi4gKi8pIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLnNlcS5hcHBseShudWxsLCBBcnJheS5wcm90b3R5cGUucmV2ZXJzZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgIH07XG5cblxuICAgIGZ1bmN0aW9uIF9hcHBseUVhY2goZWFjaGZuKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uKGZucywgYXJncykge1xuICAgICAgICAgICAgdmFyIGdvID0gX3Jlc3RQYXJhbShmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVhY2hmbihmbnMsIGZ1bmN0aW9uIChmbiwgXywgY2IpIHtcbiAgICAgICAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgYXJncy5jb25jYXQoW2NiXSkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoYXJncy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ28uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ287XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLmFwcGx5RWFjaCA9IF9hcHBseUVhY2goYXN5bmMuZWFjaE9mKTtcbiAgICBhc3luYy5hcHBseUVhY2hTZXJpZXMgPSBfYXBwbHlFYWNoKGFzeW5jLmVhY2hPZlNlcmllcyk7XG5cblxuICAgIGFzeW5jLmZvcmV2ZXIgPSBmdW5jdGlvbiAoZm4sIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkb25lID0gb25seV9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICB2YXIgdGFzayA9IGVuc3VyZUFzeW5jKGZuKTtcbiAgICAgICAgZnVuY3Rpb24gbmV4dChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGFzayhuZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBuZXh0KCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGVuc3VyZUFzeW5jKGZuKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgYXJncy5wdXNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5uZXJBcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgIGlmIChzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBpbm5lckFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBpbm5lckFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICBzeW5jID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLmVuc3VyZUFzeW5jID0gZW5zdXJlQXN5bmM7XG5cbiAgICBhc3luYy5jb25zdGFudCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIHZhciBhcmdzID0gW251bGxdLmNvbmNhdCh2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhc3luYy53cmFwU3luYyA9XG4gICAgYXN5bmMuYXN5bmNpZnkgPSBmdW5jdGlvbiBhc3luY2lmeShmdW5jKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiByZXN1bHQgaXMgUHJvbWlzZSBvYmplY3RcbiAgICAgICAgICAgIGlmIChfaXNPYmplY3QocmVzdWx0KSAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHJlc3VsdC50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIubWVzc2FnZSA/IGVyciA6IG5ldyBFcnJvcihlcnIpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIE5vZGUuanNcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBhc3luYztcbiAgICB9XG4gICAgLy8gQU1EIC8gUmVxdWlyZUpTXG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGFzeW5jO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gaW5jbHVkZWQgZGlyZWN0bHkgdmlhIDxzY3JpcHQ+IHRhZ1xuICAgIGVsc2Uge1xuICAgICAgICByb290LmFzeW5jID0gYXN5bmM7XG4gICAgfVxuXG59KCkpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZSgnX3Byb2Nlc3MnKSx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW01dlpHVmZiVzlrZFd4bGN5OXpZMmhsYldFdGFXNXpjR1ZqZEc5eUwyNXZaR1ZmYlc5a2RXeGxjeTloYzNsdVl5OXNhV0l2WVhONWJtTXVhbk1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVNJc0ltWnBiR1VpT2lKblpXNWxjbUYwWldRdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGMwTnZiblJsYm5RaU9sc2lMeW9oWEc0Z0tpQmhjM2x1WTF4dUlDb2dhSFIwY0hNNkx5OW5hWFJvZFdJdVkyOXRMMk5oYjJ4aGJpOWhjM2x1WTF4dUlDcGNiaUFxSUVOdmNIbHlhV2RvZENBeU1ERXdMVEl3TVRRZ1EyRnZiR0Z1SUUxalRXRm9iMjVjYmlBcUlGSmxiR1ZoYzJWa0lIVnVaR1Z5SUhSb1pTQk5TVlFnYkdsalpXNXpaVnh1SUNvdlhHNG9ablZ1WTNScGIyNGdLQ2tnZTF4dVhHNGdJQ0FnZG1GeUlHRnplVzVqSUQwZ2UzMDdYRzRnSUNBZ1puVnVZM1JwYjI0Z2JtOXZjQ2dwSUh0OVhHNGdJQ0FnWm5WdVkzUnBiMjRnYVdSbGJuUnBkSGtvZGlrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z2RqdGNiaUFnSUNCOVhHNGdJQ0FnWm5WdVkzUnBiMjRnZEc5Q2IyOXNLSFlwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUNFaGRqdGNiaUFnSUNCOVhHNGdJQ0FnWm5WdVkzUnBiMjRnYm05MFNXUW9kaWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnSVhZN1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnTHk4Z1oyeHZZbUZzSUc5dUlIUm9aU0J6WlhKMlpYSXNJSGRwYm1SdmR5QnBiaUIwYUdVZ1luSnZkM05sY2x4dUlDQWdJSFpoY2lCd2NtVjJhVzkxYzE5aGMzbHVZenRjYmx4dUlDQWdJQzh2SUVWemRHRmliR2x6YUNCMGFHVWdjbTl2ZENCdlltcGxZM1FzSUdCM2FXNWtiM2RnSUNoZ2MyVnNabUFwSUdsdUlIUm9aU0JpY205M2MyVnlMQ0JnWjJ4dlltRnNZRnh1SUNBZ0lDOHZJRzl1SUhSb1pTQnpaWEoyWlhJc0lHOXlJR0IwYUdsellDQnBiaUJ6YjIxbElIWnBjblIxWVd3Z2JXRmphR2x1WlhNdUlGZGxJSFZ6WlNCZ2MyVnNabUJjYmlBZ0lDQXZMeUJwYm5OMFpXRmtJRzltSUdCM2FXNWtiM2RnSUdadmNpQmdWMlZpVjI5eWEyVnlZQ0J6ZFhCd2IzSjBMbHh1SUNBZ0lIWmhjaUJ5YjI5MElEMGdkSGx3Wlc5bUlITmxiR1lnUFQwOUlDZHZZbXBsWTNRbklDWW1JSE5sYkdZdWMyVnNaaUE5UFQwZ2MyVnNaaUFtSmlCelpXeG1JSHg4WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBlWEJsYjJZZ1oyeHZZbUZzSUQwOVBTQW5iMkpxWldOMEp5QW1KaUJuYkc5aVlXd3VaMnh2WW1Gc0lEMDlQU0JuYkc5aVlXd2dKaVlnWjJ4dlltRnNJSHg4WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TzF4dVhHNGdJQ0FnYVdZZ0tISnZiM1FnSVQwZ2JuVnNiQ2tnZTF4dUlDQWdJQ0FnSUNCd2NtVjJhVzkxYzE5aGMzbHVZeUE5SUhKdmIzUXVZWE41Ym1NN1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnWVhONWJtTXVibTlEYjI1bWJHbGpkQ0E5SUdaMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdjbTl2ZEM1aGMzbHVZeUE5SUhCeVpYWnBiM1Z6WDJGemVXNWpPMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdZWE41Ym1NN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdaMWJtTjBhVzl1SUc5dWJIbGZiMjVqWlNobWJpa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdablZ1WTNScGIyNG9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWm00Z1BUMDlJRzUxYkd3cElIUm9jbTkzSUc1bGR5QkZjbkp2Y2loY0lrTmhiR3hpWVdOcklIZGhjeUJoYkhKbFlXUjVJR05oYkd4bFpDNWNJaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQm1iaTVoY0hCc2VTaDBhR2x6TENCaGNtZDFiV1Z1ZEhNcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnWm00Z1BTQnVkV3hzTzF4dUlDQWdJQ0FnSUNCOU8xeHVJQ0FnSUgxY2JseHVJQ0FnSUdaMWJtTjBhVzl1SUY5dmJtTmxLR1p1S1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCbWRXNWpkR2x2YmlncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaG1iaUE5UFQwZ2JuVnNiQ2tnY21WMGRYSnVPMXh1SUNBZ0lDQWdJQ0FnSUNBZ1ptNHVZWEJ3Ykhrb2RHaHBjeXdnWVhKbmRXMWxiblJ6S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJR1p1SUQwZ2JuVnNiRHRjYmlBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0F2THk4dklHTnliM056TFdKeWIzZHpaWElnWTI5dGNHRjBhV0pzYVhSNUlHWjFibU4wYVc5dWN5QXZMeTh2WEc1Y2JpQWdJQ0IyWVhJZ1gzUnZVM1J5YVc1bklEMGdUMkpxWldOMExuQnliM1J2ZEhsd1pTNTBiMU4wY21sdVp6dGNibHh1SUNBZ0lIWmhjaUJmYVhOQmNuSmhlU0E5SUVGeWNtRjVMbWx6UVhKeVlYa2dmSHdnWm5WdVkzUnBiMjRnS0c5aWFpa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdYM1J2VTNSeWFXNW5MbU5oYkd3b2IySnFLU0E5UFQwZ0oxdHZZbXBsWTNRZ1FYSnlZWGxkSnp0Y2JpQWdJQ0I5TzF4dVhHNGdJQ0FnTHk4Z1VHOXlkR1ZrSUdaeWIyMGdkVzVrWlhKelkyOXlaUzVxY3lCcGMwOWlhbVZqZEZ4dUlDQWdJSFpoY2lCZmFYTlBZbXBsWTNRZ1BTQm1kVzVqZEdsdmJpaHZZbW9wSUh0Y2JpQWdJQ0FnSUNBZ2RtRnlJSFI1Y0dVZ1BTQjBlWEJsYjJZZ2IySnFPMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdkSGx3WlNBOVBUMGdKMloxYm1OMGFXOXVKeUI4ZkNCMGVYQmxJRDA5UFNBbmIySnFaV04wSnlBbUppQWhJVzlpYWp0Y2JpQWdJQ0I5TzF4dVhHNGdJQ0FnWm5WdVkzUnBiMjRnWDJselFYSnlZWGxNYVd0bEtHRnljaWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnWDJselFYSnlZWGtvWVhKeUtTQjhmQ0FvWEc0Z0lDQWdJQ0FnSUNBZ0lDQXZMeUJvWVhNZ1lTQndiM05wZEdsMlpTQnBiblJsWjJWeUlHeGxibWQwYUNCd2NtOXdaWEowZVZ4dUlDQWdJQ0FnSUNBZ0lDQWdkSGx3Wlc5bUlHRnljaTVzWlc1bmRHZ2dQVDA5SUZ3aWJuVnRZbVZ5WENJZ0ppWmNiaUFnSUNBZ0lDQWdJQ0FnSUdGeWNpNXNaVzVuZEdnZ1BqMGdNQ0FtSmx4dUlDQWdJQ0FnSUNBZ0lDQWdZWEp5TG14bGJtZDBhQ0FsSURFZ1BUMDlJREJjYmlBZ0lDQWdJQ0FnS1R0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0JtZFc1amRHbHZiaUJmWVhKeVlYbEZZV05vS0dGeWNpd2dhWFJsY21GMGIzSXBJSHRjYmlBZ0lDQWdJQ0FnZG1GeUlHbHVaR1Y0SUQwZ0xURXNYRzRnSUNBZ0lDQWdJQ0FnSUNCc1pXNW5kR2dnUFNCaGNuSXViR1Z1WjNSb08xeHVYRzRnSUNBZ0lDQWdJSGRvYVd4bElDZ3JLMmx1WkdWNElEd2diR1Z1WjNSb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCcGRHVnlZWFJ2Y2loaGNuSmJhVzVrWlhoZExDQnBibVJsZUN3Z1lYSnlLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjl0WVhBb1lYSnlMQ0JwZEdWeVlYUnZjaWtnZTF4dUlDQWdJQ0FnSUNCMllYSWdhVzVrWlhnZ1BTQXRNU3hjYmlBZ0lDQWdJQ0FnSUNBZ0lHeGxibWQwYUNBOUlHRnljaTVzWlc1bmRHZ3NYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYTjFiSFFnUFNCQmNuSmhlU2hzWlc1bmRHZ3BPMXh1WEc0Z0lDQWdJQ0FnSUhkb2FXeGxJQ2dySzJsdVpHVjRJRHdnYkdWdVozUm9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWE4xYkhSYmFXNWtaWGhkSUQwZ2FYUmxjbUYwYjNJb1lYSnlXMmx1WkdWNFhTd2dhVzVrWlhnc0lHRnljaWs3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUhKbGMzVnNkRHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQm1kVzVqZEdsdmJpQmZjbUZ1WjJVb1kyOTFiblFwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUY5dFlYQW9RWEp5WVhrb1kyOTFiblFwTENCbWRXNWpkR2x2YmlBb2Rpd2dhU2tnZXlCeVpYUjFjbTRnYVRzZ2ZTazdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ1puVnVZM1JwYjI0Z1gzSmxaSFZqWlNoaGNuSXNJR2wwWlhKaGRHOXlMQ0J0WlcxdktTQjdYRzRnSUNBZ0lDQWdJRjloY25KaGVVVmhZMmdvWVhKeUxDQm1kVzVqZEdsdmJpQW9lQ3dnYVN3Z1lTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2JXVnRieUE5SUdsMFpYSmhkRzl5S0cxbGJXOHNJSGdzSUdrc0lHRXBPMXh1SUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUcxbGJXODdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ1puVnVZM1JwYjI0Z1gyWnZja1ZoWTJoUFppaHZZbXBsWTNRc0lHbDBaWEpoZEc5eUtTQjdYRzRnSUNBZ0lDQWdJRjloY25KaGVVVmhZMmdvWDJ0bGVYTW9iMkpxWldOMEtTd2dablZ1WTNScGIyNGdLR3RsZVNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVhSbGNtRjBiM0lvYjJKcVpXTjBXMnRsZVYwc0lHdGxlU2s3WEc0Z0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUdaMWJtTjBhVzl1SUY5cGJtUmxlRTltS0dGeWNpd2dhWFJsYlNrZ2UxeHVJQ0FnSUNBZ0lDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJR0Z5Y2k1c1pXNW5kR2c3SUdrckt5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR0Z5Y2x0cFhTQTlQVDBnYVhSbGJTa2djbVYwZFhKdUlHazdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJQzB4TzF4dUlDQWdJSDFjYmx4dUlDQWdJSFpoY2lCZmEyVjVjeUE5SUU5aWFtVmpkQzVyWlhseklIeDhJR1oxYm1OMGFXOXVJQ2h2WW1vcElIdGNiaUFnSUNBZ0lDQWdkbUZ5SUd0bGVYTWdQU0JiWFR0Y2JpQWdJQ0FnSUNBZ1ptOXlJQ2gyWVhJZ2F5QnBiaUJ2WW1vcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaHZZbW91YUdGelQzZHVVSEp2Y0dWeWRIa29heWtwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCclpYbHpMbkIxYzJnb2F5azdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHdGxlWE03WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjlyWlhsSmRHVnlZWFJ2Y2loamIyeHNLU0I3WEc0Z0lDQWdJQ0FnSUhaaGNpQnBJRDBnTFRFN1hHNGdJQ0FnSUNBZ0lIWmhjaUJzWlc0N1hHNGdJQ0FnSUNBZ0lIWmhjaUJyWlhsek8xeHVJQ0FnSUNBZ0lDQnBaaUFvWDJselFYSnlZWGxNYVd0bEtHTnZiR3dwS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JzWlc0Z1BTQmpiMnhzTG14bGJtZDBhRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCbWRXNWpkR2x2YmlCdVpYaDBLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdrckt6dGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2FTQThJR3hsYmlBL0lHa2dPaUJ1ZFd4c08xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR3RsZVhNZ1BTQmZhMlY1Y3loamIyeHNLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHeGxiaUE5SUd0bGVYTXViR1Z1WjNSb08xeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVJRzVsZUhRb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhU3NyTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJwSUR3Z2JHVnVJRDhnYTJWNWMxdHBYU0E2SUc1MWJHdzdYRzRnSUNBZ0lDQWdJQ0FnSUNCOU8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVYRzRnSUNBZ0x5OGdVMmx0YVd4aGNpQjBieUJGVXpZbmN5QnlaWE4wSUhCaGNtRnRJQ2hvZEhSd09pOHZZWEpwZVdFdWIyWnBiR0ZpY3k1amIyMHZNakF4TXk4d015OWxjell0WVc1a0xYSmxjM1F0Y0dGeVlXMWxkR1Z5TG1oMGJXd3BYRzRnSUNBZ0x5OGdWR2hwY3lCaFkyTjFiWFZzWVhSbGN5QjBhR1VnWVhKbmRXMWxiblJ6SUhCaGMzTmxaQ0JwYm5SdklHRnVJR0Z5Y21GNUxDQmhablJsY2lCaElHZHBkbVZ1SUdsdVpHVjRMbHh1SUNBZ0lDOHZJRVp5YjIwZ2RXNWtaWEp6WTI5eVpTNXFjeUFvYUhSMGNITTZMeTluYVhSb2RXSXVZMjl0TDJwaGMyaHJaVzVoY3k5MWJtUmxjbk5qYjNKbEwzQjFiR3d2TWpFME1Da3VYRzRnSUNBZ1puVnVZM1JwYjI0Z1gzSmxjM1JRWVhKaGJTaG1kVzVqTENCemRHRnlkRWx1WkdWNEtTQjdYRzRnSUNBZ0lDQWdJSE4wWVhKMFNXNWtaWGdnUFNCemRHRnlkRWx1WkdWNElEMDlJRzUxYkd3Z1B5Qm1kVzVqTG14bGJtZDBhQ0F0SURFZ09pQXJjM1JoY25SSmJtUmxlRHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUd4bGJtZDBhQ0E5SUUxaGRHZ3ViV0Y0S0dGeVozVnRaVzUwY3k1c1pXNW5kR2dnTFNCemRHRnlkRWx1WkdWNExDQXdLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJ5WlhOMElEMGdRWEp5WVhrb2JHVnVaM1JvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJR1p2Y2lBb2RtRnlJR2x1WkdWNElEMGdNRHNnYVc1a1pYZ2dQQ0JzWlc1bmRHZzdJR2x1WkdWNEt5c3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhOMFcybHVaR1Y0WFNBOUlHRnlaM1Z0Wlc1MGMxdHBibVJsZUNBcklITjBZWEowU1c1a1pYaGRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnYzNkcGRHTm9JQ2h6ZEdGeWRFbHVaR1Y0S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyRnpaU0F3T2lCeVpYUjFjbTRnWm5WdVl5NWpZV3hzS0hSb2FYTXNJSEpsYzNRcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhjMlVnTVRvZ2NtVjBkWEp1SUdaMWJtTXVZMkZzYkNoMGFHbHpMQ0JoY21kMWJXVnVkSE5iTUYwc0lISmxjM1FwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0x5OGdRM1Z5Y21WdWRHeDVJSFZ1ZFhObFpDQmlkWFFnYUdGdVpHeGxJR05oYzJWeklHOTFkSE5wWkdVZ2IyWWdkR2hsSUhOM2FYUmphQ0J6ZEdGMFpXMWxiblE2WEc0Z0lDQWdJQ0FnSUNBZ0lDQXZMeUIyWVhJZ1lYSm5jeUE5SUVGeWNtRjVLSE4wWVhKMFNXNWtaWGdnS3lBeEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUM4dklHWnZjaUFvYVc1a1pYZ2dQU0F3T3lCcGJtUmxlQ0E4SUhOMFlYSjBTVzVrWlhnN0lHbHVaR1Y0S3lzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUM4dklDQWdJQ0JoY21kelcybHVaR1Y0WFNBOUlHRnlaM1Z0Wlc1MGMxdHBibVJsZUYwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0F2THlCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0F2THlCaGNtZHpXM04wWVhKMFNXNWtaWGhkSUQwZ2NtVnpkRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDOHZJSEpsZEhWeWJpQm1kVzVqTG1Gd2NHeDVLSFJvYVhNc0lHRnlaM01wTzF4dUlDQWdJQ0FnSUNCOU8xeHVJQ0FnSUgxY2JseHVJQ0FnSUdaMWJtTjBhVzl1SUY5M2FYUm9iM1YwU1c1a1pYZ29hWFJsY21GMGIzSXBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVJQ2gyWVd4MVpTd2dhVzVrWlhnc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnYVhSbGNtRjBiM0lvZG1Gc2RXVXNJR05oYkd4aVlXTnJLVHRjYmlBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0F2THk4dklHVjRjRzl5ZEdWa0lHRnplVzVqSUcxdlpIVnNaU0JtZFc1amRHbHZibk1nTHk4dkwxeHVYRzRnSUNBZ0x5OHZMeUJ1WlhoMFZHbGpheUJwYlhCc1pXMWxiblJoZEdsdmJpQjNhWFJvSUdKeWIzZHpaWEl0WTI5dGNHRjBhV0pzWlNCbVlXeHNZbUZqYXlBdkx5OHZYRzVjYmlBZ0lDQXZMeUJqWVhCMGRYSmxJSFJvWlNCbmJHOWlZV3dnY21WbVpYSmxibU5sSUhSdklHZDFZWEprSUdGbllXbHVjM1FnWm1GclpWUnBiV1Z5SUcxdlkydHpYRzRnSUNBZ2RtRnlJRjl6WlhSSmJXMWxaR2xoZEdVZ1BTQjBlWEJsYjJZZ2MyVjBTVzF0WldScFlYUmxJRDA5UFNBblpuVnVZM1JwYjI0bklDWW1JSE5sZEVsdGJXVmthV0YwWlR0Y2JseHVJQ0FnSUhaaGNpQmZaR1ZzWVhrZ1BTQmZjMlYwU1cxdFpXUnBZWFJsSUQ4Z1puVnVZM1JwYjI0b1ptNHBJSHRjYmlBZ0lDQWdJQ0FnTHk4Z2JtOTBJR0VnWkdseVpXTjBJR0ZzYVdGeklHWnZjaUJKUlRFd0lHTnZiWEJoZEdsaWFXeHBkSGxjYmlBZ0lDQWdJQ0FnWDNObGRFbHRiV1ZrYVdGMFpTaG1iaWs3WEc0Z0lDQWdmU0E2SUdaMWJtTjBhVzl1S0dadUtTQjdYRzRnSUNBZ0lDQWdJSE5sZEZScGJXVnZkWFFvWm00c0lEQXBPMXh1SUNBZ0lIMDdYRzVjYmlBZ0lDQnBaaUFvZEhsd1pXOW1JSEJ5YjJObGMzTWdQVDA5SUNkdlltcGxZM1FuSUNZbUlIUjVjR1Z2WmlCd2NtOWpaWE56TG01bGVIUlVhV05ySUQwOVBTQW5ablZ1WTNScGIyNG5LU0I3WEc0Z0lDQWdJQ0FnSUdGemVXNWpMbTVsZUhSVWFXTnJJRDBnY0hKdlkyVnpjeTV1WlhoMFZHbGphenRjYmlBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQmhjM2x1WXk1dVpYaDBWR2xqYXlBOUlGOWtaV3hoZVR0Y2JpQWdJQ0I5WEc0Z0lDQWdZWE41Ym1NdWMyVjBTVzF0WldScFlYUmxJRDBnWDNObGRFbHRiV1ZrYVdGMFpTQS9JRjlrWld4aGVTQTZJR0Z6ZVc1akxtNWxlSFJVYVdOck8xeHVYRzVjYmlBZ0lDQmhjM2x1WXk1bWIzSkZZV05vSUQxY2JpQWdJQ0JoYzNsdVl5NWxZV05vSUQwZ1puVnVZM1JwYjI0Z0tHRnljaXdnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCaGMzbHVZeTVsWVdOb1QyWW9ZWEp5TENCZmQybDBhRzkxZEVsdVpHVjRLR2wwWlhKaGRHOXlLU3dnWTJGc2JHSmhZMnNwTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JoYzNsdVl5NW1iM0pGWVdOb1UyVnlhV1Z6SUQxY2JpQWdJQ0JoYzNsdVl5NWxZV05vVTJWeWFXVnpJRDBnWm5WdVkzUnBiMjRnS0dGeWNpd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJoYzNsdVl5NWxZV05vVDJaVFpYSnBaWE1vWVhKeUxDQmZkMmwwYUc5MWRFbHVaR1Y0S0dsMFpYSmhkRzl5S1N3Z1kyRnNiR0poWTJzcE8xeHVJQ0FnSUgwN1hHNWNibHh1SUNBZ0lHRnplVzVqTG1admNrVmhZMmhNYVcxcGRDQTlYRzRnSUNBZ1lYTjVibU11WldGamFFeHBiV2wwSUQwZ1puVnVZM1JwYjI0Z0tHRnljaXdnYkdsdGFYUXNJR2wwWlhKaGRHOXlMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnWDJWaFkyaFBaa3hwYldsMEtHeHBiV2wwS1NoaGNuSXNJRjkzYVhSb2IzVjBTVzVrWlhnb2FYUmxjbUYwYjNJcExDQmpZV3hzWW1GamF5azdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHRnplVzVqTG1admNrVmhZMmhQWmlBOVhHNGdJQ0FnWVhONWJtTXVaV0ZqYUU5bUlEMGdablZ1WTNScGIyNGdLRzlpYW1WamRDd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUdOaGJHeGlZV05ySUQwZ1gyOXVZMlVvWTJGc2JHSmhZMnNnZkh3Z2JtOXZjQ2s3WEc0Z0lDQWdJQ0FnSUc5aWFtVmpkQ0E5SUc5aWFtVmpkQ0I4ZkNCYlhUdGNibHh1SUNBZ0lDQWdJQ0IyWVhJZ2FYUmxjaUE5SUY5clpYbEpkR1Z5WVhSdmNpaHZZbXBsWTNRcE8xeHVJQ0FnSUNBZ0lDQjJZWElnYTJWNUxDQmpiMjF3YkdWMFpXUWdQU0F3TzF4dVhHNGdJQ0FnSUNBZ0lIZG9hV3hsSUNnb2EyVjVJRDBnYVhSbGNpZ3BLU0FoUFNCdWRXeHNLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpiMjF3YkdWMFpXUWdLejBnTVR0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2wwWlhKaGRHOXlLRzlpYW1WamRGdHJaWGxkTENCclpYa3NJRzl1YkhsZmIyNWpaU2hrYjI1bEtTazdYRzRnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNCcFppQW9ZMjl0Y0d4bGRHVmtJRDA5UFNBd0tTQmpZV3hzWW1GamF5aHVkV3hzS1R0Y2JseHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQmtiMjVsS0dWeWNpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1kyOXRjR3hsZEdWa0xTMDdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9aWEp5S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyRnNiR0poWTJzb1pYSnlLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUM4dklFTm9aV05ySUd0bGVTQnBjeUJ1ZFd4c0lHbHVJR05oYzJVZ2FYUmxjbUYwYjNJZ2FYTnVKM1FnWlhob1lYVnpkR1ZrWEc0Z0lDQWdJQ0FnSUNBZ0lDQXZMeUJoYm1RZ1pHOXVaU0J5WlhOdmJIWmxaQ0J6ZVc1amFISnZibTkxYzJ4NUxseHVJQ0FnSUNBZ0lDQWdJQ0FnWld4elpTQnBaaUFvYTJWNUlEMDlQU0J1ZFd4c0lDWW1JR052YlhCc1pYUmxaQ0E4UFNBd0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc29iblZzYkNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0I5TzF4dVhHNGdJQ0FnWVhONWJtTXVabTl5UldGamFFOW1VMlZ5YVdWeklEMWNiaUFnSUNCaGMzbHVZeTVsWVdOb1QyWlRaWEpwWlhNZ1BTQm1kVzVqZEdsdmJpQW9iMkpxTENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdZMkZzYkdKaFkyc2dQU0JmYjI1alpTaGpZV3hzWW1GamF5QjhmQ0J1YjI5d0tUdGNiaUFnSUNBZ0lDQWdiMkpxSUQwZ2IySnFJSHg4SUZ0ZE8xeHVJQ0FnSUNBZ0lDQjJZWElnYm1WNGRFdGxlU0E5SUY5clpYbEpkR1Z5WVhSdmNpaHZZbW9wTzF4dUlDQWdJQ0FnSUNCMllYSWdhMlY1SUQwZ2JtVjRkRXRsZVNncE8xeHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQnBkR1Z5WVhSbEtDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJSE41Ym1NZ1BTQjBjblZsTzF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0d0bGVTQTlQVDBnYm5Wc2JDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQmpZV3hzWW1GamF5aHVkV3hzS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lHbDBaWEpoZEc5eUtHOWlhbHRyWlhsZExDQnJaWGtzSUc5dWJIbGZiMjVqWlNobWRXNWpkR2x2YmlBb1pYSnlLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHVnljaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aGxjbklwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2EyVjVJRDBnYm1WNGRFdGxlU2dwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvYTJWNUlEMDlQU0J1ZFd4c0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z1kyRnNiR0poWTJzb2JuVnNiQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9jM2x1WXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR0Z6ZVc1akxuTmxkRWx0YldWa2FXRjBaU2hwZEdWeVlYUmxLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVhSbGNtRjBaU2dwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTa3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2MzbHVZeUE5SUdaaGJITmxPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUdsMFpYSmhkR1VvS1R0Y2JpQWdJQ0I5TzF4dVhHNWNibHh1SUNBZ0lHRnplVzVqTG1admNrVmhZMmhQWmt4cGJXbDBJRDFjYmlBZ0lDQmhjM2x1WXk1bFlXTm9UMlpNYVcxcGRDQTlJR1oxYm1OMGFXOXVJQ2h2WW1vc0lHeHBiV2wwTENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdYMlZoWTJoUFpreHBiV2wwS0d4cGJXbDBLU2h2WW1vc0lHbDBaWEpoZEc5eUxDQmpZV3hzWW1GamF5azdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHWjFibU4wYVc5dUlGOWxZV05vVDJaTWFXMXBkQ2hzYVcxcGRDa2dlMXh1WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJtZFc1amRHbHZiaUFvYjJKcUxDQnBkR1Z5WVhSdmNpd2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcklEMGdYMjl1WTJVb1kyRnNiR0poWTJzZ2ZId2dibTl2Y0NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J2WW1vZ1BTQnZZbW9nZkh3Z1cxMDdYRzRnSUNBZ0lDQWdJQ0FnSUNCMllYSWdibVY0ZEV0bGVTQTlJRjlyWlhsSmRHVnlZWFJ2Y2lodlltb3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR3hwYldsMElEdzlJREFwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWTJGc2JHSmhZMnNvYm5Wc2JDazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ1pHOXVaU0E5SUdaaGJITmxPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJSEoxYm01cGJtY2dQU0F3TzF4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdWeWNtOXlaV1FnUFNCbVlXeHpaVHRjYmx4dUlDQWdJQ0FnSUNBZ0lDQWdLR1oxYm1OMGFXOXVJSEpsY0d4bGJtbHphQ0FvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR1J2Ym1VZ0ppWWdjblZ1Ym1sdVp5QThQU0F3S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQmpZV3hzWW1GamF5aHVkV3hzS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjNhR2xzWlNBb2NuVnVibWx1WnlBOElHeHBiV2wwSUNZbUlDRmxjbkp2Y21Wa0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhaaGNpQnJaWGtnUFNCdVpYaDBTMlY1S0NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoclpYa2dQVDA5SUc1MWJHd3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1J2Ym1VZ1BTQjBjblZsTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tISjFibTVwYm1jZ1BEMGdNQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktHNTFiR3dwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEoxYm01cGJtY2dLejBnTVR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhWFJsY21GMGIzSW9iMkpxVzJ0bGVWMHNJR3RsZVN3Z2IyNXNlVjl2Ym1ObEtHWjFibU4wYVc5dUlDaGxjbklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKMWJtNXBibWNnTFQwZ01UdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hsY25JcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheWhsY25JcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1Z5Y205eVpXUWdQU0IwY25WbE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVndiR1Z1YVhOb0tDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwcEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCOUtTZ3BPMXh1SUNBZ0lDQWdJQ0I5TzF4dUlDQWdJSDFjYmx4dVhHNGdJQ0FnWm5WdVkzUnBiMjRnWkc5UVlYSmhiR3hsYkNobWJpa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdablZ1WTNScGIyNGdLRzlpYWl3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWm00b1lYTjVibU11WldGamFFOW1MQ0J2WW1vc0lHbDBaWEpoZEc5eUxDQmpZV3hzWW1GamF5azdYRzRnSUNBZ0lDQWdJSDA3WEc0Z0lDQWdmVnh1SUNBZ0lHWjFibU4wYVc5dUlHUnZVR0Z5WVd4c1pXeE1hVzFwZENobWJpa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdablZ1WTNScGIyNGdLRzlpYWl3Z2JHbHRhWFFzSUdsMFpYSmhkRzl5TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR1p1S0Y5bFlXTm9UMlpNYVcxcGRDaHNhVzFwZENrc0lHOWlhaXdnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1R0Y2JpQWdJQ0FnSUNBZ2ZUdGNiaUFnSUNCOVhHNGdJQ0FnWm5WdVkzUnBiMjRnWkc5VFpYSnBaWE1vWm00cElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHWjFibU4wYVc5dUlDaHZZbW9zSUdsMFpYSmhkRzl5TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR1p1S0dGemVXNWpMbVZoWTJoUFpsTmxjbWxsY3l3Z2IySnFMQ0JwZEdWeVlYUnZjaXdnWTJGc2JHSmhZMnNwTzF4dUlDQWdJQ0FnSUNCOU8xeHVJQ0FnSUgxY2JseHVJQ0FnSUdaMWJtTjBhVzl1SUY5aGMzbHVZMDFoY0NobFlXTm9abTRzSUdGeWNpd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUdOaGJHeGlZV05ySUQwZ1gyOXVZMlVvWTJGc2JHSmhZMnNnZkh3Z2JtOXZjQ2s3WEc0Z0lDQWdJQ0FnSUdGeWNpQTlJR0Z5Y2lCOGZDQmJYVHRjYmlBZ0lDQWdJQ0FnZG1GeUlISmxjM1ZzZEhNZ1BTQmZhWE5CY25KaGVVeHBhMlVvWVhKeUtTQS9JRnRkSURvZ2UzMDdYRzRnSUNBZ0lDQWdJR1ZoWTJobWJpaGhjbklzSUdaMWJtTjBhVzl1SUNoMllXeDFaU3dnYVc1a1pYZ3NJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBkR1Z5WVhSdmNpaDJZV3gxWlN3Z1puVnVZM1JwYjI0Z0tHVnljaXdnZGlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxjM1ZzZEhOYmFXNWtaWGhkSUQwZ2RqdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aGxjbklwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdJQ0FnSUgwc0lHWjFibU4wYVc5dUlDaGxjbklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJLR1Z5Y2l3Z2NtVnpkV3gwY3lrN1hHNGdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lIMWNibHh1SUNBZ0lHRnplVzVqTG0xaGNDQTlJR1J2VUdGeVlXeHNaV3dvWDJGemVXNWpUV0Z3S1R0Y2JpQWdJQ0JoYzNsdVl5NXRZWEJUWlhKcFpYTWdQU0JrYjFObGNtbGxjeWhmWVhONWJtTk5ZWEFwTzF4dUlDQWdJR0Z6ZVc1akxtMWhjRXhwYldsMElEMGdaRzlRWVhKaGJHeGxiRXhwYldsMEtGOWhjM2x1WTAxaGNDazdYRzVjYmlBZ0lDQXZMeUJ5WldSMVkyVWdiMjVzZVNCb1lYTWdZU0J6WlhKcFpYTWdkbVZ5YzJsdmJpd2dZWE1nWkc5cGJtY2djbVZrZFdObElHbHVJSEJoY21Gc2JHVnNJSGR2YmlkMFhHNGdJQ0FnTHk4Z2QyOXlheUJwYmlCdFlXNTVJSE5wZEhWaGRHbHZibk11WEc0Z0lDQWdZWE41Ym1NdWFXNXFaV04wSUQxY2JpQWdJQ0JoYzNsdVl5NW1iMnhrYkNBOVhHNGdJQ0FnWVhONWJtTXVjbVZrZFdObElEMGdablZ1WTNScGIyNGdLR0Z5Y2l3Z2JXVnRieXdnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lHRnplVzVqTG1WaFkyaFBabE5sY21sbGN5aGhjbklzSUdaMWJtTjBhVzl1SUNoNExDQnBMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhWFJsY21GMGIzSW9iV1Z0Ynl3Z2VDd2dablZ1WTNScGIyNGdLR1Z5Y2l3Z2Rpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzFsYlc4Z1BTQjJPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJLR1Z5Y2lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ2ZTd2dablZ1WTNScGIyNGdLR1Z5Y2lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvWlhKeUxDQnRaVzF2S1R0Y2JpQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHRnplVzVqTG1admJHUnlJRDFjYmlBZ0lDQmhjM2x1WXk1eVpXUjFZMlZTYVdkb2RDQTlJR1oxYm1OMGFXOXVJQ2hoY25Jc0lHMWxiVzhzSUdsMFpYSmhkRzl5TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQjJZWElnY21WMlpYSnpaV1FnUFNCZmJXRndLR0Z5Y2l3Z2FXUmxiblJwZEhrcExuSmxkbVZ5YzJVb0tUdGNiaUFnSUNBZ0lDQWdZWE41Ym1NdWNtVmtkV05sS0hKbGRtVnljMlZrTENCdFpXMXZMQ0JwZEdWeVlYUnZjaXdnWTJGc2JHSmhZMnNwTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JoYzNsdVl5NTBjbUZ1YzJadmNtMGdQU0JtZFc1amRHbHZiaUFvWVhKeUxDQnRaVzF2TENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdhV1lnS0dGeVozVnRaVzUwY3k1c1pXNW5kR2dnUFQwOUlETXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcklEMGdhWFJsY21GMGIzSTdYRzRnSUNBZ0lDQWdJQ0FnSUNCcGRHVnlZWFJ2Y2lBOUlHMWxiVzg3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnRaVzF2SUQwZ1gybHpRWEp5WVhrb1lYSnlLU0EvSUZ0ZElEb2dlMzA3WEc0Z0lDQWdJQ0FnSUgxY2JseHVJQ0FnSUNBZ0lDQmhjM2x1WXk1bFlXTm9UMllvWVhKeUxDQm1kVzVqZEdsdmJpaDJMQ0JyTENCallpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FYUmxjbUYwYjNJb2JXVnRieXdnZGl3Z2F5d2dZMklwTzF4dUlDQWdJQ0FnSUNCOUxDQm1kVzVqZEdsdmJpaGxjbklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJLR1Z5Y2l3Z2JXVnRieWs3WEc0Z0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUgwN1hHNWNiaUFnSUNCbWRXNWpkR2x2YmlCZlptbHNkR1Z5S0dWaFkyaG1iaXdnWVhKeUxDQnBkR1Z5WVhSdmNpd2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnZG1GeUlISmxjM1ZzZEhNZ1BTQmJYVHRjYmlBZ0lDQWdJQ0FnWldGamFHWnVLR0Z5Y2l3Z1puVnVZM1JwYjI0Z0tIZ3NJR2x1WkdWNExDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FYUmxjbUYwYjNJb2VDd2dablZ1WTNScGIyNGdLSFlwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9kaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWE4xYkhSekxuQjFjMmdvZTJsdVpHVjRPaUJwYm1SbGVDd2dkbUZzZFdVNklIaDlLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJQ0FnSUNCOUxDQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aGZiV0Z3S0hKbGMzVnNkSE11YzI5eWRDaG1kVzVqZEdsdmJpQW9ZU3dnWWlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCaExtbHVaR1Y0SUMwZ1lpNXBibVJsZUR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTENCbWRXNWpkR2x2YmlBb2VDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQjRMblpoYkhWbE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNrcE8xeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQmhjM2x1WXk1elpXeGxZM1FnUFZ4dUlDQWdJR0Z6ZVc1akxtWnBiSFJsY2lBOUlHUnZVR0Z5WVd4c1pXd29YMlpwYkhSbGNpazdYRzVjYmlBZ0lDQmhjM2x1WXk1elpXeGxZM1JNYVcxcGRDQTlYRzRnSUNBZ1lYTjVibU11Wm1sc2RHVnlUR2x0YVhRZ1BTQmtiMUJoY21Gc2JHVnNUR2x0YVhRb1gyWnBiSFJsY2lrN1hHNWNiaUFnSUNCaGMzbHVZeTV6Wld4bFkzUlRaWEpwWlhNZ1BWeHVJQ0FnSUdGemVXNWpMbVpwYkhSbGNsTmxjbWxsY3lBOUlHUnZVMlZ5YVdWektGOW1hV3gwWlhJcE8xeHVYRzRnSUNBZ1puVnVZM1JwYjI0Z1gzSmxhbVZqZENobFlXTm9abTRzSUdGeWNpd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUY5bWFXeDBaWElvWldGamFHWnVMQ0JoY25Jc0lHWjFibU4wYVc5dUtIWmhiSFZsTENCallpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FYUmxjbUYwYjNJb2RtRnNkV1VzSUdaMWJtTjBhVzl1S0hZcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZaWdoZGlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ2ZTd2dZMkZzYkdKaFkyc3BPMXh1SUNBZ0lIMWNiaUFnSUNCaGMzbHVZeTV5WldwbFkzUWdQU0JrYjFCaGNtRnNiR1ZzS0Y5eVpXcGxZM1FwTzF4dUlDQWdJR0Z6ZVc1akxuSmxhbVZqZEV4cGJXbDBJRDBnWkc5UVlYSmhiR3hsYkV4cGJXbDBLRjl5WldwbFkzUXBPMXh1SUNBZ0lHRnplVzVqTG5KbGFtVmpkRk5sY21sbGN5QTlJR1J2VTJWeWFXVnpLRjl5WldwbFkzUXBPMXh1WEc0Z0lDQWdablZ1WTNScGIyNGdYMk55WldGMFpWUmxjM1JsY2lobFlXTm9abTRzSUdOb1pXTnJMQ0JuWlhSU1pYTjFiSFFwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1S0dGeWNpd2diR2x0YVhRc0lHbDBaWEpoZEc5eUxDQmpZaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdablZ1WTNScGIyNGdaRzl1WlNncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWTJJcElHTmlLR2RsZEZKbGMzVnNkQ2htWVd4elpTd2dkbTlwWkNBd0tTazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUJwZEdWeVlYUmxaU2g0TENCZkxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNnaFkySXBJSEpsZEhWeWJpQmpZV3hzWW1GamF5Z3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2wwWlhKaGRHOXlLSGdzSUdaMWJtTjBhVzl1SUNoMktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaGpZaUFtSmlCamFHVmpheWgyS1NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kySW9aMlYwVW1WemRXeDBLSFJ5ZFdVc0lIZ3BLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05pSUQwZ2FYUmxjbUYwYjNJZ1BTQm1ZV3h6WlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHRnlaM1Z0Wlc1MGN5NXNaVzVuZEdnZ1BpQXpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWldGamFHWnVLR0Z5Y2l3Z2JHbHRhWFFzSUdsMFpYSmhkR1ZsTENCa2IyNWxLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kySWdQU0JwZEdWeVlYUnZjanRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwZEdWeVlYUnZjaUE5SUd4cGJXbDBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1ZoWTJobWJpaGhjbklzSUdsMFpYSmhkR1ZsTENCa2IyNWxLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQmhjM2x1WXk1aGJua2dQVnh1SUNBZ0lHRnplVzVqTG5OdmJXVWdQU0JmWTNKbFlYUmxWR1Z6ZEdWeUtHRnplVzVqTG1WaFkyaFBaaXdnZEc5Q2IyOXNMQ0JwWkdWdWRHbDBlU2s3WEc1Y2JpQWdJQ0JoYzNsdVl5NXpiMjFsVEdsdGFYUWdQU0JmWTNKbFlYUmxWR1Z6ZEdWeUtHRnplVzVqTG1WaFkyaFBaa3hwYldsMExDQjBiMEp2YjJ3c0lHbGtaVzUwYVhSNUtUdGNibHh1SUNBZ0lHRnplVzVqTG1Gc2JDQTlYRzRnSUNBZ1lYTjVibU11WlhabGNua2dQU0JmWTNKbFlYUmxWR1Z6ZEdWeUtHRnplVzVqTG1WaFkyaFBaaXdnYm05MFNXUXNJRzV2ZEVsa0tUdGNibHh1SUNBZ0lHRnplVzVqTG1WMlpYSjVUR2x0YVhRZ1BTQmZZM0psWVhSbFZHVnpkR1Z5S0dGemVXNWpMbVZoWTJoUFpreHBiV2wwTENCdWIzUkpaQ3dnYm05MFNXUXBPMXh1WEc0Z0lDQWdablZ1WTNScGIyNGdYMlpwYm1SSFpYUlNaWE4xYkhRb2Rpd2dlQ2tnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnZUR0Y2JpQWdJQ0I5WEc0Z0lDQWdZWE41Ym1NdVpHVjBaV04wSUQwZ1gyTnlaV0YwWlZSbGMzUmxjaWhoYzNsdVl5NWxZV05vVDJZc0lHbGtaVzUwYVhSNUxDQmZabWx1WkVkbGRGSmxjM1ZzZENrN1hHNGdJQ0FnWVhONWJtTXVaR1YwWldOMFUyVnlhV1Z6SUQwZ1gyTnlaV0YwWlZSbGMzUmxjaWhoYzNsdVl5NWxZV05vVDJaVFpYSnBaWE1zSUdsa1pXNTBhWFI1TENCZlptbHVaRWRsZEZKbGMzVnNkQ2s3WEc0Z0lDQWdZWE41Ym1NdVpHVjBaV04wVEdsdGFYUWdQU0JmWTNKbFlYUmxWR1Z6ZEdWeUtHRnplVzVqTG1WaFkyaFBaa3hwYldsMExDQnBaR1Z1ZEdsMGVTd2dYMlpwYm1SSFpYUlNaWE4xYkhRcE8xeHVYRzRnSUNBZ1lYTjVibU11YzI5eWRFSjVJRDBnWm5WdVkzUnBiMjRnS0dGeWNpd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUdGemVXNWpMbTFoY0NoaGNuSXNJR1oxYm1OMGFXOXVJQ2g0TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVhSbGNtRjBiM0lvZUN3Z1puVnVZM1JwYjI0Z0tHVnljaXdnWTNKcGRHVnlhV0VwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9aWEp5S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJLR1Z5Y2lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aHVkV3hzTENCN2RtRnNkV1U2SUhnc0lHTnlhWFJsY21saE9pQmpjbWwwWlhKcFlYMHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lDQWdJQ0I5TENCbWRXNWpkR2x2YmlBb1pYSnlMQ0J5WlhOMWJIUnpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWlhKeUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHTmhiR3hpWVdOcktHVnljaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheWh1ZFd4c0xDQmZiV0Z3S0hKbGMzVnNkSE11YzI5eWRDaGpiMjF3WVhKaGRHOXlLU3dnWm5WdVkzUnBiMjRnS0hncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJSGd1ZG1Gc2RXVTdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2twTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1WEc0Z0lDQWdJQ0FnSUgwcE8xeHVYRzRnSUNBZ0lDQWdJR1oxYm1OMGFXOXVJR052YlhCaGNtRjBiM0lvYkdWbWRDd2djbWxuYUhRcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQmhJRDBnYkdWbWRDNWpjbWwwWlhKcFlTd2dZaUE5SUhKcFoyaDBMbU55YVhSbGNtbGhPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdFZ1BDQmlJRDhnTFRFZ09pQmhJRDRnWWlBL0lERWdPaUF3TzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdGemVXNWpMbUYxZEc4Z1BTQm1kVzVqZEdsdmJpQW9kR0Z6YTNNc0lHTnZibU4xY25KbGJtTjVMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNCcFppQW9kSGx3Wlc5bUlHRnlaM1Z0Wlc1MGMxc3hYU0E5UFQwZ0oyWjFibU4wYVc5dUp5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0x5OGdZMjl1WTNWeWNtVnVZM2tnYVhNZ2IzQjBhVzl1WVd3c0lITm9hV1owSUhSb1pTQmhjbWR6TGx4dUlDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc2dQU0JqYjI1amRYSnlaVzVqZVR0Y2JpQWdJQ0FnSUNBZ0lDQWdJR052Ym1OMWNuSmxibU41SUQwZ2JuVnNiRHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCallXeHNZbUZqYXlBOUlGOXZibU5sS0dOaGJHeGlZV05ySUh4OElHNXZiM0FwTzF4dUlDQWdJQ0FnSUNCMllYSWdhMlY1Y3lBOUlGOXJaWGx6S0hSaGMydHpLVHRjYmlBZ0lDQWdJQ0FnZG1GeUlISmxiV0ZwYm1sdVoxUmhjMnR6SUQwZ2EyVjVjeTVzWlc1bmRHZzdYRzRnSUNBZ0lDQWdJR2xtSUNnaGNtVnRZV2x1YVc1blZHRnphM01wSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQmpZV3hzWW1GamF5aHVkV3hzS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQnBaaUFvSVdOdmJtTjFjbkpsYm1ONUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCamIyNWpkWEp5Wlc1amVTQTlJSEpsYldGcGJtbHVaMVJoYzJ0ek8xeHVJQ0FnSUNBZ0lDQjlYRzVjYmlBZ0lDQWdJQ0FnZG1GeUlISmxjM1ZzZEhNZ1BTQjdmVHRjYmlBZ0lDQWdJQ0FnZG1GeUlISjFibTVwYm1kVVlYTnJjeUE5SURBN1hHNWNiaUFnSUNBZ0lDQWdkbUZ5SUdoaGMwVnljbTl5SUQwZ1ptRnNjMlU3WEc1Y2JpQWdJQ0FnSUNBZ2RtRnlJR3hwYzNSbGJtVnljeUE5SUZ0ZE8xeHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQmhaR1JNYVhOMFpXNWxjaWhtYmlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYkdsemRHVnVaWEp6TG5WdWMyaHBablFvWm00cE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJR1oxYm1OMGFXOXVJSEpsYlc5MlpVeHBjM1JsYm1WeUtHWnVLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnYVdSNElEMGdYMmx1WkdWNFQyWW9iR2x6ZEdWdVpYSnpMQ0JtYmlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2FXUjRJRDQ5SURBcElHeHBjM1JsYm1WeWN5NXpjR3hwWTJVb2FXUjRMQ0F4S1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQjBZWE5yUTI5dGNHeGxkR1VvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlcxaGFXNXBibWRVWVhOcmN5MHRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ1gyRnljbUY1UldGamFDaHNhWE4wWlc1bGNuTXVjMnhwWTJVb01Da3NJR1oxYm1OMGFXOXVJQ2htYmlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHWnVLQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNBZ0lHRmtaRXhwYzNSbGJtVnlLR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNnaGNtVnRZV2x1YVc1blZHRnphM01wSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlodWRXeHNMQ0J5WlhOMWJIUnpLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmU2s3WEc1Y2JpQWdJQ0FnSUNBZ1gyRnljbUY1UldGamFDaHJaWGx6TENCbWRXNWpkR2x2YmlBb2F5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR2hoYzBWeWNtOXlLU0J5WlhSMWNtNDdYRzRnSUNBZ0lDQWdJQ0FnSUNCMllYSWdkR0Z6YXlBOUlGOXBjMEZ5Y21GNUtIUmhjMnR6VzJ0ZEtTQS9JSFJoYzJ0elcydGRPaUJiZEdGemEzTmJhMTFkTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUhSaGMydERZV3hzWW1GamF5QTlJRjl5WlhOMFVHRnlZVzBvWm5WdVkzUnBiMjRvWlhKeUxDQmhjbWR6S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NuVnVibWx1WjFSaGMydHpMUzA3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHRnlaM011YkdWdVozUm9JRHc5SURFcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWVhKbmN5QTlJR0Z5WjNOYk1GMDdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNobGNuSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJSE5oWm1WU1pYTjFiSFJ6SUQwZ2UzMDdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUY5bWIzSkZZV05vVDJZb2NtVnpkV3gwY3l3Z1puVnVZM1JwYjI0b2RtRnNMQ0J5YTJWNUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnpZV1psVW1WemRXeDBjMXR5YTJWNVhTQTlJSFpoYkR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lITmhabVZTWlhOMWJIUnpXMnRkSUQwZ1lYSm5jenRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FHRnpSWEp5YjNJZ1BTQjBjblZsTzF4dVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJLR1Z5Y2l3Z2MyRm1aVkpsYzNWc2RITXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WemRXeDBjMXRyWFNBOUlHRnlaM003WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRnplVzVqTG5ObGRFbHRiV1ZrYVdGMFpTaDBZWE5yUTI5dGNHeGxkR1VwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUhKbGNYVnBjbVZ6SUQwZ2RHRnpheTV6YkdsalpTZ3dMQ0IwWVhOckxteGxibWQwYUNBdElERXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0x5OGdjSEpsZG1WdWRDQmtaV0ZrTFd4dlkydHpYRzRnSUNBZ0lDQWdJQ0FnSUNCMllYSWdiR1Z1SUQwZ2NtVnhkV2x5WlhNdWJHVnVaM1JvTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdSbGNEdGNiaUFnSUNBZ0lDQWdJQ0FnSUhkb2FXeGxJQ2hzWlc0dExTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNnaEtHUmxjQ0E5SUhSaGMydHpXM0psY1hWcGNtVnpXMnhsYmwxZEtTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGFISnZkeUJ1WlhjZ1JYSnliM0lvSjBoaGN5QnViMjVsZUdsemRHVnVkQ0JrWlhCbGJtUmxibU41SUdsdUlDY2dLeUJ5WlhGMWFYSmxjeTVxYjJsdUtDY3NJQ2NwS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLRjlwYzBGeWNtRjVLR1JsY0NrZ0ppWWdYMmx1WkdWNFQyWW9aR1Z3TENCcktTQStQU0F3S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFJvY205M0lHNWxkeUJGY25KdmNpZ25TR0Z6SUdONVkyeHBZeUJrWlhCbGJtUmxibU5wWlhNbktUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUJ5WldGa2VTZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdjblZ1Ym1sdVoxUmhjMnR6SUR3Z1kyOXVZM1Z5Y21WdVkza2dKaVlnWDNKbFpIVmpaU2h5WlhGMWFYSmxjeXdnWm5WdVkzUnBiMjRnS0dFc0lIZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUNoaElDWW1JSEpsYzNWc2RITXVhR0Z6VDNkdVVISnZjR1Z5ZEhrb2VDa3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDBzSUhSeWRXVXBJQ1ltSUNGeVpYTjFiSFJ6TG1oaGMwOTNibEJ5YjNCbGNuUjVLR3NwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLSEpsWVdSNUtDa3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5ZFc1dWFXNW5WR0Z6YTNNckt6dGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBZWE5yVzNSaGMyc3ViR1Z1WjNSb0lDMGdNVjBvZEdGemEwTmhiR3hpWVdOckxDQnlaWE4xYkhSektUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRmtaRXhwYzNSbGJtVnlLR3hwYzNSbGJtVnlLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUdaMWJtTjBhVzl1SUd4cGMzUmxibVZ5S0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2h5WldGa2VTZ3BLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISjFibTVwYm1kVVlYTnJjeXNyTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaVzF2ZG1WTWFYTjBaVzVsY2loc2FYTjBaVzVsY2lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFJoYzJ0YmRHRnpheTVzWlc1bmRHZ2dMU0F4WFNoMFlYTnJRMkZzYkdKaFkyc3NJSEpsYzNWc2RITXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdmVHRjYmx4dVhHNWNiaUFnSUNCaGMzbHVZeTV5WlhSeWVTQTlJR1oxYm1OMGFXOXVLSFJwYldWekxDQjBZWE5yTENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQjJZWElnUkVWR1FWVk1WRjlVU1UxRlV5QTlJRFU3WEc0Z0lDQWdJQ0FnSUhaaGNpQkVSVVpCVlV4VVgwbE9WRVZTVmtGTUlEMGdNRHRjYmx4dUlDQWdJQ0FnSUNCMllYSWdZWFIwWlcxd2RITWdQU0JiWFR0Y2JseHVJQ0FnSUNBZ0lDQjJZWElnYjNCMGN5QTlJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUnBiV1Z6T2lCRVJVWkJWVXhVWDFSSlRVVlRMRnh1SUNBZ0lDQWdJQ0FnSUNBZ2FXNTBaWEoyWVd3NklFUkZSa0ZWVEZSZlNVNVVSVkpXUVV4Y2JpQWdJQ0FnSUNBZ2ZUdGNibHh1SUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUJ3WVhKelpWUnBiV1Z6S0dGall5d2dkQ2w3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaWgwZVhCbGIyWWdkQ0E5UFQwZ0oyNTFiV0psY2ljcGUxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRmpZeTUwYVcxbGN5QTlJSEJoY25ObFNXNTBLSFFzSURFd0tTQjhmQ0JFUlVaQlZVeFVYMVJKVFVWVE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNCbGJITmxJR2xtS0hSNWNHVnZaaUIwSUQwOVBTQW5iMkpxWldOMEp5bDdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZV05qTG5ScGJXVnpJRDBnY0dGeWMyVkpiblFvZEM1MGFXMWxjeXdnTVRBcElIeDhJRVJGUmtGVlRGUmZWRWxOUlZNN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1lXTmpMbWx1ZEdWeWRtRnNJRDBnY0dGeWMyVkpiblFvZEM1cGJuUmxjblpoYkN3Z01UQXBJSHg4SUVSRlJrRlZURlJmU1U1VVJWSldRVXc3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUm9jbTkzSUc1bGR5QkZjbkp2Y2lnblZXNXpkWEJ3YjNKMFpXUWdZWEpuZFcxbGJuUWdkSGx3WlNCbWIzSWdYRnduZEdsdFpYTmNYQ2M2SUNjZ0t5QjBlWEJsYjJZZ2RDazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIMWNibHh1SUNBZ0lDQWdJQ0IyWVhJZ2JHVnVaM1JvSUQwZ1lYSm5kVzFsYm5SekxteGxibWQwYUR0Y2JpQWdJQ0FnSUNBZ2FXWWdLR3hsYm1kMGFDQThJREVnZkh3Z2JHVnVaM1JvSUQ0Z015a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHliM2NnYm1WM0lFVnljbTl5S0NkSmJuWmhiR2xrSUdGeVozVnRaVzUwY3lBdElHMTFjM1FnWW1VZ1pXbDBhR1Z5SUNoMFlYTnJLU3dnS0hSaGMyc3NJR05oYkd4aVlXTnJLU3dnS0hScGJXVnpMQ0IwWVhOcktTQnZjaUFvZEdsdFpYTXNJSFJoYzJzc0lHTmhiR3hpWVdOcktTY3BPMXh1SUNBZ0lDQWdJQ0I5SUdWc2MyVWdhV1lnS0d4bGJtZDBhQ0E4UFNBeUlDWW1JSFI1Y0dWdlppQjBhVzFsY3lBOVBUMGdKMloxYm1OMGFXOXVKeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc2dQU0IwWVhOck8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdGemF5QTlJSFJwYldWek8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJR2xtSUNoMGVYQmxiMllnZEdsdFpYTWdJVDA5SUNkbWRXNWpkR2x2YmljcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhCaGNuTmxWR2x0WlhNb2IzQjBjeXdnZEdsdFpYTXBPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUc5d2RITXVZMkZzYkdKaFkyc2dQU0JqWVd4c1ltRmphenRjYmlBZ0lDQWdJQ0FnYjNCMGN5NTBZWE5ySUQwZ2RHRnphenRjYmx4dUlDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCM2NtRndjR1ZrVkdGemF5aDNjbUZ3Y0dWa1EyRnNiR0poWTJzc0lIZHlZWEJ3WldSU1pYTjFiSFJ6S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUJ5WlhSeWVVRjBkR1Z0Y0hRb2RHRnpheXdnWm1sdVlXeEJkSFJsYlhCMEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHWjFibU4wYVc5dUtITmxjbWxsYzBOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFJoYzJzb1puVnVZM1JwYjI0b1pYSnlMQ0J5WlhOMWJIUXBlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjMlZ5YVdWelEyRnNiR0poWTJzb0lXVnljaUI4ZkNCbWFXNWhiRUYwZEdWdGNIUXNJSHRsY25JNklHVnljaXdnY21WemRXeDBPaUJ5WlhOMWJIUjlLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTd2dkM0poY0hCbFpGSmxjM1ZzZEhNcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMDdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNWNiaUFnSUNBZ0lDQWdJQ0FnSUdaMWJtTjBhVzl1SUhKbGRISjVTVzUwWlhKMllXd29hVzUwWlhKMllXd3BlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQm1kVzVqZEdsdmJpaHpaWEpwWlhORFlXeHNZbUZqYXlsN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSE5sZEZScGJXVnZkWFFvWm5WdVkzUnBiMjRvS1h0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhObGNtbGxjME5oYkd4aVlXTnJLRzUxYkd3cE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5TENCcGJuUmxjblpoYkNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JseHVJQ0FnSUNBZ0lDQWdJQ0FnZDJocGJHVWdLRzl3ZEhNdWRHbHRaWE1wSUh0Y2JseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJtYVc1aGJFRjBkR1Z0Y0hRZ1BTQWhLRzl3ZEhNdWRHbHRaWE10UFRFcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRjBkR1Z0Y0hSekxuQjFjMmdvY21WMGNubEJkSFJsYlhCMEtHOXdkSE11ZEdGemF5d2dabWx1WVd4QmRIUmxiWEIwS1NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWW9JV1pwYm1Gc1FYUjBaVzF3ZENBbUppQnZjSFJ6TG1sdWRHVnlkbUZzSUQ0Z01DbDdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdGMGRHVnRjSFJ6TG5CMWMyZ29jbVYwY25sSmJuUmxjblpoYkNodmNIUnpMbWx1ZEdWeWRtRnNLU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1WEc0Z0lDQWdJQ0FnSUNBZ0lDQmhjM2x1WXk1elpYSnBaWE1vWVhSMFpXMXdkSE1zSUdaMWJtTjBhVzl1S0dSdmJtVXNJR1JoZEdFcGUxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHUmhkR0VnUFNCa1lYUmhXMlJoZEdFdWJHVnVaM1JvSUMwZ01WMDdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdLSGR5WVhCd1pXUkRZV3hzWW1GamF5QjhmQ0J2Y0hSekxtTmhiR3hpWVdOcktTaGtZWFJoTG1WeWNpd2daR0YwWVM1eVpYTjFiSFFwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdJQ0FnSUgxY2JseHVJQ0FnSUNBZ0lDQXZMeUJKWmlCaElHTmhiR3hpWVdOcklHbHpJSEJoYzNObFpDd2djblZ1SUhSb2FYTWdZWE1nWVNCamIyNTBjbTlzYkNCbWJHOTNYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQnZjSFJ6TG1OaGJHeGlZV05ySUQ4Z2QzSmhjSEJsWkZSaGMyc29LU0E2SUhkeVlYQndaV1JVWVhOck8xeHVJQ0FnSUgwN1hHNWNiaUFnSUNCaGMzbHVZeTUzWVhSbGNtWmhiR3dnUFNCbWRXNWpkR2x2YmlBb2RHRnphM01zSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lHTmhiR3hpWVdOcklEMGdYMjl1WTJVb1kyRnNiR0poWTJzZ2ZId2dibTl2Y0NrN1hHNGdJQ0FnSUNBZ0lHbG1JQ2doWDJselFYSnlZWGtvZEdGemEzTXBLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnWlhKeUlEMGdibVYzSUVWeWNtOXlLQ2RHYVhKemRDQmhjbWQxYldWdWRDQjBieUIzWVhSbGNtWmhiR3dnYlhWemRDQmlaU0JoYmlCaGNuSmhlU0J2WmlCbWRXNWpkR2x2Ym5NbktUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJqWVd4c1ltRmpheWhsY25JcE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJR2xtSUNnaGRHRnphM011YkdWdVozUm9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z1kyRnNiR0poWTJzb0tUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUIzY21Gd1NYUmxjbUYwYjNJb2FYUmxjbUYwYjNJcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJmY21WemRGQmhjbUZ0S0daMWJtTjBhVzl1SUNobGNuSXNJR0Z5WjNNcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWlhKeUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yTG1Gd2NHeDVLRzUxYkd3c0lGdGxjbkpkTG1OdmJtTmhkQ2hoY21kektTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2JtVjRkQ0E5SUdsMFpYSmhkRzl5TG01bGVIUW9LVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLRzVsZUhRcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRnlaM011Y0hWemFDaDNjbUZ3U1hSbGNtRjBiM0lvYm1WNGRDa3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1lYSm5jeTV3ZFhOb0tHTmhiR3hpWVdOcktUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmxibk4xY21WQmMzbHVZeWhwZEdWeVlYUnZjaWt1WVhCd2JIa29iblZzYkN3Z1lYSm5jeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2QzSmhjRWwwWlhKaGRHOXlLR0Z6ZVc1akxtbDBaWEpoZEc5eUtIUmhjMnR6S1Nrb0tUdGNiaUFnSUNCOU8xeHVYRzRnSUNBZ1puVnVZM1JwYjI0Z1gzQmhjbUZzYkdWc0tHVmhZMmhtYml3Z2RHRnphM01zSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lHTmhiR3hpWVdOcklEMGdZMkZzYkdKaFkyc2dmSHdnYm05dmNEdGNiaUFnSUNBZ0lDQWdkbUZ5SUhKbGMzVnNkSE1nUFNCZmFYTkJjbkpoZVV4cGEyVW9kR0Z6YTNNcElEOGdXMTBnT2lCN2ZUdGNibHh1SUNBZ0lDQWdJQ0JsWVdOb1ptNG9kR0Z6YTNNc0lHWjFibU4wYVc5dUlDaDBZWE5yTENCclpYa3NJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBZWE5yS0Y5eVpYTjBVR0Z5WVcwb1puVnVZM1JwYjI0Z0tHVnljaXdnWVhKbmN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoaGNtZHpMbXhsYm1kMGFDQThQU0F4S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR0Z5WjNNZ1BTQmhjbWR6V3pCZE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWE4xYkhSelcydGxlVjBnUFNCaGNtZHpPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJLR1Z5Y2lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1NrN1hHNGdJQ0FnSUNBZ0lIMHNJR1oxYm1OMGFXOXVJQ2hsY25JcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yS0dWeWNpd2djbVZ6ZFd4MGN5azdYRzRnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJSDFjYmx4dUlDQWdJR0Z6ZVc1akxuQmhjbUZzYkdWc0lEMGdablZ1WTNScGIyNGdLSFJoYzJ0ekxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0JmY0dGeVlXeHNaV3dvWVhONWJtTXVaV0ZqYUU5bUxDQjBZWE5yY3l3Z1kyRnNiR0poWTJzcE8xeHVJQ0FnSUgwN1hHNWNiaUFnSUNCaGMzbHVZeTV3WVhKaGJHeGxiRXhwYldsMElEMGdablZ1WTNScGIyNG9kR0Z6YTNNc0lHeHBiV2wwTENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQmZjR0Z5WVd4c1pXd29YMlZoWTJoUFpreHBiV2wwS0d4cGJXbDBLU3dnZEdGemEzTXNJR05oYkd4aVlXTnJLVHRjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdZWE41Ym1NdWMyVnlhV1Z6SUQwZ1puVnVZM1JwYjI0b2RHRnphM01zSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lGOXdZWEpoYkd4bGJDaGhjM2x1WXk1bFlXTm9UMlpUWlhKcFpYTXNJSFJoYzJ0ekxDQmpZV3hzWW1GamF5azdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHRnplVzVqTG1sMFpYSmhkRzl5SUQwZ1puVnVZM1JwYjI0Z0tIUmhjMnR6S1NCN1hHNGdJQ0FnSUNBZ0lHWjFibU4wYVc5dUlHMWhhMlZEWVd4c1ltRmpheWhwYm1SbGVDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1puVnVZM1JwYjI0Z1ptNG9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tIUmhjMnR6TG14bGJtZDBhQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBZWE5yYzF0cGJtUmxlRjB1WVhCd2JIa29iblZzYkN3Z1lYSm5kVzFsYm5SektUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHWnVMbTVsZUhRb0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJR1p1TG01bGVIUWdQU0JtZFc1amRHbHZiaUFvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUNocGJtUmxlQ0E4SUhSaGMydHpMbXhsYm1kMGFDQXRJREVwSUQ4Z2JXRnJaVU5oYkd4aVlXTnJLR2x1WkdWNElDc2dNU2s2SUc1MWJHdzdYRzRnSUNBZ0lDQWdJQ0FnSUNCOU8xeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR1p1TzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCdFlXdGxRMkZzYkdKaFkyc29NQ2s3WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR0Z6ZVc1akxtRndjR3g1SUQwZ1gzSmxjM1JRWVhKaGJTaG1kVzVqZEdsdmJpQW9abTRzSUdGeVozTXBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJRjl5WlhOMFVHRnlZVzBvWm5WdVkzUnBiMjRnS0dOaGJHeEJjbWR6S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdabTR1WVhCd2JIa29YRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdiblZzYkN3Z1lYSm5jeTVqYjI1allYUW9ZMkZzYkVGeVozTXBYRzRnSUNBZ0lDQWdJQ0FnSUNBcE8xeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQjlLVHRjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjlqYjI1allYUW9aV0ZqYUdadUxDQmhjbklzSUdadUxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0IyWVhJZ2NtVnpkV3gwSUQwZ1cxMDdYRzRnSUNBZ0lDQWdJR1ZoWTJobWJpaGhjbklzSUdaMWJtTjBhVzl1SUNoNExDQnBibVJsZUN3Z1kySXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHWnVLSGdzSUdaMWJtTjBhVzl1SUNobGNuSXNJSGtwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYTjFiSFFnUFNCeVpYTjFiSFF1WTI5dVkyRjBLSGtnZkh3Z1cxMHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05pS0dWeWNpazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNiaUFnSUNBZ0lDQWdmU3dnWm5WdVkzUnBiMjRnS0dWeWNpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1kyRnNiR0poWTJzb1pYSnlMQ0J5WlhOMWJIUXBPMXh1SUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0I5WEc0Z0lDQWdZWE41Ym1NdVkyOXVZMkYwSUQwZ1pHOVFZWEpoYkd4bGJDaGZZMjl1WTJGMEtUdGNiaUFnSUNCaGMzbHVZeTVqYjI1allYUlRaWEpwWlhNZ1BTQmtiMU5sY21sbGN5aGZZMjl1WTJGMEtUdGNibHh1SUNBZ0lHRnplVzVqTG5kb2FXeHpkQ0E5SUdaMWJtTjBhVzl1SUNoMFpYTjBMQ0JwZEdWeVlYUnZjaXdnWTJGc2JHSmhZMnNwSUh0Y2JpQWdJQ0FnSUNBZ1kyRnNiR0poWTJzZ1BTQmpZV3hzWW1GamF5QjhmQ0J1YjI5d08xeHVJQ0FnSUNBZ0lDQnBaaUFvZEdWemRDZ3BLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnYm1WNGRDQTlJRjl5WlhOMFVHRnlZVzBvWm5WdVkzUnBiMjRvWlhKeUxDQmhjbWR6S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR1Z5Y2lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheWhsY25JcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMGdaV3h6WlNCcFppQW9kR1Z6ZEM1aGNIQnNlU2gwYUdsekxDQmhjbWR6S1NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwZEdWeVlYUnZjaWh1WlhoMEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheTVoY0hCc2VTaHVkV3hzTENCYmJuVnNiRjB1WTI5dVkyRjBLR0Z5WjNNcEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsMFpYSmhkRzl5S0c1bGVIUXBPMXh1SUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1kyRnNiR0poWTJzb2JuVnNiQ2s3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0I5TzF4dVhHNGdJQ0FnWVhONWJtTXVaRzlYYUdsc2MzUWdQU0JtZFc1amRHbHZiaUFvYVhSbGNtRjBiM0lzSUhSbGMzUXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUhaaGNpQmpZV3hzY3lBOUlEQTdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQmhjM2x1WXk1M2FHbHNjM1FvWm5WdVkzUnBiMjRvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdLeXRqWVd4c2N5QThQU0F4SUh4OElIUmxjM1F1WVhCd2JIa29kR2hwY3l3Z1lYSm5kVzFsYm5SektUdGNiaUFnSUNBZ0lDQWdmU3dnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1R0Y2JpQWdJQ0I5TzF4dVhHNGdJQ0FnWVhONWJtTXVkVzUwYVd3Z1BTQm1kVzVqZEdsdmJpQW9kR1Z6ZEN3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQmhjM2x1WXk1M2FHbHNjM1FvWm5WdVkzUnBiMjRvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdJWFJsYzNRdVlYQndiSGtvZEdocGN5d2dZWEpuZFcxbGJuUnpLVHRjYmlBZ0lDQWdJQ0FnZlN3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktUdGNiaUFnSUNCOU8xeHVYRzRnSUNBZ1lYTjVibU11Wkc5VmJuUnBiQ0E5SUdaMWJtTjBhVzl1SUNocGRHVnlZWFJ2Y2l3Z2RHVnpkQ3dnWTJGc2JHSmhZMnNwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdGemVXNWpMbVJ2VjJocGJITjBLR2wwWlhKaGRHOXlMQ0JtZFc1amRHbHZiaWdwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQWhkR1Z6ZEM1aGNIQnNlU2gwYUdsekxDQmhjbWQxYldWdWRITXBPMXh1SUNBZ0lDQWdJQ0I5TENCallXeHNZbUZqYXlrN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdGemVXNWpMbVIxY21sdVp5QTlJR1oxYm1OMGFXOXVJQ2gwWlhOMExDQnBkR1Z5WVhSdmNpd2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNnUFNCallXeHNZbUZqYXlCOGZDQnViMjl3TzF4dVhHNGdJQ0FnSUNBZ0lIWmhjaUJ1WlhoMElEMGdYM0psYzNSUVlYSmhiU2htZFc1amRHbHZiaWhsY25Jc0lHRnlaM01wSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNobGNuSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheWhsY25JcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JoY21kekxuQjFjMmdvWTJobFkyc3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFJsYzNRdVlYQndiSGtvZEdocGN5d2dZWEpuY3lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgwcE8xeHVYRzRnSUNBZ0lDQWdJSFpoY2lCamFHVmpheUE5SUdaMWJtTjBhVzl1S0dWeWNpd2dkSEoxZEdncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaGxjbklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlobGNuSXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTQmxiSE5sSUdsbUlDaDBjblYwYUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbDBaWEpoZEc5eUtHNWxlSFFwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aHVkV3hzS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZlR0Y2JseHVJQ0FnSUNBZ0lDQjBaWE4wS0dOb1pXTnJLVHRjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdZWE41Ym1NdVpHOUVkWEpwYm1jZ1BTQm1kVzVqZEdsdmJpQW9hWFJsY21GMGIzSXNJSFJsYzNRc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJSFpoY2lCallXeHNjeUE5SURBN1hHNGdJQ0FnSUNBZ0lHRnplVzVqTG1SMWNtbHVaeWhtZFc1amRHbHZiaWh1WlhoMEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9ZMkZzYkhNckt5QThJREVwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdVpYaDBLRzUxYkd3c0lIUnlkV1VwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBaWE4wTG1Gd2NHeDVLSFJvYVhNc0lHRnlaM1Z0Wlc1MGN5azdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIMHNJR2wwWlhKaGRHOXlMQ0JqWVd4c1ltRmpheWs3WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjl4ZFdWMVpTaDNiM0pyWlhJc0lHTnZibU4xY25KbGJtTjVMQ0J3WVhsc2IyRmtLU0I3WEc0Z0lDQWdJQ0FnSUdsbUlDaGpiMjVqZFhKeVpXNWplU0E5UFNCdWRXeHNLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpiMjVqZFhKeVpXNWplU0E5SURFN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdaV3h6WlNCcFppaGpiMjVqZFhKeVpXNWplU0E5UFQwZ01Da2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHliM2NnYm1WM0lFVnljbTl5S0NkRGIyNWpkWEp5Wlc1amVTQnRkWE4wSUc1dmRDQmlaU0I2WlhKdkp5azdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnWm5WdVkzUnBiMjRnWDJsdWMyVnlkQ2h4TENCa1lYUmhMQ0J3YjNNc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9ZMkZzYkdKaFkyc2dJVDBnYm5Wc2JDQW1KaUIwZVhCbGIyWWdZMkZzYkdKaFkyc2dJVDA5SUZ3aVpuVnVZM1JwYjI1Y0lpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFJvY205M0lHNWxkeUJGY25KdmNpaGNJblJoYzJzZ1kyRnNiR0poWTJzZ2JYVnpkQ0JpWlNCaElHWjFibU4wYVc5dVhDSXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnY1M1emRHRnlkR1ZrSUQwZ2RISjFaVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2doWDJselFYSnlZWGtvWkdGMFlTa3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JrWVhSaElEMGdXMlJoZEdGZE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lvWkdGMFlTNXNaVzVuZEdnZ1BUMDlJREFnSmlZZ2NTNXBaR3hsS0NrcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQXZMeUJqWVd4c0lHUnlZV2x1SUdsdGJXVmthV0YwWld4NUlHbG1JSFJvWlhKbElHRnlaU0J1YnlCMFlYTnJjMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQmhjM2x1WXk1elpYUkpiVzFsWkdsaGRHVW9ablZ1WTNScGIyNG9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIRXVaSEpoYVc0b0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUY5aGNuSmhlVVZoWTJnb1pHRjBZU3dnWm5WdVkzUnBiMjRvZEdGemF5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCcGRHVnRJRDBnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmtZWFJoT2lCMFlYTnJMRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXpvZ1kyRnNiR0poWTJzZ2ZId2dibTl2Y0Z4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwN1hHNWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvY0c5ektTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhFdWRHRnphM011ZFc1emFHbG1kQ2hwZEdWdEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J4TG5SaGMydHpMbkIxYzJnb2FYUmxiU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLSEV1ZEdGemEzTXViR1Z1WjNSb0lEMDlQU0J4TG1OdmJtTjFjbkpsYm1ONUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhFdWMyRjBkWEpoZEdWa0tDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJQ0FnSUNCaGMzbHVZeTV6WlhSSmJXMWxaR2xoZEdVb2NTNXdjbTlqWlhOektUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUJmYm1WNGRDaHhMQ0IwWVhOcmN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1S0NsN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2QyOXlhMlZ5Y3lBdFBTQXhPMXh1WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlISmxiVzkyWldRZ1BTQm1ZV3h6WlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMllYSWdZWEpuY3lBOUlHRnlaM1Z0Wlc1MGN6dGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmZZWEp5WVhsRllXTm9LSFJoYzJ0ekxDQm1kVzVqZEdsdmJpQW9kR0Z6YXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JmWVhKeVlYbEZZV05vS0hkdmNtdGxjbk5NYVhOMExDQm1kVzVqZEdsdmJpQW9kMjl5YTJWeUxDQnBibVJsZUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLSGR2Y210bGNpQTlQVDBnZEdGemF5QW1KaUFoY21WdGIzWmxaQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIZHZjbXRsY25OTWFYTjBMbk53YkdsalpTaHBibVJsZUN3Z01TazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WdGIzWmxaQ0E5SUhSeWRXVTdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwcE8xeHVYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSaGMyc3VZMkZzYkdKaFkyc3VZWEJ3Ykhrb2RHRnpheXdnWVhKbmN5azdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tIRXVkR0Z6YTNNdWJHVnVaM1JvSUNzZ2QyOXlhMlZ5Y3lBOVBUMGdNQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnhMbVJ5WVdsdUtDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEV1Y0hKdlkyVnpjeWdwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVHRjYmlBZ0lDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNBZ0lIWmhjaUIzYjNKclpYSnpJRDBnTUR0Y2JpQWdJQ0FnSUNBZ2RtRnlJSGR2Y210bGNuTk1hWE4wSUQwZ1cxMDdYRzRnSUNBZ0lDQWdJSFpoY2lCeElEMGdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHRnphM002SUZ0ZExGeHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dVkzVnljbVZ1WTNrNklHTnZibU4xY25KbGJtTjVMRnh1SUNBZ0lDQWdJQ0FnSUNBZ2NHRjViRzloWkRvZ2NHRjViRzloWkN4Y2JpQWdJQ0FnSUNBZ0lDQWdJSE5oZEhWeVlYUmxaRG9nYm05dmNDeGNiaUFnSUNBZ0lDQWdJQ0FnSUdWdGNIUjVPaUJ1YjI5d0xGeHVJQ0FnSUNBZ0lDQWdJQ0FnWkhKaGFXNDZJRzV2YjNBc1hHNGdJQ0FnSUNBZ0lDQWdJQ0J6ZEdGeWRHVmtPaUJtWVd4elpTeGNiaUFnSUNBZ0lDQWdJQ0FnSUhCaGRYTmxaRG9nWm1Gc2MyVXNYRzRnSUNBZ0lDQWdJQ0FnSUNCd2RYTm9PaUJtZFc1amRHbHZiaUFvWkdGMFlTd2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JmYVc1elpYSjBLSEVzSUdSaGRHRXNJR1poYkhObExDQmpZV3hzWW1GamF5azdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUxGeHVJQ0FnSUNBZ0lDQWdJQ0FnYTJsc2JEb2dablZ1WTNScGIyNGdLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhFdVpISmhhVzRnUFNCdWIyOXdPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEV1ZEdGemEzTWdQU0JiWFR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBzWEc0Z0lDQWdJQ0FnSUNBZ0lDQjFibk5vYVdaME9pQm1kVzVqZEdsdmJpQW9aR0YwWVN3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmZhVzV6WlhKMEtIRXNJR1JoZEdFc0lIUnlkV1VzSUdOaGJHeGlZV05yS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBzWEc0Z0lDQWdJQ0FnSUNBZ0lDQndjbTlqWlhOek9pQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZDJocGJHVW9JWEV1Y0dGMWMyVmtJQ1ltSUhkdmNtdGxjbk1nUENCeExtTnZibU4xY25KbGJtTjVJQ1ltSUhFdWRHRnphM011YkdWdVozUm9LWHRjYmx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnZEdGemEzTWdQU0J4TG5CaGVXeHZZV1FnUDF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY1M1MFlYTnJjeTV6Y0d4cFkyVW9NQ3dnY1M1d1lYbHNiMkZrS1NBNlhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeExuUmhjMnR6TG5Od2JHbGpaU2d3TENCeExuUmhjMnR6TG14bGJtZDBhQ2s3WEc1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdSaGRHRWdQU0JmYldGd0tIUmhjMnR6TENCbWRXNWpkR2x2YmlBb2RHRnpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJSFJoYzJzdVpHRjBZVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzVjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLSEV1ZEdGemEzTXViR1Z1WjNSb0lEMDlQU0F3S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeExtVnRjSFI1S0NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2QyOXlhMlZ5Y3lBclBTQXhPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCM2IzSnJaWEp6VEdsemRDNXdkWE5vS0hSaGMydHpXekJkS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdOaUlEMGdiMjVzZVY5dmJtTmxLRjl1WlhoMEtIRXNJSFJoYzJ0ektTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhkdmNtdGxjaWhrWVhSaExDQmpZaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdmU3hjYmlBZ0lDQWdJQ0FnSUNBZ0lHeGxibWQwYURvZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQnhMblJoYzJ0ekxteGxibWQwYUR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBzWEc0Z0lDQWdJQ0FnSUNBZ0lDQnlkVzV1YVc1bk9pQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJSGR2Y210bGNuTTdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUxGeHVJQ0FnSUNBZ0lDQWdJQ0FnZDI5eWEyVnljMHhwYzNRNklHWjFibU4wYVc5dUlDZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdkMjl5YTJWeWMweHBjM1E3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlMRnh1SUNBZ0lDQWdJQ0FnSUNBZ2FXUnNaVG9nWm5WdVkzUnBiMjRvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUhFdWRHRnphM011YkdWdVozUm9JQ3NnZDI5eWEyVnljeUE5UFQwZ01EdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwc1hHNGdJQ0FnSUNBZ0lDQWdJQ0J3WVhWelpUb2dablZ1WTNScGIyNGdLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhFdWNHRjFjMlZrSUQwZ2RISjFaVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHNYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYTjFiV1U2SUdaMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvY1M1d1lYVnpaV1FnUFQwOUlHWmhiSE5sS1NCN0lISmxkSFZ5YmpzZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIRXVjR0YxYzJWa0lEMGdabUZzYzJVN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJSEpsYzNWdFpVTnZkVzUwSUQwZ1RXRjBhQzV0YVc0b2NTNWpiMjVqZFhKeVpXNWplU3dnY1M1MFlYTnJjeTVzWlc1bmRHZ3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQzh2SUU1bFpXUWdkRzhnWTJGc2JDQnhMbkJ5YjJObGMzTWdiMjVqWlNCd1pYSWdZMjl1WTNWeWNtVnVkRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQzh2SUhkdmNtdGxjaUIwYnlCd2NtVnpaWEoyWlNCbWRXeHNJR052Ym1OMWNuSmxibU41SUdGbWRHVnlJSEJoZFhObFhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1ptOXlJQ2gyWVhJZ2R5QTlJREU3SUhjZ1BEMGdjbVZ6ZFcxbFEyOTFiblE3SUhjckt5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCaGMzbHVZeTV6WlhSSmJXMWxaR2xoZEdVb2NTNXdjbTlqWlhOektUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIMDdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQnhPMXh1SUNBZ0lIMWNibHh1SUNBZ0lHRnplVzVqTG5GMVpYVmxJRDBnWm5WdVkzUnBiMjRnS0hkdmNtdGxjaXdnWTI5dVkzVnljbVZ1WTNrcElIdGNiaUFnSUNBZ0lDQWdkbUZ5SUhFZ1BTQmZjWFZsZFdVb1puVnVZM1JwYjI0Z0tHbDBaVzF6TENCallpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2QyOXlhMlZ5S0dsMFpXMXpXekJkTENCallpazdYRzRnSUNBZ0lDQWdJSDBzSUdOdmJtTjFjbkpsYm1ONUxDQXhLVHRjYmx4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnY1R0Y2JpQWdJQ0I5TzF4dVhHNGdJQ0FnWVhONWJtTXVjSEpwYjNKcGRIbFJkV1YxWlNBOUlHWjFibU4wYVc5dUlDaDNiM0pyWlhJc0lHTnZibU4xY25KbGJtTjVLU0I3WEc1Y2JpQWdJQ0FnSUNBZ1puVnVZM1JwYjI0Z1gyTnZiWEJoY21WVVlYTnJjeWhoTENCaUtYdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJoTG5CeWFXOXlhWFI1SUMwZ1lpNXdjbWx2Y21sMGVUdGNiaUFnSUNBZ0lDQWdmVnh1WEc0Z0lDQWdJQ0FnSUdaMWJtTjBhVzl1SUY5aWFXNWhjbmxUWldGeVkyZ29jMlZ4ZFdWdVkyVXNJR2wwWlcwc0lHTnZiWEJoY21VcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQmlaV2NnUFNBdE1TeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmxibVFnUFNCelpYRjFaVzVqWlM1c1pXNW5kR2dnTFNBeE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZDJocGJHVWdLR0psWnlBOElHVnVaQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhaaGNpQnRhV1FnUFNCaVpXY2dLeUFvS0dWdVpDQXRJR0psWnlBcklERXBJRDQrUGlBeEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWTI5dGNHRnlaU2hwZEdWdExDQnpaWEYxWlc1alpWdHRhV1JkS1NBK1BTQXdLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHSmxaeUE5SUcxcFpEdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JsYm1RZ1BTQnRhV1FnTFNBeE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQmlaV2M3WEc0Z0lDQWdJQ0FnSUgxY2JseHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQmZhVzV6WlhKMEtIRXNJR1JoZEdFc0lIQnlhVzl5YVhSNUxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR05oYkd4aVlXTnJJQ0U5SUc1MWJHd2dKaVlnZEhsd1pXOW1JR05oYkd4aVlXTnJJQ0U5UFNCY0ltWjFibU4wYVc5dVhDSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwYUhKdmR5QnVaWGNnUlhKeWIzSW9YQ0owWVhOcklHTmhiR3hpWVdOcklHMTFjM1FnWW1VZ1lTQm1kVzVqZEdsdmJsd2lLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUhFdWMzUmhjblJsWkNBOUlIUnlkV1U3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvSVY5cGMwRnljbUY1S0dSaGRHRXBLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWkdGMFlTQTlJRnRrWVhSaFhUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJR2xtS0dSaGRHRXViR1Z1WjNSb0lEMDlQU0F3S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0x5OGdZMkZzYkNCa2NtRnBiaUJwYlcxbFpHbGhkR1ZzZVNCcFppQjBhR1Z5WlNCaGNtVWdibThnZEdGemEzTmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z1lYTjVibU11YzJWMFNXMXRaV1JwWVhSbEtHWjFibU4wYVc5dUtDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeExtUnlZV2x1S0NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0JmWVhKeVlYbEZZV05vS0dSaGRHRXNJR1oxYm1OMGFXOXVLSFJoYzJzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnYVhSbGJTQTlJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1pHRjBZVG9nZEdGemF5eGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY0hKcGIzSnBkSGs2SUhCeWFXOXlhWFI1TEZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF6b2dkSGx3Wlc5bUlHTmhiR3hpWVdOcklEMDlQU0FuWm5WdVkzUnBiMjRuSUQ4Z1kyRnNiR0poWTJzZ09pQnViMjl3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlR0Y2JseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIRXVkR0Z6YTNNdWMzQnNhV05sS0Y5aWFXNWhjbmxUWldGeVkyZ29jUzUwWVhOcmN5d2dhWFJsYlN3Z1gyTnZiWEJoY21WVVlYTnJjeWtnS3lBeExDQXdMQ0JwZEdWdEtUdGNibHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoeExuUmhjMnR6TG14bGJtZDBhQ0E5UFQwZ2NTNWpiMjVqZFhKeVpXNWplU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnhMbk5oZEhWeVlYUmxaQ2dwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCaGMzbHVZeTV6WlhSSmJXMWxaR2xoZEdVb2NTNXdjbTlqWlhOektUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUNBZ0lDQjlYRzVjYmlBZ0lDQWdJQ0FnTHk4Z1UzUmhjblFnZDJsMGFDQmhJRzV2Y20xaGJDQnhkV1YxWlZ4dUlDQWdJQ0FnSUNCMllYSWdjU0E5SUdGemVXNWpMbkYxWlhWbEtIZHZjbXRsY2l3Z1kyOXVZM1Z5Y21WdVkza3BPMXh1WEc0Z0lDQWdJQ0FnSUM4dklFOTJaWEp5YVdSbElIQjFjMmdnZEc4Z1lXTmpaWEIwSUhObFkyOXVaQ0J3WVhKaGJXVjBaWElnY21Wd2NtVnpaVzUwYVc1bklIQnlhVzl5YVhSNVhHNGdJQ0FnSUNBZ0lIRXVjSFZ6YUNBOUlHWjFibU4wYVc5dUlDaGtZWFJoTENCd2NtbHZjbWwwZVN3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUY5cGJuTmxjblFvY1N3Z1pHRjBZU3dnY0hKcGIzSnBkSGtzSUdOaGJHeGlZV05yS1R0Y2JpQWdJQ0FnSUNBZ2ZUdGNibHh1SUNBZ0lDQWdJQ0F2THlCU1pXMXZkbVVnZFc1emFHbG1kQ0JtZFc1amRHbHZibHh1SUNBZ0lDQWdJQ0JrWld4bGRHVWdjUzUxYm5Ob2FXWjBPMXh1WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJ4TzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JoYzNsdVl5NWpZWEpuYnlBOUlHWjFibU4wYVc5dUlDaDNiM0pyWlhJc0lIQmhlV3h2WVdRcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlGOXhkV1YxWlNoM2IzSnJaWElzSURFc0lIQmhlV3h2WVdRcE8xeHVJQ0FnSUgwN1hHNWNiaUFnSUNCbWRXNWpkR2x2YmlCZlkyOXVjMjlzWlY5bWJpaHVZVzFsS1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCZmNtVnpkRkJoY21GdEtHWjFibU4wYVc5dUlDaG1iaXdnWVhKbmN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1ptNHVZWEJ3Ykhrb2JuVnNiQ3dnWVhKbmN5NWpiMjVqWVhRb1cxOXlaWE4wVUdGeVlXMG9ablZ1WTNScGIyNGdLR1Z5Y2l3Z1lYSm5jeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaDBlWEJsYjJZZ1kyOXVjMjlzWlNBOVBUMGdKMjlpYW1WamRDY3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR1Z5Y2lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR052Ym5OdmJHVXVaWEp5YjNJcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqYjI1emIyeGxMbVZ5Y205eUtHVnljaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWld4elpTQnBaaUFvWTI5dWMyOXNaVnR1WVcxbFhTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdYMkZ5Y21GNVJXRmphQ2hoY21kekxDQm1kVzVqZEdsdmJpQW9lQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTnZibk52YkdWYmJtRnRaVjBvZUNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJSDBwWFNrcE8xeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQjlYRzRnSUNBZ1lYTjVibU11Ykc5bklEMGdYMk52Ym5OdmJHVmZabTRvSjJ4dlp5Y3BPMXh1SUNBZ0lHRnplVzVqTG1ScGNpQTlJRjlqYjI1emIyeGxYMlp1S0Nka2FYSW5LVHRjYmlBZ0lDQXZLbUZ6ZVc1akxtbHVabThnUFNCZlkyOXVjMjlzWlY5bWJpZ25hVzVtYnljcE8xeHVJQ0FnSUdGemVXNWpMbmRoY200Z1BTQmZZMjl1YzI5c1pWOW1iaWduZDJGeWJpY3BPMXh1SUNBZ0lHRnplVzVqTG1WeWNtOXlJRDBnWDJOdmJuTnZiR1ZmWm00b0oyVnljbTl5SnlrN0tpOWNibHh1SUNBZ0lHRnplVzVqTG0xbGJXOXBlbVVnUFNCbWRXNWpkR2x2YmlBb1ptNHNJR2hoYzJobGNpa2dlMXh1SUNBZ0lDQWdJQ0IyWVhJZ2JXVnRieUE5SUh0OU8xeHVJQ0FnSUNBZ0lDQjJZWElnY1hWbGRXVnpJRDBnZTMwN1hHNGdJQ0FnSUNBZ0lIWmhjaUJvWVhNZ1BTQlBZbXBsWTNRdWNISnZkRzkwZVhCbExtaGhjMDkzYmxCeWIzQmxjblI1TzF4dUlDQWdJQ0FnSUNCb1lYTm9aWElnUFNCb1lYTm9aWElnZkh3Z2FXUmxiblJwZEhrN1hHNGdJQ0FnSUNBZ0lIWmhjaUJ0WlcxdmFYcGxaQ0E5SUY5eVpYTjBVR0Z5WVcwb1puVnVZM1JwYjI0Z2JXVnRiMmw2WldRb1lYSm5jeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdOaGJHeGlZV05ySUQwZ1lYSm5jeTV3YjNBb0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQnJaWGtnUFNCb1lYTm9aWEl1WVhCd2JIa29iblZzYkN3Z1lYSm5jeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvYUdGekxtTmhiR3dvYldWdGJ5d2dhMlY1S1NrZ2V5QWdJRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR0Z6ZVc1akxuTmxkRWx0YldWa2FXRjBaU2htZFc1amRHbHZiaUFvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJMbUZ3Y0d4NUtHNTFiR3dzSUcxbGJXOWJhMlY1WFNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0JsYkhObElHbG1JQ2hvWVhNdVkyRnNiQ2h4ZFdWMVpYTXNJR3RsZVNrcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnhkV1YxWlhOYmEyVjVYUzV3ZFhOb0tHTmhiR3hpWVdOcktUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIRjFaWFZsYzF0clpYbGRJRDBnVzJOaGJHeGlZV05yWFR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCbWJpNWhjSEJzZVNodWRXeHNMQ0JoY21kekxtTnZibU5oZENoYlgzSmxjM1JRWVhKaGJTaG1kVzVqZEdsdmJpQW9ZWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J0WlcxdlcydGxlVjBnUFNCaGNtZHpPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMllYSWdjU0E5SUhGMVpYVmxjMXRyWlhsZE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JrWld4bGRHVWdjWFZsZFdWelcydGxlVjA3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHWnZjaUFvZG1GeUlHa2dQU0F3TENCc0lEMGdjUzVzWlc1bmRHZzdJR2tnUENCc095QnBLeXNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhGYmFWMHVZWEJ3Ykhrb2JuVnNiQ3dnWVhKbmN5azdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUtWMHBLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdJQ0FnSUcxbGJXOXBlbVZrTG0xbGJXOGdQU0J0Wlcxdk8xeHVJQ0FnSUNBZ0lDQnRaVzF2YVhwbFpDNTFibTFsYlc5cGVtVmtJRDBnWm00N1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCdFpXMXZhWHBsWkR0Y2JpQWdJQ0I5TzF4dVhHNGdJQ0FnWVhONWJtTXVkVzV0WlcxdmFYcGxJRDBnWm5WdVkzUnBiMjRnS0dadUtTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z0tHWnVMblZ1YldWdGIybDZaV1FnZkh3Z1ptNHBMbUZ3Y0d4NUtHNTFiR3dzSUdGeVozVnRaVzUwY3lrN1hHNGdJQ0FnSUNBZ0lIMDdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHWjFibU4wYVc5dUlGOTBhVzFsY3lodFlYQndaWElwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1SUNoamIzVnVkQ3dnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J0WVhCd1pYSW9YM0poYm1kbEtHTnZkVzUwS1N3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktUdGNiaUFnSUNBZ0lDQWdmVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQmhjM2x1WXk1MGFXMWxjeUE5SUY5MGFXMWxjeWhoYzNsdVl5NXRZWEFwTzF4dUlDQWdJR0Z6ZVc1akxuUnBiV1Z6VTJWeWFXVnpJRDBnWDNScGJXVnpLR0Z6ZVc1akxtMWhjRk5sY21sbGN5azdYRzRnSUNBZ1lYTjVibU11ZEdsdFpYTk1hVzFwZENBOUlHWjFibU4wYVc5dUlDaGpiM1Z1ZEN3Z2JHbHRhWFFzSUdsMFpYSmhkRzl5TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1lYTjVibU11YldGd1RHbHRhWFFvWDNKaGJtZGxLR052ZFc1MEtTd2diR2x0YVhRc0lHbDBaWEpoZEc5eUxDQmpZV3hzWW1GamF5azdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHRnplVzVqTG5ObGNTQTlJR1oxYm1OMGFXOXVJQ2d2S2lCbWRXNWpkR2x2Ym5NdUxpNGdLaThwSUh0Y2JpQWdJQ0FnSUNBZ2RtRnlJR1p1Y3lBOUlHRnlaM1Z0Wlc1MGN6dGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlGOXlaWE4wVUdGeVlXMG9ablZ1WTNScGIyNGdLR0Z5WjNNcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQjBhR0YwSUQwZ2RHaHBjenRjYmx4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdOaGJHeGlZV05ySUQwZ1lYSm5jMXRoY21kekxteGxibWQwYUNBdElERmRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLSFI1Y0dWdlppQmpZV3hzWW1GamF5QTlQU0FuWm5WdVkzUnBiMjRuS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1lYSm5jeTV3YjNBb0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNnUFNCdWIyOXdPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQWdJQ0FnSUNCaGMzbHVZeTV5WldSMVkyVW9abTV6TENCaGNtZHpMQ0JtZFc1amRHbHZiaUFvYm1WM1lYSm5jeXdnWm00c0lHTmlLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWm00dVlYQndiSGtvZEdoaGRDd2dibVYzWVhKbmN5NWpiMjVqWVhRb1cxOXlaWE4wVUdGeVlXMG9ablZ1WTNScGIyNGdLR1Z5Y2l3Z2JtVjRkR0Z5WjNNcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJJb1pYSnlMQ0J1WlhoMFlYSm5jeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlNsZEtTazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUxGeHVJQ0FnSUNBZ0lDQWdJQ0FnWm5WdVkzUnBiMjRnS0dWeWNpd2djbVZ6ZFd4MGN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJMbUZ3Y0d4NUtIUm9ZWFFzSUZ0bGNuSmRMbU52Ym1OaGRDaHlaWE4xYkhSektTazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNiaUFnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR0Z6ZVc1akxtTnZiWEJ2YzJVZ1BTQm1kVzVqZEdsdmJpQW9MeW9nWm5WdVkzUnBiMjV6TGk0dUlDb3ZLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJoYzNsdVl5NXpaWEV1WVhCd2JIa29iblZzYkN3Z1FYSnlZWGt1Y0hKdmRHOTBlWEJsTG5KbGRtVnljMlV1WTJGc2JDaGhjbWQxYldWdWRITXBLVHRjYmlBZ0lDQjlPMXh1WEc1Y2JpQWdJQ0JtZFc1amRHbHZiaUJmWVhCd2JIbEZZV05vS0dWaFkyaG1iaWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnWDNKbGMzUlFZWEpoYlNobWRXNWpkR2x2YmlobWJuTXNJR0Z5WjNNcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQm5ieUE5SUY5eVpYTjBVR0Z5WVcwb1puVnVZM1JwYjI0b1lYSm5jeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhaaGNpQjBhR0YwSUQwZ2RHaHBjenRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ1kyRnNiR0poWTJzZ1BTQmhjbWR6TG5CdmNDZ3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQmxZV05vWm00b1ptNXpMQ0JtZFc1amRHbHZiaUFvWm00c0lGOHNJR05pS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1p1TG1Gd2NHeDVLSFJvWVhRc0lHRnlaM011WTI5dVkyRjBLRnRqWWwwcEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlMRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR0Z5WjNNdWJHVnVaM1JvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdkdkxtRndjR3g1S0hSb2FYTXNJR0Z5WjNNcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdkdk8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCOUtUdGNiaUFnSUNCOVhHNWNiaUFnSUNCaGMzbHVZeTVoY0hCc2VVVmhZMmdnUFNCZllYQndiSGxGWVdOb0tHRnplVzVqTG1WaFkyaFBaaWs3WEc0Z0lDQWdZWE41Ym1NdVlYQndiSGxGWVdOb1UyVnlhV1Z6SUQwZ1gyRndjR3g1UldGamFDaGhjM2x1WXk1bFlXTm9UMlpUWlhKcFpYTXBPMXh1WEc1Y2JpQWdJQ0JoYzNsdVl5NW1iM0psZG1WeUlEMGdablZ1WTNScGIyNGdLR1p1TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQjJZWElnWkc5dVpTQTlJRzl1YkhsZmIyNWpaU2hqWVd4c1ltRmpheUI4ZkNCdWIyOXdLVHRjYmlBZ0lDQWdJQ0FnZG1GeUlIUmhjMnNnUFNCbGJuTjFjbVZCYzNsdVl5aG1iaWs3WEc0Z0lDQWdJQ0FnSUdaMWJtTjBhVzl1SUc1bGVIUW9aWEp5S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1pYSnlLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR1J2Ym1Vb1pYSnlLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUhSaGMyc29ibVY0ZENrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdibVY0ZENncE8xeHVJQ0FnSUgwN1hHNWNiaUFnSUNCbWRXNWpkR2x2YmlCbGJuTjFjbVZCYzNsdVl5aG1iaWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnWDNKbGMzUlFZWEpoYlNobWRXNWpkR2x2YmlBb1lYSm5jeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdOaGJHeGlZV05ySUQwZ1lYSm5jeTV3YjNBb0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdGeVozTXVjSFZ6YUNobWRXNWpkR2x2YmlBb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdsdWJtVnlRWEpuY3lBOUlHRnlaM1Z0Wlc1MGN6dGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvYzNsdVl5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCaGMzbHVZeTV6WlhSSmJXMWxaR2xoZEdVb1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc3VZWEJ3Ykhrb2JuVnNiQ3dnYVc1dVpYSkJjbWR6S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyRnNiR0poWTJzdVlYQndiSGtvYm5Wc2JDd2dhVzV1WlhKQmNtZHpLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJ6ZVc1aklEMGdkSEoxWlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJR1p1TG1Gd2NHeDVLSFJvYVhNc0lHRnlaM01wTzF4dUlDQWdJQ0FnSUNBZ0lDQWdjM2x1WXlBOUlHWmhiSE5sTzF4dUlDQWdJQ0FnSUNCOUtUdGNiaUFnSUNCOVhHNWNiaUFnSUNCaGMzbHVZeTVsYm5OMWNtVkJjM2x1WXlBOUlHVnVjM1Z5WlVGemVXNWpPMXh1WEc0Z0lDQWdZWE41Ym1NdVkyOXVjM1JoYm5RZ1BTQmZjbVZ6ZEZCaGNtRnRLR1oxYm1OMGFXOXVLSFpoYkhWbGN5a2dlMXh1SUNBZ0lDQWdJQ0IyWVhJZ1lYSm5jeUE5SUZ0dWRXeHNYUzVqYjI1allYUW9kbUZzZFdWektUdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHWjFibU4wYVc5dUlDaGpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdOaGJHeGlZV05yTG1Gd2NHeDVLSFJvYVhNc0lHRnlaM01wTzF4dUlDQWdJQ0FnSUNCOU8xeHVJQ0FnSUgwcE8xeHVYRzRnSUNBZ1lYTjVibU11ZDNKaGNGTjVibU1nUFZ4dUlDQWdJR0Z6ZVc1akxtRnplVzVqYVdaNUlEMGdablZ1WTNScGIyNGdZWE41Ym1OcFpua29ablZ1WXlrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1gzSmxjM1JRWVhKaGJTaG1kVzVqZEdsdmJpQW9ZWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHTmhiR3hpWVdOcklEMGdZWEpuY3k1d2IzQW9LVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJ5WlhOMWJIUTdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGNua2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsYzNWc2RDQTlJR1oxYm1NdVlYQndiSGtvZEdocGN5d2dZWEpuY3lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5SUdOaGRHTm9JQ2hsS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdOaGJHeGlZV05yS0dVcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdMeThnYVdZZ2NtVnpkV3gwSUdseklGQnliMjFwYzJVZ2IySnFaV04wWEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWDJselQySnFaV04wS0hKbGMzVnNkQ2tnSmlZZ2RIbHdaVzltSUhKbGMzVnNkQzUwYUdWdUlEMDlQU0JjSW1aMWJtTjBhVzl1WENJcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWE4xYkhRdWRHaGxiaWhtZFc1amRHbHZiaWgyWVd4MVpTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlodWRXeHNMQ0IyWVd4MVpTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2xiWENKallYUmphRndpWFNobWRXNWpkR2x2YmlobGNuSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyRnNiR0poWTJzb1pYSnlMbTFsYzNOaFoyVWdQeUJsY25JZ09pQnVaWGNnUlhKeWIzSW9aWEp5S1NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yS0c1MWJHd3NJSEpsYzNWc2RDazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lIMDdYRzVjYmlBZ0lDQXZMeUJPYjJSbExtcHpYRzRnSUNBZ2FXWWdLSFI1Y0dWdlppQnRiMlIxYkdVZ1BUMDlJQ2R2WW1wbFkzUW5JQ1ltSUcxdlpIVnNaUzVsZUhCdmNuUnpLU0I3WEc0Z0lDQWdJQ0FnSUcxdlpIVnNaUzVsZUhCdmNuUnpJRDBnWVhONWJtTTdYRzRnSUNBZ2ZWeHVJQ0FnSUM4dklFRk5SQ0F2SUZKbGNYVnBjbVZLVTF4dUlDQWdJR1ZzYzJVZ2FXWWdLSFI1Y0dWdlppQmtaV1pwYm1VZ1BUMDlJQ2RtZFc1amRHbHZiaWNnSmlZZ1pHVm1hVzVsTG1GdFpDa2dlMXh1SUNBZ0lDQWdJQ0JrWldacGJtVW9XMTBzSUdaMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJoYzNsdVl6dGNiaUFnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdmVnh1SUNBZ0lDOHZJR2x1WTJ4MVpHVmtJR1JwY21WamRHeDVJSFpwWVNBOGMyTnlhWEIwUGlCMFlXZGNiaUFnSUNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnY205dmRDNWhjM2x1WXlBOUlHRnplVzVqTzF4dUlDQWdJSDFjYmx4dWZTZ3BLVHRjYmlKZGZRPT0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcyA9IHtcblx0bG9nOiBmdW5jdGlvbiBsb2codGV4dCkge1xuXHRcdGNvbnNvbGUubG9nKHRleHQpO1xuXHR9LFxuXHRnZXQ6IGZ1bmN0aW9uIGdldCh1cmwsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG5cdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuXHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0dmFyIHJlc3BvbnNlID0geGhyLnJlc3BvbnNlID8gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpIDogbnVsbDtcblx0XHRcdFx0XHRjYWxsYmFjayh4aHIuc3RhdHVzLCByZXNwb25zZSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoeGhyLnN0YXR1cyA8IDUwMCkge1xuXHRcdFx0XHRcdGNhbGxiYWNrKHhoci5zdGF0dXMpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ2FqYXggZ2V0IGVycm9yJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHRcdHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuXHRcdHhoci5zZW5kKCk7XG5cdH0sXG5cdHBvc3Q6IGZ1bmN0aW9uIHBvc3QodXJsLCBkYXRhLCBjYWxsYmFjaykge1xuXHRcdHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuXHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgPT09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcblx0XHRcdFx0aWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuXHRcdFx0XHRcdHZhciByZXNwb25zZSA9IHhoci5yZXNwb25zZSA/IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKSA6IG51bGw7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeGhyLnN0YXR1cywgcmVzcG9uc2UpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHhoci5zdGF0dXMgPCA1MDApIHtcblx0XHRcdFx0XHRjYWxsYmFjayh4aHIuc3RhdHVzKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCdhamF4IHBvc3QgZXJyb3InKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0eGhyLm9wZW4oJ1BPU1QnLCB1cmwpO1xuXHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuXHRcdHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcblx0fSxcblx0Y29va2llOiBmdW5jdGlvbiBjb29raWUobmFtZSwgY29va2llcykge1xuXHRcdHZhciBjID0gdGhpcy5jb29raWVzKGNvb2tpZXMpO1xuXHRcdHJldHVybiBjW25hbWVdO1xuXHR9LFxuXHRjb29raWVzOiBmdW5jdGlvbiBjb29raWVzKF9jb29raWVzKSB7XG5cdFx0dmFyIG5hbWVWYWx1ZXMgPSBfY29va2llcy5zcGxpdCgnOyAnKTtcblx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0bmFtZVZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHR2YXIgaSA9IGl0ZW0uc3BsaXQoJz0nKTtcblx0XHRcdHJlc3VsdFtpWzBdXSA9IGlbMV07XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblx0Z2V0UXVlcnlWYWx1ZTogZnVuY3Rpb24gZ2V0UXVlcnlWYWx1ZShxdWVyeVN0cmluZywgbmFtZSkge1xuXHRcdHZhciBhcnIgPSBxdWVyeVN0cmluZy5tYXRjaChuZXcgUmVnRXhwKG5hbWUgKyAnPShbXiZdKyknKSk7XG5cblx0XHRpZiAoYXJyKSB7XG5cdFx0XHRyZXR1cm4gYXJyWzFdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cbn07XG5cbnZhciB0ZXN0cyA9IFt7XG5cdGlkOiAxLFxuXHR0ZXN0OiBmdW5jdGlvbiB0ZXN0KCkge1xuXHRcdHZhciBjb29raWVzID0ge1xuXHRcdFx0Y3NhdGk6ICdtYWpvbScsXG5cdFx0XHRvbmU6ICd0d28nXG5cdFx0fTtcblxuXHRcdHZhciByZXN1bHQgPSB0cnVlO1xuXG5cdFx0dmFyIGMgPSBjcy5jb29raWVzKCdjc2F0aT1tYWpvbTsgb25lPXR3bycpO1xuXG5cdFx0aWYgKGMuY3NhdGkgIT09IGNvb2tpZXMuY3NhdGkpIHJlc3VsdCA9IGZhbHNlO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxufSwge1xuXHRpZDogMixcblx0dGVzdDogZnVuY3Rpb24gdGVzdCgpIHtcblx0XHRyZXR1cm4gJ2JhcicgPT09IGNzLmNvb2tpZSgnZm9vJywgJ2Zvbz1iYXI7IHRlPW1ham9tJyk7XG5cdH1cbn0sIHtcblx0aWQ6IDMsXG5cdHRlc3Q6IGZ1bmN0aW9uIHRlc3QoKSB7XG5cdFx0cmV0dXJuICcxMjMnID09PSBjcy5nZXRRdWVyeVZhbHVlKCc/Y3NhdGk9bWFqb20mdXNlcl9pZD0xMjMmdmFsYW1pPXNlbW1pJywgJ3VzZXJfaWQnKTtcblx0fVxufV07XG5cbmlmIChmYWxzZSkge1xuXHR2YXIgcmVzdWx0ID0gdHJ1ZTtcblx0dGVzdHMuZm9yRWFjaChmdW5jdGlvbiAodGVzdCkge1xuXHRcdGlmICghdGVzdC50ZXN0KCkpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IodGVzdC5pZCArICcuIHRlc3QgZmFpbGVkJyk7XG5cdFx0XHRyZXN1bHQgPSBmYWxzZTtcblx0XHR9XG5cdH0pO1xuXHRpZiAocmVzdWx0KSB7XG5cdFx0Y29uc29sZS5sb2coJ0FsbCB0ZXN0cyBzdWNjZWVkZWQhJyk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjczsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBmb29kID0ge1xuXHRjbGllbnQ6IHtcblx0XHR0eXBlOiAnb2JqZWN0Jyxcblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRpZDogeyB0eXBlOiAnaW50ZWdlcicgfSxcblx0XHRcdG5hbWU6IHsgdHlwZTogJ3N0cmluZycsIG1pbkxlbmd0aDogMyB9LFxuXHRcdFx0ZGVzY3JpcHRpb246IHsgdHlwZTogJ3N0cmluZycsIG1pbkxlbmd0aDogMyB9LFxuXHRcdFx0Y2F0ZWdvcnk6IHsgdHlwZTogJ3N0cmluZycsIG1pbkxlbmd0aDogMSB9LFxuXHRcdFx0cGFsZW86IHsgdHlwZTogJ2ludGVnZXInLCBlcTogWzEsIDUsIDEwXSB9LFxuXHRcdFx0a2V0bzogeyB0eXBlOiAnaW50ZWdlcicsIGVxOiBbMSwgNSwgMTBdIH0sXG5cdFx0XHRlbmFibGVkOiB7IHR5cGU6ICdib29sZWFuJyB9XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgd2lzaCA9IHtcblx0Ymxhbms6IGZ1bmN0aW9uIGJsYW5rKHVzZXIpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dXNlcjogdXNlcixcblx0XHRcdHRpdGxlOiAnJyxcblx0XHRcdGRlc2NyaXB0aW9uOiAnJyxcblx0XHRcdGRpcnR5OiB0cnVlXG5cdFx0fTtcblx0fSxcblx0Y2xpZW50OiB7XG5cdFx0dHlwZTogJ29iamVjdCcsXG5cdFx0cHJvcGVydGllczoge1xuXHRcdFx0aWQ6IHsgdHlwZTogWydzdHJpbmcnLCAnbnVsbCddLCBvcHRpb25hbDogdHJ1ZSB9LFxuXHRcdFx0dGl0bGU6IHsgdHlwZTogJ3N0cmluZycgfSxcblx0XHRcdGRlc2NyaXB0aW9uOiB7IHR5cGU6ICdzdHJpbmcnIH0sXG5cdFx0XHR1c2VyOiB7XG5cdFx0XHRcdHR5cGU6ICdvYmplY3QnLFxuXHRcdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdFx0aWQ6IHsgdHB5ZTogJ3N0cmluZycgfSxcblx0XHRcdFx0XHRuYW1lOiB7IHR5cGU6ICdzdHJpbmcnIH1cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGRpcnR5OiB7IHR5cGU6ICdib29sZWFuJyB9XG5cdFx0fVxuXHR9LFxuXHRzZXJ2ZXI6IHtcblx0XHR0eXBlOiAnb2JqZWN0Jyxcblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRpZDogeyB0eXBlOiAnc3RyaW5nJyB9LFxuXHRcdFx0dGl0bGU6IHsgdHlwZTogJ3N0cmluZycgfSxcblx0XHRcdGRlc2NyaXB0aW9uOiB7IHR5cGU6ICdzdHJpbmcnIH0sXG5cdFx0XHR1c2VyOiB7XG5cdFx0XHRcdHR5cGU6ICdvYmplY3QnLFxuXHRcdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdFx0aWQ6IHsgdHB5ZTogJ3N0cmluZycgfSxcblx0XHRcdFx0XHRuYW1lOiB7IHR5cGU6ICdzdHJpbmcnIH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0Y2xpZW50VG9TZXJ2ZXI6IGZ1bmN0aW9uIGNsaWVudFRvU2VydmVyKG9iaikge1xuXHRcdHZhciB3aXNoID0ge1xuXHRcdFx0dXNlcjogb2JqLnVzZXIsXG5cdFx0XHRkZXNjcmlwdGlvbjogb2JqLmRlc2NyaXB0aW9uLFxuXHRcdFx0dGl0bGU6IG9iai50aXRsZVxuXHRcdH07XG5cdFx0aWYgKG9iai5pZCkgd2lzaC5pZCA9IG9iai5pZDtcblx0XHRyZXR1cm4gd2lzaDtcblx0fSxcblx0c2VydmVyVG9DbGllbnQ6IGZ1bmN0aW9uIHNlcnZlclRvQ2xpZW50KG9iaikge1xuXHRcdG9iai5kaXJ0eSA9IGZhbHNlO1xuXHRcdHJldHVybiBfLmNsb25lKG9iaik7XG5cdH1cbn07XG5cbnZhciB3aXNoTGlzdCA9IHtcblx0c2VydmVyOiB7XG5cdFx0dHlwZTogJ2FycmF5Jyxcblx0XHRpdGVtczoge1xuXHRcdFx0dHlwZTogJ29iamVjdCcsXG5cdFx0XHRwcm9wZXJ0aWVzOiB3aXNoLnNlcnZlci5wcm9wZXJ0aWVzXG5cdFx0fVxuXHR9XG59O1xuXG52YXIgdXNlciA9IHtcblx0Ymxhbms6IGZ1bmN0aW9uIGJsYW5rKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRpZDogbnVsbCxcblx0XHRcdG5hbWU6ICcnLFxuXHRcdFx0c3RhdHVzOiBiZWxsYS5jb25zdGFudHMudXNlclN0YXR1cy5HVUVTVFxuXHRcdH07XG5cdH0sXG5cdGNsaWVudDoge1xuXHRcdHR5cGU6ICdvYmplY3QnLFxuXHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdGlkOiB7IHR5cGU6IFsnc3RyaW5nJywgJ251bGwnXSwgb3B0aW9uYWw6IHRydWUgfSxcblx0XHRcdG5hbWU6IHsgdHlwZTogJ3N0cmluZycgfSxcblx0XHRcdHN0YXR1czogeyB0eXBlOiAnc3RyaW5nJywgZXE6IF8udmFsdWVzKGJlbGxhLmNvbnN0YW50cy51c2VyU3RhdHVzKSB9XG5cdFx0fVxuXHR9LFxuXHRzZXJ2ZXI6IHtcblx0XHR0eXBlOiAnb2JqZWN0Jyxcblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRpZDogeyB0eXBlOiAnc3RyaW5nJyB9LFxuXHRcdFx0bmFtZTogeyB0eXBlOiAnc3RyaW5nJyB9LFxuXHRcdFx0c3RhdHVzOiB7IHR5cGU6ICdzdHJpbmcnLCBlcTogXy52YWx1ZXMoYmVsbGEuY29uc3RhbnRzLnVzZXJTdGF0dXMpIH1cblx0XHR9XG5cdH0sXG5cdGNsaWVudFRvU2VydmVyOiBmdW5jdGlvbiBjbGllbnRUb1NlcnZlcihvYmopIHt9LFxuXHRzZXJ2ZXJUb0NsaWVudDogZnVuY3Rpb24gc2VydmVyVG9DbGllbnQob2JqKSB7fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHdpc2g6IHdpc2gsXG5cdHdpc2hMaXN0OiB3aXNoTGlzdCxcblx0dXNlcjogdXNlcixcblx0Zm9vZDogZm9vZFxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcyA9IHJlcXVpcmUoJy4vaGVscGVycy9jcycpO1xudmFyIGluc3BlY3RvciA9IHJlcXVpcmUoJ3NjaGVtYS1pbnNwZWN0b3InKTtcbnZhciBzY2hlbWFzID0gcmVxdWlyZSgnLi9zY2hlbWFzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHR3aXNoOiB7XG5cdFx0Z2V0OiBmdW5jdGlvbiBnZXQoaWQsIGNhbGxiYWNrKSB7XG5cdFx0XHRjcy5nZXQoJy93aXNoP2lkPScgKyBpZCwgZnVuY3Rpb24gKHN0YXR1cywgd2lzaCkge1xuXHRcdFx0XHRpZiAoc3RhdHVzID09PSBiZWxsYS5jb25zdGFudHMucmVzcG9uc2UuT0spIHtcblx0XHRcdFx0XHR2YXIgdmFsaWRhdGlvbiA9IGluc3BlY3Rvci52YWxpZGF0ZShzY2hlbWFzLndpc2guc2VydmVyLCB3aXNoKTtcblx0XHRcdFx0XHRpZiAoIXZhbGlkYXRpb24udmFsaWQpIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ3dpc2ggdmFsaWRhdGlvbiBlcnJvcicsIHZhbGlkYXRpb24uZm9ybWF0KCkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYWxsYmFjayh7IHN1Y2Nlc3M6IHRydWUgfSwgc2NoZW1hcy53aXNoLnNlcnZlclRvQ2xpZW50KHdpc2gpKTtcblx0XHRcdFx0fSBlbHNlIGlmIChzdGF0dXMgPT09IGJlbGxhLmNvbnN0YW50cy5yZXNwb25zZS5OT1RfRk9VTkQpIHtcblx0XHRcdFx0XHRjYWxsYmFjayh7IHN1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiAnV2lzaCBub3QgZm91bmQnIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdHBvc3Q6IGZ1bmN0aW9uIHBvc3Qod2lzaCwgY2FsbGJhY2spIHtcblx0XHRcdHZhciB2YWxpZGF0aW9uID0gaW5zcGVjdG9yLnZhbGlkYXRlKHNjaGVtYXMud2lzaC5jbGllbnQsIHdpc2gpO1xuXHRcdFx0aWYgKHZhbGlkYXRpb24udmFsaWQpIHtcblx0XHRcdFx0Y3MucG9zdCgnL3dpc2gnLCBzY2hlbWFzLndpc2guY2xpZW50VG9TZXJ2ZXIod2lzaCksIGZ1bmN0aW9uIChzdGF0dXMpIHtcblx0XHRcdFx0XHRpZiAoc3RhdHVzID09PSBiZWxsYS5jb25zdGFudHMucmVzcG9uc2UuT0spIGNhbGxiYWNrKHsgc3VjY2VzczogdHJ1ZSB9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHR3aXNoTGlzdDoge1xuXHRcdGdldDogZnVuY3Rpb24gZ2V0KGNhbGxiYWNrKSB7XG5cdFx0XHRjcy5nZXQoJy93aXNoTGlzdCcsIGZ1bmN0aW9uIChzdGF0dXMsIHdpc2hMaXN0KSB7XG5cdFx0XHRcdGlmIChzdGF0dXMgPT09IGJlbGxhLmNvbnN0YW50cy5yZXNwb25zZS5PSykge1xuXHRcdFx0XHRcdHZhciB2YWxpZGF0aW9uID0gaW5zcGVjdG9yLnZhbGlkYXRlKHNjaGVtYXMud2lzaExpc3Quc2VydmVyLCB3aXNoTGlzdCk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ3ZhaWxkYXRpb24nLCB2YWxpZGF0aW9uKTtcblx0XHRcdFx0XHRpZiAoIXZhbGlkYXRpb24udmFsaWQpIGNvbnNvbGUuZXJyb3IoJ3dpc2hMaXN0IHNlcnZlciB2YWxpZGF0aW9uIGVycm9yJyk7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeyBzdWNjZXNzOiB0cnVlIH0sIHdpc2hMaXN0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCd3aXNoTGlzdCBhamF4IGVycm9yJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblx0dXNlclN0YXR1czoge1xuXHRcdGdldDogZnVuY3Rpb24gZ2V0KGNhbGxiYWNrKSB7XG5cdFx0XHRjcy5nZXQoJy91c2VyU3RhdHVzJywgZnVuY3Rpb24gKHN0YXR1cywgdXNlclN0YXR1cykge1xuXHRcdFx0XHRpZiAoc3RhdHVzID09PSBiZWxsYS5jb25zdGFudHMucmVzcG9uc2UuT0spIHtcblx0XHRcdFx0XHRjYWxsYmFjayh7IHN1Y2Nlc3M6IHRydWUgfSwgdXNlclN0YXR1cyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblx0bG9naW46IGZ1bmN0aW9uIGxvZ2luKGxvZ2luRGF0YSwgY2FsbGJhY2spIHtcblx0XHRjcy5wb3N0KCcvbG9naW4nLCBsb2dpbkRhdGEsIGZ1bmN0aW9uIChzdGF0dXMsIHVzZXIpIHtcblx0XHRcdGlmIChzdGF0dXMgPT09IGJlbGxhLmNvbnN0YW50cy5yZXNwb25zZS5PSykge1xuXHRcdFx0XHRjYWxsYmFjayh7IHN1Y2Nlc3M6IHRydWUgfSwgdXNlcik7XG5cdFx0XHR9IGVsc2UgaWYgKHN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnJlc3BvbnNlLk5PVF9GT1VORCkge1xuXHRcdFx0XHRjYWxsYmFjayh7IHN1Y2Nlc3M6IGZhbHNlIH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHRsb2dvdXQ6IGZ1bmN0aW9uIGxvZ291dChjYWxsYmFjaykge1xuXHRcdGNzLmdldCgnbG9nb3V0JywgZnVuY3Rpb24gKHN0YXR1cykge1xuXHRcdFx0aWYgKHN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnJlc3BvbnNlLk9LKSB7XG5cdFx0XHRcdGNhbGxiYWNrKHsgc3VjY2VzczogdHJ1ZSB9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0Zm9vZDoge1xuXHRcdGdldDogZnVuY3Rpb24gZ2V0KGNhdGVnb3J5SWQsIGNhbGxiYWNrKSB7XG5cdFx0XHRjcy5nZXQoJy9mb29kcy8nICsgY2F0ZWdvcnlJZCwgZnVuY3Rpb24gKHN0YXR1cywgZm9vZHMpIHt9KTtcblx0XHR9LFxuXHRcdHBvc3Q6IGZ1bmN0aW9uIHBvc3QoZm9vZCwgY2FsbGJhY2spIHtcblx0XHRcdHZhciB2YWxpZGF0aW9uID0gaW5zcGVjdG9yLnZhbGlkYXRlKHNjaGVtYXMuZm9vZC5jbGllbnQsIGZvb2QpO1xuXG5cdFx0XHRpZiAodmFsaWRhdGlvbi52YWxpZCkge1xuXHRcdFx0XHRjcy5wb3N0KCcvZm9vZCcsIGZvb2QsIGZ1bmN0aW9uIChzdGF0dXMsIGZvb2QpIHtcblx0XHRcdFx0XHRpZiAoc3RhdHVzID09PSBiZWxsYS5jb25zdGFudHMucmVzcG9uc2UuT0spIHtcblx0XHRcdFx0XHRcdGNhbGxiYWNrKHRydWUsIG51bGwsIGZvb2QpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjYWxsYmFjayhmYWxzZSwgW3sgcHJvcGVydHk6ICdzZXJ2ZXInLCBtZXNzYWdlOiAnZXJyb3InIH1dKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y2FsbGJhY2sodmFsaWRhdGlvbi52YWxpZCwgdmFsaWRhdGlvbi5lcnJvcik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59OyJdfQ==
